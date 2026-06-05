# Sura ya 22: Chati Inayojiendesha

Uthibitisho wa agizo katika Nimbus ulihitaji mambo matano kutokea kwa mfululizo: malipo ya kadi, kutuma barua pepe ya uthibitisho, kutoa arifa kwa mgahawa, kusasisha orodha, na kurekodi muamala kwa uhasibu. Ikiwa hatua ya tatu ilishindwa — ikiwa arifa ya mgahawa iliisha muda — hatua ya kwanza na ya pili zilikuwa zimeshafanyika. Mteja alitozwa. Barua pepe ilitumwa. Lakini mgahawa hakujua agizo lilikuwepo.

Leo alikuwa na jina kwa aina hii ya hitilafu: mafanikio ya sehemu. "Kila kitu kilifanya kazi," alisema, "isipokuwa sehemu iliyokuwa muhimu."

"Mara ngapi hii imetokea?" Maya aliuliza.

"Mara kumi na moja katika wiki mbili zilizopita. Tulishika nyingi kutoka kwa simu za hasira za mgahawa. Mbili tulizipatia katika kumbukumbu, baada ya ukweli."

"Kwa hivyo hatuna uratibu," Priya alisema. "Hatua tano, zinaendeshwa kama hati, bila dhamana zitamaliza zote."

"Au kwamba zinakamilika kwa mpangilio sahihi."

"Au kwamba tunajua ipi ilishindwa."

Leo alipiga picha ya nambuli kwenye projekta. Ilikuwa kitendo cha Python: mistari hamsini, wito watano wa API mfululizo, vizuizi vya kujaribu/kuacha kizingiti kimoja karibu na kitu kizima. "Ikiwa chochote hapa kitatoa kosa, tunapata 500 na mteja anaona hitilafu. Lakini malipo na barua pepe hazirudi nyuma."

"Tunahitaji mtiririko," Maya alisema. "Kitu kinachofuatilia kila hatua."

**AWS Step Functions: Kuandaa Mtiririko wa Kazi**

**AWS Step Functions** ni huduma ya uandaaji bila seva inayoratibu hatua za programu kama mtiririko wa kazi wa kuonekana. Kila hatua ni **hali** katika **mashine ya hali**.

Badala ya hati ya Python inayoendesha kutoka juu hadi chini na kuanguka, unabainisha mtiririko wa kazi kama mashine ya hali ya JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Kila hali inaweza:

- **Tekeleza kitendo cha Lambda** (mchakato wa kawaida zaidi)
- **Tekeleza kazi ya ECS** (kwa kazi za muda mrefu)
- **Subiri muda maalum** au **tukio** (simamisha mtiririko wa kazi mpaka kitu cha nje kitokee)
- **Chagua njia** kulingana na masharti (mantiki ya if/else)
- **Endesha matawi ya sambamba** wakati mmoja
- **Jaribu tena baada ya kushindwa** na nyuma inayoweza kusanidiwa
- **Shika makosa** na kuelekeza kwa hali za kushughulikia makosa

Step Functions inasimamia hali ya utekelezaji kwa kudumu. Ikiwa hatua ya 3 itashindwa, utekelezaji unasimama kwenye hatua ya 3. Unaweza kukagua utekelezaji uliokataliwa katika dashibodi, rekebisha tatizo, na uanzishe tena kutoka hatua ya 3 — bila kurudia hatua za 1 na 2.

**Aina za Hali: Vipande vya Ujenzi**

**Kazi (Task)**: Tekeleza kitendo — ita kitendo cha Lambda, anzisha kazi ya ECS, ita API. Hapa ndipo kazi halisi inafanyika.

**Chaguo (Choice)**: Tawi kulingana na masharti katika data ya ingizo. Kama if/else katika nambuli.

**Sambamba (Parallel)**: Endesha matawi mengi wakati mmoja na usubiri yote yakamilike.

**Ramani (Map)**: Tekeleza seti ya hali kwa kila kipengele katika orodha. Shughulikia vipengele 50 vya orodha ya mgahawa kwa sambamba.

**Subiri (Wait)**: Simama kwa muda uliobainishwa au mpaka alama ya wakati. Muhimu kwa ucheleweshaji wa ratiba.

**Pita (Pass)**: Pita ingizo kwa matokeo bila kufanya kazi. Hutumika kwa mabadiliko ya data na majaribio.

**Fanya Kazi/Shindwa (Succeed/Fail)**: Hali za mwisho zinazomaliza utekelezaji.

Kwa uandikishaji wa mgahawa, Leo alibuni mtiririko wa kazi:

1. ValidateLicense (Kazi → Lambda)
2. ImportMenu (Kazi → Lambda, na majaribio 3)
3. Tawi la Sambamba:
   a. SetupPayments (Kazi → Lambda)
   b. CreateIAMRole (Kazi → Lambda)
4. SendWelcomeEmail (Kazi → Lambda, inasubiri sambamba kukamilike)
5. NotifySalesTeam (Kazi → Lambda)

Hatua 3a na 3b zinaendesha kwa sambamba — hazitegemei moja kwa moja, na kuziendesha wakati mmoja kunaokoa muda.

**Mtiririko wa Kazi wa Kawaida dhidi ya Express**

Step Functions inatoa aina mbili za mtiririko wa kazi:

**Mtiririko wa kazi wa Kawaida (Standard workflows)**:

- Muda wa juu: mwaka 1
- Utekelezaji hudumu — hali inabaki, inaweza kukaguliwa na kukaguliwa
- Utekelezaji wa angalau mara moja (kila kazi inatekelezwa angalau mara moja)
- Bei kwa kila mpito wa hali
- Bora kwa mtiririko wa kazi wa muda mrefu, muhimu (usindikaji wa agizo, uandikishaji, mtiririko wa malipo)

**Mtiririko wa kazi wa Express (Express workflows)**:

- Muda wa juu: dakika 5
- Uendeshaji wa juu — hadi 100,000 kwa sekunde
- Angalau mara moja au zaidi ya mara moja (inaweza kusanidiwa)
- Bei kwa muda (kama Lambda)
- Bora kwa mtiririko wa kazi wa kiwango kikubwa, mfupi (usindikaji wa tukio wa wakati halisi, uingizaji wa data ya IoT)

Kwa uandikishaji wa mgahawa wa Nimbus: Kawaida (ni muhimu, hudumu, inaweza kuchukua masaa ikiwa hatua za mkono zinahusika).

Kwa masasisho ya hali ya agizo la wakati halisi ya Nimbus: Express (kiwango kikubwa, mfupi, si muhimu sana).

**Usanifu Unaoendelewa na Matukio: Picha Kubwa**

Step Functions ni sehemu moja ya mchakato mkubwa: **usanifu unaoendelewa na matukio**. Badala ya huduma kuita moja kwa moja (kushikamana kwa nguvu), huduma hutoa matukio, na huduma zingine hujibu matukio hayo.

Tumeona hili katika kitabu chote:

- Maagizo yaliyowekwa → SNS inachapisha tukio → Foleni za SQS zinawasilisha kwa walaji
- Faili ya S3 iliyopakiwa → Lambda imeanzishwa kushughulikia
- Rekodi ya DynamoDB iliyobadilika → DynamoDB Streams → Lambda inasasisha kashe

**Amazon EventBridge** (zamani CloudWatch Events) ni basi ya tukio ya hali ya juu kwa mchakato huu. Inakabidhi matukio kutoka huduma za AWS na programu zako mwenyewe hadi malengo (Lambda, SQS, Step Functions, n.k.) kulingana na sheria.

EventBridge inaruhusu kushikamana kwa urahisi katika kiwango cha usanifu: huduma ya agizo inachapisha matukio ya `order.placed` bila kujua nani anasikiliza. Huduma ya uchambuzi, huduma ya arifa, na huduma ya pointi za uaminifu zote zinasikiliza kwa kujitegemea. Kuongeza msikilizaji mpya hakuhitaji kubadilisha huduma ya agizo.

**Wakati Step Functions Ni Zana Sahihi**

Step Functions inafanya vizuri unapokuwa na:

**Mtiririko wa kazi wenye hatua nyingi** unaohitaji kufuatilia maendeleo katika hatua

**Michakato yenye binadamu katika mzunguko** — Step Functions inaweza kusubiri bila kikomo kwa tukio la nje (kama binadamu anayeidhinisha kitu) na kisha kuendelea

**Kushughulikia makosa kwa kiwango** — mantiki ya kujaribu tena, kunasa, na kurudi nyuma iliyojengwa ndani katika hatua nyingi

**Michakato inayoweza kukaguliwa** — kila utekelezaji hurekodi kila mpito wa hali. Unaweza kuona hasa kilichotokea na wakati gani.

**Mantiki ngumu ya sambamba au mfululizo** — mtiririko wa kazi wa kuonekana unafanya iwe rahisi zaidi kusababu kuliko nambuli sawa

Step Functions ni ya ziada kwa michakato rahisi ya hatua mbili. Itumie wakati uratibu wenyewe una thamani na hali za kushindwa ni muhimu.

## Nguvu na Mipaka

**Kwa nini Step Functions ina nguvu**:

- Historia ya utekelezaji wa kuonekana — ona hasa mtiririko wa kazi uko wapi (au ulishindwa)
- Kujaribu tena na kushughulikia makosa iliyojengwa ndani — hakuna nambuli ya kujaribu tena ya kawaida
- Hali hudumu — utekelezaji unanusurika baada ya seva kuanzishwa tena na kukatika
- Muunganiko wa moja kwa moja na huduma zaidi ya 200 za AWS (si Lambda tu)
- Mtiririko wa kazi wa kuonekana hujielezea wenyewe

**Mahali ambapo mambo yanakuwa magumu**:

- Mtiririko wa kazi wa kawaida unalipiwa kwa kila mpito wa hali — mtiririko wa kazi mgumu wenye hali nyingi unaweza kuwa ghali kwa kiwango
- Umbizo la JSON la ASL (Amazon States Language) lina njia ngumu ya kujifunzia
- Ukubwa wa juu wa mizigo ni 256KB — data kubwa lazima ipitishwe kupitia marejeo ya S3, si moja kwa moja kupitia mtiririko wa kazi
- Mtiririko wa kazi wa muda mrefu wenye hatua nyingi za mkono unahitaji usanidi makini wa muda wa kutoweka

## Muhtasari

- **Step Functions** inaandaa mtiririko wa kazi wenye hatua nyingi kama mashine za hali.
- Kila **hali** inaweza kuendesha kitendo cha Lambda, kutekeleza kazi ya ECS, kusubiri, kutawanyika, au kuendesha hatua za sambamba.
- **Kujaribu tena na kunasa** kumejengwa ndani ya kila hali — hakuna nambuli ya kujaribu tena ya kawaida inayohitajika.
- **Mtiririko wa kazi wa Kawaida**: muda mrefu (hadi mwaka 1), hudumu, angalau mara moja. Kwa michakato muhimu ya biashara.
- **Mtiririko wa kazi wa Express**: mfupi (hadi dakika 5), uendeshaji wa juu. Kwa usindikaji wa tukio wa kiwango kikubwa.
- **Usanifu unaoendelewa na matukio** unatumia huduma kama SNS, SQS, Lambda, na EventBridge kutenganisha mifumo karibu na matukio badala ya wito wa moja kwa moja.
- Tumia Step Functions wakati uratibu wa hatua wenyewe ni mgumu na wakati uwezekano wa kukagua ni muhimu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Ishara za matumizi ya Step Functions**: "andaa vitendo vingi vya Lambda," "mtiririko wa kazi wenye majaribio ya kujaribu tena na kushughulikia makosa," "hatua ya idhini ya binadamu katika mtiririko wa kazi wa kiotomatiki," "njia ya ukaguzi ya kila hatua ya mtiririko wa kazi" → Step Functions.
- **Kawaida dhidi ya Express**: Kawaida kwa mzigo wa muda mrefu, uwezekano wa kukaguliwa, muhimu kwa biashara. Express kwa usindikaji wa tukio wa uendeshaji wa juu, mfupi wa muda.
- **SQS dhidi ya Step Functions**: SQS kwa foleni rahisi za kazi (mzalishaji/mlaji). Step Functions kwa mtiririko wa kazi wenye hatua nyingi wenye mantiki ngumu, majaribio ya kujaribu tena, na ufuatiliaji wa hali.
- **Ishara za EventBridge**: "kabidhi matukio kutoka huduma za AWS hadi malengo," "muunganiko wa kuendelewa na matukio kati ya huduma," "panga kitendo cha Lambda" → EventBridge (zamani CloudWatch Events).
- **Mchakato wa simu ya nyuma (Callback pattern)**: Step Functions inaweza kusimamisha utekelezaji na kusubiri simu ya nyuma ya nje (tokeni ya kazi). Mfanyakazi anapigia simu nyuma anapomaliza. Muhimu kwa kazi ndefu za ECS ambapo hutaki kikomo cha dakika 15 cha Lambda.
- **Muunganiko wa moja kwa moja wa SDK**: Step Functions inaweza kuita huduma za AWS moja kwa moja (DynamoDB, S3, SQS, n.k.) bila kwenda kupitia Lambda. Hupunguza gharama na latency kwa wito rahisi wa huduma.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza kwa nini Step Functions ina manufaa kwa mtiririko wa kazi wenye hatua nyingi. Inatoa nini ambacho kitendo rahisi cha Lambda kinachoita vitendo vingine vya Lambda hakitoi?

*(Kidokezo: Fikiria kinachotokea wakati hatua ya 3 ya 5 inashindwa katika kila mbinu. Unajuaje kilichotokea? Unajaribu tena hatua ya 3 tu vipi?)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ya huduma za kifedha inashughulikia maombi ya mkopo katika hatua nyingi: ukaguzi wa mkopo, uthibitisho wa mapato, uthibitisho wa hati, ukaguzi wa muandishi wa bima (mkono), na arifa ya uamuzi. Kila hatua inaweza kuchukua muda kutoka sekunde (ukaguzi wa mkopo) hadi siku (ukaguzi wa muandishi wa bima). Kampuni inahitaji njia kamili ya ukaguzi ya kila hatua kwa uzingatifu. Hatua zilizoshindwa za kiotomatiki lazima zijaribu tena kiotomatiki; hatua za mkono lazima zisimame na kusubiri uamuzi wa binadamu.

Huduma gani BORA inakidhi mahitaji haya?

A) Vitendo vya AWS Lambda vilivyounganishwa pamoja na foleni za SQS kati ya kila hatua  
B) Mtiririko wa kazi wa Kawaida wa AWS Step Functions wenye mchakato wa Subiri simu ya nyuma kwa hatua ya ukaguzi wa muandishi wa bima  
C) Mtiririko wa kazi wa Express wa AWS Step Functions kwa hatua za kiotomatiki na SQS FIFO kwa hatua ya mkono  
D) Amazon EventBridge yenye sheria za tukio zinazokabidhi kati ya vitendo vya Lambda kwa kila hatua

**Kidokezo cha 1**: Muda "hadi siku" — aina gani ya Step Functions inasaidia hili?

**Kidokezo cha 2**: "Subiri uamuzi wa binadamu" — mchakato gani wa Step Functions umebunishwa kwa hili?

**Kidokezo cha 3**: "Njia kamili ya ukaguzi kwa uzingatifu" — huduma gani inatoa historia ya hali kwa kila utekelezaji?

**Jibu**: B

**Maelezo**: Mtiririko wa kazi wa Kawaida wa Step Functions unaweza kuendesha hadi mwaka 1, ukisaidia hatua ya ukaguzi wa muandishi wa bima ya siku nyingi. Mchakato wa Subiri simu ya nyuma unasimamisha utekelezaji kwenye hatua ya muandishi wa bima na tokeni ya kazi; muandishi wa bima anapofanya uamuzi, anapigia simu nyuma na tokeni ili kuendelea na mtiririko wa kazi. Mtiririko wa kazi wa Kawaida hurekodi kila mpito wa hali — njia kamili ya ukaguzi kwa uzingatifu.

**Kwa nini si A?** Lambda iliyounganishwa kupitia SQS haitoi ufuatiliaji wa hali uliyojengwa ndani au njia ya ukaguzi. Hatua zilizoshindwa zinahitaji mantiki ya kujaribu tena ya kawaida. Kuanzisha tena kutoka hatua maalum iliyoshindwa kunahitaji utekelezaji wa kawaida.

**Kwa nini si C?** Mtiririko wa kazi wa Express una muda wa juu wa dakika 5 — haoani na hatua ambayo inaweza kuchukua siku.

**Kwa nini si D?** EventBridge inakabidhi matukio kati ya huduma lakini haidumishi hali ya mtiririko wa kazi au hutoi kujaribu tena/ukaguzi uliyojengwa ndani. Kujenga hili kwenye EventBridge peke yake kunahitaji usimamizi wa hali ya kawaida.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inajenga mchakato wa utatuzi wa ubora wa chakula. Mteja anapowasilisha uzoefu mbaya:

1. Ripoti inathbatishwa kiotomatiki (inakagua ikiwa agizo lipo, ikiwa ni la hivi karibuni vya kutosha)
2. Mgahawa unataarifiwa kiotomatiki
3. Wakala wa msaada wa Nimbus anakagua malalamiko (hatua ya mkono — inaweza kuchukua siku 1-3 za biashara)
4. Kulingana na uamuzi wa wakala: toa marejesho (Lambda → msindikaji wa malipo) AU tuma kuponi la msamaha (Lambda → huduma ya kuponi) AU pindua kwa usimamizi (mtiririko mdogo wa kazi wa Step Functions)
5. Mteja anataarifiwa kuhusu matokeo

Buni hii kama mtiririko wa kazi wa Step Functions. Aina gani ya hali inashughulikia kila hatua? Ungeshughulikia vipi kusubiri siku 1-3? Ungebuni vipi tawi kwenye hatua ya 4?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni hali za Step Functions.)*

## Tukio Baada ya Mikopo

Mtiririko wa kazi wa uandikishaji wa mgahawa ulikuwa hai.

Katika mwezi uliofuata, washirika 12 wapya wa mgahawa waliandikishwa. Wawili walikuwa na kushindwa wakati wa hatua ya usindikaji wa malipo (hatua ya 3). Katika visa vyote viwili, Step Functions ilishika hitilafu halisi, ilihifadhi hali ya utekelezaji, na ilituma tahadhari kwa timu ya Nimbus.

Leo alishughulikia sababu ya msingi (ufunguo wa API uliosanidiwa vibaya kwa mtoa huduma wa malipo) na kujaribu tena utekelezaji wote wawili kutoka hatua ya 3. Utekelezaji ulikamilika katika sekunde 23 kila mmoja, ukichukua hasa mahali ulipokuwa umeshindwa.

Hakuna mgahawa aliyehitaji kuagizwa tena. Hakuna majukumu ya IAM yaliyoundwa mara mbili. Hakuna barua pepe za karibu-sawa zilitumwa.

"Kabla ya Step Functions," Leo alimwambia Maya, "hii ingehitaji mtu kufuatilia kwa mkono kilichokuwa na kilichokuwa kimeshafanyika kwa kila mgahawa, na kuendesha tena kwa mkono hatua zilizokosekana."

"Na sasa?"

"Sasa ninabofya jaribu tena katika dashibodi. Mfumo unajua kilichofanyika."

Maya alifikiria kuhusu hili.

"Hiyo si uboreshaji wa kiufundi tu," alisema. "Hiyo ndiyo tofauti kati ya mchakato unaopanua na usiopanua."

Katika sura inayofuata: kufanya nini na data ambayo hufikirii sasa hivi, lakini unataka uhifadhi milele.
