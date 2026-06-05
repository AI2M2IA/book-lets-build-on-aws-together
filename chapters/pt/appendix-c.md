# Apêndice C: Registro de Conceitos

Cada conceito-chave introduzido no livro, mapeado para seu capítulo, a analogia usada e o domínio SAA-C03 onde aparece.

Use como índice de estudo: se estiver inseguro sobre um conceito antes do exame, encontre-o aqui e volte ao capítulo para o contexto.

---

## A

**ACU (Aurora Capacity Unit)** — A unidade de medida para a capacidade do Aurora Serverless v2. Escala automaticamente. Capítulo 24. Domínio 3.

**Alarme (CloudWatch)** — Uma regra que é acionada quando uma métrica cruza um limite, disparando uma notificação ou ação de auto scaling. Capítulo 7. Domínio 2.

**ALB (Application Load Balancer)** — Balanceador de carga de Camada 7 que roteia tráfego HTTP/HTTPS com base em regras de caminho e host. Capítulo 7. Domínio 2.

**AMI (Amazon Machine Image)** — Um template contendo o SO, software e configuração para uma instância EC2. Capítulo 4. Domínio 3.

**Mentalidade de arquiteto** — Perguntar "o que quebra primeiro, como sabemos e o que alguém faz às 3 da manhã?" em vez de apenas "como isso funciona?". Capítulo 32, Capítulo 34. Domínio cruzado.

**Architecture Decision Record (ADR)** — Um documento curto que captura uma decisão, suas alternativas, seu fundamento e o que causaria reconsideração. Capítulo 32. Domínio cruzado.

**Revisão de arquitetura** — Um processo estruturado cobrindo: restrições → incógnitas → opções → modos de falha → monitoramento → runbooks. Capítulo 32. Domínio cruzado.

**Athena** — Serviço de consulta SQL serverless para dados no S3. Pague por TB verificado. Melhor com formatos colunares Parquet/ORC. Capítulo 26. Domínio 3.

**Auto Scaling Group (ASG)** — Um grupo de instâncias EC2 gerenciadas juntas, substituindo automaticamente instâncias não saudáveis e escalando com base na carga. Capítulo 7. Domínio 2, 3.

**Availability Zone (AZ)** — Um ou mais data centers fisicamente separados dentro de uma região, conectados por links de baixa latência. Capítulo 2. Domínio 2.

---

## B

**Bucket (S3)** — Um contêiner para objetos S3. Os buckets têm nomes únicos globais e ficam em uma região específica. Capítulo 5. Domínio 3.

**Política de bucket** — Uma política baseada em recurso vinculada a um bucket S3, controlando o acesso para principais IAM e contas externas. Capítulo 5. Domínio 1.

---

## C

**Padrão cache-aside** — A aplicação verifica o cache primeiro; em caso de miss, consulta o banco de dados e armazena o resultado no cache. Capítulo 10. Domínio 3.

**Taxa de acertos de cache** — Porcentagem de requisições servidas pelo cache em vez da origem. Quanto maior, melhor. Capítulo 13. Domínio 3.

**CloudFront** — CDN da AWS. Armazena conteúdo em cache em mais de 400 locais de borda no mundo todo. Reduz a latência e os custos de transferência de dados da origem. Capítulo 13. Domínio 3, 4.

**CloudTrail** — Registra cada chamada de API AWS: quem, o quê, quando, de onde. Armazenado no S3. Usado para auditoria e investigação de incidentes. Domínio 1.

**CloudWatch** — Métricas, logs, alarmes e painéis para recursos AWS e aplicações personalizadas. Referenciado ao longo do livro. Todos os domínios.

**Cold start (Lambda)** — Atraso na primeira invocação (ou após inatividade) enquanto o Lambda inicializa o ambiente de execução. Use concorrência provisionada para eliminar. Capítulo 20. Domínio 3.

**Compute Savings Plan** — Compromisso com um valor de gasto horário EC2, aplicável a qualquer tipo ou tamanho de instância. Capítulo 27. Domínio 4.

**Config (AWS)** — Rastreia as alterações de configuração de recursos AWS ao longo do tempo e avalia a conformidade em relação a regras. Capítulo 31. Domínio 1.

**Transferência de dados entre AZs** — Tráfego entre Zonas de Disponibilidade dentro de uma região. Cobrado a US$ 0,01/GB em cada direção. Capítulo 30. Domínio 4.

**Replicação entre regiões** — Copiar dados (S3 CRR, Aurora Global, DynamoDB Global Tables) para uma região diferente. Incorre em cobranças de transferência de dados. Capítulos 18, 30. Domínio 2.

---

## D

**DAX (DynamoDB Accelerator)** — Cache na memória especificamente para DynamoDB. Latência de leitura em microssegundos. Capítulo 9. Domínio 3.

**Dead Letter Queue (DLQ)** — Uma fila para onde são enviadas mensagens que falham repetidamente no processamento, evitando o bloqueio da fila. Capítulo 19. Domínio 2.

**Dedicated Host** — Um servidor EC2 físico reservado exclusivamente para seu uso. Necessário para certas licenças de software. Capítulo 27. Domínio 4.

**Defesa em profundidade** — Empilhar múltiplos controles de segurança (IAM + grupos de segurança + NACLs + WAF + GuardDuty) para que o comprometimento de uma camada não exponha o sistema. Capítulo 33. Domínio 1.

**Direct Connect** — Uma conexão de rede privada dedicada de um local on-premises para a AWS. Mais consistente do que VPN. Capítulo 25. Domínio 3.

**DLQ** — Veja Dead Letter Queue.

**DynamoDB** — Banco de dados NoSQL totalmente gerenciado com latência de milissegundo de um dígito em qualquer escala. Modelo de chave-valor e documento. Capítulo 9. Domínio 3.

**DynamoDB Auto Scaling** — Ajusta automaticamente a capacidade de leitura/escrita provisionada com base em métricas do CloudWatch. Capítulo 29. Domínio 4.

**DynamoDB Streams** — Um log de alterações ordenado cronologicamente de todas as alterações de itens em uma tabela DynamoDB. Usado com Lambda para processamento orientado a eventos. Capítulo 9. Domínio 2.

---

## E

**EBS (Elastic Block Store)** — Armazenamento em bloco vinculado a uma única instância EC2. Persiste independentemente. Tipos: gp3, io2, st1. Capítulo 6. Domínio 3.

**EC2 (Elastic Compute Cloud)** — Máquinas virtuais na nuvem. Capítulo 4. Domínio 3.

**ECS (Elastic Container Service)** — Orquestração de contêineres gerenciada. O tipo de lançamento Fargate elimina o gerenciamento de servidores. Capítulo 21. Domínio 2, 3.

**EFS (Elastic File System)** — Sistema de arquivos NFS compartilhado acessível a partir de múltiplas instâncias EC2. Escala automaticamente. Capítulo 6. Domínio 3.

**EKS (Elastic Kubernetes Service)** — Plano de controle Kubernetes gerenciado na AWS. Capítulo 21. Domínio 3.

**ElastiCache** — Cache na memória gerenciado. Redis (recursos mais ricos) ou Memcached (mais simples). Capítulo 10. Domínio 3.

**Elastic IP** — Um endereço IP público estático que você pode alocar e reatribuir a instâncias EC2. Capítulo 11. Domínio 3.

**Criptografia de envelope** — Um padrão onde os dados são criptografados com uma chave de dados (DEK), e a DEK é criptografada com uma chave mestra (CMK no KMS). Capítulo 16. Domínio 1.

**EventBridge** — Barramento de eventos para rotear eventos de serviços AWS, parceiros SaaS e fontes personalizadas para destinos. Suporta regras agendadas. Capítulo 22. Domínio 2.

**Negação explícita** — Uma declaração de negação IAM que não pode ser substituída por nenhuma permissão. Tem precedência sobre todas as permissões. Capítulo 3. Domínio 1.

---

## F

**Roteamento de failover (Route 53)** — Roteia o tráfego para um endpoint secundário quando o primário falha nas verificações de integridade. Capítulo 12. Domínio 2.

**Fargate** — Motor de computação serverless para ECS e EKS. Sem instâncias EC2 para gerenciar. Capítulo 21. Domínio 3.

**Padrão fan-out** — Um tópico SNS entrega a mesma mensagem para múltiplas filas SQS simultaneamente. Capítulo 19. Domínio 2.

**Fila FIFO (SQS)** — Processamento exatamente-uma-vez, ordenação estrita. Menor throughput do que filas standard. Capítulo 19. Domínio 2.

**Modo de falha** — Uma forma específica pela qual um sistema pode falhar. Identificar os modos de falha antes da produção é o núcleo da revisão de arquitetura. Capítulo 32. Domínio cruzado.

---

## G

**Gateway Endpoint** — Um tipo de VPC endpoint gratuito para S3 e DynamoDB. Roteia o tráfego pela rede privada AWS, eliminando as cobranças do NAT Gateway. Capítulo 30. Domínio 4.

**Roteamento por geolocalização (Route 53)** — Roteia com base na localização geográfica da origem da consulta DNS. Capítulo 12. Domínio 3.

**Global Accelerator** — Roteia o tráfego para a borda AWS mais próxima via Anycast, melhorando a latência para aplicações dinâmicas. Capítulo 25. Domínio 3.

**Glue (AWS)** — ETL serverless. Os Glue Crawlers descobrem esquemas; os Glue Jobs transformam dados; o Data Catalog armazena metadados. Capítulo 26. Domínio 3.

**GSI (Global Secondary Index)** — Um índice alternativo em uma tabela DynamoDB com uma chave de partição diferente e chave de ordenação opcional. Habilita padrões de consulta flexíveis. Capítulo 9. Domínio 3.

**GuardDuty** — Serviço de detecção de ameaças usando ML em CloudTrail, VPC Flow Logs e logs DNS para detectar atividades incomuns. Capítulo 17. Domínio 1.

---

## H

**Verificação de integridade (Route 53)** — Monitora a disponibilidade do endpoint. Verificações de integridade com falha acionam o roteamento de failover. Capítulo 12. Domínio 2.

**Partição quente (DynamoDB)** — Uma partição recebendo tráfego desproporcional porque muitas requisições compartilham a mesma chave de partição. Capítulo 9. Domínio 3.

---

## I

**IAM (Identity and Access Management)** — Controla autenticação e autorização para contas AWS. Usuários, grupos, funções, políticas. Capítulo 3, 14. Domínio 1.

**Função IAM** — Uma identidade IAM com credenciais temporárias, assumida por serviços, usuários ou outras contas. Capítulo 3, 14. Domínio 1.

**Idempotência** — A propriedade de uma operação que produz o mesmo resultado independentemente de ser chamada uma ou muitas vezes. Crítica para sistemas distribuídos (reembolsos, pagamentos, processamento de pedidos). Capítulo 32. Domínio cruzado.

**Chave de idempotência** — Um identificador único para uma operação, verificado antes da execução para evitar processamento duplicado. Capítulo 32. Domínio cruzado.

**Interface Endpoint (PrivateLink)** — Um VPC endpoint para a maioria dos serviços AWS. Cobrado por hora + por GB. Fornece conectividade privada sem internet ou NAT. Capítulo 30. Domínio 4.

**Internet Gateway (IGW)** — Permite que instâncias em sub-redes públicas se comuniquem com a internet. Requer que a tabela de rotas da sub-rede tenha uma rota para o IGW. Capítulo 11. Domínio 3.

**"Depende"** — A resposta honesta para a maioria das perguntas de arquitetura, que deve sempre ser completada: "Depende do padrão de acesso / escala / consequência da falha / restrição de custo." Capítulo 33. Domínio cruzado.

---

## K

**Kinesis Data Firehose** — Entrega gerenciada de dados de streaming para S3, Redshift, OpenSearch. Sem gerenciamento de consumidores. Capítulo 26. Domínio 3.

**Kinesis Data Streams** — Stream de eventos ordenados em tempo real. Durável, reproduzível. Medido em shards. Capítulo 26. Domínio 3.

**KMS (Key Management Service)** — Cria, armazena e controla chaves criptográficas para criptografia em repouso. Capítulo 16. Domínio 1.

---

## L

**Lambda** — Funções serverless acionadas por eventos. Pague por invocação e por ms. Duração máxima de 15 minutos. Capítulo 20. Domínio 2, 3, 4.

**Lambda@Edge** — Funções Lambda que são executadas nos locais de borda do CloudFront, modificando requisições e respostas. Capítulo 13. Domínio 3.

**Roteamento baseado em latência (Route 53)** — Roteia consultas DNS para a região AWS com a menor latência medida. Capítulo 12. Domínio 3.

**Template de lançamento** — Um template versionado especificando a configuração de instância EC2 para Auto Scaling Groups. Capítulo 7. Domínio 3.

**Mínimo privilégio** — Melhor prática IAM: conceda apenas as permissões necessárias, nada mais. Capítulo 3. Domínio 1.

**Política de ciclo de vida (S3)** — Regras que fazem a transição automática de objetos para classes de armazenamento mais baratas ou os excluem com base na idade. Capítulo 23. Domínio 4.

**LSI (Local Secondary Index)** — Um índice alternativo em uma tabela DynamoDB usando a mesma chave de partição, mas uma chave de ordenação diferente. Deve ser criado no momento da criação da tabela. Capítulo 9. Domínio 3.

---

## M

**Memcached** — Motor de cache na memória simples e multi-threaded. Sem persistência, sem estruturas de dados. Use Redis a menos que você precise especificamente de multi-threading ao custo de recursos. Capítulo 10. Domínio 3.

**Multi-AZ (RDS)** — Réplica standby síncrona em uma AZ diferente com failover automático. RPO ~0, RTO ~60 segundos. Para alta disponibilidade, não escalonamento de leitura. Capítulo 8, 18. Domínio 2.

**Multi-Region** — Implantação de componentes de aplicação em múltiplas regiões AWS para redundância geográfica e desempenho global. Maior complexidade e custo. Capítulo 18. Domínio 2.

---

## N

**NACL (Network Access Control List)** — Firewall sem estado no nível de sub-rede. Requer regras de entrada e saída. Regras avaliadas em ordem numérica. Capítulo 15. Domínio 1.

**NAT Gateway** — Permite que instâncias em sub-redes privadas façam conexões de saída para a internet. Cobra US$ 0,045/GB processado. Capítulo 11, 30. Domínio 4.

---

## O

**Objeto (S3)** — Um arquivo armazenado no S3. Consiste em chave (nome), valor (dados) e metadados. Tamanho máximo de 5 TB. Capítulo 5. Domínio 3.

**Capacidade On-Demand (DynamoDB)** — Modo de pagamento por requisição. Mais caro por requisição do que o provisionado, mas sem necessidade de planejamento de capacidade. Capítulo 29. Domínio 4.

**Instâncias On-Demand (EC2)** — Pague por hora sem compromisso. Máxima flexibilidade, preço máximo. Capítulo 27. Domínio 4.

---

## P

**Chave de partição (DynamoDB)** — O componente de chave primária que determina qual partição armazena um item. Escolha uma chave de alta cardinalidade para distribuição uniforme. Capítulo 9. Domínio 3.

**Limite de permissão** — Uma política IAM que define as permissões máximas que uma identidade IAM pode ter, mesmo que outras políticas concedam mais. Capítulo 14. Domínio 1.

**Grupo de posicionamento** — Controla o posicionamento físico das instâncias EC2 para minimizar a latência (cluster) ou maximizar a disponibilidade (spread). Capítulo 4. Domínio 3.

**PrivateLink** — Serviço AWS para criar endpoints privados para serviços hospedados na AWS, acessíveis via Interface Endpoints. Capítulo 30. Domínio 1.

**Concorrência provisionada (Lambda)** — Ambientes de execução pré-inicializados que eliminam os atrasos de cold start. Capítulo 20. Domínio 3.

**Capacidade provisionada (DynamoDB)** — Throughput de leitura e escrita pré-alocado, medido em unidades de capacidade por segundo. Mais barato do que on-demand para tráfego previsível. Capítulo 9, 29. Domínio 4.

---

## R

**RDS (Relational Database Service)** — Banco de dados relacional gerenciado. Lida com backups, patches, failover. Capítulo 8. Domínio 3.

**RDS Proxy** — Gerencia um pool de conexões entre Lambda/aplicação e RDS, evitando o esgotamento de conexões. Capítulo 8. Domínio 3.

**Réplica de Leitura (RDS)** — Cópia assíncrona do banco de dados para escalonamento de leitura. NÃO fornece failover automático. Capítulo 8, 24. Domínio 3.

**Redis** — Repositório de estrutura de dados na memória usado para cache, gerenciamento de sessões, placares em tempo real, pub/sub. Capítulo 10. Domínio 3.

**Reserved Instance (EC2)** — Um compromisso de usar um tipo de instância específico em uma região específica por 1 ou 3 anos em troca de desconto. Capítulo 27. Domínio 4.

**Route 53** — Serviço DNS e registrador de domínios da AWS. Suporta múltiplas políticas de roteamento. Capítulo 12. Domínio 2, 3.

**RPO (Recovery Point Objective)** — Perda máxima de dados aceitável medida em tempo. "Quanta perda de dados podemos nos dar ao luxo de ter?" Capítulo 18. Domínio 2.

**RTO (Recovery Time Objective)** — Tempo máximo aceitável para restaurar o serviço após uma falha. "Por quanto tempo podemos ficar inativos?" Capítulo 18. Domínio 2.

**Runbook** — Instruções passo a passo para operar um sistema, especificamente para resposta a incidentes. "O que alguém faz às 3 da manhã?" Capítulo 32. Domínio cruzado.

---

## S

**S3 Intelligent-Tiering** — Move automaticamente os objetos S3 entre camadas de acesso com base nos padrões de acesso. Sem taxa de recuperação. Capítulo 23. Domínio 4.

**S3 Select** — Recupera um subconjunto do conteúdo de um objeto S3 usando expressões SQL, reduzindo a transferência de dados. Capítulo 30. Domínio 4.

**Savings Plan** — Um modelo de preços flexível com compromisso de um valor de gasto horário em troca de desconto. Mais flexível do que Reserved Instances. Capítulo 27. Domínio 4.

**SCP (Service Control Policy)** — Política das AWS Organizations que restringe as permissões máximas disponíveis para contas em uma OU. Capítulo 14. Domínio 1.

**Secrets Manager** — Armazena e rotaciona automaticamente segredos (senhas de banco de dados, chaves de API). Capítulo 16. Domínio 1.

**Grupo de segurança** — Um firewall virtual com estado no nível de instância. Apenas regras de permissão; o tráfego de retorno é automático. Capítulo 15. Domínio 1.

**Shard (Kinesis)** — A unidade base de throughput no Kinesis Data Streams: 1 MB/s de escrita, 2 MB/s de leitura. Capítulo 26. Domínio 3.

**Modelo de Responsabilidade Compartilhada** — A AWS é responsável pela segurança *da* nuvem (infraestrutura); você é responsável pela segurança *na* nuvem (dados, configuração, acesso). Capítulo 1. Domínio 1.

**Shield** — Proteção contra DDoS. Standard: gratuito, automático. Advanced: pago, com suporte da equipe DRT e proteção financeira. Capítulo 17. Domínio 1.

**SNS (Simple Notification Service)** — Mensagens pub/sub. Envia mensagens para todos os assinantes simultaneamente. Padrão fan-out. Capítulo 19. Domínio 2.

**Chave de ordenação (DynamoDB)** — Segundo componente opcional da chave primária. Habilita consultas de intervalo dentro de uma partição. Capítulo 9. Domínio 3.

**Spot Instances** — Instâncias EC2 usando capacidade reserva com desconto de 60-90%. Podem ser interrompidas com 2 minutos de aviso. Apenas para cargas de trabalho tolerantes a falhas. Capítulo 27. Domínio 4.

**SQS (Simple Queue Service)** — Fila de mensagens gerenciada. Desacopla produtores de consumidores. Filas Standard (ao-menos-uma-vez) e FIFO (exatamente-uma-vez). Capítulo 19. Domínio 2.

**Step Functions** — Serviço de orquestração de fluxos de trabalho serverless. Máquinas de estados para coordenar serviços AWS. Capítulo 22. Domínio 2.

---

## T

**Escalonamento por rastreamento de destino** — Política de Auto Scaling que ajusta a capacidade para manter um valor de métrica de destino (por exemplo, 60% de utilização de CPU). Capítulo 7. Domínio 2.

**Transit Gateway** — Topologia de rede hub-and-spoke conectando múltiplas VPCs e redes on-premises por meio de um gateway central. Capítulo 25. Domínio 3.

**TTL (Time to Live)** — Um timestamp após o qual o DynamoDB exclui automaticamente um item. Também usado em DNS (por quanto tempo os resolvedores armazenam em cache um registro) e cache (por quanto tempo um valor em cache é válido). Capítulos 9, 12. Domínio 3.

---

## V

**VIF (Virtual Interface)** — A conexão lógica usada com o AWS Direct Connect. O VIF público acessa endpoints públicos AWS; o VIF privado acessa recursos VPC. Capítulo 25. Domínio 3.

**Timeout de visibilidade (SQS)** — O período durante o qual uma mensagem recebida fica oculta para outros consumidores. Permite o processamento sem que outros consumidores vejam a mesma mensagem. Capítulo 19. Domínio 2.

**VPC (Virtual Private Cloud)** — Uma rede virtual isolada na AWS. Contém sub-redes, tabelas de rotas e gateways. Capítulo 11. Domínio 1.

**VPC Endpoint** — Conecta recursos VPC a serviços AWS pela rede privada AWS. Gateway (gratuito, S3/DynamoDB) e Interface (com custo, maioria dos outros serviços). Capítulo 30. Domínio 1, 4.

**VPC Flow Logs** — Captura informações sobre o tráfego IP de e para interfaces de rede em uma VPC. Usado pelo GuardDuty e para solução de problemas de rede. Capítulo 17. Domínio 1.

**VPC Peering** — Uma conexão de rede entre duas VPCs que habilita o tráfego roteado entre elas usando endereços IP privados. Capítulo 11. Domínio 3.

---

## W

**WAF (Web Application Firewall)** — Filtra tráfego HTTP/HTTPS usando regras (bloqueio de IP, injeção SQL, limites de taxa). Vincula-se ao CloudFront, ALB ou API Gateway. Capítulo 17. Domínio 1.

**Well-Architected Framework** — O framework de avaliação de seis pilares da AWS: Excelência Operacional, Segurança, Confiabilidade, Eficiência de Desempenho, Otimização de Custos, Sustentabilidade. Capítulo 31. Domínio cruzado.

**Roteamento ponderado (Route 53)** — Distribui consultas DNS entre endpoints por peso. Usado para implantações blue-green e testes A/B. Capítulo 12. Domínio 3.

**Cache write-through** — Atualiza o cache sempre que o banco de dados é atualizado. Os dados são sempre consistentes, mas o cache pode conter muitos itens que nunca são relidos. Capítulo 10. Domínio 3.

---

## Referência Rápida de Padrões SAA-C03

| Se o exame disser...                          | Pense em...                                      |
|-----------------------------------------------|--------------------------------------------------|
| "Desacoplar serviços"                         | SQS, SNS, EventBridge                            |
| "Fan-out para múltiplos consumidores"         | SNS + assinaturas SQS                            |
| "Eventos ordenados em tempo real"             | Kinesis Data Streams                             |
| "Serverless"                                  | Lambda, DynamoDB, Aurora Serverless, Fargate     |
| "Baixa latência global (dinâmico)"            | Global Accelerator                               |
| "Baixa latência global (estático/em cache)"   | CloudFront                                       |
| "Proteção DDoS"                               | Shield (Standard: gratuito; Advanced: pago)      |
| "Bloquear injeção SQL na borda"               | WAF                                              |
| "Detectar credenciais comprometidas"          | GuardDuty                                        |
| "Auditar atividade de API"                    | CloudTrail                                       |
| "Rotacionar credenciais de banco de dados"    | Secrets Manager                                  |
| "Criptografar dados em repouso, chaves gerenciadas pelo cliente" | KMS com CMK                |
| "Armazenar valores de configuração"           | SSM Parameter Store                              |
| "Armazenamento de banco de dados de alto IOPS" | io2 EBS                                         |
| "Sistema de arquivos compartilhado para EC2" | EFS                                              |
| "Consultar dados S3 com SQL"                  | Athena                                           |
| "Pipeline ETL para análise"                   | AWS Glue                                         |
| "Entregar dados de streaming para S3"         | Kinesis Firehose                                 |
| "Trabalhos em lote tolerantes a falhas, minimizar custo" | Spot Instances                         |
| "Carga de trabalho de produção estável e comprometida" | Savings Plans                           |
| "Sub-rede privada → S3 sem NAT"               | S3 Gateway Endpoint                              |
| "Sub-rede privada → SQS sem NAT"              | SQS Interface Endpoint                           |
| "Multi-AZ para RDS"                           | Failover automático (não escalonamento de leitura) |
| "Réplica de Leitura para RDS"                 | Escalonamento de leitura (não failover automático) |
| "Tempo de recuperação < 1 minuto, entre AZs"  | Multi-AZ                                         |
| "Recuperação entre regiões, RTO de minutos"   | Pilot Light ou Warm Standby                      |
| "Active-Active, RTO zero"                     | Multi-Region Active-Active (mais complexo)       |
