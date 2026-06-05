# باب ۲۷: جو آپ کو چاہیے اس کی ادائیگی

Tom ہر مہینے AWS bill review کرتا رہا تھا Nimbus شروع ہونے کے بعد سے۔ پہلے سال، وہ تقریباً 60% سمجھتا تھا جو دیکھتا تھا۔ اب وہ تقریباً سب کچھ سمجھتا تھا — EC2 section کے علاوہ۔

EC2 section مختلف instance types پر "On-Demand instances" کا ایک mix تھا، سب کو فی گھنٹہ قیمت، سب $2,340/month تک جمع ہو رہے تھے۔

"میں جانتا ہوں کہ ہمیں یہ instances کی ضرورت ہے،" Tom نے کہا۔ "لیکن میں نہیں سمجھتا کہ ہم ان سب کے لیے walk-in rate کیوں ادا کر رہے ہیں۔"

"Walk-in rate؟" Leo نے پوچھا۔

"On-Demand pricing،" Tom نے کہا۔ "یہ ایسا ہے جیسے صبح جب آپ کو ضرورت ہو hotel room book کرنا۔ زیادہ سے زیادہ flexibility۔ زیادہ سے زیادہ قیمت۔"

"تو متبادل کیا ہے؟"

Tom نے EC2 pricing page کھولا۔

"چار pricing models ہیں،" اس نے کہا۔ "اور ہم صرف ایک استعمال کر رہے ہیں۔"

**Hotel کی مثال**

EC2 pricing حیرت انگیز طور پر hotel room booking strategies سے match کرتی ہے:

**On-Demand**: Front desk پر بغیر reservation کے چلیں۔ آپ مکمل rack rate ادا کرتے ہیں، لیکن جب چاہیں check out کر سکتے ہیں۔ غیر قابل پیش گوئی قیام کے لیے بالکل درست۔

**Reserved Instances/Savings Plans**: پورے سال کے لیے پہلے سے کمرہ book کریں۔ آپ کو ایک significant discount ملتا ہے — 30-72% off — commitment کے بدلے میں کہ آپ اسے استعمال کریں گے۔

**Spot Instances**: Hotel جو بھی وقت کے مطابق accept کرنے کے لیے تیار ہو اس پر unsold کمروں کے لیے bid کریں۔ 90% تک off۔ لیکن hotel آپ سے دو منٹ کے notice کے ساتھ check out کرنے کو کہہ سکتا ہے اگر انہیں کمرے کی full-price customer کے لیے ضرورت ہو۔

**Dedicated Hosts**: Hotel کی پوری floor خصوصی طور پر اپنے لیے rent کریں۔ دوسرے guests کے ساتھ sharing نہیں۔ نمایاں طور پر زیادہ مہنگا۔ ضروری جب software licensing یا compliance قواعد physical host sharing سے منع کریں۔

ہر model کا ایک use case ہے۔ Nimbus جو غلطی کر رہا تھا: ہر چیز کے لیے On-Demand استعمال کرنا، ان workloads سمیت جو 24/7 چلتے تھے اور مکمل طور پر قابل پیش گوئی تھے۔

**On-Demand Instances: زیادہ سے زیادہ Flexibility، زیادہ سے زیادہ لاگت**

**کب استعمال کریں**:

- غیر قابل پیش گوئی workloads (traffic spikes جو آپ forecast نہیں کر سکتے)
- Development اور testing (کثرت سے start اور stop)
- مختصر مدت workloads (ایک ہفتے کے لیے experiment چلانا)
- پہلی deployment (usage patterns سمجھنے سے پہلے)

**کب استعمال نہ کریں**:

- Steady-state production workloads جو آپ جانتے ہیں ایک سال سے زیادہ چلیں گے
- قابل پیش گوئی baseline load والی کوئی بھی چیز

Tom نے Nimbus کے On-Demand instances شناخت کیے:

- Web API servers: 4 EC2 instances، 18 ماہ سے 24/7 چل رہے ہیں۔ *قابل پیش گوئی baseline۔*
- Database proxy (RDS Proxy): ہمیشہ چل رہا ہے۔ *قابل پیش گوئی baseline۔*
- VPN server: ہمیشہ چل رہا ہے۔ *قابل پیش گوئی baseline۔*
- ٹریفک spikes کے لیے اضافی API servers: غیر قابل پیش گوئی۔ *On-Demand یہاں درست ہے۔*

**Reserved Instances: سال بھر کی Commitment**

**Reserved Instances (RIs)** ایک billing commitment ہیں — آپ ایک مخصوص instance type کو ایک مخصوص region میں 1 یا 3 سال کے لیے استعمال کرنے پر agree کرتے ہیں۔ بدلے میں، AWS کم hourly rate charge کرتا ہے۔

**Discount tiers**:

- 1-year، No Upfront: ~30-40% discount بمقابلہ On-Demand
- 1-year، Partial Upfront: ~35-45% discount (کچھ ابھی ادا کریں، کم فی گھنٹہ)
- 1-year، All Upfront: ~40-50% discount (پورا سال ابھی ادا کریں)
- 3-year، All Upfront: ~55-72% discount (زیادہ سے زیادہ discount، زیادہ سے زیادہ commitment)

**Standard بمقابلہ Convertible RIs**:

- **Standard**: exact instance type اور region پر locked۔ اگر آپ کو مزید ضرورت نہ رہے تو Reserved Instance Marketplace پر بیچا جا سکتا ہے۔
- **Convertible**: Commitment period کے دوران instance type، OS، اور tenancy بدل سکتے ہیں۔ Standard سے کم discount (~50% max بمقابلہ 72%)۔

Tom نے 4 API servers کا حساب لگایا (r6g.large، $0.252/hour On-Demand):

- سالانہ On-Demand لاگت: $0.252 × 24 × 365 × 4 = $8,820
- 1-year All Upfront RI (1 instance): ~$1,600 upfront
- 4 instances: ~$6,400 upfront = **پہلے سال میں $2,420 بچائے**

"ہم صرف commit کر کے $2,420 بچا سکتے ہیں،" Tom نے کہا۔

"یہ ایک commitment ہے،" Maya نے کہا۔ "اگر ہمیں instance types بدلنے کی ضرورت ہو تو کیا ہوگا؟"

"اگر ہمیں لگتا ہے تو ہم Convertible RIs لیتے ہیں۔"

"اگر AWS ایک بہتر instance type release کرے تو کیا ہوگا؟"

"ہم RI expire ہونے پر چیک کرتے ہیں۔ اگر نیا type بہتر ہو، ہم ایک نئی RI خریدتے ہیں۔"

**Savings Plans: لچکدار Commitment**

**Savings Plans** Reserved Instances کا ایک نیا، زیادہ لچکدار متبادل ہیں۔ ایک مخصوص instance type commit کرنے کی بجائے، آپ ایک مخصوص *hourly spend کی مقدار* (dollars میں) commit کرتے ہیں۔

**Compute Savings Plans**: کسی بھی EC2 instance پر apply ہوتی ہیں، type، size، region، یا OS سے قطع نظر۔ سب سے لچکدار۔ 66% تک discount۔

**EC2 Instance Savings Plans**: ایک region میں ایک مخصوص instance family پر apply ہوتی ہیں (مثلاً "us-east-1 میں c6g instances")۔ Compute سے زیادہ restrictive، لیکن 72% تک discount (RI maximum کی طرح)۔

**SageMaker Savings Plans**: SageMaker ML training اور inference کے لیے مخصوص۔

Nimbus کے لیے: ان کے API servers کے لیے Compute Savings Plans۔ انہوں نے $1.50/hour EC2 spend commit کیا۔ کوئی بھی instance type، کوئی بھی size۔ جب وہ fleet scale up کریں یا instance types تبدیل کریں، Savings Plan اب بھی apply ہوگا۔

"یہ Reserved Instances سے ہمارے لیے بہتر ہے،" Leo نے کہا۔ "ہم ابھی بھی instance types کے ساتھ experiment کر رہے ہیں۔ Compute Savings Plan r6g سے locked ہوئے بغیر discount دیتا ہے۔"

**Spot Instances: 90% Discount**

**Spot Instances** AWS کی spare EC2 capacity استعمال کرتی ہیں۔ جب AWS کے پاس unused servers ہوں، آپ انہیں On-Demand قیمت سے 60-90% نیچے rent کر سکتے ہیں۔ جب AWS کو capacity واپس چاہیے (On-Demand یا Reserved customers کے لیے)، وہ آپ کو 2 منٹ کی warning دیتے ہیں اور آپ کی instance terminate کر دیتے ہیں۔

Interruption risk defining characteristic ہے۔ Spot Instances صرف ان کے لیے appropriate ہیں:

- **Fault-tolerant workloads**: اگر ایک instance mid-task terminate ہو، task کچھ corrupt کیے بغیر restart ہو سکتا ہے
- **Stateless processing**: Image resizing، video encoding، batch analytics، ML training
- **مختصر مدت batch jobs**: 2 منٹ کی warning state save کرنے اور checkpoint کرنے کے لیے کافی ہے
- **Auto Scaling mixed fleets**: ASG کی اکثریت کے لیے Spot استعمال کریں baseline کے طور پر On-Demand کے ساتھ

Nimbus کے لیے: Spot Instances رات کے batch analytics jobs کے لیے سمجھ آتا تھا جو ہر رات (آرڈر data کو aggregated reports میں process کرنا) چلتی تھیں۔ اگر ایک Spot Instance mid-job terminate ہو، job ناکام ہوتی ہے، لیکن ایک نئی instance پر شروع سے restart ہوتی ہے۔ S3 میں data محفوظ ہے۔

"رات کی job کے لیے Spot استعمال کرنے سے اس کی لاگت $12/رات سے $2/رات تک گر گئی،" Leo نے رپورٹ کیا۔

**Dedicated Hosts: Compliance آپشن**

کچھ software licenses (Oracle، کچھ configurations میں Windows Server) فی physical socket یا core قیمت ہیں۔ جب آپ یہ software shared host پر چلاتے ہیں (EC2 کے لیے default)، آپ اس capacity کے لیے ادائیگی کر رہے ہوں گے جو آپ استعمال نہیں کر رہے۔

**Dedicated Hosts** آپ کو ایک physical server تک رسائی دیتے ہیں جو مکمل طور پر آپ کے استعمال کے لیے ہے۔ آپ اپنے موجودہ per-socket licenses لا سکتے ہیں۔ کوئی اور AWS customer کی instances ایک ہی hardware پر نہیں چلتیں۔

Dedicated Hosts standard EC2 سے نمایاں طور پر زیادہ مہنگے ہیں۔ یہ ایک compliance اور licensing tool ہیں، cost optimization tool نہیں۔

Nimbus کے پاس ایسی licensing ضروریات نہیں تھیں۔ زیادہ تر cloud-native ایپلیکیشنز کے پاس نہیں ہوتیں۔

**ایک Mixed Fleet بنانا**

پختہ approach: متعدد pricing models مل کر استعمال کریں۔

Nimbus کے API fleet کے لیے:

- **Baseline load (4 instances، ہمیشہ چل رہے ہیں)**: Savings Plan commitment سے cover کیا گیا
- **Predictable peak (business hours کے دوران 2 اضافی instances)**: اگر commitment cover کرے Savings Plan سے، ورنہ On-Demand
- **ٹریفک spike overflow**: Spot Instances (قابل قبول کیونکہ API servers stateless ہیں — اگر instance terminate ہو تو requests redistribute ہوتی ہیں)

نتیجہ: ہر layer پر cost optimize کرنے والا ایک fleet — قابل پیش گوئی حصے کے لیے committed pricing، غیر قابل پیش گوئی growth کے لیے On-Demand، burst capacity کے لیے Spot۔

## خوبیاں اور حدود

**On-Demand**: کوئی commitment نہیں۔ مکمل قیمت۔ غیر قابل پیش گوئی یا مختصر مدت workloads کے لیے استعمال کریں۔

**Reserved Instances**: 72% تک discount۔ مخصوص instance type/region/OS پر locked۔ Unused capacity کو RI Marketplace پر بیچیں۔

**Savings Plans**: 66-72% تک discount۔ RIs سے زیادہ لچکدار (Compute Savings Plans کسی بھی instance type پر apply ہوتے ہیں)۔ Matching usage پر خودکار application۔

**Spot Instances**: 90% تک discount۔ 2 منٹ interruption کا خطرہ۔ صرف fault-tolerant، stateless، interruptible workloads کے لیے۔

**Dedicated Hosts**: مکمل physical server۔ سب سے مہنگا۔ مخصوص licensing یا compliance scenarios کے لیے ضروری۔

## خلاصہ

- EC2 pricing کے چار models ہیں: **On-Demand** (مکمل قیمت، کوئی commitment نہیں)، **Reserved Instances/Savings Plans** (committed spend کے لیے significant discount)، **Spot** (60-90% off پر spare capacity، interruptible)، **Dedicated Hosts** (physical server exclusivity)۔
- **Savings Plans** عام طور پر flexibility کے لیے Reserved Instances سے ترجیحی ہیں۔
- **Spot Instances** fault-tolerant، stateless workloads کی ضرورت رکھتے ہیں — صرف batch jobs، ML training، اور interruptible processing کے لیے۔
- زیادہ سے زیادہ strategy ایک **mixed fleet** ہے: baseline کے لیے Savings Plans، غیر قابل پیش گوئی growth کے لیے On-Demand، interruptible batch work کے لیے Spot۔
- Pricing models review کریں جب workloads 3+ ماہ سے steadily چل رہے ہوں — یہ وہ وقت ہوتا ہے جب On-Demand waste بننا شروع ہوتا ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۲)*

- **Savings Plans بمقابلہ Reserved Instances**: Savings Plans زیادہ لچکدار ہیں (Compute Savings Plans کے لیے کسی بھی EC2 instance پر apply)۔ Reserved Instances ایک مخصوص instance type پر lock کرتی ہیں۔ امتحانی منظر نامے: "discounts مل کر بھی maximum flexibility کی ضرورت" → Savings Plans۔ "3 سال کے لیے exact instance type جانتے ہیں" → Standard RI maximum discount کے لیے۔
- **Spot اشارے**: "cost-sensitive،" "fault-tolerant،" "batch processing،" "interruptions سنبھال سکتے ہیں،" "stateless workloads،" "ML training" → Spot۔
- **Spot interruption handling**: Spot instances termination سے پہلے 2 منٹ کی warning ملتی ہے۔ آپ کی ایپلیکیشن کو اسے gracefully سنبھالنا ضروری ہے (state save کریں، connections drain کریں، cleanly exit کریں)۔
- **Web servers کے لیے On-Demand بمقابلہ Spot**: Live user traffic serve کرنے والے web servers Spot استعمال نہیں کرنے چاہئیں (interruption ناکام requests کا سبب بنتا ہے)۔ Web tier کے لیے On-Demand یا Savings Plans استعمال کریں۔
- **EC2 Savings Plans بمقابلہ Compute Savings Plans**: EC2 Savings Plans ایک مخصوص instance family اور region پر apply ہوتے ہیں (زیادہ discount)۔ Compute Savings Plans کسی بھی EC2 instance، Lambda، اور Fargate پر apply ہوتے ہیں (کم maximum discount، زیادہ لچکدار)۔
- **RI Marketplace**: Unused Standard Reserved Instances دوسرے AWS customers کو بیچے جا سکتے ہیں۔ Convertible RIs نہیں بیچے جا سکتے۔

## مشقیں

**مشق ۱ — یادداشت**

بیان کریں Spot Instances کب appropriate ہیں اور کب نہیں۔ ایک workload کو Spot کے لیے موزوں کیا خاصیت بناتی ہے؟

*(اشارہ: سوچیں کہ 2 منٹ کے notice کے ساتھ instance terminate ہونے پر کیا ہوتا ہے۔ کون سے workloads cleanly recover کرتے ہیں؟ کون سے نہیں؟)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک میڈیا کمپنی ایک video transcoding pipeline چلاتی ہے جو uploaded videos کو متعدد formats میں convert کرتی ہے۔ Transcoding jobs جب بھی videos uploaded ہوں مسلسل چلتے ہیں (24/7 operation، variable volume)۔ ہر job 5-30 منٹ لیتا ہے۔ اگر کوئی transcoding job interrupted ہو، job data loss کے بغیر شروع سے restart ہو سکتی ہے۔ کمپنی لاگت minimize کرنا چاہتی ہے۔

کون سا EC2 pricing model ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) Auto Scaling Group میں On-Demand instances  
B) Reserved Instances (1-year، All Upfront)  
C) خودکار instance diversification کے لیے Spot Fleet کے ساتھ Spot Instances  
D) کمپنی کے موجودہ media software licenses کے ساتھ Dedicated Hosts

**اشارہ ۱**: "Data loss کے بغیر شروع سے restart ہو سکتی ہے" — یہ key phrase ایک مخصوص pricing model کو enable کرتی ہے۔

**اشارہ ۲**: "Lاگت minimize کریں" interruptible workload کے ساتھ maximum-discount option کی طرف اشارہ کرتا ہے۔

**اشارہ ۳**: Spot Fleet متعدد instance types اور Availability Zones میں diversify کرتا ہے، interruption کا امکان کم کرتا ہے۔

**جواب**: C

**وضاحت**: Transcoding jobs fault-tolerant ہیں — وہ interrupted ہونے پر restart ہو سکتی ہیں۔ یہ انہیں Spot Instances کے لیے ideal بناتا ہے، جو On-Demand سے 60-90% discount پیش کرتے ہیں۔ Spot Fleet instance types اور Availability Zones میں diversify کرتا ہے، mass interruption کا امکان کم کرتا ہے۔

**A کیوں نہیں؟** On-Demand سب سے زیادہ لاگت والا option ہے۔ مسلسل چلنے والے، fault-tolerant workload کے لیے، یہ wasteful ہے۔

**B کیوں نہیں؟** Reserved Instances 50-72% discount فراہم کرتی ہیں لیکن fault-tolerant workloads کے لیے Spot کی ممکنہ 90% discount پیش نہیں کرتیں۔ RIs stable، steady-state workloads کے لیے ہیں — Spot خاص طور پر interruptible batch processing کے لیے ہے۔

**D کیوں نہیں؟** Dedicated Hosts licensing compliance کے لیے ہیں، cost optimization کے لیے نہیں۔ یہ سب سے مہنگا option ہے۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۲*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کے infrastructure میں یہ workloads ہیں:

1. API servers: 6 instances، 24/7 چل رہے ہیں، 2 سالوں سے stable، r6g.large استعمال کرتے ہیں
2. رات کے analytics batch jobs: 4 instances، ہر رات 3AM-6AM چلتے ہیں، ہمیشہ ایک ہی instance type
3. Testing environment: 2 instances، ہفتے کے دنوں میں engineers 9 AM-6 PM استعمال کرتے ہیں
4. ٹریفک spike overflow: 0-8 instances، peak hours کے دوران spin up، بالکل غیر قابل پیش گوئی

ہر workload type کے لیے زیادہ سے زیادہ pricing strategy ڈیزائن کریں۔ workloads 1 اور 2 کو کون سی Savings Plan commitment amount cover کرے گی؟ Workload 3 کے لیے، کیا On-Demand سے زیادہ ذہین strategy ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد EC2 pricing strategy کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے Savings Plan purchase submit کی۔

$5.76/hour commitment۔ تین سال کی مدت۔ Flexibility کے لیے Compute Savings Plans۔

متوقع savings: تین سالوں میں $42,500۔

Maya نے نمبر پڑھا۔ "بیالیس ہزار dollars۔"

"ایک ہی instances کے لیے On-Demand کے مقابلے میں، تین سالوں میں۔"

"یہ کرنے کی لاگت کیا تھی؟"

"تجزیہ کرنے میں ایک دوپہر،" Tom نے کہا۔ "Commit کرنے کا فیصلہ۔"

"تین سال طویل عرصہ ہے،" Leo نے کہا۔ "اگر ہم instance types بدلیں تو کیا ہوگا؟"

"Compute Savings Plans کسی بھی EC2 instance type پر apply ہوتے ہیں۔ اور تین سالوں میں، ہم اتنے بڑے ہوں گے کہ یہ گفتگو کسی بھی طرح مختلف نظر آتی ہو۔"

Leo نے یہ سوچا۔

"آپ Savings Plans کے بارے میں کب سے جانتے تھے؟" اس نے پوچھا۔

"جب سے ہم نے شروع کیا،" Tom نے کہا۔ "میں انتظار کر رہا تھا جب تک workload commit کرنے کے لیے کافی stable نہ ہو۔"

"اٹھارہ ماہ کا On-Demand پیسہ بچانے کا انتظار کرتے ہوئے ادا کیا۔"

"ہاں۔" Tom نے console بند کیا۔ "کبھی کبھی سب سے مہنگی چیز جو آپ کرتے ہیں وہ پیسہ بچانے کا انتظار کرنا ہے۔"

اگلے باب میں: storage costs پر وہی discipline لاگو کرنا، bill میں کچھ حیران کن چیزوں کے ساتھ۔
