# Sura ya 3: Wewe ni Nani, Hasa?

Leo hit kupeleka.

Kituo kilirejesha maneno mawili: Ufikiaji Umekataliwa.

Alijaribu tena. Matokeo sawa. Alikuwa akifanya kazi huko Nimbus kwa wiki tatu, amekuwa
alipewa ufikiaji wa akaunti ya AWS katika siku yake ya kwanza, na alikuwa akituma kwa
mazingira ya jukwaani bila shida yoyote. Lakini hii ilikuwa uzalishaji. Na uzalishaji,
inaonekana, ilikuwa tofauti.

Maya alitazama juu ya bega lake katika ujumbe wa makosa. "Nani alikupa ruhusa hiyo?"

Leo akageuka. "Ruhusa gani?"

"Ruhusa ya kupeleka kwenye uzalishaji. Nani aliiweka?"

Leo alifungua kiweko cha AWS na kuanza kubofya kwenye menyu. Hakuna mtu alikuwa. Kulikuwa na
hakuna sera, hakuna jukumu, hakuna ruzuku ya wazi. Pia hakukuwa na kukana waziwazi - tu
kutokuwepo. Hakuna mtu huko Nimbus aliyewahi kukaa chini na kufikiria ni nani angeweza kufanya nini.

Hilo ndilo lilikuwa tatizo.

**Tatizo la Nywila**

Nenosiri ni mfano mbaya kwa mifumo ya kompyuta.

Sio kwa sababu wao ni dhaifu kila wakati. Kwa sababu wao ni wa binary: ama una nenosiri
au huna. Ikiwa unayo, unaweza kufanya chochote ambacho akaunti inaruhusiwa kufanya.

Hiyo ni sawa kwa mtumiaji mmoja kwenye kompyuta yake ndogo ya kibinafsi. Ni janga kwa a
miundombinu ya wingu ya kampuni.

Fikiria kile Nimbus anahitaji kudhibiti: seva ya wavuti, hifadhidata, uhifadhi wa faili,
mitandao, arifa za malipo, akaunti za watumiaji. Ikiwa kila kitu kinalindwa na nenosiri moja -
au hata seti moja ya vitambulisho - basi mtu yeyote anayepata nenosiri hilo anapata kila kitu.

Na "kila kitu" kwenye AWS inamaanisha uwezo wa kufuta hifadhidata. Zungusha seva zinazoendesha
kuongeza bili ya $50,000. Exfiltrate kila rekodi ya mteja. Kuharibu data chelezo.

Priya hakuelezea hili kwa utulivu, maneno ya kufikirika. Alielezea kama hadithi kuhusu
kampuni ambayo ilikuwa na ukiukaji, ilipata bili ya $80,000 ya AWS ndani ya saa 24 kutoka kwa wachimbaji madini.
cryptocurrency kwenye akaunti yao, na kuzima miezi mitatu baadaye.

Chumba kilikuwa kimya.

"Kwa hivyo ni nini mbadala?" aliuliza Tom.

**Dhana: Utambulisho na Usimamizi wa Ufikiaji**

Njia mbadala ni mfumo ambao hautoi kila mtu ufunguo sawa. Unatoa kila mmoja
mtu - na kila huduma - ufikiaji wanaohitaji. Hakuna zaidi, si chini.

Katika AWS, mfumo huu unaitwa **IAM**: Utambulisho na Usimamizi wa Ufikiaji.

Fikiria IAM kama mfumo wa kadi ya vitufe katika jengo kubwa la ofisi.

Jengo hilo lina sakafu kadhaa. Chumba cha seva kiko kwenye ghorofa ya 12. Ofisi ya fedha
iko kwenye ghorofa ya 8. Suite ya Mkurugenzi Mtendaji iko kwenye ghorofa ya 20. Kila mfanyakazi ana keycard, lakini
kila kadi ya vitufe hufungua tu milango ambayo mfanyakazi anahitaji kufungua kwa kazi yake. The
mwanafunzi hawezi kutelezesha kidole kwenye chumba cha seva. Mhasibu hawezi kufikia mtendaji
sakafu baada ya masaa.

IAM inafanya kazi kwa njia sawa. Unafafanua nani yupo (vitambulisho), wanaruhusiwa kufanya nini
(ruhusa), na utumie ruhusa hizo kupitia sera.

**Misingi ya Ujenzi ya IAM**

IAM ina dhana nne za msingi. Wanajenga juu ya kila mmoja.

**Watumiaji** ni vitambulisho vya mtu binafsi. Maya ana mtumiaji wa IAM. Tom ana mtumiaji wa IAM.
Kila mtumiaji ana kitambulisho chake - na anapaswa kuwa na vibali yeye pekee
hasa haja.

**Vikundi** ni mikusanyiko ya watumiaji. Badala ya kuweka ruhusa kwa Maya, Tom,
Priya na Leo mmoja mmoja, unaunda kikundi cha "Wasanidi Programu" kilicho na ruhusa za wasanidi programu
na kuwaongeza kwake. Wakati mtu wa tano anajiunga, unawaongeza kwenye kikundi na wao
kurithi ruhusa zinazofaa papo hapo.

**Majukumu** ni vitambulisho vya muda ambavyo vinaweza *kuchukuliwa* na kitu fulani - mtu, a
huduma, au akaunti nyingine ya AWS. Tutazingatia majukumu katika Sura ya 14. Kwa sasa: kama
Mtumiaji ni mfanyakazi wa kudumu, Jukumu ni beji ya mgeni. Inatoa ufikiaji maalum
kwa muda au kusudi maalum.

**Sera** ndizo kanuni halisi za ruhusa. Sera ni hati (iliyoandikwa katika JSON
ndani, lakini hauitaji kukariri umbizo) ambayo inasema: "Mmiliki wa hii
sera INARUHUSIWA kutekeleza kitendo X kwenye rasilimali Y." Au "IMEKATAA hatua Z."

Mfano wa tathmini ya IAM ni: kwa chaguo-msingi, kila kitu kinakataliwa. Ruhusa lazima
imetolewa kwa uwazi. Ikiwa sera haisemi unaweza kufanya jambo fulani, huwezi.

**Kanuni ya Upendeleo Mdogo zaidi**

Hili ndilo wazo muhimu zaidi katika usalama wote, sio IAM pekee.

**Wape watu na mifumo tu ufikiaji wanaohitaji kufanya kazi yao. Hakuna zaidi.**

Priya aliita hii "kanuni ya upendeleo mdogo." Inaonekana wazi. Kwa vitendo,
timu nyingi hukiuka mara kwa mara - sio kwa nia mbaya, lakini kwa urahisi.

"Je, tunaweza tu kumpa Leo admin idhini ya kufikia ili aweze kupeleka mambo haraka?"

Hapana.

"Je, tunaweza kutumia tu akaunti ya mizizi kwa kila kitu?"

Sivyo kabisa.

Akaunti ya mizizi ndio ufunguo mkuu wa akaunti yako yote ya AWS. Inaweza kufanya chochote,
ikiwa ni pamoja na kufunga akaunti yenyewe. Unapaswa kuunda mara moja, weka sababu nyingi
uthibitishaji, na kisha usiitumie tena kwa kazi ya kila siku.

Priya aliunda watumiaji tofauti wa IAM kwa kila mtu alasiri hiyo. Alimpa Leo ruhusa
kupeleka kwenye mazingira ya maendeleo. Sio uzalishaji. Sio bili. Sio mitandao.
Kupelekwa tu.

"Hii inahisi kuwa kizuizi," Leo alisema.

“Ndivyo unavyojua ni sawa,” Priya alijibu.

**Nini Hutokea Unapopata Vibaya Hivi**

Matukio matatu, kwa mpangilio wa kuongezeka kwa ukali:

**Hali ya 1**: Mfanyakazi aliye na ufikiaji wa msimamizi anaondoka kwenye kampuni. Hakuna anayezima
akaunti yao. Miezi mitatu baadaye, bado wana ufikiaji. Hii hutokea mara kwa mara.
IAM inasuluhisha: unalemaza mtumiaji. Mara moja, kila mahali.

**Hali ya 2**: Kompyuta ndogo ya msanidi programu imeathirika. Mshambulizi hupata vitambulisho vya AWS
iliyohifadhiwa katika faili ya usanidi na ruhusa kamili za msimamizi. Kwa sababu sifa zina upana
ufikiaji, mshambuliaji anaweza kufanya chochote: kuchimba cryptocurrency, kuiba data, kufuta nakala rudufu.
Kwa upendeleo mdogo: vitambulisho hufanya kazi tu kwa upeo wao mdogo. Radi ya mlipuko iko.

**Hali ya 3**: Programu iliyoandikwa vibaya hufichua kwa bahati mbaya kitambulisho cha AWS katika wake
magogo. Ikiwa vitambulisho hivyo vina ufikiaji mpana, una ukiukaji wa janga. Ikiwa wao
kuwa na ufikiaji mwembamba - kwa ndoo mahususi ya S3 pekee ambayo programu inahitaji - mfiduo
ni mdogo na iko.

Mchoro: ufikiaji unapaswa kupitiwa kwa kiwango cha chini. Daima. Si kwa sababu huna imani
watu wako, lakini kwa sababu huwezi kudhibiti kinachotokea kwa sifa zilizoathiriwa.

**Uthibitishaji wa Mambo Mengi: Kufuli ya Pili**

Dhana moja zaidi kabla ya kufunga sura.

Hata kwa upendeleo mdogo, vitambulisho vinaweza kuibiwa. Nywila zinaweza kukisiwa,
hadaa, au kuvuja. IAM inashughulikia hili kwa **Uthibitishaji wa Vipengele vingi (MFA)**.

MFA inahitaji kitu ambacho *unajua* (nenosiri) pamoja na kitu ambacho *unacho* (simu, a
ufunguo wa vifaa). Hata kama mshambuliaji akiiba nenosiri lako, hawezi kuingia bila
pia kuwa na simu yako.

MFA inapaswa kuwashwa kwa kila mtumiaji wa IAM. Haiwezekani kujadiliwa kwa akaunti ya mizizi.

Priya alitumia mchana kuiandaa kwa kila mtu.

Tom aliuliza ikiwa ni msuguano mwingi. Priya alivuta tena hadithi ya uvunjaji.

Tom alianzisha MFA mara moja.

## Nguvu na Mapungufu

**IAM ndiyo zana inayofaa**: kudhibiti nani na nini kinaweza kufikia kila rasilimali ya AWS; kutekeleza upendeleo mdogo kwa watumiaji, huduma, na mipaka ya akaunti mtambuka; kuzalisha nakala ya ukaguzi wa kila simu ya API kupitia ushirikiano wa CloudTrail; kuondoa hitaji la kushiriki sifa za muda mrefu kati ya mifumo.

**Ambapo IAM inakuwa ngumu**: Sera za IAM zinaweza kukua na kuwa mamia ya kauli katika majukumu mengi, na kutatua hitilafu ya "Ufikiaji Umekataliwa" kunahitaji kuelewa ni ipi kati ya sera hizo ndiyo bora - kazi ambayo ni ngumu kuliko inavyosikika. Kosa la kawaida la IAM si ufikiaji mdogo sana - ni mwingi sana. Sera zinazoruhusu kupita kiasi zilizoundwa ili "kuifanya tu ifanye kazi" kuwa dhima ya usalama ambayo ni chungu kurejesha nyuma baada ya ukweli. Andika ruhusa ya chini kwanza. Panua tu wakati kitu kinashindwa.

## Muhtasari

- **IAM** (Udhibiti wa Utambulisho na Ufikiaji) ni jinsi unavyodhibiti ni nani anayeweza kufanya nini katika AWS.
- Vitalu vya msingi vya ujenzi ni: **Watumiaji** (watu binafsi), **Vikundi** (mkusanyiko wa
  watumiaji), **Majukumu** (vitambulisho vya muda), na **Sera** (sheria za ruhusa).
- Kwa chaguo-msingi, kila kitu katika AWS ni **kikanushwa**. Ruhusa lazima zitolewe kwa uwazi.
- **Kanuni ya Mapendeleo Kidogo** inamaanisha kupeana kila kitambulisho ufikiaji wake pekee
  mahitaji. Hakuna zaidi.
- **Akaunti ya mizizi** inaweza kufanya lolote, kutia ndani mambo mabaya. Funga nyuma
  MFA na uitumie kidogo iwezekanavyo.
- Wezesha **MFA** kwa kila mtumiaji wa IAM. Isiyoweza kujadiliwa.

## Vidokezo vya Mitihani

*SAA-C03 Kikoa cha 1 — Jukumu la 1.1 (linda ufikiaji wa rasilimali za AWS)*

- **Kila kitu kinakataliwa kwa chaguo-msingi.** "Ruhusu" dhahiri inahitajika. Ikiwa sera
  haitaji kitendo, kitendo kinakataliwa.
- **Kanusho Kiwazi hushinda kila mara.** Ikiwa sera yoyote katika msururu itakataa kitendo, hiyo
  kukataa hakuwezi kubatilishwa na Ruhusu mahali pengine popote kwenye mnyororo. Hii inawapata wengi
  wagombea bila ulinzi.
- **Akaunti ya mizizi ≠ Msimamizi wa IAM.** Akaunti ya msingi ni kitambulisho tofauti na IAM.
  Huwezi kufuta akaunti ya mizizi. Unaweza * (na unapaswa) kuzuia inapotumika.
- **IAM ni ya kimataifa**, si ya Kikanda. Watumiaji, vikundi, majukumu na sera za IAM zipo
  katika akaunti nzima ya AWS, sio kwa kila eneo.
- **Majukumu ndiyo njia inayopendelewa ya kutoa ufikiaji wa huduma za AWS.** Ikiwa ni mfano wa EC2
  inahitaji kufikia S3, unaambatisha Jukumu la IAM kwa mfano - hauhifadhi
  sifa kwenye mashine. Mtindo huu unaonekana mara kwa mara kwenye mtihani.

##Mazoezi

**Zoezi la 1 - Kumbuka **

Kwa maneno yako mwenyewe: kuna tofauti gani kati ya Mtumiaji wa IAM, Kikundi, na Jukumu?
Ungetumia kila moja lini?

*(Kidokezo: Fikiria juu ya mlinganisho wa kujenga kadi - ipi ni kadi ya kudumu,
ni kikundi gani cha idara, na ni beji gani ya mgeni?)*

**Zoezi la 2 - Mazoezi ya Mtihani**

*Hali*: Kampuni inaendesha programu ya wavuti kwenye matukio ya EC2 ambayo yanahitaji kusoma faili
kutoka kwa ndoo ya S3. Msanidi programu mdogo anapendekeza kuhifadhi vitufe vya ufikiaji vya AWS moja kwa moja ndani
msimbo wa maombi kwenye matukio ya EC2. Timu ya usalama inapinga.

Je, ni suluhu gani iliyo salama zaidi na inayofaa kiutendaji?

A) Hifadhi funguo za ufikiaji katika anuwai za mazingira kwenye mfano wa EC2 badala ya
   kanuni  
B) Unda mtumiaji aliyejitolea wa IAM na ruhusa za kusoma za S3 na ushiriki kitambulisho
   na timu ya maendeleo  
C) Ambatisha Jukumu la IAM na ruhusa zinazofaa za kusoma za S3 moja kwa moja kwenye EC2
   matukio  
D) Tumia kitambulisho cha akaunti ya msingi ili kuipa programu ufikiaji kamili kwa AWS zote
   rasilimali

**Kidokezo cha 1**: Tatizo la kuhifadhi vitambulisho mahali popote kwenye mfano ni kwamba
vitambulisho vinaweza kuvuja. Kuna njia ya kutoa ufikiaji wa mfano wa EC2 bila
kutumia vitambulisho kabisa?

**Kidokezo cha 2**: AWS ina utaratibu ambapo huduma zinaweza kupewa ruhusa bila
wanaohitaji vitambulisho tuli. Utaratibu huo unaitwaje?

**Kidokezo cha 3**: Majukumu ya IAM yanaweza kuambatishwa kwa matukio ya EC2. Wakati wao ni, mfano
hupokea kiotomatiki kitambulisho cha muda ambacho huzungushwa na AWS. Hakuna tuli
sifa zinazohitajika.

**Jibu**: C

**Maelezo**: Kuambatanisha Jukumu la IAM kwa mfano wa EC2 ndio mchoro sahihi.
Mfano huo hupata kitambulisho cha muda kiotomatiki kupitia EC2
huduma ya metadata. Hakuna kitambulisho cha muda mrefu cha kuvuja, kuzunguka, au kwa bahati mbaya
kujitolea kwa hazina.

**Kwa nini isiwe A?** Vigezo vya mazingira kwenye tukio la EC2 bado vinaweza kuvuja -
kupitia kumbukumbu za programu, miisho ya utatuzi, au ikiwa mfano umeathiriwa.
Kitambulisho tuli ndio shida, sio eneo lao.

**Kwa nini isiwe B?** Kuunda mtumiaji wa IAM aliyeshirikiwa na kusambaza vitambulisho kwa timu
inakiuka haki ndogo na kufanya mzunguko wa kitambulisho kuwa ndoto mbaya. Ikiwa mtu mmoja
kuondoka, huwezi kubatilisha ufikiaji wao kwa urahisi bila kubadilisha kitambulisho kilichoshirikiwa.

**Kwa nini isiwe D?** Kutumia vitambulisho vya akaunti ya mizizi kwa programu yoyote ni usalama mkali
ukiukaji. Akaunti ya mizizi ina ufikiaji usio na kikomo na sifa zake hazipaswi kamwe
acha udhibiti wa mwenye akaunti.

*SAA-C03 Kikoa 1 — Jukumu la 1.1 (majukumu ya IAM, fursa ndogo zaidi)*

**Zoezi la 3 — Changamoto ya Usanifu** *(Si lazima)*

Nimbus inawatumia wasanidi programu watatu wapya mwezi ujao. Kila mmoja atahitaji viwango tofauti
ya ufikiaji: moja inafanya kazi kwenye safu ya hifadhidata, moja kwenye seva za programu, moja kwenye
faili za tuli za mwisho. Pia kuna bomba la CI/CD ambalo linahitaji kupeleka msimbo.

Tengeneza muundo wa IAM kwa hali hii. Ni watumiaji gani, vikundi, majukumu na sera gani
ungeunda? Je, ni mipaka gani muhimu zaidi ya upendeleo wa kutekeleza?

*(Hakuna jibu moja sahihi. Fikiria kuhusu kupunguza radius ya mlipuko ikiwa ipo
utambulisho umetatizika.)*

## Onyesho la Baada ya Mikopo

Mwisho wa siku, kila mtumiaji wa IAM alikuwa amewasha MFA. Akaunti ya Leo ilikuwa imepunguzwa
kwa ufikiaji wa kiwango cha msanidi: peleka kwa mazingira ya dev, soma kutoka kwa usanidi ulioshirikiwa
ndoo, hakuna kingine.

Alijaribu, mara moja, kufikia hifadhidata ya uzalishaji.

Ufikiaji umekataliwa.

"Hivi ndivyo unavyohisi kuaminiwa lakini sio sana?" Aliuliza.

"Hivyo ndivyo inavyohisi," Priya alisema.

Asubuhi iliyofuata, Tom alifika mapema na kupata kitu ambacho kilimfanya apige simu mara moja
timu ndani.

Kwenye koni ya AWS, aliweza kuona kwamba tovuti yao ilikuwa ikipata trafiki. Zaidi ya
walitarajia. Na seva ya wavuti - ile ya asili ya Leo - ilikuwa moto. Moto kweli.

"Tuna watumiaji mia moja wanaotumia wakati mmoja," Tom alisema. "Na seva moja."

Katika sura inayofuata: seva ya kwanza - kukodisha kompyuta katika kituo cha data cha mtu mwingine.
