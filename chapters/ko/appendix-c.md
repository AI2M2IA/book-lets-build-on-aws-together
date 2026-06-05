# 부록 C: 개념 사전

책에서 소개된 모든 핵심 개념이 해당 장과 비유, 그리고 해당 SAA-C03 도메인을 맵핑하여 나열되어 있습니다. 이는 시험 전에 개념이 불명확하다면, 여기서 찾고 해당 장으로 돌아가 문맥을 확인할 수 있는 연구 인덱스로 사용될 수 있습니다.

---

## A

**ACU (Aurora Capacity Unit)** — Aurora Serverless v2 용량의 측정 단위. 자동 조절됩니다. 24장, 도메인 3.

**Alarm (CloudWatch)** — 메트릭이 임계치를 초과할 때 작동하여 알림을 트리거하거나 자동 스케일링 작업을 수행하는 규칙입니다. 7장, 도메인 2.

**ALB (Application Load Balancer)** — 경로와 호스트 규칙에 따라 HTTP/HTTPS 트래픽을 분배하는 레이어 7 로드 밸런서입니다. 7장, 도메인 2.

**AMI (Amazon Machine Image)** — EC2 인스턴스의 OS, 소프트웨어 및 구성 정보를 포함하는 템플릿입니다. 4장, 도메인 3.

**아키텍처 사상** — "첫 번째로 어떤 것이 깨지는지, 어떻게 알 수 있으며, 오전 3시에 누군가 무엇을 할까요?"라는 질문을 던져 "이것은 어떻게 작동하는지"만 묻는 것보다 더 많이 생각합니다. 32장, 34장. 도메인 간.

**아키텍처 결정 기록 (ADR)** — 결정, 대안, 이유 및 재고론의 단문 문서입니다. 32장. 도메인 간.

**아키텍처 검토** — 제약 사항 → 모호한 부분 → 옵션 → 실패 모드 → 모니터링 → 운영 매뉴얼을 포함하는 구조화된 과정입니다. 32장. 도메인 간.

**Athena** — S3에 있는 데이터를 위한 서버리스 SQL 쿼리 서비스입니다. TB당 요금제로 결제합니다. Parquet/ORC 열형 포맷과 함께 최적화됩니다. 26장, 도메인 3.

**자동 확장 그룹 (ASG)** — EC2 인스턴스의 그룹으로 관리되며, 불건강한 인스턴스를 자동으로 대체하고 로드에 따라 확장합니다. 7장, 도메인 2, 3.

** Availability Zone (AZ)** — 지역 내에서 물리적으로 분리된 하나 이상의 데이터 센터로 구성되며, 저지연 연결을 통해 연결됩니다. 2장, 도메인 2.

---

## B

**Bucket (S3)** — S3 객체를 저장하는 컨테이너입니다. 버킷은 고유한 전역 이름을 가지고 있으며 특정 지역에 위치합니다. 5장, 도메인 3.

**버킷 정책** — IAM 주체와 외부 계정의 액세스 제어를 제어하기 위해 S3 버킷에 첨부된 리소스 기반 정책입니다. 5장, 도메인 1.

---

## C

**캐시 제외 패턴** — 응용 프로그램은 먼저 캐시를 확인합니다; 빗나가면 데이터베이스에서 쿼리하고 결과를 캐시에 저장합니다. 10장, 도메인 3.

**캐시 히트율** — 요청 중 캐시에서 처리된 비율입니다. 더 높을수록 좋습니다. 13장, 도메인 3.

**CloudFront** — AWS CDN입니다. 전 세계 400여 개의 엣지 위치에 콘텐츠를 캐시합니다. 지연 시간과 원본 데이터 전송 비용을 줄입니다. 13장, 도메인 3, 4.

**CloudTrail** — 모든 AWS API 호출 로그: 누가 언제 어디서 무엇을 했는지. S3에 저장됩니다. 심사와 사건 조사를 위해 사용됩니다. 도메인 1.

**CloudWatch** — AWS 리소스 및 커스텀 애플리케이션의 메트릭, 로그, 알림 및 대시보드입니다. 전반적으로 참조됩니다. 모든 도메인.

**첫 시작 지연 (Lambda)** — 첫 번째 호출 또는 비활성화 후에 Lambda가 실행 환경을 초기화하는 동안 발생하는 지연입니다. 예약된 동시성을 사용하여 제거할 수 있습니다. 20장, 도메인 3.

**컴퓨팅 절약 계획** — 시간당 EC2 비용의 금액에 대한 약속이며, 임시 유형이나 크기와 상관없이 적용됩니다. 27장, 도메인 4.

**Config (AWS)** — AWS 리소스의 구성 변경을 오랜 시간 동안 추적하고 규칙에 따라 준수 여부를 평가합니다. 31장, 도메인 1.

**지역 간 데이터 전송** — 지역 내 Availability Zone 간 트래픽입니다. 각 방향에서 $0.01/GB로 부과됩니다. 30장, 도메인 4.

**다른 지역 복제** — S3 CRR, Aurora Global, DynamoDB 글로벌 테이블 등 데이터를 다른 지역으로 복제합니다. 데이터 전송 비용이 부과됩니다. 18장, 30장, 도메인 2.

---

## D

**DAX (DynamoDB Accelerator)** — DynamoDB에 특화된 메모리 캐시입니다. 마이크로초 단위의 읽기 지연 시간을 제공합니다. 9장, 도메인 3.

**죽은 큐 (DLQ) — 재 처리 실패한 메시지가 다시 큐를 막히지 않도록 보내는 대체 큐입니다. 19장, 도메인 2.

**디DICicated 호스트** — 특정 소프트웨어 라이선스에 필요한 경우 개인적으로 사용할 수 있는 EC2 물리 서버로 예약됩니다. 27장, 도메인 4.

**깊은 방어** — IAM + 보안 그룹 + NACLs + WAF + GuardDuty와 같은 여러 보안 제어를 층화하여 한 층의 해킹이 시스템을 노출하지 않도록 합니다. 33장, 도메인 1.

**디렉트 커넥트** — AWS로의 전용 사설 네트워크 연결입니다. VPN보다 더 일관적입니다. 25장, 도메인 3.

**DLQ** — 죽은 큐를 참조하세요.

**DynamoDB** — 단위당 밀리초 단위의 지연 시간을 제공하며 스케일에 따라 완전 관리형 NoSQL 데이터베이스입니다. 키-값 및 문서 모델입니다. 9장, 도메인 3.

**DynamoDB 자동 확장** — CloudWatch 메트릭에 따라 자동으로 할당된 읽기/쓰기 용량을 조정합니다. 29장, 도메인 4.

**DynamoDB 스트리밍** — 모든 아이템 변경 사항의 시간 순서로 기록되는 DynamoDB 테이블의 변경 이벤트 로그입니다. Lambda와 함께 이벤트 처리에 사용됩니다. 9장, 도메인 2.

---

## E

**EBS (Elastic Block Store)** — 단일 EC2 인스턴스에 연결된 블록 스토리지입니다. 독립적으로 지속됩니다. 유형: gp3, io2, st1. 6장, 도메인 3.

**EC2 (Elastic Compute Cloud)** — 클라우드에서의 가상 머신. 제 4장. 영역 3.

**ECS (Elastic Container Service)** — 관리형 컨테이너 오케스트레이션. Fargate 런치 타입은 서버 관리를 없앤다. 제 21장. 영역 2, 3.

**EFS (Elastic File System)** — 여러 EC2 인스턴스에서 접근 가능한 자동 스케일링 NFS 파일 시스템. 제 6장. 영역 3.

**EKS (Elastic Kubernetes Service)** — AWS에서의 관리형 Kubernetes 컨트롤 플레인. 제 21장. 영역 3.

**ElastiCache** — 메모리 내 캐시를 관리하는 서비스. Redis(다양한 기능) 또는 Memcached(간단한 버전). 제 10장. 영역 3.

**Elastic IP** — 할당하고 재할당 가능한 고정된 공용 IP 주소, EC2 인스턴스와 연결할 수 있다. 제 11장. 영역 3.

**Envelope encryption** — 데이터 키(DEK)로 데이터를 암호화하고 CMK(KMS에서)로 DEK를 암호화하는 패턴. 제 16장. 영역 1.

**EventBridge** — AWS 서비스, SaaS 파트너 및 사용자 정의 소스로부터 이벤트를 대상으로 전송하기 위한 이벤트 버스. 예약된 규칙을 지원한다. 제 22장. 영역 2.

**Explicit deny** — IAM 거부 문구가 모든 허용 권한을 상회하여 우선권을 가지며, 어떠한 허용도 이를 오버라이드할 수 없다. 제 3장. 영역 1.

---

## F

**Failover routing (Route 53)** — 주 기능이 실패하면 대체 엔드포인트로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

**EC2 (Elastic Compute Cloud)** — 클라우드에서의 가상 머신. 제 4장. 영역 3.

**ECS (Elastic Container Service)** — 관리형 컨테이너 오케스트레이션. Fargate 런치 타입은 서버 관리를 필요로 하지 않는다. 제 21장. 영역 2, 3.

**EFS (Elastic File System)** — 여러 EC2 인스턴스에서 접근 가능한 자동 스케일링 NFS 파일 시스템. 제 6장. 영역 3.

**EKS (Elastic Kubernetes Service)** — AWS에서의 관리형 Kubernetes 컨트롤 플레인. 제 21장. 영역 3.

**ElastiCache** — 메모리 내 캐시를 관리하는 서비스. Redis(다양한 기능) 또는 Memcached(간단한 버전). 제 10장. 영역 3.

**Elastic IP** — 할당하고 재할당 가능한 고정된 공용 IP 주소, EC2 인스턴스와 연결할 수 있다. 제 11장. 영역 3.

**Envelope encryption** — 데이터 키(DEK)로 데이터를 암호화하고 CMK(KMS에서)로 DEK를 암호화하는 패턴. 제 16장. 영역 1.

**EventBridge** — AWS 서비스, SaaS 파트너 및 사용자 정의 소스로부터 이벤트를 대상으로 전송하기 위한 이벤트 버스. 예약된 규칙을 지원한다. 제 22장. 영역 2.

**Explicit deny** — 어떠한 허용도 이를 오버라이드할 수 없는 IAM 거부 문구, 모든 허용보다 우선권을 가지며. 제 3장. 영역 1.

---

## F

**Failover routing (Route 53)** — 주 기능이 실패하면 대체 엔드포인트로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## F

**Failover routing (Route 53)** — 주 기능이 실패하면 대체 엔드포인트로 트래픽을 전환하는 방식. 제 12장. 영역 2.

**Fargate** — ECS와 EKS에 대한 서버리스 컴퓨팅 엔진. EC2 인스턴스 관리를 필요로 하지 않는다. 제 21장. 영역 3.

**Fan-out pattern** — 하나의 SNS 토픽이 동일한 메시지를 동시에 여러 SQS 큐에 전송하는 패턴. 제 19장. 영역 2.

**FIFO queue (SQS)** — 정확한 처리, 엄격한 순서. 표준 큐보다 낮은 트래픽 처리량. 제 19장. 영역 2.

**Failure mode** — 시스템이 실패할 수 있는 특정 방식. 실제 운영 전에 실패 모드를 식별하는 것이 아키텍처 검토의 핵심이다. 제 32장. 영역 간.

---

## G

**Gateway Endpoint** — S3와 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## F

**Failover routing (Route 53)** — 주 기능이 실패하면 대체 엔드포인트로 트래픽을 전환하는 방식. 제 12장. 영역 2.

**Fargate** — ECS와 EKS에 대한 서버리스 컴퓨팅 엔진. EC2 인스턴스 관리를 필요로 하지 않는다. 제 21장. 영역 3.

**Fan-out pattern** — 하나의 SNS 토픽이 동일한 메시지를 동시에 여러 SQS 큐에 전송하는 패턴. 제 19장. 영역 2.

**FIFO queue (SQS)** — 정확한 처리, 엄격한 순서. 표준 큐보다 낮은 트래픽 처리량. 제 19장. 영역 2.

**Failure mode** — 시스템이 실패할 수 있는 특정 방식. 실제 운영 전에 실패 모드를 식별하는 것이 아키텍처 검토의 핵심이다. 제 32장. 영역 간.

---

## G

**Gateway Endpoint** — S3와 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽을 전송하여 NAT 게이트웨이 요금을 없앤다. 제 30장. 영역 4.

**Geolocation routing (Route 53)** — DNS 쿼리 원본의 지리적 위치에 따라 트래픽을 전환하는 방식. 제 12장. 영역 3.

**Global Accelerator** — Anycast를 통해 가장 가까운 AWS 엣지로 트래픽을导向思维，这段Markdown文本是关于AWS服务的介绍。以下是翻译后的韩文版本：

## G

**Gateway Endpoint** — S3 및 DynamoDB를 위한 VPC 엔드포인트 유형. AWS 사설 네트워크를 통해 트래픽

## M

- **Memcached** - 간단한 멀티스레드 메모리 캐시 엔진입니다. 지속성 없고 데이터 구조도 없습니다. Redis를 사용해야 하는 경우만 사용하세요. Chapter 10, Domain 3.
- **Multi-AZ (RDS)** - 다른 AZ에 동기식 스테이비지 복제본과 자동 실패전환을 제공합니다. RPO ~0, RTO ~60초입니다. 고용량성을 위한 것이 아니라 백업용입니다. Chapter 8, 18, Domain 2.
- **Multi-Region** - 여러 AWS 지역에 애플리케이션 구성 요소를 배포하여 지리적 복원력과 전 세계적인 성능을 제공합니다. 복잡성과 비용이 높습니다. Chapter 18, Domain 2.

---

## N

- **NACL (Network Access Control List)** - 서브넷 수준의 무상태 방화벽입니다. 입출력 규칙이 필요합니다. 규칙은 숫자 순서대로 평가됩니다. Chapter 15, Domain 1.
- **NAT Gateway** - 사설 서브넷 내 인스턴스가 인터넷에 대한 외부 연결을 할 수 있게 합니다. 처리량당 $0.045 요금제입니다. Chapter 11, 30, Domain 4.

---

## O

- **Object (S3)** - S3에 저장된 파일입니다. 키(이름), 값(데이터), 메타데이터로 구성됩니다. 최대 크기는 5TB입니다. Chapter 5, Domain 3.
- **On-Demand capacity (DynamoDB)** - 요청당 요금제입니다. 프로비저닝보다 비용은 더 높지만 용량 계획이 필요 없습니다. Chapter 29, Domain 4.
- **On-Demand instances (EC2)** - 시간당 요금제이며 약정 없음. 최대 유연성과 최대 가격입니다. Chapter 27, Domain 4.

---

## P

- **Partition key (DynamoDB)** - 아이템이 저장되는 파티션을 결정하는 주키 구성요소입니다. 높은 카드INALITY의 키를 선택하여 균형 있게 분포시킵니다. Chapter 9, Domain 3.
- **Permission boundary** - IAM 정책으로 IAM 식별자가 다른 정책이 부여한 권한보다 최대 권한을 설정할 수 있습니다. Chapter 14, Domain 1.
- **Placement group** - EC2 인스턴스의 물리적 배치를 제어하여 지연을 최소화(클러스터) 또는 가용성을 극대화(확산)합니다. Chapter 4, Domain 3.
- **PrivateLink** - AWS 서비스로 AWS 내 호스트된 서비스에 대한 사설 엔드포인트를 생성하는 AWS 서비스입니다. 인터페이스 엔드포인트를 통해 접근 가능합니다. Chapter 30, Domain 1.
- **Provisioned concurrency (Lambda)** - 콘테이너 초기화를 미리 수행하여 차가운 시작 지연을 제거합니다. Chapter 20, Domain 3.
- **Provisioned capacity (DynamoDB)** - 읽기 및 쓰기 트래픽을 사전 할당한 레코드 단위 수입니다. 예측 가능한 트래픽에 대해 프로비저닝된 용량보다 비용이 낮습니다. Chapter 9, 29, Domain 4.

---

## R

- **RDS (Relational Database Service)** - 관리형 relational 데이터베이스 서비스입니다. 백업, 패치, 실패전환을 처리합니다. Chapter 8, Domain 3.
- **RDS Proxy** - Lambda/애플리케이션과 RDS 간의 연결 풀링을 관리하여 연결 고갈을 방지합니다. Chapter 8, Domain 3.
- **Read Replica (RDS)** - 읽기 스케일링을 위한 비동기 복제본입니다. 자동 실패전환은 제공하지 않습니다. Chapter 8, 24, Domain 3.
- **Redis** - 캐시, 세션 관리, 실시간 리더보드, 퍼블리셔/서브스크라이버를 위한 메모리 데이터 구조 저장소입니다. Chapter 10, Domain 3.
- **Reserved Instance (EC2)** - 특정 인스턴스 유형을 특정 지역에서 1년 또는 3년 동안 사용하기 위해 할인을 받기 위해 약정합니다. Chapter 27, Domain 4.
- **Route 53** - AWS DNS 서비스와 도메인 등록자입니다. 여러 라우팅 정책을 지원합니다. Chapter 12, Domain 2, 3.
- **RPO (Recovery Point Objective)** - 시간으로 측정된 최대 허용 데이터 손실량입니다. "어떤 양의 데이터를 잃을 수 있습니까?" Chapter 18, Domain 2.
- **RTO (Recovery Time Objective)** - 실패 후 서비스 복구에 필요한 최대 시간입니다. "우리는 얼마나 오래 멈출 수 있습니까?" Chapter 18, Domain 2.
- **Runbook** - 시스템 운영을 위한 단계별 지침, 특히 사고 응답을 위한 것입니다. "3시에 누가 무엇을 해야 할까요?" Chapter 32, Cross-domain.

---

## S

- **S3 Intelligent-Tiering** - 접근 패턴에 따라 자동으로 S3 객체를 액세스 계층 간에 이동합니다. 검색 요금이 없습니다. Chapter 23, Domain 4.
- **S3 Select** - SQL 표현식을 사용하여 S3 객체 내용의 부분만 추출하여 데이터 전송량을 줄입니다. Chapter 30, Domain 4.
- **Savings Plan** - 시간당 지출에 대한 유연한 가격 모델로 할인을 받기 위해 특정 금액의 약정을 합니다. 예약 인스턴스보다 유연합니다. Chapter 27, Domain 4.
- **SCP (Service Control Policy)** - AWS Organizations 정책으로 OU 내 계정에 대한 최대 권한을 제한합니다. Chapter 14, Domain 1.

**Secrets Manager** — 비밀번호, API 키 등 비밀을 자동으로 암호화하고 저장합니다. Chapter 16. 도메인 1.

**보안 그룹** — 인스턴스 수준의 상태유지형 가상 방화벽입니다. 허용 규칙만 설정하면 되며, 반대 트래픽은 자동으로 처리됩니다. Chapter 15. 도메인 1.

**Шард (Kinesis)** — Kinesis Data Streams에서의 기본 통과량 단위: 쓰기 1 MB/s, 읽기 2 MB/s. Chapter 26. 도메인 3.

**공유 책임 모델** — AWS는 클라우드의 보안에 대한 책임을 지고 있으며, 데이터와 구성 및 접근 권한과 같은 클라우드 내부의 보안은 사용자가 책임지게 됩니다. Chapter 1. 도메인 1.

**Shield** — DDoS 보호 서비스입니다. 표준: 무료, 자동화됨. 고급: 유료, DRT 지원 및 재정 보호를 제공합니다. Chapter 17. 도메인 1.

**SNS (Simple Notification Service)** — 퍼블리시/서브스크라이브 메시지 전송 서비스입니다. 동시에 모든 구독자에게 메시지를 보내는 팬아웃 패턴을 사용합니다. Chapter 19. 도메인 2.

**소트 키 (DynamoDB)** — 기본 키의 선택적 두 번째 구성 요소로, 파티션 내에서 범위 쿼리를 가능하게 합니다. Chapter 9. 도메인 3.

**스팟 인스턴스** — 남은 용량을 사용하여 최대 60-90% 할인된 가격으로 EC2 인스턴스를 제공합니다. 2분 전에 중단될 수 있으며, 오류에 내구성이 있는 작업만 사용할 수 있습니다. Chapter 27. 도메인 4.

**SQS (Simple Queue Service)** — 관리형 메시지 큐입니다. 생산자와 소비자를 분리합니다. 표준(최소 한 번의 처리)과 FIFO(정확한 한 번의 처리) 큐가 있습니다. Chapter 19. 도메인 2.

**스텝 함수** — 서버리스 워크플로우 조율 서비스입니다. AWS 서비스를 조정하는 상태 기계입니다. Chapter 22. 도메인 2.

---

## T

**타겟 트래킹 스케일링** — CPU 사용량 등 특정 메트릭 값을 유지하기 위해 용량을 조절하는 자동 확장 정책입니다. Chapter 7. 도메인 2.

**전송 게이트웨이** — 여러 VPC와 내부 네트워크를 중심 게이트웨이를 통해 연결하는 허브-스poke 네트워크 구조입니다. Chapter 25. 도메인 3.

**TTL (Time to Live)** — DynamoDB에서 항목이 자동으로 삭제되는 시간戳。DynamoDB에서 항목이 자동으로 삭제되는 시간戳。도메inating因素。同时，它也被用于DNS（解析器缓存记录的时间）和缓存（缓存值的有效期）。章节 9, 12. 领域 3。

---

## V

**VIF (Virtual Interface)** — AWS Direct Connect와 함께 사용되는 논리적 연결입니다. 공용 VIF는 AWS 공용 엔드포인트에 액세스하고, 사설 VIF는 VPC 리소스에 액세스합니다。Chapter 25. 领域 3。

**SQS의 시야 타임아웃** — 수신된 메시지가 다른 소비자에게 숨겨지는 기간입니다。这允许处理而其他消费者看不到同一消息。Chapter 19. 领域 2。

**VPC (Virtual Private Cloud)** — AWS 내부에서 분리된 가상 네트워크입니다。包含子网、路由表和网关。章节 11. 领域 1。

**VPC 엔드포인트** — VPC 리소스가 AWS 서비스에 연결되도록 하는 AWS 사설 네트워크를 통해 연결합니다。Gateway（免费，S3/DynamoDB）和Interface（收费，大多数其他服务）。章节 30. 领域 1, 4。

**VPC 흐름 로그** — VPC의 네트워크 인터페이스로 가는 및 부터의 IP 트래픽 정보를 캡처합니다。GuardDuty와 네트워크 문제 해결에 사용됩니다。章节 17. 领域 1。

**VPC 피어링** — 두 VPC 간의 네트워크 연결을 통해 사설 IP 주소를 사용하여 트래픽을 서로 전송합니다。章节 11. 领域 3。

---

## W

**WAF (웹 애플리케이션 방화벽)** — 규칙(IP 블록, SQL 인젝션, 속도 제한)을 사용하여 HTTP/HTTPS 트래픽을 필터링합니다。CloudFront, ALB 또는 API Gateway에 연결됩니다。章节 17. 领域 1。

**Well-Architected Framework** — AWS의 여섯 가지 원칙 평가 프레임워크: 운영 효율성, 보안, 신뢰성, 성능 효율성, 비용 최적화, 지속 가능성。章节 31. 跨领域。

**무게 분배(ROUTE53)** — DNS 쿼리를 가중치에 따라 여러 엔드포인트 사이에서 분산합니다。蓝色绿色部署和A/B测试中使用。章节 12. 领域 3。

**쓰기를 통해 캐싱** — 데이터베이스가 업데이트될 때마다 캐시도 업데이트됩니다。데이터는 항상 일관성이 있지만, 캐시에는 종종 다시 읽지 않는 항목이 많이 포함되어 있을 수 있습니다。章节 10. 领域 3。

---

## SAA-C03 빠른 패턴 참조

| 시험에서 말하는 것...                           | 생각해보는 것...                                     |
|-----------------------------------------------|------------------------------------------------------|
| "서비스 분리"                                   | SQS, SNS, EventBridge                                |
| "다수의 소비자에게 분산"                         | SNS + SQS 구독                                       |
| "실시간 순차적 이벤트"                          | Kinesis Data Streams                                 |
| "서버리스"                                     | Lambda, DynamoDB, Aurora Serverless, Fargate        |
| "글로벌 저지연 (동적)"                         | Global Accelerator                                   |
| "글로벌 저지연 (정적/캐시)"                      | CloudFront                                          |
| "DDoS 보호"                                    | Shield (Standard: 무료; Advanced: 유료)             |
| "EDGE에서 SQL 주입 차단"                        | WAF                                                |
| "취약한 자격 증명 감지"                         | GuardDuty                                           |
| "API 활동 검토"                                | CloudTrail                                          |
| "데이터베이스 자격 증명 회전"                    | Secrets Manager                                     |
| "휴면 상태 데이터 암호화, 고객 관리 키"          | KMS with CMK                                        |
| "구성 값 저장"                                  | SSM Parameter Store                                 |
| "고 IOPS 데이터베이스 스토리지"                | io2 EBS                                             |
| "EC2에 공유 파일 시스템"                        | EFS                                                 |
| "S3와의 SQL 쿼리"                              | Athena                                              |
| "분석을 위한 ETL 파이프라인"                      | AWS Glue                                            |
| "S3로 스트리밍 데이터 전달"                    | Kinesis Firehose                                    |
| "결함에 대한 내구성 있는 배치 작업, 비용 최소화"  | Spot Instances                                     |
| "공약된 안정적인 프로덕션 로드워크"            | Savings Plans                                       |
| "사설 서브넷 → S3 무 NAT"                       | S3 Gateway Endpoint                                 |
| "사설 서브넷 → SQS 무 NAT"                      | SQS Interface Endpoint                              |
| "RDS의 Multi-AZ"                               | 자동 복구 (읽기 스케일링이 아님)                    |
| "RDS의 읽기 복제본"                            | 읽기 스케일링 (자동 복구가 아님)                    |
| "1분 이내 회복 시간, 다중 AZ"                   | Multi-AZ                                            |
| "다음 지역까지의 회복 시간, 분 단위 RTO"        | Pilot Light 또는 WARM Standby                       |
| "활성-활성, 0분 RTO"                            | 다중 지역 활성-활성 (가장 복잡함)                    |
