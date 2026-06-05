# Sura ya 5: Baraza la Mawaziri la Kufungua Mafaili Linaloishi Katika Wingu

Leo aligundua kuwa Nimbus alikuwa akihifadhi picha za menyu zilizopakiwa moja kwa moja kwenye mfano wa EC2.
Kila picha ambayo wateja hupakia - uwanja mzuri sana, sahani ya lax iliyochomwa, iliyobanwa kikamilifu
bakuli la saladi - alikuwa ameketi kwenye mashine moja ya kawaida.

Na ikiwa mashine hiyo iliwahi kuwashwa upya, kubadilishwa ukubwa au kubadilishwa?

Imeondoka.

"Wateja wamepakia picha ngapi kufikia sasa?" Maya aliuliza.

Leo alifungua koni. "Takriban mia nane."

"Na nini kitatokea kwa picha hizo mia nane ikiwa tutaanzisha tena seva?"

Kipindi kingine cha Leo cha maana.

Sura hii inahusu ni wapi faili zinamilikiwa katika wingu.

**Tatizo la Kuhifadhi Faili "Kwenye Seva"**

Unapohifadhi faili moja kwa moja kwenye mfano wa EC2 - ndani ya mfumo wake wa faili - uko
kufunga faili hizo kwenye mzunguko wa maisha wa mashine hiyo maalum.

Hii husababisha shida kadhaa:

**Ephemeral kwa asili.** Matukio ya EC2 yanaweza kusimamishwa, kusitishwa, kubadilishwa. Yao
diski ya ndani haikusudiwi kuwa ya kudumu. Ni nafasi ya mkwaruzo kwa muda.

**Hali moja ya kutofaulu.** Ikiwa mfano hautafaulu, faili hufuatana nayo. Hapana
upungufu. Hakuna chelezo. Asubuhi moja mbaya na picha mia nane za menyu hupotea.

**Haiwezi kushiriki katika matukio yote.** Unapoongeza seva ya pili (ambayo utaiweka
Sura ya 7), haitaona faili zilizohifadhiwa kwenye diski ya seva ya kwanza. Seva mbili
wametengwa. Mtumiaji anayepakia picha anaweza kuiona; mtumiaji mwingine akigonga tofauti
seva inaweza si.

**Hakuna kipimo.** Nafasi ya diski ya EC2 ina kikomo. Ukiijaza, utaacha kukubali
upakiaji au kugombana ili kupanua hifadhi chini ya shinikizo.

Kuna mfano bora zaidi. AWS iliijenga mwaka wa 2006, na bado ni mojawapo ya wengi zaidi
kutumika huduma za wingu duniani.

**Amazon S3: Hifadhi Ngumu Inayoishi Mtandaoni**

**Amazon S3** — Huduma Rahisi ya Kuhifadhi — ni huduma ya uhifadhi wa kitu cha AWS.

Ifikirie kama diski kuu inayoishi kwenye mtandao. Hifadhi ngumu isiyo na mwisho.
Moja ambayo imechelezwa kiotomatiki katika Maeneo mengi ya Upatikanaji ili kupoteza
kituo chochote cha data hakipotezi faili zako.

Wazo muhimu katika S3 ni **kitu**.

Kipengee ni faili yoyote: picha, video, PDF, CSV, chelezo, faili ya kumbukumbu. S3
haijali aina au muundo. Huhifadhi baiti na kuwapa tena wakati
unauliza.

Vitu vinaishi ndani **ndoo**. Ndoo ni kama folda ya kiwango cha juu - iliyopewa jina
chombo ndani ya S3 ambacho kinashikilia vitu vyako. Kila ndoo ina jina la kipekee ulimwenguni
(hakuna ndoo mbili kwenye akaunti zote za AWS zinazoweza kushiriki jina) na inapatikana katika maalum
Mkoa.

**Jinsi S3 Inafanya kazi**

Mfano ni rahisi, na unyenyekevu huo ni uhakika.

**unapakia** kitu kwenye ndoo. S3 inaipa **ufunguo** - kimsingi jina la njia
kama `menu/mgahawa-001/photo-arepa.jpg`. Ufunguo huo hutambulisha kitu kwa njia ya kipekee
ndani ya ndoo.

Wewe **kupakua** (au kurudisha) kitu kwa kutumia jina la ndoo na ufunguo.

Unaweza pia kufanya vipengee vipatikane kwa umma - kumaanisha mtu yeyote aliye na URL anaweza kupakua
yao. Hivi ndivyo tovuti nyingi hutumikia picha: kuhifadhi picha katika S3, ifanye iwe ya umma,
pachika URL katika HTML yako.

Au unaweka vitu vya faragha - vinaweza kupatikana kwa maombi yaliyothibitishwa pekee. Hii ni
muundo sahihi wa data ya mteja, chelezo, na chochote nyeti.

S3 sio mfumo wa faili. Hakuna folda halisi. `/` katika jina muhimu ni tu
mkataba - S3 hushughulikia ufunguo mzima kama kamba bapa. Lakini inaonekana kama folda
na zana nyingi zinawasilisha kama folda, kwa hivyo usijali kuhusu tofauti hii ndani
mazoezi.

**Kwa nini S3 ni tofauti na gari ngumu ya kawaida**

Vitu vitatu hufanya S3 kuwa tofauti kabisa na uhifadhi wa faili kwenye mfano wa EC2:

**Uimara.** AWS huunda S3 kwa uimara wa 99.99999999% (kumi na moja na tisa). Hiyo ina maana
kwamba ukihifadhi vitu milioni kumi, unaweza kutarajia kupoteza kitu kimoja kila kumi
miaka elfu kutokana na kushindwa kwa vifaa. Wanafanikisha hili kwa kuhifadhi nakala nyingi
ya kila kitu katika angalau Kanda tatu za Upatikanaji kiotomatiki.

**Upatikanaji.** S3 imeundwa ili kufikiwa hata wakati vijenzi mahususi
kushindwa. Hauunganishi kwenye seva moja - unaunganisha kwenye mfumo unaosambazwa
ambayo inazunguka kushindwa.

**Kipimo.** S3 ina idadi isiyo na kikomo ya data. Ndoo moja inaweza kushikilia
matrilioni ya vitu. Amazon yenyewe hutumia S3 kuhifadhi data kwa kiwango ambacho ni ngumu
fahamu.

**Uchapishaji: Kitufe cha Tendua**

Hiki ndicho kitu ambacho Maya alipata alipokuwa akivinjari kiweko cha S3.

S3 inasaidia **versioning**. Unapowasha toleo kwenye ndoo, S3 huweka kila
toleo la kila kitu - ikijumuisha matoleo ya awali na matoleo yaliyofutwa.

Hiki ndicho kitufe cha kutendua cha faili zako.

Pakia picha mpya ya menyu ambayo hubatilisha ya zamani kimakosa? Toleo la zamani ni
bado ipo. Je, ungependa kufuta faili kimakosa? Inaweza kurejeshwa. Gonga na ransomware hiyo
inafuta faili zako zote na takataka zilizosimbwa kwa njia fiche? Kwa toleo, unarejesha kutoka
kabla ya shambulio hilo.

"Inagharimu kiasi gani kuweka matoleo hayo yote?" Tom aliuliza.

Unalipa kwa hifadhi ya kila toleo. Ikiwa una matoleo mengi ya faili kubwa, ni
huongeza. AWS ina **sera za mzunguko wa maisha** ambazo hufuta matoleo ya zamani kiotomatiki
kwa wakati fulani - tunashughulikia zile zilizo katika Sura ya 23 tunapozingatia uboreshaji wa gharama.

**Udhibiti wa Ufikiaji: Umma dhidi ya Faragha**

Kwa chaguo-msingi, kila kitu katika S3 ni cha faragha. Akaunti yako ya AWS pekee ndiyo inayoweza kuipata.

Unaweza kufanya vitu vya kibinafsi hadharani - ambayo ni jinsi ungependa kutoa picha za menyu
wageni wa tovuti. Au unaweza kuweka kila kitu kuwa cha faragha na kutoa **URL zilizotiwa saini awali**:
viungo visivyo na muda ambavyo huruhusu mtu kupakua kitu maalum bila kuhitaji AWS
sifa. Ni sawa kwa kumruhusu mteja kupakua ankara yake kwa saa 24.

Priya alikuwa na maoni makali sana kuhusu hili.

"Usifanye ndoo kuwa wazi kabisa isipokuwa umeamua kwa uangalifu kufanya kila kitu
kitu ndani yake kupatikana kwa mtandao mzima," alisema. "Usalama wa kawaida wa S3
kosa ni kufichua kwa bahati mbaya ndoo ambayo ina data nyeti."

AWS sasa ina mpangilio wa "Zuia Ufikiaji wa Umma" ambao unaweza kutumia katika kiwango cha akaunti,
kulazimisha ndoo zote kuwa za faragha isipokuwa ukiibatilisha wazi kwa kila ndoo.

Iwashe. Daima.

**Madarasa ya Hifadhi ya S3: Sio Data Zote Zilizo Sawa**

Sio data zote zinazofikiwa kwa usawa.

Picha zako za menyu maarufu zaidi hutafutwa mara kadhaa kwa sekunde. Kumbukumbu zako kutoka
miaka mitatu iliyopita hufikiwa labda mara moja kwa mwaka, ikiwa kabisa. S3 inatambua hili na inatoa
**madaraja tofauti ya kuhifadhi** yenye utendaji tofauti na ubadilishanaji wa gharama.

| Darasa la Uhifadhi | Tumia Kesi | Urejeshaji | Gharama |
|--------------------------------------------------------- ------------|----------------------------------------------|
| S3 Kawaida | Data inayopatikana mara kwa mara | Mara moja | Juu kwa kila GB |
| S3 Kawaida-IA | Ufikiaji wa nadra, bado unahitaji urejeshaji haraka | Mara moja | Chini kwa kila GB, ada ya kurejesha |
| S3 Glacier Papo hapo | Kumbukumbu zilifikiwa mara kwa mara | Mara moja | Chini zaidi |
| S3 Glacier Flexible | Kumbukumbu hazipatikani sana | Dakika hadi saa | Chini sana |
| S3 Glacier Deep Archive | Kumbukumbu za kufuata, kufikiwa karibu kamwe | Hadi saa 12 | Chini |

Tunaenda kwa kina juu ya haya katika Sura ya 23. Kwa sasa: dhana ni kwamba unaweza moja kwa moja
sogeza vitu kati ya madarasa ya uhifadhi kulingana na umri wao na mifumo ya ufikiaji, uhifadhi
pesa muhimu kwenye data ambayo hugusa mara chache.

## Nguvu na Mapungufu

**Kwa nini S3 ni bora**:

- Uimara wa kumi na tisa. Data yako ni salama katika S3 kuliko karibu mfumo mwingine wowote.
- Kiwango cha ukomo. Huhitaji kamwe kutoa hifadhi - inakua tu.
- Kwa bei nafuu sana kwa kile kinachotoa (sehemu ya senti kwa GB kwa mwezi).
- Ujumuishaji wa asili na karibu kila huduma zingine za AWS.
- Inaauni upangishaji tovuti tuli - unaweza kutoa tovuti kamili tuli
  moja kwa moja kutoka kwa S3, hakuna seva inayohitajika.

**Ambapo S3 sio chaguo sahihi**:

- S3 sio mfumo wa faili. Ikiwa programu yako inahitaji kuweka gari na kuitumia kama
  disk ya ndani (kusoma, kuandika, kurekebisha faili mahali), S3 ni chombo kibaya.
  Tumia EFS (Elastic File System, Chapter 6) au EBS badala yake.
- S3 ina muda wa kusubiri ambao ni wa juu zaidi kuliko diski ya ndani. Kwa hifadhidata au
  programu ambazo zinahitaji I/O ya ufikiaji wa haraka, bila mpangilio, hifadhi ya block (EBS, Sura ya 6)
  inafaa.
- Uhamisho mkubwa wa data kwenye S3 ni bure. Uhamisho mkubwa wa data *out* hugharimu pesa.
  Hili ni mshangao wa kawaida wa malipo - tunashughulikia katika Sura ya 30.

## Muhtasari

- **Amazon S3** ni hifadhi ya kitu - mahali pa kuhifadhi faili (vinaitwa vitu) ndani
  vyombo vilivyopewa jina (vinaitwa ndoo).
- S3 imeundwa kwa uimara wa kumi na tisa kwa kuhifadhi nakala za kiotomatiki
  kila kitu katika angalau Kanda tatu za Upatikanaji.
- Faili zilizohifadhiwa kwenye matukio ya EC2 zimeunganishwa na mzunguko wa maisha wa mfano huo. Muhimu
  faili ni za S3, sio kwenye seva.
- **Toleo** huhifadhi matoleo ya awali ya vipengee - kitufe chako cha kutendua.
- Kwa chaguo-msingi, S3 ni ya faragha. Washa "Zuia Ufikiaji wa Umma" katika kiwango cha akaunti.
- S3 ina **madarasa mengi ya kuhifadhi** kwa mifumo na gharama tofauti za ufikiaji.
  Madarasa ya ufikiaji ambayo hayafanyiki mara kwa mara ni ya bei nafuu zaidi lakini toza ada za kurejesha.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa cha 3 — Jukumu la 3.1 (suluhisho za uhifadhi zenye utendakazi wa hali ya juu)*

- **S3 ni hifadhi ya kitu, si kuzuia hifadhi.** Wakati hali ya mtihani inahitaji a
  mfumo wa faili ambao seva nyingi zinaweza kuweka, hiyo ni EFS. Wakati inahitaji diski
  kwa mfano mmoja wa EC2, hiyo ni EBS. Wakati inahitaji kuhifadhi faili, chelezo,
  picha, au data ambayo inafikiwa kupitia HTTP - hiyo ni S3.
- **Uimara wa kumi na tisa** unamaanisha S3 inakili data kwenye AZ nyingi
  moja kwa moja. Huna kusanidi hii - ni chaguo-msingi.
- **S3 ni ya Kikanda**, lakini inapatikana duniani kote. Ndoo zipo katika Mkoa maalum,
  lakini unaweza kuzifikia ukiwa popote.
- **URL zilizotiwa saini mapema** huruhusu ufikiaji wa muda kwa vitu vya faragha. Muundo wa kawaida:
  programu yako inazalisha URL iliyotiwa saini awali halali kwa dakika 15, inakupa
  mtumiaji, mtumiaji hupakua faili moja kwa moja kutoka kwa S3.
- **S3 Standard-IA** ina kiwango cha chini cha malipo ya muda wa kuhifadhi (siku 30). Usitumie
  kwa data utafuta haraka. Mtihani hupima ikiwa unajua maamuzi ya uwiano
  kati ya madarasa ya kuhifadhi.
- **Mti wa uamuzi wa darasa la hifadhi**: *inapatikana mara kwa mara* → Kiwango cha S3; *inapatikana mara kwa mara lakini inahitaji urejeshaji haraka* → S3 Standard-IA; *kumbukumbu kufikiwa mara kwa mara* → Urejeshaji Papo Hapo wa S3 Glacier; *kumbukumbu haipatikani kwa urahisi* → Urejeshaji Unaobadilika wa S3 wa Glacier; *kumbukumbu ya kufuata, karibu kamwe kufikiwa* → Kumbukumbu ya Kina ya S3 ya Glacier. Hali inapotaja "uboreshaji wa gharama" na "ufikiaji mara kwa mara," Standard-IA ndiyo jibu karibu kila mara. Inapotaja "kutii" au "uhifadhi wa miaka saba," fikiria Glacier Deep Archive.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: kitu cha S3 ni nini? Ndoo ya S3 ni nini? Kwa nini ni kuhifadhi faili
katika S3 bora kuliko kuzihifadhi kwenye diski ya eneo la EC2?

*(Kidokezo: Fikiria juu ya kile kinachotokea kwa faili kwenye mfano wa EC2 ikiwa mfano ni
kusitishwa. S3 hufanya nini tofauti?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya vyombo vya habari hutengeneza video za hali halisi. Wanahitaji kuhifadhi asili
Picha za 4K (zinazofikiwa mara kwa mara wakati wa uzalishaji), zilizohaririwa punguzo la mwisho (huidhinishwa kila mwezi
kwa usambazaji), na mabwana wa kumbukumbu (zilizohifadhiwa kwa muda usiojulikana lakini kufikiwa mara moja
mwaka kwa madhumuni ya kufuata). Wanataka kupunguza gharama za kuhifadhi wanapokutana
mahitaji ya ufikiaji wa kila daraja.

Je, ni mkakati gani wa kuhifadhi BORA unaokidhi mahitaji yao?

A) Hifadhi maudhui yote katika Kiwango cha S3 kwa utendakazi thabiti na unyenyekevu  
B) Hifadhi picha asili katika S3 Standard, vipunguzo vya mwisho katika S3 Standard-IA, na kumbukumbu
   katika S3 Glacier Deep Archive  
C) Hifadhi maudhui yote kwenye hifadhi ya mfano ya EC2 kwa ufikiaji wa haraka zaidi  
D) Hifadhi maudhui yote katika Hifadhi ya Kina ya S3 Glacier ili kupunguza gharama

**Kidokezo cha 1**: Faili tofauti zina mifumo tofauti ya ufikiaji. S3 inatoa hifadhi tofauti
madarasa kwa masafa tofauti ya ufikiaji. Ni darasa gani linalolingana "linafikiwa mara kwa mara"?

**Kidokezo cha 2**: Kumbukumbu zinazofikiwa "mara moja kwa mwaka" hazihitaji kurejeshwa mara moja.
Ni aina gani ya hifadhi imeundwa kwa kumbukumbu ya muda mrefu kwa gharama ya chini zaidi?

**Kidokezo cha 3**: Linganisha marudio ya ufikiaji wa kila daraja na darasa linalofaa la hifadhi.
Inafikiwa mara kwa mara = Kawaida. Kila mwezi = Kawaida-IA. Mara moja kwa mwaka = Glacier Deep Archive.

**Jibu**: B

**Maelezo**: Mkakati huu unalingana kwa usahihi kila kiwango cha data na kinachofaa
Darasa la uhifadhi la S3. Kanda za asili zinazofikiwa mara kwa mara hukaa katika Kawaida kwa
ufikiaji wa haraka bila ada za kurejesha. Vipunguzo vya mwisho vinavyofikiwa kila mwezi huenda kwa Standard-IA
(gharama ya chini ya uhifadhi, ada nafuu ya kurejesha). Kumbukumbu zinazofikiwa mara moja kwa mwaka huenda
Glacier Deep Archive kwa gharama ya chini kabisa ya uhifadhi.

**Kwa nini isiwe A?** Kuhifadhi kila kitu katika Kawaida ni rahisi lakini ni ghali. Unalipa
bei ya juu ya maudhui ya kumbukumbu ambayo hupatikani kwa nadra.

**Kwa nini isiwe C?** Hifadhi ya mfano wa EC2 ni ya muda mfupi na haifai kwa muda mrefu
uhifadhi wa media. Mfano ukikatishwa, maudhui yote yatapotea.

**Kwa nini isiwe D?** Hifadhi ya Glacier Deep ina muda wa kurejesha hadi saa 12. Kuhifadhi
picha za uzalishaji zinazopatikana mara kwa mara huko zingefanya kazi ya uzalishaji isiwezekane.

*SAA-C03 Kikoa 3 - Kazi 3.1 / Kikoa 4 - Kazi 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus huhifadhi picha za agizo zilizopakiwa na mteja katika S3. Udhibiti wa ulinzi wa data
inahitaji kwamba picha za mteja lazima zihifadhiwe kwa miaka 7 lakini zinaweza kufutwa baada ya hapo
hiyo. Timu pia inataka kupunguza gharama ya kuhifadhi picha za zamani za miaka iliyopita.

Tengeneza mkakati wa uhifadhi wa S3 kwa mahitaji haya. Ungependa madarasa gani ya uhifadhi
tumia, na ungepita lini kati yao? Ungefanya nini kuhusu kufutwa
mahitaji?

*(Kidokezo: Fikiria kuhusu sera za mzunguko wa maisha. Hakuna jibu moja sahihi - sababu
kupitia gharama dhidi ya maamuzi ya uwiano wa kurejesha.)*

## Onyesho la Baada ya Mikopo

Leo alihamisha picha za menyu hadi S3 alasiri hiyo. Vitu mia nane, kwa usalama
kuhifadhiwa katika Maeneo matatu ya Upatikanaji, na uchapishaji umewezeshwa.

"Kwa kweli wako salama sasa kuliko walivyokuwa hapo awali," alisema, kwa kuridhika fulani.

"Walikuwa salama kila wakati katika S3," Priya alisema. "Tulingojea tu baada ya kujenga
tatizo kulirekebisha."

Leo alikubali hii.

Asubuhi iliyofuata, Tom alifika na karatasi iliyochapishwa. Mswada wa AWS, umefafanuliwa kwa kalamu nyekundu.

"Tuna shida ya hifadhidata," alisema. "Tunaendesha hifadhidata yetu ya agizo sawa
Mfano wa EC2 kama seva ya wavuti. Na orodha yetu ya hifadhidata. Na rekodi za wateja wetu."

Akanyamaza.

"Kila kitu kiko kwenye mashine moja. Mashine moja. Data zetu zote."

Maya alitazama chapa. Kisha kwa Tom. Kisha kwenye dari.

"Na ikiwa mashine hiyo itavunjika?"

Tom alielekeza kwenye maelezo ya kalamu nyekundu.

Katika sura inayofuata: tofauti kati ya gari ngumu unayokodisha na baraza la mawaziri la kufungua ofisi nzima inashiriki.
