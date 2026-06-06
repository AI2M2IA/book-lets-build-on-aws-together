# Sura ya 4: Kompyuta katika Jengo la Mtu Mwingine

Grafu ya CPU ilikuwa imekuwa muziki wa nyuma.

Laptop ya Tom ilikuwa wazi kwenye kona ya dawati lake, CloudWatch ikionyesha upya kila dakika, laini ya matumizi ikipanda kwa mteremko uliomaanisha kitu kilikuwa kikifanya kazi kwa bidii. Maya alikuwa ameigundua siku tatu zilizopita na hakumwambia mtu yeyote. Badala yake alikuwa akiangalia foleni ya maagizo.

IAM ilikuwa imewekwa. Vitambulisho vilikuwa sawa. Priya alikuwa na MFA kwa kila kitu. Timu ilihisi, kwa mara ya kwanza, kana kwamba walikuwa wakiwa na uwajibikaji kidogo. Lakini uwajibikaji haukutatua tatizo ambalo Maya alikuwa akilitazama: nambari kwenye dashibodi ya maagizo zikipanda wakati laini ya CPU ikipanda pamoja nazo.

Programu ya Nimbus ilikuwa ikiendesha kwenye tukio ambalo Leo alikuwa amelizindua bila kufikiri juu yake — lile alilo"lisambaza mahali fulani" kabla mtu yeyote hajajua Region ilikuwa nini.

Hilo lilikuwa sawa kwa kuwaonyesha wawekezaji onyesho. Halikuwa sawa wakati Maya alipobonyeza "zindua" na usajili mia mbili ulipoingia wiki ya kwanza — migahawa arobaini na saba ikipokea maagizo kikamilifu kila siku. Tukio la Leo lililoboreshwa kwa haraka sasa lilikuwa likishughulikia maagizo halisi, menyu halisi, na wateja halisi — mashine iliyochaguliwa kwa bahati mbaya, iliyopimwa ukubwa kwa chaguomsingi, iliyosanidiwa na mtu aliyekuwa akijifunza AWS akiandika.

"Tunahitaji seva," Maya alisema. "Halisi. Moja ambayo mtu fulani aliichagua kwa makusudi."

Tom alitazama grafu ya CPU. Laini ilionekana kutoka ng'ambo ya chumba.

Hapo ndipo walipoanza kuangalia inamaanisha nini kwa kweli kukodisha kompyuta.

**Uondoaji Ambao Hakuna Anayeueleza**

Watu wanaposema programu yao "inaendesha kwenye wingu," kwa kawaida wanamaanisha inaendesha kwenye
mashine pepe — kompyuta ambayo haipo kimwili kama maunzi yaliyojitolea,
lakini ambayo inafanya kwa kila njia kana kwamba ipo.

Hapa kuna utaratibu.

Seva halisi katika kituo cha data cha AWS ina rasilimali nyingi: cores za CPU, kumbukumbu, diski,
na kipimo data cha mtandao. AWS huichukua seva hiyo halisi na kuigawanya kwa kutumia programu
inayoitwa **hypervisor** — programu inayofanya kama msimamizi wa jengo, ikigawanya
rasilimali za seva halisi miongoni mwa wapangaji wengi pepe. Hypervisor huunda
mashine nyingi pepe, kila moja ikionekana kuwa na CPU yake mwenyewe iliyojitolea, kumbukumbu, na
diski — lakini kwa kweli zikishiriki maunzi halisi yaliyo chini.

Fikiri kama kukodisha ghorofa katika jengo kubwa, badala ya kununua nyumba.

Mmiliki wa jengo (AWS) hudumisha muundo halisi — mabomba, umeme,
usalama. Unapata kitengo. Unakipamba jinsi unavyotaka. Unalipa kila mwezi (au
kila saa). Unapohitaji nafasi zaidi, unahamia kwenye kitengo kikubwa zaidi. Unapohama,
unaacha kulipa.

Kila moja ya ukodishaji huo wa mashine pepe ndicho AWS inakiita **EC2 instance** — Elastic
Compute Cloud.

EC2 inasimama kwa Elastic Compute Cloud. Sehemu ya "elastic" ni muhimu, na tutafika
kwayo. Kwa sasa: tukio la EC2 ni kompyuta unayoikodisha kwa saa. Lina mfumo wa
uendeshaji, muunganisho wa mtandao, na nguvu ya kompyuta. Linaendesha programu yako kama vile
seva halisi ingefanya.

**Kuchagua Tukio Lako: Ukubwa ni Muhimu**

Si matukio yote ya EC2 yanafanana. AWS hutoa mamia ya aina za matukio, zilizopangwa
katika familia kulingana na yale yaliyoboreshwa kwayo.

**Madhumuni ya jumla** (mfano, `t3`, `m6i`): CPU na kumbukumbu zilizolingana. Chaguo zuri la chaguomsingi
kwa programu nyingi za wavuti. Familia ya `t3` inaweza kupasuka — inakusanya mikopo ya CPU
wakati wa vipindi vya matumizi ya chini na kuitumia wakati wa mlipuko. Nzuri kwa mazingira ya
maendeleo na mizigo yenye mahitaji ya CPU yanayobadilika. Familia ya `m6i` hutoa
utendaji thabiti, usio wa kupasuka — bora kwa mizigo ya uzalishaji yenye mahitaji endelevu ya CPU.

**Iliyoboreshwa kwa kompyuta** (mfano, `c7g`): CPU zaidi ikilinganishwa na kumbukumbu. Nzuri kwa
usimbaji wa video, uigaji wa kisayansi, uchakataji wa kundi. Kiambishi "g" katika `c7g` kinamaanisha
tukio hutumia vichakataji vya AWS Graviton — chipsi za msingi-wa-ARM ambazo AWS iliziunda ndani,
zikitoa bei-kwa-utendaji bora kwa mizigo mingi kuliko matukio yanayolingana ya x86.

**Iliyoboreshwa kwa kumbukumbu** (mfano, `r7i`): Kumbukumbu zaidi ikilinganishwa na CPU. Nzuri kwa hifadhidata,
akiba, uchanganuzi wa ndani-ya-kumbukumbu. Ikiwa unaendesha hifadhidata ambapo utendaji unaboreka
sana kwa kuweka data zaidi katika RAM, familia ya R ndiyo nukta sahihi ya kuanzia.

**Iliyoboreshwa kwa hifadhi** (mfano, `i3`): Hifadhi ya kienyeji ya kasi ya juu. Nzuri kwa mizigo yenye
data nyingi inayohitaji I/O ya diski ya haraka sana. Hifadhi ya kienyeji ya NVMe kwenye matukio haya ni
ya haraka zaidi kwa kiasi kikubwa kuliko EBS — lakini pia ni ya muda mfupi. Itumie kwa data ya muda,
si kwa chochote ambacho huwezi kustahimili kukipoteza.

**Kompyuta iliyoharakishwa** (mfano, `p4`): GPU zilizoambatanishwa. Nzuri kwa mafunzo ya kujifunza
kwa mashine na utoaji wa michoro. Matukio haya ni ghali — `p3.8xlarge` linagharimu
zaidi ya dola 12 kwa saa — lakini kwa mizigo inayonufaika kutokana na ulinganifu wa GPU, hakuna
mbadala.

Kila familia ina ukubwa. `t3.micro` ina CPU pepe 2 na kumbukumbu ya GB 1. `t3.xlarge`
ina CPU pepe 4 na GB 16. `t3.2xlarge` huongeza maradufu tena. Muundo wa
majina ni thabiti: kiambishi huendelea `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, na zaidi.

Leo alikuwa amechagua `t3.micro`.

"`t3.micro` inaweza kushughulikia watumiaji wangapi?" Tom aliuliza. "Na kubwa zaidi inagharimu zaidi kiasi gani?"

"Inategemea programu," Leo alisema. "Lakini pengine si watumiaji mia moja kwa wakati mmoja
wakiendesha upakiaji wa picha na hoja za hifadhidata."

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza, akiangalia ukurasa wa ulinganisho wa aina za matukio.

Leo alifungua ukurasa wa bei wa AWS. t3.micro iligharimu takriban dola 8 kwa mwezi. t3.small ilikuwa dola 17. t3.medium ilikuwa dola 33. t3.large ilikuwa karibu dola 60. Pengo lilipanuka kwa haraka kadiri ulivyopanda — si kwa mstari, bali takriban kuongeza maradufu kwa kila hatua ya ukubwa. Tom aliandika nambari, akigundua kwamba kila hatua ya ukubwa iliongeza maradufu kumbukumbu — lakini, kwa kushangaza, si idadi ya CPU. Kila t3 kutoka micro hadi large ilikuwa na vCPU 2 zile zile; idadi haikuongezeka hadi xlarge. Kilichokua kwa kila hatua kilikuwa **msingi wa mkopo wa CPU** — sehemu ya vCPU hizo ambayo tukio lingeweza kutumia kuendelea bila kuchoma mikopo yake ya mlipuko.

Tom aliandika "t3.micro" kwenye ubao mweupe na akachora uso wa huzuni karibu nayo.

**Mazungumzo ya Kupima Ukubwa Sahihi**

t3.micro ilidumu takriban mwezi mmoja kabla trafiki ya usiku wa Ijumaa haijaiponda. Leo aliboresha kwa haraka — moja kwa moja hadi t3.large, akihoji kwamba kubwa mno ilikuwa salama zaidi kuliko ndogo. Wiki mbili baada ya kuhamia t3.large, Tom alionyesha kitu.

"CPU iko kwa asilimia 9," alisema. "Wastani. Katika siku saba zilizopita."

Leo aliangalia grafu ya CloudWatch. CPU ya wastani ya asilimia 9. Vilele vya labda asilimia 35 wakati wa chakula cha jioni cha Ijumaa. Muda mwingine wote: ikitikisika kidogo tu.

"Tunaendesha seva ya dola-60-kwa-mwezi," Tom alisema, "kwa asilimia 9 ya uwezo wake."

"Lakini vipi kuhusu vilele vya Ijumaa?" Leo alisema. "Tunahitaji nafasi ya juu."

"Vilele vya Ijumaa hufika asilimia 35," Tom alisema. "t3.small ina vCPU mbili zile zile — kinachopungua ni msingi wa mkopo, takriban asilimia 20 endelevu. Tunafanya wastani wa asilimia 9. Hiyo inamaanisha tungekuwa tukiweka benki mikopo ya CPU mchana kutwa, kila siku, na kutumia baadhi yao kwa masaa machache usiku wa Ijumaa. Nilikagua hesabu ya `CPUCreditBalance` — salio halikaribii kamwe kukauka. Ni dola 17 kwa mwezi. Tuna nafasi ya juu."

Leo aliangalia nambari. Aliangalia grafu. Alihisi usumbufu wa mhandisi aliyetoa rasilimali kupita kiasi na anajua.

"Lakini vipi ikiwa tutapata mlipuko?" alisema.

"Basi vipimo vitatuambia kabla haijaumiza," Priya alisema. "Na hatimaye tutaweka Auto Scaling — hiyo ndiyo haswa inayotumika kwa hilo. Hutahitaji kutoa rasilimali kwa mlipuko kwa mkono mara mfumo unapoweza kuongeza matukio kiotomatiki."

Walipunguza hadi t3.small. Bili ya kila mwezi ilishuka kwa dola 40. Katika mwaka, hiyo ilikuwa dola 480 — si chochote, hasa kwa startup. Tom aliiandika kwenye lahajedwali lake kwa kuridhika kwa kimya kwa mtu aliyekuwa akisubiri kufanya hoja hii kwa wiki mbili.

Muundo huu una jina: **kupima ukubwa sahihi** (right-sizing). Inamaanisha kulinganisha ukubwa wa tukio na mzigo halisi, si hali mbaya zaidi inayofikiriwa. Zana za AWS kama AWS Compute Optimizer na vipimo vya CloudWatch hufanya kupima ukubwa sahihi kuwa uamuzi unaoendeshwa na data badala ya kukisia.

**AMI: Hali ya Kuanzia ya Mashine Yako**

Kabla ya kuzindua tukio la EC2, unachagua mfumo wake wa uendeshaji na usanidi wa
awali. Katika AWS, hii inaitwa **Amazon Machine Image** (AMI).

AMI ni kiolezo. Inafafanua:

- Mfumo wa uendeshaji (Amazon Linux, Ubuntu, Windows Server, n.k.)
- Programu zilizosakinishwa awali
- Hali ya awali ya diski

Unapozindua tukio kutoka AMI, AWS huunda nakala mpya ya kiolezo hicho
kwa ajili yako tu. Unaweza pia kuunda AMI zako mwenyewe — ukisanidi seva haswa
jinsi unavyoitaka, unaweza "kuhifadhi" hali hiyo kama AMI ya desturi na kuitumia kuzindua
seva zinazofanana kwa haraka. Hivi ndivyo unavyosambaza mazingira thabiti kwa kiwango kikubwa.

Fikiri AMI kama mapishi. Mapishi yanaelezea chakula. Kila wakati unapofuata
mapishi, unapata chakula kile kile. Ukitaka kubadilisha chakula kabisa, unasasisha
mapishi.

AWS hutoa soko la AMI — baadhi zinadumishwa na AWS (Amazon Linux 2, Amazon
Linux 2023), baadhi zinadumishwa na usambazaji mkubwa wa Linux (Ubuntu, Red Hat, SUSE),
na baadhi zinatoka kwa wauzaji wa watu wa tatu (seva za hifadhidata zilizosanidiwa awali, vifaa
vya usalama, programu za kibiashara). Kwa programu nyingi za wavuti, Amazon
Linux AMI inayodumishwa na AWS au Ubuntu LTS AMI ndiyo nukta sahihi ya kuanzia.

Kwa Nimbus, Leo alijenga AMI ya desturi iliyoanza kutoka msingi wa hivi karibuni wa Amazon Linux 2023
na akaongeza muda wa kuendesha wa Node.js, utegemezi wa mfumo wa programu, na faili ya
huduma iliyoundwa awali kwa mchakato wa programu. Matukio mapya yaliyozinduliwa kutoka AMI hii yalianza
kuhudumia trafiki ndani ya sekunde 90 — kwa haraka zaidi kwa kiasi kikubwa kuliko muda wa kuwasha wa
dakika nne wakati wa kutumia skripti za UserData kusakinisha kila kitu kutoka mwanzo.

Kuna uwiano wa biashara: AMI za desturi zinahitaji kudumishwa. Kila wakati unaposasisha utegemezi
wa mfumo au toleo la muda wa kuendesha, unahitaji kujenga upya AMI. Timu zinazoacha AMI zao
kuwa za zamani hujikuta zikiendesha matukio yenye programu za zamani — hatari ya
usalama. Priya aliweka "jenga upya AMI na vifurushi vya hivi karibuni" kwenye orodha ya uhandisi ya kila mwezi.

"Inagharimu kiasi gani kuhifadhi AMI?" Tom aliuliza.

AMI huhifadhiwa kama snapshots za EBS — unalipa kiwango cha snapshot ya EBS (takriban dola 0.05
kwa GB kwa mwezi) kwa ukubwa wa AMI. Amazon Linux AMI ya kawaida yenye stack ya programu ya
Nimbus iligharimu takriban GB 4. Kwa dola 0.05/GB: dola 0.20 kwa mwezi kwa kila AMI. Kuweka AMI tano
za kihistoria kwa madhumuni ya kurudisha nyuma: dola 1/mwezi. Si gharama yenye maana.

**UserData: Skripti ya Bootstrap**

Kuna chaguo moja zaidi la usanidi kwenye EC2 ambalo Leo aligundua alipokuwa akijaribu kuepuka kujenga AMI mpya kila wakati msimbo wa programu ulipobadilika.

Unapozindua tukio la EC2, unaweza kutoa **skripti ya UserData** — skripti ya shell inayoendesha kiotomatiki tukio linapoanza kwa mara ya kwanza. Inaendesha kama root, kabla tukio halijachukuliwa kuwa "tayari."

Kwa Nimbus, skripti ya UserData ilionekana kama hivi:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Skripti hiyo husakinisha Node.js, huvuta msimbo wa hivi karibuni wa programu, husakinisha utegemezi, na huanzisha huduma ya programu. Kila tukio jipya linalozindua kutoka AMI ya msingi huendesha skripti hii na hutokea likiwa na toleo la sasa la programu likiwa limesakinishwa — kiotomatiki.

Mbinu hii inamaanisha AMI hubaki rahisi (OS ya msingi tu), na UserData hushughulikia usanidi wa programu. Uwiano wa biashara: skripti za UserData huchukua muda kuendesha. Tukio linaweza kuchukua dakika tatu hadi tano kuwasha na kuwa tayari. Kwa programu ambapo muda wa kuanza ni muhimu — kwa Auto Scaling, ambapo unahitaji matukio mapya kuwa tayari kwa haraka — kuoka programu mapema katika AMI ya desturi hupunguza muda wa kuwasha kwa kiasi kikubwa.

"Itakuwa sawa," Leo alisema, Priya alipouliza kuhusu muda wa kuwasha.

"Muda wa kuwasha ni nini?" aliuliza.

"Dakika nne."

"Na wakati wa dakika hizo nne, tukio linaendesha lakini halihudumii trafiki?"

"Ndiyo."

"Kwa hivyo wakati wa mlipuko wa trafiki wa ghafla, tungeweza kuwa na dakika nne ambapo matukio mapya bado hayasaidii?"

Leo aliangalia skripti yake ya UserData. Alianza kuangalia jinsi ya kujenga AMI ya desturi.

**Key Pairs: Njia Sahihi ya Kufikia Seva**

Kumbuka janga la "Admin123" kutoka sura iliyopita?

Njia sahihi ya kuingia kwenye tukio la EC2 ni kwa **key pair** (jozi ya funguo).

Key pair ni jozi ya kificho: ufunguo wa umma (uliohifadhiwa na AWS kwenye seva) na
ufunguo wa faragha (faili unayoipakua na kuiweka siri). Kuingia, unatumia SSH — itifaki
salama — na ufunguo wako wa faragha. Hakuna nenosiri. Ukipoteza ufunguo wa faragha,
unapoteza ufikiaji. Hakuna "nimesahau nenosiri langu" kwa SSH.

Hili ni muhimu kwa sababu key pairs ni:

- Za kipekee kwako
- Haziwezekani kukisiwa kwa kificho
- Hazihifadhiwi na AWS (unaweka ufunguo wa faragha)
- Rahisi kufuta (futa ufunguo kutoka seva, zalisha jozi mpya)

Priya alikuwa tayari ameweka ufikiaji wa msingi-wa-ufunguo kwenye seva ya Nimbus. Seva ya Admin123
ilikuwa imefutwa kazi. Hakuna aliyehuzunika kuhusu hilo.

"Na vipi ikiwa mtu atajaribu kuingia kwa nguvu na kukamata key pair ikiwa safarini?" Priya aliuliza. Alikuwa tayari amebaini jibu: ufunguo wa faragha hausafiri kamwe kupitia mtandao. Unaupakua mara moja. Unauweka kienyeji. Hauondoki kamwe mashine yako.

**Kinachotokea Ukipoteza Key Pair**

Leo aliuliza swali hili wiki ya tatu, kwa nishati mahususi ya mtu ambaye bado hajapoteza key pair yake lakini anafikiri juu yake.

"Nikipoteza faili ya ufunguo wa faragha, kinachotokea ni nini?"

"Unapoteza ufikiaji wa SSH kwa tukio," Priya alisema.

"Kabisa?"

"Si lazima. Lakini mchakato wa urejeshaji ni wa kuchukiza."

Mchakato wa urejeshaji: simamisha tukio, tenganisha sauti yake ya msingi ya EBS, iambatanishe na tukio tofauti ambalo *una* ufikiaji nalo, weka sauti, ongeza ufunguo mpya wa umma kwenye faili ya `authorized_keys` kwenye sauti iliyowekwa, itenganishe na uiambatanishe tena na tukio asili, anzisha upya.

Hii inafanya kazi. Inachukua dakika thelathini hadi sitini na inahitaji utekelezaji wa makini. Hatua moja isiyo sahihi na unaweza kufanya mambo kuwa mabaya zaidi.

Mbadala, ikiwa programu yako haihifadhi chochote muhimu kwenye sauti ya msingi (kwa sababu umekuwa ukifuata ushauri katika kitabu hiki na kuhifadhi data katika S3 na EBS): simamisha tukio na uzindue jipya kutoka AMI. Zalisha key pair mpya unapofanya hivyo.

"Hifadhi ufunguo wa faragha mahali salama," Priya alisema. "Na kamwe kwenye tukio la EC2."

Leo aliangalia folda yake ya desktop yenye lebo `AWS_keys`. Kisha akamtazama Priya. Kisha akahamisha folda kwenye msimamizi wake wa manenosiri uliosimbwa.

**Security Groups: Firewall ya Tukio Lako**

Tukio la EC2 linapozinduliwa, linahitaji **security group** — firewall pepe inayodhibiti ni trafiki gani ya mtandao inaweza kulifikia na ni trafiki gani linaweza kutuma nje.

Security group ina seti mbili za sheria: **inayoingia** (trafiki inayoingia) na **inayotoka** (trafiki inayotoka).

Kwa chaguomsingi, security group mpya huzuia trafiki yote inayoingia na huruhusu trafiki yote inayotoka. Unaongeza sheria za inayoingia kufungua bandari mahususi kwa vyanzo mahususi.

Kwa seva ya wavuti ya Nimbus, Priya alisanidi:

- Ruhusu TCP bandari 443 (HTTPS) kutoka `0.0.0.0/0` (mtandao mzima)
- Ruhusu TCP bandari 80 (HTTP) kutoka `0.0.0.0/0` (iliyoelekezwa kwa 443 katika programu)
- Ruhusu TCP bandari 22 (SSH) kutoka anwani ya IP ya ofisi pekee — si kutoka mtandao

"Subiri — lakini *kwa nini* tungezuia SSH kwa IP ya ofisi pekee?" Maya aliuliza.

"Kwa sababu ikiwa SSH iko wazi kwa mtandao mzima," Priya alisema, "boti otomatiki zitagonga bandari 22 zikijaribu michanganyiko ya vitambulisho saa ishirini na nne kwa siku. Kumbukumbu zetu zitajaa majaribio yaliyoshindwa. Na ikiwa kuna udhaifu wowote katika daemon ya SSH yenyewe, kila mshambuliaji duniani anaweza kujaribu kuutumia vibaya."

"Lakini vipi ikiwa Leo anahitaji kuingia kutoka nyumbani?"

"VPN," Priya alisema.

Leo alikuwa tayari na VPN iliyowekwa. Alikuwa na sura ya mtu aliyekuwa ameulizwa swali hili awali.

Hifadhidata bado iliishi kwenye mashine ile ile kama programu — lakini Priya aliandaa security group tofauti kwa siku ambayo isingeishi: bandari ya hifadhidata iliyo wazi kwa trafiki kutoka security group ya seva ya wavuti pekee — si kutoka mtandao, si kutoka SSH (kwa ufikiaji wa moja kwa moja wa DB), si kutoka mahali pengine popote. Wakati huo huo, alihakikisha security group ya tukio linaloshirikiwa haifichui bandari ya hifadhidata kwa mtandao kabisa. Hifadhidata ingekuwa isiyoonekana kwa kila kitu isipokuwa programu iliyoihitaji.

Kufikia hifadhidata moja kwa moja, mshambuliaji angehitaji kuhatarisha seva ya wavuti kwanza. Hiyo ilikuwa safu ya kwanza ya ulinzi.

"Na safu ya pili?" Tom aliuliza.

"Uthibitishaji wa IAM kwa hifadhidata. Na usimbaji safarini."

Aliongeza zote kwenye orodha ya usanidi.

**Metadata ya Tukio la EC2 na IMDSv2**

Kuna kipande kimoja zaidi cha usalama wa EC2 kinachojalisha katika vitendo, hata kama mara chache hueleweka katika maudhui ya utangulizi.

Wakati programu inaendesha kwenye tukio la EC2, inaweza kuuliza nukta maalum ya ndani ya mwisho katika `http://169.254.169.254/latest/meta-data/` kupata taarifa kuhusu tukio: kitambulisho cha tukio, Region yake, availability zone yake, na — muhimu — vitambulisho vya muda vya IAM vinavyohusiana na Jukumu lolote la IAM lililoambatanishwa.

Hivi ndivyo programu kwenye tukio la EC2 huita huduma za AWS bila kuwa na vitambulisho vilivyowekwa kwa nguvu. Inauliza huduma ya metadata: "Ni vitambulisho gani nipaswa kutumia sasa hivi?" Huduma ya metadata hurudisha vitambulisho vya muda vinavyoisha na kuzunguka kiotomatiki.

Tatizo la usalama: matoleo ya zamani ya huduma hii ya metadata (IMDSv1) yangejibu ombi lolote kutoka mchakato wowote kwenye tukio. Ikiwa programu ilikuwa na udhaifu wa uombaji wa upande wa seva (SSRF) — hitilafu ambapo mshambuliaji angeweza kufanya seva kuleta URL ya uchaguzi wa mshambuliaji — mshambuliaji angeweza kutumia udhaifu huo kuleta `http://169.254.169.254/latest/meta-data/iam/security-credentials/` na kupata vitambulisho vya IAM vya tukio.

Shambulio hili limetumika katika uvunjaji halisi.

**IMDSv2** (Instance Metadata Service version 2) hurekebisha hili kwa kuhitaji tokeni ya kikao kabla huduma ya metadata haijajibu. Tokeni hupatikana kupitia ombi la PUT. Mashambulio ya SSRF, ambayo kwa kawaida hutumia maombi ya GET, hayawezi kukamilisha hatua ya PUT — kwa hivyo hayawezi kupata tokeni, na metadata hairudishwi.

"Je, tuwezeshe IMDSv2?" Leo aliuliza.

"Ni chaguomsingi kwa matukio mapya sasa," Priya alisema. "Lakini kwa matukio yaliyopo, lazima ujiunge."

Aliiwezesha kwenye matukio yote yaliyopo ya Nimbus mchana ule.

**Mzunguko wa Maisha wa Tukio: Si Milele**

Hili ni kitu ambacho waanzilishi wengi hukosa.

Matukio ya EC2 si ya kudumu kwa chaguomsingi. Unaposimamisha tukio, rasilimali ya
kompyuta huachiliwa. Unapolianzisha tena, linaweza kuendesha kwenye maunzi halisi
tofauti. Data yoyote iliyohifadhiwa *kwenye tukio lenyewe* (kwenye sauti yake ya msingi) huokoka
mzunguko wa kusimamisha/kuanzisha — lakini anwani ya IP ya umma hubadilika.

Unapo*futa* (terminate) tukio, limekwisha. Isipokuwa una hifadhi tofauti iliyoambatanishwa
(tunaifunika katika Sura ya 6), data yoyote kwenye tukio hupotea.

Hali nne ambazo tukio la EC2 linaweza kuwa nazo:

**Pending**: Tukio linaanza. Limepewa maunzi lakini halijamaliza
kuwasha. Skripti ya UserData inaendesha.

**Running**: Tukio liko hai na linaweza kufikiwa. Unalilipia.

**Stopping/Stopped**: Tukio limezimwa. Sauti ya msingi ya EBS imehifadhiwa.
Hulipi kompyuta, lakini bado unalipia hifadhi ya EBS iliyoambatanishwa.

**Shutting-down/Terminated**: Tukio linafutwa. Isipokuwa umesanidi
sauti za EBS kudumu, data yao imekwisha.

"Umuda mfupi" huu kwa kweli ni kipengele, si hitilafu. Inamaanisha unaweza kuwasha
seva, kuzitumia, na kuzitupa. Inawezesha upanuzi wa kiusawa. Lakini pia
inamaanisha hupaswi kamwe kuhifadhi data muhimu *kwenye* tukio la EC2 lenyewe.

Data inaishi wapi, basi?

Katika hifadhi tofauti. Tunafika kwa hilo katika sura mbili zinazofuata.

Pengine unajiuliza: ikiwa tukio hupata anwani mpya ya IP kila linapoanza upya, programu yako huwekaje anwani thabiti? AWS ina suluhisho linaloitwa Elastic IP — IP ya umma tuli unayoimiliki na inayobaki ile ile hata baada ya kuanza upya. Dokezo kuhusu gharama: tangu Februari 2024, AWS hutoza ada ndogo ya kila saa kwa kila anwani ya IPv4 ya umma — Elastic IPs (zilizoambatanishwa au la) na IP za umma zilizopewa kiotomatiki kwenye matukio sawa. IPv4 ya umma si ya bure tena, ambayo ni sababu moja zaidi ya kuweka matukio katika subnets za faragha nyuma ya kisawazisha mzigo.

Kwa programu zilizo nyuma ya kisawazisha mzigo — ambao ndio usanifu sahihi kwa programu yoyote
ya wavuti ya uzalishaji — huhitaji Elastic IPs kabisa. Watumiaji huunganisha kwa
jina la DNS thabiti la kisawazisha mzigo. Kisawazisha mzigo huunganisha kwa matukio kwa anwani zao
za IP za faragha ndani ya VPC. Matukio yanaweza kuja na kuondoka, kupata IP mpya, kupanuka
ndani na nje — kisawazisha mzigo hushughulikia yote kwa uwazi. Elastic IPs ni kwa
matumizi mahususi: seva ambayo wateja huunganisha nayo moja kwa moja kwa IP, bastion host
yenye anwani thabiti, programu isiyo nyuma ya kisawazisha mzigo kwa sababu
fulani mahususi.

Leo awali alipanga kutumia Elastic IPs kwa seva za wavuti za Nimbus. Priya alionyesha
kwamba kwa kisawazisha mzigo, anwani za IP za seva za wavuti hazikuwa za maana kwa
wateja wa nje. Kisawazisha mzigo kilikuwa na jina la DNS thabiti. Matukio yaliyo nyuma yake
yalikuwa ya kutupwa kwa ubunifu.

"Kwa hivyo Elastic IPs ni kwa istisna, si sheria," Leo alisema.

"Sahihi," Priya alisema. "Na ukijiona ukitafuta moja, uliza kama
usanifu unapaswa kuwa na kisawazisha mzigo badala yake."

**"Elastic" Inamaanisha Nini**

Tulisema EC2 inasimama kwa Elastic Compute Cloud. Ni nini cha elastic kuhusu hilo?

Vitu viwili:

**Unyumbufu wa kiwima**: Unaweza kubadilisha ukubwa wa tukio. Simamisha tukio,
libadilishe kutoka `t3.micro` hadi `t3.xlarge`, lianzishe upya. CPU na kumbukumbu zaidi, programu
ile ile, usanidi ule ule.

**Unyumbufu wa kiusawa**: Unaweza kuongeza matukio zaidi. Badala ya seva moja kubwa,
endesha seva kumi za kati nyuma ya kisawazisha mzigo. Trafiki inaposhuka, ondoa matukio
na uache kuyalipia.

Mbinu zote mbili husuluhisha tatizo la "seva moja, trafiki nyingi mno." Zina uwiano tofauti
wa biashara, ambao tunauchunguza katika Sura ya 7 tunapoongeza Auto Scaling kwenye hadithi.

Ufahamu muhimu: kwa EC2, nguvu ya kompyuta ni kitu *unachokizungusha* badala ya kitu
*unachokinunua*. Unahitaji zaidi? Zungusha kizungushi juu. Unahitaji kidogo? Kizungushe chini. Lipa ipasavyo.

Maya aliangalia jedwali la aina za matukio. "Ikiwa tunaweza tu kufanya seva kuwa kubwa zaidi, kwa nini tujisumbue na kumi za kati?"

"Kwa sababu," Leo alisema, "seva moja kubwa bado ni seva moja. Ikishuka, kila kitu hushuka. Seva kumi za kati zinamaanisha moja inaweza kushindwa na tisa zinaendelea kuendesha."

"Na," Priya aliongeza, "huwezi kufanya seva kuwa kubwa zaidi bila kuianzisha upya. Kumi ndogo zinamaanisha unaweza kuongeza zaidi bila kugusa zile zinazoendesha."

Tom alikuwa tayari ameandika "anzisha upya = kupungukiwa na huduma" kwenye daftari lake.

## Nguvu na Mapungufu

**Kwa nini EC2 ni yenye nguvu**:

- Udhibiti kamili. Unachagua OS, programu, usanidi. Ni kompyuta yako.
- Upimaji ukubwa unaonyumbulika. Mamia ya aina za matukio katika kila matumizi.
- Hakuna maunzi ya kusimamia. AWS hushughulikia safu halisi.
- Bili ya kila-sekunde, na kima cha chini cha sekunde 60, kwa Amazon Linux, Windows, na Ubuntu AMI. (Baadhi ya Linux AMI za kibiashara, kama RHEL na SUSE, bado hutoza kila saa — kagua masharti ya bili ya AMI.) Unasimamisha tukio, unaacha kulipa.
- Inafanya kazi na kila kitu. EC2 ni msingi ambao huduma nyingine nyingi za AWS zimejengwa juu yake.
- Mifano mingi ya bei (On-Demand, Reserved, Spot) huruhusu uboreshaji mkubwa wa gharama
  kwa mizigo inayotabirika au inayonyumbulika — imefunikwa kwa undani katika Sura ya 27.

**Ambapo inakuwa ngumu**:

- Unawajibika kupachika viraka na kusasisha mfumo wa uendeshaji. (Mfano wa Wajibu wa
  Pamoja — hii ni sehemu ya "katika wingu" iliyo yako.)
- Kupachika viraka kwa OS si hiari. Matukio ya EC2 yasiyopachikwa viraka ni mojawapo ya njia za
  shambulio za kawaida zaidi katika uvunjaji wa wingu. AWS Systems Manager Patch Manager inaweza kuotomatisha
  hili — lakini lazima uisanidi na kuifuatilia.
- Kusimamia EC2 kwa kiwango kikubwa kunamaanisha kusimamia hali ya tukio, AMI, viraka vya usalama, na
  mzunguko wa maisha katika mashine zinazoweza kuwa maelfu. Huo ni mzigo wa uendeshaji.
- EC2 si jibu sahihi kwa kila kitu. Kwa msimbo unaoendeshwa na matukio unaoendesha
  mara chache, Lambda (Sura ya 20) ni nafuu na rahisi zaidi. Kwa mizigo ya
  kontena, ECS na EKS (Sura ya 21) hutoa ufanisi bora wa rasilimali.
- Matukio yasiyotumika bado yanagharimu pesa. Ukisimamisha tukio, unaacha kulipia
  kompyuta — lakini ikiwa una hifadhi iliyoambatanishwa, bado unailipia.

**Uamuzi wa lini-usitumie-EC2**: EC2 hukupa udhibiti wa juu zaidi — lakini udhibiti una gharama ya uendeshaji. Kila tukio la EC2 unaloendesha ni kitu unachopaswa kupachika viraka, kufuatilia, na hatimaye kubadilisha. Kwa programu zinazoendesha mara chache (Lambda ni nafuu), kwa programu zinazohitaji kupanuka kiusawa hadi makumi au mamia ya matukio (kontena ni bora zaidi), au kwa hifadhidata na mizigo mingine inayodhibitiwa (RDS, ElastiCache), huduma zinazodhibitiwa kikamilifu huondoa mzigo mkubwa wa uendeshaji kwa nyongeza ya gharama ya wastani. EC2 ni chaguo sahihi unapohitaji udhibiti inaotoa — si kwa chaguomsingi.

Priya alikuwa na kanuni ya kidole: "Ikiwa tungeridhika na huduma inayodhibitiwa inayofanya tunachohitaji, tumia huduma inayodhibitiwa. Tumia EC2 wakati chaguo linalodhibitiwa halipo au halifai."

Leo awali alipinga hili. "Lakini EC2 hutupa chaguzi zaidi."

"Chaguzi ni mzigo," Priya alisema. "Hatuhitaji kila chaguo. Tunahitaji usanidi sahihi, unaodumishwa kwa uaminifu."

**EC2 Placement Groups: Kudhibiti Wapi Matukio Yanakwama**

EC2 hukupa udhibiti wa kile tukio lako lilivyo — ukubwa wake, OS yake, usanidi wake. Pia hukupa udhibiti mdogo wa *wapi* linakwama kimwili, kupitia kipengele kinachoitwa **placement groups**.

Kwa chaguomsingi, AWS hueneza matukio katika maunzi halisi kuongeza upatikanaji. Lakini kwa mizigo fulani, unataka kupuuza chaguomsingi hicho — ama kupata matukio karibu pamoja zaidi, au kuhakikisha yanabaki mbali.

Aina tatu za placement group:

**Cluster**: Hufunga matukio karibu pamoja ndani ya Availability Zone moja, kwa kawaida kwenye rafu ile ile halisi au maunzi yaliyo karibu. Matokeo ni latensi ya chini zaidi ya mtandao na kipimo data cha juu zaidi cha mtandao kati ya matukio katika kundi — na kipimo data cha mtandao cha Gbps 10 au zaidi kati ya matukio (usikichanganye na Enhanced Networking/ENA, ambacho ni kipengele cha mtandao cha kila tukio kisichotegemea placement groups). Hili ni chaguo kwa HPC (kompyuta ya utendaji wa juu), kazi za mafunzo ya ML za kiwango kikubwa, na mizigo ya sambamba iliyounganishwa kwa karibu ambapo matukio hutumia muda mwingi kutuma data kwa kila mmoja. Uwiano wa biashara ni upatikanaji: ikiwa sehemu ya maunzi iliyo chini itashindwa, matukio yote katika cluster yanaweza kuathiriwa kwa wakati mmoja.

**Partition**: Hugawanya matukio katika sehemu za kimantiki, ambapo kila sehemu hukaa kwenye seti yake ya maunzi — rafu tofauti, umeme tofauti, swichi tofauti za mtandao. Matukio ndani ya sehemu hushiriki maunzi na kila mmoja, lakini sehemu hazishiriki kamwe maunzi na sehemu zingine. Ubunifu huu huzuia eneo la mlipuko la kushindwa kwa maunzi: rafu inayoshuka huathiri sehemu moja lakini si zingine. Placement groups za partition zimejengwa kwa mizigo mikubwa iliyotapakaa na kunakiliwa — Apache Hadoop, Apache Cassandra, Apache Kafka — ambapo unataka utengaji wa hitilafu wa kutosha kiasi kwamba kushindwa kwa kiwango cha rafu hakuangushi cluster yako yote.

**Spread**: Huweka kila tukio kwenye maunzi yaliyo chini yaliyotengwa kabisa. Utengaji wa juu zaidi kati ya matukio. Ikiwa una matukio matano muhimu ya programu ambayo hayapaswi kamwe kushiriki mwenyeji halisi (kwa sababu kushindwa kwa maunzi kumoja hakupaswi kamwe kuangusha zaidi ya moja), Spread ni jibu. Kikomo: **matukio 7 kwa kila Availability Zone kwa kila placement group**. Spread imebuniwa kwa idadi ndogo ya matukio muhimu ambayo hayawezi kuvumilia kuwekwa pamoja, si kwa meli kubwa.

"Kwa hivyo Cluster ni kwa kasi, Spread ni kwa utengaji, na Partition ni kwa mifumo iliyotapakaa inayohitaji baadhi ya kuunganishwa na baadhi ya utengaji?" Maya aliuliza.

"Karibu vya kutosha," Priya alisema. "Cluster: latensi ya chini kati ya matukio, hatari moja kubwa. Spread: utengaji wa juu zaidi, kikomo kigumu cha saba kwa kila AZ. Partition: utengaji uliopangwa kwa mifumo mikubwa iliyotapakaa — unadhibiti ni sehemu gani kila tukio linaingia."

Kwa usanifu wa sasa wa Nimbus, hakuna kati ya hizi zilizotumika bado. Lakini kujua zilikuwepo kulimaanisha kujua lini wa kuzifikia — na haraka zaidi, kujua swali la mtihani kuhusu "mizigo ya HPC inayohitaji latensi ya chini kati ya nodi" lilikuwa likiuliza nini hasa.

## Muhtasari

Tukio lililozinduliwa kwa bahati mbaya halikuwa litakuwa seva ya uzalishaji kamwe. Kuelewa EC2 ipasavyo hakukusuluhisha tu tatizo la uwezo — kuliingiza seti mpya ya dhana ambazo zingejitokeza katika karibu kila sura inayofuata. Aina za matukio, AMI, key pairs, security groups, na kupima ukubwa sahihi si mambo madogo ya EC2; ni msamiati ambao sehemu iliyobaki ya kitabu imejengwa juu yake. Yajifunze hapa na kila kitu kingine kinaleta maana zaidi.

- **Tukio la EC2** ni mashine pepe unayoikodisha katika AWS. Aina za matukio zimepangwa kwa matumizi: madhumuni ya jumla, iliyoboreshwa kwa kompyuta, iliyoboreshwa kwa kumbukumbu, iliyoboreshwa kwa hifadhi. Chagua familia sahihi na upime ukubwa sahihi kwa vipimo halisi vya mzigo — si hali mbaya zaidi inayofikiriwa.
- **AMI** (Amazon Machine Image) ni kiolezo cha OS na usanidi wa awali wa tukio lako. AMI za desturi huwezesha usambazaji thabiti, unaorudiwa.
- **Key pairs** ni njia salama ya kufikia matukio ya EC2. **Security groups** ni firewall ya tukio lako — zuia SSH kwa IP zinazojulikana na funga bandari za hifadhidata kwa security group ya programu pekee.
- **IMDSv2** inapaswa kuwezeshwa kwenye matukio yote kulinda dhidi ya wizi wa vitambulisho wa msingi-wa-SSRF kutoka huduma ya metadata ya tukio.
- Matukio ya EC2 si ya kudumu kwa chaguomsingi. Matukio yaliyofutwa hupoteza data yao ya kienyeji — hifadhi data muhimu katika S3 au EBS, si kwenye diski ya tukio.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03 3 — Kazi 3.2 (suluhisho za kompyuta zenye utendaji wa juu)*

- **Wajibu wa Pamoja kwa EC2**: Unawajibika kupachika viraka OS.
  AWS hudumisha maunzi halisi na hypervisor. Hii ni tofauti inayojaribiwa
  mara kwa mara.
- **Familia za matukio ni muhimu kwa maswali ya mazingira.** Ikiwa mazingira yanataja mahitaji ya juu
  ya kumbukumbu (akiba ya ndani-ya-kumbukumbu, SAP HANA), jibu pengine linahusisha
  tukio lililoboreshwa kwa kumbukumbu. Ikiwa yanataja uchakataji wa kundi au HPC, lililoboreshwa kwa kompyuta.
- **Kusimamisha ≠ Kufuta.** Kusimamisha tukio huhifadhi (unaweza kuanzisha upya).
  Kufuta hulifuta. Mazingira ya mtihani hujaribu kama unajua tofauti hii.
- **IP ya umma hubadilika wakati wa kuanzisha upya.** Ikiwa programu yako inahitaji anwani thabiti ya IP,
  tumia **Elastic IP** — IP ya umma tuli inayobaki imehusishwa na akaunti yako.
  Tangu Februari 2024, AWS hutoza kila anwani ya IPv4 ya umma kila saa — Elastic IPs
  (zilizoambatanishwa au la) na IP za umma zilizopewa kiotomatiki sawa.
- **Mifano ya bei ya On-Demand, Reserved, na Spot** hujaribiwa kwa wingi katika Kikoa 4.
  Tunaifunika katika Sura ya 27. Kwa sasa, jua kwamba On-Demand inamaanisha kulipa kila sekunde
  bila ahadi.
- **Security groups ni za hali (stateful).** Ukiruhusu trafiki inayoingia kwenye bandari, trafiki
  inayorudi huruhusiwa kiotomatiki bila sheria wazi ya kutoka. NACL
  (zimefunikwa katika Sura ya 15) hazina hali (stateless) — zinahitaji sheria za kuingia na kutoka zote mbili.
- **Placement Groups:** Cluster = latensi ya chini zaidi kati ya matukio (HPC, mafunzo ya ML — lakini hatari ya nukta-moja-ya-kushindwa kwa kundi); Partition = mifumo iliyotapakaa (Hadoop, Kafka, Cassandra) yenye utengaji wa kushindwa kwa kila sehemu; Spread = utengaji wa juu zaidi wa matukio, kima cha juu cha 7 kwa kila AZ. Muundo wa swali la mtihani: "mzigo wa HPC uliounganishwa kwa karibu unahitaji kipimo data cha juu zaidi cha mtandao kati ya nodi" → Cluster placement group.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Kwa maneno yako mwenyewe: tukio la EC2 ni nini? AMI ni nini? Ni uhusiano gani
kati yao?

*(Kidokezo: Fikiri kuhusu mlinganisho wa mapishi — mapishi ni nini, na chakula ni nini?)*

**Zoezi la 2 — Mazingira ya SAA-C03**

*Mazingira*: Kampuni inasambaza programu ya wavuti yenye trafiki kubwa. Programu
hushughulikia utafutaji wa katalogi ya bidhaa kwa mantiki ya kuchuja changamano inayotumia CPU sana.
Timu inatarajia vilele vikubwa vya trafiki wakati wa matukio ya mauzo. Wanataka kuhakikisha
wanachagua aina sahihi ya tukio la EC2 na wamejiandaa kwa ongezeko la trafiki.

Ni mchanganyiko gani wa chaguzi unaokidhi mahitaji yao VIZURI ZAIDI?

A) Matukio yaliyoboreshwa kwa kumbukumbu yenye idadi isiyobadilika kuhakikisha utendaji thabiti  
B) Matukio yaliyoboreshwa kwa kompyuta yenye Auto Scaling kushughulikia vilele vya trafiki  
C) Matukio ya madhumuni ya jumla yenye ukubwa mmoja mkubwa wa tukio  
D) Matukio yaliyoboreshwa kwa hifadhi kwa sababu katalogi ya bidhaa inahitaji ufikiaji wa diski wa haraka

**Kidokezo cha 1**: Mzigo umeelezewa kama "unaotumia CPU sana." Ni familia gani ya matukio
imeboreshwa kwa CPU?

**Kidokezo cha 2**: Mazingira yanataja "vilele vya trafiki wakati wa matukio ya mauzo." Idadi isiyobadilika
ya matukio haitashughulikia kwa ufanisi trafiki inayobadilika. Ni kipengele gani cha AWS kinashughulikia hili?

**Kidokezo cha 3**: Matukio yaliyoboreshwa kwa kompyuta hushughulikia kazi nzito ya CPU. Auto Scaling huongeza
na kuondoa matukio kulingana na mahitaji. Pamoja yanajibu mahitaji yote mawili.

**Jibu**: B

**Ufafanuzi**: Matukio yaliyoboreshwa kwa kompyuta (kama familia ya `c`) hutoa CPU zaidi
kwa kila dola kwa mizigo inayotumia CPU sana. Auto Scaling kiotomatiki hurekebisha idadi
ya matukio kulingana na mzigo — kuongeza matukio wakati wa matukio ya mauzo, kuyaondoa wakati
trafiki inarudi kawaida. Mchanganyiko huu huboresha utendaji na gharama zote mbili.

**Kwa nini si A?** Matukio yaliyoboreshwa kwa kumbukumbu yamebuniwa kwa mizigo inayohitaji kiasi
kikubwa cha RAM (hifadhidata, akiba za ndani-ya-kumbukumbu). Huu ni mzigo unaofungwa-na-CPU. Na idadi
isiyobadilika ya matukio inamaanisha ama kutoa rasilimali kupita kiasi (upotevu) au pungufu (kushindwa).

**Kwa nini si C?** Matukio ya madhumuni ya jumla hubadilisha baadhi ya ufanisi wa CPU kwa uwiano. Kwa
mzigo unaojulikana kutumia CPU sana, lililoboreshwa kwa kompyuta linafaa zaidi. Na tukio moja
kubwa ni nukta moja ya kushindwa.

**Kwa nini si D?** Kizuizi ni CPU, si I/O ya diski. Matukio yaliyoboreshwa kwa hifadhi
yamebuniwa kwa mizigo inayohitaji kipimo data cha juu sana kwa hifadhi ya kienyeji.

*Kikoa cha SAA-C03 3 — Kazi 3.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus kwa sasa inaendesha tukio moja la `t3.micro` la EC2 kwa programu yote.
Timu inahitaji kuamua: boresha hadi tukio kubwa zaidi (`t3.2xlarge`) au ongeza matukio
zaidi ya `t3.micro` nyuma ya kisawazisha mzigo?

Pitia uwiano wa biashara. Ni faida zipi za kila mbinu? Ni maswali gani
ungeuliza kuamua? (Kidokezo: fikiri kuhusu nukta moja za kushindwa,
gharama, ugumu wa usambazaji, na kile kinachotokea wakati wa matengenezo.)

*(Hakuna jibu moja sahihi. Hii inahusu kuhoji kupitia upanuzi wa kiwima dhidi ya
kiusawa.)*

## Onyesho la Baada ya Mikopo

Leo alitumia mchana akitekeleza upunguzaji wa ukubwa. Alihama kutoka `t3.large` chini hadi `t3.small`,
akitumia data ya kupima ukubwa sahihi ambayo Tom alikuwa amekusanya kutoka CloudWatch. CPU ilitulia karibu
asilimia 12 wakati wa mzigo wa kawaida. Kurasa zilipakia ndani ya sekunde moja.

Tom alitazama bili ya AWS ikisasishwa kwa wakati halisi. t3.small bado iligharimu takriban maradufu kwa saa kuliko micro asili — lakini theluthi ya t3.large ambayo walikuwa wakililipia kupita kiasi. Aliandika dokezo: *Dola 40/mwezi zimeokolewa dhidi ya t3.large iliyotangulia. Uamuzi sahihi.*

Maya alikuwa akiangalia kitu kingine kwenye skrini yake.

"Leo," alisema. "Ulipokuwa ukibadilisha ukubwa wa tukio, tovuti ilikuwa chini kwa
dakika kumi na mbili."

Leo alitazama juu.

"Tulikuwa na foleni ya maagizo mia mbili yasiyotimizwa."

Aliangalia skrini. Kisha dari. Kisha akarudi kwenye skrini.

"Tunahitaji kitu kwa picha zetu," alisema, akibadilisha mada kidogo. "Sasa hivi,
picha za menyu zilizopakiwa huhifadhiwa moja kwa moja kwenye seva. Tukibadilisha ukubwa au kuanzisha upya
tukio, je, tunazipoteza?"

Priya alikuwa tayari anajua jibu.

Katika sura inayofuata: faili zinaishi wapi wakati hakuna diski kuu ya kuonyesha.
