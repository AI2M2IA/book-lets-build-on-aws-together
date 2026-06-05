# باب ۳۱: Cloud Architecture کا Building Inspector

ایک لمحے کے لیے کھڑے ہوں۔ اگر ضرورت ہو تو ایک حقیقی break لیں۔

یہ باب پہلے والوں سے مختلف ہے۔ ہم نے 30 ابواب مخصوص services اور patterns کی معلومات بناتے ہوئے گزارے ہیں۔ اب ہم پیچھے قدم لے کر پوری تصویر دیکھتے ہیں۔

*اچھا* cloud architecture اصل میں کیسا نظر آتا ہے؟ کیا اس کا کوئی systematic طریقہ ہے یہ evaluate کرنے کا کہ آپ نے جو بنایا ہے وہ واقعی اچھی طرح ڈیزائن کیا گیا ہے — یا صرف functional ہے؟

ہے۔ AWS اسے Well-Architected Framework کہتا ہے۔

Nimbus دو سال سے چل رہا تھا۔ ٹیم نے سینکڑوں architectural فیصلے کیے تھے — کچھ شعوری طور پر، کچھ حادثاتی طور پر، کچھ دباؤ میں۔ نظام کام کرتا تھا۔ لیکن Maya کا ایک سوال تھا۔

"کیا ہمارا architecture اصل میں *اچھا* ہے؟" اس نے پوچھا۔ "صرف functional نہیں۔ اچھا۔"

کسی نے فوری جواب نہیں دیا۔

"کیونکہ میں Well-Architected Review کے بارے میں سن رہی ہوں،" اس نے جاری رکھا۔ "AWS اسے customers کو پیش کرتا ہے۔ ہمارے بعض investors نے ذکر کیا۔ میرا خیال ہے کہ ہمیں ایک کرنا چاہیے۔"

"یہ کیا ہے؟" Leo نے پوچھا۔

"Cloud architectures evaluate کرنے کے لیے AWS کا framework،" Priya نے کہا۔ "چھ pillars۔ ہر ایک کے لیے سوالات اور best practices کا ایک set۔ آپ اپنے architecture کو ان سب کے خلاف assess کرتے ہیں اور identify کرتے ہیں کہ کیا missing ہے۔"

"یہ building inspection کی طرح ہے،" Tom نے کہا۔ "آپ جانتے ہیں building کام کرتی ہے۔ Inspection بتاتی ہے کہ آیا یہ code-compliant ہے اور زلزلے میں کیا ناکام ہو سکتا ہے۔"

**چھ Pillars**

AWS Well-Architected Framework چھ pillars کے گرد organized ہے۔ ہر pillar design principles، best practices، اور آپ کے architecture کو assess کرنے کے لیے سوالات رکھتا ہے۔

**1. Operational Excellence**

*Focus*: Business value deliver کرنے کے لیے systems چلانا اور monitor کرنا، اور processes اور procedures مسلسل بہتر کرنا۔

اہم areas: changes کیسے deploy کریں؟ نظام کو monitor کیسے کریں؟ failures سے کیسے سیکھیں؟ پیمانے پر changes کیسے handle کریں؟

Nimbus assessment:

- Present: Automated deployments کے ساتھ CI/CD pipeline
- Present: CloudWatch alarms اور GuardDuty
- Present: Quarterly chaos engineering tests
- Warning: Post-mortem process formalized نہیں

**2. Security**

*Focus*: Risk assessment اور mitigation strategies کے ذریعے معلومات، systems، اور assets کی حفاظت۔

اہم areas: کون کیا access کر سکتا ہے، کم سے کم privilege کے ساتھ؟ Data at rest اور in transit کیسے خفیہ ہے؟ Threats کا پتہ کیسے لگاتے اور ان کا جواب کیسے دیتے ہیں؟

Nimbus assessment:

- Present: IAM with least privilege
- Present: Data encryption کے لیے KMS، credentials کے لیے Secrets Manager
- Present: GuardDuty، WAF، Shield Standard
- Present: Private subnets، security groups کے ساتھ VPC
- Warning: EC2 instances پر security patching fully automated نہیں

**3. Reliability**

*Focus*: یہ یقینی بنانا کہ نظام اپنا intended function صحیح طور پر اور consistently انجام دے، اور failures سے recover کرنے کے قابل ہو۔

Nimbus assessment:

- Present: تمام critical components کے لیے Multi-AZ
- Present: Automatic failover کے ساتھ Aurora Serverless
- Present: EC2 اور ECS کے لیے Auto Scaling
- Present: Chaos engineering tests
- Warning: کوئی multi-region deployment نہیں

**4. Performance Efficiency**

*Focus*: IT اور computing resources کو efficiently استعمال کرنا۔

Nimbus assessment:

- Present: عالمی content delivery کے لیے CloudFront
- Present: Database read acceleration کے لیے ElastiCache
- Present: Aurora read replicas
- Warning: کچھ EC2 instances کبھی right-sized نہیں ہوئے

**5. Cost Optimization**

*Focus*: غیر ضروری costs سے بچنا۔

Nimbus assessment:

- Present: Savings Plans نافذ
- Present: S3 lifecycle policies
- Present: DynamoDB Auto Scaling
- Present: Alerts کے ساتھ AWS Budgets
- Present: Quarterly cost reviews

**6. Sustainability**

*Focus*: Cloud workloads چلانے کے environmental impacts کو minimize کرنا۔

Nimbus assessment:

- Present: Serverless/containerized workloads کے لیے Lambda اور Fargate
- Present: S3 lifecycle policies
- Warning: کچھ graviton-based instances ابھی تک adopt نہیں ہوئے

**Well-Architected Review Process**

Review ایک test نہیں ہے جسے آپ pass یا fail کریں۔ یہ آپ کے architecture کے بارے میں ایک structured گفتگو ہے، چھ pillars میں 60+ سوالوں کے ذریعے guide کی گئی۔

ہر سوال ایک best practice identify کرتا ہے۔ Output: improvement recommendations کی ایک prioritized list۔

AWS کا Well-Architected Tool (AWS console میں، مفت) سوال framework فراہم کرتا ہے اور recommendations کے ساتھ ایک report generate کرتا ہے۔

Nimbus کے لیے، Maya نے ایک half-day workshop schedule کی۔ آخر تک، ان کے پاس 12 "issues" تھے — تین high risk، پانچ medium risk، چار low risk۔

**High-risk issues**:

1. کوئی multi-region DR plan نہیں (reliability)
2. EC2 security patching automated نہیں (security)
3. کوئی formal incident response process نہیں (operational excellence)

**Lenses: Review کو Specialize کرنا**

Core Well-Architected Framework technology-agnostic ہے۔ AWS مخصوص use cases کے لیے **Lenses** بھی publish کرتا ہے:

- **Serverless Lens**: Lambda-heavy architectures
- **SaaS Lens**: Multi-tenant SaaS applications
- **Machine Learning Lens**: ML training اور inference
- **Financial Services Lens**: FinTech regulatory considerations
- **Healthcare Lens**: HIPAA

Nimbus کے لیے SaaS Lens relevant تھا۔

**Well-Designed اور Just Working کے درمیان فرق**

"ہمارا نظام کام کرتا ہے،" Leo نے review کے بعد کہا۔ "لیکن مجھے احساس نہیں تھا کہ کتنی چیزیں ہم نے 'کافی اچھا' کر کے آگے بڑھ گئے۔"

"یہ normal ہے،" Priya نے کہا۔ "Well-Architected review انہیں revisit کرنے کا scheduled وقت ہے۔"

"کیونکہ 'یہ کام کرتا ہے' اور 'یہ well-architected ہے' day-to-day ایک ہی محسوس ہوتے ہیں،" Maya نے کہا۔ "فرق صرف اس وقت visible ہوتا ہے جب کچھ غلط ہو جائے۔"

یہ ایک senior engineer جو سمجھتا ہے اس کی سب سے اہم چیزوں میں سے ایک ہے: incidents کی غیر موجودگی کا مطلب risk کی غیر موجودگی نہیں۔

**Infrastructure as Code: Operational Excellence Enabler**

**AWS CloudFormation** YAML/JSON templates میں infrastructure define کرنے دیتا ہے۔ **AWS CDK** programming languages استعمال کرتے ہوئے infrastructure define کرنے دیتا ہے۔ **Terraform** ایک popular third-party alternative ہے۔

Nimbus Terraform استعمال کرتے ہوئے IaC کی طرف move ہو رہا تھا۔ Well-Architected review نے 100% تک پہنچنے کی سفارش کی۔

## خوبیاں اور حدود

**Well-Architected Framework کیا اچھا کرتا ہے**: Teams کو architectural trade-offs پر گفتگو کے لیے shared vocabulary دیتا ہے۔ Review risks کا واضح اقرار پیدا کرتا ہے جو دوسری صورت میں نادیدہ ہوتے ہیں۔

**یہ کیا نہیں کر سکتا**: Framework descriptive ہے، prescriptive نہیں۔ Well-Architected Review میں ہر box چیک کرنا ایک اچھے architecture کی ضمانت نہیں دیتا۔ Framework ایک lens ہے، blueprint نہیں۔

## خلاصہ

- **AWS Well-Architected Framework** کے چھ pillars ہیں: Operational Excellence، Security، Reliability، Performance Efficiency، Cost Optimization، اور Sustainability۔
- **Well-Architected Tool** (AWS console میں مفت) review guide کرتا ہے اور ایک report generate کرتا ہے۔
- Output risk کے مطابق categorized architectural improvements کی ایک prioritized list ہے۔
- **Lenses** framework کو مخصوص domains کے لیے specialize کرتے ہیں۔
- **Infrastructure as Code** ایک cross-pillar enabler ہے۔
- Well-Architected review ایک pass/fail test نہیں ہے۔ یہ ایک structured improvement گفتگو ہے۔

## امتحانی نکات

*SAA-C03 ڈومین: Cross-domain — تمام domains*

- **تمام چھ pillars اور ان کا primary focus جانیں**۔
- **Pillar mapping**:
  - "Deploy changes reliably، learn from failures، monitor" → Operational Excellence
  - "IAM، encryption، network controls، threat detection" → Security
  - "HA، failover، scaling، DR" → Reliability
  - "Right-sizing، CDN، right technology selection" → Performance Efficiency
  - "Pricing models، unused resources، cost visibility" → Cost Optimization
  - "Energy efficiency، resource utilization، data lifecycle" → Sustainability
- **Infrastructure as Code**: CloudFormation، CDK، اور SAM AWS-native IaC tools ہیں۔
- **Well-Architected Tool**: مفت۔ Improvement plans generate کرتا ہے۔
- **AWS Trusted Advisor**: Well-Architected framework کی طرح لیکن automated۔

## مشقیں

**مشق ۱ — یادداشت**

AWS Well-Architected Framework کے چھ pillars کے نام لیں اور ہر ایک کی primary concern ایک جملے میں describe کریں۔

**مشق ۲ — امتحانی مشق**

*منظر نامہ*: ایک engineering team Well-Architected review کی تیاری کر رہی ہے۔ انہوں نے دریافت کیا:

- Deployment process EC2 instances کو مختلف library versions کے ساتھ چھوڑتا ہے
- RDS failover trigger ہونے پر کوئی automated alerting نہیں
- تمام IAM users کے پاس AdministratorAccess ہے
- 14 ماہ میں backup restoration process test نہیں کیا

ہر issue کو MOST relevant Well-Architected pillar سے map کریں۔

A) Configuration drift: Operational Excellence؛ کوئی RDS failover alerting نہیں: Reliability؛ AdministratorAccess: Security؛ کوئی backup restoration test نہیں: Reliability

B) Configuration drift: Security؛ کوئی RDS failover alerting نہیں: Performance Efficiency؛ AdministratorAccess: Operational Excellence؛ کوئی backup restoration test نہیں: Cost Optimization

C) Configuration drift: Reliability؛ کوئی RDS failover alerting نہیں: Performance Efficiency؛ AdministratorAccess: Security؛ کوئی backup restoration test نہیں: Operational Excellence

D) Configuration drift: Security؛ کوئی RDS failover alerting نہیں: Reliability؛ AdministratorAccess: Cost Optimization؛ کوئی backup restoration test نہیں: Security

**جواب**: A

**وضاحت**: Configuration drift ایک Operational Excellence مسئلہ ہے۔ RDS failover alerting نہ ہونا ایک Reliability مسئلہ ہے۔ AdministratorAccess ایک Security مسئلہ ہے۔ Untested backup restoration ایک Reliability مسئلہ ہے۔

*SAA-C03 ڈومین: Cross-domain*

## پوسٹ کریڈٹس منظر

Well-Architected review کے تین ہفتے بعد، ٹیم نے تین high-risk fixes نافذ کر لیے۔

EC2 patching AWS Systems Manager Patch Manager کے ذریعے automated ہوئی۔ ایک incident response process document لکھی اور shared گئی۔ Multi-region warm standby plan مسودے میں تھی۔

Priya نے Well-Architected Tool report review کی۔ High-risk count: 0۔ Medium-risk: 3۔ Low-risk: 4۔

"ہم پہلے سے بہتر shape میں ہیں،" اس نے کہا۔

"یہ progress ہے،" اس نے کہا۔ "آپ Well-Architected review finish نہیں کرتے۔ آپ progress کرتے ہیں، پھر چھ ماہ میں دوبارہ review کرتے ہیں۔"

Maya نے کہا: "ہم نے 31 chapters انفرادی AWS services سیکھنے میں گزارے۔ اور اب ہم پوری نظام کو دیکھنا شروع کر رہے ہیں۔ یہی طرح architects سوچتے ہیں۔"

اگلے باب میں: ایک real architecture review کیسی نظر آتی ہے، first principles سے۔
