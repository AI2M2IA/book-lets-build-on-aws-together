# Sura ya 15: Walinzi Langoni

Ofisi ilikuwa kimya Jumanne asubuhi wakati Priya alipofungua flow logs za VPC na kuanza kusoma. Nje ya dirisha, jiji lilikuwa likiamka. Ndani, skrini ilionyesha kitu ambacho hakikupaswa kuwepo: muunganisho wa kwenda nje kutoka kihalisi cha EC2 saa 8:17 usiku hadi anwani ya IP nchini Romania.

Ufunguo wa zamani wa kusambaza kutoka toleo la kwanza la Nimbus ulikuwa bado amilifu. Ulikuwa umefanya miito mitatu ya API wiki iliyopita. Leo hakujua kilichoifanya.

---

*Marekebisho makubwa ya IAM yalikuwa yamebadilisha funguo za ufikiaji kwa majukumu. Kila huduma sasa ilikuwa na idhini haswa ilizozihitaji. Lakini wakati kazi hiyo ilipokuwa ikiendelea, tatizo la zamani lilikuwa likizidi kuwa baya kimya: kitambulisho amilifu kutoka bomba la usambazaji lililovunjwa kilikuwa bado hai, na kitu kilikuwa kimekitumia. Tabaka la IAM lilikuwa limeimarishwa. Vidhibiti vya mtandao ambavyo vingeweza kudhibiti uharibifu vilihitaji uangalifu uleule.*

---

Priya alivuta flow logs za VPC — rekodi za trafiki ya mtandao zinazoonyesha kila muunganisho ndani na nje ya VPC.

"Jumanne saa 8:17 usiku," alisema, "kulikuwa na muunganisho wa kwenda nje kutoka kihalisi cha EC2 kinachoendesha API ya zamani hadi anwani ya IP nchini Romania."

"Hiyo si miundombinu yetu," Leo alisema.

"Hapana."

"Kwa hivyo mtu alikuwa kwenye kihalisi chetu cha EC2."

"Au kitu."

Waliifuatilia nyuma: ufunguo wa zamani wa kusambaza ulikuwa umetumika kupakia hati ndogo kwenye kihalisi cha EC2. Hati ilikuwa imejaribu kuskani malango kwenye seva jirani. Skani nyingi zilishindwa.

"Tayari niliisambaza — oh." Leo alikuwa amesambaza marekebisho kwa kanuni ya kikundi cha usalama kabla uchunguzi haujakamilika. Marekebisho yalikuwa sahihi, lakini alikuwa ameyafanya kabla Priya hajamaliza kusoma flow logs. Alilazimika kusimama na kuthibitisha mabadiliko hayakuathiri chochote kisichotarajiwa.

"Wakati ujao, subiri hadi uchunguzi ufungwe kabla ya kusukuma mabadiliko," alisema.

"Vikundi vya usalama viliwazuia," Priya alisema. "Mvamizi aliingia kwenye kihalisi kimoja cha EC2. Hawakuweza kufikia vingine kwa sababu vikundi vya usalama viliruhusu tu trafiki kutoka load balancer."

"Kwa hivyo uharibifu ulidhibitiwa."

"Kwa sababu tulikuwa tumesanidi vikundi vya usalama kwa usahihi. Hebu fikiria kama tungeacha lango 5432 wazi kwa kihalisi chochote cha EC2 katika akaunti."

Leo hakuhitaji kufikiria. Alikuwa ameuona usanidi huo katika usanidi wa awali.

"Tumefikiria kile hicho kingemaanisha?" Priya aliendelea. "Kihalisi chochote cha EC2 katika akaunti — ikiwa ni pamoja na kile chenye ufunguo ulioathiriwa — kingeweza kuunganisha moja kwa moja kwa hifadhidata. Kuendesha SQL ya kiholela. Kupakua historia ya maagizo ya kila mteja. Kuangusha majedwali."

"Badala yake walikataliwa kila wakati walipojaribu," Leo alisema.

"Ndiyo. Kwa sababu kikundi cha usalama cha hifadhidata hukubali tu miunganisho kutoka kikundi cha usalama cha API. Si kutoka kihalisi chochote cha EC2 katika akaunti. Si kutoka IP yoyote. Mahususi kutoka kikundi cha usalama cha API."

"Uamuzi huo mmoja wa muundo," Maya alisema, "ndio tofauti kati ya tukio lililodhibitiwa na uvunjaji kamili wa data."

"Muundo wa kikundi cha usalama si kisanduku cha kuteua," Priya alisema. "Ni usalama halisi wa mfumo."

Rafael alikuwa akisikiliza. "Unajifunzaje usanidi sahihi ni upi? Kanuni zinaonekana kiholela mwanzoni."

"Unaanza kwa kuorodhesha kile kila kipengele kinachohitaji kufanya," Priya alisema. "Load balancer inahitaji kukubali HTTPS kutoka popote. Seva ya API inahitaji kukubali HTTP kutoka load balancer pekee. Hifadhidata inahitaji kukubali PostgreSQL kutoka seva ya API pekee. Redis inahitaji kukubali lango 6379 kutoka seva ya API pekee. Mahitaji hayo yanaelekeza moja kwa moja kwa kanuni za kuingia. Kila kitu kingine kinakataliwa kwa chaguomsingi."

"Na za kwenda nje?"

"Za kwenda nje ndipo watu huwa wazembe. Timu nyingi huacha za kwenda nje kama ruhusu-zote. Hilo linamaanisha kihalisi kilichoathiriwa kinaweza kuita chochote. Tutaikaza."

**Tabaka Mbili za Usalama wa Mtandao**

Katika VPC, una zana mbili tofauti za kudhibiti trafiki ya mtandao:

**Vikundi vya Usalama (Security Groups)**: Ngome za mtandaoni zilizoambatishwa kwa rasilimali mmoja mmoja (vihalisi vya EC2, hifadhidata za RDS, load balancers, vitendaji vya Lambda katika VPC). Hufanya kazi katika kiwango cha rasilimali.

**Network ACLs (NACLs)**: Kanuni za firewall zilizoambatishwa kwa subneti. Hufanya kazi katika mpaka wa subneti — kabla trafiki haijafikia rasilimali yoyote katika subneti hiyo.

Kuelewa zote mbili kunahitaji kuelewa tofauti moja muhimu: **stateful dhidi ya stateless** (yenye hali dhidi ya isiyo na hali).

**Yenye Hali: Vikundi vya Usalama**

Kikundi cha usalama ni **chenye hali (stateful)**.

Unaporuhusu trafiki ya kuingia kwenye lango mahususi, trafiki ya jibu inaruhusiwa kutoka kiotomatiki, hata kama hakuna kanuni ya wazi ya kwenda nje kwayo.

Unaporuhusu trafiki ya kwenda nje kwa marudio, jibu linalorudi linaruhusiwa kiotomatiki.

Fikiria mlinzi mwenye hali katika jengo la ofisi. Unaonyesha beji yako kuingia. Unatoka nje baadaye. Mlinzi hahitaji kukukagua tena ukiwa unatoka — mfumo unajua uliruhusiwa kuingia, na unaruhusiwa kuondoka.

**Kanuni za Kikundi cha Usalama kwa kihalisi cha Nimbus API EC2:**

- **Kuingia — TCP 8080 — kutoka Load Balancer SG** → Kubali trafiki ya API kutoka ALB
- **Kuingia — TCP 22 — kutoka Bastion Host SG** → SSH kutoka bastion pekee
- **Kwenda nje — TCP 5432 — kwa RDS SG** → Unganisha kwa PostgreSQL
- **Kwenda nje — TCP 6379 — kwa ElastiCache SG** → Unganisha kwa Redis
- **Kwenda nje — TCP 443 — kwa 0.0.0.0/0** → HTTPS kwa API za nje

Tambua: hakuna kanuni ya wazi ya kwenda nje kwa lango 8080. Kanuni ya kuingia ni yenye hali — trafiki ya jibu (jibu la API kwa load balancer) inaruhusiwa kiotomatiki.

Pia tambua: kanuni za kikundi cha usalama hurejelea *vikundi vingine vya usalama*, si anwani za IP. "Ruhusu kuingia kutoka kikundi cha usalama cha load balancer" inamaanisha "ruhusu trafiki kutoka rasilimali yoyote ambayo kikundi hiki cha usalama kimeambatishwa." Hii inanyumbulika na kudumishwa zaidi kuliko kufuatilia anwani za IP.

**Tabia ya chaguomsingi:**

- Kwa chaguomsingi, trafiki yote ya kuingia inakataliwa
- Kwa chaguomsingi, trafiki yote ya kwenda nje inaruhusiwa
- Kanuni zote hutathminiwa (vikundi vya usalama havina kanuni zilizopangwa kwa mpangilio — kanuni zote zinazolingana hutumika)
- Vikundi vya usalama vinaweza tu **kuruhusu** trafiki — huwezi kuunda kanuni za wazi za kukataa

**Isiyo na Hali: Network ACLs**

NACL ni **isiyo na hali (stateless)**.

Unaporuhusu trafiki ya kuingia kwenye lango 8080, hiyo inashughulikia kuingia tu. Jibu (trafiki ya kwenda nje kwenye malango ya muda) lazima liruhusiwe kwa uwazi kwa kanuni ya kwenda nje.

Fikiria kigunduzi cha chuma. Unapita kupitia kwacho ukiingia. Kigunduzi cha chuma hakijui tayari umekwisha pita — lazima upite tena ukiwa unatoka.

**Kanuni za NACL zimepangiwa nambari na hutathminiwa kwa mpangilio.** Kanuni ya kwanza inayolingana hushinda. Kanuni ya 100 hutathminiwa kabla ya kanuni ya 200. Ikiwa kanuni ya 100 inakataa trafiki na kanuni ya 200 inairuhusu, trafiki inakataliwa.

NACL zinaweza **kukataa** kwa wazi — tofauti na vikundi vya usalama, ambavyo vinaweza kuruhusu tu. Hii huzifanya kuwa muhimu kwa kuzuia masafa mahususi ya IP.

**Tabia ya chaguomsingi ya NACL:**

- NACL ya chaguomsingi (iliyoundwa na VPC yako) inaruhusu trafiki yote ya kuingia na kwenda nje
- NACL maalum inakataa trafiki yote kwa chaguomsingi (lazima uruhusu kwa wazi unachotaka)

**NACL kwa subneti ya umma (iliyorahisishwa):**

*Kanuni za kuingia (zinatathminiwa kwa mpangilio — mlinganisho wa kwanza hushinda):*

- Kanuni ya 100: TCP 443, kutoka 0.0.0.0/0 → **Ruhusu** (HTTPS)
- Kanuni ya 110: TCP 80, kutoka 0.0.0.0/0 → **Ruhusu** (HTTP)
- Kanuni ya 120: TCP 1024–65535, kutoka 0.0.0.0/0 → **Ruhusu** (malango ya kurudi ya muda)
- Kanuni ya \*: Trafiki yote → **Kataa**

*Kanuni za kwenda nje:*

- Kanuni ya 100: TCP 443, kwa 0.0.0.0/0 → **Ruhusu** (HTTPS)
- Kanuni ya 110: TCP 80, kwa 0.0.0.0/0 → **Ruhusu** (HTTP)
- Kanuni ya 120: TCP 1024–65535, kwa 0.0.0.0/0 → **Ruhusu** (malango ya kurudi ya muda)
- Kanuni ya \*: Trafiki yote → **Kataa**

Kanuni ya 120 (malango 1024-65535) inaruhusu malango ya muda (ephemeral) — malango ya muda yenye nambari za juu yanayotumika kwa trafiki ya jibu ya TCP. Kwa sababu NACL hazina hali, lazima uruhusu haya ya kwenda nje kwa wazi, au majibu ya seva yako hayatapita.

**Wakati wa Kutumia Kipi**

"Subiri — lakini *kwa nini* tungeifanya hivyo?" Maya aliuliza. "Kwa nini kuwa na zana mbili tofauti — vikundi vya usalama *na* NACL — ikiwa vikundi vya usalama tayari vinafanya kazi? Faida ya ugumu wa ziada ni nini?"

Jibu ni kwamba hufanya kazi katika viwango tofauti na zina uwezo tofauti. Vikundi vya usalama hulinda rasilimali mmoja mmoja na zinaweza kuruhusu tu trafiki. NACL hulinda subneti nzima na zinaweza kukataa kwa wazi. Kuwa na zote mbili inamaanisha unaweza kutumia kanuni za kuruhusu za kina katika kiwango cha rasilimali na kanuni pana za kukataa katika kiwango cha subneti — bila moja kuingilia nyingine.

Tumia **vikundi vya usalama** kwa safu ya msingi ya udhibiti wa ufikiaji. Ni rahisi kusimamia, zina hali (nafasi ndogo ya vizuizi vya bahati mbaya kutokana na kusahau malango ya muda), na zinaunga mkono kurejelea vikundi vingine vya usalama.

Tumia **NACL** kwa vidhibiti vya kiwango cha subneti, hasa:

- **Kanuni za kukataa kwa wazi**: Zuia anwani mahususi ya IP au masafa kufikia subneti nzima
- **Uzuiaji wa dharura**: IP inashambulia kikamilifu — ongeza kanuni ya kukataa ya NACL kuzuia subneti nzima kabla haijafikia rasilimali yoyote

Huenda unajiuliza: ikiwa vikundi vya usalama vina hali na vinazuia kuingia kote kwa chaguomsingi, ungehitaji NACL lini kwa kweli? Vikundi vya usalama hushughulikia kesi nyingi vizuri. Lakini kuna kitu kimoja hawawezi kufanya: kukataa kwa wazi. Kikundi cha usalama kinaweza kuruhusu tu trafiki — ikiwa kanuni hailingani, trafiki inakataliwa kwa chaguomsingi. Huwezi kuongeza kanuni inayosema "zuia IP hii mahususi." Kwa hilo, unahitaji NACL: kanuni ya kukataa yenye nambari inayosimamisha masafa mahususi ya anwani kabla hayajafikia rasilimali yoyote katika subneti. NACL ni muhimu zaidi kwa kujibu dharura (kuzuia mvamizi amilifu) na kutekeleza mipaka ya kiwango cha subneti isiyopaswa kutegemea usanidi wa rasilimali binafsi.

"Kwa hivyo kikundi cha usalama ndio udhibiti wa kina," Maya alisema, "na NACL ni kiharusi pana?"

"Vikundi vya usalama hulinda rasilimali mmoja mmoja," Priya alithibitisha. "NACL hulinda subneti nzima. Unapotaka kuzuia IP kufikia chochote katika mtandao wako, NACL. Unapotaka kuruhusu load balancer pekee kufikia seva ya API, kikundi cha usalama."

"Tumefikiria kinachotokea ikiwa mvamizi atarudi na IP tofauti?" Priya alisema. "NACL inazuia masafa moja. Wanahamia mengine."

"Hicho ndicho GuardDuty ni cha nini," Leo alisema. "Kugundua kwa kitabia. Ikiwa hati ileile itaendesha kutoka IP mpya, mfumo wa trafiki unaonekana sawa."

"Tutafika hapo," Priya alisema. "Mambo ya kwanza kwanza."

"Yote haya yanagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Vikundi vya usalama na NACL vyenyewe ni vya bure. AWS haitozi kwa idadi ya vikundi vya usalama, idadi ya kanuni, au idadi ya maingizo ya NACL. Hoja ya gharama ni ya isiyo ya moja kwa moja: kanuni kali zaidi za kwenda nje za kikundi cha usalama zinaweza kuelekeza trafiki kidogo kupitia NAT Gateway, zikipunguza malipo ya kuchakata data.

"Kwa hivyo vidhibiti vya usalama ni vya bure," Rafael alisema. "Gharama ni miundombinu inayoviunga mkono."

"Sahihi. NAT Gateways kwa upatikanaji wa juu. Interface VPC Endpoints kwa huduma ambazo vinginevyo zingepitia NAT. Hizo zina gharama. Kanuni za kikundi cha usalama zenyewe hazina."

**Kuyaunganisha: Ulinzi wa Tabaka**

Baada ya tukio, Priya alichora tabaka za ulinzi za Nimbus kwenye ubao mweupe:

```
Intaneti
  ↓
CloudFront + Shield (kumeza DDoS)
  ↓
WAF (kuchuja kiwango cha programu)
  ↓
Internet Gateway
  ↓
NACL kwenye subneti ya umma (kanuni za kiwango cha subneti, kuzuia dharura)
  ↓
ALB Security Group (HTTPS kutoka popote)
  ↓
NACL kwenye subneti ya kibinafsi ya programu
  ↓
EC2 API Security Group (lango 8080 kutoka ALB SG pekee)
  ↓
NACL kwenye subneti ya kibinafsi ya data
  ↓
RDS Security Group (lango 5432 kutoka API SG pekee)
```

"Kila tabaka huchukulia kuwa lile la awali linaweza kushindwa," alisema. "Hifadhidata haitumaini kuwa tabaka la mtandao limemzuia mvamizi. Kihalisi cha EC2 hakitumaini kuwa ALB imemzuia mvamizi. Kila tabaka hutekeleza kanuni zake kwa kujitegemea."

"Ulinzi kwa kina," Maya alisema.

"Ulinzi kwa kina. Mvamizi anayepita tabaka moja bado hukabili linalofuata. Hakuna usanidi mmoja usio sahihi ulio wa maafa. Inamaanisha tabaka moja linashindwa, na mengine yanashikilia."

Leo aliangalia mchoro. Mvamizi alikuwa ameathiri kihalisi kimoja cha EC2. Walikuwa wamepita tabaka la vitambulisho. Lakini kila tabaka lililofuata lilikuwa limeshikilia.

Hivyo ndivyo ulinzi kwa kina ulivyoonekana kivitendo.

**Tukio: Kile Tabaka Zilishika**

Kurudi kwenye shambulizi la IP ya Kiromania:

**Nini kilitokea**: Mvamizi alitumia ufunguo wa kusambaza ulioathiriwa kupakia hati ya kuskani kwenye kihalisi kimoja cha EC2. Hati ilijaribu kuunganisha kwa huduma nyingine.

**Nini kiliwazuia**:

- Kikundi cha usalama cha RDS kiliruhusu tu kuingia kwenye lango 5432 kutoka kikundi cha usalama cha API EC2. Hati haikuweza kufikia hifadhidata kutoka zana ya kuskani — haikuwa ikiambatisha kikundi sahihi cha usalama.
- Kikundi cha usalama cha ElastiCache kiliruhusu tu kuingia kwenye lango 6379 kutoka kikundi cha usalama cha API EC2.
- Vihalisi vingine vya EC2 viliruhusu tu SSH kutoka kikundi cha usalama cha bastion host.

**Nini hakikuwazuia**:

- Kanuni za kwenda nje za kihalisi cha EC2 ziliruhusu HTTPS kwa 0.0.0.0/0 (zilihitajika kwa upakuaji wa vifurushi). Hati ilitumia hii kufanya miunganisho ya kwenda nje kwa seva ya mvamizi.

Baada ya tukio, Priya aliongeza:

- Kanuni ya NACL inayozuia masafa ya IP ya Kiromania
- Kanuni yenye vizuizi zaidi ya kwenda nje kwenye vihalisi vya EC2 (iliruhusu tu marudio mahususi yanayojulikana kuwa mema)
- Ukaguzi kwamba **IMDSv2 ilitekelezwa** (`HttpTokens=required`) kwenye kila kihalisi — hati ilikuwa imeendesha *kwenye* kihalisi, ambayo ilimaanisha ingeweza kuuliza huduma ya metadata kwa vitambulisho vya muda vya jukumu la kihalisi. IMDSv2 ilikuwa imewashwa katika Sura ya 4; Priya alithibitisha bado ilihitajika kila mahali, kwa sababu mvamizi mwenye utekelezaji wa msimbo pamoja na IMDSv1 ni sawa na vitambulisho vya AWS vilivyoibwa.

---

**Kusoma Flow Logs: Kile Priya Alichoona**

Uchunguzi ulianza na flow logs za VPC. Priya alifungua CloudWatch Logs Insights na akaendesha hoja dhidi ya kundi la flow log kwa saa 48 zilizopita:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` kilikuwa kihalisi cha EC2 kilichoathiriwa. Kichujio cha REJECT kilionyesha majaribio ya muunganisho yaliyozuiwa.

Matokeo:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Kihalisi kingine cha EC2 — SSH imezuiwa
10.0.10.7 → 10.0.10.9  port 22    REJECT   # EC2 nyingine — SSH imezuiwa
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — imezuiwa na kikundi cha usalama
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # Nakala ya RDS — imezuiwa
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — imezuiwa
```

Skani ilikuwa imegonga kila huduma ya ndani. Kila jaribio lilikataliwa. Muundo wa kikundi cha usalama ulikuwa umeshikilia.

Lakini pia kulikuwa na ingizo la ACCEPT la kwenda nje:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

Hilo lilikuwa jaribio la kutoa data nje — kilobaiti 2.8 zilizotumwa kwa IP ya Kiromania juu ya HTTPS. Kikundi cha usalama kiliruhusu HTTPS ya kwenda nje kwa upakuaji halali wa vifurushi. Mvamizi alikuwa ametumia kanuni hiyo.

"Vikundi vya usalama vilisimamisha harakati za upande," Priya alisema, akiipitisha timu kwenye kumbukumbu. "Lakini kanuni ya kwenda nje ilikuwa ya kuruhusu kupita kiasi. Tuliruhusu HTTPS kwa marudio yoyote. Tunapaswa kuruhusu HTTPS tu kwa endpoints za AWS zinazojulikana — CloudWatch, Secrets Manager, S3 — na kwa CDN za hifadhi za vifurushi."

Alionyesha kanuni zilizosasishwa za kwenda nje za kikundi cha usalama:

```
TCP 443 → pl-63a5400a (orodha ya kiambishi ya AWS S3 gateway endpoint)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (hifadhi za vifurushi za AWS — hupungua kwa muda)
```

"Hilo huondoa kanuni ya jumla ya HTTPS ya kwenda nje. HTTPS ya kwenda nje sasa huenda tu kwa marudio yanayojulikana kuwa mema."

"Vipi kuhusu vitendaji vya Lambda vinavyoita API za watu wa tatu?" Leo aliuliza.

"Hivyo hupitia NAT Gateway, ambayo ina kanuni yake ya kwenda nje iliyojitolea," Priya alisema. "Lambda haitumii kikundi cha usalama cha EC2. Kiolesura tofauti cha mtandao, seti tofauti ya kanuni."

---

**Hadithi ya Utatuzi wa Stateless**

Wiki mbili baada ya tukio, Rafael — bado katika mwezi wake wa kwanza — alikuwa akisaidia kuweka bomba jipya la data. Lilihusisha kitendaji cha Lambda katika VPC kilichohitaji kuita API ya ndani inayoendesha kwenye EC2.

Kitendaji cha Lambda kiliisha muda. Kila wito uliisha muda.

Rafael aliangalia vikundi vya usalama. Kikundi cha usalama cha Lambda kilikuwa na kanuni ya kwenda nje kwa TCP 8080 kwa kikundi cha usalama cha EC2. Kikundi cha usalama cha EC2 kilikuwa na kanuni ya kuingia kwa TCP 8080 kutoka kikundi cha usalama cha Lambda. Kanuni zilionekana sahihi.

Akamgeukia Leo. "Vikundi vya usalama vinaonekana sawa. Kwa nini muda unaisha?"

Leo aliangalia usanidi wa subneti. Kitendaji cha Lambda kilikuwa katika subneti ya kibinafsi. Subneti ilikuwa na NACL maalum ambayo Priya alikuwa ameitumia wakati wa kuimarisha usalama.

Aliangalia kanuni za kwenda nje za NACL:

```
Kanuni ya 100: TCP 443  → 0.0.0.0/0  ALLOW
Kanuni ya 110: TCP 5432 → 10.0.20.0/24 ALLOW
Kanuni ya *:   All      → 0.0.0.0/0  DENY
```

"NACL inaruhusu HTTPS ya kwenda nje na PostgreSQL ya kwenda nje," Leo alisema. "Hairuhusu TCP 8080 ya kwenda nje."

"Kikundi cha usalama kinairuhusu," Rafael alisema.

"NACL hairuhusu. Na NACL haina hali. Hata kama kikundi cha usalama cha kitendaji cha Lambda kinaruhusu muunganisho wa kwenda nje, NACL katika mpaka wa subneti bado hutathmini trafiki ya kwenda nje. NACL inazuia wito wa Lambda kabla haujaondoka kwenye subneti."

"Lakini nikiongeza ALLOW kwa TCP 8080 ya kwenda nje kwenye NACL—"

"Pia unahitaji kuongeza ALLOW kwa malango ya muda ya kuingia," Leo alisema. "Jibu kutoka kihalisi cha EC2 hurudi kwenye lango la nasibu kati ya 1024 na 65535. Ikiwa kanuni za kuingia za NACL hazitaruhusu hayo, jibu linazuiwa katika safari ya kurudi."

Rafael alisasisha NACL:

```
Kanuni ya 100:  TCP 443       → 0.0.0.0/0      ALLOW  (kwenda nje)
Kanuni ya 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (kwenda nje kwa subneti ya EC2)
Kanuni ya 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (kwenda nje kwa subneti ya DB)
Kanuni ya *:    All           → 0.0.0.0/0      DENY
```

Na upande wa kuingia:

```
Kanuni ya 100:  TCP 1024-65535 kutoka 10.0.10.0/24  ALLOW  (trafiki ya kurudi kutoka EC2)
Kanuni ya *:    All                                 DENY
```

Kitendaji cha Lambda kiliunganisha mara moja.

"Ndio sababu watu huchukia NACL," Rafael alisema.

"Ndio sababu unahitaji kuzielewa," Priya alisema. "Hitilafu wanazounda ni haswa hitilafu walizobuniwa kuzizuia — mitiririko ya trafiki isiyotarajiwa. Kuelewa muundo wa stateless kunakuambia haswa pa kuangalia wakati muunganisho unaposhindwa kwa kushangaza."

"Kikundi cha usalama kina hali — trafiki ya kurudi otomatiki. NACL haina hali — trafiki ya kurudi inahitaji kanuni za wazi," Rafael alirudia.

"Sema hadi iwe sehemu ya jinsi unavyofikiri," Priya alisema.

---

**Kuzuia Dharura kwa NACL: Kanuni ya /24**

Baada ya kutambua masafa ya IP chanzo ya mvamizi, jibu la Priya lilikuwa la haraka: ongeza kanuni ya kukataa ya NACL.

Lakini hakuzuia tu IP moja. Alizuia `/24` nzima — subneti ya anwani 256 ambazo mvamizi alikuwa akifanyia kazi.

"Kwa nini /24 nzima?" Leo aliuliza.

"Kwa sababu kuzuia IP moja moja ni mchezo wa kushindwa. Wavamizi hutumia IP nyingi ndani ya masafa, wakizungusha kati yazo wakati moja inapozuiwa. Kuzuia /24 hufanya iwe vigumu zaidi — wangehitaji kuhamia kizuizi tofauti cha anwani, jambo linalowagharimu muda na juhudi."

Kanuni ya NACL:

```
Kanuni ya 90:  ALL kutoka 185.220.101.0/24 → DENY
```

Kanuni ya 90 hutathminiwa kabla ya kanuni yoyote ya kuruhusu (zinazoanza kanuni ya 100). Masafa yote yanazuiwa kabla kanuni yoyote ya kuruhusu kuzingatiwa.

"Na hii inatumika kwa kila rasilimali katika subneti?" Leo aliuliza.

"Kila rasilimali. Hiyo ndiyo nia ya NACL — inatumika kabla trafiki haijafikia kikundi cha usalama cha rasilimali yoyote binafsi. Kukataa kwa NACL katika kanuni ya 90 kunamaanisha pakiti haifiki kamwe tathmini ya kikundi cha usalama."

"Tungeweza kufanya hili kwa kikundi cha usalama badala yake?"

"Hapana. Vikundi vya usalama vinaweza kuruhusu tu trafiki. Hakuna kanuni ya kukataa. Ikiwa unataka kuzuia IP mahususi kufikia rasilimali yoyote katika subneti, NACL ndio chaguo pekee."

Hii ndiyo kesi kuu ya matumizi ya kanuni za kukataa za NACL: kujibu dharura kwa mashambulizi amilifu. Kikundi cha usalama ni mbinu kuu ya udhibiti. NACL ni breki ya dharura.

---

**Mifumo ya Kubuni Kikundi cha Usalama: Rejelea kwa ID**

"Tumefikiria kinachotokea wakati vihalisi vyetu vya EC2 vinapobadilishwa?" Priya aliuliza. "Auto Scaling husitisha vihalisi vya zamani na huzindua vipya. Vihalisi vipya hupata anwani mpya za IP za kibinafsi."

"Ikiwa kanuni za kikundi cha usalama hurejelea anwani za IP," Leo alisema polepole, "tungelazimika kusasisha kanuni kila wakati kihalisi kinapobadilishwa."

"Sahihi. Ndio sababu hurejelei anwani za IP katika kanuni za kikundi cha usalama kwa trafiki ya ndani-ya-VPC."

Vikundi vya usalama vinaweza kurejelea vikundi vingine vya usalama badala ya anwani za IP. Kanuni inaposema "ruhusu kuingia kutoka kikundi cha usalama cha load balancer," inamaanisha "ruhusu trafiki kutoka rasilimali yoyote ambayo kikundi cha usalama cha load balancer kimeambatishwa." Auto Scaling inaweza kuzindua vihalisi elfu moja vipya kila kimoja kikiwa na IP mpya, na kanuni inabaki halali.

Muundo wa kikundi cha usalama wa Nimbus:

```
nimbus-alb-sg (Load Balancer)
  - Kuingia: TCP 443 kutoka 0.0.0.0/0
  - Kuingia: TCP 80 kutoka 0.0.0.0/0

nimbus-api-sg (vihalisi vya EC2 API)
  - Kuingia: TCP 8080 kutoka nimbus-alb-sg
  - Kuingia: TCP 22 kutoka nimbus-bastion-sg
  - Kwenda nje: TCP 5432 kwa nimbus-rds-sg
  - Kwenda nje: TCP 6379 kwa nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Kuingia: TCP 5432 kutoka nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Kuingia: TCP 6379 kutoka nimbus-api-sg

nimbus-bastion-sg (Bastion Host)
  - Kuingia: TCP 22 kutoka <IP ya VPN ya ofisi>
```

Hakuna anwani za IP kwa trafiki ya ndani. ID za vikundi vya usalama pekee. Kihalisi kinapobadilishwa, uanachama wa kikundi cha usalama huhamia kiotomatiki kwa kihalisi kipya.

"Na kwa microservices tunazozipanga?" Rafael aliuliza. "Tutakuwa na huduma dazeni hatimaye. Kila moja inahitaji kuzungumza na baadhi za nyingine, lakini si zote."

"Kila huduma hupata kikundi chake cha usalama," Priya alisema. "Kikundi cha usalama cha Huduma A hurejelewa katika kanuni za kuingia za kila huduma ambayo Huduma A inaruhusiwa kuiita. Huduma zisizopaswa kuwasiliana hazirejelei vikundi vya usalama vya kila mmoja."

Huu ni **mfumo wa hub-and-spoke wa kikundi cha usalama** kwa microservices. Kikundi cha usalama cha hifadhidata iliyoshirikiwa kina kanuni za kuingia kutoka vikundi vitano tofauti vya usalama vya huduma. Ikiwa huduma ya sita inahitaji ufikiaji wa hifadhidata, unaongeza kikundi chake cha usalama kwa kanuni ya kuingia ya hifadhidata. Ikiwa ufikiaji unapaswa kuondolewa, unaondoa rejeleo. Hakuna usimamizi wa IP. Hakuna kanuni zilizochakaa zinazoelekeza kwa seva zilizovunjwa.

"Kikundi cha usalama ndio kitambulisho," Priya alisema. "Anwani ya IP ni ajali ya kuratibu."

---

**Firewall ya Fursa-Ndogo: Nidhamu**

"Tumefikiria mkao sahihi ni upi kwa kanuni za kwenda nje?" Priya aliuliza wakati wa ukaguzi wa baada ya tukio.

Timu nyingi huacha kanuni za kwenda nje za kikundi cha usalama cha EC2 katika chaguomsingi: ruhusu kwenda nje kote. Hii ni rahisi — programu inaweza kuita chochote — lakini si fursa-ndogo.

Kanuni ya Priya: kanuni za kwenda nje zinapaswa kuwa mahususi kama kanuni za kuingia.

Kanuni za kwenda nje za kikundi cha usalama cha Nimbus API, baada ya kuimarisha:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL kwa RDS)
TCP 6379 → nimbus-redis-sg     (Redis kwa ElastiCache)
TCP 443  → orodha ya kiambishi ya s3.amazonaws.com    (S3 gateway endpoint)
TCP 443  → endpoint ya secretsmanager         (Secrets Manager)
TCP 443  → endpoint ya logs                   (CloudWatch Logs)
```

Hakuna "ruhusu kwenda nje kote." Kila marudio yametajwa.

"Hii ni matengenezo mengi," Leo alisema.

"Ni matengenezo zaidi kuliko ruhusu-kote," Priya alikiri. "Ni usafishaji mdogo zaidi kuliko uvunjaji wa data. Mvamizi aliyeathiri kihalisi cha EC2 angeweza kutoa data zaidi nje ikiwa kanuni za kwenda nje zingekuwa wazi. Walitumia kanuni ya HTTPS-kwa-popote kwa sababu ilikuwepo."

"Na kwa kanuni mahususi za kwenda nje, hata kihalisi kilichoathiriwa kinaweza kutuma data tu kwa marudio yaliyoidhinishwa."

"Sahihi kabisa. Kikundi cha usalama kinakuwa mstari wa mwisho wa kudhibiti, si tu mstari wa kwanza wa ulinzi."

---

## Nguvu na Mapungufu

**Vikundi vya Usalama**:

- Vyenye hali (hakuna maumivu ya kichwa ya malango ya muda)
- Vinaweza kurejelea vikundi vingine vya usalama (vinanyumbulika zaidi kuliko IP)
- Kanuni za kuruhusu pekee — hakuna kukataa kwa wazi
- Hufanya kazi katika kiwango cha rasilimali — vya kina
- Kanuni hutumika mara moja — hakuna mpangilio, hakuna kipaumbele
- Vikundi vingi vya usalama vinaweza kuambatishwa kwa rasilimali moja — kanuni kutoka vyote zinajumlishwa

**NACL**:

- Zisizo na hali (zinahitaji kanuni za wazi kwa pande zote mbili ikiwa ni pamoja na malango ya muda)
- Zinaweza kukataa kwa wazi — muhimu kwa kuzuia IP zinazojulikana kuwa mbaya
- Hufanya kazi katika kiwango cha subneti — kiharusi pana
- Kanuni zenye nambari hutathminiwa kwa mpangilio — zinatabirika lakini zinahitaji usimamizi makini
- Zinatumika kabla trafiki haijafikia rasilimali yoyote katika subneti — mstari wa kwanza wa ulinzi
- Zenye ufanisi kwa kuzuia IP kwa dharura katika subneti nzima

**Pale kila zana inapofaa**:

Tumia vikundi vya usalama kwa kila kitu kwa chaguomsingi. Ongeza NACL unapohitaji kanuni za kukataa kwa wazi — kuzuia masafa ya IP, kuzuia lango katika kiwango cha subneti bila kujali usanidi wa rasilimali binafsi, au kutekeleza kwamba subneti ya data haiwezi kamwe kupokea trafiki kutoka chanzo mahususi. NACL si mbadala wa vikundi vya usalama; ni nyongeza kwa hali ambapo muundo wa kuruhusu-tu wa vikundi vya usalama hautoshi.

## Muhtasari

Tukio la IP ya Kiromania lilikuwa limedhibitiwa na vidhibiti vya usalama ambavyo tayari vilikuwepo — si kwa bahati, bali kwa muundo. Vikundi vya usalama vilikuwa vimezuia harakati za upande ndani ya VPC. Baada ya tukio, NACL ziliongeza uwezo wa kuzuia kwa wazi masafa ya IP ya mvamizi katika mpaka wa subneti. Flow logs za VPC zilifanya shambulizi kuonekana. Zana mbili, tabaka mbili, kazi mbili tofauti — pamoja na kuingiza kumbukumbu kuthibitisha kilichotokea.

- **Vikundi vya Usalama** ni ngome za mtandaoni zenye hali kwa rasilimali mmoja mmoja. Kanuni za kuruhusu pekee. Kanuni zote hutathminiwa kwa wakati mmoja.
- **NACL** ni ngome zisizo na hali kwa subneti nzima. Kanuni za kuruhusu na kukataa. Kanuni hutathminiwa kwa mpangilio wa nambari — mlinganisho wa kwanza hushinda.
- **Yenye hali** inamaanisha trafiki ya jibu inaruhusiwa kiotomatiki. **Isiyo na hali** inamaanisha lazima uruhusu trafiki kwa wazi pande zote mbili, ikiwa ni pamoja na malango ya kurudi ya muda.
- Vikundi vya usalama ni safu yako kuu ya udhibiti wa ufikiaji. NACL ni ubatilishaji wa kiwango cha subneti — hasa kwa kuzuia dharura.
- NACL inaporuhusu trafiki ya kuingia, lazima pia uruhusu malango ya muda ya kwenda nje (1024-65535) ili jibu la TCP lipite.
- **Rejelea vikundi vya usalama kwa ID**, si anwani ya IP, kwa trafiki ya ndani-ya-VPC. Auto Scaling hubadilisha vihalisi; uanachama wa kikundi cha usalama huhamia kiotomatiki.
- **Kanuni mahususi za kwenda nje** kwenye vihalisi vya EC2 huweka kikomo kwa kile kihalisi kilichoathiriwa kinaweza kufanya — firewall ya fursa-ndogo.
- Tumia flow logs kuona kile vikundi vya usalama na NACL vinafanya kweli. Kanuni ni nadharia. Kumbukumbu ni ushahidi.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03: Buni Usanifu Salama (Kikoa cha 1, Kazi ya 1.2)*

- **Stateful dhidi ya stateless**: Tofauti hii ndiyo dhana inayojaribiwa zaidi katika sura hii. Vikundi vya usalama = stateful = jibu linaruhusiwa kiotomatiki. NACL = stateless = lazima uruhusu trafiki ya jibu kwa wazi.
- **Kanuni za kikundi cha usalama**: Hakuna kukataa kwa wazi. Wakati vikundi vingi vya usalama vimeambatishwa kwa kihalisi, muungano wa kanuni zote hutumika. Kanuni zote zinazolingana hutathminiwa kwa wakati mmoja.
- **Mpangilio wa kanuni za NACL**: Kanuni hutathminiwa kutoka nambari ya chini hadi ya juu zaidi. Kanuni ya 100 kabla ya 200. Mlinganisho wa kwanza hushinda. Kanuni ya `*` (nyota) chini ni kukataa kwa kudokeza. Kuongeza kanuni ya kukataa katika kanuni ya 90 huzuia kabla ya kanuni yoyote ya kuruhusu katika 100.
- **Malango ya muda**: Kosa la kawaida la NACL ni kusahau kuruhusu kwenda nje kwenye malango 1024-65535. Ikiwa NACL yako inaruhusu HTTP ya kuingia (lango 80) lakini hairuhusu malango ya muda ya kwenda nje, watumiaji wanaweza kutuma maombi lakini kamwe wasipokee majibu. Hii ndiyo hali ya kawaida zaidi ya NACL ya mtihani.
- **Kurejelea kikundi cha usalama**: Unaweza kuruhusu trafiki kutoka kikundi kingine cha usalama (si IP tu). Huu ndio mfumo unaopendekezwa kwa trafiki ya ndani-ya-VPC. Mtihani mara nyingi hutumia "ruhusu kuingia kutoka kikundi cha usalama cha ALB" kama jibu sahihi kwa kuzuia ufikiaji wa EC2.
- **NACL ya chaguomsingi dhidi ya NACL maalum**: NACL ya chaguomsingi inaruhusu trafiki yote. NACL maalum (unayounda) inakataa trafiki yote kwa chaguomsingi. Hali ya mtihani: "iliunda NACL mpya na sasa trafiki imezuiwa" → angalia kanuni za kuruhusu zinazokosekana.
- **Kuzuia IP ya mvamizi**: Vikundi vya usalama haviwezi kuzuia IP mahususi (kuruhusu pekee). NACL zinaweza kukataa kwa wazi IP mahususi au CIDR. Hali ya mtihani: "zuia IP mahususi kufikia rasilimali yoyote katika subneti" → kanuni ya kukataa ya NACL.
- **Kutatua kushindwa kwa muunganisho**: Angalia mpangilio: kikundi cha usalama kwenye chanzo (kwenda nje) → kikundi cha usalama kwenye marudio (kuingia) → NACL kwenye subneti ya chanzo (kwenda nje + malango ya muda) → NACL kwenye subneti ya marudio (kuingia). Kushindwa kwingi kwa muunganisho kwenye mtihani husababishwa na kanuni ya kwenda nje ya NACL inayokosekana au ruhusa ya lango la muda inayokosekana.
- **Subneti nyingi na NACL**: NACL moja inatumika kwa subneti zote zilizohusishwa nayo. Subneti moja inaweza kuhusishwa na NACL moja tu. Mtihani unaweza kuuliza NACL ipi ya kusasisha wakati trafiki ya subneti mahususi inaathiriwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Msanidi anaongeza kanuni ya kuingia kwa kikundi cha usalama inayoruhusu trafiki kwenye lango 443. Je, anahitaji pia kuongeza kanuni ya kwenda nje kuruhusu jibu la seva? Kwa nini au kwa nini la?

Ikiwa badala yake ataongeza kanuni ya kuingia kwa NACL inayoruhusu trafiki kwenye lango 443, je, anahitaji kuongeza kanuni ya kwenda nje? Kwa nini au kwa nini la?

**Kidokezo**: Fikiria nyuma kwenye milinganisho ya sura — je, kila moja ni mlinzi anayekumbuka aliyekuruhusu kuingia, au kigunduzi cha chuma unachopaswa kupita tena ukiwa unatoka?

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ina programu ya wavuti inayoendesha kwenye vihalisi vya EC2 katika subneti ya umma. Programu inakubali trafiki ya HTTPS (lango 443) kutoka intaneti. Watumiaji wanaripoti kuwa wanaweza kuunganisha kwa programu lakini hawawezi kupokea majibu — maombi hutegemea na kuisha muda.

Kikundi cha usalama cha EC2 kina kanuni ya kuingia inayoruhusu TCP 443 kutoka 0.0.0.0/0. NACL ya subneti ina kanuni ya kuingia (kanuni ya 100) inayoruhusu TCP 443 kutoka 0.0.0.0/0 na kanuni ya kwenda nje (kanuni ya 100) inayoruhusu TCP 443 kwa 0.0.0.0/0.

Ni nini sababu inayowezekana ZAIDI ya tatizo hili?

A) Kikundi cha usalama kinakosa kanuni ya kwenda nje kwa TCP 443  
B) Vihalisi vya EC2 havina anwani za Elastic IP  
C) Kikundi cha usalama kinakosa kanuni ya kuingia kwa malango ya muda  
D) NACL inakosa kanuni ya kwenda nje inayoruhusu malango ya muda (1024-65535)

**Kidokezo cha 1**: Vikundi vya usalama vina hali — vinaruhusu majibu kiotomatiki. NACL hazina hali — hazifanyi.

**Kidokezo cha 2**: Kivinjari kinapounganisha kwa seva ya wavuti kwenye lango 443, jibu la seva husafiri kurudi kwenye lango la muda la nasibu (1024-65535), si lango 443.

**Kidokezo cha 3**: NACL ina kanuni ya kwenda nje kwa 443, lakini jibu haliendi kwenye lango 443.

**Jibu**: D

**Maelezo**: NACL haina hali. Watumiaji wanapounganisha kwa seva kwenye lango 443, jibu la TCP la seva husafiri kurudi kwenye lango la muda (lililochaguliwa kwa nasibu kutoka 1024-65535). Kanuni ya kwenda nje ya NACL inaruhusu lango 443 pekee, kwa hivyo jibu linazuiwa na kanuni ya kukataa ya chaguomsingi. Kuongeza kanuni ya kwenda nje ya NACL inayoruhusu TCP 1024-65535 kungerekebisha hili.

**Kwa nini si A?** Vikundi vya usalama vina hali — trafiki ya jibu inaruhusiwa kiotomatiki bila kujali kanuni za kwenda nje. Hakuna kanuni ya kwenda nje ya kikundi cha usalama inayohitajika.

**Kwa nini si B?** Elastic IP huathiri kama vihalisi vina IP za umma, si kama miunganisho iliyoanzishwa inaweza kupokea majibu.

**Kwa nini si C?** Malango ya muda ni kwa trafiki ya jibu ya kwenda nje, si ya kuingia. Muunganisho wa kuingia kutoka watumiaji huja kwenye lango 443, ambalo tayari limeruhusiwa.

*Kikoa cha SAA-C03: Buni Usanifu Salama — Kazi ya 1.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Baada ya shambulizi la IP ya Kiromania, Priya anataka kutekeleza vidhibiti viwili vya ziada:

1. Zuia masafa yote ya IP ya 185.0.0.0/8 kufikia rasilimali yoyote katika subneti ya umma
2. Hakikisha kwamba subneti ya kibinafsi iliyo na hifadhidata haiwezi kamwe kuwasiliana na intaneti, hata kama mtu atasanidi vibaya kikundi cha usalama

Ungetumia zana gani kwa kila hitaji, na ungezisanidije? Je, ungeweza kutumia vikundi vya usalama kwa zote mbili? Je, ungeweza kutumia NACL kwa zote mbili?

*(Hakuna jibu moja sahihi. Lengo ni kuelewa ni zana ipi inafaa tatizo gani.)*

## Onyesho la Baada ya Mikopo

Tukio lilidhibitiwa. Ufunguo wa kusambaza ulioathiriwa ulizimwa. Masafa ya IP ya Kiromania yalizuiwa kwenye NACL. Hati ya zamani ilikuwa imeondolewa kutoka kihalisi cha EC2.

Priya aliandika ripoti ya tukio. Aliishiriki na timu.

Mstari wa mwisho wa ripoti: "Sababu kuu: kitambulisho amilifu kutoka bomba la usambazaji lililovunjwa hakikuzungushwa au kubatilishwa kamwe. Pendekezo: mzunguko wa kiotomatiki wa vitambulisho na ukaguzi wa mara kwa mara wa vitambulisho vyote vya IAM."

Leo aliisoma mara tatu.

"Nilipaswa kuuzungusha ufunguo huo," alisema.

"Ndiyo," Priya alisema.

"Tunahakikishaje hili halitokei tena?"

"Otomatiki," alisema. "Na kitu kinachowatazama walinzi."

Katika sura inayofuata: sanduku la kufuli ambapo Nimbus huhifadhi siri zake — na mzunguko unaofanya funguo zilizoibwa kuwa zisizofaa.
