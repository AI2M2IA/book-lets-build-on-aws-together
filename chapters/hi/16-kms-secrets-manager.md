# अध्याय 16: कुंजियाँ, ताले और रहस्य

लियो गिट इतिहास की समीक्षा कर रहा था जब उसे यह मिला। एक डेटाबेस पासवर्ड। छह महीने पहले, किसी ऐसे व्यक्ति द्वारा प्रतिबद्ध, जो अब नimbus में नहीं था, सादे पाठ में। प्रतिबद्धता सार्वजनिक थी। पासवर्ड को बाद में बदल दिया गया था - लेकिन वे निश्चित नहीं थे। उन्होंने यह जांचा कि उस पासवर्ड ने जिन सभी प्रणालियों को छुआ था। इसमें चार घंटे लगे। उस दिन नimbus ने तय किया कि संवेदनशील जानकारी को कोड में नहीं रखा जाएगा।

**दो समस्याएं: संवेदनशील जानकारी संग्रहीत करना और डेटा एन्क्रिप्ट करना**

संवेदनशील जानकारी के आसपास सुरक्षा में दो अलग-अलग समस्याएं हैं:

**प्रमाणीकरण संग्रहीत करना** (डेटाबेस पासवर्ड, API कुंजी, कनेक्शन स्ट्रिंग): ये कहाँ रहते हैं? कौन उन्हें एक्सेस कर सकता है? आप उन्हें पुनः तैनात किए बिना कैसे घुमाते हैं?

**डेटा एन्क्रिप्ट करना** (ग्राहक जानकारी, भुगतान रिकॉर्ड, पीआईआई): यह सुनिश्चित करना कि भले ही किसी को डेटाबेस या S3 बकेट में अनधिकृत पहुंच मिल जाए, वे डेटा नहीं पढ़ सकते।

एडब्ल्यूएस प्रत्येक समस्या के लिए एक समर्पित सेवा प्रदान करता है:

- **एडब्ल्यूएस Secrets Manager**: सुरक्षित रूप से क्रेडेंशियल्स संग्रहीत और प्रबंधित करता है
- **एडब्ल्यूएस KMS (की मैनेजमेंट सर्विस)**: डेटा को एन्क्रिप्ट करने और डिक्रिप्ट करने के लिए एन्क्रिप्शन कुंजियों का प्रबंधन करता है

**एडब्ल्यूएस Secrets Manager: अब हार्डकोडेड क्रेडेंशियल्स नहीं**

Secrets Manager एक सुरक्षित भंडार है संवेदनशील जानकारी के लिए: डेटाबेस क्रेडेंशियल्स, API कुंजियाँ, ओथ टोकन, एस एस एच कुंजियाँ, या कुछ भी संवेदनशील।

इसके बजाय, आपका एप्लिकेशन पर्यावरण चर या कॉन्फ़िगरेशन फ़ाइल से पासवर्ड पढ़ने के बजाय, स्टार्टअप (या आवश्यकतानुसार) पर Secrets Manager API को कॉल करता है और गुप्त को पुनः प्राप्त करता है। गुप्त कभी भी डिस्क को नहीं छूता है। यह आपके कोड में कभी प्रकट नहीं होता है। यह आपके पर्यावरण चर में नहीं है।

यहाँ प्रवाह कैसा दिखता है:

**पुराना तरीका**:

```
DB_PASSWORD=supersecretpassword123  # in .env file or environment variable
```

## Secrets Manager का तरीका:

```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

The EC2 instance needs an IAM role with permission to call `secretsmanager:GetSecretValue` for that specific secret. No other service can read it. The secret is never in the code.

**Automatic Rotation: The Real पावर (Shakti)**

The greatest feature of Secrets Manager isn't storing secrets — it’s rotating them automatically.

Here's the scenario: every 30 days, Secrets Manager generates a new database password, updates it in RDS, updates the stored secret, and your application retrieves the new password the next time it needs it. No manual intervention. No deployment. No “I need to remember to rotate this.”

The rotation is implemented as a Lambda function. AWS provides templates for RDS databases (MySQL, PostgreSQL, Aurora). You can customize the function for any credential type.

Tom had a question about cost. (Of course he did.)

Secrets Manager charges per secret per month plus per API call. For a small number of database passwords and API keys, the cost is dollars per month — negligible compared to the cost of an incident.

“The compromise last week,” Priya said, “what would it have cost to investigate and remediate?”

Tom was quiet for a moment. “Including my time, your time, Leo’s weekend... couple thousand dollars.”

“Secrets Manager would have caught the static key before it was exploited. And it would have rotated it automatically.”

Tom pulled up the pricing page.

**AWS KMS: The Lock Factory (Lock Ka Factory)**

AWS KMS (Key Management Service) manages **cryptographic keys** — the secret values used to encrypt and decrypt data.

The analogy: KMS is like a lockbox company that holds the master key. Your data (the contents of the box) is encrypted. Only someone with permission to use the KMS key can decrypt it. KMS logs every use of every key in CloudTrail.

**Customer Master Keys (CMKs)** — now called KMS keys — come in two types:

**AWS managed keys**: AWS creates and manages the key automatically for services like S3, EBS, RDS. You don’t control the key directly, but you can see it’s being used. Free.

**Customer managed keys**: You create the key in KMS and control every aspect of it: who can use it, when it rotates, who can administer it. You can enable automatic annual rotation. Cost: $1/month per key plus per-API-call charges.

**Encryption in AWS Services: KMS Integration**

Most AWS services integrate with KMS for encryption:

**S3**: Enable “server-side encryption with KMS” on a bucket. Every object is encrypted at rest with a KMS key. Reading an object requires permission to both the S3 bucket *and* the KMS key.

**RDS**: Enable encryption at creation time. The database storage, backups, and snapshots are all encrypted with a KMS key. Note: encryption cannot be enabled on an existing unencrypted RDS instance — you must snapshot, copy the snapshot with encryption enabled, and restore.

**EBS**: Encrypt volumes with KMS. New volumes created from encrypted snapshots are automatically encrypted.

**DynamoDB**: Encryption at rest using KMS is enabled by default on all tables.

**ElastiCache Redis**: Encryption at rest with KMS for sensitive cached data.

The principle: data should be encrypted at rest (stored on disk) and in transit (moving across a network). KMS handles at-rest encryption. TLS/SSL (provided automatically by AWS services) handles in-transit encryption.

**Envelope Encryption: How KMS Actually Works**

Here's a detail that helps you understand KMS behavior and exam questions.

KMS does not encrypt your data directly in most cases. It uses **envelope encryption**:

1. KMS generates a **data key** (a unique symmetric key)
2. The service uses the data key to encrypt your data locally (fast — symmetric encryption)
3. The service asks KMS to encrypt the data key itself (using your KMS key)
4. Both the encrypted data and the encrypted data key are stored
5. Your actual data never leaves the service — only the data key goes to KMS for encryption/decryption

When you read the data:

1. The service asks KMS to decrypt the data key
2. KMS checks permissions, decrypts the data key, returns it
3. The service uses the decrypted data key to decrypt your data locally

This means KMS can handle very large data without sending it all through the KMS API. Only small keys go to KMS. CloudTrail logs every KMS API call — every encrypt and decrypt operation.

**Secrets Manager vs Parameter Store**

AWS also has **Systems Manager Parameter Store**, which stores configuration values (not just secrets). Parameter Store is cheaper — free for standard parameters. It can also store encrypted parameters using KMS.

For secrets that need rotation: Secrets Manager.

For configuration values and non-sensitive parameters: Parameter Store (free tier is very generous).

For application configuration (port numbers, feature flags, environment-specific settings): Parameter Store.

## Strengths and Limitations

**AWS Secrets Manager**:

- कोड में गुप्त जानकारी संग्रहीत न करें, पर्यावरण चर या संस्करण नियंत्रण में प्रतिबद्ध कॉन्फ़िगरेशन फ़ाइलों में।
- **Secrets Manager** क्रेडेंशियल्स को सुरक्षित रूप से संग्रहीत करता है और उन्हें स्वचालित रूप से घुमाता है। एप्लिकेशन API के माध्यम से सीक्रेट्स प्राप्त करते हैं।
- **KMS** एन्क्रिप्शन कुंजियों का प्रबंधन करता है। अधिकांश AWS सेवाएं KMS के साथ आराम से एन्क्रिप्शन के लिए एकीकृत हैं।
- **आराम में एन्क्रिप्शन** (डिस्क पर संग्रहीत डेटा) KMS द्वारा प्रबंधित कुंजियों का उपयोग करके किया जाता है या आप। **परिवहन में एन्क्रिप्शन** टीएलएस का उपयोग करता है।
- **एनवेलोप एन्क्रिप्शन**: KMS कुंजी को एन्क्रिप्ट करता है, डेटा को सीधे नहीं। सेवा स्थानीय डेटा कुंजी का उपयोग करके डेटा को एन्क्रिप्ट करती है।
- **ग्राहक-प्रबंधित KMS कुंजियाँ**: घुमाव, पहुंच और ऑडिट पर पूर्ण नियंत्रण। **AWS-प्रबंधित कुंजियाँ**: स्वचालित, कोई कॉन्फ़िगरेशन की आवश्यकता नहीं है।
- **पैरामीटर स्टोर** Secrets Manager का एक हल्का विकल्प है गैर-संवेदनशील कॉन्फ़िगरेशन मूल्यों के लिए।

**KMS:**

- पूर्ण ऑडिट ट्रेल के साथ केंद्रीकृत कुंजी प्रबंधन
- ग्राहक-प्रबंधित कुंजियों के लिए वार्षिक कुंजी घुमाव का स्वचालित
- कुंजी नीतियों (संसाधन-आधारित नीतियां) प्रति कुंजी (कुंजी नीतियों + IAM नीतियों) बारीक-बारीक IAM अनुमतियाँ
- हार्डवेयर सुरक्षा मॉड्यूल (एचएसएम) द्वारा समर्थित - कुंजियाँ कभी भी एचएसएम को नहीं छोड़ती हैं
- लागत: प्रति कुंजी प्रति माह $1 + 10,000 API कॉल प्रति $0.03

**यह जटिल कैसे हो जाता है:**

- KMS कुंजी नीतियाँ (एक संसाधन-आधारित नीति) KMS कुंजी के लिए अपनी स्वयं की कुंजी नीति हैं - IAM नीतियाँ अकेले एक KMS कुंजी तक पहुंच को अनुदान नहीं करती हैं - कुंजी नीति को इसे स्पष्ट रूप से अनुमति देने की आवश्यकता है।
- आराम में एन्क्रिप्शन की योजना बनाई जानी चाहिए - आप मौजूदा बिना एन्क्रिप्ट किए गए RDS इंस्टेंस को "इन-प्लेस" में एन्क्रिप्ट नहीं कर सकते हैं
- KMS में कुंजी हटाने की 7-30 दिन की प्रतीक्षा अवधि है (एक सुरक्षा तंत्र - खोई हुई कुंजियाँ खोए हुए डेटा का मतलब है)
- Secrets Manager की लागत सीक्रेट्स और API कॉल की संख्या के साथ पैमाने पर होती है

## सारांश

- कभी भी कोड, पर्यावरण चर या संस्करण नियंत्रण में प्रतिबद्ध कॉन्फ़िगरेशन फ़ाइलों में संग्रहीत क्रेडेंशियल्स न करें।
- **Secrets Manager** क्रेडेंशियल्स को सुरक्षित रूप से संग्रहीत करता है और उन्हें स्वचालित रूप से घुमाता है। एप्लिकेशन API के माध्यम से सीक्रेट्स प्राप्त करते हैं।
- **KMS** एन्क्रिप्शन कुंजियों का प्रबंधन करता है। अधिकांश AWS सेवाएं KMS के साथ आराम से एन्क्रिप्शन के लिए एकीकृत हैं।
- **आराम में एन्क्रिप्शन** (डिस्क पर संग्रहीत डेटा) KMS द्वारा प्रबंधित कुंजियों का उपयोग करके किया जाता है या आप। **परिवहन में एन्क्रिप्शन** टीएलएस का उपयोग करता है।
- **एनवेलोप एन्क्रिप्शन**: KMS कुंजी को एन्क्रिप्ट करता है, डेटा को सीधे नहीं। सेवा स्थानीय डेटा कुंजी का उपयोग करके डेटा को एन्क्रिप्ट करती है।
- **ग्राहक-प्रबंधित KMS कुंजियाँ**: घुमाव, पहुंच और ऑडिट पर पूर्ण नियंत्रण। **AWS-प्रबंधित कुंजियाँ**: स्वचालित, कोई कॉन्फ़िगरेशन की आवश्यकता नहीं है।
- **पैरामीटर स्टोर** Secrets Manager का एक हल्का विकल्प है गैर-संवेदनशील कॉन्फ़िगरेशन मूल्यों के लिए।

## परीक्षा युक्तियाँ

*SAA-C03 डोमेन: सुरक्षित आर्किटेक्चर डिज़ाइन (डोमेन 1, कार्य 1.3)*

- **Secrets Manager बनाम एसएसएम पैरामीटर स्टोर**: क्रेडेंशियल्स के लिए जो स्वचालित घुमाव की आवश्यकता है; सामान्य कॉन्फ़िगरेशन के लिए पैरामीटर स्टोर। परीक्षा उन्हें घुमाव की आवश्यकता और लागत संवेदनशीलता के द्वारा अलग करती है।
- **KMS कुंजी नीतियाँ**: एक KMS कुंजी की अपनी स्वयं की कुंजी नीति (एक संसाधन-आधारित नीति) होती है। IAM नीतियाँ अकेले एक KMS कुंजी तक पहुंच को अनुदान नहीं करती हैं - कुंजी नीति को इसे स्पष्ट रूप से अनुमति देने की आवश्यकता है।
- **RDS को एन्क्रिप्ट करना**: मौजूदा बिना एन्क्रिप्ट किए गए RDS इंस्टेंस पर एन्क्रिप्शन को सक्षम नहीं किया जा सकता है। प्रक्रिया: एक स्नैपशॉट बनाएं → एन्क्रिप्शन के साथ सक्षम स्नैपशॉट के साथ स्नैपशॉट कॉपी करें → एन्क्रिप्टेड स्नैपशॉट से पुनर्स्थापित करें → नए इंस्टेंस पर ट्रैफ़िक माइग्रेट करें।
- **EBS एन्क्रिप्शन**: नए वॉल्यूम एन्क्रिप्ट किए जा सकते हैं। एन्क्रिप्टेड वॉल्यूम के स्नैपशॉट हमेशा एन्क्रिप्टेड होते हैं। बिना एन्क्रिप्ट किए गए वॉल्यूम को सीधे एन्क्रिप्ट नहीं किया जा सकता है - स्नैपशॉट + कॉपी + पुनर्स्थापित करें।
- **CloudTrail + KMS**: प्रत्येक KMS API कॉल CloudTrail में लॉग की जाती है। यह एक प्रमुख अनुपालन सुविधा है।
- **बहु-क्षेत्र KMS कुंजियाँ**: डिक्रिप्शन के लिए कई क्षेत्रों में कुंजी सामग्री का प्रतिकृति बनाएं ताकि क्रॉस-क्षेत्र API कॉल की आवश्यकता न हो। परीक्षा इस का उपयोग एन्क्रिप्टेड डेटा के साथ बहु-क्षेत्र आपदा रिकवरी के लिए करती है।
- **KMS बनाम क्लाउडएचएसएम**: KMS बहु-Tenant (AWS द्वारा प्रबंधित) है। क्लाउडएचएसएम केवल आप को नियंत्रित करता है। परीक्षा संकेत: "एफिप्स 140-2 स्तर 3," "डेडिकेटेड एचएसएम," "ग्राहक-प्रबंधित क्रिप्टोग्राफिक संचालन" → क्लाउडएचएसएम।

## अभ्यास

**अभ्यास 1 — स्मरण**

एनवेलोप एन्क्रिप्शन की अवधारणा को समझाएं। KMS डेटा कुंजी को सीधे आपके एप्लिकेशन डेटा को एन्क्रिप्ट करने के बजाय क्यों एन्क्रिप्ट करता है?

*(सुझाव: सोचें कि यदि आपके पास 1GB का डेटा है जिसे एन्क्रिप्ट करने की आवश्यकता है, और दूरस्थ KMS सेवा को 1GB भेजने के प्रदर्शन निहितार्थ क्या होंगे।)*

**अभ्यास 2 — परीक्षा अभ्यास**

*परिदृश्य*: एक वित्तीय सेवा कंपनी संवेदनशील ग्राहक डेटा को एक RDS MySQL डेटाबेस में संग्रहीत करती है। एक नए अनुपालन आवश्यकता के तहत, निम्नलिखित की आवश्यकता है:

1. सभी डेटा को आराम में एन्क्रिप्ट किया जाना चाहिए
2. सभी एन्क्रिप्शन कुंजी उपयोग को ऑडिट किया जाना चाहिए
3. एन्क्रिप्शन कुंजियों को ग्राहक द्वारा नियंत्रित किया जाना चाहिए (AWS द्वारा प्रबंधित नहीं)
4. डेटाबेस पासवर्ड को हर 90 दिनों में स्वचालित रूप से घुमाया जाना चाहिए

डेटाबेस छह महीने पहले बिना एन्क्रिप्शन के बनाया गया था। निम्नलिखित में से कौन सा कार्रवाई इन आवश्यकताओं को सर्वोत्तम रूप से पूरा करती है?

A) मौजूदा डेटाबेस पर RDS एन्क्रिप्शन को सक्षम करें; एक ग्राहक-प्रबंधित KMS कुंजी बनाएं; 90-दिन के घुमाव के साथ Secrets Manager को कॉन्फ़िगर करें
B) मौजूदा डेटाबेस का एक स्नैपशॉट बनाएं; एक ग्राहक-प्रबंधित KMS कुंजी का उपयोग करके एन्क्रिप्टेड स्नैपशॉट के साथ स्नैपशॉट कॉपी करें; एन्क्रिप्टेड स्नैपशॉट से पुनर्स्थापित करें; 90-दिन के घुमाव के साथ Secrets Manager को कॉन्फ़िगर करें
C) एक AWS-प्रबंधित कुंजी के साथ एक नए एन्क्रिप्टेड RDS इंस्टेंस बनाएं; पुराने इंस्टेंस से डेटा माइग्रेट करें; 90-दिन के घुमाव के साथ Secrets Manager को कॉन्फ़िगर करें
D) 90-दिन के घुमाव के साथ Secrets Manager को कॉन्फ़िगर करें; एक AWS-प्रबंधित कुंजी के साथ मौजूदा डेटाबेस पर आराम में RDS एन्क्रिप्शन को सक्षम करें

**सुझाव 1**: आप मौजूदा बिना एन्क्रिप्ट किए गए RDS इंस्टेंस पर सीधे एन्क्रिप्शन को सक्षम नहीं कर सकते हैं।

**सुझाव 2**: "ग्राहक-नियंत्रित" कुंजियाँ ग्राहक-प्रबंधित KMS कुंजियों को संदर्भित करती हैं, AWS-प्रबंधित कुंजियों को नहीं।

**सुझाव 3**: स्नैपशॉट कॉपी प्रक्रिया मानक माइग्रेशन पथ है एन्क्रिप्टेड RDS के लिए।

**उत्तर**: B

**स्पष्टीकरण**: RDS एन्क्रिप्शन किसी मौजूदा इंस्टेंस पर सक्षम नहीं किया जा सकता। मानक दृष्टिकोण है: मौजूदा इंस्टेंस का स्नैपशॉट लें → ग्राहक-प्रबंधित KMS कुंजी का उपयोग करके एन्क्रिप्शन के साथ सक्षम स्नैपशॉट की प्रतिलिपि बनाएँ (आवश्यकताएँ 1, 2 और 3 को पूरा करता है) → एन्क्रिप्टेड स्नैपशॉट से पुनर्स्थापित करें। ग्राहक-प्रबंधित KMS कुंजियाँ स्वचालित रूप से CloudTrail में सभी उपयोगों को लॉग करती हैं (निरीक्षण) और एन्क्रिप्शन कुंजियों को आपके नियंत्रण में रखती हैं। Secrets Manager स्वचालित 90-दिवसीय पासवर्ड रोटेशन को संभालता है (आवश्यकता 4 को पूरा करता है)।

**क्यों ए नहीं?** आप मौजूदा बिना एन्क्रिप्टेड RDS इंस्टेंस पर एन्क्रिप्शन को इन-प्लेस सक्षम नहीं कर सकते।

**क्यों क्यों सी नहीं?** AWS-प्रबंधित कुंजियाँ आवश्यकता 3 को पूरा नहीं करती हैं ("ग्राहक-नियंत्रित" आवश्यकता)।

**क्यों क्यों डी नहीं?** ए के समान समस्या (इन-प्लेस सक्षम नहीं किया जा सकता) प्लस AWS-प्रबंधित कुंजी आवश्यकता 3 को पूरा नहीं करती है।

*SAA-C03 डोमेन: सुरक्षित आर्किटेक्चर का डिज़ाइन — कार्य 1.3*

**अभ्यास 3 — आर्किटेक्चर चुनौती** *(वैकल्पिक)*

नimbus को निम्नलिखित संवेदनशील डेटा संग्रहीत करने की आवश्यकता है:

- उत्पादन RDS इंस्टेंस के लिए डेटाबेस पासवर्ड
- स्ट्राइप API सीक्रेट कुंजी (भुगतान प्रसंस्करण के लिए उपयोग की जाती है)
- ग्राहक ऑर्डर इतिहास को एन्क्रिप्ट करने के लिए डायनामोबी डी में एक सममित एन्क्रिप्शन कुंजी
- प्रत्येक रेस्तरां के लिए कॉन्फ़िगरेशन मान (API एंडपॉइंट, फ़ीचर फ़्लैग - संवेदनशील नहीं)

प्रत्येक के लिए आप AWS सेवा या दृष्टिकोण का उपयोग करेंगे? प्रत्येक के लिए आप कौन सी रोटेशन रणनीति लागू करेंगे?

*(एकल सही उत्तर नहीं है। लक्ष्य उपयोग के मामलों से मेल खाने के लिए अभ्यास करना है सुरक्षा उपकरणों का उपयोग करना।) *

## पोस्ट-क्रेडिट दृश्य

सीक्रेट्स का माइग्रेशन हो गया।

डेटाबेस पासवर्ड: Secrets Manager, हर 30 दिनों में रोटेट होता है।

API कुंजियाँ: Secrets Manager, एक रोटेशन Lambda के साथ जो भुगतान प्रदाता के API को कॉल करके एक नई कुंजी उत्पन्न करता है।

ग्राहक ऑर्डर डेटा: एक ग्राहक-प्रबंधित KMS कुंजी के साथ एन्क्रिप्ट किया गया।

पुराने क्रेडेंशियल: निष्क्रिय। पुराने कॉन्फ़िगरेशन फ़ाइलें: हटा दी गईं। पुराने GitHub Actions सीक्रेट्स: हटा दिए गए।

"हम अब ऑडिट-तैयार हैं," प्रिया ने कहा।

"ऑडिट-तैयार को परिभाषित करें," माया ने कहा।

"यदि एक अनुपालन ऑडिटर से हमें यह साबित करने के लिए कहा जाता है कि कोई भी क्रेडेंशियल हमारे कोड में हार्डकोड नहीं किया गया है या हमारे बुनियादी ढांचे में उजागर नहीं किया गया है, तो हम उन्हें दिखा सकते हैं: प्रत्येक सीक्रेट Secrets Manager में है, प्रत्येक एन्क्रिप्शन कुंजी KMS में है, प्रत्येक एक्सेस CloudTrail में लॉग किया गया है।"

"CloudTrail लॉग की जांच अंतिम बार कब की गई?"

एक ठहराव।

"मैं हर हफ्ते उनकी जांच करता हूँ," प्रिया ने कहा।

"और अगर कुछ असामान्य दिखाई देता है, तो हम कैसे जानेंगे?"

"कि," प्रिया ने, अपना लैपटॉप बंद करते हुए, "अगली बातचीत वह है।"

अगले अध्याय में: इंटरनेट और नimbus के बीच खड़े तीन रक्षात्मक परतें।
