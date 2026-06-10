# נספח א: מדריך מהיר לשירותי AWS

כל שירות המכוסה בספר זה, בסדר ההצגה. השתמשו בזה כחומר עזר ללימוד וכבדיקה מהירה בהכנה לבחינה.

---

## חישוב

**EC2 — Elastic Compute Cloud** *(פרק 4)*

מכונות וירטואליות בענן. אתם בוחרים את סוג המכונה (CPU, זיכרון, אחסון), את מערכת ההפעלה ואת האזור. אתם משלמים לשעה (On-Demand), לפי התחייבות (Reserved Instances / Savings Plans), או לפי משבצת קיבולת פנויה (Spot). פרימיטיב החישוב הבסיסי.

מושגי מפתח: AMI (Amazon Machine Image), סוגי מכונות (משפחות t3, m6g, r6g, c6g), key pairs, instance profiles, placement groups.

אות בחינה: כשתרחיש דורש חישוב מתמשך, stateful, או ארוך-טווח — EC2 או ECS. כשתרחיש דורש חישוב קצר-מועד, מופעל-אירוע, או ללא עלות בזמן סרק — Lambda.

---

**Auto Scaling + Application Load Balancer** *(פרק 7)*

Auto Scaling Groups (ASGs) מוסיפים ומסירים מכונות EC2 על בסיס עומס. Application Load Balancers (ALBs) מפיצים תעבורה על פני מכונות ומנתבים לפי נתיב או host. יחד הם מהווים את שכבת ההתרחבות האופקית.

מושגי מפתח: Launch template, מדיניות התרחבות (target tracking, step, scheduled), health checks, ALB target groups, listener rules, ניתוב משוקלל.

אות בחינה: "טיפול בעומס משתנה" או "זמינות גבוהה על פני AZs" → ASG + ALB.

---

**Lambda** *(פרק 20)*

פונקציות serverless. אתם כותבים קוד; AWS מריץ אותו בתגובה לאירועים. ללא שרתים לניהול. אתם משלמים לפי הפעלה ולפי מילישנייה של ביצוע. מתרחב אוטומטית לאלפי הפעלות בו-זמניות.

מושגי מפתח: מקורות אירועים (API Gateway, S3, SQS, EventBridge, Kinesis), execution role, מגבלות בו-זמניות, בו-זמניות שמורה ומוקצית, cold start, Layers, משך מרבי של 15 דקות.

אות בחינה: "Serverless," "event-driven," "משימות קצרות-מועד," "ללא עלות בזמן סרק" → Lambda.

---

**ECS — Elastic Container Service** *(פרק 21)*

מריץ containers של Docker על AWS. שני סוגי השקה: EC2 (אתם מנהלים את ה-host) ו-Fargate (AWS מנהל את ה-host). ECS מנהל הגדרות משימה, שירותים, תזמון אשכולות ואינטגרציה עם load balancers וגילוי שירותים.

מושגי מפתח: task definition, ECS service, Fargate לעומת EC2 launch type, ECR (registry של containers), task IAM role, service auto scaling.

אות בחינה: "עומסי עבודה ב-containers," "microservices," "Docker על AWS" → ECS (בדרך כלל Fargate ל-containers ללא שרתים).

---

**EKS — Elastic Kubernetes Service** *(פרק 21)*

Kubernetes מנוהל. AWS מריץ את ה-control plane; אתם מריצים את ה-worker nodes (EC2 או Fargate). השתמשו ב-EKS כשהצוות שלכם כבר משתמש ב-Kubernetes או יש לו עומסי עבודה הדורשים תכונות ספציפיות ל-Kubernetes.

אות בחינה: "Kubernetes," "צריך להגר עומסי עבודה קיימים של K8s" → EKS. "רק צריך containers ללא התקורה של K8s" → ECS.

---

**AWS Batch** *(פרק 21)*

חישוב אצווה (batch) מנוהל ל-containers של Docker. אתם מגדירים job (תמונת Docker + פקודה), job queue, וסביבת חישוב (EC2 או Fargate). AWS Batch מקצה ומרחיב את החישוב אוטומטית, ואז מסיים אותו כשה-job מסתיים. תומך ב-Spot Instances להוזלת עלות.

מושגי מפתח: job definition (מה להריץ), job queue (היכן jobs ממתינים), סביבת חישוב (EC2 או Fargate, On-Demand או Spot), array jobs (הרצת עותקים מקבילים רבים של אותו job).

אות בחינה: "עיבוד אצווה החורג מ-timeout של 15 דקות ב-Lambda," "jobs חישוביים סופיים על containers," "עומסי עבודה של HPC על AWS" → AWS Batch.

---

**AWS Outposts** *(פרק 2)*

מדף חומרה מנוהל לחלוטין של AWS המותקן במרכז הנתונים שלכם או במתקן co-location. מריץ את אותם שירותי AWS, APIs וכלים כמו הענן הציבורי (EC2, EBS, RDS, EKS, S3 on Outposts) אך פיזית בתוך הארגון (on-premises).

מושגי מפתח: אותם APIs של AWS בתוך הארגון, AWS מנהל התקנה ותיקונים, הלקוח מספק מקום במדף וחשמל, Local Gateway (LGW) מחבר את Outposts לרשתות הארגון.

אות בחינה: "הרצת AWS במרכז הנתונים שלכם," "תושבות נתונים מחייבת שהחישוב יישאר בתוך הארגון," "APIs של AWS ללא תלות באינטרנט" → Outposts.

---

**AWS Wavelength** *(פרק 2)*

תשתית AWS הפרוסה בתוך רשתות של ספקי תקשורת סלולרית 5G. Wavelength Zones ממוקמים בקצה רשת ה-5G, ומאפשרים השהיה של מילישניות בודדות למכשירים ניידים.

מושגי מפתח: Wavelength Zones הם הרחבות של אזורי AWS בתוך רשתות תקשורת, התעבורה נשארת ברשת המפעיל בין המכשיר ל-Wavelength Zone.

אות בחינה: "השהיה של מילישניות בודדות למשתמשי 5G ניידים," "AR/VR ניידים," "משחקים בזמן אמת בנייד," "טלמטריה של רכב אוטונומי" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(פרק 25)*

שירות הגירה מסוג Rehost (lift-and-shift). סוכן משכפל את דיסקי שרתי המקור בלוק אחר בלוק לאזור staging בעלות נמוכה ב-AWS; אתם משיקים עותקי בדיקה לפי דרישה; ב-cutover, MGN ממיר את השרתים המשוכפלים למכונות EC2 מקוריות. ללא צורך בשינויי אפליקציה.

מושגי מפתח: שכפול רציף ברמת הבלוק, אזור staging, השקות בדיקה לפני cutover, אסטרטגיות ההגירה של "7 ה-Rs" (MGN = rehost).

אות בחינה: "הגר מאות VMs במהירות ללא שינויי קוד," "lift-and-shift של שרתים ל-EC2" → MGN. DataSync מעביר *קבצים*; DMS מעביר *מסדי נתונים*; MGN מעביר *שרתים שלמים*.

---

## אחסון

**S3 — Simple Storage Service** *(פרק 5)*

אחסון עצמים. קיבולת בלתי מוגבלת, עמידות של 99.999999999% (אחת-עשרה תשיעיות). מאחסן קבצים כעצמים בדליים (buckets). דליים חיים באזור. עצמים יכולים לנוע מ-0 בייטים עד 5TB.

מושגי מפתח: bucket policy, object ACL, versioning, אירוח אתרים סטטיים, presigned URLs, multipart upload, Transfer Acceleration, מחלקות אחסון (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, ובנוסף S3 Express One Zone לעומסי עבודה של directory-bucket באזור בודד וקריטיים-להשהיה).

אות בחינה: "אחסן ואחזר קבצים," "נכסים סטטיים," "גיבויים," "אגם נתונים" → S3. מחלקת האחסון הנכונה תלויה בתדירות הגישה ובמהירות האחזור.

---

**EBS — Elastic Block Store** *(פרק 6)*

אחסון בלוקים המחובר למכונת EC2 בודדת. פועל כמו דיסק קשיח. נמשך ללא תלות במחזור חיי המכונה (ניתן לנתק ולחבר מחדש). הסוגים הנפוצים ביותר: gp3 (SSD לשימוש כללי, ברירת המחדל), io2 (IOPS מוקצה למסדי נתונים), st1 (HDD ממוטב-תפוקה לקריאות רציפות).

מושגי מפתח: Snapshots (מצטברים, מאוחסנים ב-S3), הצפנה (KMS), Multi-Attach (io1/io2 בלבד), הקצאת IOPS ותפוקה.

אות בחינה: "אחסון מתמשך ל-EC2," "אחסון מסד נתונים," "דורש גישת בלוקים בהשהיה נמוכה" → EBS.

---

**EFS — Elastic File System** *(פרק 6)*

מערכת קבצים משותפת, נגישה ממכונות EC2 מרובות בו-זמנית. פרוטוקול NFS. מתרחבת אוטומטית. יקרה יותר מ-EBS ל-GB. מחלקות האחסון כוללות Standard, Infrequent Access ו-Archive. Intelligent-Tiering מעביר קבצים אוטומטית.

אות בחינה: "מערכת קבצים משותפת," "מכונות EC2 מרובות צריכות את אותם קבצים," "NFS" → EFS.

---

**משפחת FSx** *(פרק 6)*

שרתי קבצים מנוהלים לטכנולוגיות נקובות. FSx for Windows File Server: פרוטוקול SMB, NTFS, אינטגרציה עם Active Directory, Multi-AZ. FSx for Lustre: מערכת קבצים מקבילית בביצועים גבוהים ל-HPC/ML, מציגה עצמי S3 כקבצים (lazy loading). FSx for NetApp ONTAP: רב-פרוטוקול (NFS + SMB + iSCSI), snapshots, שכפול SnapMirror. FSx for OpenZFS: NFS בהשהיה נמוכה, snapshots מיידיים ו-clones הניתנים לכתיבה.

אות בחינה: "SMB/Active Directory" → FSx for Windows. "אימון HPC/ML על נתוני S3" → FSx for Lustre. "NFS ו-SMB לאותם נתונים / הגירת NetApp" → FSx for ONTAP. "הגירת ZFS / clones מיידיים" → FSx for OpenZFS.

---

**מחלקות אחסון S3 ומדיניות מחזור חיים** *(פרק 23)*

S3 Intelligent-Tiering מעביר אוטומטית עצמים בין שכבות גישה על בסיס תדירות גישה. מדיניות מחזור חיים מעבירה עצמים בין מחלקות (Standard → Standard-IA → Glacier) על בסיס כללי גיל. למחלקות האחסון של Glacier יש עיכוב אחזור הנע מדקות (Glacier Instant) עד 12 שעות (Glacier Deep Archive).

אות בחינה: "הפחת עלויות אחסון לנתונים שניגשים אליהם לעיתים רחוקות" → מדיניות מחזור חיים, Intelligent-Tiering, או Glacier.

---

**AWS Storage Gateway** *(פרק 6)*

שירות אחסון היברידי המחבר סביבות בתוך הארגון לאחסון AWS. מציג אחסון בפרוטוקולים שהאפליקציות כבר מבינות, תוך שמירת הנתונים ב-S3, ב-S3 Glacier, או כ-EBS snapshots.

מושגי מפתח: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, מצב cached או stored), Tape Gateway (ספריית קלטות וירטואלית → Glacier).

אות בחינה: "אפליקציה בתוך הארגון צריכה אחסון ענן ללא שינויי קוד" → Storage Gateway. "החלפת גיבוי בקלטות" → Tape Gateway.

---

**AWS DataSync** *(פרק 25)*

שירות הגירה ושכפול נתונים מבוסס-סוכן. סוכן קל-משקל מתחבר לשרתי קבצים בתוך הארגון דרך NFS או SMB ומסנכרן שיתופים ל-S3, EFS, או FSx — עם תזמון, ויסות רוחב פס ואימות שלמות מובנים.

מושגי מפתח: DataSync agent (VM בתוך הארגון או EC2), מקורות NFS/SMB, יעדי S3/EFS/FSx, העברות מצטברות מתוזמנות.

אות בחינה: "הגר או סנכרן ברציפות מספר גדול של קבצים מ-NAS בתוך הארגון ל-AWS דרך הרשת" → DataSync.

---

**AWS Transfer Family** *(פרק 25)*

שרת SFTP, FTPS ו-FTP מנוהל לחלוטין הנתמך על ידי S3 או EFS כיעד האחסון. לקוחות מתחברים עם תוכנת ה-SFTP הקיימת שלהם; קבצים שהועלו נוחתים ישירות בדלי או במערכת הקבצים.

מושגי מפתח: נקודת קצה מנוהלת (אופציונלית עם IP סטטי), אחסון נתמך של S3 או EFS, תאימות לפרוטוקול קיים עבור שותפים חיצוניים.

אות בחינה: "שותפים חייבים להמשיך להעלות דרך SFTP, אך הקבצים צריכים לנחות ב-S3" → Transfer Family.

---

**AWS Snow Family** *(פרק 25)*

התקני העברת נתונים פיזיים להגירת נתונים בכמויות גדולות במצב לא-מקוון. Snowball Edge Storage Optimized: 80 TB שמישים, מארז מוקשח, נשלח למיקומכם; אתם טוענים את הנתונים מקומית ושולחים אותו בחזרה לקליטה ל-S3.

מושגי מפתח: בצעו את חישוב ההעברה תחילה — אם העברת הרשת תארך בערך שבוע או יותר, התקן פיזי מנצח. *הערת legacy (2026)*: AWS מפסיקה בהדרגה את המשפחה — Snowmobile (2024) ו-Snowcone (סוף 2024) נעלמו, והתקני Snow נסגרו ללקוחות חדשים בנובמבר 2025 (AWS מפנה כעת ל-DataSync ול-Data Transfer Terminals). מאגר השאלות של SAA-C03 קודם לכך, ולכן הבחינה עדיין מצפה ל-Snowball כתשובה.

אות בחינה: "הגירה בקנה מידה של פטה-בייט," "רוחב פס מוגבל, שבועות של זמן העברה" → Snow Family.

---

**AWS Backup** *(פרקים 18 ו-23)*

שירות גיבוי מרכזי, מבוסס-מדיניות, על פני EBS, RDS, DynamoDB, EFS ו-Storage Gateway. תוכניות גיבוי מגדירות לוחות זמנים ושמירה; vaults מאחסנים את נקודות השחזור.

מושגי מפתח: תוכניות גיבוי ו-vaults, העתקים בין-אזוריים ובין-חשבונות, Vault Lock לאי-שינוי (immutability).

אות בחינה: "ריכוז ואוטומציה של גיבויים על פני שירותי AWS מרובים," "העתקי גיבוי בין-חשבונות להגנה מפני ransomware/פריצת חשבון" → AWS Backup.

---

## מסדי נתונים

**RDS — Relational Database Service** *(פרק 8)*

מסדי נתונים רלציוניים מנוהלים. מנועים נתמכים: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server ו-Aurora (המנוע הקנייני של AWS). AWS מטפל בגיבויים, תיקונים, failover ושכפול. אתם מנהלים את תכנון הסכמה, השאילתות וגודל המכונה.

מושגי מפתח: פריסת Multi-AZ (failover אוטומטי, שכפול סינכרוני), Read Replicas (אסינכרוני, להתרחבות קריאות), גיבויים אוטומטיים (שמירה של 1-35 ימים), snapshots ידניים (נשמרים עד למחיקה), RDS Proxy (מאגר חיבורים).

אות בחינה: "מסד נתונים רלציוני," "עסקאות ACID," "עומס SQL קיים" → RDS או Aurora.

---

**Aurora** *(פרק 24)*

מנוע מסד הנתונים הרלציוני של AWS, תואם MySQL ו-PostgreSQL. מנוע אחסון מבוזר המשכפל נתונים על פני 3 AZs ב-6 עותקים. בדרך כלל מהיר פי 5 מ-MySQL. Aurora Serverless v2 מרחיב קיבולת אוטומטית (נמדד ב-ACUs — Aurora Capacity Units), ובגרסאות מנוע נתמכות יכול לבצע auto-pause ל-0 ACUs כשאין חיבורים פתוחים.

מושגי מפתח: Aurora cluster (writer + עד 15 Aurora Replicas מאחורי reader endpoint יחיד), Aurora Global Database (read replicas בין-אזוריים עם lag שכפול של < שנייה אחת), Aurora Serverless v2, ACUs, התנהגות auto-pause/resume.

אות בחינה: "מסד נתונים רלציוני בביצועים גבוהים," "תואם MySQL/PostgreSQL," "קריאות גלובליות," "עומס משתנה" → Aurora.

---

**DynamoDB** *(פרק 9)*

מסד נתונים NoSQL מנוהל לחלוטין. מודל key-value ומסמכים. מתרחב לכל תפוקה עם ביצועים בהשהיה של ספרות בודדות של מילישניות. שני מצבי קיבולת: on-demand (תשלום לפי בקשה) ו-provisioned (תשלום לפי יחידת קיבולת לשעה, עם Auto Scaling).

מושגי מפתח: partition key (חובה), sort key (אופציונלי), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (לכידת שינויי נתונים), DynamoDB Accelerator (DAX) — מטמון בזיכרון, TTL (Time to Live), עסקאות.

אות בחינה: "גישה מבוססת-מפתח בתפוקה גבוהה," "סכמה גמישה," "NoSQL ללא שרתים" → DynamoDB.

---

**ElastiCache** *(פרק 10)*

מטמון מנוהל בזיכרון. שני מנועים: Redis (מתמיד, pub/sub, סקריפטים של Lua, מבני נתונים) ו-Memcached (מטמון טהור, פשוט יותר, מרובה-threads). השתמשו בו להפחתת עומס על מסד הנתונים ולהגשת נתונים שנקראים לעיתים קרובות במיקרו-שניות.

מושגי מפתח: תבנית cache-aside, תבנית write-through, מדיניות eviction, TTL, cluster mode (Redis), Multi-AZ עם failover אוטומטי.

אות בחינה: "הפחת עומס על מסד הנתונים," "השהיית קריאה תת-מילישנייתית," "ניהול sessions," "טבלת מובילים בזמן אמת" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(פרק 10)*

מסד נתונים ראשי עמיד, תואם-Redis, בזיכרון. בניגוד ל-ElastiCache (שהוא מטמון שבו אובדן נתונים קביל), MemoryDB מאחסן יומן עסקאות Multi-AZ ומבטיח עמידות. ניתן להשתמש ב-MemoryDB כמסד הנתונים הראשי שלכם — לא רק כמטמון לפני מסד נתונים אחר.

מושגי מפתח: תאימות API של Redis, יומן עסקאות Multi-AZ (הבטחת עמידות), ביצועים בזיכרון, מסד נתונים ראשי (לא שכבת מטמון).

אות בחינה: "תואם-Redis וגם אובדן נתונים אינו קביל," "מסד נתונים עמיד בזיכרון" → MemoryDB. "Redis כמטמון, אובדן נתונים קביל" → ElastiCache Redis.

---

**מסדי נתונים ייעודיים** *(פרקים 9, 10 ו-24)*

התאימו את צורת הנתונים למנוע. DocumentDB: מסמכים תואמי-MongoDB. Neptune: מסד נתונים גרפי (קשרים, traversals — Gremlin/SPARQL). Keyspaces: wide-column תואם-Cassandra. Timestream: סדרות-זמן (ההיצע הנוכחי: Timestream for InfluxDB). MemoryDB: מסד נתונים *ראשי* עמיד תואם-Redis (לעומת ElastiCache = מטמון). QLDB ("ledger קריפטוגרפי בלתי-משתנה") הופסק ב-2025 — התייחסו אליו כ-distractor legacy.

אות בחינה: "גרף חברתי / המלצות / טבעות הונאה" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "טלמטריית IoT לאורך זמן" → Timestream.

---

**AWS DMS — Database Migration Service** *(פרק 8)*

מהגר מסדי נתונים ל-AWS עם זמן השבתה מינימלי. תומך ב-full load (העתקה ראשונית) בנוסף ל-CDC (Change Data Capture) לשמירת המקור והיעד מסונכרנים בזמן שההגירה רצה. בהגירה בין אותו סוג מנוע (MySQL → MySQL, PostgreSQL → PostgreSQL), השתמשו ב-DMS ישירות. בהגירה בין סוגי מנוע שונים (Oracle → Aurora PostgreSQL), השתמשו תחילה ב-AWS Schema Conversion Tool (SCT) להמרת הסכמה, ואז ב-DMS לנתונים.

מושגי מפתח: replication instance, נקודות קצה של מקור ויעד, full load + CDC, SCT (Schema Conversion Tool) להגירות הטרוגניות.

אות בחינה: "הגר מסד נתונים עם זמן השבתה מינימלי" → DMS. "Oracle ל-Aurora" או כל הגירה הטרוגנית → SCT + DMS. "אותו מנוע, אותו סוג" → DMS ישיר.

---

## רשתות

**VPC — Virtual Private Cloud** *(פרק 11)*

רשת מבודדת בתוך AWS. משתרעת על פני כל ה-AZs באזור. אתם מגדירים את מרחב כתובות ה-IP (בלוק CIDR), יוצרים subnets (ציבוריים או פרטיים), מגדירים route tables, ושולטים בגישה דרך security groups ו-NACLs.

מושגי מפתח: subnet ציבורי (route ל-Internet Gateway), subnet פרטי (route ל-NAT Gateway לתעבורה יוצאת), Internet Gateway (נכנס + יוצא לאינטרנט), NAT Gateway (יוצא בלבד למכונות פרטיות), VPC Peering (חיבור שני VPCs), VPC Endpoints (חיבור לשירותי AWS ללא אינטרנט).

אות בחינה: "רשת פרטית על AWS," "בידוד משאבים מהאינטרנט," "שליטה בתעבורת רשת" → VPC.

---

**Security Groups ו-NACLs** *(פרק 15)*

Security groups הם firewalls stateful ברמת המכונה — כללי allow בלבד, תעבורת חזרה אוטומטית. NACLs (Network Access Control Lists) הם firewalls stateless ברמת ה-subnet — דורשים גם כללים נכנסים וגם יוצאים, מוערכים בסדר לפי מספר כלל.

אות בחינה: "חסום IP ספציפי מגישה ל-subnet" → NACL. "שליטה בתעבורה אל/מ-מכונה" → security group.

---

**Route 53** *(פרק 12)*

שירות ה-DNS ורשם הדומיינים של AWS. מנתב תעבורת אינטרנט למשאבי AWS ולנקודות קצה חיצוניות. מדיניות ניתוב: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue answer.

מושגי מפתח: hosted zones (ציבוריים ופרטיים), סוגי record (A, AAAA, CNAME, Alias), health checks, Traffic Flow (עורך מדיניות ויזואלי — שימו לב ש-geoproximity זמין גם כמדיניות ניתוב ישירה ב-records, עם bias מתכוונן, ללא צורך ב-Traffic Flow).

אות בחינה: "ניתוב DNS," "failover בין אזורים," "ניתוב על בסיס השהיה או מיקום" → Route 53 עם מדיניות הניתוב המתאימה.

---

**CloudFront** *(פרק 13)*

רשת מסירת תוכן (CDN). שומר תוכן במטמון במיקומי edge (750+ נקודות נוכחות ברחבי העולם). מפחית השהיה למשתמשי קצה. מפחית עלויות העברת מקור דרך מטמון. משתלב עם S3, EC2, ALB ו-API Gateway כמקורות.

מושגי מפתח: distribution, מקורות, behaviors (ניתוב מבוסס-נתיב למקורות), TTL (בקרת מטמון), פסילת מטמון, signed URLs ו-cookies (בקרת גישה), Lambda@Edge ו-CloudFront Functions (הרצת קוד ב-edge), Origin Shield (הפחתת עומס על המקור).

אות בחינה: "השהיה נמוכה גלובלית," "מטמון תוכן סטטי," "הפחתת עומס על המקור," "הגנה מפני DDoS עם Shield" → CloudFront.

---

**Direct Connect ו-VPN** *(פרק 25)*

AWS Direct Connect הוא חיבור רשת פיזי ייעודי ממרכז הנתונים שלכם ל-AWS. עוקף את האינטרנט הציבורי. רוחב פס והשהיה עקביים יותר. AWS Site-to-Site VPN הוא מנהרה מוצפנת מעל האינטרנט הציבורי — מהיר יותר להקמה, עלות נמוכה יותר, אך ביצועים משתנים.

מושגי מפתח: Virtual Interface (VIF), Direct Connect Gateway (חיבור למספר אזורים), Transit Gateway (טופולוגיית רשת hub-and-spoke), יתירות מנהרת VPN.

אות בחינה: "חיבור פרטי ייעודי ל-AWS" → Direct Connect. "חיבור מוצפן, הקמה מהירה יותר" → VPN. "חיבור מספר VPCs" → Transit Gateway.

---

**VPC Endpoints** *(פרק 30)*

חיבור משאבים פרטיים לשירותי AWS ללא שימוש באינטרנט הציבורי או ב-NAT Gateway. Gateway Endpoints: חינמיים, זמינים ל-S3 ול-DynamoDB בלבד. Interface Endpoints (PrivateLink): מתומחרים לפי שעה + לפי GB, זמינים לרוב שירותי AWS.

אות בחינה: "EC2 ב-subnet פרטי קורא ל-S3/DynamoDB — הפחת עלויות NAT Gateway" → Gateway Endpoint (חינם). "חיבור פרטי ל-SQS, SSM, Secrets Manager מ-subnet פרטי" → Interface Endpoint.

---

**AWS Client VPN** *(פרק 11)*

נקודת קצה מנוהלת של OpenVPN המאפשרת למכשירים בודדים (laptops, תחנות עבודה) להתחבר באופן מאובטח ל-VPC דרך האינטרנט. אפשרויות אימות: Active Directory, פדרציית SAML 2.0 עם ספק זהויות, או mutual TLS (מבוסס-תעודות). תומך ב-split-tunnel (רק תעבורה ל-VPC עוברת במנהרה) וב-full-tunnel (כל התעבורה מנותבת דרך AWS).

מושגי מפתח: Client VPN endpoint, target network (שיוך subnet של VPC), כללי הרשאה, split-tunnel לעומת full-tunnel.

אות בחינה: "מהנדסים מרוחקים צריכים גישה מאובטחת ל-VPC מהבית," "קישוריות ממכשיר בודד ל-VPC" → Client VPN. ניגוד: Site-to-Site VPN = רשת-לרשת. Client VPN = מכשיר-לרשת.

---

**Network Load Balancer (NLB) ו-Gateway Load Balancer (GWLB)** *(פרק 7)*

NLB פועל ב-Layer 4 (TCP/UDP/TLS): ללא בדיקת HTTP, רק ניתוב חבילות במהירות קיצונית — מיליוני בקשות לשנייה, עם IP סטטי לכל AZ ושימור IP מקור. GWLB פועל ב-Layer 3 וקיים למטרה אחת: הכנסת appliances וירטואליים של צד שלישי (firewalls, IDS/IPS, deep packet inspection) inline לזרימות תעבורה.

מושגי מפתח: NLB = Layer 4, IPs סטטיים, השהיה נמוכה במיוחד, פרוטוקולים שאינם HTTP. GWLB = Layer 3, אנקפסולציית GENEVE, צי appliances מאחורי נקודת כניסה אחת. ALB = Layer 7 (ניתוב נתיב/host).

אות בחינה: "מיליוני בקשות TCP לשנייה," "IP סטטי ל-load balancer," "שימור IP מקור" → NLB. "הכנסת appliances אבטחה של צד שלישי לנתיב התעבורה" → GWLB.

---

**AWS Global Accelerator** *(פרק 25)*

מנתב תעבורת משתמשים אל ה-backbone הגלובלי הפרטי של AWS במיקום ה-edge הקרוב ביותר, במקום לחצות את האינטרנט הציבורי. מספק שתי כתובות IP סטטיות מסוג Anycast המשמשות חזית ל-ALBs, NLBs, או מכונות EC2 באזור אחד או יותר. משפר השהיה ועקביות עבור תעבורה *דינמית* (שאינה ניתנת למטמון).

מושגי מפתח: IPs סטטיים מסוג Anycast, כניסה ל-edge אל ה-backbone של AWS, failover אזורי מבוסס-health-check בשניות, endpoint groups עם traffic dials.

אות בחינה: "משתמשים גלובליים, תעבורה דינמית/שאינה HTTP, IP סטטי, failover אזורי מהיר" → Global Accelerator. "תוכן הניתן למטמון/סטטי" → CloudFront במקום.

---

## אבטחה וזהות

**IAM — Identity and Access Management** *(פרקים 3 ו-14)*

שולט מי יכול לעשות מה בחשבון ה-AWS שלכם. Users (אישורים ארוכי-טווח), Groups (משתמשים החולקים הרשאות), Roles (אישורים זמניים לשירותים ולגישה בין-חשבונות), Policies (מסמכי JSON המגדירים כללי allow/deny).

מושגי מפתח: Principal, Action, Resource, Condition, explicit deny > explicit allow > implicit deny, SCP (Service Control Policy ב-AWS Organizations), Permission boundary, AssumeRole.

אות בחינה: IAM מעורב בכל שאלת אבטחה. תבנית מפתח: שירותים משתמשים ב-IAM roles (לא ב-users). גישה בין-חשבונות משתמשת בנטילת role. הרשאות מינימליות — הענק רק את הנדרש.

---

**KMS — Key Management Service** *(פרק 16)*

שירות מנוהל של מפתחות הצפנה. יוצר, מאחסן ושולט במפתחות קריפטוגרפיים. Customer-managed keys (CMKs) מאפשרים לכם להגדיר rotation, שימוש ומדיניות גישה. AWS-managed keys מנוהלים אוטומטית.

מושגי מפתח: key policy (נפרדת ממדיניות IAM), Envelope encryption (נתונים מוצפנים עם data key; data key מוצפן עם CMK), rotation אוטומטי של מפתחות, Multi-region keys, Grants.

אות בחינה: "הצפן נתונים בזמן השהיה," "מפתחות הצפנה בניהול הלקוח," "rotation של מפתחות" → KMS.

---

**Secrets Manager** *(פרק 16)*

מאחסן ומבצע rotation אוטומטי לערכים רגישים: אישורי מסד נתונים, מפתחות API, OAuth tokens. משתלב עם RDS ל-rotation אוטומטי של סיסמאות. אפליקציות מאחזרות secrets בזמן ריצה דרך API — לעולם אל תקודדו אישורים בקשיחות (hardcode).

אות בחינה: "אחסן ובצע rotation לאישורי מסד נתונים," "הימנע מ-secrets מקודדים בקשיחות" → Secrets Manager. "אחסן ערכי תצורה, לא secrets" → Parameter Store (SSM).

---

**AWS Shield** *(פרק 17)*

הגנת DDoS. Shield Standard אוטומטי וחינמי — מגן מפני התקפות נפח ופרוטוקול נפוצות. Shield Advanced מוסיף הגנה פיננסית, צוות תגובת DDoS 24/7, ונראות מפורטת של התקפות.

אות בחינה: "הגן מפני DDoS" → Shield Standard (אוטומטי) או Shield Advanced (ארגוני, עם SLA).

---

**WAF — Web Application Firewall** *(פרק 17)*

מסנן תעבורת HTTP/HTTPS על בסיס כללים: חסימות IP, מגבלות קצב, תבניות SQL injection, תבניות XSS, הגבלות גיאוגרפיות, כללים מותאמים אישית. מתחבר ל-CloudFront, ALB, API Gateway, או AppSync.

אות בחינה: "חסום כתובות IP ספציפיות," "מנע SQL injection ב-edge," "הגבל קצב קריאות API" → WAF.

---

**GuardDuty** *(פרק 17)*

שירות זיהוי איומים. מנתח logs של CloudTrail, VPC Flow Logs ו-DNS logs באמצעות ML ומודיעין איומים. מזהה פעילות API חריגה, תקשורת עם IPs זדוניים ידועים, אישורים שנפרצו.

אות בחינה: "זהה פעילות חריגה," "זהה אישורי IAM שנפרצו," "ניטור איומים רציף" → GuardDuty.

---

**Amazon Inspector** *(פרק 17)*

שירות הערכת פגיעויות אוטומטי. סורק ברציפות מכונות EC2, תמונות containers של Amazon ECR ופונקציות Lambda לאיתור פגיעויות תוכנה (CVEs) וחשיפת רשת בלתי-מכוונת. הממצאים נשלחים ל-AWS Security Hub לניהול מרכזי.

מושגי מפתח: סריקת CVE, הערכה רציפה (לא חד-פעמית), כיסוי EC2 + ECR + Lambda, אינטגרציה עם Security Hub.

אות בחינה: "סרוק אוטומטית EC2 לאיתור פגיעויות ידועות," "סריקת CVE לתמונות containers," "הערכת פגיעויות רציפה" → Inspector.

---

**Amazon Cognito** *(פרק 14)*

אימות מנוהל למשתמשי הקצה של האפליקציה שלכם — ספריית משתמשים שאינכם צריכים לבנות. User Pools מטפלים בהרשמה, התחברות, MFA, איפוס סיסמה וספקי זהות חברתיים (Google, Facebook, כל ספק OIDC), ומנפיקים JWTs שהאפליקציה שלכם מאמתת. Identity Pools מחליפים את ה-tokens הללו באישורי AWS זמניים.

מושגי מפתח: User Pool (אימות, JWTs) לעומת Identity Pool (אישורי AWS זמניים), hosted UI, פדרציית social/OIDC/SAML, Cognito authorizer של API Gateway.

אות בחינה: "אפליקציה צריכה הרשמה/התחברות של משתמשים," "התחברות חברתית," "תן למשתמשי אפליקציה ניידת גישה זמנית למשאבי AWS" → Cognito. ניגוד: IAM מיועד למהנדסים ולשירותים שלכם; Cognito מיועד ללקוחות שלכם.

---

**AWS Certificate Manager (ACM)** *(פרק 16)*

מספק תעודות TLS/SSL ציבוריות חינמיות לשירותים מנוהלים של AWS (ALB, CloudFront, API Gateway) ומטפל בכל מחזור החיים — ללא לוח חידושים, ללא טיפול במפתחות פרטיים. מחדש אוטומטית דרך אימות DNS.

מושגי מפתח: אימות DNS לעומת email, חידוש אוטומטי, תעודות ל-CloudFront חייבות להיות ב-us-east-1, תעודות ציבוריות חינמיות אינן ניתנות לייצוא (אפשרות בתשלום הניתנת לייצוא קיימת מאז 2025).

אות בחינה: "HTTPS על load balancer או CDN," "חידוש תעודה אוטומטי" → ACM.

---

**Amazon Macie** *(פרק 17)*

גילוי נתונים רגישים ל-S3. משתמש בלמידת מכונה והתאמת תבניות לאיתור PII (שמות, מספרי כרטיסים, אישורים) בדליים ומסמן סיכוני גישה כמו חשיפה ציבורית. משלים את GuardDuty: GuardDuty צופה בהתנהגות; Macie מבקר מה מאוחסן.

מושגי מפתח: מזהי נתונים מנוהלים (תבניות PII), טווח S3 בלבד, ממצאים ל-Security Hub/EventBridge.

אות בחינה: "גלה PII ב-S3," "זהה חשיפת נתונים רגישים" → Macie.

---

**AWS Control Tower** *(פרק 14)*

מבצע אוטומציה של הקמה וממשל של סביבה מרובת-חשבונות. יוצר landing zone — חשבונות ניהול, ארכיון logs, וביקורת המחווטים מראש עם Organizations, CloudTrail, Config ו-guardrails — בדקות במקום ימים של חיווט ידני.

מושגי מפתח: landing zone, guardrails (preventive = SCPs, detective = כללי Config), Account Factory לחשבונות חדשים סטנדרטיים.

אות בחינה: "הקם ונהל סביבה חדשה מרובת-חשבונות עם שיטות עבודה מומלצות אוטומטית" → Control Tower. ניגוד: Organizations הוא אבן הבניין הגולמית; Control Tower הוא ההרכבה האוטומטית.

---

## הודעות ועיבוד אירועים

**SQS — Simple Queue Service** *(פרק 19)*

תור הודעות מנוהל. מפיקים שולחים הודעות; צרכנים קוראים ומוחקים אותן. מנתק שירותים: השולח אינו צריך לדעת אם המקבל זמין. תורים Standard: מסירה לפחות-פעם-אחת, סדר best-effort. תורים FIFO: עיבוד בדיוק-פעם-אחת, סדר קפדני.

מושגי מפתח: Visibility timeout (הודעה מוסתרת מצרכנים אחרים בזמן עיבוד), Dead Letter Queue (DLQ) להודעות שנכשלות שוב ושוב, שמירת הודעות (4 ימים ברירת מחדל, עד 14), Long polling (הפחתת תגובות ריקות), payload מרבי של 256KB כברירת מחדל (ניתן להעלאה ל-1 MiB מאז 2025; ל-payloads גדולים יותר, ה-Extended Client Library מאחסן את הגוף ב-S3).

אות בחינה: "נתק שירותים," "חצוץ בקשות במהלך קפיצות עומס," "עיבוד אסינכרוני" → SQS. "הסדר חשוב ובדיוק-פעם-אחת נדרש" → SQS FIFO.

---

**SNS — Simple Notification Service** *(פרק 19)*

שירות pub/sub מנוהל. מפרסמים שולחים הודעה ל-topic; כל המנויים מקבלים עותק. תבנית fan-out: הודעה אחת → צרכנים רבים. פרוטוקולים: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push.

מושגי מפתח: topic, subscription, תבנית fan-out (SNS → תורי SQS מרובים), סינון הודעות (מנויים מקבלים רק הודעות תואמות).

אות בחינה: "שלח התראות לנקודות קצה מרובות בו-זמנית," "פזר אירוע יחיד לצרכנים מרובים" → SNS. תבנית נפוצה: SNS + SQS ל-fan-out עמיד.

---

**EventBridge** *(פרק 22)*

event bus לבניית ארכיטקטורות מונחות-אירועים. מנתב אירועים משירותי AWS, שותפי SaaS ומקורות מותאמים ל-Lambda, SQS, SNS, Step Functions ויעדים אחרים. תומך בכללים מתוזמנים (cron) ובהתאמת תבניות.

אות בחינה: "נתב אירועים משירותי AWS ליעדים," "תזמן פונקציות Lambda," "תזמור מונחה-אירועים" → EventBridge.

---

**Step Functions** *(פרק 22)*

תזמור workflow ללא שרתים. מתאם פונקציות Lambda, משימות ECS, DynamoDB, SNS, SQS ושירותים אחרים למכונות מצב ויזואליות. מטפל ב-retries, טיפול בשגיאות, ענפים מקבילים ומצבי המתנה.

מושגי מפתח: state machine, סוגי state (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (בדיוק-פעם-אחת, ארוכי-טווח) לעומת Express Workflows: אסינכרוניים (לפחות-פעם-אחת, נפח גבוה — תכננו משימות להיות idempotent) וסינכרוניים (לכל-היותר-פעם-אחת, מחזירים תוצאה ישירות כמו קריאת API).

אות בחינה: "תזמר מספר פונקציות Lambda," "workflows ארוכי-טווח עם לוגיקת retry," "שלבי אישור אנושי" → Step Functions.

---

**Kinesis** *(פרק 26)*

הזרמת נתונים בזמן אמת. Kinesis Data Streams: זרם רשומות עמיד ומסודר (כמו commit log מבוזר). צרכנים מעבדים רשומות; נתונים נשמרים 24 שעות (ברירת מחדל) עד 365 ימים (עם Extended Data Retention). Amazon Data Firehose (לשעבר Kinesis Data Firehose): מסירה מנוהלת לחלוטין ל-S3, Redshift, OpenSearch, Splunk — ללא צורך בניהול צרכנים.

מושגי מפתח: Shard (יחידת תפוקה: 1MB/s כתיבה, 2MB/s קריאה), partition key (קובע שיוך shard), sequence number, checkpointing (KCL או Lambda), Firehose לעומת Streams.

אות בחינה: "הזרמה בזמן אמת," "רשומות מסודרות," "השמעת אירועים מחדש" → Kinesis Data Streams. "מסור נתוני הזרמה ל-S3/Redshift ללא ניהול צרכנים" → Amazon Data Firehose (שאלות ישנות יותר עשויות לומר "Kinesis Data Firehose"). "SQL על נתוני הזרמה" → Amazon Managed Service for Apache Flink (לשעבר Kinesis Data Analytics). ניגוד עם SQS: Kinesis שומר ומשמיע מחדש; SQS מוחק בעת צריכה.

---

**Amazon MQ** *(פרק 19)*

שירות message broker מנוהל התומך ב-Apache ActiveMQ וב-RabbitMQ. תומך בפרוטוקולי הודעות סטנדרטיים בתעשייה: AMQP, STOMP, MQTT, OpenWire ו-WebSocket. מקרה השימוש העיקרי הוא הגירת lift-and-shift של עומסי broker הודעות בתוך הארגון — אפליקציות שכבר משתמשות ב-ActiveMQ או ב-RabbitMQ יכולות להתחבר ללא שינויי קוד.

מושגי מפתח: בחירת מנוע ActiveMQ לעומת RabbitMQ, תמיכת פרוטוקול (AMQP/STOMP/MQTT), תצורת broker של מכונה בודדת או active/standby ל-HA.

אות בחינה: "הגר ActiveMQ או RabbitMQ בתוך הארגון ל-AWS ללא שינוי קוד האפליקציה" → Amazon MQ. "הודעות AWS-native משדה חדש (greenfield)" → SQS או SNS (פשוטים יותר, ניתנים יותר להתרחבות).

---

## אנליטיקה

**Athena** *(פרק 26)*

שאילתות SQL ללא שרתים על נתונים המאוחסנים ב-S3. ללא תשתית לניהול. תשלום לפי שאילתה (לפי TB שנסרק). מיטבי עם פורמטים עמודיים (Parquet, ORC) ונתונים מחולקים-מחיצות.

אות בחינה: "שאל נתוני S3 עם SQL," "אנליטיקה אד-הוק על אגם נתונים," "ללא ניהול תשתית" → Athena.

---

**Glue** *(פרק 26)*

שירות ETL (Extract, Transform, Load) ללא שרתים. Glue Crawlers מגלים נתונים ומעדכנים את ה-Glue Data Catalog. Glue Jobs מריצים טרנספורמציות Spark או Python. ה-Data Catalog משתלב עם Athena, Redshift Spectrum ו-EMR.

אות בחינה: "הפוך וטען נתונים לאנליטיקה," "גלה את הסכמה של נתוני S3," "צינור ETL" → Glue.

---

**Amazon QuickSight** *(פרק 26)*

שירות מנוהל של business intelligence וויזואליזציית נתונים. משתמש ב-SPICE (Super-fast, Parallel, In-memory Calculation Engine), מנוע בזיכרון השומר נתונים מיובאים במטמון לעיבוד מהיר של dashboards. מתחבר ל-Athena, S3, Redshift, RDS ומקורות נתונים אחרים של AWS. ללא שרת BI לניהול.

מושגי מפתח: SPICE (מנוע בזיכרון), datasets, analyses, dashboards, ML Insights (זיהוי חריגות, חיזוי), אבטחה ברמת השורה וברמת העמודה.

אות בחינה: "dashboard של BI על AWS ללא ניהול שרת," "ויזואליזציה של נתונים מ-Athena או Redshift" → QuickSight.

---

**AWS Lake Formation** *(פרק 26)*

שכבת בקרת גישה מרכזית לאגם נתונים מעל S3 ו-Glue Data Catalog. מספקת הרשאות עדינות ברמת הטבלה, העמודה והשורה — עדינות יותר ממדיניות דלי S3 בלבד. מפשטת הקמה של אגם נתונים מאובטח: Lake Formation מטפל במודל ההרשאות; Glue מטפל בקטלוג; S3 מחזיק את הנתונים.

מושגי מפתח: הרשאות אגם נתונים (ברמת טבלה/עמודה/שורה), אינטגרציה עם Glue Data Catalog, LF-tags לבקרת גישה מבוססת-תכונות, grant/revoke מרכזי לשאילתות Athena ו-Redshift Spectrum.

אות בחינה: "בקרת גישה עדינה על אגם נתונים," "אבטחה ברמת העמודה או השורה על נתוני S3" → Lake Formation.

---

## זמינות גבוהה והתאוששות מאסון

**Multi-AZ ו-Multi-Region** *(פרק 18)*

Multi-AZ: שכפול סינכרוני בתוך אזור ל-failover אוטומטי (RDS Multi-AZ, load balancer על פני AZs). RPO ~0, RTO ~60 שניות ל-RDS. Multi-Region: שכפול אסינכרוני ליתירות גיאוגרפית ולהשהיה נמוכה יותר למשתמשים גלובליים.

מושגי מפתח: RTO (Recovery Time Objective — כמה זמן להתאוששות), RPO (Recovery Point Objective — כמה נתונים ניתן לאבד). אסטרטגיות DR של Pilot Light, Warm Standby, Active-Active.

אות בחינה: הבחינו בין כשלים ברמת ה-AZ (Multi-AZ מטפל) לבין כשלים אזוריים (Multi-Region מטפל). העלות והמורכבות גדלות משמעותית עם Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(פרק 18)*

התאוששות מאסון מנוהלת לשרתים (בתוך הארגון או EC2). משכפל ברציפות שרתי מקור בלוק אחר בלוק לאזור staging בעלות נמוכה ומשיק מכונות שחזור מלאות בדקות בעת הצורך — pilot light מנוהל: זמני שחזור קרובים ל-warm-standby במחירים קרובים ל-backup-and-restore.

מושגי מפתח: שכפול רציף ברמת הבלוק, אזור staging בעלות נמוכה, השקת שחזור לפי דרישה, שחזור לנקודת זמן.

אות בחינה: "מזער זמן השבתה ואובדן נתונים לעומסי עבודה מבוססי-שרת עם שירות DR מנוהל," "pilot light ללא בנייה עצמית" → DRS.

---

## אופטימיזציית עלויות

**מודלי תמחור EC2** *(פרק 27)*

On-Demand: מחיר מלא, ללא התחייבות. Reserved Instances (שנה או 3 שנים): הנחה של 30-72% לסוג מכונה ספציפי. Savings Plans (Compute או EC2 Instance): התחייבות להוצאה שעתית לגמישות. Spot: 60-90% הנחה לעומסי עבודה שניתן להפסיק.

אות בחינה: "מזער עלות לעומס עבודה צפוי" → Savings Plans או Reserved Instances. "עיבוד אצווה עמיד-בכשלים" → Spot. "בלתי צפוי או קצר-טווח" → On-Demand.

---

**תמחור העברת נתונים** *(פרק 30)*

נכנס ל-AWS: חינם. אותו AZ: חינם. Cross-AZ: ‎$0.01/GB בכל כיוון. Cross-region: ‎$0.02-0.08/GB. אינטרנט (יוצא): ~‎$0.09/GB. עיבוד NAT Gateway: ‎$0.045/GB. העברת נתונים של CloudFront זולה יותר מ-EC2-לאינטרנט ישיר, ומטמון מפחית את הנפח הכולל.

אות בחינה: "הפחת עלויות העברת נתונים ל-S3/DynamoDB מ-subnet פרטי" → Gateway Endpoints (חינם). "הפחת עלויות NAT Gateway לשירותים אחרים" → Interface Endpoints.

---

## נראות (Observability)

**CloudWatch** *(מוזכר לאורך הספר)*

ניטור ונראות. CloudWatch Metrics: נתוני סדרות-זמן מספריים משירותי AWS ומאפליקציות מותאמות. CloudWatch Logs: איסוף, חיפוש וניתוח נתוני log. CloudWatch Alarms: הפעלת התראות או auto scaling על בסיס ספי metric. CloudWatch Dashboards: ויזואליזציה של metrics.

מושגי מפתח: ממדי metric, תקופות שמירה, log groups ו-log streams, metric filters, CloudWatch Agent (ל-metrics ו-logs ברמת מערכת ההפעלה מ-EC2), Container Insights.

---

**CloudTrail** *(מוזכר לאורך הספר)*

רושם כל קריאת API שבוצעה בחשבון ה-AWS שלכם: מי ביצע אותה, מהיכן, מתי, ומה הייתה התגובה. trail מרובה-אזורים מאחסן logs ב-S3 ללא הגבלת זמן. משמש לביקורת אבטחה, ציות וחקירת אירועים.

אות בחינה: "מי מחק את המשאב הזה?" "בקר את כל פעילות ה-API" → CloudTrail.

---

**X-Ray** *(פרק 20)*

מעקב מבוזר: עוקב אחרי בקשות בודדות על פני שירותים (traces → segments → subsegments), בונה מפת שירותים עם השהיה וקצבי שגיאה לכל hop. דגימה שומרת על תקורה נמוכה; annotations הופכים traces לניתנים לחיפוש. Active tracing מופעל ב-stages של Lambda ו-API Gateway.

אות בחינה: "עקוב אחרי בקשות על פני microservices," "מצא את צוואר הבקבוק בין שירותים" → X-Ray (לא CloudWatch, לא CloudTrail).

---

**AWS Config** *(מוזכר בפרק 31)*

עוקב אחרי שינויי תצורת משאבים לאורך זמן. מעריך משאבים מול כללי ציות. רושם את ההיסטוריה של כל שינוי תצורה לכל משאב. משתלב עם Systems Manager לתיקון.

אות בחינה: "האם המשאב הזה תואם למדיניות האבטחה שלנו?" "כיצד נראתה תצורת המשאב הזה בשבוע שעבר?" → AWS Config.

---

## Well-Architected

**ששת העמודים** *(פרק 31)*

| עמוד                   | שאלה מרכזית                              | שירותים מרכזיים                                    |
|------------------------|-----------------------------------------|---------------------------------------------------|
| Operational Excellence | האם אנו פועלים היטב?                     | CloudWatch, CloudTrail, SSM, Config               |
| Security               | האם אנו מוגנים?                          | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Reliability            | האם אנו מתאוששים מכשל?                   | Multi-AZ, Route 53 failover, backup/restore, SQS  |
| Performance Efficiency | האם אנו משתמשים במשאבים הנכונים?         | Right-sizing, Auto Scaling, CloudFront, Kinesis   |
| Cost Optimization      | האם אנו מוציאים בתבונה?                  | Savings Plans, Spot, S3 lifecycle, VPC Endpoints  |
| Sustainability         | האם אנו ממזערים השפעה סביבתית?           | Right-sizing, Graviton, שכבות אחסון יעילות         |

AWS Well-Architected Tool: מעריך את הארכיטקטורה שלכם מול ששת העמודים. השתמשו בו לפני הבחינה כדי להבין את ההיגיון מאחורי השאלות של כל עמוד.
