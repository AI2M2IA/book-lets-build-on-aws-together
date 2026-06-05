# Bölüm 2: Verinizin Sunucusu Nerede?

Ayaklarınızı uzatın. Komşunuz varsa bir pencereye yürüyün.

Dışarıya bakın. Ne görüyorsanız — binalar, ağaçlar, bir otopark, birinin bahçesi —
bunların hiçbiri verilerinizin nerede olduğunu göstermez. Verileriniz tamamen başka bir yerde. Muhtemelen
hiç gitmediğiniz bir yerde.

Bu bir sorun değil. Ancak *nerede* olduğunu anlamak birçok şeyi anlamanıza yardımcı olur.

Geçen bölümde, Leo 23:00'da bir AWS hesabına kaydolmuş ve bir sunucu kurmuştu.
Bir sunucu, yani kelime oyunuyla, bir yer — o yerin hangi bölümünü seçtiğinden emin değildi çünkü onu bilinçli olarak seçmemişti.

Ertesi sabah Maya, sunucunun Singapur'da olduğunu fark etti.

"Neden Singapur?" diye sordu.

"Varsayılan ayar," dedi Leo.

Tom kahvesinden uzaklaştı. "Singapur'da bir sunucu çalıştırmanın maliyeti, tüm müşterilerimizin Batı Kıyısı'ndan gelmesi durumunda ne kadar?"

Leo bir cevap vermedi.

Priya zaten bir cevaba sahipti: "Oradan daha yavaş da. Her istek dünyanın diğer ucuna yolculuk eder."

Bu bölüm, bu kararı düzeltmek ve bunun neden önemli olduğunu anlamakla ilgilidir.

**"Bir Yer"in Sorunu**

AWS'yi kullanırken, tek bir veri merkezi kullanmıyorsunuz. Bir dünya çapındaki veri merkezi ağı kullanıyorsunuz. AWS, onlarca ülkede altyapıya sahiptir.

Bu bir özellik, sadece bir gerçek değil. Ancak, birden fazla seçeneğiniz olduğundan, altyapınızı nerede çalıştırmak istediğinizi seçmeniz gerekir: *nerede*?

Seçim üç nedenden dolayı önemlidir:

**Performans.** Sunucularınız kullanıcılarınıza ne kadar yakınsa, yanıt o kadar hızlı olur. Fizik tartışılmazdır. Veriler yaklaşık olarak ışığın üçte ikisi hızında fiber optik kablolar aracılığıyla seyahat eder. Seattle'dan Singapur'a yapılan bir istek, uygulamanızın hiçbir şey yapmadan önce yaklaşık 300 milisaniye sürer.

**Uyumluluk.** Bazı sektörler, verilerin nerede saklanabileceğine ilişkin yasalara sahiptir. ABD sağlık verileri, ülkenin içinde kalması gerekebilir. Finansal veriler belirli bir bölgede kalması gerekebilir. Yanlış bir Bölge seçimi yasal sorunlara yol açabilir.

**Felaket direnci.** Bir konumda bir elektrik kesintisi, bir deprem veya ağ arızası olması durumunda sisteminizin hayatta kalması gerekir. Altyapıyı birden fazla konuma yaymak, yerel felaketlere karşı koruma sağlar.

**AWS Altyapısını Düzenler**

AWS, küresel altyapısını üç iç içe kavramda böler. Bunları Rus oyuncakları gibi düşünün, en büyükten en küçüğe.

**Bölgeler → Erişilebilirlik Bölgeleri → Kenar Bölgeleri**

Her birini açalım.

**Bölgeler: Büyük Kutular**

Bir **Bölge**, AWS'nin bir veri merkezi kümesini içeren bir coğrafi alandır. Her Bölge, konumuna göre adlandırılır: `us-west-2` Oregon'dur, `us-east-1` Kuzey Virginia'dır, `eu-west-1` İrlandiya'dır, `ap-southeast-1` Singapur'dur — Leo'nun sunucusu saklanıyordu.

Dünya genelinde 30'dan fazla Bölge vardır ve AWS bunları düzenli olarak ekler.

Her Bölge tamamen bağımsızdır. `us-west-2`'deki veriler, `us-west-2`'de kalırsa, bunu açıkça taşımadığınız sürece. Bu, uyumluluk ve direnç açısından kritik öneme sahiptir — bir Bölge'de meydana gelen büyük bir arıza, otomatik olarak diğerlerini etkilemez.

"Nimbus için `us-west-2`'yi seçmeliyiz?" diye sordu Tom.

Evet. ABD'li bir iş, Batı Kıyısı müşterilerine yönelikse, evet. Daha düşük gecikme süresi ve kullanıcılarınız daha hızlı yanıtlar alır.

"Singapur'a göre ne kadar daha pahalı?" diye ekledi Tom.

Fiyatlar Bölgeye göre değişir — genellikle birkaç yüzlük bir yüzde. Doğru Bölge'nin performansı ve uyumluluk faydası, küçük fiyat farkından değerlidir.

**Erişilebilirlik Bölgeleri: Gerçek Yedeklilik**

İşte ilginç olan yer.

Her Bölge tek bir veri merkezi değildir. Birden fazla, fiziksel olarak ayrılmış veri merkezi olan bir kümedir.

Oregon (`us-west-2`), `us-west-2a`, `us-west-2b`, `us-west-2c`, `us-west-2d` gibi dört Erişilebilirlik Bölgesi (AZ) içerir. Bunlar gerçek binalardır, anlamlı mesafelerde ayrılmışlardır — bir yangın, sel veya güç kesintisi birinde diğerini etkilemeyecek kadar uzaktır, ancak aralarındaki ağ son derece hızlı (birlikte birkaç milisaniye gecikme) olacak kadar yakındır.

Bu, AWS'nin tek bir veri merkezi eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği eşiği

**Kenarları Konumları** küçük, hafif ağırlıklı altyapı noktalarıdır ve dünya çapında 400’den fazla şehirde yayılmıştır. Tam veri merkezleri değildir – uygulamanızı çalıştıramazlar.
Yapabilecekleri şey, kullanıcılarınıza yakın içerikleri önbelleğe almaktır.

Tokyo’da yaşayan biri tarafından görüntülenmesini istediği her zaman bir menü görüntüsünün sunucuda Virginia’da depolandığı hayal edin. İstek, Pasifik üzerinden seyahat eder ve geri döner. Kenarları Konumları ile, o dosyanın bir kopyasını Tokyo’da saklayabilir ve yerel olarak sunabilir — onlarca mil yerine yüzlerce mil.

Bu, AWS’nin İçerik Dağıtım Ağı olan CloudFront’ın omurgasını oluşturmaktadır. 13. Bölüme daha yakından bakalım. Şu anda: Kenarları Konumları, statik içerikler için hızdır.

**Bir Bölge Seçmek: Kıdemli Mühendislik Kontrol Listesi**

Nimbus, kullanıcıları Meksika ve Kolombiya’da hizmete sunmaya başladığında (12. Bölümde gerçekleşen), Bölge kararı keyfi değildir. Düşünceleri burada bulabilirsiniz:

**1. Kullanıcılarınız Nerede?**

Buradan başlayın. Kullanıcılarınızın çoğunluğuna en yakın Bölgeyi seçin. Gecikme, Bölge seçimiyle ilgili en doğrudan ve ölçülebilir etki olan latencedir.

**2. Uyumluluk Gereksinimleriniz Var mı?**

Sağlık hizmeti, finans ve hükümet iş yükleri genellikle sıkı veri yerleşim kuralları vardır. Seçmeden önce düzenleyici ortamınızı bilin.

**3. Hangi Hizmetlere İhtiyacınız Var?**

AWS’nin her hizmeti her Bölgede bulunmaz. Yeni hizmetler genellikle `us-east-1`’de ilk olarak başlatılır. Belirli bir hizmete ihtiyacınız varsa, hedef Bölgenizin bunu desteklediğini doğrulayın.

**4. Fiyat Nedir?**

Bölgeler farklı fiyatlara sahiptir. `us-east-1` (Northern Virginia) ölçeği ve yaş nedeniyle genellikle en ucuz olanıdır. Güney Amerika biraz daha pahalıdır. AWS fiyatlandırma sayfasını sonlandırmadan önce kontrol edin.

**5. Çoklu Bölgeye İhtiyacınız Var mı?**

Çoğu uygulama için, tek bir Bölge içindeki birden fazla AZ yeterli dayanıklılıktır. Bir Bölge arızası bile kabul edilemez kritik uygulamalar için, çoklu Bölgeye tasarım yaparsınız - ancak bu önemli bir mimari taahhüttür. Bunu varsayımlı olarak yapmayın.

**Konuşulmayan Sınırlandırma**

Bölgeler güçlüdür, ancak önemli bir gerilim yaratırlar.

Birden çok Bölgede çalışmak gerçekten zordur.

Bölge A’daki bir işlem, Bölge B’ye anında görünür olacak şekilde, Bölge A’daki verilerin Bölge B’ye çoğaltılması, dağıtılmış sistemlerdeki en zorlu problemlerden biridir. AWS bunu yapmanıza yardımcı araçlar sağlar, ancak para harcamanıza ve operasyonel karmaşıklığı artırmanıza neden olur.

Çoğu uygulama, tek bir Bölge, birden fazla AZ ve çoklu Bölgeye yalnızca açık bir gereklilik olduğunda başlayarak bir Bölge ile başlar. Düzenleyici emirler, SLA’lar tarafından gerekli yakın sıfır bölgesel kesinti süresi veya kullanıcı tabanınız gerçekten kıtalar arasında dağılmışsa.

Erken çoklu Bölge mimarisi, junior mühendislerin kendilerini güvenli hissettikleri zaman yaptıkları en yaygın ve en pahalı hatalardan biridir.

Tom başını salladı. “Yani, yapabilirsek bile çoklu Bölge yapmayacağız.”

“İhtiyacımız olduğunda yapacağız,” dedi Maya. “Ve bunu bildiğimizde yapacağız.”

“Nasıl bileceğiz?” diye sordu Leo.

“Mimari dokümanınızda ‘bir bölgesel arızayı dayanıklı hale getirmeli’ diye bir gereklilik olduğunda,” dedi Priya. “Bu kadar uzun süre: çoklu AZ.”

## Güçlü Yönler ve Sınırlandırmalar

**Çoklu bölge ve çoklu AZ tasarımını kullanın**: Uygulamanızın kullanıcıları farklı coğrafi bölgelerde ve gecikme önemliyse; SLA’nız 99,99% veya daha yüksek kullanılabilirlik gerektiriyorsa; düzenleyici gereksinimler belirli bölgelerde veri yerleşimini zorunlu kılıyorsa; bir saat altındaki bir bölgesel kesinti süresi için kurtarma süresi gerektiriyorsanız.

**Farklılıklar gerçek**: Verileri bölgeler arasında çoğaltmak maliyetlidir - çapraz bölge veri aktarımı, AWS faturalandırmasında en az tahmin edilen kalemlerden biridir. Ayrıca operasyonel karmaşıklığı artırır: bir yazının bölge A’daki bir işlem, Bölge B’ye anında görünür olacak şekilde çoğaltılması, dağıtılmış sistemlerdeki en zorlu problemlerden biridir. Güvenlik grubu gibi yerel sorunlara veya dağıtım hatalarına odaklanan uygulamalarda arızalar yatırım yapmak için değildir. Çoklu AZ’ye çoklu bölgeye geçmeden önce yatırım yapın. İşlemin açık bir gerekmesi olduğunda çoklu bölgeye geçin.

## Özet

- AWS, küresel altyapısını **Bölgeler**, **Erişilebilirlik Bölgeleri** ve **Kenar Konumları** olarak organize eder.
- Bir **Bölge**, veri merkezlerinin coğrafi bir kümesidir. Her Bölge izole edilmiştir - veri, açıkça taşınmadığı sürece Bölge içinde kalır.
- **Erişilebilirlik Bölgeleri**, bir Bölge içindeki fiziksel olarak ayrı veri merkezleridir ve düşük gecikmeli ağlarla birbirine bağlanır. Çoklu AZ’ye dağıtmak, yerel arızaları dayanmak için standart yoldur.
- **Kenar Konumları**, kullanıcıları dünya çapında yakındaki içerikleri önbelleğe alır. CloudFront’ı güçlendirir.
- Bölgenizi kullanıcı konumuna, uyumluluk gereksinimlerine, hizmet kullanılabilirliğine ve fiyata göre seçin - bu sırayla.
- Çoklu AZ, dayanıklılık için standart bir temeldir. Çoklu Bölge, belirli, belgelenmiş gereksinimlere sahip kritik iş yükleri için kullanılır - varsayımlı bir başlangıç noktası değildir.

## Sınav İpuçları

*SAA-C03 Alan 1 – Görev 1.1 / Alan 2 – Görev 2.2*

- **Bölgesel bölgeler varsayılan olarak izole edilir.** Veri, yapılandırılmadığı sürece bölgeler arasında çoğaltılmaz. Bu, veri egemenliği ve uyumluluk senaryoları için önemlidir.
- **BÖLGE'ler çoğu soruda dayanıklılık birimidir.** Sınav, bir veri merkezi arızasının nasıl atlatılacağını sorarken, cevap, bir Bölge içinde birden fazla BÖLGE'nin ilgisini içerir.
- **Çok Bölgesel, bölgesel kesinti dayanıklılığı içindir.** Senaryo "bir tüm AWS Bölgesinin başarısız olması durumunda bile çalışmaya devam etmeli" diyorsa, cevap çok Bölgesel mimariyi içerir.
- **Kenar Konumları ≠ BÖLGE'ler.** Kenar Konumları içeriği önbelleğe alır — uygulamanızın sunucularını çalıştırmaz. Veri merkezleriyle karıştırılmamalıdır.
- Sınav, uyumluluk ve Bölge seçimi arasındaki ilişkiyi sık sık test eder. Bir senaryo veri yerleşim gereksinimlerini belirtirse, Bölge seçimi cevabın bir parçasıdır.

## Uygulamalar

**Uygulama 1 — Hatırlama**

Kendi kelimelerinizde: Bir Bölge ve Bir Erişilebilirlik Bölgesi arasındaki fark nedir?
Bu ayrımın, dayanıklı bir web uygulaması tasarlarken nasıl bir önemi vardır?

*(İpucu: Her biri hangi tür arızayı önlediğini düşünün.)*

**Uygulama 2 — Sınav Uygulaması**

*Senaryo:* Bir ABD sağlık şirketi, iç veri yerleşim politikalarına uyum sağlamak için tüm hasta verilerini tek bir AWS
Bölgesinde saklamalıdır. Batı Yakasında yeni bir bulut uygulaması tasarlıyorlar ve başka bir Bölgeye veri taşımasına gerek kalmadan dayanıklılığı en üst düzeye çıkarmak istiyorlar.

Onlara en uygun yapılandırma hangisidir?

A) `us-east-1`'de dağıtın ve Oregon'daki Edge Konumlarında içeriği daha hızlı sunmak için CloudFront Edge Konumlarını kullanın
B) `us-west-2`'de (Oregon) birden fazla Erişilebilirlik Bölgesi'nde dağıtın
C) `us-west-2` ve `us-east-1` dahil olmak üzere birden fazla Bölge'de çapraz Bölgesel veri replikasyonu ile dağıtın
D) `us-west-2`'de tek bir Erişilebilirlik Bölgesi'nde dağıtın ve maliyetleri en aza indirin

**İpucu 1**: Politika, verilerin tek bir Bölge'de kalmasını gerektirir. Başka bir Bölge'ye veri taşıyan seçenekler hangileridir?

**İpucu 2**: Tek bir Bölge'de `us-west-2`'de kalan seçenekler arasında dayanıklılık açısından hangisi en iyisidir?

**İpucu 3**: Bir Bölge içinde birden fazla BÖLGE, Bölge sınırlarını geçen olmadan dayanıklılık sağlar.

**Cevap**: B

**Açıklama**: `us-west-2`, tüm verileri tek bir Bölge'de tutarak politikayı karşılar. Bu, veri merkezi arızalarına karşı koruma sağlarken başka bir Bölge'ye veri taşımadan çok Bölge içinde birden fazla Erişilebilirlik Bölgesi'nde dağıtımı içerir.

**A seçeneği neden doğru değil?** CloudFront, Edge Konumlarında içeriği önbelleğe alır — veri, politika ihlali nedeniyle `us-west-2`'den fiziksel olarak ayrılır.

**C seçeneği neden doğru değil?** `us-east-1`'e veri replikasyonu, hasta verilerini Batı Yakasına taşıyarak politikayı doğrudan ihlal eder.

**D seçeneği neden doğru değil?** Tek bir BÖLGE, hiçbir dayanıklılık sağlamaz. Bu BÖLGE'de bir arıza meydana gelirse, uygulama tamamen başarısız olur.

*SAA-C03 Alan 1 — Görev 1.1 (küresel altyapı, veri egemenliği)*

**Uygulama 3 — Mimari Ziyaret** *(İsteğe bağlı)*

Nimbus, müşterilerine Meksika ve Kolombiya'da hizmet vermek için genişliyor. Şu anda her şey `us-west-2`'de çalışıyor. Takım, ikinci bir Bölge olan `us-east-1`'i eklemeli mi yoksa birden fazla BÖLGE'de çoklu BÖLGE ile kalmalı mı konusunda tartışıyor?

Karar vermeden önce hangi soruları sorardınız? İkinci bir Bölge eklemenin ana maliyetleri ve riskleri nelerdir? Tek bir Bölge eklememekteki ana maliyet nedir?

*(Tek bir doğru cevap yoktur. Çok Bölgesel ödün verme mantığını uygulayın.)*

## Kredi Sonrası Sahne

Leo, Singapur sorununu çözdü. Nimbus, `us-west-2`'ye taşındı. Gecikme azaldı.
Tom'un tek bir takip sorusu — "bu, faturalarımızı değiştirdi mi?" — daha yüksek bir sayı ile cevaplandı, bu da onu görünür bir isteksizlikle kabul etti.

Bu iki gün sürdü ve sonraki sorun geldi.

Leo, standup'ta Maya tarafından öğrenilen ifadeyle geldi: bir şeyi yapmanın yapamadığı birinin ifadesi.

"Yani," dedi dikkatlice, "sunucuyu ayarladım. Ve oturum açmam gerekiyordu. Bu yüzden 'Admin' adında bir kullanıcı adı oluşturdum."

"Ve?" Priya sordu.

"'Admin'."

Sessizlik.

"'Şifresi ne?'"

Daha uzun bir sessizlik.

"'Admin123'."

Priya ayağa kalktı.

Bir sonraki bölümde, Nimbus'ın neyin dokunulabileceğini ve yanlış yaparlarsa ne olacağı kontrol edilecek.
