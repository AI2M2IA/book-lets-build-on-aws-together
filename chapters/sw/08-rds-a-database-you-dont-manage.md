# Sura ya 8: Msimamizi wa Hifadhidata Ambaye Hajawahi Kupiga Simu akiwa Mgonjwa

Ilikuwa saa 3 asubuhi wakati tahadhari ilipoingia.

Seva ya hifadhidata ilihitaji kiraka cha usalama - aina ambayo ilihitaji kuanzishwa upya. The
udhaifu ulikuwa wa kweli, kiraka kilipatikana, na dirisha la kuitumia
bila kuvuruga wateja ilikuwa hivi sasa, katikati ya usiku, wakati trafiki
ilikuwa chini.

Priya pekee ndiye aliyekuwa macho. Alitumia kiraka, akaanzisha tena seva, akatazama
magogo hadi ombi liliporudi mtandaoni, na kulala saa 4:15 asubuhi.

Asubuhi aliiambia timu kile kilichotokea. Kukawa kimya.

"Hiyo itatokea tena," Tom alisema.

"Itatokea kila wakati kuna kiraka," Priya alisema. "Na daima kuna
mabaka. Lazima kuwe na njia bora ya kufanya hivyo."

Kulikuwa na. Ilihitaji tu kuachana na wazo ambalo walihitaji kusimamia hifadhidata
wenyewe.

**Tatizo la Hifadhidata ya Jadi**

Unapoendesha hifadhidata mwenyewe kwenye mfano wa EC2, unawajibika kwa kila kitu.

Inasakinisha programu ya hifadhidata. Kuisanidi kwa usalama. Kuiweka wakati wa usalama
udhaifu hugunduliwa. Kuchukua chelezo. Kujaribu kuwa chelezo hufanya kazi kweli
(hatua ambayo timu nyingi huruka hadi kuchelewa). Ufuatiliaji wa nafasi ya diski. Inaweka
replication kwa redundancy. Inasanidi kushindwa kwa seva ya msingi inaposhuka.
Kurekebisha utendaji wa hoja. Kusimamia miunganisho chini ya mzigo.

Hakuna kati ya haya ni maombi. Hakuna inayoongeza vipengele. Yote hayo yanahitaji utaalamu.

Timu nyingi za maendeleo sio wasimamizi wa hifadhidata. Hii inaunda muundo unaotabirika:
hifadhidata imewekwa, imeundwa kidogo, na kisha kusahaulika zaidi hadi kitu
huenda vibaya sana.

"Je, ndivyo tulivyofanya?" Maya aliuliza.

Jibu la Leo lilikuwa kimya, ambalo lilikuwa sawa na ndio.

**Amazon RDS: Hifadhidata Inayosimamiwa**

**Amazon RDS** - Huduma ya Hifadhidata ya Uhusiano - hushughulikia mzigo wa uendeshaji wa kuendesha
hifadhidata ya uhusiano kwa hivyo sio lazima.

Na RDS, AWS inasimamia:

- Kufunga na kuweka viraka injini ya hifadhidata
- Hifadhi nakala za kiotomatiki (zilizohifadhiwa katika S3, zimehifadhiwa hadi siku 35)
- Kushindwa kwa otomatiki (wakati msingi unashuka, hali ya kusubiri inachukua kiotomatiki)
- Ufuatiliaji na vipimo
- Usimbaji fiche wakati wa kupumzika na katika usafiri
- Kuongeza kiotomatiki kwa uhifadhi (ikiwa utaiwezesha, diski inakua inapojaa)

Unasimamia:

- Schema ya hifadhidata (muundo wa meza zako)
- Maswali yako na mantiki ya maombi
- Nani anaweza kufikia hifadhidata
- Ni aina gani ya mfano inayoendesha hifadhidata
- Urekebishaji wa parameta (ingawa RDS hutoa chaguo-msingi za busara)

Mfano: kuajiri msimamizi wa hifadhidata ambaye hachukui siku za ugonjwa, hafanyi kamwe
makosa ya usanidi, huchukua kiotomatiki chelezo za kila siku, na hujirekebisha ikiwa
kitu kinavunjika - lakini ni nani asiyeandika mantiki ya maombi yako.

**Injini Zinazotumika**

RDS inasaidia injini kadhaa maarufu za hifadhidata:

- **MySQL** — hifadhidata ya uhusiano ya chanzo-wazi inayotumiwa zaidi
- **PostgreSQL** — yenye nguvu, inayoweza kupanuka, inazidi kuwa maarufu kwa kazi ngumu
- **MariaDB** - uma wa chanzo-wazi wa MySQL, unaoendana kikamilifu
- **Oracle** — daraja la biashara, linalotumika katika mashirika makubwa yenye mahitaji ya urithi
- **Seva ya SQL ya Microsoft** — kwa mazingira mazito ya Windows
- **Amazon Aurora** - Injini ya AWS inayolingana na MySQL/PostgreSQL, iliyoundwa kwa ajili ya wingu
  (tunazungumzia Aurora kwa kina katika Sura ya 24)

Kwa Nimbus, chaguo lilikuwa PostgreSQL. Ilikuwa kile Leo alijua, na ilishughulikia uhusiano
data vizuri. Chaguo la injini sio muhimu kuliko vile unavyofikiria kwa programu nyingi -
manufaa ya uendeshaji ya RDS yanatumika bila kujali.

**Multi-AZ: Hali ya Kusubiri Inayochukua Nafasi**

Hii ndio kipengele kinachobadilisha calculus ya kuaminika kabisa.

**Utumiaji wa Multi-AZ** inamaanisha RDS hudumisha mfano wa kusubiri unaolandanishwa katika a
Eneo la Upatikanaji tofauti na la msingi. Kila shughuli iliyofanywa kwa msingi
inaigwa kwa usawa katika hali ya kusubiri kabla ahadi haijakubaliwa.

Wakati msingi unashindwa - kushindwa kwa maunzi, kuzimika kwa AZ, ajali ya programu - RDS
inashindwa kiotomatiki kwenye hali ya kusubiri. Rekodi ya DNS ya mwisho wa hifadhidata
imesasishwa. Maombi yako yanaunganishwa tena kwa msingi mpya.

Kushindwa huchukua sekunde 60-120. Wakati wa dirisha hilo, programu yako itapata uzoefu
makosa ya uunganisho. Programu zilizoandikwa vizuri zinapaswa kushughulikia hii kwa uzuri (muunganisho
inajaribu tena na kurudi nyuma).

Hali ya kusubiri si nakala iliyosomwa. Haitumii trafiki ya kusoma. Kusudi lake pekee ni
kuwa tayari kuchukua nafasi.

Tom: "Multi-AZ inagharimu kiasi gani?"

Takriban mara mbili ya gharama ya mfano mmoja - kwa sababu unaendesha mbili
matukio ya hifadhidata. Gharama ya kusubiri ni sawa na ya msingi.

Tom: "Na kukatika bila mpango kunagharimu kiasi gani?"

Alijibu swali lake mwenyewe kwa kufungua historia ya agizo na kukadiria mapato
kwa saa wakati wa kilele chao cha Ijumaa.

Multi-AZ iliwezeshwa mchana huo.

**Hifadhi Nakala Kiotomatiki na Urejeshaji wa Ehakika kwa Wakati**

RDS inachukua chelezo otomatiki kila siku. AWS huhifadhi chelezo hizi katika S3 (inayosimamiwa na
RDS - huzioni moja kwa moja kwenye kiweko chako cha S3). Unaweza kurejesha hifadhidata
hadi wakati wowote ndani ya kipindi chako cha kuhifadhi chelezo.

Hifadhi rudufu hutokea wakati wa **dirisha la matengenezo** linaloweza kusanidiwa - kipindi cha trafiki kidogo,
kawaida asubuhi. Kwa aina nyingi za injini, nakala rudufu hazisababishi wakati wa kupungua.

**Urejeshaji wa uhakika** ni mojawapo ya vipengele muhimu zaidi: unaweza kurejesha
sekunde yoyote ndani ya kipindi chako cha kubaki. Sio tu vijipicha vya kila siku — *sekunde yoyote*.
Hili linawezekana kwa sababu RDS huhifadhi kumbukumbu za miamala kila mara pamoja na
chelezo za kila siku.

Ikiwa mtu fulani ataendesha kwa bahati mbaya `FUTA KUTOKA KWA maagizo WAPI 1=1` saa 2:37pm, unaweza
kurejesha hadi 2:36pm.

Leo alionekana kufurahi alipoelewa hili.

"Je, tunaweza kupata nafuu kutokana na kile nilichofuta mwezi uliopita?" Aliuliza.

"Kabla ya RDS? Hapana," alisema Priya. "Baada ya RDS? Ndiyo."

**Soma Nakala: Kuongeza Trafiki ya Kusoma**

Multi-AZ inahusu upatikanaji. **Soma nakala ** ni kuhusu utendaji.

Nakala iliyosomwa ni nakala isiyosawazisha ya hifadhidata yako ya msingi inayoweza kusomeka
maswali. Unaweza kuwa na hadi nakala tano zilizosomwa kwa injini nyingi za RDS (zaidi kwa Aurora).

Programu inarekebishwa ili kutuma maswali yaliyosomwa kwa nakala na kuandika maswali kwa
ya msingi. Hii inasambaza mzigo: Hushughulikia msingi huandika na ngumu
shughuli; kipini cha nakala kinasoma.

Sifa muhimu:

- Urudufishaji ni **asynchronous** — kunaweza kuwa na ucheleweshaji mdogo (lag) kati ya
  msingi na replica. Ikiwa utaandika rekodi na kusoma mara moja kutoka kwa nakala,
  unaweza usiione bado.
- Nakala zilizosomwa zinaweza kuwa katika Mkoa mmoja au katika Mkoa tofauti (eneo tofauti
  nakala zinaongeza utulivu lakini wezesha usambazaji wa kijiografia).
- Nakala za kusoma zinaweza kukuzwa hadi hifadhidata zinazojitegemea katika hali ya janga.

Kwa Nimbus: utafutaji wa menyu unasomwa. Historia ya agizo inasomwa. Idadi kubwa ya
trafiki ni kusoma trafiki. Kuongeza nakala iliyosomwa na usomaji wa kuelekeza kunapunguza msingi
upakiaji wa hifadhidata kwa kiasi kikubwa.

Tunashughulikia nakala zilizosomwa kwa undani zaidi katika Sura ya 24 tunapojadili Aurora.

**Vikundi vya Vigezo vya RDS na Vikundi vya Chaguo**

Njia mbili za usanidi zinazokuja kwenye mtihani:

**Vikundi vya parameta** dhibiti mipangilio ya injini ya hifadhidata - kama vile miunganisho ya juu zaidi,
saizi ya akiba ya swala, maadili ya kuisha. RDS huunda kikundi cha parameta chaguo-msingi kinachofanya kazi
kwa kesi nyingi. Unaunda vikundi maalum vya vigezo wakati unahitaji kurekebisha mipangilio maalum.

**Vikundi chaguo** huwasha vipengele vya ziada kwa baadhi ya injini - kama vile asili ya Oracle
usimbaji fiche wa mtandao au usimbaji fiche wa data wazi wa Seva ya SQL. Wengi wazi chanzo
uwekaji wa injini hauhitaji vikundi vya chaguo maalum.

Huna haja ya kukariri haya. Jua kuwa zipo kwa ajili ya kubinafsisha hifadhidata
tabia ya injini.

## Nguvu na Mapungufu

**Kwa nini RDS ni bora**:

- Huondoa mzigo wa uendeshaji wa kusimamia programu ya hifadhidata
- Hifadhi nakala za kiotomatiki na urejeshaji wa uhakika kwa wakati
- Multi-AZ kwa kushindwa kiotomatiki na RTO ndogo
- Soma nakala za kuongeza trafiki ya kusoma
- Usimbaji fiche wakati wa kupumzika na katika usafiri uliojengwa ndani
- Injini zote kuu za hifadhidata za uhusiano zinaungwa mkono

**Ambapo RDS ina mipaka**:

- Huwezi kufikia OS ya msingi. Huwezi kusakinisha programu maalum ya kiwango cha OS au
  badilisha mipangilio ya mfumo wa uendeshaji. Ikiwa hifadhidata yako ina mahitaji ambayo huhitaji
  Ufikiaji wa kiwango cha OS, unaweza kuhitaji kuendesha hifadhidata yako ya msingi wa EC2.
- RDS haina seva (isipokuwa - Aurora Serverless ipo, iliyofunikwa ndani
  Sura ya 24). Unalipa kwa mfano wa kukimbia hata ikiwa ni wavivu.
- RDS haijaundwa kwa hifadhidata zilizogawanywa kwa mlalo. Kwa upunguzaji mkubwa
  ya uandishi mzito wa kazi ya uhusiano, unaweza hatimaye kuhitaji usanifu tofauti.
- Kwa mifumo ya data isiyo ya uhusiano (NoSQL), DynamoDB (Sura ya 9) inafaa zaidi.

## Muhtasari

- **Amazon RDS** ni huduma ya hifadhidata inayosimamiwa ya uhusiano. AWS hushughulikia viraka,
  chelezo, kushindwa, na usimamizi wa uhifadhi. Unashughulikia schema, maswali, na
  mantiki ya maombi.
- **Utumiaji wa Multi-AZ** hudumisha hali ya kusubiri inayosawazishwa katika AZ tofauti.
  Kushindwa kiotomatiki hutokea katika sekunde 60-120 ikiwa la msingi litashindwa.
- **Hifadhi nakala kiotomatiki** zilizo na **kuokoa kwa wakati** hukuruhusu kurejesha kwa yoyote
  pili ndani ya muda wa kubaki.
- **Soma nakala** ni nakala zisizolingana ambazo hutumikia trafiki iliyosomwa, ikipunguza
  mzigo kwenye msingi. Kurudi nyuma kunamaanisha kuwa wanaweza kuwa nyuma kidogo.
- Chagua RDS unapohitaji hifadhidata ya uhusiano na shughuli zinazosimamiwa. Tumia Aurora
  (Sura ya 24) unapohitaji utendaji wa juu zaidi au chaguo zisizo na seva.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa cha 3 — Jukumu la 3.3 (suluhisho za hifadhidata)*

- **Multi-AZ ni ya upatikanaji wa juu, si utendakazi.** Hali ya kusubiri haitumiki
  soma trafiki. Nakala zilizosomwa ni za utendaji. Tofauti hii inajaribiwa mara kwa mara.
- **Kushindwa kwa Multi-AZ ni kiotomatiki.** Huwezi kusanidi ni lini au jinsi inavyofanyika.
  RDS hufuatilia msingi na husababisha kushindwa kiotomatiki.
- **Replication bakia mambo.** Soma nakala inaweza kuwa nyuma kidogo ya msingi.
  Ikiwa programu yako inahitaji kusoma data ambayo imeandika hivi punde, lazima isome kutoka kwa
  msingi, sio nakala. Hii inaitwa "uthabiti wa kusoma-yako-kuandika."
- **Hifadhi nakala kiotomatiki huhifadhiwa kwa siku 0-35.** Kuweka uhifadhi kuwa 0
  inalemaza chelezo otomatiki. Vijipicha vya mikono huhifadhiwa kwa muda usiojulikana hadi
  unazifuta.
- **Kuongeza kiotomatiki kwa hifadhi ya RDS** huzuia kukatika kwa diski. Iwashe. Ni mizani tu
  juu, kamwe chini. Mtihani unaweza kupima kama unajua ulinganifu huu.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: ni tofauti gani kati ya Multi-AZ na nakala za kusoma katika RDS?
Kila mmoja anatatua tatizo gani?

*(Kidokezo: Moja hulinda dhidi ya wakati wa kupungua; nyingine huboresha utendaji chini ya ugumu wa kusoma
mzigo. Zinasuluhisha matatizo mbalimbali na zinaweza kutumiwa pamoja.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni inaendesha hifadhidata ya PostgreSQL ya uzalishaji kwenye RDS. Hifadhidata
hupata trafiki iliyosomwa sana kutokana na kuripoti hoja zinazoendelea siku nzima.
Timu pia inajali kuhusu upatikanaji wa hifadhidata - haiwezi kumudu zaidi ya
dakika chache za muda wa mapumziko katika hali ya kutofaulu. Wanataka kupunguza athari kwenye
hifadhidata ya msingi kutoka kwa kuripoti mzigo wa kazi.

Ni mchanganyiko gani wa vipengele vya RDS BORA hushughulikia maswala yote mawili?

A) Washa Multi-AZ na uendeshe hoja zote dhidi ya mfano wa kusubiri  
B) Washa Multi-AZ kwa ajili ya ulinzi wa kushindwa na uunde nakala iliyosomwa ya maswali ya kuripoti  
C) Unda nakala nyingi za kusoma na uzime Multi-AZ ili kupunguza gharama  
D) Chukua snapshots za mwongozo mara kwa mara na urejeshe kutoka kwao ikiwa msingi utashindwa

**Kidokezo cha 1**: Mahitaji mawili ni: (1) upatikanaji wakati wa kushindwa, (2) kupakua
inasoma. Je, ni vipengele gani vinashughulikia mahitaji gani?

**Kidokezo cha 2**: Multi-AZ hutoa kushindwa kiotomatiki. Hali ya kusubiri HAITOI trafiki ya kusoma.
Kwa hivyo Multi-AZ pekee haisaidii na shida ya kusoma.

**Kidokezo cha 3**: Nakala za kusoma zinatoa trafiki iliyosomwa. Multi-AZ hutoa kushindwa. Unahitaji zote mbili.

**Jibu**: B

**Maelezo**: Multi-AZ hutoa kutofaulu kiotomatiki kwa hali ya kusubiri katika AZ tofauti —
hii inashughulikia mahitaji ya upatikanaji. Replica iliyosomwa inaruhusu kuripoti maswali
kuendesha bila kuathiri hifadhidata msingi - hii inashughulikia utendakazi
mahitaji. Vipengele vyote viwili vinaweza kutumika wakati huo huo.

**Kwa nini isiwe A?** Hali ya kusubiri ya Multi-AZ haiwezi kutoa trafiki ya kusoma. Ni kwa ajili ya pekee
kushindwa. Kujaribu kuliuliza moja kwa moja hakutumiki.

**Kwa nini isiwe C?** Soma usaidizi wa nakala za utendakazi wa kusoma lakini usitoe otomatiki
kushindwa. Ikiwa la msingi litashindikana, utahitaji kukuza mwenyewe nakala iliyosomwa -
ambayo inachukua muda na sio moja kwa moja.

**Kwa nini isiwe D?** Vijipicha vya mikono hurejesha nakala kamili ya hifadhidata - kwa muda mrefu zaidi
mchakato (uwezekano wa masaa kwa hifadhidata kubwa). Hii haifikii "dakika chache
mahitaji ya wakati wa kupumzika.

*SAA-C03 Kikoa cha 3 - Kazi 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inazingatia kuhamisha hifadhidata yao iliyopo ya PostgreSQL inayojidhibiti
(inayoendeshwa kwa mfano wa EC2) hadi RDS PostgreSQL. Uhamiaji unahitaji kutokea
na muda mdogo wa kupumzika - chini ya dakika 15. Hifadhidata ni 200 GB.

Je, unapendekeza mbinu gani? Ni huduma gani za AWS zinaweza kusaidia na uhamiaji?
Je, unaweza kupima hatari gani kabla ya kupunguza trafiki ya uzalishaji?

*(Hakuna jibu moja sahihi. Fikiri kuhusu Huduma ya Uhamiaji ya Hifadhidata ya AWS,
urudufishaji wa kimantiki, na hatari ya kutofautiana kwa data wakati wa kukatwa.)*

## Onyesho la Baada ya Mikopo

Kufikia mwisho wa siku, Nimbus alikuwa amehamia RDS PostgreSQL na Multi-AZ imewashwa. The
uhamiaji wenyewe ulichukua muda mwingi wa mchana - Leo alitumia mbinu ya kuhifadhi-na-kurejesha,
na dirisha fupi la matengenezo.

Tom alikuwa ameitazama muswada huo kwa makini.

"Mfano wa RDS," alisema, "hugharimu mara mbili ya ile hifadhidata ya EC2 ilifanya."

"Na chelezo otomatiki?" Maya aliuliza.

"Zaidi kidogo."

"Na failover kwamba tutaweza kupata bure kama msingi akifa?"

Tom hakuwa na bei kwa hiyo. Aliandika kama swali.

Siku tatu baadaye, hifadhidata ilikuwa na afya. Muda wa maswali ulikuwa umepungua kwa kiasi fulani lakini sivyo
kutosha. Menyu bado ilikuwa polepole kupakia. Vitu elfu ishirini na mbili. Ishirini na mbili elfu
safu mlalo katika hoja iliyozirudisha zote, kila wakati.

"Tatizo," Priya alisema, "si injini ya hifadhidata. Ni modeli ya data."

Alinyamaza.

"Baadhi ya data hii haina uhusiano hata kidogo. Bidhaa za menyu, wasifu wa mikahawa,
maeneo ya uwasilishaji - data hii ina maumbo tofauti. SQL inapigana nasi."

Leo tayari alikuwa anatafiti kitu.

"Je, ikiwa tungetumia aina tofauti ya hifadhidata kwa menyu?" Alisema.

Katika sura inayofuata: hifadhidata ambayo haipunguzi kasi, hata watu milioni wanapoagiza mara moja.
