# Chapter 26: Making Sense of Everything

Data is raw: timestamps, clicks, events, numbers. Information is what you get when data is organized, processed, and given context. The gap between the two is where this chapter lives.

And in growing systems, that gap gets expensive fast.

Nimbus was generating enormous amounts of data. Every order: recorded. Every menu view: logged. Every restaurant update: captured. Every customer interaction: tracked.

Tom had a question.

"What's our busiest order time on Fridays?"

Leo looked at him. “That’s not in our dashboard.”

“Can we add it?”

“The data is in DynamoDB. And in CloudWatch logs. And in S3 from the analytics export job.” Leo paused. “In three different places, in three different formats.”

Maya added: “And the analytics export only runs once a night. If you want Friday data, you’d have to wait until Saturday morning.”

Tom looked at the screen. “So we have the data. We just can’t use it.”

That sentence describes half of modern analytics.

This is the data engineering problem: you have data, but it’s not in a form you can analyze when you need it.

**Three Different Problems**

Nimbus’s data problem had three dimensions:

**Real-time streaming**: Orders are being placed right now. You want to see a live dashboard of order velocity — how many per minute, by region, by restaurant. The data needs to be processed as it arrives.

**Data transformation**: The data is in S3 from various systems, in different formats (JSON, CSV, Parquet). Before you can analyze it, you need to normalize it — same schema, same format, cleaned up, joined with reference data.

**Ad-hoc analysis**: Once the data is organized, you want to run SQL queries against it without having to load it into a database first. “Give me the top 10 restaurants by revenue in the last 30 days.” Without loading the data into a database.

Each of these is a distinct problem. AWS has a dedicated service for each:

- **Amazon Kinesis**: Real-time streaming data
- **AWS Glue**: Data transformation and cataloging
- **Amazon Athena**: Serverless SQL queries on S3

**Amazon Kinesis: The Real-Time Ticker Tape**

**Amazon Kinesis Data Streams** is a real-time data streaming service. Producers send data records to the stream. Multiple consumers can read from the stream simultaneously, each at their own pace.

Think of a ticker tape machine: prices are printed continuously, everyone can read the tape, and the tape doesn’t slow down for any individual reader.

For Nimbus, when an order is placed, the application publishes an event to a Kinesis stream: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumers of this stream:

- A real-time dashboard (reads events as they arrive, updates metrics)
- A fraud detection Lambda (looks for unusual order patterns)
- A stream to S3 for permanent storage

**Kinesis Data Streams concepts**:

- **Shard**: The basic unit of capacity. One shard handles 1 MB/s write, 2 MB/s read.
- **Retention period**: Data stays in the stream for 24 hours (default) to 7 days.
- **Sequence number**: Each record has a sequence number. Consumers track their position in the stream.

**Amazon Data Firehose** (formerly **Kinesis Data Firehose**): The managed delivery service between streaming producers and destinations such as S3, Redshift, and OpenSearch. It buffers, compresses, transforms, and delivers data automatically.

For Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (Parquet format, compressed, partitioned by date).

**AWS Glue: The Translator**

Data in S3 is raw. Before you can analyze it efficiently, you need to:

- Discover what’s there and its schema (what columns, what types)
- Transform it into a consistent format
- Join different datasets together
- Handle bad records, schema changes, missing values

**AWS Glue** is a fully managed ETL (Extract, Transform, Load) service. It has two main components:

**Glue Data Catalog**: A metadata store that describes your S3 data — what tables exist, what columns they have, where the data files are. It's like a card catalog for your data lake.

**Glue Crawlers**: Automated agents that scan S3, infer the schema, and populate the Data Catalog. Run a crawler on your S3 bucket and 10 minutes later you have a catalog of all your tables.

**Glue Jobs**: Serverless Spark/Python jobs that perform the actual transformation. You write the transformation logic (or use Glue’s visual ETL tool), and Glue runs it on managed infrastructure.

For Nimbus:

1. Glue Crawler scans the orders data in S3 → creates a table definition in the Glue Data Catalog
2. Glue Job transforms the raw JSON order events into a clean, partitioned Parquet format
3. The transformed data is written back to S3 in a query-optimized layout

**Amazon Athena: The Librarian**
```

**Amazon Athena** は、S3 のデータに対して直接 SQL クエリを実行できる、サーバーレスでインタラクティブなクエリサービスです。データベースをプロビジョニングする必要もありませんし、データをロードする必要もありません。テーブルを定義するか（または Glue データカタログを使用）、SQL を記述し、Athena が S3 ファイルに対してクエリを実行します。

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

アテナの価格体系は、クエリがスキャンするデータの量に基づいて決まります。多くの地域では、標準SQLクエリはスキャンされた1テラバイトあたり$5から始まります。Parquet形式（列指向）を使用し、パーティション分割（例：`WHERE year='2024' AND month='01'`）を行うと、アテナは必要なファイルのみをスキャンするため、コストが大幅に削減されます。

「このクエリを30日分のデータに対して実行できます」とレオは言いました。「もしデータを適切に保存すれば、予想以上に安くなるかもしれません。」

「どんな問いでも実行できるのか？」トムが尋ねました。

「SQLで表現できるどんな問いでも、S3に保存したデータに対して実行できる。」

トムは、これまで捨てていたデータの価値を再計算しているかのようです。

**データレイクアーキテクチャ**

これらの3つのサービスを組み合わせて、**データレイクアーキテクチャ**と呼ばれるものが構築されます—これは、すべてのデータを一元的に保存するS3リポジトリと、そのデータを処理およびクエリするためのツールを組み合わせたものです：
```

Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)

# AWS 初心者ガイド

生のデータは常に元の S3 バケットに保存されます。変換されたデータは Athena を通じてクエリ可能です。新しい質問は、生のデータに対して新しい Glue ジョブを実行することで常に回答できます。

**Amazon Redshift: Athena だけでは足りない場合**

いくつかのユースケースでは、Athena は遅すぎるか、またはコストがかかる場合があります。

- 多数の結合を含む非常に複雑なクエリ
- 同じクエリを 1 日あたり数千回実行するダッシュボード
- 構造化されたデータに対する機械学習
- BI ツールに必要なサブ秒応答時間

**Amazon Redshift** は、大規模で繰り返される分析ワークロード用に設計された、カラムナ型分析データベースである、完全に管理されたデータウェアハウスです。Athena はデータが存在する場所（S3）をクエリするのに対し、Redshift は最適化された倉庫ストレージにデータをロードし、クエリ最適化、ソート戦略、分布戦略を使用して複雑な分析を高速化します。

Redshift は複雑な分析クエリにおいて、コスト（プロビジョンド容量）とクエリを実行する前にデータをロードする必要があるというトレードオフを伴いながら、Athena よりも大幅に高速です。

**Redshift Serverless** は、容量計画の負担を取り除く—クエリを実行すると、Redshift がスケーリングします。コストはクエリごとに課金されます。

Nimbus などの現在の規模では、Athena で十分です。データ量が 5 倍になり、BI ツールが同じダッシュボードを 1 日あたり数百回にわたってクエリする場合、Redshift がコスト効率に優れるようになります。

## 強みと限界

**Kinesis Data Streams**: データの到着が継続的であり、順序が重要な場合は Kinesis を使用します—クリックストリーム、金融取引、IoT  telemetry。Kinesis はシャード内でレコードの順序を保持し、構成された保持期間中に再再生を可能にするため、SQS と根本的に異なります。トレードオフは運用複雑さです—プロビジョンドモードでは、シャード容量と消費者の動作を管理する必要があります。単純なタスクキューで順序が重要でない場合や再再生が不要な場合は、SQS がより簡単な選択肢です。

**AWS Glue**: Glue は、従来の ETL クラスタのインフラストラクチャを排除します。変換ロジックを記述し、AWS が Spark 環境を管理します。変換が複雑であるか、データ量が大きい場合に価値があります。制限はコストとコールドスタート—Glue ジョブには数分間の起動遅延があり、ニアリアルタイムの変換には不適切です。CSV から Parquet への単純なファイル形式変換の場合、Lambda 関数または軽量スクリプトと比較して Glue のオーバーヘッドが価値がない場合があります。

**Amazon Athena**: Athena は、インフラストラクチャを管理する必要なしに、標準 SQL で S3 データにクエリを実行できます。重要な制約はコスト—Athena はスキャンされたデータ 1 TB ごとに課金されます。10 TB のテーブル全体をスキャンするクエリは、同じクエリを 200 GB の Parquet 形式でパーティション分割されたテーブルでスキャンするクエリよりも大幅にコストがかかります。常にカラム形式（Parquet または ORC）を使用し、Athena を本番環境で実行する前にデータをパーティション分割してください。これらの最適化を行わない場合、Athena の請求額は予想外になる可能性があります。

## 概要

- **Amazon Kinesis**: リアルタイムデータストリーミング。プロデューサーはレコードを書き込み、消費者はお客様のペースで読み取ります。Amazon Data Firehose を使用すると、より少ない運用作業でストリーミングデータを S3、Redshift、その他の宛先に配信できます。
- **AWS Glue**: ETL とデータカタログ。クロージャーはスキーマを発見し、ジョブはデータを変換し、データカタログは Athena やその他のツールでデータを発見できるようにします。
- **Amazon Athena**: S3 上のサーバーレス SQL。標準 SQL を使用して S3 内のデータをクエリします。スキャンされたデータ 1 TB ごとに課金されます—Parquet とパーティショニングを使用してコストを最小限に抑えてください。
- **Amazon Redshift**: 高性能分析のための管理データウェアハウス。データをロードし、繰り返しの分析クエリを最適化し、倉庫規模で高速にクエリを実行します。
- **データレイクパターン**: 生データを S3 → Glue で変換 → Athena でクエリ → BI ツールで可視化します。

## 試験のヒント

*SAA-C03 ドメイン: 高性能アーキテクチャの設計 (ドメイン 3、タスク 3.5)*

- **Kinesis と SQS**: Kinesis = 順序付き、リアルタイムストリーミング、複数の消費者、保持期間内のリプレイが可能。SQS = タスクキュー、各メッセージが一度だけ処理される。 "複数の消費者が同時に同じストリームを読み取る" → Kinesis。 "1つのワーカーが1つのメッセージに対して" → SQS。
- **Athena 試験シグナル**: "S3 上のサーバーレス SQL," "データベースにロードせずに S3 データ分析," "クエリごとに支払い" → Athena。
- **Athena コスト最適化**: 列形式 (Parquet または ORC) + パーティショニングにより、スキャンされるデータとコストが大幅に削減されます。試験では、Athena のコストを削減する方法について質問される可能性があります。
- **Glue クローラー**: "S3 データのスキーマを自動的に検出する" → Glue クローラー。
- **Amazon Data Firehose**: "消費者を管理することなく、ストリーミングデータを S3/Redshift/OpenSearch に自動的にロードする" → Amazon Data Firehose。古い資料には、まだ Kinesis Data Firehose と呼ばれる場合があります。
- **Redshift と Athena**: Redshift は、固定データセットに対して高頻度、複雑なクエリを実行する場合 (BI ダッシュボード)。Athena は、頻繁に変更される S3 データの ad-hoc クエリに使用されます。
- **EMR (Elastic MapReduce)**: AWS で管理される Hadoop/Spark クラスタ。試験では、"既存の Hadoop/Spark ワークロード" または "カスタムデータ処理フレームワーク" が言及された場合に利用されます。Glue は、ほとんどのユースケースにおいて管理された代替手段です。

## 練習問題

**練習問題 1 — 回想**

Amazon Kinesis と Amazon SQS の違いを説明してください。それぞれをいつ使用すればよいですか？

*(ヒント: 消費者の数、メッセージの削除方法、順序の重要性について考えてください。)*

**練習問題 2 — 試験対策**

*シナリオ*: ライドシェアリング会社が旅行データを分析したいと考えています。100 万件の旅行が毎日完了します。旅行記録は S3 に JSON ファイル (約 2KB) として保存されています。分析チームは、「先週の都市ごとの平均旅行時間」のような ad-hoc SQL クエリを実行したいと考えています。クエリは 2 分以内に完了し、ストレージコストを最小限に抑える必要があります。チームは 1 週間あたり 20〜30 件のクエリを実行します。

これらの要件を満たす最適なアーキテクチャはどれですか？

A) 旅行データを毎日 RDS PostgreSQL にロードし、標準 SQL でクエリを実行する。
B) JSON を Parquet 形式に変換し、日付と都市でパーティション分割し、Amazon Athena でクエリを実行する。Glue を使用する。
C) 旅行データを Amazon Redshift に Firehose で配信し、Redshift でクエリを実行する。
D) 旅行データを DynamoDB にロードし、PartiQL で SQL クエリを実行する。

**ヒント 1**: 1 週間あたり 20〜30 件のクエリは低頻度です。最も費用対効果の高いサービスはどれですか？

**ヒント 2**: Parquet 形式 + パーティショニングにより、Athena でスキャンされるデータが大幅に削減されます — そして、コストも削減されます。

**ヒント 3**: 100 万件の旅行 × 2KB = ~2GB/日。1 週間で ~14GB。Athena の 1 TB あたりの価格が $5 なので、最適化されていない場合でも、このコストは手頃です。

**答え**: B

**説明**: Glue は JSON を Parquet (列形式によりスキャンされるデータが大幅に削減されます) に変換し、日付と都市でパーティション分割します (パーティション分割により、「先週」のクエリは 7 日分のパーティションのみをスキャンします)。Athena は、標準 SQL を使用して S3 を直接クエリします。1 週間あたり 20〜30 件のクエリを実行する場合、常に実行される Redshift よりも、クエリごとに支払う Athena の価格の方が費用対効果が高くなります。

**A なぜダメ？** 2GB のデータを毎日 RDS にロードし、その後クエリを実行するには、24 時間 365 日稼働するデータベースインスタンスが必要です。1 週間あたり 20〜30 件のクエリを実行する場合、これは過剰なエンジニアリングであり、コストがかかります。

**C なぜダメ？** Redshift は、同じデータセットに対して数百件/日の高頻度クエリの場合に費用対効果が高くなります。1 週間あたり 20〜30 件のクエリを実行する場合、常に実行される Redshift クラスタのコストは、クエリごとに支払う Athena の価格よりも高くなります。

**D なぜダメ？** DynamoDB は、キーベースのアクセスに最適化されたキー-バリュー/ドキュメントストアであり、GROUP BY などの集計を含む ad-hoc 分析クエリには適していません。PartiQL を DynamoDB で使用しても、記述されているような集計を行うことはできません。

*SAA-C03 ドメイン: 高性能アーキテクチャの設計 — タスク 3.5*

**練習問題 3 — アーキテクチャチャレンジ** *(オプション)*

Nimbus が注文のリアルタイム不正検出システムを構築したいと考えています。システムは次の機能を備えている必要があります。

- 60 秒以内に同じアカウントから 5 回以上注文を行う
- $500 を超える注文は、30 日未満の新しいアカウントから行う
- フラグされた注文を人間のレビューキューに送信する

アーキテクチャを設計してください。Kinesis は何を提供しますか？不正検出ロジックはどこで実行されますか？ "同じアカウント、60 秒のウィンドウ" をどのように関連付けますか？ フラグされた注文を受信するサービスは何ですか？

*(正解は 1 つではありません。目標は、リアルタイムストリーミングアーキテクチャ設計の実践です。)*

## クロージングシーン

Tom が最初の Athena クエリを実行しました。

「先月のレストランの売上上位 10 店舗」と彼は言いました。

12 秒後、結果が表示されました。

彼はそれらを見ました。

「47 番目のレストランが 1 位だった」と彼は言いました。それは Maya の家族のレストランでした — Nimbus が始まった場所です。

「当然です」と Maya は言いました。「Arepa はそんなに美味しいのです。」

Tom は別のクエリを実行しました。そして、また別のクエリを実行しました。各クエリは数秒で回答し、数セントのコストがかかりました。

1 時間後、彼は Nimbus のビジネス全体を、これまでにない方法で把握することができました。どのカテゴリーのレストランが最も急速に成長したか。どの顧客セグメントが最も長く維持されたか。どのメニュー項目が最も多くのリピート注文を生成したか。

「もっと早くこれを作らなかったのか？」彼は尋ねた。

「データはあった」「レオは言った。「ただ、それを活用するためのパイプラインがなかっただけだ。」

「データは常にそこにあった」「マヤは静かに言った。「ただ、見えなかっただけだ。」

次の章では、ビジネスを明確に把握できた今、それを実行するインフラストラクチャの費用対効果を高める方法について話しましょう。
