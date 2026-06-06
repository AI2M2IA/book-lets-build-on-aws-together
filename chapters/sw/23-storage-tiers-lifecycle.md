# Sura ya 23: Mfumo wa Kufaili Unaojipanga

Ofisi ya sheria huweka mafaili ya kesi za sasa mezani. Kesi zilizokamilika huenda kwenye kabati la kufaili. Kesi za miaka mitatu iliyopita huenda kwenye masanduku ya kuhifadhi kwenye sehemu ya chini ya jengo. Kesi za miaka kumi iliyopita huenda kwenye kituo cha kuhifadhi cha mbali ambacho kinagharimu senti kwa kisanduku lakini kinachukua siku mbili kupata kitu chochote kutoka hapo.

Taarifa ile ile, iliyohifadhiwa kwa gharama tofauti kulingana na jinsi inavyofikiwa mara ngapi.

---

Pamoja na uotomatishaji wa mtiririko wa kazi uliowekwa na mtiririko wa agizo hatimaye kuwa thabiti, Tom alikuwa amerudi kwenye ukaguzi wake wa gharama. Bili ya S3 ilikuwa imekaa nyuma ya akili yake tangu robo iliyopita — moja ya vipengele vya mstari ambavyo viliendelea kukua bila mtu kuviangalia moja kwa moja. Hatimaye alikuwa na muda wa kuangalia.

Aliita Leo.

"Tuna terabytes 4.2 katika S3," Leo alisema baada ya kuangalia.

"Ya nini?"

"Picha za mgahawa. Risiti za agizo. Mauzo ya uchambuzi. Picha za nakala kutoka miezi 18 iliyopita."

"Mara ya mwisho mtu alifikia nakala kutoka miezi 18 iliyopita ilikuwa lini?"

Leo aliangalia kumbukumbu za ufikiaji.

"Oktoba iliyopita," alisema. "Mara moja. Kuthibitisha umbizo la nakala."

"Kwa hivyo tunalipa kwa miezi 18 ya nakala kwa bei kamili ya S3 Standard."

"Ndiyo."

"Inagharimu kiasi gani kwa mwezi — Glacier dhidi ya Standard?" Tom aliuliza, tayari akiibua ukurasa wa bei.

S3 Standard: $0.023 kwa GB kwa mwezi. S3 Glacier Instant Retrieval: $0.004 kwa GB kwa mwezi.

Tom alifanya hesabu.

"Tunaweza kupunguza bili hii kwa kiasi kikubwa," alisema, "kwa kuhamisha tu data ya zamani kwenye uhifadhi wa bei nafuu zaidi."

"Tungehitaji kujua kitu gani ni cha zamani," Leo alisema.

"S3 inajua. Inafuatilia wakati wa ufikiaji wa mwisho."

**Madarasa ya Uhifadhi wa S3: Wigo Kamili**

Sura ya 5 ilianzisha S3 Standard kama darasa kuu la uhifadhi. S3 kwa kweli ina madarasa nane ya uhifadhi, kila moja iliyobuniwa kwa mifumo tofauti ya ufikiaji (la nane, **S3 Express One Zone**, ni darasa maalum la AZ moja kwa mzigo nyeti kwa latency na linaonekana mara chache nje ya hali za utendaji wa juu):

**S3 Standard**: Kwa data inayofikiwa mara kwa mara. Latency ndogo (millisekunde). Gharama ya juu zaidi. Hakuna muda wa chini wa uhifadhi. Tumia kwa data inayofanya kazi: picha za menyu za sasa, maagizo ya leo, kumbukumbu za hivi karibuni.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Kwa data inayofikiwa chini ya mara moja kwa mwezi. Urejeshaji wa millisekunde sawa na Standard, lakini gharama ya chini ya uhifadhi + ada ya urejeshaji kwa GB. Muda wa chini wa uhifadhi wa siku 30. Tumia kwa data unayohitaji mara moja unapoifikia, lakini mara chache hufanya: risiti za agizo za zamani, mauzo ya uchambuzi ya miezi 6.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Sawa na S3 Standard-IA (ikiwa ni pamoja na kiwango cha chini cha siku 30) lakini imehifadhiwa katika Availability Zone moja tu (badala ya tatu). Kudumu kidogo (ikiwa AZ hiyo itakuwa na maafa, data inaweza kupotea), lakini 20% ya bei nafuu zaidi. Tumia kwa data inayoweza kuundwa tena ikiwa itapotea: kashe ya picha ndogo, matokeo ya usindikaji wa muda.

**S3 Glacier Instant Retrieval**: Data iliyohifadhiwa ambayo unahitaji mara kwa mara. Urejeshaji wa millisekunde. Gharama ya chini sana ya uhifadhi, gharama ya juu ya urejeshaji kwa GB. Uhifadhi wa chini wa siku 90. Tumia kwa data inayofikiwa mara moja kwa robo mwaka au chini: ripoti za uzingatifu za robo mwaka, picha za nakala za miezi 12.

**S3 Glacier Flexible Retrieval**: Kumbukumbu ya kina, iliyorejeshwa kwa dakika hadi masaa. Gharama ya chini zaidi kuliko Glacier Instant Retrieval. Tumia kwa data ya kumbukumbu isiyo na haraka.

**S3 Glacier Deep Archive**: Chaguo la bei nafuu zaidi. Inarejeshwa kwa masaa 12. Uhifadhi wa chini wa siku 180. Tumia kwa data ambayo lazima ihifadhiwe kwa uzingatifu wa kanuni lakini haitegemewi kufikiwa kamwe: rekodi za kodi za miaka 7, kumbukumbu za ukaguzi za miaka 10.

Muundo: ufikiaji unapopungua, gharama hupungua lakini muda wa urejeshaji huongezeka (na gharama ya kila urejeshaji pia huongezeka). Chagua darasa linalofanana na mfumo wako wa ufikiaji.

**Sera za Mzunguko wa Maisha wa S3: Mfumo wa Kufaili wa Kiotomatiki**

Kuhamisha faili kwa mkono kati ya madarasa ya uhifadhi kuna makosa na kunachukua muda. **Sera za mzunguko wa maisha wa S3** zinafanya hivi kiotomatiki kulingana na sheria unazobainisha.

Sheria ya mzunguko wa maisha ina sehemu mbili:

**Kichujio**: Vitu gani sheria inatumika (vitu vyote, vitu vyenye kiambishi mahususi, vitu vyenye lebo mahususi).

**Vitendo**: Kufanya nini, baada ya siku ngapi.

Mfano wa sera ya mzunguko wa maisha kwa risiti za agizo la Nimbus:

```
Hamia kwa S3 Standard-IA baada ya siku 90
Hamia kwa S3 Glacier Instant Retrieval baada ya siku 365
Hamia kwa S3 Glacier Flexible Retrieval baada ya siku 540 (miezi 18)
Hamia kwa S3 Glacier Deep Archive baada ya siku 2555 (miaka 7)
Futa baada ya siku 2920 (miaka 8)
```

Sera hii moja inahakikisha:

- Risiti za sasa (< siku 90): S3 Standard, ufikiaji wa haraka
- Risiti za hivi karibuni (siku 90-365): Standard-IA, bei nafuu lakini zinapatikana mara moja
- Risiti za zamani (mwaka 1 hadi miezi 18): Glacier Instant, bei nafuu sana, millisekunde zinapohitajika
- Risiti za kihistoria (miezi 18 hadi miaka 7): Glacier Flexible, bei nafuu zaidi — urejeshaji unachukua masaa, si millisekunde
- Risiti zilizokwisha muda (> miaka 8): Zimefutwa kiotomatiki

Tatizo moja karibu liharibu mpango. Tangu mwishoni mwa 2024, sheria za mzunguko wa maisha **hazihamishi vitu vidogo kuliko 128 KB kwa chaguo-msingi** — na risiti za Nimbus zilikuwa na wastani wa 18 KB kila moja. Ili kufanya sera kweli iwahamishe, Leo ililazimika kupuuza ukubwa wa chini wa chaguo-msingi wa kitu kwenye sheria (vichujio vya mzunguko wa maisha vinaweza pia kuchagua kwa ukubwa kwa `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). Chaguo-msingi lipo kwa sababu nzuri: madarasa ya kumbukumbu yanalipisha gharama ya juu ya metadata ya ~40 KB kwa kila kitu na kila mpito unagharimu ada ya ombi, kwa hivyo kwa mamilioni ya vitu vidogo mpito unaweza kugharimu zaidi ya unavyookoa. Leo aliendesha hesabu kwa risiti — kwa uhifadhi wa miaka saba, bado ilifaa.

Tom alipitia akiba iliyokadiriwa: kutoka $847/mwezi hadi karibu $220/mwezi.

"Kwa kufafanua tu... kinachokuwa cha zamani na kinapaswa kwenda wapi?" alisema.

"Na S3 inakihamisha kiotomatiki," Leo alithibitisha. "Hakuna kazi ya cron. Hakuna uhamiaji wa mkono. Hakuna kusahau."

"Subiri — lakini *kwa nini* S3 haifanyi tu hivi kwa chaguo-msingi?" Maya aliuliza kutoka upande mwingine wa chumba. "Kwa nini unapaswa kufafanua sera kabisa?"

"Kwa sababu 'cha zamani' ni tofauti kwa kila ndoo," Leo alisema. "Kumbukumbu ya uzingatifu na upakiaji wa picha vinahitaji sheria tofauti kabisa za uhifadhi. S3 haiwezi kukisia ipi ni ipi."

Unaweza kuwa unajiuliza: kinachotokea ikiwa data isiyo sahihi itahamishwa kwa Glacier na unaihitaji haraka? Ungelipa ada ya urejeshaji na kusubiri — ndiyo sababu unapaswa kujaribu sheria zako za mzunguko wa maisha kwenye ndoo ndogo, isiyo muhimu kwanza, na kuthibitisha kumbukumbu za ufikiaji kabla ya kuzitoa kwa data ya uzalishaji. Kosa la urejeshaji kwenye miezi 18 ya nakala lingegharimu chini sana kuliko tukio linalomwelekea mteja, lakini bado inastahili kujaribu kwanza.

Ikiwa mfumo wa ufikiaji wa data yako unaweza kutabiriwa (kumbukumbu daima ni baridi baada ya siku 30), tumia sheria wazi za mzunguko wa maisha — ni za gharama nafuu zaidi kuliko ada ya ufuatiliaji ya kila-kitu ya Intelligent-Tiering. Ikiwa mifumo yako ya ufikiaji inabadilika kwa wakati au ni vigumu kutabiri, tumia Intelligent-Tiering — lakini fahamu kwamba inapuuza tu vitu vidogo kuliko 128 KB: havifuatiliwi, havilipishwi ada ya ufuatiliaji, na kamwe haviondoki kwenye tabaka la Ufikiaji wa Mara Kwa Mara.

**S3 Intelligent-Tiering: Darasa la Kujipanga**

Vipi ikiwa hujui jinsi mara nyingi utafikia data yako?

**S3 Intelligent-Tiering** inafuatilia mifumo ya ufikiaji kwa kila kitu na kuihamisha kiotomatiki kati ya tabaka za ufikiaji:

- **Tabaka la Ufikiaji wa Mara Kwa Mara**: Kwa vitu vilivyofikiwa hivi karibuni
- **Tabaka la Ufikiaji wa Mara Chache**: Vitu ambavyo havijafikiwa kwa siku 30
- **Tabaka la Ufikiaji wa Haraka wa Kumbukumbu**: Vitu ambavyo havijafikiwa kwa siku 90
- **Tabaka la Ufikiaji wa Kumbukumbu**: Vitu ambavyo havijafikiwa kwa siku 90-730 (hiari)
- **Tabaka la Ufikiaji wa Kumbukumbu ya Kina**: Vitu ambavyo havijafikiwa kwa siku 180-730+ (hiari)

S3 Intelligent-Tiering inalipisha ada ndogo ya ufuatiliaji kwa kila kitu kwa mwezi ($0.0025 kwa kila vitu 1,000), lakini hakuna ada ya urejeshaji kwa tabaka za Mara kwa Mara na Mara Chache.

Tumia Intelligent-Tiering wakati:

- Mifumo ya ufikiaji haiwezi kutabiriwa au inabadilika kwa wakati
- Una mchanganyiko wa data ya moto na baridi ambayo huwezi kuiorodhesha kwa urahisi
- Una vitu vikubwa kuliko 128KB (vitu vidogo havifuatiliwi au kuwekwa kwenye tabaka kiotomatiki hata kidogo)

Tumia madarasa wazi ya uhifadhi (na sera za mzunguko wa maisha) wakati:

- Mifumo ya ufikiaji inaweza kutabiriwa
- Unataka kila kitu — ikiwa ni pamoja na vidogo — kweli kihamie kwa madarasa ya bei nafuu zaidi
- Vitu ni vidogo (< 128KB)

Tahadhari ya faili ndogo inastahili msisitizo. Nimbus ilikuwa na vitu milioni 2.3 vya risiti za agizo katika S3 — kila kimoja kilikuwa faili dogo la JSON, na wastani wa karibu 18KB. Tom hapo awali alikuwa amefikiria Intelligent-Tiering kwa ndoo ya risiti, hadi aliposoma maandishi madogo.

Vitu vidogo kuliko 128KB **havifuatiliwi na haviwekwi kwenye tabaka kiotomatiki** katika Intelligent-Tiering. Havilipi ada ya ufuatiliaji ($0.0025 kwa kila vitu 1,000 kwa mwezi) — lakini pia kamwe haviondoki: vinakaa katika tabaka la Ufikiaji wa Mara Kwa Mara, kwa bei sawa na Standard, milele.

Kwa hivyo kwa risiti za 18KB, Intelligent-Tiering haingegharimu Nimbus kitu chochote cha ziada — tu isingefanya chochote. Risiti milioni 2.3 baridi zingeendelea kulipa bei za uhifadhi-moto ($0.023/GB) bila kikomo, wakati tabaka za Kumbukumbu ($0.00099/GB) zikikaa nje ya kufikiwa.

"Kwa hivyo Intelligent-Tiering imebuniwa kwa vitu vikubwa," Maya alisema.

"Au kwa mzigo wa kazi ambapo kwa kweli hujui mfumo wa ufikiaji," Tom alisema. "Kwa ndoo ya faili ndogo ambapo tunajua risiti ni moto kwa siku 90 na baridi baada ya hapo, sheria wazi ya mzunguko wa maisha — na upuuzaji wa kitu-kidogo wa awali — ni kitu pekee kinachozihamisha kweli."

Intelligent-Tiering ni huduma bora. Tu si zana sahihi kwa kila ndoo: chini ya kizingiti cha 128KB haina madhara lakini haina manufaa, na sheria wazi tu za mzunguko wa maisha (zenye upuuzaji wa ukubwa) zitaweka vitu vidogo kwenye tabaka.

**Wakati Kweli Unahitaji Data Irudi: Hadithi ya Urejeshaji wa Glacier**

Miezi mitatu baada ya sera za mzunguko wa maisha kusambazwa, Nimbus ilipokea taarifa ya kisheria. Mshirika wa zamani wa mgahawa alikuwa akipinga kipengele cha mkataba, na wanasheria wa Nimbus walihitaji miezi 18 ya rekodi za agizo za mshirika huyo — kila kitu kutoka kufunguliwa hadi kusitishwa kwa mkataba.

"Na je, ikiwa mtu atajaribu kuvunja kupitia mchakato wa ugunduzi wa kisheria?" Priya alisema. Hakuwa akitania. "Wanasheria wanaoomba mauzo ya data kwa wingi ni njia ya kawaida ya uhandisi wa kijamii. Thibitisha ombi ni halali kabla ya kufungua hifadhi yoyote ya data."

Ombi lilikuwa halali. Rekodi zilikuwa katika S3, katika madarasa matatu ya uhifadhi: siku 90 za hivi karibuni katika Standard-IA, mwaka uliopita katika Glacier Instant Retrieval, iliyobaki katika Glacier Flexible Retrieval (sera ya mzunguko wa maisha ilikuwa imetumia Flexible kwa data ya zaidi ya miezi 18).

Rekodi za Glacier Instant zilipatikana mara moja. Leo alichuja kwa kitambulisho cha mgahawa, akaendesha hoja ya Athena kutambua rekodi za agizo zinazolingana, na kuzihamishia eneo salama la S3. Dakika tano za kazi.

Rekodi za Glacier Flexible zilihitaji ombi la kurejesha:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **tabaka la Standard**: masaa 3-5. Rekodi zingepatikana kama nakala ya muda katika S3 Standard kwa siku 7, kisha ziondolewe kiotomatiki. Nakala asili iliyohifadhiwa inabaki katika Glacier.

Gharama ya urejeshaji wote: $0.01 kwa GB iliyorejeshwa katika tabaka la Standard, kwa GB 4.2 za rekodi zilizohifadhiwa. Karibu senti nne. (Tabaka la Expedited — dakika 1 hadi 5 — linagharimu $0.03 kwa GB, lakini upatikanaji wake hauhakikishwi jinsi Standard inavyohakikishwa.)

"Senti nne," Maya alisema, Leo aliporipoti. "Kwa miezi 18 ya rekodi."

"Tulihifadhi GB 4.2 kwa $0.0036 kwa GB kwa mwezi kwa mwaka mmoja na nusu," Leo alisema. "Gharama ya uhifadhi ilikuwa karibu senti ishirini na saba jumla. Gharama ya urejeshaji ilikuwa nne. Dhidi ya dola moja na senti sabini na nne tungebakisha katika S3 Standard kwa miezi 18."

"Na kitu pekee kilichojalisha," Priya alisema, "kilikuwa kwamba tulikumbuka ilikuwa katika Flexible Retrieval na tukapanga kwa kusubiri kwa masaa 3-5. Kama wanasheria walihitaji hii ndani ya dakika 30, tungekuwa na tatizo."

Hili ndilo somo muhimu la uendeshaji kuhusu Glacier: si uamuzi wa gharama tu, ni uamuzi wa SLA ya urejeshaji. Kabla ya kuhifadhi data kwa Glacier Flexible au Deep Archive, andika muda wa urejeshaji kwa yeyote anayeweza kuihitaji. "Data ipo" na "tunaweza kuipata ndani ya dakika 30" ni dhamana mbili tofauti.

**Upakiaji wa Sehemu Nyingi: Kwa Vitu Vikubwa**

S3 ina kikomo cha upakiaji wa 5GB wa kutumia mara moja. Kwa vitu vikubwa zaidi, lazima utumie **upakiaji wa sehemu nyingi (multipart upload)**: gawanya kitu katika sehemu, pakia kila moja kwa sambamba, na S3 itazikusanya.

Faida:

- Upakiaji wa haraka zaidi (sambamba)
- Inaweza kuendelea baada ya upakiaji uliokatizwa (pakia tena sehemu zilizoshindwa tu)
- Inahitajika kwa vitu > 5GB

Kidokezo cha sheria ya mzunguko wa maisha: Weka sheria ya mzunguko wa maisha kufuta upakiaji wa sehemu nyingi usio kamili baada ya siku 7. Ikiwa upakiaji utashindwa katikati na hausafishwi, sehemu hizo za sehemu zimehifadhiwa na kulipiwa — bila kitu kilichokusanyika kuonyesha kwa ajili yake.

Tom alishukuru sana kidokezo hiki.

Aliendesha amri ya AWS CLI kuorodhesha upakiaji wa sehemu nyingi usio kamili katika ndoo zote za Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

Matokeo yalikuwa marefu zaidi kuliko alivyotarajia. Aliyapitisha kwa kihesabu.

Upakiaji 340 usio kamili. Wa zamani zaidi ulikuwa kutoka miezi 8 iliyopita — jaribio la mzigo la Leo la mtiririko wa upakiaji wa picha za mgahawa. Jaribio la mzigo lilikuwa limezalisha mamia ya upakiaji wa sehemu, hakuna kati yao uliokamilika (jaribio halikuwa limebuniwa kuwakamilisha, tu kujaribu sehemu ya mwisho ya kuanzisha). Upakiaji 340 usio kamili, ukikaa katika S3, kila mmoja ukiwakilisha data ya sehemu ambayo AWS ilikuwa ikihifadhi na kulipisha.

"Inagharimu kiasi gani kwa mwezi?" Tom alisema. Hakuwa akiuliza kwa taarifa. Alikuwa akikokotoa kwa sauti.

Ukubwa wa pamoja wa sehemu zisizo kamili: GB 48. Kwa $0.023/GB: $1.10/mwezi. Kwa miezi nane: $8.80 tayari imetumika.

Kwa kiwango cha sasa cha ukuaji, ikiwa haitasafishwa: kinaendelea bila kikomo.

"Leo," Tom alisema.

"Tayari nilikiweka — oh," Leo alisema, akija. "Jaribio la mzigo. Nilisahau kusafisha upakiaji wa sehemu."

"Miezi minane iliyopita."

"Sikujua S3 inahifadhi sehemu hata kama upakiaji haukamiliki kamwe."

"Inazihifadhi. Inazilipisha. Na hakuna dashibodi inayokuonya kuhusu hilo. Zinajikusanya tu."

Marekebisho: sheria ya mzunguko wa maisha kufuta sehemu za upakiaji wa sehemu nyingi zisizo kamili baada ya siku 7.

```
Sheria: Futa sehemu za upakiaji wa sehemu nyingi zisizo kamili
Kiambishi: (vitu vyote)
Kitendo: Futa upakiaji wa sehemu nyingi usio kamili baada ya siku 7
```

Upakiaji 340 uliokuwepo ulisafishwa kwa mkono. Sheria ya mzunguko wa maisha inahakikisha hakuna majaribio ya mzigo ya baadaye au upakiaji uliyoshindwa unaojikusanya kwa njia ile ile. $1.10/mwezi iliyokuwa ikijenga kimya kwa miezi nane ilisimama — ndogo kwa dola, lakini muundo (usiyoonekana, unaokua, usio na kikomo) ndiyo sehemu iliyostahili kuuawa.

"Sheria ni mistari mitatu," Tom alisema. "Ningepaswa kuiweka kwenye kila ndoo wakati wa uundaji." Aliisasisha orodha ya ukaguzi ya uundaji wa ndoo: kila ndoo mpya ya S3 inapata sheria ya usafi wa upakiaji wa sehemu nyingi kwa chaguo-msingi.

**Tabaka Tatu za Usalama: Marejeo ya Haraka Kabla ya Mchepuko**

"Na je, ikiwa mtu atajaribu kuvunja na kufuta kumbukumbu za ukaguzi?" Priya aliuliza tena — wakati huu katika muktadha wa modeli mahususi ya tishio. "Si tu sheria ya mzunguko wa maisha iliyosanidiwa vibaya. Mtu wa ndani mwenye nia mbaya. Ufunguo wa IAM uliodukuliwa wenye ufikiaji wa kuandika."

Timu ilikuwa na majibu tayari — tu walikuwa hawajayatumia kwa ndoo hii. Tabaka tatu, kila moja iliyofunikwa awali katika kitabu, kila moja ikishughulikia njia tofauti ya tishio:

**Upigaji toleo** (sura ya 5) hufanya ufutaji kuwa unaoweza kutenduliwa — DELETE inakuwa alama ya kufuta, na matoleo ya awali yanabaki yanayoweza kurejeshwa. Kwa data ya kuandika-mara-moja kama risiti za agizo, gharama ya juu ya uhifadhi ni ndogo: kuna toleo moja tu kwa kila kitu kila wakati.

**S3 Object Lock** (sura ya 5) hufanya vitu kutobadilika kweli — uhifadhi wa WORM ambao hata ufunguo wa msimamizi hauwezi kufuta wakati wa kipindi cha uhifadhi. Kwa risiti, na sharti lao la uhifadhi wa kodi wa miaka 7, timu ilichagua hali ya Compliance: hakuna usanidi vibaya wa mzunguko wa maisha, hakuna kosa la IAM, hakuna stakabadhi iliyodukuliwa inayoweza kuziondoa kabla mkaguzi hajauliza. Na Object Lock inaishi pamoja na mipito ya mzunguko wa maisha — sheria inayohamisha risiti kwa Glacier Deep Archive bado inafanya kazi; data inakuwa nafuu na inabaki haitobadiliki.

**Matukio ya data ya CloudTrail S3** (sura 16-17) yanakuambia kilichotokea kwa data: kila GET, PUT, DELETE, na COPY zimerekodiwa na nani, kutoka wapi, na lini — malighafi ambayo GuardDuty (sura ya 17) inatumia kuonya kuhusu hitilafu.

"Upigaji toleo kwa urejeshaji wa ajali. Object Lock kwa kutobadilika kwa uzingatifu. CloudTrail kwa uchunguzi wa kimahakama," Priya alisema kwa muhtasari. "Tuliifunika kila moja ya hizi peke yake. Uamuzi mpya leo ni kuwasha zote tatu kwa ndoo hii."

**Upokezaji wa Toka Kanda Hadi Kanda: Rekodi za Agizo kama Uokoaji wa Maafa**

Ndoo ya risiti za agizo la Nimbus ilikuwa katika us-west-2. Hilo lilikuwa la makusudi — us-west-2 ndipo programu iliendesha. Lakini "programu iko us-west-2" na "rekodi zote za agizo ziko us-west-2 tu" ni wasifu tofauti wa hatari.

Ikiwa Nimbus ilihitaji kuwasha tovuti ya uokoaji wa maafa katika us-east-1, rekodi za agizo zingehitaji kuwa hapo pia. Kusubiri kuzinakili katikati ya kushindwa kwa kanda si mpango wa uokoaji.

Priya alipendekeza **Upokezaji wa Toka Kanda Hadi Kanda (Cross-Region Replication - CRR)** kwa ndoo ya risiti za agizo. Sheria:

```
Chanzo: nimbus-order-receipts (us-west-2)
Lengwa: nimbus-order-receipts-dr (us-east-1)
Upokezaji: Vitu vyote
Darasa la uhifadhi katika lengwa: S3 Standard-IA (bei nafuu — hii ni nakala ya DR, inafikiwa mara chache)
```

Mfumo ulikuwa wa kawaida kutoka sura ya 5: upokezaji wa nje wa maandishi mapya (vitu vingi ndani ya dakika 15; SLA inayohakikishwa inahitaji kulipia **S3 Replication Time Control**), upigaji toleo unahitajika kwenye ndoo zote mbili, jukumu la IAM lenye ruhusa ya kusoma-chanzo/kuandika-lengwa. Maelezo yanayostahili kuona katika sheria hapo juu: lengwa inatumia *darasa tofauti la uhifadhi* kuliko chanzo — Standard-IA kwa nakala ya DR, badala ya kulipia nakala ya pili ya Standard ambayo inasomwa mara chache. Na sharti la upigaji toleo halikugharimu kitu cha ziada — tayari walikuwa wakiwezesha upigaji toleo kwa urejeshaji wa ajali. (Ndugu wa CRR, **Upokezaji wa Kanda Moja (Same-Region Replication - SRR)**, hunakili vitu kati ya ndoo katika kanda *ile ile* — muhimu kwa nakala ya uzingatifu katika akaunti tofauti, ukusanyaji wa kumbukumbu, au mazingira ya majaribio yaliyopandwa kutoka data ya uzalishaji.)

Tatizo moja Priya aliloligundua kabla mtu hajalikumba: upokezaji **hauna kurudi nyuma**. Vitu vilivyokwisha kuwepo katika ndoo unapowezesha sheria havipokezwi — maandishi mapya tu. Timu zinawezesha CRR zikitarajia data yao yote iliyopo kuonekana katika lengwa, kisha zinagundua ndoo ya DR ni karibu tupu. Kwa vitu vilivyokuwepo awali, unaendesha **S3 Batch Replication**, operesheni tofauti inayotumia sheria za upokezaji kwa vitu vilivyokuwepo tayari. Nimbus iliiendesha mara moja kupanda ndoo ya DR na TB 0.8 zilizopo za risiti.

"Na alama za kufuta?" Priya aliuliza. "Ikiwa mtu atafuta risiti katika us-west-2, je, inapokeza ufutaji kwa us-east-1?"

Kwa chaguo-msingi, hapana — katika usanidi wa sasa wa upokezaji (schema ya V2 ambayo dashibodi inaunda), **alama za kufuta hazipokezwi**. Mtu anafuta risiti katika us-west-2, na nakala ya us-east-1 inaendelea kuihudumia kana kwamba hakuna kilichotokea. Ikiwa *unataka* ndoo ya DR iige ufutaji, unawezesha upokezaji wa alama za kufuta waziwazi kwenye sheria (haisaidiwi kwenye sheria zenye vichujio vya lebo) — hiyo ilikuwa chaguo-msingi katika schema ya zamani ya V1, ambayo nyenzo za zamani bado zinaeleza. Vyovyote vile, miisho ya muda ya mzunguko wa maisha kamwe haipokezi alama zao za kufuta.

Upokezaji bado *si* suluhisho la nakala, hata hivyo — kwa sababu kinyume: hautailinda dhidi ya ufutaji wa kudumu wa matoleo au uandishi upya wenye nia mbaya unaopokezwa kwa kioo, na hauna semantiki za uhifadhi. Kwa nakala halisi, unganisha upigaji toleo na Object Lock, au tumia AWS Backup.

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Uhifadhi kwa TB 0.8 katika S3 Standard-IA katika us-east-1: $10.00/mwezi. Pamoja na uhamishaji wa data ya upokezaji (unaolipishwa kwa kila GB iliyohamishwa toka kanda hadi kanda): mdogo kwa kiwango chao cha sasa cha kuandika. Jumla ya gharama ya ziada: takriban $10-11/mwezi kwa nakala kamili ya toka kanda hadi kanda ya rekodi zote za agizo.

Tom aliandika hili bila malalamiko.

**S3 Storage Lens: Kuona Picha Kamili**

Tom alikuwa amefanya ukaguzi wake kwa mkono — akifungua dashibodi ya AWS ndoo kwa ndoo, akiendesha amri za AWS CLI kuhesabu vitu, akikagua kichunguzi cha bili kwa gharama za uhifadhi kwa kila ndoo. Ilikuwa imemchukua sehemu kubwa ya alasiri kujenga lahajedwali hiyo.

**S3 Storage Lens** ni zana ya AWS inayobadilisha mchakato huo wa mkono. Inatoa uonekanaji wa kiwango cha shirika cha matumizi na shughuli za S3 katika ndoo zote, akaunti zote, na kanda zote — katika dashibodi moja.

Vipimo vinavyojalisha zaidi kwa uboreshaji wa gharama:

**Baiti za matoleo yasiyo ya sasa**: Ni uhifadhi kiasi gani unaotumiwa na matoleo ya zamani (wakati upigaji toleo umewezeshwa). Upigaji toleo ni muhimu kwa usalama, lakini ikiwa hati inasasishwa mara kwa mara, matoleo ya zamani yanajikusanya. Sheria ya mzunguko wa maisha ya kuisha kwa matoleo yasiyo ya sasa baada ya siku 30 inazuia ufurikaji wa matoleo.

**Baiti za upakiaji wa sehemu nyingi zisizo kamili**: Hasa tatizo Leo alilolisababisha na jaribio la mzigo, lililoibuliwa kiotomatiki. Bila Storage Lens, Tom ililazimika kujua kutafuta upakiaji wa sehemu nyingi usio kamili. Kwa Storage Lens, vinaonekana katika dashibodi kama kipengele cha mstari.

**% ya maombi yanayorudisha 403**: Mlipuko wa majibu ya 403 (Forbidden) kwenye ndoo ambayo inapaswa kufikika kwa umma inaweza kuashiria sera ya ndoo iliyosanidiwa vibaya. Mlipuko kwenye ndoo ya faragha inaweza kuashiria jaribio la kuchanganua au kuchunguza. Vyovyote vile, ni ishara inayostahili kuchunguzwa.

**Ukubwa wa wastani wa kitu**: Ndoo ya vitu vidogo (wastani 2KB) inatabia tofauti na ndoo ya vitu vikubwa (wastani 50MB) kuhusu uchumi wa Intelligent-Tiering, gharama za maombi, na utendaji wa hoja kwa Athena.

S3 Storage Lens ina tabaka la bure linalofunika vipimo muhimu. Vipimo vya hali ya juu (takwimu za maombi, makundi ya lenzi kwa kuchuja) vina gharama ya ziada kwa kila vitu milioni kwa mwezi — ndogo ikilinganishwa na akiba inayowezesha.

"Kwa nini hatukutumia hii tangu mwanzo?" Maya aliuliza.

"Hatukuwa na terabytes 4.2 tangu mwanzo," Tom alisema. "Kwa kiwango kidogo, lahajedwali inafanya kazi. Kwa kiwango hiki, kiwango chenyewe kinakuwa hoja kwa zana."

Hii ni mada inayojirudia katika usanifu wa Nimbus: zana sahihi kwa kiwango fulani si daima zana sahihi kwa kiwango kinachofuata. S3 Storage Lens inastahili kusanidiwa mara tu matumizi yako ya S3 yanapokua zaidi ya kile unachoweza kukagua kwa mkono katika alasiri — ambayo ni takriban wakati akiba inayowezesha inaanza kuzidi kwa maana muda inaouokoa.

## Nguvu na Mipaka

**Kwa nini tabaka za uhifadhi za S3 ni muhimu**:

- Kupunguza gharama kwa kiasi kikubwa bila kuathiri kudumu au upatikanaji kwa kile kinachofikiwa kweli
- Sera za mzunguko wa maisha zinafanya mchakato wote kiotomatiki — hakuna mzigo wa uendeshaji
- S3 Intelligent-Tiering inaondoa haja ya kutabiri mifumo ya ufikiaji

**Mahali ambapo mambo yanakuwa magumu**:

- Ada za muda wa chini wa uhifadhi zinatumika kwa madarasa ya Glacier (siku 90 kwa Glacier Instant, siku 180 kwa Deep Archive) — kufuta mapema bado kunalipisha malipo ya kiwango cha chini
- Ada za urejeshaji zinaweza kukushangaza ikiwa utafikia data iliyohifadhiwa mara kwa mara
- Mipito ya mzunguko wa maisha inachukua muda — vitu havihamishwi mara moja baada ya sheria kuanzishwa
- Intelligent-Tiering inapuuza vitu chini ya 128KB — hakuna ada, lakini hakuna kuwekwa kwenye tabaka pia; na sheria za mzunguko wa maisha zinaviruka kwa chaguo-msingi isipokuwa upuuze ukubwa wa chini wa kitu

## Muhtasari

Uotomatishaji wa mtiririko wa kazi kutoka sura ya 22 uliboresha jinsi Nimbus inavyochakata maombi. Sura hii inaboresha kile Nimbus inacholipia kwa data inayohifadhi lakini haifikii. Kanuni ni ile ile: acha kulipia tabaka lisilo sahihi.

- S3 ina madarasa nane ya uhifadhi: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — pamoja na Express One Zone (latency ya chini maalum, AZ moja).
- **Sera za mzunguko wa maisha** zinafanya mipito kiotomatiki kati ya madarasa ya uhifadhi kulingana na umri — fafanua mara moja, S3 inashughulikia milele.
- **S3 Intelligent-Tiering** huhamisha vitu kiotomatiki kati ya tabaka kulingana na mifumo halisi ya ufikiaji — tumia kwa mzigo usioweza kutabiriwa wenye vitu vikubwa kuliko 128KB. Vitu vidogo havifuatiliwi au kuwekwa kwenye tabaka kiotomatiki (na havilipi ada ya ufuatiliaji) — vinakaa katika tabaka la Ufikiaji wa Mara Kwa Mara.
- **Urejeshaji wa Glacier** unahitaji ombi la kurejesha kwa tabaka za Flexible na Deep Archive. Panga muda wa urejeshaji (dakika hadi masaa 12) kabla ya kuhifadhi data yoyote yenye SLA ya urejeshaji.
- **Upakiaji wa sehemu nyingi usio kamili** unajikusanya kimya na unalipisha gharama za uhifadhi. Ongeza sheria ya mzunguko wa maisha kufuta sehemu zisizo kamili baada ya siku 7 kwenye kila ndoo.
- **Tabaka tatu za usalama**: upigaji toleo (ufutaji unaoweza kutenduliwa), Object Lock (kutobadilika kwa uzingatifu), matukio ya data ya CloudTrail (uchunguzi wa kimahakama na ugunduzi wa hitilafu).
- **Upokezaji wa Toka Kanda Hadi Kanda (CRR)**: pokeza rekodi za agizo kwa kanda ya DR kiotomatiki. Inahitaji upigaji toleo kwenye ndoo zote mbili. Sanidi kama alama za kufuta zinapokezwa kulingana na kama nakala ya DR ni kioo au nakala.
- **Upakiaji wa sehemu nyingi** unahitajika kwa vitu > 5GB na inashauriwa kwa chochote > 100MB.
- **S3 Object Lock** hutoa uhifadhi wa WORM kwa hali za uzingatifu — hali ya Governance inaweza kupitiwa na wasimamizi; hali ya Compliance haiwezi kupitiwa na yeyote.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.1)*

- **Ishara za uteuzi wa darasa la uhifadhi**:
  - "Inafikiwa mara kwa mara" → Standard
  - "Inafikiwa mara moja kwa mwezi, inahitaji urejeshaji wa papo hapo" → Standard-IA
  - "Inaweza kustahimili masaa ya muda wa urejeshaji, inafikiwa mara chache" → Glacier Flexible Retrieval
  - "Uzingatifu wa kanuni, uhifadhi wa miaka 7+, haijafikiwa kamwe" → Glacier Deep Archive
  - "Mifumo ya ufikiaji isiyojulikana au inayobadilika" → Intelligent-Tiering
- **Mifumo ya mtihani ya sera ya mzunguko wa maisha**: "punguza kiotomatiki gharama za uhifadhi data inavyozeeka," "hamia kwa kumbukumbu baada ya siku 90" → sera za mzunguko wa maisha.
- **Intelligent-Tiering na vitu vidogo**: vitu chini ya 128KB havifuatiliwi, havilipi ada ya ufuatiliaji, na kamwe haviwekwi kwenye tabaka kiotomatiki — vinakaa katika Ufikiaji wa Mara Kwa Mara. Sheria za mzunguko wa maisha pia zinaruka vitu chini ya 128KB kwa chaguo-msingi (kinachoweza kupuuzwa). Mtihani unaweza kujaribu ukweli wowote.
- **Mahitaji ya CRR**: Upigaji toleo lazima uwezeshwe kwenye ndoo chanzo na lengwa. Chanzo na lengwa lazima ziwe katika kanda tofauti.
- **S3 Object Lock**: "WORM," "haitobadiliki," "SEC 17a-4," "haiwezi kufutwa au kubadilishwa" → Object Lock. Hali ya Governance (inaweza kupitiwa na wasimamizi). Hali ya Compliance (haiwezi kupitiwa na yeyote, ikiwa ni pamoja na root).
- **Urejeshaji wa Glacier**: Vitu katika Glacier havipatikani mara moja. Lazima "urejeshe" nakala kwa S3 Standard kwa ufikiaji. Nakala iliyorejeshwa ni ya muda (unaweka muda). Asili inabaki katika Glacier.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya S3 Standard-IA na S3 Glacier Instant Retrieval. Mfumo gani wa ufikiaji unafanya kila moja kuwa sahihi?

*(Kidokezo: Fikiria jinsi mara nyingi utafikia data na jinsi haraka unaihitaji unapoifikia.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni inazalisha 500GB za kumbukumbu za programu kila siku. Kumbukumbu zinaombwa sana katika siku 7 za kwanza (utatuzi na ufuatiliaji). Baada ya siku 7, kumbukumbu zinafikiwa mara chache lakini lazima zipatikane ndani ya dakika 30 ikiwa zitahitajika. Baada ya mwaka 1, kumbukumbu lazima zihifadhiwe kwa uzingatifu lakini hazifikiwi kamwe. Kampuni inahitaji kupunguza gharama za uhifadhi huku ikitimiza mahitaji haya.

Sera gani ya mzunguko wa maisha wa S3 BORA inakidhi mahitaji haya?

A) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Glacier Deep Archive baada ya siku 7; futa baada ya siku 365  
B) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Standard-IA baada ya siku 7; hamia kwa S3 Glacier Flexible Retrieval baada ya siku 365  
C) Hifadhi kumbukumbu zote katika S3 Intelligent-Tiering kuanzia siku ya 1  
D) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Glacier Instant Retrieval baada ya siku 7; hamia kwa S3 Glacier Deep Archive baada ya siku 365

**Kidokezo cha 1**: "Inapatikana ndani ya dakika 30" inazuia darasa gani la uhifadhi?

**Kidokezo cha 2**: Deep Archive inachukua masaa 12 kurejeshwa — haikidhi mahitaji ya dakika 30 kwa siku 7-365.

**Kidokezo cha 3**: Baada ya siku 365, muda wa urejeshaji hauna maana (haufikiwi kamwe), kwa hivyo chaguo la bei nafuu zaidi linatumika.

**Jibu**: D

**Maelezo**: S3 Standard kwa siku 7 inashughulikia ufikiaji wa mara kwa mara. Glacier Instant Retrieval hutoa ufikiaji wa millisekunde kwa siku 7-365 — ikitimiza mahitaji ya dakika 30 kwa gharama ya chini sana kuliko Standard-IA. Baada ya siku 365, Glacier Deep Archive ni chaguo la bei nafuu zaidi kwa data ambayo haifikiwi kamwe.

**Kwa nini si A?** Glacier Deep Archive inachukua masaa 12 kurejeshwa — haikidhi mahitaji ya "upatikanaji wa dakika 30" kwa siku 7-365.

**Kwa nini si B?** Standard-IA haiwezi hata kuwa kituo cha kwanza hapa: S3 inahitaji vitu vizeeke siku 30 katika Standard kabla sheria ya mzunguko wa maisha kuviruhusu kuhamia Standard-IA au One Zone-IA — kwa hivyo "Standard-IA baada ya siku 7" ni sheria isiyo halali. (Sheria ya siku 30 haitumiki kwa madarasa ya Glacier, ndiyo sababu haswa D inafanya kazi.) Na hata ukiacha hilo, Glacier Instant Retrieval ni ya bei nafuu sana kwa data inayofikiwa mara chache baada ya siku 7.

**Kwa nini si C?** Intelligent-Tiering ina ada ya ufuatiliaji kwa kitu na inaweza isihamishie kumbukumbu kwa tabaka za kumbukumbu kwa nguvu kama sheria wazi za mzunguko wa maisha. Kwa kiwango kikubwa cha kumbukumbu zenye mfumo wa ufikiaji unaoweza kutabiriwa, sheria wazi za mzunguko wa maisha ni za gharama nafuu zaidi.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus ina aina tatu za data za S3 zenye sifa tofauti:

- Picha za mgahawa: zilipakiwa mara moja, zinafikiwa mara nyingi na wateja, hazifutwi kamwe
- Risiti za agizo: zinafikiwa na wateja katika mwezi wa kwanza, zinahifadhiwa miaka 7 kwa madhumuni ya kodi
- Mauzo ya uchambuzi: yanazalishwa kila siku, yanachambuliwa katika wiki inayofuata, yanahifadhiwa miaka 2

Buni sera ya mzunguko wa maisha kwa kila moja. Kwa picha za mgahawa, Intelligent-Tiering ingefaa? Kwa risiti za agizo, darasa gani la uhifadhi linashughulikia dirisha la mwezi 1 hadi miaka 7? Kwa mauzo ya uchambuzi, ungeunda vipi ndoo ili kutumia sera tofauti kwenye viambishi tofauti?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya uteuzi wa tabaka la uhifadhi kwa data ya ulimwengu halisi.)*

## Tukio Baada ya Mikopo

Tom alitekeleza sera za mzunguko wa maisha.

Leo alikuwa amemsaidia kusanidi sheria ya kwanza. "Itakuwa sawa," alikuwa amesema. "Muda wa chini wa uhifadhi unatumika tu ikiwa tutafuta mapema — na hatufuti kitu chochote." Aliangalia mahitaji ya muda wa chini wa Glacier katikati. "Kwa kweli, niache nisome hili tena."

Kwenye ndoo tofauti — mauzo ya muda ya hatua ya uchambuzi — alikuwa karibu kuchanganya mpito wa siku 30 kwa Glacier Instant Retrieval na sheria ya kuisha kwa siku 60. Muda wa chini wa uhifadhi kwa Glacier Instant ni siku 90: vitu hivyo vingeingia Glacier siku ya 30 na kufutwa siku ya 60, na S3 ingebakisha kulipisha siku 90 kamili kwa kila kimoja — kulipa bei za kumbukumbu kwa uhifadhi ambao haukuwepo tena. Aliangusha mpito wa Glacier kwa ndoo hiyo kabisa; data iliyofutwa siku 60 kamwe haishi muda wa kutosha kustahimili kima cha chini cha siku 90. Sera ya risiti ilikuwa salama jinsi ilivyobuniwa: mpito kwa Standard-IA siku 90, Glacier Instant Retrieval siku 365, Glacier Flexible Retrieval siku 540, Glacier Deep Archive siku 2,555.

Pia aliweka sheria ya usafi wa upakiaji wa sehemu nyingi kwenye kila ndoo. Si kwa sababu kulikuwa na upakiaji ulioachwa zaidi — hapakuwa nao — bali kwa sababu kungekuwepo. Majaribio ya mzigo yanatokea. Usambazaji unashindwa katikati. Sheria ilikuwa nafuu kuliko kumbukumbu inayohitajika kukumbuka kusafisha kwa mkono.

Bili ya S3 ilianguka kutoka $847 hadi $198 mwezi uliofuata.

Alichapisha ulinganisho na kuuweka kwenye meza ya Maya bila kusema chochote.

Maya alitazama. Kisha tarehe. Kisha Tom.

"Wiki tatu," alisema.

"Alasiri moja kubuni sera," alisema. "Saa moja kuzitekeleza. Wiki tatu kuona mzunguko wa kwanza kamili wa bili."

"Kupunguza kwa robo tatu kwa gharama za S3."

"Kwa data ambayo hatufikii."

"Na upokezaji wa toka kanda hadi kanda?" Leo aliuliza.

"Dola kumi kwa mwezi zaidi," Tom alisema. "Kwa nakala kamili ya kila risiti ya agizo katika kanda ya pili."

"Huo ndio uamuzi wa uokoaji wa maafa wa bei nafuu zaidi tuliofanya."

Maya alitazama nambari tena.

"Tom," alisema, "nataka ufanye ukaguzi huu kwa kila huduma ya AWS tunayotumia. Uhifadhi, kompyuta, mtandao. Tafuta taka."

Alikuwa tayari amerudi kwenye meza yake.

"Nilianza wiki iliyopita," alisema.

Katika sura inayofuata: tabaka la hifadhidata lina mazungumzo yake mwenyewe ya aina hii, na Aurora ndiyo jibu ambalo Tom hakutarajia kupenda.
