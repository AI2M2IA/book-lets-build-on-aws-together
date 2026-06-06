# Sura ya 10: Wakati Hifadhidata Ni Polepole Sana

Vipimo vya upakiaji wa ukurasa vilikuwa vimefunguliwa kwenye skrini. Leo alikuwa amevitazama kwa dakika ishirini bila kusema chochote.

Maombi arobaini na saba ya DynamoDB kwa kila upakiaji wa ukurasa. Milisekunde mia moja themanini na nane ili tu kurudisha data — kabla kivinjari hakijatoa hata pikseli moja.

Alikuwa amefanya hesabu. Watumiaji elfu kumi kwa wakati mmoja jioni ya Ijumaa, kila mmoja akipakia ukurasa wa kuvinjari karibu mara moja kwa dakika: usomaji laki nne na sabini elfu wa DynamoDB kwa dakika. Gharama ilikuwa halisi. Lakini ucheleweshaji ndio ulikuwa tatizo halisi. Mtumiaji anayefungua ukurasa wa kuvinjari wa Nimbus alisubiri karibu milisekunde mia mbili kabla ya kitu chochote kuonekana — na hiyo ilikuwa kwenye muunganisho wa haraka.

---

*Wiki iliyopita, ubunifu upya wa schema ya DynamoDB ulikuwa umefanya kazi. Jedwali la menyu lilikuwa linanyumbulika sasa — mkahawa wowote ungeweza kuongeza kirekebishaji chochote, muundo wowote wa mchanganyiko, tofauti yoyote ya msimu. Utendaji kwenye utafutaji wa mtu mmoja mmoja ulikuwa bora. Lakini utafutaji bora wa mtu mmoja mmoja, ukizidishwa mara arobaini na saba kwa ukurasa, bado ulijumlika kuwa kurasa za polepole. Tatizo la DynamoDB lilikuwa limetatuliwa. Tatizo jipya lilikuwa limechukua nafasi yake.*

---

"Hifadhidata inajibu kwa milisekunde nne kwa kila ombi," Leo alisema. "Hiyo kwa kweli ni haraka. DynamoDB inafanya kazi yake."

"Basi kwa nini ukurasa ni polepole?" Maya aliuliza.

"Kwa sababu tunaiita mara arobaini na saba kwa kila upakiaji wa ukurasa," Priya alisema. "Tatizo si hifadhidata. Tatizo ni kwamba tunazungumza nayo sana."

Tom akainama mbele. Alikuwa na sura aliyoipata wakati tatizo lilikuwa karibu kuwa mazungumzo ya gharama. "Kwa hivyo suluhisho ni kuzungumza nayo kidogo?"

"Zungumza nayo kidogo. Kumbuka zaidi."

---

**Jaribio la Kwanza Lisilo Sahihi**

Silika ya kwanza ya Leo ilikuwa kuweka akiba data ya kila mtumiaji. Kila mtumiaji alikuwa na kipindi, na kipindi kilipakia wasifu wao: anwani zilizohifadhiwa, mbinu za malipo, muhtasari wa historia ya maagizo. Pengine kuweka akiba hilo kungeharakisha mambo.

Aliitekeleza. Mfumo wa ufunguo wa Redis: `user:{userId}:profile`. TTL: dakika kumi.

Aliendesha jaribio la mzigo. Upakiaji wa ukurasa ulishuka kwa milisekunde sita.

"Hiyo si nyingi," Tom alibainisha.

"Hapana," Leo alisema.

"Kwa nini?"

Leo aliangalia grafu kwa muda. "Kwa sababu wasifu wa mtumiaji ni ombi moja tu. Bado kuna miito arobaini na sita ya DynamoDB kwa ukurasa. Na hizo ni miito ya menyu — moja kwa kila mkahawa kwenye ukurasa wa kuvinjari. Niliweka akiba kitu kisicho sahihi."

Hili ni kosa la kawaida katika kuweka akiba: kuboresha kitu ambacho si kizuizi. Wasifu wa mtumiaji ulipakia kwa milisekunde mbili. Kuweka akiba kitu cha haraka hivyo kuliokoa karibu chochote. Data ya menyu — iliyochotwa mara arobaini na saba, ikichukua milisekunde nne kila moja — ndilo lilikuwa tatizo halisi.

"Unahitaji kuweka akiba kwa kila menyu, si kwa kila mtumiaji," Priya alisema. "Menyu ya Mkahawa 047 ni ileile kwa kila mtumiaji anayeivinjari. Hiyo ndiyo data inayostahili kuwekwa akiba — ni sawa kabisa katika maelfu ya maombi."

Akiba za kila mtumiaji ni za thamani wakati watumiaji wana hali ya kibinafsi ya gharama kubwa. Akiba za kila huluki (menyu, katalogi za bidhaa, usanidi) ni za thamani wakati data ileile inatumikiwa maelfu ya watumiaji. Jua tatizo gani unalo kabla ya kuandika msimbo.

Leo aliunda upya funguo za akiba: `menu:{restaurantId}`. Ingizo moja la akiba kwa kila mkahawa, lililoshirikiwa na kila mtumiaji anayevinjari mkahawa huo.

Aliendesha jaribio la mzigo tena. Upakiaji wa ukurasa ulishuka kutoka milisekunde 188 hadi milisekunde 12. Hilo ndilo lilikuwa boresho walilokuwa wakitafuta.

---

**Mlinganisho wa Mkahawa**

Hebu fikiria jiko la mkahawa. Kila wakati mhudumu anahitaji kujua vyakula maalum vya siku, anatembea nyuma, anamuuliza mpishi, na anarudi kwenye meza.

Hiyo inafanya kazi vizuri ikiwa una wahudumu wawili na meza tatu.

Sasa fikiria wahudumu mia mbili na meza elfu. Kila mmoja wao akielekea nyuma kwa swali lilelile. Jiko linakuwa kizuizi. Mpishi anajibu swali lilelile mara mia nne kwa saa.

Suluhisho la wazi: andika vyakula maalum kwenye ubao mbele ya mkahawa. Kila mhudumu anasoma kutoka kwenye ubao. Jiko hupata mapumziko. Ubao husasishwa wakati vyakula maalum vinabadilika.

Ubao huo ni akiba (cache).

Akiba ni hifadhi ya haraka, ya ndani ya data iliyorudishwa hivi karibuni. Badala ya kuchota kitu kilekile kutoka chanzo cha polepole mara kwa mara, unaichota mara moja na kuiweka karibu.

Kuna mlinganisho mwingine ambao wahandisi huona kuwa muhimu: rafu ya akiba ya maktaba. Kitabu maarufu kinaporejeshwa, mkutubi anajua kitaombwa tena hivi karibuni, kwa hivyo anakiweka kwenye rafu ya akiba karibu na dawati la mbele badala ya kukirudisha kwenye rafu za ndani. Mteja anayefuata hahitaji kutembea maktaba nzima — anakipata pale pale dawatini. Rafu ya akiba ina nafasi ndogo. Ikijaa, vitabu vya zamani hurudishwa kwenye rafu za ndani kupisha nafasi kwa vipya. Akiba hufanya kazi sawasawa: data inayofikiwa mara kwa mara hubaki mbele, data isiyofikiwa mara kwa mara hufukuzwa kupisha nafasi.

**Kwa Nini Tusitumie Kumbukumbu Tu?**

"Je, hatuwezi tu kuhifadhi menyu kwenye kumbukumbu ya programu?" Leo aliuliza.

Swali halali.

Unaweza. Kwa programu ya seva moja, kuweka akiba ndani ya kumbukumbu hufanya kazi vizuri. Lakini Nimbus inaendesha nyuma ya load balancer, katika vihalisi vingi vya EC2. Ikiwa kihalisi kimoja kitaweka akiba menyu kwenye kumbukumbu yake, vihalisi vingine havina data hiyo. Kila kimoja huhifadhi akiba tofauti. Wakati menyu inasasishwa, ungelazimika kuzifuta zote.

Hili ni *tatizo la mwafaka wa akiba* (cache coherence) — kuweka akiba nyingi thabiti.

ElastiCache hutatua hili kwa kutoa akiba *iliyowekwa katikati* ambayo vihalisi vyako vyote vinashiriki. Badala ya kila seva kuwa na kumbukumbu yake, kila seva inasoma kutoka na kuandika kwa akiba ileile. Sasisho moja husambaa kwa zote.

**Kutana na ElastiCache**

"Subiri — lakini *kwa nini* tungeifanya hivyo?" Maya aliuliza. "Kwa nini huduma mpya kabisa? Kwa nini tusiongeze tu kapasiti zaidi ya hifadhidata?"

Swali zuri. Jibu ni kwamba kuongeza kapasiti zaidi ya hifadhidata — vihalisi vikubwa zaidi, nakala zaidi za kusoma — hakurekebishi tatizo la msingi. Kila moja ya yale maombi arobaini na saba ya upakiaji wa ukurasa bado yanagharimu muda na pesa, hata kwenye hifadhidata ya haraka zaidi. Akiba haifanyi hifadhidata kuwa ya haraka; inamaanisha hifadhidata huulizwa swali lilelile mara chache sana. Kwa data inayosomwa mara kwa mara na kubadilika mara chache — kama menyu ya mkahawa — akiba inamaanisha hifadhidata inaweza kujibu swali hilo mara moja kila dakika tano badala ya mara arobaini na saba kwa kila upakiaji wa ukurasa.

Amazon ElastiCache ni huduma ya kuweka akiba inayosimamiwa. Inaendesha injini za kuweka akiba maarufu — Redis na Memcached — bila wewe kulazimika kusimamia seva.

**Redis** ndiye mwenye nguvu zaidi kati ya hizo mbili. Inaunga mkono miundo changamano ya data (mifuatano, orodha, seti, heshi, seti zilizopangwa), uthabiti (data husalia baada ya kuanzishwa upya), unakili, na utumaji ujumbe wa pub/sub. Redis inaweza kufanya zaidi ya kuweka akiba — inaweza kufanya kazi kama hifadhi nyepesi ya data.

**Memcached** ni rahisi zaidi. Kuweka akiba ya thamani-ya-ufunguo safi, inayopanuka kimlalo, bila uthabiti. Haraka zaidi kwa matumizi rahisi lakini vipengele vichache.

Kwa Nimbus: Redis. Walihitaji kuweka akiba data ya menyu (iliyoundwa), tokeni za vipindi (thamani-ya-ufunguo), na baadaye wangetaka seti zilizopangwa kwa viwango vya "mikahawa inayovuma".

**Jinsi Kuweka Akiba Kunavyofanya Kazi Kivitendo**

Mfumo wa msingi wa kuweka akiba unaitwa **cache-aside** (pia huitwa lazy loading):

1. Programu inahitaji data
2. Angalia akiba kwanza
3. Ikipatikana (*cache hit*): rudisha data mara moja
4. Ikiwa haipatikani (*cache miss*): nenda kwenye hifadhidata, pata data, ihifadhi kwenye akiba, irudishe

Katika pseudocode:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Weka akiba kwa dakika 5
return menuData
```

Ombi la kwanza daima hugonga hifadhidata. Kila ombi linalofuata hugonga akiba. Kwa akiba, usomaji arobaini na saba wa DynamoDB wa Nimbus kwa kila upakiaji wa ukurasa unakuwa utafutaji mmoja au miwili ya akiba. Haraka, nafuu, na inayopanuka.

**TTL: Unakumbuka Muda Gani?**

Kila ingizo la akiba lina **Time-To-Live (TTL)**: muda ambao baada yake ingizo huisha na ombi linalofuata linarudi kwenye hifadhidata kwa data mpya.

Huu ndio mvutano mkuu wa kuweka akiba: upya dhidi ya utendaji.

- **TTL fupi (sekunde)**: Data safi sana, lakini mikoseo mingi ya akiba. Akiba haisaidii sana.
- **TTL ndefu (saa au siku)**: Haraka sana, lakini data inaweza kuchakaa. Mteja anaona menyu ya jana.

Kwa data ya menyu, dakika tano ni busara. Menyu haibadiliki kila sekunde. Mkahawa ukisasisha menyu yao, wateja wanaweza kuona toleo la zamani kwa hadi dakika tano — linakubalika.

Kwa tokeni za vipindi (je, mtumiaji huyu ameingia?), TTL fupi ina maana, au unasasisha akiba mara moja kipindi kinapobadilika.

Kwa data ya kifedha (jumla ya maagizo, rekodi za malipo), usiiweke akiba — au ukifanya, futa mara moja unapoandika.

Huenda unajiuliza: kwa nini tusiongeze tu kapasiti zaidi ya hifadhidata badala ya kuanzisha safu mpya kabisa ya kuweka akiba? Nakala zaidi, kihalisi kikubwa zaidi — kwa nini si hivyo? Jibu ni kwamba kapasiti ya ziada ya hifadhidata huzidisha uwezo wako wa kushughulikia maombi ya wakati mmoja, lakini haipunguzi idadi ya maombi. Ikiwa watumiaji elfu kumi kila mmoja anaamsha usomaji arobaini na saba kwa kila upakiaji wa ukurasa, kuongeza nakala ya pili ya kusoma kunamaanisha tu kila nakala inashughulikia maombi elfu ishirini na tatu badala ya elfu arobaini na saba — kazi ya jumla haipungui. Akiba huondoa kabisa kazi ya ziada: wale watumiaji elfu kumi wanashiriki matokeo yaleyale yaliyowekwa akiba.

"Kuna matatizo magumu mawili tu katika sayansi ya kompyuta," Leo alinukuu, kwa utoaji ulizoeleka wa mtu aliyekwisha kusema hapo awali. "Kufuta akiba na kutaja vitu."

"Kwa nini kufuta akiba ni ngumu?" Maya aliuliza.

"Kwa sababu ni lini data *kwa hakika* hubadilika? Je, menyu ilibadilika kwa sababu mshirika wa mkahawa aliisasisha? Au kwa sababu kazi ya cron iliendeshwa? Au kwa sababu msimamizi aliihariri kwa mkono? Kila sehemu inayoweza kubadilisha data inahitaji kujua kuiambia akiba."

Hii ndiyo sababu wahandisi wakuu huanza mazungumzo ya kuweka akiba kwa "njia za kuandika ni zipi?" badala ya "hebu tuongeze Redis."

---

**Hadithi ya Kufuta Akiba**

Waligundua jinsi kufuta akiba kulivyokuwa kugumu mara ya kwanza mshirika wa mkahawa alipolalamika.

Mkahawa 112 — mahali pa Colombian katika Eastside — walikuwa wamesasisha bei zao Alhamisi alasiri. Walikuwa wamepandisha arepa kutoka $8 hadi $9. Walipiga simu kwa msaada wa Nimbus dakika ishirini baadaye.

"Menyu yetu bado inaonyesha bei ya zamani," mmiliki alisema. "Wateja wanaweka maagizo kwa $8. Sasa lazima tuheshimu bei hiyo."

Tom alihesabu hasara wakati Priya alifuatilia hitilafu. Kila agizo lililowekwa katika dakika hizo ishirini lilikuwa limetoza $8. Mkahawa ulikuwa umetaka $9. Nimbus ingelazimika kubeba tofauti.

TTL ya dakika tano ilipaswa kuwa imeisha muda mrefu uliopita. Dakika ishirini zilikuwa zimepita. Priya alivuta msimbo.

Ufunguo wa akiba ulikuwa `menu:restaurant-112`. Ulikuwa umewekwa na TTL ya sekunde 300. Aliangalia ulipoandikwa mwisho.

"Uliwekwa saa 8:03 mchana," alisema. "Dakika ishirini na mbili zilizopita."

"Lakini TTL ni dakika tano," Leo alisema.

"TTL ni dakika tano kutoka ulipowekwa akiba mara ya kwanza. Lakini kila ombi lililogonga akiba lilikuwa likisasisha upya TTL. Ingizo la akiba lilikuwa likiguswa kila sekunde chache na maombi yanayoingia, na TTL ilikuwa ikiwekwa upya."

"Kwa hivyo halikuisha kamwe."

"Si katika utekelezaji huu. Tuliweka TTL kwa kila usomaji wa akiba. Dirisha la kuteleza (sliding window). Ingizo lilibaki hai mradi tu mtu alikuwa akiligonga."

Suluhisho: tumia TTL isiyobadilika iliyowekwa tu wakati wa kuandika, isiyoongezwa kamwe wakati wa kusoma. Ingizo huisha haswa dakika tano baada ya kuhifadhiwa, bila kujali ni mara ngapi limesomwa. Mkahawa uliposasisha menyu yao, ingizo la zamani liliisha ndani ya dakika tano na ombi linalofuata lilichota data mpya.

"Na kwa hali ambapo mkahawa husasisha bei na tunahitaji ionyeshwe mara moja?" Tom aliuliza.

"Kufuta kwa amilifu (active invalidation)," Priya alisema. "Wakati lango la mshirika wa mkahawa linawasilisha sasisho, API inaita `cache.delete('menu:restaurant-112')` kabla ya kurudi. Ombi linalofuata huchota data mpya mara moja."

"Lakini hilo linahitaji lango lijue kuhusu akiba."

"Kila njia ya kuandika kwa hifadhidata inahitaji kujua kuhusu akiba. Hilo ndilo Leo alilolisema mapema. Sasa tumeliishi."

"Tayari niliisambaza — oh." Leo alikuwa ametekeleza ufutaji kwenye lango lakini alikuwa amesahau kiolesura cha uhariri wa msimamizi. Wiki mbili baadaye, msimamizi alikuwa amesasisha menyu kupitia dashibodi ya ndani, na bei ya zamani ilikuwa imedumu kwenye akiba kwa dakika tano. Toleo dogo la tukio lilelile.

Waliongeza kishughulikiaji cha DynamoDB Streams — kutoka sura iliyopita — kilichofuta akiba kiotomatiki wakati wowote kipengee cha menyu kilibadilika, bila kujali mfumo gani ulioamsha uandishi. Kishughulikiaji kimoja, njia zote za kuandika zikifunikwa.

---

**Kufukuza Akiba: Wakati Ubao Unapojaa**

Ubao wa vyakula maalum una nafasi ndogo. Unapojaa, lazima ufute kitu kupisha nafasi.

Redis (na akiba kwa ujumla) zina *sera za kufukuza* zinazoamua nini huondolewa wakati kumbukumbu imejaa:

- **LRU (Least Recently Used)**: Ondoa vitu ambavyo havijafikiwa kwa muda mrefu zaidi.
- **LFU (Least Frequently Used)**: Ondoa vitu vinavyofikiwa mara chache zaidi.
- **allkeys-random**: Kufukuza bila mpangilio. Rahisi, si bora.
- **noeviction**: Rudisha kosa wakati kumbukumbu imejaa (programu lazima ishughulikie hili).

Kwa programu nyingi za wavuti: LRU. Vitu ambavyo hujavitazama hivi karibuni huenda vinahitajika kidogo.

---

**Tatizo la Mkanyagano wa Akiba**

"Tumefikiria kinachotokea ikiwa akiba nzima itakuwa tupu mara moja?" Priya aliuliza.

"Hilo lingetokea lini?" Leo alisema.

"Unaposambaza klasta mpya ya ElastiCache. Wakati TTL ya kundi kubwa la maingizo inapoisha kwa wakati mmoja. Unapofuta akiba kulazimisha upya baada ya kurekebisha hitilafu."

Leo akafikiria. "Ikiwa akiba ni tupu, kila ombi huenda kwenye hifadhidata. Yote kwa mara moja. Kwa sekunde chache, hifadhidata inashughulikia mzigo kamili wa kila mtumiaji wa wakati mmoja."

"Bila akiba mbele yake."

"Hilo lingeumiza." Leo aliangalia mipangilio ya kapasiti ya hifadhidata. "Tungekandamizwa kwa hakika."

Hili linaitwa **mkanyagano wa akiba** (cache stampede, pia huitwa thundering herd). Hutokea wakati maingizo mengi ya akiba yanapoisha kwa wakati mmoja — mara nyingi kwa sababu yote yaliundwa kwa wakati mmoja wakati wa kusambaza au kuanza kwa baridi — na wimbi la ghafla la mikoseo ya akiba yote hugonga hifadhidata kwa wakati mmoja.

Mikakati ya kupunguza:

**Jitter kwenye TTL**: Badala ya kuweka kila ingizo la menyu kuwa haswa sekunde 300, ongeza tofauti ya nasibu: sekunde 270 hadi 330. Maingizo huisha kwa nyakati tofauti kidogo, ikisambaza wimbi la mikoseo ya akiba kwa dakika moja badala ya kugonga kwa wakati mmoja.

**Kuisha mapema kwa uwezekano (probabilistic early expiration)**: Kabla ingizo halijaisha, asilimia ndogo ya maombi huliburudisha kwa amilifu. Hili huweka maingizo safi kabla hayajachakaa, kuzuia kuisha kusiwe mkoseo kamwe.

**Kuunganisha maombi (mutex/lock)**: Mkoseo wa akiba unapotokea, pata kufuli kabla ya kugonga hifadhidata. Maombi mengine ya wakati mmoja kwa ufunguo uleule yanasubiri ombi la kwanza likamilike na lijaze akiba upya, kisha yanasoma kutoka akiba. Ombi moja tu la hifadhidata hufanywa kwa kila mkoseo wa akiba, hata chini ya ushindani wa juu.

Kwa Nimbus, walitekeleza jitter ya TTL. Rahisi, yenye ufanisi, bila ugumu wa ziada.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Mistari miwili ya msimbo," Leo alisema. "Kuzuia uwezekano wa kukatika kwa hifadhidata wakati wa kusambaza."

"Maboresho mengi ya kuaminika ni hivyo," Priya alisema. "Nafuu kutekeleza, ghali kujifunza kwamba uliyahitaji."

---

**Miundo ya Data ya Redis: Zaidi ya Thamani-ya-Ufunguo**

Wakati Nimbus walipoongeza kipengele cha "mikahawa inayovuma", Leo awali alihifadhi orodha ya viwango kama orodha rahisi ya JSON: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Ilifanya kazi, lakini kuisasisha kulikuwa kugumu. Kuongeza mkahawa mpya au kusasisha alama, alilazimika kusoma orodha nzima, kuirekebisha katika msimbo wa programu, na kuandika kila kitu tena. Chini ya uandishi wa wakati mmoja kutoka bomba la uchanganuzi, hali za mbio zilisababisha alama kuandikwa juu.

Priya alimwelekeza kwenye seti zilizopangwa za Redis.

**Seti iliyopangwa (sorted set)** katika Redis huhifadhi wanachama wenye alama za nambari zilizoambatanishwa. Wanachama hupangwa kiotomatiki kwa alama. Operesheni ni za atomiki — hakuna hali za mbio kutoka kwa masasisho ya wakati mmoja.

```
# Ongeza/sasisha alama ya mkahawa
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Pata mikahawa 10 bora kwa alama (ya juu zaidi kwanza)
ZREVRANGE trending:global 0 9 WITHSCORES

# Ongeza alama ya mkahawa kiatomiki
ZINCRBY trending:global 50 "NIMBUS-047"
```

Lambda ya uchanganuzi iliita `ZINCRBY` kila wakati agizo lilipowekwa, ikiongeza alama ya mkahawa. Ukurasa wa nyumbani uliita `ZREVRANGE` kupata bora kumi. Hakuna kufuli, hakuna hali za mbio, hakuna mizunguko ya soma-rekebisha-andika.

Redis inaunga mkono miundo mingine kadhaa ya data zaidi ya thamani-ya-ufunguo rahisi:

**Orodha (Lists)**: Mfuatano uliopangwa. Sukuma mbele au nyuma. Tumia kwa foleni, milisho ya shughuli za hivi karibuni, mitiririko ya kumbukumbu.

**Seti (Sets)**: Mikusanyiko isiyo na mpangilio bila nakala. Operesheni za muungano, mwingiliano, tofauti. Tumia kwa "watumiaji gani wameona arifa hii?" au "mikahawa gani iko katika kategoria hii?"

**Heshi (Hashes)**: Sehemu zilizotajwa ndani ya ufunguo. Tumia kwa vitu vilivyoundwa ambapo unataka kusasisha sehemu mmoja mmoja bila kuandika upya kitu kizima.

**HyperLogLog**: Kadirio la ukadinali kwa uwezekano. Hesabu wageni wa kipekee kwenye ukurasa bila kuhifadhi kila kitambulisho cha mgeni. Mfupi na wa haraka.

**Pub/Sub**: Chapisha ujumbe kwenye chaneli; wajiandikishaji huupokea kwa wakati halisi. Tumia kwa arifa nyepesi za wakati halisi kati ya huduma.

"Redis si akiba tu," Leo alisema. "Ni seva ya muundo wa data."

"Hicho ndicho maelezo yake rasmi," Priya alisema.

"Nilidhani ni kamusi ya fahari tu."

"Ilianza hivyo."

---

**Write-Through: Mfumo Mwingine wa Kuweka Akiba**

Cache-aside (lazy loading) ndio mfumo unaojulikana zaidi. Lakini kuna wa pili unaostahili kujua: **write-through**.

Katika kuweka akiba kwa write-through, kila wakati programu yako inapoandika kwa hifadhidata, pia huandika kwa akiba mara moja.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

Faida: akiba daima ni ya kisasa. Hakuna data iliyochakaa kati ya uandishi na kuisha kwa TTL.

Hasara: kila uandishi huenda sehemu mbili. Na unajaza akiba kwa data ambayo huenda haitasomwa kamwe. Ikiwa mikahawa kumi itasasisha menyu zao lakini miwili tu kati yao itapata trafiki kubwa katika dakika tano zinazofuata, umefanya kazi ya write-through kwa akiba nane ambazo hazitatumika kabla ya kuisha.

"Subiri — lakini *kwa nini* tungeifanya hivyo?" Maya aliuliza. "Ikiwa tunaandika kwa akiba kwa kila sasisho, tunafanya kazi zaidi kwa kila uandishi kuliko hapo awali. Hiyo ni bora vipi?"

"Si bora kila wakati," Priya alisema. "Write-through ina maana wakati huwezi kuvumilia dirisha lolote la data iliyochakaa baada ya uandishi. Cache-aside hukubali hadi TTL moja ya uchakavu kwa kubadilishana na kutofanya kazi ya ziada kwa kila uandishi."

Kwa Nimbus: cache-aside lilikuwa chaguo sahihi. Menyu zilisomwa mara nyingi zaidi kuliko zilivyoandikwa. Dirisha la dakika tano la uchakavu lilikubalika. Kwa mfumo wa biashara ya kifedha ambapo kila sasisho la bei lilihitaji kuonyeshwa mara moja, write-through ingefaa zaidi.

Uamuzi unategemea maswali mawili: uwiano wako wa kuandika-kwa-kusoma ni upi, na unaivumilia kiasi gani usomaji uliochakaa baada ya uandishi?


---

**ElastiCache ya Redis: Unachopata Kikiwa Kinasimamiwa**

Kama RDS, ElastiCache huchukua chombo cha chanzo-huria na kushughulikia kazi ya kiutendaji:

- **Chelezo za kiotomatiki**: Picha za Redis kwa ratiba
- **Unakili wa Multi-AZ**: Nodi kuu + nakala za kusoma katika AZ tofauti
- **Hamisho-otomatiki la kushindwa**: Ikiwa nodi kuu ya Redis itashindwa, nakala hupandishwa kiotomatiki
- **Hali ya klasta (Cluster mode)**: Ugawaji wa kimlalo katika nodi nyingi kwa akiba kubwa sana
- **Usimbaji fiche**: Usimbaji wa wakati wa usafiri na wakati wa kupumzika kwa kufuata kanuni
- **Muunganisho wa VPC**: Akiba huendesha katika mtandao wako wa kibinafsi, isiyofikika hadharani

"Hilo linagharimu kiasi gani kwa mwezi?" Tom aliuliza.

"Chini ya usomaji wa DynamoDB tunaobadilisha," Leo alisema. "Kwa karibu dola mia mbili kwa mwezi."

Leo alivuta ukurasa wa bei. Alikuwa tayari amefanya hesabu, lakini alimpitisha Tom kwayo.

`cache.t3.micro` — nodi ndogo zaidi — ilikuwa karibu dola 12 kwa mwezi. Ilikuwa na kumbukumbu ya GB 0.5. Inatosha kwa programu ndogo yenye funguo mia chache za akiba.

`cache.r6g.large` — kiwango kinachofaa trafiki ya Nimbus — kilikuwa na kumbukumbu ya GB 13 na kiliendesha karibu dola 140 kwa mwezi. Kwa kulinganisha, Nimbus walikuwa wakitumia takriban dola 400 kwa mwezi kwa usomaji wa DynamoDB kabla ya kuweka akiba. Baada ya kuweka akiba, usomaji huo ulikuwa umeshuka kwa karibu asilimia 89. Hesabu ilijumlika kuwa takriban dola 356 kwa mwezi zilizookolewa kwenye usomaji wa DynamoDB, ukiondoa dola 140 zilizotumika kwenye ElastiCache — akiba halisi ya karibu dola 216 kwa mwezi.

Sura ya Tom ilibadilika kutoka mwenye mashaka hadi mwenye kuridhika. "Endesha hesabu kwa usahihi kabla hatujaongeza ukubwa, lakini hilo linaeleweka." Aliandika chini.

"Na vipi ikiwa mtu atajaribu kuvunja?" Priya alisema. "Akiba inaweza kuwa na tokeni za vipindi. Data ya mtumiaji. Tunahitaji tokeni za uthibitishaji kwenye kihalisi cha Redis na hakuna ufikiaji wa umma."

"Itakuwa katika subneti ya kibinafsi," Leo alisema.

"Vizuri. Lakini 'itakuwa sawa' si mkao wa usalama," alisema. "Tokeni ya uthibitishaji. Usimbaji wakati wa usafiri. VPC pekee."

Leo akaitikia kwa kichwa. Alikuwa sahihi.

---

**Kufuatilia Akiba**

"Tumefikiria kinachotokea wakati akiba haifanyi kazi kwa usahihi?" Priya aliuliza, wiki moja baada ya kusambaza Redis. "Si tu kushindwa kabisa — inafanya kazi, lakini vibaya. Kiwango cha juu cha mikoseo. Kiwango cha juu cha kufukuza. Ucheleweshaji ukipanda."

"Ningegundua wakati nyakati za upakiaji wa ukurasa zinapoongezeka," Leo alisema.

"Ambapo wakati huo hifadhidata tayari inahangaika," alisema.

ElastiCache hufichua vipimo kupitia CloudWatch. Vile vinavyojalisha zaidi:

**CacheHitRate**: Asilimia ya usomaji wa akiba uliorudisha matokeo. Kwa hakika juu ya 80% kwa akiba iliyokomaa. Kiwango cha hit kinaposhuka inaashiria data yako inayofikiwa zaidi haiko kwenye akiba — ama TTL ni fupi sana, akiba ni ndogo sana, au mifumo yako ya ufikiaji imebadilika.

**CacheMisses**: Idadi kamili ya mikoseo ya akiba. Mwinuko wa ghafla hapa unamaanisha akiba haisaidii na hifadhidata inachukua mzigo kamili.

**Evictions**: Idadi ya vitu vya akiba vilivyofukuzwa kupisha nafasi kwa vipya. Viwango vya juu vya kufukuza vinamaanisha akiba yako ni ndogo sana kwa seti yako ya kazi. Unahitaji kumbukumbu zaidi au mkakati wa kuweka akiba uliochaguliwa zaidi.

**CurrConnections**: Miunganisho ya sasa ya wateja kwa Redis. Miunganisho mingi sana inaweza kumaliza kikomo cha miunganisho cha Redis. Programu zinapaswa kutumia bwawa la miunganisho (connection pooling) kuepuka kufungua muunganisho mpya kwa kila ombi.

**ReplicationLag**: Ni kiasi gani nakala ya kusoma iko nyuma ya kuu. Ikikua, usomaji wa nakala unaweza kurudisha data iliyochakaa.

Leo aliweka kengele mbili za CloudWatch. Kwanza: tahadhari ikiwa kiwango cha hit cha akiba kitashuka chini ya 70% kwa dakika kumi na tano mfululizo — hilo lingeashiria tatizo linalostahili kuchunguzwa kabla hifadhidata haijalihisi. Pili: tahadhari ikiwa kiwango cha kufukuza kitazidi mafukuzo 100 kwa dakika — hilo lingeashiria akiba ilikuwa ndogo sana.

"Kengele mbili," Priya alisema, akipitia usanidi. "Hicho ni mwanzo mzuri."

"Pia niliongeza dashibodi," Leo alisema. "Kiwango cha hit, kiwango cha mkoseo, mafukuzo, ucheleweshaji. Vyote vinavyoonekana sehemu moja."

"Hiyo ni bora kuliko kusubiri ukurasa uwe wa polepole."

"Bora kwa kiasi kikubwa," Leo alikubali.


---

**ElastiCache dhidi ya DAX: Akiba Gani kwa DynamoDB?**

"Ikiwa tunaweka akiba data ya DynamoDB," Maya aliuliza, "kwa nini tusitumie DAX badala ya ElastiCache? Niliiona kwenye nyaraka."

Swali zuri.

**DAX (DynamoDB Accelerator)** ni akiba ya kumbukumbu iliyobuniwa mahususi kwa DynamoDB. Hunasa miito ya API ya DynamoDB katika kiwango cha mteja — msimbo wako wa programu unazungumza na DAX kwa kutumia SDK ileile ya DynamoDB. Mikoseo ya akiba huchotwa kiotomatiki kutoka DynamoDB. Hits za akiba hurudi kwa mikrosekunde. Ufutaji hushughulikiwa kiotomatiki wakati data inapobadilika.

**ElastiCache** ni akiba ya madhumuni ya jumla. Wewe husimamia funguo za akiba, mantiki ya TTL, ufutaji — yote. Udhibiti zaidi, jukumu zaidi.

Wakati wa kutumia kila:

| Hali | Pendekezo |
|---|---|
| Unaweka akiba usomaji wa DynamoDB na unataka mabadiliko sifuri ya programu | DAX |
| Unahitaji ucheleweshaji wa mikrosekunde kwenye usomaji wa DynamoDB | DAX |
| Unaweka akiba kutoka vyanzo vingi (DynamoDB + RDS + API za nje) | ElastiCache |
| Unahitaji miundo ya data ya Redis (seti zilizopangwa, pub/sub, HyperLogLog) | ElastiCache |
| Unahitaji udhibiti wa kina wa TTL na mantiki maalum ya ufutaji | ElastiCache |
| Unahitaji hifadhi ya vipindi, kikomo cha kiwango, au kufuli zilizosambazwa | ElastiCache |

Kwa Nimbus: walichagua ElastiCache kwa sababu walikuwa wakiweka akiba data kutoka vyanzo vingi — DynamoDB kwa menyu, RDS kwa muhtasari wa historia ya maagizo, API za nje kwa ukadiriaji wa mikahawa. DAX inafanya kazi na DynamoDB pekee. Na walihitaji seti zilizopangwa za Redis kwa viwango vya vinavyovuma.

"Ikiwa lingekuwa tatizo la kuweka akiba la DynamoDB pekee," Priya alisema, "DAX ingekuwa jibu rahisi zaidi. Huduma moja, ufutaji otomatiki, API ileile. Lakini tuna zaidi ya chanzo kimoja cha data."

"Kwa hivyo DAX ni rahisi zaidi unapokuwa DynamoDB-pekee," Maya alifupisha. "ElastiCache unapohitaji sanduku kamili la zana."

"Hiyo ndiyo maafikiano."

### Wakati Data ya Akiba Haiwezi Kupotea: Amazon MemoryDB

"Kwa nini mtu yeyote angetumia Redis kama hifadhidata kuu?" Maya aliuliza. "Si ni akiba?"

Hilo ni swali sahihi haswa.

ElastiCache ya Redis ni akiba — ya haraka, ya kumbukumbu, na kwa muundo, si chanzo cha ukweli. Ikiwa nodi ya ElastiCache itashindwa, akiba ni tupu wakati wa kuanzishwa upya. Programu huipasha joto tena kutoka hifadhidata. Hilo ni sawa kwa akiba.

Lakini baadhi ya matumizi huchukua Redis si kama akiba bali kama hifadhi kuu ya data — hali ya kipindi ambayo lazima isalie baada ya kuanzishwa upya, ubao wa viongozi wa wakati halisi usioweza kupotea, kapu la ununuzi ambalo lazima lidumu katika kushindwa kwa AZ. Kwa matumizi haya, uimara wa hatimaye wa ElastiCache ni hatari.

**Amazon MemoryDB for Redis** ni hifadhidata ya kumbukumbu inayosimamiwa kikamilifu, inayoendana na Redis, yenye uimara. Tofauti na ElastiCache, MemoryDB hutumia kumbukumbu ya miamala iliyosambazwa iliyohifadhiwa katika AZ nyingi inayofanya kila uandishi kuwa imara kabla haijathibitishwa. Data husalia katika kushindwa kwa nodi — si kwa sababu inarudia kutoka hifadhidata ya polepole, bali kwa sababu haikuwa kamwe sehemu moja tu.

Tofauti muhimu:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Jukumu | Safu ya akiba | Hifadhidata kuu |
| Uimara | Hauhakikishwi wakati wa kushindwa | Kumbukumbu ya miamala ya Multi-AZ |
| Ucheleweshaji | Usomaji na uandishi wa mikrosekunde | Usomaji wa mikrosekunde, uandishi wa milisekunde ya tarakimu moja |

Zote mbili zinaunga mkono amri na miundo ya data ileile ya Redis. API ni ileile. Uhakikisho wa uimara si uleule.

Kwa Nimbus: timu inataka kuhifadhi idadi ya maagizo ya kila mkahawa ya wakati halisi kama seti iliyopangwa ya Redis — na lazima isalie katika kushindwa kwa AZ bila kupanda upya mbegu kutoka hifadhidata. Hitaji hilo — inayoendana na Redis *na* yenye uimara — ndiyo ishara haswa ya MemoryDB.

"Kwa hivyo hatuhitaji kuipasha joto tena baada ya kushindwa?" Leo aliuliza.

"Hiyo ndiyo lengo," Priya alisema. "Ikiwa nodi itashindwa na kurudi, data iko pale. Kumbukumbu ya miamala iliihifadhi."

Leo aliangalia ukurasa wa bei kwa muda. "Inagharimu zaidi ya ElastiCache."

"Kila kitu kinachostahili kuaminiwa hufanya hivyo," Priya alisema.

## Nguvu na Mapungufu

**Kwa nini kuweka akiba kuna nguvu**:

- Inapunguza kwa kiasi kikubwa mzigo wa hifadhidata (hoja chache, gharama ya chini)
- Nyakati za majibu chini ya milisekunde kwa hits za akiba
- Inalinda hifadhidata yako dhidi ya miinuko ya trafiki
- Redis inaunga mkono miundo ya data tajiri zaidi kuliko hifadhi rahisi ya thamani-ya-ufunguo
- Kupunguza mkanyagano wa akiba (jitter ya TTL, kuunganisha) hulinda dhidi ya miinuko ya kuanza kwa baridi

**Pale ambapo kuweka akiba kunakuwa kugumu**:

- Kufuta akiba ni kugumu kweli kweli — data iliyochakaa husababisha hitilafu
- Huongeza ugumu wa kiutendaji (huduma nyingine ya kufuatilia, sehemu nyingine ya kushindwa)
- Tatizo la kuanza kwa baridi: unaposambaza upya, akiba ni tupu — hifadhidata inachukua mzigo kamili
- Mkanyagano wa akiba: ikiwa maingizo mengi yataisha mara moja, maombi yote hugonga hifadhidata kwa wakati mmoja
- Nodi za ElastiCache si za bure — unazilipia hata zinapokuwa hazifanyi kazi

**ElastiCache dhidi ya DynamoDB DAX**:

Ikiwa unaweka akiba data ya DynamoDB mahususi, AWS inatoa **DAX (DynamoDB Accelerator)** — akiba ya kumbukumbu iliyobuniwa mahususi kwa DynamoDB. DAX ni wazi kwa msimbo wako wa programu (API ileile), hupunguza ucheleweshaji wa usomaji wa DynamoDB hadi mikrosekunde, na hushughulikia ufutaji wa akiba kiotomatiki.

Tumia DAX wakati kizuizi chako ni usomaji wa DynamoDB na unataka kuweka akiba bila mabadiliko. Tumia ElastiCache unapohitaji akiba ya madhumuni ya jumla kwa chanzo chochote cha data, au unapohitaji miundo ya data ya Redis.

## Muhtasari

Miito arobaini na saba ya hifadhidata ikawa utafutaji mmoja wa akiba. Ukurasa ulienda kutoka milisekunde 188 hadi 12. Kuongeza safu ya kuweka akiba ni mojawapo ya mabadiliko yenye uwezo mkubwa zaidi ambayo programu inayokua inaweza kufanya — lakini tu wakati akiba imebuniwa kwa fikra, kwa majibu wazi ya swali "ni lini data hii hubadilika?"

- Akiba ni hifadhi ya haraka ya data iliyorudishwa hivi karibuni — unauliza mara moja, unakumbuka jibu. ElastiCache ni huduma ya kuweka akiba inayosimamiwa ya AWS, inayounga mkono **Redis** (uthabiti, miundo changamano ya data, pub/sub) na **Memcached** (thamani-ya-ufunguo safi, upanuzi wa kimlalo).
- **Mfumo wa cache-aside** (lazy loading): angalia akiba kwanza, rudi kwenye hifadhidata wakati wa mkoseo. **TTL** hudhibiti muda ambao data hukaa imewekwa akiba — TTL fupi inamaanisha data safi zaidi na mikoseo zaidi; TTL ndefu inamaanisha majibu ya haraka zaidi na uchakavu unaowezekana.
- Weka akiba kitu sahihi: data ya kila huluki inayoshirikiwa na watumiaji wengi, si data ya kila mtumiaji ya kipekee kwa kila kipindi. Mkanyagano wa akiba hutokea wakati maingizo mengi yanapoisha kwa wakati mmoja — punguza kwa jitter ya TTL.
- **DAX** ni chaguo sahihi kwa kuweka akiba ya DynamoDB-pekee. **ElastiCache** ni inayonyumbulika zaidi kwa kuweka akiba kutoka vyanzo vingi na miundo ya data ya Redis.
- Sehemu ngumu zaidi ya kuweka akiba ni ufutaji: kujua ni lini data inabadilika na kusasisha akiba katika njia zote za msimbo zinazoiandika. Akiba ni ya kuaminika kadiri tu mkakati wake wa ufutaji ulivyo.

## Vidokezo vya Mtihani

*Kikoa cha SAA-C03: Buni Usanifu wa Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.3)*

- **Redis dhidi ya Memcached kwenye mtihani**: Redis = uthabiti, unakili, miundo changamano, pub/sub. Memcached = thamani-ya-ufunguo rahisi, upanuzi wa kimlalo safi. Wakati hali inataja "huwezi kupoteza data iliyowekwa akiba," jibu ni Redis (huihifadhi kwenye diski).
- **Ishara za kesi za matumizi za ElastiCache**: "hifadhidata ni kizuizi," "mzigo wa kazi mzito wa kusoma," "punguza ucheleweshaji," "hifadhi ya vipindi" — zote zinaelekeza kwa ElastiCache.
- **Ishara ya DAX**: "punguza ucheleweshaji wa usomaji wa DynamoDB" au "usomaji wa DynamoDB ni wa polepole sana" → DAX, si ElastiCache.
- **Usimamizi wa vipindi**: ElastiCache Redis ndilo jibu la kawaida la kuhifadhi data ya kipindi cha mtumiaji. Programu isiyo na hali + hifadhi ya vipindi ya Redis = upanuzi wa kimlalo wenye vipindi thabiti.
- **Write-through dhidi ya cache-aside**: Cache-aside (lazy loading) ndio unaojulikana zaidi. Write-through husasisha akiba kwa kila uandishi — kamwe haichakai, lakini operesheni zaidi za kuandika. Mtihani unaweza kuzitofautisha.
- **Sera za kufukuza akiba**: LRU (least recently used) ndilo jibu la kawaida zaidi la mtihani kwa mizigo ya kazi ya jumla ya wavuti.
- **ElastiCache dhidi ya MemoryDB**: ElastiCache = safu ya akiba, ya haraka, upotezaji wa data unakubalika wakati wa kushindwa. MemoryDB = hifadhidata kuu ya kumbukumbu yenye uimara, inayoendana na Redis, kumbukumbu ya miamala ya Multi-AZ. Kiamsha cha mtihani: "inayoendana na Redis NA yenye uimara" au "hifadhi kuu ya data katika Redis" → MemoryDB, si ElastiCache.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Kwa maneno yako mwenyewe: kufuta akiba ni nini, na kwa nini ni kugumu?

*(Kidokezo: Fikiria kuhusu maeneo yote katika Nimbus ambapo data ya menyu inaweza kusasishwa — lango la mshirika wa mkahawa, zana ya msimamizi, kazi ya cron. Kila moja ya njia hizo inahitaji kujua kuhusu akiba.)*

**Zoezi la 2 — Hali ya SAA-C03**

*Hali*: Jukwaa la kutiririsha video hutumikia mamilioni ya watumiaji. Katalogi ya filamu zinazopatikana hubadilika mara chache (husasishwa kila usiku). Programu inakabiliwa na matumizi ya juu ya CPU ya hifadhidata kwa sababu kila ombi la mtumiaji huuliza katalogi. Timu inataka kupunguza mzigo wa hifadhidata huku ikiweka data ya katalogi kuwa sahihi ndani ya saa moja ya masasisho.

Ni suluhisho gani linalokidhi mahitaji haya BORA zaidi?

A) Ongeza nakala za kusoma kwenye hifadhidata ya RDS kusambaza mzigo  
B) Hamisha katalogi hadi DynamoDB yenye kapasiti ya on-demand  
C) Tumia ElastiCache ya Redis na TTL ya saa 1 kwa data ya katalogi  
D) Ongeza ukubwa wa kihalisi cha RDS kushughulikia hoja zaidi za wakati mmoja

**Kidokezo cha 1**: Data ni nzito ya kusoma na hubadilika mara chache. Ni mfumo gani unaofaa kwa hili?

**Kidokezo cha 2**: "Sahihi ndani ya saa moja" hutafsiri moja kwa moja kuwa kigezo mahususi cha usanidi wa akiba.

**Kidokezo cha 3**: Lengo ni kupunguza mzigo wa hifadhidata, si tu kushughulikia zaidi yake.

**Jibu**: C

**Maelezo**: ElastiCache yenye TTL ya saa moja huweka akiba data ya katalogi baada ya ombi la kwanza kwa kila ufunguo. Maombi yanayofuata hurudi kutoka akiba bila kugusa hifadhidata. Sasisho la kila usiku linapoendeshwa, maingizo huisha ndani ya saa moja na data mpya hupakiwa kwenye ombi linalofuata.

**Kwa nini si A?** Nakala za kusoma husambaza trafiki ya kusoma katika nodi zaidi za hifadhidata lakini hazipunguzi jumla ya idadi ya hoja. Ni muhimu kwa kupanua usomaji, si kupunguza mzigo wa hifadhidata kutoka kwa hoja zinazorudiwa mara kwa mara.

**Kwa nini si B?** Kuhamia DynamoDB hakutatui tatizo la msingi — data ya katalogi bado ingechotwa kutoka hifadhidata (DynamoDB) kwa kila ombi la mtumiaji.

**Kwa nini si D?** Kuongeza ukubwa wa kihalisi hushughulikia hoja zaidi za wakati mmoja lakini hakupunguzi idadi ya hoja. Uzembe wa kimsingi unabaki.

*Kikoa cha SAA-C03: Buni Usanifu wa Utendaji wa Juu — Kazi ya 3.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inataka kuongeza kipengele cha "mikahawa inayovuma": orodha iliyoorodheshwa ya mikahawa 10 bora kwa kiasi cha maagizo katika saa 24 zilizopita, inayosasishwa kila dakika 15.

Ungeitekelezaje hii kwa ElastiCache Redis? Ungetumia muundo gani wa data wa Redis kwa viwango? TTL yako ya akiba ingekuwa nini, na ungesasisha akiba lini haswa?

Fikiria pia: nini kinatokea ikiwa nodi ya ElastiCache itashuka? Je, kipengele kinavunjika? Ungebuni vipi kuzunguka kushindwa huku?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kubuni akiba na kufikiri juu ya kushindwa.)*

## Onyesho la Baada ya Mikopo

"Tayari niliisambaza — oh." Leo alikuwa amesukuma muunganisho wa Redis kwenye uzalishaji kabla ya kusasisha mipangilio ya bwawa la miunganisho. Chini ya mzigo, programu ilikuwa ikifungua miunganisho mingi sana ya Redis. Alilazimika kuirudisha nyuma na kusambaza tena kwa usanidi sahihi.

Leo aliongeza kuweka akiba ya Redis kwa menyu. Muda wa upakiaji wa ukurasa ulishuka kutoka milisekunde 188 hadi milisekunde 12.

Miito arobaini na saba ya DynamoDB ikawa utafutaji mmoja wa Redis. Mwito ulikuwa milisekunde 0.8.

Alitangaza hili kwenye mkutano wa msimamo wa Jumatatu.

"Kazi nzuri," Priya alisema, bila kuangalia juu kutoka kwenye laptop yake.

"Asante," Leo alisema.

"Ulizungusha lini mara ya mwisho tokeni ya uthibitishaji ya Redis?"

Leo aliangalia maelezo yake. "Sidhani kama niliweka moja."

"Kwa hivyo akiba haijathibitishwa."

"Iko ndani ya VPC."

"Vivyo hivyo kila kitu kingine kilichoathiriwa." Hatimaye akatazama juu. "Ikiwa laptop ya Leo itaambukizwa na mtu akapenya hadi kwenye VPC, akiba yako haina nenosiri."

Leo akamkodolea macho.

"Nitaweka tokeni ya uthibitishaji," alisema.

Katika sura inayofuata: mtandao wa kibinafsi unaotenganisha kile ambacho Nimbus inamiliki na sehemu nyingine ya intaneti.
