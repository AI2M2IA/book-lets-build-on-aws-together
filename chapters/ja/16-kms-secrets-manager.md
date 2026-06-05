# 第16章: キー、ロック、および秘密

レオはGitの履歴をレビューしていたところ、それを発見しました。データベースのパスワード。6か月前に、もはやニムバスに勤務していない人物によって、平文でコミットされました。そのコミットは公開されていました。パスワードはその後変更されていましたが、彼らはそれが確実であるとは知りませんでした。その資格情報が触れたすべてのシステムを調べました。4時間かかりました。それがニムバスがコードに秘密を置くのをやめる決意をした日でした。

**2つの問題: 秘密の保存とデータの暗号化**

機密情報を取り扱う際のセキュリティには、2つの明確な問題があります。

**資格情報の保存** (データベースのパスワード、APIキー、接続文字列): これらの情報はどこにありますか？誰がアクセスできますか？再デプロイせずにローテーションするにはどうすればよいですか？

**データの暗号化** (顧客情報、決済記録、PII): データベースやS3バケットに不正アクセスしたとしても、データが読み取れないように、どのように保証すればよいですか？

AWSは、それぞれの問題に専用のサービスを提供しています。

- **AWS Secrets Manager**: 資格情報を安全に保存および管理
- **AWS KMS (Key Management Service)**: データを暗号化および復号化するための暗号化キーを管理

**AWS Secrets Manager: もうハードコードされた資格情報は不要**

Secrets Managerは、秘密の安全な保管場所です。データベースの資格情報、APIキー、OAuthトークン、SSHキー、またはその他の機密情報など、あらゆるものを保存できます。

アプリケーションが環境変数や設定ファイルからパスワードを読み取るのではなく、起動時（または必要に応じて）Secrets Manager APIを呼び出して秘密情報を取得します。秘密情報はディスクに触れず、コードに表示されません。環境変数にも存在しません。

以下は、その流れのようです。

**古いやり方**:
```

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

**Secrets Manager の方法:**

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']

The EC2 instance needs an IAM role with permission to call `secretsmanager:GetSecretValue` for that specific secret. No other service can read it. The secret is never in the code.

**Automatic Rotation: The Real Power**

The greatest feature of Secrets Manager isn't storing secrets — it’s rotating them automatically.

Here's the scenario: every 30 days, Secrets Manager generates a new database password, updates it in RDS, updates the stored secret, and your application retrieves the new password the next time it needs it. No manual intervention. No deployment. No “I need to remember to rotate this.”

The rotation is implemented as a Lambda function. AWS provides templates for RDS databases (MySQL, PostgreSQL, Aurora). You can customize the function for any credential type.

Tom had a question about cost. (Of course he did.)

Secrets Manager charges per secret per month plus per API call. For a small number of database passwords and API keys, the cost is dollars per month — negligible compared to the cost of an incident.

“The compromise last week,” Priya said, “what would it have cost to investigate and remediate?”

Tom was quiet for a moment. “Including my time, your time, Leo’s weekend... couple thousand dollars.”

“Secrets Manager would have caught the static key before it was exploited. And it would have rotated it automatically.”

Tom pulled up the pricing page.

**AWS KMS: The Lock Factory**

AWS KMS (Key Management Service) manages **cryptographic keys** — the secret values used to encrypt and decrypt data.

The analogy: KMS is like a lockbox company that holds the master key. Your data (the contents of the box) is encrypted. Only someone with permission to use the KMS key can decrypt it. KMS logs every use of every key in CloudTrail.

**Customer Master Keys (CMKs)** — now called KMS keys — come in two types:

**AWS managed keys**: AWS creates and manages the key automatically for services like S3, EBS, RDS. You don’t control the key directly, but you can see it’s being used. Free.

**Customer managed keys**: You create the key in KMS and control every aspect of it: who can use it, when it rotates, who can administer it. You can enable automatic annual rotation. Cost: $1/month per key plus per-API-call charges.

**Encryption in AWS Services: KMS Integration**

Most AWS services integrate with KMS for encryption:

**S3**: Enable “server-side encryption with KMS” on a bucket. Every object is encrypted at rest with a KMS key. Reading an object requires permission to both the S3 bucket *and* the KMS key.

**RDS**: Enable encryption at creation time. The database storage, backups, and snapshots are all encrypted with a KMS key. Note: encryption cannot be enabled on an existing unencrypted RDS instance — you must snapshot, copy the snapshot with encryption enabled, and restore.

**EBS**: Encrypt volumes with KMS. New volumes created from encrypted snapshots are automatically encrypted.

**DynamoDB**: Encryption at rest using KMS is enabled by default on all tables.

**ElastiCache Redis**: Encryption at rest with KMS for sensitive cached data.

The principle: data should be encrypted at rest (stored on disk) and in transit (moving across a network). KMS handles at-rest encryption. TLS/SSL (provided automatically by AWS services) handles in-transit encryption.

**Envelope Encryption: How KMS Actually Works**

Here's a detail that helps you understand KMS behavior and exam questions.

KMS does not encrypt your data directly in most cases. It uses **envelope encryption**:

1. KMS generates a **data key** (a unique symmetric key)
2. The service uses the data key to encrypt your data locally (fast — symmetric encryption)
3. The service asks KMS to encrypt the data key itself (using your KMS key)
4. Both the encrypted data and the encrypted data key are stored
5. Your actual data never leaves the service — only the data key goes to KMS for encryption/decryption

When you read the data:

1. The service asks KMS to decrypt the data key
2. KMS checks permissions, decrypts the data key, returns it
3. The service uses the decrypted data key to decrypt your data locally

This means KMS can handle very large data without sending it all through the KMS API. Only small keys go to KMS. CloudTrail logs every KMS API call — every encrypt and decrypt operation.

**Secrets Manager vs Parameter Store**

AWS also has **Systems Manager Parameter Store**, which stores configuration values (not just secrets). Parameter Store is cheaper — free for standard parameters. It can also store encrypted parameters using KMS.

For secrets that need rotation: Secrets Manager.

For configuration values and non-sensitive parameters: Parameter Store (free tier is very generous).

For application configuration (port numbers, feature flags, environment-specific settings): Parameter Store.

## Strengths and Limitations

**AWS Secrets Manager**:

- コードの変更なしでの自動シークレットローテーション
- シークレットごとに詳細なIAMアクセス制御
- バージョニング（ローテーション中に以前のバージョンへのアクセス）
- CloudTrailによる監査
- コスト：シークレットあたり月あたり約0.40ドル + API呼び出し

**AWS KMS**:

- フル監査トレイルを持つ集中型キー管理
- 顧客管理キーの年間自動キーローテーション
- キーごとに詳細なIAM権限（キーポリシー+IAMポリシー）
- HSM（ハードウェアセキュリティモジュール）バックされた—キーはHSMから決して離れない
- コスト：キーあたり月あたり1ドル + 10,000件のAPI呼び出しあたり0.03ドル

**複雑になる点**:

- KMSキーポリシーは（および）IAMポリシーと並行して評価されるため、分離されている—デバッグが混乱する可能性がある
- RDSインスタンスをインプレースで暗号化することは計画する必要がある—既存の暗号化されていないRDSインスタンスを暗号化することはできない
- KMSキーの削除には7〜30日間の待機期間がある（安全メカニズム—失われたキーは失われたデータを意味する）
- Secrets Managerのコストは、シークレット数とAPI呼び出し数でスケールする

## 概要

- コード、環境変数、バージョン管理にコミットされた構成ファイルにクレデンシャルを保存しないでください。
- **Secrets Manager** はクレデンシャルを安全に保存し、自動的にローテーションします。アプリケーションはAPIを介してシークレットを取得します。
- **KMS** は暗号化キーを管理します。ほとんどのAWSサービスは、暗号化をRESTで利用するためにKMSと統合されています。
- **RESTでの暗号化**（ディスク上のデータ）は、AWSまたはあなたによって管理されるKMSキーを使用します。**転送中の暗号化**は、TLSを使用します。
- **エンベロープ暗号化**: KMSはキーを暗号化し、データを直接暗号化しません。サービスは、ローカルデータキーを使用してデータを暗号化します。
- **顧客管理KMSキー**: ローテーション、アクセス、監査に対する完全な制御。**AWS管理キー**: 自動で、設定は不要です。
- **Parameter Store** は、機密性の低い構成値に対してSecrets Managerの軽量代替手段です。

## 試験のヒント

*SAA-C03 ドメイン：安全なアーキテクチャの設計（ドメイン1、タスク1.3）*

- **Secrets Manager vs SSM Parameter Store**: 自動ローテーションが必要なクレデンシャル用。一般的な構成値用。試験ではローテーション要件とコスト感度で区別されます。
- **KMSキーポリシー**: KMSキーには独自のキーポリシー（リソースベースのポリシー）があります—IAMポリシーだけがKMSキーへのアクセスを許可しません—キーポリシーは明示的に許可する必要があります。
- **RDSの暗号化**: 既存の暗号化されていないRDSインスタンスに暗号化を有効にすることはできません。プロセス：スナップショットを作成→暗号化されたスナップショットでスナップショットをコピー→暗号化されたスナップショットから復元→新しいインスタンスにトラフィックを移行
- **EBSの暗号化**: 新しいボリュームは暗号化できます。暗号化されたボリュームのスナップショットは常に暗号化されます。暗号化されていないボリュームは直接暗号化できません—スナップショット+コピー+復元
- **CloudTrail + KMS**: すべてのKMS API呼び出しはCloudTrailでログ記録されます。これは重要なコンプライアンス機能です。
- **マルチリージョンKMSキー**: 解読のためにクロスリージョンAPI呼び出しなしでキーの材料を複数のリージョンに複製します。試験ではこのマルチリージョン災害復旧における暗号化されたデータの利用を想定しています。
- **KMS vs CloudHSM**: KMSはマルチテナント（AWSによって管理されます）。CloudHSMは、あなただけが制御できる専用ハードウェアセキュリティモジュールです。試験の示唆：「FIPS 140-2 レベル3」、「専用HSM」、「顧客管理の暗号化操作」→CloudHSM

## 練習問題

**Exercise 1 — 記憶**

エンベロープ暗号化の概念を説明してください。なぜKMSは、アプリケーションデータを直接暗号化するのではなく、小さなデータキーを暗号化する必要がありますか？

*(ヒント：1GBのデータを暗号化する場合と、1GBのデータをリモートKMSサービスに送信するパフォーマンスへの影響について考えてください。)*

**Exercise 2 — 試験練習**

*シナリオ*: 顧客の機密データをMySQL RDSデータベースに保存する金融サービス会社があります。新しいコンプライアンス要件により、次のことが義務付けられています。

1. すべてのデータはRESTで暗号化されている必要があります。
2. すべての暗号化キーの使用は監査可能です。
3. 暗号化キーはAWSによって管理されるべきではありません。
4. データベースのパスワードは90日ごとに自動的にローテーションする必要があります。

データベースは暗号化されていない状態で6か月前に作成されました。これらの要件を満たす最適なアクションセットはどれですか？

A) 既存のデータベースにRDS暗号化を有効にし、顧客管理KMSキーを作成し、90日間のローテーションを設定します。
B) 既存のデータベースのスナップショットを作成し、暗号化されたスナップショットでスナップショットをコピーし、復元し、90日間のローテーションを設定します。
C) AWS管理キーを使用して新しい暗号化されたRDSインスタンスを作成し、データを古いインスタンスから移行し、90日間のローテーションを設定します。
D) AWS管理キーを使用して既存のデータベースにRESTでの暗号化を有効にし、90日間のローテーションを設定します。

**ヒント1**: 既存の暗号化されていないRDSインスタンスに直接暗号化を有効にすることはできません。

**ヒント2**: 「顧客管理」キーとは、AWS管理キーではなく、顧客管理KMSキーのことです。

**ヒント3**: スナップショットコピープロセスは、暗号化されたRDSへの標準的な移行パスです。

**答え**: B

**説明**: RDSの暗号化は既存のインスタンスには有効化できません。標準的なアプローチは以下のとおりです：既存のインスタンスのスナップショットを作成 → 顧客管理のKMSキーを使用して暗号化を有効にしたスナップショットをコピーする（要件1、2、3を満たす）→ 暗号化されたスナップショットからの復元。顧客管理のKMSキーはCloudTrailですべての使用状況を自動的にログに記録し（監査）、暗号化キーをあなたの管理下に置きます。Secrets Managerは自動90日パスワードローテーションを処理します（要件4を満たす）。

**なぜAではないのか？** 既存の暗号化されていないRDSインスタンスをインプレースで暗号化することはできません。

**なぜCではないのか？** AWS管理キーは「顧客管理」要件（要件3）を満たしません。

**なぜDではないのか？** Aと同様の問題（インプレースでの有効化不可）に加え、AWS管理キーも要件3を満たしません。

*SAA-C03 ドメイン：安全なアーキテクチャの設計 — タスク1.3*

**演習3 — アーキテクチャチャレンジ** *(オプション)*

Nimbusは、以下の機密データを保存する必要があります：

- 運用中のRDSインスタンスのデータベースパスワード
- Stripe APIシークレットキー（決済処理に使用）
- DynamoDBで顧客注文履歴を暗号化するための対称暗号化キー
- レストランごとの設定値（APIエンドポイント、機能フラグ—機密情報ではない）

各データに対して、どのAWSサービスまたはアプローチを使用しますか？各データに対してどのようなローテーション戦略を適用しますか？

*(正解は唯一ではありません。目的は、セキュリティツールをユースケースに一致させる練習です。）*

## エンドクレジット後のシーン

機密情報は移行されました。

データベースパスワード：Secrets Manager、30日ごとにローテーション。

APIキー：Secrets Manager、支払いプロバイダーのAPIを呼び出して新しいキーを生成するLambdaを使用して、ローテーション。

顧客注文データ：顧客管理のKMSキーを使用して暗号化。

古い認証情報：無効化。古い設定ファイル：削除。古いGitHub Actionsシークレット：削除。

「これで監査準備完了です」プリヤは言いました。

「監査準備完了とは何か？」マイヤは言いました。

「もしコンプライアンス監査人が、コードにハードコーディングされたクレデンシャルやインフラストラクチャに公開されたクレデンシャルがないことを証明するように求められた場合、以下のことを示すことができます：すべての秘密はSecrets Managerにあり、すべての暗号化キーはKMSにあり、すべてのアクセスはCloudTrailでログ記録されています。」

「CloudTrailのログは最後に誰が確認したか？」

沈黙。

「私は毎週確認しています」プリヤは言いました。

「そして、もし何か異常なことが現れたら、どのように知るのですか？」

「それ」プリヤはノートパソコンを閉じた。「それが次の会話です。」

次の章では：Nimbusとインターネットの間に立つ3層の防御について。
