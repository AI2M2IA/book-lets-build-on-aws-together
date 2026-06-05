# باب 3: آپ آخر ہیں کون؟

Leo نے deploy دبایا۔

ٹرمینل نے دو الفاظ واپس کیے: Access Denied۔

اس نے دوبارہ کوشش کی۔ وہی نتیجہ۔ وہ Nimbus میں تین ہفتوں سے کام کر رہا تھا، پہلے دن ہی اسے AWS اکاؤنٹ تک رسائی دے دی گئی تھی، اور وہ staging ماحول میں بغیر کسی مسئلے کے deploy کر رہا تھا۔ لیکن یہ production تھا۔ اور production، بظاہر، مختلف تھا۔

Maya نے اس کے کندھے کے اوپر سے error message دیکھا۔ "تمہیں یہ permission کس نے دی؟"

Leo مڑا۔ "کون سی permission؟"

"Production میں deploy کرنے کی permission۔ یہ کس نے set up کی؟"

Leo نے AWS console کھولا اور menus میں click کرنا شروع کیا۔ کسی نے نہیں کی تھی۔ کوئی policy نہیں تھی، کوئی role نہیں تھا، کوئی explicit grant نہیں تھی۔ کوئی explicit denial بھی نہیں تھی — صرف غیر موجودگی تھی۔ Nimbus میں کسی نے کبھی بیٹھ کر یہ نہیں سوچا تھا کہ کون کیا کر سکتا ہے۔

یہی مسئلہ تھا۔

**Passwords کا مسئلہ**

Passwords computer systems کے لیے ایک برا model ہیں۔

اس لیے نہیں کہ وہ ہمیشہ کمزور ہوتے ہیں۔ اس لیے کہ وہ binary ہوتے ہیں: یا تو آپ کے پاس password ہے یا نہیں ہے۔ اگر آپ کے پاس ہے، تو آپ وہ سب کچھ کر سکتے ہیں جو account کو کرنے کی اجازت ہے۔

یہ کسی ایک user کے personal laptop کے لیے ٹھیک ہے۔ کمپنی کے cloud infrastructure کے لیے یہ تباہ کن ہے۔

سوچیں Nimbus کو کیا manage کرنا ہے: web server، database، file storage، networking، billing alerts، user accounts۔ اگر ہر چیز ایک password سے محفوظ ہو — یا credentials کے ایک ہی set سے — تو جسے وہ password مل گیا، اسے سب کچھ مل گیا۔

اور AWS پر "سب کچھ" کا مطلب ہے databases delete کرنے کی صلاحیت۔ ایسے servers spin up کرنا جو $50,000 کا bill بنا دیں۔ ہر customer record exfiltrate کرنا۔ Backup data تباہ کرنا۔

Priya نے اسے calm، abstract terms میں بیان نہیں کیا۔ اس نے اسے ایک startup کی کہانی کے طور پر بیان کیا جس میں breach ہوا، attackers نے account پر cryptocurrency mine کی، 24 گھنٹوں میں $80,000 کا AWS bill آیا، اور تین ماہ بعد کمپنی بند ہو گئی۔

کمرہ خاموش ہو گیا۔

"تو alternative کیا ہے؟" Tom نے پوچھا۔

**Concept: Identity and Access Management**

Alternative ایک ایسا system ہے جہاں آپ سب کو ایک ہی key نہیں دیتے۔ آپ ہر شخص — اور ہر service — کو بالکل وہ access دیتے ہیں جس کی اسے ضرورت ہے۔ نہ زیادہ، نہ کم۔

AWS میں اس system کو **IAM** کہتے ہیں: Identity and Access Management۔

IAM کو ایک بڑی office building کے keycard system کی طرح سوچیں۔

Building میں درجنوں floors ہیں۔ Server room floor 12 پر ہے۔ Finance office floor 8 پر ہے۔ CEO کا suite floor 20 پر ہے۔ ہر employee کے پاس keycard ہے، لیکن ہر keycard صرف وہ doors کھولتا ہے جنہیں اس employee کو اپنے کام کے لیے کھولنے کی ضرورت ہے۔ Intern server room میں swipe نہیں کر سکتا۔ Accountant office hours کے بعد executive floor تک access نہیں کر سکتا۔

IAM بھی یہی کرتا ہے۔ آپ define کرتے ہیں کہ کون موجود ہے (identities)، انہیں کیا کرنے کی اجازت ہے (permissions)، اور ان permissions کو policies کے ذریعے apply کرتے ہیں۔

**IAM کے building blocks**

IAM کے چار core concepts ہیں۔ یہ ایک دوسرے پر build ہوتے ہیں۔

**Users** individual identities ہیں۔ Maya کا IAM user ہے۔ Tom کا IAM user ہے۔ ہر user کے اپنے credentials ہوتے ہیں — اور اسے صرف وہ permissions ہونی چاہئیں جن کی اسے خاص طور پر ضرورت ہے۔

**Groups** users کے collections ہیں۔ Maya، Tom، Priya، اور Leo کے لیے permissions الگ الگ set کرنے کے بجائے، آپ developer permissions کے ساتھ ایک "Developers" group بناتے ہیں اور انہیں اس میں شامل کرتے ہیں۔ جب پانچواں شخص join کرتا ہے، آپ اسے group میں add کرتے ہیں اور وہ فوراً صحیح permissions inherit کر لیتا ہے۔

**Roles** temporary identities ہیں جنہیں کوئی چیز *assume* کر سکتی ہے — ایک شخص، ایک service، یا کوئی دوسرا AWS account۔ ہم Chapter 14 میں roles پر گہرائی سے جائیں گے۔ ابھی کے لیے: اگر User permanent employee ہے، تو Role visitor badge ہے۔ یہ مخصوص وقت یا مقصد کے لیے مخصوص access دیتا ہے۔

**Policies** اصل permission rules ہیں۔ Policy ایک document ہے (اندرونی طور پر JSON میں لکھی جاتی ہے، لیکن آپ کو format memorize کرنے کی ضرورت نہیں) جو کہتا ہے: "اس policy کے holder کو resource Y پر action X perform کرنے کی ALLOW ہے۔" یا "action Z DENIED ہے۔"

IAM evaluation model یہ ہے: default طور پر، ہر چیز denied ہے۔ Permissions کو explicitly grant کرنا پڑتا ہے۔ اگر policy یہ نہیں کہتی کہ آپ کچھ کر سکتے ہیں، تو آپ نہیں کر سکتے۔

**Principle of Least Privilege**

یہ security کا سب سے اہم concept ہے، صرف IAM کا نہیں۔

**لوگوں اور systems کو صرف وہ access دیں جس کی انہیں اپنا کام کرنے کے لیے ضرورت ہے۔ اس سے زیادہ کچھ نہیں۔**

Priya نے اسے "principle of least privilege" کہا۔ یہ obvious لگتا ہے۔ عمل میں، زیادہ تر teams اسے مسلسل violate کرتی ہیں — بد نیتی سے نہیں، بلکہ convenience کی وجہ سے۔

"کیا ہم Leo کو admin access دے دیں تاکہ وہ چیزیں تیزی سے deploy کر سکے؟"

نہیں۔

"کیا ہم root account ہی ہر چیز کے لیے use کر لیں؟"

بالکل نہیں۔

Root account آپ کے پورے AWS account کی master key ہے۔ یہ کچھ بھی کر سکتا ہے، account کو بند کرنے تک۔ آپ اسے ایک بار create کریں، multi-factor authentication set up کریں، اور پھر day-to-day کام کے لیے اسے کبھی استعمال نہ کریں۔

Priya نے اسی دوپہر سب کے لیے الگ IAM users بنائے۔ اس نے Leo کو development environment میں deploy کرنے کی permissions دیں۔ Production نہیں۔ Billing نہیں۔ Networking نہیں۔ صرف deployment۔

"یہ restrictive محسوس ہو رہا ہے،" Leo نے کہا۔

"اسی سے پتا چلتا ہے کہ یہ صحیح ہے،" Priya نے جواب دیا۔

**جب آپ یہ غلط کرتے ہیں تو کیا ہوتا ہے**

تین scenarios، بڑھتی ہوئی severity کے حساب سے:

**Scenario 1**: Admin access والا employee کمپنی چھوڑ دیتا ہے۔ کوئی اس کا account deactivate نہیں کرتا۔ تین ماہ بعد بھی اسے access حاصل ہے۔ یہ مسلسل ہوتا ہے۔ IAM اسے حل کرتا ہے: آپ user disable کرتے ہیں۔ فوراً، ہر جگہ۔

**Scenario 2**: Developer کا laptop compromise ہو جاتا ہے۔ Attacker کو config file میں stored AWS credentials ملتے ہیں جن کے پاس full admin permissions ہیں۔ چونکہ credentials کے پاس broad access ہے، attacker کچھ بھی کر سکتا ہے: cryptocurrency mine کرنا، data چرانا، backups delete کرنا۔ Least privilege کے ساتھ: credentials صرف اپنے limited scope میں کام کرتے ہیں۔ Blast radius contained رہتا ہے۔

**Scenario 3**: ایک poorly written application accidentally AWS credentials اپنے logs میں expose کر دیتی ہے۔ اگر ان credentials کے پاس broad access ہے، تو آپ کے پاس catastrophic breach ہے۔ اگر ان کے پاس narrow access ہے — صرف اس specific S3 bucket تک جس کی application کو ضرورت ہے — تو exposure limited اور contained رہتا ہے۔

Pattern یہ ہے: access کو minimum تک scoped ہونا چاہیے۔ ہمیشہ۔ اس لیے نہیں کہ آپ اپنے لوگوں پر trust نہیں کرتے، بلکہ اس لیے کہ آپ compromised credentials کے ساتھ ہونے والی چیزوں کو control نہیں کر سکتے۔

**Multi-Factor Authentication: دوسرا lock**

Chapter ختم کرنے سے پہلے ایک اور concept۔

Least privilege کے باوجود، credentials چوری ہو سکتے ہیں۔ Passwords guess، phish، یا leak ہو سکتے ہیں۔ IAM اسے **Multi-Factor Authentication (MFA)** سے address کرتا ہے۔

MFA ایسی چیز مانگتا ہے جو آپ *جانتے* ہیں (password) plus ایسی چیز جو آپ کے پاس *ہے* (phone، hardware key)۔ اگر attacker آپ کا password چوری بھی کر لے، وہ آپ کے phone کے بغیر log in نہیں کر سکتا۔

MFA ہر IAM user کے لیے enable ہونا چاہیے۔ Root account کے لیے یہ non-negotiable ہے۔

Priya نے دوپہر سب کے لیے اسے set up کرنے میں گزاری۔

Tom نے پوچھا کہ کیا یہ بہت زیادہ friction ہے۔ Priya نے breach والی کہانی دوبارہ کھول دی۔

Tom نے فوراً MFA set up کر لیا۔

## Strengths and Limitations

**IAM صحیح tool ہے**: یہ control کرنے کے لیے کہ کون اور کیا ہر AWS resource تک access کر سکتا ہے؛ users، services، اور cross-account boundaries میں least privilege implement کرنے کے لیے؛ CloudTrail integration کے ذریعے ہر API call کا audit trail generate کرنے کے لیے؛ systems کے درمیان long-lived credentials share کرنے کی ضرورت ختم کرنے کے لیے۔

**جہاں IAM مشکل ہو جاتا ہے**: IAM policies درجنوں roles میں سینکڑوں statements تک بڑھ سکتی ہیں، اور "Access Denied" error debug کرنے کے لیے یہ سمجھنا پڑتا ہے کہ ان policies میں effective کون سی ہے — ایک ایسا کام جو سننے سے زیادہ مشکل ہے۔ سب سے common IAM mistake بہت کم access نہیں — بہت زیادہ access ہے۔ "بس اسے چلانے" کے لیے بنائی گئی over-permissive policies security liabilities بن جاتی ہیں جنہیں بعد میں rollback کرنا تکلیف دہ ہوتا ہے۔ پہلے minimum permission لکھیں۔ صرف اس وقت expand کریں جب کچھ fail ہو۔

## Summary

- **IAM** (Identity and Access Management) وہ طریقہ ہے جس سے آپ control کرتے ہیں کہ AWS میں کون کیا کر سکتا ہے۔
- Core building blocks ہیں: **Users** (افراد)، **Groups** (users کے collections)، **Roles** (temporary identities)، اور **Policies** (permission rules)۔
- Default طور پر، AWS میں ہر چیز **denied** ہے۔ Permissions کو explicitly grant کرنا پڑتا ہے۔
- **Principle of Least Privilege** کا مطلب ہے ہر identity کو صرف وہ access دینا جس کی اسے ضرورت ہے۔ اس سے زیادہ نہیں۔
- **Root account** کچھ بھی کر سکتا ہے، تباہ کن چیزیں بھی۔ اسے MFA کے پیچھے lock کریں اور جتنا کم ممکن ہو استعمال کریں۔
- ہر IAM user کے لیے **MFA** enable کریں۔ یہ non-negotiable ہے۔

## Exam Tips

*SAA-C03 Domain 1 — Task 1.1 (AWS resources تک secure access)*

- **Default طور پر ہر چیز denied ہے۔** Explicit "Allow" required ہے۔ اگر policy کسی action کا ذکر نہیں کرتی، تو action denied ہے۔
- **Explicit Deny ہمیشہ جیتتا ہے۔** اگر chain میں کوئی بھی policy کسی action کو deny کرتی ہے، تو اس deny کو chain میں کہیں بھی موجود Allow override نہیں کر سکتا۔ یہ بہت سے candidates کو surprise کرتا ہے۔
- **Root account ≠ IAM admin۔** Root account IAM سے الگ credential ہے۔ آپ root account delete نہیں کر سکتے۔ آپ اس کے استعمال کو restrict کر سکتے ہیں (اور کرنا چاہیے)۔
- **IAM global ہے**، Regional نہیں۔ IAM users، groups، roles، اور policies پورے AWS account میں exist کرتے ہیں، per-Region نہیں۔
- **Roles AWS services کو access دینے کا preferred طریقہ ہیں۔** اگر EC2 instance کو S3 access چاہیے، تو آپ instance سے IAM Role attach کرتے ہیں — آپ machine پر credentials store نہیں کرتے۔ یہ pattern exam میں مسلسل آتا ہے۔

## Exercises

**Exercise 1 — Recall**

اپنے الفاظ میں: IAM User، Group، اور Role میں کیا فرق ہے؟ آپ ہر ایک کو کب استعمال کریں گے؟

*(Hint: keycard building analogy کے بارے میں سوچیں — کون permanent card ہے، کون department grouping ہے، اور کون visitor badge ہے؟)*

**Exercise 2 — Exam Practice**

*Scenario*: ایک company EC2 instances پر web application چلاتی ہے جنہیں S3 bucket سے files read کرنی ہیں۔ ایک junior developer تجویز دیتا ہے کہ AWS access keys کو EC2 instances پر application code کے اندر directly store کر دیا جائے۔ Security team اعتراض کرتی ہے۔

سب سے secure اور operationally appropriate solution کیا ہے؟

A) Access keys کو code کے بجائے EC2 instance پر environment variables میں store کریں  
B) S3 read permissions کے ساتھ dedicated IAM user بنائیں اور credentials development team کے ساتھ share کریں  
C) مناسب S3 read permissions والا IAM Role directly EC2 instances سے attach کریں  
D) Application کو تمام AWS resources تک full access دینے کے لیے root account credentials استعمال کریں

**Hint 1**: Instance پر کہیں بھی credentials store کرنے کا مسئلہ یہ ہے کہ credentials leak ہو سکتے ہیں۔ کیا EC2 instance کو credentials استعمال کیے بغیر access دینے کا کوئی طریقہ ہے؟

**Hint 2**: AWS کے پاس ایک mechanism ہے جہاں services کو static credentials کی ضرورت کے بغیر permissions دی جا سکتی ہیں۔ اس mechanism کو کیا کہتے ہیں؟

**Hint 3**: IAM Roles EC2 instances سے attach کیے جا سکتے ہیں۔ جب ایسا ہوتا ہے، instance خود بخود temporary credentials receive کرتا ہے جنہیں AWS rotate کرتا ہے۔ Static credentials کی ضرورت نہیں۔

**Answer**: C

**Explanation**: EC2 instance سے IAM Role attach کرنا correct pattern ہے۔ Instance کو EC2 metadata service کے ذریعے temporary، rotating credentials خود بخود ملتے ہیں۔ Leak، rotate، یا accidentally repository میں commit کرنے کے لیے long-lived credentials موجود ہی نہیں ہوتے۔

**Why not A?** EC2 instance پر environment variables پھر بھی leak ہو سکتے ہیں — application logs، debugging endpoints، یا instance compromise ہونے کے ذریعے۔ Static credentials مسئلہ ہیں، ان کی location نہیں۔

**Why not B?** Shared IAM user بنانا اور credentials team میں distribute کرنا least privilege violate کرتا ہے اور credential rotation کو nightmare بنا دیتا ہے۔ اگر ایک شخص چلا جائے، تو shared credentials بدلے بغیر صرف اس کا access آسانی سے revoke نہیں کیا جا سکتا۔

**Why not D?** کسی بھی application کے لیے root account credentials استعمال کرنا شدید security violation ہے۔ Root account کے پاس unlimited access ہوتا ہے اور اس کے credentials کبھی account owner کے control سے باہر نہیں جانے چاہئیں۔

*SAA-C03 Domain 1 — Task 1.1 (IAM roles, least privilege)*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus اگلے ماہ تین نئے developers onboard کر رہا ہے۔ ہر ایک کو access کی مختلف levels کی ضرورت ہوگی: ایک database layer پر کام کرتا ہے، ایک application servers پر، ایک front-end static files پر۔ ایک CI/CD pipeline بھی ہے جسے code deploy کرنا ہے۔

اس scenario کے لیے IAM structure design کریں۔ آپ کون سے users، groups، roles، اور policies بنائیں گے؟ Enforce کرنے کے لیے سب سے اہم least-privilege boundary کیا ہوگی؟

*(کوئی ایک correct answer نہیں ہے۔ سوچیں کہ اگر کوئی ایک identity compromise ہو جائے تو blast radius کیسے minimize ہو گا۔)*

## Post-Credits Scene

دن کے آخر تک، ہر IAM user کے لیے MFA enabled تھا۔ Leo کے account کو developer-level access تک reduce کر دیا گیا تھا: dev environment میں deploy کرنا، shared config bucket سے read کرنا، اور کچھ نہیں۔

اس نے ایک بار production database access کرنے کی کوشش کی تھی۔

Access denied۔

"کیا trust کیے جانے، مگر بہت زیادہ نہیں، کا احساس یہی ہوتا ہے؟" اس نے پوچھا۔

"بالکل یہی،" Priya نے کہا۔

اگلی صبح، Tom جلدی آیا اور اسے کچھ ایسا ملا جس نے اسے فوراً team کو call کرنے پر مجبور کیا۔

AWS console پر، وہ دیکھ سکتا تھا کہ ان کی website کو traffic مل رہا ہے۔ ان کی توقع سے زیادہ۔ اور web server — Leo کا original one — گرم چل رہا تھا۔ واقعی گرم۔

"ہمارے پاس hundred concurrent users ہیں،" Tom نے کہا۔ "اور ایک server۔"

اگلے chapter میں: پہلا server — کسی اور کے data center میں computer rent کرنا۔
