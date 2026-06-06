# Sura ya 30: Gharama Iliyofichwa

Tom alikuwa na ubao mweupe katika chumba cha mikutano wenye safu tatu: kompyuta, uhifadhi, mtandao. Mbili za kwanza zilikuwa zimejazwa — nambari, tarehe, majina ya maboresho yaliyokamilika. Alisimama kwenye ubao mweupe kwa muda kabla ya kuandika chochote katika safu ya tatu. Mistari ya mtandao kwenye bili ya AWS ilitawanyika katika ukurasa kwa namna ambayo nyingine hazikufanya. Kila mmoja ulikuwa na jina tofauti, kitengo tofauti, uhalali tofauti wa kwa nini pesa zilikuwa zikiondoka.

Aliondoa kifuniko cha kalamu ya alama.

**Muhtasari wa Haraka: Kisichojulikana cha Mwisho kwenye Bili**

Ukaguzi wa hifadhidata ulikuwa umefunga kipengee kikubwa cha mwisho cha bili ambacho Tom alikuwa akifanyia kazi kikamilifu — $491/mwezi zilizorudishwa, $5,892 kwa mwaka. Ongeza Savings Plans za EC2, sera za mzunguko wa maisha za S3, na usafishaji wa uhifadhi, na jumla inayoendesha ilikuwa $34,092 katika akiba ya kila mwaka katika miezi mitatu ya kazi. Lakini Tom alikuwa amegundua, wakati wa uchunguzi wa kina wa hifadhidata, kwamba aina moja ilikuwa imechunguzwa kwa shida tu. Gharama za uhifadhi zilijitokeza kama mstari mmoja: "S3: $198." Gharama za kompyuta zilijitokeza kama mstari mmoja: "EC2: $2,340" — kabla punguzo za Savings Plan za Sura ya 27 kufika. Gharama za mtandao zilitawanyika katika kadhaa ya viingilio vyenye majina kama "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," na "CloudFront Data Transfer." Hakuwahi kuzijumlisha na kuangalia jumla. Hiyo ilikuwa kazi ya leo.

Tom alivuta bili. Alipata sehemu ya uhamishaji wa data. Alijumlisha vipengee vyote vya mstari.

Gharama za mtandao katika AWS ni kama mfumo wa ushuru wa jiji: kuendesha ndani ya jiji ni bure, lakini kila handaki unalochukua kwenda nje linagharimu pesa, na kuendesha kati ya mitaa kunagharimu kidogo pia. Watu wengi hawafikirii kuhusu ushuru mpaka wanapopata bili mwishoni mwa mwezi na kugundua kwamba wamekuwa wakichukua handaki kila siku wakati kulikuwa na barabara ya juu ya bure wakati wote. Lengo la sura hii ni kuelewa kila kibanda cha ushuru — na kuamua zipi zinastahili kulipwa.

$847/mwezi.

"Tunatumia $847 kwa mwezi kwa uhamishaji wa data," alisema.

"Je, hiyo ni nyingi?" Leo aliuliza.

"Ni sawasawa na bili yetu ya S3 ilivyokuwa kabla ya kuiboresha. Na sikujua hata kwamba tulikuwa na bili ya uhamishaji wa data ya ukubwa huu."

Maya alitazama. "Uhamishaji wa data ni nini hasa?"

"Ni kile AWS inalipia kwa kuhamisha baiti. Baiti zinazoingia AWS: kwa kawaida bure. Baiti zinazotoka AWS kwenda mtandaoni: zinalipiwa. Baiti kati ya huduma katika mikoa tofauti: zinalipiwa. Baiti zinazopita kwenye NAT Gateway: zinalipiwa."

"Unaweza kuvunja kwa kina?"

Tom angeweza. Lakini hakuishia kwenye koni ya malipo wakati huu. Aliwezesha VPC Flow Logs katika VPC zao zote na kuzilisha CloudWatch Logs Insights. Hili lilimruhusu kuhoji mtiririko halisi wa trafiki — si tu kiasi cha dola, bali ni vyanzo gani vilikuwa vikituma data wapi, na kiasi gani.

Hoji ilichukua dakika mbili kuendesha. Pamoja na chanzo kimoja zaidi cha logi ambacho angevuta hivi karibuni, matokeo yalikuwa mahususi vya kutosha kuchukua hatua.

**Uchambuzi wa Trafiki: Kile Kinachozalisha Bili Kweli**

Mitiririko mitano ya juu ya trafiki kwa kiasi, kwa mpangilio:

1. Seva za programu za EC2 → NAT Gateway → huduma za AWS (SSM, Secrets Manager, CloudWatch, SQS): 3.9TB/mwezi
2. Seva za programu za EC2 → NAT Gateway → API za nje: 1.3TB/mwezi
3. Kituo cha msomaji cha Aurora → seva za programu za EC2 (toka AZ hadi AZ): 0.4TB/mwezi
4. Mzunguko wa uchambuzi → ndoo ya S3 katika us-east-1 (toka kanda hadi kanda): 0.3TB/mwezi
5. CloudFront → chanzo cha S3 (kukosa kache): 0.2TB/mwezi

Minne ya kwanza ilitoka moja kwa moja kutoka Flow Logs. Wa tano usingeweza kutoka: VPC Flow Logs zinaona tu trafiki inayovuka violesura vya mtandao ndani ya VPC zako, na kukosa kache kwa CloudFront kunakofetsha kutoka S3 hakugusi VPC kabisa — ni CloudFront ikizungumza moja kwa moja na S3. Kwa mtiririko huo, Tom alivuta logi za kawaida za ufikiaji za CloudFront na kuchuja kwenye uga wa `x-edge-result-type`: kila kiingilio kilichowekewa alama `Miss` ni ombi ambalo CloudFront ilibidi ifetshe kutoka chanzo, na kujumlisha baiti kulimpa hiyo 0.2TB. Bili moja, vyombo viwili — kila kimoja kipofu kwa kile kingine kinachoona.

"Mtiririko nambari nne," Priya alisema. "Kwa nini mzunguko wetu wa uchambuzi unazungumza na ndoo katika us-east-1?"

Leo alikuwa na sura usoni mwake ambayo Tom aliitambua.

"Tayari niliusambaza — lo," Leo alisema. "Miezi sita iliyopita nilikuwa nikijaribu kama mzunguko wetu wa uchambuzi ungeweza kusambaa kwa mikoa mingi kwa sambamba. Nilizindua ndoo ya majaribio katika us-east-1, nikaelekeza mzunguko kwake, na kuiendesha kwa wiki. Jaribio liliisha lakini nilisahau kuondoa marudio ya us-east-1 kutoka usanidi wa mzunguko."

"Kwa hivyo kwa miezi mitano," Tom alisema, "tumekuwa tukiandika nakala ya kila matokeo ya uchambuzi kwa ndoo katika Virginia."

"Hii inagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Uhamishaji wa toka kanda hadi kanda kutoka us-west-2 hadi us-east-1: $0.02/GB. 300GB/mwezi = $6/mwezi kwa uhamishaji. Pamoja na uhifadhi wa S3 kwa data ya nakala katika us-east-1: 300GB × miezi 5 × $0.023/GB = $34.50 katika data iliyohifadhiwa.

"Si kubwa," Leo alisema.

"Si kubwa kwa mwezi," Tom alisema. "Lakini imekuwa ikiendesha kwa miezi mitano na hakuna aliyejua. Ni gharama isiyokusudiwa. Swali si kama $6 ina maana — ni kama tunajua kwa nini kila dola inatumika."

Leo alifuta ndoo ya majaribio ya us-east-1 na kuondoa marudio kutoka usanidi wa mzunguko.

Ugunduzi wenye uwezekano mkubwa zaidi wa kuchukua hatua katika matokeo ya logi ya mtiririko ulikuwa mtiririko nambari moja: seva za programu za EC2 zinazopiga huduma za AWS kupitia NAT Gateway.

Tom alivuta viingilio mahususi vya logi kwa hoji ya CloudWatch Logs Insights, vilivyochujwa kuonyesha tu trafiki inayoelekea masafa ya IP ya huduma za AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Matokeo yalionyesha kitu ambacho hakukitarajia: takriban GB 300 kwa mwezi za trafiki ya S3 ya kanda moja — tofauti na mtiririko wa toka kanda hadi kanda kwenda ndoo ya us-east-1 ya Leo — ilikuwa ikipita kwenye NAT Gateway. Lakini Tom alikuwa tayari amesanidi S3 Gateway Endpoints miezi iliyopita.

"Tuna S3 Gateway Endpoint," Leo alisema. "Kwa nini trafiki ya S3 bado inapita kwenye NAT?"

Tom aliangalia jedwali la njia. Gateway Endpoint ilikuwa imesanidiwa — lakini kwa VPC ya programu pekee. Mzunguko wa uchambuzi uliendesha katika VPC tofauti ambayo ilikuwa imeundwa miezi tisa iliyopita kwa kutengwa kwa data. VPC hiyo haikuwa na S3 Gateway Endpoint. Kila simu ya S3 kutoka vipengele vya EC2 vya mzunguko wa uchambuzi ilipita kwenye NAT Gateway ya VPC hiyo.

"0.3TB ya trafiki ya mzunguko wa uchambuzi × $0.045/GB = $13.50/mwezi," Tom alisema. "Kutoka tu kwa sehemu ya mwisho iliyokosekana katika VPC ya pili."

"Ingegharimu kiasi gani kuongeza sehemu ya mwisho?" Leo aliuliza.

"Sifuri," Tom alisema. "S3 Gateway Endpoints ni bure. Ni kiingilio cha jedwali la njia."

Kuongeza Gateway Endpoint kwa VPC ya uchambuzi kungechukua dakika nne na kukata $13.50 kutoka ada ya kila mwezi ya NAT Gateway — nambari ndogo kwa maana kamili, lakini ugunduzi ulikuwa kanuni. Walikuwa wameongeza udhibiti wa gharama katika VPC moja na kusahau kuirudia walipounda ya pili. Uthabiti ulihitaji mchakato, si maarifa pekee.

Tom aliongeza kwenye orodha ya usambazaji: unapounda VPC mpya, ongeza S3 na DynamoDB Gateway Endpoints kabla ya kuambatisha mizigo yoyote ya kazi.

Ugunduzi wa pili mahususi kutoka logi za mtiririko ulikuwa ghali zaidi. Trafiki kutoka kazi za Lambda zilizoendesha mfumo wa arifa za maagizo — ufikiaji wa S3 kwa kusoma faili za usanidi wa mgahawa — ilikuwa ikipita kwenye NAT Gateway badala ya sehemu ya mwisho ya S3. Kazi za Lambda ziliendesha ndani ya VPC (kwa ufikiaji wa RDS), na sehemu ya mwisho ya S3 ya VPC ilikuwa imesanidiwa tu kwa vipengele vya EC2 katika subneti ya programu. Kazi za Lambda katika subneti ya Lambda zilikuwa zikipita kwenye NAT.

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza. "Tuna sehemu ya mwisho. Kwa nini Lambda haiitumii?"

"VPC Gateway Endpoints zinatumika kwa kila subneti kwa kuzingatia majedwali ya njia," Tom alisema. "Kazi za Lambda ziko katika subneti yao wenyewe yenye jedwali lao la njia. Jedwali hilo la njia halikuwa na njia ya sehemu ya mwisho. Niliiongeza kwa subneti ya programu. Nilikosa subneti ya Lambda."

Kuongeza njia ya sehemu ya mwisho ya S3 kwa jedwali la njia la subneti ya Lambda kungeokoa $41/mwezi nyingine katika ada za usindikaji za NAT Gateway zilizokuwa zikitoza kwa simu za S3 zilizopaswa kuwa bure.

Uchambuzi wa logi ya mtiririko ulikuwa umejilipa. Masaa matatu ya muda wa hoji, matokeo matatu thabiti: sehemu ya mwisho iliyosahaulika ya VPC ya uchambuzi ($13.50/mwezi), pengo la upitishaji wa subneti ya Lambda ($41/mwezi), na ugunduzi mkubwa wa awali uliokuwa msingi wa maamuzi ya Interface Endpoints. Jumla ya akiba ya ziada ya kila mwezi iliyotambuliwa na uchambuzi wa logi ya mtiririko: $54.50, juu ya $78 kutoka Interface Endpoints ambao uchambuzi ulikuwa tayari umeufichua. Marekebisho hayo mawili madogo yaliingia kwenye orodha ya kazi kwa mbio ijayo; jedwali la akiba mwishoni mwa sura hii linahesabu tu kile kilichosafirishwa.

"Somo ni kwamba sehemu za mwisho za VPC si usanidi wa mara moja," Tom alisema. "Kila VPC mpya, kila subneti mpya, kila aina mpya ya mzigo wa kazi inahitaji ukaguzi ule ule. Chaguo-msingi kwa chochote katika subneti ya kibinafsi ni kupita kwenye NAT. Ukaguzi ni: je, mzigo huu wa kazi unapiga S3, DynamoDB, au huduma yoyote ya trafiki nyingi ya AWS? Ikiwa ndiyo, je, una njia ya sehemu ya mwisho?"

"Je, tumefikiria kufanya ukaguzi huo kiotomatiki?" Priya aliuliza. "Sheria ya AWS Config inayotahadharisha subneti ya kibinafsi inapoundwa bila njia ya sehemu ya mwisho ya S3?"

"Iko kwenye orodha," Tom alisema. "Mara baada ya tahadhari ya kiasi yatima."


Na kwa hilo, Tom alikuwa na jibu lake kwa swali lililoanzisha uchambuzi. Gharama za mtandao hazikuwa tatizo moja. Zilikuwa matatizo matano tofauti, kila moja na suluhisho tofauti.

**Jinsi AWS Inavyolipia kwa Uhamishaji wa Data**

Bei za uhamishaji wa data za AWS si linganifu:

**Kuingia AWS (inbound)**: Bure. Unaweza kupakia data kiasi chochote unachotaka.

**Kutoka AWS kwenda mtandaoni (outbound)**: Inalipwa. GB 100 za kwanza/mwezi ni bure. Baada ya hapo:

- $0.09/GB kwa TB 10 za kwanza/mwezi (mikoa ya Marekani)
- $0.085/GB kwa TB 40 inayofuata
- Chini kwa kiwango cha juu zaidi

**Ndani ya Availability Zone ile ile**: Bure. Vipengele vya EC2 vikizungumzana katika AZ ile ile havilipi chochote.

**Kati ya Availability Zones (kanda moja)**: $0.01/GB kwa kila upande. Gharama ndogo lakini halisi.

**Kati ya Mikoa**: $0.02-0.08/GB kulingana na mikoa. Trafiki ya toka kanda hadi kanda ni ghali zaidi kwa kiasi kikubwa.

**NAT Gateway**: $0.045/GB iliyoshughulikiwa. Kila baiti kipengele chako cha EC2 cha kibinafsi kinatuma kwenye NAT Gateway kufikia mtandao — na kila baiti inayorudi — inalipwa.

**CloudFront**: Viwango vya chini vya uhamishaji wa data kuliko moja kwa moja AWS-hadi-mtandao. $0.085/GB kwa TB 10 za kwanza (kidogo chini ya uhamishaji wa moja kwa moja wa data nje). CloudFront mara nyingi hupunguza gharama za jumla za uhamishaji kwa sababu kuhifadhi kache kwake pembezoni kunamaanisha chanzo kinahudumia data mara chache zaidi.

**Mgawanyo wa Tom**

"Hii inagharimu kiasi gani kwa mwezi?" Tom aliuliza, kwa kila kipengee cha mstari kwa zamu. Aliviongeza kwenye kichupo tofauti katika lahajedwali — si jumla ya kila mwezi, bali kila aina iliyovunjwa. Jumla ilikuwa na manufaa kidogo kuliko kuelewa ni sehemu gani ya bili ilikuwa aina gani ya gharama.

Baada ya kuainisha kila kipengee cha mstari:

**Data ya outbound kwenda mtandaoni**: $214/mwezi

- Majibu ya API kwa wateja duniani kote
- Mali bado zinazohudumiwa moja kwa moja kutoka S3 na ALB kwa wateja, zikipita CloudFront (ujazaji wa kache wenyewe — CloudFront ikifetsha kutoka chanzo cha AWS — ni bure: AWS inaachilia uhamishaji wa chanzo-hadi-CloudFront)

**Usindikaji wa NAT Gateway**: $289/mwezi

- Seva za programu zinazopiga API za nje (msindikaji wa malipo, huduma ya barua pepe, data ya ramani)
- Simu za DynamoDB zinazopita kwenye NAT Gateway (kabla sehemu za mwisho za VPC kuwekwa kwa jedwali baadhi)

**Uhamishaji wa data wa toka AZ hadi AZ**: $178/mwezi

- Kisambazaji cha mzigo kwa vipengele vya EC2 (kisambazaji cha mzigo kiko katika AZ moja, baadhi ya vipengele katika nyingine)
- Seva ya programu kwenda nakala ya kusomwa ya RDS (katika AZ tofauti)

**Uhamishaji wa data wa toka kanda hadi kanda**: $166/mwezi

- Upokezaji wa Aurora Global Database (msingi katika us-west-2, msomaji katika us-east-1)
- S3 Cross-Region Replication kwa nakala
- Mzunguko wa majaribio uliosahaulika wa Leo ($6/mwezi ya jumla hii)

**NAT Gateway: Mshangao Mkubwa Zaidi**

$289/mwezi katika ada za usindikaji za NAT Gateway lilikuwa kipengee kikubwa zaidi. Na uchambuzi wa VPC Flow Log ulikuwa umefanya kuwa mahususi: mtumiaji mkuu zaidi alikuwa seva za programu zikipiga API za huduma za AWS (SSM, Secrets Manager, CloudWatch Logs) kupitia NAT Gateway.

Katika Sura ya 11, Tom alikuwa amesanidi VPC Gateway Endpoints kwa S3 na DynamoDB. Hizi zilikuwa bure. Lakini alikuwa amekosa kusanidi Interface Endpoints kwa huduma zingine kadhaa:

- Systems Manager (SSM) kwa usimamizi wa viraka
- Secrets Manager kwa urejeshaji wa vyeti
- CloudWatch kwa usafirishaji wa vipimo na logi
- SQS kwa kupiga kura ujumbe

Kila simu kwa huduma hizi kutoka vipengele vya EC2 vya kibinafsi ilikuwa ikipita kwenye NAT Gateway. Kila simu ilitozwa $0.045/GB.

Huenda unajiuliza kwa nini AWS inatoza kwa trafiki inayopita kwenye NAT Gateway wakati tayari uko ndani ya mtandao wa AWS. Jibu ni kwamba NAT Gateway yenyewe ni huduma inayosimamiwa — inagharimu pesa kuendesha, na AWS inapitisha gharama hiyo kwa kila gigabaiti. VPC Endpoints zinaondoa mpatanishi, ndiyo sababu zinapunguza bili.

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza, Tom alipoonyesha nambari. "Tulisanidi Gateway Endpoints kwa S3 na DynamoDB. Kwa nini hatukufanya hivyo kwa SSM na CloudWatch?"

"Gateway Endpoints zinapatikana tu kwa S3 na DynamoDB," Tom alisema. "Kwa kila kitu kingine — SSM, Secrets Manager, SQS — unahitaji Interface Endpoints. Si bure, lakini ni nafuu kuliko kupita kwenye NAT kwa kiwango tunachozalisha."

**Interface Endpoints** kwa huduma hizi: $0.01/saa kwa kila AZ + $0.01/GB ya data iliyoshughulikiwa.

Kwa kiwango cha Nimbus, Interface Endpoint ya SSM ingegharimu karibu $25/mwezi (ada za kwa saa pamoja na usindikaji wa kwa GB) na kuokoa karibu $45/mwezi katika ada za NAT Gateway (kwa sababu SSM inazalisha kiwango kikubwa cha data kwa usimamizi wa viraka na simu za duka la parameta).

Gharama na akiba za sehemu za mwisho zilitofautiana kwa huduma na kiwango. Tom alihesabu kwamba kusanidi Interface Endpoints kwa huduma nne za trafiki nyingi — AZ mbili kila moja, pamoja na usindikaji wa $0.01/GB kwenye 3.9TB wangebeba — kungegharimu karibu $97/mwezi kwa jumla na kuokoa takriban $176/mwezi katika usindikaji wa NAT Gateway.

Akiba halisi: $78/mwezi kutoka kusanidi sehemu za mwisho peke yake.

"Na vipi ikiwa mtu atajaribu kuvunja?" Priya alisema, mazungumzo ya sehemu ya mwisho ya VPC yalipogeukia utekelezaji. "Sehemu ya mwisho ya VPC inamaanisha trafiki haigusi kamwe mtandao wa umma — hiyo si tu gharama, ni kupunguza eneo la vitisho. Tulipaswa kufanya hivi kwa manufaa ya usalama peke yake."

"Kukubaliana," Tom alisema. "Akiba ya gharama ni bonasi."

Leo alitazama orodha ya huduma zilizokuwa zikipita kwenye NAT. "Nina huenda nimesanidi sehemu za mwisho za uwekaji logi za CloudWatch bila kuangalia kama kulikuwa na sehemu ya mwisho ya VPC kwa ajili yake," alisema. "Itakuwa sawa kwa sasa — lakini ndiyo, hiyo imekuwa ikipita kwenye NAT kwa miezi sita."

"Hiyo iko kwenye orodha," Tom alisema. "CloudWatch ni moja ya nne tunazorekebisha."

**Hesabu ya PrivateLink: Wakati Inapokuwa na Maana**

Kuna toleo gumu zaidi la mazungumzo haya linalojitokeza miundo inavyokua: kutumia AWS PrivateLink kutoa muunganisho wa kibinafsi kwa huduma zinazohifadhiwa na wateja wengine wa AWS (au huduma zako mwenyewe katika VPC nyingine).

PrivateLink Interface Endpoints zinagharimu $0.01/saa kwa kila AZ pamoja na $0.01/GB. Kwa huduma inayozalisha 1TB/mwezi ya trafiki kupitia sehemu ya mwisho:

- Gharama ya PrivateLink: $0.01 × AZ 2 × masaa 730 + $0.01 × 1,000GB = $14.60 + $10 = $24.60/mwezi
- Kupitisha trafiki ile ile kupitia NAT Gateway iliyopo badala yake: $0.045 × 1,000GB = $45/mwezi ya ada za usindikaji za nyongeza

Ulinganisho ni wa *nyongeza*, kwa sababu NAT Gateway inabaki vyovyote vile — bado inahudumia trafiki nyingine inayoelekea mtandaoni, hivyo gharama yake ya kwa saa ($0.045 × 2 × 730 = $65.70) haiondoki huduma hii moja inapohamia sehemu ya mwisho. Kwa kiwango hiki cha trafiki, PrivateLink inaokoa takriban $20/mwezi. Hatua ya kufikia usawa ni takriban 420GB/mwezi — chini ya hapo, gharama ya sehemu ya mwisho yenyewe ya kwa saa inazidi akiba ya kwa GB ikilinganishwa na usindikaji wa NAT.

"Subiri — lakini *kwa nini* tungetumia PrivateLink badala ya VPN tu au peering?" Maya aliuliza.

"VPC Peering ni rahisi zaidi na ni bure kwa uhamishaji wa ndani ya kanda," Tom alisema. "Lakini peering inaunda muunganisho uliopitishwa kikamilifu kati ya VPC — chochote katika VPC A kinaweza kufikia chochote katika VPC B kinadharia. PrivateLink ni ya upasuaji zaidi. Sehemu ya mwisho inafichua huduma mahususi, si njia kamili ya mtandao. Kwa miundo yenye uangalifu wa usalama, umaalumu huo una umuhimu."

"Na vipi ikiwa mtu atajaribu kuvunja VPC iliyopeered?" Priya aliuliza. "Peering kamili inamaanisha kipengele kilichodukuliwa katika VPC moja kina njia kwa kila kipengele katika VPC iliyopeered."

"Hiyo ndiyo hoja ya PrivateLink juu ya peering unapounganisha na huduma ya mtu wa tatu au huduma inayomilikiwa na timu tofauti," Tom alisema. "Peering kwa VPC za ndani ya kampuni zinazoaminika. PrivateLink kwa chochote ambapo unataka muunganisho wa mfichuo-mdogo zaidi."

**Trafiki ya Toka AZ hadi AZ: Swali la Usanifu**

$178/mwezi katika uhamishaji wa data wa toka AZ hadi AZ ilikuwa ngumu zaidi.

Baadhi yake haikuepukika: kisambazaji cha mzigo husambaza trafiki katika AZ, hivyo baadhi ya maombi yanaanzia AZ moja na kisambazaji cha mzigo kinayaelekeza kwa kipengele katika AZ nyingine.

Baadhi yake inaweza kuimarishwa: programu ilisanidiwa kuandika kwa Aurora ya msingi (katika us-west-2a) na kusoma kutoka nakala ya kusomwa (katika us-west-2b). Kila hoji ya kusoma ilivuka mipaka ya AZ.

Kwa masomo, suluhisho moja: sanidi programu kupendelea nakala ya kusomwa katika AZ ile ile na kipengele kinachoomba. Kila AZ inapata nakala yake ya kusomwa. Trafiki inabaki ya ndani.

Biashara ya mbadala: nakala nyingi za kusomwa = gharama zaidi. Ikiwa gharama ya trafiki ya toka AZ hadi AZ ni $50/mwezi na nakala ya ziada ya kusomwa inagharimu $190/mwezi, uimarishaji wa ndani ya AZ haulipi.

Tom alihesabu: kwa kiwango chao cha sasa cha hoji, trafiki ya toka AZ hadi AZ ilikuwa $31/mwezi tu ya $178. Si yenye thamani ya kuongeza nakala kwa ajili yake.

Gharama zingine za toka AZ hadi AZ zilikuwa upitishaji wa kisambazaji cha mzigo na mawasiliano ya huduma-kwa-huduma — kwa kiasi kikubwa haziepukiki kwa kiwango cha sasa cha usanifu.

"Hii ni moja ya hali hizo ambapo kuelewa gharama hakumaanishi unapaswa kuirekebisha," Tom alisema.

"Ingegharimu kiasi gani kuondoa kabisa trafiki ya toka AZ hadi AZ?" Maya aliuliza.

"Kila kitu katika AZ moja kinashinda lengo la Multi-AZ. Hiyo ni akiba ya $31/mwezi kwa gharama ya kupoteza upatikanaji wa juu."

"Kwa hivyo tunaiacha," alisema.

"Tunaiacha."

**S3 Select: Kupunguza Uhamishaji wa Data katika Hoji**

Wakati wa kupitia mzunguko wa uchambuzi, Tom alipata uimarishaji mwingine mahususi kwa jinsi timu ya uchambuzi ilivyokuwa ikihoji faili kubwa za S3.

Muundo: kila asubuhi, kazi ya uchambuzi ilipakua faili ya Parquet ya MB 500 kutoka S3 ili kuichuja katika kumbukumbu kwa data ya maagizo mahususi ya mgahawa. Takriban 95% ya faili ilitupwa baada ya kupakua.

**S3 Select** inakuruhusu kupata safu na nguzo unazohitaji tu kutoka kitu cha S3 (CSV, JSON, Parquet), badala ya kupakua faili nzima ili kuichuja katika programu yako.

> **Sasisho muhimu**: katikati ya 2024, AWS iliacha kutoa S3 Select kwa wateja wapya — watumiaji waliopo wanaiendelea kuwa nayo, lakini ni njia ya mwisho kwa miundo mipya. Kanuni ambayo sehemu hii inafundisha (chuja kwenye tabaka la uhifadhi, usisafirishe faili nzima) haina muda; zana ya kisasa kwa ajili yake ni **Amazon Athena** (SQL moja kwa moja juu ya S3, ikiwa ni pamoja na michanganyiko na makusanyo ambayo S3 Select haikuwa nayo kamwe). **S3 Object Lambda**, ambayo wakati mmoja ilikuwa mbadala nyingine, ilifuata S3 Select katika hali ya urithi: kufikia Novemba 7, 2025 imefungwa kwa wateja wapya pia (mizigo ya kazi iliyopo inaendelea kuendesha). Kwenye mtihani wa sasa, "hoji data papo hapo kwenye S3" inaelekeza kwa Athena. Hadithi iliyo hapa chini imehifadhiwa kwa sababu *hoja* — pima kwanza, hamisha kichujio kwenye data — ndiyo somo.

Bila S3 Select:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Na S3 Select:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select hupunguza data iliyohamishwa kutoka S3 hadi programu yako. Kwa faili kubwa zenye hoji za kuchagua, hii inaweza kuwa kupungua kwa mara 10-100 kwa kiwango cha data — na, kwa kuwa kipengele cha uchambuzi kinaendesha katika kanda ile ile na ndoo, ushindi si bili ya uhamishaji (uhamishaji wa S3-hadi-EC2 wa kanda moja ni bure): ni kompyuta, kumbukumbu, na muda uliotumika kupakua na kuchuja data unayoitupa mara moja.

Tom aliliibua na timu ya uchambuzi. Walipinga mwanzoni.

"Tayari tunajua jinsi ya kuandika pandas," mchambuzi mmoja alisema.

"Hili si kuhusu pandas," Tom alisema. "Ni kuhusu ukweli kwamba unapakua MB 500 kupata MB 2 za data. Upakuaji wenyewe ni bure — kanda ile ile — lakini kipengele si. Unaendesha hii kwa kila mgahawa: migahawa 287, hoji 287, GB 140 zinazovutwa na kuchujwa katika pandas kila usiku. Hivyo ndivyo kinachofanya sanduku la uchambuzi kushughulika kwa masaa mawili — na ndiyo sababu ni xlarge."

"Na S3 Select?"

"S3 Select inatoza $0.002 kwa kila GB iliyochanganuliwa na $0.0007 kwa kila GB iliyorudishwa — karibu sehemu ya kumi ya senti kwa kila hoji. Kwa kubadilishana, kipengele kinapokea MB 600 kwa usiku badala ya GB 140, kazi inakamilika kwa dakika, na sanduku linaweza kushuka ukubwa."

"Hiyo ni $450 kwa mwezi," mchambuzi alisema, baada ya kufanya hesabu ya kipengele — makadirio ya nyuma-ya-bahasha kutoka kiwango cha kwa saa cha kipengele na masaa kilichotumia kusaga.

"Ndiyo sababu niko hapa," Tom alisema. Nambari halisi ingegeuka kuwa ya chini zaidi — Tom alipovuta baadaye matumizi halisi ya kompyuta yanayohusishwa na kazi ya usiku, ilifika $202/mwezi, si $450. Hesabu ya napkin inapata tatizo; upimaji unalipa saizi.

Tom aliliibua na Leo kwanza, kabla ya kuleta timu ya uchambuzi kwenye mazungumzo. Alijua Leo angepinga, na alitaka kuelewa upinzani kabla haujawa mjadala wa kiwango cha chumba.

"S3 Select ingeokoa $180/mwezi kwenye hoji za mzunguko wa uchambuzi," Tom alisema.

"Hiyo inahitaji kuandika upya kila hoji," Leo alisema.

"Inahitaji kubadilisha muundo wa ufikiaji wa data kutoka 'pakua na chuja' hadi 'hoji kupitia S3 Select API.'"

"Ambayo ni kuandika upya."

"Ni mabadiliko katika simu za maktaba ya mteja," Tom alisema. "Mantiki ya hoji — semi za kuchuja — inabaki ile ile. Kinachobadilika ni mahali kuchuja kunapotokea. Kwa sasa: EC2. Kwa S3 Select: S3."

"Nimesoma nyaraka za S3 Select," Leo alisema. "Huwezi kufanya michanganyiko. Huwezi kufanya makusanyo magumu zaidi ya SUM na COUNT ya msingi. Baadhi ya hoji zetu za uchambuzi ni za kisasa zaidi ya hapo."

"Najua," Tom alisema. "Ndiyo sababu sipendekezi S3 Select kwa hoji zote. Ninaipendekeza kwa hoji za muhtasari wa kila siku mahususi za mgahawa. Hiyo ndiyo faili ya Parquet ya MB 500 iliyochujwa kwa restaurant_id, ikivuta nguzo mbili. Hoji hiyo ni chuja-na-onyesha tupu. S3 Select ni hasa zana sahihi kwa kisa hicho."

Leo alikuwa kimya kwa muda. Alivuta hoji husika.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"Toleo la S3 Select lingekuwa nini — simu ya select_object_content?"

"Ndiyo," Tom alisema. "Ungebadilisha simu ya read_parquet na simu ya select_object_content inayosukuma kifungu cha WHERE kwa S3. Matokeo yanarudi tayari yamechujwa. Unapata mkondo wa rekodi zinazolingana badala ya faili nzima ya Parquet."

"Na ningebidi nishughulikie jibu kwa njia tofauti."

"Muundo wa jibu ni CSV kwa chaguo-msingi. Ungehitaji kifuniko kidogo kukichanganua kurudi kuwa DataFrame, au unatumia muundo wa towe wa Parquet ikiwa unataka kuhifadhi mantiki ya sasa ya uchanganuzi."

Leo alikiangalia. "Ni kazi kiasi gani hiyo?"

"Nusu siku," Tom alisema. "Pengine siku ikiwa unataka kuijaribu kikamilifu katika vitambulisho vyote 287 vya mgahawa katika kundi la usiku."

"Kwa $180/mwezi."

"$2,160 kwa mwaka," Tom alisema. "Na mbinu inapanuka. Kwa migahawa 2,000, hoji ile ile kwenye ukubwa ule ule wa faili inagharimu zaidi hata bila S3 Select. Unawekeza siku moja leo kuepuka tatizo kubwa zaidi baadaye."

Leo alifunga daftari. "Hoji ambazo S3 Select haifanyi kazi — hoji za makusanyo, ulinganisho wa toka mgahawa hadi mgahawa — hizo zinabaki kama zilivyo?"

"Hizo zinabaki kama zilivyo," Tom alithibitisha. "Sijaribu kuandika upya mzunguko wa uchambuzi. Ninajaribu kuacha kupakua MB 500 ili kutumia MB 2 yake."

"Sawa," Leo alisema. "Nitaifanya wiki hii."

Akaifanya. Utekelezaji ulichukua masaa sita. Alifunga simu ya S3 Select katika kazi ya huduma iliyolingana na kiolesura kile kile na simu iliyopo ya read_parquet — msimbo unaopiga simu katika kundi la usiku haukuhitaji mabadiliko yoyote kabisa. Tabaka la ufikiaji wa data pekee ndilo lilibadilika.

Mwezi uliofuata, bili ya kompyuta ya usiku ya mzunguko wa uchambuzi ilishuka kutoka $202 hadi $22 — kazi ilikamilika kwa dakika badala ya masaa, kwenye kipengele kidogo. Akiba ya $180/mwezi ilikuwa imegharimu masaa sita ya muda wa uhandisi. Kwa kila mwaka, hiyo ilikuwa faida ya 1,800% kwenye uwekezaji wa muda.

"Sehemu niliyopinga," Leo alisema, katika mapitio ya kila mwezi, "ilikuwa kuandika upya. Ilibainika kuwa ni kubadilisha kazi, si kuandika upya. Nilikuwa nikitatua tatizo la kuwaza."

"Hilo linastahili kuandikwa," Tom alisema. "Unapotathmini kama kutekeleza uimarishaji, kuwa mahususi kuhusu kazi halisi ni nini. 'Inahitaji kuandika upya hoji' ilikuwa toleo la kuwaza. 'Inahitaji kubadilisha kazi ya ufikiaji wa data' ilikuwa toleo halisi."


**"Gharama ya Kukusudia dhidi ya Isiyokusudiwa"**

Mwishoni mwa uchambuzi wa mtandao wa wiki tatu, Tom alirudisha mgawanyo kamili kwa timu. Alikuwa na safu mpya katika lahajedwali lake: "Iliyokusudiwa?" yenye ndiyo au hapana kwa kila kipengee cha mstari.

"Hiyo ndiyo fremu ninayotumia sasa," alisema. "Si tu 'inagharimu kiasi gani' bali 'je, tuliamua kutumia hii?'"

"Gharama iliyokusudiwa ni nini?" Maya aliuliza.

"Upokezaji wa Aurora Global Database. Tuliamua kupokeza kwa us-east-1 kwa sababu tuna washirika wa migahawa katika Pwani ya Mashariki. Hiyo ni $120/mwezi katika upokezaji wa toka kanda hadi kanda — takriban mara mbili ya makadirio ya nyuma-ya-bahasha kutoka siku za kupanga DR. Tulichagua gharama hiyo kwa sababu mahususi."

"Na isiyokusudiwa?"

"Mzunguko wa uchambuzi wa Leo ukiandika kwa us-east-1 kwa miezi mitano baada ya jaribio kuisha. Hakuna aliyechagua hiyo. Ilikuwa ikitokea kwa sababu hakuna aliyeangalia."

"Na ada za NAT Gateway kwa simu za huduma za AWS?"

"Mahali fulani katikati," Tom alisema. "Hatukuamua kwa uwazi kupitisha SSM kupitia NAT Gateway — hiyo ilikuwa chaguo-msingi. Hatukujua kulikuwa na chaguo la bei nafuu. Je, hiyo ni ya kukusudia? Tulifanya uchaguzi, ni tu kwamba hatukujua tulichokuwa tukichagua."

"Hiyo ndiyo aina hatari zaidi," Priya alisema. "Maamuzi ambayo hujui unayafanya."

"Ndiyo sababu uchambuzi wa VPC Flow Logs una umuhimu," Tom alisema. "Unafanya kisichoonekana kuonekana. Kila baiti inayovuka mpaka sasa ina hadithi tunayoweza kuifuatilia."

"Je, tumefikiria nini hutokea ikiwa tutaiacha hii iteleze tena?" Priya aliuliza. "Tumefanya uchambuzi wa mara moja. Katika miezi sita, Leo atakuwa ameunda ndoo nyingine ya majaribio mahali fulani."

"Nitakuwa hapa hapa," Leo alisema. "Nitaifanya katika eu-west-1 wakati ujao ili angalau iwe na gharama zaidi kwa GB na ugundue haraka zaidi."

"Mapitio ya kila mwezi ya VPC Flow Log," Tom alisema. "Nitayaongeza kwenye mapitio ya gharama ya robo. Tukiona mtiririko mpya wa toka kanda hadi kanda au mlipuko wa NAT Gateway, tunaufuatilia kabla ya bili inayofuata."

**Tofauti: Biashara ya Mbadala Unayoikubali**

Ikiwa utaondoa trafiki ya toka AZ hadi AZ kwa kuendesha kila kitu katika Availability Zone moja, unaokoa takriban $31/mwezi kwa kiwango cha sasa cha Nimbus — lakini unapoteza upungufu wa Multi-AZ wa thamani kubwa zaidi ya hiyo katika hatari ya tukio. Mazungumzo ya kukomaa ya gharama si daima kuhusu kupata akiba; wakati mwingine ni kuhusu kuelewa hasa unalipia nini na kuamua kwamba inastahili.

Ada ya toka AZ hadi AZ ni bei ya ustahimilivu. Baadhi ya gharama za mtandao ni kujitolea kwa usanifu, si ufanisi mbaya.

Uhusiano wa SAA-C03: mtihani mara kwa mara unawasilisha hali ambapo "uimarishaji wa gharama" ungeondoa upungufu. Jibu sahihi kwa kawaida ni kuhifadhi upungufu na kuimarisha mahali pengine — jua tofauti kati ya taka na gharama ya kuaminika.

**CloudFront: Punguzo la Uhamishaji wa Data**

Hapa kuna ukweli wenye mkanganyiko: kuhudumia data kupitia CloudFront kwa ujumla ni nafuu zaidi kuliko kuihudumia moja kwa moja kutoka EC2 au S3.

**EC2 moja kwa moja hadi mtandaoni**: $0.09/GB
**CloudFront hadi mtandaoni**: $0.085/GB (kidogo nafuu zaidi)

Lakini akiba halisi si kiwango cha kwa GB — ni kwamba CloudFront huhifadhi kache data kwenye maeneo ya pembeni. Ikiwa watumiaji 1,000 wataomba picha ile ile ya menyu:

- **Bila CloudFront**: maombi 1,000 yanatoka S3 moja kwa moja kwenda mtandaoni × ukubwa wa picha × $0.09/GB
- **Na CloudFront**: wateja wanapata picha kutoka pembeni kwa kiwango cha CloudFront ($0.085/GB), na ujazaji wa kache — CloudFront ikifetsha kutoka S3 kwenye kukosa 1 — ni **bure** (AWS inaachilia uhamishaji wa chanzo-hadi-CloudFront; unalipa tu maombi ya GET ya chanzo)

Kwa Nimbus na kiwango cha kupata kache cha 83% (kutoka Sura ya 13), 83% ya maombi hayakugusa kamwe chanzo kabisa — maombi machache ya chanzo, mzigo mdogo wa chanzo, na kila baiti ilitozwa kwa kiwango cha pembeni badala ya kiwango cha mtandaoni cha S3.

"CloudFront si tu CDN kwa utendaji," Tom alisema. "Ni pia uimarishaji wa gharama kwa uhamishaji wa data."

Leo alionekana mwenye fikra. "Tunapaswa kuhamisha utoaji wote wa maudhui thabiti kupitia CloudFront, hata kwa mali ambazo si nyeti kwa latency."

"Sahihi. Ikiwa watumiaji wanaipakua kutoka AWS, inapaswa kupita kwenye CloudFront."

**Uimarishaji Kamili wa Mtandao**

Baada ya wiki tatu za uchambuzi na utekelezaji:

| Kipengee cha Gharama                              | Kabla    | Baada    | Akiba ya Kila Mwezi |
|--------------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)                | $289     | $211     | $78            |
| Uimarishaji wa CloudFront (hamisha mali zaidi)   | $214     | $147     | $67            |
| Trafiki ya toka AZ hadi AZ (imekubaliwa ilivyo)  | $178     | $178     | $0             |
| Trafiki ya toka kanda hadi kanda (ndoo ya majaribio ya Leo) | $166 | $160 | $6        |
| **Jumla**                                        | **$847** | **$696** | **$151/mwezi** |

$151/mwezi, $1,812/mwaka katika akiba za mtandao. Kiasi kidogo ikilinganishwa na kompyuta na uhifadhi, lakini chenye maana.

Muhimu zaidi: Tom sasa alielewa kila mstari wa bili ya mtandao. Angeweza kueleza kila gharama na alikuwa ameamua kwa makusudi ipi kuiimarisha na ipi kuikubali. Tofauti kati ya gharama ya kukusudia na isiyokusudiwa sasa ilikuwa wazi na imeandikwa.

## Nguvu na Mipaka

**Gharama za NAT Gateway**:

- Kiasi kikubwa cha data kupitia NAT Gateway kinasanyika haraka
- VPC Endpoints zinaondoa baadhi ya gharama za NAT kabisa
- Pitia ni huduma gani vipengele vyako vya kibinafsi vinapiga simu na kama sehemu za mwisho zinapatikana

**CloudFront kwa gharama**:

- Kiwango cha kupata kache kinaamua moja kwa moja akiba za gharama
- Kiwango cha juu cha kupata kache = maombi machache ya chanzo na mzigo mdogo wa chanzo, pamoja na baiti zaidi zinazotozwa kwa kiwango nafuu cha CloudFront cha upande wa mtazamaji (uhamishaji wa chanzo-hadi-CloudFront kutoka vyanzo vya AWS hautozwi kabisa)
- Hamisha utoaji wote wa mali thabiti kupitia CloudFront

**Biashara za mbadala za toka AZ hadi AZ**:

- Kuondoa trafiki ya toka AZ hadi AZ kwa kawaida kunahitaji mabadiliko ya usanifu yanayogharimu zaidi kuliko akiba
- Hesabu kwa makini kabla ya kuimarisha

**S3 Select** (urithi — haipatikani kwa wateja wapya tangu 2024; tumia Athena badala yake. S3 Object Lambda pia ni urithi sasa — imefungwa kwa wateja wapya kufikia Novemba 2025, mizigo ya kazi iliyopo haiathiriki):

- Kanuni inasimama: chuja kwenye tabaka la uhifadhi badala ya kupakua vitu vikubwa vya S3 — akiba inajitokeza katika muda wa kompyuta, ukubwa wa kipengele, na muda wa kazi (uhamishaji wa S3 wa kanda moja tayari ni bure)
- Haisaidii unapohitaji faili nzima

## Muhtasari

Tom alifunga uchambuzi wa mtandao na nambari kwenye ubao mweupe na uelewa wazi zaidi wa kile ambacho kisichojulikana cha mwisho kwenye bili kilikuwa kweli. $847/mwezi katika gharama za mtandao haukuwa fumbo la kutokuwa na uwezo — ulikuwa gharama inayotarajiwa ya mfumo uliotawanyika uliopita availability zones, ulihudumia watumiaji wa kimataifa, na kupokeza data katika mikoa. Sehemu kubwa yake ilistahili kulipwa. Baadhi yake haikustahili. Hatua muhimu ilikuwa kuweza kutofautisha ipi ni ipi.

- AWS inalipia **data ya outbound** (mtandao: ~$0.09/GB), **trafiki ya toka AZ hadi AZ** ($0.01/GB kwa kila upande), **trafiki ya toka kanda hadi kanda** ($0.02-0.08/GB), na **usindikaji wa NAT Gateway** ($0.045/GB).
- **Data ya inbound** ni bure. **Trafiki ya AZ ile ile** ni bure.
- **VPC Flow Logs** zinafichua ni mitiririko gani mahususi ya trafiki ndani ya VPC zako inazalisha kila aina ya gharama — muhimu kwa uimarishaji ulioelekezwa. Mitiririko isiyovuka kamwe kiolesura cha mtandao cha VPC (kama CloudFront ikifetsha kutoka chanzo cha S3) inahitaji vyombo vyake: logi za kawaida za CloudFront au logi za ufikiaji wa seva za S3.
- **VPC Gateway Endpoints** (S3, DynamoDB): Bure. Zinaondoa gharama za NAT Gateway kwa huduma hizi.
- **VPC Interface Endpoints**: Bei kwa saa pamoja na kwa GB. Nafuu zaidi kuliko NAT Gateway kwa huduma za kiwango kikubwa.
- **CloudFront** inahudumia data kwa viwango vya chini kuliko moja kwa moja EC2-hadi-mtandao na inapunguza kwa kiasi kikubwa kiasi cha uhamishaji wa chanzo kupitia kuhifadhi kache.
- Swali muhimu si tu "kiasi gani" bali "je, gharama hii ni ya kukusudia?" Gharama zisizokusudiwa — mizunguko ya majaribio iliyosahaulika, upitishaji wa chaguo-msingi kupitia NAT — ndiko akiba halisi inajificha.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.4)*

- **NAT Gateway dhidi ya VPC Endpoints**: Hali ya mtihani: "EC2 katika subneti ya kibinafsi mara kwa mara inapiga S3/DynamoDB — jinsi ya kupunguza gharama za NAT Gateway?" → VPC Gateway Endpoints (bure kwa S3 na DynamoDB).
- **Sheria za bei za uhamishaji wa data**:
  - Kuingia AWS: bure
  - AZ ile ile: bure
  - Toka AZ hadi AZ: inalipwa
  - Toka kanda hadi kanda: inalipwa (kiwango cha juu zaidi)
  - Mtandao: inalipwa (kiwango kikubwa)
- **CloudFront kama uimarishaji wa gharama**: "Punguza gharama za uhamishaji wa data kwa utoaji wa maudhui wa kimataifa" → CloudFront. Tabaka la kache hupunguza maombi ya chanzo.
- **S3 Transfer Acceleration**: Huharakisha upakiaji *kwenda* S3 kwa kutumia maeneo ya pembeni ya CloudFront. Gharama ya juu zaidi kuliko S3 ya kawaida. Tumia kwa wateja wanaopakia faili kubwa kutoka maeneo ya mbali ya kijiografia.
- **Gharama za upokezaji wa toka kanda hadi kanda**: Kupokeza data katika mikoa kunasababisha ada za uhamishaji wa data. Kwa S3 CRR, unalipa kiwango cha uhamishaji wa data nje na gharama ya ombi la S3.
- **PrivateLink (VPC Interface Endpoints)**: Hutoa muunganisho wa kibinafsi kwa huduma za AWS na kwa huduma zinazohifadhiwa na wateja wengine wa AWS. Salama zaidi kuliko kupita kwenye NAT, mara nyingi nafuu kwa huduma za kiwango kikubwa. Hatua ya kufikia usawa dhidi ya usindikaji wa NAT Gateway ni takriban 420GB/mwezi (ikihesabu gharama ya sehemu ya mwisho yenyewe ya kwa-AZ kwa saa, na ikidhani NAT Gateway inabaki kwa trafiki nyingine).

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya VPC Gateway Endpoint na VPC Interface Endpoint. Huduma za AWS zipi zinapatikana kwa kila moja, na gharama ya kila moja ni nini?

*(Kidokezo: Gateway Endpoints ni bure lakini kwa S3 na DynamoDB tu. Interface Endpoints zinagharimu kwa saa lakini zinafanya kazi kwa huduma nyingi zaidi za AWS.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Programu ya kampuni inaendesha kwenye vipengele vya EC2 katika subneti za kibinafsi. Vipengele hufanya simu za mara kwa mara za API kwa Amazon SQS na Amazon S3. Kwa sasa, trafiki yote inatoka kupitia NAT Gateway. Timu inataka kupunguza gharama za NAT Gateway. Usalama wa data lazima udumishwe — trafiki yoyote haipaswi kupita kwenye mtandao wa umma.

Mbinu gani BORA inakidhi mahitaji haya kwa gharama ya kuendelea ya chini?

A) Unda Gateway Endpoint kwa SQS na Gateway Endpoint kwa S3  
B) Unda Interface Endpoints kwa SQS na S3 zote mbili  
C) Unda Interface Endpoint kwa SQS na Gateway Endpoint kwa S3  
D) Ondoa NAT Gateway na utumie lango la mtandao moja kwa moja kwa simu za API

**Kidokezo cha 1**: Gateway Endpoints zinapatikana kwa S3 na DynamoDB tu.

**Kidokezo cha 2**: Interface Endpoints zinapatikana kwa SQS na huduma nyingine nyingi (lakini zinagharimu pesa).

**Kidokezo cha 3**: Internet Gateway katika jedwali la njia la subneti ya kibinafsi ingeifanya kuwa subneti ya umma — ikikiuka mahitaji ya usalama.

**Jibu**: C

**Maelezo**: S3 inatumia Gateway Endpoint (bure). SQS inahitaji Interface Endpoint (inalipwa). Mchanganyiko huu unaondoa gharama za usindikaji wa data za NAT Gateway kwa huduma zote mbili. Trafiki yote inabaki ndani ya mtandao wa kibinafsi wa AWS — hakuna kupita kwenye mtandao wa umma.

**Kwa nini si A?** Gateway Endpoints hazipatikani kwa SQS. S3 na DynamoDB tu zina Gateway Endpoints.

**Kwa nini si B?** Ingawa hii inafanya kazi, kutumia Interface Endpoint kwa S3 (badala ya Gateway Endpoint ya bure) kunasababisha ada za kwa saa zisizo za lazima. Daima tumia Gateway Endpoint ya bure kwa S3 na DynamoDB.

**Kwa nini si D?** Kuongeza njia kwa Internet Gateway kutoka subneti ya kibinafsi kunaifanya kuwa subneti ya umma. Vipengele vya EC2 katika subneti za kibinafsi kwa kawaida havina Elastic IP, hivyo havingeweza kupita kupitia Internet Gateway bila mabadiliko ya ziada — na kufanya hivyo kungeyafichua kwa trafiki ya inbound ya mtandaoni.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Watumiaji wa Pwani ya Mashariki wa Nimbus wanazalisha trafiki kubwa. Programu inawahudumia kutoka us-west-2 (Oregon). Kwa sasa:

- Majibu ya API yanaenda moja kwa moja kutoka vipengele vya EC2 vya us-west-2 hadi watumiaji wa Pwani ya Mashariki (~millisekunde 80, $0.09/GB)
- Picha za menyu zinaenda kutoka S3 us-west-2 kupitia pembeni ya CloudFront huko Boston (~millisekunde 8 baada ya kuhifadhi kache)

Timu inafikiria kuongeza kanda ya pili ya programu katika us-east-1 (Northern Virginia) kwa watumiaji wa Pwani ya Mashariki kupunguza latency ya API.

Changanua gharama za uhamishaji wa data za mabadiliko haya. Ni gharama gani mpya za uhamishaji wa data za toka kanda hadi kanda ambazo mpangilio wa kanda mbili ungeleta? Je, upitishaji wa Route 53 wenye msingi wa latency ungepunguza au kuongeza jumla ya gharama za uhamishaji? Chini ya masharti gani (kiasi cha trafiki, unyeti wa latency) mpangilio wa kanda mbili ungelipa?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya uchambuzi wa gharama-faida wa kanda nyingi.)*

## Tukio Baada ya Mikopo

Tom alifunga uchambuzi wa mtandao.

Jumla ya athari ya mradi wa uimarishaji wa miezi mitatu:

- EC2 Savings Plans: -$14,200/mwaka
- Sera za mzunguko wa maisha za S3: -$7,800/mwaka
- Uhifadhi (S3 + EBS): -$6,200/mwaka
- Tabaka la hifadhidata: -$5,892/mwaka
- Mtandao: -$1,812/mwaka
- **Jumla: -$35,904/mwaka**

Aliiandika kwenye ubao mweupe katika chumba cha mikutano.

Leo aliitazama. "Elfu thelathini na tano."

"Na chenji," Tom alisema.

"Kwa mwaka."

"Kwa mwaka."

Priya alifanya hesabu. "Hiyo ni $2,992 kwa mwezi tulikuwa tukitumia kwa vitu visivyozalisha thamani."

"Si vyote," Tom alisahihisha. "Baadhi yake vilikuwa vitu ambavyo tulikuwa tukipata thamani kutoka kwake, lakini tukilipa zaidi kwa ajili yake. Savings Plans — tulikuwa tukipata uwezo ule ule wa EC2, kwa bei bora tu."

Maya alisimama kwenye ubao mweupe kwa muda mrefu.

"Tulipoanzisha Nimbus," alisema, "kila dola ilihesabika. Hatukuweza kumudu hata kipengele cha kwanza cha EC2."

"Ndiyo," Tom alisema.

"Na mahali fulani njiani, tuliacha kuangalia dola kwa makini sana."

"Ukuaji hufanya hivyo," Priya alisema. "Mwelekeo unahamia kwenye kujenga, si kuimarisha."

"Vyote viwili vina maana," Maya alisema. "Vyote viwili, daima. Ongeza hii kwenye wiki. Na weka mapitio ya robo kwa gharama."

Tom alikuwa tayari akifungua kalenda yake.

Katika sura chache zinazofuata: tunatazama kutoka mbali zaidi ya huduma za mtu mmoja na kuanza kufikiri kama wasanifu.
