# Sura ya 4: Kompyuta katika Jengo la Mtu Mwingine

Programu ya Nimbus ilikuwa inaendeshwa kwenye kompyuta ndogo ya Tom.

Hiyo ilikuwa sawa kwa kuonyesha wawekezaji onyesho. Haikuwa sawa wakati Maya alipobonyeza "uzinduzi"
na mikahawa 200 ilisajiliwa katika wiki ya kwanza. Laptop ya Tom sasa ilikuwa inashughulikia kweli
maagizo, menyu halisi, na wateja halisi - kukaa chini ya dawati la Tom, kukimbia
Wi-Fi ya ofisi, iliyochomekwa kwenye kamba ya umeme ambayo pia inawasha hita ya angani na a
mtengenezaji wa kahawa.

"Tunahitaji seva," Maya alisema. "Mpenzi halisi. Kukimbia mahali ambapo si chini yako
dawati."

Tom akatazama laptop yake. Kipepeo kilisikika kutoka kote chumbani.

Hapo ndipo walipoanza kuangalia maana ya kukodisha kompyuta.

**Ufupi Hakuna Anayeeleza**

Watu wanaposema maombi yao "yanaendeshwa kwenye wingu," kwa kawaida wanamaanisha kuwa yanaendeshwa kwa a
mashine pepe - kompyuta ambayo haipo kama vifaa maalum,
lakini hiyo inatenda kwa kila njia kama inavyofanya.

Huu hapa utaratibu.

Seva ya kimwili katika kituo cha data cha AWS ina rasilimali nyingi: Cores za CPU, kumbukumbu, diski,
na bandwidth ya mtandao. AWS inachukua seva hiyo ya mwili na kuigawanya kwa kutumia programu
inayoitwa **hypervisor**. Hypervisor huunda mashine nyingi za kawaida, kila moja
inaonekana kuwa na CPU, kumbukumbu, na diski yake iliyojitolea - lakini kwa kweli inashiriki
vifaa vya msingi vya kimwili.

Kila moja ya mashine hizo pepe ndio AWS inaita mfano **EC2**.

EC2 inasimama kwa Elastic Compute Cloud. Sehemu ya "elastic" ni muhimu, na tutapata
kwake. Kwa sasa: mfano wa EC2 ni kompyuta unayokodisha kwa saa. Ina uendeshaji
mfumo, muunganisho wa mtandao, na nguvu ya kompyuta. Inaendesha programu yako kama tu
seva ya kimwili ingeweza.

Mfano: kukodisha ghorofa katika jengo kubwa dhidi ya kununua nyumba.

Mmiliki wa jengo (AWS) hudumisha muundo wa kimwili, mabomba, umeme,
usalama. Unapata kitengo. Unaipatia upendavyo. Unalipa kila mwezi (au
kwa saa). Unapohitaji nafasi zaidi, unahamia kitengo kikubwa. Unapohama, wewe
kuacha kulipa.

**Kuchagua Mfano Wako: Mambo ya Ukubwa**

Sio matukio yote ya EC2 ni sawa. AWS inatoa mamia ya aina za mifano, zilizopangwa
katika familia kulingana na kile wameimarishwa.

**Madhumuni ya jumla** (k.m., `t3`, `m6i`): CPU na kumbukumbu iliyosawazishwa. Chaguo nzuri ya chaguo-msingi
kwa programu nyingi za wavuti.

**Kokotoa iliyoboreshwa** (k.m., `c7g`): CPU zaidi inayohusiana na kumbukumbu. Nzuri kwa video
usimbaji, uundaji wa kisayansi, usindikaji wa kundi.

**Kumbukumbu imeboreshwa** (k.m., `r7i`): Kumbukumbu zaidi inayohusiana na CPU. Nzuri kwa hifadhidata,
akiba, uchanganuzi wa kumbukumbu.

**Hifadhi imeboreshwa** (k.m., `i3`): Hifadhi ya ndani ya kasi ya juu. Nzuri kwa kutumia data nyingi
mzigo wa kazi ambao unahitaji diski ya haraka sana I/O.

**Kompyuta iliyoharakishwa** (k.m., `p4`): GPU zimeambatishwa. Nzuri kwa kujifunza mashine
mafunzo na utoaji wa michoro.

Kila familia ina ukubwa. `t3.micro` ina CPU 2 pepe na GB 1 ya kumbukumbu. A
`t3.xlarge` ina CPU 4 pepe na GB 16. Unachagua saizi inayofaa kwa mzigo wa kazi.

Leo alikuwa amechagua `t3.micro`.

"Je, `t3.micro` inaweza kushughulikia watumiaji wangapi?" Tom aliuliza.

"Inategemea na maombi," Leo alisema. "Lakini labda sio watumiaji mia moja
kuendesha upakiaji wa picha na maswali ya hifadhidata."

Tom aliandika "t3.micro" kwenye ubao mweupe na kuchora uso wa huzuni karibu nao.

**AMI: Hali ya Kuanzia kwa Mashine yako**

Kabla ya kuzindua mfano wa EC2, unachagua mfumo wake wa uendeshaji na wa awali
usanidi. Katika AWS, hii inaitwa **Picha ya Mashine ya Amazon** (AMI).

AMI ni kiolezo. Inafafanua:

- Mfumo wa uendeshaji (Amazon Linux, Ubuntu, Windows Server, nk)
- Programu iliyosakinishwa mapema
- Hali ya awali ya diski

Unapozindua mfano kutoka kwa AMI, AWS huunda nakala mpya ya kiolezo hicho
kwa ajili yako tu. Unaweza pia kuunda AMI zako mwenyewe - ikiwa utasanidi seva haswa
jinsi unavyoitaka, unaweza "kuhifadhi" hali hiyo kama AMI maalum na uitumie kuzindua
seva zinazofanana haraka. Hivi ndivyo unavyotumia mazingira thabiti kwa kiwango.

Fikiria AMI kama kichocheo. Kichocheo kinaelezea chakula. Kila wakati unafuata
mapishi, unapata chakula sawa. Ikiwa unataka kubadilisha chakula kabisa, unasasisha
mapishi.

**Jozi Muhimu: Njia Sahihi ya Kufikia Seva**

Je, unakumbuka maafa ya "Admin123" kutoka sura iliyopita?

Njia sahihi ya kuingia kwenye mfano wa EC2 ni kwa ** jozi muhimu **.

Jozi muhimu ni jozi ya kriptografia: ufunguo wa umma (uliohifadhiwa na AWS kwenye seva) na a
ufunguo wa faragha (faili unayopakua na kuweka siri). Ili kuingia, unatumia SSH - salama
itifaki - kwa ufunguo wako wa kibinafsi. Hakuna nenosiri. Ukipoteza ufunguo wa faragha,
unapoteza ufikiaji. Hakuna "nimesahau nenosiri langu" la SSH.

Hii ni muhimu kwa sababu jozi kuu ni:

- Kipekee kwako
- Cryptographically haiwezekani nadhani
- Haijahifadhiwa na AWS (unaweka ufunguo wa kibinafsi)
- Rahisi kubatilisha (futa ufunguo kutoka kwa seva, toa jozi mpya)

Priya alikuwa tayari ameweka ufikiaji wa ufunguo kwenye seva ya Nimbus. Seva ya Admin123
ilikatishwa kazi. Hakuna mtu aliyekuwa na huzuni kuhusu hilo.

**Mzunguko wa Maisha ya Mfano: Sio Milele**

Hili ni jambo ambalo wanaoanza wengi hukosa.

Matukio ya EC2 si ya kudumu kwa chaguomsingi. Unaposimamisha mfano, hesabu
rasilimali hutolewa. Unapoianzisha tena, inaweza kukimbia kwa njia tofauti za mwili
vifaa. Data yoyote iliyohifadhiwa *kwenye mfano yenyewe* (kwenye ujazo wake wa mizizi) husalia
mzunguko wa kuacha/kuanza - lakini anwani ya IP ya umma inabadilika.

*Unapositisha* tukio, litaisha. Isipokuwa una hifadhi tofauti iliyoambatishwa
(ambayo tunashughulikia katika Sura ya 6), data yoyote juu ya mfano hupotea.

"Ephemerality" hii kwa kweli ni kipengele, sio mdudu. Ina maana unaweza kusokota
seva, zitumie, na uzitupe. Inawezesha kuongeza mlalo. Lakini pia
inamaanisha haupaswi kamwe kuhifadhi data muhimu *kwenye* mfano wa EC2 yenyewe.

Data inaishi wapi, basi?

Katika hifadhi tofauti. Tunapata hilo katika sura mbili zinazofuata.

**Nini "Elastic" Maana yake**

Tulisema EC2 inasimama kwa Elastic Compute Cloud. Ni nini elastic juu yake?

Mambo mawili:

**Unyumbufu wima**: Unaweza kubadilisha ukubwa wa mfano. Acha mfano,
ibadilishe kutoka `t3.micro` hadi `t3.xlarge`, iwashe upya. CPU zaidi na kumbukumbu, sawa
maombi, usanidi sawa.

**Elastiki mlalo**: Unaweza kuongeza matukio zaidi. Badala ya seva moja kubwa,
endesha seva kumi za kati nyuma ya kusawazisha mzigo. Wakati trafiki inapungua, ondoa matukio
na kuacha kuwalipa.

Njia zote mbili hutatua shida ya "seva moja, trafiki nyingi". Wana tofauti
maamuzi ya uwiano, ambayo tunachunguza katika Sura ya 7 tunapoongeza Kuongeza Kiotomatiki kwenye hadithi.

Maarifa muhimu: kwa EC2, nguvu ya kompyuta ni kitu ambacho *unapiga* badala ya kitu
wewe *unanunua*. Unahitaji zaidi? Fungua piga. Unahitaji kidogo? Ipunguze. Lipa ipasavyo.

## Nguvu na Mapungufu

**Kwa nini EC2 ina nguvu**:

- Udhibiti kamili. Unachagua OS, programu, usanidi. Ni kompyuta yako.
- Flexible sizing. Mamia ya aina za mifano katika kila kesi ya matumizi.
- Hakuna maunzi ya kudhibiti. AWS inashughulikia safu ya mwili.
- Malipo ya malipo ya kila sekunde (kwa aina nyingi za mfano). Unaacha mfano, unaacha kulipa.
- Inafanya kazi na kila kitu. EC2 ndio msingi ambao huduma zingine nyingi za AWS zimejengwa juu yake.

**Ambapo inakuwa ngumu **:

- Una jukumu la kuweka na kusasisha mfumo wa uendeshaji. (Wajibu wa Pamoja
  Mfano - hii ni sehemu ya "katika wingu" ambayo ni yako.)
- Kusimamia EC2 kwa kiwango kunamaanisha kudhibiti hali ya mfano, AMIs, viraka vya usalama, na
  mzunguko wa maisha katika maelfu ya mashine. Hiyo ni uendeshaji wa uendeshaji.
- EC2 sio jibu sahihi kwa kila kitu. Kwa msimbo unaoendeshwa na tukio unaoendeshwa
  mara kwa mara, Lambda (Sura ya 20) ni ya bei nafuu na rahisi zaidi. Kwa chombo
  mzigo wa kazi, ECS na EKS (Sura ya 21) hutoa ufanisi bora wa rasilimali.
- Matukio ambayo hayajatumiwa bado yanagharimu pesa. Ukisimamisha mfano, unaacha kulipia
  compute - lakini ikiwa una hifadhi iliyoambatishwa, bado unalipia hiyo.

## Muhtasari

- Mfano wa **EC2** ni mashine pepe unayokodisha katika AWS. Ina OS, mtandao
  upatikanaji, na kukokotoa rasilimali.
- Aina za matukio zimepangwa kwa kesi ya matumizi: madhumuni ya jumla, hesabu iliyoboreshwa,
  kumbukumbu iliyoboreshwa, uhifadhi umeboreshwa, kompyuta iliyoharakishwa. Chagua familia inayofaa
  na saizi ya mzigo wako wa kazi.
- **AMI** (Picha ya Mashine ya Amazon) ndio kiolezo cha OS na mfano wako
  usanidi wa awali. AMI maalum huwezesha utumaji thabiti, unaoweza kurudiwa.
- **Jozi muhimu** ndio njia salama ya kufikia matukio ya EC2. Hakuna manenosiri.
- Matukio ya EC2 si ya kudumu kwa chaguomsingi. Matukio yaliyokatishwa hupoteza data yao.
  Hifadhi data muhimu katika huduma tofauti za kuhifadhi.
- "Elastiki" inamaanisha unaweza kukokotoa juu na chini - zote mbili kwa wima (matukio makubwa zaidi)
  na kwa usawa (matukio zaidi).

## Vidokezo vya Mitihani

*SAA-C03 Kikoa cha 3 — Jukumu la 3.2 (suluhu za kompyuta zenye utendakazi wa hali ya juu)*

- **Wajibu wa Pamoja wa EC2**: Una jukumu la kuweka viraka Mfumo wa Uendeshaji.
  AWS hudumisha vifaa vya kimwili na hypervisor. Hii ni majaribio ya mara kwa mara
  tofauti.
- **Familia za matukio ni muhimu kwa maswali ya kisa.** Ikiwa hali inataja juu
  mahitaji ya kumbukumbu (cache ya kumbukumbu, SAP HANA), jibu linaweza kuhusisha a
  mfano ulioboresha kumbukumbu. Ikitaja usindikaji wa bechi au HPC, imeboreshwa kwa kukokotoa.
- **Kusimamisha ≠ Kusitisha.** Kusimamisha tukio kulihifadhi (unaweza kuwasha upya).
  Kukomesha kunaifuta. Matukio ya mitihani hujaribu ikiwa unajua tofauti hii.
- **Mabadiliko ya IP ya umma inapowashwa tena.** Ikiwa programu yako inahitaji anwani thabiti ya IP,
  tumia **IP Elastic** — IP tuli ya umma ambayo inabaki kuhusishwa na akaunti yako.
  Hii inagharimu pesa ikiwa utatenga moja na huitumii.
- **Miundo ya bei Inapohitajika, Iliyohifadhiwa, na Spot** hujaribiwa kwa kiwango kikubwa katika Kikoa cha 4.
  Tunazishughulikia katika Sura ya 27. Kwa sasa, jua kwamba On-Demand inamaanisha kulipa kwa pili
  bila kujitolea.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: mfano wa EC2 ni nini? AMI ni nini? Uhusiano ni nini
kati yao?

*(Dokezo: Fikiri kuhusu mlinganisho wa mapishi — ni mapishi gani, na mlo ni nini?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni inatuma programu ya wavuti yenye watu wengi sana. maombi
hushughulikia utafutaji wa orodha ya bidhaa kwa mantiki changamano ya kuchuja ambayo ni ya kutumia CPU nyingi.
Timu inatarajia ongezeko kubwa la trafiki wakati wa hafla za uuzaji. Wanataka kuhakikisha
wanachagua aina sahihi ya mfano wa EC2 na wametayarishwa kwa ongezeko la trafiki.

Ni mchanganyiko gani wa chaguo BORA unakidhi mahitaji yao?

A) Matukio yaliyoboreshwa kwa kumbukumbu na nambari isiyobadilika ili kuhakikisha utendakazi thabiti  
B) Matukio yaliyoboreshwa kwa kukokotoa kwa Kuongeza Kiotomatiki ili kushughulikia ongezeko la trafiki  
C) Matukio ya kusudi la jumla na saizi moja kubwa ya mfano  
D) Matukio yaliyoboreshwa kwa uhifadhi kwa sababu katalogi ya bidhaa inahitaji ufikiaji wa diski haraka

**Kidokezo cha 1**: Mzigo wa kazi unafafanuliwa kama "CPU-intensive." Familia ni mfano gani
imeboreshwa kwa CPU?

**Kidokezo cha 2**: Hali inataja "kuongezeka kwa trafiki wakati wa matukio ya mauzo." Nambari maalum
ya matukio haitashughulikia vyema trafiki tofauti. Ni kipengele gani cha AWS kinashughulikia hii?

**Kidokezo cha 3**: Matukio yaliyoboreshwa kwa kukokotoa hushughulikia kazi nzito ya CPU. Kuongeza Otomatiki kunaongeza
na huondoa matukio kulingana na mahitaji. Kwa pamoja wanajibu mahitaji yote mawili.

**Jibu**: B

**Maelezo**: Matukio yaliyoboreshwa kwa kukokotoa (kama vile `c` familia) hutoa CPU zaidi
kwa dola kwa mzigo mkubwa wa kazi wa CPU. Kuongeza Kiotomatiki hurekebisha nambari kiotomatiki
ya matukio kulingana na mzigo - kuongeza matukio wakati wa matukio ya mauzo, kuondoa yao wakati
trafiki inarudi kwa kawaida. Mchanganyiko huu unaboresha utendaji na gharama.

**Kwa nini isiwe A?** Matukio yaliyoboreshwa kwa kumbukumbu yameundwa kwa ajili ya mizigo ya kazi inayohitaji kubwa
kiasi cha RAM (database, akiba ya kumbukumbu). Huu ni mzigo wa kazi unaohusishwa na CPU. Na fasta
hesabu za mfano humaanisha ama utoaji kupita kiasi (upotevu) au utoaji wa chini (kutofaulu).

**Kwa nini isiwe C?** Matukio ya madhumuni ya jumla yanabadilisha ufanisi wa CPU kwa salio. Kwa
mzigo unaojulikana wa CPU-intensive, compute-optimized inafaa zaidi. Na moja
mfano mkubwa ni hatua moja ya kushindwa.

**Kwa nini isiwe D?** Kikwazo ni CPU, si diski I/O. Matukio ya uhifadhi ulioboreshwa
zimeundwa kwa ajili ya mizigo ya kazi ambayo inahitaji upitishaji wa juu sana kwa hifadhi ya ndani.

*SAA-C03 Kikoa cha 3 - Kazi 3.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Kwa sasa Nimbus inaendesha mfano mmoja wa `t3.micro` EC2 kwa programu nzima.
Timu inahitaji kuamua: kupata toleo jipya zaidi (`t3.2xlarge`) au kuongeza zaidi
Matukio `t3.micro` nyuma ya kisawazisha mzigo?

Tembea kupitia maamuzi ya uwiano. Je, ni faida gani za kila mbinu? Nini
maswali unaweza kuuliza kuamua? (Kidokezo: fikiria juu ya pointi moja ya kushindwa,
gharama, utata wa upelekaji, na kile kinachotokea wakati wa matengenezo.)

*(Hakuna jibu moja sahihi. Hii ni kuhusu hoja kupitia wima dhidi ya.
kuongeza mlalo.)*

## Onyesho la Baada ya Mikopo

Leo alitumia alasiri kurekebisha seva. Alihama kutoka `t3.micro` hadi `t3.large`.
CPU imeshuka hadi 30%. Kurasa zimepakiwa chini ya sekunde.

Tom alitazama sasisho la muswada wa AWS katika muda halisi. Mfano mpya unagharimu mara nne zaidi
kwa saa. Aliandika.

Maya alikuwa akiangalia kitu kingine kwenye skrini yake.

"Leo," alisema. "Wakati ulikuwa unabadilisha ukubwa wa mfano, tovuti ilikuwa chini
dakika kumi na mbili."

Leo akatazama juu.

"Tulikuwa na foleni ya maagizo mia mbili ambayo hayajatekelezwa."

Akatazama kwenye skrini. Kisha kwenye dari. Kisha rudi kwenye skrini.

"Tunahitaji kitu kwa picha zetu," alisema, akibadilisha mada kidogo. “Sasa hivi,
Picha za menyu zilizopakiwa huhifadhiwa moja kwa moja kwenye seva. Ikiwa tutabadilisha ukubwa au kuanzisha upya
kwa mfano, tunawapoteza?"

Priya tayari alijua jibu.

Katika sura inayofuata: ambapo faili zinaishi wakati hakuna gari ngumu la kuelekeza.
