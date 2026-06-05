# Sura ya 28: Mshangao wa Bili ya Uhifadhi

Tom aliwasilisha Mpango wa Akiba kwa EC2. Mstari mwingine kwenye bili ulikuwa S3: $198/mwezi (kushuka kutoka $847 baada ya mabadiliko ya sera ya mzunguko wa maisha kutoka Sura ya 23).

Kisha alitazama EBS: $440/mwezi.

"Hiyo inaonekana juu," alisema.

Leo alipiga orodha ya kiasi cha EBS. Kulikuwa na kiasi 47 cha EBS kilichounganishwa na vipengele. Kisha kulikuwa na kiasi kingine 23 kisichoambatishwa na kipengele chochote.

"Kiasi hiki 23," Tom alisema. "Ni nini?"

Leo kiliangalia. Vilikuwa vimejitenga — hakuna kipengele kilichokuwa kikivitumia kwa sasa. Vingi vilikuwa vimeundwa kutoka picha za utatuzi. Baadhi vilikuwa kutoka kwa vipengele vilivyomalika lakini kiasi vyake havikufutwa.

"Tunapalipa $0.10 kwa GB kwa mwezi kwa uhifadhi ambao hakuna anayeusomea," Leo alisema.

Tom alitazama jumla: TB 2.3 za kiasi visivyoambatishwa.

"Dola mia mbili na thelathini kwa mwezi kwa uhifadhi ambao hatutumii," Tom alisema. "Hii imekuwa kwa muda gani?"

Leo aliangalia tarehe za uundaji. Kiasi cha zamani zaidi kilikuwa na miezi 16 iliyopita.

"Dola tatu elfu na mia sita na themanini," Tom alisema kwa utulivu. "Tumetumia elfu tatu na mia sita dola kwa uhifadhi ambao hakuna anaofikia."

Alifuta kiasi visivyoambatishwa. Mwezi uliofuata, bili ya EBS ilishuka hadi $210.

**Ukaguzi wa Gharama za Uhifadhi**

Ugunduzi wa EBS wa Tom ulikuwa dalili ya mchakato mpana: gharama za uhifadhi zinasanyika bila kuonekana. Tofauti na kompyuta (unagundua seva 47 zinapofanya kazi), uhifadhi hujaza kimya kimya.

Fikiria kama kukodisha kitengo cha kuhifadhi. Kukodisha kitengo kimoja ni dhahiri kwenye taarifa ya kadi ya mkopo. Lakini ukikodisha kitengo cha pili kwa mradi, kisha cha tatu kwa samani za zamani, na hukurudi kamwe kuangalia kilichomo — malipo yanaendelea kutokea kila mwezi, kimya, muda mrefu baada ya kusahau ulichokuwa ukihifadhi. Uhifadhi wa wingu hufanya kazi kwa njia ile ile: baiti hukaa hapo, ankara inafika, na hakuna anayeuliza mpaka mtu mwishowe afungue mlango na kukuta umejaa vitu ambavyo hakuna mtu anavyohitaji tena.

Ukaguzi kamili wa gharama za uhifadhi unatazama:

**S3**:

- Je, sera za mzunguko wa maisha zipo kwa ndoo zote?
- Je, kuna picha za zamani (za RDS, za EBS) zilizopo kwenye S3?
- Je, Intelligent-Tiering inafaa kwa ndoo yoyote zenye mifumo ya ufikiaji isiyoweza kutabiriwa?
- Je, kuna vitu vilivyopigwa toleo vikizalisha nakala nyingi ambazo hazipatikani kamwe?

**EBS**:

- Je, kuna kiasi chochote kisichoambatishwa (hakuna kipengele kinachofanya kazi kikitumia)?
- Je, kiasi cha gp3 kimesanidiwa ipasavyo? (Kiasi cha chaguo-msingi cha gp3 kinaweza kuwa na uendeshaji/IOPS wa ziada uliotolewa ambao hauhitajiki)
- Je, picha za zamani zaidi ya zile zinazohitajika zinahifadhiwa?

**RDS**:

- Je, vipindi vya uhifadhi wa nakala za kiotomatiki vimewekwa ipasavyo? (Ndefu zaidi = gharama zaidi ya uhifadhi)
- Je, picha za mkono kutoka vipengele vya zamani bado zipo?
- Je, nakala za kusomwa kutoka uhamiaji wa hifadhidata bado zinaendelea?

**EFS**:

- Je, kiasi cha EFS kiko katika darasa sahihi la uhifadhi? (Kawaida dhidi ya Ufikiaji wa Mara Chache)

**Upigaji Toleo wa S3: Gharama Iliyofichwa**

Katika Sura ya 5, tulitaja kwamba upigaji toleo wa S3 huweka kila toleo la awali la kitu. Hii ni nzuri sana kwa usalama. Ni mbaya kwa gharama ikiwa pia huna sheria za mzunguko wa maisha kwa matoleo.

Upigaji toleo ukiwezeshwa kwenye ndoo, kila wakati unavyosasisha kitu, toleo la zamani linahifadhiwa. Kwa wakati:

- Siku 1: Picha ilipakiwa (v1)
- Siku 30: Picha ilisasishwa (v1 ni sasa toleo "la sasa si la sasa", v2 ni la sasa)
- Siku 60: Picha ilisasishwa tena (v1 na v2 si za sasa, v3 ni ya sasa)
- Siku 365: v1, v2... v12 zimehifadhiwa zote. Unalipa kwa nakala 12 za picha.

Marekebisho: sheria za mzunguko wa maisha kwa matoleo ya sasa si ya sasa.

```
Futa matoleo ya sasa si ya sasa baada ya siku 30
Futa upakiaji wa sehemu nyingi uliokatizwa baada ya siku 7
```

Tom alitumia sheria hizi kwa ndoo zote zilizopigwa toleo. Mwezi uliofuata, uhifadhi wa S3 ulipungua kwa 18%.

**EBS: Kupanga Saizi Sahihi na Uboreshaji wa gp3**

Bei za kiasi cha EBS ina sehemu mbili:

1. Uhifadhi (kwa GB kwa mwezi)
2. IOPS na uendeshaji uliotolewa (ikiwa uko kwenye io1/io2 au unalipa kwa utendaji wa ziada wa gp3)

**Fursa ya gp3**: Katika Sura ya 6, tulisema kwamba gp3 ni chaguo-msingi cha sasa na ni bei nafuu kuliko gp2. Ikiwa Nimbus ilikuwa na kiasi kilichoundwa kabla gp3 haikupatikana (ilizinduliwa Desemba 2020), kinaweza bado kuwa gp2.

Tom alipata kiasi 12 cha gp2 kikijumlika GB 1,200. Kuhamia kwa gp3 kuliokoa 20% kwenye kiasi hivyo mara moja, bila kupungua kwa utendaji.

**IOPS na uendeshaji**: Kiasi cha gp3 huja na IOPS 3,000 na uendeshaji wa MB/s 125 kwa chaguo-msingi, bila ada ya ziada. Unaweza kutoa zaidi ikiwa mzigo wako unahitaji. Pitia kama utendaji uliotolewa unatumika kweli.

Tom alipata kiasi viwili vya gp3 chenye IOPS 10,000 zilizotolewa. Aliangalia vipimo vya CloudWatch: wastani halisi wa IOPS ulikuwa 1,200. Alipunguza IOPS zilizotolewa hadi 4,000 (msimamo wa usalama juu ya kilele halisi).

Akiba ya kila mwezi: $68.

**Mzunguko wa maisha wa picha**: Picha za EBS ni za ziada (kila picha inahifadhi mabadiliko tu tangu ile iliyotangulia), lakini zinasanyika. Picha za zamani kutoka siku za mwanzo za Nimbus bado zilipo. Tom alihifadhi siku 30 za picha za kila siku na kufuta iliyobaki.

**EFS: Madarasa ya Uhifadhi**

Amazon EFS ina madarasa yake ya uhifadhi:

- **EFS Standard**: Kwa faili zinazofikiwa mara kwa mara. Gharama ya juu zaidi.
- **EFS Infrequent Access (IA)**: Kwa faili ambazo hazijapatikwa kwa siku 30. Bei nafuu kwa 92% kuliko Standard.
- **EFS Archive**: Kwa faili ambazo hazijapatikwa kwa siku 90. Bei nafuu zaidi kuliko IA.

**EFS Intelligent-Tiering**: Huhamisha faili kiotomatiki kati ya madarasa ya uhifadhi kulingana na mifumo ya ufikiaji.

Tom aliwezesha Intelligent-Tiering kwenye kiasi cha EFS. Wiki sita baadaye, 68% ya faili zilikuwa zimehama kwa Infrequent Access. Gharama ya kila mwezi ya EFS ilishuka kutoka $89 hadi $31.

**Lebo za Ugawaji wa Gharama za S3: Kupata Ni Nani Analotumia Nini**

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

**AWS Cost Explorer**: Inaona gharama za kihistoria na za utabiri kwa huduma, mkoa, lebo, na aina ya matumizi. Muhimu kwa kuelewa fedha zinapokwenda.

**AWS Budgets**: Huweka tahadhari gharama zinapozidi (au zinatarajiwa kuzidi) kiwango cha mwisho. Unaweza kupanga bajeti kwa huduma, mkoa, lebo, au akaunti.

Tom alipanga bajeti tatu:

1. Bili ya kwa mwezi kwa jumla: Tahadhari kwa 90% ya kiasi kilichopangwa
2. EC2 On-Demand: Tahadhari ikiwa matumizi ya On-Demand yanazidi $500/mwezi (ishara ya pengo la Mpango wa Akiba)
3. Uhamishaji wa data nje: Tahadhari kwa $200/mwezi (gharama za uhamishaji wa data zinaweza kupanda bila kutarajiwa)

Bajeti zilituma tahadhari kwa njia ya Slack. Timu iliona wanapofikia mipaka, badala ya kugundua kwenye ankara ya kila mwezi.

**Gharama ya Kupuuza**

Tom aliunda jedwali. Alifanya hesabu ni kiasi gani Nimbus ilitumia kwa:

- Kiasi cha EBS kisichoambatishwa (miezi 16): $3,680
- Picha za zamani za S3 (ziligunduliwa na kufutwa): $890
- IOPS zilizotolewa zisizohitajika: $816
- Akiba za uhamiaji wa gp2 hadi gp3 (inayotarajiwa, ilifanywa mapema zaidi): $2,160 zaidi ya miezi 18
- Matoleo ya sasa si ya sasa ya S3 yanayosanyika: $1,340

Jumla ya taka iliyotambuliwa: karibu $8,800 zaidi ya miezi 18.

"Dola elfu nane na mia nane," Maya alisema.

"Kutoka kupuuza," Tom alisema. "Si kutoka kufanya uamuzi mbaya wa usanifu. Kutoka kutosafisha."

"Marekebisho ya kimfumo ni nini?"

"Ukaguzi wa kawaida," Priya alisema. "Mapitio ya kila mwezi ya Cost Explorer. Zana ya AWS Trusted Advisor huweka alama kiasi kisichoambatishwa cha EBS na rasilimali zisizofanya kazi kiotomatiki. Fanya kiotomatiki usafishaji wa mifumo ya taka inayojulikana: futa picha zaidi ya N siku, tahadhari kwenye kiasi kisichoambatishwa cha EBS, maliza matoleo ya zamani ya S3."

"Na," Tom aliongeza, "fanya usafi wa gharama sehemu ya mchakato wa usambazaji. Mhandisi anapozima kipengele cha EC2, kiasi cha EBS hufutwa kiotomatiki isipokuwa waamuaue kwa makusudi."

## Nguvu na Mipaka

**Nidhamu ya uimarishaji wa gharama**:

- Mapitio ya kawaida hushika taka inayosanyika kabla haijakuwa kubwa
- Kuweka lebo kunaimarisha uwajibikaji — timu zinaona gharama zao wenyewe
- Tahadhari za kiotomatiki huzuia mshangao wa malipo
- Sera za mzunguko wa maisha na kupanga saizi sahihi mara nyingi ni akiba ya kuweka-na-kusahau

**Mahali ambapo mambo yanakuwa magumu**:

- Kutambua taka katika akaunti kubwa yenye timu nyingi kunahitaji zana za kati
- Baadhi ya taka ni ya makusudi (kuweka picha za ziada "kwa iwapo") — uwiano wa gharama/hatari ni uamuzi wa hukumu
- Uhamiaji wa gp3 unahitaji uthibitisho makini (chaguo-msingi za IOPS na uendeshaji zinaweza kutofautiana na tabia ya gp2 katika hali za pembezoni)
- Lebo za ugawaji wa gharama zinahitaji nidhamu katika timu zote — kuweka lebo bila uthabiti kunafanya data kuwa haikamiliki

## Muhtasari

- **Gharama za uhifadhi zinasanyika bila kuonekana** — ukaguzi wa kawaida ni muhimu.
- **Kiasi kisichoambatishwa cha EBS** ni chanzo cha kawaida cha taka. Kifute (au fanya kiotomatiki ufutaji vipengele vikizimwa).
- **Kupanga saizi sahihi kwa EBS**: Hamia gp2 hadi gp3 (kawaida akiba ya 20%). Ondoa IOPS zilizotolewa za ziada.
- **Upigaji toleo wa S3**: Wezesha sheria za mzunguko wa maisha kwa matoleo ya sasa si ya sasa ili kuepuka kulipa kwa historia isiyo na kikomo ya toleo.
- **EFS Intelligent-Tiering**: Huhamisha faili kiotomatiki kwa tabaka za bei nafuu kulingana na mzunguko wa ufikiaji.
- **Lebo za ugawaji wa gharama**: Weka lebo kwa rasilimali na metadata ya timu/mradi/mazingira kwa uwazi na uwajibikaji wa gharama.
- **AWS Budgets**: Tahadhari za makini gharama zinapokaribia viwango vya mwisho. Usipatwe na mshangao na ankara ya kila mwezi.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.1)*

- **Lebo za ugawaji wa gharama**: Wezesha Lebo Zilizobainishwa na Mtumiaji kwa ugawaji wa gharama katika dashibodi ya malipo; kisha weka lebo kwa rasilimali. Cost Explorer inaonyesha mgawanyo kwa lebo. Hali ya mtihani: "tambua idara inayozalisha gharama nyingi zaidi za S3" → lebo za ugawaji wa gharama.
- **AWS Trusted Advisor**: Inatambua vipengele vya EC2 visivyotumika ipasavyo, kiasi kisichoambatishwa cha EBS, kisambazaji cha mzigo kisichofanya kazi, na taka zingine za kawaida. Ukaguzi wa kimsingi bure; ukaguzi kamili unahitaji Usaidizi wa Biashara/Enterprise.
- **Sehemu za gharama za EBS**: Uhifadhi (kwa GB), IOPS zilizotolewa (ikiwa io1/io2 au gp3 ya ziada), uendeshaji (ikiwa gp3 ya ziada). Jua sehemu gani zinaweza kupangwa saizi sahihi.
- **Gharama za upigaji toleo wa S3**: Matoleo ya sasa si ya sasa yanahifadhiwa na kulipiwa kwa kiwango sawa na matoleo ya sasa. Sheria za mzunguko wa maisha zinazofuta matoleo ya sasa si ya sasa ni muhimu kwa udhibiti wa gharama katika ndoo zilizopigwa toleo.
- **AWS Compute Optimizer**: Huchambua matumizi ya EC2 na kupendekeza aina za vipengele zilizopangwa saizi sahihi. Ishara ya mtihani: "punguza gharama za EC2 kwa kuchagua aina sahihi ya kipengele" → Compute Optimizer.
- **Ugunduzi wa Tofauti za Gharama za AWS**: Hutumia ML kugundua mifumo ya matumizi isiyo ya kawaida. Ishara ya mtihani: "gundua kiotomatiki ongezeko la gharama lisilo la kawaida" → Ugunduzi wa Tofauti za Gharama.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza kwa nini kiasi kisichoambatishwa cha EBS kinazalisha gharama hata vipengele vya EC2 visivyotumia. Mchakato gani wahandisi wanapaswa kufuata wanapomaliza kipengele cha EC2 ili kuepuka taka hii?

*(Kidokezo: Kiasi cha EBS huhifadhi data kwenye diski ya kimwili, na hiyo diski inagharimu pesa bila kujali kama inasomwa.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Bili ya AWS ya kampuni imekua kutoka $5,000 hadi $9,000/mwezi zaidi ya miezi sita, lakini hawakuongeza huduma mpya. Timu ya uhandisi inashuku gharama za uhifadhi ndio tatizo. Mchanganyiko gani wa zana za AWS BORA ungetambua na kueleza ongezeko la gharama?

A) AWS CloudTrail kupitia wito wa API na kutambua ni nani aliyeunda rasilimali mpya  
B) AWS Cost Explorer kwa mgawanyo wa gharama kwa kiwango cha huduma, na AWS Trusted Advisor kwa ugunduzi wa rasilimali zisizo na kazi na zisizambatishwa  
C) Amazon CloudWatch kwa ufuatiliaji wa matumizi ya rasilimali na kuunda tahadhari za gharama  
D) AWS Config kwa kutambua rasilimali zote na hali yao ya uzingatifu

**Kidokezo cha 1**: "Tambua ongezeko la gharama" → ona mgawanyo wa gharama kwa huduma.

**Kidokezo cha 2**: "Rasilimali zisizo na kazi na zisizambatishwa" → zana maalum huzitambua proactively.

**Kidokezo cha 3**: CloudTrail inaandika wito wa API; Cost Explorer inaonyesha mwenendo wa gharama. Ipi inafaa zaidi kwa uchambuzi wa gharama?

**Jibu**: B

**Maelezo**: AWS Cost Explorer inaonyesha mwenendo wa gharama umegawanywa kwa huduma, mkoa, na aina ya matumizi — kamili kwa kutambua ni huduma gani ilichangia ongezeko. Ukaguzi wa uimarishaji wa gharama wa AWS Trusted Advisor hutambua kiasi kisichoambatishwa cha EBS, vipengele vya EC2 visivyotumika, kisambazaji cha mzigo kisichofanya kazi, na vyanzo vingine vya kawaida vya taka.

**Kwa nini si A?** CloudTrail inarekodi ni nani aliyeunda rasilimali na wakati gani, lakini haionyeshi mwenendo wa gharama au kutambua taka moja kwa moja.

**Kwa nini si C?** CloudWatch hufuatilia utendaji wa rasilimali (CPU, kumbukumbu) — muhimu kwa kupanga saizi sahihi lakini si kwa kutambua taka ya uhifadhi iliyosanyika.

**Kwa nini si D?** AWS Config hufuatilia usanidi wa rasilimali na uzingatifu lakini si zana ya uchambuzi wa gharama.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Bili ya S3 ya Nimbus inaonyesha $340/mwezi kwa ndoo iliyoitwa "backups." Ndoo ina upigaji toleo ulioanzishwa na ina:

- Picha za hifadhidata za kila siku (siku 7 zinatosha kwa sera yao)
- Nakala kamili za kila wiki (zimehifadhiwa kwa miezi 3)
- Kumbukumbu za robo mwaka (zimehifadhiwa kwa miaka 7 kwa uzingatifu wa kodi)

Buni sera ya mzunguko wa maisha kwa ndoo hii inayopunguza gharama huku ikitimiza mahitaji haya ya uhifadhi. Darasa gani la uhifadhi linapaswa kutumia kila aina ya data? Ungeishughulikia vipi upigaji toleo ili kuzuia matoleo ya zamani yasisanyike?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni sera ya mzunguko wa maisha.)*

## Tukio Baada ya Mikopo

Tom alichapisha matokeo ya ukaguzi wa gharama kwa timu.

Taka iliyotambuliwa: $8,800 zaidi ya miezi 18.
Akiba ya kila mwaka iliyotarajiwa kutoka mabadiliko yaliyotekelezwa: $6,200.

Kisha aliongeza mstari mwishowe: "Hii haijumuishi akiba kutoka kwa Mipango ya Akiba ($14,200/mwaka) au sera za mzunguko wa maisha za S3 ($7,800/mwaka). Athari ya jumla ya uimarishaji wa kila mwaka: karibu $28,200."

Maya alisoma mara mbili.

"Hiyo ni karibu mshahara wa mhandisi mdogo," alisema.

"Katika taka," Tom alithibitisha.

"Au," Leo alisema, "ni uthibitisho kwamba kufanya uimarishaji huu mapema zaidi kulifadhili mhandisi huyo mdogo."

Tom alimtazama.

"Hiyo ndiyo njia sahihi ya kufikiria," alisema. "Uimarishaji wa gharama si kuhusu kukata. Ni kuhusu kutolipa kwa vitu visivyozalisha thamani."

Maya alipiga pini hati kwenye wiki ya kampuni.

Katika sura inayofuata: tabaka la hifadhidata linapewa matibabu yale yale, na Tom anagundua mahali mmoja ambapo kweli alikuwa akiwekezea kidogo.
