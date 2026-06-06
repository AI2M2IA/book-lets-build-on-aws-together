# Sura ya 20: Mfano wa Mfanyakazi Huru

Ulikuwa mchana wa Jumatano wa kimya. Priya alikuwa ameondoa vifaa vyake vya kusikilizia kwa mara moja, na ofisi ilikuwa na aina ile ya mlio wa chini uliomaanisha kila mtu alikuwa akizingatia lakini hakuna aliyekuwa akiogopa. Leo alikuwa na dashibodi ya gharama wazi kwenye skrini moja na orodha ya vipengele vya EC2 kwenye nyingine.

Fikiria mfanyakazi huru anayefanya kazi kwa simu. Hakai mezani kuanzia saa tatu hadi saa kumi na moja. Anasubiri. Simu inalia, anafanya kazi, anatuma ankara, anarudi kusubiri. Hakuna kazi, hakuna gharama. Mlipuko wa maombi, anayashughulikia yote wakati mmoja. Unalipa tu kwa masaa yaliyofanyiwa kazi kwa kweli — si masaa aliyokaa akipatikana.

Huo ndio mfano ambao sura hii inahusu.

Kuna ujanja hapa unaostahili kushikilia. Mfano wa jadi ni: ajiri mfanyakazi, lipa kwa masaa 8, pata matokeo yanayobadilika. Mfano wa mfanyakazi huru ni: lipa tu wakati simu inalia, pata haswa kilichoombwa. Kwa kampuni yenye mahitaji yanayotabirika, ya kudumu, mfano wa mfanyakazi ni wenye ufanisi zaidi — unajua simu italia daima, kwa hivyo kulipa kwa saa ni sawa na hakuna gharama ya kuajiri na kuachisha. Kwa kampuni yenye mahitaji yanayobadilika, ya ghafla, au yasiyo ya mara kwa mara, mfano wa mfanyakazi huru ni wa bei nafuu sana.

AWS inatoa mfano huo kwa kompyuta — na kama una mantiki kunategemea muundo wako wa mahitaji. Swali la kwanza kamwe si "je, mfano huu ni mzuri?" bali "mzigo wangu wa kazi unaonekanaje kwa kweli?"

Kwa mzigo mwingi wa kazi mkubwa kuliko wa kampuni changa: mchanganyiko. Vitu vingine vinaendesha daima (seva ya API, hifadhidata). Vitu vingine vinaendesha tu vinapoanzishwa (usindikaji wa matukio, uzalishaji wa ripoti, kupiga picha ukubwa). Mfano wa mfanyakazi huru ni kwa kategoria ya pili — na Nimbus ilikuwa karibu kugundua ni kiasi gani cha bili yake kilikuwa hapo.

---

Fan-out ya SQS/SNS ilikuwa imetenganisha mtiririko wa agizo, lakini wafanyakazi wanaotumia foleni hizo bado waliendeshwa kwenye vipengele vya EC2 vilivyotoza kwa saa — bila kujali ni barua pepe ngapi walizituma kwa kweli. Usanifu ulikuwa sahihi; mfano wa gharama bado ulikuwa na uvujaji.

Priya aligundua kwanza.

"Huduma ya barua pepe," alisema. "Tunatuma barua pepe ngapi kwa siku?"

Leo aliangalia vipimo. "Wastani wa 400 kwa siku. Kilele cha karibu 1,200 Ijumaa usiku."

"Na kipengele cha EC2 kinachoendesha huduma ya barua pepe — kinafanya kazi kwa muda gani?"

"Daima. Masaa 24, siku 7."

"Hata saa 9 usiku tunapotuma barua pepe sifuri?"

Ukimya.

Leo aliibua grafu ya CPU ya CloudWatch kwa kipengele cha EC2 cha huduma ya barua pepe. Grafu ilionyesha masaa 18 ya utendaji wa kuendelea. Kwenye kilele cha Ijumaa: CPU kwa 38%, ikishughulikia mlipuko wa barua pepe. Baada ya usiku wa manane: CPU ilishuka hadi 3%. Ilibaki hapo hadi maagizo ya chakula cha mchana yalipoanza.

Asilimia tatu ya CPU kwa masaa 18 mfululizo. Kipengele kilikuwa kikiendesha. Kilikuwa kikilipisha. Hakikuwa kikifanya kitu chochote cha maana.

"Tunalipa kwa kompyuta kukaa huko bila kufanya chochote," Leo alisema.

"Kwa saa ngapi kwa siku?"

Ukimya zaidi.

"Karibu 18."

Tom alikuwa akisikiliza sana sasa.

"Na si huduma ya barua pepe tu," Priya aliongeza. "Huduma ya kupiga picha za migahawa ukubwa inaendesha kwa 1% ya CPU wakati mwingi. Inaruka tu mgahawa unapopakia menyu mpya. Ambayo hutokea, je, mara chache kwa siku kwa kila mgahawa?"

"Ndiyo," Leo alithibitisha.

"Kazi ya usafi ya usiku inayofuta faili za muda — hiyo inaendesha kwa dakika 4 saa 8 usiku kisha inakaa bila kufanya kazi kabisa kwa masaa 23 na dakika 56."

"Pia ndiyo."

Muundo ulikuwa ule ule katika huduma zote ndogo za Nimbus: kompyuta iliyolipiwa kwa masaa 24 kwa siku, iliyotumika kwa sehemu ya hayo.

---

**Seva Si Jibu Daima**

Vipengele vya EC2 ni vya kudumu. Unaanzisha kimoja na kinaendesha mpaka ukizime — masaa 24 kwa siku, siku 7 kwa wiki, bila kujali matumizi ya kweli. Kwa seva yako ya wavuti (ambayo inashughulikia trafiki wakati wote), hiyo ni sahihi. Kwa huduma ya barua pepe (ambayo inatuma milipuko ya barua pepe kisha iko bila kufanya kazi kwa masaa), ni ya kupoteza.

Auto Scaling Group inaweza kupunguza huduma ya barua pepe hadi kipengele kimoja wakati wa masaa ya chini ya msongamano. Lakini kipengele kimoja bado kinaendesha daima.

Hili ndilo swali ambalo Tom aliendelea kurudia alipokuwa akiangalia bili: kila huduma ilikuwa ikifanya nini kwa kweli wakati wa masaa hayo 18 ya 3% ya CPU? Si kitu, kiufundi — kipengele kilikuwa kikisubiri, kikikagua matukio, kikidumisha hali yake. Lakini kutoka mtazamo wa biashara: kitu. Huduma haikuwa ikitoa thamani. Ilikuwa ikilipisha.

Kwa mzigo wa kazi ambao kwa kweli haufanyi kazi wakati mwingi, kipengele cha EC2 kilichowashwa daima ni kulipa kodi ya nyumba unayoitembelea tu wikendi. Nyumba ni yako; kodi haisimami.

Mfano wa mfanyakazi huru unatatua hili kabisa. Msimbo upo. Tu hauendeshi mpaka kuwe na sababu ya kuuendesha. Hakuna gharama ya kusubiri. Hakuna uwezo uliotengwa. Hakuna seva inayosubiri karibu na simu.

Hiyo ndiyo dhana ya **kompyuta bila seva (serverless computing)**.

**AWS Lambda: Msimbo Bila Seva**

**AWS Lambda** inakuruhusu kuendesha msimbo kwa kujibu matukio bila kuandaa au kusimamia seva. Unapakia kitendo, ubainishe kinachokianzisha, na Lambda inakiendesha kichocheo kinapowaka.

Kitendo cha Lambda:

- Hakina hali ya kudumu (kila uanzishaji ni wa kujitegemea)
- Kinaendesha hadi dakika 15 kwa uanzishaji
- Kinapanua kiotomatiki kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja
- Kinalipiwa tu kinapofanya kazi (kwa kila millisekunde 1 ya utekelezaji, iliyopigwa juu, kwa kila GB ya kumbukumbu iliyotengwa)

Hapatokei kizingiti, Lambda haigharimu chochote. Vichocheo vinapowaka, Lambda inaendesha na kulipisha. Vichocheo 10,000 vikiwaka wakati mmoja, Lambda inaendesha uanzishaji 10,000 wa wakati mmoja. Kupanua ni kiotomatiki na karibu wa papo hapo.

**Vichocheo vya Matukio: Kinachoiamsha Lambda**

Vitendo vya Lambda haviendi peke yake — vinajibu matukio. Vichocheo vya kawaida ni pamoja na:

- **Foleni ya SQS**: Shughulikia ujumbe kutoka kwa foleni. Lambda inatoa kura kwa foleni na kuanzisha kitendo na makundi ya ujumbe.
- **API Gateway**: Ombi la HTTP linakuja. API Gateway inaanzisha Lambda. Lambda inazalisha jibu.
- **Tukio la S3**: Faili linapakiwa kwenye S3. Lambda inalisindika (piga picha ukubwa, gawanya CSV, thibitisha hati).
- **SNS**: Ujumbe unachapishwa kwenye mada. Lambda inaarifiwa.
- **DynamoDB Streams**: Rekodi katika DynamoDB inabadilika. Lambda inashughulikia mabadiliko.
- **CloudWatch Events (EventBridge)**: Tukio la ratiba (kama kazi ya cron) linaendesha wakati uliobainishwa.
- **ALB**: Ombi la HTTP linafika kwenye kisambazaji cha mzigo. Lambda inaweza kushughulikia njia fulani.

Kwa Nimbus, huduma ya barua pepe ikawa kitendo cha Lambda kilichoanzishwa na foleni yake ya SQS. Ujumbe ukifika kwenye foleni, Lambda inaanzishwa na maudhui ya ujumbe, hutuma barua pepe kupitia SES (Simple Email Service), na hutoka.

Seva sifuri. Muda wa kusubiri sifuri. Gharama sifuri zinaposubiri.

Mchakato wa Lambda + SQS unastahili kuingizwa ndani: SQS inashughulikia foleni, udumu, mantiki ya kujaribu tena, na DLQ. Lambda inashughulikia usindikaji. Unapata faida za kutengana za SQS pamoja na uchumi wa kupanua-hadi-sifuri wa Lambda. Hakuna huduma inayofanya kazi ya nyingine. Zinaungana kwa usafi.

"Kinachotokea na ujumbe usio sahihi kwenye foleni?" Priya aliuliza. "Je, ingizo baya linaweza kuangusha Lambda kwa njia inayoathiri vitendo vingine katika akaunti?"

Uanzishaji wa Lambda umetengwa kutoka kwa kila mmoja. Kitendo kinachoanguka hakiathiri vitendo vingine. Lambda inayotupa kasoro isiyoshughulikiwa kwenye ujumbe usio sahihi: ujumbe unarudi kwenye foleni, unajaribu tena hadi kikomo kilichosanidiwa, kisha unahamia DLQ. Lambda yenyewe inabaki ikipatikana kwa ujumbe unaofuata. Uthibitishaji wa ingizo ndani ya kishughulikiaji cha Lambda bado ni muhimu — kushika data isiyo sahihi kabla ya kujaribu kuisindika — lakini ujumbe mmoja mbaya hauwezi kuangusha kitendo.

**Tatizo la Kuanza Baridi (Cold Start)**

Vitendo vya Lambda vinafanya kazi katika **mazingira ya utekelezaji** — vyombo vidogo, vilivyotengwa. Kitendo kinapoanzishwa:

1. AWS inakagua ikiwa mazingira ya utekelezaji ya joto yanapatikana (moja ambalo lilishughulikia uanzishaji wa hivi karibuni)
2. Ikiwa joto: kitendo kinaendesha mara moja
3. Ikiwa baridi: AWS inaanzisha mazingira mapya ya utekelezaji — kupakua msimbo wako, kuanzisha wakati wa utekelezaji, kuendesha msimbo wako wa uanzishaji — kisha kuendesha kitendo

**Kuanza baridi** kunaongeza millisekunde 100 hadi sekunde kadhaa za latency kulingana na wakati wa utekelezaji (Java na .NET wana kuanza baridi kwa muda mrefu zaidi kuliko Python na Node.js) na ukubwa wa pakiti yako ya msimbo.

Unaweza kuwa unajiuliza: ikiwa Lambda inaanza upya kila wakati, je, hilo halifanyi iwe polepole zaidi kuliko seva inayoendesha tayari? Ndiyo — wakati mwingine. Hilo ndilo tatizo la kuanza baridi, na linajalisha kwa API zinazomwelekea mtumiaji nyeti kwa muda. Halijalishi hata kidogo kwa kazi za nyuma ambapo mtumiaji tayari amepokea uthibitisho wake. Kuanza baridi kwa millisekunde 200 kwenye huduma ya barua pepe inayoendesha nyuma hakuonekani kwa mtu yeyote.

Kwa usindikaji wa nje (kutuma barua pepe, kupiga picha ukubwa), kuanza baridi hakuonekani kwa watumiaji.

Kwa API za wakati mmoja (maombi ya HTTP ambapo mtumiaji anasubiri jibu), kuanza baridi kunaweza kusababisha majibu ya polepole mara kwa mara.

**Suluhisho**:

- **Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja (Provisioned concurrency)**: Pasha joto idadi maalum ya mazingira ya utekelezaji. Daima yako tayari. Unalipa kwa hili hata wasiposhughulikia maombi.
- **Ukubwa mdogo wa pakiti**: Msimbo mdogo huanzisha haraka zaidi.
- **Uanzishaji wa kupasha joto**: Piga simu za ratiba ili kuweka vitendo joto (mbinu ya kawaida lakini ya kizamani).
- **Chagua wakati sahihi wa utekelezaji**: Python na Node.js huanza baridi haraka zaidi kuliko Java.

**Uchunguzi Halisi wa Kuanza Baridi**

Wiki mbili baada ya uhamiaji wa Lambda, Leo alipokea ujumbe wa Slack kutoka kwa mshirika wa mgahawa: "Uthibitisho wa agizo wakati mwingine huchukua sekunde 3. Kawaida ni haraka. Kinachoendelea ni nini?"

Leo aliibua vipimo vya CloudWatch kwa kitendo cha Lambda. Katika grafu ya "Duration," angeweza kuona muundo: uanzishaji wa kwanza baada ya pengo lolote la zaidi ya dakika 15-20 ungeruka hadi millisekunde 2,800-3,200. Uanzishaji uliofuata: millisekunde 180-220.

Kuanza baridi kwa kawaida.

Aliibua ufuatiliaji wa X-Ray kwa moja ya uanzishaji wa sekunde 3. Mstari wa muda uliionyesha wazi:

- Awamu ya uanzishaji: 2,640ms (kupakua msimbo wa kitendo, kuanzisha wakati wa utekelezaji wa Node.js, kuendesha msimbo wa uanzishaji wa kiwango cha moduli)
- Utekelezaji wa kitendo cha kishughulikiaji: 290ms

Awamu ya uanzishaji ilikuwa tatizo. Aliangalia msimbo wa uanzishaji. Kitendo kilikuwa kikiingiza SDK kubwa, kikianzisha muunganisho wa hifadhidata, na kupakia usanidi kutoka AWS Secrets Manager — yote wakati wa kuanza.

"Baadhi ya uanzishaji huu unahitaji kutokea mara moja tu kwa kila mazingira ya utekelezaji," Leo alisema. "Lakini unatokea kwenye kila kuanza baridi."

Aliupanga upya msimbo wa Lambda ili kuanzisha muunganisho wa hifadhidata nje ya kitendo cha kishughulikiaji (ili utumike tena katika uanzishaji wa joto) na akapunguza ukubwa wa pakiti kwa kuondoa moduli za SDK zisizotumika. Pia alibadilisha kutoka kufunga SDK nzima ya AWS hadi kuingiza tu huduma mahususi alizozihitaji.

Baada ya uboreshaji:

- Muda wa kuanza baridi: 1,100ms (bado upo, lakini si mkali sana)
- Uanzishaji wa joto: 165ms

Kuanza baridi kwa sekunde 1.1 bado kulitokea mara kwa mara. Kwa huduma ya barua pepe (ya nje, ucheleweshaji unaomwelekea mtumiaji hauonekani), hili lilikubalika. Kwa Lambda ya arifa ya mgahawa (inayomwelekea mteja, iliyoagizwa kutoka kompyuta kibao), Priya alisukuma kwa uanzishaji uliotolewa wa utekelezaji wa wakati mmoja: mazingira mawili yaliyopashwa joto mapema daima tayari.

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Mazingira mawili ya uanzishaji uliotolewa wa utekelezaji kwa 256MB: karibu $5.40/mwezi. Milipuko ya latency ilisimama.

**Bei za Lambda: Kwa Nini Tom Alitabasamu**

Bei za Lambda zina sehemu mbili:

1. **Ada ya ombi**: $0.20 kwa kila ombi milioni
2. **Ada ya muda**: $0.0000166667 kwa kila GB-sekunde (kumbukumbu iliyotengwa × sekunde za kuendesha)

Maombi ya kwanza milioni kwa mwezi ni ya bure (daima, si katika mwaka wa kwanza tu).

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza kabla Leo hajafungua kikokotoo.

Tom alifanya hesabu kwa huduma ya barua pepe mwenyewe:

- Dhani kila siku ni Ijumaa — hali mbaya zaidi: barua pepe 1,200 kwa siku × siku 30 = uanzishaji 36,000 kwa mwezi
- Kila uanzishaji huchukua ~sekunde 2 kwa kumbukumbu ya 256MB
- Muda: 36,000 × 2 × 0.25GB × $0.0000166667 = $0.30/mwezi
- Maombi: 36,000 << 1,000,000 (tabaka la bure) = $0.00/mwezi

"Na hizo GB-sekunde 18,000 ziko vizuri ndani ya GB-sekunde 400,000 za muda ambazo daima ni za bure," Tom aliongeza. "Kwa hivyo ada halisi ingekuwa sifuri. Lakini ninapuuza tabaka la bure kwa makusudi — nataka kujua gharama halisi ya kipimo."

Kipengele cha EC2 kwa huduma ya barua pepe: $18/mwezi.

"Tayari nilikiweka — oh." Leo alijizuia. Alikuwa amesukuma Lambda ya huduma ya barua pepe kwenye uzalishaji kabla ya kumaliza usanidi wa DLQ. "Nipe dakika tano."

Tom alikaa kimya kwa muda. Kisha: "Tunapaswa kufanya hili kwa kila kitu."

**Lambda Ni Bora Kwa Nini (na Kwa Nini Si)**

"Subiri — lakini *kwa nini* tusitumie tu Lambda kwa kila kitu, basi?" Maya aliuliza. "Ikiwa ni ya bei nafuu na inapanua kiotomatiki, kuna nini cha kuvizia?"

"Kikomo cha dakika 15," Leo alisema. "Na kuanza baridi kwa kitu chochote kinachomwelekea mtumiaji. Na kutokuwa na hali — huwezi kuweka kitu chochote kwenye kumbukumbu kati ya uanzishaji."

Ikiwa mzigo wako wa kazi ni wa ghafla, unaoendelewa na matukio, na unakamilika ndani ya dakika 15, Lambda itagharimu sehemu ya kipengele cha EC2 kilichowashwa daima — lakini ikiwa mzigo wako wa kazi ni kazi ya usindikaji wa data ya muda mrefu inayokaribia au inazidi kikomo cha dakika 15, Lambda ni zana isiyo sahihi na utahitaji ECS, Batch, au mbinu inayotegemea EC2.

Lambda ni bora kwa:

- **Usindikaji unaoendelewa na matukio**: Jibu matukio (upakiaji wa faili, ujumbe wa foleni, kazi za ratiba)
- **Kazi za muda mfupi**: Usindikaji unaokamilika vizuri ndani ya dakika 15
- **Trafiki ya ghafla, isiyotabirika**: Lambda inapanua kutoka 0 hadi maelfu papo hapo — hakuna utengaji wa awali
- **Shughuli za mara chache**: Ripoti inayoendesha saa 8 usiku kila siku. Kazi ya usafi inayoendesha kila wiki.
- **Msimbo wa gundi**: Vitendo vidogo vinavyohamisha data kati ya huduma

Unaweza kuwa unajiuliza: kinachotokea kwa upanuzi wa Lambda wakati mlipuko wa ghafla wa matukio 10,000 unafika wakati mmoja? Kikomo cha uanzishaji wa wakati mmoja cha Lambda chaguo-msingi ni utekelezaji 1,000 wa wakati mmoja kwa akaunti. Ikiwa matukio 10,000 yatafika kwa mara moja, hadi uanzishaji 1,000 unaendesha mara moja; iliyobaki inasubiri kwenye foleni ya SQS (ikiwa imeanzishwa kupitia SQS) na inashughulikiwa uwezo unapojiachilia. Hii kawaida ni sawa kwa usindikaji unaotegemea foleni. Kwa matumizi nyeti kwa latency, kikomo cha mlipuko cha Lambda (kiwango cha awali ambacho utekelezaji mpya wa wakati mmoja unaongezwa) kinaweza kusababisha kupunguza kasi kwa muda mfupi wakati wa milipuko ya ghafla — uanzishaji uliotolewa wa utekelezaji unaepuka hili kwa kuwa na uwezo uliotengwa mapema.

Kwa huduma ya barua pepe ya Nimbus katika kiwango chao cha sasa, uanzishaji 1,000 wa wakati mmoja ulikuwa zaidi sana ya watakavyohitaji. Lakini ni kizuizi sahihi cha kujua kabla hujakifikia.

Lambda ni duni kwa:

- **Michakato ya muda mrefu**: Kikomo cha dakika 15 ni ukuta mgumu
- **Programu za hali**: Vitendo vya Lambda havina hali kwa muundo — kila uanzishaji ni wa kujitegemea
- **API za uendeshaji wa juu, latency ya chini**: Kuanza baridi kunaweza kusababisha milipuko ya latency; uanzishaji uliotolewa wa utekelezaji hupunguza hili lakini unaongeza gharama
- **Programu zinazohitaji miunganisho ya kudumu**: Lambda haiwezi kudumisha bwawa la miunganisho ya hifadhidata ya muda mrefu kwa urahisi (ingawa zana za kuweka mkusanyiko wa miunganisho kama RDS Proxy husaidia)
- **Seva za wavuti za jadi**: Inawezekana, lakini si muundo wa asili

**Ukuta wa Dakika 15: Wakati Lambda ni Zana Isiyo Sahihi**

Wiki tatu baada ya uhamiaji, Leo alijaribu kuhamisha mzigo mmoja zaidi wa kazi kwa Lambda: kizalishaji cha ripoti ya uchambuzi ya usiku. Kilivuta data ya agizo kutoka kwa hifadhidata, kikaiunganisha na metadata ya mgahawa, kikakokotoa takwimu, na kikazalisha PDF.

Usiku wa kwanza, uanzishaji wa Lambda ulishindwa na hitilafu ya muda kuisha.

"Uzalishaji wa ripoti ulichukua dakika 17," Leo alisema asubuhi iliyofuata.

"Kiwango cha juu cha Lambda ni 15," Priya alisema.

"Ndiyo. Najua hilo sasa."

Alikuwa ameangalia muda wa wastani wa usindikaji (dakika 8) na akadhani Lambda ingefanya kazi. Hakuwa ameangalia mkia — usiku ambapo kiasi cha data kilikuwa juu zaidi na hoja ilichukua muda mrefu zaidi. Usiku huo, dakika 15 hazikutosha.

"Kwa hivyo ripoti tu... haizalishwi?" Maya aliuliza.

"Sahihi. Hakuna arifa ya hitilafu. Hakuna ripoti ya sehemu. Ukimya tu."

"Tayari nilikiweka — oh," Leo alisema.

Hii ilikuwa moja ya njia mahususi ambazo Lambda inashindwa bila adabu: muda kuisha hutoa hakuna matokeo, hakuna ujumbe wa hitilafu katika programu, kumbukumbu ya hitilafu ya CloudWatch tu. Ikiwa hufuatilii hitilafu za muda kuisha za Lambda mahususi, unaweza usigundue kwa siku.

Marekebisho: hamisha kizalishaji cha ripoti kwa ECS Fargate — vyombo bila kusimamia seva; sura inayofuata — ambayo haina kikomo cha muda. Lambda ilikuwa zana isiyo sahihi kwa mzigo wa kazi ambao unaweza kuzidi dakika 15 hata mara kwa mara. Somo halikuwa "Lambda ni mbaya." Somo lilikuwa "Lambda ni zana sahihi kwa mzigo wa kazi unaofaa ndani ya vikwazo vyake — na chanzo cha kushindwa kwa kushangaza wasipofaa."

**RDS Proxy: Kuweka Mkusanyiko wa Miunganisho kwa Lambda**

Asili ya Lambda ya kutokuwa na hali inaunda tatizo mahususi la hifadhidata.

Kipengele cha EC2 kinapounganishwa na RDS, kinadumisha bwawa la miunganisho la kudumu. Programu inatumia tena miunganisho kutoka kwa bwawa. RDS inaweza kushughulikia, tuseme, miunganisho 200 ya wakati mmoja.

Lambda inaposhughulikia uanzishaji 500 wa wakati mmoja, kila uanzishaji unajaribu kufungua muunganisho wake wa hifadhidata. Hiyo ni miunganisho 500 mipya — ikilemea hifadhidata inayosaidia 200.

**Amazon RDS Proxy** inakaa kati ya vitendo vya Lambda na RDS, ikidumisha bwawa la miunganisho la kudumu na kupitisha miunganisho ya muda mfupi ya Lambda kupitia hilo.

Badala ya: uanzishaji wa Lambda → muunganisho mpya wa RDS (kwa kila moja ya uanzishaji 500 wa wakati mmoja)

Kwa RDS Proxy: uanzishaji wa Lambda → RDS Proxy → bwawa la miunganisho 20 ya kudumu ya RDS

"Proxy inahitaji stakabadhi za RDS," Priya alisema. "Hizo zinaishi wapi? Je, inazihifadhi?"

RDS Proxy inahifadhi stakabadhi katika Secrets Manager na inazizungusha kiotomatiki. Jukumu la IAM la kitendo cha Lambda linakipa ufikiaji wa proxy (kwa kutumia uthibitisho wa IAM), si kwa stakabadhi za RDS moja kwa moja. Stakabadhi kamwe hazifichuliwi kwa msimbo wa Lambda.

"Kwa hivyo kitendo cha Lambda kinathibitisha kupitia IAM," Leo alithibitisha, "na proxy inashughulikia stakabadhi halisi za hifadhidata."

Kwa Lambda ya usindikaji wa agizo ya Nimbus (ile inayouliza RDS kwa uthibitishaji wa agizo), RDS Proxy iliondoa kuisha kwa bwawa la miunganisho wakati wa kilele cha trafiki ya Ijumaa.

**Lambda Layers: Tegemezi Zinazoshirikiwa**

Lambda ya huduma ya barua pepe, Lambda ya arifa, na Lambda ya ripoti zote zilishiriki msimbo ule ule wa maktaba ya ndani: vitendo vya manufaa vya kuumbiza sarafu, kusafisha maingizo, kurekodi kwa muundo wa kawaida.

Bila Lambda Layers, msimbo huo uliyoshirikiwa ilibidi ufungwe katika pakiti ya usambazaji ya kila kitendo. Vitendo vitatu, nakala tatu za maktaba ile ile ya 2MB. Maktaba iliposasishwa, vitendo vyote vitatu vilihitaji usambazaji mpya.

**Lambda Layers** ni pakiti tofauti ambazo vitendo vya Lambda vinaweza kurejea wakati wa utekelezaji. Maktaba iliyoshirikiwa ilitolewa kuwa tabaka. Vitendo vitatu virejea tabaka. Sasisho za maktaba iliyoshirikiwa zilimaanisha kusasisha toleo la tabaka — si kusambaza tena vitendo vyote vitatu.

Faida ya ziada: pakiti ndogo za vitendo binafsi zinamaanisha kuanza baridi kwa haraka zaidi.

"Kitu kimoja ambacho tabaka hazibadilishi: jukumu la utekelezaji," Priya alisema. "Ikiwa Lambda ina ruhusa pana mno, kitendo kilichodukuliwa kinaweza kufikia kila kitu katika akaunti."

"Kanuni ile ile kama majukumu ya EC2," Leo alisema. "Upendeleo wa chini zaidi. Kila Lambda inapata tu ruhusa inazohitaji kwa kweli."

"Kwa hivyo Lambda si mbadala wa EC2," Maya alisema. "Ni zana tofauti kwa kazi tofauti."

"API ya wavuti ya Nimbus inabaki kwenye EC2 au ECS," Leo alithibitisha. "Huduma ya barua pepe, kipiga picha ukubwa, kizalishaji cha ripoti cha usiku, msafishaji wa kumbukumbu — hivyo vinahamia Lambda."

**Falsafa ya Kompyuta Bila Seva**

Lambda ni sehemu ya dhana pana: **bila seva (serverless)** — kujenga programu ambapo husimamii seva, msimbo tu.

Mrundiko kamili wa Nimbus wa bila seva unaweza kuonekana kama:

- API Gateway + Lambda (badala ya EC2 na seva ya wavuti)
- DynamoDB (badala ya RDS — pia bila seva, hakuna usimamizi wa seva)
- S3 (mali ya kudumu — bila seva kwa asili)
- SNS + SQS (ujumbe — bila seva)
- Lambda (usindikaji wote wa nyuma)

Mvuto: unaandika msimbo; AWS inasimamia kila kitu kingine. Hakuna kupiga viraka, hakuna usanidi wa kupanua, hakuna upangaji wa uwezo.

## Amazon API Gateway

Orodha ya vichocheo vya Lambda ilitaja API Gateway kwa ufupi: ombi la HTTP linakuja, API Gateway inaanzisha Lambda. Hilo ni sahihi, lakini halielezi vizuri API Gateway ni nini kwa kweli.

"Subiri — lakini *kwa nini* tungeweka API Gateway mbele ya Lambda?" Maya aliuliza. "Je, Lambda haiwezi kupokea maombi ya HTTP moja kwa moja?"

Lambda inaweza kupokea maombi ya HTTP kupitia URL ya kitendo — sehemu ya mwisho rahisi, ya moja kwa moja ya HTTPS. Lakini haishughulikii upitishaji, idhini, kupunguza kasi, kuweka kashe, au mabadiliko ya ombi. Kwa API ya uzalishaji, masuala hayo yapo bila kujali kama mfumo wako wa nyuma ni Lambda au EC2.

**Amazon API Gateway** ni huduma inayosimamiwa kikamilifu ya kuunda, kusambaza, na kusimamia API kwa kiwango chochote. Inashughulikia usimamizi wa trafiki, idhini, kupunguza kasi, kuweka kashe, na ufuatiliaji ili kitendo chako cha Lambda (au EC2, au mfumo wowote wa nyuma wa HTTP) kisilazimike kuyatekeleza yenyewe.

**Aina tatu za API:**

**REST API** ni chaguo lenye vipengele vingi zaidi. Inasaidia mabadiliko ya ombi na jibu, kuweka kashe ya jibu, mipango ya matumizi iliyofungamana na vitufe vya API, na aina zote za idhini. Maswali mengi ya mtihani wa SAA-C03 yanayotaja API Gateway yanahusisha REST API.

**HTTP API** ni rahisi zaidi na ya bei nafuu zaidi — takriban gharama 70% chini ya REST API. Imeundwa kwa mifumo ya nyuma ya Lambda na proksi za HTTP. Inasaidia idhini ya OIDC na OAuth 2.0 lakini si mabadiliko ya ombi au kuweka kashe. Ikiwa huhitaji vipengele vya hali ya juu vya REST API, HTTP API ni chaguo sahihi.

**WebSocket API** inasimamia miunganisho ya pande mbili ya kudumu. API Gateway inashughulikia mzunguko wa maisha wa muunganisho na inapeleka ujumbe kwa Lambda kulingana na maudhui ya ujumbe. Kitendo cha Lambda hakihitaji kusimamia hali ya soketi — API Gateway hufanya hilo.

**Chaguo za idhini** (zile ambazo mtihani unajaribu):

**Kithibitishaji cha Cognito User Pool** kinathibitisha JWT kutoka kwa Cognito User Pool. Hakuna Lambda inayohitajika. API Gateway inakagua tokeni yenyewe. Ikiwa ni halali, ombi linapita.

**Kithibitishaji cha Lambda** kinaendesha kitendo chako cha Lambda kuthibitisha tokeni — JWT desturi, tokeni ya OAuth kutoka kwa mtoaji wa utambulisho wa upande wa tatu, kitufe cha API katika muundo wa wamiliki. Lambda inarudisha sera ya IAM. Ikiwa sera inaruhusu kitendo, ombi linaendelea.

**Kitufe cha API** ni kitufe rahisi kinachopitishwa katika kichwa cha ombi. Vitufe vya API ni kwa kupunguza kiwango kwa mteja, si kwa uthibitisho. Usivitumie kama utaratibu wa usalama — si siri, ni vitambulisho.

**Kupunguza kasi na mipango ya matumizi:**

Kwa chaguo-msingi, API Gateway inaruhusu maombi 10,000 kwa sekunde katika kiwango cha akaunti (kikomo laini), na mlipuko wa 5,000. Uvizidi na wateja wanapokea `429 Too Many Requests` — mfumo wako wa nyuma kamwe hauhisi hata. Unapohitaji vikomo kwa kila mteja, unaunda mpango wa matumizi: kiunganishe na kitufe cha API, weka kiwango cha ombi na mgawo wa kila siku au kila mwezi. Milipuko ya mteja mmoja haitumii mgao wa mteja mwingine.

Namba mbili zinazostahili kushikilia: mzigo wa juu zaidi ni **10 MB**, na muda chaguo-msingi wa muunganisho ni **sekunde 29** — ikiwa mfumo wako wa nyuma unachukua muda mrefu zaidi, lango linaacha. (Tangu 2024, muda huo unaweza kuinuliwa zaidi ya sekunde 29 kwa REST API za Kanda na za faragha kupitia ongezeko la mgawo — lakini chaguo-msingi cha sekunde 29 bado ndicho mtihani unachotarajia.) API Gateway ni kwa API za ombi/jibu, si kazi za muda mrefu; kwa hizo, kabidhi kazi kwa SQS au Step Functions na ujibu mara moja.

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Kwa REST API: $3.50 kwa kila wito milioni za API, pamoja na $0.09 kwa kila GB ya uhamishaji wa data. Kwa trafiki ndogo-hadi-wastani, kimsingi ni ya bure. Kwa API za kiasi kikubwa, bei ya chini ya HTTP API inakuwa ya maana.

Leo alionyesha orodha ya vichocheo vya Lambda aliyokuwa ameandika awali. "Kwa hivyo API Gateway si njia tu ya kuanzisha Lambda. Ni kitu kinachofanya Lambda ihisi kama API halisi."

"Kitendo cha Lambda kinashughulikia mantiki ya biashara," Priya alisema. "API Gateway inashughulikia kila kitu mbele yake — upitishaji, uthibitisho, kupunguza kasi, ufuatiliaji. Kila kimoja kinafanya kitu kimoja."

"Na je, ikiwa mtu atajaribu kuita Lambda moja kwa moja, akipita API Gateway?"

"Sera ya utekelezaji ya Lambda inaruhusu tu uanzishaji kutoka API Gateway," Priya alisema. "Sera inayotegemea rasilimali kwenye Lambda inakataa kila kitu kingine."

Ukweli: bila seva ina ugumu wake wa uendeshaji — kutatua vitendo vya Lambda vilivyosambazwa, kusimamia kuanza baridi, kuelewa vikomo vya uanzishaji wa wakati mmoja. Si rahisi zaidi, ni tofauti tu.

"Subiri — lakini *kwa nini* bila seva 'si rahisi zaidi'?" Maya aliuliza. "Hoja yote ni kwamba inaondoa mzigo wa uendeshaji."

"Inaondoa baadhi ya mzigo wa uendeshaji," Leo alisema. "Uandaaji wa miundombinu, kupiga viraka, usanidi wa kupanua — hayo yanaondoka. Kilichobaki ni tofauti: usimamizi wa kuanza baridi, ufuatiliaji uliosambazwa katika vitendo ambavyo huwezi SSH kuingia, vikomo vya uanzishaji wa wakati mmoja, kusimamia matoleo na lakabu za vitendo, kuelewa jinsi sasisho za Tabaka zinavyosambaa, kushughulikia muda kuisha wa dakika 15 kwa adabu."

"Kwa hivyo mzigo unahama," Priya alisema. "Kutoka shughuli za miundombinu hadi shughuli za vitendo."

"Ndiyo. Kwa mzigo mwingi wa kazi — hasa unaoendelewa na matukio, mdogo, wa ghafla — hiyo ni biashara bora. Kwa seva ya programu ya muda mrefu ambayo wahandisi wanahitaji kuingiliana nayo na kuitatua, EC2 au vyombo mara nyingi hubaki chaguo sahihi."

Unaweza kuwa unajiuliza: je, bila seva ndiyo siku zijazo, na je, kila kitu kinapaswa hatimaye kuhamia Lambda? Jibu la uaminifu ni kwamba inategemea mzigo wa kazi. Bila seva imetawala usindikaji unaoendelewa na matukio. Imefanya maendeleo makubwa katika API za HTTP (kupitia API Gateway + Lambda). Haijabadilisha seva za programu zilizowashwa daima, usindikaji wa kundi wa muda mrefu, au huduma za hali — na pengine haitafanya, kwa sababu matumizi hayo hayanufaiki na mfano wa Lambda. Swali la zana sahihi kamwe haliondoki; linatumika tu kwa chaguo tofauti baada ya muda.

## Nguvu na Mipaka

**Kwa nini Lambda ina nguvu**:

- Kulipa kwa matumizi ya kweli — gharama sifuri zinaposubiri
- Kupanua kiotomatiki bila usanidi
- Hakuna seva za kupiga viraka au kudumisha
- Tabaka la bure la kujivunia (maombi milioni 1 kwa mwezi, bure milele)
- Muunganiko mzuri na sehemu zingine za AWS
- RDS Proxy na Lambda Layers zinashughulikia mawili ya matatizo ya kawaida zaidi ya Lambda (kuweka mkusanyiko wa miunganisho na kushiriki msimbo) bila kuhitaji mabadiliko ya usanifu

**Mahali ambapo mambo yanakuwa magumu**:

- Kuanza baridi ni kwa kweli na kunahitaji kushughulikia kwa makini kwa mzigo wa latency-nyeti
- Kikomo cha utekelezaji cha dakika 15 kinatenga kazi za muda mrefu
- Utatuzi ni mgumu zaidi — hakuna seva ya kudumu ya SSH kuingia
- Muundo usio na hali unahitaji kuhamisha hali yote nje (hifadhidata, kashe, S3)
- Vikomo vya uanzishaji wa wakati mmoja (chaguo-msingi vya uanzishaji 1,000 wa wakati mmoja kwa akaunti) vinaweza kupunguza kasi kwa kiwango
- Vitendo vya Lambda vilivyounganishwa na VPC vina latency ya ziada na masuala ya kuanza baridi

**Kufuatilia Lambda Bila SSH**

Mara ya kwanza kitu kilipovunjika katika kitendo cha Lambda, hisia ya Leo ilikuwa kufanya SSH kuingia na kuangalia mchakato. Hakuna mchakato wa SSH kuingia. Mazingira ya utekelezaji ya Lambda ni ya muda mfupi na hayafikiki.

Kutatua Lambda kunahitaji kujifunza zana tofauti:

**CloudWatch Logs**: Kila uanzishaji wa Lambda unaandika stdout/stderr yake kwa Kundi la Kumbukumbu la CloudWatch. Kurekodi kwa muundo (muundo wa JSON) kunafanya hizi kuwa za kuchujika. Sehemu zenye manufaa zaidi: jina la kitendo, kitambulisho cha uanzishaji, muda, aina ya hitilafu, na kitambulisho chako cha uwiano cha desturi.

**CloudWatch Metrics**: Lambda inachapisha vipimo vya Invocations, Duration, Errors, Throttles, na ConcurrentExecutions kiotomatiki. Kuweka kengele kwenye Errors na Throttles kunapaswa kuwa siku ya kwanza ya usambazaji wowote wa Lambda.

**AWS X-Ray**: Ufuatiliaji uliosambazwa kwa Lambda. Inaongeza gharama ndogo (2-5ms kwa kila uanzishaji) lakini inakupa grafu ya moto ya mahali muda unatumika ndani ya kitendo. Muhimu kwa uchambuzi wa kuanza baridi — X-Ray inaonyesha awamu ya uanzishaji kando na awamu ya kishughulikiaji.

**Lambda Insights**: Ufuatiliaji ulioboreshwa kwa Lambda, unaopatikana kupitia CloudWatch Lambda Insights. Inaongeza matumizi ya kumbukumbu, muda wa CPU, na muda wa init kwa vipimo vya kawaida. Inagharimu kidogo zaidi lakini inastahili kwa vitendo vya uzalishaji.

"Na je, ikiwa mtu atajaribu kuvunja kupitia mazingira ya utekelezaji?" Priya aliuliza. "Vitendo vya Lambda vinafanya kazi katika vyombo vilivyotengwa, lakini ikiwa tegemezi ina udhaifu, je, mshambuliaji anaweza kupata utekelezaji wa msimbo ndani ya Lambda yetu?"

Suluhisho: weka tegemezi chache na za kisasa (uchambuzi wa kuanza baridi tayari ulikuwa umemsukuma Leo kupunguza ukubwa wa pakiti), tumia Lambda Layers kuweka matoleo ya maktaba zinazoshirikiwa, na ipe jukumu la utekelezaji la Lambda ruhusa za chini zinazohitajika. Ikiwa kitendo kinaweza kuandika tu kwa ndoo moja mahususi ya S3 na kuuliza jedwali moja mahususi la DynamoDB, eneo la mlipuko la kitendo kilichodukuliwa limepunguzwa kwa hilo haswa.

"Upendeleo wa chini zaidi kwa majukumu ya utekelezaji ya Lambda si hiari," Priya alisema. "Ndio kinachopunguza uharibifu kitu kinapoenda vibaya."

Alikuwa sahihi. Na kama ushauri mwingi wa usalama, pia ulikuwa uhandisi mzuri tu.

## Muhtasari

Usanifu wa SQS/SNS kutoka sura ya 19 ulitenganisha masuala ya kukubali kazi na kuishughulikia. Lambda inaichukua zaidi: inatenganisha masuala ya kushughulikia kazi na kulipia uwezo wa kuifanya.

- **AWS Lambda** inaendesha msimbo kwa kujibu matukio bila kusimamia seva.
- **Kulipa kwa matumizi**: inalipiwa kwa kila uanzishaji na kwa kila millisekunde 1 ya utekelezaji (iliyopigwa juu). Gharama sifuri zinaposubiri.
- Inapanua kiotomatiki kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja.
- **Kuanza baridi**: latency ya uanzishaji wakati hakuna mazingira ya utekelezaji ya joto. Hupunguzwa na uanzishaji uliotolewa wa utekelezaji au wakati wa utekelezaji mwepesi.
- **Lambda Layers**: pakiti za msimbo zinazoshirikiwa ambazo vitendo vingi vinaweza kurejea, kupunguza unakili na ukubwa wa pakiti.
- **RDS Proxy**: inatatua tatizo la kuisha kwa muunganisho la Lambda kwa kudumisha bwawa la miunganisho ya hifadhidata ya kudumu kati ya Lambda na RDS.
- **Ufuatiliaji**: tumia CloudWatch Logs, Metrics, ufuatiliaji wa X-Ray, na Lambda Insights — hakuna seva ya SSH kuingia.
- Bora kwa: mzigo unaoendelewa na matukio, mfupi, wa ghafla, au wa mara chache.
- Si bora kwa: kazi za muda mrefu (kikomo kigumu cha dakika 15), programu za hali, API za uendeshaji wa juu wa latency ya chini bila uanzishaji uliotolewa wa utekelezaji.
- **Bila seva** ni falsafa ya muundo — unasimamia msimbo, si miundombinu. Ugumu wa uendeshaji unahama, hauondoki.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Lambda + S3**: Mchakato wa kawaida — faili iliyopakiwa kwenye S3 inaanzisha Lambda kwa usindikaji (uzalishaji wa picha ndogo, uchunguzi wa virusi, mabadiliko ya data). Hakuna seva inayohitajika.
- **Lambda + SQS**: Lambda inatoa kura kwa SQS na kushughulikia makundi. SQS inatoa utaratibu wa kujaribu tena/DLQ. Lambda inatoa usindikaji.
- **Lambda + API Gateway**: API ya HTTP bila seva. API Gateway inashughulikia upitishaji, uthibitisho, kupunguza kasi. Lambda inashughulikia mantiki ya biashara.
- **Aina za API Gateway:** REST API = vipengele kamili, mabadiliko ya ombi, kuweka kashe, mipango ya matumizi. HTTP API = rahisi, bei nafuu, OIDC/OAuth tu. WebSocket API = miunganisho ya pande mbili ya kudumu. **Idhini:** Kithibitishaji cha Cognito = thibitisha JWT ya Cognito kwa asili. Kithibitishaji cha Lambda = mantiki desturi ya uthibitishaji wa tokeni. Kitufe cha API = kupunguza kiwango kwa kila mteja (si uthibitisho). Kichocheo cha mtihani: "REST API bila seva" → API Gateway + Lambda.
- **Ishara za kuanza baridi**: "milipuko ya latency kwenye ombi la kwanza," "nyakati za majibu zisizo sawa" → kuanza baridi. Suluhisho: uanzishaji uliotolewa wa utekelezaji (unagharimu pesa), pakiti ndogo, wakati wa utekelezaji mwepesi.
- **Vikomo vya utekelezaji**: dakika 15 za juu zaidi. Kumbukumbu ya juu zaidi ya 10GB. Uhifadhi wa muda wa /tmp wa 512MB kwa chaguo-msingi (unaweza kusanidiwa hadi 10GB). Vikomo hivi vinaonekana katika hali za mtihani.
- **Hitilafu za muda kuisha za Lambda ni za kimya**: Ikiwa kitendo cha Lambda kitaisha muda, kinazalisha hitilafu ya CloudWatch lakini hakuna jibu la hitilafu la kiwango cha programu. Fuatilia hitilafu za Lambda Timeout za CloudWatch waziwazi. Hivi ndivyo kizalishaji cha ripoti cha dakika 17 cha Leo kilivyoshindwa usiku wake wa kwanza bila kengele yoyote ya kiwango cha programu.
- **Kuanza baridi kwa VPC Lambda**: Vitendo vya Lambda ndani ya VPC vina latency ya ziada ya kuanza baridi (uandaaji wa ENI). AWS iliboresha hili kwa kiasi kikubwa na Hyperplane ENIs, lakini kuanza baridi kwa VPC Lambda bado ni polepole zaidi kuliko isiyo ya VPC. Epuka VPC kwa vitendo vya Lambda visivyohitaji rasilimali za VPC (yaani, visivyounganishwa na RDS, ElastiCache, au rasilimali zingine za VPC-tu).
- **Uanzishaji wa wakati mmoja wa Lambda**: Chaguo-msingi ni utekelezaji 1,000 wa wakati mmoja kwa akaunti (unaweza kuongezwa). **Uanzishaji uliotengwa wa wakati mmoja**: hakikisha kitendo kinapata idadi maalum ya utekelezaji; inazuia vitendo vingine kuvitumia. **Uanzishaji uliotolewa wa utekelezaji wa wakati mmoja**: pasha joto idadi ya mazingira ya utekelezaji mapema.
- **Ramani ya chanzo cha tukio**: Kipengele cha Lambda kinachounganisha SQS/DynamoDB Streams/Kinesis kwa Lambda. Lambda inatoa kura kwa chanzo na kurekebisha rekodi kuwa makundi.
- **Kufikia vikomo vya akaunti**: "programu inapunguzwa kasi / LimitExceeded inapopanuka" → angalia kikomo katika **Service Quotas** na uombe ongezeko hapo (mgawo mwingi, kama uanzishaji wa wakati mmoja wa Lambda, unaweza kurekebishwa; baadhi ni vikomo vigumu).
- **RDS Proxy**: Ishara ya mtihani: "vitendo vya Lambda vinasababisha miunganisho mingi sana ya hifadhidata," "kuisha kwa bwawa la miunganisho na Lambda." → RDS Proxy inadumisha miunganisho ya kudumu na inapitisha miunganisho ya muda mfupi ya Lambda.
- **Lambda Layers**: Ishara ya mtihani: "shiriki msimbo katika vitendo vingi vya Lambda," "punguza ukubwa wa pakiti ya usambazaji" → Lambda Layers.
- **Lambda + X-Ray**: Ufuatiliaji uliosambazwa kwa Lambda. Hali ya mtihani: "fuatilia maombi katika vitendo vingi vya Lambda na huduma" → wezesha ufuatiliaji wa X-Ray kwenye Lambda.
- **Lambda Destinations:** Kwa uanzishaji wa Lambda wa nje, unaweza kusanidi Destination kwa matokeo ya mafanikio na ya kushindwa. Tuma matokeo yenye mafanikio kwa SQS, SNS, EventBridge, au kitendo kingine cha Lambda. Tuma kushindwa kwa SQS au SNS kwa tahadhari. Hili ni mbadala unaopendelewa kwa DLQ kwa uanzishaji wa nje kwa sababu linanasa mafanikio na kushindwa, si kushindwa tu. Ishara ya mtihani: "elekeza matokeo yenye mafanikio ya Lambda kwa huduma nyingine" au "nasa matokeo ya mafanikio na kushindwa kutoka kwa Lambda ya nje" → Lambda Destinations. "Nasa tu ujumbe uliyoshindwa kwa uanzishaji wa nje" → DLQ bado ni halali lakini Destinations ni suluhisho kamili zaidi.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tatizo la kuanza baridi. Katika aina gani ya programu kuanza baridi kungeleta matatizo zaidi? Katika aina gani ingekuwa inakubalika?

*(Kidokezo: Linganisha API ya wakati halisi (mtumiaji anasubiri jibu) na kazi ya nyuma ya nje (mtumiaji tayari amepata uthibitisho wake na anafanya mambo mengine).)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni inapokea picha za bidhaa kutoka kwa wasambazaji wao kupitia ndoo ya S3. Kila picha inahitaji kupigwa ukubwa hadi vipimo vinne vya kawaida (picha ndogo, ndogo, wastani, kubwa) na kuhifadhiwa tena kwenye S3. Kiwango ni kisichotabirika — siku zingine picha 10, siku zingine 100,000. Usindikaji lazima ukamilike ndani ya dakika 10 kwa picha. Gharama lazima zipunguzwe.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Vipengele vya EC2 katika Auto Scaling Group vinavyofuatilia ndoo ya S3 kwa utafutaji mrefu  
B) Kipengele kilichotengwa cha EC2 chenye kazi ya cron inayokagua S3 kila dakika kwa picha mpya  
C) Kazi za ECS Fargate zilizoanzishwa na foleni ya SQS, na matukio ya S3 yakichapisha kwenye foleni  
D) Arifa ya tukio ya S3 inayoanzisha kitendo cha Lambda kinachopiga ukubwa picha na kuhifadhi matokeo kwenye S3

**Kidokezo cha 1**: Kiwango kisichotabirika kinapendelea kupanua-hadi-sifuri. Chaguo gani hufanya hivyo?

**Kidokezo cha 2**: Dakika 10 kwa picha iko ndani ya kikomo cha dakika 15 cha Lambda. Angalia kama kazi ya kupiga ukubwa picha inafaa kwa vikwazo vya Lambda.

**Kidokezo cha 3**: Kipengele kilichotengwa cha EC2 kinachoendesha masaa 24/7 ni ghali na hakipanui.

**Jibu**: D

**Maelezo**: Arifa za tukio za S3 zinaanzisha Lambda picha inapopakiwa. Lambda inapiga ukubwa picha hadi vipimo vinne na kuhifadhi matokeo kwenye S3. Lambda inapanua kutoka 0 hadi maelfu ya uanzishaji wa wakati mmoja kiotomatiki, ikishughulikia kiwango kisichotabirika bila utengaji wa awali. Gharama sifuri wakati hakuna picha zinazosindikwa.

**Kwa nini si A?** EC2 katika ASG haipanui hadi sifuri — kipengele kimoja cha chini kinaendesha daima. Utafutaji mrefu wa S3 si utaratibu wa asili wa tukio la S3. Gharama ya juu zaidi ya Lambda kwa mzigo wa ghafla.

**Kwa nini si B?** Kipengele kilichotengwa cha EC2 ni hatua moja ya kushindwa, haipanui, inaendesha masaa 24/7, na mbinu inayotegemea cron ina ucheleweshaji wa hadi sekunde 60 wa kugundua.

**Kwa nini si C?** ECS Fargate inafanya kazi, lakini ni ngumu zaidi (inahitaji usimamizi wa chombo, ECR, maudhui ya kazi) na uanzishaji wa kazi ya Fargate unachukua makumi ya sekunde hadi dakika — polepole zaidi sana kuliko kuanza baridi kwa Lambda — ukiifanya isifae kwa kazi ya ghafla, inayoendelewa na matukio. Lambda ni rahisi zaidi kwa matumizi haya.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inataka kuzalisha ripoti ya kila siku saa 11 alfajiri na migahawa kumi bora ya siku iliyopita kwa kiwango cha agizo. Ripoti inazalishwa kutoka kwa data ya DynamoDB, inaumbizwa kama PDF, inahifadhiwa kwenye S3, na inatumwa kwa barua pepe kwa washirika wote wa mgahawa.

Buni mzunguko kamili unaotegemea Lambda kwa hili. Lambda inaanzishwa na nini? Kinachotokea ikiwa uzalishaji wa PDF utachukua dakika 12? Vipi ikiwa kuna washirika 5,000 wa mgahawa na kuwatumia wote barua pepe inachukua muda? Je, ungetumia Lambda moja au nyingi?

Fikiria pia: vipi ikiwa Lambda itaisha muda baada ya dakika 14, ikiwa imeshughulikia 4,500 kati ya barua pepe 5,000 za migahawa? Unaepukaje kutuma barua pepe za nakala wakati Lambda inajaribiwa tena? Lambda hii inahitaji ruhusa zipi za IAM, na seti ya chini zaidi inayohitajika ni ipi?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kuunda Lambda na huduma zingine.)*

## Tukio Baada ya Mikopo

Tom alipitia bili mwishoni mwa mwezi.

Huduma ya barua pepe: iliondoka kwenye bili ya EC2.
Kazi ya kupiga ukubwa picha: iliondoka.
Kazi ya usafi ya kila usiku: iliondoka.
Ripoti ya uchambuzi ya kila siku: iliondoka. (Kizalishaji cha ripoti kilikuwa kimehamishiwa ECS Fargate baada ya tukio la muda kuisha la dakika 17, lakini gharama ya kompyuta ya Lambda ilikuwa sifuri kwa sababu sasa kiliratibiwa kwa njia tofauti.)

Jumla ya malipo ya Lambda kwa mwezi: $5.47.

"Dola tano," Tom alisema.

"Na senti arobaini na saba," Leo aliongeza kwa msaada.

Tom alitazama bili ya mwezi uliopita, wakati huduma hizo zote zilikuwa kwenye vipengele vya EC2.

"Tulikuwa tukilipa $187 kwa mzigo huo huo wa kazi."

"Lambda hailipishi kwa muda wa kusubiri," Leo alisema. "Na huduma nyingi hizo zilikuwa zikisubiri 90% ya wakati."

Tom aliibua grafu za CloudWatch mara moja zaidi. Lambda ya huduma ya barua pepe ilikuwa imeanzishwa mara 36,412. Muda jumla: karibu GB-sekunde 18,200. Kwa $0.0000166667 kwa kila GB-sekunde: $0.30 — na hata hiyo ilikuwa ya kinadharia, kwa kuwa GB-sekunde 18,200 zilikaa vizuri ndani ya GB-sekunde 400,000 za muda za bure-daima. Kipengele halisi cha bili kilikuwa sifuri.

"Kipengele cha EC2 kilikuwa $18 kwa mwezi," Tom alisema. "Tulitumia senti thelathini — na hiyo ni mimi nikipuuza tabaka la bure, ili tujue gharama halisi ya kipimo. Bili inasema sifuri."

"Sehemu kubwa ya $5.47 ilikuwa uanzishaji uliotolewa wa utekelezaji kwenye Lambda ya arifa — ile inalipisha iwe inaendesha au la. Kipiga picha ukubwa, kazi ya usafi, na zingine zinafaa ndani ya tabaka la bure."

Tom alitazama skrini kwa muda mrefu.

"Narudisha kila kitu nilichosema kuhusu bila seva kuwa neno la mitindo," alisema.

"Hukusema hilo kamwe," Leo alisema.

"Niliwaza kwa sauti sana akilini."

Katika sura inayofuata: chombo cha kupakia kinachofanya seva yoyote ihisi kama nyumbani.
