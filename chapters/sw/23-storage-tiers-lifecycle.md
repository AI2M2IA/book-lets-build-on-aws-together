# Sura ya 23: Mfumo wa Kufaili Unaojipanga

Ofisi ya sheria huweka mafaili ya kesi za sasa mezani. Kesi zilizokamilika huenda kwenye kabati la kufaili. Kesi za miaka mitatu iliyopita huenda kwenye masanduku ya kuhifadhi kwenye sehemu ya chini ya jengo. Kesi za miaka kumi iliyopita huenda kwenye kituo cha kuhifadhi mbali ambacho kinagharimu senti kwa kisanduku lakini kinachukua siku mbili kupata kitu chochote kutoka hapo.

Taarifa ile ile, iliyohifadhiwa kwa gharama tofauti kulingana na jinsi inavyopatikana mara ngapi.

S3 hufanya hivi kiotomatiki.

Tom alikuwa akipitia bili ya AWS ya Nimbus. Kipengele cha mstari: uhifadhi wa S3. $847/mwezi.

Aliita Leo.

"Tuna terabytes 4.2 katika S3," Leo alisema baada ya kuangalia.

"Ya nini?"

"Picha za mgahawa. Risiti za agizo. Mauzo ya uchambuzi. Picha za nakala kutoka miezi 18 iliyopita."

"Mara ya mwisho mtu aliingia kwenye nakala kutoka miezi 18 iliyopita ilikuwa lini?"

Leo aliangalia kumbukumbu za ufikiaji.

"Oktoba iliyopita," alisema. "Mara moja. Kuthibitisha umbizo la nakala."

"Kwa hivyo tunalipa kwa miezi 18 ya nakala kwa bei kamili ya S3 Standard."

"Ndiyo."

Tom alitazama ukurasa wa bei za S3. S3 Standard: $0.023 kwa GB kwa mwezi. S3 Glacier Instant Retrieval: $0.004 kwa GB kwa mwezi.

Alifanya hesabu. Mahesabu ya haraka.

"Tunaweza kupunguza bili hii kwa kiasi kikubwa," alisema, "kwa kuhamisha data ya zamani kwenye uhifadhi wa bei nafuu zaidi."

"Tungehitaji kujua kitu gani ni cha zamani," Leo alisema.

"S3 inajua. Inafuatilia wakati wa ufikiaji wa mwisho."

**Madarasa ya Uhifadhi wa S3: Wigo Kamili**

Sura ya 5 ilianzisha S3 Standard kama darasa kuu la uhifadhi. S3 kweli ina madarasa saba ya uhifadhi, kila moja iliyobunishwa kwa mifumo tofauti ya ufikiaji:

**S3 Standard**: Kwa data inayopatikana mara kwa mara. Latency ndogo (millisekunde). Gharama ya juu zaidi. Hakuna muda wa chini wa uhifadhi. Tumia kwa data inayofanya kazi: picha za orodha za sasa, maagizo ya leo, kumbukumbu za hivi karibuni.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Kwa data inayopatikana chini ya mara moja kwa mwezi. Urejeshaji wa millisekunde sawa na Standard, lakini gharama ya chini ya uhifadhi + ada ya urejeshaji kwa GB. Tumia kwa data unayohitaji mara moje unapoifikia, lakini mara chache hufanya: risiti za agizo za zamani, mauzo ya uchambuzi ya miezi 6.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Sawa na S3 Standard-IA lakini imehifadhiwa katika Availability Zone moja tu (badala ya tatu). Kudumu kidogo (ikiwa AZ hiyo itakuwa na maafa, data inaweza kupotea), lakini 20% ya bei nafuu. Tumia kwa data inayoweza kuundwa tena ikiwa itapotea: kashe ya picha ndogo, matokeo ya usindikaji wa muda.

**S3 Glacier Instant Retrieval**: Data iliyohifadhiwa ambayo unahitaji mara kwa mara. Urejeshaji wa millisekunde. Gharama ya chini sana ya uhifadhi, gharama ya juu ya urejeshaji kwa GB. Uhifadhi wa chini wa siku 90. Tumia kwa data inayopatikana mara moja kwa robo mwaka au chini: ripoti za uzingatifu za robo mwaka, picha za nakala za miezi 12.

**S3 Glacier Flexible Retrieval**: Kumbukumbu ya kina, iliyorejeshwa kwa dakika hadi masaa. Gharama ya chini zaidi kuliko Glacier Instant Retrieval. Tumia kwa data ya kumbukumbu isiyo na haraka.

**S3 Glacier Deep Archive**: Chaguo la bei nafuu zaidi. Ilirejeshwa kwa masaa 12. Uhifadhi wa chini wa siku 180. Tumia kwa data ambayo lazima ihifadhiwe kwa uzingatifu lakini haitegemewi kupatikana: rekodi za kodi za miaka 7, kumbukumbu za ukaguzi za miaka 10.

Mchakato: ufikiaji unapopungua, gharama hupungua lakini muda wa urejeshaji huongezeka (na gharama ya kila urejeshaji pia huongezeka). Chagua darasa linalofanana na mfumo wako wa ufikiaji.

**Sera za Mzunguko wa Maisha wa S3: Mfumo wa Kufaili wa Kiotomatiki**

Kuhamisha faili kwa mkono kati ya madarasa ya uhifadhi kuna makosa na inachukua muda. **Sera za mzunguko wa maisha wa S3** zinafanya hivi kiotomatiki kulingana na sheria unazobainisha.

Sheria ya mzunguko wa maisha ina sehemu mbili:

**Kichujio**: Vitu gani sheria inatumika (vitu vyote, vitu vyenye kiambishi mahususi, vitu vyenye lebo mahususi).

**Vitendo**: Kufanya nini, baada ya siku ngapi.

Mfano wa sera ya mzunguko wa maisha kwa risiti za agizo la Nimbus:

```
Hamia kwa S3 Standard-IA baada ya siku 90
Hamia kwa S3 Glacier Instant Retrieval baada ya siku 365
Hamia kwa S3 Glacier Deep Archive baada ya siku 2555 (miaka 7)
Futa baada ya siku 2920 (miaka 8)
```

Sera hii moja inahakikisha:

- Risiti za sasa (< siku 90): S3 Standard, ufikiaji wa haraka
- Risiti za hivi karibuni (siku 90-365): Standard-IA, bei nafuu lakini zinapatikana mara moje
- Risiti za kihistoria (miaka 1-7): Glacier, bei nafuu sana, inahitajika mara chache
- Risiti zilizokwisha muda (> miaka 8): Zimefutwa kiotomatiki

Tom alipitia mwelekeo wa kuokoa: kutoka $847/mwezi hadi karibu $220/mwezi.

"Kwa kufafanua tu... kinachokuwa cha zamani na kinapaswa kwenda wapi?" alisema.

"Na S3 inahamia kiotomatiki," Leo alithibitisha. "Hakuna kazi ya cron. Hakuna uhamiaji wa mkono. Hakuna kusahau."

**S3 Intelligent-Tiering: Darasa la Kujipanga**

Ikiwa hujui jinsi mara nyingi utafikia data yako?

**S3 Intelligent-Tiering** inafuatilia mifumo ya ufikiaji kwa kila kitu na kuihamisha kiotomatiki kati ya tabaka za ufikiaji:

- **Tabaka la Ufikiaji wa Mara Kwa Mara**: Kwa vitu vilivyopatikana hivi karibuni
- **Tabaka la Ufikiaji wa Mara Chache**: Vitu ambavyo havijapatikwa kwa siku 30
- **Tabaka la Ufikiaji wa Haraka wa Kumbukumbu**: Vitu ambavyo havijapatikwa kwa siku 90
- **Tabaka la Ufikiaji wa Kumbukumbu**: Vitu ambavyo havijapatikwa kwa siku 90-730 (hiari)
- **Tabaka la Ufikiaji wa Kumbukumbu ya Kina**: Vitu ambavyo havijapatikwa kwa siku 180-730+ (hiari)

S3 Intelligent-Tiering inalipia ada ndogo ya ufuatiliaji kwa kitu kwa mwezi ($0.0025 kwa kila vitu 1,000), lakini hakuna ada ya urejeshaji kwa tabaka za Mara kwa Mara na Mara Chache.

Tumia Intelligent-Tiering wakati:

- Mifumo ya ufikiaji haiwezi kutabiriwa au inabadilika kwa wakati
- Una mchanganyiko wa data ya moto na baridi ambayo huwezi kuorodhesha kwa urahisi
- Una vitu vikubwa zaidi ya 128KB (vitu vidogo vinagharimu zaidi katika ada za ufuatiliaji kuliko wanavyookoa)

Tumia madarasa wazi ya uhifadhi (na sera za mzunguko wa maisha) wakati:

- Mifumo ya ufikiaji inaweza kutabiriwa
- Unataka kupunguza ada za ufuatiliaji kwa kila kitu
- Vitu ni vidogo (< 128KB)

**Upakiaji wa Sehemu Nyingi: Kwa Vitu Vikubwa**

S3 ina kikomo cha upakiaji wa 5GB wa kutumia mara moja. Kwa vitu vikubwa zaidi, lazima utumie **upakiaji wa sehemu nyingi (multipart upload)**: gawanya kitu katika sehemu, pakia kila moja kwa sambamba, na S3 itazikusanya.

Faida:

- Upakiaji wa haraka zaidi (sambamba)
- Inaweza kuendelea baada ya upakiaji uliokatizwa (pakia tena sehemu zilizoshindwa tu)
- Inahitajika kwa vitu > 5GB

Kidokezo cha sera ya mzunguko wa maisha: Weka sheria ya mzunguko wa maisha kufuta upakiaji wa sehemu nyingi usio kamili baada ya siku 7. Ikiwa upakiaji utashindwa katikati na haukusafishwa, sehemu hizo za sehemu zimehifadhiwa na kulipiwa — bila kitu kilichokusanyika kuonyesha kwa ajili yake.

Tom alishukuru sana kidokezo hiki.

**Upokezaji wa S3: Kunakili Data Kati ya Ndoo**

S3 inaweza kupokezea kiotomatiki vitu kutoka ndoo moja hadi nyingine:

**Upokezaji wa Kanda Moja (Same-Region Replication - SRR)**: Nakili vitu ndani ya kanda moja. Tumia kwa uzingatifu (kuweka nakala tofauti katika akaunti nyingine), kukusanya kumbukumbu kutoka ndoo nyingi, au kuunda mazingira ya majaribio kutoka data ya uzalishaji.

**Upokezaji wa Toka Kanda Hadi Kanda (Cross-Region Replication - CRR)**: Nakili vitu kwa kanda nyingine. Tumia kwa uokoaji wa maafa (upungufu wa data katika kanda), uzingatifu (data lazima iwe katika jiografia maalum), na latency ya chini kwa watumiaji wa kimataifa.

Upokezaji si suluhisho la nakala — ikiwa utafuta kitu katika ndoo chanzo, kimefutwa katika nakala (isipokuwa upokezaji wa alama ya kufuta umezimwa). Tumia AWS Backup au upigaji toleo na kufungwa kwa kitu kwa nakala.

**Kufungwa kwa Kitu cha S3: Kutobadilika kwa Uzingatifu**

Baadhi ya kanuni zinahitaji data kuwa **haitobadilika** — mara inapoandikwa, haiwezi kubadilishwa au kufutwa kwa kipindi maalum.

**Kufungwa kwa Kitu cha S3 (S3 Object Lock)** inatekeleza uhifadhi wa WORM (Andika Mara Moja, Soma Mara Nyingi):

**Kipindi cha uhifadhi (Retention period)**: Vitu haviwezi kufutwa au kuandikwa upya kwa muda maalum.

**Kishikiliwa cha kisheria (Legal hold)**: Vitu haviwezi kufutwa, bila kujali kipindi cha uhifadhi, mpaka kishikiliwa cha kisheria kiondolewe kwa makusudi.

Tumia Kufungwa kwa Kitu cha S3 kwa tasnia zilizodhibitiwa: rekodi za kifedha (Sheria ya 17a-4 ya SEC), rekodi za afya (HIPAA), kumbukumbu za uzingatifu.

## Nguvu na Mipaka

**Kwa nini tabaka za uhifadhi za S3 ni muhimu**:

- Kupunguza gharama kwa kiasi kikubwa bila kuathiri kudumu au upatikanaji kwa kile kinachopatikana kweli
- Sera za mzunguko wa maisha zinafanya mchakato wote kiotomatiki — hakuna mzigo wa uendeshaji
- S3 Intelligent-Tiering inaondoa haja ya kutabiri mifumo ya ufikiaji

**Mahali ambapo mambo yanakuwa magumu**:

- Ada za muda wa chini wa uhifadhi zinatumika kwa madarasa ya Glacier (siku 90 kwa Glacier Instant, siku 180 kwa Deep Archive) — kufuta mapema bado kunagharimu malipo ya kiwango cha chini
- Ada za urejeshaji zinaweza kukushangazisha ikiwa utafikia data iliyohifadhiwa mara kwa mara
- Mpito wa mzunguko wa maisha unachukua muda — vitu havihamishwi mara moje baada ya sheria kuanzishwa
- Ada za ufuatiliaji za Intelligent-Tiering zinasanyika kwa ndoo zilizo na mamilioni ya vitu vidogo

## Muhtasari

- S3 ina madarasa saba ya uhifadhi: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, na Glacier Deep Archive.
- **Sera za mzunguko wa maisha** zinafanya mabadiliko kiotomatiki kati ya madarasa ya uhifadhi kulingana na umri — fafanua mara moja, S3 inashughulikia milele.
- **S3 Intelligent-Tiering** huhamisha vitu kiotomatiki kati ya tabaka kulingana na mifumo halisi ya ufikiaji — tumia kwa mzigo usioweza kutabiriwa.
- **Upakiaji wa sehemu nyingi** unahitajika kwa vitu > 5GB na inashauriwa kwa chochote > 100MB.
- **Upokezaji wa S3** (SRR na CRR) hunakili vitu katika ndoo na kanda — kwa DR, uzingatifu, au ukusanyaji.
- **Kufungwa kwa Kitu cha S3** hutoa uhifadhi wa WORM kwa hali za uzingatifu.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.1)*

- **Ishara za uteuzi wa darasa la uhifadhi**:
  - "Inapatikana mara kwa mara" → Standard
  - "Inapatikana mara moja kwa mwezi, inahitaji urejeshaji wa papo hapo" → Standard-IA
  - "Inaweza kustahimili masaa ya muda wa urejeshaji, inapatikana mara chache" → Glacier Flexible Retrieval
  - "Uzingatifu wa kisheria, uhifadhi wa miaka 7+, hazijapatikwa kamwe" → Glacier Deep Archive
  - "Mifumo ya ufikiaji isiyojulikana au inayobadilika" → Intelligent-Tiering
- **Mifumo ya mtihani ya sera ya mzunguko wa maisha**: "punguza kiotomatiki gharama za uhifadhi data inavyozeeka," "hamia kwa kumbukumbu baada ya siku 90" → sera za mzunguko wa maisha.
- **Ada ya ufuatiliaji wa Intelligent-Tiering**: Ada ndogo kwa kitu. Kwa idadi kubwa ya vitu vidogo, hii inaweza kuzidi akiba. Mtihani unaweza kujaribu hili.
- **Mahitaji ya CRR**: Upigaji toleo lazima uwezeshwe kwenye ndoo chanzo na lengwa. Chanzo na lengwa lazima ziwe katika kanda tofauti.
- **Kufungwa kwa Kitu cha S3**: "WORM," "haitobadilika," "SEC 17a-4," "haiwezi kufutwa au kubadilishwa" → Kufungwa kwa Kitu. Hali ya utawala (inaweza kupitiwa na wasimamizi). Hali ya uzingatifu (haiwezi kupitiwa na mtu yeyote, ikiwa ni pamoja na mzizi).
- **Kurejesha Glacier**: Vitu katika Glacier havipatikani mara moje. Lazima "urejeshe" nakala kwa S3 Standard kwa ufikiaji. Nakala iliyorejeshwa ni ya muda (unaweka muda). Asili inabaki katika Glacier.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya S3 Standard-IA na S3 Glacier Instant Retrieval. Mfumo gani wa ufikiaji unafanya kila moja kuwa sahihi?

*(Kidokezo: Fikiria jinsi mara nyingi utafikia data na jinsi haraka unahitaji unapoifikia.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni inazalisha 500GB za kumbukumbu za programu kila siku. Kumbukumbu zinaombwa sana katika siku 7 za kwanza (utatuzi na ufuatiliaji). Baada ya siku 7, kumbukumbu zinapatikana mara chache lakini lazima zipatikane ndani ya dakika 30 ikiwa zitahitajika. Baada ya mwaka 1, kumbukumbu lazima zihifadhiwe kwa uzingatifu lakini hazijapatikwa kamwe. Kampuni inahitaji kupunguza gharama za uhifadhi huku ikitimiza mahitaji haya.

Sera gani ya mzunguko wa maisha wa S3 BORA inakidhi mahitaji haya?

A) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Glacier Deep Archive baada ya siku 7; futa baada ya siku 365  
B) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Standard-IA baada ya siku 7; hamia kwa S3 Glacier Flexible Retrieval baada ya siku 365  
C) Hifadhi kumbukumbu zote katika S3 Intelligent-Tiering kuanzia siku ya 1  
D) Hifadhi katika S3 Standard kwa siku 7; hamia kwa S3 Glacier Instant Retrieval baada ya siku 7; hamia kwa S3 Glacier Deep Archive baada ya siku 365

**Kidokezo cha 1**: "Inapatikana ndani ya dakika 30" inazuia darasa gani la uhifadhi?

**Kidokezo cha 2**: Deep Archive inachukua masaa 12 kurejeshwa — haikidhi mahitaji ya dakika 30 kwa siku 7-365.

**Kidokezo cha 3**: Baada ya siku 365, muda wa urejeshaji hauna maana (hazijapatikwa kamwe), kwa hivyo chaguo la bei nafuu zaidi linatumika.

**Jibu**: D

**Maelezo**: S3 Standard kwa siku 7 inashughulikia ufikiaji wa mara kwa mara. Glacier Instant Retrieval hutoa ufikiaji wa millisekunde kwa siku 7-365 — ikitimiza mahitaji ya dakika 30 kwa gharama ya chini sana kuliko Standard-IA. Baada ya siku 365, Glacier Deep Archive ni chaguo la bei nafuu zaidi kwa data ambayo haijapatikwa kamwe.

**Kwa nini si A?** Glacier Deep Archive inachukua masaa 12 kurejeshwa — haikidhi mahitaji ya "upatikanaji wa dakika 30" kwa siku 7-365.

**Kwa nini si B?** Standard-IA baada ya siku 7 inafanya kazi, lakini Glacier Instant Retrieval ni ya bei nafuu zaidi kwa kiasi kikubwa. Standard-IA inafaa zaidi unapofikia mara chache lakini unahitaji urejeshaji wa papo hapo — hapa, data inapatikwa mara chache sana baada ya siku 7, ikifanya Glacier kuwa bora zaidi kwa gharama.

**Kwa nini si C?** Intelligent-Tiering ina ada ya ufuatiliaji kwa kitu na inaweza isihamishie kumbukumbu kwa tabaka za kumbukumbu kwa nguvu kama sheria za wazi za mzunguko wa maisha. Kwa kiwango kikubwa cha kumbukumbu zenye mfumo wa ufikiaji unaoweza kutabiriwa, sheria wazi za mzunguko wa maisha ni bora zaidi kwa gharama.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus ina aina tatu za data za S3 zenye sifa tofauti:

- Picha za mgahawa: zilipakiwa mara moja, zilipatikwa mara nyingi na wateja, hazifutwa kamwe
- Risiti za agizo: zilipatikwa na wateja katika mwezi wa kwanza, zimehifadhiwa miaka 7 kwa madhumuni ya kodi
- Mauzo ya uchambuzi: yanazalishwa kila siku, yanachambuliwa katika wiki inayofuata, yanahifadhiwa miaka 2

Buni sera ya mzunguko wa maisha kwa kila moja. Kwa picha za mgahawa, Intelligent-Tiering ingelifaa? Kwa risiti za agizo, darasa gani la uhifadhi linashughulikia dirisha la mwezi 1 hadi miaka 7? Kwa mauzo ya uchambuzi, ungeunda vipi ndoo ili kutumia sera tofauti kwenye viambishi tofauti?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya uteuzi wa tabaka la uhifadhi kwa data ya ulimwengu halisi.)*

## Tukio Baada ya Mikopo

Tom alitekeleza sera za mzunguko wa maisha.

Bili ya S3 ilianguka kutoka $847 hadi $198 katika mwezi uliofuata.

Alichapisha ulinganisho na kuuweka kwenye meza ya Maya bila kusema chochote.

Maya alitazama. Kisha tarehe. Kisha Tom.

"Wiki tatu," alisema.

"Alasiri moja kubuni sera," alisema. "Saa moja kutekeleza. Wiki tatu kuona mzunguko wa kwanza kamili wa malipo."

"Kupunguza kwa theluthi mbili kwa gharama za S3."

"Kwa data ambayo hatufikii."

Maya alitazama nambari tena.

"Tom," alisema, "nataka ufanye ukaguzi huu kwa kila huduma ya AWS tunayotumia. Uhifadhi, kompyuta, mtandao. Tafuta taka."

Alikuwa tayari rudi kwenye meza yake.

"Nilianza wiki iliyopita," alisema.

Katika sura inayofuata: tabaka la hifadhidata lina mazungumzo yake mwenyewe ya aina hii, na Aurora ndiyo jibu ambalo Tom hakutarajia kupenda.
