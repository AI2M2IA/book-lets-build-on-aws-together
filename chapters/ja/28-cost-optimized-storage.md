# 第28章：ストレージ請求のサプライズ

トムはEC2用の省費計画を提出した。次の行が請求書に記載されていたのはS3で、月額198ドル（第23章のライフサイクルポリシー変更後の847ドルから減少）。

次に、EBSを調べた。月額440ドル。

「これは高すぎる」とトムは言った。

レオはEBSボリュームのリストを呼び起こした。インスタンスに接続されているEBSボリュームが47個あり、さらに23個のボリュームがインスタンスに接続されていなかった。

「これらの23個のボリュームは何ですか？」とトムは言った。

レオはそのボリュームを調べた。すべてが切断されており、現在インスタンスで使用されてはいなかった。ほとんどはデバッグのためにスナップショットから作成されたもので、一部は終了したインスタンスのボリュームで、削除されていなかった。

「誰も読まないストレージに対して、GBあたり0.10ドルずつ支払っているのですね」とレオは言った。

トムは合計額を見た。未接続のボリュームが2.3TBだった。

「誰も使っていないストレージに対して、月額230ドル支払っているのですね」とトムは言った。「これはいつから続いていますか？」

レオは作成日を確認した。最も古いボリュームは16か月前のものであった。

「3680ドル」とトムは静かに言った。「誰もアクセスしていないストレージに対して、3600ドルも費やしています。」

彼は未接続のボリュームを削除した。その次の月、EBSの請求額は210ドルに減少した。

**ストレージコスト監査**

トムのEBS発見は、より広範なパターンを示すものであった：ストレージコストは目立たない形で蓄積される。コンピューティング（47台のサーバーが稼働していることを認識するのと同様）とは異なり、ストレージは静かに積み立てられる。

それは、ストレージユニットのレンタルを想像してみてください。1つのユニットをレンタルすることは、クレジットカードの明細に明らかです。しかし、プロジェクトのために2番目のユニット、古い家具のために3番目のユニットをレンタルし、戻って中身を確認しない場合、料金は毎月、あなたが忘れてしまっている後でも、静かに発生し続けます。クラウドストレージも同様に機能します。バイトはそこに残り、請求書が届き、誰もそれが完全に不要なものに満たされているまで疑問を抱かないままです。

徹底的なストレージコスト監査では、以下の点を確認します。

**S3:**

- バケットにはライフサイクルポリシーがすべて適用されていますか？
- RDS、EBSのスナップショットがS3に存在していませんか？
- 不確実なアクセスパターンを持つバケットには、インテリジェント・ティアリングが適切に設定されていますか？
- アクセスされない複数のコピーを作成するバージョン化オブジェクトが存在しますか？

**EBS:**

- 未接続のボリューム（使用しているインスタンスがないボリューム）はありますか？
- gp3ボリュームは適切に構成されていますか？（デフォルトのgp3ボリュームは、必要のない過剰な帯域幅/IOPSが割り当てられている場合があります）
- 必要なよりも古いスナップショットが保持されていることはありませんか？

**RDS:**

- 自動バックアップの保持期間は適切に設定されていますか？（長ければ長いほど、ストレージコストは高くなります）
- 古いインスタンスからの手動スナップショットがまだ存在しますか？
- データベースの移行からの読み取りレプリカがまだ実行されていますか？

**EFS:**

- EFSボリュームは適切なストレージクラスにありますか？（標準と不頻繁なアクセス）

**S3のバージョン化：隠れたコスト**

第5章で、S3のバージョン化がオブジェクトのすべての以前のバージョンを保持することを説明しました。これは安全性に優れています。ライフサイクルルールがない場合、コストが悪化します。

バージョン化がバケットで有効になっている場合、オブジェクトを上書きするたびに、以前のバージョンが保持されます。時間の経過とともに：

- 1日目：画像がアップロードされる（v1）
- 30日目：画像が更新される（v1は「非現在の」バージョンになり、v2が現在のバージョンになる）
- 60日目：画像が再度更新される（v1とv2が非現在のバージョンになり、v3が現在のバージョンになる）
- 365日目：v1からv12まですべて保存される。画像に対して12個のコピーに対して支払っていることになります。

解決策は、非現在のバージョンに対するライフサイクルルールです。

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

トムはこれらのルールをすべてのバージョン化されたバケットに適用しました。 その次の月、S3のストレージは18%減少しました。

**EBS: ボリュームの最適化とgp3へのアップグレード**

EBSボリュームの価格体系は、以下の2つの要素で構成されています。

1.  ストレージ（GBあたり月額）
2.  Provisioned IOPSと帯域幅（io1/io2を使用している場合、またはgp3の追加パフォーマンスに対して料金を支払っている場合）

**gp3の機会**: 第6章で述べたように、gp3は現在のデフォルトであり、gp2よりも安価です。 Nimbusがgp3が利用可能になる（2020年12月にローンチ）前にボリュームを作成した場合、それらのボリュームはまだgp2である可能性があります。

トムは、合計1,200GBの12個のgp2ボリュームを見つけました。 これらのボリュームをgp3に移行したことで、すぐに20%のコスト削減を実現し、パフォーマンスは低下しませんでした。

**IOPSと帯域幅**: gp3ボリュームは、追加料金なしで、デフォルトで3,000 IOPSと125 MB/sの帯域幅が提供されます。 必要に応じて、より多くのパフォーマンスをプロビジョニングできます。 プロビジョニングされたパフォーマンスが実際に利用されているかどうかを確認してください。

トムは、10,000 IOPSのプロビジョニングされたIOPSを持つ2つのgp3ボリュームを見つけました。彼はCloudWatchのメトリクスを確認しました。 実際の平均IOPSは1,200でした。 彼はプロビジョニングされたIOPSを4,000に削減しました（実際のピークを上回る安全マージン）。

月額節約額：$68

**スナップショットライフサイクル**: EBSスナップショットはインクリメンタル（前のスナップショットからの変更のみを保存します）ですが、蓄積されます。 Nimbusの初期の頃のスナップショットはまだ存在していました。トムは、1日のスナップショットを30日間保持し、残りを削除しました。

**EFS: ストレージクラス**

Amazon EFSには、独自のストレージクラスがあります。

-   **EFS Standard**: 頻繁にアクセスされるファイル向け。コストは高めです。
-   **EFS Infrequent Access (IA)**: 30日間アクセスされていないファイル向け。Standardの92%よりも安価です。
-   **EFS Archive**: 90日間アクセスされていないファイル向け。IAよりもさらに安価です。

**EFS Intelligent-Tiering**: アクセスパターンに基づいて、ストレージクラス間でファイルを自動的に移動します。

トムはEFSボリュームにIntelligent-Tieringを有効にしました。6週間後、ファイルの68%がInfrequent Accessに移動しました。EFSの月額コストは、$89から$31に減少しました。

**S3コスト配分タグ: 誰が何を使っているかを見つける**

Nimbusが成長するにつれて、複数のチームがS3にデータを保存していました。アナリティクスのチームは独自のバケットを持っていました。エンジニアリングチームは独自のバケットを持っていました。レストランのデータチームは独自のバケットを持っていました。

請求書には「S3: $198」とだけ表示されていました。チームごとに分解されていませんでした。

**コスト配分タグ**を使用すると、AWSリソースにビジネスメタデータ（チーム、プロジェクト、環境）をタグ付けし、AWS Cost Explorerでこれらのタグでコストを分解して確認できます。

トムは、すべてのS3バケットにタグを追加しました。
```

```
Team: analytics
Environment: production
Project: nimbus-core

After a billing cycle with tagging, he could see: "The analytics team's data lake is $74/month. Engineering backups are $43/month. Restaurant data is $81/month."

Now he could have budget conversations with each team instead of just looking at an aggregate number.

**AWS Cost Explorer and AWS Budgets**

**AWS Cost Explorer**: 履歴と予測されたコストをサービス、地域、タグ、および使用タイプ別に視覚化します。お金の流れを理解するために不可欠です。

**AWS Budgets**: コストが（または予測される）閾値を超えた場合にアラートを設定します。サービス、地域、タグ、またはアカウント別に予算を設定できます。

トムは3つの予算を設定しました：

1.  総月額請求額：予算額の90%にアラートを設定
2.  EC2 On-Demand: On-Demand の費用が月1,500ドルを超えるとアラート（Savings Plan のギャップを知らせる）
3.  データ転送アウト: 月200ドルでアラート（データ転送コストは予期せず急増する可能性がある）

BudgetsはSlackチャンネルにアラートを送信しました。チームは請求書で発見するのではなく、制限に近づいているときに気づくことができました。

**The Cost of Neglect**

トムはスプレッドシートを作成しました。彼はNimbusが以下の費用を費やしたことを計算しました：

-   未割り当てのEBSボリューム（16か月）：3,680ドル
-   古いS3スナップショット（発見して削除）：890ドル
-   不要なプロビジョンドIOPS：816ドル
-   gp2からgp3への移行による節約（プロジェクト、より早い段階で実施した場合）：18か月で2,160ドル
-   非現在のS3バージョンが蓄積：1,340ドル

特定された無駄の合計：18か月で約8,800ドル。

「八千八百ドル」とマヤは言いました。

「見過ごしによるもの」とトムは言いました。「誤ったアーキテクチャ設計をしているのではなく、整理整頓されていないから」

「どのようなシステム的な解決策ですか？」

「定期的な監査」とプリヤは言いました。「月次Cost Explorerのレビュー。AWS Trusted Advisorは、未割り当てのボリュームやアイドルリソースを自動的に検出します。既知の無駄のパターンを自動的にクリーンアップします：N日を超えるスナップショットを削除し、未割り当てのEBSボリュームについてアラートを送信し、古いS3バージョンを期限切れにします。」

「そして」とトムは付け加えました。「デプロイプロセスの一部として、コストの衛生を組み込みます。エンジニアがEC2インスタンスを停止すると、EBSボリュームは明示的に拒否しない限り自動的に削除されます。」

## Strengths and Limitations

**Cost optimization discipline**:

-   定期的なレビューは、それが重大になる前に蓄積された無駄をキャッチします
-   タグ付けは説明責任を可能にします—チームは自分のコストを認識します
-   自動アラートは請求額のサプライズを防ぎます
-   ライフサイクルポリシーと適切なサイズ化は、多くの場合、設定して忘れられる節約です

**Where it gets complicated**:

-   大規模なアカウントで多くのチームにわたる無駄を特定するには、集約されたツールが必要です
-   予期せぬ「念のため」のバックアップスナップショットを保持することは、コスト/リスクのトレードオフであり、判断です
-   gp3への移行には、慎重な検証が必要です（IOPSと帯域幅のデフォルト値がgp2の動作のいくつかのエッジケースで異なる可能性があります）
-   コスト割り当てタグは、すべてのチームで一貫性のあるタグ付けを必要とします—不一致のタグ付けはデータを不完全にします

## Summary

-   **ストレージコストは不可視で蓄積**—定期的な監査が不可欠です
-   **未割り当てのEBSボリューム**は一般的な無駄の源です。削除するか、インスタンスが終了するときに自動的に削除するように設定します
-   **EBSの適切なサイズ化**: gp2をgp3に移行（通常20%の節約）。過剰なプロビジョンドIOPSを削除します
-   **S3のバージョン管理**: 非現在のバージョンに対してライフサイクルルールを有効にして、無限のバージョン履歴に対して支払いを回避します
-   **EFS Intelligent-Tiering**: アクセス頻度に基づいて、より低コストのティアにファイルを自動的に移動します
-   **コスト割り当てタグ**: チーム/プロジェクト/環境メタデータでリソースをタグ付けして、コストの可視性と説明責任を確保します
-   **AWS Budgets**: 閾値に近づくコストに対してプロアクティブなアラートを設定します。毎月の請求額に驚くことはありません。

## Exam Tips

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.1)*

-   **コスト割り当てタグ**: 請求コンソールでユーザー定義タグを有効にし、次にリソースをタグ付けします。Cost Explorerはタグごとに分解を表示します。試験シナリオ：「S3のコストを生成している部門を特定する」→コスト割り当てタグ
-   **AWS Trusted Advisor**: 未利用のEC2インスタンス、未割り当てのEBSボリューム、アイドルロードバランサー、その他の無駄を特定します。基本的なチェックは無料、完全なチェックにはビジネス/エンタープライズサポートが必要です
-   **EBSのコストコンポーネント**: ストレージ（1GBあたり）、プロビジョンドIOPS（io1/io2または追加のgp3の場合）、帯域幅（追加のgp3の場合）を知っていますか？どのコンポーネントを調整できますか
-   **S3のバージョン管理コスト**: 非現在のバージョンは、現在のバージョンと同じレートで保存および課金されます。バージョン化されたバケットで非現在のバージョンを期限切れにするライフサイクルルールは、バージョン管理のコスト制御に不可欠です
-   **AWS Compute Optimizer**: EC2の利用率を分析し、適切なインスタンスタイプを推奨します。試験信号：「EC2のコストを削減するために適切なインスタンスタイプを選択する」→Compute Optimizer
-   **AWS Cost Anomaly Detection**: 異常な支出パターンを検出するためにMLを使用します。試験信号：「予期しないコストの増加を自動的に検出する」→Cost Anomaly Detection

## Exercises

**Exercise 1 — Recall**


Explain why unattached EBS volumes generate costs even though no EC2 instance is using them. どのような状況で、EC2インスタンスを使用していないにも関わらず、unattached EBSボリュームがコストを発生させるのか説明してください。 (Dōyōna jijō de, EC2 insutansu o shiyō shite nai ni mukawarazu, unattached EBS byōrū ga kosuto o hassei suru no ka setsumei shite kudasai.)

*(Hint: EBS volumes store data on physical disk, and that disk costs money regardless of whether it's being read.)*

*(ヒント: EBSボリュームは物理ディスクにデータを保存し、読み込まれていなくてもディスク自体がコストを発生させる)*

**Exercise 2 — Exam Practice**

*シナリオ*: 会社のAWS請求が月あたり$5,000から$9,000に6ヶ月で増加したが、新しいサービスを追加していない。エンジニアリングチームはストレージコストが問題だと疑っている。コスト増加を特定し説明するのに最適なAWSツールはどれですか？ (Shinario: Kaisha no AWS seisaku ga tsukareta koto de, bungai arutage $5,000 kara $9,000 ni 6 meshi no kaga de zouka shita ga, atarashii service o tsuijo shite nai. Enjiniīngingu chirimu wa sutorejji kosuto ga mondai da to inai. Kosuto zouka o tokutei shi setsumei suru no ni saiteki AWS tūru wa dore desu ka?)

A) AWS CloudTrail を使用してAPI呼び出しを確認し、リソースを作成した人を特定する。 (AWS CloudTrail o shiyō shite API yobizu o kakunin shi, risōsu o sakusei shita hito o tokutei suru.)
B) AWS Cost Explorer を使用してサービスレベルのコスト分解と、AWS Trusted Advisor を使用してアイドルおよびunattachedリソースの検出を行う。 (AWS Cost Explorer o shiyō shite service level no kosuto bunpein to, AWS Trusted Advisor o shiyō shite aidoru yumani unattached risōsu no detsuken o okonau.)
C) Amazon CloudWatch を使用してリソースの利用状況を監視し、コストアラームを作成する。 (Amazon CloudWatch o shiyō shite risōsu no riyō jōkyō o kanshi shi, kosuto arumu o sakusei suru.)
D) AWS Config を使用してすべてのリソースとそのコンプライアンスステータスを特定する。 (AWS Config o shiyō shite subete no risōsu to sono kompiyansu sutētasu o tokutei suru.)

**Hint 1**: "Identify the cost increase" → visualize cost breakdown by service. ("Kosuto no zouka" → "kosuto bunpein o miryō suru")

**Hint 2**: "Idle and unattached resources" → a specific tool proactively identifies these. ("Aidoru yumani unattached risōsu" → "tokubetsu na tūru ga seiretsu teki ni shite imasu")

**Hint 3**: CloudTrail logs API calls; Cost Explorer shows cost trends. Which is more useful for cost analysis? ("CloudTrail logu API yobizu; Cost Explorer shows cost trends. Which is more useful for cost analysis?")

**Answer**: B

**Explanation**: AWS Cost Explorer はサービス、地域、使用量タイプ別にコストトレンドを表示するため、コスト増加をどのサービスが引き起こしたかを特定するのに最適です。AWS Trusted Advisor のコスト最適化チェックは、unattached EBSボリューム、アイドルEC2インスタンス、過剰なロードバランサー、その他の一般的な無駄遣い源を特定します。 (AWS Cost Explorer wa service, chiiki, shiyōjūtype biseite kosuto torandō o hyōsei suru tame, kosuto zouka o dono service ga hikisō shita ka o tokutei suru no ni saiteki desu. AWS Trusted Advisor no kosuto saitekibuseku wa, unattached EBS byōrū, aidoru EC2 insutansu, kasa-yona rōdobaran-sā, futan no yōitan mushi yagai o tokutei shimasu.)

**Why not A?** CloudTrail はリソースの作成者と日時を記録しますが、コストトレンドを表示したり、無駄を特定したりしません。 (Why not A? CloudTrail wa risōsu no sakuseisha to nichiji o kiroku shimasu ga, kosuto torandō o hyōsei shitaru nara, muda o tokutei shitaru shinai.)

**Why not C?** CloudWatch はリソースのパフォーマンス（CPU、メモリ）を監視し、適切なサイズに調整するのに役立ちますが、蓄積されたストレージの無駄を特定するのには役立ちません。 (Why not C? CloudWatch wa risōsu no panfōrusu (CPU, memory) o kanshi shi, seikaku na saizu ni chōsei suru no ni yatkai masu ga, chūshoku sareta sutorejji no muda o tokutei suru no ni yatkai masen.)

**Why not D?** AWS Config はリソースの構成とコンプライアンスを追跡しますが、コスト分析ツールではありません。 (Why not D? AWS Config wa risōsu no kōzo to kompiyansu o tsuiketai shimasu ga, kosuto bunseki tūru dewa arimasen.)

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.1*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus の S3 コストが月あたり$340で、"backups" というラベルの付いたバケットを使用しています。このバケットには以下のものが含まれています。 (Nimbus no S3 kosuto ga bungai arutage $340 de, "backups" to iu label no futaita baketsu o shiyō shite imasu. Kono baketsu ni wa ika no mono ga fukumarete imasu.)

- 7日間のデータベースのスナップショット (データベースのポリシー内で十分な期間)
- 1週間分のフルバックアップ (3ヶ月間保持)
- 四半期分のアーカイブ (税務コンプライアンスのために7年間保持) (Shihan-kiban no aru arkaivu (zeimu kompiyansu no tame ni nanannensei kan hozu))

これらの要件を満たしつつ、コストを最小限に抑えるライフサイクルポリシーを設計してください。各データタイプに使用するストレージクラスはどれですか？バージョン管理をどのように処理して、古いバージョンが蓄積しないようにしますか？ (Kono yōken o mãnasu tsutsu, kosuto o saizinmin ni okeru raifasayuku porishii o sekkei shite kudasai. Katsuyō gozō no satoyū kurasu wa dore desu ka? Bēryon kanri o dōyō ni shōri shite, furui bēryon ga tetsushin shinai yō ni shimasu ka?)

*(There is no single correct answer. The goal is to practice lifecycle policy design.)*

## Post-Credits Scene

Tom がコスト監査の結果をチームに発表しました。 (Tom ga kosuto ansa no kekka o chīmu ni happyō shimashita.)

特定された無駄: 18ヶ月で$8,800。 (Tokutei sareta muda: 18 meshi de $8,800.)

実装された変更から期待される年間節約額: $6,200。 (Saimen sareta henkō kara kitai sareru nenkan setsuyō gakka: $6,200.)

その後、彼は下に次の行を追加しました。「これは、Savings Plans ($14,200/年) や S3 ライフサイクルポリシー ($7,800/年) からの節約を含みません。」 (Sono chō, kare wa shit ni fuku o tsuijo shimashita. "Kore wa, Savings Plans ($14,200/nen) ya S3 raifasayuku porishii ($7,800/nen) kara no setsuyaku o fukumimasen.")

Maya がそれを2回読みました。 ("Maya ga sore o ni-kai yomimashita.")

"それはジュニアエンジニアの給与と同じくらいです," と彼女は言いました。 ("Sore wa junior engineer no kyūyo to onaji kurai desu," to kano wa iimashita.)

"無駄な中で," とTomは確認しました。 ("Muda na naka de," to Tom wa kakunin shimashita.)

"あるいは," とLeoは言いました。"これらの最適化をより早く行えば、そのジュニアエンジニアの給与を賄うことができたでしょう。" (Aruwa, to Leo wa iimashita. "Kono zeiritsu o yori hayaku okobi-eba, sono junior engineer no kyūyo o makau koto ga dekita deshō.")

Tom は彼に目を向けました。 ("Tom wa kare ni me o mukaimashita.")

"それが正しい考え方です," と彼は言いました。"コスト最適化は、削減することではありません。価値を生み出さないものに対して支払いをしないことです。" (Sore ga shōrai suru kangate wa desu. Kosuto saitekibuse wa, sakurau koto de wa arimasen. Kachi o umidasenai mono ni taishai o shinai koto desu.)

Maya はそのドキュメントを会社のWikiにピン留めしました。 (Maya wa sono dokyumento o kaisha no Wiki ni pin'yūme shimashita.)

次の章では、データベース層も同じように扱われ、Tom は実際に投資不足だった唯一の場所を発見します。 (Tsugi no shō de wa, database tō-sō mo onaji yō ni ukeware, Tom wa jissai hōshi futsu deshita yuiutsu no basho o hakken shimasu.)
