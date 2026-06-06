# باب ۳۰: پوشیدہ لاگت

Tom کے پاس meeting room میں تین columns والا ایک whiteboard تھا: compute، storage، networking۔ پہلے دو بھرے ہوئے تھے — اعداد، تاریخیں، مکمل کی گئی optimizations کے نام۔ تیسرے column میں کچھ بھی لکھنے سے پہلے وہ ایک لمحے کے لیے whiteboard پر کھڑا رہا۔ AWS bill پر networking کی lines صفحے پر اس طرح بکھری ہوئی تھیں جیسے باقی نہیں تھیں۔ ہر ایک کا ایک مختلف نام تھا، ایک مختلف اکائی، ایک مختلف جواز اس بات کا کہ پیسہ کیوں جا رہا تھا۔

اس نے marker کا ڈھکنا کھولا۔

**خلاصۂ ماضی: bill پر آخری نامعلوم**

Database audit نے وہ آخری بڑی line item بند کر دی تھی جس پر Tom فعال طور پر کام کر رہا تھا — $491/month بازیافت، $5,892 فی سال۔ EC2 Savings Plans، S3 lifecycle policies، اور storage cleanup شامل کریں، اور رواں کل تین ماہ کے کام میں سالانہ بچت میں $34,092 تھا۔ لیکن Tom نے، database کی گہری جانچ کے دوران، notice کیا تھا کہ ایک category کی بمشکل ہی جانچ ہوئی تھی۔ Storage costs ایک line کے طور پر ظاہر ہوتی تھیں: "S3: $198۔" Compute costs ایک line کے طور پر ظاہر ہوتی تھیں: "EC2: $2,340" — باب ۲۷ کے Savings Plan discounts اترنے سے پہلے۔ Networking costs ایک درجن entries میں بکھری ہوئی تھیں جن کے نام "Data Transfer Out،" "NAT Gateway Processing،" "VPC Peering Data Transfer،" اور "CloudFront Data Transfer" تھے۔ اس نے کبھی انہیں جمع کر کے مجموعے کو نہیں دیکھا تھا۔ یہ آج کا کام تھا۔

Tom نے bill کھولا۔ Data transfer section تلاش کیا۔ تمام line items کو جمع کیا۔

AWS میں networking costs ایک شہر کے toll نظام کی طرح ہیں: شہر میں گاڑی چلانا مفت ہے، لیکن آپ جو بھی tunnel باہر کی طرف لیتے ہیں اس پر پیسہ لگتا ہے، اور محلوں کے درمیان گاڑی چلانے پر بھی تھوڑا لگتا ہے۔ زیادہ تر لوگ tolls کے بارے میں اس وقت تک نہیں سوچتے جب تک انہیں مہینے کے آخر میں bill نہ ملے اور انہیں احساس نہ ہو کہ وہ ہر روز tunnel لے رہے تھے جبکہ پورا وقت ایک مفت سطحی سڑک موجود تھی۔ اس باب کا مقصد ہر toll booth کو سمجھنا ہے — اور یہ فیصلہ کرنا کہ کون سے ادا کرنے کے قابل ہیں۔

$847/month۔

"ہم data transfer پر $847 فی مہینہ خرچ کر رہے ہیں،" اس نے کہا۔

"کیا یہ بہت زیادہ ہے؟" Leo نے پوچھا۔

"یہ بالکل اتنا ہی ہے جتنا optimize کرنے سے پہلے ہمارا S3 bill تھا۔ اور مجھے تو معلوم بھی نہیں تھا کہ ہمارا اس سائز کا data transfer bill ہے۔"

Maya نے دیکھا۔ "data transfer بالکل کیا ہے؟"

"یہ وہ ہے جو AWS bytes کو ادھر ادھر منتقل کرنے کے لیے charge کرتا ہے۔ AWS میں آنے والے bytes: عام طور پر مفت۔ AWS سے انٹرنیٹ کی طرف جانے والے bytes: charged۔ مختلف regions میں services کے درمیان bytes: charged۔ NAT Gateway سے گزرنے والے bytes: charged۔"

"کیا آپ اسے توڑ کر بتا سکتے ہیں؟"

Tom بتا سکتا تھا۔ لیکن اس بار وہ billing console پر نہیں رکا۔ اس نے اپنے تمام VPCs پر VPC Flow Logs enable کیں اور انہیں CloudWatch Logs Insights میں ڈالا۔ اس سے وہ اصل traffic flows کو query کر سکتا تھا — صرف ڈالر کی رقمیں نہیں، بلکہ کون سے sources data کہاں بھیج رہے تھے، اور کتنا۔

Query کو چلنے میں دو منٹ لگے۔ ایک اور log source کے ساتھ مل کر جو وہ جلد ہی کھینچنے والا تھا، output اتنی مخصوص تھی کہ اس پر عمل کیا جا سکے۔

**Traffic Analysis: bill کو اصل میں کیا پیدا کر رہا ہے**

volume کے لحاظ سے سرفہرست پانچ traffic flows، ترتیب سے:

1. EC2 application servers → NAT Gateway → AWS services (SSM، Secrets Manager، CloudWatch، SQS): 3.9TB/month
2. EC2 application servers → NAT Gateway → external APIs: 1.3TB/month
3. Aurora reader endpoint → EC2 application servers (cross-AZ): 0.4TB/month
4. Analytics pipeline → us-east-1 میں S3 bucket (cross-region): 0.3TB/month
5. CloudFront → S3 origin (cache misses): 0.2TB/month

پہلے چار سیدھے Flow Logs سے نکلے۔ پانچواں نہیں نکل سکتا تھا: VPC Flow Logs صرف وہ traffic دیکھتی ہیں جو آپ کے VPCs کے اندر network interfaces عبور کرتا ہے، اور S3 سے fetch کرنے والی ایک CloudFront cache miss کبھی VPC کو چھوتی ہی نہیں — یہ CloudFront کا براہ راست S3 سے بات کرنا ہے۔ اس flow کے لیے، Tom نے CloudFront کے standard access logs کھینچے اور `x-edge-result-type` field پر filter کیا: ہر entry جو `Miss` کے طور پر نشان زدہ ہے ایک ایسی request ہے جسے CloudFront کو origin سے fetch کرنا پڑا، اور bytes کو جمع کرنے سے اسے 0.2TB ملا۔ ایک bill، دو آلات — ہر ایک اس سے اندھا جو دوسرا دیکھتا ہے۔

"Flow نمبر چار،" Priya نے کہا۔ "ہمارا analytics pipeline us-east-1 میں ایک bucket سے بات کیوں کر رہا ہے؟"

Leo کے چہرے پر ایک تاثر تھا جسے Tom نے پہچان لیا۔

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ،" Leo نے کہا۔ "چھ ماہ پہلے میں test کر رہا تھا کہ آیا ہمارا analytics pipeline متعدد regions میں متوازی طور پر پھیل سکتا ہے۔ میں نے us-east-1 میں ایک test bucket بنایا، pipeline کو اس کی طرف اشارہ کیا، اور اسے ایک ہفتے چلایا۔ Test ختم ہو گیا لیکن میں pipeline config سے us-east-1 destination ہٹانا بھول گیا۔"

"تو پانچ ماہ سے،" Tom نے کہا، "ہم ہر analytics نتیجے کی ایک copy Virginia میں ایک bucket میں لکھ رہے ہیں۔"

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے پوچھا۔

us-west-2 سے us-east-1 تک cross-region transfer: $0.02/GB۔ 300GB/month = transfer کے لیے $6/month۔ علاوہ ازیں us-east-1 میں duplicate data کے لیے S3 storage: 300GB × 5 ماہ × $0.023/GB = stored data میں $34.50۔

"بہت زیادہ نہیں،" Leo نے کہا۔

"فی مہینہ بہت زیادہ نہیں،" Tom نے کہا۔ "لیکن یہ پانچ ماہ سے چل رہا ہے اور کسی کو معلوم نہیں تھا۔ یہ غیر ارادی لاگت ہے۔ سوال یہ نہیں ہے کہ آیا $6 اہم ہے — یہ ہے کہ آیا ہم جانتے ہیں کہ ہر ڈالر کیوں خرچ ہو رہا ہے۔"

Leo نے us-east-1 test bucket delete کر دیا اور pipeline configuration سے destination ہٹا دیا۔

flow log output میں سب سے زیادہ قابل عمل finding flow نمبر ایک تھی: EC2 application servers جو NAT Gateway کے ذریعے AWS services کو call کر رہے تھے۔

Tom نے CloudWatch Logs Insights query کے لیے مخصوص log entries کھینچیں، صرف AWS service IP ranges کے لیے مقدر traffic دکھانے کے لیے filter کیں:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

Output نے ایسی چیز دکھائی جس کی اسے توقع نہیں تھی: تقریباً 300 GB فی مہینہ same-region S3 traffic — Leo کے us-east-1 bucket تک cross-region flow سے الگ — NAT Gateway سے گزر رہا تھا۔ لیکن Tom نے مہینوں پہلے ہی S3 Gateway Endpoints configure کیے تھے۔

"ہمارے پاس ایک S3 Gateway Endpoint ہے،" Leo نے کہا۔ "S3 traffic ابھی بھی NAT سے کیوں جا رہا ہے؟"

Tom نے route table دیکھی۔ Gateway Endpoint configured تھا — لیکن صرف application VPC کے لیے۔ Analytics pipeline ایک علیحدہ VPC میں چلتی تھی جو data isolation کے لیے نو ماہ پہلے بنایا گیا تھا۔ اس VPC میں کوئی S3 Gateway Endpoint نہیں تھا۔ Analytics pipeline کی EC2 instances سے ہر S3 call اس VPC کے NAT Gateway سے گزرتی تھی۔

"0.3TB analytics pipeline traffic × $0.045/GB = $13.50/month،" Tom نے کہا۔ "صرف دوسرے VPC میں غائب endpoint سے۔"

"endpoint شامل کرنے کی کیا لاگت ہوگی؟" Leo نے پوچھا۔

"صفر،" Tom نے کہا۔ "S3 Gateway Endpoints مفت ہیں۔ یہ ایک route table entry ہے۔"

Analytics VPC میں Gateway Endpoint شامل کرنے میں چار منٹ لگیں گے اور ماہانہ NAT Gateway charge سے $13.50 کم ہو جائیں گے — ایک چھوٹا مطلق عدد، لیکن finding اصول تھا۔ انہوں نے ایک VPC میں ایک cost control شامل کیا تھا اور دوسرا بناتے وقت اسے نقل کرنا بھول گئے تھے۔ مستقل مزاجی کے لیے عمل درکار تھا، صرف علم نہیں۔

Tom نے deployment checklist میں شامل کیا: ایک نیا VPC بناتے وقت، کوئی بھی workloads attach کرنے سے پہلے S3 اور DynamoDB Gateway Endpoints شامل کریں۔

flow logs سے دوسری مخصوص finding زیادہ مہنگی تھی۔ ان Lambda functions سے traffic جو order notification system چلاتے تھے — restaurant configuration files پڑھنے کے لیے S3 access — S3 endpoint کے بجائے NAT Gateway سے جا رہی تھی۔ Lambda functions VPC کے اندر چلتے تھے (RDS access کے لیے)، اور VPC کا S3 endpoint صرف application subnet میں EC2 instances کے لیے configured تھا۔ Lambda subnet میں Lambda functions NAT سے گزر رہے تھے۔

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا۔ "ہمارے پاس endpoint ہے۔ Lambda اسے کیوں استعمال نہیں کر رہا؟"

"VPC Gateway Endpoints route tables کی بنیاد پر فی subnet لاگو ہوتے ہیں،" Tom نے کہا۔ "Lambda functions اپنی route table کے ساتھ اپنے subnet میں ہیں۔ اس route table میں endpoint route نہیں تھا۔ میں نے اسے application subnet کے لیے شامل کیا۔ میں Lambda subnet چھوڑ گیا۔"

Lambda subnet route table میں S3 endpoint route شامل کرنے سے NAT Gateway processing fees میں مزید $41/month بچیں گے جو ان S3 calls کے لیے charge کر رہے تھے جنہیں مفت ہونا چاہیے تھا۔

flow log analysis نے اپنی قیمت پوری کر لی تھی۔ تین گھنٹے کا query time، تین ٹھوس findings: بھولا ہوا analytics VPC endpoint ($13.50/month)، Lambda subnet routing gap ($41/month)، اور وہ اصل بڑی finding جو Interface Endpoint کے فیصلوں کی بنیاد بنی۔ flow log analysis سے شناخت کردہ کل اضافی ماہانہ بچت: $54.50، Interface Endpoints سے اس $78 کے اوپر جو analysis نے پہلے ہی سامنے لائی تھی۔ وہ دو چھوٹی fixes اگلے sprint کے لیے backlog پر گئیں؛ اس باب کے آخر میں savings table صرف اس کو شمار کرتی ہے جو ship ہوا۔

"سبق یہ ہے کہ VPC endpoints ایک بار کی configuration نہیں ہیں،" Tom نے کہا۔ "ہر نیا VPC، ہر نیا subnet، ہر نیا workload type اسی check کا تقاضا کرتا ہے۔ private subnet میں کسی بھی چیز کے لیے default NAT سے گزرنا ہے۔ Check یہ ہے: کیا یہ workload S3، DynamoDB، یا کسی بھی high-traffic AWS service کو call کرتا ہے؟ اگر ہاں، تو کیا اس کے پاس ایک endpoint route ہے؟"

"کیا ہم نے اس check کو خودکار کرنے کے بارے میں سوچا ہے؟" Priya نے پوچھا۔ "ایک AWS Config rule جو alert کرے جب ایک private subnet S3 endpoint route کے بغیر بنایا جائے؟"

"یہ فہرست پر ہے،" Tom نے کہا۔ "orphaned volume alert کے فوراً بعد۔"


اور اس کے ساتھ، Tom کے پاس اس سوال کا جواب تھا جس نے analysis شروع کیا تھا۔ Networking costs ایک واحد مسئلہ نہیں تھیں۔ وہ پانچ مختلف مسائل تھے، ہر ایک ایک مختلف حل کے ساتھ۔

**AWS Data Transfer کے لیے کیسے Charge کرتا ہے**

AWS کی data transfer pricing غیر متناسب ہے:

**AWS میں (inbound)**: مفت۔ آپ جتنا چاہیں data upload کر سکتے ہیں۔

**AWS سے انٹرنیٹ کی طرف (outbound)**: Charged۔ پہلی 100GB/month مفت۔ اس کے بعد:

- پہلی 10TB/month کے لیے $0.09/GB (US regions)
- اگلی 40TB کے لیے $0.085/GB
- زیادہ volumes پر کم

**ایک ہی Availability Zone کے اندر**: مفت۔ ایک ہی AZ میں ایک دوسرے سے بات کرنے والی EC2 instances کچھ ادا نہیں کرتیں۔

**Availability Zones کے درمیان (ایک ہی region)**: ہر سمت میں $0.01/GB۔ ایک چھوٹی لیکن حقیقی لاگت۔

**Regions کے درمیان**: regions کے لحاظ سے $0.02-0.08/GB۔ Cross-region traffic نمایاں طور پر زیادہ مہنگا ہے۔

**NAT Gateway**: $0.045/GB processed۔ ہر byte جو آپ کی private EC2 instance انٹرنیٹ تک پہنچنے کے لیے NAT Gateway سے بھیجتی ہے — اور ہر byte جو واپس آتا ہے — charged ہے۔

**CloudFront**: براہ راست AWS-سے-انٹرنیٹ کے مقابلے میں کم data transfer rates۔ پہلی 10TB کے لیے $0.085/GB (براہ راست data transfer out سے قدرے کم)۔ CloudFront اکثر کل transfer costs کم کر دیتا ہے کیونکہ اس کی edge caching کا مطلب ہے کہ origin کم اکثر data serve کرتا ہے۔

**Tom کا تجزیہ**

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے باری باری ہر line item کے لیے پوچھا۔ اس نے انہیں spreadsheet میں ایک علیحدہ tab میں شامل کیا — ماہانہ کل نہیں، بلکہ ہر category الگ الگ توڑی گئی۔ کل، یہ سمجھنے سے کم مفید تھا کہ bill کا کون سا حصہ کس قسم کی لاگت تھا۔

ہر line item کی درجہ بندی کرنے کے بعد:

**انٹرنیٹ کی طرف outbound data**: $214/month

- دنیا بھر میں customers کو API responses
- وہ assets جو ابھی بھی S3 اور ALB سے سیدھے clients کو serve ہوتے ہیں، CloudFront کو نظر انداز کرتے ہوئے (cache fills خود — CloudFront کا ایک AWS origin سے fetch کرنا — مفت ہیں: AWS origin-to-CloudFront transfer معاف کر دیتا ہے)

**NAT Gateway processing**: $289/month

- external APIs کو call کرنے والے application servers (payment processor، email service، map data)
- NAT Gateway سے گزرنے والی DynamoDB calls (کچھ tables کے لیے VPC endpoints قائم ہونے سے پہلے)

**Cross-AZ data transfer**: $178/month

- Load balancer سے EC2 instances تک (load balancer ایک AZ میں ہے، کچھ instances دوسرے میں)
- Application server سے RDS read replica تک (ایک مختلف AZ میں)

**Cross-region data transfer**: $166/month

- Aurora Global Database replication (primary us-west-2 میں، reader us-east-1 میں)
- backups کے لیے S3 Cross-Region Replication
- Leo کا بھولا ہوا test pipeline (اس کل کا $6/month)

**NAT Gateway: سب سے بڑی حیرانی**

NAT Gateway processing fees میں $289/month سب سے بڑی چیز تھی۔ اور VPC Flow Log analysis نے اسے مخصوص بنا دیا تھا: سب سے بڑا صارف application servers تھے جو NAT Gateway کے ذریعے AWS service APIs (SSM، Secrets Manager، CloudWatch Logs) کو call کر رہے تھے۔

باب ۱۱ میں، Tom نے S3 اور DynamoDB کے لیے VPC Gateway Endpoints قائم کیے تھے۔ یہ مفت تھے۔ لیکن وہ کئی دوسری services کے لیے Interface Endpoints قائم کرنا بھول گیا تھا:

- patch management کے لیے Systems Manager (SSM)
- credential retrieval کے لیے Secrets Manager
- metric اور log shipping کے لیے CloudWatch
- message polling کے لیے SQS

private EC2 instances سے ان services کو ہر call NAT Gateway سے گزر رہی تھی۔ ہر call $0.045/GB charge کرتی تھی۔

آپ شاید سوچ رہے ہوں کہ AWS NAT Gateway سے گزرنے والے traffic کے لیے charge کیوں کرتا ہے جب آپ پہلے ہی AWS کے network کے اندر ہیں۔ جواب یہ ہے کہ NAT Gateway خود ایک managed service ہے — اسے چلانے میں پیسہ لگتا ہے، اور AWS وہ لاگت فی gigabyte منتقل کر دیتا ہے۔ VPC Endpoints بیچ والے کو ختم کر دیتے ہیں، یہی وجہ ہے کہ وہ bill کم کرتے ہیں۔

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا، جب Tom نے اعداد دکھائے۔ "ہم نے S3 اور DynamoDB کے لیے Gateway Endpoints قائم کیے۔ ہم نے SSM اور CloudWatch کے لیے وہی کیوں نہیں کیا؟"

"Gateway Endpoints صرف S3 اور DynamoDB کے لیے دستیاب ہیں،" Tom نے کہا۔ "باقی ہر چیز کے لیے — SSM، Secrets Manager، SQS — آپ کو Interface Endpoints چاہئیں۔ وہ مفت نہیں ہیں، لیکن جس volume پر ہم پیدا کر رہے ہیں اس پر NAT سے گزرنے سے سستے ہیں۔"

ان services کے لیے **Interface Endpoints**: $0.01/hour فی AZ + $0.01/GB data processed۔

Nimbus کے volume پر، SSM Interface Endpoint تقریباً $25/month لاگت آتا (hourly charges جمع per-GB processing) اور NAT Gateway charges میں تقریباً $45/month بچاتا (کیونکہ SSM، patch management اور parameter store calls کے لیے نمایاں data volume پیدا کرتا ہے)۔

Endpoint کی لاگتیں اور بچتیں service اور volume کے لحاظ سے مختلف تھیں۔ Tom نے حساب کیا کہ چار high-traffic services کے لیے Interface Endpoints قائم کرنا — ہر ایک دو AZs، جمع 3.9TB پر $0.01/GB processing جو وہ لے جائیں گے — کل تقریباً $97/month لاگت آتا اور NAT Gateway processing میں تقریباً $176/month بچاتا۔

خالص بچت: صرف endpoint setup سے $78/month۔

"اور اگر کوئی break in کرنے کی کوشش کرے؟" Priya نے کہا، جب VPC endpoint کی گفتگو implementation کی طرف مڑی۔ "VPC endpoint کا مطلب ہے کہ traffic کبھی public internet کو نہیں چھوتا — یہ صرف لاگت نہیں، یہ threat surface میں کمی ہے۔ ہمیں یہ صرف security کے فائدے کے لیے ہی کرنا چاہیے تھا۔"

"متفق،" Tom نے کہا۔ "cost savings ایک bonus ہیں۔"

Leo نے ان services کی فہرست دیکھی جو NAT سے گزر رہی تھیں۔ "میں نے شاید CloudWatch logging endpoints یہ چیک کیے بغیر قائم کیے کہ آیا اس کے لیے کوئی VPC endpoint تھا،" اس نے کہا۔ "ابھی کے لیے یہ ٹھیک رہے گا — لیکن ہاں، یہ چھ ماہ سے NAT سے گزر رہا ہے۔"

"یہ فہرست پر ہے،" Tom نے کہا۔ "CloudWatch ان چار میں سے ایک ہے جنہیں ہم ٹھیک کر رہے ہیں۔"

**PrivateLink کا حساب: یہ کب معقول ہوتا ہے**

اس گفتگو کا ایک زیادہ پیچیدہ ورژن ہے جو architectures کے بڑھنے کے ساتھ سامنے آتا ہے: دوسرے AWS customers (یا دوسرے VPCs میں آپ کی اپنی services) کی hosted services کو private connectivity فراہم کرنے کے لیے AWS PrivateLink استعمال کرنا۔

PrivateLink Interface Endpoints کی لاگت $0.01/hour فی AZ جمع $0.01/GB ہے۔ ایک ایسی service کے لیے جو endpoint کے ذریعے 1TB/month traffic پیدا کرتی ہے:

- PrivateLink لاگت: $0.01 × 2 AZs × 730 گھنٹے + $0.01 × 1,000GB = $14.60 + $10 = $24.60/month
- اس کے بجائے وہی traffic موجودہ NAT Gateway سے route کرنا: $0.045 × 1,000GB = $45/month کے اضافی processing charges

موازنہ *اضافی* ہے، کیونکہ NAT Gateway دونوں صورتوں میں قائم رہتا ہے — یہ ابھی بھی باقی انٹرنیٹ کی طرف جانے والے traffic کو serve کرتا ہے، تو جب یہ ایک service ایک endpoint پر منتقل ہوتی ہے تو اس کی hourly لاگت ($0.045 × 2 × 730 = $65.70) غائب نہیں ہوتی۔ اس traffic volume کے لیے، PrivateLink تقریباً $20/month بچاتا ہے۔ Break-even point تقریباً 420GB/month ہے — اس سے نیچے، endpoint کی اپنی hourly لاگت NAT processing کے نسبت per-GB بچت سے زیادہ ہو جاتی ہے۔

"رکیں — لیکن ہم صرف ایک VPN یا peering کے بجائے PrivateLink *کیوں* استعمال کریں؟" Maya نے پوچھا۔

"VPC Peering سادہ تر اور intra-region transfers کے لیے مفت ہے،" Tom نے کہا۔ "لیکن peering VPCs کے درمیان ایک مکمل routed connection بناتی ہے — VPC A میں کوئی بھی چیز ممکنہ طور پر VPC B میں کسی بھی چیز تک پہنچ سکتی ہے۔ PrivateLink زیادہ جراحی والا ہے۔ Endpoint ایک مخصوص service کو بے نقاب کرتا ہے، ایک مکمل network route کو نہیں۔ security-conscious architectures کے لیے، وہ خصوصیت اہم ہے۔"

"اور اگر کوئی ایک peered VPC میں break in کرنے کی کوشش کرے؟" Priya نے پوچھا۔ "مکمل peering کا مطلب ہے کہ ایک VPC میں ایک سمجھوتہ شدہ instance کے پاس peered VPC میں ہر instance تک route ہے۔"

"یہی peering کے بجائے PrivateLink کی دلیل ہے جب آپ کسی third-party service یا کسی علیحدہ team کی ملکیت والی service سے connect کر رہے ہوں،" Tom نے کہا۔ "بھروسے مند intra-company VPCs کے لیے peering۔ کسی بھی ایسی چیز کے لیے PrivateLink جہاں آپ کم سے کم نمائش والا connection چاہتے ہوں۔"

**Cross-AZ Traffic: ایک معماری سوال**

cross-AZ data transfer میں $178/month زیادہ مشکل تھا۔

اس میں سے کچھ ناگزیر تھا: load balancer traffic کو AZs میں تقسیم کرتا ہے، تو کچھ requests ایک AZ میں شروع ہوتی ہیں اور load balancer انہیں دوسرے AZ میں ایک instance کی طرف forward کرتا ہے۔

اس میں سے کچھ optimize کیا جا سکتا تھا: application کو RDS primary (us-west-2a میں) کو لکھنے اور read replica (us-west-2b میں) سے پڑھنے کے لیے configure کیا گیا تھا۔ ہر read query AZ کی حدود عبور کرتی تھی۔

reads کے لیے، ایک حل: application کو request کرنے والی instance کے اسی AZ میں ایک read replica کو ترجیح دینے کے لیے configure کریں۔ ہر AZ کو اپنی read replica ملتی ہے۔ Traffic مقامی رہتا ہے۔

Trade-off: زیادہ read replicas = زیادہ لاگت۔ اگر cross-AZ traffic کی لاگت $50/month ہے اور ایک اضافی read replica کی لاگت $190/month ہے، تو AZ-مقامی optimization فائدہ مند نہیں۔

Tom نے حساب کیا: ان کے موجودہ query volume پر، cross-AZ traffic $178 میں سے صرف $31/month تھا۔ replicas شامل کرنے کے قابل نہیں۔

دیگر cross-AZ لاگتیں load balancer routing اور service-to-service communication تھیں — موجودہ architecture سطح پر زیادہ تر ناگزیر۔

"یہ ان معاملات میں سے ایک ہے جہاں لاگت کو سمجھنے کا مطلب یہ نہیں کہ آپ کو اسے ٹھیک کرنا چاہیے،" Tom نے کہا۔

"cross-AZ traffic کو مکمل طور پر ختم کرنے کی کیا لاگت ہوگی؟" Maya نے پوچھا۔

"ایک AZ میں ہر چیز Multi-AZ کے مقصد کو شکست دیتی ہے۔ یہ high availability کھونے کی قیمت پر $31/month کی بچت ہے۔"

"تو ہم اسے رہنے دیتے ہیں،" اس نے کہا۔

"ہم اسے رہنے دیتے ہیں۔"

**S3 Select: Queries میں Data Transfer کم کرنا**

analytics pipeline کا جائزہ لیتے ہوئے، Tom نے ایک اور optimization پائی جو خاص طور پر اس بات سے متعلق تھی کہ analytics team بڑی S3 files کو کیسے query کر رہی تھی۔

Pattern: ہر صبح، ایک analytics job، restaurant-specific order data کے لیے in-memory filter کرنے کو S3 سے ایک 500MB Parquet file download کرتا تھا۔ download کے بعد file کا تقریباً 95% رد کر دیا جاتا تھا۔

**S3 Select** آپ کو ایک S3 object (CSV، JSON، Parquet) سے صرف وہ rows اور columns حاصل کرنے دیتا ہے جن کی آپ کو ضرورت ہے، بجائے اس کے کہ پوری file download کر کے اسے اپنی application میں filter کریں۔

> **اہم اپ ڈیٹ**: 2024 کے وسط میں، AWS نے نئے customers کو S3 Select پیش کرنا بند کر دیا — موجودہ users اسے رکھتے ہیں، لیکن یہ نئی architectures کے لیے ایک بند گلی ہے۔ یہ section جو اصول سکھاتا ہے (storage layer پر filter کریں، پوری file نہ بھیجیں) لازوال ہے؛ اس کا جدید آلہ **Amazon Athena** ہے (S3 پر براہ راست SQL، جوائنز اور aggregations سمیت جو S3 Select کے پاس کبھی نہیں تھے)۔ **S3 Object Lambda**، جو کبھی دوسرا متبادل تھا، S3 Select کے پیچھے legacy حیثیت میں چلا گیا: 7 نومبر 2025 تک یہ بھی نئے customers کے لیے بند ہے (موجودہ workloads چلتے رہتے ہیں)۔ موجودہ امتحان پر، "S3 پر جگہ پر data query کریں" Athena کی طرف اشارہ کرتا ہے۔ ذیل کی کہانی محفوظ ہے کیونکہ *استدلال* — پہلے ناپیں، filter کو data کی طرف منتقل کریں — سبق ہے۔

S3 Select کے بغیر:
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

S3 Select کے ساتھ:
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select اس data کو کم کر دیتا ہے جو S3 سے آپ کی application میں منتقل ہوتا ہے۔ انتخابی queries والی بڑی files کے لیے، یہ data volume میں 10-100x کمی ہو سکتی ہے — اور، چونکہ analytics instance اسی region میں چلتی ہے جس میں bucket ہے، فائدہ ایک transfer bill نہیں ہے (same-region S3-سے-EC2 transfer مفت ہے): یہ وہ compute، memory، اور وقت ہے جو آپ ایسے data کو download اور filter کرنے میں خرچ کرتے ہیں جسے آپ فوراً پھینک دیتے ہیں۔

Tom نے اسے analytics team کے ساتھ اٹھایا۔ انہوں نے ابتدائی طور پر مزاحمت کی۔

"ہم پہلے ہی جانتے ہیں pandas کیسے لکھنی ہے،" ایک analyst نے کہا۔

"یہ pandas کے بارے میں نہیں ہے،" Tom نے کہا۔ "یہ اس حقیقت کے بارے میں ہے کہ آپ 2MB data حاصل کرنے کے لیے 500MB download کر رہے ہیں۔ download خود مفت ہے — ایک ہی region — لیکن instance نہیں ہے۔ آپ یہ ہر restaurant کے لیے چلاتے ہیں: 287 restaurants، 287 queries، ہر رات 140GB کھینچا اور pandas میں filter کیا جاتا ہے۔ یہی وہ ہے جو analytics box کو دو گھنٹے مصروف رکھتا ہے — اور یہی وجہ ہے کہ یہ ایک xlarge ہے۔"

"اور S3 Select؟"

"S3 Select فی GB scanned $0.002 اور فی GB returned $0.0007 charge کرتا ہے — فی query تقریباً ایک سینٹ کا دسواں حصہ۔ بدلے میں، instance ایک رات میں 140GB کے بجائے 600MB وصول کرتی ہے، job منٹوں میں مکمل ہوتی ہے، اور box ایک size گرا سکتا ہے۔"

"یہ ماہانہ $450 ہے،" analyst نے instance کا حساب کرنے کے بعد کہا — instance کے hourly rate اور اس کے پیسنے میں گزارے گھنٹوں سے ایک تخمینی اندازہ۔

"یہی وجہ ہے کہ میں یہاں ہوں،" Tom نے کہا۔ اصل عدد کم نکلے گا — جب Tom نے بعد میں nightly job سے منسوب اصل compute spend کھینچی، تو یہ $450 نہیں بلکہ $202/month نکلا۔ Napkin math مسئلہ ڈھونڈتا ہے؛ پیمائش اس کا سائز طے کرتی ہے۔

Tom نے analytics team کو گفتگو میں لانے سے پہلے اسے پہلے Leo کے ساتھ اٹھایا۔ وہ جانتا تھا کہ Leo مزاحمت کرے گا، اور وہ اس مزاحمت کو ایک کمرہ-سطح کی بحث بننے سے پہلے سمجھنا چاہتا تھا۔

"S3 Select analytics pipeline queries پر $180/month بچائے گا،" Tom نے کہا۔

"اس کے لیے ہر query کو دوبارہ لکھنا پڑتا ہے،" Leo نے کہا۔

"اس کے لیے data access pattern کو 'download اور filter' سے 'S3 Select API کے ذریعے query' میں بدلنا پڑتا ہے۔"

"جو ایک rewrite ہے۔"

"یہ client library calls میں ایک تبدیلی ہے،" Tom نے کہا۔ "Query logic — filtering expressions — وہی رہتی ہے۔ جو بدلتا ہے وہ یہ ہے کہ filtering کہاں ہوتی ہے۔ فی الحال: EC2۔ S3 Select کے ساتھ: S3۔"

"میں نے S3 Select docs پڑھے ہیں،" Leo نے کہا۔ "آپ joins نہیں کر سکتے۔ آپ بنیادی SUM اور COUNT سے زیادہ پیچیدہ aggregations نہیں کر سکتے۔ ہماری کچھ analytics queries اس سے زیادہ نفیس ہیں۔"

"میں جانتا ہوں،" Tom نے کہا۔ "یہی وجہ ہے کہ میں تمام queries کے لیے S3 Select تجویز نہیں کر رہا۔ میں اسے restaurant-specific daily summary queries کے لیے تجویز کر رہا ہوں۔ یہ 500MB Parquet file ہے جو restaurant_id کے ذریعے filter ہوتی ہے، دو columns کھینچتی ہے۔ وہ query ایک خالص filter-and-project ہے۔ S3 Select اس صورت کے لیے بالکل درست آلہ ہے۔"

Leo ایک لمحے کے لیے خاموش رہا۔ اس نے زیر بحث query کھولی۔

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"S3 Select ورژن کیا ہوگا — select_object_content call؟"

"ہاں،" Tom نے کہا۔ "آپ read_parquet call کو ایک select_object_content call سے بدل دیں گے جو WHERE clause کو S3 کی طرف دھکیلتا ہے۔ نتیجہ پہلے ہی filtered واپس آتا ہے۔ آپ کو پوری Parquet file کے بجائے matching records کی ایک stream ملتی ہے۔"

"اور مجھے response کو مختلف طریقے سے سنبھالنا پڑے گا۔"

"Response format default کے طور پر CSV ہے۔ آپ کو اسے واپس ایک DataFrame میں parse کرنے کے لیے ایک چھوٹا wrapper چاہیے، یا اگر آپ موجودہ parsing logic رکھنا چاہتے ہیں تو آپ Parquet output format استعمال کریں۔"

Leo نے اسے دیکھا۔ "یہ کتنا کام ہے؟"

"آدھا دن،" Tom نے کہا۔ "شاید ایک دن اگر آپ nightly batch میں تمام 287 restaurant IDs پر اسے اچھی طرح test کرنا چاہتے ہیں۔"

"$180/month کے لیے۔"

"$2,160 فی سال،" Tom نے کہا۔ "اور یہ approach scale کرتا ہے۔ 2,000 restaurants پر، اسی file size پر وہی query S3 Select کے بغیر اور بھی زیادہ لاگت آتی ہے۔ آپ آج ایک دن سرمایہ کاری کر رہے ہیں تاکہ بعد میں ایک بہت بڑے مسئلے سے بچ سکیں۔"

Leo نے notebook بند کیا۔ "وہ queries جہاں S3 Select کام نہیں کرتا — aggregation queries، cross-restaurant comparisons — وہ ویسے کی ویسے رہتی ہیں؟"

"وہ ویسے کی ویسے رہتی ہیں،" Tom نے تصدیق کی۔ "میں analytics pipeline کو دوبارہ لکھنے کی کوشش نہیں کر رہا۔ میں 500 MB download کرنا بند کرنے کی کوشش کر رہا ہوں تاکہ اس کا 2 MB استعمال کر سکوں۔"

"ٹھیک ہے،" Leo نے کہا۔ "میں یہ اس ہفتے کروں گا۔"

اس نے کیا۔ Implementation میں چھ گھنٹے لگے۔ اس نے S3 Select call کو ایک utility function میں لپیٹا جو موجودہ read_parquet call جیسے ہی interface سے میل کھاتا تھا — nightly batch میں calling code کو بالکل بھی تبدیلیوں کی ضرورت نہیں تھی۔ صرف data access layer بدلا۔

اگلے مہینے، analytics pipeline کا nightly compute bill $202 سے گر کر $22 ہو گیا — job گھنٹوں کے بجائے منٹوں میں مکمل ہوئی، ایک چھوٹی instance پر۔ $180/month کی بچت نے چھ گھنٹے engineering time کی لاگت آئی تھی۔ سالانہ، یہ وقت کی سرمایہ کاری پر 1,800% return تھا۔

"جس حصے کی میں نے مزاحمت کی،" Leo نے ماہانہ review میں کہا، "وہ rewrite تھا۔ یہ ایک function کی تبدیلی نکلا، ایک rewrite نہیں۔ میں ایک خیالی مسئلہ حل کر رہا تھا۔"

"یہ نوٹ کرنے کے قابل ہے،" Tom نے کہا۔ "جب آپ یہ جائزہ لے رہے ہوں کہ ایک optimization نافذ کریں یا نہیں، تو اس بارے میں مخصوص رہیں کہ کام اصل میں کیا ہے۔ 'Queries دوبارہ لکھنے کی ضرورت ہے' خیالی ورژن تھا۔ 'Data access function بدلنے کی ضرورت ہے' حقیقی ورژن تھا۔"


**"ارادی بمقابلہ غیر ارادی لاگت"**

تین ہفتے کے networking analysis کے آخر میں، Tom نے مکمل breakdown واپس team کے پاس لایا۔ اس کی spreadsheet میں ایک نیا column تھا: "ارادی؟" ہر line item کے لیے ہاں یا نہیں کے ساتھ۔

"یہی وہ فریم ہے جو میں اب استعمال کر رہا ہوں،" اس نے کہا۔ "صرف 'اس کی کتنی لاگت ہے' نہیں بلکہ 'کیا ہم نے یہ خرچ کرنے کا فیصلہ کیا؟'"

"ایک ارادی لاگت کیا ہے؟" Maya نے پوچھا۔

"Aurora Global Database replication۔ ہم نے us-east-1 میں replicate کرنے کا فیصلہ کیا کیونکہ ہمارے East Coast پر restaurant partners ہیں۔ یہ cross-region replication میں $120/month ہے — DR planning کے دنوں کے تخمینی اندازے سے تقریباً دگنا۔ ہم نے وہ لاگت ایک مخصوص وجہ سے چنی۔"

"اور غیر ارادی؟"

"Leo کا analytics pipeline ایک test ختم ہونے کے بعد پانچ ماہ تک us-east-1 میں لکھتا رہا۔ کسی نے وہ نہیں چنا۔ یہ ہو رہا تھا کیونکہ کوئی دیکھ نہیں رہا تھا۔"

"اور AWS service calls کے لیے NAT Gateway charges؟"

"کہیں درمیان میں،" Tom نے کہا۔ "ہم نے واضح طور پر SSM کو NAT Gateway سے route کرنے کا فیصلہ نہیں کیا — وہ default تھا۔ ہمیں معلوم نہیں تھا کہ ایک سستا option تھا۔ کیا یہ ارادی ہے؟ ہم نے ایک انتخاب کیا، بس ہمیں معلوم نہیں تھا کہ ہم کیا چن رہے ہیں۔"

"یہ سب سے خطرناک category ہے،" Priya نے کہا۔ "وہ فیصلے جنہیں آپ نہیں جانتے کہ آپ کر رہے ہیں۔"

"یہی وجہ ہے کہ VPC Flow Logs analysis اہم ہے،" Tom نے کہا۔ "یہ غیر مرئی کو مرئی بناتا ہے۔ ہر byte جو ایک حد عبور کرتا ہے اب اس کی ایک کہانی ہے جسے ہم سراغ لگا سکتے ہیں۔"

"کیا ہم نے سوچا ہے کہ اگر ہم اسے دوبارہ بہنے دیں تو کیا ہوگا؟" Priya نے پوچھا۔ "ہم نے ایک بار کا analysis کیا ہے۔ چھ ماہ میں، Leo کہیں ایک اور test bucket بنا چکا ہوگا۔"

"میں یہیں ہوں گا،" Leo نے کہا۔ "میں اگلی بار اسے eu-west-1 میں کروں گا تاکہ کم از کم فی GB زیادہ لاگت آئے اور آپ تیزی سے notice کریں۔"

"ماہانہ VPC Flow Log review،" Tom نے کہا۔ "میں اسے سہ ماہی cost review میں شامل کروں گا۔ اگر ہمیں ایک نیا cross-region flow یا ایک NAT Gateway spike نظر آئے، تو ہم اگلے bill سے پہلے اسے سراغ لگاتے ہیں۔"

**تبدیلی: وہ Trade-Off جو آپ قبول کرتے ہیں**

اگر آپ ہر چیز کو ایک واحد Availability Zone میں چلا کر cross-AZ traffic کو ختم کریں، تو آپ Nimbus کے موجودہ volume پر تقریباً $31/month بچاتے ہیں — لیکن آپ Multi-AZ redundancy کھو دیتے ہیں جس کی قیمت incident کے خطرے میں اس سے کہیں زیادہ ہے۔ پختہ cost گفتگو ہمیشہ بچت تلاش کرنے کے بارے میں نہیں ہوتی؛ کبھی کبھی یہ بالکل سمجھنے کے بارے میں ہوتی ہے کہ آپ کس چیز کی ادائیگی کر رہے ہیں اور یہ فیصلہ کرنے کے بارے میں کہ یہ اس کے قابل ہے۔

Cross-AZ charge لچک (resilience) کی قیمت ہے۔ کچھ networking costs معماری وابستگیاں ہیں، ناکارگیاں نہیں۔

SAA-C03 ربط: امتحان اکثر ایسے منظر نامے پیش کرتا ہے جہاں ایک "cost optimization" ایک redundancy کو ختم کر دیتی۔ درست جواب عام طور پر redundancy کو محفوظ رکھنا اور کہیں اور optimize کرنا ہوتا ہے — waste اور reliability کی لاگت کے درمیان فرق جانیں۔

**CloudFront: Data Transfer کا Discount**

یہاں ایک متضاد بدیہی حقیقت ہے: CloudFront کے ذریعے data serve کرنا عام طور پر EC2 یا S3 سے براہ راست serve کرنے سے سستا ہوتا ہے۔

**براہ راست EC2 سے انٹرنیٹ**: $0.09/GB
**CloudFront سے انٹرنیٹ**: $0.085/GB (قدرے سستا)

لیکن اصل بچت per-GB rate نہیں ہے — یہ یہ ہے کہ CloudFront data کو edge locations پر cache کرتا ہے۔ اگر 1,000 users ایک ہی menu photo کی request کریں:

- **CloudFront کے بغیر**: 1,000 requests S3 سے براہ راست انٹرنیٹ کی طرف جاتی ہیں × photo size × $0.09/GB
- **CloudFront کے ساتھ**: clients کو photo edge سے CloudFront کے rate ($0.085/GB) پر ملتی ہے، اور cache fill — 1 miss پر CloudFront کا S3 سے fetch کرنا — **مفت** ہے (AWS origin-to-CloudFront transfer معاف کر دیتا ہے؛ آپ صرف origin GET requests ادا کرتے ہیں)

Nimbus کے لیے جس کا 83% cache hit rate ہے (باب ۱۳ سے)، 83% requests نے origin کو بالکل نہیں چھوا — کم origin requests، کم origin load، اور ہر byte S3 کے انٹرنیٹ rate کے بجائے edge rate پر bill ہوا۔

"CloudFront صرف performance کے لیے ایک CDN نہیں ہے،" Tom نے کہا۔ "یہ data transfer کے لیے ایک cost optimization بھی ہے۔"

Leo سوچ میں نظر آیا۔ "ہمیں تمام static content delivery کو CloudFront کے ذریعے منتقل کرنا چاہیے، حتیٰ کہ ان assets کے لیے بھی جو latency-sensitive نہیں ہیں۔"

"درست۔ اگر users اسے AWS سے download کر رہے ہیں، تو اسے CloudFront کے ذریعے جانا چاہیے۔"

**مکمل Networking Optimization**

تین ہفتوں کے analysis اور implementation کے بعد:

| Cost Item                                  | پہلے   | بعد    | ماہانہ بچت |
|--------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)          | $289     | $211     | $78            |
| CloudFront optimization (مزید assets منتقل) | $214     | $147     | $67            |
| Cross-AZ traffic (جیسا ہے ویسا قبول)        | $178     | $178     | $0             |
| Cross-region traffic (Leo کا test bucket)   | $166     | $160     | $6             |
| **کل**                                     | **$847** | **$696** | **$151/month** |

$151/month، networking savings میں $1,812/year۔ compute اور storage کے مقابلے میں معمولی، لیکن معنی خیز۔

زیادہ اہم: Tom اب networking bill کی ہر line کو سمجھتا تھا۔ وہ ہر لاگت کی وضاحت کر سکتا تھا اور اس نے شعوری طور پر فیصلہ کیا تھا کہ کس کو optimize کرنا ہے اور کس کو قبول کرنا ہے۔ ارادی اور غیر ارادی لاگت کے درمیان فرق اب واضح اور documented تھا۔

## خوبیاں اور حدود

**NAT Gateway costs**:

- NAT Gateway سے گزرنے والے بڑے data volumes تیزی سے جمع ہوتے ہیں
- VPC Endpoints کچھ NAT costs کو مکمل طور پر ختم کر دیتے ہیں
- جائزہ لیں کہ آپ کی private instances کن services کو call کرتی ہیں اور کیا endpoints دستیاب ہیں

**لاگت کے لیے CloudFront**:

- Cache hit rate براہ راست cost savings کا تعین کرتا ہے
- اعلیٰ cache hit rate = کم origin requests اور کم origin load، علاوہ ازیں زیادہ bytes CloudFront کے سستے viewer-side rate پر bill ہوتے ہیں (AWS origins سے origin-to-CloudFront transfer بالکل charge نہیں ہوتا)
- تمام static asset delivery کو CloudFront کے ذریعے منتقل کریں

**Cross-AZ trade-offs**:

- Cross-AZ traffic کو ختم کرنے کے لیے عام طور پر ایسی معماری تبدیلیوں کی ضرورت ہوتی ہے جو بچت سے زیادہ لاگت آتی ہیں
- optimize کرنے سے پہلے احتیاط سے حساب کریں

**S3 Select** (legacy — 2024 سے نئے customers کے لیے دستیاب نہیں؛ اس کے بجائے Athena استعمال کریں۔ S3 Object Lambda بھی اب legacy ہے — نومبر 2025 تک نئے customers کے لیے بند، موجودہ workloads متاثر نہیں):

- اصول قائم ہے: بڑے S3 objects download کرنے کے بجائے storage layer پر filter کریں — بچت compute time، instance size، اور job duration میں ظاہر ہوتی ہے (same-region S3 transfer پہلے ہی مفت ہے)
- جب آپ کو پوری file کی ضرورت ہو تو مدد نہیں کرتا

## خلاصہ

Tom نے networking analysis کو whiteboard پر ایک عدد اور اس بات کی واضح تر سمجھ کے ساتھ بند کیا کہ bill پر آخری نامعلوم اصل میں کیا تھا۔ networking costs میں $847/month نااہلی کا کوئی معمہ نہیں تھا — یہ ایک distributed system کی متوقع لاگت تھی جو availability zones پر پھیلا، عالمی users کو serve کرتا، اور regions میں data replicate کرتا تھا۔ اس میں سے زیادہ تر ادا کرنے کے قابل تھا۔ اس میں سے کچھ نہیں تھا۔ کلیدی پیش رفت یہ بتانے کے قابل ہونا تھا کہ کون سا کون سا تھا۔

- AWS **outbound data** (انٹرنیٹ: ~$0.09/GB)، **cross-AZ traffic** (ہر سمت میں $0.01/GB)، **cross-region traffic** ($0.02-0.08/GB)، اور **NAT Gateway processing** ($0.045/GB) کے لیے charge کرتا ہے۔
- **Inbound data** مفت ہے۔ **Same-AZ traffic** مفت ہے۔
- **VPC Flow Logs** ظاہر کرتی ہیں کہ آپ کے VPCs کے اندر کون سے مخصوص traffic flows لاگت کی ہر category پیدا کر رہے ہیں — ہدف شدہ optimization کے لیے ضروری۔ وہ flows جو کبھی VPC network interface عبور نہیں کرتے (جیسے CloudFront کا S3 origin سے fetch کرنا) اپنے آلات چاہتے ہیں: CloudFront standard logs یا S3 server access logs۔
- **VPC Gateway Endpoints** (S3، DynamoDB): مفت۔ ان services کے لیے NAT Gateway costs ختم کر دیتے ہیں۔
- **VPC Interface Endpoints**: فی گھنٹہ جمع فی GB قیمت۔ high-volume services کے لیے NAT Gateway سے سستے۔
- **CloudFront** براہ راست EC2-سے-انٹرنیٹ سے کم rates پر data serve کرتا ہے اور caching کے ذریعے origin transfer volume کو ڈرامائی طور پر کم کر دیتا ہے۔
- اہم سوال صرف "کتنا" نہیں بلکہ "کیا یہ لاگت ارادی ہے؟" ہے۔ غیر ارادی لاگتیں — بھولے ہوئے test pipelines، NAT کے ذریعے default routing — وہیں ہیں جہاں اصل بچت چھپی ہوتی ہے۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۴)*

- **NAT Gateway بمقابلہ VPC Endpoints**: امتحانی منظر نامہ: "private subnet میں EC2 اکثر S3/DynamoDB کو call کرتی ہے — NAT Gateway costs کیسے کم کریں؟" → VPC Gateway Endpoints (S3 اور DynamoDB کے لیے مفت)۔
- **Data transfer pricing کے قواعد**:
  - AWS میں: مفت
  - Same-AZ: مفت
  - Cross-AZ: charged
  - Cross-region: charged (زیادہ rate)
  - انٹرنیٹ: charged (نمایاں rate)
- **Cost optimization کے طور پر CloudFront**: "عالمی content delivery کے لیے data transfer costs کم کریں" → CloudFront۔ Cache layer origin requests کم کر دیتا ہے۔
- **S3 Transfer Acceleration**: CloudFront edge locations استعمال کرتے ہوئے S3 *میں* uploads کو تیز کرتا ہے۔ standard S3 سے زیادہ لاگت۔ ان customers کے لیے استعمال کریں جو جغرافیائی طور پر دور دراز مقامات سے بڑی files upload کرتے ہیں۔
- **Cross-region replication costs**: regions میں data replicate کرنے سے data transfer charges لگتے ہیں۔ S3 CRR کے لیے، آپ data transfer out rate اور S3 request cost دونوں ادا کرتے ہیں۔
- **PrivateLink (VPC Interface Endpoints)**: AWS services اور دوسرے AWS customers کی hosted services کو private connectivity فراہم کرتا ہے۔ NAT سے گزرنے سے زیادہ محفوظ، high-volume services کے لیے اکثر سستا۔ NAT Gateway processing کے مقابلے میں break-even تقریباً 420GB/month ہے (endpoint کی اپنی per-AZ hourly لاگت شمار کرتے ہوئے، اور یہ فرض کرتے ہوئے کہ NAT Gateway دیگر traffic کے لیے باقی رہتا ہے)۔

## مشقیں

**مشق ۱ — یادداشت**

ایک VPC Gateway Endpoint اور ایک VPC Interface Endpoint کے درمیان فرق کی وضاحت کریں۔ ہر ایک کس AWS services کے لیے دستیاب ہے، اور ہر ایک کی لاگت کیا ہے؟

*(اشارہ: Gateway Endpoints مفت ہیں لیکن صرف S3 اور DynamoDB کے لیے۔ Interface Endpoints فی گھنٹہ لاگت آتے ہیں لیکن زیادہ تر دیگر AWS services کے لیے کام کرتے ہیں۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی کی application private subnets میں EC2 instances پر چلتی ہے۔ Instances Amazon SQS اور Amazon S3 کو کثرت سے API calls کرتی ہیں۔ فی الحال، تمام traffic ایک NAT Gateway کے ذریعے نکلتی ہے۔ Team NAT Gateway costs کم کرنا چاہتی ہے۔ Data security برقرار رہنی چاہیے — کوئی traffic public internet عبور نہ کرے۔

کون سا طریقہ ان ضروریات کو کم سے کم مسلسل لاگت کے ساتھ بہترین طریقے سے پورا کرتا ہے؟

A) SQS کے لیے ایک Gateway Endpoint اور S3 کے لیے ایک Gateway Endpoint بنائیں  
B) SQS اور S3 دونوں کے لیے Interface Endpoints بنائیں  
C) SQS کے لیے ایک Interface Endpoint اور S3 کے لیے ایک Gateway Endpoint بنائیں  
D) NAT Gateway ہٹا دیں اور API calls کے لیے براہ راست internet gateway استعمال کریں

**اشارہ ۱**: Gateway Endpoints صرف S3 اور DynamoDB کے لیے دستیاب ہیں۔

**اشارہ ۲**: Interface Endpoints SQS اور بہت سی دیگر services کے لیے دستیاب ہیں (لیکن ان میں پیسہ لگتا ہے)۔

**اشارہ ۳**: private subnet route table میں ایک Internet Gateway اسے ایک public subnet بنا دے گا — security requirements کی خلاف ورزی کرتے ہوئے۔

**جواب**: C

**وضاحت**: S3 ایک Gateway Endpoint (مفت) استعمال کرتا ہے۔ SQS کو ایک Interface Endpoint (قیمت پر) چاہیے۔ یہ مجموعہ دونوں services کے لیے NAT Gateway data processing costs ختم کر دیتا ہے۔ تمام traffic AWS کے private network کے اندر رہتی ہے — کوئی public internet عبور نہیں۔

**A کیوں نہیں؟** Gateway Endpoints SQS کے لیے دستیاب نہیں ہیں۔ صرف S3 اور DynamoDB کے Gateway Endpoints ہیں۔

**B کیوں نہیں؟** اگرچہ یہ کام کرتا ہے، S3 کے لیے ایک Interface Endpoint استعمال کرنا (مفت Gateway Endpoint کے بجائے) غیر ضروری hourly charges لگاتا ہے۔ S3 اور DynamoDB کے لیے ہمیشہ مفت Gateway Endpoint استعمال کریں۔

**D کیوں نہیں؟** private subnet سے Internet Gateway کی طرف ایک route شامل کرنا اسے ایک public subnet بنا دیتا ہے۔ private subnets میں EC2 instances میں عام طور پر Elastic IPs نہیں ہوتے، تو وہ اضافی تبدیلیوں کے بغیر دراصل Internet Gateway کے ذریعے route نہیں کر سکتیں — اور ایسا کرنا انہیں inbound internet traffic کے سامنے بے نقاب کر دے گا۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۴*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کے East Coast users نمایاں traffic پیدا کرتے ہیں۔ Application انہیں us-west-2 (Oregon) سے serve کرتی ہے۔ فی الحال:

- API responses براہ راست us-west-2 EC2 instances سے East Coast users تک جاتے ہیں (~80ms، $0.09/GB)
- Menu photos S3 us-west-2 سے Boston میں CloudFront edge کے ذریعے جاتی ہیں (~8ms caching کے بعد)

Team API latency کم کرنے کے لیے East Coast users کے لیے us-east-1 (Northern Virginia) میں ایک دوسری application region شامل کرنے پر غور کر رہی ہے۔

اس تبدیلی کی data transfer costs کا تجزیہ کریں۔ dual-region setup میں کون سی نئی cross-region data transfer costs لگیں گی؟ کیا Route 53 latency-based routing کل transfer costs کو کم کرے گی یا بڑھائے گی؟ کن حالات میں (traffic volume، latency sensitivity) dual-region setup فائدہ مند ہوگا؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region cost-benefit analysis کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے networking analysis بند کیا۔

تین ماہ کے optimization project کا کل اثر:

- EC2 Savings Plans: -$14,200/year
- S3 lifecycle policies: -$7,800/year
- Storage (S3 + EBS): -$6,200/year
- Database tier: -$5,892/year
- Networking: -$1,812/year
- **کل: -$35,904/year**

اس نے اسے meeting room میں ایک whiteboard پر لکھا۔

Leo نے اسے گھورا۔ "پینتیس ہزار۔"

"اور کچھ زیادہ،" Tom نے کہا۔

"فی سال۔"

"فی سال۔"

Priya نے حساب کیا۔ "یہ $2,992 فی مہینہ ہے جو ہم ایسی چیزوں پر خرچ کر رہے تھے جو value پیدا نہیں کر رہی تھیں۔"

"یہ سب نہیں،" Tom نے درست کیا۔ "اس میں سے کچھ ایسی چیزیں تھیں جن سے ہمیں value مل رہی تھی، لیکن جن کے لیے ہم بہت زیادہ ادا کر رہے تھے۔ Savings Plans — ہمیں بالکل وہی EC2 capacity مل رہی تھی، بس ایک بہتر قیمت پر۔"

Maya whiteboard پر دیر تک کھڑی رہی۔

"جب ہم نے Nimbus شروع کیا،" اس نے کہا، "ہر ڈالر اہم تھا۔ ہم بمشکل پہلی EC2 instance کا خرچ اٹھا سکتے تھے۔"

"ہاں،" Tom نے کہا۔

"اور راستے میں کہیں، ہم نے ڈالروں کو اتنی احتیاط سے دیکھنا بند کر دیا۔"

"Growth ایسا کرتی ہے،" Priya نے کہا۔ "توجہ بنانے کی طرف منتقل ہو جاتی ہے، optimize کرنے کی طرف نہیں۔"

"دونوں اہم ہیں،" Maya نے کہا۔ "دونوں، ہمیشہ۔ اسے wiki میں شامل کرو۔ اور cost کے لیے ایک سہ ماہی review طے کرو۔"

Tom پہلے ہی اپنا calendar کھول رہا تھا۔

اگلے چند ابواب میں: ہم انفرادی services سے zoom out کرتے ہیں اور معماروں کی طرح سوچنا شروع کرتے ہیں۔
