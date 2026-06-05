# Sura ya 13: Funga Popote

Picha inayosafiri kutoka kwa seva huko Virginia hadi kwa simu huko Seattle huvuka takriban kilomita 4,400 za kebo ya fiber optic. Katika theluthi mbili ya kasi ya mwanga, hiyo ni takriban milisekunde 25 za fizikia safi - haiwezi kuepukika, isiyoweza kujadiliwa, iliyowekwa katika sheria za ulimwengu.

Kisha ongeza safari ya kwenda na kurudi. Kisha ongeza muda wa usindikaji. Kivinjari bado hakijaanza kutoa na milisekunde 80 tayari zimetoweka.

`eatnimbus.com` alikuwa hewani. Leo alikuwa amekagua vipimo vya kusubiri kutoka kwa watumiaji wa Pwani ya Magharibi: milisekunde 80-100 kwa kila ombi. Hiyo inaweza kuonekana kuwa ndogo, lakini inachanganya.

Pakia menyu: 90ms. Pakia orodha ya mikahawa: 80ms. Pakia picha za mkahawa: 200ms (picha ni kubwa). Jumla ya muda kabla ya mtumiaji kuagiza: zaidi ya nusu ya sekunde kwenye muunganisho mzuri.

"Fizikia ndio shida," Leo alisema. "Seva ziko Virginia. Watumiaji wako kwenye Pwani ya Magharibi."

"Kwa hivyo sogeza seva hadi Pwani ya Magharibi," Tom alisema.

"Hiyo inagharimu pesa."

"Kiasi gani?"

"Mengi. Na inazua tatizo jipya kabisa: kuweka hifadhidata ya Pwani ya Mashariki na hifadhidata ya Pwani ya Magharibi katika kusawazisha."

Priya akatazama juu kutoka kwenye kompyuta yake ya mkononi. "Au hatusongezi seva. Tunahamisha *maudhui*."

**Mlinganisho wa Ghala Lililowekwa Awali**

Fikiria Amazon muuzaji, si kampuni ya wingu. Wana ghala kubwa katika eneo moja na kila bidhaa. Ikiwa wangesafirisha kila agizo kutoka kwa ghala hilo moja, wateja katika miji ya mbali wangesubiri kwa siku kadhaa.

Badala yake, Amazon ina vituo vya utimilifu karibu na vituo vikuu vya idadi ya watu. Bidhaa inapokuwa maarufu, huhifadhi ghala hizo za ndani mapema. Mteja aliye Seattle anapoagiza kitabu, husafirishwa kutoka kituo cha utimilifu cha ndani - si kutoka Virginia.

Huu ni **Mtandao wa Uwasilishaji wa Maudhui (CDN)**: mtandao wa seva zinazosambazwa kijiografia ambazo huhifadhi nakala za maudhui yako karibu na watumiaji wako.

Mtumiaji aliye Seattle anapoomba ukurasa wako wa nyumbani, CDN huihudumia kutoka kwa seva iliyoko Seattle. Sio Virginia. Ombi hilo halivuki nchi nzima.

**Kutana na CloudFront**

Amazon CloudFront ni CDN ya AWS. Inafanya kazi kupitia mtandao wa kimataifa wa **maeneo makali** - seva za akiba zilizowekwa katika miji kote ulimwenguni. Kufikia uandishi huu, kuna maeneo zaidi ya 500 katika miji 90+.

Unaposanidi CloudFront, unabainisha **asili**: chanzo cha maudhui yako halisi. Asili yako inaweza kuwa:

- Ndoo ya S3 (faili tuli: picha, CSS, JavaScript, PDFs)
- Usawazishaji wa Mzigo wa Maombi (maudhui yenye nguvu kutoka kwa programu yako)
- Mfano wa EC2
- Seva ya HTTP popote kwenye mtandao

CloudFront inakaa mbele ya asili yako. Maombi huja katika eneo la karibu la ukingo. Ikiwa ukingo una maudhui yaliyohifadhiwa, hurejesha mara moja. Ikiwa sivyo (*cache miss*), huchota kutoka asili yako, huihifadhi, na kuirejesha.

**Jinsi Uhifadhi wa CloudFront Hufanya kazi**

Ombi la kwanza la kipande chochote cha maudhui huwa halikosi akiba - huenda kwenye asili. Kila ombi linalofuata hugusa akiba kwenye eneo la ukingo.

Kwa Nimbus, picha za menyu ni wagombeaji kamili wa CloudFront. Picha za mkahawa hubadilika mara kwa mara (labda mgahawa unaposasisha wasifu wao). Na CloudFront:

1. Mtumiaji aliye Seattle anaomba `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront hukagua eneo la ukingo huko Seattle - bado halijawekwa (cache miss)
3. CloudFront huchota kutoka S3 nchini us-mashariki-1 (~80ms)
4. CloudFront huhifadhi picha katika eneo la Seattle
5. Mtumiaji anayefuata katika Seattle anaomba picha sawa
6. CloudFront hutumika kutoka kwa akiba ya ukingo wa karibu (~5ms)

Adhabu sawa ya 80ms kwa ombi la kwanza. Lakini ombi la elfu moja kutoka kwa mji huo huo ni milisekunde 5.

**Vijajuu vya Udhibiti wa Akiba** na **mipangilio ya TTL** katika CloudFront huamua muda ambao maudhui hukaa kwenye akiba ukingoni. Faili za picha zinaweza kuhifadhiwa kwa saa au siku. Kurasa za HTML (ambazo hubadilika mara nyingi zaidi) zinaweza kuhifadhiwa kwa dakika au sekunde.

**Maudhui Yanayobadilika: CloudFront kwa Zaidi ya Uhifadhi**

"Lakini vipi kuhusu majibu yetu ya API?" Leo aliuliza. "Hizo ni zinazobadilika - hubadilika kwa kila mtumiaji, kwa kila ombi. Huwezi kuweka akiba ya ukurasa wa historia ya agizo."

Kweli. Lakini CloudFront bado husaidia na maudhui yenye nguvu.

Hata wakati maudhui hayawezi kuhifadhiwa, CloudFront huelekeza ombi kutoka eneo la ukingo hadi asili kupitia mtandao wa uti wa mgongo wa AWS - nyuzinyuzi zenye kasi ya juu zinazounganisha miundombinu ya AWS duniani kote. Hii ni haraka na inategemewa zaidi kuliko kuelekeza kwenye mtandao wa umma, ambapo trafiki inaweza kupita kwa watoa huduma wengi.

Matokeo: maombi yanayobadilika bado yana kasi ya 20-40% kupitia CloudFront kuliko kwenda moja kwa moja kwenye asili kwenye mtandao wa umma. Sio kwa sababu ya caching, lakini kwa sababu ya njia ya mtandao.

Kwa kuongeza, CloudFront hutoa:

**Kukomesha SSL/TLS**: CloudFront inashughulikia HTTPS ukingoni. Muunganisho kati ya mtumiaji na CloudFront umesimbwa kwa njia fiche. CloudFront inaweza kuunganisha kwenye asili yako kupitia HTTP ndani (kupunguza upakiaji asili) au HTTPS (kwa usimbaji fiche kutoka mwanzo hadi mwisho).

**Ulinzi wa DDoS**: CloudFront imeunganishwa na AWS Shield Standard. Trafiki iliyosambazwa katika mamia ya maeneo ya ukingo inamaanisha kuwa mashambulizi yanamezwa ukingoni badala ya kukanyaga asili yako.

**Kizuizi cha kijiografia**: Zuia ufikiaji kutoka nchi mahususi. Ikiwa Nimbus imepewa leseni ya kufanya kazi katika baadhi ya masoko pekee, CloudFront inaweza kutekeleza hilo ukingoni bila ombi kuwahi kufikia seva zako.

**Tabia za CloudFront: Kanuni za Uakibishaji Bora**

Usambazaji wa CloudFront unaweza kuwa na **tabia nyingi** - kanuni za uelekezaji kulingana na ruwaza za URL.

kwa Nimbus

- `/picha/*` → Akiba ukingoni kwa siku 7 (picha hazibadiliki mara kwa mara)
- `/tuli/*` → Akiba pembeni kwa siku 30 (CSS na JavaScript iliyo na majina ya faili yaliyotolewa)
- `/api/*` → Usihifadhi akiba; mbele moja kwa moja kwa kusawazisha mzigo
- `/*` → Akiba kwa dakika 5 (kurasa za HTML)

Hii huruhusu CloudFront kuwa mahiri: kuweka akiba kwa ukali kilicho thabiti, pitia kile kinachobadilika.

** Udhibiti wa Ufikiaji wa Asili: Kulinda S3 na CloudFront **

Ikiwa ndoo yako ya S3 ina maudhui ya faragha ambayo yanapaswa kutumwa kupitia CloudFront pekee (sio moja kwa moja), unaweza kutumia **Udhibiti wa Ufikiaji Asili (OAC)** ili kuhakikisha S3 inakataa maombi ambayo hayatoki CloudFront.

Njia hii:

- `d1234abcd.cloudfront.net/image.jpg` Imetumika (CloudFront ina ruhusa)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Imezuiwa (idhini ya moja kwa moja ya S3 imekataliwa)

Maudhui yako yanapatikana tu kupitia usambazaji wako, huku sheria zako za akiba na mipangilio ya usalama ikitumika.

## Nguvu na Mapungufu

**Kwa nini CloudFront ina nguvu**:

- Maeneo ya Edge katika miji 90+ - watumiaji wengi hupata yaliyomo kutoka umbali wa <20ms
- Maudhui tuli yanayotolewa kwa milisekunde yenye tarakimu moja baada ya akiba ya kwanza
- Inapunguza mzigo wa asili kwa kiasi kikubwa (trafiki ya kurudia haipati seva zako)
- Imeunganishwa na AWS Shield, WAF, na Meneja wa Cheti
- Hakuna upangaji wa uwezo unaohitajika - CloudFront hupanga kiotomatiki

**Ambapo inakuwa ngumu **:

- Maudhui yaliyoakibishwa yanaweza kuwa ya kale - kubatilisha akiba hugharimu pesa ($0.005 kwa kila njia 1,000)
- Vichwa vya Udhibiti wa Akiba lazima kiwekwe ipasavyo katika asili - makosa husababisha maudhui ya muda
- Maudhui yanayobadilika hufaidika kutokana na uboreshaji wa uelekezaji lakini si kutoka kwa akiba
- Tabia ya utatuzi wa kache (nini kimehifadhiwa ambapo, kwa muda gani) inahitaji kuelewa tabaka nyingi: vichwa vya asili, mipangilio ya CloudFront TTL, sheria za tabia
- Uhamisho wa data kupitia CloudFront hugharimu pesa, ingawa ni chini ya uhamishaji wa data wa kawaida

## Muhtasari

- **CDN** huhifadhi nakala za maudhui yako katika maeneo ya karibu na watumiaji wako - kupunguza muda wa kusubiri na upakiaji asili.
- **CloudFront** ni CDN ya AWS, yenye maeneo 500+ duniani kote.
- Akiba imekosa kuleta kutoka **asili** (S3, ALB, EC2). Vibao vya akiba hutumika kutoka ukingoni - milisekunde, si mamia ya milisekunde.
- **Tabia** hukuwezesha kuweka sheria tofauti za kuweka akiba kwa ruwaza tofauti za URL.
- Maudhui yenye nguvu hayajahifadhiwa, lakini CloudFront bado inaboresha utendakazi kupitia mtandao wa uti wa mgongo wa AWS.
- **Udhibiti wa Ufikiaji Asili** huzuia ufikiaji wa moja kwa moja wa S3 - maudhui yanatolewa kupitia CloudFront pekee.
- Imeunganishwa na Shield (DDoS), WAF (firewall ya maombi), na ACM (vyeti vya SSL).

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu wenye Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.4)*

- **CloudFront + S3**: Mtindo wa kawaida wa mtihani wa kuhudumia tovuti tuli ulimwenguni. Ndoo ya S3 kama asili, CloudFront kama CDN, Udhibiti wa Ufikiaji wa Asili ili kuzuia ufikiaji wa moja kwa moja wa S3.
- **Edges vs Mikoa dhidi ya AZs**: Maeneo ya Edge ni mengi zaidi na yanapatikana kwa madhumuni ya kuweka akiba/CDN pekee. Sio sawa na AZs (ambazo huendesha kompyuta yako).
- **Kubatilisha akiba**: Huunda ubatilifu wa `/picha/*` ili kulazimisha CloudFront kuleta maudhui mapya. Gharama za pesa - mtihani unaweza kuomba mbadala wa gharama nafuu: URL za toleo (`picha-v2.jpg` badala ya `image.jpg`), ambazo kwa kawaida hukwepa akiba.
- **Udhibiti wa TTL**: `Cache-Control: max-age=3600` kwenye asili huweka TTL ya kashe ya saa 1. CloudFront inaheshimu vichwa hivi.
- **Kazi za CloudFront dhidi ya Lambda@Edge**: Utendakazi wa CloudFront huendeshwa ukingoni kwa ombi jepesi/udanganyifu wa jibu (sekunde ndogo). Lambda@Edge huendesha msimbo wako wa Lambda katika maeneo ya ukingo kwa uchakataji mzito. Mtihani huwatofautisha kwa uchangamano wa kesi za utumiaji.
- **URL zilizosainiwa na Vidakuzi vilivyotiwa Sahihi**: Dhibiti ni nani anayeweza kufikia maudhui kupitia CloudFront. URL zilizosainiwa hupeana ufikiaji wa faili mahususi; vidakuzi vilivyotiwa saini hupeana ufikiaji wa faili nyingi. Mtihani hutumia haya kwa "maudhui ya mteja anayelipwa."

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza tofauti kati ya kugonga kache ya CloudFront na kukosa kache. Ni nini hufanyika katika kila kesi?

*(Kidokezo: Fikiri kuhusu mahali ambapo maudhui yanatoka, na jinsi muda wa majibu unavyotofautiana kati ya matukio hayo mawili.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya programu husambaza faili kubwa za kisakinishi (~GB 2 kila moja) kutoka kwa ndoo ya S3 hadi kwa wateja duniani kote. Kasi ya upakuaji ni ya polepole kwa wateja walio Asia. Timu inataka kuboresha utendakazi bila kuiga ndoo ya S3 kwenye maeneo mengi. Pia wanahitaji kuhakikisha kuwa wateja wanaolipa pekee ndio wanaweza kupakua visakinishi.

Ni suluhisho gani BORA linalokidhi mahitaji haya?

A) Washa Uongezaji Kasi wa Uhamisho wa S3 kwenye ndoo na utengeneze URL zilizotiwa saini mapema kwa wateja wanaolipa  
B) Tumia CloudFront na ndoo ya S3 kama asili, washa Udhibiti wa Ufikiaji wa Asili, na utumie URL zilizosainiwa na CloudFront kwa kulipa wateja.  
C) Unda ndoo ya S3 katika kila eneo la AWS na utumie uelekezaji wa eneo la Route 53 ili kuwaelekeza wateja kwenye ndoo iliyo karibu nawe.  
D) Tumia Kisawazisho cha Upakiaji wa Programu katika kila eneo kilicho na matukio ya EC2 ambayo yanahudumia faili za kisakinishi

**Kidokezo cha 1**: Sharti ni kuboresha utendaji wa kimataifa *bila* kunakili ndoo. Ni chaguo gani halihitaji ndoo nyingi?

**Kidokezo cha 2**: Ni huduma gani inayodhibiti haswa ni nani anayeweza kufikia maudhui yanayotolewa kupitia CloudFront?

**Kidokezo cha 3**: Uongezaji kasi wa Uhamisho wa S3 umeboreshwa kwa upakiaji wa umbali mrefu *hadi* S3. Kwa kuwasilisha maudhui *kutoka* S3 hadi watumiaji wa mwisho duniani kote, CloudFront ndicho chombo sahihi.

**Jibu**: B

**Maelezo**: CloudFront huhifadhi faili za kisakinishi katika maeneo ya ukingo duniani kote baada ya upakuaji wa kwanza. Vipakuliwa vifuatavyo kutoka eneo moja hutoka ukingoni - kwa kasi zaidi kuliko kuvuka Pasifiki kutoka S3 katika us-mashariki-1. Udhibiti wa Ufikiaji wa Asili huhakikisha kuwa ndoo ya S3 inapatikana kupitia CloudFront pekee. URL zilizosainiwa huzuia ufikiaji wa wateja wanaolipa.

**Kwa nini isiwe A?** Uongezaji kasi wa Uhamisho wa S3 umeboreshwa kwa upakiaji wa umbali mrefu *katika* S3 — si kwa ajili ya kusambaza maudhui *kutoka* S3 hadi hadhira ya kimataifa. Kwa hiyo, CloudFront ndio zana sahihi. URL zilizotiwa saini mapema hudhibiti ufikiaji lakini haziboresha utendaji wa kimataifa.

**Kwa nini isiwe C?** Kuunda ndoo ya S3 kwa kila eneo kunafanya kazi kwa utendakazi, lakini inakinzana na hitaji la kuzuia urudufu. Inahitaji pia mkakati wa kusawazisha data kwenye ndoo zote.

**Kwa nini isiwe D?** Matukio ya EC2 nyuma ya kisawazisha mzigo katika kila eneo ni ghali zaidi kuliko CloudFront na inahitaji udhibiti wa seva katika maeneo mengi.

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu — Jukumu la 3.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inataka kuongeza maudhui ya video — video fupi za mafunzo ya upishi kutoka kwa washirika wa mikahawa. Video zinaweza kuwa 50-500MB. Wanatarajia video hiyo hiyo kutazamwa na maelfu ya watumiaji katika jiji moja ndani ya saa chache baada ya kuchapishwa.

Tengeneza usanifu wa uhifadhi na utoaji. Je, ungependa kutumia S3 na CloudFront? Je, unaweza kushughulikia vipi ombi la kwanza (kuanza baridi) ili kupunguza ucheleweshaji kabla ya video kuhifadhiwa? Je, ni akiba gani ya TTL ungeweka kwa video ambayo haitabadilika baada ya kuchapishwa?

*(Hakuna jibu moja sahihi. Lengo ni kutekeleza maamuzi ya muundo wa CDN.)*

## Onyesho la Baada ya Mikopo

Priya alitazama vipimo vya CloudFront baada ya kutumwa.

Kiwango cha hit ya akiba: 83%.

"Ina maana gani?" Tom aliuliza.

"Inamaanisha 83% ya watumiaji wetu wanapata maudhui kutoka eneo la ukingo karibu nao, si kutoka kwetu-mashariki-1."

"Na wengine 17%?"

"Maombi ya mara ya kwanza. Maudhui ambayo bado hayajahifadhiwa katika eneo hilo la ukingo."

Tom alitazama vipimo. "Kwa hivyo tunatuma maombi karibu milioni moja kwa siku kutoka kwa nodi za ukingo za CloudFront. Na ni 170,000 pekee kati ya hizo ambazo ziligusa seva zetu."

"Ndiyo."

"Kwa hivyo ikiwa hatungekuwa na CloudFront, seva zetu zingekuwa zinashughulikia maombi milioni."

"Katika milisekunde 140-160 kila moja, kwa watumiaji wa kimataifa."

Tom akaketi nyuma. Alikuwa na sura ambayo Maya alitambua - sura ya mtu anayehesabu tena gharama kwa wakati halisi.

"Hii inafaa," alisema.

Maya alikuwa tayari kwenye laptop yake. "Wahandisi wawili wapya watajiunga nasi wiki ijayo. Soo-Jin kutoka timu ya jukwaa katika kampuni yake ya mwisho, na Rafael - alibobea katika masuala ya usalama. Ninataka waingie kwenye IAM kabla ya siku yao ya kwanza."

"IAM imeendelea?" Leo aliuliza.

"Majukumu, sera, ufikiaji wa akaunti tofauti. Mambo halisi."

Katika sura inayofuata: vibali vilivyowekwa vyema ambavyo huruhusu sehemu moja ya mfumo kuzungumza na nyingine - kwa usalama.
