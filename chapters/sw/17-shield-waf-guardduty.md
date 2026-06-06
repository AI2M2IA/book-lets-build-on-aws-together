# Sura ya 17: Walinzi

Tukio na IP ya Kiromania lilikuwa limedhibitiwa. Siri zilikuwa katika Secrets Manager. Vitambulisho vilikuwa vimezungushwa. Vidhibiti vya mtandao vilikuwa vimeimarishwa.

Lakini Priya alikuwa ameuliza swali lililomaliza Sura ya 16: "Ikiwa kitu kisicho cha kawaida kitatokea katika CloudTrail, tungejuaje?"

Jibu la kweli lilikuwa: pengine hawangejua.

---

*Kila kilichoweza kufungwa kilikuwa kimefungwa. Siri zilikuwa katika Secrets Manager. Funguo za usimbaji zilikuwa katika KMS. Trafiki ya mtandao ilidhibitiwa na vikundi vya usalama na NACL. Ulinzi wa mzunguko ulikuwa imara. Lakini ulinzi wa mzunguko huchukulia kuwa unajua shambulizi linaonekanaje kabla halijawasili. Swali ambalo Priya alikuwa akiuliza lilikuwa tofauti: vipi kuhusu mashambulizi usiyoyaona yakija?*

---

CloudTrail huingiza kumbukumbu maelfu ya matukio kwa siku. Hakuna mwanadamu anayesoma zote. Priya alikagua kwa mkono kila wiki, lakini hilo lilimaanisha kitu kingeweza kutokea Jumanne na kisitambuliwe hadi Jumatatu inayofuata.

"Tunahitaji kitu kinachotuangalia kumbukumbu kwa niaba yetu," alisema.

Maya akaangalia juu. "Kiotomatiki?"

"Kiotomatiki."

"Na vipi ikiwa mtu atajaribu kuvunja?" Priya aliendelea. "Si tu kitambulisho kilichoathiriwa — vipi ikiwa mtu atazindua DDoS? Vipi ikiwa wataanza kupapasa endpoints zetu za API kwa udhaifu wa sindano? Vipi ikiwa tayari wako ndani na hatujui?"

"Hayo ni matatizo matatu tofauti," Leo alisema.

"Ndiyo," Priya alisema. "Na AWS ina huduma tatu tofauti za kuyashughulikia."

**Kategoria Tatu za Tishio**

Vitisho vya usalama dhidi ya programu ya wingu kwa ujumla huangukia katika kategoria tatu:

**Mashambulizi ya kiasi (DDoS)**: Mvamizi hutuma trafiki nyingi sana hivi kwamba programu yako haiwezi kuwajibu watumiaji halali. Shambulizi linaweza kuwa mamilioni ya maombi ya HTTP, au mafuriko ya pakiti za TCP SYN zilizobuniwa kumaliza jedwali la muunganisho la seva yako.

**Mashambulizi ya programu (Exploits)**: Mvamizi hutuma maombi yaliyobuniwa mahususi kutumia udhaifu katika programu yako — sindano ya SQL, cross-site scripting, ingizo lililoharibika linaloangusha kichanganuzi.

**Hitilafu za kitabia (Upelelezi na uathiriaji)**: Miito ya API isiyopaswa kutokea (mtu akiuliza hifadhidata yako yote ya watumiaji saa 9 usiku), shughuli isiyo ya kawaida ya IAM (vitambulisho vinatumika kutoka nchi mpya), au trafiki ya mtandao kwa marudio yasiyotarajiwa.

AWS ina huduma iliyojitolea kwa kila moja:

- **AWS Shield**: Ulinzi wa DDoS
- **AWS WAF**: Ulinzi wa kiwango cha programu
- **Amazon GuardDuty**: Kugundua tishio kwa kitabia

**AWS Shield: Kimeza cha DDoS**

**AWS Shield Standard** imewashwa kiotomatiki kwa wateja wote wa AWS bila malipo ya ziada. Hulinda dhidi ya mashambulizi ya kawaida zaidi ya safu ya 3 (mtandao) na safu ya 4 (usafiri) ya DDoS — mafuriko ya SYN, mafuriko ya UDP, mashambulizi ya kukuza DNS.

CloudFront, Route 53, na Elastic Load Balancing hukaa ukingoni mwa mtandao wa AWS. Shambulizi la DDoS linapolenga programu yako, hugonga huduma hizi zinazosimamiwa kwanza. Miundombinu ya mtandao ya AWS humeza shambulizi kabla halijafikia vihalisi vyako vya EC2.

**AWS Shield Advanced** ni daraja la kiwango cha juu ($3,000/mwezi kwa kila shirika, na ahadi ya mwaka mmoja). Ni usajili tofauti — *haijajumuishwa* katika mpango wowote wa AWS Support. Inaongeza:

- Ulinzi kwa EC2, ELB, CloudFront, Global Accelerator, na Route 53
- Arifa za shambulizi za karibu na wakati halisi
- Ufikiaji wa AWS Shield Response Team (SRT) — wahandisi wa usalama wanaoweza kukusaidia kujibu mashambulizi (kuhusisha SRT kunahitaji zaidi mpango wa Business au Enterprise Support)
- Ulinzi wa gharama: ikiwa shambulizi litasababisha bili yako kuongezeka, AWS hukopesha gharama za mwinuko
- Kugundua na kupunguza DDoS kulikoimarishwa katika safu ya 7 (safu ya programu)

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

"Dola elfu tatu," Priya alisema. "Kwa kila shirika."

Tom alikuwa kimya kwa muda.

"Kwa biashara kubwa zinazoshughulikia mamilioni katika mapato, DDoS inayowashusha kwa saa mbili inagharimu zaidi ya dola elfu tatu," Priya alisema.

Tom alifanya hesabu kimya.

"Tutaanza na Standard," alisema hatimaye.

---

**Tukio la DDoS: Shield Inaonekanaje Kivitendo**

Miezi minane baada ya uzinduzi, Nimbus ilipata shambulizi lake la kwanza halisi la DDoS.

Lilianza saa 5:43 mchana Jumanne. Dashibodi ya CloudWatch ya load balancer ilionyesha maombi ya muunganisho yanayoingia yakiongezeka kutoka 3,000 ya kawaida kwa dakika hadi 180,000 kwa dakika ndani ya chini ya sekunde tisini. IP za chanzo zilisambaa katika nchi arobaini, na kiasi cha kuingia kilifikia kilele cha karibu gigabiti hamsini kwa sekunde. Mfumo ulikuwa wazi: botnet ikizindua mafuriko ya SYN.

Leo aliona vipimo vya CloudFront kwanza. "Kiwango cha maombi kimepanda mara sitini. Muda wa kujibu unapanda."

Priya alivuta vipimo vya CloudWatch upande kwa upande: majaribio ya muunganisho ukingoni yakipanda wima, maombi yanayofikia origin kwa kweli — bapa. "Shield Standard inaimeza," alisema. Hakukuwa na tahadhari, hakuna tukio la dashibodi, hakuna arifa. Shield Standard hufanya kazi kimya: iko hai daima, ni bure, na hukupa **uonekanaji sifuri wa shambulizi** — hakuna koni ya matukio, hakuna arifa, hakuna timu ya kujibu DDoS. (Uonekanaji huo — dashibodi za shambulizi za karibu na wakati halisi na tahadhari — ndio haswa Shield *Advanced* huuza.) Njia pekee Priya angeweza kuona shambulizi kabisa ilikuwa kupitia vipimo vyake vya CloudWatch.

Shield Standard ilikuwa imegundua kiotomatiki mafuriko ya SYN na kuanzisha upunguzaji ndani ya dakika mbili za kwanza. Trafiki ya shambulizi ilikuwa ikimezwa katika nodi za ukingo za CloudFront kimataifa — pointi zilezile 750+ za uwepo zilizohudumia maudhui halali pia zilimeza kiasi cha shambulizi.

Kufikia saa 5:52 mchana — dakika tisa baada ya shambulizi kuanza — upunguzaji wa Shield ulikuwa umerejesha kiwango cha maombi kwenye origin kwa kawaida. Shambulizi lilikuwa bado linaendesha katika kiwango cha mtandao, lakini upunguzaji ulikuwa ukilishughulikia. Programu ya Nimbus iliendelea kuhudumia watumiaji muda wote.

"Watumiaji hawakugundua?" Leo aliuliza, akiangalia kipimo cha kiwango cha makosa.

"Kiwango cha makosa kilipanda karibu asilimia mbili kwa karibu dakika nne," Priya alisema. "Baadhi ya watumiaji walipata jibu la polepole kidogo. Hakuna kukatika. Programu ilibaki hai."

"Kwa sababu Shield iliimeza mafuriko ukingoni."

"Kabla yajafikia load balancer yetu. Mafuriko ya SYN ya gigabiti hamsini yaligonga CloudFront. Kufikia wakati mfumo wa trafiki ulipotambuliwa na kupunguzwa, origin yetu ilikuwa imeona tu kiasi cha maombi cha kawaida."

Shambulizi lilidumu dakika arobaini na saba. Kufikia saa 6:30 mchana vipimo vya ukingo vilikuwa vimerejea msingi — ishara pekee ya "imetatuliwa" ambayo Shield Standard hukupa.

"Na hii ni Shield Standard," Tom alisema. "Toleo la bure."

"Mashambulizi ya safu 3 na 4. Standard hulinda dhidi yake kiotomatiki. Kama shambulizi lingekuwa la kisasa zaidi — mafuriko ya HTTP ya safu 7, kwa mfano, ambapo kila ombi lilionekana halali — Standard isingetosha. Hilo linahitaji Shield Advanced pamoja na WAF."

Tom aliandika "Fuatilia mifumo ya DDoS ya safu 7" katika ramani yake ya usalama.

---

**AWS WAF: Kichujio cha Programu**

**AWS WAF (Web Application Firewall)** hufanya kazi katika kiwango cha HTTP — hukagua maudhui ya maombi ya wavuti kabla yajafikia programu yako.

WAF imesanidiwa na **Web ACLs (Access Control Lists)** — seti za kanuni zinazofafanua nini cha kuruhusu, kuzuia, au kuhesabu.

WAF inaweza kuambatishwa kwa:

- Usambazaji wa CloudFront (kagua maombi ukingoni, kimataifa)
- Application Load Balancers (kagua maombi katika kiwango cha kieneo)
- API Gateway
- AWS AppSync

**Managed Rules za WAF**: AWS na wachuuzi wa watu wa tatu huchapisha seti za kanuni zilizojengwa awali:

- **AWS Managed Rules - Core Rule Set**: Pamoja na vikundi vya kanuni shirikishi (SQL database, Known Bad Inputs), hufunika udhaifu 10 Bora wa OWASP (sindano ya SQL, XSS, sindano ya amri, upitishaji wa njia, n.k.)
- **AWS Managed Rules - Known Bad Inputs**: Huzuia maombi yanayolingana na mifumo ya shambulizi inayojulikana
- **AWS Managed Rules - Amazon IP Reputation List**: Huzuia IP zinazojulikana kuhusishwa na botnets na vipapasaji
- **AWS Managed Rules - Bot Control**: Hutambua na husimamia trafiki ya bot

Unaweza pia kuunda kanuni maalum:

- "Zuia ombi lolote lenye kichwa cha User-Agent kilicho na 'sqlmap'" (kipapasaji cha kawaida cha sindano ya SQL)
- "Kikomo cha kiwango: usiruhusu maombi zaidi ya 1000 kwa IP kwa dakika 5"
- "Zuia maombi yenye `<script>` katika thamani yoyote ya parameta"

Kwa Nimbus, usanidi wa kivitendo: WAF kwenye usambazaji wa CloudFront na Core Rule Set ikiwa imewashwa. Hii huzuia mifumo ya kawaida zaidi ya shambulizi kabla maombi hayajafikia kamwe vihalisi vya EC2.

Huenda unajiuliza: ikiwa WAF inazuia mifumo ya shambulizi inayojulikana, nini hutokea wakati mfumo mpya wa shambulizi unaotokea ambao WAF haukijui? Seti za managed rules za WAF husasishwa na AWS na wachuuzi wa watu wa tatu kadiri vitisho vipya vinavyojitokeza — huhitaji kusasisha kanuni kwa mkono. Lakini uko sahihi kwamba WAF kimsingi ni ya kuitikia mifumo inayojulikana. Mbinu mpya, za riwaya za shambulizi hazitazuiwa na kanuni isiyokuwepo bado. Ndio sababu GuardDuty ipo pamoja na WAF: WAF huchuja mlango wa mbele, GuardDuty huangalia tabia isiyo ya kawaida ndani ya nyumba. Aina mpya ya shambulizi inaweza kupita WAF, lakini GuardDuty bado inaweza kuashiria shughuli isiyo ya kawaida inayosababisha — miito isiyo ya kawaida ya API, marudio yasiyotarajiwa ya mtandao, mifumo ya ufikiaji isiyolingana na msingi.

**Tumefikiria kinachotokea ikiwa WAF itasababisha matokeo chanya bandia?** Priya aliuliza. "Ombi la mtumiaji halali linalozuiwa na Core Rule Set?"

"WAF ina hali ya 'Count'," Leo alisema. "Badala ya kuzuia, inahesabu tu maombi yanayolingana. Unaiendesha katika hali ya Count kwanza, unakagua kile ingezuia, unathibitisha hakuna matokeo chanya bandia, kisha unabadilisha kuwa Block."

"Vizuri," Priya alisema. "Tunaanza katika hali ya Count."

---

**Kuunda Kanuni ya WAF: Hadithi ya Kikomo cha Kiwango**

Wiki mbili baada ya kuwasha WAF katika hali ya Count, Priya alikagua kumbukumbu. Matokeo ya Core Rule Set yalikuwa safi — hakuna matokeo chanya bandia kwenye trafiki halali, majaribio machache ya sindano ya SQL yaliyozuiwa kutoka vipapasaji vya kiotomatiki.

Lakini aliona mfumo ambao Core Rule Set haukuwa ikiashiria: anwani moja ya IP ilikuwa imefanya maombi 847 kwa `/api/search` katika dakika tano. Kila ombi lilikuwa halali kimuundo. Lakini utafutaji 847 katika dakika tano haukuwa wa mwanadamu.

"Mkwaruzaji wa bei," alisema. "Mtu anauliza kiotomatiki utafutaji wetu wa mikahawa kujenga hifadhidata ya bei shindani."

"Tunajali?" Leo aliuliza.

"Inatumia rasilimali zetu za kompyuta na ni kinyume na masharti yetu ya huduma," Tom alisema.

"Tunajali," Priya alithibitisha.

Aliunda kanuni maalum ya WAF inayotegemea kiwango:

```
Jina la kanuni: RateLimitSearchAPI
Aina ya kanuni: Kanuni inayotegemea kiwango
Kikomo cha kiwango: maombi 100 kwa kila anwani ya IP
Dirisha la tathmini: dakika 5 (inayoweza kusanidiwa: dakika 1, 2, 5, au 10)
Kauli ya kupunguza upeo: njia ya URI inaanza na /api/search
Kitendo: Block
```

Kauli ya kupunguza upeo ni muhimu — kikomo cha kiwango kinatumika tu kwa `/api/search`. Trafiki halali ya API kwa endpoints nyingine haiathiriwi. Na tambua jinsi kuzuia kunavyofanya kazi: hakuna kipindi cha "adhabu" kisichobadilika — WAF hutathmini upya kiwango cha maombi cha kila IP kwa kuendelea, huizuia wakati kiwango kinabaki juu ya kikomo, na huiruhusu (kwa kawaida ndani ya sekunde) mara kiwango kinaposhuka chini.

Aliiweka katika hali ya Count kwanza. Aliiendesha kwa saa 24. IP pekee iliyowasha kanuni ilikuwa mkwaruzaji. Hakuna mtumiaji halali aliyewahi kutuma zaidi ya maombi 12 kwa endpoint ya utafutaji katika dakika tano.

Alibadilisha kuwa hali ya Block. Ombi linalofuata la mkwaruzaji lilipokea 403. Akabadilisha kwa IP tofauti. Kikomo cha kiwango kiliinasa hiyo pia.

"Watazunguka hatimaye," Leo alisema. "Wasambaze katika IP zaidi."

"Wakati huo wanatumia miundombinu zaidi, wanalipa zaidi, na wanapata data kidogo," Priya alisema. "Hatuhitaji kuwasimamisha kabisa. Tunahitaji kufanya iwe ghali ya kutosha isistahili."

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Bei ya WAF ni kwa kila Web ACL kwa mwezi, kwa kila kanuni kwa mwezi, na kwa kila milioni ya maombi. Kwa usanidi wa Nimbus — Web ACL moja, kanuni tano kwenye CloudFront — takriban $15 kwa mwezi pamoja na malipo ya maombi.

Tom aliidhinisha mara moja.

---

**Amazon GuardDuty: Mchambuzi wa Kitabia**

"Subiri — lakini *kwa nini* tungeifanya hivyo?" Maya aliuliza. "Ikiwa WAF inazuia mashambulizi na Shield inameza mafuriko, kwa nini tunahitaji huduma ya tatu? GuardDuty kwa kweli inaangalia nini?"

WAF na Shield ni vichujio — hukatiza trafiki mbaya kabla haijafikia programu yako. GuardDuty huangalia kinachotokea baada ya trafiki kuwasili. Inaangalia kile miundombinu yako inafanya: vitambulisho gani vya IAM vinatumika, vikoa gani vihalisi vyako vinawasiliana navyo, miito gani ya API inatokea saa 9 usiku. Mvamizi anayepita mlango wa mbele kupitia ombi linaloonekana halali hatazuiwa na WAF — lakini GuardDuty itagundua kuwa kitambulisho kilekile ghafla kinafanya miito ya API kutoka Romania.

GuardDuty ni tofauti kimsingi na Shield na WAF. Haizuii mashambulizi — **inagundua tabia isiyo ya kawaida**.

GuardDuty huchambua kwa kuendelea mitiririko kadhaa ya shughuli kugundua vitisho: **matukio ya usimamizi na data ya CloudTrail** (miito ya API na vitendo), **VPC Flow Logs** (mifumo ya trafiki ya mtandao), na **kumbukumbu za hoja za DNS** (utafutaji wa vikoa). Haya ni vyanzo vitatu vya msingi ambavyo GuardDuty imekuwa ikitegemea daima:

- **Kumbukumbu za AWS CloudTrail**: Mabadiliko ya IAM, miito ya API, kuingia kwa koni
- **VPC Flow Logs**: mifumo ya trafiki ya mtandao ndani ya VPC yako
- **Kumbukumbu za hoja za DNS**: vihalisi vyako vinafumbua nini (programu hasidi inayojulikana mara nyingi hufumbua vikoa mahususi vya C2)

Lakini GuardDuty imepanuka kwa kiasi kikubwa zaidi ya hizi tatu. AWS huziita nyongeza za hiari **protection plans** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring, na Malware Protection — kila moja ikiwashwa kibinafsi. Kutegemea unayowasha, GuardDuty inaweza pia kuchambua **matukio ya data ya S3** (mifumo isiyo ya kawaida ya ufikiaji wa ndoo zako), **kumbukumbu za ukaguzi za EKS na shughuli za runtime** (tabia hasidi ndani ya kontena zinazoendesha), **matukio ya kuingia ya RDS** (majaribio ya kuingia ya hifadhidata yasiyo ya kawaida), **trafiki ya mtandao ya Lambda** (vitendaji vinavyoita marudio ya nje yasiyotarajiwa), **tabia ya runtime ya ECS/EC2**, na **viasi vya EBS vilivyoskaniwa kwa malware**. Kwa mtihani, jua vyanzo vitatu vya msingi kwa moyo; protection plans huonekana katika hali kuhusu muktadha mahususi wa kugundua tishio — "gundua majaribio ya kuingia yasiyo ya kawaida kwa RDS" au "tambua tabia hasidi ndani ya kontena inayoendesha" ni ishara za kufikiria protection plans za hiari za GuardDuty.

Miundo ya kujifunza kwa mashine hutambua mifumo inayotofautiana na msingi wako. GuardDuty huzalisha **findings** — tahadhari zilizoainishwa — inapogundua hitilafu.

Mifano ya kile GuardDuty inaweza kugundua:

- Mtumiaji wa IAM akiingia kutoka anwani ya IP isiyotambulika (katika nchi ambayo hawajawahi kutumia hapo awali)
- Miito ya API ikifanywa kutoka nodi ya kutoka ya Tor
- Kihalisi cha EC2 kinachowasiliana na dimbwi linalojulikana la uchimbaji wa cryptocurrency
- Kiasi cha juu kisicho cha kawaida cha miito ya API (matumizi mabaya ya vitambulisho au kuskani)
- Ndoo ya S3 inayofikiwa na anwani ya IP iliyoashiriwa kwa shughuli hasidi
- Trafiki ya kwenda nje kwa kikoa kinachojulikana kuhusishwa na amri-na-udhibiti wa malware

"Hii ndiyo ingeunasa IP ya Kiromania," Leo alisema kimya.

"Kama tungekuwa na GuardDuty imewashwa, ingeashiria kihalisi cha EC2 kikifanya miunganisho ya kwenda nje kwa IP ya nje isiyotambulika saa 8 usiku," Priya alithibitisha.

---

**Aina Tano za Findings za GuardDuty na Cha Kufanya**

Priya aliunda runbook kwa findings tano za kawaida zaidi za GuardDuty. Finding inapowaka, timu inajua mara moja inamaanisha nini na cha kufanya.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Mtumiaji wa IAM aliingia kwa mafanikio katika AWS Console kutoka anwani ya IP ambayo haijaonekana kwa akaunti hii hapo awali, au kutoka eneo la kijiografia lisilolingana na kuingia kwa awali.

Jibu: Thibitisha na mtumiaji kuwa walianzisha kuingia. Ikiwa hawakuanzisha — au hawawezi kufikiwa — mara moja: zima ufunguo wa ufikiaji wa mtumiaji na nenosiri la koni, batilisha vikao amilifu, na anza ukaguzi wa CloudTrail wa kila kitu mtumiaji huyo amefanya katika saa 24 zilizopita. Finding hii mara nyingi hutangulia matumizi mabaya ya vitambulisho.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Kihalisi cha EC2 kinauliza anwani za IP au majina ya vikoa yanayohusishwa na madimbwi ya uchimbaji wa cryptocurrency. Hili karibu daima ni matokeo ya kihalisi cha EC2 kuathiriwa na kutumika kama bot ya uchimbaji.

Jibu: Tenga kihalisi mara moja — rekebisha kikundi chake cha usalama kuzuia trafiki yote ya kuingia na kwenda nje isipokuwa kwa bastion host yako. Piga picha ya uchunguzi (forensic snapshot) ya kiasi cha EBS. Kisha sitisha kihalisi na uzindue mbadala kutoka AMI safi.

**3. Recon:EC2/PortProbeUnprotectedPort**

Kihalisi cha EC2 kina lango wazi kwa intaneti linalopapaswa na vipapasaji vinavyojulikana au kutoka nodi ya kutoka ya Tor. GuardDuty huashiria malango yanayoonekana katika flow logs kuwa yanafikika kutoka vyanzo vya nje.

Jibu: Kagua kanuni za kikundi cha usalama. Ikiwa lango limefunguliwa kwa kukusudia, weka alama finding kuwa imetatuliwa na dokezo. Ikiwa si la kukusudia, funga lango mara moja. Angalia CloudTrail kwa ufikiaji wowote ambao huenda ulitokea kupitia lango hilo.

**4. Trojan:EC2/BlackholeTraffic**

Kihalisi cha EC2 kinajaribu kuwasiliana na anwani ya IP iliyotambuliwa kama "black hole" — marudio yanayohusishwa na miundombinu ya amri-na-udhibiti wa malware. Trafiki kwa IP hizi inadokeza kihalisi kimeambukizwa na kinajaribu kuita nyumbani.

Jibu: Sawa na findings za CryptoCurrency — tenga, piga picha, badilisha. Finding hii inaonyesha malware amilifu kwenye kihalisi. Usijaribu kusafisha kihalisi mahali pake; jenga kipya kutoka AMI safi.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Mtu amezima mpangilio wa Block Public Access kwenye ndoo ya S3. Hii haimaanishi ndoo ni ya umma — inamaanisha utaratibu wa usalama unaozuia ufichuzi wa umma wa bahati mbaya umezimwa kwa ndoo hiyo. Hili mara nyingi hufanywa kwa bahati mbaya au kama sehemu ya usambazaji usiosanidiwa vizuri.

Jibu: Chunguza nani alifanya mabadiliko (CloudTrail itakuwa na wito wa API). Washa upya Block Public Access isipokuwa kuna sababu iliyoandikwa inapaswa kuzimwa. Zingatia kuwasha mpangilio wa Block Public Access wa kiwango cha akaunti kuzuia finding hii kutokea siku zijazo.

"Jambo muhimu zaidi kuhusu findings za GuardDuty," Priya alisema, "ni kwamba si tahadhari — ni dhana. Kila finding inasema 'mfumo huu unaonekana usio wa kawaida.' Unathibitisha, unachunguza, unajibu. Baadhi zitakuwa chanya bandia. Nyingi hazitakuwa."

"Tunatanguliza vipi?" Rafael aliuliza.

"GuardDuty huweka viwango vya ukali: Chini, Wastani, Juu. Findings za ukali wa juu zinahitaji jibu la siku ileile. Findings za Trojan na uathiriaji wa vitambulisho daima ni za Juu. Findings za upapasaji wa lango zinaweza kuwa Wastani au Chini. Anza na za Juu, fanya kazi chini."

---

"Inagharimu kiasi gani?" Tom aliuliza.

Bei ya GuardDuty inategemea kiasi cha kumbukumbu zilizochambuliwa — matukio ya CloudTrail, data ya flow ya VPC, hoja za DNS. Kwa programu ndogo hadi ya kati, kwa kawaida $50-150/mwezi. Kwa kiwango kikubwa, bado ni sehemu ndogo ya gharama za miundombinu.

Tom alivuta koni na kuiwasha.

"Itakuwa sawa," Leo alisema. "Ni kufuatilia tu. Si kama itavunja chochote."

"Tayari niliisambaza," Leo aliongeza — kisha akaangalia dashibodi ya GuardDuty. "Oh. Findings za sampuli pekee. Halisi huchukua muda."

"GuardDuty inahitaji muda kujenga msingi wa jinsi kawaida inavyoonekana," Priya alisema. "Ipe siku kadhaa. Finding ya kwanza halisi itawasili — daima hufanya."

Aligeuka kuwa sahihi kuhusu hilo. Lakini finding ya kwanza ni hadithi ya mwisho wa sura hii.

**Kuunganisha Huduma Tatu**

Shield, WAF, na GuardDuty hufanya kazi katika tabaka tofauti na kukamilishana:

| Huduma     | Tabaka                    | Hulinda Dhidi ya                            | Kitendo                            |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Mtandao/Usafiri (L3/L4)   | Mafuriko ya DDoS                            | Humeza/hupunguza mashambulizi      |
| AWS WAF    | Programu (L7)             | OWASP 10 Bora, bots, wakwaruzaji            | Huruhusu, huzuia, au huhesabu maombi |
| GuardDuty  | Kitabia (kumbukumbu zote) | Hitilafu, vitambulisho vilivyoathiriwa, malware | Hugundua na kutahadharisha     |

Shield husimamisha mafuriko. WAF huchuja maji. GuardDuty huangalia mabomba kwa mifumo isiyo ya kawaida ya mtiririko. Macie hukagua kilichohifadhiwa katika hifadhi za maji. Security Hub ni chumba cha udhibiti ambapo dashibodi zote zinaonekana kwa wakati mmoja.

Hali ya kushindwa ya kila moja inaeleza kwa nini unahitaji zote:

- Mafuriko ya SYN ya 50 Gbps si ombi la wavuti. WAF haiwezi kuyakagua. GuardDuty inaweza kugundua matukio yanayohusiana ya CloudTrail. Shield huyasimamisha.
- Ombi moja la sindano ya SQL si mafuriko. Shield huipuuza. GuardDuty haijui maudhui ya maombi ya HTTP. WAF huinasa.
- Mtumiaji halali wa AWS akitumia vitambulisho vyake kutoa data nje polepole — hakuna DDoS, hakuna sindano, HTTP halali — Shield na WAF haziona chochote kisicho cha kawaida. GuardDuty hugundua vitambulisho vinatumika kutoka nchi mpya saa 9 usiku.
- Msanidi anayepakia kwa bahati mbaya data ya mteja kwenye ndoo inayofikika hadharani hazalishi tabia isiyo ya kawaida kabisa. GuardDuty haina cha kuashiria. Macie huskani ndoo na kupata PII.

Kila huduma ina sehemu kipofu. Mchanganyiko hufunika sehemu hizo kipofu.

**CloudTrail: Msingi**

Huduma zote tatu zinategemea kumbukumbu. **AWS CloudTrail** ni huduma ya kuingiza kumbukumbu inayonasa kila wito wa API katika akaunti yako ya AWS — nani aliita nini, lini, kutoka wapi, na matokeo gani.

CloudTrail imewashwa kwa chaguomsingi kwa historia ya siku 90 katika koni. Kuhifadhi kumbukumbu kwa muda mrefu:

1. Unda trail inayoandika kwa ndoo ya S3
2. Kwa hiari, tuma kwa CloudWatch Logs kwa tahadhari za wakati halisi
3. Washa uthibitishaji wa faili ya kumbukumbu (kugundua ikiwa kumbukumbu zimechezewa)

GuardDuty, AWS Config, Security Hub, na IAM Access Analyzer zote husoma kutoka CloudTrail. Bila kumbukumbu za CloudTrail, huduma hizi hazina chochote cha kuchambua.

"Vipi ikiwa mtu atajaribu kuzima CloudTrail?" Priya aliuliza. "Ikiwa mvamizi atapata ufikiaji wa msimamizi, kitendo chao cha kwanza kinaweza kuwa kuzima kuingiza kumbukumbu — kuficha athari zao."

"Hicho ndicho SCP kutoka Sura ya 14 inazuia," Leo alisema. "Hakuna mtu katika akaunti hii anayeweza kuzima CloudTrail, hata wasimamizi."

"Na ikiwa kwa namna fulani wangeweza?"

"Security Hub ingezalisha finding. CloudTrail hutuma arifa kwa SNS kuhusu mabadiliko ya usanidi. Tunapata tahadhari ndani ya dakika mbili za marekebisho yoyote ya CloudTrail."

"Na GuardDuty ingeashiria wito wa API," Rafael aliongeza, "kama kitendo cha IAM kisicho cha kawaida — kuzima kuingiza kumbukumbu si shughuli ya kawaida ya kiutendaji."

Tabaka nyingi za kugundua kwa mojawapo ya vitendo muhimu zaidi vya usalama: kuchezea kumbukumbu. Hii haikuwa ajali. Priya alikuwa ameibuni kwa makusudi.

"Ulinzi kwa kina unatumika kwa tabaka la kufuatilia pia," alisema. "Si tu tabaka la programu."

**Amazon Macie: Data Nyeti katika S3**

"Tumefikiria kinachotokea ikiwa mtu atapakia kwa bahati mbaya faili yenye nambari za kadi za mkopo za mteja kwenye S3?" Priya aliuliza. "Si kwa nia mbaya — msanidi tu akisafirisha data kwa kutatua na kupakia faili isiyo sahihi?"

"Hatungejua kamwe," Leo alisema.

"Sahihi. Isipokuwa tuwe na Macie."

**Amazon Macie** ni huduma ya usalama wa data inayotumia kujifunza kwa mashine kugundua na kulinda data nyeti katika S3 kiotomatiki. Huskani ndoo za S3 kwa kuendelea na hutambua:

- PII (Taarifa za Kibinafsi Zinazotambulisha): majina, anwani za barua pepe, nambari za simu, tarehe za kuzaliwa
- Data ya kifedha: nambari za kadi za mkopo, nambari za akaunti za benki
- Vitambulisho: manenosiri, funguo za ufikiaji, funguo za kibinafsi zilizowekwa ndani ya faili
- Taarifa za afya: rekodi za wagonjwa, uchunguzi

Macie huzalisha findings inapogundua data nyeti mahali ambapo haipaswi kuwa — au wakati ndoo za S3 zina usanidi wa ufikiaji wa kuruhusu kupita kiasi.

"Je, hii ni sawa na GuardDuty?" Maya aliuliza.

"Madhumuni tofauti," Priya alisema. "GuardDuty huangalia tabia — vitendo gani vinachukuliwa, kama vitendo hivyo vinaonekana visivyo vya kawaida. Macie huangalia data — maudhui gani yamehifadhiwa, kama maudhui hayo ni nyeti. GuardDuty ingeashiria kihalisi cha EC2 kikifanya miito isiyo ya kawaida ya API. Macie ingeashiria ndoo ya S3 yenye nambari za kadi za mkopo."

"Kwa hivyo GuardDuty ni mchambuzi wa kitabia," Leo alisema, "na Macie ni mkaguzi wa data."

"Sahihi kabisa. Unahitaji zote mbili. Mvamizi anayetoa data nje kupitia wito wa API unaoonekana halali anaweza kuashiriwa na GuardDuty kwa mfumo wa API usio wa kawaida. Lakini ikiwa mfanyakazi atapakia faili yenye rekodi 10,000 za wateja kwenye ndoo ya maendeleo, hakuna tabia isiyo ya kawaida ya kugundua — data nyeti tu mahali pasipo sahihi. Macie huinasa hiyo."

Kwa Nimbus, thamani ya haraka zaidi ya Macie ilikuwa kwenye ndoo ya `nimbus-debug-exports` — ndoo ambayo wasanidi walitumia kutupa data kwa kutatua. Macie ilipata faili tatu zenye historia za maagizo zenye majina ya wateja na anwani za uwasilishaji. Si data ya malipo, bali data ya kibinafsi isiyopaswa kuwa katika ndoo ya maendeleo isiyosimbwa.

Faili ziliondolewa. Sera iliongezwa: ndoo ya debug ilizuiwa kwa data ya jaribio ya bandia pekee. Data halisi ya mteja ilihitaji idhini ya Priya kuisafirisha kwa mazingira yoyote nje ya uzalishaji.

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Macie hutoza kulingana na idadi ya ndoo za S3 zilizotathminiwa kwa mwezi na kiasi cha data kilichoskaniwa. Kwa kampuni changa yenye idadi ya wastani ya ndoo, takriban $10-50 kwa mwezi. Bure kwa siku 30 za kwanza.

Tom aliiwasha kabla ya chakula cha mchana.

---

**AWS Security Hub: Dashibodi**

Ikiwa unaendesha akaunti nyingi za AWS au unahitaji mwonekano uliojumuishwa wa findings za usalama, **AWS Security Hub** hujumlisha findings kutoka GuardDuty, Inspector (tathmini ya udhaifu), Macie (faragha ya data), Config, na Firewall Manager katika dashibodi moja.

Pia hukagua usanidi wako dhidi ya mazoezi bora ya usalama (kiwango cha AWS Foundational Security Best Practices) na CIS AWS Foundations Benchmark.

Security Hub ndilo jibu la "ninaonaje findings zangu zote za usalama mahali pamoja bila kubadilisha kati ya koni tano tofauti?" GuardDuty inapozalisha finding, inaonekana katika GuardDuty na katika Security Hub. Macie inapopata data nyeti katika ndoo ya S3, inaonekana katika Macie na katika Security Hub. Kanuni ya Config inapogundua usanidi mbovu, inaonekana katika Config na katika Security Hub.

Kwa timu ya akaunti moja, Security Hub huongeza thamani ndogo — ni koni nyingine ya kuangalia. Nguvu yake hujitokeza kwa kiwango kikubwa: akaunti tatu, akaunti kumi, akaunti hamsini. Findings zote kutoka akaunti zote hujumlika katika Security Hub ya akaunti ya usimamizi. Timu moja hufuatilia dashibodi moja. Seti moja ya tahadhari. Hakuna kuangalia kumbukumbu akaunti kwa akaunti.

Kwa Nimbus: Security Hub haikuhitajika bado. Walipokua hadi akaunti tatu (dev, staging, uzalishaji), ingekuwa muhimu.

"Iweke sasa," Soo-Jin alisema, katika wiki yake ya tatu. "Inachukua dakika kumi na tano kuwasha. Inachukua miezi mitatu kutamani ungeifanya mapema."

Waliiwasha.

**Amazon Inspector: Tathmini ya Udhaifu**

Wiki moja baada ya kuwasha Macie, CVE ilichapishwa kwa toleo la OpenSSL linaloendesha katika fleet ya uzalishaji ya Nimbus. Priya alisoma ushauri huo akinywa kahawa.

"Tunahitaji kujua ni vihalisi vyetu vipi vimeathiriwa," alisema.

"Naweza kuendesha skani ya mkono," Leo alisema.

"Kwa vihalisi tisa, ndiyo. Kwa tisini? Kwa kontena?" Priya alifungua koni ya Inspector. "Hii ndiyo Inspector ni ya nini."

**Amazon Inspector** ni huduma ya tathmini ya udhaifu ya kiotomatiki. Pale ambapo GuardDuty huangalia tabia — kile miundombinu yako inafanya sasa hivi — Inspector huangalia kilichopo kinachoweza kutumiwa vibaya.

- **Vihalisi vya EC2:** Inspector huskani mfumo wa uendeshaji na vifurushi vilivyosakinishwa dhidi ya NVD (National Vulnerability Database) — katalogi yenye mamlaka ya CVE zinazojulikana. Ikiwa unaendesha OpenSSL 1.1.1 na CVE inalenga toleo hilo, Inspector huiashiria.
- **Picha za kontena za ECR:** Inspector huskani picha za kontena katika Elastic Container Registry kabla hazijasambazwa. Kifurushi chenye udhaifu katika picha ya msingi huonekana kama finding kabla kontena haijawahi kuendesha katika uzalishaji.
- **Vifurushi vya vitendaji vya Lambda:** Inspector huchambua utegemezi uliojumuishwa katika vitendaji vyako vya Lambda — vifurushi vya Python, moduli za Node, utegemezi wa Java — kwa udhaifu unaojulikana.

Tofauti muhimu kutoka skani ya mara moja: Inspector huendesha **kwa kuendelea**. Haichunguzi tu vihalisi vyako mara moja unapoiwasha na kutangaza kuwa safi. CVE mpya inapochapishwa, Inspector hutathmini upya kiotomatiki rasilimali zako zilizopo dhidi ya udhaifu mpya. Kihalisi cha EC2 kinapobadilika — kifurushi kipya kimesakinishwa, AMI imesasishwa — Inspector huskani upya. Fleet ya EC2 ya Priya iliashiriwa kwa CVE ya OpenSSL ndani ya dakika za kuwasha Inspector, si kwa sababu aliiomba iskani, bali kwa sababu hivyo ndivyo inavyofanya.

Findings zina viwango vya ukali: Critical, High, Medium, Low, Informational. Hutiririka kwa Security Hub pamoja na findings za GuardDuty na Macie. Dashibodi moja. Lenzi zote tatu.

"Vihalisi vitatu vimeathiriwa," Leo alisema, akisoma findings za Inspector. "Vingine sita viko kwenye toleo lililowekewa patch."

"Weka patch vitatu hivyo wiki hii," Priya alisema.

"Vipi kuhusu picha za kontena?"

Priya aliangalia findings za Inspector za ECR. Picha mbili za msingi katika usajili wao wa kontena zilikuwa na udhaifu unaojulikana — matoleo ya zamani ya vifurushi ambayo tangu wakati huo yamewekewa patch. Aliziweka alama kwa kujengwa upya.

"Jambo muhimu," Priya alisema, "ni kwamba tulipata hili kabla halijatumiwa vibaya. Si baada yake."

**Muundo wa Lenzi Tatu**

GuardDuty, Inspector, na Macie kila moja huangalia kitu tofauti:

- **GuardDuty** ni ya kitabia. Inauliza: *nini kinachotokea sasa hivi kinachoonekana kibaya?* Miito ya API kutoka maeneo yasiyotarajiwa, vihalisi vya EC2 vinavyowasiliana na seva za amri-na-udhibiti, vitambulisho vinavyotumika saa zisizo za kawaida. Inanasa vitisho amilifu na hitilafu.
- **Inspector** ni ya kimuundo. Inauliza: *nini kilichopo katika mazingira yetu kinachoweza kutumiwa vibaya?* Vifurushi visivyowekwa patch, utegemezi wenye udhaifu, runtime zilizopitwa na wakati. Inanasa hali zinazofanya mashambulizi yawezekane.
- **Macie** ni kuhusu data. Inauliza: *taarifa gani nyeti ziko katika ndoo zetu za S3 zisizopaswa kuwa hapo?* PII, rekodi za kifedha, vitambulisho vilivyoachwa katika faili. Inanasa ufichuzi usiozalisha tabia yoyote isiyo ya kawaida — data tu mahali pasipo sahihi.

Uathiriaji unaohusisha CVE inayojulikana unaweza kuonekana katika zote tatu: Inspector ingeashiria udhaifu kabla ya shambulizi. GuardDuty ingeashiria tabia isiyo ya kawaida wakati wa shambulizi. Macie ingeashiria data iliyotolewa nje baada ya kutua katika S3.

Lenzi tatu tofauti, upeo wa muda tatu tofauti, hakuna kati yake mbadala wa nyingine.

**AWS Network Firewall: Mkaguzi wa Trafiki**

Mtaalamu mmoja zaidi anastahili kutajwa kabla sanduku la zana halijafungwa. Vikundi vya usalama na NACL (Sura ya 15) huchuja trafiki kwa IP, lango, na protokoli — vinaweza kusema *nani* anaweza kuzungumza na *nini*, lakini haviwezi kuangalia ndani ya mazungumzo. **AWS Network Firewall** ni firewall inayosimamiwa, yenye hali unayoisambaza katika kiwango cha VPC. Inafanya ukaguzi wa kina wa pakiti: kuchuja kwa jina la kikoa (ruhusu kwenda nje tu kwa `*.eatnimbus.com` na hifadhi zako za vifurushi), kuzuia trafiki inayolingana na saini za uvamizi (IDS/IPS, inayopatana na kanuni za Suricata), na kukagua mitiririko ambayo vikundi vya usalama vingepitisha tu kwa sababu nambari ya lango ilionekana sawa.

"Kwa hivyo ni kikundi cha usalama chenye ubongo," Leo alisema.

"Ni kifaa ambacho ungekinunua kutoka kwa muuzaji wa firewall," Priya alisema, "isipokuwa kinasimamiwa, kinajipanua kiotomatiki, na kimesambazwa katika subneti yake yenyewe ili trafiki yote inayoingia na kutoka VPC ipitie kupitia kwacho."

Ishara za mtihani: "kagua au chuja trafiki kwa jina la kikoa au mzigo," "kugundua/kuzuia uvamizi (IDS/IPS) kwa VPC," au "kuchuja kwa pamoja kwa trafiki ya kwenda nje" → Network Firewall. Vikundi vya usalama na NACL ni jibu kwa kuruhusu/kukataa kwa kiwango cha kihalisi na kiwango cha subneti kwa lango na IP; Network Firewall ni jibu wakati swali linadai ukaguzi *ndani* ya trafiki. Na wakati swali linauliza jinsi ya kusimamia kanuni za WAF, Shield Advanced, vikundi vya usalama, *na* sera za Network Firewall kwa uthabiti katika akaunti nyingi — hiyo ni **AWS Firewall Manager**, safu ya usimamizi wa sera juu yake.

## Nguvu na Mapungufu

**AWS Shield**:

- Standard: bure na kiotomatiki — hakuna sababu ya kutoitumia
- Advanced: bora kwa malengo ya hadhi ya juu; ghali kwa timu ndogo
- Standard humeza mashambulizi ya safu 3/4 (mafuriko ya SYN, mafuriko ya UDP, kukuza DNS) kiotomatiki
- Advanced huongeza ulinzi wa safu 7, arifa za wakati halisi, na Shield Response Team

**AWS WAF**:

- Vikundi vya managed rules hurahisisha usanidi kwa kiasi kikubwa — ulinzi wa OWASP 10 Bora kwa mibonyezo michache
- Kanuni maalum zinahitaji kuelewa mifumo ya shambulizi ya HTTP
- Kuweka kikomo cha kiwango ni kipengele chenye nguvu kinachopuuzwa mara nyingi — chenye ufanisi dhidi ya wakwaruzaji na brute force
- WAF si mbadala wa msimbo salama wa programu — ni safu ya ulinzi kwa kina
- Anza katika hali ya Count, thibitisha, kisha badilisha kuwa Block

**GuardDuty**:

- Juhudi ya chini sana kuwasha (mibonyezo michache, jaribio la bure la siku 30)
- Findings zinahitaji ukaguzi na jibu la kibinadamu — GuardDuty hugundua, hairekebishi
- Chanya bandia hutokea — baadhi ya shughuli halali huonekana isiyo ya kawaida kwa miundo ya ML
- Viwango vya ukali (Chini/Wastani/Juu) husaidia kutanguliza jibu
- Huunganishwa na Security Hub, EventBridge, na Lambda kwa mitiririko ya majibu ya kiotomatiki

**Amazon Inspector**:

- Skani ya udhaifu ya kuendelea, ya kiotomatiki — si ukaguzi wa mara moja
- Huskani upya kiotomatiki CVE mpya zinapochapishwa au rasilimali zinapobadilika
- Hufunika vihalisi vya EC2 (OS na vifurushi vya programu), picha za kontena za ECR, na vifurushi vya vitendaji vya Lambda
- Findings hutiririka kwa Security Hub; viwango vya ukali husaidia kutanguliza uwekaji patch
- Haizuii mashambulizi — huonyesha hali zinazofanya mashambulizi yawezekane

**Amazon Macie**:

- Hugundua kiotomatiki data nyeti (PII, vitambulisho, data ya kifedha) katika S3
- Hunasa ufichuzi wa data usio na mfumo wa tabia isiyo ya kawaida — GuardDuty ingeukosa
- Jaribio la bure la siku 30; lipa kwa kila ndoo kwa mwezi baada ya hapo
- Yenye thamani zaidi kwa timu zenye ndoo nyingi za S3 na viwango tofauti vya usikivu

**AWS Security Hub**:

- Hujumlisha findings kutoka GuardDuty, Macie, Inspector, Config, na Firewall Manager
- Hukagua usanidi dhidi ya viwango vya usalama (CIS, NIST, PCI-DSS)
- Yenye thamani zaidi katika kiwango cha akaunti nyingi
- Washa mapema, hata kama una akaunti moja tu — historia ya findings hujilundika

## Muhtasari

Huduma tano, tabaka tano. Kila moja inashughulikia aina tofauti ya tishio — na hakuna kati yake mbadala wa nyingine. Shambulizi la DDoS hupita WAF na GuardDuty. Jaribio la sindano ya SQL hupita Shield. Kitambulisho kilichoathiriwa kinachotumika polepole na kwa uangalifu kinaweza kupita Shield na WAF kabisa — lakini GuardDuty itaona hitilafu. Msanidi anayepakia kwa bahati mbaya PII ya mteja kwenye ndoo ya debug ya S3 hupita zote tatu — lakini Macie huinasa.

- **AWS Shield Standard**: Ulinzi wa DDoS wa bure, wa kiotomatiki katika safu 3/4. Iko hai daima. Iliimeza mafuriko ya SYN ya 50 Gbps kabla hayajafikia load balancer ya Nimbus.
- **AWS Shield Advanced**: Ulinzi wa DDoS wa kiwango cha juu na ufikiaji wa SRT na ulinzi wa gharama. Kesi ya matumizi ya biashara kubwa.
- **AWS WAF**: Firewall ya kiwango cha programu. Kagua na chuja maombi ya HTTP. Ambatisha kwa CloudFront, ALB, au API Gateway. Tumia Managed Rule Groups kwa ulinzi wa OWASP 10 Bora. Kanuni zinazotegemea kiwango kwa ulinzi dhidi ya wakwaruzaji.
- **Amazon GuardDuty**: Kugundua tishio kwa kitabia. Vyanzo vya msingi vya data: matukio ya CloudTrail, VPC Flow Logs, na kumbukumbu za DNS. Ulinzi wa hiari uliopanuliwa huongeza matukio ya S3, ufuatiliaji wa runtime wa EKS/ECS, matukio ya kuingia ya RDS, na shughuli ya mtandao ya Lambda. Huzalisha findings zilizoainishwa kwa shughuli isiyo ya kawaida. Aina tano kuu za findings: UnauthorizedAccess (kuingia kwa koni), CryptoCurrency (uchimbaji), Recon (upapasaji wa lango), Trojan (trafiki ya C2), Policy (usanidi mbovu wa S3).
- **Amazon Inspector**: Tathmini ya udhaifu ya kiotomatiki. Huskani vihalisi vya EC2, picha za kontena za ECR, na vifurushi vya vitendaji vya Lambda kwa CVE zinazojulikana. Huendesha kwa kuendelea na hutathmini upya wakati udhaifu mpya unachapishwa. Findings hutiririka kwa Security Hub.
- **Amazon Macie**: Kugundua data nyeti katika S3. Hugundua PII, vitambulisho, na data ya kifedha. Hunasa ufichuzi usio na mfumo wa tabia isiyo ya kawaida.
- **AWS Security Hub**: Hujumlisha findings kutoka huduma zote za usalama katika dashibodi moja. Huwezesha ufuatiliaji uliokusanywa katika akaunti nyingi.
- **CloudTrail**: Msingi wa kuingiza kumbukumbu kwa usalama wa AWS yote. Washa trail inayoandika kwa S3 kwa uhifadhi wa muda mrefu. Kila huduma ya usalama husoma kutoka kwake.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03: Buni Usanifu Salama (Kikoa cha 1, Kazi ya 1.2)*

- **Shield Standard dhidi ya Advanced**: Standard ni bure na ya kiotomatiki. Advanced inagharimu pesa na huongeza SRT, ulinzi wa gharama, na kugundua bora. Ishara za mtihani za Advanced: "DDoS ya kiwango kikubwa," "dhamana ya SLA wakati wa mashambulizi," "ulinzi wa kifedha dhidi ya mwinuko wa gharama unaohusiana na DDoS."
- **Ishara za kesi za matumizi za WAF**: "zuia sindano ya SQL," "zuia cross-site scripting," "weka kikomo cha kiwango cha miito ya API," "zuia user-agents mahususi," "ulinzi wa OWASP 10 Bora" → WAF.
- **Ishara za GuardDuty**: "gundua shughuli isiyo ya kawaida ya API," "tambua vitambulisho vilivyoathiriwa," "ashiria miunganisho isiyo ya kawaida ya mtandao ya EC2," "akili ya tishio" → GuardDuty.
- **Kuambatisha WAF**: Inaweza kuambatishwa kwa CloudFront (kimataifa), ALB (kieneo), API Gateway (kieneo), AppSync.
- **Vyanzo vya data vya GuardDuty**: Vyanzo vitatu vya msingi — matukio ya CloudTrail, VPC Flow Logs, kumbukumbu za DNS. Vyanzo vya hiari vilivyopanuliwa ni pamoja na matukio ya data ya S3, kumbukumbu za ukaguzi za EKS, matukio ya kuingia ya RDS, shughuli ya mtandao ya Lambda, na runtime ya ECS. Mtihani unaweza kuuliza ni chanzo gani cha data kinachofaa kwa hali mahususi ya kugundua: "kuingia kusiko kwa kawaida kwa RDS" → GuardDuty RDS Protection; "vitisho vya runtime vya kontena" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie dhidi ya GuardDuty**: Huu ni kipotoshaji cha kawaida cha mtihani. **Macie** hutumia ML kugundua data nyeti katika S3 (PII, vitambulisho, data ya kifedha). **GuardDuty** hugundua vitisho na hitilafu katika tabia. Macie ni kuhusu maudhui. GuardDuty ni kuhusu tabia.
- **Inspector dhidi ya GuardDuty dhidi ya Macie**: Lenzi tatu tofauti, hakuna inayobadilisha nyingine. **Inspector** = skani ya udhaifu — CVE kwenye vihalisi vya EC2, picha za kontena katika ECR, na vifurushi vya vitendaji vya Lambda. Huendesha kwa kuendelea na huskani upya CVE mpya zinapochapishwa. **GuardDuty** = kugundua tishio kwa kitabia — kinachotokea sasa hivi kinachoonekana kisicho cha kawaida. **Macie** = kugundua data nyeti katika S3 — PII, vitambulisho, na data ya kifedha isiyopaswa kuwepo. Kiamsha cha mtihani: "tambua udhaifu usiowekwa patch kwenye EC2" au "skani picha za kontena kwa CVE" → Inspector. "Gundua miito isiyo ya kawaida ya API au vitambulisho vilivyoathiriwa" → GuardDuty. "Pata PII au data nyeti katika S3" → Macie.
- **Security Hub**: Hujumlisha findings za usalama kutoka huduma na akaunti nyingi. Hali ya mtihani: "kampuni ina akaunti nyingi za AWS na inataka mwonekano mmoja wa findings zote za usalama" → Security Hub.
- **Kanuni zinazotegemea kiwango katika WAF**: Hutumika kuweka kikomo cha maombi kwa kila IP ndani ya dirisha la muda. Tofauti na Core Rule Set (inayolingana na mifumo ya shambulizi). Mtihani hutumia kanuni zinazotegemea kiwango kwa "zuia majaribio ya kuingia ya brute force" au "punguza ukwaruzaji."
- **CloudTrail + GuardDuty + Security Hub**: Hizi tatu pamoja huunda msingi wa uonekanaji wa usalama wa AWS. Washa CloudTrail kwanza (GuardDuty na Security Hub zinaitegemea), kisha GuardDuty, kisha Security Hub kujumlisha findings.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya AWS WAF na Amazon GuardDuty. Kila huduma inalinda dhidi ya nini, na kila moja hufanya kazi katika safu gani?

*(Kidokezo: Fikiria kuhusu WAF kama kichujio cha maombi yanayoingia, na GuardDuty kama mchambuzi wa kitabia anayeangalia kumbukumbu zako.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Tovuti ya kampuni ya reja reja inalengwa na botnet inayotuma mamilioni ya maombi kwa saa kwa API yao ya utafutaji wa bidhaa. Maombi yanaonekana halali (mifuatano halali ya User-Agent, vidakuzi halali vya kipindi) lakini hayasababishi ununuzi — yanakwaruza bei za bidhaa. Shambulizi linasababisha wateja halali kupata nyakati za polepole za majibu.

Ni mchanganyiko upi wa huduma unaoshughulikia tishio hili BORA zaidi?

A) AWS WAF yenye kanuni za kuweka kikomo cha kiwango na CloudFront  
B) AWS Shield Advanced na CloudFront  
C) Amazon GuardDuty na AWS Shield Standard  
D) Network ACLs zinazozuia masafa ya IP ya botnet

**Kidokezo cha 1**: Maombi ni ya kiwango cha HTTP (safu ya programu). Ni huduma gani inayofanya kazi katika safu ya HTTP?

**Kidokezo cha 2**: Botnets hutumia anwani nyingi tofauti za IP — kuzuia masafa mahususi ya IP katika kiwango cha NACL hakuna ufanisi dhidi ya botnets kubwa.

**Kidokezo cha 3**: Kuweka kikomo cha kiwango kwa anwani ya IP kunaweza kupunguza kasi ya ukwaruzaji hata kama huwezi kuuzuia kabisa.

**Jibu**: A

**Maelezo**: AWS WAF inaweza kuweka kikomo cha kiwango cha maombi kwa kila anwani ya IP, ikipunguza athari ya ukwaruzaji wa kiasi kikubwa kutoka chanzo chochote kimoja. CloudFront husambaza trafiki inayoingia katika mtandao wa ukingo wa AWS, ikimeza kiasi na kulinda origin. Kanuni za WAF pia zinaweza kulingana na mifumo ya ombi (maombi ya mfuatano ya haraka kwa endpoint ileile ya API) kutambua tabia ya ukwaruzaji.

**Kwa nini si B?** Shield Advanced hulinda dhidi ya mafuriko ya DDoS (safu 3/4). Hali inaeleza ukwaruzaji wa kiwango cha programu (maombi ya HTTP ya safu 7), ambayo Shield haikagui.

**Kwa nini si C?** GuardDuty hugundua hitilafu katika tabia ya akaunti yako ya AWS — haizuii maombi yanayoingia ya HTTP. Shield Standard haishughulikii mashambulizi ya kiwango cha programu.

**Kwa nini si D?** Botnets kubwa hutumia maelfu ya anwani za IP kutoka vyanzo vilivyosambazwa. Kuzuia masafa mahususi ni mbinu ya whack-a-mole inayoshindwa dhidi ya botnets za kisasa.

*Kikoa cha SAA-C03: Buni Usanifu Salama — Kazi ya 1.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inazingatia muundo wao wa tishio wanapojiandaa kushughulikia data ya kadi za mkopo. Ukaguzi wa uzingatiaji wa PCI-DSS unahitaji:

- Ulinzi dhidi ya mashambulizi ya DDoS ya safu ya mtandao
- Kuchuja kwa kiwango cha programu kwa exploits za wavuti zinazojulikana
- Kuingiza kumbukumbu za miito yote ya API kwa hifadhi inayoonyesha kuchezewa, ya muda mrefu
- Kugundua mifumo isiyo ya kawaida ya ufikiaji kwa huduma ya malipo

Linganisha kila hitaji na huduma au usanidi mahususi wa AWS. Je, Shield Standard inatosha, au muktadha wa PCI-DSS unadokeza Advanced? Ungeambatisha WAF wapi?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kulinganisha mahitaji ya uzingatiaji na huduma za AWS.)*

## Onyesho la Baada ya Mikopo

GuardDuty iliwashwa.

Saa arobaini na nane baadaye, ilizalisha finding yake ya kwanza: *"EC2 Instance i-0abc123 inawasiliana na nodi ya kutoka ya Tor inayojulikana."*

Leo aliangalia kitambulisho cha kihalisi.

"Hicho ni kihalisi cha ufuatiliaji cha ndani," alisema. "Kile nilichoweka kuendesha uchunguzi wa mtandao."

"Je, kinapaswa kuwasiliana na nodi za kutoka za Tor?"

"Hapana." Akasita. "Kwa nini kingewasiliana?"

Alivuta kihalisi. Mtu fulani alikuwa amesakinisha zana juu yake — kipapasaji halali cha mtandao cha chanzo-huria ambacho, ikawa, pia kiliwasiliana na miundombinu ya Tor kwa ukusanyaji wa data usiojulikana.

"Kwa hivyo zana ilikuwa ikiita nyumbani," Priya alisema.

"Bila ufahamu wangu," Leo alithibitisha.

"Hiyo ni hatari ya msururu wa ugavi. Utegemezi unaofanya mambo ambayo hukuyaidhinisha."

Leo aliondoa zana. Aliweka mchakato wa kukagua kila zana ya mtu wa tatu kabla ya usakinishaji.

"Je, hiki ndicho kiwango cha hofu tulicho nacho sasa?" Maya aliuliza.

"Ndiyo," Priya alisema.

"Je, hiki ndicho kiwango ambacho tungepaswa kuwa nacho daima?" Maya aliuliza.

"Pia ndiyo," Priya alisema.

Katika sura inayofuata: nini hutokea wakati kituo cha data huko Oregon kinapotea — na kwa nini Nimbus inaendelea kufanya kazi.
