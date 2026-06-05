# Sura ya 15: Walinzi Langoni

Kitufe cha zamani cha kupeleka kutoka toleo la kwanza la Nimbus kilikuwa bado kinatumika. Ilikuwa imepiga simu tatu za API wiki iliyopita. Leo hakujua kilichowafanya.

Priya alichota kumbukumbu za mtiririko wa VPC - rekodi za trafiki za mtandao ambazo zinaonyesha kila muunganisho ndani na nje ya VPC.

"Siku ya Jumanne saa 2:17 asubuhi," alisema, "kulikuwa na muunganisho wa nje kutoka kwa mfano wa EC2 unaoendesha API ya zamani hadi anwani ya IP nchini Romania."

"Hiyo sio miundombinu yetu," Leo alisema.

"Hapana."

"Kwa hivyo mtu alikuwa kwenye mfano wetu wa EC2."

"Au kitu."

Waliifuatilia nyuma: ufunguo wa zamani wa kupeleka ulikuwa umetumika kupakia hati ndogo kwa mfano wa EC2. Hati ilijaribu kuchanganua milango kwenye seva zilizo karibu. Uchambuzi mwingi haukufaulu.

"Vikundi vya usalama viliwazuia," Priya alisema. "Mshambulizi aliingia kwenye tukio moja la EC2. Hawakuweza kuwafikia wengine kwa sababu vikundi vya usalama viliruhusu tu trafiki kutoka kwa mizani ya mizigo."

"Kwa hivyo uharibifu ulidhibitiwa."

"Kwa sababu tulikuwa tumesanidi kwa usahihi vikundi vya usalama. Hebu fikiria kama tungeacha mlango wa 5432 wazi kwa mfano wowote wa EC2 katika akaunti."

Leo hakuwa na haja ya kufikiria. Aliona usanidi huo katika usanidi wa asili.

**Tabaka Mbili za Usalama wa Mtandao**

Katika VPC, unayo zana mbili tofauti za kudhibiti trafiki ya mtandao:

**Vikundi vya Usalama**: Ngome mtandaoni zilizoambatishwa kwa rasilimali mahususi (Matukio ya EC2, hifadhidata za RDS, visawazisha mizigo, kazi za Lambda katika VPC). Wanafanya kazi katika kiwango cha rasilimali.

**ACL za Mtandao (NACLs)**: Sheria za firewall zilizoambatishwa kwenye nyavu ndogo. Zinafanya kazi kwenye mpaka wa subnet - kabla ya trafiki kufikia rasilimali yoyote katika subnet hiyo.

Kuelewa zote mbili kunahitaji kuelewa tofauti moja muhimu: ** stateful vs stateless **.

**Hali: Vikundi vya Usalama**

Kikundi cha usalama ni **cha hali**.

Unaporuhusu trafiki inayoingia kwenye mlango mahususi, trafiki ya majibu inaruhusiwa kutoka kiotomatiki, hata kama hakuna sheria iliyo wazi ya kutoka kwayo.

Unaporuhusu trafiki inayotoka kwenda unakoenda, jibu linalorudi linaruhusiwa kiotomatiki.

Fikiria mlinzi mkuu katika jengo la ofisi. Unaonyesha beji yako ili kuingia. Unatoka nje baadaye. Mlinzi haitaji kukukagua tena wakati wa kutoka - mfumo unajua kuwa umeruhusiwa, na unaruhusiwa kuondoka.

**Sheria za Kikundi cha Usalama kwa mfano wa Nimbus API EC2:**

- **Inayoingia — TCP 8080 — kutoka Kisawazisha cha Mzigo SG** → Kubali trafiki ya API kutoka ALB
- **Inbound - TCP 22 - kutoka kwa Bastion Host SG** → SSH kutoka kwa bastion pekee
- **Inayotoka nje — TCP 5432 — kwa RDS SG** → Unganisha kwa PostgreSQL
- **Inayotoka nje — TCP 6379 — kwa ElastiCache SG** → Unganisha kwa Redis
- **Nje - TCP 443 - hadi 0.0.0.0/0** → HTTPS hadi API za nje

Notisi: hakuna sheria iliyo wazi ya kutoka kwa mlango wa 8080. Sheria ya kuingia ni ya kawaida - trafiki ya majibu (jibu la API kwa kisawazisha mzigo) linaruhusiwa kiotomatiki.

Pia kumbuka: kanuni za kikundi cha usalama rejea *vikundi vingine vya usalama*, si anwani za IP. "Ruhusu uingiaji kutoka kwa kikundi cha usalama cha mizani ya mizigo" inamaanisha "kuruhusu trafiki kutoka kwa rasilimali yoyote ambayo kikundi hiki cha usalama kimeambatishwa." Hii inaweza kunyumbulika na kudumishwa zaidi kuliko kufuatilia anwani za IP.

**Tabia chaguomsingi:**

- Kwa chaguo-msingi, trafiki yote inayoingia inakataliwa
- Kwa chaguo-msingi, trafiki yote ya nje inaruhusiwa
- Sheria zote zimetathminiwa (vikundi vya usalama havina sheria zilizoagizwa - sheria zote zinazolingana zinatumika)
- Vikundi vya usalama vinaweza tu **kuruhusu** trafiki — huwezi kuunda sheria wazi za kukataa

**isiyo na serikali: ACL za Mtandao**

NACL haina uraia**.

Unaporuhusu trafiki inayoingia kwenye bandari 8080, hiyo inashughulikia tu zinazoingia. Jibu (trafiki ya nje kwenye bandari za muda mfupi) lazima iruhusiwe kwa uwazi na sheria ya nje.

Fikiria detector ya chuma. Unaipitia unapoingia. Kigunduzi cha chuma hakijui kuwa tayari umepitia - lazima upitie tena wakati wa kutoka.

**Sheria za NACL hupewa nambari na kutathminiwa kwa mpangilio.** Kanuni ya kwanza inayolingana itashinda. Kanuni ya 100 inatathminiwa kabla ya kanuni ya 200. Ikiwa sheria ya 100 inakataa trafiki na kanuni ya 200 inaruhusu, trafiki inakataliwa.

NACL zinaweza **kukana** kwa uwazi - tofauti na vikundi vya usalama, ambavyo vinaweza kuruhusu tu. Hii inawafanya kuwa muhimu kwa kuzuia safu maalum za IP.

**Tabia chaguomsingi ya NACL:**

- NACL chaguo-msingi (iliyoundwa na VPC yako) inaruhusu trafiki yote inayoingia na kutoka
- NACL maalum inakataa trafiki yote kwa chaguo-msingi (lazima uruhusu wazi kile unachotaka)

**NACL kwa subnet ya umma (iliyorahisishwa):**

*Sheria zinazoingia (zimetathminiwa kwa mpangilio - mechi ya kwanza inashinda):*

- Kanuni ya 100: TCP 443, kutoka 0.0.0.0/0 → **Ruhusu** (HTTPS)
- Kanuni ya 110: TCP 80, kutoka 0.0.0.0/0 → **Ruhusu** (HTTP)
- Kanuni ya 120: TCP 1024–65535, kutoka 0.0.0.0/0 → **Ruhusu** (bandari za kurudi ephemeral)
- Sheria \*: Trafiki yote → **Kataa**

*Sheria za nje:*

- Kanuni ya 100: TCP 443, hadi 0.0.0.0/0 → **Ruhusu** (HTTPS)
- Kanuni ya 110: TCP 80, hadi 0.0.0.0/0 → **Ruhusu** (HTTP)
- Kanuni ya 120: TCP 1024–65535, hadi 0.0.0.0/0 → **Ruhusu** (bandari za kurudi ephemeral)
- Sheria \*: Trafiki yote → **Kataa**

Kanuni ya 120 (bandari 1024-65535) inaruhusu bandari za muda mfupi - bandari za muda za nambari za juu zinazotumiwa kwa trafiki ya majibu ya TCP. Kwa sababu NACL hazina uraia, lazima uruhusu hizi zinazotoka kwa njia dhahiri, au majibu ya seva yako hayatafanikiwa.

** Wakati wa kutumia Ambayo **

Tumia **vikundi vya usalama** kwa safu ya msingi ya udhibiti wa ufikiaji. Ni rahisi kuzidhibiti, ni za hali ya juu (nafasi ndogo ya vizuizi kwa bahati mbaya kusahau bandari za muda mfupi), na kusaidia kurejelea vikundi vingine vya usalama.

Tumia **NACL** kwa vidhibiti vya kiwango kidogo, haswa:

- **Sheria za kukataa waziwazi**: Zuia anwani mahususi ya IP au masafa kutoka kwa kufikia subnet nzima
- **Uzuiaji wa dharura**: IP inashambulia kikamilifu - ongeza sheria ya kukataa ya NACL ili kuzuia subnet nzima kabla ya kufikia rasilimali yoyote

"Kwa hivyo kikundi cha usalama ndicho udhibiti mzuri," Maya alisema, "na NACL ni kiharusi kikubwa?"

"Vikundi vya usalama vinalinda rasilimali watu binafsi," Priya alithibitisha. "NACLs hulinda subneti zote. Unapotaka kuzuia IP isifikie chochote kwenye mtandao wako, NACL. Unapotaka kuruhusu tu kiweka usawazishaji kufikia seva ya API, kikundi cha usalama."

**Tukio: Kile Tabaka Zilishika**

Kurudi kwenye shambulio la IP ya Kiromania:

**Nini kilichotokea**: Mshambulizi alitumia ufunguo wa kusambaza ulioathiriwa kupakia hati ya kuchanganua kwenye tukio moja la EC2. Hati ilijaribu kuunganishwa na huduma zingine.

**Nini kiliwazuia**:

- Kikundi cha usalama cha RDS kiliruhusu tu kuingia kwenye bandari 5432 kutoka kwa kikundi cha usalama cha API EC2. Hati haikuweza kufikia hifadhidata kutoka kwa zana ya kuchanganua - haikuwa ikiambatisha kikundi sahihi cha usalama.
- Kikundi cha usalama cha ElastiCache kiliruhusu tu kuingia kwenye bandari 6379 kutoka kwa kikundi cha usalama cha API EC2.
- Matukio mengine ya EC2 yaliruhusu tu SSH kutoka kwa kikundi cha usalama cha mwenyeji wa bastion.

**Nini ambacho hakikuwazuia**: 

- Sheria za nje za mfano wa EC2 ziliruhusu HTTPS hadi 0.0.0.0/0 (inahitajika kwa upakuaji wa kifurushi). Hati ilitumia hii kuunda miunganisho ya nje kwa seva ya mshambulizi.

Baada ya tukio hilo, Priya aliongeza:

- Sheria ya NACL inayozuia anuwai ya IP ya Kiromania
- Sheria yenye vizuizi zaidi vya nje kwenye matukio ya EC2 (inaruhusiwa tu maeneo mahususi yanayojulikana)

## Nguvu na Mapungufu

**Vikundi vya Usalama**:

- Hali (hakuna maumivu ya kichwa ya ephemeral bandari)
- Inaweza kurejelea vikundi vingine vya usalama (inayonyumbulika zaidi kuliko IPs)
- Ruhusu sheria pekee - hakuna kukataa kwa uwazi
- Fanya kazi katika kiwango cha rasilimali - punjepunje

**NACL**:

- Bila utaifa (inahitaji sheria wazi kwa pande zote mbili pamoja na bandari za muda mfupi)
- Inaweza kukataa waziwazi - ni muhimu kwa kuzuia IP zinazojulikana
- Fanya kazi kwa kiwango cha subnet - kiharusi kikubwa zaidi
- Kanuni za nambari zimetathminiwa kwa mpangilio - zinaweza kutabirika lakini zinahitaji usimamizi makini

## Muhtasari

- **Vikundi vya Usalama** ni ngome mtandaoni za hali halisi za rasilimali mahususi. Ruhusu sheria pekee. Sheria zote tathmini.
- **NACL** ni ngome zisizo na uraia kwa subneti nzima. Ruhusu na ukatae sheria. Sheria zilizotathminiwa kwa mpangilio wa nambari.
- **Hali** inamaanisha trafiki ya majibu inaruhusiwa kiotomatiki. **isiyo na serikali** inamaanisha lazima uruhusu trafiki kwa njia zote mbili.
- Vikundi vya usalama ndio safu yako kuu ya udhibiti wa ufikiaji. NACL ni safu ya ziada ya vidhibiti vya kiwango cha subnet na uzuiaji dhahiri.
- Wakati NACL inaruhusu trafiki ya ndani, lazima pia uruhusu bandari za muda wa nje (1024-65535) ili jibu la TCP lipitie.
- Vikundi vya usalama vinaweza kurejeleana - kuruhusu trafiki "kutoka kwa kikundi cha usalama cha mizani ya mizigo" kunaweza kudumishwa kuliko kufuatilia anwani za IP.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Salama (Kikoa cha 1, Kazi ya 1.2)*

- **Taarifa dhidi ya wasio na uraia**: Tofauti hii ndiyo dhana iliyojaribiwa zaidi katika sura hii. Vikundi vya usalama = stateful = majibu yanaruhusiwa kiotomatiki. NACL = zisizo na uraia = lazima ziruhusu trafiki ya majibu kwa uwazi.
- **Sheria za kikundi cha usalama**: Hakuna kukanusha waziwazi. Wakati vikundi vingi vya usalama vimeunganishwa kwa mfano, muungano wa sheria zote hutumika. Sheria zote zinazolingana zinatathminiwa.
- **Agizo la sheria la NACL**: Sheria hutathminiwa kutoka nambari ya chini hadi ya juu zaidi. Kanuni ya 100 kabla ya 200. Mechi ya kwanza inashinda. Kanuni ya `*` (asteriski) chini ni kukanusha kabisa.
- **Bandari za muda mfupi**: Kosa la kawaida la NACL ni kusahau kuruhusu kutoka kwenye bandari 1024-65535. Ikiwa NACL yako inaruhusu HTTP inayoingia (mlango 80) lakini hairuhusu milango ya nje ya muda, watumiaji wanaweza kutuma maombi lakini kamwe wasipate majibu.
- **Marejeleo ya kikundi cha usalama**: Unaweza kuruhusu trafiki kutoka kwa kikundi kingine cha usalama (sio IP pekee). Huu ndio muundo unaopendekezwa kwa trafiki ya ndani ya VPC.
- **Chaguo-msingi NACL dhidi ya NACL maalum**: Chaguomsingi NACL inaruhusu trafiki yote. NACL maalum (unayounda) inakataa trafiki yote kwa chaguo-msingi. Hali ya mtihani: "iliunda NACL mpya na sasa trafiki imezuiwa" → angalia ikiwa hakuna sheria za kuruhusu.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Msanidi programu anaongeza sheria ya kuingia kwa kikundi cha usalama kinachoruhusu trafiki kwenye mlango wa 443. Je, anahitaji pia kuongeza sheria ya nje ili kuruhusu majibu ya seva? Kwa nini au kwa nini?

Ikiwa badala yake ataongeza sheria ya kuingia kwa NACL inayoruhusu trafiki kwenye bandari 443, je, anahitaji kuongeza sheria ya nje? Kwa nini au kwa nini?

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ina programu ya wavuti inayoendeshwa kwenye matukio ya EC2 katika mtandao mdogo wa umma. Programu inakubali trafiki ya HTTPS (bandari 443) kutoka kwa mtandao. Watumiaji wanaripoti kwamba wanaweza kuunganisha kwenye programu lakini hawawezi kupokea majibu - maombi hutegemea na muda umeisha.

Kikundi cha usalama cha EC2 kina sheria ya ndani inayoruhusu TCP 443 kutoka 0.0.0.0/0. NACL ya subnet ina sheria ya kuingia (kanuni ya 100) inayoruhusu TCP 443 kutoka 0.0.0.0/0 na sheria ya kutoka (kanuni ya 100) inayoruhusu TCP 443 hadi 0.0.0.0/0.

Ni nini kinachowezekana zaidi kuwa sababu ya suala hilo?

A) Kikundi cha usalama kinakosa sheria ya nje ya TCP 443  
B) NACL inakosa sheria ya nje inayoruhusu bandari za muda mfupi (1024-65535)  
C) Kikundi cha usalama kinakosa sheria ya kuingia kwa bandari za muda mfupi  
D) Matukio ya EC2 hayana anwani za IP Elastic

**Kidokezo cha 1**: Vikundi vya usalama ni vya kawaida — vinaruhusu majibu kiotomatiki. NACL hazina utaifa - hawana.

**Kidokezo cha 2**: Kivinjari kinapounganishwa kwenye seva ya wavuti kwenye mlango wa 443, majibu ya seva hurejea kwenye lango la muda maalum (1024-65535), si lango 443.

**Kidokezo cha 3**: NACL ina sheria ya kutoka kwa 443, lakini jibu haliendi kwenye bandari 443.

**Jibu**: B

**Maelezo**: NACL haina uraia. Watumiaji wanapounganisha kwenye seva kwenye mlango wa 443, majibu ya TCP ya seva hurudi nyuma kwenye mlango wa muda mfupi (umechaguliwa kwa nasibu kutoka 1024-65535). Sheria ya kutoka nje ya NACL inaruhusu bandari 443 pekee, kwa hivyo jibu limezuiwa na sheria ya kukataa chaguo-msingi. Kuongeza sheria ya nje ya NACL inayoruhusu TCP 1024-65535 ingerekebisha hili.

**Kwa nini isiwe A?** Vikundi vya usalama ni vya kawaida - trafiki ya majibu inaruhusiwa kiotomatiki bila kujali sheria za nje. Hakuna sheria ya kikundi cha usalama cha nje inahitajika.

**Kwa nini isiwe C?** Bandari za ephemeral ni za trafiki ya majibu kutoka nje, sio ya kuingia. Muunganisho wa ndani kutoka kwa watumiaji huja kwenye bandari 443, ambayo tayari imeruhusiwa.

**Kwa nini isiwe D?** IPs za Elastic huathiri kama matukio yana IP za umma, wala si kama miunganisho iliyoidhinishwa inaweza kupokea majibu.

*Kikoa cha SAA-C03: Usanifu Salama wa Kubuni — Jukumu la 1.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Baada ya shambulio la IP ya Kiromania, Priya anataka kutekeleza vidhibiti viwili vya ziada:

1. Zuia safu nzima ya IP ya 185.0.0.0/8 kufikia rasilimali yoyote kwenye mtandao mdogo wa umma.
2. Hakikisha kwamba subnet ya kibinafsi iliyo na hifadhidata haiwezi kamwe kuwasiliana na mtandao, hata kama mtu ataweka vibaya kikundi cha usalama.

Je, ungetumia zana gani kwa kila hitaji, na ungezisanidi vipi? Je, unaweza kutumia vikundi vya usalama kwa zote mbili? Unaweza kutumia NACL kwa zote mbili?

*(Hakuna jibu moja sahihi. Lengo ni kuelewa ni chombo kipi kinafaa tatizo gani.)*

## Onyesho la Baada ya Mikopo

Tukio hilo lilizuiliwa. Ufunguo wa kupeleka ulioathiriwa ulizimwa. Masafa ya IP ya Kiromania yamezuiwa kwenye NACL. Hati ya zamani ilikuwa imeondolewa kwenye mfano wa EC2.

Priya aliandika ripoti ya tukio. Aliishiriki na timu.

Mstari wa mwisho wa ripoti: "Sababu kuu: kitambulisho amilifu kutoka kwa bomba la upelekaji lililokatizwa kamwe halikuzungushwa au kubatilishwa. Pendekezo: mzunguko wa hati otomatiki na ukaguzi wa mara kwa mara wa vitambulisho vyote vya IAM."

Leo aliisoma mara tatu.

"Nilipaswa kuzungusha ufunguo huo," alisema.

“Ndiyo,” alisema Priya.

"Tunawezaje kuhakikisha hili halitokei tena?"

"Automatisering," alisema. "Na kitu ambacho hutazama walinzi."

Katika sura inayofuata: kisanduku cha kufuli ambapo Nimbus huhifadhi siri zake - na mzunguko unaofanya funguo zilizoibiwa kuwa zisizofaa.
