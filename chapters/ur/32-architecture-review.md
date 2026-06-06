# باب ۳۲: منصوبے کا دفاع

Carlos واپس آیا، Well-Architected session کے چند ہفتے بعد۔ اس بار laptop اس کے bag میں ہی رہا؛ اس نے اس کے بجائے ایک whiteboard marker اٹھایا، کمرے میں ہر شخص کا استقبال کیا، board کے قریب ایک جگہ ڈھونڈی، اور marker کا ڈھکنا کھولا۔

"مجھے Nimbus کے بارے میں بتائیں،" اس نے کہا۔ جیسے اس نے کبھی اس کے بارے میں سنا ہی نہ ہو۔

**خلاصۂ ماضی: Review سے حساب کتاب تک**

باب ۳۱ کے Well-Architected review نے تین high-risk findings سامنے لائی تھیں اور Maya کا بڑھتا ہوا شعور کہ team نے جو فیصلے کیے تھے اور جو فیصلے انہوں نے *سوچ سمجھ کر* کیے تھے ان کے درمیان ایک gap تھا۔ Framework نے انہیں اس gap کے لیے ایک vocabulary دیا تھا۔ جو یہ نہیں دے سکتا تھا وہ اسے real time میں بند کرنے کی مشق تھی — کسی feature کے ship ہونے سے پہلے، بعد میں نہیں۔ یہی وہ تھا جس کے لیے Carlos یہاں تھا۔ Maya نے اسے خاص طور پر مدعو کیا تھا کیونکہ Nimbus کچھ نمایاں بنانے والا تھا، اور وہ production code کی پہلی line لکھے جانے سے پہلے ایک منظم چیلنج چاہتی تھی۔

ایک اچھا architecture review ایک pilot کے لیے ایک pre-flight checklist کی طرح ہے۔ جہاز اڑنے کے لیے بالکل تیار نظر آ سکتا ہے — engines چل رہے ہیں، fuel بھرا ہوا ہے، مسافر سوار ہیں۔ لیکن checklist اس لیے موجود ہے کیونکہ تجربہ کار pilots جانتے ہیں کہ جو چیزیں مسائل پیدا کرنے کا سب سے زیادہ امکان رکھتی ہیں وہ بالکل وہی چیزیں ہیں جو ٹھیک محسوس ہوتی ہیں ٹھیک اس وقت تک جب تک وہ نہیں ہوتیں۔ Checklist کا مطلب یہ نہیں کہ pilot کو معلوم نہیں کہ وہ کیا کر رہا ہے۔ اس کا مطلب ہے کہ اس نے یہ ذہن نشین کر لیا ہے کہ ماہرین بھی جب منظم عمل کو چھوڑ دیتے ہیں تو چیزیں چھوٹ جاتی ہیں۔

**معمار کا پہلا قدم**

اس کے بعد جو ہوا اس نے team کو حیران کر دیا۔

Maya نے نظام بیان کرنا شروع کیا — EC2 instances، Aurora، CloudFront، ElastiCache، menu کے لیے DynamoDB، private subnets کے ساتھ VPC...

Carlos نے اسے نرمی سے روکا۔

"business سے شروع کریں،" اس نے کہا۔ "technology سے نہیں۔"

وہ رکی۔ پھر: "Nimbus ایک restaurant ordering platform ہے۔ ہمارے 287 restaurant partners ہیں۔ ہم روزانہ تقریباً 4,200 orders process کرتے ہیں۔ اوسط order value $34 ہے۔ ہم سہ ماہی بہ سہ ماہی 18% بڑھ رہے ہیں۔"

"اچھا۔ سب سے اہم چیز کیا ہے جو Nimbus کو کرنی ہی چاہیے؟"

"Orders process کرنا،" Leo نے کہا۔

"خاص طور پر،" Carlos نے زور دیا۔

"ایک order placement کے پانچ سیکنڈ کے اندر restaurant تک پہنچنا چاہیے،" Priya نے کہا، "ورنہ kitchen timing window چھوڑ دیتا ہے۔"

"اگر ایسا نہ ہو تو کیا ہوتا ہے؟"

"Restaurant ایک غلطی کرتا ہے۔ Customer کو غلط کھانا ملتا ہے، یا بہت زیادہ انتظار کرتا ہے۔ وہ شکایت کرتے ہیں۔ ہم ایک restaurant partner کھو دیتے ہیں۔"

"تو پانچ-سیکنڈ کا SLA،" Carlos نے کہا، "ایک technical ہدف نہیں ہے۔ یہ ایک business survival کی شرط ہے۔"

خاموشی۔

"یہی،" اس نے کہا، "وجہ ہے کہ architecture کی گفتگو کو business requirements سے شروع کرنا چاہیے۔ technology constraint کے نیچے دھارے میں ہے۔"

**Architecture Review کی ساخت**

ایک حقیقی architecture review — وہ قسم جو آپ کے کچھ اہم بنانے سے پہلے ہوتی ہے، یا جب آپ scale کرنے کا جائزہ لے رہے ہوں — کی ایک ساخت ہوتی ہے۔

Carlos نے اسے whiteboard پر لکھا:

**1. Constraints کو سمجھیں**

کیا سچ ہونا چاہیے؟ کیا نہیں ہو سکتا؟ (یہ نہیں کہ "ہم کیا چاہتے ہیں۔" کون سی چیزیں ناقابل گفت و شنید ہیں؟)

**2. Unknowns کو سمجھیں**

ہم کیا نہیں جانتے؟ ہم کہاں مفروضے بنا رہے ہیں؟ اگر وہ مفروضے غلط ہوں تو کیا ہوتا ہے؟

**3. Options کا جائزہ لیں**

حقیقت پسندانہ متبادل کیا ہیں؟ ہر ایک کے trade-offs کیا ہیں؟

**4. Failure modes کی شناخت کریں**

یہ کیسے ٹوٹتا ہے؟ جب ہر failure mode trigger ہوتا ہے تو واقعات کی ترتیب کیا ہے؟

**5. Monitoring کی validate کریں**

آپ کیسے جانیں گے کہ کب کچھ غلط ہے؟ users کے بتانے سے پہلے؟

**6. Runbook کی وضاحت کریں**

کوئی 3 AM پر کیا کرتا ہے جب یہ ٹوٹتا ہے؟

یہ ایک checklist نہیں ہے جس کی میکانکی طور پر پیروی کی جائے۔ یہ ایک سوچنے کا framework ہے۔ مقصد یہ یقینی بنانا ہے کہ اہم سوالات اس *سے پہلے* پوچھے جائیں کہ آپ production میں ہوں۔

**Review چلانا: Nimbus کی نئی Feature**

Carlos کو خاص طور پر اس لیے مدعو کیا گیا تھا کیونکہ Nimbus کچھ نیا بنانے والا تھا۔

**Feature**: "Nimbus Instant" — ایک 15-منٹ کی delivery گارنٹی۔ اگر کوئی partner restaurant ہفتے میں ایک بار سے زیادہ 15-منٹ window پورا کرنے میں ناکام ہو، تو Nimbus خودبخود customer کو refund کر دے گا۔

"مجھے technical requirements کے بارے میں بتائیں،" Carlos نے کہا۔

Priya نے شروع کیا۔ "ہمیں order placement سے delivery تک real-time tracking چاہیے۔ ہمیں اصل delivery time کا 15-منٹ SLA سے موازنہ کرنا ہے۔ ہمیں خودبخود refunds trigger کرنے ہیں۔"

"tracking data کے لیے latency کی شرط کیا ہے؟"

"تقریباً real-time۔ Customers اپنے فون پر status updates دیکھتے ہیں۔"

"کتنی دیر کے اندر؟"

"شاید پانچ سیکنڈ۔"

"شاید؟"

"پانچ سیکنڈ کے اندر۔ یہ product کی شرط ہے۔"

"اچھا۔ تو پھر event stream کے لیے Kinesis۔ اگر Kinesis میں تاخیر ہو تو failure mode کیا ہے؟"

"Customer کو status updates دیر سے ملتے ہیں۔"

"کیا یہ قابل قبول ہے؟"

"10 سیکنڈ کے لیے؟ شاید۔ 60 سیکنڈ کے لیے؟ نہیں۔"

"تو tracking system کے لیے SLA کیا ہے؟"

Priya نے Leo کی طرف دیکھا۔ "ہمارے پاس ابھی ایک نہیں ہے۔"

Carlos نے board پر لکھا: *Unknown: tracking SLA۔*

"یہ اہم ہے،" اس نے کہا۔ "کیونکہ SLA infrastructure design کا تعین کرتا ہے۔ اگر آپ کا SLA 5 سیکنڈ ہے، تو آپ کو ایک مختلف حل چاہیے بمقابلہ اس کے کہ یہ 60 سیکنڈ ہو۔"

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا۔ "ایک real-time push کے بجائے بس ایک polling mechanism کیوں نہ استعمال کریں جسے app ہر چند سیکنڈ میں چیک کرے؟"

"Latency اور لاگت،" Carlos نے کہا۔ "پیمانے پر ایک polling approach — مثلاً، 10,000 active orders، ہر app ہر 5 سیکنڈ poll کرتی ہے — 2,000 requests فی سیکنڈ ہے، یا 120,000 requests فی منٹ۔ Kinesis کے ذریعے ایک push model updates صرف اس وقت فراہم کرتا ہے جب state بدلتی ہے۔ کم requests، کم latency، اور SLA commitment ایک event log سے audit کرنا آسان ہے۔ Polling چھوٹے پیمانے پر کام کرتا ہے۔ جس پیمانے کی طرف Nimbus جا رہا ہے، push درست بنیاد ہے۔"

Leo، Carlos کی وضاحت کے دوران خاموش رہا تھا۔ پھر: "میں یہ WebSockets کے ساتھ بنانے والا تھا۔"

Carlos نے اس کی طرف دیکھا۔ "مجھے اس میں سے گزاریں۔"

"ہر order کو ایک WebSocket connection ملتا ہے۔ Client اس وقت connect ہوتا ہے جب order place ہوتا ہے۔ Server state changes push کرتا ہے — confirmed، preparing، en route، delivered — جیسے وہ ہوتی ہیں۔ کوئی polling نہیں، کم latency، سادہ model۔"

"WebSocket connection کو کیا برقرار رکھتا ہے؟"

"ایک API Gateway WebSocket endpoint۔ Lambda functions connection اور message events سنبھالتے ہیں۔ DynamoDB connection IDs store کرتا ہے۔"

Carlos نے اسے board پر لکھا۔ "اور failure mode جب client کا network 15 سیکنڈ کے لیے گر جائے؟"

"Connection ختم ہو جاتا ہے۔ Client دوبارہ connect ہوتا ہے اور موجودہ state مانگتا ہے۔"

"کہاں سے؟"

"سے... Lambda handler، جو DynamoDB سے پڑھتا ہے۔"

"تو آپ کے پاس ایک push path اور ایک pull path دونوں ہیں،" Carlos نے کہا۔ "WebSocket push happy path ہے۔ DynamoDB read recovery path ہے۔ آپ یہ کیسے یقینی بناتے ہیں کہ customer کے state کے باسی ہونے کا notice کرنے سے پہلے connection دوبارہ قائم ہو جائے؟"

Leo نے سوچا۔ "Client disconnect کا پتہ لگاتا ہے اور چند سیکنڈ کے اندر دوبارہ connect ہوتا ہے۔ Reconnect logic سیدھی ہے۔"

"ایک ساتھ 10,000 active orders پر — جہاں Nimbus جا رہا ہے — یہ کتنے concurrent WebSocket connections ہیں؟"

"10,000۔"

"API Gateway WebSocket کا فی account default quota 500 **نئے connections فی سیکنڈ** ہے،" Carlos نے کہا۔ "Concurrent connections نہیں — connection کی *شرح*۔ 10,000 مستحکم connections ٹھیک ہیں۔ مسئلہ reconnect storm ہے: جب ایک network blip ایک ساتھ چند ہزار clients کو گرا دے اور وہ سب ایک ہی دو سیکنڈ میں دوبارہ connect ہوں، تو آپ rate quota سے ٹکراتے ہیں اور reconnects بالکل اسی وقت ناکام ہونا شروع ہو جاتے ہیں جب users سب سے زیادہ توجہ دے رہے ہوتے ہیں۔ آپ ایک اضافہ request کر سکتے ہیں، لیکن یہ ایک quota ہے جس پر آپ بڑھنے کے ساتھ دوبارہ غور کر رہے ہوں گے۔ نیز: API Gateway WebSocket فی ملین connection-minutes $0.25 charge کرتا ہے، جمع فی ملین messages $1.00۔ روزانہ 10,000 orders پر ایک اوسط 40-منٹ tracking window کے ساتھ، یہ صرف تقریباً 400,000 connection-minutes فی دن ہے — معمولی رقم۔ ایک ساتھ 10,000 active orders پر، یہ ایک مختلف پیمانہ ہے۔"

"یہ زیادہ نہیں،" Leo نے کہا۔

"10,000 active orders پر نہیں،" Carlos نے کہا۔ "اس پیمانے پر، connection-minute اور message charges کے ساتھ اسے تقریباً $150 فی مہینہ کہیں۔ لاگت یہاں WebSockets کے خلاف دلیل نہیں ہے۔ reconnect storms کے تحت connection-rate quota، اور connection-state management، ہیں۔"

"تو WebSockets پیمانے پر پیچیدہ ہو جاتے ہیں،" Maya نے کہا۔

"اگر آپ اس کے لیے architect کریں تو وہ پیمانے پر قابل انتظام ہو جاتے ہیں،" Carlos نے کہا۔ "یہ غلط نہیں ہے — یہ trade-offs کا ایک مختلف مجموعہ ہے۔ اب مجھے آپ کو polling کا متبادل دکھانے دیں۔"

اس نے دوسرا option بنایا۔

"Polling: client ہر 5 سیکنڈ میں `/orders/{order_id}/status` کو ایک GET request بھیجتا ہے۔ Backend DynamoDB سے پڑھتا ہے۔ موجودہ state واپس کرتا ہے۔"

"یہ بہت ساری requests ہیں،" Priya نے کہا۔

"10,000 active orders × فی 5 سیکنڈ 1 poll = 2,000 requests فی سیکنڈ۔ آپ کے API کو 2,000 RPS سنبھالنے کی ضرورت ہے۔ DynamoDB auto-scale کرتا ہے۔ API Gateway load سنبھالتا ہے۔ لاگت: 2,000 RPS × 3,600 سیکنڈ × 24 گھنٹے × 30 دن = 5.18 بلین requests فی مہینہ۔ API Gateway REST API pricing: $3.50 فی ملین requests = $18,130/month۔"

کمرہ خاموش تھا۔

"یہ پیمانے پر ایک قابل عمل option نہیں ہے،" Tom نے کہا۔

"درست،" Carlos نے کہا۔ "5-سیکنڈ وقفوں پر polling سب سے سادہ implementation اور پیمانے پر سب سے مہنگی ہے۔ یہ active connections کے متناسب load بھی پیدا کرتی ہے، state changes کے متناسب نہیں۔ اگر ایک order 20 منٹ تک 'preparing' میں بیٹھا رہے، تو polling 240 requests پیدا کرتی ہے جو سب ایک ہی state واپس کرتی ہیں۔ یہ ضیاع ہے۔"

"اور Kinesis؟" Maya نے پوچھا۔

"Kinesis فی state change ایک event پیدا کرتا ہے۔ ایک order confirmation: ایک event۔ Kitchen acceptance: ایک event۔ Driver pickup: ایک event۔ Delivery: ایک event۔ فی order چار events، قطع نظر اس کے کہ ہر state کتنی دیر لیتا ہے۔ Consumer — آپ کا backend — Kinesis stream سے پڑھتا ہے اور آپ کے چنے ہوئے کسی بھی delivery mechanism کے ذریعے client کو update push کرتا ہے۔"

"لیکن client کو پھر بھی push وصول کرنے کا ایک طریقہ چاہیے،" Leo نے کہا۔

"ہاں۔ آپ last-mile delivery کے لیے Server-Sent Events، ایک long-poll endpoint، یا WebSockets استعمال کر سکتے ہیں۔ Kinesis آپ کے backend کے لیے قابل اعتماد، ترتیب شدہ، replayable event stream سنبھالتا ہے۔ Client delivery mechanism ایک علیحدہ فیصلہ ہے۔ کلیدی فائدہ: Kinesis event source کو consumer سے ڈی کپل کرتا ہے۔ delivery tracking system، refund system، restaurant notification system، اور customer status display سب آزادانہ طور پر اسی Kinesis stream سے consume کرتے ہیں۔"

"تو یہ WebSockets کے بجائے Kinesis نہیں ہے،" Maya نے کہا۔ "یہ Kinesis جمع ایک ہلکے وزن والا client delivery mechanism ہے۔"

"بالکل۔ Trade-off analysis:"

اس نے اسے لکھا:

| Option | Latency | لاگت (500 / 10K active orders) | پیچیدگی |
|---|---|---|---|
| صرف WebSockets | ~50ms | $8 / $150 فی مہینہ | درمیانی |
| Polling (5s) | 0–5s | $906 / $18,130 فی مہینہ | کم |
| Kinesis + SSE | ~200ms | $8 / $75 فی مہینہ | درمیانی-اعلیٰ |

"Polling option لاگت سے ختم ہو جاتا ہے،" Carlos نے کہا۔ "WebSockets قابل عمل ہیں لیکن پیمانے پر connection management کی ضرورت رکھتے ہیں۔ Kinesis جمع Server-Sent Events قدرے زیادہ latency اور لاگت میں موازنہ پذیر ہے — جو یہ آپ کو خریدتا ہے وہ ہے پائیدار، replayable event log جو آپ کو refund system کے لیے چاہیے، اور ڈی کپل شدہ consumers۔"

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا۔ "اگر WebSockets کی latency کم ہے، تو Kinesis جمع SSE سے زیادہ latency کیوں قبول کریں؟"

"کیا 200ms بمقابلہ 50ms ایک delivery status update دیکھنے والے customer کو محسوس ہوتا ہے؟" Carlos نے پوچھا۔

"نہیں،" اس نے کہا۔

"تو latency کا فرق ادراکی حد سے نیچے ہے۔ دس ہزار active orders پر لاگت کا فرق معمولی ہے — $75 بمقابلہ $150 فی مہینہ۔ معماری فرق اصل دلیل ہے: Kinesis آپ کو ایک پائیدار، replayable event log دیتا ہے — جس کی آپ کو refund audit trail کے لیے ضرورت ہوگی — اور آپ کے tracking consumers کو ڈی کپل کرتا ہے۔ WebSockets آپ سے بعد میں ڈی کپلنگ دوبارہ بنوانے کا تقاضا کریں گے۔"

Leo نے table کی طرف دیکھا۔ "ہم نے تقریباً WebSocket version ship کر دیا تھا۔"

"یہ کام کر جاتا،" Carlos نے کہا۔ "یہی سمجھنے کی اہم بات ہے۔ WebSockets کام کر جاتے۔ architecture میں سوال شاذ و نادر ہی 'کیا یہ کام کرتا ہے؟' ہوتا ہے۔ سوال یہ ہے 'بڑھنے کے ساتھ اس کی لاگت کیا ہے، اور ہمیں بعد میں کیا دوبارہ بنانا پڑتا ہے؟'"


**معمار جو سوالات پوچھتے ہیں**

اگلے دو گھنٹوں میں، Carlos نے team کو review سے گزارا۔ اس کے سوالات کا ایک انتخاب:

**data storage پر**:

"fulfillment کے دوران order state کہاں store ہوتا ہے؟ اگر application mid-delivery crash ہو، تو recovery process کیا ہے؟ کیا آپ صرف events سے state دوبارہ بنا سکتے ہیں؟"

**refund mechanism پر**:

"Refund خودبخود trigger ہوتا ہے۔ کیا چیز ایک refund کو دو بار جاری ہونے سے روکتی ہے؟ اگر payment processor timeout ہو جائے اور آپ کو یقین نہ ہو کہ refund قبول ہوا یا نہیں تو کیا؟"

**delivery tracking پر**:

"آپ courier GPS data پر انحصار کر رہے ہیں۔ اگر GPS signal 90 سیکنڈ کے لیے کھو جائے تو کیا ہوتا ہے؟ آپ 'GPS کھویا' کو 'delivery جاری' سے 'delivery کا مسئلہ' سے کیسے ممیز کرتے ہیں؟"

**failure handling پر**:

"اگر refund service down ہو، تو کیا order پھر بھی گزرتا ہے؟ کیا customer کو پھر بھی اپنا کھانا ملتا ہے؟ ایک جزوی نظام کی ناکامی کے دوران user experience کیا ہے؟"

**observability پر**:

"ابھی آپ کیسے جانتے ہیں کہ کتنے orders فی الحال 15-منٹ SLA کے 5 منٹ کے اندر ہیں؟ اگر وہ عدد spike کرے، تو کسے مطلع کیا جاتا ہے؟"

ہر سوال نے ایک ایسا مفروضہ ظاہر کیا جو team بغیر احساس کے بنا رہی تھی۔

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ،" Leo نے کہا۔ "refund endpoint۔ میں بس payment API کو براہ راست call کرنے والا تھا۔ ہم نے اسے دو بار call کرنے کے بارے میں نہیں سوچا تھا۔" وہ رکا۔ "تو اگر پہلی call کامیاب ہو لیکن ہماری confirmation منتقلی میں کھو جائے، تو ہم دوبارہ call کرتے ہیں اور customer کو دو refunds ملتے ہیں۔"

"کیا ہم نے سوچا ہے کہ اگر payment API پہلی call قبول کرے لیکن ہماری confirmation منتقلی میں کھو جائے تو کیا ہوگا؟" Priya نے پوچھا۔

"یہ idempotency ہے،" Carlos نے کہا۔

"ایک idempotency key — فی refund کوشش ایک منفرد ID، payment API کو call کرنے سے پہلے ایک DB میں store کیا گیا،" Priya نے کہا۔ "اگر ہم ایک ہی key کے ساتھ دو بار call کریں، تو payment API دوسری call کو نظر انداز کر دیتا ہے۔"

"جس کا مطلب ہے،" Carlos نے اضافہ کیا، "کہ آپ کو refund operations کے لیے ایک مستقل state store چاہیے، صرف ایک queue میں ایک event نہیں۔"


"جس monitoring پر ہم نے بات کی،" Carlos نے کہا، "وہ سب infrastructure monitoring ہے۔ CPU۔ Connection count۔ Kinesis lag۔ یہ اہم ہیں — لیکن یہ وہ monitoring نہیں ہے جو آپ کو بتاتی ہے کہ Nimbus Instant کام کر رہا ہے یا نہیں۔"

"وہ monitoring کیا ہے جو ہمیں بتاتی ہے کہ یہ کام کر رہا ہے؟" Maya نے پوچھا۔

"فی restaurant P95 confirmation time۔ 95ویں percentile پر، order placement سے restaurant confirmation تک کتنا وقت لگتا ہے — ہر restaurant partner کے لیے علیحدہ سے ناپا گیا؟"

"ہمارے پاس وہ metric نہیں ہے،" Priya نے کہا۔

"یہی gap ہے،" Carlos نے کہا۔ "آپ کے پاس کامل infrastructure ہو سکتا ہے — ہر alarm پر CloudWatch سبز — اور پھر بھی ایک restaurant partner ہو جس کی confirmation latency تین ہفتوں سے خراب ہو رہی ہو کیونکہ ان کے tablet software میں ایک bug ہے۔ Infrastructure ٹھیک ہے۔ Business SLA کی خلاف ورزی ہو رہی ہے۔ اور آپ کو معلوم نہیں ہوگا جب تک restaurant شکایت کرنے کو call نہ کرے۔"

"ہم اسے کیسے capture کریں؟" Leo نے پوچھا۔

"جب بھی ایک order confirmation وصول ہو ایک custom CloudWatch metric emit کریں یا اپنی analytics pipeline کو push کریں۔ order placement کو timestamp کریں۔ confirmation کو timestamp کریں۔ فرق compute کریں۔ اسے `restaurant_id` کے ساتھ tagged emit کریں۔ ایک CloudWatch dashboard بنائیں جو پچھلے 7 دنوں پر فی restaurant p95 confirmation time دکھائے۔"

"اور جب یہ خراب ہو تو alarm کریں؟" Tom نے پوچھا۔

"Alarm کریں جب کسی مخصوص restaurant کے لیے p95 لگاتار 5 منٹ سے زیادہ 90 سیکنڈ سے تجاوز کرے،" Carlos نے کہا۔ "یہ ایک anomaly ہے جو ایک proactive رابطے کا تقاضا کرتی ہے، نہ کہ شکایت کا انتظار کرنے کا جواب۔"

"یہی infrastructure monitor کرنے اور product monitor کرنے کے درمیان فرق ہے،" Priya نے کہا۔

"بالکل،" Carlos نے کہا۔ "Infrastructure monitoring آپ کو بتاتی ہے کہ آپ کے systems صحت مند ہیں یا نہیں۔ Business-level monitoring آپ کو بتاتی ہے کہ آپ کے customers وہ تجربہ کر رہے ہیں یا نہیں جس کا آپ نے ان سے وعدہ کیا تھا۔ آپ کو دونوں چاہئیں۔ زیادہ تر teams کے پاس صرف پہلی ہوتی ہے۔"

Maya نے اسے ADR appendix میں شامل کیا: infrastructure health metrics کے علاوہ فی restaurant p95 confirmation time track کریں۔ Alarm thresholds product team کی طرف سے restaurant success team کی مشاورت سے متعین کیے جائیں۔

"یہی وہ جگہ بھی ہے جہاں cost monitoring اور business monitoring ملتے ہیں،" Tom نے کہا۔ "اگر ہماری confirmation latency جمعہ کی شاموں کو restaurants کے ایک حصے کے لیے spike کر رہی ہے، تو جڑ کا سبب Kinesis میں ان restaurants کی shards سے ٹکرانے والا ایک Lambda cold start ہو سکتا ہے۔ Business metric علامت ظاہر کرتی ہے۔ Infrastructure metrics سبب ظاہر کرتی ہیں۔"

"اور حل زیادہ infrastructure نہ ہو،" Carlos نے کہا۔ "یہ مخصوص Lambda function پر provisioned concurrency ہو سکتا ہے۔ یا یہ shard rebalancing ہو سکتا ہے۔ یا یہ restaurant کے confirmation endpoint میں ایک bug ہو سکتا ہے۔ آپ یہ نہیں جان سکتے کہ کون سا جب تک آپ کے پاس observability کی دونوں layers نہ ہوں۔"

"کیا ہم نے سوچا ہے کہ اگر ہم infrastructure ٹھیک کر دیں اور business metric پھر بھی بہتر نہ ہو تو کیا ہوگا؟" Priya نے پوچھا۔

"تو جڑ کا سبب infrastructure میں نہیں ہے،" Carlos نے کہا۔ "جو قیمتی معلومات ہے۔ Business metric کے بغیر، آپ ایک ایسے مسئلے کے لیے infrastructure بہتریوں کا پیچھا کر رہے ہوں گے جو کہیں اور رہتا ہے۔"


"یہ فی مہینہ کتنی لاگت ہے جب ہمارے پاس 500 concurrent deliveries track ہو رہی ہوں؟" Tom نے پوچھا۔ "State store، Kinesis stream، events process کرنے والے Lambda functions؟"

Carlos نے سر ہلایا۔ "یہی پوچھنے کا درست سوال ہے ابھی، جب آپ ڈیزائن کر رہے ہیں، اسے بنانے کے بعد نہیں۔"

یہ وہ قسم کی معماری تفصیل ہے جو ایک منظم review میں ابھرتی ہے — اور اکثر اس وقت نہیں ابھرتی جب آپ بس بنا رہے ہوتے ہیں۔

**Architecture Decision Record**

review کے بعد، Carlos نے team کو اپنے فیصلوں کو **Architecture Decision Records (ADRs)** میں document کرنے کی سفارش کی — مختصر دستاویزات جو capture کرتی ہیں:

- **کیا فیصلہ کیا گیا**
- **کون سے متبادل پر غور کیا گیا**
- **یہ فیصلہ کیوں کیا گیا (اس وقت کا سیاق اور constraints)**
- **trade-offs کیا ہیں**
- **کیا چیز ہمیں اس فیصلے پر دوبارہ غور کرنے پر مجبور کرے گی**

آپ شاید سوچ رہے ہوں: کیا ADRs کو رسمی دستاویزات ہونے کی ضرورت ہے؟ نہیں۔ ایک ADR ایک Slack thread میں ایک پیراگراف ہو سکتا ہے اگر آپ کی team وہیں کام کرتی ہے۔ Format غیر متعلقہ ہے۔ آپ نے کیا فیصلہ کیا اور کیوں — آگے بڑھنے سے پہلے — یہ لکھنے کا عمل وہ ہے جو ادارہ جاتی یادداشت بناتا ہے۔

"ADRs آپ کے مستقبل کے خود کے لیے ہیں،" Carlos نے کہا۔ "18 ماہ میں، آپ architecture کے ایک ٹکڑے کو دیکھیں گے اور حیران ہوں گے کہ یہ اس طرح کیوں کیا گیا۔ اگر آپ کے پاس ایک ADR ہے، تو آپ سیاق سمجھیں گے۔ اگر نہیں، تو آپ یا تو اسے اکیلا چھوڑ دیں گے (کیونکہ آپ اسے چھونے سے ڈرتے ہیں) یا اسے بدل دیں گے (کیونکہ آپ نہیں سمجھے کہ یہ اس طرح کیوں کیا گیا)۔"

Leo نے اس دوپہر پہلا ADR لکھا: delivery tracking events کے لیے Kinesis استعمال کرنے کا فیصلہ، سیاق، غور کیے گئے متبادل (SQS، EventBridge، polling)، اور trade-offs کے ساتھ۔

Carlos نے Leo کے بنائے ADR کو دیکھا۔ اس نے اسے تیس سیکنڈ میں پڑھا۔ پھر اس نے کہا: "team کو دکھائیں کہ ADR-007 کیسا نظر آتا ہے۔"

Leo نے اسے project کیا۔

---

**ADR-007: Delivery Tracking Event Infrastructure**

**تاریخ**: 2025-03-14
**حیثیت**: Accepted
**مصنف**: Leo (Carlos، Priya کے review کے ساتھ)

---

**مسئلہ**

Nimbus Instant کو real-time delivery status tracking کی ضرورت ہے۔ Orders کو اپنی status update کرنی ہے (confirmed → preparing → en route → delivered) اور state change کے 5 سیکنڈ کے اندر ان updates کو customer کے mobile app پر سامنے لانا ہے۔ Refund system کو بھی SLA compliance کا تعین کرنے کے لیے delivery events کا ایک auditable، replayable log چاہیے۔

---

**غور کیے گئے Options**

**Option 1: API Gateway WebSocket + DynamoDB state**
- Client فی order ایک WebSocket connection برقرار رکھتا ہے
- Backend کھلے connection پر state changes push کرتا ہے
- reconnect پر، client DynamoDB سے موجودہ state کھینچتا ہے
- پیمانے پر متوقع لاگت (10K بیک وقت active orders): ~$150/month
- کمزوری: پیمانے پر connection limit management؛ audit کے لیے کوئی built-in replay نہیں

**Option 2: Client polling (5-سیکنڈ وقفہ)**
- Client ہر 5 سیکنڈ میں `/orders/{order_id}/status` poll کرتا ہے
- Backend ہر poll پر DynamoDB سے پڑھتا ہے
- سب سے سادہ implementation
- پیمانے پر متوقع لاگت (10K بیک وقت active orders): $18,130/month
- لاگت کی وجہ سے ختم

**Option 3: Kinesis Data Streams + Server-Sent Events**
- Delivery state changes Kinesis stream پر publish، throughput کے لحاظ سے sized: ایک shard 1 MB/s یا 1,000 records/s ingest کرتا ہے۔ 10K active orders پر (~فی order 4 state-change events، چھوٹے JSON payloads)، peak write rate ~40-50 events/s ہے — ایک واحد shard کے برابر۔ partition spread اور consumer headroom کے لیے 3 shards provision کریں۔
- SSE endpoint order partition کو تفویض کردہ Kinesis shard کو subscribe کرتا ہے
- Client SSE events وصول کرتا ہے؛ standard EventSource API استعمال کرتے ہوئے دوبارہ connect ہوتا ہے
- پیمانے پر متوقع لاگت (10K بیک وقت active orders): ~$75/month
- ایک پائیدار، replayable event log فراہم کرتا ہے؛ تمام consumers کو ڈی کپل کرتا ہے

---

**فیصلہ**

Option 3: Kinesis Data Streams + SSE۔

دلیل: پیمانے پر لاگت کا فائدہ نمایاں ہے؛ Kinesis event log ایک علیحدہ audit trail implementation کے بغیر refund audit کی شرط پوری کرتا ہے؛ پیمانے پر SSE reconnect handling WebSocket connection management سے سادہ تر ہے۔

---

**نتائج**

- *مثبت*: Refund system، restaurant notification system، اور customer app سب آزادانہ طور پر اسی Kinesis stream سے consume کرتے ہیں۔ producer کو modify کیے بغیر نئے consumers شامل کیے جا سکتے ہیں۔
- *مثبت*: Events 7 دنوں تک replayable ہیں (ہماری configured extended retention؛ Kinesis اضافی لاگت پر 365 دنوں تک support کرتا ہے)۔ اگر refund processing Lambda ناکام ہو، تو یہ چھوٹے ہوئے events کو replay کر سکتا ہے۔
- *منفی*: SSE latency (~200ms) WebSocket latency (~50ms) سے زیادہ ہے۔ قابل قبول کیونکہ یہ فرق status updates کے لیے customer کے ادراک کی حد سے نیچے ہے۔
- *منفی*: Kinesis provisioned pricing shard hours کے ساتھ scale کرتی ہے، اور extended retention تقریباً فی-shard لاگت دگنی کر دیتی ہے۔ Throughput headroom بڑا ہے (ایک shard 1,000 records/s ingest کرتا ہے)، لیکن جیسے جیسے consumer count اور فی-consumer read load تقریباً 50K daily active orders سے آگے بڑھے، shard count — اور ایک re-shard/consumer-fan-out strategy — پر دوبارہ غور کرنے کی ضرورت ہوگی۔

**کیا چیز ہمیں اس فیصلے پر دوبارہ غور کرنے پر مجبور کرے گی**: اگر order volume اس مقام تک بڑھے جہاں نئے پیمانے پر Kinesis shard costs WebSocket costs سے تجاوز کریں، یا اگر 200ms SSE latency ایک product differentiation مسئلہ بن جائے۔

---

"آخری line،" Maya نے کہا۔ "وہ جس کے بارے میں میں نے نہیں سوچا تھا۔"

"دوبارہ غور کرنے کا محرک،" Carlos نے کہا۔ "ہر فیصلے کے ایسے حالات ہوتے ہیں جن کے تحت یہ غلط ہو جاتا ہے۔ انہیں لکھنے کا مطلب ہے کہ جب وہ ظاہر ہوں تو آپ انہیں پہچان لیں گے۔"

"بجائے انہیں ایک post-mortem میں دریافت کرنے کے،" Priya نے کہا۔

"بجائے اس کے، ہاں۔"

Tom cost consequence پڑھ رہا تھا۔ "Re-shard اور fan-out strategy — ہمارے پاس وہ ابھی نہیں ہے۔"

"آپ کو 50K daily active orders تک اس کی ضرورت نہیں،" Carlos نے کہا۔ "آپ کے موجودہ 287 restaurants اور 4,200 daily orders پر، آپ کے پاس نمایاں headroom ہے۔ ADR آپ کو بتاتا ہے کہ ایک چیز اس سے پہلے کیا بنانی ہے کہ یہ فوری ہو جائے، اس سے پہلے نہیں کہ یہ متعلقہ ہو جائے۔"

Leo نوٹس لے رہا تھا۔ "ADR دو کام کر رہا ہے،" اس نے کہا۔ "یہ document کر رہا ہے کہ ہم نے کیا فیصلہ کیا۔ اور یہ document کر رہا ہے کہ اگر صورتحال بدلے تو ہمیں اگلا کیا فیصلہ کرنا پڑے گا۔"

"یہی وہ ہے جو ایک ADR کو اٹھارہ ماہ تک مفید بناتا ہے،" Carlos نے کہا۔ "فیصلہ خود نہیں — فیصلے باسی ہو جاتے ہیں۔ استدلال۔ استدلال آپ کو بتاتا ہے کہ آیا فیصلے پر دوبارہ غور ہونا چاہیے، حتیٰ کہ جب فیصلہ ابھی بھی جاری ہو۔"


**ایک معمار کسے بناتا ہے**

session کے آخر میں، Maya نے Carlos سے اصل سوال پوچھا: "architectural فیصلے کرنے اور ایک معمار کی طرح سوچنے کے درمیان کیا فرق ہے؟"

اس نے اس پر غور کیا۔

"ایک معمار ایک senior engineer سے زیادہ technology نہیں جانتا،" اس نے کہا۔ "ایک اچھا معمار شاید بالکل تازہ ترین frameworks کا تھوڑا کم جانتا ہے۔ لیکن ایک معمار کے پاس ایک مختلف default سوالات کا مجموعہ ہوتا ہے۔"

"آپ کا کیا مطلب ہے؟"

"جب آپ ایک senior engineer ہوتے ہیں جو ایک نئی feature دیکھ رہا ہے، تو آپ کے پہلے سوالات عام طور پر یہ ہوتے ہیں: 'ہم کیا بناتے ہیں؟ یہ کیسے کام کرتا ہے؟ اس کے لیے بہترین library کون سی ہے؟' جب ایک معمار اسی feature کو دیکھتا ہے، تو پہلے سوالات یہ ہوتے ہیں: 'یہ کون سا مسئلہ حل کرتا ہے؟ جب traffic دگنا ہو تو پہلے کیا ٹوٹتا ہے؟ ہم کیسے جانتے ہیں کہ یہ کب خراب ہوا؟ جب payment processor سست ہو تو user کیا تجربہ کرتا ہے؟'"

"معمار نظام کے دباؤ کے تحت سوال کرتا ہے،" Leo نے کہا۔

"اور ہر ناکامی کے business نتیجے کے بارے میں،" Priya نے اضافہ کیا۔

"اور،" Tom نے کہا، "اس بارے میں کہ جب یہ scale کرتا ہے تو bill کا کیا ہوتا ہے۔"

Carlos نے سر ہلایا۔ "آپ سب پہلے ہی یہ کر رہے ہیں۔ آپ یہ باب ۱ سے کر رہے ہیں۔ ایک senior engineer اور ایک معمار کے درمیان فرق ایک certification یا ایک title نہیں ہے۔ یہ اگلا سوال پوچھنے کی عادت ہے — وہ جو اس چیز کو ظاہر کرتا ہے جس کے بارے میں آپ نے ابھی تک نہیں سوچا تھا۔"

**تبدیلی: جب ایک Architecture Review خطرہ ہٹانے کے بجائے بڑھائے**

اگر آپ کے review کو ایک سیکھنے کے عمل کے بجائے ایک approval gate سمجھا جائے، تو teams تاخیر سے بچنے کے لیے design choices چھپانا شروع کر دیں گی — اور failure modes پھر بھی موجود رہیں گے، بس غیر documented۔ ایک architecture review جو معیار بہتر کیے بغیر shipping سست کرتا ہے کسی review نہ ہونے سے بدتر ہے۔

اگر refund service کے idempotency مسئلے کو feature launch میں ایک غیر متوقع تاخیر سمجھا جاتا بجائے ایک ضروری دریافت کے، تو Leo اصل endpoint ship کر دیتا، double-refund بالآخر ہو جاتا، اور team اس کے بارے میں ایک ناراض customer سے سیکھتی۔ Review مسئلے کو ایک ایسے مقام پر سامنے لاتا ہے جہاں اسے ٹھیک کرنے میں ایک دن لگتا ہے، ایک rollback نہیں۔

review کی قدر اس بات کے متناسب ہے کہ team اسے design بدلنے دینے کے لیے کتنی تیار ہے۔

## خوبیاں اور حدود

**Architecture reviews**:

- Failure modes کو production میں آنے سے پہلے پکڑتے ہیں
- team کے ان ارکان کے درمیان مشترکہ سمجھ پیدا کرتے ہیں جن کے پاس اکثر علیحدہ علیحدہ علم ہوتا ہے
- ایسی documentation (ADRs) پیدا کرتے ہیں جو سالوں تک منافع دیتی ہے
- فیصلہ سازی کو فائدہ مند طریقوں سے سست کرتے ہیں — review کے بغیر "تیز چلیں" کا مطلب ہے "تیز چلیں اور اس دیوار سے ٹکرائیں جو آپ نے نہیں دیکھی"

**جہاں یہ پیچیدہ ہو جاتے ہیں**:

- درست سوالات پوچھنے کے لیے کسی کافی ماہر کی ضرورت ہوتی ہے — review اتنا ہی اچھا ہے جتنا reviewer
- اگر اسے ایک گفتگو کے بجائے ایک checkbox سمجھا جائے تو یہ بیوروکریٹک بن سکتا ہے
- کچھ architectural فیصلوں کو واقعی مکمل review کی ضرورت نہیں ہوتی — یہ جاننا کہ کن کو ہوتی ہے خود ایک architectural مہارت ہے
- output (ADRs، diagrams، decision logs) کو نظام کے ارتقا کے ساتھ برقرار رکھنا ضروری ہے

## خلاصہ

Carlos کے ساتھ review میں دو گھنٹے لگے تھے اور اس نے تین ADRs، feature بننے سے پہلے حل کرنے کے لیے چھ unknowns کی ایک فہرست، اور ایک architectural تبدیلی (idempotency state store) پیدا کی جسے launch کے بعد retrofit کرنا تکلیف دہ ہوتا۔ Pre-flight checklist کا استعارہ پورے دوران قائم رہا: کچھ بھی تباہ کن دریافت نہیں ہوا تھا، لیکن کئی ایسی چیزیں جو بعد میں مسائل پیدا کرتیں، اس وقت پکڑی اور document کی گئیں جب وہ ابھی ٹھیک کرنے میں آسان تھیں۔

- Architecture reviews **business requirements سے شروع ہوتے ہیں، technology سے نہیں**۔
- Review کی ساخت: constraints → unknowns → options → failure modes → monitoring → runbooks۔
- معمار پوچھتے ہیں: پہلے کیا ٹوٹتا ہے؟ ہم کیسے جانتے ہیں کہ یہ خراب ہوا ہے؟ ناکامی کے دوران user experience کیا ہے؟ پیمانے پر لاگت کیا ہے؟
- **Architecture Decision Records (ADRs)** capture کرتے ہیں کہ کیا فیصلہ کیا گیا، کیوں، اور کیا چیز دوبارہ غور پر مجبور کرے گی۔
- ایک معمار کی طرح سوچنا ایک عادت ہے: اگلا سوال پوچھنا، خاص طور پر failure modes، business نتیجے، اور scale economics کے بارے میں۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cross-domain — architectural استدلال*

یہ باب مخصوص امتحانی موضوعات کے بارے میں کم اور اس ذہنیت کے بارے میں زیادہ ہے جسے امتحان test کرتا ہے۔

- **SAA-C03 منظر نامے** تقریباً ہمیشہ پہلے ایک business constraint بیان کرتے ہیں ("کمپنی ایک گھنٹے سے زیادہ downtime برداشت نہیں کر سکتی") اور آپ سے وہ architecture منتخب کرنے کو کہتے ہیں جو اسے پورا کرے۔ business constraints کو technical requirements میں ترجمہ کرنے کی مشق کریں۔
- **Failure mode کی سوچ**: بہت سے امتحانی سوالات ایک نظام بیان کرتے ہیں اور پوچھتے ہیں کہ جب ایک component ناکام ہو تو کیا ہوتا ہے۔ جن architectures کا آپ کو سامنا ہو ان کے لیے "پہلے کیا ٹوٹتا ہے؟" پوچھنے کی مشق کریں۔
- **Trade-off کی سوچ**: امتحان میں شاذ و نادر ہی ایک "کامل" جواب ہوتا ہے۔ یہ constraints کے ایک مجموعے کے پیش نظر *بہترین* جواب مانگتا ہے۔ "یہ option ان مخصوص requirements کے پیش نظر درست ہے، حالانکہ کوئی دوسرا option مختلف requirements کے تحت بہتر ہوتا" کے ساتھ آرام دہ ہو جائیں۔
- **Architecture Decision Records**: ایک AWS service نہیں، بلکہ ایک best practice جو Well-Architected Framework کے Operational Excellence ستون کی عکاسی کرتی ہے۔
- **real-time event streaming کے لیے Kinesis**: باب کی Nimbus Instant feature delivery event streaming کے لیے Kinesis استعمال کرتی ہے۔ امتحانی اشارہ: "ترتیب شدہ processing کے ساتھ real-time event ingestion" → Kinesis Data Streams۔ "Components کو ڈی کپل کریں، at-least-once delivery" → SQS۔ یہ جاننا کہ ہر ایک کے لیے کب پہنچنا ہے ایک بار بار آنے والا امتحانی pattern ہے۔
- **ایک قابل test pattern کے طور پر Idempotency**: SAA-C03 اکثر distributed systems میں idempotency کو test کرتا ہے۔ بنیادی pattern: ایک بیرونی نظام کو call کرنے سے پہلے ایک منفرد idempotency key پیدا کریں؛ key اور نتیجہ کو persist کریں؛ retry پر، دوبارہ execute کرنے سے پہلے موجودہ key کے لیے چیک کریں۔ اگر مل جائے، تو دوبارہ execute کیے بغیر پہلے سے store شدہ نتیجہ واپس کریں۔ یہ network timeout کے بعد retries ہونے پر double-charges، double-sends، اور duplicate state mutations کو روکتا ہے۔ امتحانی اشارہ: "جب ایک service call retry ہو تو duplicate operations کو روکیں" یا "payment events کی exactly-once processing کو یقینی بنائیں" → DynamoDB میں conditional write کے ساتھ store کیا گیا idempotency key۔
- **Server-Sent Events بمقابلہ WebSockets**: SSE یک طرفہ ہے (server سے client)، standard HTTP استعمال کرتا ہے، اور EventSource API کے ذریعے خودبخود دوبارہ connect ہوتا ہے۔ WebSockets دو طرفہ ہیں، connection management کی ضرورت رکھتے ہیں، اور اس وقت مناسب ہیں جب client کو بھی server کو data push کرنے کی ضرورت ہو۔ delivery status updates کے لیے (صرف server-سے-client)، SSE پیمانے پر WebSockets سے سادہ تر اور سستا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

Carlos نے architecture review کے دوران چھ قسم کے سوالات پوچھے۔ کیا آپ باب کو دیکھے بغیر چھ شعبوں کی دوبارہ تشکیل کر سکتے ہیں؟

*(اشارہ: یہ "Architecture Review کی ساخت" section میں درج ہیں۔ انہیں یادداشت سے یاد کرنے کی کوشش کریں — یاد کرنے کی کوشش کا عمل (چاہے آپ ناکام ہوں) طویل مدتی برقراری کو مضبوط کرتا ہے۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی online advertising کے لیے ایک real-time bid management system بنا رہی ہے۔ Bids کا 100 ملی سیکنڈ کے اندر جائزہ لیا اور جواب دیا جانا چاہیے۔ نظام peak پر فی سیکنڈ 1 ملین bids process کرتا ہے۔ اگر bid system down ہو، تو کمپنی ad revenue کھو دیتی ہے۔ کمپنی کی database team 10 read replicas کے ساتھ RDS Aurora استعمال کرنے کی تجویز دیتی ہے۔ Solution architect کو اس کی ثانوی خصوصیات کا جائزہ لینے سے پہلے یہ جانچنا چاہیے کہ آیا تجویز بنیادی طور پر قابل عمل ہے۔

architect کو سب سے پہلے کون سی تشویش اٹھانی چاہیے؟

A) 10 Aurora read replicas کی لاگت budget کے لیے بہت زیادہ ہے  
B) Aurora read replicas میں replication lag ہے جو consistency کے مسائل پیدا کر سکتا ہے  
C) Aurora کی عام query latency 1-5ms 100ms response SLA کو پورا نہ کر سکے  
D) RDS Aurora اس latency کی شرط پر فی سیکنڈ 1 ملین requests کے transaction volumes کو support نہیں کرتا

**اشارہ ۱**: بنیادی constraint فی سیکنڈ 1 ملین requests پر 100ms کل response time ہے۔ ان تشویشوں میں سے کون سی، اگر درست ہو، تجویز کو ناقابل عمل بنا دیتی ہے قطع نظر اس کے کہ باقی تین کو کیسے حل کیا جائے؟

**اشارہ ۲**: Aurora query latency عام طور پر 1-5ms ہوتی ہے۔ database query کے لیے 1-5ms network، application logic، اور serialization کے لیے 95-99ms چھوڑتی ہے۔ کیا 100ms constraint خطرے میں ہے؟

**اشارہ ۳**: Aurora زیادہ IOPS سنبھال سکتا ہے، لیکن فی سیکنڈ 1 ملین requests ایک غیر معمولی شرح ہے۔ اس پیمانے پر architecture کا کیا ہوتا ہے؟

**جواب**: D

**وضاحت**: اگرچہ Aurora اعلیٰ کارکردگی والا ہے، 100ms کل response time پر فی سیکنڈ 1 ملین requests ایک انتہائی شرط ہے — یہ وہ architectural رکاوٹ ہے جو طے کرتی ہے کہ آیا تجویز سرے سے وجود میں آ سکتی ہے۔ Architect کو سب سے پہلے یہ سوال کرنا چاہیے کہ آیا Aurora (یا کوئی بھی relational database) اس پیمانے اور latency پر primary lookup system کے طور پر کام کر سکتا ہے۔ اس طرح کے systems عام طور پر in-memory data stores (Redis) یا خصوصی low-latency databases استعمال کرتے ہیں، نہ کہ full SQL semantics والے relational databases۔ 100ms SLA صرف Aurora queries کے لیے حاصل کیا جا سکتا ہے، لیکن 1M RPS اور 100ms کل SLA کا مجموعہ عام Aurora throughput خصوصیات سے تجاوز کرتا ہے۔ "سب سے پہلے" کا مطلب refinement سے پہلے feasibility ہے: اگر engine load برداشت نہ کر سکے، تو تجویز کے بارے میں ہر دوسری تشویش بے معنی ہے۔

**A کیوں نہیں؟** لاگت ایک درست تشویش ہے، لیکن پہلی تشویش یہ ہونی چاہیے کہ آیا architecture بیان کردہ requirements پر تکنیکی طور پر قابل عمل ہے۔

**B کیوں نہیں؟** Replication lag تجویز کی ایک حقیقی لیکن *ثانوی* خصوصیت ہے — ایک خاصیت جسے آپ architecture کے قابل عمل ہونے کے بعد tune کرتے ہیں۔ Aurora replica lag عام طور پر <100ms اور زیادہ تر use cases کے لیے قابل قبول ہے؛ اسے پہلے اٹھانے کا مطلب ایک ایسے نظام کے consistency رویے پر بحث کرنا ہوگا جو پہلی جگہ درکار throughput برقرار نہیں رکھ سکتا۔ Feasibility سوال (D) اسے سمیٹ لیتا ہے۔

**C کیوں نہیں؟** Aurora کی 1-5ms latency database query حصے کے لیے 100ms SLA کے اندر اچھی طرح ہے۔ یہ بنیادی تشویش نہیں ہے۔

*SAA-C03 ڈومین: Cross-domain — system design*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Architecture review کی ساخت کو ایک حقیقی یا فرضی نظام پر لاگو کریں:

ایک startup ایک real-time multiplayer trivia game بنانا چاہتا ہے۔ Players game rooms میں شامل ہوتے ہیں (ہر ایک میں 10 players تک)۔ ہر round ایک سوال 15 سیکنڈ کے لیے دکھاتا ہے؛ تمام players بیک وقت جواب دیتے ہیں۔ Scores ہر سوال کے بعد فوری طور پر شمار ہوتے ہیں۔ Games 10 rounds تک چلتی ہیں۔ Peak usage: 50,000 concurrent games۔

چھ-قدمی review سے گزریں:

1. ناقابل گفت و شنید constraints کیا ہیں؟
2. Unknowns اور مفروضے کیا ہیں؟
3. حقیقت پسندانہ technology options کیا ہیں؟
4. Failure modes کیا ہیں؟
5. آپ کیسے جانیں گے کہ یہ کب خراب ہوا؟
6. 3 AM کا runbook کیسا نظر آتا ہے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد ایک سوچنے کے آلے کے طور پر review کی ساخت کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Carlos نے شام 6 بجے دفتر چھوڑ دیا۔

Team کچھ دیر بعد بیٹھی رہی، کوئی خاص کام نہیں کر رہی تھی۔

"مجھے لگتا ہے کہ میں نے ان دو گھنٹوں میں کسی بھی انفرادی AWS service باب سے زیادہ سیکھا،" Leo نے کہا۔

"یہ اس لیے ہے کہ وہ ابواب tools کے بارے میں تھے،" Maya نے کہا۔ "یہ judgment کے بارے میں تھا۔"

"کیا judgment سکھایا جا سکتا ہے؟" اس نے پوچھا۔

"ہاں،" Priya نے کہا۔ "لیکن پڑھنے سے نہیں۔ مشق سے۔ فیصلے کرنے سے، یہ دیکھنے سے کہ کیا ٹوٹتا ہے، یہ سوچنے سے کہ کیوں۔"

"تجربے سے،" Tom نے کہا۔

"منظم تجربے سے،" Priya نے درست کیا۔ "غور و فکر کے بغیر تجربہ judgment نہیں بناتا۔ آپ کو بعد میں سوالات پوچھنے پڑتے ہیں۔"

Maya نے whiteboard کی طرف دیکھا۔ Review کے نوٹس ابھی بھی وہاں تھے — constraints، unknowns، failure modes، monitoring کے سوالات۔ یہ دو whiteboards بھر گیا تھا۔

"یہ ADR میں جانا چاہیے،" اس نے کہا۔

Leo پہلے ہی type کر رہا تھا۔

آخری باب میں: وہ ایک چیز جو کوئی tool یا framework آپ کو نہیں دے سکتا — اور "یہ منحصر ہے" software architecture میں سب سے ایماندار اور طاقتور جواب کیوں ہے۔
