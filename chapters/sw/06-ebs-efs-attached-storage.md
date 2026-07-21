# Sura ya 6: Diski Inayokufuata Karibu

Tom alikuwa na kalamu nyekundu na tabia iliyomfanya Leo awe na wasiwasi.

Kila asubuhi ya Jumamosi, aliketi na kahawa na akachapisha kitu. Si barua pepe. Si ripoti. Alichapisha orodha ya kile Nimbus ilikuwa ikiendesha na akaisoma kama daftari la hesabu, mstari kwa mstari, kalamu mkononi. Alikuwa akifanya hivi tangu wiki ya pili. Sauti ya printa ikipata joto ilikuwa imekuwa sehemu ya wikendi.

Leo aliiita "kile Tom anachofanya kinachomfanya Leo ahisi kana kwamba amefanya kitu kibaya."

Jumamosi hiyo, Tom alizungushia kitu na akaacha chapisho kwenye dawati la Maya bila neno.

Aliipata Jumatatu asubuhi. Mduara mmoja. Dokezo moja pembeni, maneno matatu:

*Kila kitu. Mashine moja.*

Picha zilikuwa salama katika S3 sasa — tatizo hilo lilikuwa limetatuliwa. Lakini hifadhidata ilikuwa bado kwenye tukio lile lile la EC2 kama seva ya wavuti. Historia ya maagizo, rekodi za wateja, miezi miwili ya miamala. Programu na kila kitu chini yake, zikishiriki diski moja pepe.

"Nini kinatokea kwa hifadhidata ikiwa tukio litaanguka?" Maya aliuliza, chapisho mkononi mwake.

"Inaanguka pia," Leo alisema.

"Na data?"

"Inategemea jinsi hifadhidata inavyoihifadhi."

"Inategemea" hiyo lilikuwa tatizo.

**Jinsi Matukio ya EC2 Yanavyohifadhi Data**

Tukio la EC2 linapoendesha, mfumo wake wa uendeshaji huishi mahali fulani kwenye diski. Diski
hiyo inaitwa **root volume** (sauti ya msingi). Kwa chaguomsingi, hii ni **sauti ya EBS** — hata wakati
hufikiri juu yake.

Lakini kuna kitu kingine: matukio ya EC2 pia yana hifadhi ya **instance store**.

Instance store ni hifadhi ya muda iliyoambatanishwa kimwili na maunzi yaliyo chini yanayoendesha
mashine yako pepe. Ni ya haraka sana — ya haraka kuliko karibu chaguo lingine lolote la hifadhi
katika AWS. Lakini inakuja na kasoro.

Instance store ni ya **muda mfupi** (ephemeral).

Tukio linaposimama au kufutwa, data ya instance store imekwisha. Kabisa.
Haiwezi kurejeshwa. AWS haikuonyi kwa sauti kubwa sana kuhusu hili, ndivyo jinsi timu
huligundua: kwa kupoteza data.

Instance store inafaa kwa akiba, faili za uchakataji za muda, na nafasi ya
kufanyia kazi. Kamwe kwa data unayoijali.

**EBS: Diski ya Kudumu**

Fikiri diski kuu ya nje unayoweza kuiunga kwenye tukio lako la EC2 — moja ambayo
haitoweki unapoiondoa, na unayoweza kuihamishia mashine tofauti
ukihitaji. AWS huiita **EBS**: Elastic Block Store.

EBS ni hifadhi ya kizuizi ya kudumu kwa matukio ya EC2.

Hifadhi ya kizuizi inamaanisha inafanya kama diski kuu halisi: mfumo wako wa uendeshaji unaweza kuunda
mifumo ya faili juu yake, kusoma na kuandika baiti za hovyo katika nafasi za hovyo, kuendesha hifadhidata
juu yake, na kuichukulia haswa kama diski iliyoambatanishwa.

Sifa muhimu:

**Ya kudumu.** Tofauti na instance store, sauti za EBS huokoka kusimama, kuanza kwa matukio, na
hata kufutwa kwa tukio (kulingana na usanidi). Data hubaki kwenye sauti
hata wakati hakuna tukio linaloitumia.

Kuna nuance ya usanidi hapa: unapounda tukio la EC2, sauti ya msingi
ina mpangilio unaoitwa "Delete on Termination." Kwa chaguomsingi, hii imewekwa kuwa kweli — sauti
ya msingi hufutwa wakati tukio linapofutwa. Kwa sauti za data za ziada
unazoambatanisha, chaguomsingi ni uongo — zinadumu baada ya tukio kufutwa.
Unaweza kubadilisha mipangilio yote miwili. Ukitaka sauti ya msingi iokoke kufutwa kwa tukio
(kwa uchanganuzi wa kirekodi au urejeshaji wa data), lemaza "Delete on Termination." Ukitaka
sauti za data zisafishwe kiotomatiki, iwezeshe.

**Inayoweza kuambatanishwa na kutenganishwa.** Sauti ya EBS inaweza kutenganishwa kutoka tukio moja na
kuambatanishwa na lingine. Ukihitaji kuhamisha data au kurejesha kutoka tukio lililoshindwa,
unaweza kutenganisha sauti na kuiambatanisha tena mahali pengine.

Mtiririko wa tenganisha-na-ambatanisha-tena ni wa polepole kuliko urejeshaji wa snapshot lakini huhifadhi
hali kamili ya sauti — maandishi yote yasiyokamilishwa, data yote ya akiba, hali kamili
ya mfumo wa faili. Hii huifanya kuwa muhimu kwa uchanganuzi wa kirekodi (ambatanisha sauti kwa
tukio la uchanganuzi bila kuwasha mfumo asili) na kwa uhamishaji wa data
(hamisha sauti ya hifadhidata kwa tukio kubwa zaidi bila kuchukua snapshot).

**Ambatanisho moja (zaidi).** Kwa chaguomsingi, sauti ya EBS imeambatanishwa na tukio moja haswa
la EC2 kwa wakati mmoja. Tukio moja linaweza kuwa na sauti nyingi za EBS, lakini sauti moja
ya EBS haiwezi kuwekwa na matukio mengi kwa wakati mmoja (kwa istisna moja:
EBS Multi-Attach, ambayo ina matumizi machache na vizuizi muhimu).

EBS Multi-Attach huruhusu sauti za io1/io2 (Provisioned IOPS) kuambatanishwa na matukio mengi kwa wakati mmoja
katika AZ ile ile. Hii inaonekana kama inasuluhisha tatizo la "hifadhi inayoshirikiwa," lakini inakuja
na vikwazo vikubwa: programu kwenye matukio yaliyoambatanishwa lazima ziweze kuratibu ufikiaji
wa wakati mmoja — semantiki za mfumo wa faili unaoshirikiwa (usimamizi wa kufuli, mpangilio wa
uandishi) hazitolewi na EBS. Katika vitendo, EBS Multi-Attach hutumika kwa programu za
hifadhidata za vikundi zinazoshughulikia uratibu zenyewe. Kwa ufikiaji wa jumla wa faili
unaoshirikiwa, EFS ni rahisi na inafaa zaidi.

Mlinganisho wa EBS: diski kuu ya nje iliyounganishwa kwenye laptop moja. Laptop
(tukio la EC2) inaweza kusoma na kuandika juu yake. Ukimaliza, unaweza kuiondoa na
kuiunganisha kwenye laptop tofauti.

**Aina za Sauti za EBS**

Si sauti zote za EBS zinafanana. AWS hutoa aina kadhaa zenye wasifu tofauti wa utendaji
na gharama.

**gp3 (General Purpose SSD)**: Chaguo la chaguomsingi kwa mizigo mingi. Uwiano mzuri wa
utendaji na bei. Inafaa kwa sauti za kuwasha, hifadhidata ndogo, na mazingira ya
maendeleo.

Kabla gp3 haijawa chaguomsingi, kulikuwa na **gp2** — na bado utaikutana porini. Sauti za gp2 hufunga utendaji wao wa IOPS moja kwa moja na ukubwa wa sauti: unapata IOPS 3 kwa kila gigabaiti, hadi kiwango cha juu cha IOPS 16,000 (ambacho kinahitaji sauti ya GB 5,334). Kipimo data kimewekewa kikomo cha MB/s 250. Uunganishaji huu unamaanisha kwamba kwenye gp2, njia pekee ya kupata IOPS zaidi ni kufanya sauti kuwa kubwa zaidi — hata kama huhitaji nafasi ya ziada. gp3 ilivunja utegemezi huo: huanza kwa IOPS 3,000 na MB/s 125 bila kujali ukubwa, na hukuruhusu kusanidi IOPS na kipimo data kwa kujitegemea, kwa gharama ya chini. AWS inapendekeza gp3 kwa sauti mpya, lakini kwa kuwa mizigo mingi iliyopo bado inaendesha kwenye gp2, unahitaji kujua zote mbili.

**io2 (Provisioned IOPS SSD)**: Chaguo la utendaji wa juu kwa mizigo inayotumia I/O sana.
Unaeleza ni operesheni ngapi za I/O kwa sekunde (IOPS) unazohitaji, na AWS huhakikisha
utendaji huo. Inafaa kwa hifadhidata kubwa za uzalishaji.

**st1 (Throughput Optimized HDD)**: Hifadhi ya sumaku iliyoboreshwa kwa usomaji na
uandishi wa mfululizo wa kiasi kikubwa. Gharama ya chini kuliko SSD, lakini polepole kwa I/O ya nasibu. Nzuri kwa
uhifadhi wa data (data warehousing) na uchakataji wa kumbukumbu.

**sc1 (Cold HDD)**: Chaguo nafuu zaidi la EBS. Kwa data inayofikiwa mara chache. Haifai
kwa chochote nyeti kwa muda.

"io2 inagharimu zaidi kiasi gani ikilinganishwa na gp3?" Tom aliuliza, akitazama juu kutoka daftari lake.

Leo alifungua ukurasa wa bei. io2 iligharimu takriban 50–60% zaidi kwa kila GB kuliko gp3, pamoja na malipo tofauti kwa kila IOPS iliyotolewa — na kwenye sauti ya utendaji wa juu, malipo hayo ya kwa-IOPS ndiyo yanayotawala bili. Tom aligundua pengo. "Kwa hivyo tunatumia gp3 hadi hifadhidata itakapohitaji kweli dhamana ya utendaji."

Mtihani hauhitaji ukariri aina zote. Unajaribu uwezo wako wa
kulinganisha mahitaji na aina sahihi: mahitaji ya IOPS → io2. Mizigo ya mfululizo nyeti kwa
gharama → st1. Programu za jumla za wavuti → gp3.

**IOPS dhidi ya Throughput: Kwa Nini Tofauti Inajalisha**

Tom alirudi kwenye swali la sauti ya EBS Jumanne iliyofuata, baada ya kukagua CloudWatch.

"Ninaona vipimo viwili kwenye dashibodi ya EBS," alisema. "IOPS na throughput. Ni vitu tofauti?"

Ndivyo.

**IOPS** (Input/Output Operations Per Second) hupima ni operesheni ngapi za kusoma au kuandika diski inaweza kushughulikia kwa sekunde. Kila operesheni kwa kawaida ni ndogo — KB 4 hadi KB 256. IOPS za juu zinajalisha kwa hifadhidata zinazofanya usomaji na uandishi mwingi mdogo wa nasibu: kupata safu binafsi, kusasisha rekodi, kushughulikia hoja za wakati mmoja.

**Throughput** (inayopimwa kwa MB/s) hupima kiasi gani cha data kinachosogea kwa sekunde. Throughput ya juu inajalisha kwa mizigo ya mfululizo: kusoma faili kubwa za kumbukumbu, uchanganuzi wa utiririshaji, kupakia seti kubwa za data.

Hifadhidata kwa kawaida inahitaji IOPS za juu na throughput ya chini-hadi-wastani. Ghala la data linaloskani jedwali kubwa linahitaji throughput ya juu na linaweza kuishi na IOPS za wastani.

Tom alikuwa akiangalia vipimo vya CloudWatch vya hifadhidata ya Nimbus. IOPS zilikuwa zikipanda wakati wa msongamano wa chakula cha jioni — usomaji mfupi, wa nasibu kadiri programu ilivyopata vitu vya menyu na data ya maagizo. Throughput ilikuwa ya chini. Muundo ulilingana na mzigo wa hifadhidata uliohitaji IOPS bora, si throughput bora.

"Kwa hivyo ikiwa hifadhidata itakuwa polepole," Tom alisema, "tunakagua kama imefungwa-na-IOPS au imefungwa-na-throughput kabla hatujaboresha sauti?"

"Sahihi," Priya alisema. "Kuboresha kutoka gp3 hadi io2 huongeza IOPS kwa gharama. Ikiwa tatizo ni throughput, uboreshaji huo hautasaidia. Kagua kipimo kwanza."

Hii ndiyo haswa jinsi unavyoepuka uboreshaji wa hifadhi wa gharama unaosuluhisha tatizo lisilo sahihi.

**EBS Snapshots: Nakala Rudufu**

Hapa kuna kitu kinachookoa makampuni mara kwa mara.

**EBS snapshot** ni nakala rudufu ya nukta-katika-wakati ya sauti ya EBS, iliyohifadhiwa katika S3 (ingawa
unaifikia kupitia kiolesura cha EBS, si moja kwa moja kupitia S3). Snapshots ni
za nyongeza: snapshot ya kwanza hukamata sauti kamili; snapshots zinazofuata huhifadhi tu
kile kilichobadilika tangu ya mwisho.

Unaweza kuunda sauti mpya ya EBS kutoka snapshot — kurejesha kwa nukta katika wakati kabla
ya uharibifu wa hifadhidata, usambazaji mbaya, au ufutaji wa bahati mbaya.

Unapaswa kuotomatisha snapshots. AWS hutoa **Amazon Data Lifecycle Manager** kwa kusudi
hili: fafanua sera (chukua snapshot kila masaa 6, weka siku 7 za mwisho), na
inaendesha kiotomatiki.

Priya alikuwa na hii imewekwa hata kabla hifadhidata haijaingia uzalishaji.

Leo alikuwa hajaifikiri.

"Je, tumefikiri kuhusu kile kinachotokea ikiwa kazi ya snapshot itashindwa kimya?" Priya aliuliza. "Ikiwa sera itaendesha lakini snapshots si halali kwa kweli?"

Walijaribu mchakato wa urejeshaji mchana ule.

Sera kamili ya nakala rudufu ya snapshot ya Priya kwa hifadhidata ya uzalishaji ya Nimbus, mara alipopata muda wa kuiandika ipasavyo:

- **Snapshots za kila siku**, zilizowekwa kwa siku 7. Hizi zinafunika mazingira ya kawaida ya urejeshaji: usambazaji mbaya, ufutaji wa bahati mbaya, tukio la uharibifu lililogunduliwa ndani ya wiki.
- **Snapshots za kila wiki** (zilizochukuliwa kila Jumapili saa nane usiku), zilizowekwa kwa siku 30. Hizi zinafunika mazingira ambapo tatizo haligunduliki mara moja — uharibifu wa data wa hila unaogundulika tu wiki kadhaa baadaye.
- Nakala ya snapshot ya kuvuka-eneo kwa `us-east-1`, mara moja kwa wiki, iliyowekwa kwa siku 30. Hizi zinafunika mazingira ambapo Region nzima ya `us-west-2` haipatikani na Nimbus inahitaji kujenga upya hifadhidata mahali pengine.

"Hizo zinaonekana kama snapshots nyingi," Leo alisema.

"Kila snapshot ya nyongeza baada ya ya kwanza ni ndogo," Priya alisema. "Unahifadhi tu kile kilichobadilika. Gharama jumla ya hifadhi ni ya wastani."

Tom alikuwa tayari ametafuta bei. Snapshots za kila siku za hifadhidata ya GB 50, zilizowekwa kwa siku 7, pamoja na snapshots za kila wiki zilizowekwa kwa siku 30 — takriban dola 3 hadi 5 kwa mwezi. Gharama ya kutozikuwa nazo, ikiwa hifadhidata ingewahi kuharibika, ilikuwa ya juu zaidi isiyopimika.

"Na Fast Snapshot Restore?" Leo aliuliza. "Niliona chaguo hilo nilipokuwa nikiangalia mipangilio."

**Fast Snapshot Restore** (FSR) ni kipengele cha EBS kinachoondoa adhabu ya utendaji wa I/O ambayo kwa kawaida hutokea unapotumia kwa mara ya kwanza snapshot iliyorejeshwa. Bila FSR, sauti ya EBS iliyorejeshwa upya hufanya vibaya kwa dakika au masaa machache ya kwanza kadiri data inavyopakiwa kwa uvivu kutoka S3 — usomaji hugonga S3 kwa data ambayo bado haijavutwa kwa sauti. Na FSR imewezeshwa kwenye snapshot katika AZ mahususi, sauti iliyorejeshwa iko tayari mara moja kwa utendaji kamili.

FSR inagharimu ziada — unalipa kwa kila snapshot kwa kila AZ kwa kila saa ambayo FSR imewezeshwa. Kwa snapshots za urejeshaji wa maafa za Nimbus, matumizi ya mara kwa mara hayakuhalalisha gharama inayoendelea ya FSR. Kwa snapshot ya hifadhidata ya uzalishaji iliyohitaji kurejeshwa na kuwa ya kiuendeshaji ndani ya dakika katika dharura, FSR ilistahili.

"Wezesha FSR kwenye snapshot ya kila wiki ambayo tungeitumia kweli kwa urejeshaji wa maafa," Priya alisema. "Usiiwezeshe kwenye kila snapshot ya kila siku katika dirisha la uhifadhi."

Tom aliongeza hesabu ya gharama kwenye lahajedwali lake.

**Nakala ya Snapshot ya Kuvuka-Eneo kwa Urejeshaji wa Maafa**

EBS snapshots huishi katika Region ambapo ziliundwa. Ikiwa Region nzima ya `us-west-2` itashuka, snapshots zako katika `us-west-2` haziwezi kufikiwa.

Suluhisho: **nakala ya snapshot ya kuvuka-eneo**. Unaweza kunakili EBS snapshot kwa Region nyingine, kukupa nakala rudufu inayotumika hata kama Region yako ya msingi haipatikani.

AWS Data Lifecycle Manager inaunga mkono nakala ya kuvuka-eneo otomatiki kama sehemu ya sera ya snapshot: chukua snapshot ya kila siku katika `us-west-2`, inakili kiotomatiki kwa `us-east-1` mara moja kwa wiki. Ikiwa maafa yatatokea, zindua tukio jipya la EC2 katika `us-east-1`, rejesha kutoka snapshot ya kuvuka-eneo, sasisha nukta ya mwisho ya DNS, na uendelee kuendesha.

"Huu ni mpango wetu wa urejeshaji wa maafa kwa hifadhidata," Priya alisema, akiwasilisha nyaraka za sera kwa timu. "Si usanifu kamili wa multi-region — huo ni ugumu zaidi kuliko tunavyohitaji sasa hivi. Lakini ikiwa `us-west-2` itashuka kabisa, tunaweza kurejesha katika `us-east-1` ndani ya masaa mawili."

"Masaa mawili ya kupungukiwa na huduma," Tom alisema.

"Dhidi ya kupungukiwa na huduma kusiko na mwisho," Priya alisema.

Tom alikiri tofauti.

**Usimbaji wa EBS: Hadithi ya Kwa Nini Huwezi Kusimba Mahali Pake**

Hifadhidata ya uzalishaji ya Nimbus ilikuwa imeendesha kwa wiki sita wakati Priya alionyesha kitu.

"Sauti ya EBS haijasimbwa," alisema.

"Tunaweza kuisimba?" Leo aliuliza.

"Ndiyo. Lakini si mahali pake."

Hapa kuna jambo kuhusu usimbaji wa EBS: huwezi kusimba sauti iliyopo, isiyosimbwa ya EBS moja kwa moja. Data tayari imeandikwa kwa maandishi ya wazi. Kuisimba, lazima:

1. Unda snapshot ya sauti isiyosimbwa
2. Nakili snapshot, ukiwezesha usimbaji kwenye nakala
3. Unda sauti mpya iliyosimbwa ya EBS kutoka snapshot iliyosimbwa
4. Simamisha tukio
5. Tenganisha sauti ya zamani isiyosimbwa
6. Ambatanisha sauti mpya iliyosimbwa
7. Anzisha tukio na uthibitishe kila kitu kinafanya kazi

Mchakato huu una dirisha la kupungukiwa na huduma — mfuatano wa simamisha, tenganisha, ambatanisha, anzisha. Kwa Nimbus, na hifadhidata ndogo, dirisha lilikuwa karibu dakika kumi na tano. Kwa hifadhidata kubwa ya uzalishaji yenye mamia ya GB, mchakato wa snapshot na nakala unaweza kuchukua muda mrefu zaidi, ingawa kupungukiwa na huduma halisi kwa tukio bado ni mzunguko wa simamisha/anzisha tu.

"Kwa nini hatuwezi tu kupiga swichi?" Leo aliuliza.

"Kwa sababu data iliyopo kwenye diski ni baiti zisizosimbwa," Priya alisema. "AWS haiwezi kuzisimba upya bila kusoma na kuandika upya kila kizuizi — ambacho ndicho haswa mchakato wa nakala ya snapshot hufanya. Husoma kila kizuizi kutoka snapshot ya chanzo, husimba kila kimoja, na kukiandika kwa snapshot mpya."

Leo alipitia mchakato. Sauti mpya iliyosimbwa iliambatanishwa. Tukio lilirudi mtandaoni. Hifadhidata ilikuwa ikiendesha kwenye sauti iliyosimbwa.

"Sauti mpya za EBS zinaweza kuundwa zikiwa zimesimbwa kwa chaguomsingi," Priya alisema. "Kuna mpangilio wa kiwango cha akaunti. Kila sauti mpya inasimbwa kiotomatiki. Tungepaswa kuwezesha hii siku ya kwanza."

Aliiwezesha. Kutoka nukta hiyo mbele, kila sauti ya EBS iliyoundwa katika akaunti ya AWS ya Nimbus ilisimbwa kwa chaguomsingi — bila hatua za ziada zinazohitajika.

**EFS: Kabati la Mafaili Linaloshirikiwa**

EBS ni diski iliyoambatanishwa na tukio moja. Vipi ikiwa matukio mengi yanahitaji kufikia
faili zile zile kwa wakati mmoja?

Unachohitaji ni kitu kama kabati la mafaili katikati ya ofisi — yeyote
anaweza kutembea hadi, kuvuta faili, kuirudisha, na mtu anayefuata anaona mabadiliko mara moja.
Watu wengi, kwa wakati mmoja, wakifikia hifadhi ile ile.

AWS huita hii **EFS**: Elastic File System.

EFS ni mfumo wa faili wa mtandao unaodhibitiwa. Matukio mengi ya EC2 yanaweza kuweka mfumo
ule ule wa faili wa EFS kwa wakati mmoja na kusoma/kuandika kwa faili zinazoshirikiwa. Hii ni uwezo muhimu
ambao EBS haitoi.

Kuweka wazi:

EBS ni diski kuu ya nje iliyounganishwa kwenye laptop moja. Laptop hiyo pekee inaweza kuitumia kwa
wakati mmoja.

EFS ni kabati la mafaili katikati ya ofisi. Mwanachama yeyote wa timu anaweza kutembea hadi, kufungua
droo, kusoma faili, kurudisha kitu.

**Lini unahitaji EFS?**

- Wakati matukio mengi ya EC2 yanahitaji kushiriki faili — mifumo ya usimamizi wa maudhui, faili za
  usanidi zinazoshirikiwa, maktaba za vyombo vya habari zinazoshirikiwa
- Wakati una programu iliyopanuliwa kiusawa ambapo matukio yote yanahitaji ufikiaji wa
  data ile ile
- Wakati unahitaji mfumo wa faili wa kudumu unaookoka kushindwa kwa matukio

EFS hufikiwa kupitia mtandao kwa kutumia itifaki ya NFS (haswa NFSv4). Tukio lolote la EC2
lenye muunganisho wa mtandao kwa lengo la kuweka la EFS linaweza kuiweka — ikiwa ni pamoja na
matukio katika AZ tofauti ndani ya Region ile ile. Unasanidi malengo ya kuweka katika kila
AZ, na matukio huunganisha kwa lengo la kuweka lililo karibu zaidi kwa utendaji bora.

Maana ya kivitendo: EFS hufanya kazi katika AZ moja kwa moja. Ikiwa una seva za wavuti
katika `us-west-2a` na `us-west-2b` zote zikiweka mfumo ule ule wa faili wa EFS, faili iliyoandikwa
na seva katika `2a` inaonekana mara moja kwa seva katika `2b`. Hii ni tabia ya mfumo wa faili
unaoshirikiwa ambayo EBS haiwezi kutoa.

**EFS Performance Modes**

EFS ina modi mbili za throughput zinazojalisha kwa kupima ukubwa:

**Elastic Throughput** (chaguomsingi kwa mifumo mingi mipya ya faili): EFS hupanua kiotomatiki throughput juu na chini kulingana na matumizi halisi. Hutoi kiwango cha throughput. Unalipia kile unachotumia. Hii ndiyo modi sahihi kwa mizigo inayobadilika ambapo mahitaji ya throughput hubadilikabadilika — kama Nimbus, ambapo trafiki ya asubuhi ya Jumatatu ni tofauti na ya jioni ya Ijumaa.

**Provisioned Throughput**: Unaeleza kiwango cha throughput bila kujali data iliyohifadhiwa. Muhimu wakati mzigo wako unahitaji throughput ya juu thabiti inayozidi kile ambacho kiasi cha data kilichohifadhiwa kingetoa katika modi ya Elastic. Ikiwa unaendesha mfumo wa kujenga unaosoma makumi ya gigabaiti kwa dakika bila kujali kiasi kilichohifadhiwa, Provisioned Throughput inafaa.

Pia kuna modi ya tatu, **Bursting Throughput**, ambayo ni tabia asili ya EFS na bado ni chaguomsingi kwa mifumo ya faili iliyoundwa kabla Elastic haijapatikana. Katika modi ya Bursting, throughput hupanuka na kiasi cha data unachohifadhi: unapata msingi wa KB/s 50 kwa GB, pamoja na mikopo ya mlipuko inayokusanyika unapokuwa chini ya msingi na inayoweza kutumika unapohitaji throughput ya juu zaidi (hadi MB/s 100 kwa mifumo midogo ya faili, au hadi maradufu ya msingi kwa mikubwa zaidi). Ni chaguo sahihi kwa mizigo yenye mifumo ya ufikiaji isiyotabirika au yenye vilele ambapo mfumo wa faili ni mkubwa wa kutosha kupata mikopo ya mlipuko yenye maana. Ikiwa mfumo wako wa faili ni mdogo na muundo wako wa ufikiaji una vilele, unaweza kuchoma mikopo yako kwa haraka — angalia kipimo cha CloudWatch cha `BurstCreditBalance` kujua uko wapi.

Swali la Tom lilikuwa la papo hapo: "Je, Elastic ni ghali zaidi?"

"Inategemea muundo wa matumizi," Leo alisema. "Na Elastic, unalipia throughput unayotumia kwa kweli. Na Provisioned, unalipia throughput uliyoeleza hata kama hauitumii."

"Kwa hivyo kwa mizigo inayobadilika, Elastic kwa kawaida ni nafuu," Tom alisema.

"Kwa kawaida," Priya alisema. "Kagua mifumo yako halisi ya throughput katika CloudWatch kabla ya kuamua."

EFS pia ina modi mbili za utendaji: **General Purpose** (latensi ya chini, inafaa kwa mizigo mingi, chaguomsingi) na **Max I/O** (throughput ya juu kwa mizigo iliyolinganishwa sana kwa gharama ya latensi ya juu kidogo). General Purpose hushughulikia idadi kubwa ya matumizi. Max I/O ilibuniwa kwa programu zinazohitaji kufanya maelfu ya operesheni za mfumo wa faili kwa wakati mmoja — mabomba ya uchakataji wa vyombo vya habari ya kiwango kikubwa, mtiririko wa kazi wa kompyuta ya kisayansi yenye wasomaji wengi sambamba.

**EFS dhidi ya S3:** EFS ni mfumo wa faili (folda, faili, ruhusa, kufuli). S3 ni
hifadhi ya vitu (pakia, pakua, hakuna semantiki za mfumo wa faili). EFS ni ghali zaidi
kuliko S3 — takriban dola 0.30 kwa GB kwa mwezi kwa EFS Standard dhidi ya dola 0.023 kwa GB kwa mwezi
kwa S3 Standard. Tumia S3 kwa faili zinazohifadhiwa na kupatikana nzima. Tumia EFS kwa faili
ambazo programu husoma na kuandika kikamilifu kupitia operesheni za kawaida za mfumo wa faili.

**Ikiwa EBS Basi Tukio Moja, Lakini Ikiwa EFS Basi Mengi**

Uamuzi wa EBS/EFS unashuka kwa swali moja: ni matukio mangapi yanahitaji kufikia hifadhi hii kwa wakati mmoja?

Ukijenga programu iliyopanuliwa kiusawa kwenye EBS, basi kila tukio lina diski yake mwenyewe — lakini mtumiaji anapopakia faili kwa tukio A, tukio B haliwezi kuiona. Hilo ni sawa kwa hifadhidata (kila DB ina diski yake), lakini lina kasoro kwa maudhui yanayoshirikiwa. Ukihitaji ufikiaji unaoshirikiwa, EFS ni jibu — lakini EFS inagharimu zaidi kwa GB kuliko S3, na ina latensi ya juu zaidi kuliko EBS kwa I/O ya nasibu. Chaguo sahihi linategemea kabisa programu yako inafanya nini na data.

**Kuchagua Hifadhi Sahihi**

Kufikia sasa umeona aina tatu za hifadhi katika AWS. Hebu tufanye uamuzi kuwa wazi.

| Hitaji                                  | Aina ya Hifadhi  |
|-----------------------------------------|------------------|
| Hifadhidata inahitaji diski ya kudumu, ya haraka | EBS (gp3 au io2) |
| Seva nyingi zinahitaji faili zinazoshirikiwa   | EFS              |
| Faili, nakala rudufu, picha, vitu vikubwa | S3               |
| Nafasi ya muda ya kufanyia kompyuta      | Instance Store   |
| Kumbukumbu za muda mrefu kwa gharama ya chini | S3 Glacier   |

Pengine unajiuliza: ikiwa EFS huruhusu matukio mengi kushiriki faili, kwa nini usiitumie kwa kila kitu? Kwa sababu EFS inagharimu zaidi kwa kiasi kikubwa kwa GB kuliko S3, na ina latensi ya juu kuliko EBS ya kienyeji kwa I/O ya nasibu. Ni zana sahihi kwa ufikiaji wa mfumo wa faili unaoshirikiwa — si kwa hifadhi ya jumla ya faili au hifadhi ya hifadhidata.

Kupata uamuzi huu sahihi ni muhimu. Kutumia S3 ambapo unahitaji EFS huongeza ugumu wa
uendeshaji. Kutumia EBS ambapo unahitaji EFS husababisha kushindwa unapopanua. Kutumia
instance store ambapo unahitaji udumu hupoteza data.

Priya alichapisha jedwali hili na akalibandika ukutani.

"Kila wakati tunapoongeza hitaji la hifadhi," alisema, "tunaanza hapa."

Hebu tupitie mazingira machache halisi kufanya uamuzi kuwa thabiti:

**Mazingira A**: Kazi ya mafunzo ya kujifunza kwa mashine inaendesha kwenye tukio la GPU la EC2 na inahitaji
kusoma seti ya data ya GB 200. Kazi inaendesha mara moja kwa siku na huchukua masaa mawili. Seti ya data
inashirikiwa na timu nyingi za utafiti.

Uamuzi: S3. Seti ya data ni kubwa, kusoma-mara-moja-kwa-kazi, na inashirikiwa. S3 ni nafuu, ya kudumu,
na inafikika kutoka tukio lolote la EC2 au akaunti ya timu yoyote. Tukio la GPU husoma
kupitia API ya S3. Hakuna haja ya mfumo wa faili hapa.

**Mazingira B**: Tovuti ya WordPress inaendesha kwenye matukio manne ya EC2 nyuma ya kisawazisha mzigo.
WordPress huhifadhi faili za plugin, faili za mandhari, na upakiaji wa watumiaji katika saraka kwenye
seva. Matukio yote manne yanahitaji kusoma na kuandika faili zile zile.

Uamuzi: EFS. WordPress hutumia semantiki za mfumo wa faili — huunda saraka, huandika
faili, husoma faili kwa njia. S3 ingehitaji kuandika upya mfumo ikolojia wa plugin wa WordPress.
EFS huwekwa kama mfumo wa kawaida wa faili wa NFS, ambao WordPress hufanya kazi nao kiasili.

**Mazingira C**: Hifadhidata ya PostgreSQL inaendesha kwenye tukio la EC2. Inahitaji I/O ya haraka ya nasibu
kwa utekelezaji wa hoja na utafutaji wa index.

Uamuzi: EBS (gp3 au io2). Hifadhidata zinahitaji hifadhi ya kizuizi yenye latensi ya chini kwa usomaji na
uandishi mdogo, wa nasibu. S3 ni polepole mno na haiungi mkono semantiki za mfumo wa faili.
EFS ina latensi ya juu kuliko EBS kwa I/O ya nasibu.

Muundo: chaguomsingi kwa faili ni S3. Ongeza EBS unapohitaji hifadhi ya kizuizi kwa
tukio mahususi. Ongeza EFS wakati matukio mengi yanahitaji kushiriki mfumo wa faili.
Instance store kwa nafasi ya muda ya kufanyia kazi pekee.

## Wakati EFS Haitoshi: Amazon FSx

Somo lifuatalo la hifadhi halikufika kama kukatika au mjadala wa ubao mweupe. Lilifika kama mkataba wa mauzo — aina ambayo Maya alikuwa akiifuata tangu portali ilipozinduliwa, aina iliyochukua robo nzima ya maonyesho na simu za kufuatilia kuhitimisha. Miezi mitatu baada ya portali ya mwendeshaji wa mgahawa kuzinduliwa, Nimbus ilitia saini mteja wake wa kwanza wa maeneo mengi: Copper Kettle, kikundi cha familia cha maeneo kumi na mawili kuvuka katikati ya magharibi. Maya alikuwa ameendesha mkataba. Tom alikuwa amejenga modeli ya kifedha. Leo alikuwa ameanza kupanga ujumuishaji wa kiufundi kabla wino haujakauka.

Kisha akasoma maelezo ya miundombinu kutoka timu ya IT ya Copper Kettle.

"Seva zao za faili ni Windows," alisema. "Kila kitu ni Windows. Programu yao ya usimamizi wa jiko, mfumo wao wa HR, zana yao ya ratiba — yote yanaandika kwa diski zinazoshirikiwa kwenye seva za faili za Windows. Itifaki ya SMB. Uthibitishaji wa Active Directory."

"Tunaweza kuwainua kwenda EFS?" Maya aliuliza.

Leo alitikisa kichwa. "EFS hutumia NFS. Programu zao huzungumza SMB. Hizo ni itifaki tofauti. Programu ya Copper Kettle haijui NFS ni nini. Huwezi tu kuielekeza kwenye uwekaji wa EFS."

"Kwa hivyo hatuwezi kutumia EFS."

"Si kwa hili. Kuna huduma tofauti."

**FSx for Windows File Server: EFS, Lakini kwa Windows**

**Amazon FSx for Windows File Server** ni mfumo wa faili unaoshirikiwa, wa asili wa Windows, unaodhibitiwa kikamilifu. Unaunga mkono itifaki ya SMB (Server Message Block) — itifaki ile ile ambayo seva za Windows, programu za Windows, na hisa za faili za Windows za kwenye majengo zimetumia kwa miongo. Unajumuika na Active Directory, unaunga mkono Windows ACLs (ruhusa za kiwango cha faili), na unaunga mkono vipengele mahususi vya Windows ambavyo programu za Windows hutegemea kwa kweli.

Ifikirie kama EFS, lakini kwa Windows — na vipengele vyote mahususi vya Windows ambavyo mazingira yako ya Active Directory tayari yanayatarajia. Programu ya usimamizi wa jiko ya Copper Kettle ingeunganisha nayo haswa kama ilivyokuwa imeunganisha na seva za faili za kwenye majengo. Programu haibadiliki. Itifaki haibadiliki. Data inaishi tu kwenye huduma inayodhibitiwa ya AWS badala ya seva katika basement mahali fulani Chicago.

Kwa uhamaji wa Copper Kettle: Leo alitoa mfumo wa faili wa FSx for Windows File Server, akauunganisha na Active Directory ya Copper Kettle (iliyopanuliwa kwa AWS kupitia AWS Managed Microsoft AD), na akaramani herufi za diski zilizopo. Programu ya jiko ilipata hisa zake za faili haswa pale ilipotarajia.

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

Leo alikuwa tayari ameangalia. FSx for Windows imewekewa bei kwa kila GB ya hifadhi kwa mwezi — ghali zaidi kuliko EFS, kwa kiasi kikubwa zaidi ya S3, lakini nafuu zaidi kuliko kudumisha seva za faili za Windows kuvuka maeneo kumi na mawili. Tom aliandika nambari bila pingamizi.

**FSx for Lustre: Wakati Kazi Yako ya ML Inahitaji Kulisha Mamia ya GPU**

Wakati huo huo, Leo alikuwa ameanza kuunda mfano wa injini ya mapendekezo kando — kutabiri ni vyakula vipi mteja angeweza kuagiza kulingana na tabia ya zamani na kile wateja wanaofanana waliagiza. Data ya mafunzo ilikuwa bado ndogo, lakini jaribio lilimpeleka kwenye shimo la sungura la jinsi timu makini za ML hulisha modeli zao: kazi za mafunzo zinazosoma mamia ya gigabaiti kutoka S3 kwa kila uendeshaji.

"Muundo unaoendelea kujitokeza katika mafunzo ya kifani," aliripoti kwenye chakula cha mchana cha timu kilichofuata, "ni kazi za mafunzo zilizofungwa na I/O. GPU za gharama zikikaa bila kazi asilimia 40 ya wakati, zikisubiri kundi lifuatalo la data."

Hili ni tatizo tofauti na hifadhi ya faili inayoshirikiwa. Ni tatizo la kompyuta ya utendaji wa juu (HPC): unapokuwa na mamia ya vitengo vya uchakataji ambavyo vyote vinahitaji kusoma data kwa wakati mmoja, kwa throughput ya juu sana, kutoka seti ile ile ya data.

**Amazon FSx for Lustre** ni utekelezaji unaodhibitiwa kikamilifu wa mfumo wa faili sambamba wa Lustre. Lustre umejengwa kwa kusudi haswa kwa mazingira haya — usomaji sambamba kwa throughput ya juu sana, kuvuka wateja wengi wa wakati mmoja. Unajumuika kiasili na S3: unaelekeza FSx for Lustre kwenye ndoo ya S3, na unafanya data hiyo ipatikane kiotomatiki kupitia mfumo wa faili wa Lustre. Kazi ya mafunzo husoma kutoka nukta ya uwekaji ya kienyeji; FSx hutiririsha data kutoka S3 nyuma ya pazia.

Wakati kazi yako ya mafunzo ya ML inahitaji kulisha data kwa mamia ya GPU kwa wakati mmoja, FSx for Lustre ni zana. Vivyo hivyo kwa uigaji wa kifedha, mizigo ya jenomiki, na utoaji wa video — mzigo wowote ambapo kizuizi ni throughput sambamba ya I/O badala ya uwezo wa hifadhi.

Kifani ambacho Leo alikuwa amekiweka alama kilieleza hadithi kwa nambari mbili: baada ya kuhamisha kazi ya mafunzo kwenda FSx for Lustre, matumizi ya GPU yalipanda kutoka asilimia 60 hadi 94, na uendeshaji wa mafunzo ambao ulikuwa umechukua masaa sita ulikamilika kwa masaa matatu na nusu. Nimbus isingehitaji nguvu ya aina hiyo kwa muda mrefu — lakini Leo aliweka muundo akiba kwa siku ambayo injini ya mapendekezo ingekua.

**Chaguzi Zingine za FSx**

AWS pia hutoa **FSx for NetApp ONTAP** — kwa biashara ambazo tayari zinaendesha hifadhi ya NetApp kwenye majengo na zinataka ufikiaji wa itifaki nyingi (NFS, SMB, na iSCSI kutoka mfumo ule ule wa faili) — na **FSx for OpenZFS**, kwa mizigo inayohitaji vipengele mahususi vya ZFS kama snapshots na clones katika kiwango cha mfumo wa faili. Zote ni zana maalum kwa mashirika yenye miundombinu au mahitaji mahususi yaliyopo.

Kwa timu nyingi, uamuzi ni kati ya aina nne za FSx na EFS. Swali daima ni lile lile: mzigo unazungumza itifaki gani, na unahitaji sifa gani za utendaji?

---

> **Kidokezo cha Mtihani — Amazon FSx**
>
> *Kikoa cha SAA-C03: Buni Usanifu wenye Utendaji wa Juu (Kikoa 3, Kazi 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + mizigo ya Windows**. Mtihani huashiria: "seva ya faili ya Windows," "itifaki ya SMB," "ujumuishaji wa Active Directory," "inua-na-hamisha programu za Windows." Unapoona vishazi vyovyote kati ya hivyo, FSx for Windows ni jibu.
> - **FSx for Lustre = HPC + mafunzo ya ML + I/O sambamba + ujumuishaji wa S3**. Mtihani huashiria: "mafunzo ya kujifunza kwa mashine," "kompyuta ya utendaji wa juu," "HPC," "mfumo wa faili sambamba," "mizigo inayotumia I/O sana," "kundi la GPU," "jumuisha mfumo wa faili na S3." Unapoona vishazi hivyo, FSx for Lustre ni jibu.
> - **EFS si mbadala wa yoyote kati ya hizo.** EFS ni NFS kwa mizigo ya Linux. Haizungumzi SMB. Si mfumo wa faili sambamba wa utendaji wa juu. Kutumia EFS ambapo FSx inahitajika kunamaanisha programu haifanyi kazi (Windows) au imefungwa na I/O (HPC).
> - **FSx for NetApp ONTAP na FSx for OpenZFS** hujitokeza mara chache, lakini ishara ni tofauti. "Hamisha hifadhi iliyopo ya NetApp/ONTAP," "ufikiaji wa itifaki nyingi (NFS + SMB + iSCSI)," au "SnapMirror" → FSx for NetApp ONTAP. "ZFS," "NFS na snapshots/clones za papo hapo," au "hamisha seva ya faili ya ZFS ya kwenye majengo" → FSx for OpenZFS.
> - Marejeleo ya haraka: "SMB au seva ya faili ya Windows" → FSx for Windows. "Mafunzo ya kujifunza kwa mashine au kompyuta ya utendaji wa juu" → FSx for Lustre. "NetApp/itifaki nyingi" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## Daraja Kwenda Wingu: AWS Storage Gateway

Mteja mkubwa zaidi wa Nimbus mpaka sasa — mtandao wa kieneo unaoitwa Meridian Kitchen, maeneo ishirini kuvuka majimbo matatu — alikuja na tatizo ambalo halingeweza kutatuliwa kwa `aws s3 cp`.

Meridian ilikuwa na miaka ya data ya kiuendeshaji inayoishi kwenye seva za faili za kwenye majengo. Mapishi, ankara, picha za video za jiko, mikataba ya wasambazaji. Si gigabaiti chache. Terabaiti. Na programu iliyozalisha na kutumia data hii — mfumo wao wa usimamizi wa jiko, jukwaa lao la ankara, zana zao za HR — yote yaliandika kwa hisa za faili za kienyeji kwa kutumia NFS au SMB. Kuandika upya programu hizo hakukuwa kunawezekana. Kuhamisha data yote usiku mmoja hakukuwa kunawezekana pia.

"Kwa hivyo tunaanzaje kupata data yao kwenda AWS," Maya aliuliza, "bila kuwaomba kubadilisha programu hata moja?"

"Kuna huduma kwa hili haswa," Priya alisema. "Inaendesha katika kituo chao cha data kama VM, inaonekana kama seva ya kawaida ya faili au kifaa cha hifadhi kwa programu yao iliyopo, na inahifadhi kila kitu katika AWS kimya nyuma ya pazia."

Huduma hiyo ni **AWS Storage Gateway**: huduma ya hifadhi mseto inayounganisha mazingira ya kwenye majengo na hifadhi ya AWS. Inawasilisha hifadhi kwa programu zako kwa kutumia itifaki wanazozielewa tayari, wakati kwa kweli inahifadhi data katika S3, S3 Glacier, au kama snapshots za EBS.

Kuna aina tatu za lango, kila moja ikisuluhisha tatizo tofauti la kwenye majengo.

**File Gateway** inawasilisha kiolesura cha NFS au SMB kwa programu za kwenye majengo. Faili zilizoandikwa kwa lango huhifadhiwa kama vitu katika S3 — lakini programu haijui hilo. Inaona mfumo wa faili. Faili zinazofikiwa mara kwa mara huwekwa kwenye akiba kienyeji kwa usomaji wa latensi ya chini; zingine huishi katika S3. Hiki ndicho Meridian ilichohitaji: programu ya usimamizi wa jiko huandika kwa kile kinachoonekana kama hisa ya faili, na data huishia katika S3 ambapo Nimbus inaweza kuichanganua, kuihifadhi nakala rudufu, na kuitafuta.

"Subiri — lakini *kwa nini* tungelifanya hivyo?" Maya aliuliza. "Kwa nini tusielekeze programu kwenye S3 moja kwa moja?"

Kwa sababu NFS na SMB si S3. Programu ya jiko haizungumzi API ya S3. Hufungua njia za faili. Huandika baiti kwa saraka. File Gateway hutafsiri hilo kuwa operesheni za vitu za S3 bila programu kujua kitu kilibadilika.

**Volume Gateway** inawasilisha sauti za hifadhi ya kizuizi za iSCSI kwa seva za kwenye majengo — kiolesura kile kile ambacho diski kuu halisi au kifaa cha SAN kingewasilisha. Ina modi mbili: *sauti zilizohifadhiwa* (stored volumes) huweka data ya msingi kwenye majengo na nakala rudufu zisizo sambamba kwa S3 kama snapshots za EBS (kwa mizigo ya majengo-kwanza inayotaka pia nakala rudufu ya wingu), na *sauti za akiba* (cached volumes) huweka data ya msingi katika S3 na data inayofikiwa mara kwa mara ikiwa kwenye akiba kwenye majengo (kwa mashirika yaliyo tayari kuchukulia S3 kama hifadhi ya msingi).

**Tape Gateway** inawasilisha maktaba ya kanda pepe (VTL) kwa programu za nakala rudufu kama Veeam, Veritas, au NetBackup. Programu ya nakala rudufu huandika kwa kile kinachoonekana kama kaseti za kanda halisi. Kanda hizo pepe huhifadhiwa katika S3 na zinaweza kuhifadhiwa kumbukumbu kwa S3 Glacier. Programu ya nakala rudufu haibadiliki. Roboti halisi za kanda na rafu huondoka.

"Timu ya nakala rudufu ya Meridian huendesha Veeam," Leo alisema. "Wana kanda halisi za kweli. Hifadhi ya mahali pengine, ratiba za mzunguko, kila kitu."

"Tape Gateway hubadilisha kanda halisi," Priya alisema. "Usanidi ule ule wa Veeam. Kazi zile zile za nakala rudufu. Kanda zinaishi tu katika S3 badala ya rafu."

Tom alitafuta gharama ya hifadhi ya kanda ya mahali pengine. Alifunga kichupo hicho bila maoni na akaidhinisha mpango wa uhamaji.

---

> **Kidokezo cha Mtihani — AWS Storage Gateway**
>
> *Kikoa cha SAA-C03: Buni Usanifu wenye Utendaji wa Juu (Kikoa 3)*
>
> - **File Gateway = NFS/SMB → S3.** Faili zilizoandikwa na programu za kwenye majengo huwa vitu vya S3. Faili zinazofikiwa mara kwa mara huwekwa kwenye akiba kienyeji. Kichocheo cha mtihani: "programu ya kwenye majengo inahitaji kuhifadhi faili katika S3 bila mabadiliko ya msimbo."
> - **Volume Gateway = hifadhi ya kizuizi ya iSCSI → snapshots za S3.** Modi iliyohifadhiwa: data ya msingi kwenye majengo, imehifadhiwa nakala rudufu kwa S3 kama snapshots za EBS. Modi ya akiba: data ya msingi katika S3, vizuizi vinavyofikiwa mara kwa mara kwenye akiba kienyeji. Kichocheo cha mtihani: "seva ya kwenye majengo inahitaji hifadhi ya kizuizi inayoungwa mkono na wingu."
> - **Tape Gateway = VTL → S3/Glacier.** Programu ya nakala rudufu huandika kwa kanda pepe; kanda huhifadhiwa katika S3 au kuhifadhiwa kumbukumbu kwa Glacier. Kichocheo cha mtihani: "badilisha miundombinu ya nakala rudufu ya kanda halisi bila kubadilisha programu ya nakala rudufu."
> - **Muundo muhimu wa mtihani:** "programu ya kwenye majengo inahitaji hifadhi ya wingu bila mabadiliko ya msimbo" → Storage Gateway. "Badilisha nakala rudufu ya kanda" → Tape Gateway haswa.

---

## Nguvu na Mapungufu

**Nguvu za EBS**:

- Hifadhi ya kizuizi ya kudumu, ya haraka kwa EC2
- Snapshots kwa nakala rudufu na urejeshaji wa nukta-katika-wakati
- Tabaka nyingi za utendaji kwa mizigo tofauti
- Usimbaji wakati umehifadhiwa unaungwa mkono kiasili — wezesha usimbaji wa kiwango cha akaunti kwa chaguomsingi

**Mapungufu ya EBS**:

- Imeambatanishwa na tukio moja kwa wakati mmoja (na istisna ndogo)
- Katika AZ ile ile kama tukio la EC2 (kunakili kwa AZ nyingine kunahitaji snapshot)
- Unalipia hifadhi iliyotolewa, si tu kile unachotumia
- Kusimba sauti iliyopo isiyosimbwa kunahitaji mzunguko wa snapshot-nakili-rejesha na dirisha la matengenezo

**Nguvu za EFS**:

- Mfumo wa faili unaoshirikiwa wa matukio-mengi — itifaki ya asili ya NFS
- Hupanuka kiotomatiki, hutoi uwezo
- Inafikika kuvuka AZ ndani ya Region
- Modi ya Elastic Throughput hujirekebisha kiotomatiki kwa mzigo

**Mapungufu ya EFS**:

- Ghali zaidi kuliko S3 kwa GB
- Latensi ya juu kuliko EBS kwa I/O ya nasibu
- Haipatikani katika Regions zote

## Kuhamisha Data kwa Wingi: DataSync na Familia ya Snow

Storage Gateway huweka programu za kwenye majengo *zikiwa zimeunganishwa kuendelea* na hifadhi ya wingu. Lakini mazingira mengine mawili ya uhamaji hujitokeza mara kwa mara kwenye mtihani — na hatimaye katika miradi halisi:

**AWS DataSync** ni kwa *uhamishaji wa wingi mtandaoni*: kuhamisha seti kubwa za data kupitia mtandao kati ya seva za faili za NFS/SMB za kwenye majengo (au mawingu mengine) na S3, EFS, au FSx — mara moja, au kwa ratiba. Hushughulikia ulinganishaji, uthibitishaji wa uadilifu, majaribio upya, na kupunguza kipimo data, nayo ni takriban mara 10 ya haraka kuliko skripti za mtindo wa rsync zilizotengenezwa kwa mkono. Kichocheo cha mtihani: "hamisha/safirisha mamilioni ya faili kutoka seva ya NFS ya kwenye majengo kwenda Amazon EFS/S3" → DataSync. (Usiichanganye na Storage Gateway, ambayo ni kwa *ufikiaji wa mseto unaoendelea*, au DMS, inayohamisha *hifadhidata*.)

**Familia ya AWS Snow** ni kwa wakati mtandao ndio kizuizi. Kuhamisha TB 100 kupitia laini ya Mbps 100 huchukua zaidi ya miezi mitatu; lori ni haraka zaidi. **Snowball Edge** ni kifaa kilichoimarishwa ambacho AWS hukutumia — pakia hadi ~TB 80 kienyeji, kirudishe, AWS huiingiza katika S3. **Snowcone** ulikuwa toleo dogo lenye kubebeka (~TB 8–14) kwa maeneo ya ukingo — limesitishwa mwishoni mwa 2024, ingawa linaweza bado kuonekana katika maswali ya zamani ya mtihani (ona ukaguzi wa uhalisia katika Sura ya 25). Kichocheo cha hesabu ya mtihani: wakati swali linapokupa ukubwa wa seti ya data na laini nyembamba au isiyoaminika na kuomba uhamaji wa haraka/wa kivitendo zaidi, hesabu muda wa uhamishaji — ikiwa ni wiki au miezi, jibu ni Familia ya Snow.

> **Kidokezo cha Mtihani — AWS Backup**
>
> Huduma moja zaidi inayoshona sura hii pamoja: **AWS Backup** huweka kati na huotomatisha nakala rudufu kuvuka EBS, EFS, RDS, DynamoDB, FSx, na Storage Gateway na mpango mmoja wa nakala rudufu — ratiba, uhifadhi, nakala za kuvuka-eneo na kuvuka-akaunti, na Backup Vault Lock kwa kutobadilika. Kichocheo cha mtihani: "simamia kwa pamoja nakala rudufu kuvuka huduma/akaunti nyingi za AWS" → AWS Backup, si skripti za kwa-kila-huduma.


## Muhtasari

Kalamu nyekundu ya Tom ilizungushia tatizo halisi: vingi mno kwenye mashine moja. Kuhamisha hifadhi kutoka tukio la EC2 si tu kuhusu uwezo — ni kuhusu kutenganisha masuala ili kila safu iweze kusimamiwa, kupanuliwa, na kulindwa kwa kujitegemea. Chaguo sahihi la hifadhi linategemea maswali manne: ni nini kinachohitaji hifadhi, ni vitu vingapi vinaihitaji kwa wakati mmoja, inaishi kwa muda gani, na inafikiwaje? Maswali hayo manne huongoza kwa uthabiti kwa jibu sahihi.

- **EBS** (Elastic Block Store) ni hifadhi ya kizuizi ya kudumu kwa tukio moja la EC2. Inaokoka kusimama kwa matukio na inaweza kuchukuliwa snapshot kwa nakala rudufu. Tumia gp3 kwa mizigo ya jumla, io2 kwa mahitaji ya IOPS za juu. Instance store ni ya muda na ya haraka lakini inapotea wakati tukio linapofutwa.
- **EFS** (Elastic File System) ni mfumo wa faili wa mtandao unaoshirikiwa ambao matukio mengi yanaweza kuuweka kwa wakati mmoja. EFS hutapakaa AZ ndani ya Region; EBS imefungwa kwa AZ moja.
- Linganisha aina ya hifadhi na hitaji: hifadhidata ya EC2 moja → EBS; faili zinazoshirikiwa kuvuka seva → EFS; vitu, vyombo vya habari, nakala rudufu → S3; kumbukumbu → S3 Glacier.
- Kusimba sauti iliyopo ya EBS kunahitaji: snapshot → nakala iliyosimbwa → sauti mpya → badilisha. Wezesha usimbaji wa kiwango cha akaunti kwa chaguomsingi kuepuka hili kwa sauti mpya.
- **EBS "Delete on Termination"**: sauti za msingi huwa na chaguomsingi cha kufuta wakati wa kufutwa kwa tukio; sauti za data huwa na chaguomsingi cha kudumu. Kagua mipangilio yote miwili wakati wa kubuni sera za mzunguko wa maisha wa tukio.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03 3 — Kazi 3.1 (suluhisho za hifadhi)*

- **Sauti za EBS huishi katika AZ moja.** Zinaweza tu kuambatanishwa na tukio katika
  AZ ile ile. Kutumia sauti ya EBS katika AZ tofauti, unaunda snapshot na kurejesha
  katika AZ lengwa.
- **EBS snapshots ni za nyongeza na zimehifadhiwa katika S3.** Snapshot ya kwanza ni kamili;
  zinazofuata huhifadhi tu mabadiliko. Unaweza kunakili snapshots kwa Regions nyingine kwa
  urejeshaji wa maafa.
- **EFS ni ya kuvuka-AZ.** Matukio mengi katika AZ tofauti ndani ya Region ile ile
  yanaweza kuweka mfumo ule ule wa faili wa EFS. Hii ni tofauti muhimu na EBS.
- **Wakati mazingira ya mtihani yanasema "programu ya wavuti yenye maudhui yanayoshirikiwa" au "matukio
  mengi yanayofikia faili zile zile," fikiri EFS.** Inaposema "hifadhi ya hifadhidata"
  au "diski ya kudumu kwa seva moja," fikiri EBS.
- **Data ya instance store huokoka kuanzisha upya lakini si kusimama au kufutwa.** Swali
  linaweza kueleza data inayo"toweka baada ya tukio kusimamishwa" — hiyo ni instance
  store inacheza.
- **gp3 dhidi ya io2**: gp3 ni chaguomsingi kwa matumizi ya jumla; io2 ni kwa mizigo
  inayohitaji IOPS zilizohakikishwa (hifadhidata kubwa, mifumo muhimu sana). Mazingira ya mtihani
  yanayoeleza "mahitaji ya IOPS" au "utendaji thabiti wa hifadhidata wa latensi ya chini"
  huelekeza kwa io2.
- **gp2 dhidi ya gp3:** IOPS za gp2 zimeunganishwa na ukubwa (IOPS 3/GB, kima cha juu cha IOPS 16,000 kwa GB 5,334); IOPS za gp3 hazitegemei ukubwa (msingi wa 3,000, zinazoweza kusanidiwa hadi 80,000 tangu Septemba 2025 — maudhui ya zamani, na pengine benki ya maswali ya mtihani, bado yanadhani kikomo cha awali cha 16,000). Muundo wa swali la mtihani: mzigo unahitaji IOPS zaidi bila kuongeza hifadhi — jibu ni gp3 au io2, si gp2.
- **Usimbaji wakati umehifadhiwa kwa EBS**: Huwezi kusimba sauti iliyopo isiyosimbwa
  mahali pake — lazima uchukue snapshot, unakili iliyosimbwa, urejeshe. Wezesha chaguomsingi za
  usimbaji za kiwango cha akaunti kuepuka kuunda sauti zisizosimbwa kwa bahati mbaya. Usimbaji ni AES-256
  ukitumia funguo za KMS.
- **Fast Snapshot Restore** huondoa adhabu ya utendaji kwenye sauti zilizorejeshwa upya
  lakini hugharimu pesa kwa kila snapshot kwa kila AZ. Maswali ya mtihani kuhusu kurejesha sauti
  "mara moja kwa utendaji kamili" huelekeza kwa FSR.
- **EFS performance modes**: General Purpose (latensi ya chini, inafaa kwa mizigo mingi)
  dhidi ya Max I/O (throughput ya juu kwa mizigo iliyolinganishwa sana).
- **EFS throughput modes — chaguo tatu:** Bursting (throughput hupanuka na ukubwa wa hifadhi, hutumia mikopo ya mlipuko — nzuri kwa mizigo yenye vilele), Elastic (hujipanua, lipa kwa matumizi — nzuri kwa mizigo isiyotabirika), Provisioned (throughput isiyobadilika bila kujali hifadhi — nzuri kwa mahitaji thabiti ya throughput ya juu). Mtihani hujaribu kama unajua lini wa kutoa throughput dhidi ya kuiacha ipanuke kiyumbufu au kutegemea mikopo ya mlipuko.
- **Nakala ya snapshot ya kuvuka-eneo**: EBS snapshots zinaweza kunakiliwa kwa Regions nyingine kwa
  urejeshaji wa maafa. Snapshot iliyonakiliwa ni huru na haiongezi gharama za uhamishaji wa data
  wakati wa urejeshaji — wakati wa operesheni ya nakala yenyewe pekee.
- **Aina za Storage Gateway:** File Gateway = NFS/SMB → S3 (faili huwa vitu). Volume Gateway = hifadhi ya kizuizi ya iSCSI → snapshots za S3 (iliyohifadhiwa: msingi kwenye majengo; akiba: msingi katika S3). Tape Gateway = VTL → S3/Glacier (hubadilisha kanda halisi). Kichocheo cha mtihani: "programu ya kwenye majengo inahitaji hifadhi ya wingu bila mabadiliko ya msimbo" → Storage Gateway. "Badilisha nakala rudufu ya kanda" → Tape Gateway.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Kwa maneno yako mwenyewe: ni nini tofauti kati ya EBS na EFS? Lini ungechagua
moja kuliko nyingine?

*(Kidokezo: Fikiri kuhusu kama tukio moja au matukio mengi yanahitaji kufikia
hifadhi kwa wakati mmoja.)*

**Zoezi la 2 — Mazingira ya SAA-C03**

*Mazingira*: Kampuni huendesha programu ya wavuti kuvuka matukio manne ya EC2 nyuma ya kisawazisha
mzigo. Watumiaji wanaweza kupakia picha za wasifu. Picha yoyote lazima ionekane na watumiaji
mara moja baada ya upakiaji, bila kujali ni tukio gani lililoishughulikia. Picha
huhudumiwa kwa vivinjari kupitia HTTP, hazirekebishwi mahali pake, na timu inataka
suluhisho NAFUU ZAIDI, linaloweza kupanuka lenye mzigo mdogo zaidi wa uendeshaji.

Ni suluhisho gani la hifadhi linalokidhi mahitaji yao VIZURI ZAIDI?

A) Ambatanisha sauti ya EBS gp3 kwa kila tukio la EC2 na ulinganishe faili kati yao kwa kutumia
   kazi ya cron  
B) Hifadhi picha moja kwa moja kwenye instance store ya tukio la EC2  
C) Tumia Amazon EFS, iliyowekwa kwenye matukio yote manne ya EC2 kwa wakati mmoja  
D) Hifadhi picha katika S3 na uzifikie moja kwa moja kutoka msimbo wa programu

**Kidokezo cha 1**: Hitaji ni "matukio yote manne lazima yahudumie picha yoyote." Ni chaguzi zipi
zinazofanya faili ionekane mara moja kwa matukio yote?

**Kidokezo cha 2**: Instance store ni ya muda mfupi. EBS haiwezi kuwekwa kwenye matukio mengi
kwa wakati mmoja. Hilo linapunguza.

**Kidokezo cha 3**: C na D zote zingeweza kufanya kazi kinadharia. Ni ipi inayofaa zaidi kwa
mazingira ambapo programu inahitaji kufikia picha kupitia operesheni za mfumo wa faili dhidi ya
maombi ya HTTP?

**Jibu**: D

**Ufafanuzi**: Kuhifadhi picha katika S3 na kuzihudumia kupitia URL ndio chaguo sahihi
kiusanifu kwa programu ya wavuti. Picha zilizopakiwa zinafikika mara moja kutoka
seva yoyote (na kutoka kivinjari chochote) kupitia URL ya S3. S3 imebuniwa kwa haswa
matumizi haya: kuhifadhi faili zilizopakiwa na watumiaji kwa kiwango kikubwa na upatikanaji wa juu na sifuri
mzigo wa usimamizi.

Dokezo: C (EFS) kiufundi ingefanya kazi, lakini S3 ni muundo unaopendelewa kwa faili za binari
zilizopakiwa na watumiaji katika programu za wavuti kwa sababu ni nafuu, inayopanuka zaidi, na huhudumia faili
kupitia HTTP moja kwa moja bila programu kufanya kama wakala.

**Kwa nini si A?** Kulinganisha faili kupitia kazi ya cron huunda hali za mbio na matatizo
ya uthabiti. Kati ya upakiaji na ulinganishaji ujao, faili zingekosekana kwenye matukio mengine.

**Kwa nini si B?** Data ya instance store inapotea wakati tukio linapsimamishwa au kufutwa.
Picha zingetoweka.

**Kwa nini si C?** EFS ni jibu sahihi wakati swali linadai semantiki za mfumo wa faili
(mfano, CMS inayorekebisha faili mahali pake). Kwa picha zilizopakiwa na watumiaji zinazohudumiwa kupitia
wavuti, S3 ni rahisi, nafuu, na inafaa zaidi.

**Onyo la maneno-muhimu ya mtihani**: kwenye mtihani halisi, soma swali kihalisia. Ikiwa linasema
"hifadhi ya **faili** inayoshirikiwa," "mfumo wa faili," "NFS," au "POSIX," jibu lililofunguliwa ni
**EFS** — usipuuze hitaji lililotajwa kwa ladha ya kiusanifu. Mazingira haya
yanafungulia S3 kwa sababu yanaomba uwasilishaji wa vitu wa gharama nafuu kupitia HTTP,
si mfumo wa faili.

*Kikoa cha SAA-C03 3 — Kazi 3.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inaongeza kipengele kipya: wamiliki wa migahawa wanaweza kupakia menyu za PDF ambazo
kisha huchanganuliwa na kutumika kujaza hifadhidata ya Nimbus. Kazi ya uchakataji wa PDF inaendesha
kwenye meli ya matukio ya EC2 yanayohitaji: (a) kusoma PDF iliyopakiwa, (b) kuandika
faili za uchakataji za muda, (c) kuandika matokeo yaliyochanganuliwa.

Ni huduma zipi za hifadhi ungetumia kwa kila moja ya hatua hizi tatu, na kwa nini?

*(Hakuna jibu moja sahihi. Lenga kulinganisha aina ya hifadhi na
sifa za kila hatua.)*

## Onyesho la Baada ya Mikopo

Mchana ule, Nimbus ilitenganisha hifadhi yao ipasavyo. Hifadhidata ilipata sauti yake
ya EBS yenye snapshots otomatiki na usimbaji umewezeshwa. Picha za menyu zilihamia S3. Tukio la EC2
hatimaye lilikuwa na nafasi ya kupumua.

Leo aliendesha jaribio la mzigo. Tovuti ilishughulikia watumiaji mia mbili kwa wakati mmoja bila kuvunjika
jasho.

"Itakuwa sawa kuanzia hapa," alisema, akiangalia grafu zikitulia kwa ulaini.

Tom aliangalia bili. Sauti ya EBS ilikuwa ikiongeza dola 8 kwa mwezi. Aliiandika.

"Naendelea kuongeza vitu kwenye bili hii," alisema. "Lini inajisawazisha?"

"Tutakapoacha kuwa na kukatika," Maya alisema. "Kila kukatika hugharimu zaidi kuliko kuzuia."

Tom hakuonekana ameridhishwa. Angekuwa, hatimaye.

Siku tatu baadaye, mmiliki wa mgahawa kwenye jukwaa alijaribu kutoa agizo na akapata
hitilafu. Maya alikagua kumbukumbu.

Hifadhidata ilikuwepo. Programu ilikuwa ikiendesha. Lakini watumiaji ishirini wa wakati mmoja
walikuwa wote wakijaribu kusoma menyu kwa mara moja, na kila mmoja alikuwa akigonga hifadhidata.

"Kila upakiaji wa ukurasa ni hoja ya hifadhidata," Leo alisema. "Kila moja."

Priya alikuwa tayari akitafuta kitu kwenye Google.

Katika sura inayofuata: kile kinachotokea wakati wateja wengi wanafika kuliko seva inavyoweza kushughulikia.
