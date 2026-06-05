# Sura ya 24: Hifadhidata Inayokua Nawe

Ukaguzi wa gharama wa Tom ulikuwa umegundua kitu kisichotarajiwa katika tabaka la hifadhidata.

Nimbus ilikuwa ikiendeshea RDS PostgreSQL: Multi-AZ, kipengele cha db.r6g.large. $340/mwezi.

"Hiyo inaonekana ghali," Tom alisema. "Lakini sijui ninachokulinganisha nacho."

Leo alipiga vipimo vya utendaji. CPU ya hifadhidata ilikuwa ikipanda hadi 85% wakati wa msongamano wa chakula cha jioni cha Ijumaa. Maswali ya kusomwa yalikuwa yakisubiri. Latency ya swali la P95 ilikuwa imeongezeka mara mbili zaidi ya miezi sita.

"Hifadhidata ndiyo kizuizi," alisema. "Trafiki imekua. Hifadhidata haijapanuka nazo."

"Tunaweza kuibadilisha kipengele kuwa kikubwa zaidi?" Maya aliuliza.

"Ndiyo," Leo alisema. "Hiyo ni kupanua kwa wima. Tunahamia kutoka r6g.large hadi r6g.xlarge. CPU zaidi, kumbukumbu zaidi. Itagharimu zaidi na itatupa muda."

"Lakini haitatatua tatizo la msingi," Priya alisema. "Hatimaye tutafikia kipengele kikubwa zaidi na kuhitaji mbinu tofauti."

"Kuna mbinu mbili," Leo alisema. "Nakala za kusomwa, au Aurora."

"Tofauti ni nini?"

Swali zuri. Mabaki ya sura hii ndiyo jibu.

Fikiria maktaba yenye shughuli nyingi yenye maktabari mmoja anayekagua vitabu na kujibu maswali ya wageni. Maktaba inapopata umaarufu, foleni inaundwa. Marekebisho: ajiri maktabari zaidi — lakini kwa kujibu maswali tu. Ukaguzi bado unaenda kupitia dawati la asili. Hiyo ndiyo nakala ya kusomwa: uwezo wa ziada unaoshughulikia masomo, huku maandishi yote bado yakipita kwa chanzo kimoja cha mamlaka. Aurora inaenda hatua moja zaidi, ikibuni upya mfumo wa rafu ili kila maktabari ashiriki rafu ile ile na daima aone vitabu vile vile, bila ucheleweshaji.

**Nakala za Kusomwa: Kusambaza Trafiki ya Kusomwa**

Programu nyingi za wavuti husoma data mara nyingi zaidi kuliko zinaandika. Mteja akivinjari orodha hufanya maswali mengi ya SELECT. Kuweka agizo hufanya maswali machache ya INSERT/UPDATE. Uwiano ni kawaida wa 10:1 au zaidi.

**Nakala ya kusomwa (read replica)** ni kipengele cha ziada cha RDS kinachopokea nakala ya maandishi yote kutoka kwa msingi na kuyapatia maswali ya SELECT.

Inavyofanya kazi:

1. Maandishi ya programu (INSERT, UPDATE, DELETE) yanaenda kwa hifadhidata ya msingi
2. Msingi unapokezea mabadiliko hayo kwa nakala za kusomwa kwa ucheleweshaji
3. Masomo ya programu (SELECT) yanasambazwa katika nakala za kusomwa
4. Nakala za kusomwa zinashiriki mzigo — kila moja inashughulikia sehemu ya trafiki yote ya kusomwa

Matokeo: hifadhidata ya msingi inashughulikia maandishi tu (na masomo ya hiari baadhi). Nakala za kusomwa zinashughulikia mzigo wa kusomwa. Kwa uwiano wa 10:1 wa kusomwa/kuandika, kuongeza nakala moja ya kusomwa kunagawanya karibu nusu mzigo wote wa msingi.

**Kikwazo muhimu**: Upokezaji ni **wa ucheleweshaji**. Kuna ucheleweshaji wa upokezaji — kawaida millisekunde, lakini inaweza kuwa sekunde chini ya mzigo. Kusomwa kutoka kwa nakala kunaweza kuona data iliyo nyuma kidogo ya msingi. Kwa masomo mengi (kuvinjari orodha, kuona historia ya agizo), hii inakubalika. Kwa "je, agizo langu limefanikiwa?" — soma kutoka kwa msingi.

**Nakala za Kusomwa: Maelezo**

- Unaweza kuwa na hadi nakala 5 za kusomwa kwa kila kipengele cha msingi cha RDS
- Nakala za kusomwa zinaweza kuwa katika kanda moja au kanda tofauti (nakala za toka kanda hadi kanda)
- Nakala za kusomwa zinaweza kuwa na nakala za kusomwa zao (mnyororo)
- Nakala za kusomwa ni sehemu za mwisho tofauti — programu yako lazima ielekeze masomo kwa sehemu ya mwisho ya nakala
- Nakala za kusomwa zinaweza kusaidiwa kuwa hifadhidata za kujitegemea (muhimu kwa DR)

Kwa Nimbus, Leo aliongeza nakala moja ya kusomwa. Alisasisha programu ili:

- Shughuli za kuandika → sehemu ya mwisho ya msingi
- Kuvinjari orodha, historia ya agizo → sehemu ya mwisho ya nakala

CPU kwenye msingi ilianguka kutoka 85% hadi 41% kwenye kilele.

Tom alitazama gharama: nakala ya kusomwa ya aina ile ile ya kipengele inagharimu sawa na msingi. Kutoka $340/mwezi hadi $680/mwezi.

"Tuliongeza mara mbili gharama ili tugawanye karibu mzigo," Tom alisema.

"Ndiyo. Lakini mbadala ulikuwa kuhamia kwa aina kubwa zaidi ya kipengele, ambayo pia ingegharimu zaidi na haingesambaza mzigo wa kusomwa."

Tom alifanya hesabu. Alitikisa kichwa, kwa kusita.

"Aurora ni nini?" aliuliza.

**Amazon Aurora: Kubuni Upya Injini ya Hifadhidata**

Aurora ni injini ya hifadhidata ya umiliki ya AWS, inayooana na MySQL na PostgreSQL. Ilichorwa kutoka mwanzo kwa mzigo wa wingu, ikibuni upya jinsi tabaka la uhifadhi la hifadhidata ya uhusiano inavyofanya kazi.

Katika usanidi wa kawaida wa RDS (MySQL, PostgreSQL), uhifadhi na kompyuta vimeshikamana kwa nguvu. Injini ya hifadhidata inasimamia mafaili ya data. Upokezaji hunakili data kutoka kwa msingi hadi nakala. Nakala lazima itende upya kila shughuli ya kuandika.

Aurora inatenganisha uhifadhi kutoka kwa kompyuta. Inatumia tabaka la uhifadhi lililosambazwa, linalostahimili hitilafu ambalo linapokezea data kiotomatiki katika Availability Zones tatu katika nakala sita. Tabaka la kompyuta (vipengele vya hifadhidata) hukaa juu ya tabaka hili la uhifadhi.

**Kinachobadilika**:

**Nakala za kusomwa**: Nakala za Aurora hazihitaji kupokezea data — tayari zinashiriki tabaka lile lile la uhifadhi. Hii inamaanisha:

- Hadi nakala 15 za kusomwa (dhidi ya 5 kwa RDS ya kawaida)
- Ucheleweshaji wa upokezaji kwa kawaida chini ya millisekunde 100 (dhidi ya sekunde kwa RDS chini ya mzigo)
- Nakala zinaweza kusaidiwa kuwa msingi kwa chini ya sekunde 30 (dhidi ya dakika)

**Kushindwa hama**: Kwa sababu nakala zinashiriki uhifadhi, kushindwa hama ni haraka zaidi — kukuza hakuhusishi uhamishaji wa data, ni kuelekeza maandishi tu.

**Uhifadhi**: Aurora huongeza uhifadhi kiotomatiki kwa vipande vya 10GB, hadi 128TB. Huhitaji kutoa uhifadhi mapema.

**Utendaji**: Aurora inadai mara 5 zaidi ya uendeshaji wa MySQL ya kawaida na mara 3 ya PostgreSQL ya kawaida kwa aina sawa za vipengele.

**Bei za Aurora: Swali la Tom**

"Inagharimu kiasi gani?" Tom aliuliza.

Bei za Aurora ni tofauti na RDS:

**Bei za kipengele**: Sawa na bei za kipengele cha RDS kwa aina.

**Bei za uhifadhi**: $0.10 kwa GB kwa mwezi (unalipa kwa kile kilichohifadhiwa, kilichopanuliwa kiotomatiki).

**Bei za I/O**: Aurora inalipia kwa kila ombi la I/O (kusomwa/kuandika kwa uhifadhi). Hii inaweza kuwa kubwa kwa mzigo unaozingatia kuandika.

"Subiri," Tom alisema. "Tunapalipa I/O tofauti?"

"Aurora Serverless v2 na Aurora I/O-Optimized zinabadilisha mfano huu wa bei," Leo alisema. "Aurora I/O-Optimized hailipii ada ya I/O lakini bei ya juu ya uhifadhi na kipengele. Bora kwa mzigo unaozingatia I/O."

Tom alitazama uwiano. Kwa Nimbus, ambayo ilikuwa ya kusomwa zaidi (maswali mengi ya orodha, maandishi machache), Aurora I/O-Optimized inaweza kuwa ya gharama zaidi. Bei za kawaida za Aurora zinaweza kuwa sahihi.

Hii ni uamuzi halisi wa gharama wanaouamua mhandisi wa mwandamizi: unahitaji kujua mifumo ya I/O ya mzigo wako ili kuchagua ipasavyo.

**Aurora Serverless: Kupanua Bila Kufikiria Kuhusu Vipengele**

**Aurora Serverless v2** ni usanidi ambao hupanua kiotomatiki uwezo wa kompyuta kulingana na mzigo halisi wa hifadhidata. Badala ya kuchagua ukubwa wa kipengele uliowekwa (db.r6g.large), unaweka kiwango cha chini na juu kwa Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Inapanua juu kwa sekunde mzigo unapoongezeka
- Hupunguza hadi karibu-sifuri wakati wa mapumziko
- Gharama: $0.12 kwa ACU-saa (pamoja na uhifadhi na I/O)

Kwa mzigo wenye trafiki inayobadilika — mabadiliko ya Ijumaa ya Nimbus dhidi ya utulivu wa Jumatatu asubuhi — Serverless v2 hupunguza gharama wakati wa nyakati zisizo na msongamano na kushughulikia vilele bila kutoa mapema.

"Kwa hivyo wakati wa mabadiliko ya Ijumaa," Leo alisema, "Aurora hupanua kiotomatiki. Asubuhi ya Jumapili tunapokuwa na trafiki kidogo sana, hupunguza hadi kiwango cha chini."

"Na tunalipa kwa uwezo tunaotumia tu," Tom alisema.

"Sahihi."

Tom alikuwa na sura ya mtu aliyepata hasa alichokuwa akitafuta.

**Aurora Global Database: Masomo ya Multi-Region**

**Aurora Global Database** inaeneza Aurora katika mikoa mingi ya AWS:

- **Mkoa mmoja wa msingi** unashughulikia maandishi yote
- **Hadi mikoa mitano ya sekondari** hutoa masomo kwa kawaida ya ucheleweshaji wa upokezaji wa chini ya sekunde 1
- Mikoa ya sekondari inaweza kusaidiwa kuwa msingi kwa chini ya dakika 1 (kwa hali za DR)

Kwa upanuzi wa kimataifa wa Nimbus, Aurora Global Database ingeruhusu mshirika wa mgahawa huko London kuuliza orodha yake ya ndani kutoka kwa nakala ya EU ya kusomwa, huku maagizo yote (maandishi) bado yakipita kwa msingi wa Marekani.

**RDS dhidi ya Aurora: Lini Kuchagua Kila Moja**

| Kipengele            | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|----------------------|-------------------------------|------------------------------------------------------------|
| Gharama              | Ya chini kwa mzigo mdogo      | Ya juu msingi, lakini hupanua vizuri zaidi                 |
| Uoanifu              | Kamili                        | Inaoana na MySQL/PostgreSQL (na tofauti ndogo)             |
| Nakala za juu zaidi  | 5                             | 15                                                         |
| Ucheleweshaji wa nakala | Inaweza kuwa sekunde       | Kawaida <100ms                                             |
| Uhifadhi             | Utolewa uliowekwa             | Hupanuliwa kiotomatiki hadi 128TB                          |
| Muda wa kushindwa hama | sekunde 60-120             | <sekunde 30                                                |
| Chaguo la Serverless | Ndogo                         | Aurora Serverless v2                                       |
| Bora kwa             | Mzigo thabiti, unaoweza kutabiriwa | Trafiki inayobadilika, kiwango kikubwa cha kusomwa, haja ya kushindwa hama haraka |

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
- Tofauti ndogo za uoanifu wa MySQL/PostgreSQL zinaweza kuhitaji mabadiliko ya nambuli
- Serverless v2 kuanza baridi (kutoka karibu-sifuri) kunaweza kusababisha mabadiliko ya latency

## Muhtasari

- **Nakala za kusomwa** zinasambaza trafiki ya kusomwa kutoka kwa msingi. Upokezaji wa ucheleweshaji — ucheleweshaji mdogo unakubalika kwa masomo mengi.
- **Aurora** inabuni upya tabaka la uhifadhi: lililosambazwa, linaloshirikiwa katika nakala, linalojiongezea kiotomatiki.
- Aurora hutoa: nakala 15 za kusomwa, ucheleweshaji wa nakala wa <100ms, kushindwa hama <30s, uhifadhi wa kujiongezea hadi 128TB.
- **Aurora Serverless v2**: huongeza kiotomatiki uwezo wa kompyuta kulingana na mzigo. Nzuri kwa trafiki inayobadilika.
- **Aurora Global Database**: msingi katika mkoa mmoja, nakala za kusomwa katika mikoa hadi mitano.
- Chagua RDS kwa mzigo mdogo, thabiti, unaoweza kutabiriwa. Chagua Aurora unapohitaji kiwango, kushindwa hama haraka, au kushughulikia trafiki inayobadilika.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.3)*

- **Nakala ya Aurora dhidi ya nakala ya kusomwa ya RDS**: Nakala za Aurora zinashiriki uhifadhi (ucheleweshaji karibu-sifuri, kushindwa hama <30s). Nakala za kusomwa za RDS zinapokezea data (ucheleweshaji unawezekana, dakika kwa kushindwa hama).
- **Aurora Serverless v2**: "pangeza kiotomatiki uwezo wa hifadhidata," "trafiki ya hifadhidata isiyoweza kutabiriwa au ya mabadiliko," "pangeza hadi sifuri" → Aurora Serverless v2.
- **Aurora Global Database**: "hifadhidata ya multi-region," "soma kutoka EU kwa latency ndogo kutoka msingi wa Marekani," "RTO < dakika 1 kwa kushindwa hama kwa mkoa" → Aurora Global Database.
- **Muda wa kushindwa hama**: Aurora < sekunde 30. RDS Multi-AZ sekunde 60-120. Jua zote mbili.
- **Aurora I/O-Optimized**: Gharama ya juu ya uhifadhi na kipengele, hakuna ada ya kwa I/O. Tumia gharama za I/O zinapotawala (zinazoandikwa zaidi). Aurora ya kawaida: gharama ya chini ya uhifadhi, lipa kwa I/O. Tumia kwa zinazosom zaidi.
- **Kurudi nyuma kwa Aurora (Aurora Backtrack)**: Rudisha hifadhidata kwa wakati maalum bila kurejesha kutoka picha ya nakala. Inapatikana kwa Aurora inayooana na MySQL tu. Ishara ya mtihani: "data ilifutwa kwa bahati mbaya, inahitajika kurejesha haraka bila kurejesha nakala kamili."

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya Aurora na nakala za kawaida za kusomwa za RDS. Kwa nini ucheleweshaji wa upokezaji wa Aurora kwa kawaida ni mdogo zaidi?

*(Kidokezo: Tofauti muhimu ni uhifadhi wa pamoja dhidi ya upokezaji wa data. Fikiria kile kila nakala lazima ifanye ombi la kuandika linapofika.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Hifadhidata ya MySQL ya jukwaa la mitandao ya kijamii inakabiliwa na latency ya juu ya kusomwa kutokana na trafiki inayoongezeka. Programu inasomwa zaidi (masomo 95%, maandishi 5%). Timu inahitaji latency ya kusomwa kuwa thabiti, hata wakati wa mabadiliko ya trafiki. Wanahitaji kushindwa hama kiotomatiki na kutofanya kazi kwa kiwango cha chini (lengo la RTO < sekunde 30). Kiwango cha data kinakua bila kutarajiwa.

Suluhisho gani la hifadhidata BORA linakidhi mahitaji haya?

A) RDS MySQL Multi-AZ yenye nakala tano za kusomwa  
B) Aurora MySQL yenye Aurora Replicas na Aurora Serverless v2  
C) RDS MySQL yenye aina kubwa zaidi ya kipengele (kupanua kwa wima)  
D) DynamoDB yenye DynamoDB DAX kwa kashe ya kusomwa

**Kidokezo cha 1**: "RTO < sekunde 30" — huduma gani inafikia hili? Angalia muda wa kushindwa hama kwa kila chaguo.

**Kidokezo cha 2**: "Latency thabiti ya kusomwa wakati wa mabadiliko" — nakala za huduma gani zina ucheleweshaji karibu-sifuri dhidi ya ucheleweshaji wa sekunde unaowezekana?

**Kidokezo cha 3**: "Kiwango cha data kinachokua bila kutarajiwa" — huduma gani hupanua uhifadhi kiotomatiki?

**Jibu**: B

**Maelezo**: Aurora MySQL yenye Aurora Replicas hutoa ucheleweshaji wa upokezaji karibu-sifuri (millisekunde, si sekunde) kwa utendaji thabiti wa kusomwa chini ya mzigo. Aurora Serverless v2 hupanua kompyuta kiotomatiki wakati wa mabadiliko ya trafiki bila kutoa mapema. Uhifadhi wa Aurora hupanua data inavyokua. Kushindwa hama kwa Aurora (kukuza kwa nakala) kukamilika kwa chini ya sekunde 30 — kikidhi mahitaji ya RTO.

**Kwa nini si A?** Kushindwa hama kwa RDS Multi-AZ huchukua sekunde 60-120 — hakikidhi RTO < sekunde 30. Ucheleweshaji wa nakala ya kawaida ya kusomwa ya RDS unaweza kufikia sekunde chini ya mzigo — latency "thabiti" ni ngumu kuhakikisha.

**Kwa nini si C?** Kupanua kwa wima (kipengele kikubwa) huongeza uwezo lakini husambazi mzigo wa kusomwa. Hifadhidata inabaki hatua moja ya kushindwa kwa masomo.

**Kwa nini si D?** DynamoDB ni NoSQL — kuhamia kutoka MySQL hadi DynamoDB kunahitaji kubuni upya mfano wa data na maswali ya programu, ambayo yanazidi mawanda ya kazi hii ya kuboresha utendaji.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inabuni upanuzi wa kimataifa. Wanataka washirika wa mgahawa kwenye Pwani ya Magharibi, Ujerumani, na Australia kuona data yao ya agizo haraka, bila latency ya toka kanda hadi kanda. Hata hivyo, maandishi yote lazima yapite kwa msingi mmoja wa US-East ili kudumisha uthabiti.

Buni muundo wa hifadhidata kwa kutumia Aurora. Ungeunda vipi Global Database? Kinatokea nini ikiwa msingi wa US-East utashuka? Ungehirimu vipi mchakato wa kukuza?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni hifadhidata ya multi-region.)*

## Tukio Baada ya Mikopo

Leo alihamia kwa Aurora yenye Serverless v2.

Mabadiliko ya Ijumaa yalikuja na kwenda. CPU haikuzidi 60%. Latency ya swali ilibaki thabiti. Aurora ilipanua kiotomatiki kushughulikia mzigo, kisha ikarudi chini baada ya msongamano.

"Hii iligharimu kiasi gani ikilinganishwa na Ijumaa iliyopita?" Tom aliuliza Jumatatu asubuhi.

Leo alipiga kiolezo cha malipo. "Ijumaa ilifikia kilele cha $0.89/saa. Asubuhi ya Jumamosi ilikuwa $0.11/saa."

Tom alisema chochote.

"Usanidi wa zamani ulikuwa wa $0.47/saa bila kujali mzigo," Leo aliongeza.

"Kwa hivyo tulipalipa zaidi wakati wa mabadiliko kuliko awali," Tom alisema.

"Ndiyo. Lakini kwa kiasi kidogo zaidi sana wakati wa nje ya msongamano. Gharama ya jumla katika wiki ni ya chini zaidi."

Tom alifanya hesabu. Kisha alitikisa kichwa.

"Kuna somo hapa," alisema. "Swali sahihi si 'je, hii ni bei nafuu?' Ni 'je, hii ni bei nafuu kwa mfumo wetu halisi wa matumizi?'"

"Hiyo," Priya alisema kutoka upande wa chumba, "ni silika ya mhandisi mwandamizi."

Tom alionekana kushtushwa kidogo kuelezwa hivyo.

Katika sura inayofuata: wakati mtandao wako ndiyo kizuizi, na kwa nini barabara kuu ya kibinafsi inaweza kuwa na thamani ya ada ya ushuru.
