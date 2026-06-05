# Sura ya 6: Diski Inayokufuata Karibu

Tom alikuwa na kalamu nyekundu na tabia ambayo ilimfanya Leo kuwa na wasiwasi.

Kila Jumamosi asubuhi, Tom alichapisha muhtasari wa kiweko cha AWS - matukio ya uendeshaji, kiasi cha kuhifadhi, diski zilizoambatishwa - na akapitia mstari kwa mstari. Alikuwa akifanya hivi tangu wiki ya pili. Aliiita "leja." Leo aliita "kitu ambacho Tom hufanya ambacho humfanya Leo ahisi kama amefanya kitu kibaya."

Jumamosi hiyo, Tom alizunguka kitu na kuacha chapa kwenye dawati la Maya bila neno.

Aliipata Jumatatu asubuhi. Mduara mmoja. Noti moja pembeni, maneno matatu:

*Kila kitu. Mashine moja.*

Seva ya wavuti. Hifadhidata. Rekodi zote za mteja. Miezi miwili ya historia ya agizo. Yote inaendeshwa kwa mfano mmoja wa EC2.

"Ni nini hufanyika kwa hifadhidata ikiwa mfano utaanguka?" Maya aliuliza, chapa mkononi mwake.

"Inaanguka pia," Leo alisema.

"Na data?"

"Inategemea jinsi hifadhidata inavyoihifadhi."

Hiyo "inategemea" ilikuwa shida.

**Jinsi Matukio ya EC2 Huhifadhi Data**

Wakati mfano wa EC2 unaendesha, mfumo wake wa uendeshaji unaishi mahali fulani kwenye diski. Diski hiyo
inaitwa **kiasi cha mizizi**. Kwa chaguomsingi, hii ni **kiasi cha EBS** — hata wakati wewe
usifikirie juu yake.

Lakini kuna kitu kingine: Matukio ya EC2 pia yana uhifadhi wa **duka la mfano**.

Duka la picha ni hifadhi ya muda iliyoambatanishwa kimwili na maunzi ya msingi ambayo
inaendesha mashine yako pepe. Ni haraka sana - haraka kuliko karibu hifadhi nyingine yoyote
chaguo katika AWS. Lakini inakuja na kukamata.

Duka la matukio ni **ephemeral**.

Mfano unapoacha au kusitishwa, data ya hifadhi ya mfano imetoweka. Kudumu.
Haiwezekani kurejeshwa. AWS haikuonya kwa sauti kubwa kuhusu hili, ndivyo timu inavyofanya
igundue: kwa kupoteza data.

Duka la picha linafaa kwa akiba, faili za usindikaji za muda, na mwanzo
nafasi. Kamwe kwa data unayojali.

**EBS: Diski ya Kudumu**

**Amazon EBS** - Duka la Vitalu vya Elastic - ni hifadhi endelevu ya vizuizi kwa matukio ya EC2.

Zuia hifadhi inamaanisha kuwa inafanya kazi kama diski kuu ya kweli: mfumo wako wa uendeshaji unaweza kuunda
mifumo ya faili juu yake, soma na uandike baiti za kiholela katika nafasi za kiholela, endesha hifadhidata
juu yake, na uichukue kama diski iliyoambatanishwa.

Tabia kuu:

**Inadumu.** Tofauti na duka la mfano, juzuu za EBS huendelea na hali ya kusimama, kuanza na
hata kukomesha mfano (kulingana na usanidi). Data inabaki kwenye sauti
hata kama hakuna mfano unaitumia.

**Inaambatishwa na inaweza kutolewa.** Kiasi cha EBS kinaweza kutengwa kutoka kwa tukio moja na
kushikamana na mwingine. Ikiwa unahitaji kuhamisha data au kurejesha kutoka kwa mfano ulioshindwa,
unaweza kuondoa sauti na kuiunganisha tena mahali pengine.

**Kiambatisho kimoja (zaidi).** Kwa chaguomsingi, sauti ya EBS imeambatishwa kwa moja haswa
Mfano wa EC2 kwa wakati mmoja. Mfano mmoja unaweza kuwa na juzuu nyingi za EBS, lakini moja
Kiasi cha EBS hakiwezi kupachikwa na matukio mengi kwa wakati mmoja (isipokuwa moja:
EBS Multi-Attach, ambayo ina kesi ndogo za matumizi na vikwazo muhimu).

Ulinganisho: EBS ni diski kuu ya nje ambayo unachomeka kwenye kompyuta ya mkononi. Laptop
(mfano wa EC2) anaweza kuisoma na kuiandikia. Ukimaliza, unaweza kuichomoa na
chomeka kwenye kompyuta ya mkononi tofauti.

**Aina za Kiasi cha EBS**

Sio juzuu zote za EBS zinazofanana. AWS inatoa aina kadhaa na utendaji tofauti
na wasifu wa gharama.

**gp3 (Madhumuni ya Jumla SSD)**: Chaguo-msingi kwa mizigo mingi ya kazi. Usawa mzuri wa
utendaji na bei. Inafaa kwa idadi ya boot, hifadhidata ndogo, na ukuzaji
mazingira.

**io2 (IOPS SSD Iliyotolewa)**: Chaguo la utendakazi wa hali ya juu kwa mzigo mkubwa wa kazi wa I/O.
Unabainisha ni shughuli ngapi za I/O kwa sekunde (IOPS) unazohitaji, na uhakikisho wa AWS
utendaji huo. Inafaa kwa hifadhidata kubwa za uzalishaji.

**st1 (HDD Iliyoboreshwa kwa Njia ya Kupitia)**: Hifadhi ya sumaku iliyoboreshwa kwa mfuatano mkubwa
anasoma na kuandika. Gharama ya chini kuliko SSD, lakini polepole kwa I/O nasibu. Nzuri kwa data
ghala na usindikaji wa magogo.

**sc1 (HDD Baridi)**: Chaguo la bei nafuu zaidi la EBS. Kwa data inayopatikana mara chache. Sivyo
inafaa kwa kitu chochote kinachojali wakati.

Mtihani hauhitaji ukariri aina zote. Inajaribu uwezo wako wa
linganisha mahitaji na aina sahihi: Mahitaji ya IOPS → io2. Mfuatano unaozingatia gharama
mzigo wa kazi → st1. Utumizi wa jumla wa wavuti → gp3.

**Muhtasari wa EBS: Hifadhi Nakala**

Hapa kuna kitu ambacho huokoa kampuni mara kwa mara.

**Picha ya EBS** ni nakala rudufu ya moja kwa moja ya sauti ya EBS, iliyohifadhiwa katika S3 (ingawa
unaipata kupitia kiolesura cha EBS, sio moja kwa moja kupitia S3). Vijipicha ni
nyongeza: picha ya kwanza inachukua sauti kamili; snapshots zinazofuata tu
kuhifadhi kile kilichobadilika tangu cha mwisho.

Unaweza kuunda sauti mpya ya EBS kutoka kwa muhtasari - kurejesha kwa wakati uliotangulia
uharibifu wa hifadhidata, utumaji mbaya, au ufutaji wa bahati mbaya.

Unapaswa kubinafsisha snapshots. AWS hutoa ** Kidhibiti cha Maisha ya Data ya Amazon ** kwa hili
madhumuni: kufafanua sera (piga picha kila baada ya saa 6, weka siku 7 zilizopita), na
inaendesha moja kwa moja.

Priya alianzisha hii kabla hifadhidata haijaanza kutengenezwa.

Leo hakuwa na mawazo yake.

**EFS: Baraza la Mawaziri la Uwasilishaji Pamoja**

EBS ni diski iliyoambatishwa kwa mfano mmoja. Nini ikiwa hali nyingi zinahitaji kufikia faili ya
faili sawa wakati huo huo?

Ingiza **Amazon EFS** - Mfumo wa Faili wa Elastic.

EFS ni mfumo wa faili wa mtandao unaosimamiwa. Matukio mengi ya EC2 yanaweza kuweka EFS sawa
mfumo wa faili kwa wakati mmoja na usome / uandike kwa faili zilizoshirikiwa. Huu ndio uwezo muhimu
ambayo EBS haitoi.

Fikiria hivi:

EBS ni diski kuu ya nje iliyochomekwa kwenye kompyuta ya mkononi moja. Laptop hiyo pekee ndiyo inayoweza kuitumia
wakati.

EFS ni baraza la mawaziri la kufungua jalada katikati ya ofisi. Mwanachama yeyote wa timu anaweza kutembea, kufungua
droo, soma faili, weka kitu nyuma. Watu wengi, wakati huo huo, wanafikia
hifadhi sawa.

**Unahitaji EFS lini?**

- Wakati matukio mengi ya EC2 yanahitaji kushiriki faili - mifumo ya udhibiti wa maudhui, iliyoshirikiwa
  faili za usanidi, maktaba za media zilizoshirikiwa
- Unapokuwa na programu iliyopimwa mlalo ambapo hali zote zinahitaji ufikiaji
  data sawa
- Wakati unahitaji mfumo wa faili unaoendelea ambao unasalia kushindwa kwa mfano

**EFS dhidi ya S3:** EFS ni mfumo wa faili (folda, faili, ruhusa, kufunga). S3 ni
hifadhi ya kitu (pakia, pakua, hakuna semantiki za mfumo wa faili). EFS ni ghali zaidi
kuliko S3. Tumia S3 kwa faili ambazo zimehifadhiwa na kurejeshwa nzima. Tumia EFS kwa faili
kwamba programu zinasoma na kuandika kikamilifu kupitia shughuli za kawaida za mfumo wa faili.

**Uchaguzi Sahihi wa Hifadhi**

Kufikia sasa umeona aina tatu za hifadhi katika AWS. Wacha tufanye uamuzi kwa urahisi.

| Haja | Aina ya Hifadhi |
|-------------------------------------------------------|
| Hifadhidata inahitaji diski endelevu, ya haraka | EBS (gp3 au io2) |
| Seva nyingi zinahitaji faili zilizoshirikiwa | EFS |
| Faili, chelezo, picha, vitu vikubwa | S3 |
| Nafasi ya mwanzo ya kukokotoa | Duka la Miundo |
| Kumbukumbu za muda mrefu kwa gharama ya chini | S3 Glacier |

Kupata uamuzi huu ni muhimu. Kutumia S3 ambapo unahitaji EFS inaongeza kufanya kazi
utata. Kutumia EBS ambapo unahitaji EFS husababisha kutofaulu unapoongeza. Kutumia
mfano kuhifadhi ambapo unahitaji kuendelea hupoteza data.

Priya alichapisha jedwali hili na kulibandika ukutani.

"Kila wakati tunapoongeza hitaji la kuhifadhi," alisema, "tunaanza hapa."

## Nguvu na Mapungufu

**Nguvu za EBS**:

- Hifadhi inayoendelea na ya haraka ya EC2
- Vijisehemu kwa chelezo na urejeshaji wa uhakika kwa wakati
- Viwango vingi vya utendaji kwa mizigo tofauti ya kazi
- Usimbaji fiche wakati wa kupumzika unatumika asili

**Mapungufu ya EBS**:

- Imeambatishwa kwa tukio moja kwa wakati (isipokuwa ndogo)
- Katika AZ sawa na mfano wa EC2 (kunakili kwa AZ nyingine kunahitaji muhtasari)
- Unalipa hifadhi ya muda, sio tu unayotumia

**Nguvu za EFS**:

- Mfumo wa faili ulioshirikiwa wa mifano mingi - itifaki asili ya NFS
- Mizani kiotomatiki, hautoi uwezo
- Inapatikana katika AZ ndani ya Mkoa

**Mapungufu ya EFS**:

- Ghali zaidi kuliko S3 kwa kila GB
- Muda wa kusubiri wa juu kuliko EBS kwa I/O nasibu
- Haipatikani katika Mikoa yote

## Muhtasari

- **Duka la matukio** ni la muda, hifadhi ya haraka iliyoambatishwa kimwili na seva pangishi.
  Data inapotea wakati tukio linasimama au kuisha. Kwa nafasi ya mikwaruzo pekee.
- **EBS** (Duka la Vitalu vya Elastic) ni hifadhi inayoendelea ya kuzuia kwa mfano mmoja wa EC2.
  Inanusurika kuacha kwa mfano. Inaweza kupigwa picha kwa chelezo. Chagua kulia
  aina ya kiasi (gp3 kwa matumizi ya jumla, io2 kwa mahitaji ya juu-IOPS).
- **EFS** (Mfumo wa Faili wa Elastic) ni mfumo wa faili wa mtandao ulioshirikiwa ambao matukio mengi
  inaweza kupanda wakati huo huo. Itumie wakati seva nyingi zinahitaji ufikiaji wa faili sawa.
- Linganisha aina ya uhifadhi na mahitaji: hifadhidata → EBS; faili zilizoshirikiwa → EFS;
  vitu/chelezo → S3; kumbukumbu → S3 Glacier.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa cha 3 — Kazi ya 3.1 (suluhisho za uhifadhi)*

- **Juzuu za EBS huishi katika AZ moja.** Zinaweza tu kuambatishwa kwa mfano katika
  sawa AZ. Ili kutumia sauti ya EBS katika AZ tofauti, unaunda picha na kurejesha
  ni katika lengo AZ.
- **Picha za EBS ni za ziada na zimehifadhiwa katika S3.** Muhtasari wa kwanza umejaa;
  zinazofuata huhifadhi mabadiliko tu. Unaweza kunakili snapshots kwa Mikoa mingine kwa
  kupona maafa.
- **EFS ni AZ.** Matukio mengi katika AZ tofauti ndani ya Mkoa huo
  inaweza kuweka mfumo sawa wa faili wa EFS. Hiki ni kitofautishi kikuu kutoka kwa EBS.
** Wakati hali ya mtihani inasema "programu ya wavuti iliyo na maudhui yaliyoshirikiwa" au "nyingi
  matukio ya kufikia faili zilezile," fikiria EFS.** Inaposema "hifadhi hifadhidata"
  au "diski inayoendelea kwa seva moja," fikiria EBS.
- **Data ya duka la matukio itasalia baada ya kuwashwa tena lakini si kusimamishwa au kusimamishwa.** Swali
  inaweza kuelezea data ambayo "inatoweka baada ya mfano kusimamishwa" - hiyo ni mfano
  kuhifadhi katika kucheza.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: ni tofauti gani kati ya EBS na EFS? Ungechagua lini
moja juu ya nyingine?

*(Kidokezo: Fikiria ikiwa mfano mmoja au hali nyingi zinahitaji kufikia
kuhifadhi kwa wakati mmoja.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni huendesha programu ya wavuti katika matukio manne ya EC2 nyuma ya mzigo
msawazishaji. Watumiaji wanaweza kupakia picha za wasifu. Matukio yote manne lazima yaweze kutumika
picha ya mtumiaji yeyote mara tu baada ya kupakiwa, bila kujali ni mfano gani unashughulikiwa
upakiaji. Timu inahitaji hifadhi endelevu ya faili iliyoshirikiwa.

Ni suluhisho gani la uhifadhi BORA linalokidhi mahitaji yao?

A) Ambatisha sauti ya gp3 ya EBS kwa kila tukio la EC2 na usawazishe faili kati yao kwa kutumia
   kazi ya cron  
B) Hifadhi picha moja kwa moja kwenye duka la mfano la EC2  
C) Tumia Amazon EFS, iliyowekwa kwenye matukio yote manne ya EC2 kwa wakati mmoja  
D) Hifadhi picha katika S3 na uzifikie moja kwa moja kutoka kwa msimbo wa programu

**Kidokezo cha 1**: Sharti ni "matukio yote manne lazima yatoe picha yoyote." Chaguzi zipi
kufanya faili ionekane mara moja kwa visa vyote?

**Kidokezo cha 2**: Duka la matukio ni la muda mfupi. EBS haiwezi kupachikwa kwenye matukio mengi
kwa wakati mmoja. Hiyo inapunguza chini.

**Kidokezo cha 3**: C na D zinaweza kufanya kazi kinadharia. Ambayo inafaa zaidi kwa a
kesi ambapo programu inahitaji kufikia picha kupitia shughuli za mfumo wa faili dhidi ya.
Maombi ya HTTP?

**Jibu**: D

**Maelezo**: Kuhifadhi picha katika S3 na kuzihudumia kupitia URL ndiyo njia ya usanifu
chaguo sahihi kwa programu ya wavuti. Picha zilizopakiwa zinapatikana mara moja kutoka
seva yoyote (na kutoka kwa kivinjari chochote) kupitia URL ya S3. S3 imeundwa kwa hili haswa
kesi ya matumizi: kuhifadhi faili zilizopakiwa na mtumiaji kwa kiwango kikubwa na upatikanaji wa juu na sifuri
usimamizi wa juu.

Kumbuka: C (EFS) ingefanya kazi kitaalamu, lakini S3 ndiyo muundo unaopendelewa wa kupakiwa na mtumiaji
faili za binary katika programu za wavuti kwa sababu ni za bei nafuu, zinaweza kupunguzwa zaidi, na hutumikia faili
kupitia HTTP moja kwa moja bila programu kufanya kazi kama wakala.

**Kwa nini isiwe A?** Kusawazisha faili kupitia cron job hutengeneza hali ya mbio na uthabiti
matatizo. Kati ya upakiaji na usawazishaji unaofuata, faili zitakosekana katika hali zingine.

**Kwa nini isiwe B?** Data ya hifadhi ya matukio hupotea wakati mfano umesimamishwa au kusitishwa.
Picha zingetoweka.

**Kwa nini isiwe C?** EFS ndio jibu sahihi ikiwa programu inahitaji semantiki za mfumo wa faili
(k.m., CMS inayorekebisha faili mahali). Kwa picha zilizopakiwa na mtumiaji zinazotolewa kwenye
web, S3 ni rahisi, nafuu, na inafaa zaidi.

*SAA-C03 Kikoa cha 3 - Kazi 3.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus anaongeza kipengele kipya: wamiliki wa mikahawa wanaweza kupakia menyu za PDF ambazo ni
kisha kuchanganuliwa na kutumika kujaza hifadhidata ya Nimbus. Kazi ya usindikaji wa PDF inaendesha
kwenye kundi la matukio ya EC2 ambayo yanahitaji: (a) kusoma PDF iliyopakiwa, (b) kuandika
faili za usindikaji za muda, (c) andika matokeo yaliyochanganuliwa.

Je, ungependa kutumia huduma zipi za kuhifadhi kwa kila moja ya hatua hizi tatu, na kwa nini?

*(Hakuna jibu moja sahihi. Lenga katika kulinganisha aina ya hifadhi na
sifa za kila hatua.)*

## Onyesho la Baada ya Mikopo

Alasiri hiyo, Nimbus alitenganisha hifadhi yao vizuri. Hifadhidata ilipata yake
Kiasi cha EBS kilicho na vijipicha otomatiki. Picha za menyu zimehamishwa hadi S3. Mfano wa EC2
hatimaye alikuwa na nafasi ya kupumua.

Leo aliendesha mtihani wa mzigo. Tovuti ilishughulikia watumiaji mia mbili wa wakati mmoja bila kuvunja
jasho.

Tom inaonekana katika muswada huo. Kiasi cha EBS kilikuwa kikiongeza $8 kwa mwezi. Aliiandika.

"Ninaendelea kuongeza mambo kwenye muswada huu," alisema. "Ni wakati gani usawa nje?"

"Tunapoacha kukatika," Maya alisema. "Kila kukatika kunagharimu zaidi ya kuzuia."

Tom hakuonekana kushawishika. Angekuwa, hatimaye.

Siku tatu baadaye, mmiliki wa mgahawa kwenye jukwaa alijaribu kuweka agizo na akapata
kosa. Maya alikagua magogo.

Database ilikuwepo. Maombi yalikuwa yanaendeshwa. Lakini watumiaji ishirini wakati huo huo
wote walikuwa wakijaribu kusoma menyu mara moja, na kila mmoja alikuwa akigonga hifadhidata.

"Kila upakiaji wa ukurasa ni swala la hifadhidata," Leo alisema. "Kila mmoja."

Priya alikuwa tayari anaingia kwenye Google kitu.

Katika sura inayofuata: nini hufanyika wateja wengi wanapowasili kuliko seva inavyoweza kushughulikia.
