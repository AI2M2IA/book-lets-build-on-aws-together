# Sura ya 20: Mfano wa Mfanyakazi Huru

Kitendo cha arifa ya agizo kilifanya kazi mara moja haswa kwa kila agizo. Kati ya maagizo, hakikufanya chochote. Kwa masaa kumi na saba siku ya Jumanne, hakuna maagizo yaliyokuja. Wakati wa masaa hayo kumi na saba, kitendo hakugharimu chochote. Senti moja. Hakuna seva inayosubiri, hakuna kipengele kinachongoja, hakuna uwezo uliotengwa unaokaa bila kufanya kazi. Kitendo kilikuwepo. Kilifanya kazi tu.

Fan-out ya SNS/SQS ilikuwa ikifanya kazi. Huduma ya uchambuzi, huduma ya arifa, na huduma ya barua pepe zilikuwa zikitumia kila moja kutoka kwa foleni zao za SQS.

Lakini Priya aligundua kitu.

"Huduma ya barua pepe," alisema. "Tunatuma barua pepe ngapi kwa saa?"

Leo aliangalia vipimo. "Wastani wa 400. Kilele cha karibu 1,200 Ijumaa usiku."

"Na kipengele cha EC2 kinachoendesha huduma ya barua pepe — kinafanya kazi kwa muda gani?"

"Wakati wote. Masaa 24, siku 7."

"Hata saa 3 asubuhi tunapotuma barua pepe sifuri?"

Ukimya.

"Tunalipa kwa kompyuta kukaa huko bila kufanya chochote," Leo alisema.

"Kwa saa ngapi kwa siku?"

Ukimya zaidi.

"Karibu 18."

Tom alikuwa akisikiliza sana sasa.

**Seva Si Jibu Daima**

Vipengele vya EC2 ni vya kudumu. Unavianzisha naviendesha mpaka uvizime — masaa 24 kwa siku, siku 7 kwa wiki, bila kujali matumizi ya kweli. Kwa seva yako ya wavuti (ambayo inashughulikia trafiki wakati wote), hiyo ni sahihi. Kwa huduma ya barua pepe (ambayo inatuma makundi ya barua pepe kisha iko bila kufanya kazi kwa masaa), ni baya.

Auto Scaling Group inaweza kupunguza huduma ya barua pepe hadi kipengele kimoja wakati wa masaa ya chini ya msongamano. Lakini kipengele kimoja bado kinaendelea daima.

Je, kama nambuli ingefanya kazi tu palipolikuwa na kazi ya kufanya?

Hiyo ndiyo dhana ya **kompyuta bila seva (serverless computing)**.

**AWS Lambda: Nambuli Bila Seva**

**AWS Lambda** inakuruhusu kuendesha nambuli kwa kujibu matukio bila kuandaa au kusimamia seva. Unapakia kitendo, ubainishe kinachokianzisha, na Lambda kinaendesha inapoanzishwa.

Kitendo cha Lambda:

- Hana hali ya kudumu (kila uanzishaji ni wa kujitegemea)
- Kinaendesha hadi dakika 15 kwa uanzishaji
- Kinapanua kiotomatiki kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja
- Kinalipiwa tu kinapofanya kazi (kwa kila millisekunde 1 ya utekelezaji, iliyopigwa juu, kwa kila GB ya kumbukumbu iliyotengwa)

Hapatokei kizingiti, Lambda haigharimu chochote. Vichocheo vinapowaka, Lambda kinaendesha na kulipia. Vichocheo 10,000 vikiwaka wakati mmoja, Lambda kinaendesha uanzishaji 10,000 wa wakati mmoja. Kupanua ni kiotomatiki na karibu wa papo hapo.

**Vichocheo vya Matukio: Kinachomwamsha Lambda**

Vitendo vya Lambda haviendelei peke yake — vinajibu matukio. Vichocheo vya kawaida ni pamoja na:

- **Foleni ya SQS**: Shughulikia ujumbe kutoka kwa foleni. Lambda inatoa kura kwa foleni na kuanzisha kitendo na makundi ya ujumbe.
- **API Gateway**: Ombi la HTTP linakuja. API Gateway inaanzisha Lambda. Lambda inazalisha jibu.
- **Tukio la S3**: Faili linapakiwa kwenye S3. Lambda inalisindika (piga picha ukubwa, gawanya CSV, thibitisha hati).
- **SNS**: Ujumbe unachapishwa kwenye mada. Lambda inaarifiwa.
- **DynamoDB Streams**: Rekodi katika DynamoDB inabadilika. Lambda inashughulikia mabadiliko.
- **CloudWatch Events (EventBridge)**: Tukio la ratiba (kama kazi ya cron) linaendesha wakati uliobainishwa.
- **ALB**: Ombi la HTTP linafika kwenye kisambazaji cha mzigo. Lambda inaweza kushughulikia njia fulani.

Kwa Nimbus, huduma ya barua pepe ilikuwa kitendo cha Lambda kilichoanzishwa na foleni yake ya SQS. Ujumbe ukifika kwenye foleni, Lambda inaanzishwa na maudhui ya ujumbe, hutuma barua pepe kupitia SES (Simple Email Service), na hutoka.

Seva sifuri. Muda wa kusubiri sifuri. Gharama sifuri zinaposubiri.

**Tatizo la Kuanza Baridi (Cold Start)**

Vitendo vya Lambda vinafanya kazi katika **mazingira ya utekelezaji** — vyombo vidogo, vilivyotengwa. Kitendo kinapoanzishwa:

1. AWS inakagua ikiwa mazingira ya utekelezaji ya joto yanapatikana (moja ambalo lishughulikia uanzishaji wa hivi karibuni)
2. Ikiwa joto: kitendo kinaendesha mara moje
3. Ikiwa baridi: AWS inaanzisha mazingira mapya ya utekelezaji — kupakua nambuli yako, kuanzisha wakati wa utekelezaji, kuendesha nambuli yako ya uanzishaji — kisha kuendesha kitendo

**Kuanza baridi** kunaongeza millisekunde 100 hadi sekunde kadhaa za latency kulingana na wakati wa utekelezaji (Java na .NET wana kuanza baridi kwa muda mrefu zaidi kuliko Python na Node.js) na ukubwa wa pakiti yako ya nambuli.

Kwa usindikaji wa nje (kutuma barua pepe, kupiga picha ukubwa), kuanza baridi haionekani kwa watumiaji.

Kwa API za wakati mmoja (maombi ya HTTP ambapo mtumiaji anasubiri jibu), kuanza baridi kunaweza kusababisha majibu ya polepole mara kwa mara.

**Suluhisho**:

- **Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja (Provisioned concurrency)**: Pasha joto idadi maalum ya mazingira ya utekelezaji. Daima yako tayari. Unalipa kwa hili hata wasiposhughulikia maombi.
- **Ukubwa mdogo wa pakiti**: Nambuli ndogo huanzisha haraka zaidi.
- **Uanzishaji wa kupasha joto**: Piga simu za ratiba ili kuweka vitendo joto (mbinu ya kawaida lakini ya kizamani).
- **Chagua wakati sahihi wa utekelezaji**: Python na Node.js huanza baridi haraka zaidi kuliko Java.

**Bei za Lambda: Kwa Nini Tom Alitabasamu**

Bei za Lambda zina sehemu mbili:

1. **Ada ya ombi**: $0.20 kwa kila ombi milioni
2. **Ada ya muda**: $0.0000166667 kwa kila GB-sekunde (kumbukumbu iliyotengwa × sekunde za kuendesha)

Maombi ya kwanza milioni kwa mwezi ni ya bure (daima, si katika mwaka wa kwanza tu).

Tom alifanya hesabu kwa huduma ya barua pepe:

- Barua pepe 1,200 kwa siku × siku 30 = uanzishaji 36,000 kwa mwezi
- Kila uanzishaji huchukua ~sekunde 2 kwa kumbukumbu ya 256MB
- Muda: 36,000 × 2 × 0.25GB × $0.0000166667 = $0.30/mwezi
- Maombi: 36,000 << 1,000,000 (tabaka la bure) = $0.00/mwezi

Kipengele cha EC2 kwa huduma ya barua pepe: $18/mwezi.

Tom alikaa kimya kwa dakika. Kisha: "Tunapaswa kufanya hili kwa kila kitu."

**Lambda Ni Bora Kwa Nini (na Kwa Nini Si)**

Lambda ni bora kwa:

- **Usindikaji unaoendelewa na matukio**: Jibu matukio (upakiaji wa faili, ujumbe wa foleni, kazi za ratiba)
- **Kazi za muda mfupi**: Usindikaji unaokamilika vizuri ndani ya dakika 15
- **Trafiki ya ghafla, isiyotarajiwa**: Lambda inapanua kutoka 0 hadi maelfu papo hapo — hakuna utengaji wa awali
- **Shughuli za mara chache**: Ripoti inayofanya kazi saa 2 asubuhi kila siku. Kazi ya usafi inayofanya kazi kila wiki.
- **Nambuli ya gundi**: Vitendo vidogo vinavyohamisha data kati ya huduma

Lambda ni duni kwa:

- **Michakato ya muda mrefu**: Kikomo cha dakika 15 ni ukuta mgumu
- **Programu za hali**: Vitendo vya Lambda vina muundo usio na hali kwa muundo — kila uanzishaji ni wa kujitegemea
- **API za uendeshaji wa juu, latency ya chini**: Kuanza baridi kunaweza kusababisha mabadiliko ya latency; uanzishaji uliotolewa wa utekelezaji wa wakati mmoja hupunguza hili lakini unaongeza gharama
- **Programu zinazohitaji miunganisho ya kudumu**: Lambda haiwezi kudumisha bwawa la miunganisho ya hifadhidata ya muda mrefu kwa urahisi (ingawa zana za kuweka mkusanyiko wa miunganisho kama RDS Proxy husaidia)
- **Seva za wavuti za jadi**: Inawezekana, lakini si muundo wa asili

"Kwa hivyo Lambda si mbadala wa EC2," Maya alisema. "Ni zana tofauti kwa kazi tofauti."

"API ya wavuti ya Nimbus inabaki kwenye EC2 au ECS," Leo alithibitisha. "Huduma ya barua pepe, kigezo cha ukubwa wa picha, kizalishaji cha ripoti cha usiku, msafishaji wa kumbukumbu — hivyo vinahamia Lambda."

**Falsafa ya Kompyuta Bila Seva**

Lambda ni sehemu ya dhana pana: **bila seva (serverless)** — kujenga programu ambapo husimamiwa seva, nambuli tu.

Mrundiko kamili wa Nimbus wa bila seva unaweza kuonekana kama:

- API Gateway + Lambda (badala ya EC2 na seva ya wavuti)
- DynamoDB (badala ya RDS — pia bila seva, hakuna usimamizi wa seva)
- S3 (mali ya kudumu — bila seva kwa asili)
- SNS + SQS (ujumbe — bila seva)
- Lambda (usindikaji wote wa nyuma)

Mvuto: unaandika nambuli; AWS inasimamia kila kitu kingine. Hakuna kupiga kiraka, hakuna usanidi wa kupanua, hakuna upangaji wa uwezo.

Ukweli: bila seva ina ugumu wake wa uendeshaji — utatuzi wa vitendo vya Lambda vilivyosambazwa, kusimamia kuanza baridi, kuelewa vikwazo vya uanzishaji wa wakati mmoja. Si rahisi zaidi, ni tofauti tu.

## Nguvu na Mipaka

**Kwa nini Lambda ina nguvu**:

- Kulipa kwa matumizi ya kweli — gharama sifuri zinaposubiri
- Kupanua kiotomatiki bila usanidi
- Hakuna seva za kupiga kiraka au kudumisha
- Tabaka la bure la kujivunia (maombi milioni 1 kwa mwezi, bure milele)
- Muunganiko mkubwa na mabaki ya AWS

**Mahali ambapo mambo yanakuwa magumu**:

- Kuanza baridi ni wa kweli na unahitaji kushughulikia kwa makini kwa mzigo wa latency-nyeti
- Kikomo cha utekelezaji cha dakika 15 kinatenga kazi za muda mrefu
- Utatuzi ni mgumu zaidi — hakuna seva ya kudumu ya SSH kuingia
- Muundo usio na hali unahitaji kuhamisha hali yote nje (hifadhidata, kashe, S3)
- Vikwazo vya uanzishaji wa wakati mmoja (chaguo-msingi vya uanzishaji 1,000 wa wakati mmoja kwa akaunti) vinaweza kupunguza kasi kwa kiwango

## Muhtasari

- **AWS Lambda** inaendesha nambuli kwa kujibu matukio bila kusimamia seva.
- **Kulipa kwa matumizi**: inalipiwa kwa kila uanzishaji na kwa kila millisekunde 1 ya utekelezaji (iliyopigwa juu). Gharama sifuri zinaposubiri.
- Inapanua kiotomatiki kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja.
- **Kuanza baridi**: latency ya uanzishaji wakati hakuna mazingira ya utekelezaji ya joto. Hupunguzwa na uanzishaji uliotolewa wa utekelezaji au wakati wa utekelezaji mwepesi.
- Bora kwa: mzigo unaoendelewa na matukio, mfupi, ghafla, au wa mara chache.
- Si bora kwa: kazi za muda mrefu, programu za hali, API za uendeshaji wa juu wa latency ya chini bila uanzishaji uliotolewa wa utekelezaji.
- **Bila seva** ni falsafa ya muundo — unasimamia nambuli, si miundombinu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Lambda + S3**: Mchakato wa kawaida — faili iliyopakiwa kwenye S3 inaanzisha Lambda kwa usindikaji (uzalishaji wa picha ndogo, uchunguzi wa virusi, mabadiliko ya data). Hakuna seva inayohitajika.
- **Lambda + SQS**: Lambda inatoa kura kwa SQS na kushughulikia makundi. SQS inatoa utaratibu wa kujaribu tena/DLQ. Lambda inatoa usindikaji.
- **Lambda + API Gateway**: API ya HTTP bila seva. API Gateway inashughulikia upitishaji, uthibitisho, kupunguza kasi. Lambda inashughulikia mantiki ya biashara.
- **Ishara za kuanza baridi**: "mabadiliko ya latency kwenye ombi la kwanza," "nyakati za majibu zisizo sawa" → kuanza baridi. Suluhisho: uanzishaji uliotolewa wa utekelezaji (unagharimu pesa), pakiti ndogo, wakati wa utekelezaji mwepesi.
- **Vikwazo vya utekelezaji**: dakika 15 za juu. Kumbukumbu ya juu ya 10GB. Uhifadhi wa muda wa /tmp wa 512MB kwa chaguo-msingi (inaweza kusanidiwa hadi 10GB). Vikwazo hivi vinaonekana katika hali za mtihani.
- **Uanzishaji wa wakati mmoja wa Lambda**: Utekelezaji wa chaguo-msingi wa uanzishaji 1,000 wa wakati mmoja kwa akaunti (unaweza kuongezwa). **Uanzishaji uliotengwa wa wakati mmoja**: hakikisha kitendo kinapata idadi maalum ya utekelezaji; inazuia vitendo vingine kutumia vile. **Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja**: pasha joto idadi ya mazingira ya utekelezaji mapema.
- **Ramani ya chanzo cha tukio**: Kipengele cha Lambda kinachounganisha SQS/DynamoDB Streams/Kinesis kwa Lambda. Lambda inatoa kura kwa chanzo na kurekebisha rekodi.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tatizo la kuanza baridi. Katika aina gani ya programu kuanza baridi kungeleta matatizo zaidi? Katika aina gani ingekuwa inakubalika?

*(Kidokezo: Linganisha API ya wakati halisi (mtumiaji anasubiri jibu) na kazi ya nyuma ya nje (mtumiaji tayari amepata uthibitisho wake na anafanya mambo mengine).)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni inapokea picha za bidhaa kutoka kwa wasambazaji wao kupitia ndoo ya S3. Kila picha inahitaji kupigwa ukubwa hadi vipimo vinne vya kawaida (picha ndogo, ndogo, wastani, kubwa) na kuhifadhiwa tena kwenye S3. Kiwango ni kisichotarajiwa — siku zingine picha 10, siku zingine 100,000. Usindikaji lazima ukamilike ndani ya dakika 10 kwa picha. Gharama lazima zipunguzwe.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Vipengele vya EC2 katika Auto Scaling Group vinavyofuatilia ndoo ya S3 kwa utafutaji mrefu  
B) Arifa ya tukio ya S3 inayoanzisha kitendo cha Lambda kinachopiga ukubwa picha na kuhifadhi matokeo kwenye S3  
C) Kazi za ECS Fargate zilizoanzishwa na foleni ya SQS, na matukio ya S3 yakichapisha kwenye foleni  
D) Kipengele kilichotengwa cha EC2 chenye kazi ya cron inayokagua S3 kila dakika kwa picha mpya

**Kidokezo cha 1**: Kiwango kisichotarajiwa kinapendelea kupanua-hadi-sifuri. Chaguo gani hufanya hivyo?

**Kidokezo cha 2**: Dakika 10 kwa picha iko ndani ya kikomo cha dakika 15 cha Lambda. Angalia kama kazi ya kupiga ukubwa picha inafaa kwa vikwazo vya Lambda.

**Kidokezo cha 3**: Kipengele kilichotengwa cha EC2 kinachoendesha masaa 24/7 ni ghali na hakipanui.

**Jibu**: B

**Maelezo**: Arifa za tukio za S3 zinaanzisha Lambda picha inapopakiwa. Lambda inapiga ukubwa picha hadi vipimo vinne na kuhifadhi matokeo kwenye S3. Lambda inapanua kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja kiotomatiki, kushughulikia kiwango kisichotarajiwa bila utengaji wa awali. Gharama sifuri picha zinaposindikwa.

**Kwa nini si A?** EC2 katika ASG haipanui hadi sifuri — kipengele kimoja cha chini kinaendesha daima. Utafutaji mrefu wa S3 si utaratibu wa asili wa tukio la S3. Gharama ya juu zaidi ya Lambda kwa mzigo wa ghafla.

**Kwa nini si C?** ECS Fargate inafanya kazi, lakini ni ngumu zaidi (inahitaji usimamizi wa chombo, ECR, maudhui ya kazi) na ina latency ya kuanza baridi kidogo ya juu zaidi kuliko Lambda kwa mzigo wa ghafla. Lambda ni rahisi zaidi kwa matumizi haya.

**Kwa nini si D?** Kipengele kilichotengwa cha EC2 ni hatua moja ya kushindwa, haipanui, inaendesha masaa 24/7, na mbinu ya msingi ya cron ina ucheleweshaji wa hadi sekunde 60 wa kugundua.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inataka kuzalisha ripoti ya kila siku saa 5 asubuhi na migahawa kumi bora ya awali ya siku iliyopita kwa kiwango cha agizo. Ripoti inazalishwa kutoka kwa data ya DynamoDB, imeandaliwa kama PDF, imehifadhiwa kwenye S3, na kutumwa kwa barua pepe kwa washirika wote wa mgahawa.

Buni mzunguko kamili wa Lambda kwa hili. Kinaanzishwa na nini Lambda? Kinachofanyika ikiwa uzalishaji wa PDF utachukua dakika 12? Vipi ikiwa kuna washirika 5,000 wa mgahawa na kuwatumia wote barua pepe inachukua muda? Je, ungetumia Lambda moja au nyingi?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kuunda Lambda na huduma zingine.)*

## Tukio Baada ya Mikopo

Tom alipitizia bili mwishoni mwa mwezi.

Huduma ya barua pepe: iliondoka kwenye bili ya EC2.
Kazi ya kupiga ukubwa picha: iliondoka.
Kazi ya usafi wa kila usiku: iliondoka.
Ripoti ya uchambuzi ya kila siku: iliondoka.

Jumla ya malipo ya Lambda kwa mwezi: $4.23.

"Dola nne," Tom alisema.

"Na senti ishirini na tatu," Leo aliongeza kwa msaada.

Tom alitazama bili ya mwezi uliopita, wakati huduma hizo zote zilikuwa kwenye vipengele vya EC2.

"Tulikuwa tukilipa $187 kwa mzigo huo huo."

"Lambda hailipii muda wa kusubiri," Leo alisema. "Na huduma nyingi hizo zilikuwa zinasubiri 90% ya wakati."

Tom alitazama skrini kwa muda mrefu.

"Nakubali kila kitu nilichosema kuhusu bila seva kuwa neno la mitindo," alisema.

Katika sura inayofuata: chombo cha kupakia ambacho kinafanya seva yoyote ihisi kama nyumbani.
