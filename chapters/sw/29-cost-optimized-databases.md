# Sura ya 29: Bili ya Hifadhidata

Ukaguzi wa uhifadhi wa Tom ulitambua $8,800 kwa taka. Aligeuka kwa vipengele vya mstari vya hifadhidata.

RDS Aurora: $647/mwezi.
RDS PostgreSQL (nakala za kusomwa): $340/mwezi.
ElastiCache: $183/mwezi.

Jumla ya tabaka la hifadhidata: $1,170/mwezi.

"Niruhusu nielewa kila moja kabla ya kuamua chochote," alisema. "Kwa sababu hifadhidata si mahali pa kuokoa pesa kwa kukata pembe."

Hii ilikuwa busara. Usanidi mbaya wa hifadhidata unaosababisha upotezaji wa data au kupungua kwa utendaji ungharimu zaidi sana kuliko akiba.

Fikiria hifadhidata kama injini ya gari. Unaweza kuokoa pesa kwenye gari kwa kubadilisha mafuta ya bei nafuu zaidi, kurekebisha shinikizo la mpira, na kuondoa uzito usio wa lazima kwenye sanduku la nyuma. Lakini ukijaribu kuokoa pesa kwa kuruka mabadiliko ya mafuta ya injini, unaweza kufunga injini — na injini iliyofungwa ingharimu zaidi sana kuliko akiba yoyote ya mafuta. Ukaguzi Tom anaohusu sasa hivi unafuata mantiki ile ile: tafuta taka kwenye sanduku na tanki la mafuta, na acha injini peke yake mpaka ujue hasa unachofanya.

**Kuelewa Mzigo Wako wa Hifadhidata Kwanza**

Uimarishaji wa gharama katika hifadhidata unahitaji kuelewa mzigo kabla ya kugusa chochote.

Maswali muhimu:

- Matumizi ya wastani na ya kilele ya CPU ni nini?
- Uwiano wa kusomwa/kuandika ni nini?
- Je, uhifadhi unakua, thabiti, au unapungua?
- Je, nakala za kusomwa zinatumika?
- Je, kipengele kimetolewa kwa kiwango kidogo (kinasababisha upunguzaji wa kasi) au kimetolewa kwa kiwango kikubwa (kinalipia uwezo usio na kazi)?

Tom alipiga vipimo vya CloudWatch kwa huduma zote tatu za hifadhidata zaidi ya siku 30 zilizopita:

**Nguzo ya Aurora**:

- Wastani wa CPU: 18% (kilele: 67% Ijumaa jioni)
- Uwiano wa kusomwa/kuandika: 14:1 (unaosomwa zaidi)
- Uhifadhi: 180GB (ukikua ~5GB/mwezi)

**Nakala za kusomwa (RDS PostgreSQL, tofauti na Aurora)**:

- Hizi zilikuwa nakala mbili za zamani za kusomwa za RDS zilizoundwa kabla ya uhamiaji wa Aurora, bado zinaendesha.
- Wastani wa miunganisho kwa kila moja: 2 kwa siku. Wastani wa CPU: 3%.

"Kwa nini hizi bado zinaendesha?" Tom aliuliza.

Leo alitazama tarehe za uundaji wa kipengele. "Ziliundwa wakati wa uhamiaji wa Aurora kwa kurudi nyuma. Tulisahau kuzifuta."

Wakati huo — kipengele ghali kinapoendeshwa kwa miezi bila kutumika — ni wa kawaida katika mazingira ya wingu.

Nakala zilifikiriwa. Akiba ya kila mwezi: $340.

**Vipengele Vilivyohifadhiwa vya RDS: Toleo la Hifadhidata**

Kama EC2, RDS inatoa Vipengele Vilivyohifadhiwa kwa matumizi yaliyojitolea.

Kwa Aurora na Serverless v2, Vipengele Vilivyohifadhiwa havitumiki moja kwa moja — Serverless v2 inapanua kwa nguvu na unalipa kwa ACU-saa. Hata hivyo, ukitumia usanidi uliowekwa wa Aurora (si Serverless), Vipengele Vilivyohifadhiwa vinaweza kuokoa 30-60%.

Tom alipitia vipengele vilivyowekwa vya Aurora (mwandishi na msomaji mmoja):

- Kipengele cha mwandishi: db.r6g.large, On-Demand = $0.26/saa = $190/mwezi
- Kipengele cha msomaji: db.r6g.large, On-Demand = $0.26/saa = $190/mwezi

Vipengele Vilivyohifadhiwa vya mwaka 1 kwa vyote viwili: ~$108/mwezi kila mmoja. Akiba ya kila mwaka: $984.

"Subiri," Leo alisema. "Tulihamia kwa Aurora Serverless v2 katika Sura ya 24. Kwa nini Tom anaangalia On-Demand kwa vipengele vilivyowekwa?"

Ugunduzi mzuri. Tuwe sahihi: mwandishi wa Aurora wa msingi wa Nimbus hutumia Serverless v2. Msomaji (kwa nakala za kusomwa) pia hutumia Serverless v2. Serverless v2 haina Vipengele Vilivyohifadhiwa vya jadi — unalipa kwa ACU-saa.

Kwa timu zinazoendeshea vipengele vilivyowekwa vya Aurora (si Serverless), Vipengele Vilivyohifadhiwa ni akiba kubwa. Kwa mzigo wa Serverless v2, akiba inakuja kutoka asili ya kupanua kwa kiotomatiki ya huduma — hulipi kwa uwezo usio na kazi.

**DynamoDB: On-Demand dhidi ya Iliyotolewa**

Katika Sura ya 9, tulianzisha hali mbili za uwezo wa DynamoDB: wa hiari na wa kutolewa.

Nimbus ilikuwa ikiendeshea DynamoDB katika hali ya hiari tangu mwanzo. Kwa trafiki ndogo, hii ilikuwa sahihi — hiari ni ghali zaidi kwa kila ombi lakini haina malipo ya kiwango cha chini.

Sasa, na miezi 18 ya data ya trafiki katika CloudWatch, Tom angeweza kuona mifumo.

Wastani wa vitengo vya uwezo wa kusomwa kwa siku: 45,000
Wastani wa vitengo vya uwezo wa kuandika kwa siku: 12,000
Siku ya kilele (Ijumaa): 180% ya wastani wa maombi ya DynamoDB (ElastiCache inafyonza ~95% ya masomo, kwa hivyo DynamoDB inaona sehemu ndogo tu ya mabadiliko ya jumla ya 25x ya kiwango cha agizo)

**Bei za hiari**: $1.25 kwa kila ombi milioni la kuandika, $0.25 kwa kila ombi milioni la kusomwa.
**Bei za kutolewa**: $0.00065 kwa kila kitengo cha uwezo wa kuandika kwa saa, $0.00013 kwa kila kitengo cha uwezo wa kusomwa kwa saa.

Tom alihesabu sehemu ya kuwa sawa: uwezo uliotolewa unakuwa bei nafuu unapotumiwa kwa utulivu vya kutosha kwamba hulipi ada ya hiari ya ziada wakati wa mapumziko.

Na miezi 18 ya data inayoonyesha mifumo ya kila siku thabiti, uwezo uliotolewa na **DynamoDB Auto Scaling** ulikuwa chaguo sahihi:

- Weka uwezo wa chini wa 60% ya wastani wa mzigo
- Weka kiwango cha juu cha 250% ya wastani (inashughulikia mabadiliko ya Ijumaa)
- Auto Scaling hurekebisha uwezo uliotolewa kati ya mipaka hii

Gharama ya kila mwezi ya DynamoDB: ilishuka kutoka $340 (hiari) hadi $230 (imetolewa na kupanua kiotomatiki). Kupungua kwa 32%.

"Lakini ikiwa tutatoa kwa kiwango kikubwa zaidi," Leo aliuliza, "tunalipa kwa uwezo usio na kazi."

"Hiyo ndiyo hatari," Tom alisema. "Na Auto Scaling, tunaweka kiwango cha chini cha juu vya kutosha kuepuka kupunguzwa kwa kasi, na kuruhusu AWS kusimamia ndani ya mwelekeo wetu."

"Na mfumo wetu wa trafiki ukibadilika kwa kiasi kikubwa?"

"Kisha tunarekebisha mipaka. Tunapitiaje kila robo mwaka."

**ElastiCache: Kupanga Saizi Sahihi na Nodi Zilizohifadhiwa**

Bili ya ElastiCache: $183/mwezi. Kipengele kimoja cha cache.r6g.large cha Redis katika kila AZ (nodi mbili, msingi + nakala).

Vipimo vya CloudWatch vinaonyesha:

- Wastani wa matumizi ya kumbukumbu: 34%
- Kilele: 58%

Kipengele kilikuwa kimetolewa kwa kiwango kikubwa zaidi. cache.r6g.medium labda ingeweza kushughulikia mzigo na nafasi.

Kuhamia kutoka r6g.large (nodi 2 × $0.127/saa) hadi r6g.medium (nodi 2 × $0.065/saa):

- Akiba ya kila mwezi: $113 → subiri.

Kweli hesabu: large = 2 × $0.127 × masaa 730 = $185/mwezi. Medium = 2 × $0.065 × 730 = $95/mwezi. Akiba: $90/mwezi.

Tom alijaribu kipengele cha medium katika hatua ya kujaribu kwa wiki mbili chini ya mzigo. Kumbukumbu ilifikia kilele cha 71%. Karibu vya kutosha na kikomo kwamba alihisi wasiwasi.

Alijaribu cache.r6g.large lakini na Nodi Zilizohifadhiwa (kujitolea kwa mwaka 1): kutoka On-Demand $185 hadi Zilizohifadhiwa $120/mwezi. Akiba: $65/mwezi bila kubadilisha aina ya kipengele.

"Wakati mwingine kupanga saizi sahihi hadi kipengele kidogo kunaweza kusababisha tukio la utendaji," alisema. "Nodi Zilizohifadhiwa zinatupa akiba ile ile na hatari ndogo zaidi."

**Uhifadhi wa Nakala za RDS: Mabadiliko ya Uhifadhi**

Nakala za kiotomatiki za RDS zimehifadhiwa katika S3 (bila ada ya ziada ya uhifadhi hadi 100% ya ukubwa wako wa hifadhidata). Uhifadhi wa chaguo-msingi ni siku 7.

Kwa hifadhidata ya Aurora ya GB 180 ya Nimbus, nakala za siku 7 zilifaa — walikuwa wameweza kurejesha kutoka nakala ndani ya dirisha hilo katika majaribio.

Lakini Tom aliandika: pia walikuwa na picha za mkono kutoka kila usambazaji mkubwa, zimehifadhiwa bila kikomo.

Picha 23 za mkono, jumla ya uhifadhi wa TB 4.1 za picha.
Gharama: $0.095/GB/mwezi kwa nakala za Aurora = $389/mwezi katika uhifadhi wa picha za mkono.

Walihifadhi picha 3 za mwisho za mkono kwa kila mazingira (uzalishaji, hatua ya kujaribu). Walifuta iliyobaki.
Akiba: $350/mwezi.

"Tulikuwa tunapalipa $350 kwa mwezi kwa bima ambayo hatukuwahi kutumia," Leo alisema.

"Tulikuwa tunapalipa kwa amani ya akili," Tom alisahihisha. "Swali ni: ni kiasi gani cha amani ya akili cha thamani ya $350 kwa mwezi?"

"Na mpango sahihi wa uokoaji wa maafa," Priya alisema, "unaweza kupata amani ile ile ya akili kutoka siku 7 za nakala za kiotomatiki na picha 3 za mkono."

"Kukubaliana. Sasa."

**Muhtasari wa Uimarishaji wa Hifadhidata**

| Huduma                                              | Kabla       | Baada   | Akiba ya Kila Mwezi |
|-----------------------------------------------------|-------------|---------|---------------------|
| Nakala za Kusomwa za RDS (zisizotumika)             | $340        | $0      | $340                |
| Aurora (Vipengele Vilivyohifadhiwa)                 | $190        | $120    | $70                 |
| DynamoDB (Hiari → Imetolewa + Auto Scaling)         | $340        | $230    | $110                |
| ElastiCache (Nodi Zilizohifadhiwa)                  | $185        | $120    | $65                 |
| Picha za mkono za Aurora                            | $389        | $39     | $350                |
| **Jumla**                                           | **$1,444**  | **$509**| **$935/mwezi**      |

$935 kwa mwezi katika akiba za hifadhidata. $11,220 kwa mwaka.

Tom aliweka nambari hii karibu na akiba za uhifadhi ($6,200/mwaka) na akiba za Mipango ya Akiba ($14,200/mwaka).

Jumla ya athari ya uimarishaji: $31,620/mwaka.

"Hiyo ni wahandisi watatu wachanga," Maya alisema.

"Au mmoja mkubwa," Priya alisema.

"Au miezi kumi na mbili ya majaribio," Leo alisema.

Wote watatu walikuwa sahihi.

## Nguvu na Mipaka

**DynamoDB Imetolewa na Auto Scaling**:

- Bei nafuu zaidi kuliko hiari kwa mzigo unaoweza kutabiriwa, thabiti
- Auto Scaling inashughulikia utofauti bila kutoa kwa kiwango kikubwa daima
- Inahitaji ufuatiliaji ili kuhakikisha mipaka ya uwezo inabaki sahihi

**Vipengele Vilivyohifadhiwa vya RDS / Nodi Zilizohifadhiwa za ElastiCache**:

- Akiba kubwa kwa mzigo thabiti, wa muda mrefu
- Kujitolea kumefungwa — mahitaji yakibadilika, umelipa kwa uwezo usio na kazi
- Soko la RI linaruhusu kuuza RI za RDS zisizotumika (tofauti na Zinazobadilishwa, ambazo haziwezi kuuzwa)

**Kanuni ya jumla**:

- Daima elewa matumizi kabla ya kuboresha
- Rasilimali zisizotumika (kama nakala za zamani za kusomwa) ni uimarishaji wa faida ya juu zaidi
- Kupanga saizi sahihi kunahitaji uthibitisho katika hatua ya kujaribu kabla ya kutumika kwa uzalishaji
- Bei zilizohifadhiwa zinahitaji imani katika uthabiti wa mzigo

## Muhtasari

- **Ukaguzi kwanza**: Vuta vipimo vya CloudWatch kabla ya kufanya mabadiliko yoyote ya hifadhidata.
- **Futa rasilimali zisizotumika**: Nakala za kusomwa, hifadhidata zisizo na kazi, na vipengele vya majaribio ambavyo havidhibitiwi tena.
- **DynamoDB On-Demand dhidi ya Imetolewa**: Hiari kwa trafiki isiyoweza kutabiriwa; Imetolewa + Auto Scaling kwa mifumo thabiti.
- **Nodi Zilizohifadhiwa za ElastiCache**: Kama Vipengele Vilivyohifadhiwa vya EC2 kwa Redis/Memcached. Akiba ya 30-50% kwa mzigo thabiti.
- **Usimamizi wa picha za RDS**: Hifadhi picha unazohitaji tu. Picha za mkono zimehifadhiwa bila kikomo isipokuwa zimefutwa.
- **Kupanga saizi sahihi kwa tahadhari**: Kupanga saizi sahihi kwa hifadhidata kuna hatari ya matukio ya utendaji. Jaribu katika hatua ya kujaribu, thibitisha chini ya mzigo.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.3)*

- **Hali za bei za DynamoDB**: On-Demand = lipa kwa ombi (gharama ya juu kwa kila kitengo, hakuna malipo ya kiwango cha chini). Imetolewa = lipa kwa kitengo cha uwezo kwa saa (gharama ya chini kwa kila kitengo, lazima ugawe uwezo). **DynamoDB Auto Scaling** hurekebisha kiotomatiki uwezo uliotolewa.
- **Vipengele Vilivyohifadhiwa vya RDS**: Vinapatikana kwa aina zote za injini za RDS. Usambazaji wa Multi-AZ unaweza kutumia Vipengele Vilivyohifadhiwa (unajitolea kwa Multi-AZ). Muda wa miaka 1 au 3.
- **Nodi Zilizohifadhiwa za ElastiCache**: Mfano sawa wa kujitolea kama Vipengele Vilivyohifadhivu vya EC2. Inatumika kwa kila nodi, si kwa nguzo.
- **Uhifadhi wa picha za RDS**: Nakala za kiotomatiki ni bure hadi 100% ya ukubwa wa hifadhidata. Picha za mkono zinatoziwa kwa GB kwa mwezi katika S3. Hali ya mtihani: "punguza gharama za uhifadhi wa RDS" → futa picha za zamani za mkono.
- **Uwezo uliotengwa wa DynamoDB**: Unapatikana pia kwa DynamoDB (ujitolea kwa uwezo maalum wa kusomwa/kuandika kwa miaka 1 au 3 kwa punguzo). Tofauti na kutolewa kwa kawaida — unalipa mapema kwa uwezo katika meza zako zote za DynamoDB katika mkoa.
- **Aurora Serverless v2 dhidi ya iliyowekwa**: Serverless v2 hupanua kiotomatiki, bora kwa mzigo unaobadilika. Iliyowekwa na Vipengele Vilivyohifadhiwa ni bei nafuu zaidi kwa mzigo thabiti, unaoweza kutabiriwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza unapaswa kutumia DynamoDB ya hiari dhidi ya uwezo uliotolewa na Auto Scaling lini. Unahitaji taarifa gani kufanya uamuzi huu?

*(Kidokezo: Fikiria maana ya "kuweza kutabiriwa" kwa suala la data ya trafiki, na hatari gani hiari inaondoa ambayo imetolewa inaanzisha.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni inaendeshea jedwali la DynamoDB kwa bodi ya nguvu la mchezo wa simu. Trafiki inazidi sana wakati wa tukio la msimu (wiki moja kwa robo mwaka, trafiki ya mara 10 ya kawaida) lakini ni thabiti sana vinginevyo. Nje ya tukio la msimu, kampuni inataka kupunguza gharama za hifadhidata huku ikidumisha utendaji.

Mkakati gani wa uwezo wa DynamoDB BORA unakidhi mahitaji haya?

A) Uwezo wa hiari kushughulikia mabadiliko ya msimu bila kupunguzwa kwa kasi  
B) Uwezo uliotolewa umewekwa kwa viwango vya kilele vya msimu (daima umetolewa kwa trafiki ya mara 10)  
C) Uwezo uliotolewa na DynamoDB Auto Scaling, na uwezo wa juu uliowekwa kwa kilele cha msimu  
D) Vitengo vya uwezo vilivyohifadhiwa vya DynamoDB kwa miaka 3 kwa viwango vya trafiki ya kawaida

**Kidokezo cha 1**: "Trafiki thabiti isipokuwa kwa mabadiliko ya msimu yanayojulikana" — hali gani inashughulikia zote mbili kwa ufanisi?

**Kidokezo cha 2**: "Punguza gharama" wakati wa nje ya msongamano kunamaanisha huwezi kutoa kwa kiwango kikubwa zaidi kwa mara 10 wakati wote.

**Kidokezo cha 3**: DynamoDB Auto Scaling inaweza kupanda juu kwa tukio la msimu na kupungua tena baadaye.

**Jibu**: C

**Maelezo**: Uwezo uliotolewa na Auto Scaling hupanua jedwali kulingana na trafiki halisi. Wakati wa vipindi vya kawaida, uwezo uko katika viwango vya kawaida (gharama ndogo). Wakati wa tukio la msimu, Auto Scaling hugundua ongezeko la trafiki na kupanda hadi kiwango cha juu kilichosanidiwa (kushughulikia kilele cha mara 10). Baada ya tukio, hupungua tena. Hii ni bei nafuu zaidi kuliko hiari wakati wa vipindi vya kawaida (hiari inagharimu zaidi kwa ombi) na bei nafuu zaidi kuliko kutoa kwa mara 10 daima.

**Kwa nini si A?** Hiari inashughulikia mabadiliko bila kupunguzwa kwa kasi lakini inagharimu zaidi kwa ombi kuliko imetolewa wakati wa trafiki ya kawaida, inayoweza kutabiriwa.

**Kwa nini si B?** Kutoa kwa mara 10 daima kunamaanisha 75% ya uwezo uliotolewa unakaa bila kutumika 75% ya mwaka — kulipa kwa uwezo ambao hautumiwi kamwe.

**Kwa nini si D?** Vitengo vya uwezo vilivyohifadhiwa vinakufunga kwa viwango vya trafiki ya kawaida. Wakati wa tukio la mara 10, ungelazimishwa kupunguzwa kwa kasi zaidi ya kiasi kilichohifadhiwa, au ungehitaji kuongeza hiari juu yake.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inatathmini kipengele kipya: dashibodi ya uchambuzi ya mgahawa inayoonyesha idadi ya maagizo ya wakati halisi, mapato kwa saa, na idadi ya wateja. Data hii ingeduliza hifadhidata karibu mara 200 kwa dakika (swali moja kwa kila mchambuzi kwa kila upya wa ukurasa, na wachambuzi 10).

Kwa sasa data ya uchambuzi iko katika Athena (S3). Je, wanapaswa kujenga dashibodi kwenye Athena, au wapaswa kupakia data kwenye hifadhidata? Ikiwa hifadhidata, ipi (Aurora, DynamoDB, Redshift)?

Fikiria: mzunguko wa maswali, mahitaji ya usafi wa data, ugumu wa swali (makusanyiko, michanganyiko), na gharama kwa swali kwa kiwango hiki.

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya uteuzi wa hifadhidata kwa mzigo wa uchambuzi.)*

## Tukio Baada ya Mikopo

Tom aliwasilisha muhtasari kamili wa uimarishaji wa gharama kwa Maya.

Miezi mitatu ya kazi. $31,620 katika akiba ya kila mwaka zilizotambuliwa. $26,400 katika mabadiliko tayari yaliyotekelezwa.

"Nini kilichobaki $5,220?" Maya aliuliza.

"Uimarishaji ambao sijaamini nao bado," Tom alisema. "Usanidi wa Aurora unaweza kupangwa saizi sahihi zaidi, lakini nataka robo mwaka moja zaidi ya data kabla ya kujitolea. Na kuna swali la uhamishaji wa data ambalo sijakuchanganua kikamilifu."

"Gharama za mtandao."

"Ndiyo. Hiyo ndiyo inayofuata."

Maya alitazama nambari. "Tom, nataka kuelewa kitu. Uimarishaji huu — umekuwa ukifanya kwa miezi mitatu. Hiyo ni sehemu kubwa ya wakati wako."

"Karibu 30%."

"Na uliokoa $26,400 kwa mwaka. Kwa hivyo uimarishaji unalipa gharama zake katika — miezi mingapi ya mshahara wako?"

Tom alimtazama. "Karibu hiyo."

"Na kila mwaka baadaye, ni akiba safi."

"Au uwekezaji upya," alisema. "Athari ile ile."

Maya alitikisa kichwa. "Hii ndiyo nataka ufanye. Si uhifadhi na hifadhidata peke yake — kila kitu. Fanya uimarishaji wa gharama kuwa kazi ya kuendelea ya jukumu lako."

Tom hakuwahi kuelezewa kazi yake kwa njia hiyo. Aligundua ilikuwa sahihi na ya kuridhisha zote mbili.

Katika sura inayofuata: kipengele cha gharama kilichobaki — na kile kinachoshangaza karibu kila mtu.
