# باب ۱۷: نگہبان

Romanian IP کے ساتھ واقعہ محدود ہو گیا تھا۔ Secrets Secrets Manager میں تھے۔ Credentials rotate ہو چکی تھیں۔ نیٹ ورک controls مضبوط ہو گئے تھے۔

لیکن Priya نے وہ سوال پوچھا تھا جس نے باب ۱۶ ختم کیا: "اگر CloudTrail میں کوئی غیر معمولی چیز ظاہر ہو، تو ہمیں کیسے پتہ چلے گا؟"

ایمانداری سے جواب: شاید نہیں۔

CloudTrail فی دن ہزاروں events log کرتا ہے۔ کوئی انسان سب نہیں پڑھتا۔ Priya ہر ہفتے ہاتھ سے چیک کرتی تھی، لیکن اس کا مطلب تھا کہ کچھ منگل کو ہو سکتا تھا اور اگلے پیر تک محسوس نہیں ہوتا۔

"ہمیں کوئی ایسی چیز چاہیے جو ہماری جانب سے logs دیکھے،" اس نے کہا۔

Maya نے نگاہ اٹھائی۔ "خودبخود؟"

"خودبخود۔"

Tom کا دوسرا سوال: "اس کی کتنی لاگت ہے؟"

**تین خطرے کی Categories**

Cloud ایپلیکیشن کے خلاف security خطرات عام طور پر تین categories میں آتے ہیں:

**Volume attacks (DDoS)**: ایک attacker اتنی زیادہ ٹریفک بھیجتا ہے کہ آپ کی ایپلیکیشن legitimate صارفین کو جواب نہیں دے سکتی۔ حملہ لاکھوں HTTP requests، یا TCP SYN packets کا سیلاب ہو سکتا ہے جو آپ کے سرور کی connection table ختم کرنے کے لیے ڈیزائن کیا گیا ہو۔

**Application attacks (Exploits)**: ایک attacker خاص طور پر تیار کردہ requests بھیجتا ہے جو آپ کی ایپلیکیشن کی کمزوریوں کا فائدہ اٹھانے کے لیے ڈیزائن کی گئی ہوں — SQL injection، cross-site scripting، malformed input جو کوئی parser crash کر دے۔

**Behavioral anomalies (Reconnaissance اور compromise)**: API calls جو نہیں ہونی چاہئیں (کوئی رات 3 بجے آپ کے پورے user database کو query کر رہا ہے)، غیر معمول IAM activity (ایک نئے ملک سے استعمال کی جانے والی credentials)، یا unexpected destinations کی طرف نیٹ ورک ٹریفک۔

AWS کے پاس ہر ایک کے لیے ایک dedicated سروس ہے:

- **AWS Shield**: DDoS protection
- **AWS WAF**: Application-layer protection
- **Amazon GuardDuty**: Behavioral threat detection

**AWS Shield: DDoS Absorber**

**AWS Shield Standard** تمام AWS customers کے لیے بغیر کسی اضافی چارج کے خودبخود فعال ہے۔ یہ سب سے عام layer 3 (network) اور layer 4 (transport) DDoS attacks سے بچاتا ہے — SYN floods، UDP floods، DNS amplification attacks۔

CloudFront، Route 53، اور Elastic Load Balancing AWS کے نیٹ ورک کے edge پر بیٹھتے ہیں۔ جب ایک DDoS attack آپ کی ایپلیکیشن کو target کرتا ہے، یہ پہلے ان managed سروسز کو متاثر کرتا ہے۔ AWS کا نیٹ ورک infrastructure حملے کو absorb کرتا ہے اس سے پہلے کہ یہ آپ کی EC2 انسٹینسز تک پہنچے۔

**AWS Shield Advanced** premium tier ہے ($3,000/month فی organization)۔ یہ شامل کرتا ہے:

- EC2، ELB، CloudFront، Global Accelerator، اور Route 53 کے لیے Protection
- Near-real-time attack notifications
- AWS Shield Response Team (SRT) تک رسائی — security engineers جو آپ کو attacks کا جواب دینے میں مدد کر سکتے ہیں
- Cost protection: اگر کوئی attack آپ کا بل spike کرے، AWS surge costs credit کرتا ہے
- Layer 7 (application layer) پر Enhanced DDoS detection اور mitigation

"تین ہزار dollars ماہانہ؟" Tom نے کہا۔

"Enterprises جو لاکھوں میں revenue سنبھالتی ہیں، دو گھنٹے کا DDoS جو انہیں بند کر دے تین ہزار dollars سے زیادہ لاگت آتا ہے،" Priya نے کہا۔

Tom نے خاموشی سے حساب لگایا۔

"ہم Standard سے شروع کریں گے،" اس نے آخرکار کہا۔

**AWS WAF: Application Filter**

**AWS WAF (Web Application Firewall)** HTTP سطح پر کام کرتا ہے — یہ آپ کی ایپلیکیشن تک پہنچنے سے پہلے web requests کے مواد کا معائنہ کرتا ہے۔

WAF **Web ACLs (Access Control Lists)** کے ساتھ ترتیب دیا جاتا ہے — rule sets جو define کرتے ہیں کیا allow، block، یا count کرنا ہے۔

WAF کو منسلک کیا جا سکتا ہے:

- CloudFront distributions (edge پر requests کا معائنہ کریں، عالمی سطح پر)
- Application Load Balancers (regional سطح پر requests کا معائنہ کریں)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS اور third-party vendors نے pre-built rule sets شائع کیے ہیں:

- **AWS Managed Rules - Core Rule Set**: OWASP Top 10 vulnerabilities کے خلاف بچاتا ہے (SQL injection، XSS، command injection، path traversal، وغیرہ)
- **AWS Managed Rules - Known Bad Inputs**: معلوم attack patterns سے matching requests block کرتا ہے
- **AWS Managed Rules - Amazon IP Reputation List**: IPs block کرتا ہے جو botnets اور scanners سے منسلک معلوم ہیں
- **AWS Managed Rules - Bot Control**: Bot traffic کی شناخت اور management کرتا ہے

آپ custom rules بھی بنا سکتے ہیں:

- "کوئی بھی request جس میں User-Agent header میں 'sqlmap' ہو block کریں" (ایک عام SQL injection scanner)
- "Rate limit: فی IP فی 5 منٹ 1000 سے زیادہ requests allow نہ کریں"
- "کسی بھی parameter value میں `<script>` پر مشتمل requests block کریں"

Nimbus کے لیے، عملی سیٹ اپ: CloudFront distribution پر Core Rule Set فعال WAF۔ یہ EC2 انسٹینسز تک پہنچنے سے پہلے سب سے عام attack patterns block کرتا ہے۔

**Amazon GuardDuty: Behavioral Analyst**

GuardDuty بنیادی طور پر Shield اور WAF سے مختلف ہے۔ یہ attacks block نہیں کرتا — یہ **غیر معمول رویے کا پتہ لگاتا ہے**۔

GuardDuty مسلسل analyze کرتا ہے:

- **AWS CloudTrail logs**: IAM تبدیلیاں، API calls، console logins
- **VPC Flow Logs**: آپ کے VPC کے اندر نیٹ ورک ٹریفک patterns
- **DNS query logs**: آپ کی انسٹینسز کیا resolve کر رہی ہیں (معلوم malware اکثر مخصوص C2 domains resolve کرتا ہے)

Machine learning models ان patterns کی شناخت کرتے ہیں جو آپ کے baseline سے مختلف ہوں۔ GuardDuty **findings** generate کرتا ہے — categorized alerts — جب یہ anomalies محسوس کرے۔

GuardDuty کیا detect کر سکتا ہے:

- ایک IAM user ایک unrecognized IP پتے سے login کر رہا ہے (ایک ایسے ملک سے جو انہوں نے پہلے کبھی استعمال نہیں کیا)
- ایک Tor exit node سے API calls
- ایک EC2 انسٹینس ایک معلوم cryptocurrency mining pool سے بات کر رہی ہے
- غیر معمول اعلیٰ API call volume (credential abuse یا scanning)
- ایک S3 bucket ایک IP پتے سے access کی جا رہی ہے جسے malicious activity کے لیے flagged کیا گیا ہو
- ایک ڈومین سے outbound ٹریفک جو malware command-and-control سے منسلک معلوم ہو

"یہ وہی ہوتا جس نے Romanian IP پکڑا ہوتا،" Leo نے آہستہ آہستہ کہا۔

"اگر ہمارے پاس GuardDuty فعال ہوتی، تو یہ EC2 انسٹینس کو رات 2 بجے ایک unrecognized بیرونی IP سے outbound connections بناتے ہوئے flag کر دیتا،" Priya نے تصدیق کی۔

"اس کی کتنی لاگت ہے؟"

GuardDuty pricing analyzed logs کے volume پر based ہے — CloudTrail events، VPC flow data، DNS queries۔ ایک چھوٹی سے درمیانی ایپلیکیشن کے لیے، عام طور پر $50-150/month۔ پیمانے پر، یہ پھر بھی infrastructure کی لاگت کا ایک چھوٹا حصہ ہے۔

Tom نے console کھولا اور اسے فعال کیا۔

**تینوں سروسز کو جوڑنا**

Shield، WAF، اور GuardDuty مختلف layers پر کام کرتی ہیں اور ایک دوسرے کو complement کرتی ہیں:

| سروس      | Layer                     | کس سے بچاتی ہے                             | عمل                            |
|------------|---------------------------|---------------------------------------------|--------------------------------|
| AWS Shield | Network/Transport (L3/L4) | DDoS floods                                 | Attacks absorb/mitigate کرتا ہے |
| AWS WAF    | Application (L7)          | OWASP Top 10، bots، scrapers                | Requests allow، block، یا count کرتا ہے |
| GuardDuty  | Behavioral (تمام logs)    | Anomalies، compromised credentials، malware | Detect اور alert کرتا ہے       |

Shield سیلاب روکتا ہے۔ WAF پانی کو filter کرتا ہے۔ GuardDuty نیٹ ورک کے غیر معمول flow patterns کے لیے plumbing کو دیکھتا ہے۔

**CloudTrail: بنیاد**

تینوں سروسز logs پر rely کرتی ہیں۔ **AWS CloudTrail** وہ logging سروس ہے جو آپ کے AWS account میں ہر API call capture کرتی ہے — کس نے کیا call کیا، کب، کہاں سے، کیا result کے ساتھ۔

CloudTrail console میں 90-day history کے لیے ڈیفالٹ کے مطابق فعال ہے۔ Long-term logs retain کرنے کے لیے:

1. ایک trail بنائیں جو S3 bucket میں لکھے
2. اختیاری طور پر، real-time alerting کے لیے CloudWatch Logs کو بھیجیں
3. Log file validation فعال کریں (یہ detect کرنے کے لیے کہ logs سے چھیڑ چھاڑ کی گئی ہو)

GuardDuty، AWS Config، اور Security Hub سب CloudTrail سے پڑھتے ہیں۔ CloudTrail logs کے بغیر، ان سروسز کے پاس analyze کرنے کے لیے کچھ نہیں۔

**AWS Security Hub: Dashboard**

اگر آپ متعدد AWS accounts چلا رہے ہیں یا security findings کا consolidated view چاہتے ہیں، **AWS Security Hub** GuardDuty، Inspector (vulnerability assessment)، Macie (data privacy)، Config، اور Firewall Manager سے findings کو ایک واحد dashboard میں aggregate کرتا ہے۔

یہ AWS Foundational Security Best Practices standard اور CIS AWS Foundations Benchmark کے خلاف آپ کی configuration بھی چیک کرتا ہے۔

Nimbus کے لیے: Security Hub ابھی ضروری نہیں تھا۔ جب وہ تین accounts (dev، staging، production) تک بڑھتے، یہ مفید ہو جاتا۔

## خوبیاں اور حدود

**AWS Shield**:

- Standard: مفت اور خودکار — استعمال نہ کرنے کی کوئی وجہ نہیں
- Advanced: اعلیٰ profile targets کے لیے بہترین؛ چھوٹی ٹیموں کے لیے مہنگا

**AWS WAF**:

- Managed rule groups سیٹ اپ کو نمایاں طور پر آسان بناتے ہیں
- Custom rules کے لیے HTTP attack patterns سمجھنا ضروری ہے
- Rate limiting ایک طاقتور خصوصیت ہے جو اکثر نظرانداز ہوتی ہے
- WAF محفوظ application code کا متبادل نہیں — یہ ایک defense-in-depth layer ہے

**GuardDuty**:

- فعال کرنے کے لیے انتہائی کم محنت (چند clicks)
- Findings کے لیے انسانی review اور response ضروری ہے — GuardDuty detect کرتا ہے، fix نہیں کرتا
- False positives ہوتے ہیں — کچھ legitimate activity ML models کو anomalous نظر آتی ہے
- 30-day free trial — فوری طور پر فعال کرنے کے قابل

## خلاصہ

- **AWS Shield Standard**: مفت، خودکار DDoS protection layer 3/4 پر۔ ہمیشہ on۔
- **AWS Shield Advanced**: Premium DDoS protection SRT رسائی اور cost protection کے ساتھ۔ Enterprise استعمال کا کیس۔
- **AWS WAF**: Application-layer firewall۔ HTTP requests کا معائنہ اور filter کریں۔ CloudFront، ALB، یا API Gateway سے attach کریں۔ OWASP Top 10 protection کے لیے Managed Rule Groups استعمال کریں۔
- **Amazon GuardDuty**: Behavioral threat detection۔ CloudTrail، VPC Flow Logs، اور DNS logs analyze کرتا ہے۔ غیر معمول activity کے لیے findings generate کرتا ہے۔
- **CloudTrail**: تمام AWS security logging کی بنیاد۔ Long-term retention کے لیے S3 پر لکھتی trail فعال کریں۔
- یہ سروسز ایک دوسرے کو complement کرتی ہیں: نیٹ ورک layer پر Shield، application layer پر WAF، behavioral layer پر GuardDuty۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۲)*

- **Shield Standard بمقابلہ Advanced**: Standard مفت اور خودکار ہے۔ Advanced پیسے لیتا ہے اور SRT، cost protection، اور بہتر detection شامل کرتا ہے۔ Advanced کے لیے امتحانی اشارے: "بڑے پیمانے پر DDoS،" "attacks کے دوران SLA guarantee،" "DDoS-related cost spikes کے خلاف financial protection۔"
- **WAF استعمال کے کیس کے اشارے**: "SQL injection block کریں،" "cross-site scripting block کریں،" "API calls rate limit کریں،" "مخصوص user-agents block کریں،" "OWASP Top 10 protection" → WAF۔
- **GuardDuty اشارے**: "غیر معمول API activity detect کریں،" "compromised credentials شناخت کریں،" "anomalous EC2 نیٹ ورک connections flag کریں،" "threat intelligence" → GuardDuty۔
- **WAF attachment**: CloudFront (global)، ALB (regional)، API Gateway (regional)، AppSync سے attach ہو سکتا ہے۔
- **GuardDuty data sources**: CloudTrail management events، CloudTrail S3 data events، VPC Flow Logs، DNS logs۔ امتحان پوچھ سکتا ہے کہ کون سا data source کسی مخصوص detection منظر نامے سے متعلق ہے۔
- **Macie**: اکثر GuardDuty سے confused ہوتی ہے۔ **Macie** S3 میں sensitive data (PII، credentials، financial data) detect کرنے کے لیے ML استعمال کرتی ہے۔ **GuardDuty** رویے میں threats اور anomalies detect کرتا ہے۔ مختلف استعمال کے کیسز۔

## مشقیں

**مشق ۱ — یادداشت**

AWS WAF اور Amazon GuardDuty کے درمیان فرق بیان کریں۔ ہر سروس کس سے بچاتی ہے، اور ہر سروس کس layer پر کام کرتی ہے؟

*(اشارہ: WAF کو incoming requests پر ایک filter کے طور پر اور GuardDuty کو آپ کے logs دیکھنے والے behavioral analyst کے طور پر سوچیں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک retail کمپنی کی ویب سائٹ ایک botnet سے target ہو رہی ہے جو ان کے product search API کو فی گھنٹہ لاکھوں requests بھیج رہی ہے۔ Requests legitimate نظر آتی ہیں (valid User-Agent strings، valid session cookies) لیکن خریداریوں کا نتیجہ نہیں — وہ product prices scrape کر رہے ہیں۔ Attack legitimate customers کے slow response times کا تجربہ کر رہے ہیں۔

کون سی سروسز کا مجموعہ اس خطرے کو بہترین طریقے سے address کرتا ہے؟

A) AWS Shield Advanced اور CloudFront  
B) Rate limiting rules اور CloudFront کے ساتھ AWS WAF  
C) Amazon GuardDuty اور AWS Shield Standard  
D) Botnet کی IP ranges block کرنے والے Network ACLs

**اشارہ ۱**: Requests HTTP-level (application layer) ہیں۔ کون سی سروس HTTP layer پر کام کرتی ہے؟

**اشارہ ۲**: Botnets بہت سارے مختلف IP پتے استعمال کرتے ہیں — NACL سطح پر مخصوص IP ranges block کرنا بڑے botnets کے خلاف غیر مؤثر ہے۔

**اشارہ ۳**: IP پتے کے مطابق requests rate limit کرنا scraping کو سست کر سکتا ہے چاہے اسے مکمل طور پر block نہ کیا جا سکے۔

**جواب**: B

**وضاحت**: AWS WAF فی IP address requests rate limit کر سکتا ہے، کسی بھی واحد ذریعے سے اعلیٰ volume scraping کے اثر کو کم کرتا ہے۔ CloudFront AWS کے edge نیٹ ورک میں آنے والی ٹریفک کو distribute کرتا ہے، volume کو absorb کرتا ہے اور origin کی حفاظت کرتا ہے۔ WAF rules request patterns (ایک ہی API endpoint پر rapid sequential requests) پر match کر سکتے ہیں scraping behavior شناخت کرنے کے لیے۔

**A کیوں نہیں؟** Shield Advanced DDoS floods (layer 3/4) کے خلاف بچاتا ہے۔ منظر نامہ application-layer scraping (layer 7 HTTP requests) بیان کرتا ہے، جسے Shield inspect نہیں کرتا۔

**C کیوں نہیں؟** GuardDuty آپ کے AWS account کے رویے میں anomalies detect کرتا ہے — یہ incoming HTTP requests block نہیں کرتا۔ Shield Standard application-layer attacks نہیں سنبھالتا۔

**D کیوں نہیں؟** بڑے botnets distributed sources سے ہزاروں IP پتے استعمال کرتے ہیں۔ مخصوص ranges block کرنا ایک whack-a-mole approach ہے جو sophisticated botnets کے خلاف ناکام رہتا ہے۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus credit card data سنبھالنے کی تیاری کرتے ہوئے اپنے threat model پر غور کر رہا ہے۔ PCI-DSS compliance review مانگتی ہے:

- Network-layer DDoS attacks سے تحفظ
- معلوم web exploits کے لیے Application-layer filtering
- تمام API calls کا tamper-evident، long-term store میں logging
- Payment سروس میں غیر معمول رسائی patterns کا detection

ہر ضرورت کو ایک مخصوص AWS سروس یا configuration سے map کریں۔ PCI-DSS context میں Shield Standard کافی ہے، یا Advanced تجویز کریں گے؟ WAF کہاں attach کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد compliance ضروریات کو AWS سروسز سے map کرنے کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

GuardDuty فعال ہو گئی۔

48 گھنٹے بعد، اس نے اپنی پہلی finding generate کی: *"EC2 Instance i-0abc123 ایک معلوم Tor exit node سے بات کر رہا ہے۔"*

Leo نے instance ID دیکھا۔

"یہ internal monitoring instance ہے،" اس نے کہا۔ "جو میں نے network diagnostics چلانے کے لیے سیٹ اپ کیا۔"

"کیا اسے Tor exit nodes سے بات کرنی چاہیے؟"

"نہیں۔" اس نے وقفہ کیا۔ "کیوں کرتا؟"

اس نے instance کھولا۔ کسی نے اس پر ایک ٹول install کیا تھا — ایک legitimate open-source network scanner جو، یہ پتہ چلا، anonymized data collection کے لیے Tor infrastructure سے بھی بات کرتا تھا۔

"تو ٹول گھر call کر رہا تھا،" Priya نے کہا۔

"میری معلومات کے بغیر،" Leo نے تصدیق کی۔

"یہ supply chain risk ہے۔ ایک dependency جو وہ کام کرتی ہے جو آپ نے authorize نہیں کیا۔"

Leo نے ٹول uninstall کیا۔ اس نے installation سے پہلے ہر third-party ٹول review کرنے کا process سیٹ اپ کیا۔

"کیا ہم اب اس سطح کے paranoia پر ہیں؟" Maya نے پوچھا۔

"ہاں،" Priya نے کہا۔

"کیا ہمیں ہمیشہ اس سطح پر ہونا چاہیے تھا؟" Maya نے پوچھا۔

"یہ بھی ہاں،" Priya نے کہا۔

اگلے باب میں: جب Virginia کا data center غائب ہو جاتا ہے — اور Nimbus کیوں چلتا رہتا ہے۔
