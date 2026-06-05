# Apêndice A: Referência Rápida de Serviços AWS

Cada serviço abordado neste livro, na ordem em que foi introduzido. Use como referência de estudo e consulta rápida durante a preparação para o exame.

---

## Computação

**EC2 — Elastic Compute Cloud** *(Capítulo 4)*

Máquinas virtuais na nuvem. Você escolhe o tipo de instância (CPU, memória, armazenamento), o sistema operacional e a região. Você paga por hora (On-Demand), por compromisso (Reserved Instances / Savings Plans) ou por slot de capacidade reserva (Spot). A primitiva de computação fundamental.

Conceitos-chave: AMI (Amazon Machine Image), tipos de instância (famílias t3, m6g, r6g, c6g), pares de chaves, perfis de instância, grupos de posicionamento.

Sinal do exame: Quando um cenário requer computação persistente, com estado ou de longa duração — EC2 ou ECS. Quando um cenário requer computação de curta duração, acionada por eventos ou de custo zero em inatividade — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Capítulo 7)*

Os Auto Scaling Groups (ASGs) adicionam e removem instâncias EC2 com base na carga. Os Application Load Balancers (ALBs) distribuem o tráfego pelas instâncias e roteiam por caminho ou host. Juntos formam a camada de escalonamento horizontal.

Conceitos-chave: Template de lançamento, políticas de escalonamento (rastreamento de destino, etapas, programado), verificações de integridade, grupos de destino do ALB, regras de listener, roteamento ponderado.

Sinal do exame: "Lidar com carga variável" ou "alta disponibilidade entre AZs" → ASG + ALB.

---

**Lambda** *(Capítulo 20)*

Funções serverless. Você escreve o código; a AWS o executa em resposta a eventos. Sem servidores para gerenciar. Você paga por invocação e por milissegundo de execução. Escala automaticamente para milhares de execuções simultâneas.

Conceitos-chave: Origens de eventos (API Gateway, S3, SQS, EventBridge, Kinesis), função de execução, limites de concorrência, concorrência reservada e provisionada, cold start, Layers, duração máxima de 15 minutos.

Sinal do exame: "Serverless," "orientado a eventos," "tarefas de curta duração," "sem custo em inatividade" → Lambda.

---

**ECS — Elastic Container Service** *(Capítulo 21)*

Executa contêineres Docker na AWS. Dois tipos de lançamento: EC2 (você gerencia o host) e Fargate (a AWS gerencia o host). O ECS gerencia definições de tarefa, serviços, agendamento de cluster e integração com balanceadores de carga e descoberta de serviços.

Conceitos-chave: Definição de tarefa, serviço ECS, tipo de lançamento Fargate vs. EC2, ECR (registro de contêineres), função IAM de tarefa, auto scaling de serviço.

Sinal do exame: "Cargas de trabalho conteinerizadas," "microsserviços," "Docker na AWS" → ECS (geralmente Fargate para contêineres serverless).

---

**EKS — Elastic Kubernetes Service** *(Capítulo 21)*

Kubernetes gerenciado. A AWS executa o plano de controle; você executa os nós de trabalho (EC2 ou Fargate). Use EKS quando sua equipe já usa Kubernetes ou tem cargas de trabalho que requerem recursos específicos do Kubernetes.

Sinal do exame: "Kubernetes," "precisa migrar cargas de trabalho K8s existentes" → EKS. "Só precisa de contêineres sem sobrecarga do K8s" → ECS.

---

## Armazenamento

**S3 — Simple Storage Service** *(Capítulo 5)*

Armazenamento de objetos. Capacidade ilimitada, durabilidade de 99,999999999% (onze noves). Armazena arquivos como objetos em buckets. Os buckets ficam em uma região. Os objetos podem ter de 0 bytes a 5 TB.

Conceitos-chave: Política de bucket, ACL de objeto, versionamento, hospedagem de site estático, URLs pré-assinadas, upload multipart, Transfer Acceleration, classes de armazenamento (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Sinal do exame: "Armazenar e recuperar arquivos," "ativos estáticos," "backups," "data lake" → S3. A classe de armazenamento correta depende da frequência de acesso e da velocidade de recuperação.

---

**EBS — Elastic Block Store** *(Capítulo 6)*

Armazenamento em bloco vinculado a uma única instância EC2. Age como um disco rígido. Persiste independentemente do ciclo de vida da instância (você pode desvinculá-lo e vinculá-lo novamente). Tipos mais comuns: gp3 (SSD de uso geral, o padrão), io2 (IOPS provisionados para bancos de dados), st1 (HDD otimizado para throughput para leituras sequenciais).

Conceitos-chave: Snapshots (incrementais, armazenados no S3), criptografia (KMS), Multi-Attach (apenas io1/io2), provisionamento de IOPS e throughput.

Sinal do exame: "Armazenamento persistente para EC2," "armazenamento de banco de dados," "requer acesso de bloco de baixa latência" → EBS.

---

**EFS — Elastic File System** *(Capítulo 6)*

Sistema de arquivos compartilhado, acessível a partir de múltiplas instâncias EC2 simultaneamente. Protocolo NFS. Escala automaticamente. Mais caro do que EBS por GB. Duas classes de armazenamento: Standard e Infrequent Access. O Intelligent-Tiering move os arquivos automaticamente.

Sinal do exame: "Sistema de arquivos compartilhado," "múltiplas instâncias EC2 precisam dos mesmos arquivos," "NFS" → EFS.

---

**Classes de Armazenamento S3 e Políticas de Ciclo de Vida** *(Capítulo 23)*

O S3 Intelligent-Tiering move automaticamente os objetos entre camadas de acesso com base na frequência de acesso. As políticas de ciclo de vida fazem a transição dos objetos entre classes (Standard → Standard-IA → Glacier) com base em regras de idade. As classes de armazenamento Glacier têm atraso de recuperação variando de minutos (Glacier Instant) a 12 horas (Glacier Deep Archive).

Sinal do exame: "Reduzir custos de armazenamento para dados acessados com pouca frequência" → políticas de ciclo de vida, Intelligent-Tiering ou Glacier.

---

## Bancos de Dados

**RDS — Relational Database Service** *(Capítulo 8)*

Bancos de dados relacionais gerenciados. Motores suportados: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server e Aurora (o motor proprietário da AWS). A AWS lida com backups, patches, failover e replicação. Você gerencia o design do esquema, as consultas e o dimensionamento da instância.

Conceitos-chave: Implantação Multi-AZ (failover automático, replicação síncrona), Réplicas de Leitura (assíncronas, para escalonamento de leitura), backups automatizados (retenção de 1-35 dias), snapshots manuais (mantidos até excluídos), RDS Proxy (pool de conexões).

Sinal do exame: "Banco de dados relacional," "transações ACID," "carga de trabalho SQL existente" → RDS ou Aurora.

---

**Aurora** *(Capítulo 24)*

O motor de banco de dados relacional da AWS, compatível com MySQL e PostgreSQL. Motor de armazenamento distribuído que replica dados em 3 AZs em 6 cópias. Tipicamente 5x mais rápido do que MySQL. O Aurora Serverless v2 escala a capacidade automaticamente (medida em ACUs — Aurora Capacity Units).

Conceitos-chave: Cluster Aurora (escritor + até 15 endpoints de leitor), Aurora Global Database (réplicas de leitura entre regiões com < 1 segundo de atraso de replicação), Aurora Serverless v2.

Sinal do exame: "Banco de dados relacional de alto desempenho," "compatível com MySQL/PostgreSQL," "leituras globais," "carga de trabalho variável" → Aurora.

---

**DynamoDB** *(Capítulo 9)*

Banco de dados NoSQL totalmente gerenciado. Modelo de chave-valor e documento. Escala para qualquer throughput com desempenho de milissegundo de um dígito. Dois modos de capacidade: on-demand (pague por requisição) e provisionado (pague por unidade de capacidade por hora, com Auto Scaling).

Conceitos-chave: Chave de partição (obrigatória), chave de ordenação (opcional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (captura de dados de alteração), DynamoDB Accelerator (DAX) — cache na memória, TTL (Time to Live), transações.

Sinal do exame: "Acesso baseado em chave de alto throughput," "esquema flexível," "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Capítulo 10)*

Cache na memória gerenciado. Dois motores: Redis (persistente, pub/sub, scripts Lua, estruturas de dados) e Memcached (cache puro, mais simples, multi-threaded). Use para reduzir a carga do banco de dados e servir dados lidos com frequência em microssegundos.

Conceitos-chave: Padrão cache-aside, padrão write-through, políticas de evição, TTL, modo cluster (Redis), Multi-AZ com failover automático.

Sinal do exame: "Reduzir a carga do banco de dados," "latência de leitura sub-milissegundo," "gerenciamento de sessões," "placar em tempo real" → ElastiCache Redis.

---

## Rede

**VPC — Virtual Private Cloud** *(Capítulo 11)*

Uma rede isolada dentro da AWS. Abrange todas as AZs em uma região. Você define o espaço de endereço IP (bloco CIDR), cria sub-redes (públicas ou privadas), configura tabelas de rotas e controla o acesso via grupos de segurança e NACLs.

Conceitos-chave: Sub-rede pública (rota para o Internet Gateway), sub-rede privada (rota para o NAT Gateway para saída), Internet Gateway (entrada + saída para a internet), NAT Gateway (apenas saída para instâncias privadas), VPC Peering (conectar duas VPCs), VPC Endpoints (conectar a serviços AWS sem internet).

Sinal do exame: "Rede privada na AWS," "isolar recursos da internet," "controlar tráfego de rede" → VPC.

---

**Grupos de Segurança e NACLs** *(Capítulo 15)*

Os grupos de segurança são firewalls com estado no nível de instância — apenas regras de permissão, o tráfego de retorno é automático. As NACLs (Network Access Control Lists) são firewalls sem estado no nível de sub-rede — requerem regras de entrada e saída, avaliadas em ordem pelo número da regra.

Sinal do exame: "Bloquear um IP específico de acessar a sub-rede" → NACL. "Controlar tráfego de/para uma instância" → grupo de segurança.

---

**Route 53** *(Capítulo 12)*

O serviço DNS e registrador de domínios da AWS. Roteia o tráfego da internet para recursos AWS e endpoints externos. Políticas de roteamento: Simples, Ponderado, Baseado em Latência, Failover, Geolocalização, Geoproximidade, Resposta de múltiplos valores.

Conceitos-chave: Zonas hospedadas (públicas e privadas), tipos de registro (A, AAAA, CNAME, Alias), verificações de integridade, Traffic Flow (editor visual de políticas).

Sinal do exame: "Roteamento DNS," "failover entre regiões," "roteamento baseado em latência ou localização" → Route 53 com a política de roteamento adequada.

---

**CloudFront** *(Capítulo 13)*

Rede de Entrega de Conteúdo (CDN). Armazena conteúdo em cache em locais de borda (mais de 400 no mundo todo). Reduz a latência para os usuários finais. Reduz os custos de transferência de origem por meio do cache. Integra-se com S3, EC2, ALB e API Gateway como origens.

Conceitos-chave: Distribuição, origens, comportamentos (roteamento baseado em caminho para origens), TTL (controle de cache), invalidação de cache, URLs e cookies assinados (controle de acesso), Lambda@Edge e CloudFront Functions (executar código na borda), Origin Shield (reduzir a carga de origem).

Sinal do exame: "Baixa latência global," "armazenar conteúdo estático em cache," "reduzir a carga de origem," "proteger contra DDoS com Shield" → CloudFront.

---

**Direct Connect e VPN** *(Capítulo 25)*

O AWS Direct Connect é uma conexão de rede física dedicada do seu data center on-premises para a AWS. Ignora a internet pública. Largura de banda e latência mais consistentes. A AWS Site-to-Site VPN é um túnel criptografado pela internet pública — configuração mais rápida, menor custo, mas desempenho variável.

Conceitos-chave: Virtual Interface (VIF), Direct Connect Gateway (conectar a múltiplas regiões), Transit Gateway (topologia de rede hub-and-spoke), redundância de túnel VPN.

Sinal do exame: "Conexão privada dedicada à AWS" → Direct Connect. "Conexão criptografada, configuração mais rápida" → VPN. "Conectar múltiplas VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Capítulo 30)*

Conecta recursos privados a serviços AWS sem usar a internet pública ou o NAT Gateway. Gateway Endpoints: gratuito, disponível apenas para S3 e DynamoDB. Interface Endpoints (PrivateLink): cobrado por hora + por GB, disponível para a maioria dos serviços AWS.

Sinal do exame: "EC2 em sub-rede privada chama S3/DynamoDB — reduzir os custos do NAT Gateway" → Gateway Endpoint (gratuito). "Conexão privada para SQS, SSM, Secrets Manager a partir de sub-rede privada" → Interface Endpoint.

---

## Segurança e Identidade

**IAM — Identity and Access Management** *(Capítulos 3 e 14)*

Controla quem pode fazer o quê na sua conta AWS. Usuários (credenciais de longo prazo), Grupos (usuários compartilhando permissões), Funções (credenciais temporárias para serviços e acesso entre contas), Políticas (documentos JSON definindo regras de permissão/negação).

Conceitos-chave: Principal, Ação, Recurso, Condição, negação explícita > permissão explícita > negação implícita, SCP (Service Control Policy nas AWS Organizations), Limite de permissão, AssumeRole.

Sinal do exame: O IAM está envolvido em toda pergunta de segurança. Padrão-chave: os serviços usam funções IAM (não usuários). O acesso entre contas usa suposição de função. Mínimo privilégio — conceda apenas o que é necessário.

---

**KMS — Key Management Service** *(Capítulo 16)*

Serviço de chave de criptografia gerenciado. Cria, armazena e controla chaves criptográficas. As chaves gerenciadas pelo cliente (CMKs) permitem definir políticas de rotação, uso e acesso. As chaves gerenciadas pela AWS são gerenciadas automaticamente.

Conceitos-chave: Política de chave (separada da política IAM), criptografia de envelope (dados criptografados com uma chave de dados; chave de dados criptografada com CMK), rotação automática de chaves, chaves multirregionais, Concessões.

Sinal do exame: "Criptografar dados em repouso," "chaves de criptografia gerenciadas pelo cliente," "rotação de chaves" → KMS.

---

**Secrets Manager** *(Capítulo 16)*

Armazena e rotaciona automaticamente valores confidenciais: credenciais de banco de dados, chaves de API, tokens OAuth. Integra-se com o RDS para rotação automática de senha. As aplicações recuperam segredos em tempo de execução via API — nunca deixe credenciais no código.

Sinal do exame: "Armazenar e rotacionar credenciais de banco de dados," "evitar segredos no código" → Secrets Manager. "Armazenar valores de configuração, não segredos" → Parameter Store (SSM).

---

**AWS Shield** *(Capítulo 17)*

Proteção contra DDoS. O Shield Standard é automático e gratuito — protege contra ataques volumétricos e de protocolo comuns. O Shield Advanced adiciona proteção financeira, equipe de resposta a DDoS 24/7 e visibilidade detalhada de ataques.

Sinal do exame: "Proteger contra DDoS" → Shield Standard (automático) ou Shield Advanced (empresarial, com SLA).

---

**WAF — Web Application Firewall** *(Capítulo 17)*

Filtra tráfego HTTP/HTTPS com base em regras: bloqueio de IP, limites de taxa, padrões de injeção SQL, padrões XSS, restrições geográficas, regras personalizadas. Vincula-se ao CloudFront, ALB, API Gateway ou AppSync.

Sinal do exame: "Bloquear endereços IP específicos," "prevenir injeção SQL na borda," "limitar taxa de chamadas de API" → WAF.

---

**GuardDuty** *(Capítulo 17)*

Serviço de detecção de ameaças. Analisa logs do CloudTrail, VPC Flow Logs e logs DNS usando ML e inteligência de ameaças. Detecta atividade incomum de API, comunicação com IPs maliciosos conhecidos, credenciais comprometidas.

Sinal do exame: "Detectar atividade incomum," "identificar credenciais IAM comprometidas," "monitoramento contínuo de ameaças" → GuardDuty.

---

## Mensagens e Processamento de Eventos

**SQS — Simple Queue Service** *(Capítulo 19)*

Fila de mensagens gerenciada. Os produtores enviam mensagens; os consumidores as leem e excluem. Desacopla serviços: o remetente não precisa saber se o receptor está disponível. Filas Standard: entrega ao-menos-uma-vez, ordenação de melhor esforço. Filas FIFO: processamento exatamente-uma-vez, ordenação estrita.

Conceitos-chave: Timeout de visibilidade (mensagem oculta de outros consumidores durante o processamento), Dead Letter Queue (DLQ) para mensagens que falham repetidamente, retenção de mensagens (4 dias por padrão, até 14), long polling (reduzir respostas vazias).

Sinal do exame: "Desacoplar serviços," "tamponar requisições durante picos de carga," "processamento assíncrono" → SQS. "A ordem importa e exatamente-uma-vez é necessário" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capítulo 19)*

Serviço pub/sub gerenciado. Os publicadores enviam uma mensagem para um tópico; todos os assinantes recebem uma cópia. Padrão fan-out: uma mensagem → muitos consumidores. Protocolos: SQS, Lambda, HTTP/HTTPS, e-mail, SMS, push mobile.

Conceitos-chave: Tópico, assinatura, padrão fan-out (SNS → múltiplas filas SQS), filtragem de mensagens (os assinantes recebem apenas as mensagens correspondentes).

Sinal do exame: "Enviar notificações para múltiplos endpoints simultaneamente," "distribuir um único evento para múltiplos consumidores" → SNS. Padrão comum: SNS + SQS para fan-out durável.

---

**EventBridge** *(Capítulo 22)*

Barramento de eventos para construir arquiteturas orientadas a eventos. Roteia eventos de serviços AWS, parceiros SaaS e fontes personalizadas para Lambda, SQS, SNS, Step Functions e outros destinos. Suporta regras agendadas (cron) e correspondência de padrões.

Sinal do exame: "Rotear eventos de serviços AWS para destinos," "agendar funções Lambda," "orquestração orientada a eventos" → EventBridge.

---

**Step Functions** *(Capítulo 22)*

Orquestração de fluxos de trabalho serverless. Coordena funções Lambda, tarefas ECS, DynamoDB, SNS, SQS e outros serviços em máquinas de estados visuais. Lida com novas tentativas, tratamento de erros, ramificações paralelas e estados de espera.

Conceitos-chave: Máquina de estados, tipos de estado (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Fluxos de trabalho Standard (exatamente-uma-vez, longa duração) vs. Fluxos de trabalho Express (ao-menos-uma-vez, alto volume).

Sinal do exame: "Orquestrar múltiplas funções Lambda," "fluxos de trabalho de longa duração com lógica de nova tentativa," "etapas de aprovação humana" → Step Functions.

---

**Kinesis** *(Capítulo 26)*

Streaming de dados em tempo real. Kinesis Data Streams: stream durável e ordenado de registros (como um log de commit distribuído). Os consumidores processam registros; os dados são retidos de 24 horas a 7 dias. Kinesis Data Firehose: entrega gerenciada para S3, Redshift, OpenSearch, Splunk — sem necessidade de gerenciamento de consumidores.

Conceitos-chave: Shard (unidade de throughput: 1 MB/s de escrita, 2 MB/s de leitura), chave de partição (determina a atribuição de shard), número de sequência, checkpointing (KCL ou Lambda), Firehose vs. Streams.

Sinal do exame: "Streaming em tempo real," "registros ordenados," "reproduzir eventos" → Kinesis Data Streams. "Entregar dados de streaming para S3/Redshift sem gerenciar consumidores" → Kinesis Firehose. Contraste com SQS: o Kinesis retém e reproduz; o SQS exclui no consumo.

---

## Análise

**Athena** *(Capítulo 26)*

Consultas SQL serverless em dados armazenados no S3. Sem infraestrutura para gerenciar. Pague por consulta (por TB verificado). Melhor com formatos colunares (Parquet, ORC) e dados particionados.

Sinal do exame: "Consultar dados S3 com SQL," "análise ad-hoc em data lake," "sem gerenciamento de infraestrutura" → Athena.

---

**Glue** *(Capítulo 26)*

Serviço ETL (Extração, Transformação, Carregamento) serverless. Os Glue Crawlers descobrem dados e atualizam o Glue Data Catalog. Os Glue Jobs executam transformações Spark ou Python. O Data Catalog integra-se com Athena, Redshift Spectrum e EMR.

Sinal do exame: "Transformar e carregar dados para análise," "descobrir esquema de dados S3," "pipeline ETL" → Glue.

---

## Alta Disponibilidade e Recuperação de Desastres

**Multi-AZ e Multi-Region** *(Capítulo 18)*

Multi-AZ: replicação síncrona dentro de uma região para failover automático (RDS Multi-AZ, balanceador de carga entre AZs). RPO ~0, RTO ~60s para RDS. Multi-Region: replicação assíncrona para redundância geográfica e menor latência para usuários globais.

Conceitos-chave: RTO (Recovery Time Objective — quanto tempo para se recuperar), RPO (Recovery Point Objective — quanta perda de dados é aceitável). Estratégias de DR Pilot Light, Warm Standby, Active-Active.

Sinal do exame: Distinguir entre falhas no nível de AZ (Multi-AZ lida) vs. falhas regionais (Multi-Region lida). O custo e a complexidade aumentam significativamente com Multi-Region.

---

## Otimização de Custos

**Modelos de Preços EC2** *(Capítulo 27)*

On-Demand: preço integral, sem compromisso. Reserved Instances (1 ou 3 anos): desconto de 30-72% para tipo de instância específico. Savings Plans (Compute ou EC2 Instance): gasto horário comprometido para flexibilidade. Spot: 60-90% de desconto para cargas de trabalho interrompíveis.

Sinal do exame: "Minimizar custo para carga de trabalho previsível" → Savings Plans ou Reserved Instances. "Processamento em lote tolerante a falhas" → Spot. "Imprevisível ou curto prazo" → On-Demand.

---

**Preços de Transferência de Dados** *(Capítulo 30)*

Entrada para a AWS: gratuito. Mesma AZ: gratuito. Entre AZs: US$ 0,01/GB em cada direção. Entre regiões: US$ 0,02-0,08/GB. Internet (saída): ~US$ 0,09/GB. Processamento do NAT Gateway: US$ 0,045/GB. A transferência de dados do CloudFront é mais barata do que EC2 para internet direto, e o cache reduz o volume total.

Sinal do exame: "Reduzir custos de transferência de dados para S3/DynamoDB a partir de sub-rede privada" → Gateway Endpoints (gratuitos). "Reduzir custos do NAT Gateway para outros serviços" → Interface Endpoints.

---

## Observabilidade

**CloudWatch** *(referenciado ao longo do livro)*

Monitoramento e observabilidade. Métricas CloudWatch: dados de série temporal numérica de serviços AWS e aplicações personalizadas. Logs CloudWatch: coletar, pesquisar e analisar dados de log. Alarmes CloudWatch: acionar notificações ou auto scaling com base em limites de métricas. Painéis CloudWatch: visualizar métricas.

Conceitos-chave: Dimensões de métrica, períodos de retenção, grupos de log e streams de log, filtros de métricas, CloudWatch Agent (para métricas no nível do SO e logs do EC2), Container Insights.

---

**CloudTrail** *(referenciado ao longo do livro)*

Registra cada chamada de API feita na sua conta AWS: quem a fez, de onde, quando e qual foi a resposta. A trilha multi-região armazena logs no S3 indefinidamente. Usado para auditoria de segurança, conformidade e investigação de incidentes.

Sinal do exame: "Quem excluiu aquele recurso?" "Auditar toda a atividade de API" → CloudTrail.

---

**AWS Config** *(referenciado no Capítulo 31)*

Rastreia as alterações de configuração de recursos ao longo do tempo. Avalia os recursos em relação a regras de conformidade. Registra o histórico de cada alteração de configuração para cada recurso. Integra-se com o Systems Manager para remediação.

Sinal do exame: "Este recurso está em conformidade com nossa política de segurança?" "Como era a configuração desse recurso na semana passada?" → AWS Config.

---

## Well-Architected

**Os Seis Pilares** *(Capítulo 31)*

| Pilar                      | Pergunta central                            | Serviços-chave                                      |
|----------------------------|---------------------------------------------|-----------------------------------------------------|
| Excelência Operacional     | Estamos operando bem?                       | CloudWatch, CloudTrail, SSM, Config                 |
| Segurança                  | Estamos protegidos?                         | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager   |
| Confiabilidade             | Nos recuperamos de falhas?                  | Multi-AZ, failover Route 53, backup/restore, SQS    |
| Eficiência de Desempenho   | Estamos usando os recursos certos?          | Dimensionamento correto, Auto Scaling, CloudFront, Kinesis |
| Otimização de Custos       | Estamos gastando com sabedoria?             | Savings Plans, Spot, ciclo de vida S3, VPC Endpoints |
| Sustentabilidade           | Estamos minimizando o impacto ambiental?    | Dimensionamento correto, Graviton, camadas de armazenamento eficientes |

Well-Architected Tool da AWS: avalia sua arquitetura em relação aos seis pilares. Use antes do exame para entender o raciocínio por trás das perguntas de cada pilar.
