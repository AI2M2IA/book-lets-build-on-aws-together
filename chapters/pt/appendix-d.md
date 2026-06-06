# Apêndice D: Simulado Completo (65 Questões)

Este é um simulado completo do SAA-C03: 65 questões, espelhando os pesos de domínio do exame real — Projetar Arquiteturas Seguras (Questões 1–20, ~30%), Projetar Arquiteturas Resilientes (21–37, ~26%), Projetar Arquiteturas de Alto Desempenho (38–53, ~24%) e Projetar Arquiteturas Otimizadas em Custo (54–65, ~20%).

**Como fazê-lo:**

- Programe um cronômetro para **130 minutos** — a duração do exame real. Pratique o ritmo: são dois minutos por questão.
- Sete questões dizem **"(Escolha DUAS.)"** — elas têm cinco opções e exatamente duas respostas corretas, assim como os itens de múltipla resposta do exame real. Ambas precisam estar corretas para pontuar a questão.
- Não olhe o gabarito até terminar todas as 65. No exame real não há feedback durante a prova, e treinar a sua tolerância à incerteza faz parte da preparação.
- O exame real inclui 15 questões experimentais não pontuadas que você não consegue identificar. Todas as 65 aqui são "pontuadas". Um parâmetro de aprovação: **47 ou mais corretas (~72%)** coloca você na faixa da nota de corte escalada de 720/1000. Abaixo de 47, revise os capítulos mapeados no Apêndice B para os seus domínios fracos antes de marcar o exame.
- Para cada questão que você errar — e cada questão que acertar mas hesitou — leia a análise dos distratores. O exame testa as *diferenças* entre opções plausíveis, e é aí que está o aprendizado.

---

## Parte 1 — Projetar Arquiteturas Seguras (Questões 1–20)

**Questão 1** *(Domínio 1 — Tarefa 1.1)*
Uma empresa de serviços financeiros usa AWS Organizations com todos os recursos habilitados. A equipe de segurança anexou uma service control policy (SCP) à raiz da organização que nega o uso de todas as Regiões AWS, exceto eu-west-1. Durante uma auditoria, a equipe descobre que um administrador em uma conta ainda conseguiu lançar instâncias EC2 em us-east-2 apesar da SCP. Qual conta mais provavelmente permitiu essa ação?

A) Uma conta-membro em uma unidade organizacional (OU) aninhada, porque as SCPs não se propagam para OUs aninhadas
B) A conta de gerenciamento, porque as SCPs não se aplicam à conta de gerenciamento
C) Uma conta-membro cuja política de administrador IAM inclui um Allow explícito, que sobrepõe as SCPs
D) Uma conta-membro criada após a SCP ter sido anexada, porque as SCPs só se aplicam a contas que existiam no momento da anexação

**Questão 2** *(Domínio 1 — Tarefa 1.1)*
Uma startup quer permitir que seus desenvolvedores criem funções IAM para suas aplicações, mas a equipe de segurança está preocupada que os desenvolvedores possam criar funções com mais permissões do que eles próprios têm, levando a uma escalada de privilégios. A equipe de segurança quer que os desenvolvedores mantenham a criação de funções em modo autoatendimento. Qual é a solução MAIS apropriada?

A) Exigir que os desenvolvedores enviem solicitações de criação de função por meio de um sistema de tíquetes revisado pela equipe de segurança
B) Anexar uma SCP às contas dos desenvolvedores que negue totalmente a ação iam:CreateRole
C) Exigir que todas as funções criadas pelos desenvolvedores incluam uma permission boundary específica, imposta com uma condição IAM em iam:CreateRole e iam:AttachRolePolicy
D) Habilitar o AWS CloudTrail e configurar alertas sempre que um desenvolvedor criar uma nova função IAM

**Questão 3** *(Domínio 1 — Tarefa 1.1)*
Um provedor de SaaS precisa acessar recursos nas contas AWS de seus clientes para realizar análises de custo automatizadas. Os clientes criam uma função IAM que a conta do provedor de SaaS pode assumir. Um consultor de segurança alerta que um terceiro que descubra o ARN da função de um cliente poderia enganar o provedor de SaaS para que ele acesse a conta desse cliente em nome do terceiro. Qual mecanismo mitiga esse risco de "confused deputy"?

A) Exigir autenticação multifator (MFA) na política de confiança da função entre contas
B) Exigir que o provedor de SaaS passe um ExternalId único, definido pelo cliente, na chamada sts:AssumeRole e validado por uma condição na política de confiança da função
C) Criptografar o ARN da função com o AWS KMS antes de compartilhá-lo com o provedor de SaaS
D) Substituir a função entre contas por um usuário IAM cujas chaves de acesso são rotacionadas a cada 90 dias

**Questão 4** *(Domínio 1 — Tarefa 1.1)*
Uma empresa com 40 contas AWS nas AWS Organizations quer que seus funcionários façam login uma única vez com suas credenciais existentes do Microsoft Entra ID (Azure AD) e acessem todas as contas AWS por meio de um único portal, com permissões atribuídas centralmente por conta. Qual solução atende a esses requisitos com o MENOR overhead operacional?

A) Criar usuários IAM em cada uma das 40 contas e sincronizar as senhas com o Entra ID
B) Configurar o AWS IAM Identity Center com o Entra ID como provedor de identidade externo e atribuir permission sets a usuários e grupos por conta
C) Implantar Amazon Cognito user pools em cada conta e federá-los ao Entra ID
D) Criar um provedor de identidade SAML em cada conta e escrever funções IAM e políticas de confiança por conta manualmente

**Questão 5** *(Domínio 1 — Tarefa 1.1)*
Uma empresa de jogos mobile está construindo um app em que os jogadores se cadastram com um endereço de e-mail ou login social, e após a autenticação o app deve enviar as capturas de tela dos jogadores diretamente para um bucket do Amazon S3 usando credenciais AWS temporárias. Qual combinação de serviços o arquiteto de soluções deve recomendar?

A) Um Amazon Cognito user pool para cadastro/login e um Amazon Cognito identity pool para trocar o token autenticado por credenciais AWS temporárias
B) Um Amazon Cognito identity pool para cadastro/login e um Amazon Cognito user pool para emitir credenciais AWS temporárias
C) AWS IAM Identity Center para cadastro/login e AWS STS GetSessionToken para as credenciais
D) Um Amazon Cognito user pool sozinho, porque os tokens do user pool concedem acesso direto ao S3

**Questão 6** *(Domínio 1 — Tarefa 1.3)*
Uma empresa de saúde precisa criptografar dados no Amazon S3 com uma chave que suporte rotação anual automática gerenciada pela AWS, ao mesmo tempo em que permite à empresa definir a política de chave, habilitar o registro do uso da chave no CloudTrail e desabilitar a chave se necessário. Qual tipo de chave KMS atende a esses requisitos?

A) Uma AWS managed key (aws/s3)
B) Uma customer managed key com rotação automática habilitada
C) Uma AWS owned key
D) Uma customer managed key com material de chave importado (BYOK) e rotação automática habilitada

**Questão 7** *(Domínio 1 — Tarefa 1.3)*
Um arquiteto de soluções está explicando como o AWS KMS criptografa um arquivo de 4 GB armazenado por uma aplicação, dado que o KMS só pode criptografar diretamente até 4 KB de dados. Qual afirmação descreve com precisão a criptografia de envelope?

A) O KMS divide o arquivo em pedaços de 4 KB e criptografa cada pedaço com a chave KMS
B) A aplicação solicita uma data key ao KMS, criptografa o arquivo localmente com a data key em texto claro, depois armazena a data key criptografada junto aos dados e descarta a data key em texto claro
C) O KMS transmite o arquivo pela API do KMS, que o criptografa do lado do servidor com a chave KMS
D) A aplicação criptografa o arquivo com uma chave simétrica fixa no código, e o KMS assina o resultado para integridade

**Questão 8** *(Domínio 1 — Tarefa 1.3)*
Uma empresa armazena a senha master de um Amazon RDS for PostgreSQL e precisa que ela seja rotacionada automaticamente a cada 30 dias sem tempo de inatividade da aplicação. A aplicação mantém conexões de banco de dados de longa duração, então a equipe quer uma estratégia de rotação em que a credencial anterior permaneça válida enquanto a nova é ativada. Qual solução atende a esses requisitos?

A) Parâmetros SecureString do AWS Systems Manager Parameter Store com uma função Lambda acionada mensalmente
B) AWS Secrets Manager com a estratégia de rotação de usuário único (single-user)
C) AWS Secrets Manager com a estratégia de rotação de usuários alternados (alternating-users), que alterna entre dois usuários de banco de dados para que uma credencial permaneça sempre válida
D) Rotação automática de chaves do AWS KMS aplicada à senha do banco de dados

**Questão 9** *(Domínio 1 — Tarefa 1.3)*
Uma empresa de mídia armazena vídeo bruto no Amazon S3. A conformidade exige que a empresa gerencie e forneça suas próprias chaves de criptografia, que a AWS nunca armazene essas chaves e que as chaves sejam fornecidas a cada requisição. Qual opção de criptografia atende a esses requisitos?

A) SSE-S3
B) SSE-KMS com uma customer managed key
C) SSE-C
D) Criptografia do lado do cliente usando a AWS managed key aws/s3

**Questão 10** *(Domínio 1 — Tarefa 1.3)*
Uma corretora deve reter registros de negociação no Amazon S3 por sete anos de forma a impedir que qualquer pessoa — incluindo o usuário root da conta AWS — exclua ou sobrescreva os objetos durante o período de retenção, para satisfazer a Regra 17a-4 da SEC. Qual configuração atende a esse requisito?

A) S3 Object Lock em modo governance com um período de retenção de 7 anos
B) S3 Object Lock em modo compliance com um período de retenção de 7 anos em um bucket com versionamento habilitado
C) Uma política de bucket do S3 negando s3:DeleteObject para todos os principais
D) S3 Glacier Deep Archive com uma regra de ciclo de vida que expira os objetos após 7 anos

**Questão 11** *(Domínio 1 — Tarefa 1.2)*
Uma aplicação web roda em instâncias EC2 atrás de um Application Load Balancer. Um engenheiro de rede adiciona uma regra de network ACL à sub-rede permitindo a porta TCP 443 de entrada de 0.0.0.0/0, mas os clientes ainda não conseguem completar as requisições HTTPS. Os grupos de segurança estão configurados corretamente. Qual é a causa MAIS provável?

A) A network ACL é com estado e exige uma regra de connection-tracking
B) A network ACL não tem regra de saída permitindo as portas efêmeras (1024–65535), então o tráfego de retorno é bloqueado porque as NACLs são sem estado
C) O grupo de segurança também deve permitir a porta 443 de saída, porque os grupos de segurança são sem estado
D) As network ACLs não podem permitir tráfego de 0.0.0.0/0; um CIDR específico é necessário

**Questão 12** *(Domínio 1 — Tarefa 1.2)*
Quais DUAS afirmações sobre grupos de segurança e network ACLs em uma VPC estão corretas? (Escolha DUAS.)

A) Os grupos de segurança são com estado, então o tráfego de retorno é automaticamente permitido independentemente das regras de saída
B) As network ACLs avaliam as regras em ordem numérica e suportam regras de Deny explícitas
C) Os grupos de segurança suportam regras de Allow e de Deny
D) As network ACLs são anexadas a interfaces de rede elásticas individuais
E) As regras dos grupos de segurança são avaliadas em ordem numérica, parando na primeira correspondência

**Questão 13** *(Domínio 1 — Tarefa 1.2)*
Uma empresa de e-commerce que roda uma aplicação voltada ao público no CloudFront e no ALB está preocupada com ataques DDoS grandes e sofisticados. A empresa quer acesso 24/7 ao AWS Shield Response Team, proteção de custos contra cobranças de escalonamento causadas por ataques e diagnósticos de ataque. Qual serviço ela deve usar?

A) AWS Shield Standard, que é habilitado automaticamente sem custo
B) AWS Shield Advanced
C) AWS WAF com regras baseadas em taxa
D) Amazon GuardDuty com o plano de proteção de EC2

**Questão 14** *(Domínio 1 — Tarefa 1.2)*
Uma API REST atrás de um Application Load Balancer está sendo atacada com tentativas de injeção de SQL e requisições excessivas a partir de um pequeno conjunto de endereços IP. Qual solução bloqueia os padrões de requisição maliciosos na borda da aplicação com o MENOR esforço de desenvolvimento?

A) Adicionar código de validação de entrada a cada handler da API
B) Associar o AWS WAF ao ALB, usando o managed rule group de injeção de SQL e uma regra baseada em taxa
C) Habilitar o AWS Shield Standard no ALB
D) Configurar o grupo de segurança do ALB para negar requisições contendo palavras-chave SQL

**Questão 15** *(Domínio 1 — Tarefa 1.2)*
Uma empresa quer atender a três necessidades de segurança: (1) detectar continuamente instâncias EC2 comprometidas e atividade de API anômala usando inteligência de ameaças, (2) descobrir e classificar informações de identificação pessoal (PII) armazenadas em buckets do S3 e (3) verificar instâncias EC2 e imagens de contêiner em busca de vulnerabilidades de software (CVEs). Qual mapeamento de serviços AWS para necessidades está correto?

A) 1: Amazon Inspector, 2: Amazon GuardDuty, 3: Amazon Macie
B) 1: Amazon GuardDuty, 2: Amazon Macie, 3: Amazon Inspector
C) 1: Amazon Macie, 2: Amazon Inspector, 3: Amazon GuardDuty
D) 1: Amazon GuardDuty, 2: Amazon Inspector, 3: Amazon Macie

**Questão 16** *(Domínio 1 — Tarefa 1.2)*
Uma aplicação rodando em instâncias EC2 em sub-redes privadas deve enviar objetos para o Amazon S3 e chamar o Amazon DynamoDB. A política corporativa proíbe que o tráfego atravesse a internet pública, e a equipe quer a opção de menor custo para ambos os serviços. Qual solução atende a esses requisitos?

A) Um NAT gateway em uma sub-rede pública
B) Gateway VPC endpoints para S3 e DynamoDB, referenciados nas tabelas de rotas das sub-redes
C) Interface VPC endpoints (AWS PrivateLink) para S3 e DynamoDB
D) Um internet gateway com regras restritivas de grupo de segurança

**Questão 17** *(Domínio 1 — Tarefa 1.3)*
Após um incidente de server-side request forgery (SSRF) em que um atacante recuperou credenciais de função IAM do serviço de metadados de uma instância EC2 por meio de uma aplicação web vulnerável, uma equipe de segurança quer fortalecer todas as instâncias contra essa classe de ataque. O que a equipe deve fazer?

A) Impor o IMDSv2 exigindo tokens de sessão (HttpTokens=required), para que as requisições de metadados precisem de um token obtido via PUT que requisições SSRF simples não conseguem adquirir
B) Desabilitar o serviço de metadados da instância em todas as instâncias, já que as aplicações nunca precisam dele
C) Bloquear 169.254.169.254 na network ACL da sub-rede
D) Mover as credenciais da função da instância para um arquivo de configuração na instância

**Questão 18** *(Domínio 1 — Tarefa 1.3)*
Um arquiteto de soluções deve armazenar cerca de 200 valores de configuração de aplicação em texto claro (feature flags, nomes de ambiente, URLs de endpoint) e 5 senhas de banco de dados. As senhas exigem rotação automática; os valores de configuração não, e a equipe quer minimizar o custo. Qual combinação é a MAIS econômica?

A) Armazenar tudo no AWS Secrets Manager
B) Armazenar tudo em parâmetros standard do AWS Systems Manager Parameter Store
C) Armazenar os valores de configuração em parâmetros standard do Parameter Store (sem custo) e as senhas no AWS Secrets Manager com rotação habilitada
D) Armazenar os valores de configuração no S3 e as senhas em parâmetros SecureString do Parameter Store com rotação automática integrada

**Questão 19** *(Domínio 1 — Tarefa 1.3)*
Uma empresa criptografa objetos do S3 com SSE-KMS usando uma customer managed key. Uma aplicação na mesma conta lê esses objetos milhares de vezes por segundo, e a equipe está observando throttling e preocupações de custo com as chamadas de API do KMS. Qual mudança reduz o tráfego de requisições do KMS mantendo a criptografia SSE-KMS?

A) Mudar o bucket para SSE-S3, que não usa chaves
B) Habilitar S3 Bucket Keys, para que o S3 use uma chave de nível de bucket de curta duração para reduzir as chamadas ao KMS
C) Desabilitar a rotação automática de chaves na customer managed key
D) Substituir a customer managed key por material de chave importado

**Questão 20** *(Domínio 1 — Tarefa 1.1)*
Quais DUAS afirmações sobre avaliação de políticas IAM e AWS Organizations estão corretas? (Escolha DUAS.)

A) As SCPs concedem permissões a usuários e funções IAM em contas-membro
B) Um Deny explícito em qualquer política aplicável sempre sobrepõe qualquer Allow
C) As políticas baseadas em recurso não podem conceder acesso entre contas sem uma SCP
D) Uma permission boundary define o máximo de permissões que uma política baseada em identidade pode conceder a um usuário ou função, mas não concede nada por si só
E) Se nenhuma política mencionar uma ação, a ação é permitida por padrão para usuários IAM

---

## Parte 2 — Projetar Arquiteturas Resilientes (Questões 21–37)

**Questão 21** *(Domínio 2 — Tarefa 2.2)*
Um varejista online roda Amazon RDS for MySQL. O banco de dados sofre tráfego de leitura intenso de dashboards de relatórios, e a empresa também precisa que o banco de dados sobreviva a uma falha de Zona de Disponibilidade com failover automático e sem intervenção manual. Qual combinação atende a AMBOS os requisitos?

A) Habilitar apenas a implantação Multi-AZ; a instância standby pode servir as leituras dos relatórios
B) Criar apenas read replicas; uma réplica é promovida automaticamente quando a AZ do primário falha
C) Habilitar a implantação Multi-AZ para failover automático e adicionar read replicas para descarregar as leituras dos relatórios
D) Migrar para uma classe de instância single-AZ maior para lidar com ambas as cargas de trabalho

**Questão 22** *(Domínio 2 — Tarefa 2.2)*
Uma empresa quer alta disponibilidade do RDS entre Zonas de Disponibilidade, mas se opõe a pagar por uma instância standby Multi-AZ tradicional que não serve tráfego. Qual opção de implantação do RDS fornece failover automático E permite que a capacidade standby sirva tráfego de leitura?

A) Implantação RDS Multi-AZ DB instance (uma standby)
B) Implantação RDS Multi-AZ DB cluster, que tem duas instâncias standby legíveis com um reader endpoint
C) Read replicas do RDS em três AZs com um Application Load Balancer
D) RDS Single-AZ com backups automatizados

**Questão 23** *(Domínio 2 — Tarefa 2.2)*
Uma plataforma global de pagamentos no Amazon Aurora deve fazer failover para uma segunda Região AWS se a Região primária ficar indisponível. A equipe de conformidade pergunta se o Aurora Global Database pode garantir zero perda de dados (RPO = 0) entre Regiões. O que o arquiteto de soluções deve dizer a eles?

A) Sim — o Aurora Global Database replica de forma síncrona entre Regiões, então o RPO é exatamente 0
B) Não — o Aurora Global Database usa replicação assíncrona baseada em armazenamento com atraso típico abaixo de 1 segundo, então o RPO entre Regiões é próximo de zero, mas nunca garantido como exatamente 0
C) Sim — mas apenas se o write forwarding estiver habilitado na Região secundária
D) Não — o Aurora Global Database replica em um agendamento de 5 minutos, dando um RPO de 5 minutos

**Questão 24** *(Domínio 2 — Tarefa 2.2)*
O plano de recuperação de desastres de uma empresa afirma: "Após uma interrupção Regional, o sistema de pedidos deve estar funcionando novamente em até 4 horas, e não mais do que 15 minutos de transações podem ser perdidos." Qual afirmação mapeia corretamente esses números para as métricas de DR?

A) RTO = 15 minutos; RPO = 4 horas
B) RTO = 4 horas; RPO = 15 minutos
C) MTBF = 4 horas; MTTR = 15 minutos
D) RPO = 4 horas; SLA = 15 minutos

**Questão 25** *(Domínio 2 — Tarefa 2.2)*
Uma seguradora precisa de uma estratégia de DR para uma aplicação crítica. Requisitos: os dados devem ser replicados continuamente para a Região de DR; a infraestrutura central (banco de dados, AMIs, stack mínima) já deve existir na Região de DR, mas a computação deve permanecer desligada até um desastre, para controlar o custo; um RTO de dezenas de minutos é aceitável. Qual estratégia de DR corresponde?

A) Backup and restore
B) Pilot light — elementos centrais provisionados na Região de DR com dados replicados ao vivo, mas computação desligada até o failover
C) Warm standby — uma cópia completa da carga de trabalho, reduzida em escala, mas sempre em execução
D) Multi-site active/active

**Questão 26** *(Domínio 2 — Tarefa 2.2)*
Quais DUAS afirmações sobre as estratégias de recuperação de desastres da AWS estão corretas? (Escolha DUAS.)

A) Backup and restore exige que os recursos estejam pré-provisionados e em execução na Região de recuperação
B) Backup and restore oferece o menor RTO das quatro estratégias
C) Multi-site active/active serve tráfego de múltiplas Regiões simultaneamente e oferece um RTO próximo de zero ao maior custo
D) Pilot light mantém uma cópia de capacidade total da aplicação servindo tráfego de produção na Região de recuperação
E) Warm standby mantém uma cópia da carga de trabalho reduzida em escala, mas totalmente funcional, sempre em execução na Região de recuperação

**Questão 27** *(Domínio 2 — Tarefa 2.1)*
Uma aplicação de processamento de imagens lê mensagens de uma fila standard do Amazon SQS. Processar uma imagem leva até 3 minutos, mas o timeout de visibilidade da fila está definido em 30 segundos. Os usuários relatam que algumas imagens são processadas duas ou três vezes. Qual é a causa e a correção MAIS prováveis?

A) A fila é FIFO; mude para uma fila standard
B) O timeout de visibilidade expira antes de o processamento terminar, tornando a mensagem visível para outros consumidores novamente; aumente o timeout de visibilidade para além do tempo de processamento
C) O long polling está desabilitado; habilite um ReceiveMessageWaitTime de 20 segundos
D) O período de retenção de mensagens é muito curto; aumente-o para 14 dias

**Questão 28** *(Domínio 2 — Tarefa 2.1)*
Uma aplicação de faturamento consome mensagens de uma fila SQS. Ocasionalmente, uma mensagem malformada faz o consumidor falhar repetidamente, e a mensagem circula pela fila para sempre, desperdiçando computação. O que o arquiteto deve configurar?

A) Uma dead-letter queue com uma política de redrive maxReceiveCount, para que as mensagens que falham repetidamente sejam movidas para análise
B) Um timeout de visibilidade mais curto para que a mensagem ruim seja repetida mais rapidamente
C) Ordenação FIFO, que descarta automaticamente as mensagens malformadas
D) Um período de retenção de mensagens de 1 minuto para que as mensagens ruins expirem rápido

**Questão 29** *(Domínio 2 — Tarefa 2.1)*
Uma corretora processa eventos de negociação por conta de cliente. Os eventos da mesma conta devem ser processados estritamente em ordem e exatamente uma vez, mas os eventos de contas diferentes podem ser processados em paralelo para obter throughput. Qual solução atende a esses requisitos?

A) Uma fila standard do SQS com uma única thread de consumidor
B) Uma fila FIFO do SQS usando o ID da conta do cliente como MessageGroupId, que preserva a ordem dentro de cada grupo enquanto permite paralelismo entre grupos
C) Um tópico standard do SNS com filtragem de mensagens por ID de conta
D) Uma fila FIFO do SQS com um único MessageGroupId para todos os clientes

**Questão 30** *(Domínio 2 — Tarefa 2.1)*
Quando um pedido é feito, uma plataforma de e-commerce deve acionar simultaneamente três processos independentes: geração de fatura, atendimento no armazém e ingestão de análises. Cada processo deve receber cada evento de pedido, armazená-lo de forma durável e processá-lo em seu próprio ritmo. Qual arquitetura atende a esses requisitos?

A) Uma fila SQS com três consumidores fazendo polling na mesma fila
B) Um tópico SNS que faz fan-out para três filas SQS, uma assinada por processo
C) Três funções Lambda invocadas sequencialmente pelo Step Functions
D) Um tópico SNS com três assinaturas de e-mail

**Questão 31** *(Domínio 2 — Tarefa 2.1)*
Durante uma flash sale, uma função Lambda acionada pelo API Gateway começa a retornar erros de throttling 429, enquanto outras funções Lambda críticas na mesma conta também começam a sofrer throttling. A conta está em sua cota de concorrência padrão. Qual ação protege as funções críticas de serem privadas de recursos pela função da promoção?

A) Aumentar o timeout da função da promoção de 3 segundos para o máximo de 15 minutos
B) Configurar concorrência reservada nas funções críticas (e opcionalmente limitar a função da promoção), garantindo a elas concorrência dedicada do pool da conta
C) Habilitar concorrência provisionada na função da promoção, o que eleva a cota de toda a conta
D) Mover as funções críticas para uma configuração de memória de 10 GB

**Questão 32** *(Domínio 2 — Tarefa 2.1)*
Uma empresa de mídia tem um fluxo de trabalho de publicação de vídeo com uma etapa que espera até 2 dias por um moderador humano para aprovar o conteúdo por meio de uma ferramenta externa antes de continuar. O fluxo de trabalho deve ser auditável, rodar por dias e retomar exatamente de onde pausou quando o moderador responder. Qual solução se encaixa MELHOR?

A) Um workflow Express do Step Functions com um estado Wait
B) Um workflow Standard do Step Functions usando o padrão de callback: um task token (waitForTaskToken) é enviado ao sistema de moderação, e o workflow é retomado quando SendTaskSuccess é chamado
C) Uma função Lambda que dorme até o moderador aprovar
D) Uma regra do EventBridge com um atraso agendado de 2 dias

**Questão 33** *(Domínio 2 — Tarefa 2.1)*
Uma empresa roda um pipeline de ingestão de IoT de alto volume executando cerca de 90.000 execuções de workflow curtas por segundo, cada uma terminando em menos de 5 segundos. A semântica de execução exatamente-uma-vez não é necessária, mas o custo deve ser minimizado. Separadamente, um workflow mensal de reconciliação financeira roda por 12 horas e exige execução exatamente-uma-vez com histórico de execução completo. Quais tipos de workflow do Step Functions devem ser usados?

A) Workflows Express para o pipeline de IoT; workflows Standard para a reconciliação
B) Workflows Standard para ambos
C) Workflows Express para ambos, já que o Express suporta até um ano de execução
D) Workflows Standard para o pipeline de IoT; workflows Express para a reconciliação

**Questão 34** *(Domínio 2 — Tarefa 2.2)*
Uma empresa hospeda sua aplicação web principal em um ALB em us-east-1 e uma cópia de recuperação passiva em us-west-2. A empresa quer que o Route 53 envie todo o tráfego para us-east-1 e redirecione automaticamente os usuários para us-west-2 apenas quando o endpoint primário ficar não saudável. Qual configuração do Route 53 atende a esse requisito?

A) Roteamento ponderado com pesos 50/50
B) Roteamento de failover com uma verificação de integridade no registro primário e o conjunto de registros de us-west-2 definido como secundário
C) Roteamento baseado em latência entre as duas Regiões
D) Roteamento por geolocalização com um registro padrão apontando para us-west-2

**Questão 35** *(Domínio 2 — Tarefa 2.2)*
Um Auto Scaling group roda servidores web EC2 atrás de um Application Load Balancer em três Zonas de Disponibilidade. O ALB marca algumas instâncias como não saudáveis porque o processo do servidor web trava, mas o Auto Scaling group nunca as substitui porque as próprias instâncias EC2 ainda passam nas status checks. O que o arquiteto de soluções deve mudar?

A) Habilitar o monitoramento detalhado do CloudWatch nas instâncias
B) Configurar o Auto Scaling group para usar ELB health checks além das EC2 status checks, para que as instâncias que falham na integridade do target do ALB sejam encerradas e substituídas
C) Aumentar o health check grace period do ASG
D) Trocar o ALB por um Network Load Balancer

**Questão 36** *(Domínio 2 — Tarefa 2.1)*
Uma firma de trading precisa de um balanceador de carga para um protocolo TCP personalizado que deve lidar com milhões de requisições por segundo com latência ultrabaixa e expor um endereço IP estático por Zona de Disponibilidade. Qual balanceador de carga a firma deve escolher?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Questão 37** *(Domínio 2 — Tarefa 2.2)*
Quais DUAS afirmações sobre a construção de armazenamento resiliente na AWS estão corretas? (Escolha DUAS.)

A) O S3 Cross-Region Replication copia retroativamente todos os objetos que existiam antes de a replicação ser configurada, sem nenhuma ação adicional
B) As classes de armazenamento Standard do Amazon EFS armazenam dados de forma redundante em múltiplas Zonas de Disponibilidade e podem ser montadas simultaneamente por instâncias em diferentes AZs
C) O S3 Cross-Region Replication exige que o versionamento esteja habilitado tanto no bucket de origem quanto no de destino
D) Os volumes do Amazon EFS podem ser anexados a apenas uma instância EC2 por vez, como o EBS
E) Habilitar o versionamento do S3 replica automaticamente os objetos para outra Região

---

## Parte 3 — Projetar Arquiteturas de Alto Desempenho (Questões 38–53)

**Questão 38** *(Domínio 3 — Tarefa 3.1)*
Uma empresa de análise de mídia roda um banco de dados PostgreSQL no Amazon RDS usando um volume EBS gp3. Uma nova carga de trabalho de relatórios exige 50.000 IOPS sustentados com latência submilissegundo e uma garantia de durabilidade de 99,999%. O volume deve suportar isso de forma consistente, sem bursting. Qual tipo de volume EBS um arquiteto de soluções deve recomendar?

A) gp3 provisionado com IOPS máximo
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 com um tamanho de volume de 16 TiB

**Questão 39** *(Domínio 3 — Tarefa 3.1)*
Uma firma de pesquisa em genômica precisa de armazenamento de arquivos compartilhado para um cluster de computação de alto desempenho (HPC) baseado em Linux com 500 instâncias EC2. A carga de trabalho exige latências submilissegundo e centenas de GB/s de throughput agregado, e os datasets de entrada estão preparados no Amazon S3. Qual serviço de armazenamento melhor atende a esses requisitos?

A) Amazon EFS com modo de desempenho Max I/O
B) Amazon FSx for Windows File Server com armazenamento SSD
C) Amazon FSx for Lustre vinculado ao bucket do S3
D) Amazon S3 acessado por meio do Mountpoint em cada instância

**Questão 40** *(Domínio 3 — Tarefa 3.1)*
Uma empresa está migrando uma aplicação Windows on-premises que depende de compartilhamentos de arquivos SMB e de listas de controle de acesso integradas ao Active Directory. A aplicação rodará em instâncias EC2 Windows em duas Zonas de Disponibilidade e deve manter suas permissões NTFS existentes. Qual serviço de armazenamento da AWS o arquiteto de soluções deve escolher?

A) Amazon EFS com permissões POSIX
B) Amazon FSx for Windows File Server em modo de implantação Multi-AZ
C) Amazon S3 com políticas de bucket mapeadas para grupos do AD
D) Amazon FSx for Lustre com armazenamento persistente

**Questão 41** *(Domínio 3 — Tarefa 3.1)*
Uma produtora de vídeo em Singapura envia arquivos de filmagem bruta de 40 GB para um bucket S3 em us-east-1 a partir de escritórios no mundo todo. Os uploads frequentemente falham na metade pela internet pública, forçando reinícios completos, e os tempos gerais de transferência são lentos. Qual combinação de ações um arquiteto de soluções deve recomendar? (Escolha DUAS.)

A) Converter o bucket para S3 One Zone-IA para melhorar o throughput de escrita
B) Colocar um Application Load Balancer na frente do bucket em cada região
C) Habilitar o S3 Cross-Region Replication para um bucket em ap-southeast-1
D) Habilitar o S3 Transfer Acceleration no bucket e fazer o upload pelo endpoint acelerado
E) Usar upload multipart para os arquivos grandes

**Questão 42** *(Domínio 3 — Tarefa 3.1)*
Uma plataforma de lances em tempo real roda uma carga de trabalho NoSQL no EC2 que precisa da menor latência de armazenamento possível para dados temporários de rascunho. Os dados são regerados na inicialização e não precisam sobreviver à parada ou ao encerramento da instância. Qual opção de armazenamento fornece o maior desempenho para esse caso de uso?

A) Volume EBS io2 com 64.000 IOPS provisionados
B) Volumes de instance store (NVMe SSD) em uma instância otimizada para armazenamento
C) Amazon EFS em modo General Purpose
D) Volume EBS gp3 com throughput provisionado máximo

**Questão 43** *(Domínio 3 — Tarefa 3.3)*
Uma empresa de jogos armazena dados de sessão de jogadores em uma tabela DynamoDB com a chave de partição `game_id`. Há apenas 12 jogos populares, e a tabela está sofrendo throttling em algumas partições enquanto a capacidade consumida geral está muito abaixo da capacidade provisionada. O que um arquiteto de soluções deve recomendar?

A) Mudar a tabela para capacidade provisionada com auto scaling
B) Usar uma chave de partição de alta cardinalidade, como uma composição de game_id e player_id
C) Criar um local secondary index em player_id
D) Habilitar o DynamoDB Streams para distribuir as escritas entre as partições

**Questão 44** *(Domínio 3 — Tarefa 3.3)*
Um site de e-commerce armazena dados de catálogo de produtos no DynamoDB. O tráfego de leitura é extremamente pesado em leituras, com os mesmos itens requisitados milhões de vezes por dia, e a equipe precisa de latência de leitura em microssegundos sem reescrever as chamadas de API DynamoDB da aplicação. O que o arquiteto de soluções deve recomendar?

A) Implantar o Amazon ElastiCache for Redis e modificar a aplicação para verificar o cache primeiro
B) Adicionar o DynamoDB Accelerator (DAX) na frente da tabela
C) Criar um global secondary index para distribuir as leituras
D) Habilitar o DynamoDB Global Tables em uma segunda região

**Questão 45** *(Domínio 3 — Tarefa 3.3)*
Uma empresa de logística tem uma tabela DynamoDB em produção que precisa de um novo padrão de consulta: consultar remessas por `carrier_id` e ordenar por `delivery_date`, com seu próprio throughput provisionado para que as novas consultas de análise não afetem a aplicação principal. A tabela já existe e tem tráfego ao vivo. Qual solução atende a esses requisitos?

A) Criar um local secondary index com carrier_id como chave de ordenação
B) Criar um global secondary index com carrier_id como chave de partição e delivery_date como chave de ordenação
C) Recriar a tabela com uma chave primária composta de carrier_id e delivery_date
D) Habilitar um DynamoDB Stream e consultar o stream por carrier_id

**Questão 46** *(Domínio 3 — Tarefa 3.3)*
Um serviço de gerenciamento de sessões armazena sessões de usuário no DynamoDB. As sessões tornam-se inúteis após 24 horas, e a equipe quer que os itens expirados sejam removidos automaticamente sem custo adicional. O que o arquiteto de soluções deve implementar?

A) Uma função Lambda agendada que faz scan da tabela a cada hora e exclui os itens antigos
B) DynamoDB Time to Live (TTL) com um atributo de timestamp de expiração em cada item
C) Uma política de ciclo de vida na tabela DynamoDB
D) DynamoDB Streams com um filtro para descartar itens com mais de 24 horas

**Questão 47** *(Domínio 3 — Tarefa 3.3)*
Uma aplicação serverless usa funções Lambda que se conectam a um banco de dados Amazon RDS for MySQL. Durante picos de tráfego, centenas de invocações Lambda simultâneas esgotam o limite de conexões do banco de dados, causando erros. Qual solução resolve isso com a menor alteração na aplicação?

A) Aumentar o tamanho da instância RDS para elevar o max_connections
B) Colocar o Amazon RDS Proxy entre as funções Lambda e o banco de dados
C) Migrar o banco de dados para o DynamoDB
D) Configurar a concorrência reservada do Lambda em 10

**Questão 48** *(Domínio 3 — Tarefa 3.3)*
Um site de notícias financeiras usa Amazon Aurora MySQL. O tráfego de leitura aumenta 20x durante o horário de mercado e a instância primária fica limitada por CPU servindo consultas SELECT. As escritas são modestas. Qual é a forma operacionalmente MAIS eficiente de escalar as leituras?

A) Adicionar Aurora Replicas e direcionar o tráfego de leitura para o reader endpoint do cluster com auto scaling
B) Criar uma standby Multi-AZ e enviar as leituras para a standby
C) Fazer sharding do banco de dados em múltiplos clusters Aurora
D) Habilitar o Aurora Backtrack para descarregar as leituras

**Questão 49** *(Domínio 3 — Tarefa 3.4)*
Uma empresa de jogos multiplayer roda uma aplicação sensível à latência usando o protocolo UDP em Network Load Balancers em duas Regiões AWS. Jogadores no mundo todo precisam de endereços IP estáticos para allow-listing e failover regional rápido. Qual serviço o arquiteto de soluções deve escolher?

A) Amazon CloudFront com duas origens personalizadas
B) AWS Global Accelerator com endpoint groups em ambas as regiões
C) Amazon Route 53 com roteamento baseado em latência
D) Um Application Load Balancer com cross-zone load balancing

**Questão 50** *(Domínio 3 — Tarefa 3.4)*
Uma empresa de streaming deve cumprir regras de licenciamento de conteúdo: os usuários na Alemanha devem sempre ser servidos a partir da implantação em eu-central-1, e os usuários na França a partir da implantação em eu-west-3, independentemente de qual endpoint oferece menor latência. Qual política de roteamento do Route 53 deve ser usada?

A) Roteamento baseado em latência
B) Roteamento por geolocalização
C) Roteamento por geoproximidade com um viés positivo em eu-central-1
D) Roteamento ponderado com pesos 50/50

**Questão 51** *(Domínio 3 — Tarefa 3.2)*
Um arquiteto de soluções está implantando uma carga de trabalho de HPC fortemente acoplada que usa MPI e exige a menor latência de rede possível e o maior desempenho de pacotes por segundo entre 32 instâncias EC2. Qual estratégia de posicionamento deve ser usada?

A) Spread placement group entre três Zonas de Disponibilidade
B) Partition placement group com 7 partições
C) Cluster placement group em uma única Zona de Disponibilidade
D) Lançar instâncias em sub-redes separadas com enhanced networking

**Questão 52** *(Domínio 3 — Tarefa 3.5)*
Uma empresa de IoT ingere dados de clickstream que devem ser entregues ao Amazon S3 em quase tempo real para análise. A equipe quer uma solução totalmente gerenciada, sem aplicações de consumidor para escrever, sem gerenciamento de shards e com buffering de registros embutido e conversão de formato para Parquet. Qual serviço eles devem usar?

A) Amazon Kinesis Data Streams com um consumidor Lambda
B) Amazon Data Firehose (antigo Kinesis Data Firehose) com um destino S3
C) Amazon SQS com uma frota de pollers EC2
D) Amazon MSK com um sink personalizado do Kafka Connect

**Questão 53** *(Domínio 3 — Tarefa 3.5)*
Uma empresa armazena logs de aplicação como arquivos JSON compactados no Amazon S3 e quer que os analistas executem consultas SQL ad hoc contra eles sem provisionar servidores ou carregar dados em um banco de dados. O esquema deve ser descoberto e catalogado automaticamente. Qual combinação o arquiteto de soluções deve recomendar?

A) Amazon Redshift com comandos COPY e atualizações agendadas
B) AWS Glue crawlers para popular o Data Catalog e Amazon Athena para consultas SQL
C) Amazon EMR com um cluster Presto de longa duração
D) Amazon RDS for PostgreSQL com a extensão aws_s3

---

## Parte 4 — Projetar Arquiteturas Otimizadas em Custo (Questões 54–65)

**Questão 54** *(Domínio 4 — Tarefa 4.2)*
Um instituto de pesquisa roda simulações em lote noturnas no EC2 que levam cerca de 90 minutos, fazem checkpoint do progresso no Amazon S3 a cada 5 minutos e podem ser reiniciadas a partir do último checkpoint a qualquer momento. O instituto quer o menor custo de computação possível. Qual opção de compra o arquiteto de soluções deve recomendar?

A) Instâncias On-Demand em uma única AZ
B) Standard Reserved Instances com um prazo de 3 anos
C) Spot Instances usando uma Spot Fleet diversificada entre múltiplos tipos de instância e AZs
D) Um Compute Savings Plan dimensionado para o pico da carga de trabalho em lote

**Questão 55** *(Domínio 4 — Tarefa 4.2)*
Uma empresa de SaaS tem um gasto de computação de baseline estável, mas espera migrar cargas de trabalho entre EC2, AWS Fargate e AWS Lambda ao longo dos próximos três anos à medida que se moderniza. Ela quer um desconto baseado em compromisso que se aplique automaticamente aos três serviços de computação e a todas as regiões. Qual opção o arquiteto de soluções deve recomendar?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Questão 56** *(Domínio 4 — Tarefa 4.2)*
Uma empresa comprou Standard Reserved Instances de 3 anos para o Amazon RDS e para o Amazon EC2. Após uma rearquitetura, ela não precisa mais de nenhuma das reservas. A equipe de finanças pergunta quais reservas podem ser vendidas para recuperar custos. O que o arquiteto de soluções deve dizer a eles?

A) Tanto as Reserved Instances de EC2 quanto as de RDS podem ser vendidas no Reserved Instance Marketplace
B) Apenas as Reserved Instances de EC2 podem ser vendidas no Reserved Instance Marketplace; as RIs de RDS não podem ser revendidas
C) Apenas as Reserved Instances de RDS podem ser vendidas, porque as reservas de banco de dados são transferíveis
D) Nenhuma pode ser vendida; as Reserved Instances são não reembolsáveis e não transferíveis em todos os casos

**Questão 57** *(Domínio 4 — Tarefa 4.2)*
Uma equipe de desenvolvimento roda processamento de dados conteinerizado e tolerante a falhas no Amazon ECS com capacidade EC2 Spot. Eles precisam que os workers drenem e façam checkpoint graciosamente antes da recuperação. Quanto de aviso prévio a AWS fornece antes de uma Spot Instance ser interrompida?

A) Nenhum aviso é fornecido
B) Um aviso de interrupção de 2 minutos
C) Um aviso de interrupção de 15 minutos
D) Uma janela de rebalanceamento de 24 horas

**Questão 58** *(Domínio 4 — Tarefa 4.1)*
Um arquivo de saúde armazena registros de conformidade no Amazon S3 que raramente são acessados, mas que, quando intimados, devem ser recuperáveis em até 5 minutos. Os registros são mantidos por 7 anos e o custo de armazenamento deve ser minimizado. Qual classe de armazenamento atende a esses requisitos?

A) S3 Glacier Deep Archive com recuperação Standard
B) S3 Glacier Flexible Retrieval com recuperações Expedited quando necessário
C) S3 Glacier Flexible Retrieval com recuperações Bulk
D) S3 Standard-IA

**Questão 59** *(Domínio 4 — Tarefa 4.1)*
Uma startup de compartilhamento de fotos armazena imagens de miniaturas facilmente reproduzíveis que são acessadas com pouca frequência. A equipe quer a opção de acesso pouco frequente de menor custo e aceita que a perda de uma única Zona de Disponibilidade poderia exigir a regeneração das miniaturas a partir dos originais. Qual classe de armazenamento deve ser usada?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Questão 60** *(Domínio 4 — Tarefa 4.1)*
Uma empresa tem um bucket S3 com milhões de objetos cujos padrões de acesso são desconhecidos e mudam de forma imprevisível. Um arquiteto de soluções está avaliando o S3 Intelligent-Tiering. Quais DUAS afirmações sobre o Intelligent-Tiering estão corretas? (Escolha DUAS.)

A) Ele cobra uma pequena taxa de monitoramento e automação por objeto para os objetos que monitora
B) Ele cobra taxas de recuperação cada vez que um objeto retorna à camada Frequent Access
C) Objetos menores que 128 KB não são monitorados nem auto-tierizados e são cobrados pela tarifa da camada Frequent Access
D) Ele replica os objetos para uma segunda região automaticamente
E) Ele exige uma duração mínima de armazenamento de 90 dias para cada objeto

**Questão 61** *(Domínio 4 — Tarefa 4.1)*
Uma equipe de análise frequentemente aborta grandes uploads multipart para um bucket de data lake do S3, e o AWS Cost Explorer mostra os custos de armazenamento crescendo mesmo que a contagem visível de objetos do bucket esteja estável. Qual é a correção MAIS econômica?

A) Habilitar o S3 Versioning para rastrear as partes órfãs
B) Adicionar uma regra de ciclo de vida que aborta uploads multipart incompletos após um número definido de dias
C) Migrar o bucket para S3 One Zone-IA
D) Ativar o S3 Transfer Acceleration para finalizar os uploads mais rápido

**Questão 62** *(Domínio 4 — Tarefa 4.1)*
A frota de EC2 de uma empresa usa centenas de volumes EBS gp2 dimensionados grandes puramente para obter IOPS de baseline. As revisões de utilização mostram que os IOPS são necessários, mas grande parte da capacidade não é. O que o arquiteto de soluções deve fazer para reduzir o custo de armazenamento sem perder desempenho?

A) Migrar os volumes para io2 e provisionar os mesmos IOPS
B) Migrar os volumes para gp3, dimensionar corretamente a capacidade e provisionar os IOPS de forma independente
C) Converter os volumes para st1 throughput-optimized HDD
D) Fazer snapshot dos volumes diariamente e excluir os originais

**Questão 63** *(Domínio 4 — Tarefa 4.4)*
Um pipeline de dados em sub-redes privadas transfere 60 TB por mês de instâncias EC2 para o Amazon S3 na mesma região por meio de um NAT gateway, gerando grandes cobranças de processamento de dados. Qual é a mudança MAIS econômica?

A) Substituir o NAT gateway por uma NAT instance em uma instância EC2 grande
B) Criar um gateway VPC endpoint para o S3 e rotear o tráfego por ele
C) Criar um interface VPC endpoint (PrivateLink) para o S3
D) Mover as instâncias EC2 para sub-redes públicas com endereços IPv4 públicos

**Questão 64** *(Domínio 4 — Tarefa 4.4)*
A fatura mensal de uma startup mostra cobranças inesperadas por endereços IPv4 públicos em uso em dezenas de instâncias EC2 que só chamam outros serviços AWS dentro da VPC. A equipe de finanças também quer alertas antes de o gasto geral do próximo mês exceder um limite. Qual combinação de ações o arquiteto de soluções deve tomar? (Escolha DUAS.)

A) Substituir os IPv4 públicos por Elastic IPs em cada instância, que são sempre gratuitos enquanto estão anexados
B) Remover os endereços IPv4 públicos e usar conectividade privada (VPC endpoints/NAT conforme necessário), já que a AWS cobra pelos endereços IPv4 públicos em uso
C) Usar o AWS Compute Optimizer para bloquear gastos acima do limite
D) Habilitar o AWS Shield Advanced para limitar o gasto mensal
E) Criar um cost budget do AWS Budgets com um limite de alerta e notificação por e-mail

**Questão 65** *(Domínio 4 — Tarefa 4.3)*
Um ambiente de desenvolvimento usa um cluster Amazon Aurora PostgreSQL que fica ocioso à noite e nos fins de semana, mas deve acordar automaticamente quando os desenvolvedores se conectam, sem intervenção manual ou redimensionamento de instância. O custo deve cair para perto de zero para a computação enquanto ocioso. Qual solução atende a esses requisitos?

A) Aurora Serverless v2 configurado com uma capacidade mínima de 0 ACUs para que pause automaticamente quando ocioso
B) Um cluster Aurora provisionado interrompido por uma função Lambda agendada toda noite
C) Um Aurora global database com um cluster secundário headless
D) Aurora provisionado com duas instâncias de leitor reduzidas à noite

---

## Gabarito

### Parte 1 — Questões 1–20

**1. Resposta: B** — As SCPs nunca se aplicam à conta de gerenciamento da organização, então seus principais não são afetados por restrições de Região. *Por que não as outras:* A — as SCPs de fato são herdadas através de OUs aninhadas; C — Allows do IAM não podem sobrepor um Deny de SCP em contas-membro; D — as SCPs se aplicam imediatamente a todas as contas atuais e futuras sob o ponto de anexação.

**2. Resposta: C** — Uma permission boundary imposta como condição nas ações de criação de função limita o máximo de permissões de qualquer função que os desenvolvedores criem, prevenindo a escalada de privilégios e preservando o autoatendimento. *Por que não as outras:* A — a revisão manual adiciona overhead operacional e remove o autoatendimento; B — negar iam:CreateRole bloqueia o fluxo de trabalho legítimo; D — alertas do CloudTrail são detectivos, não preventivos.

**3. Resposta: B** — Um ExternalId definido pelo cliente e validado na condição da política de confiança garante que o provedor de SaaS só assuma a função em nome do cliente correto, mitigando o problema de confused deputy. *Por que não as outras:* A — MFA é impraticável para assunção automatizada serviço-a-serviço e não aborda a confusão do deputy; C — criptografar um ARN (que não é segredo) não resolve nada; D — chaves de usuário IAM de longa duração são menos seguras do que funções.

**4. Resposta: B** — O IAM Identity Center federa uma única vez com o Entra ID e atribui centralmente permission sets a todas as contas da organização por meio de um único portal de acesso. *Por que não as outras:* A — usuários IAM por conta são exatamente o overhead a ser evitado; C — o Cognito é para identidades de aplicação (clientes), não para acesso de força de trabalho a contas AWS; D — a configuração manual de SAML por conta funciona, mas tem overhead operacional muito maior.

**5. Resposta: A** — Os user pools cuidam da autenticação (login por e-mail/social); os identity pools trocam os tokens resultantes por credenciais AWS temporárias com escopo definido por funções IAM para acessar o S3. *Por que não as outras:* B — inverte os propósitos dos dois serviços; C — o IAM Identity Center é para usuários da força de trabalho, não para clientes do app; D — os tokens do user pool (JWTs) não concedem acesso a serviços AWS por si só.

**6. Resposta: B** — Uma customer managed key dá controle total da política de chave, do registro de uso e da desabilitação, e suporta rotação automática (anual por padrão). *Por que não as outras:* A — as AWS managed keys não permitem editar a política de chave ou desabilitar a chave; C — as AWS owned keys são completamente invisíveis para o cliente; D — material de chave importado (BYOK) não suporta rotação automática.

**7. Resposta: B** — Criptografia de envelope: o KMS gera uma data key; os dados são criptografados localmente com a data key em texto claro, que é descartada, enquanto a cópia da data key criptografada pelo KMS é armazenada com o texto cifrado. *Por que não as outras:* A e C — o KMS nunca criptografa grandes payloads diretamente ou via streaming; D — chaves fixas no código são um anti-padrão e não são criptografia de envelope.

**8. Resposta: C** — A estratégia de usuários alternados do Secrets Manager mantém duas credenciais e as rotaciona alternadamente, então as conexões existentes que usam a credencial anterior continuam funcionando durante a rotação. *Por que não as outras:* A — o Parameter Store não tem rotação integrada; você teria que construir tudo; B — a rotação de usuário único invalida a senha antiga imediatamente, arriscando falhas de conexão; D — a rotação do KMS rotaciona o material de chave de criptografia, não senhas de banco de dados.

**9. Resposta: C** — O SSE-C permite que o cliente forneça a chave de criptografia a cada requisição; a AWS a usa em memória para a operação e nunca a armazena. *Por que não as outras:* A — as chaves SSE-S3 são totalmente gerenciadas pela AWS; B — as chaves SSE-KMS são armazenadas no AWS KMS; D — aws/s3 é uma chave KMS gerenciada pela AWS e não é do lado do cliente de forma alguma.

**10. Resposta: B** — O modo compliance do Object Lock impede a exclusão ou a sobrescrita por qualquer usuário, incluindo o root, até a expiração da retenção, e o Object Lock exige versionamento. *Por que não as outras:* A — o modo governance pode ser contornado por usuários com s3:BypassGovernanceRetention; C — uma política de bucket pode ser modificada ou removida pelo usuário root; D — a expiração de ciclo de vida não impede a exclusão durante o período.

**11. Resposta: B** — As NACLs são sem estado, então o tráfego de resposta para as portas de origem efêmeras dos clientes deve ser explicitamente permitido na saída. *Por que não as outras:* A — as NACLs são sem estado, não com estado; C — os grupos de segurança são com estado, então o tráfego de retorno é automático; D — 0.0.0.0/0 é perfeitamente válido em regras de NACL.

**12. Resposta: A, B** — Os grupos de segurança são com estado (tráfego de retorno permitido automaticamente), e as NACLs processam regras numeradas em ordem e suportam Deny. *Por que não as outras:* C — os grupos de segurança suportam apenas regras de Allow; D — as NACLs se anexam a sub-redes, não a ENIs (os grupos de segurança se anexam a ENIs); E — as regras de grupo de segurança são todas avaliadas em conjunto, sem ordenação.

**13. Resposta: B** — O Shield Advanced fornece o Shield Response Team, proteção de custos contra DDoS e visibilidade/diagnósticos de ataque para recursos protegidos como CloudFront e ALB. *Por que não as outras:* A — o Shield Standard é automático, mas não inclui acesso ao SRT nem proteção de custos; C — o WAF aborda padrões de requisição de camada 7, não o conjunto completo de requisitos; D — o GuardDuty é detecção de ameaças, não proteção contra DDoS.

**14. Resposta: B** — O AWS WAF no ALB com o managed rule group de SQLi mais uma regra baseada em taxa bloqueia ambos os padrões de ataque sem alterações no código da aplicação. *Por que não as outras:* A — alto esforço de desenvolvimento; C — o Shield Standard cobre floods de L3/L4, não injeção de SQL; D — grupos de segurança não conseguem inspecionar o conteúdo da requisição.

**15. Resposta: B** — GuardDuty = detecção de ameaças a partir de logs e inteligência de ameaças; Macie = descoberta de dados sensíveis (PII) no S3; Inspector = verificação de vulnerabilidades (CVE) de EC2, imagens do ECR e Lambda. *Por que não as outras:* A, C, D — cada uma embaralha pelo menos dois dos mapeamentos serviço-para-propósito.

**16. Resposta: B** — Os gateway endpoints existem exatamente para S3 e DynamoDB, mantêm o tráfego na rede da AWS e não têm cobrança horária ou de processamento de dados. *Por que não as outras:* A — o NAT gateway roteia via espaço de IP público e custa por hora/por GB; C — os interface endpoints incorrem em cobranças horárias e de dados, então não são o menor custo; D — um internet gateway envia o tráfego pela internet pública.

**17. Resposta: A** — O IMDSv2 exige um token de sessão obtido via requisição PUT, que vetores típicos de SSRF não conseguem realizar; impor HttpTokens=required bloqueia o roubo de credenciais via IMDSv1. *Por que não as outras:* B — muitos agentes e SDKs legitimamente precisam do IMDS; C — as NACLs não afetam o tráfego link-local entre uma instância e seu próprio endpoint de metadados; D — credenciais estáticas em arquivos são muito piores do que credenciais de função.

**18. Resposta: C** — Os parâmetros standard do Parameter Store são gratuitos e adequados para config em texto claro; o Secrets Manager adiciona rotação integrada apenas para as 5 senhas, minimizando o custo. *Por que não as outras:* A — pagar o preço por segredo do Secrets Manager para 200 valores de config em texto claro é um desperdício; B — só o Parameter Store não tem rotação nativa para as senhas; D — o Parameter Store não tem rotação automática integrada, então essa opção afirma uma capacidade que não existe.

**19. Resposta: B** — As S3 Bucket Keys permitem que o S3 gere uma data key de nível de bucket com tempo limitado a partir da chave KMS, reduzindo drasticamente as requisições KMS por objeto (e o custo) enquanto permanece SSE-KMS. *Por que não as outras:* A — o SSE-S3 abandona o requisito de KMS; C — a frequência de rotação não afeta o volume de API por requisição; D — material de chave importado não altera as contagens de requisição.

**20. Resposta: B, D** — O Deny explícito sempre vence qualquer Allow na avaliação de políticas, e as permission boundaries apenas limitam (nunca concedem) permissões. *Por que não as outras:* A — as SCPs são guardrails que limitam as permissões disponíveis; elas não concedem nada; C — as políticas baseadas em recurso rotineiramente concedem acesso entre contas por si só; E — o IAM assume negação implícita quando nada permite uma ação.

### Parte 2 — Questões 21–37

**21. Resposta: C** — O Multi-AZ fornece failover automático para falha de AZ; as read replicas absorvem o tráfego de leitura dos relatórios — dois recursos para dois problemas distintos. *Por que não as outras:* A — uma standby Multi-AZ tradicional não pode servir leituras; B — a promoção de réplica é manual (ou via script) e réplicas sozinhas não dão failover de HA automático; D — uma instância single-AZ maior falha em ambos os requisitos de resiliência de AZ.

**22. Resposta: B** — Uma implantação Multi-AZ DB cluster roda um escritor e duas standbys legíveis em três AZs, com um reader endpoint, então a capacidade standby serve leituras enquanto ainda suporta failover automático rápido. *Por que não as outras:* A — a única standby em uma implantação de instância não serve tráfego; C — as read replicas não fornecem failover automático gerenciado e os bancos de dados RDS não são balanceados via ALB; D — Single-AZ não tem failover algum.

**23. Resposta: B** — A replicação do Aurora Global Database é assíncrona na camada de armazenamento com atraso típico abaixo de um segundo, então o RPO entre Regiões é próximo de zero, mas nunca pode ser garantido como exatamente 0. *Por que não as outras:* A — a replicação não é síncrona entre Regiões; C — o write forwarding roteia as escritas para o primário; não muda a semântica de replicação; D — o atraso de replicação é tipicamente abaixo de um segundo, não um agendamento de 5 minutos.

**24. Resposta: B** — O Recovery Time Objective é o tempo de inatividade máximo tolerável (4 horas); o Recovery Point Objective é a janela de perda de dados máxima tolerável (15 minutos). *Por que não as outras:* A — inverte as definições; C — MTBF/MTTR são estatísticas de confiabilidade, não objetivos de DR; D — SLA é um compromisso contratual, não uma métrica de perda de dados.

**25. Resposta: B** — O pilot light mantém os dados continuamente replicados e os recursos centrais provisionados, mas desligados, resultando em um RTO de dezenas de minutos a baixo custo — uma correspondência exata. *Por que não as outras:* A — backup and restore não tem replicação ao vivo e um RTO muito mais longo; C — o warm standby mantém a stack em execução, custando mais do que o necessário; D — o active/active é o mais caro e excede em muito o requisito.

**26. Resposta: C, E** — O warm standby é uma cópia completa, reduzida em escala e sempre em execução; o multi-site active/active serve de múltiplas Regiões com RTO próximo de zero ao maior custo. *Por que não as outras:* A — backup and restore é definido por não pré-executar recursos; B — backup and restore tem o RTO mais alto (pior); D — o pilot light é provisionado-mas-desligado, não capacidade total servindo tráfego.

**27. Resposta: B** — Quando o timeout de visibilidade de 30 segundos expira no meio do processamento, a mensagem reaparece e outro consumidor a processa novamente; defina o timeout de visibilidade mais longo do que o tempo máximo de processamento (ex.: 6x como boa prática). *Por que não as outras:* A — FIFO vs. standard não é a causa; C — o long polling afeta a eficiência de recebimento vazio, não as duplicatas; D — o período de retenção governa por quanto tempo as mensagens persistem, não a reentrega.

**28. Resposta: A** — Uma política de redrive com maxReceiveCount move as mensagens que falham repetidamente ("poison pill") para uma dead-letter queue para análise offline, interrompendo o loop infinito de novas tentativas. *Por que não as outras:* B — um timeout de visibilidade mais curto faz o loop girar mais rápido; C — o FIFO não descarta mensagens malformadas; D — uma retenção de 1 minuto também expiraria mensagens válidas.

**29. Resposta: B** — As filas FIFO garantem processamento exatamente-uma-vez e ordenação estrita dentro de um MessageGroupId; usar o ID da conta como o group ID dá ordenação por conta com paralelismo entre contas (e o modo FIFO de alto throughput pode escalar ainda mais). *Por que não as outras:* A — as filas standard não podem garantir ordem ou exatamente-uma-vez; C — o SNS não fornece garantia de ordenação ou de processamento exatamente-uma-vez para esse padrão; D — um único group ID serializa tudo, destruindo o throughput.

**30. Resposta: B** — O fan-out de SNS-para-SQS entrega cada evento a cada fila, onde cada consumidor obtém buffering durável e ritmo de processamento independente. *Por que não as outras:* A — três consumidores em uma fila dividem as mensagens; cada mensagem vai para apenas um consumidor; C — a invocação sequencial não é processamento paralelo independente com buffering; D — assinaturas de e-mail entregam para humanos, não para buffers de aplicação duráveis.

**31. Resposta: B** — A concorrência reservada reserva concorrência dedicada para as funções críticas (e limitar a função da promoção limita seu raio de impacto), evitando que uma função esgote o pool compartilhado da conta. *Por que não as outras:* A — um timeout mais longo mantém os slots de concorrência ocupados por mais tempo, piorando o throttling; C — a concorrência provisionada pré-aquece ambientes, mas não eleva a cota de concorrência da conta; D — o tamanho da memória não afeta os limites de concorrência.

**32. Resposta: B** — Os workflows Standard rodam por até um ano, e o padrão de callback waitForTaskToken pausa a execução sem custo de computação até que SendTaskSuccess/SendTaskFailure retorne o token. *Por que não as outras:* A — os workflows Express têm máximo de 5 minutos; C — o Lambda pode rodar no máximo 15 minutos e dormir desperdiça dinheiro; D — os agendamentos do EventBridge podem disparar eventos, mas não podem pausar e retomar o estado do workflow.

**33. Resposta: A** — Os workflows Express foram feitos para execuções de taxa muito alta, curta duração e ao-menos-uma-vez a menor custo; os workflows Standard fornecem semântica exatamente-uma-vez, duração de até um ano e histórico de execução completo para o job de reconciliação. *Por que não as outras:* B — o Standard não consegue sustentar economicamente 90.000 inícios/segundo para esse caso de uso; C — o Express tem máximo de 5 minutos e é ao-menos-uma-vez, falhando no job de 12 horas exatamente-uma-vez; D — atribuições invertidas falham em ambas as cargas de trabalho.

**34. Resposta: B** — O roteamento de failover envia todo o tráfego para o primário enquanto sua verificação de integridade passa, depois responde automaticamente com o registro secundário quando ele falha. *Por que não as outras:* A — ponderado 50/50 envia metade do tráfego para a cópia passiva o tempo todo; C — o roteamento baseado em latência divide o tráfego por desempenho, não pela intenção active/passive; D — a geolocalização roteia pela localização do usuário, sem relação com failover baseado na integridade do endpoint.

**35. Resposta: B** — Adicionar o tipo de health check ELB faz o ASG tratar as falhas de integridade do target do ALB como não saudáveis, então instâncias com app travado são encerradas e substituídas mesmo que as EC2 status checks passem. *Por que não as outras:* A — o monitoramento detalhado muda apenas a granularidade das métricas; C — o grace period atrasa a avaliação de integridade, o oposto do necessário; D — o tipo de balanceador de carga não é o problema.

**36. Resposta: B** — O Network Load Balancer opera na camada 4 (TCP/UDP), lida com milhões de requisições por segundo com latência ultrabaixa e suporta um IP estático (ou Elastic) por AZ. *Por que não as outras:* A — o ALB é camada 7 (HTTP/HTTPS) e não oferece IPs estáticos nativamente; C — o Gateway Load Balancer é para implantar appliances virtuais inline; D — o Classic Load Balancer é legado e não atende a nenhum requisito.

**37. Resposta: B, C** — O CRR exige versionamento habilitado em ambos os buckets, e as classes Standard do EFS são sistemas de arquivos regionais (multi-AZ) montáveis simultaneamente entre AZs. *Por que não as outras:* A — o CRR só replica novos objetos após a configuração, a menos que você execute o S3 Batch Replication para os existentes; D — o EFS suporta milhares de clientes NFS simultâneos, ao contrário do EBS de anexação única; E — o versionamento é um pré-requisito para a replicação, mas não replica nada por si só.

### Parte 3 — Questões 38–53

**38. Resposta: B** — O io2 Block Express entrega até 256.000 IOPS, latência submilissegundo e durabilidade de 99,999%, atendendo aos três requisitos. *Por que não as outras:* A — o gp3 agora pode alcançar o número de IOPS (seu teto foi elevado para 80.000 no final de 2025), mas falha nos outros dois requisitos: a durabilidade é de 99,8–99,9% (a questão exige 99,999%) e sua latência é de milissegundos de um único dígito, não submilissegundo garantido; B é o único tipo que atende aos três; C — o st1 é baseado em HDD e inadequado para bancos de dados intensivos em IOPS; D — o gp2 tem máximo de 16.000 IOPS e o bursting não é uma garantia sustentada.

**39. Resposta: C** — O FSx for Lustre é feito especificamente para HPC com latência submilissegundo, centenas de GB/s de throughput e integração nativa com o S3 (lazy-loading e exportação). *Por que não as outras:* A — o EFS não consegue igualar o perfil de throughput/latência de HPC do Lustre; B — o FSx for Windows é voltado para cargas de trabalho SMB/Windows, não para HPC Linux; D — o Mountpoint for S3 não entrega semântica de sistema de arquivos POSIX compartilhado nem a latência exigida.

**40. Resposta: B** — O FSx for Windows File Server suporta nativamente SMB, integração com Active Directory e ACLs NTFS, e o modo Multi-AZ cobre o requisito de duas AZs. *Por que não as outras:* A — o EFS é NFS/POSIX e não preserva permissões NTFS; C — o S3 é armazenamento de objetos, não um compartilhamento de arquivos SMB; D — o Lustre é um sistema de arquivos de HPC Linux, sem suporte a SMB/AD.

**41. Resposta: D, E** — O Transfer Acceleration roteia os uploads pela rede de borda/backbone da AWS para acelerar transferências de longa distância, e o upload multipart paraleliza as transferências e permite que partes que falharam sejam repetidas sem reiniciar todo o arquivo de 40 GB. *Por que não as outras:* A — One Zone-IA muda a redundância, não o desempenho de upload; B — você não pode colocar um ALB na frente do S3 para uploads; C — o CRR replica após o upload e não ajuda na ingestão.

**42. Resposta: B** — Os SSDs NVMe do instance store estão fisicamente anexados ao host, oferecendo a menor latência para dados efêmeros que podem ser regerados. *Por que não as outras:* A e D — o EBS atravessa a rede e adiciona latência; C — o EFS é um sistema de arquivos de rede com latência maior do que ambos.

**43. Resposta: B** — Throttling em partições quentes com baixa utilização geral é o clássico problema de chave de partição de baixa cardinalidade; uma chave de alta cardinalidade (ex.: game_id#player_id) distribui o tráfego de forma uniforme. *Por que não as outras:* A — mudanças no modo de capacidade não corrigem partições quentes; C — um LSI compartilha a mesma chave de partição e as mesmas partições quentes; D — os Streams capturam alterações, não redistribuem escritas.

**44. Resposta: B** — O DAX é um cache em memória compatível com DynamoDB e transparente à API, entregando leituras em microssegundos com alteração mínima de código. *Por que não as outras:* A — o ElastiCache exige reescritas da aplicação para gerenciar o cache; C — um GSI não armazena itens quentes em cache nem dá latência em microssegundos; D — as Global Tables abordam o acesso multirregião, não a latência de leitura de um único item.

**45. Resposta: B** — Um GSI pode ser adicionado a uma tabela existente a qualquer momento, suporta uma nova combinação de chave de partição/ordenação e tem seu próprio throughput provisionado, isolado da tabela base. *Por que não as outras:* A — os LSIs só podem ser criados na criação da tabela, compartilham a chave de partição da tabela e compartilham o throughput da tabela; C — recriar a tabela é disruptivo e desnecessário; D — os Streams são para captura de alterações, não para consultas ad hoc.

**46. Resposta: B** — O DynamoDB TTL exclui os itens expirados automaticamente em segundo plano, sem custo extra. *Por que não as outras:* A — scans agendados consomem capacidade de leitura/escrita e custam dinheiro; C — políticas de ciclo de vida são um conceito de S3/EFS, não de DynamoDB; D — os Streams filtram eventos downstream, mas não excluem itens da tabela.

**47. Resposta: B** — O RDS Proxy faz o pooling e a multiplexação de conexões, permitindo que milhares de invocações Lambda compartilhem um pequeno conjunto de conexões de banco de dados com apenas uma mudança na string de conexão. *Por que não as outras:* A — aumentar o tamanho é caro e apenas adia o limite; C — uma migração de banco de dados é uma grande alteração de aplicação; D — limitar o Lambda a 10 prejudica o throughput em vez de resolver o gerenciamento de conexões.

**48. Resposta: A** — As Aurora Replicas (até 15) atrás do reader endpoint com auto scaling de réplica descarregam o tráfego de leitura com mínimo trabalho operacional. *Por que não as outras:* B — o Aurora não usa um modelo de standby passiva; standbys nos termos clássicos do RDS não servem tráfego; C — o sharding é alto overhead operacional para um problema de escalonamento de leitura; D — o Backtrack rebobina o banco de dados no tempo, não serve leituras.

**49. Resposta: B** — O Global Accelerator fornece dois IPs anycast estáticos, suporta UDP, fica na frente de NLBs em múltiplas regiões e faz failover em segundos pelo backbone da AWS. *Por que não as outras:* A — o CloudFront serve conteúdo HTTP/HTTPS, não UDP arbitrário, e não tem IPs estáticos voltados ao cliente; C — o roteamento por latência do Route 53 depende dos TTLs de DNS para o failover e não fornece IPs estáticos; D — um ALB é regional e apenas HTTP.

**50. Resposta: B** — O roteamento por geolocalização responde às consultas DNS com base no país do usuário, impondo Alemanha→eu-central-1 e França→eu-west-3 de forma determinística para a conformidade de licenciamento. *Por que não as outras:* A — o roteamento por latência escolhe o endpoint mais rápido, o que pode violar a regra de licenciamento; C — o viés de geoproximidade desloca os limites por distância, mas não garante o mapeamento estrito por país; D — o roteamento ponderado distribui aleatoriamente por peso, ignorando a localização.

**51. Resposta: C** — Um cluster placement group agrupa as instâncias próximas em uma AZ para a menor latência e o maior número de pacotes por segundo, ideal para cargas de trabalho MPI fortemente acopladas. *Por que não as outras:* A — os spread groups separam as instâncias em hardware distinto, aumentando a latência, e têm limite de 7 por AZ; B — os partition groups isolam domínios de falha para sistemas de dados distribuídos, não MPI de baixa latência; D — sub-redes separadas não fazem nada para co-localizar instâncias.

**52. Resposta: B** — O Amazon Data Firehose é totalmente gerenciado, não exige consumidores nem gerenciamento de shards, faz buffer de registros e pode converter JSON para Parquet antes de entregar ao S3. *Por que não as outras:* A — o Kinesis Data Streams exige escrever/gerenciar consumidores; C — SQS mais pollers EC2 é infraestrutura personalizada para construir e operar; D — o MSK exige gerenciar clusters e conectores Kafka.

**53. Resposta: B** — Os Glue crawlers inferem o esquema para o Data Catalog e o Athena roda SQL serverless diretamente contra os arquivos do S3. *Por que não as outras:* A — o Redshift exige provisionamento de cluster e carregamento de dados; C — o EMR significa gerenciar um cluster de longa duração; D — o RDS exigiria carregar os dados em um servidor de banco de dados.

### Parte 4 — Questões 54–65

**54. Resposta: C** — Jobs em lote com checkpoint e reiniciáveis são a carga de trabalho ideal para Spot, e uma Spot Fleet diversificada entre tipos de instância/AZs minimiza o impacto da interrupção com até ~90% de economia. *Por que não as outras:* A — On-Demand abre mão do desconto sem nenhum benefício aqui; B e D — compromissos dão descontos menores do que o Spot e travam o gasto para um job amigável a interrupções.

**55. Resposta: C** — Os Compute Savings Plans se aplicam automaticamente em EC2 (qualquer família/região), Fargate e Lambda, encaixando-se na trajetória de modernização. *Por que não as outras:* A — os EC2 Instance Savings Plans estão travados a uma família de instância em uma região e excluem Fargate/Lambda; B e D — as Reserved Instances cobrem apenas EC2 e não se aplicam a Fargate ou Lambda.

**56. Resposta: B** — Apenas as EC2 Standard Reserved Instances podem ser listadas no Reserved Instance Marketplace; as RIs de RDS (e de outros serviços) não podem ser revendidas. *Por que não as outras:* A e C — as RIs de RDS não são elegíveis ao marketplace; D — as EC2 Standard RIs de fato podem ser vendidas no marketplace.

**57. Resposta: B** — A AWS entrega um aviso de interrupção de Spot dois minutos antes de recuperar a instância, dando tempo para drenar e fazer checkpoint. *Por que não as outras:* A — um aviso é fornecido; C e D — 15 minutos e 24 horas não são janelas de interrupção de Spot (recomendações de rebalanceamento podem chegar antes, mas não são uma janela fixa garantida).

**58. Resposta: B** — O Glacier Flexible Retrieval oferece baixo custo de armazenamento de arquivo e recuperações Expedited que retornam os dados em 1–5 minutos (cerca de US$ 0,03/GB), atendendo ao requisito de 5 minutos. *Por que não as outras:* A — a recuperação mais rápida do Deep Archive é ~12 horas; C — as recuperações Bulk levam de 5 a 12 horas; D — o Standard-IA recupera instantaneamente, mas custa muito mais para armazenamento raramente acessado por 7 anos.

**59. Resposta: B** — O One Zone-IA custa ~20% menos do que o Standard-IA e o trade-off de durabilidade de AZ única é aceitável para miniaturas reproduzíveis. *Por que não as outras:* A — o Standard-IA custa mais por uma redundância de que os dados não precisam; C — o Intelligent-Tiering adiciona taxas de monitoramento e não minimiza o custo para acesso comprovadamente pouco frequente; D — o Glacier Instant Retrieval tem um mínimo de 90 dias e um perfil de custo de recuperação diferente para esse padrão.

**60. Resposta: A, C** — O Intelligent-Tiering cobra uma pequena taxa de monitoramento/automação por objeto, e objetos abaixo de 128 KB são armazenados, mas não monitorados nem tierizados (cobrados pelas tarifas de Frequent Access). *Por que não as outras:* B — o Intelligent-Tiering não tem taxas de recuperação entre suas camadas automáticas; D — ele nunca replica entre regiões; E — não há mínimo de 90 dias para cada objeto na classe.

**61. Resposta: B** — As partes de uploads multipart incompletos são cobradas como armazenamento, mas são invisíveis como objetos; uma regra de ciclo de vida com AbortIncompleteMultipartUpload as exclui automaticamente. *Por que não as outras:* A — o versionamento aumentaria o armazenamento, não limparia as partes; C — mudar a classe de armazenamento não remove as partes órfãs; D — o Transfer Acceleration acelera as transferências, mas não limpa uploads já abandonados.

**62. Resposta: B** — O gp3 desacopla IOPS/throughput do tamanho e custa ~20% menos por GB do que o gp2, então a capacidade pode ser dimensionada corretamente mantendo os IOPS necessários; a migração é uma operação online de ModifyVolume. *Por que não as outras:* A — o io2 é mais caro, não menos; C — o st1 não consegue entregar os IOPS exigidos; D — excluir volumes destrói dados ao vivo.

**63. Resposta: B** — Um gateway VPC endpoint para o S3 é gratuito e elimina as cobranças de processamento de dados do NAT gateway para o tráfego de S3 na mesma região. *Por que não as outras:* A — uma NAT instance ainda incorre em custos de EC2 e operacionais; C — os interface endpoints cobram por hora e por GB, custando mais do que o gateway endpoint gratuito; D — sub-redes públicas adicionam cobranças de IPv4 público e enfraquecem a segurança.

**64. Resposta: B, E** — A AWS cobra por cada endereço IPv4 público em uso, então remover os desnecessários corta custos, e o AWS Budgets fornece alertas proativos de limite sobre o gasto previsto/real. *Por que não as outras:* A — os Elastic IPs também são cobrados sob a cobrança de IPv4 público mesmo enquanto anexados; C — o Compute Optimizer recomenda dimensionamento correto, mas não pode bloquear ou alertar sobre limites de gasto; D — o Shield Advanced é um serviço de DDoS que adiciona custo.

**65. Resposta: A** — O Aurora Serverless v2 suporta escalonamento para 0 ACUs (auto-pause, disponível desde o final de 2024) e retoma automaticamente na conexão, eliminando o custo de computação enquanto ocioso, sem etapas manuais. Nuances que vale conhecer: o auto-pause exige versões de motor recentes (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+); a primeira conexão após uma pausa leva ~15 segundos para retomar (mais tempo após 24+ horas pausado); o armazenamento continua sendo cobrado enquanto a computação está pausada; e qualquer coisa que mantenha conexões abertas — um RDS Proxy, uma verificação de integridade keep-alive — impede a pausa completamente. *Por que não as outras:* B — um cluster provisionado parado não acorda automaticamente quando os desenvolvedores se conectam (e reinicia após 7 dias); C — secundários headless de global database abordam DR, não custo de inatividade; D — leitores reduzidos ainda deixam a instância escritora rodando e sendo cobrada.

---

## Guia de Pontuação

| Pontuação | Leitura do resultado |
|---|---|
| 55–65 | Pronto para o exame. Marque o exame. Revise apenas as questões que errou. |
| 47–54 | Na faixa de aprovação, mas a margem é estreita. Releia os capítulos por trás de cada erro (use as tags de domínio), refaça em uma semana. |
| 38–46 | A base está aí; restam lacunas. Trabalhe o mapa de domínios do Apêndice B para os seus domínios fracos antes de refazer. |
| Abaixo de 38 | Releia os capítulos dos seus dois domínios mais fracos de ponta a ponta, refaça os exercícios desses capítulos e então refaça este simulado. |

Acompanhe seus erros *por domínio* (cada questão é marcada). Uma pontuação baixa concentrada em um domínio é um problema de estudo focado; a mesma pontuação espalhada uniformemente é um problema de ritmo ou de leitura das questões — vá mais devagar e sublinhe o que cada enunciado realmente exige (HA vs. DR, custo vs. desempenho, "MAIS econômica" vs. "MENOR overhead operacional").
