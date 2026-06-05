# Chapter 13: Fast Everywhere

A photo traveling from a server in Virginia to a phone in Seattle crosses roughly 4,400 kilometers of fiber optic cable. At two-thirds the speed of light, that's about 25 milliseconds of pure physics — unavoidable, non-negotiable, baked into the laws of the universe.

Then add the round trip. Then add processing time. The browser hasn't started rendering yet and 80 milliseconds are already gone.

`eatnimbus.com` was live. Leo had checked the latency metrics from West Coast users: 80-100 milliseconds per request. That might sound small, but it compounds.

Load the menu: 90ms. Load the restaurant list: 80ms. Load the restaurant's photos: 200ms (images are big). Total time before a user could place an order: over half a second on a good connection.

"The physics is the problem," Leo said. "The servers are in Virginia. The users are on the West Coast."

"So move the servers to the West Coast," Tom said.

"That costs money."

"How much?"

"A lot. And it creates a whole new problem: keeping the East Coast database and the West Coast database in sync."

Priya looked up from her laptop. "Or we don't move the servers. We move the *content*."

**The Pre-Stocked Warehouse Analogy**

Imagine Amazon the retailer, not the cloud company. They have a massive warehouse in one location with every product. If they shipped every order from that one warehouse, customers in distant cities would wait days.

Instead, Amazon has fulfillment centers near major population centers. When a product is popular, they pre-stock those local warehouses. When a customer in Seattle orders a book, it ships from the local fulfillment center — not from Virginia.

This is a **Content Delivery Network (CDN)**: a network of geographically distributed servers that cache copies of your content close to your users.

When a user in Seattle requests your homepage, the CDN serves it from a server in Seattle. Not Virginia. The request never crosses the country.

**Meet CloudFront**

Amazon CloudFront is AWS's CDN. It operates through a global network of **edge locations** — caching servers positioned in cities around the world. As of this writing, there are over 500 edge locations in 90+ cities.

When you configure CloudFront, you specify an **origin**: the source of your actual content. Your origin might be:

- An S3 bucket (static files: images, CSS, JavaScript, PDFs)
- An Application Load Balancer (dynamic content from your application)
- An EC2 instance
- An HTTP server anywhere on the internet

CloudFront sits in front of your origin. Requests come in at the nearest edge location. If the edge has the content cached, it returns it immediately. If not (a *cache miss*), it fetches from your origin, caches it, and returns it.

**How CloudFront Caching Works**

The first request for any piece of content is always a cache miss — it goes to the origin. Every subsequent request hits the cache at the edge location.

For Nimbus, the menu photos are perfect CloudFront candidates. Restaurant photos change infrequently (maybe when the restaurant updates their profile). With CloudFront:

1. User in Seattle requests `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront checks the edge location in Seattle — not cached yet (cache miss)
3. CloudFront fetches from S3 in us-east-1 (~80ms)
4. CloudFront stores the photo in the Seattle edge location
5. Next user in Seattle requests the same photo
6. CloudFront serves from the local edge cache (~5ms)

Same 80ms penalty for the first request. But the thousandth request from the same city is 5 milliseconds.

**Cache-Control headers** and **TTL settings** in CloudFront determine how long content stays cached at the edge. Image files can be cached for hours or days. HTML pages (which change more often) might be cached for minutes or seconds.

**Dynamic Content: CloudFront for More Than Caching**

"But what about our API responses?" Leo asked. "Those are dynamic — they change per user, per request. You can't cache an order history page."

True. But CloudFront still helps with dynamic content.

Even when content can't be cached, CloudFront routes the request from the edge location to the origin via AWS’s private backbone network — the high-speed fiber connecting AWS infrastructure globally. This is faster and more reliable than routing over the public internet, where traffic can bounce through multiple carriers.

The result: dynamic requests are still 20-40% faster through CloudFront than going directly to the origin over the public internet. Not because of caching, but because of the network path.

Additionally, CloudFront provides:

**SSL/TLS termination**: CloudFront handles HTTPS at the edge. The connection between the user and CloudFront is encrypted. CloudFront can connect to your origin over HTTP internally (reducing origin load) or HTTPS (for end-to-end encryption).

**分散型防御 (DDoS 対策)**：CloudFront は AWS Shield Standard と統合されています。数百のエッジロケーションに分散されたトラフィックにより、攻撃はオリジンに直接集中するのではなく、エッジで吸収されます。

**地理制限 (Geo-Restriction)**：特定の国からのアクセスをブロックします。Nimbus が特定の市場でのみライセンスされている場合、CloudFront はリクエストがオリジンに到達する前にエッジで強制できます。

**CloudFront 行動 (CloudFront Behaviors): 詳細なキャッシュルール**

CloudFront ディストリビューションは、URL パターンに基づくルーティングルールを持つ複数の **行動** を持つことができます。

Nimbus の場合：

- `/images/*` → エッジで 7 日間キャッシュ (写真の変更は少ない)
- `/static/*` → エッジで 30 日間キャッシュ (CSS と JavaScript でバージョン付きファイル名)
- `/api/*` → キャッシュしません。ロードバランサーに直接転送
- `/*` → 5 分間キャッシュ (HTML ページ)

これにより、CloudFront は賢く動作します。安定したものは積極的にキャッシュし、動的なものはそのまま転送します。

**オリジンアクセス制御 (Origin Access Control): CloudFront を使用した S3 のセキュリティ**

S3 バケットに CloudFront を通してのみ提供されるプライベートコンテンツが含まれている場合、**オリジンアクセス制御 (OAC)** を使用して、S3 が CloudFront からの要求を拒否するようにすることができます。

これにより：

- `d1234abcd.cloudfront.net/image.jpg` が提供される (CloudFront が許可されている)
- `nimbus-assets.s3.amazonaws.com/image.jpg` がブロックされる (直接 S3 アクセスが拒否される)

コンテンツは、キャッシュルールとセキュリティ設定が適用された CloudFront ディストリビューションを通じてのみアクセス可能です。

## 強みと限界

**CloudFront が強力な理由**:

- 90 以上の都市にあるエッジロケーション
- 最初のキャッシュ後に数ミリ秒で静的コンテンツを提供
- オリジンの負荷を大幅に削減 (繰り返しトラフィックはオリジンサーバーに到達しない)
- AWS Shield、WAF、証明書マネージャーと統合
- 容量計画は不要 - CloudFront は自動的にスケーリング

**複雑になる場所**:

- キャッシュされたコンテンツが古くなる可能性 - キャッシュ無効化には費用がかかる ($0.005 per 1,000 paths)
- オリジンでキャッシュ制御ヘッダーが正しく設定されている必要がある - 間違いがあると古いコンテンツが提供される
- 動的コンテンツはルーティング最適化の恩恵を受けるが、キャッシュの恩恵は受ける
- キャッシュの動作 (何がキャッシュされ、どのくらいの時間) をデバッグするには、オリジンのヘッダー、CloudFront TTL 設定、行動ルールなど、複数のレイヤーを理解する必要がある
- CloudFront を通じてデータを出力するには費用がかかるが、標準的なデータ転送よりも少ない

## 概要

- **CDN (コンテンツ配信ネットワーク)** は、ユーザーに近いエッジロケーションにコンテンツのコピーをキャッシュすることで、レイテンシとオリジンの負荷を軽減します。
- **CloudFront** は AWS の CDN で、グローバルに 500 以上のエッジロケーションがあります。
- キャッシュミスはオリジン (S3、ALB、EC2) からコンテンツを取得します。キャッシュヒットはエッジからコンテンツを提供し、数百ミリ秒ではなく数ミリ秒です。
- **行動** を使用して、異なる URL パターンに対して異なるキャッシュルールを設定できます。
- 動的コンテンツはキャッシュされませんが、CloudFront はプライベートバックボーンネットワークを介してパフォーマンスを向上させます。
- **オリジンアクセス制御** は、直接 S3 アクセスを制限し、コンテンツは CloudFront を通じてのみ提供されます。
- Shield (DDoS)、WAF (アプリケーションファイアウォール)、ACM (SSL 証明書) と統合されています。

## 試験のヒント

*SAA-C03 ドメイン: 高性能アーキテクチャの設計 (ドメイン 3、タスク 3.4)*

- **CloudFront + S3**: 静的ウェブサイトをグローバルに提供するためのクラシックな試験パターン。S3 バケットをオリジンとして、CloudFront を CDN として、直接 S3 アクセスを防止するために Origin Access Control を使用します。
- **エッジロケーション vs リージョン vs AZ**: エッジロケーションはより多数存在し、CDN の目的でのみ存在します。オリジンサーバーの実行に使用される AZ とは異なります。
- **キャッシュ無効化**: `/images/*` を無効化して、CloudFront が新しいコンテンツを取得するように強制します。費用がかかる - 効率的な代替手段であるバージョン付き URL (`image-v2.jpg` ではなく `image.jpg`) を使用することを検討する必要があります。
- **TTL コントロール**: オリジンで `Cache-Control: max-age=3600` を設定すると、1 時間のキャッシュ TTL が設定されます。CloudFront はこれらのヘッダーを尊重します。
- **CloudFront Functions vs Lambda@Edge**: CloudFront Functions は、軽量のリクエスト/応答操作のためにエッジで実行されます (サブミリ秒)。Lambda@Edge は、より重い処理のためにエッジロケーションで Lambda コードを実行します。試験では、ユースケースの複雑さによって区別されます。
- **署名付き URL と署名付き Cookie**: CloudFront を通じてコンテンツにアクセスできる人を制御します。署名付き URL は、特定のファイルへのアクセスを許可し、署名付き Cookie は、複数のファイルへのアクセスを許可します。試験では、これらのものを「有料サブスクリプションコンテンツ」に使用します。

## 練習問題

**練習問題 1 - 記憶**

CloudFront キャッシュヒットとキャッシュミスの違いを説明してください。それぞれのケースで何が起こりますか？

*(ヒント：コンテンツのソースと応答時間が異なることを考えてください。)*

**練習問題 2 - 試験練習**

*シナリオ*: ソフトウェア会社が、顧客に世界中に大規模なインストーラーファイル（各約2GB）をS3バケットから配布しています。アジアの顧客からのダウンロード速度が遅い。チームは、S3バケットを複数のリージョンに複製することなく、パフォーマンスを改善したいと考えています。また、インストーラーをダウンロードできるのは、支払い済みの顧客のみであることを保証する必要があります。

どのソリューションがこれらの要件に最も適していますか？

A) バケットでS3 Transfer Accelerationを有効にし、支払い済みの顧客に対してプレサインされたURLを生成する。
B) S3バケットをオリジンとしてCloudFrontを使用し、オリジンアクセス制御を有効にし、支払い済みの顧客に対してCloudFront署名されたURLを使用する。
C) 各AWSリージョンにS3バケットを作成し、Route 53のジオロケーションルーティングを使用して、最も近いバケットに顧客を誘導する。
D) 各リージョンでアプリケーションロードバランサーを使用し、インストーラーファイルを配信するEC2インスタンスを使用する。

ヒント1: 要件は、バケットの複製を必要とせずに、グローバルなパフォーマンスを向上させることです。複数のバケットを必要としないオプションはどれですか？

ヒント2: CloudFrontを通じて配信されるコンテンツにアクセスできる人物を制御するサービスは何ですか？

ヒント3: S3 Transfer Accelerationは、S3に長距離のアップロードを最適化するように設計されています。S3からエンドユーザーにグローバルにコンテンツを配信するには、CloudFrontが適切なツールです。

答え: B

説明: CloudFrontは、インストーラーファイルを最初のダウンロード後にグローバルなエッジロケーションでキャッシュします。同じリージョンからの後続のダウンロードはエッジから行われ、S3のus-east-1から太平洋を横断するよりも高速です。オリジンアクセス制御は、S3バケットへのアクセスをCloudFrontを通じてのみ許可します。署名されたURLは、支払い済みの顧客へのアクセスを制限します。

Aが正しくない理由: S3 Transfer Accelerationは、S3にコンテンツをアップロードするための最適化されており、S3からグローバルな視聴者へのコンテンツ配信には適していません。そのため、CloudFrontが適切なツールです。署名されたURLはアクセスを制御しますが、グローバルなパフォーマンスを向上させることはありません。

Cが正しくない理由: S3バケットを各リージョンで作成することは、パフォーマンスの点で機能しますが、複数のバケットを回避する要件に反します。また、バケット間でデータ同期戦略を管理する必要もあります。

Dが正しくない理由: 各リージョンでロードバランサーの後ろにあるEC2インスタンスを使用することは、CloudFrontよりも大幅に高価であり、複数のリージョンでサーバーを管理する必要があり、より複雑です。

SAA-C03 ドメイン: 高性能アーキテクチャの設計 - タスク 3.4*

演習 3 - アーキテクチャチャレンジ *(オプション)*

Nimbusは、レストランパートナーから提供される短い料理チュートリアルビデオコンテンツを追加したいと考えています。ビデオは50MB〜500MBです。彼らは、公開後数時間で数千人のユーザーが同じ都市でビデオを視聴すると予想しています。

ストレージと配信アーキテクチャを設計してください。S3とCloudFrontを使用しますか？最初のリクエスト（コールドスタート）を最小限の遅延で処理するために、どのように対処しますか？公開後、変更のないビデオに対してキャッシュTTLを設定するには、どの値を設定しますか？

(単一の正解はありません。目標は、CDN設計の意思決定を練習することです。)

*クレジット後のシーン*

プリヤは、デプロイメント後にCloudFrontのメトリクスを調べました。

キャッシュヒット率: 83%。

「これは何を意味しますか？」トムが尋ねました。

「これは、83%のユーザーが、近くの場所にあるエッジロケーションからコンテンツを取得しており、us-east-1からではありません。」

「そして、残りの17%は何ですか？」

「最初のリクエストです。そのエッジロケーションでまだキャッシュされていないコンテンツ。」

トムはメトリクスを凝視しました。「つまり、CloudFrontのエッジノードから100万件のリクエストを毎日処理しています。そして、そのうち17万件が私たちのサーバーにヒットしています。」

「はい。」

「つまり、CloudFrontを持っていなければ、私たちのサーバーが100万件のリクエストを処理します。」

「各ユーザーあたり140〜160ミリ秒。」

トムは座り直しました。彼は、コストをリアルタイムで再計算している—その外観を認識しました。

「これは価値がある」と彼は言いました。

マヤはすでにラップトップで作業していました。「次の週に2人のエンジニアが加わります。プラットフォームチームのソフィンと、セキュリティを専門とするラファエルです。彼らをIAMでオンボーディングします。彼らの最初の日に。」

「IAM高度化ですか？」レオが尋ねました。

「役割、ポリシー、クロスアカウントアクセス。本物のものです。」

次の章では、システムの一部の部分が安全に別の部分と通信できるようにする、詳細な権限を扱います。
