# Sura ya 26: Kufanya Maana ya Kila Kitu

Tom alikuwa akitazama chapisho.

Yalikuwa makurasa mawili ya nambari: idadi za maagizo, jumla za mapato, alama za wakati, misimbo ya kanda. Alikuwa amemwomba Leo kukusanya kila kitu kinachopatikana kuhusu mifumo ya maagizo ya Ijumaa. Leo alikuwa ametumia saa moja kuandika hati iliyounganisha vyanzo vitatu tofauti vya data — DynamoDB, kumbukumbu za CloudWatch, na mauzo ya uchambuzi ya S3 — na hiki ndicho kilichotoka.

Nambari zote zilikuwepo. Hazikumwambia chochote.

Angeweza kuona kwamba maagizo 847 yalikuwa yamewekwa Ijumaa. Hakuweza kueleza yalipowekwa lini, migahawa gani ilikuwa na shughuli nyingi zaidi, au saa ya kilele ilikuwa ipi. Taarifa hiyo ilikuwa katika data. Tu haikuonekana.

---

Uboreshaji wote wa mtandao kutoka sura ya 25 ulikuwa umefanya miundombinu ya Nimbus kuwa ya haraka na ya bei nafuu zaidi. Lakini data ambayo miundombinu hiyo ilikuwa ikizalisha — katika DynamoDB, katika kumbukumbu za CloudWatch, katika mauzo ya uchambuzi ya S3 yaliyoendesha mara moja kwa usiku — ilikuwa imekaa katika maeneo matatu tofauti, katika miundo mitatu tofauti, isiyounganishwa na chochote ambacho Tom angeweza kweli kutumia.

Swali la Maya lililifanya kuwa halisi. "Wakati wetu wa shughuli nyingi zaidi wa agizo Ijumaa ni lini?"

Leo alimtazama. "Hiyo haiko kwenye dashibodi yetu."

"Tunaweza kuiongeza?"

"Data iko katika DynamoDB. Na katika kumbukumbu za CloudWatch. Na katika S3 kutoka kazi ya mauzo ya uchambuzi." Leo alisita. "Katika maeneo matatu tofauti, katika miundo mitatu tofauti."

Maya aliongeza: "Na mauzo ya uchambuzi yanaendesha mara moja tu kwa usiku. Ukitaka data ya Ijumaa, ungelazimika kusubiri hadi Jumamosi asubuhi."

Tom alitazama chapisho. "Kwa hivyo tuna data. Tu hatuwezi kuitumia."

Sentensi hiyo inaelezea nusu ya uchambuzi wa kisasa.

---

**Ubao Mweupe**

Maya alifika ofisini mapema na alikuwa tayari amejaza nusu ya ubao mweupe kufikia wakati Leo alipowasili.

Maswali saba, yaliyoandikwa katika safu mbili, yote ni maswali ya biashara, hakuna kati yao linaloweza kujibiwa kutoka dashibodi za sasa:

1. Migahawa gani ina kiwango cha juu zaidi cha ufutaji wa agizo katika siku 30 za kwanza?
2. Ni muda gani wa wastani kati ya mgahawa kupokea arifa ya agizo na kuithibitisha? Hii inatofautianaje kwa mgahawa na kwa siku ya wiki?
3. Miji gani ina kiwango cha juu zaidi cha wateja wanaoagiza tena kutoka mgahawa ule ule ndani ya siku 14?
4. Asilimia gani ya maagizo yanawekwa ndani ya kipindi cha kwanza cha programu dhidi ya vipindi vya kurudi?
5. Kategoria gani za menyu zinaendesha mapato ya juu zaidi kwa kila mgahawa?
6. Ni uwiano gani kati ya muda wa majibu wa mgahawa na kiwango cha mteja cha kuagiza tena?
7. Kiasi cha agizo kinabadilikaje katika masaa 48 kabla na baada ya mshirika wa mgahawa kuchapisha kwenye mitandao ya kijamii?

"Tunaweza kujibu yoyote kati ya haya?" aliuliza.

Leo alitazama orodha. Alitazama dashibodi ya sasa — idadi ya maagizo, jumla ya mapato, migahawa inayofanya kazi.

"Namba moja," alisema polepole. "Sehemu. Tuna rekodi za ufutaji. Lakini tungehitaji kuziunganisha na tarehe za uandikishaji wa migahawa, na hizo ziko katika mfumo tofauti."

"Namba mbili?" Tom aliuliza.

"Tunahifadhi alama ya wakati wa arifa. Tunahifadhi alama ya wakati wa uthibitisho. Ziko katika majedwali tofauti katika miundo tofauti. Tungehitaji ku-JOIN na kukokotoa delta."

"Kwa hivyo data ipo," Maya alisema.

"Data ipo," Leo alithibitisha. "Tu hatuna njia ya kuuliza katika yote."

"Subiri — lakini *kwa nini* hatuwezi tu kuuliza hifadhidata?" Maya aliuliza. "Tuna PostgreSQL. Tuna data hii yote."

"Kwa sababu data iko katika maeneo matatu," Leo alisema. "Matukio ya agizo yako katika DynamoDB. Alama za wakati za arifa ziko katika kumbukumbu za CloudWatch. Tarehe za uandikishaji ziko katika hifadhidata ya RDS PostgreSQL. Na baadhi yake — mauzo ya uchambuzi — iko katika S3 kama mafaili ya JSON ambayo hakuna aliyewahi kuyaunganisha na chochote."

Tom alitazama ubao mweupe. "Tumekuwa tukizalisha data hii kwa miezi 18," alisema. "Tumekuwa tukiruka tukiwa vipofu kwa miezi 18."

"Si vipofu," Maya alisema. "Tu wenye uoni hafifu. Tungeweza kuona kile kilichokuwa mbele yetu moja kwa moja. Hatungeweza kuona mifumo."

Hiyo ndiyo ilikuwa fremu sahihi. Pointi za data binafsi zilikuwepo. Mfumo wa kuziunganisha haukuwepo.

**Matatizo Matatu Tofauti**

Tatizo la data la Nimbus lilikuwa na vipimo vitatu:

**Utiririshaji wa wakati halisi**: Maagizo yanawekwa sasa hivi. Unataka kuona dashibodi hai ya kasi ya agizo — mangapi kwa dakika, kwa kanda, kwa mgahawa. Data inahitaji kuchakatwa inavyofika.

**Mabadiliko ya data**: Data iko katika S3 kutoka mifumo mbalimbali, katika miundo tofauti (JSON, CSV, Parquet). Kabla huwezi kuichambua, unahitaji kuirekebisha — schema sawa, umbizo sawa, iliyosafishwa, iliyounganishwa na data ya marejeo.

**Uchambuzi wa ad-hoc**: Mara data inapopangwa, unataka kuendesha maswali ya SQL dhidi yake bila kulazimika kuipakia katika hifadhidata kwanza. "Nipe migahawa 10 bora kwa mapato katika siku 30 zilizopita." Bila kupakia data katika hifadhidata.

Kila moja ya haya ni tatizo tofauti. AWS ina huduma ya kujitolea kwa kila moja.

**Mtiririko wa Wakati Halisi: Tepi ya Ticker kwa Data**

Fikiria mashine ya tepi ya ticker — aina iliyochapisha bei za hisa kwenye gurudumu la kuendelea la karatasi. Bei zilichapishwa zilipobadilika. Kila aliyetaka bei ya sasa angeweza kusoma tepi. Hakuna aliyelazimika kusubiri mtu mwingine; tepi iliendelea kuchapisha bila kujali ni watu wangapi waliokuwa wakisoma.

Huo ndio mfano wa utiririshaji wa data wa wakati halisi. Wazalishaji wanatuma data inavyotokea. Walaji wengi wanaweza kusoma mtiririko wakati mmoja, kila mmoja kwa kasi yake, kila mmoja akipata picha kamili.

**Amazon Kinesis Data Streams** ni mashine hiyo kwa Nimbus. Agizo linapowekwa, programu inachapisha tukio kwa mtiririko wa Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Walaji wa mtiririko huu:

- Dashibodi ya wakati halisi (inasoma matukio yanavyofika, inasasisha vipimo)
- Lambda ya kugundua udanganyifu (inatafuta mifumo ya agizo isiyo ya kawaida)
- Mtiririko kwa S3 kwa uhifadhi wa kudumu

**Dhana za Kinesis Data Streams**:

- **Shard**: Kitengo cha kimsingi cha uwezo. Shard moja inashughulikia kuandika 1 MB/s, kusoma 2 MB/s.
- **Kipindi cha uhifadhi**: Data inakaa katika mtiririko kwa masaa 24 (chaguo-msingi), inayoweza kupanuliwa hadi **siku 365** (mwaka 1) na Extended Data Retention.
- **Nambari ya mfuatano**: Kila rekodi ina nambari ya mfuatano. Walaji wanafuatilia nafasi yao katika mtiririko.

**Amazon Data Firehose** (zamani **Kinesis Data Firehose**): Huduma ya utoaji inayosimamiwa kati ya wazalishaji wa utiririshaji na malengo kama S3, Redshift, na OpenSearch. Inahifadhi kwenye buffer, inabana, inabadilisha, na kutoa data kiotomatiki.

Kwa Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (umbizo la Parquet, iliyobanwa, iliyogawanywa kwa tarehe).

"Tayari niliiweka — oh." Leo alikuwa ameweka idadi ya shard kuwa moja bila kukokotoa uendeshaji wa kuandika kwanza. Kwa kiasi cha agizo cha Nimbus, shard moja ilikuwa sawa. Alithibitisha hili kabla mtu hajaona alikuwa amekisia.

**Mfasiri: Kufanya Maana ya Data Mbichi**

Data katika S3 ni mbichi. Kabla huwezi kuichambua kwa ufanisi, unahitaji kugundua kilichopo, kuibadilisha kuwa umbizo thabiti, kuunganisha seti tofauti za data pamoja, na kushughulikia rekodi mbaya na thamani zinazokosekana.

Hiyo ni kazi kwa tabaka la kujitolea la kufasiri.

**AWS Glue** ni huduma ya ETL (Extract, Transform, Load) inayosimamiwa kikamilifu. Ina vipengele viwili vikuu:

**Glue Data Catalog**: Hifadhi ya metadata inayoelezea data yako ya S3 — majedwali gani yapo, safuwima gani yana, mafaili ya data yako wapi. Ni kama katalogi ya kadi kwa ziwa lako la data.

**Glue Crawlers**: Wakala wa kiotomatiki wanaochanganua S3, kuhitimisha schema, na kujaza Data Catalog. Endesha crawler kwenye ndoo yako ya S3 na dakika 10 baadaye una katalogi ya majedwali yako yote.

**Glue Jobs**: Kazi za Spark/Python za bila seva zinazofanya mabadiliko halisi. Unaandika mantiki ya mabadiliko (au unatumia zana ya ETL ya kuonekana ya Glue), na Glue inaiendesha kwenye miundombinu inayosimamiwa.

Kwa Nimbus:

1. Glue Crawler inachanganua data ya maagizo katika S3 → inaunda ufafanuzi wa jedwali katika Glue Data Catalog
2. Glue Job inabadilisha matukio mbichi ya agizo ya JSON kuwa umbizo safi la Parquet lililogawanywa
3. Data iliyobadilishwa inaandikwa tena kwa S3 katika muundo ulioboreshwa kwa hoja

**Wakati ETL Inavunjika: Tatizo la Mageuko ya Schema**

Bomba la Glue liliendesha kwa usafi kwa wiki tatu za kwanza. Kisha mshirika wa mgahawa #412 aliongeza sehemu mpya kwenye mauzo yao ya menyu: `allergen_tags`. Sehemu ilikuwa safu ya nyuzi — `["gluten", "dairy", "nuts"]` — na ilionekana katika mauzo ya data ya usiku ya mgahawa.

Schema ya Glue job ilikuwa kali. Ilikuwa imeandikwa kutarajia sehemu mahususi katika JSON ya agizo. Ilipokutana na `allergen_tags` — sehemu isiyokuwa katika schema — Glue job ilishindwa.

Masaa sita ya data ya agizo kutoka migahawa 47 (yote ikitumia umbizo lile lile la mauzo ya menyu kama mshirika #412) yalijikusanya katika S3 bila kuchakatwa. Utekelezaji wa Glue wa usiku uliopaswa kufanya maagizo ya jana usiku kuwa ya kuulizika ifikapo asubuhi badala yake ulisimama saa 8:47 alfajiri na kuandika rekodi ya kushindwa kwa CloudWatch.

Tom aliipata alipojaribu kuendesha hoja ya Athena saa 3 asubuhi na akapata `0 rows returned` kwa masaa 12 yaliyopita.

"ETL ilivunjika kwa sababu data ya chanzo ilibadilika?" Maya aliuliza, Leo alipoeleza kilichotokea.

"ETL ilivunjika kwa sababu ETL haikujua jinsi ya kushughulikia mabadiliko ya schema," Leo alisema. "Tuliandika kazi kali iliyotarajia haswa sehemu hizi. Sehemu mpya ilipoonekana, ilishtuka."

"Na je, ikiwa mtu atajaribu kuvunja kupitia mabadiliko ya schema?" Priya aliuliza. "Mshirika wa mgahawa mwenye nia mbaya akiwasilisha kwa makusudi sehemu zisizotarajiwa kuvunja bomba?"

Swali lilistahili kufikiriwa. Bomba la ETL linalovunjika kwa ingizo lisilotarajiwa ni njia ya kunyimwa huduma: wasilisha umbizo la data lisilo la kawaida, vunja bomba, na mgahawa huo (na wengine wote wanaoshiriki umbizo) wanaacha kuchakatwa.

Marekebisho yalikuwa na sehemu mbili:

**Mageuko ya schema ya Glue**: DynamicFrame ya Glue inasaidia mageuko ya schema — sehemu zisizokuwa katika schema iliyotarajiwa zinapitishwa badala ya kusababisha kushindwa. Wezesha kwa kutumia DynamicFrames badala ya DataFrames katika hati ya kazi, na `mergeSchema` ikiwekwa katika chaguo za ziada. Sehemu mpya zinaongezwa kwenye schema kiotomatiki katika utekelezaji unaofuata wa crawler.

```python
# Kabla (kali, inavunjika kwa sehemu mpya)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Baada (mageuko ya schema yamewezeshwa)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Tahadhari ya Glue job**: Kushindwa kwa bomba kulikuwa kimya kwa karibu masaa sita kabla Tom hajaona. Kengele ya CloudWatch kwenye hali ya utekelezaji wa Glue job (`FAILED`) ingemwonya mhandisi wa zamu ndani ya dakika 5. Gharama ya kengele: senti kumi kwa mwezi — kwa kweli bure (metriki yenyewe haigharimu kitu, na kengele kumi za kwanza ziko chini ya tabaka la bure).

"Masaa sita ya data yalikaa bila kuchakatwa katika S3," Leo alisema, baada ya kuendesha tena Glue job kwa mkono kufikia. "Hakuna kilichopotea — lakini uchambuzi ulikuwa nyuma kiasi hicho. Kama tungekuwa na kengele, ucheleweshaji ungekuwa dakika 30."

Somo pana: mabomba ya ETL yanayochakata data ya nje yanahitaji kushughulikia mabadiliko ya schema kwa adabu. Washirika wa nje — migahawa, watoa huduma wa malipo, huduma za uwasilishaji — watabadilisha miundo yao ya data. Bomba lazima lisiwe brittle kwa mabadiliko hayo.

**Tabaka la Hoja: SQL Moja kwa Moja kwenye S3**

Sasa data ilikuwa katika S3, katika umbizo la Parquet, iliyogawanywa kwa tarehe. Kipande cha mwisho: njia ya kuuliza maswali yake bila kuipakia katika hifadhidata kwanza.

**Amazon Athena** ni huduma ya hoja ya bila seva, ya kuingiliana inayoendesha maswali ya SQL moja kwa moja kwenye data ya S3. Hakuna hifadhidata ya kuandaa, hakuna data ya kupakia. Unafafanua jedwali (au unatumia Glue Data Catalog), unaandika SQL, na Athena inatekeleza hoja dhidi ya mafaili ya S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

Bei za Athena zinategemea ni data ngapi hoja inachanganua. Katika us-east-1, us-west-2, na kanda nyingi kuu, maswali ya kawaida ya SQL yanagharimu $5 kwa terabyte iliyochanganuliwa. Kutumia umbizo la Parquet (la safuwima) na kukata kwa kizigeu (`WHERE year='2024' AND month='09'`) kunamaanisha Athena inachanganua tu mafaili inayohitaji, ambayo inapunguza gharama kwa kiasi kikubwa.

"Tunaweza kuendesha hoja hii kwa siku 30 za data," Leo alisema, "na inaweza kugharimu kidogo kwa kushangaza ikiwa tutaihifadhi vizuri."

"Inawezaje kugharimu kidogo hivyo?" Maya aliuliza. "Ikiwa inachanganua terabytes za data, hiyo si ghali vipi?"

Leo alieleza Parquet. Katika umbizo linalotegemea safu (JSON, CSV), hoja inayotafuta safuwima mbili kati ya ishirini inalazimika kusoma zote ishirini. Katika umbizo la safuwima kama Parquet, inasoma tu mbili inazohitaji. Kwa seti ya data ya 50TB, hoja iliyoboreshwa vizuri inaweza kuchanganua 200GB. Kwa $5/TB, hiyo ni dola moja.

"Na je, ikiwa mtu atauliza jedwali zima kwa bahati mbaya?" Maya alibonyeza.

"Hiyo ndiyo hatari halisi ya gharama," Leo alisema.

Unaweza kuwa unajiuliza: ikiwa Athena inalipisha kwa terabyte iliyochanganuliwa, je, hoja moja iliyoandikwa vibaya ingeweza kuzalisha bili kubwa isiyotarajiwa? Ndiyo — na hili linatokea katika mazingira halisi ya uzalishaji. Hoja dhidi ya jedwali la 50TB lisiloboreshwa inaweza kugharimu zaidi ya bili yako yote ya kila mwezi ya S3. Hii ndiyo sababu umbizo la Parquet na kugawanya si maboresho ya hiari — ni udhibiti wa gharama. Athena pia inasaidia vikomo vya uchanganuzi wa hoja vya workgroup vinavyoweka kikomo cha data ngapi hoja moja inaruhusiwa kuchanganua.

"Kwa swali lolote la kiholela tunaloweza kufikiria?" Tom aliuliza.

"Swali lolote tunaloweza kueleza kwa SQL, dhidi ya data yoyote tuliyohifadhi katika S3."

Tom alikaa kwenye kompyuta ya mkononi ya Leo na akaandika hoja ya kwanza:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

Hoja iliendesha kwa sekunde 11. Matokeo: migahawa 20, iliyopangwa kwa muda wa wastani wa uthibitisho wa haraka zaidi, na viwango vyao vya kuagiza tena pembeni.

Tom alitazama matokeo.

Migahawa ya kuthibitisha haraka zaidi — ile iliyokubali na kuthibitisha maagizo ndani ya wastani wa dakika 3-4 — ilikuwa na kiwango cha wastani cha kuagiza tena cha 41%. Migahawa ya kuthibitisha polepole zaidi (muda wa wastani wa uthibitisho dakika 18-22) ilikuwa na kiwango cha kuagiza tena cha 13%.

"Migahawa inayothibitisha haraka inapata biashara ya kurudia mara tatu," Tom alisema.

"Hilo ni pengo kubwa," Maya alisema. "Kwa nini kasi ya uthibitisho ingeathiri kiwango cha kuagiza tena sana hivyo?"

"Kwa sababu mteja aliweka agizo na kisha akakaa pale akitazama simu yake," Leo alisema. "Ikiwa uthibitisho unakuja katika dakika 3, anajisikia na uhakika. Ikiwa unakuja katika dakika 22 — au kamwe — anajisikia na wasiwasi. Wasiwasi ndio kushindwa kwa bidhaa, hata kama chakula kinawasili vizuri."

"Hii ni maarifa ya bidhaa," Maya alisema. "Si maarifa ya uchambuzi tu. Tunapaswa kuwaonyesha migahawa kipimo chao cha muda wa uthibitisho ikilinganishwa na wastani wa kategoria."

Hoja ya Athena ilikuwa imechanganua GB 1.2 za data (miezi miwili ya maagizo katika umbizo la Parquet, iliyogawanywa kwa mwaka na mwezi). Gharama: $0.006.

Nusu senti. Kwa maarifa ya biashara yaliyobadilisha jinsi Nimbus ingebuni uandikishaji wa mgahawa — migahawa gani ya kupa kipaumbele kwa ukocha wa mafanikio, malengo gani ya muda wa uthibitisho ya kuweka kama sehemu ya SLA za washirika.

Tom alikuwa na sura ya mtu anayekokotoa upya thamani ya data yote waliyokuwa wakiitupa.

"Na je, ikiwa mtu atajaribu kuvunja kupitia tabaka la hoja?" Priya aliuliza. "Au tu mchambuzi anayetoa kwa bahati mbaya anwani za wateja kutoka data mbichi ya agizo? PII ya mteja, historia za agizo, rekodi za kifedha — nani anadhibiti ni majedwali yapi yanaonekana hata?"

Kabla hajamaliza swali, Leo pia alikuwa ametambua tatizo la uendeshaji: unazuiaje timu moja kuendesha uchanganuzi wa jedwali-zima wa janga unaozalisha bili ya Athena ya $500 katika hoja moja?

**Athena Workgroups** zinatatua matatizo yote mawili kwa wakati mmoja.

Workgroup ni usanidi wenye jina unaopanga watumiaji wa Athena na kutumia mipangilio inayoshirikiwa: eneo la matokeo ya hoja, usimbaji fiche, na — kwa muhimu — vikomo vya uchanganuzi wa data kwa kila hoja.

```
Workgroup: analytics-team
  Query scan limit: 10 GB per query
  Action on limit exceeded: Cancel query

Workgroup: engineering-team
  Query scan limit: 100 GB per query
  Action on limit exceeded: Warn only

Workgroup: finance-reports
  Query scan limit: 1 GB per query
  Action on limit exceeded: Cancel query
```

Mchambuzi kwenye workgroup ya `analytics-team` hawezi kuchanganua 50TB za data kwa bahati mbaya na kuzalisha ada ya Athena ya $250. Hoja inafutwa inapozidi 10GB za data iliyochanganuliwa. Mchambuzi anaona ujumbe wa hitilafu na anajua wanahitaji kuongeza kichujio cha kizigeu.

Workgroups pia zinatekeleza maeneo tofauti ya matokeo kwa kila timu: matokeo ya hoja ya timu ya uhandisi yanaenda `s3://nimbus-query-results/engineering/`; matokeo ya timu ya fedha yanaenda `s3://nimbus-query-results/finance/`. Hakuna ufikiaji wa matokeo ya hoja kati ya timu.

IAM inadhibiti ni watumiaji wapi wanaweza kutumia workgroup ipi. Kitendo cha Lambda kinachoendesha ripoti za kiotomatiki kinatumia workgroup ya `finance-reports` (yenye kikomo kikali). Mhandisi anayetatua suala la uzalishaji anatumia workgroup ya `engineering-team` (kikomo pana, onya si futa). Ufikiaji wa jedwali la matukio mbichi (lenye PII ya mteja) umezuiwa kwa workgroup ya `engineering-team` kupitia sharti la IAM kwenye jedwali la Glue Data Catalog.

"Hiyo si udhibiti wa gharama tu," Priya alisema. "Ni udhibiti wa ufikiaji. Workgroups ni hatua ya utekelezaji."

Lilijibu swali lake kikamilifu. Kila mjadala wa bomba la data unaoruka udhibiti wa ufikiaji hatimaye unakuwa tukio la uzingatifu — na hapa, timu ya uchambuzi iliona tu majedwali ya agizo yaliyokusanywa, wakati matukio mbichi yenye PII ya mteja yalibaki nyuma ya idhini wazi ya IAM. Glue Data Catalog haikuwa orodha ya schema tu. Ilikuwa mpaka wa udhibiti wa ufikiaji.

"Hiyo si kazi ya ziada," Priya alisema. "Hiyo ndiyo muundo."

**Usanifu wa Ziwa la Data**

Huduma hizi tatu zinaungana kuwa kile kinachoitwa **usanifu wa ziwa la data** — hifadhi kuu ya S3 kwa data yako yote, na zana za kuichakata na kuiuliza:

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
```

Data mbichi daima imehifadhiwa (katika ndoo ya asili ya S3). Data iliyobadilishwa inaweza kuulizwa kupitia Athena. Maswali mapya daima yanaweza kujibiwa kwa kuendesha Glue jobs mpya kwenye data mbichi.

**Amazon Redshift: Wakati Athena Haitoshi**

Kwa baadhi ya matumizi, Athena ni polepole sana au ghali sana:

- Maswali magumu sana yenye JOINs nyingi
- Dashibodi zinazoendesha hoja ile ile maelfu ya mara kwa siku
- Ujifunzaji wa mashine kwenye data iliyopangwa
- Mahitaji ya muda wa majibu wa chini-ya-sekunde kwa zana za BI

**Amazon Redshift** ni ghala la data linalosimamiwa kikamilifu: hifadhidata ya uchambuzi ya safuwima iliyobuniwa kwa mzigo mkubwa, unaorudiwa wa uchambuzi. Tofauti na Athena, inayouliza data ilipo katika S3, Redshift inapakia data katika uhifadhi wa ghala ulioboreshwa na inatumia uboreshaji wa hoja, mikakati ya kupanga, na mikakati ya usambazaji kuharakisha uchambuzi mgumu.

Ikiwa kiasi chako cha data ni kidogo na hoja zako zinaendesha mara chache (kila wiki au kila mwezi), Athena na data ya S3 iliyopangwa vizuri inatosha na ni karibu bure — lakini ikiwa unaendesha dashibodi zile zile za uchambuzi mamia ya mara kwa siku, uhifadhi wa safuwima ulioboreshwa-awali wa Redshift utakuwa wa haraka na hatimaye wa gharama nafuu zaidi, licha ya kuhitaji data kupakiwa mapema.

Redshift ni ya haraka zaidi kwa kiasi kikubwa kwa maswali magumu ya uchambuzi kwa gharama ya gharama (uwezo uliotolewa) na sharti la kupakia data kabla ya kuuliza.

**Redshift Serverless** inaondoa mzigo wa upangaji wa uwezo — unauliza, Redshift inapanua. Gharama inategemea uwezo wa kompyuta uliotumika kweli, unaopimwa kwa **RPU-saa** na unaolipishwa kwa sekunde (na kima cha chini cha sekunde 60 kwa kila uamilisho), pamoja na uhifadhi unaosimamiwa kwa GB-mwezi — na hakuna kwa kompyuta wakati ghala likikaa bila kufanya kazi. (Athena ndiyo inayolipishwa kwa kila hoja: $5 kwa TB iliyochanganuliwa.)

Kwa Nimbus katika kiwango chao cha sasa: Athena inatosha. Kwa mara tano ya kiasi cha data na zana za BI zikiuliza dashibodi zile zile mamia ya mara kwa siku, Redshift ingekuwa ya gharama nafuu.

**Wakati Athena ni Zana Isiyo Sahihi**

"Kwa hivyo kuna nini cha kuvizia?" Maya aliuliza. "Kwa nini tusitumie Athena kwa kila kitu? Ni ya bila seva, lipa kwa hoja, hakuna miundombinu — inasikika kamili."

Kesi ambapo Athena si jibu sahihi:

**Dashibodi za marudio ya juu**: Dashibodi ya uchambuzi inayomwelekea mteja inayosasishwa kila sekunde 30 na kuendesha hoja 50 kwa dakika si matumizi mazuri ya Athena. Kwa $5/TB iliyochanganuliwa, hoja hizo zinahitaji kuboreshwa sana ili kuwa za gharama nafuu kwa marudio hayo. Redshift au hifadhidata iliyokusanywa-awali (hata RDS) inafaa zaidi kwa dashibodi zenye mahitaji ya muda wa majibu wa chini-ya-sekunde.

**Maswali ya uendeshaji yenye mahitaji ya latency ya chini**: Ikiwa wakala wa huduma kwa wateja anahitaji kutafuta agizo mahususi chini ya 500ms, Athena si zana — utafutaji wa DynamoDB au hoja ya RDS ni. Athena imeboreshwa kwa uendeshaji wa uchambuzi, si latency ya uendeshaji. Hata hoja ya Athena iliyorekebishwa vizuri kwenye seti ndogo ya data ina gharama ya juu ya kuanza baridi ya sekunde 1-3.

**Mifumo ya miamala**: Athena ni ya kusoma-tu. Huwezi INSERT, UPDATE, au DELETE rekodi katika Athena (isipokuwa kupitia muunganiko mahususi kama Lake Formation au umbizo la jedwali la Iceberg, ambazo zina ugumu wao). Kwa mzigo wa kuandika wa uendeshaji, tumia hifadhidata ya miamala.

**Seti ndogo sana, zinazobadilika mara kwa mara za data**: Ikiwa seti yako ya data inabadilika kila dakika na ni 1GB tu, kuipakia katika RDS au DynamoDB na kuuliza hapo ni rahisi na ya haraka zaidi kuliko kuendesha hoja za Athena dhidi ya mafaili ya S3 yanayoweza kuwa ya zamani. Athena inauliza mafaili ya S3 kama-yalivyo wakati wa hoja — ikiwa mafaili yaliandikwa dakika 2 zilizopita, hiyo ndiyo upya unaopata.

Muundo unaojitokeza: Athena ni bora kwa hoja za uchambuzi za kiwango kikubwa, za mara chache, za ad-hoc dhidi ya data ya S3. Kwa chochote cha uendeshaji, cha miamala, au kinachohitaji latency ya chini-ya-sekunde, tumia hifadhidata ya uendeshaji inayofaa.

**Kinesis dhidi ya SQS: Kufafanua Kuchanganyikiwa**

Hili ni swali linalojitokeza katika kila mjadala wa usanifu wa data. Kinesis na SQS zote zinashughulika na ujumbe. Lini unatumia kila moja?

Kuchanganyikiwa kunatoka kwa kufanana kwa kiwango cha juu: zote zinakubali ujumbe kutoka wazalishaji. Zote zinatoa ujumbe huo kwa walaji. Zote ni huduma za AWS zinazosimamiwa. Lakini modeli zao za data ni tofauti kabisa.

**SQS (Simple Queue Service)** ni foleni ya kazi. Unaweka ujumbe ndani. Mlaji mmoja anauchukua na kuushughulikia. Usindikaji unapokamilika, ujumbe unafutwa. Ikiwa una walaji kumi, kila ujumbe unaenda kwa mmoja tu wao. Ujumbe umekwisha baada ya kuliwa.

**Kinesis Data Streams** ni kumbukumbu. Unaweka rekodi ndani. Kila mlaji anasoma kila rekodi. Mlaji A anasoma zote. Mlaji B pia anasoma zote, kwa kasi yake. Hakuna mlaji anayefuta rekodi — inakaa katika mtiririko hadi kipindi cha uhifadhi kiishe. Unaweza kuongeza mlaji wa tatu wakati wowote, na anaweza kusoma kutoka mwanzo wa mtiririko (ndani ya dirisha la uhifadhi).

"Lini ungetaka kweli kila mlaji aone kila ujumbe?" Maya aliuliza.

Jibu ni matumizi ambapo Kinesis inang'aa:

**Dashibodi ya wakati halisi + kugundua udanganyifu + hifadhi ya S3**: Vyote vitatu vinaliwa mtiririko ule ule wa matukio ya agizo kwa wakati mmoja. Ukitumia SQS, ungehitaji kuchapisha kwa foleni tatu tofauti — na yeyote anayechapisha lazima ajue kuhusu walaji wote watatu. Kwa Kinesis, mzalishaji anachapisha mara moja; idadi yoyote ya walaji wanaweza kusoma kwa kujitegemea.

**Kucheza tena (Replay)**: Mlaji anashindwa kwa masaa 2 (kikomo cha wakati mmoja cha Lambda kimefikiwa, huduma ya chini iko chini). Kwa SQS, ujumbe huo ulikuwa tayari umefutwa (au una muda wa kutoweka uliofafanuliwa). Kwa Kinesis, mlaji anaendelea kutoka kituo chake cha mwisho na anachakata masaa 2 ya rekodi zilizokosekana. Data ilihifadhiwa katika mtiririko (hadi siku 365 na Extended Data Retention).

**Mpangilio ndani ya shard**: Rekodi zenye ufunguo ule ule wa kizigeu daima zinaenda kwa shard ile ile, zikihifadhi mpangilio. Kwa mfumo wa biashara ya hisa ambapo unahitaji biashara zote za alama `AMZN` kuchakatwa kwa mfuatano, Kinesis inahakikisha hili. SQS FIFO inatoa mpangilio kwa kila kundi lakini kwa uendeshaji wa chini (hadi ujumbe 3,000/sekunde kwa kila foleni na kutungisha kwa pamoja katika hali ya kawaida — modi ya uendeshaji wa juu inainua hili hadi makumi ya maelfu — dhidi ya Kinesis ya 1 MB/s au rekodi 1,000/s kwa kila shard, ikizidishwa kwa shards nyingi kadiri unavyohitaji).

Swali la maamuzi: **Je, kila ujumbe unahitaji kuliwa na mlaji mmoja tu na kisha kutupwa?** → SQS. **Je, kila ujumbe unahitaji kuonekana na walaji wengi kwa kujitegemea, au unahitaji uwezo wa kucheza tena?** → Kinesis.

Kwa dashibodi ya wakati halisi ya Nimbus: Kinesis. Walaji wengi (dashibodi, kugundua udanganyifu, hifadhi ya S3) wote wakisoma mtiririko ule ule.

Kwa foleni ya usindikaji wa agizo ya Nimbus (agizo limewekwa → kazi moja ya ECS inaushughulikia): SQS. Mlaji mmoja, hakuna kucheza tena kunakohitajika, hakuna fan-out inayohitajika.

## Kuonyesha Data: Amazon QuickSight

Athena inauliza data. Glue inaiandaa. Lakini wakati fulani mtu anahitaji kuona chati — na si kwa kuendesha hoja za SQL kwenye dashibodi.

"Je, tunahitaji kweli huduma nyingine kwa hilo?" Maya aliuliza. "Siwezi tu kutoa matokeo ya Athena kwa lahajedwali?"

"Kwa hoja moja, ndiyo," Tom alisema. Alikuwa na sura ya mtu aliyekwisha jaribu hili. "Kwa dashibodi unayotaka kushiriki na timu nzima, hiyo ni lahajedwali mpya kila asubuhi."

**Amazon QuickSight** ni huduma ya akili ya biashara (BI) inayosimamiwa ya AWS. Inaunganisha moja kwa moja na Athena, S3, RDS, Redshift, na vyanzo vingine, na inakuruhusu kujenga dashibodi na taswira bila seva tofauti ya BI.

Vipengele muhimu:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): QuickSight inaweza kuingiza seti za data katika injini yake ya kumbukumbu kwa utendaji wa hoja wa chini-ya-sekunde kwa kiwango, bila kuuliza tena Athena kwa kila upakiaji wa dashibodi
- **ML Insights:** kugundua hitilafu na utabiri kuliojengwa ndani — hakuna sayansi ya data inayohitajika
- **Dashibodi zilizopachikwa:** unaweza kupachika dashibodi za QuickSight katika programu yako mwenyewe ya wavuti kupitia URL

Tom aliunganisha QuickSight na chanzo cha data cha Athena na alikuwa na dashibodi inayofanya kazi ikionyesha maagizo ya kila siku, mapato kwa mgahawa, na faneli ya ubadilishaji ndani ya alasiri.

"Inagharimu kiasi gani kwa mwezi?" aliuliza — kisha akajibu swali lake mwenyewe kabla mtu mwingine. "QuickSight inaendesha karibu $24/mwezi kwa kila mwandishi — watu wanaojenga dashibodi — na $3/mwezi kwa kila msomaji. Tuna watu wanne ambao wangeitumia."

"Kwa hivyo karibu dola mia moja kwa mwezi," Maya alisema.

"Kwa huduma ya BI ambayo vinginevyo ingehitaji kuendesha seva tofauti ya uchambuzi," Priya alisema. "Ndiyo."

Tom alichapisha dashibodi. Asubuhi iliyofuata, badala ya kuendesha hoja za Athena, timu nzima ilifungua URL.

> **Kidokezo cha Mtihani — QuickSight**
>
> QuickSight ni huduma ya BI na taswira inayosimamiwa ya AWS. Inaunganisha na Athena, S3, Redshift, RDS. SPICE ni injini ya hoja ya kumbukumbu inayoharakisha hoja za dashibodi zinazorudiwa. Kichocheo cha mtihani: "dashibodi ya akili ya biashara kwenye AWS" au "onyesha data kutoka Athena/Redshift" → QuickSight.

## Kutawala Ziwa: AWS Lake Formation

Ziwa la data la Nimbus lilipokua, ufikiaji wa data ukawa tatizo la utawala.

"Nani anaweza kuuliza kumbukumbu mbichi za miamala?" Priya aliuliza, katika ukaguzi wa usanifu uliofuata. "Nani anaweza kuona PII ya mteja? Nani anaweza kufikia majedwali ya muhtasari wa kifedha?"

"Uhandisi una ufikiaji kamili," Leo alisema. "Timu ya uchambuzi ina ufikiaji kwa majedwali yaliyokusanywa. Fedha ina ufikiaji kwa majedwali ya mapato."

"Imesanidiwa wapi?"

Leo alisita. "Katika... maeneo machache tofauti. Sera za ndoo za S3, sera za IAM, ruhusa za katalogi za Glue."

"Mifumo mitatu tofauti, yote inayolazimika kuwa thabiti," Priya alisema. "Kinachotokea tunapoongeza mchambuzi mpya? Au tunapoamua kuzuia ufikiaji wa safuwima mahususi — tuseme, nambari za simu za wateja — kutoka kwa timu ya uchambuzi?"

Swali hilo lilifichua pengo. Kusimamia ufikiaji wa data wa kina katika sera za ndoo za S3, IAM, na Glue Data Catalog kwa wakati mmoja kulikuwa brittle.

**AWS Lake Formation** ni huduma inayosimamiwa inayoweka kati udhibiti wa ufikiaji kwa ziwa lako la data. Badala ya kusimamia sera za ndoo, sera za IAM, na ruhusa za katalogi za Glue kando, Lake Formation inatoa mahali pamoja pa kutoa ruhusa za kiwango cha safuwima, kiwango cha safu, na kiwango cha jedwali kwenye data yako.

Vipengele muhimu:

- Inakaa juu ya S3 na Glue Data Catalog — hakuna uhamiaji wa data unaohitajika
- **Udhibiti wa ufikiaji wa kina:** toa watumiaji au majukumu mahususi ufikiaji kwa majedwali, safuwima, au hata safu zilizochujwa mahususi — sawa na ruhusa za kiwango cha hifadhidata kwenye data ya S3
- **Kuchuja data:** mtumiaji anapouliza jedwali linalotawaliwa na Lake Formation kupitia Athena, Lake Formation inachuja kiotomatiki safuwima au safu wasizoruhusiwa kuona

Priya aliweka Lake Formation na tabaka tatu za ruhusa, na Rafael akiandaa sheria za kiwango cha safuwima: jukumu la uhandisi liliona majedwali yote na safuwima zote. Jukumu la uchambuzi liliona majedwali ya agizo yaliyokusanywa lakini si safuwima za PII ya mteja. Jukumu la fedha liliona majedwali ya mapato yenye vitambulisho vya wateja vilivyofichwa.

"Kwa hivyo mchambuzi anaendesha hoja ile ile ya Athena," Leo alithibitisha. "Lakini Lake Formation inaikamata na inaondoa safuwima ambazo hawajaidhinishwa kuona?"

"Sahihi. Kuchuja ni kiotomatiki. Mchambuzi hahitaji kujua kunafanyika — na hawawezi kuzunguka kwa kuuliza mafaili mbichi ya S3 moja kwa moja, kwa sababu Lake Formation inadhibiti ufikiaji katika kiwango cha katalogi."

"Hiyo si kazi ya ziada," Priya alisema. "Hiyo ndiyo muundo."

> **Kidokezo cha Mtihani — Lake Formation**
>
> Lake Formation inaweka kati udhibiti wa ufikiaji kwa ziwa la data lililojengwa kwenye S3 na Glue Data Catalog. Inasaidia ruhusa za kina katika kiwango cha jedwali, safuwima, na safu. Kichocheo cha mtihani: "zuia ufikiaji wa safuwima mahususi katika ziwa la data la S3" au "weka kati utawala wa ziwa la data" → Lake Formation. Tofauti muhimu na IAM ghafi: Lake Formation inatekeleza kuchuja kwa kiwango cha safuwima na safu ambacho sera za IAM peke yake haziwezi kueleza.

## Nguvu na Mipaka

**Kinesis Data Streams**: Tumia Kinesis wakati data yako inafika kwa kuendelea na mpangilio unajalisha — clickstreams, miamala ya kifedha, telemetria ya IoT. Kinesis inahifadhi mpangilio wa rekodi ndani ya shard na inaruhusu kucheza tena wakati wa dirisha la uhifadhi lililosanidiwa (masaa 24 kwa chaguo-msingi, hadi siku 365 na Extended Data Retention), ambayo inaifanya kuwa tofauti kabisa na SQS. Biashara ya mbadala ni ugumu wa uendeshaji: katika hali iliyotolewa, unasimamia uwezo wa shard na tabia ya mlaji. Kwa foleni rahisi za kazi ambapo mpangilio haujalishi na kucheza tena hakuhitajiki, SQS ni chaguo rahisi zaidi.

**AWS Glue**: Glue inaondoa miundombinu ya nguzo ya jadi ya ETL. Unaandika mantiki ya kubadilisha; AWS inasimamia mazingira ya Spark. Hii ni ya thamani wakati mabadiliko ni magumu au kiasi cha data ni kikubwa. Kikwazo ni gharama na kuanza baridi — Glue jobs zina ucheleweshaji wa kuanza wa dakika kadhaa, ukizifanya zisifae kwa mabadiliko ya karibu-wakati-halisi. Kwa ubadilishaji rahisi wa umbizo la faili (CSV hadi Parquet), gharama ya juu ya Glue inaweza isistahili ikilinganishwa na kitendo cha Lambda au hati nyepesi.

**Amazon Athena**: Athena inakuruhusu kuuliza data ya S3 na SQL ya kawaida na hakuna miundombinu ya kusimamia. Kizuizi muhimu ni gharama: Athena inalipisha kwa terabyte ya data iliyochanganuliwa. Hoja dhidi ya jedwali la 10 TB inayochanganua kitu kizima inagharimu zaidi sana kuliko hoja ile ile dhidi ya jedwali la umbizo la Parquet, lililogawanywa linalochanganua 200 GB. Daima tumia miundo ya safuwima (Parquet au ORC) na ugawanye data yako kabla ya kuendesha Athena katika uzalishaji. Bila maboresho haya, bili za Athena zinaweza kukushangaza.

## Muhtasari

Kazi ya mtandao katika sura ya 25 ilifanya bomba la data la Nimbus liwezekane. Sura hii ndiyo bomba hilo linafanya kwa nini: kufanya data yote ambayo Nimbus imekuwa ikizalisha kweli kuonekana na kutekelezeka.

- **Amazon Kinesis**: Utiririshaji wa data wa wakati halisi. Wazalishaji wanaandika rekodi; walaji wanasoma kwa kasi yao. Amazon Data Firehose kisha inaweza kutoa data ya utiririshaji kwa S3, Redshift, na malengo mengine kwa kazi ndogo ya uendeshaji.
- **AWS Glue**: ETL na kuorodhesha data. Crawlers zinagundua schema; Jobs zinabadilisha data; Data Catalog inafanya data kupatikana na Athena na zana zingine.
- **Amazon Athena**: SQL ya bila seva kwenye S3. Uliza data yoyote katika S3 ukitumia SQL ya kawaida. Inalipishwa kwa TB iliyochanganuliwa — tumia Parquet na kugawanya kupunguza gharama.
- **Amazon Redshift**: Ghala la data linalosimamiwa kwa uchambuzi wa utendaji wa juu. Pakia data ndani, boresha kwa hoja za uchambuzi zinazorudiwa, na uliza kwa haraka kwa kiwango cha ghala.
- **Muundo wa ziwa la data**: data mbichi kwa S3 → Glue inaibadilisha → Athena inaiuliza → zana za BI zinaionyesha.
- **Mageuko ya schema ya Glue**: Mabomba ya ETL yanayochakata data ya nje lazima yashughulikie mabadiliko ya schema kwa adabu. Tumia DynamicFrames na `mergeSchema: true` kuepuka kushindwa kwa bomba wakati data ya juu inaongeza sehemu mpya.
- **Athena Workgroups**: vikomo vya uchanganuzi wa data na maeneo ya matokeo kwa kila timu. Udhibiti wa gharama na udhibiti wa ufikiaji katika usanidi mmoja. Inahitajika kwa usambazaji wowote wa Athena wa timu nyingi.
- **Kinesis dhidi ya SQS**: Kinesis kwa fan-out kwa walaji wengi na uwezo wa kucheza tena. SQS Standard kwa foleni rahisi za kazi; SQS FIFO kwa usindikaji wa kazi wenye mpangilio, usio na nakala. Swali la maamuzi: je, kila mlaji anahitaji kuona kila ujumbe, au kila ujumbe unaenda kwa mlaji mmoja?
- **Wakati Athena ni isiyo sahihi**: dashibodi za marudio ya juu (tumia Redshift), maswali ya uendeshaji (tumia RDS au DynamoDB), seti ndogo sana zinazobadilika mara kwa mara za data (tumia tu hifadhidata).
- **Amazon QuickSight**: Huduma ya BI inayosimamiwa ya AWS. Inaunganisha na Athena, S3, Redshift, na RDS kujenga dashibodi bila kuendesha seva tofauti ya BI. SPICE ni injini ya kumbukumbu inayoharakisha hoja za dashibodi zinazorudiwa.
- **AWS Lake Formation**: Udhibiti wa ufikiaji uliowekwa kati kwa maziwa ya data kwenye S3 + Glue Data Catalog. Inawezesha ruhusa za kiwango cha safuwima, kiwango cha safu, na kiwango cha jedwali — utawala wa data wa kina ambao IAM peke yake hauwezi kueleza.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.5)*

- **Kinesis dhidi ya SQS**: Kinesis = wenye mpangilio, utiririshaji wa wakati halisi, walaji wengi, kucheza tena ndani ya dirisha la uhifadhi (masaa 24 chaguo-msingi, hadi siku 365). SQS = foleni ya kazi, kila ujumbe unashughulikiwa mara moja. "Walaji wengi wakisoma mtiririko ule ule kwa wakati mmoja" → Kinesis. "Mfanyakazi mmoja kwa kila ujumbe" → SQS.
- **Ishara za Athena**: "SQL ya bila seva kwenye S3," "chambua data ya S3 bila kuipakia katika hifadhidata," "lipa kwa hoja" → Athena.
- **Uboreshaji wa gharama wa Athena**: Umbizo la safuwima (Parquet au ORC) + kugawanya kunapunguza kwa kiasi kikubwa data iliyochanganuliwa na gharama. Mtihani unaweza kuuliza jinsi ya kupunguza gharama za Athena.
- **Bei za Athena**: $5 kwa TB iliyochanganuliwa (us-east-1, us-west-2, na kanda nyingi kuu). Gharama inakokotolewa kwa data iliyochanganuliwa, si data iliyorudishwa — daima boresha umbizo la uhifadhi kabla ya kuendesha hoja za uzalishaji.
- **Glue Crawler**: "Gundua schema ya data ya S3 kiotomatiki" → Glue Crawler.
- **Amazon Data Firehose**: "Pakia kiotomatiki data ya utiririshaji kwa S3/Redshift/OpenSearch bila kusimamia walaji" → Amazon Data Firehose. Nyenzo za zamani zinaweza bado kuiita Kinesis Data Firehose.
- **Redshift dhidi ya Athena**: Redshift kwa hoja za marudio ya juu, ngumu kwenye seti ya data iliyowekwa (dashibodi za BI). Athena kwa hoja za ad-hoc kwenye data ya S3 inayobadilika mara kwa mara.
- **EMR (Elastic MapReduce)**: Nguzo za Hadoop/Spark zinazosimamiwa na AWS. Mtihani unatumia hii wakati "mzigo uliopo wa Hadoop/Spark" au "fremu za desturi za kuchakata data" zinatajwa. Glue ni mbadala unaosimamiwa kwa matumizi mengi.
- **QuickSight:** BI na taswira inayosimamiwa na AWS. Inaunganisha na Athena, S3, Redshift, RDS. SPICE = injini ya kumbukumbu kwa hoja za haraka zinazorudiwa. Kichocheo cha mtihani: "dashibodi ya akili ya biashara kwenye AWS" → QuickSight.
- **Lake Formation:** Udhibiti wa ufikiaji uliowekwa kati kwa ziwa la data (S3 + Glue Data Catalog). Ruhusa za kina: kiwango cha jedwali, safuwima, na safu. Kichocheo cha mtihani: "zuia ufikiaji wa safuwima mahususi katika ziwa la data la S3" au "weka kati utawala wa ziwa la data" → Lake Formation.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya Amazon Kinesis na Amazon SQS. Lini ungetumia kila moja?

*(Kidokezo: Fikiria ni walaji wangapi wanaweza kusoma data ile ile, kama ujumbe unafutwa baada ya kusoma, na kama mpangilio unajalisha.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ya kushiriki safari inataka kuchambua data ya safari. Safari milioni 1 zinakamilika kila siku. Rekodi za safari zimehifadhiwa katika S3 kama mafaili ya JSON (takriban 2KB kila moja). Timu ya uchambuzi inataka kuendesha hoja za SQL za ad-hoc kama "muda wa wastani wa safari kwa mji wiki iliyopita." Hoja zinapaswa kukamilika chini ya dakika 2. Gharama za uhifadhi zinapaswa kupunguzwa. Timu itaendesha hoja 20-30 kwa wiki.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Tumia AWS Glue kubadilisha JSON kuwa umbizo la Parquet lililogawanywa kwa tarehe na mji; uliza na Amazon Athena  
B) Pakia data ya safari katika RDS PostgreSQL kila siku; uliza ukitumia SQL ya kawaida  
C) Tumia Amazon Data Firehose kutoa data ya safari kwa Amazon Redshift; uliza na Redshift  
D) Pakia data ya safari katika DynamoDB na tumia PartiQL kwa hoja za SQL

**Kidokezo cha 1**: Hoja 20-30 kwa wiki ni marudio ya chini. Huduma gani ni ya gharama nafuu zaidi kwa kuuliza mara kwa mara?

**Kidokezo cha 2**: Umbizo la Parquet + kugawanya kunapunguza kwa kiasi kikubwa data iliyochanganuliwa na Athena — na hivyo gharama.

**Kidokezo cha 3**: Safari milioni 1 × 2KB = ~2GB kwa siku. Kwa wiki, ~14GB. Kwa $5/TB kwa Athena, hata bila uboreshaji, hii inalipika.

**Jibu**: A

**Maelezo**: Glue inabadilisha JSON kuwa Parquet (umbizo la safuwima linapunguza kwa kiasi kikubwa data iliyochanganuliwa) lililogawanywa kwa tarehe na mji (kukata kizigeu kunamaanisha hoja za "wiki iliyopita" zinachanganua tu vizigeu vya siku 7). Athena inauliza S3 moja kwa moja na SQL ya kawaida. Kwa hoja 20-30 kwa wiki, Athena ya lipa-kwa-hoja ni ya gharama nafuu sana dhidi ya Redshift inayoendesha-daima.

**Kwa nini si B?** Kupakia GB 2 za data kila siku katika RDS, kisha kuuliza, kunahitaji kipengele cha hifadhidata kinachoendesha masaa 24/7. Kwa hoja 20-30 kwa wiki, hii imebuniwa kupita kiasi na ni ghali.

**Kwa nini si C?** Redshift ni ya gharama nafuu kwa hoja za marudio ya juu (mamia kwa siku kwenye seti ile ile ya data). Kwa hoja 20-30 kwa wiki, nguzo ya Redshift inayoendesha-daima inagharimu zaidi sana kuliko bei ya kila-hoja ya Athena.

**Kwa nini si D?** DynamoDB ni hifadhi ya ufunguo-thamani/hati iliyoboreshwa kwa ufikiaji unaotegemea ufunguo, si hoja za uchambuzi za ad-hoc. PartiQL kwenye DynamoDB haisaidii aina ya ukusanyaji wa GROUP BY ulioelezwa.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.5*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inataka kujenga mfumo wa kugundua udanganyifu wa wakati halisi kwa maagizo. Mfumo unapaswa:

- Kugundua maagizo yaliyowekwa na akaunti ile ile zaidi ya mara 5 katika sekunde 60
- Kuweka alama kwa maagizo ya zaidi ya $500 kutoka akaunti mpya (< siku 30 za umri)
- Kutuma maagizo yaliyowekewa alama kwa foleni ya ukaguzi wa binadamu

Buni usanifu. Kinesis inatoa nini? Mantiki ya udanganyifu inaendesha wapi? Unawezaje kuoanisha "akaunti ile ile, dirisha la sekunde 60"? Huduma gani inapokea maagizo yaliyowekewa alama?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni usanifu wa utiririshaji wa wakati halisi.)*

## Tukio Baada ya Mikopo

Tom aliendesha hoja ya kwanza ya Athena.

"Migahawa 10 bora kwa mapato robo iliyopita," alisema.

Sekunde 12 baadaye, matokeo yalionekana.

Aliyatazama.

"Mgahawa 47 ulikuwa wa kwanza," alisema. Ulikuwa mgahawa wa familia ya Maya — ule ambao Nimbus ilianzia.

"Bila shaka ulikuwa," Maya alisema. "Arepa ni nzuri sana hivyo."

Tom aliendesha hoja nyingine. Na nyingine. "Inagharimu kiasi gani kwa mwezi?" Tom aliuliza kabla Leo hajasema chochote. Leo aliangalia historia ya uchanganuzi wa hoja. Hoja tatu, data jumla iliyochanganuliwa: GB 1.2. Gharama: chini ya senti.

Baada ya saa moja, Tom alikuwa na picha kamili ya biashara ya Nimbus kwa njia ambayo hajawahi kuwa nayo hapo awali. Kategoria gani za migahawa zilikua haraka zaidi. Makundi gani ya wateja yalibaki kwa muda mrefu zaidi. Vipengele gani vya menyu viliendesha maagizo mengi zaidi ya kurudia.

"Kwa nini hatukujenga hii mapema?" aliuliza.

"Tulikuwa na data," Leo alisema. "Tu hatukuwa na bomba la kuitumia."

"Data ilikuwa daima ipo," Maya alisema kimya. "Tu hatukuweza kuiona."

Katika sura inayofuata: sasa kwa kuwa tunaweza kuona biashara wazi, tuzungumze jinsi ya kulipia miundombinu inayoiendesha — kwa ufanisi zaidi.
