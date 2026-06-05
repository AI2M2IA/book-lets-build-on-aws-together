# נספח א: מדריך מהיר לשירותי AWS

כל שירות המכוסה בספר זה, בסדר ההצגה. השתמש בזה כחומר לימוד ובדיקה מהירה בהכנה לבחינה.

---

## חישוב

**EC2 — Elastic Compute Cloud** *(פרק 4)*

מכונות וירטואליות בענן. אתה בוחר את סוג המכונה (CPU, זיכרון, אחסון), מערכת ההפעלה והאזור. אתה משלם לשעה (On-Demand), לפי התחייבות (Reserved Instances / Savings Plans), או לפי קיבולת פנויה (Spot). פרימיטיב החישוב הבסיסי.

מושגי מפתח: AMI (Amazon Machine Image), סוגי מכונות (משפחות t3, m6g, r6g, c6g), key pairs, instance profiles, placement groups.

אות בחינה: כשתרחיש דורש חישוב מתמשך, stateful, או ממושך — EC2 או ECS. כשדורש חישוב קצר-מועד, event-triggered, או עם עלות אפסית ללא פעילות — Lambda.

---

**Auto Scaling + Application Load Balancer** *(פרק 7)*

Auto Scaling Groups (ASGs) מוסיפים ומסירים מכונות EC2 על בסיס עומס. Application Load Balancers (ALBs) מפיצים תעבורה על פני מכונות ומנתבים לפי נתיב או host. יחד הם מהווים שכבת ה-horizontal scaling.

מושגי מפתח: Launch template, מדיניות הגדלה (target tracking, step, scheduled), health checks, ALB target groups, listener rules, ניתוב משוקלל.

אות בחינה: "טיפול בעומס משתנה" או "זמינות גבוהה על פני AZs" → ASG + ALB.

---

**Lambda** *(פרק 20)*

פונקציות serverless. אתה כותב קוד; AWS מריץ אותו בתגובה לאירועים. ללא שרתים לניהול. אתה משלם לפי הפעלה ולפי מילישניה של ביצוע. מתרחב אוטומטית לאלפי הפעלות בו-זמניות.

מושגי מפתח: מקורות אירועים (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, מגבלות בו-זמניות, בו-זמניות שמורה ומוקצת, cold start, Layers, מקסימום 15 דקות.

אות בחינה: "Serverless," "event-driven," "משימות קצרות-מועד," "ללא עלות ללא פעילות" → Lambda.

---

**ECS — Elastic Container Service** *(פרק 21)*

מריץ containers Docker על AWS. שני סוגי השקה: EC2 (אתה מנהל את ה-host) ו-Fargate (AWS מנהל את ה-host). ECS מנהל הגדרות משימה, שירותים, תזמון אשכולות ואינטגרציה עם load balancers וגילוי שירותים.

מושגי מפתח: task definition, ECS service, Fargate לעומת EC2 launch type, ECR (registry containers), task IAM role, service auto scaling.

אות בחינה: "עומסי עבודה מ-containerized," "microservices," "Docker על AWS" → ECS (בדרך כלל Fargate לcontainers serverless).

---

**EKS — Elastic Kubernetes Service** *(פרק 21)*

Kubernetes מנוהל. AWS מריץ את control plane; אתה מריץ worker nodes (EC2 או Fargate). השתמש ב-EKS כשצוותך כבר משתמש ב-Kubernetes או יש לו עומסי עבודה הדורשים תכונות Kubernetes ספציפיות.

אות בחינה: "Kubernetes," "צריך להגר עומסי עבודה K8s קיימים" → EKS. "רק צריך containers ללא תקורת K8s" → ECS.

---

## אחסון

**S3 — Simple Storage Service** *(פרק 5)*

אחסון עצמים. קיבולת בלתי מוגבלת, עמידות אחד-עשר תשיעיות. מאחסן קבצים כעצמים בדליים. דליים חיים באזור. עצמים יכולים לנוע מ-0 בייטים ל-5TB.

מושגי מפתח: bucket policy, object ACL, versioning, אחסון אתרים סטטיים, presigned URLs, multipart upload, Transfer Acceleration, מחלקות אחסון (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

אות בחינה: "אחסן ואחזר קבצים," "נכסים סטטיים," "גיבויים," "אגם נתונים" → S3.

---

**EBS — Elastic Block Store** *(פרק 6)*

אחסון בלוקים המחובר למכונת EC2 בודדת. פועל כדיסק קשיח. נמשך ללא תלות במחזור חיי המכונה. סוגים נפוצים: gp3 (SSD כללי, ברירת מחדל), io2 (IOPS מוקצה למסדי נתונים), st1 (HDD ממוטב לתפוקה לקריאות רציפות).

מושגי מפתח: Snapshots (מצטבר, מאוחסן ב-S3), הצפנה (KMS), Multi-Attach (io1/io2 בלבד), הקצאת IOPS ותפוקה.

אות בחינה: "אחסון מתמשך ל-EC2," "אחסון מסד נתונים," "דורש גישת בלוקים בזמן השהיה נמוך" → EBS.

---

**EFS — Elastic File System** *(פרק 6)*

מערכת קבצים משותפת, נגישה ממכונות EC2 מרובות בו-זמנית. פרוטוקול NFS. מתרחבת אוטומטית. יקר יותר מ-EBS לGB. שתי מחלקות אחסון: Standard ו-Infrequent Access. Intelligent-Tiering מעביר קבצים אוטומטית.

אות בחינה: "מערכת קבצים משותפת," "מכונות EC2 מרובות צריכות את אותם קבצים," "NFS" → EFS.

---

**מחלקות אחסון S3 ומדיניות מחזור חיים** *(פרק 23)*

S3 Intelligent-Tiering מעביר אוטומטית עצמים בין שכבות גישה על בסיס תדירות גישה. מדיניות מחזור חיים מעברת עצמים בין מחלקות (Standard ← Standard-IA ← Glacier) על בסיס כללי גיל. מחלקות אחסון Glacier כוללות עיכוב שחזור הנע מדקות (Glacier Instant) עד 12 שעות (Glacier Deep Archive).

אות בחינה: "הפחת עלויות אחסון לנתונים שאינם ניגשים אליהם לעתים קרובות" → מדיניות מחזור חיים, Intelligent-Tiering, או Glacier.

---

## מסדי נתונים

**RDS — Relational Database Service** *(פרק 8)*

מסדי נתונים רלציוניים מנוהלים. מנועים נתמכים: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server ו-Aurora. AWS מטפל בגיבויים, תיקון, כשל-אוטומטי ושכפול.

מושגי מפתח: פריסת Multi-AZ (כשל-אוטומטי, שכפול סינכרוני), Read Replicas (אסינכרוני, להגדלת קריאות), גיבויים אוטומטיים, RDS Proxy (מאגר חיבורים).

אות בחינה: "מסד נתונים רלציוני," "עסקאות ACID," "עומס SQL קיים" → RDS או Aurora.

---

**Aurora** *(פרק 24)*

מנוע מסד הנתונים הרלציוני של AWS, תואם MySQL ו-PostgreSQL. מנוע אחסון מבוזר המשכפל נתונים על פני 3 AZs ב-6 עותקים. מהיר בדרך כלל פי 5 מ-MySQL. Aurora Serverless v2 מתרחב קיבולת אוטומטית (נמדד ב-ACUs — Aurora Capacity Units).

מושגי מפתח: Aurora cluster (writer + עד 15 reader endpoints), Aurora Global Database (read replicas בין-אזוריים עם lag שכפול < 1 שניה), Aurora Serverless v2.

אות בחינה: "מסד נתונים רלציוני בביצועים גבוהים," "תואם MySQL/PostgreSQL," "קריאות גלובליות," "עומס משתנה" → Aurora.

---

**DynamoDB** *(פרק 9)*

מסד נתונים NoSQL מנוהל לחלוטין. מודל key-value ומסמכים. מתרחב לכל תפוקה עם ביצועים בזמן השהיה של ספרות בודדות של מילישניות. שני מצבי קיבולת: on-demand (תשלום לפי בקשה) ו-provisioned (תשלום לפי יחידת קיבולת לשעה, עם Auto Scaling).

מושגי מפתח: Partition key (נדרש), sort key (אופציונלי), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (capture שינויים בנתונים), DynamoDB Accelerator (DAX) — מטמון בזיכרון, TTL (Time to Live), עסקאות.

אות בחינה: "גישת key-based בתפוקה גבוהה," "סכמה גמישה," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(פרק 10)*

שירות מטמון בזיכרון מנוהל. שני מנועים: Redis (מתמשך, pub/sub, תסריטי Lua, מבני נתונים) ו-Memcached (מטמון טהור, פשוט יותר, רב-הברגה). השתמש להפחתת עומס מסד נתונים והגשת נתונים הנקראים לעתים קרובות במיקרושניות.

מושגי מפתח: דפוס cache-aside, דפוס write-through, מדיניות פינוי, TTL, cluster mode (Redis), Multi-AZ עם כשל-אוטומטי.

אות בחינה: "הפחת עומס מסד נתונים," "זמן השהיה קריאה מתחת למילישניות," "ניהול סשנים," "לוח תוצאות בזמן אמיתי" → ElastiCache Redis.

---

## רשת

**VPC — Virtual Private Cloud** *(פרק 11)*

רשת וירטואלית פרטית מבודדת ב-AWS. משתרעת על כל AZs באזור. אתה מגדיר מרחב כתובות IP (CIDR block), יוצר תת-רשתות (ציבוריות או פרטיות), מגדיר טבלאות מסלול, ושולט בגישה דרך קבוצות אבטחה ו-NACLs.

מושגי מפתח: תת-רשת ציבורית (מסלול ל-Internet Gateway), תת-רשת פרטית (מסלול ל-NAT Gateway ליציאה), Internet Gateway (דו-כיווני לאינטרנט), NAT Gateway (יציאה בלבד לפרטיים), VPC Peering (חיבור שני VPCs), VPC Endpoints (חיבור לשירותי AWS ללא אינטרנט).

אות בחינה: "רשת פרטית על AWS," "בדד משאבים מאינטרנט," "שלוט בתעבורת רשת" → VPC.

---

**קבוצות אבטחה ו-NACLs** *(פרק 15)*

קבוצות אבטחה הן חומות אש stateful ברמת המכונה — כללי allow בלבד, תעבורת חזרה היא אוטומטית. NACLs (Network Access Control Lists) הן חומות אש stateless ברמת תת-הרשת — דורשות כללי כניסה ויציאה, מוערכות בסדר מספרי.

אות בחינה: "חסום IP ספציפי מגישה לתת-הרשת" → NACL. "שלוט בתעבורה אל/מ-מכונה" → קבוצת אבטחה.

---

**Route 53** *(פרק 12)*

שירות DNS ורשם תחומים של AWS. מנתב תעבורת אינטרנט למשאבי AWS ולנקודות קצה חיצוניות. מדיניות ניתוב: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value answer.

מושגי מפתח: hosted zones (ציבוריות ופרטיות), סוגי רשומות (A, AAAA, CNAME, Alias), health checks, Traffic Flow.

אות בחינה: "ניתוב DNS," "כשל-אוטומטי בין אזורים," "נתב לפי זמן השהיה או מיקום" → Route 53 עם מדיניות הניתוב המתאימה.

---

**CloudFront** *(פרק 13)*

Content Delivery Network (CDN). מטמון תוכן במיקומי קצה (500+ ברחבי העולם). מפחית זמן השהיה למשתמשי קצה. מפחית עלויות העברת נתונים מהמקור דרך מטמון. מתאם עם S3, EC2, ALB ו-API Gateway כמקורות.

מושגי מפתח: distribution, origins, behaviors (ניתוב מבוסס נתיב למקורות), TTL (cache control), cache invalidation, signed URLs and cookies, Lambda@Edge ו-CloudFront Functions, Origin Shield.

אות בחינה: "זמן השהיה נמוך גלובלי," "מטמון תוכן סטטי," "הפחת עומס מקור," "הגן מ-DDoS עם Shield" → CloudFront.

---

**Direct Connect ו-VPN** *(פרק 25)*

AWS Direct Connect הוא חיבור רשת פיזי ייעודי ממרכז הנתונים on-premises שלך ל-AWS. עוקף את האינטרנט הציבורי. AWS Site-to-Site VPN הוא מנהרה מוצפנת דרך האינטרנט הציבורי — מהיר יותר להגדרה, עלות נמוכה יותר, אבל ביצועים משתנים.

אות בחינה: "חיבור פרטי ייעודי ל-AWS" → Direct Connect. "חיבור מוצפן, הגדרה מהירה יותר" → VPN. "חיבור VPCs מרובים" → Transit Gateway.

---

**VPC Endpoints** *(פרק 30)*

חיבור משאבים פרטיים לשירותי AWS ללא שימוש באינטרנט הציבורי או NAT Gateway. Gateway Endpoints: חינמיים, זמינים ל-S3 ו-DynamoDB בלבד. Interface Endpoints (PrivateLink): מתומחרים לפי שעה + לפי GB, זמינים לרוב שירותי AWS.

אות בחינה: "EC2 בתת-רשת פרטית קורא ל-S3/DynamoDB — הפחת עלויות NAT Gateway" → Gateway Endpoint (חינם). "חיבור פרטי ל-SQS, SSM, Secrets Manager מתת-רשת פרטית" → Interface Endpoint.

---

## אבטחה וזהות

**IAM — Identity and Access Management** *(פרקים 3 ו-14)*

שולט מי יכול לעשות מה בחשבון AWS שלך. Users (אישורים לטווח ארוך), Groups (משתמשים חולקים הרשאות), Roles (אישורים זמניים לשירותים ולגישה בין-חשבונית), Policies (מסמכי JSON המגדירים כללי allow/deny).

מושגי מפתח: Principal, Action, Resource, Condition, deny מפורש > allow מפורש > deny משתמע, SCP (Service Control Policy ב-AWS Organizations), Permission boundary, AssumeRole.

אות בחינה: IAM מעורב בכל שאלת אבטחה. דפוס מפתח: שירותים משתמשים ב-IAM roles (לא משתמשים). גישה בין-חשבונית משתמשת בהנחת תפקיד. הרשאה מינימלית — הענק רק מה שנדרש.

---

**KMS — Key Management Service** *(פרק 16)*

שירות מפתחות הצפנה מנוהל. יוצר, מאחסן ושולט במפתחות קריפטוגרפיים. מפתחות מנוהלים לקוח (CMKs) מאפשרים לך להגדיר סיבוב, שימוש ומדיניות גישה. מפתחות מנוהלי AWS מנוהלים אוטומטית.

מושגי מפתח: key policy (נפרד ממדיניות IAM), envelope encryption (נתונים מוצפנים עם data key; data key מוצפן עם CMK), סיבוב אוטומטי של מפתחות, מפתחות Multi-Region, Grants.

אות בחינה: "הצפן נתונים בשאר," "מפתחות הצפנה מנוהלים לקוח," "סיבוב מפתחות" → KMS.

---

**Secrets Manager** *(פרק 16)*

מאחסן ומסובב אוטומטית ערכים רגישים: אישורי מסד נתונים, API keys, אסימוני OAuth. מתאם עם RDS לסיבוב אוטומטי של סיסמאות. אפליקציות משיגות secrets בזמן ריצה דרך API — לעולם אל תקוד אישורים.

אות בחינה: "אחסן וסובב אישורי מסד נתונים," "הימנע מ-secrets קשיחים בקוד" → Secrets Manager. "אחסן ערכי תצורה, לא secrets" → Parameter Store (SSM).

---

**AWS Shield** *(פרק 17)*

הגנת DDoS. Shield Standard היא אוטומטית וחינמית — מגן מפני התקפות volumetric ופרוטוקול נפוצות. Shield Advanced מוסיף הגנה פיננסית, צוות תגובת DDoS 24/7, ונראות מפורטת של התקפות.

אות בחינה: "הגן מפני DDoS" → Shield Standard (אוטומטי) או Shield Advanced (ארגוני, עם SLA).

---

**WAF — Web Application Firewall** *(פרק 17)*

מסנן תעבורת HTTP/HTTPS על בסיס כללים: חסימות IP, הגבלות קצב, דפוסי SQL injection, דפוסי XSS, הגבלות גיאוגרפיות, כללים מותאמים אישית. מתחבר ל-CloudFront, ALB, API Gateway, או AppSync.

אות בחינה: "חסום כתובות IP ספציפיות," "מנע SQL injection בקצה," "הגבל קצב קריאות API" → WAF.

---

**GuardDuty** *(פרק 17)*

שירות זיהוי איומים. מנתח לוגי CloudTrail, VPC Flow Logs ולוגי DNS באמצעות ML ומודיעין איומים. מזהה פעילות API חריגה, תקשורת עם IP זדוני ידוע, אישורים שנפגעו.

אות בחינה: "זהה פעילות חריגה," "זהה אישורי IAM שנפגעו," "ניטור איומים מתמשך" → GuardDuty.

---

## הודעות ועיבוד אירועים

**SQS — Simple Queue Service** *(פרק 19)*

תור הודעות מנוהל. מפיקים שולחים הודעות; צרכנים קוראים ומוחקים. מנתק שירותים. Standard queues: at-least-once delivery, best-effort ordering. FIFO queues: exactly-once processing, strict ordering.

מושגי מפתח: visibility timeout, Dead Letter Queue (DLQ), שמירת הודעות, Long polling.

אות בחינה: "נתק שירותים," "אגרן בקשות במהלך עמוסות תנועה," "עיבוד async" → SQS. "סדר חשוב ו-exactly-once נדרש" → SQS FIFO.

---

**SNS — Simple Notification Service** *(פרק 19)*

שירות pub/sub מנוהל. מפרסמים שולחים הודעה לנושא; כל המנויים מקבלים עותק. דפוס fan-out. פרוטוקולים: SQS, Lambda, HTTP/HTTPS, אימייל, SMS, דחיפה לנייד.

מושגי מפתח: Topic, subscription, דפוס fan-out (SNS ← תורי SQS מרובים), סינון הודעות (מנויים מקבלים רק הודעות תואמות).

אות בחינה: "שלח התראות לנקודות קצה מרובות בו-זמנית," "fan-out אירוע בודד לצרכנים מרובים" → SNS. דפוס נפוץ: SNS + SQS לfan-out עמיד.

---

**EventBridge** *(פרק 22)*

אוטובוס אירועים לבניית ארכיטקטורות event-driven. מנתב אירועים משירותי AWS, שותפי SaaS ומקורות מותאמים אישית ל-Lambda, SQS, SNS, Step Functions ויעדים אחרים. תומך בכללים מתוזמנים (cron) ובהתאמת דפוסים.

אות בחינה: "נתב אירועים משירותי AWS ליעדים," "תזמן פונקציות Lambda," "תזמור event-driven" → EventBridge.

---

**Step Functions** *(פרק 22)*

תזמור תהליכי עבודה serverless. מתאם פונקציות Lambda, משימות ECS, DynamoDB, SNS, SQS ושירותים אחרים ל-state machines חזותיים. מטפל בניסיונות חוזרים, טיפול בשגיאות, ענפים מקבילים ומצבי המתנה.

מושגי מפתח: state machine, סוגי states (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exactly-once, ממושך) לעומת Express Workflows (at-least-once, נפח גבוה).

אות בחינה: "תאם פונקציות Lambda מרובות," "תהליכי עבודה ממושכים עם לוגיקת ניסיון חוזר," "שלבי אישור אנושיים" → Step Functions.

---

**Kinesis** *(פרק 26)*

זרימת נתונים בזמן אמיתי. Kinesis Data Streams: זרם עמיד ומסודר של רשומות. Kinesis Data Firehose: מסירה מנוהלת ל-S3, Redshift, OpenSearch, Splunk — ללא ניהול צרכן.

מושגי מפתח: Shard (יחידת תפוקה: 1MB/s כתיבה, 2MB/s קריאה), partition key, sequence number, checkpointing, Firehose לעומת Streams.

אות בחינה: "זרימה בזמן אמיתי," "רשומות מסודרות," "replay אירועים" → Kinesis Data Streams. "ספק נתוני זרימה ל-S3/Redshift ללא ניהול צרכנים" → Kinesis Firehose.

---

## אנליטיקה

**Athena** *(פרק 26)*

שאילתות SQL serverless על נתונים המאוחסנים ב-S3. ללא תשתית לניהול. תשלום לפי שאילתה (לפי TB שנסרק). הכי טוב עם פורמטים עמודתיים (Parquet, ORC) ונתונים ממוינים.

אות בחינה: "שאל נתוני S3 עם SQL," "אנליטיקה ad-hoc על אגם נתונים," "ללא ניהול תשתית" → Athena.

---

**Glue** *(פרק 26)*

שירות ETL (Extract, Transform, Load) serverless. Glue Crawlers מגלים נתונים ומעדכנים את Glue Data Catalog. Glue Jobs מריצים טרנספורמציות Spark או Python. Data Catalog מתאם עם Athena, Redshift Spectrum ו-EMR.

אות בחינה: "טרנספורם וטען נתונים לאנליטיקה," "גלה סכמה של נתוני S3," "פייפליין ETL" → Glue.

---

## זמינות גבוהה והתאוששות מאסון

**Multi-AZ ו-Multi-Region** *(פרק 18)*

Multi-AZ: שכפול סינכרוני בתוך אזור לכשל-אוטומטי. RPO ~0, RTO ~60 שניות ל-RDS. Multi-Region: שכפול אסינכרוני ליתירות גיאוגרפית וזמן השהיה נמוך למשתמשים גלובליים.

מושגי מפתח: RTO (Recovery Time Objective), RPO (Recovery Point Objective). אסטרטגיות DR: Pilot Light, Warm Standby, Active-Active.

---

## אופטימיזציית עלות

**מודלי תמחור EC2** *(פרק 27)*

On-Demand: מחיר מלא, ללא התחייבות. Reserved Instances (1 או 3 שנים): 30-72% הנחה לסוג מכונה ספציפי. Savings Plans (Compute או EC2 Instance): הוצאה שעתית מחויבת לגמישות. Spot: 60-90% הנחה לעומסי עבודה ניתנים להפרעה.

---

**תמחור העברת נתונים** *(פרק 30)*

כניסה ל-AWS: חינם. אותה AZ: חינם. בין-AZ: $0.01/GB בכל כיוון. בין-אזורים: $0.02-0.08/GB. אינטרנט (יציאה): ~$0.09/GB. עיבוד NAT Gateway: $0.045/GB. העברת נתונים CloudFront זולה מ-EC2-ישיר-לאינטרנט, ומטמון מפחית נפח כולל.

---

## ניתנות לניטור

**CloudWatch** *(מוזכר לאורך כל הספר)*

ניטור ו-observability. CloudWatch Metrics: נתוני time-series מספריים. CloudWatch Logs: איסוף, חיפוש וניתוח נתוני log. CloudWatch Alarms: הפעל התראות או auto scaling. CloudWatch Dashboards: דמיין מדדים.

---

**CloudTrail** *(מוזכר לאורך כל הספר)*

מתעד כל קריאת API בחשבון AWS שלך: מי ביצע, מאיפה, מתי, ומה הייתה התגובה. Multi-region trail מאחסן לוגים ב-S3 ללא הגבלת זמן.

אות בחינה: "מי מחק את המשאב הזה?" "בקר כל פעילות API" → CloudTrail.

---

## Well-Architected

**ששת העמודים** *(פרק 31)*

| עמוד                   | שאלת ליבה                          | שירותי מפתח                                       |
|------------------------|------------------------------------|---------------------------------------------------|
| מצוינות תפעולית        | האם אנחנו פועלים היטב?             | CloudWatch, CloudTrail, SSM, Config               |
| אבטחה                  | האם אנחנו מוגנים?                  | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| אמינות                 | האם אנחנו מתאוששים מכשלות?        | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| יעילות ביצועים         | האם אנחנו משתמשים במשאבים הנכונים? | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| אופטימיזציית עלות      | האם אנחנו מוציאים בחוכמה?         | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| קיימות                 | האם אנחנו ממזערים השפעה סביבתית?  | Right-sizing, Graviton, מחלקות אחסון יעילות       |

AWS Well-Architected Tool: מעריך ארכיטקטורה כנגד ששת העמודים. השתמש לפני הבחינה להבנת ההיגיון מאחורי שאלות כל עמוד.
