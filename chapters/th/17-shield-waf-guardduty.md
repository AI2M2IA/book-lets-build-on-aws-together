# บทที่ 17: ผู้เฝ้าระวัง

เหตุการณ์กับ IP โรมาเนียถูกควบคุม Priya ถามว่า: "ถ้ามีอะไรผิดปกติปรากฏในบันทึก CloudTrail เราจะรู้ได้อย่างไร?"

คำตอบที่ซื่อสัตย์คือ: อาจจะไม่รู้

CloudTrail บันทึกเหตุการณ์หลายพันรายการต่อวัน ไม่มีใครอ่านทั้งหมด

"เราต้องการบางอย่างที่ดูบันทึกแทนเรา" เธอพูด

**สามหมวดหมู่ภัยคุกคาม**

ภัยคุกคามความปลอดภัยต่อแอปพลิเคชันคลาวด์มักแบ่งเป็นสามหมวดหมู่:

**การโจมตีเชิงปริมาณ (DDoS)**: ผู้โจมตีส่ง traffic มากเกินไป

**การโจมตีแอปพลิเคชัน (Exploits)**: ผู้โจมตีส่งคำขอที่ออกแบบมาเฉพาะ SQL injection, cross-site scripting

**ความผิดปกติทางพฤติกรรม (Reconnaissance)**: การเรียก API ที่ไม่ควรเกิดขึ้น กิจกรรม IAM ผิดปกติ

AWS มี service เฉพาะสำหรับแต่ละอัน:

- **AWS Shield**: ป้องกัน DDoS
- **AWS WAF**: ป้องกันชั้น application
- **Amazon GuardDuty**: ตรวจจับภัยคุกคามทางพฤติกรรม

**AWS Shield**

**AWS Shield Standard** เปิดใช้งานโดยอัตโนมัติสำหรับลูกค้า AWS ทั้งหมดโดยไม่มีค่าใช้จ่าย ป้องกันการโจมตี DDoS ชั้น 3 และ 4 ที่พบบ่อยที่สุด

**AWS Shield Advanced** ($3,000/เดือน ต่อองค์กร): เพิ่มการป้องกันสำหรับ EC2, ELB, CloudFront การแจ้งเตือนการโจมตีแบบ near real-time การเข้าถึง AWS Shield Response Team

**AWS WAF**

**AWS WAF** ทำงานในระดับ HTTP — ตรวจสอบเนื้อหาของคำขอเว็บก่อนที่จะถึงแอปพลิเคชัน

**Managed Rule Groups**:

- **AWS Managed Rules - Core Rule Set**: ป้องกัน OWASP Top 10
- **AWS Managed Rules - Amazon IP Reputation List**: บล็อก IPs ที่เกี่ยวข้องกับ botnets

**Amazon GuardDuty**

GuardDuty วิเคราะห์อย่างต่อเนื่อง:

- **AWS CloudTrail logs**: การเปลี่ยนแปลง IAM, การเรียก API, การล็อกอิน console
- **VPC Flow Logs**: รูปแบบ network traffic ภายใน VPC
- **DNS query logs**

"นั่นคือสิ่งที่จะจับ IP โรมาเนียได้" Leo พูดเงียบๆ

GuardDuty ถูกเปิดใช้งาน

## สรุป

- **AWS Shield Standard**: ป้องกัน DDoS ชั้น 3/4 ฟรีและอัตโนมัติ
- **AWS Shield Advanced**: ป้องกัน DDoS ระดับพรีเมียมพร้อมการเข้าถึง SRT และ cost protection
- **AWS WAF**: Application firewall ตรวจสอบและกรองคำขอ HTTP
- **Amazon GuardDuty**: ตรวจจับภัยคุกคามทางพฤติกรรม วิเคราะห์ CloudTrail, VPC Flow Logs และ DNS logs
- **CloudTrail**: พื้นฐานของ AWS security logging ทั้งหมด

## เคล็ดลับการสอบ

- **Shield Standard กับ Advanced**: Standard ฟรีและอัตโนมัติ Advanced จ่ายเงินและเพิ่ม SRT, cost protection
- **สัญญาณ WAF**: "บล็อก SQL injection," "จำกัดการเรียก API," "OWASP Top 10" → WAF
- **สัญญาณ GuardDuty**: "ตรวจจับกิจกรรม API ผิดปกติ," "ระบุ IAM ที่ถูก compromise" → GuardDuty

## ฉากหลังเครดิต

GuardDuty ถูกเปิดใช้งาน

สี่สิบแปดชั่วโมงต่อมา มันสร้าง finding แรก: *"EC2 Instance กำลังสื่อสารกับ Tor exit node ที่รู้จัก"*

Leo มองที่ instance ID

"นั่นคือ instance ตรวจสอบภายใน" เขาพูด "อันที่ฉันตั้งค่าสำหรับรัน network diagnostics"

"มันควรสื่อสารกับ Tor exit nodes ไหม?"

"ไม่" เขาหยุด "ทำไมมันถึงทำ?"

เขาดึง instance ขึ้น มีคนติดตั้งเครื่องมือบนมัน — network scanner open-source ที่ถูกต้องที่ยังสื่อสารกับ Tor infrastructure สำหรับการรวบรวมข้อมูลแบบไม่ระบุตัวตน

Leo ถอนการติดตั้งเครื่องมือนั้น เขาตั้งกระบวนการทบทวนเครื่องมือ third-party ทุกตัวก่อนติดตั้ง

ในบทต่อไป: เกิดอะไรขึ้นเมื่อศูนย์ข้อมูลในเวอร์จิเนียหายไป — และทำไม Nimbus ยังคงทำงานต่อ
