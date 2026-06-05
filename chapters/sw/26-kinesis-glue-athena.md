# Sura ya 26: Kufanya Maana ya Kila Kitu

Data ni mbichi: alama za wakati, mibofyo, matukio, nambari. Taarifa ndiyo unayopata data inapoandaliwa, kushughulikiwa, na kupewa muktadha. Pengo kati ya zote mbili ndipo sura hii inaishi.

Na katika mifumo inayokua, pengo hilo linakuwa ghali haraka.

Nimbus ilikuwa ikizalisha kiasi kikubwa cha data. Kila agizo: liliandikwa. Kila mtazamo wa orodha: liliandikwa. Kila sasisha la mgahawa: lilinaswa. Kila mwingiliano wa mteja: lifuatiliwe.

Tom alikuwa na swali.

"Wakati wetu wa shughuli nyingi zaidi wa agizo Ijumaa ni lini?"

Leo alimtazama. "Hiyo haiko kwenye dashibodi yetu."

"Tunaweza kuiongeza?"

"Data iko katika DynamoDB. Na katika kumbukumbu za CloudWatch. Na katika S3 kutoka kazi ya mauzo ya uchambuzi." Leo alisita. "Katika maeneo matatu tofauti, katika miundo mitatu tofauti."

Maya aliongeza: "Na mauzo ya uchambuzi yanafanya kazi mara moja usiku tu. Ukitaka data ya Ijumaa, ungehitaji kusubiri hadi asubuhi ya Jumamosi."

Tom alitazama skrini. "Kwa hivyo tuna data. Tunaweza tu kuitumia."

Sentensi hiyo inaelezea nusu ya uchambuzi wa kisasa.

Hili ndiyo tatizo la uhandisi wa data: una data, lakini haiko katika muundo unaoweza kuchambuliwa unapouihitaji.

**Matatizo Matatu Tofauti**

Tatizo la data la Nimbus lilikuwa na vipimo vitatu:

**Utiririko wa wakati halisi**: Maagizo yanawekwa hivi sasa. Unataka kuona dashibodi ya moja kwa moja ya kasi ya agizo — ngapi kwa dakika, kwa mkoa, kwa mgahawa. Data inahitaji kushughulikiwa inavyofika.

**Mabadiliko ya data**: Data iko katika S3 kutoka mifumo mbalimbali, katika miundo tofauti (JSON, CSV, Parquet). Kabla ya kuichambua kwa ufanisi, unahitaji kuikawaida — mpango sawa, umbizo sawa, uliosafishwa, uliounganishwa na data ya rejea.

**Uchambuzi wa hiari**: Data ikiwa imepangwa, unataka kuendesha maswali ya SQL dhidi yake bila kulazimika kuipakia kwenye hifadhidata kwanza. "Nipe migahawa 10 ya juu kwa mapato katika siku 30 zilizopita." Bila kupakia data kwenye hifadhidata.

Kila moja ya hizi ni tatizo tofauti. AWS ina huduma iliyowekwa kwa kila moja:

- **Amazon Kinesis**: Utiririko wa data wa wakati halisi
- **AWS Glue**: Mabadiliko ya data na katalogi
- **Amazon Athena**: Maswali ya SQL bila seva kwenye S3

**Amazon Kinesis: Tepe ya Tiketi ya Wakati Halisi**

**Amazon Kinesis Data Streams** ni huduma ya utiririko wa data wa wakati halisi. Wazalishaji hutuma rekodi za data kwenye mtiririko. Walaji wengi wanaweza kusoma kutoka kwa mtiririko wakati mmoja, kila mmoja kwa kasi yake mwenyewe.

Fikiria mashine ya tepe ya tiketi: bei zinachapishwa mfululizo, kila mtu anaweza kusoma tepe, na tepe haisimami kwa msomaji yeyote binafsi.

Kwa Nimbus, agizo linapowekwa, programu inachapisha tukio kwa mtiririko wa Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Walaji wa mtiririko huu:

- Dashibodi ya wakati halisi (inasoma matukio yanavyofika, inasasisha vipimo)
- Lambda ya ugunduzi wa udanganyifu (inatafuta mifumo ya agizo isiyo ya kawaida)
- Mtiririko kwa S3 kwa uhifadhi wa kudumu

**Dhana za Kinesis Data Streams**:

- **Kipande (Shard)**: Kitengo cha kimsingi cha uwezo. Kipande kimoja kinashughulikia kuandika Mbps 1, kusomwa Mbps 2.
- **Kipindi cha uhifadhi (Retention period)**: Data inabaki kwenye mtiririko kwa masaa 24 (chaguo-msingi) hadi siku 7.
- **Nambari ya mfululizo (Sequence number)**: Kila rekodi ina nambari ya mfululizo. Walaji hufuatilia nafasi yao kwenye mtiririko.

**Amazon Data Firehose** (zamani **Kinesis Data Firehose**): Huduma ya utoaji inayosimamiwa kati ya wazalishaji wa utiririko na maeneo ya lengwa kama S3, Redshift, na OpenSearch. Inabafufu, kusaba, kubadilisha, na kutoa data kiotomatiki.

Kwa Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (umbizo la Parquet, lililosabishwa, lililoundwa kwa tarehe).

**AWS Glue: Mtafsiri**

Data katika S3 ni mbichi. Kabla ya kuichambua kwa ufanisi, unahitaji:

- Gundua kilichomo na mpango wake (nguzo gani, aina gani)
- Ibadilishe kuwa umbizo thabiti
- Unganisha seti tofauti za data pamoja
- Shughulikia rekodi mbaya, mabadiliko ya mpango, maadili yanayokosekana

**AWS Glue** ni huduma ya ETL (Toa, Badilisha, Pakia) inayosimamiwa kikamilifu. Ina sehemu kuu mbili:

**Katalogi ya Data ya Glue (Glue Data Catalog)**: Duka la metadata linaloelezea data yako ya S3 — jedwali gani zipo, nguzo gani zina, faili za data ziko wapi. Ni kama katalogi ya kadi kwa ziwa lako la data.

**Watambazaji wa Glue (Glue Crawlers)**: Mawakili wa kiotomatiki wanaotambaza S3, wanaosomba mpango, na kusasisha Katalogi ya Data. Endesha mtambazaji kwenye ndoo yako ya S3 na dakika 10 baadaye una katalogi ya jedwali zako zote.

**Kazi za Glue (Glue Jobs)**: Kazi za Spark/Python bila seva zinazotekeleza mabadiliko halisi. Unaandika mantiki ya mabadiliko (au kutumia zana ya ETL ya kuonekana ya Glue), na Glue inaiendesha kwenye miundombinu inayosimamiwa.

Kwa Nimbus:

1. Mtambazaji wa Glue anatambaza data ya maagizo katika S3 → anaunda ufafanuzi wa jedwali katika Katalogi ya Data ya Glue
2. Kazi ya Glue inabadilisha matukio ya agizo ya JSON mbichi kuwa umbizo safi, lililoundwa la Parquet
3. Data iliyobadilishwa imeandikwa tena kwa S3 katika mpangilio ulioimarini kwa maswali

**Amazon Athena: Maktabari**

**Amazon Athena** ni huduma ya maswali ya maingiliano bila seva inayoendesha maswali ya SQL moja kwa moja kwenye data ya S3. Hakuna hifadhidata ya kutoa, hakuna data ya kupakia. Unabainisha jedwali (au kutumia Katalogi ya Data ya Glue), unaandika SQL, na Athena inatekeleza swali dhidi ya faili za S3.

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

Bei za Athena zinategemea kiasi cha data inayochunguzwa na swali. Katika mikoa mingi, maswali ya kawaida ya SQL yanaanzia $5 kwa terabyte inayochunguzwa. Kutumia umbizo la Parquet (wa nguzo) na kupunguza vifaa (`WHERE year='2024' AND month='01'`) kunamaanisha Athena inachunguza faili inazohitaji tu, ambayo hupunguza gharama kwa kiasi kikubwa.

"Tunaweza kuendesha swali hili kwa siku 30 za data," Leo alisema, "na inaweza kuwa ya gharama ndogo kwa kushangaza ikiwa tutaihifadhi vizuri."

"Kwa swali lolote la kiholela tunaloweza fikiria?" Tom aliuliza.

"Swali lolote tunaloweza kuelezea katika SQL, dhidi ya data yoyote tuliyohifadhi katika S3."

Tom alikuwa na mwonekano wa mtu anayehesabu upya thamani ya data yote aliyokuwa akitupa.

**Muundo wa Ziwa la Data**

Huduma hizi tatu zinachanganyika kuwa kinachoitwa **muundo wa ziwa la data** — hifadhi ya S3 ya kati kwa data yako yote, yenye zana za kuishughulikia na kuiuliza:

```
Programu (maagizo, orodha, matukio)
    |
    | Matukio ya wakati halisi
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (mbichi)
                                                   |
                                                   | Mtambazaji wa Glue anagundua mpango
                                                   ↓
                                              Katalogi ya Data ya Glue
                                                   |
                                                   | Kazi za Glue zinabadilisha
                                                   ↓
                                              S3 (safi, Parquet, imepangwa)
                                                   |
                                                   | Maswali ya SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Zana za Ujasusi wa Biashara
                                       (QuickSight, Tableau, n.k.)
```

Data mbichi daima imehifadhiwa (katika ndoo ya asili ya S3). Data iliyobadilishwa inaweza kuulizwa kupitia Athena. Maswali mapya yanaweza daima kujibiwa kwa kuendesha kazi mpya za Glue kwenye data mbichi.

**Amazon Redshift: Wakati Athena Haitoshi**

Kwa matumizi fulani, Athena ni polepole sana au ghali sana:

- Maswali magumu sana yenye unganiko nyingi
- Dashibodi zinazoendeshea swali lile lile maelfu ya mara kwa siku
- Kujifunza kwa mashine kwenye data iliyoundwa
- Mahitaji ya muda wa majibu ya chini ya sekunde kwa zana za BI

**Amazon Redshift** ni ghala la data linalosimamiwa kikamilifu: hifadhidata ya uchambuzi ya nguzo iliyobunishwa kwa mzigo mkubwa, wa kurudiwa wa uchambuzi. Tofauti na Athena, ambayo inauliza data inapoishi katika S3, Redshift inapakia data kwenye uhifadhi ulioimarishwa wa ghala na kutumia uimarishaji wa maswali, mikakati ya kupanga, na mikakati ya usambazaji kuharakisha uchambuzi mgumu.

Redshift ni haraka zaidi sana kwa maswali ya uchambuzi mgumu kwa bei ya gharama (uwezo uliowekwa) na mahitaji ya kupakia data kabla ya kuuliza.

**Redshift Serverless** inaondoa mzigo wa mipango ya uwezo — unauliza, Redshift inapanua. Gharama ni kwa swali.

Kwa Nimbus kwa kiwango chao cha sasa: Athena inatosha. Kwa mara tano ya kiwango cha data na zana za BI zikiuliza dashibodi sawa mamia ya mara kwa siku, Redshift ingekuwa bora kwa gharama.

## Nguvu na Mipaka

**Kinesis Data Streams**: Tumia Kinesis data yako inafika mfululizo na mpangilio ni muhimu — utiririko wa kubonyeza, miamala ya kifedha, telemetri ya IoT. Kinesis huhifadhi mpangilio wa rekodi ndani ya kipande na kuruhusu kurudia wakati wa dirisha la uhifadhi lililosanidiwa, ambalo hufanya iwe tofauti kimsingi na SQS. Mabadiliko ni ugumu wa uendeshaji: katika hali iliyowekwa, unasimamia uwezo wa kipande na tabia ya mlaji. Kwa foleni rahisi za kazi ambapo mpangilio hauna maana na kurudia hakuhitajiki, SQS ni chaguo rahisi zaidi.

**AWS Glue**: Glue inaondoa miundombinu ya nguzo ya jadi ya ETL. Unaandika mantiki ya mabadiliko; AWS inasimamia mazingira ya Spark. Hii ina thamani mabadiliko yanapokuwa magumu au kiwango cha data ni kikubwa. Kikwazo ni gharama na kuanza baridi — kazi za Glue zina ucheleweshaji wa kuanzisha wa dakika kadhaa, ikifanya zisifae kwa mabadiliko ya karibu-wakati halisi. Kwa ubadilishaji rahisi wa umbizo la faili (CSV hadi Parquet), mzigo wa Glue unaweza kutokuwa na thamani ikilinganishwa na kitendo cha Lambda au hati nyepesi.

**Amazon Athena**: Athena inakuruhusu kuuliza data ya S3 na SQL ya kawaida na hakuna miundombinu ya kusimamia. Kikwazo muhimu ni gharama: Athena inalipia kwa terabyte ya data inayochunguzwa. Swali dhidi ya jedwali la TB 10 linaloichunguza yote linagharimu zaidi sana kuliko swali lile lile dhidi ya jedwali la Parquet lililoundwa linalochunguza GB 200. Daima tumia miundo ya nguzo (Parquet au ORC) na ugawanye data yako kabla ya kuendesha Athena katika uzalishaji. Bila uimarishaji huu, bili za Athena zinaweza kukushangaza.

## Muhtasari

- **Amazon Kinesis**: Utiririko wa data wa wakati halisi. Wazalishaji huandika rekodi; walaji husoma kwa kasi yao mwenyewe. Amazon Data Firehose inaweza kutoa data ya utiririko kwa S3, Redshift, na maeneo mengine ya lengwa yenye kazi ndogo za uendeshaji.
- **AWS Glue**: ETL na katalogi ya data. Watambazaji hugundua mpango; Kazi zinabadilisha data; Katalogi ya Data inafanya data igunduliwe na Athena na zana zingine.
- **Amazon Athena**: SQL bila seva kwenye S3. Uliza data yoyote katika S3 kwa SQL ya kawaida. Bei kwa TB inayochunguzwa — tumia Parquet na ugawanyaji kupunguza gharama.
- **Amazon Redshift**: Ghala la data linayosimamiwa kwa uchambuzi wa utendaji wa juu. Pakia data ndani, imaarishie maswali ya uchambuzi yanayorudiwa, na uliza haraka kwa kiwango cha ghala.
- Mchakato wa **ziwa la data**: data mbichi kwa S3 → Glue inabadilisha → Athena inauliza → zana za BI zinaona.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.5)*

- **Kinesis dhidi ya SQS**: Kinesis = ulioandaliwa, utiririko wa wakati halisi, walaji wengi, kurudia ndani ya dirisha la uhifadhi. SQS = foleni ya kazi, kila ujumbe unashughulikiwa mara moja. "Walaji wengi wanasoma mtiririko sawa wakati mmoja" → Kinesis. "Mfanyakazi mmoja kwa ujumbe" → SQS.
- **Ishara za mtihani za Athena**: "SQL bila seva kwenye S3," "chambua data ya S3 bila kuipakia kwenye hifadhidata," "lipa kwa swali" → Athena.
- **Uimarishaji wa gharama za Athena**: Umbizo la nguzo (Parquet au ORC) + ugawanyaji hupunguza kwa kiasi kikubwa data inayochunguzwa na gharama. Mtihani unaweza kuuliza jinsi ya kupunguza gharama za Athena.
- **Mtambazaji wa Glue**: "Gundua mpango wa data ya S3 kiotomatiki" → Mtambazaji wa Glue.
- **Amazon Data Firehose**: "Pakia kiotomatiki data ya utiririko kwa S3/Redshift/OpenSearch bila kusimamia walaji" → Amazon Data Firehose. Vifaa vya zamani bado vinaweza kuita Kinesis Data Firehose.
- **Redshift dhidi ya Athena**: Redshift kwa maswali ya mara kwa mara, magumu kwenye seti ya data iliyowekwa (dashibodi za BI). Athena kwa maswali ya hiari kwenye data ya S3 inayobadilika mara kwa mara.
- **EMR (Elastic MapReduce)**: Nguzo za Hadoop/Spark zinazosimamiwa na AWS. Mtihani unatumia hii wakati "mzigo uliopo wa Hadoop/Spark" au "mifumo ya usindikaji wa data ya kawaida" imetajwa. Glue ni mbadala unaosimamiwa kwa matumizi mengi.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya Amazon Kinesis na Amazon SQS. Ungetatumia kila moja lini?

*(Kidokezo: Fikiria jinsi walaji wengi wanaweza kusoma data sawa, kama ujumbe unafutwa baada ya kusomwa, na kama mpangilio ni muhimu.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ya kushiriki nauli inataka kuchambua data ya safari. Safari milioni 1 zinakamilika kila siku. Rekodi za safari zimehifadhiwa katika S3 kama faili za JSON (karibu 2KB kila moja). Timu ya uchambuzi inataka kuendesha maswali ya SQL ya hiari kama "muda wa wastani wa safari kwa jiji wiki iliyopita." Maswali yanapaswa kukamilika ndani ya dakika 2. Gharama za uhifadhi zinapaswa kupunguzwa. Timu itaendesha maswali 20-30 kwa wiki.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Pakia data ya safari kwenye RDS PostgreSQL kila siku; uliza kwa SQL ya kawaida  
B) Tumia AWS Glue kubadilisha JSON kuwa umbizo la Parquet lililoundwa kwa tarehe na jiji; uliza na Amazon Athena  
C) Tumia Amazon Data Firehose kutoa data ya safari kwa Amazon Redshift; uliza na Redshift  
D) Pakia data ya safari kwenye DynamoDB na utumie PartiQL kwa maswali ya SQL

**Kidokezo cha 1**: Maswali 20-30 kwa wiki ni ya mara chache. Huduma gani ni bora kwa gharama kwa kuuliza mara kwa mara?

**Kidokezo cha 2**: Umbizo la Parquet + ugawanyaji hupunguza kwa kiasi kikubwa data inayochunguzwa na Athena — na kwa hivyo gharama.

**Kidokezo cha 3**: Safari milioni 1 × 2KB = karibu 2GB kwa siku. Zaidi ya wiki, ~14GB. Kwa $5/TB kwa Athena, hata bila uimarishaji, hii inaweza kumudu.

**Jibu**: B

**Maelezo**: Glue inabadilisha JSON kuwa Parquet (umbizo la nguzo hupunguza kwa kiasi kikubwa data inayochunguzwa) lililoundwa kwa tarehe na jiji (kupunguza vifaa kunamaanisha maswali ya "wiki iliyopita" yanachunguza sehemu za siku 7 tu). Athena inauliza S3 moja kwa moja na SQL ya kawaida. Kwa maswali 20-30 kwa wiki, Athena inayolipa kwa swali ni bora sana kwa gharama dhidi ya Redshift inayoendeshwa daima.

**Kwa nini si A?** Kupakia 2GB za data kila siku kwenye RDS, kisha kuuliza, kunahitaji kipengele cha hifadhidata kinachoendesha masaa 24/7. Kwa maswali 20-30 kwa wiki, hii imezidishwa sana na ni ghali.

**Kwa nini si C?** Redshift ni bora kwa gharama kwa maswali ya mara kwa mara (mamia kwa siku kwenye seti ile ile ya data). Kwa maswali 20-30 kwa wiki, nguzo ya Redshift inayoendeshwa daima inagharimu zaidi sana kuliko bei ya kwa swali ya Athena.

**Kwa nini si D?** DynamoDB ni duka la thamani-muhimu/hati lililoboreshwa kwa ufikiaji kulingana na muhimu, si maswali ya uchambuzi wa hiari. PartiQL kwenye DynamoDB haisaidii aina ya makusanyiko ya GROUP BY yaliyoelezwa.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.5*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inataka kujenga mfumo wa ugunduzi wa udanganyifu wa wakati halisi kwa maagizo. Mfumo unapaswa:

- Gundua maagizo yaliyowekwa na akaunti ile ile zaidi ya mara 5 ndani ya sekunde 60
- Piga bendera maagizo zaidi ya $500 kutoka akaunti mpya (< siku 30 za zamani)
- Tuma maagizo yaliyopigwa bendera kwa foleni ya ukaguzi wa binadamu

Buni muundo. Kinesis inatoa nini? Mantiki ya udanganyifu inafanya kazi wapi? Unaunganisha vipi "akaunti ile ile, dirisha la sekunde 60"? Huduma gani inapokea maagizo yaliyopigwa bendera?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni muundo wa utiririko wa wakati halisi.)*

## Tukio Baada ya Mikopo

Tom aliendesha swali la kwanza la Athena.

"Migahawa 10 ya juu kwa mapato robo mwaka iliyopita," alisema.

Sekunde 12 baadaye, matokeo yalionekana.

Aliyatazama.

"Mgahawa 47 ulikuwa wa kwanza," alisema. Ulikuwa mgahawa wa familia ya Maya — ule ambao Nimbus ilianza.

"Bila shaka ulikuwa," Maya alisema. "Arepa ni hiyo nzuri."

Tom aliendesha swali lingine. Na jingine. Kila moja lilijibiwa kwa sekunde, kila moja likiwa na gharama ya sehemu ndogo za senti.

Baada ya saa moja, alikuwa na picha kamili ya biashara ya Nimbus kwa njia ambayo alikuwa nayo kamwe kabla. Kategoria za mgahawa zilizokua haraka zaidi. Makundi ya wateja yaliyohifadhiwa muda mrefu zaidi. Vipengele vya orodha vilivyoimarisha maagizo ya mara kwa mara zaidi.

"Kwa nini hatukujenga hii mapema?" aliuliza.

"Tulikuwa na data," Leo alisema. "Hatukuwa na njia ya kuitumia."

"Data ilikuwepo daima," Maya alisema kwa utulivu. "Hatukuweza kuiona tu."

Katika sura inayofuata: sasa tunaweza kuona biashara wazi, hebu tuzungumze kuhusu jinsi ya kulipa kwa miundombinu inayoiendesha — kwa ufanisi zaidi.
