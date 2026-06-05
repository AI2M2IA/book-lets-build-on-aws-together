# Sura ya 16: Funguo, Kufuli na Siri

Leo alikuwa akikagua historia ya git alipoipata. Nenosiri la hifadhidata. Imetolewa miezi sita iliyopita, kwa maandishi wazi, na mtu ambaye hafanyi kazi tena Nimbus. Ahadi hiyo ilikuwa ya umma. Nenosiri lilikuwa limebadilishwa - lakini hawakujua hilo kwa hakika. Walikagua kila mfumo ambao sifa iliwahi kuguswa. Ilichukua masaa manne. Hiyo ndiyo siku ambayo Nimbus aliamua kuacha kuweka siri kwa siri.

**Matatizo Mbili: Kuhifadhi Siri na Usimbaji Data**

Usalama karibu na taarifa nyeti una matatizo mawili tofauti:

**Kuhifadhi kitambulisho** (manenosiri ya hifadhidata, funguo za API, miunganisho ya miunganisho): Hizi huishi wapi? Nani anaweza kuzifikia? Je, unazizungusha vipi bila kutuma upya programu yako?

**Data ya kusimba kwa njia fiche** (maelezo ya mteja, rekodi za malipo, PII): Je, unahakikishaje kwamba hata kama mtu atapata ufikiaji usioidhinishwa wa hifadhidata yako au ndoo ya S3, hawezi kusoma data?

AWS ina huduma iliyojitolea kwa kila shida:

- **Kidhibiti cha Siri za AWS**: Huhifadhi na kudhibiti kitambulisho kwa usalama
- **AWS KMS (Huduma Muhimu ya Kusimamia)**: Hudhibiti funguo za usimbaji kwa ajili ya kusimba na kusimbua data

** Kidhibiti cha Siri za AWS: Hakuna Kitambulisho Kinachoshikiliwa Zaidi **

Kidhibiti cha Siri ni hifadhi salama ya siri: kitambulisho cha hifadhidata, funguo za API, tokeni za OAuth, funguo za SSH, au kitu chochote nyeti.

Badala ya programu yako kusoma nenosiri kutoka kwa anuwai za mazingira au faili ya usanidi, huita API ya Kidhibiti cha Siri wakati wa kuanza (au inapohitajika) na kupata siri hiyo. Siri kamwe haigusi diski. Haionekani kamwe katika msimbo wako. Haiko katika anuwai za mazingira yako.

Hivi ndivyo mtiririko unavyoonekana:

**Njia ya zamani**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

**Njia ya Kidhibiti cha Siri**:

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

Mfano wa EC2 unahitaji jukumu la IAM kwa ruhusa ya kupiga simu `secretsmanager:GetSecretValue` kwa siri hiyo mahususi. Hakuna huduma nyingine inayoweza kuisoma. Siri kamwe haiko kwenye kanuni.

**Mzunguko wa Kiotomatiki: Nguvu Halisi**

Kipengele kikuu cha Kidhibiti cha Siri si kuhifadhi siri - ni kuzizungusha kiotomatiki.

Hali hii ndiyo hii: kila baada ya siku 30, Kidhibiti cha Siri hutengeneza nenosiri jipya la hifadhidata, hulisasisha katika RDS, husasisha siri iliyohifadhiwa, na programu yako hurejesha nenosiri jipya wakati mwingine inapohitaji. Hakuna uingiliaji kati wa mikono. Hakuna kupelekwa. Hapana "Ninahitaji kukumbuka kuzungusha hii."

Mzunguko unatekelezwa kama chaguo la kukokotoa la Lambda. AWS hutoa violezo vya hifadhidata za RDS (MySQL, PostgreSQL, Aurora). Unaweza kubinafsisha chaguo za kukokotoa kwa aina yoyote ya kitambulisho.

Tom alikuwa na swali kuhusu gharama. (Bila shaka alifanya.)

Malipo ya Kidhibiti cha Siri kwa kila siri kwa mwezi pamoja na kwa simu ya API. Kwa idadi ndogo ya manenosiri ya hifadhidata na funguo za API, gharama ni dola kwa mwezi - kidogo ikilinganishwa na gharama ya tukio.

"Maelewano ya wiki iliyopita," Priya alisema, "ingegharimu nini kuchunguza na kurekebisha?"

Tom alikuwa kimya kwa muda. "Ikijumuisha wakati wangu, wakati wako, wikendi ya Leo ... dola elfu kadhaa."

"Meneja wa Siri angeshika ufunguo tuli kabla haujatumiwa. Na ingeuzungusha kiotomatiki."

Tom akavuta ukurasa wa bei.

**AWS KMS: Kiwanda cha Kufuli**

AWS KMS (Huduma ya Udhibiti wa Ufunguo) inadhibiti **funguo za kriptografia** — thamani za siri zinazotumiwa kusimba na kusimbua data.

Mfano: KMS ni kama kampuni ya kisanduku cha kufuli ambayo ina ufunguo mkuu. Data yako (yaliyomo kwenye kisanduku) imesimbwa kwa njia fiche. Ni mtu aliye na ruhusa ya kutumia ufunguo wa KMS pekee ndiye anayeweza kusimbua. KMS huweka kumbukumbu kila utumiaji wa kila ufunguo katika CloudTrail.

**Funguo Kuu za Mteja (CMKs)** — ambazo sasa zinaitwa funguo za KMS — zinakuja katika aina mbili:

**Vifunguo vinavyodhibitiwa na AWS**: AWS huunda na kudhibiti ufunguo kiotomatiki kwa huduma kama vile S3, EBS, RDS. Hudhibiti ufunguo moja kwa moja, lakini unaweza kuona kuwa unatumika. Bure.

**Vifunguo vinavyodhibitiwa na mteja**: Unaunda ufunguo katika KMS na kudhibiti kila kipengele chake: ni nani anayeweza kuutumia, unapozunguka, ni nani anayeweza kuusimamia. Unaweza kuwezesha mzunguko wa kila mwaka otomatiki. Gharama: $1/mwezi kwa kila ufunguo pamoja na gharama za kila simu-API.

**Usimbaji fiche katika Huduma za AWS: Ushirikiano wa KMS**

Huduma nyingi za AWS huunganishwa na KMS kwa usimbaji fiche:

**S3**: Washa "usimbaji fiche wa upande wa seva kwa KMS" kwenye ndoo. Kila kitu kimesimbwa kwa njia fiche kikiwa kimetulia kwa kutumia ufunguo wa KMS. Kusoma kitu kunahitaji ruhusa kwa ndoo ya S3 *na* kitufe cha KMS.

**RDS**: Washa usimbaji fiche wakati wa uundaji. Hifadhi ya hifadhidata, nakala rudufu, na vijipicha vyote vimesimbwa kwa ufunguo wa KMS. Kumbuka: usimbaji fiche hauwezi kuwezeshwa kwa mfano uliopo wa RDS ambao haujasimbwa - lazima upige picha, unakili muhtasari ukiwa umewasha usimbaji fiche, na urejeshe.

**EBS**: Simba kiasi kwa njia fiche ukitumia KMS. Majuzuu mapya yaliyoundwa kutoka kwa vijipicha vilivyosimbwa kwa njia fiche husimbwa kiotomatiki.

**DynamoDB**: Usimbaji fiche ukiwa umepumzika kwa kutumia KMS huwashwa kwa chaguomsingi kwenye majedwali yote.

**ElastiCache Redis**: Usimbaji fiche ukiwa umepumzika kwa kutumia KMS kwa data nyeti iliyoakibishwa.

Kanuni: data inapaswa kusimbwa kwa njia fiche wakati wa mapumziko (kuhifadhiwa kwenye diski) na katika usafiri (kusonga kwenye mtandao). KMS hushughulikia usimbaji fiche wakati wa kupumzika. TLS/SSL (hutolewa kiotomatiki na huduma za AWS) hushughulikia usimbaji fiche wa ndani ya usafiri.

**Usimbaji wa Bahasha: Jinsi KMS Hufanya Kazi**

Hapa kuna maelezo ambayo hukusaidia kuelewa tabia ya KMS na maswali ya mtihani.

KMS haisimbishi data yako moja kwa moja katika hali nyingi. Inatumia **usimbaji fiche wa bahasha**:

1. KMS hutengeneza **ufunguo wa data** (ufunguo wa kipekee wa ulinganifu)
2. Huduma hutumia ufunguo wa data kusimba data yako ndani ya nchi (haraka — usimbaji fiche linganifu)
3. Huduma inauliza KMS kusimba ufunguo wa data yenyewe (kwa kutumia ufunguo wako wa KMS)
4. Data iliyosimbwa kwa njia fiche na ufunguo wa data uliosimbwa huhifadhiwa
5. Data yako halisi haiachi kamwe huduma — kitufe cha data pekee ndicho kinachoenda kwa KMS kwa usimbaji/usimbuaji

Unaposoma data:

1. Huduma inauliza KMS kusimbua ufunguo wa data
2. KMS hukagua ruhusa, huondoa ufunguo wa data, huirudisha
3. Huduma hutumia ufunguo wa data uliosimbwa kusimbua data yako ndani ya nchi

Hii inamaanisha kuwa KMS inaweza kushughulikia data kubwa sana bila kutuma yote kupitia API ya KMS. Vifunguo vidogo pekee ndivyo vinavyoenda kwa KMS. CloudTrail huweka kumbukumbu kila simu ya API ya KMS - kila usimbaji fiche na usimbuaji.

** Meneja wa Siri dhidi ya Duka la Parameta **

AWS pia ina **Duka la Vigezo vya Kidhibiti cha Mifumo**, ambalo huhifadhi maadili ya usanidi (sio siri tu). Duka la Parameta ni la bei nafuu - bila malipo kwa vigezo vya kawaida. Inaweza pia kuhifadhi vigezo vilivyosimbwa kwa kutumia KMS.

Kwa siri zinazohitaji kuzungushwa: Kidhibiti cha Siri.

Kwa maadili ya usanidi na vigezo visivyo na nyeti: Hifadhi ya Parameter (tier ya bure ni ya ukarimu sana).

Kwa usanidi wa programu (nambari za bandari, alama za vipengele, mipangilio mahususi ya mazingira): Duka la Vigezo.

## Nguvu na Mapungufu

**Kidhibiti cha Siri za AWS**:

- Mzunguko wa siri otomatiki bila mabadiliko ya msimbo
- Udhibiti mzuri wa ufikiaji wa IAM kwa kila siri
- Utoaji (fikia toleo la awali wakati wa mzunguko)
- Ukaguzi kupitia CloudTrail
- Gharama: ~$0.40/siri/mwezi + simu za API

**KMS AWS**:

- Udhibiti muhimu wa kati na uchaguzi kamili wa ukaguzi
- Mzunguko wa ufunguo wa kila mwaka otomatiki kwa funguo zinazodhibitiwa na mteja
- Ruhusa nzuri za IAM kwa kila ufunguo (sera muhimu + sera za IAM)
- Moduli ya Usalama ya Vifaa (HSM) inaungwa mkono - vitufe hazitoki kwenye HSM
- Gharama: $1/mwezi kwa ufunguo + $0.03 kwa simu 10,000 za API

**Ambapo inakuwa ngumu **:

- Sera muhimu za KMS zimetenganishwa na (na kutathminiwa pamoja) sera za IAM - zinaweza kuchanganya kutatua hitilafu
- Usimbaji fiche ukiwa umepumzika lazima upangwa - huwezi kusimba kwa njia fiche mfano uliopo wa RDS ambao haujasimbwa mahali pake
- Ufutaji muhimu katika KMS una muda wa kusubiri wa siku 7-30 (utaratibu wa usalama - funguo zilizopotea inamaanisha data iliyopotea)
- Kidhibiti cha Siri hugharimu kiwango na idadi ya siri na simu za API kwa kiwango

## Muhtasari

- Usihifadhi kamwe kitambulisho katika msimbo, anuwai za mazingira, au kusanidi faili zilizowekwa kwa udhibiti wa toleo.
- **Kidhibiti cha Siri** huhifadhi vitambulisho kwa usalama na kuvizungusha kiotomatiki. Programu huchota siri kupitia API.
- **KMS** inadhibiti vitufe vya usimbaji fiche. Huduma nyingi za AWS huunganishwa na KMS kwa usimbaji fiche wakati wa mapumziko.
- **Usimbaji fiche ukiwa umepumzika** (data iliyohifadhiwa kwenye diski) hutumia vitufe vya KMS vinavyodhibitiwa na AWS au wewe. **Usimbaji fiche katika usafiri** hutumia TLS.
- **Usimbaji fiche wa bahasha**: KMS husimba ufunguo kwa njia fiche, si data moja kwa moja. Huduma husimba data kwa njia fiche kwa kutumia ufunguo wa data wa ndani.
- **Vifunguo vya KMS vinavyodhibitiwa na Mteja**: udhibiti kamili wa mzunguko, ufikiaji na ukaguzi. **Vifunguo vinavyodhibitiwa na AWS**: kiotomatiki, hakuna usanidi unaohitajika.
- **Duka la Vigezo** ni mbadala nyepesi kwa Kidhibiti cha Siri kwa thamani zisizo nyeti za usanidi.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Salama (Kikoa cha 1, Kazi ya 1.3)*

- **Kidhibiti cha Siri dhidi ya Duka la Vigezo vya SSM**: Kidhibiti cha Siri kwa vitambulisho vinavyohitaji kuzungushwa kiotomatiki; Hifadhi ya Parameta kwa usanidi wa jumla. Mtihani unazitofautisha kwa mahitaji ya mzunguko na usikivu wa gharama.
- **Sera muhimu za KMS**: Ufunguo wa KMS una sera yake kuu (sera inayotegemea rasilimali). Sera za IAM pekee hazitoi ufikiaji wa ufunguo wa KMS - sera muhimu lazima iruhusu waziwazi.
- **Kusimba kwa RDS**: Haiwezi kuwezesha usimbaji fiche kwenye mfano uliopo wa RDS ambao haujasimbwa. Mchakato: unda muhtasari → nakili muhtasari na usimbaji fiche umewezeshwa → kurejesha kutoka kwa muhtasari uliosimbwa → hamisha trafiki hadi kwa mfano mpya.
- **Usimbaji fiche wa EBS**: Kiasi kipya kinaweza kusimbwa kwa njia fiche. Vijipicha vya juzuu zilizosimbwa kwa njia fiche daima husimbwa kwa njia fiche. Majalada ambayo hayajasimbwa hayawezi kusimbwa moja kwa moja - snapshot + copy + rejesha.
- **CloudTrail + KMS**: Kila simu ya API ya KMS inaingia kwenye CloudTrail. Hiki ni kipengele muhimu cha kufuata.
- **Vifunguo vya KMS za Maeneo Mbalimbali**: Rudia nyenzo muhimu kwa maeneo mengi ili usimbuaji ufanyike bila simu za API za maeneo mbalimbali. Mtihani hutumia hii kwa uokoaji wa maafa wa maeneo mengi kwa data iliyosimbwa.
- **KMS dhidi ya CloudHSM**: KMS ina wapangaji wengi (inasimamiwa na AWS). CloudHSM ni moduli maalum ya usalama ya maunzi ambayo unadhibiti wewe pekee. Ishara za mtihani: "FIPS 140-2 Kiwango cha 3," "HSM maalum," "operesheni za kriptografia zinazodhibitiwa na mteja" → CloudHSM.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza dhana ya usimbaji fiche wa bahasha. Kwa nini KMS husimba ufunguo mdogo wa data kwa njia fiche badala ya kusimba data yako ya programu moja kwa moja?

*(Kidokezo: Fikiria kile kitakachotokea ikiwa una 1GB ya data ya kusimba kwa njia fiche, na athari za utendakazi za kutuma 1GB kwa huduma ya mbali ya KMS itakuwaje.)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni ya huduma za kifedha huhifadhi data nyeti ya mteja katika hifadhidata ya RDS MySQL. Mahitaji mapya ya kufuata yanaamuru kwamba:

1. Data zote lazima zisimbwe kwa njia fiche wakati wa mapumziko
2. Matumizi yote ya ufunguo wa usimbaji lazima yaweze kukaguliwa
3. Vifunguo vya usimbaji fiche lazima vidhibitiwe na mteja (visidhibitiwe na AWS)
4. Nenosiri la hifadhidata lazima lizungushwe kiotomatiki kila baada ya siku 90

Hifadhidata iliundwa miezi sita iliyopita bila usimbaji fiche kuwezeshwa. Ni seti gani ya vitendo BORA inakidhi mahitaji yote manne?

A) Wezesha usimbaji fiche wa RDS kwenye hifadhidata iliyopo; tengeneza ufunguo wa KMS unaosimamiwa na mteja; sanidi Kidhibiti cha Siri na mzunguko wa siku 90  
B) Unda picha ndogo ya hifadhidata iliyopo; nakili snapshot kwa usimbaji fiche kwa kutumia ufunguo wa KMS unaosimamiwa na mteja; kurejesha kutoka kwa snapshot iliyosimbwa; sanidi Kidhibiti cha Siri na mzunguko wa siku 90  
C) Unda mfano mpya wa RDS uliosimbwa kwa kutumia kitufe kinachodhibitiwa na AWS; kuhamisha data kutoka kwa mfano wa zamani; sanidi Kidhibiti cha Siri na mzunguko wa siku 90  
D) Washa usimbaji fiche wa RDS kwenye hifadhidata iliyopo kwa kutumia kitufe kinachodhibitiwa na AWS; sanidi Kidhibiti cha Siri na mzunguko wa siku 90

**Kidokezo cha 1**: Huwezi kuwezesha usimbaji fiche kwenye mfano uliopo wa RDS ambao haujasimbwa moja kwa moja.

**Kidokezo cha 2**: "Vifunguo vinavyodhibitiwa na Mteja" vinamaanisha vitufe vya KMS vinavyodhibitiwa na mteja, si vitufe vinavyodhibitiwa na AWS.

**Kidokezo cha 3**: Mchakato wa kunakili muhtasari ni njia ya kawaida ya uhamishaji hadi RDS iliyosimbwa kwa njia fiche.

**Jibu**: B

**Maelezo**: Usimbaji fiche wa RDS hauwezi kuwashwa kwa tukio lililopo. Mbinu ya kawaida ni: piga picha mfano uliopo → nakili muhtasari kwa usimbaji fiche ukiwashwa kwa kutumia ufunguo wa KMS unaodhibitiwa na mteja (hukidhi mahitaji 1, 2, na 3) → kurejesha kutoka kwa muhtasari uliosimbwa. Vifunguo vya KMS vinavyodhibitiwa na mteja huweka kiotomatiki matumizi yote katika CloudTrail (ukaguzi) na uweke vitufe vya usimbaji fiche chini ya udhibiti wako. Kidhibiti cha Siri hushughulikia mzunguko wa nenosiri wa siku 90 kiotomatiki (kinakidhi hitaji la 4).

**Kwa nini isiwe A?** Huwezi kuwezesha usimbaji fiche kwenye mfano uliopo wa RDS ambao haujasimbwa mahali pake.

**Kwa nini isiwe C?** Vifunguo vinavyodhibitiwa na AWS havikidhi mahitaji ya "kudhibitiwa na mteja" (sharti la 3).

**Kwa nini isiwe D?** Suala sawa na A (haiwezi kuwasha mahali) pamoja na ufunguo unaodhibitiwa na AWS halikidhi mahitaji ya 3.

*Kikoa cha SAA-C03: Usanifu Salama wa Kubuni — Jukumu la 1.3*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inahitaji kuhifadhi data nyeti ifuatayo:

- Nenosiri la hifadhidata kwa mfano wa uzalishaji wa RDS
- Ufunguo wa siri wa Stripe API (hutumika kwa usindikaji wa malipo)
- Kitufe cha usimbaji linganifu cha kusimba historia ya agizo la mteja katika DynamoDB
- Thamani za usanidi wa kila mkahawa (vituo vya mwisho vya API, alama za vipengele - sio nyeti)

Je, ungetumia huduma au mbinu gani ya AWS kwa kila moja? Je, ungetumia mkakati gani wa mzunguko kwa kila mmoja?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kulinganisha zana za usalama ili kutumia kesi.)*

## Onyesho la Baada ya Mikopo

Siri zilihamishwa.

Nywila za hifadhidata: Kidhibiti cha Siri, kinachozunguka kila siku 30.

Vifunguo vya API: Kidhibiti cha Siri, na Lambda ya mzunguko ambayo iliita API ya mtoa huduma wa malipo kuunda ufunguo mpya.

Data ya agizo la mteja: imesimbwa kwa njia fiche kwa ufunguo wa KMS unaodhibitiwa na mteja.

Kitambulisho cha zamani: kimezimwa. Faili za zamani za usanidi: zimefutwa. Siri za Old GitHub Vitendo: zimeondolewa.

"Sasa tuko tayari kufanya ukaguzi," Priya alisema.

"Fafanua kuwa tayari kwa ukaguzi," Maya alisema.

"Kama mkaguzi wa utiifu alitaka tuthibitishe kwamba hakuna stakabadhi zilizowekwa kwa misimbo ngumu katika msimbo wetu au kufichuliwa katika miundombinu yetu, tunaweza kuzionyesha: kila siri iko kwenye Kidhibiti cha Siri, kila ufunguo wa usimbaji fiche uko katika KMS, kila ufikiaji umeingia kwenye CloudTrail."

"Ni lini mara ya mwisho mtu kukagua kumbukumbu za CloudTrail?"

Pause.

"Ninaziangalia kila wiki," Priya alisema.

"Na ikiwa kitu kisicho cha kawaida kitatokea, tungejuaje?"

"Hayo," Priya alisema, akifunga laptop yake, "ndio mazungumzo yanayofuata."

Katika sura inayofuata: tabaka tatu za ulinzi ambazo zinasimama kati ya Nimbus na mtandao.
