# باب ۱۷: نگہبان

Romanian IP کے ساتھ واقعہ محدود ہو گیا تھا۔ Secrets Secrets Manager میں تھے۔ Credentials rotate ہو چکی تھیں۔ نیٹ ورک controls مضبوط ہو گئے تھے۔

لیکن Priya نے وہ سوال پوچھا تھا جس نے باب ۱۶ ختم کیا: "اگر CloudTrail میں کوئی غیر معمولی چیز ظاہر ہو، تو ہمیں کیسے پتہ چلے گا؟"

ایماندارانہ جواب تھا: شاید نہیں۔

---

*ہر وہ چیز جو lock کی جا سکتی تھی lock کر دی گئی تھی۔ Secrets Secrets Manager میں تھے۔ Encryption keys KMS میں تھیں۔ نیٹ ورک ٹریفک security groups اور NACLs سے کنٹرول تھی۔ Perimeter دفاع مضبوط تھے۔ لیکن perimeter دفاع فرض کرتے ہیں کہ آپ جانتے ہیں کہ کوئی حملہ آنے سے پہلے کیسا نظر آتا ہے۔ Priya جو سوال پوچھ رہی تھی وہ مختلف تھا: ان حملوں کا کیا جنہیں آپ آتے ہوئے نہیں دیکھتے؟*

---

CloudTrail فی دن ہزاروں events log کرتا ہے۔ کوئی انسان سب نہیں پڑھتا۔ Priya ہر ہفتے دستی طور پر چیک کرتی تھی، لیکن اس کا مطلب تھا کہ کچھ منگل کو ہو سکتا تھا اور اگلے پیر تک محسوس نہیں ہوتا۔

"ہمیں کوئی ایسی چیز چاہیے جو ہماری جانب سے logs دیکھے،" اس نے کہا۔

Maya نے نگاہ اٹھائی۔ "خودبخود؟"

"خودبخود۔"

"اور کیا ہو اگر کوئی توڑ کر داخل ہونے کی کوشش کرے؟" Priya نے جاری رکھا۔ "صرف ایک compromised credential نہیں — کیا ہو اگر کوئی DDoS launch کرے؟ کیا ہو اگر وہ injection کمزوریوں کے لیے ہمارے API endpoints کو probe کرنا شروع کریں؟ کیا ہو اگر وہ پہلے سے اندر ہوں اور ہمیں معلوم نہ ہو؟"

"یہ تین مختلف مسائل ہیں،" Leo نے کہا۔

"ہاں،" Priya نے کہا۔ "اور AWS کے پاس انہیں address کرنے کے لیے تین مختلف سروسز ہیں۔"

**تین خطرے کی Categories**

Cloud ایپلیکیشن کے خلاف security خطرات عام طور پر تین categories میں آتے ہیں:

**Volume attacks (DDoS)**: ایک حملہ آور اتنی زیادہ ٹریفک بھیجتا ہے کہ آپ کی ایپلیکیشن legitimate صارفین کو جواب نہیں دے سکتی۔ حملہ لاکھوں HTTP requests، یا TCP SYN packets کا سیلاب ہو سکتا ہے جو آپ کے سرور کی connection table ختم کرنے کے لیے ڈیزائن کیا گیا ہو۔

**Application attacks (Exploits)**: ایک حملہ آور خاص طور پر تیار کردہ requests بھیجتا ہے جو آپ کی ایپلیکیشن کی کمزوریوں کا فائدہ اٹھانے کے لیے ڈیزائن کی گئی ہوں — SQL injection، cross-site scripting، malformed input جو کوئی parser crash کر دے۔

**Behavioral anomalies (Reconnaissance اور compromise)**: API calls جو نہیں ہونی چاہئیں (کوئی رات 3 بجے آپ کے پورے user database کو query کر رہا ہے)، غیر معمول IAM activity (ایک نئے ملک سے استعمال کی جانے والی credentials)، یا unexpected destinations کی طرف نیٹ ورک ٹریفک۔

AWS کے پاس ہر ایک کے لیے ایک dedicated سروس ہے:

- **AWS Shield**: DDoS protection
- **AWS WAF**: Application-layer protection
- **Amazon GuardDuty**: Behavioral threat detection

**AWS Shield: DDoS Absorber**

**AWS Shield Standard** تمام AWS customers کے لیے بغیر کسی اضافی چارج کے خودبخود فعال ہے۔ یہ سب سے عام layer 3 (network) اور layer 4 (transport) DDoS attacks سے بچاتا ہے — SYN floods، UDP floods، DNS amplification attacks۔

CloudFront، Route 53، اور Elastic Load Balancing AWS کے نیٹ ورک کے edge پر بیٹھتے ہیں۔ جب کوئی DDoS attack آپ کی ایپلیکیشن کو target کرتا ہے، تو یہ پہلے ان managed سروسز کو متاثر کرتا ہے۔ AWS کا نیٹ ورک infrastructure حملے کو absorb کرتا ہے اس سے پہلے کہ یہ آپ کی EC2 انسٹینسز تک پہنچے۔

**AWS Shield Advanced** premium tier ہے ($3,000/month فی organization، ایک سال کے commitment کے ساتھ)۔ یہ ایک الگ subscription ہے — یہ کسی AWS Support plan میں شامل *نہیں* ہے۔ یہ شامل کرتا ہے:

- EC2، ELB، CloudFront، Global Accelerator، اور Route 53 کے لیے Protection
- Near-real-time attack notifications
- AWS Shield Response Team (SRT) تک رسائی — security engineers جو آپ کو attacks کا جواب دینے میں مدد کر سکتے ہیں (SRT کو engage کرنے کے لیے اضافی طور پر ایک Business یا Enterprise Support plan درکار ہے)
- Cost protection: اگر کوئی attack آپ کا بل spike کرے، تو AWS surge costs credit کرتا ہے
- Layer 7 (application layer) پر Enhanced DDoS detection اور mitigation

"اس پر فی مہینہ کتنا خرچ آتا ہے؟" Tom نے پوچھا۔

"تین ہزار dollars،" Priya نے کہا۔ "فی organization۔"

Tom ایک لمحے کے لیے خاموش رہا۔

"Enterprises کے لیے جو لاکھوں میں revenue سنبھالتی ہیں، ایک DDoS جو انہیں دو گھنٹے کے لیے بند کر دے تین ہزار dollars سے زیادہ لاگت آتا ہے،" Priya نے کہا۔

Tom نے خاموشی سے حساب لگایا۔

"ہم Standard سے شروع کریں گے،" اس نے آخرکار کہا۔

---

**DDoS واقعہ: Shield عمل میں کیسا نظر آتا ہے**

لانچ کے آٹھ ماہ بعد، Nimbus کو اپنا پہلا حقیقی DDoS attack ملا۔

یہ ایک منگل کو صبح 11:43 بجے شروع ہوا۔ لوڈ بیلنسر کے CloudWatch dashboard نے آنے والی connection requests کو معمول کے فی منٹ 3,000 سے ترانوے سیکنڈ سے کم میں فی منٹ 180,000 پر spike ہوتے دکھایا۔ Source IPs چالیس ممالک میں پھیلے ہوئے تھے، اور inbound volume تقریباً پچاس gigabits فی سیکنڈ پر peak ہوا۔ Pattern ناقابل غلطی تھا: ایک botnet ایک SYN flood launch کر رہا تھا۔

Leo نے پہلے CloudFront metrics دیکھیں۔ "Request rate ساٹھ گنا اوپر ہے۔ Response time spike کر رہا ہے۔"

Priya نے CloudWatch metrics ساتھ ساتھ کھولیں: edge پر connection کی کوششیں عمودی طور پر چڑھ رہی تھیں، origin تک دراصل پہنچنے والی requests — flat۔ "Shield Standard اسے کھا رہا ہے،" اس نے کہا۔ کوئی alert نہیں، کوئی dashboard event نہیں، کوئی notification نہیں۔ Shield Standard خاموشی سے کام کرتا ہے: یہ ہمیشہ on ہے، یہ مفت ہے، اور یہ آپ کو **کوئی attack visibility نہیں** دیتا — کوئی event console نہیں، کوئی notifications نہیں، کوئی DDoS response team نہیں۔ (وہ visibility — near-real-time attack dashboards اور alerts — بالکل وہی ہے جو Shield *Advanced* بیچتا ہے۔) Priya کا حملے کو سرے سے دیکھنے کا واحد طریقہ اس کی اپنی CloudWatch metrics کے ذریعے تھا۔

Shield Standard نے خودبخود SYN flood کا پتہ لگا لیا تھا اور پہلے دو منٹ کے اندر mitigation engage کر دی تھی۔ Attack traffic عالمی سطح پر CloudFront کے edge nodes پر absorb ہو رہی تھی — وہی 750+ points of presence جو legitimate content serve کرتے تھے attack volume بھی absorb کرتے تھے۔

صبح 11:52 بجے تک — attack شروع ہونے کے نو منٹ بعد — Shield کی mitigation نے origin پر request rate واپس معمول پر لے آئی تھی۔ Attack ابھی بھی نیٹ ورک کی سطح پر چل رہا تھا، لیکن mitigation اسے سنبھال رہی تھی۔ Nimbus ایپلیکیشن پورے دوران صارفین کو serve کرتی رہی۔

"صارفین نے محسوس نہیں کیا؟" Leo نے error rate metric دیکھتے ہوئے پوچھا۔

"Error rate تقریباً چار منٹ کے لیے تقریباً دو فیصد بڑھ گیا،" Priya نے کہا۔ "کچھ صارفین کو تھوڑا سست response ملا۔ کوئی outages نہیں۔ ایپلیکیشن up رہی۔"

"کیونکہ Shield نے سیلاب کو edge پر absorb کر لیا۔"

"اس سے پہلے کہ یہ ہمارے لوڈ بیلنسر تک پہنچے۔ پچاس gigabit SYN flood نے CloudFront کو متاثر کیا۔ جب تک traffic pattern پہچانا اور mitigate کیا گیا، ہمارے origin نے صرف معمول کا request volume دیکھا تھا۔"

Attack سینتالیس منٹ چلا۔ دوپہر 12:30 بجے تک edge metrics baseline پر واپس آ گئی تھیں — وہ واحد "resolved" اشارہ جو Shield Standard آپ کو دیتا ہے۔

"اور یہ Shield Standard ہے،" Tom نے کہا۔ "مفت ورژن۔"

"Layer 3 اور 4 attacks۔ Standard ان کے خلاف خودبخود بچاتا ہے۔ اگر attack زیادہ نفیس ہوتا — مثلاً ایک layer 7 HTTP flood، جہاں ہر request legitimate نظر آتی — تو Standard کافی نہ ہوتا۔ اس کے لیے Shield Advanced علاوہ WAF درکار ہے۔"

Tom نے اپنے security roadmap میں "Layer 7 DDoS patterns کے لیے Monitor کریں" لکھا۔

---

**AWS WAF: Application Filter**

**AWS WAF (Web Application Firewall)** HTTP کی سطح پر کام کرتا ہے — یہ آپ کی ایپلیکیشن تک پہنچنے سے پہلے web requests کے مواد کا معائنہ کرتا ہے۔

WAF **Web ACLs (Access Control Lists)** کے ساتھ ترتیب دیا جاتا ہے — rule sets جو define کرتے ہیں کہ کیا allow، block، یا count کرنا ہے۔

WAF کو منسلک کیا جا سکتا ہے:

- CloudFront distributions (edge پر requests کا معائنہ کریں، عالمی سطح پر)
- Application Load Balancers (regional سطح پر requests کا معائنہ کریں)
- API Gateway
- AWS AppSync

**WAF Managed Rules**: AWS اور third-party vendors نے pre-built rule sets شائع کیے ہیں:

- **AWS Managed Rules - Core Rule Set**: ساتھی rule groups (SQL database، Known Bad Inputs) کے ساتھ مل کر، OWASP Top 10 vulnerabilities کا احاطہ کرتا ہے (SQL injection، XSS، command injection، path traversal، وغیرہ)
- **AWS Managed Rules - Known Bad Inputs**: معلوم attack patterns سے matching requests block کرتا ہے
- **AWS Managed Rules - Amazon IP Reputation List**: ایسے IPs block کرتا ہے جو botnets اور scanners سے منسلک معلوم ہیں
- **AWS Managed Rules - Bot Control**: Bot traffic کی شناخت اور management کرتا ہے

آپ custom rules بھی بنا سکتے ہیں:

- "کوئی بھی request جس میں User-Agent header میں 'sqlmap' ہو block کریں" (ایک عام SQL injection scanner)
- "Rate limit: فی IP فی 5 منٹ 1000 سے زیادہ requests allow نہ کریں"
- "کسی بھی parameter value میں `<script>` پر مشتمل requests block کریں"

Nimbus کے لیے، عملی سیٹ اپ: CloudFront distribution پر Core Rule Set فعال کے ساتھ WAF۔ یہ EC2 انسٹینسز تک requests پہنچنے سے پہلے سب سے عام attack patterns block کرتا ہے۔

آپ سوچ رہے ہوں گے: اگر WAF معلوم attack patterns block کرتا ہے، تو کیا ہوتا ہے جب کوئی نیا attack pattern ظاہر ہو جسے WAF نہیں جانتا؟ WAF managed rule sets کو AWS اور third-party vendors نئے خطرات ابھرنے پر اپڈیٹ کرتے ہیں — آپ کو rules دستی طور پر اپڈیٹ کرنے کی ضرورت نہیں۔ لیکن آپ صحیح ہیں کہ WAF بنیادی طور پر معلوم patterns پر reactive ہے۔ نئی، انوکھی attack تکنیکیں ایک ایسے rule سے block نہیں ہوں گی جو ابھی موجود نہیں۔ یہی وجہ ہے کہ GuardDuty WAF کے ساتھ موجود ہے: WAF سامنے کا دروازہ filter کرتا ہے، GuardDuty گھر کے اندر غیر معمول رویے کے لیے دیکھتا ہے۔ ایک نئی attack قسم WAF سے گزر سکتی ہے، لیکن GuardDuty پھر بھی اس سے پیدا ہونے والی anomalous activity کو flag کر سکتا ہے — غیر معمول API calls، unexpected نیٹ ورک destinations، رسائی کے patterns جو baseline سے میل نہیں کھاتے۔

**کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر WAF false positives پیدا کرے؟** Priya نے پوچھا۔ "ایک legitimate صارف کی request جو Core Rule Set سے block ہو جائے؟"

"WAF کا ایک 'Count' mode ہے،" Leo نے کہا۔ "block کرنے کے بجائے، یہ بس matching requests count کرتا ہے۔ آپ اسے پہلے Count mode میں چلاتے ہیں، جائزہ لیتے ہیں کہ یہ کیا block کرتا، تصدیق کرتے ہیں کہ کوئی false positives نہیں، پھر Block پر سوئچ کرتے ہیں۔"

"اچھا،" Priya نے کہا۔ "ہم Count mode میں شروع کرتے ہیں۔"

---

**ایک WAF Rule بنانا: Rate Limit کی کہانی**

WAF کو Count mode میں فعال کرنے کے دو ہفتے بعد، Priya نے logs کا جائزہ لیا۔ Core Rule Set findings صاف تھیں — legitimate traffic پر کوئی false positives نہیں، automated scanners سے چند block کی گئی SQL injection کی کوششیں۔

لیکن اس نے ایک pattern دیکھا جسے Core Rule Set flag نہیں کر رہا تھا: ایک IP پتے نے پانچ منٹ میں `/api/search` کو 847 requests کی تھیں۔ ہر request ساختی طور پر valid تھی۔ لیکن پانچ منٹ میں 847 searches کوئی انسان نہیں تھا۔

"Price scraper،" اس نے کہا۔ "کوئی ایک مسابقتی price database بنانے کے لیے خودبخود ہماری ریستوران search کو query کر رہا ہے۔"

"کیا ہمیں پروا ہے؟" Leo نے پوچھا۔

"یہ ہمارے compute resources استعمال کرتا ہے اور یہ ہماری terms of service کے خلاف ہے،" Tom نے کہا۔

"ہمیں پروا ہے،" Priya نے تصدیق کی۔

اس نے ایک custom WAF rate-based rule بنایا:

```
Rule name: RateLimitSearchAPI
Rule type: Rate-based rule
Rate limit: فی IP پتہ 100 requests
Evaluation window: 5 منٹ (قابل ترتیب: 1، 2، 5، یا 10 منٹ)
Scope-down statement: URI path /api/search سے شروع ہوتا ہے
Action: Block
```

Scope-down statement اہم ہے — rate limit صرف `/api/search` پر لاگو ہوتا ہے۔ دیگر endpoints کو legitimate API traffic غیر متاثر رہتی ہے۔ اور نوٹ کریں کہ blocking کیسے کام کرتی ہے: کوئی مقررہ "سزا" کی مدت نہیں — WAF ہر IP کی request rate کو مسلسل دوبارہ evaluate کرتا ہے، اسے block کرتا ہے جبکہ rate حد سے اوپر رہتی ہے، اور اسے unblock کرتا ہے (عام طور پر سیکنڈوں کے اندر) جب rate واپس حد سے نیچے گرتی ہے۔

اس نے اسے پہلے Count mode پر سیٹ کیا۔ 24 گھنٹے چلایا۔ صرف وہی IP جس نے rule trip کیا scraper تھا۔ کسی legitimate صارف نے کبھی پانچ منٹ میں search endpoint کو 12 سے زیادہ requests نہیں بھیجی تھیں۔

اس نے Block mode پر سوئچ کیا۔ Scraper کی اگلی request کو ایک 403 ملا۔ یہ ایک مختلف IP پر سوئچ ہو گیا۔ Rate limit نے اسے بھی پکڑ لیا۔

"وہ بالآخر اس کے گرد راستہ نکال لیں گے،" Leo نے کہا۔ "زیادہ IPs میں distribute کریں گے۔"

"جس مقام پر وہ زیادہ infrastructure استعمال کر رہے ہیں، زیادہ ادائیگی کر رہے ہیں، اور کم data حاصل کر رہے ہیں،" Priya نے کہا۔ "ہمیں انہیں مکمل طور پر روکنے کی ضرورت نہیں۔ ہمیں اسے اتنا مہنگا بنانے کی ضرورت ہے کہ یہ قابل نہ رہے۔"

"اس پر فی مہینہ کتنا خرچ آتا ہے؟" Tom نے پوچھا۔

WAF pricing فی Web ACL فی ماہ، فی rule فی ماہ، اور فی ملین requests ہے۔ Nimbus سیٹ اپ کے لیے — CloudFront پر ایک Web ACL، پانچ rules — تقریباً $15 فی مہینہ علاوہ request charges۔

Tom نے اسے فوراً منظور کر لیا۔

---

**Amazon GuardDuty: Behavioral Analyst**

"رکیں — لیکن ہم *کیوں* اسے اس طرح کریں؟" Maya نے پوچھا۔ "اگر WAF attacks block کر رہا ہے اور Shield سیلاب absorb کر رہا ہے، تو ہمیں ایک تیسری سروس کیوں چاہیے؟ GuardDuty دراصل کس کے لیے دیکھ رہا ہے؟"

WAF اور Shield filters ہیں — وہ آپ کی ایپلیکیشن تک پہنچنے سے پہلے بری ٹریفک intercept کرتے ہیں۔ GuardDuty دیکھتا ہے کہ ٹریفک آنے کے بعد کیا ہوتا ہے۔ یہ دیکھتا ہے کہ آپ کا infrastructure کیا کر رہا ہے: کون سی IAM credentials استعمال ہو رہی ہیں، آپ کی انسٹینسز کن domains سے رابطہ کر رہی ہیں، رات 3 بجے کون سی API calls ہو رہی ہیں۔ ایک حملہ آور جو ایک legitimate نظر آنے والی request کے ذریعے سامنے کے دروازے سے گزر جائے WAF سے نہیں رکے گا — لیکن GuardDuty نوٹ کرے گا کہ وہی credential اچانک Romania سے API calls کر رہی ہے۔

GuardDuty بنیادی طور پر Shield اور WAF سے مختلف ہے۔ یہ attacks block نہیں کرتا — یہ **غیر معمول رویے کا پتہ لگاتا ہے**۔

GuardDuty خطرات کا پتہ لگانے کے لیے سرگرمی کی کئی streams کا مسلسل تجزیہ کرتا ہے: **CloudTrail management اور data events** (API calls اور actions)، **VPC Flow Logs** (نیٹ ورک ٹریفک patterns)، اور **DNS query logs** (domain lookups)۔ یہ تین بنیادی ذرائع ہیں جن پر GuardDuty ہمیشہ rely کرتا رہا ہے:

- **AWS CloudTrail logs**: IAM تبدیلیاں، API calls، console logins
- **VPC Flow Logs**: آپ کے VPC کے اندر نیٹ ورک ٹریفک patterns
- **DNS query logs**: آپ کی انسٹینسز کیا resolve کر رہی ہیں (معلوم malware اکثر مخصوص C2 domains resolve کرتا ہے)

لیکن GuardDuty ان تینوں سے کہیں آگے نمایاں طور پر پھیل گیا ہے۔ AWS اختیاری add-ons کو **protection plans** کہتا ہے — S3 Protection، EKS Protection، RDS Protection، Lambda Protection، Runtime Monitoring، اور Malware Protection — ہر ایک انفرادی طور پر فعال۔ آپ کیا فعال کرتے ہیں اس پر منحصر ہے، GuardDuty یہ بھی تجزیہ کر سکتا ہے: **S3 data events** (آپ کی buckets تک غیر معمول رسائی patterns)، **EKS audit logs اور runtime activity** (چلتے containers کے اندر malicious behavior)، **RDS login events** (anomalous database login کی کوششیں)، **Lambda network traffic** (functions جو unexpected بیرونی destinations کال کرتے ہیں)، **ECS/EC2 runtime behavior**، اور **malware کے لیے scan کیے گئے EBS volumes**۔ امتحان کے لیے، تین بنیادی ذرائع دل سے جانیں؛ protection plans مخصوص threat detection contexts کے بارے میں منظر ناموں میں ظاہر ہوتے ہیں — "RDS کے anomalous login کی کوششیں detect کریں" یا "چلتے container کے اندر malicious behavior شناخت کریں" GuardDuty کے اختیاری protection plans کے بارے میں سوچنے کے اشارے ہیں۔

Machine learning models ان patterns کی شناخت کرتے ہیں جو آپ کے baseline سے مختلف ہوں۔ GuardDuty **findings** generate کرتا ہے — categorized alerts — جب یہ anomalies کا پتہ لگائے۔

GuardDuty کیا detect کر سکتا ہے اس کی مثالیں:

- ایک IAM user ایک unrecognized IP پتے سے login کر رہا ہے (ایک ایسے ملک سے جو انہوں نے پہلے کبھی استعمال نہیں کیا)
- ایک Tor exit node سے API calls
- ایک EC2 انسٹینس ایک معلوم cryptocurrency mining pool سے بات کر رہی ہے
- غیر معمول اعلیٰ API call volume (credential abuse یا scanning)
- ایک S3 bucket کسی ایسے IP پتے سے access کی جا رہی ہے جسے malicious activity کے لیے flag کیا گیا ہو
- ایک ایسے ڈومین کو outbound ٹریفک جو malware command-and-control سے منسلک معلوم ہو

"یہ وہی ہوتا جس نے Romanian IP پکڑا ہوتا،" Leo نے آہستہ آہستہ کہا۔

"اگر ہمارے پاس GuardDuty فعال ہوتی، تو یہ EC2 انسٹینس کو رات 2 بجے ایک unrecognized بیرونی IP سے outbound connections بناتے ہوئے flag کر دیتا،" Priya نے تصدیق کی۔

---

**پانچ GuardDuty Finding اقسام اور کیا کرنا ہے**

Priya نے پانچ سب سے عام GuardDuty findings کے لیے ایک runbook بنایا۔ جب کوئی finding fire ہوتی ہے، تو ٹیم فوراً جانتی ہے کہ اس کا کیا مطلب ہے اور کیا کرنا ہے۔

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

ایک IAM user نے ایک ایسے IP پتے سے AWS Console میں کامیابی سے login کیا جو اس account کے لیے پہلے نہیں دیکھا گیا، یا پچھلے logins سے غیر مطابق ایک جغرافیائی مقام سے۔

ردعمل: صارف کے ساتھ تصدیق کریں کہ انہوں نے login شروع کیا۔ اگر انہوں نے نہیں کیا — یا ان سے رابطہ نہیں ہو سکتا — تو فوراً: صارف کی access key اور console password غیر فعال کریں، فعال sessions revoke کریں، اور اس user نے پچھلے 24 گھنٹوں میں جو کچھ کیا اس کا CloudTrail audit شروع کریں۔ یہ finding اکثر credential abuse سے پہلے ہوتی ہے۔

**2. CryptoCurrency:EC2/BitcoinTool.B**

ایک EC2 انسٹینس cryptocurrency mining pools سے منسلک IP پتوں یا domain names کو query کر رہی ہے۔ یہ تقریباً ہمیشہ ایک EC2 انسٹینس کے compromise ہونے اور ایک mining bot کے طور پر استعمال ہونے کا نتیجہ ہے۔

ردعمل: انسٹینس کو فوراً isolate کریں — اس کے security group کو ترمیم کر کے bastion host کے علاوہ تمام inbound اور outbound traffic block کریں۔ EBS volume کا forensic snapshot لیں۔ پھر انسٹینس terminate کریں اور ایک صاف AMI سے ایک replacement launch کریں۔

**3. Recon:EC2/PortProbeUnprotectedPort**

ایک EC2 انسٹینس کا انٹرنیٹ کے لیے ایک port کھلا ہے جسے معلوم scanners یا ایک Tor exit node سے probe کیا جا رہا ہے۔ GuardDuty ان ports کو flag کرتا ہے جو flow logs میں بیرونی ذرائع سے قابل رسائی نظر آتے ہیں۔

ردعمل: security group rules کا جائزہ لیں۔ اگر port جان بوجھ کر کھلا ہے، تو finding کو ایک نوٹ کے ساتھ resolved نشان زد کریں۔ اگر یہ ارادتاً نہیں، تو port فوراً بند کریں۔ اس port کے ذریعے ہونے والی کسی بھی رسائی کے لیے CloudTrail چیک کریں۔

**4. Trojan:EC2/BlackholeTraffic**

ایک EC2 انسٹینس ایک ایسے IP پتے سے بات کرنے کی کوشش کر رہی ہے جسے ایک "black hole" کے طور پر شناخت کیا گیا ہے — ایک destination جو malware command-and-control infrastructure سے منسلک ہو۔ ان IPs کو ٹریفک تجویز کرتی ہے کہ انسٹینس infect ہو گئی ہے اور گھر call کرنے کی کوشش کر رہی ہے۔

ردعمل: CryptoCurrency findings کی طرح — isolate، snapshot، replace۔ یہ finding انسٹینس پر فعال malware کی نشاندہی کرتی ہے۔ انسٹینس کو in place صاف کرنے کی کوشش نہ کریں؛ ایک صاف AMI سے ایک نیا بنائیں۔

**5. Policy:S3/BucketBlockPublicAccessDisabled**

کسی نے ایک S3 bucket پر Block Public Access setting غیر فعال کر دی ہے۔ اس کا مطلب یہ نہیں کہ bucket public ہے — اس کا مطلب ہے کہ وہ safety mechanism جو حادثاتی public exposure روکتا ہے اس bucket کے لیے بند کر دیا گیا ہے۔ یہ اکثر حادثاتی طور پر یا ایک غلط ترتیب شدہ deployment کے حصے کے طور پر کیا جاتا ہے۔

ردعمل: تحقیق کریں کہ تبدیلی کس نے کی (CloudTrail میں API call ہوگا)۔ Block Public Access دوبارہ فعال کریں جب تک کہ کوئی documented وجہ نہ ہو کہ اسے غیر فعال ہونا چاہیے۔ مستقبل میں اس finding کے ہونے کو روکنے کے لیے account-level Block Public Access setting فعال کرنے پر غور کریں۔

"GuardDuty findings کے بارے میں سب سے اہم بات،" Priya نے کہا، "یہ ہے کہ وہ alerts نہیں ہیں — وہ مفروضے ہیں۔ ہر finding کہتی ہے 'یہ pattern anomalous نظر آتا ہے۔' آپ تصدیق کرتے ہیں، تحقیق کرتے ہیں، جواب دیتے ہیں۔ کچھ false positives ہوں گے۔ زیادہ تر نہیں ہوں گے۔"

"ہم ترجیح کیسے دیں؟" Rafael نے پوچھا۔

"GuardDuty severity levels تفویض کرتا ہے: Low، Medium، High۔ High severity findings کو اسی دن ردعمل درکار ہے۔ Trojan اور credential compromise findings ہمیشہ High ہوتی ہیں۔ Port probe findings Medium یا Low ہو سکتی ہیں۔ High سے شروع کریں، نیچے کی طرف کام کریں۔"

---

"اس کی کتنی لاگت ہے؟" Tom نے پوچھا۔

GuardDuty pricing analyzed logs کے volume پر مبنی ہے — CloudTrail events، VPC flow data، DNS queries۔ ایک چھوٹی سے درمیانی ایپلیکیشن کے لیے، عام طور پر $50-150/month۔ پیمانے پر، یہ پھر بھی infrastructure کی لاگت کا ایک چھوٹا حصہ ہے۔

Tom نے console کھولا اور اسے فعال کیا۔

"یہ ٹھیک رہے گا،" Leo نے کہا۔ "یہ صرف monitoring ہے۔ یہ ایسا نہیں کہ یہ کچھ توڑ دے گا۔"

"میں نے اسے پہلے ہی deploy کر دیا،" Leo نے مزید کہا — اور پھر GuardDuty dashboard چیک کیا۔ "اوہ۔ صرف sample findings۔ اصل والے کچھ وقت لیتے ہیں۔"

"GuardDuty کو یہ baseline بنانے کے لیے وقت چاہیے کہ معمول کیسا نظر آتا ہے،" Priya نے کہا۔ "اسے ایک دو دن دیں۔ پہلی اصل finding آئے گی — وہ ہمیشہ آتی ہیں۔"

وہ اس کے بارے میں صحیح نکلی۔ لیکن پہلی finding اس باب کے آخر کی کہانی ہے۔

**تینوں سروسز کو جوڑنا**

Shield، WAF، اور GuardDuty مختلف layers پر کام کرتی ہیں اور ایک دوسرے کو complement کرتی ہیں:

| سروس      | Layer                     | کس سے بچاتی ہے                             | عمل                            |
|------------|---------------------------|---------------------------------------------|--------------------------------|
| AWS Shield | Network/Transport (L3/L4) | DDoS floods                                 | Attacks absorb/mitigate کرتا ہے |
| AWS WAF    | Application (L7)          | OWASP Top 10، bots، scrapers                | Requests allow، block، یا count کرتا ہے |
| GuardDuty  | Behavioral (تمام logs)    | Anomalies، compromised credentials، malware | Detect اور alert کرتا ہے       |

Shield سیلاب روکتا ہے۔ WAF پانی کو filter کرتا ہے۔ GuardDuty غیر معمول flow patterns کے لیے plumbing کو دیکھتا ہے۔ Macie reservoirs میں جو ذخیرہ ہے اس کا audit کرتا ہے۔ Security Hub وہ control room ہے جہاں تمام dashboards بیک وقت نظر آتے ہیں۔

ہر ایک کا failure mode وضاحت کرتا ہے کہ آپ کو ان سب کی ضرورت کیوں ہے:

- ایک 50 Gbps SYN flood ایک web request نہیں ہے۔ WAF اسے inspect نہیں کر سکتا۔ GuardDuty منسلک CloudTrail events نوٹ کر سکتا ہے۔ Shield اسے روکتا ہے۔
- ایک واحد SQL injection request ایک سیلاب نہیں ہے۔ Shield اسے نظرانداز کرتا ہے۔ GuardDuty HTTP requests کا مواد نہیں جانتا۔ WAF اسے پکڑتا ہے۔
- اپنی credentials کا استعمال کرتے ہوئے آہستہ سے data exfiltrate کرنے والا ایک legitimate AWS صارف — کوئی DDoS نہیں، کوئی injection نہیں، valid HTTP — Shield اور WAF کو کچھ غیر معمول نظر نہیں آتا۔ GuardDuty نوٹ کرتا ہے کہ credentials رات 3 بجے ایک نئے ملک سے استعمال ہو رہی ہیں۔
- ایک developer جو حادثاتی طور پر customer data ایک publicly-accessible bucket پر اپ لوڈ کرتا ہے سرے سے کوئی anomalous behavior پیدا نہیں کرتا۔ GuardDuty کے پاس flag کرنے کے لیے کچھ نہیں۔ Macie bucket scan کرتا ہے اور PII ڈھونڈتا ہے۔

ہر سروس کا ایک blind spot ہے۔ مجموعہ ان blind spots کا احاطہ کرتا ہے۔

**CloudTrail: بنیاد**

تینوں سروسز logs پر rely کرتی ہیں۔ **AWS CloudTrail** وہ logging سروس ہے جو آپ کے AWS account میں ہر API call capture کرتی ہے — کس نے کیا call کیا، کب، کہاں سے، کیا نتیجہ کے ساتھ۔

CloudTrail console میں 90-day history کے لیے ڈیفالٹ کے مطابق فعال ہے۔ Long-term logs retain کرنے کے لیے:

1. ایک trail بنائیں جو ایک S3 bucket میں لکھے
2. اختیاری طور پر، real-time alerting کے لیے CloudWatch Logs کو بھیجیں
3. Log file validation فعال کریں (یہ پتہ لگانے کے لیے کہ logs سے چھیڑ چھاڑ کی گئی ہو)

GuardDuty، AWS Config، Security Hub، اور IAM Access Analyzer سب CloudTrail سے پڑھتے ہیں۔ CloudTrail logs کے بغیر، ان سروسز کے پاس analyze کرنے کے لیے کچھ نہیں۔

"کیا ہو اگر کوئی CloudTrail غیر فعال کرنے کی کوشش کرے؟" Priya نے پوچھا۔ "اگر ایک حملہ آور administrator access حاصل کر لے، تو ان کی پہلی کارروائی logging غیر فعال کرنا ہو سکتی ہے — اپنے نشانات چھپانا۔"

"یہی وہ ہے جسے باب ۱۴ کی SCP روکتی ہے،" Leo نے کہا۔ "اس account میں کوئی CloudTrail غیر فعال نہیں کر سکتا، administrators بھی نہیں۔"

"اور اگر وہ کسی طرح کر لیں؟"

"Security Hub ایک finding generate کرے گا۔ CloudTrail configuration تبدیلیوں پر SNS کو ایک notification بھیجتا ہے۔ ہمیں کسی بھی CloudTrail ترمیم کے دو منٹ کے اندر ایک alert ملتا ہے۔"

"اور GuardDuty API call کو flag کرے گا،" Rafael نے اضافہ کیا، "ایک غیر معمول IAM action کے طور پر — logging غیر فعال کرنا کوئی معمول کی operational activity نہیں۔"

logs کے ساتھ چھیڑ چھاڑ کرنا — سب سے اہم security actions میں سے ایک — کے لیے detection کی متعدد layers۔ یہ اتفاق نہیں تھا۔ Priya نے اسے جان بوجھ کر ڈیزائن کیا تھا۔

"گہرائی میں دفاع monitoring layer پر بھی لاگو ہوتا ہے،" اس نے کہا۔ "صرف application layer پر نہیں۔"

**Amazon Macie: S3 میں Sensitive Data**

"کیا ہم نے سوچا ہے کہ کیا ہوتا ہے اگر کوئی حادثاتی طور پر customer credit card numbers والی ایک file S3 پر اپ لوڈ کر دے؟" Priya نے پوچھا۔ "Maliciously نہیں — بس ایک developer debugging کے لیے data export کر رہا ہو اور غلط file اپ لوڈ کر دے؟"

"ہمیں کبھی پتہ نہیں چلتا،" Leo نے کہا۔

"بالکل۔ جب تک ہمارے پاس Macie نہ ہو۔"

**Amazon Macie** ایک data security سروس ہے جو S3 میں sensitive data کو خودبخود discover اور protect کرنے کے لیے machine learning استعمال کرتی ہے۔ یہ S3 buckets کو مسلسل scan کرتی ہے اور شناخت کرتی ہے:

- PII (Personally Identifiable Information): نام، email پتے، فون نمبر، تاریخ پیدائش
- Financial data: credit card numbers، bank account numbers
- Credentials: passwords، access keys، files میں embedded private keys
- Health information: patient records، diagnoses

Macie findings generate کرتی ہے جب یہ sensitive data ان جگہوں پر detect کرے جہاں اسے نہیں ہونا چاہیے — یا جب S3 buckets میں ضرورت سے زیادہ permissive access configurations ہوں۔

"کیا یہ GuardDuty جیسا ہے؟" Maya نے پوچھا۔

"مختلف مقصد،" Priya نے کہا۔ "GuardDuty رویے کو دیکھتا ہے — کون سی actions لی جا رہی ہیں، کیا وہ actions anomalous نظر آتی ہیں۔ Macie data کو دیکھتی ہے — کون سا مواد ذخیرہ ہے، کیا وہ مواد sensitive ہے۔ GuardDuty ایک EC2 انسٹینس کو غیر معمول API calls کرتے ہوئے flag کرتا۔ Macie credit card numbers پر مشتمل ایک S3 bucket کو flag کرتی۔"

"تو GuardDuty behavioral analyst ہے،" Leo نے کہا، "اور Macie data auditor ہے۔"

"بالکل۔ آپ کو دونوں چاہئیں۔ ایک حملہ آور جو ایک legitimate نظر آنے والی API call کے ذریعے data exfiltrate کرے غیر معمول API pattern کے لیے GuardDuty سے flag ہو سکتا ہے۔ لیکن اگر ایک employee 10,000 customer records والی ایک file ایک development bucket پر اپ لوڈ کرے، تو detect کرنے کے لیے کوئی anomalous behavior نہیں — بس غلط جگہ پر sensitive data۔ Macie اسے پکڑتی ہے۔"

Nimbus کے لیے، Macie کی سب سے فوری قدر `nimbus-debug-exports` bucket پر تھی — ایک bucket جو developers debugging کے لیے data dump کرنے کے لیے استعمال کرتے تھے۔ Macie نے تین files ڈھونڈیں جن میں customer names اور delivery addresses کے ساتھ order histories تھیں۔ Payment data نہیں، لیکن ذاتی data جو ایک unencrypted development bucket میں نہیں ہونا چاہیے تھا۔

Files ہٹا دی گئیں۔ ایک policy شامل کی گئی: debug bucket صرف synthetic test data تک محدود تھی۔ حقیقی customer data کو production سے باہر کسی بھی environment میں export کرنے کے لیے Priya کی منظوری درکار تھی۔

"اس پر فی مہینہ کتنا خرچ آتا ہے؟" Tom نے پوچھا۔

Macie فی ماہ evaluate کی گئی S3 buckets کی تعداد اور scan کیے گئے data کے volume کی بنیاد پر چارج کرتی ہے۔ معتدل تعداد میں buckets والے ایک startup کے لیے، تقریباً $10-50 فی مہینہ۔ پہلے 30 دنوں کے لیے مفت۔

Tom نے اسے دوپہر کے کھانے سے پہلے فعال کر دیا۔

---

**AWS Security Hub: Dashboard**

اگر آپ متعدد AWS accounts چلا رہے ہیں یا security findings کا consolidated view چاہتے ہیں، تو **AWS Security Hub** GuardDuty، Inspector (vulnerability assessment)، Macie (data privacy)، Config، اور Firewall Manager سے findings کو ایک واحد dashboard میں aggregate کرتا ہے۔

یہ AWS Foundational Security Best Practices standard اور CIS AWS Foundations Benchmark کے خلاف آپ کی configuration بھی چیک کرتا ہے۔

Security Hub اس سوال کا جواب ہے کہ "میں پانچ مختلف consoles کے درمیان سوئچ کیے بغیر اپنی تمام security findings ایک جگہ کیسے دیکھوں؟" جب GuardDuty ایک finding generate کرتا ہے، یہ GuardDuty میں اور Security Hub میں ظاہر ہوتی ہے۔ جب Macie ایک S3 bucket میں sensitive data ڈھونڈتی ہے، یہ Macie میں اور Security Hub میں ظاہر ہوتی ہے۔ جب ایک Config rule ایک misconfiguration detect کرتی ہے، یہ Config میں اور Security Hub میں ظاہر ہوتی ہے۔

ایک single-account ٹیم کے لیے، Security Hub معمولی قدر شامل کرتا ہے — یہ چیک کرنے کے لیے ایک اور console ہے۔ اس کی طاقت پیمانے پر ابھرتی ہے: تین accounts، دس accounts، پچاس accounts۔ تمام accounts سے تمام findings ایک management account کے Security Hub میں aggregate ہوتی ہیں۔ ایک ٹیم ایک dashboard monitor کرتی ہے۔ alerts کا ایک set۔ کوئی account-by-account log چیکنگ نہیں۔

Nimbus کے لیے: Security Hub ابھی ضروری نہیں تھا۔ جب وہ تین accounts (dev، staging، production) تک بڑھتے، تو یہ ضروری ہو جاتا۔

"اسے ابھی سیٹ کریں،" Soo-Jin نے، اپنے تیسرے ہفتے میں، کہا۔ "اسے فعال کرنے میں پندرہ منٹ لگتے ہیں۔ یہ خواہش کرنے میں تین مہینے لگتے ہیں کہ کاش آپ نے اسے پہلے کر لیا ہوتا۔"

انہوں نے اسے فعال کر دیا۔

**Amazon Inspector: Vulnerability Assessment**

Macie فعال کرنے کے ایک ہفتے بعد، Nimbus production fleet میں چلنے والے OpenSSL کے ورژن کے لیے ایک CVE شائع ہوا۔ Priya نے کافی پر advisory پڑھا۔

"ہمیں جاننے کی ضرورت ہے کہ ہماری کون سی انسٹینسز متاثر ہیں،" اس نے کہا۔

"میں ایک manual scan چلا سکتا ہوں،" Leo نے کہا۔

"نو انسٹینسز کے لیے، ٹھیک۔ نوے کے لیے؟ Containers کے لیے؟" Priya نے Inspector console کھولا۔ "یہی Inspector کے لیے ہے۔"

**Amazon Inspector** ایک خودکار vulnerability assessment سروس ہے۔ جہاں GuardDuty رویہ دیکھتا ہے — آپ کا infrastructure ابھی کیا کر رہا ہے — Inspector دیکھتا ہے کہ کیا موجود ہے جو exploit ہو سکتا ہے۔

- **EC2 انسٹینسز:** Inspector operating system اور installed packages کو NVD (National Vulnerability Database) کے خلاف scan کرتا ہے — معلوم CVEs کا مستند catalog۔ اگر آپ OpenSSL 1.1.1 چلا رہے ہیں اور ایک CVE اس ورژن کو target کرتا ہے، تو Inspector اسے flag کرتا ہے۔
- **ECR container images:** Inspector Elastic Container Registry میں container images کو deploy ہونے سے پہلے scan کرتا ہے۔ ایک base image میں ایک vulnerable package container کے production میں کبھی چلنے سے پہلے ایک finding کے طور پر ظاہر ہوتا ہے۔
- **Lambda function packages:** Inspector آپ کے Lambda functions میں bundled dependencies کا تجزیہ کرتا ہے — Python packages، Node modules، Java dependencies — معلوم vulnerabilities کے لیے۔

ایک one-time scan سے اہم فرق: Inspector **مسلسل** چلتا ہے۔ یہ صرف آپ کی انسٹینسز کو ایک بار چیک نہیں کرتا جب آپ اسے فعال کریں اور انہیں صاف قرار دے دے۔ جب ایک نیا CVE شائع ہوتا ہے، تو Inspector خودبخود آپ کے موجودہ resources کا نئی vulnerability کے خلاف دوبارہ جائزہ لیتا ہے۔ جب ایک EC2 انسٹینس بدلتی ہے — نیا package install، AMI اپڈیٹ — تو Inspector اسے دوبارہ scan کرتا ہے۔ Priya کا EC2 fleet Inspector فعال کرنے کے منٹوں کے اندر OpenSSL CVE کے لیے flag ہو گیا، اس لیے نہیں کہ اس نے اسے scan کرنے کو کہا، بلکہ اس لیے کہ یہی وہ کرتا ہے۔

Findings severity-rated ہیں: Critical، High، Medium، Low، Informational۔ وہ GuardDuty اور Macie findings کے ساتھ Security Hub جاتی ہیں۔ ایک dashboard۔ تینوں lenses۔

"تین انسٹینسز متاثر،" Leo نے Inspector findings پڑھتے ہوئے کہا۔ "باقی چھ ایک patched ورژن پر ہیں۔"

"اس ہفتے ان تینوں کو patch کریں،" Priya نے کہا۔

"Container images کا کیا؟"

Priya نے Inspector ECR findings دیکھیں۔ ان کے container registry میں دو base images کی معلوم vulnerabilities تھیں — packages کے پرانے ورژن جو اس کے بعد patch ہو چکے تھے۔ اس نے انہیں rebuild کے لیے tag کیا۔

"اہم بات،" Priya نے کہا، "یہ ہے کہ ہم نے یہ exploit ہونے سے پہلے ڈھونڈ لیا۔ بعد میں نہیں۔"

**تین-Lens ماڈل**

GuardDuty، Inspector، اور Macie ہر ایک ایک مختلف چیز دیکھتے ہیں:

- **GuardDuty** behavioral ہے۔ یہ پوچھتا ہے: *ابھی کیا ہو رہا ہے جو غلط نظر آتا ہے؟* unexpected مقامات سے API calls، command-and-control servers سے رابطہ کرنے والی EC2 انسٹینسز، غیر معمول اوقات میں استعمال ہونے والی credentials۔ یہ فعال خطرات اور anomalies پکڑتا ہے۔
- **Inspector** structural ہے۔ یہ پوچھتا ہے: *ہمارے environment میں کیا موجود ہے جو exploit ہو سکتا ہے؟* Unpatched packages، vulnerable dependencies، outdated runtimes۔ یہ وہ حالات پکڑتا ہے جو حملوں کو ممکن بناتے ہیں۔
- **Macie** data کے بارے میں ہے۔ یہ پوچھتی ہے: *ہماری S3 buckets میں کون سی sensitive معلومات بیٹھی ہے جو وہاں نہیں ہونی چاہیے؟* PII، financial records، files میں چھوڑی گئی credentials۔ یہ وہ exposure پکڑتی ہے جو کوئی anomalous behavior پیدا نہیں کرتی — بس غلط جگہ پر data۔

ایک معلوم CVE پر مشتمل ایک compromise تینوں میں ظاہر ہو سکتا ہے: Inspector نے attack سے پہلے vulnerability کو flag کیا ہوتا۔ GuardDuty نے attack کے دوران anomalous behavior flag کیا ہوتا۔ Macie نے exfiltrated data کے S3 میں اترنے کے بعد اسے flag کیا ہوتا۔

تین مختلف lenses، تین مختلف وقت کے افق، ان میں سے کوئی دوسروں کا متبادل نہیں۔

**AWS Network Firewall: Traffic Inspector**

ٹول باکس بند ہونے سے پہلے ایک اور ماہر ذکر کا مستحق ہے۔ Security groups اور NACLs (باب ۱۵) ٹریفک کو IP، port، اور protocol کے ذریعے filter کرتے ہیں — وہ کہہ سکتے ہیں کہ *کون* *کس سے* بات کر سکتا ہے، لیکن وہ گفتگو کے اندر نہیں دیکھ سکتے۔ **AWS Network Firewall** ایک managed، stateful firewall ہے جسے آپ VPC کی سطح پر deploy کرتے ہیں۔ یہ deep packet inspection انجام دیتا ہے: domain name کے ذریعے filtering (outbound صرف `*.eatnimbus.com` اور آپ کے package repositories کو allow کریں)، intrusion signatures سے matching ٹریفک block کرنا (IDS/IPS، Suricata rules کے ساتھ compatible)، اور ان flows کا معائنہ کرنا جنہیں security groups بس گزرنے دیتے کیونکہ port number ٹھیک نظر آتا تھا۔

"تو یہ دماغ والا ایک security group ہے،" Leo نے کہا۔

"یہ وہ appliance ہے جو آپ ایک firewall وینڈر سے خریدتے،" Priya نے کہا، "سوائے managed، auto-scaling، اور اپنے subnet میں deploy کیے گئے کہ VPC کے اندر اور باہر تمام ٹریفک اس کے ذریعے route ہو۔"

امتحانی اشارے: "domain name یا payload کے ذریعے ٹریفک inspect یا filter کریں،" "ایک VPC کے لیے intrusion detection/prevention (IDS/IPS)،" یا "outbound traffic کے لیے centralized egress filtering" → Network Firewall۔ Security groups اور NACLs port اور IP کے ذریعے instance-level اور subnet-level allow/deny کا جواب ہیں؛ Network Firewall اس وقت کا جواب ہے جب سوال ٹریفک کے *اندر* inspection کا تقاضا کرے۔ اور جب سوال پوچھے کہ WAF rules، Shield Advanced، security groups، *اور* Network Firewall policies کو بہت سے accounts میں مستقل طور پر کیسے manage کریں — وہ **AWS Firewall Manager** ہے، اوپر policy administration layer۔

## خوبیاں اور حدود

**AWS Shield**:

- Standard: مفت اور خودکار — استعمال نہ کرنے کی کوئی وجہ نہیں
- Advanced: اعلیٰ profile targets کے لیے بہترین؛ چھوٹی ٹیموں کے لیے مہنگا
- Standard layer 3/4 attacks (SYN floods، UDP floods، DNS amplification) خودبخود absorb کرتا ہے
- Advanced layer 7 protection، real-time notifications، اور Shield Response Team شامل کرتا ہے

**AWS WAF**:

- Managed rule groups سیٹ اپ کو نمایاں طور پر آسان بناتے ہیں — چند clicks میں OWASP Top 10 protection
- Custom rules کے لیے HTTP attack patterns سمجھنا ضروری ہے
- Rate limiting ایک طاقتور خصوصیت ہے جو اکثر نظرانداز ہوتی ہے — scrapers اور brute force کے خلاف مؤثر
- WAF محفوظ application code کا متبادل نہیں — یہ ایک defense-in-depth layer ہے
- Count mode میں شروع کریں، validate کریں، پھر Block پر سوئچ کریں

**GuardDuty**:

- فعال کرنے کے لیے انتہائی کم محنت (چند clicks، 30-day free trial)
- Findings کے لیے انسانی review اور response ضروری ہے — GuardDuty detect کرتا ہے، یہ fix نہیں کرتا
- False positives ہوتے ہیں — کچھ legitimate activity ML models کو anomalous نظر آتی ہے
- Severity levels (Low/Medium/High) ردعمل کو ترجیح دینے میں مدد کرتے ہیں
- خودکار response workflows کے لیے Security Hub، EventBridge، اور Lambda کے ساتھ integrate ہوتا ہے

**Amazon Inspector**:

- مسلسل، خودکار vulnerability scanning — کوئی one-time check نہیں
- جب نئے CVEs شائع ہوں یا resources بدلیں تو خودبخود دوبارہ scan کرتا ہے
- EC2 انسٹینسز (OS اور application packages)، ECR container images، اور Lambda function packages کا احاطہ کرتا ہے
- Findings Security Hub جاتی ہیں؛ severity ratings patching کو ترجیح دینے میں مدد کرتی ہیں
- attacks block نہیں کرتا — یہ ان حالات کو سامنے لاتا ہے جو حملوں کو ممکن بناتے ہیں

**Amazon Macie**:

- S3 میں sensitive data (PII، credentials، financial data) خودبخود discover کرتی ہے
- وہ data exposure پکڑتی ہے جس کا کوئی anomalous behavior pattern نہیں — GuardDuty اسے چھوڑ دیتا
- 30-day free trial؛ اس کے بعد فی bucket فی ماہ ادائیگی
- بہت سی S3 buckets اور مختلف sensitivity levels والی ٹیموں کے لیے سب سے قیمتی

**AWS Security Hub**:

- GuardDuty، Macie، Inspector، Config، اور Firewall Manager سے findings aggregate کرتا ہے
- security benchmarks (CIS، NIST، PCI-DSS) کے خلاف configuration چیک کرتا ہے
- multi-account پیمانے پر سب سے قیمتی
- جلدی فعال کریں، چاہے آپ کے پاس صرف ایک account ہو — findings history مجموعی ہوتی ہے

## خلاصہ

پانچ سروسز، پانچ layers۔ ہر ایک ایک مختلف قسم کے خطرے کو address کرتی ہے — اور ان میں سے کوئی دوسروں کا متبادل نہیں۔ ایک DDoS attack WAF اور GuardDuty کو bypass کرتا ہے۔ ایک SQL injection کی کوشش Shield کو bypass کرتی ہے۔ آہستہ اور احتیاط سے استعمال ہونے والی ایک compromised credential Shield اور WAF کو مکمل طور پر bypass کر سکتی ہے — لیکن GuardDuty anomaly دیکھے گا۔ ایک developer جو حادثاتی طور پر customer PII کو ایک debug S3 bucket پر اپ لوڈ کرتا ہے تینوں کو bypass کرتا ہے — لیکن Macie اسے پکڑتی ہے۔

- **AWS Shield Standard**: مفت، خودکار DDoS protection layer 3/4 پر۔ ہمیشہ on۔ 50 Gbps SYN flood کو Nimbus لوڈ بیلنسر تک پہنچنے سے پہلے absorb کر لیا۔
- **AWS Shield Advanced**: Premium DDoS protection SRT رسائی اور cost protection کے ساتھ۔ Enterprise استعمال کا کیس۔
- **AWS WAF**: Application-layer firewall۔ HTTP requests کا معائنہ اور filter کریں۔ CloudFront، ALB، یا API Gateway سے attach کریں۔ OWASP Top 10 protection کے لیے Managed Rule Groups استعمال کریں۔ Scraper دفاع کے لیے rate-based rules۔
- **Amazon GuardDuty**: Behavioral threat detection۔ بنیادی data sources: CloudTrail events، VPC Flow Logs، اور DNS logs۔ اختیاری توسیعی protections S3 events، EKS/ECS runtime monitoring، RDS login events، اور Lambda network activity شامل کرتے ہیں۔ anomalous activity کے لیے categorized findings generate کرتا ہے۔ پانچ اہم finding اقسام: UnauthorizedAccess (console login)، CryptoCurrency (mining)، Recon (port probe)، Trojan (C2 traffic)، Policy (S3 misconfiguration)۔
- **Amazon Inspector**: خودکار vulnerability assessment۔ معلوم CVEs کے لیے EC2 انسٹینسز، ECR container images، اور Lambda function packages scan کرتا ہے۔ مسلسل چلتا ہے اور جب نئی vulnerabilities شائع ہوں تو دوبارہ جائزہ لیتا ہے۔ Findings Security Hub جاتی ہیں۔
- **Amazon Macie**: S3 میں sensitive data discovery۔ PII، credentials، اور financial data detect کرتی ہے۔ وہ exposure پکڑتی ہے جس کا کوئی anomalous behavior pattern نہیں۔
- **AWS Security Hub**: تمام security سروسز سے findings کو ایک dashboard میں aggregate کرتا ہے۔ متعدد accounts میں centralized monitoring ممکن بناتا ہے۔
- **CloudTrail**: تمام AWS security logging کی بنیاد۔ Long-term retention کے لیے S3 پر لکھتی ایک trail فعال کریں۔ ہر security سروس اس سے پڑھتی ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں (ڈومین ۱، ٹاسک ۱.۲)*

- **Shield Standard بمقابلہ Advanced**: Standard مفت اور خودکار ہے۔ Advanced پیسے لیتا ہے اور SRT، cost protection، اور بہتر detection شامل کرتا ہے۔ Advanced کے لیے امتحانی اشارے: "بڑے پیمانے پر DDoS،" "attacks کے دوران SLA guarantee،" "DDoS-related cost spikes کے خلاف financial protection۔"
- **WAF استعمال کے کیس کے اشارے**: "SQL injection block کریں،" "cross-site scripting block کریں،" "API calls rate limit کریں،" "مخصوص user-agents block کریں،" "OWASP Top 10 protection" → WAF۔
- **GuardDuty اشارے**: "غیر معمول API activity detect کریں،" "compromised credentials شناخت کریں،" "anomalous EC2 نیٹ ورک connections flag کریں،" "threat intelligence" → GuardDuty۔
- **WAF attachment**: CloudFront (global)، ALB (regional)، API Gateway (regional)، AppSync سے attach ہو سکتا ہے۔
- **GuardDuty data sources**: تین بنیادی ذرائع — CloudTrail events، VPC Flow Logs، DNS logs۔ توسیعی اختیاری ذرائع میں S3 data events، EKS audit logs، RDS login events، Lambda network activity، اور ECS runtime شامل ہیں۔ امتحان پوچھ سکتا ہے کہ کون سا data source کسی مخصوص detection منظر نامے سے متعلق ہے: "anomalous RDS logins" → GuardDuty RDS Protection؛ "container runtime threats" → GuardDuty EKS/ECS Runtime Monitoring۔
- **Macie بمقابلہ GuardDuty**: یہ ایک عام امتحانی distractor ہے۔ **Macie** S3 میں sensitive data (PII، credentials، financial data) detect کرنے کے لیے ML استعمال کرتی ہے۔ **GuardDuty** رویے میں threats اور anomalies detect کرتا ہے۔ Macie مواد کے بارے میں ہے۔ GuardDuty رویے کے بارے میں ہے۔
- **Inspector بمقابلہ GuardDuty بمقابلہ Macie:** تین مختلف lenses، کوئی دوسروں کا متبادل نہیں۔ **Inspector** = vulnerability scanning — EC2 انسٹینسز، ECR میں container images، اور Lambda function packages پر CVEs۔ مسلسل چلتا ہے اور جب نئے CVEs شائع ہوں تو دوبارہ scan کرتا ہے۔ **GuardDuty** = behavioral threat detection — ابھی کیا ہو رہا ہے جو anomalous نظر آتا ہے۔ **Macie** = S3 میں sensitive data discovery — PII، credentials، اور financial data جو وہاں نہیں ہونا چاہیے۔ امتحانی trigger: "EC2 پر unpatched vulnerabilities شناخت کریں" یا "CVEs کے لیے container images scan کریں" → Inspector۔ "غیر معمول API calls یا compromised credentials detect کریں" → GuardDuty۔ "S3 میں PII یا sensitive data ڈھونڈیں" → Macie۔
- **Security Hub**: متعدد سروسز اور accounts سے security findings aggregate کرتا ہے۔ امتحانی منظر نامہ: "کمپنی کے متعدد AWS accounts ہیں اور تمام security findings کا ایک واحد view چاہتی ہے" → Security Hub۔
- **WAF میں rate-based rules**: ایک وقت کی کھڑکی میں فی IP requests محدود کرنے کے لیے استعمال۔ Core Rule Set (جو attack patterns پر match کرتا ہے) سے مختلف۔ امتحان rate-based rules کو "brute force login کی کوششیں روکیں" یا "scraping کم کریں" کے لیے استعمال کرتا ہے۔
- **CloudTrail + GuardDuty + Security Hub**: یہ تینوں مل کر AWS security observability کا core بناتے ہیں۔ پہلے CloudTrail فعال کریں (GuardDuty اور Security Hub اس پر منحصر ہیں)، پھر GuardDuty، پھر findings aggregate کرنے کے لیے Security Hub۔

## مشقیں

**مشق ۱ — یادداشت**

AWS WAF اور Amazon GuardDuty کے درمیان فرق بیان کریں۔ ہر سروس کس سے بچاتی ہے، اور ہر سروس کس layer پر کام کرتی ہے؟

*(اشارہ: WAF کو incoming requests پر ایک filter کے طور پر اور GuardDuty کو آپ کے logs دیکھنے والے ایک behavioral analyst کے طور پر سوچیں۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک retail کمپنی کی ویب سائٹ ایک botnet سے target ہو رہی ہے جو ان کے product search API کو فی گھنٹہ لاکھوں requests بھیج رہی ہے۔ Requests legitimate نظر آتی ہیں (valid User-Agent strings، valid session cookies) لیکن خریداریوں کا نتیجہ نہیں — وہ product prices scrape کر رہے ہیں۔ Attack legitimate customers کو slow response times کا تجربہ کرا رہا ہے۔

کون سی سروسز کا مجموعہ اس خطرے کو بہترین طریقے سے address کرتا ہے؟

A) Rate limiting rules اور CloudFront کے ساتھ AWS WAF  
B) AWS Shield Advanced اور CloudFront  
C) Amazon GuardDuty اور AWS Shield Standard  
D) Botnet کی IP ranges block کرنے والے Network ACLs

**اشارہ ۱**: Requests HTTP-level (application layer) ہیں۔ کون سی سروس HTTP layer پر کام کرتی ہے؟

**اشارہ ۲**: Botnets بہت سارے مختلف IP پتے استعمال کرتے ہیں — NACL کی سطح پر مخصوص IP ranges block کرنا بڑے botnets کے خلاف غیر مؤثر ہے۔

**اشارہ ۳**: IP پتے کے مطابق requests rate limit کرنا scraping کو سست کر سکتا ہے چاہے آپ اسے مکمل طور پر block نہ کر سکیں۔

**جواب**: A

**وضاحت**: AWS WAF فی IP address requests rate limit کر سکتا ہے، کسی بھی واحد ذریعے سے اعلیٰ volume scraping کے اثر کو کم کرتا ہے۔ CloudFront AWS کے edge نیٹ ورک میں آنے والی ٹریفک کو distribute کرتا ہے، volume کو absorb کرتا ہے اور origin کی حفاظت کرتا ہے۔ WAF rules request patterns (ایک ہی API endpoint پر rapid sequential requests) پر بھی match کر سکتے ہیں scraping behavior شناخت کرنے کے لیے۔

**B کیوں نہیں؟** Shield Advanced DDoS floods (layer 3/4) کے خلاف بچاتا ہے۔ منظر نامہ application-layer scraping (layer 7 HTTP requests) بیان کرتا ہے، جسے Shield inspect نہیں کرتا۔

**C کیوں نہیں؟** GuardDuty آپ کے AWS account کے رویے میں anomalies detect کرتا ہے — یہ incoming HTTP requests block نہیں کرتا۔ Shield Standard application-layer attacks نہیں سنبھالتا۔

**D کیوں نہیں؟** بڑے botnets distributed sources سے ہزاروں IP پتے استعمال کرتے ہیں۔ مخصوص ranges block کرنا ایک whack-a-mole approach ہے جو sophisticated botnets کے خلاف ناکام رہتا ہے۔

*SAA-C03 ڈومین: محفوظ آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۱.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus credit card data سنبھالنے کی تیاری کرتے ہوئے اپنے threat model پر غور کر رہا ہے۔ ایک PCI-DSS compliance review مانگتی ہے:

- Network-layer DDoS attacks سے تحفظ
- معلوم web exploits کے لیے Application-layer filtering
- تمام API calls کا ایک tamper-evident، long-term store میں logging
- Payment سروس میں غیر معمول رسائی patterns کا detection

ہر ضرورت کو ایک مخصوص AWS سروس یا configuration سے map کریں۔ کیا Shield Standard کافی ہے، یا PCI-DSS context Advanced تجویز کرتا ہے؟ آپ WAF کہاں attach کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد compliance ضروریات کو AWS سروسز سے map کرنے کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

GuardDuty فعال ہو گئی۔

48 گھنٹے بعد، اس نے اپنی پہلی finding generate کی: *"EC2 Instance i-0abc123 ایک معلوم Tor exit node سے بات کر رہا ہے۔"*

Leo نے instance ID دیکھا۔

"یہ internal monitoring instance ہے،" اس نے کہا۔ "جو میں نے network diagnostics چلانے کے لیے سیٹ اپ کیا۔"

"کیا اسے Tor exit nodes سے بات کرنی چاہیے؟"

"نہیں۔" اس نے وقفہ کیا۔ "یہ کیوں کرتا؟"

اس نے instance کھولا۔ کسی نے اس پر ایک ٹول install کیا تھا — ایک legitimate open-source network scanner جو، یہ پتہ چلا، anonymized data collection کے لیے Tor infrastructure سے بھی بات کرتا تھا۔

"تو ٹول گھر call کر رہا تھا،" Priya نے کہا۔

"میری معلومات کے بغیر،" Leo نے تصدیق کی۔

"یہ ایک supply chain risk ہے۔ ایک dependency جو وہ کام کرتی ہے جو آپ نے authorize نہیں کیا۔"

Leo نے ٹول uninstall کیا۔ اس نے installation سے پہلے ہر third-party ٹول review کرنے کا ایک process سیٹ اپ کیا۔

"کیا ہم اب اس سطح کے paranoia پر ہیں؟" Maya نے پوچھا۔

"ہاں،" Priya نے کہا۔

"کیا ہمیں ہمیشہ اس سطح پر ہونا چاہیے تھا؟" Maya نے پوچھا۔

"یہ بھی ہاں،" Priya نے کہا۔

اگلے باب میں: کیا ہوتا ہے جب Oregon کا data center غائب ہو جاتا ہے — اور Nimbus کیوں چلتا رہتا ہے۔
