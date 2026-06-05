# Sura ya 12: Jinsi Mtandao Hukupata

Nimbus alikuwa anakimbia. Kisawazisha cha mzigo kilikuwa na IP ya umma. Matukio ya EC2 yalikuwa na IP ya kibinafsi. Hifadhidata zilifungwa katika nyati ndogo za kibinafsi. Priya alikuwa ameitikia kwa kichwa kukubali kwenye mchoro wa mtandao.

Tom aliangalia URL ya kusawazisha mzigo: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"Hivyo ndivyo wateja wanaandika kwenye kivinjari chao?" Aliuliza.

"Hilo ndilo ambalo AWS inapeana kiotomatiki," Maya alisema.

"Siweki hiyo kwenye kadi ya biashara."

"Wala mimi pia."

Walihitaji jina la kikoa. Walinunua `eatnimbus.com` kutoka kwa msajili wa kikoa. Sasa walihitaji kuunganisha jina hilo kwa miundombinu yao ya AWS.

"Mtandao unajuaje kuwa `eatnimbus.com` ina maana ya kusawazisha mzigo nchini us-east-1?" Leo aliuliza.

Swali zuri, Leo.

**Mlinganisho wa Kitabu cha Simu**

Kabla ya simu mahiri, kila jiji lilikuwa na kitabu cha simu. Ikiwa ulitaka kufikia "Mario's Pizza," hukukariri nambari yao ya simu - ulitafuta jina, ukapata nambari, na ukapiga.

Mtandao una kitabu chake cha simu: **Mfumo wa Jina la Kikoa (DNS)**.

DNS hutafsiri majina yanayoweza kusomeka na binadamu (kama `eatnimbus.com`) hadi anwani za IP zinazoweza kusomeka na mashine (kama `203.0.113.42`). Kila wakati unapotembelea tovuti, kompyuta yako hutafuta kimyakimya jina la kikoa katika DNS na kupata anwani ya IP ya kuunganisha.

Ikiwa ulibadilisha anwani ya IP ya seva yako, ungesasisha rekodi ya DNS - kama vile kubadilisha nambari yako kwenye kitabu cha simu - na mtandao utakupata katika eneo lako jipya.

**Kutana na Njia 53**

Amazon Route 53 ni huduma ya DNS inayosimamiwa na AWS. Inaitwa Njia ya 53 kwa sababu bandari 53 ndio bandari ya kawaida ya DNS. (Wakati mwingine AWS hutaja vitu moja kwa moja.)

Njia ya 53 hufanya mambo kadhaa:

**Usajili wa kikoa**: Unaweza kununua majina ya kikoa kupitia Njia ya 53 moja kwa moja.

**Kupangisha DNS (eneo zinazopangishwa)**: Unaunda *eneo linalopangishwa* kwa ajili ya kikoa chako, na Njia ya 53 inadhibiti rekodi za DNS zinazouambia ulimwengu mahali pa kukupata.

**Ukaguzi wa afya**: Njia ya 53 inaweza kufuatilia ncha zako na kuelekeza trafiki mbali na zisizo za afya.

**Sera za uelekezaji wa trafiki**: Njia ya 53 inaauni mikakati mingi ya uelekezaji zaidi ya DNS rahisi - iliyopimwa, kulingana na muda, eneo la eneo, kushindwa.

**Rekodi za DNS: Maingizo ya Kitabu cha Simu**

Rekodi ya DNS hutengeneza jina la lengwa. Aina za kawaida zaidi:

**Rekodi**: Huweka jina kwa anwani ya IPv4.
`eatnimbus.com → 203.0.113.42`

**Rekodi ya AAA**: Huweka jina kwenye anwani ya IPv6.

**Rekodi ya CNAME**: Huweka jina kwa jina lingine (lakabu).
`www.eatnimbus.com → eanimbus.com`

**Rekodi ya MX**: Hubainisha ni seva zipi zinazoshughulikia barua pepe za kikoa.

**Rekodi ya TXT**: Huhifadhi maandishi kiholela. Hutumika sana kwa uthibitishaji wa kikoa (kuthibitisha kuwa unamiliki kikoa) na uthibitishaji wa barua pepe (SPF, DKIM).

Kwa Nimbus, usanidi wa msingi:

- `eatnimbus.com` → Rekodi inayoelekeza kwa IP ya kidhibiti cha mizigo
- `www.eatnimbus.com` → CNAME inayoelekeza kwenye `eatnimbus.com`
- `api.eatnimbus.com` → Rekodi inayoelekeza kwenye kisawazisha cha upakiaji wa API

"Subiri," Tom alisema. "IP ya kusawazisha mzigo inaweza kubadilika. AWS ilisema hivyo kwenye nyaraka."

Kukamata vizuri, Tom.

**Rekodi za Majina: Suluhisho la AWS kwa IPs Nguvu **

Mizani ya mizigo, usambazaji wa CloudFront, na tovuti za S3 zina majina ya DNS, si anwani za IP tuli. IPs za msingi zinaweza kubadilika.

Ukiunda CNAME inayoelekeza kwenye jina la DNS la kikisawazisha mzigo, itafanya kazi - lakini huwezi kutumia CNAME kwa vikoa vya mizizi (`eatnimbus.com` bila `www`) kwa sababu ya viwango vya DNS.

Njia ya 53 hutatua hili kwa **Rekodi za Lakabu** - kiendelezi mahususi cha AWS kwa DNS. Rekodi ya Lakabu huweka jina moja kwa moja kwenye rasilimali ya AWS (kisawazisha mzigo, usambazaji wa CloudFront, tovuti ya S3), na Route 53 hushughulikia azimio dhabiti la IP kiotomatiki. Rekodi za lakabu zinaweza kutumika katika kiwango cha kikoa cha mizizi. Na tofauti na maswali ya kawaida ya DNS kwa huduma za nje, hoja za rekodi za Lakabu kwa rasilimali za AWS hazilipishwi.

"Kwa hivyo tunatumia rekodi ya Lakabu ya `eatnimbus.com` inayoelekeza kwenye kisawazisha mzigo," Leo alithibitisha.

"Na Njia ya 53 inashughulikia IP yoyote ambayo kidhibiti cha mzigo kinatumia wakati wowote," Priya aliongeza.

"Kwa bure," Tom alisema, ghafla nia sana.

**Sera za Uelekezaji: Zaidi ya "Iko Wapi?"**

Hapa ndipo Njia ya 53 inapovutia. DNS sio huduma ya kuangalia tu - inaweza kuwa zana ya kudhibiti trafiki.

**Uelekezaji rahisi**: Rekodi moja, lengwa moja. DNS ya kawaida.

**Uelekezaji wa uzani**: Gawanya trafiki kati ya maeneo mengi kwa uzani. Tuma 90% kwa seva mpya, 10% kwa seva ya zamani wakati wa uhamishaji. Rekebisha uzani hadi ujiamini katika seva mpya, kisha ubadilishe hadi 100%.

**Uelekezaji unaotegemea kusubiri**: Waelekeze watumiaji wa njia hadi eneo la AWS wakiwa na muda wa chini zaidi wa kusubiri. Mtumiaji katika Seattle anaelekezwa `us-west-2`. Mtumiaji katika Tokyo anaelekezwa `ap-kaskazini-mashariki-1`. Jina la kikoa sawa, maeneo tofauti.

**Uelekezaji wa Kijiografia**: Njia kulingana na eneo la kijiografia la mtumiaji. Watumiaji wote wa Ulaya huenda kwa `eu-west-1`. Watumiaji wote wa Amerika Kaskazini huenda kwa `us-east-1`. Inafaa kwa mamlaka ya data (kuweka data ya mtumiaji wa Umoja wa Ulaya katika maeneo ya Umoja wa Ulaya) au ubinafsishaji wa maudhui (lugha, sarafu).

**Uelekezaji wa kushindwa**: Teua kituo cha msingi na cha pili. Ikiwa msingi utashindwa kuangalia afya ya Njia ya 53, trafiki itaelekezwa kiotomatiki hadi ya pili. Hii ni safu ya DNS ya uokoaji wa maafa.

**Uelekezaji wa majibu mengi**: Rejesha hadi anwani nane za IP zenye afya kwa swali, ukimruhusu mteja kuchagua. Njia mbadala rahisi ya kusawazisha mzigo kwa kusambaza trafiki kwenye seva nyingi.

"Kwa hivyo Route 53 sio tu kitabu cha simu," Maya alisema. "Ni kitabu cha simu mahiri ambacho kinaweza kuelekeza simu kulingana na mahali unapopiga simu kutoka."

"Na kukukata kama nambari sio nzuri," Priya aliongeza.

**Ukaguzi wa Afya: Kuelekeza Karibu Kushindwa**

Njia ya 53 inaweza kufuatilia mwisho wako kwa ukaguzi wa afya. Ikiwa mwisho utashindwa, Njia ya 53 inaweza:

- Iondoe kutoka kwa majibu ya DNS (acha kutuma trafiki huko)
- Anzisha kushindwa hadi mwisho wa chelezo
- Tuma arifa kupitia CloudWatch

Ukaguzi wa afya ni kiungo kati ya uelekezaji wa DNS na afya halisi ya programu. Katika usanidi wa kushindwa: Njia ya 53 hufuatilia mwisho wa msingi kila sekunde 30. Iwapo ukaguzi tatu mfululizo utashindwa, Njia ya 53 itaanza kurejesha anwani ya sehemu ya pili ya mwisho.

Hii si mara moja - DNS ina muda wa uenezi. Mara tu Njia ya 53 inapobadilisha rekodi ya DNS, visuluhishi vya DNS kote ulimwenguni vinahitaji kuchukua mabadiliko, ambayo yanaweza kuchukua sekunde hadi dakika kulingana na mipangilio ya TTL.

**TTL: Akiba ya DNS**

Majibu ya DNS yamehifadhiwa katika viwango vingi - kwenye kipanga njia chako, kwa Mtoa Huduma za Intaneti, kwenye kivinjari chako. **TTL (Time-To-Live)** kwenye rekodi ya DNS hufahamisha muda wa kukumbuka jibu kabla ya kuangalia tena.

TTL ya juu (saa 1 au zaidi): Hoja chache za DNS, upakiaji mdogo kwenye Njia ya 53, lakini mabadiliko huchukua muda mrefu kuenezwa.

TTL ya Chini (sekunde 60 au chini): Mabadiliko huenea haraka, lakini hoja zaidi za DNS zinahitajika.

Kabla ya uhamishaji uliopangwa (kusasisha DNS ili kuelekeza kwenye seva mpya), punguza TTL yako hadi sekunde 60 kwa siku mapema. Kisha unapofanya mabadiliko, hueneza kwa takriban dakika moja. Baada ya uhamiaji, inua tena kwa thamani ya kawaida.

"Ikiwa tutaipunguza tu wakati wa uhamiaji na sio kabla," Leo alisema polepole, "TTL ya zamani inamaanisha kuwa watumiaji wengine wataona seva ya zamani kwa saa moja."

"Kweli," Priya alisema. "Uhamiaji wa DNS unahitaji kupanga kabla ya uhamiaji, sio tu wakati."

## Nguvu na Mapungufu

**Njia ya 53 ndiyo chaguo sahihi kwa **: kusajili na kudhibiti majina ya vikoa kabisa ndani ya AWS; uelekezaji wa trafiki kulingana na muda wa kusubiri, eneo la eneo, au usambazaji wa mizani kwenye ncha nyingi; kushindwa kwa msingi wa ukaguzi wa afya kati ya mikoa au kati ya msingi na mwisho wa uokoaji wa maafa; kuunganisha DNS na huduma zingine za AWS kupitia rekodi za jina lak.

**Wakati Njia ya 53 sio unayohitaji**: Njia ya 53 ni huduma ya DNS, sio ya kusawazisha mzigo. Iwapo unahitaji kusambaza trafiki kati ya seva nyingi au kontena ndani ya eneo, tumia Kisawazisha cha Upakiaji wa Programu - Njia ya 53 haiwezi kufanya uzani wa robini katika kiwango cha muunganisho jinsi kisawazisha cha upakiaji kinavyoweza. Uelekezaji unaotegemea muda wa kusubiri katika maeneo yote huongeza gharama na uchangamano wa uendeshaji ambao unaeleweka tu wakati watumiaji wako wamesambazwa kihalisi duniani kote na milisekunde ni muhimu kwa ubadilishaji. Kwa programu nyingi za eneo moja, rekodi moja ya A inayoelekeza kwa ALB ndiyo usanidi wote wa Njia ya 53 unayohitaji.

## Muhtasari

- **DNS** hutafsiri majina ya vikoa kuwa anwani za IP - kitabu cha simu cha mtandaoni.
- **Njia ya 53** ni huduma ya DNS inayosimamiwa na AWS: usajili wa kikoa, upangishaji wa DNS, ukaguzi wa afya na sera za uelekezaji.
- **Rekodi ** Majina ya ramani kwa anwani za IPv4. **CNAME** majina ya ramani kwa majina mengine. **Rekodi za lakabu** Majina ya ramani kwa rasilimali za AWS (vilinganishi vya upakiaji, CloudFront, S3).
- Tumia rekodi za Lakabu (sio CNAME) kwa vikoa vya mizizi na rasilimali zilizo na IP zinazobadilika.
- Sera za uelekezaji hupita zaidi ya DNS rahisi: **iliyo na uzito** (mgawanyiko wa trafiki), ** kulingana na muda wa kusubiri** (utendaji), **uwekaji kijiografia** (utawala wa data), **failover** (ahueni ya maafa).
- **Ukaguzi wa afya** kufuatilia ncha na uondoe kiotomatiki malengo yasiyo ya afya kutoka kwa majibu ya DNS.
- Panga mabadiliko ya TTL kabla ya uhamishaji - punguza TTL mapema ili mabadiliko yaenee haraka.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu wenye Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.4)*

- **Lakabu dhidi ya CNAME**: Rekodi za lakabu zinaweza kutumika kwenye kikoa kikuu; CNAME haziwezi. Rekodi za lakabu kwa rasilimali za AWS ni bure; Hoja za CNAME DNS zimewekewa bei. Mtihani unapouliza juu ya kuweka kikoa cha mizizi kwa kiweka usawazishaji → Rekodi ya Lakabu.
- **Kesi za matumizi ya sera ya uelekezaji** (matukio ya kawaida ya mitihani):
  - "Hamisha trafiki hatua kwa hatua hadi toleo jipya" → Uelekezaji ulio na uzito
  - "Waelekeze watumiaji kwenye eneo la karibu la AWS" → Uelekezaji unaotegemea Latency
  - "Weka data ya mtumiaji wa Umoja wa Ulaya katika maeneo ya Umoja wa Ulaya" → Uelekezaji wa eneo
  - "Kushindwa kwa DNS kiotomatiki wakati msingi unapopungua" → Uelekezaji wa kushindwa na ukaguzi wa afya
- **Ukaguzi wa afya wa Njia ya 53**: Inaweza kuangalia sehemu za mwisho za HTTP/HTTPS/TCP, na inaweza kuwasha kengele za CloudWatch. Mtihani hutumia haya katika hali za uokoaji wa maafa.
- **TTL na uenezi**: Jua kuwa TTL inadhibiti muda ambao visuluhishi vya DNS huhifadhi rekodi. TTL fupi = mabadiliko ya haraka. Hali ya mtihani: "timu ilisasisha DNS lakini watumiaji bado wanagonga seva ya zamani" → TTL iko juu sana.
- **Maeneo yaliyopangishwa ya kibinafsi**: Njia ya 53 inaweza kuunda rekodi za DNS ambazo hutatuliwa ndani ya VPC pekee. Mtihani hutumia hii kwa ugunduzi wa huduma ya ndani (k.m., `database.internal` kusuluhisha hadi mwisho wa RDS).
- Njia ya 53 ni **kimataifa** — haijatumwa katika eneo. Hakuna uteuzi wa eneo unaohitajika wakati wa kuunda maeneo yaliyopangishwa.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza tofauti kati ya rekodi ya CNAME na rekodi ya Lakabu. Je, ungetumia kila moja lini?

*(Kidokezo: Zingatia vikwazo kwenye CNAME kwenye vikoa vya mizizi, na tabia ya rekodi za Lakabu zilizo na rasilimali za AWS zinazobadilika.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya media inaendesha tovuti kutoka maeneo mawili ya AWS: `us-east-1` (msingi) na `eu-west-1` (sekondari). Timu inataka trafiki ielekeze kiotomatiki kuelekea `eu-west-1` ikiwa eneo la msingi halipatikani. Kampuni pia inataka kuthibitisha kuwa utaratibu huu wa kushindwa kufanya kazi kwa usahihi bila kuondoa eneo la msingi.

Ni usanidi gani wa Njia ya 53 BORA inayokidhi mahitaji haya?

A) Njia iliyopimwa yenye uzito wa 100% kwa `us-east-1` na 0% uzito kwenye `eu-west-1`  
B) Uelekezaji unaotegemea muda wa kusubiri na ukaguzi wa afya kwenye ncha zote mbili  
C) Uelekezaji wa kushindwa na ukaguzi wa afya kwenye sehemu ya msingi ya mwisho na rekodi ya pili inayoelekeza `eu-west-1`  
D) Uelekezaji wa eneo huku Amerika Kaskazini ikielekeza kwa `us-mashariki-1` na Ulaya ikielekeza `eu-magharibi-1`

**Kidokezo cha 1**: Sharti ni kushindwa kiotomatiki wakati msingi unashuka. Ni sera gani ya uelekezaji imeundwa haswa kwa hili?

**Kidokezo cha 2**: "Jaribu bila kupunguza eneo la msingi" — ukaguzi wa afya unaweza kuwekwa mwenyewe kuwa "sio sawa" kwa majaribio.

**Kidokezo cha 3**: Uelekezaji unaotegemea muda wa kusubiri huboresha kasi, si kwa kushindwa.

**Jibu**: C

**Maelezo**: Uelekezaji wa Failover umeundwa haswa kwa hali hii ya utumiaji. Rekodi ya msingi inaelekeza kwa `us-east-1` kwa ukaguzi wa afya. Rekodi ya pili inaelekeza kwa `eu-west-1`. Ikiwa ukaguzi wa afya hautafaulu, Njia ya 53 hutumikia rekodi ya pili kiotomatiki. Ukaguzi wa afya unaweza kulazimishwa kushindwa kufanya majaribio bila kutatiza eneo la msingi.

**Kwa nini isiwe A?** Uelekezaji ulio na uzani wa 100%/0% ni tuli kwa ufanisi - haubadiliki kiotomatiki msingi unapofeli.

**Kwa nini isiwe B?** Uelekezaji unaotegemea muda wa kusubiri huchagua sehemu ya mwisho ya haraka zaidi kwa kila mtumiaji. Haijumuishi eneo kiotomatiki kwa msingi wa afya - bado inaweza kuelekeza trafiki kwa `us-east-1` isiyofaa ikiwa muda wa kusubiri utaipendelea.

**Kwa nini isiwe D?** Njia za uelekezaji wa eneo kulingana na eneo la mtumiaji, si kwa afya ya mwisho. Watumiaji wa Uropa wangekwama kwenye `eu-west-1` hata kama `us-east-1` ni nzuri, na watumiaji wa Amerika Kaskazini hawatashindwa `eu-west-1` hata kama `us-east-1` itapungua.

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu — Jukumu la 3.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inapanuka kimataifa. Wanataka `eatnimbus.com` ipake haraka kwa watumiaji wa Pwani ya Magharibi, Pwani ya Mashariki na Australia. Pia wana mahitaji ya udhibiti: maagizo yaliyowekwa na watumiaji wa Ulaya lazima yachakatwa na seva katika Umoja wa Ulaya.

Tengeneza mkakati wa uelekezaji wa Njia ya 53 ambayo inashughulikia mahitaji yote mawili. Je, ungetumia sera gani ya uelekezaji au mseto wa sera? Je, utahitaji miundombinu gani katika kila mkoa?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya usanifu wa uelekezaji wa kanda nyingi.)*

## Onyesho la Baada ya Mikopo

`eatnimbus.com` alikuwa hewani.

Maya alikuwa ameiandika kwenye kivinjari chake, na ukurasa wa kuagiza wa Nimbus ulikuwa umepakia. Alikuwa ameagiza arepa kutoka kwa mgahawa wa familia yake, ili tu kujaribu mtiririko. Agizo lilikuwa limepitia. Jikoni walikuwa wameipokea.

Yeye akaketi nyuma.

Tom alikuwa tayari akisoma kumbukumbu za ukaguzi wa afya wa Route 53. "Muda wa kujibu ni milisekunde 47 kutoka kwetu-mashariki-1."

"Je! ni haraka?" Maya aliuliza.

"Kwa DNS? Ndiyo."

"Lakini kwa mtumiaji huko Seattle?"

Tom alitazama grafu ya latency. "Takriban milliseconds 80."

Maya alifikiria hilo. "Ikiwa wateja wetu wengi wako Pwani ya Magharibi, na seva zetu ziko Virginia..."

"Kila ombi husafiri kutoka Seattle hadi Virginia na kurudi," Leo alisema kutoka kwa chumba. "Kasi ya mwanga. Huwezi kushinda fizikia."

"Kwa hivyo tunahitaji seva karibu na Seattle."

"Au kitu karibu na Seattle ambacho hutumikia yaliyomo kwa niaba yao."

Wazo hilo lilining'inia hewani.

Katika sura inayofuata: ghala ambazo huweka maudhui ya Nimbus mbali na kila mtumiaji, kila mahali.
