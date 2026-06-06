# Sura ya 31: Mkaguzi wa Ujenzi kwa Usanifu wa Wingu

Simama. Nyoosha mwili. Pumzika kweli ikiwa unahitaji.

Sura hii ni tofauti na zile zilizotangulia. Tumetumia sura 30 zikijenga ujuzi wa huduma maalum na mifumo. Sasa tunatazama kutoka mbali zaidi na kuangalia picha nzima.

Usanifu wa wingu *mzuri* unaonekanaje hasa? Je, kuna njia ya kimfumo ya kutathmini kama ulichojenga ni kweli kilichoundwa vizuri — au tu cha kufanya kazi?

Kuna. AWS inaiita Mfumo wa Ujenzi Bora (Well-Architected Framework).

**Muhtasari wa Haraka: Swali Linalofuata Nambari**

Miezi mitatu ya uimarishaji wa gharama ilikuwa imezalisha nambari iliyowashangaza wote: $35,904 katika akiba ya kila mwaka, iliyotambuliwa na kwa kiasi kikubwa iliyotekelezwa. EC2 Savings Plans, sera za mzunguko wa maisha za S3, usafishaji wa uhifadhi, nakala za hifadhidata zisizotumika, sehemu za mwisho za NAT Gateway — kila moja ilikuwa ugunduzi tofauti, marekebisho tofauti. Lakini mahali fulani wakati wa mchakato huo, Maya alikuwa ameanza kuuliza swali tofauti. Si "taka iko wapi?" bali "ilisanyikaje hapo kwanza?" Matatizo ya gharama yalikuwa dalili za kitu fulani. Mfumo wa Ujenzi Bora ulikuwa msamiati wa kutaja kile ambacho kitu hicho kilikuwa.

Nimbus ilikuwa ikiendesha kwa miaka miwili. Timu ilikuwa imefanya mamia ya maamuzi ya usanifu — baadhi kwa makusudi, baadhi kwa bahati mbaya, baadhi chini ya shinikizo. Mfumo ulifanya kazi. Lakini Maya alikuwa na swali.

"Je, usanifu wetu kweli ni *mzuri*?" aliuliza. "Si tu wa kufanya kazi. Mzuri."

Hakuna aliyejibu mara moja.

"Kwa sababu nimekuwa nikisikia kuhusu Mapitio ya Ujenzi Bora," aliendelea. "AWS inaitoa kwa wateja. Baadhi ya wawekezaji wetu waliitaja. Nafikiri tunapaswa kufanya moja."

"Ni nini?" Leo aliuliza.

"Mfumo wa AWS wa kutathmini miundo ya wingu," Priya alisema. "Nguzo sita. Seti ya maswali na mbinu bora kwa kila moja. Unakadiria usanifu wako dhidi ya yote na kutambua kilichokosekana."

"Ni kama ukaguzi wa ujenzi," Tom alisema. "Unajua jengo linafanya kazi. Ukaguzi unakuambia kama lina uzingatifu wa kanuni na kile kinachoweza kushindwa katika tetemeko la ardhi."

**Nguzo Sita**

Mfumo wa Ujenzi Bora wa AWS umepangwa kuzunguka nguzo sita. Kila nguzo ina seti ya kanuni za muundo, mbinu bora, na maswali ya kutathmini usanifu wako.

**1. Ubora wa Uendeshaji (Operational Excellence)**

*Mwelekeo*: Kuendesha na kufuatilia mifumo kutoa thamani ya biashara, na kuboresha mfululizo michakato na taratibu.

Maeneo muhimu:

- Unasambazaje mabadiliko? (CI/CD, miundombinu kama msimbo, usambazaji wa kiotomatiki)
- Unafuatiliaje mfumo na kujua lini kitu kimekosea?
- Unajifunzaje kutoka kushindwa? (post-mortems, vitabu vya maelekezo, utamaduni usio na kulaumiana)
- Unashughulikiaje mabadiliko kwa kiwango kikubwa?

Tathmini ya Nimbus:

- Ipo: Mzunguko wa CI/CD na usambazaji wa kiotomatiki
- Ipo: Tahadhari za CloudWatch na GuardDuty
- Ipo: Majaribio ya uhandisi wa machafuko ya kila robo
- Tahadhari: Mchakato wa post-mortem haujarasimishwa — matukio yalichunguzwa lakini mafunzo hayakuandikwa kwa utaratibu

**2. Usalama (Security)**

*Mwelekeo*: Kulinda taarifa, mifumo, na mali kupitia tathmini ya hatari na mikakati ya kupunguza.

Maeneo muhimu:

- Ni nani anaweza kufikia nini, na kwa upendeleo mdogo iwezekanavyo?
- Data imefichwa vipi wakati wa kupumzika na wakati wa usafirishaji?
- Unagunduaje na kujibu vitisho?
- Je, kuna vidhibiti vya usalama vya kiotomatiki?

Tathmini ya Nimbus:

- Ipo: IAM yenye upendeleo mdogo (baada ya usafi katika Sura ya 14)
- Ipo: KMS kwa usimbaji fiche wa data, Secrets Manager kwa vyeti
- Ipo: GuardDuty, WAF, Shield Standard
- Ipo: VPC yenye subneti za kibinafsi, vikundi vya usalama
- Tahadhari: Upigaji viraka wa usalama kwenye vipengele vya EC2 haujafanywa kiotomatiki kikamilifu (Priya alitoa kengele miezi iliyopita, bado haijatatuliwa)

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza, pengo la upigaji viraka wa usalama lilipojitokeza. "Tulifanya usambazaji kiotomatiki. Tulifanya nakala kiotomatiki. Kwa nini tuliacha upigaji viraka wa mkono?"

"Kwa sababu upigaji viraka ulihisi tofauti na kusambaza msimbo," Priya alisema. "Tulikuwa na wasiwasi kwamba upigaji viraka ungevunja kitu fulani. Kwa hivyo tuliuweka wa mkono ili kudumisha udhibiti."

"Na kwa kuuweka wa mkono, tuliufanya kuwa usio thabiti," Maya alisema. "Ambao ni mbaya zaidi."

"Ndiyo," Priya alisema. "AWS Systems Manager Patch Manager inatatua hili. Tulipaswa kuifanya miezi sita iliyopita."

**3. Uaminifu (Reliability)**

*Mwelekeo*: Kuhakikisha mfumo unatekeleza kazi yake iliyokusudiwa ipasavyo na kwa uthabiti, na unaweza kurejesha kutoka kushindwa.

Maeneo muhimu:

- Mfumo unashughulikiaje kushindwa katika kiwango cha kipengele?
- Unarejeshaje kutoka kushindwa kwa mkoa?
- Mahitaji yanasimamiwaje?
- Mfumo unajaribiwaje kwa kushindwa?

Tathmini ya Nimbus:

- Ipo: Multi-AZ kwa vipengele vyote muhimu
- Ipo: Aurora Serverless yenye kushindwa hama kwa kiotomatiki
- Ipo: Auto Scaling kwa EC2 na ECS
- Ipo: Majaribio ya uhandisi wa machafuko (ya kila robo)
- Tahadhari: Hakuna usambazaji wa kanda nyingi (nakala ya hifadhi ya joto bado haijatekelezwa — imepangwa kwa robo ijayo)

**4. Ufanisi wa Utendaji (Performance Efficiency)**

*Mwelekeo*: Kutumia rasilimali za IT na kompyuta kwa ufanisi.

Maeneo muhimu:

- Je, aina sahihi ya kipengele na aina ya hifadhidata zinatumika kwa mzigo wa kazi?
- Je, kupanua kumesanidiwa ipasavyo?
- Je, data inatolewa kwa watumiaji kutoka eneo bora?

Tathmini ya Nimbus:

- Ipo: CloudFront kwa utoaji wa maudhui wa kimataifa
- Ipo: ElastiCache kwa kuharakisha kusoma kwa hifadhidata
- Ipo: Aurora read replicas
- Ipo: Lambda kwa mizigo ya kazi inayofaa
- Tahadhari: Baadhi ya vipengele vya EC2 havijawahi kupangwa saizi sahihi tangu usambazaji wa awali

**5. Uimarishaji wa Gharama (Cost Optimization)**

*Mwelekeo*: Kuepuka gharama zisizo za lazima.

Maeneo muhimu:

- Je, rasilimali zimepangwa saizi sahihi ipasavyo?
- Je, rasilimali zisizotumika zimefutwa?
- Je, mifano sahihi ya bei inatumika?
- Je, upungufu wa matumizi unagunduliwa?

Tathmini ya Nimbus:

- Ipo: Savings Plans zimetekelezwa (Sura ya 27)
- Ipo: Sera za mzunguko wa maisha za S3 (Sura ya 23)
- Ipo: DynamoDB Auto Scaling
- Ipo: AWS Budgets na tahadhari
- Ipo: Mapitio ya gharama ya kila robo

"Hii inagharimu kiasi gani kwa mwezi, hasa — vitu vyote ambavyo bado hatujapanga saizi sahihi?" Tom aliuliza. "Vipengele vya EC2 ambavyo havijawahi kutathminiwa. Vile ambavyo bado viko kwa ukubwa tuliotoa katika mwaka wa kwanza."

"Sijui," Leo alisema. "Hilo ndilo jambo."

"Hilo ndilo pengo la Ufanisi wa Utendaji," Priya alisema. "Tuliimarisha vitu tulivyovijua. Hatuna nambari kwa vitu ambavyo bado hatujaviangalia."

**6. Uendelevu (Sustainability)**

*Mwelekeo*: Kupunguza athari za kimazingira za kuendesha mizigo ya kazi ya wingu.

Maeneo muhimu:

- Je, matumizi yameimarishwa (kuepuka rasilimali zisizofanya kazi)?
- Je, aina za vipengele zimechaguliwa kwa ufanisi wa nishati?
- Je, data imehifadhiwa tu kwa muda inaohitajika?

Tathmini ya Nimbus:

- Ipo: Lambda na Fargate kwa mizigo ya kazi bila seva/iliyowekwa kwenye kontena (ufanisi bora wa rasilimali kuliko EC2 iliyowekwa)
- Ipo: Sera za mzunguko wa maisha za S3 (futa data isipohitajika tena)
- Tahadhari: Baadhi ya vipengele vinavyotegemea graviton bado havijapitishwa (AWS Graviton ni bora zaidi kwa nishati na nafuu zaidi)

**Mchakato wa Mapitio ya Ujenzi Bora**

Mapitio si mtihani unaopita au kushindwa. Ni mazungumzo yaliyoundwa kuhusu usanifu wako, yaliyoongozwa na maswali 60+ katika nguzo sita.

Kila swali linatambua mbinu bora. Usanifu wako ukiifuata, hiyo ni nguvu. Usipoifuata, ni "tatizo" — lililoainishwa kwa kiwango cha hatari (juu, wastani, chini).

Matokeo: orodha iliyopewa kipaumbele ya mapendekezo ya maboresho. Si kila kitu kinahitaji kurekebishwa mara moja. Mfumo unakusaidia kuelewa biashara za mbadala za kila pengo na kuamua nini kushughulikia kwanza.

Zana ya Ujenzi Bora ya AWS (inapatikana katika koni ya AWS, bila malipo) hutoa mfumo wa maswali na kuzalisha ripoti yenye mapendekezo.

Kwa Nimbus, Maya alipanga kipindi cha mapitio cha nusu siku kinachofunika nguzo zote sita — na akaamua kutokuendesha peke yake. Kipindi chenyewe, na orodha ya matokeo iliyozalisha, ndiko sura hii inakoelekea.

**Lenzi: Kubobea Mapitio**

Mfumo wa msingi wa Ujenzi Bora hauna teknolojia maalum. AWS pia inachapisha **Lenzi (Lenses)** — upanuzi wa mfumo kwa matumizi maalum au tasnia:

- **Lenzi ya Serverless**: Maswali ya ziada kwa miundo inayozingatia Lambda
- **Lenzi ya SaaS**: Kwa programu za SaaS zinazohudumia wapangaji wengi
- **Lenzi ya Machine Learning**: Kwa mizigo ya kazi ya mafunzo na hitimisho la ML
- **Lenzi ya Huduma za Kifedha**: Maswali ya kisheria na uzingatifu kwa FinTech
- **Lenzi ya Afya**: Mazingatio ya HIPAA

Huenda unajiuliza: je, unahitaji kuendesha mapitio kamili ya Ujenzi Bora dhidi ya nguzo zote sita kabla ya kuzindua? Hapana. Thamani iko katika maswali, si katika alama. Ikiwa uko kabla ya uzinduzi, chagua nguzo mbili zinazohusiana zaidi na hali yako — Usalama na Uaminifu karibu daima ndizo mahali sahihi pa kuanzia — na pitia maswali hayo tu. Mapitio ya sehemu yaliyofanyika kweli yana thamani zaidi kuliko mapitio kamili yaliyoahirishwa hadi usanifu uwe "tayari."

Kwa Nimbus, Lenzi ya SaaS ilikuwa husika. Iliongeza maswali kuhusu utengano wa wapangaji, otomatiki ya uandikishaji, na ugawaji wa gharama kwa kila mpangaji — maeneo yote Nimbus ilikuwa ikitengeneza kikamilifu.

**Kipindi cha Mapitio ya Ujenzi Bora: Carlos Anasimamia**

Maya alikuwa amemwalika Carlos — msanifu mwandamizi aliyemkutana naye katika tukio la jumuiya la AWS, ambaye alisimamia mapitio ya Ujenzi Bora kwa timu kama yao — kuendesha kipindi. Aliwasili na Zana ya Ujenzi Bora ikiwa wazi kwenye kompyuta yake na daftari moja. Hakuna ajenda. Maswali tu.

"Nitauliza, mtajibu kwa uaminifu," alisema. "Ikiwa jibu la uaminifu ni 'hatujui,' sema hivyo. Hilo ni tokeo."

Alianza na Ubora wa Uendeshaji.

"Je, mna vitabu vya maelekezo kwa matukio yenu matano ya juu?"

Tom alimtazama Leo. Leo alitazama dari.

"Tuna vitabu vya maelekezo kwa matukio mawili," Priya alisema. "Uvunjaji wa kikomo cha miunganisho ya hifadhidata na muda wa kuisha wa chanzo cha CloudFront. Mengine matatu — kushindwa kwa kipengele cha EC2 wakati wa kilele, kupunguzwa kasi kwa DynamoDB, na kushindwa kwa webhook ya Stripe — tunavishughulikia kibahati."

Carlos aliandika: *OPS-1: Vitabu vya maelekezo kwa matukio 5 ya juu. Sasa: 2/5. Pengo: 3.*

"Mara ya mwisho mlipopitia vitabu vya maelekezo vilivyopo katika zoezi la mazoezi ilikuwa lini?"

Ukimya.

"Hatujapitia," Priya alisema. "Tuliviandika baada ya matukio. Hatujawahi kujaribu kama bado ni sahihi."

*OPS-2: Uthibitishaji wa vitabu vya maelekezo. Jaribio la mwisho: kamwe.*

Carlos aliendelea. Usalama.

"Ni nani ana ufikiaji wa akaunti ya root sasa hivi?"

"Root?" Leo alisema. "Maya tu. Na nafikiri Tom bado ana vyeti vya root kutoka tulipoanzisha akaunti — lakini tulivibadili baada ya Sura ya 14." Alisita. "Tom, je, tulibadilisha root baada ya usafi wa IAM?"

Tom alivuta kiingilio cha 1Password. "Tulibadilisha nenosiri na kuongeza MFA. Lakini vyeti vya root bado viko katika hazina iliyoshirikiwa ya 1Password. Watu watatu wana ufikiaji wa hazina hiyo: mimi, Maya, na Leo."

"Kwa hivyo watu watatu wana ufikiaji wa root," Carlos alisema. "Mwongozo wa AWS ni kwamba root inapaswa kutumika tu kwa orodha fupi iliyoandikwa ya kazi — takriban operesheni kumi za kiwango cha akaunti, zote nadra na nyingi za dharura tu. Baada ya operesheni hizo, kipindi cha root kinapaswa kukomeshwa. Je, ufikiaji wa root unawekwa logi kivyake?"

"CloudTrail inaiweka logi," Priya alisema.

"Je, kuna tahadhari root inapotumika?"

Sitisho lingine.

"Hapana," Tom alisema.

Carlos aliandika: *SEC-1: Udhibiti wa ufikiaji wa akaunti ya root. Sasa: watumiaji 3 katika hazina iliyoshirikiwa, hakuna tahadhari ya matumizi. Pengo: Matumizi ya root yanapaswa kusababisha tahadhari ya papo hapo ya SNS. Lengo: vipindi 0 vya root visivyo vya dharura.*

"Inayofuata: ni nani anayepitia mabadiliko ya ruhusa za IAM? Je, kuna mchakato wa mapitio ya rika kwa majukumu mapya ya IAM au upanuzi wa sera?"

"Priya anayapitia," Leo alisema. "Yeye ndiye mkaguzi wa usalama wa kweli."

"Nini hutokea Priya akiwa likizoni?"

Hakuna aliyejibu.

"Hilo ni pengo la mchakato," Carlos alisema, bila hukumu. "Si pengo katika uwezo wa Priya — pengo katika muundo wa mchakato. Mapitio ya usalama yanayotegemea upatikanaji wa mtu mmoja ni hatua moja ya kushindwa katika msimamo wako wa usalama."

*SEC-2: Mchakato wa mapitio ya IAM. Sasa: mkaguzi mmoja, hakuna mbadala. Pengo: Bainisha mkaguzi mbadala na uandike vigezo vya mapitio.*

Carlos aligeukia Uaminifu.

"Je, mmejaribu kushindwa hama kwa Aurora Multi-AZ chini ya mzigo?"

"Tulijaribu wakati wa utulivu," Tom alisema. "Tuliendesha amri ya kushindwa hama wakati mfumo ulipokuwa kimya na kuthibitisha kwamba nakala ilipanda ndani ya sekunde 45."

"Mzigo ulikuwa nini wakati huo?"

"Pengine 5% ya kilele."

"Nini hutokea kwa dimbwi la miunganisho wakati wa kushindwa hama kwa 80% ya mzigo wa kilele?"

Tom alifikiri kuhusu hilo. "Kituo cha DNS kinasasishwa. Programu zinazotumia kituo cha mwandishi zitaona hitilafu za muunganisho wakati wa dirisha la ubadilishaji — kwa kawaida sekunde 20-45. Kwa mzigo wa 5%, tulikuwa na miunganisho kumi hai. Kwenye kilele, tungekuwa na 300. Na RDS Proxy mbele, proxy inashughulikia kuunganisha tena."

"Je, RDS Proxy inaunganisha tena kwa uwazi kweli wakati wa kushindwa hama kwa Multi-AZ?"

Tom alimtazama Priya. "Naamini hivyo. Lakini sijajaribu."

"Hilo ni jibu tofauti na 'ndiyo,'" Carlos alisema. "Dhana isiyojaribiwa katika muundo wako wa upatikanaji wa juu ni tokeo."

*REL-1: Kushindwa hama kwa Aurora Multi-AZ chini ya mzigo. Imejaribiwa: utulivu tu. Pengo: Jaribu kwa 70% ya mzigo wa kilele na RDS Proxy ikiwepo. Thibitisha tabia ya dimbwi la miunganisho wakati wa dirisha la kushindwa hama.*

"Je, mmefikiria nini hutokea ikiwa kushindwa hama kunachukua sekunde 90 badala ya 45?" Priya aliuliza, akizungumza na Tom badala ya Carlos. Tayari alikuwa akifanya kazi.

"Kwa sekunde 90, tungekuwa na muda wa kuisha wa programu kwa maombi yoyote yasiyoweza kujaribiwa tena," Tom alisema. "Mtiririko wa kuweka agizo una mantiki ya kujaribu tena. Mtiririko wa uthibitisho — si sana. Kushindwa hama kwa sekunde 90 wakati wa msongamano wa chakula cha jioni kungemaanisha sehemu ya uthibitisho inashindwa, migahawa haipati agizo, mteja anapata rejesho."

"Hiyo ndiyo eneo la mlipuko," Carlos alisema. "Vizuri. Sasa unajua unalindwa dhidi ya nini na jinsi ya kuipima. Jaribio linapaswa kuthibitisha muda wa kushindwa hama na tabia ya programu wakati wa dirisha la ubadilishaji."

Alihamia Ufanisi wa Utendaji.

"Je, mnapanga saizi sahihi vipengele vyenu vya EC2?"

"Tulipanga saizi sahihi wakati wa mapitio ya gharama," Tom alisema. "Savings Plans zilijitolea kwa aina za vipengele za sasa."

"Mara ya mwisho mlipoangalia mapendekezo ya Compute Optimizer ilikuwa lini?"

Tom aliivuta. AWS Compute Optimizer ilikuwa imeweka alama vipengele vitatu kama vinavyoweza kuwa vimetolewa kupita kiasi: vichakataji viwili vya usuli vya c6g.medium na seva moja ya VPN ya t3.medium. Pendekezo la seva ya VPN lilikuwa kushusha hadi t3.small. Vichakataji viliwekewa alama kama "vimetolewa kupita kiasi" kwa uhakika wa 82%.

"Hatujaiangalia hii tangu tuiweke," Tom alikiri.

"Compute Optimizer imekuwa ikizalisha mapendekezo kwa muda gani?"

Tom aliangalia. "Wiki sita."

Carlos aliandika: *PERF-1: Kupanga saizi sahihi kwa EC2 kupitia Compute Optimizer. Sasa: mapendekezo yanapatikana, hayajapitiwa. Pengo: Mapitio ya kila mwezi ya matokeo ya Compute Optimizer; tumia mapendekezo baada ya uthibitisho wa hatua ya kujaribu.*

"Moja zaidi," Carlos alisema. "Hii inavuka nguzo zote." Aliandika kwenye ubao mweupe:

*Kutokuwa na tukio si sawa na kuwa kilichoundwa vizuri.*

Aliiacha hapo kwa muda.

"Mfumo wenu umekuwa ukiendesha kwa miaka miwili bila kukatika kukubwa kunakoelekea mteja," alisema. "Hiyo ni nzuri kweli. Lakini nataka mgundue kile hilo linakuambia — na kile lisilokuambia."

"Linatuambia tumekuwa na bahati?" Leo alitoa.

"Linakuambia kwamba njia za kushindwa ulizokutana nazo zimekuwa ndani ya uwezo wako wa kuzishughulikia, ukizingatia usanifu uliyo nao leo. Halikuambii kwamba usanifu ni imara. Mfumo ambao haujashindwa bado haujathibitishwa kuwa stahimilivu. Umethibitishwa kutokukutana na hali mahususi ambazo zingefichua udhaifu wake."

"Kwa hivyo kutoshindwa hakumaanishi kutokuwa hatarini," Maya alisema.

"Sahihi. Mapitio ya Ujenzi Bora hayatafuti ushahidi wa kushindwa kwa zamani. Yanatafuta mfichuo wa baadaye. Kushindwa hama kusikojaribiwa. Vitabu vya maelekezo visivyokuwepo. Jukumu la IAM lililo pana sana. Hakuna kati ya haya kimesababisha tukio bado. Vyote vingeweza."

"Ndiyo sababu pengo la upigaji viraka lina umuhimu," Priya alisema. "Hatujadukuliwa kupitia kipengele cha EC2 kisichopigwa viraka. Hilo halimaanishi hatutadukuliwa."

"Hasa," Carlos alisema. "Kutokuwepo kwa madhara si ushahidi wa usalama. Uwepo wa udhaifu usioshughulikiwa ni ushahidi wa hatari — bila kujali kama hatari imejitokeza."

Alifunga kalamu yake ya alama.

"Hiyo ndiyo tofauti kati ya mfumo uliobuniwa vizuri na ule wenye bahati."


**Tokeo la Ruhusa za Ziada za IAM**

Carlos aliweka alama tokeo la pili wakati wa mapitio ya nguzo ya usalama lililohitaji uchunguzi wa kina zaidi.

"Kazi yako ya Lambda inayoshughulikia arifa za maagizo — ina ruhusa gani za IAM?"

Leo alivuta jukumu la utekelezaji. Ilichukua sekunde thelathini zaidi kuliko ilivyopaswa kulipata — jukumu lilikuwa limeundwa mapema katika maisha ya Nimbus na lilipewa jina la jumla.

"Ufikiaji kamili wa S3," alisema, alipolipata.

Carlos alisubiri.

"Ndoo gani?" aliuliza.

"Ndoo zote," Leo alisema. Alisoma sera. "`arn:aws:s3:::*`. Tuliipa ufikiaji kamili wa S3."

"Kazi inafanya nini kweli na S3?"

"Inasoma usanidi wa mgahawa kutoka ndoo moja," Leo alisema. "Ndoo ya `nimbus-restaurant-config`. Hasa vitu vya `restaurants/{restaurant_id}/config.json`. Inavisoma. Hiyo ndiyo yote."

"Kwa hivyo kazi inahitaji `s3:GetObject` kwenye `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`," Carlos alisema. "Kile inacho ni ruhusa kamili za S3 kwenye kila ndoo katika akaunti."

"Ikiwa ni pamoja na," Priya alisema, "ndoo ya picha za Aurora. Ndoo ya logi za CloudTrail. Ndoo ya historia ya maagizo ya wateja."

"Ikiwa kazi hii ya Lambda itadukuliwa," Carlos alisema, "mshambuliaji ana ufikiaji kamili wa kila ndoo ya S3 katika akaunti. Wanaweza kusoma, kuandika, au kufuta data yoyote."

"Tayari niliisambaza — lo," Leo alisema. Alikuwa akisoma sera. "Niliandika hii miaka miwili iliyopita. Nilikuwa na haraka kupata mfumo wa arifa ukifanya kazi. Niliipa ufikiaji mpana kwa sababu sikuwa na uhakika ilichohitaji bado. Na sikuwahi kurudi kuipunguza."

"Hicho ndicho chanzo cha kawaida zaidi cha ruhusa za ziada katika mifumo ya uzalishaji," Carlos alisema, bila shutuma. "Si uzembe wa makusudi — njia ya mkato iliyochukuliwa chini ya shinikizo la muda, ambayo haikuwahi kupitiwa tena."

Tom alikuwa tayari akiangalia orodha kamili ya majukumu ya utekelezaji ya Lambda.

"Ni ngapi kati ya kazi zetu za Lambda zina ruhusa pana kupita kiasi?" Maya aliuliza.

Jibu, baada ya dakika ishirini za mapitio: 7 kati ya kazi 23 za Lambda zilikuwa na ruhusa pana zaidi kuliko kusudi lao lililoandikwa lilihitaji. Yenye wasiwasi zaidi: Lambda ya uthibitisho wa malipo ilikuwa na `dynamodb:*` kwenye jedwali zote. Ilihitaji tu `dynamodb:GetItem` na `dynamodb:PutItem` kwenye jedwali la maagizo.

"Masaa matatu ya kazi kurekebisha zote saba," Priya alikadiria. "Andika sera za upendeleo mdogo, ziambatishe, ondoa zile pana."

"Je, hili ni tokeo lenye hatari ya juu zaidi hadi sasa?" Maya alimuuliza Carlos.

"Limefungana na pengo la kitabu cha maelekezo," alisema. "Tatizo la IAM ni tatizo la eneo la mlipuko — ikiwa kazi yoyote kati ya hizi itadukuliwa, ufikiaji wa mshambuliaji ni mkubwa zaidi ya inavyopaswa kuwa. Tatizo la kitabu cha maelekezo ni tatizo la muda wa uokoaji — kitu kinapokwenda vibaya, unaboresha badala ya kufuata utaratibu uliojaribiwa. Vyote ni hatari ya juu kweli."

Maya aliyaweka yote mawili kama P1 katika hati ya kufuatilia.

"Na vipi ikiwa mtu atajaribu kuvunja?" Priya alisema. "Tumekuwa na wasiwasi kuhusu washambuliaji wa nje. Lakini Lambda yenye ruhusa za ziada inamaanisha kushindwa kwa ndani — usanidi mbaya, udhaifu wa utegemezi, shambulio la mnyororo wa ugavi — kunaweza kuwa na eneo la mlipuko lile lile."

"Ulinzi wa kina unadhani kila tabaka lina ufikiaji wa chini unaohitajika," Carlos alisema. "Tabaka moja linapokuwa na ufikiaji zaidi ya inavyohitaji, ulinzi wa kina unaacha kufanya kazi kama ilivyobuniwa. Unapata tabaka moja lililodukuliwa, lakini lina funguo za tabaka tatu nyingine."

Priya aliweka alama tokeo la ruhusa za ziada za IAM kama P1, safu ya kwanza, na tarehe ya mwisho ya wiki moja.


**Kupanga Matokeo kwa Vipaumbele: P1, P2, P3**

Mwishoni mwa kipindi, timu ilikuwa na matokeo 14 kwenye ubao. Carlos aliwaomba wayapange kabla ya kuondoka.

"Kila tokeo katika orodha hii linahitaji kipaumbele," alisema. "Si kila kitu kina umuhimu sawa. Panga kwa: ni eneo gani la mlipuko ikiwa hili litashindwa? Lina uwezekano gani wa kushindwa? Ni gumu kiasi gani kurekebisha?"

Matokeo 14:

1. Hakuna vitabu vya maelekezo kwa 3 kati ya matukio 5 ya juu (OPS)
2. Vitabu vya maelekezo havijajaribiwa kamwe (OPS)
3. Hakuna mchakato rasmi wa majibu ya tukio zaidi ya vitabu vya maelekezo (OPS)
4. Ufikiaji wa root katika hazina iliyoshirikiwa, hakuna tahadhari ya matumizi (SEC)
5. Mchakato wa mapitio ya IAM hauna mkaguzi mbadala (SEC)
6. Kazi 7 za Lambda zenye ruhusa za ziada (SEC) ← Lambda ya arifa ya Leo
7. Sheria chache za vikundi vya usalama pana zaidi kuliko inavyohitajika (SEC)
8. Kushindwa hama kwa Aurora hakujajaribiwa chini ya mzigo (REL)
9. Mpango wa DR wa kanda nyingi haujatekelezwa (REL)
10. Upigaji viraka wa usalama haujafanywa kiotomatiki (SEC)
11. Kupanga saizi sahihi kwa EC2 hakujapitiwa tangu uzinduzi (PERF)
12. Vipengele vya Graviton havijapitishwa (SUST)
13. CloudFront cache TTLs hazijaratibiwa (PERF)
14. 40% ya miundombinu haiko katika IaC (OPS)

"Anza na zile dhahiri," Carlos alisema. "Ni zipi tatu mngerekebisha kwanza ikiwa mngekuwa na wiki moja tu?"

Maya alienda mara moja: "Tahadhari ya ufikiaji wa root. Ruhusa za ziada za Lambda. Otomatiki ya upigaji viraka wa usalama."

"Kwa nini?" Carlos aliuliza.

"Kwa sababu zile tatu ni mapengo ya usalama yenye eneo la mlipuko wazi. Mengine ni maboresho ya uaminifu na uendeshaji — muhimu, lakini tumekuwa tukiishi nayo na hayajasababisha tukio. Mapengo ya usalama yanazidi kuongezeka kimya kila siku ambayo hatuyarekebishi."

Tom alipinga, kwa upole. "Ruhusa za ziada za Lambda ni za dharura. Lakini ningebadilisha upigaji viraka wa usalama na jaribio la kushindwa hama kwa Aurora. Hatujawahi kuthibitisha mpangilio wetu wa Multi-AZ unafanya kazi ipasavyo chini ya mzigo. Ikiwa utashindwa wakati wa msongamano wa chakula cha jioni cha Ijumaa na hatuna kitabu cha maelekezo kilichojaribiwa kwa ajili yake, tuko matatani."

"Vyote vinaweza kuwa P1," Priya alisema. "Tuna wiki. Siku tano za kazi. Ruhusa za Lambda ni marekebisho ya saa mbili kwa kila kazi. Tahadhari ya ufikiaji wa root ni sheria ya tukio ya CloudWatch ya dakika thelathini. Otomatiki ya upigaji viraka wa usalama ni siku mbili za usanidi na majaribio ya Systems Manager. Jaribio la kushindwa hama kwa Aurora ni nusu siku iliyopangwa Jumanne saa 8 usiku."

Carlos alitikisa kichwa. "Hiyo ndiyo njia sahihi ya kupanga. Si tu 'nini muhimu zaidi' bali 'tunaweza kufanya nini kweli wiki hii, na kwa mpangilio gani?'"

Upangaji wa mwisho:

**P1 (wiki hii)**:
- Marekebisho ya upendeleo mdogo ya jukumu la utekelezaji la Lambda (kazi 7)
- Tahadhari ya CloudWatch ya akaunti ya root
- Jaribio la kushindwa hama kwa Aurora Multi-AZ chini ya mzigo (panga kwa Jumanne ijayo, saa 8 usiku)

**P2 (mwezi huu)**:
- Otomatiki ya upigaji viraka wa usalama kupitia Systems Manager
- Vitabu vya maelekezo vinavyokosekana kwa matukio 3 ya juu
- Mchakato rasmi wa majibu ya tukio umeandikwa
- Uhamiaji wa 40% wa IaC — tambua rasilimali zipi, jenga mpango wa uhamiaji

**P3 (robo hii)**:
- Zoezi la uthibitishaji wa kitabu cha maelekezo
- Mkaguzi mbadala wa mchakato wa mapitio ya IAM umeandikwa
- Sheria za vikundi vya usalama pana kupita kiasi zimekazwa
- Mapitio ya kupanga saizi sahihi kwa EC2 kupitia Compute Optimizer
- Mpango wa kupitisha Graviton
- Uratibu wa TTL wa CloudFront

"Hayo ni matokeo kumi na nne yenye wamiliki, tarehe za mwisho, na vipaumbele," Maya alisema. "Hatujawahi kuwa wenye mpangilio kiasi hiki kuhusu deni la kiufundi."

"Hivyo ndivyo mapitio yanavyofaa," Carlos alisema. "Si kukufanya ujisikie vibaya kuhusu mapengo. Kukupa msamiati na orodha unayoweza kweli kutekeleza dhidi yake."


**Tofauti Kati ya Kilichobuniwa Vizuri na Kinachofanya Kazi Tu**

"Mfumo wetu unafanya kazi," Leo alisema baada ya mapitio. "Lakini sikugundua mambo mangapi tuliyoyafanya 'vizuri vya kutosha' na kuendelea."

"Je, tumefikiria nini hutokea ikiwa tutaendelea kuacha mapengo haya?" Priya aliuliza. "Tatizo la upigaji viraka limekuwa wazi kwa miezi. Mchakato wa majibu ya tukio haupo. Haya si mambo madogo — ni mambo yanayoamua kama kukatika kwa usiku wa Ijumaa ni marekebisho ya dakika 20 au janga la masaa manne."

"Ndiyo sababu tunafanya mapitio," Maya alisema.

"Hiyo ni ya kawaida," Priya alisema. "Kujenga chini ya shinikizo la muda kunamaanisha unafanya chaguo za kivitendo. Mapitio ya Ujenzi Bora ni muda uliopangwa wa kuyapitia tena."

"Baadhi ya mapengo haya yanaonekana dhahiri yakiangaliwa nyuma," aliendelea. "Upigaji viraka wa usalama — nilijua hatukuwa tumefanya kiotomatiki. Sikuwahi tu kuweka kipaumbele cha kurekebisha."

"Kwa sababu 'inafanya kazi' na 'imejengwa vizuri' huhisi sawa siku kwa siku," Maya alisema. "Tofauti inaonekana tu wakati kitu kinakwenda vibaya."

Hili ni moja ya mambo muhimu zaidi mhandisi mwandamizi anayoyaelewa: kutokuwepo kwa matukio hakumaanishi kutokuwepo kwa hatari. Kunamaanisha hatari haijajitokeza bado.

**Miundombinu kama Msimbo: Kiwezeshaji cha Ubora wa Uendeshaji**

Mada moja katika nguzo nyingi: **Miundombinu kama Msimbo (Infrastructure as Code - IaC)**.

Ikiwa miundombinu yako imesanidiwa kwa mkono kupitia koni, basi:

- Kuiunda upya katika hali ya DR ni polepole na yenye makosa
- Kukagua mabadiliko haiwezekani (ni nani alibadilisha nini, na lini?)
- Kurudi nyuma kwa mabadiliko mabaya kunahitaji ubadilishaji wa mkono
- Uthabiti kati ya mazingira (dev/hatua ya kujaribu/uzalishaji) unahitaji nidhamu

**AWS CloudFormation** inakuruhusu kufafanua miundombinu katika templeti za YAML/JSON. **AWS CDK (Cloud Development Kit)** inakuruhusu kufafanua miundombinu kwa kutumia lugha za programu (Python, TypeScript, Java). **Terraform** ni mbadala maarufu wa upande wa tatu.

Nimbus ilikuwa ikihamia polepole hadi IaC kwa kutumia Terraform. Kufikia wakati wa mapitio ya Ujenzi Bora, karibu 60% ya miundombinu yao ilikuwa imefafanuliwa katika msimbo. Mapitio yalipendekeza kufika 100%.

"Kwa nini 40% iliyobaki?" Leo aliuliza.

"40% iliyobaki ndipo miundombinu yetu muhimu inaishi," Priya alisema. "Ikiwa hatuwezi kuiunda upya kutoka msimbo, hatuwezi kurejesha kwa kuaminika kutoka maafa ya mkoa."

Leo aliangalia orodha. "40% iliyobaki — ndiyo. Itakuwa sawa, tutaihamisha mbio ijayo."

Priya alishikilia macho yake kwenye skrini. "Hiyo ndiyo miundombinu muhimu. Usanidi wa kushindwa hama kwa kanda nyingi. Daraja la majukumu ya IAM. Vitu ambavyo, ikiwa itabidi tujenge upya kutoka mwanzo saa 9 usiku, tunahitaji kujua ni sahihi kabisa."

Leo alifikiri kuhusu hilo kwa muda.

"...Una haki," alisema kwa utulivu. "Tayari tuna usanidi wa mkono uliojiteleza kutoka kile ambacho mtu yeyote aliandika. Ikiwa itabidi tuujenge upya kutoka mwanzo, tungekuwa tukikisia."

"Ndiyo sababu mapitio yaliupata," Maya alisema. "Si kulaumu. Kurekebisha kabla halijawa na umuhimu."

**CloudFormation kwa Kina: Zana ya IaC ya AWS Asili**

Ingawa Nimbus ilikuwa imepitisha Terraform, mapitio ya Ujenzi Bora pia yalifichua kwamba timu haijawahi kuelewa kikamilifu AWS CloudFormation — huduma asili ya IaC ya AWS inayotegemeza huduma kama CDK, SAM (the serverless application model), na Service Catalog. Mtihani unajaribu CloudFormation mahususi, na huduma kadhaa za AWS zinahitaji kuielewa.

Tatizo ambalo Carlos alikuwa amelitaja mapema katika kipindi lilikuwa thabiti: Leo alikuwa akibofya kwa mkono kupitia koni kuunda mazingira. Ilimchukua dakika 45 kila mara, na tofauti yoyote kati ya hatua ya kujaribu na uzalishaji ilikuwa isiyoonekana hadi kitu kilipovunjika. Matatu kati ya matukio matano ya uzalishaji ya mwaka uliopita yalisababishwa na usanidi katika uzalishaji ambao haukulingana na hatua ya kujaribu — sheria tofauti za vikundi vya usalama, vigeu tofauti vya mazingira, aina tofauti ya kipengele.

"Koni ni mlango wa njia moja," Carlos alisema. "Unaweza kuingia na kubadilisha vitu, lakini huwezi kurudi nje kwa urahisi na kuona ni nini hasa kilibadilishwa, au kuzaa upya hali ya jana."

CloudFormation ni jibu kwa hilo. Hivi ndivyo inavyofanya kazi:

**Templeti**: Faili ya YAML au JSON inayotangaza miundombinu ya AWS unayoitaka. Si maelekezo ya jinsi ya kuiunda — tangazo la jinsi inavyopaswa kuonekana. "Nataka VPC yenye masafa haya ya CIDR, subneti mbili za umma, subneti mbili za kibinafsi, Internet Gateway, na majedwali haya ya njia." CloudFormation inasoma templeti na kubaini jinsi ya kufanya miundombinu halisi kulingana na tangazo.

Fikiria templeti kama mapishi ya mazingira. Mapishi hayabadiliki. Kila mazingira yaliyoundwa kutoka kwake yanafanana. Hatua ya kujaribu na uzalishaji zinatumia templeti ile ile, na vigezo tofauti (ukubwa tofauti wa vipengele, majina tofauti ya kikoa). Maamuzi ya kimuundo — subneti zipi zinakuwepo, vikundi vipi vya usalama, majukumu yapi ya IAM — yanafanana.

**Stack**: Mfano uliosambazwa wa templeti. Leo anapoendesha `aws cloudformation deploy --template-file infrastructure.yaml`, CloudFormation inaunda Stack — mkusanyiko uliopewa jina wa rasilimali halisi za AWS ambazo templeti inazielezea. Stack inakumbuka ni rasilimali zipi iliyoziunda, na inazisimamia kama kitengo kimoja. Sasisha templeti na usambaze tena Stack: CloudFormation inahesabu tofauti kati ya hali ya sasa na templeti mpya, na inatumia tu mabadiliko yanayohitajika. Futa Stack: CloudFormation inavunja kila rasilimali iliyoiunda, kwa mpangilio sahihi, bila wewe kuhitaji kuzikumbuka.

"Kwa hivyo Stack ni usambazaji, si templeti?" Maya aliuliza.

"Templeti ni mapishi. Stack ni chakula. Unaweza kutengeneza chakula kile kile kutoka mapishi yale yale mara nyingi unavyotaka. Kila mara ni kile kile."

**Change Set**: Kabla ya kutumia sasisho kwa Stack inayoendesha, unaweza kuunda Change Set — onyesho la awali la kile CloudFormation itafanya. Kuongeza rasilimali mpya? Change Set inaonyesha. Kurekebisha kikundi cha usalama? Change Set inaonyesha kabla na baada. Kubadilisha kipengele cha RDS? Change Set inaweka alama kama ubadilishaji — ambao unamaanisha muda wa kupumzika — kabla hujajitolea.

"Ona tofauti kabla ya kutumia," Priya alisema. "Hiki ndicho tunakikosa Leo anapobofya vitu katika koni."

Kwa Nimbus, sera ikawa: mabadiliko yote ya miundombinu kwa uzalishaji lazima yapite kwenye mapitio ya Change Set. Hakuna mahariri ya moja kwa moja ya koni. Change Set ni mchakato wa mapitio ya rika kwa miundombinu.

**Drift Detection**: Kwa muda, watu wanabofya vitu katika koni. Sheria ya kikundi cha usalama iliyoongezwa wakati wa tukio. Kigeu cha mazingira kilichobadilishwa katikati ya usambazaji. Aina ya kipengele iliyopandishwa kwa mkono marekebisho yaliyopangwa yalipokuwa yakichukua muda mrefu sana. CloudFormation inaita hii **drift** — wakati hali halisi ya rasilimali hailingani tena na kile templeti ya Stack inasema inapaswa kuwa.

Drift detection ya CloudFormation inachunguza rasilimali za Stack na kuripoti tofauti yoyote kati ya hali halisi na hali iliyofafanuliwa na templeti. Leo alipoendesha drift detection kwenye stacks zilizopo za Nimbus kwa mara ya kwanza, alipata rasilimali kumi na moja zilizojiteleza. Saba kati yake zilikuwa marekebisho ya vikundi vya usalama. Tatu zilikuwa mabadiliko ya sera ya IAM. Moja ilikuwa ndoo ya S3 ambayo ilikuwa na sera yake ya mzunguko wa maisha imebadilishwa moja kwa moja katika koni miezi sita iliyopita na haikuwahi kuonyeshwa katika templeti.

"Rasilimali kumi na moja ambapo miundombinu halisi na templeti hazikubaliani," Priya alisema. "Tofauti kumi na moja zinazoweza kuwepo kati ya hatua ya kujaribu na uzalishaji ambazo hatuzijui."

Leo hakusema chochote. Baadhi ya marekebisho hayo yalikuwa yake.

Alitumia wiki iliyofuata kupatanisha rasilimali zilizojiteleza na templeti. Matatu kati ya mabadiliko ya mkono yalikuwa hitilafu — usanidi ambao haukupaswa kamwe kutumika. Mengine yalikuwa mabadiliko halali ambayo tu hayakuwahi kurudishwa kwenye templeti.

**Kwa Nini Lina Umuhimu kwa Mfumo wa Ujenzi Bora**: Miundombinu kama Msimbo ipo kwenye makutano ya Ubora wa Uendeshaji (usambazaji unaorudiwa, miundombinu inayodhibitiwa na toleo, uwezekano wa kukagua kila mabadiliko), Uaminifu (ikiwa Kanda itashindwa, unaweza kuunda upya mazingira kutoka templeti, si kutoka kumbukumbu), na Usalama (majukumu ya IAM na sheria za vikundi vya usalama zinapitiwa katika msimbo, si kugundulika baadaye katika koni). Si jambo la kupendeza tu — ni moja ya mbinu za msingi ambazo mfumo unapendekeza mara kwa mara.

---

> **Kidokezo cha Mtihani — CloudFormation**
>
> *SAA-C03 Kikoa: Msalaba wa vikoa — Ubora wa Uendeshaji na Uaminifu*
>
> - **CloudFormation = IaC ya kutangaza kwenye AWS.** Unatangaza hali inayotakiwa katika templeti; CloudFormation inaunda na kusimamia rasilimali. Ishara ya mtihani: "usambazaji unaorudiwa," "miundombinu kama msimbo," "mazingira thabiti."
> - **Templeti** → **Stack**: templeti ni tangazo; Stack ni rasilimali zilizosambazwa. Stack inaweza kuundwa, kusasishwa, au kufutwa kama kitengo.
> - **Change Set**: Onyesha awali kitakachobadilika kabla ya kutumia sasisho kwa Stack inayoendesha. "Ona tofauti kabla ya kutumia." Ishara ya mtihani: "pitia mabadiliko ya miundombinu kabla ya kusambaza" → Change Set.
> - **Drift Detection**: Inatambua rasilimali zilizobadilishwa kwa mkono nje ya CloudFormation. "Mtu alibofya kitu katika koni" → Drift Detection.
> - **Sifa ya DeletionPolicy**: Inadhibiti kinachotokea kwa rasilimali Stack yake inapofutwa. `Retain` — rasilimali inahifadhiwa (muhimu kwa ndoo za S3 zenye data usiyotaka kupoteza). `Delete` — rasilimali inaharibiwa (chaguo-msingi). `Snapshot` — kwa RDS na huduma zingine, CloudFormation inachukua picha ya mwisho kabla ya kufuta. Ishara ya mtihani: "zuia hifadhidata ya RDS isifutwe stack inapofutwa" → `DeletionPolicy: Snapshot` au `DeletionPolicy: Retain`.
> - **CloudFormation StackSets**: Sambaza Stack ile ile katika akaunti na mikoa mingi ya AWS kutoka operesheni moja. Ishara ya mtihani: "sambaza miundombinu ile ile katika akaunti zote katika shirika."

**Tofauti: Wakati Mfumo Unakupotosha**

Ikiwa utaangalia kila kisanduku katika mapitio ya Ujenzi Bora lakini hujathibitisha uokoaji wako wa kushindwa katika hatua ya kujaribu, usanifu wako wa upatikanaji wa juu utashindwa katika tukio la kwanza halisi — kwa sababu nyaraka za ustahimilivu si sawa na ustahimilivu uliojaribiwa. Mfumo unauliza "je, una Multi-AZ?" si "je, umethibitisha kwamba kushindwa hama kunafanya kazi ipasavyo kweli katika usanidi wako mahususi?"

Ikiwa utatumia mfumo kama orodha ya kukagua ili kuridhisha mkaguzi badala ya kama zana ya kufikiria kuboresha mfumo, utazalisha nyaraka sahihi za usanifu usiouelewa kikamilifu. Maswali yana thamani zaidi yanapofichua mapengo usiyotarajia kupata.

## Nguvu na Mipaka

**Kile ambacho Mfumo wa Ujenzi Bora unafanya vizuri**: Unaipa timu msamiati wa pamoja wa kujadili biashara za mbadala za usanifu — lugha inayonusurika mabadiliko ya wafanyakazi na mazungumzo ya wasambazaji. Kuendesha Mapitio ya Ujenzi Bora kunalazimisha kukubali wazi hatari ambazo vinginevyo hazingeonekana: "Ndiyo, tunajua tuna hatua moja ya kushindwa hapa; tulikubali biashara hiyo ya mbadala kwa sababu gharama ya kuiondoa inazidi gharama inayotarajiwa ya kushindwa." Aina hiyo ya biashara ya mbadala iliyoandikwa, ya makusudi ndiyo matokeo ya mapitio mazuri.

**Kile asichoweza kufanya**: Mfumo ni wa kueleza, si wa kuagiza. Unaeleza sifa za mifumo iliyobuniwa vizuri — hauelezi jinsi ya kuijenga. Kuangalia kila kisanduku katika Mapitio ya Ujenzi Bora hakuhakikishii usanifu mzuri. Mfumo unaweza kuwa wa upatikanaji wa juu, ubora wa uendeshaji, ulioimarishwa kwa gharama, na bado kutatua tatizo lisilo sahihi. Mfumo ni lenzi, si mchoro. Uitumie kufichua maswali sahihi, si kuyajibu.

## Muhtasari

Mapitio ya Ujenzi Bora yaliwaachia vitu 14 — vitatu vilivyohitaji umakini wa papo hapo, vingine vilivyohitaji mpango. Matokeo yenye hatari ya juu hayakuwa mishangao hasa; yalikuwa mambo ambayo timu ilikuwa imeyajua na haijayafikia bado. Mapitio yaliwapa njia iliyoundwa ya kukubali mapengo hayo waziwazi, kuyapanga kwa hatari, na kujitolea kwa ratiba. Uwajibikaji huo, zaidi ya tokeo lolote la mtu mmoja, ndiyo ilikuwa thamani.

- **Mfumo wa Ujenzi Bora wa AWS** una nguzo sita: Ubora wa Uendeshaji, Usalama, Uaminifu, Ufanisi wa Utendaji, Uimarishaji wa Gharama, na Uendelevu.
- Kila nguzo ina kanuni za muundo na mbinu bora zilizopimwa kupitia seti ya maswali iliyoundwa.
- **Zana ya Ujenzi Bora** (bure katika koni ya AWS) inaongoza mapitio na kuzalisha ripoti.
- Matokeo ni orodha iliyopewa kipaumbele ya maboresho ya usanifu yaliyoainishwa kwa hatari.
- **Miundombinu kama Msimbo** ni kiwezeshaji cha nguzo mtambuka — kinapendekezwa na nguzo za Ubora wa Uendeshaji, Usalama, na Uaminifu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Msalaba wa vikoa — vikoa vyote*

- **Jua nguzo zote sita na mwelekeo wao wa msingi**. Mtihani utaelezea hali (mfano, "timu inataka kuhakikisha mfumo wao unaweza kurejesha kutoka kushindwa kwa AZ") na kuuliza ni nguzo gani inalingana (Uaminifu).
- **Ramani ya nguzo**:
  - "Sambaza mabadiliko kwa kuaminika, jifunza kutoka kushindwa, fuatilia" → Ubora wa Uendeshaji
  - "IAM, usimbaji fiche, vidhibiti vya mtandao, ugunduzi wa vitisho" → Usalama
  - "HA, kushindwa hama, kupanua, DR" → Uaminifu
  - "Kupanga saizi sahihi, CDN, uteuzi sahihi wa teknolojia" → Ufanisi wa Utendaji
  - "Mifano ya bei, rasilimali zisizotumika, uwazi wa gharama" → Uimarishaji wa Gharama
  - "Ufanisi wa nishati, matumizi ya rasilimali, mzunguko wa maisha wa data" → Uendelevu
- **Miundombinu kama Msimbo**: Imependekezwa na mfumo kwa kurudiwa, uwezekano wa kukagua, na uokoaji. CloudFormation, CDK, na SAM ni zana za IaC za AWS asili.
- **Zana ya Ujenzi Bora**: Zana ya koni ya AWS inayoongoza mchakato wa mapitio. Bure kutumia. Inazalisha mipango ya maboresho.
- **AWS Trusted Advisor**: Inafanana na mfumo wa Ujenzi Bora lakini wa kiotomatiki — inachunguza akaunti yako na kutoa mapendekezo katika gharama, utendaji, usalama, na ustahimilivu wa hitilafu. Mwingiliano ni wa kweli: Trusted Advisor inafanya kiotomatiki baadhi ya kile mfumo unakadiria kwa mkono.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Taja nguzo sita za Mfumo wa Ujenzi Bora wa AWS na eleza wasiwasi wa msingi wa kila moja katika sentensi moja.

*(Jaribu kufanya hivi kwa kumbukumbu. Ikiwa unahangaika, hiyo ni taarifa muhimu kuhusu nguzo zipi zinahitaji umakini zaidi.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Timu ya uhandisi inajiandaa kwa mapitio ya Ujenzi Bora. Programu yao inaendesha kwenye EC2 na RDS Multi-AZ. Hivi karibuni, waligundua kwamba:

- Mchakato wao wa usambazaji wakati mwingine huacha vipengele vya EC2 na matoleo tofauti ya maktaba (kujiteleza kwa usanidi)
- Hawana tahadhari ya kiotomatiki wakati kushindwa hama kwa RDS kunaanzishwa
- Watumiaji wao wote wa IAM wana AdministratorAccess
- Hawajajaribu mchakato wao wa kurejesha nakala kwa miezi 14

Ramani kila tatizo kwa nguzo INAYOHUSIANA ZAIDI ya Ujenzi Bora.

A) Kujiteleza kwa usanidi: Ubora wa Uendeshaji; Hakuna tahadhari ya kushindwa hama kwa RDS: Uaminifu; AdministratorAccess: Usalama; Hakuna jaribio la kurejesha nakala: Uaminifu

B) Kujiteleza kwa usanidi: Usalama; Hakuna tahadhari ya kushindwa hama kwa RDS: Ufanisi wa Utendaji; AdministratorAccess: Ubora wa Uendeshaji; Hakuna jaribio la kurejesha nakala: Uimarishaji wa Gharama

C) Kujiteleza kwa usanidi: Uaminifu; Hakuna tahadhari ya kushindwa hama kwa RDS: Ufanisi wa Utendaji; AdministratorAccess: Usalama; Hakuna jaribio la kurejesha nakala: Ubora wa Uendeshaji

D) Kujiteleza kwa usanidi: Usalama; Hakuna tahadhari ya kushindwa hama kwa RDS: Uaminifu; AdministratorAccess: Uimarishaji wa Gharama; Hakuna jaribio la kurejesha nakala: Usalama

**Kidokezo cha 1**: "Kujiteleza kwa usanidi" katika mchakato wa usambazaji → ni nguzo gani inashughulikia mazoea ya usambazaji?

**Kidokezo cha 2**: "AdministratorAccess" kwa watumiaji wote → ni nguzo gani inashughulikia udhibiti wa ufikiaji?

**Kidokezo cha 3**: "Kurejesha nakala hakujajaribiwa" → ni nguzo gani inashughulikia kujaribu taratibu zako za uokoaji?

**Jibu**: A

**Maelezo**: Kujiteleza kwa usanidi katika usambazaji (mazingira yasiyofanana) ni tatizo la Ubora wa Uendeshaji — linahusu mazoea ya usambazaji ya kuaminika, thabiti. Hakuna tahadhari kwenye kushindwa hama kwa RDS kunamaanisha hujui taratibu za HA zinaanzishwa lini — tatizo la Uaminifu (kujua afya ya mfumo wako). AdministratorAccess kwa watumiaji wote inakiuka upendeleo mdogo — tatizo la Usalama. Kurejesha nakala kusikojaribiwa kunamaanisha taratibu zako za Uaminifu (DR) hazijathibitishwa.

**Kwa nini si B?** B inaweka vibaya kujiteleza kwa usanidi kwa Usalama (matoleo yasiyofanana ya maktaba ni tatizo la uendeshaji wa usambazaji, si tishio la usalama) na AdministratorAccess kwa Ubora wa Uendeshaji (udhibiti wa ufikiaji ni wasiwasi wa Usalama, si mchakato wa uendeshaji).

**Kwa nini si C?** C inaweka vizuri AdministratorAccess katika Usalama lakini inaweka vibaya kujiteleza kwa usanidi kwa Uaminifu (uthabiti wa usambazaji ni Ubora wa Uendeshaji) na kurejesha nakala kusikojaribiwa kwa Ubora wa Uendeshaji (kujaribu uokoaji ni wasiwasi wa Uaminifu — unathibitisha kwamba mfumo wako unaweza kurejesha, si kwamba michakato yako ni thabiti).

**Kwa nini si D?** D inaweka AdministratorAccess kwa Uimarishaji wa Gharama (ruhusa pana kupita kiasi hazina uhusiano na gharama) na kurejesha nakala kusikojaribiwa kwa Usalama (kutoweza kurejesha nakala ni kushindwa kwa Uaminifu, si udhaifu wa usalama).

*SAA-C03 Kikoa: Msalaba wa vikoa*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Fanya mapitio madogo ya Ujenzi Bora ya programu unayoijua au unayoijenga. Kwa kila nguzo sita, andika:

- Kitu kimoja programu inachofanya vizuri
- Kitu kimoja programu inachoweza kuboresha

Kisha panga vipengele vyako vya maboresho kwa hatari (nini kina uwezekano mkubwa wa kusababisha tukio au taka?) na kipaumbele (nini kingekuwa na athari kubwa zaidi ikiwa kingerekebishwa?).

*(Zoezi hili lina thamani zaidi kuliko linavyoonekana. Mazoea ya kutathmini usanifu kwa utaratibu kutoka pembe nyingi ni ujuzi wa msingi wa mhandisi mwandamizi.)*

## Tukio Baada ya Mikopo

Wiki tatu baada ya mapitio ya Ujenzi Bora, timu ilikuwa imetekeleza marekebisho matatu ya P1 — majukumu saba ya Lambda yalikuwa ya upendeleo mdogo, matumizi ya root yalisababisha tahadhari, na kushindwa hama kwa Aurora kulikuwa kumejaribiwa chini ya mzigo Jumanne saa 8 usiku — na kazi ya P2 ilikuwa ikiendelea.

Upigaji viraka wa EC2 sasa ulifanywa kiotomatiki kupitia AWS Systems Manager Patch Manager. Hati ya mchakato wa majibu ya tukio ilikuwepo (si kamili, lakini imeandikwa na kushirikiwa). Mpango wa nakala ya hifadhi ya joto wa kanda nyingi ulikuwa umechorwa na umepangwa kwa utekelezaji robo ijayo.

Priya alipitia ripoti ya Zana ya Ujenzi Bora. Matokeo ya P1 yalikuwa yamefungwa au yalipewa na ushahidi. Vitu vyenye hatari ya wastani na chini vilikuwa vikipungua, vikiwa na wamiliki na tarehe.

"Tuko katika hali bora zaidi kuliko tulivyokuwa," alisema.

"Je, hiyo ni nzuri?" Leo aliuliza.

"Ni maendeleo," alisema. "Hukamilishi mapitio ya Ujenzi Bora. Unafanya maendeleo, kisha unapitia tena baada ya miezi sita."

Maya alikuwa akifikiria kitu fulani.

"Tumetumia sura 31 tukijifunza huduma za mtu mmoja za AWS," alisema. "Na sasa tunaanza kuangalia mfumo mzima. Ambayo ndiyo jinsi wasanifu wanavyofikiri."

"Tumekuwa tukifikiri kama wasanifu kwa muda," Leo alisema.

"Tumekuwa tukifanya maamuzi ya usanifu," Maya alisema. "Hiyo ni tofauti. Kufikiri kama msanifu kunamaanisha unatathmini maamuzi *kabla* ya kuyafanya, si baadaye."

"Tofauti ni nini?" Tom aliuliza.

"Katika sura inayofuata," alisema, "tunajaribu kulijibu hilo."

Katika sura inayofuata: mapitio halisi ya usanifu yanaonekanaje, kutoka kanuni za kwanza.
