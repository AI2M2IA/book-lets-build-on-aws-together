# Sura ya 27: Kulipa kwa Unachohitaji

Tom alitengeneza kahawa kabla ya kufungua kichupo cha bili. Daima alifanya hivyo — baadhi ya ripoti zilikuwa bora kukabiliwa nazo ukiwa na joto. Alikaa kwenye kiti karibu na dirisha, kikombe mkononi, asubuhi ya Jumamosi ikiwa bado kimya nje. Hakuna arifa, hakuna mikutano ya kusimama. Lahajedwali tu na nambari.

Alifungua kichupo.

**Muhtasari wa Haraka: Kutoka Ufahamu wa Athena hadi Bili**

Uchanganuzi wa Athena wa sura iliyopita ulikuwa umefanya jambo lisilotegemewa: kwa kuhoji ripoti za gharama na matumizi moja kwa moja kutoka S3, hatimaye Tom angeweza kuona si tu jumla ya bili ya AWS, bali mchanganuo wa kile ambacho kila huduma ilikuwa ikigharimu kweli, wiki kwa wiki, kwa miezi sita. Picha iliyojitokeza ilikuwa wazi vya kutosha kuwa ya kutisha. EC2 kilikuwa kipengee kikubwa kabisa cha bili, na muundo ulikuwa dhahiri — timu ilikuwa ikilipa bei za kuingia kwa hoteli waliyoishi muda wote. Utambuzi huo ulimpeleka Tom kwenye ukurasa wa bei za EC2 asubuhi ya Jumamosi akiwa na kikombe kipya cha kahawa na azma ya kuelewa kila chaguo kabla ankara ya mwezi ujao kufika.

Tom alikuwa akipitia bili ya AWS kila mwezi tangu Nimbus ilipoanza. Kwa mwaka wa kwanza, alielewa karibu 60% ya kile alichokiona. Sasa, alielewa karibu kila kitu — isipokuwa ni kwa nini sehemu ya EC2 daima ilimfanya ahisi walikuwa wakilipa zaidi. Sehemu ya EC2 ilikuwa mchanganyiko wa "vipengele vya On-Demand" kwa aina mbalimbali za vipengele, vyote vikilipiwa kwa saa, vyote vikijumlika hadi $2,340/mwezi.

Kabla hajampigia mtu yeyote simu, alitumia saa moja kupitia orodha ya vipengele yeye mwenyewe — si kuhitimisha lolote, bali kuunda dhana ambazo angeweza kuzijaribu.

Aliona vipengele vinne vya r6g.large vilivyowekewa lebo "api-prod." Aliona vipengele viwili vya c6g.medium vikiendesha vichakataji vya kazi za usuli. Aliona t3.medium iliyowekewa lebo "vpn-server" iliyokuwa ikiendesha tangu mwezi wa tatu wa uwepo wa kampuni. Aliona jozi ya vipengele vilivyowekewa lebo "analytics-batch" ambavyo vilijitokeza saa 9 usiku na kutoweka kabla ya saa 1 asubuhi kila usiku.

Aliandika safu ya dhana:

- Seva za API: zinazoweza kutabiriwa, daima zikiendeshwa.
- Vichakataji vya usuli: pengine zinazoweza kutabiriwa.
- Seva ya VPN: daima ikiendeshwa, haibadiliki kamwe.
- Uchambuzi wa kundi: pengine inafaa kwa Spot?

Kisha aliandika pembezoni: *thibitisha kila kimoja kabla ya kuamua lolote.*

Nidhamu hiyo — ya kutenganisha "kile ninachodhania" na "kile ninachokijua" — ndiyo iliyofanya mapitio ya gharama ya Tom kuwa na manufaa. Aliwapigia simu wengine.

"Tungeweza tu kuendelea kulipa kiwango cha kuingia," Tom alisema, wengine walipojiunga na simu. "Lakini hatutafanya hivyo."

"Kiwango cha kuingia?" Leo aliuliza.

"Bei za On-Demand," Tom alisema. "Ni kama kuhifadhi chumba cha hoteli asubuhi unayoihitaji. Kubadilika kwa juu zaidi. Bei ya juu zaidi."

"Mbadala ni nini?"

**Mfano wa Hoteli**

Tom alifikiri kuhusu hilo kwa muda. "Unajua jinsi watu wengine wanavyohifadhi chumba cha hoteli asubuhi wanapowasili? Hivyo ndivyo sisi tulivyo sasa hivi. Kuna mikakati bora — hifadhi miezi sita mapema upate punguzo, chukua chumba kisichouzwa dakika ya mwisho kwa mpango wa nafuu, au kodi sakafu nzima ikiwa unahitaji sakafu nzima. Hoteli ile ile, bei nne tofauti."

Leo alimtazama. "Na matoleo ya AWS ya hayo ni?"

Tom alivuta ukurasa wa bei za EC2. "Kuna mifano minne ya bei. Na tunaitumia moja tu."

Bei za EC2 zinaoana vizuri kwa kushangaza na mikakati ya kuhifadhi chumba cha hoteli:

**On-Demand**: Tembea mpaka dawati la mbele bila hifadhi. Unalipa kiwango kamili cha bei ya kawaida, lakini unaweza kutoka wakati wowote unaotaka. Bora kwa makazi yasiyoweza kutabiriwa.

**Vipengele Vilivyohifadhiwa/Mipango ya Akiba (Reserved Instances/Savings Plans)**: Hifadhi chumba kwa mwaka mzima mapema. Unapata punguzo kubwa — 30-72% — kwa kubadilishana na kujitolea kukitumia.

**Vipengele vya Nafasi (Spot Instances)**: Chukua chumba kisichouzwa kwa kiwango cha hoteli kilichopunguzwa sana cha wakati huo — hakuna kupatana, hoteli inaweka bei kulingana na jinsi ilivyo tupu. Hadi 90% chini ya bei. Lakini hoteli inaweza kukuomba uondoke kwa notisi ya dakika mbili ikiwa watahitaji chumba kwa mteja wa bei kamili. (Miaka iliyopita ilikuwa lazima *uzabuni* kwa uwezo wa Spot; AWS iliondoa uzabuni mwaka 2017 — unalipa tu bei ya sasa ya Spot.)

**Majeshi Maalum (Dedicated Hosts)**: Kodi sakafu nzima ya hoteli kwa matumizi yako peke yako. Hakuna kushiriki na wageni wengine. Ghali zaidi sana. Inahitajika wakati leseni za programu au sheria za uzingatifu zinakataza kushiriki mwenyeji wa kimwili.

Kila mfano una matumizi yake. Kosa Nimbus lilikuwa likifanya: kutumia On-Demand kwa kila kitu, ikiwa ni pamoja na mzigo wa kazi uliokuwa ukiendesha masaa 24/7 na uliokuwa unaoweza kutabiriwa kabisa.

**Vipengele vya On-Demand: Kubadilika kwa Juu Zaidi, Gharama ya Juu Zaidi**

**Lini kutumia**:

- Mzigo wa kazi usioweza kutabiriwa (mabadiliko ya trafiki usiyoyaweza kutabiri)
- Maendeleo na majaribio (anzisha na simamisha mara kwa mara)
- Mzigo wa kazi wa muda mfupi (kuendesha jaribio kwa wiki)
- Usambazaji wa kwanza (kabla hujaelewa mifumo yako ya matumizi)

**Lini kutotumia**:

- Mzigo thabiti wa uzalishaji unaojua utaendelea kwa zaidi ya mwaka
- Chochote chenye mzigo wa msingi unaoweza kutabiriwa

**Hibernation ya EC2: Kusimamisha Bila Kupoteza Hali**

Mbinu moja ya uimarishaji wa gharama ambayo haipati uangalizi wa kutosha ni **Hibernation ya EC2**. Unaposimamisha kipengele cha kawaida, maudhui ya RAM yanapotea — uanzishaji unaofuata ni uanzishaji wa baridi. Mfumo wa uendeshaji unawaka, programu inaanzishwa, miunganisho ya hifadhidata inaanzishwa upya. Kwa seva nyingi za uzalishaji za wavuti, hili ni sawa. Kwa baadhi ya mizigo ya kazi, ni ghali.

Unapohibernate kipengele, maudhui ya RAM yanahifadhiwa kwenye sehemu ya mizizi ya EBS kabla ya kuzima. Katika uanzishaji unaofuata, kipengele kinaendelea hasa pale kilipoachia — michakato ikiendeshwa, miunganisho imeanzishwa, hali ya programu ikiwa salama — katika sehemu ndogo ya muda ambao uanzishaji wa baridi ungechukua. Ni muhimu hasa kwa kazi za uchambuzi za muda mrefu unazotaka kusimamisha usiku kucha bila kupoteza hali, au kwa vipengele vya maendeleo vinavyochukua dakika kadhaa kuwaka na kusanidi mazingira yao.

"Nina kipengele cha sayansi ya data," Leo alisema, akiangalia karatasi iliyochapishwa. "Kinachukua dakika tisa kuanza. Mazingira maalum, paketi kadhaa za Python, baadhi ya uzani wa modeli zilizopakiwa awali. Ninakisimamisha kila usiku na kukianzisha tena kila asubuhi."

"Kwa hivyo unatumia dakika tisa kuangalia kikiwaka kila siku," Tom alisema.

"Ndiyo."

"Hizo ni dakika 45 kwa wiki za muda wa uhandisi kusubiri kipengele cha EC2."

"Ndiyo."

"Kihibernate."

Kwa hibernation, kipengele cha Leo kilisimama mwishoni mwa siku, kilihifadhi RAM yake kwenye sehemu ya mizizi ya EBS, na kuendelea ndani ya sekunde 90 asubuhi iliyofuata. Vipindi vya uchambuzi viliendelea hasa pale alipoachia.

Mahitaji ya hibernation: hibernation lazima **iwezeshwe wakati wa uzinduzi** — huwezi kuiwasha kwa kipengele kinachoendesha tayari (Leo alilazimika kuzindua upya sanduku lake la sayansi ya data kutoka AMI ili kupata hibernation). Vipengele lazima viwe na RAM hadi GB 150 (maudhui ya RAM yanapaswa kutoshea kwenye sehemu ya mizizi ya EBS), sehemu ya mizizi lazima iwe kubwa vya kutosha kushikilia OS na dampo la RAM, na sehemu ya mizizi lazima iwe imefichwa (hibernation inahifadhi data nyeti ya kumbukumbu kwenye diski). Vipengele vya bare-metal na vipengele vyenye zaidi ya GB 150 za RAM havitumii hibernation. Kikomo kimoja zaidi: kipengele kinaweza kubaki kimehibernate kwa zaidi ya **siku 60** — baada ya hapo lazima kianzishwe, kisimamishwe, au kikomeshwe; hakiwezi kulala bila kikomo.

Tom alitambua vipengele vya On-Demand vya Nimbus:

- Seva za API za wavuti: vipengele 4 vya EC2, vikiendeshwa masaa 24/7 kwa miezi 18. *Msingi unaoweza kutabiriwa.*
- Seva ya VPN: Daima ikiendeshwa. *Msingi unaoweza kutabiriwa.*
- Seva za API za ziada kwa mabadiliko ya trafiki: Haiwezi kutabiriwa. *On-Demand ni sahihi hapa.*

"Subiri — lakini *kwa nini* seva za mabadiliko zingebaki On-Demand?" Maya aliuliza. "Ikiwa tunapata mabadiliko kila Ijumaa, je, hilo haliwezi kutabiriwa vya kutosha kujitolea?"

Tom alifikiri kuhusu hilo. "Msingi unaweza kutabiriwa. Mabadiliko yanaweza kutabiriwa katika wakati, lakini si katika ukubwa. Baadhi ya usiku wa Ijumaa ni 30% juu ya kawaida; baadhi ni 150% juu. Ikiwa nitanunua uwezo wa Reserved kwa vipengele sita na mabadiliko yanahitaji vipengele viwili tu vya ziada, nimejitolea kupita kiasi. Ikiwa nitanunua kwa viwili na mabadiliko yanahitaji vinane, nina upungufu na ziada inaendesha On-Demand hata hivyo. Kwa uwezo wa mlipuko mahususi, On-Demand au Spot ni sahihi — huwezi kununua Reserved Instance kwa wakati halisi trafiki inapoanza kupanda."

Kuna sababu kwa nini orodha ya "lini kutotumia" ni muhimu: ikiwa umekuwa ukiendesha vipengele vile vile kwa miezi sita na unaweza kutabiri vitaendelea kuendesha, kila mwezi kwenye On-Demand ni mwezi unaolipa kiwango cha kuingia kwa chumba unachokaa kabisa.

**Vipengele Vilivyohifadhiwa: Kujitolea kwa Mwaka Mzima**

**Vipengele Vilivyohifadhiwa (Reserved Instances - RIs)** ni kujitolea kwa malipo — unakubali kutumia aina maalum ya kipengele katika mkoa maalum kwa miaka 1 au 3. Kwa kubadilishana, AWS inalipia kiwango cha chini cha kwa saa.

**Viwango vya punguzo**:

- Mwaka 1, Bila Malipo Mapema: punguzo la ~30-40% dhidi ya On-Demand
- Mwaka 1, Malipo ya Sehemu Mapema: punguzo la ~35-45% (lipa baadhi sasa, punguzo zaidi kwa saa)
- Mwaka 1, Malipo Yote Mapema: punguzo la ~40-50% (lipa mwaka mzima sasa)
- Miaka 3, Malipo Yote Mapema: punguzo la ~55-72% (punguzo la juu zaidi, kujitolea kwa juu zaidi)

**RI za Kawaida dhidi ya RI za Kubadilishwa**:

- **Kawaida**: Zimefungwa kwa aina haswa ya kipengele na mkoa. Zinaweza kuuzwa kwenye Soko la Vipengele Vilivyohifadhiwa ikiwa huzihitaji tena.
- **Zinazobadilishwa**: Zinaweza kubadilisha aina ya kipengele, OS, na hali ya upangishaji wakati wa kipindi cha kujitolea. Punguzo dogo zaidi kuliko Kawaida (hadi ~66% dhidi ya 72%).

Tom alifanya hesabu kwa seva 4 za API (r6g.large, takriban $0.101/saa On-Demand):

- Gharama ya kila mwaka ya On-Demand: $0.101 × 24 × 365 × 4 ≈ $3,540
- RI ya Mwaka 1 yenye Malipo Yote Mapema (kipengele 1): ~$520 mapema (≈41% chini)
- Vipengele 4: ~$2,080 mapema = **takriban $1,460 zilizookolewa katika mwaka wa kwanza**

"Tungeweza kuokoa karibu dola elfu moja na mia tano katika mwaka wa kwanza kwa kujitolea tu," Tom alisema. "Hii inagharimu kiasi gani kwa mwezi, hasa — kila kipengele kilichohifadhiwa ikilinganishwa na tunacholipa sasa?"

"Imelundikwa mbele," Maya alisema. "Unalipa mwaka mzima mapema."

"Subiri — lakini *kwa nini* tungejitolea kwa RI ya Kawaida ikiwa aina za vipengele bado zinabadilika?" Maya aliuliza. "Vipi ikiwa r6g itakuwa imepitwa na wakati mwaka ujao?"

"Tunapata RI za Kubadilishwa ikiwa tunafikiri tunaweza kuhitaji kubadilisha. Punguzo dogo zaidi — hadi ~66% badala ya 72% — lakini kubadilika kwa kuhamia familia za vipengele wakati wa kipindi cha kujitolea."

"Na ikiwa AWS itatoa aina bora ya kipengele baada ya kujitolea?"

"Tunaangalia RI inapoisha. Ikiwa aina mpya ni bora, tununua RI mpya kwa kipindi kinachofuata. RI ya sasa bado inaendelea hadi mwisho kwa bei iliyojitolea."

Tom alivuta ulinganisho wa hatua ya kufikia usawa kwenye skrini iliyoshirikiwa ili kila mtu aweze kufuatilia:

**Ulinganisho wa njia tatu: r6g.large, vipengele 4, miezi 12**

| Chaguo | Gharama ya Kila Mwaka | Sawa na Kwa Mwezi | Kubadilika |
|---|---|---|---|
| On-Demand ($0.101/saa × 4) | $3,540 | $295 | Kamili |
| Compute Savings Plan (~34% chini mwaka-1, $0.27/saa kilichojitolewa) | $2,365 | $197 | Juu |
| Standard RI, Mwaka-1 Malipo Yote Mapema (4 × $520) | $2,080 | $173 | Chini |

"Subiri," Leo alisema. "RI ni nafuu kuliko Savings Plan?"

"Kwa muda ule ule, ndiyo — hiyo ndiyo bei ya kubadilika," Tom alisema. "Compute Savings Plan inatumika kwa aina *yoyote* ya kipengele, ukubwa, mkoa, hata Fargate na Lambda, hivyo punguzo lake la juu zaidi ni la chini — hadi 66% kwa kiwango cha miaka 3. Standard RI, au EC2 Instance Savings Plan, inakufunga kwa familia ya kipengele na inakulipa kwa kufungwa huko kwa punguzo hadi 72%. Kadiri unavyohifadhi uhuru zaidi, ndivyo AWS inapunguza kidogo."

"Hatua ya kufikia usawa kwa RI ya miaka 3 ni gani?"

"Miaka 3 Malipo Yote Mapema: takriban $1,060 kwa kila kipengele, hivyo $4,240 jumla kwa vyote vinne — hiyo inanunua miezi 36. Sawa na kwa mwezi: $118, dhidi ya $295 On-Demand. Malipo ya mapema yanajilipa kuanzia mwezi wa kumi na nne; baada ya hapo upo katika eneo la akiba kwa karibu miaka miwili zaidi."

"Kwa hivyo ikiwa tutaamua katika mwezi wa nne kwamba tunahitaji familia tofauti ya kipengele," Priya alisema, "bado tunalipa kwa kujitolea kwa awali."

"Sahihi. Unaweza kuuza Standard RI kwenye Soko la RI, lakini si daima kwa thamani kamili. RI za Kubadilishwa zinaweza kubadilishwa lakini si kuuzwa. Hii ndiyo sababu Savings Plan mara nyingi ni chaguo salama zaidi — kanuni ile ile, kufungwa kidogo zaidi."

**Mipango ya Akiba: Kujitolea kwa Kubadilika**

**Mipango ya Akiba (Savings Plans)** ni mbadala mpya, unaobadilika zaidi wa Vipengele Vilivyohifadhiwa. Badala ya kujitolea kwa aina maalum ya kipengele, unajitolea kwa *kiasi maalum cha matumizi ya kwa saa* (kwa dola).

**Compute Savings Plans**: Zinatumika kwa kipengele chochote cha EC2, bila kujali aina, ukubwa, mkoa, au OS. Zenye kubadilika zaidi. Hadi punguzo la 66%.

**EC2 Instance Savings Plans**: Zinatumika kwa familia maalum ya kipengele katika mkoa (mfano, "vipengele vya c6g katika us-west-2"). Zina vizuizi zaidi kuliko Compute, lakini hadi punguzo la 72% (sawa na kiwango cha juu cha RI).

**SageMaker Savings Plans**: Maalum kwa mafunzo na hitimisho za ML za SageMaker.

Kwa Nimbus: Compute Savings Plans kwa seva zao za API. Walijitolea kwa $0.45/saa ya matumizi ya kompyuta. Aina yoyote ya kipengele, ukubwa wowote — na kujitolea pia kunafunika Fargate na Lambda, jambo lililokuwa muhimu kwa kilichofuata. Wanapoongeza kikosi au kubadilisha aina za vipengele, Savings Plan bado inatumika.

"Hii ni bora kuliko Vipengele Vilivyohifadhiwa kwetu," Leo alisema. "Bado tunajaribu aina za vipengele. Compute Savings Plan inatupa punguzo bila kutufunga kwa r6g mahususi."

"Nini hutokea tunapojitolea kwa $0.45/saa na kutumia $0.36 tu miezi mingine?" Maya aliuliza.

"Unalipa $0.45 bila kujali," Tom alisema. "Kujitolea hakuna masharti. Savings Plan inatumika kwa matumizi yoyote uliyo nayo hadi kiasi kilichojitolewa. Chochote juu ya hapo kinaendesha kwa viwango vya On-Demand. Nidhamu ni kuweka kujitolea kwenye kiwango ambacho una uhakika daima utakifikia."

"Na hatupaswi kujitolea kwa wastani wetu — tunapaswa kujitolea kwa sakafu yetu," Priya alisema.

"Hasa. Angalia miezi sita iliyopita. Tafuta wiki ya chini kabisa. Jitolee kwa 90% ya nambari hiyo. Kisha pitia kila robo tunavyokua."

"Je, tumefikiria nini hutokea ikiwa tutajitolea kupita kiasi?" Priya aliendelea. "Tunanunua mpango wa $2/saa, kisha robo inayofuata tunaboresha na matumizi yetu ya kompyuta yanashuka hadi $1.50?"

"Pengo la $0.50/saa linakuwa taka," Tom alisema. "Tunalipa kwa uwezo ambao hauko tena. Hiyo ndiyo hatari ya kuweka kujitolea juu sana. Mapitio ya robo ni hasa kwa kunasa hili — ikiwa matumizi yetu yameshuka chini ya kujitolea, tunajua ununuzi unaofuata unapaswa kuwa mdogo. Nuance moja muhimu: Savings Plan ya *Compute* inakufuata hadi Fargate na Lambda — kuhamisha mizigo ya kazi ya EC2 kwenda kontena hakungeiacha. Kinachoacha kujitolea ni kutumia kompyuta kidogo kweli, au kushikilia EC2 *Instance* Savings Plan au RI kwa familia ya kipengele uliyoacha kutumia."

Huenda unajiuliza: kwa nini usinunue tu Savings Plans daima kwa kiasi cha juu zaidi unachoweza kumudu na kuacha AWS ipange? Jibu ni kwamba kujitolea ni sakafu, si dari. Ikiwa utajitolea $5/saa lakini ukatumia $3/saa tu, unalipa $5/saa. Kila dola ya matumizi yaliyojitolewa ambayo hailingani na matumizi halisi ni dola iliyopotea. Mapitio ya robo si ya hiari — ndiyo yanayoweka Savings Plan kuwa uimarishaji badala ya kujitolea kupita kiasi.

**Vipengele vya Nafasi: Punguzo la 90%**

**Vipengele vya Nafasi (Spot Instances)** vinatumia uwezo wa ziada wa EC2 wa AWS. AWS inapokuwa na seva zisizotumika, unaweza kuvikodisha kwa 60-90% chini ya bei ya On-Demand. AWS inapohitaji uwezo tena (kwa wateja wa On-Demand au Vilivyohifadhiwa), wanakupa onyo la dakika 2 na kukomesha kipengele chako.

Huenda unajiuliza: nani angeunda mfumo kuzunguka vipengele vinavyoweza kutoweka kwa notisi ya dakika mbili? Jibu ni: yeyote ambaye kazi yake inaweza kuanzishwa upya kutoka mwanzo. Kazi za kundi, uchambuzi, mizunguko ya uchoraji — hakuna kati ya hizi inayohitaji kipengele mahususi kilichoanza kazi kuwa kile kinachoimaliza. Onyo la dakika 2 linatosha kuhifadhi alama, kumaliza miunganisho, na kutoka kwa usafi.

Hatari ya usumbufu ni sifa inayobainisha. Vipengele vya Nafasi vinafaa tu kwa:

- **Mizigo ya kazi ya ustahimilivu wa hitilafu**: Kipengele kikikomeshwa katikati ya kazi, kazi inaweza kuanzishwa tena bila kudhuru chochote
- **Usindikaji bila hali**: Kupiga ukubwa picha, kusimba video, uchambuzi wa kundi, mafunzo ya ML
- **Kazi za kundi za muda mfupi**: Onyo la dakika 2 linatosha kuhifadhi hali na kuweka alama
- **Vikosi vya mchanganyiko vya Auto Scaling**: Tumia Spot kwa wingi wa ASG yako na On-Demand kama msingi

Kwa Nimbus: Vipengele vya Nafasi vilikuwa na maana kwa kazi za uchambuzi za kundi zilizoendesha kila usiku (kushughulikia data ya agizo ya siku kuwa ripoti zilizokusanywa). Kipengele cha Nafasi kikikomeshwa katikati ya kazi, kazi inashindwa, lakini inaanzishwa tena kutoka mwanzo kwenye kipengele kipya. Data katika S3 iko salama.

Lakini Leo aligundua hili kwa njia ngumu kabla timu kuelewa kikamilifu muundo.

Miezi mitatu mapema, alikuwa amehamisha kazi ya kundi ya usiku kwenda Spot bila kujenga mantiki ya alama. Usiku wa kwanza, kipengele cha Nafasi kiliendesha vizuri. Usiku wa pili, kilikatizwa saa 10:47 usiku — dakika arobaini na saba ndani ya kazi iliyochukua saa moja na dakika ishirini kukamilika. Kazi ilishindwa. Ripoti ya mwisho ya maagizo ya siku iliyopita ilikuwa imekosekana wakati washirika wa migahawa walipoingia asubuhi hiyo.

"Tayari niliisambaza — lo," Leo alikuwa amesema, akiangalia arifa ya kazi iliyoshindwa. "Nilidhani ingekuwa sawa. Ilikuwa sawa usiku wa kwanza."

"Nini kilitokea?" Maya alikuwa ameuliza.

"Usumbufu wa Spot. AWS ilihitaji uwezo tena, ilitupa dakika mbili, kipengele kilikomeshwa. Kazi haikuwa na alama. Kipengele kipya cha Nafasi kilipozinduliwa saa 11 usiku kujaribu tena, kilianza kutoka sifuri. Kilimaliza saa 12:40 asubuhi. Ripoti zilichelewa saa mbili."

Suluhisho lilikuwa rahisi: andika matokeo ya kati kwenye S3 kila dakika kumi na tano. Kila alama ilikuwa hali kamili ya sehemu — ya kutosha kwa kipengele kipya kusoma alama ya mwisho na kuendelea kutoka hatua hiyo badala ya kuanza upya kutoka mwanzo.

"Kutumia Spot kwa kazi ya usiku ilipunguza gharama yake kutoka $12/usiku hadi $2/usiku," Leo aliripoti, baada ya suluhisho kuwekwa. "Hata na usiku mmoja mbaya, gharama ya jumla ya kuiendesha kwa miezi mitatu ilikuwa chini ya wiki mbili za bei za On-Demand."

"Itakuwa sawa," Leo aliongeza, "hata ikikatizwa katikati ya uendeshaji — sivyo?"

"Pamoja na uwekaji wa alama, ndiyo," Tom alisema. "Bila huo, hapana. Ustahimilivu wa usumbufu lazima ujengwe ndani ya kazi, si kudhaniwa."

"Na vipi ikiwa mtu atajaribu kuvunja?" Priya aliuliza. "Kipengele cha Nafasi kiko kwenye vifaa vilivyoshirikiwa. Kikikatizwa na kipya kikizinduliwa, je, kuna mfichuo wowote wa data kati ya vipengele?"

"Hapana," Tom alisema. "AWS inafuta hifadhi ya kipengele wakati wa kukomeshwa. Mteja anayefuata anayepata vifaa hivyo anaona ubao safi. Lakini ni hisia nzuri — wakati wowote unapotumia uwezo ulioshirikiwa, inafaa kuthibitisha mfano wa kutengwa."

**Utofautishaji wa Spot Fleet**

Leo alikuwa amejifunza jambo moja zaidi kutoka kazi ya kundi iliyokatizwa: unapoomba aina moja ya kipengele cha Nafasi, unaweka dau kwenye upatikanaji wa aina hiyo mahususi katika AZ hiyo. Ikiwa uwezo wa Spot kwa c5.2xlarge katika us-west-2a umeisha, kazi yako inasubiri — au inashindwa.

**Spot Fleet** inatatua hili kwa kukuruhusu kubainisha aina nyingi za vipengele na AZ katika ombi moja. AWS inatimiza kikosi kutoka mchanganyiko wowote ulio na uwezo unaopatikana kwa bei ya chini zaidi.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Kwa kikosi kilichotofautishwa, usumbufu katika aina moja ya kipengele au AZ unaathiri sehemu tu ya kikosi. Kingine kinaendelea kuendesha. Kwa kazi ya kundi ya Nimbus, kuendesha Spot Fleet ya vipengele vinne badala ya kipengele kimoja kikubwa kulimaanisha kwamba hata usumbufu wa sehemu uliruhusu kazi kumaliza — taratibu zaidi, lakini bila kuanza upya kabisa.

"Kikosi kilichotofautishwa pia huwa na mwelekeo wa kupata bei bora," Tom alisema. "AWS inakupa bei ya chini zaidi katika aina zote katika kikosi chako. Baadhi ya usiku unapata c5a kwa bei ya chini kuliko c5 kwa sababu uwezo ulibahatika kuwepo."

"Hii inagharimu kiasi gani kwa mwezi ikilinganishwa na kutumia aina moja tu ya kipengele?" Tom alijiuliza kwa sauti — tabia ilikuwa imekuwa ya silika kabisa sasa. Aliendesha nambari. Spot Fleet kwa bei mchanganyiko ilikuwa na wastani wa $1.80/usiku dhidi ya $2.00/usiku na ombi la aina moja. Tofauti ndogo kwa maana kamili, lakini uboreshaji wa kuaminika peke yake ulihalalisha mabadiliko.

"Na vipi ikiwa mtu atajaribu kuvunja Spot Fleet?" Priya aliuliza.

"Jibu lile lile kama daima," Tom alisema. "Kila kipengele kimetengwa na vingine. Fleet haiweki vipengele kwenye sehemu ya kibinafsi iliyoshirikiwa kiotomatiki. Vikundi vyako vya usalama bado vinatumika kwa kila kipengele mmoja mmoja."

Uwekaji wa alama ulikuwa umefanya usumbufu kuweza kudhibitiwa, si kuondolewa. Kazi bado ilianza upya kutoka alama ya mwisho, na ikiwa uanzishaji upya uliambatana na kipindi cha mabadiliko ya bei ya Spot, kipengele cha mbadala kingeweza kuchukua dakika 10 hadi 20 kupatikana. Kazi iliyofunikwa tayari na alama ya mwisho iliruka wakati wa uanzishaji upya; kazi tangu wakati huo ilirudiwa. Gharama ya jumla ya kazi iliyorudiwa: ndogo, lakini halisi.

Spot Fleet ilitatua tatizo la upatikanaji kwa usafi. Kwa kubainisha aina tano za vipengele katika AZ tatu, Leo alipunguza uwezekano wa pengo kamili la uwezo karibu na sifuri. Mkakati wa ugawaji wa AWS — uliotofautishwa — ulisambaza kikosi cha vipengele vinne katika madimbwi, hivyo usumbufu wa dimbwi moja haungeweza kusimamisha kazi. Kipengele kimoja kilipokatizwa, vitatu vilivyobaki viliendelea kuchakata, na alama ilimaanisha kipengele cha mbadala kilichukua tu kazi ambayo kilichokatizwa kilikuwa katikati ya kuchakata. Mwanzo hadi mwisho, kazi haikukosa tena tarehe ya mwisho ya ripoti ya saa 1 asubuhi.

"Utofautishaji uligharimu nini katika ugumu?" Maya aliuliza, Leo alipoandika hili.

"Mistari mitatu ya ziada katika ombi la Spot Fleet," Leo alisema. "Msimbo wa uchakataji haujui wala haujali ni aina gani ya kipengele unaendeshwa. Ugumu unaishi kabisa katika usanidi wa kikosi, si katika programu."

Hiyo ndiyo ilikuwa faida ya kubuni programu kuwa bila hali tangu mwanzo: maamuzi ya kupanua ukubwa na ustahimilivu wa hitilafu yakawa maamuzi ya miundombinu, si maamuzi ya msimbo.


**Majeshi Maalum: Chaguo la Uzingatifu**

Baadhi ya leseni za programu (Oracle, Windows Server katika baadhi ya usanidi) zinalipiwa kwa soketi au msingi wa kimwili. Unapoendesha programu hii kwenye mwenyeji aliyeshirikiwa (chaguo-msingi kwa EC2), unaweza kuwa unalipa kwa uwezo usioutumia.

**Majeshi Maalum (Dedicated Hosts)** yanakupa ufikiaji kwa seva ya kimwili kabisa kwa matumizi yako. Unaweza kuleta leseni zako zilizopo za kwa kila soketi. Hakuna vipengele vya mteja mwingine wa AWS vinavyoendesha kwenye vifaa vile vile.

Majeshi Maalum ni ghali zaidi sana kuliko EC2 ya kawaida. Ni zana ya uzingatifu na leseni, si zana ya uimarishaji wa gharama.

Nimbus haikuwa na mahitaji ya leseni yaliyohitaji Majeshi Maalum. Programu nyingi zinazozaliwa na wingu hazihitaji.

**Tofauti: Wakati Kujitolea Kunaporudisha Madhara**

Ikiwa mzigo wako wa kazi unaweza kutabiriwa na ni thabiti kwa miezi 12, Vipengele Vilivyohifadhiwa vinatoa punguzo la juu zaidi — lakini ikiwa mahitaji yako ya aina ya kipengele yanaweza kubadilika kwa kiasi kikubwa wakati wa kipindi hicho, kufungwa huko kutakugharimu kubadilika kwa thamani zaidi ya tofauti ya bei. RI za Kubadilishwa zinatatua baadhi ya hayo, lakini kwa punguzo lililopunguzwa. Compute Savings Plans zinatatua sehemu kubwa yake, kwa punguzo la juu zaidi lililo chini kidogo kuliko Standard RI.

Ikiwa unatumia Vipengele vya Nafasi kwa kazi za kundi za ustahimilivu wa hitilafu, unaweza kufikia akiba ya 60-90% — lakini ikiwa vipengele vile vile vinahudumia maombi ya watumiaji wa moja kwa moja, usumbufu wa katikati ya ombi unamaanisha miamala iliyoshindwa na wateja wasioridhika. Ustahimilivu wa mzigo wa kazi kwa usumbufu ndiyo kigezo cha kuamua.

Kuna kisa cha hila zaidi cha chaguo baya: kujitolea kupita kiasi kwa Savings Plan. Ikiwa utanunua Compute Savings Plan ya $3.00/saa kwa sababu matumizi yako ya kompyuta yalikuwa na wastani wa $3.00/saa robo iliyopita, kisha ukaboresha huduma zako robo hii (kushusha matumizi ya jumla hadi $1.80/saa), unalipa $3.00/saa iliyojitolewa bila kujali. Pengo la $1.20/saa ni taka. (Kumbuka kwamba kuhamisha mizigo ya kazi ya EC2 kwenda Fargate au Lambda *hakungeacha* Compute Savings Plan — inafunika zote tatu. Hatari za kuacha ni kupungua kwa matumizi halisi, au kufungwa kwa familia na EC2 Instance Savings Plans na RI.) Hii ndiyo sababu mkakati wa sakafu ni muhimu: jitolee kwa kiwango chako cha chini, si wastani wako. Na pitia kila robo.

Kanuni: jitolee kwa kile unachokuwa na uhakika nacho. Tumia On-Demand kwa kile usichokuwa na uhakika nacho. Tumia Spot tu kwa kile kinachoweza kuishi kusimamishwa kwa nguvu.

**Kujenga Kikosi cha Mchanganyiko**

Mbinu iliyokomaa: tumia mifano mingi ya bei pamoja.

Kwa kikosi cha API cha Nimbus:

- **Mzigo wa msingi (vipengele 4, daima vikiendeshwa)**: Kimefunikwa na kujitolea kwa Savings Plan
- **Kilele kinachoweza kutabiriwa (vipengele 2 vya ziada wakati wa masaa ya kazi)**: Kimefunikwa na Savings Plan ikiwa kujitolea kunavifunika, vinginevyo On-Demand
- **Ziada ya mabadiliko ya trafiki**: Vipengele vya Nafasi (inakubalika kwa sababu seva za API hazina hali — maombi yanasambazwa upya kipengele kikikomeshwa)

Matokeo: kikosi kinachoboresha gharama katika kila tabaka — bei iliyojitolewa kwa sehemu inayoweza kutabiriwa, On-Demand kwa ukuaji usioweza kutabiriwa, Spot kwa uwezo wa mlipuko.

**Kufuatilia Matumizi ya Savings Plan**

Kununua Savings Plan si mwisho wa kazi. Ni mwanzo wa wajibu unaorudia: kujua kama kujitolea kunapatikana.

Tom aliweka kikumbusho cha kalenda kwa Jumatatu ya kwanza ya kila robo: mapitio ya matumizi ya Savings Plan. Zana ilikuwa AWS Cost Explorer. Hasa, kichupo cha "Savings Plans" chini ya "Reservations and Savings Plans," ambacho kilionyesha nambari tatu alizojali:

- **Kiwango cha matumizi**: Asilimia gani ya matumizi yaliyojitolewa kweli yalilinganishwa na matumizi yanayostahili? Nambari iliyo chini ya 100% ilimaanisha alikuwa akilipa kwa kujitolea ambako hakukuwa kukitumika.
- **Kiwango cha ufunikaji**: Asilimia gani ya matumizi yanayostahili ya EC2 yalikuwa yakifunikwa na Savings Plan, dhidi ya kuendesha kwa viwango vya On-Demand? Nambari iliyo chini ya 80% ilimaanisha kulikuwa na matumizi yasiyofunikwa ambayo kujitolea kukubwa zaidi kungenasa.
- **Matumizi ya On-Demand**: Sehemu ya matumizi ya EC2 isiyofunikwa na Savings Plan yoyote. Ikiwa hii ilikuwa ikikua, ama Savings Plan ilikuwa ndogo mno au mizigo mipya ya kazi iliongezwa nje ya wigo wa kujitolea.

Katika mapitio ya kwanza ya robo, nambari zilionekana hivi:

- Matumizi: 97%. Asilimia tatu ya matumizi yaliyojitolewa yalikuwa hayalingani — $9.90 kwa mwezi kwa kujitolea kwa $330/mwezi. Hiyo ilikuwa inakubalika; ilimaanisha kujitolea kiliwekwa juu kidogo ya matumizi halisi ya sakafu, jambo lililokuwa la makusudi.
- Ufunikaji: 84%. Asilimia kumi na sita ya matumizi yanayostahili ya EC2 yalikuwa yakiendesha On-Demand. Hiyo ilikuwa uwezo wa mlipuko — vipengele vya ziada vilivyozinduliwa wakati wa mabadiliko ya trafiki na visivyofunikwa na kujitolea.
- Matumizi ya On-Demand ya EC2: $147/mwezi. Vipengele vya Nafasi (havikufunikwa na Savings Plans, vilivyowekewa bei tofauti) viliwakilisha sehemu kubwa ya iliyobaki.

"Matumizi ya 97% ni ya afya," Tom alisema. "Inamaanisha hatujajitolea kupita kiasi. Ikiwa hii ingekuwa 80%, ningejua tumenunua kupita kiasi."

"Na ufunikaji wa 84%?" Maya aliuliza.

"Hiyo ni sawa pia. Asilimia 16 ambayo ni On-Demand ni uwezo wa mlipuko — vipengele vinavyoendesha kwa masaa wakati wa kilele, si siku nzima. Tungehitaji kununua kujitolea zaidi sana kwa Savings Plan ili kuvifunika, na huenda visihalalishi hilo." Aliendesha hesabu: vipengele vya On-Demand visivyofunikwa vilikuwa vikiendesha labda masaa 40 kwa mwezi kwa $0.101/saa kwa kila kipengele. Kuvifunika na Savings Plan kungehitaji kujitolea ambako tungekuwa tukikitumia chini ya 90% ya muda. Bora kuviacha On-Demand.

Katika mapitio ya pili ya robo, miezi sita ndani, kipimo kimoja kilikuwa kimebadilika: matumizi ya On-Demand ya EC2 yalikuwa yamekua hadi $290/mwezi. Kipengele cha Nimbus Instant kilikuwa kimezinduliwa, na vipengele kadhaa vipya vya huduma za usuli vilikuwa vimeongezwa bila Tom kutambua.

"Vipengele hivi vitatu," Tom alisema, akielekeza kwenye mchanganuo wa Cost Explorer. "Vimekuwa vikiendesha On-Demand kwa miezi mitatu. Ikiwa vitaendelea kuendesha, tunapaswa kuviongeza kwenye kujitolea kwa Savings Plan."

Mapitio ya robo yalikuwa yameinasa. Bila mapitio, vipengele hivyo vitatu vingeendelea kwa viwango vya kuingia bila kikomo.

"Unarekebishaje kujitolea?" Priya aliuliza.

"Unanunua Savings Plan mpya, ya ziada juu ya iliyopo," Tom alisema. "Savings Plans zinajirundika. Ningeongeza Compute Savings Plan ya $0.10/saa kwa msingi mpya. Mpango uliopo wa $0.45/saa unaendelea hadi muda wake wa miaka mitatu uishe. Mpango mpya unaanza muda wake wa miaka mitatu."

"Kwa hivyo tungekuwa na Savings Plans mbili zinazoingiliana."

"Ndiyo. Zinatumika kwa kujitegemea kwa matumizi yoyote yanayostahili yaliyopo. AWS inazilinganisha kwa mpangilio wa yenye manufaa zaidi hadi yenye manufaa kidogo."

"Je, tumefikiria nini hutokea ikiwa tutauza moja ya huduma hizi za usuli mwaka ujao?" Priya aliuliza. "Tumejitolea kwa $0.55/saa kwa miaka mitatu."

"Hiyo ni hatari ya muda wa miaka mitatu," Tom alisema. "Ndiyo sababu kujitolea kupya ni kidogo — ninajitolea kwa sakafu ya mizigo mipya ya kazi, si wastani. Ikiwa tutaondoa huduma moja na matumizi yashuke, huduma zilizobaki bado zinapaswa kutumia kiasi kamili kilichojitolewa."

Nidhamu ya mapitio ya robo haikuwa ya kuvutia. Ilikuwa dakika kumi na tano katika Cost Explorer, nambari tatu zilizokaguliwa, uamuzi uliofanywa au kuahirishwa. Lakini kwa miaka mitatu, nidhamu hiyo ilikuwa tofauti kati ya Savings Plan iliyotoa matumizi ya 90%+ — akiba halisi — na ile iliyoteleza kuwa taka ya sehemu wakati miundombinu ilipobadilika kuizunguka.

## Nguvu na Mipaka

**On-Demand**: Hakuna kujitolea. Bei kamili. Tumia kwa mizigo ya kazi isiyoweza kutabiriwa au ya muda mfupi.

**Vipengele Vilivyohifadhiwa**: Hadi punguzo la 72%. Zimefungwa kwa aina maalum ya kipengele/mkoa/OS. Uza uwezo usiotumika kwenye Soko la RI.

**Mipango ya Akiba**: Hadi punguzo la 66-72%. Yenye kubadilika zaidi kuliko RI (Compute Savings Plans zinatumika kwa aina yoyote ya kipengele). Matumizi ya kiotomatiki kwenye matumizi yanayolingana.

**Vipengele vya Nafasi**: Hadi punguzo la 90%. Hatari ya usumbufu wa dakika 2. Kwa mizigo ya kazi tu ya ustahimilivu wa hitilafu, bila hali, inayoweza kukatizwa.

**Majeshi Maalum**: Seva kamili ya kimwili. Ghali zaidi. Inahitajika kwa baadhi ya hali za leseni au uzingatifu.

## Muhtasari

Tom alitumia sehemu iliyobaki ya Jumamosi kuoanisha kila mzigo wa kazi wa Nimbus na mfano wake bora wa bei — msingi kwa Savings Plans, kazi za kundi za usiku kwa Spot, ziada isiyoweza kutabiriwa kwa On-Demand. Zoezi liligeuza miezi mitatu ya kulipa kiwango cha kuingia kuwa mkakati wa makusudi. Nambari, mara baada ya kuhesabiwa, zilikuwa ngumu kupuuza.

- Bei za EC2 zina mifano minne: **On-Demand** (bei kamili, hakuna kujitolea), **Vipengele Vilivyohifadhiwa/Mipango ya Akiba** (matumizi yaliyojitolewa kwa punguzo kubwa), **Spot** (uwezo wa ziada kwa 60-90% chini, unaoweza kukatizwa), **Majeshi Maalum** (haki maalum za seva ya kimwili).
- **Mipango ya Akiba** kwa ujumla hupendelewa zaidi kuliko Vipengele Vilivyohifadhiwa kwa kubadilika.
- **Vipengele vya Nafasi** vinahitaji mizigo ya kazi ya ustahimilivu wa hitilafu, bila hali — kwa kazi za kundi, mafunzo ya ML, na usindikaji unaoweza kukatizwa tu.
- **Uwekaji wa alama kwenye hifadhi imara** (S3) unahitajika kwa kazi za kundi zinazotegemea Spot — kazi zilizokatizwa zinapaswa kuendelea kutoka alama ya mwisho, si kuanza upya kutoka sifuri.
- **Utofautishaji wa Spot Fleet** katika aina nyingi za vipengele na AZ unapunguza hatari ya usumbufu na mara nyingi unatoa bei bora.
- Mkakati bora ni **kikosi cha mchanganyiko**: Savings Plans kwa msingi, On-Demand kwa ukuaji usioweza kutabiriwa, Spot kwa kazi ya kundi inayoweza kukatizwa.
- Pitia mifano ya bei mizigo ya kazi ikiendeshwa kwa utulivu kwa miezi 3+ — hiyo ndiyo wakati On-Demand inaanza kuwa taka.
- **Pitia kujitolea kwa Savings Plan kila robo** — jitolee kwa sakafu yako, si wastani wako, na rekebisha mifumo ya matumizi inavyobadilika.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.2)*

- **Mipango ya Akiba dhidi ya Vipengele Vilivyohifadhiwa**: Mipango ya Akiba ina kubadilika zaidi (inatumika kwa kipengele chochote cha EC2 kwa Compute Savings Plans). Vipengele Vilivyohifadhiwa vinafungwa kwa aina maalum ya kipengele. Hali za mtihani: "inahitaji kubadilika kwa juu zaidi huku ikipata mapunguzo" → Mipango ya Akiba. "Kujua aina haswa ya kipengele kwa miaka 3" → Standard RI kwa punguzo la juu zaidi.
- **Ishara za Spot**: "nyeti kwa gharama," "ustahimilivu wa hitilafu," "usindikaji wa kundi," "inaweza kushughulikia usumbufu," "mizigo ya kazi bila hali," "mafunzo ya ML" → Spot.
- **Kushughulikia usumbufu wa Spot**: Vipengele vya Spot vinapata onyo la dakika 2 kabla ya kukomeshwa. Programu yako lazima ishughulikie hili ipasavyo (hifadhi hali, maliza miunganisho, toka kwa usafi).
- **On-Demand dhidi ya Spot kwa seva za wavuti**: Seva za wavuti zinazohudumia trafiki ya mtumiaji wa moja kwa moja HAZIPASWI kutumia Spot (usumbufu husababisha maombi yaliyoshindwa). Tumia On-Demand au Mipango ya Akiba kwa tabaka la wavuti.
- **EC2 Savings Plans dhidi ya Compute Savings Plans**: EC2 Savings Plans zinatumika kwa familia maalum ya kipengele na mkoa (punguzo la juu). Compute Savings Plans zinatumika kwa kipengele chochote cha EC2, Lambda, na Fargate (punguzo la juu zaidi lililo chini, lenye kubadilika zaidi).
- **Soko la RI**: Vipengele Vilivyohifadhiwa vya Kawaida visivyotumika vinaweza kuuzwa kwa wateja wengine wa AWS. RI za Kubadilishwa haziwezi kuuzwa.
- **Hibernation:** Inahifadhi maudhui ya RAM kwenye sehemu ya mizizi ya EBS wakati wa kusimamisha; inayarejesha wakati wa kuanzisha. Kipengele kinaendelea haraka kuliko uanzishaji wa baridi na michakato yote na hali ikiwa salama. Tumia wakati hali ya kipengele lazima ihifadhiwe kati ya vipindi. Inahitaji: kuwezeshwa wakati wa uzinduzi (haiwezi kuongezwa kwa kipengele kilichopo), RAM ≤ GB 150, sehemu ya mizizi ya EBS iliyofichwa, haipatikani kwa vipengele vya bare-metal; kiwango cha juu cha siku 60 cha kuhibernate. Ishara ya mtihani: "endelea kipengele haraka huku hali ya kumbukumbu ikihifadhiwa" au "kipengele cha maendeleo kinachukua muda mrefu sana kuanzishwa" → Hibernation.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza wakati Vipengele vya Nafasi vinavyofaa na wakati visivyofaa. Ni sifa gani inayofanya mzigo wa kazi kufaa kwa Spot?

*(Kidokezo: Fikiria kinachotokea kipengele kikikomeshwa na notisi ya dakika 2. Mizigo gani ya kazi inarejea vizuri? Ipi hairejei?)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ya vyombo vya habari inaendesha mzunguko wa usimbaji video unaobadilisha video zilizopakiwa kuwa miundo mingi. Kazi za usimbaji zinaendesha mfululizo video zinapopakiwa (uendeshaji wa masaa 24/7, kiasi tofauti). Kila kazi inachukua dakika 5-30. Kazi ya usimbaji ikikatizwa, kazi inaweza kuanzishwa tena kutoka mwanzo bila kupoteza data. Kampuni inataka kupunguza gharama.

Mfano gani wa bei wa EC2 BORA unakidhi mahitaji haya?

A) Vipengele vya On-Demand katika Auto Scaling Group  
B) Vipengele Vilivyohifadhiwa (Mwaka 1, Malipo Yote Mapema)  
C) Vipengele vya Nafasi na Spot Fleet kwa utofautishaji wa kiotomatiki wa vipengele  
D) Majeshi Maalum yenye leseni za programu za vyombo vya habari zilizopo za kampuni

**Kidokezo cha 1**: "Inaweza kuanzishwa tena kutoka mwanzo bila kupoteza data" — hii ndiyo kifungu muhimu kinachowezesha mfano maalum wa bei.

**Kidokezo cha 2**: "Punguza gharama" na mzigo wa kazi unaoweza kukatizwa unaelekeza kwa chaguo la punguzo la juu zaidi.

**Kidokezo cha 3**: Spot Fleet inaomba vipengele kutoka aina nyingi za vipengele na AZ, kupunguza uwezekano wa usumbufu.

**Jibu**: C

**Maelezo**: Kazi za usimbaji ni za ustahimilivu wa hitilafu — zinaweza kuanzishwa tena zikikatizwa. Hii inazifanya kuwa bora kwa Vipengele vya Nafasi, ambavyo hutoa punguzo la 60-90% dhidi ya On-Demand. Spot Fleet inatofautisha katika aina za vipengele na Availability Zones, kupunguza uwezekano wa usumbufu wa wingi.

**Kwa nini si A?** On-Demand ni chaguo la gharama ya juu zaidi. Kwa mzigo wa kazi unaoendelea, wa ustahimilivu wa hitilafu, hii ni taka.

**Kwa nini si B?** Vipengele Vilivyohifadhiwa hutoa punguzo la 50-72% lakini hazitoi punguzo la uwezekano la 90% la Spot kwa mizigo ya kazi ya ustahimilivu wa hitilafu. Pia, RI ni kwa mizigo ya kazi inayoweza kutabiriwa, ya hali ya kudumu — Spot imetengenezwa mahususi kwa usindikaji wa kundi unaoweza kukatizwa.

**Kwa nini si D?** Majeshi Maalum ni kwa uzingatifu wa leseni, si uimarishaji wa gharama. Ni chaguo la ghali zaidi.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Miundombinu ya Nimbus ina mizigo ya kazi hii:

1. Seva za API: vipengele 6, vikiendeshwa masaa 24/7, imekuwa thabiti kwa miaka 2, tumia r6g.large
2. Kazi za uchambuzi za kundi za kila usiku: vipengele 4, vinaendesha saa 9 usiku-saa 12 asubuhi kila usiku, daima aina ile ile ya kipengele
3. Mazingira ya majaribio: vipengele 2, vinatumika na wahandisi saa 3 asubuhi-saa 12 jioni siku za wiki
4. Ziada ya mabadiliko ya trafiki: vipengele 0-8, vinazinduliwa wakati wa masaa ya kilele, haiwezi kutabiriwa kabisa

Buni mkakati bora wa bei kwa kila aina ya mzigo wa kazi. Kiasi gani cha kujitolea kwa Savings Plan kingefunika mizigo ya kazi 1 na 2? Kwa mzigo wa kazi 3, kuna mkakati wa akili zaidi kuliko On-Demand?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya mkakati wa bei za EC2.)*

## Tukio Baada ya Mikopo

Tom aliwasilisha ununuzi wa Savings Plan.

Kujitolea kwa $0.45/saa. Muda wa miaka mitatu. Compute Savings Plans kwa kubadilika.

Pamoja na Spot fleet kwa kazi ya kundi ya usiku, akiba iliyokadiriwa: $42,500 zaidi ya miaka mitatu — zaidi kidogo ya $14,000 kwa mwaka.

Maya alisoma nambari. "Dola elfu arobaini na mbili."

"Ikilinganishwa na kuendesha kila kitu On-Demand, zaidi ya miaka mitatu."

"Hii iligharimu nini kufanya?"

"Alasiri moja ya uchambuzi," Tom alisema. "Na uamuzi wa kujitolea."

"Miaka mitatu ni muda mrefu," Leo alisema. "Vipi ikiwa tutabadilisha aina za vipengele?"

"Compute Savings Plans zinatumika kwa aina yoyote ya kipengele cha EC2. Na kwa miaka mitatu, tuna ukubwa wa kutosha kwamba mazungumzo haya yanaonekana tofauti hata hivyo."

Leo alifikiri kuhusu hilo.

"Umejua kuhusu Savings Plans tangu lini?" aliuliza.

"Tangu tulipoanza," Tom alisema. "Nilikuwa nikisubiri mpaka mzigo wa kazi uwe thabiti vya kutosha kujitolea."

"Miezi kumi na nane ya kulipa On-Demand wakati wa kusubiri."

"Ndiyo." Tom alifunga koni. "Wakati mwingine jambo la ghali zaidi unalofanya ni kusubiri kuokoa pesa."

Katika sura inayofuata: nidhamu ile ile ikitumika kwa gharama za uhifadhi, na mishangao kadhaa kuhusu kile kinachoendesha bili.
