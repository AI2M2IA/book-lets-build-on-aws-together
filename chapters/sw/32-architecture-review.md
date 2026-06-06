# Sura ya 32: Kutetea Mpango

Carlos alikuwa amerudi, wiki chache baada ya kipindi cha Ujenzi Bora. Wakati huu kompyuta ilibaki ndani ya mfuko wake; alichukua kalamu ya alama ya ubao mweupe badala yake, akamsalimia kila mtu chumbani, akapata sehemu karibu na ubao, na kufungua kalamu.

"Niambie kuhusu Nimbus," alisema. Kana kwamba hajawahi kuisikia.

**Muhtasari wa Haraka: Kutoka Mapitio hadi Hesabu**

Mapitio ya Ujenzi Bora ya Sura ya 31 yalikuwa yamefichua matokeo matatu yenye hatari ya juu na ufahamu unaokua wa Maya kwamba kulikuwa na pengo kati ya maamuzi timu ilikuwa imeyafanya na maamuzi waliyokuwa *wameyafikiria kikamilifu*. Mfumo ulikuwa umewapa msamiati wa pengo. Kile usichoweza kuwapa ilikuwa mazoea ya kulifunga kwa wakati halisi — kabla kipengele kusafirishwa, si baadaye. Hicho ndicho Carlos alikuwapo kwa ajili yake. Maya alikuwa amemwalika mahususi kwa sababu Nimbus ilikuwa karibu kujenga kitu kikubwa, na alitaka changamoto iliyoundwa kabla mstari wa kwanza wa msimbo wa uzalishaji kuandikwa.

Mapitio mazuri ya usanifu yanafanana na orodha ya uchunguzi ya kabla-ya-kuruka kwa rubani. Ndege inaweza kuonekana tayari kabisa kuruka — injini zinafanya kazi, mafuta yamejaa, abiria wamepanda. Lakini orodha ya uchunguzi ipo kwa sababu marubani wenye uzoefu wanajua kwamba vitu vyenye uwezekano mkubwa wa kusababisha matatizo ni hasa vile vinavyohisi sawa hadi wakati ambapo havifai. Orodha ya uchunguzi haimaanishi rubani hajui anachofanya. Inamaanisha wameweka ndani yao kwamba hata wataalam wanapoteza mambo wanaporuka mchakato ulioundwa.

**Hatua ya Kwanza ya Msanifu**

Kilichotokea baadaye kilishangaza timu.

Maya alianza kuelezea mfumo — vipengele vya EC2, Aurora, CloudFront, ElastiCache, DynamoDB kwa menyu, VPC yenye subneti za kibinafsi...

Carlos alimkatiza kwa upole.

"Anza na biashara," alisema. "Si teknolojia."

Alisita. Kisha: "Nimbus ni jukwaa la kuagiza la mgahawa. Tuna washirika 287 wa migahawa. Tunashughulikia karibu maagizo 4,200 kwa siku. Wastani wa thamani ya agizo ni $34. Tunakua 18% kwa robo."

"Nzuri. Kitu muhimu zaidi ambacho Nimbus lazima kifanye ni nini?"

"Kushughulikia maagizo," Leo alisema.

"Mahususi zaidi," Carlos alisisitiza.

"Agizo lazima lifike kwa mgahawa ndani ya sekunde tano baada ya kuwekwa," Priya alisema, "au jiko linakosa dirisha la wakati."

"Nini hutokea ikiwa halifiki?"

"Mgahawa anafanya kosa. Mteja anapata chakula kisicho sahihi, au anasubiri muda mrefu sana. Wanalalamika. Tunapoteza mshirika wa mgahawa."

"Kwa hivyo SLA ya sekunde tano," Carlos alisema, "si lengo la kiufundi. Ni mahitaji ya kuishi kwa biashara."

Ukimya.

"Hiyo," alisema, "ndiyo sababu mazungumzo ya usanifu lazima yaanze na mahitaji ya biashara. Teknolojia iko chini ya kizuizi."

**Muundo wa Mapitio ya Usanifu**

Mapitio halisi ya usanifu — aina inayotokea kabla ya kujenga kitu muhimu, au unapotathmini kama kupanua — ina muundo.

Carlos aliuandika kwenye ubao mweupe:

**1. Elewa vizuizi**

Nini lazima kiwe kweli? Nini kisitokee? (Si "tunachotaka." Mazuio yasiyoweza kujadiliwa ni yapi?)

**2. Elewa yasiyojulikana**

Hatujui nini? Tunafanya mawazo wapi? Nini hutokea ikiwa mawazo hayo si sahihi?

**3. Tathmini chaguo**

Ni mbadala gani halisi? Biashara za mbadala za kila moja ni zipi?

**4. Tambua hali za kushindwa**

Hii inavunjikaje? Mfululizo wa matukio ni nini kila hali ya kushindwa inapoanzishwa?

**5. Thibitisha ufuatiliaji**

Utajuaje lini kitu kimekosea? Kabla watumiaji hawajakuambia?

**6. Fafanua kitabu cha maelekezo**

Mtu anafanya nini saa 9 usiku hii inapovunjika?

Hii si orodha ya kukaguliwa kufuatwa kimitambo. Ni mfumo wa kufikiri. Lengo ni kuhakikisha maswali muhimu yanaulizwa *kabla* hujawa katika uzalishaji.

**Kuendesha Mapitio: Kipengele Kipya cha Nimbus**

Carlos alikuwa amealikwa mahususi kwa sababu Nimbus ilikuwa karibu kujenga kitu kipya.

**Kipengele**: "Nimbus Instant" — dhamana ya uwasilishaji wa dakika 15. Mgahawa mshirika ukishindwa kukidhi dirisha la dakika 15 zaidi ya mara moja kwa wiki, Nimbus angemrudishia mteja pesa kiotomatiki.

"Nielekeze kupitia mahitaji ya kiufundi," Carlos alisema.

Priya alianza. "Tunahitaji ufuatiliaji wa wakati halisi kutoka kuwekwa kwa agizo hadi uwasilishaji. Tunahitaji kulinganisha muda halisi wa uwasilishaji na SLA ya dakika 15. Tunahitaji kuanzisha marejesho kiotomatiki."

"Mahitaji ya latency kwa data ya ufuatiliaji ni nini?"

"Karibu na wakati halisi. Wateja wanaona masasisho ya hali kwenye simu zao."

"Ndani ya muda gani?"

"Sekunde tano pengine."

"Pengine?"

"Ndani ya sekunde tano. Hiyo ndiyo mahitaji ya bidhaa."

"Nzuri. Kinesis kwa mkondo wa matukio, basi. Hali ya kushindwa ikiwa Kinesis itacheleweshwa ni nini?"

"Masasisho ya hali yanachelewa kufika kwa mteja."

"Je, hiyo inakubalika?"

"Kwa sekunde 10? Pengine. Kwa sekunde 60? Hapana."

"Kwa hivyo SLA ya mfumo wa ufuatiliaji ni nini?"

Priya alimtazama Leo. "Bado hatuna moja."

Carlos aliandika kwenye ubao: *Haijulikana: SLA ya ufuatiliaji.*

"Hii ina umuhimu," alisema. "Kwa sababu SLA inabainisha muundo wa miundombinu. SLA yako ikiwa sekunde 5, unahitaji suluhisho tofauti kuliko ikiwa ni sekunde 60."

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza. "Kwa nini tusitumie tu utaratibu wa kupiga kura ambao programu inaangalia kila sekunde chache badala ya kusukuma kwa wakati halisi?"

"Latency na gharama," Carlos alisema. "Mbinu ya kupiga kura kwa kiwango kikubwa — sema, maagizo 10,000 hai, kila programu ikipiga kura kila sekunde 5 — ni maombi 2,000 kwa sekunde, au maombi 120,000 kwa dakika. Mfano wa kusukuma kupitia Kinesis hutoa masasisho tu hali inapobadilika. Maombi machache, latency ya chini, na ahadi ya SLA ni rahisi zaidi kukagua kutoka logi ya matukio. Kupiga kura kunafanya kazi kwa kiwango kidogo. Kwa kiwango ambacho Nimbus inaelekea, kusukuma ni msingi sahihi."

Leo alikuwa kimya wakati wote wa maelezo ya Carlos. Kisha: "Nilikuwa nitajenga hii na WebSockets."

Carlos alimtazama. "Nielekeze kupitia."

"Kila agizo linapata muunganisho wa WebSocket. Mteja anaunganisha agizo linapowekwa. Seva inasukuma mabadiliko ya hali — imethibitishwa, inaandaliwa, iko njiani, imewasilishwa — yanapotokea. Hakuna kupiga kura, latency ya chini, mfano rahisi."

"Nini kinadumisha muunganisho wa WebSocket?"

"Kituo cha WebSocket cha API Gateway. Kazi za Lambda zinashughulikia matukio ya muunganisho na ujumbe. DynamoDB inahifadhi vitambulisho vya muunganisho."

Carlos aliyaandika kwenye ubao. "Na hali ya kushindwa wakati mtandao wa mteja unaposhuka kwa sekunde 15?"

"Muunganisho unakomeshwa. Mteja anaunganisha tena na kuuliza hali ya sasa."

"Kutoka wapi?"

"Kutoka... mshughulikiaji wa Lambda, ambaye anasoma kutoka DynamoDB."

"Kwa hivyo una njia ya kusukuma na njia ya kuvuta," Carlos alisema. "Kusukuma kwa WebSocket ni njia ya furaha. Kusoma kwa DynamoDB ni njia ya uokoaji. Unahakikishaje muunganisho unaanzishwa upya kabla mteja kugundua hali ni ya zamani?"

Leo alifikiri. "Mteja anagundua kukatika na kuunganisha tena ndani ya sekunde chache. Mantiki ya kuunganisha tena ni rahisi."

"Kwa maagizo 10,000 hai kwa wakati mmoja — ambako Nimbus inaelekea — ni miunganisho mingapi ya WebSocket ya wakati mmoja hiyo?"

"10,000."

"WebSocket ya API Gateway ina kiwango cha chaguo-msingi cha **miunganisho mipya 500 kwa sekunde** kwa kila akaunti," Carlos alisema. "Si miunganisho ya wakati mmoja — *kiwango* cha muunganisho. Miunganisho thabiti 10,000 ni sawa. Tatizo ni dhoruba ya kuunganisha tena: mtandao unaposhuka kwa maelfu ya wateja kwa mara moja na wote wanaunganisha tena katika sekunde mbili zile zile, unagonga kiwango cha kikomo na kuunganisha tena kunaanza kushindwa hasa wakati watumiaji wanazingatia zaidi. Unaweza kuomba ongezeko, lakini ni kikomo ambacho ungekuwa ukikipitia tena unavyokua. Pia: WebSocket ya API Gateway inatoza $0.25 kwa kila dakika-muunganisho milioni, pamoja na $1.00 kwa kila ujumbe milioni. Kwa maagizo 10,000 kwa siku na dirisha la wastani la ufuatiliaji la dakika 40, hiyo ni takriban dakika-muunganisho 400,000 tu kwa siku — senti chache. Kwa maagizo 10,000 hai kwa wakati mmoja, ni kiwango tofauti."

"Hiyo si nyingi," Leo alisema.

"Si kwa maagizo 10,000 hai," Carlos alisema. "Kwa kiwango hicho, iite takriban $150 kwa mwezi na ada za dakika-muunganisho na ujumbe. Gharama si hoja dhidi ya WebSockets hapa. Kiwango cha kikomo cha muunganisho chini ya dhoruba za kuunganisha tena, na usimamizi wa hali ya muunganisho, ndiyo."

"Kwa hivyo WebSockets zinakuwa ngumu kwa kiwango kikubwa," Maya alisema.

"Zinakuwa za kusimamiwa kwa kiwango kikubwa ikiwa unaibunia," Carlos alisema. "Si kosa — ni seti tofauti ya biashara za mbadala. Sasa niwaonyeshe mbadala wa kupiga kura."

Alichora chaguo la pili.

"Kupiga kura: mteja anatuma ombi la GET kwa `/orders/{order_id}/status` kila sekunde 5. Sehemu ya nyuma inasoma kutoka DynamoDB. Inarudisha hali ya sasa."

"Hayo ni maombi mengi," Priya alisema.

"Maagizo 10,000 hai × kura 1 kwa sekunde 5 = maombi 2,000 kwa sekunde. API yako inahitaji kushughulikia RPS 2,000. DynamoDB inapanua kiotomatiki. API Gateway inashughulikia mzigo. Gharama: RPS 2,000 × sekunde 3,600 × masaa 24 × siku 30 = maombi bilioni 5.18 kwa mwezi. Bei za API Gateway REST API: $3.50 kwa kila maombi milioni = $18,130/mwezi."

Chumba kilikuwa kimya.

"Hilo si chaguo linaloweza kufanya kazi kwa kiwango kikubwa," Tom alisema.

"Sahihi," Carlos alisema. "Kupiga kura kwa vipindi vya sekunde 5 ni utekelezaji rahisi zaidi na ghali zaidi kwa kiwango kikubwa. Pia kunazalisha mzigo unaolingana na miunganisho hai, si unaolingana na mabadiliko ya hali. Ikiwa agizo linakaa katika 'inaandaliwa' kwa dakika 20, kupiga kura kunazalisha maombi 240 ambayo yote yanarudisha hali ile ile. Hiyo ni taka."

"Na Kinesis?" Maya aliuliza.

"Kinesis inazalisha tukio moja kwa kila mabadiliko ya hali. Uthibitisho wa agizo: tukio moja. Kukubaliwa na jiko: tukio moja. Kuchukuliwa na dereva: tukio moja. Uwasilishaji: tukio moja. Matukio manne kwa kila agizo, bila kujali kila hali inachukua muda gani. Mtumiaji — sehemu yako ya nyuma — anasoma kutoka mkondo wa Kinesis na kusukuma sasisho kwa mteja kupitia utaratibu wowote wa utoaji unaouchagua."

"Lakini mteja bado anahitaji njia ya kupokea kusukuma," Leo alisema.

"Ndiyo. Unaweza kutumia Server-Sent Events, kituo cha kura-ndefu, au WebSockets kwa utoaji wa kilometa-ya-mwisho. Kinesis inashughulikia mkondo wa matukio wa kuaminika, ulioagiziwa, unaoweza kuchezwa tena kwa sehemu yako ya nyuma. Utaratibu wa utoaji wa mteja ni uamuzi tofauti. Faida kuu: Kinesis inatenganisha chanzo cha tukio na mtumiaji. Mfumo wa ufuatiliaji wa uwasilishaji, mfumo wa marejesho, mfumo wa arifa za mgahawa, na onyesho la hali la mteja vyote vinatumia kutoka mkondo ule ule wa Kinesis kivyake."

"Kwa hivyo si Kinesis badala ya WebSockets," Maya alisema. "Ni Kinesis pamoja na utaratibu mwepesi zaidi wa utoaji wa mteja."

"Hasa. Uchambuzi wa biashara ya mbadala:"

Aliuandika:

| Chaguo | Latency | Gharama (maagizo hai 500 / 10K) | Ugumu |
|---|---|---|---|
| WebSockets pekee | ~50ms | $8 / $150 kwa mwezi | Wastani |
| Kupiga kura (5s) | 0–5s | $906 / $18,130 kwa mwezi | Chini |
| Kinesis + SSE | ~200ms | $8 / $75 kwa mwezi | Wastani-juu |

"Chaguo la kupiga kura linaondolewa na gharama," Carlos alisema. "WebSockets zinaweza kufanya kazi lakini zinahitaji usimamizi wa muunganisho kwa kiwango kikubwa. Kinesis pamoja na Server-Sent Events ina latency ya juu kidogo na inalingana kwa gharama — kile inachokununulia ni logi ya matukio ya kudumu, inayoweza kuchezwa tena unayoihitaji kwa mfumo wa marejesho, na watumiaji waliotenganishwa."

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza. "Ikiwa WebSockets zina latency ya chini, kwa nini kukubali latency ya juu kutoka Kinesis pamoja na SSE?"

"Je, 200ms dhidi ya 50ms inatambulika kwa mteja anayetazama sasisho la hali ya uwasilishaji?" Carlos aliuliza.

"Hapana," alisema.

"Basi tofauti ya latency iko chini ya kizingiti cha utambuzi. Tofauti ya gharama kwa maagizo elfu kumi hai ni ya wastani — $75 dhidi ya $150 kwa mwezi. Tofauti ya kiusanifu ndiyo hoja halisi: Kinesis inakupa logi ya matukio ya kudumu, inayoweza kuchezwa tena — ambayo utaihitaji kwa njia ya ukaguzi wa marejesho — na inatenganisha watumiaji wako wa ufuatiliaji. WebSockets zingehitaji ujenge upya utengano baadaye."

Leo aliangalia jedwali. "Tulikaribia kusafirisha toleo la WebSocket."

"Lingefanya kazi," Carlos alisema. "Hilo ndilo jambo muhimu kuelewa. WebSockets zingefanya kazi. Swali katika usanifu mara chache ni 'je, hii inafanya kazi?' Swali ni 'hii inagharimu nini inavyokua, na nini lazima tujenge upya baadaye?'"


**Maswali Wasanifu Wanayouliza**

Zaidi ya masaa mawili yaliyofuata, Carlos aliongoza timu kupitia mapitio. Uteuzi wa maswali yake:

**Kuhusu uhifadhi wa data**:

"Hali ya agizo imehifadhiwa wapi wakati wa utimilifu? Programu ikianguka katikati ya uwasilishaji, mchakato wa uokoaji ni nini? Je, unaweza kuunda upya hali kutoka matukio peke yake?"

**Kuhusu utaratibu wa marejesho**:

"Marejesho yanaanzishwa kiotomatiki. Nini kinazuia marejesho kutolewa mara mbili? Vipi ikiwa msindikaji wa malipo utaisha muda na huna uhakika kama marejesho yalikubaliwa?"

**Kuhusu ufuatiliaji wa uwasilishaji**:

"Unategemea data ya GPS ya msafirishaji. Nini hutokea ikiwa ishara ya GPS itapotea kwa sekunde 90? Unabainishaje tofauti kati ya 'GPS imepotea' na 'uwasilishaji unaendelea' na 'tatizo la uwasilishaji'?"

**Kuhusu kushughulikia kushindwa**:

"Ikiwa huduma ya marejesho iko chini, je, agizo bado linapita? Je, mteja bado anapata chakula chake? Uzoefu wa mtumiaji ni nini wakati wa kushindwa kwa sehemu ya mfumo?"

**Kuhusu uwezo wa kuona**:

"Unajuaje sasa hivi maagizo mangapi yako ndani ya dakika 5 ya SLA ya dakika 15? Nambari hiyo ikipanda, ni nani anayearifiwa?"

Kila swali lilifichua dhana ambayo timu ilikuwa ikiifanya bila kuitambua.

"Tayari niliisambaza — lo," Leo alisema. "Kituo cha marejesho. Nilikuwa nitaita tu API ya malipo moja kwa moja. Hatukufikiria kuhusu kuiita mara mbili." Alisita. "Kwa hivyo ikiwa simu ya kwanza itafanikiwa lakini uthibitisho wetu utapotea njiani, tunaita tena na mteja anapata marejesho mawili."

"Je, tumefikiria nini hutokea ikiwa API ya malipo itakubali simu ya kwanza lakini uthibitisho wetu utapotea njiani?" Priya aliuliza.

"Hiyo ni idempotency," Carlos alisema.

"Ufunguo wa idempotency — kitambulisho cha pekee kwa kila jaribio la marejesho, kilichohifadhiwa kwenye DB kabla ya kuita API ya malipo," Priya alisema. "Tukiita mara mbili kwa ufunguo ule ule, API ya malipo inapuuza simu ya pili."

"Ambayo inamaanisha," Carlos aliongeza, "kwamba unahitaji duka la hali la kudumu kwa shughuli za marejesho, si tu tukio katika foleni."


"Ufuatiliaji tuliojadili," Carlos alisema, "wote ni ufuatiliaji wa miundombinu. CPU. Idadi ya miunganisho. Kuchelewa kwa Kinesis. Hivi ni muhimu — lakini si ufuatiliaji unaokuambia kama Nimbus Instant inafanya kazi."

"Ni ufuatiliaji gani unaotuambia inafanya kazi?" Maya aliuliza.

"Muda wa uthibitisho wa P95 kwa kila mgahawa. Inachukua muda gani, kwa asilimia ya 95, kutoka kuwekwa kwa agizo hadi uthibitisho wa mgahawa — kupimwa kivyake kwa kila mshirika wa mgahawa?"

"Hatuna kipimo hicho," Priya alisema.

"Hilo ndilo pengo," Carlos alisema. "Unaweza kuwa na miundombinu kamili — CloudWatch ikiwa kijani kwenye kila tahadhari — na bado kuwa na mshirika wa mgahawa ambaye latency yake ya uthibitisho imekuwa ikidhoofika kwa wiki tatu kwa sababu programu ya kompyuta yao ya kibao ina hitilafu. Miundombinu ni sawa. SLA ya biashara inakiukwa. Na hutajua hadi mgahawa apige simu kulalamika."

"Tunainasaje hiyo?" Leo aliuliza.

"Toa kipimo maalum cha CloudWatch au sukuma kwa mzunguko wako wa uchambuzi kila wakati uthibitisho wa agizo unapopokewa. Weka muhuri wa wakati kwa kuwekwa kwa agizo. Weka muhuri wa wakati kwa uthibitisho. Hesabu tofauti. Itoe ikiwa imewekewa lebo ya `restaurant_id`. Jenga dashibodi ya CloudWatch inayoonyesha muda wa uthibitisho wa p95 kwa mgahawa katika siku 7 zilizopita."

"Na tahadhari unapodhoofika?" Tom aliuliza.

"Tahadhari wakati p95 kwa mgahawa mahususi inazidi sekunde 90 kwa zaidi ya dakika 5 mfululizo," Carlos alisema. "Hiyo ni hali isiyo ya kawaida inayostahili kufikiwa kwa makini, si jibu la kusubiri-malalamiko."

"Hii ndiyo tofauti kati ya kufuatilia miundombinu na kufuatilia bidhaa," Priya alisema.

"Hasa," Carlos alisema. "Ufuatiliaji wa miundombinu unakuambia kama mifumo yako ina afya. Ufuatiliaji wa kiwango cha biashara unakuambia kama wateja wako wanaopata kile ulichowaahidi. Unahitaji vyote viwili. Timu nyingi zina cha kwanza tu."

Maya aliiongeza kwenye kiambatisho cha ADR: fuatilia muda wa uthibitisho wa p95 kwa kila mgahawa pamoja na vipimo vya afya ya miundombinu. Vizingiti vya tahadhari vitabainishwa na timu ya bidhaa kwa kushauriana na timu ya mafanikio ya mgahawa.

"Hapa pia ndipo ufuatiliaji wa gharama na ufuatiliaji wa biashara vinakutana," Tom alisema. "Ikiwa latency yetu ya uthibitisho inapanda kwa sehemu ya migahawa jioni za Ijumaa, chanzo kinaweza kuwa uanzishaji wa baridi wa Lambda ukigonga shadi za migahawa hiyo katika Kinesis. Kipimo cha biashara kinafichua dalili. Vipimo vya miundombinu vinafichua sababu."

"Na suluhisho linaweza kutokuwa miundombinu zaidi," Carlos alisema. "Inaweza kuwa concurrency iliyotolewa kwenye kazi mahususi ya Lambda. Au inaweza kuwa kuratibu upya shadi. Au inaweza kuwa hitilafu katika kituo cha uthibitisho cha mgahawa. Huwezi kujua ipi hadi uwe na tabaka zote mbili za uwezo wa kuona."

"Je, tumefikiria nini hutokea ikiwa tutarekebisha miundombinu na kipimo cha biashara bado hakiimariki?" Priya aliuliza.

"Basi chanzo si katika miundombinu," Carlos alisema. "Ambayo ni taarifa yenye thamani. Bila kipimo cha biashara, ungekuwa ukifuatilia maboresho ya miundombinu kwa tatizo linaloishi mahali pengine."


"Hii inagharimu kiasi gani kwa mwezi tukiwa na uwasilishaji 500 wa wakati mmoja unaofuatiliwa?" Tom aliuliza. "Duka la hali, mkondo wa Kinesis, kazi za Lambda zinazochakata matukio?"

Carlos alitikisa kichwa. "Hilo ndilo swali sahihi kuuliza sasa, wakati unabuni, si baada ya kuijenga."

Hii ndiyo aina ya maelezo ya kiusanifu yanayojitokeza katika mapitio yaliyoundwa — na mara nyingi hayajitokezi unapokuwa unajenga tu.

**Rekodi ya Uamuzi wa Usanifu**

Baada ya mapitio, Carlos alipendekeza timu iandike maamuzi yao katika **Rekodi za Uamuzi wa Usanifu (Architecture Decision Records - ADRs)** — hati fupi zinazonasa:

- **Uamuzi gani ulifanywa**
- **Mbadala gani zilizingatiwa**
- **Kwa nini uamuzi huu ulifanywa (muktadha na vizuizi wakati huo)**
- **Biashara za mbadala ni zipi**
- **Nini kingetufanya tupitie tena uamuzi huu**

Huenda unajiuliza: je, ADR zinahitaji kuwa hati rasmi? Hapana. ADR inaweza kuwa aya katika uzi wa Slack ikiwa ndipo timu yako inafanya kazi. Muundo hauna umuhimu. Kitendo cha kuandika kile ulichoamua na kwa nini — kabla ya kuendelea — ndicho kinachounda kumbukumbu ya kitaasisi.

"ADR ni kwa ajili ya nafsi yako ya baadaye," Carlos alisema. "Katika miezi 18, utaangalia kipande cha usanifu na kujiuliza kwa nini kilifanywa hivyo. Ukiwa na ADR, utaelewa muktadha. Bila moja, ama utakiacha peke yake (kwa sababu unaogopa kukigusa) au utakibadilisha (kwa sababu hukuelewa kwa nini kilifanywa hivyo)."

Leo aliandika ADR ya kwanza mchana huo: uamuzi wa kutumia Kinesis kwa matukio ya ufuatiliaji wa uwasilishaji, na muktadha, mbadala zilizozingatiwa (SQS, EventBridge, kupiga kura), na biashara za mbadala.

Carlos aliangalia ADR ambayo Leo alikuwa ameandaa. Aliisoma katika sekunde thelathini. Kisha akasema: "Onyesha timu jinsi ADR-007 inavyoonekana."

Leo aliionyesha kwa projekta.

---

**ADR-007: Miundombinu ya Matukio ya Ufuatiliaji wa Uwasilishaji**

**Tarehe**: 2025-03-14
**Hali**: Imekubaliwa
**Mwandishi**: Leo (na mapitio kutoka Carlos, Priya)

---

**Tatizo**

Nimbus Instant inahitaji ufuatiliaji wa hali ya uwasilishaji wa wakati halisi. Maagizo lazima yasasishe hali yao (imethibitishwa → inaandaliwa → iko njiani → imewasilishwa) na kuyafanya masasisho hayo yajitokeze kwenye programu ya simu ya mteja ndani ya sekunde 5 za mabadiliko ya hali. Mfumo wa marejesho pia unahitaji logi inayoweza kukaguliwa, inayoweza kuchezwa tena ya matukio ya uwasilishaji ili kuamua uzingatifu wa SLA.

---

**Chaguo Zilizozingatiwa**

**Chaguo 1: API Gateway WebSocket + hali ya DynamoDB**
- Mteja anadumisha muunganisho wa WebSocket kwa kila agizo
- Sehemu ya nyuma inasukuma mabadiliko ya hali juu ya muunganisho ulio wazi
- Wakati wa kuunganisha tena, mteja anavuta hali ya sasa kutoka DynamoDB
- Gharama iliyokadiriwa kwa kiwango kikubwa (maagizo 10K hai kwa wakati mmoja): ~$150/mwezi
- Udhaifu: Usimamizi wa kikomo cha muunganisho kwa kiwango kikubwa; hakuna kucheza tena kilichojengwa kwa ukaguzi

**Chaguo 2: Kupiga kura kwa mteja (kipindi cha sekunde 5)**
- Mteja anapiga kura `/orders/{order_id}/status` kila sekunde 5
- Sehemu ya nyuma inasoma kutoka DynamoDB kwa kila kura
- Utekelezaji rahisi zaidi
- Gharama iliyokadiriwa kwa kiwango kikubwa (maagizo 10K hai kwa wakati mmoja): $18,130/mwezi
- Imeondolewa kwa sababu ya gharama

**Chaguo 3: Kinesis Data Streams + Server-Sent Events**
- Mabadiliko ya hali ya uwasilishaji yanachapishwa kwa mkondo wa Kinesis, yaliyotolewa saizi kwa kiwango cha upitishaji: shadi moja inameza 1 MB/s au rekodi 1,000/s. Kwa maagizo 10K hai (~matukio 4 ya mabadiliko ya hali kwa kila agizo, mizigo midogo ya JSON), kiwango cha juu cha kuandika ni ~matukio 40-50/s — kiwango cha shadi moja. Toa shadi 3 kwa mtawanyiko wa kizigeu na nafasi ya mtumiaji.
- Kituo cha SSE kinajiandikisha kwa shadi ya Kinesis iliyopangiwa kizigeu cha agizo
- Mteja anapokea matukio ya SSE; anaunganisha tena kwa kutumia API ya kawaida ya EventSource
- Gharama iliyokadiriwa kwa kiwango kikubwa (maagizo 10K hai kwa wakati mmoja): ~$75/mwezi
- Inatoa logi ya matukio ya kudumu, inayoweza kuchezwa tena; inatenganisha watumiaji wote

---

**Uamuzi**

Chaguo 3: Kinesis Data Streams + SSE.

Sababu: faida ya gharama ni kubwa kwa kiwango kikubwa; logi ya matukio ya Kinesis inakidhi mahitaji ya ukaguzi wa marejesho bila utekelezaji tofauti wa njia ya ukaguzi; kushughulikia kuunganisha tena kwa SSE ni rahisi zaidi kuliko usimamizi wa muunganisho wa WebSocket kwa kiwango kikubwa.

---

**Matokeo**

- *Chanya*: Mfumo wa marejesho, mfumo wa arifa za mgahawa, na programu ya mteja vyote vinatumia kutoka mkondo ule ule wa Kinesis kivyake. Watumiaji wapya wanaweza kuongezwa bila kubadilisha mzalishaji.
- *Chanya*: Matukio yanaweza kuchezwa tena hadi siku 7 (uhifadhi wetu uliopanuliwa uliosanidiwa; Kinesis inasaidia hadi siku 365 kwa gharama ya ziada). Ikiwa Lambda ya kuchakata marejesho itashindwa, inaweza kucheza tena matukio yaliyokoswa.
- *Hasi*: Latency ya SSE (~200ms) ni juu kuliko latency ya WebSocket (~50ms). Inakubalika kwa sababu tofauti hii iko chini ya kizingiti cha utambuzi wa mteja kwa masasisho ya hali.
- *Hasi*: Bei iliyotolewa ya Kinesis inapanua na masaa ya shadi, na uhifadhi uliopanuliwa unaongeza takriban mara mbili gharama kwa kila shadi. Nafasi ya upitishaji ni kubwa (shadi moja inameza rekodi 1,000/s), lakini idadi ya watumiaji na mzigo wa kusoma kwa kila mtumiaji unavyokua zaidi ya takriban maagizo 50K hai kwa siku, idadi ya shadi — na mkakati wa kuratibu upya/kusambaza watumiaji — itahitaji kupitiwa tena.

**Nini kingetufanya tupitie tena uamuzi huu**: Ikiwa kiasi cha maagizo kitakua hadi mahali ambapo gharama za shadi za Kinesis zitazidi gharama za WebSocket kwa kiwango kipya, au ikiwa latency ya SSE ya 200ms itakuwa tatizo la kutofautisha bidhaa.

---

"Mstari wa mwisho," Maya alisema. "Huo ndio ambao sikuwa nimeufikiria."

"Kichocheo cha kupitia tena," Carlos alisema. "Kila uamuzi una masharti ambayo chini yake unakuwa si sahihi. Kuyaandika kunamaanisha utayatambua yanapojitokeza."

"Badala ya kuyagundua katika post-mortem," Priya alisema.

"Badala ya hilo, ndiyo."

Tom alikuwa akisoma matokeo ya gharama. "Mkakati wa kuratibu upya na kusambaza — hatuna huo bado."

"Hauhitaji hadi maagizo 50K hai kwa siku," Carlos alisema. "Kwa migahawa yako ya sasa 287 na maagizo 4,200 kwa siku, una nafasi kubwa. ADR inakuambia nini cha kujenga kabla halijawa la dharura, si kabla halijawa la maana."

Leo alikuwa akiandika maelezo. "ADR inafanya mambo mawili," alisema. "Inaandika kile tulichoamua. Na inaandika kile tungehitaji kuamua kinachofuata ikiwa hali itabadilika."

"Hicho ndicho kinachofanya ADR kuwa na manufaa kwa miezi kumi na nane," Carlos alisema. "Si uamuzi wenyewe — maamuzi yanapitwa na wakati. Hoja. Hoja inakuambia kama uamuzi unapaswa kupitiwa tena, hata wakati uamuzi bado uko mahali pake."


**Kinachomfanya Msanifu**

Mwishoni mwa kipindi, Maya alimuuliza Carlos swali la asili: "Tofauti ni nini kati ya kufanya maamuzi ya usanifu na kufikiri kama msanifu?"

Aliifikiria.

"Msanifu hajui teknolojia zaidi kuliko mhandisi mwandamizi," alisema. "Msanifu mzuri pengine anajua kidogo zaidi ya mifumo ya hivi karibuni kabisa. Lakini msanifu ana seti tofauti ya maswali ya chaguo-msingi."

"Unamaanisha nini?"

"Ukiwa mhandisi mwandamizi ukitazama kipengele kipya, maswali yako ya kwanza kwa kawaida ni: 'Tunajenga nini? Inafanya kazi vipi? Maktaba bora kwa hili ni ipi?' Msanifu akitazama kipengele kile kile, maswali ya kwanza ni: 'Tatizo hili linatatua nini? Nini kinavunjika kwanza trafiki ikiongezeka mara mbili? Tunajuaje kinapodhoofika? Uzoefu wa mtumiaji ni nini msindikaji wa malipo ukiwa polepole?'"

"Msanifu anauliza kuhusu mfumo chini ya shinikizo," Leo alisema.

"Na kuhusu matokeo ya biashara ya kila kushindwa," Priya aliongeza.

"Na," Tom alisema, "kuhusu nini hutokea kwa bili hii ikipanua."

Carlos alitikisa kichwa. "Nyote tayari mnafanya hivi. Mmekuwa mkifanya tangu Sura ya 1. Tofauti kati ya mhandisi mwandamizi na msanifu si cheti au jina. Ni tabia ya kuuliza swali linalofuata — lile linalofichua kitu ambacho bado hujakifikiria."

**Tofauti: Wakati Mapitio ya Usanifu Yanapoongeza Hatari Badala ya Kuiondoa**

Ikiwa mapitio yako yanatibiwa kama lango la idhini badala ya mchakato wa kujifunza, timu zitaanza kuficha chaguo za muundo ili kuepuka ucheleweshaji — na hali za kushindwa bado zitakuwepo, tu hazijaandikwa. Mapitio ya usanifu yanayopunguza kasi ya usafirishaji bila kuboresha ubora ni mabaya zaidi ya kutokuwa na mapitio kabisa.

Ikiwa tatizo la idempotency kwa huduma ya marejesho lingetibiwa kama ucheleweshaji usiotarajiwa kwa uzinduzi wa kipengele badala ya ugunduzi wa lazima, Leo angesafirisha kituo cha awali, marejesho mara mbili hatimaye yangetokea, na timu ingejifunza kuhusu hilo kutoka kwa mteja mwenye hasira. Mapitio yanafichua tatizo katika hatua ambapo kulirekebisha kunagharimu siku, si kurudisha nyuma.

Thamani ya mapitio inalingana na jinsi timu inavyokuwa tayari kuyaruhusu kubadilisha muundo.

## Nguvu na Mipaka

**Mapitio ya usanifu**:

- Yanashika hali za kushindwa kabla hazijawa katika uzalishaji
- Yanaunda uelewa wa pamoja kati ya wanachama wa timu ambao mara nyingi wana ujuzi uliotengwa
- Yanazalisha nyaraka (ADR) zinazolipa gawio kwa miaka
- Yanapunguza kasi ya kufanya maamuzi kwa njia zenye manufaa — "sogea haraka" bila mapitio ni "sogea haraka na gonga ukuta usioouona"

**Mahali ambapo yanakuwa magumu**:

- Yanahitaji mtu mwenye ujuzi wa kutosha kuuliza maswali sahihi — mapitio ni mazuri sawa na mpitiaji
- Yanaweza kuwa ya kibyokrasia ikiwa yanatibiwa kama kisanduku cha kukagua badala ya mazungumzo
- Baadhi ya maamuzi ya usanifu kwa kweli hayahitaji mapitio kamili — kujua yapi yanayohitaji yenyewe ni ujuzi wa kiusanifu
- Matokeo (ADR, michoro, kumbukumbu za maamuzi) lazima yadumishwe mfumo unavyobadilika

## Muhtasari

Mapitio na Carlos yalikuwa yamechukua masaa mawili na kuzalisha ADR tatu, orodha ya yasiyojulikana sita ya kutatua kabla kipengele kujengwa, na mabadiliko moja ya kiusanifu (duka la hali la idempotency) ambalo lingekuwa la uchungu kuongeza baada ya uzinduzi. Sitiari ya orodha ya uchunguzi ya kabla-ya-kuruka ilishikilia wakati wote: hakuna kitu cha maafa kilichogundulika, lakini vitu kadhaa ambavyo vingesababisha matatizo baadaye vilishikwa na kuandikwa wakati bado vilikuwa rahisi kurekebisha.

- Mapitio ya usanifu yanaanza na **mahitaji ya biashara, si teknolojia**.
- Muundo wa mapitio: vizuizi → yasiyojulikana → chaguo → hali za kushindwa → ufuatiliaji → vitabu vya maelekezo.
- Wasanifu wanauliza: Nini kinavunjika kwanza? Tunajuaje kimedhoofika? Uzoefu wa mtumiaji ni nini wakati wa kushindwa? Gharama ni nini kwa kiwango kikubwa?
- **Rekodi za Uamuzi wa Usanifu (ADRs)** zinanasa kile kilichoamuliwa, kwa nini, na nini kingesababisha kupitiwa tena.
- Kufikiri kama msanifu ni tabia: kuuliza swali linalofuata, hasa kuhusu hali za kushindwa, matokeo ya biashara, na uchumi wa kiwango.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Msalaba wa vikoa — hoja ya kiusanifu*

Sura hii ina mada chache mahususi za mtihani na zaidi kuhusu mtazamo ambao mtihani unajaribu.

- **Hali za SAA-C03** karibu kila wakati zinaelezea kizuizi cha biashara kwanza ("kampuni haiwezi kumudu zaidi ya saa 1 ya kutofanya kazi") na kukuuliza uchague usanifu unaokidhi. Fanya mazoezi ya kubadilisha vizuizi vya biashara kuwa mahitaji ya kiufundi.
- **Kufikiri hali za kushindwa**: Maswali mengi ya mtihani yanaelezea mfumo na kuuliza nini hutokea kipengele kikishindwa. Fanya mazoezi ya kuuliza "nini kinavunjika kwanza?" kwa miundo unayokutana nayo.
- **Kufikiri kuhusu biashara za mbadala**: Mtihani mara chache una jibu "kamili." Unauliza jibu *bora* ukizingatia seti ya vizuizi. Jisikie vizuri na "chaguo hili ni sahihi ukizingatia mahitaji haya mahususi, ingawa chaguo lingine lingekuwa bora chini ya mahitaji tofauti."
- **Rekodi za Uamuzi wa Usanifu**: Si huduma ya AWS, lakini mbinu bora inayoonyesha nguzo ya Ubora wa Uendeshaji ya Mfumo wa Ujenzi Bora.
- **Kinesis kwa upitishaji wa matukio wa wakati halisi**: Kipengele cha Nimbus Instant cha sura hii kinatumia Kinesis kwa upitishaji wa matukio ya uwasilishaji. Ishara ya mtihani: "kumeza matukio ya wakati halisi na uchakataji ulioagiziwa" → Kinesis Data Streams. "Tenganisha vipengele, utoaji wa angalau-mara-moja" → SQS. Kujua wakati wa kufikia kila moja ni muundo wa mtihani unaorudia.
- **Idempotency kama muundo unaoweza kujaribiwa**: SAA-C03 mara kwa mara unajaribu idempotency katika mifumo iliyosambazwa. Muundo wa msingi: zalisha ufunguo wa pekee wa idempotency kabla ya kuita mfumo wa nje; hifadhi ufunguo na matokeo; wakati wa kujaribu tena, angalia ufunguo uliopo kabla ya kutekeleza tena. Ukipatikana, rudisha matokeo yaliyohifadhiwa awali bila kutekeleza tena. Hii inazuia malipo mara mbili, kutuma mara mbili, na mabadiliko ya hali ya nakala wakati majaribio mapya yanatokea baada ya muda wa kuisha wa mtandao. Ishara ya mtihani: "zuia operesheni za nakala wakati simu ya huduma inajaribiwa tena" au "hakikisha uchakataji wa hasa-mara-moja wa matukio ya malipo" → ufunguo wa idempotency uliohifadhiwa katika DynamoDB na uandishi wa masharti.
- **Server-Sent Events dhidi ya WebSockets**: SSE ni ya upande mmoja (seva hadi mteja), inatumia HTTP ya kawaida, na inaunganisha tena kiotomatiki kupitia API ya EventSource. WebSockets ni za pande mbili, zinahitaji usimamizi wa muunganisho, na zinafaa wakati mteja pia anahitaji kusukuma data kwa seva. Kwa masasisho ya hali ya uwasilishaji (seva-hadi-mteja tu), SSE ni rahisi na nafuu zaidi kuliko WebSockets kwa kiwango kikubwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Carlos aliuliza aina sita za maswali wakati wa mapitio ya usanifu. Je, unaweza kuziunda upya bila kutazama sura?

*(Kidokezo: Zimeorodheshwa katika sehemu ya "Muundo wa Mapitio ya Usanifu." Jaribu kuzikumbuka kutoka kumbukumbu — kitendo cha kujaribu kukumbuka (hata ukishindwa) kinaimarisha uhifadhi wa muda mrefu.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni inajenga mfumo wa usimamizi wa zabuni wa wakati halisi kwa matangazo ya mtandaoni. Zabuni lazima zitathminiwe na kujibiwa ndani ya millisekunde 100. Mfumo unachakata zabuni milioni 1 kwa sekunde wakati wa kilele. Mfumo wa zabuni ukiwa chini, kampuni inapoteza mapato ya matangazo. Timu ya hifadhidata ya kampuni inapendekeza kutumia RDS Aurora yenye nakala 10 za kusomwa. Msanifu wa suluhisho lazima atathmini kama pendekezo linaweza kufanya kazi kimsingi kabla ya kupitia sifa zake za pili.

Ni wasiwasi gani msanifu anapaswa kuinua KWANZA?

A) Gharama ya nakala 10 za Aurora ni juu sana kwa bajeti  
B) Nakala za Aurora za kusomwa zina kuchelewa kwa upokezaji ambako kunaweza kusababisha matatizo ya uthabiti  
C) Latency ya kawaida ya hoji ya Aurora ya millisekunde 1-5 inaweza isikidhi SLA ya majibu ya millisekunde 100  
D) RDS Aurora haisaidii kiwango cha miamala cha maombi milioni 1 kwa sekunde kwa mahitaji haya ya latency

**Kidokezo cha 1**: Kizuizi cha msingi ni muda wa jumla wa majibu wa millisekunde 100 kwa maombi milioni 1 kwa sekunde. Ni wasiwasi gani kati ya hawa, ukiwa halali, unafanya pendekezo lisiweze kufanya kazi bila kujali jinsi watatu wengine wanavyoshughulikiwa?

**Kidokezo cha 2**: Latency ya hoji ya Aurora kwa kawaida ni millisekunde 1-5. Millisekunde 1-5 kwa hoji ya hifadhidata huacha millisekunde 95-99 kwa mtandao, mantiki ya programu, na uratibu. Je, kizuizi cha millisekunde 100 kiko hatarini?

**Kidokezo cha 3**: Aurora inaweza kushughulikia IOPS nyingi, lakini maombi milioni 1 kwa sekunde ni kiwango cha ajabu. Nini hutokea kwa usanifu kwa kiwango hicho?

**Jibu**: D

**Maelezo**: Ingawa Aurora ina utendaji wa juu, maombi milioni 1 kwa sekunde kwa muda wa jumla wa majibu wa millisekunde 100 ni mahitaji ya kupita kiasi — ni kizuizi cha kiusanifu kinachoamua kama pendekezo linaweza kuwepo kabisa. Msanifu kwanza anapaswa kuuliza kama Aurora (au hifadhidata yoyote ya uhusiano) inaweza kuhudumu kama mfumo wa msingi wa kutafuta kwa kiwango hiki na latency. Mifumo kama hii kwa kawaida hutumia maduka ya data ya kwenye kumbukumbu (Redis) au hifadhidata maalum za latency ya chini, si hifadhidata za uhusiano zenye semantiki kamili za SQL. SLA ya millisekunde 100 inawezekana kwa hoji za Aurora peke yake, lakini mchanganyiko wa RPS 1M na SLA ya jumla ya millisekunde 100 unazidi sifa za kawaida za upitishaji wa Aurora. "KWANZA" inamaanisha uwezekano kabla ya uboreshaji: ikiwa injini haiwezi kuhimili mzigo, kila wasiwasi mwingine kuhusu pendekezo hauna maana.

**Kwa nini si A?** Gharama ni wasiwasi halali, lakini wasiwasi wa kwanza unapaswa kuwa kama usanifu unaweza kufanya kazi kiufundi kwa mahitaji yaliyoelezwa.

**Kwa nini si B?** Kuchelewa kwa upokezaji ni sifa halisi lakini ya *pili* ya pendekezo — mali unayoiratibu mara usanifu unapokuwa na uwezekano. Kuchelewa kwa nakala ya Aurora kwa kawaida ni <millisekunde 100 na kunakubalika kwa matumizi mengi; kuinua kwanza kungemaanisha kujadili tabia ya uthabiti ya mfumo usioweza kuhimili upitishaji unaohitajika kwanza. Swali la uwezekano (D) linajumuisha.

**Kwa nini si C?** Latency ya Aurora ya millisekunde 1-5 iko vizuri ndani ya SLA ya millisekunde 100 kwa sehemu ya hoji ya hifadhidata. Huu si wasiwasi wa msingi.

*SAA-C03 Kikoa: Msalaba wa vikoa — muundo wa mfumo*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Tumia muundo wa mapitio ya usanifu kwa mfumo halisi au wa kinadharia:

Kampuni mpya inataka kujenga mchezo wa maswali wa wachezaji wengi wa wakati halisi. Wachezaji wanajiunga na vyumba vya mchezo (hadi wachezaji 10 kila kimoja). Kila duru inaonyesha swali kwa sekunde 15; wachezaji wote wanajibu kwa wakati mmoja. Alama zinajumlishwa papo hapo baada ya kila swali. Michezo hudumu raundi 10. Kilele cha matumizi: michezo 50,000 ya wakati mmoja.

Pitia mapitio ya hatua sita:

1. Vizuizi visivyoweza kujadiliwa ni vipi?
2. Yasiyojulikana na mawazo ni yapi?
3. Chaguo za teknolojia halisi ni zipi?
4. Hali za kushindwa ni zipi?
5. Utajuaje lini imedhoofika?
6. Kitabu cha maelekezo cha saa 9 usiku kinaonekanaje?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya muundo wa mapitio kama zana ya kufikiri.)*

## Tukio Baada ya Mikopo

Carlos aliondoka ofisini saa 12 jioni.

Timu ilikaa kwa muda baadaye, bila kufanya chochote maalum.

"Nahisi nilijifunza zaidi katika masaa mawili hayo kuliko katika sura yoyote ya huduma ya AWS ya mtu mmoja," Leo alisema.

"Hiyo ni kwa sababu sura hizo zilikuwa kuhusu zana," Maya alisema. "Hii ilikuwa kuhusu hukumu."

"Je, hukumu inaweza kufundishwa?" aliuliza.

"Ndiyo," Priya alisema. "Lakini si kwa kusoma. Kwa mazoezi. Kwa kufanya maamuzi, kuona kinachovunjika, kufikiri kwa nini."

"Kwa uzoefu," Tom alisema.

"Kwa uzoefu ulioundwa," Priya alisahihisha. "Uzoefu bila tafakuri haujengi hukumu. Lazima uulize maswali baadaye."

Maya alitazama ubao mweupe. Maelezo ya mapitio bado yalikuwepo — vizuizi, yasiyojulikana, hali za kushindwa, maswali ya ufuatiliaji. Yalijaza mbao mbili nyeupe.

"Hii inapaswa kwenda kwenye ADR," alisema.

Leo alikuwa tayari akiandika.

Katika sura ya mwisho: jambo moja ambalo hakuna zana au mfumo unaoweza kukupa — na kwa nini "inategemea" ni jibu la uaminifu zaidi na lenye nguvu zaidi katika usanifu wa programu.
