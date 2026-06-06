# باب 25: نجی شاہراہ

ایک لمحے کے لیے کھڑے ہو جائیں۔ اپنے ہاتھ جھٹکیں۔

اپنی انگلیوں کے سروں اور ملک کی دوسری طرف کسی چیز کے درمیان فاصلہ محسوس کریں۔ ایک ایسا message بھیجنے کا تصور کریں جسے وہ فاصلہ طے کرنا ہو، ایک درجن carrier handoffs سے اپنا راستہ ڈھونڈنا ہو، اور آپ کے کام جاری رکھنے سے پہلے واپس آنا ہو۔ اب اسے فی سیکنڈ ہزاروں بار کرنے کا تصور کریں۔

یہی ہے جو data transfer دراصل ہے — جسمانی فاصلہ، جسمانی infrastructure، جسمانی رکاوٹیں۔

ہم data منتقل کرنے کے بارے میں بات کرنے والے ہیں۔ AWS میں services کے درمیان نہیں، بلکہ حقیقی دنیا اور AWS کے درمیان — آپ کے دفتر اور آپ کے cloud infrastructure کے درمیان، براعظموں کے درمیان۔

---

Database scale ہونے اور storage لاگتیں کم ہونے کے ساتھ، Tom networking bill کی طرف متوجہ ہوا تھا۔ لیکن Leo کا ایک زیادہ فوری مسئلہ تھا — 4 terabytes تاریخی order data کو AWS میں منتقل کرنا ان کے موجودہ connection کی حدود کو بے نقاب کر رہا تھا۔

---

Nimbus کی infrastructure team (اب چار engineers) Seattle میں ایک مشترکہ دفتر سے کام کرتی تھی۔ انہیں اس AWS infrastructure تک رسائی کی ضرورت تھی جسے وہ manage کرتے تھے۔ کچھ operations کے لیے VPC میں resources سے connect کرنا درکار تھا۔

فی الحال، وہ public subnet میں bastion host تک رسائی کے لیے اپنے laptops پر ایک VPN استعمال کرتے تھے، پھر وہاں سے resources پر SSH کرتے۔

یہ کام کرتا تھا۔ یہ سست تھا۔ VPN connection public internet کے ذریعے route ہوتی تھی: Seattle → متعدد carrier hops → us-west-2۔ Round trips غیر مستقل تھے — گھنٹے کے لحاظ سے 30 سے 80 ملی سیکنڈ — اور throughput دفتر کے uplink اور public path سے capped تھی۔

"روزمرہ SSH کے لیے، یہ قابل قبول ہے،" Leo نے کہا۔ "لیکن ہم اپنی analytics database منتقل کرنا شروع کرنے والے ہیں۔ 4 terabytes تاریخی order data۔ اس connection پر، migration ہفتے لے گی۔"

"ہمیں ایک بہتر connection چاہیے،" Maya نے کہا۔

"ایک private connection،" Priya نے شامل کیا۔ "public internet کے ذریعے نہیں۔ اور اگر کوئی data transfer کے دوران توڑنے کی کوشش کرے؟ public internet پر 4TB order history — encrypted بھی — ایک target محسوس ہوتا ہے۔"

اسے کام پر آنے جانے کی طرح سوچیں۔ ایک Site-to-Site VPN public سڑکوں پر گاڑی چلانے کی طرح ہے: آپ اپنی گاڑی کے دروازے lock کرتے ہیں (encryption)، لیکن آپ پھر بھی ہر کسی کے ساتھ lanes شیئر کرتے ہیں، اور traffic jams آپ کو غیر متوقع طور پر سست کرتے ہیں۔ Direct Connect شاہراہ پر ایک dedicated private lane کرائے پر لینے کی طرح ہے — کوئی shared traffic نہیں، مستقل speed، اور ایک زیادہ ماہانہ toll۔ زیادہ تر دن public سڑک ٹھیک ہوتی ہے۔ جب آپ ایک تنگ شیڈول پر قیمتی cargo سے بھرا ٹرک منتقل کر رہے ہوں، آپ private lane کے لیے ادائیگی کرتے ہیں۔

Snow Family وہ option ہے جس پر زیادہ تر لوگ غور نہیں کرتے: ایک اصل cargo flight charter کرنا۔ یہ ہمیشہ دستیاب نہیں۔ یہ چھوٹے loads کے لیے صحیح نہیں۔ لیکن ایک پورے ٹرک کے لیے، یہ گاڑی چلانے سے تیز پہنچتا ہے اور بالکل شاہراہ کے حالات پر منحصر نہیں ہوتا۔ Physics نہیں بدلی — آپ پھر بھی وہی bits منتقل کر رہے ہیں — لیکن mechanism بنیادی طور پر مختلف ہے۔

**AWS Site-to-Site VPN: تیز Option**

**AWS Site-to-Site VPN** آپ کے on-premises network اور آپ کے VPC کے درمیان ایک encrypted tunnel بناتا ہے، public internet سے گزرتے ہوئے۔

Setup:

1. اپنے VPC سے منسلک ایک Virtual Private Gateway (VGW) بنائیں
2. اپنے on-premises router کی نمائندگی کرتا ایک Customer Gateway بنائیں
3. ان کے درمیان دو VPN tunnels (redundancy کے لیے) قائم کریں

Traffic encrypted ہے (AES-256)۔ یہ public internet پر سفر کرتی ہے، جس کا مطلب ہے کہ latency internet conditions پر منحصر ہے۔ AWS redundancy کے لیے خودبخود دو tunnels فراہم کرتا ہے — اگر ایک tunnel میں مسائل ہوں، traffic دوسرے میں منتقل ہو جاتی ہے۔

**Site-to-Site VPN کب استعمال کریں**:

- تیز setup (منٹوں سے گھنٹوں)
- Cost-effective (فی VPN connection $0.05/گھنٹہ)
- Bandwidth: فی tunnel 1.25 Gbps تک
- use case کے لیے قابل قبول internet latency

**Accelerated Site-to-Site VPN** VPN traffic کو public internet کے بجائے AWS کے global network پر route کرتا ہے — وہی optimization جو Global Accelerator فراہم کرتا ہے، VPN tunnels پر لاگو۔ Latency معیاری VPN سے کم اور زیادہ مستقل ہے۔ لاگت قدرے زیادہ ہے (Global Accelerator data transfer charges لاگو ہوتے ہیں)۔ ان ٹیموں کے لیے جو VPN کا تیز setup اور کم لاگت چاہتی ہیں لیکن بہتر latency کی ضرورت ہے، Accelerated VPN معیاری VPN اور Direct Connect کے درمیان عملی درمیانی راستہ ہے۔

Nimbus کے 4TB migration کے لیے، 1.25 Gbps زیادہ سے زیادہ پر internet-based VPN لے گا: 4TB / 1.25 Gbps ≈ کم سے کم 7 گھنٹے، حقیقی دنیا کے overhead کے ساتھ 12-20 گھنٹے کے قریب۔ قابل قبول، لیکن public internet path پر congestion اسے غیر متوقع بناتا ہے۔

Leo نے زیادہ احتیاط سے ریاضی کی، کیونکہ نظریاتی حساب اور اصل transfer time اس کے تجربے میں ایک بار بھی match نہیں ہوئے تھے۔

**نظریاتی**: 4 TB = 4,096 GB = 32,768 Gb۔ 1 Gbps پر: 32,768 سیکنڈ ≈ 9.1 گھنٹے۔ 9 گھنٹے تک round کریں۔

**اصل**: Leo نے پچھلے ہفتے ایک test transfer چلایا تھا — Seattle دفتر سے S3 تک 50 GB۔ ان کی ناپی گئی upstream speed (875 Mbps) پر نظریاتی وقت: 457 سیکنڈ۔ اصل وقت: 724 سیکنڈ۔ Overhead factor: 1.58۔

875 Mbps upstream پر 4TB transfer پر لاگو: 32,768 Gb / 0.875 Gbps × 1.58 overhead ≈ **59,200 سیکنڈ ≈ 16.4 گھنٹے**۔

Overhead کئی ذرائع سے آیا: connection establishment پر TCP slow-start، retransmission کی ضرورت والا packet loss (Seattle سے us-west-2 تک public path اوسطاً 0.2% packet loss — چھوٹا، لیکن لاکھوں packets پر multiplicative)، ہر multipart upload segment کے لیے HTTPS handshake overhead، اور S3 کے multipart uploads جمع کرنے کا processing time۔

"سولہ گھنٹے ایک یکبارگی migration کے لیے ٹھیک ہیں،" Leo نے کہا۔ "اصل مسئلہ یہ ہے اگر transfer گھنٹہ 14 پر متاثر ہو۔"

S3 multipart upload interruption مسئلہ حل کرتا ہے: اگر transfer گھنٹہ 14 پر ناکام ہو، صرف موجودہ part کو دوبارہ upload کرنا ضروری ہے۔ پچھلے parts S3 میں اسٹور ہیں اور transfer دوبارہ شروع ہو سکتا ہے۔ لیکن multipart uploads manage کرنے کے overhead نے کل transfer time میں تقریباً 3% شامل کیا۔

حتمی حقیقی دنیا کا تخمینہ: **1 Gbps internet پر تقریباً 9 گھنٹے نظریاتی، تقریباً 17 گھنٹے اصل** — ان کے دفتر کی 875 Mbps ناپی گئی upstream speed، packet loss overhead، اور multipart upload processing کا حساب رکھتے ہوئے۔

Leo نے ایک لمحے کے لیے اس پر غور کیا۔ پھر اس نے Snow Family pricing page دیکھا۔

"دوسرا option کیا ہے؟" Tom نے پوچھا۔

"رکو — لیکن ہمیں VPN سے زیادہ کسی چیز کی ضرورت *کیوں* ہوگی؟" Maya نے پوچھا۔ "4TB migration ایک یکبارگی event ہے۔"

"یہ نہیں ہے،" Priya نے کہا۔ "ایک بار data AWS میں آنے کے بعد، ٹیم کو پھر بھی اسے روزانہ access کرنا ہوگا۔ اور VPN latency compound ہوتی ہے۔"

**AWS Direct Connect: Dedicated Line**

**AWS Direct Connect** آپ کے location (یا آپ کی colocation facility) اور AWS کے درمیان ایک dedicated، private network connection قائم کرتا ہے۔ Traffic کبھی public internet کو نہیں چھوتی۔

Direct Connect ایک physical connection ہے — آپ کے network سے ایک AWS Direct Connect location تک ایک fiber line۔ آپ physical circuit قائم کرنے کے لیے ایک telecom provider کے ساتھ کام کرتے ہیں۔ AWS اپنی طرف port فراہم کرتا ہے۔

**فوائد**:

- مستقل، قابل پیش گوئی latency (کوئی public internet variance نہیں)
- 50 Mbps سے 100 Gbps تک speeds (2024 سے منتخب locations پر native 400 Gbps dedicated ports کے ساتھ)
- internet سے کم data transfer لاگتیں (Direct Connect data transfer rates معیاری AWS data transfer out rates سے سستی ہیں)
- زیادہ محفوظ (private circuit، public internet نہیں)

**Trade-offs**:

- Setup ہفتوں سے مہینوں لیتا ہے (physical infrastructure provisioning)
- VPN سے نمایاں طور پر زیادہ لاگت
- کوئی built-in redundancy نہیں (آپ خود redundant circuits قائم کرتے ہیں)
- متعدد circuits کے بغیر جغرافیائی طور پر distributed دفاتر کے لیے موزوں نہیں

آپ شاید سوچ رہے ہوں: اگر Direct Connect ایک physical fiber cable ہے، تو کیا ہوتا ہے اگر کوئی حادثاتی طور پر اسے کاٹ دے؟ یہ ایک واحد circuit کے ساتھ single-point-of-failure مسئلہ ہے — یہی وجہ ہے کہ production Direct Connect setups جغرافیائی طور پر علیحدہ paths میں redundant circuits استعمال کرتی ہیں، یا backup کے طور پر ایک VPN برقرار رکھتی ہیں۔ Cable کاٹا جا سکتا ہے؛ business جاری رہتا ہے۔

"یہ فی مہینہ کتنا خرچ کرتا ہے؟" Tom نے پوچھا۔ اس نے پہلے ہی اسے دیکھ لیا تھا۔ "ایک dedicated 1Gbps port $216/مہینہ ہے،" اس نے کہا۔ "علاوہ ہمارے دفتر سے circuit، جس کے لیے ایک telecom نے $800/مہینہ quote کیا۔"

"تو کل تقریباً ایک ہزار ماہانہ۔"

Nimbus کے لیے: Direct Connect ان کے موجودہ سائز کے لیے ضرورت سے زیادہ تھا۔ لیکن نمایاں data transfer volumes یا private network connections کی compliance requirements والے enterprises کے لیے، Direct Connect خود کی ادائیگی کر دیتا ہے۔

**Hosted Connections: درمیانی زمین**

ہر organization ایک 100 Gbps dedicated fiber circuit کا عہد نہیں کر سکتی۔ **Direct Connect Hosted Connections** AWS Direct Connect Partners (منظور شدہ telecoms) کو sub-1Gbps connections provision کرنے دیتے ہیں جنہیں آپ دوسرے customers کے ساتھ شیئر کرتے ہیں۔

Setup تیز ہے (دنوں سے ہفتوں، مہینوں نہیں) اور ایک dedicated connection سے کم لاگت آتی ہے۔ Trade-off: shared capacity کا مطلب کم مستقل throughput۔

Nimbus کے لیے (جیسے وہ بڑھتے ہیں): ایک partner کے ذریعے ایک hosted 500 Mbps connection ایک معقول price point پر private connectivity فراہم کرے گا۔

عملی فرق جو امتحان کے وقت اہم ہے: Hosted Connections 50 Mbps سے 10 Gbps تک speeds میں دستیاب ہیں (کچھ partners 25 Gbps تک پیش کرتے ہیں)، ایک AWS Partner کے ذریعے provisioned۔ Dedicated Connections براہ راست AWS کو جاتے ہیں اور 1 Gbps، 10 Gbps، اور 100 Gbps پر دستیاب ہیں (علاوہ منتخب locations پر 400 Gbps)۔ 1 Gbps سے کم speeds کے لیے، ایک Hosted Connection واحد Direct Connect option ہے — Dedicated Connections کم سے کم 1 Gbps سے شروع ہوتے ہیں۔

**AWS Transit Gateway: VPCs کے لیے Hub-and-Spoke**

جیسے Nimbus بڑھا، وہ متعدد VPCs جمع کر لیتے: production VPC، staging VPC، analytics VPC، security tooling VPC۔

احتیاطی منصوبہ بندی کے بغیر، ان VPCs کو connect کرنے کے لیے VPC peering connections کے ایک full mesh کی ضرورت ہوتی ہے۔ 4 VPCs کے لیے: 6 peering connections۔ 10 VPCs کے لیے: 45 peering connections۔ 20 VPCs کے لیے: 190 connections۔ یہ scale نہیں کرتا۔

**AWS Transit Gateway** ایک network hub ہے جو متعدد VPCs اور on-premises networks کو connect کرتا ہے۔ peering connections کے ایک mesh کے بجائے، ہر VPC Transit Gateway سے connect ہوتا ہے۔ Transit Gateway ان کے درمیان traffic route کرتا ہے۔

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: اگر VPC A اور VPC B دونوں Transit Gateway سے connect ہوں، وہ بات چیت کر سکتے ہیں — ایک براہ راست peer کے بغیر۔ Transit Gateway routing سنبھالتا ہے۔ VPC peering کے برعکس (جو transitive نہیں ہے)، Transit Gateway hub-and-spoke topology کو قابل بناتا ہے۔

**Transit Gateway لاگتیں**: فی attachment (VPC یا VPN/Direct Connect connection) علاوہ فی GB process کیے گئے data charge کی جاتی ہیں۔ پیمانے پر، یہ سادگی کے قابل ہے۔

Nimbus کے لیے، Transit Gateway کے لیے trigger کرنے والا event ایک چوتھے VPC کا اضافہ تھا۔ ان کے پاس تھے: production، staging، analytics، اور اب security tooling (vulnerability scanning اور SOC2 compliance monitoring کے لیے ایک VPC جو production کے ایک ہی network segment پر نہیں ہونا چاہیے)۔

Transit Gateway کے بغیر، چار VPCs connect کرنے کے لیے چھ peering connections درکار ہیں:
- Production ↔ Staging
- Production ↔ Analytics
- Production ↔ Security
- Staging ↔ Analytics
- Staging ↔ Security
- Analytics ↔ Security

چھ peering connections، فی VPC چھ route table entries، جائزہ لینے کے لیے چھ security group rules۔ اور VPC peering non-transitive ہے: اگر Production اور Analytics peered ہیں، اور Analytics اور Security peered ہیں، Production Analytics VPC کے ذریعے Security تک نہیں پہنچ سکتا۔ آپ کو Production ↔ Security peering واضح طور پر چاہیے۔

Transit Gateway کے ساتھ:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

چار attachments۔ manage کرنے کے لیے ایک route table۔ Transitive routing: Production ایک براہ راست peer کے بغیر Transit Gateway کے ذریعے Security تک پہنچ سکتا ہے۔

"اور اگر کوئی Transit Gateway کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "اگر چاروں VPCs ایک Transit Gateway شیئر کریں، Staging VPC میں ایک compromised resource Production تک پہنچ سکتا ہے۔"

Transit Gateway **isolation کے ساتھ route tables** سپورٹ کرتا ہے: آپ define کر سکتے ہیں کہ کن VPCs کو Transit Gateway کے ذریعے بات چیت کی اجازت ہے اور کون سے isolated ہیں۔ Security tooling VPC باقی سب تک پہنچ سکتا ہے (اسے انہیں scan کرنے کی ضرورت ہے)۔ Staging Production تک نہیں پہنچ سکتا۔ Production براہ راست Analytics تک نہیں پہنچ سکتا (Analytics ایک مخصوص read-only endpoint کے ذریعے data query کرتا ہے)۔

"ایک Transit Gateway،" Priya نے کہا، "routing policies کے ساتھ جو اصل access model کا اظہار کرتی ہیں۔ بمقابلہ چھ peering connections جن میں کیا کس تک پہنچتا ہے اس کا audit کرنے کا کوئی مرکزی طریقہ نہیں۔"

**VPC Endpoints: AWS Services تک Private رسائی**

ایک باریک cost اور security مسئلہ: جب آپ کی EC2 instance (ایک private subnet میں) S3 API کو call کرتی ہے، وہ traffic NAT Gateway کے ذریعے route ہوتی ہے (internet تک پہنچنے کے لیے، جہاں S3 کا public endpoint ہے)۔ آپ NAT Gateway processing کے لیے ادائیگی کرتے ہیں۔

**VPC Endpoints** آپ کے VPC میں resources کو AWS services کے ساتھ privately بات چیت کرنے دیتے ہیں، public internet کے ذریعے جائے بغیر — اور NAT Gateway کے بغیر۔

دو اقسام:

**Gateway endpoints** (مفت): S3 اور DynamoDB کے لیے۔ آپ اپنے route table میں ایک route شامل کرتے ہیں جو S3 یا DynamoDB traffic کو NAT Gateway کے بجائے endpoint کی طرف ہدایت کرتا ہے۔ بنانے کے لیے مفت؛ استعمال کے لیے مفت۔

**Interface endpoints** (priced): دیگر AWS services کے لیے (SQS، SNS، Secrets Manager، SSM، وغیرہ)۔ آپ کے subnet میں ایک private IP کے ساتھ ایک ENI (Elastic Network Interface) بناتا ہے۔ Service کو traffic یہ private IP استعمال کرتی ہے۔ فی AZ ~$0.01/گھنٹہ علاوہ data processing خرچ کرتا ہے۔

Leo نے پچھلے ہفتے route tables اپڈیٹ کیے بغیر Gateway endpoints پہلے ہی بنا لیے تھے۔ "میں نے پہلے ہی اسے deploy کر دیا — اوہ،" اس نے configuration چیک کرتے ہوئے کہا۔ "routes اپڈیٹ نہیں ہوئے۔ مجھے اسے fix کرنے دو۔"

Tom نے یہ جاننے کے بعد کہ وہ مفت ہیں S3 اور DynamoDB کے لیے فوراً Gateway endpoints بنائے۔ NAT Gateway data processing fee 65% گر گئی۔

اس کی وجہ کی ریاضی: private subnets میں Nimbus کے Lambda functions اور ECS tasks S3 (config files پڑھنا، log exports لکھنا) اور DynamoDB (ریستوران data پڑھنا، order records لکھنا) کو مسلسل requests کر رہے تھے۔ ہر request NAT Gateway کے ذریعے route ہوتی، جو فی GB process کیے گئے data $0.045 charge کرتا تھا۔

Nimbus کی ماہانہ NAT Gateway data processing: 533 GB۔ لاگت: $24/مہینہ۔ S3 اور DynamoDB Gateway Endpoints شامل کرنے اور route tables اپڈیٹ کرنے کے بعد: S3 اور DynamoDB traffic نے NAT Gateway کو مکمل طور پر bypass کر دیا۔ ماہانہ NAT Gateway processing 187 GB تک گر گئی — باقی traffic دیگر services (Secrets Manager، SES، external webhooks) کو API calls تھیں۔ لاگت: $8.40/مہینہ۔

بچت: $15.60/مہینہ، $187/سال، دو مفت Gateway Endpoint configurations کے لیے جنہیں سیٹ اپ کرنے میں 10 منٹ لگے۔

"مفت،" Tom نے تیسری بار کہا۔

"Gateway endpoints بنانے کے لیے مفت اور استعمال کے لیے مفت ہیں،" Leo نے تصدیق کی۔ "وہ صرف ایک security بہتری نہیں — S3 اور DynamoDB traffic کو NAT Gateway کے بجائے ایک private endpoint کے ذریعے route کرنا اسے public internet سے مکمل طور پر ہٹا دیتا ہے۔"

"اور اگر کوئی NAT Gateway traffic کے ذریعے توڑنے کی کوشش کرے؟" Priya نے پوچھا۔ "اگر S3 کو traffic NAT کے ذریعے جائے، یہ internet سے addressable ہے۔ Gateway Endpoint کے ذریعے، یہ private ہے۔"

یہ Gateway Endpoints کا ثانوی فائدہ ہے جسے cost بحث کبھی کبھی چھپا دیتی ہے۔ ایک VPC Gateway Endpoint کے ذریعے S3 اور DynamoDB کو traffic کبھی AWS network نہیں چھوڑتی، کبھی ایک public IP address سے نہیں گزرتی، اور endpoint policy (ایک resource-based policy جو محدود کر سکتی ہے کہ endpoint کن S3 buckets یا DynamoDB tables تک رسائی حاصل کر سکتا ہے) کے زیر انتظام ہے۔ customer data اسٹور کرنے والے ایک bucket پر ایک Gateway Endpoint ایک اضافی layer شامل کرتا ہے: ایک misconfigured bucket policy کے ساتھ بھی، endpoint policy رسائی کو مخصوص VPC کے اندر سے شروع ہونے والی traffic تک محدود کر سکتی ہے۔

**AWS Global Accelerator: Edge پر Routing**

جب Nimbus نے us-west-2 (Oregon) سے East Coast users کو serve کیا، latency 80ms تھی۔ اس لیے نہیں کہ server ممنوعہ طور پر دور تھا، بلکہ اس لیے کہ Boston اور Oregon کے درمیان public internet routing غیر بہتر تھی، متعدد carrier networks سے اچھلتی ہوئی۔

**AWS Global Accelerator** AWS کا private global backbone استعمال کرتا ہے — edge locations کا ایک distributed network جو traffic کو public internet carrier hops کے بجائے AWS-کنٹرولڈ paths کے ذریعے آپ کی application تک route کرتا ہے۔ public internet routing کے بجائے، traffic قریب ترین edge location پر AWS کے network میں داخل ہوتی ہے اور آپ کی application تک optimized private path سفر کرتی ہے۔

Nimbus کے لیے، Boston میں ایک user:

- **Global Accelerator کے بغیر**: public internet carriers کے ذریعے route → ~80ms
- **Global Accelerator کے ساتھ**: Boston میں قریب ترین AWS edge پر hit → AWS backbone سفر → us-west-2 تک پہنچے → ~60ms

Global Accelerator content cache نہیں کرتا (یہ CloudFront ہے)۔ یہ dynamic requests کے لیے network path کو optimize کرتا ہے۔

Leo نے Nimbus API کے لیے Global Accelerator فعال کرنے کے بعد کئی شہروں میں ایک latency موازنہ چلایا:

| شہر | پہلے | بعد | بہتری |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

بہتری جغرافیائی طور پر دور users کے لیے سب سے ڈرامائی تھی — Tokyo 180ms سے 95ms، Sydney 210ms سے 118ms۔ Seattle کے لیے (Oregon میں us-west-2 data centers کے قریب)، بہتری چھوٹی تھی — optimize کرنے کے لیے کم public internet hops تھے۔

"رکو — لیکن Tokyo کو 47% بہتری *کیوں* مل رہی ہے؟" Maya نے پوچھا۔ "اگر data center اب بھی us-west-2 میں ہے، تو کیا روشنی کی رفتار اصل رکاوٹ نہیں ہے؟"

"روشنی کی رفتار فرش ہے،" Leo نے کہا۔ "اصل رکاوٹ public internet routing ہے۔ Tokyo سے us-west-2 تک traffic درجنوں autonomous systems پار کرتی ہے — مختلف carriers، مختلف routers، مختلف peering agreements۔ ہر hop latency شامل کرتا ہے۔ Global Accelerator traffic کو Tokyo edge location سے us-west-2 تک AWS کے private fiber پر route کرتا ہے، جس کے کم paths اور بہتر-tuned routing ہے۔"

Tokyo سے us-west-2 تک نظریاتی minimum (fiber پر روشنی کی رفتار کی بنیاد پر، تقریباً 15,500 km round trip): ~77ms۔ Global Accelerator کے ساتھ 95ms اس نظریاتی minimum کے قریب پہنچ رہا ہے۔ اس کے بغیر 180ms public internet routing کی ناکارآمدی کی عکاسی کرتا ہے، physics کے قوانین کی نہیں۔

Global Accelerator دو static **anycast IP addresses** فراہم کرتا ہے جو قریب ترین edge location کی طرف route کرتے ہیں۔ CloudFront کے برعکس (جو dynamic IP addresses استعمال کرتا ہے جو بدلتے ہیں)، یہ IPs مستحکم ہیں — firewall allowlisting کے لیے اور ان applications کے لیے مفید جنہیں clients کے connect کرنے کے لیے ایک fixed IP درکار ہے۔

**Global Accelerator بمقابلہ CloudFront کب استعمال کریں**:

- CloudFront: static اور cacheable content، CDN use case
- Global Accelerator: dynamic content، non-HTTP protocols (UDP، gaming، IoT)، یا جب آپ کو ایک static Anycast IP address چاہیے

## صرف Traffic نہیں، Data منتقل کرنا: DataSync اور Transfer Family

جب networking architecture شکل اختیار کر رہی تھی، Maya کے پاس تین نئے restaurant chain onboarding projects بیک وقت آ گئے۔ ہر ایک کی ایک data migration requirement تھی — اور ہر requirement مختلف تھی۔

پہلی chain، Pacific Table، کو 40 TB NFS file shares S3 میں منتقل کرنے کی ضرورت تھی۔ ان کا موجودہ file storage on-premises تھا، ان کے Seattle headquarters میں چار file servers میں پھیلا ہوا۔ Leo نے ایک migration plan لکھنا شروع کیا۔

دوسری chain، Marisol Group، کی ایک accounting team تھی جو روزانہ ایک local SFTP server کو invoices upload کرتی تھی۔ SFTP workflow 2015 سے چل رہی تھی۔ Accounting staff ایک چیز جانتی تھی: وہ ہر صبح 9 AM پر اپنا SFTP client کھولتے، اپنے invoices drop کرتے، اور اسے بند کر دیتے۔ کوئی اسے تبدیل نہیں کرنا چاہتا تھا۔ "ان کے accountants WinSCP استعمال کرتے ہیں،" Maya نے کہا۔ "یہ قابل مذاکرات نہیں ہے۔"

"یہ دو مختلف tools ہیں،" Priya نے کہا۔

"ہاں،" Leo نے کہا۔ "لیکن دونوں موجود ہیں۔"

**AWS DataSync: rsync on Steroids، ایک AWS Console کے ساتھ**

Pacific Table کے 40 TB migration کے لیے، چیلنج bandwidth نہیں تھا — Seattle دفتر کا ایک مضبوط upstream connection تھا۔ چیلنج orchestration تھا: دریافت کرنا کہ کون سی files موجود ہیں، انہیں قابل اعتماد طریقے سے transfer کرنا، checksums verify کرنا، business hours کے دوران دفتر کے network کو saturate کرنے سے بچنے کے لیے transfer schedule کرنا، اور کئی دنوں کے مسلسل operation پر progress monitor کرنا۔

**AWS DataSync** ایک agent-based data migration اور replication service ہے۔ آپ اپنے on-premises environment میں ایک ہلکا DataSync agent install کرتے ہیں — ایک virtual machine جو VMware پر یا ایک EC2 instance کے طور پر چلتی ہے۔ Agent آپ کے file servers سے NFS یا SMB پر connect ہوتا ہے، آپ کے shares دریافت کرتا ہے، اور انہیں AWS میں ایک destination تک synchronize کرتا ہے: ایک S3 bucket، ایک EFS filesystem، یا ایک FSx filesystem۔

اسے rsync on steroids کے طور پر سوچیں، ایک AWS console کے ساتھ۔ DataSync سنبھالتا ہے:

- **Discovery**: agent آپ کے source shares کا خودبخود inventory کرتا ہے
- **Scheduling**: transfers ایک متعین schedule پر (business hours کے باہر) یا مسلسل چل سکتے ہیں
- **Verification**: DataSync دونوں سروں پر checksums compute کرتا ہے اور آپ کو کسی بھی inconsistencies پر alert کرتا ہے
- **Monitoring**: transfer progress، file counts، error reports، اور bandwidth utilization سب console میں نظر آتے ہیں
- **Encryption in transit**: transfer کے دوران تمام data TLS استعمال کرتے ہوئے encrypted ہے

Pacific Table کے لیے، Leo نے ان کے Seattle network میں ایک VM پر DataSync agent install کیا، اسے چار NFS shares کی طرف اشارہ کیا، اور ایک transfer schedule configure کیا: ہفتے کے دنوں میں 8 PM سے 6 AM، weekends پر مسلسل۔ چھ دنوں کے بعد، تمام 40 TB S3 میں آ گیا۔ اس نے transfer کو DataSync کی built-in checksum report کے ساتھ verify کیا۔ صفر تضادات۔

"اور جاری replication کے لیے؟" Maya نے پوچھا۔ "Pacific Table migration کے بعد بھی files شامل کرتا رہے گا۔"

"DataSync incremental transfers سپورٹ کرتا ہے،" Leo نے کہا۔ "ابتدائی sync کے بعد، یہ صرف وہی copy کرتا ہے جو تبدیل ہوا ہے۔ ہم اسے ایک replication job کے طور پر رات کو چلا سکتے ہیں۔"

**AWS Transfer Family: آپ کا SFTP Workflow، S3 سے Backed**

Marisol Group کی accounting team کے لیے، requirement مختلف تھی۔ کوئی SFTP سے دور نہیں جا رہا تھا۔ Accountants WinSCP استعمال کرتے رہنے والے تھے۔ سوال یہ تھا: وہ SFTP uploads کہاں آتے ہیں؟

فی الحال، وہ Marisol back office میں ایک local Linux server پر آتے تھے۔ Files پھر دستی طور پر ان کے accounting system میں منتقل کیے جاتے۔ Local server کو maintenance، backups، اور اسے manage کرنے کے لیے SSH access والے کسی کی ضرورت تھی۔

**AWS Transfer Family** ایک fully managed SFTP، FTPS، اور FTP server ہے — storage destination کے طور پر S3 یا EFS سے backed۔ آپ ایک Transfer Family endpoint provision کرتے ہیں (اسے ایک hostname اور، اختیاری طور پر، ایک static IP address ملتا ہے)۔ آپ کے clients اپنے موجودہ SFTP software استعمال کرتے ہوئے اس سے connect ہوتے ہیں۔ جب وہ files upload کرتے ہیں، وہ files براہ راست ایک S3 bucket میں آتے ہیں۔

Accounting team کچھ تبدیل نہیں کرتی۔ وہ پھر بھی ہر صبح 9 AM پر WinSCP کھولتے ہیں۔ وہ پھر بھی اپنے موجودہ credentials کے ساتھ ایک SFTP server سے connect ہوتے ہیں۔ وہ پھر بھی اپنے invoices اسی folder میں drop کرتے ہیں۔ فرق ان کے لیے invisible ہے: server side پر، files اب ایک local Linux server کے بجائے براہ راست S3 میں جاتے ہیں۔

"اور S3 سے، ہم باقی workflow کو خودبخود trigger کر سکتے ہیں،" Priya نے کہا۔ "ایک S3 event ایک Lambda function کو trigger کرتا ہے جو invoice process کرتا ہے اور اسے accounting system میں insert کرتا ہے۔ کوئی دستی step نہیں۔"

"تو accountants کا workflow تبدیل نہیں ہوتا،" Maya نے کہا، "لیکن ہماری طرف، پوری چیز خودکار ہے۔"

"ہاں۔ اور SFTP server خود fully managed ہے — کوئی patching نہیں، کوئی backups نہیں، manage کرنے کے لیے کوئی server نہیں۔"

Tom نے pricing پہلے ہی دیکھ لی تھی۔ Transfer Family endpoint availability کے فی گھنٹہ علاوہ فی GB transferred charge کرتا ہے۔ Marisol Group کے invoice volume کے لیے، ماہانہ لاگت $30 سے کافی کم تھی۔ جس local server کی یہ جگہ لے رہا تھا اسے برقرار رکھنے کی لاگت — hardware depreciation، maintenance کے لیے engineering وقت، backup management — کافی زیادہ تھی۔

---

> **امتحانی نکتہ — DataSync اور Transfer Family**
>
> *SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں (ڈومین 3، ٹاسک 3.1)*
>
> - **DataSync** = on-premises سے AWS تک bulk میں data منتقل کرنا (NFS یا SMB file shares → S3، EFS، یا FSx)۔ امتحانی signals: "file shares منتقل کریں،" "NFS data کو S3 میں replicate کریں،" "on-premises سے AWS data transfer،" "file data کی جاری replication۔" DataSync on-premises install کیا گیا ایک agent استعمال کرتا ہے؛ agent discovery، scheduling، اور verification سنبھالتا ہے۔
> - **Transfer Family** = SFTP، FTPS، یا FTP protocols استعمال کرتے ہوئے جاری file transfer، client tools تبدیل کیے بغیر۔ امتحانی signals: "موجودہ SFTP workflow،" "partners SFTP کے ذریعے files upload کرتے ہیں،" "S3 سے backed SFTP server،" "lift-and-shift SFTP،" "file transfer process تبدیل نہیں کر سکتے۔" Transfer Family جواب ہے جب requirement SFTP compatibility ہو، data volume نہیں۔
> - **فرق اہم ہے**: DataSync bulk migration اور replication کے لیے ہے (agent-based، schedule-driven، network-optimized)۔ Transfer Family protocol-compatible file transfer services کے لیے ہے (endpoint-based، always-on، client-transparent)۔ وہ مختلف مسائل حل کرتے ہیں۔
> - DataSync destinations کے طور پر S3، EFS، اور FSx سپورٹ کرتا ہے۔ Transfer Family storage backends کے طور پر S3 اور EFS سپورٹ کرتا ہے۔

---

**صرف Files نہیں، Servers منتقل کرنا: 7 Rs اور MGN**

Maya کی pipeline میں تیسری chain کے پاس صرف files نہیں تھیں — اس کے پاس پورے servers تھے: دو on-premises machines پر چلتی ایک custom reservations application جسے کوئی move سے پہلے دوبارہ لکھنا نہیں چاہتا تھا۔ *applications* منتقل کرنا اپنا ایک شعبہ ہے، اور AWS **منتقل کرنے کے سات طریقے** بیان کرتا ہے ("7 Rs") جنہیں آپ کو زیادہ تر پہچاننے کی ضرورت ہے:

- **Rehost** ("lift and shift"): servers کو جیسے وہ ہیں منتقل کریں۔ سب سے تیز، کم سے کم تبدیلی۔
- **Replatform** ("lift، tinker، and shift"): راستے میں چھوٹے upgrades — جیسے ایک self-managed database کو RDS میں منتقل کرنا۔
- **Repurchase**: پرانا نظام چھوڑ دیں، بجائے SaaS خریدیں۔
- **Refactor**: cloud-native دوبارہ ڈیزائن کریں۔ سب سے زیادہ کوشش، سب سے زیادہ فائدہ۔
- **Retire**: پتہ چلا کسی نے اسے استعمال نہیں کیا۔ اسے delete کریں۔
- **Retain**: اسے فی الحال جہاں ہے وہیں چھوڑ دیں۔
- **Relocate**: hypervisor کی سطح پر کچھ بھی تبدیل کیے بغیر منتقل کریں۔

rehost case کے لیے، tool **AWS Application Migration Service (MGN)** ہے: ایک agent source servers کی disks کو، block بہ block، AWS میں ایک low-cost staging area میں replicate کرتا ہے؛ آپ جب چاہیں test copies launch کرتے ہیں؛ cutover پر، MGN replicated servers کو native EC2 instances میں تبدیل کرتا ہے۔ Lift، shift، ہو گیا — refactoring بعد میں آ سکتی ہے، cloud time پر۔ (portfolio planning کے لیے اس کے ساتھی، Application Discovery Service اور Migration Hub، 2025 کے آخر میں نئے customers کے لیے بند ہو گئے — اگر امتحان ان کا ذکر کرے تو ان کے نام "inventory discovery" اور "central migration tracking" کے طور پر جانیں۔)

---

**AWS Snow Family: Physical Option**

ابھی بھی 4TB تاریخی dataset اور 17-گھنٹے کے internet تخمینے کا معاملہ تھا۔ اسے حساب کرنے کے بعد، Leo نے Snow Family pricing page دیکھی تھی اور فوراً فیصلہ کر لیا تھا۔

چند terabytes سے اوپر کی migrations کے لیے جہاں وقت سادگی سے زیادہ اہم ہو، AWS آپ کے location پر physical storage appliances بھیجتا ہے۔ آپ انہیں data سے بھرتے ہیں۔ آپ انہیں واپس بھیجتے ہیں۔ AWS data کو براہ راست S3 میں ingest کرتا ہے۔

**Snowball Edge Storage Optimized**: 80 TB قابل استعمال capacity، سخت enclosure۔ 2-5 business days میں آپ کے location پر بھیجتا ہے۔ آپ local interface (NFS، S3 interface) استعمال کرتے ہوئے data load کرتے ہیں۔ آپ اسے واپس بھیجتے ہیں۔ AWS وصول کے بعد تقریباً 1-3 business days میں data ingest کرتا ہے۔

Nimbus کے 4TB migration کے لیے، process:

1. AWS console کے ذریعے ایک Snowball Edge **آرڈر** کریں (2 منٹ لیتا ہے، 3 دنوں میں بھیجتا ہے)
2. appliance کو Seattle دفتر network سے **connect** کریں؛ یہ ایک NFS mount point کے طور پر پیش ہوتا ہے
3. device کے S3-compatible interface استعمال کرتے ہوئے 4TB تاریخی order data **copy** کریں: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **Copy تقریباً 2 گھنٹوں میں مکمل ہوتا ہے** (local network، کوئی internet نہیں)
5. appliance کو واپس AWS **بھیجیں** (prepaid label شامل)
6. AWS وصول کے 72 گھنٹوں کے اندر S3 میں data **ingest** کرتا ہے
7. **Verify** — S3 ایک job completion report فراہم کرتا ہے جو ہر transfer کی گئی file اور checksum دکھاتا ہے

کل گزرا وقت: delivery کے لیے 3 دن + copy کے لیے 2 گھنٹے + shipping کے لیے 1 دن + ingestion کے لیے 2 دن = تقریباً 7 calendar days۔ بمقابلہ تقریباً 17 گھنٹے مسلسل — جس کے لیے ایک مستحکم، بلا تعطل internet connection درکار ہوتا، دفتر کے uplink کو رات بھر اور بیشتر business day کے دوران saturate کرتا۔

لاگت: Snowball Edge device rental 10 دنوں کے لیے $300 ہے۔ Shipping (دو طرفہ): تقریباً $80۔ S3 data transfer in مفت ہے۔ کل migration لاگت: **$380**۔

تقریباً 17 گھنٹے کے 875 Mbps sustained internet usage سے موازنہ کریں: VPN tunnel مفت تھا ($0.05/گھنٹہ لیکن tunnel پہلے ہی چل رہا تھا)؛ S3 transfer in مفت تھا۔ "مفت" internet path کی engineering وقت میں ایک حقیقی لاگت تھی (ایک 17-گھنٹے transfer کی monitoring)، خطرہ (کوئی بھی interruption restart کی ضرورت)، اور opportunity cost (transfer window کے دوران ان کا internet connection saturated تھا)۔ Leo نے آرڈر دیا۔ یہ کیسے ہوا اس باب کے پوسٹ کریڈٹس منظر میں ہے۔

---

## خوبیاں اور حدود

**Site-to-Site VPN**:

- تیز setup، کم لاگت
- public internet path کا مطلب متغیر latency
- محدود bandwidth ceiling (فی tunnel 1.25 Gbps)
- Accelerated VPN option قدرے زیادہ لاگت پر latency بہتر کرتا ہے

**Direct Connect**:

- مستقل، private، high-bandwidth
- سیٹ اپ کرنے میں سست، نمایاں بار بار آنے والی لاگت
- physical circuit ناکامی کا واحد نقطہ ہے (redundancy شامل کریں یا VPN backup برقرار رکھیں)
- pricing scenario کے لحاظ سے تقریباً 10-15 TB/مہینہ پر egress cost savings کے ساتھ break-even

**AWS Snow Family**:

- 1-2 TB سے اوپر کی یکبارگی migrations کے لیے، اکثر network transfer سے تیز اور سستا
- migration کے دوران کوئی internet bandwidth consumption نہیں
- 10-دن device rental window؛ prepaid shipping

**Transit Gateway**:

- multi-VPC connectivity کو ڈرامائی طور پر آسان کرتا ہے
- Transitive routing (VPC peering کے برعکس)
- Isolation route tables علیحدہ peering connections کے بغیر segmentation کی اجازت دیتے ہیں
- بہت سے attachments کے لیے لاگت بڑھ جاتی ہے

**VPC Endpoints**:

- S3/DynamoDB کے لیے security اور cost فائدہ (مفت gateway endpoints)
- AWS service traffic کے لیے NAT Gateway لاگتیں ختم کرتا ہے
- Endpoint policies IAM اور bucket policies سے آگے ایک اضافی access control layer شامل کرتی ہیں
- دیگر services (Secrets Manager، SSM، SES) کے لیے interface endpoints traffic کو private رکھتے ہیں لیکن فی AZ ~$0.01/گھنٹہ خرچ کرتے ہیں

**Global Accelerator**:

- عالمی users کے لیے dynamic application latency بہتر کرتا ہے: دور users کے لیے عملی طور پر 33-47% بہتری
- Fixed Anycast IPs (CloudFront کے dynamic IPs کے برعکس) — firewall allowlisting کے لیے مفید
- Non-HTTP protocols (UDP، TCP) — CloudFront صرف HTTP/HTTPS ہے
- اضافی لاگت (فی accelerator $0.025/گھنٹہ + data transfer)

## خلاصہ

باب 24 میں Aurora کام نے بہتر کیا کہ Nimbus اپنی application کو data کیسے serve کرتا ہے۔ یہ باب اس بارے میں ہے کہ data بیرونی دنیا اور AWS کے درمیان کیسے منتقل ہوتا ہے — اور اس حرکت کو زیادہ قابل اعتماد، تیز، اور کم مہنگا کیسے بنائیں۔

- **Site-to-Site VPN**: on-premises اور VPC کے درمیان public internet پر encrypted tunnel۔ تیز setup، کم لاگت، متغیر latency۔ redundancy کے لیے دو tunnels۔ زیادہ سے زیادہ فی tunnel 1.25 Gbps۔
- **Direct Connect**: AWS تک private، dedicated fiber connection۔ قابل پیش گوئی latency، زیادہ bandwidth، سیٹ اپ کرنے میں ہفتے، نمایاں لاگت۔ Nimbus کے pricing scenario کے لیے VPN کی egress savings کے ساتھ تقریباً 13.5 TB/مہینہ پر break-even۔
- **AWS Snow Family**: bulk data migration کے لیے physical storage appliances۔ multi-TB migrations کے لیے internet transfer سے تیز۔ Nimbus کے 4TB migration کے لیے کل $380 بمقابلہ تقریباً 17 گھنٹے network saturation۔
- **Transit Gateway**: VPC اور on-premises connectivity کے لیے hub۔ Transitive routing کو قابل بناتا ہے (VPC peering کے برعکس)۔ کنٹرول کرنے کے لیے isolation route tables سپورٹ کرتا ہے کہ کون سے VPCs کن تک پہنچ سکتے ہیں۔ سینکڑوں connections تک scale کرتا ہے۔
- **VPC Endpoints**: NAT Gateway کے بغیر AWS services تک private رسائی۔ Gateway endpoints (S3، DynamoDB) مفت ہیں — انہیں S3 یا DynamoDB تک رسائی والے ہر VPC میں شامل کریں۔ Nimbus کو $15.60/مہینہ بچایا اور S3/DynamoDB traffic NAT Gateway سے ہٹا دی۔
- **Global Accelerator**: عالمی سطح پر کم، زیادہ مستقل latency کے لیے dynamic traffic کو AWS private backbone پر route کرتا ہے۔ Static Anycast IPs۔ دور users کے لیے 33-47% latency بہتری (Tokyo: 180ms → 95ms؛ Sydney: 210ms → 118ms)۔ ایک CDN نہیں — cache نہیں کرتا۔
- **AWS DataSync**: on-premises NFS/SMB file data کو S3، EFS، یا FSx میں منتقل اور replicate کرنے کے لیے agent-based service۔ scheduling، checksum verification، monitoring سنبھالتا ہے۔ یکبارگی migrations اور file shares کی جاری replication کے لیے استعمال ہوتا ہے۔
- **AWS Transfer Family**: S3 یا EFS سے backed managed SFTP، FTPS، اور FTP server۔ موجودہ SFTP clients کو اپنا workflow تبدیل کیے بغیر S3 میں files upload کرنے دیتا ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں (ڈومین 3، ٹاسک 3.4)*

- **VPN بمقابلہ Direct Connect signals**: VPN = "VPC کو traffic encrypt کریں،" "تیز setup،" "cost-sensitive۔" Direct Connect = "مستقل کم latency،" "بڑے data transfers،" "private connection،" "private network کا تقاضا کرتی compliance۔"
- **Transit Gateway بمقابلہ VPC Peering**: Peering non-transitive ہے (A→B→C، A→C کی اجازت نہیں دیتا)۔ Transit Gateway transitive ہے۔ "بہت سے VPCs جنہیں بات چیت کی ضرورت ہے" → Transit Gateway۔
- **VPC Gateway Endpoints**: مفت۔ صرف S3 اور DynamoDB۔ Route table تبدیلی۔ کوئی اضافی لاگت نہیں۔ امتحانی منظر نامہ: "private subnet سے S3 رسائی کے لیے data transfer لاگتیں کم کریں" → Gateway Endpoint۔
- **Global Accelerator بمقابلہ CloudFront**: Accelerator = dynamic content، non-HTTP، static IP، network optimization۔ CloudFront = caching، HTTP content، CDN۔
- **Direct Connect + VPN**: آپ ایک Direct Connect connection کے لیے ایک VPN کو backup کے طور پر استعمال کر سکتے ہیں۔ اگر Direct Connect circuit ناکام ہو، traffic VPN پر failover ہو جاتی ہے۔ اکیلے VPN سے زیادہ مہنگا، اکیلے Direct Connect سے زیادہ قابل اعتماد۔
- **Direct Connect Gateway**: ایک Direct Connect circuit کو متعدد regions یا accounts میں متعدد VPCs سے connect کریں۔ اس کے بغیر، ایک Direct Connect circuit ایک region میں ایک VGW سے connect ہوتا ہے۔
- **AWS Snow Family**: "بڑی data migration،" "transfer speed بہت سست ہے،" "petabyte-scale migration" → Snow Family۔ Snowball Edge = 80TB تک۔ پہلے transfer ریاضی کریں: اگر دستیاب network پر data منتقل کرنے میں تقریباً ایک ہفتہ یا زیادہ لگے، جواب ایک physical device ہے۔ *حقیقت کی جانچ (2026)*: AWS خاندان کو retire کر رہا ہے — Snowmobile 2024 میں واپس لیا گیا، Snowcone 2024 کے آخر میں بند ہوا، اور نومبر 2025 تک Snow devices نئے customers کو مزید پیش نہیں کیے جاتے (AWS اب fast links پر DataSync اور **Data Transfer Terminals** کی طرف اشارہ کرتا ہے، محفوظ locations جہاں آپ اپنی drives لاتے ہیں)۔ SAA-C03 question bank اس سب سے پہلے کی ہے، تو امتحان پر، "network transfer کے ہفتے، محدود bandwidth" اب بھی Snowball کی طرف اشارہ کرتا ہے۔
- **Transit Gateway route tables**: Transit Gateway network segmentation کے لیے متعدد route tables سپورٹ کرتا ہے۔ امتحانی signal: Transit Gateway کے ذریعے shared connectivity کے ساتھ "production VPC کو staging سے isolate کریں" → علیحدہ route tables۔
- **Global Accelerator fixed IPs**: CloudFront کے برعکس، Global Accelerator دو static Anycast IPs فراہم کرتا ہے۔ امتحانی signal: "application کو clients کے allowlist کرنے کے لیے ایک fixed IP address چاہیے" یا "UDP traffic" → Global Accelerator (CloudFront صرف HTTP/HTTPS ہے)۔
- **AWS DataSync signals**: "NFS/SMB file shares کو S3/EFS/FSx میں منتقل کریں،" "on-premises file data کی جاری replication،" "agent-based file migration۔" DataSync protocol-compatible SFTP transfer کے لیے نہیں — یہ bulk file share migration اور replication کے لیے ہے۔
- **AWS Transfer Family signals**: "موجودہ SFTP workflow،" "partners یا customers SFTP کے ذریعے files upload کرتے ہیں،" "client tools تبدیل کیے بغیر SFTP server کو cloud میں lift کریں،" "S3 سے backed SFTP/FTPS/FTP۔" Transfer Family ایک data migration tool نہیں — یہ ایک managed protocol endpoint ہے۔ فرق: DataSync ایک schedule پر bulk میں data منتقل کرتا ہے؛ Transfer Family جاری file uploads کے لیے ایک always-on SFTP/FTP endpoint فراہم کرتا ہے۔
- **MGN (Application Migration Service)**: "سینکڑوں VMs کو جلدی منتقل کریں، کوئی code تبدیلی نہیں،" "servers کو EC2 میں rehost / lift-and-shift کریں" → MGN (block-level replication، test launches، native EC2 instances میں cutover)۔ DataSync *files* منتقل کرتا ہے؛ DMS *databases* منتقل کرتا ہے؛ MGN *پورے servers* منتقل کرتا ہے۔

## مشقیں

**مشق 1 — یادداشت**

AWS Site-to-Site VPN اور AWS Direct Connect کے درمیان فرق کی وضاحت کریں۔ کس منظر نامے میں آپ ہر ایک کو منتخب کریں گے؟

*(اشارہ: setup time، لاگت، latency consistency، اور bandwidth requirements کے بارے میں سوچیں۔)*

**مشق 2 — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک financial services کمپنی کو اپنے on-premises data center سے AWS تک ایک private، encrypted، dedicated network connection کی ضرورت ہے۔ وہ روزانہ 500GB حساس financial data منتقل کرتے ہیں۔ Connection کی مستقل، قابل پیش گوئی latency ہونی چاہیے اور اسے public internet سے نہیں گزرنا چاہیے۔ انہیں primary کے ناکام ہونے کی صورت میں ایک backup connection بھی چاہیے۔

کون سا architecture ان ضروریات کو سب سے بہتر طریقے سے پورا کرتا ہے؟

A) BGP routing کے ساتھ ایک Site-to-Site VPN اور redundancy کے لیے ایک دوسرا VPN  
B) Direct Connect Gateway کے ساتھ ایک Direct Connect Hosted Connection  
C) مختلف internet providers کے ذریعے دو Site-to-Site VPN connections  
D) backup کے طور پر ایک Site-to-Site VPN کے ساتھ ایک Direct Connect connection

**اشارہ 1**: "public internet سے نہیں گزرنا چاہیے" — VPN traffic public internet پر جاتی ہے (encrypted)۔ صرف Direct Connect private ہے۔

**اشارہ 2**: "مستقل، قابل پیش گوئی latency" — public internet VPN performance بدلتی ہے۔ Direct Connect مستقل ہے۔

**اشارہ 3**: "backup connection" — جب Direct Connect primary ہو تو سفارش کردہ طریقہ کیا ہے؟

**جواب**: D

**وضاحت**: Direct Connect ایک private، dedicated connection فراہم کرتا ہے جو public internet سے نہیں گزرتا — privacy اور latency requirements کو پورا کرتے ہوئے۔ backup کے طور پر ایک Site-to-Site VPN redundancy فراہم کرتا ہے: اگر Direct Connect circuit ناکام ہو، traffic encrypted VPN پر failover ہو جاتی ہے۔ یہ Direct Connect کے لیے معیاری HA pattern ہے۔

**A کیوں نہیں؟** Site-to-Site VPN traffic public internet سے گزرتی ہے، جو "public internet سے نہیں گزرنا چاہیے" requirement کی خلاف ورزی کرتی ہے۔

**B کیوں نہیں؟** ایک Hosted Connection ایک Direct Connect connection فراہم کرتا ہے لیکن option B میں ایک backup شامل نہیں۔ backup کے بغیر اکیلا Direct Connect ناکامی کا واحد نقطہ ہے — physical fiber کاٹا جا سکتا ہے۔

**C کیوں نہیں؟** مختلف ISPs کے ذریعے دو VPN connections پھر بھی public internet سے گزرتے ہیں، encrypted ہونے کے باوجود۔ private network requirement کو پورا نہیں کرتا۔

*SAA-C03 ڈومین: High-Performing Architectures ڈیزائن کریں — ٹاسک 3.4*

**مشق 3 — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus Seattle، Berlin، اور Singapore میں regional engineering teams رکھنے کے لیے توسیع کر رہا ہے۔ ہر regional team کو رسائی کی ضرورت ہے:

- production VPC (debugging کے لیے read-only)
- staging VPC (testing کے لیے مکمل رسائی)
- analytics VPC (reporting کے لیے read-only)

network connectivity ڈیزائن کریں۔ کیا آپ Transit Gateway استعمال کریں گے؟ ہر region میں Direct Connect یا Site-to-Site VPN؟ آپ production کے لیے read-only رسائی کیسے نافذ کریں گے؟ (اشارہ: یہ ایک network اور IAM سوال دونوں ہے۔)

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region، multi-team network design کی مشق کرنا ہے۔)*

**توسیع**: Berlin team report کرتی ہے کہ production VPC (us-west-2) کو ان کی VPN latency اوسطاً 160ms ہے۔ کس data volume پر Accelerated Site-to-Site VPN یا ایک Direct Connect Hosted Connection بہتر option بن جائے گا؟ ایک European AWS Partner سے موجودہ Direct Connect Hosted Connection pricing پر تحقیق کریں۔ کیا اکیلی latency بہتری آپ کے تخمینی data volume پر لاگت کو جائز ٹھہرائے گی؟

## پوسٹ کریڈٹس منظر

Data migration 8 calendar days میں مکمل ہوئی — Snowball Edge کے آنے کے لیے 3 دن، data copy کرنے کے لیے 94 منٹ، AWS کے device وصول کرنے اور data ingest کرنے کے لیے 4 دن، پھر اس delta کا ایک حتمی sync جو Snowball کے transit میں رہتے ہوئے جمع ہوا تھا۔ پوری چیز کے لیے hands-on وقت: چار گھنٹے سے کم۔

وہ آخری step اہم تھا۔ Snowball Edge نے 4TB dataset کا ایک point-in-time snapshot copy کیا۔ جب یہ transit میں تھا، production database چلتی رہی تھی — نئے آرڈرز دیے جا رہے تھے، نئے records بن رہے تھے۔ VPN پر delta sync 12GB تھا، 18 منٹ میں مکمل ہوا۔

"Bulk transfer Snowball تھا،" Leo نے کہا۔ "Sync بس ان 8 دنوں سے net-new data تھا جو اس نے لیے۔"

"میں نے پہلے ہی اسے deploy کر دیا — اوہ،" Leo نے کہا، 94 منٹ کے بعد Snowball Edge پر copy مکمل ہوتے دیکھتے ہوئے۔ "مجھے business hours کے دوران دفتر کے network کو saturate کرنے سے بچنے کے لیے local copy پر bandwidth throttle سیٹ کرنا چاہیے تھا۔"

اس نے throttle سیٹ نہیں کیا تھا۔ دفتر کا internet ٹھیک تھا — Snowball ایک local network operation تھا۔ لیکن network switch مختصراً ایک bottleneck بن گیا جب copy 9 Gbps local throughput کے قریب پہنچی۔

"نکتہ،" اس نے throttle setting fix کرنے کے بعد کہا، "یہ ہے کہ physical mail ایک خاص data volume سے اوپر internet سے تیز ہے۔"

"یہ یا تو واضح ہے یا غیر بدیہی،" Maya نے کہا، "اس پر منحصر ہے کہ آپ اس کے بارے میں کیسے سوچتے ہیں۔"

"اگلی بار،" Leo نے کہا، "ہمیں ایک Direct Connect سیٹ اپ کرنا چاہیے۔"

Tom نے calculator کی طرف ہاتھ نہیں بڑھایا — اس نے پہلے ہی ریاضی کر لی تھی، جب Direct Connect پہلی بار سامنے آیا تھا: تقریباً ایک ہزار ماہانہ، port علاوہ circuit۔

"جو ہم اب کرتے ہیں اس کے لیے، شاید قابل نہیں۔ لیکن اگر ہم اپنے دفتر اور AWS کے درمیان فی مہینہ 10TB سے زیادہ منتقل کرنا شروع کریں، Direct Connect پر data transfer savings لاگت کو offset کریں گی۔"

"تو ہم data transfer volume monitor کرتے ہیں،" Priya نے کہا، "اور جب یہ threshold پار کرے تو دوبارہ غور کرتے ہیں۔"

"یہ cost-aware architecture ہے،" Tom نے کہا۔

"یہ ہمیشہ نکتہ رہا ہے،" Maya نے کہا۔

Priya نے کمرے کے دوسری طرف سے migration دیکھی تھی۔ "اگلی بار جب ہم اس جیسا کچھ کریں،" اس نے کہا، "کیا ہم اسے data کے production میں آنے اور business کے اس پر منحصر ہونے سے پہلے کر سکتے ہیں؟ live data منتقل کرنا ہمیشہ at-rest data منتقل کرنے سے زیادہ خطرناک ہے۔"

"جب business چل رہا ہو تو یہ کبھی at-rest نہیں ہوتا،" Leo نے کہا۔

"مجھے معلوم ہے،" اس نے کہا۔ "یہی نکتہ ہے۔ migration کی منصوبہ بندی اس سے پہلے کریں کہ آپ کو اس کی ضرورت ہو۔ بعد میں نہیں۔"

Tom نے پہلے ہی حساب لگا لیا تھا کہ us-east-1 میں infrastructure کا ایک دوسرا سیٹ کسی بھی وقت ایک migration وصول کرنے کے لیے تیار رکھنے کی کیا لاگت آئے گی۔ اس نے نمبر فی الحال اپنے پاس رکھا۔ بند کرنے کے لیے زیادہ فوری ابواب تھے۔

اگلے باب میں: کیا ہوتا ہے جب آپ کے پاس کسی بھی database کے معقول طور پر اسٹور کرنے سے زیادہ data ہو، اور آپ کو اس سب کا مطلب نکالنا ہو۔
