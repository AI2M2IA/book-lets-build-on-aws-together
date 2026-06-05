# باب ۲۵: نجی شاہراہ

ایک لمحے کے لیے کھڑے ہو جائیں۔ اپنے ہاتھ جھٹکیں۔

ہم data منتقل کرنے کی بات کرنے والے ہیں۔ AWS کے اندر services کے درمیان نہیں، بلکہ حقیقی دنیا اور AWS کے درمیان — آپ کے دفتر اور آپ کے cloud infrastructure کے درمیان، براعظموں کے درمیان۔

Nimbus کی infrastructure ٹیم (اب چار engineers) Seattle کے ایک shared دفتر سے کام کرتی تھی۔ انہیں اپنے manage کردہ AWS infrastructure تک رسائی کی ضرورت تھی۔ کچھ operations کے لیے VPC میں resources سے جڑنا ضروری تھا۔

فی الحال، وہ VPN استعمال کر کے public subnet میں bastion host تک پہنچتے، پھر وہاں سے resources تک SSH کرتے۔

یہ کام کرتا تھا۔ یہ سست تھا۔ VPN connection public internet کے ذریعے route ہوتی: Seattle → cross-country fiber → متعدد carrier hops → us-east-1۔ ہر round trip 80+ milliseconds۔

"روز مرہ SSH کے لیے، یہ قابل قبول ہے،" Leo نے کہا۔ "لیکن ہم ابھی اپنا analytics database منتقل کرنے والے ہیں۔ 4 terabytes کی تاریخی آرڈر data۔ اس connection پر، migration ہفتوں لے گی۔"

"ہمیں ایک بہتر connection کی ضرورت ہے،" Maya نے کہا۔

"ایک نجی connection،" Priya نے اضافہ کیا۔ "عوامی internet کے ذریعے نہیں۔"

اسے اس طرح سوچیں: ایک Site-to-Site VPN گھر سے عوامی سڑکوں پر گاڑی چلانے کی طرح ہے: آپ اپنی گاڑی کے دروازے lock کرتے ہیں (encryption)، لیکن آپ پھر بھی ہر کسی کے ساتھ lanes share کرتے ہیں، اور traffic jams آپ کو غیر قابل پیش گوئی طور پر سست کرتے ہیں۔ Direct Connect شاہراہ پر ایک dedicated private lane rent کرنے کی طرح ہے — کوئی shared traffic نہیں، consistent speed، اور ایک زیادہ monthly toll۔ زیادہ تر دن عوامی سڑک ٹھیک ہے۔ جب آپ تنگ schedule پر قیمتی cargo کا ایک truck منتقل کر رہے ہوں، آپ private lane کے لیے ادائیگی کرتے ہیں۔

**AWS Site-to-Site VPN: Quick Option**

**AWS Site-to-Site VPN** آپ کے on-premises network اور آپ کے VPC کے درمیان ایک encrypted tunnel بناتا ہے، public internet کو عبور کرتے ہوئے۔

Setup:

1. اپنے VPC سے attached Virtual Private Gateway (VGW) بنائیں
2. اپنے on-premises router کی نمائندگی کرنے والا Customer Gateway بنائیں
3. ان کے درمیان دو VPN tunnels قائم کریں (redundancy کے لیے)

Traffic encrypted ہے (AES-256)۔ یہ public internet پر سفر کرتی ہے، جس کا مطلب ہے latency internet conditions پر depend کرتی ہے۔ AWS redundancy کے لیے خودبخود دو tunnels فراہم کرتا ہے — اگر ایک tunnel میں مسائل ہوں، traffic دوسرے کی طرف shift ہو جاتی ہے۔

**Site-to-Site VPN کب استعمال کریں**:

- Quick setup (منٹوں سے گھنٹوں)
- Cost-effective ($0.05/hour per VPN connection)
- Bandwidth: فی tunnel زیادہ سے زیادہ 1.25 Gbps
- اس use case کے لیے قابل قبول internet latency

Nimbus کی 4TB migration کے لیے، VPN پر 1.25 Gbps maximum سے: 4TB / 1.25 Gbps ≈ 7 گھنٹے minimum، real-world overhead کے ساتھ 12-20 گھنٹوں کے قریب۔ قابل قبول، لیکن public internet path پر congestion اسے غیر قابل پیش گوئی بناتی ہے۔

"دوسرا option کیا ہے؟" Tom نے پوچھا۔

**AWS Direct Connect: Dedicated Line**

**AWS Direct Connect** آپ کے location (یا آپ کے colocation facility) اور AWS کے درمیان ایک dedicated، private network connection قائم کرتا ہے۔ Traffic کبھی public internet کو نہیں چھوتی۔

Direct Connect ایک جسمانی connection ہے — آپ کے network سے AWS Direct Connect location تک ایک fiber line۔ آپ جسمانی circuit قائم کرنے کے لیے ایک telecom provider کے ساتھ کام کرتے ہیں۔ AWS اپنی طرف سے port فراہم کرتا ہے۔

**فوائد**:

- Consistent، قابل پیش گوئی latency (کوئی public internet variance نہیں)
- 50 Mbps سے 100 Gbps تک speeds
- Internet سے کم data transfer costs (Direct Connect data transfer rates standard AWS data transfer out rates سے سستی ہیں)
- زیادہ secure (private circuit، public internet نہیں)

**Trade-offs**:

- Setup ہفتوں سے مہینوں لیتا ہے (جسمانی infrastructure provisioning)
- VPN سے نمایاں طور پر زیادہ لاگت ($0.025-0.30/hour per port، plus telecom circuit costs — اکثر $500-1000+/month minimum)
- کوئی built-in redundancy نہیں (آپ redundant circuits خود قائم کرتے ہیں)
- متعدد circuits کے بغیر جغرافیائی طور پر distributed دفاتر کے لیے موزوں نہیں

Nimbus کے لیے: Direct Connect ان کے موجودہ size کے لیے overkill تھا۔ لیکن significant data transfer volumes یا private network connections کے لیے compliance requirements والے enterprises کے لیے، Direct Connect خود ادائیگی کرتا ہے۔

**Hosted Connections: درمیانہ راستہ**

ہر organization 100 Gbps dedicated fiber circuit کے لیے commit نہیں کر سکتی۔ **Direct Connect Hosted Connections** AWS Direct Connect Partners (approved telecoms) کو sub-1Gbps connections provision کرنے کی اجازت دیتے ہیں جو آپ دوسرے customers کے ساتھ share کرتے ہیں۔

Setup تیز (دنوں سے ہفتوں تک، مہینوں نہیں) اور dedicated connection سے کم لاگت ہے۔ Trade-off: shared capacity کا مطلب کم consistent throughput ہے۔

Nimbus (جیسے وہ بڑھتے ہیں) کے لیے: ایک partner کے ذریعے hosted 500 Mbps connection ایک معقول قیمت پر private connectivity فراہم کرے گا۔

**AWS Transit Gateway: VPCs کے لیے Hub-and-Spoke**

Nimbus بڑھتے ہوئے متعدد VPCs جمع کرے گا: production VPC، staging VPC، analytics VPC، security tooling VPC۔

محتاط منصوبہ بندی کے بغیر، ان VPCs کو جوڑنے کے لیے VPC peering connections کا ایک full mesh درکار ہے۔ 4 VPCs کے لیے: 6 peering connections۔ 10 VPCs کے لیے: 45 peering connections۔ 20 VPCs کے لیے: 190 connections۔ یہ scale نہیں ہوتا۔

**AWS Transit Gateway** ایک network hub ہے جو متعدد VPCs اور on-premises networks کو جوڑتا ہے۔ Peering connections کے mesh کی بجائے، ہر VPC Transit Gateway سے جڑتا ہے۔ Transit Gateway ان کے درمیان traffic route کرتا ہے۔

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Transitive routing**: اگر VPC A اور VPC B دونوں Transit Gateway سے جڑیں، وہ بات کر سکتے ہیں — بغیر direct peer کے۔ Transit Gateway routing سنبھالتا ہے۔ VPC peering کے برعکس (جو transitive نہیں ہے)، Transit Gateway hub-and-spoke topology قابل بناتا ہے۔

**Transit Gateway costs**: per attachment (VPC یا VPN/Direct Connect connection) plus per GB data processed۔ پیمانے پر، یہ simplicity کے لیے قابل ہے۔

**VPC Endpoints: AWS Services تک نجی رسائی**

ایک subtle cost اور security مسئلہ: جب آپ کی EC2 instance (private subnet میں) S3 API کو call کرتی ہے، وہ traffic NAT Gateway کے ذریعے route ہوتی ہے (public internet تک پہنچنے کے لیے، جہاں S3 کا public endpoint ہے)۔ آپ NAT Gateway processing کے لیے ادائیگی کرتے ہیں۔

**VPC Endpoints** آپ کے VPC میں resources کو public internet کے ذریعے جائے بغیر AWS services سے بات کرنے کی اجازت دیتے ہیں — اور NAT Gateway کے بغیر۔

دو اقسام:

**Gateway endpoints** (مفت): S3 اور DynamoDB کے لیے۔ آپ اپنی route table میں ایک route شامل کرتے ہیں جو S3 یا DynamoDB traffic کو NAT Gateway کی بجائے endpoint کی طرف direct کرے۔ بنانے کے لیے مفت؛ استعمال کے لیے مفت۔

**Interface endpoints** (قیمت): دوسری AWS services کے لیے (SQS، SNS، Secrets Manager، SSM، وغیرہ)۔ آپ کے subnet میں private IP کے ساتھ ایک ENI (Elastic Network Interface) بناتا ہے۔ Service کی traffic یہ private IP استعمال کرتی ہے۔ فی گھنٹہ per AZ plus data processing لاگت آتی ہے۔

Tom نے فوری طور پر S3 اور DynamoDB کے لیے Gateway endpoints بنائے جب انہیں پتہ چلا وہ مفت ہیں۔ NAT Gateway data processing fee 30% گر گئی۔

**AWS Global Accelerator: Edge پر Routing**

جب Nimbus West Coast صارفین کو us-east-1 (Virginia) سے serve کر رہا تھا، latency 80ms تھی۔ صرف physics کی وجہ سے نہیں — بلکہ Seattle اور Virginia کے درمیان public internet routing suboptimal تھی، متعدد carrier networks سے bounce ہو رہی تھی۔

**AWS Global Accelerator** AWS کے private backbone network (وہی infrastructure جو CloudFront کو powers کرتا ہے) استعمال کرتا ہے users اور AWS applications کے درمیان traffic route کرنے کے لیے۔ Public internet routing کی بجائے، traffic قریب ترین edge location پر AWS کے network میں داخل ہوتی ہے اور optimized private path کے ذریعے آپ کی ایپلیکیشن تک سفر کرتی ہے۔

Nimbus کے لیے، Seattle کا ایک صارف:

- **Global Accelerator کے بغیر**: public internet carriers کے ذریعے route ہوتا → ~80ms
- **Global Accelerator کے ساتھ**: Seattle میں قریب ترین AWS edge کو hit کرتا → AWS backbone کا سفر کرتا → us-east-1 تک پہنچتا → ~45ms

Global Accelerator content cache نہیں کرتا (یہ CloudFront ہے)۔ یہ dynamic requests کے لیے network path optimize کرتا ہے۔

**Global Accelerator بمقابلہ CloudFront کب استعمال کریں**:

- CloudFront: static اور cacheable content، CDN use case
- Global Accelerator: dynamic content، non-HTTP protocols (UDP، gaming، IoT)، یا جب آپ کو ایک static Anycast IP address کی ضرورت ہو

## خوبیاں اور حدود

**Site-to-Site VPN**:

- Quick setup، کم لاگت
- Public internet path کا مطلب variable latency
- محدود bandwidth ceiling

**Direct Connect**:

- Consistent، private، high-bandwidth
- Slow to set up، significant recurring cost
- جسمانی circuit ناکامی کا واحد نقطہ ہے (redundancy شامل کریں)

**Transit Gateway**:

- Multi-VPC connectivity کو dramatically simplify کرتا ہے
- Transitive routing (VPC peering کے برعکس)
- بہت سارے attachments کے لیے لاگت جمع ہوتی ہے

**VPC Endpoints**:

- S3/DynamoDB (مفت gateway endpoints) کے لیے security اور cost benefit
- AWS service traffic کے لیے NAT Gateway costs ختم کرتا ہے

**Global Accelerator**:

- عالمی صارفین کے لیے dynamic application latency بہتر کرتا ہے
- Fixed Anycast IPs (CloudFront کے dynamic IPs کے برعکس)
- اضافی لاگت ($0.025/hour per accelerator + data transfer)

## خلاصہ

- **Site-to-Site VPN**: On-premises اور VPC کے درمیان public internet پر encrypted tunnel۔ Quick setup، کم لاگت، variable latency۔
- **Direct Connect**: AWS سے private، dedicated fiber connection۔ Predictable latency، زیادہ bandwidth، set up میں ہفتے، significant لاگت۔
- **Transit Gateway**: VPC اور on-premises connectivity کے لیے Hub۔ Transitive routing قابل بناتا ہے۔ سینکڑوں connections تک scale کرتا ہے۔
- **VPC Endpoints**: NAT Gateway کے بغیر AWS services تک نجی رسائی۔ Gateway endpoints (S3، DynamoDB) مفت ہیں۔
- **Global Accelerator**: Dynamic traffic کو کم، زیادہ consistent latency عالمی سطح پر کے لیے AWS backbone کے ذریعے route کرتا ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں (ڈومین ۳، ٹاسک ۳.۴)*

- **VPN بمقابلہ Direct Connect اشارے**: VPN = "VPC پر traffic encrypt کریں،" "quick setup،" "cost-sensitive۔" Direct Connect = "consistent کم latency،" "large data transfers،" "private connection،" "private network کی ضرورت والی compliance۔"
- **Transit Gateway بمقابلہ VPC Peering**: Peering non-transitive ہے (A→B→C، A→C allow نہیں کرتا)۔ Transit Gateway transitive ہے۔ "بہت سارے VPCs جنہیں بات کرنی ہو" → Transit Gateway۔
- **VPC Gateway Endpoints**: مفت۔ صرف S3 اور DynamoDB۔ Route table change۔ کوئی extra لاگت نہیں۔ امتحانی منظر نامہ: "private subnet سے S3 access کے لیے data transfer costs کم کریں" → Gateway Endpoint۔
- **Global Accelerator بمقابلہ CloudFront**: Accelerator = dynamic content، non-HTTP، static IP، network optimization۔ CloudFront = caching، HTTP content، CDN۔
- **Direct Connect + VPN**: آپ ایک Direct Connect connection کے backup کے طور پر VPN استعمال کر سکتے ہیں۔ اگر Direct Connect circuit ناکام ہو، traffic VPN پر failover کر جاتی ہے۔ VPN اکیلے سے زیادہ مہنگا، Direct Connect اکیلے سے زیادہ reliable۔
- **Direct Connect Gateway**: ایک Direct Connect circuit کو ایک single region سے زیادہ میں متعدد VPCs سے جوڑیں۔ اس کے بغیر، ایک Direct Connect circuit ایک region میں ایک VGW سے جڑتا ہے۔

## مشقیں

**مشق ۱ — یادداشت**

AWS Site-to-Site VPN اور AWS Direct Connect کے درمیان فرق بیان کریں۔ کس منظر نامے میں آپ ہر ایک کو چنیں گے؟

*(اشارہ: setup time، لاگت، latency consistency، اور bandwidth ضروریات کے بارے میں سوچیں۔)*

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک financial services کمپنی کو اپنے on-premises data center سے AWS تک ایک private، encrypted، dedicated network connection کی ضرورت ہے۔ وہ روزانہ 500GB حساس financial data transfer کرتے ہیں۔ Connection میں consistent، قابل پیش گوئی latency ہونی چاہیے اور public internet کو عبور نہیں کرنی چاہیے۔ انہیں primary ناکام ہونے کی صورت میں ایک backup connection کی بھی ضرورت ہے۔

کون سا architecture ان ضروریات کو بہترین طریقے سے پوری کرتا ہے؟

A) BGP routing اور redundancy کے لیے دوسرا VPN کے ساتھ Site-to-Site VPN  
B) Backup کے طور پر Site-to-Site VPN کے ساتھ Direct Connect connection  
C) مختلف internet providers کے ذریعے دو Site-to-Site VPN connections  
D) Direct Connect Gateway کے ساتھ Direct Connect Hosted Connection

**اشارہ ۱**: "Public internet عبور نہیں کرنی چاہیے" — VPN traffic public internet پر جاتی ہے (encrypted)۔ صرف Direct Connect private ہے۔

**اشارہ ۲**: "Consistent، قابل پیش گوئی latency" — public internet VPN performance varies ہوتی ہے۔ Direct Connect consistent ہے۔

**اشارہ ۳**: "Backup connection" — جب Direct Connect primary ہو تو recommended approach کیا ہے؟

**جواب**: B

**وضاحت**: Direct Connect ایک private، dedicated connection فراہم کرتا ہے جو public internet کو عبور نہیں کرتی — privacy اور latency ضروریات پوری کرتا ہے۔ Backup کے طور پر ایک Site-to-Site VPN redundancy فراہم کرتا ہے: اگر Direct Connect circuit ناکام ہو، traffic encrypted VPN پر failover کر جاتی ہے۔ یہ Direct Connect کا standard HA pattern ہے۔

**A کیوں نہیں؟** Site-to-Site VPN traffic public internet عبور کرتی ہے، جو "public internet عبور نہیں کرنی چاہیے" ضرورت کی خلاف ورزی ہے۔

**C کیوں نہیں؟** مختلف ISPs کے ذریعے دو VPN connections پھر بھی public internet عبور کرتی ہیں، چاہے encrypted ہوں۔ Private network ضرورت پوری نہیں کرتا۔

**D کیوں نہیں؟** ایک Hosted Connection Direct Connect connection فراہم کرتا ہے لیکن آپشن D کوئی backup شامل نہیں کرتا۔ Backup کے بغیر Single Direct Connect ناکامی کا واحد نقطہ ہے — جسمانی fiber کاٹی جا سکتی ہے۔

*SAA-C03 ڈومین: اعلیٰ کارکردگی آرکیٹیکچرز ڈیزائن کریں — ٹاسک ۳.۴*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus Seattle، Berlin، اور Singapore میں regional engineering teams رکھنے کے لیے expand ہو رہا ہے۔ ہر regional team کو رسائی کی ضرورت ہے:

- Production VPC (debugging کے لیے read-only)
- Staging VPC (testing کے لیے full access)
- Analytics VPC (reporting کے لیے read-only)

Network connectivity ڈیزائن کریں۔ کیا آپ Transit Gateway استعمال کریں گے؟ ہر region میں Direct Connect یا Site-to-Site VPN؟ Production کے لیے read-only access کو کیسے enforce کریں گے؟ (اشارہ: یہ network اور IAM دونوں سوال ہے۔)

*(کوئی ایک درست جواب نہیں ہے۔ مقصد multi-region، multi-team network ڈیزائن کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Data migration 14 گھنٹوں میں complete ہوئی۔

سست public internet path کے ذریعے نہیں — Leo نے bulk data کے لیے AWS Snow Family (جسمانی storage appliances AWS کو اور سے ship کیے گئے) استعمال کیا تھا، پھر VPN کے ذریعے باقی delta sync کیا۔

"اگلی بار،" اس نے کہا، "ہمیں Direct Connect سیٹ اپ کرنی چاہیے۔"

Tom نے pricing تلاش کی۔

"ایک dedicated 1Gbps port $216/month ہے،" اس نے کہا۔ "Plus ہمارے دفتر سے circuit، جو telecom نے $800/month quote کیا۔"

"تو کل تقریباً ہزار مہینہ۔"

"ہم ابھی جو کرتے ہیں اس کے لیے، شاید اس کی قیمت نہیں۔ لیکن اگر ہم اپنے دفتر اور AWS کے درمیان ماہانہ 10TB سے زیادہ منتقل کرنا شروع کریں، Direct Connect پر data transfer savings لاگت offset کریں گے۔"

"تو ہم data transfer volume monitor کریں گے،" Priya نے کہا، "اور جب یہ threshold عبور کرے revisit کریں گے۔"

"یہ cost-aware architecture ہے،" Tom نے کہا۔

"یہ ہمیشہ سے مقصد رہا ہے،" Maya نے کہا۔

اگلے باب میں: جب آپ کے پاس کسی بھی database سے زیادہ data ہو، اور آپ کو اس سب کا مطلب نکالنا ہو۔
