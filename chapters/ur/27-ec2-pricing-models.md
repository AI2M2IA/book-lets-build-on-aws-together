# باب ۲۷: جس چیز کی آپ کو ضرورت ہے اسی کی ادائیگی

Tom نے billing tab کھولنے سے پہلے coffee بنائی۔ وہ ہمیشہ ایسا کرتا تھا — کچھ reports کا سامنا گرم حالت میں بہتر ہوتا ہے۔ وہ کھڑکی کے پاس کرسی پر بیٹھ گیا، ہاتھ میں mug، باہر سنیچر کی صبح اب بھی پُرسکون تھی۔ کوئی pings نہیں، کوئی standups نہیں۔ بس spreadsheet اور اعداد۔

اس نے tab کھولا۔

**خلاصۂ ماضی: Athena کی بصیرت سے bill تک**

پچھلے باب کے Athena analytics نے ایک غیر متوقع کام کیا تھا: cost اور usage reports کو براہ راست S3 سے query کر کے، Tom بالآخر صرف ایک مجموعی AWS bill ہی نہیں، بلکہ یہ breakdown بھی دیکھ سکتا تھا کہ ہر service پر اصل میں کتنی لاگت آ رہی ہے، ہفتہ بہ ہفتہ، چھ ماہ پر۔ جو تصویر ابھری وہ اتنی واضح تھی کہ تشویشناک تھی۔ EC2 سب سے بڑی واحد line item تھی، اور pattern بالکل واضح تھا — team ایک ایسے hotel کے لیے walk-in قیمتیں ادا کر رہی تھی جس میں وہ full-time رہتے تھے۔ اس احساس نے Tom کو سنیچر کی صبح ایک تازہ mug coffee کے ساتھ EC2 pricing page پر پہنچا دیا، اس عزم کے ساتھ کہ اگلا ماہانہ invoice آنے سے پہلے ہر option کو سمجھ لے۔

Tom نے Nimbus کے آغاز سے ہر مہینے AWS bill review کیا تھا۔ پہلے سال، وہ جو دیکھتا اس کا تقریباً 60% سمجھتا تھا۔ اب تک، وہ تقریباً سب کچھ سمجھتا تھا — سوائے اس کے کہ EC2 section ہمیشہ اسے کیوں محسوس کراتا تھا کہ وہ زیادہ ادائیگی کر رہے ہیں۔ EC2 section مختلف instance types پر "On-Demand instances" کا ایک mix تھا، سب فی گھنٹہ قیمت کے ساتھ، سب مل کر $2,340/month بن رہے تھے۔

کسی کو call کرنے سے پہلے، اس نے خود ایک گھنٹہ instance list سے گزرتے ہوئے گزارا — کچھ نتیجہ اخذ کرنے کے لیے نہیں، بلکہ ایسے مفروضے بنانے کے لیے جنہیں وہ آزما سکے۔

اس نے "api-prod" tagged چار r6g.large instances دیکھیں۔ اس نے background job processors چلانے والی دو c6g.medium instances دیکھیں۔ اس نے ایک t3.medium دیکھی جس پر "vpn-server" کا label تھا اور جو کمپنی کے وجود کے تیسرے مہینے سے چل رہی تھی۔ اس نے "analytics-batch" tagged instances کا ایک جوڑا دیکھا جو ہر رات 3 بجے نمودار ہوتا اور 7 بجے سے پہلے غائب ہو جاتا تھا۔

اس نے مفروضوں کا ایک column لکھا:

- API servers: قابل پیش گوئی، ہمیشہ چلتے ہیں۔
- Background processors: غالباً قابل پیش گوئی۔
- VPN server: ہمیشہ چل رہا ہے، کبھی نہیں بدلتا۔
- Batch analytics: شاید Spot-eligible؟

پھر اس نے حاشیے میں لکھا: *کوئی فیصلہ کرنے سے پہلے ہر ایک کی تصدیق کرو۔*

یہی ضبط — "جو میں فرض کرتا ہوں" کو "جو میں جانتا ہوں" سے الگ کرنے کا — وہ چیز تھی جو Tom کے cost reviews کو مفید بناتی تھی۔ اس نے دوسروں کو call کیا۔

"ہم بس walk-in rate ادا کرتے رہ سکتے ہیں،" Tom نے کہا، جب دوسرے call پر شامل ہوئے۔ "لیکن ہم نہیں کریں گے۔"

"Walk-in rate؟" Leo نے پوچھا۔

"On-Demand pricing،" Tom نے کہا۔ "یہ ایسا ہے جیسے جس صبح آپ کو ضرورت ہو اسی دن hotel room book کرنا۔ زیادہ سے زیادہ flexibility۔ زیادہ سے زیادہ قیمت۔"

"تو متبادل کیا ہے؟"

**Hotel کی مثال**

Tom نے ایک لمحے کے لیے سوچا۔ "آپ جانتے ہیں کہ کچھ لوگ جس صبح پہنچتے ہیں اسی دن hotel room book کرتے ہیں؟ ہم ابھی یہی ہیں۔ بہتر strategies موجود ہیں — چھ ماہ پہلے book کر کے discount حاصل کریں، آخری لمحے میں ایک unsold کمرہ زبردست deal پر لے لیں، یا اگر آپ کو پوری floor چاہیے تو پوری floor rent کریں۔ ایک ہی hotel، چار مختلف قیمتیں۔"

Leo نے اس کی طرف دیکھا۔ "اور ان کے AWS versions کیا ہیں؟"

Tom نے EC2 pricing page کھولا۔ "چار pricing models ہیں۔ اور ہم صرف ایک استعمال کر رہے ہیں۔"

EC2 pricing حیرت انگیز طور پر hotel room booking strategies سے اچھی طرح match کرتی ہے:

**On-Demand**: بغیر reservation کے front desk پر چلے جائیں۔ آپ پورا rack rate ادا کرتے ہیں، لیکن جب چاہیں check out کر سکتے ہیں۔ غیر قابل پیش گوئی قیام کے لیے بالکل درست۔

**Reserved Instances/Savings Plans**: پورے سال کے لیے پہلے سے کمرہ book کریں۔ آپ کو ایک نمایاں discount ملتا ہے — 30-72% off — اس commitment کے بدلے کہ آپ اسے استعمال کریں گے۔

**Spot Instances**: hotel کی شدید رعایتی موجودہ rate پر ایک unsold کمرہ لے لیں — کوئی سودے بازی نہیں، hotel قیمت اس بنیاد پر طے کرتا ہے کہ وہ کتنا خالی ہے۔ 90% تک off۔ لیکن hotel آپ سے دو منٹ کے notice پر جانے کو کہہ سکتا ہے اگر اسے کمرہ کسی full-price customer کے لیے چاہیے ہو۔ (برسوں پہلے آپ کو Spot capacity کے لیے *bid* کرنا پڑتا تھا؛ AWS نے 2017 میں bidding ختم کر دی — آپ بس موجودہ Spot price ادا کرتے ہیں۔)

**Dedicated Hosts**: hotel کی پوری floor خصوصی طور پر اپنے لیے rent کریں۔ دوسرے guests کے ساتھ کوئی sharing نہیں۔ نمایاں طور پر زیادہ مہنگا۔ ضروری جب software licensing یا compliance قواعد physical host کی sharing سے منع کریں۔

ہر model کا ایک use case ہے۔ Nimbus جو غلطی کر رہا تھا: ہر چیز کے لیے On-Demand استعمال کرنا، ان workloads سمیت جو 24/7 چلتے تھے اور مکمل طور پر قابل پیش گوئی تھے۔

**On-Demand Instances: زیادہ سے زیادہ Flexibility، زیادہ سے زیادہ لاگت**

**کب استعمال کریں**:

- غیر قابل پیش گوئی workloads (ایسے traffic spikes جن کی آپ پیش گوئی نہیں کر سکتے)
- Development اور testing (کثرت سے start اور stop)
- مختصر مدت workloads (ایک ہفتے کے لیے experiment چلانا)
- پہلی deployment (اپنے usage patterns سمجھنے سے پہلے)

**کب استعمال نہ کریں**:

- Steady-state production workloads جن کے بارے میں آپ جانتے ہیں کہ ایک سال سے زیادہ چلیں گے
- قابل پیش گوئی baseline load والی کوئی بھی چیز

**EC2 Hibernation: state کھوئے بغیر pause کرنا**

ایک cost optimization تکنیک جسے کافی توجہ نہیں ملتی وہ **EC2 Hibernation** ہے۔ جب آپ ایک عام instance کو stop کرتے ہیں، تو RAM کے مندرجات ختم ہو جاتے ہیں — اگلی start ایک cold start ہوتی ہے۔ operating system boot ہوتا ہے، application initialize ہوتی ہے، database connections دوبارہ قائم ہوتی ہیں۔ زیادہ تر production web servers کے لیے، یہ ٹھیک ہے۔ کچھ مخصوص workloads کے لیے، یہ مہنگا ہے۔

جب آپ ایک instance کو hibernate کرتے ہیں، تو shutdown سے پہلے RAM کے مندرجات EBS root volume پر محفوظ ہو جاتے ہیں۔ اگلی start پر، instance بالکل وہیں سے دوبارہ شروع ہوتی ہے جہاں اسے چھوڑا تھا — processes چلتے ہوئے، connections قائم، application state سالم — اس کا کسر وقت میں جو ایک cold start لیتی۔ یہ خاص طور پر ان long-running analysis jobs کے لیے مفید ہے جنہیں آپ state کھوئے بغیر راتوں رات pause کرنا چاہتے ہیں، یا ان development instances کے لیے جنہیں boot ہونے اور اپنا environment configure کرنے میں کئی منٹ لگتے ہیں۔

"میرے پاس ایک data science instance ہے،" Leo نے printout کو دیکھتے ہوئے کہا۔ "اسے start ہونے میں نو منٹ لگتے ہیں۔ Custom environment، ایک درجن Python packages، کچھ model weights preloaded۔ میں اسے ہر رات stop اور ہر صبح restart کرتا ہوں۔"

"تو آپ ہر روز اسے boot ہوتے دیکھنے میں نو منٹ گزارتے ہیں،" Tom نے کہا۔

"ہاں۔"

"یہ ہفتے میں 45 منٹ engineering time ہے ایک EC2 instance کا انتظار کرتے ہوئے۔"

"ہاں۔"

"اسے hibernate کرو۔"

Hibernation کے ساتھ، Leo کی instance دن کے آخر میں pause ہوئی، اپنی RAM کو EBS root volume پر محفوظ کیا، اور اگلی صبح 90 سیکنڈ سے کم میں دوبارہ شروع ہو گئی۔ analysis sessions بالکل وہیں سے جاری رہے جہاں اس نے انہیں چھوڑا تھا۔

Hibernation کی شرائط: hibernation کو **launch پر enable کرنا** ضروری ہے — آپ اسے پہلے سے چل رہی instance پر on نہیں کر سکتے (Leo کو اپنا data science box ایک AMI سے relaunch کرنا پڑا تاکہ یہ مل سکے)۔ Instances کے پاس 150 GB تک RAM ہونی چاہیے (RAM کے مندرجات کو EBS root volume پر فٹ ہونا ہے)، root volume اتنا بڑا ہونا چاہیے کہ OS اور RAM dump دونوں کو سما سکے، اور root volume کا encrypted ہونا ضروری ہے (hibernation حساس in-memory data کو disk پر محفوظ کرتا ہے)۔ Bare-metal instances اور 150 GB سے زیادہ RAM والی instances hibernation کو support نہیں کرتیں۔ ایک اور حد: ایک instance زیادہ سے زیادہ **60 دن** تک hibernated رہ سکتی ہے — اس کے بعد اسے start، stop، یا terminate کرنا ضروری ہے؛ یہ غیر معینہ مدت کے لیے سو نہیں سکتی۔

Tom نے Nimbus کی On-Demand instances شناخت کیں:

- Web API servers: 4 EC2 instances، 18 ماہ سے 24/7 چل رہی ہیں۔ *قابل پیش گوئی baseline۔*
- VPN server: ہمیشہ چل رہا ہے۔ *قابل پیش گوئی baseline۔*
- traffic spikes کے لیے اضافی API servers: غیر قابل پیش گوئی۔ *On-Demand یہاں درست ہے۔*

"رکیں — لیکن spike servers On-Demand پر *کیوں* رہیں؟" Maya نے پوچھا۔ "اگر ہمیں ہر جمعہ spikes ملتے ہیں، تو کیا یہ commit کرنے کے لیے کافی قابل پیش گوئی نہیں؟"

Tom نے غور کیا۔ "baseline قابل پیش گوئی ہے۔ Spike کا وقت قابل پیش گوئی ہے، لیکن اس کی مقدار نہیں۔ کچھ جمعہ کی راتیں معمول سے 30% زیادہ ہوتی ہیں؛ کچھ 150% زیادہ۔ اگر میں چھ instances کے لیے Reserved capacity خریدوں اور ایک spike کو صرف دو اضافی چاہئیں، تو میں نے زیادہ commit کر لیا۔ اگر میں دو کے لیے خریدوں اور spike کو آٹھ چاہئیں، تو میں کم پڑ جاتا ہوں اور overflow بہرحال On-Demand پر چلتا ہے۔ خاص طور پر burst capacity کے لیے، On-Demand یا Spot درست ہے — جب traffic بڑھنا شروع ہو تو آپ real time میں Reserved Instance نہیں خرید سکتے۔"

"when not to use" فہرست کے اہم ہونے کی ایک وجہ ہے: اگر آپ چھ ماہ سے وہی instances چلا رہے ہیں اور آپ پیش گوئی کر سکتے ہیں کہ وہ چلتی رہیں گی، تو On-Demand پر ہر مہینہ ایک ایسا مہینہ ہے جس میں آپ ایک ایسے کمرے کے لیے walk-in rate ادا کر رہے ہیں جس پر آپ مستقل قابض ہیں۔

**Reserved Instances: سال بھر کی Commitment**

**Reserved Instances (RIs)** ایک billing commitment ہیں — آپ ایک مخصوص instance type کو ایک مخصوص region میں 1 یا 3 سال کے لیے استعمال کرنے پر agree کرتے ہیں۔ بدلے میں، AWS کم hourly rate charge کرتا ہے۔

**Discount tiers**:

- 1-year، No Upfront: ~30-40% discount بمقابلہ On-Demand
- 1-year، Partial Upfront: ~35-45% discount (کچھ ابھی ادا کریں، فی گھنٹہ کم)
- 1-year، All Upfront: ~40-50% discount (پورا سال ابھی ادا کریں)
- 3-year، All Upfront: ~55-72% discount (زیادہ سے زیادہ discount، زیادہ سے زیادہ commitment)

**Standard بمقابلہ Convertible RIs**:

- **Standard**: exact instance type اور region پر locked۔ اگر آپ کو مزید ضرورت نہ رہے تو Reserved Instance Marketplace پر بیچی جا سکتی ہے۔
- **Convertible**: commitment period کے دوران instance type، OS، اور tenancy بدل سکتے ہیں۔ Standard سے کم discount (~66% تک بمقابلہ 72%)۔

Tom نے 4 API servers کے لیے حساب لگایا (r6g.large، تقریباً $0.101/hour On-Demand):

- سالانہ On-Demand لاگت: $0.101 × 24 × 365 × 4 ≈ $3,540
- 1-year All Upfront RI (1 instance): ~$520 upfront (≈41% off)
- 4 instances: ~$2,080 upfront = **پہلے سال میں تقریباً $1,460 کی بچت**

"ہم صرف commit کر کے پہلے سال میں تقریباً پندرہ سو ڈالر بچا سکتے ہیں،" Tom نے کہا۔ "یہ فی مہینہ بالکل کتنی لاگت ہے — ہر reserved instance اس کے مقابلے میں جو ہم اب ادا کر رہے ہیں؟"

"یہ front-loaded ہے،" Maya نے کہا۔ "آپ پورا سال upfront ادا کرتے ہیں۔"

"رکیں — لیکن Standard RI پر *کیوں* commit کریں اگر instance types ابھی بھی ارتقا پذیر ہیں؟" Maya نے پوچھا۔ "اگر r6g اگلے سال متروک ہو جائے تو کیا ہوگا؟"

"اگر ہمیں لگتا ہے کہ ہمیں بدلنے کی ضرورت پڑ سکتی ہے تو ہم Convertible RIs لیتے ہیں۔ کم discount — 72% کے بجائے ~66% تک — لیکن commitment period کے دوران instance families تبدیل کرنے کی flexibility۔"

"اور اگر AWS ہمارے commit کرنے کے بعد ایک بہتر instance type release کرے؟"

"ہم RI expire ہونے پر چیک کرتے ہیں۔ اگر نیا type بہتر ہو، تو ہم اگلی term کے لیے ایک نئی RI خریدتے ہیں۔ موجودہ RI پھر بھی committed price پر اپنی مدت پوری کرتی ہے۔"

Tom نے break-even comparison کو shared screen پر لایا تاکہ سب ساتھ ساتھ دیکھ سکیں:

**تین طرفہ موازنہ: r6g.large، 4 instances، 12 ماہ**

| Option | سالانہ لاگت | ماہانہ مساوی | Flexibility |
|---|---|---|---|
| On-Demand ($0.101/hr × 4) | $3,540 | $295 | مکمل |
| Compute Savings Plan (~34% off 1-yr، $0.27/hr committed) | $2,365 | $197 | بلند |
| Standard RI، 1-yr All Upfront (4 × $520) | $2,080 | $173 | کم |

"رکیں،" Leo نے کہا۔ "RI، Savings Plan سے سستی ہے؟"

"ایک ہی term پر، ہاں — یہ flexibility کی قیمت ہے،" Tom نے کہا۔ "ایک Compute Savings Plan *کسی بھی* instance type، size، region، حتیٰ کہ Fargate اور Lambda پر apply ہوتا ہے، اس لیے اس کا زیادہ سے زیادہ discount کم ہے — 3-year tier پر 66% تک۔ ایک Standard RI، یا ایک EC2 Instance Savings Plan، آپ کو ایک instance family پر lock کرتی ہے اور اس lock-in کے بدلے آپ کو 72% تک discounts دیتی ہے۔ آپ جتنی زیادہ آزادی رکھتے ہیں، AWS اتنا ہی کم discount دیتا ہے۔"

"3-year RI کے لیے break-even کیا ہے؟"

"3-year All Upfront: تقریباً $1,060 فی instance، تو سب چاروں کے لیے کل $4,240 — یہ 36 ماہ خریدتا ہے۔ ماہانہ مساوی: $118، بمقابلہ $295 On-Demand۔ Upfront تقریباً مہینہ چودہ کے آس پاس خود کی قیمت پوری کر لیتا ہے؛ اس کے بعد آپ تقریباً مزید دو سال savings کے علاقے میں ہوتے ہیں۔"

"تو اگر ہم مہینہ چار میں فیصلہ کریں کہ ہمیں ایک مختلف instance family چاہیے،" Priya نے کہا، "تو ہم اب بھی اصل commitment کی ادائیگی کر رہے ہوں گے۔"

"درست۔ آپ Standard RIs کو RI Marketplace پر بیچ سکتے ہیں، لیکن ہمیشہ پوری قیمت پر نہیں۔ Convertible RIs کا تبادلہ ہو سکتا ہے لیکن بیچی نہیں جا سکتیں۔ یہی وجہ ہے کہ Savings Plan اکثر محفوظ تر انتخاب ہوتا ہے — وہی اصول، کم lock-in۔"

**Savings Plans: لچکدار Commitment**

**Savings Plans** Reserved Instances کا ایک نیا، زیادہ لچکدار متبادل ہیں۔ ایک مخصوص instance type پر commit کرنے کے بجائے، آپ ایک مخصوص *hourly spend کی مقدار* (dollars میں) پر commit کرتے ہیں۔

**Compute Savings Plans**: کسی بھی EC2 instance پر apply ہوتی ہیں، چاہے type، size، region، یا OS کوئی بھی ہو۔ سب سے لچکدار۔ 66% تک discount۔

**EC2 Instance Savings Plans**: ایک region میں ایک مخصوص instance family پر apply ہوتی ہیں (مثلاً "us-west-2 میں c6g instances")۔ Compute سے زیادہ restrictive، لیکن 72% تک discount (RI maximum کی طرح)۔

**SageMaker Savings Plans**: SageMaker ML training اور inference کے لیے مخصوص۔

Nimbus کے لیے: ان کے API servers کے لیے Compute Savings Plans۔ انہوں نے $0.45/hour compute spend پر commit کیا۔ کوئی بھی instance type، کوئی بھی size — اور commitment Fargate اور Lambda کو بھی cover کرتی ہے، جو آگے آنے والے کے لیے اہم تھا۔ جب وہ fleet scale up کریں یا instance types تبدیل کریں، Savings Plan پھر بھی apply ہوتا ہے۔

"یہ ہمارے لیے Reserved Instances سے بہتر ہے،" Leo نے کہا۔ "ہم ابھی بھی instance types کے ساتھ experiment کر رہے ہیں۔ Compute Savings Plan ہمیں خاص طور پر r6g سے locked کیے بغیر discount دیتا ہے۔"

"جب ہم $0.45/hour پر commit کریں اور کچھ مہینوں میں صرف $0.36 استعمال کریں تو کیا ہوتا ہے؟" Maya نے پوچھا۔

"آپ بہرحال $0.45 ادا کرتے ہیں،" Tom نے کہا۔ "Commitment غیر مشروط ہے۔ Savings Plan آپ کے committed amount تک جو بھی usage ہو اس پر apply ہوتا ہے۔ اس سے اوپر کوئی بھی چیز On-Demand rates پر چلتی ہے۔ ضبط یہ ہے کہ commitment کو ایسے level پر طے کریں جس تک آپ کو یقین ہو کہ آپ ہمیشہ پہنچیں گے۔"

"اور ہمیں اپنے اوسط پر commit نہیں کرنا چاہیے — ہمیں اپنے floor پر commit کرنا چاہیے،" Priya نے کہا۔

"بالکل۔ پچھلے چھ ماہ دیکھیں۔ سب سے کم ہفتہ تلاش کریں۔ اس عدد کے 90% پر commit کریں۔ پھر جیسے جیسے ہم بڑھیں سہ ماہی review کریں۔"

"کیا ہم نے سوچا ہے کہ اگر ہم زیادہ commit کر لیں تو کیا ہوگا؟" Priya نے جاری رکھا۔ "ہم ایک $2/hour plan خریدتے ہیں، پھر اگلی سہ ماہی ہم optimize کرتے ہیں اور ہمارا compute usage $1.50 تک گر جاتا ہے؟"

"$0.50/hour کا فرق ضیاع بن جاتا ہے،" Tom نے کہا۔ "ہم ایسی capacity کے لیے ادائیگی کر رہے ہیں جو اب موجود نہیں۔ یہی commitment کو بہت زیادہ طے کرنے کا خطرہ ہے۔ سہ ماہی review بالکل اسی کو پکڑنے کے لیے ہے — اگر ہمارا usage commitment سے نیچے گر گیا ہے، تو ہم جانتے ہیں کہ اگلی خریداری چھوٹی ہونی چاہیے۔ ایک اہم باریکی: ایک *Compute* Savings Plan آپ کے ساتھ Fargate اور Lambda تک جاتا ہے — EC2 workloads کو containers پر منتقل کرنا اسے بے کار نہیں چھوڑے گا۔ جو چیز commitment کو بے کار چھوڑتی ہے وہ واقعی کم compute استعمال کرنا ہے، یا ایک ایسی instance family کے لیے *EC2 Instance* Savings Plan یا RI رکھنا جسے آپ نے استعمال کرنا بند کر دیا۔"

آپ شاید سوچ رہے ہوں: کیوں نہ ہمیشہ Savings Plans کو زیادہ سے زیادہ قابل برداشت amount پر خرید لیں اور AWS کو معاملہ سنبھالنے دیں؟ جواب یہ ہے کہ commitment ایک floor ہے، ceiling نہیں۔ اگر آپ $5/hour پر commit کریں لیکن صرف $3/hour استعمال کریں، تو آپ $5/hour ادا کرتے ہیں۔ committed spend کا ہر ڈالر جو اصل usage سے میل نہیں کھاتا وہ ضائع شدہ ڈالر ہے۔ سہ ماہی review اختیاری نہیں ہے — یہی Savings Plan کو ایک optimization رکھتا ہے بجائے ایک over-commitment کے۔

**Spot Instances: 90% Discount**

**Spot Instances** AWS کی spare EC2 capacity استعمال کرتی ہیں۔ جب AWS کے پاس unused servers ہوں، آپ انہیں On-Demand قیمت سے 60-90% کم پر rent کر سکتے ہیں۔ جب AWS کو capacity واپس چاہیے (On-Demand یا Reserved customers کے لیے)، وہ آپ کو 2 منٹ کی warning دیتے ہیں اور آپ کی instance terminate کر دیتے ہیں۔

آپ شاید سوچ رہے ہوں: کون ایسی instances کے گرد system design کرے گا جو دو منٹ کے notice پر غائب ہو سکتی ہیں؟ جواب ہے: ہر وہ شخص جس کا کام شروع سے دوبارہ شروع کیا جا سکے۔ Batch jobs، analytics، rendering pipelines — ان میں سے کسی کو بھی اس مخصوص instance کی ضرورت نہیں جس نے کام شروع کیا تھا کہ وہی اسے ختم کرے۔ 2 منٹ کی warning ایک checkpoint محفوظ کرنے، connections drain کرنے، اور صاف ستھرا exit کرنے کے لیے کافی ہے۔

Interruption risk اس کی متعین کرنے والی خصوصیت ہے۔ Spot Instances صرف ان کے لیے مناسب ہیں:

- **Fault-tolerant workloads**: اگر ایک instance mid-task terminate ہو، تو task کچھ بھی corrupt کیے بغیر restart ہو سکتا ہے
- **Stateless processing**: Image resizing، video encoding، batch analytics، ML training
- **مختصر مدت batch jobs**: 2 منٹ کی warning state محفوظ کرنے اور checkpoint کرنے کے لیے کافی ہے
- **Auto Scaling mixed fleets**: اپنے ASG کی اکثریت کے لیے Spot استعمال کریں اور On-Demand کو baseline کے طور پر رکھیں

Nimbus کے لیے: Spot Instances ان batch analytics jobs کے لیے معقول تھیں جو ہر رات چلتی تھیں (دن کے order data کو aggregated reports میں process کرنا)۔ اگر کوئی Spot Instance mid-job terminate ہو، تو job ناکام ہو جاتی ہے، لیکن ایک نئی instance پر شروع سے restart ہو جاتی ہے۔ S3 میں موجود data محفوظ ہے۔

لیکن Leo نے یہ مشکل طریقے سے سیکھا اس سے پہلے کہ team نے pattern کو پوری طرح سمجھ لیا۔

تین ماہ پہلے، اس نے checkpoint logic بنائے بغیر nightly batch job کو Spot پر منتقل کر دیا تھا۔ پہلی رات، Spot Instance ٹھیک چلی۔ دوسری رات، یہ 4:47 AM پر interrupt ہوئی — ایک ایسی job میں سینتالیس منٹ بعد جسے مکمل ہونے میں ایک گھنٹہ بیس منٹ لگتے تھے۔ Job ناکام ہو گئی۔ جب restaurant partners اس صبح log in ہوئے تو پچھلے دن کے orders کی final report غائب تھی۔

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ،" Leo نے ناکام job notification کو دیکھتے ہوئے کہا تھا۔ "میں نے فرض کیا تھا کہ یہ ٹھیک رہے گا۔ پہلی رات یہ ٹھیک تھا۔"

"کیا ہوا؟" Maya نے پوچھا تھا۔

"Spot interruption۔ AWS کو capacity واپس چاہیے تھی، ہمیں دو منٹ دیے، instance terminate ہو گئی۔ Job کا کوئی checkpoint نہیں تھا۔ جب 5 AM پر دوبارہ کوشش کے لیے ایک نئی Spot Instance launch ہوئی، تو یہ صفر سے شروع ہوئی۔ 6:40 AM پر مکمل ہوئی۔ Reports دو گھنٹے دیر سے تھیں۔"

حل سیدھا تھا: ہر پندرہ منٹ بعد intermediate results کو S3 پر لکھیں۔ ہر checkpoint ایک مکمل جزوی state تھا — ایک نئی instance کے لیے کافی کہ وہ آخری checkpoint پڑھے اور اس نقطے سے جاری رکھے بجائے شروع سے restart کرنے کے۔

"nightly job کے لیے Spot استعمال کرنے سے اس کی لاگت $12/رات سے $2/رات تک گر گئی،" Leo نے رپورٹ کیا، حل لاگو ہونے کے بعد۔ "اس ایک بری رات کے باوجود، اسے تین ماہ تک چلانے کی کل لاگت دو ہفتے کی On-Demand pricing سے کم تھی۔"

"یہ ٹھیک رہے گا،" Leo نے مزید کہا، "چاہے یہ mid-run interrupt ہو جائے — ٹھیک ہے؟"

"checkpointing کے ساتھ، ہاں،" Tom نے کہا۔ "اس کے بغیر، نہیں۔ Interruption کی برداشت job میں بنانی ہوتی ہے، فرض نہیں کرنی ہوتی۔"

"اور اگر کوئی break in کرنے کی کوشش کرے؟" Priya نے پوچھا۔ "Spot Instance shared hardware پر ہوتی ہے۔ اگر یہ interrupt ہو اور ایک نئی launch ہو، تو کیا instances کے درمیان کوئی data exposure ہوتا ہے؟"

"نہیں،" Tom نے کہا۔ "AWS termination پر instance storage کو wipe کر دیتا ہے۔ وہ hardware حاصل کرنے والے اگلے customer کو ایک صاف ستھرا slate ملتا ہے۔ لیکن یہ ایک اچھی جبلت ہے — جب بھی آپ shared capacity استعمال کر رہے ہوں، isolation model کی تصدیق کرنا فائدہ مند ہے۔"

**Spot Fleet Diversification**

Leo نے interrupted batch job سے ایک اور بات سیکھی: جب آپ ایک واحد Spot Instance type کی request کرتے ہیں، تو آپ اس مخصوص type کی اس AZ میں availability پر شرط لگا رہے ہوتے ہیں۔ اگر us-west-2a میں c5.2xlarge کی Spot capacity ختم ہو جائے، تو آپ کی job انتظار کرتی ہے — یا ناکام ہو جاتی ہے۔

**Spot Fleet** اسے حل کرتا ہے، آپ کو ایک ہی request میں متعدد instance types اور AZs بتانے کی اجازت دے کر۔ AWS fleet کو جس بھی combination کے پاس سب سے کم قیمت پر available capacity ہو اس سے پورا کرتا ہے۔

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

ایک diversified fleet کے ساتھ، ایک instance type یا AZ میں interruption صرف fleet کے ایک حصے کو متاثر کرتی ہے۔ باقی چلتا رہتا ہے۔ Nimbus کی batch job کے لیے، ایک واحد بڑی instance کے بجائے چار-instance Spot Fleet چلانے کا مطلب تھا کہ ایک جزوی interruption بھی job کو مکمل ہونے دیتی — سست، لیکن مکمل restart کے بغیر۔

"diversified fleet کو بہتر pricing بھی ملتی ہے،" Tom نے کہا۔ "AWS آپ کے fleet کے تمام types میں سے سب سے کم قیمت دیتا ہے۔ کچھ راتوں میں آپ کو c5a، c5 سے کم قیمت پر مل رہا ہوتا ہے کیونکہ capacity وہاں موجود تھی۔"

"یہ ایک واحد instance type استعمال کرنے کے مقابلے میں فی مہینہ کتنی لاگت ہے؟" Tom نے خود سے بلند آواز میں پوچھا — یہ عادت اب مکمل طور پر بے ساختہ تھی۔ اس نے عدد چلایا۔ Spot Fleet mixed pricing پر اوسطاً $1.80/رات تھا بمقابلہ ایک واحد-type request کے ساتھ $2.00/رات۔ مطلق لحاظ سے چھوٹا فرق، لیکن صرف reliability میں بہتری ہی اس تبدیلی کو جواز فراہم کرتی تھی۔

"اور اگر کوئی Spot Fleet میں break in کرنے کی کوشش کرے؟" Priya نے پوچھا۔

"ہمیشہ کی طرح وہی جواب،" Tom نے کہا۔ "ہر instance دوسروں سے isolated ہے۔ Fleet انہیں خودکار طور پر کسی shared private segment پر نہیں ڈالتا۔ آپ کے security groups پھر بھی ہر instance پر انفرادی طور پر apply ہوتے ہیں۔"

Checkpointing نے interruptions کو قابل انتظام بنا دیا تھا، ختم نہیں۔ Job پھر بھی آخری checkpoint سے restart ہوتی تھی، اور اگر restart Spot price spikes کے دور سے میل کھاتا، تو replacement instance کو available ہونے میں 10 سے 20 منٹ لگ سکتے تھے۔ جو کام آخری checkpoint میں پہلے ہی شامل تھا وہ restart پر چھوڑ دیا جاتا تھا؛ اس کے بعد کا کام دوبارہ کیا جاتا۔ کل rework overhead: چھوٹا، لیکن حقیقی۔

Spot Fleet نے availability کا مسئلہ صفائی سے حل کر دیا۔ تین AZs میں پانچ instance types بتا کر، Leo نے مکمل capacity gap کے امکان کو تقریباً صفر تک کم کر دیا۔ AWS کی allocation strategy — diversified — نے چار-instance fleet کو pools میں تقسیم کر دیا، تاکہ کسی ایک pool کی interruption job کو روک نہ سکے۔ جب ایک instance interrupt ہوئی، باقی تین processing جاری رکھتیں، اور checkpoint کا مطلب تھا کہ replacement instance صرف وہی کام اٹھاتی جو interrupted instance mid-processing کر رہی تھی۔ End-to-end، job نے دوبارہ کبھی اپنی 7 AM کی report کی deadline نہیں چھوڑی۔

"diversification نے پیچیدگی میں کیا قیمت ادا کرائی؟" Maya نے پوچھا، جب Leo نے اسے دستاویز کیا۔

"Spot Fleet request میں تین اضافی lines،" Leo نے کہا۔ "Processing code کو معلوم نہیں اور پروا نہیں کہ یہ کس instance type پر چل رہا ہے۔ پیچیدگی مکمل طور پر fleet configuration میں رہتی ہے، application میں نہیں۔"

یہی شروع سے application کو stateless ڈیزائن کرنے کا فائدہ تھا: scaling اور fault-tolerance کے فیصلے infrastructure کے فیصلے بن گئے، code کے فیصلے نہیں۔


**Dedicated Hosts: Compliance کا آپشن**

کچھ software licenses (Oracle، کچھ configurations میں Windows Server) فی physical socket یا core قیمت رکھتی ہیں۔ جب آپ یہ software ایک shared host پر چلاتے ہیں (EC2 کے لیے default)، تو آپ ایسی capacity کی ادائیگی کر رہے ہوں گے جو آپ استعمال نہیں کر رہے۔

**Dedicated Hosts** آپ کو ایک physical server تک رسائی دیتے ہیں جو مکمل طور پر آپ کے استعمال کے لیے ہے۔ آپ اپنے موجودہ per-socket licenses لا سکتے ہیں۔ کوئی اور AWS customer کی instances ایک ہی hardware پر نہیں چلتیں۔

Dedicated Hosts standard EC2 سے نمایاں طور پر زیادہ مہنگے ہیں۔ یہ ایک compliance اور licensing tool ہیں، cost optimization tool نہیں۔

Nimbus کے پاس ایسی کوئی licensing ضروریات نہیں تھیں جنہیں Dedicated Hosts کی ضرورت ہو۔ زیادہ تر cloud-native applications کے پاس نہیں ہوتیں۔

**تبدیلی: جب Commitment الٹا پڑ جائے**

اگر آپ کا workload 12 ماہ کے لیے قابل پیش گوئی اور مستحکم ہے، تو Reserved Instances زیادہ سے زیادہ discount فراہم کرتی ہیں — لیکن اگر اس عرصے کے دوران آپ کی instance type کی ضروریات نمایاں طور پر بدل سکتی ہیں، تو وہ lock-in آپ کو ایسی flexibility کی قیمت ادا کرائے گا جو price کے فرق سے زیادہ قیمتی ہے۔ Convertible RIs اس کا کچھ حل کرتی ہیں، لیکن کم discount پر۔ Compute Savings Plans اس کا زیادہ تر حل کرتی ہیں، Standard RIs کے مقابلے میں قدرے کم زیادہ سے زیادہ discount پر۔

اگر آپ fault-tolerant batch jobs کے لیے Spot Instances استعمال کرتے ہیں، تو آپ 60-90% بچت حاصل کر سکتے ہیں — لیکن اگر وہی instances live user requests serve کرتی ہیں، تو mid-request interruption کا مطلب ناکام transactions اور ناخوش customers ہیں۔ Workload کی interruption کے لیے برداشت فیصلہ کن متغیر ہے۔

ایک زیادہ باریک غلط-انتخاب کیس ہے: Savings Plan کو زیادہ commit کرنا۔ اگر آپ ایک $3.00/hour Compute Savings Plan خریدتے ہیں کیونکہ آپ کا compute usage پچھلی سہ ماہی اوسطاً $3.00/hour تھا، پھر اس سہ ماہی اپنی services کو optimize کرتے ہیں (کل usage کو $1.80/hour تک گرا دیتے ہیں)، تو آپ بہرحال committed $3.00/hour ادا کرتے ہیں۔ $1.20/hour کا فرق ضیاع ہے۔ (نوٹ کریں کہ EC2 workloads کو Fargate یا Lambda پر منتقل کرنا ایک Compute Savings Plan کو بے کار *نہیں* چھوڑے گا — یہ تینوں کو cover کرتا ہے۔ بے کار ہونے کے خطرات حقیقی usage میں کمی، یا EC2 Instance Savings Plans اور RIs کے ساتھ family lock-in ہیں۔) یہی وجہ ہے کہ floor strategy اہم ہے: اپنے کم سے کم پر commit کریں، اپنے اوسط پر نہیں۔ اور سہ ماہی review کریں۔

اصول: جس کے بارے میں آپ کو یقین ہو اس پر commit کریں۔ جس کے بارے میں نہیں اس کے لیے On-Demand استعمال کریں۔ Spot صرف اس کے لیے استعمال کریں جو ایک hard stop سے بچ سکے۔

**ایک Mixed Fleet بنانا**

پختہ approach: متعدد pricing models مل کر استعمال کریں۔

Nimbus کے API fleet کے لیے:

- **Baseline load (4 instances، ہمیشہ چل رہی ہیں)**: Savings Plan commitment سے cover کی گئی
- **Predictable peak (business hours کے دوران 2 اضافی instances)**: اگر commitment انہیں cover کرے تو Savings Plan سے، ورنہ On-Demand
- **Traffic spike overflow**: Spot Instances (قابل قبول کیونکہ API servers stateless ہیں — اگر کوئی instance terminate ہو تو requests دوبارہ تقسیم ہو جاتی ہیں)

نتیجہ: ایک ایسا fleet جو ہر layer پر لاگت optimize کرتا ہے — قابل پیش گوئی حصے کے لیے committed pricing، غیر قابل پیش گوئی growth کے لیے On-Demand، burst capacity کے لیے Spot۔

**Savings Plan Utilization کی Monitoring**

ایک Savings Plan خریدنا کام کا اختتام نہیں ہے۔ یہ ایک تکرار شدہ ذمہ داری کا آغاز ہے: یہ جاننا کہ commitment کمائی جا رہی ہے یا نہیں۔

Tom نے ہر سہ ماہی کے پہلے پیر کے لیے ایک calendar reminder طے کیا: Savings Plan utilization review۔ Tool تھا AWS Cost Explorer۔ خاص طور پر، "Reservations and Savings Plans" کے تحت "Savings Plans" tab، جو تین اعداد دکھاتا تھا جن کی اسے پروا تھی:

- **Utilization rate**: committed spend کا کتنا فیصد اصل میں eligible usage سے میل کھایا؟ 100% سے کم عدد کا مطلب تھا کہ وہ ایسی commitment کی ادائیگی کر رہا تھا جو استعمال نہیں ہو رہی تھی۔
- **Coverage rate**: eligible EC2 usage کا کتنا فیصد Savings Plan سے cover ہو رہا تھا، بمقابلہ On-Demand rates پر چلنے کے؟ 80% سے کم عدد کا مطلب تھا کہ ایسا uncovered usage موجود تھا جسے ایک بڑی commitment پکڑ لیتی۔
- **On-Demand spend**: EC2 spend کا وہ حصہ جو کسی Savings Plan سے cover نہیں ہوا۔ اگر یہ بڑھ رہا تھا، تو یا تو Savings Plan کم سائز کا تھا یا commitment کے دائرہ کار سے باہر نئے workloads شامل کیے گئے تھے۔

پہلی سہ ماہی review پر، اعداد کچھ ایسے لگے:

- Utilization: 97%۔ committed spend کا تین فیصد بے میل جا رہا تھا — $330/month commitment پر $9.90 فی مہینہ۔ یہ قابل قبول تھا؛ اس کا مطلب تھا کہ commitment اصل floor usage سے قدرے اوپر طے کی گئی تھی، جو دانستہ تھا۔
- Coverage: 84%۔ eligible EC2 usage کا سولہ فیصد On-Demand پر چل رہا تھا۔ یہ burst capacity تھی — وہ overflow instances جو traffic spikes کے دوران spin up ہوتی تھیں اور commitment سے cover نہیں تھیں۔
- On-Demand EC2 spend: $147/month۔ Spot Instances (Savings Plans سے cover نہیں، علیحدہ قیمت) باقی کا زیادہ تر حصہ تھیں۔

"97% utilization صحت مند ہے،" Tom نے کہا۔ "اس کا مطلب ہے کہ ہم زیادہ commit نہیں ہیں۔ اگر یہ 80% ہوتا، تو میں جان لیتا کہ ہم نے زیادہ خرید لیا ہے۔"

"اور 84% coverage؟" Maya نے پوچھا۔

"یہ بھی ٹھیک ہے۔ وہ 16% جو On-Demand ہے وہ burst capacity ہے — وہ instances جو peak کے دوران گھنٹوں چلتی ہیں، سارا دن نہیں۔ انہیں cover کرنے کے لیے ہمیں نمایاں طور پر زیادہ Savings Plan commitment خریدنی پڑے گی، اور وہ شاید اسے جواز فراہم نہ کریں۔" اس نے حساب چلایا: uncovered On-Demand instances شاید فی مہینہ 40 گھنٹے چل رہی تھیں $0.101/hour فی instance پر۔ انہیں Savings Plan سے cover کرنے کے لیے ایسی commitment درکار ہوتی جسے ہم 90% وقت کم استعمال کر رہے ہوتے۔ انہیں On-Demand پر چھوڑنا بہتر ہے۔

دوسری سہ ماہی review پر، چھ ماہ بعد، ایک metric بدل چکا تھا: On-Demand EC2 spend بڑھ کر $290/month ہو گیا تھا۔ Nimbus Instant feature launch ہو چکا تھا، اور Tom کے دھیان میں آئے بغیر کئی نئی background service instances شامل کی گئی تھیں۔

"یہ تین instances،" Tom نے Cost Explorer کے breakdown کی طرف اشارہ کرتے ہوئے کہا۔ "یہ تین ماہ سے On-Demand پر چل رہی ہیں۔ اگر یہ چلتی رہنے والی ہیں، تو ہمیں انہیں Savings Plan commitment میں شامل کرنا چاہیے۔"

سہ ماہی review نے اسے پکڑ لیا تھا۔ review کے بغیر، وہ تین instances غیر معینہ مدت تک walk-in rates پر چلتی رہتیں۔

"آپ commitment کو کیسے adjust کرتے ہیں؟" Priya نے پوچھا۔

"آپ موجودہ کے اوپر ایک نیا، اضافی Savings Plan خریدتے ہیں،" Tom نے کہا۔ "Savings Plans stack ہوتی ہیں۔ میں نئی baseline کے لیے ایک $0.10/hour Compute Savings Plan شامل کروں گا۔ موجودہ $0.45/hour plan اپنی تین سال کی term ختم ہونے تک جاری رہتا ہے۔ نیا plan اپنی خود کی تین سال کی term شروع کرتا ہے۔"

"تو ہمارے پاس دو overlapping Savings Plans ہوں گی۔"

"ہاں۔ وہ جو بھی eligible usage موجود ہو اس پر آزادانہ apply ہوتی ہیں۔ AWS انہیں سب سے زیادہ فائدہ مند سے کم سے کم فائدہ مند کی ترتیب میں میل کرتا ہے۔"

"کیا ہم نے سوچا ہے کہ اگر ہم اگلے سال ان میں سے ایک background service بیچ دیں تو کیا ہوگا؟" Priya نے پوچھا۔ "ہم نے تین سال کے لیے $0.55/hour پر commit کیا ہے۔"

"یہی تین سال کی term کا خطرہ ہے،" Tom نے کہا۔ "یہی وجہ ہے کہ نئی commitment چھوٹی ہے — میں نئے workloads کے floor پر commit کر رہا ہوں، اوسط پر نہیں۔ اگر ہم ایک service decommission کریں اور usage گر جائے، تو باقی services کو پھر بھی پورا committed amount استعمال کرنا چاہیے۔"

سہ ماہی review کا ضبط دلکش نہیں تھا۔ یہ Cost Explorer میں پندرہ منٹ تھے، تین اعداد چیک کیے گئے، ایک فیصلہ کیا گیا یا ملتوی کیا گیا۔ لیکن تین سالوں میں، یہی ضبط ایک ایسے Savings Plan کے درمیان فرق تھا جو 90%+ utilization فراہم کرتا — حقیقی بچت — اور ایک ایسے کے درمیان جو جزوی ضیاع میں بہہ جاتا جیسے جیسے infrastructure اس کے گرد ارتقا پذیر ہوتی۔

## خوبیاں اور حدود

**On-Demand**: کوئی commitment نہیں۔ پوری قیمت۔ غیر قابل پیش گوئی یا مختصر مدت workloads کے لیے استعمال کریں۔

**Reserved Instances**: 72% تک discount۔ مخصوص instance type/region/OS پر locked۔ Unused capacity کو RI Marketplace پر بیچیں۔

**Savings Plans**: 66-72% تک discount۔ RIs سے زیادہ لچکدار (Compute Savings Plans کسی بھی instance type پر apply ہوتی ہیں)۔ Matching usage پر خودکار application۔

**Spot Instances**: 90% تک discount۔ 2 منٹ interruption کا خطرہ۔ صرف fault-tolerant، stateless، interruptible workloads کے لیے۔

**Dedicated Hosts**: مکمل physical server۔ سب سے مہنگا۔ مخصوص licensing یا compliance scenarios کے لیے ضروری۔

## خلاصہ

Tom نے باقی سنیچر ہر Nimbus workload کو اس کے مثالی pricing model سے map کرنے میں گزارا — baseline سے Savings Plans، nightly batch jobs سے Spot، غیر قابل پیش گوئی overflow سے On-Demand۔ اس مشق نے walk-in rate ادا کرنے کے تین ماہ کو ایک سوچے سمجھے strategy میں بدل دیا۔ اعداد، ایک بار حساب کیے جانے کے بعد، نظر انداز کرنا مشکل تھے۔

- EC2 pricing کے چار models ہیں: **On-Demand** (پوری قیمت، کوئی commitment نہیں)، **Reserved Instances/Savings Plans** (نمایاں discount کے لیے committed spend)، **Spot** (60-90% off پر spare capacity، interruptible)، **Dedicated Hosts** (physical server کی exclusivity)۔
- **Savings Plans** عام طور پر flexibility کے لیے Reserved Instances سے ترجیحی ہیں۔
- **Spot Instances** کو fault-tolerant، stateless workloads کی ضرورت ہوتی ہے — صرف batch jobs، ML training، اور interruptible processing کے لیے۔
- **پائیدار storage (S3) پر Checkpointing** Spot-based batch jobs کے لیے ضروری ہے — interrupted jobs کو آخری checkpoint سے دوبارہ شروع ہونا چاہیے، صفر سے restart نہیں۔
- **Spot Fleet diversification** متعدد instance types اور AZs میں interruption risk کم کرتی ہے اور اکثر بہتر pricing دیتی ہے۔
- بہترین strategy ایک **mixed fleet** ہے: baseline کے لیے Savings Plans، غیر قابل پیش گوئی growth کے لیے On-Demand، interruptible batch کام کے لیے Spot۔
- Pricing models review کریں جب workloads 3+ ماہ سے مستحکم طور پر چل رہے ہوں — یہ وہ وقت ہے جب On-Demand ضیاع بننا شروع ہوتا ہے۔
- **Savings Plan commitments کا سہ ماہی review کریں** — اپنے floor پر commit کریں، اپنے اوسط پر نہیں، اور جیسے جیسے usage patterns بدلیں adjust کریں۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۲)*

- **Savings Plans بمقابلہ Reserved Instances**: Savings Plans زیادہ لچکدار ہیں (Compute Savings Plans کسی بھی EC2 instance پر apply ہوتی ہیں)۔ Reserved Instances ایک مخصوص instance type پر lock کرتی ہیں۔ امتحانی منظر نامے: "discounts حاصل کرتے ہوئے بھی زیادہ سے زیادہ flexibility کی ضرورت" → Savings Plans۔ "3 سال کے لیے exact instance type جانتے ہیں" → زیادہ سے زیادہ discount کے لیے Standard RI۔
- **Spot اشارے**: "cost-sensitive،" "fault-tolerant،" "batch processing،" "interruptions سنبھال سکتے ہیں،" "stateless workloads،" "ML training" → Spot۔
- **Spot interruption handling**: Spot instances کو termination سے پہلے 2 منٹ کی warning ملتی ہے۔ آپ کی application کو اسے gracefully سنبھالنا ضروری ہے (state محفوظ کریں، connections drain کریں، صاف ستھرا exit کریں)۔
- **Web servers کے لیے On-Demand بمقابلہ Spot**: Live user traffic serve کرنے والے web servers کو Spot استعمال نہیں کرنا چاہیے (interruption ناکام requests کا سبب بنتی ہے)۔ Web tier کے لیے On-Demand یا Savings Plans استعمال کریں۔
- **EC2 Savings Plans بمقابلہ Compute Savings Plans**: EC2 Savings Plans ایک مخصوص instance family اور region پر apply ہوتی ہیں (زیادہ discount)۔ Compute Savings Plans کسی بھی EC2 instance، Lambda، اور Fargate پر apply ہوتی ہیں (کم زیادہ سے زیادہ discount، زیادہ لچکدار)۔
- **RI Marketplace**: Unused Standard Reserved Instances دوسرے AWS customers کو بیچی جا سکتی ہیں۔ Convertible RIs نہیں بیچی جا سکتیں۔
- **Hibernation:** stop پر RAM کے مندرجات EBS root volume پر محفوظ کرتا ہے؛ start پر انہیں بحال کرتا ہے۔ Instance ایک cold start سے تیز تر دوبارہ شروع ہوتی ہے، تمام processes اور state سالم کے ساتھ۔ استعمال کریں جب instance state کو sessions کے درمیان محفوظ رکھنا ضروری ہو۔ درکار: launch پر enable کیا گیا ہو (موجودہ instance میں شامل نہیں کیا جا سکتا)، RAM ≤ 150 GB، encrypted EBS root volume، bare-metal instances کے لیے دستیاب نہیں؛ زیادہ سے زیادہ 60 دن hibernated۔ امتحانی اشارہ: "in-memory state محفوظ رکھتے ہوئے instance کو جلدی resume کریں" یا "development instance کو initialize ہونے میں بہت دیر لگتی ہے" → Hibernation۔

## مشقیں

**مشق ۱ — یادداشت**

وضاحت کریں کہ Spot Instances کب مناسب ہیں اور کب نہیں۔ کون سی خاصیت ایک workload کو Spot کے لیے موزوں بناتی ہے؟

*(اشارہ: سوچیں کہ 2 منٹ کے notice کے ساتھ instance terminate ہونے پر کیا ہوتا ہے۔ کون سے workloads صاف ستھرا recover کرتے ہیں؟ کون سے نہیں؟)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک media کمپنی ایک video transcoding pipeline چلاتی ہے جو uploaded videos کو متعدد formats میں convert کرتی ہے۔ Transcoding jobs جب بھی videos upload ہوں مسلسل چلتی ہیں (24/7 operation، variable volume)۔ ہر job 5-30 منٹ لیتا ہے۔ اگر کوئی transcoding job interrupt ہو، تو job data loss کے بغیر شروع سے restart ہو سکتی ہے۔ کمپنی لاگت کم سے کم کرنا چاہتی ہے۔

کون سا EC2 pricing model ان ضروریات کو بہترین طریقے سے پورا کرتا ہے؟

A) Auto Scaling Group میں On-Demand instances  
B) Reserved Instances (1-year، All Upfront)  
C) خودکار instance diversification کے لیے Spot Fleet کے ساتھ Spot Instances  
D) کمپنی کے موجودہ media software licenses کے ساتھ Dedicated Hosts

**اشارہ ۱**: "Data loss کے بغیر شروع سے restart ہو سکتی ہے" — یہ وہ key phrase ہے جو ایک مخصوص pricing model کو enable کرتی ہے۔

**اشارہ ۲**: ایک interruptible workload کے ساتھ "لاگت کم سے کم کریں" maximum-discount option کی طرف اشارہ کرتا ہے۔

**اشارہ ۳**: Spot Fleet متعدد instance types اور AZs سے instances request کرتا ہے، interruption کا امکان کم کرتا ہے۔

**جواب**: C

**وضاحت**: Transcoding jobs fault-tolerant ہیں — وہ interrupt ہونے پر restart ہو سکتی ہیں۔ یہ انہیں Spot Instances کے لیے ideal بناتا ہے، جو On-Demand پر 60-90% discount پیش کرتی ہیں۔ Spot Fleet instance types اور Availability Zones میں diversify کرتا ہے، mass interruption کا امکان کم کرتا ہے۔

**A کیوں نہیں؟** On-Demand سب سے زیادہ لاگت والا option ہے۔ ایک مسلسل چلنے والے، fault-tolerant workload کے لیے، یہ ضیاع ہے۔

**B کیوں نہیں؟** Reserved Instances 50-72% discount فراہم کرتی ہیں لیکن fault-tolerant workloads کے لیے Spot کی ممکنہ 90% discount پیش نہیں کرتیں۔ نیز، RIs قابل پیش گوئی، steady-state workloads کے لیے ہیں — Spot خاص طور پر interruptible batch processing کے لیے ہے۔

**D کیوں نہیں؟** Dedicated Hosts licensing compliance کے لیے ہیں، cost optimization کے لیے نہیں۔ یہ سب سے مہنگا option ہیں۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کے infrastructure میں یہ workloads ہیں:

1. API servers: 6 instances، 24/7 چل رہی ہیں، 2 سالوں سے مستحکم، r6g.large استعمال کرتی ہیں
2. Nightly analytics batch jobs: 4 instances، ہر رات 3AM-6AM چلتی ہیں، ہمیشہ ایک ہی instance type
3. Testing environment: 2 instances، ہفتے کے دنوں میں engineers 9 AM-6 PM استعمال کرتے ہیں
4. Traffic spike overflow: 0-8 instances، peak hours کے دوران spin up، بالکل غیر قابل پیش گوئی

ہر workload type کے لیے بہترین pricing strategy ڈیزائن کریں۔ workloads 1 اور 2 کو کون سی Savings Plan commitment amount cover کرے گی؟ Workload 3 کے لیے، کیا On-Demand سے زیادہ ذہین strategy موجود ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد EC2 pricing strategy کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے Savings Plan کی خریداری submit کی۔

$0.45/hour commitment۔ تین سال کی term۔ Flexibility کے لیے Compute Savings Plans۔

nightly batch کے لیے Spot fleet کے ساتھ مل کر، متوقع بچت: تین سالوں میں $42,500 — سال میں چودہ ہزار ڈالر سے کچھ زیادہ۔

Maya نے عدد پڑھا۔ "بیالیس ہزار ڈالر۔"

"ہر چیز کو On-Demand پر چلانے کے مقابلے میں، تین سالوں میں۔"

"یہ کرنے کی لاگت کیا تھی؟"

"تجزیے کی ایک دوپہر،" Tom نے کہا۔ "اور commit کرنے کا فیصلہ۔"

"تین سال طویل عرصہ ہے،" Leo نے کہا۔ "اگر ہم instance types بدلیں تو کیا ہوگا؟"

"Compute Savings Plans کسی بھی EC2 instance type پر apply ہوتی ہیں۔ اور تین سالوں میں، ہم اتنے بڑے ہوں گے کہ یہ گفتگو بہرحال مختلف نظر آئے گی۔"

Leo نے اس پر سوچا۔

"آپ Savings Plans کے بارے میں کب سے جانتے ہیں؟" اس نے پوچھا۔

"جب سے ہم نے شروع کیا،" Tom نے کہا۔ "میں انتظار کر رہا تھا جب تک workload commit کرنے کے لیے کافی مستحکم نہ ہو۔"

"اٹھارہ ماہ On-Demand ادا کرتے ہوئے انتظار کیا۔"

"ہاں۔" Tom نے console بند کیا۔ "کبھی کبھی سب سے مہنگی چیز جو آپ کرتے ہیں وہ پیسہ بچانے کا انتظار کرنا ہوتی ہے۔"

اگلے باب میں: وہی ضبط storage costs پر لاگو کیا جاتا ہے، اس بارے میں کچھ حیرانیوں کے ساتھ کہ bill کو کیا چلا رہا ہے۔
