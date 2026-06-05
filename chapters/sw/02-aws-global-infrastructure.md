# Sura ya 2: Mhudumu Wako Yuko Wapi Ulimwenguni?

Simama. Tembea kwa dirisha ikiwa kuna moja karibu.

Angalia nje. Chochote unachokiona - majengo, miti, sehemu ya maegesho, uwanja wa nyuma wa mtu -
hakuna kati ya hayo ambapo data yako inaishi. Data yako inaishi mahali pengine kabisa. Pengine
mahali fulani hujawahi kufika.

Hilo si tatizo. Lakini kuelewa *ni wapi* hufanya idadi ya ajabu ya mambo
bonyeza mahali.

Sura ya mwisho, Leo alianza akaunti ya AWS saa 11 jioni na akazindua seva mahali pengine.
Mahali fulani likiwa neno la kiutendaji - hakuwa na uhakika ni sehemu gani ya ulimwengu angeweza
kuchaguliwa, kwa sababu hakuwa ameichagua kimakusudi.

Asubuhi iliyofuata, Maya aliona seva ilikuwa Singapore.

"Kwa nini Singapore?" Aliuliza.

"Ilikuwa chaguo-msingi," Leo alisema.

Tom akatazama juu kutoka kwenye kahawa yake. "Inagharimu kiasi gani kuendesha seva huko Singapore wakati
wateja wetu wote wako Pwani ya Magharibi?"

Leo hakuwa na jibu.

Priya tayari amefanya: "Ni polepole pia. Kila ombi lazima lisafiri nusu saa
dunia."

Sura hii inahusu kurekebisha uamuzi huo - na kuelewa kwa nini ni muhimu.

**Tatizo la "Mahali Fulani"**

Unapotumia AWS, hutumii kituo kimoja cha data. Unatumia mtandao wa kimataifa wa
yao. AWS ina miundombinu katika nchi kadhaa.

Hiyo ni kipengele, si ukweli tu. Lakini inamaanisha lazima ufanye chaguo: * wapi * kufanya
unataka miundombinu yako iendeshwe?

Chaguo ni muhimu kwa sababu tatu:

**Utendaji.** Kadiri seva zako zinavyokaribia watumiaji wako, ndivyo majibu yanavyoongezeka haraka.
Fizikia haiwezi kujadiliwa. Data husafiri kwa takriban theluthi mbili ya kasi ya mwanga
kupitia nyaya za fiber optic. Ombi kutoka Seattle kwenda Singapore huchukua takriban 300
milisekunde tu katika usafiri - kabla ya programu yako kufanya chochote.

**Utiifu.** Baadhi ya sekta zina sheria kuhusu mahali data inaweza kuhifadhiwa. huduma ya afya ya Marekani
data inaweza kuhitaji kukaa ndani ya nchi. Data ya fedha inaweza kuhitaji kusalia ndani ya mahususi
mkoa. Kuchagua Mkoa usio sahihi kunaweza kuleta matatizo ya kisheria.

**Ustahimilivu wakati wa maafa.** Ikiwa eneo moja limekatizwa na umeme, tetemeko la ardhi au mtandao
kushindwa, unataka mfumo wako uendelee kuishi. Kueneza miundombinu kwa njia nyingi
maeneo ni jinsi unavyolinda dhidi ya majanga ya ndani.

**Jinsi AWS Hupanga Miundombinu Yake**

AWS inagawanya miundombinu yake ya kimataifa katika dhana tatu zilizowekwa. Wafikirie kama
Wanasesere wa kiota wa Kirusi, kutoka kubwa hadi ndogo.

**Mikoa → Maeneo ya Upatikanaji → Maeneo ya Ukingo**

Hebu tufungue kila moja.

**Mikoa: Sanduku Kubwa**

**Eneo** ni eneo la kijiografia ambapo AWS ina mkusanyiko wa vituo vya data. Kila Mkoa
imepewa jina baada ya eneo lake: `us-west-2` ni Oregon, `us-east-1` ni Northern Virginia,
`eu-west-1` ni Ireland, `ap-southeast-1` ni Singapore — ambapo seva ya Leo ilikuwa imejificha.

Kuna zaidi ya Mikoa 30 ulimwenguni kote, na AWS huongeza mara kwa mara.

Kila Mkoa unajitegemea kabisa. Data katika `us-west-2` itasalia `us-west-2` isipokuwa
unaisogeza waziwazi. Hii ni muhimu kwa kufuata na kwa ustahimilivu - kuu
kukatika katika Mkoa mmoja hakuathiri wengine kiotomatiki.

"Kwa hivyo tunapaswa kuchagua `us-west-2` kwa Nimbus?" Tom aliuliza.

Ndiyo. Kwa biashara ya Marekani inayolenga wateja wa Pwani ya Magharibi, ndiyo. Muda wa chini wa kusubiri na watumiaji wako
pata majibu haraka.

"Ni ghali kiasi gani kuliko Singapore?" Tom aliongeza.

Bei hutofautiana kulingana na Mkoa - kwa kawaida kwa asilimia chache. Utendaji na kufuata
faida ya Mkoa wa kulia ina thamani ya tofauti ndogo ya bei.

**Maeneo ya Kupatikana: Upungufu Halisi**

Hapa ndipo inapovutia.

Kila Mkoa sio kituo kimoja cha data. Ni kundi la nyingi, tofauti za kimwili
vituo vya data vinavyoitwa **Maeneo ya Upatikanaji** (au AZs).

Oregon (`us-west-2`) ina Kanda nne za Upatikanaji: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Haya ni majengo halisi, yaliyotenganishwa na umbali wa maana - mbali ya kutosha
mbali na kwamba moto, mafuriko, au kukatika kwa umeme katika moja hakutaathiri wengine, lakini karibu
ya kutosha kwamba mtandao kati yao ni wa haraka sana ( latency ya millisecond ya tarakimu moja).

Huu ndio usanifu unaofanya AWS kuaminika kwa kiwango ambacho hakuna kituo kimoja cha data kinaweza kulingana.

Priya akainama mbele. "Kwa hivyo ikiwa tutaendesha maombi yetu katika Kanda mbili za Upatikanaji na
moja inashuka -"

"Mwingine anaendelea kukimbia," Maya alimaliza.

"Hasa."

Leo, ambaye alikuwa akisikiliza kimya kimya: "Nilipeleka kila kitu katika AZ moja."

“Ndiyo,” alisema Priya. "Tuliona."

Dhana ya kueneza programu yako kwenye AZ nyingi - inayoitwa **Multi-AZ
utumiaji** - ni mojawapo ya mifumo muhimu zaidi ya ustahimilivu katika AWS. Tunaendelea kwa kina
katika Sura ya 18. Kwa sasa, elewa kwamba AZs zipo mahususi ili kufanya hili liwezekane.

**Maeneo ya Ukingo: Kasi, Kila Mahali**

AZs kutatua uthabiti. Hazitatui tatizo la kupeana yaliyomo haraka kwa watumiaji ndani
miji iliyo mbali na Mkoa wako mkuu.

Ingiza **Maeneo Makali**.

Maeneo ya Edge ni sehemu ndogo, nyepesi za miundombinu zilizotawanyika kote zaidi ya 400
miji duniani kote. Sio vituo kamili vya data - haviwezi kutekeleza programu yako.
Wanachoweza * kufanya ni kuweka akiba ya maudhui karibu na watumiaji wako.

Hebu fikiria picha ya menyu iliyohifadhiwa kwenye seva huko Virginia. Kila wakati mtu huko Tokyo anataka
kuiona, ombi husafiri kuvuka Pasifiki na kurudi. Kwa Maeneo ya Edge, AWS inaweza kuhifadhi a
nakala ya faili hiyo iliyoko Tokyo na uitumie ndani ya nchi - milisekunde badala ya mamia ya
millisekunde.

Huu ndio uti wa mgongo wa CloudFront, mtandao wa utoaji maudhui wa AWS. Tunachimba ndani
CloudFront katika Sura ya 13. Kwa sasa: Maeneo ya Edge yanakaribia kasi ya maudhui tuli.

**Kuchagua Mkoa: Orodha ya Hakiki ya Mhandisi Mkuu**

Nimbus inapopanuka ili kuhudumia watumiaji nchini Meksiko na Kolombia (jambo ambalo hufanyika katika Sura ya 12),
uamuzi wa Mkoa sio wa kiholela. Hapa kuna mawazo:

**1. Watumiaji wako wako wapi?**

Anzia hapa. Chagua Mkoa ulio karibu zaidi na watumiaji wako wengi. Kuchelewa ndio zaidi
athari ya moja kwa moja, inayoweza kupimika ya uchaguzi wa Mkoa.

**2. Je, kuna mahitaji ya kufuata?**

Huduma ya afya, fedha, na mzigo wa kazi wa serikali mara nyingi huwa na sheria kali za ukaaji wa data.
Jua mazingira yako ya udhibiti kabla ya kuchagua.

**3. Je, unahitaji huduma gani?**

Sio kila huduma ya AWS inapatikana katika kila Mkoa. Uzinduzi wa huduma mpya nchini `us-east-1`
kwanza. Ikiwa unahitaji huduma mahususi, thibitisha Mkoa unaolengwa unaitumia.

**4. Je, ni bei gani?**

Mikoa inatofautiana kwa bei. `us-east-1` (Northern Virginia) inaelekea kuwa nafuu kwa sababu ya
ukubwa na umri wake. Amerika ya Kusini ni ghali kidogo. Angalia ukurasa wa bei wa AWS
kabla ya kukamilisha.

**5. Je, unahitaji Mikoa mingi?**

Kwa matumizi mengi, AZ nyingi ndani ya Mkoa mmoja ni uthabiti wa kutosha. Kwa
maombi muhimu ambapo hata kukatika kwa kikanda haikubaliki, unatengeneza
Mikoa mingi - lakini hiyo ni ahadi muhimu ya usanifu. Usifanye hivyo
kwa kubahatisha.

**Kizuizi Hakuna Anayezungumza Juu yake**

Mikoa ina nguvu, lakini huunda mvutano mmoja muhimu.

Kukimbia katika Mikoa mingi ni ngumu sana.

Urudiaji wa data kati ya Mikoa una muda wa kusubiri. Kuweka Mikoa miwili katika ulandanishi - ili a
muamala katika Mkoa A unaonekana papo hapo katika Mkoa B - ni mojawapo ya magumu zaidi
matatizo katika mifumo iliyosambazwa. AWS hutoa zana kwa ajili yake, lakini inagharimu pesa na inaongeza
utata wa uendeshaji.

Programu nyingi zinapaswa kuanza na Mkoa mmoja, AZ nyingi, na kupanua hadi Mikoa mingi
tu wakati wana mahitaji ya wazi: mamlaka ya udhibiti, SLA za kimkataba zinazohitaji
muda usiopungua sifuri wa eneo, au msingi wa watumiaji uliosambazwa kikweli katika mabara.

Usanifu wa mapema wa Mikoa mingi ni moja ya makosa ya kawaida na ya gharama kubwa
wahandisi wadogo hufanya wanapoanza kujiamini.

Tom akaitikia kwa kichwa. "Kwa hivyo hatufanyi Mikoa mingi kwa sababu tunaweza."

"Sio mpaka tunahitaji," Maya alisema. "Na tutajua wakati tutahitaji."

"Tutajuaje?" Leo aliuliza.

"Wakati hati yako ya ukaguzi wa usanifu ina hitaji ambalo linasema 'lazima uishi katika eneo
kukatika,” alisema Priya. "Hadi wakati huo: multi-AZ."

## Nguvu na Mapungufu

**Tumia muundo wa maeneo mengi na AZ nyingi wakati**: programu yako ina watumiaji katika jiografia nyingi na masuala ya muda wa kusubiri; SLA yako inahitaji 99.99% au upatikanaji wa juu zaidi; mahitaji ya udhibiti huamuru ukaaji wa data katika maeneo maalum; unahitaji kupona maafa na RTO chini ya saa moja.

**Maamuzi ya uwiano ni ya kweli**: Kuiga data katika maeneo yote huongeza gharama - uhamishaji wa data wa maeneo mbalimbali ni mojawapo ya bidhaa ambazo hazijakadiriwa sana kwenye bili ya AWS. Pia inaongeza ugumu wa kiutendaji: kila maandishi ambayo lazima yafanane katika maeneo yote huongeza utulivu. Makosa mengi yanayoathiri programu halisi si majanga ya maeneo mbalimbali - ni maswala ya eneo hilo kama vile kikundi cha usalama kilichowekwa vibaya au utumaji ambao haujakamilika. Wekeza katika AZ nyingi kabla ya maeneo mengi. Ongeza maeneo mengi wakati kesi ya biashara iko wazi.

## Muhtasari

- AWS hupanga miundombinu yake ya kimataifa katika **Mikoa**, **Maeneo ya Upatikanaji**,
  na **Maeneo Makali**.
- **Eneo** ni kundi la kijiografia la vituo vya data. Kila Mkoa umetengwa -
  data husalia katika Mkoa isipokuwa ukiihamisha waziwazi.
- **Maeneo ya Upatikanaji** ni vituo tofauti vya data ndani ya Mkoa, vilivyounganishwa
  kwa mitandao ya chini ya latency. Kupeleka kwenye AZ nyingi ndiyo njia ya kawaida ya
  kuishi kushindwa kwa mitaa.
- **Edge Locations** cache maudhui karibu na watumiaji duniani kote. Wana nguvu CloudFront.
- Chagua Mkoa wako kulingana na eneo la mtumiaji, mahitaji ya kufuata, huduma
  upatikanaji, na bei - kwa mpangilio huo.
- Multi-AZ ndio msingi wa kawaida wa ustahimilivu. Multi-Region ni kwa ajili ya mzigo muhimu wa kazi
  na mahitaji maalum, yaliyoandikwa - sio mahali pa kuanzia chaguo-msingi.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa 1 - Kazi 1.1 / Kikoa 2 - Kazi 2.2*

- **Maeneo yametengwa kwa chaguo-msingi.** Data haijirudishi kati ya Mikoa isipokuwa
  unaisanidi. Hii ni muhimu kwa mamlaka ya data na matukio ya kufuata.
- **AZ ndio kitengo cha ustahimilivu kwa maswali mengi.** Mtihani unapouliza jinsi ya kuishi
  kushindwa kwa kituo cha data, jibu linahusisha AZ nyingi ndani ya Mkoa mmoja.
- **Mikoa mingi ni ya ustahimilivu wa kukatika kwa kikanda.** Ikiwa hali inasema "lazima ibaki
  inafanya kazi hata kama Mkoa mzima wa AWS utashindwa," jibu linahusisha Mikoa mingi
  usanifu.
- **Edge Locations ≠ AZs.** Edge Locations content content — haziwezi kuendesha yako
  seva ya programu. Usiwachanganye na vituo vya data.
- Mtihani mara nyingi hujaribu uhusiano kati ya kufuata na uteuzi wa Mkoa.
  Ikiwa hali inataja mahitaji ya ukaaji wa data, chaguo la eneo ni sehemu ya jibu.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: kuna tofauti gani kati ya Mkoa na Eneo la Upatikanaji?
Kwa nini tofauti hiyo inajalisha wakati wa kubuni programu tumizi ya wavuti?

*(Kidokezo: Fikiria juu ya aina mbili tofauti za kushindwa ambazo kila moja hulinda dhidi yake.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya afya ya Marekani lazima ihifadhi data yote ya mgonjwa ndani ya AWS moja
Eneo litii sera za ukaaji wa data ya ndani. Wanatengeneza wingu mpya
maombi kwenye Pwani ya Magharibi na unataka kuongeza uthabiti bila kuhamisha data kwa
Mkoa mwingine.

Ni usanidi upi BORA unaokidhi mahitaji yao?

A) Sambaza katika `us-east-1` na utumie CloudFront Edge Locations huko Oregon kutoa maudhui
   haraka zaidi  
B) Sambaza katika `us-west-2` (Oregon) katika Maeneo mengi ya Upatikanaji  
C) Sambaza katika Mikoa mingi ikiwa ni pamoja na `sisi-magharibi-2` na `sisi-mashariki-1` yenye Maeneo mbalimbali
   urudufu wa data  
D) Sambaza katika `us-west-2` katika Eneo moja la Upatikanaji ili kupunguza gharama

**Kidokezo cha 1**: Sera ina maana kwamba data lazima ibaki katika Eneo moja. Chaguzi zipi
kuhamisha data kwa Mkoa mwingine?

**Kidokezo cha 2**: Miongoni mwa chaguo zinazoweka data katika `us-west-2`, ni ipi inatoa uthabiti zaidi?

**Kidokezo cha 3**: AZ nyingi ndani ya Mkoa mmoja hutoa uthabiti bila kuvuka
Mipaka ya mkoa.

**Jibu**: B

**Maelezo**: `us-west-2` huweka data zote katika Mkoa mmoja, kukidhi sera.
mahitaji. Kusambaza AZ nyingi ndani ya Mkoa huo hulinda dhidi ya
kushindwa kwa kituo cha data bila kuhamisha data hadi Mkoa mwingine. Huu ndio usawa sahihi
ya kufuata na kustahimili.

**Kwa nini isiwe A?** CloudFront huweka akiba maudhui katika Maeneo ya Edge duniani kote - data ingefanya hivyo
kuondoka `us-west-2`, kukiuka sera ya ukaaji.

**Kwa nini isiwe C?** Kuiga `us-east-1` huhamisha data ya mgonjwa hadi Pwani ya Mashariki,
kukiuka moja kwa moja mahitaji ya eneo moja.

**Kwa nini isiwe D?** AZ moja haina uthabiti. Ikiwa AZ hiyo itapata shida,
maombi inashindwa kabisa.

*SAA-C03 Kikoa 1 — Jukumu la 1.1 (miundombinu ya kimataifa, mamlaka ya data)*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inapanuka ili kuwahudumia wateja nchini Meksiko na Kolombia. Hivi sasa kila kitu
inaendeshwa katika `us-west-2`. Timu inajadili: iwapo wataongeza Mkoa wa pili `us-mashariki-1`,
au kukaa eneo moja na AZ nyingi?

Je, ungeuliza maswali gani kabla ya kuamua? Ni gharama gani kuu na hatari
kuongeza Mkoa wa pili? Je, gharama kuu ya *kutoongeza* ni ipi?

*(Hakuna jibu moja sahihi. Fanya mazoezi ya hoja za kubadilishana za Maeneo mbalimbali.)*

## Onyesho la Baada ya Mikopo

Leo alisuluhisha shida ya Singapore. Nimbus alihamia `us-west-2`. Muda wa kusubiri ulipungua.
Swali moja la kufuatilia la Tom - "hilo lilibadilisha muswada wetu?" - ilijibiwa na
idadi ya juu kidogo, ambayo aliikubali kwa kusita inayoonekana.

Hiyo ilidumu siku mbili kabla ya shida iliyofuata.

Leo alikuja kusimama na usemi wa Maya alikuwa amejifunza kutambua: sura ya
mtu ambaye amefanya jambo ambalo hangeweza kutendua.

"Kwa hivyo," alisema kwa uangalifu. "Nilianzisha seva. Na nilihitaji njia ya kuingia.
Kwa hivyo niliunda jina la mtumiaji."

"Na?" Priya aliuliza.

"'Msimamizi'."

Kimya.

"Na nenosiri?"

Kimya kirefu zaidi.

"'Admin123'."

Priya akasimama.

Katika sura inayofuata: jinsi Nimbus anavyodhibiti ni nani anayeweza kugusa nini - na nini kinatokea wanapokosea.
