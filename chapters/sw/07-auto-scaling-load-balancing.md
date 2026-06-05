# Sura ya 7: Mgahawa Unaokua Wakati Unapokuwa na Shughuli

Ilikuwa 7:43 siku ya Ijumaa jioni wakati kiwango cha makosa kilivuka 12%.

Tom aliliona kwanza kwa sababu Tom kila mara aliliona kwanza. Alikuwa na kichupo kilichofunguliwa kwa dashibodi ya CloudWatch ambayo aliburudisha jinsi watu wengine walivyoangalia mitandao ya kijamii - kwa kutafakari, mara kwa mara, bila kumaanisha kabisa.

"Leo," alisema.

Leo alikuwa tayari kuangalia. Nyakati za kujibu: kupanda. Maombi yamewekwa kwenye foleni: kupanda. Mfano mmoja wa EC2 - hata ule mkubwa zaidi ambao wangeboresha hadi mwezi uliopita - ulikuwa 94% ya CPU.

"Tunawanyima wateja," Tom alisema.

"Hatuwafukuzii," Leo alisema. "Seva ni."

"Hiyo ni kitu kimoja."

Ilikuwa. Na ilikuwa ikitokea kila Ijumaa kwa wiki tatu. Nimbus alikuwa amenusurika kwenye shida ya uhifadhi - hifadhidata ilikuwa na diski yake, picha ziliishi katika S3 - lakini thabiti na hatari ni shida tofauti kabisa. Mfumo ulifanya kazi. Haikua tu.

Timu ilihitaji mfumo wao kushughulikia mzigo unaobadilika kiotomatiki. Sio kununua vya kutosha
seva kwa hali mbaya zaidi na kupoteza pesa wakati wa utulivu. Na sio kugombana
manually wakati spikes trafiki hit.

Kuna muundo wa hii. AWS ina huduma mbili zinazoitekeleza.

**Dhana: Kuongeza Mlalo**

Kuna njia mbili za kufanya mfumo kushughulikia mzigo zaidi.

**Kuongeza wima** kunamaanisha kufanya seva moja kuwa kubwa zaidi. CPU zaidi. RAM zaidi.
Tulifanya hivi katika Sura ya 4 tulipoboresha kutoka `t3.micro` hadi `t3.large`. Inasaidia.
Lakini ina mipaka: unaweza kwenda kubwa tu, mfano lazima uanze tena ili kurekebisha ukubwa,
na bado una nukta moja ya kushindwa.

**Kuongeza mlalo** kunamaanisha kuongeza seva zaidi. Badala ya seva moja kubwa, endesha
seva tano za kati. Wakati trafiki inapungua, endesha mbili. Wakati spikes, kukimbia kumi.

Kuongeza mlalo kuna faida ambazo wima hazina:

- Hakuna hatua moja ya kushindwa. Seva moja ikifa, zingine zinaendelea kutumika.
- Hakuna kuanzisha upya inahitajika ili kuongeza uwezo.
- Lipa tu kile unachotumia - ongeza seva unapozihitaji, ondoa wakati huzihitaji.
- Kuongeza kwa mstari: mara mbili ya seva, takriban mara mbili ya upitishaji.

Kukamata: ikiwa una seva nyingi, watumiaji wanajuaje ni ipi ya kuzungumza nayo?

**Kisawazisho cha Mzigo wa Maombi: Mlango Mmoja, Vyumba Vingi**

**Kisawazisho cha Upakiaji wa Maombi** (ALB) ndio mlango wa mbele wa ombi lako.

Watumiaji huunganisha kwenye kiweka sawa cha mzigo. Sawazisha mzigo husambaza maombi yanayoingia
katika kundi lako la matukio ya EC2. Kila mtumiaji huona anwani moja (ya kusawazisha mzigo
URL). Nyuma ya anwani hiyo, maombi yanasambazwa kote hata hivyo seva nyingi zinafanya kazi.

Ifikirie kama mkahawa mkubwa ulio na stendi ya mwenyeji mlangoni. Chakula cha jioni kinafika na
mwenyeji huwaelekeza kwenye meza inayopatikana. Mwenyeji anajua ni meza zipi zina shughuli nyingi na
ambazo ziko wazi. Chakula cha jioni hakihitaji kujua ni meza ngapi - wao tu
ingia ndani na mwenyeji anashughulikia usambazaji.

ALB hufanya hivi na maombi ya wavuti. Inapokea kila ombi la HTTP linaloingia na kuamua
ni mfano gani wa EC2 (unaoitwa **lengo**) unapaswa kushughulikia, kwa kuzingatia mambo kama:

- Round-robin (kila seva hupata zamu kwa kuzunguka)
- Ombi lisilo bora zaidi (seva iliyo na maombi machache zaidi ya ndani ya ndege hupata ombi linalofuata)
- Afya - walengwa wenye afya pekee ndio wanaopokea trafiki

**Uchunguzi wa afya** ni muhimu. ALB hutuma maombi ya majaribio mara kwa mara kwa kila lengo.
Ikiwa mlengwa hatajibu ipasavyo, ALB huiweka alama kuwa mbaya na inaacha kutuma
trafiki kwake. Wakati lengo linapatikana, trafiki huanza tena.

Hii ni moja kwa moja. Unasanidi vigezo vya ukaguzi wa afya; ALB inazitekeleza.

**Kuongeza Kiotomatiki: Mkahawa Unaofungua Majedwali Zaidi**

ALB inasambaza trafiki kwenye seva zako zilizopo. Lakini haiongezi seva
unapohitaji zaidi.

**Kuongeza Kiotomatiki** hufanya.

**Kikundi cha Kuongeza Kiotomatiki** (ASG) ni usanidi unaoiambia AWS:

- Idadi ya chini ya matukio ya kuendesha kila wakati
- Idadi ya juu zaidi ya matukio yanayoruhusiwa
- Masharti ya kupunguza (kuongeza matukio) au kuongeza (kuondoa)

Masharti ya kuongeza ukubwa yanaitwa **sera**. Aina ya kawaida zaidi:

**Ufuatiliaji unaolengwa**: "Weka wastani wa matumizi ya CPU kwa 70%. Wakati wastani wa CPU unazidi
70%, AWS inazindua matukio mapya. Inaposhuka chini, matukio husitishwa.

Hii ni moja kwa moja. Hakuna mtu anayepaswa kutazama vipimo. Hakuna mtu anayepaswa kuzindua mwenyewe
seva. Mfumo hujibu kupakia kwa wakati halisi.

Priya alitazama hii ikitokea moja kwa moja wakati wa mbio za Ijumaa kwa mara ya kwanza. Seva
hesabu ilitoka 2 hadi 5 zaidi ya dakika kumi na tano, kisha kurudi hadi 2 baada ya kukimbilia.

"Hiyo," alisema, "ni ya kuvutia sana."

Tom alikuwa akitazama grafu ya gharama badala yake. Muswada huo uliongezeka wakati wa kukimbilia na kushuka
baada ya. "Tulilipa tu kile tulichotumia," alisema, akifurahishwa pia.

**Jinsi ALB na ASG zinavyofanya kazi pamoja**

Huduma hizi mbili zimeundwa kutumiwa pamoja.

Unaweka ALB mbele. ALB inaelekeza kwa **kundi lengwa** - mkusanyiko wa
matukio ambayo yanapaswa kupokea trafiki. Kikundi cha Kuongeza Kiotomatiki husimamia matukio hayo:
inawaongeza kwa kundi lengwa wakati wa kuongeza nje, huwaondoa wakati wa kuongeza ndani.

Mtiririko:

1. Trafiki inafika kwenye ALB
2. ALB inasambaza maombi kwa walengwa wenye afya njema
3. CPU/mzigo hupanda kwenye malengo hayo
4. ASG hutambua ongezeko la mzigo, huzindua matukio mapya
5. Matukio mapya kupita ukaguzi wa afya, jiandikishe na ALB
6. ALB huanza kutuma trafiki kwao
7. Mzigo hupungua, ASG inasitisha matukio ya ziada
8. ALB huacha kutuma trafiki kwa matukio yaliyokatishwa

Hii hufanyika bila kuingilia kati kwa mwanadamu.

**Zindua Violezo: Mchoro wa Matukio Mapya**

Wakati ASG inazindua mfano mpya, inahitaji kujua nini cha kuzindua. Hii inafafanuliwa
katika **Kiolezo cha Uzinduzi** — AMI, aina ya mfano, vikundi vya usalama vya kutumia,
na data yoyote ya mtumiaji (hati za kuanza ambazo huendesha wakati mfano unapoanza).

Mchoro wa kawaida: unaunda programu yako katika AMI maalum (ona Sura ya 4).
Wakati ASG inahitaji mfano mpya, inazindua AMI hiyo. Mfano mpya unaanza na
programu yako tayari imesakinishwa. Hakuna usanidi unaohitajika.

Kwa mazingira yanayobadilika zaidi, unaweza pia kutumia **hati za data ya mtumiaji** zinazovuta na
sakinisha toleo jipya zaidi la msimbo wako unapoanzisha. Hii ni rahisi zaidi lakini inachukua
tena kwa boot.

Chaguo sahihi inategemea muda gani matukio yako yanahitaji boot na mara ngapi yako
mabadiliko ya maombi.

**Vipindi Vinata: Tatizo Fiche**

Hili hapa ni jambo ambalo huvutia timu nyingi zinapotumia kusawazisha mzigo kwa mara ya kwanza.

Baadhi ya programu za wavuti huhifadhi data ya kipindi - hali ya kuingia, yaliyomo kwenye gari la ununuzi - imewashwa
seva yenyewe (katika kumbukumbu au kwenye diski ya ndani). Hii inafanya kazi vizuri na seva moja.
Na seva nyingi, huvunjika.

Mtumiaji huingia. Ombi huenda kwa Seva A. Seva A huhifadhi kipindi. Inayofuata
ombi huenda kwa Seva B. Seva B haina kipindi. Mtumiaji anaonekana ametoka nje.

Hili linaweza kushughulikiwa kwa njia mbili:

**Vipindi vinavyonata** (au ushirika wa kipindi): Sanidi ALB ili kutuma maombi kila mara
kutoka kwa mtumiaji sawa hadi seva sawa. Hii ni marekebisho ya muda mfupi. Inapunguza mzigo
kusawazisha (baadhi ya seva hupata watumiaji "wanata" zaidi kuliko wengine) na husababisha shida
wakati mfano umesitishwa.

**Muundo wa programu usio na hali**: Hifadhi data ya kipindi nje - katika hifadhidata au
kache kama ElastiCache (Sura ya 10). Kila seva inaweza kuunda upya kipindi cha mtumiaji yeyote
kutoka duka la nje. Seva zinabadilikabadilika. Hii ndiyo njia sahihi
kwa programu zinazoweza kupanuka kwa mlalo.

Priya aliita hii "uamuzi muhimu zaidi wa usanifu unaofanya unapoenda
seva nyingi." Yuko sawa. Tunakutana nayo tena katika Sura ya 10.

**Aina za Mizani ya Mizigo**

AWS inatoa aina tatu za visawazisha mizigo, kila moja inafaa kwa trafiki tofauti:

**Kisawazisho cha Upakiaji wa Programu (ALB)**: Trafiki ya HTTP na HTTPS. Tabaka 7 (inaelewa
HTTP). Inaweza kuelekeza kulingana na njia ya URL (`/api` kwa kikundi kimoja, `/tuli` hadi nyingine),
vichwa vya mwenyeji, na vigezo vya hoja. Hivi ndivyo programu nyingi za wavuti hutumia.

**Kisawazisha cha Upakiaji wa Mtandao (NLB)**: TCP, UDP na TLS trafiki. Safu ya 4 (haina
kuelewa HTTP). Utendaji wa juu sana, mamilioni ya maombi kwa sekunde, sana
utulivu wa chini. Tumia unapohitaji kasi ghafi au wakati hushughulikii HTTP.

**Kisawazisho cha Mzigo wa Lango (GWLB)**: Kwa kuelekeza trafiki kupitia mtandao wa mtu mwingine
vifaa vya mtandao (firewalls, kugundua kuingilia). Hutahitaji hii mara chache
ngazi ya chini.

Kwa Nimbus (na kwa programu nyingi za wavuti), ALB ndio chaguo sahihi.

## Nguvu na Mapungufu

**Kwa nini ALB + Kuongeza Kiotomatiki ni nguvu**:

- Kuongeza muda wa sifuri (matukio yanaongezwa / kuondolewa bila kutatiza miunganisho iliyopo)
- Kushindwa kiotomatiki (matukio mabaya huondolewa kutoka kwa trafiki kiotomatiki)
- Ufanisi wa gharama (lipa tu kwa matukio ya uendeshaji)
- Hakuna hatua moja ya kushindwa - matukio mengi katika AZ nyingi

**Ambapo inakuwa ngumu **:

- Maombi ya kawaida yanahitaji utunzaji maalum (vipindi vya kunata au hali ya nje)
- Kupunguza huchukua muda - ikiwa trafiki inaongezeka mara moja, kuna upungufu kabla ya mpya
  mifano iko tayari. Unaweza kupunguza hii kwa ** kuongeza iliyoratibiwa ** (kabla ya mizani
  kabla ya matukio yanayojulikana) au idadi kubwa zaidi ya matukio
- Sehemu nyingi zinazosonga zinamaanisha zaidi kufuatilia na kutatua
- Baadhi ya programu haziwezi kupimwa kwa usawa kwa urahisi (hifadhidata, urithi fulani
  mifumo). Kuongeza mlalo hufanya kazi vyema kwa viwango visivyo na uraia.

## Muhtasari

- **Kuongeza mlalo** (kuongeza seva zaidi) kunapendekezwa kuliko kuongeza wima
  (kufanya seva moja kuwa kubwa) kwa sababu huondoa alama moja za kutofaulu na
  inaruhusu gharama ya elastic.
- **Kisawazisho cha Upakiaji wa Programu (ALB)** kinasambaza trafiki inayoingia ya HTTP/HTTPS
  katika malengo mengi ya EC2. Inafanya ukaguzi wa afya na njia pekee za afya
  matukio.
- **Kikundi cha Kuongeza Kiotomatiki (ASG)** hurekebisha kiotomatiki idadi ya matukio ya EC2
  kulingana na sera zilizobainishwa za kuongeza alama (k.m., matumizi lengwa ya CPU).
- ALB na ASG hufanya kazi pamoja: ASG inasimamia meli, ALB inasambaza trafiki kote kote.
- Maombi ya kawaida lazima yatumie vipindi vya kunata (kurekebisha kwa muda mfupi) au
  hali ya nje (muundo sahihi wa muda mrefu).
- Kwa trafiki ya HTTP, tumia ALB. Kwa utendakazi ghafi wa TCP/UDP, tumia NLB.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa 2 - Kazi ya 2.1 (usanifu unaoweza kuongezeka) / Kikoa 3 - Kazi 3.2*

- **Ukaguzi wa afya wa ASG unaweza kutoka kwa EC2 au ALB.** Uchunguzi wa afya wa EC2 hutambua pekee
  ikiwa mfano unaendelea. Uchunguzi wa afya wa ALB hugundua ikiwa programu ni
  kujibu kwa usahihi. Uchunguzi wa afya wa ALB ni wa kina zaidi na unapaswa kupendelewa
  kwa programu za wavuti.
- **Kuongeza ufuatiliaji wa lengo ndilo jibu la kawaida la mtihani** kwa sera za kuongeza viwango.
  Uwekaji kurahisisha (ongeza matukio ya N wakati mioto ya kengele) ni ya zamani na haiwezi kubadilika.
- ** Kupunguza ni haraka; kuongeza kasi ni polepole.** AWS husitisha matukio hatua kwa hatua wakati
  ongeza ili kuzuia kutatiza miunganisho amilifu - tabia inayodhibitiwa na mpangilio wa **kucheleweshwa kwa usajili** wa ALB.
- **Idadi ya chini kabisa ya matukio ni kiwango chako cha ustahimilivu.** Ukiweka kiwango cha chini = 1
  na mfano huo hautafaulu, ombi lako liko chini kabla ya ASG kujibu. Weka
  kiwango cha chini ≥ 2 na kuenea katika AZs kwa uthabiti wa kweli.
- **ALB inaweza kusambaza trafiki kwenye AZ kiotomatiki.** Ikiwa na upakiaji wa eneo tofauti
  kusawazisha kumewashwa, kila nodi ya ALB inasambaza maombi sawasawa kwa wote waliosajiliwa
  malengo bila kujali AZ. Hii ni muhimu kwa mzigo uliosawazishwa wakati mfano wa AZ
  hesabu hutofautiana.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: kuna tofauti gani kati ya Usawazishaji wa Upakiaji wa Maombi na
Kikundi cha Kuongeza Maotomatiki? Ni tatizo gani kila mmoja anatatua, na kwa nini wewe hutatua kwa kawaida
kuzitumia pamoja?

*(Kidokezo: Moja inasambaza trafiki ambayo tayari ipo; nyingine hurekebisha kiasi gani
uwezo unao.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Tovuti ya biashara ya rejareja ya kampuni ya rejareja ina uzoefu wa trafiki tofauti sana:
trafiki ya chini wakati wa siku za wiki, ongezeko kubwa mwishoni mwa wiki na wakati wa matukio ya mauzo ya flash.
Wanataka maombi yao kushughulikia mizigo ya kilele bila kudumisha uwezo ambao haujatumiwa
wakati wa utulivu. Programu kwa sasa huhifadhi data ya kipindi kwenye kumbukumbu ya seva.

Ni mabadiliko gani ya usanifu yangeshughulikia BEST mahitaji yao ya scalability?

A) Pata toleo jipya la EC2 ambalo linaweza kushughulikia kilele cha trafiki
B) Tumia matukio mengi ya EC2 nyuma ya ALB yenye Kikundi cha Kuongeza Kiotomatiki, na
   weka nje hifadhi ya kipindi kwa ElastiCache
C) Tumia matukio mengi ya EC2 nyuma ya ALB na vipindi vya kunata vimewashwa
D) Ongeza mwenyewe matukio ya EC2 kabla ya kila ongezeko la trafiki linalotarajiwa na usitishe
   baadaye

**Kidokezo cha 1**: "Bila kudumisha uwezo usiotumika" inamaanisha unahitaji kuongeza kiwango kiotomatiki,
sio mfano mkubwa maalum au usimamizi wa mwongozo.

**Kidokezo cha 2**: Hifadhi ya kipindi katika kumbukumbu ya seva ni tatizo kwa matukio mengi
kupelekwa. Ni chaguzi gani zinazoshughulikia hii?

**Kidokezo cha 3**: Chaguo C hutumia vipindi vya kunata - hiyo ni suluhisho, sio kurekebisha.
Ni chaguo gani linaloshughulikia tatizo la kuongeza ukubwa na uhifadhi wa kipindi ipasavyo?

**Jibu**: B

**Maelezo**: ALB iliyo na Kikundi cha Kuongeza Kiotomatiki hutoa kuongeza kiotomatiki na nyumbufu
- matukio huongezwa wakati wa spikes na kuondolewa wakati wa utulivu. Kipindi cha kusonga
kuhifadhi kwa ElastiCache (kache ya nje) hufanya programu kutokuwa na hali: yoyote
mfano inaweza kushughulikia ombi la mtumiaji yeyote, na ALB inaweza kusambaza trafiki kwa uhuru.
Hii ndio suluhisho sahihi la usanifu.

**Kwa nini isiwe A?** Mfano mmoja mkubwa, haijalishi ni mkubwa kiasi gani, bado ni nukta moja
ya kushindwa. Pia hupoteza pesa wakati wa utulivu wakati uwezo wake mwingi unakaa bila kufanya kazi.

**Kwa nini isiwe C?** Vipindi vinavyonata huelekeza mtumiaji kwenye mfano sawa, ambao kwa kiasi fulani
hupunguza tatizo la kikao lakini hudhoofisha kusawazisha mzigo. Ikiwa mfano huo
hukatisha (wakati wa kuongeza au kutofaulu), mtumiaji hupoteza kipindi chake hata hivyo.

**Kwa nini isiwe D?** Kuongeza ukubwa kwa mikono kunahitaji mtu kutabiri ongezeko la trafiki kwa usahihi
na kuchukua hatua mapema. Ni polepole, inakabiliwa na makosa, na inahitaji nguvu kazi kubwa. Mipiko ya Kuongeza Otomatiki
hii moja kwa moja.

*SAA-C03 Kikoa 2 - Kazi 2.1 / Kikoa 3 - Kazi 3.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus ina ofa kuu inayokuja: punguzo la 50% kwa maagizo yote kwa saa 4
Jumamosi ijayo. Mwaka jana, ofa kama hiyo ilisababisha trafiki ya kawaida mara 10. Timu
inatarajia mwiba kuwa wa ghafla na kudumu kwa masaa 4 haswa.

Kuongeza Kiotomatiki hatimaye kutachukua hatua, lakini kuna upungufu. Ungetengenezaje kwa hili
spike inayojulikana? Kuna tofauti gani kati ya kuongeza kasi na tendaji, na wakati gani
kila moja ina maana?

*(Hakuna jibu moja sahihi. Fikiria juu ya hatua zilizoratibiwa za kuongeza alama,
ongezeko la joto kabla, na athari za gharama za kila mbinu.)*

## Onyesho la Baada ya Mikopo

Ijumaa ya kwanza baada ya kupeleka Kuongeza Kiotomatiki na ALB, timu ilitazama
vipimo pamoja.

7:15pm: matukio mawili kukimbia. Mzigo wa kawaida.
7:45pm: mzigo hupanda. Kuongeza Kiotomatiki huzindua matukio mawili zaidi.
8:00pm: matukio manne ya kushughulikia kilele. Nyakati za majibu ni thabiti.
9:30pm: mzigo matone. Kuongeza Kiotomatiki hukomesha matukio mawili.
9:45pm: kurudi kwa matukio mawili.

Tovuti haijawahi kushuka. Si mara moja.

Leo alionyesha upya ukurasa wa vipimo mara tatu, kana kwamba alitarajia kupata hitilafu ambayo amekosa.

"Je, ni ajabu kwamba ninahisi kukata tamaa kidogo hakuna kitu kilichovunjika?" Alisema.

“Ndiyo,” alisema Priya.

Tom alikuwa akiangalia muswada huo. Gharama ilikuwa imefuatilia trafiki karibu kikamilifu.
"Tulilipa kile tulichotumia," alisema. "Si zaidi. Si chini."

Alisikika kushangaa kweli.

Asubuhi iliyofuata, Maya alipata tatizo jipya kwenye kumbukumbu za makosa. Sio kukatika - mbaya zaidi.

"Hifadhi yetu ya data," alisema, "inarejesha mara za hoja za sekunde nane kwa wastani."

Sekunde nane. Kwa programu ya kuagiza mgahawa.

"Kila wakati mtu anapakia menyu, tunauliza kila kitu kwenye hifadhidata
jenga ukurasa," Leo alisema. "Na tuna migahawa arobaini na saba sasa."

"Jumla ya vitu vingapi vya menyu?" aliuliza Tom.

Leo aliendesha swali.

"Kama elfu ishirini na mbili."

Kimya.

Katika sura inayofuata: hifadhidata ambayo haihitaji DBA - kadi ya mkopo tu.
