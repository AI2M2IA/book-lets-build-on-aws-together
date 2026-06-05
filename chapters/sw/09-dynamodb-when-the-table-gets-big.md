# Sura ya 9: Meza Inapokuwa Kubwa

Jedwali la menyu lilikuwa na vitu 50,000.

Hiyo ilikuwa katika mikahawa 287, kila moja ikiwa na vyakula maalum vya kila siku, bidhaa za msimu, na kikanda
tofauti. Vitu vingine vilikuwa na viboreshaji - saizi, kiwango cha viungo, chaguo la protini. Baadhi walikuwa
mikataba ya mchanganyiko ambayo ilirejelea vitu vingine. Baadhi zilionekana kwenye menyu siku za wiki pekee,
au tu wakati wa chakula cha mchana, au tu katika miji fulani.

Hoja ya SQL iliyorejesha menyu kamili ya mkahawa ilirejea baada ya milisekunde 200.

Sasa ilikuwa inachukua sekunde nne.

Sekunde nne ni tofauti kati ya mtu anayeweka agizo na anayefunga
programu. Leo alikuwa ameendesha mpango wa maswali. Tom alikuwa ameangalia usanidi wa fahirisi. Priya
imeongeza idadi ya nakala zilizosomwa. Hakuna hata moja lililoleta mabadiliko ya maana.

Na hiyo ilibadilisha hali ya chumba.

Tatizo linapodumu kuorodhesha, majaribio ya kuweka akiba, na nakala moja ya ziada, watu huacha
kudhani kurekebisha itakuwa wajanja.

Wakati mwingine kurekebisha ni kwamba sura ya mfumo sio sahihi.

"Tatizo," Leo alisema, "ni umbo la data. SQL inataka kila kitu kwa safu na
nguzo. Menyu zetu hazina umbo lisilobadilika."

Huo ukawa mwanzo wa mazungumzo marefu.

**Tatizo la Kuweka Kila kitu kwenye Jedwali**

Huu hapa ni mvutano mkuu wa hifadhidata za uhusiano: zimeundwa kuhifadhi data *iliyoundwa* katika maumbo *ya kudumu*.

Ikiwa kila kipengee cha menyu kilikuwa na sehemu sawa - jina, bei, maelezo, kitengo - SQL itakuwa kamili. Ungekuwa na jedwali safi la `menu_vitu`, safu mlalo kwa kila kipengee, na hoja zinazoeleweka.

Lakini menyu halisi haifanyi kazi kwa njia hiyo.

Kipengee kimoja kinaweza kuwa na kirekebishaji cha "kiwango cha viungo". Mwingine anaweza kuwa na "chaguo la protini." Theluthi moja inaweza kuwa na vichanganyiko vilivyowekwa - "agiza chakula cha familia na utapata njia kuu mbili, pande mbili na kinywaji." Muundo wa data hutofautiana *kwa kila kipengee*.

Katika SQL, una chaguzi mbili:

**Chaguo la 1**: Unda safu wima kwa kila kirekebishaji kinachowezekana. Hii hutoa jedwali pana sana ambapo safu wima nyingi hazina kitu wakati mwingi.

**Chaguo la 2**: Unda jedwali tofauti la virekebishaji na ujiunge nalo kwenye jedwali la vipengee vya menyu. Hii inafanya kazi, lakini menyu changamano zinahitaji viungio vingi, na kwa vitu elfu hamsini vilivyo na sauti ya juu ya kusoma, viungio hivyo huwa ghali.

"Kuna chaguo la tatu," alisema Priya, ambaye alikuwa akisoma nyaraka kimya kimya kwenye kona.

Alivuta kichupo kipya. "Itakuwaje ikiwa data haikupaswa kutoshea kwenye jedwali?"

**Njia Tofauti ya Kufikiria Kuhusu Data**

Hifadhidata za uhusiano huhifadhi data kama safu mlalo katika majedwali. Kila safu lazima ilingane na taratibu za jedwali. Schema imekubaliwa mapema.

Hifadhidata za NoSQL huhifadhi data kwa njia tofauti. Njia moja ya kawaida ni *mfano wa hati*: kila rekodi huhifadhiwa kama hati inayojitosheleza (kawaida ni JSON), na hati zilizo katika mkusanyo sawa si lazima ziwe na sehemu zinazofanana.

Kipengee cha menyu katika muundo wa hati kinaweza kuonekana kama hii:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Kipengee kingine kinaweza kuonekana tofauti kabisa:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Maumbo tofauti. Mkusanyiko sawa. Hakuna tatizo.

"Kwa hiyo hifadhidata ni kama mfumo wa kuhifadhi faili kuliko meza," alisema Maya.

"Ni kweli," alisema Priya. "Unaweza kuweka hati yoyote kwenye droo yoyote. Huhitaji kukata hati ili kupata saizi isiyobadilika."

**Kutana na DynamoDB**

Amazon DynamoDB ni huduma ya hifadhidata ya AWS inayosimamiwa na NoSQL. Huhifadhi data kama vitu (sio safu), na vitu vinakusanywa kwenye jedwali (kumtaja ni sawa na SQL, lakini tabia ni tofauti).

Kila kipengee kwenye jedwali la DynamoDB lazima kiwe na **ufunguo msingi**, unaokitambulisha kwa njia ya kipekee. Kila kitu kingine ni rahisi.

Ufunguo wa msingi unaweza kuwa moja ya aina mbili:

**Ufunguo wa kugawa pekee**: Sifa moja ambayo lazima iwe ya kipekee katika vipengee vyote.

**Ufunguo wa kugawanya + ufunguo wa kupanga (ufunguo msingi wa mchanganyiko)**: Sifa mbili ambazo *pamoja* huunda mchanganyiko wa kipekee. Hii hukuruhusu kuwa na vipengee vingi vilivyo na ufunguo sawa wa kuhesabu, unaotofautishwa na ufunguo wao wa kupanga.

Kwa menyu ya Nimbus:

- Kitufe cha kugawa: `Id ya mgahawa`
- Kitufe cha kupanga: `itemId`

Hii inamaanisha kuwa unaweza kuepua bidhaa zote za mkahawa mahususi kwa ufasaha - DynamoDB inajua ni sehemu gani ya kuangalia.

"Kwa nini inaitwa ufunguo wa kugawa?" Tom aliuliza.

**Jinsi DynamoDB Huhifadhi Data Ndani**

DynamoDB imeundwa ili kupima usawa hadi saizi kubwa. Hufanikisha hili kupitia *kugawanya* - data hugawanywa katika mashine nyingi halisi kulingana na ufunguo wa kuhesabu.

Unapoandika kipengee, DynamoDB huharakisha thamani ya ufunguo wa kizigeu na hutumia heshi hiyo kubainisha ni kizigeu gani halisi (na hivyo seva) huhifadhi kipengee hicho. Unaposoma kipengee, DynamoDB hufanya hesabu sawa ili kukipata papo hapo.

Ifikirie kama mfumo wa posta. Iwapo kila bahasha ina msimbo wa posta, huduma ya posta haisomi kila bahasha ili kufahamu inapostahili - hupanga kwa msimbo wa posta. DynamoDB hupanga kwa heshi ya ufunguo wa kuhesabu.

Hii ndiyo sababu ni muhimu kuchagua kizigeu kizuri:

- **Nzuri**: Thamani za juu, zilizosambazwa sawasawa (`restaurantId` yenye mikahawa mingi)
- **Mbaya**: Uaminifu wa chini (`kweli/uongo`, `kitengo`) - data nyingi huwekwa kwenye sehemu chache, na kuunda "maeneo motomoto"

Sehemu ya moto inamaanisha sehemu moja hupata trafiki nyingi. Sehemu hiyo inakuwa kizuizi. DynamoDB huanza maombi ya kusisimua. Watumiaji wanaanza kuona makosa.

"Kwa hivyo ikiwa ningetumia `inapatikana: kweli` kama kitufe cha kugawa," Leo alisema polepole, "vitu vyote vinavyopatikana vingerundikana kwenye kizigeu sawa."

"Na hifadhidata yako ingeyeyuka kwa kukimbiza chakula cha jioni," Priya alithibitisha.

Leo akafunga laptop yake taratibu.

**Kusoma na Kuandika kwa Mizani**

DynamoDB inaweza kushughulikia mamilioni ya maombi kwa sekunde. Lakini inahitaji kujua ni kiasi gani cha uwezo wa kutoa.

Kuna njia mbili za uwezo:

**Uwezo uliotolewa**: Unabainisha ni vitengo vingapi vya kusoma na kuandika unavyotaka. DynamoDB inahifadhi uwezo huo kwa ajili yako na hupunguza trafiki inayozidi. Gharama inayotabirika, bei ya chini kwa kila ombi.

**Uwezo unapohitajika**: DynamoDB huweka sawa kiotomatiki na trafiki yako halisi. Hakuna upangaji wa uwezo wa kawaida unaohitajika. Gharama ya juu kwa kila ombi, na rahisi zaidi kiutendaji, ingawa miinuka ya ghafla zaidi ya muundo wa hivi majuzi wa trafiki wa jedwali bado inaweza kusababisha msongamano ikiwa zitaruka haraka sana.

Kwa Nimbus, menyu inasomwa mara nyingi zaidi kuliko ilivyoandikwa. Mteja anafungua programu, anavinjari menyu - hizo ni nyingi. Mshirika wa mkahawa husasisha menyu yake mara mbili kwa wiki - hiyo ni mara kwa mara huandika.

"On-mahitaji mantiki kwa sasa," alisema Tom. "Bado hatujui mifumo yetu ya trafiki. Afadhali kulipa zaidi kwa kila ombi kuliko kutoa riziki kidogo na kuzuiwa."

Hekima ya miundombinu inayositasita. Kutoka kwa Tom. Timu ilikuwa imekua rasmi.

**Uthabiti: Data Yako Ni Safi Gani?**

DynamoDB inakili data kiotomatiki katika Maeneo mengi ya Upatikanaji. Hiyo ni nzuri kwa uimara, lakini pia inamaanisha unahitaji kufikiria wazi juu ya uthabiti wa kusoma.

Unaposoma kutoka DynamoDB, una chaguo:

**Hatimaye soma thabiti**: Hii ndiyo chaguomsingi. Ni bei rahisi, na matokeo yanaweza kubaki nyuma kwa maandishi yaliyokamilishwa hivi karibuni.

**Usomaji thabiti kabisa**: Kwa usomaji dhidi ya jedwali au faharasa ya pili ya ndani, DynamoDB inaweza kurejesha thamani ya hivi punde iliyojitolea kutoka kwa maandishi yaliyofaulu ya awali. Hii inagharimu uwezo wa kusoma zaidi na haipatikani kwa faharasa za upili za kimataifa.

Kwa data ya menyu, uthabiti wa mwisho ni sawa. Kipengee cha menyu ambacho ni cha milisekunde haijalishi.

Kwa data ya uthibitishaji wa agizo — "je agizo hili limewekwa?" - ungependa uthabiti thabiti. Mteja hapaswi kuona ujumbe wa "jaribu tena" wakati agizo lake lilipohifadhiwa.

"Ni kama tofauti kati ya kuangalia salio la benki yako kwenye programu dhidi ya kupiga simu benki moja kwa moja," alisema Maya. "Programu inaweza kuwa nyuma kwa sekunde thelathini. Simu ni ya sasa kila wakati."

**Biashara: Kile ambacho DynamoDB Haiwezi Kufanya**

NoSQL sio bora kuliko SQL. Ni chombo tofauti kwa kazi tofauti.

DynamoDB inatoa nini:

**Maswali yanayonyumbulika**: Katika SQL, unaweza kuchuja na kupanga kulingana na safu wima yoyote. Katika DynamoDB, unaweza tu kuuliza kwa ufanisi kwa ufunguo msingi. Kuuliza swali kwa kutumia sehemu zisizo za kawaida kunahitaji *changanuzi* (kusoma kila kipengee kwenye jedwali), ambacho ni ghali na ni polepole kwa kiwango.

**Inajiunga**: DynamoDB haifanyi kujiunga. Ikiwa unahitaji data kutoka kwa jedwali mbili, unasoma mbili tofauti katika nambari yako ya programu.

**Miamala**: DynamoDB hutumia miamala, lakini hifadhidata za uhusiano bado ndizo zinazofaa zaidi kwa utendakazi wa mashirika mengi, mifumo mizito ya kuripoti na miundo mizito ya kujiunga.

**Ufahamu**: Miongo kadhaa ya zana za SQL, ujuzi na miundo ya kiakili haihamishiki moja kwa moja.

Nini DynamoDB inafaulu katika:

- Thamani kuu na mifumo ya ufikiaji wa hati
- Kiwango kikubwa (kuchelewa kwa millisecond ya tarakimu moja kwa ukubwa wowote)
- Bila seva, hakuna usimamizi wa miundombinu
- Kuongeza otomatiki, urudufishaji wa AZ nyingi, chelezo
- Utendaji unaotabirika bila kujali kiasi cha data

"Kwa hivyo kanuni ni," Maya alisema, "tumia DynamoDB wakati unajua *haswa* jinsi utakavyofikia data. Tumia SQL wakati bado hujui."

Priya akaitikia kwa kichwa. "Unda mifumo yako ya ufikiaji kwanza. Kisha chagua hifadhidata yako."

Hili ni mojawapo ya mambo makuu ambayo mazungumzo ya hifadhidata yanaweza kuzalisha.

**Wakati wa Kutumia Kila**

| Hali | Fikia Kwa |
|----------------------------------------------------------------------------|
| Data iliyopangwa, maswali magumu, kuripoti | RDS (PostgreSQL, MySQL) |
| Maumbo ya data yanayobadilika, ufikiaji kulingana na ufunguo, kiwango kikubwa | DynamoDB |
| Andika-nzito na mahusiano magumu | RDS |
| Kusoma-nzito na mifumo ya ufikiaji inayoweza kutabirika | DynamoDB |
| Unahitaji viungo na jumla | RDS |
| Unahitaji muda wa kusubiri wa milisekunde kwa mamilioni ya req/sekunde | DynamoDB |
| Shughuli katika vyombo vingi | RDS (kawaida) |
| Viwango vya trafiki visivyo na seva / visivyotabirika | DynamoDB inapohitajika |

Jibu lisilo sahihi ni "kila mara tumia moja au nyingine." Nimbus iliishia kutumia zote mbili: RDS kwa historia ya agizo na rekodi za kifedha (iliyoundwa, uhusiano, kuripoti mahitaji), DynamoDB kwa menyu (rangi ya kubadilika, sauti ya juu ya kusoma, ufikiaji kwa kitambulisho cha mgahawa).

## Nguvu na Mapungufu

**Kwa nini DynamoDB ina nguvu**:

- Muda wa kusubiri wa milisekunde ya tarakimu moja kwa kiwango chochote
- Imesimamiwa kikamilifu - hakuna kuweka, hakuna usanidi wa urudufishaji, hakuna madirisha ya matengenezo
- Urudufu wa otomatiki wa AZ nyingi (uimara uliojengwa ndani)
- Kuongeza kwa mahitaji kunamaanisha upangaji sifuri wa uwezo
- Ushirikiano wa asili na Lambda, Lango la API, Mito
- Urejeshaji wa wakati kwa wakati (sawa na nakala rudufu za kiotomatiki za RDS)
- Mitiririko ya DynamoDB - kunasa kila mabadiliko kama tukio (muhimu kwa usindikaji wa wakati halisi)

**Ambapo DynamoDB inakuwa ngumu **:

- Muundo wa muundo wa ufikiaji hauwezi kujadiliwa - makosa ni ghali kutengua
- Maswali magumu yanahitaji faharisi za upili (huongeza gharama na ugumu)
- Uchanganuzi ni wa gharama kubwa - uepuke katika uzalishaji
- "Kikomo cha ukubwa wa bidhaa" ni KB 400 - vipengee vikubwa vinahitaji hifadhi tofauti
- Bei inaweza kukushangaza ikiwa huelewi gharama za kitengo cha kusoma/kuandika

## Muhtasari

- DynamoDB ni huduma ya hifadhidata ya AWS inayosimamiwa na NoSQL.
- Vipengee huhifadhiwa kama hati rahisi - hakuna schema isiyobadilika inayohitajika.
- Kila kipengee lazima kiwe na **ufunguo msingi**: ufunguo wa kugawa peke yake, au ufunguo wa kugawa + ufunguo wa kupanga.
- Kitufe cha kizigeu huamua ni kizigeu gani kinachohifadhi kipengee. Ichague kwa usambazaji sawa.
- **Inapohitajika ** mizani ya uwezo otomatiki; **uwezo uliowekwa** ni nafuu ikiwa trafiki yako inaweza kutabirika.
- **Hatimaye usomaji thabiti** ni wa bei nafuu na wa haraka zaidi. **Usomaji thabiti** huwa ni wa sasa kila wakati.
- DynamoDB inafaulu katika ufikiaji wa ufunguo kwa kiwango kikubwa. Inapambana na maswali ya ad-hoc na kujiunga.
- Tumia RDS kwa data ya uhusiano. Tumia DynamoDB kwa data ya hati/thamani ya ufunguo. Tumia zote mbili wakati hali inahitaji.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.3)*

- Jua sheria kuu za kuhesabu: ** ukadinali wa juu, hata usambazaji **. Sehemu za moto ni mtego wa kawaida wa mitihani.
- **Inapohitajika dhidi ya masharti**: unapohitajika kwa trafiki isiyotabirika; imetolewa (kwa Kuongeza Kiotomatiki) kwa mizigo ya kazi inayoweza kutabirika.
- **Mitiririko ya DynamoDB**: hunasa mabadiliko ya kiwango cha bidhaa kwa wakati halisi. Hali ya mtihani wa kawaida: "anzisha utendaji wa Lambda rekodi inapobadilika."
- **Majedwali ya Ulimwenguni**: Maeneo mengi, uigaji wa kazi nyingi kwa programu zinazosambazwa kimataifa na hali za uokoaji wa maafa. Kwenye mtihani, hii ni ishara dhabiti wakati mzigo wa kazi unahitaji usomaji wa ndani na kuandika katika zaidi ya Mkoa mmoja.
- **DAX (Kiakibishaji cha DynamoDB)**: safu ya akiba ya kumbukumbu ya DynamoDB. Hupunguza muda wa kusubiri wa kusoma kutoka milisekunde hadi sekunde ndogo. Mtihani hutumia hii wakati RDS inaposoma nakala hazitasaidia (kwa sababu ni akiba maalum ya DynamoDB).
- **Ufunguo msingi wa Mchanganyiko**: ufunguo wa kugawanya + ufunguo wa kupanga huruhusu maswali rahisi ndani ya kizigeu. Mfano: rudisha maagizo yote kwa mteja kati ya tarehe mbili — `customerId` ni ufunguo wa kugawa, `orderDate` ni ufunguo wa kupanga.
- Jua wakati SIO KUTUMIA DynamoDB: viungio changamano, kuripoti ad-hoc, miamala ya mashirika mengi → RDS huwa jibu.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza tofauti kati ya ufunguo wa kuhesabu na ufunguo wa kupanga. Je, ungetumia zote mbili lini?

*(Kidokezo: Fikiria kuhusu menyu ya Nimbus - kwa nini kuwa na restaurantId kama ufunguo wa kugawanya na itemId kama ufunguo wa kupanga hufanya kurejesha menyu kamili ya mgahawa kwa ufanisi?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya kimataifa ya michezo ya kubahatisha huhifadhi wasifu wa wachezaji katika DynamoDB. Kila wasifu unajumuisha sehemu kama vile jina la mtumiaji, kiwango, mafanikio na orodha. Wachezaji wengine wana vitu 10 vya hesabu; zingine zina usanidi maalum 5,000. Kampuni inahitaji muda wa kusubiri wa kusoma wa tarakimu moja kwa milisekunde moja kwa uchunguzi wa wasifu wakati wa uchezaji unaoendelea.

Ni mbinu ipi ya muundo BORA inayounga mkono hitaji hili?

A) Hamia hadi RDS Aurora na nakala zilizosomwa katika kila eneo  
B) Tumia DynamoDB iliyo na `playerId` kama ufunguo wa kuhesabu na uhifadhi wasifu wote kama kitu kimoja.  
C) Tumia DynamoDB iliyo na `level` kama ufunguo wa kugawa katika vikundi vya wachezaji wenye ujuzi sawa  
D) Tumia ElastiCache mbele ya RDS ili kufikia muda wa kusubiri wa milisekunde ndogo

**Kidokezo cha 1**: Mchoro wa ufikiaji ni "tafuta kichezaji mahususi kwa kitambulisho." Ni ufunguo gani hufanya hivyo kuwa na ufanisi?

**Kidokezo cha 2**: Chaguo moja huunda kizigeu cha moto cha kutisha. Ni sifa gani iliyo na ukadinali wa chini sana?

**Kidokezo cha 3**: DynamoDB tayari inatoa muda wa kusubiri wa milisekunde yenye tarakimu moja kwa asili.

**Jibu**: B

**Maelezo**: Kwa kutumia `playerId` kama ufunguo wa kugawanya data kwa usawa katika sehemu zote na kuwezesha utafutaji wa papo hapo kwa Kitambulisho cha mchezaji - haswa muundo wa ufikiaji uliofafanuliwa. Muundo wa hati unaonyumbulika wa DynamoDB hushughulikia ukubwa tofauti wa orodha bila mabadiliko ya taratibu.

**Kwa nini isiwe A?** RDS Aurora iliyo na nakala zilizosomwa huongeza utata na bado si chaguo la kwanza la aina hii ya utafutaji wa wasifu unaotegemea ufunguo katika kiwango cha michezo ya kubahatisha.

**Kwa nini isiwe C?** Kutumia `level` kama ufunguo wa kugawanya hutengeneza sehemu za joto kali - trafiki nyingi hufika kiwango cha 1 (wachezaji wapya) au kiwango cha juu (maveterani wanaoendelea), na kuacha sehemu zingine zikiwa bila kazi.

**Kwa nini isiwe D?** Swali linafafanua DynamoDB, si RDS. Kuongeza ElastiCache mbele ya RDS huleta huduma mbili mpya wakati DynamoDB pekee inasuluhisha shida.

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu — Jukumu la 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inaongeza kipengele cha "vipendwa": wateja wanaweza kuhifadhi vitu wanavyovipenda vya menyu na kuvipanga upya kwa kugusa mara moja.

Tengeneza jedwali la DynamoDB kwa kipengele hiki. Kitufe cha kugawa kingekuwa nini? Je, unaweza kutumia ufunguo wa kupanga? Muundo wa kipengee ungeonekanaje?

Kisha fikiria: nini kitatokea ikiwa unahitaji kuonyesha "vitu 100 bora vilivyopendwa zaidi kwa wateja wote"? DynamoDB inaweza kujibu hilo kwa ufanisi? Ikiwa sivyo, ungeongeza nini kwenye usanifu?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kuunda mifumo ya ufikiaji.)*

## Onyesho la Baada ya Mikopo

Leo alikuwa amehamisha menyu hadi DynamoDB kufikia mwisho wa wiki. Masomo yalikuwa ya haraka. Ratiba ilikuwa rahisi kubadilika. Washirika wa mikahawa wanaweza kuongeza sehemu zozote za kurekebisha wanazotaka.

Alikuwa akijihisi vizuri.

Kisha Priya akatazama dashibodi ya ufuatiliaji.

"Leo," alisema, "kila ukurasa upakiaji hufanya maombi arobaini na saba ya DynamoDB."

"Moja kwa kila mgahawa," Leo alithibitisha. "Kwa sababu mteja yuko kwenye ukurasa wa kuvinjari-wote."

"Na kila moja ya ombi hilo huchukua takriban milisekunde nne."

Leo alifanya hesabu. Arobaini na saba mara nne. "Hiyo ni... milisekunde mia moja themanini na nane kwa menyu tu. Kabla ya kutoa."

"Kwenye kila ukurasa upakiaji."

"Kwa kila mteja."

Akatazama kwenye skrini.

"Tunahitaji kache," alisema.

Katika sura inayofuata: safu kati ya matumizi ya Nimbus na hifadhidata yake ambayo hufanya maswali ya polepole haraka.
