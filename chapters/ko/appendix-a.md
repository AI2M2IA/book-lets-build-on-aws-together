# 부록 A: AWS 서비스 빠른 참조

이 책에서 다룬 모든 서비스를 소개된 순서대로 정리했습니다. 학습 참고 자료이자 시험 준비 중 빠르게 찾아보는 용도로 사용하십시오.

---

## 컴퓨팅

**EC2 — Elastic Compute Cloud** *(4장)*

클라우드의 가상 머신입니다. 인스턴스 유형(CPU, 메모리, 스토리지), 운영 체제, 리전을 선택합니다. 시간당 요금(On-Demand), 약정 요금(Reserved Instances / Savings Plans), 또는 여분 용량 슬롯 요금(Spot)으로 비용을 지불합니다. 가장 기본이 되는 컴퓨팅 기본 요소입니다.

핵심 개념: AMI(Amazon Machine Image), 인스턴스 유형(t3, m6g, r6g, c6g 패밀리), 키 페어, 인스턴스 프로파일, 배치 그룹.

시험 신호: 시나리오가 영구적이거나 상태가 있거나 장기 실행되는 컴퓨팅을 요구할 때 — EC2 또는 ECS. 짧은 기간, 이벤트 트리거, 또는 유휴 비용이 없는 컴퓨팅을 요구할 때 — Lambda.

---

**Auto Scaling + Application Load Balancer** *(7장)*

Auto Scaling 그룹(ASG)은 부하에 따라 EC2 인스턴스를 추가하고 제거합니다. Application Load Balancer(ALB)는 인스턴스에 트래픽을 분산하고 경로 또는 호스트 기준으로 라우팅합니다. 이 둘이 함께 수평 확장 계층을 형성합니다.

핵심 개념: 시작 템플릿, 확장 정책(대상 추적, 단계, 예약), 상태 확인, ALB 대상 그룹, 리스너 규칙, 가중치 기반 라우팅.

시험 신호: "가변 부하 처리" 또는 "여러 AZ에 걸친 고가용성" → ASG + ALB.

---

**Lambda** *(20장)*

서버리스 함수입니다. 코드를 작성하면 AWS가 이벤트에 응답하여 실행합니다. 관리할 서버가 없습니다. 호출당, 그리고 실행 밀리초당 비용을 지불합니다. 수천 개의 동시 실행으로 자동 확장됩니다.

핵심 개념: 이벤트 소스(API Gateway, S3, SQS, EventBridge, Kinesis), 실행 역할, 동시성 제한, 예약 동시성 및 프로비저닝된 동시성, 콜드 스타트, 레이어, 최대 15분 실행 시간.

시험 신호: "서버리스", "이벤트 기반", "짧은 기간 작업", "유휴 비용 없음" → Lambda.

---

**ECS — Elastic Container Service** *(21장)*

AWS에서 Docker 컨테이너를 실행합니다. 두 가지 시작 유형이 있습니다. EC2(호스트를 직접 관리)와 Fargate(AWS가 호스트를 관리). ECS는 태스크 정의, 서비스, 클러스터 스케줄링, 로드 밸런서 및 서비스 검색과의 통합을 관리합니다.

핵심 개념: 태스크 정의, ECS 서비스, Fargate 대 EC2 시작 유형, ECR(컨테이너 레지스트리), 태스크 IAM 역할, 서비스 Auto Scaling.

시험 신호: "컨테이너화된 워크로드", "마이크로서비스", "AWS에서 Docker" → ECS(서버리스 컨테이너의 경우 보통 Fargate).

---

**EKS — Elastic Kubernetes Service** *(21장)*

관리형 Kubernetes입니다. AWS가 컨트롤 플레인을 운영하고, 여러분은 워커 노드(EC2 또는 Fargate)를 운영합니다. 팀이 이미 Kubernetes를 사용하고 있거나 Kubernetes 고유 기능이 필요한 워크로드가 있을 때 EKS를 사용하십시오.

시험 신호: "Kubernetes", "기존 K8s 워크로드를 마이그레이션해야 함" → EKS. "K8s 오버헤드 없이 컨테이너만 필요" → ECS.

---

**AWS Batch** *(21장)*

Docker 컨테이너를 위한 관리형 배치 컴퓨팅입니다. 작업(Docker 이미지 + 명령어), 작업 대기열, 컴퓨팅 환경(EC2 또는 Fargate)을 정의합니다. AWS Batch는 컴퓨팅을 자동으로 프로비저닝하고 확장한 뒤 작업이 끝나면 종료합니다. 비용 절감을 위해 Spot 인스턴스를 지원합니다.

핵심 개념: 작업 정의(무엇을 실행할지), 작업 대기열(작업이 대기하는 곳), 컴퓨팅 환경(EC2 또는 Fargate, On-Demand 또는 Spot), 배열 작업(동일한 작업을 여러 개 병렬로 실행).

시험 신호: "Lambda의 15분 제한 시간을 초과하는 배치 처리", "컨테이너에서 실행하는 유한한 컴퓨팅 작업", "AWS에서의 HPC 워크로드" → AWS Batch.

---

**AWS Outposts** *(2장)*

여러분의 데이터 센터나 코로케이션 시설에 설치되는 완전 관리형 AWS 하드웨어 랙입니다. 퍼블릭 클라우드와 동일한 AWS 서비스, API, 도구(EC2, EBS, RDS, EKS, Outposts의 S3)를 실행하지만 물리적으로는 온프레미스에 있습니다.

핵심 개념: 온프레미스에서 동일한 AWS API, AWS가 설치 및 패치 관리, 고객이 랙 공간과 전력 제공, 로컬 게이트웨이(LGW)가 Outposts를 온프레미스 네트워크에 연결.

시험 신호: "자체 데이터 센터에서 AWS 실행", "데이터 레지던시로 인해 컴퓨팅이 온프레미스에 머물러야 함", "인터넷 의존성 없는 AWS API" → Outposts.

---

**AWS Wavelength** *(2장)*

5G 통신 사업자의 네트워크 내부에 배포되는 AWS 인프라입니다. Wavelength Zone은 5G 네트워크 엣지에 위치하여 모바일 디바이스에 한 자릿수 밀리초 지연 시간을 제공합니다.

핵심 개념: Wavelength Zone은 통신 네트워크 내 AWS 리전의 확장이며, 디바이스와 Wavelength Zone 사이의 트래픽은 통신사 네트워크에 머무릅니다.

시험 신호: "5G 모바일 사용자에게 한 자릿수 밀리초 지연 시간", "모바일 AR/VR", "모바일 실시간 게임", "자율주행 차량 텔레메트리" → Wavelength.

---

**AWS Application Migration Service(MGN)** *(25장)*

리호스트(리프트 앤 시프트) 마이그레이션 서비스입니다. 에이전트가 소스 서버의 디스크를 블록 단위로 AWS의 저비용 스테이징 영역에 복제합니다. 필요에 따라 테스트 복사본을 실행하고, 전환 시점에 MGN이 복제된 서버를 네이티브 EC2 인스턴스로 변환합니다. 애플리케이션 변경이 필요 없습니다.

핵심 개념: 블록 수준 연속 복제, 스테이징 영역, 전환 전 테스트 실행, "7가지 R" 마이그레이션 전략(MGN = 리호스트).

시험 신호: "코드 변경 없이 수백 개의 VM을 빠르게 마이그레이션", "서버를 EC2로 리프트 앤 시프트" → MGN. DataSync는 *파일*을 옮기고, DMS는 *데이터베이스*를 옮기며, MGN은 *서버 전체*를 옮깁니다.

---

## 스토리지

**S3 — Simple Storage Service** *(5장)*

객체 스토리지입니다. 무제한 용량, 99.999999999%(11개의 9) 내구성을 제공합니다. 파일을 버킷에 객체로 저장합니다. 버킷은 리전에 존재합니다. 객체 크기는 0바이트부터 5TB까지 가능합니다.

핵심 개념: 버킷 정책, 객체 ACL, 버전 관리, 정적 웹사이트 호스팅, 사전 서명된 URL, 멀티파트 업로드, Transfer Acceleration, 스토리지 클래스(Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, 그리고 단일 AZ의 지연 시간이 중요한 디렉터리 버킷 워크로드를 위한 S3 Express One Zone).

시험 신호: "파일 저장 및 검색", "정적 자산", "백업", "데이터 레이크" → S3. 올바른 스토리지 클래스는 접근 빈도와 검색 속도에 따라 달라집니다.

---

**EBS — Elastic Block Store** *(6장)*

단일 EC2 인스턴스에 연결되는 블록 스토리지입니다. 하드 드라이브처럼 작동합니다. 인스턴스 수명 주기와 독립적으로 지속됩니다(분리하고 다시 연결할 수 있음). 가장 일반적인 유형: gp3(범용 SSD, 기본값), io2(데이터베이스용 프로비저닝된 IOPS), st1(순차 읽기용 처리량 최적화 HDD).

핵심 개념: 스냅샷(증분식, S3에 저장), 암호화(KMS), 다중 연결(io1/io2만), IOPS 및 처리량 프로비저닝.

시험 신호: "EC2를 위한 영구 스토리지", "데이터베이스 스토리지", "낮은 지연 시간의 블록 접근 필요" → EBS.

---

**EFS — Elastic File System** *(6장)*

여러 EC2 인스턴스에서 동시에 접근할 수 있는 공유 파일 시스템입니다. NFS 프로토콜을 사용합니다. 자동으로 확장됩니다. GB당 비용은 EBS보다 비쌉니다. 스토리지 클래스에는 Standard, Infrequent Access, Archive가 있습니다. Intelligent-Tiering이 파일을 자동으로 이동합니다.

시험 신호: "공유 파일 시스템", "여러 EC2 인스턴스가 동일한 파일을 필요로 함", "NFS" → EFS.

---

**FSx 패밀리** *(6장)*

이름이 붙은 기술을 위한 관리형 파일 서버입니다. FSx for Windows File Server: SMB 프로토콜, NTFS, Active Directory 통합, Multi-AZ. FSx for Lustre: HPC/ML을 위한 병렬 고성능 파일 시스템, S3 객체를 파일로 표현(지연 로딩). FSx for NetApp ONTAP: 다중 프로토콜(NFS + SMB + iSCSI), 스냅샷, SnapMirror 복제. FSx for OpenZFS: 낮은 지연 시간의 NFS, 즉각적인 스냅샷 및 쓰기 가능한 복제본.

시험 신호: "SMB/Active Directory" → FSx for Windows. "S3 데이터에 대한 HPC/ML 훈련" → FSx for Lustre. "동일한 데이터에 NFS와 SMB / NetApp 마이그레이션" → FSx for ONTAP. "ZFS 마이그레이션 / 즉각적인 복제본" → FSx for OpenZFS.

---

**S3 스토리지 클래스 및 수명 주기 정책** *(23장)*

S3 Intelligent-Tiering은 접근 빈도에 따라 객체를 접근 계층 간에 자동으로 이동합니다. 수명 주기 정책은 수명 규칙에 따라 객체를 클래스 간에 전환합니다(Standard → Standard-IA → Glacier). Glacier 스토리지 클래스는 검색 지연 시간이 밀리초(Glacier Instant Retrieval)에서 12시간(Glacier Deep Archive)까지 다양합니다.

시험 신호: "자주 접근하지 않는 데이터의 스토리지 비용 절감" → 수명 주기 정책, Intelligent-Tiering, 또는 Glacier.

---

**AWS Storage Gateway** *(6장)*

온프레미스 환경을 AWS 스토리지에 연결하는 하이브리드 스토리지 서비스입니다. 애플리케이션이 이미 이해하는 프로토콜로 스토리지를 제공하면서 데이터는 S3, S3 Glacier, 또는 EBS 스냅샷으로 유지합니다.

핵심 개념: File Gateway(NFS/SMB → S3), Volume Gateway(iSCSI, 캐시 또는 저장 모드), Tape Gateway(가상 테이프 라이브러리 → Glacier).

시험 신호: "온프레미스 애플리케이션이 코드 변경 없이 클라우드 스토리지가 필요함" → Storage Gateway. "테이프 백업 대체" → Tape Gateway.

---

**AWS DataSync** *(25장)*

에이전트 기반의 데이터 마이그레이션 및 복제 서비스입니다. 경량 에이전트가 NFS 또는 SMB를 통해 온프레미스 파일 서버에 연결하고 공유를 S3, EFS, 또는 FSx로 동기화합니다. 스케줄링, 대역폭 제한, 무결성 검증이 기본 내장되어 있습니다.

핵심 개념: DataSync 에이전트(온프레미스 VM 또는 EC2), NFS/SMB 소스, S3/EFS/FSx 대상, 예약된 증분 전송.

시험 신호: "온프레미스 NAS에서 AWS로 많은 양의 파일을 네트워크를 통해 마이그레이션하거나 지속적으로 동기화" → DataSync.

---

**AWS Transfer Family** *(25장)*

S3 또는 EFS를 스토리지 대상으로 사용하는 완전 관리형 SFTP, FTPS, FTP 서버입니다. 클라이언트는 기존 SFTP 소프트웨어로 연결하고, 업로드된 파일은 버킷이나 파일 시스템에 직접 저장됩니다.

핵심 개념: 관리형 엔드포인트(선택적으로 정적 IP 포함), S3 또는 EFS 백업 스토리지, 외부 파트너를 위한 기존 프로토콜 호환성.

시험 신호: "파트너는 계속 SFTP로 업로드해야 하지만 파일은 S3에 저장되어야 함" → Transfer Family.

---

**AWS Snow Family** *(25장)*

오프라인 대량 데이터 마이그레이션을 위한 물리적 데이터 전송 디바이스입니다. Snowball Edge Storage Optimized: 사용 가능 용량 80TB, 견고한 외함, 여러분의 위치로 배송됩니다. 로컬에서 데이터를 적재한 뒤 다시 배송하여 S3로 수집합니다.

핵심 개념: 먼저 전송 계산을 하십시오. 네트워크 전송에 대략 일주일 이상이 걸린다면 물리적 디바이스가 유리합니다. *레거시 참고(2026)*: AWS는 이 패밀리를 단계적으로 폐기해 왔습니다. Snowmobile(2024)과 Snowcone(2024년 말)은 사라졌고, Snow 디바이스는 2025년 11월에 신규 고객에게 중단되었습니다(AWS는 이제 DataSync와 Data Transfer Terminals를 안내합니다). SAA-C03 문제 은행은 이 변화보다 이전이므로 시험은 여전히 Snowball을 정답으로 기대합니다.

시험 신호: "페타바이트 규모 마이그레이션", "제한된 대역폭, 수 주간의 전송 시간" → Snow Family.

---

**AWS Backup** *(18장 및 23장)*

EBS, RDS, DynamoDB, EFS, Storage Gateway 전반에 걸친 중앙 집중식 정책 기반 백업 서비스입니다. 백업 계획이 일정과 보존 기간을 정의하고, 볼트가 복구 지점을 저장합니다.

핵심 개념: 백업 계획 및 볼트, 교차 리전 및 교차 계정 복사, 불변성을 위한 Vault Lock.

시험 신호: "여러 AWS 서비스 전반의 백업을 중앙화하고 자동화", "랜섬웨어/계정 침해 보호를 위한 교차 계정 백업 복사본" → AWS Backup.

---

## 데이터베이스

**RDS — Relational Database Service** *(8장)*

관리형 관계형 데이터베이스입니다. 지원 엔진: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora(AWS 독자 엔진). AWS가 백업, 패치, 장애 조치, 복제를 처리합니다. 여러분은 스키마 설계, 쿼리, 인스턴스 크기 조정을 관리합니다.

핵심 개념: Multi-AZ 배포(자동 장애 조치, 동기식 복제), 읽기 전용 복제본(비동기식, 읽기 확장용), 자동 백업(1~35일 보존), 수동 스냅샷(삭제할 때까지 유지), RDS Proxy(연결 풀링).

시험 신호: "관계형 데이터베이스", "ACID 트랜잭션", "기존 SQL 워크로드" → RDS 또는 Aurora.

---

**Aurora** *(24장)*

MySQL 및 PostgreSQL과 호환되는 AWS의 관계형 데이터베이스 엔진입니다. 분산 스토리지 엔진으로 데이터를 3개 AZ에 걸쳐 6개 복사본으로 복제합니다. 일반적으로 MySQL보다 5배 빠릅니다. Aurora Serverless v2는 용량을 자동으로 확장하며(ACU — Aurora Capacity Unit 단위로 측정), 지원되는 엔진 버전에서는 열린 연결이 없을 때 0 ACU로 자동 일시 중지할 수 있습니다.

핵심 개념: Aurora 클러스터(라이터 + 단일 리더 엔드포인트 뒤의 최대 15개 Aurora 복제본), Aurora Global Database(복제 지연 1초 미만의 교차 리전 읽기 전용 복제본), Aurora Serverless v2, ACU, 자동 일시 중지/재개 동작.

시험 신호: "고성능 관계형 데이터베이스", "MySQL/PostgreSQL 호환", "글로벌 읽기", "가변 워크로드" → Aurora.

---

**DynamoDB** *(9장)*

완전 관리형 NoSQL 데이터베이스입니다. 키-값 및 문서 모델을 사용합니다. 한 자릿수 밀리초 성능으로 어떤 처리량으로든 확장됩니다. 두 가지 용량 모드: 온디맨드(요청당 지불)와 프로비저닝(시간당 용량 단위 지불, Auto Scaling 포함).

핵심 개념: 파티션 키(필수), 정렬 키(선택), 글로벌 보조 인덱스(GSI), 로컬 보조 인덱스(LSI), DynamoDB Streams(변경 데이터 캡처), DynamoDB Accelerator(DAX) — 인메모리 캐시, TTL(Time to Live), 트랜잭션.

시험 신호: "키 기반의 높은 처리량 접근", "유연한 스키마", "서버리스 NoSQL" → DynamoDB.

---

**ElastiCache** *(10장)*

관리형 인메모리 캐싱입니다. 두 가지 엔진: Redis(영속성, 게시/구독, Lua 스크립팅, 데이터 구조)와 Memcached(순수 캐시, 더 단순, 멀티스레드). 데이터베이스 부하를 줄이고 자주 읽는 데이터를 마이크로초 단위로 제공하는 데 사용합니다.

핵심 개념: 캐시 어사이드 패턴, 라이트 스루 패턴, 제거 정책, TTL, 클러스터 모드(Redis), 자동 장애 조치를 갖춘 Multi-AZ.

시험 신호: "데이터베이스 부하 감소", "1밀리초 미만 읽기 지연 시간", "세션 관리", "실시간 리더보드" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(10장)*

내구성을 갖춘 Redis 호환 인메모리 기본 데이터베이스입니다. ElastiCache(데이터 손실이 허용되는 캐시)와 달리 MemoryDB는 Multi-AZ 트랜잭션 로그를 저장하고 내구성을 보장합니다. MemoryDB를 기본 데이터베이스로 사용할 수 있습니다. 다른 데이터베이스 앞단의 캐시일 뿐만이 아닙니다.

핵심 개념: Redis API 호환성, Multi-AZ 트랜잭션 로그(내구성 보장), 인메모리 성능, 기본 데이터베이스(캐시 계층 아님).

시험 신호: "Redis 호환이면서 데이터 손실이 허용되지 않음", "내구성 있는 인메모리 데이터베이스" → MemoryDB. "캐시로서의 Redis, 데이터 손실 허용" → ElastiCache Redis.

---

**목적별 데이터베이스** *(9장, 10장, 24장)*

데이터 형태를 엔진에 맞추십시오. DocumentDB: MongoDB 호환 문서. Neptune: 그래프 데이터베이스(관계, 순회 — Gremlin/SPARQL). Keyspaces: Cassandra 호환 와이드 컬럼. Timestream: 시계열(현재 제공: Timestream for InfluxDB). MemoryDB: 내구성 있는 Redis 호환 *기본* 데이터베이스(ElastiCache = 캐시). QLDB("불변의 암호화 원장")는 2025년에 중단되었으므로 레거시 함정으로 취급하십시오.

시험 신호: "소셜 그래프 / 추천 / 사기 조직 탐지" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "시간에 따른 IoT 텔레메트리" → Timestream.

---

**AWS DMS — Database Migration Service** *(8장)*

최소 다운타임으로 데이터베이스를 AWS로 마이그레이션합니다. 전체 로드(초기 복사)와 더불어 마이그레이션이 진행되는 동안 소스와 대상을 동기화 상태로 유지하는 CDC(Change Data Capture)를 지원합니다. 동일한 엔진 유형 간 마이그레이션(MySQL → MySQL, PostgreSQL → PostgreSQL)에서는 DMS를 직접 사용합니다. 서로 다른 엔진 유형 간 마이그레이션(Oracle → Aurora PostgreSQL)에서는 먼저 AWS Schema Conversion Tool(SCT)로 스키마를 변환한 다음 데이터에 DMS를 사용합니다.

핵심 개념: 복제 인스턴스, 소스 및 대상 엔드포인트, 전체 로드 + CDC, 이기종 마이그레이션을 위한 SCT(Schema Conversion Tool).

시험 신호: "최소 다운타임으로 데이터베이스 마이그레이션" → DMS. "Oracle에서 Aurora로" 또는 모든 이기종 마이그레이션 → SCT + DMS. "동일 엔진, 동일 유형" → DMS 직접.

---

## 네트워킹

**VPC — Virtual Private Cloud** *(11장)*

AWS 내의 격리된 네트워크입니다. 한 리전의 모든 AZ에 걸쳐 있습니다. IP 주소 공간(CIDR 블록)을 정의하고, 서브넷(퍼블릭 또는 프라이빗)을 만들고, 라우팅 테이블을 구성하며, 보안 그룹과 NACL로 접근을 제어합니다.

핵심 개념: 퍼블릭 서브넷(Internet Gateway로의 경로), 프라이빗 서브넷(아웃바운드를 위한 NAT Gateway로의 경로), Internet Gateway(인터넷으로의 인바운드 + 아웃바운드), NAT Gateway(프라이빗 인스턴스의 아웃바운드 전용), VPC 피어링(두 VPC 연결), VPC 엔드포인트(인터넷 없이 AWS 서비스에 연결).

시험 신호: "AWS의 프라이빗 네트워크", "인터넷으로부터 리소스 격리", "네트워크 트래픽 제어" → VPC.

---

**보안 그룹 및 NACL** *(15장)*

보안 그룹은 인스턴스 수준의 상태 저장(stateful) 방화벽입니다. 허용 규칙만 있고, 반환 트래픽은 자동으로 처리됩니다. NACL(Network Access Control List)은 서브넷 수준의 상태 비저장(stateless) 방화벽입니다. 인바운드와 아웃바운드 규칙이 모두 필요하며, 규칙 번호 순서대로 평가됩니다.

시험 신호: "특정 IP가 서브넷에 접근하지 못하도록 차단" → NACL. "인스턴스로/에서의 트래픽 제어" → 보안 그룹.

---

**Route 53** *(12장)*

AWS의 DNS 서비스이자 도메인 등록 대행 서비스입니다. 인터넷 트래픽을 AWS 리소스와 외부 엔드포인트로 라우팅합니다. 라우팅 정책: 단순, 가중치, 지연 시간 기반, 장애 조치, 지리적 위치, 지리 근접, 다중값 응답.

핵심 개념: 호스팅 영역(퍼블릭 및 프라이빗), 레코드 유형(A, AAAA, CNAME, Alias), 상태 확인, Traffic Flow(시각적 정책 편집기 — 지리 근접은 조정 가능한 바이어스와 함께 레코드의 직접 라우팅 정책으로도 사용할 수 있으며 Traffic Flow가 필요하지 않다는 점에 유의).

시험 신호: "DNS 라우팅", "리전 간 장애 조치", "지연 시간 또는 위치 기반 라우팅" → 적절한 라우팅 정책을 사용한 Route 53.

---

**CloudFront** *(13장)*

콘텐츠 전송 네트워크(CDN)입니다. 엣지 로케이션(전 세계 750개 이상의 접속 지점)에 콘텐츠를 캐싱합니다. 최종 사용자의 지연 시간을 줄입니다. 캐싱을 통해 오리진 전송 비용을 줄입니다. S3, EC2, ALB, API Gateway를 오리진으로 통합합니다.

핵심 개념: 배포, 오리진, 동작(오리진으로의 경로 기반 라우팅), TTL(캐시 제어), 캐시 무효화, 서명된 URL 및 쿠키(접근 제어), Lambda@Edge 및 CloudFront Functions(엣지에서 코드 실행), Origin Shield(오리진 부하 감소).

시험 신호: "글로벌 저지연", "정적 콘텐츠 캐싱", "오리진 부하 감소", "Shield로 DDoS 방어" → CloudFront.

---

**Direct Connect 및 VPN** *(25장)*

AWS Direct Connect는 온프레미스 데이터 센터에서 AWS로 연결되는 전용 물리 네트워크 연결입니다. 퍼블릭 인터넷을 우회합니다. 더 일관된 대역폭과 지연 시간을 제공합니다. AWS Site-to-Site VPN은 퍼블릭 인터넷을 통한 암호화된 터널입니다. 설정이 더 빠르고 비용이 낮지만 성능이 가변적입니다.

핵심 개념: 가상 인터페이스(VIF), Direct Connect Gateway(여러 리전에 연결), Transit Gateway(허브 앤 스포크 네트워크 토폴로지), VPN 터널 이중화.

시험 신호: "AWS로의 전용 프라이빗 연결" → Direct Connect. "암호화된 연결, 빠른 설정" → VPN. "여러 VPC 연결" → Transit Gateway.

---

**VPC 엔드포인트** *(30장)*

퍼블릭 인터넷이나 NAT Gateway를 사용하지 않고 프라이빗 리소스를 AWS 서비스에 연결합니다. 게이트웨이 엔드포인트: 무료, S3와 DynamoDB에만 사용 가능. 인터페이스 엔드포인트(PrivateLink): 시간당 + GB당 요금, 대부분의 AWS 서비스에 사용 가능.

시험 신호: "프라이빗 서브넷의 EC2가 S3/DynamoDB를 호출 — NAT Gateway 비용 절감" → 게이트웨이 엔드포인트(무료). "프라이빗 서브넷에서 SQS, SSM, Secrets Manager로의 프라이빗 연결" → 인터페이스 엔드포인트.

---

**AWS Client VPN** *(11장)*

개별 디바이스(노트북, 워크스테이션)가 인터넷을 통해 VPC에 안전하게 연결할 수 있게 하는 관리형 OpenVPN 엔드포인트입니다. 인증 옵션: Active Directory, 자격 증명 공급자와의 SAML 2.0 페더레이션, 또는 상호 TLS(인증서 기반). 스플릿 터널(VPC 대상 트래픽만 터널을 통과)과 풀 터널(모든 트래픽이 AWS를 통해 라우팅)을 지원합니다.

핵심 개념: Client VPN 엔드포인트, 대상 네트워크(VPC 서브넷 연결), 권한 부여 규칙, 스플릿 터널 대 풀 터널.

시험 신호: "원격 엔지니어가 집에서 VPC에 안전하게 접근해야 함", "개별 디바이스에서 VPC로의 연결" → Client VPN. 대조: Site-to-Site VPN = 네트워크 대 네트워크. Client VPN = 디바이스 대 네트워크.

---

**Network Load Balancer(NLB) 및 Gateway Load Balancer(GWLB)** *(7장)*

NLB는 계층 4(TCP/UDP/TLS)에서 작동합니다. HTTP 검사 없이 극도로 빠른 속도로 패킷을 라우팅합니다 — 초당 수백만 건의 요청, AZ당 정적 IP, 소스 IP 보존. GWLB는 계층 3에서 작동하며 단 하나의 목적을 위해 존재합니다 — 타사 가상 네트워크 어플라이언스(방화벽, IDS/IPS, 심층 패킷 검사)를 트래픽 흐름에 인라인으로 삽입하는 것.

핵심 개념: NLB = 계층 4, 정적 IP, 초저지연, 비 HTTP 프로토콜. GWLB = 계층 3, GENEVE 캡슐화, 단일 진입점 뒤의 어플라이언스 플릿. ALB = 계층 7(경로/호스트 라우팅).

시험 신호: "초당 수백만 건의 TCP 요청", "로드 밸런서용 정적 IP", "소스 IP 보존" → NLB. "트래픽 경로에 타사 보안 어플라이언스 삽입" → GWLB.

---

**AWS Global Accelerator** *(25장)*

사용자 트래픽을 퍼블릭 인터넷을 거치는 대신 가장 가까운 엣지 로케이션에서 AWS의 프라이빗 글로벌 백본으로 라우팅합니다. 하나 이상의 리전에 있는 ALB, NLB, 또는 EC2 인스턴스 앞단에 두 개의 정적 Anycast IP 주소를 제공합니다. *동적*(캐시 불가) 트래픽의 지연 시간과 일관성을 개선합니다.

핵심 개념: 정적 Anycast IP, AWS 백본으로의 엣지 온보딩, 상태 확인 기반의 초 단위 리전 장애 조치, 트래픽 다이얼이 있는 엔드포인트 그룹.

시험 신호: "글로벌 사용자, 동적/비 HTTP 트래픽, 정적 IP, 빠른 리전 장애 조치" → Global Accelerator. "캐시 가능/정적 콘텐츠" → 대신 CloudFront.

---

## 보안 및 자격 증명

**IAM — Identity and Access Management** *(3장 및 14장)*

AWS 계정에서 누가 무엇을 할 수 있는지 제어합니다. 사용자(장기 자격 증명), 그룹(권한을 공유하는 사용자들), 역할(서비스 및 교차 계정 접근을 위한 임시 자격 증명), 정책(허용/거부 규칙을 정의하는 JSON 문서).

핵심 개념: 보안 주체(Principal), 작업(Action), 리소스(Resource), 조건(Condition), 명시적 거부 > 명시적 허용 > 암시적 거부, SCP(AWS Organizations의 Service Control Policy), 권한 경계, AssumeRole.

시험 신호: IAM은 모든 보안 문제에 관련됩니다. 핵심 패턴: 서비스는 IAM 역할을 사용합니다(사용자가 아님). 교차 계정 접근은 역할 수임을 사용합니다. 최소 권한 — 필요한 것만 부여합니다.

---

**KMS — Key Management Service** *(16장)*

관리형 암호화 키 서비스입니다. 암호화 키를 생성, 저장, 제어합니다. 고객 관리형 키(CMK)는 회전, 사용, 접근 정책을 정의할 수 있게 합니다. AWS 관리형 키는 자동으로 관리됩니다.

핵심 개념: 키 정책(IAM 정책과 별개), 봉투 암호화(데이터는 데이터 키로 암호화, 데이터 키는 CMK로 암호화), 자동 키 회전, 다중 리전 키, 권한 부여(Grant).

시험 신호: "저장 데이터 암호화", "고객 관리형 암호화 키", "키 회전" → KMS.

---

**Secrets Manager** *(16장)*

민감한 값을 저장하고 자동으로 회전합니다: 데이터베이스 자격 증명, API 키, OAuth 토큰. 자동 비밀번호 회전을 위해 RDS와 통합됩니다. 애플리케이션은 런타임에 API를 통해 비밀을 검색합니다 — 자격 증명을 절대 하드코딩하지 마십시오.

시험 신호: "데이터베이스 자격 증명 저장 및 회전", "하드코딩된 비밀 회피" → Secrets Manager. "비밀이 아닌 구성 값 저장" → Parameter Store(SSM).

---

**AWS Shield** *(17장)*

DDoS 방어입니다. Shield Standard는 자동이며 무료입니다 — 일반적인 볼류메트릭 및 프로토콜 공격을 방어합니다. Shield Advanced는 재정적 보호, 연중무휴 DDoS 대응 팀, 상세한 공격 가시성을 추가합니다.

시험 신호: "DDoS 방어" → Shield Standard(자동) 또는 Shield Advanced(SLA가 있는 엔터프라이즈).

---

**WAF — Web Application Firewall** *(17장)*

규칙에 따라 HTTP/HTTPS 트래픽을 필터링합니다: IP 차단, 속도 제한, SQL 인젝션 패턴, XSS 패턴, 지리적 제한, 사용자 지정 규칙. CloudFront, ALB, API Gateway, 또는 AppSync에 연결됩니다.

시험 신호: "특정 IP 주소 차단", "엣지에서 SQL 인젝션 방지", "API 호출 속도 제한" → WAF.

---

**GuardDuty** *(17장)*

위협 탐지 서비스입니다. ML과 위협 인텔리전스를 사용하여 CloudTrail 로그, VPC 흐름 로그, DNS 로그를 분석합니다. 비정상적인 API 활동, 알려진 악성 IP와의 통신, 침해된 자격 증명을 탐지합니다.

시험 신호: "비정상 활동 탐지", "침해된 IAM 자격 증명 식별", "지속적인 위협 모니터링" → GuardDuty.

---

**Amazon Inspector** *(17장)*

자동화된 취약점 평가 서비스입니다. EC2 인스턴스, Amazon ECR 컨테이너 이미지, Lambda 함수를 소프트웨어 취약점(CVE)과 의도하지 않은 네트워크 노출에 대해 지속적으로 스캔합니다. 결과는 중앙 관리를 위해 AWS Security Hub로 전송됩니다.

핵심 개념: CVE 스캐닝, 지속적(일회성 아님) 평가, EC2 + ECR + Lambda 적용 범위, Security Hub 통합.

시험 신호: "알려진 취약점에 대해 EC2를 자동으로 스캔", "컨테이너 이미지의 CVE 스캐닝", "지속적인 취약점 평가" → Inspector.

---

**Amazon Cognito** *(14장)*

애플리케이션 최종 사용자를 위한 관리형 인증 — 직접 구축할 필요가 없는 사용자 디렉터리입니다. User Pool은 가입, 로그인, MFA, 비밀번호 재설정, 소셜 자격 증명 공급자(Google, Facebook, 모든 OIDC 공급자)를 처리하며 애플리케이션이 검증하는 JWT를 발급합니다. Identity Pool은 이러한 토큰을 임시 AWS 자격 증명으로 교환합니다.

핵심 개념: User Pool(인증, JWT) 대 Identity Pool(임시 AWS 자격 증명), 호스팅 UI, 소셜/OIDC/SAML 페더레이션, API Gateway Cognito 권한 부여자.

시험 신호: "애플리케이션에 사용자 가입/로그인 필요", "소셜 로그인", "모바일 앱 사용자에게 AWS 리소스에 대한 임시 접근 권한 부여" → Cognito. 대조: IAM은 엔지니어와 서비스를 위한 것이고, Cognito는 고객을 위한 것입니다.

---

**AWS Certificate Manager(ACM)** *(16장)*

AWS 관리형 서비스(ALB, CloudFront, API Gateway)를 위한 무료 퍼블릭 TLS/SSL 인증서를 프로비저닝하고 전체 수명 주기를 처리합니다 — 갱신 달력도, 프라이빗 키 처리도 없습니다. DNS 검증을 통해 자동 갱신됩니다.

핵심 개념: DNS 대 이메일 검증, 자동 갱신, CloudFront용 인증서는 us-east-1에 있어야 함, 무료 퍼블릭 인증서는 내보낼 수 없음(2025년부터 유료 내보내기 가능 옵션 존재).

시험 신호: "로드 밸런서 또는 CDN의 HTTPS", "자동 인증서 갱신" → ACM.

---

**Amazon Macie** *(17장)*

S3를 위한 민감한 데이터 검색입니다. 머신 러닝과 패턴 매칭을 사용하여 버킷에서 PII(이름, 카드 번호, 자격 증명)를 찾고 퍼블릭 노출과 같은 접근 위험을 표시합니다. GuardDuty를 보완합니다: GuardDuty는 동작을 감시하고, Macie는 저장된 것을 감사합니다.

핵심 개념: 관리형 데이터 식별자(PII 패턴), S3 전용 범위, Security Hub/EventBridge로의 결과.

시험 신호: "S3에서 PII 검색", "민감한 데이터 노출 식별" → Macie.

---

**AWS Control Tower** *(14장)*

다중 계정 환경의 설정과 거버넌스를 자동화합니다. 랜딩 존을 생성합니다 — Organizations, CloudTrail, Config, 가드레일이 사전 연결된 관리, 로그 아카이브, 감사 계정을 — 며칠간의 수동 작업 대신 몇 분 만에.

핵심 개념: 랜딩 존, 가드레일(예방적 = SCP, 탐지적 = Config 규칙), 표준화된 신규 계정을 위한 Account Factory.

시험 신호: "모범 사례를 갖춘 새 다중 계정 환경을 자동으로 설정하고 관리" → Control Tower. 대조: Organizations는 원시 구성 요소이고, Control Tower는 자동화된 조립입니다.

---

## 메시징 및 이벤트 처리

**SQS — Simple Queue Service** *(19장)*

관리형 메시지 대기열입니다. 생산자가 메시지를 보내고 소비자가 읽고 삭제합니다. 서비스를 분리합니다: 송신자는 수신자가 사용 가능한지 알 필요가 없습니다. 표준 대기열: 최소 1회 전달, 최선의 순서 보장. FIFO 대기열: 정확히 1회 처리, 엄격한 순서.

핵심 개념: 가시성 제한 시간(처리 중인 동안 다른 소비자로부터 메시지 숨김), 반복적으로 실패하는 메시지를 위한 데드 레터 큐(DLQ), 메시지 보존(기본 4일, 최대 14일), 롱 폴링(빈 응답 감소), 기본 최대 페이로드 256KB(2025년부터 1 MiB까지 상향 가능, 더 큰 페이로드는 Extended Client Library가 본문을 S3에 저장).

시험 신호: "서비스 분리", "부하 급증 시 요청 버퍼링", "비동기 처리" → SQS. "순서가 중요하고 정확히 1회가 필요함" → SQS FIFO.

---

**SNS — Simple Notification Service** *(19장)*

관리형 게시/구독 서비스입니다. 게시자가 토픽에 메시지를 보내면 모든 구독자가 복사본을 받습니다. 팬아웃 패턴: 하나의 메시지 → 여러 소비자. 프로토콜: SQS, Lambda, HTTP/HTTPS, 이메일, SMS, 모바일 푸시.

핵심 개념: 토픽, 구독, 팬아웃 패턴(SNS → 여러 SQS 대기열), 메시지 필터링(구독자는 일치하는 메시지만 받음).

시험 신호: "여러 엔드포인트에 동시에 알림 전송", "단일 이벤트를 여러 소비자에게 팬아웃" → SNS. 일반적인 패턴: 내구성 있는 팬아웃을 위한 SNS + SQS.

---

**EventBridge** *(22장)*

이벤트 기반 아키텍처를 구축하기 위한 이벤트 버스입니다. AWS 서비스, SaaS 파트너, 사용자 지정 소스의 이벤트를 Lambda, SQS, SNS, Step Functions 및 기타 대상으로 라우팅합니다. 예약 규칙(cron)과 패턴 매칭을 지원합니다.

시험 신호: "AWS 서비스의 이벤트를 대상으로 라우팅", "Lambda 함수 예약", "이벤트 기반 오케스트레이션" → EventBridge.

---

**Step Functions** *(22장)*

서버리스 워크플로 오케스트레이션입니다. Lambda 함수, ECS 태스크, DynamoDB, SNS, SQS 및 기타 서비스를 시각적 상태 머신으로 조정합니다. 재시도, 오류 처리, 병렬 분기, 대기 상태를 처리합니다.

핵심 개념: 상태 머신, 상태 유형(Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), 표준 워크플로(정확히 1회, 장기 실행) 대 익스프레스 워크플로: 비동기식(최소 1회, 대용량 — 작업을 멱등하게 설계) 및 동기식(최대 1회, API 호출처럼 결과를 직접 반환).

시험 신호: "여러 Lambda 함수 오케스트레이션", "재시도 로직이 있는 장기 실행 워크플로", "사람의 승인 단계" → Step Functions.

---

**Kinesis** *(26장)*

실시간 데이터 스트리밍입니다. Kinesis Data Streams: 내구성 있고 순서가 보장된 레코드 스트림(분산 커밋 로그와 유사). 소비자가 레코드를 처리하며, 데이터는 24시간(기본)에서 365일(Extended Data Retention 사용)까지 보존됩니다. Amazon Data Firehose(이전 Kinesis Data Firehose): S3, Redshift, OpenSearch, Splunk로의 완전 관리형 전송 — 소비자 관리 불필요.

핵심 개념: 샤드(처리량 단위: 쓰기 1MB/s, 읽기 2MB/s), 파티션 키(샤드 할당 결정), 시퀀스 번호, 체크포인팅(KCL 또는 Lambda), Firehose 대 Streams.

시험 신호: "실시간 스트리밍", "순서가 보장된 레코드", "이벤트 재생" → Kinesis Data Streams. "소비자 관리 없이 스트리밍 데이터를 S3/Redshift로 전송" → Amazon Data Firehose(오래된 문제는 "Kinesis Data Firehose"라고 표현할 수 있음). "스트리밍 데이터에 대한 SQL" → Amazon Managed Service for Apache Flink(이전 Kinesis Data Analytics). SQS와 대조: Kinesis는 보존하고 재생하며, SQS는 소비 시 삭제합니다.

---

**Amazon MQ** *(19장)*

Apache ActiveMQ와 RabbitMQ를 지원하는 관리형 메시지 브로커 서비스입니다. 업계 표준 메시징 프로토콜을 지원합니다: AMQP, STOMP, MQTT, OpenWire, WebSocket. 주요 사용 사례는 온프레미스 메시지 브로커 워크로드의 리프트 앤 시프트 마이그레이션입니다 — 이미 ActiveMQ나 RabbitMQ를 사용하는 애플리케이션은 코드 변경 없이 연결할 수 있습니다.

핵심 개념: ActiveMQ 대 RabbitMQ 엔진 선택, 프로토콜 지원(AMQP/STOMP/MQTT), HA를 위한 단일 인스턴스 또는 액티브/스탠바이 브로커 구성.

시험 신호: "온프레미스 ActiveMQ 또는 RabbitMQ를 애플리케이션 코드 변경 없이 AWS로 마이그레이션" → Amazon MQ. "신규 AWS 네이티브 메시징" → SQS 또는 SNS(더 단순하고 확장성 높음).

---

## 분석

**Athena** *(26장)*

S3에 저장된 데이터에 대한 서버리스 SQL 쿼리입니다. 관리할 인프라가 없습니다. 쿼리당 지불(스캔된 TB당). 컬럼형 형식(Parquet, ORC)과 파티셔닝된 데이터에 가장 적합합니다.

시험 신호: "SQL로 S3 데이터 쿼리", "데이터 레이크에 대한 임시 분석", "인프라 관리 없음" → Athena.

---

**Glue** *(26장)*

서버리스 ETL(추출, 변환, 적재) 서비스입니다. Glue 크롤러가 데이터를 검색하고 Glue Data Catalog를 업데이트합니다. Glue 작업은 Spark 또는 Python 변환을 실행합니다. Data Catalog는 Athena, Redshift Spectrum, EMR과 통합됩니다.

시험 신호: "분석을 위한 데이터 변환 및 적재", "S3 데이터의 스키마 검색", "ETL 파이프라인" → Glue.

---

**Amazon QuickSight** *(26장)*

관리형 비즈니스 인텔리전스 및 데이터 시각화 서비스입니다. 가져온 데이터를 캐싱하여 빠른 대시보드 렌더링을 제공하는 인메모리 엔진인 SPICE(Super-fast, Parallel, In-memory Calculation Engine)를 사용합니다. Athena, S3, Redshift, RDS 및 기타 AWS 데이터 소스에 연결됩니다. 관리할 BI 서버가 없습니다.

핵심 개념: SPICE(인메모리 엔진), 데이터셋, 분석, 대시보드, ML Insights(이상 탐지, 예측), 행 수준 및 열 수준 보안.

시험 신호: "서버 관리 없이 AWS에서 BI 대시보드", "Athena 또는 Redshift의 데이터 시각화" → QuickSight.

---

**AWS Lake Formation** *(26장)*

S3와 Glue Data Catalog 위에 있는 중앙 집중식 데이터 레이크 접근 제어 계층입니다. 테이블, 열, 행 수준에서 세분화된 권한을 제공합니다 — S3 버킷 정책만으로는 불가능한 수준입니다. 보안 데이터 레이크 설정을 단순화합니다: Lake Formation이 권한 모델을 처리하고, Glue가 카탈로그를 처리하며, S3가 데이터를 보유합니다.

핵심 개념: 데이터 레이크 권한(테이블/열/행 수준), Glue Data Catalog 통합, 속성 기반 접근 제어를 위한 LF-태그, Athena 및 Redshift Spectrum 쿼리를 위한 중앙 집중식 부여/취소.

시험 신호: "데이터 레이크에 대한 세분화된 접근 제어", "S3 데이터에 대한 열 수준 또는 행 수준 보안" → Lake Formation.

---

## 고가용성 및 재해 복구

**Multi-AZ 및 Multi-Region** *(18장)*

Multi-AZ: 자동 장애 조치를 위한 리전 내 동기식 복제(RDS Multi-AZ, AZ 전체에 걸친 로드 밸런서). RDS의 경우 RPO ~0, RTO ~60초. Multi-Region: 지리적 이중화와 글로벌 사용자를 위한 낮은 지연 시간을 위한 비동기식 복제.

핵심 개념: RTO(Recovery Time Objective — 복구까지 걸리는 시간), RPO(Recovery Point Objective — 손실 가능한 데이터의 양). Pilot Light, Warm Standby, Active-Active DR 전략.

시험 신호: AZ 수준 장애(Multi-AZ가 처리)와 리전 수준 장애(Multi-Region이 처리)를 구분하십시오. Multi-Region은 비용과 복잡성이 크게 증가합니다.

---

**AWS Elastic Disaster Recovery(DRS)** *(18장)*

서버(온프레미스 또는 EC2)를 위한 관리형 재해 복구입니다. 소스 서버를 블록 단위로 저비용 스테이징 영역에 지속적으로 복제하고 필요할 때 몇 분 만에 전체 복구 인스턴스를 실행합니다 — 관리형 파일럿 라이트로, 백업 및 복원에 가까운 가격으로 거의 웜 스탠바이 수준의 복구 시간을 제공합니다.

핵심 개념: 연속 블록 수준 복제, 저비용 스테이징 영역, 온디맨드 복구 실행, 특정 시점 복구.

시험 신호: "관리형 DR 서비스로 서버 기반 워크로드의 다운타임과 데이터 손실 최소화", "직접 구축하지 않는 파일럿 라이트" → DRS.

---

## 비용 최적화

**EC2 가격 모델** *(27장)*

On-Demand: 전액, 약정 없음. Reserved Instances(1년 또는 3년): 특정 인스턴스 유형에 대해 30~72% 할인. Savings Plans(Compute 또는 EC2 Instance): 유연성을 위한 약정 시간당 지출. Spot: 중단 가능한 워크로드에 대해 60~90% 할인.

시험 신호: "예측 가능한 워크로드의 비용 최소화" → Savings Plans 또는 Reserved Instances. "내결함성 배치 처리" → Spot. "예측 불가능하거나 단기" → On-Demand.

---

**데이터 전송 가격** *(30장)*

AWS로의 인바운드: 무료. 동일 AZ: 무료. 교차 AZ: 각 방향당 GB당 $0.01. 교차 리전: GB당 $0.02~0.08. 인터넷(아웃바운드): GB당 약 $0.09. NAT Gateway 처리: GB당 $0.045. CloudFront 데이터 전송은 EC2에서 인터넷으로 직접 전송하는 것보다 저렴하며, 캐싱이 총량을 줄입니다.

시험 신호: "프라이빗 서브넷에서 S3/DynamoDB로의 데이터 전송 비용 절감" → 게이트웨이 엔드포인트(무료). "다른 서비스의 NAT Gateway 비용 절감" → 인터페이스 엔드포인트.

---

## 가관측성

**CloudWatch** *(책 전반에서 참조)*

모니터링 및 가관측성입니다. CloudWatch 지표: AWS 서비스와 사용자 지정 애플리케이션의 수치 시계열 데이터. CloudWatch Logs: 로그 데이터 수집, 검색, 분석. CloudWatch 경보: 지표 임계값에 따라 알림이나 Auto Scaling 트리거. CloudWatch 대시보드: 지표 시각화.

핵심 개념: 지표 차원, 보존 기간, 로그 그룹 및 로그 스트림, 지표 필터, CloudWatch 에이전트(EC2의 OS 수준 지표 및 로그용), Container Insights.

---

**CloudTrail** *(책 전반에서 참조)*

AWS 계정에서 이루어진 모든 API 호출을 기록합니다: 누가, 어디서, 언제 호출했고 응답이 무엇이었는지. 다중 리전 추적은 로그를 S3에 무기한 저장합니다. 보안 감사, 규정 준수, 인시던트 조사에 사용됩니다.

시험 신호: "누가 그 리소스를 삭제했는가?", "모든 API 활동 감사" → CloudTrail.

---

**X-Ray** *(20장)*

분산 추적: 개별 요청을 서비스 전반에 걸쳐 추적하고(추적 → 세그먼트 → 하위 세그먼트), 각 홉별 지연 시간과 오류율이 포함된 서비스 맵을 구축합니다. 샘플링이 오버헤드를 낮게 유지하고, 주석으로 추적을 검색 가능하게 만듭니다. 활성 추적은 Lambda와 API Gateway 스테이지에서 켤 수 있습니다.

시험 신호: "마이크로서비스 전반의 요청 추적", "서비스 간 병목 지점 찾기" → X-Ray(CloudWatch도 CloudTrail도 아님).

---

**AWS Config** *(31장에서 참조)*

시간에 따른 리소스 구성 변경을 추적합니다. 규정 준수 규칙에 대해 리소스를 평가합니다. 모든 리소스의 모든 구성 변경 이력을 기록합니다. 수정을 위해 Systems Manager와 통합됩니다.

시험 신호: "이 리소스가 우리 보안 정책을 준수하는가?", "지난주에 이 리소스의 구성은 어땠는가?" → AWS Config.

---

## Well-Architected

**여섯 가지 기둥** *(31장)*

| 기둥                   | 핵심 질문                          | 핵심 서비스                                         |
|------------------------|------------------------------------|---------------------------------------------------|
| 운영 우수성            | 우리는 잘 운영되고 있는가?         | CloudWatch, CloudTrail, SSM, Config               |
| 보안                   | 우리는 보호받고 있는가?            | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| 안정성                 | 우리는 장애에서 복구하는가?        | Multi-AZ, Route 53 장애 조치, 백업/복원, SQS      |
| 성능 효율성            | 우리는 적절한 리소스를 쓰고 있는가? | 적정 크기 조정, Auto Scaling, CloudFront, Kinesis |
| 비용 최적화            | 우리는 현명하게 지출하고 있는가?   | Savings Plans, Spot, S3 수명 주기, VPC 엔드포인트 |
| 지속 가능성            | 우리는 환경 영향을 최소화하는가?   | 적정 크기 조정, Graviton, 효율적 스토리지 계층    |

AWS Well-Architected Tool: 여섯 가지 기둥에 대해 아키텍처를 평가합니다. 시험 전에 사용하여 각 기둥의 질문 뒤에 있는 추론을 이해하십시오.
