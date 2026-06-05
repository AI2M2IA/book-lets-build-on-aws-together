# Sura ya 33: Inategemea

Pumua mara ya mwisho kabla ya sura hii.

Umefika mwisho wa kitabu. Hii ni mwisho na mwanzo zote mbili — sura ya mwisho, na siku ya kwanza utakapokuwa ukifanya maamuzi ya usanifu peke yako.

Sura hii ina kazi moja: kuwa mkweli nawe kuhusu kitu ambacho hakuna anayekuambia waziwazi vya kutosha.

**Swali**

Mwishoni mwa karibu kila mazungumzo ya usanifu, mtu mwishowe anauliza: "Jibu sahihi ni nini?"

Na jibu la manufaa zaidi, la kuchukiza zaidi, la uaminifu zaidi, na la kueleweka vibaya zaidi katika uhandisi wote wa programu ni:

**Inategemea.**

Si kwa sababu swali haliwezi kujibiwa. Si kwa sababu mtaalamu ana ujanja. Bali kwa sababu jibu sahihi kweli, kwa muundo, inategemea muktadha ambao haukuwa katika swali.

Sura hii inahusu kujifunza kusema "inategemea" ipasavyo — ambayo inamaanisha kuwa na uwezo wa kukamilisha sentensi.

Fikiria daktari anayeulizwa: "Je, upasuaji ni matibabu sahihi?" Daktari mbaya anasema ndiyo au hapana bila kumchunguza mgonjwa. Daktari mzuri anasema: "Inategemea — kwa utambuzi, umri wa mgonjwa, hali zake nyingine, na kinachotokea tukisubiri." Jibu si ujanja. Ni usahihi. "Inategemea" ikifuatiwa na sentensi kamili ni kitu muhimu zaidi daktari — au msanifu — anaweza kusema.

**Mwisho wa Nimbus**

Miaka miwili baada ya mwanzo. Maya alisimama katika chumba cha mikutano huko Seattle, akiwasilisha kwa chumba cha wawekezaji wa mtaji wa hatari.

Nimbus ilikuwa imekua: washirika 947 wa mgahawa. Maagizo 18,000 ya kila siku. GMV ya $2.1 milioni kwa mwezi. Miji mitatu hai, miwili zaidi inazinduliwa. Timu ya wahandisi kumi na wanne kwa maeneo mawili ya saa.

Wawekezaji walikuwa na maswali. Mmoja wao — mshirika wa kiufundi kwenye mfuko — alijiegemeza mbele.

"Unatumia hifadhidata gani?" aliuliza.

Maya hakusita.

"Kwa maagizo na data ya wateja: Aurora PostgreSQL. Kwa katalogi ya orodha: DynamoDB. Kwa usimamizi wa kikao na kuhifadhi: ElastiCache Redis. Kwa uchambuzi: Athena juu ya faili za S3 Parquet, na Redshift kwa maswali ya mara kwa mara ya dashibodi."

Alitikisa kichwa. "Kwa nini Aurora kwa maagizo na si DynamoDB?"

"Kwa sababu maagizo yana muundo mgumu wa uhusiano — yanarejelea vipengele vya orodha, akaunti za wateja, anwani za mgahawa, njia za malipo. Tunahitaji uthabiti wa muamala kwa vipengele vingi. Hifadhidata ya uhusiano ndiyo zana sahihi kwa hiyo. Nguvu ya DynamoDB ni ufikiaji wa kasi wa juu wa ufunguo-thamani na mpango wa kubadilika, ambayo ndiyo mchakato wa ufikiaji wa katalogi ya orodha hasa."

Aliandika kitu. "Kuhusu kupanua? Ulisema maagizo 18,000 ya kila siku. Hiyo ni karibu 12 kwa dakika kwa wastani. Uliundaje kwa kilele?"

"Msongamano wa chakula cha jioni wa Ijumaa ni mara 25 ya wastani. Tunapanua kwa usawa na ECS na Aurora Serverless v2, ambayo inashughulikia mabadiliko kiotomatiki. CloudFront inafyonza mzigo wa maudhui thabiti. API haina hali, kwa hivyo kupanua kwa usawa ni safi."

"Na ikiwa Aurora Serverless v2 haiwezi kupanua haraka vya kutosha?"

"Tuna matokeo ya majaribio ya mzigo. Muda wa kupanua kwa Aurora Serverless v2 ni chini ya sekunde 10. Msongamano wetu wa kawaida wa Ijumaa huchukua dakika 8 kupanda kutoka msingi. Tuna nafasi ya kutosha."

Mshirika wa kiufundi alimwangalia wawekezaji wengine. "Anajua mfumo wake."

**Maswali Manne Chini ya "Inategemea"**

Kila uwiano wa usanifu hupunguza hadi maswali manne ya kimsingi. Si kila swali lina uzito sawa kwa kila uamuzi, lakini yote manne daima yana mchakato:

**1. Mchakato wa ufikiaji ni nini?**

Data inaandikwa na kusomwa vipi? Kwa mzunguko gani? Na watumiaji wangapi wa wakati mmoja? Kwa mpangilio gani? Kwa funguo zipi?

Swali hili linabainisha uteuzi wa teknolojia katika kiwango cha kimsingi zaidi. DynamoDB dhidi ya Aurora dhidi ya Redshift dhidi ya Athena — jibu sahihi inategemea karibu kabisa mchakato wa ufikiaji.

**2. Kiwango ni nini?**

Si tu sasa — katika miezi 12, katika miaka 5. Kiwango hubadilisha jibu sahihi. Kinachofanya kazi kwa maombi 100 kwa siku kinasimama kwa maombi milioni 100. Kilichokuwa cha ziada kwa watumiaji 10 ni muhimu kwa 10,000.

Na kiwango si trafiki tu. Ni ukubwa wa timu (usanifu lazima udumishwe na timu unayo). Ni kiwango cha data. Ni upeo wa kijiografia.

**3. Matokeo ya kushindwa ni nini?**

Hii ikivunjika, kinatokea nini? Je, mtumiaji anaona ukurasa wa polepole? Je, agizo linashindwa? Je, pesa zinahamia vibaya? Je, rekodi ya matibabu ya mtu inakuwa haiwezi kupatikana?

Matokeo yanabainisha kiasi gani unawekeza katika uaminifu. Ukurasa wa orodha wa polepole unahitaji uthabiti wa hatimaye. Malipo yaliyoshindwa yanahitaji maandishi ya wakati mmoja na uthibitisho wazi.

**4. Kizuizi cha gharama ni nini?**

Si pesa tu — pia ugumu wa uendeshaji (ambayo wenyewe ni aina ya gharama). Suluhisho linalohitaji huduma tatu za ziada linaweza kuwa bora kiufundi kuliko rahisi zaidi lakini ni ghali sana kudumisha na timu ya watu wanne.

**"Inategemea": Jinsi ya Kukamilisha Sentensi**

Njia sahihi ya kusema "inategemea" ni kuikamilisha mara moje:

*"Tunapaswa kutumia DynamoDB au Aurora?"*

"Inategemea mchakato wa ufikiaji. Ukihitaji ufikiaji wa kasi wa juu wa ufunguo na mpango wa kubadilika, DynamoDB. Ukihitaji uthabiti wa muamala kwa vipengele vinavyohusiana na maswali magumu, Aurora."

*"Tunapaswa kutumia Lambda au EC2?"*

"Inategemea sifa za mzigo. Lambda kwa mzigo unaoendelewa na matukio, mfupi wa muda, unaobadilika ambapo gharama sifuri ya usubiri ni muhimu. EC2 au ECS kwa michakato ya kudumu, ya hali, au ya muda mrefu ambapo utendaji unaotabiriwa ni muhimu zaidi kuliko gharama ya usubiri."

*"Tunapaswa kutumia Multi-AZ au Multi-Region?"*

"Inategemea mahitaji yako ya RTO/RPO na mfano wako wa vitisho. Multi-AZ inalinda dhidi ya kushindwa kwa AZ (hali ya kawaida zaidi ya kushindwa ya AWS) na hutoa RPO ~0 na RTO ~sekunde 60 kwa RDS. Multi-Region inalinda dhidi ya kushindwa kwa mkoa (adimu) na kuwahudhumu watumiaji waliosambazwa duniani. Ukihitaji kushindwa hama kwa chini ya dakika kutoka maafa ya mkoa, Multi-Region. AZ resilience ikiwa ni ya kutosha, Multi-AZ ni rahisi zaidi na bei nafuu zaidi."

"Inategemea" si mwisho wa jibu. Ni mwanzo wa jibu halisi.

**Mifumo Isiyobadilika**

Ingawa chaguo maalum za teknolojia zinabadilika — huduma mpya zinazinduliwa, bei zinabadilika, mbadala bora zinaibuka — mifumo fulani ya msingi imekuwa thabiti kwa miongo:

**Utengano wa wasiwasi**: Vipengele vinavyofanya mambo tofauti vinapaswa kuwa huru. Mabadiliko katika kimoja hayapaswi kuhitaji mabadiliko katika kingine. Ndiyo maana unatenganisha na SQS, si wito wa moja kwa moja. Kwa nini unatumia S3 kwa vitu, si hifadhidata. Kwa nini tabaka la wavuti na tabaka la hifadhidata viko tofauti.

**Ulinzi wa kina**: Hakuna kidhibiti kimoja cha usalama kinatosha. Una IAM, vikundi vya usalama, NACL, WAF, GuardDuty, Secrets Manager, KMS. Tabaka moja likishindwa, linalofuata linashika.

**Lipa kwa unachotumia, unapotumia**: Kanuni ya kimsingi ya uchumi wa wingu. Lambda inapanua hadi sifuri. Vipengele vya Nafasi vinatumia uwezo wa ziada. Sera za mzunguko wa maisha za S3 zinahamisha data baridi kwa uhifadhi wa bei nafuu. DynamoDB wa hiari inalipwa kwa ombi. Mifumo ni tofauti; kanuni ni ile ile.

**Iboresha kwa kushindwa kunakotarajiwa zaidi**: Multi-AZ kwanza (kushindwa kwa AZ kunafanyika). DR ya toka kanda hadi kanda pili (kushindwa kwa mkoa ni adimu zaidi). Upungufu wa ndani-ya-AZ (vipengele vingi) kabla ya ugumu wa toka kanda hadi kanda. Jenga kwa kushindwa kwa kweli, si kwa catastrophic lakini kunakopendeza.

**Pima kabla ya kuiboresha**: Mbinu ya Tom — vuta vipimo vya CloudWatch, elewa mchakato halisi, kisha fanya maamuzi — ina thamani zaidi kulika uboreshaji wa kabla ya wakati unaotegemea mawazo.

**Kile Kitabu Hiki Kisichoweza Kukufundisha**

Tuwe wazi kuhusu mipaka.

Kitabu hiki kimekufundisha:

- Kila huduma kuu ya AWS inafanya nini
- Mfano zinazofanya mambo kuwa ya angavu
- Mabadiliko kati ya mbadala
- Ujuzi wa mtihani unaohitajika kwa SAA-C03
- Mfumo wa kufikiria kuhusu maamuzi ya usanifu

Kitabu hiki hakiwezi kukufundisha:

- **Silika ya uzalishaji**: Hisia ya kimiminika inayosema "hii itakuwa ya ajabu chini ya mzigo" kabla hujaona ikitokea. Hii inatoka kwa kuendeshea mifumo halisi.
- **Hukumu ya kiufundi chini ya shinikizo**: Kuamua kufanya nini saa 3 asubuhi mfumo ukishuka na una taarifa zisizo kamili. Hii inatoka kwa matukio.
- **Silika ya mdau**: Kujua wakati wa kupinga mahitaji ya biashara kwa sababu gharama ya kiufundi ni juu mno. Hii inatoka kwa uzoefu wa pande zote za kiufundi na biashara.
- **Swali sahihi kwa muktadha maalum**: Carlos angeweza kuuliza maswali sahihi kwa sababu ameyaona matatizo sawa mara nyingi. Ujuzi huu unastahiliwa, si kusomwa.

Hujamalizika kujifunza. Bado hujaanza.

**Mtihani Si Mwisho**

Ulichukua kitabu hiki kujiandaa kwa mtihani wa AWS Solutions Architect Associate. Hiyo ni halali. Cheti cha SAA-C03 ni halisi, kinathaminiwa, na kitafungua milango.

Lakini mtihani hujaribu ujuzi na kutambua mifumo. Haujaribu hukumu. Haujaribu uzoefu wa uendeshaji. Haujaribu unachofanya mfumo ulioujenga ukisimama saa 11 jioni Ijumaa.

Cheti ni kitambulisho cha kuanza. Utakapofaulu mtihani, utajua jinsi huduma za AWS zinavyofanya kazi na jinsi zinavyounganika. Utakuwa na mfumo wa kufikiria kuhusu usanifu. Hutakuwa umefanya bado.

Hatua inayofuata baada ya mtihani: jenga kitu halisi. Kipeleka. Endeshea. Tazama ikishindwa. Irekebisha. Malipo ya pesa kwenye huduma moja kisha uhamishie gharama mahali pengine. Pigiwa simu katikati ya usiku na ufanye uamuzi na taarifa zisizo kamili.

Hiyo ndiyo jinsi ujuzi katika kitabu hiki unavyokuwa hukumu.

**Jibu la Mwisho la Maya**

Mwishoni mwa mkutano wa wawekezaji, mshirika wa kiufundi alikuwa na swali moja zaidi.

"Kama ungeanza upya leo, ukijua unachojua sasa, ungefanya nini tofauti?"

Maya alichukua dakika.

"Ningeanza na miundombinu kama nambuli tangu siku ya kwanza," alisema. "Leo alipeleka kipengele cha kwanza cha EC2 kwa mkono. Tulitumia miezi sita kuhamisha kila kitu kwa Terraform. Hiyo ilikuwa deni la kiufundi la miezi sita ambalo lilitugharimu wakati halisi."

"Kitu kingine?"

"Ningekuwa na uhifadhi zaidi kuhusu huduma zinazosimamiwa mapema. Tulitumia DynamoDB wakati hifadhidata rahisi ya RDS ingehitajika kwa miezi. Muundo wa mchakato wa ufikiaji wa DynamoDB ulihitaji kufikiria kwa uzoefu ambao bado hatukuwa nao. Tulibuni upya mpango mara mbili."

"Kwa hivyo rahisi ni bora mapema?"

"Rahisi ni bora *daima*. Swali ni daima: ni kitu rahisi zaidi gani kinachotatua tatizo halisi, si tatizo la siku zijazo linalotarajiwa? Tuliongeza ugumu kutatua matatizo ambayo hatukuwa nayo bado. Ugumu huo ulisababisha matatizo yake mwenyewe."

Mshirika wa kiufundi aliandika hilo.

"Swali la mwisho," alisema. "Kitu muhimu zaidi ambacho unajua kuhusu kujenga kwenye AWS ambacho hukujua ulipoanza ni nini?"

Maya alifikiri kuhusu miaka miwili. Matukio. Mapitio ya gharama. Mapitio ya Ujenzi Bora. Maamuzi ya usanifu yaliyofanywa chini ya shinikizo na yale yaliyofanywa kwa makini. Yale waliyoyafanya vizuri na yale waliyolazimika kuyafanya upya.

"Kwamba wingu halitatua matatizo ya usanifu," alisema. "Linayapanua. Uamuzi mbaya wa eneo la ndani unaweza kukugharimu wiki. Uamuzi mbaya katika wingu unaweza kukugharimu pesa kila mwezi, kwa kiwango, mpaka mtu agundua."

Alisimama.

"Wingu hupanua maamuzi mazuri. Na mabaya pia."

**Kufungwa**

Umejifunza mambo mengi. Huduma za AWS. Uwiano. Mifumo.

Sasa fanya kitu nazo.

Jenga kitu. Fanya makosa kwa makusudi. Soma post-mortems (ziko hadharani — AWS, Cloudflare, GitHub, Stripe zote huzichapisha). Fanya kazi na timu ambazo ni bora zaidi kuliko wewe katika mambo unayodhoofika.

Mtihani wa SAA-C03 utajaribu kama unajua nyenzo. Kazi yako itajaribu kama unaweza kuitekeleza.

Zote mbili zinastahili kufanywa. Hakuna ya mwisho ndiyo mwisho wa safari.

Hakuna mwisho wa safari katika uwanja huu. Kuna tu tatizo linalofuata, uamuzi unaofuata, na tabia ya kuuliza swali sahihi linalofuata.

Bahati njema.

Katika sura inayofuata: kinachobadilika kazi isipokuwa ni kujenga mfumo — bali kuwa na jukumu lake.

## Muhtasari

- **"Inategemea" ni mwanzo wa jibu**, si mwisho. Daima kukamilisha sentensi na masharti inayotegemea.
- Maswali manne chini ya kila uwiano wa usanifu: mchakato wa ufikiaji, kiwango, matokeo ya kushindwa, kizuizi cha gharama.
- Mifumo inayodumu: utengano wa wasiwasi, ulinzi wa kina, lipa kwa unachotumia, iboresha kwa kushindwa kunakotarajiwa, pima kabla ya kuiboresha.
- **Wingu huimarisha maamuzi** — mazuri na mabaya. Uamuzi mbaya kwenye eneo la ndani ungharimu wiki; uamuzi mbaya katika wingu unasanyika kwa mwezi, kwa kiwango.
- Cheti cha SAA-C03 hujaribu ujuzi na kutambua mifumo. Uzoefu wa uzalishaji hubadilisha ujuzi huo kuwa hukumu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Msalaba wa vikoa — vikoa vyote*

Sura hii inafunga maudhui ya mtihani ya kitabu hiki. Kabla ya kufanya mtihani:

**Pitia huduma ambazo huna uhakika nazo**:

- Kwa watu wengi: Kinesis dhidi ya SQS (tofauti ya mkondo dhidi ya foleni)
- Mtandao wa VPC (meza za njia, subnet, NAT Gateway, Lango la Mtandao)
- Mantiki ya tathmini ya sera ya IAM (kukataa wazi > kuruhusu wazi > kukataa isiyo wazi)
- Uteuzi wa darasa la uhifadhi (jua madarasa yote sita ya uhifadhi wa S3 na uwiano wao)
- RDS dhidi ya Aurora dhidi ya DynamoDB kwa matumizi maalum

**Jua muundo wa kawaida wa hali ya mtihani**:

SAA-C03 inawasilisha mahitaji ya biashara ("kampuni inahitaji upatikanaji wa 99.99%") na kukuuliza kutambua usanifu unaokidhi. Daima soma mahitaji, tambua kizuizi muhimu, na ondoa chaguo ambazo hazikidhi.

**Zoeza kutambua vivutio**:

Kila jibu baya kwenye mtihani ni baya kwa sababu maalum. Kujifunza kutambua *kwa nini* kila jibu baya ni baya ni yenye thamani zaidi kuliko kukumbuka majibu sahihi.

**Mtihani unalipa kutambua mifumo**:

- "Tenganisha" → SQS/SNS
- "Bila seva" → Lambda, DynamoDB, Aurora Serverless
- "Latency ya chini ya kimataifa" → CloudFront, Global Accelerator, Global DynamoDB, Aurora Global
- "Uzingatifu/ukaguzi" → CloudTrail, Config, Security Hub, Macie
- "Uimarishaji wa gharama" → Vipengele vya Nafasi, Mipango ya Akiba, sera za mzunguko wa maisha, kupanga saizi sahihi

**Uko tayari**. Si kwa sababu kitabu hiki kimefunika kila kitu — hakuna kinachofanya hivyo. Bali kwa sababu unaelewa kanuni za kutosha kusababu njia hadi jibu hata usipotambua hali halisi mara moja.


## Mazoezi

**Zoezi la Mwisho**

Hakuna maswali zaidi ya mtihani yaliyoundwa baada ya sura hii.

Badala yake: swali moja wazi.

Utengenezaji gani wa mfumo leo, ukijua unachojua?

Uandike chini. Chora usanifu. Tambua huduma. Andika uwiano ungeyafanya na kwa nini. Tarajia hali za kushindwa.

Kisha uijenzi.

Hiyo ndiyo kazi. Hakuna tarehe ya mwisho. Hakuna daraja. Kuna tu kazi.

## Tukio Baada ya Mikopo

Uwekezaji ulifika.

Mfululizo A. Dola milioni 4. Za kutosha kupanua hadi miji mitano mipya, kuongeza mara tatu timu ya uhandisi, na kujenga Nimbus Instant.

Jioni hiyo, Maya alikuwa kwenye mgahawa wa familia yake. Ule wa asili. Ule ambapo Nimbus ilianza, alipoona walikuwa wakipoteza maagizo kwa sababu simu ilikuwa daima shughuli.

Aliagiza arepa — sahani ile ile aliyoagiza kila wakati.

Akisubiri, alifungua kompyuta yake ya mkononi na kusoma sura ya kwanza ya kitabu hiki.

*"Tovuti inaishi wapi?"*

Alikumbuka kutojua jibu.

Alitabasamu.

Alirudi kompyuta yake ya mkononi.

Chakula kilifika.

Kilikuwa kamili.

*Asante kwa kusoma.*

*Mtihani wa AWS Solutions Architect Associate (SAA-C03) unapatikana kwenye vituo vya majaribio vya Pearson VUE na mtandaoni kupitia mfumo wao wa majaribio ya mbali. Tembelea aws.amazon.com/certification kujiandikisha.*

*Hadithi ya Nimbus ni ya ubunifu. Huduma za AWS, mifano ya bei, na mbinu bora zilizoelezwa katika kitabu hiki ni za kweli. Zote mbili zinaweza kubadilika — AWS husasisha huduma zake mara kwa mara. Daima thibitisha bei na uwezo wa huduma wa sasa kwenye aws.amazon.com.*

*Bahati njema.*
