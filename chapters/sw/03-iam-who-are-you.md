# Sura ya 3: Wewe ni Nani, Hasa?

Ilikuwa imepita saa tatu asubuhi kidogo. Leo alikuwa kwenye dawati lake tangu saa moja, kahawa imepoa kando ya kibodi. Ofisi ilikuwa kimya — Maya alikuwa hajafika bado, Tom alikuwa kwenye simu. Nje, mtu fulani alikuwa akikata nyasi.

Leo aliandika amri mara moja zaidi.

Kituo cha tarakilishi kilirudisha maneno mawili: Access Denied.

Mgogoro wa Singapore ulikuwa nyuma yao. Region ilikuwa imerekebishwa, seva ilikuwa ikiendesha katika us-west-2, na timu ilihisi kuwa na uwezo kwa muda mfupi. Hisia hiyo ilikuwa imedumu takriban masaa arobaini na nane kabla tatizo jipya halijajitokeza: Leo hakuweza kusambaza kwa uzalishaji. Hakuna aliyekuwa ameweka ruhusa zake. Hakuna aliyekuwa ameweka ruhusa za mtu yeyote. Akaunti ya AWS ilikuwa wazi kabisa katika kiwango cha root na imefungwa kabisa kila mahali pengine, na hakuna aliyekuwa amegundua kwa sababu hakuna aliyekuwa amejaribu.

"Tayari nimeisambaza — lo," Leo alinong'ona, akiteremka nyuma kupitia kituo chake cha tarakilishi. Alikuwa amekuwa akisambaza kwa kile alichodhani kilikuwa uzalishaji kwa wiki. Kilikuwa staging. Mazingira halisi ya uzalishaji hayakuwahi kuguswa.

Maya alitazama begani mwake kwenye ujumbe wa hitilafu. "Nani alikupa ruhusa hiyo?"

Leo aligeuka. "Ruhusa gani?"

"Ruhusa ya kusambaza kwa uzalishaji. Nani aliiweka?"

Leo alifungua kiweko cha AWS na akaanza kubofya kupitia menyu. Hakuna aliyekuwa amefanya. Hakukuwa
na sera, hakuna jukumu, hakuna ruhusa wazi. Pia hakukuwa na kataa wazi — tu
kutokuwepo. Hakuna mtu Nimbus aliyewahi kuketi na kufikiri kuhusu nani angeweza kufanya nini.

Hilo lilikuwa tatizo.

**Tatizo la Manenosiri**

Manenosiri ni mfano mbaya kwa mifumo ya kompyuta.

Si kwa sababu daima ni dhaifu. Bali kwa sababu ni ya binari: ama una nenosiri
au huna. Ukiwa nalo, unaweza kufanya chochote ambacho akaunti inaruhusiwa kufanya.

Hilo ni sawa kwa mtumiaji mmoja kwenye laptop yake binafsi. Ni janga kwa
miundombinu ya wingu ya kampuni.

Fikiri kile Nimbus inahitaji kusimamia: seva ya wavuti, hifadhidata, hifadhi ya faili,
mtandao, arifa za bili, akaunti za watumiaji. Ikiwa kila kitu kinalindwa na nenosiri moja —
au hata seti moja ya vitambulisho — basi mtu yeyote anayepata nenosiri hilo anapata kila kitu.

Na "kila kitu" kwenye AWS inamaanisha uwezo wa kufuta hifadhidata. Kuwasha seva zinazoongeza
bili ya dola 50,000. Kuiba kila rekodi ya mteja. Kuharibu data ya nakala rudufu.

Kuna tatizo lingine zaidi ya asili ya binari ya manenosiri: manenosiri ni tuli.
Hayaishi kiotomatiki. Mara nyingi yanatumika tena katika huduma. Yanaandikwa
chini. Yanahifadhiwa katika lahajedwali zenye lebo "manenosiri MSISHIRIKI." Yanashirikiwa
hata hivyo, kwa sababu urahisi unashinda usalama wakati utaratibu wa usalama ni msuguano.

Tatizo la "vitambulisho vinavyoshirikiwa" si dosari ya tabia. Ni tatizo la mifumo. Wakati
njia pekee ya kumpa mtu ufikiaji wa muda wa mfumo ni kumpa nenosiri la
kudumu, watu hushiriki manenosiri. Suluhisho ni kujenga mfumo ambapo ufikiaji wa muda,
wenye upeo ndio chaguomsingi — si njia mbadala inayohitaji juhudi za kishujaa.

Hivyo ndivyo IAM hufanya. Si tu "manenosiri bora," bali mfano tofauti kabisa
ambapo ufikiaji unafafanuliwa na utambulisho na sera badala ya nani anayejua mfuatano wa
herufi.

Priya hakuelezea hili kwa maneno ya utulivu, ya kufikirika. Aliielezea kama hadithi.

**Uvunjaji Uliogharimu Dola 80,000 katika Masaa Manne**

Msanidi programu katika startup alisukuma skripti ya usambazaji ya GitHub Actions kwenye hazina yao ya umma. Skripti ilikuwa na vitambulisho vya AWS vilivyowekwa kwa nguvu kama vigeu vya mazingira — kosa ambalo ni la kawaida vya kutosha kuwa na kategoria yake mwenyewe katika uchunguzi wa baada ya kifo wa usalama wa wingu. Vitambulisho vilikuwa na ufikiaji kamili wa msimamizi kwa akaunti ya AWS ya kampuni, kwa sababu mtu fulani alikuwa amevisanidi hivyo miezi sita mapema ili kuepuka kushughulika na sera za IAM.

Vitambulisho vilikuwa katika faili kwa takriban dakika sita kabla skana otomatiki — iliyoendeshwa na mshambuliaji, si mtafiti wa usalama — haijavipata.

Skana iliorodhesha vitambulisho, ilikadiria ruhusa za akaunti, na ikaanza kuwasha matukio ya GPU katika maeneo mengi. Matukio ya GPU ni ghali. Pia ni muhimu kwa uchimbaji wa cryptocurrency. Ndani ya saa ya kwanza, matukio arobaini na saba ya `p3.8xlarge` yalikuwa yakiendesha katika `us-east-1`, `eu-west-1`, na `ap-southeast-1`.

`p3.8xlarge` inagharimu takriban dola 12 kwa saa. Arobaini na saba kati yao iligharimu dola 564 kwa saa.

Kufikia wakati arifa ya bili ya startup ilipowaka — iliyosanidiwa kwa dola 1,000 kwa siku, ambayo hakuna aliyekuwa amefikiri kuifinyaza — masaa manne yalikuwa yamepita. Bili ilikuwa ikikaribia dola 2,200 na ikipanda.

Kufikia wakati mtu fulani alipoelewa kile kilichokuwa kikitokea na akafuta vitambulisho, bili ilikuwa imefikia dola 3,400 kwa masaa hayo machache. Lakini gharama halisi ilikuja baadaye: ukaguzi ulifunua kwamba mshambuliaji alikuwa amekuwa akichimba kwa wiki tayari, kimya, usiku, akitumia seti ya pili ya vitambulisho vilivyovuja ambavyo hakuna aliyekuwa amegundua. Uharibifu jumla kufikia wakati ukaguzi ulikamilika: zaidi ya dola 80,000.

"Na wakafungwa?" Tom aliuliza.

"Miezi mitatu baadaye," Priya alisema. "Wawekezaji walijiondoa. Uvunjaji ulifichuliwa. Maelezo ya vyombo vya habari yalifanya kukusanya fedha kuwa kusikowezekana."

Chumba kilikuwa kimya.

"Kwa hivyo mbadala ni nini?" aliuliza Tom.

**Dhana: Usimamizi wa Utambulisho na Ufikiaji**

Mbadala ni mfumo ambapo huwapi kila mtu ufunguo ule ule.

Fikiri jengo la ofisi ambapo kila ghorofa lina maeneo tofauti, na kila mfanyakazi
ana kadi ya ufunguo inayofungua tu milango anayohitaji kwa kazi yake. Kadi ya mwanafunzi
inafanya kazi katika ghorofa ya tatu. Kadi ya mhasibu hufungua ofisi ya fedha lakini si
chumba cha seva. Hakuna anayepita mlango ambao hana sababu ya kuupita.

Huo ndio mfano ambao AWS hutumia.

AWS huita mfumo huu **IAM**: Identity and Access Management (Usimamizi wa Utambulisho na Ufikiaji).

IAM ni mfumo wa kadi ya ufunguo kwa akaunti yako yote ya wingu. Unafafanua nani yupo
(vitambulisho), kile wanachoruhusiwa kufanya (ruhusa), na unatumia ruhusa hizo
kupitia sera. Jengo lina ghorofa kadhaa. IAM huhakikisha kila mtu anaweza
kufikia tu ghorofa anazohitaji.

Mlinganisho wa kadi ya ufunguo unaenda mbali zaidi. Katika jengo linaloendeshwa vyema, unajua wakati wowote nani ana ufikiaji wa nini. Unaweza kuchapisha ripoti: hapa kuna haki za ufikiaji za kila kadi ya ufunguo. Hapa ni nani amekuwa katika chumba cha seva katika siku 30 zilizopita. Hapa kuna kadi ambazo hazijatumika kwa siku 90 (kiashiria kinachowezekana cha kadi ya mfanyakazi aliyeachishwa kazi ambayo haikulemazwa).

IAM hutoa uonekanaji ule ule. Kila hatua iliyochukuliwa kupitia IAM — kila wito wa API, kila kuingia kwa kiweko, kila ruhusa iliyotolewa — huandikwa katika **AWS CloudTrail**. Ikiwa unahitaji kujua nani alifuta hifadhidata saa nane usiku Jumanne, CloudTrail ina jibu. Ikiwa unahitaji kuonyesha kwa mkaguzi kwamba ni watumiaji walioidhinishwa tu waliokuwa na ufikiaji wa mifumo ya uzalishaji, CloudTrail hutoa ushahidi.

AWS CloudTrail kiotomatiki huweka historia ya siku 90 ya matukio ya usimamizi, inayosomeka kutoka kwenye kiweko. Lakini siku 90 zina njia ya kuwa zisizotosha kabisa wakati timu yako ya usalama inahitaji kukagua kitu kutoka robo iliyopita. Kwa uandishi wa kumbukumbu wa kudumu, wa muda mrefu — na kwa arifa — unahitaji kuunda **Trail**, inayoandika matukio yote kwenye ndoo ya S3 na inaweza kutiririsha kwa CloudWatch Logs. Trail si otomatiki; ni kitu unachosanidi mara moja kisha kukisahau. Mpaka unapokihitaji.

Mchanganyiko wa vidhibiti vya ufikiaji vya IAM na uandishi wa ukaguzi wa CloudTrail ndicho kinachoruhusu mashirika makubwa kuendesha akaunti za AWS kwa kiwango kikubwa kwa ujasiri: ufikiaji unafafanuliwa na kutekelezwa na IAM; kila zoezi la ufikiaji huo huandikwa na CloudTrail.

**Mlinganisho wa Hospitali**

Hapa kuna njia ya pili ya kufikiri kuhusu hilo — ile inayofanya daraja la ufikiaji kuwa la kueleweka zaidi.

Fikiri hospitali. Si tu jengo halisi, bali muundo kamili wa shirika wa watu, majukumu, na data.

**Mpokeaji** anaweza kuona ratiba za miadi ya wagonjwa na taarifa za bima. Anaweza kuwasajili wagonjwa kuingia na kutoka. Hawezi kufikia rekodi za matibabu, hawezi kurekebisha maagizo ya dawa, hawezi kuona historia za upasuaji.

**Muuguzi** anaweza kufikia rekodi za matibabu za wagonjwa kwenye wodi yake. Anaweza kutoa dawa kulingana na maagizo ya daktari. Hawezi kuagiza dawa. Hawezi kuidhinisha upasuaji.

**Daktari** anaweza kuona na kurekebisha rekodi za matibabu, kuandika maagizo ya dawa, na kuagiza vipimo. Hawezi kufikia mfumo wa malipo ya mishahara. Hawezi kurekebisha maagizo ya dawa ya madaktari wengine bila ubatilishaji mahususi.

**Daktari wa upasuaji** anaweza kufikia mifumo ya chumba cha upasuaji. Ana ruhusa mahususi za rekodi za upasuaji ambazo madaktari wengi hawazihitaji.

**Wafanyakazi wa usafi** wanaweza kufikia ramani za sakafu na ratiba za vyumba. Hawawezi kufikia data yoyote ya mgonjwa.

Kila mtu hospitalini ana ufikiaji anaohitaji kwa kazi yake — na huo tu. Mpokeaji hana ufikiaji wa upasuaji. Wafanyakazi wa usafi hawaoni rekodi za wagonjwa. Na muhimu zaidi: ikiwa kadi ya ufunguo ya mfanyakazi wa usafi itaibwa, mshambuliaji anapata ratiba za usafi. Hapati rekodi za wagonjwa. Eneo la mlipuko la uvunjaji limefungwa kwa kile ambacho kadi ya ufunguo ingeweza kufikia.

Hivi ndivyo IAM hufanya kazi. Kila utambulisho — kila mtumiaji, kila huduma, kila mchakato otomatiki — hupata haswa ruhusa unazohitaji. Si zaidi.

Tom aliegemea nyuma. "Kwa hivyo Leo ni muuguzi, na mimi ni mhasibu."

"Kitu kama hicho," Priya alisema. "Na hakuna kati yenu aliye daktari wa upasuaji."

"Daktari wa upasuaji ni nani?"

"Hakuna mtu, kila siku," Priya alisema. "Akaunti ya root ndiyo daktari wa upasuaji. Inatoka tu kwa taratibu mahususi, zilizoandikwa."

**Vipengele vya Msingi vya IAM**

IAM ina dhana nne za msingi. Zinajengeana.

**Watumiaji** (Users) ni vitambulisho binafsi. Maya ana mtumiaji wa IAM. Tom ana mtumiaji wa IAM.
Kila mtumiaji ana vitambulisho vyake — na anapaswa kuwa na tu ruhusa anazohitaji
mahususi.

Mtumiaji wa IAM ana aina mbili za vitambulisho: **nenosiri** la ufikiaji wa kiweko (kuingia kwenye kiolesura cha wavuti cha AWS) na **funguo za ufikiaji** (kitambulisho cha ufunguo na ufunguo wa siri) kwa ufikiaji wa kiprogramu kupitia CLI au SDK. Si lazima daima uwe na zote mbili. Msanidi programu anayetumia CLI tu hahitaji nenosiri la kiweko. Mtumiaji asiye wa kiufundi anayehitaji kiweko tu hahitaji funguo za ufikiaji. Toa tu kile kinachohitajika.

**Makundi** (Groups) ni mikusanyiko ya watumiaji. Badala ya kuweka ruhusa kwa Maya, Tom,
Priya, na Leo mmoja mmoja, unaunda kundi la "Developers" lenye ruhusa za msanidi programu
na kuwaongeza ndani yake. Mtu wa tano anapojiunga, unamuongeza kwenye kundi na
mara moja anarithi ruhusa sahihi.

Faida ya kivitendo ya makundi ni udumishaji. Ikiwa kundi la "Developers" linahitaji ruhusa mpya — tuseme, ufikiaji wa ndoo mpya ya S3 — unaiongeza kwenye kundi mara moja na wasanidi programu wote mara moja wanaipata. Bila makundi, ungesasisha kila mtumiaji mmoja mmoja, jambo linaloumba fursa za kutofautiana na kukosa watu.

**Majukumu** (Roles) ni vitambulisho vya muda vinavyoweza *kuchukuliwa* na kitu fulani — mtu, huduma,
au akaunti nyingine ya AWS. Tutazama kwa kina majukumu katika Sura ya 14. Kwa sasa: ikiwa
Mtumiaji ni mfanyakazi wa kudumu, Jukumu ni beji ya mgeni. Linatoa ufikiaji mahususi
kwa muda mahususi au kusudi.

Matumizi muhimu zaidi ya Majukumu kwa sura hii: IAM Roles kwa matukio ya EC2. Unapoambatanisha Jukumu na tukio la EC2, programu inayoendesha kwenye tukio hilo inaweza kufanya miito ya API ya AWS kwa kutumia ruhusa za Jukumu — bila vitambulisho vyovyote tuli vilivyohifadhiwa popote. Vitambulisho ni vya muda, vinazungushwa kiotomatiki na AWS, na vimewekewa upeo na sera za Jukumu. Hii huondoa tatizo la "vitambulisho katika faili za usanidi" kabisa.

**Sera** (Policies) ni sheria halisi za ruhusa. Sera ni hati (iliyoandikwa kwa JSON
kwa ndani, lakini huhitaji kukariri muundo) inayosema: "Mwenye sera
hii ANARUHUSIWA kufanya kitendo X kwenye rasilimali Y." Au "AMEKATALIWA kitendo Z."

AWS hutoa mamia ya **sera zinazodhibitiwa** (managed policies) — sera zilizoandikwa awali kwa matumizi ya kawaida. `AmazonS3ReadOnlyAccess` hutoa ufikiaji wa kusoma kwa ndoo zote za S3. `AmazonEC2FullAccess` hutoa udhibiti kamili wa EC2. Kwa matumizi ya uzalishaji, mara nyingi unataka **sera zinazodhibitiwa na mteja** (customer-managed policies) — sera unazoandika mwenyewe, zilizowekewa upeo kwa usahihi kwa rasilimali na vitendo ambavyo programu yako inahitaji kwa kweli.

Mfano wa tathmini wa IAM ni: kwa chaguomsingi, kila kitu kimekataliwa. Ruhusa lazima
zitolewe waziwazi. Ikiwa sera haisemi unaweza kufanya kitu, huwezi.

**Kanuni ya Upendeleo Mdogo Zaidi**

Wape watu na mifumo tu ufikiaji wanaohitaji kufanya kazi yao. Si zaidi.

Priya aliiita hii "kanuni ya upendeleo mdogo zaidi." Inasikika dhahiri. Katika vitendo,
timu nyingi huikiuka mara kwa mara — si kwa nia mbaya, bali kwa urahisi.

"Je, tunaweza tu kumpa Leo ufikiaji wa msimamizi ili aweze kusambaza vitu kwa haraka zaidi?"

Hapana.

"Je, tunaweza tu kutumia akaunti ya root kwa kila kitu?"

Hapana kabisa.

Akaunti ya root ni ufunguo mkuu wa akaunti yako yote ya AWS. Inaweza kufanya chochote,
ikiwa ni pamoja na kufunga akaunti yenyewe. Unapaswa kuiunda mara moja, kuweka uthibitishaji
wa hatua nyingi, na kisha kutowahi kuitumia tena kwa kazi za kila siku.

Kuna haswa kazi chache zinazohitaji akaunti ya root: kubadilisha anwani ya barua pepe ya akaunti, kuona taarifa za bili ambazo hazijakabidhiwa vinginevyo, kufunga akaunti, na operesheni chache zingine za kiutawala ambazo AWS inazifunga kwa root waziwazi. Kwa kila kitu kingine — kuunda watumiaji, kusambaza miundombinu, kufikia hifadhidata — unatumia watumiaji na majukumu ya IAM. Akaunti ya root ni kwa msimamizi wa jengo. Kila mtu mwingine ana kadi za ufunguo zinazofaa.

Priya aliunda watumiaji tofauti wa IAM kwa kila mtu mchana ule. Alimpa Leo ruhusa
za kusambaza kwa mazingira ya maendeleo. Si uzalishaji. Si bili. Si mtandao.
Usambazaji tu.

"Hii inahisi ya kuzuia," Leo alisema.

"Hivyo ndivyo unavyojua ni sahihi," Priya alijibu.

Mpaka wa maendeleo-dhidi-ya-uzalishaji ulikuwa laini ya kwanza na muhimu zaidi ya upendeleo-mdogo ambayo Priya aliichora. Wasanidi programu walihitaji kusonga haraka katika maendeleo: kuunda rasilimali, kujaribu usanidi, kufanya makosa. Lakini uzalishaji ulikuwa tofauti. Mabadiliko ya uzalishaji yalihitaji kuwa ya makusudi, yaliyokaguliwa, na kutekelezwa kupitia mchakato unaodhibitiwa. Kumpa msanidi programu ufikiaji wa uzalishaji wa moja kwa moja ilikuwa kumpa uwezo wa kufanya makosa ya uzalishaji kwa kasi ya maendeleo.

Baada ya muda, Priya alijenga mfumo ambapo ufikiaji wa uzalishaji ulitolewa kwa muda kupitia mchakato wa kuchukua jukumu: msanidi programu aliyehitaji kufanya mabadiliko ya uzalishaji aliomba ufikiaji, akaupata kwa dirisha la masaa 4, akafanya mabadiliko, na ufikiaji ukaisha kiotomatiki. Dirisha liliandikwa katika CloudTrail. Ufikiaji hauwezi kutumika baada ya kuisha. Uzalishaji ulilindwa si kwa kukataa ufikiaji kabisa, bali kwa kufanya ufikiaji uwe na mpaka wa muda na unaoweza kukaguliwa.

Pengine unajiuliza: ikiwa kila kitu kimekataliwa kwa chaguomsingi, kwa nini akaunti ya root ina ufikiaji kamili? Akaunti ya root ni maalum — inapita IAM kabisa. Hiyo ndiyo haswa kwa nini unaifungia mbali. Kila kitendo kingine katika AWS hupita mnyororo wa tathmini wa IAM, ambapo Ruhusa inayokosekana ni sawa na Kataa.

**Eneo la Mlipuko: Kwa Nini Upendeleo Mdogo Huokoa Makampuni**

Kuna dhana ambayo wahandisi wa usalama hutumia kufikiri kuhusu uhatarishaji wa vitambulisho: **eneo la mlipuko** (blast radius).

Eneo la mlipuko ni uharibifu wa juu zaidi ambao mshambuliaji anaweza kufanya akipata kitambulisho fulani.

Mshambuliaji mwenye vitambulisho vya root vya akaunti ya AWS ana eneo la mlipuko lisilo na kikomo. Anaweza kufuta kila rasilimali, kuiba kila baiti ya data, kuwasha matukio ya GPU katika kila Region, na kufunga akaunti. Kitambulisho chenyewe hakina mipaka.

Mshambuliaji mwenye vitambulisho vya IAM vya Leo — vilivyowekewa upeo kwa kusambaza kwenye mazingira ya maendeleo na kusoma kutoka ndoo moja ya S3 — ana eneo la mlipuko dogo sana. Anaweza kusambaza kwa dev. Anaweza kusoma faili kadhaa. Hawezi kugusa uzalishaji. Hawezi kufikia hifadhidata. Hawezi kuona bili. Hawezi kuwasha matukio ya GPU.

Hadithi ya uvunjaji kutoka mapema ilikuwa na eneo la mlipuko kubwa kwa sababu vitambulisho vya msanidi programu vilikuwa vya msimamizi. Ikiwa vitambulisho vile vile vingewekewa upeo kwa kazi yao halisi — kusambaza kwenye mazingira moja mahususi — uharibifu ungekuwa mdogo zaidi. Shambulio bado lingeweza kutokea. Matokeo yangekuwa tofauti.

Hii ndiyo sababu upendeleo mdogo si tu sera. Ni usanifu. Kila ruhusa usiyoitoa ni eneo la mlipuko usilolo nalo.

**Kile Kinachotokea Unapolikosea Hili**

Mazingira matatu, kwa mpangilio wa ukali unaoongezeka:

**Mazingira ya 1**: Mfanyakazi mwenye ufikiaji wa msimamizi anaondoka kampuni. Hakuna anayelemaza
akaunti yake. Miezi mitatu baadaye, bado ana ufikiaji. Hili hutokea mara kwa mara.
IAM huilatua: unalemaza mtumiaji. Mara moja, kila mahali.

Hii ndiyo modi ya kushindwa ya IAM ya kawaida zaidi, nayo inaweza kuzuilika kabisa. Mashirika mengi
yana mchakato wa kufuta ufikiaji halisi (kurudisha beji, kurudisha laptop) lakini
husahau IAM. Orodha ya kuachisha kazi inayojumuisha "lemaza mtumiaji wa IAM" na
"ondoa kutoka makundi yote ya IAM" si changamoto ngumu ya uhandisi — ni nidhamu
ya mchakato. Timu zinazoifanya kwa uthabiti ndizo ambazo hazigundui kamwe kile
kinachotokea wakati mfanyakazi wa zamani bado anaweza kufikia hifadhidata ya uzalishaji.

**Mazingira ya 2**: Laptop ya msanidi programu inahatarishwa. Mshambuliaji anapata vitambulisho vya AWS
vilivyohifadhiwa katika faili ya usanidi vyenye ruhusa kamili za msimamizi. Kwa sababu vitambulisho vina
ufikiaji mpana, mshambuliaji anaweza kufanya chochote: kuchimba cryptocurrency, kuiba data, kufuta nakala rudufu.
Kwa upendeleo mdogo: vitambulisho hufanya kazi tu kwa upeo wao mdogo. Eneo la mlipuko limefungwa.

Muundo wa vitambulisho-katika-faili-ya-usanidi ni wa kawaida zaidi kuliko unavyopaswa kuwa. Wasanidi programu
mara nyingi huhifadhi vitambulisho vya AWS katika `~/.aws/credentials` kwa maendeleo ya kienyeji — ambayo ni
sawa. Tatizo ni wakati vitambulisho hivyo vina ufikiaji wa kiwango cha uzalishaji badala ya
kuwa na upeo kwa mazingira ya sanduku la mchanga. Vitambulisho vya maendeleo vinapaswa kuwekewa upeo kwa
mazingira ya maendeleo. Ufikiaji wa uzalishaji unapaswa kuhitaji hatua wazi za kuchukua, si
kuwepo kwenye kila laptop wakati wote.

**Mazingira ya 3**: Programu iliyoandikwa vibaya kwa bahati mbaya hufichua vitambulisho vya AWS katika
kumbukumbu zake. Ikiwa vitambulisho hivyo vina ufikiaji mpana, una uvunjaji wa kijanga. Ikiwa vina
ufikiaji mwembamba — kwa ndoo moja mahususi ya S3 ambayo programu inahitaji — ufichuzi
ni mdogo na umefungwa.

Mazingira ya vitambulisho-vya-programu-katika-kumbukumbu ni ya hila. Mara nyingi hutokea wakati
msimbo wa kutatua makosa unaandika muktadha kamili wa ombi — ikiwa ni pamoja na vichwa vya idhini — au wakati
mshughulikiaji wa hitilafu unawekea mfuatano vigeu vyote vya mazingira (ikiwa ni pamoja na `AWS_ACCESS_KEY_ID`) kwenye faili
ya kumbukumbu. Kinga hapa ni IAM Roles kwa EC2, inayoondoa vitambulisho tuli kutoka kwa
mazingira ya programu kabisa. Ikiwa hakuna vitambulisho tuli, haviwezi
kuonekana kwenye kumbukumbu.

Muundo: ufikiaji unapaswa kuwekewa upeo kwa kiwango cha chini. Daima. Si kwa sababu huwaamini
watu wako, bali kwa sababu huwezi kudhibiti kile kinachotokea kwa vitambulisho vilivyohatarishwa.

**Ikiwa Ufikiaji Mpana Basi Urahisi Lakini Ufichuzi**

Daima kuna kishawishi cha kuwapa timu ufikiaji mpana kuliko wanaohitaji — hufanya
usambazaji kuwa wa haraka zaidi, hupunguza msuguano, huepuka nyakati za "Access Denied" zinazovunja
mtiririko. Ukimpa kila mtu ufikiaji wa msimamizi, basi usambazaji ni laini na hakuna anayezuiwa
— lakini vitambulisho vinapovuja (navyo huvuja), mshambuliaji anarithi haki kamili za msimamizi.
Laptop moja iliyohatarishwa inakuwa uvunjaji kamili wa akaunti. Andika ruhusa ya
chini kwanza. Panua tu wakati kitu kinaposhindwa. Sheria hiyo huokoa makampuni.

**Uthibitishaji wa Hatua Nyingi: Kufuli la Pili**

Hata kwa upendeleo mdogo, vitambulisho vinaweza kuibwa. Manenosiri yanaweza kukisiwa,
kudukuliwa, au kuvuja. IAM hushughulikia hili kwa **Uthibitishaji wa Hatua Nyingi (MFA)**.

MFA huhitaji kitu *unachokijua* (nenosiri) pamoja na kitu *ulicho nacho* (simu, ufunguo
wa maunzi). Hata kama mshambuliaji ataiba nenosiri lako, hawezi kuingia bila
kuwa na simu yako pia.

MFA inapaswa kuwezeshwa kwa kila mtumiaji wa IAM. Haiwezi kujadiliwa kwa akaunti ya root.

Priya alitumia mchana kuiweka kwa kila mtu. Haikwenda vizuri.

Programu ya uthibitishaji ya Leo ilisajili akaunti isiyo sahihi mara mbili. Alilazimika kuskani msimbo wa QR mara tatu kwa sababu saa kwenye laptop yake ilikuwa imepotoka kidogo, jambo lililosababisha tokeni za msingi-wa-muda kushindwa. Kwenye jaribio la tatu, ilifanya kazi.

"Je, kuna njia ya kufanya hivi bila programu?" Leo aliuliza, akiangalia simu yake.

"Funguo za maunzi," Priya alisema. "Kifaa halisi kinachoungwa kwenye USB. Salama zaidi kuliko programu. Ghali zaidi."

"Ghali zaidi kiasi gani?"

"Takriban dola 50 kwa kila ufunguo. Ungetaka mbili, ikiwa utapoteza moja."

Tom aliandika "dola 100 kwa kila msanidi programu" kwenye daftari lake.

"Tunazinunua," Priya alisema. "Kwa akaunti ya root angalau."

Tom aliuliza kama ilikuwa msuguano mwingi kwa ujumla. Priya alifungua hadithi ya uvunjaji tena.

Tom aliweka MFA mara moja.

"Na vipi ikiwa mtu atajaribu kuingia kwa nguvu tukiwa katikati ya mpito huu?" Priya aliuliza. "Kabla kila mtu hajawezesha MFA?"

Hakuna aliyekuwa na jibu zuri. Aliweka MFA kwa akaunti ya root kwanza, kabla ya mtu mwingine yeyote.

**IAM Access Analyzer: Seti ya Pili ya Macho**

Priya alikuwa na zana moja zaidi ya kuonyesha timu baada ya usanidi wa MFA kukamilika.

"Hii inaendesha kiotomatiki," alisema, akifungua kichupo kipya cha kiweko.

**IAM Access Analyzer** ni huduma inayochanganua kuendelea sera zako za IAM na kuonyesha chochote kinachotoa ufikiaji kwa rasilimali nje ya akaunti yako — au nje ya kile ungetarajia.

Ilipata kitu kwenye uendeshaji wa kwanza.

Ndoo ya S3 — moja ambayo Leo alikuwa ameiweka kama "ya muda" wiki tatu zilizopita kisha akaisahau — ilikuwa na sera ya ndoo iliyoruhusu ufikiaji wa kusoma wa umma. Ndoo ilikuwa na baadhi ya faili za data za majaribio, hakuna chenye usiri. Lakini pia ilikuwa na folda ambayo Leo aliikuwa ameipa jina `db-backups-staging` na akaijaza faili chache za SQL zilizohamishwa kujaribu mchakato wa kuingiza.

"Je, kuna chochote chenye usiri katika faili hizo za SQL?" Priya aliuliza.

Leo aliangalia jina la folda. Kisha faili zilizomo. Kisha dari.

"Nilihamisha hifadhidata ya staging," alisema. "Ambayo ina nakala za data za awali za wateja wa uzalishaji."

Priya alifunga laptop yake taratibu.

Ndoo iliwekwa kuwa ya faragha ndani ya dakika tano. Access Analyzer iliendelea kufuatilia sera zozote za baadaye zinazofungua rasilimali bila kutarajia.

"Ifikirie kama kengele ya mzunguko," Priya alisema. "Kila mtu anapoacha mlango wazi kwa bahati mbaya, inatuambia."

Pengine unajiuliza: je, IAM Access Analyzer huchukua nafasi ya ukaguzi wa sera wa kwa mkono? Hapana. Ni zana ya kugundua, si zana ya kuzuia. Inakuambia kuhusu ufikiaji uliotolewa — haiwezi kukuambia kama ufikiaji huo ulikusudiwa. Ukaguzi wa kibinadamu wa "je, sera hii ilikuwa sahihi?" bado lazima utokee. Access Analyzer huhakikisha tu madirisha yaliyo wazi hayaachwi bila kutambuliwa.

## Nguvu na Mapungufu

**IAM ni zana sahihi kwa**:

- Kudhibiti nani na kitu gani kinaweza kufikia kila rasilimali ya AWS
- Kutekeleza upendeleo-mdogo katika watumiaji, huduma, na mipaka ya kuvuka-akaunti
- Kuondoa hitaji la kushiriki vitambulisho vya muda mrefu kati ya mifumo
- Kila kitendo cha IAM huandikwa kiotomatiki, kikupa njia ya ukaguzi ya nani alifanya nini na lini (imefunikwa katika Sura ya 14)
- Ufikiaji wa kuvuka-akaunti: Jukumu la IAM katika Akaunti A linaweza kuchukuliwa na mhusika katika Akaunti B, kuruhusu kushiriki rasilimali kunakodhibitiwa kati ya akaunti za AWS bila kushiriki vitambulisho

**Ambapo IAM inakuwa ngumu**: Sera za IAM zinaweza kukua hadi mamia ya taarifa katika makumi ya majukumu, na kutatua hitilafu ya "Access Denied" kunahitaji kuelewa ni ipi kati ya sera hizo iliyo na ufanisi — kazi ambayo ni ngumu kuliko inavyosikika. Kosa la kawaida zaidi la IAM si ufikiaji mdogo mno — ni ufikiaji mwingi mno. Sera zenye ruhusa kupita kiasi zilizoumbwa "tu kufanya ifanye kazi" huwa hatari za usalama ambazo ni za uchungu kuzirudisha nyuma baadaye. Andika ruhusa ya chini kwanza. Panua tu wakati kitu kinaposhindwa.

Kuna changamoto ya kivitendo na IAM kwa kiwango kikubwa: **kusambaa kwa sera** (policy sprawl). Mashirika yaliyokuwa yakiendesha AWS kwa miaka kadhaa mara nyingi yana makumi au mamia ya sera za desturi, nyingi zinazopishana, baadhi ambazo hazitumiki kamwe, na chache zinazopingana kwa njia ambazo hakuna aliyegundua kwa sababu mapingano hayajalisha tu kwa hali za pembeni. AWS hutoa **IAM Access Analyzer** (tuliyoianzisha katika sura hii) na zana za **uigaji wa sera ya IAM** kusaidia kukagua na kupanga sera. Lakini mkakati wenye ufanisi zaidi ni kujenga sera safi tangu mwanzo na kukagua mara kwa mara — badala ya kuruhusu sera kujirundika na kujaribu kuzipangua baadaye.

Priya aliweka ukaguzi wa robo mwaka wa IAM: orodhesha majukumu na sera zote, kagua zipi zinatumika kikamilifu kupitia kumbukumbu za CloudTrail, onyesha vitambulisho vyovyote visivyotumika au sera pana mno kwa kuondolewa au kuzuiliwa. Ukaguzi ulichukua masaa mawili kwa robo mwaka na ulinasa masuala matatu ya sera katika mwaka wake wa kwanza.

"Si kazi ya kusisimua," alisema. "Lakini ukaguzi wa ufikiaji ndiyo jinsi unavyopata vitu ambavyo vingekuwa vya kijanga ikiwa mtu mwingine angevigundua kwanza."

## Muhtasari

Nenosiri la Admin123 lilikuwa dalili. Ugonjwa ulikuwa kwamba Nimbus haikuwa na mkakati wowote wa udhibiti wa ufikiaji kabisa — kitambulisho cha root kinachoshirikiwa, hakuna majukumu, hakuna sera, hakuna njia ya ukaguzi. IAM hairekebishi tu dalili; inailazimisha timu kujibu swali ambalo walikuwa wakiliepuka: nani, hasa, anaruhusiwa kufanya nini? Jibu la swali hilo ni msingi wa kila usanifu salama wa AWS.

- **IAM** (Identity and Access Management) ni jinsi unavyodhibiti nani anaweza kufanya nini katika AWS. Vipengele vya msingi ni: **Users**, **Groups**, **Roles**, na **Policies**.
- Kwa chaguomsingi, kila kitu katika AWS kime**katazwa**. Ruhusa lazima zitolewe waziwazi.
- **Kanuni ya Upendeleo Mdogo Zaidi** inamaanisha kumpa kila utambulisho tu ufikiaji unaohitaji — kupunguza **eneo la mlipuko** ikiwa kitambulisho kitahatarishwa wakati wowote.
- **Akaunti ya root** inaweza kufanya chochote, ikiwa ni pamoja na vitu vya kijanga. Ifungie nyuma ya MFA na uitumie kwa kiasi kidogo iwezekanavyo.
- Wezesha **MFA** kwa kila mtumiaji wa IAM. Haiwezi kujadiliwa — kwenye mtihani na katika uzalishaji.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03 1 — Kazi 1.1 (ufikiaji salama wa rasilimali za AWS)*

- **Kila kitu kimekatazwa kwa chaguomsingi.** "Allow" wazi inahitajika. Ikiwa sera
  haitaji kitendo, kitendo kimekatazwa.
- **Deny wazi daima inashinda.** Ikiwa sera yoyote katika mnyororo itakataa kitendo, kataa
  hiyo haiwezi kupinduliwa na Allow mahali pengine popote katika mnyororo. Hii huwakamata wengi
  wa watahiniwa bila kujua.
- **Akaunti ya root ≠ msimamizi wa IAM.** Akaunti ya root ni kitambulisho tofauti na IAM.
  Huwezi kufuta akaunti ya root. *Unaweza* (na unapaswa) kuzuia inapotumika.
- **IAM ni ya kimataifa**, si ya kieneo. Watumiaji, makundi, majukumu, na sera za IAM zipo
  katika akaunti yote ya AWS, si kwa kila Region.
- **Majukumu ndiyo njia inayopendelewa ya kutoa ufikiaji kwa huduma za AWS.** Ikiwa tukio la EC2
  linahitaji kufikia S3, unaambatanisha Jukumu la IAM na tukio — huhifadhi
  vitambulisho kwenye mashine. Muundo huu hujitokeza mara kwa mara kwenye mtihani.
- **IAM Access Analyzer** huzalisha matokeo wakati rasilimali zinaweza kufikiwa kutoka nje ya akaunti au kutoka nje ya shirika. Mazingira ya mtihani yanapotaja kugundua ufikiaji wa nje usiokusudiwa kwa S3 au KMS, Access Analyzer ndilo jibu.
- **MFA kwa akaunti ya root ni lazima**, si ya hiari, katika muktadha wa mbinu bora za usalama za AWS. Maswali ya mtihani kuhusu kulinda akaunti ya root daima yanajumuisha MFA kama sehemu ya jibu sahihi.
- **Mipaka ya ruhusa** (permission boundaries) ni kipengele cha hali ya juu cha IAM (kimefunikwa katika Sura ya 14) kinachoweka kikomo ruhusa za juu zaidi ambazo mtumiaji au jukumu la IAM linaweza kuwa nazo, hata kama sera zao zinatoa zaidi. Maswali ya mtihani kuhusu "kuzuia upandishaji wa upendeleo" au "kuweka dari ya ruhusa ya juu zaidi" yanaelekeza kwa mipaka ya ruhusa.
- **Service Control Policies (SCPs)** ni sera za kiwango cha shirika zinazozuia kile kinachoweza kufanyika katika akaunti wanachama wa AWS Organization. Zinafanya kazi juu ya kiwango cha IAM — hata msimamizi wa akaunti hawezi kuzidi mipaka iliyowekwa na SCP. Mazingira ya mtihani yanapohusisha utawala wa usalama wa akaunti-nyingi, fikiri SCPs.
- **CloudTrail** huandika miito yote ya API ya IAM. Mazingira ya mtihani yanapouliza "ungekaguaje ni watumiaji gani walifanya mabadiliko kwa sera za IAM," jibu ni CloudTrail. Kila kitendo cha IAM — kuunda mtumiaji, kurekebisha sera, kuchukua jukumu — huandikwa. Historia ya matukio ya siku 90 ni otomatiki na ya bure; kwa uhifadhi wa muda mrefu na arifa, lazima uunde Trail inayowasilisha kumbukumbu kwenye ndoo ya S3.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Kwa maneno yako mwenyewe: ni nini tofauti kati ya Mtumiaji wa IAM, Kundi, na Jukumu?
Lini ungetumia kila moja?

*(Kidokezo: Fikiri kuhusu mlinganisho wa jengo la kadi ya ufunguo — ipi ni kadi ya kudumu,
ipi ni mpangilio wa idara, na ipi ni beji ya mgeni?)*

**Zoezi la 2 — Mazingira ya SAA-C03**

*Mazingira*: Kampuni huendesha programu ya wavuti kwenye matukio ya EC2 yanayohitaji kusoma faili
kutoka ndoo ya S3. Msanidi programu mdogo anapendekeza kuhifadhi funguo za ufikiaji za AWS moja kwa moja
katika msimbo wa programu kwenye matukio ya EC2. Timu ya usalama inapinga.

Ni suluhisho gani lililo SALAMA ZAIDI na linalofaa kiuendeshaji?

A) Hifadhi funguo za ufikiaji katika vigeu vya mazingira kwenye tukio la EC2 badala ya
   msimbo  
B) Unda mtumiaji maalum wa IAM mwenye ruhusa za kusoma S3 na ushiriki vitambulisho
   na timu ya maendeleo  
C) Ambatanisha Jukumu la IAM lenye ruhusa zinazofaa za kusoma S3 moja kwa moja kwenye matukio
   ya EC2  
D) Tumia vitambulisho vya akaunti ya root kuipa programu ufikiaji kamili wa rasilimali zote
   za AWS

**Kidokezo cha 1**: Tatizo la kuhifadhi vitambulisho popote kwenye tukio ni kwamba
vitambulisho vinaweza kuvuja. Je, kuna njia ya kuipa tukio la EC2 ufikiaji bila
kutumia vitambulisho kabisa?

**Kidokezo cha 2**: AWS ina utaratibu ambapo huduma zinaweza kupewa ruhusa bila
kuhitaji vitambulisho tuli. Utaratibu huo unaitwaje?

**Kidokezo cha 3**: IAM Roles zinaweza kuambatanishwa na matukio ya EC2. Zinapokuwa, tukio
hupokea kiotomatiki vitambulisho vya muda vinavyozungushwa na AWS. Hakuna vitambulisho
tuli vinavyohitajika.

**Jibu**: C

**Ufafanuzi**: Kuambatanisha Jukumu la IAM na tukio la EC2 ndio muundo sahihi.
Tukio hupata kiotomatiki vitambulisho vya muda, vinavyozunguka kupitia huduma ya
metadata ya EC2. Hakuna vitambulisho vya muda mrefu vya kuvuja, kuzungusha, au kwa bahati mbaya
kuviweka kwenye hazina.

**Kwa nini si A?** Vigeu vya mazingira kwenye tukio la EC2 bado vinaweza kuvuja —
kupitia kumbukumbu za programu, nukta za mwisho za kutatua makosa, au ikiwa tukio litahatarishwa.
Vitambulisho tuli ndiyo tatizo, si eneo lao.

**Kwa nini si B?** Kuunda mtumiaji wa IAM unaoshirikiwa na kusambaza vitambulisho kwa timu
kunakiuka upendeleo mdogo na kunafanya kuzungusha vitambulisho kuwa ndoto mbaya. Ikiwa mtu mmoja
ataondoka, huwezi kufuta ufikiaji wao kwa urahisi bila kubadilisha vitambulisho vinavyoshirikiwa.

**Kwa nini si D?** Kutumia vitambulisho vya akaunti ya root kwa programu yoyote ni ukiukaji
mkubwa wa usalama. Akaunti ya root ina ufikiaji usio na kikomo na vitambulisho vyake havipaswi kamwe
kuondoka udhibiti wa mmiliki wa akaunti.

*Kikoa cha SAA-C03 1 — Kazi 1.1 (majukumu ya IAM, upendeleo mdogo)*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inaajiri wasanidi programu watatu wapya mwezi ujao. Kila mmoja atahitaji viwango tofauti
vya ufikiaji: mmoja anafanya kazi kwenye safu ya hifadhidata, mmoja kwenye seva za programu, mmoja kwenye
faili tuli za upande wa mbele. Pia kuna bomba la CI/CD linalohitaji kusambaza msimbo.

Buni muundo wa IAM kwa mazingira haya. Ni watumiaji, makundi, majukumu, na sera zipi
ungeunda? Ni mpaka gani muhimu zaidi wa upendeleo-mdogo ungetekeleza?

*(Hakuna jibu moja sahihi. Fikiri kuhusu kupunguza eneo la mlipuko ikiwa kitambulisho chochote
kimoja kitahatarishwa.)*

## Onyesho la Baada ya Mikopo

Kufikia mwisho wa siku, kila mtumiaji wa IAM alikuwa amewezesha MFA. Akaunti ya Leo ilikuwa imepunguzwa
hadi ufikiaji wa kiwango cha msanidi programu: sambaza kwa mazingira ya dev, soma kutoka ndoo ya
usanidi inayoshirikiwa, hakuna kingine.

Alikuwa amejaribu, mara moja, kufikia hifadhidata ya uzalishaji.

Access denied.

"Je, hivi ndivyo inavyohisi kuaminiwa lakini si sana?" aliuliza.

"Hivyo ndivyo haswa inavyohisi," Priya alisema.

Asubuhi iliyofuata, Tom alifika mapema na akapata kitu kilichomfanya mara moja awaite
timu ndani.

Kwenye kiweko cha AWS, angeweza kuona kwamba tovuti yao ilikuwa ikipata trafiki. Zaidi ya
walivyotarajia. Na seva ya wavuti — ya awali ya Leo — ilikuwa ikiendesha kwa joto. Joto kweli.

"Tuna watumiaji mia moja kwa wakati mmoja," Tom alisema. "Na seva moja."

Katika sura inayofuata: seva ya kwanza — kukodisha kompyuta katika kituo cha data cha mtu mwingine.
