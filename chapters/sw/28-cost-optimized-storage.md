# Sura ya 28: Mshangao wa Bili ya Uhifadhi

Lahajedwali lilikuwa na vichupo kumi na sita sasa. Tom aliliweka wazi kwenye dirisha la pili, jinsi watu wengine wanavyoweka orodha ya manunuzi — daima inaonekana, daima inaongezeka. Aliongeza safu mpya kwa EC2 (imekamilika, Savings Plan imejitolewa) na kuhamisha kishale chake hadi mstari unaofuata.

Uhifadhi.

**Muhtasari wa Haraka: EC2 Imepangwa, Kipengee Kimoja Kinabaki**

Kazi ya bei za kompyuta ya Sura ya 27 ilikuwa imethibitisha mkakati wa EC2: Compute Savings Plan ya $0.45/saa kwa muda wa miaka mitatu, pamoja na Spot kwa kazi ya kundi ya usiku — akiba iliyokadiriwa ya $42,500 zaidi ya muda huo. Kazi hiyo ilikamilika, na ilifanyika vizuri. Lakini ulikuwa mstari mmoja kwenye bili. Tom alikuwa amejifunza, kutoka miezi sita ya uchambuzi wa gharama wa Athena, kwamba bili ilikuwa na mistari mingi — na kwamba kila mmoja ulistahili uchunguzi ule ule. S3 ilikuwa inayofuata: $198/mwezi, tayari imeboreshwa kutoka $847 baada ya mabadiliko ya sera ya mzunguko wa maisha kutoka Sura ya 23. Nambari iliyovuta jicho lake, hata hivyo, ilikuwa chini zaidi kwenye ukurasa. EBS: $440/mwezi.

"Hiyo inaonekana juu," alisema.

Leo alivuta orodha ya kiasi cha EBS. Kulikuwa na kiasi 47 cha EBS kilichounganishwa na vipengele. Kisha kulikuwa na kiasi kingine 23 kisichoambatishwa na kipengele chochote.

"Kiasi hiki 23," Tom alisema. "Ni nini?"

**Ukaguzi wa Kiasi Yatima**

Leo alianza kuvipitia kimoja baada ya kingine. Huu haukuwa mchakato wa haraka — kiasi hazikuwa zimewekewa lebo kwa usawa, lebo zilikuwa hazifuati mfumo, na baadhi zilikuwa zimeundwa muda mrefu sana hivi kwamba hakuna aliyekumbuka muktadha. Tom alivuta kiti na kutazama.

Kiasi ebs-021a4c. Iliundwa miezi 16 iliyopita. Lebo: "debug-prod-db-snapshot-restore." Ukubwa: 200GB. Kuambatishwa kwa mwisho: kamwe, au historia ya kuambatishwa ilifutwa.

"Hicho ninakikumbuka," Leo alisema. "Tulikuwa na tatizo la hoji la hifadhidata na nilirejesha picha kuangalia data. Niliiangalia, sikupata tatizo hapo, na nikasahau kufuta kiasi."

Kiasi ebs-07f38b. Iliundwa miezi 11 iliyopita. Lebo: "load-test-temp." Ukubwa: 400GB.

Leo alikuwa kimya kwa muda. "Nadhani hilo lilikuwa jaribio la mzigo tulilolifanya kabla ya pitchi ya Series Seed. Tulitoa vipengele vya ziada vyenye uhifadhi wa ziada kuiga mzigo wa kilele na kisha... sidhani niliifuta yoyote kati yake baada ya hapo."

"Tayari niliisambaza — lo," alisema. "Jaribio la mzigo lilikuwa la muda. Kiasi hazikuwa."

Kiasi ebs-0ab12c hadi ebs-0ab134. Kiasi nane mfululizo, kilichoundwa miezi 9 iliyopita. Lebo: "k8s-experiment." Ukubwa: 100GB kila kimoja, 800GB jumla.

"Hilo lilikuwa tathmini ya Kubernetes," Priya alisema, akiangalia juu ya bega la Leo. "Tulitumia wiki tatu kutathmini kama tuhamie ECS au EKS. EKS ilikuwa ya pili. Tulivunja nguzo ya majaribio lakini inaonekana tuliacha kiasi vya kudumu."

Tom alikuwa akijumlisha kwenye kichupo tofauti. Kiasi kwa kiasi, nambari zilisanyika:

- Kiasi vya kurejesha utatuzi: kiasi 4 × 200GB = 800GB
- Kiasi vya jaribio la mzigo: kiasi sita kati ya 200 na 400GB — takriban 1,200GB kwa jumla
- Kiasi vya jaribio la Kubernetes: kiasi 8 × 100GB = 800GB
- Visivyolebewa mbalimbali: kiasi 5 × ukubwa mbalimbali = ~700GB

Jumla: takriban 3,500GB katika kiasi 23 visivyoambatishwa.

"Hii inagharimu kiasi gani kwa mwezi?" Tom aliuliza. Jibu: gp3 kwa $0.08/GB/mwezi. 3,500GB × $0.08 = $280/mwezi.

Aliangalia tarehe ya zamani zaidi ya uundaji. Miezi kumi na sita. Alitoa kikokotoo.

"Tumekuwa tukilipa baadhi ya hizi kwa miezi kumi na sita," alisema. "Baadhi kwa tisa. Wastani pengine miezi kumi katika zote." Kiasi 23, wastani $12/mwezi kila kimoja, wastani miezi 10. Hiyo ilikuwa takriban $2,760. Ongeza kiasi vikubwa zaidi na hesabu ikatoa takriban $3,200 kwa jumla ya taka.

"Dola elfu tatu na mia mbili," Tom alisema. "Kutoka kiasi ambazo hakuna aliyekuwa akizitumia."

"Na hakuna aliyegundua kwa sababu malipo yamesambazwa katika kadhaa ya vipengee vya bili," Leo alisema. "Si malipo moja ya $3,200. Ni malipo 23 ya $12 au $50 au $80 kwa mwezi, kila moja peke yake ni ndogo vya kutosha kutosababisha tahadhari yoyote."

Tom alifuta kiasi vyote 23 visivyoambatishwa. Alithibitisha na Leo na Priya kwamba kila kimoja hakikuwa na data waliyoihitaji — kiasi cha utatuzi kilikuwa data iliyochakaa kutoka hifadhidata ambayo tangu wakati huo ilikuwa imehamishwa, data ya jaribio la mzigo haikuwa na umuhimu, kiasi vya jaribio la Kubernetes vilikuwa tupu. Ufutaji ulichukua dakika kumi na tano. Mwezi uliofuata, bili ya EBS ilishuka kutoka $440 hadi $160.

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza, Tom alipomweleza ugunduzi. "Kwa nini kufuta kiasi si chaguo-msingi unapomaliza kipengele?"

"Inategemea kiasi," Tom alisema. "Kiasi cha **mizizi** kinafutwa kwa chaguo-msingi — `DeleteOnTermination` ni kweli kwacho. Lakini kiasi chochote cha **ziada** cha data unachoambatisha kina chaguo-msingi cha kuhifadhiwa. Dhana ni kwamba unaweza kuhitaji data iliyokuwa juu yake. Kiasi hivi 23 yatima vyote vilikuwa kiasi vya data — vilivyoambatishwa kwa kipindi cha utatuzi au jaribio la mzigo, kisha vilivyoachwa nyuma kipengele kilipomalizwa."

"Kwa hivyo chaguo-msingi linakulinda dhidi ya upotevu wa data wa bahati mbaya kwenye kiasi vya data."

"Na linakugharimu pesa ikiwa hauzingatii. Kuanzia sasa: kiasi chochote cha ziada cha data kinafutwa kwa uwazi kipengele kinapomalizwa — au kinapata `DeleteOnTermination` iliyowekwa wakati wa kuambatisha — isipokuwa mtu atatoa sababu iliyoandikwa kwa nini wanahitaji kuvihifadhi."

"Je, tumefikiria nini hutokea ikiwa mtu atasahau kuandika sababu hiyo?" Priya aliuliza. "Tungeweza kufuta kitu muhimu."

"Hiyo ndiyo biashara ya mbadala," Tom alisema. "Sasa hivi biashara ya mbadala iko katika upande mwingine — tunadhani kila kitu kinapaswa kuhifadhiwa na tunalipa kwacho wakati hakistahili. Nidhamu ya kuandika 'hifadhi kiasi hiki' ina hatari kidogo kuliko chaguo-msingi la sasa la 'hifadhi kila kitu kimya.'"

**Ukaguzi wa Gharama za Uhifadhi**

Ugunduzi wa EBS wa Tom ulikuwa dalili ya mchakato mpana zaidi: gharama za uhifadhi zinasanyika bila kuonekana. Tofauti na kompyuta (unagundua seva 47 zinapoendesha), uhifadhi hujaza kimya kimya.

Fikiria kama kukodisha kitengo cha kuhifadhi. Kukodisha kitengo kimoja ni dhahiri kwenye taarifa ya kadi ya mkopo. Lakini ukikodisha kitengo cha pili kwa mradi, kisha cha tatu kwa samani za zamani, na hukurudi kamwe kuangalia kilichomo — malipo yanaendelea kutokea kila mwezi, kimya, muda mrefu baada ya kusahau ulichokuwa hata ukihifadhi. Uhifadhi wa wingu hufanya kazi kwa njia ile ile: baiti hukaa hapo, ankara inafika, na hakuna anayeuliza mpaka mtu mwishowe afungue mlango na kukuta umejaa vitu ambavyo hakuna mtu anavyohitaji tena.

Ukaguzi kamili wa gharama za uhifadhi unatazama:

**S3**:

- Je, sera za mzunguko wa maisha zipo kwa ndoo zote?
- Je, kuna picha za zamani (za RDS, za EBS) zilizopo kwenye S3?
- Je, Intelligent-Tiering inafaa kwa ndoo yoyote zenye mifumo ya ufikiaji isiyoweza kutabiriwa?
- Je, kuna vitu vilivyopigwa toleo vikizalisha nakala nyingi ambazo hazipatikani kamwe?
- Je, kuna upakiaji wa sehemu nyingi usiokamilika unaosanyika kimya?

**EBS**:

- Je, kuna kiasi chochote kisichoambatishwa (hakuna kipengele kinachoendesha kikitumia)?
- Je, kiasi cha gp3 kimesanidiwa ipasavyo? (Kiasi cha chaguo-msingi cha gp3 kinaweza kuwa na uendeshaji/IOPS wa ziada uliotolewa ambao hauhitajiki)
- Je, picha za zamani zaidi ya zinazohitajika zinahifadhiwa?

**RDS**:

- Je, vipindi vya uhifadhi wa nakala za kiotomatiki vimewekwa ipasavyo? (Ndefu zaidi = gharama zaidi ya uhifadhi)
- Je, picha za mkono kutoka vipengele vya zamani bado zipo?
- Je, nakala za kusomwa kutoka uhamiaji wa hifadhidata bado zinaendesha?

**EFS**:

- Je, kiasi cha EFS kiko katika darasa sahihi la uhifadhi? (Standard dhidi ya Infrequent Access)

**Upigaji Toleo wa S3: Gharama Iliyofichwa**

Katika Sura ya 5, tulitaja kwamba upigaji toleo wa S3 huhifadhi kila toleo la awali la kitu. Hii ni nzuri sana kwa usalama. Ni mbaya kwa gharama ikiwa pia huna sheria za mzunguko wa maisha kwa matoleo.

Upigaji toleo ukiwezeshwa kwenye ndoo, kila wakati unaposasisha kitu, toleo la zamani linahifadhiwa. Kwa muda:

- Siku 1: Picha ilipakiwa (v1)
- Siku 30: Picha ilisasishwa (v1 sasa ni toleo "lisilo la sasa", v2 ni la sasa)
- Siku 60: Picha ilisasishwa tena (v1 na v2 si za sasa, v3 ni ya sasa)
- Siku 365: v1, v2... v12 zimehifadhiwa zote. Unalipa kwa nakala 12 za picha.

Huenda unajiuliza kwa nini upigaji toleo hauondoi matoleo ya zamani kiotomatiki. Jibu ni la makusudi — AWS haitaki kufuta data yako kiotomatiki. Lakini matokeo ni kwamba kila toleo linasanyika hadi uiambie S3 kwa uwazi kwa muda gani la kuyahifadhi. Marekebisho: sheria za mzunguko wa maisha kwa matoleo yasiyo ya sasa.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom alitumia sheria hizi kwa ndoo zote zilizopigwa toleo. Mwezi uliofuata, uhifadhi wa S3 ulipungua kwa 18%.

**Upakiaji wa Sehemu Nyingi Usiokamilika: Usanyikaji Usioonekana**

Kuna gharama ya hila zaidi ya S3 ambayo wahandisi wengi wanaipuuza kabisa: upakiaji wa sehemu nyingi usiokamilika.

S3 inapopakia faili kubwa, inaivunja kuwa sehemu na kupakia kila moja kivyake. Huu ndio utaratibu wa upakiaji wa sehemu nyingi — wa kuaminika zaidi kuliko PUT kubwa moja kwa faili zaidi ya mamia ya megabaiti chache. Lakini ikiwa upakiaji utaanza kisha kushindwa katikati — usumbufu wa mtandao, kuvunjika kwa mteja, hitilafu ya programu — sehemu zilizopakiwa tayari zinabaki katika S3. Hazionekani kama vitu katika ndoo yako. Hazitokei katika orodha yoyote. Lakini zimehifadhiwa, na unalipiwa kwacho kwa viwango vya kawaida vya S3.

Tom alipata hili kwa kuwezesha dashibodi ya S3 Storage Lens katika koni ya S3 na kupanga kwa "incomplete multipart uploads." Nimbus ilikuwa na 340GB za data ya upakiaji wa sehemu nyingi usiokamilika ikikaa kimya katika ndoo katika akaunti nne za AWS, baadhi yake zaidi ya mwaka mmoja.

"Hii inagharimu kiasi gani kwa mwezi?" Tom aliuliza. $0.023/GB/mwezi × 340GB = $7.82/mwezi. Ndogo peke yake. Lakini ilikuwa imekuwa ikisanyika kwa mwaka bila mtu yeyote kugundua.

Marekebisho: ongeza sheria ya mzunguko wa maisha kwa kila ndoo.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Baada ya siku saba, upakiaji wowote wa sehemu nyingi usiokamilika unasafishwa kiotomatiki. Hii inaendesha bila kikomo bila uangalizi wowote unaoendelea.

"Ikiwa yote hayo yangekuwa yamekaa hapo mwaka mzima — kuna $94 tumetumia kwenye upakiaji ulioshindwa," Leo alisema.

"Kwenye upakiaji ulioshindwa," Tom alithibitisha. "Si hata kwenye uhifadhi uliofanikiwa. Hii ndiyo ufafanuzi wa taka ya miundombinu."

**EBS: Kupanga Saizi Sahihi na Uboreshaji wa gp3**

Bei ya kiasi cha EBS ina sehemu mbili:

1. Uhifadhi (kwa GB kwa mwezi)
2. IOPS na uendeshaji uliotolewa (ikiwa uko kwenye io1/io2 au unalipa kwa utendaji wa ziada wa gp3)

**Fursa ya gp3**: Katika Sura ya 6, tulibainisha kwamba gp3 ni chaguo-msingi cha sasa na ni nafuu kuliko gp2. Ikiwa Nimbus ilikuwa na kiasi kilichoundwa kabla gp3 haijapatikana (ilizinduliwa Desemba 2020), kinaweza bado kuwa gp2.

Uhamiaji ni rahisi: badilisha aina ya kiasi kutoka gp2 hadi gp3 katika koni ya AWS au kupitia CLI. Hakuna muda wa kupumzika unaohitajika. Kiasi kinabaki kupatikana wakati wa ubadilishaji. Sifa za utendaji ni sawa au bora — gp3 inatoa IOPS 3,000 na uendeshaji wa msingi wa MB/s 125, ikilinganishwa na mfano wa gp2 unaoweza kupasuka ambao ungeweza kuwa usio thabiti kwa kiasi vidogo.

"Subiri — lakini *kwa nini* tungefanya hivyo?" Maya aliuliza. "Ikiwa gp3 ni nafuu na angalau ni nzuri kama gp2, kwa nini AWS haikuhamisha kila mtu kiotomatiki?"

"Kwa sababu AWS haifanyi mabadiliko ya upande mmoja kwa miundombinu ya mteja," Tom alisema. "Hata yenye manufaa. Marekebisho yangeweza kinadharia kuwa na athari za pembeni kwa baadhi ya mzigo wa kazi. Mteja lazima auanzishe. Ndiyo sababu maelfu ya timu bado wanalipa bei za gp2 miaka baada ya gp3 kuzinduliwa, kwa sababu tu hakuna aliyeenda kutafuta."

Tom aliamua kufanya uhamiaji wa gp3 asubuhi ya Jumamosi — nidhamu ile ile ya asubuhi aliyoitumia kwenye uchambuzi wa bei za EC2. Muda wa kimya. Hakuna mikutano ya kusimama. Koni ya AWS na mpango tu.

Alikuwa ametambua kiasi 8 katika mazingira ya uzalishaji ambavyo bado vilikuwa gp2: kiasi vinne vya mizizi vya seva za API, kiasi viwili vilivyoambatishwa kwa vichakataji vya usuli, na kiasi viwili vya urithi vya data vilivyoundwa kabla uhamiaji wa gp3 kuwa kanuni ya kawaida kwa usambazaji mpya. Pamoja vilijumlika GB 960.

Mchakato wa uhamiaji ulikuwa wito mmoja wa API kwa kila kiasi:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Vigezo vya `--iops 3000` na `--throughput 125` vililingana na chaguo-msingi za msingi za gp3. Kwa gp2, Tom alikuwa ameangalia vipimo vya CloudWatch kwanza: wastani wa IOPS kwa kila kiasi ulikuwa kati ya 200 na 800. Hakuna kati yake kilichohitaji zaidi ya msingi wa IOPS 3,000 ambao gp3 ilitoa bila malipo. Uendeshaji ulikuwa pia wa starehe vivyo hivyo — ndani kabisa ya chaguo-msingi cha MB/s 125.

"Vipi ikiwa kiasi kinahitaji IOPS zaidi baada ya kubadilisha?" Maya aliuliza, Tom alipoeleza mpango wa uhamiaji.

"Tunaweza kuongeza IOPS zilizotolewa kwenye kiasi cha gp3 wakati wowote," Tom alisema. "Uhamiaji haufungi chochote. Tukienda gp3 kwa IOPS 3,000 na kugundua hizo hazitoshi, tunarekebisha kiasi tena kuongeza zaidi. Marekebisho ni ya moja kwa moja — hakuna muda wa kupumzika, hakuna kuondoa."

"Na gp2 haiwezi kurekebishwa papo hapo?"

"gp2 inaweza kurekebishwa kuwa gp3 papo hapo. Kile usichoweza kufanya ni kurudi kutoka gp3 hadi gp2 — angalau, si kwa urahisi, na hakuna sababu ya kufanya hivyo."

Uhamiaji halisi ulichukua dakika 73 kutoka amri ya kwanza hadi kukamilika katika kiasi vyote 8. AWS ilirekebisha kila kiasi wakati kilipokuwa kimewekwa na kinatumika. Seva za API ziliendelea kupokea trafiki muda wote. CloudWatch haikuonyesha mabadiliko yoyote ya ghafla katika muda wa kuchelewa wa I/O wakati wa ubadilishaji — mpito ulikuwa wazi kabisa kwa programu inayoendesha.

"Hivyo ndivyo 'hakuna muda wa kupumzika unaohitajika' unavyoonekana kweli," Leo alisema, akiangalia vipimo vya kabla-na-baada Tom alivyokamata. "Nilidhani 'hakuna muda wa kupumzika' ulimaanisha 'uanzishaji upya mfupi.' Inamaanisha hakuna kinachobadilika kabisa kutoka mtazamo wa programu."

Akiba: gp2 ilikuwa $0.10/GB/mwezi; gp3 ilikuwa $0.08/GB/mwezi. Kwa GB 960: $96/mwezi dhidi ya $76.80/mwezi. Akiba ya kila mwezi: $19.20. Si ya kubadilisha mambo peke yake, lakini nidhamu iliyowakilisha ndiyo ilikuwa. Kiasi kipya chochote kilichoundwa tangu hatua hiyo kuendelea kilitumia gp3 kwa chaguo-msingi. Kanuni ya shirika Tom aliyoiandika asubuhi hiyo: hakuna kiasi vya gp2. Mhandisi yeyote anayeunda kiasi cha EBS anapaswa kutumia gp3 isipokuwa kuna sababu mahususi, iliyoandikwa vinginevyo.

**IOPS na uendeshaji**: Kiasi cha gp3 huja na IOPS 3,000 na uendeshaji wa MB/s 125 kwa chaguo-msingi, bila malipo ya ziada. Unaweza kutoa zaidi ikiwa mzigo wako wa kazi unahitaji. Pitia kama utendaji uliotolewa unatumika kweli.

Katika ukaguzi ule ule, Tom alipata kiasi viwili vyenye IOPS 10,000 zilizotolewa — mpangilio wa urithi kutoka kabla yeye kujiunga, uliotolewa kwa hifadhidata ambayo tangu wakati huo ilihamishwa kwenda Aurora. Aliangalia vipimo vya CloudWatch: wastani halisi wa IOPS ulikuwa 1,200. Alipunguza IOPS zilizotolewa hadi 4,000 (msimamo wa usalama juu ya kilele halisi).

Akiba ya kila mwezi: $68 katika gharama za IOPS zilizotolewa zilizokuwa zikilipia nafasi ya utendaji ambayo hakuna aliyekuwa akiitumia.

**Mzunguko wa maisha wa picha**: Picha za EBS ni za ziada (kila picha inahifadhi mabadiliko tu tangu ile iliyotangulia), lakini zinasanyika. Picha za zamani kutoka siku za mwanzo za Nimbus bado zilipo. Tom alihifadhi siku 30 za picha za kila siku na kufuta iliyobaki.

**EFS: Madarasa ya Uhifadhi na Uamuzi wa Intelligent-Tiering**

Amazon EFS ina madarasa yake ya uhifadhi:

- **EFS Standard**: Kwa faili zinazofikiwa mara kwa mara. Gharama ya juu zaidi.
- **EFS Infrequent Access (IA)**: Kwa faili zisizofikiwa kwa siku 30. Nafuu kwa 92% kuliko Standard.
- **EFS Archive**: Kwa faili zisizofikiwa kwa siku 90. Nafuu zaidi kuliko IA.

**EFS Intelligent-Tiering**: Huhamisha faili kiotomatiki kati ya madarasa ya uhifadhi kulingana na mifumo ya ufikiaji.

Tom aliwezesha Intelligent-Tiering kwenye kiasi cha EFS. Wiki sita baadaye, 68% ya faili zilikuwa zimehama kwa Infrequent Access. Gharama ya kila mwezi ya EFS ilishuka kutoka $89 hadi $31.

Lakini uchaguzi kati ya Intelligent-Tiering na sheria ya mzunguko wa maisha ya mkono haukuwa rahisi. Tom alikuwa ameuzingatia.

"Subiri — lakini *kwa nini* tungefanya Intelligent-Tiering badala ya kuweka tu sheria ya mzunguko wa maisha ya mkono?" Maya aliuliza. "Ikiwa tunajua kwamba faili za zaidi ya siku 30 hazifikiwi, kwa nini tusiweke tu sheria na kumaliza?"

"Intelligent-Tiering inashughulikia faili zinazorudi," Tom alisema. "Ikiwa nitaweka sheria ya mzunguko wa maisha kuhamisha faili kwenda IA baada ya siku 30, na kisha mtu afikie faili iliyokuwa katika IA kwa miezi sita, inabaki katika IA. Kwa Intelligent-Tiering, ikiwa ufikiaji unaanza tena, faili inahamia Standard kiotomatiki. Ni ya pande mbili."

"Ungependelea sheria ya mzunguko wa maisha lini basi?"

"Wakati una uhakika muundo wa ufikiaji ni wa upande mmoja. Kumbukumbu za logi — zinaandikwa, zinazeeka, zinafikiwa mara moja kwa ukaguzi wa uzingatifu na kisha kamwe tena. Kwa muundo huo, sheria ya mzunguko wa maisha inayohamisha kwenda Archive baada ya siku 90 ni nafuu kuliko Intelligent-Tiering kwa sababu hulipi gharama ya ufuatiliaji."

"Kuna ada ya ufuatiliaji?"

"Kwa S3 Intelligent-Tiering, ndiyo, ndiyo sababu tulishughulikia uchumi wa vitu vidogo huko nyuma katika sura ya mzunguko wa maisha wa S3. Kwa EFS, uamuzi ni hasa kuhusu muundo wa ufikiaji: ikiwa faili zinaweza kuwa moto tena, Intelligent-Tiering ni salama zaidi. Ikiwa zinazeeka kwa upande mmoja tu, sheria ya mzunguko wa maisha kwenda Archive ni nafuu na rahisi zaidi."

**Lebo za Ugawaji wa Gharama za S3: Kupata Ni Nani Anatumia Nini**

Nimbus ilipokua, timu nyingi zilikuwa zikihifadhi data kwenye S3. Timu ya uchambuzi ilikuwa na ndoo zao. Timu ya uhandisi ilikuwa na ndoo zake. Timu ya data ya mgahawa ilikuwa na ndoo zake.

Bili ilionyesha tu "S3: $198." Hapakuwa na mgawanyo kwa timu.

**Lebo za ugawaji wa gharama (Cost allocation tags)** zinakuruhusu kuweka lebo kwa rasilimali za AWS na metadata ya biashara (timu, mradi, mazingira) na kisha kuona gharama zimegawanywa kwa lebo hizo katika AWS Cost Explorer.

Tom aliongeza lebo kwa ndoo zote za S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Baada ya mzunguko wa malipo na kuweka lebo, aliweza kuona: "Ziwa la data la timu ya uchambuzi ni $74/mwezi. Nakala za uhandisi ni $43/mwezi. Data ya mgahawa ni $81/mwezi."

Sasa aliweza kuwa na mazungumzo ya bajeti na kila timu badala ya kutazama tu nambari ya jumla.

**AWS Cost Explorer na AWS Budgets**

**AWS Cost Explorer**: Inaonyesha gharama za kihistoria na za utabiri kwa huduma, mkoa, lebo, na aina ya matumizi. Muhimu kwa kuelewa fedha zinapokwenda.

**AWS Budgets**: Huweka tahadhari gharama zinapozidi (au zinatarajiwa kuzidi) kiwango cha mwisho. Unaweza kupanga bajeti kwa huduma, mkoa, lebo, au akaunti.

Tom alipanga bajeti tatu:

1. Bili ya jumla ya kwa mwezi: Tahadhari kwa 90% ya kiasi kilichopangwa
2. EC2 On-Demand: Tahadhari ikiwa matumizi ya On-Demand yanazidi $500/mwezi (ishara ya pengo la Savings Plan)
3. Uhamishaji wa data nje: Tahadhari kwa $200/mwezi (gharama za uhamishaji wa data zinaweza kupanda bila kutarajiwa)

Bajeti zilituma tahadhari kwa kituo cha Slack. Timu iliona walipokuwa wakikaribia mipaka, badala ya kugundua kwenye ankara ya kila mwezi.

**Risiti Yenye Kila Mstari: Cost and Usage Reports**

Cost Explorer ilijibu maswali mengi ya Tom. Kisha aligonga moja ambalo haikuweza: "ni ndoo zipi za S3 hasa, saa kwa saa, zilizoendesha mlipuko wa Jumanne iliyopita — na chini ya lebo zipi?"

Kwa maswali ya kiwango cha uchunguzi wa kisheria, AWS inatoa **Cost and Usage Report (CUR)** — sasa inawasilishwa kupitia **Data Exports** — data ya kina zaidi ya malipo ambayo AWS inazalisha: kila kipengee, **kwa kila rasilimali, kwa kila saa**, na lebo, inawasilishwa kwa ndoo ya S3 unayoimiliki. Si dashibodi; ni daftari ghafi. Muundo wa kawaida ni kuihoji na Athena (inafika katika muundo wa safu wima) au kuilisha QuickSight kwa dashibodi.

Mgawanyo wa kazi kwenye mtihani: **Cost Explorer** = taswira shirikishi na utabiri katika koni. **Budgets** = tahadhari kwenye viwango vya mwisho. **CUR/Data Exports** = data ya kina zaidi, inayowasilishwa kwa S3, kwa uchambuzi wako mwenyewe. Swali linaposema "data ya gharama ya kiwango cha rasilimali, ya kila saa kwa uchambuzi maalum" — hiyo ndiyo CUR, si Cost Explorer.

"Je, tumefikiria nini hutokea ikiwa hatuangalii hili kamwe?" Priya aliuliza. "Tumepata $6,700 katika siku mbili. Ni nini kingine bado kinajificha?"

"Ukaguzi wa kawaida," aliendelea. "Mapitio ya kila mwezi ya Cost Explorer. AWS Trusted Advisor huweka alama kiasi kisichoambatishwa na rasilimali zisizofanya kazi kiotomatiki. Fanya kiotomatiki usafishaji wa mifumo ya taka inayojulikana: futa picha za zaidi ya N siku, tahadhari kwenye kiasi kisichoambatishwa cha EBS, maliza matoleo ya zamani ya S3."

**S3 Requester-Pays: Kuhamisha Gharama ya Uhamishaji**

Wakati wa ukaguzi wa uhifadhi, Tom alipata hali ambayo hakuwa ameitarajia.

Washirika wa migahawa wa Nimbus walihitaji kupakua mali za picha za menyu zao — picha zilizochakatwa, zilizopangwa upya ukubwa ambazo jukwaa la kuagiza liliwahudumia wateja. Kwa mgahawa unaosasisha menyu yake, hii ilimaanisha kupakua kati ya 50 MB (sasisho dogo) na 800 MB (uboreshaji kamili wa msimu) wa faili za picha. Kwa sasa, Nimbus ilikuwa ikilipa gharama ya uhamishaji wa data wa nje kwenye kila upakuaji: $0.09/GB kutoka S3 hadi eneo la mshirika.

Kwa washirika 287 wa migahawa, na wastani wa uboreshaji mmoja wa menyu kwa mwezi na wastani wa upakuaji wa 200 MB, hesabu ilikuwa: 287 × 0.2GB × $0.09 = $5.17/mwezi. Si muhimu kwa kiwango cha sasa.

"Nini hutokea kwenye migahawa 2,000?" Tom aliuliza.

"Hesabu ile ile," Maya alisema. "Karibu $36/mwezi."

"Vipi kuhusu migahawa 10,000, na washirika wanapakua vifurushi vikubwa vya mali za msimu — sema, 2 GB kwa sasisho za menyu za likizo?"

Aliiendesha. 10,000 × 2GB × $0.09 = $1,800/mwezi katika uhamishaji wa data, kwa washirika tu wanaopakua mali walizozihitaji.

"Hiyo ni nambari halisi," Priya alisema.

"Je, tumefikiria nini hutokea ikiwa bili hiyo itatokea katika mwezi ule ule tunajaribu kufunga Series B?" Priya aliendelea.

"S3 Requester-Pays," Tom alisema.

S3 ina kipengele kinachoitwa Requester-Pays: kinapowezeshwa kwenye ndoo, taasisi inayotoa ombi — si mmiliki wa ndoo — inalipa gharama za uhamishaji wa data na ombi. Mmiliki wa ndoo bado analipa kwa uhifadhi. Lakini kila upakuaji kutoka ndoo unalipiwa kwa akaunti ya AWS ya mtoa ombi.

Biashara ya mbadala ni ufikiaji. Requester-Pays inahitaji watoa maombi kuwa wateja wa AWS wenye akaunti halali — ufikiaji usiothibitishwa au usiojulikana kwa ndoo ya Requester-Pays unarudisha hitilafu. Kwa washirika wa migahawa wa Nimbus, ambao walikuwa biashara zenye viwango tofauti vya ufundi, kuwataka kuwa na akaunti ya AWS ili kupakua mali zao wenyewe za menyu haukuwa mfano unaowezekana.

"Hatuwezi kufanya Requester-Pays kwa ufikiaji wa moja kwa moja wa mshirika," Maya alisema. "Washirika wetu wengi hawataweka akaunti ya AWS kupakua picha."

"Sahihi," Tom alisema. "Lakini tunaweza kuitumia kwa miundo ya B2B — minyororo mikubwa zaidi yenye timu za ufundi na akaunti za AWS. Si mgahawa mdogo kwenye kona, bali mnyororo wa hamburger wa maeneo 50 wenye timu ya uhandisi na unaounganisha na API yetu moja kwa moja. Kwa sehemu hiyo, Requester-Pays ina maana."

"Na kwa wengine?"

"Tunawapa lango la upakuaji linalotumia URL za S3 zilizotiwa saini awali. Uhamishaji bado unapitia AWS, gharama bado ni yetu — lakini pia tayari imeingizwa katika bei ya mshirika. Chaguo la Requester-Pays ni kitu tungekijenga ndani ya mazungumzo ya mkataba kwa washirika wakubwa, si kitu tunachokitumia leo."

Tom aliongeza kwenye lahajedwali chini ya "maboresho ya baadaye": S3 Requester-Pays kwa washirika wa biashara wenye akaunti za AWS. Kwa migahawa 2,000 yenye 20% ya wateja wa biashara, kwa upakuaji wa kila mwezi wa 2 GB: $72/mwezi inaweza kuhamishwa kwa washirika. Ndogo kwa kiwango hicho, lakini muundo ule ule unakuwa wa maana vifurushi vya mali vinapokua. Pitia idadi ya washirika inapozidi 1,000 au washirika wa biashara wanapoanza kuvuta vifurushi vikubwa vya msimu.

"Somo ni lile lile kama daima," Tom alisema. "Jua gharama inakuwa nini kwa kiwango kikubwa kabla hujafika kwenye kiwango hicho. Tatizo la $5 leo ni tatizo la $1,800 katika miaka mitatu. Kubuni kwa ajili yake sasa hakugharimu chochote."

**Utawala: Kufuta Kiotomatiki dhidi ya Tahadhari Pekee**

Swali la otomatiki ndilo lililozalisha kutoelewana zaidi.

"Je, tunapaswa kufuta kiotomatiki kiasi kisichoambatishwa cha EBS baada ya siku 14?" Tom aliuliza. "Sheria za AWS Config zinaweza kuviweka alama. Lambda inaweza kuvifuta kiotomatiki."

"Hapana," Priya alisema mara moja.

"Kwa nini hapana?"

"Kwa sababu kufuta kiotomatiki kunamaanisha hatimaye tutafuta kitu ambacho kilikuwa hakijaambatishwa kwa sababu. Pengine mtu aliondoa kiasi kukihamisha kwenda kipengele kingine, na kimekaa kwa siku 12 wakati mabadiliko yanapitiwa. Kufuta kiotomatiki siku ya 14 kunaharibu data hiyo."

"Kwa hivyo tahadhari pekee?" Tom alisema. "Tunapata arifa lakini hatufuti kiotomatiki."

"Tahadhari kwanza," Priya alisema. "Lazimisha binadamu kufanya uamuzi. Tahadhari ni: 'Kiasi hiki kimekuwa hakijaambatishwa kwa siku 14. Kiwekee lebo kama `keep: true` ikiwa unakihitaji, au kitawekewa alama kwa kufutwa katika mapitio yanayofuata.' Uamuzi wa binadamu kisha unaandikwa na uwepo au kutokuwepo kwa lebo."

"Hiyo ni polepole zaidi," Leo alisema.

"Ni polepole zaidi na ina uwezekano mdogo wa kuharibu data," Priya alisema. "Tayari tumepoteza $3,200 kwa kupuuza. Hatujapoteza data yoyote kwa otomatiki. Najua ipi ningependa kudumisha."

Tom aliishia kwenye mseto: tahadhari ya kiotomatiki siku ya 7, kuhitaji lebo ya `keep: true` kukandamiza tahadhari za baadaye, na kuendesha ripoti ya kila wiki ya kiasi vyote visivyolebewa-na-visivyoambatishwa kwa timu kupitia pamoja. Hakuna kufuta kiotomatiki.

**Tofauti: Wakati Usafishaji Unagharimu Zaidi ya Unavyookoa**

Ikiwa unahitaji usalama wa picha za ziada, zihifadhi — lakini kila picha ya zaidi ya siku 90 bila ufikiaji inapaswa kustahili nafasi yake. Biashara ya mbadala si linganifu: kufuta picha uliyoihitaji kunagharimu tukio; kuhifadhi picha usiyoihitaji kunagharimu tu ada ndogo ya kila mwezi. Kwa data nyeti ya uzingatifu, gharama ya kuhifadhi picha za zamani ni halisi lakini kwa kawaida ni ndogo kuliko gharama ya kutozikuwa nazo mkaguzi anapouliza. Kwa picha za maendeleo kutoka jaribio lililoendesha miezi 14 iliyopita, hesabu inaenda upande mwingine.

Ikiwa unawezesha EFS Intelligent-Tiering kwa faili zenye mifumo ya ufikiaji isiyoweza kutabiriwa, upangaji wa kiotomatiki unaokoa pesa na hauhitaji uingiliaji wowote unaoendelea. Ikiwa faili zinazeeka kwa kutabirika kuelekea ufikiaji wa kumbukumbu, sheria ya mzunguko wa maisha ya moja kwa moja ni rahisi zaidi. Pima kabla ya kuwezesha.

Uhusiano wa SAA-C03: Mtihani unajaribu kama unaweza kuchagua kati ya madarasa ya uhifadhi ya S3 (Standard, IA, Glacier) kwa kuzingatia hali ya marudio ya ufikiaji. Mantiki ile ile inatumika hapa — darasa sahihi linategemea mara ngapi data inafikiwa.

**Gharama ya Kupuuza**

Tom aliunda lahajedwali. Alifanya hesabu ni kiasi gani Nimbus ilitumia kwa:

- Kiasi cha EBS kisichoambatishwa (miezi 16): $3,200
- Picha za zamani za S3 (ziligunduliwa na kufutwa): $890
- IOPS zilizotolewa zisizohitajika: $816
- Akiba za uhamiaji wa gp2 hadi gp3 (inayotarajiwa, ingefanyika mapema zaidi): $346 zaidi ya miezi 18
- Matoleo yasiyo ya sasa ya S3 yanayosanyika: $1,340
- Upakiaji wa sehemu nyingi usiokamilika: $94

Jumla ya taka iliyotambuliwa: takriban $6,700 zaidi ya miezi 18.

"Dola elfu sita na mia saba," Maya alisema.

"Kutoka kupuuza," Tom alisema. "Si kutoka kufanya uamuzi mbaya wa usanifu. Kutoka kutosafisha."

"Marekebisho ya kimfumo ni nini?"

"Na," Tom aliongeza, "fanya usafi wa gharama sehemu ya mchakato wa usambazaji. Mhandisi anapomaliza kipengele cha EC2, kiasi cha EBS kinafutwa kiotomatiki isipokuwa wakatae kwa uwazi."

## Nguvu na Mipaka

**Nidhamu ya uimarishaji wa gharama**:

- Mapitio ya kawaida hushika taka inayosanyika kabla haijawa kubwa
- Kuweka lebo kunaimarisha uwajibikaji — timu zinaona gharama zao wenyewe
- Tahadhari za kiotomatiki huzuia mshangao wa malipo
- Sera za mzunguko wa maisha na kupanga saizi sahihi mara nyingi ni akiba ya kuweka-na-kusahau

**Mahali ambapo mambo yanakuwa magumu**:

- Kutambua taka katika akaunti kubwa yenye timu nyingi kunahitaji zana za kati
- Baadhi ya taka ni ya makusudi (kuhifadhi picha za ziada "kwa iwapo") — biashara ya mbadala ya gharama/hatari ni uamuzi wa hukumu
- Uhamiaji wa gp3 unahitaji uthibitisho makini (chaguo-msingi za IOPS na uendeshaji zinaweza kutofautiana na tabia ya gp2 katika hali za pembezoni)
- Lebo za ugawaji wa gharama zinahitaji nidhamu katika timu zote — kuweka lebo bila uthabiti kunafanya data kuwa isiyokamilika
- Otomatiki ya kufuta kiotomatiki ni hatari kwa uhifadhi — tahadhari-na-kupitia ni salama zaidi kwa kiasi na picha

## Muhtasari

Ukaguzi wa uhifadhi ulikuwa umechukua siku mbili. Taka uliyoifichua — $6,700 katika miezi 18 ya usanyikaji usioonekana — ilikuwa si shindwa la kufanya maamuzi kuliko shindwa la uangalizi. Hakuna kitu kilichosanidiwa vibaya kwa makusudi. Picha, kiasi visivyoambatishwa, historia ya matoleo inayosanyika, upakiaji wa sehemu nyingi usiokamilika: kila kimoja kilikuwa na maana wakati huo na kilikuwa hakijapitiwa tena. Somo halikuwa kuhusu huduma mahususi za AWS. Lilikuwa kuhusu kujenga tabia ya kuangalia.

- **Gharama za uhifadhi zinasanyika bila kuonekana** — ukaguzi wa kawaida ni muhimu.
- **Kiasi kisichoambatishwa cha EBS** ni chanzo cha kawaida cha taka. Kifute (au fanya kiotomatiki ufutaji vipengele vinapomalizwa).
- **Kupanga saizi sahihi kwa EBS**: Hamia gp2 hadi gp3 (kawaida akiba ya 20%). Ondoa IOPS zilizotolewa za ziada.
- **Upigaji toleo wa S3**: Wezesha sheria za mzunguko wa maisha kwa matoleo yasiyo ya sasa ili kuepuka kulipa kwa historia isiyo na kikomo ya toleo.
- **Upakiaji wa sehemu nyingi usiokamilika**: Ongeza sheria ya mzunguko wa maisha ya `AbortIncompleteMultipartUpload` kwa kila ndoo. Hii mara nyingi inapuuzwa na inasanyika kimya.
- **EFS Intelligent-Tiering**: Huhamisha faili kiotomatiki kwa tabaka za bei nafuu kulingana na marudio ya ufikiaji. Kwa mifumo ya ufikiaji inayoweza kutabiriwa, sheria za mzunguko wa maisha za mkono zinaweza kuwa nafuu.
- **Utawala**: Tahadhari kwenye kiasi kisichoambatishwa baada ya siku 7-14; hitaji kuweka lebo kwa uwazi kukandamiza. Epuka kufuta kiotomatiki kwa rasilimali za uhifadhi.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.1)*

- **Lebo za ugawaji wa gharama**: Wezesha Lebo Zilizobainishwa na Mtumiaji kwa ugawaji wa gharama katika koni ya malipo; kisha weka lebo kwa rasilimali. Cost Explorer inaonyesha mgawanyo kwa lebo. Hali ya mtihani: "tambua idara inayozalisha gharama nyingi zaidi za S3" → lebo za ugawaji wa gharama.
- **AWS Trusted Advisor**: Inatambua vipengele vya EC2 visivyotumika ipasavyo, kiasi kisichoambatishwa cha EBS, visambazaji vya mzigo visivyofanya kazi, na taka zingine. Ukaguzi wa kimsingi bure; ukaguzi kamili unahitaji Usaidizi wa Business/Enterprise.
- **Sehemu za gharama za EBS**: Uhifadhi (kwa GB), IOPS zilizotolewa (ikiwa io1/io2 au gp3 ya ziada), uendeshaji (ikiwa gp3 ya ziada). Jua sehemu gani zinaweza kupangwa saizi sahihi.
- **Gharama za upigaji toleo wa S3**: Matoleo yasiyo ya sasa yanahifadhiwa na kulipiwa kwa kiwango sawa na matoleo ya sasa. Sheria za mzunguko wa maisha zinazofuta matoleo yasiyo ya sasa ni muhimu kwa udhibiti wa gharama katika ndoo zilizopigwa toleo.
- **AWS Compute Optimizer**: Huchambua matumizi ya EC2 na kupendekeza aina za vipengele zilizopangwa saizi sahihi. Ishara ya mtihani: "punguza gharama za EC2 kwa kuchagua aina sahihi ya kipengele" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Hutumia ML kugundua mifumo ya matumizi isiyo ya kawaida. Ishara ya mtihani: "gundua kiotomatiki ongezeko la gharama lisilotarajiwa" → Cost Anomaly Detection.
- **Mpangilio wa zana za gharama**: chati/utabiri shirikishi → Cost Explorer. Tahadhari za viwango vya mwisho → Budgets. "Data ya kina zaidi, ya kiwango cha rasilimali/ya kila saa ya malipo inayowasilishwa kwa S3 kwa uchambuzi maalum (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "shiriki seti kubwa ya data ya S3; watumiaji wanalipa gharama zao za upakuaji" → S3 Requester Pays (mmiliki anaendelea kulipa uhifadhi tu; watoa maombi lazima wathibitishe kwa akaunti ya AWS).

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza kwa nini kiasi kisichoambatishwa cha EBS kinazalisha gharama hata vipengele vya EC2 visipovitumia. Mchakato gani wahandisi wanapaswa kufuata wanapomaliza kipengele cha EC2 ili kuepuka taka hii?

*(Kidokezo: Kiasi cha EBS huhifadhi data kwenye diski ya kimwili, na hiyo diski inagharimu pesa bila kujali kama inasomwa.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Bili ya AWS ya kampuni imekua kutoka $5,000 hadi $9,000/mwezi zaidi ya miezi sita, lakini hawajaongeza huduma mpya. Timu ya uhandisi inashuku gharama za uhifadhi ndio tatizo. Mchanganyiko gani wa zana za AWS BORA ungetambua na kueleza ongezeko la gharama?

A) AWS CloudTrail kupitia wito wa API na kutambua ni nani aliyeunda rasilimali mpya  
B) AWS Cost Explorer kwa mgawanyo wa gharama kwa kiwango cha huduma, na AWS Trusted Advisor kwa ugunduzi wa rasilimali zisizofanya kazi na zisizoambatishwa  
C) Amazon CloudWatch kwa ufuatiliaji wa matumizi ya rasilimali na kuunda tahadhari za gharama  
D) AWS Config kwa kutambua rasilimali zote na hali yao ya uzingatifu

**Kidokezo cha 1**: "Tambua ongezeko la gharama" → ona mgawanyo wa gharama kwa huduma.

**Kidokezo cha 2**: "Rasilimali zisizofanya kazi na zisizoambatishwa" → zana maalum huzitambua kwa makini.

**Kidokezo cha 3**: CloudTrail inaandika wito wa API; Cost Explorer inaonyesha mwenendo wa gharama. Ipi inafaa zaidi kwa uchambuzi wa gharama?

**Jibu**: B

**Maelezo**: AWS Cost Explorer inaonyesha mwenendo wa gharama umegawanywa kwa huduma, mkoa, na aina ya matumizi — kamili kwa kutambua ni huduma gani ilichangia ongezeko. Ukaguzi wa uimarishaji wa gharama wa AWS Trusted Advisor hutambua kiasi kisichoambatishwa cha EBS, vipengele vya EC2 visivyotumika, visambazaji vya mzigo visivyotumika ipasavyo, na vyanzo vingine vya kawaida vya taka.

**Kwa nini si A?** CloudTrail inarekodi ni nani aliyeunda rasilimali na wakati gani, lakini haionyeshi mwenendo wa gharama au kutambua taka moja kwa moja.

**Kwa nini si C?** CloudWatch hufuatilia utendaji wa rasilimali (CPU, kumbukumbu) — muhimu kwa kupanga saizi sahihi lakini si kwa kutambua taka ya uhifadhi iliyosanyika.

**Kwa nini si D?** AWS Config hufuatilia usanidi wa rasilimali na uzingatifu lakini si zana ya uchambuzi wa gharama.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Bili ya S3 ya Nimbus inaonyesha $340/mwezi kwa ndoo iliyoitwa "backups." Ndoo ina upigaji toleo ulioanzishwa na ina:

- Picha za hifadhidata za kila siku (siku 7 zinatosha kwa sera yao)
- Nakala kamili za kila wiki (zimehifadhiwa kwa miezi 3)
- Kumbukumbu za robo mwaka (zimehifadhiwa kwa miaka 7 kwa uzingatifu wa kodi)

Buni sera ya mzunguko wa maisha kwa ndoo hii inayopunguza gharama huku ikitimiza mahitaji haya ya uhifadhi. Darasa gani la uhifadhi linapaswa kutumia kila aina ya data? Ungeshughulikia vipi upigaji toleo ili kuzuia matoleo ya zamani yasisanyike?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kubuni sera ya mzunguko wa maisha.)*

## Tukio Baada ya Mikopo

Tom alichapisha matokeo ya ukaguzi wa gharama kwa timu.

Taka iliyotambuliwa: $6,700 zaidi ya miezi 18.
Akiba ya kila mwaka iliyotarajiwa kutoka mabadiliko yaliyotekelezwa: $6,200.

Kisha aliongeza mstari mwishoni: "Hii haijumuishi akiba kutoka kwa Savings Plans ($14,200/mwaka) au sera za mzunguko wa maisha za S3 ($7,800/mwaka). Athari ya jumla ya uimarishaji wa kila mwaka: takriban $28,200."

Maya aliisoma mara mbili.

"Hiyo ni karibu mshahara wa mhandisi mdogo," alisema.

"Katika taka," Tom alithibitisha.

"Au," Leo alisema, "ni uthibitisho kwamba kufanya maboresho haya mapema zaidi kungemfadhili mhandisi huyo mdogo."

Tom alimtazama.

"Hiyo ndiyo njia sahihi ya kuyafikiria," alisema. "Uimarishaji wa gharama si kuhusu kukata. Ni kuhusu kutolipa kwa vitu visivyozalisha thamani."

Maya alipiga pini hati kwenye wiki ya kampuni.

Katika sura inayofuata: tabaka la hifadhidata linapewa matibabu yale yale, na Tom anagundua mahali pamoja ambapo kweli alikuwa akiwekeza kidogo.
