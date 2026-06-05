# 부록 A: AWS 서비스 빠른 참조

이 책에서 다룬 모든 서비스, 소개된 순서대로. 이것을 학습 참고자료와 시험 준비 중 빠른 조회로 사용하라.

---

## 컴퓨팅

**EC2 — Elastic Compute Cloud** *(4장)*

클라우드의 가상 머신. 인스턴스 유형(CPU, 메모리, 스토리지), 운영 체제, 리전을 선택한다. 초당 지불(온디맨드), 약정당(Reserved Instances / Savings Plans), 또는 여분 용량 슬롯당(Spot). 기본 컴퓨팅 기본 요소.

핵심 개념: AMI(Amazon Machine Image), 인스턴스 유형(t3, m6g, r6g, c6g 패밀리), 키 페어, 인스턴스 프로필, 배치 그룹.

시험 신호: 시나리오에 영구적이고, 상태가 있는, 또는 장기 실행 컴퓨팅이 필요할 때 — EC2 또는 ECS. 짧은 기간, 이벤트 트리거, 또는 제로 유휴 비용 컴퓨팅이 필요할 때 — Lambda.

---

**Auto Scaling + Application Load Balancer** *(7장)*

Auto Scaling Groups(ASG)가 부하에 따라 EC2 인스턴스를 추가하고 제거한다. Application Load Balancers(ALB)가 인스턴스에 트래픽을 배분하고 경로 또는 호스트로 라우팅한다. 함께 수평 확장 레이어를 형성한다.

핵심 개념: Launch template, 확장 정책(대상 추적, 단계, 예약), 상태 확인, ALB 대상 그룹, 리스너 규칙, 가중치 라우팅.

시험 신호: "가변 부하 처리" 또는 "AZ 전체에 고가용성" → ASG + ALB.

---

**Lambda** *(20장)*

서버리스 함수. 코드를 작성하면; AWS가 이벤트에 대응하여 실행한다. 관리할 서버 없음. 호출당 및 실행 밀리초당 지불. 수천 개의 동시 실행으로 자동 확장.

핵심 개념: 이벤트 소스(API Gateway, S3, SQS, EventBridge, Kinesis), 실행 역할, 동시성 제한, 예약 및 프로비저닝된 동시성, 콜드 스타트, Layer, 15분 최대 기간.

시험 신호: "서버리스," "이벤트 기반," "짧은 기간 작업," "유휴 비용 없음" → Lambda.

---

**ECS — Elastic Container Service** *(21장)*

AWS에서 Docker 컨테이너 실행. 두 가지 실행 유형: EC2(호스트를 직접 관리) 및 Fargate(AWS가 호스트 관리). ECS가 작업 정의, 서비스, 클러스터 스케줄링, 로드 밸런서 및 서비스 검색과의 통합을 관리한다.

핵심 개념: 작업 정의, ECS 서비스, Fargate vs. EC2 실행 유형, ECR(컨테이너 레지스트리), 작업 IAM 역할, 서비스 자동 확장.

시험 신호: "컨테이너화된 워크로드," "마이크로서비스," "AWS에서 Docker" → ECS(서버리스 컨테이너에는 보통 Fargate).

---

**EKS — Elastic Kubernetes Service** *(21장)*

관리형 Kubernetes. AWS가 제어 평면을 실행하고; 작업자 노드는 직접 실행하거나(EC2 또는 Fargate). 팀이 이미 Kubernetes를 사용하거나 Kubernetes 특화 기능이 필요한 워크로드가 있을 때 EKS를 사용하라.

시험 신호: "Kubernetes," "기존 K8s 워크로드 마이그레이션 필요" → EKS. "K8s 오버헤드 없이 컨테이너만 필요" → ECS.

---

## 스토리지

**S3 — Simple Storage Service** *(5장)*

객체 스토리지. 무제한 용량, 99.999999999%(열한 개의 9) 내구성. 파일을 버킷의 객체로 저장. 버킷은 리전에 존재. 객체는 0바이트에서 5TB까지 가능.

핵심 개념: 버킷 정책, 객체 ACL, 버전 관리, 정적 웹사이트 호스팅, 사전 서명된 URL, 멀티파트 업로드, Transfer Acceleration, 스토리지 클래스(Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

시험 신호: "파일 저장 및 검색," "정적 자산," "백업," "데이터 레이크" → S3. 올바른 스토리지 클래스는 접근 빈도와 검색 속도에 따라 달라진다.

---

**EBS — Elastic Block Store** *(6장)*

단일 EC2 인스턴스에 연결된 블록 스토리지. 하드 드라이브처럼 동작. 인스턴스 수명주기에 독립적으로 유지. 가장 흔한 유형: gp3(범용 SSD, 기본값), io2(데이터베이스용 프로비저닝된 IOPS), st1(순차 읽기용 처리량 최적화 HDD).

핵심 개념: 스냅샷(증분, S3에 저장), 암호화(KMS), 멀티 연결(io1/io2만), IOPS 및 처리량 프로비저닝.

시험 신호: "EC2용 영구 스토리지," "데이터베이스 스토리지," "낮은 지연 블록 접근 필요" → EBS.

---

**EFS — Elastic File System** *(6장)*

공유 파일 시스템, 여러 EC2 인스턴스에서 동시에 접근 가능. NFS 프로토콜. 자동으로 확장. EBS보다 GB당 더 비싸다. 두 가지 스토리지 클래스: Standard와 Infrequent Access. Intelligent-Tiering이 자동으로 파일을 이동한다.

시험 신호: "공유 파일 시스템," "여러 EC2 인스턴스가 같은 파일 필요," "NFS" → EFS.

---

**S3 스토리지 클래스 및 수명주기 정책** *(23장)*

S3 Intelligent-Tiering은 접근 빈도에 따라 자동으로 객체를 접근 계층 사이에 이동한다. 수명주기 정책은 나이 규칙에 따라 클래스 사이(Standard → Standard-IA → Glacier)를 전환한다. Glacier 스토리지 클래스는 분(Glacier Instant)에서 12시간(Glacier Deep Archive)까지 다양한 검색 지연이 있다.

시험 신호: "비정기적으로 접근하는 데이터에 대한 스토리지 비용 줄이기" → 수명주기 정책, Intelligent-Tiering, 또는 Glacier.

---

## 데이터베이스

**RDS — Relational Database Service** *(8장)*

관리형 관계형 데이터베이스. 지원 엔진: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora(AWS의 독자적인 엔진). AWS가 백업, 패치, 장애 조치, 복제를 처리한다. 스키마 설계, 쿼리, 인스턴스 크기 조정을 직접 관리한다.

핵심 개념: 멀티 AZ 배포(자동 장애 조치, 동기적 복제), 읽기 복제본(비동기적, 읽기 확장용), 자동화된 백업(1-35일 보관), 수동 스냅샷(삭제할 때까지 유지), RDS Proxy(연결 풀링).

시험 신호: "관계형 데이터베이스," "ACID 트랜잭션," "기존 SQL 워크로드" → RDS 또는 Aurora.

---

**Aurora** *(24장)*

AWS의 관계형 데이터베이스 엔진, MySQL 및 PostgreSQL과 호환. 3개의 AZ에 6개의 복사본으로 데이터를 복제하는 분산 스토리지 엔진. 일반적으로 표준 MySQL보다 5배 빠르다. Aurora Serverless v2가 용량을 자동으로 확장(ACU — Aurora Capacity Units로 측정).

핵심 개념: Aurora 클러스터(작성자 + 최대 15개의 독자 엔드포인트), Aurora 글로벌 데이터베이스(<1초 복제 지연이 있는 교차 리전 읽기 복제본), Aurora Serverless v2.

시험 신호: "고성능 관계형 데이터베이스," "MySQL/PostgreSQL 호환," "전 세계 읽기," "가변 워크로드" → Aurora.

---

**DynamoDB** *(9장)*

완전 관리형 NoSQL 데이터베이스. 키-값 및 문서 모델. 한 자리 수 밀리초 성능으로 모든 처리량으로 확장. 두 가지 용량 모드: 온디맨드(요청당 지불) 및 프로비저닝(용량 단위당 시간당 지불, Auto Scaling 포함).

핵심 개념: 파티션 키(필수), 정렬 키(선택적), 글로벌 보조 인덱스(GSI), 로컬 보조 인덱스(LSI), DynamoDB Streams(변경 데이터 캡처), DynamoDB Accelerator(DAX) — 인메모리 캐시, TTL(Time to Live), 트랜잭션.

시험 신호: "높은 처리량 키 기반 접근," "유연한 스키마," "서버리스 NoSQL" → DynamoDB.

---

**ElastiCache** *(10장)*

관리형 인메모리 캐싱. 두 가지 엔진: Redis(영속성, pub/sub, Lua 스크립팅, 데이터 구조) 및 Memcached(순수 캐시, 더 단순, 멀티 스레드). 데이터베이스 부하를 줄이고 마이크로초 단위로 자주 읽는 데이터를 제공하는 데 사용.

핵심 개념: 캐시-어사이드 패턴, 쓰기-스루 패턴, 제거 정책, TTL, 클러스터 모드(Redis), 자동 장애 조치가 있는 멀티 AZ.

시험 신호: "데이터베이스 부하 줄이기," "서브 밀리초 읽기 지연," "세션 관리," "실시간 리더보드" → ElastiCache Redis.

---

## 네트워킹

**VPC — Virtual Private Cloud** *(11장)*

AWS 내의 격리된 네트워크. 리전의 모든 AZ에 걸쳐 있다. IP 주소 공간(CIDR 블록)을 정의하고, 서브넷(공개 또는 프라이빗)을 만들고, 라우팅 테이블을 구성하고, 보안 그룹과 NACL을 통해 접근을 제어한다.

핵심 개념: 공개 서브넷(인터넷 게이트웨이로의 경로), 프라이빗 서브넷(아웃바운드용 NAT 게이트웨이로의 경로), 인터넷 게이트웨이(인터넷으로의 인바운드 + 아웃바운드), NAT 게이트웨이(프라이빗 인스턴스의 아웃바운드 전용), VPC 피어링(두 VPC 연결), VPC 엔드포인트(인터넷 없이 AWS 서비스에 연결).

시험 신호: "AWS에서 프라이빗 네트워크," "인터넷에서 리소스 격리," "네트워크 트래픽 제어" → VPC.

---

**보안 그룹 및 NACL** *(15장)*

보안 그룹은 인스턴스 수준의 상태가 있는 방화벽 — 허용 규칙만, 반환 트래픽은 자동. NACL(네트워크 접근 제어 목록)은 서브넷 수준의 무상태 방화벽 — 인바운드와 아웃바운드 규칙 모두 필요하며 번호 순서대로 평가됨.

시험 신호: "서브넷에서 특정 IP 차단" → NACL 거부 규칙. "인스턴스로/에서 트래픽 제어" → 보안 그룹.

---

**Route 53** *(12장)*

AWS의 DNS 서비스 및 도메인 등록기관. AWS 리소스 및 외부 엔드포인트로 인터넷 트래픽을 라우팅한다. 라우팅 정책: Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value answer.

핵심 개념: 호스팅 존(공개 및 프라이빗), 레코드 유형(A, AAAA, CNAME, Alias), 상태 확인, Traffic Flow(시각적 정책 편집기).

시험 신호: "DNS 라우팅," "리전 간 장애 조치," "지연 또는 위치 기반 라우팅" → 적절한 라우팅 정책이 있는 Route 53.

---

**CloudFront** *(13장)*

콘텐츠 전송 네트워크(CDN). 전 세계 400개 이상의 엣지 로케이션에서 콘텐츠를 캐시한다. 최종 사용자의 지연을 줄인다. 캐싱을 통해 오리진 전송 비용을 줄인다. S3, EC2, ALB, API Gateway를 오리진으로 통합한다.

핵심 개념: 배포, 오리진, 동작(오리진으로의 경로 기반 라우팅), TTL(캐시 제어), 캐시 무효화, 서명된 URL 및 쿠키(접근 제어), Lambda@Edge 및 CloudFront Functions(엣지에서 코드 실행), Origin Shield(오리진 부하 줄이기).

시험 신호: "전 세계 낮은 지연," "정적 콘텐츠 캐시," "오리진 부하 줄이기," "Shield로 DDoS 보호" → CloudFront.

---

**Direct Connect 및 VPN** *(25장)*

AWS Direct Connect는 온프레미스 데이터 센터에서 AWS로의 전용 물리적 네트워크 연결이다. 공개 인터넷을 우회한다. 더 일관된 대역폭과 지연. AWS Site-to-Site VPN은 공개 인터넷을 통한 암호화된 터널 — 더 빠른 설정, 낮은 비용, 하지만 가변 성능.

핵심 개념: Virtual Interface(VIF), Direct Connect Gateway(여러 리전에 연결), Transit Gateway(허브-앤-스포크 네트워크 토폴로지), VPN 터널 이중화.

시험 신호: "AWS에 전용 프라이빗 연결" → Direct Connect. "암호화된 연결, 더 빠른 설정" → VPN. "여러 VPC 연결" → Transit Gateway.

---

**VPC 엔드포인트** *(30장)*

공개 인터넷이나 NAT 게이트웨이 없이 프라이빗 리소스를 AWS 서비스에 연결한다. 게이트웨이 엔드포인트: 무료, S3와 DynamoDB만 가능. 인터페이스 엔드포인트(PrivateLink): 시간당 + GB당 가격, 대부분의 AWS 서비스에 사용 가능.

시험 신호: "프라이빗 서브넷의 EC2가 S3/DynamoDB 호출 — NAT 게이트웨이 비용 줄이기" → 게이트웨이 엔드포인트(무료). "프라이빗 서브넷에서 SQS, SSM, Secrets Manager에 프라이빗 연결" → 인터페이스 엔드포인트.

---

## 보안 및 신원

**IAM — Identity and Access Management** *(3장 및 14장)*

AWS 계정에서 누가 무엇을 할 수 있는지 제어한다. 사용자(장기 자격증명), 그룹(권한을 공유하는 사용자들), 역할(서비스 및 교차 계정 접근을 위한 임시 자격증명), 정책(허용/거부 규칙을 정의하는 JSON 문서).

핵심 개념: 주체, 액션, 리소스, 조건, 명시적 거부 > 명시적 허용 > 암묵적 거부, SCP(AWS Organizations의 서비스 제어 정책), 권한 경계, AssumeRole.

시험 신호: IAM은 모든 보안 질문에 관련된다. 핵심 패턴: 서비스는 IAM 역할을 사용한다(사용자가 아님). 교차 계정 접근은 역할 가정을 사용한다. 최소 권한 — 필요한 것만 부여하라.

---

**KMS — Key Management Service** *(16장)*

관리형 암호화 키 서비스. 암호화 키를 만들고, 저장하고, 제어한다. 고객 관리 키(CMK)는 교체, 사용, 접근 정책을 직접 정의할 수 있게 한다. AWS 관리 키는 자동으로 관리된다.

핵심 개념: 키 정책(IAM 정책과 별개), 봉투 암호화(데이터는 데이터 키로 암호화; 데이터 키는 CMK로 암호화), 자동 키 교체, 멀티 리전 키, Grants.

시험 신호: "저장 시 데이터 암호화," "고객 관리 암호화 키," "키 교체" → KMS.

---

**Secrets Manager** *(16장)*

민감한 값 저장 및 자동 교체: 데이터베이스 자격증명, API 키, OAuth 토큰. 자동 비밀번호 교체를 위해 RDS와 통합. 애플리케이션이 런타임에 API를 통해 시크릿을 검색 — 자격증명을 절대 하드코딩하지 마라.

시험 신호: "데이터베이스 자격증명 저장 및 교체," "하드코딩된 시크릿 피하기" → Secrets Manager. "설정 값 저장, 시크릿 아님" → Parameter Store(SSM).

---

**AWS Shield** *(17장)*

DDoS 보호. Shield Standard는 자동이고 무료 — 가장 흔한 체적 및 프로토콜 공격으로부터 보호. Shield Advanced는 재정 보호, 24/7 DDoS 대응 팀 및 자세한 공격 가시성을 추가한다.

시험 신호: "DDoS로부터 보호" → Shield Standard(자동) 또는 Shield Advanced(엔터프라이즈, SLA 포함).

---

**WAF — Web Application Firewall** *(17장)*

규칙에 따라 HTTP/HTTPS 트래픽을 필터링한다: IP 차단, 속도 제한, SQL 인젝션 패턴, XSS 패턴, 지리적 제한, 사용자 정의 규칙. CloudFront, ALB, API Gateway 또는 AppSync에 연결.

시험 신호: "특정 IP 주소 차단," "엣지에서 SQL 인젝션 방지," "API 호출 속도 제한" → WAF.

---

**GuardDuty** *(17장)*

위협 감지 서비스. ML 및 위협 인텔리전스를 사용하여 CloudTrail 로그, VPC 흐름 로그, DNS 로그를 분석한다. 비정상적인 API 활동, 알려진 악성 IP와의 통신, 침해된 자격증명을 감지한다.

시험 신호: "비정상적인 활동 감지," "침해된 IAM 자격증명 식별," "지속적인 위협 모니터링" → GuardDuty.

---

## 메시징 및 이벤트 처리

**SQS — Simple Queue Service** *(19장)*

관리형 메시지 큐. 생산자가 메시지를 보내고; 소비자가 읽고 삭제한다. 서비스를 분리한다: 발신자는 수신자가 사용 가능한지 알 필요가 없다. Standard 큐: 최소 한 번 배달, 최선을 다한 순서. FIFO 큐: 정확히 한 번 처리, 엄격한 순서.

핵심 개념: 가시성 타임아웃(처리 중 다른 소비자에게 숨겨진 메시지), Dead Letter Queue(DLQ) — 반복 실패한 메시지, 메시지 보관(기본 4일, 최대 14일), 롱 폴링(거짓 빈 응답 줄이기).

시험 신호: "서비스 분리," "부하 급증 중 요청 버퍼링," "비동기 처리" → SQS. "순서 중요하고 정확히 한 번 필요" → SQS FIFO.

---

**SNS — Simple Notification Service** *(19장)*

관리형 pub/sub 서비스. 게시자가 토픽에 메시지를 보내고; 모든 구독자가 복사본을 받는다. 팬 아웃 패턴: SNS → 여러 SQS 큐. 프로토콜: SQS, Lambda, HTTP/HTTPS, 이메일, SMS, 모바일 푸시.

핵심 개념: 토픽, 구독, 팬 아웃 패턴(SNS → 여러 SQS 큐), 메시지 필터링(구독자가 일치하는 메시지만 받는다).

시험 신호: "여러 엔드포인트에 동시에 알림 전송," "여러 소비자에게 단일 이벤트 팬 아웃" → SNS. 일반 패턴: 내구성 있는 팬 아웃을 위한 SNS + SQS.

---

**EventBridge** *(22장)*

이벤트 기반 아키텍처를 구축하기 위한 이벤트 버스. AWS 서비스, SaaS 파트너, 사용자 정의 소스에서 Lambda, SQS, SNS, Step Functions 및 기타 대상으로 이벤트를 라우팅한다. 예약 규칙(크론) 및 패턴 매칭을 지원한다.

시험 신호: "AWS 서비스에서 대상으로 이벤트 라우팅," "Lambda 함수 스케줄링," "이벤트 기반 오케스트레이션" → EventBridge.

---

**Step Functions** *(22장)*

서버리스 워크플로우 오케스트레이션. Lambda 함수, ECS 태스크, DynamoDB, SNS, SQS 및 기타 서비스를 시각적 상태 머신으로 조율한다. 재시도, 오류 처리, 병렬 브랜치, 대기 상태를 처리한다.

핵심 개념: 상태 머신, 상태 유형(Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard 워크플로우(정확히 한 번, 장기 실행) vs. Express 워크플로우(최소 한 번, 높은 볼륨).

시험 신호: "여러 Lambda 함수 오케스트레이션," "재시도 로직이 있는 장기 실행 워크플로우," "사람 승인 단계" → Step Functions.

---

**Kinesis** *(26장)*

실시간 데이터 스트리밍. Kinesis Data Streams: 내구성 있는, 순서가 있는 레코드 스트림(분산 커밋 로그처럼). 소비자가 레코드를 처리하고; 데이터는 24시간에서 7일 동안 보관된다. Kinesis Data Firehose: S3, Redshift, OpenSearch, Splunk에 완전 관리형 배달 — 소비자 관리 불필요.

핵심 개념: 샤드(처리량의 단위: 1MB/s 쓰기, 2MB/s 읽기), 파티션 키(샤드 할당 결정), 시퀀스 번호, 체크포인팅(KCL 또는 Lambda), Firehose vs. Streams.

시험 신호: "실시간 스트리밍," "순서가 있는 레코드," "이벤트 재생" → Kinesis Data Streams. "소비자를 관리하지 않고 스트리밍 데이터를 S3/Redshift에 배달" → Kinesis Firehose. SQS와 비교: Kinesis는 보관하고 재생한다; SQS는 소비 시 삭제한다.

---

## 분석

**Athena** *(26장)*

S3에 저장된 데이터에서 서버리스 SQL 쿼리. 관리할 인프라 없음. 쿼리당 지불(스캔된 TB당). 컬럼형 형식(Parquet, ORC) 및 파티션된 데이터와 가장 잘 작동한다.

시험 신호: "SQL로 S3 데이터 쿼리," "데이터 레이크에서 임시 분석," "인프라 관리 없음" → Athena.

---

**Glue** *(26장)*

서버리스 ETL(Extract, Transform, Load) 서비스. Glue Crawlers가 데이터를 발견하고 Glue Data Catalog를 업데이트한다. Glue Jobs가 Spark 또는 Python 변환을 실행한다. Data Catalog가 Athena, Redshift Spectrum 및 EMR과 통합된다.

시험 신호: "분석을 위한 데이터 변환 및 로드," "S3 데이터 스키마 발견," "ETL 파이프라인" → Glue.

---

## 고가용성 및 재해 복구

**멀티 AZ 및 멀티 리전** *(18장)*

멀티 AZ: 자동 장애 조치를 위한 리전 내 동기적 복제(RDS 멀티 AZ, AZ 전체의 로드 밸런서). RPO ~0, RDS에서 RTO ~60초. 멀티 리전: 지리적 이중화 및 전 세계 사용자에게 낮은 지연을 위한 비동기적 복제.

핵심 개념: RTO(Recovery Time Objective — 얼마나 빨리 복구), RPO(Recovery Point Objective — 얼마나 많은 데이터가 손실될 수 있음). 파일럿 라이트, 웜 스탠바이, 액티브-액티브 DR 전략.

시험 신호: AZ 수준 실패(멀티 AZ가 처리) vs. 리전 실패(멀티 리전이 처리)를 구별하라. 비용과 복잡성이 멀티 리전에서 크게 증가한다.

---

## 비용 최적화

**EC2 가격 모델** *(27장)*

온디맨드: 전가, 약정 없음. Reserved Instances(1년 또는 3년): 특정 인스턴스 유형에 대해 30-72% 할인. Savings Plans(컴퓨팅 또는 EC2 인스턴스): 유연성을 위한 약정된 시간당 지출. Spot: 중단 가능한 워크로드에 대해 60-90% 할인.

시험 신호: "예측 가능한 워크로드 비용 최소화" → Savings Plans 또는 Reserved Instances. "내고장성 배치 처리" → Spot. "예측 불가능하거나 단기" → 온디맨드.

---

**데이터 전송 가격** *(30장)*

AWS로 인바운드: 무료. 같은 AZ: 무료. 교차 AZ: 각 방향으로 $0.01/GB. 교차 리전: $0.02-0.08/GB. 인터넷(아웃바운드): ~$0.09/GB. NAT 게이트웨이 처리: $0.045/GB. CloudFront 데이터 전송은 직접 EC2-인터넷보다 저렴하고, 캐싱이 총 볼륨을 줄인다.

시험 신호: "프라이빗 서브넷에서 S3/DynamoDB로의 데이터 전송 비용 줄이기" → 게이트웨이 엔드포인트(무료). "다른 서비스에 대한 NAT 게이트웨이 비용 줄이기" → 인터페이스 엔드포인트.

---

## 관찰 가능성

**CloudWatch** *(전체에 걸쳐 참조됨)*

AWS 리소스 및 사용자 정의 애플리케이션을 위한 모니터링 및 관찰 가능성. CloudWatch Metrics: AWS 서비스 및 사용자 정의 애플리케이션에서 숫자 시계열 데이터. CloudWatch Logs: 로그 데이터를 수집, 검색, 분석. CloudWatch Alarms: 메트릭 임계값에 따라 알림 또는 자동 확장 트리거. CloudWatch Dashboards: 메트릭 시각화.

핵심 개념: 메트릭 차원, 보관 기간, 로그 그룹 및 로그 스트림, 메트릭 필터, CloudWatch Agent(EC2에서 OS 수준 메트릭 및 로그), Container Insights.

---

**CloudTrail** *(전체에 걸쳐 참조됨)*

AWS 계정에서 이루어진 모든 API 호출을 기록한다: 누가, 어디서, 언제, 결과가 무엇인지. 멀티 리전 추적은 로그를 S3에 무기한 저장한다. 보안 감사, 컴플라이언스, 사건 조사에 사용된다.

시험 신호: "누가 그 리소스를 삭제했는가?" "모든 API 활동 감사" → CloudTrail.

---

**AWS Config** *(31장에서 참조됨)*

시간이 지남에 따라 리소스 설정 변경을 추적한다. 리소스를 컴플라이언스 규칙에 대해 평가한다. 모든 리소스에 대한 모든 설정 변경의 이력을 기록한다. 수정을 위해 Systems Manager와 통합된다.

시험 신호: "이 리소스가 보안 정책을 준수하는가?" "이 리소스의 설정이 지난주에 어떻게 보였는가?" → AWS Config.

---

## Well-Architected

**여섯 가지 기둥** *(31장)*

| 기둥 | 핵심 질문 | 주요 서비스 |
|---|---|---|
| 운영 탁월성 | 잘 실행하고 있는가? | CloudWatch, CloudTrail, SSM, Config |
| 보안 | 보호받고 있는가? | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| 신뢰성 | 실패에서 복구하는가? | 멀티 AZ, Route 53 장애 조치, 백업/복원, SQS |
| 성능 효율성 | 올바른 리소스를 사용하는가? | 적절한 크기 조정, Auto Scaling, CloudFront, Kinesis |
| 비용 최적화 | 현명하게 지출하는가? | Savings Plans, Spot, S3 수명주기, VPC 엔드포인트 |
| 지속 가능성 | 환경 영향을 최소화하는가? | 적절한 크기 조정, Graviton, 효율적인 스토리지 계층 |

AWS Well-Architected Tool: 여섯 기둥에 대해 아키텍처를 평가한다. 시험 전에 사용하여 각 기둥의 질문 뒤에 있는 추론을 이해하라.
