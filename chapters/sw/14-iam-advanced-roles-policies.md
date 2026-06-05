# Sura ya 14: Nani Anaruhusiwa Kufanya Nini

Tom alikuwa na funguo za ufikiaji wazi katika faili ya maandishi, tayari kubandika.

"Unafanya nini?" Priya aliuliza.

"Mfano wa EC2 unahitaji kusoma faili za usanidi kutoka S3. Ninaweka vitambulisho katika usanidi wa seva."

Alitazama skrini kwa muda. "Funga faili hiyo."

"Nilikuwa tu -"

"Ikiwa mtu ataingia kwenye seva hiyo," alisema, "wanapata funguo hizo. Na funguo hizo zinagusa chochote mtumiaji wa IAM anaruhusiwa kugusa. Ambayo labda ni zaidi ya S3."

Tom alifunga faili.

"Kuna njia bora," alisema. "Seva yenyewe inaweza kuwa na jukumu. Ifikirie kama cheo cha kazi - mfano hauhitaji stakabadhi kwa sababu mfumo tayari unajua ni nini na unaruhusiwa kufanya nini."

Tom alionekana mwenye mashaka. "Kwa hivyo seva inajithibitisha yenyewe?"

"Ndiyo. Bila nenosiri. Bila funguo katika faili ya usanidi. Bila chochote ambacho kinaweza kujitolea kwa git kwa bahati mbaya."

Sehemu hiyo ya mwisho ilitua. Tom alikuwa amepata nenosiri la hifadhidata kwenye historia ya git wiki mbili zilizopita. Alifungua kichupo kipya cha kivinjari.

**Kurudia IAM: Picha Kamili**

Sura ya 3 ilianzisha IAM: watumiaji, vikundi, majukumu na sera. Sasa ni wakati wa kuingia ndani zaidi.

Sera za IAM ni hati za JSON zinazobainisha ni hatua gani zinazoruhusiwa au kukataliwa kwenye rasilimali zipi. Wanaonekana kama hii:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Sera hii inaruhusu kusoma na kuandika vitu kwenye kapu la `nimbus-assets`, na si vinginevyo. Haifuti. Sio kuorodhesha ndoo. Sio operesheni nyingine yoyote ya S3. Sio huduma nyingine yoyote ya AWS.

Hii ndiyo njia sahihi ya kutoa ruhusa: vitendo maalum, rasilimali maalum.

**Tatizo la "Ufikiaji wa Msimamizi"**

Sera Zinazosimamiwa na AWS kama vile `AdministratorAccess` zimeundwa ili kuanza haraka. Hazijaundwa kwa ajili ya kuendesha mifumo ya uzalishaji na washiriki halisi wa timu.

`AdministratorAccess` hutoa kila hatua kwenye kila rasilimali. Mshiriki wa timu aliye na sera hii akifanya makosa - akifuta ndoo ya S3 kwa bahati mbaya, akasimamisha tukio lisilo sahihi la EC2, kubadilisha sheria za kikundi cha usalama - hakuna AWS inaweza kufanya ili kuwazuia. Ruhusa ilitolewa.

Ikiwa kitambulisho cha mshiriki wa timu kimeingiliwa (shambulio la hadaa, ufunguo wa ufikiaji uliovuja, wizi wa kompyuta ya mkononi), mshambulizi ana ufikiaji wa msimamizi kwa kila kitu katika akaunti yako ya AWS.

"Kwa hivyo Soo-Jin anapaswa kuwa na nini?" Leo aliuliza.

"Soo-Jin anahitaji kufanya nini?" Priya alijibu.

"Weka API. Angalia kumbukumbu. Hakuna kingine."

"Kisha anapata: uwezo wa kusukuma kwa bomba la nambari, kusoma ufikiaji wa kumbukumbu za CloudWatch, na hakuna kitu kingine chochote."

"Hiyo ni ... maalum sana."

"Ndiyo. Hiyo ndiyo maana."

**Majukumu ya IAM: Vitambulisho vya Huduma**

Sura ya 3 ilianzisha majukumu kama njia ya matukio ya EC2 kufikia huduma za AWS bila kuhifadhi kitambulisho. Hebu tufanye saruji hii.

Matukio yako ya EC2 inayoendesha API ya Nimbus yanahitaji:

- Soma kutoka kwa DynamoDB (menyu)
- Andika kwa DynamoDB (maagizo)
- Weka vitu katika S3 (risiti, upakiaji)
- Andika kumbukumbu kwa CloudWatch
- Soma siri kutoka kwa Meneja wa Siri

Badala ya kuunda mtumiaji na ufunguo wa ufikiaji na kuhifadhi ufunguo huo kwenye mfano wa EC2 (ndoto ya usalama - funguo za ufikiaji zinaweza kusomwa na mtu yeyote aliye na ufikiaji wa SSH), unaunda **jukumu la IAM** kwa mfano wa EC2 kwa ruhusa hizi haswa.

Mfano wa EC2 huchukua jukumu kiotomatiki. AWS hutoa kitambulisho cha muda kupitia huduma ya metadata ya mfano. Kitambulisho huzunguka kiotomatiki. Hakuna ufunguo wa ufikiaji wa kuvuja.

"Na ikiwa mtu ataingilia mfano wa EC2?" Leo aliuliza.

"Wanaweza kufanya kile ambacho jukumu la EC2 linaruhusu," Priya alisema. "Ambayo ni kusoma menyu, kuandika maagizo, na kutuma kumbukumbu. Haziwezi kufuta ndoo ya S3. Haziwezi kusitisha matukio ya EC2. Haziwezi kugusa IAM."

"Kwa sababu jukumu la EC2 halina ruhusa hizo."

"Hasa."

**Dhana ya Jukumu: Jinsi Huduma Zinavyokuwa Huduma Zingine**

Majukumu yanaweza kuchukuliwa na:

- **Huduma za AWS** (EC2, Lambda, kazi za ECS, n.k.)
- **Watumiaji wa IAM** katika akaunti yako mwenyewe (mwinuko wa jukumu - unachukua jukumu lenye vibali zaidi kwa kazi mahususi)
- **Watumiaji wa IAM katika akaunti zingine za AWS** (ufikiaji wa akaunti tofauti - akaunti ya shirika lingine inaweza kuchukua jukumu lako)
- **Watoa huduma za utambulisho wa nje** (Google, Active Directory, Okta - ufikiaji wa shirikisho kwa watumiaji wa kibinadamu)

Mtindo huu wa mwisho - **shirikisho la utambulisho** - ni jinsi mashirika makubwa yanavyowapa wafanyikazi wao ufikiaji wa AWS bila kuunda watumiaji mahususi wa IAM kwa kila mtu. Orodha ya Active ya kampuni yako ina kitambulisho chako. Unapoingia kwenye AWS, unathibitisha dhidi ya Saraka Inayotumika, na AWS hukupa jukumu.

**Mipaka ya Ruhusa: Kuweka Kikomo yale Majukumu Inaweza Kutoa**

Hili hapa ni tatizo dogo lakini muhimu: kwa chaguo-msingi, IAM haimzuii mtumiaji kutoa ruhusa ambazo hawana kwa sasa.

Ikiwa Soo-Jin ana `iam:CreatePolicy` na `iam:AttachUserPolicy`, anaweza kuunda sera inayotoa ufikiaji wa uandishi wa S3 na kuiambatanisha naye mwenyewe - hata kama sera zake zilizopo zinaruhusu tu S3 kusomwa. Aina hii ya uwezekano wa kuathiriwa inaitwa **ukuaji wa fursa**, na ndiyo maana hasa mipaka ya ruhusa ipo.

Lakini vipi ikiwa ungependa kukabidhi uundaji wa idhini ya IAM kwa kiongozi wa timu, huku ukihakikisha kuwa hawawezi kutoa zaidi ya ulivyokusudia?

**Mipaka ya ruhusa** imeweka ruhusa za juu zaidi ambazo zinaweza kutolewa kwa utambulisho. Hata kama sera zilizoambatishwa za kitambulisho ni pana zaidi, ruhusa zinazofaa zimefungwa na mpaka wa ruhusa.

Mfano: Unaipa timu kiongozi sera inayowaruhusu kuunda majukumu ya IAM. Lakini unaambatisha mpaka wa ruhusa unaosema "majukumu yaliyoundwa na kiongozi huyu wa timu hayawezi kamwe kuwa na ufikiaji wa kufuta S3." Hata kama kiongozi wa timu ataunda jukumu na ufikiaji kamili wa S3, mpaka huzuia ufutaji wa S3 kuanza kutumika.

Hili ni wazo la hali ya juu, lakini inaonekana kwenye mtihani na huakisi jinsi mashirika yanakabidhi usimamizi wa IAM kwa kiwango.

**Kichanganuzi cha Ufikiaji cha IAM: Ruhusa za Ukaguzi**

Priya alitumia siku mbili kukagua usanidi wa IAM wa timu. Alipata:

- Mtumiaji wa kibinafsi wa Leo alikuwa na ufikiaji wa msimamizi (kama ilivyogunduliwa)
- Kitendaji cha zamani cha Lambda kilikuwa na ruhusa ya kusoma ndoo zote za S3 (zilizosalia kutoka kwa jaribio)
- Jukumu la huduma lilikuwa na ufikiaji wa kuandika kwa meza za DynamoDB ambazo hazikuwepo tena

Hii ni kawaida. Mipangilio ya IAM hujilimbikiza kwa wakati.

**IAM Access Analyzer** ni huduma ya AWS ambayo hutambua kiotomatiki rasilimali (ndoo za S3, majukumu ya IAM, vitufe vya KMS, vitendaji vya Lambda) ambazo hushirikiwa na huluki za nje. Pia inabainisha sera zinazoruhusu kupita kiasi.

Ukaguzi wa mara kwa mara wa IAM unapaswa kuwa sehemu ya shughuli zako. Ruhusa kukua; mara chache hupungua kikaboni. Access Analyzer husaidia kufanya asiyeonekana kuonekana.

**Sera za Udhibiti wa Huduma: Walinzi wa Ngazi ya Shirika**

Ikiwa mazingira yako ya AWS yatakua na kuwa akaunti nyingi (mfano wa kawaida kwa timu kubwa - akaunti ya dev, akaunti ya jukwaa, akaunti ya uzalishaji), **Mashirika ya AWS** hukuwezesha kuyadhibiti kutoka kwa akaunti kuu.

Ndani ya Mashirika, **Sera za Udhibiti wa Huduma (SCPs)** huweka miiko inayoathiri *kila* huluki ya IAM kwenye akaunti, ikiwa ni pamoja na wasimamizi.

Mfano SCP: "Hakuna mtu katika akaunti ya dev anayeweza kuunda matukio ya EC2 katika eneo la eu-west-1."

Hata kama mtu ana ufikiaji wa msimamizi katika akaunti ya dev, hawezi kukiuka SCP hii. Inatekelezwa katika kiwango cha shirika, juu ya kiwango cha akaunti.

SCPs hazitoi ruhusa - zinazizuia. Zinafafanua ruhusa za juu zaidi ambazo huluki yoyote ya IAM katika akaunti inaweza kuwa nayo.

## Nguvu na Mapungufu

**Kwa nini majukumu ya IAM na fursa ndogo ni muhimu**:

- Mipaka ya radius ya mlipuko wakati kitambulisho kinaathirika
- Inahitaji washambuliaji kuongezeka kupitia mifumo mingi badala ya kupata ufikiaji kamili mara moja
- Hutoa njia ya ukaguzi - kumbukumbu za CloudTrail ni jukumu gani lilifanya nini
- Hulazimisha maamuzi makini kuhusu ufikiaji — "huduma hii inahitaji nini haswa?"

**Ambapo inakuwa ngumu **:

- Kuandika sera mahususi za IAM kunahitaji kuelewa muundo wa kitendo/rasilimali wa AWS kwa kila huduma (na kila huduma ina vitendo vingi)
- Sera zenye vizuizi kupita kiasi huvunja programu - kutatua hitilafu za "ufikiaji umekataliwa" kwenye huduma nyingi unatumia muda
- IAM hueneza mabadiliko kwa kuchelewa kidogo (kwa kawaida sekunde, wakati mwingine zaidi) - inaweza kusababisha masuala ya kuchanganya wakati
- Majukumu ya akaunti tofauti yanahitaji usanidi makini wa sera ya uaminifu

## Muhtasari

- Epuka ufikiaji wa **msimamizi** katika toleo la umma - ni kwa ajili ya kusanidi, si kwa uendeshaji.
- Sera za IAM zinabainisha **Athari**, **Kitendo**, na **Nyenzo** - ziwe mahususi kwa zote tatu.
- Ambatisha sera kwa **vikundi** (kwa wanadamu) na **majukumu** (ya huduma).
- Matukio ya EC2, chaguo za kukokotoa za Lambda, na huduma zingine za AWS zinapaswa kutumia **majukumu ya IAM**, si vitufe vya kufikia.
- **Mipaka ya ruhusa** hufunika idadi ya juu zaidi ya ruhusa ambazo utambulisho wowote unaweza kuwa nao, bila kujali sera zilizoambatishwa.
- **SCPs** (Sera za Kudhibiti Huduma) huweka vizuizi vya shirika kote ambavyo hata wasimamizi hawawezi kubatilisha.
- **Kichanganuzi cha Ufikiaji cha IAM** hutambua sera zinazoruhusu kupita kiasi na ufikiaji wa nje wa rasilimali.

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Salama (Kikoa cha 1, Kazi ya 1.1)*

- **Majukumu ya IAM ya EC2**: Jibu la kisheria wakati EC2 inahitaji kufikia S3, DynamoDB, Kidhibiti cha Siri, au huduma yoyote ya AWS. Usiwahi kuhifadhi funguo za ufikiaji kwa mfano.
- **Mantiki ya tathmini ya sera**: IAM inapotathmini ombi, hutumia kibali cha wazi cha kuruhusu/kukataa daraja. **Kataa** dhahiri hushinda kila mara, hata dhidi ya Ruhusu kwa njia dhahiri. Chaguo msingi ni Kataa.
- **Mipaka ya ruhusa**: Inatumika wakati wa kukabidhi usimamizi wa IAM. Hali ya mtihani: "ruhusu wasanidi kuunda majukumu kwa ajili ya utendaji wao wa Lambda, lakini wazuie kutoa ruhusa zaidi ya kile walicho nacho." → Mipaka ya ruhusa.
- **SCPs hazitoi ruhusa**: Zinaweka vikwazo pekee. Ikiwa SCP inaruhusu S3 lakini sera ya IAM inaikataa, S3 inakataliwa. Ikiwa SCP itakataa S3 lakini sera ya IAM inaruhusu, S3 inakataliwa.
- **Sera zinazotegemea rasilimali**: Baadhi ya huduma za AWS (S3, SQS, Lambda) zina sera zinazotegemea rasilimali - ruhusa zilizoambatishwa kwenye rasilimali, si utambulisho. Hizi hufanya kazi pamoja na sera za IAM.
- **Ufikiaji wa akaunti tofauti**: Jukumu la IAM katika Akaunti A yenye sera ya uaminifu inayoruhusu Akaunti B kulichukua. Mtumiaji/jukumu la Akaunti B kisha hutumia `sts:AssumeRole` kupata kitambulisho cha muda katika Akaunti A.
- **Watumiaji wa IAM dhidi ya Ufikiaji Shirikishi**: Kwa mashirika makubwa, ufikiaji wa shirikisho (kupitia Kituo cha Utambulisho cha IAM au shirikisho la moja kwa moja lenye IdP) unapendekezwa zaidi ya watumiaji binafsi wa IAM.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza tofauti kati ya sera ya IAM iliyoambatishwa kwa mtumiaji na jukumu la IAM linalochukuliwa na mfano wa EC2. Je, ungetumia kila moja lini?

*(Kidokezo: Fikiria kuhusu stakabadhi — wanaishi wapi, na ni nani anayesimamia mzunguko wao?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Chaguo la kukokotoa la Lambda linahitaji kusoma kutoka kwa ndoo ya S3 na kuandikia jedwali la DynamoDB. Msanidi ameipa kazi ya Lambda jukumu la `AdministratorAccess` kwa urahisishaji wakati wa usanidi. Kabla ya kuhamia kwenye toleo la umma, timu ya usalama inataka kufuata mapendeleo machache zaidi.

Ni ipi kati ya zifuatazo ni njia BORA?

A) Unda mtumiaji mpya wa IAM na ruhusa ya kusoma ya S3 na DynamoDB; toa ufunguo wa ufikiaji; kuhifadhi ufunguo katika vigezo vya mazingira vya Lambda  
B) Ambatisha sera ya ndani kwa jukumu la utekelezaji la chaguo la kukokotoa la Lambda kutoa `s3:GetObject` kwenye ndoo mahususi na `dynamodb:PutItem` kwenye jedwali mahususi.  
C) Weka `AdministratorAccess` lakini ongeza SCP ambayo inazuia vitendo vyote isipokuwa S3 na DynamoDB  
D) Unda kikundi cha IAM na ruhusa ya kusoma ya S3 na DynamoDB na uongeze kazi ya Lambda kwenye kikundi

**Kidokezo cha 1**: Vitendaji vya Lambda hutumia majukumu ya utekelezaji, si vitufe vya kufikia. Ni chaguo gani linaloheshimu hili?

**Kidokezo cha 2**: Upendeleo mdogo unamaanisha hatua mahususi kwenye rasilimali mahususi, si sera pana.

**Kidokezo cha 3**: Vikundi vya IAM vina watumiaji, si vitendaji vya Lambda.

**Jibu**: B

**Maelezo**: Jukumu la utekelezaji la Lambda linapaswa kuwa na ruhusa mahususi pekee ambazo chaguo la kukokotoa linahitaji. Sera za ndani zinazoelekezwa kwa vitendo mahususi (`s3:GetObject`) na nyenzo mahususi (ndoo ARN, jedwali la DynamoDB ARN) ni utekelezaji usio na manufaa.

**Kwa nini isiwe A?** Kuhifadhi vitufe vya ufikiaji katika vibadilishio vya mazingira vya Lambda ni kipingamizi cha usalama - funguo zinaweza kusomwa na mtu yeyote aliye na ufikiaji wa kiweko cha Lambda au kupitia muktadha wa utekelezaji. Chaguo za kukokotoa za Lambda hutumia majukumu ya utekelezaji na vitambulisho vya muda kutoka kwa IAM.

**Kwa nini isiwe C?** SCP zinatumika katika kiwango cha Shirika/akaunti na hazifanyi kazi kama vidhibiti vya ruhusa kwa kila utendakazi. AdministratorAccess na SCP ni safu isiyo sahihi.

**Kwa nini isiwe D?** Vitendaji vya Lambda haviwezi kuongezwa kwa vikundi vya IAM. Vikundi ni vya watumiaji wa IAM pekee.

*Kikoa cha SAA-C03: Usanifu Salama wa Kubuni — Jukumu la 1.1*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus imeongezeka hadi timu tatu: timu ya msingi ya API, timu ya tovuti ya washirika wa mgahawa, na timu ya uchanganuzi. Kila timu ina wasanidi watano na inatumwa kwa akaunti ya AWS iliyoshirikiwa.

Tengeneza muundo wa IAM ambao:

- Huipa kila timu ufikiaji wa huduma zao pekee
- Huzuia timu ya uchanganuzi kutoka kuandika hadi hifadhidata za uzalishaji
- Huruhusu timu inayoongoza katika kila timu kuunda majukumu ya IAM kwa huduma zao, lakini si kuongeza ruhusa zao wenyewe
- Hutoa kikundi cha wasimamizi kwa timu ya jukwaa ambayo inaweza kudhibiti huduma zote

Je, ungetumia miundo gani ya IAM? Mipaka ya ruhusa itatumika wapi?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya muundo wa IAM wa timu nyingi.)*

## Onyesho la Baada ya Mikopo

Leo alitumia wikendi kufanyia kazi upya IAM.

Kufikia Jumatatu, kila huduma ilikuwa na jukumu lenye vibali vilivyohitaji. Soo-Jin na Rafael walikuwa na uanachama wa kikundi unaolingana na majukumu yao halisi ya kazi. Leo mwenyewe alikuwa ameacha ufikiaji wa msimamizi na alikuwa akitumia jukumu alilopanga - kwa ruhusa ya kufanya kazi yake, na hakuna zaidi.

Ilikuwa imechukua muda mrefu kuliko ilivyotarajiwa.

Priya alikagua kazi yake Jumanne asubuhi. Alisoma nyaraka za sera kwa makini.

"Hii ni nzuri," alisema.

"Asante," Leo alisema, huku akifurahishwa na mtu ambaye alitumia wikendi kunyenyekezwa na JSON.

"Umeacha jambo moja."

Leo akakaza.

"Ufunguo wa zamani wa kupeleka kutoka toleo la kwanza. Katika siri ya Vitendo vya GitHub."

"Hiyo ilikuwa imezimwa."

Priya aliandika kitu. "Ilikuwa?"

Pause.

"Nitazima," Leo alisema.

"Kumbukumbu za CloudTrail zinaonyesha ilipiga simu tatu za API wiki iliyopita."

Kipindi kirefu zaidi.

"Kuna kitu kilikuwa kinaitumia," Leo alisema. "Nitachunguza."

Katika sura inayofuata: tofauti kati ya mlinzi anayekumbuka nyuso na mlango unaosoma beji pekee.
