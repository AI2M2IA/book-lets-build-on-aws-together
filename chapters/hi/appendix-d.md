# परिशिष्ट D: पूर्ण अभ्यास परीक्षा (65 प्रश्न)

यह एक पूर्ण-लंबाई की SAA-C03 अभ्यास परीक्षा है: 65 प्रश्न, वास्तविक परीक्षा के डोमेन भार को प्रतिबिंबित करते हुए — Design Secure Architectures (प्रश्न 1–20, ~30%), Design Resilient Architectures (21–37, ~26%), Design High-Performing Architectures (38–53, ~24%), और Design Cost-Optimized Architectures (54–65, ~20%)।

**इसे कैसे लें:**

- **130 मिनट** के लिए एक timer सेट करें — वास्तविक परीक्षा की अवधि। गति का अभ्यास करें: यानी दो मिनट प्रति प्रश्न।
- सात प्रश्न **"(Choose TWO.)"** कहते हैं — उनके पाँच विकल्प और ठीक दो सही उत्तर हैं, बिल्कुल वास्तविक परीक्षा के multiple-response items की तरह। प्रश्न का स्कोर करने के लिए दोनों सही होने चाहिए।
- सभी 65 समाप्त करने तक answer key न देखें। वास्तविक परीक्षा में बीच में कोई feedback नहीं होता, और अनिश्चितता के प्रति अपनी सहनशीलता को प्रशिक्षित करना तैयारी का हिस्सा है।
- वास्तविक परीक्षा में 15 unscored प्रायोगिक प्रश्न शामिल हैं जिन्हें आप पहचान नहीं सकते। यहाँ सभी 65 "scored" हैं। एक उत्तीर्ण बेंचमार्क: **47 या अधिक सही (~72%)** आपको 720/1000 scaled उत्तीर्ण स्कोर की सीमा में रखता है। 47 से नीचे, परीक्षा बुक करने से पहले अपने कमज़ोर डोमेन के लिए परिशिष्ट B में मैप किए गए अध्यायों पर फिर से जाएँ।
- हर प्रश्न के लिए जो आप चूकते हैं — और हर प्रश्न जो आप सही करते हैं लेकिन झिझकते हैं — distractor विश्लेषण पढ़ें। परीक्षा प्रशंसनीय विकल्पों के बीच *अंतर* का परीक्षण करती है, और वहीं सीखना निहित है।

---

## भाग 1 — Design Secure Architectures (प्रश्न 1–20)

**प्रश्न 1** *(Domain 1 — Task 1.1)*
एक वित्तीय सेवा कंपनी सभी सुविधाएँ सक्षम होने के साथ AWS Organizations का उपयोग करती है। सुरक्षा टीम ने संगठन के root से एक service control policy (SCP) जोड़ी जो eu-west-1 को छोड़कर सभी AWS Regions के उपयोग को अस्वीकार करती है। एक ऑडिट के दौरान, टीम को पता चलता है कि SCP के बावजूद एक खाते में एक administrator अभी भी us-east-2 में EC2 instances लॉन्च करने में सक्षम था। किस खाते ने सबसे अधिक संभावना से इस action की अनुमति दी?

A) एक nested organizational unit (OU) में एक member account, क्योंकि SCPs nested OUs तक प्रसारित नहीं होते
B) management account, क्योंकि SCPs management account पर लागू नहीं होते
C) एक member account जिसकी IAM administrator policy में एक explicit Allow शामिल है, जो SCPs को override करता है
D) SCP जोड़े जाने के बाद बनाया गया एक member account, क्योंकि SCPs केवल उन खातों पर लागू होते हैं जो जोड़े जाने के समय मौजूद थे

**प्रश्न 2** *(Domain 1 — Task 1.1)*
एक startup अपने developers को उनके एप्लिकेशनों के लिए IAM roles बनाने की अनुमति देना चाहता है, लेकिन सुरक्षा टीम चिंतित है कि developers ऐसे roles बना सकते हैं जिनमें खुद developers से अधिक permissions हों, जिससे privilege escalation हो। सुरक्षा टीम चाहती है कि developers self-service role creation बनाए रखें। सबसे उपयुक्त समाधान क्या है?

A) developers को सुरक्षा टीम द्वारा समीक्षित एक ticketing system के माध्यम से role creation अनुरोध सबमिट करने की आवश्यकता है
B) developers के खातों से एक SCP जोड़ें जो iam:CreateRole action को पूरी तरह अस्वीकार करती है
C) आवश्यकता है कि developers द्वारा बनाए गए सभी roles में एक विशिष्ट permissions boundary शामिल हो, जो iam:CreateRole और iam:AttachRolePolicy पर एक IAM condition के साथ लागू की गई हो
D) AWS CloudTrail सक्षम करें और जब भी कोई developer एक नया IAM role बनाए तो alerts कॉन्फ़िगर करें

**प्रश्न 3** *(Domain 1 — Task 1.1)*
एक SaaS provider को स्वचालित cost analysis करने के लिए अपने ग्राहकों के AWS खातों में resources तक पहुँचने की आवश्यकता है। ग्राहक एक IAM role बनाते हैं जिसे SaaS provider का खाता assume कर सकता है। एक सुरक्षा सलाहकार चेतावनी देता है कि एक तृतीय पक्ष जो किसी ग्राहक के role ARN को जान लेता है, SaaS provider को तृतीय पक्ष की ओर से उस ग्राहक के खाते तक पहुँचने के लिए धोखा दे सकता है। कौन सा तंत्र इस "confused deputy" जोखिम को कम करता है?

A) cross-account role की trust policy पर multi-factor authentication (MFA) की आवश्यकता है
B) SaaS provider को sts:AssumeRole call में ग्राहक द्वारा परिभाषित एक अद्वितीय ExternalId पास करने की आवश्यकता है, जिसे role की trust policy में एक condition द्वारा सत्यापित किया जाता है
C) SaaS provider के साथ साझा करने से पहले role ARN को AWS KMS के साथ encrypt करें
D) cross-account role को एक IAM user से बदलें जिसकी access keys हर 90 दिन में rotate की जाती हैं

**प्रश्न 4** *(Domain 1 — Task 1.1)*
AWS Organizations में 40 AWS खातों वाली एक कंपनी चाहती है कि उसके कर्मचारी अपने मौजूदा Microsoft Entra ID (Azure AD) credentials के साथ एक बार sign in करें और एक एकल portal के माध्यम से सभी AWS खातों तक पहुँचें, प्रति खाता केंद्रीय रूप से सौंपी गई permissions के साथ। कौन सा समाधान इन आवश्यकताओं को सबसे कम operational overhead के साथ पूरा करता है?

A) 40 खातों में से प्रत्येक में IAM users बनाएँ और passwords को Entra ID के साथ synchronize करें
B) बाहरी identity provider के रूप में Entra ID के साथ AWS IAM Identity Center कॉन्फ़िगर करें और प्रति खाता users तथा groups को permission sets सौंपें
C) प्रत्येक खाते में Amazon Cognito user pools तैनात करें और उन्हें Entra ID से federate करें
D) प्रत्येक खाते में एक SAML identity provider बनाएँ और प्रति-खाता IAM roles तथा trust policies मैन्युअल रूप से लिखें

**प्रश्न 5** *(Domain 1 — Task 1.1)*
एक mobile gaming कंपनी एक app बना रही है जहाँ खिलाड़ी एक email address या social login के साथ sign up करते हैं, और प्रमाणीकरण के बाद app को अस्थायी AWS credentials का उपयोग करके player screenshots को सीधे एक Amazon S3 bucket में अपलोड करना चाहिए। solutions architect को सेवाओं के किस संयोजन की सिफारिश करनी चाहिए?

A) sign-up/sign-in के लिए एक Amazon Cognito user pool, और प्रमाणित token को अस्थायी AWS credentials के लिए विनिमय करने हेतु एक Amazon Cognito identity pool
B) sign-up/sign-in के लिए एक Amazon Cognito identity pool, और अस्थायी AWS credentials जारी करने हेतु एक Amazon Cognito user pool
C) sign-up/sign-in के लिए AWS IAM Identity Center, और credentials के लिए AWS STS GetSessionToken
D) केवल एक Amazon Cognito user pool, क्योंकि user pool tokens S3 तक सीधी पहुँच प्रदान करते हैं

**प्रश्न 6** *(Domain 1 — Task 1.3)*
एक healthcare कंपनी को Amazon S3 में डेटा को एक ऐसी key के साथ encrypt करना चाहिए जो AWS द्वारा प्रबंधित स्वचालित वार्षिक rotation का समर्थन करती हो, जबकि कंपनी को अभी भी key policy परिभाषित करने, key usage की CloudTrail logging सक्षम करने, और आवश्यकता पड़ने पर key को disable करने की अनुमति हो। कौन सा KMS key प्रकार इन आवश्यकताओं को पूरा करता है?

A) एक AWS managed key (aws/s3)
B) स्वचालित rotation सक्षम के साथ एक customer managed key
C) एक AWS owned key
D) स्वचालित rotation सक्षम के साथ एक imported key material (BYOK) customer managed key

**प्रश्न 7** *(Domain 1 — Task 1.3)*
एक solutions architect यह समझा रहा है कि AWS KMS किसी एप्लिकेशन द्वारा संग्रहीत एक 4 GB फ़ाइल को कैसे encrypt करता है, यह देखते हुए कि KMS सीधे केवल 4 KB तक डेटा encrypt कर सकता है। कौन सा कथन envelope encryption का सटीक वर्णन करता है?

A) KMS फ़ाइल को 4 KB chunks में विभाजित करता है और प्रत्येक chunk को KMS key के साथ encrypt करता है
B) एप्लिकेशन KMS से एक data key का अनुरोध करता है, plaintext data key के साथ फ़ाइल को स्थानीय रूप से encrypt करता है, फिर encrypted data key को डेटा के साथ संग्रहीत करता है और plaintext data key को त्याग देता है
C) KMS फ़ाइल को KMS API के माध्यम से stream करता है, जो इसे KMS key के साथ server-side encrypt करता है
D) एप्लिकेशन फ़ाइल को एक hard-coded symmetric key के साथ encrypt करता है, और KMS integrity के लिए परिणाम पर हस्ताक्षर करता है

**प्रश्न 8** *(Domain 1 — Task 1.3)*
एक कंपनी एक Amazon RDS for PostgreSQL master password संग्रहीत करती है और इसे हर 30 दिन में बिना application downtime के स्वचालित रूप से rotate करना चाहती है। एप्लिकेशन लंबे समय तक चलने वाले database connections रखता है, इसलिए टीम एक ऐसी rotation रणनीति चाहती है जहाँ नई credential सक्रिय होने के दौरान पिछली credential मान्य बनी रहे। कौन सा समाधान इन आवश्यकताओं को पूरा करता है?

A) मासिक रूप से ट्रिगर किए गए एक Lambda function के साथ AWS Systems Manager Parameter Store SecureString parameters
B) single-user rotation रणनीति के साथ AWS Secrets Manager
C) alternating-users rotation रणनीति के साथ AWS Secrets Manager, जो दो database users के बीच स्विच करती है ताकि एक credential हमेशा मान्य बनी रहे
D) database password पर लागू AWS KMS स्वचालित key rotation

**प्रश्न 9** *(Domain 1 — Task 1.3)*
एक media कंपनी Amazon S3 में raw video संग्रहीत करती है। अनुपालन के लिए आवश्यक है कि कंपनी अपनी स्वयं की encryption keys प्रबंधित और आपूर्ति करे, कि AWS उन keys को कभी संग्रहीत न करे, और कि keys हर अनुरोध के साथ प्रदान की जाएँ। कौन सा encryption विकल्प इन आवश्यकताओं को पूरा करता है?

A) SSE-S3
B) एक customer managed key के साथ SSE-KMS
C) SSE-C
D) AWS managed key aws/s3 का उपयोग करते हुए Client-side encryption

**प्रश्न 10** *(Domain 1 — Task 1.3)*
एक broker-dealer को SEC Rule 17a-4 को पूरा करने के लिए Amazon S3 में trade records को सात वर्षों तक इस तरह बनाए रखना चाहिए कि retention अवधि के दौरान कोई भी—AWS account root user सहित—objects को हटा या overwrite न कर सके। कौन सा configuration इस आवश्यकता को पूरा करता है?

A) 7-वर्ष retention अवधि के साथ governance mode में S3 Object Lock
B) versioning-enabled bucket पर 7-वर्ष retention अवधि के साथ compliance mode में S3 Object Lock
C) सभी principals के लिए s3:DeleteObject को अस्वीकार करने वाली एक S3 bucket policy
D) एक lifecycle rule के साथ S3 Glacier Deep Archive जो 7 वर्षों के बाद objects को expire करती है

**प्रश्न 11** *(Domain 1 — Task 1.2)*
एक web application एक Application Load Balancer के पीछे EC2 instances पर चलता है। एक network engineer subnet में एक network ACL rule जोड़ता है जो 0.0.0.0/0 से inbound TCP port 443 की अनुमति देता है, लेकिन clients अभी भी HTTPS requests पूरी नहीं कर पाते। security groups सही ढंग से कॉन्फ़िगर हैं। सबसे संभावित कारण क्या है?

A) network ACL stateful है और एक connection-tracking rule की आवश्यकता है
B) network ACL में ephemeral ports (1024–65535) की अनुमति देने वाला कोई outbound rule नहीं है, इसलिए return traffic block हो जाता है क्योंकि NACLs stateless हैं
C) security group को भी outbound port 443 की अनुमति देनी चाहिए, क्योंकि security groups stateless हैं
D) Network ACLs 0.0.0.0/0 से traffic की अनुमति नहीं दे सकते; एक विशिष्ट CIDR की आवश्यकता है

**प्रश्न 12** *(Domain 1 — Task 1.2)*
एक VPC में security groups और network ACLs के बारे में कौन से दो कथन सटीक हैं? (Choose TWO.)

A) Security groups stateful हैं, इसलिए outbound rules की परवाह किए बिना return traffic स्वचालित रूप से अनुमत है
B) Network ACLs rules को numerical क्रम में मूल्यांकित करते हैं और explicit Deny rules का समर्थन करते हैं
C) Security groups Allow और Deny दोनों rules का समर्थन करते हैं
D) Network ACLs अलग-अलग elastic network interfaces से जुड़े होते हैं
E) Security group rules numerical क्रम में मूल्यांकित होते हैं, पहले match पर रुकते हुए

**प्रश्न 13** *(Domain 1 — Task 1.2)*
CloudFront और ALB पर एक सार्वजनिक-सामना वाला एप्लिकेशन चलाने वाली एक e-commerce कंपनी बड़े, परिष्कृत DDoS हमलों के बारे में चिंतित है। कंपनी AWS Shield Response Team तक 24/7 पहुँच, हमलों के कारण होने वाले scaling charges के विरुद्ध cost protection, और हमले के diagnostics चाहती है। उसे किस सेवा का उपयोग करना चाहिए?

A) AWS Shield Standard, जो स्वचालित रूप से बिना किसी लागत के सक्षम होता है
B) AWS Shield Advanced
C) rate-based rules के साथ AWS WAF
D) EC2 protection plan के साथ Amazon GuardDuty

**प्रश्न 14** *(Domain 1 — Task 1.2)*
एक Application Load Balancer के पीछे एक REST API पर SQL injection प्रयासों और IP addresses के एक छोटे सेट से अत्यधिक requests के साथ हमला किया जा रहा है। कौन सा समाधान सबसे कम development प्रयास के साथ एप्लिकेशन के edge पर दुर्भावनापूर्ण request patterns को block करता है?

A) हर API handler में input validation code जोड़ें
B) ALB के साथ AWS WAF संबद्ध करें, SQL injection managed rule group और एक rate-based rule का उपयोग करते हुए
C) ALB पर AWS Shield Standard सक्षम करें
D) ALB security group को SQL keywords वाले requests को अस्वीकार करने के लिए कॉन्फ़िगर करें

**प्रश्न 15** *(Domain 1 — Task 1.2)*
एक कंपनी तीन सुरक्षा आवश्यकताओं को संबोधित करना चाहती है: (1) threat intelligence का उपयोग करके समझौता किए गए EC2 instances और असामान्य API गतिविधि का निरंतर पता लगाना, (2) S3 buckets में संग्रहीत personally identifiable information (PII) की खोज और वर्गीकरण, और (3) software vulnerabilities (CVEs) के लिए EC2 instances और container images को स्कैन करना। AWS सेवाओं का आवश्यकताओं से कौन सा mapping सही है?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**प्रश्न 16** *(Domain 1 — Task 1.2)*
private subnets में EC2 instances पर चलने वाले एक एप्लिकेशन को Amazon S3 में objects अपलोड करने और Amazon DynamoDB को call करने की आवश्यकता है। Corporate policy traffic को सार्वजनिक इंटरनेट पार करने से मना करती है, और टीम दोनों सेवाओं के लिए सबसे कम-लागत विकल्प चाहती है। कौन सा समाधान इन आवश्यकताओं को पूरा करता है?

A) एक public subnet में एक NAT gateway
B) S3 और DynamoDB के लिए Gateway VPC endpoints, subnets की route tables में संदर्भित
C) S3 और DynamoDB के लिए Interface VPC endpoints (AWS PrivateLink)
D) प्रतिबंधात्मक security group rules के साथ एक internet gateway

**प्रश्न 17** *(Domain 1 — Task 1.3)*
एक server-side request forgery (SSRF) घटना के बाद जिसमें एक हमलावर ने एक vulnerable web application के माध्यम से एक EC2 instance की metadata service से IAM role credentials प्राप्त किए, एक सुरक्षा टीम सभी instances को इस हमले वर्ग के विरुद्ध सख्त करना चाहती है। टीम को क्या करना चाहिए?

A) session tokens की आवश्यकता बनाकर IMDSv2 लागू करें (HttpTokens=required), ताकि metadata requests को एक PUT-obtained token की आवश्यकता हो जिसे सरल SSRF requests प्राप्त नहीं कर सकतीं
B) सभी instances पर instance metadata service disable करें, क्योंकि एप्लिकेशनों को इसकी कभी आवश्यकता नहीं होती
C) subnet के network ACL में 169.254.169.254 block करें
D) instance role के credentials को instance पर एक configuration file में ले जाएँ

**प्रश्न 18** *(Domain 1 — Task 1.3)*
एक solutions architect को लगभग 200 plaintext application configuration values (feature flags, environment names, endpoint URLs) और 5 database passwords संग्रहीत करने होंगे। passwords को स्वचालित rotation की आवश्यकता है; configuration values को नहीं, और टीम लागत कम करना चाहती है। कौन सा संयोजन सबसे अधिक cost-effective है?

A) सब कुछ AWS Secrets Manager में संग्रहीत करें
B) सब कुछ AWS Systems Manager Parameter Store standard parameters में संग्रहीत करें
C) configuration values को Parameter Store standard parameters (कोई शुल्क नहीं) में और passwords को rotation सक्षम के साथ AWS Secrets Manager में संग्रहीत करें
D) configuration values को S3 में और passwords को built-in स्वचालित rotation के साथ Parameter Store SecureString parameters में संग्रहीत करें

**प्रश्न 19** *(Domain 1 — Task 1.3)*
एक कंपनी एक customer managed key का उपयोग करते हुए SSE-KMS के साथ S3 objects encrypt करती है। समान खाते में एक एप्लिकेशन इन objects को प्रति सेकंड हज़ारों बार पढ़ता है, और टीम KMS API calls से throttling और cost चिंताएँ देख रही है। कौन सा बदलाव SSE-KMS encryption रखते हुए KMS request traffic कम करता है?

A) bucket को SSE-S3 पर स्विच करें, जो कोई keys उपयोग नहीं करता
B) S3 Bucket Keys सक्षम करें, ताकि S3 KMS को calls कम करने के लिए एक short-lived bucket-level key का उपयोग करे
C) customer managed key पर स्वचालित key rotation disable करें
D) customer managed key को imported key material से बदलें

**प्रश्न 20** *(Domain 1 — Task 1.1)*
IAM policy evaluation और AWS Organizations के बारे में कौन से दो कथन सटीक हैं? (Choose TWO.)

A) SCPs member accounts में IAM users और roles को permissions प्रदान करते हैं
B) किसी भी लागू policy में एक explicit Deny हमेशा किसी भी Allow को override करता है
C) Resource-based policies एक SCP के बिना cross-account access प्रदान नहीं कर सकतीं
D) एक permissions boundary एक identity-based policy द्वारा एक user या role को प्रदान की जा सकने वाली अधिकतम permissions निर्धारित करती है, लेकिन स्वयं कुछ प्रदान नहीं करती
E) यदि कोई policy किसी action का उल्लेख नहीं करती, तो IAM users के लिए वह action डिफ़ॉल्ट रूप से अनुमत है

---

## भाग 2 — Design Resilient Architectures (प्रश्न 21–37)

**प्रश्न 21** *(Domain 2 — Task 2.2)*
एक online retailer Amazon RDS for MySQL चलाता है। database reporting dashboards से भारी read traffic का अनुभव करता है, और कंपनी को database का एक Availability Zone विफलता को स्वचालित failover और बिना मैन्युअल हस्तक्षेप के सहना भी आवश्यक है। कौन सा संयोजन दोनों आवश्यकताओं को संबोधित करता है?

A) केवल Multi-AZ deployment सक्षम करें; standby instance reporting reads सर्व कर सकता है
B) केवल read replicas बनाएँ; primary का AZ विफल होने पर एक replica स्वचालित रूप से promote हो जाता है
C) स्वचालित failover के लिए Multi-AZ deployment सक्षम करें, और reporting reads को offload करने के लिए read replicas जोड़ें
D) दोनों workloads संभालने के लिए एक बड़े single-AZ instance class में migrate करें

**प्रश्न 22** *(Domain 2 — Task 2.2)*
एक कंपनी Availability Zones में RDS उच्च उपलब्धता चाहती है, लेकिन वह एक पारंपरिक Multi-AZ standby instance के लिए भुगतान करने पर आपत्ति करती है जो कोई traffic सर्व नहीं करता। कौन सा RDS deployment विकल्प स्वचालित failover प्रदान करता है AND standby capacity को read traffic सर्व करने देता है?

A) RDS Multi-AZ DB instance deployment (एक standby)
B) RDS Multi-AZ DB cluster deployment, जिसमें एक reader endpoint के साथ दो readable standby instances होते हैं
C) एक Application Load Balancer के साथ तीन AZs में RDS read replicas
D) automated backups के साथ RDS Single-AZ

**प्रश्न 23** *(Domain 2 — Task 2.2)*
Amazon Aurora पर एक global payments platform को एक दूसरे AWS Region में fail over करना चाहिए यदि primary Region अनुपलब्ध हो जाए। अनुपालन टीम पूछती है कि क्या Aurora Global Database Regions में शून्य data loss (RPO = 0) की गारंटी दे सकता है। solutions architect को उन्हें क्या बताना चाहिए?

A) हाँ — Aurora Global Database Regions में synchronously दोहराता है, इसलिए RPO बिल्कुल 0 है
B) नहीं — Aurora Global Database asynchronous storage-based प्रतिकृति का उपयोग करता है जिसमें सामान्य लैग 1 सेकंड से कम होता है, इसलिए cross-Region RPO शून्य के करीब है लेकिन कभी बिल्कुल 0 की गारंटी नहीं होती
C) हाँ — लेकिन केवल तभी जब secondary Region पर write forwarding सक्षम हो
D) नहीं — Aurora Global Database 5-मिनट के schedule पर दोहराता है, जो 5-मिनट का RPO देता है

**प्रश्न 24** *(Domain 2 — Task 2.2)*
एक कंपनी की disaster recovery योजना कहती है: "एक Regional outage के बाद, order system को 4 घंटे के भीतर फिर से चलना चाहिए, और 15 मिनट से अधिक transactions नहीं खोई जानी चाहिए।" कौन सा कथन इन संख्याओं को DR metrics से सही ढंग से मैप करता है?

A) RTO = 15 मिनट; RPO = 4 घंटे
B) RTO = 4 घंटे; RPO = 15 मिनट
C) MTBF = 4 घंटे; MTTR = 15 मिनट
D) RPO = 4 घंटे; SLA = 15 मिनट

**प्रश्न 25** *(Domain 2 — Task 2.2)*
एक insurance कंपनी को एक महत्वपूर्ण एप्लिकेशन के लिए एक DR रणनीति चाहिए। आवश्यकताएँ: डेटा को DR Region में निरंतर दोहराया जाना चाहिए; core infrastructure (database, AMIs, न्यूनतम stack) DR Region में पहले से मौजूद होना चाहिए लेकिन लागत नियंत्रित करने के लिए compute किसी आपदा तक बंद रहना चाहिए; tens of minutes का RTO स्वीकार्य है। कौन सी DR रणनीति मेल खाती है?

A) Backup and restore
B) Pilot light — DR Region में core elements प्रावधानित जिसमें डेटा live-replicated, लेकिन failover तक compute बंद
C) Warm standby — workload की एक scaled-down लेकिन हमेशा-चलने वाली पूर्ण प्रति
D) Multi-site active/active

**प्रश्न 26** *(Domain 2 — Task 2.2)*
AWS disaster recovery रणनीतियों के बारे में कौन से दो कथन सटीक हैं? (Choose TWO.)

A) Backup and restore के लिए resources का recovery Region में पूर्व-प्रावधानित और चलना आवश्यक है
B) Backup and restore चार रणनीतियों में सबसे कम RTO प्रदान करता है
C) Multi-site active/active कई Regions से एक साथ traffic सर्व करता है और उच्चतम लागत पर शून्य के करीब RTO प्रदान करता है
D) Pilot light recovery Region में production traffic सर्व करने वाली एप्लिकेशन की एक full-capacity प्रति रखता है
E) Warm standby recovery Region में एक scaled-down लेकिन पूरी तरह कार्यात्मक workload की प्रति हमेशा चलती रखता है

**प्रश्न 27** *(Domain 2 — Task 2.1)*
एक image-processing एप्लिकेशन एक Amazon SQS standard queue से messages पढ़ता है। एक image प्रोसेस करने में 3 मिनट तक लगते हैं, लेकिन queue का visibility timeout 30 सेकंड पर सेट है। उपयोगकर्ता रिपोर्ट करते हैं कि कुछ images दो या तीन बार प्रोसेस होते हैं। सबसे संभावित कारण और सुधार क्या है?

A) queue FIFO है; एक standard queue पर स्विच करें
B) processing समाप्त होने से पहले visibility timeout समाप्त हो जाता है, जिससे message अन्य consumers को फिर से दिखाई देता है; visibility timeout को processing समय से अधिक बढ़ाएँ
C) Long polling disabled है; एक 20-सेकंड ReceiveMessageWaitTime सक्षम करें
D) message retention अवधि बहुत कम है; इसे 14 दिन तक बढ़ाएँ

**प्रश्न 28** *(Domain 2 — Task 2.1)*
एक billing एप्लिकेशन एक SQS queue से messages consume करता है। कभी-कभी एक malformed message के कारण consumer बार-बार विफल होता है, और message हमेशा queue के माध्यम से चक्र करता है, compute बर्बाद करता है। architect को क्या कॉन्फ़िगर करना चाहिए?

A) एक maxReceiveCount redrive policy के साथ एक dead-letter queue, ताकि बार-बार विफल होने वाले messages विश्लेषण के लिए अलग रखे जाएँ
B) एक छोटा visibility timeout ताकि bad message अधिक तेज़ी से retry हो
C) FIFO ordering, जो malformed messages को स्वचालित रूप से discard करती है
D) 1 मिनट की एक message retention अवधि ताकि bad messages तेज़ी से expire हों

**प्रश्न 29** *(Domain 2 — Task 2.1)*
एक brokerage प्रति customer account trade events प्रोसेस करता है। समान account के लिए events को सख्ती से क्रम में और exactly once प्रोसेस किया जाना चाहिए, लेकिन विभिन्न accounts के लिए events throughput के लिए समानांतर में प्रोसेस किए जा सकते हैं। कौन सा समाधान इन आवश्यकताओं को पूरा करता है?

A) एक consumer thread के साथ एक SQS standard queue
B) customer account ID को MessageGroupId के रूप में उपयोग करने वाली एक SQS FIFO queue, जो प्रत्येक group के भीतर क्रम संरक्षित करती है जबकि groups में समानांतरता की अनुमति देती है
C) account ID द्वारा message filtering के साथ एक SNS standard topic
D) सभी customers के लिए एकल MessageGroupId के साथ एक SQS FIFO queue

**प्रश्न 30** *(Domain 2 — Task 2.1)*
जब एक order दिया जाता है, एक e-commerce platform को एक साथ तीन स्वतंत्र प्रक्रियाएँ ट्रिगर करनी चाहिए: invoice generation, warehouse fulfillment, और analytics ingestion। प्रत्येक प्रक्रिया को हर order event प्राप्त करना चाहिए, इसे टिकाऊ रूप से buffer करना चाहिए, और इसे अपनी गति से प्रोसेस करना चाहिए। कौन सा architecture इन आवश्यकताओं को पूरा करता है?

A) एक SQS queue जिसमें तीन consumers एक ही queue को poll करते हैं
B) एक SNS topic जो तीन SQS queues में fan out करता है, प्रति प्रक्रिया एक subscribe किया गया
C) Step Functions द्वारा क्रमिक रूप से invoke किए गए तीन Lambda functions
D) तीन email subscriptions के साथ एक SNS topic

**प्रश्न 31** *(Domain 2 — Task 2.1)*
एक flash sale के दौरान, API Gateway द्वारा ट्रिगर किया गया एक Lambda function 429 throttling errors लौटाना शुरू करता है जबकि समान खाते में अन्य महत्वपूर्ण Lambda functions भी throttle होने लगते हैं। खाता अपने डिफ़ॉल्ट concurrency quota पर है। कौन सा action महत्वपूर्ण functions को sale function द्वारा भूखा रखने से बचाता है?

A) sale function का timeout 3 सेकंड से 15-मिनट अधिकतम तक बढ़ाएँ
B) महत्वपूर्ण functions पर reserved concurrency कॉन्फ़िगर करें (और वैकल्पिक रूप से sale function को cap करें), उन्हें account pool से समर्पित concurrency की गारंटी देते हुए
C) sale function पर provisioned concurrency सक्षम करें, जो account-wide quota बढ़ाता है
D) महत्वपूर्ण functions को 10 GB memory configuration में स्थानांतरित करें

**प्रश्न 32** *(Domain 2 — Task 2.1)*
एक media कंपनी के पास एक video-publishing workflow है जिसमें एक step है जो जारी रखने से पहले एक external tool के माध्यम से सामग्री को अनुमोदित करने के लिए एक human moderator की 2 दिन तक प्रतीक्षा करता है। workflow auditable होना चाहिए, दिनों तक चलना चाहिए, और moderator के जवाब देने के बाद ठीक उसी जगह से फिर से शुरू होना चाहिए जहाँ यह रुका था। कौन सा समाधान सबसे अच्छा फिट होता है?

A) एक Wait state के साथ एक Express Step Functions workflow
B) callback pattern का उपयोग करने वाला एक Standard Step Functions workflow: एक task token (waitForTaskToken) moderation system को भेजा जाता है, और SendTaskSuccess बुलाए जाने पर workflow फिर से शुरू होता है
C) एक Lambda function जो moderator के अनुमोदन तक sleep करता है
D) एक 2-दिन scheduled delay के साथ एक EventBridge rule

**प्रश्न 33** *(Domain 2 — Task 2.1)*
एक कंपनी एक high-volume IoT ingestion pipeline चलाती है जो प्रति सेकंड लगभग 90,000 short workflow executions निष्पादित करती है, प्रत्येक 5 सेकंड से कम में पूरी होती है। Exactly-once execution semantics आवश्यक नहीं हैं, लेकिन लागत कम की जानी चाहिए। अलग से, एक मासिक financial reconciliation workflow 12 घंटे चलता है और पूर्ण execution history के साथ exactly-once execution की आवश्यकता है। किन Step Functions workflow प्रकारों का उपयोग किया जाना चाहिए?

A) IoT pipeline के लिए Express workflows; reconciliation के लिए Standard workflows
B) दोनों के लिए Standard workflows
C) दोनों के लिए Express workflows, क्योंकि Express एक वर्ष तक execution का समर्थन करता है
D) IoT pipeline के लिए Standard workflows; reconciliation के लिए Express workflows

**प्रश्न 34** *(Domain 2 — Task 2.2)*
एक कंपनी अपने primary web application को us-east-1 में एक ALB पर और एक passive recovery प्रति को us-west-2 में होस्ट करती है। कंपनी चाहती है कि Route 53 सभी traffic को us-east-1 पर भेजे और केवल तभी उपयोगकर्ताओं को us-west-2 पर स्वचालित रूप से redirect करे जब primary endpoint अस्वस्थ हो जाए। कौन सा Route 53 configuration इस आवश्यकता को पूरा करता है?

A) 50/50 weights के साथ Weighted routing
B) primary record पर एक health check और us-west-2 record को secondary के रूप में सेट करने के साथ Failover routing
C) दो Regions के बीच Latency-based routing
D) us-west-2 की ओर इशारा करने वाले एक default record के साथ Geolocation routing

**प्रश्न 35** *(Domain 2 — Task 2.2)*
एक Auto Scaling group तीन Availability Zones में एक Application Load Balancer के पीछे EC2 web servers चलाता है। ALB कुछ instances को अस्वस्थ चिह्नित करता है क्योंकि web server process क्रैश हो जाता है, फिर भी Auto Scaling group उन्हें कभी प्रतिस्थापित नहीं करता क्योंकि EC2 instances स्वयं अभी भी status checks पास करते हैं। solutions architect को क्या बदलना चाहिए?

A) instances पर detailed CloudWatch monitoring सक्षम करें
B) Auto Scaling group को EC2 status checks के अलावा ELB health checks का उपयोग करने के लिए कॉन्फ़िगर करें, ताकि ALB target health में विफल होने वाले instances समाप्त और प्रतिस्थापित हो जाएँ
C) ASG health check grace period बढ़ाएँ
D) ALB को एक Network Load Balancer पर स्विच करें

**प्रश्न 36** *(Domain 2 — Task 2.1)*
एक trading firm को एक custom TCP protocol के लिए एक load balancer चाहिए जिसे ultra-low latency के साथ प्रति सेकंड लाखों requests संभालने और प्रति Availability Zone एक static IP address एक्सपोज़ करने में सक्षम होना चाहिए। firm को कौन सा load balancer चुनना चाहिए?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**प्रश्न 37** *(Domain 2 — Task 2.2)*
AWS पर लचीला storage बनाने के बारे में कौन से दो कथन सटीक हैं? (Choose TWO.)

A) S3 Cross-Region Replication पूर्वव्यापी रूप से उन सभी objects को कॉपी करता है जो replication कॉन्फ़िगर होने से पहले मौजूद थे, बिना किसी अतिरिक्त action के
B) Amazon EFS Standard storage classes डेटा को कई Availability Zones में अनावश्यक रूप से संग्रहीत करते हैं और विभिन्न AZs में instances द्वारा एक साथ mount किए जा सकते हैं
C) S3 Cross-Region Replication के लिए source और destination दोनों buckets पर versioning सक्षम होना आवश्यक है
D) Amazon EFS volumes एक समय में केवल एक EC2 instance से जुड़े जा सकते हैं, EBS की तरह
E) S3 versioning सक्षम करना स्वचालित रूप से objects को एक अन्य Region में दोहराता है

---

## भाग 3 — Design High-Performing Architectures (प्रश्न 38–53)

**प्रश्न 38** *(Domain 3 — Task 3.1)*
एक media analytics कंपनी एक gp3 EBS volume का उपयोग करते हुए Amazon RDS पर एक PostgreSQL database चलाती है। एक नए reporting workload को sub-millisecond latency और 99.999% की एक durability गारंटी के साथ निरंतर 50,000 IOPS की आवश्यकता है। volume को इसे bursting के बिना लगातार समर्थन करना चाहिए। एक solutions architect को किस EBS volume प्रकार की सिफारिश करनी चाहिए?

A) अधिकतम IOPS के साथ provisioned gp3
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) 16 TiB के volume size के साथ gp2

**प्रश्न 39** *(Domain 3 — Task 3.1)*
एक genomics research firm को 500 EC2 instances के एक Linux-based high-performance computing (HPC) cluster के लिए साझा file storage की आवश्यकता है। workload को sub-millisecond latencies और सैकड़ों GB/s aggregate throughput की आवश्यकता है, और input datasets Amazon S3 में staged हैं। कौन सी storage सेवा इन आवश्यकताओं को सबसे अच्छा पूरा करती है?

A) Max I/O performance mode के साथ Amazon EFS
B) SSD storage के साथ Amazon FSx for Windows File Server
C) S3 bucket से linked Amazon FSx for Lustre
D) प्रत्येक instance पर Mountpoint के माध्यम से एक्सेस किया गया Amazon S3

**प्रश्न 40** *(Domain 3 — Task 3.1)*
एक कंपनी एक on-premises Windows application को migrate कर रही है जो SMB file shares और Active Directory–integrated access control lists पर निर्भर है। एप्लिकेशन दो Availability Zones में EC2 Windows instances पर चलेगा और उसे अपनी मौजूदा NTFS permissions रखनी चाहिए। solutions architect को कौन सी AWS storage सेवा चुननी चाहिए?

A) POSIX permissions के साथ Amazon EFS
B) Multi-AZ deployment mode में Amazon FSx for Windows File Server
C) AD groups से मैप की गई bucket policies के साथ Amazon S3
D) persistent storage के साथ Amazon FSx for Lustre

**प्रश्न 41** *(Domain 3 — Task 3.1)*
सिंगापुर में एक video production कंपनी दुनिया भर के कार्यालयों से us-east-1 में एक S3 bucket में 40 GB raw footage फ़ाइलें अपलोड करती है। अपलोड अक्सर सार्वजनिक इंटरनेट पर बीच में विफल हो जाते हैं, पूर्ण पुनरारंभ के लिए मजबूर करते हुए, और समग्र transfer समय धीमा है। solutions architect को actions के किस संयोजन की सिफारिश करनी चाहिए? (Choose TWO.)

A) write throughput सुधारने के लिए bucket को S3 One Zone-IA में बदलें
B) प्रत्येक region में एक Application Load Balancer के साथ bucket को front करें
C) ap-southeast-1 में एक bucket में S3 Cross-Region Replication सक्षम करें
D) bucket पर S3 Transfer Acceleration सक्षम करें और accelerated endpoint के माध्यम से अपलोड करें
E) बड़ी फ़ाइलों के लिए multipart upload का उपयोग करें

**प्रश्न 42** *(Domain 3 — Task 3.1)*
एक real-time bidding platform EC2 पर एक NoSQL workload चलाता है जिसे अस्थायी scratch data के लिए बिल्कुल सबसे कम storage latency की आवश्यकता है। डेटा startup पर पुनर्जीवित होता है और इंस्टेंस stop या termination में जीवित रहने की आवश्यकता नहीं है। कौन सा storage विकल्प इस उपयोग मामले के लिए उच्चतम प्रदर्शन प्रदान करता है?

A) 64,000 provisioned IOPS के साथ io2 EBS volume
B) एक storage-optimized instance पर Instance store (NVMe SSD) volumes
C) General Purpose mode में Amazon EFS
D) अधिकतम provisioned throughput के साथ gp3 EBS volume

**प्रश्न 43** *(Domain 3 — Task 3.3)*
एक gaming कंपनी player session data को partition key `game_id` के साथ एक DynamoDB table में संग्रहीत करती है। केवल 12 लोकप्रिय games हैं, और table कुछ partitions पर throttling का अनुभव कर रहा है जबकि समग्र consumed capacity provisioned capacity से बहुत नीचे है। solutions architect को क्या सिफारिश करनी चाहिए?

A) table को auto scaling के साथ provisioned capacity पर स्विच करें
B) एक high-cardinality partition key का उपयोग करें, जैसे game_id और player_id का एक composite
C) player_id पर एक local secondary index बनाएँ
D) partitions में writes फैलाने के लिए DynamoDB Streams सक्षम करें

**प्रश्न 44** *(Domain 3 — Task 3.3)*
एक e-commerce site product catalog data को DynamoDB में संग्रहीत करती है। Read traffic अत्यधिक read-heavy है जिसमें एक ही items प्रतिदिन लाखों बार अनुरोधित किए जाते हैं, और टीम को एप्लिकेशन की DynamoDB API calls को फिर से लिखे बिना माइक्रोसेकंड read latency की आवश्यकता है। solutions architect को क्या सिफारिश करनी चाहिए?

A) Amazon ElastiCache for Redis तैनात करें और एप्लिकेशन को पहले cache जाँचने के लिए संशोधित करें
B) table के सामने DynamoDB Accelerator (DAX) जोड़ें
C) reads वितरित करने के लिए एक global secondary index बनाएँ
D) एक दूसरे region में DynamoDB Global Tables सक्षम करें

**प्रश्न 45** *(Domain 3 — Task 3.3)*
एक logistics कंपनी के पास production में एक DynamoDB table है जिसे एक नए query pattern की आवश्यकता है: `carrier_id` द्वारा shipments को query करना और `delivery_date` द्वारा sorting करना, अपने स्वयं के provisioned throughput के साथ ताकि नई analytics queries मुख्य एप्लिकेशन को प्रभावित न करें। table पहले से मौजूद है और live traffic है। कौन सा समाधान इन आवश्यकताओं को पूरा करता है?

A) carrier_id को sort key के रूप में एक local secondary index बनाएँ
B) carrier_id को partition key और delivery_date को sort key के रूप में एक global secondary index बनाएँ
C) carrier_id और delivery_date की एक composite primary key के साथ table को फिर से बनाएँ
D) एक DynamoDB Stream सक्षम करें और carrier_id द्वारा stream को query करें

**प्रश्न 46** *(Domain 3 — Task 3.3)*
एक session-management सेवा user sessions को DynamoDB में संग्रहीत करती है। Sessions 24 घंटे के बाद बेकार हो जाते हैं, और टीम चाहती है कि expired items बिना किसी अतिरिक्त लागत के स्वचालित रूप से हटा दिए जाएँ। solutions architect को क्या लागू करना चाहिए?

A) एक scheduled Lambda function जो table को प्रति घंटा स्कैन करता है और पुराने items हटा देता है
B) प्रत्येक item पर एक expiration timestamp attribute के साथ DynamoDB Time to Live (TTL)
C) DynamoDB table पर एक lifecycle policy
D) 24 घंटे से पुराने items छोड़ने के लिए एक filter के साथ DynamoDB Streams

**प्रश्न 47** *(Domain 3 — Task 3.3)*
एक serverless एप्लिकेशन Lambda functions का उपयोग करता है जो एक Amazon RDS for MySQL database से जुड़ते हैं। traffic spikes के दौरान, सैकड़ों concurrent Lambda invocations database की connection limit समाप्त कर देते हैं, errors पैदा करते हुए। कौन सा समाधान इसे सबसे कम एप्लिकेशन बदलाव के साथ संबोधित करता है?

A) max_connections बढ़ाने के लिए RDS instance size बढ़ाएँ
B) Lambda functions और database के बीच Amazon RDS Proxy रखें
C) database को DynamoDB में migrate करें
D) 10 का Lambda reserved concurrency कॉन्फ़िगर करें

**प्रश्न 48** *(Domain 3 — Task 3.3)*
एक financial news site Amazon Aurora MySQL का उपयोग करती है। Read traffic market hours के दौरान 20x बढ़ता है और primary instance SELECT queries सर्व करते हुए CPU-bound है। Writes मामूली हैं। reads को scale करने का सबसे अधिक operationally efficient तरीका क्या है?

A) Aurora Replicas जोड़ें और auto scaling के साथ read traffic को cluster reader endpoint पर निर्देशित करें
B) एक Multi-AZ standby बनाएँ और reads को standby पर भेजें
C) database को कई Aurora clusters में shard करें
D) reads को offload करने के लिए Aurora Backtrack सक्षम करें

**प्रश्न 49** *(Domain 3 — Task 3.4)*
एक multiplayer gaming कंपनी दो AWS Regions में Network Load Balancers पर UDP protocol का उपयोग करते हुए एक latency-sensitive एप्लिकेशन चलाती है। दुनिया भर के खिलाड़ियों को allow-listing और fast regional failover के लिए static IP addresses की आवश्यकता है। solutions architect को कौन सी सेवा चुननी चाहिए?

A) दो custom origins के साथ Amazon CloudFront
B) दोनों regions में endpoint groups के साथ AWS Global Accelerator
C) latency-based routing के साथ Amazon Route 53
D) cross-zone load balancing के साथ एक Application Load Balancer

**प्रश्न 50** *(Domain 3 — Task 3.4)*
एक streaming कंपनी को content licensing नियमों का पालन करना चाहिए: जर्मनी में उपयोगकर्ताओं को हमेशा eu-central-1 deployment से सर्व किया जाना चाहिए, और फ्रांस में उपयोगकर्ताओं को eu-west-3 deployment से, चाहे कोई भी endpoint कम latency प्रदान करता हो। कौन सी Route 53 routing policy का उपयोग किया जाना चाहिए?

A) Latency-based routing
B) Geolocation routing
C) eu-central-1 पर एक positive bias के साथ Geoproximity routing
D) 50/50 weights के साथ Weighted routing

**प्रश्न 51** *(Domain 3 — Task 3.2)*
एक solutions architect एक tightly coupled HPC workload तैनात कर रहा है जो MPI का उपयोग करता है और 32 EC2 instances के बीच सबसे कम संभव network latency और उच्चतम packet-per-second प्रदर्शन की आवश्यकता है। कौन सी placement रणनीति का उपयोग किया जाना चाहिए?

A) तीन Availability Zones में Spread placement group
B) 7 partitions के साथ Partition placement group
C) एक एकल Availability Zone में Cluster placement group
D) enhanced networking के साथ अलग subnets में instances लॉन्च करें

**प्रश्न 52** *(Domain 3 — Task 3.5)*
एक IoT कंपनी clickstream data ingest करती है जिसे analytics के लिए Amazon S3 में लगभग real time में पहुँचाया जाना चाहिए। टीम एक पूरी तरह प्रबंधित समाधान चाहती है जिसमें लिखने के लिए कोई consumer applications न हों, कोई shard management न हो, और built-in record buffering तथा Parquet में format conversion हो। उन्हें कौन सी सेवा का उपयोग करना चाहिए?

A) एक Lambda consumer के साथ Amazon Kinesis Data Streams
B) एक S3 destination के साथ Amazon Data Firehose (पूर्व में Kinesis Data Firehose)
C) EC2 pollers के एक fleet के साथ Amazon SQS
D) एक custom Kafka Connect sink के साथ Amazon MSK

**प्रश्न 53** *(Domain 3 — Task 3.5)*
एक कंपनी application logs को Amazon S3 में compressed JSON फ़ाइलों के रूप में संग्रहीत करती है और चाहती है कि analysts servers प्रावधानित किए बिना या डेटा को एक database में लोड किए बिना उनके विरुद्ध ad hoc SQL queries चलाएँ। schema को स्वचालित रूप से खोजा और cataloged किया जाना चाहिए। solutions architect को किस संयोजन की सिफारिश करनी चाहिए?

A) COPY commands और scheduled refreshes के साथ Amazon Redshift
B) Data Catalog को populate करने के लिए AWS Glue crawlers और SQL queries के लिए Amazon Athena
C) एक long-running Presto cluster के साथ Amazon EMR
D) aws_s3 extension के साथ Amazon RDS for PostgreSQL

---

## भाग 4 — Design Cost-Optimized Architectures (प्रश्न 54–65)

**प्रश्न 54** *(Domain 4 — Task 4.2)*
एक research institute EC2 पर nightly batch simulations चलाता है जो लगभग 90 मिनट लेती हैं, हर 5 मिनट में Amazon S3 में progress checkpoint करती हैं, और किसी भी समय अंतिम checkpoint से फिर से शुरू की जा सकती हैं। institute सबसे कम संभव compute लागत चाहता है। solutions architect को कौन सा purchasing विकल्प सिफारिश करना चाहिए?

A) एक एकल AZ में On-Demand Instances
B) 3-वर्ष term के साथ Standard Reserved Instances
C) कई instance types और AZs में diversified एक Spot Fleet का उपयोग करते हुए Spot Instances
D) batch workload के peak के अनुसार आकारित एक Compute Savings Plan

**प्रश्न 55** *(Domain 4 — Task 4.2)*
एक SaaS कंपनी का एक स्थिर baseline compute खर्च है लेकिन अगले तीन वर्षों में modernize करते हुए workloads को EC2, AWS Fargate, और AWS Lambda के बीच migrate करने की उम्मीद करती है। वह एक commitment-based छूट चाहती है जो स्वचालित रूप से तीनों compute सेवाओं और सभी regions में लागू हो। solutions architect को कौन सा विकल्प सिफारिश करना चाहिए?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**प्रश्न 56** *(Domain 4 — Task 4.2)*
एक कंपनी ने Amazon RDS और Amazon EC2 के लिए 3-वर्ष Standard Reserved Instances खरीदे। एक re-architecture के बाद, उसे किसी भी reservation की अब आवश्यकता नहीं है। finance टीम पूछती है कि लागत वसूलने के लिए कौन से reservations बेचे जा सकते हैं। solutions architect को उन्हें क्या बताना चाहिए?

A) EC2 और RDS दोनों Reserved Instances Reserved Instance Marketplace पर बेचे जा सकते हैं
B) केवल EC2 Reserved Instances Reserved Instance Marketplace पर बेचे जा सकते हैं; RDS RIs को फिर से नहीं बेचा जा सकता
C) केवल RDS Reserved Instances बेचे जा सकते हैं, क्योंकि database reservations हस्तांतरणीय हैं
D) कोई भी नहीं बेचा जा सकता; Reserved Instances सभी मामलों में non-refundable और non-transferable हैं

**प्रश्न 57** *(Domain 4 — Task 4.2)*
एक development टीम Amazon ECS पर EC2 Spot capacity के साथ containerized fault-tolerant data processing चलाती है। उन्हें workers को reclamation से पहले gracefully drain और checkpoint करने की आवश्यकता है। एक Spot Instance बाधित होने से पहले AWS कितनी अग्रिम चेतावनी प्रदान करता है?

A) कोई चेतावनी प्रदान नहीं की जाती
B) एक 2-मिनट interruption notice
C) एक 15-मिनट interruption notice
D) एक 24-घंटे rebalance window

**प्रश्न 58** *(Domain 4 — Task 4.1)*
एक healthcare archive Amazon S3 में compliance records संग्रहीत करता है जो शायद ही कभी एक्सेस किए जाते हैं लेकिन, जब subpoenaed होते हैं, तो 5 मिनट के भीतर retrievable होने चाहिए। records 7 वर्षों तक रखे जाते हैं और storage लागत कम की जानी चाहिए। कौन सी storage class इन आवश्यकताओं को पूरा करती है?

A) Standard retrieval के साथ S3 Glacier Deep Archive
B) आवश्यकता पड़ने पर Expedited retrievals के साथ S3 Glacier Flexible Retrieval
C) Bulk retrievals के साथ S3 Glacier Flexible Retrieval
D) S3 Standard-IA

**प्रश्न 59** *(Domain 4 — Task 4.1)*
एक photo-sharing startup आसानी से पुनरुत्पादन योग्य thumbnail images संग्रहीत करता है जो अक्सर एक्सेस नहीं किए जाते। टीम सबसे कम-लागत infrequent-access विकल्प चाहती है और स्वीकार करती है कि एक एकल Availability Zone की हानि के लिए originals से thumbnails को फिर से उत्पन्न करने की आवश्यकता हो सकती है। कौन सी storage class का उपयोग किया जाना चाहिए?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**प्रश्न 60** *(Domain 4 — Task 4.1)*
एक कंपनी के पास लाखों objects वाला एक S3 bucket है जिनके access patterns अज्ञात हैं और अप्रत्याशित रूप से बदलते हैं। एक solutions architect S3 Intelligent-Tiering का मूल्यांकन कर रहा है। Intelligent-Tiering के बारे में कौन से दो कथन सटीक हैं? (Choose TWO.)

A) यह उन objects के लिए एक छोटा per-object monitoring और automation शुल्क लेता है जिनकी यह निगरानी करता है
B) यह हर बार जब कोई object Frequent Access tier पर वापस जाता है तब retrieval fees लेता है
C) 128 KB से छोटे objects की निगरानी या auto-tier नहीं की जाती और उन्हें Frequent Access tier दर पर बिल किया जाता है
D) यह स्वचालित रूप से objects को एक दूसरे region में दोहराता है
E) इसे प्रत्येक object के लिए 90-दिन न्यूनतम storage अवधि की आवश्यकता है

**प्रश्न 61** *(Domain 4 — Task 4.1)*
एक analytics टीम अक्सर एक S3 data lake bucket पर बड़े multipart uploads को abort करती है, और AWS Cost Explorer दिखाता है कि storage charges बढ़ रहे हैं भले ही bucket का दृश्यमान object count स्थिर हो। सबसे अधिक cost-effective सुधार क्या है?

A) orphaned parts को ट्रैक करने के लिए S3 Versioning सक्षम करें
B) एक lifecycle rule जोड़ें जो एक निर्धारित संख्या में दिनों के बाद incomplete multipart uploads को abort करती है
C) bucket को S3 One Zone-IA में migrate करें
D) अपलोड को तेज़ी से समाप्त करने के लिए S3 Transfer Acceleration चालू करें

**प्रश्न 62** *(Domain 4 — Task 4.1)*
एक कंपनी का EC2 fleet सैकड़ों gp2 EBS volumes का उपयोग करता है जो केवल baseline IOPS प्राप्त करने के लिए बड़े आकार के हैं। Utilization reviews दिखाती हैं कि IOPS आवश्यक हैं लेकिन अधिकांश capacity नहीं है। प्रदर्शन खोए बिना storage लागत कम करने के लिए solutions architect को क्या करना चाहिए?

A) volumes को io2 में migrate करें और समान IOPS प्रावधानित करें
B) volumes को gp3 में migrate करें, capacity को right-size करें, और IOPS को स्वतंत्र रूप से प्रावधानित करें
C) volumes को st1 throughput-optimized HDD में बदलें
D) volumes को रोज़ snapshot करें और originals हटा दें

**प्रश्न 63** *(Domain 4 — Task 4.4)*
private subnets में एक data pipeline एक NAT gateway के माध्यम से समान region में EC2 instances से Amazon S3 में प्रति माह 60 TB transfer करती है, जो बड़े data processing charges उत्पन्न करती है। सबसे अधिक cost-effective बदलाव क्या है?

A) NAT gateway को एक बड़े EC2 instance पर एक NAT instance से बदलें
B) S3 के लिए एक gateway VPC endpoint बनाएँ और traffic को इसके माध्यम से route करें
C) S3 के लिए एक interface VPC endpoint (PrivateLink) बनाएँ
D) EC2 instances को public IPv4 addresses के साथ public subnets में स्थानांतरित करें

**प्रश्न 64** *(Domain 4 — Task 4.4)*
एक startup का मासिक बिल VPC के भीतर केवल अन्य AWS सेवाओं को call करने वाले दर्जनों EC2 instances में in-use public IPv4 addresses के लिए अप्रत्याशित charges दिखाता है। finance टीम अगले महीने का समग्र खर्च एक threshold से अधिक होने से पहले alerts भी चाहती है। solutions architect को actions का कौन सा संयोजन लेना चाहिए? (Choose TWO.)

A) प्रत्येक instance पर public IPv4 को Elastic IPs से बदलें, जो attached रहते हुए हमेशा मुफ़्त हैं
B) public IPv4 addresses हटाएँ और private connectivity (आवश्यकतानुसार VPC endpoints/NAT) का उपयोग करें, क्योंकि AWS उपयोग में public IPv4 addresses के लिए शुल्क लेता है
C) threshold से ऊपर खर्च को block करने के लिए AWS Compute Optimizer का उपयोग करें
D) मासिक खर्च को cap करने के लिए AWS Shield Advanced सक्षम करें
E) एक alert threshold और email notification के साथ एक AWS Budgets cost budget बनाएँ

**प्रश्न 65** *(Domain 4 — Task 4.3)*
एक development environment एक Amazon Aurora PostgreSQL cluster का उपयोग करता है जो रातों और सप्ताहांत में निष्क्रिय रहता है लेकिन जब developers कनेक्ट होते हैं तब बिना मैन्युअल हस्तक्षेप या instance resizing के स्वचालित रूप से जागना चाहिए। निष्क्रिय रहते हुए compute के लिए लागत शून्य के करीब गिरनी चाहिए। कौन सा समाधान इन आवश्यकताओं को पूरा करता है?

A) 0 ACUs की एक minimum capacity के साथ कॉन्फ़िगर किया गया Aurora Serverless v2 ताकि निष्क्रिय होने पर यह auto-pause हो
B) हर रात एक scheduled Lambda function द्वारा रोका गया एक provisioned Aurora cluster
C) एक headless secondary cluster के साथ एक Aurora global database
D) रात में scaled in दो reader instances के साथ provisioned Aurora

---

## Answer Key

### भाग 1 — प्रश्न 1–20

**1. उत्तर: B** — SCPs कभी भी संगठन के management account पर लागू नहीं होते, इसलिए इसके principals Region restrictions से अप्रभावित रहते हैं। *अन्य क्यों नहीं:* A — SCPs nested OUs के माध्यम से वंशानुगत होते हैं; C — IAM Allows member accounts में एक SCP Deny को override नहीं कर सकते; D — SCPs attachment point के तहत सभी वर्तमान और भविष्य के खातों पर तुरंत लागू होते हैं।

**2. उत्तर: C** — role-creation actions पर एक condition के रूप में लागू एक permissions boundary developers द्वारा बनाए गए किसी भी role की अधिकतम permissions को cap करती है, self-service संरक्षित करते हुए privilege escalation रोकती है। *अन्य क्यों नहीं:* A — मैन्युअल समीक्षा operational overhead जोड़ती है और self-service हटाती है; B — iam:CreateRole अस्वीकार करना वैध workflow को block करता है; D — CloudTrail alerts detective हैं, preventive नहीं।

**3. उत्तर: B** — trust policy की condition में सत्यापित एक customer-defined ExternalId सुनिश्चित करता है कि SaaS provider केवल सही customer की ओर से role assume करे, confused deputy समस्या को कम करते हुए। *अन्य क्यों नहीं:* A — MFA स्वचालित service-to-service assumption के लिए अव्यावहारिक है और deputy confusion को संबोधित नहीं करता; C — एक ARN (जो गुप्त नहीं है) को encrypt करना कुछ हल नहीं करता; D — दीर्घकालिक IAM user keys roles से कम सुरक्षित हैं।

**4. उत्तर: B** — IAM Identity Center Entra ID के साथ एक बार federate करता है और एक एकल access portal के माध्यम से सभी organization accounts में केंद्रीय रूप से permission sets सौंपता है। *अन्य क्यों नहीं:* A — प्रति-खाता IAM users बिल्कुल वह overhead है जिससे बचना है; C — Cognito application (customer) identities के लिए है, AWS खातों तक workforce access के लिए नहीं; D — मैन्युअल प्रति-खाता SAML setup काम करता है लेकिन इसमें कहीं अधिक operational overhead है।

**5. उत्तर: A** — User pools प्रमाणीकरण संभालते हैं (email/social sign-in); identity pools परिणामी tokens को S3 तक पहुँचने के लिए IAM roles द्वारा scoped अस्थायी AWS credentials के लिए विनिमय करते हैं। *अन्य क्यों नहीं:* B — दोनों सेवाओं के उद्देश्य उलट देता है; C — IAM Identity Center workforce users के लिए है, app customers के लिए नहीं; D — user pool tokens (JWTs) स्वयं AWS service access प्रदान नहीं करते।

**6. उत्तर: B** — एक customer managed key key policy, usage logging, और disabling का पूर्ण नियंत्रण देता है, और स्वचालित rotation (डिफ़ॉल्ट रूप से वार्षिक) का समर्थन करता है। *अन्य क्यों नहीं:* A — AWS managed keys आपको key policy संपादित करने या key को disable करने नहीं देतीं; C — AWS owned keys ग्राहक के लिए पूरी तरह अदृश्य हैं; D — imported (BYOK) key material स्वचालित rotation का समर्थन नहीं करता।

**7. उत्तर: B** — Envelope encryption: KMS एक data key उत्पन्न करता है; डेटा को plaintext data key के साथ स्थानीय रूप से encrypt किया जाता है, जिसे त्याग दिया जाता है, जबकि data key की KMS-encrypted प्रति ciphertext के साथ संग्रहीत की जाती है। *अन्य क्यों नहीं:* A और C — KMS कभी भी बड़े payloads को सीधे या streaming के माध्यम से encrypt नहीं करता; D — hard-coded keys एक anti-pattern हैं और envelope encryption नहीं हैं।

**8. उत्तर: C** — Secrets Manager की alternating-users रणनीति दो credentials बनाए रखती है और उन्हें बारी-बारी से rotate करती है, इसलिए पिछली credential का उपयोग करने वाले मौजूदा connections rotation के दौरान काम करते रहते हैं। *अन्य क्यों नहीं:* A — Parameter Store में कोई built-in rotation नहीं है; आप यह सब खुद बनाएँगे; B — single-user rotation पुराने password को तुरंत अमान्य कर देती है, connection failures का जोखिम उठाते हुए; D — KMS rotation encryption key material को rotate करती है, database passwords को नहीं।

**9. उत्तर: C** — SSE-C ग्राहक को हर अनुरोध के साथ encryption key आपूर्ति करने देता है; AWS operation के लिए इसे memory में उपयोग करता है और इसे कभी संग्रहीत नहीं करता। *अन्य क्यों नहीं:* A — SSE-S3 keys पूरी तरह AWS-managed हैं; B — SSE-KMS keys AWS KMS में संग्रहीत हैं; D — aws/s3 एक AWS-managed KMS key है और बिल्कुल client-side नहीं है।

**10. उत्तर: B** — Object Lock compliance mode root सहित किसी भी user द्वारा deletion या overwriting को retention समाप्त होने तक रोकता है, और Object Lock को versioning की आवश्यकता है। *अन्य क्यों नहीं:* A — governance mode को s3:BypassGovernanceRetention वाले users द्वारा bypass किया जा सकता है; C — एक bucket policy को root user द्वारा संशोधित या हटाया जा सकता है; D — lifecycle expiration अवधि के दौरान deletion नहीं रोकता।

**11. उत्तर: B** — NACLs stateless हैं, इसलिए clients के ephemeral source ports को response traffic को स्पष्ट रूप से outbound अनुमत किया जाना चाहिए। *अन्य क्यों नहीं:* A — NACLs stateless हैं, stateful नहीं; C — security groups stateful हैं, इसलिए return traffic स्वचालित है; D — 0.0.0.0/0 NACL rules में पूरी तरह मान्य है।

**12. उत्तर: A, B** — Security groups stateful हैं (return traffic auto-allowed), और NACLs क्रम में numbered rules प्रोसेस करते हैं और Deny का समर्थन करते हैं। *अन्य क्यों नहीं:* C — security groups केवल Allow rules का समर्थन करते हैं; D — NACLs subnets से जुड़ते हैं, ENIs से नहीं (security groups ENIs से जुड़ते हैं); E — security group rules सभी एक साथ बिना ordering के मूल्यांकित होते हैं।

**13. उत्तर: B** — Shield Advanced CloudFront और ALB जैसे protected resources के लिए Shield Response Team, DDoS cost protection, और attack visibility/diagnostics प्रदान करता है। *अन्य क्यों नहीं:* A — Shield Standard स्वचालित है लेकिन इसमें कोई SRT access या cost protection शामिल नहीं है; C — WAF layer-7 request patterns को संबोधित करता है, पूरी आवश्यकता सेट को नहीं; D — GuardDuty threat detection है, DDoS protection नहीं।

**14. उत्तर: B** — ALB पर AWS WAF SQLi managed rule group और एक rate-based rule के साथ दोनों attack patterns को बिना किसी application code बदलाव के block करता है। *अन्य क्यों नहीं:* A — उच्च development प्रयास; C — Shield Standard L3/L4 floods को कवर करता है, SQL injection को नहीं; D — security groups request content का निरीक्षण नहीं कर सकते।

**15. उत्तर: B** — GuardDuty = logs और threat intel से threat detection; Macie = S3 में sensitive-data (PII) खोज; Inspector = EC2, ECR images, और Lambda की vulnerability (CVE) scanning। *अन्य क्यों नहीं:* A, C, D — प्रत्येक service-to-purpose mappings में से कम से कम दो को उलझाता है।

**16. उत्तर: B** — Gateway endpoints ठीक S3 और DynamoDB के लिए मौजूद हैं, traffic को AWS नेटवर्क पर रखते हैं, और इनमें कोई hourly या data processing शुल्क नहीं है। *अन्य क्यों नहीं:* A — NAT gateway public IP space के माध्यम से route करता है और per-hour/per-GB लागत आती है; C — interface endpoints hourly और data charges लेते हैं, इसलिए lowest cost नहीं; D — एक internet gateway traffic को सार्वजनिक इंटरनेट पर भेजता है।

**17. उत्तर: A** — IMDSv2 को एक PUT request के माध्यम से प्राप्त एक session token की आवश्यकता है, जिसे सामान्य SSRF vectors नहीं कर सकते; HttpTokens=required लागू करना IMDSv1 credential theft को block करता है। *अन्य क्यों नहीं:* B — कई agents और SDKs वैध रूप से IMDS की आवश्यकता रखते हैं; C — NACLs एक instance और उसके अपने metadata endpoint के बीच link-local traffic को प्रभावित नहीं करते; D — files में static credentials role credentials से कहीं बदतर हैं।

**18. उत्तर: C** — Standard Parameter Store parameters मुफ़्त हैं और plaintext config के लिए ठीक हैं; Secrets Manager केवल 5 passwords के लिए built-in rotation जोड़ता है, लागत कम करते हुए। *अन्य क्यों नहीं:* A — 200 plain config values के लिए Secrets Manager per-secret pricing भुगतान करना फ़िज़ूलखर्ची है; B — Parameter Store अकेले passwords के लिए कोई native rotation नहीं है; D — Parameter Store में कोई built-in स्वचालित rotation नहीं है, इसलिए यह विकल्प एक ऐसी capability बताता है जो मौजूद नहीं है।

**19. उत्तर: B** — S3 Bucket Keys S3 को KMS key से एक time-limited bucket-level data key उत्पन्न करने देते हैं, per-object KMS requests (और लागत) को नाटकीय रूप से कम करते हुए जबकि SSE-KMS बने रहते हुए। *अन्य क्यों नहीं:* A — SSE-S3 KMS आवश्यकता को छोड़ देता है; C — rotation frequency per-request API volume को प्रभावित नहीं करती; D — imported key material request counts को नहीं बदलता।

**20. उत्तर: B, D** — Explicit Deny policy evaluation में हमेशा किसी भी Allow पर जीतता है, और permissions boundaries केवल cap करती हैं (कभी grant नहीं) permissions। *अन्य क्यों नहीं:* A — SCPs guardrails हैं जो उपलब्ध permissions सीमित करते हैं; वे कुछ grant नहीं करते; C — resource-based policies नियमित रूप से अपने आप cross-account access प्रदान करती हैं; E — जब कुछ भी किसी action की अनुमति नहीं देता तब IAM implicit deny पर डिफ़ॉल्ट होता है।

### भाग 2 — प्रश्न 21–37

**21. उत्तर: C** — Multi-AZ AZ विफलता के लिए स्वचालित failover प्रदान करता है; read replicas reporting read traffic को अवशोषित करते हैं — दो अलग समस्याओं के लिए दो सुविधाएँ। *अन्य क्यों नहीं:* A — एक पारंपरिक Multi-AZ standby reads सर्व नहीं कर सकता; B — replica promotion मैन्युअल (या scripted) है और replicas अकेले स्वचालित HA failover नहीं देते; D — एक बड़ा single-AZ instance AZ resilience पर दोनों आवश्यकताओं में विफल होता है।

**22. उत्तर: B** — एक Multi-AZ DB cluster deployment तीन AZs में एक writer और दो readable standbys चलाता है, एक reader endpoint के साथ, इसलिए standby capacity reads सर्व करती है जबकि अभी भी fast स्वचालित failover का समर्थन करती है। *अन्य क्यों नहीं:* A — एक instance deployment में एकल standby कोई traffic सर्व नहीं करता; C — read replicas प्रबंधित स्वचालित failover प्रदान नहीं करते और RDS databases ALB के माध्यम से load-balanced नहीं होते; D — Single-AZ में कोई failover बिल्कुल नहीं है।

**23. उत्तर: B** — Aurora Global Database प्रतिकृति storage layer पर asynchronous है जिसमें सामान्य sub-second लैग होता है, इसलिए cross-Region RPO शून्य के करीब है लेकिन कभी बिल्कुल 0 की गारंटी नहीं हो सकती। *अन्य क्यों नहीं:* A — प्रतिकृति Regions में synchronous नहीं है; C — write forwarding writes को primary पर route करता है; यह प्रतिकृति semantics नहीं बदलता; D — प्रतिकृति लैग आमतौर पर एक सेकंड से कम है, 5-मिनट schedule नहीं।

**24. उत्तर: B** — Recovery Time Objective अधिकतम सहनीय downtime है (4 घंटे); Recovery Point Objective अधिकतम सहनीय data loss window है (15 मिनट)। *अन्य क्यों नहीं:* A — परिभाषाएँ उलट देता है; C — MTBF/MTTR reliability statistics हैं, DR objectives नहीं; D — SLA एक contractual प्रतिबद्धता है, data-loss metric नहीं।

**25. उत्तर: B** — Pilot light डेटा को निरंतर दोहराया रखता है और core resources प्रावधानित लेकिन बंद रखता है, कम लागत पर tens of minutes का RTO देते हुए — एक सटीक मेल। *अन्य क्यों नहीं:* A — backup and restore में कोई live replication नहीं है और बहुत लंबा RTO है; C — warm standby stack को चलता रखता है, आवश्यकता से अधिक लागत आती है; D — active/active सबसे महँगा है और आवश्यकता से कहीं अधिक है।

**26. उत्तर: C, E** — Warm standby एक scaled-down, हमेशा-चलने वाली पूर्ण प्रति है; multi-site active/active कई Regions से सर्व करता है जिसमें उच्चतम लागत पर शून्य के करीब RTO होता है। *अन्य क्यों नहीं:* A — backup and restore संसाधनों को पूर्व-नहीं-चलाने से परिभाषित होता है; B — backup and restore में सबसे अधिक (सबसे खराब) RTO है; D — pilot light प्रावधानित-लेकिन-बंद है, traffic सर्व करने वाली full capacity नहीं।

**27. उत्तर: B** — जब 30-सेकंड visibility timeout processing के बीच में समाप्त होता है, message फिर से दिखाई देता है और एक अन्य consumer इसे फिर से प्रोसेस करता है; visibility timeout को अधिकतम processing समय से अधिक सेट करें (उदा. एक सर्वोत्तम अभ्यास के रूप में 6×)। *अन्य क्यों नहीं:* A — FIFO बनाम standard कारण नहीं है; C — long polling empty-receive दक्षता को प्रभावित करता है, duplicates को नहीं; D — retention अवधि नियंत्रित करती है कि messages कितनी देर बने रहते हैं, redelivery को नहीं।

**28. उत्तर: A** — maxReceiveCount के साथ एक redrive policy बार-बार विफल होने वाले ("poison pill") messages को offline विश्लेषण के लिए एक dead-letter queue में ले जाती है, अनंत retry loop को रोकते हुए। *अन्य क्यों नहीं:* B — एक छोटा visibility timeout loop को तेज़ी से घुमाता है; C — FIFO malformed messages को discard नहीं करता; D — 1-मिनट retention वैध messages को भी expire कर देगा।

**29. उत्तर: B** — FIFO queues एक MessageGroupId के भीतर exactly-once processing और सख्त ordering की गारंटी देती हैं; account ID को group ID के रूप में उपयोग करना cross-account समानांतरता के साथ per-account ordering देता है (और high-throughput FIFO mode और अधिक scale कर सकता है)। *अन्य क्यों नहीं:* A — standard queues क्रम या exactly-once की गारंटी नहीं दे सकतीं; C — SNS इस pattern के लिए कोई ordering या exactly-once processing गारंटी प्रदान नहीं करता; D — एक एकल group ID सब कुछ serialize करता है, throughput को नष्ट करते हुए।

**30. उत्तर: B** — SNS-to-SQS fan-out हर event को प्रत्येक queue में पहुँचाता है, जहाँ प्रत्येक consumer को टिकाऊ buffering और स्वतंत्र processing गति मिलती है। *अन्य क्यों नहीं:* A — एक queue पर तीन consumers messages को विभाजित करते हैं; प्रत्येक message केवल एक consumer के पास जाता है; C — क्रमिक invocation buffering के साथ स्वतंत्र समानांतर processing नहीं है; D — email subscriptions मनुष्यों को पहुँचाते हैं, टिकाऊ application buffers को नहीं।

**31. उत्तर: B** — Reserved concurrency महत्वपूर्ण functions के लिए समर्पित concurrency निकालती है (और sale function को cap करना इसके blast radius को सीमित करता है), एक function को साझा account pool समाप्त करने से रोकते हुए। *अन्य क्यों नहीं:* A — एक लंबा timeout concurrency slots को अधिक देर तक रखता है, throttling को बदतर बनाते हुए; C — provisioned concurrency environments को pre-warm करती है लेकिन account concurrency quota नहीं बढ़ाती; D — memory size concurrency limits को प्रभावित नहीं करता।

**32. उत्तर: B** — Standard workflows एक वर्ष तक चलते हैं और waitForTaskToken callback pattern execution को बिना किसी compute लागत के रोकता है जब तक SendTaskSuccess/SendTaskFailure token नहीं लौटाता। *अन्य क्यों नहीं:* A — Express workflows अधिकतम 5 मिनट तक हैं; C — Lambda अधिकतम 15 मिनट चल सकता है और sleeping पैसा बर्बाद करता है; D — EventBridge schedules events ट्रिगर कर सकते हैं लेकिन workflow state को रोक और फिर से शुरू नहीं कर सकते।

**33. उत्तर: A** — Express workflows बहुत high-rate, short-duration, at-least-once executions के लिए कम लागत पर बनाए गए हैं; Standard workflows reconciliation job के लिए exactly-once semantics, एक वर्ष तक की अवधि, और पूर्ण execution history प्रदान करते हैं। *अन्य क्यों नहीं:* B — Standard इस उपयोग मामले के लिए 90,000 starts/second आर्थिक रूप से बनाए नहीं रख सकता; C — Express अधिकतम 5 मिनट तक और at-least-once है, 12-घंटे exactly-once job में विफल; D — उलटी assignments दोनों workloads में विफल होती हैं।

**34. उत्तर: B** — Failover routing सभी traffic को primary पर भेजता है जबकि इसका health check पास होता है, फिर विफल होने पर secondary record के साथ स्वचालित रूप से जवाब देता है। *अन्य क्यों नहीं:* A — weighted 50/50 आधा traffic हर समय passive प्रति पर भेजता है; C — latency-based routing प्रदर्शन द्वारा traffic विभाजित करता है, active/passive इरादे से नहीं; D — geolocation user स्थान द्वारा route करता है, endpoint health-based failover से असंबंधित।

**35. उत्तर: B** — ELB health check type जोड़ना ASG को ALB target-health failures को अस्वस्थ मानने देता है, इसलिए crashed-app instances समाप्त और प्रतिस्थापित होते हैं भले ही EC2 status checks पास हों। *अन्य क्यों नहीं:* A — detailed monitoring केवल metric granularity बदलता है; C — grace period health evaluation में देरी करता है, जो आवश्यक है उसके विपरीत; D — load balancer type मुद्दा नहीं है।

**36. उत्तर: B** — Network Load Balancer layer 4 (TCP/UDP) पर काम करता है, ultra-low latency के साथ प्रति सेकंड लाखों requests संभालता है, और प्रति AZ एक static (या Elastic) IP का समर्थन करता है। *अन्य क्यों नहीं:* A — ALB layer 7 (HTTP/HTTPS) है और मूल रूप से कोई static IPs प्रदान नहीं करता; C — Gateway Load Balancer inline वर्चुअल appliances तैनात करने के लिए है; D — Classic Load Balancer विरासत है और किसी भी आवश्यकता को पूरा नहीं करता।

**37. उत्तर: B, C** — CRR को दोनों buckets पर versioning सक्षम होना आवश्यक है, और EFS Standard classes regional (multi-AZ) फ़ाइल सिस्टम हैं जो AZs में एक साथ mountable हैं। *अन्य क्यों नहीं:* A — CRR केवल configuration के बाद नए objects दोहराता है जब तक कि आप मौजूदा के लिए S3 Batch Replication न चलाएँ; D — EFS हज़ारों concurrent NFS clients का समर्थन करता है, single-attach EBS के विपरीत; E — versioning replication के लिए एक पूर्वापेक्षा है लेकिन स्वयं कुछ नहीं दोहराती।

### भाग 3 — प्रश्न 38–53

**38. उत्तर: B** — io2 Block Express 256,000 तक IOPS, sub-millisecond latency, और 99.999% durability प्रदान करता है, तीनों आवश्यकताओं को पूरा करते हुए। *अन्य क्यों नहीं:* A — gp3 अब IOPS संख्या तक पहुँच सकता है (इसका cap late 2025 में 80,000 तक बढ़ाया गया था), लेकिन यह अन्य दो आवश्यकताओं में विफल होता है: durability 99.8–99.9% है (प्रश्न 99.999% की माँग करता है) और इसकी latency single-digit milliseconds है, गारंटीकृत sub-millisecond नहीं; B ही एकमात्र type है जो तीनों को पूरा करता है; C — st1 HDD-based है और IOPS-intensive databases के लिए अनुपयुक्त है; D — gp2 अधिकतम 16,000 IOPS तक है और bursting एक निरंतर गारंटी नहीं है।

**39. उत्तर: C** — FSx for Lustre HPC के लिए विशेष रूप से बनाया गया है जिसमें sub-millisecond latency, सैकड़ों GB/s throughput, और native S3 integration (lazy-loading और exporting) है। *अन्य क्यों नहीं:* A — EFS Lustre के HPC throughput/latency profile से मेल नहीं खा सकता; B — FSx for Windows SMB/Windows workloads को लक्षित करता है, Linux HPC को नहीं; D — Mountpoint for S3 साझा POSIX file system semantics या आवश्यक latency प्रदान नहीं करता।

**40. उत्तर: B** — FSx for Windows File Server मूल रूप से SMB, Active Directory integration, और NTFS ACLs का समर्थन करता है, और Multi-AZ mode two-AZ आवश्यकता को कवर करता है। *अन्य क्यों नहीं:* A — EFS NFS/POSIX है और NTFS permissions संरक्षित नहीं करता; C — S3 object storage है, एक SMB file share नहीं; D — Lustre बिना SMB/AD समर्थन के एक Linux HPC file system है।

**41. उत्तर: D, E** — Transfer Acceleration अपलोड को AWS edge/backbone नेटवर्क पर route करता है ताकि लंबी-दूरी के transfers तेज़ हों, और multipart upload transfers को समानांतर करता है और विफल parts को पूरी 40 GB फ़ाइल को पुनरारंभ किए बिना retry होने देता है। *अन्य क्यों नहीं:* A — One Zone-IA redundancy बदलता है, upload performance नहीं; B — आप uploads के लिए S3 के सामने एक ALB नहीं रख सकते; C — CRR upload के बाद दोहराता है और ingest में मदद नहीं करता।

**42. उत्तर: B** — Instance store NVMe SSDs भौतिक रूप से host से जुड़े हैं, ephemeral data के लिए सबसे कम latency प्रदान करते हैं जिसे फिर से उत्पन्न किया जा सकता है। *अन्य क्यों नहीं:* A और D — EBS नेटवर्क पार करता है और latency जोड़ता है; C — EFS दोनों से अधिक latency वाला एक नेटवर्क file system है।

**43. उत्तर: B** — कम समग्र utilization के साथ hot partitions पर throttling classic low-cardinality partition key समस्या है; एक high-cardinality key (उदा. game_id#player_id) traffic को समान रूप से वितरित करता है। *अन्य क्यों नहीं:* A — capacity mode बदलाव hot partitions को ठीक नहीं करते; C — एक LSI समान partition key और समान hot partitions साझा करता है; D — Streams परिवर्तन कैप्चर करते हैं, वे writes को पुनर्वितरित नहीं करते।

**44. उत्तर: B** — DAX एक DynamoDB-compatible, API-transparent in-memory cache है जो न्यूनतम code बदलाव के साथ माइक्रोसेकंड reads प्रदान करता है। *अन्य क्यों नहीं:* A — ElastiCache cache प्रबंधित करने के लिए application rewrites की आवश्यकता है; C — एक GSI hot items को cache नहीं करता या माइक्रोसेकंड latency नहीं देता; D — Global Tables multi-region access को संबोधित करते हैं, single-item read latency को नहीं।

**45. उत्तर: B** — एक GSI किसी भी समय एक मौजूदा table में जोड़ा जा सकता है, एक नए partition/sort key संयोजन का समर्थन करता है, और base table से अलग अपना स्वयं का provisioned throughput रखता है। *अन्य क्यों नहीं:* A — LSIs केवल table निर्माण के समय बनाए जा सकते हैं, table की partition key साझा करते हैं, और table throughput साझा करते हैं; C — table को फिर से बनाना विघटनकारी और अनावश्यक है; D — Streams परिवर्तन कैप्चर के लिए हैं, ad hoc queries के लिए नहीं।

**46. उत्तर: B** — DynamoDB TTL background में expired items को बिना किसी अतिरिक्त लागत के स्वचालित रूप से हटा देता है। *अन्य क्यों नहीं:* A — scheduled scans read/write capacity consume करते हैं और पैसा खर्च करते हैं; C — lifecycle policies एक S3/EFS अवधारणा हैं, DynamoDB नहीं; D — Streams downstream events filter करते हैं लेकिन table से items नहीं हटाते।

**47. उत्तर: B** — RDS Proxy connections को pool और multiplex करता है, हज़ारों Lambda invocations को केवल एक connection-string बदलाव के साथ database connections के एक छोटे सेट को साझा करने देता है। *अन्य क्यों नहीं:* A — upsizing महँगा है और बस limit को स्थगित करता है; C — एक database migration एक प्रमुख application बदलाव है; D — Lambda को 10 तक throttle करना connection management हल करने के बजाय throughput को पंगु बनाता है।

**48. उत्तर: A** — reader endpoint के पीछे Aurora Replicas (15 तक) replica auto scaling के साथ न्यूनतम operational कार्य के साथ read traffic offload करते हैं। *अन्य क्यों नहीं:* B — Aurora एक passive standby मॉडल उपयोग नहीं करता; classic RDS शब्दों में standbys traffic सर्व नहीं करते; C — sharding एक read-scaling समस्या के लिए उच्च operational overhead है; D — Backtrack database को समय में वापस rewind करता है, यह reads सर्व नहीं करता।

**49. उत्तर: B** — Global Accelerator दो static anycast IPs प्रदान करता है, UDP का समर्थन करता है, कई regions में NLBs को front करता है, और AWS backbone पर सेकंडों में fail over करता है। *अन्य क्यों नहीं:* A — CloudFront HTTP/HTTPS सामग्री सर्व करता है, मनमाना UDP नहीं, और इसमें कोई static client-facing IPs नहीं हैं; C — Route 53 latency routing failover के लिए DNS TTLs पर निर्भर करता है और कोई static IPs प्रदान नहीं करता; D — एक ALB regional और HTTP-only है।

**50. उत्तर: B** — Geolocation routing user के देश के आधार पर DNS queries का जवाब देता है, licensing अनुपालन के लिए Germany→eu-central-1 और France→eu-west-3 को deterministically लागू करते हुए। *अन्य क्यों नहीं:* A — latency routing सबसे तेज़ endpoint चुनता है, जो licensing नियम का उल्लंघन कर सकता है; C — geoproximity bias दूरी से boundaries shift करता है लेकिन सख्त country mapping की गारंटी नहीं देता; D — weighted routing weight द्वारा यादृच्छिक रूप से वितरित करता है, स्थान की अनदेखी करते हुए।

**51. उत्तर: C** — एक cluster placement group instances को एक AZ में एक साथ पास पैक करता है सबसे कम latency और उच्चतम packets-per-second के लिए, tightly coupled MPI workloads के लिए आदर्श। *अन्य क्यों नहीं:* A — spread groups instances को अलग hardware पर अलग करते हैं, latency बढ़ाते हुए, और प्रति AZ 7 पर cap करते हैं; B — partition groups distributed data systems के लिए fault domains को isolate करते हैं, low-latency MPI के लिए नहीं; D — अलग subnets instances को co-locate करने के लिए कुछ नहीं करते।

**52. उत्तर: B** — Amazon Data Firehose पूरी तरह प्रबंधित है, इसमें कोई consumers या shard management की आवश्यकता नहीं है, records को buffer करता है, और S3 में पहुँचाने से पहले JSON को Parquet में बदल सकता है। *अन्य क्यों नहीं:* A — Kinesis Data Streams को consumers लिखने/प्रबंधित करने की आवश्यकता है; C — SQS plus EC2 pollers बनाने और चलाने के लिए custom infrastructure है; D — MSK को Kafka clusters और connectors प्रबंधित करने की आवश्यकता है।

**53. उत्तर: B** — Glue crawlers schema को Data Catalog में infer करते हैं और Athena सीधे S3 फ़ाइलों के विरुद्ध serverless SQL चलाता है। *अन्य क्यों नहीं:* A — Redshift को cluster provisioning और data loading की आवश्यकता है; C — EMR का मतलब एक long-running cluster प्रबंधित करना है; D — RDS को डेटा को एक database server में लोड करने की आवश्यकता होगी।

### भाग 4 — प्रश्न 54–65

**54. उत्तर: C** — Checkpointed, restartable batch jobs आदर्श Spot workload हैं, और instance types/AZs में एक diversified Spot Fleet ~90% तक बचत पर interruption प्रभाव को कम करता है। *अन्य क्यों नहीं:* A — On-Demand यहाँ बिना किसी लाभ के छूट छोड़ देता है; B और D — commitments Spot से छोटी छूट देते हैं और एक interruption-friendly job के लिए खर्च lock करते हैं।

**55. उत्तर: C** — Compute Savings Plans EC2 (किसी भी family/region), Fargate, और Lambda में स्वचालित रूप से लागू होते हैं, modernization path के अनुकूल। *अन्य क्यों नहीं:* A — EC2 Instance Savings Plans एक region में एक instance family से locked हैं और Fargate/Lambda को बाहर रखते हैं; B और D — Reserved Instances केवल EC2 को कवर करते हैं और Fargate या Lambda पर लागू नहीं होते।

**56. उत्तर: B** — केवल EC2 Standard Reserved Instances Reserved Instance Marketplace पर सूचीबद्ध किए जा सकते हैं; RDS (और अन्य सेवा) RIs को फिर से नहीं बेचा जा सकता। *अन्य क्यों नहीं:* A और C — RDS RIs marketplace-eligible नहीं हैं; D — EC2 Standard RIs वास्तव में marketplace पर बेचने योग्य हैं।

**57. उत्तर: B** — AWS instance को पुनः प्राप्त करने से दो मिनट पहले एक Spot interruption notice देता है, drain और checkpoint करने का समय देते हुए। *अन्य क्यों नहीं:* A — एक चेतावनी प्रदान की जाती है; C और D — 15 मिनट और 24 घंटे Spot interruption windows नहीं हैं (rebalance recommendations पहले आ सकती हैं लेकिन एक गारंटीकृत निश्चित window नहीं हैं)।

**58. उत्तर: B** — Glacier Flexible Retrieval कम archival storage लागत और Expedited retrievals प्रदान करता है जो 1–5 मिनट में डेटा लौटाते हैं (लगभग $0.03/GB), 5-मिनट आवश्यकता को पूरा करते हुए। *अन्य क्यों नहीं:* A — Deep Archive का सबसे तेज़ retrieval ~12 घंटे है; C — Bulk retrievals 5–12 घंटे लेते हैं; D — Standard-IA तुरंत retrieve करता है लेकिन 7-वर्ष शायद ही कभी एक्सेस किए गए storage के लिए कहीं अधिक लागत आती है।

**59. उत्तर: B** — One Zone-IA Standard-IA से ~20% कम लागत आती है और single-AZ durability tradeoff reproducible thumbnails के लिए स्वीकार्य है। *अन्य क्यों नहीं:* A — Standard-IA डेटा को न चाहिए ऐसी redundancy के लिए अधिक लागत आती है; C — Intelligent-Tiering monitoring fees जोड़ता है और known-infrequent access के लिए लागत कम नहीं करता; D — Glacier Instant Retrieval में 90-दिन न्यूनतम और इस pattern के लिए एक अलग retrieval cost profile है।

**60. उत्तर: A, C** — Intelligent-Tiering एक छोटा per-object monitoring/automation शुल्क लेता है, और 128 KB से कम objects संग्रहीत किए जाते हैं लेकिन monitored या tiered नहीं किए जाते (Frequent Access दरों पर बिल किए जाते हैं)। *अन्य क्यों नहीं:* B — Intelligent-Tiering के अपने स्वचालित tiers के बीच कोई retrieval fees नहीं हैं; D — यह कभी cross-region दोहराता नहीं; E — class में हर object के लिए कोई 90-दिन न्यूनतम नहीं है।

**61. उत्तर: B** — Incomplete multipart upload parts storage के रूप में बिल किए जाते हैं लेकिन objects के रूप में अदृश्य हैं; AbortIncompleteMultipartUpload के साथ एक lifecycle rule उन्हें स्वचालित रूप से हटा देती है। *अन्य क्यों नहीं:* A — versioning storage बढ़ाएगा, parts साफ़ नहीं करेगा; C — storage class बदलना orphaned parts को नहीं हटाता; D — Transfer Acceleration transfers को तेज़ करता है लेकिन पहले से छोड़े गए uploads को साफ़ नहीं करता।

**62. उत्तर: B** — gp3 IOPS/throughput को size से decouple करता है और gp2 से ~20% कम प्रति GB लागत आती है, इसलिए आवश्यक IOPS रखते हुए capacity को right-size किया जा सकता है; migration एक online ModifyVolume operation है। *अन्य क्यों नहीं:* A — io2 अधिक महँगा है, कम नहीं; C — st1 आवश्यक IOPS प्रदान नहीं कर सकता; D — volumes हटाना live data को नष्ट करता है।

**63. उत्तर: B** — S3 के लिए एक gateway VPC endpoint मुफ़्त है और same-region S3 traffic के लिए NAT gateway data processing charges समाप्त करता है। *अन्य क्यों नहीं:* A — एक NAT instance अभी भी EC2 और operational लागत आती है; C — interface endpoints per-hour और per-GB बिल करते हैं, मुफ़्त gateway endpoint से अधिक लागत आती है; D — public subnets public IPv4 charges जोड़ते हैं और सुरक्षा कमज़ोर करते हैं।

**64. उत्तर: B, E** — AWS हर in-use public IPv4 address के लिए शुल्क लेता है, इसलिए अनावश्यक को हटाना लागत कम करता है, और AWS Budgets forecast/actual खर्च पर proactive threshold alerts प्रदान करता है। *अन्य क्यों नहीं:* A — Elastic IPs भी attached रहते हुए public IPv4 charge के तहत बिल किए जाते हैं; C — Compute Optimizer right-sizing की सिफारिश करता है लेकिन खर्च thresholds पर block या alert नहीं कर सकता; D — Shield Advanced एक DDoS सेवा है जो लागत जोड़ती है।

**65. उत्तर: A** — Aurora Serverless v2 0 ACUs तक scaling का समर्थन करता है (auto-pause, late 2024 से उपलब्ध) और connection पर स्वचालित रूप से फिर से शुरू होता है, निष्क्रिय रहते हुए compute लागत को बिना किसी मैन्युअल कदम के समाप्त करते हुए। जानने योग्य बारीकियाँ: auto-pause के लिए हाल के engine versions की आवश्यकता है (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); pause के बाद पहला connection फिर से शुरू होने में ~15 सेकंड लेता है (24+ घंटे paused के बाद अधिक); compute paused रहते हुए storage बिलिंग जारी रखता है; और कुछ भी जो connections खुले रखता है — एक RDS Proxy, एक keep-alive health check — pause को पूरी तरह रोकता है। *अन्य क्यों नहीं:* B — एक stopped provisioned cluster developers के कनेक्ट होने पर स्वचालित रूप से नहीं जागता (और 7 दिनों के बाद restart होता है); C — headless global database secondaries DR को संबोधित करते हैं, idle cost को नहीं; D — scaled-in readers अभी भी writer instance को चलता और बिलिंग छोड़ देते हैं।

---

## स्कोरिंग गाइड

| स्कोर | परिणाम का अर्थ |
|---|---|
| 55–65 | परीक्षा-तैयार। परीक्षा बुक करें। केवल वे प्रश्न review करें जो आप चूके। |
| 47–54 | उत्तीर्ण सीमा में, लेकिन margin पतला है। हर miss के पीछे के अध्यायों को फिर से पढ़ें (domain tags का उपयोग करें), एक सप्ताह में फिर से लें। |
| 38–46 | नींव वहाँ है; अंतराल बने हुए हैं। फिर से लेने से पहले अपने कमज़ोर डोमेन के लिए परिशिष्ट B के domain map के माध्यम से काम करें। |
| 38 से नीचे | अपने दो सबसे कमज़ोर डोमेन के लिए अध्यायों को end to end फिर से पढ़ें, उनके chapter exercises फिर से करें, फिर यह परीक्षा फिर से लें। |

अपनी misses को *डोमेन द्वारा* ट्रैक करें (प्रत्येक प्रश्न tagged है)। एक डोमेन में केंद्रित एक कम स्कोर एक केंद्रित अध्ययन समस्या है; समान रूप से फैला हुआ वही स्कोर एक pacing या question-reading समस्या है — धीमा हो जाएँ और रेखांकित करें कि प्रत्येक stem वास्तव में क्या माँगता है (HA बनाम DR, cost बनाम performance, "MOST cost-effective" बनाम "LEAST operational overhead")।
