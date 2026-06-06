# Sura ya 24: Hifadhidata Inayokua Nawe

Fikiria maktaba iliyoanza na rafu mbili na maktabari mmoja. Hiyo ilitosha, kwa muda. Maktabari alijua mahali kila kitu kilipokuwa. Maombi yalijibiwa haraka. Kisha maktaba ilikua: rafu kumi, ishirini, arobaini. Maktabari yule yule, dawati lile lile, katalogi ile ile ya kadi. Sasa kupata chochote kunahitaji kusubiri. Maktabari si polepole — kuna maktaba zaidi tu kuliko mtu mmoja anaweza kuhudumia kwa kasi ya awali.

Suluhisho si maktabari wa haraka zaidi. Ni aina tofauti ya maktaba.

---

Baada ya kupunguza gharama za S3, Tom aliendelea na ukaguzi wake. Tabaka la hifadhidata lilikuwa aina tofauti ya tatizo — si data ya usubiri katika darasa lisilo sahihi la uhifadhi, bali mfumo unaohangaika kwa bidii chini ya mzigo wa miezi sita ya ukuaji wa trafiki.

---

Nambari hazikuwa za starehe.

Nimbus ilikuwa ikiendesha RDS PostgreSQL: Multi-AZ, kipengele cha db.r6g.large. $340/mwezi.

Leo aliibua dashibodi ya vipimo vya CloudWatch. Nambari zilikuwa na muundo.

**DatabaseConnections**: 198 kati ya kiwango cha juu cha 200 wakati wa kilele cha Ijumaa. Miunganisho miwili kutoka kujaa. Kwa 200, majaribio mapya ya muunganisho yangeshindwa na "too many connections" — hitilafu ambayo ingejitokeza kama HTTP 500 kwa wateja wakiagiza chakula cha jioni.

**CPUUtilization**: kilele cha 89% wakati wa msongamano wa chakula cha jioni cha Ijumaa. Kipengele kilibuniwa kushughulikia milipuko — db.r6g.large ina vCPU 2 na GB 16 za kumbukumbu — lakini CPU ya 89% iliyodumu ilimaanisha hifadhidata ilikuwa kwenye uwezo kabla saa ya kilele haijawasili hata.

**ReadLatency**: 840 millisekunde P95. Miezi sita iliyopita, ilikuwa 180ms. Kuzorota kulikuwa kwa taratibu — 10 hadi 20ms kwa wiki — kusikoonekana hadi kulipokuwa janga. Wiki kabla ya ukaguzi wa Tom, latency ya P99 ilikuwa imevuka sekunde moja kamili. Wateja waliobofya kwenye menyu ya mgahawa walikuwa wakisubiri zaidi ya sekunde ili ukurasa upakie.

**FreeStorageSpace**: 18% ya uhifadhi uliotolewa ulibaki. Kwa viwango vya sasa vya ukuaji, hifadhidata ingeishiwa na uhifadhi uliotolewa katika takriban wiki 11.

"Kila moja ya hizi inaweza kutatuliwa peke yake," Leo alisema, akiangalia dashibodi. "Lakini tuna zote nne kwa wakati mmoja."

Mlipuko wa idadi ya miunganisho ulionyesha matatizo ya kuweka mkusanyiko wa miunganisho katika programu — kazi nyingi za ECS zikifungua miunganisho yao ya hifadhidata. Suala la CPU lilionyesha maswali ghali. Suala la latency na suala la CPU karibu hakika yalikuwa tatizo lile lile: swali la polepole linaloendesha mara nyingi sana.

"Subiri — lakini *kwa nini* tuko kwenye miunganisho 198?" Maya aliuliza. "Tuna kazi tatu za ECS. Tunawezaje kuwa na karibu miunganisho 200 ya hifadhidata?"

Kila kazi ya ECS ilitumia SQLAlchemy yenye ukubwa wa bwawa chaguo-msingi wa miunganisho 5 pamoja na ufurikaji wa 10. Kazi 3 × miunganisho 15 inayowezekana = miunganisho 45 kutoka kwa programu. Iliyobaki 153 ilikuwa kutoka vitendo vya Lambda vya uchambuzi, wafanyakazi wa kazi za nyuma, kazi ya Glue ETL, miunganisho ya ndani ya timu ya maendeleo kupitia mwenyeji wa bastion, na miunganisho kadhaa iliyokuwa imefunguliwa lakini haikufungwa ipasavyo na toleo la zamani la msimbo.

"Tatizo la idadi ya miunganisho," Leo alisema, "kwa kweli ni tatizo la programu linaloonekana kama tatizo la hifadhidata." Aliongeza PgBouncer (kiweka mkusanyiko wa miunganisho) kwenye orodha ya kazi — lakini kizuizi cha haraka kilikuwa swali la polepole.

CPU ya hifadhidata ilikuwa ikiruka hadi 89% wakati wa msongamano wa chakula cha jioni cha Ijumaa. Maswali ya kusomwa yalikuwa yakiingia foleni. Latency ya swali la P95 ilikuwa imeongezeka mara mbili zaidi ya miezi sita.

"Hifadhidata ndiyo kizuizi," alisema. "Trafiki imekua. Hifadhidata haijapanuka nayo."

"Tunaweza tu kuifanya kipengele kuwa kikubwa zaidi?" Maya aliuliza. "Subiri — lakini *kwa nini* tuna hifadhidata moja inayoshughulikia masomo na maandishi yote? Kwa nini hatukuisambaza tangu mwanzo?"

"Ndiyo," Leo alisema. "Hiyo ni kupanua kwa wima. Tunahamia kutoka r6g.large hadi r6g.xlarge. CPU zaidi, kumbukumbu zaidi. Itagharimu zaidi na itatupa muda."

"Lakini haitatatua tatizo la msingi," Priya alisema. "Hatimaye tutafikia kipengele kikubwa zaidi na kuhitaji mbinu tofauti. Na je, tumefikiria nini kinatokea ikiwa andishi litaenda kwa nakala ya kusomwa kwa bahati mbaya? Nakala inalikataa na agizo linashindwa kimya."

"Kuna mbinu mbili," Leo alisema. "Nakala za kusomwa, au Aurora."

"Tofauti ni nini?"

"Fikiria kama maktaba," Leo alisema, akichukua kalamu. "Maktabari mmoja anayekagua vitabu na kujibu maswali ya wageni. Maktaba inapopata umaarufu, foleni inaundwa. Marekebisho: ajiri maktabari zaidi — lakini kwa kujibu maswali tu. Ukaguzi bado unaenda kupitia dawati la asili."

"Hiyo ni nakala ya kusomwa," Priya alisema.

"Hasa. Aurora inaenda hatua moja zaidi — inabuni upya mfumo wa rafu wenyewe ili kila maktabari ashiriki rafu zile zile na daima aone vitabu vile vile, bila ucheleweshaji. Hakuna kusubiri sasisho zitiririke kutoka dawati moja hadi lingine."

**Nakala za Kusomwa: Kusambaza Trafiki ya Kusomwa**

Programu nyingi za wavuti husoma data mara nyingi zaidi kuliko zinavyoandika. Mteja akivinjari menyu hufanya maswali mengi ya SELECT. Kuweka agizo hufanya maswali machache ya INSERT/UPDATE. Uwiano ni kawaida wa 10:1 au zaidi.

**Nakala ya kusomwa (read replica)** ni kipengele cha ziada cha RDS kinachopokea nakala ya maandishi yote kutoka kwa msingi na kuyapatia maswali ya SELECT.

Inavyofanya kazi:

1. Maandishi ya programu (INSERT, UPDATE, DELETE) yanaenda kwa hifadhidata ya msingi
2. Msingi unapokezea mabadiliko hayo kwa nakala za kusomwa kwa ucheleweshaji
3. Masomo ya programu (SELECT) yanasambazwa katika nakala za kusomwa
4. Nakala za kusomwa zinashiriki mzigo — kila moja inashughulikia sehemu ya trafiki yote ya kusomwa

Matokeo: hifadhidata ya msingi inashughulikia maandishi tu (na kwa hiari baadhi ya masomo). Nakala za kusomwa zinashughulikia mzigo wa kusomwa. Kwa uwiano wa 10:1 wa kusomwa/kuandika, kuongeza nakala moja ya kusomwa kunagawanya karibu nusu mzigo wote wa msingi.

**Kikwazo muhimu**: Upokezaji ni **wa ucheleweshaji**. Kuna ucheleweshaji wa upokezaji — kawaida millisekunde, lakini inaweza kuwa sekunde chini ya mzigo. Kusoma kutoka kwa nakala kunaweza kuona data iliyo nyuma kidogo ya msingi. Kwa masomo mengi (kuvinjari menyu, kuona historia ya agizo), hii inakubalika. Kwa "je, agizo langu limefanikiwa?" — soma kutoka kwa msingi.

**Nakala za Kusomwa: Maelezo**

- Unaweza kuwa na hadi nakala 15 za kusomwa kwa kila kipengele cha msingi cha RDS (MySQL, PostgreSQL, MariaDB)
- Nakala za kusomwa zinaweza kuwa katika kanda moja au kanda tofauti (nakala za toka kanda hadi kanda)
- Nakala za kusomwa zinaweza zenyewe kuwa na nakala za kusomwa (mnyororo)
- Nakala za kusomwa ni sehemu za mwisho tofauti — programu yako lazima ielekeze masomo kwa sehemu ya mwisho ya nakala
- Nakala za kusomwa zinaweza kupandishwa cheo kuwa hifadhidata za kujitegemea (muhimu kwa DR)

Kwa Nimbus, Leo aliongeza nakala moja ya kusomwa. "Itakuwa sawa," alisema Priya alipouliza kama alikuwa amejaribu mantiki ya upitishaji wa kusoma/kuandika ya programu kabla ya kubadilisha trafiki. Hakuwa amefanya. Alitumia dakika arobaini zilizofuata kuthibitisha kwamba maandishi hayakuwa yakienda kwa sehemu ya mwisho ya nakala ya kusomwa.

Alisasisha programu ili:

- Shughuli za kuandika → sehemu ya mwisho ya msingi
- Kuvinjari menyu, historia ya agizo → sehemu ya mwisho ya nakala

CPU kwenye msingi ilianguka kutoka 89% hadi 41% kwenye kilele.

**Tatizo la Uthabiti wa Kusoma-Baada-ya-Kuandika**

Siku tatu baada ya kuwezesha nakala ya kusomwa, tikiti ya msaada ilifika. Mshirika wa mgahawa alikuwa amesasisha menyu yao — ameondoa kipengele kilichositishwa — na kisha akapiga simu kuthibitisha kimeondolewa. Wakala wa huduma kwa wateja aliibua menyu kutoka kiolesura cha Nimbus. Kipengele bado kilikuwepo.

Sekunde ishirini baadaye, kilikuwa kimetoweka.

Ucheleweshaji wa upokezaji wa nje. Andishi (DELETE kipengele cha menyu) lilienda kwa msingi. Usomaji wa wakala wa huduma kwa wateja ulienda kwa nakala, ambayo bado haikuwa imepokea mabadiliko. Nakala ilikuwa sekunde 15 nyuma wakati huo — si jambo lisilo la kawaida, lakini lilionekana.

"Na je, ikiwa mtu atajaribu kuvunja kupitia dirisha la uthabiti wa hatimaye?" Priya aliuliza. "Au tu — vipi ikiwa agizo litawekwa kwa kipengele cha menyu ambacho ndio kwanza kimefutwa? Tungemtoza mteja na mgahawa usingekuwa na kipengele."

Hili lilikuwa wasiwasi halisi wa uthabiti, si kero ya UX tu.

Suluhisho: tambua ni masomo yapi yana mahitaji ya uthabiti na uyaelekeze kwa msingi.

**Masomo yanayoweza kwenda kwa nakala** (uthabiti wa hatimaye ni sawa):
- Mteja akivinjari menyu ya mgahawa (kuwa nyuma kwa sekunde 1-2 hakuonekani)
- Maswali ya historia ya agizo (mtumiaji akiangalia historia yake ya agizo ya dakika moja iliyopita)
- Masomo ya aina ya uchambuzi (migahawa bora wiki hii)

**Masomo yanayolazimika kwenda kwa msingi** (uthabiti wa kusoma-baada-ya-kuandika unahitajika):
- Mara baada ya andishi, wakati programu inahitaji kuthibitisha andishi limefaulu
- Masomo ya hali ya agizo mara baada ya kuwekwa kwa agizo
- Masomo ya menyu yanayochochewa na kiolesura cha usimamizi wa mgahawa (mgahawa ndio kwanza umebadilisha menyu)

Programu iliongeza kidokezo cha upitishaji katika tabaka la muunganisho wa hifadhidata: ikiwa ombi limetoka kwa dashibodi ya usimamizi wa mgahawa, elekeza kwa msingi. Ikiwa limetoka kwa mteja akivinjari, elekeza kwa nakala. Kichwa cha HTTP cha `X-Read-Consistency: strong` kilitumika kama ishara.

"Si ngumu sana," Leo alisema. "Unahitaji tu kujua ni masomo yapi yanaihitaji."

"Na uiandike," Priya alisema. "Ili mtu anayefuata anayeongeza sehemu mpya ya mwisho ajue bwawa lipi la kutumia."

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza. Lilikuwa swali lake la kawaida la kufungua kwa huduma yoyote mpya.

Nakala ya kusomwa ya aina ile ile ya kipengele inagharimu sawa na msingi. Kutoka $340/mwezi hadi $680/mwezi.

"Tuliongeza mara mbili gharama ili tugawanye karibu nusu mzigo," Tom alisema.

"Ndiyo. Lakini mbadala ulikuwa kuhamia kwa aina kubwa zaidi ya kipengele, ambayo pia ingegharimu zaidi na haingesambaza mzigo wa kusomwa."

Tom alifanya hesabu. Alitikisa kichwa, kwa kusita.

"Vipi ikiwa msingi utashindwa?" Maya aliuliza, kabla Tom hajaweza kugeukia Aurora. "Kinachotokea kwa nakala ya kusomwa?"

Leo alieleza kukuza kwa nakala.

**Ikiwa kipengele cha msingi cha RDS kitashindwa**, AWS inashindwa hama kiotomatiki kwenda kwa nakala ya hifadhi katika usanidi wa Multi-AZ (aina tofauti ya nakala — hifadhi ya wakati mmoja, si nakala ya kusomwa). Hifadhi ya Multi-AZ inakuwa msingi mpya. Nakala za kusomwa zinaendelea kuhudumia masomo, sasa zikipokeza kutoka kwa msingi mpya. Kutoka mtazamo wa programu, DNS ya sehemu ya mwisho ya msingi inabadilika kuelekeza kwa hifadhi ya zamani, na programu inaunganishwa upya.

Kushindwa hama kwa kawaida huchukua sekunde 60-120 kwa RDS PostgreSQL. Wakati wa dirisha hilo, maandishi yanashindwa.

**Kukuza kwa nakala ya kusomwa** ni operesheni tofauti — na hali tofauti. Ikiwa unataka kuchukua nakala ya kusomwa na kuifanya kuwa hifadhidata huru, inayoweza kuandikwa (kwa DR, kwa uhamiaji kwa kanda mpya, au kwa sababu msingi umetoweka na unahitaji kukuza badala ya kusubiri kushindwa hama kwa Multi-AZ), unaweza kukuza nakala ya kusomwa kuwa msingi wa kujitegemea. Kukuza huchukua dakika chache, baada ya hapo nakala haipokezi tena kutoka kwa msingi asili — ni hifadhidata yake mwenyewe.

"Je, tumefikiria nini kinatokea ikiwa msingi wa us-west-2 utashuka kabisa?" Priya aliuliza. "Si tu kushindwa hama kwa hifadhi ya Multi-AZ — kanda nzima."

"Ikiwa kanda itashindwa," Leo alisema, "hifadhi ya Multi-AZ pia iko us-west-2. Zote zinashindwa pamoja."

"Kwa hivyo kwa hali halisi ya DR ya kanda," Tom alisema, "tungehitaji nakala ya kusomwa katika us-east-1 ambayo tungeweza kuikuza."

"Ndiyo. Nakala ya kusomwa ya toka kanda hadi kanda. Bado hatuna moja."

"Inagharimu kiasi gani kwa mwezi?" Tom aliuliza. Tayari alijua jibu lingehusisha uamuzi.

Nakala ya kusomwa ya toka kanda hadi kanda ya db.r6g.large katika us-east-1: $340/mwezi (gharama ile ile ya kipengele). Pamoja na uhamishaji wa data ya toka kanda hadi kanda kwa upokezaji: mdogo kwa kiwango cha kuandika cha Nimbus. Jumla: takriban $350/mwezi kwa nakala ya DR.

"Hiyo ni $4,200 kwa mwaka," Tom alisema, "kulinda dhidi ya hali iliyotokea kwa kanda za AWS chini ya mara tano katika miaka kumi."

"Na gharama ya Nimbus kuwa chini kwa masaa 24 wakati wa tukio la kanda ni?" Priya aliuliza.

Tom alikokotoa. Hakujibu kwa sauti. Lakini aliongeza "nakala ya kusomwa ya toka kanda hadi kanda" kwenye orodha ya DR.

"Aurora ni nini?" aliuliza.

**Amazon Aurora: Kubuni Upya Injini ya Hifadhidata**

Aurora ni injini ya hifadhidata ya uhusiano ya umiliki ya AWS, inayooana na MySQL na PostgreSQL. Ilibuniwa tangu mwanzo kwa mzigo wa wingu, ikiwazia upya jinsi tabaka la uhifadhi la hifadhidata ya uhusiano linavyofanya kazi.

Katika usanidi wa kawaida wa RDS (MySQL, PostgreSQL), uhifadhi na kompyuta vimeshikamana kwa nguvu. Injini ya hifadhidata inasimamia mafaili ya data. Upokezaji hunakili data kutoka kwa msingi hadi nakala. Nakala lazima itende upya kila shughuli ya kuandika.

Hii inaunda dari juu ya kasi ya upokezaji: nakala inaweza tu kutumia maandishi kwa kasi inayoweza kuchakata kumbukumbu ya upokezaji. Wakati wa kipindi cha kuandika kingi — uingizaji wa wingi, mauzo ya haraka, sasisho la kundi — nakala inaweza kurudi nyuma. Ucheleweshaji wa upokezaji si dosari katika utekelezaji; ni matokeo ya usanifu.

Priya alikuwa amelionyesha hili mara moja Leo alipopendekeza nakala za kusomwa. "Na je, tumefikiria nini kinatokea ikiwa ucheleweshaji wa upokezaji utaruka hadi sekunde 30 wakati wa msongamano wa Ijumaa? Nakala iko sekunde 30 nyuma. Mteja anaweka agizo, nafasi ya jikoni imehifadhiwa katika msingi, lakini mteja wa pili anayeuliza nakala haoni uhifadhi. Maagizo mawili, nafasi moja."

"Hilo ni tatizo la uthabiti wa orodha," Leo alisema.

"Hilo ni haswa tatizo la uthabiti wa orodha," Priya alithibitisha. "Ndiyo sababu masomo ya orodha — 'je, kipengele hiki bado kinapatikana?' — lazima yaende kwa msingi."

Usanifu wa Aurora unashughulikia ucheleweshaji moja kwa moja.

Aurora inatenganisha uhifadhi kutoka kwa kompyuta. Inatumia tabaka la uhifadhi lililosambazwa, linalostahimili hitilafu ambalo linapokeza data kiotomatiki katika Availability Zones tatu katika nakala sita. Tabaka la kompyuta (vipengele vya hifadhidata) hukaa juu ya tabaka hili la uhifadhi.

**Kinachobadilika**:

**Nakala za kusomwa**: Nakala za Aurora hazihitaji kupokeza data — tayari zinashiriki tabaka lile lile la uhifadhi. Hii inamaanisha:

- Hadi Aurora Replicas 15 zinazoshiriki kiasi cha uhifadhi (RDS ya kawaida pia inaruhusu hadi nakala 15 za kusomwa, lakini kila moja ni nakala kamili ya data)
- Ucheleweshaji wa upokezaji kwa kawaida chini ya millisekunde 100 (dhidi ya sekunde kwa RDS chini ya mzigo)
- Nakala zinaweza kupandishwa cheo kuwa msingi kwa chini ya sekunde 30 (dhidi ya dakika)

**Kushindwa hama**: Kwa sababu nakala zinashiriki uhifadhi, kushindwa hama ni haraka zaidi — kukuza hakuhusishi uhamishaji wa data, ni kuelekeza maandishi tu.

**Uhifadhi**: Aurora huongeza uhifadhi kiotomatiki kwa vipande vya 10GB, hadi 128 TiB (256 TiB katika matoleo ya hivi karibuni ya injini). Huhitaji kutoa uhifadhi mapema kamwe.

**Utendaji**: Aurora inadai mara 5 zaidi ya uendeshaji wa MySQL ya kawaida na mara 3 ya PostgreSQL ya kawaida kwa aina sawa za vipengele.

Unaweza kuwa unajiuliza: ikiwa nakala zote zinashiriki uhifadhi ule ule, je, uhifadhi huo hauwi hatua moja ya kushindwa? Tabaka la uhifadhi la Aurora linapokeza data kiotomatiki katika nakala sita katika Availability Zones tatu. Uhifadhi wenyewe ni imara zaidi kuliko usanidi wowote mmoja wa RDS Multi-AZ — umebuniwa kustahimili upotezaji wa AZ nzima bila upotezaji wa data na bila kushindwa hama kunakohitajika.

Swali la pili la kawaida: ikiwa Aurora inaoana na MySQL/PostgreSQL, je, unaweza kuhamia kutoka RDS PostgreSQL hadi Aurora PostgreSQL bila kubadilisha msimbo wa programu? Karibu. Uoanifu wa Aurora PostgreSQL unamaanisha Aurora inatekeleza itifaki ya waya ya PostgreSQL na inasaidia idadi kubwa ya sintaksia na vipengele vya SQL vya PostgreSQL. Programu nyingi zinahamia bila mabadiliko ya msimbo. Kesi za pembeni: idadi ndogo ya viendelezi vya PostgreSQL havipatikani kwenye Aurora, baadhi ya maswali ya katalogi ya mfumo yanarudisha thamani tofauti, na shughuli fulani za usimamizi zinatofautiana. Kwa uhamiaji wa uzalishaji, jaribu na trafiki ya kusomwa sambamba kabla ya kubadilisha maandishi.

Kwa Nimbus, uhamiaji kutoka RDS PostgreSQL hadi Aurora PostgreSQL ulichukua alasiri moja. Programu ilielekezwa kwa sehemu ya mwisho ya Aurora. Swali la menyu — baada ya Leo kuongeza fahirisi ambayo Performance Insights ilikuwa imeielekeza kama mtumiaji mkuu wa mzigo wa hifadhidata — liliendesha katika 4ms badala ya 620ms. Bwawa la muunganisho halikufikia tena 198 kati ya 200. Latency ya P95 ilishuka hadi 28ms.

"Ni injini tofauti ya hifadhidata," Leo alisema, "ambayo programu inadhani ni injini ile ile ya hifadhidata."

"Na sehemu ya kuvutia?" Maya aliuliza.

"Unakili wa haraka wa hifadhidata."

"Imeandikwa," Sam alisema kimya kutoka upande wa chumba, tayari akiandika. Sam alikuwa mhandisi wa nyuma aliyejiunga na timu wiki chache mapema kuchukua baadhi ya kazi ya hifadhidata kutoka kwa Leo. Hakuna aliyeuliza alichokuwa akifanya.

**Bei za Aurora: Swali la Tom**

Bei za Aurora ni tofauti na RDS:

**Bei za kipengele**: Sawa na bei za kipengele cha RDS kwa aina.

**Bei za uhifadhi**: $0.10 kwa GB kwa mwezi (unalipa kwa kile kilichohifadhiwa, kilichopanuliwa kiotomatiki).

**Bei za I/O**: Aurora inalipisha kwa kila ombi la I/O (kusoma/kuandika kwa uhifadhi). Hii inaweza kuwa kubwa kwa mzigo unaozingatia kuandika.

"Subiri," Tom alisema. "Tunalipa I/O tofauti?"

"Aurora Serverless v2 na Aurora I/O-Optimized zinabadilisha mfano huu wa bei," Leo alisema. "Aurora I/O-Optimized hailipishi ada ya I/O lakini bei ya juu ya uhifadhi na kipengele. Bora kwa mzigo unaozingatia I/O."

Tom alitazama biashara ya mbadala. Kwa Nimbus, ambayo ilikuwa ya kusomwa zaidi (maswali mengi ya menyu, maandishi machache), Aurora I/O-Optimized inaweza kugharimu zaidi. Bei za kawaida za Aurora zinaweza kuwa sahihi.

Kanuni ya manufaa: ikiwa ada zako za I/O zinazidi takriban 25% ya bili yako yote ya Aurora, I/O-Optimized pengine ni ya bei nafuu zaidi. Kwa mzigo wa kusomwa zaidi wa Nimbus, ada za I/O zilikuwa za chini — bei za kawaida zinatumika. Kwa mzigo unaozingatia kuandika kama mfumo wa kurekodi matukio, I/O-Optimized ingeweza kupunguza gharama kwa kiasi kikubwa.

Huu ni uamuzi halisi wa gharama wanaouamua wahandisi wandamizi: unahitaji kujua mifumo ya I/O ya mzigo wako ili kuchagua ipasavyo.

Ikiwa mzigo wako ni mdogo, thabiti, na unaoweza kutabiriwa, RDS PostgreSQL ni rahisi na ya bei nafuu kwa maana — lakini ikiwa trafiki yako haitabiriki, kiwango chako cha data kinakua zaidi ya unachoweza kutoa mapema, au unahitaji kushindwa hama kiotomatiki chini ya sekunde 30, mfano wa uhifadhi wa pamoja wa Aurora unahalalisha gharama ya juu ya msingi.

**Aurora Serverless: Kupanua Bila Kufikiria Kuhusu Vipengele**

**Aurora Serverless v2** ni usanidi unaopanua kiotomatiki uwezo wa kompyuta kulingana na mzigo halisi wa hifadhidata. Badala ya kuchagua ukubwa wa kipengele uliowekwa (db.r6g.large), unaweka kiwango cha chini na cha juu kwa Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Inapanua juu kwa sekunde mzigo unapoongezeka
- Inapunguza wakati wa vipindi vya usubiri — na tangu mwishoni mwa 2024, inaweza kujizima kiotomatiki hadi ACU 0 wakati hakuna miunganisho (kuendelea huchukua ~sekunde 15; kujizima kiotomatiki hakufanyi kazi na RDS Proxy au proksi nyingine zinazoshikilia miunganisho)
- Gharama: $0.12 kwa ACU-saa (pamoja na uhifadhi na I/O)

Kwa mzigo wenye trafiki inayobadilika — milipuko ya Ijumaa ya Nimbus dhidi ya utulivu wa Jumatatu asubuhi — Serverless v2 hupunguza gharama wakati wa vipindi visivyo na msongamano na inashughulikia vilele bila kutoa mapema.

"Kwa hivyo wakati wa mlipuko wa Ijumaa," Leo alisema, "Aurora inapanua kiotomatiki. Asubuhi ya Jumapili tunapokuwa na karibu hakuna trafiki, inapunguza hadi kiwango cha chini."

"Na tunalipa kwa uwezo tunaotumia tu," Tom alisema.

"Sahihi."

Baada ya mwezi mmoja kwenye Aurora Serverless v2, Leo aliibua grafu ya ACU (Aurora Capacity Unit) kwa wiki iliyopita.

Grafu ilionyesha mifumo miwili tofauti. Wakati wa wiki, hifadhidata iliendesha kwa ACU 2-4 — mlio mtulivu wa maswali ya nyuma, ukaguzi wa afya wa ECS, kazi za Glue ETL, na majaribio ya maendeleo. Ijumaa jioni kati ya saa 18:00 na 22:00, idadi ya ACU ilipanda:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

Upanuzi ulikuwa karibu wa papo hapo — Aurora Serverless v2 inapanua kwa vipande vya ACU 0.5, na inaweza kuongeza uwezo kwa sekunde badala ya dakika zinazohitajika kutoa kipengele kipya cha RDS.

"Kilele hicho cha Ijumaa kiligharimu kiasi gani?" Tom aliuliza.

Kwa $0.12 kwa ACU-saa: kilele cha Ijumaa kilikuwa masaa 4 yenye wastani wa ACU 18 → $8.64 kwa kipindi cha kilele. Mabaki ya wiki kwa wastani wa ACU 3 × masaa 164 × $0.12 = $59.04. Jumla kwa wiki: $67.68.

Kipengele kinacholingana kilichotolewa kushughulikia kilele cha Ijumaa (db.r6g.xlarge, vCPU 4, GB 32) kingegharimu $0.937/saa × masaa 168 = **$157.42 kwa wiki** — bila kujali kama kilele cha Ijumaa kilijitokeza kamwe.

"Serverless v2 ni $67 kwa wiki. Kipengele kilichotolewa kilichokadiriwa kwa kilele ni $157," Tom alisema. "Hiyo ni kupunguza kwa 57%."

"Kwenye hifadhidata inayotumia kihalali ACU 26 kwa masaa manne Ijumaa na ACU 2 kwa mabaki ya wiki," Leo alisema. "Ikiwa hifadhidata yako inaendesha kwa mzigo wa juu thabiti wiki nzima, kipengele kilichotolewa ni cha bei nafuu zaidi. Akiba inatoka kwa kubadilika."

Tom alitikisa kichwa polepole. Alikuwa akiongeza hili kwenye muundo katika maelezo yake: kila hadithi ya akiba robo hii ilikuwa na umbo lile lile. Unalipa kwa unachotumia, si kwa unachoweza kuhitaji. Sera za mzunguko wa maisha za S3 zililipa tu kwa darasa la uhifadhi ambalo kila kitu lilistahili. Lambda ililipa tu kwa muda wa uanzishaji. Fargate ililipa tu kwa CPU na kumbukumbu ya kazi. Aurora Serverless v2 ililipa tu kwa ACU ambazo hifadhidata kweli ilizitumia.

Tom alikuwa na sura ya mtu aliyepata haswa alichokuwa akitafuta.

**Kupona Kutoka kwa Uhamiaji Mbaya: Nakala, PITR, na Kitufe cha Kutendua**

Wiki mbili baada ya kuhamia Aurora, Sam aliendesha hati ya uhamiaji wa hifadhidata katika uzalishaji. Hati ilipaswa kuondoa safuwima ya `legacy_menu_format` kutoka jedwali la `menu_items`. Aliiendesha bila kifungu cha WHERE alichofikiri alikuwa amejumuisha.

Matokeo hayakuwa kuondoa safuwima. Yalikuwa kauli ya DELETE iliyofuta safu 40,000 kutoka jedwali la `menu_items` — takriban data ya menyu ya migahawa 200, imekwenda.

Tahadhari iliwaka ndani ya sekunde 30. Kushindwa kwa maagizo kuliruka. Huduma ya menyu ilianza kurudisha matokeo matupu kwa migahawa 200.

"Ilipaswa kuwa na kifungu cha WHERE," Sam alisema, akitazama dashibodi.

Njia ya jadi ya kupona: rejesha kutoka picha ya nakala ya kiotomatiki ya hivi karibuni. Nakala za kiotomatiki zinaendesha mara moja kila masaa 24, na urejeshaji-na-ubadilishaji kamili ungechukua dakika 20-40 — wakati ambapo migahawa *yote* ingekuwa giza, si tu 200 walioathiriwa — na kila agizo lililowekwa tangu nakala lingepotea.

Leo hakufanya hivyo. Kama RDS ya kawaida, Aurora huweka nakala za kuendelea kwa **urejeshaji wa wakati maalum (point-in-time recovery - PITR)** — unaweza kurejesha nguzo hadi sekunde yoyote ndani ya dirisha la uhifadhi wa nakala, si tu hadi picha ya usiku ya mwisho. Na kwa muhimu, urejeshaji unaunda nguzo *mpya*; uzalishaji unabaki juu unaporekebisha.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

Alama ya wakati: 15:42:00Z — dakika nne kabla Sam hajaendesha hati ya uhamiaji. Wakati nguzo ya urejeshaji ikianzishwa, mabaki ya uzalishaji yaliendelea kuhudumia migahawa isiyoathiriwa. Mara ilipopatikana, Leo alitoa safu za `menu_items` za migahawa 200 walioathiriwa kutoka nguzo ya urejeshaji na akaziingiza tena katika uzalishaji. Muda jumla kutoka tahadhari hadi menyu zilizorejeshwa kikamilifu: chini kidogo ya dakika 40 — na kwa sababu alirekebisha safu kwa upasuaji badala ya kubadilisha hifadhidata nzima, hakuna maagizo yaliyowekwa baada ya 15:42 yaliyopotea. Nguzo ya urejeshaji ilifutwa baadaye; ilikuwa imetimiza kusudi lake.

"Tulipoteza nini?" Maya aliuliza.

Maagizo sita yaliyowekwa dhidi ya menyu zilizokuwa tupu kwa muda mfupi yalishindwa wakati wa malipo — yote yalikuwa katika foleni ya SQS na yangeweza kuchezwa tena. Hakuna data ya mteja iliyopotea kwa kudumu.

"Na hapa ndipo **unakili wa haraka wa hifadhidata** unapoingia," Leo alisema, akiikusanya timu baadaye. Aurora inaweza kuunda **nakala** ya nguzo kwa dakika, bila kujali ukubwa wa hifadhidata, ikitumia copy-on-write: nakala inashiriki tabaka la uhifadhi la asili na kurasa mpya au zilizobadilika tu zinatumia nafasi ya ziada. Nakala ya hifadhidata ya sasa ya uzalishaji ni nafuu, ya haraka, na imetengwa kabisa — maandishi kwa nakala kamwe hayagusi uzalishaji.

"Ambayo inamaanisha," Priya alisema, akimtazama Sam, "hati ya uhamiaji inajaribiwa dhidi ya nakala ya data ya uzalishaji kabla ya kuendesha kamwe katika uzalishaji. Hiyo ndiyo sheria mpya."

Sam alitikisa kichwa. Alikuwa tayari ameiandika kwenye karatasi ya kunata.

Zana moja zaidi inahusika katika picha hii. Aurora MySQL — si Aurora PostgreSQL — ina **Aurora Backtrack**: kipengele kinachorudisha nguzo *mahali pake* hadi wakati maalum, bila kurejesha kwa nguzo mpya kabisa. Ikiwa nguzo ya Nimbus ingekuwa Aurora MySQL, Leo angeweza kuirudisha hadi 15:42 chini ya dakika tatu — ingawa kurudisha nguzo nzima pia kungerudisha nyuma maagizo machache halali yaliyoandikwa baada ya ufutaji, ambayo mbinu ya upasuaji ya PITR ilihifadhi.

"Na je, ikiwa mtu atajaribu kuvunja akitumia Backtrack — au urejeshaji wa wakati maalum?" Priya aliuliza. "Je, mshambuliaji anaweza kurudisha kumbukumbu za ukaguzi au data ya uzingatifu?"

Backtrack inahitaji ruhusa ya API ya `rds:BacktrackDBCluster`, na urejeshaji unahitaji `rds:RestoreDBClusterToPointInTime` — vitendo tofauti vya IAM kutoka shughuli za kawaida za hifadhidata. Majukumu ya kawaida ya programu hayana ruhusa hizi. Timu ya uendeshaji tu, yenye sera ya IAM iliyowaruhusu waziwazi, ingeweza kuzitumia. Aliongeza hili kwenye orodha ya ukaguzi ya ruhusa za IAM.

Tahadhari muhimu: Aurora Backtrack inapatikana tu kwa nguzo zinazooana na Aurora MySQL, si PostgreSQL. Dirisha la Backtrack linasanidiwa wakati wa uundaji wa nguzo (saa 1 hadi 72, inalipisha kwa kila saa ya dirisha la backtrack). Na Backtrack inaathiri nguzo nzima — huwezi kufanya Backtrack jedwali moja au seti moja ya safu. Kwa urejeshaji wa kiwango cha safu kwa upasuaji — kwenye injini yoyote — mbinu ya PITR-kwa-nguzo-ya-muda ambayo Leo alitumia ndiyo zana.

**Aurora Global Database: Masomo ya Multi-Region**

**Aurora Global Database** inaeneza Aurora katika mikoa mingi ya AWS:

- **Mkoa mmoja wa msingi** unashughulikia maandishi yote
- **Hadi mikoa mitano ya sekondari** hutoa masomo kwa kawaida ya ucheleweshaji wa upokezaji wa chini ya sekunde 1
- Mikoa ya sekondari inaweza kupandishwa cheo kuwa msingi kwa chini ya dakika 1 (kwa hali za DR)

Kwa upanuzi wa kimataifa wa Nimbus, Aurora Global Database ingeruhusu mshirika wa mgahawa huko London kuuliza menyu yake ya ndani kutoka kwa nakala ya EU ya kusomwa, huku maagizo yote (maandishi) bado yakipita kwa msingi wa Marekani.

**RDS dhidi ya Aurora: Lini Kuchagua Kila Moja**

| Kipengele            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|----------------------|-------------------------------|------------------------------------------------------------|
| Gharama              | Ya chini kwa mzigo mdogo      | Ya juu msingi, lakini hupanua vizuri zaidi                 |
| Uoanifu              | Kamili                        | Inaoana na MySQL/PostgreSQL (na tofauti ndogo)             |
| Nakala za juu zaidi  | 15 (kila moja nakala kamili ya data) | 15 (kiasi cha uhifadhi cha pamoja)                  |
| Ucheleweshaji wa nakala | Inaweza kuwa sekunde       | Kawaida <100ms                                             |
| Uhifadhi             | Utolewa uliowekwa             | Hujipanua hadi 128 TiB (256 TiB katika matoleo ya hivi karibuni) |
| Muda wa kushindwa hama | sekunde 60-120             | <sekunde 30                                                |
| Chaguo la Serverless | Ndogo                         | Aurora Serverless v2                                       |
| Bora kwa             | Mzigo thabiti, unaoweza kutabiriwa | Trafiki inayobadilika, kiwango kikubwa cha kusomwa, haja ya kushindwa hama haraka |

**Zaidi ya Uhusiano: Familia Iliyobuniwa kwa Madhumuni**

Sura ya 9 ilianzisha DocumentDB (hati zinazooana na MongoDB), Neptune (mahusiano ya grafu), na Keyspaces (safuwima-pana zinazooana na Cassandra), na sura ya 10 ilianzisha MemoryDB (hifadhidata ya msingi inayooana na Redis inayodumu). Majina mawili zaidi yanakamilisha familia — huhitaji kina juu yao, ila uwezo wa kutambua umbo gani la data linaelekeza kwa injini gani, kwa sababu yanaonekana mara kwa mara kama chaguo za majibu:

- **Amazon Timestream**: data ya **mfululizo wa muda** — usomaji wa kihisi, vipimo, telemetria. Ishara ya mtihani: "vipimo vya IoT kwa wakati." (Katika ulimwengu halisi toleo la sasa ni Timestream for InfluxDB; ladha asili ya "LiveAnalytics" ilifungwa kwa wateja wapya mwaka 2025.)
- **Amazon QLDB**: bado unaweza kukutana nayo katika maswali ya zamani kama "leja isiyobadilika, inayoweza kuthibitishwa kwa njia ya kificho." AWS iliisitisha QLDB mwaka 2025 (ikipendekeza Aurora PostgreSQL badala yake) — ichukulie kama kichanganyishi cha urithi, si kipengele cha ujenzi.

Kanuni inayostahili kuandikwa kwenye ubao mweupe: **safu za uhusiano → RDS/Aurora; ufunguo-thamani kwa kiwango → DynamoDB; hati → DocumentDB; mahusiano → Neptune; wakati → Timestream; Cassandra → Keyspaces; Redis inayodumu → MemoryDB.** Linganisha umbo, na swali linajijibu lenyewe.

## Nguvu na Mipaka

**Nguvu za Aurora**:

- Kushindwa hama haraka zaidi sana kuliko RDS ya kawaida
- Hadi nakala 15 za kusomwa na ucheleweshaji mdogo
- Kupanua kiotomatiki kwa uhifadhi
- Serverless v2 kwa mzigo unaobadilika
- Global Database kwa usambazaji wa multi-region

**Mipaka ya Aurora**:

- Gharama ya juu kwa mzigo mdogo, thabiti
- Bei za I/O zinaweza kuwa kubwa kwa mzigo unaozingatia kuandika (tumia I/O-Optimized kwa hili)
- Tofauti ndogo za uoanifu wa MySQL/PostgreSQL zinaweza kuhitaji mabadiliko ya msimbo
- Kuendelea kwa Serverless v2 kutoka kujizima kiotomatiki (~sekunde 15) na upanuzi wa haraka kunaweza kusababisha milipuko ya latency

## Muhtasari

Kazi ya mzunguko wa maisha ya S3 katika sura ya 23 ilipunguza gharama kwa kuhamisha data kwa tabaka sahihi la uhifadhi. Aurora inafanya sawa kwa kompyuta: badala ya kutoa kwa kilele cha mzigo na kulipia wakati wote, Serverless v2 inapanua kuendana na mahitaji.

- **Nakala za kusomwa** zinasambaza trafiki ya kusomwa kutoka kwa msingi. Upokezaji wa nje — ucheleweshaji mdogo unakubalika kwa masomo mengi. Elekeza masomo yanayohitaji uthabiti wa kuandika (masomo ya mara baada ya kuandika, masomo ya kiolesura cha usimamizi) kwa msingi, si nakala.
- **Aurora** inabuni upya tabaka la uhifadhi: lililosambazwa, linaloshirikiwa katika nakala, linalojipanua kiotomatiki.
- Aurora hutoa: nakala 15 za kusomwa, ucheleweshaji wa nakala wa <100ms, kushindwa hama <30s, uhifadhi wa kujipanua hadi 128 TiB (256 TiB katika matoleo ya hivi karibuni).
- **Performance Insights**: tambua maswali mahususi ya SQL yanayosababisha mzigo wa hifadhidata kabla ya kuamua jinsi ya kupanua. Fahirisi inayokosekana inaweza kuondoa haja ya kipengele kikubwa zaidi.
- **Vipimo vya hifadhidata vya CloudWatch**: DatabaseConnections (karibu na kujaa kunamaanisha kuweka mkusanyiko wa miunganisho ya programu kumeharibika), CPUUtilization (CPU ya juu iliyodumu inamaanisha maswali ghali), ReadLatency (kuzorota kwa wakati mara nyingi ni jedwali linalokua lenye fahirisi inayokosekana).
- **Aurora Serverless v2**: hupanua kompyuta kiotomatiki kwa vipande vya ACU 0.5. Inalipiwa kwa ACU-saa. Ya bei nafuu sana kuliko vipengele vilivyotolewa kwa mzigo wenye kubadilika kukubwa kati ya kilele na nje ya kilele.
- **Urejeshaji wa wakati maalum (PITR)**: rejesha nguzo ya Aurora hadi sekunde yoyote ndani ya dirisha la uhifadhi wa nakala — kwenye nguzo *mpya*, ili uzalishaji ubaki juu unaponakili kwa upasuaji safu zilizopotea tena.
- **Unakili wa haraka wa hifadhidata**: nakala ya copy-on-write ya nguzo kwa dakika bila kujali ukubwa. Nafuu, imetengwa — itumie kujaribu uhamiaji dhidi ya data ya uzalishaji kabla ya kuendesha katika uzalishaji.
- **Aurora Backtrack** (inayooana na MySQL tu — si PostgreSQL): rudisha nguzo mahali pake hadi wakati maalum bila kurejesha kutoka kwa nakala. Inapatikana kwa madirisha hadi masaa 72. Inahitaji ruhusa ya IAM ya `rds:BacktrackDBCluster` — zuia kwa timu ya uendeshaji.
- **Aurora Global Database**: msingi katika mkoa mmoja, nakala za kusomwa katika mikoa hadi mitano.
- **Kukuza kwa nakala ya kusomwa**: nakala za kusomwa za toka kanda hadi kanda zinaweza kupandishwa cheo kuwa misingi ya kujitegemea kwa DR ya kanda. Linganisha faida ya DR dhidi ya gharama ya kuendesha kipengele cha pili kamili.
- Chagua RDS kwa mzigo mdogo, thabiti, unaoweza kutabiriwa. Chagua Aurora unapohitaji kiwango, kushindwa hama haraka, au kushughulikia trafiki inayobadilika.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.3)*

- **Nakala ya Aurora dhidi ya nakala ya kusomwa ya RDS**: Nakala za Aurora zinashiriki uhifadhi (ucheleweshaji karibu-sifuri, kushindwa hama <30s). Nakala za kusomwa za RDS zinapokeza data (ucheleweshaji unawezekana, dakika kwa kushindwa hama).
- **Aurora Serverless v2**: "panua kiotomatiki uwezo wa hifadhidata," "trafiki ya hifadhidata isiyoweza kutabiriwa au ya ghafla" → Aurora Serverless v2. Tahadhari: kihistoria Serverless **v1** tu ndiyo ilipanua hadi sifuri; kiwango cha chini cha v2 kilikuwa ACU 0.5 hadi mwishoni mwa 2024, wakati v2 ilipata kujizima kiotomatiki hadi ACU 0. Maswali ya zamani ya mtihani yanaweza bado kudhani v2 haiwezi kupanua hadi sifuri.
- **Aurora Global Database**: "hifadhidata ya multi-region," "soma kutoka EU kwa latency ndogo kutoka msingi wa Marekani," "RTO < dakika 1 kwa kushindwa hama kwa kanda" → Aurora Global Database.
- **Muda wa kushindwa hama**: Aurora < sekunde 30. RDS Multi-AZ sekunde 60-120. Jua zote mbili.
- **Hifadhidata zilizobuniwa kwa madhumuni kwa umbo la data**: "grafu ya kijamii / mapendekezo / pete za udanganyifu" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "mfululizo wa muda / telemetria ya IoT" → Timestream. "hifadhidata ya *msingi* inayooana na Redis (inayodumu)" → MemoryDB (dhidi ya ElastiCache = kashe). "Leja isiyobadilika ya kificho" → QLDB katika maswali ya zamani (iliyositishwa 2025).
- **Aurora I/O-Optimized**: Gharama ya juu ya uhifadhi na kipengele, hakuna ada ya kwa I/O. Tumia gharama za I/O zinapotawala (zinazoandikwa zaidi). Aurora ya kawaida: gharama ya chini ya uhifadhi, lipa kwa I/O. Tumia kwa zinazosomwa zaidi.
- **Aurora Backtrack**: Rudisha hifadhidata mahali pake hadi wakati maalum bila kurejesha kutoka picha ya nakala. Inapatikana kwa Aurora inayooana na MySQL tu — kwa Aurora PostgreSQL, jibu ni urejeshaji wa wakati maalum (kwa nguzo mpya) au nakala ya haraka. Ishara ya mtihani: "data ilifutwa kwa bahati mbaya, inahitajika kurejesha haraka bila kurejesha nakala kamili" + MySQL → Backtrack.
- **Unakili wa haraka wa hifadhidata wa Aurora**: nakala ya copy-on-write kwa dakika, bila kujali ukubwa wa hifadhidata. Ishara ya mtihani: "jaribu dhidi ya nakala ya data ya uzalishaji haraka na kwa bei nafuu" → nakala, si urejeshaji-wa-picha.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya Aurora na nakala za kawaida za kusomwa za RDS. Kwa nini ucheleweshaji wa upokezaji wa Aurora kwa kawaida ni mdogo zaidi?

*(Kidokezo: Tofauti muhimu ni uhifadhi wa pamoja dhidi ya upokezaji wa data. Fikiria kile kila nakala lazima ifanye andishi linapofika.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Hifadhidata ya MySQL ya jukwaa la mitandao ya kijamii inakabiliwa na latency ya juu ya kusomwa kutokana na trafiki inayoongezeka. Programu inasomwa zaidi (masomo 95%, maandishi 5%). Timu inahitaji latency ya kusomwa kuwa thabiti, hata wakati wa milipuko ya trafiki. Wanahitaji kushindwa hama kiotomatiki na kutofanya kazi kwa kiwango cha chini (lengo la RTO < sekunde 30). Kiwango cha data kinakua bila kutabirika.

Suluhisho gani la hifadhidata BORA linakidhi mahitaji haya?

A) RDS MySQL Multi-AZ yenye nakala tano za kusomwa  
B) Aurora MySQL yenye Aurora Replicas na Aurora Serverless v2  
C) RDS MySQL yenye aina kubwa zaidi ya kipengele (kupanua kwa wima)  
D) DynamoDB yenye DynamoDB DAX kwa kashe ya kusomwa

**Kidokezo cha 1**: "RTO < sekunde 30" — huduma gani inafikia hili? Angalia muda wa kushindwa hama kwa kila chaguo.

**Kidokezo cha 2**: "Latency thabiti ya kusomwa wakati wa milipuko" — nakala za huduma gani zina ucheleweshaji karibu-sifuri dhidi ya ucheleweshaji wa sekunde unaowezekana?

**Kidokezo cha 3**: "Kiwango cha data kinachokua bila kutabirika" — huduma gani hupanua uhifadhi kiotomatiki?

**Jibu**: B

**Maelezo**: Aurora MySQL yenye Aurora Replicas hutoa ucheleweshaji wa upokezaji karibu-sifuri (millisekunde, si sekunde) kwa utendaji thabiti wa kusomwa chini ya mzigo. Aurora Serverless v2 hupanua kompyuta kiotomatiki wakati wa milipuko ya trafiki bila kutoa kupita kiasi. Uhifadhi wa Aurora hupanua data inavyokua. Kushindwa hama kwa Aurora (kukuza kwa nakala) kunakamilika kwa chini ya sekunde 30 — kikidhi mahitaji ya RTO.

**Kwa nini si A?** Kushindwa hama kwa RDS Multi-AZ huchukua sekunde 60-120 — hakikidhi RTO < sekunde 30. Ucheleweshaji wa nakala ya kawaida ya kusomwa ya RDS unaweza kufikia sekunde chini ya mzigo — latency "thabiti" ni ngumu kuhakikisha.

**Kwa nini si C?** Kupanua kwa wima (kipengele kikubwa) huongeza uwezo lakini hakusambazi mzigo wa kusomwa. Hifadhidata inabaki hatua moja ya kushindwa kwa masomo.

**Kwa nini si D?** DynamoDB ni NoSQL — kuhamia kutoka MySQL hadi DynamoDB kunahitaji kubuni upya mfano wa data na maswali ya programu, ambayo yanazidi mawanda ya kazi hii ya kuboresha utendaji.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inabuni upanuzi wa kimataifa. Wanataka washirika wa mgahawa kwenye Pwani ya Mashariki, Ujerumani, na Australia kuona data yao ya agizo haraka, bila latency ya toka kanda hadi kanda. Hata hivyo, maandishi yote lazima yapite kwa msingi mmoja wa us-west-2 ili kudumisha uthabiti.

Buni muundo wa hifadhidata kwa kutumia Aurora. Ungeunda vipi Global Database — kwa mfano, nguzo za sekondari katika us-east-1, eu-central-1, na ap-southeast-2? Kinachotokea ikiwa msingi wa us-west-2 utashuka? Ungeshughulikia vipi mchakato wa kukuza?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni hifadhidata ya multi-region.)*

## Tukio Baada ya Mikopo

Leo alihamia kwa Aurora yenye Serverless v2.

Mlipuko wa Ijumaa ulikuja na kwenda. CPU haikuzidi 60%. Latency ya swali ilibaki thabiti. Aurora ilipanua kiotomatiki kushughulikia mzigo, kisha ikarudi chini baada ya msongamano.

"Hii iligharimu kiasi gani ikilinganishwa na Ijumaa iliyopita?" Tom aliuliza Jumatatu asubuhi.

Leo aliibua kichunguzi cha bili. "Ijumaa ilifikia wastani wa karibu $2.16/saa kupitia kilele cha jioni. Asubuhi ya Jumamosi ilikuwa $0.24/saa."

Tom hakusema chochote.

"Usanidi wa zamani ulikuwa wa $0.47/saa thabiti bila kujali mzigo," Leo aliongeza.

"Kwa hivyo tulilipa zaidi wakati wa mlipuko kuliko awali," Tom alisema.

"Ndiyo. Lakini kwa kiasi kidogo zaidi sana wakati wa nje ya kilele. Gharama ya jumla katika wiki ni ya chini zaidi."

Tom alikokotoa. Kisha akatikisa kichwa.

"Kuna somo hapa," alisema. "Swali sahihi si 'je, hii ni bei nafuu?' Ni 'je, hii ni bei nafuu kwa mfumo wetu halisi wa matumizi?'"

"Hiyo," Priya alisema kutoka upande wa chumba, "ni silika ya mhandisi mwandamizi."

Tom alionekana kushtushwa kidogo kuelezwa hivyo.

Katika sura inayofuata: wakati mtandao wako ndiyo kizuizi, na kwa nini barabara kuu ya kibinafsi inaweza kuwa na thamani ya ada ya ushuru.
