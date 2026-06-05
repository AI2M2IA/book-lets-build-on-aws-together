# บทที่ 21: ตู้คอนเทนเนอร์สำหรับ Code

"มันทำงานบนเครื่องของฉัน"

Leo เรียนรู้ที่จะไม่พูดสิ่งนี้ออกเสียง มันไม่ใช่การแก้ตัว — มันคือการวินิจฉัย และการวินิจฉัยครั้งนี้คือ EC2 instance production หมายเลขสาม ที่ได้รับ library patch หกสัปดาห์ก่อนที่ไม่มีใครบันทึกไว้

**Container คืออะไร?**

**Container** คือหน่วยที่เบาและพกพาได้ที่บรรจุแอปพลิเคชันของคุณพร้อมกับทุกสิ่งที่ต้องการเพื่อรัน: runtime, libraries, config files และ application code

ต่างจาก virtual machine (ที่จำลองคอมพิวเตอร์ทั้งเครื่องรวมถึง OS kernel) container แชร์ OS kernel ของ host ในขณะที่เก็บทุกอย่างอื่นไว้แยกกัน

คุณสมบัติสำคัญ: **Immutability** Image ที่สร้างวันนี้จะรันแบบเดิมกันบน host ใดก็ตามที่รองรับ Docker

**Amazon ECS: Orchestrator**

**Amazon ECS (Elastic Container Service)** คือ managed container orchestration service ของ AWS คุณกำหนด:

- **Task definition**: Image container ใดที่จะรัน CPU และหน่วยความจำเท่าไหร่
- **Service**: จะรัน task กี่สำเนา
- **Cluster**: โครงสร้างพื้นฐานการประมวลผลพื้นฐาน

**Fargate กับ EC2 Launch Type**

**EC2 launch type**: คุณจัดการ EC2 instances พื้นฐาน

**Fargate (serverless compute for containers)**: AWS จัดการโครงสร้างพื้นฐานพื้นฐานทั้งหมด

**Amazon EKS: เมื่อคุณต้องการ Kubernetes**

**Amazon EKS** คือ managed Kubernetes บน AWS

**เมื่อไหร่ควรใช้ ECS กับ EKS?**

**ใช้ ECS** ถ้า:
- คุณอยู่บน AWS เป็นหลักและต้องการประสบการณ์ที่เรียบง่ายกว่า
- ทีมของคุณไม่มีความเชี่ยวชาญ Kubernetes

**ใช้ EKS** ถ้า:
- คุณต้องการคุณสมบัติเฉพาะของ Kubernetes
- ทีมของคุณรู้จัก Kubernetes อยู่แล้ว

"ECS" Priya พูดทันที "เราไม่มีความเชี่ยวชาญ Kubernetes ECS ทำทุกอย่างที่เราต้องการ"

## สรุป

- **Containers** บรรจุ application code, runtime และ dependencies — รันแบบเดิมกันทุกที่
- **Docker** คือ container technology มาตรฐาน Images เป็น blueprints; containers เป็น running instances
- **ECR (Elastic Container Registry)** คือ managed Docker registry ของ AWS
- **ECS** orchestrate containers คุณกำหนด tasks และ services; ECS จัดการ placement และ lifecycle
- **Fargate** คือ serverless compute สำหรับ containers — ไม่มี EC2 instances ที่ต้องจัดการ
- **EKS** คือ managed Kubernetes — สำหรับทีมที่ต้องการ Kubernetes ecosystem

## ฉากหลังเครดิต

การ deploy container ครั้งแรกสมบูรณ์แบบ

เวอร์ชันใหม่ของ API: ไม่มีการหยุดทำงาน ECS ปรับใช้มัน health checks ผ่าน tasks เก่า drain tasks ใหม่เข้ามาแทนที่

"มันแค่ทำงาน" Leo พูด

"นั่นคือประเด็น" Priya พูด

ในบทต่อไป: แผนผังที่รันตัวเอง — และจำว่าหยุดอยู่ที่ไหน
