# Sura ya 17: Walinzi

Tukio hilo na IP ya Romania lilikuwa limezuiliwa. Siri zilikuwa kwenye Msimamizi wa Siri. Vitambulisho vilizungushwa. Vidhibiti vya mtandao viliimarishwa.

Lakini Priya alikuwa ameuliza swali ambalo lilihitimisha Sura ya 16: "Ikiwa kitu kisicho cha kawaida kilionekana kwenye CloudTrail, tungejuaje?"

Jibu la uaminifu lilikuwa: labda hawangefanya.

CloudTrail huhifadhi maelfu ya matukio kwa siku. Hakuna mwanadamu anayesoma zote. Priya aliangalia mwenyewe kila wiki, lakini hiyo ilimaanisha kuwa jambo fulani linaweza kutokea Jumanne na lisitambuliwe hadi Jumatatu inayofuata.

"Tunahitaji kitu ambacho kinatuangalia magogo," alisema.

Maya akatazama juu. "Moja kwa moja?"

"Moja kwa moja."

Swali la pili la Tom la siku: "Je! hiyo inagharimu kiasi gani?"

**Kategoria tatu za Tishio**

Vitisho vya usalama dhidi ya programu ya wingu kwa ujumla huangukia katika kategoria tatu:

**Mashambulizi ya sauti (DDoS)**: Mshambulizi hutuma trafiki nyingi sana hivi kwamba programu yako haiwezi kujibu watumiaji halali. Shambulio linaweza kuwa mamilioni ya maombi ya HTTP, au mafuriko ya pakiti za TCP SYN zilizoundwa ili kumaliza jedwali la muunganisho la seva yako.

**Mashambulizi ya utumaji (Mafanikio)**: Mshambulizi hutuma maombi iliyoundwa mahususi yaliyoundwa ili kutumia udhaifu katika programu yako - sindano ya SQL, uandishi wa tovuti tofauti, ingizo mbovu ambalo huvuruga kichanganuzi.

**Hitilafu za kitabia (Upelelezi na maelewano)**: Simu za API ambazo hazipaswi kufanyika (mtu anayeuliza hifadhidata yako yote ya mtumiaji saa 3 AM), shughuli isiyo ya kawaida ya IAM (vitambulisho vinatumika kutoka nchi mpya), au trafiki ya mtandao hadi mahali ambako haukutarajiwa.

AWS ina huduma iliyojitolea kwa kila moja:

- **AWS Shield**: Ulinzi wa DDoS
- **AWS WAF**: Ulinzi wa safu ya programu
- **Amazon GuardDuty**: Utambuzi wa tishio la tabia

**Ngao ya AWS: Kinyonyaji cha DDoS**

**AWS Shield Standard** imewashwa kiotomatiki kwa wateja wote wa AWS bila malipo ya ziada. Inalinda dhidi ya mashambulizi ya kawaida ya safu ya 3 (mtandao) na safu ya 4 (usafiri) ya DDoS - mafuriko ya SYN, mafuriko ya UDP, mashambulizi ya kukuza DNS.

CloudFront, Route 53, na Usawazishaji wa Mizigo Elastic hukaa ukingoni mwa mtandao wa AWS. Shambulio la DDoS linapolenga programu yako, hugusa huduma hizi zinazodhibitiwa kwanza. Miundombinu ya mtandao ya AWS inachukua shambulio kabla ya kufikia matukio yako ya EC2.

**AWS Shield Advanced** ndiyo daraja la kwanza ($3,000/mwezi kwa kila shirika). Inaongeza:

- Ulinzi kwa EC2, ELB, CloudFront, Global Accelerator, na Route 53
- Arifa za mashambulizi ya wakati halisi
- Ufikiaji wa Timu ya Majibu ya AWS Shield (SRT) - wahandisi wa usalama ambao wanaweza kukusaidia kujibu mashambulizi
- Ulinzi wa gharama: ikiwa shambulio litasababisha bili yako kuongezeka, AWS hukiri gharama za upasuaji
- Ugunduzi na upunguzaji wa DDoS ulioimarishwa kwenye safu ya 7 (safu ya maombi)

"Dola elfu tatu kwa mwezi?" Tom alisema.

"Kwa makampuni yanayoshughulikia mamilioni ya mapato, DDoS ambayo inawashusha kwa saa mbili inagharimu zaidi ya dola elfu tatu," Priya alisema.

Tom alifanya hesabu kimya kimya.

"Tutaanza na Standard," alisema hatimaye.

**AWS WAF: Kichujio cha Maombi**

**AWS WAF (Firewall ya Maombi ya Wavuti)** hufanya kazi katika kiwango cha HTTP - hukagua maudhui ya maombi ya wavuti kabla ya kufikia programu yako.

WAF imesanidiwa na **Web ACLs (Orodha za Udhibiti wa Ufikiaji)** — seti za sheria zinazofafanua nini cha kuruhusu, kuzuia, au kuhesabu.

WAF inaweza kushikamana na:

- Usambazaji wa CloudFront (kagua maombi ukingoni, kimataifa)
- Mizani ya Mizigo ya Maombi (kagua maombi katika ngazi ya mkoa)
- Lango la API
- AWS AppSync

**Sheria Zinazosimamiwa na WAF**: AWS na wachuuzi wengine huchapisha seti za sheria zilizoundwa awali:

- **Sheria Zinazodhibitiwa na AWS - Seti ya Kanuni ya Msingi**: Hulinda dhidi ya athari 10 za OWASP Kuu (sindano ya SQL, XSS, sindano ya amri, upitishaji wa njia, n.k.)
**Sheria Zinazodhibitiwa na AWS - Ingizo Mbaya Zinazojulikana**: Huzuia maombi yanayolingana na mifumo ya mashambulizi inayojulikana
**Sheria Zinazodhibitiwa na AWS - Orodha ya Sifa ya IP ya Amazon**: Huzuia IP zinazojulikana kuhusishwa na roboti na vichanganuzi
- **Sheria Zinazodhibitiwa na AWS - Udhibiti wa Bot**: Hutambua na kudhibiti trafiki ya roboti

Unaweza pia kuunda sheria maalum:

- "Zuia ombi lolote kwa kichwa cha Wakala wa Mtumiaji kilicho na 'sqlmap'" (kitambazaji cha kawaida cha sindano cha SQL)
- "Kikomo cha viwango: usiruhusu maombi zaidi ya 1000 kwa IP kwa dakika 5"
- "Zuia maombi ambayo yana `<script>` katika thamani yoyote ya parameta"

Kwa Nimbus, usanidi wa vitendo: WAF kwenye usambazaji wa CloudFront na Core Rule Set kuwezeshwa. Hii huzuia mifumo ya kawaida ya uvamizi kabla ya maombi kufikia matukio ya EC2.

**Amazon GuardDuty: Mchambuzi wa Tabia**

GuardDuty kimsingi ni tofauti na Shield na WAF. Haizuii mashambulizi — **hutambua tabia isiyo ya kawaida**.

GuardDuty inachambua kila wakati:

- **Kumbukumbu za CloudTrail za AWS **: Mabadiliko ya IAM, simu za API, kuingia kwa kiweko
- **Kumbukumbu za Mtiririko wa VPC**: mifumo ya trafiki ya mtandao ndani ya VPC yako
- **Kumbukumbu za hoja za DNS**: matukio yako yanasuluhisha nini (programu hasidi inayojulikana mara nyingi hutatua vikoa mahususi vya C2)

Miundo ya kujifunza kwa mashine hutambua ruwaza zinazokengeuka kutoka kwa msingi wako. GuardDuty hutoa **majaribio** — arifa zilizoainishwa - inapogundua hitilafu.

Mifano ya kile GuardDuty inaweza kugundua:

- Mtumiaji wa IAM akiingia kutoka kwa anwani ya IP isiyotambulika (katika nchi ambayo hawajawahi kutumia hapo awali)
- Simu za API zinapigwa kutoka kwa nodi ya kutoka ya Tor
- Mfano wa EC2 unaowasiliana na dimbwi la uchimbaji madini la cryptocurrency
- Sauti ya juu ya simu ya API isiyo ya kawaida (matumizi mabaya ya kitambulisho au skanning)
- Ndoo ya S3 inafikiwa na anwani ya IP ambayo imealamishwa kwa shughuli mbaya
- Trafiki ya nje kwa kikoa kinachojulikana kuhusishwa na amri na udhibiti wa programu hasidi

"Hii ndiyo ingeweza kupata IP ya Kiromania," Leo alisema kimya kimya.

"Kama tungewasha GuardDuty, ingealamisha tukio la EC2 kutengeneza miunganisho ya nje kwa IP ya nje isiyotambulika saa 2 asubuhi," Priya alithibitisha.

"Inagharimu kiasi gani?"

Bei ya GuardDuty inategemea kiasi cha kumbukumbu zilizochanganuliwa - matukio ya CloudTrail, data ya mtiririko wa VPC, hoja za DNS. Kwa programu ndogo hadi ya kati, kwa kawaida $50-150/mwezi. Kwa kiwango, bado ni sehemu ndogo ya gharama za miundombinu.

Tom akavuta koni na kuiwezesha.

**Kuunganisha Huduma Tatu**

Shield, WAF, na GuardDuty hufanya kazi katika tabaka tofauti na kukamilishana:

| Huduma | Tabaka | Kinga Dhidi | Kitendo |
|---------------------------------------------------------- ------------------------|----------------------------------|
| Ngao ya AWS | Mtandao/Usafiri (L3/L4) | DDoS mafuriko | Hunyonya/hupunguza mashambulizi |
| AWS WAF | Maombi (L7) | OWASP 10 Bora, roboti, vichakachuaji | Huruhusu, huzuia, au huhesabu maombi |
| GuardDuty | Tabia (magogo yote) | Makosa, vitambulisho vilivyoathiriwa, programu hasidi | Inatambua na arifa |

Ngao huzuia mafuriko. WAF huchuja maji. GuardDuty hutazama mabomba kwa mifumo isiyo ya kawaida ya mtiririko.

**CloudTrail: Msingi**

Huduma zote tatu zinategemea kumbukumbu. **AWS CloudTrail** ni huduma ya kukata miti inayonasa kila simu ya API katika akaunti yako ya AWS - ni nani aliyepiga simu nini, lini, kutoka wapi, na matokeo yake ni nini.

CloudTrail imewashwa kwa chaguomsingi kwa historia ya siku 90 kwenye kiweko. Ili kuhifadhi kumbukumbu kwa muda mrefu:

1. Unda njia inayoandika kwa ndoo ya S3
2. Hiari, tuma kwa Kumbukumbu za CloudWatch kwa arifa za wakati halisi
3. Washa uthibitishaji wa faili ya kumbukumbu (ili kugundua ikiwa kumbukumbu zimechezewa)

GuardDuty, AWS Config, na Security Hub zote zimesomwa kutoka CloudTrail. Bila kumbukumbu za CloudTrail, huduma hizi hazina chochote cha kuchanganua.

**Kitovu cha Usalama cha AWS: Dashibodi**

Iwapo unatumia akaunti nyingi za AWS au unahitaji mwonekano uliounganishwa wa matokeo ya usalama, **AWS Security Hub** hujumlisha matokeo kutoka kwa GuardDuty, Inspekta (tathmini ya kuathirika), Macie (faragha ya data), Config, na Firewall Manager kwenye dashibodi moja.

Pia hukagua usanidi wako dhidi ya mbinu bora za usalama (kiwango cha Mbinu Bora za Usalama wa Msingi za AWS) na Kigezo cha Msingi cha CIS AWS.

Kwa Nimbus: Kitovu cha Usalama kilikuwa bado hakihitajiki. Zilipokua hadi akaunti tatu (dev, staging, production), ingefaa.

## Nguvu na Mapungufu

**Ngao ya AWS**:

- Kawaida: bure na otomatiki - hakuna sababu ya kutoitumia
- Advanced: bora kwa malengo ya hali ya juu; gharama kubwa kwa timu ndogo

**AWS WAF**:

- Vikundi vya sheria vinavyosimamiwa hurahisisha usanidi kwa kiasi kikubwa
- Sheria maalum zinahitaji kuelewa mifumo ya mashambulizi ya HTTP
- Kupunguza viwango ni kipengele chenye nguvu ambacho mara nyingi hupuuzwa
- WAF si mbadala wa msimbo salama wa maombi - ni safu ya ulinzi wa kina

**Wajibu wa Walinzi**:

- Jitihada ya chini sana kuwezesha (mibofyo michache)
- Matokeo yanahitaji ukaguzi na majibu ya kibinadamu - GuardDuty hutambua, hairekebishi
- Chanya za uwongo hutokea - shughuli fulani halali inaonekana isiyo ya kawaida kwa miundo ya ML
- Jaribio lisilolipishwa la siku 30 - inafaa kuwezesha mara moja

## Muhtasari

- **AWS Shield Standard**: Ulinzi wa DDoS bila malipo na kiotomatiki kwenye safu ya 3/4. Imewashwa kila wakati.
- **AWS Shield Advanced**: Ulinzi wa hali ya juu wa DDoS na ufikiaji wa SRT na ulinzi wa gharama. Kesi ya matumizi ya biashara.
- **AWS WAF**: Ukuta wa safu ya maombi. Kagua na uchuje maombi ya HTTP. Ambatisha kwa CloudFront, ALB, au API Gateway. Tumia Vikundi vya Sheria Zinazodhibitiwa kwa ulinzi 10 Bora wa OWASP.
- **Amazon GuardDuty**: Utambuzi wa tishio la tabia. Huchanganua Kumbukumbu za CloudTrail, VPC Flow, na kumbukumbu za DNS. Hutoa matokeo ya shughuli isiyo ya kawaida.
- **CloudTrail**: Msingi wa ukataji wote wa usalama wa AWS. Washa njia ya kuandika kwa S3 kwa uhifadhi wa muda mrefu.
- Huduma hizi hukamilishana: Ngao kwenye safu ya mtandao, WAF kwenye safu ya programu, GuardDuty kwenye safu ya tabia.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Salama (Kikoa cha 1, Kazi ya 1.2)*

- **Shield Standard vs Advanced**: Kiwango ni bure na kiotomatiki. Mahiri hugharimu pesa na huongeza SRT, ulinzi wa gharama na utambuzi bora. Ishara za mtihani wa Advanced: "DDoS ya kiwango kikubwa," "dhamana ya SLA wakati wa mashambulizi," "ulinzi wa kifedha dhidi ya ongezeko la gharama zinazohusiana na DDoS."
- **Alama za kesi za WAF**: "zuia sindano ya SQL," "zuia uandishi wa tovuti mbalimbali," "kikomo cha simu za API," "zuia mawakala mahususi wa watumiaji," "OWASP Top 10 ulinzi" → WAF.
- **Alama za GuardDuty**: "gundua shughuli isiyo ya kawaida ya API," "tambua kitambulisho kilichoathiriwa," "tia alama miunganisho ya mtandao ya EC2 isiyo ya kawaida," "akili ya tishio" → GuardDuty.
- **Kiambatisho cha WAF**: Inaweza kuambatishwa kwa CloudFront (kimataifa), ALB (ya kikanda), API Gateway (ya kikanda), AppSync.
- **Vyanzo vya data vya GuardDuty**: Matukio ya usimamizi wa CloudTrail, matukio ya data ya CloudTrail S3, Kumbukumbu za Mtiririko wa VPC, kumbukumbu za DNS. Mtihani unaweza kuuliza ni chanzo gani cha data kinachofaa kwa hali mahususi ya ugunduzi.
- **Macie**: Mara nyingi huchanganyikiwa na GuardDuty. **Macie** hutumia ML kugundua data nyeti katika S3 (PII, vitambulisho, data ya fedha). **GuardDuty** hutambua vitisho na hitilafu katika tabia. Kesi za matumizi tofauti.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza tofauti kati ya AWS WAF na Amazon GuardDuty. Kila huduma inalinda dhidi ya nini, na kila safu hufanya kazi katika safu gani?

*(Kidokezo: Fikiria kuhusu WAF kama kichujio cha maombi yanayoingia, na GuardDuty kama mchambuzi wa tabia anayetazama kumbukumbu zako.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Tovuti ya kampuni ya reja reja inalengwa na botnet ambayo hutuma mamilioni ya maombi kwa saa kwenye API yao ya utafutaji wa bidhaa. Maombi yanaonekana kuwa halali (mifuatano halali ya Wakala wa Mtumiaji, vidakuzi halali vya kipindi) lakini hayasababishi ununuzi - yanafuta bei za bidhaa. Shambulio hilo linasababisha wateja halali kupata nyakati za polepole za kujibu.

Ni mseto upi wa huduma BORA hushughulikia tishio hili?

A) AWS Shield Advanced na CloudFront  
B) AWS WAF yenye sheria za kupunguza viwango na CloudFront  
C) Amazon GuardDuty na AWS Shield Standard  
D) ACL za mtandao zinazozuia safu za IP za botnet

**Kidokezo cha 1**: Maombi ni kiwango cha HTTP (safu ya programu). Ni huduma gani inayofanya kazi kwenye safu ya HTTP?

**Kidokezo cha 2**: Boti hutumia anwani nyingi tofauti za IP - kuzuia masafa mahususi ya IP katika kiwango cha NACL hakufanyi kazi dhidi ya boti kubwa.

**Kidokezo cha 3**: Kuweka kikomo kwa anwani ya IP kunaweza kupunguza kasi ya kukwarua hata kama huwezi kuizuia kabisa.

**Jibu**: B

**Maelezo**: AWS WAF inaweza kukadiria maombi ya kikomo kwa kila anwani ya IP, na kupunguza athari za kukwaruza kwa sauti ya juu kutoka chanzo chochote. CloudFront inasambaza trafiki inayoingia kwenye mtandao wa ukingo wa AWS, inachukua sauti na kulinda asili. Sheria za WAF pia zinaweza kulingana na mifumo ya ombi (maombi ya mfuatano wa haraka hadi mwisho wa API) ili kubaini tabia ya kukwaruza.

**Kwa nini isiwe A?** Shield Advanced hulinda dhidi ya mafuriko ya DDoS (safu 3/4). Hali hii inaelezea uchakachuaji wa safu ya programu (safu ya 7 ya maombi ya HTTP), ambayo Shield haikagua.

**Kwa nini si C?** GuardDuty hutambua hitilafu katika tabia ya akaunti yako ya AWS — haizuii maombi yanayoingia ya HTTP. Shield Standard haishughulikii mashambulizi ya safu ya programu.

**Kwa nini isiwe D?** Boti kubwa hutumia maelfu ya anwani za IP kutoka kwa vyanzo vilivyosambazwa. Kuzuia masafa mahususi ni mbinu ya whack-a-mole ambayo inashindwa dhidi ya boti za kisasa.

*Kikoa cha SAA-C03: Usanifu Salama wa Kubuni — Jukumu la 1.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inazingatia mtindo wao wa vitisho wanapojitayarisha kushughulikia data ya kadi ya mkopo. Mapitio ya kufuata ya PCI-DSS yanahitaji:

- Ulinzi dhidi ya mashambulizi ya DDoS ya safu ya mtandao
- Uchujaji wa safu ya programu kwa ushujaa unaojulikana wa wavuti
- Kuingia kwa simu zote za API kwa duka linaloonekana kuharibika, la muda mrefu
- Ugunduzi wa mifumo isiyo ya kawaida ya ufikiaji kwa huduma ya malipo

Weka kila hitaji kwa huduma au usanidi maalum wa AWS. Je, Shield Standard inatosha, au je, muktadha wa PCI-DSS unapendekeza Kina? Ungeambatisha wapi WAF?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kupanga mahitaji ya kufuata huduma za AWS.)*

## Onyesho la Baada ya Mikopo

GuardDuty imewezeshwa.

Saa arobaini na nane baadaye, ilitoa matokeo yake ya kwanza: *"EC2 Instance i-0abc123 inawasiliana na njia ya kutoka ya Tor inayojulikana."*

Leo aliangalia kitambulisho cha mfano.

"Huo ni mfano wa ufuatiliaji wa ndani," alisema. "Ile niliyoweka ili kuendesha uchunguzi wa mtandao."

"Inapaswa kuwasiliana na nodi za kutoka za Tor?"

"Hapana." Akanyamaza. "Kwa nini hivyo?"

Akavuta mfano. Mtu fulani alikuwa amesakinisha chombo juu yake - skana halali ya mtandao wa chanzo-wazi ambayo, ikawa, pia iliwasiliana na miundombinu ya Tor kwa ajili ya ukusanyaji wa data usiojulikana.

"Kwa hivyo chombo kilikuwa kinaita nyumbani," Priya alisema.

"Bila ufahamu wangu," Leo alithibitisha.

"Hiyo ni hatari ya ugavi. Utegemezi unaofanya mambo ambayo hukuidhinisha."

Leo aliondoa zana. Alianzisha mchakato wa kukagua kila zana ya wahusika wengine kabla ya usakinishaji.

"Je, hii ni kiwango cha paranoia tuko sasa?" Maya aliuliza.

“Ndiyo,” alisema Priya.

"Hiki ndicho kiwango ambacho tunapaswa kuwa nacho kila wakati?" Maya aliuliza.

“Naam pia,” alisema Priya.

Katika sura inayofuata: nini kinatokea wakati kituo cha data huko Virginia kinapotea - na kwa nini Nimbus inaendelea kufanya kazi.
