# נספח ב: מפת התחומים של SAA-C03

בחינת AWS Solutions Architect Associate (SAA-C03) מאורגנת לארבעה תחומים. נספח זה ממפה כל פרק בספר לתחום ולמשימה הרלוונטיים, כדי שתוכלו ללמוד לפי תחום בחינה ולא לפי סדר הפרקים.

---

## סקירת התחומים

| תחום                                           | משקל   | תיאור                                                  |
|------------------------------------------------|--------|--------------------------------------------------------|
| תחום 1: Design Secure Architectures            | 30%    | IAM, אבטחת רשת, הגנת נתונים                             |
| תחום 2: Design Resilient Architectures         | 26%    | זמינות גבוהה, סבילות-תקלות, התאוששות מאסון             |
| תחום 3: Design High-Performing Architectures   | 24%    | ביצועי חישוב, אחסון, מסד נתונים ורשת                    |
| תחום 4: Design Cost-Optimized Architectures    | 20%    | מודלי תמחור, ניהול עלויות, אופטימיזציית משאבים          |

---

## תחום 1: Design Secure Architectures (30%)

**משימה 1.1 — תכנון גישה מאובטחת למשאבי AWS**

מושגי ליבה: IAM users, groups, roles, policies. עקרון ההרשאות המינימליות. גישה בין-חשבונות. service roles. SCP (Service Control Policies) ב-AWS Organizations.

| פרק        | נושא                                                                          |
|------------|------------------------------------------------------------------------------|
| פרק 3      | יסודות IAM: users, groups, roles, policies, הערכת מדיניות                     |
| פרק 14     | IAM מתקדם: roles לשירותים, permission boundaries, roles בין-חשבונות           |
| פרק 3      | לוגיקת הערכת מדיניות: explicit deny > explicit allow > implicit deny          |
| פרק 14     | AWS Organizations, SCPs, Control Tower, Account Factory                       |
| פרק 14     | Cognito: User Pools (התחברות אפליקציה, JWTs) ו-Identity Pools (אישורי AWS זמניים) |

תבניות מפתח בבחינה:

- "EC2 צריך גישה ל-S3 ללא אישורים מקודדים בקשיחות" → IAM role עם מדיניות S3 מחוברת ל-EC2 instance profile
- "חשבונות שונים צריכים לחלוק משאבים" → IAM role עם trust policy בין-חשבונות
- "מנע מכל ה-IAM users ב-OU גישה לשירות" → SCP ב-AWS Organizations

---

**משימה 1.2 — תכנון עומסי עבודה ואפליקציות מאובטחים**

מושגי ליבה: תכנון VPC, security groups לעומת NACLs, בידוד רשת, הגנת DDoS, WAF, GuardDuty.

| פרק        | נושא                                                                                        |
|------------|--------------------------------------------------------------------------------------------|
| פרק 11     | תכנון VPC: subnets ציבוריים/פרטיים, NAT Gateway, Internet Gateway, route tables             |
| פרק 15     | Security groups (stateful, ברמת המכונה) לעומת NACLs (stateless, ברמת ה-subnet)              |
| פרק 17     | Shield (DDoS), WAF (firewall לאפליקציות), GuardDuty (זיהוי איומים), Inspector (סריקת CVE)   |
| פרק 17     | Macie: גילוי נתונים רגישים ב-S3 (PII, אישורים)                                              |
| פרק 25     | Direct Connect, VPN, Transit Gateway, PrivateLink                                           |

תבניות מפתח בבחינה:

- "חסום IP ספציפי מה-subnet" → כלל deny ב-NACL
- "אפשר HTTP נכנס, אפשר אוטומטית תגובת HTTP יוצאת" → Security group (stateful)
- "הגן על אפליקציית web מ-SQL injection" → WAF עם כלל SQL injection
- "זהה אישורי IAM שנפרצו" → GuardDuty

---

**משימה 1.3 — קביעת בקרות אבטחת נתונים מתאימות**

מושגי ליבה: הצפנה בזמן השהיה ובמעבר, KMS, Secrets Manager, Parameter Store, הצפנה בצד-השרת של S3.

| פרק        | נושא                                                                     |
|------------|--------------------------------------------------------------------------|
| פרק 16     | KMS: customer-managed keys, rotation של מפתחות, envelope encryption       |
| פרק 16     | Secrets Manager: rotation אוטומטי של אישורים, אחזור secret בזמן ריצה      |
| פרק 16     | ACM (AWS Certificate Manager): תעודות SSL/TLS ל-ALB, CloudFront           |
| פרק 5      | אפשרויות הצפנת S3: SSE-S3, SSE-KMS, SSE-C                                  |
| פרק 8      | הצפנת RDS בזמן השהיה (חייבת להיות מופעלת בעת היצירה)                       |

תבניות מפתח בבחינה:

- "בצע rotation לאישורי מסד נתונים אוטומטית" → Secrets Manager עם אינטגרציית RDS
- "שלוט מי יכול להשתמש במפתחות הצפנה על פני חשבונות" → KMS key policy
- "אחסן ערכי תצורה שאינם secret" → SSM Parameter Store (לא Secrets Manager)
- "הצפן עצמי S3 עם מפתחות בניהול החברה" → SSE-KMS עם CMK

---

## תחום 2: Design Resilient Architectures (26%)

**משימה 2.1 — תכנון ארכיטקטורות ניתנות-להתרחבות ומנותקות-באופן-רופף**

מושגי ליבה: Auto Scaling, load balancers, ניתוק SQS/SNS, Lambda event triggers, ECS/EKS, Step Functions.

| פרק        | נושא                                                              |
|------------|--------------------------------------------------------------------|
| פרק 7      | Auto Scaling Groups, Application Load Balancer, מדיניות התרחבות   |
| פרק 19     | SQS (ניתוק עם תורים), SNS (התראות fan-out)                        |
| פרק 20     | Lambda: חישוב ללא שרתים, event triggers, בו-זמניות                |
| פרק 20     | API Gateway: APIs מנוהלים מסוג REST/HTTP/WebSocket, עצמאי או + Lambda |
| פרק 21     | ECS ו-EKS: microservices ב-containers                            |
| פרק 22     | Step Functions: תזמור workflow                                    |
| פרק 26     | Kinesis: הזרמת נתונים בזמן אמת                                    |

תבניות מפתח בבחינה:

- "נתק עיבוד הזמנות מעדכון מלאי" → תור SQS בין שירותים
- "הודע למספר שירותים כשהזמנה חדשה מתבצעת" → SNS topic עם subscriptions של SQS (fan-out)
- "עבד העלאות S3 אוטומטית" → S3 event notification → Lambda
- "הרץ workflow מרובה-שלבים עם לוגיקת retry" → Step Functions

---

**משימה 2.2 — תכנון ארכיטקטורות זמינות-גבוה ו/או סבילות-תקלות**

מושגי ליבה: Multi-AZ, Multi-Region, Route 53 failover, RDS read replicas, Aurora Global Database, backup and restore.

| פרק        | נושא                                                                                        |
|------------|----------------------------------------------------------------------------------------------|
| פרק 2      | תשתית גלובלית של AWS: Regions, AZs, edge locations                                           |
| פרק 7      | ALB על פני AZs מרובים, ASG מחליף מכונות לא-תקינות                                            |
| פרק 8      | RDS Multi-AZ: שכפול סינכרוני, failover אוטומטי                                              |
| פרק 12     | Route 53: failover routing, latency routing, health checks                                   |
| פרק 18     | Multi-AZ לעומת Multi-Region: RTO/RPO, אסטרטגיות DR (pilot light, warm standby, active-active) |
| פרק 18     | AWS Backup (גיבויים מרכזיים, בין-חשבונות), Elastic Disaster Recovery (pilot light מנוהל)    |
| פרק 24     | Aurora Global Database: read replicas בין-אזוריים, lag שכפול של < שנייה                      |

תבניות מפתח בבחינה:

- "failover אוטומטי אם RDS הראשי נכשל" → RDS Multi-AZ (לא Read Replica)
- "הגש קריאות גלובלית בהשהיה נמוכה" → Aurora Global Database
- "נתב תעבורה לאזור משני אם הראשי אינו זמין" → Route 53 עם Failover routing + health checks
- "RTO של דקה אחת, RPO של 0" → פריסת Multi-AZ (לא Multi-Region)
- "RTO של 15 דקות, בין-אזורי" → אסטרטגיית Pilot Light

---

## תחום 3: Design High-Performing Architectures (24%)

**משימה 3.1 — קביעת פתרונות אחסון בעלי-ביצועים-גבוהים ו/או ניתנים-להתרחבות**

מושגי ליבה: S3 לעומת EBS לעומת EFS, בחירת מחלקת אחסון, S3 Transfer Acceleration, multipart upload, CloudFront לנכסים.

| פרק        | נושא                                                                   |
|------------|-------------------------------------------------------------------------|
| פרק 5      | S3: אחסון עצמים, מחלקות אחסון, versioning, lifecycle                     |
| פרק 6      | EBS: סוגי אחסון בלוקים (gp3, io2, st1), EFS: אחסון קבצים משותף           |
| פרק 6      | Storage Gateway: גשר היברידי מהארגון ל-S3 (File, Volume, Tape)          |
| פרק 23     | מעברי מחלקות אחסון S3, אפשרויות אחזור של Glacier                         |
| פרק 25     | DataSync (סנכרון קבצים מקוון), Transfer Family (SFTP→S3 מנוהל), Snow Family (העברה לא-מקוונת בכמויות גדולות — legacy: נסגרה ללקוחות חדשים בנובמבר 2025; AWS מפנה כעת ל-DataSync ול-Data Transfer Terminals), MGN (rehost של שרתים) |
| פרק 28     | right-sizing של EBS, הגירת gp2→gp3, ניהול snapshots                     |

תבניות מפתח בבחינה:

- "מערכת קבצים משותפת נגישה ממכונות EC2 מרובות" → EFS (לא EBS; EBS מתחבר למכונה אחת)
- "IOPS גבוה לעומס מסד נתונים" → io2 EBS
- "הפחת עלות לקבצים שלא ניגשו אליהם 90 ימים" → S3 lifecycle policy → Glacier
- "העלה קבצים גדולים ממיקומים מרוחקים מהר יותר" → S3 Transfer Acceleration
- "שבועות של העברה ברוחב פס מוגבל" → בחינת SAA-C03 עדיין מצפה ל-Snowball, על אף סגירת משפחת Snow ללקוחות חדשים ב-2025

---

**משימה 3.2 — קביעת פתרונות חישוב בעלי-ביצועים-גבוהים ו/או ניתנים-להתרחבות**

מושגי ליבה: משפחות מכונות EC2, מעבדי Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| פרק        | נושא                                                                                     |
|------------|-----------------------------------------------------------------------------------------|
| פרק 4      | סוגי מכונות EC2: ממוטבי-חישוב (c), ממוטבי-זיכרון (r), כללי (m, t)                        |
| פרק 7      | Auto Scaling: התרחבות אופקית לשכבות web                                                  |
| פרק 20     | Lambda: בו-זמניות, provisioned concurrency (להשהיה עקבית)                                |
| פרק 21     | ECS Fargate: containers ללא שרתים                                                        |
| פרק 21     | AWS Batch: חישוב אצווה מנוהל ל-containers של Docker, נתמך-Spot                           |
| פרק 27     | Spot Instances לעומסי עבודת אצווה עמידי-תקלות                                            |

תבניות מפתח בבחינה:

- "עומס אימון ML, מזער עלות, ניתן להפסקה" → Spot Instances
- "תגובת Lambda עקבית מתחת ל-100ms" → Provisioned concurrency (מבטל cold start)
- "microservice ב-container, ללא ניהול תשתית" → ECS Fargate

---

**משימה 3.3 — קביעת פתרונות מסד נתונים בעלי-ביצועים-גבוהים**

מושגי ליבה: RDS לעומת DynamoDB לעומת Aurora לעומת Redshift לעומת ElastiCache, דפוסי גישה, read replicas, DAX.

| פרק        | נושא                                                              |
|------------|--------------------------------------------------------------------|
| פרק 8      | RDS: מסדי נתונים רלציוניים מנוהלים, מתי להשתמש ב-RDBMS             |
| פרק 9      | DynamoDB: NoSQL, partition keys, GSI, DAX (מטמון בזיכרון)         |
| פרק 10     | ElastiCache: Redis לעומת Memcached, אסטרטגיות מטמון               |
| פרק 10     | MemoryDB for Redis: מסד נתונים ראשי עמיד תואם-Redis               |
| פרק 24     | Aurora: ביצועים, Serverless v2, read replicas, Global Database    |
| פרק 29     | DynamoDB on-demand לעומת provisioned capacity עם Auto Scaling     |

תבניות מפתח בבחינה:

- "קריאות במיקרו-שניות ל-session store" → ElastiCache Redis או DAX (אם backend הוא DynamoDB)
- "גישת key-value בתפוקה גבוהה עם סכמה גמישה" → DynamoDB
- "joins מורכבים ועסקאות ACID" → Aurora או RDS
- "אנליטיקה על פטה-בייטים של נתונים מובנים" → Redshift (לא מכוסה בפירוט אך אות: "data warehouse" → Redshift)

---

**משימה 3.4 — קביעת ארכיטקטורות רשת בעלות-ביצועים-גבוהים ו/או ניתנות-להתרחבות**

מושגי ליבה: CloudFront, Global Accelerator, Direct Connect, VPN, placement groups, enhanced networking.

| פרק        | נושא                                                              |
|------------|--------------------------------------------------------------------|
| פרק 7      | NLB (Layer 4) ו-GWLB (Gateway Load Balancer ל-appliances של רשת)  |
| פרק 11     | Client VPN: גישה מוצפנת ממכשיר בודד ל-VPC                         |
| פרק 12     | Route 53: מדיניות ניתוב: latency-based, geolocation, weighted     |
| פרק 13     | CloudFront: CDN, מטמון edge, Lambda@Edge                          |
| פרק 25     | AWS Global Accelerator: ניתוב Anycast אל ה-backbone של AWS        |
| פרק 25     | Direct Connect: קישוריות פרטית ייעודית                            |
| פרק 30     | VPC Endpoints: קישוריות פרטית לשירותי AWS                         |

תבניות מפתח בבחינה:

- "הפחת השהיה למשתמשים גלובליים הניגשים לתגובות API דינמיות" → Global Accelerator (לא CloudFront, שהוא הטוב ביותר לתוכן הניתן למטמון)
- "הפחת השהיה לנכסים סטטיים גלובלית" → CloudFront
- "קישוריות פרטית עקבית ל-AWS מהארגון" → Direct Connect
- "העלאה מהירה מלקוחות ברחבי העולם לדלי S3 שלכם" → S3 Transfer Acceleration

---

**משימה 3.5 — קביעת פתרונות קליטת נתונים וטרנספורמציה בעלי-ביצועים-גבוהים**

מושגי ליבה: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| פרק        | נושא                                                               |
|------------|---------------------------------------------------------------------|
| פרק 26     | Kinesis Data Streams: עיבוד אירועים מסודר בזמן אמת                 |
| פרק 26     | Amazon Data Firehose (לשעבר Kinesis Data Firehose): מסירה מנוהלת ל-S3, Redshift, OpenSearch |
| פרק 26     | AWS Glue: ETL ללא שרתים, Data Catalog, Crawlers                    |
| פרק 26     | Athena: SQL ללא שרתים על S3                                        |
| פרק 26     | QuickSight: dashboards מנוהלים של BI, מנוע SPICE בזיכרון           |
| פרק 26     | Lake Formation: בקרת גישה עדינה לאגם נתונים                        |

תבניות מפתח בבחינה:

- "עבד נתוני click-stream בזמן אמת" → Kinesis Data Streams + Lambda או Managed Service for Apache Flink (לשעבר Kinesis Data Analytics)
- "מסור נתוני הזרמה ל-S3 לניתוח מאוחר יותר" → Amazon Data Firehose
- "הפוך וקטלג נתונים ממקורות מרובים" → AWS Glue
- "שאל נתונים היסטוריים המאוחסנים ב-S3 עם SQL" → Athena

---

## תחום 4: Design Cost-Optimized Architectures (20%)

**משימה 4.1 — תכנון פתרונות אחסון ממוטבי-עלות**

| פרק        | נושא                                                              |
|------------|--------------------------------------------------------------------|
| פרק 23     | מדיניות מחזור חיים של S3, מעברי מחלקות אחסון                       |
| פרק 28     | right-sizing של EBS, הגירת gp2→gp3, כללי lifecycle ל-versioning של S3 |
| פרק 28     | EFS Intelligent-Tiering, תגיות הקצאת עלות, AWS Budgets            |

תבניות מפתח בבחינה:

- "זהה איזה צוות מייצר את עלויות ה-S3 הגבוהות ביותר" → תגיות הקצאת עלות + Cost Explorer
- "הפחת עלויות לעצמים שניגשים אליהם לעיתים רחוקות אוטומטית" → S3 Intelligent-Tiering
- "התרע כשעלויות חודשיות עולות על ‎$10,000" → AWS Budgets

---

**משימה 4.2 — תכנון פתרונות חישוב ממוטבי-עלות**

| פרק        | נושא                                                                            |
|------------|----------------------------------------------------------------------------------|
| פרק 2      | Outposts: מדף AWS בתוך הארגון (איזון בין עלות הון לבין opex של ענן)               |
| פרק 2      | Wavelength: חישוב edge של 5G (שותפות תקשורת, מיקום מונחה-השהיה)                   |
| פרק 27     | תמחור EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts   |
| פרק 20     | Lambda: תשלום לפי הפעלה (עלות אפסית בזמן סרק)                                     |

תבניות מפתח בבחינה:

- "הפחת עלות לעומסי עבודת ייצור במצב יציב" → Savings Plans (גמיש יותר) או Reserved Instances
- "מזער עלות ל-jobs של אצווה שניתן להפסיק" → Spot Instances
- "עיבוד מונחה-אירועים עם עלות אפסית בזמן סרק" → Lambda

---

**משימה 4.3 — תכנון פתרונות מסד נתונים ממוטבי-עלות**

| פרק        | נושא                                              |
|------------|---------------------------------------------------|
| פרק 29     | DynamoDB on-demand לעומת provisioned + Auto Scaling |
| פרק 29     | Reserved Instances/Nodes של RDS ו-ElastiCache     |
| פרק 29     | ניהול snapshots של RDS                            |

תבניות מפתח בבחינה:

- "תעבורת DynamoDB בלתי צפויה" → מצב קיבולת On-demand
- "תעבורת DynamoDB עקבית עם שיאים ידועים" → Provisioned + Auto Scaling
- "הפחת עלויות RDS לעומס עבודה יציב" → Reserved Instances (1 או 3 שנים)

---

**משימה 4.4 — תכנון ארכיטקטורות רשת ממוטבות-עלות**

| פרק        | נושא                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| פרק 30     | תמחור העברת נתונים: נכנס (חינם), cross-AZ (‎$0.01/GB), cross-region, אינטרנט (‎$0.09/GB)         |
| פרק 30     | NAT Gateway (‎$0.045/GB) לעומת VPC Endpoints (Gateway: חינם; Interface: מתומחר)                |
| פרק 30     | CloudFront כממטב עלות העברת נתונים                                                             |

תבניות מפתח בבחינה:

- "EC2 ב-subnet פרטי קורא ל-S3 — בטל עלויות NAT Gateway" → S3 Gateway Endpoint (חינם)
- "EC2 ב-subnet פרטי קורא ל-SQS — הפחת עלויות NAT Gateway" → SQS Interface Endpoint
- "הפחת עלויות העברת נתונים למסירת תוכן גלובלית" → CloudFront (מטמון מפחית בקשות מקור)

---

## נושאים חוצי-תחומים

חלק מהנושאים מופיעים על פני תחומים מרובים:

| נושא                               | תחומים  | פרקים        |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | כולם    | 31           |
| ביקורות ארכיטקטורה ו-ADRs          | כולם    | 32           |
| היגיון של איזונים ("זה תלוי")      | כולם    | 33           |
| תכנון Multi-AZ                     | 2, 3    | 7, 8, 18, 24 |
| ניטור ונראות                       | 1, 2    | לאורך הספר   |
| CloudFront                         | 3, 4    | 13, 30       |

---

## רשימת בדיקה לפני הבחינה

לפני הגשה ל-SAA-C03:

**תחומים בעלי משקל גבוה (הסבירים ביותר להופיע)**

- [ ] לוגיקת הערכת מדיניות IAM (explicit deny → explicit allow → implicit deny)
- [ ] רכיבי VPC: subnets, route tables, IGW, NAT Gateway, security groups, NACLs
- [ ] מחלקות אחסון S3 ומתי להשתמש בכל אחת
- [ ] RDS Multi-AZ לעומת Read Replica (failover לעומת התרחבות קריאות)
- [ ] SQS לעומת SNS לעומת EventBridge (pull לעומת push לעומת ניתוב אירועים)
- [ ] מודלי תמחור EC2: Spot לעמיד-תקלות, Savings Plans לעומסי עבודה מחויבים
- [ ] triggers ובו-זמניות של Lambda
- [ ] DynamoDB לעומת Aurora לעומת Redshift (דפוס הגישה קובע את הבחירה)
- [ ] CloudFront: CDN לסטטי, Global Accelerator לדינמי

**מלכודות נפוצות**

- [ ] EBS מתחבר למכונה אחת; EFS משותף
- [ ] RDS Read Replicas מיועדים להתרחבות קריאות, לא ל-failover אוטומטי (זה Multi-AZ)
- [ ] NACLs הם stateless (צריך גם כללים נכנסים וגם יוצאים)
- [ ] Gateway Endpoints חינמיים ורק ל-S3 ו-DynamoDB
- [ ] Kinesis שומר ומשמיע מחדש; SQS מוחק בעת צריכה
- [ ] "ניתוק" לא תמיד אומר SQS — fan-out של SNS ו-EventBridge הם גם תבניות ניתוק
- [ ] Shield Standard חינמי ואוטומטי; Advanced הוא מנוי בתשלום
- [ ] ElastiCache לעומת MemoryDB: ElastiCache = מטמון (אובדן נתונים קביל). MemoryDB = מסד נתונים ראשי עמיד.
- [ ] Client VPN לעומת Site-to-Site VPN: Client VPN = מכשירים בודדים. Site-to-Site = רשת-לרשת.
- [ ] Outposts לעומת Wavelength: Outposts = מדף AWS בתוך הארגון. Wavelength = edge של 5G.
- [ ] DMS: הומוגני = DMS ישיר. הטרוגני = SCT תחילה, ואז DMS.
- [ ] DataSync מעביר *קבצים*; DMS מעביר *מסדי נתונים*; MGN מעביר *שרתים שלמים*.

**מבנה הבחינה**

- 65 שאלות, 130 דקות (שעתיים ו-10 דקות)
- בחירה מרובה (תשובה נכונה אחת) ותגובה מרובה (בחר N נכונות)
- ציון עובר: 720 מתוך 1000
- שאלות שאינן מנוקדות משובצות; אינכם יכולים לדעת אילו הן
- נהלו זמן: ~2 דקות לשאלה; סמנו את הקשות וחזרו אליהן
