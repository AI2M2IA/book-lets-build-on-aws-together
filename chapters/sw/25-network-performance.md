# Sura ya 25: Barabara Kuu ya Kibinafsi

Simama kwa dakika. Tikisa mikono yako.

Tutazungumza kuhusu kuhamisha data. Si kati ya huduma za AWS, bali kati ya ulimwengu halisi na AWS — kati ya ofisi yako na miundombinu yako ya wingu, kati ya mabara.

Timu ya miundombinu ya Nimbus (sasa wahandisi wanne) ilifanya kazi kutoka ofisi ya pamoja huko Seattle. Walihitaji ufikiaji kwa miundombinu ya AWS waliyoisimamia. Baadhi ya shughuli zilihitaji kuunganika kwa rasilimali katika VPC.

Kwa sasa, walitumia VPN kwenye kompyuta za mkononi kufikia mwenyeji wa bastion kwenye subnet ya umma, kisha SSH kwa rasilimali kutoka hapo.

Ilifanya kazi. Ilikuwa polepole. Muunganisho wa VPN ulipita kwenye mtandao wa umma: Seattle → nyuzi toka pembeni hadi pembeni ya nchi → njiapinzani za msafirishaji nyingi → us-east-1. Kila safari ya kwenda na kurudi ilikuwa millisekunde 80+.

"Kwa SSH ya kila siku, hiyo inakubalika," Leo alisema. "Lakini tunakaribia kuhamisha hifadhidata yetu ya uchambuzi. Terabytes 4 za data ya kihistoria ya agizo. Kupitia muunganisho huu, uhamiaji utachukua wiki."

"Tunahitaji muunganisho bora," Maya alisema.

"Muunganisho wa kibinafsi," Priya aliongeza. "Si kupitia mtandao wa umma."

Fikiria kama kukuja kazini. VPN ya Site-to-Site ni kama kuendesha kwenye barabara za umma: unafunga milango ya gari (usimbaji fiche), lakini bado unashiriki njia na kila mtu mwingine, na msongamano wa trafiki unakupunguza kwa njia isiyoweza kutabiriwa. Direct Connect ni kama kukodisha njia ya kibinafsi ya kujitolea kwenye barabara kuu — hakuna trafiki inayoshirikiwa, kasi thabiti, na ada ya juu ya kila mwezi. Siku nyingi barabara ya umma ni sawa. Unapobeba malori ya mizigo yenye thamani kwa ratiba kali, unalipa kwa njia ya kibinafsi.

**AWS Site-to-Site VPN: Chaguo la Haraka**

**AWS Site-to-Site VPN** inaunda handaki lililofichwa kati ya mtandao wako wa eneo lako na VPC yako, ukipita kwenye mtandao wa umma.

Usanidi:

1. Unda Virtual Private Gateway (VGW) iliyoambatishwa kwa VPC yako
2. Unda Customer Gateway inayowakilisha kipanga njia cha mtandao wako wa eneo lako
3. Anzisha handaki mbili za VPN (kwa urejeshaji) kati yao

Trafiki imefichwa (AES-256). Inasafiri kwenye mtandao wa umma, ambayo inamaanisha latency inategemea hali za mtandao. AWS hutoa handaki mbili kiotomatiki kwa urejeshaji — ikiwa handaki moja itakuwa na matatizo, trafiki itahamia nyingine.

**Lini kutumia Site-to-Site VPN**:

- Usanidi wa haraka (dakika hadi masaa)
- Bei nafuu ($0.05/saa kwa kila muunganisho wa VPN)
- Kipimo data: hadi Gbps 1.25 kwa kila handaki
- Latency ya mtandao inayokubalika kwa matumizi

Kwa uhamiaji wa 4TB wa Nimbus, VPN inayotegemea mtandao kwa kiwango cha juu cha Gbps 1.25 ingehitaji: 4TB / 1.25 Gbps ≈ saa 7 za chini kabisa, na mzigo halisi karibu saa 12-20. Inakubalika, lakini msongamano kwenye njia ya mtandao wa umma unafanya isiweze kutabiriwa.

"Chaguo lingine ni nini?" Tom aliuliza.

**AWS Direct Connect: Mstari wa Kujitolea**

**AWS Direct Connect** unaanzisha muunganisho wa mtandao wa kibinafsi, uliowekwa kati ya eneo lako (au kituo chako cha co-location) na AWS. Trafiki haigusi kamwe mtandao wa umma.

Direct Connect ni muunganisho wa kimwili — mstari wa nyuzi kutoka mtandao wako hadi eneo la AWS Direct Connect. Unafanya kazi na mtoa huduma wa mawasiliano kuanzisha mzunguko wa kimwili. AWS hutoa bandari upande wao.

**Faida**:

- Latency thabiti, inayoweza kutabiriwa (hakuna utofauti wa mtandao wa umma)
- Kasi kutoka Mbps 50 hadi Gbps 100
- Gharama ya chini ya uhamishaji wa data kuliko mtandao (viwango vya uhamishaji wa data vya Direct Connect ni bei nafuu kuliko viwango vya kawaida vya uhamishaji wa data nje vya AWS)
- Usalama zaidi (mzunguko wa kibinafsi, si mtandao wa umma)

**Maamuzi ya uwiano**:

- Usanidi huchukua wiki hadi miezi (utolewa wa miundombinu ya kimwili)
- Gharama ya juu zaidi sana kuliko VPN ($0.025-0.30/saa kwa kila bandari, pamoja na gharama za mzunguko wa mawasiliano — mara nyingi kiwango cha chini cha $500-1000+/mwezi)
- Hakuna urejeshaji uliojengwa ndani (unaanzisha mzunguko wa urejeshaji mwenyewe)
- Haifai kwa ofisi zilizosambazwa kijiografia bila mzunguko nyingi

Kwa Nimbus: Direct Connect ilikuwa ya ziada kwa ukubwa wao wa sasa. Lakini kwa makampuni makubwa yenye kiwango kikubwa cha uhamishaji wa data au mahitaji ya uzingatifu kwa muunganisho wa mtandao wa kibinafsi, Direct Connect inalipa gharama zake.

**Muunganisho Ulioandaliwa: Njia ya Kati**

Si kila shirika linaweza kujitolea kwa mzunguko wa nyuzi wa Gbps 100 uliojitolea. **Muunganisho Ulioandaliwa wa Direct Connect** inaruhusu Washirika wa AWS Direct Connect (mawasiliano yaliyoidhinishwa) kutoa muunganisho wa chini ya Gbps 1 unaoshirikiana na wateja wengine.

Usanidi ni wa haraka zaidi (siku hadi wiki, si miezi) na gharama ndogo kuliko muunganisho uliowekwa. Uwiano: uwezo wa pamoja unamaanisha uendeshaji mdogo thabiti.

Kwa Nimbus (wanapokua): muunganisho wa Mbps 500 ulioandaliwa kupitia mshirika ungepatia muunganisho wa kibinafsi kwa bei inayofaa.

**AWS Transit Gateway: Hub-na-Bonga kwa VPC**

Nimbus ilipokua, walikuwa wanakusanya VPC nyingi: VPC ya uzalishaji, VPC ya hatua ya kujaribu, VPC ya uchambuzi, VPC ya zana za usalama.

Bila mipango makini, kuunganisha VPC hizi kunahitaji mtandao kamili wa muunganisho wa VPC. Kwa VPC 4: muunganisho 6. Kwa VPC 10: muunganisho 45. Kwa VPC 20: muunganisho 190. Hii haipanui.

**AWS Transit Gateway** ni kitovu cha mtandao kinachounganisha VPC nyingi na mitandao ya eneo lako. Badala ya mtandao wa muunganisho, kila VPC inaunganika kwa Transit Gateway. Transit Gateway inakabidhi trafiki kati yake.

```
Eneo la ndani ──── Direct Connect ──┐
                                  │
VPC ya Uzalishaji ─────────────── Transit Gateway
VPC ya Hatua ya Kujaribu ──────── Transit Gateway
VPC ya Uchambuzi ──────────────── Transit Gateway
VPC ya Usalama ────────────────── Transit Gateway
```

**Upitishaji wa kupita (Transitive routing)**: Ikiwa VPC A na VPC B zote mbili zinaunganika kwa Transit Gateway, zinaweza kuwasiliana — bila mwenzi wa moja kwa moja. Transit Gateway inashughulikia upitishaji. Tofauti na muunganisho wa VPC (ambao si wa kupita), Transit Gateway inaruhusu topology ya hub-na-bonga.

**Gharama za Transit Gateway**: inalipwa kwa kila unganisho (VPC au muunganisho wa VPN/Direct Connect) pamoja na kwa GB ya data iliyoshughulikiwa. Kwa kiwango, hii ina thamani kwa urahisi.

**Sehemu za Mwisho za VPC: Ufikiaji wa Kibinafsi kwa Huduma za AWS**

Tatizo ndogo la gharama na usalama: vipengele vyako vya EC2 (kwenye subnet ya kibinafsi) vinapoita API ya S3, trafiki hiyo inakabidiana kupitia NAT Gateway (kufikia mtandao wa umma, ambapo sehemu ya mwisho ya umma ya S3 ipo). Unalipa kwa usindikaji wa NAT Gateway.

**Sehemu za Mwisho za VPC** zinaruhusu rasilimali katika VPC yako kuwasiliana na huduma za AWS kwa njia ya kibinafsi, bila kupita kwenye mtandao wa umma — na bila NAT Gateway.

Aina mbili:

**Sehemu za Mwisho za Lango (Gateway endpoints)** (bure): Kwa S3 na DynamoDB. Unaongeza njia kwenye jedwali la njia lako linaloendesha trafiki ya S3 au DynamoDB kwa sehemu ya mwisho badala ya NAT Gateway. Bure kuunda; bure kutumia.

**Sehemu za Mwisho za Kiolesura (Interface endpoints)** (zenye bei): Kwa huduma zingine za AWS (SQS, SNS, Secrets Manager, SSM, n.k.). Inaunda ENI (Elastic Network Interface) kwenye subnet yako yenye IP ya kibinafsi. Trafiki kwa huduma inatumia IP hii ya kibinafsi. Inagharimu ~$0.01/saa kwa kila AZ pamoja na usindikaji wa data.

Tom aliunda mara moja Sehemu za Mwisho za Lango kwa S3 na DynamoDB baada ya kujifunza zilikuwa bure. Ada ya usindikaji wa data ya NAT Gateway ilianguka kwa 30%.

**AWS Global Accelerator: Upitishaji kwenye Ukingo**

Nimbus ilipohudumia watumiaji wa Pwani ya Magharibi kutoka us-east-1 (Virginia), latency ilikuwa millisekunde 80. Si kwa sababu seva ilikuwa mbali sana, bali kwa sababu upitishaji wa mtandao wa umma kati ya Seattle na Virginia haukuwa bora, ukipita njia kupitia mitandao mingi ya msafirishaji.

**AWS Global Accelerator** inatumia mtandao wa kibinafsi wa mgongo wa AWS (miundombinu ile ile inayowezesha CloudFront) kupitisha trafiki kati ya watumiaji na programu za AWS. Badala ya upitishaji wa mtandao wa umma, trafiki inaingia mtandao wa AWS kwenye eneo la karibu la ukingo na kusafiri njia iliyoboreshwa ya kibinafsi hadi programu yako.

Kwa Nimbus, mtumiaji huko Seattle angeweza:

- **Bila Global Accelerator**: Kupita kwenye wasafirishaji wa mtandao wa umma → ~millisekunde 80
- **Na Global Accelerator**: Kupiga eneo la karibu la AWS ukingoni Seattle → kusafiri mgongo wa AWS → kufikia us-east-1 → ~millisekunde 45

Global Accelerator haihifadhi maudhui (hiyo ni CloudFront). Inaboresha njia ya mtandao kwa maombi ya nguvu.

**Lini Kutumia Global Accelerator dhidi ya CloudFront**:

- CloudFront: maudhui ya kudumu na ya kuhifadhiwa, matumizi ya CDN
- Global Accelerator: maudhui ya nguvu, itifaki zisizo za HTTP (UDP, mchezo, IoT), au unapohitaji anwani ya IP ya Anycast thabiti

## Nguvu na Mipaka

**Site-to-Site VPN**:

- Usanidi wa haraka, bei nafuu
- Njia ya mtandao wa umma inamaanisha latency inayobadilika
- Dari la kikwazo cha kipimo data

**Direct Connect**:

- Thabiti, ya kibinafsi, kipimo data kikubwa
- Polepole kusanidi, gharama kubwa ya kudumu
- Mzunguko wa kimwili ni hatua moja ya kushindwa (ongeza urejeshaji)

**Transit Gateway**:

- Inaenganisha muunganisho wa VPC nyingi kwa kiasi kikubwa
- Upitishaji wa kupita (tofauti na muunganisho wa VPC)
- Gharama inasanyika kwa unganisho nyingi

**Sehemu za Mwisho za VPC**:

- Faida ya usalama na gharama kwa S3/DynamoDB (sehemu za mwisho za lango bure)
- Inaondoa gharama za NAT Gateway kwa trafiki ya huduma ya AWS

**Global Accelerator**:

- Inaboresha latency ya programu za nguvu kwa watumiaji wa kimataifa
- IP za Anycast zilizowekwa (tofauti na IP za nguvu za CloudFront)
- Gharama ya ziada ($0.025/saa kwa kila kiongezaji + uhamishaji wa data)

## Muhtasari

- **Site-to-Site VPN**: Handaki lililofichwa kwenye mtandao wa umma kati ya eneo la ndani na VPC. Usanidi wa haraka, gharama ya chini, latency inayobadilika.
- **Direct Connect**: Muunganisho wa nyuzi wa kibinafsi, uliowekwa kwa AWS. Latency inayoweza kutabiriwa, kipimo data kikubwa, wiki za kusanidi, gharama kubwa.
- **Transit Gateway**: Kitovu kwa VPC na muunganisho wa eneo la ndani. Inaruhusu upitishaji wa kupita. Inapanua hadi muunganisho mamia.
- **Sehemu za Mwisho za VPC**: Ufikiaji wa kibinafsi kwa huduma za AWS bila NAT Gateway. Sehemu za mwisho za lango (S3, DynamoDB) ni bure.
- **Global Accelerator**: Inapitisha trafiki ya nguvu kwenye mgongo wa AWS kwa latency ya chini, thabiti zaidi kimataifa.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu (Kikoa cha 3, Kazi ya 3.4)*

- **Ishara za VPN dhidi ya Direct Connect**: VPN = "ficha trafiki kwa VPC," "usanidi wa haraka," "nyeti kwa gharama." Direct Connect = "latency thabiti ya chini," "uhamishaji mkubwa wa data," "muunganisho wa kibinafsi," "uzingatifu unaohitaji mtandao wa kibinafsi."
- **Transit Gateway dhidi ya Muunganisho wa VPC**: Muunganisho si wa kupita (A→B→C hairuhusu A→C). Transit Gateway ni ya kupita. "VPC nyingi zinazohitaji kuwasiliana" → Transit Gateway.
- **Sehemu za Mwisho za Lango la VPC**: Bure. S3 na DynamoDB tu. Mabadiliko ya jedwali la njia. Hakuna gharama ya ziada. Hali ya mtihani: "punguza gharama za uhamishaji wa data kwa ufikiaji wa S3 kutoka subnet ya kibinafsi" → Sehemu ya Mwisho ya Lango.
- **Global Accelerator dhidi ya CloudFront**: Kiongezaji = maudhui ya nguvu, si-HTTP, IP thabiti, uboresha wa mtandao. CloudFront = kuhifadhi, maudhui ya HTTP, CDN.
- **Direct Connect + VPN**: Unaweza kutumia VPN kama hifadhi kwa muunganisho wa Direct Connect. Ikiwa mzunguko wa Direct Connect utashindwa, trafiki itahamia kwa VPN. Gharama zaidi kuliko VPN peke yake, ya kuaminika zaidi kuliko Direct Connect peke yake.
- **Direct Connect Gateway**: Unganisha mzunguko wa Direct Connect kwa VPC nyingi katika mikoa au akaunti nyingi. Bila hiyo, mzunguko wa Direct Connect unaunganika kwa VGW moja katika mkoa mmoja.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya AWS Site-to-Site VPN na AWS Direct Connect. Katika hali gani ungechagua kila moja?

*(Kidokezo: Fikiria kuhusu muda wa usanidi, gharama, uthabiti wa latency, na mahitaji ya kipimo data.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Kampuni ya huduma za kifedha inahitaji muunganisho wa mtandao wa kibinafsi, uliofichwa, uliowekwa kutoka kwa kituo chao cha data cha eneo lao hadi AWS. Wanabadilisha 500GB za data ya kifedha nyeti kila siku. Muunganisho lazima uwe na latency thabiti, inayoweza kutabiriwa na lazima usipite kwenye mtandao wa umma. Pia wanahitaji muunganisho wa hifadhi ikiwa wa msingi utashindwa.

Muundo gani wa usanifu BORA unakidhi mahitaji haya?

A) Muunganisho wa Site-to-Site VPN wenye upitishaji wa BGP na VPN ya pili kwa urejeshaji  
B) Muunganisho wa Direct Connect na Site-to-Site VPN kama hifadhi  
C) Muunganisho miwili ya Site-to-Site VPN kupitia watoa huduma tofauti wa mtandao  
D) Muunganisho Ulioandaliwa wa Direct Connect na Direct Connect Gateway

**Kidokezo cha 1**: "Lazima usipite kwenye mtandao wa umma" — trafiki ya VPN inapita kwenye mtandao wa umma (imefichwa). Direct Connect peke yake ni ya kibinafsi.

**Kidokezo cha 2**: "Latency thabiti, inayoweza kutabiriwa" — utendaji wa VPN wa mtandao wa umma hutofautiana. Direct Connect ni thabiti.

**Kidokezo cha 3**: "Muunganisho wa hifadhi" — mbinu iliyopendekezwa Direct Connect inapowa msingi ni nini?

**Jibu**: B

**Maelezo**: Direct Connect hutoa muunganisho wa kibinafsi, uliowekwa usioupita mtandao wa umma — ukitimiza mahitaji ya faragha na latency. Site-to-Site VPN kama hifadhi hutoa urejeshaji: ikiwa mzunguko wa Direct Connect utashindwa, trafiki itahamia kwa VPN iliyofichwa. Hii ndiyo mchakato wa kawaida wa HA kwa Direct Connect.

**Kwa nini si A?** Trafiki ya Site-to-Site VPN inapita kwenye mtandao wa umma, ambayo inakiuka mahitaji ya "lazima usipite kwenye mtandao wa umma."

**Kwa nini si C?** Muunganisho miwili ya VPN kupitia ISP tofauti bado inapita kwenye mtandao wa umma, hata ikiwa imefichwa. Haikidhi mahitaji ya mtandao wa kibinafsi.

**Kwa nini si D?** Muunganisho Ulioandaliwa hutoa muunganisho wa Direct Connect lakini chaguo D haijumuishi hifadhi. Direct Connect moja bila hifadhi ni hatua moja ya kushindwa — nyuzi ya kimwili inaweza kukatwa.

*SAA-C03 Kikoa: Kubuni Miundo ya Utendaji wa Juu — Kazi ya 3.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Nimbus inapanua ili iwe na timu za uhandisi za kikanda huko Seattle, Berlin, na Singapore. Kila timu ya kikanda inahitaji ufikiaji kwa:

- VPC ya uzalishaji (kusoma tu kwa utatuzi)
- VPC ya hatua ya kujaribu (ufikiaji kamili kwa majaribio)
- VPC ya uchambuzi (kusoma tu kwa ripoti)

Buni muunganisho wa mtandao. Je, ungetumia Transit Gateway? Direct Connect katika kila kanda au Site-to-Site VPN? Ungatekeleza vipi ufikiaji wa kusoma tu kwa uzalishaji? (Kidokezo: hii ni swali la mtandao na IAM zote mbili.)

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya kubuni mtandao wa multi-region, timu nyingi.)*

## Tukio Baada ya Mikopo

Uhamiaji wa data ulikamilika kwa masaa 14.

Si kupitia njia ya polepole ya mtandao wa umma — Leo alitumia AWS Snow Family (vifaa vya kimwili vya uhifadhi vilivyopelekwa na kutoka AWS) kwa wingi wa data, kisha kusawazisha delta iliyobaki kupitia VPN.

"Wakati ujao," alisema, "tunapaswa kusanidi Direct Connect."

Tom alitafuta bei.

"Bandari ya kujitolea ya 1Gbps ni $216/mwezi," alisema. "Pamoja na mzunguko kutoka ofisi yetu, ambao mawasiliano yalitoa bei ya $800/mwezi."

"Kwa hivyo karibu elfu kwa mwezi kwa jumla."

"Kwa tunachofanya sasa, labda si yenye thamani. Lakini ikiwa tutaanza kubadilisha zaidi ya 10TB kwa mwezi kati ya ofisi yetu na AWS, akiba za uhamishaji wa data kwenye Direct Connect itafidia gharama."

"Kwa hivyo tunafuatilia kiwango cha uhamishaji wa data," Priya alisema, "na kupitiaje inapovuka kiwango cha mwisho."

"Hiyo ndiyo usanifu unaozingatia gharama," Tom alisema.

"Hiyo daima imekuwa lengo," Maya alisema.

Katika sura inayofuata: kinachotokea unapokuwa na data zaidi ya hifadhidata yoyote inayoweza kuhifadhi kwa busara, na unahitaji kuifanya maana.
