# باب ۲۸: Storage Bill کی حیرانی

اب تک spreadsheet میں سولہ tabs ہو چکی تھیں۔ Tom اسے ایک دوسری window میں کھلا رکھتا تھا، جیسے کچھ لوگ grocery list رکھتے ہیں — ہمیشہ نظر آنے والی، ہمیشہ بڑھتی ہوئی۔ اس نے EC2 کے لیے ایک نئی row شامل کی (مکمل، Savings Plan committed) اور اپنا cursor اگلی line پر منتقل کیا۔

Storage۔

**خلاصۂ ماضی: EC2 طے ہو گئی، ایک line item باقی**

باب ۲۷ کے compute pricing کے کام نے EC2 strategy کو طے کر دیا تھا: تین سال کی term پر ایک $0.45/hour Compute Savings Plan، اور nightly batch کے لیے Spot — term پر متوقع $42,500 کی بچت۔ وہ کام مکمل تھا، اور اچھی طرح کیا گیا تھا۔ لیکن یہ bill پر ایک line تھی۔ Tom نے، چھ ماہ کے Athena cost analysis سے، یہ سیکھا تھا کہ bill میں بہت سی lines تھیں — اور یہ کہ ہر ایک اسی جانچ کی مستحق تھی۔ S3 اگلا تھا: $198/month، باب ۲۳ کی lifecycle policy تبدیلیوں کے بعد پہلے ہی $847 سے بہتر۔ تاہم جس عدد نے اس کی نظر کھینچی وہ page پر نیچے تھا۔ EBS: $440/month۔

"یہ زیادہ لگتا ہے،" اس نے کہا۔

Leo نے EBS volume list کھولی۔ Instances سے attached 47 EBS volumes تھے۔ اور پھر کسی بھی instance سے attached نہ ہونے والے 23 volumes اور تھے۔

"یہ 23 volumes،" Tom نے کہا۔ "یہ کیا ہیں؟"

**Orphaned Volume Audit**

Leo نے ایک ایک کر کے ان سے گزرنا شروع کیا۔ یہ ایک تیز عمل نہیں تھا — volumes یکساں طور پر labeled نہیں تھیں، tags غیر مستقل تھے، اور کچھ اتنے عرصے پہلے بنائی گئی تھیں کہ کسی کو context یاد نہیں تھا۔ Tom نے ایک کرسی کھینچی اور دیکھنے لگا۔

Volume ebs-021a4c۔ 16 ماہ پہلے بنائی گئی۔ Tag: "debug-prod-db-snapshot-restore۔" Size: 200GB۔ آخری بار attached: کبھی نہیں، یا attachment history صاف کر دی گئی تھی۔

"وہ مجھے یاد ہے،" Leo نے کہا۔ "ہمیں ایک database query کا مسئلہ تھا اور میں نے data چیک کرنے کے لیے ایک snapshot restore کیا۔ میں نے اسے چیک کیا، مسئلہ وہاں نہیں ملا، اور volume delete کرنا بھول گیا۔"

Volume ebs-07f38b۔ 11 ماہ پہلے بنائی گئی۔ Tag: "load-test-temp۔" Size: 400GB۔

Leo ایک لمحے کے لیے خاموش رہا۔ "میرا خیال ہے یہ وہ load test تھا جو ہم نے Series Seed pitch سے پہلے کیا تھا۔ ہم نے peak load simulate کرنے کے لیے extra storage کے ساتھ extra instances provision کی تھیں اور پھر... مجھے نہیں لگتا میں نے بعد میں ان میں سے کوئی delete کی۔"

"میں نے اسے پہلے ہی deploy کر دیا تھا — اوہ،" اس نے کہا۔ "Load test عارضی تھا۔ Volumes نہیں تھیں۔"

Volume ebs-0ab12c سے ebs-0ab134 تک۔ آٹھ مسلسل volumes، 9 ماہ پہلے بنائی گئیں۔ Tag: "k8s-experiment۔" Size: ہر ایک 100GB، کل 800GB۔

"وہ Kubernetes evaluation تھی،" Priya نے Leo کے کندھے کے اوپر سے دیکھتے ہوئے کہا۔ "ہم نے تین ہفتے یہ evaluate کرنے میں گزارے کہ ECS یا EKS پر migrate کریں یا نہیں۔ EKS runner-up تھی۔ ہم نے experiment cluster ختم کر دیا لیکن بظاہر persistent volumes چھوڑ دیں۔"

Tom انہیں ایک علیحدہ tab پر جوڑ رہا تھا۔ Volume بہ volume، اعداد جمع ہوتے گئے:

- Debug restore volumes: 4 volumes × 200GB = 800GB
- Load test volumes: 200 اور 400GB کے درمیان چھ volumes — تقریباً کل 1,200GB
- Kubernetes experiment volumes: 8 volumes × 100GB = 800GB
- متفرق untagged: 5 volumes × مختلف sizes = ~700GB

کل: 23 unattached volumes پر تقریباً 3,500GB۔

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے پوچھا۔ جواب: gp3 پر $0.08/GB/month۔ 3,500GB × $0.08 = $280/month۔

اس نے سب سے پرانی creation date چیک کی۔ سولہ ماہ۔ اس نے calculator نکالا۔

"ہم ان میں سے کچھ کے لیے سولہ ماہ سے ادائیگی کر رہے ہیں،" اس نے کہا۔ "کچھ کے لیے نو۔ اوسطاً ان سب میں شاید دس ماہ۔" 23 volumes، اوسطاً $12/month ہر ایک، اوسطاً 10 ماہ۔ یہ تقریباً $2,760 تھا۔ بڑی volumes شامل کریں تو حساب مجموعی طور پر تقریباً $3,200 کے ضیاع پر نکلا۔

"تین ہزار دو سو ڈالر،" Tom نے کہا۔ "ان volumes سے جنہیں کوئی استعمال نہیں کر رہا تھا۔"

"اور کسی نے notice نہیں کیا کیونکہ charge درجنوں line items میں پھیلی ہوئی ہے،" Leo نے کہا۔ "یہ ایک $3,200 کی charge نہیں ہے۔ یہ $12 یا $50 یا $80 فی مہینہ کی 23 charges ہیں، ہر ایک انفرادی طور پر اتنی چھوٹی کہ کوئی alarm نہ بجائے۔"

Tom نے تمام 23 unattached volumes delete کر دیں۔ اس نے Leo اور Priya سے تصدیق کی کہ ہر ایک میں ایسا کوئی data نہیں تھا جس کی انہیں ضرورت ہو — debug volume ایک ایسے database کا باسی data تھا جو اس کے بعد سے migrate ہو چکا تھا، load test data غیر متعلقہ تھا، Kubernetes experiment volumes خالی تھیں۔ Deletion میں پندرہ منٹ لگے۔ اگلے مہینے، EBS bill $440 سے گر کر $160 ہو گیا۔

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا، جب Tom نے اسے finding کے بارے میں بتایا۔ "Instance terminate کرتے وقت volume delete کرنا default کیوں نہیں ہے؟"

"یہ volume پر منحصر ہے،" Tom نے کہا۔ "**root** volume default کے ذریعے delete ہو جاتی ہے — اس کے لیے `DeleteOnTermination` true ہوتا ہے۔ لیکن کوئی بھی **اضافی** data volumes جو آپ attach کرتے ہیں default کے طور پر محفوظ رہتی ہیں۔ مفروضہ یہ ہے کہ آپ کو ان پر موجود data کی ضرورت پڑ سکتی ہے۔ یہ 23 orphans سب data volumes تھیں — ایک debug session یا load test کے لیے attached، پھر جب instance terminate ہوئی تو پیچھے چھوڑ دی گئیں۔"

"تو default آپ کو data volumes پر حادثاتی data loss سے بچاتا ہے۔"

"اور اگر آپ توجہ نہیں دے رہے تو آپ کو پیسے کی لاگت آتی ہے۔ اب سے: کوئی بھی اضافی data volumes instance terminate ہونے پر واضح طور پر delete ہو جائیں گی — یا attach کے وقت `DeleteOnTermination` set کر دیا جائے گا — جب تک کوئی اس کے لیے ایک documented case نہ بنائے کہ انہیں رکھنا کیوں ضروری ہے۔"

"کیا ہم نے سوچا ہے کہ اگر کوئی اس case کو document کرنا بھول جائے تو کیا ہوگا؟" Priya نے پوچھا۔ "ہم کوئی اہم چیز delete کر سکتے ہیں۔"

"یہی trade-off ہے،" Tom نے کہا۔ "ابھی trade-off دوسری سمت میں ہے — ہم فرض کر رہے ہیں کہ ہر چیز رکھی جانی چاہیے اور جب نہ ہو تو اس کی ادائیگی کر رہے ہیں۔ 'یہ volume رکھیں' document کرنے کا ضبط موجودہ default 'ہر چیز خاموشی سے رکھیں' سے کم خطرناک ہے۔"

**Storage Cost Audit**

Tom کی EBS دریافت ایک وسیع تر pattern کی علامت تھی: storage costs غیر مرئی طور پر جمع ہوتی ہیں۔ Compute کے برعکس (جب 47 servers چل رہے ہوں تو آپ notice کرتے ہیں)، storage خاموشی سے جمع ہوتی رہتی ہے۔

اسے ایک storage unit rental کی طرح سوچیں۔ ایک unit rent کرنا credit card statement پر واضح ہوتا ہے۔ لیکن اگر آپ ایک project کے لیے دوسری unit rent کریں، پھر کچھ پرانے furniture کے لیے تیسری، اور آپ کبھی واپس جا کر یہ چیک نہ کریں کہ اندر کیا ہے — تو charges ہر مہینے آتے رہتے ہیں، خاموشی سے، بہت بعد تک جب آپ بھول چکے ہوں کہ آپ کیا store کر رہے ہیں۔ Cloud storage اسی طرح کام کرتی ہے: bytes وہاں بیٹھے رہتے ہیں، invoice آتا ہے، اور کوئی اس پر سوال نہیں کرتا جب تک کوئی آخرکار دروازہ کھولے اور اسے ایسی چیزوں سے بھرا نہ پائے جن کی کسی کو مزید ضرورت نہیں۔

ایک مکمل storage cost audit ان چیزوں کو دیکھتی ہے:

**S3**:

- کیا تمام buckets کے لیے lifecycle policies موجود ہیں؟
- کیا پرانے snapshots (RDS، EBS) S3 میں بیٹھے ہیں؟
- کیا غیر یقینی access patterns والے کسی bucket کے لیے Intelligent-Tiering مناسب ہے؟
- کیا versioned objects متعدد copies بنا رہے ہیں جن تک کبھی access نہیں ہوتی؟
- کیا نامکمل multipart uploads خاموشی سے جمع ہو رہے ہیں؟

**EBS**:

- کیا کوئی volumes unattached ہیں (کوئی running instance انہیں استعمال نہیں کر رہی)؟
- کیا gp3 volumes صحیح طریقے سے configured ہیں؟ (Default gp3 volumes میں اضافی provisioned throughput/IOPS ہو سکتی ہے جس کی ضرورت نہیں)
- کیا ضرورت سے زیادہ پرانے snapshots retain ہو رہے ہیں؟

**RDS**:

- کیا automated backup retention periods مناسب طریقے سے set ہیں؟ (زیادہ = زیادہ storage لاگت)
- کیا پرانی instances کے manual snapshots ابھی بھی موجود ہیں؟
- کیا database migrations کے read replicas ابھی بھی چل رہے ہیں؟

**EFS**:

- کیا EFS volume صحیح storage class میں ہے؟ (Standard بمقابلہ Infrequent Access)

**S3 Versioning: پوشیدہ لاگت**

باب ۵ میں، ہم نے ذکر کیا کہ S3 versioning ہر object کا ہر پچھلا version رکھتی ہے۔ یہ safety کے لیے بہترین ہے۔ یہ costs کے لیے خوفناک ہے اگر آپ versions کے لیے lifecycle rules بھی نہ رکھیں۔

جب کسی bucket پر versioning enabled ہو، ہر بار جب آپ ایک object overwrite کریں، پرانا version retain ہو جاتا ہے۔ وقت کے ساتھ:

- Day 1: Image uploaded (v1)
- Day 30: Image updated (v1 اب ایک "noncurrent" version ہے، v2 current ہے)
- Day 60: Image دوبارہ updated (v1 اور v2 noncurrent ہیں، v3 current ہے)
- Day 365: v1، v2... v12 سب stored ہیں۔ آپ ایک image کی 12 copies کے لیے ادائیگی کر رہے ہیں۔

آپ شاید سوچ رہے ہوں کہ versioning پرانے versions کو خودبخود صاف کیوں نہیں کرتی۔ جواب جان بوجھ کر ہے — AWS آپ کا data خودبخود delete نہیں کرنا چاہتا۔ لیکن نتیجہ یہ ہے کہ ہر version جمع ہوتا رہتا ہے جب تک آپ S3 کو واضح طور پر نہ بتائیں کہ انہیں کتنی دیر رکھنا ہے۔ حل: noncurrent versions کے لیے lifecycle rules۔

```
30 دنوں کے بعد noncurrent versions expire کریں
7 دنوں کے بعد failed multipart uploads delete کریں
```

Tom نے یہ rules تمام versioned buckets پر apply کیے۔ اگلے مہینے، S3 storage 18% کم ہو گئی۔

**نامکمل Multipart Uploads: غیر مرئی جمع**

ایک زیادہ باریک S3 لاگت ہے جسے زیادہ تر engineers مکمل طور پر نظر انداز کر دیتے ہیں: نامکمل multipart uploads۔

جب S3 ایک بڑی file upload کرتا ہے، تو وہ اسے parts میں توڑ دیتا ہے اور ہر ایک کو الگ سے upload کرتا ہے۔ یہ multipart upload mechanism ہے — چند سو megabytes سے بڑی files کے لیے ایک واحد بڑے PUT سے زیادہ قابل اعتماد۔ لیکن اگر کوئی upload شروع ہو اور پھر بیچ میں ناکام ہو جائے — ایک network interruption، ایک client crash، ایک application bug — تو پہلے سے upload شدہ parts S3 میں باقی رہتے ہیں۔ وہ آپ کے bucket میں objects کے طور پر نظر نہیں آتے۔ وہ کسی list میں ظاہر نہیں ہوتے۔ لیکن وہ stored ہیں، اور آپ سے ان پر standard S3 rates پر charge کیا جاتا ہے۔

Tom نے یہ S3 console میں S3 Storage Lens dashboard کو enable کر کے اور "incomplete multipart uploads" کے مطابق sort کر کے پایا۔ Nimbus کے پاس چار AWS accounts میں buckets میں خاموشی سے بیٹھا نامکمل multipart upload data 340GB تھا، جس میں سے کچھ ایک سال سے زیادہ پرانا تھا۔

"یہ فی مہینہ کتنی لاگت ہے؟" Tom نے پوچھا۔ $0.023/GB/month × 340GB = $7.82/month۔ انفرادی طور پر چھوٹا۔ لیکن یہ کسی کے notice کیے بغیر ایک سال سے جمع ہو رہا تھا۔

حل: ہر bucket میں ایک lifecycle rule شامل کریں۔

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

سات دنوں کے بعد، کوئی بھی نامکمل multipart upload خودبخود صاف ہو جاتا ہے۔ یہ بغیر کسی مسلسل توجہ کے غیر معینہ مدت تک چلتا ہے۔

"اگر وہ سب پورا ایک سال وہاں بیٹھا رہا ہوتا — تو فرض کریں ہم نے ناکام uploads پر $94 خرچ کیے،" Leo نے کہا۔

"ناکام uploads پر،" Tom نے تصدیق کی۔ "کامیاب storage پر بھی نہیں۔ یہ infrastructure waste کی تعریف ہے۔"

**EBS: Right-Sizing اور gp3 Upgrade**

EBS volume pricing کے دو اجزاء ہیں:

1. Storage (فی GB فی ماہ)
2. Provisioned IOPS اور throughput (اگر آپ io1/io2 پر ہیں یا اضافی gp3 performance کے لیے ادائیگی کر رہے ہیں)

**gp3 موقع**: باب ۶ میں، ہم نے note کیا کہ gp3 موجودہ default ہے اور gp2 سے سستی ہے۔ اگر Nimbus کے پاس gp3 کے دستیاب ہونے سے پہلے بنائی گئی volumes تھیں (یہ دسمبر 2020 میں launch ہوئی)، تو وہ ابھی بھی gp2 ہو سکتی ہیں۔

Migration سیدھا ہے: AWS console میں یا CLI کے ذریعے volume type کو gp2 سے gp3 میں modify کریں۔ کوئی downtime درکار نہیں۔ Volume conversion کے دوران available رہتی ہے۔ Performance خصوصیات برابر یا بہتر ہیں — gp3، 3,000 IOPS اور 125 MB/s baseline throughput فراہم کرتی ہے، gp2 کے burstable model کے مقابلے میں جو چھوٹی volumes کے لیے غیر مستقل ہو سکتا تھا۔

"رکیں — لیکن ہم اسے اس طرح *کیوں* کریں؟" Maya نے پوچھا۔ "اگر gp3 سستی ہے اور کم از کم gp2 جتنی اچھی ہے، تو AWS نے سب کو خودبخود migrate کیوں نہیں کر دیا؟"

"کیونکہ AWS customer infrastructure میں یکطرفہ تبدیلیاں نہیں کرتا،" Tom نے کہا۔ "حتیٰ کہ فائدہ مند بھی۔ Modification نظری طور پر کسی workload کے لیے ضمنی اثرات رکھ سکتا ہے۔ Customer کو اسے شروع کرنا پڑتا ہے۔ یہی وجہ ہے کہ ہزاروں teams gp3 کے launch ہونے کے سالوں بعد بھی gp2 قیمتیں ادا کر رہی ہیں، صرف اس لیے کہ کوئی تلاش کرنے نہیں گیا۔"

Tom نے gp3 migration ایک سنیچر کی صبح کرنے کا فیصلہ کیا — وہی صبح کا ضبط جو اس نے EC2 pricing analysis پر لاگو کیا تھا۔ پُرسکون وقت۔ کوئی standups نہیں۔ بس AWS console اور ایک منصوبہ۔

اس نے production environment میں 8 volumes شناخت کی تھیں جو ابھی بھی gp2 تھیں: چار API server root volumes، background processors سے attached دو volumes، اور دو legacy data volumes جو نئی deployments کے لیے gp3 migration معیاری عمل بننے سے پہلے بنائی گئی تھیں۔ مل کر ان کا کل 960 GB تھا۔

Migration کا عمل فی volume ایک واحد API call تھا:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

`--iops 3000` اور `--throughput 125` parameters gp3 کے baseline defaults سے میل کھاتے تھے۔ gp2 کے لیے، Tom نے پہلے CloudWatch metrics چیک کی تھیں: ہر volume پر اوسط IOPS 200 اور 800 کے درمیان تھا۔ ان میں سے کسی کو بھی اس 3,000 IOPS baseline سے زیادہ کی ضرورت نہیں تھی جو gp3 مفت فراہم کرتی تھی۔ Throughput بھی اسی طرح آرام دہ تھا — 125 MB/s default کے اندر اچھی طرح۔

"اگر switch کرنے کے بعد ایک volume کو زیادہ IOPS کی ضرورت ہو تو کیا ہوگا؟" Maya نے پوچھا، جب Tom نے migration plan سمجھایا۔

"ہم کسی بھی وقت gp3 volume پر provisioned IOPS بڑھا سکتے ہیں،" Tom نے کہا۔ "Migration کچھ بھی lock نہیں کرتی۔ اگر ہم 3,000 IOPS پر gp3 پر جائیں اور دریافت کریں کہ یہ ناکافی ہے، تو ہم volume کو دوبارہ modify کر کے مزید شامل کرتے ہیں۔ Modification live ہے — کوئی downtime نہیں، کوئی unmounting نہیں۔"

"اور gp2 کو in-place modify نہیں کیا جا سکتا؟"

"gp2 کو in-place gp3 میں modify کیا جا سکتا ہے۔ جو آپ نہیں کر سکتے وہ gp3 سے gp2 پر واپس جانا ہے — کم از کم، آسانی سے نہیں، اور اس کی کوئی وجہ بھی نہیں۔"

اصل migration پہلے command سے تکمیل تک تمام 8 volumes پر 73 منٹ لیا۔ AWS نے ہر volume کو modify کیا جب وہ mounted اور زیر استعمال تھی۔ API servers پورے دوران traffic وصول کرتے رہے۔ CloudWatch نے conversion کے دوران I/O latency میں کوئی spikes نہیں دکھائیں — منتقلی چلتی ہوئی application کے نقطہ نظر سے مکمل طور پر شفاف تھی۔

"یہی ہے جو 'کوئی downtime درکار نہیں' اصل میں نظر آتا ہے،" Leo نے کہا، Tom کی capture کردہ before-and-after metrics کو دیکھتے ہوئے۔ "میں نے فرض کیا تھا کہ 'کوئی downtime نہیں' کا مطلب 'مختصر restart' ہے۔ اس کا مطلب ہے کہ application کے نقطہ نظر سے لفظی طور پر کچھ نہیں بدلتا۔"

بچت: gp2 $0.10/GB/month تھی؛ gp3 $0.08/GB/month تھی۔ 960 GB پر: $96/month بمقابلہ $76.80/month۔ ماہانہ بچت: $19.20۔ خود میں تبدیلی لانے والی نہیں، لیکن جو ضبط اس کی نمائندگی کرتا تھا وہ تھا۔ اس نقطے سے آگے بنائی گئی کوئی بھی نئی volume default کے طور پر gp3 استعمال کرتی۔ Tom نے اس صبح جو تنظیمی اصول لکھا: کوئی gp2 volumes نہیں۔ EBS volume بنانے والے کسی بھی engineer کو gp3 استعمال کرنا چاہیے جب تک کوئی مخصوص، documented وجہ نہ ہو۔

**IOPS اور throughput**: gp3 volumes default کے طور پر 3,000 IOPS اور 125 MB/s throughput کے ساتھ آتی ہیں، بغیر کسی اضافی charge کے۔ اگر آپ کی workload کو ضرورت ہو تو آپ زیادہ provision کر سکتے ہیں۔ Review کریں کہ آیا provisioned performance واقعی استعمال ہو رہی ہے۔

اسی audit میں، Tom نے 10,000 provisioned IOPS کے ساتھ دو volumes پائیں — اس کے شامل ہونے سے پہلے کی ایک legacy setting، ایک ایسے database کے لیے sized جو اس کے بعد سے Aurora پر migrate ہو چکا تھا۔ اس نے CloudWatch metrics چیک کیں: اصل اوسط IOPS 1,200 تھا۔ اس نے provisioned IOPS کو 4,000 تک کم کیا (اصل peak سے اوپر ایک safety margin)۔

ماہانہ بچت: provisioned IOPS کے اخراجات میں $68 جو ایسی performance headroom کی ادائیگی کر رہے تھے جسے کوئی استعمال نہیں کر رہا تھا۔

**Snapshot lifecycle**: EBS snapshots incremental ہیں (ہر snapshot صرف پچھلے کے بعد ہونے والی تبدیلیاں store کرتا ہے)، لیکن وہ جمع ہوتے ہیں۔ Nimbus کے ابتدائی دنوں کے پرانے snapshots ابھی بھی موجود تھے۔ Tom نے روزانہ snapshots کے 30 دن رکھے اور باقی delete کر دیے۔

**EFS: Storage Classes اور Intelligent-Tiering کا فیصلہ**

Amazon EFS کی اپنی storage classes ہیں:

- **EFS Standard**: کثرت سے accessed files کے لیے۔ زیادہ لاگت۔
- **EFS Infrequent Access (IA)**: 30 دن سے access نہ ہونے والی files کے لیے۔ Standard سے 92% سستی۔
- **EFS Archive**: 90 دن سے access نہ ہونے والی files کے لیے۔ IA سے بھی سستی۔

**EFS Intelligent-Tiering**: Access patterns کی بنیاد پر files کو خودبخود storage classes کے درمیان منتقل کرتا ہے۔

Tom نے EFS volume پر Intelligent-Tiering enable کیا۔ چھ ہفتے بعد، 68% files Infrequent Access میں منتقل ہو چکی تھیں۔ ماہانہ EFS لاگت $89 سے گر کر $31 ہو گئی۔

لیکن Intelligent-Tiering اور ایک manual lifecycle rule کے درمیان انتخاب معمولی نہیں تھا۔ Tom نے اس پر غور کیا تھا۔

"رکیں — لیکن ہم صرف ایک manual lifecycle rule set کرنے کے بجائے Intelligent-Tiering *کیوں* کریں؟" Maya نے پوچھا۔ "اگر ہم جانتے ہیں کہ 30 دن سے پرانی files access نہیں ہو رہیں، تو بس rule set کر کے فارغ کیوں نہ ہو جائیں؟"

"Intelligent-Tiering ان files کو سنبھالتا ہے جو واپس آتی ہیں،" Tom نے کہا۔ "اگر میں ایک lifecycle rule set کروں کہ 30 دن بعد files کو IA میں منتقل کر دے، اور پھر کوئی ایک ایسی file access کرے جو چھ ماہ سے IA میں ہے، تو وہ IA میں ہی رہتی ہے۔ Intelligent-Tiering کے ساتھ، اگر access دوبارہ شروع ہو، تو file خودبخود Standard پر واپس منتقل ہو جاتی ہے۔ یہ دو طرفہ ہے۔"

"تو پھر آپ lifecycle rule کو کب ترجیح دیں گے؟"

"جب آپ کو یقین ہو کہ access pattern یک طرفہ ہے۔ Archive logs — وہ لکھے جاتے ہیں، وہ پرانے ہوتے ہیں، وہ ایک compliance audit کے لیے ایک بار access ہوتے ہیں اور پھر کبھی نہیں۔ اس pattern کے لیے، 90 دن بعد Archive میں منتقل کرنے والی lifecycle rule، Intelligent-Tiering سے سستی ہے کیونکہ آپ monitoring overhead ادا نہیں کر رہے۔"

"ایک monitoring fee ہے؟"

"S3 Intelligent-Tiering کے لیے، ہاں، یہی وجہ ہے کہ ہم نے S3 lifecycle باب میں small-object economics کا احاطہ کیا تھا۔ EFS کے لیے، فیصلہ زیادہ تر access pattern کے بارے میں ہے: اگر files دوبارہ hot ہو سکتی ہیں، تو Intelligent-Tiering محفوظ تر ہے۔ اگر وہ صرف ایک سمت میں پرانی ہوتی ہیں، تو Archive کی lifecycle rule سستی اور سادہ ہے۔"

**S3 Cost Allocation Tags: یہ تلاش کرنا کہ کون کیا خرچ کر رہا ہے**

جیسے جیسے Nimbus بڑھا، متعدد teams S3 میں data store کر رہی تھیں۔ Analytics team کے اپنے buckets تھے۔ Engineering team کے اپنے buckets تھے۔ restaurant data team کے اپنے buckets تھے۔

Bill صرف "S3: $198" دکھاتا تھا۔ Team کے مطابق کوئی breakdown نہیں تھا۔

**Cost allocation tags** آپ کو AWS resources کو business metadata (team، project، environment) کے ساتھ tag کرنے دیتے ہیں اور پھر AWS Cost Explorer میں ان tags کے مطابق breakdown شدہ costs دیکھنے دیتے ہیں۔

Tom نے تمام S3 buckets میں tags شامل کیے:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Tagging کے ساتھ ایک billing cycle کے بعد، وہ دیکھ سکتا تھا: "Analytics team کا data lake $74/month ہے۔ Engineering backups $43/month ہیں۔ restaurant data $81/month ہے۔"

اب وہ صرف ایک aggregate number دیکھنے کے بجائے ہر team کے ساتھ budget کی گفتگو کر سکتا تھا۔

**AWS Cost Explorer اور AWS Budgets**

**AWS Cost Explorer**: service، region، tag، اور usage type کے مطابق historical اور forecasted costs کو visualize کرتا ہے۔ یہ سمجھنے کے لیے ضروری کہ پیسہ کہاں جاتا ہے۔

**AWS Budgets**: alerts set کرتا ہے جب costs ایک threshold سے تجاوز کریں (یا تجاوز کرنے کی پیش گوئی ہو)۔ آپ service، region، tag، یا account کے مطابق budget کر سکتے ہیں۔

Tom نے تین budgets set کیے:

1. کل ماہانہ bill: budgeted amount کے 90% پر Alert
2. EC2 On-Demand: Alert اگر On-Demand spend $500/month سے تجاوز کرے (Savings Plan gap کی علامت)
3. Data transfer out: $200/month پر Alert (data transfer costs غیر متوقع طور پر spike کر سکتی ہیں)

Budgets ایک Slack channel کو alerts بھیجتے تھے۔ team نے دیکھا جب وہ limits کے قریب پہنچ رہی تھی، بجائے اسے ماہانہ invoice پر دریافت کرنے کے۔

**ہر line کے ساتھ رسید: Cost and Usage Reports**

Cost Explorer نے Tom کے زیادہ تر سوالات کے جواب دیے۔ پھر اسے ایک ایسا سوال آیا جس کا یہ جواب نہیں دے سکا: "بالکل کون سے S3 buckets نے، گھنٹہ بہ گھنٹہ، پچھلے منگل کی spike کو چلایا — اور کن tags کے تحت؟"

Forensic-grade سوالات کے لیے، AWS **Cost and Usage Report (CUR)** فراہم کرتا ہے — جو اب **Data Exports** کے ذریعے فراہم کیا جاتا ہے — سب سے تفصیلی billing data جو AWS تیار کرتا ہے: ہر line item، **فی resource، فی گھنٹہ**، tags کے ساتھ، آپ کی ملکیت کے ایک S3 bucket میں فراہم۔ یہ ایک dashboard نہیں ہے؛ یہ خام ledger ہے۔ معیاری pattern یہ ہے کہ اسے Athena سے query کریں (یہ ایک columnar format میں اترتا ہے) یا dashboards کے لیے اسے QuickSight کو فراہم کریں۔

امتحان پر کام کی تقسیم: **Cost Explorer** = console میں interactive visualization اور forecasts۔ **Budgets** = thresholds پر alerts۔ **CUR/Data Exports** = سب سے granular data، S3 کو فراہم، آپ کے اپنے analysis کے لیے۔ جب کوئی سوال کہے "resource-level، hourly cost data for custom analysis" — وہ CUR ہے، Cost Explorer نہیں۔

"کیا ہم نے سوچا ہے کہ اگر ہم کبھی اس پر نظر ہی نہ ڈالیں تو کیا ہوگا؟" Priya نے پوچھا۔ "ہم نے دو دنوں میں $6,700 پایا ہے۔ اور کیا چھپا ہوا ہے؟"

"باقاعدہ audits،" اس نے جاری رکھا۔ "ماہانہ Cost Explorer reviews۔ AWS Trusted Advisor خودبخود unattached volumes اور idle resources flag کرتا ہے۔ معلوم waste patterns کی cleanup خودکار کریں: N دنوں سے پرانے snapshots delete کریں، unattached EBS volumes پر alert کریں، پرانے S3 versions expire کریں۔"

**S3 Requester-Pays: Transfer کی لاگت منتقل کرنا**

Storage audit کے دوران، Tom کو ایک ایسی صورتحال ملی جس کی اس نے توقع نہیں کی تھی۔

Nimbus کے restaurant partners کو اپنے menu photo assets download کرنے کی ضرورت تھی — وہ processed، resized images جو ordering platform نے customers کو serve کیں۔ اپنا menu update کرنے والے ایک restaurant کے لیے، اس کا مطلب تھا 50 MB (ایک چھوٹا update) سے 800 MB (ایک مکمل seasonal refresh) تک image files download کرنا۔ فی الحال، Nimbus ہر download پر outbound data transfer کی لاگت ادا کر رہا تھا: S3 سے partner کے location تک $0.09/GB۔

287 restaurant partners پر، اوسطاً فی مہینہ ایک menu refresh اور اوسطاً 200 MB کے download کے ساتھ، حساب یہ تھا: 287 × 0.2GB × $0.09 = $5.17/month۔ موجودہ scale پر اہم نہیں۔

"2,000 restaurants پر کیا ہوتا ہے؟" Tom نے پوچھا۔

"وہی حساب،" Maya نے کہا۔ "تقریباً $36/month۔"

"10,000 restaurants کا کیا، اور partners بڑے seasonal asset packs download کر رہے ہیں — مثلاً، holiday menu updates کے لیے 2 GB؟"

اس نے اسے چلایا۔ 10,000 × 2GB × $0.09 = $1,800/month data transfer میں، صرف partners کے ان assets download کرنے کے لیے جن کی انہیں ضرورت تھی۔

"یہ ایک حقیقی عدد ہے،" Priya نے کہا۔

"کیا ہم نے سوچا ہے کہ اگر وہ bill اسی مہینے ظاہر ہو جب ہم Series B بند کرنے کی کوشش کر رہے ہوں تو کیا ہوگا؟" Priya نے جاری رکھا۔

"S3 Requester-Pays،" Tom نے کہا۔

S3 میں ایک feature ہے جسے Requester-Pays کہتے ہیں: جب کسی bucket پر enable ہو، تو request کرنے والی entity — نہ کہ bucket owner — data transfer اور request کی لاگت ادا کرتی ہے۔ Bucket owner ابھی بھی storage کی ادائیگی کرتا ہے۔ لیکن bucket سے ہر download requester کے AWS account پر bill کیا جاتا ہے۔

Trade-off رسائی ہے۔ Requester-Pays کے لیے ضروری ہے کہ requesters ایک valid account کے ساتھ AWS customers ہوں — Requester-Pays bucket تک unauthenticated یا anonymous access ایک error واپس کرتی ہے۔ Nimbus کے restaurant partners کے لیے، جو مختلف سطحوں کی technical مہارت والے کاروبار تھے، انہیں اپنے menu assets download کرنے کے لیے AWS account رکھنے کا تقاضا ایک قابل عمل model نہیں تھا۔

"ہم براہ راست partner access کے لیے Requester-Pays نہیں کر سکتے،" Maya نے کہا۔ "ہمارے زیادہ تر partners photos download کرنے کے لیے AWS account set up نہیں کریں گے۔"

"درست،" Tom نے کہا۔ "لیکن ہم اسے B2B integrations کے لیے استعمال کر سکتے ہیں — بڑی chains جن کے technical teams اور AWS accounts ہیں۔ کونے پر چھوٹا restaurant نہیں، بلکہ 50-location burger chain جس کا engineering team ہے اور جو ہمارے API سے براہ راست integrate کرتا ہے۔ اس segment کے لیے، Requester-Pays معقول ہے۔"

"اور باقیوں کے لیے؟"

"ہم انہیں ایک download portal دیتے ہیں جو pre-signed S3 URLs استعمال کرتا ہے۔ Transfer ابھی بھی AWS سے گزرتا ہے، لاگت ابھی بھی ہماری ہے — لیکن یہ partner pricing میں پہلے ہی شامل بھی ہے۔ Requester-Pays option ایسی چیز ہے جسے ہم بڑے partners کے لیے contract negotiations میں بنائیں گے، ایسی چیز نہیں جو ہم آج deploy کریں۔"

Tom نے اسے "future optimizations" کے تحت spreadsheet میں شامل کیا: AWS accounts والے enterprise partners کے لیے S3 Requester-Pays۔ 20% enterprise clients کے ساتھ 2,000 restaurants پر، 2 GB ماہانہ downloads پر: ممکنہ طور پر $72/month partners کو منتقل۔ اس scale پر چھوٹا، لیکن وہی pattern معنی خیز ہو جاتا ہے جیسے جیسے asset packs بڑھتے ہیں۔ Review کریں جب partner count 1,000 سے تجاوز کرے یا جب enterprise partners بڑے seasonal packages کھینچنا شروع کریں۔

"سبق وہی ہمیشہ والا ہے،" Tom نے کہا۔ "scale پر پہنچنے سے پہلے جانیں کہ scale پر لاگت کیا بن جاتی ہے۔ آج کا $5 کا مسئلہ تین سال میں $1,800 کا مسئلہ ہے۔ اب اس کے لیے design کرنے میں کوئی لاگت نہیں آتی۔"

**Governance: Auto-Delete بمقابلہ Alert-Only**

Automation کا سوال وہ تھا جس نے سب سے زیادہ اختلاف پیدا کیا۔

"کیا ہمیں 14 دن بعد unattached EBS volumes خودبخود delete کر دینی چاہئیں؟" Tom نے پوچھا۔ "AWS Config rules انہیں flag کر سکتے ہیں۔ Lambda انہیں خودبخود delete کر سکتا ہے۔"

"نہیں،" Priya نے فوراً کہا۔

"کیوں نہیں؟"

"کیونکہ auto-deletion کا مطلب ہے کہ ہم بالآخر کوئی ایسی چیز delete کر دیں گے جو کسی وجہ سے unattached تھی۔ شاید کسی نے ایک volume کو ایک مختلف instance پر منتقل کرنے کے لیے detach کیا، اور یہ 12 دن سے بیٹھی ہے جب ایک change کا review ہو رہا ہے۔ Day 14 پر auto-delete وہ data تباہ کر دیتا ہے۔"

"تو alert-only؟" Tom نے کہا۔ "ہمیں ایک notification ملتا ہے لیکن ہم خودبخود delete نہیں کرتے۔"

"پہلے alert،" Priya نے کہا۔ "ایک انسان کو فیصلہ کرنے پر مجبور کریں۔ Alert یہ ہے: 'یہ volume 14 دن سے unattached ہے۔ اگر آپ کو اس کی ضرورت ہے تو اسے `keep: true` کے طور پر tag کریں، ورنہ اگلے review میں اسے deletion کے لیے flag کر دیا جائے گا۔' انسانی فیصلہ پھر tag کی موجودگی یا غیر موجودگی سے document ہو جاتا ہے۔"

"یہ سست ہے،" Leo نے کہا۔

"یہ سست ہے اور data تباہ کرنے کا امکان کم ہے،" Priya نے کہا۔ "ہم پہلے ہی غفلت کی وجہ سے $3,200 کھو چکے ہیں۔ ہم نے automation کی وجہ سے کوئی data نہیں کھویا۔ میں جانتی ہوں کہ میں کسے برقرار رکھنا پسند کروں گی۔"

Tom ایک hybrid پر پہنچا: 7 دن پر auto-alert، مستقبل کے alerts کو دبانے کے لیے ایک `keep: true` tag درکار، اور team کے ساتھ مل کر review کرنے کے لیے تمام untagged-and-unattached volumes کی ایک ہفتہ وار report چلانا۔ کوئی auto-deletion نہیں۔

**تبدیلی: جب Cleanup بچت سے زیادہ لاگت آتی ہے**

اگر آپ کو اضافی snapshots کی safety کی ضرورت ہے، تو انہیں رکھیں — لیکن 90 دن سے پرانے ہر بغیر access کے snapshot کو اپنی جگہ کمانی چاہیے۔ Trade-off غیر متناسب ہے: ایک ایسا snapshot delete کرنا جس کی آپ کو ضرورت تھی ایک incident کی لاگت آتا ہے؛ ایک ایسا snapshot رکھنا جس کی آپ کو ضرورت نہیں تھی صرف ایک چھوٹی ماہانہ fee کی لاگت آتا ہے۔ compliance-sensitive data کے لیے، پرانے snapshots رکھنے کی لاگت حقیقی ہے لیکن عام طور پر ان کے نہ ہونے کی لاگت سے کم جب کوئی auditor پوچھے۔ 14 ماہ پہلے چلے ایک test کے development snapshots کے لیے، حساب دوسری طرف جاتا ہے۔

اگر آپ غیر یقینی access patterns والی files کے لیے EFS Intelligent-Tiering enable کرتے ہیں، تو خودکار tiering پیسہ بچاتی ہے اور کسی مسلسل مداخلت کی ضرورت نہیں ہوتی۔ اگر files قابل پیش گوئی طور پر archive access کی طرف پرانی ہوتی ہیں، تو ایک براہ راست lifecycle rule سادہ تر ہے۔ enable کرنے سے پہلے ناپیں۔

SAA-C03 ربط: امتحان یہ test کرتا ہے کہ آیا آپ ایک access frequency منظر نامے کے پیش نظر S3 storage classes (Standard، IA، Glacier) کے درمیان انتخاب کر سکتے ہیں۔ وہی منطق یہاں لاگو ہوتی ہے — صحیح class اس بات پر منحصر ہے کہ data کتنی بار access ہوتا ہے۔

**غفلت کی لاگت**

Tom نے ایک spreadsheet بنائی۔ اس نے حساب لگایا کہ Nimbus نے کتنا خرچ کیا تھا:

- Unattached EBS volumes (16 ماہ): $3,200
- پرانے S3 snapshots (دریافت اور delete): $890
- غیر ضروری provisioned IOPS: $816
- gp2 سے gp3 migration savings (متوقع، اگر پہلے کیا جاتا): 18 ماہ پر $346
- جمع ہوتے Noncurrent S3 versions: $1,340
- نامکمل multipart uploads: $94

شناخت کردہ کل waste: 18 ماہ پر تقریباً $6,700۔

"چھ ہزار سات سو ڈالر،" Maya نے کہا۔

"غفلت سے،" Tom نے کہا۔ "غلط architectural فیصلے کرنے سے نہیں۔ صفائی نہ کرنے سے۔"

"systematic fix کیا ہے؟"

"اور،" Tom نے اضافہ کیا، "cost hygiene کو deployment process کا حصہ بنائیں۔ جب کوئی engineer ایک EC2 instance terminate کرے، تو EBS volume خودبخود delete ہو جائے جب تک کہ وہ واضح طور پر opt out نہ کریں۔"

## خوبیاں اور حدود

**Cost optimization ضبط**:

- باقاعدہ reviews جمع ہوتے waste کو اہم بننے سے پہلے پکڑتی ہیں
- Tagging جواب دہی کو enable کرتی ہے — teams اپنی costs دیکھتی ہیں
- خودکار alerts billing surprises روکتے ہیں
- Lifecycle policies اور right-sizing اکثر set-and-forget savings ہوتی ہیں

**جہاں یہ پیچیدہ ہو جاتا ہے**:

- بہت سی teams والے ایک بڑے account میں waste شناخت کرنے کے لیے centralized tooling کی ضرورت ہے
- کچھ waste دانستہ ہوتا ہے ("بس صورت میں" اضافی snapshots رکھنا) — cost/risk trade-off ایک judgment call ہے
- gp3 migration کے لیے محتاط validation کی ضرورت ہے (IOPS اور throughput defaults کچھ edge cases میں gp2 رویے سے مختلف ہو سکتی ہیں)
- Cost allocation tags کے لیے تمام teams میں ضبط کی ضرورت ہے — غیر مستقل tagging data کو ادھورا بناتی ہے
- Auto-deletion automation storage کے لیے خطرناک ہے — volumes اور snapshots کے لیے alert-and-review محفوظ تر ہے

## خلاصہ

Storage audit میں دو دن لگے تھے۔ جو waste اس نے بے نقاب کیا — غیر مرئی جمع کے 18 ماہ پر $6,700 — وہ فیصلہ سازی کی ناکامی سے کم تھا اور توجہ کی ناکامی سے زیادہ۔ کچھ بھی جان بوجھ کر غلط configure نہیں کیا گیا تھا۔ Snapshots، unattached volumes، جمع ہوتی version history، نامکمل multipart uploads: ہر ایک اس وقت معقول لگتا تھا اور بس کبھی دوبارہ نہیں دیکھا گیا۔ سبق مخصوص AWS services کے بارے میں نہیں تھا۔ یہ دیکھنے کی عادت بنانے کے بارے میں تھا۔

- **Storage costs غیر مرئی طور پر جمع ہوتی ہیں** — باقاعدہ audits ضروری ہیں۔
- **Unattached EBS volumes** waste کا ایک عام source ہیں۔ انہیں delete کریں (یا instances terminate ہونے پر deletion کو خودکار کریں)۔
- **EBS right-sizing**: gp2 کو gp3 میں migrate کریں (عام طور پر 20% بچت)۔ اضافی provisioned IOPS ہٹائیں۔
- **S3 versioning**: نامحدود version history کی ادائیگی سے بچنے کے لیے noncurrent versions کے لیے lifecycle rules enable کریں۔
- **نامکمل multipart uploads**: ہر bucket میں ایک `AbortIncompleteMultipartUpload` lifecycle rule شامل کریں۔ یہ اکثر نظر انداز ہو جاتی ہے اور خاموشی سے جمع ہوتی رہتی ہے۔
- **EFS Intelligent-Tiering**: access frequency کی بنیاد پر files کو خودبخود کم لاگت والے tiers میں منتقل کرتا ہے۔ قابل پیش گوئی access patterns کے لیے، manual lifecycle rules سستی ہو سکتی ہیں۔
- **Governance**: 7-14 دن بعد unattached volumes پر alert کریں؛ دبانے کے لیے واضح tagging درکار رکھیں۔ Storage resources کے لیے auto-deletion سے گریز کریں۔

## امتحان کے نکات

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں (ڈومین ۴، ٹاسک ۴.۱)*

- **Cost allocation tags**: billing console میں cost allocation کے لیے User-Defined Tags enable کریں؛ پھر resources کو tag کریں۔ Cost Explorer tags کے مطابق breakdowns دکھاتا ہے۔ امتحانی منظر نامہ: "شناخت کریں کہ کون سا department سب سے زیادہ S3 costs پیدا کر رہا ہے" → cost allocation tags۔
- **AWS Trusted Advisor**: underutilized EC2 instances، unattached EBS volumes، idle load balancers، اور دیگر waste کی شناخت کرتا ہے۔ Basic checks مفت؛ full checks کے لیے Business/Enterprise Support درکار۔
- **EBS cost components**: Storage (فی GB)، provisioned IOPS (اگر io1/io2 یا اضافی gp3)، throughput (اگر اضافی gp3)۔ جانیں کون سے components right-sized کیے جا سکتے ہیں۔
- **S3 versioning costs**: Noncurrent versions، current versions کی طرح ہی rate پر stored اور charged ہوتے ہیں۔ Versioned buckets میں cost control کے لیے noncurrent versions کو expire کرنے والے lifecycle rules انتہائی اہم ہیں۔
- **AWS Compute Optimizer**: EC2 utilization کا analysis کرتا ہے اور right-sized instance types تجویز کرتا ہے۔ امتحانی اشارہ: "صحیح instance type منتخب کر کے EC2 costs کم کریں" → Compute Optimizer۔
- **AWS Cost Anomaly Detection**: غیر معمولی spending patterns کا پتہ لگانے کے لیے ML استعمال کرتا ہے۔ امتحانی اشارہ: "غیر متوقع cost increases خودبخود detect کریں" → Cost Anomaly Detection۔
- **Cost tooling lineup**: interactive charts/forecasts → Cost Explorer۔ Threshold alerts → Budgets۔ "سب سے granular، resource-level/hourly billing data جو custom analysis (Athena/QuickSight) کے لیے S3 کو فراہم کیا جائے" → **Cost and Usage Report (Data Exports)**۔
- **Requester Pays**: "ایک بڑا S3 dataset شیئر کریں؛ consumers اپنے download کی لاگت خود ادا کریں" → S3 Requester Pays (owner صرف storage ادا کرتا رہتا ہے؛ requesters کو ایک AWS account سے authenticate کرنا ضروری ہے)۔

## مشقیں

**مشق ۱ — یادداشت**

وضاحت کریں کہ unattached EBS volumes costs کیوں پیدا کرتی ہیں چاہے کوئی EC2 instance انہیں استعمال نہ کر رہی ہو۔ اس waste سے بچنے کے لیے ایک EC2 instance terminate کرتے وقت engineers کو کس process کی پیروی کرنی چاہیے؟

*(اشارہ: EBS volumes physical disk پر data store کرتی ہیں، اور وہ disk پیسے کی لاگت آتی ہے قطع نظر اس کے کہ یہ پڑھی جا رہی ہو یا نہیں۔)*

**مشق ۲ — SAA-C03 منظر نامہ**

*منظر نامہ*: ایک کمپنی کا AWS bill چھ ماہ میں $5,000 سے بڑھ کر $9,000/month ہو گیا ہے، لیکن انہوں نے کوئی نئی services شامل نہیں کیں۔ Engineering team کو شبہ ہے کہ storage costs مسئلہ ہیں۔ AWS tools کا کون سا combination cost increase کو بہترین طریقے سے شناخت اور وضاحت کرے گا؟

A) API calls review کرنے اور یہ شناخت کرنے کے لیے کہ کس نے نئے resources بنائے، AWS CloudTrail  
B) Service-level cost breakdown کے لیے AWS Cost Explorer، اور idle اور unattached resource detection کے لیے AWS Trusted Advisor  
C) Resource utilization monitor کرنے اور cost alarms بنانے کے لیے Amazon CloudWatch  
D) تمام resources اور ان کی compliance status شناخت کرنے کے لیے AWS Config

**اشارہ ۱**: "Cost increase شناخت کریں" → service کے مطابق cost breakdown کو visualize کریں۔

**اشارہ ۲**: "Idle اور unattached resources" → ایک مخصوص tool انہیں proactively شناخت کرتا ہے۔

**اشارہ ۳**: CloudTrail، API calls log کرتا ہے؛ Cost Explorer، cost trends دکھاتا ہے۔ Cost analysis کے لیے کون زیادہ مفید ہے؟

**جواب**: B

**وضاحت**: AWS Cost Explorer، service، region، اور usage type کے مطابق breakdown شدہ cost trends دکھاتا ہے — یہ شناخت کرنے کے لیے بالکل درست کہ کون سی service نے اضافہ چلایا۔ AWS Trusted Advisor کے cost optimization checks، unattached EBS volumes، idle EC2 instances، underutilized load balancers، اور دیگر عام waste sources کی شناخت کرتے ہیں۔

**A کیوں نہیں؟** CloudTrail، log کرتا ہے کہ کس نے resources بنائے اور کب، لیکن براہ راست cost trends نہیں دکھاتا یا waste شناخت نہیں کرتا۔

**C کیوں نہیں؟** CloudWatch، resource performance (CPU، memory) monitor کرتا ہے — right-sizing کے لیے مفید لیکن جمع شدہ storage waste شناخت کرنے کے لیے نہیں۔

**D کیوں نہیں؟** AWS Config، resource configurations اور compliance کو track کرتا ہے لیکن یہ ایک cost analysis tool نہیں ہے۔

*SAA-C03 ڈومین: Cost-Optimized Architectures ڈیزائن کریں — ٹاسک ۴.۱*

**مشق ۳ — آرکیٹیکچر چیلنج** *(اختیاری)*

Nimbus کا S3 bill "backups" label والے ایک bucket کے لیے $340/month دکھاتا ہے۔ Bucket میں versioning enabled ہے اور اس میں شامل ہے:

- Daily database snapshots (ان کی policy کے لیے 7 دن کافی ہیں)
- Weekly full backups (3 ماہ کے لیے رکھی جاتی ہیں)
- Quarterly archives (tax compliance کے لیے 7 سال رکھی جاتی ہیں)

ان retention requirements کو پورا کرتے ہوئے cost کم سے کم کرنے کے لیے اس bucket کے لیے ایک lifecycle policy ڈیزائن کریں۔ ہر قسم کے data کو کون سی storage class استعمال کرنی چاہیے؟ پرانے versions کو جمع ہونے سے روکنے کے لیے آپ versioning کو کیسے handle کریں گے؟

*(کوئی ایک درست جواب نہیں ہے۔ مقصد lifecycle policy design کی مشق کرنا ہے۔)*

## پوسٹ کریڈٹس منظر

Tom نے cost audit کے نتائج team کو publish کیے۔

شناخت کردہ waste: 18 ماہ پر $6,700۔
نافذ کردہ تبدیلیوں سے متوقع سالانہ بچت: $6,200۔

پھر اس نے نیچے ایک line شامل کی: "اس میں Savings Plans ($14,200/year) یا S3 lifecycle policies ($7,800/year) کی بچت شامل نہیں ہے۔ مجموعی سالانہ optimization اثر: تقریباً $28,200۔"

Maya نے اسے دو بار پڑھا۔

"یہ تقریباً ایک junior engineer کی salary ہے،" اس نے کہا۔

"Waste میں،" Tom نے تصدیق کی۔

"یا،" Leo نے کہا، "یہ ثبوت ہے کہ یہ optimizations پہلے کرنا اس junior engineer کو fund کر دیتا۔"

Tom نے اس کی طرف دیکھا۔

"اس کے بارے میں سوچنے کا یہی صحیح طریقہ ہے،" اس نے کہا۔ "Cost optimization کاٹنے کے بارے میں نہیں ہے۔ یہ ایسی چیزوں کی ادائیگی نہ کرنے کے بارے میں ہے جو value پیدا نہیں کرتیں۔"

Maya نے document کو company wiki میں pin کر دیا۔

اگلے باب میں: database tier کو وہی treatment ملتا ہے، اور Tom ایک ایسی جگہ دریافت کرتا ہے جہاں وہ اصل میں کم سرمایہ کاری کر رہا تھا۔
