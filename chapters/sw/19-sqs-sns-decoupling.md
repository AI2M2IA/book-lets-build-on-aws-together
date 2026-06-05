# Sura ya 19: Mashine ya Tikiti

Mashine ya tikiti ilikuwa mapinduzi ya kimya. Chukua nambari, subiri kuitwa. Mstari ulikuwa foleni. Watu waliweza kukaa. Dawati la huduma lilifanya kazi kwa kasi yake mwenyewe. Hakuna aliyezuia mwingine.

Nimbus ilikuwa na tatizo ambalo halikuonekana kama tatizo mpaka maagizo yalipopata umaarufu.

Kila wakati agizo lilipowekwa, seva ya API ililazimika:

1. Hifadhi agizo kwenye hifadhidata
2. Tuma arifa kwa kompyuta kibao ya mgahawa
3. Tuma barua pepe ya uthibitisho kwa mteja
4. Sasisha dashibodi ya uchambuzi wa mgahawa
5. Rekodi tukio kwa ajili ya malipo

Vyote hivi vililazimika kutokea kwa wakati mmoja kabla API haijaweza kujibu kwa mteja. Ikiwa huduma ya barua pepe ilikuwa polepole (wakati mwingine ilikuwa), mteja alisubiri. Ikiwa dashibodi ya uchambuzi ilikuwa chini (wakati mwingine ilikuwa), agizo lilishindwa.

"Tumeshikamana kwa nguvu," Priya alisema. "Ikiwa hatua yoyote ya chini inashindwa, agizo lote linashindwa."

"Vipi kama tungeweza kuhifadhi agizo na kuthibitisha mara moja kwa mteja," Leo alisema, "na kisha kushughulikia iliyobaki nyuma?"

"Hiyo ni foleni," Priya alisema.

**Mfano wa Dawati la Deli**

Katika dawati la deli lenye shughuli nyingi, mtu kwenye dafitari hasubiri mkato kumaliza kukata kabla ya kwenda kwa mteja mwingine. Wanachukua agizo, kumkabidhi jikoni, na kuanza kuhudumia mtu mwingine. Jikoni inafanya kazi kupitia maagizo kwa kasi yake mwenyewe.

Mteja anapata huduma ya haraka zaidi. Jikoni haizidiliwi na mashambulizi ya ghafla. Ikiwa jikoni ina wakati wa polepole, maagizo yanajikusanya katika foleni badala ya kusababisha makosa kwenye dafitari.

Hii ni **kutengana (decoupling)**: kutenganisha kipengele kinachokubali kazi kutoka kwa vipengele vinavyoishughulikia.

Katika mifumo ya programu, foleni mara nyingi ni kisambazaji cha ujumbe — huduma inayokubali ujumbe kutoka kwa wazalishaji na kuwasilisha kwa walaji.

**Amazon SQS: Foleni**

**Amazon SQS (Simple Queue Service)** ni huduma ya foleni ya ujumbe inayosimamiwa na AWS. Inahifadhi ujumbe kwa kudumu mpaka utashughulikiwa na mlaji.

Mtiririko wa kimsingi:

1. **Mzalishaji** (seva ya API) anaweka ujumbe kwenye foleni: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. API inajibu mara moja kwa mteja: "Agizo limethibitishwa!"
3. **Walaji** (huduma za wafanyakazi tofauti) wanasoma ujumbe kutoka kwa foleni na kuusindika: tuma arifa ya mgahawa, tuma barua pepe ya uthibitisho, sasisha uchambuzi

Uzoefu wa mteja: uthibitisho wa papo hapo. Usindikaji wa chini: unafanyika kwa nje, kwa kasi ya wafanyakazi.

**Dhana Muhimu za SQS**

**Muda wa kutoweka kwa ujumbe (Message visibility timeout)**: Wakati mlaji anasoma ujumbe kutoka kwa SQS, ujumbe unakuwa *hauonekani* kwa walaji wengine kwa kipindi fulani (chaguo-msingi: sekunde 30). Hii inampa mlaji muda wa kuusindika. Ikiwa mlaji atamaliza kwa mafanikio, atafuta ujumbe. Ikiwa mlaji ataacha ghafla, muda wa kutoweka utaisha na ujumbe utaonekana tena kwa mlaji mwingine kujaribu tena.

Hii inahakikisha utoaji wa angalau mara moja: kila ujumbe utashughulikiwa angalau mara moja, hata kama mlaji atashindwa katikati ya usindikaji.

**Foleni za barua pepe zilizokufa (Dead-letter queues - DLQ)**: Ikiwa ujumbe utashindwa usindikaji mara nyingi sana (inaweza kusanidiwa — mfano, majaribio 5), SQS unahamia foleni ya barua pepe iliyokufa. Unakagua DLQ kuelewa kwa nini ujumbe unashindwa bila kuupoteza.

**Aina za foleni**:

**Foleni za kawaida (Standard queues)**: Uendeshaji wa juu zaidi (ujumbe usio na kikomo kwa sekunde). Mpangilio wa utoaji ni wa juhudi bora (hauhakikishwi). Utoaji wa angalau mara moja (nadra sana, ujumbe unaweza kutolewa mara mbili).

**Foleni za FIFO**: Mpangilio mkali wa kwanza-ndani, kwanza-nje. Utoaji wa mara moja haswa. Imepunguzwa hadi ujumbe 3,000 kwa sekunde na kutungisha kwa pamoja, 300 bila. Tumia wakati mpangilio ni muhimu (miamala ya kifedha, mabadiliko ya hali ya mfululizo).

Kwa Nimbus, foleni nyingi zilitumia foleni za kawaida. Foleni ya malipo ilitumia FIFO kuhakikisha malipo yanashughulikiwa kwa mpangilio.

**Amazon SNS: Mtangazaji**

**Amazon SNS (Simple Notification Service)** ni huduma ya ujumbe ya kuchapisha/kujiandikisha (pub/sub). Badala ya mzalishaji mmoja, mlaji mmoja (foleni), SNS inasaidia ujumbe mmoja unaotolewa kwa *wajiandikishaji wengi* wakati mmoja.

Mfano:

1. **Mchapishaji** anatuma ujumbe kwa **mada** ya SNS
2. Wajiandikishaji wote wa mada hiyo wanapokea ujumbe wakati mmoja (fan-out)

Wajiandikishaji wanaweza kuwa:

- Foleni za SQS (sukuma ujumbe kwa foleni kwa usindikaji wa nje)
- Vitendo vya Lambda (amsha kitendo moja kwa moja)
- Sehemu za mwisho za HTTP/HTTPS (utoaji wa webhook)
- Anwani za barua pepe
- SMS (nambari za simu)

Kwa Nimbus, tukio la agizo lililowekwa linachapishwa kwa mada ya SNS inayoitwa `order-events`:

- Huduma ya arifa ya mgahawa inajiandikisha (inapokea kwenye foleni yake ya SQS)
- Huduma ya barua pepe inajiandikisha (inapokea kwenye foleni yake ya SQS)
- Huduma ya uchambuzi inajiandikisha (inapokea kwenye foleni yake ya SQS)
- Huduma ya malipo inajiandikisha (inapokea kwenye foleni yake ya FIFO ya SQS)

Tukio moja la agizo. Wajiandikishaji wanne. Wote wanaarifu wakati mmoja. Kila mmoja anashughulikia kwa kasi yake mwenyewe.

"Kwa hivyo SNS ni tangazo," Maya alisema, "na SQS ni sanduku la barua ambapo kila timu inashughulikia tangazo kwa kasi yake mwenyewe."

"Hasa," Leo alisema. "Mchakato wa fan-out wa SNS/SQS ni mchakato wa kawaida."

**Mchakato wa Fan-Out wa SNS/SQS**

Mchanganyiko huu — mada ya SNS inayolisha foleni nyingi za SQS — ni moja ya mifumo muhimu zaidi ya usanifu katika AWS:

```
Seva ya API
    |
    | inachapisha kwa
    ↓
Mada ya SNS: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
Foleni ya SQS     Foleni ya SQS     Foleni ya SQS
(arifa)          (huduma ya barua pepe)   (uchambuzi)
    |                 |                 |
    ↓                 ↓                 ↓
Mfanyakazi        Mfanyakazi        Mfanyakazi
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Kila foleni ni ya kujitegemea. Huduma ya uchambuzi inaweza kuwa polepole — foleni yake inajaza, lakini huduma za arifa na barua pepe zinaendelea bila kuathiriwa. Ikiwa huduma ya uchambuzi itashuka, ujumbe wake unangoja kwenye foleni mpaka irudi. Hakuna kilichopotea.

Hii ndiyo mali muhimu: **kushindwa kwa kujitegemea**. Matatizo katika mlaji mmoja hayasambazwi kwa wengine.

**Uchujaji wa Ujumbe: Si Kila Ujumbe kwa Kila Mjiandikishaji**

Mifumo inapokua, hutaki kila mjiandikishaji kushughulikia kila ujumbe. Huduma ya uchambuzi haipaswi kupokea ujumbe kuhusu usindikaji uliokataliwa wa malipo ikiwa inajali tu maagizo yaliyokamilika.

**Uchujaji wa ujumbe wa SNS** unaruhusu wajiandikishaji kubainisha sera za kuchuja — tolewa tu ujumbe unaofanana na sifa fulani.

Huduma ya arifa ya mgahawa inajiandikisha na kichujio: ujumbe tu ambapo `status = "confirmed"`.

Huduma ya tahadhari ya hitilafu inajiandikisha na kichujio: ujumbe tu ambapo `status = "failed"`.

Kila mjiandikishaji anapata tu kile anachohitaji.

**Wakati wa Kutumia SQS dhidi ya SNS**

**SQS peke yake**: Mzalishaji mmoja, mlaji mmoja (au walaji wengi wanaoshindana kwenye foleni moja). Ujumbe unahitaji kushughulikiwa mara moja, kwa mpangilio (FIFO) au la (kawaida). Mchakato wa foleni ya mfanyakazi — foleni moja, wafanyakazi wengi wanaotumia kutoka kwake.

**SNS peke yake**: Arifa za kutuma-na-kusahau. Sukuma kwa barua pepe, SMS, au sehemu za mwisho za HTTP. Hakuna haja ya kuhifadhi ujumbe kwenye foleni — arifu tu na endelea.

**SNS + SQS (fan-out)**: Tukio moja, walaji wengi wa kujitegemea. Kila mlaji ana foleni yake mwenyewe, anashughulikia kwa kujitegemea, na anaweza kushindwa kwa kujitegemea.

## Nguvu na Mipaka

**Kwa nini SQS na SNS ni zenye nguvu**:

- SQS hutoa utoaji wa ujumbe wa kudumu na wa kuaminika — ujumbe huhifadhiwa katika AZ nyingi
- Kutengana kunawezesha kupanua na kusambaza kwa kujitegemea kwa huduma za mzalishaji na mlaji
- Foleni za barua pepe zilizokufa zinahakikisha hakuna ujumbe uliopotea kimya kimya wakati wa kushindwa
- Mchakato wa fan-out wa SNS unaruhusu kuongeza walaji wapya bila kubadilisha mzalishaji

**Mahali ambapo mambo yanakuwa magumu**:

- Utoaji wa angalau mara moja unamaanisha walaji lazima wawe *wa kuzalisha matokeo sawa (idempotent)* — kushughulikia ujumbe sawa mara mbili haipaswi kusababisha matatizo (maagizo ya nakala, malipo ya nakala)
- Foleni za FIFO ni ghali zaidi na zina vikwazo vya uendeshaji
- Utatuzi wa ujumbe uliokataliwa katika foleni na huduma nyingi unahitaji kurekodi na kuona vizuri
- Dhamana za mpangilio wa ujumbe ni ndogo — ikiwa mpangilio mkali ni muhimu katika huduma nyingi, muundo unakuwa mgumu

## Muhtasari

- **Kutengana** kunatenganisha vipengele vinavyozalisha kazi kutoka kwa vipengele vinavyoishughulikia.
- **SQS** ni foleni inayosimamiwa. Wazalishaji hutuma ujumbe; walaji husoma na kuusindika kwa nje.
- **SQS Standard**: uendeshaji wa juu, mpangilio wa juhudi bora, utoaji wa angalau mara moja.
- **SQS FIFO**: mpangilio mkali, utoaji wa mara moja haswa, uendeshaji mdogo.
- **SNS** ni huduma ya pub/sub. Ujumbe mmoja, wajiandikishaji wengi wakati mmoja.
- **Fan-out ya SNS + SQS**: mchakato wa kawaida kwa tukio moja linaloanzisha njia nyingi za usindikaji za kujitegemea.
- **Foleni za barua pepe zilizokufa**: zinashika ujumbe ambao unashindwa usindikaji baada ya majaribio mengi sana.
- **Uzalishaji wa matokeo sawa (Idempotency)**: buni walaji washughulikie ujumbe wa nakala kwa usalama.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **SQS Standard dhidi ya FIFO**: Mtihani unatofautiana kwa dhamana za mpangilio na utoaji. "Lazima ushughulikie kwa mpangilio" → FIFO. "Uendeshaji wa juu" → Standard.
- **Muda wa kutoweka**: Dhana muhimu kwa utoaji wa angalau mara moja. Ikiwa mlaji atashindwa, ujumbe utaonekana tena baada ya muda wa kutoweka. Hali ya mtihani: "ujumbe unashughulikiwa mara mbili" → muda wa kutoweka ni mfupi sana (mlaji anachukua muda mrefu zaidi kuliko muda wa kutoweka kushughulikia).
- **Foleni ya barua pepe iliyokufa**: Ujumbe unaoshindwa baada ya majaribio N unahamishwa hapa. Hali ya mtihani: "hakikisha hakuna ujumbe uliopotea, hata kama usindikaji unashindwa mara kwa mara" → DLQ.
- **Fan-out ya SNS**: Mchakato wa kawaida wa mtihani kwa tukio moja linaloanzisha walaji wengi. "Arifa ya agizo lililowekwa lazima ianzishe barua pepe, SMS, na sasisha orodha wakati mmoja" → mada ya SNS na wajiandikishaji wa SQS.
- **SQS + Lambda**: Lambda inaweza kusanidiwa kutoa kura kwa foleni ya SQS na kuanzishwa kwenye kila kundi la ujumbe. Mtihani unatumia hii kwa usindikaji unaoendelewa na matukio kwa kiwango.
- **Utafutaji mrefu wa SQS (Long polling)**: Badala ya walaji kutoa kura kila sekunde chache (utafutaji mfupi, unateketeza wito za API), utafutaji mrefu husubiri hadi sekunde 20 kwa ujumbe. Hupunguza gharama na majibu ya uongo ya tupu.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza mchakato wa fan-out wa SNS/SQS. Kwa nini mchakato unatumia foleni za SQS badala ya kuwa na huduma zinazojiandikisha moja kwa moja kwenye mada ya SNS na sehemu za mwisho za HTTP?

*(Kidokezo: Fikiria kinachotokea ikiwa moja ya sehemu za mwisho za HTTP iko chini wakati SNS inachapisha ujumbe.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Jukwaa la biashara ya kielektroniki linashughulikia maagizo 10,000 kwa saa. Agizo linapowekwa, mfumo lazima: (1) hifadhi agizo kwenye hifadhidata, (2) punguza orodha, (3) tuma barua pepe ya uthibitisho, na (4) sasisha dashibodi ya uchambuzi. Kwa sasa, hatua zote nne zinafanyika kwa wakati mmoja — ikiwa huduma ya uchambuzi ni polepole, wateja wanasubiri. Timu inataka kuboresha muda wa majibu ya wateja huku ikihakikisha hakuna maagizo yaliyopotea.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Tumia foleni za SQS FIFO kushughulikia hatua zote nne kwa mfululizo  
B) API ihifadhi agizo na kuthibitisha mara moje kwa mteja; ichapishie tukio kwenye mada ya SNS; huduma za orodha, barua pepe, na uchambuzi zijiandikishe kupitia foleni za SQS  
C) Tumia vipengele vya EC2 vya sambamba kushughulikia kila hatua wakati mmoja, kwa wakati mmoja  
D) Tumia API Gateway yenye uthibitishaji wa ombi ili kuharakisha usindikaji wa agizo

**Kidokezo cha 1**: Uthibitisho wa mteja unapaswa kuwa wa papo hapo. Hatua zipi lazima zitokee kabla ya majibu, na zipi zinaweza kutokea baada yake?

**Kidokezo cha 2**: Huduma ya uchambuzi kuwa polepole haipaswi kuathiri huduma za barua pepe au orodha.

**Kidokezo cha 3**: Fan-out ya SNS inaruhusu huduma zote tatu za chini kupokea tukio wakati mmoja.

**Jibu**: B

**Maelezo**: API inahifadhi agizo kwenye hifadhidata (kwa wakati mmoja — lazima ifanyike kabla ya kuthibitisha) na kisha inarudisha uthibitisho mara moje. Kisha inachapisha tukio la `order-placed` kwenye mada ya SNS. Huduma za orodha, barua pepe, na uchambuzi zijiandikisha kila moja kupitia foleni huru za SQS. Zinashughulikia kwa kasi zao mwenyewe — ikiwa uchambuzi ni polepole, foleni yake inakua lakini huduma nyingine haziathiriki. Ikiwa huduma yoyote itashindwa, ujumbe wake unabaki kwenye foleni ya SQS na kujaribu tena; baada ya idadi iliyosanidiwa ya majaribio yaliyoshindwa zinahamishwa kwenye DLQ.

**Kwa nini si A?** Foleni za FIFO zinashughulikia ujumbe kwa mfululizo — hii haisaidii kupunguza ucheleweshaji wa wakati mmoja. Pia, usindikaji wa mfululizo unamaanisha uchambuzi kuwa polepole bado unazuia barua pepe.

**Kwa nini si C?** "Vipengele vya EC2 vya sambamba vinavyoshughulikia kwa wakati mmoja" bado kunahitaji hatua zote kukamilika kabla ya kujibu mteja. Kuongeza vipengele hakutatui ushikamano wa wakati mmoja.

**Kwa nini si D?** API Gateway inaharakisha upitishaji na uthibitishaji wa API, lakini haitetenganishi hatua za usindikaji wa chini.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inajenga mfumo wa arifa kwa washirika wa mgahawa. Mteja anapowacha agizo, mgahawa unahitaji kutaarifiwa kupitia:

- Programu yao ya kompyuta kibao (arifa ya sukuma)
- Mfumo wa kuonyesha jikoni (webhook ya HTTP kwa vifaa vyao vya ndani)
- SMS ya hifadhi (ikiwa arifa ya kompyuta kibao itashindwa)

Huduma ya arifa ya kompyuta kibao ni ya kuaminika. Webhook ya jikoni wakati mwingine iko chini (migahawa inazima vifaa vyao wakati wa kufunga). SMS inapaswa kutumwa tu ikiwa arifa ya kompyuta kibao itashindwa.

Buni muundo kwa kutumia SNS na SQS. Ungeshughulikia vipi mahitaji ya "SMS tu ikiwa kompyuta kibao itashindwa"? Ungahakikisha vipi kwamba webhook ya jikoni haizuii arifa ya kompyuta kibao inapokuwa nje ya mtandao?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni fan-out yenye upitishaji wa masharti.)*

## Tukio Baada ya Mikopo

Mtiririko mpya wa agizo ulikuwa hai.

Wateja walipanga maagizo. API ilijibu katika millisekunde 95. Uthibitisho ulionekana kwenye simu zao mara moja.

Nyuma ya pazia: huduma nne zinashughulikia kwa nje. Huduma ya uchambuzi ilikuwa na hitilafu iliyoisababisha kuanguka kwenye maagizo yenye herufi maalum fulani katika jina la kipengele. Foleni yake ilikusanya maelezo 3,200 zaidi ya masaa mawili.

Wateja hawakuwahi kugundua.

Leo aliporekebisha hitilafu na huduma ya uchambuzi ilipoanzishwa tena, ilishughulikia mzigo wa nyuma katika dakika 18. Hakuna data iliyopotea. DLQ ilikuwa tupu.

"Hii ndiyo maana ya kutengana," Priya alisema.

Tom alikuwa akisoma ukurasa wa bei za SQS. "Kwa kila ombi milioni, dola 0.40."

"Je, hilo ni baya?"

"Kwa kiwango chetu cha sasa, karibu dola kumi na mbili kwa mwezi." Alitazama skrini. "Nilitarajia zaidi."

Alikuwa na mwonekano wa mtu anayegundua kitu kisichopungukiwa bei pia kilikuwa kisichopungukiwa ubora.

Katika sura inayofuata: kitendo kinachofanya kazi tu mtu anapobishabisha — na hakigharimu chochote wakati hawabishi.
