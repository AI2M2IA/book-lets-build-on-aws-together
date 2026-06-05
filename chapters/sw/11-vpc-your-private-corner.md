# Sura ya 11: Kona yako ya Kibinafsi ya Wingu

Priya alikuwa na karatasi yenye mchoro.

Haukuwa mchoro mgumu. Mstatili, unaoitwa "AWS." Ndani ya mstatili, nguzo ya visanduku: matukio ya EC2, hifadhidata ya RDS, nguzo ya ElastiCache. Mistari inayounganisha kila kitu na kila kitu kingine. Na nje ya mstatili, lebo moja: "Mtandao."

Aliiweka katikati ya meza.

"Hii ndiyo tuliyo nayo," alisema. "Hifadhi yetu ya hifadhidata ina anwani ya IP ya umma. Safu yetu ya akiba inaweza kufikiwa kutoka kwa mtandao. Matukio yetu ya EC2 yote yako kwenye mtandao bapa sawa."

"Hiyo inaonekana sawa," Leo alisema. "Tuna vikundi vya usalama."

"Vikundi vya usalama ambavyo ulivisanidi," Priya alisema. "Wakati wa usiku. Wakati wa usanidi wa awali."

Leo hakusema kitu.

"Sikosoa usanidi," alisema. "Ninasema kwamba wakati kila kitu kinaishi kwenye mtandao wa umma wa gorofa, usanidi mmoja usiofaa ni tofauti kati ya mfumo wa kufanya kazi na ule unaopatikana kwa kila mtu kwenye mtandao."

Alichukua alama nyekundu na kuchora mduara kuzunguka hifadhidata.

"Hii haipaswi kufikiwa kutoka kwa mtandao. Hata kidogo. Sio kupitia sheria ya kikundi cha usalama, si kupitia usanidi mgumu. Inapaswa kuwa isiyoweza kufikiwa kimuundo."

"Tunahitaji kuzungumza juu ya usanifu wa mtandao," Maya alisema.

"Tulihitaji kulizungumzia miezi mitatu iliyopita," Priya alisema. "Lakini sasa ni sawa."

Timu ilikusanyika karibu na ubao mweupe kwa mara ya kwanza baada ya wiki.

**Tatizo la Maegesho ya Wazi**

Hebu fikiria karakana kubwa ya maegesho ya umma. Magari elfu kumi. Gari lolote linaweza kuegesha popote. Hakuna vizuizi kati ya kanda, hakuna milango, hakuna sehemu zilizohifadhiwa.

Huu ni mtandao wazi. Kila huduma inaweza kufikia kila huduma nyingine. Seva yako ya wavuti inaweza kuzungumza na hifadhidata yako. Hifadhidata yako inaweza kufikia mtandao. Safu yako ya akiba inaweza kupokea miunganisho kutoka popote.

Wakati kila kitu kinaweza kuzungumza na kila kitu, maelewano moja huathiri kila kitu.

"Kwa hivyo ikiwa mtu anaingia kwenye karakana ya maegesho," Tom alisema, "wanaweza kuingia kwenye gari lolote."

"Na kutoka kwa gari lolote, endesha popote," Priya alithibitisha. "Tunataka uzio. Tunataka mageti yaliyofungwa. Tunataka kanda."

VPC ni jinsi unavyounda maeneo hayo katika AWS.

**VPC ni nini?**

**Wingu la Kibinafsi la Kibinafsi (VPC)** ni sehemu iliyotengwa kimantiki ya wingu la AWS - mtandao wa kibinafsi unaofafanua, ambao ni rasilimali zako pekee zinaweza kufikia kwa chaguomsingi.

Fikiria kama sehemu ya kibinafsi iliyo na uzio ndani ya karakana kubwa ya maegesho ya umma. Kura yako ina sheria zake mwenyewe: ni nani anayeweza kuingia, ni nani anayeweza kutoka, ni njia gani zilizopo kati ya sehemu.

Unapounda VPC, unafafanua:

**Kizuizi cha CIDR**: Aina mbalimbali za anwani za IP zinazopatikana ndani ya mtandao wako. Kwa mfano, `10.0.0.0/16` hukupa anwani za IP 65,536 zinazowezekana (10.0.0.0 hadi 10.0.255.255).

**Njia ndogo**: Migawanyiko ya VPC yako, kila moja ilitoa sehemu ya masafa ya anwani yako ya IP na kuhusishwa na Eneo mahususi la Upatikanaji.

**Majedwali ya njia**: Sheria zinazobainisha ni wapi trafiki ya mtandao inaenda.

**Lango la Mtandao**: Muunganisho kati ya VPC yako na mtandao wa umma.

**Njia ndogo: Umma dhidi ya Binafsi**

Sio rasilimali zote zinapaswa kufikiwa na umma.

Seva yako ya wavuti inahitaji kukubali trafiki kutoka kwa mtandao - vivinjari vya watumiaji vinahitaji kuifikia.

Hifadhidata yako haipaswi * kamwe* kukubali trafiki kutoka kwa mtandao - seva yako ya wavuti pekee ndiyo inayoweza kuzungumza nayo.

Hapa ndipo subnets huingia.

**Njia ndogo ya umma** imeunganishwa kwenye Lango la Mtandao na inaweza kuwa na nyenzo zilizo na anwani za IP za umma. Trafiki inaweza kutiririka kwenda na kutoka kwenye mtandao.

**Subnet ya kibinafsi** haina muunganisho wa mtandao wa moja kwa moja. Rasilimali katika mtandao mdogo wa faragha zinaweza tu kuwasiliana na rasilimali nyingine katika VPC yako (isipokuwa ukiweka njia mahususi za kwenda nje). Hawana anwani za IP za umma.

Kwa Nimbus, muundo ulikuwa wazi:

```
Internet
    |
Internet Gateway
    |
Public Subnet (AZ-a)     Public Subnet (AZ-b)
  [Load Balancer]          [Load Balancer]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [EC2 Instances]           [EC2 Instances]
    |                          |
Private Subnet (AZ-a)    Private Subnet (AZ-b)
  [RDS Primary]             [RDS Standby]
  [ElastiCache]             [ElastiCache]
```

Kisawazisha cha mzigo kinakabiliwa na umma - kinahitaji kupokea trafiki kutoka kwa mtandao. Matukio ya EC2 ni ya faragha - hupokea tu trafiki kutoka kwa sawazisha mzigo. Hifadhidata ni za kibinafsi - hupokea trafiki kutoka kwa matukio ya EC2 pekee.

"Kwa hivyo ili kufikia hifadhidata," Tom alisema, "mtu atalazimika kupitia sawazisha la mzigo, kisha kupitia mfano wa EC2, kisha kupitia kikundi cha usalama cha hifadhidata?"

"Tabaka tatu," Priya alithibitisha. "Ulinzi kwa kina."

**Lango la NAT: Subnet za Kibinafsi Ambazo Bado Inaweza Kupakua Vitu **

Neti ndogo za kibinafsi haziwezi kufikia mtandao. Lakini wakati mwingine, wanahitaji. Tukio lako la EC2 linahitaji kupakua sasisho la programu. Programu yako inahitaji kupiga API ya nje.

Hapa ndipo **NAT Gateway** (Tafsiri ya Anwani ya Mtandao) inapoingia.

Lango la NAT linakaa kwenye mtandao mdogo wa umma. Rasilimali katika nyati ndogo za kibinafsi zinaweza kutuma trafiki inayotoka kwa lango la NAT, ambalo huipeleka kwenye mtandao - lakini mtandao hauwezi kuanzisha tena miunganisho.

Ni kama mlango unaozunguka upande mmoja. Unaweza kwenda nje. Hakuna mtu wa nje anayeweza kuingia.

"Lango la NAT linagharimu kiasi gani?" Tom aliuliza.

Swali hilo halikumshangaza mtu.

Bei ya lango la NAT ina vipengele viwili: malipo ya kila saa kwa kila lango la NAT, pamoja na ada ya kuchakata data kwa kila GB. Hii inaweza kuongeza bila kutarajiwa (Sura ya 30 inashughulikia hii kwa undani). Kwa sasa: usitumie Lango la NAT zaidi kuliko unavyohitaji, na fahamu kuwa idadi kubwa ya data inayotoka itaonyeshwa kwenye bili yako.

**Majedwali ya Njia: Jinsi Trafiki Inavyopata Njia Yake**

Kila subnet ina **meza ya njia** inayoelezea trafiki mahali pa kwenda.

Jedwali la kawaida la njia ndogo ya umma inaonekana kama hii:

| Lengwa | Lengo |
|------------------------------------------|
| 10.0.0.0/16 | mtaa |
| 0.0.0.0/0 | igw-xxxx (Lango la Mtandao) |

Kanuni ya kwanza: trafiki kwa IP yoyote katika safu yako ya VPC hukaa ndani. Kanuni ya pili: trafiki nyingine zote (`0.0.0.0/0` inamaanisha "kila kitu") huenda kwenye Lango la Mtandao.

Jedwali la njia ndogo ya kibinafsi:

| Lengwa | Lengo |
|--------------------------------------|
| 10.0.0.0/16 | mtaa |
| 0.0.0.0/0 | nat-xxxx (Lango la NAT) |

Trafiki ya kibinafsi ya mtandao mdogo hukaa ndani au inatoka kupitia Lango la NAT. Hakuna njia ya moja kwa moja ya Lango la Mtandao.

**Vikundi vya Usalama dhidi ya NACL (Onyesho la kukagua)**

Ndani ya VPC, una zana mbili za kudhibiti trafiki katika kiwango cha rasilimali:

**Vikundi vya Usalama** (Sura ya 15 inashughulikia hili kwa kina) hufanya kama ngome za mtandaoni za rasilimali mahususi - mfano wa EC2, mfano wa RDS, kiweka salio. Ni *dhahiri*: trafiki ikiruhusiwa kuingia, trafiki ya majibu inaruhusiwa kutoka kiotomatiki.

**Network ACLs (NACLs)** zinafanya kazi katika kiwango cha subnet na *zina uraia*: lazima uruhusu kwa uwazi trafiki inayoingia na kutoka kando.

Kwa hali nyingi za matumizi, Vikundi vya Usalama vinatosha. NACL huongeza safu ya ziada unapohitaji vidhibiti vya kiwango cha subnet - kwa mfano, kuzuia masafa mahususi ya IP ili wasiwahi kufikia subnet.

"Vikundi vya usalama katika kiwango cha mfano," Leo aliandika kwenye ubao mweupe. "NACL katika kiwango cha subnet."

"Na usiwahi kuondoka bandari 22 wazi hadi 0.0.0.0/0," Priya aliongeza, akimwangalia Leo.

"Hiyo ilikuwa wakati mmoja," Leo alisema.

"Daima ni wakati mmoja," Priya alisema, "mpaka sivyo."

**Kuangalia VPC: Kuunganisha Mitandao ya Kibinafsi**

Je, ikiwa Nimbus itakua VPC nyingi? (Hili hutokea. Timu zinakuwa kubwa. Huduma hutenganishwa katika akaunti tofauti.)

**VPC Peering** huruhusu VPC mbili kuwasiliana kwa faragha kana kwamba ziko kwenye mtandao mmoja. Trafiki haiondoki kwenye mtandao wa faragha wa AWS.

Vikomo muhimu:

- Utazamaji wa VPC sio wa mpito. Ikiwa VPC A inafanya kazi na VPC B, na VPC B wenzao walio na VPC C, A na C hawawezi kuwasiliana — isipokuwa uongeze mwenzi wa moja kwa moja wa A-C.
- Vitalu vya CIDR haviwezi kuingiliana kati ya VPC zinazofanana.

Kwa usanifu mkubwa ulio na VPC nyingi, **AWS Transit Gateway** (Sura ya 25) hushughulikia uelekezaji wa mpito bila kuhitaji wavu kamili wa miunganisho ya rika.

## Nguvu na Mapungufu

**Kwa nini muundo wa VPC ni muhimu**:

- Kutengwa kwa mtandao ni ulinzi wa kina - kukiuka safu moja haimaanishi kuathiri kila kitu
- Subnets za kibinafsi hupunguza uso wa mashambulizi kwa kiasi kikubwa
- Majedwali ya njia na vikundi vya usalama vinatoa udhibiti kamili wa mtiririko wa trafiki
- VPC huunganishwa na kila huduma ya mtandao ya AWS (Unganisha Moja kwa moja, VPN, Lango la Usafiri)

**Ambapo inakuwa ngumu **:

- Ubunifu wa VPC unahitaji upangaji wa mapema - vitalu vya CIDR ni vigumu kubadilisha baadaye
- VPC nyingi ndogo huleta utata wa rika (tatizo la n-mraba)
- Utatuzi wa masuala ya mtandao katika VPC unahitaji kuelewa majedwali ya njia, vikundi vya usalama, NACL na miungano ndogo kwa wakati mmoja
- Gharama za lango la NAT zinaweza kukushangaza kwa kiwango (ada za usindikaji kwa kila GB)

## Muhtasari

- **VPC** ni mtandao wa kibinafsi uliotengwa kimantiki katika AWS - sehemu yako iliyozungushiwa uzio ndani ya wingu la umma.
- **Njia ndogo** gawanya VPC yako kwa Eneo la Upatikanaji. Subnet za umma huunganisha kwenye Lango la Mtandao; subnets binafsi hawana.
- Weka rasilimali zinazoangalia mtandao (vilinganishi vya mizigo) katika subnets za umma. Weka kila kitu kingine (EC2, hifadhidata, kache) kwenye subnets za kibinafsi.
- **Jedwali la njia** kudhibiti mahali ambapo trafiki inapita. Kila subnet ina moja.
- **Lango la NAT** (katika mtandao mdogo wa umma) huruhusu rasilimali za kibinafsi kuanzisha miunganisho ya mtandao inayotoka nje bila kukubali miunganisho ya ndani.
- **VPC Peering** inaunganisha VPC mbili kwa faragha. Si ya mpito - kwa muunganisho wa kiwango kikubwa, tumia Transit Gateway.
- **Vikundi vya usalama** hulinda rasilimali za mtu binafsi (ya serikali). **NACL** hulinda nyavu zote (zisizo na uraia).

## Vidokezo vya Mitihani

*Kikoa cha SAA-C03: Usanifu wa Usanifu Salama (Kikoa cha 1, Kazi ya 1.2)*

- **Mtandao mdogo wa Umma dhidi ya kibinafsi**: tofauti ni jedwali la njia. Subnet ya umma ina njia kuelekea Lango la Mtandao. Subnet ya kibinafsi haifanyi hivyo.
- **Uwekaji lango la NAT**: kila wakati kwenye mtandao mdogo wa *umma*. Rasilimali ndogo ndogo huelekeza msongamano wa watu wanaotoka nje kwenda humo.
- **Upatikanaji wa juu wa NAT**: unda Lango la NAT kwa kila AZ. Ikiwa una Njia moja ya lango la NAT katika AZ-a na AZ-b kupitia njia hiyo, kushindwa kwa AZ-b kunapunguza ufikiaji wa mtandao wa AZ-b pia.
- **VPC Peering si ya mpito**: mtihani utaelezea VPC tatu na kuuliza kama wanaweza kuwasiliana kupitia ile ya kati - jibu ni hapana bila kuangalia moja kwa moja au Transit Gateway.
- **Muingiliano wa CIDR**: VPC zilizoangaliwa haziwezi kuwa na vizuizi vya CIDR vinavyopishana. Mtego wa mtihani wa classic.
- **Mpangishi wa bastion (sanduku la kuruka)**: kwa SSH hadi kwa mfano wa EC2 wa kibinafsi, unahitaji mwenyeji wa bastion katika subnet ya umma. Bastion ndio mashine pekee iliyo na IP ya umma; matukio ya faragha hukubali tu SSH kutoka kwa kikundi cha usalama cha bastion.
- **VPC Endpoints**: ruhusu rasilimali za kibinafsi kufikia huduma za AWS (S3, DynamoDB) bila kupitia NAT Gateway. Aina mbili: **Njia za lango** (S3, DynamoDB — bila malipo) na **Njia za kiolesura** (huduma zingine — bei yake ni kwa saa pamoja na data).

##Mazoezi

**Zoezi la 1 - Kumbuka **

Eleza kwa nini hifadhidata inapaswa kuwa katika subnet ya kibinafsi. Je, hii inapunguza tishio gani mahususi?

*(Kidokezo: Je, mtu anaweza kufanya nini kwenye hifadhidata iliyo kwenye mtandao wa umma ambayo hawezi kufanya kwa ile inayopatikana kutoka ndani ya VPC pekee?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni inaunda programu ya wavuti ya viwango vitatu kwenye AWS. Kiwango cha wavuti (ALB + EC2) lazima kikubali trafiki ya mtandao. Kiwango cha programu (EC2) lazima kipokee trafiki kutoka kwa kiwango cha wavuti pekee. Kiwango cha hifadhidata (RDS) lazima kipokee trafiki kutoka kwa kiwango cha programu tumizi. Matukio ya kiwango cha programu EC2 yanahitaji kupakua vifurushi vya programu kutoka kwa mtandao. Suluhisho lazima lipatikane sana.

Ni usanifu upi BORA unaokidhi mahitaji haya?

A) Ngazi zote katika nyavu ndogo za umma; vikundi vya usalama huzuia trafiki kati ya viwango  
B) Daraja la wavuti katika subnets za umma; programu na viwango vya hifadhidata katika subnets za kibinafsi; Lango moja la NAT kwenye mtandao mdogo wa umma  
C) Daraja la wavuti katika subnets za umma; programu na viwango vya hifadhidata katika subnets za kibinafsi; Lango moja la NAT kwa AZ  
D) Ngazi zote katika subnets za kibinafsi; Lango la Mtandao hutoa ufikiaji wa mtandao wa pande mbili kwa viwango vyote

**Kidokezo cha 1**: "Inapatikana sana" inamaanisha hakuna hatua moja ya kutofaulu. Ni chaguo gani huanzisha Lango la NAT kama sehemu moja ya kutofaulu?

**Kidokezo cha 2**: Ikiwa AZ ya NAT Gateway itapungua, ni matukio gani hupoteza ufikiaji wa mtandao?

**Kidokezo cha 3**: Soma mahitaji kwa makini — kiwango cha programu kinahitaji ufikiaji wa mtandao wa *outenda nje*, si wa ndani.

**Jibu**: C

**Maelezo**: Kiwango cha Wavuti katika nyavu ndogo za umma hutoa ufikiaji wa mtandao kupitia ALB. Viwango vya programu na hifadhidata katika subneti za kibinafsi huhakikisha hazipatikani moja kwa moja kutoka kwa mtandao. Lango moja la NAT kwa kila AZ (moja katika kila subnet ya umma) hutoa ufikiaji wa mtandao wa nje wa upatikanaji wa hali ya juu kwa matukio ya subnet - ikiwa AZ moja itashindwa, Lango lingine la AZ la NAT linaendelea kuhudumia trafiki.

**Kwa nini isiwe A?** Neti ndogo za umma kwa viwango vyote hufichua programu na hifadhidata moja kwa moja kwenye mtandao, na hivyo kukiuka madhumuni ya muundo wa usalama wa viwango.

**Kwa nini isiwe B?** Lango moja la NAT katika AZ moja ni hatua moja ya kutofaulu. Iwapo lango hilo la NAT la AZ litashindwa, matukio yote ya faragha hupoteza ufikiaji wa mtandao wa nje.

**Kwa nini isiwe D?** Lango la Mtandao hutoa muunganisho wa njia mbili - neti ndogo za kibinafsi zilizo na njia ya kwenda kwenye Lango la Mtandao ni nyati ndogo za umma.

*Kikoa cha SAA-C03: Usanifu Salama wa Kubuni — Jukumu la 1.2*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inakua. Timu ya uhandisi inataka kutenganisha "huduma ya menyu" katika akaunti yake na VPC yake, huku ikiweka programu kuu ya Nimbus katika akaunti tofauti na VPC.

Unawezaje kuunganisha VPC hizi mbili ili programu kuu iweze kuuliza huduma ya menyu? Je, ni vikwazo gani utahitaji kupanga? Ungetumia nini badala yake ikiwa Nimbus alikuwa na VPC kumi tofauti za huduma ndogo ambazo zote zilihitaji kuwasiliana?

*(Hakuna jibu moja sahihi. Lengo ni kufanya mazoezi ya kubuni mtandao wa VPC nyingi.)*

## Onyesho la Baada ya Mikopo

Priya alitengeneza upya mtandao.

Siku tatu baadaye, kila rasilimali ilikuwa mahali pazuri. Matukio ya EC2 katika subnets za kibinafsi. Pakia visawazisha katika nyati ndogo za umma. RDS na ElastiCache zinapatikana tu kutoka kwa safu ya programu. Vikundi vya usalama vilivyo na milango ya chini zaidi inayohitajika.

Leo alikuwa amejaribu SSH moja kwa moja kwenye hifadhidata ili kuangalia kitu. Hakuweza. Muda wa muunganisho umekwisha.

"Nzuri," alisema Priya.

"Nilihitaji tu kuangalia jambo moja," Leo alisema.

"Nini?"

"Ikiwa faharasa iliwekwa kwa usahihi."

Priya akavuta laptop yake. "Ninaweza kuangalia kutoka kwa mwenyeji wa bastion, kupitia mfano wa maombi, ambayo ina vitambulisho sahihi vya hifadhidata katika Kidhibiti cha Siri."

"Hiyo ni humle nne."

"Hiyo ni sahihi." Aliandika kitu. "Kielelezo kimewekwa. Mnakaribishwa."

Leo alitazama skrini kwa muda.

"Nitajifunza hili," alisema.

"Wewe tayari," alisema. "Ulilalamika tu kuhusu udhibiti wa usalama badala ya kulalamika kuwa haukuwepo."

Katika sura inayofuata: jinsi mtandao hupata Nimbus - mitambo isiyoonekana ya majina ya kikoa.
