# Sura ya 21: Vyombo vya Kupakia kwa Msimbo

Kabla ya mwaka 1956, kupakia mizigo kwenye meli ulikuwa mazungumzo ya ujuzi na maalum. Kila meli ilikuwa na vyumba tofauti vya mizigo. Kila bandari ilikuwa na korongo tofauti. Kila mbeba mzigo alikuwa na mifumo tofauti ya kufuatilia kilichoenda wapi. Sanduku la bidhaa lilihama kutoka lori hadi gati hadi meli hadi gati hadi lori kupitia mnyororo wa watu walioshughulikia wote kwa njia tofauti. Mizigo ilipotea. Mizigo iliharibika. Bidhaa zile zile, zilizosafirishwa mara mbili, zilifika katika hali tofauti kwa sababu ushughulikiaji ulikuwa tofauti mara zote mbili.

Jibu, mtu alipouliza mwishowe kwa uwazi, lilikuwa: sanifisha chombo. Usitatue tatizo kwenye kila bandari. Litatue mara moja, katika kiwango cha chombo. Safirisha kisanduku, si maudhui tu.

Chombo cha kupakia kilichosanifishwa hakikufanya tu usafirishaji kuwa wa haraka. Kilifanya usafirishaji kuwa *unaotabirika*. Maudhui ya chombo huko Shanghai yalikuwa katika hali ile ile haswa yalipofika Rotterdam — kwa sababu chombo kiliyalinda kutokana na kutofautiana kwenye kila kituo cha kuhamisha.

Hilo ndilo tatizo haswa Leo aliokuwa nalo. API ya Nimbus ilikuwa ikipakiwa tofauti kwenye kila "bandari": hatua ya kujaribu ilisambazwa tofauti na uzalishaji, kipengele kimoja kilisambazwa tofauti na kipengele cha tatu, na wiki sita za mabadiliko yasiyoandikwa zilikuwa zimeufanya kundi kuwa lisilotabirika.

Chombo hakitamfanya Leo kuwa msanidi wa haraka zaidi. Kingefanya usambazaji kuwa unaotabirika.

---

Uhamiaji wa Lambda ulikuwa umepunguza bili ya EC2 kwa huduma ndogo. Lakini API kuu ilikuwa tofauti — iliendesha kwa kuendelea, ilibeba trafiki yote ya agizo, na ilikuwa imekuwa ikikusanya historia ya usanidi kwa miezi minane. Lambda ilitatua usubiri. Vyombo vingetatua kutofanana.

API kuu haikuwa ya usubiri; haikuweza kuhamia Lambda. Lakini ilikuwa na tatizo tofauti: vipengele vya EC2 vilivyoiendesha vilikuwa vimetofautiana kutoka kwa kila mmoja.

---

Leo alikuwa amejifunza kutosema "inafanya kazi kwenye kompyuta yangu" kwa sauti. Haikuwa utetezi — ilikuwa utambuzi. Na utambuzi mara hii ulikuwa kipengele cha tatu cha EC2 cha uzalishaji, ambacho kilipokea kiraka cha maktaba wiki sita zilizopita ambacho hakuna aliyeandika, ambacho vipengele vingine viwili havikupokea, na ambacho sasa kilisababisha hitilafu iliyokuwepo tu hapo, katika kipengele hicho kimoja, isioonekana kila mahali pengine.

Alikuwa ametumia masaa matatu usiku wa kuamkia kuifuatilia.

"Kila wakati tunaposambaza," alisema asubuhi iliyofuata, "tunaratibu katika vipengele vingi. Toleo jipya, tegemezi tofauti. Inafanya kazi katika hatua ya kujaribu, inavunjika katika uzalishaji kwa sababu mazingira yametofautiana."

"Kwa sababu mtu alisasisha pakiti kwenye kipengele cha tatu bila kusasisha vingine," Priya alisema. Bila ukatili.

"Nilihitaji toleo maalum la—"

"Najua," alisema. "Na sasa kipengele cha tatu kina historia tofauti kutoka kwa kipengele kimoja na mbili. Hiyo ni mgeuko wa usanidi. Ni kimya hadi hauko."

"Suluhisho halisi ni nini?" Maya aliuliza.

"Acha kutibu seva kama vitu vya kudumu unavyosanidi," Priya alisema. "Anza kuzitendea kama vitengo vinavyotupwa unavyobadilisha."

**Chombo ni Nini?**

"Fikiria kama chombo cha kupakia," Leo alisema, akichukua kalamu. "Chombo hakijali kiko kwenye meli ipi. Meli haijali kuna nini ndani ya chombo. Walikubaliana juu ya vipimo na utaratibu wa kufunga. Kila kitu kingine kiko ndani ya kisanduku."

**Chombo (container)** ni kitengo kidogo, kinachoweza kuhamishwa kinachopakia programu yako pamoja na kila kitu inachohitaji kufanya kazi: wakati wa utekelezaji (Python 3.11, Node.js 20, Java 17), maktaba na tegemezi, mafaili ya usanidi, na msimbo wa programu wenyewe.

Tofauti na mashine ya kawaida (ambayo inaiga kompyuta nzima, ikiwa ni pamoja na msingi wa mfumo wa uendeshaji), chombo kinashiriki msingi wa OS ya mwenyeji huku kikiweka kila kitu kingine kimetengwa. Hii inafanya vyombo vianzishe haraka (sekunde, wakati mwingine millisekunde) na vidogo (megabytes, si gigabytes).

Teknolojia ya vyombo maarufu zaidi ni **Docker**. Picha ya Docker ni mchoro — picha ya programu na mazingira yake. Chombo cha Docker ni kipengele kinachofanya kazi cha picha hiyo.

Mali muhimu: **kutobadilika (immutability)**. Picha iliyojengwa leo itaendesha kwa njia ile ile kwenye mwenyeji wowote anayesaidia Docker — kompyuta ya mkononi, kipengele cha EC2, seva katika kituo kingine cha data. Mazingira yamewekwa ndani. Mgeuko wa usanidi hauwezekani.

"Kwa hivyo badala ya kuwa na wasiwasi kuhusu kilichosanikishwa kwenye kipengele cha EC2," Leo alisema, "tunajenga picha yenye kila kitu. Picha inaendesha kwa njia ile ile kila mahali."

"Na kama unahitaji kuijaribu humu humu, unaendesha picha ile ile," Priya aliongeza. "Hakuna 'inafanya kazi kwenye kompyuta yangu' tena."

**Kujenga Picha ya Docker na Kuisukuma kwa ECR**

Kabla msimamizi yeyote hajaweza kusimamia chombo, Leo ilibidi akijenge na akihifadhi mahali ambapo ECS ingeweza kuvuta kutoka.

Aliandika Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Mstari muhimu: `FROM python:3.11-slim`. Si Python 3.9. Si Python 3.10. 3.11 — toleo mahususi ambalo timu ilikubaliana, lililowekwa ndani ya picha. Kila kipengele kinachoendesha picha hii kingetumia haswa Python 3.11. Tabia ya kuzungusha ya moduli ya decimal ingekuwa sawa kila mahali.

Alijenga picha humu humu: `docker build -t nimbus-api:1.0.0 .`

Ujenzi ulichukua dakika 4. Docker ilivuta picha ya msingi, ilisanikisha tegemezi, ilinakili msimbo wa programu, na ikazalisha picha iliyowekwa lakabu `nimbus-api:1.0.0`.

Aliiendesha humu humu: `docker run -p 8000:8000 nimbus-api:1.0.0`

API ilianza. Bandari ile ile, tabia ile ile kama seva ya uzalishaji — kwa sababu mazingira yalikuwa sawa.

Kisha akaisukuma kwa ECR:

```bash
# Thibitisha Docker kwa ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Weka lakabu kwa picha kwa ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Sukuma
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Kusukuma kulichukua dakika 2. ECR ilihifadhi picha, mara moja ilianzisha uchunguzi wa picha, na iliripoti matokeo ndani ya dakika 5.

**Amazon ECS: Msimamizi**

Kuendesha chombo kimoja ni rahisi. Kuendesha makumi ya vyombo kwenye majeshi mengi, kupitisha trafiki kati yao, kuanzisha tena vyombo vilivyoshindwa, kusambaza matoleo mapya bila kutofanya kazi — hiyo inahitaji **msimamizi (orchestrator)**.

**Amazon ECS (Elastic Container Service)** ni huduma ya uandaaji wa vyombo inayosimamiwa na AWS. Unabainisha:

- **Ufafanuzi wa kazi (Task definition)**: Picha gani ya chombo kuendesha, CPU na kumbukumbu ngapi, vigezo gani vya mazingira, bandari gani za kufunua
- **Huduma (Service)**: Nakala ngapi za kazi kuendesha, jinsi ya kushughulikia kushindwa na usambazaji
- **Nguzo (Cluster)**: Miundombinu ya kompyuta ya msingi

ECS inashughulikia iliyobaki: kuweka kazi kwenye uwezo unaopatikana, kuanzisha tena kazi zilizoshindwa, kutoa miunganisho wakati wa usambazaji, kusajili kazi zenye afya na kisambazaji cha mzigo.

Kwa Nimbus, API ilihama kutoka kwa vipengele vya EC2 vyenye usambazaji ulioshughulikiwa kwa mkono hadi ECS. Kila usambazaji mpya ulisukuma picha mpya ya Docker kwenye **Amazon ECR (Elastic Container Registry)** — usajili wa vyombo unaosimamiwa na AWS — na ECS iliusambaza katika kazi zote bila kutofanya kazi.

**Fargate dhidi ya Aina ya Uzinduzi wa EC2**

ECS inaweza kuendesha vyombo kwa njia mbili:

**Aina ya uzinduzi wa EC2**: Unasimamia vipengele vya EC2 vya msingi. Unawajibika kupiga viraka vipengele, kuvipanga kwa saizi sahihi, na kuhakikisha kuna uwezo wa kutosha kwa vyombo vyako. Udhibiti zaidi, jukumu zaidi.

**Fargate (kompyuta bila seva kwa vyombo)**: AWS inasimamia miundombinu yote ya msingi kikamilifu. Unabainisha CPU na kumbukumbu kwa kila kazi; Fargate inatoa uwezo sahihi kiotomatiki. Hakuna vipengele vya EC2 vya kusimamia. Unalipa kwa kila vCPU-sekunde na GB-sekunde ya kumbukumbu.

Fargate ni mfano wa "vyombo bila seva" — unapata utengano wa mazingira wa vyombo bila kusimamia seva. Uwiano: udhibiti mdogo juu ya usanidi wa msingi wa kipengele na gharama ndogo ya juu kidogo kwa kila kitengo.

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza, akiibua kikokotoo cha bei. "Fargate dhidi ya aina ya uzinduzi wa EC2 — nataka kuona namba halisi."

Makadirio ya hisia ya Leo — yale ambayo kila mtu hubeba — yalikuwa kwamba Fargate ingegharimu zaidi. Urahisi wa bila seva, bei ya premium. Alikisia labda asilimia ishirini au thelathini juu ya EC2.

"Endesha namba halisi," Tom alisema, kwa sababu huyo ndiye Tom.

Huduma ya API ya Nimbus iliendesha kazi 3, kila moja ikihitaji 0.5 vCPU na 1GB ya kumbukumbu, masaa 24/7:

**Fargate**: $0.04048/vCPU-saa × 0.5 × 3 × masaa 720 = $43.72/mwezi kwa CPU. $0.004445/GB-saa × 1 × 3 × 720 = $9.60/mwezi kwa kumbukumbu. Jumla: $53.32/mwezi.

**Aina ya uzinduzi wa EC2** (3 × t3.medium kwa $0.0416/saa): $0.0416 × 3 × 720 = $89.86/mwezi.

"Subiri," Tom alisema. "Fargate ni ya bei nafuu zaidi?"

"Kwa ukubwa huu, ndiyo," Leo alisema. "Fargate inatoza haswa kwa kile unachotenga. Vipengele vya EC2 vina gharama ya juu — OS na wakala wa ECS vinatumia CPU na kumbukumbu kabla vyombo vyako havijaanza hata. t3.medium inatoa 2 vCPU na 4GB, lakini unatumia 0.5 vCPU na 1GB kwa kila chombo. Iliyobaki imepotea."

"Lakini aina ya uzinduzi wa EC2 inakuruhusu kupanga kazi nyingi kwenye kipengele kimoja."

"Ndiyo. Kwa ukubwa mkubwa zaidi, na upangaji wa makini wa bin, aina ya uzinduzi wa EC2 inakuwa ya bei nafuu zaidi. Kwa ukubwa wetu — kazi tatu — Fargate inashinda."

Tom aliandika hili.

Kwa Nimbus: Fargate kwa huduma ya API. Hawakutaka kusimamia vipengele vya EC2 kwa vyombo.

Ukiweka kwenye vyombo na Fargate, unaondoa gharama yote ya juu ya usimamizi wa EC2 — lakini unaachilia uwezo wa kubinafsisha aina za vipengele, ambao unajalisha kwa mzigo wa GPU au mtandao maalum. Ukichagua ECS kwa urahisi wa AWS-asili, unapata muunganiko thabiti wa IAM na ALB — lakini umefungiwa nje ya mfumo ikolojia wa Kubernetes, ambao unahitaji kupanga upya usanifu ikiwa baadaye utahitaji uhamishikaji wa wingu nyingi.

**Amazon EKS: Unapohitaji Kubernetes**

**Kubernetes** ni mfumo wa uandaaji wa vyombo wa chanzo huria — kimsingi kiwango cha tasnia cha kusimamia vyombo kwa kiwango. Ni wenye nguvu, unaoweza kupanulika, na mgumu.

**Amazon EKS (Elastic Kubernetes Service)** ni huduma ya Kubernetes inayosimamiwa na AWS. Inaendesha ndege la udhibiti la Kubernetes (tabaka la usimamizi) kwa ajili yako, huku wewe ukisimamia nodi za wafanyakazi (au unatumia Fargate kwa hizo pia).

Unaweza kuwa unajiuliza: ikiwa Kubernetes ndio kiwango cha tasnia na kila tangazo la kazi linaitaja, kwa nini tusiitumie tu? Kwa sababu "kiwango cha tasnia" kinaeleza kile kampuni kubwa zenye timu maalum za jukwaa zinatumia. Kwa timu ya watu sita inayojenga programu ya kuagiza chakula, Kubernetes inaongeza ugumu wa uendeshaji bila faida ya vitendo sasa hivi. Ugumu ni halisi; faida ni ya kinadharia katika kiwango hiki.

Kubernetes inatoa thamani katika kiwango cha ugumu ambacho timu nyingi hazihitaji: ufafanuzi wa rasilimali za desturi kwa kujenga majukwaa ya ndani, vikwazo vya hali ya juu vya kuratibu, bajeti za usumbufu wa pod kwa udhibiti wa kina wa usambazaji, na muunganiko wa service mesh kwa usimamizi wa trafiki kati ya mamia ya microservices. Hizi ni uwezo halisi. Pia ni uwezo ambao kampuni changa ya ukubwa wa Nimbus kamwe haitautumia.

Kanuni ya uhandisi hapa wakati mwingine inaitwa YAGNI: You Aren't Gonna Need It (Hutaihitaji). ECS inaipa Nimbus kila kitu kinachohitajika kwa sasa. EKS inaipa zaidi ya inavyohitaji, pamoja na mkondo mkubwa wa kujifunza na gharama ya juu ya uendeshaji. "Itakuwa na manufaa baadaye" si sababu nzuri ya kuongeza ugumu sasa.

Unapaswa kutumia EKS dhidi ya ECS lini?

**Tumia ECS** ikiwa:

- Hasa uko kwenye AWS na unataka uzoefu rahisi zaidi, zaidi wa AWS-asili
- Timu yako haina ujuzi wa Kubernetes uliopo
- Unataka mzigo mdogo wa uendeshaji

**Tumia EKS** ikiwa:

- Unahitaji vipengele maalum vya Kubernetes (Ufafanuzi wa Rasilimali za Desturi, chati za Helm, mfumo ikolojia wa Kubernetes)
- Timu yako tayari inajua Kubernetes
- Unaendesha mazingira ya mseto (baadhi kwenye maeneo ya ndani, baadhi kwenye AWS) na unataka tabaka sawa la uandaaji
- Mzigo wako una mahitaji yanayofanana na upanuzi wa Kubernetes

**Mtandao wa Vyombo: IP za Muda Mfupi na Ugunduzi wa Huduma**

Kitu kimoja kinachowashtua timu zinapohamia vyombo: anwani ya IP ya chombo inabadilika kila kinapoanzishwa tena.

Katika ulimwengu wa EC2, vipengele vilikuwa na IP za faragha thabiti kiasi. Ungeweza (ingawa haupaswi) kuziandika ngumu katika mafaili ya usanidi. Huduma zilijuana kwa IP.

Katika ulimwengu wa vyombo, kila kazi katika ECS inapata IP kutoka kwa subnet ya VPC inapoanza. Inaposimama na kazi mpya inapoanza (kama sehemu ya usambazaji au kuanzisha tena), kazi hiyo mpya inapata IP tofauti.

"Kinachotokea wakati huduma imeandikwa ngumu kuita `10.0.1.45` na chombo hicho kinabadilishwa na `10.0.1.82`?" Priya aliuliza. "Huduma inayoita inaanza kufika mahali pasipo na kitu."

Hii ndiyo sababu ugunduzi wa huduma unajalisha katika mazingira ya vyombo. ECS + Application Load Balancer inashughulikia hili kiotomatiki: jina la DNS la ALB ni thabiti; ECS inasajili kazi zenye afya na kundi la lengo; ALB inapitisha kwa kazi zozote zilizo na afya kwa sasa. Huduma inayoita inazungumza na jina la DNS la ALB, si na IP za vyombo binafsi.

Kwa mawasiliano ya ndani ya huduma-kwa-huduma (yasiyomwelekea mtumiaji), **AWS Cloud Map** inatoa ugunduzi wa huduma: kila huduma ya ECS inasajili na Cloud Map, ambayo inatoa jina la DNS thabiti. Huduma ya agizo inaita `http://notification.nimbus.local:8080`, na Cloud Map inalitatua hilo kwa kazi zozote katika huduma ya arifa zilizo na afya kwa sasa.

"Kwa hivyo vyombo vinazungumza kati yao kupitia majina ya DNS, si IP?" Leo alithibitisha.

"Sahihi. IP ni ya muda mfupi. Jina la DNS ndio mkataba."

**Kuingiza Siri: Hakuna Siri katika Vigezo vya Mazingira**

Usambazaji wa awali wa EC2 ulikuwa na tatizo ambalo Priya alikuwa amelionyesha kwa miezi: siri (nenosiri la hifadhidata, vitufe vya API, stakabadhi za SES) zilihifadhiwa katika vigezo vya mazingira kwenye kipengele cha EC2, zilizowekwa kupitia hati ya usambazaji.

Vigezo vya mazingira vinafikika kwa mchakato wowote unaoendesha kwenye kipengele. Vinaonekana katika zana za utatuzi, katika baadhi ya ripoti za kuanguka, na katika orodha za michakato. Pia vinaonekana katika CloudWatch ukiviweka kwenye kumbukumbu (ambayo baadhi ya zana za maendeleo hufanya kwa chaguo-msingi).

Vyombo havitatui hili kiotomatiki — bado ungeweza kupitisha siri kama vigezo vya mazingira katika ufafanuzi wa kazi wa ECS. Na ufafanuzi wa kazi wa ECS huhifadhiwa katika dashibodi ya AWS, unaonekana kwa yeyote mwenye ufikiaji wa ECS.

Mchakato sahihi: **muunganiko wa AWS Secrets Manager + ufafanuzi wa kazi wa ECS**.

Badala ya kuhifadhi nenosiri la hifadhidata katika ufafanuzi wa kazi:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS inapata siri kutoka kwa Secrets Manager wakati wa uzinduzi wa kazi na inaiingiza katika chombo kama kigezo cha mazingira. Thamani ya siri kamwe haihifadhiwi katika ufafanuzi wa kazi — ARN ya siri ya Secrets Manager pekee. Chombo kinapokea thamani wakati wa utekelezaji. Secrets Manager inaweza kuzungusha thamani bila kubadilisha ufafanuzi wa kazi.

"Na ikiwa mtu atasoma ufafanuzi wa kazi?" Priya aliuliza. "Wangeona ARN ya Secrets Manager, lakini si thamani."

"Na bila ruhusa sahihi za IAM," Leo alithibitisha, "hawawezi kupata thamani kutoka kwa Secrets Manager pia."

"Huo ndio muundo," Priya alisema. "Jukumu la utekelezaji la kazi lina ruhusa ya kusoma siri hiyo mahususi. Hakuna kingine. Kudukua ufafanuzi wa kazi kunakupa ARN, si nenosiri."

"Tunapaswa kutumia ipi?" Maya aliuliza. "Na kwa nini si Kubernetes? Iko katika kila maelezo ya kazi. Kila hotuba ya kongamano."

"ECS," Priya alisema mara moja. "Hatuna ujuzi wa Kubernetes. ECS inafanya kila kitu tunachohitaji. Kuongeza Kubernetes sasa hivi kungekuwa kuongeza ugumu wa uendeshaji bila faida ya vitendo."

Soo-Jin, ambaye alikuwa ameendesha nguzo za Kubernetes katika kampuni yake ya mwisho, alitikisa kichwa. "Nimebeba peja hiyo. Huitaki hadi uihitaji."

"Tunaweza daima kuhamia EKS baadaye ikiwa tutazidi ECS," Leo aliongeza.

Hili ni jibu sahihi la mhandisi mwandamizi: chagua zana rahisi zaidi inayofaa mahitaji yako ya sasa.

**ECR: Kulinda Picha Zako**

"Na je, ikiwa mtu atajaribu kuvunja kupitia picha ya msingi yenye udhaifu?" Priya aliuliza. "Mtu anachukua picha ya zamani yenye CVE inayojulikana na kuitumia kupata mwanzo katika chombo cha programu?"

Lilikuwa swali sahihi la kuuliza kabla ya kusambaza chombo chochote katika uzalishaji.

**Amazon ECR (Elastic Container Registry)** inahifadhi picha zako za Docker na inaweza kuzichunguza kwa udhaifu unaojulikana kabla ya usambazaji. Uchunguzi wa picha wa ECR unakagua picha dhidi ya hifadhidata ya CVE zinazojulikana (Common Vulnerabilities and Exposures) na unaonyesha masuala kwa ukali.

Sera ambayo Priya aliandika: hakuna picha yenye CVE ya ukali wa CRITICAL ingesambazwa kwenye uzalishaji. Mzunguko wa CI/CD ungekagua matokeo ya uchunguzi kabla ya kusasisha huduma ya ECS. Ikiwa udhaifu wa kiwango cha juu utapatikana, mzunguko ungeshindwa na kuionya timu.

"Hiyo si wasiwasi wa kupita kiasi," Priya alisema. "Hiyo ni kuwa na ukaguzi tu kabla ya kusambaza."

**Jinsi Vyombo Vinavyobadilisha Usambazaji**

Kabla ya vyombo, kusambaza toleo jipya la API ya Nimbus kulimaanisha:

1. Ingia kwa SSH kwenye kila kipengele cha EC2
2. Vuta msimbo wa hivi karibuni kutoka Git
3. Sanikisha/sasisha tegemezi
4. Anzisha tena mchakato wa programu
5. Thibitisha afya
6. Endelea kwa kipengele kinachofuata

Hii ilikuwa na makosa na polepole. Ilihitaji uratibu. Ikiwa hatua ya 3 ilishindwa kwenye kipengele cha 4, ulikuwa na usambazaji mchanganyiko na baadhi ya vipengele vikiendesha toleo la zamani na baadhi vikishindwa kuendesha toleo jipya.

Na ECS na vyombo:

1. Jenga picha mpya ya Docker (kiotomatiki katika mzunguko wa CI/CD)
2. Sukuma kwa ECR
3. Sasisha huduma ya ECS kutumia toleo jipya la picha

ECS inashughulikia usambazaji wa mzunguko: inaanzisha kazi mpya na picha mpya, inasubiri mpaka ziwe na afya, kisha inaacha kazi za zamani. Usambazaji bila kutofanya kazi, kiotomatiki.

Ikiwa toleo jipya litashindwa ukaguzi wa afya, ECS inaacha usambazaji na toleo la zamani linaendelea kuhudumia trafiki.

**Usanidi wa Chini wa Usambazaji: Ukaguzi wa Afya**

Usalama wote wa usambazaji wa vyombo unategemea ukaguzi wa afya kufanya kazi kweli.

ECS inatumia aina mbili za ukaguzi wa afya:

**Ukaguzi wa afya wa kiwango cha chombo**: Umefafanuliwa katika Dockerfile au ufafanuzi wa kazi. Unaendesha ndani ya chombo kuthibitisha programu inajibu.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Ukaguzi wa afya wa kundi la lengo la ALB**: Kisambazaji cha mzigo mara kwa mara hutuma maombi ya HTTP kwa sehemu ya mwisho ya afya. Kazi zinazoshindwa ukaguzi wa afya zinaondolewa kutoka kwa kundi la lengo.

Ikiwa hakuna ukaguzi wa afya ulioundwa ipasavyo, ECS inazingatia kila kazi kuwa yenye afya — na itasambaza picha iliyovunjika bila kusimama. Hili ni kosa la kawaida zaidi la usambazaji wa vyombo.

"Je, sehemu ya mwisho ya ukaguzi wa afya inaweza kuvuja taarifa za ndani?" Priya aliuliza.

Sehemu ya mwisho ya ukaguzi wa afya katika `/health` ilirudisha tu: `{"status": "ok"}`. Hakuna nambari za toleo, hakuna hali za tegemezi, hakuna usanidi wa ndani. Taarifa yoyote katika jibu la afya inaweza kuwa na manufaa kwa mtu anayechora ramani ya programu. Weka sehemu za mwisho za afya kuwa za chini.

Kwa hali ya kina ya afya ya ndani (muunganisho wa hifadhidata, ukaguzi wa tegemezi), tumia sehemu ya mwisho tofauti iliyothibitishwa ya `/health/detail` — inayofikika tu kutoka ndani ya VPC.

**Kurekodi kwa Muundo: Dirisha Pekee Ndani ya Chombo Kinachofanya Kazi**

Kwenye EC2, kitu kilikwenda vibaya na unaingia kwa SSH. Unafuatilia faili la kumbukumbu. Unaangalia jedwali la mchakato. Unakagua matumizi ya diski. Unachunguza huku na kule.

Katika chombo, hakuna SSH. Chombo ni cha muda mfupi — kinaweza kuwa kikiendesha kwenye mwenyeji wowote katika nguzo, na ECS itakibadilisha bila onyo ikiwa kitashindwa ukaguzi wa afya. Kufikia wakati unafikiria kuhusu kuingia kwa SSH, chombo ulichotaka kukichunguza kinaweza kisiwepo tena.

Kumbukumbu si urahisi wa utatuzi katika mazingira ya vyombo. Ni ushahidi pekee kwamba kitu kilitokea.

"Na je, ikiwa chombo kitashindwa kimya na hatuna kumbukumbu?" Priya aliuliza wakati wa ukaguzi wa usanifu wa vyombo. "Tungeweza kuwa na kazi inayotoka na msimbo 1 na kamwe tusijue sababu ikiwa kumbukumbu hazikunaswa kabla haijasitishwa."

Hii si ya kudhaniwa. Inatokea kwenye usambazaji wa kwanza wa vyombo, kwa kuendelea.

Mchakato sahihi: sanidi kila chombo kutuma kumbukumbu za muundo kwa **Amazon CloudWatch Logs** ukitumia kiendeshi cha kumbukumbu cha `awslogs`. ECS inashughulikia usafirishaji kiotomatiki — hakuna wakala wa kumbukumbu wa kusanikisha, hakuna chombo cha kando kinachohitajika.

Katika ufafanuzi wa kazi:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Kila mstari ulioandikwa kwa stdout au stderr ndani ya chombo unanaswa na kutumwa kwa kundi la kumbukumbu `/ecs/nimbus-api`, lililopangwa kwa kitambulisho cha kazi. ECS inaunda mkondo mpya wa kumbukumbu kwa kila kazi, kwa hivyo unaweza kupata kumbukumbu za chombo mahususi kilichoshindwa — hata baada ya kubadilishwa.

Jukumu la utekelezaji la kazi linahitaji ruhusa ya kuandika kwa CloudWatch Logs. Bila yake, kiendeshi cha kumbukumbu kinashindwa kimya na matokeo yote ya kumbukumbu yanapotea.

**Kumbukumbu za muundo dhidi ya maandishi tupu**: Kumbukumbu za maandishi tupu ("Order 7741 placed") zinahitaji grep. Kumbukumbu za JSON za muundo (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) zinaweza kuulizwa na CloudWatch Logs Insights ukitumia sintaksia inayofanana na SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Hoja hiyo inaendesha dhidi ya kundi la kumbukumbu moja kwa moja. Hakuna hifadhidata. Hakuna bomba la data. Hakuna kazi ya ETL. Jibu liko hapo ndani ya sekunde.

Hii haibadilishi ziwa la data ya uchambuzi tutakaloijenga katika sura ya 26. Inajibu maswali ya uendeshaji — "maagizo mangapi kutoka mgahawa 47 katika dakika 30 zilizopita?" — katikati ya tukio, wakati huna muda wa kuendesha hoja ya Athena.

**CloudWatch Container Insights**

**Container Insights** ni kipengele cha CloudWatch kinachokusanya na kuunganisha vipimo vya kiwango cha chombo — CPU, kumbukumbu, I/O ya mtandao, I/O ya uhifadhi — kwa kila nguzo, huduma, na kazi ya ECS. Badala ya vipimo vya kiwango cha EC2 (mwenyeji anavyofanya?), unaona vipimo vya kiwango cha kazi (huduma hii mahususi ya ECS inavyofanya?).

Wezesha kwa mpangilio mmoja kwenye nguzo ya ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Baada ya kuwezesha:

- Unaona dashibodi kwa kila huduma: idadi ya kazi, matumizi ya CPU, matumizi ya kumbukumbu
- Unaweza kuweka kengele kwenye CPU ya kiwango cha kazi (badala ya CPU ya mwenyeji wa EC2, ambayo ni ishara butu zaidi)
- Unaweza kuunganisha milipuko ya kumbukumbu na matukio ya kumbukumbu — kumbukumbu ya kazi ilipanda hadi 95% saa 14:22; kumbukumbu zinaonyesha mlipuko wa maombi yanayoingia kutoka kwa uingizaji wa menyu wa mgahawa 47 haswa saa 14:21

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Container Insights inatoza kwa vipimo vya desturi na uhifadhi wa kumbukumbu inazozalisha. Kwa ukubwa wa Nimbus (huduma tatu, kazi 3-6 kila moja), hii ilikuwa takriban $12/mwezi — biashara nzuri kwa uonekanaji wa uendeshaji wa kiwango cha kazi.

Leo aliiwezesha ndani ya siku.

Mara ya kwanza kazi ilishindwa ukaguzi wa afya na ikabadilishwa na ECS, dashibodi ya Container Insights ilinasa tukio kiotomatiki: kitambulisho cha kazi, muda wa kuanza, muda wa kushindwa, msimbo wa kutoka. Mkondo wa kumbukumbu wa CloudWatch wa kazi hiyo ulihifadhi mistari 40 ya mwisho ya matokeo kabla ya kusitishwa — ambayo ilionyesha kasoro isiyoshikwa iliyochochewa na JSON ya menyu isiyo sahihi kutoka kwa mshirika mpya wa mgahawa.

Bila Container Insights na kurekodi kwa muundo: mlipuko wa kushangaza katika viwango vya makosa, uchunguzi unahitaji kuingia kwa SSH kwenye mwenyeji ambaye haendeshi tena kazi iliyoshindwa, dakika 45 za kubahatisha.

Pamoja nazo: kiungo cha mkondo wa kumbukumbu katika dashibodi ya CloudWatch, kasoro haswa, kitambulisho cha mgahawa, sehemu inayokosea — ndani ya dakika tano.

"Hakuna SSH," Leo alisema, akikagua uchunguzi wa baada ya tukio. "Hakuna kutofanya kazi kuchunguza. Kumbukumbu zilifanya kazi."

"Kumbukumbu zinafanya kazi tu," Priya alisema, "ikiwa uliziseti zinaswe."


**Wakati Vyombo ni Chaguo Lisilo Sahihi**

"Subiri — lakini *kwa nini* tusiweke kila kitu kwenye vyombo?" Maya aliuliza. "Ndio kwanza umenisadikisha kwamba vyombo vinatatua matatizo yote ya mgeuko wa usanidi. Kwa nini tusiendeshe kila huduma moja kama chombo?"

Lilikuwa swali lile lile aliloliuliza kuhusu Lambda. Jibu lilikuwa sawa.

Vyombo vinaongeza mahitaji ya uendeshaji: unahitaji usajili wa vyombo (ECR), mzunguko wa CI/CD unaojenga na kusukuma picha, msimamizi (ECS), ufuatiliaji uliosanidiwa kwa uonekanaji wa kiwango cha kazi badala ya kiwango cha kipengele, na timu inayoelewa Docker na utoaji wa toleo wa picha.

Kwa huduma inayofanya kazi vizuri tayari kwenye EC2, thabiti, na isiyoumia na mgeuko wa usanidi, gharama ya kuiweka kwenye vyombo inaweza kuzidi faida.

Kesi mahususi ambapo vyombo ni chaguo lisilo sahihi:

**Huduma za hali ambazo hazikujengwa kwa uhamishikaji wa chombo**: Hifadhidata katika vyombo zinahitaji usimamizi makini wa kiasi cha kudumu. Timu nyingi zinazoendesha hifadhidata katika vyombo hatimaye zinazirudisha kwa huduma zinazosimamiwa (RDS, ElastiCache) baada ya kukumbana na ugumu huu.

**Huduma zenye mahitaji ya vifaa maalum**: Mzigo wa GPU, usanidi mahususi wa kiolesura cha mtandao, au usindikaji unaotegemea FPGA vinahitaji vipengele vya EC2 vyenye vifaa mahususi. Vyombo havibadilishi hili — bado ungetumia aina ya uzinduzi ya EC2, tu na vyombo juu yake, na uondoaji wa chombo unaongeza ugumu bila faida.

**Hati na kazi rahisi sana**: Hati ya Python ya mistari 40 inayoendesha mara moja kwa wiki na haina masuala ya mgeuko wa tegemezi. Kuongeza Docker, ECR, ufafanuzi wa kazi wa ECS, na mzunguko wa CI/CD kwa hili ni kupita kiasi. Lambda ni rahisi zaidi. Kazi rahisi ya cron ya EC2 inaweza kuwa rahisi zaidi bado.

"Kanuni," Leo alisema, "ni ile ile kama daima: linganisha zana na tatizo. Vyombo vinatatua mgeuko wa usanidi na uthabiti wa usambazaji. Ikiwa huna tatizo hilo, huhitaji vyombo."

## AWS Batch: Vyombo kwa Kazi za Kiwango Kikubwa

ECS na EKS zimeundwa kwa huduma za muda mrefu — programu zinazoendesha kwa kuendelea, zinakubali maombi, na zinapanuka na trafiki. Lakini baadhi ya mzigo wa kazi ni tofauti: unaendesha kwa muda uliowekwa, unachakata seti ya data iliyofafanuliwa, kisha unasimama. Kuzalisha ankara za mwisho wa mwezi kwa mamia ya migahawa. Kuendesha kazi ya mafunzo ya ujifunzaji wa mashine. Kuchakata uchambuzi wa usiku unaohamishwa.

Kwa mzigo huu wa kazi, hutaki huduma — unataka kazi.

**AWS Batch** ni huduma inayosimamiwa kikamilifu inayoendesha kazi za kompyuta za kundi kwa kiwango chochote. Unafafanua kazi yako kama chombo cha Docker (muundo ule ule wa chombo ambao ECS hutumia), na Batch inashughulikia iliyobaki: kutoa kompyuta ya EC2 au Fargate, kuratibu kazi katika foleni, kupanua uwezo juu kazi zinapofika na chini hadi sifuri zinapomaliza.

Dhana muhimu:

- **Ufafanuzi wa kazi:** chombo cha Docker, mahitaji ya rasilimali (vCPU, kumbukumbu), na amri ya kuendesha
- **Foleni ya kazi:** mahali kazi zilizowasilishwa zinasubiri kabla ya kuendesha; kila foleni inahusishwa na mazingira moja au zaidi ya kompyuta
- **Mazingira ya kompyuta:** uwezo wa msingi wa EC2 au Fargate. Inaweza kutumia Spot Instances kwa akiba ya gharama hadi 90% — Batch inashughulikia usumbufu na kujaribu tena kiotomatiki

"Subiri — lakini *kwa nini* tungetumia Batch badala ya kuendesha tu kazi ya ECS?" Maya aliuliza.

"Kwa sababu huduma ya ECS daima iko wazi," Leo alisema. "Inasubiri maombi. Kazi ya Batch inaendesha, inamaliza, na Batch inarudisha kompyuta hadi sifuri. Hulipi chochote kati ya utekelezaji."

Tom aliangalia juu kutoka kwa ukurasa wa bei. "Na Spot Instances?"

"Batch inaweza kuendesha kwenye Spot. Ikiwa Spot Instance itarudishwa katikati ya kazi, Batch inajaribu tena kiotomatiki. Kwa kazi ya ankara ya dakika 45, hiyo ni sawa."

**dhidi ya ECS/EKS:** ECS/EKS zinaendesha huduma — daima wazi, zinazoendeshwa na maombi. Batch inaendesha kazi — muda wenye kikomo, unaoendeshwa na data, hupanua hadi sifuri zinapokuwa za usubiri.

**dhidi ya Lambda:** Lambda ina muda kuisha wa dakika 15. Kazi za Batch zinaweza kuendesha kwa masaa au siku.

Muktadha wa Nimbus: kazi ya uzalishaji wa ankara ya usiku inachukua dakika 45 kwa mamia ya washirika wa mgahawa. Lambda inaisha muda kwa dakika 15. Huduma ya ECS iliyowashwa daima inapoteza pesa masaa 23 kwa siku. Batch inaendesha kazi kwenye Spot Instances, inamaliza katika dakika 38, inagharimu $1.20, na inazima.

"Hiyo ni ya bei nafuu zaidi kuliko kahawa niliyonunua nikisubiri hati ya zamani imalize," Leo alisema.

"Na hakuna EC2 ya kusimamia," Priya aliongeza. "Batch inaitoa, inaiendesha, inaisitisha."

## Nguvu na Mipaka

**Vyombo**:

- Zinaondoa kutofautiana kwa mazingira ("inafanya kazi kwenye kompyuta yangu")
- Zinawezesha usambazaji wa haraka, wa kuaminika
- Hazibadiliki — picha ile ile inaendesha kwa njia ile ile kila mahali
- Ufanisi — nyepesi kuliko VMs, kuanzisha haraka zaidi

**ECS**:

- Rahisi zaidi kuliko Kubernetes kwa mzigo unaozingatia AWS
- Muunganiko thabiti wa AWS (IAM, ALB, CloudWatch, Secrets Manager)
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

Lambda ilifanya kompyuta ya usubiri kuwa ya bure. Vyombo vilifanya usambazaji kuwa wa uhakika. Pamoja, vilitatua mawili ya sababu za kawaida zaidi za maumivu ya uendeshaji kwa timu za uhandisi zinazokua.

- **Vyombo** vinafungasha msimbo wa programu, wakati wa utekelezaji, na tegemezi pamoja — vinaendesha kwa njia ile ile kila mahali.
- **Docker** ni teknolojia ya kawaida ya chombo. Picha ni michoro; vyombo ni vipengele vinavyofanya kazi.
- **ECR (Elastic Container Registry)** ni usajili wa Docker unaosimamiwa na AWS — hifadhi, toa toleo, na chunguza picha zako hapa. Wezesha uchunguzi wa picha kushika CVE kabla ya usambazaji.
- **ECS (Elastic Container Service)** inaandaa vyombo. Unabainisha kazi na huduma; ECS inasimamia uwekaji na mzunguko wa maisha.
- **Fargate** ni kompyuta bila seva kwa vyombo — hakuna vipengele vya EC2 vya kusimamia. Mara nyingi ya bei nafuu zaidi kuliko aina ya uzinduzi ya EC2 katika viwango vidogo kutokana na kuondoa gharama ya juu ya EC2. Katika viwango vikubwa na upangaji makini wa bin wa kazi, aina ya uzinduzi ya EC2 inaweza kuwa ya gharama nafuu zaidi.
- **EKS (Elastic Kubernetes Service)** ni Kubernetes inayosimamiwa — kwa timu zinazohitaji vipengele vya Kubernetes au uoanifu.
- **Muunganiko wa Secrets Manager**: ingiza siri katika vyombo wakati wa uzinduzi kupitia ufafanuzi wa kazi — usihifadhi thamani za siri katika vigezo vya mazingira au ufafanuzi wa kazi moja kwa moja.
- **Ugunduzi wa huduma**: IP za vyombo ni za muda mfupi. Tumia majina ya DNS ya ALB au Cloud Map kwa anwani thabiti za huduma.
- Chagua ECS kwa urahisi kwenye AWS; chagua EKS kwa uoanifu wa mfumo ikolojia wa Kubernetes.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Thabiti (Kikoa cha 2, Kazi ya 2.1)*

- **Ishara za ECS dhidi ya EKS**: Hali za mtihani zinazotaja "Kubernetes," "Helm," "ujuzi wa Kubernetes uliopo," au "uandaaji wa vyombo wa wingu nyingi" → EKS. Kila kitu kingine → ECS.
- **Fargate dhidi ya aina ya uzinduzi wa EC2**: "Hutaki kusimamia vipengele vya EC2 kwa vyombo," "vyombo bila seva," "hakuna usimamizi wa miundombinu" → Fargate. "Haja ya aina maalum za vipengele," "mzigo wa GPU," "udhibiti wa kina wa kipengele" → aina ya uzinduzi ya EC2.
- **Jukumu la kazi dhidi ya jukumu la utekelezaji wa kazi** — kibaguzi halisi cha mtihani. **Jukumu la utekelezaji wa kazi** linatumiwa na *wakala* wa ECS kwa niaba ya kazi, kabla na karibu na msimbo wako: kuvuta picha kutoka ECR, kupata siri kutoka Secrets Manager, kuandika kumbukumbu kwa CloudWatch. **Jukumu la kazi** ndio *msimbo wa programu yako ndani ya chombo* unatumia kuita huduma za AWS: kusoma kutoka S3, kuandika kwa DynamoDB — kama majukumu ya kipengele cha EC2, lakini kwa kila kazi, ili kila kazi iweze kuwa na ruhusa tofauti. "Chombo kinahitaji kusoma kutoka S3" → **jukumu la kazi** (limeambatanishwa katika ufafanuzi wa kazi). "Kazi inashindwa kuvuta picha yake / haiwezi kupata siri yake" → **jukumu la utekelezaji** linakosa ruhusa.
- **Fargate Spot**: endesha vyombo vinavyostahimili hitilafu kwenye uwezo wa ziada kwa hadi ~70% chini, ukiwa na onyo la usumbufu la dakika mbili — sawa na EC2 Spot ya Fargate, inayosanidiwa kupitia watoaji wa uwezo. Kichocheo cha mtihani: "endesha vyombo vinavyovumilia usumbufu kwa gharama ya chini zaidi bila kusimamia vipengele" → Fargate Spot.
- **Uchunguzi wa picha za ECR**: ECR inaweza kuchunguza picha za vyombo kwa udhaifu unaojulikana (CVE). Ishara ya mtihani: "chunguza vyombo kwa udhaifu wa usalama" → uchunguzi wa picha za ECR.
- **Usambazaji wa buluu/kijani**: ECS inasaidia usambazaji wa buluu/kijani kupitia muunganiko wa CodeDeploy. Usambazaji bila kutofanya kazi na kurudi nyuma kiotomatiki. Mchakato wa mtihani: "sambaza bila kutofanya kazi na kurudi nyuma kiotomatiki" → ECS + CodeDeploy buluu/kijani.
- **Muunganiko wa Secrets Manager**: Ishara ya mtihani: "ingiza siri katika vyombo bila kuhifadhi thamani katika ufafanuzi wa kazi" → tumia sehemu ya `secrets` katika ufafanuzi wa kazi inayorejea ARN ya Secrets Manager. Jukumu la utekelezaji wa kazi linahitaji ruhusa ya `secretsmanager:GetSecretValue`.
- **Kupanua Kiotomatiki kwa Huduma ya ECS**: Panua idadi ya kazi kulingana na CPU, kumbukumbu, au vipimo maalum vya CloudWatch. Inafanya kazi na ALB kupitisha trafiki kwa idadi sahihi ya kazi zinazofanya kazi.
- **AWS Batch:** Kompyuta ya kundi inayosimamiwa kwa vyombo vya Docker. Foleni ya kazi → mazingira ya kompyuta (EC2 au Fargate, inasaidia Spot). Tumia wakati: muda kuisha wa Lambda ni mfupi sana, huduma ya ECS ni ya kupoteza kwa kazi zenye kikomo. Kichocheo cha mtihani: "usindikaji wa kundi wa kiwango kikubwa" au "kazi inayoendesha kwa masaa" → AWS Batch.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya picha ya Docker na chombo cha Docker. Eleza tofauti kati ya ECS na ECR.

*(Kidokezo: Picha ni kwa chombo kama mapishi ni kwa sahani iliyopikwa. ECR inahifadhi picha; ECS inaziendesha.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Kampuni ina programu ya microservices inayoendeshwa sasa kwenye vipengele vya EC2 vinavyosimamiwa kwa mkono. Timu inakabiliwa na usambazaji usio sawa — vipengele tofauti vya EC2 vina matoleo tofauti ya maktaba, vikisababisha hitilafu ngumu za kuzaliana tena. Wanataka kusanifisha usambazaji huku wakipunguza mzigo wa uendeshaji wa kusimamia seva za msingi. Timu haina ujuzi wa Kubernetes.

Suluhisho gani BORA linakidhi mahitaji haya?

A) Weka programu kwenye vyombo kwa Docker; tumia Amazon ECS na aina ya uzinduzi ya Fargate  
B) Sambaza kwenye EC2 na AWS Systems Manager Patch Manager kuweka vipengele sawa  
C) Weka programu kwenye vyombo kwa Docker; tumia Amazon EKS na vikundi vya nodi vinavyosimamiwa kibinafsi  
D) Tumia AWS Elastic Beanstalk kusimamia usambazaji na usanidi wa kipengele kiotomatiki

**Kidokezo cha 1**: Vyombo vinatatua tatizo la "mazingira yasiyosawa" moja kwa moja. Chaguo gani yanatumia vyombo?

**Kidokezo cha 2**: "Punguza mzigo wa uendeshaji wa kusimamia seva" → Fargate (hakuna usimamizi wa EC2) dhidi ya nodi zinazosimamiwa kibinafsi (bado unasimamia EC2).

**Kidokezo cha 3**: "Hakuna ujuzi wa Kubernetes" → EKS ni ugumu zaidi wa uendeshaji kuliko ECS.

**Jibu**: A

**Maelezo**: Kuweka kwenye vyombo kwa Docker kunahakikisha kila usambazaji unatumia picha ile ile yenye tegemezi sawa — kuondoa mgeuko wa usanidi. ECS yenye Fargate inamaanisha hakuna vipengele vya EC2 vya kusimamia. Timu inazingatia msimbo wa programu na ufafanuzi wa vyombo, si matengenezo ya seva. ECS (si EKS) inafaa kwa timu zisizo na ujuzi wa Kubernetes.

**Kwa nini si B?** Patch Manager inaweka vipengele vya EC2 vikisasishwa lakini haitatatui kutofautiana kwa toleo la maktaba kati ya programu. Tatizo la kimsingi (mazingira tofauti ya msimbo kwenye vipengele tofauti) linabaki.

**Kwa nini si C?** EKS yenye vikundi vya nodi vinavyosimamiwa kibinafsi kunahitaji kusimamia vipengele vya EC2 *na* kujifunza Kubernetes. Hakuna kinachooana na mahitaji.

**Kwa nini si D?** Elastic Beanstalk inasimamia usambazaji wa programu kwenye EC2 lakini haitatatui kutofautiana kwa kimsingi kwa mazingira isipokuwa vyombo vitatumika. Beanstalk haitumii picha za Docker kwa chaguo-msingi (ingawa inaweza kusanidiwa kufanya hivyo).

*SAA-C03 Kikoa: Kubuni Miundo Thabiti — Kazi ya 2.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inagawanya API ya moja kwa moja katika microservices tatu: huduma ya agizo, huduma ya menyu, na huduma ya arifa. Kila huduma ina mahitaji tofauti ya kupanua (huduma ya agizo inapanua na trafiki; huduma ya menyu ni ya kusoma zaidi na thabiti; huduma ya arifa ina milipuko ya ghafla).

Buni usanifu wa ECS kwa huduma hizi tatu. Ungeshughulikia vipi mawasiliano ya huduma-kwa-huduma? Je, ungetumia nguzo moja ya ECS au tatu? Ungesanidi Kupanua Kiotomatiki tofauti vipi kwa kila huduma?

Fikiria: huduma ya menyu ina usomaji mwingi na ingeweza kuhudumia data iliyopitwa na wakati kwa sekunde 60 — je, ungeongeza kashe mbele yake? Huduma ya arifa inapanuka kwa milipuko sana jioni za Ijumaa — je, ungeweka uwezo wa chini wa Fargate kuwa 1 na wa juu kuwa 20? Kinachotokea kwa arifa zinazoendelea wakati wa tukio la kupunguza kupanua?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya usanifu wa microservices kwenye ECS.)*

## Tukio Baada ya Mikopo

Usambazaji wa kwanza wa chombo ulikuwa bila dosari.

Toleo jipya la API: bila kutofanya kazi. ECS iliusambaza, ukaguzi wa afya ulipita, kazi za zamani zilitolewa miunganisho, kazi mpya zilichukua nafasi. Leo alitazama hali ya kazi katika dashibodi kwa kitu kinachokaribia kutokuamini.

"Ilifanya kazi tu," alisema.

"Wiki iliyopita ulisema kitu kile kile kuhusu usambazaji wa SSH wa mkono kabla haujashindwa kwenye kipengele cha tatu," Priya alisema.

"Tayari niliusambaza — oh." Leo alisita. "Niliusambaza bila kuweka lakabu kwa toleo la picha. Niache nirekebishe hilo."

"Hiyo ndiyo lengo," Priya alisema. "Utoaji wa toleo wa picha ndio jinsi unavyofuatilia kinachoendesha."

"Unajuaje toleo lipi liko katika uzalishaji sasa hivi?" Maya aliuliza.

Leo aliibua dashibodi ya ECS. Chini ya kazi inayoendesha, picha ilikuwa imeorodheshwa: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Toleo 1.0.3. Lilijengwa saa 14:22 UTC. Lilisambazwa saa 14:31 UTC.

"Kwenye usanidi wa zamani wa EC2," Leo alisema, "ningelazimika kuingia kwa SSH kwenye kipengele na kuendesha `pip show` kuona toleo la kila tegemezi lilisanikishwa. Na lingeweza kuwa tofauti kwenye vipengele vingine."

"Na sasa?"

"Lakabu kwenye picha inaniambia haswa kinachoendesha. Historia ya uchunguzi wa ECR inaniambia kama ilichunguzwa. Historia ya usambazaji ya ECS inaniambia ilisambazwa lini na toleo la awali lilikuwa nini."

"Hakuna SSH. Hakuna kutofanya kazi. Hakuna 'subiri ianzishe tena.'"

"Picha ndiyo kitu kinachowakilisha usambazaji," Priya alisema. "Mazingira hayabadiliki. Mchakato wa usambazaji ni wa kutangaza. Hivi ndivyo programu inavyopaswa kusafirishwa."

Leo alitazama dashibodi kwa dakika nyingine.

"Nilitumia miaka mitatu kuratibu usambazaji wa EC2," alisema. "Kuratibu hati za SSH. Kuandika vitabu vya maelekezo vya usambazaji."

"Ulikuwa ukitatua tatizo," Priya alisema, "ambalo vyombo vinatatua kwa muundo."

Hakusema chochote baada ya hapo. Lakini asubuhi iliyofuata, alianza kuandika hati juu ya mchakato wa ujenzi wa chombo, ili hakuna mwingine atakayelazimika kutumia miaka mitatu kuugundua.

Hitilafu ya kipengele-cha-tatu, wiki sita za mgeuko usioandikwa, na masuala kama hayo ambayo hawakuwa wameyashika bado — yote yalikuwa na chanzo kimoja cha mzizi. Si mhusika mbaya. Si kushindwa kwa vifaa. Seva tu iliyokuwa imetibiwa kama kitu cha kudumu badala ya kitengo kinachotupwa.

Chombo kilikuwa jibu kwa hilo. Si kwa sababu kilikuwa kipya na cha kuvutia. Kwa sababu kilifanya swali liwe lisilowezekana kuulizwa.

Katika sura inayofuata: chati inayojiendesha — na inayokumbuka mahali ilipokwama.
