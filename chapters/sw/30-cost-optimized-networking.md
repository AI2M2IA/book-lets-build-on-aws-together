# Sura ya 30: Gharama Iliyofichwa

Gharama za uhifadhi zinaonekana kama mstari mmoja: "S3: $198." Gharama za kompyuta zinaonekana kama mstari mmoja: "EC2: $2,340." Gharama za mtandao zinatawanyika katika vipengele vya mstari vya kumi na mbili zenye majina kama "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer," na "CloudFront Data Transfer." Wahandisi wengi wanazijumlisha mara moja, wanawink, na kuzijumlisha tena.

Tom alisema: "Gharama za mtandao. Hiyo ndiyo inayofuata."

Alipiga bili. Alipata sehemu ya uhamishaji wa data. Alijumlisha vipengele vyote vya mstari.

Gharama za mtandao katika AWS ni kama mfumo wa ushuru wa jiji: kuendesha ndani ya jiji ni bure, lakini kila handaki unalochukua linalaza pesa, na kuendesha kati ya mitaa kunagarimu kidogo pia. Watu wengi hawafikirii kuhusu ushuru mpaka wanapata bili mwishoni mwa mwezi na kugundua kwamba wamekuwa wakichukua handaki kila siku wakati kulikuwa na barabara ya juu bure wakati wote. Lengo la sura hii ni kuelewa kila kibanda cha ushuru — na kuamua zipi ni za thamani ya kulipa.

$847/mwezi.

"Tunatumia $847 kwa mwezi kwa uhamishaji wa data," alisema.

"Je, hiyo ni nyingi?" Leo aliuliza.

"Ni zaidi ya bili yetu ya S3 ilikuwa kabla ya kuiboresha. Na sijui hata kulikuwa na bili hii ya uhamishaji wa data ya ukubwa huu."

Maya alitazama. "Uhamishaji wa data ni nini haswa?"

"Ni kile AWS inalipia kwa kuhamisha baiti. Baiti ziingiazo AWS: kawaida bure. Baiti zitokazo AWS kwenda mtandao: zinalipiwa. Baiti zinazosafiri kati ya huduma katika mikoa tofauti: zinalipiwa. Baiti zinazopita kwenye NAT Gateway: zinalipiwa."

"Unaweza kuvunja?"

Tom angeweza. Na alichogundua kulibadilisha jinsi timu ilivyofikiria muundo wao.

**Jinsi AWS Inavyolipia kwa Uhamishaji wa Data**

Bei za uhamishaji wa data za AWS ni za asymmetric:

**Kuingia AWS (inbound)**: Bure. Unaweza kupakia data kiasi chochote unachotaka.

**Kutoka AWS kwenda mtandao (outbound)**: Inalipwa. GB 100 za kwanza/mwezi ni bure. Baada ya hapo:

- $0.09/GB kwa TB 10 za kwanza/mwezi (mikoa ya Marekani)
- $0.085/GB kwa TB 40 inayofuata
- Chini kwa kiwango cha juu zaidi

**Ndani ya Availability Zone sawa**: Bure. Vipengele vya EC2 vikizungumzana katika AZ ile ile havilipi chochote.

**Kati ya Availability Zones (kanda moja)**: $0.01/GB kwa kila upande. Gharama ndogo lakini halisi.

**Kati ya Mikoa**: $0.02-0.08/GB kulingana na mikoa. Trafiki ya toka kanda hadi kanda ni ghali zaidi kwa kiasi kikubwa.

**NAT Gateway**: $0.045/GB iliyoshughulikiwa. Kila baiti kipengele chako cha EC2 cha kibinafsi kinatuma kwenye NAT Gateway kufikia mtandao — na kila baiti inayorudi — inalipwa.

**CloudFront**: Viwango vya chini vya uhamishaji wa data kuliko moja kwa moja AWS-hadi-mtandao. $0.085/GB kwa TB 10 za kwanza (kidogo chini ya uhamishaji wa moja kwa moja wa data nje). CloudFront mara nyingi hupunguza gharama za jumla za uhamishaji kwa sababu kuhifadhi kwake pembezoni kunamaanisha chanzo kinachohudumia data mara chache zaidi.

**Mgawanyo wa Tom**

Baada ya kuainisha kila kipengele cha mstari:

**Data ya outbound kwenda mtandao**: $214/mwezi

- Majibu ya API kwa wateja duniani kote
- Ujazaji wa kashe ya CloudFront (maeneo ya pembeni yanapofetsha kutoka kwa chanzo)

**Usindikaji wa NAT Gateway**: $289/mwezi

- Seva za programu zinazopiga API za nje (msindikaji wa malipo, huduma ya barua pepe, data ya ramani)
- Simu za DynamoDB zinazopita kwenye NAT Gateway (kabla sehemu za mwisho za VPC hazijawekwa kwa meza baadhi)

**Uhamishaji wa data wa toka AZ hadi AZ**: $178/mwezi

- Kisambazaji cha mzigo kwa vipengele vya EC2 (kisambazaji cha mzigo kiko katika AZ moja, vipengele vingine katika nyingine)
- Seva ya programu kwenda nakala ya kusomwa ya RDS (katika AZ tofauti)

**Uhamishaji wa data toka kanda hadi kanda**: $166/mwezi

- Upokezaji wa Aurora Global Database (msingi katika us-east-1, msomaji katika us-west-2)
- Upokezaji toka Mkoa hadi Mkoa wa S3 kwa nakala

**NAT Gateway: Mshangao Mkubwa**

$289/mwezi katika ada za usindikaji wa NAT Gateway ilikuwa kipengele kikubwa. Na sehemu yake haikuhitajika.

Katika Sura ya 11, Tom aliweka Sehemu za Mwisho za Lango la VPC kwa S3 na DynamoDB. Hizi zilikuwa bure. Lakini alikosa kuweka Sehemu za Mwisho za Kiolesura kwa huduma zingine kadhaa:

- Systems Manager (SSM) kwa usimamizi wa kiraka
- Secrets Manager kwa urejeshaji wa vyeti
- CloudWatch kwa usafirishaji wa vipimo na kumbukumbu
- SQS kwa utafutaji wa ujumbe

Kila simu kwa huduma hizi kutoka kwa vipengele vya EC2 vya kibinafsi ilikuwa ikipita kwenye NAT Gateway. Kila simu ilitozwa $0.045/GB.

**Sehemu za Mwisho za Kiolesura** kwa huduma hizi: $0.01/saa kwa kila AZ + $0.01/GB ya data iliyoshughulikiwa.

Kwa kiwango cha Nimbus, Sehemu ya Mwisho ya Kiolesura ya SSM ingegharimu karibu $15/mwezi na kuokoa karibu $43/mwezi katika ada za NAT Gateway (kwa sababu SSM inazalisha kiwango kikubwa cha data kwa usimamizi wa kiraka na simu za duka la parameta).

Gharama na akiba za sehemu za mwisho zilitofautiana kwa huduma na kiwango. Tom alihesabu kwamba kuweka Sehemu za Mwisho za Kiolesura kwa huduma nne za trafiki nyingi kungegharimu $62/mwezi kwa jumla na kuokoa karibu $140/mwezi katika usindikaji wa NAT Gateway.

Akiba ya jumla: $78/mwezi kutoka kuweka sehemu za mwisho peke yake.

**Trafiki ya Toka AZ hadi AZ: Swali la Usanifu**

$178/mwezi katika uhamishaji wa data wa toka AZ hadi AZ ilikuwa ngumu zaidi.

Baadhi yake haikuepukika: kisambazaji cha mzigo husambaza trafiki katika AZ, kwa hivyo baadhi ya maombi yanaanzia AZ moja na kisambazaji cha mzigo kinaelekeza kwa kipengele katika AZ nyingine.

Baadhi yake inaweza kuimarishwa: programu ilisanidiwa kuandika kwa RDS ya msingi (katika us-east-1a) na kusoma kutoka kwa nakala ya kusomwa (katika us-east-1b). Kila swali la kusomwa lilipita mipaka ya AZ.

Kwa masomo, suluhisho moja: sanidi programu kupendelea nakala ya kusomwa katika AZ ile ile na kipengele kinachoomba. Kila AZ inapata nakala yake ya kusomwa. Trafiki inabaki ndani ya nchi.

Uwiano: nakala nyingi za kusomwa = gharama zaidi. Ikiwa gharama ya uhamishaji wa data wa toka AZ hadi AZ ni $50/mwezi na nakala ya ziada ya kusomwa inagharimu $190/mwezi, uimarishaji wa ndani ya AZ haulipwi.

Tom alihesabu: kwa kiwango chao cha sasa cha maswali, trafiki ya toka AZ hadi AZ ilikuwa $31/mwezi tu ya $178. Si yenye thamani ya kuongeza nakala kwa ajili yake.

Gharama zingine za toka AZ hadi AZ zilikuwa upitishaji wa kisambazaji cha mzigo na mawasiliano ya huduma-kwa-huduma — haziepukiki sana kwa kiwango cha sasa cha usanifu.

"Hii ni moja ya hali hizo ambapo kuelewa gharama hakumaanishi kurekebisha," Tom alisema.

"Ingegharimu kiasi gani kuondoa kabisa trafiki ya toka AZ hadi AZ?" Maya aliuliza.

"Kila kitu katika AZ moja kinashinda lengo la Multi-AZ. Hiyo ni akiba ya $31/mwezi kwa bei ya kupoteza upatikanaji wa juu."

"Kwa hivyo tunaiacha," alisema.

"Tunaiacha."

Hii ndiyo mazungumzo ya kukomaa ya gharama: wakati mwingine unalipa kwa kitu kwa sababu mbadala inagharimu zaidi kwa hatari.

**CloudFront: Punguzo la Uhamishaji wa Data**

Hapa kuna ukweli wenye mkanganyiko: kuhudumia data kupitia CloudFront kwa ujumla ni bei nafuu zaidi kuliko kuihudumia moja kwa moja kutoka kwa EC2 au S3.

**EC2 moja kwa moja hadi mtandao**: $0.09/GB
**CloudFront hadi mtandao**: $0.085/GB (kidogo bei nafuu)

Lakini akiba halisi si kiwango cha kwa GB — ni kwamba CloudFront huhifadhi data kwenye maeneo ya pembeni. Watumiaji 1,000 wakiomba picha ile ile ya orodha:

- **Bila CloudFront**: Maombi 1,000 yanagonga chanzo cha S3 × ukubwa wa picha × $0.09/GB
- **Na CloudFront**: Ombi 1 linagonga S3 (kosa la kashe) + maombi 999 yanatolewa kutoka kwa kashe ya pembeni kwa viwango vya CloudFront

Kwa Nimbus na kiwango cha maombi ya kashe cha 83% (kutoka Sura ya 13), walikuwa wakihudumia 83% ya maombi kutoka kashe ya pembeni. Uhamishaji halisi wa data ya chanzo ulikuwa 17% ya maombi yote — 83% ya trafiki yao ya "kutoka nje" ilikuwa imehifadhiwa pembezoni.

"CloudFront si CDN tu kwa utendaji," Tom alisema. "Ni pia uimarishaji wa gharama kwa uhamishaji wa data."

Leo alifikiri. "Tunapaswa kupeleka utoaji wote wa maudhui thabiti kupitia CloudFront, hata kwa mali ambazo si nyeti kwa latency."

"Sahihi. Ikiwa watumiaji wanaipakua kutoka AWS, inapaswa kupita CloudFront."

**S3 Select: Kupunguza Uhamishaji wa Data katika Maswali**

Uimarishaji mdogo: **S3 Select** unakuruhusu kupata safu na nguzo unazohitaji tu kutoka kitu cha S3 (CSV, JSON, Parquet), badala ya kupakua faili nzima kuifilter katika programu yako.

Bila S3 Select:
```python
# Pakua faili ya MB 500, shughulikia katika kumbukumbu
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Na S3 Select:
```python
# Acha S3 ichuje kwanza, hamisha safu zinazolingana tu (~MB 2 badala ya MB 500)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select hupunguza data iliyohamishwa kutoka S3 hadi programu yako. Kwa faili kubwa zenye maswali ya kuchagua, hii inaweza kuwa kupungua kwa mara 10-100 kwa kiwango cha data — na kwa hivyo gharama.

**Uimarishaji Kamili wa Mtandao**

Baada ya wiki tatu za uchambuzi na utekelezaji:

| Kipengele cha Gharama                              | Kabla    | Baada    | Akiba ya Kila Mwezi |
|----------------------------------------------------|----------|----------|---------------------|
| NAT Gateway (Sehemu za Mwisho za Kiolesura)        | $289     | $211     | $78                 |
| Uimarishaji wa CloudFront (hamisha mali zaidi)     | $214     | $147     | $67                 |
| Trafiki ya toka AZ hadi AZ (inakubaliwa ilivyo)    | $178     | $178     | $0                  |
| Trafiki ya toka kanda hadi kanda (inakubaliwa ilivyo) | $166  | $166     | $0                  |
| **Jumla**                                          | **$847** | **$702** | **$145/mwezi**      |

$145/mwezi, $1,740/mwaka katika akiba za mtandao. Kiasi kidogo ikilinganishwa na kompyuta na uhifadhi, lakini chenye maana.

Muhimu zaidi: Tom sasa alielewa kila mstari wa bili ya mtandao. Angeweza kueleza kila gharama na alikuwa ameamua kwa makusudi ipi kuiboresha na ipi kukubali.

## Nguvu na Mipaka

**Gharama za NAT Gateway**:

- Kiwango kikubwa cha data kupitia NAT Gateway kinasanyika haraka
- Sehemu za Mwisho za VPC zinaondoa gharama zingine za NAT kabisa
- Pitia ni huduma gani vipengele vyako vya kibinafsi vinavyopiga simu na kama sehemu za mwisho zinapatikana

**CloudFront kwa gharama**:

- Kiwango cha maombi ya kashe kinaathiri moja kwa moja akiba za gharama
- Kiwango cha juu cha maombi ya kashe = uhamishaji wa chini wa chanzo + gharama ya chini ya jumla ya uhamishaji
- Hamisha utoaji wote wa mali thabiti kupitia CloudFront

**Uwiano wa toka AZ hadi AZ**:

- Kuondoa trafiki ya toka AZ hadi AZ kawaida kunahitaji mabadiliko ya usanifu ambayo yanagharimu zaidi kuliko akiba
- Hesabu kwa makini kabla ya kuboresha

**S3 Select**:

- Akiba kubwa kwa maswali ya kuchagua kwenye vitu vikubwa vya S3
- Haisaidii unapohitaji faili nzima

Katika sura inayofuata: mfumo wa nguzo sita unaouliza maswali ambayo kila mapitio ya usanifu yanapaswa kuanza nayo.

## Muhtasari

- AWS inalipia **data ya outbound** (mtandao: ~$0.09/GB), **trafiki ya toka AZ hadi AZ** ($0.01/GB kwa kila upande), **trafiki ya toka kanda hadi kanda** ($0.02-0.08/GB), na **usindikaji wa NAT Gateway** ($0.045/GB).
- **Data ya inbound** ni bure. **Trafiki ya AZ ile ile** ni bure.
- **Sehemu za Mwisho za Lango la VPC** (S3, DynamoDB): Bure. Zinaondoa gharama za NAT Gateway kwa huduma hizi.
- **Sehemu za Mwisho za Kiolesura za VPC**: Bei kwa saa pamoja na kwa GB. Bei nafuu zaidi kuliko NAT Gateway kwa huduma za kiwango kikubwa.
- **CloudFront** hutoa data kwa viwango vya chini kuliko moja kwa moja EC2-hadi-mtandao na hupunguza kwa kiasi kikubwa kiwango cha uhamishaji wa chanzo kupitia kuhifadhi.
- **S3 Select** hupunguza uhamishaji wa data kutoka S3 kwa kuchuja chanzo chake.
- Gharama zingine za mtandao ni uwiano ya usanifu (toka AZ hadi AZ kwa HA) — zielewa, usizifute daima.

## Vidokezo vya Mtihani

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama (Kikoa cha 4, Kazi ya 4.4)*

- **NAT Gateway dhidi ya Sehemu za Mwisho za VPC**: Hali ya mtihani: "EC2 katika subnet ya kibinafsi mara kwa mara inapiga S3/DynamoDB — jinsi ya kupunguza gharama za NAT Gateway?" → Sehemu za Mwisho za Lango la VPC (bure kwa S3 na DynamoDB).
- **Sheria za bei za uhamishaji wa data**:
  - Kuingia AWS: bure
  - AZ ile ile: bure
  - Toka AZ hadi AZ: inalipwa
  - Toka kanda hadi kanda: inalipwa (kiwango cha juu zaidi)
  - Mtandao: inalipwa (kiwango kikubwa)
- **CloudFront kama uimarishaji wa gharama**: "Punguza gharama za uhamishaji wa data kwa utoaji wa maudhui wa kimataifa" → CloudFront. Tabaka la kashe hupunguza maombi ya chanzo.
- **Uongezaji wa Uhamishaji wa S3**: Huharakisha upakiaji *hadi* S3 kwa kutumia maeneo ya pembeni ya CloudFront. Gharama ya juu zaidi kuliko S3 ya kawaida. Tumia kwa wateja wanaopakia faili kubwa kutoka maeneo ya mbali ya kijiografia.
- **Gharama za upokezaji toka kanda hadi kanda**: Kupokezea data katika mikoa kunasababisha ada za uhamishaji wa data. Kwa S3 CRR, unalipa kiwango cha uhamishaji wa data nje na gharama ya ombi la S3.
- **PrivateLink (Sehemu za Mwisho za Kiolesura za VPC)**: Hutoa muunganisho wa kibinafsi kwa huduma za AWS na kwa huduma zinazohifadhiwa na wateja wengine wa AWS. Salama zaidi kuliko kupita kwenye NAT, mara nyingi bei nafuu kwa huduma za kiwango kikubwa.

## Mazoezi

**Zoezi la 1 — Kumbuka**

Eleza tofauti kati ya Sehemu ya Mwisho ya Lango la VPC na Sehemu ya Mwisho ya Kiolesura la VPC. Huduma za AWS zipi zinapatikana kwa kila moja, na gharama ya kila moja ni nini?

*(Kidokezo: Sehemu za Mwisho za Lango ni bure lakini kwa S3 na DynamoDB tu. Sehemu za Mwisho za Kiolesura zinagharimu kwa saa lakini zinafanya kazi kwa huduma nyingi zaidi za AWS.)*

**Zoezi la 2 — Mazoezi ya Mtihani**

*Hali*: Programu ya kampuni inaendeshwa kwenye vipengele vya EC2 katika subnet za kibinafsi. Vipengele hufanya simu za mara kwa mara za API kwa Amazon SQS na Amazon S3. Kwa sasa, trafiki yote inatoka kupitia NAT Gateway. Timu inataka kupunguza gharama za NAT Gateway. Usalama wa data lazima udumishwe — trafiki yoyote haipaswa kupita kwenye mtandao wa umma.

Mbinu gani BORA inakidhi mahitaji haya kwa gharama ya kuendelea ya chini?

A) Unda Sehemu ya Mwisho ya Lango kwa SQS na Sehemu ya Mwisho ya Lango kwa S3  
B) Unda Sehemu ya Mwisho ya Kiolesura kwa SQS na Sehemu ya Mwisho ya Lango kwa S3  
C) Unda Sehemu za Mwisho za Kiolesura kwa SQS na S3 zote mbili  
D) Ondoa NAT Gateway na utumie lango la mtandao moja kwa moja kwa simu za API

**Kidokezo cha 1**: Sehemu za Mwisho za Lango zinapatikana kwa S3 na DynamoDB tu.

**Kidokezo cha 2**: Sehemu za Mwisho za Kiolesura zinapatikana kwa SQS na huduma nyingi zingine (lakini zinagharimu pesa).

**Kidokezo cha 3**: Lango la Mtandao kwenye jedwali la njia la subnet ya kibinafsi lingelifanya subnet ya umma — inakiuka mahitaji ya usalama.

**Jibu**: B

**Maelezo**: S3 inatumia Sehemu ya Mwisho ya Lango (bure). SQS inahitaji Sehemu ya Mwisho ya Kiolesura (inalipwa). Mchanganyiko huu unaondoa gharama za usindikaji wa NAT Gateway kwa huduma zote mbili. Trafiki yote inabaki ndani ya mtandao wa kibinafsi wa AWS — hakuna kupita kwenye mtandao wa umma.

**Kwa nini si A?** Sehemu za Mwisho za Lango hazipatikani kwa SQS. S3 na DynamoDB tu zina Sehemu za Mwisho za Lango.

**Kwa nini si C?** Ingawa hii inafanya kazi, kutumia Sehemu ya Mwisho ya Kiolesura kwa S3 (badala ya Sehemu ya Mwisho ya Lango ya bure) kunasababisha ada za kwa saa zisizo za lazima. Daima tumia Sehemu ya Mwisho ya Lango ya bure kwa S3 na DynamoDB.

**Kwa nini si D?** Kuongeza njia kwenye Lango la Mtandao kutoka kwa subnet ya kibinafsi inafanya subnet ya umma. Vipengele vya EC2 katika subnet za kibinafsi kawaida havina IP za Elastic, kwa hivyo havingepita kwenye Lango la Mtandao bila mabadiliko ya ziada — na kufanya hivyo kungelazimisha data yao kwa trafiki ya inbound ya mtandao.

*SAA-C03 Kikoa: Kubuni Miundo Iliyoboreshwa kwa Gharama — Kazi ya 4.4*

**Zoezi la 3 — Changamoto ya Usanifu** *(Hiari)*

Watumiaji wa Pwani ya Magharibi wa Nimbus wanazalisha trafiki kubwa. Programu inawahudumia kutoka us-east-1 (Virginia). Kwa sasa:

- Majibu ya API yanaenda moja kwa moja kutoka vipengele vya EC2 vya us-east-1 hadi watumiaji wa Pwani ya Magharibi (~millisekunde 80, $0.09/GB)
- Picha za orodha zinaenda kutoka S3 us-east-1 kupitia pembeni ya CloudFront huko Seattle (~millisekunde 8 baada ya kuhifadhi)

Timu inafikiria kuongeza kanda ya pili ya programu katika us-west-2 (Oregon) kwa watumiaji wa Pwani ya Magharibi kupunguza latency ya API.

Changanua gharama za uhamishaji wa data za mabadiliko haya. Ni gharama gani mpya za uhamishaji wa data toka kanda hadi kanda ambazo mpangilio wa kanda mbili ungeleta? Je, upitishaji wa latency ya msingi wa Route 53 ungepunguza au kuongeza jumla ya gharama za uhamishaji? Chini ya masharti gani (kiwango cha trafiki, unyeti wa latency) mpangilio wa kanda mbili ungelipa?

*(Hakuna jibu moja sahihi. Lengo ni mazoezi ya uchambuzi wa gharama-faida wa multi-region.)*

## Tukio Baada ya Mikopo

Tom alifunga uchambuzi wa mtandao.

Jumla ya athari ya mradi wa uimarishaji wa miezi mitatu:

- Mipango ya Akiba ya EC2: -$14,200/mwaka
- Uhifadhi (S3 + EBS): -$6,200/mwaka
- Tabaka la hifadhidata: -$11,220/mwaka
- Mtandao: -$1,740/mwaka
- **Jumla: -$33,360/mwaka**

Aliandika kwenye ubao mweupe katika chumba cha mikutano.

Leo alitazama. "Elfu thelathini na tatu."

"Na sarafu," Tom alisema.

"Kwa mwaka."

"Kwa mwaka."

Priya alifanya hesabu. "Hiyo ni $2,780 kwa mwezi tulikuwa tukitumia kwa vitu visivyozalisha thamani."

"Si vyote," Tom alisahihisha. "Baadhi yake vilikuwa vitu ambavyo tulikuwa tukipata thamani kutoka, lakini tukilipa zaidi kwa ajili yake. Mipango ya Akiba — tulikuwa tunapata uwezo ule ule wa EC2, kwa bei bora tu."

Maya alisimama kwenye ubao mweupe kwa muda mrefu.

"Tulipoanzia Nimbus," alisema, "kila dola ilikhimu. Hatukuweza kumudu hata kipengele cha kwanza cha EC2."

"Ndiyo," Tom alisema.

"Na mahali fulani njiani, tuliacha kuangalia dola kwa makini sana."

"Ukuaji hufanya hivyo," Priya alisema. "Mwelekeo unabadilika kwa kujenga, si kwa kuiboresha."

"Vyote viwili vina maana," Maya alisema. "Vyote viwili, daima. Ongeza hii kwenye wiki. Na weka mapitio ya robo mwaka kwa gharama."

Tom alikuwa tayari akifungua kalenda yake.

Katika sura chache zinazofuata: tunatoa kutoka huduma maalum na kuanza kufikiria kama wasanifu.
