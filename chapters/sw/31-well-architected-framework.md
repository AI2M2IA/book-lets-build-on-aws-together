# Sura ya 31: Mkaguzi wa Ujenzi kwa Usanifu wa Wingu

Simama. Stretch. Pumzika kweli ikiwa unahitaji.

Sura hii ni tofauti na zile zilizotangulia. Tumetumia sura 30 zikijenga ujuzi wa huduma maalum na mifumo. Sasa tunatoa na kutazama picha nzima.

Usanifu wa wingu mzuri *halisi* unaonekanaje? Je, kuna njia ya kimfumo ya kutathmini kama ulichojenga ni kweli ulioundwa vizuri — au tu wa kufanya kazi?

Kuna. AWS inaita Mfumo wa Ujenzi Bora.

Nimbus ilikuwa ikiendeshwa kwa miaka miwili. Timu ilikuwa imefanya maamuzi ya usanifu mamia — baadhi kwa makusudi, baadhi kwa bahati, baadhi chini ya shinikizo. Mfumo ulifanya kazi. Lakini Maya alikuwa na swali.

"Je, usanifu wetu kweli ni *mzuri*?" aliuliza. "Si tu wa kufanya kazi. Mzuri."

Hakuna aliyejibu mara moja.

"Kwa sababu nimekuwa nikisikia kuhusu Mapitio ya Ujenzi Bora," aliendelea. "AWS inaiaandalia wateja. Baadhi ya wawekezaji wetu walitaja. Nafikiri tunapaswa kufanya moja."

"Ni nini?" Leo aliuliza.

"Mfumo wa AWS wa kutathmini usanifu wa wingu," Priya alisema. "Nguzo sita. Seti ya maswali na mbinu bora kwa kila moja. Unakadiria usanifu wako dhidi ya yote na kutambua kilichokosekana."

"Ni kama ukaguzi wa ujenzi," Tom alisema. "Unajua jengo linafanya kazi. Ukaguzi unakuambia kama lina uzingatifu wa kanuni na kile kinachoweza kushindwa katika tetemeko la ardhi."

**Nguzo Sita**

Mfumo wa Ujenzi Bora wa AWS umepangwa karibu na nguzo sita. Kila nguzo ina seti ya kanuni za muundo, mbinu bora, na maswali ya kutathmini usanifu wako.

**1. Ubora wa Uendeshaji (Operational Excellence)**

*Mwelekeo*: Kuendesha na kufuatilia mifumo kutoa thamani ya biashara, na kuboresha mfululizo michakato na taratibu.

Maeneo muhimu:

- Unasambazaje mabadiliko? (CI/CD, miundombinu kama nambuli, usambazaji wa kiotomatiki)
- Unafuatilia mfumo na kujuaje kitu kimekosea?
- Unajifunzaje kutoka kwa kushindwa? (post-mortems, vitabu vya maelekezo, utamaduni usio na kulaumiana)
- Unashughulikia vipi mabadiliko kwa kiwango?

Tathmini ya Nimbus:

- Ipo: Mzunguko wa CI/CD na usambazaji wa kiotomatiki
- Ipo: Tahadhari za CloudWatch na GuardDuty
- Ipo: Majaribio ya uhandisi wa machafuko ya robo mwaka
- Tahadhari: Mchakato wa post-mortem haujaformalishwa — matukio yalichunguzwa lakini mafunzo hayaandikwi kwa utaratibu

**2. Usalama (Security)**

*Mwelekeo*: Kulinda taarifa, mifumo, na mali kupitia tathmini ya hatari na mikakati ya kupunguza.

Maeneo muhimu:

- Ni nani anaweza kufikia nini, na kwa upendeleo mdogo iwezekanavyo?
- Data imefichwa vipi wakati wa mapumziko na wakati wa usafirishaji?
- Unagundua na kujibu vipi kwa vitisho?
- Je, kuna vidhibiti vya usalama vya kiotomatiki?

Tathmini ya Nimbus:

- Ipo: IAM yenye upendeleo mdogo (baada ya usafi katika Sura ya 14)
- Ipo: KMS kwa usimbaji fiche wa data, Secrets Manager kwa vyeti
- Ipo: GuardDuty, WAF, Shield Standard
- Ipo: VPC yenye subnet za kibinafsi, vikundi vya usalama
- Tahadhari: Kupiga kiraka kwa usalama kwenye vipengele vya EC2 hakujafanywa kiotomatiki kikamilifu (Priya alitoa kengele miezi kadhaa iliyopita, bado haijatatuliwa)

**3. Uaminifu (Reliability)**

*Mwelekeo*: Kuhakikisha mfumo unatekeleza kazi yake iliyokusudiwa ipasavyo na kwa uthabiti, na unaweza kurejesha kutoka kwa kushindwa.

Maeneo muhimu:

- Mfumo unashughulikia vipi kushindwa kwa kiwango cha kipengele?
- Unarejesha vipi kutoka kwa kushindwa kwa mkoa?
- Mahitaji yanasimamiwaje?
- Mfumo unajaribiwa vipi kwa kushindwa?

Tathmini ya Nimbus:

- Ipo: Multi-AZ kwa vipengele vyote muhimu
- Ipo: Aurora Serverless yenye kushindwa hama kwa kiotomatiki
- Ipo: Kupanua Kiotomatiki kwa EC2 na ECS
- Ipo: Majaribio ya uhandisi wa machafuko (ya robo mwaka)
- Tahadhari: Hakuna usambazaji wa multi-region (nakala ya hifadhi ya joto bado haijatekelezwa — imepangwa kwa robo mwaka ujao)

**4. Ufanisi wa Utendaji (Performance Efficiency)**

*Mwelekeo*: Kutumia rasilimali za IT na kompyuta kwa ufanisi.

Maeneo muhimu:

- Je, aina sahihi ya kipengele na aina ya hifadhidata zinatumika kwa mzigo?
- Je, kupanua kumesanidiwa ipasavyo?
- Je, data inatolewa kwa watumiaji kutoka eneo bora?

Tathmini ya Nimbus:

- Ipo: CloudFront kwa utoaji wa maudhui wa kimataifa
- Ipo: ElastiCache kwa kuharakisha kusomwa kwa hifadhidata
- Ipo: Aurora read replicas
- Ipo: Lambda kwa mzigo unaofaa
- Tahadhari: Vipengele vingine vya EC2 havijawahi kupangwa saizi sahihi tangu usambazaji wa kwanza

**5. Uimarishaji wa Gharama (Cost Optimization)**

*Mwelekeo*: Kuepuka gharama zisizo za lazima.

Maeneo muhimu:

- Je, rasilimali zimepangwa saizi sahihi ipasavyo?
- Je, rasilimali zisizotumika zimefutwa?
- Je, mifano sahihi ya bei inatumika?
- Je, upungufu wa matumizi unagugunduliwa?

Tathmini ya Nimbus:

- Ipo: Mipango ya Akiba ilitekelezwa (Sura ya 27)
- Ipo: Sera za mzunguko wa maisha za S3 (Sura ya 23)
- Ipo: DynamoDB Auto Scaling
- Ipo: AWS Budgets na tahadhari
- Ipo: Mapitio ya gharama ya robo mwaka

**6. Uendelevu (Sustainability)**

*Mwelekeo*: Kupunguza athari za mazingira za kuendesha mzigo wa wingu.

Maeneo muhimu:

- Je, matumizi yameimarishwa (kuepuka rasilimali zisizo na kazi)?
- Je, aina za vipengele zimechaguliwa kwa ufanisi wa nishati?
- Je, data imehifadhiwa tu kwa muda inahitajika?

Tathmini ya Nimbus:

- Ipo: Lambda na Fargate kwa mzigo bila seva/vilivyo kwenye makopo (ufanisi bora wa rasilimali kuliko EC2 iliyowekwa)
- Ipo: Sera za mzunguko wa maisha za S3 (futa data isiyohitajika)
- Tahadhari: Vipengele vingine vya graviton bado havijapitishwa (AWS Graviton ni bora zaidi kwa nishati na bei nafuu zaidi)

**Mchakato wa Mapitio ya Ujenzi Bora**

Mapitio si mtihani unaopita au kushindwa. Ni mazungumzo yaliyoundwa kuhusu usanifu wako, yaliyoongozwa na maswali 60+ katika nguzo sita.

Kila swali linatambua mbinu bora. Usanifu wako ukifuata, hiyo ni nguvu. Ikiwa haifuati, ni "tatizo" — lililokategoriwa kwa kiwango cha hatari (juu, wastani, chini).

Matokeo: orodha iliyopewa kipaumbele cha mapendekezo ya maboresho ya usanifu. Si kila kitu kinahitaji kurekebíshwa mara moje. Mfumo unakusaidia kuelewa maamuzi ya uwiano ya kila pengo na kuamua nini kushughulikia kwanza.

Zana ya Ujenzi Bora ya AWS (inapatikana katika dashibodi ya AWS, bila malipo) hutoa mfumo wa swali na kuzalisha ripoti yenye mapendekezo.

Kwa Nimbus, Maya alipanga warsha ya nusu-siku. Wanachama wote wanne wa timu walipitia kila nguzo pamoja. Mwishoni, walikuwa na orodha ya masuala 12 — matatu yenye hatari ya juu, matano ya wastani, manne ya chini.

**Masuala ya hatari ya juu**:

1. Hakuna mpango wa DR wa multi-region (uaminifu)
2. Kupiga kiraka kwa usalama kwa EC2 hakujafanywa kiotomatiki (usalama)
3. Hakuna mchakato rasmi wa majibu ya tukio (ubora wa uendeshaji)

**Masuala ya hatari ya wastani**:

Vipengele 5 ikiwa ni pamoja na: kutopitisha Graviton, vipengele vingine vya EC2 visivyopangwa saizi sahihi, hakuna kitabu rasmi cha maelekezo kwa kushindwa hama kwa hifadhidata

**Masuala ya hatari ya chini**:

Vipengele 4 ikiwa ni pamoja na: kiwango cha maombi ya kashe ya CloudFront kingeweza kuwa cha juu zaidi na TTL zilizoratibiwa, sheria chache za kikundi cha usalama zenye upana zaidi kuliko inavyohitajika

**Lenzi: Maalum ya Mapitio**

Mfumo wa msingi wa Ujenzi Bora hauna teknolojia maalum. AWS pia inachapisha **Lenzi** — upanuzi wa mfumo kwa matumizi maalum au tasnia:

- **Lenzi ya Bila Seva**: Maswali ya ziada kwa usanifu unaozingatia Lambda
- **Lenzi ya SaaS**: Kwa programu za SaaS zinazohudumia watumiaji wengi
- **Lenzi ya Kujifunza kwa Mashine**: Kwa mzigo wa mafunzo na hitimisho la ML
- **Lenzi ya Huduma za Kifedha**: Maswali ya kisheria na uzingatifu kwa FinTech
- **Lenzi ya Afya**: Mazingatio ya HIPAA

Kwa Nimbus, Lenzi ya SaaS ilikuwa husika. Iliongeza maswali kuhusu utengano wa mpangaji, utaratibu wa uandikishaji wa kiotomatiki, na ugawaji wa gharama kwa mpangaji — maeneo yote Nimbus ilikuwa ikitengeneza kikamilifu.

**Tofauti Kati ya Ubunifu Mzuri na Kufanya Kazi Tu**

"Mfumo wetu unafanya kazi," Leo alisema baada ya mapitio. "Lakini sikugundua mambo ngapi tuliyoyafanya 'vizuri vya kutosha' na kuendelea."

"Hiyo ni ya kawaida," Priya alisema. "Kujenga chini ya shinikizo la muda kunamaanisha unafanya chaguo za vitendo. Mapitio ya Ujenzi Bora ni muda uliopangwa wa kurudi kwao."

"Baadhi ya mapungufu haya yanaonekana dhahiri ikiangaliwa nyuma," aliendelea. "Kupiga kiraka kwa usalama — nilijua hatujafanya kiotomatiki. Sikuwahi kupanga kurekebisha."

"Kwa sababu 'inafanya kazi' na 'imejengwa vizuri' huhisi sawa siku ya kawaida," Maya alisema. "Tofauti inaonekana tu wakati kitu kinaposimama."

Hii ni moja ya mambo muhimu zaidi mhandisi mwandamizi anayaelewa: kutokuwepo kwa matukio hakumaanishi kutokuwepo kwa hatari. Inamaanisha hatari haijatokea bado.

**Miundombinu kama Nambuli: Kiongeza kwa Nguzo Nyingi**

Mada moja katika nguzo nyingi: **Miundombinu kama Nambuli (Infrastructure as Code - IaC)**.

Ikiwa miundombinu yako imesanidiwa kwa mkono kupitia dashibudi, basi:

- Kuiunda upya katika hali ya DR ni polepole na yenye makosa
- Kukagua mabadiliko haiwezekani (ni nani alibadilisha nini, na lini?)
- Kurudi nyuma kwa mabadiliko mabaya kunahitaji ubadilishaji wa mkono
- Uthabiti kati ya mazingira (dev/hatua ya kujaribu/uzalishaji) unahitaji nidhamu

**AWS CloudFormation** inakuruhusu kufafanua miundombinu katika templeti za YAML/JSON. **AWS CDK (Cloud Development Kit)** inakuruhusu kufafanua miundombinu kwa kutumia lugha za programu (Python, TypeScript, Java). **Terraform** ni mbadala maarufu wa pande ya tatu.

Nimbus ilikuwa ikibadilisha polepole hadi IaC kwa kutumia Terraform. Wakati wa mapitio ya Ujenzi Bora, karibu 60% ya miundombinu yao ilikuwa imefafanuliwa katika nambuli. Mapitio yalipendekeza kufika 100%.

"Kwa nini 40% iliyobaki?" Leo aliuliza.

"40% iliyobaki ndipo miundombinu yetu muhimu inaishi," Priya alisema. "Ikiwa hatuwezi kuiunda upya kutoka nambuli, hatuwezi kurejesha ipasavyo kutoka maafa ya mkoa."

## Nguvu na Mipaka

**Mfumo wa Ujenzi Bora unafanya vizuri kini**: Unatoa timu lugha ya pamoja ya kujadili uwiano wa usanifu — lugha inayonusurika mabadiliko ya wafanyakazi na mazungumzo ya msambazaji. Kukimbia Mapitio ya Ujenzi Bora kunalazimisha kukubali wazi hatari ambazo vinginevyo zingeendelea kuwa zisizoonekana: "Ndiyo, tunajua tuna hatua moja ya kushindwa hapa; tulikubali mabadiliko hayo kwa sababu gharama ya kuiondoa inazidi gharama inayotarajiwa ya kushindwa." Aina hiyo ya mabadiliko yaliyoandikwa na ya makusudi ndiyo matokeo ya mapitio mazuri.

**Kile ambacho haiwezi kufanya**: Mfumo ni wa maelezo, si wa uagizo. Unabainisha sifa za mifumo iliyojengwa vizuri — haielezi jinsi ya kuijenga. Kuangalia kila kisanduku katika Mapitio ya Ujenzi Bora hakuhakikishii usanifu mzuri. Mfumo unaweza kuwa wa upatikanaji wa juu, ubora wa uendeshaji, ulioimarishwa kwa gharama, na bado kutatua tatizo baya. Mfumo ni lenzi, si mpango. Uitumie kutoa maswali sahihi, si kuyajibu.

## Muhtasari

- Mfumo wa Ujenzi Bora wa AWS una nguzo sita: Ubora wa Uendeshaji, Usalama, Uaminifu, Ufanisi wa Utendaji, Uimarishaji wa Gharama, na Uendelevu.
- Kila nguzo ina kanuni za muundo na mbinu bora zilizopimwa kupitia seti ya swali iliyoundwa.
- **Zana ya Ujenzi Bora** (bure katika dashibudi ya AWS) inaongoza mapitio na kuzalisha ripoti.
- Matokeo ni orodha iliyopewa kipaumbele ya maboresho ya usanifu yaliyokategoriwa kwa hatari.
- **Lenzi** zinabobeza mfumo kwa vikoa maalum (bila seva, SaaS, afya, ML).
- **Miundombinu kama Nambuli** ni kiongeza cha nguzo nyingi — kinapendekezwa na Ubora wa Uendeshaji, Usalama, na nguzo za Uaminifu.
- Mapitio ya Ujenzi Bora si mtihani wa kupita/kushindwa. Ni mazungumzo yaliyoundwa ya maboresho.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Msalaba wa vikoa — vikoa vyote*

- **Jua nguzo sita zote na mwelekeo wao wa msingi**. Mtihani utaelezea hali (mfano, "timu inataka kuhakikisha mfumo wao unaweza kurejesha kutoka kushindwa kwa AZ") na kuuliza nguzo ipi inayolingana (Uaminifu).
- **Ramani ya nguzo**:
  - "Sambaza mabadiliko kwa uaminifu, jifunza kutoka kwa kushindwa, fuatilia" → Ubora wa Uendeshaji
  - "IAM, usimbaji fiche, vidhibiti vya mtandao, ugunduzi wa vitisho" → Usalama
  - "HA, kushindwa hama, kupanua, DR" → Uaminifu
  - "Kupanga saizi sahihi, CDN, uteuzi sahihi wa teknolojia" → Ufanisi wa Utendaji
  - "Mifano ya bei, rasilimali zisizotumika, uwazi wa gharama" → Uimarishaji wa Gharama
  - "Ufanisi wa nishati, matumizi ya rasilimali, mzunguko wa maisha wa data" → Uendelevu
- **Miundombinu kama Nambuli**: Imependekezwa na mfumo kwa kurudiwa, uwezekano wa kukagua, na uokoaji. CloudFormation, CDK, na SAM ni zana za IaC za AWS asili.
- **Zana ya Ujenzi Bora**: Zana ya dashibudi ya AWS inayoongoza mchakato wa mapitio. Bure kutumia. Inazalisha mipango ya maboresho.
- **AWS Trusted Advisor**: Inafanana na mfumo wa Ujenzi Bora lakini wa kiotomatiki — inachunguza akaunti yako na kutoa mapendekezo katika gharama, utendaji, usalama, na uvumilivu wa hitilafu. Mwingiliano ni wa kweli: Trusted Advisor inafanya kiotomatiki baadhi ya kile mfumo unakadiria kwa mkono.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Taja nguzo sita za Mfumo wa Ujenzi Bora wa AWS na eleza wasiwasi wa msingi wa kila moja katika sentensi moja.

*(Jaribu kufanya hivi bila kukumbuka. Ikiwa unashindwa, hiyo ni taarifa muhimu kuhusu nguzo zipi zinahitaji umakini zaidi.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Timu ya uhandisi inaandaa Mapitio ya Ujenzi Bora. Programu yao inaendeshwa kwenye EC2 na RDS Multi-AZ. Hivi karibuni, waligundua kwamba:

- Mchakato wao wa usambazaji wakati mwingine huacha vipengele vya EC2 na matoleo tofauti ya maktaba (mgeuko wa usanidi)
- Hawana tahadhari ya kiotomatiki wakati kushindwa hama kwa RDS kunaanzishwa
- Watumiaji wao wote wa IAM wana AdministratorAccess
- Hawajajaribu mchakato wao wa kurejesha nakala kwa miezi 14

Ramani ya kila tatizo kwa nguzo INAYOHUSIKA ZAIDI ya Ujenzi Bora.

A) Mgeuko wa usanidi: Ubora wa Uendeshaji; Hakuna tahadhari ya kushindwa hama kwa RDS: Uaminifu; AdministratorAccess: Usalama; Hakuna jaribio la kurejesha nakala: Uaminifu

B) Mgeuko wa usanidi: Usalama; Hakuna tahadhari ya kushindwa hama kwa RDS: Ufanisi wa Utendaji; AdministratorAccess: Ubora wa Uendeshaji; Hakuna jaribio la kurejesha nakala: Uimarishaji wa Gharama

C) Mgeuko wa usanidi: Uaminifu; Hakuna tahadhari ya kushindwa hama kwa RDS: Ufanisi wa Utendaji; AdministratorAccess: Usalama; Hakuna jaribio la kurejesha nakala: Ubora wa Uendeshaji

D) Mgeuko wa usanidi: Usalama; Hakuna tahadhari ya kushindwa hama kwa RDS: Uaminifu; AdministratorAccess: Uimarishaji wa Gharama; Hakuna jaribio la kurejesha nakala: Usalama

**Kidokezo cha 1**: "Mgeuko wa usanidi" katika mchakato wa usambazaji → nguzo gani inashughulikia mazoea ya usambazaji?

**Kidokezo cha 2**: "AdministratorAccess" kwa watumiaji wote → nguzo gani inashughulikia udhibiti wa ufikiaji?

**Kidokezo cha 3**: "Kurejesha nakala haijajaribiwa" → nguzo gani inashughulikia kujaribu taratibu zako za uokoaji?

**Jibu**: A

**Maelezo**: Mgeuko wa usanidi katika usambazaji (mazingira yasiyosawa) ni tatizo la Ubora wa Uendeshaji — inahusu mazoea ya usambazaji wa kuaminika, thabiti. Hakuna tahadhari kwenye kushindwa hama kwa RDS kunamaanisha hujui taratibu za HA zinaanzishwa — tatizo la Uaminifu (kujua afya ya mfumo wako). AdministratorAccess kwa watumiaji wote inakiuka upendeleo mdogo — tatizo la Usalama. Kurejesha nakala ambacho haijajaribiwa kunamaanisha taratibu zako za Uaminifu (DR) hazijathibitishwa.

**Kwa nini si B?** B inaweka vibaya mgeuko wa usanidi kwa Usalama (matoleo yasiyosawa ya maktaba ni tatizo la uendeshaji wa usambazaji, si tishio la usalama) na AdministratorAccess kwa Ubora wa Uendeshaji (udhibiti wa ufikiaji ni wasiwasi wa Usalama, si mchakato wa uendeshaji).

**Kwa nini si C?** C inaweka vizuri AdministratorAccess katika Usalama lakini inaweka vibaya mgeuko wa usanidi kwa Uaminifu (uthabiti wa usambazaji ni Ubora wa Uendeshaji) na kurejesha nakala ambacho haijajaribiwa kwa Ubora wa Uendeshaji (kujaribu uokoaji ni wasiwasi wa Uaminifu — unathibitisha kwamba mfumo wako unaweza kurejesha, si kwamba michakato yako ni thabiti).

**Kwa nini si D?** D inaweka AdministratorAccess kwa Uimarishaji wa Gharama (ruhusa pana sana haziathiri gharama) na kurejesha nakala ambacho haijajaribiwa kwa Usalama (kutoweza kurejesha nakala ni kushindwa kwa Uaminifu, si udhaifu wa usalama).

*SAA-C03 Kikoa: Msalaba wa vikoa*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Fanya Mapitio ya Ujenzi Bora madogo ya programu unayoijua au unayoijenga. Kwa kila nguzo sita, andika:

- Kitu kimoja programu inachofanya vizuri
- Kitu kimoja programu inachoweza kuboresha

Kisha panga vipengele vyako vya maboresho kwa hatari (nini kinaweza zaidi kusababisha tukio au taka?) na kipaumbele (nini kingeathiri zaidi ikiwa kirekebishwa?).

*(Zoezi hili lina thamani zaidi kuliko linavyoonekana. Mazoea ya kukadiria usanifu kwa utaratibu kutoka pembe nyingi ni ujuzi wa msingi wa mhandisi mwandamizi.)*

## Tukio Baada ya Mikopo

Wiki tatu baada ya mapitio ya Ujenzi Bora, timu ilikuwa imetekeleza marekebisho matatu ya hatari ya juu.

Kupiga kiraka kwa EC2 sasa kilifanywa kiotomatiki kupitia AWS Systems Manager Patch Manager. Hati ya mchakato wa majibu ya tukio ilikuwepo (si kamili, lakini imeandikwa na kushirikiwa). Mpango wa nakala ya hifadhi ya joto wa multi-region ulikuwa umechorwa na umepangwa kwa utekelezaji robo mwaka ujao.

Priya alipitia ripoti ya Zana ya Ujenzi Bora. Idadi ya hatari ya juu: 0. Ya wastani: 3. Ya chini: 4.

"Tuko katika hali bora kuliko tulivyokuwa," alisema.

"Je, hiyo ni nzuri?" Leo aliuliza.

"Ni maendeleo," alisema. "Hukamilishi mapitio ya Ujenzi Bora. Unafanya maendeleo, kisha unapitiaje tena baada ya miezi sita."

Maya alikuwa akifikiria kitu.

"Tumetumia sura 31 tukijifunza huduma za maalum za AWS," alisema. "Na sasa tunaanza kutazama mfumo mzima. Ambayo ndiyo jinsi wasanifu wanavyofikiria."

"Tumekuwa tukifikiria kama wasanifu kwa muda," Leo alisema.

"Tumekuwa tukifanya maamuzi ya usanifu," Maya alisema. "Hiyo ni tofauti. Kufikiria kama msanifu kunamaanisha unatathmini maamuzi *kabla* ya kuyafanya, si baadaye."

"Tofauti ni nini?" Tom aliuliza.

"Katika sura inayofuata," alisema, "tunajaribu kujibu hilo."

Katika sura inayofuata: mapitio ya kweli ya usanifu yanaonekanaje, kutoka kanuni za kwanza.
