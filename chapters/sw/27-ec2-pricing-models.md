# Sura ya 27: Kulipa kwa Unachohitaji

Tom alikuwa akipitizia bili ya AWS kila mwezi tangu Nimbus ilipoanza. Kwa mwaka wa kwanza, alielewa karibu 60% ya kile alichokiona. Sasa, alielewa karibu kila kitu — isipokuwa sehemu ya EC2.

Sehemu ya EC2 ilikuwa mchanganyiko wa "vipengele vya On-Demand" kwa aina mbalimbali za vipengele, vyote vikilipiwa kwa saa, vyote vikijumlika hadi $2,340/mwezi.

"Najua tunahitaji vipengele hivi," Tom alisema. "Lakini sielewi kwa nini tunapalipa kiwango cha bei cha kuingia kwa vyote."

"Kiwango cha bei cha kuingia?" Leo aliuliza.

"Bei za On-Demand," Tom alisema. "Ni kama kuhuisha chumba cha hoteli asubuhi unayoihitaji. Kubadilika kwa juu. Bei ya juu."

"Kwa hivyo mbadala ni nini?"

Tom alipiga ukurasa wa bei za EC2.

"Kuna mifano minne ya bei," alisema. "Na tunaitumia moja tu."

**Mfano wa Hoteli**

Bei za EC2 zinaoana vizuri na mikakati ya kuhuisha chumba cha hoteli:

**On-Demand**: Tembea mpaka dawati la mbele bila hifadhi. Unalipa kiwango kamili cha bei ya kawaida, lakini unaweza kutoka lolote unapotaka. Bora kwa makazi yasiyoweza kutabiriwa.

**Vipengele Vilivyohifadhiwa/Mipango ya Akiba (Reserved Instances/Savings Plans)**: Huisha chumba kwa mwaka mzima mapema. Unapata punguzo kubwa — 30-72% — kwa kubadilishana na kujitolea kutumia.

**Vipengele vya Nafasi (Spot Instances)**: Zabuni kwa vyumba visivyouzwa kwa kile hoteli itakachokubali kwa wakati huo. Hadi 90% chini ya bei. Lakini hoteli inaweza kukuomba uondoke na notisi ya dakika mbili ikiwa watahitaji chumba kwa mteja wa bei kamili.

**Majeshi Maalum (Dedicated Hosts)**: Kodi sakafu nzima ya hoteli kwa matumizi yako peke yako. Hakuna kushiriki na wageni wengine. Ghali zaidi sana. Inahitajika wakati leseni za programu au sheria za uzingatifu zinakataza kushiriki mwenyeji wa kimwili.

Kila mfano una matumizi. Kosa Nimbus ilikuwa likifanya: kutumia On-Demand kwa kila kitu, ikiwa ni pamoja na mzigo wa kufanya kazi masaa 24/7 na unaoweza kutabiriwa kabisa.

**Vipengele vya On-Demand: Kubadilika kwa Juu, Gharama ya Juu**

**Lini kutumia**:

- Mzigo usioweza kutabiriwa (mabadiliko ya trafiki usiyoweza kutabiri)
- Maendeleo na majaribio (anzisha na simama mara kwa mara)
- Mzigo wa muda mfupi (kuendesha jaribio kwa wiki)
- Usambazaji wa kwanza (kabla hujui mifumo yako ya matumizi)

**Lini kutumia**:

- Mzigo thabiti wa uzalishaji unaojua utaendelea kwa zaidi ya mwaka
- Chochote chenye mzigo wa msingi unaoweza kutabiriwa

Tom alitambua vipengele vya On-Demand vya Nimbus:

- Seva za API za wavuti: vipengele 4 vya EC2, vikiendeshwa masaa 24/7 kwa miezi 18. *Msingi unaoweza kutabiriwa.*
- Wakala wa hifadhidata (RDS Proxy): Daima ukifanya kazi. *Msingi unaoweza kutabiriwa.*
- Seva ya VPN: Daima ukifanya kazi. *Msingi unaoweza kutabiriwa.*
- Seva za API za ziada kwa mabadiliko ya trafiki: Haiwezi kutabiriwa. *On-Demand ni sahihi hapa.*

**Vipengele Vilivyohifadhiwa: Kujitolea kwa Mwaka**

**Vipengele Vilivyohifadhiwa (Reserved Instances - RIs)** ni kujitolea kwa malipo — unakubali kutumia aina maalum ya kipengele katika mkoa maalum kwa miaka 1 au 3. Kwa kubadilishana, AWS inalipia kiwango cha chini cha kwa saa.

**Viwango vya punguzo**:

- Mwaka 1, Bila Malipo Mapema: punguzo la ~30-40% dhidi ya On-Demand
- Mwaka 1, Malipo ya Sehemu Mapema: punguzo la ~35-45% (lipa baadhi sasa, punguzo zaidi kwa saa)
- Mwaka 1, Malipo Yote Mapema: punguzo la ~40-50% (lipa mwaka mzima sasa)
- Miaka 3, Malipo Yote Mapema: punguzo la ~55-72% (punguzo la juu zaidi, kujitolea kwa juu zaidi)

**RI za Kawaida dhidi ya RI za Kubadilishwa**:

- **Kawaida**: Zimefungwa kwa aina haswa ya kipengele na mkoa. Zinaweza kuuzwa kwenye Soko la Vipengele Vilivyohifadhiwa ikiwa huzitaji tena.
- **Zinazobadilishwa**: Zinaweza kubadilisha aina ya kipengele, OS, na hali ya upangishaji wakati wa kipindi cha kujitolea. Punguzo dogo zaidi kuliko Kawaida (~50% ya juu dhidi ya 72%).

Tom alifanya hesabu kwa seva 4 za API (r6g.large, $0.252/saa On-Demand):

- Gharama ya kila mwaka ya On-Demand: $0.252 × 24 × 365 × 4 = $8,820
- RI ya Mwaka 1 yenye Malipo Yote Mapema (kipengele 1): ~$1,600 mapema
- Vipengele 4: ~$6,400 mapema = **$2,420 zilizookolewa katika mwaka wa kwanza**

"Tungeweza kuokoa $2,420 katika mwaka wa kwanza kwa kujitolea tu," Tom alisema.

"Ni kujitolea," Maya alisema. "Vipi ikiwa tutahitaji kubadilisha aina za vipengele?"

"Tunapata RI za Kubadilishwa ikiwa tunafikiri tunaweza."

"Vipi ikiwa AWS itasambaza aina bora ya kipengele?"

"Tunaangalia RI inapoisha. Ikiwa aina mpya ni bora, tununua RI mpya."

**Mipango ya Akiba: Kujitolea kwa Kubadilika**

**Mipango ya Akiba (Savings Plans)** ni mbadala mpya, unaobadilika zaidi wa Vipengele Vilivyohifadhiwa. Badala ya kujitolea kwa aina maalum ya kipengele, unajitolea kwa *kiasi maalum cha matumizi ya kwa saa* (kwa dola).

**Mipango ya Akiba ya Kompyuta (Compute Savings Plans)**: Inatumika kwa kipengele chochote cha EC2, bila kujali aina, ukubwa, mkoa, au OS. Yenye kubadilika zaidi. Hadi punguzo la 66%.

**Mipango ya Akiba ya Kipengele cha EC2 (EC2 Instance Savings Plans)**: Inatumika kwa familia maalum ya kipengele katika mkoa (mfano, "vipengele vya c6g katika us-east-1"). Ina vizuizi zaidi kuliko Kompyuta, lakini hadi punguzo la 72% (sawa na kiwango cha juu cha RI).

**Mipango ya Akiba ya SageMaker**: Maalum kwa mafunzo na hitimisho za ML za SageMaker.

Kwa Nimbus: Mipango ya Akiba ya Kompyuta kwa seva zao za API. Walijitolea kwa $1.50/saa ya matumizi ya EC2. Aina yoyote ya kipengele, ukubwa wowote. Wanapoongeza kikosi au kubadilisha aina za vipengele, Mpango wa Akiba bado unatumika.

"Hii ni bora kuliko Vipengele Vilivyohifadhiwa kwetu," Leo alisema. "Bado tunajaribu aina za vipengele. Mpango wa Akiba ya Kompyuta unatupa punguzo bila kutufunga kwa r6g maalum."

**Vipengele vya Nafasi: Punguzo la 90%**

**Vipengele vya Nafasi (Spot Instances)** vinatumia uwezo wa EC2 usio na kazi wa AWS. AWS inaposambaratisha seva ambazo hazitumiki, unaweza kuvikodisha kwa 60-90% chini ya bei ya On-Demand. AWS inahitaji uwezo tena (kwa wateja wa On-Demand au Vilivyohifadhiwa), wanakupa notisi ya dakika 2 na kumaliza kipengele chako.

Hatari ya usumbufu ni sifa inayobainisha. Vipengele vya Nafasi vinafaa tu kwa:

- **Mzigo wa ustahimilivu wa hitilafu**: Kipengele kikikomeshwa katikati ya kazi, kazi inaweza kuanzishwa tena bila kudhuru chochote
- **Usindikaji bila hali**: Kupiga ukubwa picha, kusimba video, uchambuzi wa kundi, mafunzo ya ML
- **Kazi za muda mfupi za kundi**: Notisi ya dakika 2 inatosha kuhifadhi hali na alama
- **Vikosi vya mchanganyiko vya Kupanua Kiotomatiki**: Tumia Nafasi kwa wingi wa ASG yako na On-Demand kama msingi

Kwa Nimbus: Vipengele vya Nafasi vilikuwa na maana kwa kazi za uchambuzi za kundi zinazofanya kazi kila usiku (kushughulikia data ya agizo ya siku kuwa ripoti zilizokusanywa). Kipengele cha Nafasi kikikomeshwa katikati ya kazi, kazi inashindwa, lakini inaanzishwa tena kutoka mwanzo kwenye kipengele kipya. Data katika S3 iko salama.

"Kutumia Nafasi kwa kazi ya usiku ilipunguza gharama yake kutoka $12/usiku hadi $2/usiku," Leo aliripoti.

**Majeshi Maalum: Chaguo la Uzingatifu**

Leseni fulani za programu (Oracle, Windows Server katika baadhi ya usanidi) zinalipiwa kwa soketi au msingi wa kimwili. Unapoendesha programu hii kwenye mwenyeji aliyoshirikishwa (chaguo-msingi kwa EC2), unaweza kulipa kwa uwezo usiotumika.

**Majeshi Maalum (Dedicated Hosts)** yanakupa ufikiaji kwa seva ya kimwili kabisa kwa matumizi yako. Unaweza kuleta leseni zako za kwa kila soketi zilizopo. Hakuna vipengele vya mteja mwingine wa AWS vinavyofanya kazi kwenye vifaa vile vile.

Majeshi Maalum ni ghali zaidi sana kuliko EC2 ya kawaida. Ni zana ya uzingatifu na leseni, si zana ya uimarishaji wa gharama.

Nimbus haikuwa na mahitaji ya leseni yaliyohitaji Majeshi Maalum. Programu nyingi zinazozaliwa na wingu hazihitaji.

**Kujenga Kikosi cha Mchanganyiko**

Mbinu iliyokomaa: tumia mifano mingi ya bei pamoja.

Kwa kikosi cha API cha Nimbus:

- **Mzigo wa msingi (vipengele 4, daima vikiendeshwa)**: Kimefunikwa na kujitolea kwa Mpango wa Akiba
- **Kilele cha kutabiriwa (vipengele 2 vya ziada wakati wa masaa ya kazi)**: Kimefunikwa na Mpango wa Akiba ikiwa kujitolea kunafunika, vinginevyo On-Demand
- **Mabadiliko ya trafiki**: Vipengele vya Nafasi (inakubalika kwa sababu seva za API hazina hali — maombi yanasambazwa upya kipengele kikikomeshwa)

Matokeo: kikosi kinachoboresha gharama katika kila tabaka — bei iliyojitolea kwa sehemu inayoweza kutabiriwa, On-Demand kwa ukuaji usioweza kutabiriwa, Nafasi kwa uwezo wa mabadiliko.

## Nguvu na Mipaka

**On-Demand**: Hakuna kujitolea. Bei kamili. Tumia kwa mzigo usioweza kutabiriwa au wa muda mfupi.

**Vipengele Vilivyohifadhiwa**: Hadi punguzo la 72%. Zimefungwa kwa aina maalum ya kipengele/mkoa/OS. Uza uwezo usiotumika kwenye Soko la RI.

**Mipango ya Akiba**: Hadi punguzo la 66-72%. Yenye kubadilika zaidi kuliko RI (Mipango ya Akiba ya Kompyuta inatumika kwa aina yoyote ya kipengele). Matumizi ya kiotomatiki kwenye matumizi yanayofanana.

**Vipengele vya Nafasi**: Hadi punguzo la 90%. Hatari ya usumbufu wa dakika 2. Kwa mzigo tu wa ustahimilivu wa hitilafu, bila hali, unaoweza kukatizwa.

**Majeshi Maalum**: Seva kamili ya kimwili. Ghali zaidi. Inahitajika kwa baadhi ya leseni au hali za uzingatifu.

## Muhtasari

- Bei za EC2 zina mifano minne: **On-Demand** (bei kamili, hakuna kujitolea), **Vipengele Vilivyohifadhiwa/Mipango ya Akiba** (matumizi yaliyojitolea kwa punguzo kubwa), **Nafasi** (uwezo wa ziada kwa 60-90% chini, unaokatizwa), **Majeshi Maalum** (haki maalum za seva ya kimwili).
- **Mipango ya Akiba** kwa ujumla hupendelewa zaidi kuliko Vipengele Vilivyohifadhiwa kwa kubadilika.
- **Vipengele vya Nafasi** zinahitaji mzigo wa ustahimilivu wa hitilafu, bila hali — kwa kazi za kundi, mafunzo ya ML, na usindikaji unaoweza kukatizwa tu.
- Mkakati bora ni **kikosi cha mchanganyiko**: Mipango ya Akiba kwa msingi, On-Demand kwa ukuaji usioweza kutabiriwa, Nafasi kwa kazi ya kundi inayoweza kukatizwa.
- Pitia mifano ya bei mzigo ukiendeshwa kwa utulivu kwa miezi 3+ — hiyo ndiyo wakati On-Demand inaanza kuwa taka.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.2)*

- **Mipango ya Akiba dhidi ya Vipengele Vilivyohifadhiwa**: Mipango ya Akiba ina kubadilika zaidi (inatumika kwa kipengele chochote cha EC2 kwa Mipango ya Akiba ya Kompyuta). Vipengele Vilivyohifadhiwa vinafungwa kwa aina maalum ya kipengele. Hali za mtihani: "inahitaji kubadilika kwa juu huku ikipata mapunguzo" → Mipango ya Akiba. "Kujua aina haswa ya kipengele kwa miaka 3" → RI ya Kawaida kwa punguzo la juu zaidi.
- **Ishara za Nafasi**: "nyeti kwa gharama," "ustahimilivu wa hitilafu," "usindikaji wa kundi," "inaweza kushughulikia usumbufu," "mzigo bila hali," "mafunzo ya ML" → Nafasi.
- **Kushughulikia usumbufu wa Nafasi**: Vipengele vya Nafasi vinapata notisi ya dakika 2 kabla ya kukomeshwa. Programu yako lazima ishughulikie hili ipasavyo (hifadhi hali, toa miunganisho, toka kwa usafi).
- **On-Demand dhidi ya Nafasi kwa seva za wavuti**: Seva za wavuti zinazohudumia trafiki ya mtumiaji wa moja kwa moja HAZIPASWI kutumia Nafasi (usumbufu husababisha maombi yaliyoshindwa). Tumia On-Demand au Mipango ya Akiba kwa tabaka la wavuti.
- **Mipango ya Akiba ya EC2 dhidi ya Kompyuta**: Mipango ya Akiba ya EC2 inatumika kwa familia maalum ya kipengele na mkoa (punguzo la juu). Mipango ya Akiba ya Kompyuta inatumika kwa kipengele chochote cha EC2, Lambda, na Fargate (punguzo la juu zaidi kidogo, yenye kubadilika zaidi).
- **Soko la RI**: Vipengele Vilivyohifadhiwa vya Kawaida visivyotumika vinaweza kuuzwa kwa wateja wengine wa AWS. RI za Kubadilishwa haziwezi kuuzwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza wakati Vipengele vya Nafasi vinavyofaa na wakati visivyofaa. Ni sifa gani inayofanya mzigo kufaa kwa Nafasi?

*(Kidokezo: Fikiria kinachotokea kipengele kikikomeshwa na notisi ya dakika 2. Mzigo gani unarejea vizuri? Upi haurejesha?)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ya vyombo vya habari inaendesha mzunguko wa usimbaji video unaobadilisha video zilizopakiwa kuwa miundo mingi. Kazi za usimbaji zinaendesha mfululizo video zinapopakiwa (kufanya kazi masaa 24/7, kiasi tofauti). Kila kazi inachukua dakika 5-30. Kazi ya usimbaji ikikatizwa, kazi inaweza kuanzishwa tena kutoka mwanzo bila kupoteza data. Kampuni inataka kupunguza gharama.

Mfano gani wa bei wa EC2 BORA unakidhi mahitaji haya?

A) Vipengele vya On-Demand katika Auto Scaling Group  
B) Vipengele Vilivyohifadhiwa (Mwaka 1, Malipo Yote Mapema)  
C) Vipengele vya Nafasi na Kikosi cha Nafasi kwa utofauti wa kiotomatiki wa vipengele  
D) Majeshi Maalum yenye leseni za programu za vyombo vya habari zilizopo za kampuni

**Kidokezo cha 1**: "Inaweza kuanzishwa tena kutoka mwanzo bila kupoteza data" — hii ndiyo kifungu muhimu kinachowezeshea mfano maalum wa bei.

**Kidokezo cha 2**: "Punguza gharama" na mzigo unaoweza kukatizwa unaelekeza kwa chaguo la punguzo la juu zaidi.

**Kidokezo cha 3**: Kikosi cha Nafasi kinaomba vipengele kutoka aina nyingi za vipengele na AZ, kupunguza uwezekano wa usumbufu.

**Jibu**: C

**Maelezo**: Kazi za usimbaji ni za ustahimilivu wa hitilafu — zinaweza kuanzishwa tena zikikatizwa. Hii inazifanya kuwa bora kwa Vipengele vya Nafasi, ambavyo hutoa punguzo la 60-90% dhidi ya On-Demand. Kikosi cha Nafasi kinatofautiana katika aina za vipengele na Availability Zones, kupunguza uwezekano wa usumbufu wa wingi.

**Kwa nini si A?** On-Demand ni chaguo la gharama ya juu zaidi. Kwa mzigo unaoendelea, wa ustahimilivu wa hitilafu, hii ni taka.

**Kwa nini si B?** Vipengele Vilivyohifadhiwa hutoa punguzo la 50-72% lakini hazitoi punguzo la uwezekano la 90% la Nafasi kwa mzigo wa ustahimilivu wa hitilafu. Pia, RI ni kwa mzigo thabiti, wa hali ya kudumu — Nafasi imetengenezwa mahususi kwa usindikaji wa kundi unaoweza kukatizwa.

**Kwa nini si D?** Majeshi Maalum ni kwa uzingatifu wa leseni, si uimarishaji wa gharama. Ni chaguo la gharali zaidi.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Miundombinu ya Nimbus ina mzigo huu:

1. Seva za API: vipengele 6, vikiendeshwa masaa 24/7, imekuwa thabiti kwa miaka 2, tumia r6g.large
2. Kazi za uchambuzi za kila usiku: vipengele 4, vinaendesha saa 3 asubuhi-6 asubuhi kila usiku, daima aina ile ile ya kipengele
3. Mazingira ya majaribio: vipengele 2, vinatumika na wahandisi saa 9 asubuhi-6 jioni siku za wiki
4. Mabadiliko ya trafiki: vipengele 0-8, vinazinduliwa wakati wa masaa ya kilele, haiwezi kutabiriwa kabisa

Buni mkakati bora wa bei kwa kila aina ya mzigo. Kiasi gani cha kujitolea kwa Mpango wa Akiba kingefunika mzigo 1 na 2? Kwa mzigo 3, kuna mkakati wa akili zaidi kuliko On-Demand?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya mkakati wa bei za EC2.)*

## Tukio Baada ya Mikopo

Tom aliwasilisha ununuzi wa Mpango wa Akiba.

Kujitolea kwa $5.76/saa. Muda wa miaka mitatu. Mipango ya Akiba ya Kompyuta kwa kubadilika.

Akiba iliyokadiriwa: $42,500 zaidi ya miaka mitatu.

Maya alisoma nambari. "Dola elfu arobaini na mbili."

"Ikilinganishwa na On-Demand kwa vipengele vile vile, zaidi ya miaka mitatu."

"Hii iligharimu nini kufanya?"

"Alasiri moja ya uchambuzi," Tom alisema. "Na uamuzi wa kujitolea."

"Miaka mitatu ni muda mrefu," Leo alisema. "Vipi ikiwa tutabadilisha aina za vipengele?"

"Mipango ya Akiba ya Kompyuta inatumika kwa aina yoyote ya kipengele cha EC2. Na kwa miaka mitatu, tuna ukubwa wa kutosha kwamba mazungumzo haya yanakaa tofauti hata hivyo."

Leo alifikiri kuhusu hilo.

"Umejua kuhusu Mipango ya Akiba tangu lini?" aliuliza.

"Tangu tulipoanza," Tom alisema. "Nilikuwa nikisubiri mpaka mzigo ulikuwa thabiti vya kutosha kujitolea."

"Miezi kumi na nane ya kulipa On-Demand wakati wa kusubiri."

"Ndiyo." Tom alifulia dashibodi. "Wakati mwingine jambo la gharali zaidi unalofanya ni kusubiri kuokoa pesa."

Katika sura inayofuata: nidhamu ile ile ikitumika kwa gharama za uhifadhi, na mshangao kadhaa kuhusu kile kinachoendesha bili.
