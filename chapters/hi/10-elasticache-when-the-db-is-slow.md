# अध्याय 10: जब डेटाबेस बहुत धीमा हो जाता है

स्क्रीन पर पेज लोड मेट्रिक्स खुले थे। लियो ने उन्हें बीस मिनट तक देखे बिना कुछ नहीं कहा।

प्रति पेज लोड ४७ DynamoDB अनुरोध। डेटा पुनः प्राप्त करने के लिए केवल एक सौ अस्सी-आठ मिलीसेकंड - ब्राउज़र को एक भी पिक्सेल रेंडर करने से पहले।

उसने गणना की। शुक्रवार शाम को दस हजार समवर्ती उपयोगकर्ता: प्रति मिनट चार सौ पच्वार puluh सात हजार DynamoDB रीड। लागत वास्तविक थी। लेकिन विलंबता वास्तविक समस्या थी। नimbus ब्राउज़ पेज खोलने वाला उपयोगकर्ता लगभग दो सौ मिलीसेकंड इंतजार करता था इससे पहले कि कुछ दिखाई दे - और यह एक तेज़ कनेक्शन पर था।

"डेटाबेस प्रति अनुरोध चार मिलीसेकंड में प्रतिक्रिया दे रहा है," लियो ने कहा। "यह वास्तव में तेज़ है। DynamoDB अपना काम कर रहा है।"

"तो पेज धीमा क्यों है?" माया ने पूछा।

"क्योंकि हम इसे प्रति पेज लोड ४७ बार कॉल कर रहे हैं," प्रिया ने कहा। "समस्या डेटाबेस में नहीं है। समस्या यह है कि हम इससे बहुत अधिक बात कर रहे हैं।"

टॉम आगे झुका। उसके पास वह लुक था जो तब मिलता है जब एक समस्या लागत वार्ता में बदल जाती है। "तो समाधान यह है कि हम इससे कम बात करें?"

"कम बात करें। अधिक याद रखें।"

**रेस्तरां का उदाहरण**

एक रेस्तरां की रसोई की कल्पना करें। हर बार जब एक वेटर को आज के विशेषों के बारे में पता होता है, तो वे रसोई के पीछे जाते हैं, शेफ से पूछते हैं और फिर टेबल पर वापस आते हैं।

यह ठीक है अगर आपके पास दो वेटर और तीन टेबल हैं।

अब कल्पना कीजिए कि दो सौ वेटर और एक हजार टेबल हैं। उनमें से प्रत्येक को एक ही प्रश्न के लिए पीछे जाना पड़ता है। रसोई एक बाधा बन जाती है। शेफ एक ही प्रश्न को प्रति घंटे चार सौ बार उत्तर देता है।

स्पष्ट समाधान: मेनू को रेस्तरां की सामने वाली दीवार पर एक बोर्ड पर लिखें। प्रत्येक वेटर बोर्ड से पढ़ता है। रसोई में ब्रेक आता है। बोर्ड को विशेषों में बदलाव होने पर अपडेट किया जाता है।

यह बोर्ड एक कैश है।

कैश एक तेज़, स्थानीय डेटा की दुकान है जिसे हाल ही में पुनः प्राप्त किए गए डेटा को संग्रहीत करने के लिए उपयोग किया जाता है। एक ही स्रोत से बार-बार एक ही चीज़ प्राप्त करने के बजाय, आप इसे एक बार प्राप्त करते हैं और इसे पास रखते हैं।

**क्या हम केवल मेमोरी में मेनू का उपयोग नहीं कर सकते?**

"क्या हम बस एप्लिकेशन की मेमोरी में मेनू संग्रहीत नहीं कर सकते?" लियो ने पूछा।

एक वैध प्रश्न।

आप कर सकते हैं। एक एकल-सर्वर एप्लिकेशन के लिए, इन-मेमोरी कैशिंग ठीक काम करता है। लेकिन नimbus एक लोड बैलेंसर के पीछे चलता है, कई EC2 उदाहरणों पर। यदि एक उदाहरण मेमोरी में मेनू संग्रहीत करता है, तो अन्य उदाहरणों के पास वह डेटा नहीं होता है। प्रत्येक उदाहरण अपने स्वयं के कैश बनाए रखता है। जब मेनू अपडेट होता है, तो आपको सभी को अमान्य करना होगा।

यह *कैश सहिष्णुता समस्या* है - कई कैश को सुसंगत रखने के लिए।

ElastiCache इस समस्या का समाधान प्रदान करके *केंद्रीयकृत* कैश प्रदान करता है जिससे आपके सभी उदाहरण साझा करते हैं। मेमोरी में प्रत्येक सर्वर के बजाय, प्रत्येक सर्वर से पढ़ता और लिखता है उसी कैश में। एक अपडेट सभी में फैलता है।

**ElastiCache से मिलें**

Amazon ElastiCache एक प्रबंधित कैशिंग सेवा है। यह लोकप्रिय कैशिंग इंजन - Redis और Memcached - चलाता है बिना आपको सर्वर का प्रबंधन करने की आवश्यकता के।

**Redis** दो में से अधिक शक्तिशाली है। यह जटिल डेटा संरचनाओं (स्ट्रिंग्स, सूचियां, सेट, हैश, सॉर्टेड सेट) का समर्थन करता है, स्थिरता (डेटा पुनरारंभ पर जीवित रहता है), प्रतिकृति और pub/sub संदेश। Redis से अधिक कर सकता है - यह एक हल्के डेटा स्टोर के रूप में कार्य कर सकता है।

**Memcached** सरल है। शुद्ध कुंजी-मूल्य कैशिंग, क्षैतिज रूप से स्केलेबल, कोई स्थिरता नहीं। सरल उपयोग मामलों के लिए तेज़ लेकिन कम सुविधाएँ।

नimbus के लिए: Redis। उन्हें मेनू डेटा (संरचित), सत्र टोकन (कुंजी-मूल्य) कैश करने की आवश्यकता थी, और बाद में वे "ट्रेंडिंग रेस्तरां" रैंकिंग के लिए सॉर्टेड सेट चाहते थे।

**कैशिंग कैसे काम करता है**

इस बुनियादी कैशिंग पैटर्न को **कैश-साइड** (जिसे "लाजी लोडिंग" भी कहा जाता है) कहा जाता है:

1. एप्लिकेशन को डेटा की आवश्यकता होती है
2. पहले कैश की जाँच करें
3. यदि पाया जाता है (*कैश हिट*): डेटा तुरंत लौटाएं
4. यदि नहीं पाया जाता है (*कैश मिस*): डेटाबेस पर जाएं, डेटा प्राप्त करें, इसे कैश में स्टोर करें, इसे लौटाएं

इन-प्यूशकोड में:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache for 5 minutes
return menuData
```

The first request always hits the database. Every subsequent request hits the cache. With a cache, Nimbus's forty-seven DynamoDB reads per page load become one or two cache lookups. Fast, cheap, and scalable.

**TTL: कितने समय तक याद रहता है?** (Kitne samay tak yaad rata hai?)

हर कैश एंट्री में एक **टाइम-टू-लाइव (TTL)** होता है: वह अवधि जिसके बाद एंट्री समाप्त हो जाती है और अगली रिक्वेस्ट फिर से डेटा के लिए डेटाबेस पर वापस चली जाती है। (Har cash entry mein ek **Time-to-Live (TTL)** hota hai: vah avadhi jiske baad entry sampat ho jaati hai aur next request phir se database par badal jati hai.)

यह कैशिंग का मूल तनाव है: ताज़गी बनाम प्रदर्शन। (Yeh caching ka mool tatsav hai: tazgi vs pradarshan.)

- **छोटी TTL (सेकंड)**: बहुत ताज़ा डेटा, लेकिन कैश मिस होने की बहुत अधिक संभावना। कैश में बहुत कम मदद मिलती है। (**Chhoti TTL (seconds)**: bahut taza data, lekin cash mis hone ki bahut adhik samagnti. Cash mein bahut kam madad milti hai.)
- **बड़ी TTL (घंटे या दिन)**: बहुत तेज़, लेकिन डेटा पुराना हो सकता है। ग्राहक कल के मेनू को देखते हैं। (**Badi TTL (ghante ya din)**: bahut tez, lekin data purana ho sakta hai. Ghatak kal ke menu ko dekhte hain.)

मेनू डेटा के लिए, पाँच मिनट उचित है। मेनू हर सेकंड नहीं बदलता है। यदि एक रेस्तरां अपने मेनू को अपडेट करता है, तो ग्राहक पुराने संस्करण को 5 मिनट तक देख सकते हैं - स्वीकार्य। (Menu data ke liye, paanch minute upaadhya hai. Menu har second nahin badalta hai. Yadi ek restaurant apne menu ko update karta hai, to ghatak purane version ko 5 minute tak dekh sakte hain - sweekarya.)

सेशन टोकन (क्या यह उपयोगकर्ता लॉग इन है?), छोटे TTL बेहतर होते हैं, या जब सेशन बदलता है तो कैश को तुरंत अपडेट किया जाता है। (Session token (kya yah upyogak shya log in hai?), chote TTL behtar hote hain, ya jab session badalta hai to cash ko jurtat update kiya jata hai.)

वित्तीय डेटा (ऑर्डर कुल, भुगतान रिकॉर्ड), इसे कैश न करें - या यदि आप करते हैं, तो लिखें होने पर इसे तुरंत अमान्य करें। (Vinishy data (order kul, payment record), ise cash na kare - ya yadi aap karte hain, to likhe hone par ise jurtat amany karin.)

"केवल दो कठिन समस्याएँ हैं कंप्यूटर विज्ञान में," लियो ने कहा, अभ्यास के साथ किसी ने पहले कहा था। (“Keval do kridan samasyaen hain computer shishti mein,” Leo ne kaha, abhyas ke saath kisi ne pahale kaha tha.) “कैश अमान्यकरण और चीजों को नाम देना।” (Cache amanvyakaran aur cheejo ko naam dena.)

"कैश अमान्यकरण क्यों कठिन है?" माया ने पूछा। (“Cache amanvyakaran kyon kridan hai?” Maya ne puchha.)

"क्योंकि डेटा वास्तव में कब बदलता है? क्या मेनू एक रेस्तरां भागीदार द्वारा अपडेट किया गया था? या एक क्रोन जॉब द्वारा? या एक व्यवस्थापक द्वारा मैन्युअल रूप से संपादित किया गया था? डेटा को बदलने के हर स्थान को बताना होगा कि कैश को क्या करना है।" (“Kyuki data vaastav mein kab badalta hai? Kya menu ek restaurant bhagidar dwara update kiya gaya tha? Ya ek cron job dwara? Ya ek vyavasthapak dwara manuval रूप se sampdit kiya gaya tha? Data ko badalne ke har sthaan ko batana hoga ki cash ko kya karna hai.”)

यह कारण है कि वरिष्ठ इंजीनियरों "क्या राइट पाथ हैं?" से कैशिंग की बातचीत शुरू करते हैं, "रेडिस जोड़ें" के बजाय। (Yeh karan hai ki vyavsarik engineers “kya right path hain?” se caching ki baatvachat shuru karte hain, “Redis jodhein” ke badle mein.)

**कैश निष्कासन: जब बोर्ड भर जाता है** (Cash nishkasan: jab board bhar jata hai)

विशेषताओं के बोर्ड में सीमित जगह है। जब यह भर जाता है, तो आपको कुछ हटाने की आवश्यकता होती है ताकि जगह बनाई जा सके। (Visheshataon ke board mein limited jagah hai. Jab yah bhar jata hai, to aapko kuch hataane ki aavashyakta hoti hai taki jagah banai jaye.)

रेडिस (और कैश में सामान्य) में *निष्कासन नीतियां* होती हैं जो मेमोरी भर जाने पर क्या हटाया जाता है यह निर्धारित करती हैं: (Redis (aur cash mein samanya) mein *nishkasan niyati* hoti hain jo memory bhar jaane par kya hamaya jata hai yah nirdharit karti hain:)

- **LRU (सबसे हाल ही में उपयोग किया गया)**: उन वस्तुओं को हटा दें जिन्हें सबसे लंबे समय से एक्सेस नहीं किया गया है। (**LRU (sabse hasil mein upyog kiya gaya)**: un objcton ko hata dein jinhe sabse lambe samay se access nahin kiya gaya hai.)
- **LFU (सबसे कम बार उपयोग किया गया)**: उन वस्तुओं को हटा दें जिन्हें सबसे कम बार एक्सेस किया जाता है। (**LFU (sabse kam bar upyog kiya gaya)**: un objcton ko hata dein jinhe sabse kam bar access kiya jata hai.)
- **allkeys-random**: यादृच्छिक निष्कासन। सरल, इष्टतम नहीं। (**allkeys-random**: yadrachchik random nishkasan. saral, itimatmok not.)
- **noeviction**: जब मेमोरी भर जाती है तो त्रुटि लौटाएं (एप्लिकेशन को इसे कैसे संभालना है)। (**noeviction**: jab memory bhar jati hai to atut loutaein (application ko ise kaise samanalna hai).)

अधिकांश वेब अनुप्रयोगों के लिए: LRU। उन चीजों को जिन्हें आपने हाल ही में नहीं देखा है, उनकी आवश्यकता कम होती है। (Mahishthi web anupyojanon ke liye: LRU. Un cheejo ko jinhe aapne हाल ही mein nahin dekha hai, unki aavashyakta kam hoti hai.)

**ElastiCache for Redis: आपको प्रबंधित किया जाता है** (ElastiCache for Redis: aapko manage kiya jata hai)

जैसे RDS, ElastiCache एक ओपन-सोर्स टूल लेता है और परिचालन कार्य को संभालता है: (Jaise RDS, ElastiCache ek open-source tool leta hai aur paricharan karya ko samanalta hai:)

- **स्वचालित बैकअप**: Redis स्नैपशॉट शेड्यूल पर। (Swatantra backup: Redis snapshots schedule par.)
- **मल्टी-एज़ प्रतिकृति**: प्राथमिक नोड + विभिन्न एज़ में रीड प्रतिकृति। (Multi-AZ replication: prathami node + vishisht AZ mein read pratikriti.)
- **स्वचालित फेलओवर**: यदि प्राथमिक Redis नोड विफल हो जाता है, तो एक प्रतिकृति स्वचालित रूप से पदोन्नत होती है। (Swatantra failover: yadi prathami Redis node vilal ho jata hai, to ek pratikriti swatantra roop se padomanit hoti hai.)
- **क्लास्टर मोड**: बहुत बड़े कैश के लिए कई नोड्स में क्षैतिज शार्डिंग। (Cluster mode: bahut bade cash ke liye kai nodes mein kshitij sharding.)
- **एन्क्रिप्शन**: अनुपालन के लिए इन-ट्रैंजिट और एट-रेस्ट एन्क्रिप्शन। (Encryption: anupalayan ke liye in-transit aur at-rest encryption.)
- **VPC एकीकरण**: कैश आपके निजी नेटवर्क में चलता है, सार्वजनिक रूप से एक्सेस नहीं किया जाता है। (VPC ekritan: cash aapke private network mein chalta hai, public roop se access nahin kiya jata hai.)

टॉम ने फीचर सूची को देखा। "यह कितना महंगा है?" (Tom ne feature list ko dekha. “Yah kitna mahanga hai?”)

"यह उन DynamoDB रीड को बदल रहा है जिन्हें हम बदल रहे हैं," लियो ने कहा। "मैंने नंबर चलाए।" (“Yah un DynamoDB read ko badal raha hai jinhe hum badal rahe hain,” Leo ne kaha. “Maine number chalae.”)

टॉम का भाव संदेह से रुचि में बदल गया। यह प्रगति थी। (Tom ka bhav sandeh se ruchhi mein badal gaya. Yah pragati thi.)

## ताकत और सीमाएँ (Taqat aur seemaen)

**कैशिंग क्यों शक्तिशाली है**: (Caching kyon swatahshali hai:)

- डेटा लोड को नाटकीय रूप से कम करता है (कम क्वेरी, कम लागत)। (Data load ko natakoy roop se kam karta hai (kam query, kam lakat).)
- कैश हिट के लिए मिलीसेकंड प्रतिक्रिया समय। (Cash hit ke liye milisekund pradarshan samay.)
- अपने डेटाबेस को ट्रैफिक स्पाइक्स से बचाता है। (Apne database ko traffic spikes se bachat hai.)
- Redis एक साधारण कुंजी-मान स्टोर की तुलना में अधिक समृद्ध डेटा संरचनाओं का समर्थन करता है। (Redis ek samayik kunci-man store ki tulna mein adhik rich data strukturon ka samarthan karta hai.)

**कैशिंग कब जटिल हो जाती है**: (Caching kab jomjok ho jati hai:)

- कैश अमान्यकरण वास्तव में कठिन है - स्टेल डेटा बग का कारण बनता है। (Cash amanvyakaran vaastav mein kridan hai - stel data bug ka karan banta hai.)
- परिचालन जटिलता जोड़ता है (एक और सेवा जिसे निगरानी करने की आवश्यकता है, एक और विफलता बिंदु)। (Paricharan jomjokta hai (ek aur seva jise nirnaya karne ki aavashyakta hai, ek aur vifalta bindu).)
- कोल्ड स्टार्ट समस्या: जब आप ताज़ा डिप्लॉय करते हैं, तो कैश खाली होता है - डेटाबेस पूरे लोड लेता है। (Cold start samasya: jab aap taza deploy karte hain, to cash khali hota hai - database poore load leta hai.)
- कैश स्टैंपेड: यदि कई प्रविष्टियाँ एक साथ समाप्त हो जाती हैं, तो सभी अनुरोध डेटाबेस से एक साथ टकराते हैं। (Cash stamped: yadi kai prishthiyon ko ek saath sampat ho jati hain, to sabhi anurodh database se ek saath takarte hain.)
- ElastiCache नोड्स मुफ्त नहीं हैं - आप उन्हें निष्क्रिय होने पर भी भुगतान करते हैं। (ElastiCache nodes mukhtiya nahin hain - aap unhe nikay hone par bhi payment karte hain.)

**ElastiCache बनाम DynamoDB DAX**: (ElastiCache vs DynamoDB DAX:)

यदि आप DynamoDB डेटा को विशेष रूप से कैश कर रहे हैं, तो AWS DAX (DynamoDB Accelerator) प्रदान करता है - DynamoDB के लिए एक विशेष इन-मेमोरी कैश। (Yadi aap DynamoDB data ko vishesh karte hain, to AWS DAX (DynamoDB Accelerator) pradan karta hai - DynamoDB ke liye ek vishesh in-memory cash.) DAX आपके एप्लिकेशन कोड (समान API) के साथ पारदर्शी है, DynamoDB रीड लैटेंसी को माइक्रोसेकंड तक कम करता है, और कैश अमान्यकरण को स्वचालित रूप से संभालता है। (DAX aapke application code (samane API) ke saath transparant hai, DynamoDB read latency ko microseconds tak kam karta hai, aur cash amanvyakaran ko swatantra roop se samanalta hai.)

DAX का उपयोग करें जब आपका बाधा DynamoDB रीड हो। ElastiCache का उपयोग करें जब आपको किसी भी डेटा स्रोत के लिए एक सामान्य-उद्देश्यीय कैश की आवश्यकता हो। (DAX ka upyog kare jab aapka badha DynamoDB read ho. ElastiCache ka upyog kare jab aapko kisi bhi data source ke liye ek samanya-udhdeshiy cash ki aavashyakta ho.)

## सारांश (Saransh)

- एक कैश एक हाल ही में प्राप्त किए गए डेटा का एक तेज़ स्टोर है - आप एक बार पूछते हैं, जवाब को याद रखें।
- ElastiCache AWS का प्रबंधित कैशिंग सेवा है, जो Redis और Memcached का समर्थन करती है।
- **Redis** अधिक समृद्ध (जटिल डेटा संरचनाएं, स्थिरता, पब/सब) है। **Memcached** सरल है (केवल कुंजी-मूल्य, क्षैतिज रूप से स्केलेबल)।
- **कैश-साइड पैटर्न** (नी laziness लोडिंग): कैश को पहले जांचें, मिस होने पर डेटाबेस पर वापस आएं।
- **TTL** डेटा को कैश में कितने समय तक रहता है, इसे नियंत्रित करता है। छोटा TTL = ताज़ा, कई मिस। लंबा TTL = तेज़, संभावित रूप से पुरानी।
- कैश अमान्य होना मुश्किल है। जोड़ने से पहले सभी लेखन पथों को जानें।
- ElastiCache प्रतिकृति, विफलता परोचय, बैकअप और एन्क्रिप्शन का प्रबंधन करता है - आप कैश डिज़ाइन पर ध्यान केंद्रित करते हैं।
- **DAX** DynamoDB-विशिष्ट कैश है। ElastiCache सामान्य प्रयोजन का है।

## परीक्षा युक्तियाँ

*SAA-C03 डोमेन: उच्च प्रदर्शन वाले आर्किटेक्चर (डोमेन 3, कार्य 3.3)*

- **Redis बनाम Memcached परीक्षा में**: Redis = स्थिरता, प्रतिकृति, जटिल संरचनाएं, पब/सब। Memcached = सरल कुंजी-मूल्य, शुद्ध क्षैतिज स्केलिंग। जब परिदृश्य में कहा जाता है कि आपको कैश किए गए डेटा को खोना नहीं चाहिए, तो उत्तर Redis है (यह डिस्क पर स्थायी होता है)।
- **ElastiCache उपयोग मामले संकेत**: "डेटाबेस एक बाधा है," "पढ़ने के भारी कार्यभार," "विलंबता कम करें," "सेशन स्टोर" - ये सभी ElastiCache को इंगित करते हैं।
- **DAX संकेत**: "DynamoDB रीड विलंबता को कम करें" या "DynamoDB रीड बहुत धीमे हैं" → DAX, ElastiCache नहीं।
- **सेशन प्रबंधन**: ElastiCache Redis उपयोगकर्ता सत्र डेटा संग्रहीत करने के लिए कैनोनिकल उत्तर है। स्टेटलेस एप्लिकेशन + Redis सत्र स्टोर = क्षैतिज स्केलिंग के साथ सुसंगत सत्र।
- **राइट-थ्रू बनाम कैश-साइड**: कैश-साइड (नी laziness लोडिंग) सबसे आम है। राइट-थ्रू कैश पर हर राइट के साथ कैश को अपडेट करता है - कभी भी पुरानी नहीं, लेकिन अधिक राइट ऑपरेशन। परीक्षा उन्हें अलग करने पर ध्यान दे सकती है।
- **कैश निष्कासन नीतियां**: LRU (सबसे हाल ही में उपयोग किया गया) सामान्य वेब कार्यभारों के लिए सबसे आम परीक्षा उत्तर है।

## अभ्यास

**अभ्यास 1 — स्मरण**

अपने शब्दों में: कैश अमान्य होना क्या है, और यह इतना कठिन क्यों है?

*(सुझाव: Nimbus में मेनू डेटा को अपडेट करने के सभी स्थानों के बारे में सोचें - रेस्तरां पार्टनर पोर्टल, एक एडमिन टूल, एक क्रोन जॉब। प्रत्येक पथ को कैश के बारे में पता होना चाहिए।) *

**अभ्यास 2 — परीक्षा अभ्यास**

*परिदृश्य*: एक वीडियो स्ट्रीमिंग प्लेटफॉर्म लाखों उपयोगकर्ताओं को सेवा प्रदान करता है। उपलब्ध फिल्मों की सूची में बदलाव अनियमित रूप से होते हैं (रात में अपडेट किए जाते हैं)। एप्लिकेशन उच्च डेटाबेस CPU उपयोग का अनुभव कर रहा है क्योंकि प्रत्येक उपयोगकर्ता अनुरोध सूची क्वेरी करता है। टीम को डेटाबेस लोड को कम करते हुए सूची डेटा को अपडेट के एक घंटे के भीतर सटीक रखने की आवश्यकता है।

कौन सा समाधान इन आवश्यकताओं को सर्वोत्तम रूप से पूरा करता है?

A) RDS डेटाबेस में रीड प्रतिकृतियां जोड़ें ताकि लोड वितरित किया जा सके।
B) सूची को ऑन-डिमांड क्षमता के साथ DynamoDB में माइग्रेट करें।
C) सूची डेटा के लिए 1-घंटे के TTL के साथ ElastiCache के लिए Redis का उपयोग करें।
D) RDS इंस्टेंस का आकार बढ़ाएं ताकि अधिक समवर्ती प्रश्नों को संभाला जा सके।

सुझाव 1: डेटा पढ़ने के भारी है और अनियमित रूप से बदलता है। इस के लिए आदर्श पैटर्न क्या है?

सुझाव 2: "एक घंटे के भीतर सटीक" सीधे कैश कॉन्फ़िगरेशन पैरामीटर में अनुवाद करता है।

सुझाव 3: लक्ष्य डेटा लोड को कम करना है, न कि बस अधिक को संभालना।

उत्तर: C

व्याख्या: ElastiCache के साथ सूची डेटा को 1-घंटे के TTL के साथ रात के अपडेट के बाद प्राप्त किया जाता है। अगले अनुरोध पर, कैश से डेटा प्राप्त किया जाता है बिना डेटाबेस से संपर्क किए। जब रात का अपडेट चलता है, तो प्रविष्टियाँ 1 घंटे के भीतर समाप्त हो जाती हैं और ताज़ा डेटा अगले अनुरोध पर लोड किया जाता है।

A क्यों नहीं? रीड प्रतिकृतियां पढ़ने के ट्रैफ़िक को अधिक डेटाबेस नोड्स में वितरित करती हैं, लेकिन वे कुल क्वेरी की संख्या को कम नहीं करती हैं। वे पढ़ने को स्केल करने के लिए उपयोगी हैं, न कि बार-बार क्वेरी करने के कारण डेटाबेस लोड को कम करने के लिए।

B क्यों नहीं? DynamoDB में सूची को माइग्रेट करने से समस्या का समाधान नहीं होता है - सूची डेटा अभी भी (DynamoDB) से प्राप्त किया जाएगा प्रत्येक उपयोगकर्ता अनुरोध पर।

D क्यों नहीं? इंस्टेंस का आकार बढ़ाने से अधिक समवर्ती प्रश्नों को संभाला जा सकता है, लेकिन यह क्वेरी की संख्या को कम नहीं करता है। अंतर्निहित अक्षमता बनी रहती है।

*SAA-C03 डोमेन: उच्च प्रदर्शन वाले आर्किटेक्चर — कार्य 3.3*

**अभ्यास 3 — वास्तुकला चुनौती *(वैकल्पिक)***

Nimbus को "ट्रेंडिंग रेस्तरां" सुविधा जोड़ने की आवश्यकता है: पिछले 24 घंटों में ऑर्डर की मात्रा के अनुसार शीर्ष 10 रेस्तरां की एक क्रमबद्ध सूची, हर 15 मिनट में अपडेट की जाती है।

ElastiCache Redis के साथ इस सुविधा को कैसे लागू करेंगे? क्या आप रैंकिंग के लिए Redis डेटा संरचना का उपयोग करेंगे? आपका कैश TTL क्या होगा, और आप कैश को कब अपडेट करेंगे?

इसके अतिरिक्त विचार करें: यदि ElastiCache नोड विफल हो जाता है तो क्या होता है? क्या सुविधा टूट जाती है? विफलता के आसपास कैसे डिजाइन किया जाए?

*(एक सही उत्तर नहीं है। लक्ष्य कैश डिज़ाइन और विफलता के बारे में सोचने का अभ्यास करना है।) *

## पोस्ट-क्रेडिट दृश्य

लियो ने मेनू के लिए Redis कैशिंग जोड़ा। पेज लोड समय 188 मिलीसेकंड से 12 मिलीसेकंड तक गिर गया।

47 DynamoDB कॉल एक Redis लुकअप में बदल गए। कॉल 0.8 मिलीसेकंड था।

उन्होंने इस पर स्टैंडअप में घोषणा की।

"अच्छा काम," प्रिया ने बिना लैपटॉप से ऊपर देखे कहा।

"टॉम"

# धन्यवाद, बोला लियो।

"तुम्हें आखिरी बार Redis ऑथेंटिकेशन टोकन घुमाया कब था?"

लियो ने अपने नोट्स देखे। "मुझे नहीं लगता कि मैंने इसे सेट किया था।"

"तो कैश अनाधिकृत है।"

"यह VPC के अंदर है।"

"और बाकी सब कुछ जो खतरे में है, वह भी।" उसने आखिरकार ऊपर देखा। "अगर लियो का लैपटॉप संक्रमित हो जाता है और कोई VPC में आगे बढ़ता है, तो तुम्हारे कैश में कोई पासवर्ड नहीं होगा।"

लियो उसकी ओर देखा।

"मैं ऑथेंटिकेशन टोकन सेट कर दूंगा," उसने कहा।

अगले अध्याय में: वह निजी नेटवर्क जो Nimbus के स्वामित्व को बाकी इंटरनेट से अलग करता है।
