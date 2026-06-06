# บทที่ 21: ตู้คอนเทนเนอร์สำหรับ Code

ก่อนปี 1956 การขนสินค้าขึ้นเรือเป็นการต่อรองที่ต้องใช้ทักษะและความเชี่ยวชาญเฉพาะ เรือทุกลำมีระวางต่างกัน ท่าเรือทุกแห่งมีเครนต่างกัน ผู้ขนส่งทุกรายมีระบบติดตามว่าอะไรไปที่ไหนต่างกัน ลังสินค้าเคลื่อนจากรถบรรทุกสู่ท่าเรือสู่เรือสู่ท่าเรือสู่รถบรรทุกผ่านห่วงโซ่ของคนที่จัดการมันแตกต่างกันทั้งหมด สินค้าสูญหาย สินค้าเสียหาย สินค้าเดียวกันที่ขนส่งสองครั้งมาถึงในสภาพต่างกันเพราะการจัดการต่างกันทั้งสองครั้ง

คำตอบเมื่อในที่สุดมีใครถามมันอย่างชัดเจนคือ: ทำให้ตู้คอนเทนเนอร์เป็นมาตรฐาน อย่าแก้ปัญหาที่ทุกท่าเรือ แก้มันครั้งเดียวที่ระดับตู้คอนเทนเนอร์ ขนส่งกล่อง ไม่ใช่แค่เนื้อหา

ตู้คอนเทนเนอร์ขนส่งที่เป็นมาตรฐานไม่เพียงทำให้การขนส่งเร็วขึ้น มันทำให้การขนส่ง*คาดเดาได้* เนื้อหาของตู้คอนเทนเนอร์ในเซี่ยงไฮ้อยู่ในสภาพเดียวกันเป๊ะเมื่อมาถึงรอตเตอร์ดัม — เพราะตู้คอนเทนเนอร์ปกป้องพวกมันจากความผันแปรที่ทุกจุดถ่ายโอน

นั่นคือปัญหาเดียวกันเป๊ะที่ Leo มี Nimbus API กำลังถูก "บรรจุ" แตกต่างกันที่ทุก "ท่าเรือ": staging deploy ต่างจาก production, instance หนึ่ง deploy ต่างจาก instance สาม และการเปลี่ยนแปลงที่ไม่มีเอกสารตลอดหกสัปดาห์ทำให้ fleet คาดเดาไม่ได้

ตู้คอนเทนเนอร์จะไม่ทำให้ Leo เป็นนักพัฒนาที่เร็วขึ้น มันจะทำให้ deployments คาดเดาได้

---

การ migrate ไป Lambda ลดบิล EC2 สำหรับ services ขนาดเล็ก แต่ core API แตกต่าง — มันทำงานต่อเนื่อง รับ order traffic ทั้งหมด และสะสมประวัติ configuration มาแปดเดือน Lambda แก้ปัญหาความ idle Containers จะแก้ปัญหาความไม่สอดคล้อง

core API ไม่ได้ idle; มันย้ายไป Lambda ไม่ได้ แต่มันมีปัญหาที่แตกต่าง: EC2 instances ที่รันมันได้แตกต่างกันออกไป

---

Leo เรียนรู้ที่จะไม่พูด "มันทำงานบนเครื่องของฉัน" ออกเสียง มันไม่ใช่การแก้ตัว — มันคือการวินิจฉัย และการวินิจฉัยครั้งนี้คือ production EC2 instance หมายเลขสาม ที่ได้รับ library patch หกสัปดาห์ก่อนที่ไม่มีใครบันทึกไว้ ที่อีกสอง instances ไม่ได้รับ และที่ตอนนี้กำลังทำให้เกิด bug ที่มีอยู่เฉพาะที่นั่น ใน instance ตัวเดียวนั้น มองไม่เห็นที่อื่นทั้งหมด

เขาใช้เวลาสามชั่วโมงเมื่อคืนก่อนในการตามหามัน

"ทุกครั้งที่เรา deploy" เขาพูดในเช้าวันรุ่งขึ้น "เราประสานงานข้าม instances หลายตัว เวอร์ชันใหม่ dependencies ต่างกัน ทำงานใน staging พังใน production เพราะ environments แตกต่างกันออกไป"

"เพราะมีคนอัปเดต package บน instance สามโดยไม่อัปเดตตัวอื่น" Priya พูด ไม่ใช่อย่างไม่เป็นมิตร

"ผมต้องการเวอร์ชันเฉพาะของ—"

"ฉันรู้" เธอพูด "และตอนนี้ instance สามมีประวัติต่างจาก instance หนึ่งและสอง นั่นคือ configuration drift มันเงียบจนกว่ามันจะไม่เงียบ"

"วิธีแก้จริงคืออะไร?" Maya ถาม

"หยุดปฏิบัติต่อเซิร์ฟเวอร์เหมือนสิ่งถาวรที่คุณตั้งค่า" Priya พูด "เริ่มปฏิบัติต่อพวกมันเหมือนหน่วยใช้แล้วทิ้งที่คุณแทนที่ได้"

**Container คืออะไร?**

"ลองนึกถึงมันเหมือนตู้คอนเทนเนอร์ขนส่ง" Leo พูดขณะหยิบปากกามาร์กเกอร์ "ตู้คอนเทนเนอร์ไม่สนใจว่ามันอยู่บนเรือลำไหน เรือไม่สนใจว่าอะไรอยู่ในตู้คอนเทนเนอร์ พวกเขาตกลงกันเรื่องขนาดและกลไกการล็อก ทุกอย่างอื่นอยู่ในกล่อง"

**container** คือหน่วยที่เบาและพกพาได้ที่บรรจุแอปพลิเคชันของคุณพร้อมกับทุกสิ่งที่ต้องการเพื่อรัน: runtime (Python 3.11, Node.js 20, Java 17), libraries และ dependencies, configuration files และตัว application code เอง

ต่างจาก virtual machine (ที่จำลองคอมพิวเตอร์ทั้งเครื่องรวมถึง operating system kernel) container แชร์ host OS kernel ในขณะที่เก็บทุกอย่างอื่นไว้แยกกัน สิ่งนี้ทำให้ containers เริ่มเร็ว (วินาที บางครั้งมิลลิวินาที) และเล็ก (เมกะไบต์ ไม่ใช่กิกะไบต์)

container technology ที่นิยมที่สุดคือ **Docker** Docker image คือพิมพ์เขียว — snapshot ของแอปพลิเคชันและ environment ของมัน Docker container คือ running instance ของ image นั้น

คุณสมบัติสำคัญ: **immutability** Image ที่สร้างวันนี้จะรันเหมือนกันบน host ใดก็ตามที่รองรับ Docker — แล็ปท็อป, EC2 instance, เซิร์ฟเวอร์ในดาต้าเซ็นเตอร์อื่น environment ถูกอบเข้าไป Configuration drift เป็นไปไม่ได้

"ดังนั้นแทนที่จะกังวลว่าอะไรถูกติดตั้งบน EC2 instance" Leo พูด "เราสร้าง image ที่มีทุกอย่าง image รันในแบบเดียวกันทุกที่"

"และถ้าคุณต้องการทดสอบมันในเครื่อง คุณรัน image เดียวกัน" Priya เสริม "ไม่มี 'มันทำงานบนเครื่องของฉัน' อีกต่อไป"

**การสร้าง Docker Image และ Push ไปยัง ECR**

ก่อนที่ orchestrator ใดจะจัดการ container ได้ Leo ต้องสร้างมันและเก็บไว้ที่ไหนสักแห่งที่ ECS ดึงได้

เขาเขียน Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

บรรทัดสำคัญ: `FROM python:3.11-slim` ไม่ใช่ Python 3.9 ไม่ใช่ Python 3.10 3.11 — เวอร์ชันเฉพาะที่ทีมตกลงกัน อบเข้าไปใน image ทุก instance ที่รัน image นี้จะใช้ Python 3.11 พอดี พฤติกรรมการปัดเศษของ decimal module จะเหมือนกันทุกที่

เขาสร้าง image ในเครื่อง: `docker build -t nimbus-api:1.0.0 .`

การ build ใช้เวลา 4 นาที Docker ดึง base image ติดตั้ง dependencies คัดลอก application code และสร้าง image ที่ติด tag `nimbus-api:1.0.0`

เขารันมันในเครื่อง: `docker run -p 8000:8000 nimbus-api:1.0.0`

API เริ่มต้น port เดียวกัน พฤติกรรมเดียวกับ production server — เพราะ environment เหมือนกัน

จากนั้นเขา push มันไปยัง ECR:

```bash
# Authenticate Docker เข้ากับ ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# ติด tag image สำหรับ ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

การ push ใช้เวลา 2 นาที ECR เก็บ image, trigger image scan ทันที และรายงานผลภายใน 5 นาที

**Amazon ECS: Orchestrator**

การรัน container ตัวเดียวนั้นง่าย การรัน containers หลายสิบตัวข้าม hosts หลายตัว routing traffic ระหว่างพวกมัน restart containers ที่ล้มเหลว deploy เวอร์ชันใหม่โดยไม่มี downtime — นั่นต้องการ **orchestrator**

**Amazon ECS (Elastic Container Service)** คือ managed container orchestration service ของ AWS คุณกำหนด:

- **Task definition**: image container ใดที่จะรัน CPU และ memory เท่าไร environment variables อะไร ports ใดที่จะเปิด
- **Service**: จะรัน task กี่สำเนา จะจัดการความล้มเหลวและ deployments อย่างไร
- **Cluster**: compute infrastructure พื้นฐาน

ECS จัดการที่เหลือ: การวาง tasks บน capacity ที่ว่าง restart tasks ที่ล้มเหลว draining connections ในระหว่าง deployments register tasks ที่แข็งแรงกับ load balancer

สำหรับ Nimbus, API ย้ายจาก EC2 instances ที่มี deployments ที่จัดการด้วยตนเองไปยัง ECS แต่ละ deployment ใหม่ push Docker image ใหม่ไปยัง **Amazon ECR (Elastic Container Registry)** — managed container registry ของ AWS — และ ECS roll out มันข้าม tasks ทั้งหมดด้วย zero downtime

**Fargate กับ EC2 Launch Type**

ECS สามารถรัน containers ในสองโหมด:

**EC2 launch type**: คุณจัดการ EC2 instances พื้นฐาน คุณรับผิดชอบการ patch instances ปรับขนาดให้เหมาะสม และทำให้แน่ใจว่ามี capacity เพียงพอสำหรับ containers ของคุณ ควบคุมมากขึ้น รับผิดชอบมากขึ้น

**Fargate (serverless compute สำหรับ containers)**: AWS จัดการ infrastructure พื้นฐานทั้งหมด คุณระบุ CPU และ memory ต่อ task; Fargate จัดหา capacity ที่ถูกต้องโดยอัตโนมัติ ไม่มี EC2 instances ให้จัดการ คุณจ่ายต่อ vCPU-second และ GB-second ของ memory

Fargate คือโมเดล "serverless containers" — คุณได้ environment isolation ของ containers โดยไม่ต้องจัดการเซิร์ฟเวอร์ trade-off: ควบคุม instance configuration พื้นฐานน้อยลงและ per-unit cost สูงกว่าเล็กน้อย

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถามขณะเปิด pricing calculator "Fargate เทียบกับ EC2 launch type — ผมอยากเห็นตัวเลขจริง"

การประมาณตามสัญชาตญาณของ Leo — ตัวที่ทุกคนมีติดตัว — คือ Fargate จะแพงกว่า ความสะดวกแบบ serverless ราคาพรีเมียม เขาเดาว่าอาจยี่สิบหรือสามสิบเปอร์เซ็นต์มากกว่า EC2

"คำนวณตัวเลขจริง" Tom พูด เพราะนั่นคือ Tom

Nimbus API service รัน 3 tasks แต่ละตัวต้องการ 0.5 vCPU และ 1GB memory, 24/7:

**Fargate**: $0.04048/vCPU-hour × 0.5 × 3 × 720 ชั่วโมง = $43.72/เดือน สำหรับ CPU $0.004445/GB-hour × 1 × 3 × 720 = $9.60/เดือน สำหรับ memory รวม: $53.32/เดือน

**EC2 launch type** (3 × t3.medium ที่ $0.0416/ชั่วโมง): $0.0416 × 3 × 720 = $89.86/เดือน

"เดี๋ยว" Tom พูด "Fargate ถูกกว่า?"

"ที่ขนาดนี้ ใช่" Leo พูด "Fargate เรียกเก็บเงินตามที่คุณจัดสรรพอดี EC2 instances มี overhead — OS และ ECS agent บริโภค CPU และ memory บางส่วนก่อนที่ containers ของคุณจะเริ่มด้วยซ้ำ t3.medium ให้ 2 vCPU และ 4GB แต่คุณใช้ 0.5 vCPU และ 1GB ต่อ container ที่เหลือสูญเปล่า"

"แต่ EC2 launch type ให้คุณ pack tasks หลายตัวบน instance เดียว"

"ใช่ ที่ scale ใหญ่กว่า ด้วย bin-packing อย่างระมัดระวัง EC2 launch type ถูกกว่า ที่ scale ของเรา — สาม tasks — Fargate ชนะ"

Tom จดสิ่งนี้ไว้

สำหรับ Nimbus: Fargate สำหรับ API service พวกเขาไม่ต้องการจัดการ EC2 instances สำหรับ containers

ถ้าคุณ containerize ด้วย Fargate คุณขจัด EC2 management overhead ทั้งหมด — แต่คุณเสียความสามารถในการ customize instance types ซึ่งสำคัญสำหรับ GPU workloads หรือ specialized networking ถ้าคุณเลือก ECS สำหรับความเรียบง่ายแบบ AWS-native คุณได้ tight IAM และ ALB integration — แต่คุณถูกล็อกออกจาก Kubernetes ecosystem ซึ่งต้องการการ rearchitect ถ้าคุณต้องการ multi-cloud portability ในภายหลัง

**Amazon EKS: เมื่อคุณต้องการ Kubernetes**

**Kubernetes** เป็น open-source container orchestration system — โดยพื้นฐานเป็นมาตรฐานอุตสาหกรรมสำหรับการจัดการ containers ที่ scale มันทรงพลัง ขยายได้ และซับซ้อน

**Amazon EKS (Elastic Kubernetes Service)** คือ managed Kubernetes service ของ AWS มันรัน Kubernetes control plane (ชั้นการจัดการ) ให้คุณ ในขณะที่คุณจัดการ worker nodes (หรือใช้ Fargate สำหรับพวกนั้นด้วย)

คุณอาจสงสัยว่า: ถ้า Kubernetes เป็นมาตรฐานอุตสาหกรรมและทุกประกาศรับสมัครงานกล่าวถึงมัน ทำไมเราถึงไม่ใช้มันเลย? เพราะ "มาตรฐานอุตสาหกรรม" อธิบายสิ่งที่บริษัทใหญ่ที่มี dedicated platform teams ใช้ สำหรับทีมหกคนที่สร้างแอปสั่งอาหาร Kubernetes เพิ่ม operational complexity โดยไม่มีประโยชน์ในทางปฏิบัติในตอนนี้ ความซับซ้อนเป็นเรื่องจริง; ประโยชน์เป็นทฤษฎีที่ scale นี้

Kubernetes ให้คุณค่าที่ระดับความซับซ้อนที่ทีมส่วนใหญ่ไม่ต้องการ: custom resource definitions สำหรับการสร้าง internal platforms, advanced scheduling constraints, pod disruption budgets สำหรับการควบคุม deployment แบบละเอียด และ service mesh integration สำหรับ traffic management ระหว่าง microservices หลายร้อยตัว สิ่งเหล่านี้เป็นความสามารถที่แท้จริง พวกมันยังเป็นความสามารถที่ startup ขนาดของ Nimbus จะไม่มีวันได้ใช้

หลักการวิศวกรรมตรงนี้บางครั้งเรียกว่า YAGNI: You Aren't Gonna Need It (คุณจะไม่ต้องการมันหรอก) ECS ให้ Nimbus ทุกอย่างที่พวกเขาต้องการในตอนนี้ EKS ให้พวกเขามากกว่าที่ต้องการ บวกกับ learning curve ที่สำคัญและ operational overhead "มันจะมีประโยชน์ในภายหลัง" ไม่ใช่เหตุผลที่ดีในการเพิ่มความซับซ้อนตอนนี้

เมื่อใดคุณควรใช้ EKS เทียบกับ ECS?

**ใช้ ECS** ถ้า:

- คุณอยู่บน AWS เป็นหลักและต้องการประสบการณ์ที่เรียบง่ายกว่าและ AWS-native มากกว่า
- ทีมของคุณไม่มีความเชี่ยวชาญ Kubernetes อยู่แล้ว
- คุณต้องการ operational overhead น้อยลง

**ใช้ EKS** ถ้า:

- คุณต้องการ Kubernetes-specific features (Custom Resource Definitions, Helm charts, Kubernetes ecosystem)
- ทีมของคุณรู้จัก Kubernetes อยู่แล้ว
- คุณกำลังรัน hybrid environment (บางส่วน on-premises บางส่วนใน AWS) และต้องการ orchestration layer ที่สอดคล้องกัน
- workload ของคุณมีความต้องการที่ตรงกับความขยายได้ของ Kubernetes

**Container Networking: Ephemeral IPs และ Service Discovery**

สิ่งหนึ่งที่ทำให้ทีมประหลาดใจเมื่อย้ายไป containers: IP address ของ container เปลี่ยนทุกครั้งที่มัน restart

ในโลก EC2, instances มี private IPs ที่ค่อนข้างเสถียร คุณสามารถ (แม้คุณไม่ควร) hardcode พวกมันใน configuration files Services รู้จักกันด้วย IP

ในโลก container แต่ละ task ใน ECS ได้ IP จาก VPC subnet เมื่อมันเริ่ม เมื่อมันหยุดและ task ใหม่เริ่ม (เป็นส่วนหนึ่งของ deployment หรือ restart) task ใหม่นั้นได้ IP ที่แตกต่าง

"เกิดอะไรขึ้นเมื่อ service ถูก hardcode ให้เรียก `10.0.1.45` และ container นั้นถูกแทนที่ด้วย `10.0.1.82`?" Priya ถาม "service ที่เรียกเริ่มเข้าถึงความว่างเปล่า"

นี่คือเหตุผลที่ service discovery สำคัญใน container environments ECS + Application Load Balancer จัดการสิ่งนี้โดยอัตโนมัติ: DNS name ของ ALB เสถียร; ECS register tasks ที่แข็งแรงกับ target group; ALB route ไปยัง tasks ที่แข็งแรงในปัจจุบัน service ที่เรียกคุยกับ ALB DNS name ไม่ใช่ container IPs แต่ละตัว

สำหรับ internal service-to-service communication (ไม่ใช่ user-facing) **AWS Cloud Map** ให้ service discovery: แต่ละ ECS service register กับ Cloud Map ซึ่งให้ DNS name ที่เสถียร order service เรียก `http://notification.nimbus.local:8080` และ Cloud Map resolve มันเป็น tasks ใดก็ตามใน notification service ที่แข็งแรงในปัจจุบัน

"ดังนั้น containers คุยกันผ่าน DNS names ไม่ใช่ IPs?" Leo ยืนยัน

"ถูกต้อง IP เป็น ephemeral DNS name คือสัญญา"

**Secrets Injection: ไม่มี Secrets ใน Environment Variables**

EC2 deployment ดั้งเดิมมีปัญหาที่ Priya เตือนมาหลายเดือน: secrets (database password, API keys, SES credentials) ถูกเก็บใน environment variables บน EC2 instance ตั้งค่าผ่าน deployment script

Environment variables เข้าถึงได้โดย process ใดๆ ที่ทำงานบน instance พวกมันปรากฏใน debugging tools ใน crash reports บางอัน และในรายการ process พวกมันยังมองเห็นได้ใน CloudWatch ถ้าคุณ log พวกมัน (ซึ่ง development tools บางตัวทำโดยค่าเริ่มต้น)

Containers ไม่แก้ปัญหานี้โดยอัตโนมัติ — คุณยังสามารถส่ง secrets เป็น environment variables ใน ECS task definition และ ECS task definitions ถูกเก็บใน AWS console มองเห็นได้โดยใครก็ตามที่มี ECS access

pattern ที่ถูกต้อง: **AWS Secrets Manager + ECS task definition integration**

แทนที่จะเก็บ database password ใน task definition:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS ดึง secret จาก Secrets Manager ตอน task launch และ inject มันเข้าไปใน container เป็น environment variable ค่า secret ไม่เคยถูกเก็บใน task definition — มีแค่ ARN ของ Secrets Manager secret container รับค่าตอน runtime Secrets Manager สามารถ rotate ค่าโดยไม่เปลี่ยน task definition

"และถ้ามีคนอ่าน task definition?" Priya ถาม "พวกเขาจะเห็น Secrets Manager ARN แต่ไม่ใช่ค่า"

"และหากไม่มี IAM permissions ที่ถูกต้อง" Leo ยืนยัน "พวกเขาก็ดึงค่าจาก Secrets Manager ไม่ได้เช่นกัน"

"นั่นคือการออกแบบ" Priya พูด "execution role ของ task มีสิทธิ์อ่าน secret เฉพาะนั้น ไม่มีอย่างอื่น การบุกรุก task definition ให้คุณ ARN ไม่ใช่ password"

"เราควรใช้ตัวไหน?" Maya ถาม "และทำไมไม่ใช้ Kubernetes? มันอยู่ในทุก job description ทุก conference talk"

"ECS" Priya พูดทันที "เราไม่มีความเชี่ยวชาญ Kubernetes ECS ทำทุกอย่างที่เราต้องการ การเพิ่ม Kubernetes ตอนนี้จะเป็นการเพิ่ม operational complexity โดยไม่มีประโยชน์ในทางปฏิบัติ"

Soo-Jin ผู้เคยรัน Kubernetes clusters ที่บริษัทเก่า พยักหน้า "ฉันเคยถือ pager นั้น คุณไม่อยากได้มันจนกว่าคุณจะต้องการมัน"

"เราสามารถ migrate ไป EKS ในภายหลังได้เสมอถ้าเราเติบโตเกิน ECS" Leo เสริม

นี่คือคำตอบระดับ senior ที่ถูกต้อง: เลือกเครื่องมือที่เรียบง่ายกว่าที่เข้ากับความต้องการในปัจจุบันของคุณ

**ECR: การรักษาความปลอดภัย Images ของคุณ**

"แล้วถ้ามีคนพยายามเจาะเข้ามาผ่าน base image ที่มีช่องโหว่ล่ะ?" Priya ถาม "มีคนคว้า image เก่าที่มี CVE ที่รู้จักและใช้มันเพื่อตั้งหลักใน application container?"

เป็นคำถามที่ถูกต้องที่ควรถามก่อน deploy container ใดๆ ใน production

**Amazon ECR (Elastic Container Registry)** เก็บ Docker images ของคุณและสามารถ scan พวกมันสำหรับช่องโหว่ที่รู้จักก่อน deployment ECR image scanning ตรวจสอบ image เทียบกับฐานข้อมูลของ CVEs ที่รู้จัก (Common Vulnerabilities and Exposures) และ flag ปัญหาตามความรุนแรง

policy ที่ Priya เขียน: ไม่มี image ที่มี CVE ความรุนแรง CRITICAL จะถูก deploy ไป production CI/CD pipeline จะตรวจสอบผล scan ก่อนอัปเดต ECS service ถ้าพบช่องโหว่ critical, pipeline จะล้มเหลวและแจ้งเตือนทีม

"นั่นไม่ใช่ความหวาดระแวง" Priya พูด "นั่นแค่การมีการตรวจสอบก่อนคุณ deploy"

**Containers เปลี่ยน Deployments อย่างไร**

ก่อนมี containers การ deploy เวอร์ชันใหม่ของ Nimbus API หมายถึง:

1. SSH เข้าแต่ละ EC2 instance
2. ดึง code ล่าสุดจาก Git
3. ติดตั้ง/อัปเดต dependencies
4. restart application process
5. ยืนยัน health
6. ไปยัง instance ถัดไป

นี่ผิดพลาดได้ง่ายและช้า มันต้องการการประสานงาน ถ้าขั้นตอน 3 ล้มเหลวบน instance 4 คุณมี deployment ที่ปนเปกัน โดยบาง instances รันเวอร์ชันเก่าและบางตัวรันเวอร์ชันใหม่ไม่ได้

ด้วย ECS และ containers:

1. สร้าง Docker image ใหม่ (อัตโนมัติใน CI/CD pipeline)
2. push ไปยัง ECR
3. อัปเดต ECS service ให้ใช้ image version ใหม่

ECS จัดการ rolling deployment: เริ่ม tasks ใหม่ด้วย image ใหม่ รอให้พวกมันแข็งแรง แล้วหยุด tasks เก่า Zero-downtime deployment อัตโนมัติ

ถ้าเวอร์ชันใหม่ล้มเหลว health checks, ECS หยุด deployment และเวอร์ชันเก่ายังคงให้บริการ traffic

**Config ขั้นต่ำของ Deployment: Health Checks**

ความปลอดภัยทั้งหมดของ container deployments ขึ้นอยู่กับ health checks ที่ทำงานจริง

ECS ใช้ health checks สองประเภท:

**Container-level health check**: กำหนดใน Dockerfile หรือ task definition ทำงานภายใน container เพื่อยืนยันว่าแอปพลิเคชันตอบสนอง

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**ALB target group health check**: load balancer ส่ง HTTP requests ไปยัง health endpoint เป็นระยะ Tasks ที่ล้มเหลว health check ถูกนำออกจาก target group

ถ้าทั้งสอง health check ไม่ได้ตั้งค่าอย่างถูกต้อง ECS ถือว่าทุก task แข็งแรง — และจะ deploy image ที่เสียโดยไม่หยุด นี่คือความผิดพลาด container deployment ที่พบบ่อยที่สุด

"health check endpoint อาจรั่วข้อมูลภายในได้ไหม?" Priya ถาม

health check endpoint ที่ `/health` คืนค่าแค่: `{"status": "ok"}` ไม่มีหมายเลขเวอร์ชัน ไม่มี dependency states ไม่มี internal configuration ข้อมูลใดๆ ใน health response อาจมีประโยชน์ต่อคนที่กำลัง map แอปพลิเคชัน เก็บ health endpoints ให้น้อยที่สุด

สำหรับ internal health status ที่ละเอียด (database connectivity, dependency checks) ใช้ `/health/detail` endpoint ที่ authenticate แยกต่างหาก — เข้าถึงได้เฉพาะจากภายใน VPC

**Structured Logging: หน้าต่างเดียวสู่ Container ที่กำลังทำงาน**

บน EC2 บางอย่างผิดพลาดและคุณ SSH เข้า คุณ tail log file คุณดู process table คุณตรวจสอบ disk usage คุณสำรวจไปรอบๆ

ใน container ไม่มี SSH container เป็น ephemeral — มันอาจทำงานบน host ใดก็ได้ใน cluster และ ECS จะแทนที่มันโดยไม่เตือนถ้ามันล้มเหลว health checks เมื่อถึงเวลาที่คุณคิดจะ SSH เข้า container ที่คุณต้องการตรวจสอบอาจไม่มีอยู่อีกต่อไป

Logs ไม่ใช่ความสะดวกในการ debug ใน containerized environments พวกมันคือหลักฐานเดียวว่ามีบางอย่างเกิดขึ้น

"แล้วถ้า container ล้มเหลวอย่างเงียบๆ และเราไม่มี logs ล่ะ?" Priya ถามในระหว่างการ review สถาปัตยกรรม containers "เราอาจมี task ออกด้วย code 1 และไม่เคยรู้สาเหตุถ้า logs ไม่ถูกจับก่อนมันสิ้นสุด"

นี่ไม่ใช่สมมติฐาน มันเกิดขึ้นใน container deployments แรกๆ อย่างสม่ำเสมอ

pattern ที่ถูกต้อง: ตั้งค่าทุก container ให้ส่ง structured logs ไปยัง **Amazon CloudWatch Logs** โดยใช้ `awslogs` log driver ECS จัดการการส่งโดยอัตโนมัติ — ไม่มี log agent ให้ติดตั้ง ไม่ต้องการ sidecar container

ใน task definition:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

ทุกบรรทัดที่เขียนไปยัง stdout หรือ stderr ภายใน container ถูกจับและส่งไปยัง log group `/ecs/nimbus-api` จัดระเบียบตาม task ID ECS สร้าง log stream ใหม่สำหรับแต่ละ task ดังนั้นคุณสามารถหา logs สำหรับ container เฉพาะที่ล้มเหลว — แม้หลังจากมันถูกแทนที่

task execution role ต้องการสิทธิ์เขียนไปยัง CloudWatch Logs หากไม่มี log driver ล้มเหลวอย่างเงียบๆ และ log output ทั้งหมดสูญหาย

**Structured logs เทียบกับ plain text**: Plain text logs ("Order 7741 placed") ต้องการ grep Structured JSON logs (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) สามารถ query ด้วย CloudWatch Logs Insights โดยใช้ syntax ที่คล้าย SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

query นั้นทำงานเทียบกับ log group โดยตรง ไม่มีฐานข้อมูล ไม่มี data pipeline ไม่มี ETL job คำตอบอยู่ตรงนั้นในไม่กี่วินาที

สิ่งนี้ไม่ทดแทน analytics data lake ที่เราจะสร้างในบทที่ 26 มันตอบคำถามเชิงปฏิบัติการ — "มีออร์เดอร์กี่ออร์เดอร์จากร้านอาหาร 47 ใน 30 นาทีที่ผ่านมา?" — ในระหว่างเหตุการณ์ เมื่อคุณไม่มีเวลารัน Athena query

**CloudWatch Container Insights**

**Container Insights** เป็น feature ของ CloudWatch ที่เก็บและรวบรวม container-level metrics — CPU, memory, network I/O, storage I/O — ต่อ ECS cluster, service และ task แทนที่จะเป็น EC2-level metrics (host เป็นอย่างไร?) คุณเห็น task-level metrics (ECS service เฉพาะนี้เป็นอย่างไร?)

เปิดมันด้วยการตั้งค่าหนึ่งบน ECS cluster:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

หลังจากเปิด:

- คุณเห็น dashboard ต่อ service: task count, CPU utilization, memory utilization
- คุณสามารถ alarm บน task-level CPU (แทน EC2 host CPU ซึ่งเป็นสัญญาณที่หยาบกว่ามาก)
- คุณสามารถสัมพันธ์ memory spikes กับ log events — memory ของ task ไต่ขึ้นเป็น 95% เวลา 14:22; logs แสดง spike ใน inbound requests จากการ import เมนูของร้านอาหาร 47 เวลา 14:21 พอดี

"นั่นมีค่าใช้จ่ายต่อเดือนเท่าไร?" Tom ถาม

Container Insights เรียกเก็บเงินสำหรับ custom metrics และ log storage ที่มันสร้าง ที่ scale ของ Nimbus (สาม services, 3-6 tasks ต่อตัว) นี่ประมาณ $12/เดือน — การแลกเปลี่ยนที่สมเหตุสมผลสำหรับ task-level operational visibility

Leo เปิดมันภายในวันนั้น

ครั้งแรกที่ task ล้มเหลว health check และถูกแทนที่โดย ECS, Container Insights dashboard จับเหตุการณ์โดยอัตโนมัติ: task ID, start time, failure time, exit code CloudWatch log stream สำหรับ task นั้นเก็บ 40 บรรทัดสุดท้ายของ output ก่อนสิ้นสุด — ซึ่งแสดง uncaught exception ที่ trigger โดย menu JSON ที่ผิดรูปแบบจากพันธมิตรร้านอาหารใหม่

หากไม่มี Container Insights และ structured logging: spike ลึกลับใน error rates การสืบสวนต้องการ SSH ไปยัง host ที่ไม่รัน task ที่ล้มเหลวอีกต่อไป 45 นาทีของการเดา

ด้วยพวกมัน: link ของ log stream ใน CloudWatch dashboard, exception ที่แน่นอน, restaurant ID, field ที่ผิด — ในเวลาต่ำกว่าห้านาที

"ไม่ต้อง SSH" Leo พูดขณะ review post-mortem "ไม่มี downtime ในการสืบสวน logs ทำงานให้"

"logs ทำงานให้ก็ต่อเมื่อ" Priya พูด "คุณตั้งค่าพวกมันให้ถูกจับ"


**เมื่อ Containers เป็นทางเลือกที่ผิด**

"เดี๋ยว — แต่*ทำไม*เราถึงไม่ containerize ทุกอย่าง?" Maya ถาม "คุณเพิ่งโน้มน้าวฉันว่า containers แก้ปัญหา configuration drift ทั้งหมด ทำไมไม่รันทุก service เป็น container?"

เป็นคำถามเดียวกับที่เธอถามเกี่ยวกับ Lambda คำตอบคล้ายกัน

Containers เพิ่มความต้องการเชิงปฏิบัติการ: คุณต้องการ container registry (ECR), CI/CD pipeline ที่สร้างและ push images, orchestrator (ECS), monitoring ที่ตั้งค่าสำหรับ task-level แทนที่จะเป็น instance-level visibility และทีมที่เข้าใจ Docker และ image versioning

สำหรับ service ที่ทำงานได้ดีอยู่แล้วบน EC2 เสถียร และไม่ทุกข์ทรมานจาก configuration drift ต้นทุนของการ containerize มันอาจเกินประโยชน์

กรณีเฉพาะที่ containers เป็นทางเลือกที่ผิด:

**Stateful services ที่ไม่ได้สร้างมาเพื่อ container mobility**: Databases ใน containers ต้องการการจัดการ persistent volume อย่างระมัดระวัง ทีมส่วนใหญ่ที่รัน databases ใน containers ในที่สุดย้ายพวกมันกลับไปยัง managed services (RDS, ElastiCache) หลังจากเจอความซับซ้อนนี้

**Services ที่มีความต้องการ hardware เฉพาะ**: GPU workloads, การตั้งค่า network interface เฉพาะ หรือ FPGA-based processing ต้องการ EC2 instances ที่มี hardware เฉพาะ Containers ไม่เปลี่ยนสิ่งนี้ — คุณยังคงใช้ EC2 launch type แค่มี containers อยู่บนนั้น และ container abstraction เพิ่มความซับซ้อนโดยไม่มีประโยชน์

**Scripts และ jobs ที่ง่ายมาก**: Python script 40 บรรทัดที่ทำงานสัปดาห์ละครั้งและไม่มีปัญหา dependency drift การเพิ่ม Docker, ECR, ECS task definitions และ CI/CD pipeline สำหรับสิ่งนี้ไม่ได้สัดส่วน Lambda ง่ายกว่า EC2 cron job ธรรมดาอาจง่ายกว่าด้วยซ้ำ

"หลักการ" Leo พูด "เหมือนเดิมเสมอ: จับคู่เครื่องมือกับปัญหา Containers แก้ configuration drift และความสม่ำเสมอของ deployment ถ้าคุณไม่มีปัญหานั้น คุณไม่ต้องการ containers"

## AWS Batch: Containers สำหรับงานขนาดใหญ่

ECS และ EKS ถูกออกแบบสำหรับ long-running services — แอปพลิเคชันที่ทำงานต่อเนื่อง รับ requests และ scale กับ traffic แต่ workloads บางอย่างแตกต่าง: พวกมันทำงานเป็นระยะเวลาที่กำหนด ประมวลผล dataset ที่กำหนด แล้วหยุด การสร้าง invoices สิ้นเดือนสำหรับร้านอาหารหลายร้อยร้าน การรัน machine learning training job การประมวลผล nightly analytics export

สำหรับ workloads เหล่านี้ คุณไม่ต้องการ service — คุณต้องการ job

**AWS Batch** เป็น fully managed service ที่รัน batch computing jobs ที่ scale ใดๆ คุณกำหนด job ของคุณเป็น Docker container (รูปแบบ container เดียวกับที่ ECS ใช้) และ Batch จัดการที่เหลือ: provisioning EC2 หรือ Fargate compute, scheduling jobs เข้า queues, scaling capacity ขึ้นเมื่อ jobs มาถึงและกลับเป็นศูนย์เมื่อพวกมันเสร็จ

แนวคิดหลัก:

- **Job definition:** Docker container, resource requirements (vCPU, memory) และคำสั่งที่จะรัน
- **Job queue:** ที่ที่ jobs ที่ส่งมารอก่อนทำงาน; แต่ละ queue สัมพันธ์กับหนึ่งหรือมากกว่า compute environments
- **Compute environment:** EC2 หรือ Fargate capacity พื้นฐาน สามารถใช้ Spot Instances สำหรับการประหยัดต้นทุนสูงถึง 90% — Batch จัดการการ interruptions และ retries โดยอัตโนมัติ

"เดี๋ยว — แต่*ทำไม*เราถึงใช้ Batch แทนที่จะแค่รัน ECS task?" Maya ถาม

"เพราะ ECS service เปิดอยู่ตลอด" Leo พูด "มันรอ requests Batch job ทำงาน เสร็จ และ Batch scale compute กลับเป็นศูนย์ คุณไม่จ่ายอะไรระหว่างการรัน"

Tom เงยหน้าจากหน้า pricing "แล้ว Spot Instances ล่ะ?"

"Batch สามารถรันบน Spot ถ้า Spot Instance ถูก reclaim กลาง job, Batch retry อัตโนมัติ สำหรับ invoice job 45 นาที นั่นไม่เป็นไร"

**เทียบกับ ECS/EKS:** ECS/EKS รัน services — เปิดตลอด ขับเคลื่อนด้วย request Batch รัน jobs — ระยะเวลาจำกัด ขับเคลื่อนด้วยข้อมูล scale เป็นศูนย์เมื่อ idle

**เทียบกับ Lambda:** Lambda มี timeout 15 นาที Batch jobs สามารถทำงานหลายชั่วโมงหรือหลายวัน

บริบท Nimbus: nightly invoice generation job ใช้เวลา 45 นาทีสำหรับพันธมิตรร้านอาหารหลายร้อยร้าน Lambda timeout ที่ 15 นาที ECS service ที่เปิดตลอดสิ้นเปลืองเงิน 23 ชั่วโมงต่อวัน Batch รัน job บน Spot Instances เสร็จใน 38 นาที ค่าใช้จ่าย $1.20 และปิดตัวลง

"นั่นถูกกว่ากาแฟที่ผมซื้อขณะรอ script เก่าเสร็จ" Leo พูด

"และไม่มี EC2 ให้จัดการ" Priya เสริม "Batch จัดหามัน รันมัน terminate มัน"

## จุดแข็งและข้อจำกัด

**Containers**:

- ขจัดความไม่สอดคล้องของ environment ("ทำงานบนเครื่องของฉัน")
- เปิดให้มี deployments ที่เร็วและเชื่อถือได้
- Immutable — image เดียวกันรันเหมือนกันทุกที่
- มีประสิทธิภาพ — เบากว่า VMs, startup เร็วกว่า

**ECS**:

- ง่ายกว่า Kubernetes สำหรับ AWS-centric workloads
- tight AWS integration (IAM, ALB, CloudWatch, Secrets Manager)
- ตัวเลือก Fargate ขจัด EC2 management ทั้งหมด

**EKS**:

- ความเข้ากันได้ Kubernetes เต็มรูปแบบ — ใช้ ecosystem ทั้งหมด
- ดีกว่าสำหรับ hybrid environments หรือทีมที่มีความเชี่ยวชาญ Kubernetes
- ซับซ้อนกว่าในการตั้งค่าและดำเนินการมากกว่า ECS

**จุดที่ซับซ้อน**:

- container images ต้องถูกสร้างและ version — ต้องการ CI/CD pipeline
- การ debug containers ต้องการ tooling ที่แตกต่างจากการ debug processes แบบดั้งเดิม
- Stateful containers (databases ใน containers) ต้องการการตั้งค่า persistent storage อย่างระมัดระวัง
- Networking ระหว่าง containers (service-to-service communication) ต้องการความเข้าใจแนวคิด container networking

## สรุป

Lambda ทำให้ idle compute ฟรี Containers ทำให้ deployment กำหนดได้แน่นอน ด้วยกัน พวกมันแก้สองในสาเหตุที่พบบ่อยที่สุดของความเจ็บปวดเชิงปฏิบัติการสำหรับทีมวิศวกรรมที่กำลังเติบโต

- **Containers** บรรจุ application code, runtime และ dependencies ด้วยกัน — รันเหมือนกันทุกที่
- **Docker** คือ container technology มาตรฐาน Images เป็น blueprints; containers เป็น running instances
- **ECR (Elastic Container Registry)** คือ managed Docker registry ของ AWS — เก็บ, version และ scan images ของคุณที่นี่ เปิด image scanning เพื่อจับ CVEs ก่อน deployment
- **ECS (Elastic Container Service)** orchestrate containers คุณกำหนด tasks และ services; ECS จัดการ placement และ lifecycle
- **Fargate** คือ serverless compute สำหรับ containers — ไม่มี EC2 instances ให้จัดการ มักถูกกว่า EC2 launch type ที่ scale เล็กเนื่องจากการขจัด EC2 overhead ที่ scale ใหญ่กว่าด้วย task bin-packing อย่างระมัดระวัง EC2 launch type อาจคุ้มค่ากว่า
- **EKS (Elastic Kubernetes Service)** คือ managed Kubernetes — สำหรับทีมที่ต้องการ Kubernetes features หรือความเข้ากันได้
- **Secrets Manager integration**: inject secrets เข้าไปใน containers ตอน launch ผ่าน task definition — อย่าเก็บค่า secret ใน environment variables หรือ task definitions โดยตรง
- **Service discovery**: container IPs เป็น ephemeral ใช้ ALB DNS names หรือ Cloud Map สำหรับ service addressing ที่เสถียร
- เลือก ECS สำหรับความเรียบง่ายบน AWS; เลือก EKS สำหรับความเข้ากันได้กับ Kubernetes ecosystem

## เคล็ดลับการสอบ

*SAA-C03 Domain: Design Resilient Architectures (Domain 2, Task 2.1)*

- **สัญญาณ ECS vs EKS**: scenarios ข้อสอบที่กล่าวถึง "Kubernetes," "Helm," "existing Kubernetes expertise" หรือ "multi-cloud container orchestration" → EKS ทุกอย่างอื่น → ECS
- **Fargate vs EC2 launch type**: "ไม่อยากจัดการ EC2 instances สำหรับ containers," "serverless containers," "no infrastructure management" → Fargate "ต้องการ instance types เฉพาะ," "GPU workloads," "fine-grained instance control" → EC2 launch type
- **Task role เทียบกับ task execution role** — ตัวแยกแยะข้อสอบจริง **task execution role** ถูกใช้โดย ECS *agent* ในนามของ task ก่อนและรอบ code ของคุณ: ดึง image จาก ECR, ดึง secrets จาก Secrets Manager, เขียน logs ไปยัง CloudWatch **task role** คือสิ่งที่ *application code ของคุณภายใน container* ใช้เรียก AWS services: อ่านจาก S3, เขียนไปยัง DynamoDB — เหมือน EC2 instance roles แต่ต่อ task ดังนั้นแต่ละ task มีสิทธิ์ต่างกันได้ "Container ต้องอ่านจาก S3" → **task role** (แนบใน task definition) "Task ดึง image ไม่ได้ / ดึง secret ไม่ได้" → **execution role** ขาดสิทธิ์
- **Fargate Spot**: รัน fault-tolerant containers บน spare capacity ลดได้สูงถึง ~70% พร้อมคำเตือน interruption สองนาที — เทียบเท่ากับ EC2 Spot ของ Fargate ตั้งค่าผ่าน capacity providers trigger ข้อสอบ: "รัน interruption-tolerant containers ที่ต้นทุนต่ำที่สุดโดยไม่จัดการ instances" → Fargate Spot
- **ECR image scanning**: ECR สามารถ scan container images สำหรับช่องโหว่ที่รู้จัก (CVEs) สัญญาณข้อสอบ: "scan containers สำหรับช่องโหว่ความปลอดภัย" → ECR image scanning
- **Blue/green deployments**: ECS รองรับ blue/green deployments ผ่าน CodeDeploy integration Zero-downtime deployment พร้อม automatic rollback pattern ข้อสอบ: "deploy โดยไม่มี downtime พร้อม automatic rollback" → ECS + CodeDeploy blue/green
- **Secrets Manager integration**: สัญญาณข้อสอบ: "inject secrets เข้าไปใน containers โดยไม่เก็บค่าใน task definitions" → ใช้ field `secrets` ใน task definition ที่อ้างอิง Secrets Manager ARN task execution role ต้องการสิทธิ์ `secretsmanager:GetSecretValue`
- **ECS Service Auto Scaling**: scale จำนวน tasks ตาม CPU, memory หรือ custom CloudWatch metrics ทำงานกับ ALB เพื่อ route traffic ไปยังจำนวน tasks ที่ทำงานที่ถูกต้อง
- **AWS Batch:** managed batch compute สำหรับ Docker containers Job queue → compute environment (EC2 หรือ Fargate รองรับ Spot) ใช้เมื่อ: Lambda timeout สั้นเกินไป, ECS service สิ้นเปลืองสำหรับ jobs ที่มีจำกัด trigger ข้อสอบ: "large-scale batch processing" หรือ "job ที่ทำงานหลายชั่วโมง" → AWS Batch

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — ทบทวน**

อธิบายความแตกต่างระหว่าง Docker image และ Docker container อธิบายความแตกต่างระหว่าง ECS และ ECR

*(คำใบ้: Image เป็นต่อ container เหมือนสูตรอาหารเป็นต่อจานที่ปรุงสำเร็จ ECR เก็บ images; ECS รันพวกมัน)*

**แบบฝึกหัดที่ 2 — สถานการณ์ SAA-C03**

*สถานการณ์*: บริษัทหนึ่งมีแอปพลิเคชัน microservices ที่ปัจจุบันรันบน EC2 instances ที่จัดการด้วยตนเอง ทีมประสบปัญหากับ deployments ที่ไม่สอดคล้อง — EC2 instances ต่างกันมี library versions ต่างกัน ทำให้เกิด bugs ที่ทำซ้ำได้ยาก พวกเขาต้องการทำให้ deployments เป็นมาตรฐานในขณะที่ลด operational overhead สำหรับการจัดการเซิร์ฟเวอร์พื้นฐาน ทีมไม่มีประสบการณ์ Kubernetes

โซลูชันใดตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) Containerize แอปพลิเคชันด้วย Docker; ใช้ Amazon ECS กับ Fargate launch type  
B) Deploy บน EC2 กับ AWS Systems Manager Patch Manager เพื่อให้ instances สอดคล้องกัน  
C) Containerize แอปพลิเคชันด้วย Docker; ใช้ Amazon EKS กับ self-managed node groups  
D) ใช้ AWS Elastic Beanstalk เพื่อจัดการ deployments และ instance configuration โดยอัตโนมัติ

**คำใบ้ 1**: Containers แก้ปัญหา "environment ที่ไม่สอดคล้อง" โดยตรง ตัวเลือกใดใช้ containers?

**คำใบ้ 2**: "ลด operational overhead สำหรับการจัดการเซิร์ฟเวอร์" → Fargate (ไม่มี EC2 management) เทียบกับ self-managed nodes (ยังจัดการ EC2)

**คำใบ้ 3**: "ไม่มีประสบการณ์ Kubernetes" → EKS เป็น operational complexity มากกว่า ECS

**คำตอบ**: A

**คำอธิบาย**: การ containerize ด้วย Docker ทำให้แน่ใจว่าทุก deployment ใช้ image เดียวกันกับ dependencies เดียวกัน — ขจัด configuration drift ECS กับ Fargate หมายถึงไม่มี EC2 instances ให้จัดการ ทีมโฟกัสที่ application code และ container definitions ไม่ใช่การบำรุงรักษาเซิร์ฟเวอร์ ECS (ไม่ใช่ EKS) เหมาะสมสำหรับทีมที่ไม่มีประสบการณ์ Kubernetes

**ทำไมไม่ใช่ B?** Patch Manager ทำให้ EC2 instances อัปเดตแต่ไม่แก้ความไม่สอดคล้องของ library version ระหว่างแอปพลิเคชัน ปัญหาพื้นฐาน (code environments ต่างกันบน instances ต่างกัน) ยังคงอยู่

**ทำไมไม่ใช่ C?** EKS กับ self-managed node groups ต้องการการจัดการ EC2 instances *และ* การเรียนรู้ Kubernetes ไม่มีตัวใดสอดคล้องกับความต้องการ

**ทำไมไม่ใช่ D?** Elastic Beanstalk จัดการ application deployment บน EC2 แต่ไม่แก้ความไม่สอดคล้องของ environment พื้นฐานเว้นแต่จะใช้ containers Beanstalk ไม่ใช้ Docker images โดยค่าเริ่มต้น (แม้ว่าจะตั้งค่าให้ใช้ได้)

*SAA-C03 Domain: Design Resilient Architectures — Task 2.1*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ทางเลือก)*

Nimbus กำลังแบ่ง monolithic API เป็นสาม microservices: order service, menu service และ notification service แต่ละ service มีความต้องการ scaling ต่างกัน (order service scale กับ traffic; menu service ส่วนใหญ่ read-only และเสถียร; notification service มีการระเบิดที่พุ่งเป็นจุด)

ออกแบบ ECS architecture สำหรับสาม services เหล่านี้ คุณจะจัดการ service-to-service communication อย่างไร? คุณจะใช้ ECS cluster หนึ่งหรือสาม? คุณจะตั้งค่า Auto Scaling แตกต่างกันสำหรับแต่ละ service อย่างไร?

พิจารณา: menu service เน้นการอ่านและสามารถให้บริการข้อมูลที่เก่า 60 วินาทีได้ — คุณจะเพิ่ม caching ไว้หน้ามันไหม? notification service burst-scale หนักในเย็นวันศุกร์ — คุณจะตั้ง Fargate Min capacity เป็น 1 และ Max เป็น 20 ไหม? เกิดอะไรขึ้นกับ notifications ที่กำลังดำเนินอยู่ระหว่างเหตุการณ์ scale-down?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึก microservices architecture บน ECS)*

## ฉากหลังเครดิต

การ deploy container ครั้งแรกไร้ที่ติ

เวอร์ชันใหม่ของ API: zero downtime ECS roll out มัน health checks ผ่าน tasks เก่า drain tasks ใหม่เข้ามาแทนที่ Leo เฝ้าดู task status ใน console ด้วยบางอย่างที่ใกล้เคียงกับความไม่เชื่อ

"มันแค่ทำงาน" เขาพูด

"สัปดาห์ก่อนคุณพูดสิ่งเดียวกันเกี่ยวกับ manual SSH deploy ก่อนที่มันจะล้มเหลวบน instance สาม" Priya พูด

"ผม deploy มันแล้ว — โอ้" Leo หยุด "ผม deploy โดยไม่ติด tag image version ขอแก้ตรงนั้น"

"นั่นคือประเด็น" Priya พูด "Image versioning คือวิธีที่คุณติดตามว่าอะไรกำลังทำงาน"

"คุณรู้ได้อย่างไรว่าเวอร์ชันใดอยู่ใน production ตอนนี้?" Maya ถาม

Leo เปิด ECS console ภายใต้ running task, image ถูกแสดง: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3` Version 1.0.3 Build ที่ 14:22 UTC Deploy ที่ 14:31 UTC

"บน EC2 setup เก่า" Leo พูด "ผมจะต้อง SSH เข้า instance และรัน `pip show` เพื่อดูว่า dependency แต่ละตัวเวอร์ชันใดถูกติดตั้ง และมันอาจต่างกันบน instances อื่น"

"แล้วตอนนี้?"

"tag บน image บอกผมเป๊ะว่าอะไรกำลังทำงาน ประวัติ ECR scan บอกผมว่ามันถูก scan หรือไม่ ประวัติ ECS deployment บอกผมว่ามันถูก deploy เมื่อไรและเวอร์ชันก่อนหน้าคืออะไร"

"ไม่ต้อง SSH ไม่มี downtime ไม่ต้อง 'รอให้มัน restart'"

"image คือ deployment artifact" Priya พูด "environment เป็น immutable กระบวนการ deployment เป็น declarative นี่คือวิธีที่ซอฟต์แวร์ควรถูกขนส่ง"

Leo จ้องมอง console อีกครู่หนึ่ง

"ผมใช้เวลาสามปีประสานงาน EC2 deployments" เขาพูด "ประสานงาน SSH scripts เขียน deployment runbooks"

"คุณกำลังแก้ปัญหา" Priya พูด "ที่ containers แก้โดยการออกแบบ"

เขาไม่พูดอะไรหลังจากนั้น แต่ในเช้าวันรุ่งขึ้น เขาเริ่มเขียนเอกสารเกี่ยวกับกระบวนการ container build เพื่อไม่ให้ใครอื่นต้องใช้เวลาสามปีในการคิดออก

bug ของ instance สาม, หกสัปดาห์ของ drift ที่ไม่มีเอกสาร และปัญหาแบบเดียวกันที่พวกเขายังไม่ได้จับ — ทั้งหมดมีสาเหตุรากเดียว ไม่ใช่ผู้ไม่หวังดี ไม่ใช่ hardware failure แค่เซิร์ฟเวอร์ที่ถูกปฏิบัติเหมือนสิ่งติดตั้งถาวรแทนที่จะเป็นหน่วยใช้แล้วทิ้ง

container คือคำตอบของสิ่งนั้น ไม่ใช่เพราะมันใหม่และน่าสนใจ แต่เพราะมันทำให้คำถามนั้นเป็นไปไม่ได้ที่จะถาม

ในบทต่อไป: แผนผังที่รันตัวเอง — และจำว่าหยุดอยู่ที่ไหน
