# Apêndice A: Referência Rápida de Serviços AWS

Cada serviço abordado neste livro, na ordem em que foi introduzido. Use como referência de estudo e consulta rápida durante a preparação para o exame.

---

## Computação

**EC2 — Elastic Compute Cloud** *(Capítulo 4)*

Máquinas virtuais na nuvem. Você escolhe o tipo de instância (CPU, memória, armazenamento), o sistema operacional e a região. Você paga por hora (On-Demand), por compromisso (Reserved Instances / Savings Plans) ou por slot de capacidade ociosa (Spot). A primitiva de computação fundamental.

Conceitos-chave: AMI (Amazon Machine Image), tipos de instância (famílias t3, m6g, r6g, c6g), pares de chaves, perfis de instância, grupos de posicionamento.

Sinal do exame: Quando um cenário requer computação persistente, com estado ou de longa duração — EC2 ou ECS. Quando um cenário requer computação de curta duração, acionada por eventos ou de custo zero em inatividade — Lambda.

---

**Auto Scaling + Application Load Balancer** *(Capítulo 7)*

Os Auto Scaling Groups (ASGs) adicionam e removem instâncias EC2 com base na carga. Os Application Load Balancers (ALBs) distribuem o tráfego pelas instâncias e roteiam por caminho ou host. Juntos formam a camada de escalonamento horizontal.

Conceitos-chave: Launch template, políticas de escalonamento (rastreamento de destino, em etapas, programado), verificações de integridade, grupos de destino do ALB, regras de listener, roteamento ponderado.

Sinal do exame: "Lidar com carga variável" ou "alta disponibilidade entre AZs" → ASG + ALB.

---

**Lambda** *(Capítulo 20)*

Funções serverless. Você escreve o código; a AWS o executa em resposta a eventos. Sem servidores para gerenciar. Você paga por invocação e por milissegundo de execução. Escala automaticamente para milhares de execuções simultâneas.

Conceitos-chave: Fontes de eventos (API Gateway, S3, SQS, EventBridge, Kinesis), função de execução, limites de concorrência, concorrência reservada e provisionada, cold start, Layers, duração máxima de 15 minutos.

Sinal do exame: "Serverless", "orientado a eventos", "tarefas de curta duração", "sem custo em inatividade" → Lambda.

---

**ECS — Elastic Container Service** *(Capítulo 21)*

Executa contêineres Docker na AWS. Dois tipos de lançamento: EC2 (você gerencia o host) e Fargate (a AWS gerencia o host). O ECS gerencia definições de tarefa, serviços, agendamento de cluster e integração com balanceadores de carga e descoberta de serviços.

Conceitos-chave: Definição de tarefa, serviço ECS, tipo de lançamento Fargate vs. EC2, ECR (registro de contêineres), função IAM da tarefa, auto scaling de serviço.

Sinal do exame: "Cargas de trabalho conteinerizadas", "microsserviços", "Docker na AWS" → ECS (geralmente Fargate para contêineres serverless).

---

**EKS — Elastic Kubernetes Service** *(Capítulo 21)*

Kubernetes gerenciado. A AWS executa o plano de controle; você executa os nós de trabalho (EC2 ou Fargate). Use EKS quando sua equipe já usa Kubernetes ou tem cargas de trabalho que exigem recursos específicos do Kubernetes.

Sinal do exame: "Kubernetes", "precisa migrar cargas de trabalho K8s existentes" → EKS. "Só precisa de contêineres sem a sobrecarga do K8s" → ECS.

---

**AWS Batch** *(Capítulo 21)*

Computação em lote gerenciada para contêineres Docker. Você define um job (imagem Docker + comando), uma fila de jobs e um ambiente de computação (EC2 ou Fargate). O AWS Batch provisiona e escala a computação automaticamente e a encerra quando o job termina. Suporta Spot Instances para reduzir custos.

Conceitos-chave: Definição de job (o que executar), fila de jobs (onde os jobs aguardam), ambiente de computação (EC2 ou Fargate, On-Demand ou Spot), array jobs (executar muitas cópias paralelas do mesmo job).

Sinal do exame: "Processamento em lote que excede o timeout de 15 minutos do Lambda", "jobs de computação finitos em contêineres", "cargas de trabalho de HPC na AWS" → AWS Batch.

---

**AWS Outposts** *(Capítulo 2)*

Um rack totalmente gerenciado de hardware AWS instalado no seu próprio data center ou em uma instalação de colocation. Executa os mesmos serviços, APIs e ferramentas da AWS da nuvem pública (EC2, EBS, RDS, EKS, S3 on Outposts), mas fisicamente on-premises.

Conceitos-chave: Mesmas APIs da AWS on-premises, a AWS gerencia a instalação e os patches, o cliente fornece o espaço do rack e a energia, Local Gateway (LGW) conecta os Outposts às redes on-premises.

Sinal do exame: "Executar AWS no seu próprio data center", "residência de dados exige que a computação permaneça on-premises", "APIs da AWS sem dependência de internet" → Outposts.

---

**AWS Wavelength** *(Capítulo 2)*

Infraestrutura AWS implantada dentro das redes de provedores de telecomunicações 5G. As Wavelength Zones ficam na borda da rede 5G, permitindo latência de milissegundos de um único dígito para dispositivos móveis.

Conceitos-chave: As Wavelength Zones são extensões das Regiões AWS dentro das redes de telecomunicações, o tráfego permanece na rede da operadora entre o dispositivo e a Wavelength Zone.

Sinal do exame: "Latência de milissegundos de um único dígito para usuários móveis 5G", "AR/VR móvel", "jogos em tempo real no celular", "telemetria de veículos autônomos" → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Capítulo 25)*

Serviço de migração por rehospedagem (lift-and-shift). Um agente replica os discos dos servidores de origem bloco a bloco para uma área de staging de baixo custo na AWS; você inicia cópias de teste sob demanda; no momento do cutover, o MGN converte os servidores replicados em instâncias EC2 nativas. Nenhuma alteração na aplicação é necessária.

Conceitos-chave: Replicação contínua em nível de bloco, área de staging, lançamentos de teste antes do cutover, as estratégias de migração dos "7 Rs" (MGN = rehost).

Sinal do exame: "Migrar centenas de VMs rapidamente sem alterações de código", "lift-and-shift de servidores para EC2" → MGN. O DataSync move *arquivos*; o DMS move *bancos de dados*; o MGN move *servidores inteiros*.

---

## Armazenamento

**S3 — Simple Storage Service** *(Capítulo 5)*

Armazenamento de objetos. Capacidade ilimitada, durabilidade de 99,999999999% (onze noves). Armazena arquivos como objetos em buckets. Os buckets ficam em uma região. Os objetos podem ter de 0 bytes a 5 TB.

Conceitos-chave: Política de bucket, ACL de objeto, versionamento, hospedagem de site estático, URLs pré-assinadas, upload multipart, Transfer Acceleration, classes de armazenamento (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, além do S3 Express One Zone para cargas de trabalho de bucket de diretório em AZ única, sensíveis à latência).

Sinal do exame: "Armazenar e recuperar arquivos", "ativos estáticos", "backups", "data lake" → S3. A classe de armazenamento correta depende da frequência de acesso e da velocidade de recuperação.

---

**EBS — Elastic Block Store** *(Capítulo 6)*

Armazenamento em bloco vinculado a uma única instância EC2. Funciona como um disco rígido. Persiste independentemente do ciclo de vida da instância (você pode desvinculá-lo e vinculá-lo novamente). Tipos mais comuns: gp3 (SSD de uso geral, o padrão), io2 (IOPS provisionados para bancos de dados), st1 (HDD otimizado para throughput, para leituras sequenciais).

Conceitos-chave: Snapshots (incrementais, armazenados no S3), criptografia (KMS), Multi-Attach (apenas io1/io2), provisionamento de IOPS e throughput.

Sinal do exame: "Armazenamento persistente para EC2", "armazenamento de banco de dados", "requer acesso em bloco de baixa latência" → EBS.

---

**EFS — Elastic File System** *(Capítulo 6)*

Sistema de arquivos compartilhado, acessível a partir de múltiplas instâncias EC2 simultaneamente. Protocolo NFS. Escala automaticamente. Mais caro do que o EBS por GB. As classes de armazenamento incluem Standard, Infrequent Access e Archive. O Intelligent-Tiering move os arquivos automaticamente.

Sinal do exame: "Sistema de arquivos compartilhado", "múltiplas instâncias EC2 precisam dos mesmos arquivos", "NFS" → EFS.

---

**Família FSx** *(Capítulo 6)*

Servidores de arquivos gerenciados para tecnologias específicas. FSx for Windows File Server: protocolo SMB, NTFS, integração com Active Directory, Multi-AZ. FSx for Lustre: sistema de arquivos paralelo de alto desempenho para HPC/ML, apresenta objetos do S3 como arquivos (lazy loading). FSx for NetApp ONTAP: multiprotocolo (NFS + SMB + iSCSI), snapshots, replicação SnapMirror. FSx for OpenZFS: NFS de baixa latência, snapshots instantâneos e clones graváveis.

Sinal do exame: "SMB/Active Directory" → FSx for Windows. "Treinamento de HPC/ML sobre dados do S3" → FSx for Lustre. "NFS e SMB sobre os mesmos dados / migração do NetApp" → FSx for ONTAP. "Migração de ZFS / clones instantâneos" → FSx for OpenZFS.

---

**Classes de Armazenamento e Políticas de Ciclo de Vida do S3** *(Capítulo 23)*

O S3 Intelligent-Tiering move automaticamente os objetos entre camadas de acesso com base na frequência de acesso. As políticas de ciclo de vida fazem a transição dos objetos entre classes (Standard → Standard-IA → Glacier) com base em regras de idade. As classes de armazenamento Glacier têm atraso de recuperação que varia de minutos (Glacier Instant) a 12 horas (Glacier Deep Archive).

Sinal do exame: "Reduzir custos de armazenamento para dados acessados com pouca frequência" → políticas de ciclo de vida, Intelligent-Tiering ou Glacier.

---

**AWS Storage Gateway** *(Capítulo 6)*

Serviço de armazenamento híbrido que conecta ambientes on-premises ao armazenamento da AWS. Apresenta o armazenamento por meio dos protocolos que as aplicações já entendem, enquanto persiste os dados no S3, no S3 Glacier ou como snapshots do EBS.

Conceitos-chave: File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, modo cached ou stored), Tape Gateway (biblioteca de fitas virtuais → Glacier).

Sinal do exame: "Aplicação on-premises precisa de armazenamento em nuvem sem alterações de código" → Storage Gateway. "Substituir backup em fita" → Tape Gateway.

---

**AWS DataSync** *(Capítulo 25)*

Serviço de migração e replicação de dados baseado em agente. Um agente leve conecta-se a servidores de arquivos on-premises por NFS ou SMB e sincroniza os compartilhamentos com S3, EFS ou FSx — com agendamento, limitação de largura de banda e verificação de integridade incorporados.

Conceitos-chave: Agente DataSync (VM on-premises ou EC2), fontes NFS/SMB, destinos S3/EFS/FSx, transferências incrementais agendadas.

Sinal do exame: "Migrar ou sincronizar continuamente grandes quantidades de arquivos de um NAS on-premises para a AWS pela rede" → DataSync.

---

**AWS Transfer Family** *(Capítulo 25)*

Servidor SFTP, FTPS e FTP totalmente gerenciado, com S3 ou EFS como destino de armazenamento. Os clientes se conectam com seu software SFTP existente; os arquivos enviados chegam diretamente a um bucket ou sistema de arquivos.

Conceitos-chave: Endpoint gerenciado (opcionalmente com IP estático), armazenamento de apoio em S3 ou EFS, compatibilidade com protocolos existentes para parceiros externos.

Sinal do exame: "Parceiros precisam continuar enviando via SFTP, mas os arquivos devem chegar ao S3" → Transfer Family.

---

**AWS Snow Family** *(Capítulo 25)*

Dispositivos físicos de transferência de dados para migração de dados em massa, offline. Snowball Edge Storage Optimized: 80 TB utilizáveis, gabinete reforçado, enviado para o seu local; você carrega os dados localmente e o devolve para ingestão no S3.

Conceitos-chave: Faça a conta da transferência primeiro — se a transferência pela rede levaria cerca de uma semana ou mais, um dispositivo físico vence. *Nota de legado (2026)*: a AWS vem descontinuando a família — o Snowmobile (2024) e o Snowcone (final de 2024) acabaram, e os dispositivos Snow foram fechados para novos clientes em novembro de 2025 (a AWS agora indica DataSync e Data Transfer Terminals). O banco de questões do SAA-C03 é anterior a isso, então o exame ainda espera o Snowball como resposta.

Sinal do exame: "Migração em escala de petabytes", "largura de banda limitada, semanas de tempo de transferência" → Snow Family.

---

**AWS Backup** *(Capítulos 18 e 23)*

Serviço de backup centralizado e baseado em políticas, abrangendo EBS, RDS, DynamoDB, EFS e Storage Gateway. Os planos de backup definem agendamentos e retenção; os vaults armazenam os pontos de recuperação.

Conceitos-chave: Planos de backup e vaults, cópias entre regiões e entre contas, Vault Lock para imutabilidade.

Sinal do exame: "Centralizar e automatizar backups entre múltiplos serviços AWS", "cópias de backup entre contas para proteção contra ransomware/comprometimento de conta" → AWS Backup.

---

## Bancos de Dados

**RDS — Relational Database Service** *(Capítulo 8)*

Bancos de dados relacionais gerenciados. Motores suportados: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server e Aurora (o motor proprietário da AWS). A AWS cuida de backups, patches, failover e replicação. Você gerencia o design do esquema, as consultas e o dimensionamento da instância.

Conceitos-chave: Implantação Multi-AZ (failover automático, replicação síncrona), Read Replicas (assíncronas, para escalonamento de leitura), backups automatizados (retenção de 1 a 35 dias), snapshots manuais (mantidos até serem excluídos), RDS Proxy (pool de conexões).

Sinal do exame: "Banco de dados relacional", "transações ACID", "carga de trabalho SQL existente" → RDS ou Aurora.

---

**Aurora** *(Capítulo 24)*

O motor de banco de dados relacional da AWS, compatível com MySQL e PostgreSQL. Motor de armazenamento distribuído que replica os dados em 3 AZs em 6 cópias. Tipicamente 5x mais rápido do que o MySQL. O Aurora Serverless v2 escala a capacidade automaticamente (medida em ACUs — Aurora Capacity Units) e, em versões de motor suportadas, pode pausar automaticamente para 0 ACUs quando nenhuma conexão é mantida aberta.

Conceitos-chave: Cluster Aurora (escritor + até 15 Aurora Replicas atrás de um único reader endpoint), Aurora Global Database (réplicas de leitura entre regiões com atraso de replicação < 1 segundo), Aurora Serverless v2, ACUs, comportamento de auto-pause/resume.

Sinal do exame: "Banco de dados relacional de alto desempenho", "compatível com MySQL/PostgreSQL", "leituras globais", "carga de trabalho variável" → Aurora.

---

**DynamoDB** *(Capítulo 9)*

Banco de dados NoSQL totalmente gerenciado. Modelo de chave-valor e documento. Escala para qualquer throughput com desempenho de milissegundos de um único dígito. Dois modos de capacidade: on-demand (pague por requisição) e provisionado (pague por unidade de capacidade por hora, com Auto Scaling).

Conceitos-chave: Chave de partição (obrigatória), chave de ordenação (opcional), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (captura de dados de alteração), DynamoDB Accelerator (DAX) — cache em memória, TTL (Time to Live), transações.

Sinal do exame: "Acesso baseado em chave de alto throughput", "esquema flexível", "NoSQL serverless" → DynamoDB.

---

**ElastiCache** *(Capítulo 10)*

Cache em memória gerenciado. Dois motores: Redis (persistente, pub/sub, scripts Lua, estruturas de dados) e Memcached (cache puro, mais simples, multithread). Use para reduzir a carga do banco de dados e servir dados lidos com frequência em microssegundos.

Conceitos-chave: Padrão cache-aside, padrão write-through, políticas de evicção, TTL, modo cluster (Redis), Multi-AZ com failover automático.

Sinal do exame: "Reduzir a carga do banco de dados", "latência de leitura submilissegundo", "gerenciamento de sessões", "placar em tempo real" → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Capítulo 10)*

Banco de dados primário em memória, durável e compatível com Redis. Ao contrário do ElastiCache (que é um cache no qual a perda de dados é aceitável), o MemoryDB armazena um log de transações Multi-AZ e garante durabilidade. Você pode usar o MemoryDB como seu banco de dados primário — não apenas como um cache na frente de outro banco de dados.

Conceitos-chave: Compatibilidade com a API do Redis, log de transações Multi-AZ (garantia de durabilidade), desempenho em memória, banco de dados primário (não uma camada de cache).

Sinal do exame: "Compatível com Redis E a perda de dados não é aceitável", "banco de dados durável em memória" → MemoryDB. "Redis como cache, perda de dados aceitável" → ElastiCache Redis.

---

**Bancos de Dados Especializados** *(Capítulos 9, 10 e 24)*

Combine o formato dos dados com o motor. DocumentDB: documentos compatíveis com MongoDB. Neptune: banco de dados de grafos (relacionamentos, travessias — Gremlin/SPARQL). Keyspaces: wide-column compatível com Cassandra. Timestream: séries temporais (oferta atual: Timestream for InfluxDB). MemoryDB: banco de dados *primário* durável compatível com Redis (vs. ElastiCache = cache). O QLDB ("ledger criptográfico imutável") foi descontinuado em 2025 — trate-o como um distrator legado.

Sinal do exame: "grafo social / recomendações / anéis de fraude" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "Telemetria de IoT ao longo do tempo" → Timestream.

---

**AWS DMS — Database Migration Service** *(Capítulo 8)*

Migra bancos de dados para a AWS com tempo de inatividade mínimo. Suporta full load (cópia inicial) mais CDC (Change Data Capture) para manter origem e destino sincronizados enquanto a migração ocorre. Ao migrar entre o mesmo tipo de motor (MySQL → MySQL, PostgreSQL → PostgreSQL), use o DMS diretamente. Ao migrar entre tipos de motor diferentes (Oracle → Aurora PostgreSQL), use primeiro o AWS Schema Conversion Tool (SCT) para converter o esquema e, em seguida, o DMS para os dados.

Conceitos-chave: Instância de replicação, endpoints de origem e destino, full load + CDC, SCT (Schema Conversion Tool) para migrações heterogêneas.

Sinal do exame: "Migrar banco de dados com tempo de inatividade mínimo" → DMS. "Oracle para Aurora" ou qualquer migração heterogênea → SCT + DMS. "Mesmo motor, mesmo tipo" → DMS direto.

---

## Rede

**VPC — Virtual Private Cloud** *(Capítulo 11)*

Uma rede isolada dentro da AWS. Abrange todas as AZs em uma região. Você define o espaço de endereçamento IP (bloco CIDR), cria sub-redes (públicas ou privadas), configura tabelas de rotas e controla o acesso por meio de grupos de segurança e NACLs.

Conceitos-chave: Sub-rede pública (rota para o Internet Gateway), sub-rede privada (rota para o NAT Gateway para saída), Internet Gateway (entrada + saída para a internet), NAT Gateway (apenas saída para instâncias privadas), VPC Peering (conectar duas VPCs), VPC Endpoints (conectar a serviços AWS sem internet).

Sinal do exame: "Rede privada na AWS", "isolar recursos da internet", "controlar o tráfego de rede" → VPC.

---

**Grupos de Segurança e NACLs** *(Capítulo 15)*

Os grupos de segurança são firewalls com estado no nível da instância — apenas regras de permissão, o tráfego de retorno é automático. As NACLs (Network Access Control Lists) são firewalls sem estado no nível da sub-rede — exigem regras de entrada e de saída, avaliadas em ordem pelo número da regra.

Sinal do exame: "Bloquear um IP específico de acessar a sub-rede" → NACL. "Controlar o tráfego de/para uma instância" → grupo de segurança.

---

**Route 53** *(Capítulo 12)*

O serviço de DNS e registrador de domínios da AWS. Roteia o tráfego da internet para recursos AWS e endpoints externos. Políticas de roteamento: Simples, Ponderado, Baseado em Latência, Failover, Geolocalização, Geoproximidade, Resposta de múltiplos valores.

Conceitos-chave: Zonas hospedadas (públicas e privadas), tipos de registro (A, AAAA, CNAME, Alias), verificações de integridade, Traffic Flow (editor visual de políticas — observe que a geoproximidade também está disponível como uma política de roteamento direta nos registros, com um viés ajustável, sem exigir o Traffic Flow).

Sinal do exame: "Roteamento DNS", "failover entre regiões", "rotear com base em latência ou localização" → Route 53 com a política de roteamento adequada.

---

**CloudFront** *(Capítulo 13)*

Rede de Distribuição de Conteúdo (CDN). Armazena conteúdo em cache em locais de borda (mais de 750 pontos de presença no mundo todo). Reduz a latência para os usuários finais. Reduz os custos de transferência de origem por meio do cache. Integra-se com S3, EC2, ALB e API Gateway como origens.

Conceitos-chave: Distribuição, origens, comportamentos (roteamento baseado em caminho para origens), TTL (controle de cache), invalidação de cache, URLs e cookies assinados (controle de acesso), Lambda@Edge e CloudFront Functions (executar código na borda), Origin Shield (reduzir a carga de origem).

Sinal do exame: "Baixa latência global", "armazenar conteúdo estático em cache", "reduzir a carga de origem", "proteger contra DDoS com o Shield" → CloudFront.

---

**Direct Connect e VPN** *(Capítulo 25)*

O AWS Direct Connect é uma conexão de rede física dedicada do seu data center on-premises para a AWS. Contorna a internet pública. Largura de banda e latência mais consistentes. A AWS Site-to-Site VPN é um túnel criptografado pela internet pública — mais rápida de configurar, menor custo, mas desempenho variável.

Conceitos-chave: Virtual Interface (VIF), Direct Connect Gateway (conectar a múltiplas regiões), Transit Gateway (topologia de rede hub-and-spoke), redundância de túnel VPN.

Sinal do exame: "Conexão privada dedicada à AWS" → Direct Connect. "Conexão criptografada, configuração mais rápida" → VPN. "Conectar múltiplas VPCs" → Transit Gateway.

---

**VPC Endpoints** *(Capítulo 30)*

Conectam recursos privados a serviços AWS sem usar a internet pública ou o NAT Gateway. Gateway Endpoints: gratuitos, disponíveis apenas para S3 e DynamoDB. Interface Endpoints (PrivateLink): cobrados por hora + por GB, disponíveis para a maioria dos serviços AWS.

Sinal do exame: "EC2 em sub-rede privada chama S3/DynamoDB — reduzir os custos do NAT Gateway" → Gateway Endpoint (gratuito). "Conexão privada para SQS, SSM, Secrets Manager a partir de uma sub-rede privada" → Interface Endpoint.

---

**AWS Client VPN** *(Capítulo 11)*

Endpoint OpenVPN gerenciado que permite que dispositivos individuais (laptops, estações de trabalho) se conectem com segurança a uma VPC pela internet. Opções de autenticação: Active Directory, federação SAML 2.0 com um provedor de identidade ou TLS mútuo (baseado em certificado). Suporta split-tunnel (apenas o tráfego destinado à VPC passa pelo túnel) e full-tunnel (todo o tráfego é roteado pela AWS).

Conceitos-chave: Endpoint do Client VPN, rede de destino (associação de sub-rede da VPC), regras de autorização, split-tunnel vs. full-tunnel.

Sinal do exame: "Engenheiros remotos precisam de acesso seguro a uma VPC de casa", "conectividade de dispositivo individual para VPC" → Client VPN. Contraste: Site-to-Site VPN = rede-para-rede. Client VPN = dispositivo-para-rede.

---

**Network Load Balancer (NLB) e Gateway Load Balancer (GWLB)** *(Capítulo 7)*

O NLB opera na Camada 4 (TCP/UDP/TLS): sem inspeção HTTP, apenas roteamento de pacotes em velocidade extrema — milhões de requisições por segundo, com um IP estático por AZ e preservação do IP de origem. O GWLB opera na Camada 3 e existe para um único propósito: inserir appliances de rede virtuais de terceiros (firewalls, IDS/IPS, deep packet inspection) inline nos fluxos de tráfego.

Conceitos-chave: NLB = Camada 4, IPs estáticos, latência ultrabaixa, protocolos não HTTP. GWLB = Camada 3, encapsulamento GENEVE, frotas de appliances atrás de um único ponto de entrada. ALB = Camada 7 (roteamento por caminho/host).

Sinal do exame: "Milhões de requisições TCP por segundo", "IP estático para o balanceador de carga", "preservar o IP de origem" → NLB. "Inserir appliances de segurança de terceiros no caminho do tráfego" → GWLB.

---

**AWS Global Accelerator** *(Capítulo 25)*

Direciona o tráfego dos usuários para o backbone global privado da AWS no local de borda mais próximo, em vez de atravessar a internet pública. Fornece dois endereços IP Anycast estáticos que ficam na frente dos seus ALBs, NLBs ou instâncias EC2 em uma ou mais regiões. Melhora a latência e a consistência para tráfego *dinâmico* (não armazenável em cache).

Conceitos-chave: IPs Anycast estáticos, entrada no backbone da AWS na borda, failover regional baseado em verificação de integridade em segundos, grupos de endpoints com traffic dials.

Sinal do exame: "Usuários globais, tráfego dinâmico/não HTTP, IP estático, failover regional rápido" → Global Accelerator. "Conteúdo estático/armazenável em cache" → CloudFront em vez disso.

---

## Segurança e Identidade

**IAM — Identity and Access Management** *(Capítulos 3 e 14)*

Controla quem pode fazer o quê na sua conta AWS. Usuários (credenciais de longo prazo), Grupos (usuários que compartilham permissões), Funções (credenciais temporárias para serviços e acesso entre contas), Políticas (documentos JSON que definem regras de permissão/negação).

Conceitos-chave: Principal, Ação, Recurso, Condição, negação explícita > permissão explícita > negação implícita, SCP (Service Control Policy nas AWS Organizations), permission boundary, AssumeRole.

Sinal do exame: O IAM está envolvido em toda questão de segurança. Padrão-chave: os serviços usam funções IAM (não usuários). O acesso entre contas usa assunção de função. Mínimo privilégio — conceda apenas o que for necessário.

---

**KMS — Key Management Service** *(Capítulo 16)*

Serviço gerenciado de chaves de criptografia. Cria, armazena e controla chaves criptográficas. As chaves gerenciadas pelo cliente (CMKs) permitem definir políticas de rotação, uso e acesso. As chaves gerenciadas pela AWS são gerenciadas automaticamente.

Conceitos-chave: Política de chave (separada da política IAM), criptografia de envelope (dados criptografados com uma chave de dados; chave de dados criptografada com a CMK), rotação automática de chaves, chaves multirregionais, Grants.

Sinal do exame: "Criptografar dados em repouso", "chaves de criptografia gerenciadas pelo cliente", "rotação de chaves" → KMS.

---

**Secrets Manager** *(Capítulo 16)*

Armazena e rotaciona automaticamente valores sensíveis: credenciais de banco de dados, chaves de API, tokens OAuth. Integra-se com o RDS para rotação automática de senha. As aplicações recuperam os segredos em tempo de execução via API — nunca deixe credenciais fixas no código.

Sinal do exame: "Armazenar e rotacionar credenciais de banco de dados", "evitar segredos fixos no código" → Secrets Manager. "Armazenar valores de configuração, não segredos" → Parameter Store (SSM).

---

**AWS Shield** *(Capítulo 17)*

Proteção contra DDoS. O Shield Standard é automático e gratuito — protege contra ataques volumétricos e de protocolo comuns. O Shield Advanced adiciona proteção financeira, equipe de resposta a DDoS 24/7 e visibilidade detalhada dos ataques.

Sinal do exame: "Proteger contra DDoS" → Shield Standard (automático) ou Shield Advanced (empresarial, com SLA).

---

**WAF — Web Application Firewall** *(Capítulo 17)*

Filtra o tráfego HTTP/HTTPS com base em regras: bloqueios de IP, limites de taxa, padrões de injeção de SQL, padrões de XSS, restrições geográficas, regras personalizadas. Vincula-se a CloudFront, ALB, API Gateway ou AppSync.

Sinal do exame: "Bloquear endereços IP específicos", "prevenir injeção de SQL na borda", "limitar a taxa de chamadas de API" → WAF.

---

**GuardDuty** *(Capítulo 17)*

Serviço de detecção de ameaças. Analisa logs do CloudTrail, VPC Flow Logs e logs de DNS usando ML e inteligência de ameaças. Detecta atividade incomum de API, comunicação com IPs maliciosos conhecidos, credenciais comprometidas.

Sinal do exame: "Detectar atividade incomum", "identificar credenciais IAM comprometidas", "monitoramento contínuo de ameaças" → GuardDuty.

---

**Amazon Inspector** *(Capítulo 17)*

Serviço automatizado de avaliação de vulnerabilidades. Verifica continuamente instâncias EC2, imagens de contêiner do Amazon ECR e funções Lambda em busca de vulnerabilidades de software (CVEs) e exposição de rede não intencional. As descobertas são enviadas ao AWS Security Hub para gerenciamento centralizado.

Conceitos-chave: Verificação de CVE, avaliação contínua (não única), cobertura de EC2 + ECR + Lambda, integração com o Security Hub.

Sinal do exame: "Verificar automaticamente o EC2 em busca de vulnerabilidades conhecidas", "verificação de CVE para imagens de contêiner", "avaliação contínua de vulnerabilidades" → Inspector.

---

**Amazon Cognito** *(Capítulo 14)*

Autenticação gerenciada para os usuários finais da sua aplicação — um diretório de usuários que você não precisa construir. Os User Pools cuidam de cadastro, login, MFA, redefinição de senha e provedores de identidade social (Google, Facebook, qualquer provedor OIDC), emitindo JWTs que a sua aplicação valida. Os Identity Pools trocam esses tokens por credenciais AWS temporárias.

Conceitos-chave: User Pool (autenticação, JWTs) vs. Identity Pool (credenciais AWS temporárias), interface hospedada (hosted UI), federação social/OIDC/SAML, Cognito authorizer do API Gateway.

Sinal do exame: "Aplicação precisa de cadastro/login de usuários", "login social", "dar a usuários de app móvel acesso temporário a recursos AWS" → Cognito. Contraste: o IAM é para os seus engenheiros e serviços; o Cognito é para os seus clientes.

---

**AWS Certificate Manager (ACM)** *(Capítulo 16)*

Provisiona certificados públicos TLS/SSL gratuitos para serviços gerenciados pela AWS (ALB, CloudFront, API Gateway) e cuida de todo o ciclo de vida — sem calendário de renovação, sem manuseio de chave privada. Renovação automática via validação DNS.

Conceitos-chave: Validação por DNS vs. e-mail, renovação automática, os certificados para o CloudFront devem estar em us-east-1, certificados públicos gratuitos não podem ser exportados (uma opção paga e exportável existe desde 2025).

Sinal do exame: "HTTPS em um balanceador de carga ou CDN", "renovação automática de certificados" → ACM.

---

**Amazon Macie** *(Capítulo 17)*

Descoberta de dados sensíveis para o S3. Usa machine learning e correspondência de padrões para encontrar PII (nomes, números de cartão, credenciais) em buckets e sinaliza riscos de acesso como exposição pública. Complementa o GuardDuty: o GuardDuty observa comportamento; o Macie audita o que está armazenado.

Conceitos-chave: Identificadores de dados gerenciados (padrões de PII), escopo restrito ao S3, descobertas para Security Hub/EventBridge.

Sinal do exame: "Descobrir PII no S3", "identificar exposição de dados sensíveis" → Macie.

---

**AWS Control Tower** *(Capítulo 14)*

Automatiza a configuração e a governança de um ambiente multicontas. Cria uma landing zone — contas de gerenciamento, log archive e auditoria pré-conectadas com Organizations, CloudTrail, Config e guardrails — em minutos, em vez de dias de configuração manual.

Conceitos-chave: Landing zone, guardrails (preventivos = SCPs, detectivos = regras do Config), Account Factory para novas contas padronizadas.

Sinal do exame: "Configurar e governar um novo ambiente multicontas com boas práticas automaticamente" → Control Tower. Contraste: o Organizations é o bloco de construção bruto; o Control Tower é a montagem automatizada.

---

## Mensageria e Processamento de Eventos

**SQS — Simple Queue Service** *(Capítulo 19)*

Fila de mensagens gerenciada. Os produtores enviam mensagens; os consumidores as leem e excluem. Desacopla serviços: o remetente não precisa saber se o destinatário está disponível. Filas Standard: entrega ao-menos-uma-vez, ordenação de melhor esforço. Filas FIFO: processamento exatamente-uma-vez, ordenação estrita.

Conceitos-chave: Timeout de visibilidade (mensagem oculta de outros consumidores durante o processamento), Dead Letter Queue (DLQ) para mensagens que falham repetidamente, retenção de mensagens (4 dias por padrão, até 14), long polling (reduzir respostas vazias), payload máximo de 256 KB por padrão (aumentável para 1 MiB desde 2025; para payloads maiores, a Extended Client Library armazena o corpo no S3).

Sinal do exame: "Desacoplar serviços", "amortecer requisições durante picos de carga", "processamento assíncrono" → SQS. "A ordem importa e exatamente-uma-vez é exigido" → SQS FIFO.

---

**SNS — Simple Notification Service** *(Capítulo 19)*

Serviço de pub/sub gerenciado. Os publicadores enviam uma mensagem para um tópico; todos os assinantes recebem uma cópia. Padrão fan-out: uma mensagem → muitos consumidores. Protocolos: SQS, Lambda, HTTP/HTTPS, e-mail, SMS, push móvel.

Conceitos-chave: Tópico, assinatura, padrão fan-out (SNS → múltiplas filas SQS), filtragem de mensagens (os assinantes recebem apenas as mensagens correspondentes).

Sinal do exame: "Enviar notificações para múltiplos endpoints simultaneamente", "distribuir um único evento para múltiplos consumidores" → SNS. Padrão comum: SNS + SQS para fan-out durável.

---

**EventBridge** *(Capítulo 22)*

Barramento de eventos para construir arquiteturas orientadas a eventos. Roteia eventos de serviços AWS, parceiros SaaS e fontes personalizadas para Lambda, SQS, SNS, Step Functions e outros destinos. Suporta regras agendadas (cron) e correspondência de padrões.

Sinal do exame: "Rotear eventos de serviços AWS para destinos", "agendar funções Lambda", "orquestração orientada a eventos" → EventBridge.

---

**Step Functions** *(Capítulo 22)*

Orquestração de fluxos de trabalho serverless. Coordena funções Lambda, tarefas ECS, DynamoDB, SNS, SQS e outros serviços em máquinas de estados visuais. Cuida de novas tentativas, tratamento de erros, ramificações paralelas e estados de espera.

Conceitos-chave: Máquina de estados, tipos de estado (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exatamente-uma-vez, longa duração) vs. Express Workflows: Assíncrono (ao-menos-uma-vez, alto volume — projete as tarefas para serem idempotentes) e Síncrono (no-máximo-uma-vez, retorna o resultado diretamente como uma chamada de API).

Sinal do exame: "Orquestrar múltiplas funções Lambda", "fluxos de trabalho de longa duração com lógica de nova tentativa", "etapas de aprovação humana" → Step Functions.

---

**Kinesis** *(Capítulo 26)*

Streaming de dados em tempo real. Kinesis Data Streams: stream durável e ordenado de registros (como um log de commit distribuído). Os consumidores processam os registros; os dados são retidos de 24 horas (padrão) a 365 dias (com Extended Data Retention). Amazon Data Firehose (antigo Kinesis Data Firehose): entrega totalmente gerenciada para S3, Redshift, OpenSearch, Splunk — sem necessidade de gerenciar consumidores.

Conceitos-chave: Shard (unidade de throughput: 1 MB/s de escrita, 2 MB/s de leitura), chave de partição (determina a atribuição do shard), número de sequência, checkpointing (KCL ou Lambda), Firehose vs. Streams.

Sinal do exame: "Streaming em tempo real", "registros ordenados", "reproduzir eventos" → Kinesis Data Streams. "Entregar dados de streaming para S3/Redshift sem gerenciar consumidores" → Amazon Data Firehose (questões mais antigas podem dizer "Kinesis Data Firehose"). "SQL sobre dados de streaming" → Amazon Managed Service for Apache Flink (antigo Kinesis Data Analytics). Contraste com SQS: o Kinesis retém e reproduz; o SQS exclui no consumo.

---

**Amazon MQ** *(Capítulo 19)*

Serviço de broker de mensagens gerenciado que suporta Apache ActiveMQ e RabbitMQ. Suporta protocolos de mensageria padrão de mercado: AMQP, STOMP, MQTT, OpenWire e WebSocket. O principal caso de uso é a migração lift-and-shift de cargas de trabalho de broker de mensagens on-premises — aplicações que já usam ActiveMQ ou RabbitMQ podem se conectar sem alterações de código.

Conceitos-chave: Escolha do motor ActiveMQ vs. RabbitMQ, suporte a protocolos (AMQP/STOMP/MQTT), configuração de broker de instância única ou active/standby para alta disponibilidade.

Sinal do exame: "Migrar ActiveMQ ou RabbitMQ on-premises para a AWS sem alterar o código da aplicação" → Amazon MQ. "Mensageria nativa da AWS em projeto novo (greenfield)" → SQS ou SNS (mais simples, mais escaláveis).

---

## Análise

**Athena** *(Capítulo 26)*

Consultas SQL serverless em dados armazenados no S3. Sem infraestrutura para gerenciar. Pague por consulta (por TB verificado). Melhor com formatos colunares (Parquet, ORC) e dados particionados.

Sinal do exame: "Consultar dados do S3 com SQL", "análise ad hoc em data lake", "sem gerenciamento de infraestrutura" → Athena.

---

**Glue** *(Capítulo 26)*

Serviço de ETL (Extração, Transformação, Carregamento) serverless. Os Glue Crawlers descobrem dados e atualizam o Glue Data Catalog. Os Glue Jobs executam transformações em Spark ou Python. O Data Catalog integra-se com Athena, Redshift Spectrum e EMR.

Sinal do exame: "Transformar e carregar dados para análise", "descobrir o esquema de dados do S3", "pipeline de ETL" → Glue.

---

**Amazon QuickSight** *(Capítulo 26)*

Serviço gerenciado de business intelligence e visualização de dados. Usa o SPICE (Super-fast, Parallel, In-memory Calculation Engine), um motor em memória que armazena em cache os dados importados para renderização rápida de dashboards. Conecta-se a Athena, S3, Redshift, RDS e outras fontes de dados da AWS. Sem servidor de BI para gerenciar.

Conceitos-chave: SPICE (motor em memória), datasets, análises, dashboards, ML Insights (detecção de anomalias, previsão), segurança em nível de linha e de coluna.

Sinal do exame: "Dashboard de BI na AWS sem gerenciar um servidor", "visualizar dados do Athena ou Redshift" → QuickSight.

---

**AWS Lake Formation** *(Capítulo 26)*

Camada centralizada de controle de acesso a data lake sobre o S3 e o Glue Data Catalog. Fornece permissões granulares em nível de tabela, coluna e linha — mais granular do que apenas as políticas de bucket do S3. Simplifica a configuração de um data lake seguro: o Lake Formation cuida do modelo de permissões; o Glue cuida do catálogo; o S3 guarda os dados.

Conceitos-chave: Permissões de data lake (nível de tabela/coluna/linha), integração com o Glue Data Catalog, LF-tags para controle de acesso baseado em atributos, concessão/revogação centralizada para consultas do Athena e do Redshift Spectrum.

Sinal do exame: "Controle de acesso granular em data lake", "segurança em nível de coluna ou de linha sobre dados do S3" → Lake Formation.

---

## Alta Disponibilidade e Recuperação de Desastres

**Multi-AZ e Multi-Region** *(Capítulo 18)*

Multi-AZ: replicação síncrona dentro de uma região para failover automático (RDS Multi-AZ, balanceador de carga entre AZs). RPO ~0, RTO ~60s para o RDS. Multi-Region: replicação assíncrona para redundância geográfica e menor latência para usuários globais.

Conceitos-chave: RTO (Recovery Time Objective — quanto tempo para se recuperar), RPO (Recovery Point Objective — quantos dados podem ser perdidos). Estratégias de DR Pilot Light, Warm Standby, Active-Active.

Sinal do exame: Distinguir entre falhas no nível da AZ (Multi-AZ resolve) vs. falhas regionais (Multi-Region resolve). O custo e a complexidade aumentam significativamente com Multi-Region.

---

**AWS Elastic Disaster Recovery (DRS)** *(Capítulo 18)*

Recuperação de desastres gerenciada para servidores (on-premises ou EC2). Replica continuamente os servidores de origem bloco a bloco para uma área de staging de baixo custo e inicia instâncias de recuperação completas em minutos quando necessário — um pilot light gerenciado: tempos de recuperação próximos a warm standby a preços próximos aos de backup-and-restore.

Conceitos-chave: Replicação contínua em nível de bloco, área de staging de baixo custo, lançamento de recuperação sob demanda, recuperação para um ponto no tempo.

Sinal do exame: "Minimizar tempo de inatividade e perda de dados para cargas de trabalho baseadas em servidor com um serviço de DR gerenciado", "pilot light sem construí-lo você mesmo" → DRS.

---

## Otimização de Custos

**Modelos de Preços do EC2** *(Capítulo 27)*

On-Demand: preço integral, sem compromisso. Reserved Instances (1 ou 3 anos): desconto de 30-72% para um tipo de instância específico. Savings Plans (Compute ou EC2 Instance): gasto horário comprometido em troca de flexibilidade. Spot: 60-90% de desconto para cargas de trabalho interrompíveis.

Sinal do exame: "Minimizar custos para uma carga de trabalho previsível" → Savings Plans ou Reserved Instances. "Processamento em lote tolerante a falhas" → Spot. "Imprevisível ou de curto prazo" → On-Demand.

---

**Preços de Transferência de Dados** *(Capítulo 30)*

Entrada para a AWS: gratuito. Mesma AZ: gratuito. Entre AZs: US$ 0,01/GB em cada direção. Entre regiões: US$ 0,02-0,08/GB. Internet (saída): ~US$ 0,09/GB. Processamento do NAT Gateway: US$ 0,045/GB. A transferência de dados do CloudFront é mais barata do que EC2 direto para a internet, e o cache reduz o volume total.

Sinal do exame: "Reduzir custos de transferência de dados para S3/DynamoDB a partir de uma sub-rede privada" → Gateway Endpoints (gratuitos). "Reduzir custos do NAT Gateway para outros serviços" → Interface Endpoints.

---

## Observabilidade

**CloudWatch** *(referenciado ao longo do livro)*

Monitoramento e observabilidade. CloudWatch Metrics: dados numéricos de séries temporais de serviços AWS e aplicações personalizadas. CloudWatch Logs: coletar, pesquisar e analisar dados de log. CloudWatch Alarms: acionar notificações ou auto scaling com base em limites de métricas. CloudWatch Dashboards: visualizar métricas.

Conceitos-chave: Dimensões de métricas, períodos de retenção, log groups e log streams, filtros de métricas, CloudWatch Agent (para métricas em nível de SO e logs do EC2), Container Insights.

---

**CloudTrail** *(referenciado ao longo do livro)*

Registra cada chamada de API feita na sua conta AWS: quem a fez, de onde, quando e qual foi a resposta. A trilha multirregional armazena logs no S3 indefinidamente. Usado para auditoria de segurança, conformidade e investigação de incidentes.

Sinal do exame: "Quem excluiu aquele recurso?" "Auditar toda a atividade de API" → CloudTrail.

---

**X-Ray** *(Capítulo 20)*

Rastreamento distribuído: acompanha requisições individuais através dos serviços (traces → segments → subsegments), constrói um mapa de serviços com latência e taxas de erro por salto. A amostragem mantém a sobrecarga baixa; as anotações tornam os traces pesquisáveis. O active tracing é ativado em estágios do Lambda e do API Gateway.

Sinal do exame: "Rastrear requisições através de microsserviços", "encontrar o gargalo entre serviços" → X-Ray (não CloudWatch, não CloudTrail).

---

**AWS Config** *(referenciado no Capítulo 31)*

Rastreia as alterações de configuração de recursos ao longo do tempo. Avalia os recursos em relação a regras de conformidade. Registra o histórico de cada alteração de configuração de cada recurso. Integra-se com o Systems Manager para remediação.

Sinal do exame: "Este recurso está em conformidade com a nossa política de segurança?" "Como era a configuração deste recurso na semana passada?" → AWS Config.

---

## Well-Architected

**Os Seis Pilares** *(Capítulo 31)*

| Pilar                      | Pergunta central                            | Serviços-chave                                      |
|----------------------------|---------------------------------------------|-----------------------------------------------------|
| Excelência Operacional     | Estamos operando bem?                       | CloudWatch, CloudTrail, SSM, Config                 |
| Segurança                  | Estamos protegidos?                         | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager   |
| Confiabilidade             | Recuperamo-nos de falhas?                   | Multi-AZ, failover do Route 53, backup/restore, SQS |
| Eficiência de Desempenho   | Estamos usando os recursos certos?          | Dimensionamento correto, Auto Scaling, CloudFront, Kinesis |
| Otimização de Custos       | Estamos gastando com sabedoria?             | Savings Plans, Spot, ciclo de vida do S3, VPC Endpoints |
| Sustentabilidade           | Estamos minimizando o impacto ambiental?    | Dimensionamento correto, Graviton, camadas de armazenamento eficientes |

AWS Well-Architected Tool: avalia a sua arquitetura em relação aos seis pilares. Use-a antes do exame para entender o raciocínio por trás das perguntas de cada pilar.
