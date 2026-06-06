# Capítulo 15: Os Guardas no Portão

O escritório estava silencioso numa terça-feira de manhã quando Priya abriu os flow logs do VPC e começou a ler. Lá fora, pela janela, a cidade acordava. Cá dentro, o ecrã mostrava algo que não devia estar lá: uma conexão de saída de uma instância EC2 às 2:17 da manhã para um endereço IP na Roménia.

A chave de deploy antiga da primeira versão da Nimbus ainda estava ativa. Tinha feito três chamadas de API na semana passada. Leo não sabia o que as tinha feito.

---

*A revisão do IAM tinha substituído as chaves de acesso por roles. Cada serviço tinha agora exatamente as permissões de que precisava. Mas enquanto esse trabalho decorria, um problema mais antigo andava silenciosamente a piorar: uma credencial ativa de um pipeline de deploy desativado continuava viva, e algo a tinha usado. A camada de IAM tinha sido reforçada. Os controlos de rede que poderiam ter contido o dano precisavam da mesma atenção.*

---

Priya abriu os flow logs do VPC — registos de tráfego de rede que mostram cada conexão para dentro e para fora do VPC.

"Na terça-feira às 2:17 da manhã", disse ela, "houve uma conexão de saída da instância EC2 que corre a API antiga para um endereço IP na Roménia."

"Isso não é a nossa infraestrutura", disse Leo.

"Não."

"Então alguém estava na nossa instância EC2."

"Ou algo."

Eles seguiram o rasto: a chave de deploy antiga tinha sido usada para carregar um pequeno script na instância EC2. O script tinha tentado fazer scan de portas em servidores adjacentes. A maioria dos scans tinha falhado.

"Eu já fiz o deploy — oh." Leo tinha feito deploy de uma correção à regra de grupo de segurança antes de a investigação estar completa. A correção estava correta, mas ele tinha-a feito antes de Priya ter acabado de ler os flow logs. Ela teve de pausar e verificar que a mudança não tinha afetado nada inesperado.

"Da próxima vez, espera até a investigação estar fechada antes de enviar mudanças", disse ela.

"Os grupos de segurança bloquearam-nos", disse Priya. "O atacante entrou numa instância EC2. Não conseguiu alcançar as outras porque os grupos de segurança só permitiam tráfego do balanceador de carga."

"Então o dano foi contido."

"Porque tínhamos grupos de segurança corretamente configurados. Imagina se tivéssemos deixado a porta 5432 aberta a qualquer instância EC2 na conta."

Leo não precisava de imaginar. Tinha visto essa configuração na configuração original.

"Já pensámos no que isso significaria?", continuou Priya. "Qualquer instância EC2 na conta — incluindo a que tinha a chave comprometida — poderia ter-se conectado diretamente à base de dados. Correr SQL arbitrário. Descarregado o histórico de pedidos de cada cliente. Apagado tabelas."

"Em vez disso, foram rejeitados de cada vez que tentaram", disse Leo.

"Sim. Porque o grupo de segurança da base de dados só aceita conexões do grupo de segurança da API. Não de qualquer EC2 na conta. Não de qualquer IP. Especificamente do grupo de segurança da API."

"Essa única decisão de design", disse Maya, "foi a diferença entre um incidente contido e uma fuga de dados completa."

"O design de grupos de segurança não é uma checkbox", disse Priya. "É a segurança real do sistema."

Rafael tinha estado a ouvir. "Como é que se aprende qual é a configuração certa? As regras parecem arbitrárias ao início."

"Você começa por listar o que cada componente precisa de fazer", disse Priya. "O balanceador de carga precisa de aceitar HTTPS de qualquer lugar. O servidor de API precisa de aceitar HTTP apenas do balanceador de carga. A base de dados precisa de aceitar PostgreSQL apenas do servidor de API. O Redis precisa de aceitar a porta 6379 apenas do servidor de API. Esses requisitos mapeiam diretamente para regras de entrada. Tudo o resto é negado por padrão."

"E a saída?"

"A saída é onde as pessoas ficam preguiçosas. A maioria das equipas deixa a saída como permitir-tudo. Isso significa que uma instância comprometida pode chamar qualquer coisa. Vamos apertar isso."

**Duas Camadas de Segurança de Rede**

Num VPC, você tem duas ferramentas distintas para controlar o tráfego de rede:

**Grupos de Segurança**: Firewalls virtuais anexados a recursos individuais (instâncias EC2, bases de dados RDS, balanceadores de carga, funções Lambda num VPC). Operam ao nível do recurso.

**Network ACLs (NACLs)**: Regras de firewall anexadas a subnets. Operam na fronteira da subnet — antes de o tráfego chegar a qualquer recurso nessa subnet.

Perceber ambos requer perceber uma diferença crítica: **com estado (stateful) vs sem estado (stateless)**.

**Com Estado: Grupos de Segurança**

Um grupo de segurança é **stateful (com estado)**.

Quando você permite tráfego de entrada numa porta específica, o tráfego de resposta é automaticamente permitido à saída, mesmo que não haja nenhuma regra de saída explícita para ele.

Quando você permite tráfego de saída para um destino, a resposta que volta a entrar é automaticamente permitida.

Pense num guarda de segurança com estado num edifício de escritórios. Você mostra o crachá para entrar. Mais tarde, sai. O guarda não precisa de o verificar de novo à saída — o sistema sabe que você foi autorizado a entrar, e tem permissão para sair.

**Regras de Grupo de Segurança para a instância EC2 da API da Nimbus:**

- **Entrada — TCP 8080 — do SG do Balanceador de Carga** → Aceitar tráfego de API do ALB
- **Entrada — TCP 22 — do SG do Host Bastião** → SSH apenas do bastião
- **Saída — TCP 5432 — para o SG do RDS** → Conectar ao PostgreSQL
- **Saída — TCP 6379 — para o SG do ElastiCache** → Conectar ao Redis
- **Saída — TCP 443 — para 0.0.0.0/0** → HTTPS para APIs externas

Repare: nenhuma regra de saída explícita para a porta 8080. A regra de entrada é com estado — o tráfego de resposta (a resposta da API ao balanceador de carga) é automaticamente permitido.

Repare também: as regras de grupo de segurança referenciam *outros grupos de segurança*, não endereços IP. "Permitir entrada do grupo de segurança do balanceador de carga" significa "permitir tráfego de qualquer recurso que tenha este grupo de segurança anexado". Isto é mais flexível e mais fácil de manter do que rastrear endereços IP.

**Comportamento padrão:**

- Por padrão, todo o tráfego de entrada é negado
- Por padrão, todo o tráfego de saída é permitido
- Todas as regras são avaliadas (os grupos de segurança não têm regras ordenadas — todas as regras correspondentes se aplicam)
- Os grupos de segurança só podem **permitir** tráfego — você não pode criar regras de negação explícita

**Sem Estado: Network ACLs**

Uma NACL é **stateless (sem estado)**.

Quando você permite tráfego de entrada na porta 8080, isso só cobre a entrada. A resposta (tráfego de saída em portas efémeras) tem de ser explicitamente permitida com uma regra de saída.

Pense num detetor de metais. Você passa por ele à entrada. O detetor de metais não sabe que você já passou — tem de passar de novo à saída.

**As regras de NACL são numeradas e avaliadas por ordem.** A primeira regra que corresponde vence. A regra 100 é avaliada antes da regra 200. Se a regra 100 nega tráfego e a regra 200 o permite, o tráfego é negado.

As NACLs podem **negar** tráfego explicitamente — ao contrário dos grupos de segurança, que só podem permitir. Isto torna-as úteis para bloquear intervalos de IP específicos.

**Comportamento padrão da NACL:**

- A NACL padrão (criada com o seu VPC) permite todo o tráfego de entrada e de saída
- Uma NACL personalizada nega todo o tráfego por padrão (você tem de permitir explicitamente o que quer)

**NACL para a subnet pública (simplificada):**

*Regras de entrada (avaliadas por ordem — a primeira correspondência vence):*

- Regra 100: TCP 443, de 0.0.0.0/0 → **Allow** (HTTPS)
- Regra 110: TCP 80, de 0.0.0.0/0 → **Allow** (HTTP)
- Regra 120: TCP 1024–65535, de 0.0.0.0/0 → **Allow** (portas efémeras de retorno)
- Regra \*: Todo o tráfego → **Deny**

*Regras de saída:*

- Regra 100: TCP 443, para 0.0.0.0/0 → **Allow** (HTTPS)
- Regra 110: TCP 80, para 0.0.0.0/0 → **Allow** (HTTP)
- Regra 120: TCP 1024–65535, para 0.0.0.0/0 → **Allow** (portas efémeras de retorno)
- Regra \*: Todo o tráfego → **Deny**

A regra 120 (portas 1024-65535) permite as portas efémeras — as portas temporárias de número alto usadas para o tráfego de resposta TCP. Como as NACLs são sem estado, você tem de permitir estas explicitamente à saída, ou as respostas do seu servidor não passam.

**Quando Usar Qual**

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Por que ter duas ferramentas separadas — grupos de segurança *e* NACLs — se os grupos de segurança já funcionam? Qual é o sentido da complexidade extra?"

A resposta é que operam a níveis diferentes e têm capacidades diferentes. Os grupos de segurança protegem recursos individuais e só podem permitir tráfego. As NACLs protegem subnets inteiras e podem negar explicitamente. Ter ambos significa que você pode aplicar regras de permissão refinadas ao nível do recurso e regras de negação amplas ao nível da subnet — sem que uma interfira com a outra.

Use **grupos de segurança** para a camada principal de controlo de acesso. São mais fáceis de gerir, com estado (menos hipótese de bloqueios acidentais por esquecer portas efémeras), e suportam referenciar outros grupos de segurança.

Use **NACLs** para controlos ao nível da subnet, especialmente:

- **Regras de negação explícita**: Bloquear um endereço IP específico ou intervalo de alcançar uma subnet inteira
- **Bloqueio de emergência**: Um IP está ativamente a atacar — adicione uma regra de negação de NACL para bloquear a subnet inteira antes de chegar a qualquer recurso

Você pode estar a perguntar-se: se os grupos de segurança são com estado e bloqueiam toda a entrada por padrão, quando é que você de facto precisaria de NACLs? Os grupos de segurança lidam bem com a maioria dos casos. Mas há uma coisa que não conseguem fazer: negar explicitamente. Um grupo de segurança só pode permitir tráfego — se uma regra não corresponder, o tráfego é negado por padrão. Você não pode adicionar uma regra que diga "bloquear este IP específico". Para isso, você precisa de uma NACL: uma regra de negação numerada que para um intervalo de endereços específico antes de chegar a qualquer recurso na subnet. As NACLs são mais úteis para resposta de emergência (bloquear um atacante ativo) e para impor fronteiras ao nível da subnet que não devem depender da configuração de recursos individuais.

"Então o grupo de segurança é o controlo refinado", disse Maya, "e a NACL é a pincelada larga?"

"Os grupos de segurança protegem recursos individuais", confirmou Priya. "As NACLs protegem subnets inteiras. Quando você quer bloquear um IP de alcançar qualquer coisa na sua rede, NACL. Quando você quer permitir apenas que o balanceador de carga alcance o servidor de API, grupo de segurança."

"Já pensámos no que acontece se o atacante voltar com um IP diferente?", disse Priya. "A NACL bloqueia um intervalo. Eles mudam para outro."

"É para isso que serve o GuardDuty", disse Leo. "Deteção comportamental. Se o mesmo script correr de um novo IP, o padrão de tráfego parece-se igual."

"Lá chegaremos", disse Priya. "Primeiro o mais importante."

"Quanto é que tudo isto custa por mês?", perguntou Tom.

Os grupos de segurança e as NACLs em si são gratuitos. A AWS não cobra pelo número de grupos de segurança, número de regras, ou número de entradas de NACL. A consideração de custo é indireta: regras de saída de grupo de segurança mais apertadas podem encaminhar menos tráfego através do NAT Gateway, reduzindo as taxas de processamento de dados.

"Então os controlos de segurança são gratuitos", disse Rafael. "O custo é a infraestrutura que os suporta."

"Correto. NAT Gateways para alta disponibilidade. Interface VPC Endpoints para serviços que de outra forma passariam pelo NAT. Esses têm custos. As próprias regras de grupo de segurança não têm."

**Juntando Tudo: A Defesa em Camadas**

Depois do incidente, Priya desenhou as camadas de defesa da Nimbus no quadro branco:

```
Internet
  ↓
CloudFront + Shield (absorção de DDoS)
  ↓
WAF (filtragem ao nível da aplicação)
  ↓
Internet Gateway
  ↓
NACL na subnet pública (regras ao nível da subnet, bloqueio de emergência)
  ↓
Grupo de Segurança do ALB (HTTPS de qualquer lugar)
  ↓
NACL na subnet privada de app
  ↓
Grupo de Segurança da API EC2 (porta 8080 apenas do SG do ALB)
  ↓
NACL na subnet privada de dados
  ↓
Grupo de Segurança do RDS (porta 5432 apenas do SG da API)
```

"Cada camada assume que a anterior pode falhar", disse ela. "A base de dados não confia que a camada de rede parou o atacante. A instância EC2 não confia que o ALB parou o atacante. Cada camada impõe as suas próprias regras independentemente."

"Defesa em profundidade", disse Maya.

"Defesa em profundidade. Um atacante que passa por uma camada ainda enfrenta a seguinte. Nenhuma configuração incorreta isolada é catastrófica. Significa que uma camada falha, e as outras aguentam."

Leo olhou para o diagrama. O atacante tinha comprometido uma instância EC2. Tinha passado pela camada de credenciais. Mas cada camada subsequente tinha aguentado.

Era isto que a defesa em profundidade parecia na prática.

**O Incidente: O Que as Camadas Apanharam**

Voltando ao ataque do IP romeno:

**O que aconteceu**: O atacante usou a chave de deploy comprometida para carregar um script de scanning numa instância EC2. O script tentou conectar-se a outros serviços.

**O que os parou**:

- O grupo de segurança do RDS só permitia entrada na porta 5432 do grupo de segurança da API EC2. O script não conseguiu alcançar a base de dados a partir de uma ferramenta de scanning — não estava a anexar o grupo de segurança certo.
- O grupo de segurança do ElastiCache só permitia entrada na porta 6379 do grupo de segurança da API EC2.
- As outras instâncias EC2 só permitiam SSH do grupo de segurança do host bastião.

**O que não os parou**:

- As regras de saída da instância EC2 permitiam HTTPS para 0.0.0.0/0 (necessário para downloads de pacotes). O script usou isto para fazer conexões de saída para o servidor do atacante.

Depois do incidente, Priya adicionou:

- Uma regra de NACL a bloquear o intervalo de IP romeno
- Uma regra de saída mais restritiva nas instâncias EC2 (só permitia destinos específicos conhecidos como bons)
- Uma verificação de que o **IMDSv2 estava imposto** (`HttpTokens=required`) em cada instância — o script tinha corrido *na* instância, o que significava que poderia ter consultado o serviço de metadados para obter as credenciais temporárias da role da instância. O IMDSv2 tinha sido ativado lá atrás no Capítulo 4; Priya verificou que continuava obrigatório em todo o lado, porque um atacante com execução de código mais IMDSv1 é igual a credenciais AWS roubadas.

---

**Ler os Flow Logs: O Que Priya Viu**

A investigação começou com os flow logs do VPC. Priya abriu o CloudWatch Logs Insights e rodou uma consulta contra o grupo de flow logs das últimas 48 horas:

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` era a instância EC2 comprometida. O filtro REJECT mostrou as tentativas de conexão que tinham sido bloqueadas.

Os resultados:

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Outra instância EC2 — SSH bloqueado
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Outra EC2 — SSH bloqueado
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — bloqueado pelo grupo de segurança
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # Réplica RDS — bloqueada
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — bloqueado
```

O scan tinha atingido cada serviço interno. Cada tentativa tinha sido rejeitada. O design dos grupos de segurança tinha aguentado.

Mas havia também uma entrada de ACCEPT de saída:

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 bytes
```

Essa era a tentativa de exfiltração de dados — 2,8 kilobytes enviados para o IP romeno por HTTPS. O grupo de segurança permitia HTTPS de saída para downloads legítimos de pacotes. O atacante tinha usado essa regra.

"Os grupos de segurança pararam o movimento lateral", disse Priya, guiando a equipa pelos logs. "Mas a regra de saída era demasiado permissiva. Permitíamos HTTPS para qualquer destino. Devíamos permitir HTTPS apenas para endpoints AWS conhecidos — CloudWatch, Secrets Manager, S3 — e para as CDNs dos repositórios de pacotes."

Ela mostrou as regras de saída atualizadas do grupo de segurança:

```
TCP 443 → pl-63a5400a (prefix list do gateway endpoint do S3 da AWS)
TCP 443 → pl-02cd2c6b (CloudWatch Logs da AWS)
TCP 443 → 54.239.0.0/18 (repositórios de pacotes da AWS — estreita ao longo do tempo)
```

"Isso elimina a regra geral de HTTPS de saída. O HTTPS de saída agora só vai para destinos conhecidos como bons."

"E quanto às funções Lambda que chamam APIs de terceiros?", perguntou Leo.

"Essas passam pelo NAT Gateway, que tem a sua própria regra de saída dedicada", disse Priya. "O Lambda não usa o grupo de segurança da EC2. Interface de rede diferente, conjunto de regras diferente."

---

**A História da Depuração Sem Estado**

Duas semanas depois do incidente, Rafael — ainda no seu primeiro mês — estava a ajudar a configurar um novo pipeline de dados. Envolvia uma função Lambda num VPC que precisava de chamar uma API interna a correr em EC2.

A função Lambda dava timeout. Cada chamada dava timeout.

Rafael verificou os grupos de segurança. O grupo de segurança do Lambda tinha uma regra de saída para TCP 8080 para o grupo de segurança da EC2. O grupo de segurança da EC2 tinha uma regra de entrada para TCP 8080 do grupo de segurança do Lambda. As regras pareciam corretas.

Ele virou-se para Leo. "Os grupos de segurança parecem bem. Por que é que está a dar timeout?"

Leo olhou para a configuração da subnet. A função Lambda estava numa subnet privada. A subnet tinha uma NACL personalizada que Priya tinha aplicado durante o reforço de segurança.

Ele olhou para as regras de saída da NACL:

```
Regra 100: TCP 443  → 0.0.0.0/0  ALLOW
Regra 110: TCP 5432 → 10.0.20.0/24 ALLOW
Regra *:   All      → 0.0.0.0/0  DENY
```

"A NACL permite HTTPS de saída e PostgreSQL de saída", disse Leo. "Não permite TCP 8080 de saída."

"O grupo de segurança permite", disse Rafael.

"A NACL não. E a NACL é sem estado. Mesmo que o grupo de segurança da função Lambda permita a conexão de saída, a NACL na fronteira da subnet ainda avalia o tráfego de saída. A NACL está a bloquear a chamada do Lambda antes de ela sair da subnet."

"Mas se eu adicionar ALLOW para TCP 8080 de saída à NACL—"

"Você também precisa de adicionar ALLOW para portas efémeras de entrada", disse Leo. "A resposta da instância EC2 volta numa porta aleatória entre 1024 e 65535. Se as regras de entrada da NACL não permitirem essas, a resposta é bloqueada na viagem de regresso."

Rafael atualizou a NACL:

```
Regra 100:  TCP 443       → 0.0.0.0/0      ALLOW  (saída)
Regra 105:  TCP 8080      → 10.0.10.0/24   ALLOW  (saída para a subnet de EC2)
Regra 110:  TCP 5432      → 10.0.20.0/24   ALLOW  (saída para a subnet de DB)
Regra *:    All           → 0.0.0.0/0      DENY
```

E no lado da entrada:

```
Regra 100:  TCP 1024-65535 from 10.0.10.0/24  ALLOW  (tráfego de retorno da EC2)
Regra *:    All                               DENY
```

A função Lambda conectou-se imediatamente.

"É por isto que as pessoas odeiam as NACLs", disse Rafael.

"É por isto que você precisa de as perceber", disse Priya. "Os bugs que criam são precisamente os bugs que foram concebidas para prevenir — fluxos de tráfego inesperados. Perceber o modelo sem estado diz-lhe exatamente onde olhar quando uma conexão falha misteriosamente."

"Grupo de segurança com estado — tráfego de retorno automático. NACL sem estado — tráfego de retorno precisa de regras explícitas", repetiu Rafael.

"Diz isso até fazer parte da forma como você pensa", disse Priya.

---

**Bloqueio de Emergência com NACL: A Regra do /24**

Depois de identificar o intervalo de IP de origem do atacante, a resposta de Priya foi imediata: adicionar uma regra de negação de NACL.

Mas ela não bloqueou apenas o IP único. Bloqueou o `/24` inteiro — a subnet de 256 endereços a partir da qual o atacante estava a operar.

"Por que o /24 inteiro?", perguntou Leo.

"Porque bloquear IPs individuais é um jogo perdido. Os atacantes usam múltiplos IPs dentro de um intervalo, rodando por eles quando um é bloqueado. Bloquear o /24 torna mais difícil — eles teriam de mudar para um bloco de endereços diferente, o que lhes custa tempo e esforço."

A regra de NACL:

```
Regra 90:  ALL from 185.220.101.0/24 → DENY
```

A regra 90 é avaliada antes de quaisquer regras de permissão (que começam na regra 100). O intervalo inteiro é bloqueado antes de qualquer regra de permissão ser considerada.

"E isto aplica-se a cada recurso na subnet?", perguntou Leo.

"Cada recurso. É esse o sentido de uma NACL — aplica-se antes de o tráfego chegar ao grupo de segurança de qualquer recurso individual. Uma negação de NACL na regra 90 significa que o pacote nunca chega à avaliação do grupo de segurança."

"Podíamos fazer isto com um grupo de segurança em vez disso?"

"Não. Os grupos de segurança só podem permitir tráfego. Não há regra de negação. Se você quer bloquear um IP específico de alcançar qualquer recurso numa subnet, a NACL é a única opção."

Este é o caso de uso principal para as regras de negação de NACL: resposta de emergência a ataques ativos. O grupo de segurança é o mecanismo de controlo principal. A NACL é o travão de emergência.

---

**Padrões de Design de Grupos de Segurança: Referenciar por ID**

"Já pensámos no que acontece quando as nossas instâncias EC2 são substituídas?", perguntou Priya. "O Auto Scaling termina instâncias antigas e lança novas. As novas instâncias recebem novos endereços IP privados."

"Se as regras de grupo de segurança referenciam endereços IP", disse Leo devagar, "teríamos de atualizar as regras cada vez que uma instância é substituída."

"Exatamente. É por isso que você não referencia endereços IP nas regras de grupo de segurança para tráfego intra-VPC."

Os grupos de segurança podem referenciar outros grupos de segurança em vez de endereços IP. Quando uma regra diz "permitir entrada do grupo de segurança do balanceador de carga", significa "permitir tráfego de qualquer recurso que tenha o grupo de segurança do balanceador de carga anexado". O Auto Scaling pode lançar mil novas instâncias com um IP novo cada, e a regra permanece válida.

A estrutura de grupos de segurança da Nimbus:

```
nimbus-alb-sg (Balanceador de Carga)
  - Entrada: TCP 443 de 0.0.0.0/0
  - Entrada: TCP 80 de 0.0.0.0/0

nimbus-api-sg (instâncias da API EC2)
  - Entrada: TCP 8080 de nimbus-alb-sg
  - Entrada: TCP 22 de nimbus-bastion-sg
  - Saída: TCP 5432 para nimbus-rds-sg
  - Saída: TCP 6379 para nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Entrada: TCP 5432 de nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Entrada: TCP 6379 de nimbus-api-sg

nimbus-bastion-sg (Host Bastião)
  - Entrada: TCP 22 de <IP da VPN do escritório>
```

Nenhum endereço IP para tráfego interno. Apenas IDs de grupo de segurança. Quando uma instância é substituída, a associação ao grupo de segurança transfere-se automaticamente para a nova instância.

"E para os microsserviços que estamos a planear?", perguntou Rafael. "Vamos ter uma dúzia de serviços eventualmente. Cada um precisa de falar com alguns dos outros, mas não com todos."

"Cada serviço recebe o seu próprio grupo de segurança", disse Priya. "O grupo de segurança do Serviço A é referenciado nas regras de entrada de cada serviço que o Serviço A tem permissão para chamar. Os serviços que não devem comunicar simplesmente não referenciam os grupos de segurança um do outro."

Este é o **padrão de grupo de segurança hub-and-spoke** para microsserviços. Um grupo de segurança de base de dados partilhado tem regras de entrada de cinco grupos de segurança de serviços diferentes. Se um sexto serviço precisar de acesso à base de dados, você adiciona o seu grupo de segurança à regra de entrada da base de dados. Se o acesso deve ser removido, você remove a referência. Sem gestão de IPs. Sem regras obsoletas a apontar para servidores desativados.

"O grupo de segurança é a identidade", disse Priya. "O endereço IP é um acidente de agendamento."

---

**Firewall de Privilégio Mínimo: A Disciplina**

"Já pensámos qual é a postura correta para as regras de saída?", perguntou Priya durante a revisão pós-incidente.

A maioria das equipas deixa as regras de saída do grupo de segurança da EC2 no padrão: permitir tudo à saída. Isto é conveniente — a aplicação pode chamar qualquer coisa — mas não é privilégio mínimo.

O princípio de Priya: as regras de saída devem ser tão específicas como as regras de entrada.

Regras de saída do grupo de segurança da API da Nimbus, depois do reforço:

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL para RDS)
TCP 6379 → nimbus-redis-sg     (Redis para ElastiCache)
TCP 443  → prefix list de s3.amazonaws.com    (gateway endpoint do S3)
TCP 443  → endpoint do secretsmanager         (Secrets Manager)
TCP 443  → endpoint do logs                    (CloudWatch Logs)
```

Sem "permitir tudo à saída". Cada destino nomeado.

"Isto é muita manutenção", disse Leo.

"É mais manutenção do que permitir-tudo", reconheceu Priya. "É menos limpeza do que uma fuga de dados. O atacante que comprometeu a instância EC2 poderia ter exfiltrado mais dados se as regras de saída estivessem abertas. Eles usaram a regra de HTTPS-para-qualquer-lado porque ela estava lá."

"E com regras de saída específicas, mesmo uma instância comprometida só pode enviar dados para destinos aprovados."

"Exatamente. O grupo de segurança torna-se a última linha de contenção, não apenas a primeira linha de defesa."

---

## Pontos Fortes e Limitações

**Grupos de Segurança**:

- Com estado (sem dores de cabeça com portas efémeras)
- Podem referenciar outros grupos de segurança (mais flexível do que IPs)
- Apenas regras de permissão — sem negação explícita
- Operam ao nível do recurso — granulares
- As regras aplicam-se imediatamente — sem ordenação, sem prioridade
- Múltiplos grupos de segurança podem ser anexados a um recurso — as regras de todos são combinadas

**NACLs**:

- Sem estado (requer regras explícitas para ambas as direções, incluindo portas efémeras)
- Podem negar explicitamente — útil para bloquear IPs conhecidos como maus
- Operam ao nível da subnet — pincelada mais larga
- Regras numeradas avaliadas por ordem — previsíveis mas requerem gestão cuidadosa
- Aplicam-se antes de o tráfego chegar a qualquer recurso na subnet — primeira linha de defesa
- Eficazes para bloqueio de emergência de IP por toda uma subnet

**Onde cada ferramenta encaixa**:

Use grupos de segurança para tudo por padrão. Adicione NACLs quando você precisar de regras de negação explícita — bloquear um intervalo de IP, bloquear uma porta ao nível da subnet independentemente da configuração de recursos individuais, ou impor que uma subnet de dados nunca possa receber tráfego de uma origem específica. As NACLs não são um substituto para os grupos de segurança; são um suplemento para situações onde o design só-permitir dos grupos de segurança é insuficiente.

## Resumo

O incidente do IP romeno tinha sido contido por controlos de segurança que já estavam no lugar — não por sorte, mas por design. Os grupos de segurança tinham prevenido o movimento lateral dentro do VPC. Depois do incidente, as NACLs adicionaram a capacidade de bloquear explicitamente o intervalo de IP do atacante na fronteira da subnet. Os flow logs do VPC tornaram o ataque visível. Duas ferramentas, duas camadas, dois trabalhos diferentes — com logging para provar o que aconteceu.

- Os **Grupos de Segurança** são firewalls virtuais com estado para recursos individuais. Apenas regras de permissão. Todas as regras avaliadas em simultâneo.
- As **NACLs** são firewalls sem estado para subnets inteiras. Regras de permissão e de negação. Regras avaliadas por ordem de número — a primeira correspondência vence.
- **Com estado** significa que o tráfego de resposta é automaticamente permitido. **Sem estado** significa que você tem de permitir explicitamente o tráfego em ambas as direções, incluindo as portas efémeras de retorno.
- Os grupos de segurança são a sua camada principal de controlo de acesso. As NACLs são a anulação ao nível da subnet — especialmente para bloqueio de emergência.
- Quando uma NACL permite tráfego de entrada, você também tem de permitir as portas efémeras de saída (1024-65535) para a resposta TCP passar.
- **Referencie grupos de segurança por ID**, não por endereço IP, para tráfego intra-VPC. O Auto Scaling substitui instâncias; a associação ao grupo de segurança transfere-se automaticamente.
- **Regras de saída específicas** nas instâncias EC2 limitam o que uma instância comprometida pode fazer — firewall de privilégio mínimo.
- Use flow logs para ver o que os grupos de segurança e as NACLs estão de facto a fazer. As regras são teoria. Os logs são evidência.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Seguras (Domínio 1, Tarefa 1.2)*

- **Com estado vs sem estado**: Esta distinção é o conceito mais testado neste capítulo. Grupos de segurança = com estado = resposta permitida automaticamente. NACLs = sem estado = tem de permitir explicitamente o tráfego de resposta.
- **Regras de grupo de segurança**: Sem negação explícita. Quando múltiplos grupos de segurança são anexados a uma instância, aplica-se a união de todas as regras. Todas as regras correspondentes são avaliadas em simultâneo.
- **Ordem das regras de NACL**: As regras são avaliadas do número mais baixo para o mais alto. Regra 100 antes da 200. A primeira correspondência vence. A regra `*` (asterisco) no fundo é a negação implícita. Adicionar uma regra de negação na regra 90 bloqueia antes de qualquer regra de permissão na 100.
- **Portas efémeras**: O erro clássico de NACL é esquecer-se de permitir a saída nas portas 1024-65535. Se a sua NACL permite HTTP de entrada (porta 80) mas não permite portas efémeras de saída, os utilizadores conseguem enviar pedidos mas nunca recebem respostas. Este é o cenário de NACL mais comum no exame.
- **Referenciamento de grupos de segurança**: Você pode permitir tráfego de outro grupo de segurança (não apenas um IP). Este é o padrão recomendado para tráfego intra-VPC. O exame usa frequentemente "permitir entrada do grupo de segurança do ALB" como a resposta correta para restringir o acesso à EC2.
- **NACL padrão vs NACL personalizada**: A NACL padrão permite todo o tráfego. Uma NACL personalizada (uma que você cria) nega todo o tráfego por padrão. Cenário de exame: "criou uma nova NACL e agora o tráfego está bloqueado" → verifique se faltam regras de permissão.
- **Bloquear o IP de um atacante**: Os grupos de segurança não podem bloquear IPs específicos (só permitir). As NACLs podem negar explicitamente um IP ou CIDR específico. Cenário de exame: "bloquear um IP específico de alcançar qualquer recurso na subnet" → regra de negação de NACL.
- **Depurar falhas de conexão**: Verifique a ordem: grupo de segurança na origem (saída) → grupo de segurança no destino (entrada) → NACL na subnet de origem (saída + portas efémeras) → NACL na subnet de destino (entrada). A maioria das falhas de conexão do exame é causada por uma regra de saída de NACL em falta ou uma permissão de porta efémera em falta.
- **Múltiplas subnets e NACLs**: Uma NACL aplica-se a todas as subnets associadas a ela. Uma subnet só pode estar associada a uma NACL. O exame pode perguntar qual NACL atualizar quando o tráfego de uma subnet específica é afetado.

## Exercícios

**Exercício 1 — Recordar**

Uma programadora adiciona uma regra de entrada a um grupo de segurança a permitir tráfego na porta 443. Ela também precisa de adicionar uma regra de saída para permitir a resposta do servidor? Por que sim ou por que não?

Se em vez disso ela adicionar uma regra de entrada a uma NACL a permitir tráfego na porta 443, ela precisa de adicionar uma regra de saída? Por que sim ou por que não?

**Sugestão**: Pense nas analogias do capítulo — cada uma é o guarda de segurança que se lembra de o ter deixado entrar, ou o detetor de metais por onde você tem de passar de novo à saída?

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa tem uma aplicação web a correr em instâncias EC2 numa subnet pública. A aplicação aceita tráfego HTTPS (porta 443) da internet. Os utilizadores estão a reportar que conseguem conectar-se à aplicação mas não conseguem receber respostas — os pedidos ficam pendurados e dão timeout.

O grupo de segurança da EC2 tem uma regra de entrada a permitir TCP 443 de 0.0.0.0/0. A NACL da subnet tem uma regra de entrada (regra 100) a permitir TCP 443 de 0.0.0.0/0 e uma regra de saída (regra 100) a permitir TCP 443 para 0.0.0.0/0.

Qual é a causa MAIS provável do problema?

A) Falta ao grupo de segurança uma regra de saída para TCP 443  
B) As instâncias EC2 não têm endereços Elastic IP  
C) Falta ao grupo de segurança uma regra de entrada para portas efémeras  
D) Falta à NACL uma regra de saída a permitir portas efémeras (1024-65535)

**Sugestão 1**: Os grupos de segurança são com estado — permitem automaticamente as respostas. As NACLs são sem estado — não permitem.

**Sugestão 2**: Quando um browser se conecta a um servidor web na porta 443, a resposta do servidor viaja de volta numa porta efémera aleatória (1024-65535), não na porta 443.

**Sugestão 3**: A NACL tem uma regra de saída para 443, mas a resposta não vai para a porta 443.

**Resposta**: D

**Explicação**: A NACL é sem estado. Quando os utilizadores se conectam ao servidor na porta 443, a resposta TCP do servidor viaja de volta numa porta efémera (escolhida aleatoriamente de 1024-65535). A regra de saída da NACL só permite a porta 443, por isso a resposta é bloqueada pela regra de negação padrão. Adicionar uma regra de saída de NACL a permitir TCP 1024-65535 corrigiria isto.

**Por que não A?** Os grupos de segurança são com estado — o tráfego de resposta é automaticamente permitido independentemente das regras de saída. Nenhuma regra de saída de grupo de segurança é necessária.

**Por que não B?** Os Elastic IPs afetam se as instâncias têm IPs públicos, não se as conexões estabelecidas conseguem receber respostas.

**Por que não C?** As portas efémeras são para o tráfego de resposta de saída, não de entrada. A conexão de entrada dos utilizadores chega na porta 443, que já é permitida.

*Domínio SAA-C03: Projetar Arquiteturas Seguras — Tarefa 1.2*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

Depois do ataque do IP romeno, Priya quer implementar dois controlos adicionais:

1. Bloquear o intervalo de IP inteiro 185.0.0.0/8 de alcançar qualquer recurso na subnet pública
2. Garantir que a subnet privada que contém a base de dados nunca possa comunicar com a internet, mesmo que alguém configure incorretamente um grupo de segurança

Que ferramentas usaria para cada requisito, e como as configuraria? Poderia usar grupos de segurança para ambos? Poderia usar NACLs para ambos?

*(Não existe uma resposta única correta. O objetivo é perceber qual ferramenta encaixa em qual problema.)*

## Cena Pós-Créditos

O incidente foi contido. A chave de deploy comprometida foi desativada. O intervalo de IP romeno foi bloqueado na NACL. O script antigo foi removido da instância EC2.

Priya escreveu um relatório de incidente. Partilhou-o com a equipa.

A última linha do relatório: "Causa raiz: uma credencial ativa de um pipeline de deploy desativado nunca foi rodada nem revogada. Recomendação: rotação automatizada de credenciais e auditoria regular de todas as credenciais IAM."

Leo leu-o três vezes.

"Eu devia ter rodado essa chave", disse ele.

"Sim", disse Priya.

"Como é que garantimos que isto não volta a acontecer?"

"Automação", disse ela. "E algo que vigia os vigias."

No próximo capítulo: o cofre onde a Nimbus guarda os seus segredos — e a rotação que torna as chaves roubadas inúteis.
