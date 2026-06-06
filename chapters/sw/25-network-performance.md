# Sura ya 25: Barabara Kuu ya Kibinafsi

Simama kwa dakika. Tikisa mikono yako.

Sikia umbali kati ya vidole vyako na kitu fulani upande mwingine wa nchi. Fikiria kutuma ujumbe unaolazimika kusafiri umbali huo, kupata njia yake kupitia makabidhiano dazeni ya wasafirishaji, na kurudi kabla hujaendelea kufanya kazi. Sasa fikiria kufanya hivyo maelfu ya mara kwa sekunde.

Hicho ndicho uhamishaji wa data kwa kweli — umbali wa kimwili, miundombinu ya kimwili, vikwazo vya kimwili.

Tutazungumza kuhusu kuhamisha data. Si kati ya huduma za AWS, bali kati ya ulimwengu halisi na AWS — kati ya ofisi yako na miundombinu yako ya wingu, kati ya mabara.

---

Pamoja na hifadhidata iliyopanuliwa na gharama za uhifadhi kupunguzwa, Tom alikuwa amegeukia bili ya mtandao. Lakini Leo alikuwa na tatizo la haraka zaidi — kuhamisha terabytes 4 za data ya kihistoria ya agizo kwenda AWS kulikuwa kunaonyesha mipaka ya muunganisho wao wa sasa.

---

Timu ya miundombinu ya Nimbus (sasa wahandisi wanne) ilifanya kazi kutoka ofisi ya pamoja huko Seattle. Walihitaji ufikiaji kwa miundombinu ya AWS waliyoisimamia. Baadhi ya shughuli zilihitaji kuunganika kwa rasilimali katika VPC.

Kwa sasa, walitumia VPN kwenye kompyuta zao za mkononi kufikia mwenyeji wa bastion kwenye subnet ya umma, kisha SSH kwa rasilimali kutoka hapo.

Ilifanya kazi. Ilikuwa polepole. Muunganisho wa VPN ulipita kwenye mtandao wa umma: Seattle → njiapinzani za wasafirishaji nyingi → us-west-2. Safari za kwenda na kurudi hazikuwa thabiti — millisekunde 30 hadi 80 kulingana na saa — na uendeshaji ulizuiwa na kiunganishi cha juu cha ofisi na njia ya umma.

"Kwa SSH ya kila siku, hiyo inakubalika," Leo alisema. "Lakini tunakaribia kuanza kuhamisha hifadhidata yetu ya uchambuzi. Terabytes 4 za data ya kihistoria ya agizo. Kupitia muunganisho huu, uhamiaji utachukua wiki."

"Tunahitaji muunganisho bora," Maya alisema.

"Muunganisho wa kibinafsi," Priya aliongeza. "Si kupitia mtandao wa umma. Na je, ikiwa mtu atajaribu kuvunja wakati wa uhamishaji wa data? Terabytes 4 za historia ya agizo kupitia mtandao wa umma — hata zikiwa zimefichwa — kunahisi kama lengo."

Fikiria kama kusafiri kwenda kazini. VPN ya Site-to-Site ni kama kuendesha kwenye barabara za umma: unafunga milango ya gari (usimbaji fiche), lakini bado unashiriki njia na kila mtu mwingine, na msongamano wa trafiki unakupunguza kwa njia isiyoweza kutabiriwa. Direct Connect ni kama kukodisha njia ya kibinafsi ya kujitolea kwenye barabara kuu — hakuna trafiki inayoshirikiwa, kasi thabiti, na ada ya juu ya kila mwezi. Siku nyingi barabara ya umma ni sawa. Unapobeba lori lililojaa mizigo yenye thamani kwa ratiba kali, unalipa kwa njia ya kibinafsi.

Snow Family ni chaguo ambalo watu wengi hawalifikirii: kukodisha ndege halisi ya mizigo. Halipatikani daima. Si sahihi kwa mizigo midogo. Lakini kwa lori kamili, inafika haraka kuliko kuendesha na haitegemei hali za barabara kuu hata kidogo. Fizikia haijabadilika — bado unahamisha biti zile zile — lakini utaratibu ni tofauti kabisa.

**AWS Site-to-Site VPN: Chaguo la Haraka**

**AWS Site-to-Site VPN** inaunda handaki lililofichwa kati ya mtandao wako wa eneo lako na VPC yako, ukipita kwenye mtandao wa umma.

Usanidi:

1. Unda Virtual Private Gateway (VGW) iliyoambatishwa kwa VPC yako
2. Unda Customer Gateway inayowakilisha kipanga njia chako cha eneo lako
3. Anzisha handaki mbili za VPN (kwa urejeshaji) kati yao

Trafiki imefichwa (AES-256). Inasafiri kwenye mtandao wa umma, ambayo inamaanisha latency inategemea hali za mtandao. AWS inatoa handaki mbili kiotomatiki kwa urejeshaji — ikiwa handaki moja ina matatizo, trafiki inahamia nyingine.

**Wakati wa kutumia Site-to-Site VPN**:

- Usanidi wa haraka (dakika hadi masaa)
- Ya gharama nzuri ($0.05/saa kwa kila muunganisho wa VPN)
- Kipimo data: hadi 1.25 Gbps kwa kila handaki
- Latency ya mtandao inayokubalika kwa matumizi husika

**Accelerated Site-to-Site VPN** inapitisha trafiki ya VPN kwenye mtandao wa kimataifa wa AWS badala ya mtandao wa umma — uboreshaji ule ule ambao Global Accelerator inatoa, ukitumika kwa handaki za VPN. Latency ni ya chini na thabiti zaidi kuliko VPN ya kawaida. Gharama ni ya juu kidogo (ada za uhamishaji wa data za Global Accelerator zinatumika). Kwa timu zinazotaka usanidi wa haraka wa VPN na gharama ya chini lakini zinahitaji latency bora, Accelerated VPN ni njia ya kati ya vitendo kati ya VPN ya kawaida na Direct Connect.

Kwa uhamiaji wa terabytes 4 wa Nimbus, VPN inayotegemea mtandao kwa 1.25 Gbps ya juu zaidi ingechukua: 4TB / 1.25 Gbps ≈ masaa 7 ya chini, na gharama ya juu ya ulimwengu halisi karibu na masaa 12-20. Inakubalika, lakini msongamano kwenye njia ya mtandao wa umma unaifanya isiyoweza kutabiriwa.

Leo aliendesha hesabu kwa makini zaidi, kwa sababu hesabu ya kinadharia na muda halisi wa uhamishaji havikuwahi kulingana hata mara moja katika uzoefu wake.

**Kinadharia**: 4 TB = 4,096 GB = 32,768 Gb. Kwa 1 Gbps: sekunde 32,768 ≈ masaa 9.1. Zungusha hadi masaa 9.

**Halisi**: Leo alikuwa ameendesha uhamishaji wa jaribio wiki iliyopita — 50 GB kutoka ofisi ya Seattle hadi S3. Muda wa kinadharia kwa kasi yao ya juu iliyopimwa (875 Mbps): sekunde 457. Muda halisi: sekunde 724. Kipengele cha gharama ya juu: 1.58.

Ikitumika kwa uhamishaji wa terabytes 4 kwa 875 Mbps ya juu: 32,768 Gb / 0.875 Gbps × 1.58 gharama ya juu ≈ **sekunde 59,200 ≈ masaa 16.4**.

Gharama ya juu ilitoka vyanzo kadhaa: TCP slow-start wakati wa kuanzisha muunganisho, upotezaji wa pakiti unaohitaji utumaji tena (njia ya umma kutoka Seattle hadi us-west-2 ilikuwa na wastani wa upotezaji wa pakiti wa 0.2% — mdogo, lakini wa kuzidisha juu ya mamilioni ya pakiti), gharama ya juu ya kupeana mikono ya HTTPS kwa kila sehemu ya upakiaji wa sehemu nyingi, na muda wa kuchakata wa S3 kukusanya upakiaji wa sehemu nyingi.

"Masaa kumi na sita ni sawa kwa uhamiaji wa mara moja," Leo alisema. "Tatizo halisi ni ikiwa uhamishaji utakatizwa saa ya 14."

Upakiaji wa sehemu nyingi wa S3 unatatua tatizo la kukatizwa: ikiwa uhamishaji utashindwa saa ya 14, sehemu ya sasa tu inahitaji kupakiwa upya. Sehemu za awali zimehifadhiwa katika S3 na uhamishaji unaweza kuendelea. Lakini gharama ya juu ya kusimamia upakiaji wa sehemu nyingi iliongeza takriban 3% kwa muda jumla wa uhamishaji.

Makadirio ya mwisho ya ulimwengu halisi: **karibu masaa 9 ya kinadharia juu ya mtandao wa 1 Gbps, karibu masaa 17 halisi** — kwa kuzingatia kasi ya juu iliyopimwa ya ofisi yao ya 875 Mbps, gharama ya juu ya upotezaji wa pakiti, na kuchakata kwa upakiaji wa sehemu nyingi.

Leo aliufikiria hili kwa muda. Kisha akatazama ukurasa wa bei wa Snow Family.

"Chaguo lingine ni nini?" Tom aliuliza.

"Subiri — lakini *kwa nini* tungehitaji kitu chochote zaidi ya VPN?" Maya aliuliza. "Uhamiaji wa terabytes 4 ni tukio la mara moja."

"Si hivyo," Priya alisema. "Mara data inakuwa katika AWS, timu bado inahitaji kuifikia kila siku. Na latency ya VPN inajumuika."

**AWS Direct Connect: Mstari wa Kujitolea**

**AWS Direct Connect** inaanzisha muunganisho wa mtandao wa kibinafsi, wa kujitolea kati ya eneo lako (au kituo chako cha colocation) na AWS. Trafiki kamwe haigusi mtandao wa umma.

Direct Connect ni muunganisho wa kimwili — mstari wa fiba kutoka mtandao wako hadi eneo la AWS Direct Connect. Unafanya kazi na mtoa huduma wa mawasiliano kuanzisha mzunguko wa kimwili. AWS inatoa bandari upande wao.

**Faida**:

- Latency thabiti, inayoweza kutabiriwa (hakuna mabadiliko ya mtandao wa umma)
- Kasi kutoka 50 Mbps hadi 100 Gbps (na bandari za asili za 400 Gbps za kujitolea katika maeneo teule tangu 2024)
- Gharama za chini za uhamishaji wa data kuliko mtandao (viwango vya uhamishaji wa data vya Direct Connect ni vya bei nafuu kuliko viwango vya kawaida vya kutoa data nje vya AWS)
- Salama zaidi (mzunguko wa kibinafsi, si mtandao wa umma)

**Biashara za mbadala**:

- Usanidi unachukua wiki hadi miezi (uandaaji wa miundombinu ya kimwili)
- Gharama ya juu sana kuliko VPN
- Hakuna urejeshaji uliojengwa ndani (unaanzisha mizunguko ya urejeshaji mwenyewe)
- Haifai kwa ofisi zilizosambazwa kijiografia bila mizunguko mingi

Unaweza kuwa unajiuliza: ikiwa Direct Connect ni kebo ya fiba ya kimwili, kinachotokea ikiwa mtu atakata kwa bahati mbaya? Hilo ni tatizo la hatua-moja-ya-kushindwa la mzunguko mmoja — ndiyo sababu usanidi wa Direct Connect wa uzalishaji hutumia mizunguko ya urejeshaji katika njia tofauti kijiografia, au huweka VPN kama hifadhi. Kebo inaweza kukatwa; biashara inaendelea.

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza. Alikuwa tayari ameitafuta. "Bandari ya kujitolea ya 1Gbps ni $216/mwezi," alisema. "Pamoja na mzunguko kutoka ofisi yetu, ambao mawasiliano walinukuu kwa $800/mwezi."

"Kwa hivyo karibu elfu moja kwa mwezi jumla."

Kwa Nimbus: Direct Connect ilikuwa ya kupita kiasi kwa ukubwa wao wa sasa. Lakini kwa makampuni yenye viwango vikubwa vya uhamishaji wa data au mahitaji ya uzingatifu kwa muunganisho wa mtandao wa kibinafsi, Direct Connect inajilipia.

**Hosted Connections: Eneo la Kati**

Si kila shirika linaweza kujitolea kwa mzunguko wa fiba wa kujitolea wa 100 Gbps. **Direct Connect Hosted Connections** zinaruhusu AWS Direct Connect Partners (mawasiliano yaliyoidhinishwa) kutoa miunganisho ya chini-ya-1Gbps unayoshiriki na wateja wengine.

Usanidi ni wa haraka zaidi (siku hadi wiki, si miezi) na hugharimu chini kuliko muunganisho wa kujitolea. Biashara ya mbadala: uwezo unaoshirikiwa unamaanisha uendeshaji usio thabiti zaidi.

Kwa Nimbus (wanavyokua): muunganisho wa hosted wa 500 Mbps kupitia mshirika ungetoa muunganisho wa kibinafsi kwa bei nzuri.

Tofauti ya vitendo inayojalisha wakati wa mtihani: Hosted Connections zinapatikana kwa kasi kutoka 50 Mbps hadi 10 Gbps (baadhi ya washirika wanatoa hadi 25 Gbps), zinazotolewa na AWS Partner. Dedicated Connections zinaenda moja kwa moja kwa AWS na zinapatikana kwa 1 Gbps, 10 Gbps, na 100 Gbps (pamoja na 400 Gbps katika maeneo teule). Kwa kasi chini ya 1 Gbps, Hosted Connection ndiyo chaguo pekee la Direct Connect — Dedicated Connections zinaanza kwa kiwango cha chini cha 1 Gbps.

**AWS Transit Gateway: Hub-na-Spoke kwa VPCs**

Nimbus inavyokua, wangekusanya VPCs nyingi: VPC ya uzalishaji, VPC ya hatua ya kujaribu, VPC ya uchambuzi, VPC ya zana za usalama.

Bila upangaji makini, kuunganisha VPCs hizi kunahitaji wavu kamili wa miunganisho ya VPC peering. Kwa VPCs 4: miunganisho 6 ya peering. Kwa VPCs 10: miunganisho 45 ya peering. Kwa VPCs 20: miunganisho 190. Hii haipanui.

**AWS Transit Gateway** ni hub ya mtandao inayounganisha VPCs nyingi na mitandao ya eneo lako. Badala ya wavu wa miunganisho ya peering, kila VPC inaunganisha kwa Transit Gateway. Transit Gateway inapitisha trafiki kati yao.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Upitishaji wa kupitisha (Transitive routing)**: Ikiwa VPC A na VPC B zote zinaunganisha kwa Transit Gateway, zinaweza kuwasiliana — bila peer ya moja kwa moja. Transit Gateway inashughulikia upitishaji. Tofauti na VPC peering (ambayo si ya kupitisha), Transit Gateway inawezesha topolojia ya hub-na-spoke.

**Gharama za Transit Gateway**: zinalipishwa kwa kila kiambatisho (VPC au muunganisho wa VPN/Direct Connect) pamoja na kwa kila GB ya data iliyochakatwa. Kwa kiwango, hii inastahili urahisi.

Kwa Nimbus, tukio lililoanzisha Transit Gateway lilikuwa kuongezwa kwa VPC ya nne. Walikuwa na: uzalishaji, hatua ya kujaribu, uchambuzi, na sasa zana za usalama (VPC kwa uchunguzi wa udhaifu na ufuatiliaji wa uzingatifu wa SOC2 ambao haupaswi kuwa kwenye sehemu ile ile ya mtandao kama uzalishaji).

Bila Transit Gateway, kuunganisha VPCs nne kunahitaji miunganisho sita ya peering:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

Miunganisho sita ya peering, viingilio sita vya jedwali la upitishaji kwa kila VPC, sheria sita za kikundi cha usalama za kukagua. Na VPC peering si ya kupitisha: ikiwa Production na Analytics zimepeerwa, na Analytics na Security zimepeerwa, Production haiwezi kufika Security kupitia VPC ya Analytics. Unahitaji peering ya Production ↔ Security waziwazi.

Kwa Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Viambatisho vinne. Jedwali moja la upitishaji la kusimamia. Upitishaji wa kupitisha: Production inaweza kufika Security kupitia Transit Gateway bila peer ya moja kwa moja.

"Na je, ikiwa mtu atajaribu kuvunja kupitia Transit Gateway?" Priya aliuliza. "Ikiwa VPCs zote nne zinashiriki Transit Gateway, rasilimali iliyodukuliwa katika VPC ya Staging ingeweza kufika Production."

Transit Gateway inasaidia **majedwali ya upitishaji yenye utengo**: unaweza kufafanua ni VPCs zipi zinaruhusiwa kuwasiliana kupitia Transit Gateway na zipi zimetengwa. VPC ya zana za usalama inaweza kufika zingine zote (inahitaji kuzichunguza). Staging haiwezi kufika Production. Production haiwezi kufika Analytics moja kwa moja (Analytics inauliza data kupitia sehemu mahususi ya mwisho ya kusoma-tu).

"Transit Gateway moja," Priya alisema, "na sera za upitishaji zinazoeleza modeli halisi ya ufikiaji. Dhidi ya miunganisho sita ya peering bila njia kuu ya kukagua nini kinafika nini."

**VPC Endpoints: Ufikiaji wa Kibinafsi kwa Huduma za AWS**

Suala ndogo la gharama na usalama: wakati kipengele chako cha EC2 (katika subnet ya faragha) kinapoita API ya S3, trafiki hiyo inapitia NAT Gateway (kufikia mtandao, ambapo sehemu ya mwisho ya umma ya S3 iko). Unalipa kwa kuchakata kwa NAT Gateway.

**VPC Endpoints** zinaruhusu rasilimali katika VPC yako kuwasiliana na huduma za AWS kwa faragha, bila kupitia mtandao wa umma — na bila NAT Gateway.

Aina mbili:

**Gateway endpoints** (bure): Kwa S3 na DynamoDB. Unaongeza njia katika jedwali lako la upitishaji inayoelekeza trafiki ya S3 au DynamoDB kwa endpoint badala ya NAT Gateway. Bure kuunda; bure kutumia.

**Interface endpoints** (zinazolipishwa): Kwa huduma zingine za AWS (SQS, SNS, Secrets Manager, SSM, n.k.). Inaunda ENI (Elastic Network Interface) katika subnet yako yenye IP ya faragha. Trafiki kwa huduma inatumia IP hii ya faragha. Inagharimu ~$0.01/saa kwa kila AZ pamoja na kuchakata data.

Leo alikuwa tayari ameunda Gateway endpoints wiki iliyopita bila kusasisha majedwali ya upitishaji. "Tayari niliziweka — oh," alisema, akikagua usanidi. "Njia hazikusasishwa. Niache nirekebishe hilo."

Tom mara moja aliunda Gateway endpoints kwa S3 na DynamoDB baada ya kujifunza zilikuwa za bure. Ada ya kuchakata data ya NAT Gateway ilianguka kwa 65%.

Hesabu ya kwa nini: vitendo vya Lambda na kazi za ECS za Nimbus katika subnet za faragha vilikuwa vikifanya maombi ya kuendelea kwa S3 (kusoma mafaili ya usanidi, kuandika mauzo ya kumbukumbu) na kwa DynamoDB (kusoma data ya mgahawa, kuandika rekodi za agizo). Kila ombi lilipitia NAT Gateway, ambayo ilitoza $0.045 kwa GB ya data iliyochakatwa.

Kuchakata data ya NAT Gateway ya kila mwezi ya Nimbus: GB 533. Gharama: $24/mwezi. Baada ya kuongeza S3 na DynamoDB Gateway Endpoints na kusasisha majedwali ya upitishaji: trafiki ya S3 na DynamoDB ilipita NAT Gateway kabisa. Kuchakata kwa NAT Gateway ya kila mwezi kulianguka hadi GB 187 — trafiki iliyobaki ilikuwa wito wa API kwa huduma zingine (Secrets Manager, SES, webhooks za nje). Gharama: $8.40/mwezi.

Akiba: $15.60/mwezi, $187/mwaka, kwa usanidi mbili za bure za Gateway Endpoint zilizochukua dakika 10 kuziseti.

"Bure," Tom alisema, kwa mara ya tatu.

"Gateway endpoints ni za bure kuunda na za bure kutumia," Leo alithibitisha. "Si tu uboreshaji wa usalama — kupitisha trafiki ya S3 na DynamoDB kupitia endpoint ya faragha badala ya NAT Gateway kunaiondoa kutoka mtandao wa umma kabisa."

"Na je, ikiwa mtu atajaribu kuvunja kupitia trafiki ya NAT Gateway?" Priya aliuliza. "Ikiwa trafiki kwa S3 inapitia NAT, inafikika kutoka mtandaoni. Kupitia Gateway Endpoint, ni ya faragha."

Hii ni faida ya pili ya Gateway Endpoints ambayo mjadala wa gharama wakati mwingine unaifunika. Trafiki kwa S3 na DynamoDB kupitia VPC Gateway Endpoint kamwe haitoki mtandao wa AWS, kamwe haipiti anwani ya IP ya umma, na inatawaliwa na sera ya endpoint (sera inayotegemea rasilimali ambayo inaweza kuzuia ni ndoo zipi za S3 au majedwali yapi ya DynamoDB endpoint inaweza kufikia). Gateway Endpoint kwenye ndoo inayohifadhi data ya mteja inaongeza tabaka la ziada: hata na sera ya ndoo iliyosanidiwa vibaya, sera ya endpoint inaweza kuzuia ufikiaji kwa trafiki inayotoka ndani ya VPC mahususi.

**AWS Global Accelerator: Kupitisha kwenye Pembeni**

Nimbus ilipohudumia watumiaji wa Pwani ya Mashariki kutoka us-west-2 (Oregon), latency ilikuwa 80ms. Si kwa sababu seva ilikuwa mbali kupita kiasi, bali kwa sababu upitishaji wa mtandao wa umma kati ya Boston na Oregon ulikuwa usio bora, ukidunda kupitia mitandao mingi ya wasafirishaji.

**AWS Global Accelerator** inatumia mgongo wa kimataifa wa kibinafsi wa AWS — mtandao uliosambazwa wa maeneo ya pembeni unaopitisha trafiki kwa programu yako kupitia njia zinazodhibitiwa na AWS badala ya njiapinzani za wasafirishaji wa mtandao wa umma. Badala ya upitishaji wa mtandao wa umma, trafiki inaingia mtandao wa AWS katika eneo la pembeni la karibu zaidi na inasafiri njia ya faragha iliyoboreshwa kwa programu yako.

Kwa Nimbus, mtumiaji huko Boston angeweza:

- **Bila Global Accelerator**: Kupitia wasafirishaji wa mtandao wa umma → ~80ms
- **Na Global Accelerator**: Kufika pembeni ya karibu zaidi ya AWS huko Boston → kusafiri mgongo wa AWS → kufika us-west-2 → ~60ms

Global Accelerator haiweki maudhui kwenye kashe (hiyo ni CloudFront). Inaboresha njia ya mtandao kwa maombi ya kibadiliko.

Leo aliendesha ulinganisho wa latency katika miji kadhaa baada ya kuwezesha Global Accelerator kwa API ya Nimbus:

| Mji | Kabla | Baada | Uboreshaji |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

Uboreshaji ulikuwa wa kushangaza zaidi kwa watumiaji wa mbali kijiografia — Tokyo kutoka 180ms hadi 95ms, Sydney kutoka 210ms hadi 118ms. Kwa Seattle (karibu na vituo vya data vya us-west-2 huko Oregon), uboreshaji ulikuwa mdogo — kulikuwa na njiapinzani chache za mtandao wa umma za kuboresha.

"Subiri — lakini *kwa nini* Tokyo inapata uboreshaji wa 47%?" Maya aliuliza. "Ikiwa kituo cha data bado kiko us-west-2, je, kasi ya mwanga si ndiyo kizuizi halisi?"

"Kasi ya mwanga ni sakafu," Leo alisema. "Kizuizi halisi ni upitishaji wa mtandao wa umma. Trafiki kutoka Tokyo hadi us-west-2 inavuka makumi ya mifumo ya kujitegemea — wasafirishaji tofauti, vipanga njia tofauti, makubaliano tofauti ya peering. Kila njiapinzani inaongeza latency. Global Accelerator inapitisha trafiki kutoka eneo la pembeni la Tokyo hadi us-west-2 kupitia fiba ya kibinafsi ya AWS, ambayo ina njia fupi na upitishaji ulioboreshwa zaidi."

Kiwango cha chini cha kinadharia kutoka Tokyo hadi us-west-2 (kulingana na kasi ya mwanga juu ya fiba, takriban km 15,500 kwenda na kurudi): ~77ms. 95ms na Global Accelerator inakaribia kiwango hicho cha chini cha kinadharia. 180ms bila yake inaonyesha kutokuwa na ufanisi kwa upitishaji wa mtandao wa umma, si sheria za fizikia.

Global Accelerator inatoa anwani mbili tuli za **anycast IP** zinazopitisha kwa eneo la pembeni la karibu zaidi. Tofauti na CloudFront (inayotumia anwani za IP za kibadiliko zinazobadilika), IP hizi ni thabiti — muhimu kwa kuorodhesha kwa firewall na kwa programu zinazohitaji IP iliyowekwa kwa wateja kuunganishia.

**Wakati wa kutumia Global Accelerator dhidi ya CloudFront**:

- CloudFront: maudhui tuli na yanayoweza kuwekwa kwenye kashe, matumizi ya CDN
- Global Accelerator: maudhui ya kibadiliko, itifaki zisizo za HTTP (UDP, michezo, IoT), au unapohitaji anwani ya Anycast IP tuli

## Kuhamisha Data, Si Trafiki Tu: DataSync na Transfer Family

Wakati usanifu wa mtandao ukichukua sura, Maya alikuwa na miradi mitatu mipya ya uandikishaji wa mlolongo wa migahawa ikifika wakati mmoja. Kila moja ilikuwa na sharti la uhamiaji wa data — na kila sharti lilikuwa tofauti.

Mlolongo wa kwanza, Pacific Table, ulihitaji kuhamisha TB 40 za sehemu za faili za NFS kwenda S3. Uhifadhi wao wa sasa wa faili ulikuwa wa eneo lao, ukisambazwa katika seva nne za faili katika makao yao makuu ya Seattle. Leo alianza kuandika mpango wa uhamiaji.

Mlolongo wa pili, Marisol Group, ulikuwa na timu ya uhasibu iliyopakia ankara kila siku kwa seva ya SFTP ya eneo lao. Mtiririko wa SFTP ulikuwa ukiendesha tangu 2015. Wafanyakazi wa uhasibu walijua kitu kimoja: walifungua mteja wao wa SFTP kila asubuhi saa 3 asubuhi, walidondosha ankara zao, na walifunga. Hakuna aliyetaka kubadilisha hili. "Wahasibu wao wanatumia WinSCP," Maya alisema. "Hilo halijadiliwi."

"Hizo ni zana mbili tofauti," Priya alisema.

"Ndiyo," Leo alisema. "Lakini zote zinapatikana."

**AWS DataSync: rsync Iliyoboreshwa, Yenye Dashibodi ya AWS**

Kwa uhamiaji wa TB 40 wa Pacific Table, changamoto haikuwa kipimo data — ofisi ya Seattle ilikuwa na muunganisho thabiti wa juu. Changamoto ilikuwa uandaaji: kugundua ni faili gani zilizokuwepo, kuzihamisha kwa uaminifu, kuthibitisha checksums, kuratibu uhamishaji kuepuka kujaza mtandao wa ofisi wakati wa saa za biashara, na kufuatilia maendeleo katika kile kingekuwa siku kadhaa za utendaji wa kuendelea.

**AWS DataSync** ni huduma ya uhamiaji na upokezaji wa data inayotegemea wakala. Unasanikisha wakala mwepesi wa DataSync katika mazingira yako ya eneo lako — mashine ya kawaida inayoendesha kwenye VMware au kama kipengele cha EC2. Wakala unaunganisha na seva zako za faili kupitia NFS au SMB, unagundua sehemu zako, na unazilandanisha na lengwa katika AWS: ndoo ya S3, mfumo wa faili wa EFS, au mfumo wa faili wa FSx.

Fikiria kama rsync iliyoboreshwa, yenye dashibodi ya AWS. DataSync inashughulikia:

- **Ugunduzi**: wakala unaorodhesha sehemu zako za chanzo kiotomatiki
- **Uratibu**: uhamishaji unaweza kuendesha kwa ratiba iliyofafanuliwa (nje ya saa za biashara) au kwa kuendelea
- **Uthibitishaji**: DataSync inakokotoa checksums pande zote mbili na inakuonya juu ya kutofautiana kokote
- **Ufuatiliaji**: maendeleo ya uhamishaji, idadi ya faili, ripoti za makosa, na matumizi ya kipimo data zote zinaonekana katika dashibodi
- **Usimbaji fiche wakati wa usafirishaji**: data yote imefichwa ikitumia TLS wakati wa uhamishaji

Kwa Pacific Table, Leo alisanikisha wakala wa DataSync kwenye VM katika mtandao wao wa Seattle, akauelekeza kwa sehemu nne za NFS, na akasanidi ratiba ya uhamishaji: saa 2 usiku hadi saa 12 alfajiri siku za wiki, kwa kuendelea wikendi. Baada ya siku sita, TB 40 zote zilikuwa zimefika S3. Alithibitisha uhamishaji na ripoti ya checksum iliyojengwa ndani ya DataSync. Kutofautiana sifuri.

"Na kwa upokezaji unaoendelea?" Maya aliuliza. "Pacific Table bado itakuwa ikiongeza faili baada ya uhamiaji."

"DataSync inasaidia uhamishaji wa nyongeza," Leo alisema. "Baada ya ulinganishaji wa awali, inanakili tu kilichobadilika. Tunaweza kuiendesha kila usiku kama kazi ya upokezaji."

**AWS Transfer Family: Mtiririko Wako wa SFTP, Unaoungwa Mkono na S3**

Kwa timu ya uhasibu ya Marisol Group, sharti lilikuwa tofauti. Hakuna aliyekuwa akihama kutoka SFTP. Wahasibu wangeendelea kutumia WinSCP. Swali lilikuwa: upakiaji huo wa SFTP unafika wapi?

Kwa sasa, ulifika kwenye seva ya Linux ya eneo lao katika ofisi ya nyuma ya Marisol. Faili kisha zilihamishwa kwa mkono kwa mfumo wao wa uhasibu. Seva ya eneo lao ilihitaji matengenezo, nakala za hifadhi, na mtu mwenye ufikiaji wa SSH wa kuisimamia.

**AWS Transfer Family** ni seva inayosimamiwa kikamilifu ya SFTP, FTPS, na FTP — inayoungwa mkono na S3 au EFS kama lengwa la uhifadhi. Unatoa endpoint ya Transfer Family (inapata jina la mwenyeji na, kwa hiari, anwani ya IP tuli). Wateja wako wanaunganisha nayo wakitumia programu yao iliyopo ya SFTP. Wanapopakia faili, faili hizo zinafika moja kwa moja katika ndoo ya S3.

Timu ya uhasibu haibadilishi chochote. Bado wanafungua WinSCP kila asubuhi saa 3 asubuhi. Bado wanaunganisha na seva ya SFTP na stakabadhi zao zilizopo. Bado wanadondosha ankara zao katika folda ile ile. Tofauti haionekani kwao: upande wa seva, faili sasa zinaenda moja kwa moja katika S3 badala ya kwenye seva ya Linux ya eneo lao.

"Na kutoka S3, tunaweza kuanzisha mabaki ya mtiririko kiotomatiki," Priya alisema. "Tukio la S3 linaanzisha kitendo cha Lambda kinachochakata ankara na kuiingiza katika mfumo wa uhasibu. Hakuna hatua ya mkono."

"Kwa hivyo mtiririko wa wahasibu haubadiliki," Maya alisema, "lakini upande wetu, kitu kizima kimeotomatishwa."

"Ndiyo. Na seva ya SFTP yenyewe imesimamiwa kikamilifu — hakuna kupiga viraka, hakuna nakala za hifadhi, hakuna seva ya kudumisha."

Tom alikuwa tayari ameitafuta bei. Transfer Family inalipisha kwa kila saa ya upatikanaji wa endpoint pamoja na kwa kila GB iliyohamishwa. Kwa kiasi cha ankara cha Marisol Group, gharama ya kila mwezi ilikuwa chini sana ya $30. Gharama ya kudumisha seva ya eneo lao iliyokuwa ikibadilishwa — kushuka kwa thamani ya vifaa, muda wa uhandisi kwa matengenezo, usimamizi wa nakala za hifadhi — ilikuwa kubwa zaidi.

---

> **Kidokezo cha Mtihani — DataSync na Transfer Family**
>
> *SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.1)*
>
> - **DataSync** = kuhamisha data kwa wingi kutoka eneo lako kwenda AWS (sehemu za faili za NFS au SMB → S3, EFS, au FSx). Ishara za mtihani: "hamisha sehemu za faili," "pokeza data ya NFS kwenda S3," "uhamishaji wa data toka eneo lako kwenda AWS," "upokezaji unaoendelea wa data ya faili." DataSync inatumia wakala uliosanikishwa eneo lako; wakala unashughulikia ugunduzi, uratibu, na uthibitishaji.
> - **Transfer Family** = uhamishaji wa faili unaoendelea ukitumia itifaki za SFTP, FTPS, au FTP, bila kubadilisha zana za mteja. Ishara za mtihani: "mtiririko uliopo wa SFTP," "washirika wanapakia faili kupitia SFTP," "seva ya SFTP inayoungwa mkono na S3," "inua-na-hamisha SFTP," "haiwezi kubadilisha mchakato wa uhamishaji wa faili." Transfer Family ndilo jibu wakati sharti ni uoanifu wa SFTP, si kiasi cha data.
> - **Tofauti inajalisha**: DataSync ni kwa uhamiaji wa wingi na upokezaji (inayotegemea wakala, inayoendeshwa na ratiba, iliyoboreshwa kwa mtandao). Transfer Family ni kwa huduma za uhamishaji wa faili zinazooana na itifaki (inayotegemea endpoint, daima-wazi, isiyoonekana kwa mteja). Zinatatua matatizo tofauti.
> - DataSync inasaidia S3, EFS, na FSx kama lengwa. Transfer Family inasaidia S3 na EFS kama mifumo ya uhifadhi ya nyuma.

---

**Kuhamisha Seva, Si Faili Tu: 7 Rs na MGN**

Mlolongo wa tatu katika bomba la Maya haukuwa na faili tu — ulikuwa na seva nzima: programu ya kuhifadhi nafasi ya desturi inayoendesha kwenye mashine mbili za eneo lao ambazo hakuna aliyetaka kuziandika upya kabla ya kuhama. Kuhamisha *programu* ni nidhamu yake mwenyewe, na AWS inaeleza **njia saba za kuhamia** ("7 Rs") ambazo mara nyingi unahitaji tu kuzitambua:

- **Rehost** ("inua na hamisha"): hamisha seva zilivyo. Haraka zaidi, mabadiliko machache zaidi.
- **Replatform** ("inua, sahihisha, na hamisha"): maboresho madogo njiani — kama kuhamisha hifadhidata inayojisimamia kwa RDS.
- **Repurchase**: acha mfumo wa zamani, nunua SaaS badala yake.
- **Refactor**: buni upya kuwa cloud-native. Juhudi nyingi zaidi, malipo mengi zaidi.
- **Retire**: inaonekana hakuna aliyeutumia. Ufute.
- **Retain**: uache mahali ulipo, kwa sasa.
- **Relocate**: hamisha katika kiwango cha hypervisor bila kubadilisha chochote.

Kwa kesi ya rehost, zana ni **AWS Application Migration Service (MGN)**: wakala unapokeza diski za seva za chanzo, block kwa block, kwenda eneo la maandalizi la gharama ndogo katika AWS; unazindua nakala za jaribio wakati wowote unapotaka; wakati wa kuhamia, MGN inabadilisha seva zilizopokezwa kuwa vipengele asili vya EC2. Inua, hamisha, imekamilika — refactoring inaweza kuja baadaye, kwa wakati wa wingu. (Wenzake kwa upangaji wa kasori, Application Discovery Service na Migration Hub, walifungwa kwa wateja wapya mwishoni mwa 2025 — jua majina yao kama "ugunduzi wa kasori" na "ufuatiliaji kuu wa uhamiaji" ikiwa mtihani utayataja.)

---

**AWS Snow Family: Chaguo la Kimwili**

Bado kulikuwa na suala la seti ya data ya kihistoria ya terabytes 4 na makadirio ya masaa 17 ya mtandao. Baada ya kuikokotoa, Leo alikuwa ameangalia ukurasa wa bei wa Snow Family na akafanya uamuzi mara moja.

Kwa uhamiaji ulio juu ya terabytes chache ambapo muda unajalisha zaidi ya urahisi, AWS inasafirisha vifaa vya uhifadhi vya kimwili kwa eneo lako. Unavijaza data. Unavirudisha. AWS inaingiza data moja kwa moja katika S3.

**Snowball Edge Storage Optimized**: TB 80 za uwezo wa kutumika, kasha imara. Inasafirishwa kwa eneo lako katika siku 2-5 za biashara. Unapakia data ukitumia kiolesura cha eneo lako (NFS, kiolesura cha S3). Unairudisha. AWS inaingiza data katika takriban siku 1-3 za biashara baada ya kupokea.

Kwa uhamiaji wa terabytes 4 wa Nimbus, mchakato:

1. **Agiza** Snowball Edge kupitia dashibodi ya AWS (inachukua dakika 2, inasafirishwa katika siku 3)
2. **Unganisha** kifaa kwa mtandao wa ofisi ya Seattle; kinajitokeza kama sehemu ya kuunganisha ya NFS
3. **Nakili** terabytes 4 za data ya kihistoria ya agizo ukitumia kiolesura cha kifaa kinachooana na S3: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Unakili unakamilika** katika takriban masaa 2 (mtandao wa eneo lako, hakuna mtandao)
5. **Safirisha** kifaa kurudi AWS (lebo iliyolipwa mapema imejumuishwa)
6. AWS **inaingiza** data kwa S3 ndani ya masaa 72 ya kupokea
7. **Thibitisha** — S3 inatoa ripoti ya kukamilika kwa kazi inayoonyesha kila faili iliyohamishwa na checksum

Muda jumla uliopita: siku 3 za utoaji + masaa 2 ya kunakili + siku 1 ya usafirishaji + siku 2 za uingizaji = takriban siku 7 za kalenda. Dhidi ya karibu masaa 17 kwa kuendelea — ambayo yangehitaji muunganisho thabiti, usiokatizwa wa mtandao, ukijaza kiunganishi cha juu cha ofisi usiku kucha na kupitia sehemu kubwa ya siku ya biashara.

Gharama: ukodishaji wa kifaa cha Snowball Edge ni $300 kwa siku 10. Usafirishaji (njia mbili): takriban $80. Uingizaji wa data kwa S3 ni bure. Gharama jumla ya uhamiaji: **$380**.

Linganisha na karibu masaa 17 ya matumizi ya mtandao yaliyodumu ya 875 Mbps: handaki la VPN lilikuwa bure ($0.05/saa lakini handaki tayari lilikuwa likiendesha); uingizaji wa data kwa S3 ulikuwa bure. Njia ya mtandao "ya bure" ilikuwa na gharama halisi katika muda wa uhandisi (kufuatilia uhamishaji wa masaa 17), hatari (ukatizo wowote unaohitaji kuanza upya), na gharama ya fursa (muunganisho wao wa mtandao ulijaa wakati wa dirisha la uhamishaji). Leo aliweka agizo. Jinsi ilivyokwenda iko katika tukio la baada ya mikopo la sura hii.

---

## Nguvu na Mipaka

**Site-to-Site VPN**:

- Usanidi wa haraka, gharama ya chini
- Njia ya mtandao wa umma inamaanisha latency inayobadilika
- Dari ya kipimo data ndogo (1.25 Gbps kwa kila handaki)
- Chaguo la Accelerated VPN linaboresha latency kwa gharama ya juu kidogo

**Direct Connect**:

- Thabiti, ya kibinafsi, ya kipimo data cha juu
- Polepole kusanidi, gharama kubwa ya kurudiarudia
- Mzunguko wa kimwili ni hatua moja ya kushindwa (ongeza urejeshaji au weka hifadhi ya VPN)
- Kufikia usawa na akiba ya gharama ya kutoka takriban 10-15 TB/mwezi kulingana na hali ya bei

**AWS Snow Family**:

- Kwa uhamiaji wa mara moja ulio juu ya 1-2 TB, mara nyingi ni wa haraka na wa bei nafuu zaidi kuliko uhamishaji wa mtandao
- Hakuna matumizi ya kipimo data cha mtandao wakati wa uhamiaji
- Dirisha la ukodishaji wa kifaa la siku 10; usafirishaji uliolipwa mapema

**Transit Gateway**:

- Inarahisisha muunganisho wa VPC nyingi kwa kiasi kikubwa
- Upitishaji wa kupitisha (tofauti na VPC peering)
- Majedwali ya upitishaji ya utengo yanaruhusu utenganisho bila miunganisho tofauti ya peering
- Gharama inajumuika kwa viambatisho vingi

**VPC Endpoints**:

- Faida ya usalama na gharama kwa S3/DynamoDB (gateway endpoints za bure)
- Inaondoa gharama za NAT Gateway kwa trafiki ya huduma za AWS
- Sera za endpoint zinaongeza tabaka la ziada la udhibiti wa ufikiaji zaidi ya IAM na sera za ndoo
- Interface endpoints kwa huduma zingine (Secrets Manager, SSM, SES) zinaweka trafiki ya faragha lakini zinagharimu ~$0.01/saa kwa kila AZ

**Global Accelerator**:

- Inaboresha latency ya programu ya kibadiliko kwa watumiaji wa kimataifa: uboreshaji wa 33-47% katika vitendo kwa watumiaji wa mbali
- Anycast IP zilizowekwa (tofauti na IP za kibadiliko za CloudFront) — muhimu kwa kuorodhesha kwa firewall
- Itifaki zisizo za HTTP (UDP, TCP) — CloudFront ni HTTP/HTTPS tu
- Gharama ya ziada ($0.025/saa kwa kila accelerator + uhamishaji wa data)

## Muhtasari

Kazi ya Aurora katika sura ya 24 iliboresha jinsi Nimbus inavyohudumia data kwa programu yake mwenyewe. Sura hii inahusu jinsi data inavyohama kati ya ulimwengu wa nje na AWS — na jinsi ya kufanya uhamishaji huo kuwa wa kuaminika zaidi, wa haraka zaidi, na wa bei nafuu zaidi.

- **Site-to-Site VPN**: Handaki lililofichwa juu ya mtandao wa umma kati ya eneo lako na VPC. Usanidi wa haraka, gharama ya chini, latency inayobadilika. Handaki mbili kwa urejeshaji. Kiwango cha juu cha 1.25 Gbps kwa kila handaki.
- **Direct Connect**: Muunganisho wa fiba wa kibinafsi, wa kujitolea kwa AWS. Latency inayoweza kutabiriwa, kipimo data cha juu, wiki za kusanidi, gharama kubwa. Kufikia usawa na akiba ya kutoka ya VPN kwa takriban 13.5 TB/mwezi kwa hali ya bei ya Nimbus.
- **AWS Snow Family**: Vifaa vya uhifadhi vya kimwili kwa uhamiaji wa data kwa wingi. Vya haraka kuliko uhamishaji wa mtandao kwa uhamiaji wa terabytes nyingi. $380 jumla kwa uhamiaji wa terabytes 4 wa Nimbus dhidi ya karibu masaa 17 ya kujaza mtandao.
- **Transit Gateway**: Hub kwa muunganisho wa VPC na eneo lako. Inawezesha upitishaji wa kupitisha (tofauti na VPC peering). Inasaidia majedwali ya upitishaji ya utengo kudhibiti ni VPCs zipi zinaweza kufika zipi. Inapanua hadi mamia ya miunganisho.
- **VPC Endpoints**: Ufikiaji wa faragha kwa huduma za AWS bila NAT Gateway. Gateway endpoints (S3, DynamoDB) ni za bure — ziongeze kwa kila VPC inayofikia S3 au DynamoDB. Iliokoa Nimbus $15.60/mwezi na kuondoa trafiki ya S3/DynamoDB kutoka NAT Gateway.
- **Global Accelerator**: Inapitisha trafiki ya kibadiliko juu ya mgongo wa kibinafsi wa AWS kwa latency ya chini, thabiti zaidi kimataifa. Anycast IP tuli. Uboreshaji wa latency wa 33-47% kwa watumiaji wa mbali (Tokyo: 180ms → 95ms; Sydney: 210ms → 118ms). Si CDN — haiweki kashe.
- **AWS DataSync**: Huduma inayotegemea wakala kwa kuhamisha na kupokeza data ya faili ya NFS/SMB ya eneo lako kwa S3, EFS, au FSx. Inashughulikia uratibu, uthibitishaji wa checksum, ufuatiliaji. Inatumika kwa uhamiaji wa mara moja na upokezaji unaoendelea wa sehemu za faili.
- **AWS Transfer Family**: Seva inayosimamiwa ya SFTP, FTPS, na FTP inayoungwa mkono na S3 au EFS. Inaruhusu wateja waliopo wa SFTP kupakia faili kwa S3 bila kubadilisha mtiririko wao.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.4)*

- **Ishara za VPN dhidi ya Direct Connect**: VPN = "ficha trafiki kwa VPC," "usanidi wa haraka," "nyeti kwa gharama." Direct Connect = "latency ya chini thabiti," "uhamishaji mkubwa wa data," "muunganisho wa kibinafsi," "uzingatifu unaohitaji mtandao wa kibinafsi."
- **Transit Gateway dhidi ya VPC Peering**: Peering si ya kupitisha (A→B→C hairuhusu A→C). Transit Gateway ni ya kupitisha. "VPCs nyingi zinazohitaji kuwasiliana" → Transit Gateway.
- **VPC Gateway Endpoints**: Za bure. S3 na DynamoDB tu. Mabadiliko ya jedwali la upitishaji. Hakuna gharama ya ziada. Hali ya mtihani: "punguza gharama za uhamishaji wa data kwa ufikiaji wa S3 kutoka subnet ya faragha" → Gateway Endpoint.
- **Global Accelerator dhidi ya CloudFront**: Accelerator = maudhui ya kibadiliko, isiyo ya HTTP, IP tuli, uboreshaji wa mtandao. CloudFront = kuweka kashe, maudhui ya HTTP, CDN.
- **Direct Connect + VPN**: Unaweza kutumia VPN kama hifadhi kwa muunganisho wa Direct Connect. Ikiwa mzunguko wa Direct Connect utashindwa, trafiki inashindwa hama kwenda VPN. Ghali zaidi kuliko VPN peke yake, ya kuaminika zaidi kuliko Direct Connect peke yake.
- **Direct Connect Gateway**: Unganisha mzunguko wa Direct Connect kwa VPCs nyingi katika mikoa mingi au akaunti. Bila yake, mzunguko wa Direct Connect unaunganisha kwa VGW moja katika mkoa mmoja.
- **AWS Snow Family**: "Uhamiaji mkubwa wa data," "kasi ya uhamishaji ni polepole sana," "uhamiaji wa kiwango cha petabyte" → Snow Family. Snowball Edge = hadi TB 80. Fanya hesabu ya uhamishaji kwanza: ikiwa kuhamisha data juu ya mtandao unaopatikana kungechukua takriban wiki au zaidi, jibu ni kifaa cha kimwili. *Ukaguzi wa ukweli (2026)*: AWS imekuwa ikistaafu familia — Snowmobile ilitolewa 2024, Snowcone ilisitishwa mwishoni mwa 2024, na kufikia Novemba 2025 vifaa vya Snow havitolewi tena kwa wateja wapya (AWS sasa inaelekeza kwa DataSync juu ya viungo vya haraka na kwa **Data Transfer Terminals**, maeneo salama ambapo unaleta diski zako mwenyewe). Benki ya maswali ya SAA-C03 inatangulia haya yote, kwa hivyo kwenye mtihani, "wiki za uhamishaji wa mtandao, kipimo data kidogo" bado inaelekeza kwa Snowball.
- **Majedwali ya upitishaji ya Transit Gateway**: Transit Gateway inasaidia majedwali mengi ya upitishaji kwa utenganisho wa mtandao. Ishara ya mtihani: "tenga VPC ya uzalishaji kutoka hatua ya kujaribu" na muunganisho wa pamoja kupitia Transit Gateway → majedwali tofauti ya upitishaji.
- **IP zilizowekwa za Global Accelerator**: Tofauti na CloudFront, Global Accelerator inatoa Anycast IP mbili tuli. Ishara ya mtihani: "programu inahitaji anwani ya IP iliyowekwa kwa wateja kuorodhesha" au "trafiki ya UDP" → Global Accelerator (CloudFront ni HTTP/HTTPS tu).
- **Ishara za AWS DataSync**: "hamisha sehemu za faili za NFS/SMB kwa S3/EFS/FSx," "upokezaji unaoendelea wa data ya faili ya eneo lako," "uhamiaji wa faili unaotegemea wakala." DataSync si kwa uhamishaji wa SFTP unaooana na itifaki — ni kwa uhamiaji na upokezaji wa sehemu za faili kwa wingi.
- **Ishara za AWS Transfer Family**: "mtiririko uliopo wa SFTP," "washirika au wateja wanapakia faili kupitia SFTP," "inua seva ya SFTP kwa wingu bila kubadilisha zana za mteja," "SFTP/FTPS/FTP inayoungwa mkono na S3." Transfer Family si zana ya uhamiaji wa data — ni endpoint ya itifaki inayosimamiwa. Tofauti: DataSync inahamisha data kwa wingi kwa ratiba; Transfer Family inatoa endpoint ya SFTP/FTP daima-wazi kwa upakiaji unaoendelea wa faili.
- **MGN (Application Migration Service)**: "hamisha mamia ya VMs haraka, hakuna mabadiliko ya msimbo," "rehost / inua-na-hamisha seva kwa EC2" → MGN (upokezaji wa kiwango cha block, uzinduzi wa jaribio, kuhamia kwa vipengele asili vya EC2). DataSync inahamisha *faili*; DMS inahamisha *hifadhidata*; MGN inahamisha *seva nzima*.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya AWS Site-to-Site VPN na AWS Direct Connect. Katika hali gani ungechagua kila moja?

*(Kidokezo: Fikiria muda wa usanidi, gharama, uthabiti wa latency, na mahitaji ya kipimo data.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ya huduma za kifedha inahitaji muunganisho wa mtandao wa kibinafsi, uliofichwa, wa kujitolea kutoka kituo chao cha data cha eneo lao kwenda AWS. Wanahamisha 500GB za data nyeti ya kifedha kila siku. Muunganisho lazima uwe na latency thabiti, inayoweza kutabiriwa na lazima usipite mtandao wa umma. Pia wanahitaji muunganisho wa hifadhi ikiwa wa msingi utashindwa.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Site-to-Site VPN yenye upitishaji wa BGP na VPN ya pili kwa urejeshaji  
B) Direct Connect Hosted Connection yenye Direct Connect Gateway  
C) Miunganisho miwili ya Site-to-Site VPN kupitia watoa huduma tofauti wa mtandao  
D) Muunganisho wa Direct Connect wenye Site-to-Site VPN kama hifadhi

**Kidokezo cha 1**: "Lazima usipite mtandao wa umma" — trafiki ya VPN inaenda juu ya mtandao wa umma (imefichwa). Direct Connect tu ndiyo ya faragha.

**Kidokezo cha 2**: "Latency thabiti, inayoweza kutabiriwa" — utendaji wa VPN wa mtandao wa umma unabadilika. Direct Connect ni thabiti.

**Kidokezo cha 3**: "Muunganisho wa hifadhi" — ni mbinu gani inayopendekezwa wakati Direct Connect ni ya msingi?

**Jibu**: D

**Maelezo**: Direct Connect inatoa muunganisho wa kibinafsi, wa kujitolea ambao haupiti mtandao wa umma — ukikidhi mahitaji ya faragha na latency. Site-to-Site VPN kama hifadhi inatoa urejeshaji: ikiwa mzunguko wa Direct Connect utashindwa, trafiki inashindwa hama kwenda VPN iliyofichwa. Huu ni muundo wa kawaida wa HA kwa Direct Connect.

**Kwa nini si A?** Trafiki ya Site-to-Site VPN inapita mtandao wa umma, ambayo inakiuka sharti la "lazima usipite mtandao wa umma."

**Kwa nini si B?** Hosted Connection inatoa muunganisho wa Direct Connect lakini chaguo B halijumuishi hifadhi. Direct Connect moja bila hifadhi ni hatua moja ya kushindwa — fiba ya kimwili inaweza kukatwa.

**Kwa nini si C?** Miunganisho miwili ya VPN kupitia ISP tofauti bado inapita mtandao wa umma, hata ikiwa imefichwa. Haikidhi sharti la mtandao wa kibinafsi.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inapanuka kuwa na timu za uhandisi za kanda huko Seattle, Berlin, na Singapore. Kila timu ya kanda inahitaji ufikiaji kwa:

- VPC ya uzalishaji (kusoma-tu kwa utatuzi)
- VPC ya hatua ya kujaribu (ufikiaji kamili kwa majaribio)
- VPC ya uchambuzi (kusoma-tu kwa kuripoti)

Buni muunganisho wa mtandao. Je, ungetumia Transit Gateway? Direct Connect katika kila kanda au Site-to-Site VPN? Ungetekeleza vipi ufikiaji wa kusoma-tu kwa uzalishaji? (Kidokezo: hili ni swali la mtandao na la IAM kwa pamoja.)

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya muundo wa mtandao wa kanda nyingi, timu nyingi.)*

**Nyongeza**: Timu ya Berlin inaripoti kwamba latency yao ya VPN kwa VPC ya uzalishaji (us-west-2) ina wastani wa 160ms. Kwa kiasi gani cha data Accelerated Site-to-Site VPN au Direct Connect Hosted Connection ingekuwa chaguo bora? Chunguza bei ya sasa ya Direct Connect Hosted Connection kutoka AWS Partner wa Ulaya. Je, uboreshaji wa latency peke yake ungehalalisha gharama kwa kiasi chako cha data kilichokadiriwa?

## Tukio Baada ya Mikopo

Uhamiaji wa data ulikamilika katika siku 8 za kalenda — siku 3 kwa Snowball Edge kufika, dakika 94 kunakili data, siku 4 kwa AWS kupokea kifaa na kuingiza data, kisha ulinganishaji wa mwisho wa delta iliyojikusanya wakati Snowball ikiwa safarini. Muda wa kufanya kazi kwa kitu kizima: chini ya masaa manne.

Hatua hiyo ya mwisho ilijalisha. Snowball Edge ilinakili picha ya wakati maalum ya seti ya data ya terabytes 4. Wakati ikiwa safarini, hifadhidata ya uzalishaji ilikuwa imeendelea kuendesha — maagizo mapya yalikuwa yakiwekwa, rekodi mpya zilikuwa zikiundwa. Ulinganishaji wa delta juu ya VPN ulikuwa GB 12, ulikamilika katika dakika 18.

"Uhamishaji wa wingi ulikuwa Snowball," Leo alisema. "Ulinganishaji ulikuwa tu data mpya-kabisa kutoka siku 8 zilizochukuliwa."

"Tayari niliiweka — oh," Leo alisema, akitazama unakili ukikamilika kwenye Snowball Edge baada ya dakika 94. "Ningepaswa kuweka kizuizi cha kipimo data kwenye unakili wa eneo lako kuepuka kujaza mtandao wa ofisi wakati wa saa za biashara."

Hakuwa ameweka kizuizi. Mtandao wa ofisi ulikuwa sawa — Snowball ilikuwa operesheni ya mtandao wa eneo lako. Lakini swichi ya mtandao kwa muda mfupi ikawa kizuizi unakili ulipokaribia uendeshaji wa eneo lako wa 9 Gbps.

"Hoja," alisema, baada ya kurekebisha mpangilio wa kizuizi, "ni kwamba barua ya kimwili ni ya haraka kuliko mtandao juu ya kiasi fulani cha data."

"Hilo ni ama dhahiri au la kinyume cha mawazo," Maya alisema, "kulingana na jinsi unavyofikiria juu yake."

"Wakati ujao," Leo alisema, "tunapaswa kuweka Direct Connect."

Tom hakufikia kikokotoo — alikuwa tayari ameendesha hesabu awali, wakati Direct Connect ilipokuja kwa mara ya kwanza: karibu elfu moja kwa mwezi, bandari pamoja na mzunguko.

"Kwa kile tunachofanya sasa, pengine haina thamani. Lakini tukianza kuhamisha zaidi ya 10TB kwa mwezi kati ya ofisi yetu na AWS, akiba ya uhamishaji wa data kwa Direct Connect ingeweza kufidia gharama."

"Kwa hivyo tunafuatilia kiasi cha uhamishaji wa data," Priya alisema, "na kupitia upya kinapovuka kizingiti."

"Hiyo ni usanifu unaozingatia gharama," Tom alisema.

"Hiyo daima ndiyo imekuwa hoja," Maya alisema.

Priya alikuwa ametazama uhamiaji kutoka upande wa chumba. "Wakati ujao tunapofanya kitu kama hiki," alisema, "tunaweza kuifanya kabla data haijawa katika uzalishaji na biashara ikategemea? Kuhamisha data hai daima ni hatari zaidi kuliko kuhamisha data iliyopumzika."

"Kamwe haipumziki wakati biashara inaendesha," Leo alisema.

"Najua," alisema. "Hiyo ndiyo hoja. Panga uhamiaji kabla huujahitaji. Si baada."

Tom alikuwa tayari amekokotoa kile kingegharimu kuwa na seti ya pili ya miundombinu katika us-east-1 tayari kupokea uhamiaji wakati wowote. Aliweka nambari kwake mwenyewe kwa sasa. Kulikuwa na sura za haraka zaidi za kufunga.

Katika sura inayofuata: kinachotokea unapokuwa na data zaidi kuliko hifadhidata yoyote inaweza kuhifadhi kwa busara, na unahitaji kuelewa yote.
