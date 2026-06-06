# Apêndice B: Mapa de Domínios do SAA-C03

O exame AWS Solutions Architect Associate (SAA-C03) é organizado em quatro domínios. Este apêndice mapeia cada capítulo do livro ao domínio e à tarefa relevantes, para que você possa estudar por área de exame em vez de pela ordem dos capítulos.

---

## Visão Geral dos Domínios

| Domínio                                         | Peso | Descrição                                            |
|-------------------------------------------------|------|------------------------------------------------------|
| Domínio 1: Projetar Arquiteturas Seguras        | 30%  | IAM, segurança de rede, proteção de dados            |
| Domínio 2: Projetar Arquiteturas Resilientes    | 26%  | Alta disponibilidade, tolerância a falhas, recuperação de desastres |
| Domínio 3: Projetar Arquiteturas de Alto Desempenho | 24% | Desempenho de computação, armazenamento, banco de dados e rede |
| Domínio 4: Projetar Arquiteturas Otimizadas em Custo | 20% | Modelos de preços, gestão de custos, otimização de recursos |

---

## Domínio 1: Projetar Arquiteturas Seguras (30%)

**Tarefa 1.1 — Projetar acesso seguro a recursos AWS**

Conceitos centrais: usuários, grupos, funções e políticas do IAM. Princípio do menor privilégio. Acesso entre contas. Funções de serviço. SCP (Service Control Policies) nas AWS Organizations.

| Capítulo   | Tópico                                                                       |
|------------|------------------------------------------------------------------------------|
| Capítulo 3  | Fundamentos do IAM: usuários, grupos, funções, políticas, avaliação de políticas |
| Capítulo 14 | IAM avançado: funções para serviços, permission boundaries, funções entre contas |
| Capítulo 3  | Lógica de avaliação de políticas: negação explícita > permissão explícita > negação implícita |
| Capítulo 14 | AWS Organizations, SCPs, Control Tower, Account Factory                      |
| Capítulo 14 | Cognito: User Pools (login de app, JWTs) e Identity Pools (credenciais AWS temporárias) |

Padrões-chave do exame:

- "EC2 precisa acessar o S3 sem credenciais fixas no código" → função IAM com política de S3 anexada ao instance profile do EC2
- "Contas diferentes precisam compartilhar recursos" → função IAM com política de confiança entre contas
- "Impedir que todos os usuários IAM em uma OU acessem um serviço" → SCP nas AWS Organizations

---

**Tarefa 1.2 — Projetar cargas de trabalho e aplicações seguras**

Conceitos centrais: design de VPC, grupos de segurança vs. NACLs, isolamento de rede, proteção contra DDoS, WAF, GuardDuty.

| Capítulo   | Tópico                                                                                     |
|------------|--------------------------------------------------------------------------------------------|
| Capítulo 11 | Design de VPC: sub-redes públicas/privadas, NAT Gateway, Internet Gateway, tabelas de rotas |
| Capítulo 15 | Grupos de segurança (com estado, nível de instância) vs. NACLs (sem estado, nível de sub-rede) |
| Capítulo 17 | Shield (DDoS), WAF (firewall de aplicação), GuardDuty (detecção de ameaças), Inspector (verificação de CVE) |
| Capítulo 17 | Macie: descoberta de dados sensíveis no S3 (PII, credenciais)                              |
| Capítulo 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                          |

Padrões-chave do exame:

- "Bloquear um IP específico na sub-rede" → regra de negação na NACL
- "Permitir HTTP de entrada, permitir automaticamente a resposta HTTP de saída" → grupo de segurança (com estado)
- "Proteger aplicação web contra injeção de SQL" → WAF com regra de injeção de SQL
- "Detectar credenciais IAM comprometidas" → GuardDuty

---

**Tarefa 1.3 — Determinar controles apropriados de segurança de dados**

Conceitos centrais: criptografia em repouso e em trânsito, KMS, Secrets Manager, Parameter Store, criptografia do lado do servidor do S3.

| Capítulo   | Tópico                                                                   |
|------------|--------------------------------------------------------------------------|
| Capítulo 16 | KMS: chaves gerenciadas pelo cliente, rotação de chaves, criptografia de envelope |
| Capítulo 16 | Secrets Manager: rotação automática de credenciais, recuperação de segredos em tempo de execução |
| Capítulo 16 | ACM (AWS Certificate Manager): certificados SSL/TLS para ALB, CloudFront |
| Capítulo 5  | Opções de criptografia do S3: SSE-S3, SSE-KMS, SSE-C                     |
| Capítulo 8  | Criptografia em repouso do RDS (deve ser habilitada na criação)         |

Padrões-chave do exame:

- "Rotacionar credenciais de banco de dados automaticamente" → Secrets Manager com integração ao RDS
- "Controlar quem pode usar chaves de criptografia entre contas" → política de chave do KMS
- "Armazenar valores de configuração não secretos" → SSM Parameter Store (não Secrets Manager)
- "Criptografar objetos do S3 com chaves gerenciadas pela empresa" → SSE-KMS com CMK

---

## Domínio 2: Projetar Arquiteturas Resilientes (26%)

**Tarefa 2.1 — Projetar arquiteturas escaláveis e fracamente acopladas**

Conceitos centrais: Auto Scaling, balanceadores de carga, desacoplamento com SQS/SNS, gatilhos de eventos do Lambda, ECS/EKS, Step Functions.

| Capítulo   | Tópico                                                             |
|------------|--------------------------------------------------------------------|
| Capítulo 7  | Auto Scaling Groups, Application Load Balancer, políticas de escalonamento |
| Capítulo 19 | SQS (desacoplamento com filas), SNS (notificações fan-out)        |
| Capítulo 20 | Lambda: computação serverless, gatilhos de eventos, concorrência   |
| Capítulo 20 | API Gateway: APIs REST/HTTP/WebSocket gerenciadas, isoladas ou + Lambda |
| Capítulo 21 | ECS e EKS: microsserviços conteinerizados                          |
| Capítulo 22 | Step Functions: orquestração de fluxos de trabalho                 |
| Capítulo 26 | Kinesis: streaming de dados em tempo real                          |

Padrões-chave do exame:

- "Desacoplar o processamento de pedidos da atualização de estoque" → fila SQS entre os serviços
- "Notificar múltiplos serviços quando um novo pedido é feito" → tópico SNS com assinaturas SQS (fan-out)
- "Processar uploads do S3 automaticamente" → notificação de evento do S3 → Lambda
- "Executar um fluxo de trabalho de múltiplas etapas com lógica de nova tentativa" → Step Functions

---

**Tarefa 2.2 — Projetar arquiteturas altamente disponíveis e/ou tolerantes a falhas**

Conceitos centrais: Multi-AZ, Multi-Region, failover do Route 53, read replicas do RDS, Aurora Global Database, backup e restauração.

| Capítulo   | Tópico                                                                                       |
|------------|----------------------------------------------------------------------------------------------|
| Capítulo 2  | Infraestrutura global da AWS: Regiões, AZs, locais de borda                                  |
| Capítulo 7  | ALB entre múltiplas AZs, ASG substitui instâncias não saudáveis                             |
| Capítulo 8  | RDS Multi-AZ: replicação síncrona, failover automático                                      |
| Capítulo 12 | Route 53: roteamento de failover, roteamento por latência, verificações de integridade      |
| Capítulo 18 | Multi-AZ vs. Multi-Region: RTO/RPO, estratégias de DR (pilot light, warm standby, active-active) |
| Capítulo 18 | AWS Backup (backups centralizados, entre contas), Elastic Disaster Recovery (pilot light gerenciado) |
| Capítulo 24 | Aurora Global Database: réplicas de leitura entre regiões, atraso de replicação < 1s        |

Padrões-chave do exame:

- "Failover automático se o RDS primário falhar" → RDS Multi-AZ (não Read Replica)
- "Servir leituras globalmente com baixa latência" → Aurora Global Database
- "Rotear tráfego para a região secundária se a primária estiver indisponível" → Route 53 com roteamento de Failover + verificações de integridade
- "RTO de 1 minuto, RPO de 0" → implantação Multi-AZ (não Multi-Region)
- "RTO de 15 minutos, entre regiões" → estratégia Pilot Light

---

## Domínio 3: Projetar Arquiteturas de Alto Desempenho (24%)

**Tarefa 3.1 — Determinar soluções de armazenamento de alto desempenho e/ou escaláveis**

Conceitos centrais: S3 vs. EBS vs. EFS, seleção de classe de armazenamento, S3 Transfer Acceleration, upload multipart, CloudFront para ativos.

| Capítulo   | Tópico                                                                  |
|------------|-------------------------------------------------------------------------|
| Capítulo 5  | S3: armazenamento de objetos, classes de armazenamento, versionamento, ciclo de vida |
| Capítulo 6  | EBS: tipos de armazenamento em bloco (gp3, io2, st1), EFS: armazenamento de arquivos compartilhado |
| Capítulo 6  | Storage Gateway: ponte híbrida de on-premises para S3 (File, Volume, Tape) |
| Capítulo 23 | Transições de classe de armazenamento do S3, opções de recuperação do Glacier |
| Capítulo 25 | DataSync (sincronização de arquivos online), Transfer Family (SFTP→S3 gerenciado), Snow Family (transferência em massa offline — legado: fechada para novos clientes em novembro de 2025; a AWS agora indica DataSync e Data Transfer Terminals), MGN (rehospedagem de servidores) |
| Capítulo 28 | Dimensionamento correto de EBS, migração de gp2→gp3, gerenciamento de snapshots |

Padrões-chave do exame:

- "Sistema de arquivos compartilhado acessível por múltiplas instâncias EC2" → EFS (não EBS; o EBS se anexa a uma única instância)
- "Alto IOPS para carga de trabalho de banco de dados" → EBS io2
- "Reduzir custo para arquivos não acessados em 90 dias" → política de ciclo de vida do S3 → Glacier
- "Enviar arquivos grandes de locais distantes mais rápido" → S3 Transfer Acceleration
- "Semanas de transferência sobre largura de banda limitada" → o exame SAA-C03 ainda espera o Snowball, apesar do fechamento da Snow Family para novos clientes em 2025

---

**Tarefa 3.2 — Determinar soluções de computação de alto desempenho e/ou escaláveis**

Conceitos centrais: famílias de instâncias EC2, processadores Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Capítulo   | Tópico                                                                                  |
|------------|-----------------------------------------------------------------------------------------|
| Capítulo 4  | Tipos de instância EC2: otimizadas para computação (c), otimizadas para memória (r), uso geral (m, t) |
| Capítulo 7  | Auto Scaling: escalonamento horizontal para camadas web                                |
| Capítulo 20 | Lambda: concorrência, concorrência provisionada (para latência consistente)            |
| Capítulo 21 | ECS Fargate: contêineres serverless                                                     |
| Capítulo 21 | AWS Batch: computação em lote gerenciada para contêineres Docker, apoiada em Spot       |
| Capítulo 27 | Spot Instances para cargas de trabalho em lote tolerantes a falhas                      |

Padrões-chave do exame:

- "Carga de trabalho de treinamento de ML, minimizar custo, pode ser interrompida" → Spot Instances
- "Resposta consistente do Lambda abaixo de 100ms" → concorrência provisionada (elimina o cold start)
- "Microsserviço conteinerizado, sem gerenciamento de infraestrutura" → ECS Fargate

---

**Tarefa 3.3 — Determinar soluções de banco de dados de alto desempenho**

Conceitos centrais: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, padrões de acesso, read replicas, DAX.

| Capítulo   | Tópico                                                             |
|------------|--------------------------------------------------------------------|
| Capítulo 8  | RDS: bancos de dados relacionais gerenciados, quando usar RDBMS    |
| Capítulo 9  | DynamoDB: NoSQL, chaves de partição, GSI, DAX (cache em memória)   |
| Capítulo 10 | ElastiCache: Redis vs. Memcached, estratégias de cache             |
| Capítulo 10 | MemoryDB for Redis: banco de dados primário durável compatível com Redis |
| Capítulo 24 | Aurora: desempenho, Serverless v2, read replicas, Global Database  |
| Capítulo 29 | DynamoDB capacidade on-demand vs. provisionada com Auto Scaling    |

Padrões-chave do exame:

- "Leituras em microssegundos para um armazenamento de sessões" → ElastiCache Redis ou DAX (se o backend for DynamoDB)
- "Acesso chave-valor de alto throughput com esquema flexível" → DynamoDB
- "Joins complexos e transações ACID" → Aurora ou RDS
- "Análise sobre petabytes de dados estruturados" → Redshift (não coberto em detalhe, mas o sinal: "data warehouse" → Redshift)

---

**Tarefa 3.4 — Determinar arquiteturas de rede de alto desempenho e/ou escaláveis**

Conceitos centrais: CloudFront, Global Accelerator, Direct Connect, VPN, grupos de posicionamento, enhanced networking.

| Capítulo   | Tópico                                                             |
|------------|--------------------------------------------------------------------|
| Capítulo 7  | NLB (Camada 4) e GWLB (Gateway Load Balancer para appliances de rede) |
| Capítulo 11 | Client VPN: acesso criptografado de dispositivo individual para VPC |
| Capítulo 12 | Route 53: políticas de roteamento: baseada em latência, geolocalização, ponderada |
| Capítulo 13 | CloudFront: CDN, cache na borda, Lambda@Edge                       |
| Capítulo 25 | AWS Global Accelerator: roteamento Anycast no backbone da AWS      |
| Capítulo 25 | Direct Connect: conectividade privada dedicada                     |
| Capítulo 30 | VPC Endpoints: conectividade privada a serviços AWS               |

Padrões-chave do exame:

- "Reduzir a latência para usuários globais acessando respostas de API dinâmicas" → Global Accelerator (não CloudFront, que é melhor para conteúdo armazenável em cache)
- "Reduzir a latência para ativos estáticos globalmente" → CloudFront
- "Conectividade privada consistente à AWS a partir de on-premises" → Direct Connect
- "Upload rápido de clientes no mundo todo para o seu bucket S3" → S3 Transfer Acceleration

---

**Tarefa 3.5 — Determinar soluções de ingestão e transformação de dados de alto desempenho**

Conceitos centrais: Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Capítulo   | Tópico                                                              |
|------------|--------------------------------------------------------------------|
| Capítulo 26 | Kinesis Data Streams: processamento de eventos ordenado em tempo real |
| Capítulo 26 | Amazon Data Firehose (ex-Kinesis Data Firehose): entrega gerenciada para S3, Redshift, OpenSearch |
| Capítulo 26 | AWS Glue: ETL serverless, Data Catalog, Crawlers                   |
| Capítulo 26 | Athena: SQL serverless sobre o S3                                  |
| Capítulo 26 | QuickSight: dashboards de BI gerenciados, motor em memória SPICE   |
| Capítulo 26 | Lake Formation: controle de acesso granular a data lake           |

Padrões-chave do exame:

- "Processar dados de clickstream em tempo real" → Kinesis Data Streams + Lambda ou Managed Service for Apache Flink (antigo Kinesis Data Analytics)
- "Entregar dados de streaming para o S3 para análise posterior" → Amazon Data Firehose
- "Transformar e catalogar dados de múltiplas fontes" → AWS Glue
- "Consultar dados históricos armazenados no S3 com SQL" → Athena

---

## Domínio 4: Projetar Arquiteturas Otimizadas em Custo (20%)

**Tarefa 4.1 — Projetar soluções de armazenamento otimizadas em custo**

| Capítulo   | Tópico                                                             |
|------------|--------------------------------------------------------------------|
| Capítulo 23 | Políticas de ciclo de vida do S3, transições de classe de armazenamento |
| Capítulo 28 | Dimensionamento correto de EBS, migração de gp2→gp3, regras de ciclo de vida de versionamento do S3 |
| Capítulo 28 | EFS Intelligent-Tiering, tags de alocação de custos, AWS Budgets   |

Padrões-chave do exame:

- "Identificar qual equipe está gerando mais custos de S3" → tags de alocação de custos + Cost Explorer
- "Reduzir custos para objetos raramente acessados automaticamente" → S3 Intelligent-Tiering
- "Alertar quando os custos mensais excederem US$ 10.000" → AWS Budgets

---

**Tarefa 4.2 — Projetar soluções de computação otimizadas em custo**

| Capítulo   | Tópico                                                                           |
|------------|----------------------------------------------------------------------------------|
| Capítulo 2  | Outposts: rack AWS on-premises (trade-off entre custo de capital e opex de nuvem) |
| Capítulo 2  | Wavelength: computação na borda 5G (parceria com telecom, posicionamento orientado por latência) |
| Capítulo 27 | Preços do EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Capítulo 20 | Lambda: pague por invocação (custo zero em inatividade)                          |

Padrões-chave do exame:

- "Reduzir custos para cargas de trabalho de produção em estado estável" → Savings Plans (mais flexível) ou Reserved Instances
- "Minimizar custos para jobs em lote que podem ser interrompidos" → Spot Instances
- "Processamento orientado a eventos com custo zero em inatividade" → Lambda

---

**Tarefa 4.3 — Projetar soluções de banco de dados otimizadas em custo**

| Capítulo   | Tópico                                            |
|------------|---------------------------------------------------|
| Capítulo 29 | DynamoDB on-demand vs. provisionado + Auto Scaling |
| Capítulo 29 | Reserved Instances/Nodes do RDS e do ElastiCache  |
| Capítulo 29 | Gerenciamento de snapshots do RDS                 |

Padrões-chave do exame:

- "Tráfego imprevisível no DynamoDB" → modo de capacidade On-demand
- "Tráfego consistente no DynamoDB com picos conhecidos" → Provisionado + Auto Scaling
- "Reduzir custos do RDS para uma carga de trabalho estável" → Reserved Instances (1 ou 3 anos)

---

**Tarefa 4.4 — Projetar arquiteturas de rede otimizadas em custo**

| Capítulo   | Tópico                                                                                        |
|------------|-----------------------------------------------------------------------------------------------|
| Capítulo 30 | Preços de transferência de dados: entrada (gratuito), entre AZs (US$ 0,01/GB), entre regiões, internet (US$ 0,09/GB) |
| Capítulo 30 | NAT Gateway (US$ 0,045/GB) vs. VPC Endpoints (Gateway: gratuito; Interface: cobrado)          |
| Capítulo 30 | CloudFront como otimizador de custos de transferência de dados                                |

Padrões-chave do exame:

- "EC2 em sub-rede privada chama o S3 — eliminar custos do NAT Gateway" → S3 Gateway Endpoint (gratuito)
- "EC2 em sub-rede privada chama o SQS — reduzir custos do NAT Gateway" → SQS Interface Endpoint
- "Reduzir custos de transferência de dados para entrega global de conteúdo" → CloudFront (o cache reduz as requisições à origem)

---

## Tópicos Entre Domínios

Alguns tópicos aparecem em múltiplos domínios:

| Tópico                              | Domínios | Capítulos    |
|------------------------------------|----------|--------------|
| Well-Architected Framework         | Todos    | 31           |
| Revisões de arquitetura e ADRs     | Todos    | 32           |
| Raciocínio de trade-off ("depende") | Todos   | 33           |
| Design Multi-AZ                    | 2, 3     | 7, 8, 18, 24 |
| Monitoramento e observabilidade    | 1, 2     | Ao longo do livro |
| CloudFront                         | 3, 4     | 13, 30       |

---

## Checklist Pré-Exame

Antes de fazer o SAA-C03:

**Áreas de alto peso (mais prováveis de aparecer)**

- [ ] Lógica de avaliação de políticas IAM (negação explícita → permissão explícita → negação implícita)
- [ ] Componentes da VPC: sub-redes, tabelas de rotas, IGW, NAT Gateway, grupos de segurança, NACLs
- [ ] Classes de armazenamento do S3 e quando usar cada uma
- [ ] RDS Multi-AZ vs. Read Replica (failover vs. escalonamento de leitura)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. roteamento de eventos)
- [ ] Modelos de preços do EC2: Spot para tolerância a falhas, Savings Plans para cargas de trabalho comprometidas
- [ ] Gatilhos e concorrência do Lambda
- [ ] DynamoDB vs. Aurora vs. Redshift (o padrão de acesso determina a escolha)
- [ ] CloudFront: CDN para estático, Global Accelerator para dinâmico

**Armadilhas comuns**

- [ ] O EBS se anexa a UMA instância; o EFS é compartilhado
- [ ] As Read Replicas do RDS são para escalonamento de leitura, NÃO para failover automático (isso é Multi-AZ)
- [ ] As NACLs são sem estado (precisam de regras de entrada e de saída)
- [ ] Os Gateway Endpoints são gratuitos e apenas para S3 e DynamoDB
- [ ] O Kinesis retém e reproduz; o SQS exclui no consumo
- [ ] "Desacoplar" nem sempre significa SQS — fan-out de SNS e EventBridge também são padrões de desacoplamento
- [ ] O Shield Standard é gratuito e automático; o Advanced é uma assinatura paga
- [ ] ElastiCache vs. MemoryDB: ElastiCache = cache (perda de dados OK). MemoryDB = banco de dados primário durável.
- [ ] Client VPN vs. Site-to-Site VPN: Client VPN = dispositivos individuais. Site-to-Site = rede-para-rede.
- [ ] Outposts vs. Wavelength: Outposts = rack AWS on-premises. Wavelength = borda 5G.
- [ ] DMS: homogêneo = DMS direto. Heterogêneo = SCT primeiro, depois DMS.
- [ ] O DataSync move *arquivos*; o DMS move *bancos de dados*; o MGN move *servidores inteiros*.

**A estrutura do exame**

- 65 questões, 130 minutos (2 horas e 10 minutos)
- Múltipla escolha (uma correta) e múltipla resposta (selecione N corretas)
- Nota de aprovação: 720 de 1000
- Questões não pontuadas são embutidas; você não consegue identificar quais são
- Gerencie o tempo: ~2 minutos por questão; marque as difíceis e retorne
