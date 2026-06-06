# Sura ya 22: Chati Inayojiendesha

Leo alikuwa akitazama faili lile lile la kumbukumbu kwa saa moja. Ufuatiliaji wa rafu ulikuwa wazi vya kutosha kibinafsi, lakini muundo katika yote — jinsi hatua moja ilishindwa kimya na hatua inayofuata ilijiendesha hata hivyo — ulikuwa umemchukua muda kuuona. Hatimaye aliegemea nyuma, akaweka kahawa yake chini, na akaandika neno moja kwenye daftari lake: *uratibu*.

Fikiria kondakta akishuka kutoka jukwaani katikati ya onyesho. Okestra inaendelea kucheza — lakini hakuna mtu wa kuingiza ngoma za shaba kwenye mwambaa wa 47, hakuna mtu wa kuashiria ukimya kabla ya tamati. Wanamuziki binafsi wanacheza sehemu zao kwa usahihi. Onyesho bado linaporomoka, kwa sababu sehemu zinategemea uratibu ambao hakuna mtu anayeusimamia.

Hilo ndilo tatizo Leo aliokuwa amelipata katika msimbo wa uthibitisho wa agizo. Si hitilafu katika hatua yoyote binafsi. Kushindwa kwa uratibu.

---

Vyombo vilikuwa vikiendesha kwa usahihi na vikisambazwa kwa usafi. Bomba la usambazaji la ECS lilikuwa imara. Lakini ndani ya msimbo wa programu, aina tofauti ya kushindwa ilikuwa imekuwa ikikusanyika kwa wiki. Vyombo vilikuwa sawa. Mantiki ndani ya kimoja chao haikuwa.

Leo alikuwa akifuatilia muundo katika kumbukumbu lakini hakuwa amekielewa hadi alipohesabu matukio.

Mara kumi na moja. Katika wiki mbili.

---

Uthibitisho wa agizo katika Nimbus ulihitaji mambo matano kutokea kwa mfululizo: malipo ya kadi, kutuma barua pepe ya uthibitisho, kutoa arifa kwa mgahawa, kusasisha orodha, na kurekodi muamala kwa uhasibu.

Leo alipoandika kitendo cha awali cha uthibitisho wa agizo, alikuwa amefunga kitu kizima katika kizuizi kimoja cha `try/except` na akasema "itakuwa sawa — tutashika makosa katika kumbukumbu." Hiyo ilikuwa miezi minane iliyopita.

Haikuwa sawa.

Ikiwa hatua ya tatu ilishindwa — ikiwa arifa ya mgahawa iliisha muda — hatua ya kwanza na ya pili zilikuwa zimeshafanyika. Mteja alitozwa. Barua pepe ilitumwa. Lakini mgahawa hakujua agizo lilikuwepo.

Leo alikuwa na jina kwa aina hii ya hitilafu: mafanikio ya sehemu. "Kila kitu kilifanya kazi," alisema, "isipokuwa sehemu iliyokuwa muhimu."

"Mara ngapi hii imetokea?" Maya aliuliza.

"Mara kumi na moja katika wiki mbili zilizopita. Tulishika nyingi kutoka kwa simu za hasira za mgahawa. Mbili tulizipata katika kumbukumbu, baada ya ukweli."

"Kwa hivyo hatuna uratibu," Priya alisema. "Hatua tano, zinazoendeshwa kama hati, bila dhamana zitakamilika zote. Na je, ikiwa mtu atajaribu kuvunja wakati wa hatua ya pili — baada ya malipo kupita lakini kabla mgahawa hajataarifiwa? Tayari tumemtoza mteja kwa agizo ambalo mgahawa hauna."

"Au kwamba zinakamilika kwa mpangilio sahihi."

"Au kwamba tunajua ipi ilishindwa."

Leo aliibua msimbo kwenye projekta. Ulikuwa kitendo cha Python: mistari hamsini, wito watano wa API mfululizo, kizuizi kimoja cha try/except karibu na kitu kizima.

"Tunahitaji mtiririko wa kazi," Maya alisema. "Kitu kinachofuatilia kila hatua. Subiri — lakini *kwa nini* hatuwezi tu kuongeza ushughulikiaji bora wa makosa kwenye kitendo cha Python kilichopo? Kwa nini tunahitaji huduma mpya kabisa?"

"Kwa sababu ushughulikiaji bora wa makosa bado unaendesha katika mchakato mmoja unaoweza kushindwa wakati wowote," Leo alisema. "Ikiwa seva itaanzishwa tena katikati ya utekelezaji, ushughulikiaji wa makosa unaanza tena pamoja nayo. Step Functions inahifadhi hali kwa nje."

Fikiria orodha ya ukaguzi ya utengenezaji — moja ambapo kila kituo kinathibitisha kukamilika kabla ya kupitisha kwa kinachofuata, na ambapo mstari mzima unashikilia nafasi yake wakati kitu kinashindwa. Mstari haunzi upya kutoka mwanzo. Unaendelea kutoka kituo haswa kilichoshindwa. Hali ya kituo hicho imerekodiwa. Hatua kabla yake zimekamilika na hazirudiwi. Hatua baada yake zinasubiri hadi tatizo litatuliwe.

Hicho ndicho mtiririko wa uthibitisho wa agizo ulihitaji. Si msimbo zaidi kuzunguka tatizo. Mfumo uliobuniwa kusimamia tatizo.

**AWS Step Functions: Kuandaa Mitiririko ya Kazi**

**AWS Step Functions** ni huduma ya uandaaji bila seva inayoratibu hatua za programu kama mtiririko wa kazi wa kuonekana. Kila hatua ni **hali** katika **mashine ya hali**.

Badala ya hati ya Python inayoendesha kutoka juu hadi chini na kuanguka, unabainisha mtiririko wa kazi kama mashine ya hali ya JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Kila hali inaweza:

- **Kutekeleza kitendo cha Lambda** (mchakato wa kawaida zaidi)
- **Kutekeleza kazi ya ECS** (kwa kazi za muda mrefu)
- **Kusubiri muda maalum** au **tukio** (simamisha mtiririko wa kazi mpaka kitu cha nje kitokee)
- **Kuchagua njia** kulingana na masharti (mantiki ya if/else)
- **Kuendesha matawi ya sambamba** wakati mmoja
- **Kujaribu tena baada ya kushindwa** na nyuma inayoweza kusanidiwa
- **Kushika makosa** na kuyaelekeza kwa hali za kushughulikia makosa

Step Functions inasimamia hali ya utekelezaji kwa kudumu. Ikiwa hatua ya 3 itashindwa, utekelezaji unasimama kwenye hatua ya 3. Unaweza kukagua utekelezaji uliyoshindwa katika dashibodi, rekebisha tatizo, na uanzishe tena kutoka hatua ya 3 — bila kurudia hatua za 1 na 2.

Unaweza kuwa unajiuliza: je, huwezi tu kuandika mantiki ya kujaribu tena katika kitendo chako cha Lambda? Ndiyo — lakini kisha pia unaandika ufuatiliaji wa kushindwa, udumu wa hali, na kurekodi ukaguzi katika msimbo. Na hatua ya 3 kati ya 7 inaposhindwa, unahitaji kujua mgahawa upi ulikuwa ukishughulikiwa, kilichotokea kabla, na mahali pa kuendelea. Step Functions inafanya yote hayo.

**Mtiririko wa Agizo wa Nimbus: Mashine ya Hali Iliyofafanuliwa**

Hapa kuna toleo lililorahisishwa la mashine halisi ya hali ya Step Functions ambayo Nimbus ilijenga kwa uthibitisho wa agizo — iliyofafanuliwa ili uweze kuona kila kipande kinachofanya nini:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Mambo machache ya kuona:

**`ChargeCard` ina vifungu viwili vya Catch.** Kimoja kwa `PaymentDeclinedError` (kushindwa kunakojulikana, kunakotarajiwa — kadi ilikataliwa, si hitilafu ya mfumo) na kimoja kwa `States.ALL` (kingine chochote — kukatika kwa mfumo, muda kuisha, kasoro isiyotarajiwa). Vinaelekeza kwa hali tofauti kwa sababu vinamaanisha vitu tofauti.

**`NotifyRestaurant` ina Catch inayoelekeza kwa `RestaurantNotificationFailed`.** Hii ndiyo hitilafu iliyosababisha matukio kumi na moja. Katika hati ya zamani ya Python, hakukuwa na kinachofanana — ikiwa arifa ilishindwa, kitendo kiliama kimya au kiliweka hitilafu kwenye kumbukumbu na kuendelea. Step Functions inafanya njia ya kushindwa kuwa wazi: inaenda mahali mahususi, na mahali hapo panaonya timu ya msaada kabla mtu hajalazimika kupiga simu.

**Kila Kazi ina Retry.** Ikiwa huduma ya barua pepe ina muda kuisha wa muda, inajaribu tena kiotomatiki, mara tatu, na nyuma inayoongezeka. Mteja kamwe haoni hili. Agizo halipotei.

**Mtiririko ni grafu, si hati.** Ikiwa `NotifyRestaurant` itashindwa kabisa (baada ya majaribio), utekelezaji hauendelei kwa `UpdateInventory`. Mtiririko wa kazi unasimama kwenye `RestaurantNotificationFailed`. Orodha haisasishwi kwa mgahawa ambao haujui kuhusu agizo. Hii ni tabia sahihi.

"Subiri — lakini *kwa nini* tunahitaji njia tofauti za kushindwa kwa kadi iliyokataliwa dhidi ya hitilafu ya mfumo?" Maya aliuliza.

"Kwa sababu zinahitaji majibu tofauti kabisa," Leo alisema. "Kadi iliyokataliwa inamaanisha tunamtumia mteja barua pepe na kumwomba ajaribu tena. Hitilafu ya mfumo katika kitendo cha malipo inamaanisha tunahitaji mhandisi kuchunguza kwa nini kitendo cha Lambda kinashindwa. Matokeo yale yale yanayoonekana — agizo halikupita — lakini urekebishaji tofauti kabisa."

**Aina za Hali: Vipande vya Ujenzi**

**Kazi (Task)**: Tekeleza kitendo — ita kitendo cha Lambda, anzisha kazi ya ECS, ita API. Hapa ndipo kazi halisi inafanyika.

**Chaguo (Choice)**: Tawi kulingana na masharti katika data ya ingizo. Kama if/else katika msimbo.

**Sambamba (Parallel)**: Endesha matawi mengi wakati mmoja na usubiri yote yakamilike.

**Ramani (Map)**: Tumia seti ya hali kwa kila kipengele katika orodha. Shughulikia vipengele 50 vya menyu ya mgahawa kwa sambamba.

Nimbus ilipoingiza menyu ya mgahawa, menyu ingeweza kuwa na mahali popote kutoka vipengele 8 hadi 200. Kwa kila kipengele, mchakato wa uingizaji ulihitaji: kuthibitisha umbizo, kuangalia data ya vizio, kupiga picha ukubwa, na kuandika rekodi kwa DynamoDB.

Bila hali ya Map, hii ingekuwa Lambda moja inayochakata vipengele kwa mfululizo — vipengele 200 × 200ms kwa kila kipengele = sekunde 40 za muda wa usindikaji. Na hali ya Map, Step Functions inazindua utekelezaji wa wakati mmoja wa hali za usindikaji — hadi kikomo cha wakati mmoja kilichosanidiwa — na inasubiri vyote vikamilike. Vipengele vile vile 200 vinaweza kumaliza ndani ya sekunde 5.

**Subiri (Wait)**: Simama kwa muda uliobainishwa au mpaka alama ya wakati. Muhimu kwa ucheleweshaji wa ratiba.

**Pita (Pass)**: Pita ingizo kwa matokeo bila kufanya kazi. Hutumika kwa mabadiliko ya data na majaribio.

**Fanikiwa/Shindwa (Succeed/Fail)**: Hali za mwisho zinazomaliza utekelezaji.

Kwa uandikishaji wa mgahawa, Leo alibuni mtiririko wa kazi:

1. ValidateLicense (Kazi → Lambda)
2. ImportMenu (Kazi → Lambda, na majaribio 3)
3. Tawi la Sambamba:
   a. SetupPayments (Kazi → Lambda)
   b. CreateIAMRole (Kazi → Lambda)
4. SendWelcomeEmail (Kazi → Lambda, inasubiri sambamba kukamilike)
5. NotifySalesTeam (Kazi → Lambda)

Hatua 3a na 3b zinaendesha kwa sambamba — hazitegemei kila mmoja, na kuziendesha wakati mmoja kunaokoa muda.

Baada ya kundi la kwanza la migahawa kukamilisha uandikishaji, sharti la uzingatifu liliibuka: kabla mshirika wa mgahawa hajaweza kuanza kufanya kazi, msimamizi wa akaunti wa Nimbus ilibidi akague kwa mkono na kuidhinisha nyaraka za leseni. Hii ingeweza kuchukua siku moja hadi tatu za biashara.

"Na je, ikiwa mtu atajaribu kuvunja wakati wa dirisha hilo?" Priya aliuliza. "Ikiwa mgahawa umesanidiwa kwa sehemu — akaunti ya malipo imeundwa lakini bado haijaidhinishwa — na mtu agundue hali inayosubiri, wangeweza kujaribu kutumia vibaya usanidi ulio nusu-wazi."

Kwa vitendo zaidi: unasimamishaje mtiririko wa kazi wa Step Functions kwa siku tatu ukisubiri binadamu?

Jibu ni **mchakato wa simu ya nyuma na tokeni ya kazi**.

`ValidateLicense` inapoendesha, badala ya kukamilika kiotomatiki, inaita Lambda inayofanya mambo matatu:

1. Inatuma barua pepe kwa msimamizi wa akaunti na nyaraka za mgahawa
2. Inarekodi **tokeni ya kazi** (kitambulisho cha kipekee ambacho Step Functions inazalisha kwa utekelezaji na hali hii mahususi) katika hifadhidata, kilichohusishwa na ukaguzi huo unaosubiri
3. Inarudi kwa Step Functions na `.waitForTaskToken` — ambayo inaambia Step Functions kusimamisha utekelezaji kwenye hali hii bila kikomo

Step Functions inaegesha utekelezaji. Hakuna kingine kinachozuiwa — hakuna seva inayosubiri. Mashine ya hali inasubiri tu, isiyotumia rasilimali za kompyuta.

Siku tatu baadaye, msimamizi wa akaunti anabofya "Approve" katika zana ya ndani ya usimamizi. Zana ya usimamizi inatafuta tokeni ya kazi kutoka kwa hifadhidata na inaita:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions inaendelea. Utekelezaji unaendelea kutoka hatua ya 2 (`ImportMenu`), na taarifa za mkaguzi zinapatikana katika hali ya mtiririko wa kazi.

"Utekelezaji ulisimamishwa kwa siku tatu," Leo alisema, "na kitu pekee kilichotokea nilipoidhinisha kilikuwa wito mmoja wa API."

"Na ikiwa msimamizi wa akaunti atakikataa?" Maya aliuliza.

"Tunaita `send_task_failure` badala yake. Mashine ya hali inashika hilo na inaelekeza kwa hali ya `NotifyRejection` inayomtumia mshirika wa mgahawa barua pepe."

Step Functions haitoi kura. Haijaribu tena. Haiishi muda (isipokuwa uweke muda kuisha wa mpigo wa moyo). Inasubiri tu hadi simu ya nyuma ifike, kisha inaendelea. Hii ni tofauti kabisa na kutoa kura kwa hifadhidata au foleni — na ndiyo sababu Step Functions inafaa vizuri kwa mitiririko ya kazi inayochanganya hatua za kiotomatiki na za mkono.

**Kusoma Dashibodi ya Utekelezaji: Kushindwa Kunavyoonekana**

Lambda ya arifa ya mgahawa ilipoisha muda wakati wa wiki ya kwanza ya Nimbus kwenye Step Functions, Leo alifungua dashibodi ya Step Functions na akabofya utekelezaji uliyoshindwa.

**Historia ya Matukio ya Utekelezaji** ilionyesha mstari wa muda wa haswa kilichotokea:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

Katika sekunde 42, Step Functions ilikuwa imetoza kadi, imetuma barua pepe, imejaribu arifa ya mgahawa mara tatu, imeshika kushindwa, imeonya timu ya msaada, na imerekodi historia kamili. Kabla ya Step Functions, kushindwa huku kungekuwa kusiokonekana — kitendo cha Python kingeweka "notification failed" kwenye kumbukumbu na kurudisha 200 kwa mwito kana kwamba hakuna kosa.

"Mstari wa muda unaonyesha haswa mahali mambo yalipoenda vibaya na lini," Leo alisema. "Na kila jaribio la kujaribu tena lina alama ya wakati. Unaweza kuona vipindi vya nyuma."

Priya aliangalia dashibodi. "Na historia hii inahifadhiwa kwa muda gani?"

Historia ya utekelezaji ya mtiririko wa kazi wa Kawaida huhifadhiwa kwa siku 90. Kwa uzingatifu au ukaguzi wa muda mrefu, matukio ya utekelezaji yanaweza pia kuhamishiwa CloudWatch Logs na kuhifadhiwa bila kikomo.

**Mtiririko wa Kazi wa Kawaida dhidi ya Express**

Step Functions inatoa aina mbili za mtiririko wa kazi:

**Mtiririko wa kazi wa Kawaida (Standard workflows)**:

- Muda wa juu: mwaka 1
- Utekelezaji hudumu — hali inahifadhiwa, inaweza kukaguliwa na kuchunguzwa
- Utekelezaji wa mara moja haswa (kazi kamwe haiendeshwi zaidi ya mara moja isipokuwa usanidi Retry)
- Bei kwa kila mpito wa hali
- Bora kwa mitiririko ya kazi ya muda mrefu, muhimu (usindikaji wa agizo, uandikishaji, mitiririko ya malipo)

**Mtiririko wa kazi wa Express (Express workflows)**:

- Muda wa juu: dakika 5
- Uendeshaji wa juu — hadi 100,000 kwa sekunde
- Utekelezaji wa angalau mara moja (wa nje) au wa mara moja tu (wa wakati mmoja) — buni kazi ziwe za kuzalisha matokeo sawa
- Bei kwa muda (kama Lambda)
- Bora kwa mitiririko ya kazi ya kiwango kikubwa, mfupi (usindikaji wa tukio wa wakati halisi, uingizaji wa data ya IoT)

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza, akiibua ukurasa wa bei. "Kwa kila mpito wa hali kwa Kawaida — hiyo inajumuika ikiwa una hatua nyingi."

Leo alipitia hesabu. Kwa mtiririko wa kazi wa uandikishaji wa mgahawa (hali sita za kazi kwa kila utekelezaji, takriban migahawa 12-15 mipya kwa mwezi): chini ya mia ya mipito ya hali — chini ya senti, na yote ndani ya tabaka la bure la mipito 4,000 kwa mwezi, kwa hivyo kwa kweli $0. Kwa mtiririko wa kazi wa uthibitisho wa agizo kwa trafiki kamili ya Nimbus: ya maana zaidi, lakini bado chini sana ya gharama ya kutatua mafanikio kumi na moja ya sehemu kwa mwezi kwa mkono.

"Muda wa kutatua ndio gharama iliyofichwa," Leo alisema.

"Hiyo daima ndiyo gharama iliyofichwa," Tom alisema.

Tom aliendesha namba kwa makini zaidi, kwa sababu huyo ndiye Tom.

**Gharama ya mtiririko wa kazi wa Kawaida kwa mtiririko wa uthibitisho wa agizo wa Nimbus**: hali tano kwa kila agizo kwenye njia ya furaha, kwa $0.000025 kwa kila mpito wa hali. Mipito mitano ya hali × $0.000025 × maagizo 15,000 kwa mwezi = **$1.88/mwezi**. Kwa kiwango cha agizo mara kumi: karibu $19/mwezi. Gharama ya kutatua tukio moja la mafanikio-ya-sehemu (dakika 24 za muda wa mhandisi wa msaada) ilizidi bili ya kila mwezi ya Step Functions mara nyingi.

Ulinganisho unakuwa muhimu ikiwa mtu atapendekeza kutumia mitiririko ya kazi ya Kawaida kwa matukio ya uchambuzi ya marudio ya juu. Tuseme Nimbus ilitaka kutumia Step Functions kuchakata kila tukio ghafi la clickstream — kila mwonekano wa ukurasa wa menyu, kila kusogeza, kila utafutaji. Hiyo ni takriban matukio 800,000 kwa siku kwa kiwango chao cha sasa. Mtiririko wa kazi wa Kawaida wa hali tano kwa kila tukio: 800,000 × 5 × $0.000025 × siku 30 = **$3,000/mwezi**. Hiyo ni pesa halisi kwa bomba la uchambuzi.

Mitiririko ya kazi ya Express kwa kiasi kile kile: bei kwa kila ombi pamoja na muda, si kwa kila mpito wa hali. Utekelezaji milioni 24 kwa mwezi unagharimu $1.00 kwa milioni za maombi = $24. Muda: 24M × 500ms kwa kima cha chini cha bili cha 64MB ≈ GB-saa 208 × $0.06 = $12.50. Jumla ≈ **$36.50/mwezi** — karibu maagizo mawili ya ukubwa nafuu zaidi kuliko $3,000 ya Kawaida.

"Kwa hivyo aina ya mtiririko wa kazi si uamuzi wa usanifu tu," Tom alisema. "Ni uamuzi wa gharama. Idadi ile ile ya hali inaweza kugharimu karibu mara mia zaidi kulingana na aina gani ya mtiririko wa kazi unayotumia."

"Na ipi ni bora inategemea kabisa mtiririko wa kazi unafanya nini," Leo alisema. "Uthibitisho wa agizo: Kawaida. Ni muhimu, una njia za kushindwa za maana, tunataka njia ya ukaguzi. Usindikaji wa tukio la uchambuzi: Express. Ni kiwango kikubwa, muda mfupi, na hatuhitaji historia ya utekelezaji ya siku 90 kwa kila mwonekano wa ukurasa."

Ikiwa mchakato wako una hatua mbili na hauhitaji njia ya ukaguzi, kitendo rahisi cha Lambda ni cha bei nafuu zaidi na hakihitaji sintaksia ya mashine ya hali ya JSON — lakini ikiwa hatua yoyote inaweza kushindwa kwa kujitegemea na inahitaji kujaribiwa tena au kuanzishwa upya bila kurudia hatua za awali, Step Functions inajilipia katika kupunguza utatuzi na urekebishaji wa mkono.

Kwa uandikishaji wa mgahawa wa Nimbus: Kawaida (ni muhimu, hudumu, inaweza kuchukua masaa ikiwa hatua za mkono zinahusika).

Kwa masasisho ya hali ya agizo ya wakati halisi ya Nimbus: Express (kiwango kikubwa, muda mfupi, si muhimu sana).

**Usanifu Unaoendelewa na Matukio: Picha Kubwa**

Step Functions ni sehemu moja ya muundo mkubwa: **usanifu unaoendelewa na matukio**. Badala ya huduma kuita kila mmoja moja kwa moja (kushikamana kwa nguvu), huduma hutoa matukio, na huduma zingine hujibu matukio hayo.

Tumeona hili katika kitabu chote:

- Maagizo yaliyowekwa → SNS inachapisha tukio → Foleni za SQS zinawasilisha kwa walaji
- Faili la S3 lililopakiwa → Lambda imeanzishwa kulishughulikia
- Rekodi ya DynamoDB iliyobadilika → DynamoDB Streams → Lambda inasasisha kashe

**Amazon EventBridge** (zamani CloudWatch Events) ni basi ya tukio ya hali ya juu kwa muundo huu. Inapitisha matukio kutoka huduma za AWS na programu zako mwenyewe hadi malengo (Lambda, SQS, Step Functions, n.k.) kulingana na sheria.

EventBridge inaruhusu kushikamana kwa urahisi katika kiwango cha usanifu: huduma ya agizo inachapisha matukio ya `order.placed` bila kujua nani anasikiliza. Huduma ya uchambuzi, huduma ya arifa, na huduma ya pointi za uaminifu zote zinasikiliza kwa kujitegemea. Kuongeza msikilizaji mpya hakuhitaji kubadilisha huduma ya agizo.

EventBridge pia inaungana kwa asili na makumi ya huduma za AWS kama **vyanzo vya matukio**. Wito wa API wa CloudTrail unapofanana na muundo, EventBridge inaweza kuwasha sheria. Kipengele cha EC2 kinapobadilisha hali, EventBridge inaweza kuanzisha Lambda. Kipengele cha RDS kinaposhindwa hama, EventBridge inaweza kuonya mhandisi wa zamu. Unaweza kuchukulia ndege lote la udhibiti la AWS kama mtiririko wa matukio.

Kwa Nimbus, sheria muhimu sana ya EventBridge: anzisha Lambda wakati wowote picha mpya inasukumwa kwa ECR. Lambda inakagua matokeo ya uchunguzi wa picha na inachapisha kwa kituo cha Slack cha uhandisi ikiwa CVE zozote za HIGH au CRITICAL zitapatikana — kabla mtu hajasambaza picha. Hii inachanganya uchunguzi wa usalama wa ECR (kutoka sura ya 21) na upitishaji wa matukio wa EventBridge kuwa lango la usalama la kiotomatiki.

Kanuni ya usanifu unaoendelewa na matukio ni ile ile ya mantiki ya kujaribu tena ya Step Functions: fanya kushindwa kuwa wazi na kuelekezwa, si kimya na kumezwa. Huduma zinazowasiliana kupitia matukio zinashindwa kwa adabu — ikiwa Lambda ya pointi za uaminifu iko chini wakati tukio la `OrderConfirmed` linawaka, EventBridge inaweza kujaribu tena utoaji au kutuma kwa foleni ya ujumbe uliokufa. Uthibitisho wa agizo wenyewe hauathiriki. Kutengana ndio ustahimilivu.

**EventBridge: Kutenganisha Athari za Pembeni na Mtiririko Mkuu**

Baada ya mashine ya hali ya uthibitisho wa agizo kuwa ikiendesha kwa usafi, Maya aliibua swali katika ukaguzi wa usanifu uliofuata.

"Tunataka kuongeza pointi za uaminifu agizo linapothibitishwa. Mteja anapata pointi moja kwa kila dola iliyotumika. Hiyo inaenda wapi katika mashine ya hali?"

Hisia ya kwanza ya Leo: ongeza hali ya `GrantLoyaltyPoints` baada ya `LogTransaction`.

Jibu la Priya: "Na kisha tunapoongeza zawadi za rufaa? Na uchunguzi wa baada ya agizo? Na maombi ya ukadiriaji wa mgahawa? Kila moja inaongeza hali kwenye njia muhimu. Ikiwa Lambda ya pointi za uaminifu itashindwa, uthibitisho wote wa agizo unashindwa."

"Mtiririko wa uthibitisho wa agizo unapaswa kufanya kitu kimoja," alisema. "Thibitisha agizo. Kila kitu kingine ni athari ya pembeni."

Hii ndiyo hoja ya usanifu ya **Amazon EventBridge** kama utaratibu wa kutenganisha kwa urahisi athari za pembeni na mtiririko mkuu wa kazi.

Mbinu iliyorekebishwa: hali ya `LogTransaction` inapokamilika kwa mafanikio, Lambda inachapisha tukio kwa EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Kisha sheria za EventBridge zinaelekeza tukio hilo kwa malengo huru:

- **Sheria 1**: `OrderConfirmed` → Lambda ya Pointi za Uaminifu (inatoa pointi 32 kwa agizo la $32)
- **Sheria 2**: `OrderConfirmed` → Lambda ya Uchunguzi wa Baada ya Agizo (inaweka uchunguzi kwa masaa 2 baada ya uwasilishaji)
- **Sheria 3**: `OrderConfirmed` → Mtiririko wa Kinesis wa Uchambuzi (inalisha dashibodi ya wakati halisi)

Kila sheria ni huru. Lambda ya Pointi za Uaminifu inaweza kushindwa bila kuathiri foleni ya uchunguzi. Bomba la uchambuzi linaweza kurudi nyuma bila kuzuia mfumo wa uaminifu. Kuongeza athari mpya ya pembeni (ombi la ukadiriaji wa mgahawa, arifa ya kurudisha pesa) kunahitaji kuunda sheria mpya ya EventBridge — si kurekebisha mashine ya hali.

"Na je, ikiwa mtu atajaribu kuvunja kupitia sheria ya EventBridge?" Priya aliuliza. "Ikiwa tukio lina PII ya mteja, kila Lambda inayolipokea sasa ni hatua ya ufikiaji wa PII."

Tukio lilibuniwa kwa makini: vitambulisho tu, si majina, anwani, au maelezo ya malipo. Lambda yoyote inayohitaji data ya mteja ingeitafuta kutoka kwa hifadhidata ikitumia kitambulisho cha mteja — ikiwa na ruhusa zake za IAM zinazodhibiti kile inachoweza kufikia.

"Tukio ni ishara," Priya alisema. "Si kutapika kwa data."

**Wakati Step Functions Ni Zana Sahihi**

Step Functions inafanya vizuri unapokuwa na:

**Mitiririko ya kazi yenye hatua nyingi** inayohitaji kufuatilia maendeleo katika hatua

**Michakato yenye binadamu katika mzunguko** — Step Functions inaweza kusubiri bila kikomo kwa tukio la nje (kama binadamu anayeidhinisha kitu) na kisha kuendelea

**Kushughulikia makosa kwa kiwango** — mantiki ya kujaribu tena, kunasa, na kurudi nyuma iliyojengwa ndani katika hatua nyingi

**Michakato inayoweza kukaguliwa** — kila utekelezaji hurekodi kila mpito wa hali. Unaweza kuona haswa kilichotokea na lini.

**Mantiki ngumu ya sambamba au mfululizo** — mtiririko wa kazi wa kuonekana unafanya iwe rahisi zaidi kusababu kuliko msimbo sawa

Step Functions ni ya ziada kwa michakato rahisi ya hatua mbili. Itumie wakati uratibu wenyewe una thamani na hali za kushindwa ni muhimu.

**Wakati Step Functions Ni Zana Isiyo Sahihi**

"Subiri — lakini *kwa nini* tusitumie Step Functions kwa kila kitu?" Maya aliuliza mwishoni mwa kikao cha muundo. "Tumejenga mtiririko wa kazi wa uandikishaji wa mgahawa. Tuna mtiririko wa uthibitisho wa agizo. Kwa nini tusibadilishe kila kitu kuwa mashine za hali?"

Jibu la uaminifu: kwa sababu Step Functions inaongeza gharama ya juu ambayo si kila mtiririko wa kazi unaihalalisha.

**Michakato rahisi ya hatua mbili**: Ikiwa una Lambda inayochakata faili lililopakiwa kwa kuita Lambda ya pili, gharama ya juu ya uratibu ya mashine ya hali haistahili faida ya uendeshaji. Lambda mbili zinazoitwa kwa mfululizo ndani ya kitendo kimoja ni rahisi, rahisi kujaribu, na hazina gharama ya kila mpito wa hali.

**Mitiririko ya kazi ya marudio ya juu sana, ya chini-ya-sekunde**: Mitiririko ya kazi ya Kawaida ina gharama ya kila mpito wa hali isiyo ndogo inayojikusanya kwa kiwango kikubwa (kama mfano wa uchambuzi hapo juu ulivyoonyesha). Mitiririko ya kazi ya Express inatatua tatizo la gharama lakini haitoi historia ya hali inayodumu. Kwa marudio ya juu sana yenye muda mfupi sana, SQS pamoja na Lambda (mchakato wa sura ya 19) ni rahisi na ya bei nafuu zaidi kuliko aina yoyote ya Step Functions.

**Fan-out tupu bila uratibu**: Ikiwa unahitaji kutuma tukio lile lile kwa walaji ishirini na hujali matokeo ya kila mmoja, SNS ndiyo zana. Step Functions inaongeza ufuatiliaji wa hali ambao huhitaji na ungelipia bila ulazima.

**Mwingiliano wa wakati halisi wa wakati mmoja na mtumiaji**: Utekelezaji wa Step Functions ni wa nje. Ikiwa mtumiaji anasubiri kwenye skrini ya malipo kwa jibu la wakati mmoja chini ya 500ms, mtiririko wa kazi wa Kawaida wa Step Functions haukubuniwa kwa hili (mitiririko ya kazi ya Express inaweza kuitwa kwa wakati mmoja, lakini gharama ya juu ya latency bado ni ya juu kuliko wito wa moja kwa moja wa Lambda). Kwa mitiririko ya wakati mmoja inayomwelekea mtumiaji, Lambda + API Gateway yenye ushughulikiaji bora wa makosa mara nyingi ni inayofaa zaidi.

Kanuni: tumia Step Functions wakati *uratibu* wa hatua wenyewe ni mgumu — wakati hatua zinaweza kushindwa kwa kujitegemea, wakati unahitaji kujaribu tena hatua binafsi bila kurudia za awali, wakati historia ya utekelezaji ina thamani ya uzingatifu au utatuzi, au wakati mtiririko wa kazi unahusisha hatua za idhini ya binadamu zinazoweza kuchukua siku. Usiitumie kuongeza gharama ya juu ya uandaaji kwa mantiki rahisi ya mfululizo inayofanya kazi vizuri kama kitendo kimoja.

## Nguvu na Mipaka

**Kwa nini Step Functions ina nguvu**:

- Historia ya utekelezaji ya kuonekana — ona haswa mtiririko wa kazi uko wapi (au ulishindwa)
- Kujaribu tena na kushughulikia makosa kuliyojengwa ndani — hakuna msimbo wa kujaribu tena wa desturi
- Hali hudumu — utekelezaji unanusurika baada ya seva kuanzishwa tena na kukatika
- Muunganiko wa moja kwa moja na huduma zaidi ya 200 za AWS (si Lambda tu)
- Mtiririko wa kazi wa kuonekana hujielezea wenyewe
- Mchakato wa simu ya nyuma unawezesha kusubiri bila kikomo kwa vitendo vya binadamu bila kutumia kompyuta

**Mahali ambapo mambo yanakuwa magumu**:

- Mitiririko ya kazi ya Kawaida inalipiwa kwa kila mpito wa hali — mitiririko ya kazi ngumu yenye hali nyingi inaweza kuwa ghali kwa kiwango
- Umbizo la JSON la ASL (Amazon States Language) lina mkondo wa kujifunza
- Ukubwa wa juu wa mzigo ni 256KB — data kubwa lazima ipitishwe kupitia marejeo ya S3, si moja kwa moja kupitia mtiririko wa kazi
- Mitiririko ya kazi ya muda mrefu yenye hatua nyingi za mkono inahitaji usanidi makini wa muda kuisha
- Kutatua makosa ya ASL kunahitaji kuendesha utekelezaji; hakuna kiigizaji cha ndani chenye uwezo kama huduma halisi
- Ruhusa za IAM lazima zitolewe kando kwa kila rasilimali ambayo mashine ya hali inaita — kusahau ruhusa moja husababisha hitilafu inayochanganya wakati wa utekelezaji

## Muhtasari

Vyombo katika sura ya 21 vilifanya usambazaji kuwa wa kuaminika. Step Functions inafanya michakato ya biashara yenye hatua nyingi kuwa ya kuaminika — kanuni ile ile ya "ondoa hatari ya kukabidhi" iliyotumika kwa mantiki ya programu.

- **Step Functions** inaandaa mitiririko ya kazi yenye hatua nyingi kama mashine za hali.
- Kila **hali** inaweza kuendesha kitendo cha Lambda, kutekeleza kazi ya ECS, kusubiri, kutawanyika, au kuendesha hatua za sambamba.
- **Kujaribu tena na kunasa** kumejengwa ndani ya kila hali — hakuna msimbo wa kujaribu tena wa desturi unaohitajika.
- **Mitiririko ya kazi ya Kawaida**: muda mrefu (hadi mwaka 1), hudumu, mara moja haswa. Kwa michakato muhimu ya biashara.
- **Mitiririko ya kazi ya Express**: muda mfupi (hadi dakika 5), uendeshaji wa juu. Kwa usindikaji wa tukio wa kiwango kikubwa.
- **Mchakato wa simu ya nyuma na tokeni ya kazi**: simamisha mtiririko wa kazi bila kikomo ukisubiri tukio la nje au kitendo cha binadamu; endelea kwa wito mmoja wa API.
- **Hali ya Map**: chakata orodha ya vipengele kwa wakati mmoja — badilisha vitanzi vya mfululizo na fan-out ya sambamba.
- **Muunganiko wa moja kwa moja wa SDK**: ita DynamoDB, S3, SQS, na huduma zaidi ya 200 za AWS moja kwa moja kutoka kwa hali, bila kifuniko cha Lambda.
- **EventBridge**: tenganisha athari za pembeni na mtiririko mkuu wa kazi — chapisha tukio moja, acha sheria huru ziielekeze kwa pointi za uaminifu, uchambuzi, na huduma za uchunguzi bila kurekebisha mashine kuu ya hali.
- **Gharama ya Kawaida dhidi ya Express**: Kawaida kwa $0.000025 kwa kila mpito wa hali inafanya kazi vizuri kwa mitiririko ya kazi muhimu ya kiwango kidogo (uthibitisho wa agizo kwa $1.88/mwezi kwa Nimbus). Express kwa bei ya kila-ombi-pamoja-na-muda inafaa kwa matukio ya marudio ya juu ambapo Kawaida ingegharimu makumi ya mara zaidi (~80x katika hesabu ya clickstream ya Nimbus).
- **Usanifu unaoendelewa na matukio** unatumia huduma kama SNS, SQS, Lambda, na EventBridge kutenganisha mifumo kuzunguka matukio badala ya wito wa moja kwa moja.
- Tumia Step Functions wakati uratibu wa hatua wenyewe ni mgumu na wakati uwezekano wa kukagua ni muhimu. Usiitumie kwa mfululizo rahisi wa hatua mbili, mitiririko ya kazi ya marudio-ya-juu-sana, fan-out tupu, au mitiririko ya wakati mmoja inayomwelekea mtumiaji.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Ishara za matumizi ya Step Functions**: "andaa vitendo vingi vya Lambda," "mtiririko wa kazi wenye majaribio ya kujaribu tena na kushughulikia makosa," "hatua ya idhini ya binadamu katika mtiririko wa kazi wa kiotomatiki," "njia ya ukaguzi ya kila hatua ya mtiririko wa kazi" → Step Functions.
- **Kawaida dhidi ya Express**: Kawaida kwa mitiririko ya kazi ya muda mrefu, inayoweza kukaguliwa, muhimu kwa biashara. Express kwa usindikaji wa tukio wa uendeshaji wa juu, muda mfupi.
- **SQS dhidi ya Step Functions**: SQS kwa foleni rahisi za kazi (mzalishaji/mlaji). Step Functions kwa mitiririko ya kazi yenye hatua nyingi yenye mantiki ngumu, majaribio ya kujaribu tena, na ufuatiliaji wa hali.
- **Ishara za EventBridge**: "elekeza matukio kutoka huduma za AWS hadi malengo," "muunganiko unaoendelewa na matukio kati ya huduma," "panga ratiba ya kitendo cha Lambda" → EventBridge (zamani CloudWatch Events).
- **Mchakato wa simu ya nyuma (Callback pattern)**: Step Functions inaweza kusimamisha utekelezaji na kusubiri simu ya nyuma ya nje (tokeni ya kazi). Mfanyakazi anapigia simu nyuma anapomaliza. Muhimu kwa kazi ndefu za ECS ambapo hutaki kikomo cha dakika 15 cha Lambda.
- **Muunganiko wa moja kwa moja wa SDK**: Step Functions inaweza kuita huduma za AWS moja kwa moja (DynamoDB, S3, SQS, n.k.) bila kwenda kupitia Lambda. Hupunguza gharama na latency kwa wito rahisi wa huduma. Kwa mfano, kuandika rekodi ya agizo kwa DynamoDB kunaweza kuwa wito wa moja kwa moja wa SDK kutoka kwa mashine ya hali bila kitendo cha Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Hii inaondoa kuanza baridi kwa Lambda, gharama ya utekelezaji wa Lambda, na msimbo unaoita tu `dynamodb.put_item(...)` na kurudisha.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza kwa nini Step Functions ina manufaa kwa mitiririko ya kazi yenye hatua nyingi. Inatoa nini ambacho kitendo rahisi cha Lambda kinachoita vitendo vingine vya Lambda hakitoi?

*(Kidokezo: Fikiria kinachotokea wakati hatua ya 3 ya 5 inashindwa katika kila mbinu. Unajuaje kilichotokea? Unajaribu tena hatua ya 3 tu vipi?)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ya huduma za kifedha inashughulikia maombi ya mkopo katika hatua nyingi: ukaguzi wa mkopo, uthibitisho wa mapato, uthibitisho wa hati, ukaguzi wa muandishi wa bima (mkono), na arifa ya uamuzi. Kila hatua inaweza kuchukua muda kutoka sekunde (ukaguzi wa mkopo) hadi siku (ukaguzi wa muandishi wa bima). Kampuni inahitaji njia kamili ya ukaguzi ya kila hatua kwa uzingatifu. Hatua zilizoshindwa za kiotomatiki lazima zijaribu tena kiotomatiki; hatua za mkono lazima zisimame na kusubiri uamuzi wa binadamu.

Huduma gani BORA inakidhi mahitaji haya?

A) Vitendo vya AWS Lambda vilivyounganishwa pamoja na foleni za SQS kati ya kila hatua  
B) Mitiririko ya kazi ya Kawaida ya AWS Step Functions yenye mchakato wa Subiri simu ya nyuma kwa hatua ya ukaguzi wa muandishi wa bima  
C) Mitiririko ya kazi ya Express ya AWS Step Functions kwa hatua za kiotomatiki na SQS FIFO kwa hatua ya mkono  
D) Amazon EventBridge yenye sheria za tukio zinazoelekeza kati ya vitendo vya Lambda kwa kila hatua

**Kidokezo cha 1**: Muda "hadi siku" — aina gani ya Step Functions inasaidia hili?

**Kidokezo cha 2**: "Subiri uamuzi wa binadamu" — mchakato gani wa Step Functions umebuniwa kwa hili?

**Kidokezo cha 3**: "Njia kamili ya ukaguzi kwa uzingatifu" — huduma gani inatoa historia ya hali kwa kila utekelezaji?

**Jibu**: B

**Maelezo**: Mitiririko ya kazi ya Kawaida ya Step Functions inaweza kuendesha hadi mwaka 1, ikisaidia hatua ya ukaguzi wa muandishi wa bima ya siku nyingi. Mchakato wa Subiri simu ya nyuma unasimamisha utekelezaji kwenye hatua ya muandishi wa bima na tokeni ya kazi; muandishi wa bima anapofanya uamuzi, anapigia simu nyuma na tokeni ili kuendelea na mtiririko wa kazi. Mitiririko ya kazi ya Kawaida hurekodi kila mpito wa hali — njia kamili ya ukaguzi kwa uzingatifu.

**Kwa nini si A?** Lambda iliyounganishwa kupitia SQS haitoi ufuatiliaji wa hali uliojengwa ndani au njia ya ukaguzi. Hatua zilizoshindwa zinahitaji mantiki ya kujaribu tena ya desturi. Kuanzisha tena kutoka hatua maalum iliyoshindwa kunahitaji utekelezaji wa desturi.

**Kwa nini si C?** Mitiririko ya kazi ya Express ina muda wa juu wa dakika 5 — hauoani na hatua inayoweza kuchukua siku.

**Kwa nini si D?** EventBridge inaelekeza matukio kati ya huduma lakini haidumishi hali ya mtiririko wa kazi au kutoa kujaribu tena/ukaguzi uliojengwa ndani. Kujenga hili kwenye EventBridge peke yake kunahitaji usimamizi wa hali wa desturi.

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inajenga mchakato wa utatuzi wa mizozo ya ubora wa chakula. Mteja anaporipoti uzoefu mbaya:

1. Ripoti inathibitishwa kiotomatiki (inakagua ikiwa agizo lipo, ikiwa ni la hivi karibuni vya kutosha)
2. Mgahawa unataarifiwa kiotomatiki
3. Wakala wa msaada wa Nimbus anakagua malalamiko (hatua ya mkono — inaweza kuchukua siku 1-3 za biashara)
4. Kulingana na uamuzi wa wakala: toa kurudisha pesa (Lambda → kichakataji cha malipo) AU tuma kuponi ya msamaha (Lambda → huduma ya kuponi) AU pandisha kwa usimamizi (mtiririko mdogo wa kazi wa Step Functions)
5. Mteja anataarifiwa kuhusu matokeo

Buni hii kama mtiririko wa kazi wa Step Functions. Aina gani ya hali inashughulikia kila hatua? Ungeshughulikia vipi kusubiri siku 1-3? Ungebuni vipi tawi kwenye hatua ya 4?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni hali za Step Functions.)*

**Nyongeza**: Baada ya mashine ya hali kukamilika (tawi lolote), inachapisha tukio la `OrderDisputeResolved` kwa EventBridge. Athari gani za pembeni zinaweza kusikiliza tukio hili? Fikiria: mfumo wa ukadiriaji wa mgahawa, pointi za uaminifu za mteja (kurudisha pesa kunaweza kupunguza pointi), bomba la uchambuzi (kiwango cha mizozo ni metriki muhimu ya ubora wa mgahawa), na dashibodi ya ufuatiliaji wa SLA ya timu ya msaada wa mteja. Kutumia EventBridge hapa kunazuiaje mashine ya hali ya mzozo kuwa buibui wa utegemezi?

## Tukio Baada ya Mikopo

Mtiririko wa kazi wa uandikishaji wa mgahawa ulikuwa hai.

Katika mwezi uliofuata, washirika 12 wapya wa mgahawa waliandikishwa. Wawili walikuwa na kushindwa wakati wa hatua ya usindikaji wa malipo (hatua ya 3). Katika visa vyote viwili, Step Functions ilishika hitilafu haswa, ilihifadhi hali ya utekelezaji, na ilituma tahadhari kwa timu ya Nimbus.

Leo alishughulikia sababu ya msingi (ufunguo wa API uliosanidiwa vibaya kwa mtoa huduma wa malipo) na kujaribu tena utekelezaji wote wawili kutoka hatua ya 3. Utekelezaji ulikamilika katika sekunde 23 kila mmoja, ukichukua haswa mahali ulipokuwa umeshindwa.

Hakuna mgahawa aliyehitaji kuingizwa tena. Hakuna majukumu ya IAM yaliyoundwa mara mbili. Hakuna barua pepe za kukaribisha za nakala zilizotumwa.

"Kabla ya Step Functions," Leo alimwambia Maya, "hii ingehitaji mtu kufuatilia kwa mkono kilichofanyika na kisichofanyika kwa kila mgahawa, na kuendesha tena kwa mkono hatua zilizokosekana."

"Na sasa?"

"Sasa ninabofya jaribu tena katika dashibodi. Mfumo unajua kilichofanyika."

Maya alifikiria kuhusu hili.

"Hiyo si uboreshaji wa kiufundi tu," alisema. "Hiyo ndiyo tofauti kati ya mchakato unaopanuka na usiopanuka."

Katika sura inayofuata: kufanya nini na data ambayo huifikii sasa hivi, lakini unataka uhifadhi milele.
