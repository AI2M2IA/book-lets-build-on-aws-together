# Apêndice B: Mapa de Domínios do SAA-C03

O exame AWS Solutions Architect Associate (SAA-C03) é organizado em quatro domínios. Este apêndice mapeia cada capítulo do livro para o domínio e tarefa relevantes, para que você possa estudar por área do exame em vez de pela ordem dos capítulos.

---

## Visão Geral dos Domínios

| Domínio                                                | Peso | Descrição                                             |
|--------------------------------------------------------|------|-------------------------------------------------------|
| Domínio 1: Projetar Arquiteturas Seguras               | 30%  | IAM, segurança de rede, proteção de dados             |
| Domínio 2: Projetar Arquiteturas Resilientes           | 26%  | Alta disponibilidade, tolerância a falhas, DR         |
| Domínio 3: Projetar Arquiteturas de Alto Desempenho    | 24%  | Desempenho de computação, armazenamento, banco de dados, rede |
| Domínio 4: Projetar Arquiteturas com Custo Otimizado   | 20%  | Modelos de preços, gerenciamento de custos, otimização de recursos |

---

## Domínio 1: Projetar Arquiteturas Seguras (30%)

**Tarefa 1.1 — Projetar acesso seguro a recursos AWS**

Conceitos principais: Usuários, grupos, funções e políticas IAM. Princípio do mínimo privilégio. Acesso entre contas. Funções de serviço. SCP (Service Control Policies) nas AWS Organizations.

| Capítulo    | Tópico                                                                          |
|-------------|---------------------------------------------------------------------------------|
| Capítulo 3  | Fundamentos do IAM: usuários, grupos, funções, políticas, avaliação de política |
| Capítulo 14 | IAM avançado: funções para serviços, limites de permissão, funções entre contas |
| Capítulo 3  | Lógica de avaliação de política: negação explícita > permissão explícita > negação implícita |
| Capítulo 14 | AWS Organizations e SCPs                                                        |

Padrões-chave do exame:

- "EC2 precisa acessar o S3 sem credenciais no código" → Função IAM com política S3 vinculada ao perfil de instância EC2
- "Contas diferentes precisam compartilhar recursos" → Função IAM com política de confiança entre contas
- "Impedir que todos os usuários IAM em uma OU acessem um serviço" → SCP nas AWS Organizations

---

**Tarefa 1.2 — Projetar cargas de trabalho e aplicações seguras**

Conceitos principais: Design de VPC, grupos de segurança vs. NACLs, isolamento de rede, proteção DDoS, WAF, GuardDuty.

| Capítulo    | Tópico                                                                                   |
|-------------|------------------------------------------------------------------------------------------|
| Capítulo 11 | Design de VPC: sub-redes públicas/privadas, NAT Gateway, Internet Gateway, tabelas de rotas |
| Capítulo 15 | Grupos de segurança (com estado, nível de instância) vs. NACLs (sem estado, nível de sub-rede) |
| Capítulo 17 | Shield (proteção DDoS), WAF (firewall de aplicação), GuardDuty (detecção de ameaças)   |
| Capítulo 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                        |

Padrões-chave do exame:

- "Bloquear um IP específico da sub-rede" → Regra de negação NACL
- "Permitir HTTP de entrada, automaticamente permitir resposta HTTP de saída" → Grupo de segurança (com estado)
- "Proteger aplicação web contra injeção SQL" → WAF com regra de injeção SQL
- "Detectar credenciais IAM comprometidas" → GuardDuty

---

**Tarefa 1.3 — Determinar controles de segurança de dados adequados**

Conceitos principais: Criptografia em repouso e em trânsito, KMS, Secrets Manager, Parameter Store, criptografia no servidor S3.

| Capítulo    | Tópico                                                                     |
|-------------|----------------------------------------------------------------------------|
| Capítulo 16 | KMS: chaves gerenciadas pelo cliente, rotação de chaves, criptografia de envelope |
| Capítulo 16 | Secrets Manager: rotação automática de credenciais, recuperação de segredos em tempo de execução |
| Capítulo 5  | Opções de criptografia S3: SSE-S3, SSE-KMS, SSE-C                         |
| Capítulo 8  | Criptografia em repouso do RDS (deve ser habilitada na criação)            |

Padrões-chave do exame:

- "Rotacionar credenciais de banco de dados automaticamente" → Secrets Manager com integração RDS
- "Controlar quem pode usar chaves de criptografia entre contas" → Política de chave KMS
- "Armazenar valores de configuração não confidenciais" → SSM Parameter Store (não Secrets Manager)
- "Criptografar objetos S3 com chaves gerenciadas pela empresa" → SSE-KMS com CMK

---

## Domínio 2: Projetar Arquiteturas Resilientes (26%)

**Tarefa 2.1 — Projetar arquiteturas escaláveis e fracamente acopladas**

Conceitos principais: Auto Scaling, balanceadores de carga, desacoplamento SQS/SNS, gatilhos de eventos Lambda, ECS/EKS, Step Functions.

| Capítulo    | Tópico                                                              |
|-------------|---------------------------------------------------------------------|
| Capítulo 7  | Auto Scaling Groups, Application Load Balancer, políticas de escalonamento |
| Capítulo 19 | SQS (desacoplamento com filas), SNS (notificações fan-out)          |
| Capítulo 20 | Lambda: computação serverless, gatilhos de eventos, concorrência    |
| Capítulo 21 | ECS e EKS: microsserviços conteinerizados                           |
| Capítulo 22 | Step Functions: orquestração de fluxos de trabalho                  |
| Capítulo 26 | Kinesis: streaming de dados em tempo real                           |

Padrões-chave do exame:

- "Desacoplar processamento de pedidos da atualização de estoque" → Fila SQS entre os serviços
- "Notificar múltiplos serviços quando um novo pedido é feito" → Tópico SNS com assinaturas SQS (fan-out)
- "Processar uploads S3 automaticamente" → Notificação de evento S3 → Lambda
- "Executar um fluxo de trabalho de múltiplas etapas com lógica de nova tentativa" → Step Functions

---

**Tarefa 2.2 — Projetar arquiteturas altamente disponíveis e/ou tolerantes a falhas**

Conceitos principais: Multi-AZ, Multi-Region, failover Route 53, réplicas de leitura RDS, Aurora Global Database, backup e restauração.

| Capítulo    | Tópico                                                                                            |
|-------------|---------------------------------------------------------------------------------------------------|
| Capítulo 2  | Infraestrutura global AWS: Regiões, AZs, locais de borda                                          |
| Capítulo 7  | ALB em múltiplas AZs, ASG substitui instâncias não saudáveis                                     |
| Capítulo 8  | RDS Multi-AZ: replicação síncrona, failover automático                                            |
| Capítulo 12 | Route 53: roteamento de failover, roteamento por latência, verificações de integridade            |
| Capítulo 18 | Multi-AZ vs. Multi-Region: RTO/RPO, estratégias de DR (pilot light, warm standby, active-active) |
| Capítulo 24 | Aurora Global Database: réplicas de leitura entre regiões, < 1s de atraso de replicação          |

Padrões-chave do exame:

- "Fazer failover automaticamente se o RDS primário falhar" → RDS Multi-AZ (não Réplica de Leitura)
- "Servir leituras globalmente com baixa latência" → Aurora Global Database
- "Rotear tráfego para região secundária se a primária estiver indisponível" → Route 53 com roteamento de Failover + verificações de integridade
- "RTO de 1 minuto, RPO de 0" → Implantação Multi-AZ (não Multi-Region)
- "RTO de 15 minutos, entre regiões" → Estratégia Pilot Light

---

## Domínio 3: Projetar Arquiteturas de Alto Desempenho (24%)

**Tarefa 3.1 — Determinar soluções de armazenamento de alto desempenho e/ou escaláveis**

Conceitos principais: S3 vs. EBS vs. EFS, seleção de classe de armazenamento, S3 Transfer Acceleration, upload multipart, CloudFront para ativos.

| Capítulo    | Tópico                                                               |
|-------------|----------------------------------------------------------------------|
| Capítulo 5  | S3: armazenamento de objetos, classes de armazenamento, versionamento, ciclo de vida |
| Capítulo 6  | EBS: tipos de armazenamento em bloco (gp3, io2, st1), EFS: armazenamento de arquivo compartilhado |
| Capítulo 23 | Transições de classe de armazenamento S3, opções de recuperação Glacier |
| Capítulo 28 | Dimensionamento correto EBS, migração gp2→gp3, gerenciamento de snapshots |

Padrões-chave do exame:

- "Sistema de arquivos compartilhado acessível a partir de múltiplas instâncias EC2" → EFS (não EBS; o EBS se vincula a uma instância)
- "Alto IOPS para carga de trabalho de banco de dados" → io2 EBS
- "Reduzir custo para arquivos não acessados em 90 dias" → Política de ciclo de vida S3 → Glacier
- "Fazer upload de arquivos grandes de locais distantes mais rapidamente" → S3 Transfer Acceleration

---

**Tarefa 3.2 — Determinar soluções de computação de alto desempenho e/ou escaláveis**

Conceitos principais: Famílias de instâncias EC2, processadores Graviton, Auto Scaling, Lambda, Fargate, Spot Instances.

| Capítulo    | Tópico                                                                                 |
|-------------|----------------------------------------------------------------------------------------|
| Capítulo 4  | Tipos de instâncias EC2: otimizadas para computação (c), otimizadas para memória (r), uso geral (m, t) |
| Capítulo 7  | Auto Scaling: escalonamento horizontal para camadas web                                |
| Capítulo 20 | Lambda: concorrência, concorrência provisionada (para latência consistente)            |
| Capítulo 21 | ECS Fargate: contêineres serverless                                                    |
| Capítulo 27 | Spot Instances para cargas de trabalho em lote tolerantes a falhas                     |

Padrões-chave do exame:

- "Carga de trabalho de treinamento de ML, minimizar custo, pode ser interrompida" → Spot Instances
- "Resposta Lambda consistente sub-100ms" → Concorrência provisionada (elimina cold start)
- "Microsserviço conteinerizado, sem gerenciamento de infraestrutura" → ECS Fargate

---

**Tarefa 3.3 — Determinar soluções de banco de dados de alto desempenho**

Conceitos principais: RDS vs. DynamoDB vs. Aurora vs. Redshift vs. ElastiCache, padrões de acesso, réplicas de leitura, DAX.

| Capítulo    | Tópico                                                              |
|-------------|---------------------------------------------------------------------|
| Capítulo 8  | RDS: bancos de dados relacionais gerenciados, quando usar RDBMS     |
| Capítulo 9  | DynamoDB: NoSQL, chaves de partição, GSI, DAX (cache na memória)    |
| Capítulo 10 | ElastiCache: Redis vs. Memcached, estratégias de cache              |
| Capítulo 24 | Aurora: desempenho, Serverless v2, réplicas de leitura, Global Database |
| Capítulo 29 | DynamoDB on-demand vs. capacidade provisionada com Auto Scaling     |

Padrões-chave do exame:

- "Leituras em microssegundos para um repositório de sessões" → ElastiCache Redis ou DAX (se backend DynamoDB)
- "Acesso de alto throughput baseado em chave com esquema flexível" → DynamoDB
- "Junções complexas e transações ACID" → Aurora ou RDS
- "Análise em petabytes de dados estruturados" → Redshift (não coberto em detalhes, mas sinal: "data warehouse" → Redshift)

---

**Tarefa 3.4 — Determinar arquiteturas de rede de alto desempenho e/ou escaláveis**

Conceitos principais: CloudFront, Global Accelerator, Direct Connect, VPN, grupos de posicionamento, rede aprimorada.

| Capítulo    | Tópico                                                              |
|-------------|---------------------------------------------------------------------|
| Capítulo 12 | Route 53: políticas de roteamento: baseada em latência, geolocalização, ponderada |
| Capítulo 13 | CloudFront: CDN, cache de borda, Lambda@Edge                        |
| Capítulo 25 | Direct Connect: conectividade privada dedicada                      |
| Capítulo 25 | AWS Global Accelerator: roteamento Anycast para borda AWS mais próxima |
| Capítulo 30 | VPC Endpoints: conectividade privada para serviços AWS              |

Padrões-chave do exame:

- "Reduzir latência para usuários globais acessando respostas de API dinâmicas" → Global Accelerator (não CloudFront, que é melhor para conteúdo armazenável em cache)
- "Reduzir latência para ativos estáticos globalmente" → CloudFront
- "Conectividade privada consistente para AWS a partir de on-premises" → Direct Connect
- "Upload rápido de clientes no mundo todo para o bucket S3" → S3 Transfer Acceleration

---

**Tarefa 3.5 — Determinar soluções de ingestão e transformação de dados de alto desempenho**

Conceitos principais: Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Capítulo    | Tópico                                                                  |
|-------------|-------------------------------------------------------------------------|
| Capítulo 26 | Kinesis Data Streams: processamento de eventos ordenados em tempo real  |
| Capítulo 26 | Kinesis Data Firehose: entrega gerenciada para S3, Redshift, OpenSearch |
| Capítulo 26 | AWS Glue: ETL serverless, Data Catalog, Crawlers                        |
| Capítulo 26 | Athena: SQL serverless no S3                                            |

Padrões-chave do exame:

- "Processar dados de clickstream em tempo real" → Kinesis Data Streams + Lambda ou KDA
- "Entregar dados de streaming para S3 para análise posterior" → Kinesis Firehose
- "Transformar e catalogar dados de múltiplas fontes" → AWS Glue
- "Consultar dados históricos armazenados no S3 com SQL" → Athena

---

## Domínio 4: Projetar Arquiteturas com Custo Otimizado (20%)

**Tarefa 4.1 — Projetar soluções de armazenamento com custo otimizado**

| Capítulo    | Tópico                                                               |
|-------------|----------------------------------------------------------------------|
| Capítulo 23 | Políticas de ciclo de vida S3, transições de classe de armazenamento |
| Capítulo 28 | Dimensionamento correto EBS, migração gp2→gp3, regras de ciclo de vida de versionamento S3 |
| Capítulo 28 | EFS Intelligent-Tiering, tags de alocação de custo, AWS Budgets      |

Padrões-chave do exame:

- "Identificar qual equipe está gerando a maioria dos custos S3" → Tags de alocação de custo + Cost Explorer
- "Reduzir custos para objetos raramente acessados automaticamente" → S3 Intelligent-Tiering
- "Alertar quando os custos mensais excederem US$ 10.000" → AWS Budgets

---

**Tarefa 4.2 — Projetar soluções de computação com custo otimizado**

| Capítulo    | Tópico                                                                               |
|-------------|--------------------------------------------------------------------------------------|
| Capítulo 27 | Preços EC2: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts      |
| Capítulo 20 | Lambda: pague por invocação (custo zero em inatividade)                              |

Padrões-chave do exame:

- "Reduzir custo para cargas de trabalho de produção em estado estacionário" → Savings Plans (mais flexível) ou Reserved Instances
- "Minimizar custo para trabalhos em lote que podem ser interrompidos" → Spot Instances
- "Processamento orientado a eventos com custo zero em inatividade" → Lambda

---

**Tarefa 4.3 — Projetar soluções de banco de dados com custo otimizado**

| Capítulo    | Tópico                                                      |
|-------------|-------------------------------------------------------------|
| Capítulo 29 | DynamoDB on-demand vs. provisionado + Auto Scaling          |
| Capítulo 29 | RDS e ElastiCache Reserved Instances/Nodes                  |
| Capítulo 29 | Gerenciamento de snapshots RDS                              |

Padrões-chave do exame:

- "Tráfego DynamoDB imprevisível" → Modo de capacidade on-demand
- "Tráfego DynamoDB consistente com picos conhecidos" → Provisionado + Auto Scaling
- "Reduzir custos RDS para carga de trabalho estável" → Reserved Instances (1 ou 3 anos)

---

**Tarefa 4.4 — Projetar arquiteturas de rede com custo otimizado**

| Capítulo    | Tópico                                                                                            |
|-------------|---------------------------------------------------------------------------------------------------|
| Capítulo 30 | Preços de transferência de dados: entrada (gratuito), entre AZs (US$ 0,01/GB), entre regiões, internet (US$ 0,09/GB) |
| Capítulo 30 | NAT Gateway (US$ 0,045/GB) vs. VPC Endpoints (Gateway: gratuito; Interface: com custo)           |
| Capítulo 30 | CloudFront como otimizador de custo de transferência de dados                                     |

Padrões-chave do exame:

- "EC2 em sub-rede privada chama S3 — eliminar custos do NAT Gateway" → S3 Gateway Endpoint (gratuito)
- "EC2 em sub-rede privada chama SQS — reduzir custos do NAT Gateway" → SQS Interface Endpoint
- "Reduzir custos de transferência de dados para entrega de conteúdo global" → CloudFront (o cache reduz as requisições de origem)

---

## Tópicos Entre Domínios

Alguns tópicos aparecem em múltiplos domínios:

| Tópico                                      | Domínios | Capítulos    |
|---------------------------------------------|----------|--------------|
| Well-Architected Framework                  | Todos    | 31           |
| Revisões de arquitetura e ADRs              | Todos    | 32           |
| Raciocínio sobre contrapartidas ("depende") | Todos    | 33           |
| Design Multi-AZ                             | 2, 3     | 7, 8, 18, 24 |
| Monitoramento e observabilidade             | 1, 2     | Ao longo     |
| CloudFront                                  | 3, 4     | 13, 30       |

---

## Lista de Verificação Pré-Exame

Antes de fazer o SAA-C03:

**Áreas de alto peso (mais prováveis de aparecer)**

- [ ] Lógica de avaliação de política IAM (negação explícita → permissão explícita → negação implícita)
- [ ] Componentes VPC: sub-redes, tabelas de rotas, IGW, NAT Gateway, grupos de segurança, NACLs
- [ ] Classes de armazenamento S3 e quando usar cada uma
- [ ] RDS Multi-AZ vs. Réplica de Leitura (failover vs. escalonamento de leitura)
- [ ] SQS vs. SNS vs. EventBridge (pull vs. push vs. roteamento de eventos)
- [ ] Modelos de preços EC2: Spot para tolerante a falhas, Savings Plans para cargas de trabalho comprometidas
- [ ] Gatilhos Lambda e concorrência
- [ ] DynamoDB vs. Aurora vs. Redshift (padrão de acesso determina a escolha)
- [ ] CloudFront: CDN para estático, Global Accelerator para dinâmico

**Armadilhas comuns**

- [ ] O EBS se vincula a UMA instância; o EFS é compartilhado
- [ ] As Réplicas de Leitura RDS são para escalonamento de leitura, NÃO failover automático (isso é o Multi-AZ)
- [ ] As NACLs são sem estado (precisam de regras de entrada e saída)
- [ ] Os Gateway Endpoints são gratuitos e apenas para S3 e DynamoDB
- [ ] O Kinesis retém e reproduz; o SQS exclui no consumo
- [ ] "Desacoplar" não significa sempre SQS — SNS fan-out e EventBridge também são padrões de desacoplamento
- [ ] O Shield Standard é gratuito e automático; o Advanced é uma assinatura paga

**A estrutura do exame**

- 65 perguntas, 130 minutos (2 horas e 10 minutos)
- Múltipla escolha (uma correta) e resposta múltipla (selecione N corretas)
- Pontuação de aprovação: 720 de 1000
- Perguntas não pontuadas estão incorporadas; você não pode dizer quais são
- Gerencie o tempo: ~2 minutos por pergunta; marque as difíceis e retorne
