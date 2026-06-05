# Sura ya 32: Kutetea Mpango

Swali la Maya mwishoni mwa Sura ya 31: "Tofauti ni nini kati ya kufanya maamuzi ya usanifu na kufikiria kama msanifu?"

Alikuwa amemwalika mgeni kusaidia kujibu.

Jina lake lilikuwa Carlos. Alikuwa mhandisi kwa miaka 20, meneja wa uhandisi kwa saba, na mshauri wa startups kwa miaka mitatu. Alikuwa aina ya mtu ambaye ameyaona mifumo ya kutosha kufanikiwa na kushindwa ili awe na silika iliyoratibiwa kuhusu zote mbili.

Alifika bila chochote: bila slaidi, bila ajenda. Alama ya ubao peke yake na swali.

"Niambie kuhusu Nimbus," alisema.

Mapitio mazuri ya usanifu yanafanana na orodha ya uchunguzi ya rubani kabla ya kuruka. Ndege inaweza kuonekana tayari kabisa kuruka — injini zinafanya kazi, mafuta yamejaa, abiria wamepanda. Lakini orodha ya uchunguzi ipo kwa sababu marubani wenye uzoefu wanajua kwamba vitu vinavyoweza zaidi kusababisha matatizo ni hasa vile ambavyo vinahisi sawa hadi wakati vinafanya kazi. Orodha ya uchunguzi haimaanishi rubani hajui anachofanya. Inamaanisha wameweka ndani yao kwamba hata wataalam wanapoteza mambo wakikiruka mchakato ulioandaliwa.

**Hatua ya Kwanza ya Msanifu**

Kilichotokea baadaye kilishangaza timu.

Maya alianza kuelezea mfumo — vipengele vya EC2, Aurora, CloudFront, ElastiCache, DynamoDB kwa orodha, VPC yenye subnet za kibinafsi...

Carlos alimkatiza kwa upole.

"Anza na biashara," alisema. "Si teknolojia."

Alisimama. Kisha: "Nimbus ni jukwaa la kuagiza la mgahawa. Tuna washirika 287 wa mgahawa. Tunashughulikia karibu maagizo 4,200 kwa siku. Wastani wa thamani ya agizo ni $34. Tunakua 18% kwa robo mwaka."

"Nzuri. Kitu muhimu zaidi ambacho Nimbus lazima kifanye ni nini?"

"Shughulikia maagizo," Leo alisema.

"Maalum zaidi," Carlos alisisitiza.

"Agizo lazima lifike kwa mgahawa ndani ya sekunde tano baada ya kuwekwa," Priya alisema, "au jikoni inakosa dirisha la wakati."

"Kinatokea nini ikiwa halifiki?"

"Mgahawa anafanya kosa. Mteja anapata chakula kibaya, au anasubiri muda mrefu. Wanalalamika. Tunapoteza mshirika wa mgahawa."

"Kwa hivyo SLA ya sekunde tano," Carlos alisema, "si lengo la kiufundi. Ni mahitaji ya kuishi kwa biashara."

Ukimya.

"Hiyo," alisema, "ndiyo maana mazungumzo ya usanifu lazima yaanziane na mahitaji ya biashara. Teknolojia ni ya chini ya kizuizi."

**Muundo wa Mapitio ya Usanifu**

Mapitio ya kweli ya usanifu — aina inayotokea kabla ya kujenga kitu muhimu, au wakati wa kutathmini kama kupanua — ina muundo.

Carlos aliuandika kwenye ubao mweupe:

**1. Elewa kizuizi**

Nini lazima kiwe kweli? Nini kisitokee? (Si "tunachotaka." Mazuio yasiyoweza kubadilishwa ni nini?)

**2. Elewa yasiyojulikana**

Hatujui nini? Tunapofikiri mahali gani? Kinachotokea ikiwa mawazo hayo ni mabaya?

**3. Kadiria chaguo**

Ni mbadala gani za kweli? Uwiano wa kila moja ni nini?

**4. Tambua hali za kushindwa**

Hii inavunjika vipi? Mfululizo wa matukio ni nini kila hali ya kushindwa inapoanzishwa?

**5. Thibitisha ufuatiliaji**

Utajuaje kitu kimekosea? Kabla ya watumiaji kukuambia?

**6. Fafanua kitabu cha maelekezo**

Mtu anafanya nini saa 3 asubuhi hii ikivunjika?

Hii si orodha ya kukaguliwa kwa njia ya kizuizi. Ni mfumo wa kufikiria. Lengo ni kuhakikisha maswali muhimu yanaulizwa *kabla* ya kuwa katika uzalishaji.

**Kuendesha Mapitio: Kipengele Kipya cha Nimbus**

Carlos alikuwa amealikwa mahususi kwa sababu Nimbus ilikuwa karibu kujenga kitu kipya.

**Kipengele**: "Nimbus Instant" — dhamana ya uwasilishaji wa dakika 15. Mgahawa mshirika ukishindwa kukidhi dirisha la dakika 15 zaidi ya mara moja kwa wiki, Nimbus angerudisha mteja pesa kiotomatiki.

"Niniambie mahitaji ya kiufundi," Carlos alisema.

Priya alianza. "Tunahitaji ufuatiliaji wa wakati halisi kutoka kuwekwa kwa agizo hadi uwasilishaji. Tunahitaji kulinganisha muda halisi wa uwasilishaji na SLA ya dakika 15. Tunahitaji kuanzisha marejesho kiotomatiki."

"Mahitaji ya latency kwa data ya ufuatiliaji ni nini?"

"Karibu na wakati halisi. Wateja wanaona masasisho ya hali kwenye simu zao."

"Ndani ya muda gani?"

"Sekunde tano labda."

"Labda?"

"Ndani ya sekunde tano. Hiyo ndiyo mahitaji ya bidhaa."

"Nzuri. Kinesis kwa mkondo wa tukio, basi. Hali ya kushindwa ikiwa Kinesis ikicheleweshwa ni nini?"

"Masasisho ya hali yanachelewa kwa mteja."

"Je, hiyo inakubalika?"

"Kwa sekunde 10? Labda. Kwa sekunde 60? Hapana."

"Kwa hivyo SLA ya mfumo wa ufuatiliaji ni nini?"

Priya alimtazama Leo. "Bado hatuna moja."

Carlos aliandika kwenye ubao: *Haijulikana: SLA ya ufuatiliaji.*

"Hii ni muhimu," alisema. "Kwa sababu SLA inabainisha muundo wa miundombinu. SLA yako ikiwa sekunde 5, unahitaji suluhisho tofauti kuliko ikiwa ni sekunde 60."

**Maswali Wasanifu Wanayouliza**

Zaidi ya masaa mawili, Carlos alioqongoza timu kupitia mapitio. Uteuzi wa maswali yake:

**Kuhusu uhifadhi wa data**:

"Hali ya agizo imehifadhiwa wapi wakati wa utimilifu? Programu ikianguka katikati ya uwasilishaji, mchakato wa uokoaji ni nini? Je, unaweza kuunda upya hali kutoka kwa matukio peke yake?"

**Kuhusu utaratibu wa kurejesha**:

"Kurejesha kunazinduliwa kiotomatiki. Nini kinazuia kurejesha kutolewa mara mbili? Msindikaji wa malipo akiisha muda na hujui ikiwa kurejesha kulikuwa kukubaliwa?"

**Kuhusu ufuatiliaji wa uwasilishaji**:

"Unategemea data ya GPS ya msafirishaji. Kinatokea nini ikiwa ishara ya GPS itapotea kwa sekunde 90? Unabainisha vipi tofauti kati ya 'GPS imepotea' na 'uwasilishaji unaendelea' na 'tatizo la uwasilishaji'?"

**Kuhusu kushughulikia kushindwa**:

"Ikiwa huduma ya kurejesha iko chini, je, agizo bado linapita? Je, mteja bado anapata chakula chake? Uzoefu wa mtumiaji ni nini wakati wa kushindwa kwa sehemu ya mfumo?"

**Kuhusu kuona**:

"Unajuaje sasa hivi maagizo mangapi yako ndani ya dakika 5 ya SLA ya dakika 15? Nambari hiyo ikipanda, ni nani anayearifiwa?"

Kila swali lililotoa mawazo timu ilikuwa ikifanya bila kuyajua.

"Hatukufikiria kuhusu tatizo la kurejesha mara mbili," Leo alisema baadaye. "Tulikuwa tutaita tu API ya malipo."

"Hiyo si kosa," Priya alisema. "Lakini unahitaji idempotency. Shughuli ya kurejesha inahitaji kuwa salama kuita mara mbili."

"Ufunguo wa idempotency — kitambulisho cha pekee kwa kila jaribio la kurejesha, kilichohifadhiwa kwenye DB kabla ya kuita API ya malipo. Tukiita mara mbili kwa ufunguo ule ule, API ya malipo inaacha simu ya pili."

"Ambayo inamaanisha," Carlos aliongeza, "kwamba unahitaji duka la hali la kudumu kwa shughuli za kurejesha, si tukio tu kwenye foleni."

Hii ndiyo aina ya maelezo ya usanifu yanayotokea katika mapitio yaliyoundwa — na mara nyingi hayatokei wakati wa kujenga tu.

**Rekodi ya Uamuzi wa Usanifu**

Baada ya mapitio, Carlos alipendekeza timu kuandika maamuzi yao katika **Rekodi za Uamuzi wa Usanifu (Architecture Decision Records - ADRs)** — hati fupi zinazonasa:

- **Uamuzi gani ulifanywa**
- **Mbadala gani ziliangaliwa**
- **Kwa nini uamuzi huu ulifanywa (muktadha na vizuizi wakati huo)**
- **Uwiano ni nini**
- **Nini kingetufanya tupitieje uamuzi huu**

"ADR ni kwa ajili ya nafsi yako ya kesho," Carlos alisema. "Katika miezi 18, utaangalia kipande cha usanifu na kujiuliza kwa nini kilifanywa hivyo. Ukiwa na ADR, utaelewa muktadha. Bila moja, utaacha peke yake (kwa sababu unaogopa kuigusa) au utaibadilisha (kwa sababu hukuelewa kwa nini ilifanywa hivyo)."

Leo aliandika ADR ya kwanza baada ya chakula cha mchana: uamuzi wa kutumia Kinesis kwa matukio ya ufuatiliaji wa uwasilishaji, na muktadha, mbadala zilizozingatiwa (SQS, EventBridge, utafutaji), na mabadiliko.

**Kinachofanya Msanifu**

Mwishoni mwa kikao, Maya alimuliza Carlos swali la asili: "Tofauti ni nini kati ya kufanya maamuzi ya usanifu na kufikiria kama msanifu?"

Alifikiriha.

"Msanifu hajui teknolojia zaidi kuliko mhandisi mwandamizi," alisema. "Msanifu mzuri pengine anajua kidogo zaidi ya mifumo ya hivi karibuni. Lakini msanifu ana seti tofauti ya maswali ya chaguo-msingi."

"Unamaanisha nini?"

"Ukiwa mhandisi mwandamizi ukitazama kipengele kipya, maswali yako ya kwanza kawaida ni: 'Tunajenga nini? Inafanya kazi vipi? Maktaba bora kwa hili ni ipi?' Msanifu akitazama kipengele kile kile, maswali ya kwanza ni: 'Tatizo hili linatatua nini? Kinacholvunjika kwanza trafiki ikiongezeka mara mbili? Tunajuaje kinapodhoofika? Uzoefu wa mtumiaji ni nini msindikaji wa malipo ukiwa polepole?'"

"Msanifu anauliza kuhusu mfumo chini ya shinikizo," Leo alisema.

"Na kuhusu athari ya biashara ya kila kushindwa," Priya aliongeza.

"Na," Tom alisema, "kuhusu kinachotokea kwa bili hii ikipanuka."

Carlos alitikisa kichwa. "Nyote mnafanya hivi tayari. Mmekuwa mkifanya tangu Sura ya 1. Tofauti kati ya mhandisi mwandamizi na msanifu si cheti au jina. Ni tabia ya kuuliza swali linalofuata — lile linaloonyesha kitu ambacho bado hufikiri."

## Nguvu na Mipaka

**Mapitio ya usanifu**:

- Yanashika hali za kushindwa kabla hazijawa katika uzalishaji
- Zinaunda uelewa wa pamoja kati ya wanachama wa timu ambao mara nyingi wana ujuzi wa kujitegemea
- Zinazalisha hati (ADR) ambazo zinalipa gawio kwa miaka
- Zinakawilisha maamuzi kwa njia zinazofaa — "sogea haraka" bila mapitio ni "sogea haraka na gonga ukuta ambao hukuuona"

**Mahali ambapo yanakuwa magumu**:

- Yanahitaji mtu mwenye ujuzi wa kutosha kuuliza maswali sahihi — mapitio yanakuwa mazuri sawa na mpitiaji
- Yanaweza kuwa ya urasimu ikiwa yanatibiwa kama sanduku la kukaguliwa badala ya mazungumzo
- Baadhi ya maamuzi ya usanifu kwa kweli hayahitaji mapitio kamili — kujua yapi yanafanya hivyo yenyewe ni ujuzi wa usanifu
- Matokeo (ADR, mchoro, kumbukumbu za maamuzi) lazima yadumishwe mfumo ukibadilika

Katika sura inayofuata: jibu la manufaa zaidi, la kuchukiza zaidi, la uaminifu zaidi katika uhandisi wote wa programu.

## Muhtasari

- Mapitio ya usanifu yanaanza na **mahitaji ya biashara, si teknolojia**.
- Muundo wa mapitio: vizuizi → yasiyojulikana → chaguo → hali za kushindwa → ufuatiliaji → vitabu vya maelekezo.
- Wasanifu wanauliza: Nini kinachofunguka kwanza? Tunajuaje kimeporomoka? Uzoefu wa mtumiaji ni nini wakati wa kushindwa? Gharama ni nini kwa kiwango?
- **Rekodi za Uamuzi wa Usanifu (ADRs)** zinanasa kile kilichoamuliwa, kwa nini, na nini kingetusababishia kupitiaje tena.
- Kufikiria kama msanifu ni tabia: kuuliza swali linalofuata, hasa kuhusu hali za kushindwa, athari za biashara, na uchumi wa kiwango.
- Tofauti kati ya kufanya maamuzi na kuwa msanifu ni seti ya chaguo-msingi ya swali: wasanifu huchagua maswali ya kiwango cha mfumo na kushindwa, si maswali ya utekelezaji tu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Msalaba wa vikoa — sababu ya usanifu*

Sura hii ina mada kidogo maalum za mtihani na zaidi kuhusu mtazamo ambao mtihani unajaribu.

- **Hali za SAA-C03** karibu kila wakati zinaelezea kizuizi cha biashara kwanza ("kampuni haiwezi kumudu zaidi ya saa 1 ya kutofanya kazi") na kukuuliza uchague usanifu unaokidhi. Zoeza kubadilisha vizuizi vya biashara kuwa mahitaji ya kiufundi.
- **Kufikiria hali za kushindwa**: Maswali mengi ya mtihani yanaelezea mfumo na kuuliza kinatokea nini kipengele kikishindwa. Zoeza kuuliza "kinachofunguka kwanza?" kwa miundo unayokutana nayo.
- **Kufikiria kuhusu uwiano**: Mtihani mara chache una jibu "kamili." Unauliza jibu *bora* ukizingatia seti ya vizuizi. Jisikie vizuri na "chaguo hili ni sahihi ukizingatia mahitaji haya mahususi, ingawa chaguo lingine lingekuwa bora chini ya mahitaji tofauti."
- **Idempotency**: Tatizo la kurejesha mara mbili ni tatizo halisi la mifumo iliyosambazwa. Vifunguo vya idempotency (vya pekee kwa kila shughuli, vilivyoangaliwa kabla ya utekelezaji) ni suluhisho la kawaida. Jua mchakato huu.
- **Rekodi za Uamuzi wa Usanifu**: Si huduma ya AWS, lakini mbinu bora inayoonyesha nguzo ya Ubora wa Uendeshaji ya Mfumo wa Ujenzi Bora.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Carlos aliyauliza aina sita za maswali wakati wa mapitio ya usanifu. Je, unaweza kuziunda upya bila kutazama sura?

*(Kidokezo: Zimeorodheshwa katika sehemu ya "Muundo wa Mapitio ya Usanifu." Jaribu kuzikumbuka kutoka kwa kumbukumbu — kitendo cha kujaribu kukumbuka (hata ukishindwa) kunaimarisha uhifadhi wa muda mrefu.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni inajenga mfumo wa usimamizi wa zabuni wa wakati halisi kwa matangazo ya mtandao. Zabuni lazima zitathminiwe na kujibiwa ndani ya millisekunde 100. Mfumo unashughulikia zabuni milioni 1 kwa sekunde wakati wa kilele. Mfumo ukishuka, kampuni inapoteza mapato ya matangazo. Timu ya hifadhidata ya kampuni inapendekeza kutumia RDS Aurora yenye nakala 10 za kusomwa. Msanifu wa suluhisho lazima atathmini pendekezo hili.

Msanifu anapaswa kuinua wasiwasi gani KWANZA?

A) Gharama ya nakala 10 za Aurora ni juu sana kwa bajeti  
B) Nakala za Aurora za kusomwa zina ucheleweshaji wa upokezaji ambao unaweza kusababisha matatizo ya uthabiti  
C) Latency ya kawaida ya swali la Aurora ya millisekunde 1-5 inaweza isikidhi SLA ya millisekunde 100  
D) RDS Aurora haiwezi kusaidia kiwango cha miamala ya ombi milioni 1 kwa sekunde kwa mahitaji ya latency haya

**Kidokezo cha 1**: Kizuizi cha msingi ni millisekunde 100 ya jumla ya muda wa majibu kwa ombi milioni 1 kwa sekunde. Yupi wa wasiwasi hawa moja kwa moja inatishia kukidhi kizuizi hiki?

**Kidokezo cha 2**: Latency ya swali la Aurora kawaida ni millisekunde 1-5. Millisekunde 1-5 kwa swali la hifadhidata huacha millisekunde 95-99 kwa mtandao, mantiki ya programu, na uratibu. Je, kizuizi cha millisekunde 100 kipo hatarini?

**Kidokezo cha 3**: Aurora inaweza kushughulikia IOPS nyingi, lakini ombi milioni 1 kwa sekunde ni kiwango cha ajabu. Kinatokea nini kwa usanifu kwa kiwango hicho?

**Jibu**: D

**Maelezo**: Ingawa Aurora ina utendaji wa juu, ombi milioni 1 kwa sekunde kwa millisekunde 100 ya jumla ya muda wa majibu ni mahitaji ya ajabu. Msanifu kwanza anapaswa kuuliza kama Aurora (au hifadhidata yoyote ya uhusiano) inaweza kuwa mfumo wa kutafuta wa msingi kwa kiwango hiki na latency. Mifumo kama hii kawaida hutumia maduka ya data ya kwenye kumbukumbu (Redis) au hifadhidata maalum za latency ya chini, si hifadhidata za uhusiano zenye semantiki kamili za SQL. SLA ya millisekunde 100 inawezekana kwa maswali ya Aurora peke yake, lakini mchanganyiko wa RPS 1M na SLA ya millisekunde 100 kwa jumla unazidi sifa za kawaida za uendeshaji wa Aurora.

**Kwa nini si A?** Gharama ni wasiwasi halali, lakini wasiwasi wa kwanza unapaswa kuwa kama usanifu unaweza kufanya kazi kikufanisi kwa mahitaji yaliyoelezwa.

**Kwa nini si B?** Ucheleweshaji wa upokezaji katika nakala za Aurora za kusomwa kwa kawaida ni <millisekunde 100 — inakubalika kwa matumizi mengi. Matatizo ya uthabiti ni ya kweli lakini ya pili kwa swali la uwezekano.

**Kwa nini si C?** Latency ya Aurora ya millisekunde 1-5 iko vizuri ndani ya SLA ya millisekunde 100 kwa sehemu ya swali la hifadhidata. Hii si wasiwasi wa msingi.

*SAA-C03 Kikoa: Msalaba wa vikoa — muundo wa mfumo*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Tumia muundo wa mapitio ya usanifu kwa mfumo halisi au wa nadharia:

Kampuni mpya inataka kujenga mchezo wa maswali wa wakati halisi na washindani wa wingi. Wachezaji wanajiunga na vyumba vya mchezo (hadi wachezaji 10 kila moja). Kila duru inaonyesha swali kwa sekunde 15; wachezaji wote wanajibu wakati mmoja. Alama zinajumlishwa mara moje baada ya kila swali. Michezo hudumu raundi 10. Kilele cha matumizi: michezo ya wakati mmoja 50,000.

Pita katika mapitio ya hatua sita:

1. Vizuizi visivyoweza kubadilishwa ni nini?
2. Yasiyojulikana na mawazo ni yapi?
3. Chaguo za teknolojia za kweli ni zipi?
4. Hali za kushindwa ni zipi?
5. Utajuaje imepungua?
6. Kitabu cha maelekezo cha saa 3 asubuhi kinaonekanaje?

*(Hakuna jibu moja sahihi. Lengo ni kuzoea muundo wa mapitio kama zana ya kufikiria.)*

## Tukio Baada ya Mikopo

Carlos aliondoka ofisini saa 6 jioni.

Timu ilikaa kwa muda, bila kufanya chochote maalum.

"Nafikiri nilijifunza zaidi katika masaa mawili hayo kuliko katika sura yoyote ya huduma ya AWS," Leo alisema.

"Hiyo ni kwa sababu sura hizo zilikuhusu zana," Maya alisema. "Hii ilikuhusu hukumu."

"Je, hukumu inaweza kufundishwa?" aliuliza.

"Ndiyo," Priya alisema. "Lakini si kwa kusomwa. Kwa mazoezi. Kwa kufanya maamuzi, kuona kinachosimama, kufikiria kwa nini."

"Kwa uzoefu," Tom alisema.

"Kwa uzoefu ulioandaliwa," Priya alisahihisha. "Uzoefu bila tafakuri haujengi hukumu. Lazima uulize maswali baadaye."

Maya alitazama ubao mweupe. Maelezo ya mapitio bado yalikuwepo — vizuizi, yasiyojulikana, hali za kushindwa, maswali ya ufuatiliaji. Ilijaza ubao mweupe miwili.

"Hii inapaswa kwenda kwenye ADR," alisema.

Leo alikuwa tayari akichapisha.

Katika sura ya mwisho: jambo moja ambalo hakuna zana au mfumo unaweza kukupa — na kwa nini "inategemea" ni jibu la manufaa zaidi na la uaminifu zaidi katika usanifu wa programu.
