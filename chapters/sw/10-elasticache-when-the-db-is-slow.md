# Sura ya 10: Wakati Hifadhidata Ni Polepole Sana

Vipimo vya upakiaji wa ukurasa vilifunguliwa kwenye skrini. Leo alikuwa akiwatazama kwa dakika ishirini bila kusema chochote.

Maombi arobaini na saba ya DynamoDB kwa kila ukurasa upakiaji. Milisekunde mia moja themanini na nane ili tu kurejesha data - kabla ya kivinjari kutoa pikseli moja.

Alifanya hesabu. Watumiaji elfu kumi wanaotumia wakati mmoja Ijumaa jioni: DynamoDB laki nne na sabini husomwa kwa dakika. Gharama ilikuwa halisi. Lakini ucheleweshaji ndio ulikuwa shida halisi. Mtumiaji anayefungua ukurasa wa kuvinjari wa Nimbus alisubiri karibu milisekunde mia mbili kabla ya kitu chochote kuonekana - na hiyo ilikuwa kwenye muunganisho wa haraka.

"Kanzidata inajibu kwa milisekunde nne kwa kila ombi," Leo alisema. "Hiyo ni haraka sana. DynamoDB inafanya kazi yake."

"Basi kwa nini ukurasa ni polepole?" Maya aliuliza.

"Kwa sababu tunaita mara arobaini na saba kwa kila ukurasa," Priya alisema. "Tatizo sio hifadhidata. Tatizo ni kwamba tunazungumza nayo sana."

Tom akainama mbele. Alikuwa na sura aliyoipata wakati tatizo lilikuwa karibu kuwa mazungumzo ya gharama. "Kwa hiyo suluhu ni kuzungumza nayo kidogo?"

"Ongea nayo kidogo. Kumbuka zaidi."

**Mlinganisho wa Mgahawa**

Hebu fikiria jikoni la mgahawa. Kila wakati mhudumu anahitaji kujua maalum za siku, wanatembea nyuma, waulize mpishi, na kurudi kwenye meza.

Hiyo inafanya kazi vizuri ikiwa una wahudumu wawili na meza tatu.

Sasa fikiria watumishi mia mbili na meza elfu. Kila mmoja wao akielekea nyuma kwa swali moja. Jikoni inakuwa kizuizi. Mpishi anajibu swali sawa mara mia nne kwa saa.

Suluhisho la wazi: andika maalum kwenye ubao mbele ya mgahawa. Kila mhudumu anasoma kutoka kwenye ubao. Jikoni hupata mapumziko. Bodi husasishwa wakati maalum zinabadilika.

Ubao huo ni kache.

Akiba ni hifadhi ya haraka, ya ndani ya data iliyorejeshwa hivi majuzi. Badala ya kuchota kitu kile kile kutoka kwa chanzo polepole mara kwa mara, unaileta mara moja na kuiweka karibu.

**Kwa nini Usitumie Kumbukumbu Tu?**

"Je, hatuwezi tu kuhifadhi menyu kwenye kumbukumbu ya programu?" Leo aliuliza.

Swali halali.

Unaweza. Kwa programu ya seva moja, uhifadhi wa kumbukumbu hufanya kazi vizuri. Lakini Nimbus inaendesha nyuma ya kibawazisha mzigo, katika visa vingi vya EC2. Ikiwa mfano mmoja utahifadhi menyu kwenye kumbukumbu yake, hali zingine hazina data hiyo. Kila mmoja wao huhifadhi kache tofauti. Wakati menyu inasasishwa, itabidi ubatilishe zote.

Hili ni *tatizo la upatanishi wa akiba* - kuweka akiba nyingi sawa.

ElastiCache hutatua hili kwa kutoa akiba *iliyowekwa katikati* ambayo matukio yako yote hushiriki. Badala ya kila seva kuwa na kumbukumbu yake, kila seva inasoma kutoka na kuandika kwa kache sawa. Sasisho moja hueneza kwa wote.

**Kutana na ElastiCache**

Amazon ElastiCache ni huduma ya kuhifadhi akiba inayosimamiwa. Inaendesha injini za uakibishaji maarufu - Redis na Memcached - bila wewe kudhibiti seva.

**Redis** ndiye mwenye nguvu zaidi kati ya hizo mbili. Inaauni miundo changamano ya data (mifuatano, orodha, seti, heshi, seti zilizopangwa), uthabiti (data husalia kuanzishwa upya), urudufishaji, na utumaji ujumbe kwenye baa/ndogo. Redis inaweza kufanya zaidi ya kuakibisha - inaweza kufanya kazi kama duka la data nyepesi.

**Memcached** ni rahisi zaidi. Uakibishaji wa thamani ya ufunguo safi, unaweza kupanuka kwa usawa, hakuna uendelevu. Haraka kwa matumizi rahisi lakini vipengele vichache.

Kwa Nimbus: Redis. Walihitaji kuweka akiba ya data ya menyu (iliyoundwa), tokeni za kipindi (thamani-msingi), na baadaye wangetaka seti zilizopangwa kwa viwango vya "migahawa inayovuma".

**Jinsi Uhifadhi Hufanya kazi kwa Mazoezi**

Mchoro wa msingi wa kache unaitwa **cache-aside** (pia huitwa upakiaji wa uvivu):

1. Maombi yanahitaji data
2. Angalia kashe kwanza
3. Ikipatikana (*cache hit*): rudisha data mara moja
4. Ikiwa haipatikani (*cache miss*): nenda kwenye hifadhidata, pata data, ihifadhi kwenye kashe, irudishe.

Katika pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

Ombi la kwanza hugusa hifadhidata kila wakati. Kila ombi linalofuata hugusa akiba. Kwa akiba, Arobaini na saba ya DynamoDB ya Nimbus inayosomwa kwa kila ukurasa inakuwa uchunguzi wa akiba moja au mbili. Haraka, nafuu, na scalable.

**TTL: Unakumbuka Muda Gani?**

Kila ingizo la akiba lina **Time-To-Live (TTL)**: muda ambao ingizo linaisha na ombi linalofuata linarudi kwenye hifadhidata kwa data mpya.

Huu ndio mvutano wa msingi wa kache: upya dhidi ya utendaji.

- **TTL fupi (sekunde)**: Data safi sana, lakini akiba nyingi hukosa. Cache inasaidia sana.
- **TTL ndefu (saa au siku)**: Haraka sana, lakini data inaweza kuchakaa. Mteja anaona menyu ya jana.

Kwa data ya menyu, dakika tano ni sawa. Menyu haibadilika kila sekunde. Mkahawa ukisasisha menyu yao, wateja wanaweza kuona toleo la zamani kwa hadi dakika tano - linakubalika.

Kwa tokeni za kipindi (je, mtumiaji huyu ameingia?), TTL fupi inaeleweka, au unasasisha akiba mara moja kipindi kinapobadilika.

Kwa data ya kifedha (jumla ya agizo, rekodi za malipo), usiihifadhi - au ikiwa utafanya hivyo, batilisha mara moja unapoandika.

"Kuna matatizo mawili tu magumu katika sayansi ya kompyuta," Leo alinukuu, na utoaji wa mazoezi wa mtu ambaye alisema hapo awali. "Ubatilishaji wa akiba na kutaja vitu."

"Kwa nini kubatilisha cache ni ngumu?" Maya aliuliza.

"Kwa sababu ni lini data *haswa* hubadilika? Je, menyu ilibadilika kwa sababu mshirika wa mkahawa aliisasisha? Au kwa sababu kazi ya cron ilifanyika? Au kwa sababu msimamizi aliihariri yeye mwenyewe? Kila sehemu ambayo inaweza kubadilisha data inahitaji kujua ili kueleza akiba."

Hii ndiyo sababu wahandisi wakuu huanza mazungumzo ya kache na "njia gani za kuandika?" badala ya "hebu tuongeze Redis."

**Kufukuzwa kwa Akiba: Bodi Itakapojaa **

Bodi maalum ina nafasi ndogo. Inapojaza, lazima ufute kitu ili kupata nafasi.

Redis (na kache kwa ujumla) zina *sera za kufukuza* ambazo huamua ni nini huondolewa wakati kumbukumbu imejaa:

- **LRU (Haijatumika Hivi Karibuni)**: Ondoa vipengee ambavyo havijafikiwa kwa muda mrefu zaidi.
- **LFU (Inatumika Chini ya Mara kwa Mara)**: Ondoa bidhaa ambazo hufikiwa mara kwa mara.
- **allkeys-nasibu**: Kufukuzwa bila mpangilio. Rahisi, sio bora.
- **noeviction**: Rudisha hitilafu wakati kumbukumbu imejaa (programu lazima ishughulikie hili).

Kwa programu nyingi za wavuti: LRU. Mambo ambayo hujayatazama hivi majuzi huenda hayahitajiki sana.

**ElastiCache ya Redis: Unachodhibitiwa **

Kama RDS, ElastiCache inachukua chombo cha chanzo-wazi na kushughulikia kazi ya uendeshaji:

- **Chelezo otomatiki**: Redis vijipicha kwenye ratiba
- **Urudiaji wa Multi-AZ**: Nodi ya msingi + soma nakala katika AZ tofauti
- **Kushindwa kiotomatiki**: Ikiwa nodi ya msingi ya Redis itashindwa, nakala inakuzwa kiotomatiki.
- **Njia ya Nguzo**: Kugawanyika kwa mlalo kwenye nodi nyingi kwa akiba kubwa sana
- **Usimbaji fiche**: Usimbaji wa ndani na wa kupumzika kwa kufuata
- **Muunganisho wa VPC**: Akiba inaendeshwa katika mtandao wako wa kibinafsi, haipatikani na umma

Tom aliangalia orodha ya vipengele. "Inagharimu kiasi gani?"

"Chini ya DynamoDB inasoma tunachukua nafasi," Leo alisema. "Nimekimbia namba."

Usemi wa Tom ulibadilika kutoka kwa mashaka hadi kwa nia. Hayo yalikuwa maendeleo.

## Nguvu na Mapungufu

**Kwa nini uakibishaji una nguvu**:

- Inapunguza kwa kiasi kikubwa mzigo wa hifadhidata (maswali machache, gharama ya chini)
- Nyakati za majibu ya milisekunde ndogo kwa vibao vya akiba
- Inalinda hifadhidata yako kutoka kwa miiba ya trafiki
- Redis inasaidia miundo bora ya data kuliko duka rahisi la thamani ya ufunguo

**Ambapo uakibishaji unakuwa mgumu**:

- Kubatilisha akiba ni ngumu sana - data iliyochakaa husababisha hitilafu
- Inaongeza ugumu wa kufanya kazi (huduma nyingine ya kufuatilia, hatua nyingine ya kutofaulu)
- Tatizo la kuanza kwa baridi: unapopeleka safi, akiba ni tupu - hifadhidata inachukua mzigo kamili
- Mkanyagano wa akiba: ikiwa maingizo mengi yataisha mara moja, maombi yote yanagonga hifadhidata wakati huo huo
- Nodi za ElastiCache sio bure - unazilipia hata wakati wa kufanya kazi

**ElastiCache dhidi ya DynamoDB DAX**:

Ikiwa unahifadhi data ya DynamoDB mahususi, AWS inatoa **DAX (Kikasi cha DynamoDB)** - akiba ya kumbukumbu iliyojengwa ndani ya DynamoDB. DAX ni wazi kwa msimbo wako wa programu (API sawa), hupunguza muda wa kusomeka wa DynamoDB hadi sekunde ndogo, na hushughulikia ubatilifu wa akiba kiotomatiki.

Tumia DAX wakati kizuizi chako kinasomwa na DynamoDB. Tumia ElastiCache unapohitaji akiba ya madhumuni ya jumla kwa chanzo chochote cha data.

## Muhtasari

- Akiba ni hifadhi ya haraka ya data iliyorejeshwa hivi majuzi - unauliza mara moja, kumbuka jibu.
- ElastiCache ni huduma ya kuweka akiba inayosimamiwa na AWS, inayosaidia Redis na Memcached.
- **Redis** ni tajiri zaidi (miundo changamano ya data, uendelevu, baa/ndogo). **Memcached** ni rahisi zaidi (thamani ya ufunguo safi, inaongezwa mlalo).
- Muundo wa **kache-kando** (upakiaji wa uvivu): angalia akiba kwanza, rudi kwenye hifadhidata unapokosa.
- **TTL** hudhibiti muda ambao data hukaa kwenye akiba. TTL fupi = safi, nyingi hukosa. TTL ndefu = haraka, ambayo inaweza kuwa ya zamani.
- Kubatilisha akiba ni ngumu. Jua njia zote za uandishi kabla ya kuongeza kache.
- ElastiCache inasimamia urudufu, kushindwa, chelezo, na usimbuaji - unazingatia muundo wa kache.
- **DAX** ni akiba maalum ya DynamoDB. ElastiCache ni madhumuni ya jumla.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.3)*

- **Redis vs Memcached kwenye mtihani**: Redis = kuendelea, urudufishaji, miundo changamano, pub/sub. Memcached = ufunguo-thamani rahisi, kuongeza mlalo safi. Wakati hali inataja "huwezi kupoteza data iliyohifadhiwa," jibu ni Redis (inaendelea kwa diski).
- **Alama za kesi za utumiaji za ElastiCache**: "database ni pingamizi," "mzigo mzito wa kazi," "punguza muda wa kusubiri," "duka la kipindi" — zote zinaelekeza kwa ElastiCache.
- **mawimbi ya DAX**: "punguza muda wa kusomeka kwa DynamoDB" au "Usomaji wa DynamoDB ni wa polepole sana" → DAX, si ElastiCache.
- **Udhibiti wa kipindi**: ElastiCache Redis ndilo jibu la kisheria la kuhifadhi data ya kipindi cha mtumiaji. Utumizi usio na uraia + Duka la kipindi cha Redis = kuongeza mlalo na vipindi thabiti.
- **Andika dhidi ya kache-kando**: Kache-kando (upakiaji wa uvivu) ndio unaojulikana zaidi. Andika-kupitia husasisha akiba kwenye kila maandishi - kamwe hayachakai, lakini shughuli zaidi za kuandika. Mtihani unaweza kuwatofautisha.
- **Sera za kufukuza kwenye akiba**: LRU (imetumika angalau hivi karibuni) ndilo jibu la kawaida la mtihani kwa mzigo wa jumla wa kazi kwenye wavuti.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: ni nini kubatilisha cache, na kwa nini ni vigumu?

*(Kidokezo: Fikiria kuhusu maeneo yote katika Nimbus ambapo data ya menyu inaweza kusasishwa - lango la washirika wa mgahawa, zana ya msimamizi, kazi ya cron. Kila moja ya njia hizo inahitaji kujua kuhusu akiba.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Mfumo wa kutiririsha video hutumikia mamilioni ya watumiaji. Katalogi ya filamu zinazopatikana hubadilika mara chache (husasishwa kila usiku). Programu inakabiliwa na matumizi ya juu ya hifadhidata ya CPU kwa sababu kila ombi la mtumiaji huuliza katalogi. Timu inataka kupunguza upakiaji wa hifadhidata huku ikiweka data ya katalogi kwa usahihi ndani ya saa moja ya masasisho.

Ni suluhisho gani BORA linalokidhi mahitaji haya?

A) Ongeza nakala zilizosomwa kwenye hifadhidata ya RDS ili kusambaza mzigo  
B) Hamishia katalogi hadi DynamoDB yenye uwezo unapohitaji  
C) Tumia ElastiCache kwa Redis na TTL ya saa 1 kwa data ya katalogi  
D) Ongeza ukubwa wa mfano wa RDS ili kushughulikia maswali zaidi yanayofanana

**Kidokezo cha 1**: Data ni nzito na hubadilika mara chache. Ni muundo gani unaofaa kwa hii?

**Kidokezo cha 2**: "Sahihi ndani ya saa moja" hutafsiri moja kwa moja kwa kigezo maalum cha usanidi wa kache.

**Kidokezo cha 3**: Lengo ni kupunguza mzigo wa hifadhidata, sio tu kushughulikia zaidi.

**Jibu**: C

**Maelezo**: ElastiCache yenye data ya katalogi ya TTL ya saa moja baada ya ombi la kwanza kwa kila ufunguo. Maombi yanayofuata yanarudi kutoka kwa kache bila kugusa hifadhidata. Wakati sasisho la kila usiku linapoendeshwa, muda wa maingizo huisha ndani ya saa moja na data mpya hupakiwa kwa ombi linalofuata.

**Kwa nini isiwe A?** Soma nakala sambaza trafiki iliyosomwa katika nodi zaidi za hifadhidata lakini usipunguze jumla ya idadi ya hoja. Ni muhimu kwa kuongeza usomaji, sio kupunguza mzigo wa hifadhidata kutoka kwa hoja zinazorudiwa mara kwa mara.

**Kwa nini isiwe B?** Kuhamia DynamoDB hakutatui tatizo la msingi - data ya katalogi bado ingeletwa kutoka kwa hifadhidata (DynamoDB) kwa kila ombi la mtumiaji.

**Kwa nini isiwe D?** Kuongeza mfano hushughulikia hoja zinazofuatana zaidi lakini hakupunguzi idadi ya hoja. Uzembe wa kimsingi unabaki.

*Kikoa cha SAA-C03: Usanifu wa Usanifu Wenye Utendaji wa Juu — Jukumu la 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inataka kuongeza kipengele cha "migahawa inayovuma": orodha iliyoorodheshwa ya migahawa 10 bora kwa kiasi cha kuagiza katika saa 24 zilizopita, inayosasishwa kila baada ya dakika 15.

Unawezaje kutekeleza hii na ElastiCache Redis? Je, ungetumia muundo gani wa data wa Redis kwa ukadiriaji? TTL yako ya kashe ingekuwa nini, na ungesasisha kache lini haswa?

Fikiria pia: nini kinatokea ikiwa nodi ya ElastiCache itashuka? Je, kipengele kinavunjika? Je, ungebuni vipi kuhusu kushindwa huku?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kubuni kache na kufikiri kushindwa.)*

## Onyesho la Baada ya Mikopo

Leo aliongeza akiba ya Redis kwa menyu. Muda wa kupakia ukurasa umepungua kutoka milisekunde 188 hadi milisekunde 12.

Simu arobaini na saba za DynamoDB zikawa utaftaji mmoja wa Redis. Simu ilikuwa milisekunde 0.8.

Alitangaza hayo katika maandamano ya Jumatatu.

"Kazi nzuri," Priya alisema, bila kuangalia kutoka kwenye kompyuta yake ndogo.

“Asante,” alisema Leo.

"Ulizungusha lini mara ya mwisho tokeni ya uthibitishaji ya Redis?"

Leo alitazama maelezo yake. "Sidhani kama nimeweka moja."

"Kwa hivyo kache haijathibitishwa."

"Ipo ndani ya VPC."

"Hivyo ndivyo kila kitu kingine ambacho kimeathiriwa." Hatimaye akatazama juu. "Ikiwa kompyuta ndogo ya Leo itaambukizwa na mtu kuingia kwenye VPC, kashe yako haina nenosiri."

Leo alimkazia macho.

"Nitaweka ishara ya uthibitisho," alisema.

Katika sura inayofuata: mtandao wa kibinafsi unaotenganisha kile ambacho Nimbus anamiliki kutoka kwa mtandao wote.
