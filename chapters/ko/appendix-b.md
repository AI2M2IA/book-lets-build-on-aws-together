# 부록 B: SAA-C03 도메인 맵

AWS Solutions Architect Associate 시험(SAA-C03)은 네 개의 도메인으로 구성됩니다. 이 부록은 책의 모든 챕터를 관련 도메인과 태스크에 매핑하므로, 챕터 순서가 아니라 시험 영역별로 학습할 수 있습니다.

---

## 도메인 개요

| 도메인                                          | 비중   | 설명                                                   |
|------------------------------------------------|--------|--------------------------------------------------------|
| 도메인 1: 보안 아키텍처 설계                    | 30%    | IAM, 네트워크 보안, 데이터 보호                        |
| 도메인 2: 탄력적 아키텍처 설계                  | 26%    | 고가용성, 내결함성, 재해 복구                          |
| 도메인 3: 고성능 아키텍처 설계                  | 24%    | 컴퓨팅, 스토리지, 데이터베이스, 네트워크 성능          |
| 도메인 4: 비용 최적화 아키텍처 설계            | 20%    | 가격 모델, 비용 관리, 리소스 최적화                    |

---

## 도메인 1: 보안 아키텍처 설계 (30%)

**태스크 1.1 — AWS 리소스에 대한 보안 접근 설계**

핵심 개념: IAM 사용자, 그룹, 역할, 정책. 최소 권한 원칙. 교차 계정 접근. 서비스 역할. AWS Organizations의 SCP(Service Control Policy).

| 챕터       | 주제                                                                         |
|------------|------------------------------------------------------------------------------|
| 3장        | IAM 기초: 사용자, 그룹, 역할, 정책, 정책 평가                                |
| 14장       | IAM 고급: 서비스용 역할, 권한 경계, 교차 계정 역할                           |
| 3장        | 정책 평가 로직: 명시적 거부 > 명시적 허용 > 암시적 거부                       |
| 14장       | AWS Organizations, SCP, Control Tower, Account Factory                       |
| 14장       | Cognito: User Pool(앱 로그인, JWT) 및 Identity Pool(임시 AWS 자격 증명)      |

핵심 시험 패턴:

- "EC2가 하드코딩된 자격 증명 없이 S3에 접근해야 함" → EC2 인스턴스 프로파일에 연결된 S3 정책이 있는 IAM 역할
- "서로 다른 계정이 리소스를 공유해야 함" → 교차 계정 신뢰 정책이 있는 IAM 역할
- "OU의 모든 IAM 사용자가 서비스에 접근하지 못하도록 방지" → AWS Organizations의 SCP

---

**태스크 1.2 — 보안 워크로드 및 애플리케이션 설계**

핵심 개념: VPC 설계, 보안 그룹 대 NACL, 네트워크 격리, DDoS 방어, WAF, GuardDuty.

| 챕터       | 주제                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| 11장       | VPC 설계: 퍼블릭/프라이빗 서브넷, NAT Gateway, Internet Gateway, 라우팅 테이블             |
| 15장       | 보안 그룹(상태 저장, 인스턴스 수준) 대 NACL(상태 비저장, 서브넷 수준)                       |
| 17장       | Shield(DDoS), WAF(앱 방화벽), GuardDuty(위협 탐지), Inspector(CVE 스캐닝)                   |
| 17장       | Macie: S3의 민감한 데이터 검색(PII, 자격 증명)                                              |
| 25장       | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

핵심 시험 패턴:

- "서브넷에서 특정 IP 차단" → NACL 거부 규칙
- "HTTP 인바운드 허용, HTTP 응답 아웃바운드 자동 허용" → 보안 그룹(상태 저장)
- "웹 애플리케이션을 SQL 인젝션으로부터 보호" → SQL 인젝션 규칙이 있는 WAF
- "침해된 IAM 자격 증명 탐지" → GuardDuty

---

**태스크 1.3 — 적절한 데이터 보안 제어 결정**

핵심 개념: 저장 및 전송 중 암호화, KMS, Secrets Manager, Parameter Store, S3 서버 측 암호화.

| 챕터       | 주제                                                                     |
|------------|--------------------------------------------------------------------------|
| 16장       | KMS: 고객 관리형 키, 키 회전, 봉투 암호화                                |
| 16장       | Secrets Manager: 자동 자격 증명 회전, 런타임 비밀 검색                   |
| 16장       | ACM(AWS Certificate Manager): ALB, CloudFront용 SSL/TLS 인증서          |
| 5장        | S3 암호화 옵션: SSE-S3, SSE-KMS, SSE-C                                   |
| 8장        | RDS 저장 데이터 암호화(생성 시 활성화해야 함)                            |

핵심 시험 패턴:

- "데이터베이스 자격 증명 자동 회전" → RDS 통합이 있는 Secrets Manager
- "계정 전반에서 암호화 키를 사용할 수 있는 사람 제어" → KMS 키 정책
- "비밀이 아닌 구성 값 저장" → SSM Parameter Store(Secrets Manager 아님)
- "회사 관리형 키로 S3 객체 암호화" → CMK가 있는 SSE-KMS

---

## 도메인 2: 탄력적 아키텍처 설계 (26%)

**태스크 2.1 — 확장 가능하고 느슨하게 결합된 아키텍처 설계**

핵심 개념: Auto Scaling, 로드 밸런서, SQS/SNS 분리, Lambda 이벤트 트리거, ECS/EKS, Step Functions.

| 챕터       | 주제                                                              |
|------------|------------------------------------------------------------------|
| 7장        | Auto Scaling 그룹, Application Load Balancer, 확장 정책          |
| 19장       | SQS(대기열을 통한 분리), SNS(팬아웃 알림)                        |
| 20장       | Lambda: 서버리스 컴퓨팅, 이벤트 트리거, 동시성                   |
| 20장       | API Gateway: 관리형 REST/HTTP/WebSocket API, 단독 또는 + Lambda  |
| 21장       | ECS 및 EKS: 컨테이너화된 마이크로서비스                          |
| 22장       | Step Functions: 워크플로 오케스트레이션                          |
| 26장       | Kinesis: 실시간 데이터 스트리밍                                  |

핵심 시험 패턴:

- "주문 처리를 재고 업데이트에서 분리" → 서비스 사이의 SQS 대기열
- "새 주문이 들어오면 여러 서비스에 알림" → SQS 구독이 있는 SNS 토픽(팬아웃)
- "S3 업로드를 자동으로 처리" → S3 이벤트 알림 → Lambda
- "재시도 로직이 있는 다단계 워크플로 실행" → Step Functions

---

**태스크 2.2 — 고가용성 및/또는 내결함성 아키텍처 설계**

핵심 개념: Multi-AZ, Multi-Region, Route 53 장애 조치, RDS 읽기 전용 복제본, Aurora Global Database, 백업 및 복원.

| 챕터       | 주제                                                                                         |
|------------|----------------------------------------------------------------------------------------------|
| 2장        | AWS 글로벌 인프라: 리전, AZ, 엣지 로케이션                                                    |
| 7장        | 여러 AZ에 걸친 ALB, 비정상 인스턴스를 교체하는 ASG                                            |
| 8장        | RDS Multi-AZ: 동기식 복제, 자동 장애 조치                                                     |
| 12장       | Route 53: 장애 조치 라우팅, 지연 시간 라우팅, 상태 확인                                       |
| 18장       | Multi-AZ 대 Multi-Region: RTO/RPO, DR 전략(파일럿 라이트, 웜 스탠바이, 액티브-액티브)         |
| 18장       | AWS Backup(중앙 집중식, 교차 계정 백업), Elastic Disaster Recovery(관리형 파일럿 라이트)     |
| 24장       | Aurora Global Database: 교차 리전 읽기 전용 복제본, 1초 미만 복제 지연                        |

핵심 시험 패턴:

- "기본 RDS가 실패하면 자동 장애 조치" → RDS Multi-AZ(읽기 전용 복제본 아님)
- "낮은 지연 시간으로 전 세계에 읽기 제공" → Aurora Global Database
- "기본 리전을 사용할 수 없으면 보조 리전으로 트래픽 라우팅" → 상태 확인이 있는 Route 53 장애 조치 라우팅
- "RTO 1분, RPO 0" → Multi-AZ 배포(Multi-Region 아님)
- "RTO 15분, 교차 리전" → 파일럿 라이트 전략

---

## 도메인 3: 고성능 아키텍처 설계 (24%)

**태스크 3.1 — 고성능 및/또는 확장 가능한 스토리지 솔루션 결정**

핵심 개념: S3 대 EBS 대 EFS, 스토리지 클래스 선택, S3 Transfer Acceleration, 멀티파트 업로드, 자산을 위한 CloudFront.

| 챕터       | 주제                                                                   |
|------------|-------------------------------------------------------------------------|
| 5장        | S3: 객체 스토리지, 스토리지 클래스, 버전 관리, 수명 주기                |
| 6장        | EBS: 블록 스토리지 유형(gp3, io2, st1), EFS: 공유 파일 스토리지         |
| 6장        | Storage Gateway: 온프레미스에서 S3로의 하이브리드 브리지(File, Volume, Tape) |
| 23장       | S3 스토리지 클래스 전환, Glacier 검색 옵션                              |
| 25장       | DataSync(온라인 파일 동기화), Transfer Family(관리형 SFTP→S3), Snow Family(오프라인 대량 전송 — 레거시: 2025년 11월 신규 고객에게 중단, AWS는 이제 DataSync와 Data Transfer Terminals를 안내), MGN(서버 리호스트) |
| 28장       | EBS 적정 크기 조정, gp2→gp3 마이그레이션, 스냅샷 관리                   |

핵심 시험 패턴:

- "여러 EC2 인스턴스에서 접근 가능한 공유 파일 시스템" → EFS(EBS 아님, EBS는 한 인스턴스에 연결)
- "데이터베이스 워크로드를 위한 높은 IOPS" → io2 EBS
- "90일 동안 접근하지 않은 파일의 비용 절감" → S3 수명 주기 정책 → Glacier
- "먼 곳에서 대용량 파일을 더 빠르게 업로드" → S3 Transfer Acceleration
- "제한된 대역폭에서 수 주간의 전송" → Snow Family의 2025년 신규 고객 중단에도 SAA-C03 시험은 여전히 Snowball을 기대함

---

**태스크 3.2 — 고성능 및/또는 확장 가능한 컴퓨팅 솔루션 결정**

핵심 개념: EC2 인스턴스 패밀리, Graviton 프로세서, Auto Scaling, Lambda, Fargate, Spot 인스턴스.

| 챕터       | 주제                                                                                    |
|------------|-----------------------------------------------------------------------------------------|
| 4장        | EC2 인스턴스 유형: 컴퓨팅 최적화(c), 메모리 최적화(r), 범용(m, t)                        |
| 7장        | Auto Scaling: 웹 계층을 위한 수평 확장                                                   |
| 20장       | Lambda: 동시성, 프로비저닝된 동시성(일관된 지연 시간용)                                  |
| 21장       | ECS Fargate: 서버리스 컨테이너                                                           |
| 21장       | AWS Batch: Docker 컨테이너를 위한 관리형 배치 컴퓨팅, Spot 기반                          |
| 27장       | 내결함성 배치 워크로드를 위한 Spot 인스턴스                                              |

핵심 시험 패턴:

- "ML 훈련 워크로드, 비용 최소화, 중단 가능" → Spot 인스턴스
- "일관된 100ms 미만 Lambda 응답" → 프로비저닝된 동시성(콜드 스타트 제거)
- "컨테이너화된 마이크로서비스, 인프라 관리 없음" → ECS Fargate

---

**태스크 3.3 — 고성능 데이터베이스 솔루션 결정**

핵심 개념: RDS 대 DynamoDB 대 Aurora 대 Redshift 대 ElastiCache, 접근 패턴, 읽기 전용 복제본, DAX.

| 챕터       | 주제                                                              |
|------------|------------------------------------------------------------------|
| 8장        | RDS: 관리형 관계형 데이터베이스, RDBMS를 언제 사용할지           |
| 9장        | DynamoDB: NoSQL, 파티션 키, GSI, DAX(인메모리 캐시)              |
| 10장       | ElastiCache: Redis 대 Memcached, 캐시 전략                       |
| 10장       | MemoryDB for Redis: 내구성 있는 Redis 호환 기본 데이터베이스     |
| 24장       | Aurora: 성능, Serverless v2, 읽기 전용 복제본, Global Database   |
| 29장       | DynamoDB 온디맨드 대 Auto Scaling이 있는 프로비저닝 용량         |

핵심 시험 패턴:

- "세션 저장소를 위한 마이크로초 읽기" → ElastiCache Redis 또는 DAX(DynamoDB 백엔드인 경우)
- "유연한 스키마를 갖춘 높은 처리량의 키-값 접근" → DynamoDB
- "복잡한 조인과 ACID 트랜잭션" → Aurora 또는 RDS
- "페타바이트 규모의 구조화된 데이터 분석" → Redshift(자세히 다루지는 않지만 신호: "데이터 웨어하우스" → Redshift)

---

**태스크 3.4 — 고성능 및/또는 확장 가능한 네트워크 아키텍처 결정**

핵심 개념: CloudFront, Global Accelerator, Direct Connect, VPN, 배치 그룹, 향상된 네트워킹.

| 챕터       | 주제                                                              |
|------------|------------------------------------------------------------------|
| 7장        | NLB(계층 4) 및 GWLB(네트워크 어플라이언스용 Gateway Load Balancer) |
| 11장       | Client VPN: 개별 디바이스에서 VPC로의 암호화된 접근              |
| 12장       | Route 53: 라우팅 정책: 지연 시간 기반, 지리적 위치, 가중치        |
| 13장       | CloudFront: CDN, 엣지 캐싱, Lambda@Edge                          |
| 25장       | AWS Global Accelerator: AWS 백본으로의 Anycast 라우팅            |
| 25장       | Direct Connect: 전용 프라이빗 연결                              |
| 30장       | VPC 엔드포인트: AWS 서비스로의 프라이빗 연결                     |

핵심 시험 패턴:

- "동적 API 응답에 접근하는 글로벌 사용자의 지연 시간 감소" → Global Accelerator(캐시 가능 콘텐츠에 가장 적합한 CloudFront 아님)
- "전 세계 정적 자산의 지연 시간 감소" → CloudFront
- "온프레미스에서 AWS로의 일관된 프라이빗 연결" → Direct Connect
- "전 세계 고객에서 여러분의 S3 버킷으로의 빠른 업로드" → S3 Transfer Acceleration

---

**태스크 3.5 — 고성능 데이터 수집 및 변환 솔루션 결정**

핵심 개념: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| 챕터       | 주제                                                               |
|------------|---------------------------------------------------------------------|
| 26장       | Kinesis Data Streams: 실시간 순서가 보장된 이벤트 처리              |
| 26장       | Amazon Data Firehose(이전 Kinesis Data Firehose): S3, Redshift, OpenSearch로의 관리형 전송 |
| 26장       | AWS Glue: 서버리스 ETL, Data Catalog, 크롤러                       |
| 26장       | Athena: S3에 대한 서버리스 SQL                                     |
| 26장       | QuickSight: 관리형 BI 대시보드, SPICE 인메모리 엔진                |
| 26장       | Lake Formation: 세분화된 데이터 레이크 접근 제어                   |

핵심 시험 패턴:

- "클릭스트림 데이터를 실시간으로 처리" → Kinesis Data Streams + Lambda 또는 Managed Service for Apache Flink(이전 Kinesis Data Analytics)
- "나중 분석을 위해 스트리밍 데이터를 S3로 전송" → Amazon Data Firehose
- "여러 소스의 데이터 변환 및 카탈로그화" → AWS Glue
- "S3에 저장된 과거 데이터를 SQL로 쿼리" → Athena

---

## 도메인 4: 비용 최적화 아키텍처 설계 (20%)

**태스크 4.1 — 비용 최적화 스토리지 솔루션 설계**

| 챕터       | 주제                                                              |
|------------|------------------------------------------------------------------|
| 23장       | S3 수명 주기 정책, 스토리지 클래스 전환                          |
| 28장       | EBS 적정 크기 조정, gp2→gp3 마이그레이션, S3 버전 관리 수명 주기 규칙 |
| 28장       | EFS Intelligent-Tiering, 비용 할당 태그, AWS Budgets             |

핵심 시험 패턴:

- "어느 팀이 가장 많은 S3 비용을 발생시키는지 식별" → 비용 할당 태그 + Cost Explorer
- "거의 접근하지 않는 객체의 비용을 자동으로 절감" → S3 Intelligent-Tiering
- "월 비용이 $10,000을 초과하면 경고" → AWS Budgets

---

**태스크 4.2 — 비용 최적화 컴퓨팅 솔루션 설계**

| 챕터       | 주제                                                                             |
|------------|----------------------------------------------------------------------------------|
| 2장        | Outposts: 온프레미스 AWS 랙(자본 비용 대 클라우드 운영 비용 트레이드오프)         |
| 2장        | Wavelength: 5G 엣지 컴퓨팅(통신사 파트너십, 지연 시간 기반 배치)                  |
| 27장       | EC2 가격: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts     |
| 20장       | Lambda: 호출당 지불(유휴 비용 제로)                                              |

핵심 시험 패턴:

- "정상 상태 프로덕션 워크로드의 비용 절감" → Savings Plans(더 유연) 또는 Reserved Instances
- "중단 가능한 배치 작업의 비용 최소화" → Spot 인스턴스
- "유휴 비용이 없는 이벤트 기반 처리" → Lambda

---

**태스크 4.3 — 비용 최적화 데이터베이스 솔루션 설계**

| 챕터       | 주제                                              |
|------------|---------------------------------------------------|
| 29장       | DynamoDB 온디맨드 대 프로비저닝 + Auto Scaling     |
| 29장       | RDS 및 ElastiCache Reserved Instances/노드        |
| 29장       | RDS 스냅샷 관리                                   |

핵심 시험 패턴:

- "예측 불가능한 DynamoDB 트래픽" → 온디맨드 용량 모드
- "알려진 피크가 있는 일관된 DynamoDB 트래픽" → 프로비저닝 + Auto Scaling
- "안정적인 워크로드의 RDS 비용 절감" → Reserved Instances(1년 또는 3년)

---

**태스크 4.4 — 비용 최적화 네트워크 아키텍처 설계**

| 챕터       | 주제                                                                                          |
|------------|-----------------------------------------------------------------------------------------------|
| 30장       | 데이터 전송 가격: 인바운드(무료), 교차 AZ(GB당 $0.01), 교차 리전, 인터넷(GB당 $0.09)           |
| 30장       | NAT Gateway(GB당 $0.045) 대 VPC 엔드포인트(게이트웨이: 무료, 인터페이스: 유료)                 |
| 30장       | 데이터 전송 비용 최적화 도구로서의 CloudFront                                                 |

핵심 시험 패턴:

- "프라이빗 서브넷의 EC2가 S3 호출 — NAT Gateway 비용 제거" → S3 게이트웨이 엔드포인트(무료)
- "프라이빗 서브넷의 EC2가 SQS 호출 — NAT Gateway 비용 절감" → SQS 인터페이스 엔드포인트
- "글로벌 콘텐츠 전송의 데이터 전송 비용 절감" → CloudFront(캐싱이 오리진 요청을 줄임)

---

## 교차 도메인 주제

일부 주제는 여러 도메인에 걸쳐 나타납니다:

| 주제                                | 도메인  | 챕터          |
|------------------------------------|---------|--------------|
| Well-Architected Framework         | 전체    | 31           |
| 아키텍처 검토 및 ADR               | 전체    | 32           |
| 트레이드오프 추론("상황에 따라 다름") | 전체    | 33           |
| Multi-AZ 설계                      | 2, 3    | 7, 8, 18, 24 |
| 모니터링 및 가관측성               | 1, 2    | 책 전반      |
| CloudFront                         | 3, 4    | 13, 30       |

---

## 시험 전 체크리스트

SAA-C03 응시 전:

**높은 비중 영역(가장 출제 가능성 높음)**

- [ ] IAM 정책 평가 로직(명시적 거부 → 명시적 허용 → 암시적 거부)
- [ ] VPC 구성 요소: 서브넷, 라우팅 테이블, IGW, NAT Gateway, 보안 그룹, NACL
- [ ] S3 스토리지 클래스와 각각을 언제 사용할지
- [ ] RDS Multi-AZ 대 읽기 전용 복제본(장애 조치 대 읽기 확장)
- [ ] SQS 대 SNS 대 EventBridge(풀 대 푸시 대 이벤트 라우팅)
- [ ] EC2 가격 모델: 내결함성에는 Spot, 약정 워크로드에는 Savings Plans
- [ ] Lambda 트리거 및 동시성
- [ ] DynamoDB 대 Aurora 대 Redshift(접근 패턴이 선택을 결정)
- [ ] CloudFront: 정적에는 CDN, 동적에는 Global Accelerator

**일반적인 함정**

- [ ] EBS는 하나의 인스턴스에 연결, EFS는 공유
- [ ] RDS 읽기 전용 복제본은 읽기 확장용이지 자동 장애 조치용이 아님(그건 Multi-AZ)
- [ ] NACL은 상태 비저장(인바운드와 아웃바운드 규칙 모두 필요)
- [ ] 게이트웨이 엔드포인트는 무료이며 S3와 DynamoDB 전용
- [ ] Kinesis는 보존하고 재생, SQS는 소비 시 삭제
- [ ] "분리"가 항상 SQS를 의미하지는 않음 — SNS 팬아웃과 EventBridge도 분리 패턴
- [ ] Shield Standard는 무료이며 자동, Advanced는 유료 구독
- [ ] ElastiCache 대 MemoryDB: ElastiCache = 캐시(데이터 손실 허용). MemoryDB = 내구성 있는 기본 데이터베이스.
- [ ] Client VPN 대 Site-to-Site VPN: Client VPN = 개별 디바이스. Site-to-Site = 네트워크 대 네트워크.
- [ ] Outposts 대 Wavelength: Outposts = 온프레미스 AWS 랙. Wavelength = 5G 엣지.
- [ ] DMS: 동종 = DMS 직접. 이기종 = SCT 먼저, 그다음 DMS.
- [ ] DataSync는 *파일*을 옮기고, DMS는 *데이터베이스*를 옮기며, MGN은 *서버 전체*를 옮김.

**시험 구조**

- 65문제, 130분(2시간 10분)
- 객관식(정답 1개) 및 다중 응답(정답 N개 선택)
- 합격 점수: 1000점 만점에 720점
- 채점되지 않는 문제가 포함되어 있으며, 어느 것인지 알 수 없음
- 시간 관리: 문제당 약 2분, 어려운 문제는 표시하고 나중에 돌아오기
