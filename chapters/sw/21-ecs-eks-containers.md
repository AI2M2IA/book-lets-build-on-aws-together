# Sura ya 21: Vyombo vya Kupakia kwa Nambuli

"Inafanya kazi kwenye kompyuta yangu."

Leo alijifunza kutoongea hivi kwa sauti. Haikuwa utetezi — ilikuwa utambuzi. Na utambuzi huu mara hii ulikuwa kipengele cha tatu cha EC2 cha uzalishaji, ambacho kilipokea kiraka cha maktaba wiki sita zilizopita ambacho hakuna aliyeandika, ambacho vipengele vingine viwili havikupokea, na ambacho sasa kilisababisha hitilafu iliyokuwepo tu hapo, katika kipengele hicho kimoja, isioonekana kila mahali pengine.

Alikuwa ametumia masaa matatu usiku wa kuamkia kuifuatilia.

"Kila wakati tunapeleka," alisema asubuhi iliyofuata, "tunafanikisha katika vipengele vingi. Toleo jipya, utegemezi tofauti. Inafanya kazi katika hatua ya kujaribu, inafunga katika uzalishaji kwa sababu mazingira yametofautiana."

"Kwa sababu mtu alisasisha pakiti kwenye kipengele cha tatu bila kusasisha vingine," Priya alisema. Bila ukatili.

"Nilihitaji toleo maalum la—"

"Najua," alisema. "Na sasa kipengele cha tatu kina historia tofauti kutoka kwa kipengele kimoja na mbili. Hiyo ni mgeuko wa usanidi. Ni kimya mpaka hauko."

Lambda ilitatua tatizo la seva ya usubiri kwa huduma ndogo za Nimbus. Lakini API kuu — ile inayobeba trafiki yote ya agizo — ilikuwa bado kwenye EC2. Na vipengele vya EC2, tofauti na vitendo, vilikuwa vikikusanya historia.

"Suluhisho halisi ni nini?" Maya aliuliza.

"Acha kutibu seva kama vitu vya kudumu unavyosanidi," Priya alisema. "Anza kuzitendea kama vitengo vinavyotupwa unavyobadilisha."

Kuna mfano unaelezea hili kwa usahihi kiasi kwamba unaonekana katika karibu kila maelezo ya vyombo vya programu. Inatoka mwaka 1956, na haina uhusiano na programu. Jibu, mtu alipouliza mwishowe "suluhisho gani la kupeleka bidhaa kwa uaminifu katika wasafirishaji tofauti?", lilikuwa: sanifisha chombo. Peleka kisanduku, si maudhui tu.

**Chombo ni Nini?**

**Chombo (container)** ni kitengo kidogo, kinachoweza kuhamishwa kinachopakia programu yako pamoja na kila kitu inachohitaji kufanya kazi: wakati wa utekelezaji (Python 3.11, Node.js 20, Java 17), maktaba na utegemezi, mafaili ya usanidi, na nambuli ya programu yenyewe.

Tofauti na mashine ya kawaida (ambayo inaiga kompyuta nzima, ikiwa ni pamoja na msingi wa mfumo wa uendeshaji), chombo kinashiriki msingi wa OS ya mwenyeji huku kikiweka kila kitu kingine kimetengwa. Hii inafanya vyombo vianzishe haraka (sekunde, wakati mwingine millisekunde) na vidogo (megabytes, si gigabytes).

Teknolojia ya vyombo maarufu zaidi ni **Docker**. Picha ya Docker ni mchoro — picha ya programu na mazingira yake. Chombo cha Docker ni kipengele kinachofanya kazi cha picha hiyo.

Mali muhimu: **kutobadilika (immutability)**. Picha iliyoundwa leo itaendesha kwa njia ile ile kwenye mwenyeji wowote anayesaidia Docker — kompyuta ya mkononi, kipengele cha EC2, seva katika kituo kingine cha data. Mazingira yamewekwa ndani. Mgeuko wa usanidi hauwezekani.

"Kwa hivyo badala ya kuwa na wasiwasi kuhusu kilichosanikishwa kwenye kipengele cha EC2," Leo alisema, "tunajenga picha yenye kila kitu. Picha inaendesha kwa njia ile ile kila mahali."

"Na kama unahitaji kuijaribu ndani ya nchi, unaendesha picha ile ile," Priya aliongeza. "Hakuna 'inafanya kazi kwenye kompyuta yangu' tena."

**Amazon ECS: Msimamizi**

Kuendesha chombo kimoja ni rahisi. Kuendesha makumi ya vyombo kwenye majeshi mengi, kupitisha trafiki kati yao, kuanzisha tena vyombo vilivyoshindwa, kupeleka matoleo mapya bila kutofanya kazi — hiyo inahitaji **msimamizi (orchestrator)**.

**Amazon ECS (Elastic Container Service)** ni huduma ya uandaaji wa vyombo inayosimamiwa na AWS. Unabainisha:

- **Ufafanuzi wa kazi (Task definition)**: Picha gani ya chombo kuendesha, CPU na kumbukumbu ngapi, vigezo gani vya mazingira, bandari gani za kufunua
- **Huduma (Service)**: Nakala ngapi za kazi kuendesha, jinsi ya kushughulikia kushindwa na usambazaji
- **Nguzo (Cluster)**: Miundombinu ya kompyuta ya msingi

ECS inashughulikia iliyobaki: kuweka kazi kwenye uwezo unapatikana, kuanzisha tena kazi zilizoshindwa, kutoa miunganisho wakati wa usambazaji, kusajili kazi zenye afya na kisambazaji cha mzigo.

Kwa Nimbus, API ilihamia kutoka kwa vipengele vya EC2 vyenye usambazaji ulioshughulikiwa kwa mkono hadi ECS. Kila usambazaji mpya ulisukuma picha mpya ya Docker kwenye **Amazon ECR (Elastic Container Registry)** — usajili wa vyombo unaosimamiwa na AWS — na ECS uliipiga mbizi katika kazi zote bila kutofanya kazi.

**Fargate dhidi ya Aina ya Uzinduzi wa EC2**

ECS inaweza kuendesha vyombo kwa njia mbili:

**Aina ya uzinduzi wa EC2**: Unasimamia vipengele vya EC2 vya msingi. Unawajibika kupiga kiraka vipengele, kuvipanga kwa saizi sahihi, na kuhakikisha kuna uwezo wa kutosha kwa vyombo vyako. Udhibiti zaidi, jukumu zaidi.

**Fargate (kompyuta bila seva kwa vyombo)**: AWS inasimamia miundombinu yote ya msingi kikamilifu. Unabainisha CPU na kumbukumbu kwa kila kazi; Fargate inatoa uwezo sahihi kiotomatiki. Hakuna vipengele vya EC2 vya kusimamia. Unalipa kwa kila vCPU-sekunde na GB-sekunde ya kumbukumbu.

Fargate ni mfano wa "vyombo bila seva" — unapata utengano wa mazingira wa vyombo bila kusimamia seva. Uwiano: udhibiti mdogo juu ya usanidi wa msingi wa kipengele na gharama ndogo zaidi ya juu kwa kila kitengo.

Kwa Nimbus: Fargate kwa huduma ya API. Hawakutaka kusimamia vipengele vya EC2 kwa vyombo.

**Amazon EKS: Unapohitaji Kubernetes**

**Kubernetes** ni mfumo wa uandaaji wa vyombo wa chanzo huria — kimsingi kiwango cha tasnia cha kusimamia vyombo kwa kiwango. Ni wenye nguvu, inayoweza kupanulika, na mgumu.

**Amazon EKS (Elastic Kubernetes Service)** ni huduma ya Kubernetes inayosimamiwa na AWS. Inaendesha ndege la udhibiti la Kubernetes (tabaka la usimamizi) kwa ajili yako, huku wewe ukisimamia nodi za wafanyakazi (au unatumia Fargate kwa hivyo pia).

Unapaswa kutumia EKS dhidi ya ECS lini?

**Tumia ECS** ikiwa:

- Hasa uko kwenye AWS na unataka uzoefu rahisi zaidi, zaidi wa AWS asili
- Timu yako haina ujuzi wa Kubernetes uliopo
- Unataka mzigo mdogo wa uendeshaji

**Tumia EKS** ikiwa:

- Unahitaji vipengele maalum vya Kubernetes (Ufafanuzi wa Rasilimali Maalum, chati za Helm, mfumo ikolojia wa Kubernetes)
- Timu yako tayari inajua Kubernetes
- Unaendesha mazingira ya mseto (baadhi kwenye maeneo ya ndani, baadhi kwenye AWS) na unataka tabaka sawa la uandaaji
- Mzigo wako una mahitaji yanayofanana na upanuaji wa Kubernetes

"Tunapaswa kutumia ipi?" Maya aliuliza.

"ECS," Priya alisema mara moja. "Hatuna ujuzi wa Kubernetes. ECS hufanya kila kitu tunachohitaji. Kuongeza Kubernetes sasa hivi ingekuwa kuongeza ugumu wa uendeshaji bila faida ya vitendo."

"Tunaweza daima kuhamia EKS baadaye ikiwa tutashinda ECS," Leo aliongeza.

Hii ni jibu sahihi la mhandisi mwandamizi: chagua zana rahisi zaidi inayofaa mahitaji yako ya sasa.

**Jinsi Vyombo Vinavyobadilisha Usambazaji**

Kabla ya vyombo, kupeleka toleo jipya la API ya Nimbus kulimaanisha:

1. Ingia kwa SSH kwenye kila kipengele cha EC2
2. Vuta nambuli ya hivi karibuni kutoka Git
3. Sanikisha/sasisha utegemezi
4. Anzisha tena mchakato wa programu
5. Thibitisha afya
6. Endelea kwa kipengele kinachofuata

Hii ilikuwa na makosa na polepole. Ilihitaji uratibu. Ikiwa hatua ya 3 ilishindwa kwenye kipengele cha 4, ulikuwa na usambazaji mchanganyiko na baadhi ya vipengele vikiwa vikiendesha toleo la zamani na baadhi vikishindwa kuendesha toleo jipya.

Na ECS na vyombo:

1. Jenga picha mpya ya Docker (kiotomatiki katika mzunguko wa CI/CD)
2. Sukuma kwa ECR
3. Sasisha huduma ya ECS kutumia toleo jipya la picha

ECS inashughulikia usambazaji wa mzunguko: inaanzisha kazi mpya na picha mpya, inasubiri mpaka ziwe na afya, kisha inaacha kazi za zamani. Usambazaji bila kutofanya kazi, kiotomatiki.

Ikiwa toleo jipya litashindwa ukaguzi wa afya, ECS inaacha usambazaji na toleo la zamani linaendelea kuhudumia trafiki.

## Nguvu na Mipaka

**Vyombo**:

- Zinaondoa kutofautiana kwa mazingira ("inafanya kazi kwenye kompyuta yangu")
- Zinawezesha usambazaji wa haraka, wa kuaminika
- Hazibadiliki — picha ile ile inaendesha kwa njia ile ile kila mahali
- Ufanisi — nyepesi kuliko VMs, kuanzisha haraka zaidi

**ECS**:

- Rahisi zaidi kuliko Kubernetes kwa mzigo unaozingatia AWS
- Muunganiko mkubwa na AWS (IAM, ALB, CloudWatch, Secrets Manager)
- Chaguo la Fargate linaondoa usimamizi wa EC2 kikamilifu

**EKS**:

- Uoanifu kamili wa Kubernetes — tumia mfumo ikolojia wote
- Bora kwa mazingira ya mseto au timu zenye ujuzi wa Kubernetes
- Ngumu zaidi kusanidi na kuendesha kuliko ECS

**Mahali ambapo mambo yanakuwa magumu**:

- Picha za vyombo lazima zijengwe na kupewa toleo — inahitaji mzunguko wa CI/CD
- Utatuzi wa vyombo unahitaji zana tofauti kuliko utatuzi wa michakato ya jadi
- Vyombo vya hali (hifadhidata katika vyombo) vinahitaji usanidi makini wa uhifadhi wa kudumu
- Mtandao kati ya vyombo (mawasiliano ya huduma-kwa-huduma) unahitaji kuelewa dhana za mtandao wa chombo

## Muhtasari

- **Vyombo** vinafungasha nambuli ya programu, wakati wa utekelezaji, na utegemezi pamoja — vinaendesha kwa njia ile ile kila mahali.
- **Docker** ni teknolojia ya kawaida ya chombo. Picha ni michoro; vyombo ni vipengele vinavyofanya kazi.
- **ECR (Elastic Container Registry)** ni usajili wa Docker unaosimamiwa na AWS — hifadhi na toa toleo kwa picha zako hapa.
- **ECS (Elastic Container Service)** inaandaa vyombo. Unabainisha kazi na huduma; ECS inasimamia uwekaji na mzunguko wa maisha.
- **Fargate** ni kompyuta bila seva kwa vyombo — hakuna vipengele vya EC2 vya kusimamia.
- **EKS (Elastic Kubernetes Service)** ni Kubernetes inayosimamiwa — kwa timu zinazohitaji vipengele vya Kubernetes au uoanifu.
- Chagua ECS kwa urahisi kwenye AWS; chagua EKS kwa uoanifu wa mfumo ikolojia wa Kubernetes.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Ishara za ECS dhidi ya EKS**: Hali za mtihani zinazoelezea "Kubernetes," "Helm," "ujuzi wa Kubernetes uliopo," au "uandaaji wa vyombo vya wingu wengi" → EKS. Kila kitu kingine → ECS.
- **Fargate dhidi ya aina ya uzinduzi wa EC2**: "Hutaki kusimamia vipengele vya EC2 kwa vyombo," "vyombo bila seva," "hakuna usimamizi wa miundombinu" → Fargate. "Haja ya aina maalum za vipengele," "mzigo wa GPU," "udhibiti wa kina wa kipengele" → aina ya uzinduzi ya EC2.
- **Majukumu ya kazi za ECS**: Kama vile majukumu ya kipengele cha EC2, kazi za ECS zina majukumu ya IAM. Kila kazi inaweza kuwa na ruhusa tofauti. Hali ya mtihani: "chombo kinahitaji kusoma kutoka S3" → ambatanisha jukumu la IAM kwa ufafanuzi wa kazi.
- **Uchunguzi wa picha za ECR**: ECR inaweza kuchunguza picha za vyombo kwa udhaifu unaojulikana (CVE). Ishara ya mtihani: "chunguza vyombo kwa udhaifu wa usalama" → uchunguzi wa picha za ECR.
- **Usambazaji wa buluu/kijani**: ECS inasaidia usambazaji wa buluu/kijani kupitia muunganiko wa CodeDeploy. Usambazaji bila kutofanya kazi na kurudi nyuma kiotomatiki. Mchakato wa mtihani: "pelekezea bila kutofanya kazi na kurudi nyuma kiotomatiki" → ECS + CodeDeploy buluu/kijani.
- **Kupanua Kiotomatiki kwa Huduma ya ECS**: Panua idadi ya kazi kulingana na CPU, kumbukumbu, au vipimo maalum vya CloudWatch. Inafanya kazi na ALB kupitisha trafiki kwa idadi sahihi ya kazi zinazofanya kazi.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya picha ya Docker na chombo cha Docker. Eleza tofauti kati ya ECS na ECR.

*(Kidokezo: Picha ni kwa chombo kama mapishi ni kwa sahani iliyopikwa. ECR inahifadhi picha; ECS inaziendeshea.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ina programu ya microservices inayoendeshwa sasa kwenye vipengele vya EC2 vinavyosimamiwa kwa mkono. Timu inakabiliwa na usambazaji usio sawa — vipengele tofauti vya EC2 vina matoleo tofauti ya maktaba, vikisababisha hitilafu ngumu za kuzaliana tena. Wanataka kusanifisha usambazaji huku wakipunguza mzigo wa uendeshaji kwa kusimamia seva za msingi. Timu haina ujuzi wa Kubernetes.

Suluhisho gani BORA linakidhi mahitaji haya?

A) Pelekezea kwenye EC2 na AWS Systems Manager Patch Manager kuweka vipengele sawa  
B) Weka programu kwenye makopo kwa Docker; tumia Amazon ECS na aina ya uzinduzi ya Fargate  
C) Weka programu kwenye makopo kwa Docker; tumia Amazon EKS na vikundi vya nodi vinavyosimamiwa kibinafsi  
D) Tumia AWS Elastic Beanstalk kusimamia usambazaji na usanidi wa kipengele kiotomatiki

**Kidokezo cha 1**: Vyombo vitatua tatizo la "mazingira yasiyosawa" moja kwa moja. Chaguo gani linatumia vyombo?

**Kidokezo cha 2**: "Punguza mzigo wa uendeshaji kwa kusimamia seva" → Fargate (hakuna usimamizi wa EC2) dhidi ya nodi zinazosimamia kibinafsi (bado unasimamia EC2).

**Kidokezo cha 3**: "Hakuna ujuzi wa Kubernetes" → EKS ni ugumu zaidi wa uendeshaji kuliko ECS.

**Jibu**: B

**Maelezo**: Kuweka kwenye makopo kwa Docker kunahakikisha kila usambazaji unatumia picha ile ile yenye utegemezi sawa — kuondoa mgeuko wa usanidi. ECS yenye Fargate inamaanisha hakuna vipengele vya EC2 vya kusimamia. Timu inazingatia nambuli ya programu na ufafanuzi wa vyombo, si matengenezo ya seva. ECS (si EKS) inafaa kwa timu zisizo na ujuzi wa Kubernetes.

**Kwa nini si A?** Patch Manager inaweka vipengele vya EC2 vikisasishwa lakini haitatatui kutofautiana kwa toleo la maktaba kati ya programu. Tatizo la kimsingi (mazingira tofauti ya nambuli kwenye vipengele tofauti) linabaki.

**Kwa nini si C?** EKS yenye vikundi vya nodi vinavyosimamiwa kibinafsi kunahitaji kusimamia vipengele vya EC2 *na* kujifunza Kubernetes. Hakuna kinachooana na mahitaji.

**Kwa nini si D?** Elastic Beanstalk inasimamia usambazaji wa programu kwenye EC2 lakini haitatatui kutofautiana kwa kimsingi kwa mazingira isipokuwa vyombo vitatumika. Beanstalk haitumii picha za Docker kwa chaguo-msingi (ingawa inaweza kusanidiwa kufanya hivyo).

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inagawanya API ya moja kwa moja katika microservices tatu: huduma ya agizo, huduma ya orodha, na huduma ya arifa. Kila huduma ina mahitaji tofauti ya kupanua (huduma ya agizo inapanua na trafiki; huduma ya orodha ni ya kusoma zaidi na thabiti; huduma ya arifa ina mabadiliko ya ghafla).

Buni muundo wa ECS kwa huduma hizi tatu. Ungeshughulikia vipi mawasiliano ya huduma-kwa-huduma? Je, ungetumia nguzo moja ya ECS au tatu? Ungepanga Kupanua Kiotomatiki tofauti vipi kwa kila huduma?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya muundo wa usanifu wa microservices kwenye ECS.)*

## Tukio Baada ya Mikopo

Usambazaji wa kwanza wa chombo ulikuwa laini.

Toleo jipya la API: bila kutofanya kazi. ECS uliipiga mbizi, ukaguzi wa afya ulipita, kazi za zamani zilitolewa miunganisho, kazi mpya zilichukua nafasi. Leo alitazama hali ya kazi katika dashibodi kwa kitu kinachokaribia kutokuamini.

"Ilifanya kazi tu," alisema.

"Hiyo ndiyo lengo," Priya alisema.

"Hakuna SSH. Hakuna kutofanya kazi. Hakuna 'subiri ianzishe tena.'"

"Picha ndiyo kitu kinachowakilisha usambazaji," alisema. "Mazingira hayabadiliki. Mchakato wa usambazaji ni wa kutangaza. Hivi ndivyo programu inavyopaswa kusafirishwa."

Leo alitazama dashibodi kwa dakika nyingine.

"Nilitumia miaka mitatu kuratibu usambazaji wa EC2," alisema. "Kuratibu hati za SSH. Kuandika vitabu vya maelekezo vya usambazaji."

"Ulikuwa ukitatua tatizo," Priya alisema, "ambalo vyombo vinavyotatua kwa muundo."

Alisema chochote baada ya hapo. Lakini asubuhi iliyofuata, alianza kuandika hati juu ya mchakato wa ujenzi wa chombo, ili hakuna mwingine atakayelazimika kutumia miaka mitatu kuugundua.

Katika sura inayofuata: chati inayojiendesha — na inayokumbuka mahali ilipokuwa.
