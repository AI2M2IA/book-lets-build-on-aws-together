# باب 4: کسی اور کی عمارت میں ایک computer

Nimbus app Tom کے laptop پر چل رہی تھی۔

Investors کو demo دکھانے کے لیے یہ ٹھیک تھا۔ یہ ٹھیک نہیں تھا جب Maya نے "launch" دبایا اور پہلے ہفتے میں 200 restaurants sign up ہو گئے۔ Tom کا laptop اب real orders، real menus، اور real customers handle کر رہا تھا — Tom کی desk کے نیچے رکھا ہوا، office Wi-Fi پر چلتا ہوا، ایک ایسی power strip میں plug تھا جو ایک space heater اور coffee maker کو بھی power دے رہی تھی۔

"ہمیں server چاہیے،" Maya نے کہا۔ "ایک real server۔ ایسی جگہ چلتا ہوا جو تمہاری desk کے نیچے نہ ہو۔"

Tom نے اپنے laptop کو دیکھا۔ Fan کی آواز کمرے کے دوسری طرف سے سنائی دے رہی تھی۔

تب انہوں نے دیکھنا شروع کیا کہ computer rent کرنے کا اصل مطلب کیا ہے۔

**وہ abstraction جسے کوئی explain نہیں کرتا**

جب لوگ کہتے ہیں کہ ان کی application "cloud پر چلتی ہے"، تو عام طور پر ان کا مطلب ہوتا ہے کہ وہ ایک virtual machine پر چلتی ہے — ایک ایسا computer جو dedicated hardware کے طور پر physically موجود نہیں ہوتا، مگر ہر طرح سے ایسے behave کرتا ہے جیسے موجود ہو۔

Mechanism یہ ہے۔

AWS data center میں ایک physical server کے پاس بہت سے resources ہوتے ہیں: CPU cores، memory، disk، اور network bandwidth۔ AWS اس physical server کو **hypervisor** نامی software کے ذریعے تقسیم کرتا ہے۔ Hypervisor کئی virtual machines بناتا ہے، جن میں سے ہر ایک ایسا لگتا ہے جیسے اس کے پاس اپنی dedicated CPU، memory، اور disk ہے — لیکن حقیقت میں وہ underlying physical hardware share کر رہی ہوتی ہیں۔

ان virtual machines میں سے ہر ایک کو AWS **EC2 instance** کہتا ہے۔

EC2 کا مطلب Elastic Compute Cloud ہے۔ "Elastic" والا حصہ اہم ہے، اور ہم اس تک پہنچیں گے۔ ابھی کے لیے: EC2 instance ایک computer ہے جسے آپ hourly rent کرتے ہیں۔ اس کے پاس operating system، network connection، اور computing power ہوتی ہے۔ یہ آپ کی application ویسے ہی چلاتا ہے جیسے physical server چلاتا۔

Analogy: ایک بڑی building میں apartment rent کرنا، house خریدنے کے بجائے۔

Building owner (AWS) physical structure، plumbing، electrical، security maintain کرتا ہے۔ آپ کو ایک unit ملتا ہے۔ آپ اسے جیسے چاہیں furnish کرتے ہیں۔ آپ monthly (یا hourly) pay کرتے ہیں۔ جب آپ کو زیادہ space چاہیے، آپ بڑے unit میں move کرتے ہیں۔ جب آپ move out کرتے ہیں، آپ pay کرنا بند کر دیتے ہیں۔

**اپنی instance چننا: size matter کرتا ہے**

تمام EC2 instances ایک جیسی نہیں ہوتیں۔ AWS hundreds of instance types offer کرتا ہے، جنہیں اس بنیاد پر families میں organize کیا گیا ہے کہ وہ کس چیز کے لیے optimized ہیں۔

**General purpose** (مثلاً `t3`, `m6i`): CPU اور memory balanced۔ زیادہ تر web applications کے لیے اچھی default choice۔

**Compute optimized** (مثلاً `c7g`): Memory کے مقابلے میں زیادہ CPU۔ Video encoding، scientific modeling، batch processing کے لیے اچھا۔

**Memory optimized** (مثلاً `r7i`): CPU کے مقابلے میں زیادہ memory۔ Databases، caching، in-memory analytics کے لیے اچھا۔

**Storage optimized** (مثلاً `i3`): High-speed local storage۔ Data-intensive workloads کے لیے اچھا جنہیں بہت fast disk I/O چاہیے۔

**Accelerated computing** (مثلاً `p4`): GPUs attached۔ Machine learning training اور graphics rendering کے لیے اچھا۔

ہر family میں sizes ہوتی ہیں۔ `t3.micro` میں 2 virtual CPUs اور 1 GB memory ہوتی ہے۔ `t3.xlarge` میں 4 virtual CPUs اور 16 GB۔ آپ workload کے لیے صحیح size چنتے ہیں۔

Leo نے `t3.micro` چنی تھی۔

"`t3.micro` کتنے users handle کر سکتی ہے؟" Tom نے پوچھا۔

"Application پر depend کرتا ہے،" Leo نے کہا۔ "لیکن شاید hundred concurrent users نہیں جو image uploads اور database queries کر رہے ہوں۔"

Tom نے whiteboard پر "t3.micro" لکھا اور اس کے ساتھ sad face بنا دیا۔

**AMI: آپ کی machine کی starting state**

EC2 instance launch کرنے سے پہلے، آپ اس کا operating system اور initial configuration چنتے ہیں۔ AWS میں اسے **Amazon Machine Image** (AMI) کہتے ہیں۔

AMI ایک template ہے۔ یہ define کرتا ہے:

- Operating system (Amazon Linux، Ubuntu، Windows Server، وغیرہ)
- Pre-installed software
- Initial disk state

جب آپ AMI سے instance launch کرتے ہیں، AWS اس template کی ایک fresh copy صرف آپ کے لیے بناتا ہے۔ آپ اپنی AMIs بھی create کر سکتے ہیں — اگر آپ ایک server کو بالکل اپنی مرضی کے مطابق configure کرتے ہیں، تو آپ اس state کو custom AMI کے طور پر "save" کر سکتے ہیں اور identical servers جلدی launch کرنے کے لیے استعمال کر سکتے ہیں۔ Scale پر consistent environments deploy کرنے کا یہی طریقہ ہے۔

AMI کو recipe کی طرح سوچیں۔ Recipe meal کو describe کرتی ہے۔ ہر بار جب آپ recipe follow کرتے ہیں، آپ کو وہی meal ملتا ہے۔ اگر آپ meal کو permanently بدلنا چاہتے ہیں، تو recipe update کرتے ہیں۔

**Key Pairs: server access کرنے کا صحیح طریقہ**

پچھلے chapter کی "Admin123" disaster یاد ہے؟

EC2 instance میں log in کرنے کا صحیح طریقہ **key pair** ہے۔

Key pair ایک cryptographic pair ہے: public key (جو AWS server پر store کرتا ہے) اور private key (ایک file جسے آپ download کرتے ہیں اور secret رکھتے ہیں)۔ Log in کرنے کے لیے، آپ SSH — ایک secure protocol — کے ساتھ اپنی private key استعمال کرتے ہیں۔ Password نہیں ہوتا۔ اگر آپ private key کھو دیں، آپ access کھو دیتے ہیں۔ SSH کے لیے "forgot my password" نہیں ہوتا۔

یہ اس لیے اہم ہے کیونکہ key pairs:

- آپ کے لیے unique ہوتے ہیں
- Cryptographically guess کرنا ناممکن ہوتے ہیں
- AWS کے پاس store نہیں ہوتے (private key آپ رکھتے ہیں)
- Revoking آسان ہوتا ہے (server سے key delete کریں، نئی pair generate کریں)

Priya نے Nimbus server پر پہلے ہی key-based access set up کر دیا تھا۔ Admin123 server decommission ہو گیا۔ کسی کو افسوس نہیں ہوا۔

**Instance lifecycle: forever نہیں**

یہ چیز بہت سے beginners miss کرتے ہیں۔

EC2 instances default طور پر permanent نہیں ہوتیں۔ جب آپ instance stop کرتے ہیں، compute resource release ہو جاتا ہے۔ جب آپ اسے دوبارہ start کرتے ہیں، وہ different physical hardware پر run ہو سکتی ہے۔ Instance itself پر stored data (اس کے root volume پر) stop/start cycle survive کرتا ہے — لیکن public IP address بدل جاتا ہے۔

جب آپ instance کو *terminate* کرتے ہیں، وہ ختم ہو جاتی ہے۔ جب تک separate storage attached نہ ہو (جسے ہم Chapter 6 میں cover کرتے ہیں)، instance پر موجود data غائب ہو جاتا ہے۔

یہ "ephemerality" دراصل feature ہے، bug نہیں۔ اس کا مطلب ہے آپ servers spin up کر سکتے ہیں، use کر سکتے ہیں، اور throw away کر سکتے ہیں۔ یہ horizontal scaling enable کرتا ہے۔ لیکن اس کا مطلب یہ بھی ہے کہ important data کبھی EC2 instance itself *پر* store نہیں کرنا چاہیے۔

پھر data کہاں رہتا ہے؟

Separate storage میں۔ ہم اگلے دو chapters میں وہاں پہنچتے ہیں۔

**"Elastic" کا مطلب کیا ہے**

ہم نے کہا EC2 کا مطلب Elastic Compute Cloud ہے۔ اس میں elastic کیا ہے؟

دو چیزیں:

**Vertical elasticity**: آپ instance کا size بدل سکتے ہیں۔ Instance stop کریں، اسے `t3.micro` سے `t3.xlarge` میں change کریں، restart کریں۔ زیادہ CPU اور memory، وہی application، وہی setup۔

**Horizontal elasticity**: آپ مزید instances add کر سکتے ہیں۔ ایک large server کے بجائے، load balancer کے پیچھے دس medium servers چلائیں۔ جب traffic کم ہو، instances remove کریں اور ان کے لیے pay کرنا بند کریں۔

دونوں approaches "ایک server، بہت زیادہ traffic" کا مسئلہ solve کرتی ہیں۔ ان کے trade-offs مختلف ہیں، جنہیں ہم Chapter 7 میں explore کریں گے جب story میں Auto Scaling add کریں گے۔

Key insight: EC2 کے ساتھ، computing power ایسی چیز ہے جسے آپ *dial* کرتے ہیں، ایسی چیز نہیں جسے آپ *buy* کرتے ہیں۔ زیادہ چاہیے؟ Dial اوپر کریں۔ کم چاہیے؟ نیچے کریں۔ اسی حساب سے pay کریں۔

## Strengths and Limitations

**EC2 powerful کیوں ہے**:

- Full control۔ آپ OS، software، configuration چنتے ہیں۔ یہ آپ کا computer ہے۔
- Flexible sizing۔ ہر use case کے لیے hundreds of instance types۔
- Hardware manage نہیں کرنا۔ AWS physical layer handle کرتا ہے۔
- Pay-per-second billing (زیادہ تر instance types کے لیے)۔ آپ instance stop کرتے ہیں، آپ pay کرنا بند کرتے ہیں۔
- ہر چیز کے ساتھ کام کرتا ہے۔ EC2 وہ foundation ہے جس پر زیادہ تر AWS services build ہوتی ہیں۔

**یہاں یہ complicated ہو جاتا ہے**:

- Operating system patch اور update کرنا آپ کی responsibility ہے۔ (Shared Responsibility Model — یہ "in the cloud" والا حصہ ہے جو آپ کا ہے۔)
- Scale پر EC2 manage کرنے کا مطلب instance state، AMIs، security patches، اور lifecycle manage کرنا ہے، ممکنہ طور پر ہزاروں machines پر۔ یہ operational overhead ہے۔
- EC2 ہر چیز کا صحیح answer نہیں ہے۔ Event-driven code کے لیے جو infrequently run ہوتا ہے، Lambda (Chapter 20) cheaper اور simpler ہے۔ Containerized workloads کے لیے، ECS اور EKS (Chapter 21) بہتر resource efficiency دیتے ہیں۔
- Unused instances پھر بھی money cost کرتی ہیں۔ اگر آپ instance stop کرتے ہیں، compute کے لیے pay کرنا بند کرتے ہیں — لیکن اگر storage attached ہے، اس کے لیے پھر بھی pay کرتے ہیں۔

## Summary

- **EC2 instance** ایک virtual machine ہے جسے آپ AWS میں rent کرتے ہیں۔ اس کے پاس OS، network access، اور compute resources ہوتے ہیں۔
- Instance types use case کے حساب سے organize ہوتے ہیں: general purpose، compute optimized، memory optimized، storage optimized، accelerated computing۔ اپنے workload کے لیے صحیح family اور size چنیں۔
- **AMI** (Amazon Machine Image) آپ کی instance کے OS اور initial configuration کا template ہے۔ Custom AMIs consistent، repeatable deployments enable کرتی ہیں۔
- **Key pairs** EC2 instances access کرنے کا secure طریقہ ہیں۔ Passwords نہیں۔
- EC2 instances default طور پر permanent نہیں ہوتیں۔ Terminated instances اپنا data کھو دیتی ہیں۔ Important data separate storage services میں store کریں۔
- "Elastic" کا مطلب ہے آپ compute کو up اور down scale کر سکتے ہیں — vertically (bigger instances) اور horizontally (more instances) دونوں طریقوں سے۔

## Exam Tips

*SAA-C03 Domain 3 — Task 3.2 (high-performing compute solutions)*

- **EC2 کے لیے Shared Responsibility**: OS patching آپ کی responsibility ہے۔ AWS physical hardware اور hypervisor maintain کرتا ہے۔ یہ distinction exam میں بار بار test ہوتی ہے۔
- **Scenario questions میں instance families matter کرتی ہیں۔** اگر scenario high memory requirements mention کرتا ہے (in-memory cache، SAP HANA)، answer غالباً memory-optimized instance ہوگا۔ اگر batch processing یا HPC mention ہو، compute-optimized۔
- **Stopping ≠ Terminating۔** Instance stop کرنے سے وہ preserve رہتی ہے (آپ restart کر سکتے ہیں)۔ Terminate کرنے سے delete ہو جاتی ہے۔ Exam scenarios test کرتے ہیں کہ آپ یہ distinction جانتے ہیں یا نہیں۔
- **Restart پر public IP بدل جاتا ہے۔** اگر application کو stable IP address چاہیے، **Elastic IP** استعمال کریں — static public IP جو آپ کے account سے associated رہتا ہے۔ اگر آپ ایک allocate کریں اور use نہ کریں تو یہ money cost کرتا ہے۔
- **On-Demand، Reserved، اور Spot** pricing models Domain 4 میں heavily test ہوتے ہیں۔ ہم انہیں Chapter 27 میں cover کرتے ہیں۔ ابھی کے لیے، جانیں کہ On-Demand کا مطلب no commitment کے ساتھ per-second pay کرنا ہے۔

## Exercises

**Exercise 1 — Recall**

اپنے الفاظ میں: EC2 instance کیا ہے؟ AMI کیا ہے؟ ان کے درمیان relationship کیا ہے؟

*(Hint: recipe analogy کے بارے میں سوچیں — recipe کیا ہے، اور meal کیا ہے؟)*

**Exercise 2 — Exam Practice**

*Scenario*: ایک company high-traffic web application deploy کر رہی ہے۔ Application product catalog searches handle کرتی ہے جن میں complex filtering logic ہے جو CPU-intensive ہے۔ Team sale events کے دوران significant traffic spikes expect کرتی ہے۔ وہ ensure کرنا چاہتے ہیں کہ وہ صحیح EC2 instance type چنیں اور traffic surges کے لیے تیار رہیں۔

کون سی choices کی combination ان requirements کو BEST meet کرتی ہے؟

A) Consistent performance ensure کرنے کے لیے fixed number کے ساتھ memory-optimized instances  
B) Traffic spikes handle کرنے کے لیے Auto Scaling کے ساتھ compute-optimized instances  
C) ایک single large instance size کے ساتھ general-purpose instances  
D) Storage-optimized instances کیونکہ product catalog کو fast disk access چاہیے

**Hint 1**: Workload کو "CPU-intensive" describe کیا گیا ہے۔ کون سی instance family CPU کے لیے optimized ہے؟

**Hint 2**: Scenario "sale events کے دوران traffic spikes" mention کرتا ہے۔ Fixed number of instances variable traffic efficiently handle نہیں کرے گا۔ کون سا AWS feature یہ handle کرتا ہے؟

**Hint 3**: Compute-optimized instances CPU-heavy work handle کرتی ہیں۔ Auto Scaling demand کے حساب سے instances add اور remove کرتا ہے۔ Together یہ دونوں requirements کا answer دیتے ہیں۔

**Answer**: B

**Explanation**: Compute-optimized instances (جیسے `c` family) CPU-intensive workloads کے لیے per dollar زیادہ CPU provide کرتی ہیں۔ Auto Scaling load کے حساب سے instances کی تعداد automatically adjust کرتا ہے — sale events کے دوران instances add کرتا ہے، traffic normal ہونے پر remove کرتا ہے۔ یہ combination performance اور cost دونوں optimize کرتی ہے۔

**Why not A?** Memory-optimized instances ان workloads کے لیے design ہوتی ہیں جنہیں large amounts of RAM چاہیے (databases، in-memory caches)۔ یہ CPU-bound workload ہے۔ اور fixed instance counts کا مطلب یا over-provisioning (waste) یا under-provisioning (failure) ہے۔

**Why not C?** General-purpose instances balance کے لیے کچھ CPU efficiency trade کرتی ہیں۔ Known CPU-intensive workload کے لیے compute-optimized زیادہ appropriate ہے۔ اور single large instance single point of failure ہے۔

**Why not D?** Bottleneck CPU ہے، disk I/O نہیں۔ Storage-optimized instances ان workloads کے لیے design ہوتی ہیں جنہیں local storage تک بہت high throughput چاہیے۔

*SAA-C03 Domain 3 — Task 3.2*

**Exercise 3 — Architecture Challenge** *(Optional)*

Nimbus فی الحال پوری application کے لیے ایک single `t3.micro` EC2 instance چلا رہا ہے۔ Team کو decide کرنا ہے: larger instance (`t3.2xlarge`) پر upgrade کریں یا load balancer کے پیچھے مزید `t3.micro` instances add کریں؟

Trade-offs walk through کریں۔ ہر approach کے advantages کیا ہیں؟ Decide کرنے کے لیے آپ کون سے questions پوچھیں گے؟ (Hint: single points of failure، cost، deployment complexity، اور maintenance کے دوران کیا ہوتا ہے، ان کے بارے میں سوچیں۔)

*(کوئی ایک correct answer نہیں ہے۔ یہ vertical vs. horizontal scaling کے بارے میں reasoning ہے۔)*

## Post-Credits Scene

Leo نے دوپہر server resize کرنے میں گزاری۔ وہ `t3.micro` سے `t3.large` پر گیا۔ CPU 30% تک گر گیا۔ Pages ایک second سے کم میں load ہونے لگے۔

Tom نے AWS bill کو real time میں update ہوتے دیکھا۔ نئی instance per hour چار گنا زیادہ cost کر رہی تھی۔ اس نے note بنا لیا۔

Maya اپنی screen پر کچھ اور دیکھ رہی تھی۔

"Leo،" اس نے کہا۔ "جب تم instance resize کر رہے تھے، website بارہ minutes کے لیے down تھی۔"

Leo نے نظر اٹھائی۔

"ہمارے پاس two hundred unfulfilled orders کی queue تھی۔"

اس نے screen کو دیکھا۔ پھر ceiling کو۔ پھر دوبارہ screen کو۔

"ہمیں اپنی images کے لیے کچھ چاہیے،" اس نے topic تھوڑا سا بدلتے ہوئے کہا۔ "ابھی uploaded menu photos directly server پر save ہوتی ہیں۔ اگر ہم instance resize یا restart کریں، کیا ہم انہیں کھو دیتے ہیں؟"

Priya کو جواب پہلے ہی معلوم تھا۔

اگلے chapter میں: files کہاں رہتی ہیں جب point کرنے کے لیے hard drive نہ ہو۔
