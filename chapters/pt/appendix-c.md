# Apêndice C: Registro de Conceitos

Cada conceito-chave introduzido no livro, mapeado para seu capítulo, a analogia usada e o domínio SAA-C03 onde aparece.

Use isto como um índice de estudo: se você estiver inseguro sobre um conceito antes do exame, encontre-o aqui e volte ao seu capítulo para obter contexto.

---

## A

**ACM (AWS Certificate Manager)** — Certificados públicos TLS gratuitos para ALB, CloudFront e API Gateway, com renovação automática via validação DNS. Os certificados do CloudFront devem residir em us-east-1. Capítulo 16. Domínio 1.

**ACU (Aurora Capacity Unit)** — A unidade de medida da capacidade do Aurora Serverless v2. Escala automaticamente e, em versões de motor suportadas, pode pausar automaticamente para 0 ACUs quando nenhuma conexão é mantida aberta. Capítulo 24. Domínio 3.

**Alarm (CloudWatch)** — Uma regra que dispara quando uma métrica cruza um limite, acionando uma notificação ou uma ação de auto scaling. Capítulo 7. Domínio 2.

**ALB (Application Load Balancer)** — Balanceador de carga de Camada 7 que roteia tráfego HTTP/HTTPS com base em regras de caminho e host. Capítulo 7. Domínio 2.

**AMI (Amazon Machine Image)** — Um modelo contendo o SO, o software e a configuração de uma instância EC2. Capítulo 4. Domínio 3.

**Mentalidade de arquiteto** — Perguntar "o que quebra primeiro, como saberemos e o que alguém faz às 3 da manhã?" em vez de apenas "como isto funciona?". Capítulo 32, Capítulo 34. Entre domínios.

**Architecture Decision Record (ADR)** — Um documento curto que registra uma decisão, suas alternativas, sua justificativa e o que faria reconsiderá-la. Capítulo 32. Entre domínios.

**Revisão de arquitetura** — Um processo estruturado que cobre: restrições → incógnitas → opções → modos de falha → monitoramento → runbooks. Capítulo 32. Entre domínios.

**Athena** — Serviço de consulta SQL serverless para dados no S3. Pague por TB verificado. Melhor com formatos colunares Parquet/ORC. Capítulo 26. Domínio 3.

**Auto Scaling Group (ASG)** — Um grupo de instâncias EC2 gerenciadas em conjunto, que substitui automaticamente instâncias não saudáveis e escala com base na carga. Capítulo 7. Domínios 2, 3.

**Availability Zone (AZ)** — Um ou mais data centers fisicamente separados dentro de uma região, conectados por links de baixa latência. Capítulo 2. Domínio 2.

---

## B

**AWS Backup** — Backup centralizado e baseado em políticas abrangendo EBS, RDS, DynamoDB, EFS e Storage Gateway. Suporta cópias entre regiões e entre contas. Capítulos 18, 23. Domínio 2.

**AWS Batch** — Computação em lote gerenciada para contêineres Docker. Composta por uma definição de job (o que executar), uma fila de jobs (onde os jobs aguardam) e um ambiente de computação (EC2 ou Fargate, On-Demand ou Spot). Para cargas de trabalho que excedem o limite de 15 minutos do Lambda. Capítulo 21. Domínio 3.

**Bucket (S3)** — Um contêiner para objetos do S3. Os buckets têm nomes globais únicos e residem em uma região específica. Capítulo 5. Domínio 3.

**Política de bucket** — Uma política baseada em recurso anexada a um bucket S3 que controla o acesso para principais IAM e contas externas. Capítulo 5. Domínio 1.

---

## C

**Padrão cache-aside** — A aplicação verifica o cache primeiro; em caso de miss, consulta o banco de dados e então armazena o resultado no cache. Capítulo 10. Domínio 3.

**Taxa de acerto de cache** — Percentual de requisições servidas a partir do cache em vez da origem. Quanto maior, melhor. Capítulo 13. Domínio 3.

**AWS Client VPN** — Endpoint OpenVPN gerenciado. Conecta dispositivos individuais (laptops, estações de trabalho) a uma VPC pela internet. Autenticação via Active Directory, federação SAML 2.0 com um provedor de identidade ou TLS mútuo. Suporta os modos split-tunnel e full-tunnel. Contraste com a Site-to-Site VPN (rede-para-rede). Capítulo 11. Domínio 1.

**CloudFront** — CDN da AWS. Armazena conteúdo em cache em mais de 750 locais de borda no mundo todo. Reduz a latência e os custos de transferência de dados da origem. Capítulo 13. Domínios 3, 4.

**CloudTrail** — Registra cada chamada de API da AWS: quem, o quê, quando, de onde. Armazenado no S3. Usado para auditoria e investigação de incidentes. Domínio 1.

**CloudWatch** — Métricas, logs, alarmes e dashboards para recursos AWS e aplicações personalizadas. Referenciado ao longo do livro. Todos os domínios.

**Amazon Cognito** — Autenticação para os usuários finais da sua aplicação: os User Pools são um diretório de usuários gerenciado (cadastro, login, MFA, login social, JWTs); os Identity Pools emitem credenciais AWS temporárias. O IAM é para os seus engenheiros; o Cognito é para os seus clientes. Capítulo 14. Domínio 1.

**Cold start (Lambda)** — Atraso na primeira invocação (ou após inatividade) enquanto o Lambda inicializa o ambiente de execução. Use concorrência provisionada para eliminá-lo. Capítulo 20. Domínio 3.

**Compute Savings Plan** — Compromisso com um valor em dólares de gasto horário com EC2, aplicável a qualquer tipo ou tamanho de instância. Capítulo 27. Domínio 4.

**Config (AWS)** — Rastreia alterações de configuração em recursos AWS ao longo do tempo e avalia a conformidade em relação a regras. Capítulo 31. Domínio 1.

**AWS Control Tower** — Automatiza a governança multicontas: cria uma landing zone (contas de gerenciamento, log archive e auditoria) com guardrails em minutos — a versão pré-fabricada da configuração manual de Organizations, CloudTrail e Config. Capítulo 14. Domínio 1.

**Transferência de dados entre AZs** — Tráfego entre Zonas de Disponibilidade dentro de uma região. Cobrado a US$ 0,01/GB em cada direção. Capítulo 30. Domínio 4.

**Replicação entre regiões** — Cópia de dados (S3 CRR, Aurora Global, DynamoDB Global Tables) para uma região diferente. Incorre em custos de transferência de dados. Capítulos 18, 23, 30. Domínio 2.

---

## D

**AWS DataSync** — Migração e sincronização baseadas em agente de compartilhamentos de arquivos (NFS/SMB) para S3, EFS ou FSx. "rsync turbinado, com um console da AWS." Capítulo 25. Domínio 3.

**DAX (DynamoDB Accelerator)** — Cache em memória específico para DynamoDB. Latência de leitura em microssegundos. Capítulo 9. Domínio 3.

**Dead Letter Queue (DLQ)** — Uma fila para onde são enviadas as mensagens que falham no processamento repetidamente, evitando o bloqueio da fila. Capítulo 19. Domínio 2.

**AWS DMS (Database Migration Service)** — Migra bancos de dados para a AWS com tempo de inatividade mínimo. Full load (cópia inicial) mais CDC (Change Data Capture) mantém origem e destino sincronizados durante a migração. Migrações homogêneas (mesmo tipo de motor): use o DMS diretamente. Migrações heterogêneas (tipos de motor diferentes, ex.: Oracle → Aurora PostgreSQL): use o SCT (Schema Conversion Tool) primeiro, depois o DMS. Capítulo 8. Domínio 3.

**Dedicated Host** — Um servidor físico EC2 reservado exclusivamente para o seu uso. Necessário para certas licenças de software. Capítulo 27. Domínio 4.

**Defesa em profundidade** — Empilhar múltiplos controles de segurança (IAM + grupos de segurança + NACLs + WAF + GuardDuty) para que o comprometimento de uma camada não exponha o sistema. Capítulo 33. Domínio 1.

**Direct Connect** — Uma conexão de rede privada dedicada de um local on-premises para a AWS. Mais consistente do que a VPN. Capítulo 25. Domínio 3.

**DLQ** — Ver Dead Letter Queue.

**DynamoDB** — Banco de dados NoSQL totalmente gerenciado com latência de milissegundos de um único dígito em qualquer escala. Modelo de chave-valor e documento. Capítulo 9. Domínio 3.

**DynamoDB Auto Scaling** — Ajusta automaticamente a capacidade de leitura/escrita provisionada com base em métricas do CloudWatch. Capítulo 29. Domínio 4.

**DynamoDB Streams** — Um log de alterações ordenado no tempo de todas as mudanças de itens em uma tabela DynamoDB. Usado com o Lambda para processamento orientado a eventos. Capítulo 9. Domínio 2.

---

## E

**EBS (Elastic Block Store)** — Armazenamento em bloco vinculado a uma única instância EC2. Persiste de forma independente. Tipos: gp3, io2, st1. Capítulo 6. Domínio 3.

**EC2 (Elastic Compute Cloud)** — Máquinas virtuais na nuvem. Capítulo 4. Domínio 3.

**ECS (Elastic Container Service)** — Orquestração de contêineres gerenciada. O tipo de lançamento Fargate elimina o gerenciamento de servidores. Capítulo 21. Domínios 2, 3.

**EFS (Elastic File System)** — Sistema de arquivos NFS compartilhado acessível a partir de múltiplas instâncias EC2. Escala automaticamente. As classes de armazenamento incluem Standard, Infrequent Access e Archive, com Intelligent-Tiering para movimentação automática entre camadas. Capítulo 6. Domínio 3.

**EKS (Elastic Kubernetes Service)** — Plano de controle gerenciado do Kubernetes na AWS. Capítulo 21. Domínio 3.

**Elastic Disaster Recovery (DRS)** — Replicação contínua em nível de bloco de servidores (on-premises ou EC2) para uma área de staging de baixo custo, com instâncias de recuperação iniciadas em minutos — um pilot light gerenciado. Capítulo 18. Domínio 2.

**ElastiCache** — Cache em memória gerenciado. Redis (recursos mais ricos) ou Memcached (mais simples). Capítulo 10. Domínio 3.

**Elastic IP** — Um endereço IP público estático que você pode alocar e reassociar a instâncias EC2. Capítulo 11. Domínio 3.

**Criptografia de envelope** — Um padrão em que os dados são criptografados com uma chave de dados (DEK), e a DEK é criptografada com uma chave mestra (CMK no KMS). Capítulo 16. Domínio 1.

**EventBridge** — Barramento de eventos para rotear eventos de serviços AWS, parceiros SaaS e fontes personalizadas para destinos. Suporta regras agendadas. Capítulo 22. Domínio 2.

**Negação explícita** — Uma instrução de negação do IAM que não pode ser sobreposta por nenhuma permissão. Tem precedência sobre todas as permissões. Capítulo 3. Domínio 1.

---

## F

**Roteamento de failover (Route 53)** — Roteia o tráfego para um endpoint secundário quando o primário falha nas verificações de integridade. Capítulo 12. Domínio 2.

**Fargate** — Motor de computação serverless para ECS e EKS. Sem instâncias EC2 para gerenciar. Capítulo 21. Domínio 3.

**Padrão fan-out** — Um tópico SNS entrega a mesma mensagem para múltiplas filas SQS simultaneamente. Capítulo 19. Domínio 2.

**Fila FIFO (SQS)** — Processamento exatamente-uma-vez, ordenação estrita. Throughput menor do que filas standard. Capítulo 19. Domínio 2.

**Modo de falha** — Uma forma específica pela qual um sistema pode falhar. Identificar modos de falha antes da produção é o cerne da revisão de arquitetura. Capítulo 32. Entre domínios.

---

## G

**Gateway Endpoint** — Um tipo de VPC endpoint gratuito para S3 e DynamoDB. Roteia o tráfego pela rede privada da AWS, eliminando os custos do NAT Gateway. Capítulo 30. Domínio 4.

**Gateway Load Balancer (GWLB)** — Balanceador de carga de Camada 3 para inserir appliances de rede virtuais de terceiros (firewalls, IDS/IPS) inline nos fluxos de tráfego. Capítulo 7. Domínio 1.

**Roteamento por geolocalização (Route 53)** — Roteia com base na localização geográfica da origem da consulta DNS. Capítulo 12. Domínio 3.

**Global Accelerator** — Roteia o tráfego para a borda da AWS mais próxima via Anycast, melhorando a latência para aplicações dinâmicas. Capítulo 25. Domínio 3.

**Glue (AWS)** — ETL serverless. Os Glue Crawlers descobrem o esquema; os Glue Jobs transformam os dados; o Data Catalog armazena os metadados. Capítulo 26. Domínio 3.

**GSI (Global Secondary Index)** — Um índice alternativo em uma tabela DynamoDB com uma chave de partição diferente e uma chave de ordenação opcional. Habilita padrões de consulta flexíveis. Capítulo 9. Domínio 3.

**GuardDuty** — Serviço de detecção de ameaças que usa ML sobre logs do CloudTrail, VPC Flow Logs e logs de DNS para detectar atividade incomum. Capítulo 17. Domínio 1.

---

## H

**Verificação de integridade (Route 53)** — Monitora a disponibilidade de um endpoint. Verificações de integridade com falha acionam o roteamento de failover. Capítulo 12. Domínio 2.

**Partição quente (DynamoDB)** — Uma partição que recebe tráfego desproporcional porque muitas requisições compartilham a mesma chave de partição. Capítulo 9. Domínio 3.

---

## I

**IAM (Identity and Access Management)** — Controla a autenticação e a autorização para contas AWS. Usuários, grupos, funções, políticas. Capítulos 3, 14. Domínio 1.

**Função IAM** — Uma identidade IAM com credenciais temporárias, assumida por serviços, usuários ou outras contas. Capítulos 3, 14. Domínio 1.

**Idempotência** — A propriedade de uma operação que produz o mesmo resultado quer seja chamada uma vez ou muitas vezes. Crítica para sistemas distribuídos (reembolsos, pagamentos, processamento de pedidos). Capítulo 32. Entre domínios.

**Chave de idempotência** — Um identificador único para uma operação, verificado antes da execução para evitar o processamento duplicado. Capítulo 32. Entre domínios.

**Interface Endpoint (PrivateLink)** — Um VPC endpoint para a maioria dos serviços AWS. Cobrado por hora + por GB. Fornece conectividade privada sem internet ou NAT. Capítulo 30. Domínio 4.

**Internet Gateway (IGW)** — Permite que instâncias em sub-redes públicas se comuniquem com a internet. Exige que a tabela de rotas da sub-rede tenha uma rota para o IGW. Capítulo 11. Domínio 3.

**"Depende"** — A resposta honesta para a maioria das perguntas de arquitetura, que deve sempre ser completada: "Depende do padrão de acesso / escala / consequência da falha / restrição de custo." Capítulo 33. Entre domínios.

---

## K

**Kinesis Data Firehose** — Antigo nome do Amazon Data Firehose: entrega gerenciada de dados de streaming para S3, Redshift, OpenSearch. Sem gerenciamento de consumidores. Questões de exame mais antigas ainda podem usar o nome antigo. Capítulo 26. Domínio 3.

**Kinesis Data Streams** — Stream de eventos ordenado em tempo real. Durável, reproduzível dentro da janela de retenção (24 horas por padrão, até 365 dias). Medido em shards. Capítulo 26. Domínio 3.

**KMS (Key Management Service)** — Cria, armazena e controla chaves criptográficas para criptografia em repouso. Capítulo 16. Domínio 1.

---

## L

**Lambda** — Funções serverless acionadas por eventos. Pague por invocação e por ms. Duração máxima de 15 minutos. Capítulo 20. Domínios 2, 3, 4.

**Lambda@Edge** — Funções Lambda que rodam em locais de borda do CloudFront, modificando requisições e respostas. Capítulo 13. Domínio 3.

**AWS Lake Formation** — Camada centralizada de controle de acesso a data lake sobre o S3 e o Glue Data Catalog. Fornece permissões granulares em nível de tabela, coluna e linha. Simplifica a configuração de data lake seguro. Capítulo 26. Domínio 3.

**Roteamento baseado em latência (Route 53)** — Roteia consultas DNS para a região AWS com a menor latência medida. Capítulo 12. Domínio 3.

**Launch template** — Um modelo versionado que especifica a configuração de instâncias EC2 para Auto Scaling Groups. Capítulo 7. Domínio 3.

**Menor privilégio** — Boa prática do IAM: conceda apenas as permissões necessárias, nada mais. Capítulo 3. Domínio 1.

**Política de ciclo de vida (S3)** — Regras que automaticamente fazem a transição de objetos para classes de armazenamento mais baratas ou os excluem com base na idade. Capítulo 23. Domínio 4.

**LSI (Local Secondary Index)** — Um índice alternativo em uma tabela DynamoDB usando a mesma chave de partição, mas uma chave de ordenação diferente. Deve ser criado na criação da tabela. Capítulo 9. Domínio 3.

---

## M

**Amazon Macie** — Descoberta baseada em ML de dados sensíveis (PII) no S3 e sinalização de riscos de exposição. O GuardDuty observa comportamento; o Macie audita o que está armazenado. Capítulo 17. Domínio 1.

**Memcached** — Motor de cache em memória simples e multithread. Sem persistência, sem estruturas de dados. Use Redis, a menos que você precise especificamente de multithreading ao custo de funcionalidades. Capítulo 10. Domínio 3.

**Amazon MemoryDB for Redis** — Banco de dados primário em memória, durável e compatível com Redis. Ao contrário do ElastiCache, o MemoryDB grava em um log de transações Multi-AZ, garantindo a durabilidade dos dados. Use quando a compatibilidade com a API do Redis for necessária E a perda de dados não for aceitável. Capítulo 10. Domínio 3.

**MGN (AWS Application Migration Service)** — Rehospedagem/lift-and-shift: replicação em nível de bloco de servidores inteiros para a AWS, lançamentos de teste e, em seguida, cutover para instâncias EC2 nativas. O DataSync move arquivos; o DMS move bancos de dados; o MGN move servidores. Capítulo 25. Domínio 3.

**Amazon MQ** — Broker gerenciado ActiveMQ/RabbitMQ que fala protocolos padrão (AMQP, MQTT, STOMP). Para lift-and-shift de cargas de trabalho de broker existentes sem alterações de código; mensageria em projeto novo (greenfield) → SQS/SNS. Capítulo 19. Domínio 2.

**Multi-AZ (RDS)** — Réplica standby síncrona em uma AZ diferente com failover automático. RPO ~0, RTO ~60 segundos. Para alta disponibilidade, não para escalonamento de leitura. Capítulos 8, 18. Domínio 2.

**Multi-Region** — Implantar componentes da aplicação em múltiplas regiões AWS para redundância geográfica e desempenho global. Maior complexidade e custo. Capítulo 18. Domínio 2.

---

## N

**Network Load Balancer (NLB)** — Balanceador de carga de Camada 4 (TCP/UDP/TLS): milhões de requisições por segundo, IP estático por AZ, preserva o IP de origem. Sem consciência de HTTP — esse é o trabalho do ALB. Capítulo 7. Domínio 3.

**NACL (Network Access Control List)** — Firewall sem estado no nível da sub-rede. Exige regras de entrada e de saída. As regras são avaliadas em ordem numérica. Capítulo 15. Domínio 1.

**NAT Gateway** — Permite que instâncias em sub-redes privadas façam conexões de saída para a internet. Cobra US$ 0,045/GB processado. Capítulos 11, 30. Domínio 4.

---

## O

**Objeto (S3)** — Um arquivo armazenado no S3. Consiste em chave (nome), valor (dados) e metadados. Tamanho máximo de 5 TB. Capítulo 5. Domínio 3.

**Capacidade On-Demand (DynamoDB)** — Modo de pagamento por requisição. Mais caro por requisição do que o provisionado, mas sem necessidade de planejamento de capacidade. Capítulo 29. Domínio 4.

**Instâncias On-Demand (EC2)** — Pague por hora sem compromisso. Máxima flexibilidade, máximo preço. Capítulo 27. Domínio 4.

**AWS Outposts** — Um rack totalmente gerenciado de hardware AWS instalado no próprio data center do cliente ou em uma instalação de colocation. Executa os mesmos serviços, APIs e ferramentas da AWS da nuvem pública, on-premises. A AWS gerencia a instalação e os patches; o cliente fornece o espaço do rack e a energia. Para residência de dados, cargas de trabalho on-premises de baixa latência ou cenários desconectados. Capítulo 2. Domínio 4.

---

## P

**Chave de partição (DynamoDB)** — O componente da chave primária que determina qual partição armazena um item. Escolha uma chave de alta cardinalidade para distribuição uniforme. Capítulo 9. Domínio 3.

**Permission boundary** — Uma política IAM que define o máximo de permissões que uma identidade IAM pode ter, mesmo que outras políticas concedam mais. Capítulo 14. Domínio 1.

**Grupo de posicionamento** — Controla o posicionamento físico de instâncias EC2 para minimizar a latência (cluster) ou maximizar a disponibilidade (spread). Capítulo 4. Domínio 3.

**PrivateLink** — Serviço da AWS para criar endpoints privados a serviços hospedados na AWS, acessíveis via Interface Endpoints. Capítulo 30. Domínio 1.

**Concorrência provisionada (Lambda)** — Ambientes de execução pré-inicializados que eliminam os atrasos de cold start. Capítulo 20. Domínio 3.

**Capacidade provisionada (DynamoDB)** — Throughput de leitura e escrita pré-alocado, medido em unidades de capacidade por segundo. Mais barato do que on-demand para tráfego previsível. Capítulos 9, 29. Domínio 4.

---

## Q

**Amazon QuickSight** — Serviço gerenciado de business intelligence e visualização de dados. Usa o SPICE (Super-fast, Parallel, In-memory Calculation Engine) para armazenar dados em cache e renderizar dashboards rapidamente. Conecta-se a Athena, S3, Redshift, RDS e outras fontes de dados da AWS. Sem servidor de BI para gerenciar. Capítulo 26. Domínio 3.

---

## R

**RDS (Relational Database Service)** — Banco de dados relacional gerenciado. Cuida de backups, patches, failover. Capítulo 8. Domínio 3.

**RDS Proxy** — Gerencia um pool de conexões entre Lambda/aplicação e RDS, evitando o esgotamento de conexões. Capítulo 8. Domínio 3.

**Read Replica (RDS)** — Cópia assíncrona do banco de dados para escalonamento de leitura. NÃO fornece failover automático. Capítulos 8, 24. Domínio 3.

**Redis** — Armazenamento de estruturas de dados em memória usado para cache, gerenciamento de sessões, placares em tempo real, pub/sub. Capítulo 10. Domínio 3.

**Reserved Instance (EC2)** — Um compromisso de usar um tipo de instância específico em uma região específica por 1 ou 3 anos em troca de um desconto. Capítulo 27. Domínio 4.

**Route 53** — Serviço de DNS e registrador de domínios da AWS. Suporta múltiplas políticas de roteamento. Capítulo 12. Domínios 2, 3.

**RPO (Recovery Point Objective)** — Perda máxima de dados aceitável, medida em tempo. "Quantos dados podemos nos dar ao luxo de perder?" Capítulo 18. Domínio 2.

**RTO (Recovery Time Objective)** — Tempo máximo aceitável para restaurar o serviço após uma falha. "Por quanto tempo podemos ficar indisponíveis?" Capítulo 18. Domínio 2.

**Runbook** — Instruções passo a passo para operar um sistema, especificamente para resposta a incidentes. "O que alguém faz às 3 da manhã?" Capítulo 32. Entre domínios.

---

## S

**S3 Intelligent-Tiering** — Move automaticamente objetos do S3 entre camadas de acesso com base nos padrões de acesso. Sem taxa de recuperação. Capítulo 23. Domínio 4.

**S3 Select** — Recupera um subconjunto do conteúdo de um objeto S3 usando expressões SQL, reduzindo a transferência de dados. Legado: indisponível para novos clientes desde meados de 2024 — o Athena é agora o caminho principal para filtrar e consultar dados no S3. O S3 Object Lambda, antes a alternativa sugerida, é ele próprio legado (fechado para novos clientes em novembro de 2025; cargas de trabalho existentes continuam funcionando). Capítulo 30. Domínio 4.

**Savings Plan** — Um modelo de preços flexível que se compromete com um valor em dólares de gasto horário em troca de um desconto. Mais flexível do que as Reserved Instances. Capítulo 27. Domínio 4.

**SCP (Service Control Policy)** — Política das AWS Organizations que restringe o máximo de permissões disponíveis para as contas em uma OU. Capítulo 14. Domínio 1.

**Secrets Manager** — Armazena e rotaciona automaticamente segredos (senhas de banco de dados, chaves de API). Capítulo 16. Domínio 1.

**Grupo de segurança** — Um firewall virtual com estado no nível da instância. Apenas regras de permissão; o tráfego de retorno é automático. Capítulo 15. Domínio 1.

**Shard (Kinesis)** — A unidade base de throughput no Kinesis Data Streams: 1 MB/s de escrita, 2 MB/s de leitura. Capítulo 26. Domínio 3.

**Modelo de Responsabilidade Compartilhada** — A AWS é responsável pela segurança *da* nuvem (infraestrutura); você é responsável pela segurança *na* nuvem (dados, configuração, acesso). Capítulo 1. Domínio 1.

**Shield** — Proteção contra DDoS. Standard: gratuito, automático. Advanced: pago, com suporte do DRT e proteção financeira. Capítulo 17. Domínio 1.

**Snow Family** — Dispositivos físicos para transferência de dados em massa offline (Snowball Edge: 80 TB) — fretar um voo de carga em vez de dirigir pela rodovia. Legado (2026): Snowmobile e Snowcone descontinuados; dispositivos Snow fechados para novos clientes em novembro de 2025 (a AWS indica DataSync e Data Transfer Terminals), mas o exame SAA-C03 ainda espera o Snowball para "semanas de transferência, largura de banda limitada". Capítulo 25. Domínio 3.

**SNS (Simple Notification Service)** — Mensageria pub/sub. Envia mensagens para todos os assinantes simultaneamente. Padrão fan-out. Capítulo 19. Domínio 2.

**Chave de ordenação (DynamoDB)** — Segundo componente opcional da chave primária. Habilita consultas por intervalo dentro de uma partição. Capítulo 9. Domínio 3.

**Spot Instances** — Instâncias EC2 que usam capacidade ociosa com 60-90% de desconto. Podem ser interrompidas com aviso de 2 minutos. Apenas para cargas de trabalho tolerantes a falhas. Capítulo 27. Domínio 4.

**SQS (Simple Queue Service)** — Fila de mensagens gerenciada. Desacopla produtores de consumidores. Filas Standard (ao-menos-uma-vez) e FIFO (exatamente-uma-vez). Capítulo 19. Domínio 2.

**Step Functions** — Serviço de orquestração de fluxos de trabalho serverless. Máquinas de estados para coordenar serviços AWS. Capítulo 22. Domínio 2.

**AWS Storage Gateway** — A ponte entre o armazenamento on-premises e em nuvem: apresenta interfaces NFS/SMB (File), iSCSI (Volume) ou fita virtual (Tape) localmente enquanto persiste os dados no S3, Glacier ou snapshots do EBS. Capítulo 6. Domínio 3.

---

## T

**Escalonamento por rastreamento de destino** — Política de Auto Scaling que ajusta a capacidade para manter um valor-alvo de métrica (ex.: 60% de utilização de CPU). Capítulo 7. Domínio 2.

**AWS Transfer Family** — Endpoint SFTP/FTPS/FTP gerenciado, apoiado por S3 ou EFS. Os parceiros mantêm seus clientes SFTP existentes; os arquivos chegam diretamente ao seu bucket. Capítulo 25. Domínio 3.

**Transit Gateway** — Topologia de rede hub-and-spoke que conecta múltiplas VPCs e redes on-premises por meio de um gateway central. Capítulo 25. Domínio 3.

**TTL (Time to Live)** — Um timestamp após o qual o DynamoDB exclui automaticamente um item. Também usado em DNS (por quanto tempo os resolvedores armazenam um registro em cache) e em cache (por quanto tempo um valor em cache é válido). Capítulos 9, 12. Domínio 3.

---

## V

**VIF (Virtual Interface)** — A conexão lógica usada com o AWS Direct Connect. A VIF pública acessa endpoints públicos da AWS; a VIF privada acessa recursos da VPC. Capítulo 25. Domínio 3.

**Timeout de visibilidade (SQS)** — O período durante o qual uma mensagem recebida fica oculta de outros consumidores. Permite o processamento sem que outros consumidores vejam a mesma mensagem. Capítulo 19. Domínio 2.

**VPC (Virtual Private Cloud)** — Uma rede virtual isolada na AWS. Contém sub-redes, tabelas de rotas e gateways. Capítulo 11. Domínio 1.

**VPC Endpoint** — Conecta recursos da VPC a serviços AWS pela rede privada da AWS. Gateway (gratuito, S3/DynamoDB) e Interface (cobrado, a maioria dos outros serviços). Capítulo 30. Domínios 1, 4.

**VPC Flow Logs** — Captura informações sobre o tráfego IP que vai para e de interfaces de rede em uma VPC. Usado pelo GuardDuty e para diagnóstico de rede. Capítulo 17. Domínio 1.

**VPC Peering** — Uma conexão de rede entre duas VPCs que permite o roteamento de tráfego entre elas usando endereços IP privados. Capítulo 11. Domínio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra o tráfego HTTP/HTTPS usando regras (bloqueios de IP, injeção de SQL, limites de taxa). Vincula-se a CloudFront, ALB ou API Gateway. Capítulo 17. Domínio 1.

**AWS Wavelength** — Infraestrutura AWS implantada dentro das redes de provedores de telecomunicações 5G, na borda de rádio. Permite latência de milissegundos de um único dígito para dispositivos móveis. Para AR/VR móvel, jogos em tempo real, telemetria de veículos autônomos e vídeo ao vivo na borda 5G. As Wavelength Zones são extensões das Regiões AWS dentro das redes de telecomunicações. Capítulo 2. Domínio 3.

**Well-Architected Framework** — Framework de avaliação de seis pilares da AWS: Excelência Operacional, Segurança, Confiabilidade, Eficiência de Desempenho, Otimização de Custos, Sustentabilidade. Capítulo 31. Entre domínios.

**Roteamento ponderado (Route 53)** — Distribui as consultas DNS entre endpoints por peso. Usado para implantações blue-green e testes A/B. Capítulo 12. Domínio 3.

**Cache write-through** — Atualiza o cache sempre que o banco de dados é atualizado. Os dados estão sempre consistentes, mas o cache pode reter muitos itens que nunca são relidos. Capítulo 10. Domínio 3.

---

## Referência Rápida de Padrões SAA-C03

| Se o exame disser...                          | Pense...                                     |
|-----------------------------------------------|----------------------------------------------|
| "Desacoplar serviços"                         | SQS, SNS, EventBridge                        |
| "Fan-out para múltiplos consumidores"         | SNS + assinaturas SQS                        |
| "Eventos ordenados em tempo real"             | Kinesis Data Streams                         |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate |
| "Baixa latência global (dinâmico)"            | Global Accelerator                           |
| "Baixa latência global (estático/em cache)"   | CloudFront                                   |
| "Proteção contra DDoS"                        | Shield (Standard: gratuito; Advanced: pago)  |
| "Bloquear injeção de SQL na borda"            | WAF                                          |
| "Detectar credenciais comprometidas"          | GuardDuty                                    |
| "Auditar atividade de API"                    | CloudTrail                                   |
| "Rotacionar credenciais de banco de dados"    | Secrets Manager                              |
| "Criptografar dados em repouso, chaves gerenciadas pelo cliente" | KMS com CMK               |
| "Armazenar valores de configuração"           | SSM Parameter Store                          |
| "Armazenamento de banco de dados de alto IOPS" | EBS io2                                     |
| "Sistema de arquivos compartilhado para EC2"  | EFS                                          |
| "Consultar dados do S3 com SQL"               | Athena                                       |
| "Pipeline de ETL para análise"                | AWS Glue                                     |
| "Entregar dados de streaming para o S3"       | Amazon Data Firehose                         |
| "Jobs em lote tolerantes a falhas, minimizar custo" | Spot Instances                         |
| "Carga de trabalho de produção comprometida e estável" | Savings Plans                       |
| "Sub-rede privada → S3 sem NAT"               | S3 Gateway Endpoint                          |
| "Sub-rede privada → SQS sem NAT"              | SQS Interface Endpoint                       |
| "Multi-AZ para RDS"                           | Failover automático (não escalonamento de leitura) |
| "Read Replica para RDS"                       | Escalonamento de leitura (não failover automático) |
| "Tempo de recuperação de 1–2 minutos, entre AZs" | Multi-AZ (failover do RDS: 60–120 segundos) |
| "Recuperação entre regiões, RTO de minutos"   | Pilot Light ou Warm Standby                  |
| "Active-Active, RTO zero"                     | Multi-Region Active-Active (o mais complexo) |
| "Processamento em lote além do timeout do Lambda" | AWS Batch                               |
| "Compatível com Redis E durável"             | MemoryDB for Redis                           |
| "Engenheiros remotos acessam a VPC de casa"   | Client VPN                                   |
| "Migrar banco de dados com tempo de inatividade mínimo" | DMS (+ SCT para heterogêneo)        |
| "Dashboard de BI na AWS"                      | QuickSight                                   |
| "Executar AWS no seu próprio data center"     | Outposts                                     |
| "Computação na borda móvel 5G"                | Wavelength                                   |
