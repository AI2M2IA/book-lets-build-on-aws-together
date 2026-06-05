# บทที่ 27: จ่ายในสิ่งที่คุณต้องการ

Tom ตรวจสอบบิล AWS ทุกเดือนนับตั้งแต่ Nimbus เริ่มต้น ในปีแรก เขาเข้าใจประมาณ 60% ของสิ่งที่เห็น ตอนนี้เขาเข้าใจเกือบทุกอย่าง ยกเว้นส่วน EC2

ส่วน EC2 เป็นการผสมผสาน "On-Demand instances" ในประเภท instance ต่างๆ ทั้งหมดคิดราคาต่อชั่วโมง รวมกันเป็น $2,340 ต่อเดือน

"ผมรู้ว่าเราต้องการ instances เหล่านี้" Tom พูด "แต่ผมไม่เข้าใจว่าทำไมเราถึงจ่ายราคาแบบ walk-in สำหรับทั้งหมด"

"ราคาแบบ walk-in?" Leo ถาม

"On-Demand pricing" Tom พูด "มันเหมือนการจองห้องโรงแรมในเช้าวันที่ต้องการ ความยืดหยุ่นสูงสุด ราคาสูงสุด"

"ทางเลือกคืออะไร?"

Tom ดึงหน้า EC2 pricing ขึ้นมา

"มีสี่ pricing models" เขาพูด "และเราใช้แค่หนึ่งอัน"

**การเปรียบเทียบกับโรงแรม**

EC2 pricing ใช้กับกลยุทธ์การจองห้องโรงแรมได้อย่างน่าแปลกใจ:

**On-Demand**: เดินไปที่ front desk โดยไม่มีการจอง คุณจ่ายราคาเต็ม rack rate แต่คุณสามารถ check out เมื่อใดก็ได้ เหมาะสำหรับการพักที่ไม่แน่นอน

**Reserved Instances/Savings Plans**: จองห้องล่วงหน้าทั้งปี คุณได้ส่วนลดมาก — 30-72% ลด — เพื่อแลกกับการให้สัญญาว่าจะใช้

**Spot Instances**: ประมูลห้องที่ไม่ได้ขายในราคาที่โรงแรมยินดีรับในขณะนั้น ลดได้ถึง 90% แต่โรงแรมสามารถขอให้คุณออกได้โดยแจ้งล่วงหน้า 2 นาทีหากต้องการห้องสำหรับลูกค้าที่จ่ายเต็มราคา

**Dedicated Hosts**: เช่าทั้งชั้นของโรงแรมเพื่อตัวเองเท่านั้น ไม่มีการแชร์กับแขกอื่น แพงกว่าอย่างมีนัยสำคัญ จำเป็นเมื่อ software licensing หรือกฎระเบียบด้านการปฏิบัติตามห้ามแชร์ physical host

แต่ละ model มีกรณีการใช้งาน ความผิดพลาดที่ Nimbus กำลังทำ: ใช้ On-Demand สำหรับทุกอย่าง รวมถึง workload ที่ทำงาน 24/7 และคาดเดาได้อย่างสมบูรณ์

**On-Demand Instances: ความยืดหยุ่นสูงสุด ต้นทุนสูงสุด**

**เมื่อควรใช้**:

- Workload ที่คาดเดาไม่ได้ (traffic spikes ที่คาดการณ์ไม่ได้)
- Development และ testing (เริ่มและหยุดบ่อย)
- Workload ระยะสั้น (รัน experiment หนึ่งสัปดาห์)
- การ deploy แรก (ก่อนที่คุณเข้าใจรูปแบบการใช้งาน)

**เมื่อไม่ควรใช้**:

- Production workload ที่คงที่ที่คุณรู้ว่าจะทำงานมากกว่าหนึ่งปี
- อะไรก็ตามที่มี baseline load ที่คาดเดาได้

Tom ระบุ On-Demand instances ของ Nimbus:

- Web API servers: EC2 instances 4 ตัว ทำงาน 24/7 เป็นเวลา 18 เดือน *Baseline ที่คาดเดาได้*
- Database proxy (RDS Proxy): ทำงานตลอดเวลา *Baseline ที่คาดเดาได้*
- VPN server: ทำงานตลอดเวลา *Baseline ที่คาดเดาได้*
- API servers เพิ่มเติมสำหรับ traffic spikes: คาดเดาไม่ได้ *On-Demand ถูกต้องที่นี่*

**Reserved Instances: การให้สัญญาหนึ่งปี**

**Reserved Instances (RIs)** คือข้อผูกมัดด้านการเรียกเก็บเงิน — คุณตกลงที่จะใช้ instance type เฉพาะใน region เฉพาะเป็นเวลา 1 หรือ 3 ปี เพื่อแลกกับ AWS คิดอัตรารายชั่วโมงที่ต่ำกว่า

**ระดับส่วนลด**:

- 1 ปี, No Upfront: ส่วนลดประมาณ 30-40% เทียบกับ On-Demand
- 1 ปี, Partial Upfront: ส่วนลดประมาณ 35-45% (จ่ายบางส่วนตอนนี้ น้อยลงต่อชั่วโมง)
- 1 ปี, All Upfront: ส่วนลดประมาณ 40-50% (จ่ายทั้งปีตอนนี้)
- 3 ปี, All Upfront: ส่วนลดประมาณ 55-72% (ส่วนลดสูงสุด ข้อผูกมัดสูงสุด)

**Standard vs Convertible RIs**:

- **Standard**: ล็อคกับ instance type และ region เฉพาะ สามารถขายบน Reserved Instance Marketplace ได้หากไม่ต้องการอีก
- **Convertible**: สามารถเปลี่ยน instance type, OS และ tenancy ได้ในช่วงระยะเวลาที่กำหนด ส่วนลดน้อยกว่า Standard (สูงสุด ~50% เทียบกับ 72%)

Tom คำนวณสำหรับ API servers 4 ตัว (r6g.large, On-Demand $0.252/ชั่วโมง):

- ค่าใช้จ่าย On-Demand รายปี: $0.252 × 24 × 365 × 4 = $8,820
- 1-year All Upfront RI (1 instance): ประมาณ $1,600 upfront
- 4 instances: ประมาณ $6,400 upfront = **ประหยัดได้ $2,420 ในปีแรก**

"เราสามารถประหยัด $2,420 ในปีแรกเพียงแค่ให้สัญญา" Tom พูด

"มันคือข้อผูกมัด" Maya พูด "จะเป็นอย่างไรถ้าเราต้องเปลี่ยน instance types?"

"เราใช้ Convertible RIs ถ้าคิดว่าอาจเปลี่ยน"

"จะเป็นอย่างไรถ้า AWS ออก instance type ที่ดีกว่า?"

"เราตรวจสอบเมื่อ RI หมดอายุ ถ้า type ใหม่ดีกว่า เราซื้อ RI ใหม่"

**Savings Plans: ข้อผูกมัดที่ยืดหยุ่น**

**Savings Plans** คือทางเลือกที่ใหม่และยืดหยุ่นกว่า Reserved Instances แทนที่จะให้สัญญากับ instance type เฉพาะ คุณให้สัญญากับ *จำนวน hourly spend* (เป็นดอลลาร์) เฉพาะ

**Compute Savings Plans**: ใช้กับ EC2 instance ใดก็ได้ โดยไม่คำนึงถึงประเภท ขนาด region หรือ OS ยืดหยุ่นที่สุด ส่วนลดสูงสุด 66%

**EC2 Instance Savings Plans**: ใช้กับ instance family เฉพาะใน region (เช่น "c6g instances ใน us-east-1") ยืดหยุ่นน้อยกว่า Compute แต่ส่วนลดสูงสุด 72% (เหมือน RI สูงสุด)

**SageMaker Savings Plans**: เฉพาะสำหรับ SageMaker ML training และ inference

สำหรับ Nimbus: Compute Savings Plans สำหรับ API servers พวกเขาให้สัญญา $1.50/ชั่วโมงของ EC2 spend instance type ใดก็ได้ ขนาดใดก็ได้ เมื่อพวกเขาขยาย fleet หรือเปลี่ยน instance types Savings Plan ยังคงใช้ได้

"นี่ดีกว่า Reserved Instances สำหรับเรา" Leo พูด "เรายังทดลองอยู่กับ instance types Compute Savings Plan ให้ส่วนลดโดยไม่ล็อคเราไว้กับ r6g โดยเฉพาะ"

**Spot Instances: ส่วนลด 90%**

**Spot Instances** ใช้ EC2 capacity สำรองของ AWS เมื่อ AWS มีเซิร์ฟเวอร์ที่ไม่ได้ใช้งาน คุณสามารถเช่าได้ในราคา 60-90% ต่ำกว่า On-Demand เมื่อ AWS ต้องการ capacity กลับ (สำหรับลูกค้า On-Demand หรือ Reserved) พวกเขาให้การแจ้งเตือน 2 นาทีและยุติ instance ของคุณ

ความเสี่ยงจากการหยุดชะงักคือลักษณะที่กำหนด Spot Instances เหมาะสำหรับ:

- **Fault-tolerant workloads**: ถ้า instance ถูกยุติระหว่าง task งานสามารถเริ่มต้นใหม่โดยไม่ทำอะไรเสียหาย
- **Stateless processing**: การปรับขนาดรูปภาพ การเข้ารหัสวิดีโอ batch analytics, ML training
- **Batch jobs ระยะสั้น**: การแจ้งเตือน 2 นาทีเพียงพอที่จะบันทึกสถานะและ checkpoint
- **Auto Scaling mixed fleets**: ใช้ Spot สำหรับส่วนใหญ่ของ ASG พร้อม On-Demand เป็น baseline

สำหรับ Nimbus: Spot Instances สมเหตุสมผลสำหรับ batch analytics jobs ที่รันทุกคืน (ประมวลผลข้อมูลคำสั่งซื้อของวันเป็นรายงาน aggregated) ถ้า Spot Instance ถูกยุติระหว่าง job งานล้มเหลวแต่เริ่มต้นใหม่ตั้งแต่ต้นบน instance ใหม่ ข้อมูลใน S3 ปลอดภัย

"การใช้ Spot สำหรับ nightly job ลดต้นทุนจาก $12/คืน เหลือ $2/คืน" Leo รายงาน

**Dedicated Hosts: ตัวเลือกด้านการปฏิบัติตามกฎระเบียบ**

Software licenses บางตัว (Oracle, Windows Server ในบางการกำหนดค่า) มีราคาต่อ physical socket หรือ core เมื่อคุณรัน software นี้บน shared host (ค่าเริ่มต้นสำหรับ EC2) คุณอาจจ่ายสำหรับ capacity ที่คุณไม่ได้ใช้

**Dedicated Hosts** ให้คุณเข้าถึง physical server ทั้งหมดสำหรับใช้งานของคุณ คุณสามารถนำ per-socket licenses ที่มีอยู่มาใช้ ไม่มี instances ของลูกค้า AWS รายอื่นทำงานบน hardware เดียวกัน

Dedicated Hosts แพงกว่า EC2 มาตรฐานอย่างมีนัยสำคัญ พวกเขาคือเครื่องมือด้านการปฏิบัติตามกฎระเบียบและ licensing ไม่ใช่เครื่องมือ optimize ต้นทุน

Nimbus ไม่มีข้อกำหนด licensing ที่ต้องการ Dedicated Hosts แอปพลิเคชัน cloud-native ส่วนใหญ่ไม่มี

**การสร้าง Mixed Fleet**

แนวทางที่มีวุฒิภาวะ: ใช้ pricing models หลายอันร่วมกัน

สำหรับ API fleet ของ Nimbus:

- **Baseline load (4 instances ที่ทำงานตลอดเวลา)**: ครอบคลุมด้วยข้อผูกมัด Savings Plan
- **Peak ที่คาดเดาได้ (2 instances เพิ่มเติมในช่วงเวลาทำการ)**: ครอบคลุมด้วย Savings Plan ถ้าข้อผูกมัดครอบคลุม มิฉะนั้น On-Demand
- **Traffic spike overflow**: Spot Instances (ยอมรับได้เพราะ API servers เป็น stateless — requests กระจายไปหาก instance ถูกยุติ)

ผลลัพธ์: fleet ที่ optimize ต้นทุนในทุกชั้น — committed pricing สำหรับส่วนที่คาดเดาได้ On-Demand สำหรับการเติบโตที่คาดเดาไม่ได้ Spot สำหรับ burst capacity

## จุดแข็งและข้อจำกัด

**On-Demand**: ไม่มีข้อผูกมัด ราคาเต็ม ใช้สำหรับ workload ที่คาดเดาไม่ได้หรือระยะสั้น

**Reserved Instances**: ส่วนลดสูงสุด 72% ล็อคกับ instance type/region/OS เฉพาะ ขาย capacity ที่ไม่ได้ใช้บน RI Marketplace

**Savings Plans**: ส่วนลดสูงสุด 66-72% ยืดหยุ่นกว่า RIs (Compute Savings Plans ใช้กับ instance type ใดก็ได้) ใช้โดยอัตโนมัติกับการใช้งานที่ตรงกัน

**Spot Instances**: ส่วนลดสูงสุด 90% ความเสี่ยงจากการหยุดชะงัก 2 นาที เหมาะสำหรับ fault-tolerant, stateless, workload ที่หยุดชะงักได้เท่านั้น

**Dedicated Hosts**: Physical server เต็มรูปแบบ แพงที่สุด จำเป็นสำหรับ licensing หรือสถานการณ์ด้านการปฏิบัติตามกฎระเบียบบางอย่าง

## สรุป

- EC2 pricing มีสี่ models: **On-Demand** (ราคาเต็ม ไม่มีข้อผูกมัด), **Reserved Instances/Savings Plans** (committed spend เพื่อส่วนลดมาก), **Spot** (spare capacity ที่ 60-90% ลด หยุดชะงักได้), **Dedicated Hosts** (ความเป็นส่วนตัวของ physical server)
- **Savings Plans** โดยทั่วไปดีกว่า Reserved Instances เพื่อความยืดหยุ่น
- **Spot Instances** ต้องการ fault-tolerant, stateless workloads — เฉพาะสำหรับ batch jobs, ML training และการประมวลผลที่หยุดชะงักได้
- กลยุทธ์ optimal คือ **mixed fleet**: Savings Plans สำหรับ baseline, On-Demand สำหรับการเติบโตที่คาดเดาไม่ได้, Spot สำหรับ interruptible batch work
- ทบทวน pricing models เมื่อ workload ทำงานอย่างต่อเนื่องมากกว่า 3 เดือน นั่นคือเมื่อ On-Demand เริ่มเป็นการสูญเสีย

## เคล็ดลับสอบ

*SAA-C03 Domain: Design Cost-Optimized Architectures (Domain 4, Task 4.2)*

- **Savings Plans vs Reserved Instances**: Savings Plans ยืดหยุ่นกว่า (ใช้กับ EC2 instance ใดก็ได้สำหรับ Compute Savings Plans) Reserved Instances ล็อคกับ instance type เฉพาะ สถานการณ์สอบ: "ต้องการความยืดหยุ่นสูงสุดในขณะที่ยังได้ส่วนลด" → Savings Plans "รู้ instance type ที่แน่นอนเป็นเวลา 3 ปี" → Standard RI เพื่อส่วนลดสูงสุด
- **สัญญาณ Spot**: "คำนึงถึงต้นทุน", "fault-tolerant", "batch processing", "รับการหยุดชะงักได้", "stateless workloads", "ML training" → Spot
- **การจัดการการหยุดชะงักของ Spot**: Spot instances ได้รับการแจ้งเตือน 2 นาทีก่อนยุติ แอปพลิเคชันของคุณต้องจัดการเรื่องนี้อย่างสง่างาม (บันทึกสถานะ drain connections ออกอย่างสะอาด)
- **On-Demand vs Spot สำหรับ web servers**: Web servers ที่ให้บริการ live user traffic ไม่ควรใช้ Spot (การหยุดชะงักทำให้ requests ล้มเหลว) ใช้ On-Demand หรือ Savings Plans สำหรับ web tier
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans ใช้กับ instance family และ region เฉพาะ (ส่วนลดสูงกว่า) Compute Savings Plans ใช้กับ EC2 instance ใดก็ได้, Lambda และ Fargate (ส่วนลดสูงสุดน้อยกว่า ยืดหยุ่นกว่า)
- **RI Marketplace**: Standard Reserved Instances ที่ไม่ได้ใช้สามารถขายให้ลูกค้า AWS รายอื่นได้ Convertible RIs ขายไม่ได้

## แบบฝึกหัด

**แบบฝึกหัดที่ 1 — จำและเล่า**

อธิบายว่าเมื่อไหร่ Spot Instances เหมาะสมและเมื่อไหร่ไม่เหมาะ คุณสมบัติใดที่ทำให้ workload เหมาะสำหรับ Spot?

*(คำใบ้: ลองคิดว่าจะเกิดอะไรขึ้นเมื่อ instance ถูกยุติพร้อมการแจ้งเตือน 2 นาที Workload ใดที่กู้คืนได้อย่างสะอาด? Workload ใดที่ไม่?)*

**แบบฝึกหัดที่ 2 — ฝึกสอบ**

*สถานการณ์*: บริษัทสื่อรัน pipeline การ transcode วิดีโอที่แปลงวิดีโอที่ upload มาเป็นหลายรูปแบบ Transcoding jobs ทำงานต่อเนื่องทุกครั้งที่มีวิดีโอ upload มา (ทำงาน 24/7, ปริมาณผันผวน) แต่ละ job ใช้เวลา 5-30 นาที ถ้า transcoding job ถูกขัดจังหวะ job สามารถเริ่มต้นใหม่ตั้งแต่ต้นโดยไม่เสียข้อมูล บริษัทต้องการลดต้นทุน

EC2 pricing model ใดที่ตอบสนองความต้องการเหล่านี้ได้ดีที่สุด?

A) On-Demand instances ใน Auto Scaling Group  
B) Reserved Instances (1-year, All Upfront)  
C) Spot Instances พร้อม Spot Fleet สำหรับ instance diversification อัตโนมัติ  
D) Dedicated Hosts พร้อม media software licenses ที่มีอยู่ของบริษัท

**คำใบ้ที่ 1**: "สามารถเริ่มต้นใหม่ตั้งแต่ต้นโดยไม่เสียข้อมูล" — นี่คือวลีสำคัญที่เปิดใช้ pricing model เฉพาะ

**คำใบ้ที่ 2**: "ลดต้นทุน" พร้อม workload ที่หยุดชะงักได้ชี้ไปยังตัวเลือกที่มีส่วนลดสูงสุด

**คำใบ้ที่ 3**: Spot Fleet ร้องขอ instances จาก instance types และ AZs หลายอัน ลดโอกาสการหยุดชะงัก

**คำตอบ**: C

**คำอธิบาย**: Transcoding jobs เป็น fault-tolerant — สามารถเริ่มต้นใหม่ได้ถ้าถูกขัดจังหวะ ทำให้เหมาะสำหรับ Spot Instances ซึ่งมีส่วนลด 60-90% เหนือ On-Demand Spot Fleet กระจายไปยัง instance types และ Availability Zones ลดความน่าจะเป็นของการหยุดชะงักจำนวนมาก

**ทำไมไม่ใช่ A?** On-Demand คือตัวเลือกที่มีต้นทุนสูงที่สุด สำหรับ workload ที่ทำงานต่อเนื่องและ fault-tolerant นี้เป็นการสูญเสีย

**ทำไมไม่ใช่ B?** Reserved Instances ให้ส่วนลด 50-72% แต่ไม่ให้ส่วนลดที่อาจได้ถึง 90% ของ Spot สำหรับ fault-tolerant workloads นอกจากนี้ RIs ใช้สำหรับ workload ที่คงที่และคาดเดาได้ Spot ใช้สำหรับ interruptible batch processing โดยเฉพาะ

**ทำไมไม่ใช่ D?** Dedicated Hosts ใช้สำหรับการปฏิบัติตาม licensing ไม่ใช่การ optimize ต้นทุน พวกมันคือตัวเลือกที่แพงที่สุด

*SAA-C03 Domain: Design Cost-Optimized Architectures — Task 4.2*

**แบบฝึกหัดที่ 3 — ความท้าทายด้านสถาปัตยกรรม** *(ไม่บังคับ)*

Infrastructure ของ Nimbus มี workloads เหล่านี้:

1. API servers: 6 instances ทำงาน 24/7 คงที่มา 2 ปีแล้ว ใช้ r6g.large
2. Nightly analytics batch jobs: 4 instances ทำงาน 3AM-6AM ทุกคืน ใช้ instance type เดิมเสมอ
3. Testing environment: 2 instances ใช้โดยวิศวกร 9 AM-6 PM ในวันทำการ
4. Traffic spike overflow: 0-8 instances spin up ในช่วง peak hours คาดเดาไม่ได้อย่างสมบูรณ์

ออกแบบกลยุทธ์ pricing ที่ optimal สำหรับ workload แต่ละประเภท จำนวน Savings Plan commitment ที่ครอบคลุม workloads 1 และ 2 จะเป็นเท่าไหร่? สำหรับ workload ที่ 3 มีกลยุทธ์ที่ฉลาดกว่า On-Demand ไหม?

*(ไม่มีคำตอบที่ถูกต้องเพียงคำตอบเดียว เป้าหมายคือการฝึกกลยุทธ์ EC2 pricing)*

## ฉากหลังเครดิต

Tom ส่งการซื้อ Savings Plan

ข้อผูกมัด $5.76/ชั่วโมง ระยะสามปี Compute Savings Plans เพื่อความยืดหยุ่น

การประมาณการประหยัด: $42,500 ตลอดสามปี

Maya อ่านตัวเลข "สี่หมื่นสองพันดอลลาร์"

"เทียบกับ On-Demand สำหรับ instances เดียวกัน ตลอดสามปี"

"ใช้เวลาเท่าไหร่ในการทำเรื่องนี้?"

"บ่ายวันหนึ่ง" Tom พูด "และการตัดสินใจที่จะให้สัญญา"

"สามปีเป็นเวลานาน" Leo พูด "จะเป็นอย่างไรถ้าเราเปลี่ยน instance types?"

"Compute Savings Plans ใช้กับ EC2 instance type ใดก็ได้ และในสามปี เราใหญ่พอที่การสนทนานี้จะดูต่างออกไปอยู่แล้ว"

Leo คิดเรื่องนั้น

"คุณรู้จัก Savings Plans มานานแค่ไหนแล้ว?" เขาถาม

"ตั้งแต่เริ่มต้น" Tom พูด "ผมรอจนกว่า workload จะเสถียรพอที่จะให้สัญญา"

"สิบแปดเดือนของการจ่าย On-Demand ขณะรอที่จะประหยัดเงิน"

"ใช่" Tom ปิด console "บางครั้งสิ่งที่แพงที่สุดที่คุณทำคือการรอที่จะประหยัดเงิน"

ในบทถัดไป: วินัยเดียวกันที่ใช้กับค่า storage โดยมีความประหลาดใจบางอย่างเกี่ยวกับสิ่งที่ขับเคลื่อนบิล
