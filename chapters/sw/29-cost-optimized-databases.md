# Sura ya 29: Bili ya Hifadhidata

Tom alichapisha vipimo vya CloudWatch. Kurasa kumi na nne. Aliyatandaza juu ya dawati lake kabla ya kujiamini kusoma nambari. Bora kuona kila kitu kwa wakati mmoja kuliko kupata mishangao katikati ya ukurasa.

**Muhtasari wa Haraka: Uhifadhi Umekamilika, Hifadhidata Inayofuata**

Ukaguzi wa uhifadhi ulikuwa umetambua $6,700 katika taka iliyosanyika — si kutoka maamuzi mabaya, bali kutoka kukosa uangalifu. Kiasi visivyoambatishwa, picha za zamani, historia za matoleo ambazo hakuna aliyeiambia S3 kuzisafisha, upakiaji wa sehemu nyingi usiokamilika uliokuwa ukisanyika kimya kwa miezi. Tom alikuwa amerekebisha yote, ametekeleza sheria za usafishaji za kiotomatiki, na kuhamia kichupo kinachofuata katika lahajedwali. Tabaka la data lilikuwa kisichojulikana kikubwa zaidi kilichobaki: hifadhidata za uhusiano, jedwali za NoSQL, nodi za kache, uhifadhi wa nakala, na kipengee kimoja cha bili kilichokuwa kikimsumbua kwa wiki.

Vipengee vya bili vya tabaka la data vinavyopitiwa:

Nguzo ya Aurora: $647/mwezi.
Nakala za kusomwa za urithi za RDS PostgreSQL: $340/mwezi.
Jedwali za DynamoDB: $340/mwezi.
ElastiCache: $185/mwezi.
Picha za mkono za Aurora: $87/mwezi.

Jumla ya tabaka la data linalopitiwa: $1,599/mwezi.

"Niruhusu nielewe kila moja kabla ya kuamua chochote," alisema. "Kwa sababu hifadhidata si mahali pa kuokoa pesa kwa kukata pembe."

Hii ilikuwa busara. Usanidi mbaya wa hifadhidata unaosababisha upotevu wa data au kupungua kwa utendaji unagharimu zaidi sana kuliko akiba.

Fikiria hifadhidata kama injini ya gari. Unaweza kuokoa pesa kwenye gari kwa kubadilisha kuwa mafuta ya bei nafuu zaidi, kurekebisha shinikizo la mpira, na kuondoa uzito usio wa lazima kwenye sanduku la nyuma. Lakini ukijaribu kuokoa pesa kwa kuruka mabadiliko ya mafuta ya injini, una hatari ya kufunga injini — na injini iliyofungwa inagharimu zaidi sana kuliko akiba yoyote ya mafuta. Ukaguzi Tom anaokaribia kuufanya unafuata mantiki ile ile: tafuta taka kwenye sanduku la nyuma na tanki la mafuta, na acha injini peke yake mpaka ujue hasa unachofanya.

**Kuelewa Mzigo Wako wa Kazi wa Hifadhidata Kwanza**

Uimarishaji wa gharama katika hifadhidata unahitaji kuelewa mzigo wa kazi kabla ya kugusa chochote. Tom alikuwa amejifunza hili kutoka shindwa lililokaribia miezi sita mapema: alikuwa ameanza kupunguza ukubwa wa kipengele cha hifadhidata kwa kuzingatia wastani wa matumizi ya CPU — 18% — bila kwanza kuangalia nambari za p95. Mwenzake alikuwa amemwomba aangalie vipimo vya CloudWatch kwa makini zaidi. CPU ya p95 ilikuwa 61%, na wakati wa msongamano mzito hasa wa chakula cha jioni cha Ijumaa, ilikuwa imegonga 84%.

"Wastani haukuambii nini hutokea kwenye kilele," Tom alisema, alipomweleza Priya kuhusu hilo. "Ningepanga saizi sahihi hadi wastani, tungekuwa tumepunguzwa kasi usiku wa Ijumaa."

"Ndiyo sababu unaangalia p95, si wastani," Priya alisema. "Daima."

Kanuni hiyo ilienea zaidi ya CPU. Tom sasa alikuwa na orodha ya kawaida ya kabla-ya-ukaguzi:

- CPU: p95, si wastani
- Kumbukumbu: FreeableMemory (kwa baiti kamili, si asilimia) — tuko karibu kiasi gani na kikomo?
- Miunganisho: DatabaseConnections kiwango cha juu zaidi katika siku 30 zilizopita — tumefika karibu kiasi gani na kikomo cha miunganisho?
- Uwiano wa kusoma/kuandika: Unaamua kama nakala za kusomwa zinastahili gharama yake
- Kiwango cha ukuaji wa uhifadhi: GB ngapi kwa mwezi tunaongeza?
- Kuchelewa kwa kunakili (kwa nakala): Je, nakala inaendana?

Maswali muhimu:

- Matumizi ya wastani na ya kilele ya CPU ni nini?
- Uwiano wa kusoma/kuandika ni nini?
- Je, uhifadhi unakua, ni thabiti, au unapungua?
- Je, nakala za kusomwa zinatumika?
- Je, kipengele kimetolewa kwa kiwango kidogo (kinasababisha upungufu wa kasi) au kimetolewa kwa kiwango kikubwa (kinalipia uwezo usio na kazi)?

Tom alivuta vipimo vya CloudWatch kwa huduma zote tatu za hifadhidata zaidi ya siku 30 zilizopita:

**Nguzo ya Aurora**:

- Wastani wa CPU: 18% (p95: 61%; kilele: 84% Ijumaa jioni)
- FreeableMemory: kwa kawaida juu ya GB 4 kati ya GB 8 zinazopatikana. Si wasiwasi.
- Uwiano wa kusoma/kuandika: 14:1 (unaosomwa zaidi)
- Uhifadhi: 180GB (ukikua ~5GB/mwezi)
- DatabaseConnections kiwango cha juu zaidi: 312 kati ya 1,000 zinazopatikana. Cha starehe.

**Nakala za kusomwa (RDS PostgreSQL, tofauti na Aurora)**:

- Hizi zilikuwa nakala mbili za urithi za kusomwa za RDS zilizoundwa kabla ya uhamiaji wa Aurora, bado zinaendesha.
- Wastani wa miunganisho kwa kila moja: 2 kwa siku. Wastani wa CPU: 3%.
- FreeableMemory: GB 7.2 kati ya GB 8 zinazopatikana. Vipengele vilikuwa karibu visivyofanya kazi.

"Kwa nini hizi bado zinaendesha?" Tom aliuliza.

"Tayari niliziisambaza — lo," Leo alisema. Aliangalia tarehe za uundaji wa vipengele. "Zilikuwa kwa ajili ya kurudi nyuma wakati wa uhamiaji wa Aurora. Sikuzifuta kamwe."

Wakati huo — kitu ghali kinapokuwa kimeendesha kwa miezi bila kutumika — ni wa kawaida katika mazingira ya wingu. Leo alikuwa ameunda nakala kama wavu wa usalama. Wavu wa usalama haukuwahi kuhitajika. Lakini hakuna aliyeuliza swali mpaka sasa.

"Hali ya dimbwi la miunganisho ni gani?" Priya aliuliza, akiegemea ndani. "Kabla hatujazifuta, je, kuna vipengele vyovyote vya programu bado vinaelekeza masomo huko?"

Tom aliangalia logi za miunganisho. Miunganisho miwili kwa siku ilitoka kwa hati ya ufuatiliaji ambayo Priya alikuwa ameandika miezi kumi na nne iliyopita — ilipiga kura kwa vituo vyote vinavyojulikana vya hifadhidata kuthibitisha vinajibu. Nakala zilikuwa zikihojiwa tu na kikagua afya, si na trafiki yoyote halisi ya programu.

"Zifute," Maya alisema.

Nakala zilimalizwa. Akiba ya kila mwezi: $340.

**Shindwa la Karibu la Dimbwi la Miunganisho**

Wakati alipokuwa na vipimo vya miunganisho wazi, Tom aliendesha ukaguzi mpana zaidi katika vituo vyote vya hifadhidata. Kile alichopata kilimfanya asimame.

Kituo cha mwandishi cha Aurora kilionyesha DatabaseConnections kiwango cha juu zaidi cha 312. Cha starehe. Lakini kituo cha msomaji kilisimulia hadithi tofauti.

"Kituo cha msomaji kiligonga miunganisho 847 katika usiku tatu mfululizo wa Ijumaa," Tom alisema.

"Kikomo ni ngapi?" Priya aliuliza.

"Kikomo cha darasa letu la sasa la kipengele ni 1,000. Tulifika 847. Hiyo ni 85% ya kikomo."

"Na hatukugundua kwa sababu hatukuwa tumewekewa tahadhari mpaka 90%?" Maya aliuliza.

"Hatukuwa tumewekewa tahadhari kabisa," Tom alisema. "Hakuna tahadhari ya CloudWatch kwenye miunganisho ya kituo cha msomaji. Nilipata hili tu kwa sababu nilikuwa nikiangalia vipimo ghafi."

Kwa miunganisho 1,000, hifadhidata inakataa miunganisho mipya. Uzi wowote wa programu unaojaribu kupata muunganisho wa hifadhidata wakati huo unatupa isipokuwa. Ikiwa isipokuwa hiyo haishughulikiwi ipasavyo, mtumiaji anaona hitilafu ya 500.

"Tulikuwa sekunde thelathini mbali na tukio la usiku wa Ijumaa," Leo alisema. "Mara tatu mfululizo."

"Je, tumefikiria nini hutokea kiwango hicho cha mwisho kinapovukwa?" Priya aliuliza.

"Washirika wa migahawa wanaona maagizo yaliyoshindwa wakati wa msongamano wa chakula cha jioni," Maya alisema. "Hilo si wasiwasi wa kinadharia."

Tom aliweka tahadhari ya CloudWatch mara moja: tahadhari kwa miunganisho 750 (75% ya kikomo), ujumbe wa dharura kwa 900 (90%). Pia alitekeleza RDS Proxy kwa kituo cha msomaji — RDS Proxy hudimbwisha na kusimamia miunganisho ya hifadhidata kutoka tabaka la programu, ikimaanisha nyuzi hamsini za programu zinaweza kushiriki miunganisho kumi ya hifadhidata. Proxy inashughulikia ugawaji. Hifadhidata inaona miunganisho michache zaidi hata programu inapokuwa chini ya mzigo mzito.

"Kwa Aurora Serverless v2, RDS Proxy imewekewa bei ya $0.015 kwa kila ACU kwa saa, na malipo ya chini ya ACU 8 kwa kila proxy," Tom alisema. "Lakini ikiwa uvunjaji wa kikomo cha miunganisho utasababisha hata kukatika kwa sehemu moja usiku wa Ijumaa, gharama ya sifa kwa Nimbus ni ya kiwango cha juu zaidi mara nyingi."

"Hii inagharimu kiasi gani kwa mwezi?" Tom alijiuliza, akiendesha nambari. Msomaji wao unaendesha kwenye Serverless v2, hivyo proxy inalipisha dhidi ya chini ya ACU 8: $0.015 × 8 × 730 = $87.60/mwezi. Hiyo ilikuwa gharama aliyofurahi kuilipa.

Huenda unajiuliza: ikiwa tayari tunaokoa pesa na kupanua kiotomatiki kwa Serverless v2, kwa nini kujisumbua na Vipengele Vilivyohifadhiwa kwa tabaka lililotolewa? Jibu ni kwamba kupanua kwa Serverless v2 kuna gharama — unalipa kwa kila ACU-saa iwe umepanga au la. Kwa timu zinazoendesha usanidi uliowekwa wa Aurora, kujitolea kwa RI hubadilisha gharama inayobadilika kuwa gharama inayoweza kutabiriwa. Kwa timu zinazoendesha vipengele vilivyotolewa (si Serverless v2), tofauti hiyo ina umuhimu mkubwa.

**Vipengele Vilivyohifadhiwa vya RDS: Kwa Tabaka za Hifadhidata Zilizotolewa**

Kama EC2, RDS inatoa Vipengele Vilivyohifadhiwa kwa matumizi yaliyojitolewa.

Kwa timu zinazotumia usanidi uliowekwa wa vipengele vya Aurora (si Serverless v2), Vipengele Vilivyohifadhiwa vinaweza kuokoa 30-60%. Hivi ndivyo mbinu ya RI iliyotolewa inavyofanya kazi: unajitolea kwa aina maalum ya kipengele kwa miaka 1 au 3 kwa kubadilishana na punguzo kubwa kwenye kiwango cha kwa saa.

Kwa mfano: kipengele cha mwandishi cha db.r6g.large kwa $0.26/saa On-Demand kinaendesha $190/mwezi. Kipengele Kilichohifadhiwa cha mwaka 1 kwa kile kile kinapunguza hicho hadi takriban $108/mwezi — kuokoa $82/mwezi kwa kila kipengele, au karibu $1,000 kwa mwaka kwa kila kipengele cha hifadhidata.

**Aurora Serverless v2 dhidi ya Standard RI — Hatua ya Kufikia Usawa**

Tom aliendesha nambari kwa usanidi wao mahususi wa Aurora. Swali: je, kupanua kiotomatiki kwa Aurora Serverless v2 kulikuwa kunatoa manufaa ya kutosha, au kipengele kilichotolewa kilichowekwa chenye kujitolea kwa Kipengele Kilichohifadhiwa kingekuwa nafuu zaidi?

Bei za Serverless v2: $0.12 kwa kila ACU-saa. Nguzo yao ilipanua kati ya ACU 0.5 (haifanyi kazi) na ACU 16 (mzigo wa kilele). Katika siku 30 zilizopita, wastani ulikuwa ACU 4.2.

Gharama ya kila mwezi ya Serverless v2: ACU 4.2 × $0.12 × masaa 730 = $368/mwezi kwa mwandishi.

Linganisha: db.r6g.2xlarge iliyowekwa (sawa wao iliyokadiriwa iliyotolewa, iliyotolewa kushughulikia mzigo wa p95) yenye RI ya mwaka 1: $0.48/saa × 0.60 (punguzo la RI) × 730 = $210/mwezi.

"RI ni nafuu zaidi," Leo alisema.

"Kwa mzigo uliowekwa, ndiyo," Tom alisema. "Lakini angalia mtawanyiko. Kipindi chetu cha trafiki ndogo — saa 8 usiku hadi saa 1 asubuhi, Jumatatu hadi Alhamisi — kina wastani wa ACU 0.8. Kwenye kipengele kilichotolewa kilichowekwa, tungekuwa tukilipa kwa mara 8 ya kile tunachotumia wakati wa masaa hayo, kikiwa kimekaa tu bila kufanya kazi."

"Na Serverless v2 inapungua kulingana?"

"Hadi ACU 0.5. Gharama ya kutofanya kazi ni sehemu ndogo ya kile tungelipa kwa kipengele kilichotolewa kilichotolewa kwa kilele."

Hesabu ya hatua ya kufikia usawa: Serverless v2 ni nafuu wakati uwiano wako wa kilele/msingi uko juu ya takriban 4:1. Kwa Nimbus, na vilele vya Ijumaa kwa ACU 16 na vya chini vya asubuhi ya Jumatatu kwa ACU 0.8 — uwiano wa 20:1 — Serverless v2 ulikuwa chaguo sahihi. Ikiwa trafiki yao ingekuwa thabiti zaidi (sema, ACU 8 ± 20%), RI iliyotolewa ingekuwa nafuu zaidi.

"Si tu kuhusu nambari gani ni ndogo zaidi mwezi huu," Tom alisema. "Ni kuhusu mfano gani unaoshughulikia ukuaji wetu kwa usahihi. Tukikua 50% robo ijayo, Serverless v2 inapanua tu. RI iliyotolewa ingehitaji kupangwa upya saizi, na tungekuwa tukilipa kwa nafasi isiyotumika wakati wa mpito."

Tom alichora ulinganisho wa mwaka mzima kwa uwazi ili timu iweze kufuata hoja, si tu hitimisho.

**Gharama ya Aurora mwezi-kwa-mwezi: Serverless v2 dhidi ya RI iliyotolewa**

Chaguo lililotolewa: db.r6g.2xlarge yenye Kipengele Kilichohifadhiwa cha mwaka 1. Gharama: $0.48/saa On-Demand × 0.60 (punguzo la RI) × masaa 730 = $210/mwezi. Imewekwa, bila kujali mzigo.

Chaguo la Serverless v2: lipa kwa kila ACU-saa kwa $0.12. Inabadilika, ikifuatilia mzigo halisi.

Tom alivuta siku 30 za vipimo vya ACU vya Aurora Serverless v2 kutoka CloudWatch na akajenga usambazaji:

- Saa 8 usiku–saa 1 asubuhi, Jumatatu–Alhamisi (trafiki ndogo): wastani ACU 0.8 → $0.096/saa
- Saa 1 asubuhi–saa 5 asubuhi, siku za wiki (wastani): wastani ACU 3.2 → $0.384/saa  
- Saa 5 asubuhi–saa 3 jioni, siku za wiki (saa za biashara za kilele): wastani ACU 5.8 → $0.696/saa
- Ijumaa saa 12 jioni–saa 4 usiku (msongamano wa chakula cha jioni): wastani ACU 14.1 → $1.692/saa
- Jumamosi saa 6 mchana–saa 2 usiku (busy ya wikendi): wastani ACU 9.3 → $1.116/saa
- Jumapili (siku nyepesi zaidi): wastani ACU 2.1 → $0.252/saa

Wastani uliopimwa katika mwezi mzima: ACU 4.2 → $0.504/saa → $368/mwezi.

Kwa RI iliyotolewa: $210/mwezi. Serverless: $368/mwezi. Chaguo lililotolewa liliokoa $158/mwezi.

"Hiyo inaonekana dhahiri," Leo alisema. "Kwa nini tuko kwenye Serverless?"

"Kwa sababu $368 ni wastani," Tom alisema. "Angalia jioni za Ijumaa."

Ijumaa saa 12–saa 4 usiku: wastani wa ACU 14.1. Kwa dirisha hilo la masaa manne, Serverless inagharimu $1.692/saa. db.r6g.2xlarge iliyotolewa kwa $210/mwezi — uwezo wake wa juu zaidi — ilikuwa vCPU 8. Nguzo ya Serverless ilikuwa ikiendesha sawa na takriban vCPU 16 wakati wa dirisha hilo.

"Kipengele kilichotolewa kilichotolewa kwa kilele chetu cha Ijumaa kingekuwa db.r6g.4xlarge," Tom alisema. "Kwa kiwango cha RI, hiyo ni $0.96/saa × 0.60 = $0.576/saa. Kwa mwezi: $420/mwezi."

"Hiyo ni zaidi ya wastani wa Serverless wa $368," Maya alisema.

"Sahihi. Na tukitoa kipengele kilichotolewa kwa msingi wa siku ya wiki — db.r6g.2xlarge — usiku wa Ijumaa ungekuwa tatizo. Kwa mzigo wa kilele, tungekuwa tukisukuma sawa na ACU 14 kwenye kipengele cha vCPU 8. Hiyo ni kujaa kwa CPU."

"Kwa hivyo ungehitaji kutoa saizi mapema kwa kilele," Priya alisema.

"Kwa gharama ya kulipa kwa uwezo usio na kazi masaa mengine 160 ya wiki," Tom alisema. "Hesabu ya RI iliyotolewa inayotoka nafuu inafanya kazi tu wakati uwiano wako wa kilele/msingi uko chini. Wetu ni 20:1. Hiyo ni hasa hali ambayo Serverless v2 ilibuniwa kwa ajili yake."

Alionyesha nambari sambamba:

| Chaguo | Mwezi wa wastani | Usiku tulivu (saa 8 usiku) | Msongamano wa Ijumaa (saa 2 usiku) |
|---|---|---|---|
| Serverless v2 | $368 | $0.096/saa | $1.692/saa |
| RI iliyotolewa (r6g.2xl) | $210 | $210/saa730 = $0.288/saa | imefungwa — hatari ya kujaa |
| RI iliyotolewa (r6g.4xl) | $420 | $0.576/saa | nafasi ya starehe |

"Chaguo la Serverless ni $368," Tom alisema. "Chaguo lililotolewa lililopangwa saizi sahihi ni $420 — na hiyo ni kabla ya kuhesabu gharama ya uendeshaji ya kufuatilia na kupanua kwa mkono kipengele kilichotolewa wakati mifumo yetu ya trafiki inabadilika robo ijayo."

"Na gharama ya uendeshaji," Priya alisema, "si sifuri."

"Hapana. Kwa Serverless, hatuhitaji kufikiria juu ya ukubwa wa kipengele. Aurora inashughulikia. Kwa iliyotolewa, kila robo ningehitaji kutathmini upya kama darasa la sasa la kipengele bado linafaa trafiki yetu. Hiyo si ghali kwa muda, lakini ni kitu kinachoweza kwenda vibaya tukiacha kuzingatia."

"Itakuwa sawa maadamu hatusahau kuipanga upya saizi," Leo alisema, na kisha akajinasa. "Ambao ndio hasa wakati ambapo haitakuwa sawa."

"Hasa," Tom alisema.

Hitimisho lilishikilia: Serverless v2 kwa $368/mwezi ulikuwa chaguo sahihi kwa uwiano wa kilele/msingi wa 20:1 wa Nimbus na upendeleo wa timu yake kwa urahisi wa uendeshaji. RI iliyotolewa ilikuwa ya kuvutia tu kwa timu zenye trafiki isiyobadilika kwa kiasi kikubwa — uwiano wa 2:1 au 3:1 ambapo kipengele kilichotolewa kilikuwa nadra kufanya kazi.

"Ni nini kingetufanya tubadilike kwenda iliyotolewa?" Maya aliuliza.

"Ikiwa muundo wetu wa trafiki ungelainika," Tom alisema. "Ikiwa Nimbus ingekua hadi mahali ambapo msingi wa trafiki ndogo pia ulikuwa juu — sema, ACU 8 saa 8 usiku badala ya ACU 0.8 — uwiano ungeshuka hadi 2:1 na iliyotolewa ingeleta maana ya kiuchumi. Hilo ni tatizo tofauti la biashara. Moja ambalo tungependa kuwa nalo."


Kwa Aurora yenye Serverless v2, Vipengele Vilivyohifadhiwa havitumiki moja kwa moja — Serverless v2 inapanua kwa nguvu na unalipa kwa kila ACU-saa. Huu ndio usanidi wa sasa wa Nimbus: mwandishi wa msingi wa Aurora na msomaji wote wanatumia Serverless v2. Akiba kwa Nimbus inakuja kutoka asili ya kupanua kiotomatiki ya Serverless v2 yenyewe — hulipi kwa uwezo usio na kazi trafiki inapokuwa ndogo.

Timu bado zinazoendesha vipengele vilivyowekwa vya Aurora zinapaswa kutathmini kujitolea kwa RI mara aina ya kipengele inapokuwa thabiti kwa miezi mitatu au zaidi.

**DynamoDB: On-Demand dhidi ya Iliyotolewa**

Katika Sura ya 9, tulianzisha hali mbili za uwezo wa DynamoDB: on-demand na iliyotolewa.

Nimbus ilikuwa ikiendesha DynamoDB katika hali ya on-demand tangu mwanzo. Kwa trafiki ndogo, hii ilikuwa sahihi — on-demand ni ghali zaidi kwa kila ombi lakini haina malipo ya kiwango cha chini.

Sasa, na miezi 18 ya data ya trafiki katika CloudWatch, Tom angeweza kuona mifumo.

Wastani wa maombi ya kusoma: 225 kwa sekunde (takriban milioni 19.4 kwa siku)
Wastani wa maombi ya kuandika: 60 kwa sekunde (takriban milioni 5.2 kwa siku)
Siku ya kilele (Ijumaa): 180% ya wastani wa maombi ya DynamoDB (ElastiCache inafyonza ~95% ya masomo, hivyo DynamoDB inaona sehemu ndogo tu ya mlipuko wa jumla wa 25x wa kiwango cha agizo)

**Bei za on-demand**: $1.25 kwa kila maombi milioni ya kuandika, $0.25 kwa kila maombi milioni ya kusoma.
**Bei za iliyotolewa**: $0.00065 kwa kila kitengo cha uwezo wa kuandika kwa saa, $0.00013 kwa kila kitengo cha uwezo wa kusoma kwa saa.

Tom alihesabu hatua ya kufikia usawa: uwezo uliotolewa unakuwa nafuu zaidi unapotumiwa kwa utulivu vya kutosha kwamba hulipi ada ya juu ya on-demand wakati wa vipindi vya kutofanya kazi.

(Tahadhari kuhusu nambari katika sehemu hii: zinaonyesha bili ya timu wakati huo, na ni za kielelezo. Mwishoni mwa 2024, AWS ilipunguza bei za on-demand za DynamoDB kwa 50%, jambo lililohamisha hatua ya kufikia usawa kwa kiasi kikubwa — leo, uwezo uliotolewa unashinda tu wakati matumizi ni ya juu kwa utulivu. Daima fanya tena hesabu hii kwa bei za sasa.)

Na miezi 18 ya data inayoonyesha mifumo ya kila siku thabiti, uwezo uliotolewa na **DynamoDB Auto Scaling** ulikuwa chaguo sahihi:

- Weka uwezo wa chini kwa 60% ya wastani wa mzigo
- Weka kiwango cha juu kwa 250% ya wastani (kushughulikia vilele vya Ijumaa)
- Auto Scaling hurekebisha uwezo uliotolewa kati ya mipaka hii

Gharama ya kila mwezi ya DynamoDB: ilishuka kutoka $340 (on-demand) hadi $230 (iliyotolewa na kupanua kiotomatiki). Kupungua kwa 32%.

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza. "Tumekuwa kwenye on-demand tangu mwanzo kwa sababu hatukuamini mifumo yetu wenyewe ya trafiki. Nini kilibadilika?"

"Miezi kumi na nane ya data," Tom alisema. "Sasa tunajua mifumo yetu inavyoonekana — msingi thabiti wa siku ya wiki, vilele vya Ijumaa, vipindi tulivu vya Jumapili. On-demand ulikuwa uamuzi sahihi tulipokuwa hatujui. Iliyotolewa na Auto Scaling ni uamuzi sahihi sasa tunapojua."

"Lakini tukitoa kwa kiwango kikubwa zaidi," Leo aliuliza, "tunalipa kwa uwezo usio na kazi."

"Hiyo ndiyo hatari," Tom alisema. "Na Auto Scaling, tunaweka kiwango cha chini juu vya kutosha kuepuka kupunguzwa kwa kasi, na kuruhusu AWS kusimamia ndani ya mwelekeo wetu."

"Na ikiwa muundo wetu wa trafiki utabadilika kwa kiasi kikubwa?"

"Kisha tunarekebisha mipaka. Tunapitia hili kila robo."

**ElastiCache: Kupanga Saizi Sahihi na Hadithi ya Tahadhari**

Bili ya ElastiCache: $185/mwezi. Kipengele kimoja cha cache.r6g.large cha Redis katika kila AZ (nodi mbili, msingi + nakala).

Vipimo vya CloudWatch vilionyesha:

- Wastani wa matumizi ya kumbukumbu: 34%
- Kilele: 58%

Kipengele kilikuwa kimetolewa kwa kiwango kikubwa zaidi. cache.r6g.medium pengine ingeshughulikia mzigo na nafasi.

Lakini hapa Tom alisita. Alikumbuka kilichotokea katika kampuni iliyotangulia alipopanga saizi sahihi kache kwa ukali — na akaiambia timu hadithi kamili, kwa sababu ilikuwa aina ya hadithi inayohitaji kusimuliwa kabla hujajikuta katikati yake.

Katika kampuni yake ya awali — jukwaa la SaaS kwa ripoti za kifedha — nguzo ya ElastiCache ilikuwa cache.r6g.large. Nodi mbili, msingi na nakala. Wastani wa matumizi ya kumbukumbu: 31%. Kilele kilichoonekana: 54%. Mhandisi wa zamu aliyekiweka alama alikuwa amefanya hesabu: cache.r6g.medium ingeshughulikia mzigo na nafasi ya 25% juu ya kilele kilichoonekana. Akiba: $60/mwezi — bei katika mkoa wa kampuni hiyo na kizazi cha nodi wakati huo, ndogo kuliko pengo sawa katika Nimbus leo. Mabadiliko yalipitishwa Jumanne.

Mwezi uliofuata, Alhamisi jioni saa 5:47 usiku, kundi la utatuzi wa mwisho-wa-mwezi lilianza.

Kundi la utatuzi liliendesha kila robo. Lilivuta rekodi za miamala za kila akaunti hai kwa miezi mitatu iliyotangulia, likazikusanya, likahesabu kodi, na likaandika rekodi za utatuzi. Kache ilitumika kuhifadhi hali ya makusanyo ya kati — jumla inayoendesha ya kila akaunti kadiri kundi lilivyoendelea. cache.r6g.large daima ilikuwa imeishughulikia. Hakuna aliyekuwa ameangalia vipimo vya kundi la utatuzi mahususi alipofanya uamuzi wa kupanga saizi sahihi, kwa sababu kundi lilikuwa la robo mwaka na dirisha la uchunguzi lilikuwa wiki nne.

Kwenye kipengele cha medium, maxMemoryPolicy iliwekwa kwa `allkeys-lru` — kumbukumbu ilipojaa, Redis ingetoa ufunguo uliotumika kwa muda mrefu zaidi ili kutoa nafasi. Hiyo ndiyo sera sahihi kwa kache ya jumla. Lakini kwa kundi la utatuzi, kila ufunguo katika kache ulihitajika kikamilifu. Kumbukumbu ilipojaa kwa 84% ya GB 6.38 za kipengele cha medium, Redis ilianza kutoa funguo. Kila utoaji ulikuwa kukosa kache. Kila kukosa kache kulituma hoji kwa hifadhidata ya msingi ya PostgreSQL kuhesabu upya thamani iliyotolewa kutoka rekodi ghafi za miamala.

Dimbwi la miunganisho ya hifadhidata lilisanidiwa kwa trafiki ya hali ya kudumu, si mzigo wa kundi la utatuzi. Ndani ya dakika nne za utoaji kuanza, hifadhidata ilikuwa na miunganisho hai 847. Kikomo cha miunganisho kilikuwa 1,000. Saa dakika 9, nyuzi za kwanza za programu zilianza kuona hitilafu za "miunganisho mingi mno." Saa dakika 12, huduma tatu zilizoshiriki dimbwi la miunganisho ya hifadhidata — kundi la utatuzi, huduma ya ripoti za wakati halisi, na API inayoelekeza wateja — zote ziliathiriwa.

Mhandisi wa zamu aliongeza tatizo saa 5:59 usiku. Mapitio ya tukio yalianza saa 6:08 usiku.

Jibu la kwanza: ongeza muda wa kuisha wa Lambda kwa kazi ya kundi la utatuzi (kundi la utatuzi lilikuwa kwa sehemu lililotegemea Lambda). Hili lilikuwa kosa. Muda wa kuisha haukuwa tatizo.

Jibu la pili: ongeza kazi ya pili ya Lambda kufananisha kundi la utatuzi. Pia kosa. Ufananishaji zaidi ulimaanisha ufikiaji wa kache wa wakati mmoja zaidi, ambao ulimaanisha utoaji wa haraka zaidi, ambao ulifanya hali kuwa mbaya zaidi.

Jibu la tatu: punguza ukubwa wa kundi la utatuzi ili kupunguza shinikizo la hifadhidata. Hili lilisaidia kidogo lakini halikushughulikia chanzo cha tatizo.

Jibu la nne, saa 8:31 usiku: rejesha cache.r6g.large. Shinikizo la kumbukumbu lilishuka mara moja. Utoaji ulisimama. Dimbwi la miunganisho ya hifadhidata lilisafishwa. Kundi la utatuzi lilikamilika saa 10:17 usiku, lilichelewa kwa zaidi ya masaa manne.

Jumla ya tukio: masaa manne ya utendaji wa API uliopungua kwa wateja waliojaribu kufikia ripoti. Kundi moja kamili la utatuzi lilichelewa. Muda wa uhandisi: takriban masaa 22 katika wahandisi watano. Gharama ya moja kwa moja iliyokadiriwa: $40,000.

Akiba ya $60/mwezi ilikuwa imegharimu $40,000 katika tukio moja.

"Kosa halikuwa uamuzi wa kupanga saizi sahihi," Tom alisema. "Uamuzi uliweza kutetewa kwa kuzingatia data iliyopatikana. Kosa lilikuwa dirisha la uchunguzi. Tulipima vipimo vya wiki nne. Kundi la utatuzi lilikuwa la robo mwaka. Tulikuwa tukiangalia muda usio sahihi."

"Kwa hivyo unaepukaje hilo?" Maya aliuliza.

"Unauliza: ni operesheni gani ya hatari ya juu zaidi kache hii inaisaidia? Na unapata vipimo mahususi vya operesheni hiyo. Si wiki ya wastani. Wiki mahususi — au mwezi — au robo — ambapo mzigo ni wa juu zaidi. Na unatoa saizi kwa ajili ya hiyo."

"Na ikiwa huwezi kupata vipimo kwa sababu operesheni ni nadra?"

"Hilo ndilo jibu," Tom alisema. "Ikiwa huwezi kupata vipimo kwa hali mahususi ya mzigo wa juu, jibu sahihi ni kutopanga saizi sahihi bado. Subiri tukio linalofuata, liwekee vyombo vya kupima kwa nguvu, kisha utoe saizi kwa kuzingatia kile ulichoona."

Nguzo ya ElastiCache ya Nimbus ilikuwa na operesheni yake ya hatari ya juu: msongamano wa chakula cha jioni cha Ijumaa. Tom alikuwa na data hiyo — usiku tatu mfululizo wa Ijumaa ulikuwa umegonga matumizi ya kumbukumbu ya 58% kwenye r6g.large. Ikiwa angehamia r6g.medium na kitu katika mzunguko wa uchakataji wa maagizo kingebadilika kutumia nafasi zaidi ya kache — kipengele kipya, mkakati tofauti wa kuhifadhi kache — hiyo 58% ingeweza kuwa 80%, na 80% kwenye medium ni eneo la utoaji.

Aliendesha nambari hata hivyo. Kuhamia kutoka r6g.large hadi r6g.medium: nodi mbili kwa $0.127/saa dhidi ya nodi mbili kwa $0.065/saa, zikiendesha masaa 730 kwa mwezi. Large: $185/mwezi. Medium: $95/mwezi. Akiba inayoweza kupatikana: $90/mwezi. Alijaribu kipengele cha medium katika hatua ya kujaribu kwa wiki mbili chini ya mzigo. Kumbukumbu ilifikia kilele cha 71% — karibu vya kutosha na kikomo kwamba alihisi wasiwasi.

Kisha alipanga bei mbadala: hifadhi cache.r6g.large, lakini nunua Nodi Zilizohifadhiwa (kujitolea kwa mwaka 1). Kutoka On-Demand $185 hadi Zilizohifadhiwa $120/mwezi. Akiba: $65/mwezi bila kubadilisha aina ya kipengele.

"$65/mwezi ningeokoa kwa Nodi Zilizohifadhiwa kwa ukubwa ule ule wa kipengele ni akiba halisi," Tom alisema. "$90/mwezi ningeokoa kwa kwenda medium ni uchumi wa uongo ikiwa unahatarisha msongamano wa chakula cha jioni cha Ijumaa. Wakati mwingine kupanga saizi sahihi hadi kipengele kidogo kunahatarisha tukio la utendaji — Nodi Zilizohifadhiwa zinatupa sehemu kubwa ya akiba bila hatari yoyote."

Alinunua Nodi Zilizohifadhiwa kwa r6g.large.

"Tofauti ya $25 katika akiba ya kila mwezi," Tom alisema, "haistahili tukio la usiku wa Ijumaa."

**Uhifadhi wa Nakala za RDS: Biashara ya Mbadala ya Uhifadhi**

Nakala za kiotomatiki za RDS zinahifadhiwa katika S3 (bila ada ya ziada ya uhifadhi hadi 100% ya ukubwa wa hifadhidata yako). Uhifadhi wa chaguo-msingi ni siku 7.

Kwa hifadhidata ya Aurora ya GB 180 ya Nimbus, nakala za siku 7 zilifaa — walikuwa wameweza kurejesha kutoka nakala ndani ya dirisha hilo katika majaribio.

Lakini Tom aligundua: pia walikuwa na picha za mkono kutoka kila usambazaji mkubwa, zilizohifadhiwa bila kikomo.

Picha 23 za mkono, jumla ya uhifadhi wa TB 4.1 za picha.
Gharama: $0.021/GB/mwezi kwa uhifadhi wa nakala za Aurora = takriban $87/mwezi katika uhifadhi wa picha za mkono.

Walihifadhi picha 3 za mwisho za mkono kwa kila mazingira (uzalishaji, hatua ya kujaribu). Walifuta iliyobaki — takriban TB 1.1 zilizohifadhiwa.
Akiba: $64/mwezi.

"Tulikuwa tukilipa $64 kwa mwezi kwa bima ambayo hatukuwahi kuitumia," Leo alisema.

"Tulikuwa tukilipa kwa amani ya akili," Tom alisahihisha. "Swali ni: ni kiasi gani cha amani ya akili kinastahili $64 kwa mwezi?"

"Na mpango sahihi wa uokoaji wa maafa," Priya alisema, "unaweza kupata amani ile ile ya akili kutoka siku 7 za nakala za kiotomatiki na picha 3 za mkono."

"Kukubaliana. Sasa."

**Tofauti: Wakati Iliyotolewa Inaporudisha Madhara**

Ikiwa muundo wako wa trafiki ni thabiti na unaweza kutabiriwa, uwezo uliotolewa na Auto Scaling unaokoa 30% juu ya on-demand. Lakini ikiwa kipengele kipya kitazinduliwa na kiwango chako cha kuandika kipanda mara 5 usiku kucha, utapunguzwa kwa kasi kabla Auto Scaling haijapata wakati — Auto Scaling huitikia trafiki iliyoonekana, jambo linalomaanisha kuna kuchelewa. Kuweka hali ya on-demand kwa wiki zinazozunguka uzinduzi mkubwa wa kipengele ni biashara ya mbadala inayofaa: gharama ya juu kidogo, hakuna hatari ya kupunguzwa kwa kasi wakati wa kipindi ambapo unaangalia mifumo ya trafiki ikibadilika kwa wakati halisi.

Ikiwa utaondoa nakala za kusomwa zisizotumika (kama nakala za urithi za PostgreSQL za Nimbus), akiba ni za papo hapo na zisizo na utata — hakuna biashara ya mbadala, kwa sababu nakala hazikuwa zikitoa thamani yoyote. Lakini ikiwa unashawishika kuondoa nakala ya kusomwa inayoshughulikia 2% tu ya trafiki, angalia nini hutokea kwa ya msingi wakati hiyo 2% haina pa kwenda wakati wa kilele. Baadhi ya nakala za kusomwa zipo kwa nafasi, si kwa mzigo wa sasa.

**Muhtasari wa Uimarishaji wa Hifadhidata**

| Huduma                                            | Kabla      | Baada    | Akiba ya Kila Mwezi |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 iliyohifadhiwa baada ya uchambuzi) | $647       | $647     | $0 (mfano sahihi) |
| Nakala za Kusomwa za RDS (zisizotumika)           | $340       | $0       | $340           |
| DynamoDB (On-Demand -> Iliyotolewa + Auto Scaling) | $340       | $230     | $110           |
| ElastiCache (Nodi Zilizohifadhiwa)                | $185       | $120     | $65            |
| Picha za mkono za Aurora                          | $87        | $23      | $64            |
| RDS Proxy (usalama wa miunganisho)                | $0         | $88      | -$88           |
| **Jumla**                                         | **$1,599** | **$1,108** | **$491/mwezi** |

$491 kwa mwezi katika akiba za hifadhidata. $5,892 kwa mwaka.

Tom aliweka nambari hii karibu na usafishaji wa uhifadhi ($6,200/mwaka), sera za mzunguko wa maisha za S3 kutoka Sura ya 23 ($7,800/mwaka), na akiba za Savings Plan ($14,200/mwaka).

Jumla ya athari ya uimarishaji hadi sasa: $34,092/mwaka.

"Hiyo ni njia halisi ya kuendesha," Maya alisema.

"Au majaribio kadhaa makubwa," Priya alisema.

"Au miezi kumi na mbili ya majaribio," Leo alisema.

Wote watatu walikuwa sahihi.

## Nguvu na Mipaka

**DynamoDB Iliyotolewa na Auto Scaling**:

- Nafuu zaidi kuliko on-demand kwa mizigo ya kazi inayoweza kutabiriwa, thabiti
- Auto Scaling inashughulikia utofauti bila kutoa kwa kiwango kikubwa kwa kudumu
- Inahitaji ufuatiliaji ili kuhakikisha mipaka ya uwezo inabaki sahihi

**Vipengele Vilivyohifadhiwa vya RDS / Nodi Zilizohifadhiwa za ElastiCache**:

- Akiba kubwa kwa mizigo ya kazi thabiti, ya muda mrefu
- Kujitolea kumefungwa — mahitaji yako yakibadilika, umelipa kwa uwezo usio na kazi
- Tofauti na EC2 Standard RIs, RDS RIs **haziwezi** kuuzwa tena kwenye Soko la Vipengele Vilivyohifadhiwa — Soko ni la EC2 pekee. RDS RI isiyotumika ni gharama iliyozama, jambo linalofanya uamuzi wa kupanga saizi kuwa muhimu zaidi

**Kanuni ya jumla**:

- Daima elewa matumizi kabla ya kuboresha — tumia p95, si wastani
- Rasilimali zisizotumika (kama nakala za urithi za kusomwa) ni uimarishaji wa faida ya juu zaidi
- Kupanga saizi sahihi kunahitaji kuthibitisha katika hatua ya kujaribu kabla ya kutumika kwa uzalishaji, na kuangalia mifumo ya mzigo wa kazi wa msimu ambayo inaweza isionekane katika dirisha la kawaida la uchunguzi
- Bei zilizohifadhiwa zinahitaji imani katika uthabiti wa mzigo wa kazi

## Muhtasari

- **Ukaguzi kwanza**: Vuta vipimo vya CloudWatch kabla ya kufanya mabadiliko yoyote ya hifadhidata. Tumia muda wa kuchelewa wa p95 na CPU ya p95 — si wastani. Angalia FreeableMemory na viwango vya juu vya miunganisho.
- **Futa rasilimali zisizotumika**: Nakala za kusomwa, hifadhidata zisizofanya kazi, na vipengele vya majaribio ambavyo havihitajiki tena.
- **Angalia dimbwi lako la miunganisho**: Weka tahadhari kwenye DatabaseConnections kwa 75% na 90% ya kikomo. Zingatia RDS Proxy kwa ugawaji wa miunganisho.
- **DynamoDB On-Demand dhidi ya Iliyotolewa**: On-Demand kwa trafiki isiyoweza kutabiriwa; Iliyotolewa + Auto Scaling kwa mifumo thabiti.
- **Kupanga saizi sahihi kwa ElastiCache**: Jaribu katika hatua ya kujaribu chini ya mizigo halisi ya kilele, ikiwa ni pamoja na vilele vya msimu. Nodi Zilizohifadhiwa zinatoa akiba kwa ukubwa ule ule wa kipengele wakati upunguzaji wa ukali una hatari.
- **Usimamizi wa picha za RDS**: Hifadhi tu picha unazohitaji. Picha za mkono zinahifadhiwa bila kikomo isipokuwa zikifutwa.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.3)*

- **Hali za bei za DynamoDB**: On-Demand = lipa kwa ombi (gharama ya juu kwa kila kitengo, hakuna malipo ya kiwango cha chini). Iliyotolewa = lipa kwa kitengo cha uwezo kwa saa (gharama ya chini kwa kila kitengo, lazima ugawe uwezo). **DynamoDB Auto Scaling** hurekebisha kiotomatiki uwezo uliotolewa.
- **Vipengele Vilivyohifadhiwa vya RDS**: Vinapatikana kwa aina zote za injini za RDS. Usambazaji wa Multi-AZ unaweza kutumia Vipengele Vilivyohifadhiwa (unajitolea kwa Multi-AZ). Muda wa mwaka 1 au 3.
- **Nodi Zilizohifadhiwa za ElastiCache**: Mfano sawa wa kujitolea kama Vipengele Vilivyohifadhiwa vya EC2. Inatumika kwa kila nodi, si kwa nguzo.
- **Uhifadhi wa picha za RDS**: Nakala za kiotomatiki ni bure hadi 100% ya ukubwa wa hifadhidata. Picha za mkono zinatozwa kwa GB kwa mwezi katika S3. Hali ya mtihani: "punguza gharama za uhifadhi wa RDS" → futa picha za zamani za mkono.
- **Uwezo uliohifadhiwa wa DynamoDB**: Unapatikana pia kwa DynamoDB (ujitolee kwa uwezo maalum wa kusoma/kuandika kwa miaka 1 au 3 kwa punguzo). Tofauti na iliyotolewa ya kawaida — unalipa mapema kwa uwezo katika jedwali zako zote za DynamoDB katika mkoa.
- **Aurora Serverless v2 dhidi ya iliyotolewa**: Serverless v2 hupanua kiotomatiki, bora kwa mizigo ya kazi inayobadilika. Iliyotolewa na Vipengele Vilivyohifadhiwa ni nafuu zaidi kwa mizigo ya kazi thabiti, inayoweza kutabiriwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza ni lini unapaswa kutumia uwezo wa on-demand wa DynamoDB dhidi ya uwezo uliotolewa na Auto Scaling. Unahitaji taarifa gani kufanya uamuzi huu?

*(Kidokezo: Fikiria maana ya "kuweza kutabiriwa" kwa suala la data ya trafiki, na hatari gani on-demand inaondoa ambayo iliyotolewa inaanzisha.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni inaendesha jedwali la DynamoDB kwa bodi ya alama za mchezo wa simu. Trafiki ni thabiti sana mwaka mzima, isipokuwa wakati wa tukio la msimu ambalo limepangwa miezi mapema (wiki moja kwa robo, likifikia trafiki ya mara 10 ya kawaida wakati wachezaji wanapojiunga katika siku ya kwanza). Kipaumbele cha kampuni ni kupunguza gharama za hifadhidata wakati wa vipindi virefu, vinavyoweza kutabiriwa vya hali ya kudumu huku ikidumisha utendaji katika wiki za tukio zinazojulikana.

Mkakati gani wa uwezo wa DynamoDB BORA unakidhi mahitaji haya?

A) Uwezo wa on-demand kushughulikia vilele vya msimu bila kupunguzwa kwa kasi  
B) Uwezo uliotolewa uliowekwa kwa viwango vya kilele vya msimu (daima umetolewa kwa trafiki ya mara 10)  
C) Uwezo uliotolewa na DynamoDB Auto Scaling, na uwezo wa juu uliowekwa kwa kilele cha msimu  
D) Vitengo vya uwezo vilivyohifadhiwa vya DynamoDB kwa miaka 3 kwa viwango vya trafiki ya kawaida

**Kidokezo cha 1**: "Trafiki thabiti sana isipokuwa kwa kilele cha msimu kilichopangwa, kinachojulikana" — hali gani inashughulikia zote mbili kwa ufanisi? (Nguvu ya on-demand ni trafiki *isiyoweza kutabiriwa*; trafiki hii inaweza kutabiriwa.)

**Kidokezo cha 2**: "Punguza gharama" wakati wa nje ya kilele kunamaanisha huwezi kutoa kwa kiwango kikubwa zaidi kwa mara 10 wakati wote.

**Kidokezo cha 3**: DynamoDB Auto Scaling inaweza kupanda juu kwa tukio la msimu na kupungua tena baadaye.

**Jibu**: C

**Maelezo**: Uwezo uliotolewa na Auto Scaling hupanua jedwali kulingana na trafiki halisi. Wakati wa vipindi vya kawaida, uwezo uko katika viwango vya kawaida (gharama ndogo). Wakati wa tukio la msimu — ambalo tarehe zake zinajulikana mapema na ambalo trafiki yake hujengeka taratibu katika siku ya kwanza — Auto Scaling hufuatilia ongezeko hadi kiwango cha juu kilichosanidiwa (kushughulikia kilele cha mara 10), na timu inaweza pia kuinua kiwango cha chini kabla ya kuanza kuliopangwa kama nafasi ya ziada. Baada ya tukio, uwezo hupungua tena. Hii ni nafuu zaidi kuliko on-demand wakati wa hali ya kudumu inayotawala mwaka (on-demand inagharimu zaidi kwa ombi) na nafuu zaidi kuliko kutoa daima kwa mara 10.

**Kwa nini si A?** On-demand inashughulikia vilele bila kupunguzwa kwa kasi, lakini nguvu yake ni trafiki *isiyoweza kutabiriwa*. Hapa trafiki ni thabiti sana na kilele kimepangwa na kinajengeka taratibu — kulipa ada ya juu ya on-demand kwa kila ombi kwa ~92% ya mwaka ambayo ni hali ya kudumu inapingana na kipaumbele kilichotajwa cha kupunguza gharama wakati wa vipindi vya kawaida.

**Kwa nini si B?** Kutoa kwa mara 10 kwa kudumu kunamaanisha ~90% ya uwezo uliotolewa unakaa bila kutumika kwa ~92% ya mwaka — kulipa kwa uwezo ambao hautumiwi kamwe.

**Kwa nini si D?** Vitengo vya uwezo vilivyohifadhiwa vinakufunga kwa viwango vya trafiki ya kawaida. Wakati wa tukio la mara 10 la msimu, ungepunguzwa kwa kasi zaidi ya kiasi kilichohifadhiwa, au ungehitaji kuongeza on-demand juu yake.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inatathmini kipengele kipya: dashibodi ya uchambuzi ya mgahawa inayoonyesha idadi ya maagizo ya wakati halisi, mapato kwa saa, na idadi ya wateja. Data hii ingehoji hifadhidata takriban mara 200 kwa dakika (hoji moja kwa kila mchambuzi kwa kila upya wa ukurasa, na wachambuzi 10).

Kwa sasa data ya uchambuzi iko katika Athena (S3). Je, wanapaswa kujenga dashibodi kwenye Athena, au wanapaswa kupakia data kwenye hifadhidata? Ikiwa hifadhidata, ipi (Aurora, DynamoDB, Redshift)?

Zingatia: marudio ya hoji, mahitaji ya usafi wa data, ugumu wa hoji (makusanyo, michanganyiko), na gharama kwa hoji kwa kiwango hiki.

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya uteuzi wa hifadhidata kwa mizigo ya kazi ya uchambuzi.)*

## Tukio Baada ya Mikopo

Tom aliwasilisha muhtasari kamili wa uimarishaji wa gharama kwa Maya.

Miezi mitatu ya kazi. $34,092 katika akiba ya kila mwaka iliyotambuliwa, sehemu kubwa yake tayari imetekelezwa.

"Nini kilichobaki?" Maya aliuliza.

"Maboresho ambayo sijaamini nayo bado," Tom alisema. "Usanidi wa Aurora unaweza pengine kupangwa saizi sahihi zaidi, lakini nataka robo moja zaidi ya data kabla ya kujitolea. Na kuna swali la uhamishaji wa data ambalo sijalichanganua kikamilifu."

"Gharama za mtandao."

"Ndiyo. Hiyo ndiyo inayofuata."

Maya alitazama nambari. "Tom, nataka kuelewa kitu. Uimarishaji huu — umekuwa ukiufanya kwa miezi mitatu. Hiyo ni sehemu kubwa ya wakati wako."

"Karibu 30%."

"Na umepata takriban $34,000 kwa mwaka. Kwa hivyo uimarishaji unalipa gharama zake katika — nini, miezi michache ya mshahara wako?"

Tom alimtazama. "Karibu hiyo."

"Na kila mwaka baadaye, ni akiba safi."

"Au uwekezaji upya safi," alisema. "Athari ile ile."

Maya alitikisa kichwa. "Hii ndiyo nataka ufanye. Si uhifadhi na hifadhidata peke yake — kila kitu. Fanya uimarishaji wa gharama kuwa kazi ya kuendelea ya jukumu lako."

Tom hakuwahi kusikia kazi yake ikielezewa kwa njia hiyo. Aligundua ilikuwa sahihi na ya kuridhisha zote mbili.

Katika sura inayofuata: aina ya gharama ya mwisho iliyobaki — na ile inayoshangaza karibu kila mtu.
