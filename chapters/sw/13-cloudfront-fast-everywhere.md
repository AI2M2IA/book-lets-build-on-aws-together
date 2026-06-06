# Sura ya 13: Haraka Kila Mahali

Picha inayosafiri kutoka seva iliyoko Oregon hadi simu iliyoko Boston huvuka takriban kilomita 4,100 za kebo ya fiber optic. Katika theluthi mbili za kasi ya mwanga, hiyo ni karibu milisekunde 25 za fizikia safi — isiyoepukika, isiyojadiliwa, iliyowekwa katika sheria za ulimwengu.

Kisha ongeza safari ya kwenda na kurudi. Kisha ongeza muda wa uchakataji. Kivinjari bado hakijaanza kutoa na milisekunde 80 tayari zimetoweka.

---

*`eatnimbus.com` ilikuwa hewani na jina la kikoa lilikuwa halisi. Watumiaji wangeweza kuipata programu. Lakini kuipata hakukuwa sawa na kuifurahia. Tom alikuwa akiendesha vipimo vya ucheleweshaji kutoka miji tofauti, na namba kutoka Pwani ya Mashariki na Amerika Kusini hazikuwa nzuri. Tatizo la jina la kikoa lilikuwa limetatuliwa. Tatizo la fizikia halikuwa.*

---

`eatnimbus.com` ilikuwa hewani. Leo alikuwa amekagua vipimo vya ucheleweshaji kutoka watumiaji wa Pwani ya Mashariki: milisekunde 80-100 kwa kila ombi. Hiyo inaweza kusikika ndogo, lakini inajilundika.

Pakia menyu: 90ms. Pakia orodha ya mikahawa: 80ms. Pakia picha za mkahawa: 200ms (picha ni kubwa). Jumla ya muda kabla mtumiaji hajaweza kuweka agizo: zaidi ya nusu sekunde kwenye muunganisho mzuri.

"Fizikia ndio tatizo," Leo alisema. "Seva ziko Oregon. Ukuaji uko Pwani ya Mashariki — na São Paulo."

"Kwa hivyo sogeza seva hadi Pwani ya Mashariki," Tom alisema.

"Hiyo inagharimu pesa."

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

"Kuendesha nakala kamili ya miundombinu yetu katika us-east-1? Pengine mara tatu ya gharama zetu za sasa. Na inaunda tatizo jipya kabisa: kuweka hifadhidata ya Pwani ya Magharibi na hifadhidata ya Pwani ya Mashariki katika usawazishaji."

Priya akaangalia juu kutoka laptop yake. "Au hatusogezi seva. Tunasogeza *maudhui*."

Maya akaangalia juu. "Tofauti ni nini? Ikiwa maudhui yako kwenye seva, na seva iko Oregon, maudhui yako Oregon."

"Sehemu kubwa ya kile ukurasa unawasilisha ni tuli," Priya alisema. "Picha, stylesheets, faili za JavaScript, fonti. Hizo ni sawa kwa kila mtumiaji. Hazitoki hifadhidatani. Zinaishi katika S3. Na vitu vya S3 vinaweza kuhudumiwa kutoka popote."

"Kwa hivyo tunazinakili kwa seva zilizo karibu na watumiaji?"

"Tunaruhusu huduma kusimamia hilo kwa niaba yetu. Chanzo kimoja cha ukweli. Nakala kila zinapohitajika."

Tom alikuwa tayari amefungua ukurasa wa bei. Alikuwa akihesabu kabla Priya hajamaliza kueleza.

**Mlinganisho wa Ghala Lililojazwa Tayari**

Fikiria Amazon muuzaji, si kampuni ya wingu. Wana ghala kubwa katika eneo moja lenye kila bidhaa. Kama wangesafirisha kila agizo kutoka ghala hilo moja, wateja katika miji ya mbali wangesubiri kwa siku.

Badala yake, Amazon ina vituo vya utimilifu karibu na vituo vikuu vya idadi ya watu. Bidhaa inapokuwa maarufu, wao hujaza tayari ghala hizo za ndani. Mteja katika Seattle anapoagiza kitabu, husafirishwa kutoka kituo cha utimilifu cha ndani — si kutoka nchi nzima.

Huu ni **Content Delivery Network (CDN)**: mtandao wa seva zilizosambazwa kijiografia zinazoweka akiba nakala za maudhui yako karibu na watumiaji wako.

Wakati mtumiaji katika Boston anapoomba ukurasa wako wa nyumbani, CDN huihudumia kutoka seva iliyoko Boston. Si Oregon. Ombi halivuki kamwe nchi nzima.

**Kutana na CloudFront**

Amazon CloudFront ni CDN ya AWS. Inafanya kazi kupitia mtandao wa kimataifa wa **edge locations** — seva za kuweka akiba zilizowekwa katika miji kote ulimwenguni. Kufikia uandishi huu, kuna zaidi ya pointi 750 za uwepo katika miji 100+.

Unaposanidi CloudFront, unabainisha **origin**: chanzo cha maudhui yako halisi. Origin yako inaweza kuwa:

- Ndoo ya S3 (faili tuli: picha, CSS, JavaScript, PDF)
- Application Load Balancer (maudhui yanayobadilika kutoka programu yako)
- Kihalisi cha EC2
- Seva ya HTTP popote kwenye intaneti

CloudFront hukaa mbele ya origin yako. Maombi huja katika edge location iliyo karibu zaidi. Ikiwa edge ina maudhui yaliyowekwa akiba, huirudisha mara moja. Ikiwa hapana (*cache miss*), huchota kutoka origin yako, huiweka akiba, na huirudisha.

**Jinsi Kuweka Akiba kwa CloudFront Kunavyofanya Kazi**

Ombi la kwanza la kipande chochote cha maudhui daima ni cache miss — huenda kwenye origin. Kila ombi linalofuata hugonga akiba katika edge location.

Kwa Nimbus, picha za menyu ni wagombea wakamilifu wa CloudFront. Picha za mkahawa hubadilika mara chache (pengine wakati mkahawa unasasisha wasifu wao). Kwa CloudFront:

1. Mtumiaji katika Boston anaomba `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront hukagua edge location katika Boston — bado haijawekwa akiba (cache miss)
3. CloudFront huchota kutoka S3 katika us-west-2 (~80ms)
4. CloudFront huhifadhi picha katika edge location ya Boston
5. Mtumiaji anayefuata katika Boston anaomba picha ileile
6. CloudFront huhudumia kutoka akiba ya edge ya ndani (~5ms)

Adhabu ileile ya 80ms kwa ombi la kwanza. Lakini ombi la elfu moja kutoka mji uleule ni milisekunde 5.

**Vichwa vya Cache-Control** na **mipangilio ya TTL** katika CloudFront huamua muda ambao maudhui hubaki yamewekwa akiba ukingoni. Faili za picha zinaweza kuwekwa akiba kwa saa au siku. Kurasa za HTML (zinazobadilika mara nyingi zaidi) zinaweza kuwekwa akiba kwa dakika au sekunde.

Huenda unajiuliza: kwa nini tusipangishe programu nzima katika maeneo mengi badala ya kutumia CDN? Ikiwa data iko Oregon, kwa nini tusiweke nakala kamili katika New York, Tokyo, na São Paulo? Ungeweza. Lakini hiyo inamaanisha kuweka hifadhidata nyingi katika usawazishaji, kusimamia usambazaji katika maeneo kwa wakati mmoja, kushughulikia hali za split-brain ambapo maeneo hayakubaliani. CDN ni jibu rahisi zaidi kwa maudhui tuli na nusu-tuli: origin moja, nakala nyingi zilizowekwa akiba ukingoni. Unaongeza ugumu wa maeneo mengi tu unapohitaji kwa kweli kompyuta au operesheni za hifadhidata karibu na mtumiaji — kwa maudhui mengi, kuweka akiba ukingoni kunatosha.

"Subiri — lakini *kwa nini* tungeifanya hivyo?" Maya aliuliza. "Kwa nini kuweka akiba ukingoni badala ya kuongeza tu klasta kubwa ya ElastiCache katika Oregon?"

"Kwa sababu fizikia bado ndio tatizo," Priya alisema. "Hata kama Oregon itajibu katika milisekunde moja, jibu hilo bado linapaswa kusafiri hadi Boston. Muda wa kwenda-na-kurudi ni milisekunde 70 kima cha chini — kasi ya mwanga haijali jinsi seva zetu zilivyo za haraka. Kuweka akiba ukingoni husogeza jibu karibu na swali."

**Maudhui Yanayobadilika: CloudFront kwa Zaidi ya Kuweka Akiba**

"Lakini vipi kuhusu majibu yetu ya API?" Leo aliuliza. "Hayo yanabadilika — yanabadilika kwa kila mtumiaji, kwa kila ombi. Huwezi kuweka akiba ukurasa wa historia ya maagizo."

Kweli. Lakini CloudFront bado husaidia na maudhui yanayobadilika.

Hata wakati maudhui hayawezi kuwekwa akiba, CloudFront huelekeza ombi kutoka edge location hadi origin kupitia mtandao wa uti wa mgongo wa kibinafsi wa AWS — fiber yenye kasi ya juu inayounganisha miundombinu ya AWS duniani kote. Hii ni haraka na ya kuaminika zaidi kuliko kuelekeza juu ya intaneti ya umma, ambapo trafiki inaweza kudunda kupitia wabebaji wengi.

Matokeo: maombi yanayobadilika bado ni ya haraka kwa 20-40% kupitia CloudFront kuliko kwenda moja kwa moja kwa origin juu ya intaneti ya umma. Si kwa sababu ya kuweka akiba, bali kwa sababu ya njia ya mtandao.

"Hiyo haijumuiki," Maya alisema. "Ikiwa jibu la API bado linapaswa kusafiri kutoka Oregon hadi ukingoni kisha hadi Boston, hiyo ni haraka vipi kuliko kwenda moja kwa moja kutoka Oregon hadi Boston?"

"Sababu mbili," Priya alisema. "Kwanza, uti wa mgongo wa kibinafsi wa AWS ni wa haraka na wa kuaminika zaidi kuliko intaneti ya umma. Trafiki ya intaneti ya umma huelekezwa kupitia wabebaji wengi, kila mmoja akiongeza ucheleweshaji na utofauti wake. Uti wa mgongo ni fiber ya moja kwa moja, yenye ucheleweshaji wa chini. Pili, ukomeshaji wa SSL hutokea ukingoni. Mtumiaji huanzisha muunganisho wa TLS kwa edge location ya CloudFront iliyo karibu zaidi — kupeana mkono ni haraka. Kisha CloudFront huweka muunganisho wa kudumu, ulioanzishwa awali kwa origin. Miunganisho miwili ya umbali mfupi badala ya mmoja wa umbali mrefu."

"Kwa hivyo hata kwa maudhui yasiyowekwa akiba, CloudFront hukata muda kutoka kwa ziada ya muunganisho," Leo alisema.

"Kawaida asilimia kumi hadi arobaini. Si kubwa kama kuweka akiba. Lakini halisi."

Zaidi ya hayo, CloudFront hutoa:

**Ukomeshaji wa SSL/TLS**: CloudFront hushughulikia HTTPS ukingoni. Muunganisho kati ya mtumiaji na CloudFront umesimbwa. CloudFront inaweza kuunganisha kwa origin yako kwa HTTP ndani (kupunguza mzigo wa origin) au HTTPS (kwa usimbaji wa mwanzo hadi mwisho).

**Ulinzi wa DDoS**: CloudFront imeunganishwa na AWS Shield Standard. Trafiki iliyosambazwa katika mamia ya edge locations inamaanisha mashambulizi yanamezwa ukingoni badala ya kupiga origin yako.

**Kizuizi cha kijiografia (Geo-restriction)**: Zuia ufikiaji kutoka nchi mahususi. Ikiwa Nimbus imepewa leseni ya kufanya kazi katika masoko fulani tu, CloudFront inaweza kutekeleza hilo ukingoni bila ombi kuwahi kufikia seva zako.

**Na vipi ikiwa mtu atajaribu kuvunja kupitia CDN?** Priya aliuliza. "Cache poisoning — vipi ikiwa mtu ataweza kuingiza maudhui mabaya katika akiba ya ukingo?"

"CloudFront ina vidhibiti vya cache key," Leo alisema. "Unafafanua haswa sifa gani huamua kama maombi mawili yanapata jibu lilelile lililowekwa akiba. Vichwa, query strings, vidakuzi. Mvamizi hawezi kuingiza jibu tofauti lililowekwa akiba bila kufananisha cache key haswa."

"Na Origin Access Control inamaanisha ndoo ya S3 haitahudumia chochote kisichotoka kupitia CloudFront," Priya alisema. "Uso mmoja wa shambulizi badala ya miwili."

**CloudFront Behaviors: Kanuni za Kuweka Akiba za Kina**

Usambazaji wa CloudFront unaweza kuwa na **behaviors** nyingi — kanuni za uelekezaji kulingana na mifumo ya URL.

Kwa Nimbus:

- `/images/*` → Weka akiba ukingoni kwa siku 7 (picha hazibadiliki mara nyingi)
- `/static/*` → Weka akiba ukingoni kwa siku 30 (CSS na JavaScript zenye majina ya faili ya matoleo)
- `/api/*` → Usiweke akiba; tuma moja kwa moja kwa load balancer
- `/*` → Weka akiba kwa dakika 5 (kurasa za HTML)

Hii inaruhusu CloudFront kuwa mahiri: weka akiba kwa nguvu kile kilicho thabiti, pitisha kile kinachobadilika.

Behaviors hulinganishwa kutoka mahususi zaidi hadi mahususi kidogo. `/images/hero.jpg` hulingana na `/images/*` kabla ya kulingana na `/*`. `/*` ya kunasa-yote chini ndio chaguomsingi — inatumika kwa chochote kisicholingana na mfumo mahususi zaidi.

"Vipi ikiwa tunataka kuweka akiba tofauti kwa watumiaji walioidhinishwa dhidi ya wasioidhinishwa?" Priya aliuliza. "URL ileile inaweza kurudisha maudhui tofauti kutegemea kama mtumiaji ameingia."

"Basi unajumuisha kuki ya kipindi katika cache key," Leo alisema. "Lakini hiyo inamaanisha kila mtumiaji aliyeingia hupata ingizo lake la akiba. Kiwango chako cha hit huporomoka kwa maudhui yaliyoidhinishwa."

"Ndio sababu unatenganisha maudhui yaliyoidhinishwa na maudhui ya umma katika kiwango cha URL," Priya alisema. "Chochote kinachohitaji uidhinishaji huenda `/app/*` na hakiwekwi akiba. Maudhui ya umma huenda `/browse/*` na huwekwa akiba kwa nguvu. Mpaka mmoja wazi."

Somo: CloudFront hufanya kazi vizuri zaidi wakati muundo wako wa URL unaakisi nia ya kuweka akiba. URL zinazoelekeza kwa data ya umma kabisa, tuli zinapaswa kuonekana tofauti na URL zinazorudisha data ya kibinafsi, inayobadilika. Ikiwa zinaonekana sawa kwa CloudFront, ama akiba imevunjika au maudhui yasiyo sahihi yanahudumiwa.

Leo aliunda upya mfumo wa URL wa Nimbus katika wikendi. Endpoints za kuvinjari zilihamia `/browse/`. Endpoints za API zilihamia `/api/`. UI ya programu iliyoidhinishwa ilihamia `/app/`. Behaviors tatu, sera tatu wazi za kuweka akiba, sifuri utata.

"Ni kidogo ya kuandika upya," alisema.

"Ni muundo sahihi," Priya alisema. "Ungeuhitaji hatimaye."

**Origin Access Control: Kulinda S3 kwa CloudFront**

Ikiwa ndoo yako ya S3 ina maudhui ya kibinafsi yanayopaswa kuhudumiwa kupitia CloudFront tu (si moja kwa moja), unaweza kutumia **Origin Access Control (OAC)** kuhakikisha S3 inakataa maombi yasiyotoka CloudFront.

Kwa njia hii:

- `d1234abcd.cloudfront.net/image.jpg` → Imehudumiwa (CloudFront ina ruhusa)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Imezuiwa (ufikiaji wa moja kwa moja wa S3 umekataliwa)

Maudhui yako yanafikika tu kupitia usambazaji wako, na kanuni zako za akiba na mipangilio ya usalama vikiwa vimetumika.

---

**Tukio la Picha Iliyochakaa**

Mkahawa 112 — mahali pa Colombian katika Eastside — ulituma barua pepe kwa msaada Alhamisi asubuhi. Mteja alikuwa amelalamika kuwa picha ya hero ya mkahawa bado ilionyesha duka la zamani, ingawa mmiliki alikuwa amepakia mpya siku mbili zilizopita.

Leo alivuta mipangilio ya usambazaji wa CloudFront.

Behavior ya `/images/*` ilikuwa na TTL ya siku saba. Lango la mshirika wa mkahawa lilikuwa limepakia picha mpya siku mbili zilizopita, likibadilisha faili katika njia ileile ya ufunguo wa S3: `restaurant-112/hero.jpg`. Faili ya zamani ilikuwa imeenda kutoka S3. Lakini CloudFront ilikuwa bado ikiihudumia kutoka akiba katika kila edge location iliyokuwa imeichota katika siku saba zilizopita.

"Tulibadilisha maudhui katika origin," Leo alisema. "Lakini CloudFront haijui hilo. Ina nakala iliyowekwa akiba na haitaangalia kwa siku saba."

"Tayari niliisambaza — oh." Alikuwa amedhani kubadilisha faili ya S3 kungeburudisha kiotomatiki akiba ya CloudFront. Haifanyi. CloudFront haina utaratibu wa kugundua kuwa maudhui katika ufunguo wa S3 yamebadilika — inahudumia tu chochote ilichoweka akiba hadi TTL iishe.

Chaguzi mbili:

**Chaguo la kwanza: Invalidation.** Tuma CloudFront ombi la invalidation kwa `/images/restaurant-112/hero.jpg`. CloudFront huweka alama njia hiyo kuwa imechakaa katika edge locations zote. Ombi linalofuata la njia hiyo huchota maudhui mapya kutoka S3. Gharama: njia 1,000 za kwanza za invalidation kila mwezi ni za bure; zaidi ya hapo, $0.005 *kwa kila njia*. Kwa faili moja, bure. Kwa kufuta maelfu ya faili wakati wa sasisho la wingi, gharama hujilundika.

**Chaguo la pili: Majina ya faili ya matoleo.** Badala ya `hero.jpg`, ipe faili jina `hero-v2.jpg`. Sasisha rejeleo katika hifadhidata. CloudFront haina ingizo lililowekwa akiba kwa `hero-v2.jpg` — ombi la kwanza huichota kutoka S3, na watumiaji huiona mara moja. `hero.jpg` ya zamani inabaki imewekwa akiba lakini hairejelewi popote tena. Inaisha kiasili baada ya siku saba.

"Kwa maudhui yaliyopakiwa na watumiaji," Priya alisema, "majina ya matoleo ndio mfumo sahihi. Ongeza hashi au muhuri wa muda kwa jina la faili. Kila upakiaji mpya ni ingizo jipya la akiba. Hakuna gharama ya invalidation, hakuna maudhui yaliyochakaa."

Leo alisasisha lango la mshirika. Upakiaji mpya sasa ungehifadhiwa kama `hero-{timestamp}.jpg`. Rekodi ya hifadhidata ilisasishwa na njia mpya. Njia ya zamani iliyowekwa akiba haikuwa na umuhimu.

"Vipi kuhusu kesi ya usambazaji?" Maya aliuliza. "Tunaposukuma toleo jipya la programu na JavaScript inabadilika?"

"Kanuni ileile," Priya alisema. "Zana za kujenga kama Webpack hutoa majina ya faili yenye hashi: `app.a3b9c2d4.js`. Sambaza toleo jipya na hashi inabadilika: `app.f7e1b3c5.js`. CloudFront huhudumia zote mbili kutoka akiba — watumiaji wa zamani hupata faili ya zamani, watumiaji wapya hupata faili mpya. Hakuna invalidation, hakuna tatizo la uratibu."

"Ukurasa wa HTML hurejelea hashi ya sasa," Leo alisema. "Kwa hivyo watumiaji wapya hupata HTML mpya yenye hashi mpya ya JS, na CDN huhudumia faili sahihi."

"Mazoezi ya kawaida," Priya alithibitisha.

---

**Ucheleweshaji kwa Namba Halisi**

Tom alikuwa akiendesha vipimo vya ucheleweshaji kutoka miji mitatu.

| Eneo | Bila CloudFront | Na CloudFront | Boresho |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| New York | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tokyo | 260ms | 28ms | 89% |

"Boresho ni kubwa zaidi pale ambapo tatizo la fizikia ni baya zaidi," Tom alibainisha. "São Paulo hadi Oregon ni zaidi ya milisekunde mia mbili. Hiyo ni zaidi ya robo sekunde, ili tu kuanza mazungumzo."

"Na maudhui hayafiki kamwe São Paulo mara ya pili," Leo alisema. "Mtumiaji wa kwanza katika São Paulo huchota kutoka Oregon na kuiweka akiba ndani. Kila mtumiaji baada ya hapo hupata milisekunde thelathini na tano."

"Mtumiaji wa kwanza katika São Paulo hubeba gharama," Tom alisema. "Kila mtu mwingine hunufaika."

"Hivyo ndivyo CDN zinavyofanya kazi," Priya alisema. "Ombi la kwanza hujaza akiba. Kila cache hit baada ya hapo ni karibu bure."

Maana yake kwa bidhaa za kimataifa ni kubwa. Bila CloudFront, mtumiaji katika Tokyo anayesubiri milisekunde 260 kwa picha yako ya hero anasubiri kwa sababu ya fizikia — kebo za fiber optic na kasi ya mwanga. Kwa CloudFront, unaweka nakala ya picha hiyo katika Tokyo, na tatizo la fizikia kwa hakika hutoweka.

---

**Origins Nyingi: ALB na S3 Pamoja**

"Tuna picha zetu kwenye S3 na API yetu kwenye load balancer," Maya alisema. "Tunahitaji usambazaji wa CloudFront miwili?"

"Hapana," Leo alisema. "Usambazaji mmoja, origins nyingi."

Usambazaji mmoja wa CloudFront unaweza kuelekeza mifumo tofauti ya URL kwa origins tofauti. Huu ni mfumo wa multi-origin:

```
eatnimbus.com/*         → Origin: ALB katika us-west-2 (maudhui yanayobadilika)
eatnimbus.com/images/*  → Origin: ndoo ya S3 (picha tuli)
eatnimbus.com/static/*  → Origin: ndoo ya S3 (CSS, JS, fonti)
```

CloudFront hutathmini behaviors kwa mpangilio wa umahususi. Ombi kwa `/images/hero.jpg` hulingana na behavior ya `/images/*` na huenda S3. Ombi kwa `/api/orders` hulingana na `/*` ya kunasa-yote na huenda ALB.

Faida: kikoa kimoja, cheti kimoja cha SSL, usambazaji mmoja wa CloudFront, backends nyingi. Watumiaji huona kikoa kimoja kilichounganishwa. Uelekezaji hauonekani kwao.

Undani mmoja wa kiutendaji ambao pia ni ukweli wa mtihani uliohakikishwa: cheti hicho cha SSL hutoka AWS Certificate Manager (ACM), na **cheti kinachotumiwa na CloudFront lazima kiombwe au kiingizwe katika `us-east-1`** — bila kujali origins zako zinaishi wapi. CloudFront ni huduma ya kimataifa ambayo control plane yake inaishi us-east-1; cheti kilichoko us-west-2 hakitaonekana tu kwenye orodha kunjuzi ya usambazaji. (Kwa huduma za kieneo kama ALB, cheti huishi katika eneo la ALB lenyewe.)

"Na ALB haikabili umma?" Priya aliuliza.

"CloudFront pekee ndiyo huzungumza na ALB," Leo alisema. "Tunazuia kikundi cha usalama cha ALB kwa orodha ya kiambishi inayosimamiwa ya CloudFront. Miunganisho ya moja kwa moja kwa ALB kutoka intaneti imezuiwa."

"Kwa hivyo njia pekee ya kufikia programu ni kupitia CloudFront."

"Ambayo inamaanisha kanuni za WAF, ukomeshaji wa SSL, na ulinzi wa DDoS hutumika kwa trafiki yote kabla ya kutufikia."

---

**CloudFront Functions dhidi ya Lambda@Edge**

"Tumefikiria tungefanya nini ikiwa tungehitaji kuandika upya URL ukingoni?" Priya aliuliza. "Au kuongeza kichwa cha usalama kwa kila jibu?"

"Hatuwezi kufanya hilo katika programu?" Leo aliuliza.

"Tunaweza. Lakini ikiwa litatokea ukingoni — kabla CloudFront kuhudumia kutoka akiba — tunaokoa safari ya kwenda na kurudi kwa origin."

CloudFront inaunga mkono mbinu mbili za kuendesha msimbo ukingoni:

**CloudFront Functions** ni vitendaji vyepesi vya JavaScript vinavyoendesha katika kila edge location. Hutekeleza kwa muda chini ya milisekunde, hushughulikia mamilioni ya maombi kwa sekunde, na vimebuniwa kwa mabadiliko rahisi: kuandika upya URL, kudanganya vichwa, kusawazisha query strings, kuelekeza upya rahisi. Vinaweza kuendesha kwenye maombi ya mtazamaji na majibu ya mtazamaji (kabla na baada ya akiba, kutoka mtazamo wa mtumiaji). Haviwezi kufanya miito ya mtandao. Gharama: $0.10 kwa kila milioni ya uamshaji.

**Lambda@Edge** huendesha vitendaji halisi vya Lambda katika edge locations za kieneo za CloudFront (si kila pop, bali dazeni za kuu kimataifa). Lambda@Edge inaweza kufanya miito ya mtandao, kufikia hifadhidata, kuzalisha majibu yanayobadilika, kufanya mantiki changamano ya uthibitishaji. Inaendesha kwenye maombi ya mtazamaji, maombi ya origin, majibu ya origin, na majibu ya mtazamaji — ikikupa pointi nne za uingiliaji katika mzunguko wa maisha ya ombi. Gharama: ya juu kuliko CloudFront Functions, hutozwa kwa kila ombi na muda.

Mfano wa kiakili:

| Kesi ya matumizi | Zana |
|---|---|
| Andika upya `/old-path` kuwa `/new-path` | CloudFront Functions |
| Ongeza kichwa cha `Strict-Transport-Security` | CloudFront Functions |
| Sawazisha query strings kabla ya utafutaji wa akiba | CloudFront Functions |
| Jaribio la A/B: weka kuki ya jaribio kwenye ombi la mtazamaji | CloudFront Functions |
| Jaribio la A/B: elekeza 10% ya watumiaji kwa origin tofauti | Lambda@Edge (ombi la origin — CloudFront Functions haziwezi kubadilisha origin) |
| Thibitisha tokeni ya JWT (inahitaji maktaba ya kripto) | Lambda@Edge |
| Chota maudhui ya kibinafsi kutoka hifadhidata ukingoni | Lambda@Edge |
| Zalisha kijipicha cha picha papo hapo ukingoni | Lambda@Edge |

Kwa Nimbus: walitumia CloudFront Function kuongeza vichwa vya usalama kwa kila jibu — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Mistari dazeni mbili ya JavaScript. Utekelezaji chini ya milisekunde. Hakuna safari ya kwenda na kurudi kwa origin iliyohitajika.

"Ingechukua muda mrefu zaidi kuelezea vichwa kwa mhandisi mdogo," Leo alisema, "kuliko kuandika kitendaji."

---

**Price Classes: Kuchagua Edge Locations Zipi**

"Tumefikiria hii inagharimu nini kwa kiwango kikubwa?" Tom aliuliza, akisogeza ukurasa wa bei wa CloudFront.

"Hilo linagharimu kiasi gani kwa mwezi?" kiufundi yalikuwa maswali mawili hapa. La kwanza: CloudFront inatoza nini? La pili: je, unahitaji kila edge location duniani?

Bei ya uhamishaji wa data wa CloudFront hutofautiana kwa eneo. Trafiki inayohudumiwa kutoka edge locations katika Amerika Kaskazini na Ulaya ni nafuu zaidi. Trafiki kutoka Amerika Kusini, Asia Pasifiki, Australia, na India ni ghali zaidi — kwa sababu miundombinu inagharimu zaidi huko.

AWS hukuruhusu kuchagua **price class** kwa usambazaji wako:

- **Price Class All**: Hutumia edge locations zote kimataifa. Utendaji bora kila mahali. Gharama ya juu zaidi ya uhamishaji wa data kwa maeneo nje ya Amerika Kaskazini na Ulaya.
- **Price Class 200**: Hutumia edge locations nyingi (Amerika Kaskazini, Ulaya, Asia, Mashariki ya Kati, Afrika). Haijumuishi maeneo ya gharama kubwa zaidi ya Amerika Kusini na baadhi ya Oceania.
- **Price Class 100**: Hutumia edge locations za Amerika Kaskazini na Ulaya pekee. Nafuu zaidi. Watumiaji katika São Paulo, Tokyo, na Sydney bado wanahudumiwa — lakini kutoka edge ya Amerika Kaskazini au Ulaya, si iliyo karibu zaidi yao.

"Kwa hivyo tukichagua Price Class 100," Tom alisema, "mtumiaji katika São Paulo anahudumiwa kutoka... Miami? New York?"

"Popote edge iliyo karibu zaidi iliyojumuishwa ilipo. Pengine milisekunde 50 badala ya milisekunde 230 moja kwa moja hadi Oregon," Priya alisema. "Bado boresho la maana. Si nzuri kama Price Class All."

"Na tofauti ya gharama?"

"Uhamishaji wa data nje ya Amerika Kusini ni karibu mara mbili ya gharama ya Amerika Kaskazini. Kwa kampuni changa bado ikijenga trafiki, Price Class 200 ni maelewano ya busara — unapata Asia na Ulaya kwa gharama ya chini kuliko Price Class All, na watumiaji wako wengi wamefunikwa."

"Anza na 200," Tom alisema. "Tutakapokuwa na data halisi ya trafiki kutoka kila eneo, tutaamua kama All inastahili."

Price class sahihi inategemea watumiaji wako wako wapi. Ikiwa huna watumiaji Amerika Kusini, kulipia edge locations za Amerika Kusini ni gharama tupu. Ikiwa asilimia ishirini ya mapato yako yanatoka Brazil, boresho la utendaji kutoka Price Class All pengine hujilipia.

---

**Ubunifu wa Cache Key**

"Tumefikiria kinachotokea wakati watumiaji wawili tofauti wanaomba URL ileile lakini wanapata maudhui tofauti?" Priya aliuliza.

Leo akafikiria. "Kurasa za kibinafsi."

"Au kurasa mahususi za lugha. Au matoleo ya simu dhidi ya kompyuta. Au kurasa zinazotofautiana kwa kuki."

Kwa chaguomsingi, CloudFront hutumia njia ya URL pekee kama cache key. Maombi mawili kwa `/browse` hupata jibu lilelile lililowekwa akiba, bila kujali upendeleo wa lugha wa mtumiaji, aina ya kifaa, au kuki ya kipindi.

Ikiwa programu yako huhudumia maudhui tofauti kulingana na query strings, vichwa, au vidakuzi — na unataka CloudFront iweke akiba tofauti za tofauti hizo — unahitaji kujumuisha sifa hizo katika **cache key**.

Kwa Nimbus:

- `/browse?city=miami` inapaswa kuwekwa akiba tofauti na `/browse?city=boston` — orodha tofauti za mikahawa. Jumuisha query strings katika cache key.
- Watumiaji wa simu wanaweza kupata mpangilio tofauti. Jumuisha aina ya kifaa iliyosawazishwa (iliyotokana na kichwa cha `User-Agent`) katika cache key.
- Kichwa cha `Accept-Language` huamua ukurasa unatoa katika lugha gani. Jumuisha katika cache key.

Kuwa makini, hata hivyo. Kila sifa ya cache key unayoongeza huunda tofauti zaidi za akiba. Ukijumuisha mfuatano mzima wa `User-Agent` (unaotofautiana kwa toleo la kivinjari, toleo la OS, na kiwango cha patch), kwa hakika unavunja kuweka akiba — kila mtumiaji ana User-Agent tofauti kidogo, kwa hivyo kila ombi ni cache miss.

Nidhamu: sawazisha kabla ya kuweka akiba. Punguza "iPhone 15 Pro Safari 17.4.1" kuwa "mobile." Punguza lugha zote zinazokubaliwa kuwa mbili au tatu unazounga mkono kwa hakika. Jumuisha tu kile kinachobadilisha jibu kwa kweli.

"Kadiri cache key yako inavyokuwa mahususi zaidi," Leo alisema, "ndivyo kiwango chako cha hit kinavyokuwa kibaya zaidi."

"Na kadiri inavyokuwa ya jumla zaidi," Priya alisema, "ndivyo uwezekano unavyoongezeka wa kuhudumia maudhui yasiyo sahihi kwa mtumiaji asiye sahihi."

"Kwa hivyo ubunifu wa cache key ni maafikiano yaleyale kama kila kitu kingine katika kuweka akiba."

"Ndiyo," Priya alisema. "Daima ni maafikiano yaleyale."

---

## Wakati CloudFront Si Jibu: Global Accelerator

Programu ya simu ya Nimbus ilikuwa na kipengele ambacho Tom alikuwa akiangalia kimya kwa miezi miwili: hali ya agizo ya wakati halisi. Mteja alipoweka agizo, programu ilibaki imeunganishwa kupitia WebSocket na skrini ya usimamizi wa maagizo ya jiko ilisasishwa kwa wakati halisi. Hakuna kitufe cha kuburudisha. Hakuna polling. Muunganisho hai uliosukuma masasisho papo hapo jiko lilipoweka alama kitu kuwa tayari.

"Hii inatumia WebSockets," Tom alisema, akiangalia vipimo vya ucheleweshaji asubuhi moja. "Kutoka watumiaji katika São Paulo, kuanzisha muunganisho kunachukua milisekunde 340. Kuna kitu kinachoshindwa."

"CloudFront haiweki akiba miunganisho ya WebSocket," Leo alisema. "Inaipitisha — inaipeleka kwa origin. Hakuna faida ya kuweka akiba."

"Sahihi. Kwa hivyo kwa nini bado ni polepole?"

"Kwa sababu WebSocket bado inasafiri kutoka São Paulo hadi seva zetu Oregon juu ya intaneti ya umma," Leo alisema. "CloudFront husaidia, kwa sababu inakomesha kupeana mkono kwa TLS ukingoni na kisha kutumia uti wa mgongo wa AWS hadi origin. Lakini kwa muunganisho wa kudumu wa WebSocket, huo bado ni muunganisho wa umbali mrefu."

"Kuna huduma kwa tatizo hili haswa," Priya alisema.

**AWS Global Accelerator** si CDN. Haiweki akiba chochote. Haihudumii maudhui kutoka edge locations. Kile inachofanya ni kukupa anwani mbili tuli za Anycast IP ambazo zinatangazwa kimataifa kutoka edge locations zote za AWS kwa wakati mmoja — na kisha kuelekeza trafiki ya watumiaji wako juu ya uti wa mgongo wa kibinafsi wa AWS badala ya intaneti ya umma.

Wakati mteja katika São Paulo anapofungua programu ya Nimbus, kifaa chao huunganisha kwa edge location ya AWS iliyo karibu zaidi (ambayo inaweza kuwa São Paulo yenyewe). Kutoka edge location hiyo, trafiki husafiri hadi seva za Nimbus Oregon juu ya mtandao wa fiber wa kibinafsi, unaofuatiliwa, ulioboreshwa wa AWS — si juu ya intaneti ya umma ambapo pakiti hudunda kupitia wabebaji wasiotabirika na hops za uelekezaji.

Intaneti ya umma haijabuniwa kwa ucheleweshaji. Imebuniwa kwa ustahimilivu — pakiti zinaweza kuchukua njia yoyote inayopatikana. Uti wa mgongo wa AWS umebuniwa tofauti: ni wa moja kwa moja, wenye msongamano mdogo, na chini ya udhibiti wa kiutendaji wa AWS.

Tom alipima tofauti.

| Njia | Ucheleweshaji (São Paulo hadi Oregon) |
|---|---|
| Intaneti ya umma | 340ms |
| Kupitia Global Accelerator | 180ms |

Punguzo la 47%. Si kutoka kuweka akiba — kutoka njia bora ya mtandao.

"Basi kwa nini tusitumie tu CloudFront kwa kila kitu?" Maya aliuliza. "CloudFront tayari huelekeza kupitia uti wa mgongo wa AWS kwa maudhui yanayobadilika."

"CloudFront ni HTTP na HTTPS pekee," Priya alisema. "WebSockets hufanya kazi na CloudFront, lakini kupitia uboreshaji wa HTTP tu. Na baadhi ya protokoli zetu — data ya kihisi cha IoT, kwa mfano — ni TCP au UDP safi. CloudFront haishughulikii hizo. Global Accelerator haijali protokoli. TCP, UDP, WebSockets, chochote. Inasogeza pakiti, si maombi ya HTTP."

Kulikuwa na tofauti nyingine ambayo Priya aliibainisha katika nyaraka zake za usalama.

"Global Accelerator hutupa Anycast IP mbili tuli," alisema. "IP hizo hazibadiliki kamwe. Hilo linamaanisha tunaweza kuziongeza kwenye sera yetu ya usalama, kuziongeza kwenye orodha za ruhusa za washirika, kuziongeza kwenye kanuni za firewall. Anwani za IP za CloudFront hubadilika kwa muda — zinasimamiwa na AWS na hazijawekwa imara."

"Vipi kuhusu failover?" Leo aliuliza.

"Papo hapo," Priya alisema. "Ikiwa programu yetu ya us-west-2 itakuwa na tatizo, Global Accelerator inaweza kuhamisha trafiki kwa chelezo katika us-east-1 kwa chini ya sekunde 30 — bila kubadilisha anwani ya IP ambayo watumiaji wanaunganisha kwayo. Failover ya DNS kupitia Route 53 huchukua sekunde 60-300 kutegemea TTL. Global Accelerator ni ya haraka zaidi."

**CloudFront dhidi ya Global Accelerator — mfano wa kiakili:**

CloudFront huboresha uwasilishaji kwa kuweka akiba. Imejengwa kwa HTTP/HTTPS na faida ni kubwa zaidi wakati maudhui yanaweza kuwekwa akiba karibu na watumiaji — faili tuli, picha, JavaScript. Wakati maudhui hayawezi kuwekwa akiba, CloudFront bado husaidia kupitia uelekezaji wa uti wa mgongo, lakini boresho ni dogo.

Global Accelerator huboresha uwasilishaji kwa uelekezaji. Haisogezi maudhui yoyote. Haiweki akiba chochote. Faida inatumika kwa kila pakiti — iliyowekwa akiba au la, HTTP au la, tuli au inayobadilika. IP mbili tuli hufanya kazi kimataifa. Failover ni karibu papo hapo. Kesi za matumizi ambapo CloudFront haitoshi — WebSockets za wakati halisi, protokoli zinazoegemea UDP, trafiki isiyo ya HTTP, programu za kimataifa zinazohitaji IP zisizobadilika — ndipo Global Accelerator ndiyo zana sahihi.

Tom alisasisha programu ya simu ya Nimbus kuunganisha kwa endpoint ya Global Accelerator kwa kipengele cha hali ya agizo ya wakati halisi. Kuanzisha muunganisho wa WebSocket katika São Paulo kulishuka kutoka 340ms hadi 180ms. Masasisho ya jiko bado yalihisi papo hapo — kwa sababu sasa, kwa watumiaji nje ya Amerika Kaskazini, yalikuwa kweli.

## Nguvu na Mapungufu

**Kwa nini CloudFront ina nguvu**:

- Zaidi ya pointi 750 za uwepo katika miji 100+ — watumiaji wengi hupata maudhui kutoka umbali wa <20ms
- Maudhui tuli yanayohudumiwa kwa milisekunde ya tarakimu moja baada ya akiba ya kwanza
- Hupunguza mzigo wa origin kwa kiasi kikubwa (trafiki ya kurudia haifiki kamwe seva zako)
- Imeunganishwa na AWS Shield, WAF, na Certificate Manager
- Hakuna upangaji wa kapasiti unaohitajika — CloudFront hupanuka kiotomatiki
- Usambazaji wa multi-origin huelekeza njia tofauti kwa backends tofauti kutoka kikoa kimoja
- CloudFront Functions hushughulikia mantiki nyepesi ya ukingo kwa ucheleweshaji chini ya milisekunde

**Pale inapokuwa ngumu**:

- Maudhui yaliyowekwa akiba yanaweza kuchakaa — kufuta akiba hugharimu pesa ($0.005 kwa kila njia baada ya njia 1,000 za bure kila mwezi). Tumia majina ya faili ya matoleo badala yake.
- Vichwa vya Cache-Control lazima viwekwe kwa usahihi katika origin — makosa husababisha maudhui yaliyochakaa
- Maudhui yanayobadilika hunufaika kutoka kwa uboreshaji wa uelekezaji lakini si kutoka kuweka akiba
- Kutatua tabia ya akiba (nini kimewekwa akiba wapi, kwa muda gani) kunahitaji kuelewa tabaka nyingi: vichwa vya origin, mipangilio ya TTL ya CloudFront, kanuni za behavior
- Uhamishaji wa data nje kupitia CloudFront hugharimu pesa, ingawa kidogo kuliko uhamishaji wa data wa kawaida
- Ubunifu wa cache key unahitaji fikra makini — mahususi sana huvunja kuweka akiba, ya jumla sana huhudumia maudhui yasiyo sahihi

## Muhtasari

CloudFront haikubadilisha fizikia. Mwanga bado husafiri kwa kasi ileile. Lakini ilibadilisha pale jibu lilipoishi — na kwa watumiaji wengi, jibu sasa lilikuwa milisekunde chache mbali badala ya mia chache. Kiwango cha cache hit baada ya usambazaji: 83%. Hilo lilimaanisha 830,000 kati ya kila milioni ya maombi hayakufika kamwe seva za origin. Watumiaji katika São Paulo walienda kutoka milisekunde 290 hadi milisekunde 35. Watumiaji katika Tokyo kutoka 260 hadi 28.

- **CDN** huweka akiba nakala za maudhui yako katika edge locations karibu na watumiaji wako — ikipunguza ucheleweshaji na mzigo wa origin.
- **CloudFront** ni CDN ya AWS, yenye pointi 750+ za uwepo kimataifa.
- Cache misses huchota kutoka **origin** (S3, ALB, EC2). Cache hits huhudumia kutoka ukingoni — milisekunde, si mamia ya milisekunde.
- **Behaviors** hukuruhusu kuweka kanuni tofauti za kuweka akiba kwa mifumo tofauti ya URL. Usambazaji mmoja unaweza kuhudumia `/images/*` kutoka S3 na `/*` kutoka ALB.
- Maudhui yanayobadilika hayawekwi akiba, lakini CloudFront bado huboresha utendaji kupitia mtandao wa uti wa mgongo wa kibinafsi wa AWS.
- **Epuka maudhui yaliyochakaa** kwa kutumia majina ya faili ya matoleo (k.m., `hero-v2.jpg`) badala ya invalidations — nafuu na ya kuaminika zaidi.
- **CloudFront Functions** hushughulikia mantiki nyepesi ya ukingo (kudanganya vichwa, kuandika upya URL) kwa kasi chini ya milisekunde. **Lambda@Edge** hushughulikia uchakataji mzito unaohitaji miito ya mtandao.
- **Price classes** hukuruhusu kudhibiti edge locations zipi huhudumia trafiki yako — na hivyo gharama yako ya uhamishaji wa data.
- **Ubunifu wa cache key** huamua sifa zipi za ombi huunda tofauti za akiba. Funguo mahususi zaidi = kiwango cha hit cha chini. Mahususi kidogo = hatari ya kuhudumia maudhui yasiyo sahihi.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03: Buni Usanifu wa Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.4)*

- **CloudFront + S3**: Mfumo wa kawaida wa mtihani wa kuhudumia tovuti tuli kimataifa. Ndoo ya S3 kama origin, CloudFront kama CDN, Origin Access Control kuzuia ufikiaji wa moja kwa moja wa S3.
- **Edge locations dhidi ya Maeneo dhidi ya AZ**: Edge locations ni nyingi zaidi na zipo kwa madhumuni ya kuweka akiba/CDN pekee. Si sawa na AZ (zinazoendesha kompyuta yako).
- **Cache invalidation**: Huunda invalidation ya `/images/*` kulazimisha CloudFront kuchota maudhui mapya. Hugharimu pesa — mtihani unaweza kuomba mbadala wa gharama nafuu: URL za matoleo (`image-v2.jpg` badala ya `image.jpg`), zinazokwepa akiba kiasili.
- **Udhibiti wa TTL**: `Cache-Control: max-age=3600` katika origin huweka TTL ya akiba ya saa 1. CloudFront huheshimu vichwa hivi. TTL ya chini, TTL ya juu, na TTL ya chaguomsingi zinaweza pia kuwekwa katika behavior ya usambazaji.
- **CloudFront Functions dhidi ya Lambda@Edge**: CloudFront Functions huendesha ukingoni kwa udanganyaji nyepesi wa ombi/jibu (chini ya milisekunde). Lambda@Edge huendesha msimbo wako wa Lambda katika edge locations za kieneo kwa uchakataji mzito. Mtihani huzitofautisha kwa ugumu wa kesi ya matumizi. CloudFront Functions haziwezi kufanya miito ya mtandao; Lambda@Edge inaweza.
- **Signed URLs na Signed Cookies**: Dhibiti nani anaweza kufikia maudhui kupitia CloudFront. Signed URLs hutoa ufikiaji wa faili mahususi; signed cookies hutoa ufikiaji wa faili nyingi. Mtihani hutumia haya kwa "maudhui ya mteja anayelipa."
- **Price Class**: Mtihani unaweza kuuliza price class ipi ya kuchagua kwa hadhira ya kimataifa dhidi ya hadhira ya Amerika Kaskazini/Ulaya. Price Class All = utendaji bora, gharama ya juu zaidi. Price Class 100 = Amerika Kaskazini na Ulaya pekee, gharama ya chini zaidi.
- **Cache key**: Cache key ya chaguomsingi ni URL. Kuongeza query strings, vichwa, au vidakuzi kwa cache key huunda tofauti za akiba — lakini huongeza kiwango cha cache miss. Mtihani unaweza kuwasilisha hali ambapo maudhui hutofautiana kwa parameta ya query na kuuliza jinsi ya kusanidi kuweka akiba.
- **Origin failover**: CloudFront inaunga mkono kundi la origin lenye origin kuu na ya pili. Ikiwa origin kuu itarudisha kosa la 5xx, CloudFront hujaribu tena kiotomatiki na ya pili. Tofauti na failover ya Route 53 — hii ni ndani ya usambazaji mmoja wa CloudFront.
- **Behaviors za multi-origin**: Usambazaji mmoja unaweza kuelekeza `/images/*` kwa S3 na `/*` kwa ALB. Mtihani unaweza kuwasilisha hili kama "jinsi ya kuhudumia maudhui tuli na yanayobadilika kutoka kikoa kimoja bila usambazaji miwili."
- **CloudFront dhidi ya Global Accelerator**: CloudFront = CDN ya HTTP/HTTPS, huweka akiba maudhui katika edge locations, hupunguza mzigo wa origin, bora kwa maudhui tuli na yanayoweza kuwekwa akiba. Global Accelerator = protokoli yoyote ya TCP/UDP, haiweki akiba chochote, huelekeza trafiki juu ya uti wa mgongo wa kibinafsi wa AWS, hutoa Anycast IP mbili tuli, inaunga mkono failover ya kieneo karibu papo hapo. Kiamsha cha mtihani: "boresha ucheleweshaji kwa trafiki isiyo ya HTTP" au "IP tuli kwa programu ya kimataifa" au "utendaji wa WebSocket kwa watumiaji wa kimataifa" au "failover ya kieneo ya haraka kuliko DNS" → Global Accelerator. "Hudumia faili tuli kimataifa kwa ucheleweshaji wa chini" → CloudFront.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya cache hit ya CloudFront na cache miss. Nini hutokea katika kila kesi?

*(Kidokezo: Fikiria kuhusu maudhui yanakotoka, na jinsi muda wa majibu unavyotofautiana kati ya kesi hizo mbili.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ya programu husambaza faili kubwa za visakinishi (~GB 2 kila moja) kutoka ndoo ya S3 kwa wateja duniani kote. Kasi za upakuaji ni za polepole kwa wateja katika Asia. Timu inataka kuboresha utendaji bila kunakili ndoo ya S3 kwa maeneo mengi. Pia wanahitaji kuhakikisha kuwa wateja wanaolipa pekee ndio wanaweza kupakua visakinishi.

Ni suluhisho gani linalokidhi mahitaji haya BORA zaidi?

A) Washa S3 Transfer Acceleration kwenye ndoo na uzalishe pre-signed URLs kwa wateja wanaolipa  
B) Tumia CloudFront na ndoo ya S3 kama origin, washa Origin Access Control, na utumie CloudFront Signed URLs kwa wateja wanaolipa  
C) Unda ndoo ya S3 katika kila eneo la AWS na utumie uelekezaji wa geolocation wa Route 53 kuelekeza wateja kwa ndoo iliyo karibu zaidi  
D) Tumia Application Load Balancer katika kila eneo yenye vihalisi vya EC2 vinavyohudumia faili za visakinishi

**Kidokezo cha 1**: Hitaji ni kuboresha utendaji wa kimataifa *bila* kunakili ndoo. Ni chaguo gani halihitaji ndoo nyingi?

**Kidokezo cha 2**: Ni huduma gani inayodhibiti haswa nani anaweza kufikia maudhui yanayohudumiwa kupitia CloudFront?

**Kidokezo cha 3**: S3 Transfer Acceleration imeboreshwa kwa upakiaji wa umbali mrefu *kwenda* S3. Kwa kuwasilisha maudhui *kutoka* S3 kwa watumiaji wa mwisho kimataifa, CloudFront ndiyo zana sahihi.

**Jibu**: B

**Maelezo**: CloudFront huweka akiba faili za visakinishi katika edge locations kimataifa baada ya upakuaji wa kwanza. Vipakuzi vinavyofuata kutoka eneo lilelile hutoka ukingoni — haraka zaidi kuliko kuvuka Pasifiki kutoka S3 katika us-west-2. Origin Access Control huhakikisha ndoo ya S3 inafikika tu kupitia CloudFront. Signed URLs huzuia ufikiaji kwa wateja wanaolipa.

**Kwa nini si A?** S3 Transfer Acceleration imeboreshwa kwa upakiaji wa umbali mrefu *kwenda* S3 — si kwa kusambaza maudhui *kutoka* S3 kwa hadhira ya kimataifa. Kwa hilo, CloudFront ndiyo zana sahihi. Pre-signed URLs hudhibiti ufikiaji lakini haziboreshi utendaji wa kimataifa.

**Kwa nini si C?** Kuunda ndoo ya S3 kwa kila eneo hufanya kazi kwa utendaji, lakini inakinzana na hitaji la kuepuka unakili. Pia inahitaji mkakati wa usawazishaji wa data katika ndoo zote.

**Kwa nini si D?** Vihalisi vya EC2 nyuma ya load balancer katika kila eneo ni ghali zaidi kwa kiasi kikubwa kuliko CloudFront na huhitaji kusimamia seva katika maeneo mengi.

*Kikoa cha SAA-C03: Buni Usanifu wa Utendaji wa Juu — Kazi ya 3.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inataka kuongeza maudhui ya video — video fupi za mafunzo ya upishi kutoka kwa washirika wa mikahawa. Video zinaweza kuwa 50-500MB. Wanatarajia video ileile kutazamwa na maelfu ya watumiaji katika jiji lilelile ndani ya saa chache baada ya kuchapishwa.

Buni usanifu wa uhifadhi na uwasilishaji. Je, ungetumia S3 na CloudFront? Ungeshughulikiaje ombi la kwanza (cold start) kupunguza ucheleweshaji kabla ya video kuwekwa akiba? Ungeweka TTL gani ya akiba kwa video isiyobadilika baada ya kuchapishwa?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya maamuzi ya kubuni CDN.)*

## Onyesho la Baada ya Mikopo

"Tayari niliisambaza — oh." Leo alikuwa ameelekeza usambazaji wa CloudFront kwa origin isiyo sahihi — ndoo ya S3 ya maendeleo badala ya ya uzalishaji. Kwa karibu dakika nne, baadhi ya watumiaji wa Pwani ya Magharibi walikuwa wameona toleo la zamani la programu. Alikuwa amerekebisha mipangilio ya origin, akafuta akiba, na akasasisha kwa kimya kumbukumbu ya tukio.

Priya aliangalia vipimo vya CloudFront baada ya usambazaji.

Kiwango cha cache hit: 83%.

"Hilo lina maana gani?" Tom aliuliza.

"Inamaanisha 83% ya watumiaji wetu wanapata maudhui kutoka edge location karibu nao, si kutoka us-west-2."

"Na wengine 17%?"

"Maombi ya mara ya kwanza. Maudhui ambayo bado hayajawekwa akiba katika edge location hiyo."

Tom alikodolea macho vipimo. "Kwa hivyo tunahudumia karibu milioni moja ya maombi kwa siku kutoka nodi za ukingo za CloudFront. Na ni 170,000 pekee kati ya hizo zinazogonga seva zetu kwa hakika."

"Ndiyo."

"Kwa hivyo kama tusingekuwa na CloudFront, seva zetu zingekuwa zikishughulikia milioni moja ya maombi."

"Kwa milisekunde 140-160 kila moja, kwa watumiaji wa kimataifa."

Tom akaketi nyuma. Alikuwa na sura ambayo Maya aliitambua — sura ya mtu anayehesabu upya gharama kwa wakati halisi.

"Hii inastahili," alisema.

Maya alikuwa tayari kwenye laptop yake. "Wahandisi wawili wapya wanajiunga nasi wiki ijayo. Soo-Jin kutoka timu ya jukwaa katika kampuni yake ya mwisho, na Rafael — alibobea katika usalama. Ninataka waingizwe kwenye IAM kabla ya siku yao ya kwanza."

"IAM ya kina?" Leo aliuliza.

"Majukumu, sera, ufikiaji wa akaunti tofauti. Mambo halisi."

Katika sura inayofuata: idhini za kina zinazoruhusu sehemu moja ya mfumo kuzungumza na nyingine — kwa usalama.
