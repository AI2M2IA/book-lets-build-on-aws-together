# Sura ya 18: Wakati Mambo Yanavunjika

Sura hii inahusu kushindwa — iliyopangwa, iliyoundwa dhidi yake, na hatimaye kukubalika kama jambo lisiloweza kuepukika. Inaweza kuwa sura muhimu zaidi katika kitabu hiki.

Nimbus ilikuwa inafanya kazi vizuri. Tabaka za usalama zilikuwa zimewekwa. Ufuatiliaji ulikuwa ukifanya kazi. Msongamano wa trafiki ulikuwa ukiongezeka.

Kisha Leo alipokea arifa ya Slack saa 11:23 usiku wa Alhamisi.

"us-east-1 Availability Zone us-east-1b — kushindwa kwa vifaa — huduma iliyodhoofika."

Alifungua dashibodi ya AWS. Vipengele vya EC2 katika us-east-1b vilikuwa vikionyesha ukaguzi wa hali ukishindwa. Auto Scaling Group yake iligundua vipengele visivyo na afya na ilikuwa ikizindua vipengele vya kubadilisha — katika us-east-1b.

Katika AZ iliyokuwa ikishindwa.

Vipengele vipya havikuweza kuanza pia. Vilikuwa katika eneo moja la kushindwa kwa vifaa.

"Kisambazaji cha mzigo kinaelekeza trafiki kwa AZ zote mbili," Leo alisema bila mtu yeyote. "Nusu ya trafiki yetu inaenda kwa vipengele visivyofanya kazi."

Dakika ishirini na mbili za huduma iliyodhoofika kabla hajaona na kuhamisha ASG kwa mkono ili itumie us-east-1a tu.

"Hii ilitokea kwa sababu kila kitu kilikuwa katika AZ moja," Priya alisema asubuhi iliyofuata.

"Hapana," Leo alisema. "Nilikuwa na vipengele katika AZ mbili. Tatizo lilikuwa vipengele vya kubadilisha vilikuwa vikizuka katika AZ inayoshindwa."

"Na hifadhidata?"

Leo alisimama.

"Kipengele cha RDS ni Multi-AZ," alisema. "Nakala ya hifadhi iko katika us-east-1b. Ambayo ilikuwa ikishindwa. Na RDS ilijaribu kuhama kwa nakala ya hifadhi, ambayo pia ilishindwa."

Dakika ishirini na mbili za huduma iliyodhoofika zilikuwa zimewa thelathini na nane.

**Mfano wa Gridi ya Umeme**

Fikiria jinsi nyumba yako inavyopata umeme. Umeme hauja kutoka kwa waya moja unaotoka kwa jenereta moja. Unakuja kutoka kwa gridi — mtandao wa jenereta, vituo vya umeme, na mistari ya usambazaji inayohifadhi mara kwa mara. Ikiwa kituo kimoja cha umeme kitachomeka moto, vingine vinaelekeza umeme karibu nacho. Hujui. Taa zinabaki kuwaka.

Availability Zones za AWS zinafanya kazi kwa njia ile ile. Badala ya kituo kimoja kikubwa cha data ambacho kila kitu kinategemea, AWS inasambaza rasilimali zako katika vituo vingi vilivyotengwa kimwili. Ikiwa kituo kimoja kitapoteza nguvu au kukuwa na kushindwa kwa vifaa, vingine vinaendelea kufanya kazi. Trafiki inabadilishwa moja kwa moja. Programu yako inabaki hai — kwa sababu hakukuwa na waya mmoja wa kukata.

Multi-Region ni kiwango kinachofuata: fikiria kuwa na jenereta za hifadhi katika mji tofauti kabisa. Ikiwa gridi yote ya umeme ya eneo lako itashuka, mji wa mbali utachukua. Ngumu zaidi kusanidi, lakini imara zaidi kwa kushindwa kwa maafa.

**Msamiati wa Kushindwa**

Kabla ya kubuni kwa ajili ya ustahimilivu, unahitaji maneno kwa ajili ya kile unachoundwa dhidi yake.

**Upatikanaji (Availability)**: Asilimia ya wakati mfumo unafanya kazi. "Nne tisa" (99.99%) inamaanisha chini ya dakika 52 za kutofanya kazi kwa mwaka. "Tano tisa" (99.999%) inamaanisha karibu dakika 5 kwa mwaka.

**RTO (Recovery Time Objective)**: Mfumo unaweza kushuka kwa muda gani kabla kuwa tatizo la biashara? Ikiwa RTO yako ni masaa 4, una masaa 4 ya kurejesha huduma kabla SLA hazijavezesha.

**RPO (Recovery Point Objective)**: Unaweza kupoteza data ngapi? Ikiwa RPO yako ni saa 1, unaweza kustahimili kupoteza data ya hadi saa moja katika kushindwa kwa maafa. Kila kitu kilichoandikwa katika saa moja ya mwisho kabla ya kushindwa kimepotea.

**Uvumilivu wa hitilafu (Fault tolerance)**: Uwezo wa kuendelea kufanya kazi (kwa kiwango fulani) wakati kipengele kinashindwa.

**Uokoaji wa maafa (Disaster recovery - DR)**: Mchakato wa kurejesha kutoka kwa kushindwa kwa maafa — moto wa kituo cha data, kukatika kwa mkoa mzima, kufuta kwa bahati mbaya kwa wingi.

Dhana hizi tano zinaongoza kila uamuzi wa muundo katika sura hii.

**Multi-AZ: Kuishi kwa Kushindwa kwa Availability Zone**

Availability Zone (AZ) ni kituo cha data kilichotengwa kimwili ndani ya Mkoa. AZ zimeboreshwa kuwa huru: vyanzo tofauti vya nguvu, baridi tofauti, miundombinu tofauti ya mtandao. Lakini ziko karibu vya kutosha kwamba latency ya mtandao kati yao ni millisekunde 1-2.

**Usambazaji wa Multi-AZ** unasambaza rasilimali zako katika AZ mbili au zaidi ndani ya Mkoa. Ikiwa AZ moja itashindwa:

- Kisambazaji cha mzigo kinaacha kuelekeza trafiki kwa vipengele visivyo na afya katika AZ iliyoshindwa
- Auto Scaling Group inabadilisha vipengele — lakini katika AZ *yenye afya*
- RDS inashindwa hama kwa nakala ya hifadhi katika AZ yenye afya

Kosa la Leo: Auto Scaling Group yake haikusanidiwa ili izuie vipengele vya kubadilisha kuwa katika AZ zenye afya. Ilisanidiwa kudumisha usawa kati ya AZ. Wakati us-east-1b ilishindwa, ASG ilijaribu kusawazisha idadi ya vipengele kwa kuzindua vipengele vya kubadilisha katika us-east-1b — AZ inayoshindwa.

Marekebisho: sanidi ASG ili izindue tu katika AZ zenye afya, na kiwango cha chini cha AZ mbili zinazofanya kazi wakati wote.

Somo la kina zaidi: kujaribu hali zako za kushindwa kabla hazijatokea katika uzalishaji.

**Kuiga Kushindwa: Uhandisi wa Machafuko**

"Tunajuaje kwamba usanidi wetu wa Multi-AZ unafanya kazi kweli?" Maya aliuliza.

"Tunavunja mambo kwa makusudi," Leo alisema.

Hii inasikika kama upuuzi. Ni jambo la uwajibikaji zaidi ambalo timu inaweza kufanya.

**Uhandisi wa machafuko (Chaos engineering)** ni mazoea ya kuingiza makusudi kushindwa katika mfumo wako ili kuthibitisha kwamba unashughulikia ipasavyo. Unakomesha kwa makusudi kipengele cha EC2. Unashindwa hama kwa mkono kipengele cha RDS. Unazuia subnet kutoka kwa kisambazaji cha mzigo.

Ikiwa mfumo utarejea kiotomatiki ndani ya RTO yako, muundo wako unafanya kazi.

Ikiwa hautarejea, umejifunza hilo katika mazingira ya kudhibitiwa — si wakati wa tukio la uzalishaji saa 2 usiku.

Kwa Nimbus: Leo aliandika kitabu cha maelekezo (utaratibu ulioandikwa) wa kujaribu kila hali ya kushindwa. Mara moja kwa robo mwaka, wangevunja kwa makusudi kipengele kimoja na kupima muda wa uokoaji. Ikiwa uokoaji ulichukua muda mrefu zaidi ya RTO, wangeboresha muundo.

**Multi-Region: Kuishi kwa Kushindwa kwa Mkoa**

Kushindwa kwingi kwa AWS kunaathiri Availability Zones, si Mikoa mzima. Kushindwa kwa mkoa ni nadra — lakini kunafanyika.

Katika kushindwa kwa mkoa (au kwa programu za kimataifa zinazohitaji latency ya chini sana kila mahali), **Multi-Region** ndiyo jibu: sambaza programu yako katika Mikoa miwili au zaidi ya AWS.

Multi-Region inaanzisha ugumu wa kimsingi:

**Upokezaji wa data**: Hifadhidata zako zinahitaji kuwa sawa katika mikoa. Data yoyote iliyoandikwa katika us-east-1 lazima hatimaye ifike eu-west-1. "Hatimaye" ni tatizo — wakati wa kuchelewa, mikoa ina mtazamo tofauti kidogo wa ulimwengu.

**Active-passive dhidi ya active-active**:

- **Active-passive**: Mkoa mmoja unahudumia trafiki yote. Mwingine ni nakala ya hifadhi ya joto. Wakati wa kushindwa, DNS inabadilisha trafiki kwa nakala ya hifadhi. Rahisi zaidi, lakini nakala ya hifadhi iko bila kufanya kazi na ni ghali.
- **Active-active**: Mikoa yote miwili inahudumia trafiki wakati mmoja. Ngumu zaidi kujenga (inahitaji utatuzi wa migogoro kwa maandishi ya wakati mmoja), lakini latency ya chini kimataifa na hakuna rasilimali zisizofanya kazi.

**Muda wa kushindwa hama**: Mabadiliko ya DNS huchukua muda kusambazwa (kulingana na TTL). Wakati wa dirisha la usambazaji, baadhi ya watumiaji bado wanafikia mkoa ulioshindwa. Kubuni kwa RTO ya chini sana kunahitaji kupasha joto mapema nakala ya hifadhi na kupunguza TTL kabla ya kubadilisha zilizopangwa.

**Mikakati ya Uokoaji wa Maafa: Wigo**

Kuna mikakati minne ya kawaida ya DR, iliyopangwa kutoka ya bei ndogo zaidi (na polepole zaidi kurejesha) hadi ya bei ghali zaidi (na ya haraka zaidi kurejesha):

**Hifadhi na Urejesho (Backup and Restore)** (RPO/RTO ya masaa):

- Hifadhi kila kitu kwa S3 katika mkoa tofauti
- Wakati wa maafa: andaa miundombinu kutoka mwanzo, rejesha kutoka kwa hifadhi
- Gharama: ndogo sana (unalipa tu kwa uhifadhi)
- Muda wa uokoaji: masaa

**Mwanga wa Rubani (Pilot Light)** (RPO/RTO ya dakika hadi saa 1):

- Weka toleo dogo la programu likifanya kazi katika mkoa wa DR (the "mwanga wa rubani" unaoweza kuwashwa haraka)
- Data kuu inasambazwa (nakala ya kusomwa ya RDS katika mkoa wa DR)
- Wakati wa maafa: pangeza mkoa wa DR, saidia nakala ya kusomwa kuwa ya msingi, badilisha DNS
- Gharama: wastani (unalipa kwa alama ndogo inayofanya kazi)
- Muda wa uokoaji: dakika kadhaa hadi thelathini

**Nakala ya Hifadhi ya Joto (Warm Standby)** (RPO/RTO ya sekunde hadi dakika):

- Endesha toleo lililopunguzwa la programu kamili katika mkoa wa DR
- Inafanya kazi kikamilifu lakini kwa uwezo uliopunguzwa
- Wakati wa maafa: pangeza, badilisha DNS
- Gharama: ya juu zaidi (daima unaendesha mrundiko kamili kwa kiwango kilichopunguzwa)
- Muda wa uokoaji: dakika

**Active-Active / Maeneo Mengi (Multi-Site)** (RPO/RTO karibu-sifuri):

- Uwezo kamili katika mikoa miwili au zaidi, ukihudumia trafiki wakati mmoja
- Hakuna uokoaji unaohitajika — ikiwa mkoa mmoja utashindwa, trafiki inabadilishwa kwa mwingine kiotomatiki
- Gharama: ya juu zaidi (usambazaji wawili kamili kwa kiwango kamili)
- Muda wa uokoaji: sekunde (usambazaji wa DNS tu)

Kwa Nimbus katika hatua hii: nakala ya hifadhi ya joto. Hawangeweza kumudu active-active, lakini hifadhi na urejesho ulikuwa polepole sana kwa mahitaji yao ya biashara.

**Amazon RDS: Multi-AZ dhidi ya Nakala za Kusomwa dhidi ya Multi-Region**

Hizi tatu ni tofauti na mara nyingi zinachanganywa:

| Kipengele     | Multi-AZ                     | Nakala ya Kusomwa | Nakala ya Kusomwa ya Multi-Region |
|---------------|------------------------------|------------------|---------------------------|
| Madhumuni     | Upatikanaji wa juu (kushindwa hama) | Kupanua kusoma | Kupanua kusoma + DR       |
| Usawazishaji wa data | Wakati mmoja          | Kwa ucheleweshaji | Kwa ucheleweshaji         |
| Kushindwa hama | Kiotomatiki                | Saidizi kwa mkono | Saidizi kwa mkono         |
| Inaweza kusomwa? | Hapana (nakala ya hifadhi ni ya hiari) | Ndiyo        | Ndiyo                     |
| Toka mkoa hadi mkoa? | Hapana (mkoa sawa)   | Ndiyo (hiari)  | Ndiyo                     |
| Tumia kwa    | HA, RPO~0                    | Mzigo wa kusoma  | Uokoaji wa maafa          |

Maarifa muhimu: Nakala ya hifadhi ya Multi-AZ ni **ya wakati mmoja** — kila andishi kwenye msingi linathibitishwa kwenye nakala ya hifadhi kabla andishi halijathibitishwa. Hii inamaanisha ikiwa msingi utashindwa, hakuna data iliyopotea. RPO = 0.

Nakala za kusomwa ni **za ucheleweshaji** — kuna ucheleweshaji wa upokezaji. Ikiwa msingi utashindwa na ukasaidia nakala ya kusomwa, unaweza kupoteza sekunde au dakika za maandishi ya hivi karibuni. RPO > 0.

## Nguvu na Mipaka

**Multi-AZ**:

- Muhimu kwa mzigo wa uzalishaji — AZ moja ni hatua moja ya kushindwa
- Inasaidiwa vizuri na huduma za AWS (RDS, ElastiCache, EKS, ALB zote zinasaidia Multi-AZ)
- Gharama ndogo ya ziada ikilinganishwa na ulinzi unaotoa

**Multi-Region**:

- Ngumu kutekeleza ipasavyo, hasa kwa hifadhidata
- Mahitaji ya makazi ya data/uhuru wa data yanaweza kuihitaji kweli (data ya watumiaji wa EU lazima ibaki EU)
- Faida za latency kwa watumiaji wa kimataifa zinatoka kwa upitishaji, si kwa multi-region yenyewe (tumia CloudFront kwa maudhui ya kudumu)
- Mashirika mengi hayahitaji active-active; wengi hawafanyi uwekezaji wa kutosha katika nakala ya hifadhi ya joto

## Muhtasari

- **RTO** (Recovery Time Objective): muda unaoeza kushuka. **RPO** (Recovery Point Objective): kiasi cha data unachoweza kupoteza.
- **Multi-AZ** inasambaza rasilimali katika Availability Zones ndani ya Mkoa. Inalinda dhidi ya kushindwa kwa AZ.
- **Multi-Region** inapeleka katika Mikoa mingi ya AWS. Inalinda dhidi ya kushindwa kwa mkoa na kuhudumiwa watumiaji wa kimataifa kwa latency ya chini.
- Mikakati ya DR (bei ndogo hadi ghali zaidi): Hifadhi na Urejesho → Mwanga wa Rubani → Nakala ya Hifadhi ya Joto → Active-Active.
- Nakala ya hifadhi ya RDS Multi-AZ: wakati mmoja, kushindwa hama kiotomatiki, RPO = 0. Nakala za kusomwa: ucheleweshaji, saidizi kwa mkono, RPO > 0.
- Jaribu kushindwa kwako kwa makusudi (uhandisi wa machafuko) kabla haijatokea katika uzalishaji.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.2)*

- **RTO dhidi ya RPO**: Tarajia mtihani kukupa mahitaji ("shirika haliwezi kuvumilia zaidi ya saa 1 ya kutofanya kazi na kupoteza data hakuna") na kukuuliza uchague mkakati sahihi wa DR. Ramani: hakuna upotezaji wa data = upokezaji wa wakati mmoja = Multi-AZ au active-active. Saa 1 ya kutofanya kazi = hifadhi-na-urejesho ni polepole sana; nakala ya hifadhi ya joto inaweza kufanya kazi.
- **RDS Multi-AZ dhidi ya Nakala za Kusomwa**: Mtihani utauliza HA (Multi-AZ) dhidi ya kupanua kusoma (nakala za kusomwa). Nakala ya hifadhi ya Multi-AZ haiwezi kusomwa. Nakala za kusomwa zinaweza kusaidiwa kuwa msingi (kwa mkono) kwa DR.
- **Mwanga wa Rubani dhidi ya Nakala ya Hifadhi ya Joto**: Mwanga wa Rubani una miundombinu ndogo inayofanya kazi (tu upokezaji wa data). Nakala ya Hifadhi ya Joto ina programu iliyopunguzwa lakini inayofanya kazi. Tofauti ni jinsi haraka unavyoweza kupanua.
- **Aurora Global Database**: Kipengele mahususi cha Aurora kwa active-passive ya multi-region. Mkoa wa msingi unahudumia maandishi; mikoa ya sekondari inahudumia masomo yenye ucheleweshaji wa upokezaji wa chini ya sekunde 1. Wakati wa kushindwa hama, sekondari inaweza kusaidiwa kwa chini ya dakika 1. Ishara ya mtihani: "Aurora, multi-region, RTO < dakika 1."
- **AWS Backup**: Huduma ya hifadhi kuu kwa EBS, RDS, DynamoDB, EFS, Storage Gateway. Mtihani unatumia hii kwa hali za hifadhi-na-urejesho.
- **Kushindwa hama kwa Route 53**: Tabaka la DNS la DR. Ukaguzi wa afya ya msingi unashindwa → Route 53 inaelekeza kwa sekondari. Muda wa usambazaji unamaanisha hii si wa papo hapo.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya RTO na RPO. Kwa nini shirika linaweza kuwa na RTO ya chini (haliwezi kushuka kwa muda mrefu) lakini RPO ya juu (linaweza kustahimili kupoteza data ya hivi karibuni)?

*(Kidokezo: Fikiria biashara ambapo ni muhimu zaidi kuhudumia wateja haraka kuliko kuhifadhi kila muamala.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ya huduma za afya inaendesha mfumo wa rekodi za wagonjwa kwenye RDS PostgreSQL katika `us-east-1`. Mahitaji ya kisheria yanaagiza kwamba data ya mgonjwa haiwezi kupotea kamwe (RPO = 0). Mfumo unaweza kustahimili kutofanya kazi hadi dakika 30 (RTO = dakika 30) katika maafa. Gharama ni wasiwasi.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) RDS Multi-AZ katika `us-east-1` na nakala za uhifadhi za kila siku kwa S3 katika `us-west-2`  
B) RDS Multi-AZ katika `us-east-1` na nakala ya kusomwa katika `us-west-2` iliyosanidiwa kwa saidizi kwa mkono  
C) RDS katika `us-east-1` na nakala ya hifadhi ya joto katika `us-west-2` na upokezaji wa active-active  
D) Aurora Global Database na msingi katika `us-east-1` na sekondari katika `us-west-2`

**Kidokezo cha 1**: RPO = 0 inamaanisha hakuna upotezaji wa data, ambayo inahitaji upokezaji wa wakati mmoja au karibu-wakati mmoja.

**Kidokezo cha 2**: RTO = dakika 30 inamaanisha una muda wa uingiliaji wa mkono. Huhitaji kushindwa hama kiotomatiki kwa millisekunde.

**Kidokezo cha 3**: Chaguo gani linatoa ulinzi wa Multi-AZ (RPO = 0 ndani ya mkoa) pamoja na uwezo wa DR wa toka mkoa hadi mkoa?

**Jibu**: A

**Maelezo**: RDS Multi-AZ katika us-east-1 inatoa upokezaji wa wakati mmoja kwa nakala ya hifadhi katika mkoa sawa — RPO = 0 kwa kushindwa kwa AZ. Nakala za uhifadhi za kila siku kwa S3 katika us-west-2 zinatoa DR ya toka mkoa hadi mkoa. Katika kushindwa kwa mkoa kamili, unarudisha kutoka kwa nakala ya hifadhi ya S3 katika us-west-2 — ndani ya dakika 30 kwa hifadhidata ndogo. Hii ni ya bei nafuu na inakidhi mahitaji yote mawili.

**Kwa nini si B?** Nakala za kusomwa ni za ucheleweshaji — kunaweza kuwa na ucheleweshaji wa upokezaji. Ikiwa msingi utashindwa, data iliyoandikwa tangu usawazishaji wa mwisho wa nakala umepotea. RPO > 0, ambayo inakiuka mahitaji.

**Kwa nini si C?** "Upokezaji wa active-active" kwa PostgreSQL katika mikoa ni mgumu kutekeleza na si kipengele cha kawaida cha RDS. Chaguo hili ni ngumu kiufundi na ni ghali.

**Kwa nini si D?** Aurora Global Database ingefanya kazi lakini ni ghali zaidi sana kuliko RDS Multi-AZ. Hali inasema gharama ni wasiwasi, na Aurora ni bei ya premium.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus imechaguliwa kutoa huduma za ununuzi kwa tamasha kubwa la chakula huko Seattle. Kwa masaa 72, wanatarajia msongamano wa mara 50 wa trafiki yao ya kawaida, bila kuvumiliana na kutofanya kazi (mkataba wa mpangaji wa tamasha unabainisha faini za kifedha kwa kutofanya kazi wowote wakati wa tukio).

Buni mkakati wa DR kwa dirisha la tamasha hasa. Je, ungebadilisha hadi active-active kwa masaa hayo 72? Ungejaribu awali jinsi gani kushindwa hama? RTO yako ingekuwa nini, na ungehakikisha vipi kabla ya tukio?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni DR kwa mahitaji mahususi ya SLA.)*

## Tukio Baada ya Mikopo

Leo alijenga kitabu cha maelekezo cha uhandisi wa machafuko.

Kila robo mwaka, kwenye dirisha la matengenezo ya kupangwa, timu ingeweza:

1. Komesha kipengele kimoja cha EC2 katika us-east-1a na kutazama ASG ikiibadilisha ipasavyo
2. Kulazimisha kwa mkono kushindwa hama kwa RDS Multi-AZ na kuthibitisha programu imeungana tena ndani ya sekunde 60
3. Kuiga kushindwa kamili kwa us-east-1b kwa kurekebisha availability zones za ASG
4. Kurejesha hifadhi ya wiki moja iliyopita kwa kipengele kipya cha RDS na kuthibitisha data inaonekana sahihi

Mara ya kwanza walipotekeleza, hatua ya 2 ilichukua dakika 4 na sekunde 17.

"Ahadi yetu ya RTO kwa washirika wa mgahawa ni dakika 5," Tom alisema.

"Kwa hivyo tulipita. Kwa shida."

"Ingekuwa nini ikiwa kushindwa hama kulichukua muda mrefu zaidi ya dakika 5 katika tukio halisi?"

Maya alijibu: "Tungekuwa tumekiuka SLA. Kuna faini ya kifedha katika mikataba."

Leo alitazama 4:17 kwenye skrini.

"Basi tunahitaji kuifanya haraka zaidi," alisema. Na alianza kusoma hati kwa Aurora.

Katika sura inayofuata: mashine ya tikiti inayoruhusu kila sehemu ya Nimbus kufanya kazi kwa kasi yake mwenyewe.
