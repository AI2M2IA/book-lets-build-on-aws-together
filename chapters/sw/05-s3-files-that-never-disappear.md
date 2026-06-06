# Sura ya 5: Kabati la Mafaili Linaloishi Katika Wingu

Leo alikuwa akisafisha tukio la EC2 saa tatu asubuhi alipoipata folda.

Ofisi ilikuwa kimya. Maya alikuwa hajafika bado. Kahawa ilikuwa bado ikitengenezwa. Nje ya dirisha, wasafiri wa mapema walikuwa wakipita kidogo kidogo. Leo alikuwa na vipokea sauti vyake masikioni na alikuwa akiteremka kupitia saraka alipositisha.

Faili mia nane. Zote ni picha za menyu. Zote zikiwa kwenye mashine moja bila nakala rudufu.

Tukio la EC2 ambapo programu ya Nimbus ilikuwa ikiendesha lilikuwa limeboreshwa mara moja tangu kukatika kwa dakika kumi na mbili, lakini hifadhi ya picha haikuwa imehama kamwe. Kila arepa iliyokaa, kila sahani ya samaki wa kuchoma, kila bakuli la saladi iliyopangwa kikamilifu — zikikaa kwenye mashine moja pepe ambayo walikuwa tayari wamethibitisha ingeweza kushuka bila onyo.

Na ikiwa mashine hiyo ingewahi kuanzishwa upya, kubadilishwa ukubwa, au kubadilishwa?

Imekwisha.

"Wateja wamepakia picha ngapi mpaka sasa?" Maya aliuliza, alipofika.

Leo aligeuka. "Karibu mia nane."

"Na nini kinatokea kwa picha hizo mia nane tukianzisha upya seva?"

Mojawapo ya kusimama kwa Leo kwenye maana.

Sura hii inahusu faili zinapostahili kuwa wapi kwa kweli katika wingu.

**Tatizo la Kuhifadhi Faili "Kwenye Seva"**

Unapohifadhi faili moja kwa moja kwenye tukio la EC2 — ndani ya mfumo wake wa faili — unazifunga
faili hizo kwenye mzunguko wa maisha wa mashine hiyo mahususi.

Hili huunda matatizo kadhaa:

**Ya muda mfupi kwa asili.** Matukio ya EC2 yanaweza kusimamishwa, kufutwa, kubadilishwa. Diski yao
ya kienyeji haikusudiwi kuwa ya kudumu. Ni nafasi ya muda ya kufanyia kazi.

**Nukta moja ya kushindwa.** Ikiwa tukio litashindwa, faili zinakwenda nalo. Hakuna
nakala rudufu. Hakuna chelezo. Asubuhi moja mbaya na picha mia nane za menyu zinatoweka.

**Haziwezi kushirikiwa katika matukio.** Unapoongeza seva ya pili (ambayo utafanya, katika
Sura ya 7), haitaona faili zilizohifadhiwa kwenye diski ya seva ya kwanza. Seva mbili
zimetengwa. Mtumiaji anayepakia picha anaweza kuiona; mtumiaji mwingine anayegonga seva
tofauti anaweza asiione.

**Hakuna kiwango.** Nafasi ya diski ya EC2 ina kikomo. Ukiijaza, ama unaacha kukubali
upakiaji au unahangaika kupanua hifadhi chini ya shinikizo.

Leo alikuwa hajazingatia kile kinachotokea na seva nyingi. Aliitaja kwa kawaida kwa Priya.

"Subiri — tatizo la picha lingefanya kazi vipi na seva mbili?" Priya aliuliza.

"Unamaanisha nini?"

"Ikiwa tuna Seva A na Seva B nyuma ya kisawazisha mzigo," Priya alisema, "na mteja anapakia picha — ombi lao linakwenda Seva A, sivyo? Kwa hivyo picha imehifadhiwa kwenye diski ya Seva A. Sasa ombi lao linalofuata linakwenda Seva B. Seva B haina picha. Mteja anaona nini?"

Leo alifungua kinywa chake. Kisha akakifunga.

"Picha iliyovunjika," alisema mwishowe.

"Au hitilafu ya 404," Priya alisema. "Au, ikiwa programu itajaribu kuipakia na kuanguka, ukurasa wa hitilafu."

Alichora mpango wa kisawazisha-mzigo kwenye ubao mweupe — kuongeza seva ya pili tayari kilikuwa kwenye ramani ya barabara. Wakati ungetokea, kila upakiaji wa picha ungekuwa kupiga sarafu: pakia kwa Seva A, pengine huudumiwa kutoka Seva B, picha haipo, mteja anachanganyikiwa.

"Tungekuwa tukitatua kwa wiki kabla ya kugundua tatizo lilikuwa nini," Leo alisema.

"Je, tumefikiri kuhusu kile kinachotokea tutakapowasha Auto Scaling na ghafla tuwe na seva tatu au nne?" Priya aliuliza. "Tungekuwa tukikosa picha mara kwa mara."

Hii ni aina ya hitilafu isiyoonekana katika majaribio ya kitengo. Inaonekana tu katika uzalishaji, chini ya mzigo, wakati trafiki halisi inaenezwa katika seva nyingi. Suluhisho ni kuacha kuhifadhi faili kwenye seva kabisa.

Kuna mfano bora. AWS iliujenga mwaka 2006, na bado ni mojawapo ya huduma za wingu zinazotumiwa
zaidi duniani.

**Diski Kuu Inayoishi Mtandaoni**

Picha diski kuu inayoishi kwenye intaneti — inayopanuka kushikilia kiasi chochote
unachowahi kuhitaji, na inakutoza tu kwa kile unachotumia kwa kweli. Huitoi rasilimali kamwe.
Huwa na wasiwasi kamwe kuhusu kuishiwa nafasi. Ukiweka picha mia nane leo
na milioni nane mwakani, hakuna kinachobadilika kwa upande wako isipokuwa kipengele cha bili.

Hivyo ndivyo AWS hutoa. Wanaiita **Amazon S3** — Simple Storage Service.

S3 ni huduma ya hifadhi ya vitu (object storage) ya AWS. Si kabisa kama mfumo wa faili, na si kabisa
kama hifadhidata. Inahifadhi faili — zinazoitwa vitu (objects) — katika vyombo vyenye majina vinavyoitwa ndoo (buckets).
Mfano ni rahisi, na urahisi huo ndio jambo kuu.

Dhana muhimu katika S3 ni **kitu** (object).

Kitu ni faili yoyote: picha, video, PDF, CSV, nakala rudufu, faili ya kumbukumbu. S3
haijali aina au muundo. Inahifadhi baiti na kuzirudisha unapouliza.

Vitu huishi ndani ya **ndoo** (buckets). Ndoo ni kama folda ya kiwango cha juu — chombo chenye jina
ndani ya S3 kinachoshikilia vitu vyako. Kila ndoo ina jina la kipekee kimataifa
(hakuna ndoo mbili katika akaunti zote za AWS zinaweza kushiriki jina) na ipo katika Region
mahususi.

**Jinsi S3 Inavyofanya Kazi**

Una**pakia** kitu kwenye ndoo. S3 hukipa **ufunguo** (key) — kimsingi jina la njia
kama `menus/restaurant-001/photo-arepa.jpg`. Ufunguo huo unatambua kitu kwa kipekee
ndani ya ndoo.

Una**pakua** (au kupata) kitu kwa kutumia jina la ndoo na ufunguo.

Unaweza pia kufanya vitu vifikiwe hadharani — kumaanisha mtu yeyote mwenye URL anaweza kuvipakua.
Hivi ndivyo tovuti nyingi zinavyohudumia picha: hifadhi picha katika S3, ifanye ya umma,
pachika URL katika HTML yako.

Au unaweka vitu vya faragha — vinavyofikika tu kwa maombi yaliyothibitishwa. Huu ndio
mfano sahihi kwa data ya mteja, nakala rudufu, na chochote chenye usiri.

S3 si mfumo wa faili. Hakuna folda halisi. `/` katika jina la ufunguo ni
kawaida tu — S3 huichukulia ufunguo mzima kama mfuatano tambarare. Lakini inaonekana kama folda
na zana nyingi huiwasilisha kama folda, kwa hivyo usijali kuhusu tofauti hii katika
vitendo.

Kuna sifa chache za kiuendeshaji za S3 zinazojalisha katika vitendo lakini hazionekani
wazi kutoka maelezo:

**Kutobadilika kwa kitu**: Vitu vya S3 havihaririwi mahali pake. Ukisasisha faili,
unapakia toleo jipya la kitu chenye ufunguo ule ule. S3 hubadilisha kitu cha zamani na
kipya (au, na uwekaji matoleo umewezeshwa, huweka vyote viwili). Tofauti na hifadhidata ambapo
una`UPDATE` safu, vitu vya S3 ni andika-mara-moja, soma-mara-nyingi. Kwa faili za maandishi na hati
unazohariri mara kwa mara, hili ni sawa — pakia tu toleo jipya. Kwa faili kubwa sana
ambapo unataka tu kusasisha sehemu ya maudhui, mfano wa kitu wa S3 unamaanisha
unapakia upya faili nzima kila wakati.

**Uthabiti imara wa kusoma-baada-ya-kuandika**: Tangu Desemba 2020, S3 hutoa uthabiti
imara kwa vitu vyote — maandishi mapya yanaonekana mara moja kwa usomaji unaofuata.
Kabla 2020, S3 ilikuwa na uthabiti wa hatimaye kwa baadhi ya operesheni, jambo lililosababisha hitilafu za hila
katika programu zilizoandika kitu na mara moja zikajaribu kukisoma. Uboreshaji wa mfano
wa uthabiti uliondoa aina hii ya hitilafu.

**URL za vitu**: Kila kitu cha S3 kina URL. Kwa kitu cha umma, inaonekana kama:
`https://bucket-name.s3.region.amazonaws.com/key/path`. Kwa vitu vya faragha, unaweza
kuzalisha URL zilizosainiwa-awali zenye taarifa ya uthibitishaji na zinazoisha baada ya
muda uliosanidiwa. Miundo yote miwili ya URL ndiyo jinsi programu na vivinjari huvipata
vitu kwa kweli — hakuna itifaki ya umiliki inayohusika.

**Hakuna saraka za kuunda**: Kwa sababu S3 haina folda halisi, hakuna operesheni za uundaji
wa saraka. Unapakia tu kitu chenye ufunguo unaojumuisha kiambishi awali cha njia.
"Folda" huonekana kiotomatiki kwenye kiweko wakati vitu vyenye kiambishi awali hicho
vipo, na hutoweka kiotomatiki wakati vitu vyote vyenye kiambishi awali hicho vinafutwa.

**Kwa Nini S3 Ni Tofauti na Diski Kuu ya Kawaida**

Mambo matatu hufanya S3 kuwa tofauti kimsingi na hifadhi ya faili kwenye tukio la EC2:

**Udumifu.** AWS hubuni S3 kwa udumifu wa asilimia 99.999999999 (nine kumi na moja). Hiyo inamaanisha
kwamba ukihifadhi vitu milioni kumi, unaweza kutarajia kupoteza kitu kimoja kila miaka elfu
kumi kutokana na kushindwa kwa maunzi. Wanafikia hili kwa kuhifadhi nakala nyingi
za kila kitu katika angalau Availability Zones tatu kiotomatiki.

Lakini udumifu hulinda dhidi ya kushindwa kwa maunzi — si dhidi yako kufuta kitu kwa bahati mbaya. Hicho ndicho uwekaji matoleo unatumika.

Kuna tofauti muhimu kati ya **udumifu** (durability) na **upatikanaji** (availability). Udumifu unahusu kama data yako bado ipo. Upatikanaji unahusu kama unaweza kuifikia sasa hivi. S3 Standard hutoa udumifu wa asilimia 99.999999999 na upatikanaji wa asilimia 99.99. Nambari ya udumifu ni ya juu karibu isiyofahamika; takwimu ya upatikanaji ya asilimia 99.99 ni *lengo la ubunifu* — takriban dakika 52 za kutopatikana kwa mwaka. *SLA* ya kimkataba kwa kweli ni ya chini (asilimia 99.9 kwa mwezi), na kuikosa hukupatia mikopo ya huduma, si muda wa kufanya kazi. Katika vitendo, upatikanaji wa S3 ni wa juu zaidi kuliko nambari yoyote — lakini inafaa kuelewa kwamba udumifu na upatikanaji ni dhamana tofauti, na kwamba malengo ya ubunifu na SLA ni ahadi tofauti.

**Upatikanaji.** S3 imebuniwa kufikika hata wakati vipengele binafsi
vinashindwa. Hauunganishi kwa seva moja — unaunganisha kwa mfumo uliotapakaa
unaozunguka kushindwa.

**Kiwango.** S3 hushikilia kiasi cha data kisicho na kikomo kimsingi. Ndoo moja inaweza kushikilia
trilioni za vitu. Amazon yenyewe hutumia S3 kuhifadhi data kwa kiwango ambacho ni vigumu
kufahamu. Ndoo kubwa zaidi za S3 duniani hushikilia exabaiti za data — milioni za
terabaiti. Hudhibiti kiwango hiki; unapakia tu vitu na S3 hushughulikia
kila kitu chini.

**Gharama.** S3 Standard inagharimu takriban dola 0.023 kwa GB kwa mwezi wakati wa kuandika hili.
Kwa picha mia nane za menyu za Nimbus kwa wastani wa MB 2 kila moja, hiyo ni GB 1.6 ya
hifadhi — takriban dola 0.04 kwa mwezi. Hata kwa picha 800,000, unaangalia dola 37 kwa
mwezi kwa hifadhi. Gharama ya hifadhi ile ile kwenye sauti ya EBS ingekuwa takriban
dola 128 kwa mwezi, na dari isiyobadilika iliyohitaji upanuzi kabla hujaongeza zaidi.
S3 hukua kiotomatiki na hutoza kwa uwiano. EBS ina ukubwa usiobadilika na gharama isiyobadilika.

**Uwekaji Matoleo: Kitufe cha Kutendua**

Hapa kuna kitu Maya alikipata alipokuwa akichunguza kiweko cha S3.

S3 inaunga mkono **uwekaji matoleo** (versioning). Unapowezesha uwekaji matoleo kwenye ndoo, S3 huweka kila
toleo la kila kitu — ikiwa ni pamoja na matoleo ya awali na matoleo yaliyofutwa.

Hiki ni kitufe cha kutendua kwa faili zako.

Priya alitaka kukijaribu kabla ya kukiamini. Alipakia picha ya menyu kwenye ndoo, kisha akapakia toleo jipya lenye faili isiyo sahihi — picha nyeusi yote aliyounda kwa sekunde thelathini.

Alifungua kiweko cha S3, akabofya "Onyesha matoleo," na akapata vyote viwili: toleo baya (la sasa) na asili (la awali). Alirejesha toleo la awali kwa kulinakili tena kama toleo jipya la sasa.

"Inafanya kazi," alisema.

"Inagharimu kiasi gani kuweka matoleo hayo yote?" Tom aliuliza.

Unalipia hifadhi ya kila toleo. Ikiwa una matoleo mengi ya faili kubwa, hujikusanya.
AWS ina **sera za mzunguko wa maisha** (lifecycle policies) zinazofuta kiotomatiki matoleo ya zamani baada ya
muda fulani — tunazifunika katika Sura ya 23 tunapozama kwa kina kwa uboreshaji wa gharama.

"Kwa hivyo tunawezesha uwekaji matoleo lakini tunaweka sheria ya mzunguko wa maisha kufuta matoleo ya zamani baada ya siku thelathini," Priya alisema. "Hivyo tunakuwa na dirisha la urejeshaji bila kulipia kuhifadhi kila toleo milele."

Tom aliandika nambari. Gharama ya hifadhi ya siku thelathini za matoleo ilikubalika.

**S3 Event Notifications: Faili Zinazofanya Mambo**

Leo alikuwa akiangalia picha za menyu kutoka pembe tofauti.

"Sasa hivi," alisema, "mgahawa unapopakia picha, tunahifadhi asili kwa ubora kamili.
Baadhi yake ni pikseli elfu nne kwa elfu tatu. Kila wakati mteja anapopakia ukurasa wa menyu kwenye simu,
tunahudumia picha ya megabaiti nne."

"Hilo linagharimu kiasi gani kwa kipimo data?" Tom aliuliza.

Leo alifungua nambari za uhamishaji wa data kwenye bili. Jibu lilikuwa "zaidi ya inavyopaswa kuwa."

S3 ina kipengele kinachoitwa **Event Notifications**. Wakati kitu kinapopakiwa kwenye ndoo, S3 inaweza kuchochea kiotomatiki huduma nyingine — kama Lambda, huduma ya kompyuta isiyo na seva tunayoifunika katika Sura ya 20. Kichocheo hicho kinaweza kuendesha msimbo kujibu upakiaji bila uingiliaji wowote wa mkono.

Suluhisho la Nimbus: kila wakati picha inapopakiwa kwenye ndoo ya picha ghafi, S3 Event Notification huchochea kazi ya Lambda. Kazi ya Lambda husoma picha asili, huzalisha picha ndogo ya upana wa pikseli 400, na huihifadhi kwenye ndoo ya picha zilizochakatwa. Programu inayokabili mteja huhudumia picha ndogo badala ya asili.

Bomba:

1. Mgahawa hupakia picha asili ya MB 4 kwa `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 huwasha Event Notification
3. Kazi ya Lambda husoma asili, huzalisha picha ndogo ya 400x300
4. Lambda huhifadhi picha ndogo kwa `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Mteja hupakia menyu, programu huhudumia picha ndogo ya KB 40 badala ya asili ya MB 4

Matokeo: punguzo la asilimia 99 la kipimo data cha picha. Upakiaji wa kurasa wa haraka zaidi. Laini ndogo ya uhamishaji wa data kwenye bili. Asili zimehifadhiwa kwenye ndoo ghafi, kwa hivyo ikiwa Nimbus itawahi kutaka kuzalisha matoleo ya ubora wa juu zaidi, malighafi ipo.

"Hiyo inaendesha kiotomatiki?" Maya aliuliza.

"Kila wakati mtu yeyote anapopakia picha," Leo alisema. "Hatuigusi kamwe."

Muundo huu — uchakataji unaoendeshwa-na-matukio uliochochewa na matukio ya hifadhi — ni mojawapo ya mifumo ya kawaida na yenye nguvu zaidi katika usanifu wa kisasa wa wingu. Tunaurudia kwa kina katika Sura ya 20.

**Cross-Region Replication: Wakati Nakala Moja Haitoshi**

Priya aliibua swali la uzingatiaji mwishoni mwa wiki.

"Ikiwa Nimbus itapanuka kuhudumia migahawa katika EU," alisema, "na migahawa hiyo inapakia picha — je, picha hizo zinahifadhiwa katika ndoo yetu ya `us-west-2`?"

"Ndiyo," Leo alisema.

"Na je, GDPR ina lolote la kusema kuhusu mahali data hiyo inapohifadhiwa?"

Inayo. Masharti ya uhamishaji wa data ya GDPR yanamaanisha kwamba data binafsi kuhusu wakazi wa EU inaweza kuhitaji hifadhi ndani ya EU au katika mamlaka yenye ulinzi wa data wa kutosha.

Jibu la S3 kwa hili ni **Cross-Region Replication** (CRR). Unapowezesha CRR kwenye ndoo, kila kitu kipya kinachopakiwa hunakiliwa kiotomatiki kwenye ndoo katika Region nyingine. Unasanidi ndoo ya chanzo, ndoo ya marudio, na jukumu la IAM linalompa S3 ruhusa ya kutekeleza unakili.

Wakati upanuzi wa EU utakapotokea, mpango ni huu: picha zilizopakiwa na migahawa ya EU zitaenda kwenye ndoo ya `eu-west-1`, na CRR itazinakili kwenye ndoo ya nakala rudufu katika `eu-central-1` (Frankfurt) kwa urejeshaji wa maafa. Data ya EU inabaki katika Regions za EU.

"Hilo lingegharimu kiasi gani?" Tom aliuliza.

Gharama za uhamishaji wa data wa kuvuka-eneo na hifadhi zinatumika — takriban kiwango cha uhamishaji cha kwa-GB kutoka Region ya chanzo hadi marudio, pamoja na hifadhi kwa nakala zilizonakiliwa. Tom alifanya hesabu kwenye kiasi cha picha cha EU kinachotarajiwa cha Nimbus na akaamua kingekubalika.

"Na vipi ikiwa mtu atajaribu kuingia kwa nguvu kwenye bomba la unakili?" Priya aliuliza. "Jukumu la IAM linalotekeleza unakili linapaswa kuwekewa upeo kwa karibu — vitendo vya unakili vya S3 pekee, kwenye ndoo mahususi pekee."

Aliandika hitaji hilo katika mpango wa upanuzi.

**Multipart Upload na Tatizo la Upakiaji Usiokamilika**

Tom alipata kipengele cha bili kisichotarajiwa kwenye bili ya AWS.

"Tunalipia hifadhi katika S3," alisema, "lakini kiasi ni cha juu zaidi kuliko ningetarajia kutoka idadi ya picha tulizo nazo."

Leo alichunguza. Alipata kategoria katika ripoti ya S3 Storage Lens: **upakiaji wa multipart usiokamilika**.

Wakati S3 inapakia faili kubwa kuliko ukubwa fulani, hutumia **multipart upload**: faili hugawanywa katika sehemu, kila sehemu hupakiwa tofauti, na kisha sehemu hukusanywa kuwa kitu cha mwisho. Hii hufanya upakiaji mkubwa kuwa wa kuaminika zaidi — ikiwa sehemu moja itashindwa, sehemu hiyo tu inahitaji kujaribiwa tena, si faili nzima.

Lakini ikiwa multipart upload itaanzishwa kisha kuachwa — mtumiaji alifunga kivinjari, mtandao ulikatika, programu ilianguka — sehemu za sehemu hubaki katika S3, zikikusanya gharama za hifadhi. Hazionekani kama vitu vilivyokamilika, lakini zinatozwa kama hifadhi.

"Kiasi gani?" Tom aliuliza.

"Karibu dola 12 kwa mwezi," Leo alisema. "Kutoka upakiaji wa sehemu ambao haukukamilika kamwe."

Suluhisho: **sheria ya mzunguko wa maisha** ya S3 inayofuta kiotomatiki upakiaji wa multipart usiokamilika baada ya siku saba. Upakiaji wowote ambao haujakamilika kwa wiki huachwa, na sehemu za sehemu husafishwa.

Tom aliongeza sheria ya mzunguko wa maisha mchana ule. Gharama ya dola 12/mwezi ilitoweka ndani ya siku chache.

"Hizo ni dola 144 kwa mwaka," Tom alisema, akiangalia lahajedwali lake. "Kwa chochote."

"Tayari niliweka jaribio la mzigo lililotumia upakiaji wa multipart," Leo alisema. "Lo." Akasimama. "Hizo pengine ni nyingi kati yake. Nilisahau kuzisafisha wakati jaribio lilipoisha."

Tom aliiandika hata hivyo.

**Udhibiti wa Ufikiaji: Umma dhidi ya Faragha**

Kwa chaguomsingi, kila kitu katika S3 ni cha faragha. Akaunti yako ya AWS pekee inaweza kukifikia.

Unaweza kufanya vitu binafsi viwe vya umma — ambavyo ndivyo ungehudumia picha za menyu kwa
wageni wa tovuti. Au unaweza kuweka kila kitu cha faragha na kuzalisha **URL zilizosainiwa-awali**
(pre-signed URLs): viungo vyenye kikomo cha muda vinavyomruhusu mtu kupakua kitu mahususi bila kuhitaji vitambulisho
vya AWS. Vinafaa kwa kumruhusu mteja kupakua ankara yake kwa masaa 24.

Priya alikuwa na maoni makali sana kuhusu hili.

"Na vipi ikiwa mtu atajaribu kuingia kwa nguvu kupitia ndoo iliyosanidiwa vibaya?" alisema. "Kamwe usifanye ndoo iwe ya umma kabisa isipokuwa umeamua kwa makusudi kufanya kila
kitu ndani yake kifikike kwa mtandao mzima. Kosa la usalama la S3 la kawaida zaidi
ni kufichua kwa bahati mbaya ndoo iliyo na data yenye usiri."

AWS sasa ina mpangilio wa "Block Public Access" unaoweza kuutumia katika kiwango cha akaunti,
ukilazimisha ndoo zote kuwa za faragha isipokuwa uipuuze waziwazi kwa kila ndoo.

Uwezeshe. Daima.

Historia ya hili: kabla AWS haijaongeza Block Public Access ya kiwango cha akaunti, tukio
la usalama la S3 la kawaida zaidi lilikuwa kufanya ndoo iwe ya umma kwa bahati mbaya. Msanidi programu aliunda
ndoo kwa majaribio, akakagua kisanduku cha "umma" kwa urahisi, akaongeza faili kadhaa ikiwa ni pamoja
na chache kutoka folda zingine ambazo hakuwa amezifikiri, kisha akaisahau. Ndoo
ilikaa pale, ikifikika hadharani, kwa miezi. Katika visa vichache vya hadhi ya juu, "ndoo iliyosahaulika
ya majaribio" ilikuwa na data ya mteja, hati za ndani, au vitambulisho.

Block Public Access ya kiwango cha akaunti ni kinga dhidi ya hili. Hata kama msanidi programu
atasanidi ndoo kuwa ya umma kwa bahati mbaya, mpangilio wa kiwango cha akaunti utaipuuza.
Lazima ulemaze waziwazi mpangilio wa kiwango cha akaunti kabla ndoo yoyote haijaweza kuwa
ya umma — jambo linaloumba kizuizi cha kasi cha makusudi kinachozuia ajali.

Nimbus ilikuwa na Block Public Access imewezeshwa katika kiwango cha akaunti. Kwa hivyo picha za menyu
zilizohitaji kufikika hadharani zingehudumiwaje? Muundo wa kawaida — ule Nimbus
ungeufuata baadaye, katika Sura ya 13 — ni kuweka CDN kama CloudFront mbele ya
ndoo na sera ya Origin Access Control: CDN inaweza kupata vitu kutoka ndoo ya faragha ya
S3, lakini hakuna anayeweza kufikia ndoo moja kwa moja. Muundo huu ni salama zaidi kuliko
ndoo ya umma na huruhusu akiba ya CDN kupunguza gharama za maombi ya S3.

"Subiri — lakini *kwa nini* tungelifanya hivyo?" Maya aliuliza. "Picha ni za umma hata hivyo,
kwa hivyo kwa nini inajalisha ikiwa ndoo ni ya umma?"

"Kwa sababu ndoo ya umma inamaanisha mtu yeyote anaweza kuorodhesha kilichomo ndani yake," Priya alisema. "Wanaweza
kuorodhesha vitu vyote katika ndoo. Na CloudFront mbele, wanaona tu
URL tunazozifichua katika programu. Ndoo yenyewe inabaki ya faragha."

Maya aliongeza "kuorodhesha" kwenye modeli yake ya kiakili ya nyuso za shambulio.

**S3 Storage Classes: Si Data Zote Zinalingana**

Si data zote zinafikiwa kwa usawa.

Picha zako za menyu maarufu zaidi hupatikana mara dazeni kwa sekunde. Kumbukumbu zako kutoka
miaka mitatu iliyopita hufikiwa labda mara moja kwa mwaka, ikiwa kabisa. S3 hutambua hili na hutoa
**storage classes** tofauti zenye uwiano tofauti wa utendaji na gharama.

| Storage Class           | Matumizi                                      | Upataji          | Gharama                       |
|-------------------------|-----------------------------------------------|------------------|-------------------------------|
| S3 Standard             | Data inayofikiwa mara kwa mara                | Papo hapo        | Juu zaidi kwa GB              |
| S3 Standard-IA          | Ufikiaji wa nadra, bado unahitaji upataji wa haraka | Papo hapo  | Chini kwa GB, ada ya upataji  |
| S3 Glacier Instant      | Kumbukumbu zinazofikiwa mara chache           | Papo hapo        | Chini sana zaidi              |
| S3 Glacier Flexible     | Kumbukumbu zinazofikiwa nadra sana            | Dakika hadi masaa| Chini sana                    |
| S3 Glacier Deep Archive | Kumbukumbu za uzingatiaji, hazifikiwi karibu kamwe | Hadi masaa 12 | Chini zaidi                  |

Tunazama kwa kina kwa hizi katika Sura ya 23. Kwa sasa: dhana ni kwamba unaweza kiotomatiki
kuhamisha vitu kati ya storage classes kulingana na umri wao na mifumo ya ufikiaji, ukiokoa
pesa nyingi kwa data ambayo huigusi mara chache.

Pia kuna **S3 Intelligent-Tiering** — storage class inayohamisha kiotomatiki
vitu kati ya tabaka za ufikiaji-wa-mara-kwa-mara na ufikiaji-wa-nadra kulingana na mifumo ya ufikiaji
iliyozingatiwa. Unalipa ada ndogo ya ufuatiliaji kwa kila kitu kwa mwezi, na S3 hushughulikia
utabaka kiotomatiki. Hii ni muhimu wakati huna uhakika ni vitu vipi vitafikiwa
mara kwa mara na vipi havitafikiwa — huduma hujifunza muundo na huboresha
ipasavyo.

Mbinu ya Tom ilikuwa ya mkono zaidi: "Nataka kujua kila dola inakwenda wapi." Alichagua
sheria wazi za mzunguko wa maisha badala ya Intelligent-Tiering, kwa sababu sheria wazi zinatabirika
na zinaweza kukaguliwa. Baada ya miezi sita ya kuendesha hifadhi ya S3 ya Nimbus, alikuwa na picha wazi
ya mifumo ya ufikiaji na angeweza kuweka sheria za mzunguko wa maisha zilizohamisha vitu kwa Standard-IA
baada ya siku 30 na kwa Glacier Flexible Retrieval baada ya siku 180.

Akiba jumla ya hifadhi kutokana na usimamizi wa mzunguko wa maisha mwaka wa kwanza: takriban
dola 340. Si ya kubadilisha maisha, lakini halisi — na muundo hurudia katika dazeni za ndoo
katika akaunti yoyote ya AWS ya kweli.

"Hiyo ni karibu safari ya ndege ya kwenda na kurudi," Maya alisema.

"Ni mazoezi mazuri ya uhandisi," Tom alisema. Aliiweka kwenye lahajedwali.

Kuna mtego mmoja katika uteuzi wa storage class unaowakamata timu nyingi: **muda wa chini
wa hifadhi**. S3 Standard-IA ina muda wa chini wa hifadhi wa siku 30 — ikiwa una
hifadhi kitu katika Standard-IA na kukifuta baada ya siku 15, bado unalipia siku 30.
Glacier Flexible Retrieval ina kima cha chini cha siku 90. Glacier Deep Archive ina kima cha chini
cha siku 180.

Kwa vitu vinavyofutwa mara kwa mara au vyenye maisha mafupi, vima hivi vya chini hufanya
classes za IA na Glacier kuwa ghali zaidi kuliko Standard, si chini. Kabla ya kuhamia kwa
storage class nafuu, hakiki kwamba vitu vitaishi pale muda mrefu wa kutosha
ili akiba izidi adhabu za muda wa chini.

## Nguvu na Mapungufu

**Kwa nini S3 ni bora kabisa**:

- Udumifu wa nine-kumi-na-moja. Data yako iko salama zaidi katika S3 kuliko karibu mfumo mwingine wowote.
- Kiwango kisicho na kikomo. Huhitaji kamwe kutoa hifadhi — inakua tu.
- Nafuu sana kwa kile inachotoa (sehemu za senti kwa GB kwa mwezi).
- Ujumuishaji wa asili na karibu kila huduma nyingine ya AWS.
- Inaunga mkono upangishaji wa tovuti tuli — unaweza kuhudumia tovuti tuli kamili
  moja kwa moja kutoka S3, bila seva inayohitajika.
- Uchakataji unaoendeshwa na matukio: S3 Event Notifications huchochea Lambda, SQS, au SNS
  kiotomatiki wakati vitu vinapoundwa au kufutwa, kuwezesha mabomba ya uchakataji yenye nguvu
  bila kuuliza-uliza au kazi zilizopangwa.
- Cross-Region Replication kwa makazi ya data ya uzingatiaji na urejeshaji wa maafa.

**Ambapo S3 si chaguo sahihi**:

- S3 si mfumo wa faili. Ikiwa programu yako inahitaji kuweka diski na kuitumia kama
  diski ya kienyeji (kusoma, kuandika, kurekebisha faili mahali pake), S3 ni zana isiyo sahihi.
  Tumia EFS (Elastic File System, Sura ya 6) au EBS badala yake.
- S3 ina latensi ya juu zaidi inayoonekana kuliko diski ya kienyeji. Kwa hifadhidata au
  programu zinazohitaji I/O ya haraka, ya ufikiaji wa nasibu, hifadhi ya kizuizi (EBS, Sura ya 6)
  inafaa.
- Uhamishaji wa data *ndani* ya S3 ni bila gharama za kipimo data — lakini si bure kabisa:
  kila upakiaji ni ombi la PUT, na S3 hutoza kwa kila ombi. Kupakia mamilioni ya
  vitu vidogo kunaweza kugharimu zaidi kwa ada za maombi kuliko kwa hifadhi. Uhamishaji wa data *nje*
  hugharimu pesa kwa GB. Vyote viwili ni mishtuko ya kawaida ya bili — tunavishughulikia katika Sura ya 30.
- S3 si hifadhidata. Unaweza kuhifadhi na kupata vitu kwa ufunguo, lakini huwezi
  kuhoji vitu kwa maudhui yao, kuendesha mikusanyiko, au kufanya operesheni za uhusiano.
  Ikiwa unahitaji kuhoji maudhui ya data iliyohifadhiwa (si tu kuipata kwa jina),
  unahitaji hifadhidata au huduma kama Athena (Sura ya 26) inayoweza kuhoji vitu vya S3
  kwa kutumia SQL.
- Uwekaji matoleo ya vitu huhifadhi gharama zinazoongezeka. Kila toleo la awali la kila kitu
  chenye matoleo hutozwa kama hifadhi. Sheria za mzunguko wa maisha zinazofuta matoleo ya zamani
  si za hiari — ni sehemu ya mkakati wa usimamizi wa gharama kwa ndoo yoyote
  yenye uwekaji matoleo umewezeshwa.

**Jinsi Vitu vya S3 Vinavyosimbwa**

"Na vipi ikiwa mtu atajaribu kuingia kwa nguvu?" Priya aliuliza, kama ilivyotarajiwa, siku ambayo picha zilianza kufanya kazi. "Je, vitu hivi vimesimbwa wakati vimehifadhiwa?"

Vilikuwa — na hilo linafaa kuelewa, kwa sababu usimbaji wa S3 ni mojawapo ya mada zinazojaribiwa zaidi kwenye mtihani. Kila kitu kinachopakiwa kwa S3 husimbwa wakati kimehifadhiwa kwa chaguomsingi. Swali ni *nani ana ufunguo*:

**SSE-S3 (chaguomsingi)**: S3 husimba kila kitu kwa funguo ambazo S3 yenyewe inazidhibiti, kwa kutumia AES-256. Hufanyi chochote, husanidi chochote, hulipi chochote. Tangu Januari 2023, hii ni otomatiki kwenye kila ndoo. Kwa data nyingi, inatosha.

**SSE-KMS**: S3 husimba vitu kwa ufunguo wa KMS — ama ufunguo wa `aws/s3` unaodhibitiwa na AWS au ufunguo unaodhibitiwa na mteja unaoudhibiti (Sura ya 16 inafunika KMS kwa kina). Unachopata: njia ya ukaguzi katika CloudTrail ya kila matumizi ya ufunguo, uwezo wa kudhibiti haswa nani anaweza kusimbua kupitia sera ya ufunguo, na uwezo wa kufuta ufikiaji kwa kulemaza ufunguo. Unacholipa: gharama za API za KMS kwa kila ombi. Kwa viwango vya juu vya maombi, wezesha **S3 Bucket Keys** — S3 hupata ufunguo wa kiwango cha ndoo wa muda mfupi kutoka ufunguo wako wa KMS, ukikata miito ya API ya KMS (na gharama) kwa hadi asilimia 99.

**SSE-C**: Wewe hutoa ufunguo wako wa usimbaji *na kila ombi*. AWS hutumia katika kumbukumbu na haihifadhi kamwe. Kwa mashirika ambayo sheria zao za uzingatiaji zinasema AWS haipaswi kamwe kushikilia ufunguo. Yenye mahitaji ya kiuendeshaji — poteza ufunguo, poteza data.

Muundo wa mtihani: "usimbaji wenye njia ya ukaguzi ya matumizi ya ufunguo" au "dhibiti nani anaweza kusimbua" → SSE-KMS. "Kampuni lazima isimamie funguo zake na AWS haipaswi kamwe kuzihifadhi" → SSE-C. "Usimbaji wakati umehifadhiwa bila mzigo wa usimamizi" → SSE-S3 (tayari imewashwa).

**S3 Object Lock: Andika Mara Moja, Soma Mara Nyingi**

Baadhi ya data lazima iwe *isiyowezekana* kufuta — si iliyolindwa na sera, bali isiyobadilika kimuundo. Rekodi za biashara za kifedha, kumbukumbu za ukaguzi, ushahidi wa kisheria. **S3 Object Lock** hufanya vitu visiweze kufutwa na visiweze kurekebishwa kwa kipindi cha uhifadhi, hata na wasimamizi. Inahitaji uwekaji matoleo, nayo huja katika modi mbili ambazo mtihani hupenda kulinganisha: **modi ya governance** (watumiaji wenye ruhusa maalum bado wanaweza kupita kufuli) na **modi ya compliance** (hakuna anayeweza kufupisha uhifadhi au kufuta kitu — hata mtumiaji wa root — mpaka kipindi kitakapoisha). Vishazi vya udhibiti kama "WORM storage" au "SEC Rule 17a-4" ni vichocheo vya mtihani vya Object Lock katika modi ya compliance.

**S3 Transfer Acceleration: Upakiaji wa Haraka kutoka Mbali**

Wakati watumiaji wanapakia faili kubwa kwenye ndoo kutoka upande mwingine wa dunia, sehemu ya polepole ni njia ndefu ya intaneti ya umma kwenda Region ya ndoo. **S3 Transfer Acceleration** huipa ndoo nukta maalum ya mwisho inayoelekeza upakiaji kwenye edge location iliyo karibu zaidi ya AWS, kisha huubeba kupitia uti wa mgongo wa faragha wa AWS kwenda ndoo. Kichocheo cha mtihani: "watumiaji ulimwenguni kote hupakia faili kubwa kwenye ndoo kuu; upakiaji ni polepole" → Transfer Acceleration (mara nyingi pamoja na multipart upload). Zingatia mwelekeo: Transfer Acceleration inahusu kupata data *ndani* ya S3; CloudFront inahusu kuhudumia data *nje*.

Storage class moja zaidi inayofaa kujua sasa: **S3 One Zone-IA** — kama Standard-IA lakini imehifadhiwa katika Availability Zone moja, takriban asilimia 20 nafuu, kwa data inayofikiwa nadra ambayo ungeweza kuiunda upya ikiwa AZ hiyo ingepotea (picha ndogo, ripoti zinazoweza kuzalishwa upya). Ni kibambaza cha kawaida cha mtihani; Sura ya 23 inafunika wigo kamili wa storage-class.


## Muhtasari

Picha mia nane kwenye tukio moja lilikuwa tatizo. S3 ililitatua — lakini S3 ni zaidi ya mahali pa kuhifadhi faili. Ni hifadhi ya vitu yenye udumifu, inayopanuka, inayofikika kimataifa yenye mfano wake wa ufikiaji, storage classes, sera za mzunguko wa maisha, na mfumo wa matukio. Kuelewa S3 inachokifanya vizuri, na kile ambacho kwa makusudi haifanyi, hutengeneza kila uamuzi wa hifadhi ambao timu ingefanya kuanzia hapa mbele.

- **Amazon S3** ni hifadhi ya vitu — faili (vitu) katika vyombo vyenye majina (ndoo). Inahifadhi nakala katika angalau Availability Zones tatu kwa udumifu wa nine-kumi-na-moja. S3 si mfumo wa faili: tumia EFS kwa uwekaji unaoshirikiwa, EBS kwa hifadhi ya kizuizi ya tukio-moja.
- Faili zilizohifadhiwa kwenye matukio ya EC2 zimefungwa kwenye mzunguko wa maisha wa tukio hilo, zikisababisha hitilafu za picha-zinazokosekana wakati trafiki inaenezwa katika seva nyingi. S3 hulitatua kwa kuwa huru kutoka tukio lolote.
- **Uwekaji matoleo** huhifadhi matoleo ya awali ya vitu. **Sheria za mzunguko wa maisha** huotomatisha mabadiliko kati ya storage classes na husafisha upakiaji wa multipart usiokamilika ambao vinginevyo ungekusanya gharama za bili kimya.
- Kwa chaguomsingi, S3 ni ya faragha. Wezesha "Block Public Access" katika kiwango cha akaunti. Hudumia vitu vya umma kupitia CloudFront na Origin Access Control badala ya kufanya ndoo kuwa za umma moja kwa moja.
- Storage classes za S3 hukuruhusu kulinganisha gharama na marudio ya ufikiaji — lakini angalia gharama za muda wa chini wa hifadhi kabla ya kuhamisha vitu vyenye maisha mafupi kwa tabaka za Infrequent Access au Glacier.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03 3 — Kazi 3.1 (suluhisho za hifadhi zenye utendaji wa juu)*

- **S3 ni hifadhi ya vitu, si hifadhi ya kizuizi.** Wakati mazingira ya mtihani yanahitaji
  mfumo wa faili ambao seva nyingi zinaweza kuweka, hiyo ni EFS. Inapohitaji diski
  kwa tukio moja la EC2, hiyo ni EBS. Inapohitaji kuhifadhi faili, nakala rudufu,
  picha, au data inayofikiwa kupitia HTTP — hiyo ni S3.
- **Udumifu wa nine-kumi-na-moja** unamaanisha S3 hunakili data katika AZ nyingi
  kiotomatiki. Husanidi hili — ni chaguomsingi.
- **S3 ni ya kieneo**, lakini inafikika kimataifa. Ndoo zipo katika Region mahususi,
  lakini unaweza kuzifikia kutoka popote.
- **URL zilizosainiwa-awali** huruhusu ufikiaji wenye kikomo cha muda kwa vitu vya faragha. Muundo wa kawaida:
  programu yako huzalisha URL iliyosainiwa-awali halali kwa dakika 15, huimpa
  mtumiaji, mtumiaji hupakua faili moja kwa moja kutoka S3.
- **S3 Standard-IA** ina gharama ya muda wa chini wa hifadhi (siku 30). Usiitumie
  kwa data utakayofuta haraka. Mtihani hujaribu kama unajua uwiano wa biashara
  kati ya storage classes.
- **Mti wa uamuzi wa storage class**: *inafikiwa mara kwa mara* → S3 Standard; *inafikiwa nadra lakini inahitaji upataji wa haraka* → S3 Standard-IA; *kumbukumbu inafikiwa mara chache* → S3 Glacier Instant Retrieval; *kumbukumbu inafikiwa nadra sana* → S3 Glacier Flexible Retrieval; *kumbukumbu ya uzingatiaji, haifikiwi karibu kamwe* → S3 Glacier Deep Archive.
- **Cross-Region Replication** inahitaji uwekaji matoleo uwezeshwe kwenye ndoo za chanzo na marudio zote mbili. Maswali ya mtihani kuhusu urejeshaji wa maafa au uhuru wa data mara nyingi huhusisha CRR.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Kwa maneno yako mwenyewe: kitu cha S3 ni nini? Ndoo ya S3 ni nini? Kwa nini kuhifadhi faili
katika S3 ni bora kuliko kuzihifadhi kwenye diski ya kienyeji ya tukio la EC2?

*(Kidokezo: Fikiri kuhusu kile kinachotokea kwa faili kwenye tukio la EC2 ikiwa tukio
litafutwa. S3 hufanya nini tofauti?)*

**Zoezi la 2 — Mazingira ya SAA-C03**

*Mazingira*: Kampuni ya vyombo vya habari huzalisha video za maandishi. Wanahitaji kuhifadhi picha za
4K asili (zinazofikiwa mara kwa mara wakati wa uzalishaji), kazi za mwisho zilizohaririwa (zinazofikiwa kila mwezi
kwa usambazaji), na masta za kumbukumbu (zilizowekwa bila kikomo lakini zinazofikiwa zaidi mara moja
kwa mwaka kwa madhumuni ya uzingatiaji). Wanataka kupunguza gharama za hifadhi wakati wa kukidhi
mahitaji ya ufikiaji ya kila tabaka.

Ni mkakati gani wa hifadhi unaokidhi mahitaji yao VIZURI ZAIDI?

A) Hifadhi picha asili katika S3 Standard, kazi za mwisho katika S3 Standard-IA, na kumbukumbu
   katika S3 Glacier Deep Archive  
B) Hifadhi maudhui yote katika S3 Standard kwa utendaji thabiti na urahisi  
C) Hifadhi maudhui yote kwenye hifadhi ya tukio la EC2 kwa ufikiaji wa haraka zaidi  
D) Hifadhi maudhui yote katika S3 Glacier Deep Archive kupunguza gharama

**Kidokezo cha 1**: Faili tofauti zina mifumo tofauti ya ufikiaji. S3 hutoa storage
classes tofauti kwa marudio tofauti ya ufikiaji. Ni class gani inalingana na "inafikiwa mara kwa mara"?

**Kidokezo cha 2**: Kumbukumbu zinazofikiwa "zaidi mara moja kwa mwaka" hazihitaji upataji wa papo hapo.
Ni storage class gani imebuniwa kwa uhifadhi wa muda mrefu kwa gharama ya chini zaidi?

**Kidokezo cha 3**: Linganisha marudio ya ufikiaji ya kila tabaka na storage class inayofaa.
Inafikiwa mara kwa mara = Standard. Kila mwezi = Standard-IA. Mara moja kwa mwaka = Glacier Deep Archive.

**Jibu**: A

**Ufafanuzi**: Mkakati huu unalinganisha kwa usahihi kila tabaka la data na storage
class inayofaa ya S3. Picha asili zinazofikiwa mara kwa mara zinabaki katika Standard kwa
ufikiaji wa papo hapo bila ada za upataji. Kazi za mwisho zinazofikiwa kila mwezi zinaenda Standard-IA
(gharama ya hifadhi ya chini, ada ya upataji nafuu). Kumbukumbu zinazofikiwa mara moja kwa mwaka zinaenda
Glacier Deep Archive kwa gharama ya hifadhi ya chini zaidi iwezekanavyo.

**Kwa nini si B?** Kuhifadhi kila kitu katika Standard ni rahisi lakini ghali.

**Kwa nini si C?** Hifadhi ya tukio la EC2 ni ya muda mfupi na haifai kwa uhifadhi wa muda mrefu
wa vyombo vya habari. Ikiwa tukio litafutwa, maudhui yote yamepotea.

**Kwa nini si D?** Glacier Deep Archive ina nyakati za upataji hadi masaa 12. Kuhifadhi
picha za uzalishaji zinazofikiwa mara kwa mara hapo kungefanya kazi ya uzalishaji isiwezekane.

*Kikoa cha SAA-C03 3 — Kazi 3.1 / Kikoa 4 — Kazi 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus huhifadhi picha za maagizo zilizopakiwa na wateja katika S3. Kanuni ya ulinzi wa data
inahitaji kwamba picha za wateja lazima zihifadhiwe kwa miaka 7 lakini zinaweza kufutwa baada ya
hapo. Timu pia inataka kupunguza gharama ya kuhifadhi picha za zamani kutoka miaka iliyopita.

Buni mkakati wa hifadhi wa S3 kwa hitaji hili. Ni storage classes zipi ungetumia,
na lini ungehama kati yake? Ungefanya nini kuhusu hitaji la kufuta?

*(Kidokezo: Fikiri kuhusu sera za mzunguko wa maisha. Hakuna jibu moja sahihi — hoji
kupitia uwiano wa gharama dhidi ya muda wa upataji.)*

## Onyesho la Baada ya Mikopo

Leo alihamisha picha za menyu kwenda S3 mchana ule. Vitu mia nane, vimehifadhiwa salama
katika Availability Zones tatu, na uwekaji matoleo umewezeshwa.

"Kwa kweli ziko salama zaidi sasa kuliko zilivyokuwa awali," alisema, kwa kuridhika fulani.

"Daima zilikuwa salama zaidi katika S3," Priya alisema. "Tulisubiri tu hadi baada ya kujenga
tatizo ili kulirekebisha."

Leo alikubali hili.

Asubuhi iliyofuata, Tom alifika na chapisho. Bili ya AWS, iliyowekewa maelezo kwa kalamu nyekundu.

"Tuna tatizo la hifadhidata," alisema. "Tunaendesha hifadhidata yetu ya maagizo kwenye tukio
lile lile la EC2 kama seva ya wavuti. Na hifadhidata yetu ya menyu. Na rekodi za wateja wetu."

Akasimama.

"Kila kitu kiko katika mashine ile ile. Mashine moja. Data zetu zote."

Maya aliangalia chapisho. Kisha Tom. Kisha dari.

"Na ikiwa mashine hiyo itavunjika?"

Tom alionyesha maelezo ya kalamu nyekundu.

Katika sura inayofuata: tofauti kati ya diski kuu unayoikodisha na kabati la mafaili ambalo ofisi nzima inashiriki.
