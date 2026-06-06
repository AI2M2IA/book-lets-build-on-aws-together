# Capítulo 17: Os Vigilantes

O incidente com o IP romeno tinha ficado contido. Os segredos estavam no Secrets Manager. As credenciais tinham sido rodadas. Os controlos de rede tinham sido reforçados.

Mas Priya tinha feito a pergunta que terminou o Capítulo 16: "Se algo invulgar aparecesse no CloudTrail, como é que saberíamos?"

A resposta honesta era: provavelmente não saberiam.

---

*Tudo o que podia ser trancado tinha sido trancado. Os segredos estavam no Secrets Manager. As chaves de encriptação estavam no KMS. O tráfego de rede era controlado por grupos de segurança e NACLs. As defesas de perímetro eram sólidas. Mas as defesas de perímetro assumem que você sabe como é um ataque antes de ele chegar. A pergunta que Priya estava a fazer era diferente: e quanto aos ataques que você não vê chegar?*

---

O CloudTrail regista milhares de eventos por dia. Nenhum humano lê todos eles. Priya verificava manualmente todas as semanas, mas isso significava que algo podia acontecer numa terça-feira e não ser notado até à segunda-feira seguinte.

"Precisamos de algo que vigie os logs por nós", disse ela.

Maya levantou os olhos. "Automaticamente?"

"Automaticamente."

"E se alguém tentar invadir?", continuou Priya. "Não apenas uma credencial comprometida — e se alguém lançar um DDoS? E se começarem a sondar os nossos endpoints de API à procura de vulnerabilidades de injeção? E se já estiverem lá dentro e nós não soubermos?"

"Esses são três problemas diferentes", disse Leo.

"Sim", disse Priya. "E a AWS tem três serviços diferentes para os enfrentar."

**Três Categorias de Ameaça**

As ameaças de segurança contra uma aplicação na nuvem geralmente caem em três categorias:

**Ataques de volume (DDoS)**: Um atacante envia tanto tráfego que a sua aplicação não consegue responder a utilizadores legítimos. O ataque pode ser milhões de pedidos HTTP, ou uma inundação de pacotes TCP SYN concebida para esgotar a tabela de conexões do seu servidor.

**Ataques de aplicação (Exploits)**: Um atacante envia pedidos especificamente elaborados, concebidos para explorar fraquezas na sua aplicação — injeção de SQL, cross-site scripting, input malformado que faz crashar um parser.

**Anomalias comportamentais (Reconhecimento e comprometimento)**: Chamadas de API que não deviam estar a acontecer (alguém a consultar toda a sua base de dados de utilizadores às 3 da manhã), atividade IAM invulgar (credenciais a serem usadas de um novo país), ou tráfego de rede para destinos inesperados.

A AWS tem um serviço dedicado para cada uma:

- **AWS Shield**: Proteção contra DDoS
- **AWS WAF**: Proteção ao nível da aplicação
- **Amazon GuardDuty**: Deteção comportamental de ameaças

**AWS Shield: O Absorvedor de DDoS**

O **AWS Shield Standard** está ativado automaticamente para todos os clientes da AWS sem custo adicional. Protege contra os ataques DDoS mais comuns de camada 3 (rede) e camada 4 (transporte) — SYN floods, UDP floods, ataques de amplificação de DNS.

O CloudFront, o Route 53 e o Elastic Load Balancing ficam na borda da rede da AWS. Quando um ataque DDoS visa a sua aplicação, atinge primeiro estes serviços geridos. A infraestrutura de rede da AWS absorve o ataque antes de ele chegar às suas instâncias EC2.

O **AWS Shield Advanced** é o nível premium ($3.000/mês por organização, com um compromisso de um ano). É uma subscrição separada — *não* está incluído em nenhum plano de Suporte da AWS. Acrescenta:

- Proteção para EC2, ELB, CloudFront, Global Accelerator e Route 53
- Notificações de ataque quase em tempo real
- Acesso à AWS Shield Response Team (SRT) — engenheiros de segurança que o podem ajudar a responder a ataques (envolver a SRT requer adicionalmente um plano de Suporte Business ou Enterprise)
- Proteção de custos: se um ataque causar um pico na sua fatura, a AWS credita os custos do surto
- Deteção e mitigação de DDoS melhoradas na camada 7 (camada de aplicação)

"Quanto é que isso custa por mês?", perguntou Tom.

"Três mil dólares", disse Priya. "Por organização."

Tom ficou em silêncio por um momento.

"Para empresas que lidam com milhões em receita, um DDoS que as deita abaixo durante duas horas custa mais do que três mil dólares", disse Priya.

Tom fez as contas em silêncio.

"Vamos começar com o Standard", disse ele finalmente.

---

**O Incidente de DDoS: Como é o Shield em Ação**

Oito meses depois do lançamento, a Nimbus apanhou o seu primeiro ataque DDoS real.

Começou às 11h43 numa terça-feira. O painel do CloudWatch para o balanceador de carga mostrou pedidos de conexão recebidos a dispararem dos normais 3.000 por minuto para 180.000 por minuto em menos de noventa segundos. Os IPs de origem estavam distribuídos por quarenta países, e o volume de entrada atingiu o pico de cerca de cinquenta gigabits por segundo. O padrão era inconfundível: um botnet a lançar um SYN flood.

Leo viu primeiro as métricas do CloudFront. "A taxa de pedidos subiu sessenta vezes. O tempo de resposta está a disparar."

Priya abriu as métricas do CloudWatch lado a lado: tentativas de conexão na borda a subir verticalmente, pedidos a chegar de facto à origem — planos. "O Shield Standard está a comê-lo", disse ela. Não houve alerta, nenhum evento de painel, nenhuma notificação. O Shield Standard funciona silenciosamente: está sempre ativo, é gratuito, e dá-lhe **nenhuma visibilidade do ataque** — sem consola de eventos, sem notificações, sem equipa de resposta a DDoS. (Essa visibilidade — painéis de ataque e alertas quase em tempo real — é precisamente o que o Shield *Advanced* vende.) A única forma de Priya conseguir ver o ataque de todo era através das suas próprias métricas do CloudWatch.

O Shield Standard tinha detetado automaticamente o SYN flood e iniciado a mitigação nos primeiros dois minutos. O tráfego de ataque estava a ser absorvido nos nós de borda do CloudFront globalmente — os mesmos mais de 750 pontos de presença que serviam conteúdo legítimo também absorviam o volume do ataque.

Pelas 11h52 — nove minutos depois de o ataque começar — a mitigação do Shield tinha trazido a taxa de pedidos na origem de volta ao normal. O ataque ainda estava a correr ao nível da rede, mas a mitigação estava a tratar dele. A aplicação Nimbus continuou a servir utilizadores durante todo o tempo.

"Os utilizadores não notaram?", perguntou Leo, olhando para a métrica de taxa de erros.

"A taxa de erros subiu cerca de dois por cento durante cerca de quatro minutos", disse Priya. "Alguns utilizadores tiveram uma resposta ligeiramente mais lenta. Sem interrupções. A aplicação manteve-se de pé."

"Porque o Shield absorveu a inundação na borda."

"Antes de ela chegar ao nosso balanceador de carga. O SYN flood de cinquenta gigabits atingiu o CloudFront. Quando o padrão de tráfego foi reconhecido e mitigado, a nossa origem só tinha visto o volume normal de pedidos."

O ataque durou quarenta e sete minutos. Pelas 12h30 as métricas de borda tinham voltado à linha de base — o único sinal de "resolvido" que o Shield Standard lhe dá.

"E isto é o Shield Standard", disse Tom. "A versão gratuita."

"Ataques de camada 3 e 4. O Standard protege contra esses automaticamente. Se o ataque tivesse sido mais sofisticado — um HTTP flood de camada 7, por exemplo, onde cada pedido parecia legítimo — o Standard não teria sido suficiente. Isso requer o Shield Advanced mais o WAF."

Tom escreveu "Monitorizar padrões de DDoS de camada 7" no seu roadmap de segurança.

---

**AWS WAF: O Filtro de Aplicação**

O **AWS WAF (Web Application Firewall)** opera ao nível HTTP — inspeciona o conteúdo dos pedidos web antes de eles chegarem à sua aplicação.

O WAF é configurado com **Web ACLs (Access Control Lists)** — conjuntos de regras que definem o que permitir, bloquear ou contar.

O WAF pode ser anexado a:

- Distribuições CloudFront (inspecionar pedidos na borda, globalmente)
- Application Load Balancers (inspecionar pedidos ao nível regional)
- API Gateway
- AWS AppSync

**Regras Geridas do WAF**: A AWS e fornecedores de terceiros publicam conjuntos de regras pré-construídos:

- **AWS Managed Rules - Core Rule Set**: Juntamente com grupos de regras complementares (base de dados SQL, Known Bad Inputs), cobre as vulnerabilidades do OWASP Top 10 (injeção de SQL, XSS, injeção de comandos, path traversal, etc.)
- **AWS Managed Rules - Known Bad Inputs**: Bloqueia pedidos que correspondem a padrões de ataque conhecidos
- **AWS Managed Rules - Amazon IP Reputation List**: Bloqueia IPs conhecidos por estarem associados a botnets e scanners
- **AWS Managed Rules - Bot Control**: Identifica e gere o tráfego de bots

Você também pode criar regras personalizadas:

- "Bloquear qualquer pedido com um cabeçalho User-Agent que contenha 'sqlmap'" (um scanner comum de injeção de SQL)
- "Limite de taxa: permitir no máximo 1000 pedidos por IP por 5 minutos"
- "Bloquear pedidos que contenham `<script>` em qualquer valor de parâmetro"

Para a Nimbus, a configuração prática: WAF na distribuição CloudFront com o Core Rule Set ativado. Isto bloqueia os padrões de ataque mais comuns antes de os pedidos alguma vez chegarem às instâncias EC2.

Você pode estar a perguntar-se: se o WAF bloqueia padrões de ataque conhecidos, o que acontece quando um novo padrão de ataque aparece que o WAF não conhece? Os conjuntos de regras geridos do WAF são atualizados pela AWS e por fornecedores de terceiros à medida que novas ameaças surgem — você não tem de atualizar as regras manualmente. Mas você tem razão: o WAF é fundamentalmente reativo a padrões conhecidos. Técnicas de ataque novas e inéditas não serão bloqueadas por uma regra que ainda não existe. É por isto que o GuardDuty existe ao lado do WAF: o WAF filtra a porta da frente, o GuardDuty vigia comportamentos invulgares dentro de casa. Um novo tipo de ataque pode passar pelo WAF, mas o GuardDuty ainda pode sinalizar a atividade anómala que ele causa — chamadas de API invulgares, destinos de rede inesperados, padrões de acesso que não correspondem à linha de base.

**Já pensámos no que acontece se o WAF causar falsos positivos?**, perguntou Priya. "O pedido de um utilizador legítimo que é bloqueado pelo Core Rule Set?"

"O WAF tem um modo 'Count'", disse Leo. "Em vez de bloquear, apenas conta os pedidos correspondentes. Você corre-o primeiro em modo Count, revê o que teria bloqueado, verifica que não há falsos positivos, depois muda para Block."

"Bom", disse Priya. "Começamos em modo Count."

---

**Criar uma Regra de WAF: A História do Limite de Taxa**

Duas semanas depois de ativar o WAF em modo Count, Priya reviu os logs. As descobertas do Core Rule Set estavam limpas — nenhum falso positivo no tráfego legítimo, um punhado de tentativas de injeção de SQL bloqueadas de scanners automatizados.

Mas ela notou um padrão que o Core Rule Set não estava a sinalizar: um endereço IP tinha feito 847 pedidos a `/api/search` em cinco minutos. Cada pedido era estruturalmente válido. Mas 847 pesquisas em cinco minutos não era um humano.

"Scraper de preços", disse ela. "Alguém está a consultar automaticamente a nossa pesquisa de restaurantes para construir uma base de dados competitiva de preços."

"Importa-nos?", perguntou Leo.

"Usa os nossos recursos de computação e é contra os nossos termos de serviço", disse Tom.

"Importa-nos", confirmou Priya.

Ela criou uma regra de WAF personalizada baseada em taxa:

```
Nome da regra: RateLimitSearchAPI
Tipo de regra: Regra baseada em taxa
Limite de taxa: 100 pedidos por endereço IP
Janela de avaliação: 5 minutos (configurável: 1, 2, 5 ou 10 minutos)
Declaração scope-down: O caminho do URI começa com /api/search
Ação: Block
```

A declaração scope-down é importante — o limite de taxa aplica-se apenas a `/api/search`. O tráfego de API legítimo para outros endpoints não é afetado. E repare como o bloqueio funciona: não há um período de "castigo" fixo — o WAF reavalia a taxa de pedidos de cada IP continuamente, bloqueia-o enquanto a taxa se mantém acima do limite, e desbloqueia-o (tipicamente dentro de segundos) assim que a taxa volta a descer abaixo dele.

Ela definiu-a primeiro em modo Count. Correu-a durante 24 horas. O único IP que disparou a regra foi o scraper. Nenhum utilizador legítimo tinha alguma vez enviado mais de 12 pedidos ao endpoint de pesquisa em cinco minutos.

Ela mudou para modo Block. O próximo pedido do scraper recebeu um 403. Ele mudou para um IP diferente. O limite de taxa apanhou esse também.

"Eles vão contorná-lo eventualmente", disse Leo. "Distribuir por mais IPs."

"Altura em que estão a usar mais infraestrutura, a pagar mais, e a obter menos dados", disse Priya. "Não precisamos de os parar completamente. Precisamos de tornar suficientemente caro para não valer a pena."

"Quanto é que isso custa por mês?", perguntou Tom.

O preço do WAF é por Web ACL por mês, por regra por mês, e por milhão de pedidos. Para a configuração da Nimbus — um Web ACL, cinco regras no CloudFront — aproximadamente $15 por mês mais as cobranças de pedidos.

Tom aprovou-o imediatamente.

---

**Amazon GuardDuty: O Analista Comportamental**

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Se o WAF está a bloquear ataques e o Shield está a absorver inundações, por que precisamos de um terceiro serviço? O que é que o GuardDuty está de facto a vigiar?"

O WAF e o Shield são filtros — intercetam tráfego mau antes de ele chegar à sua aplicação. O GuardDuty vigia o que acontece depois de o tráfego chegar. Olha para o que a sua infraestrutura está a fazer: quais credenciais IAM estão a ser usadas, quais domínios as suas instâncias estão a contactar, quais chamadas de API estão a acontecer às 3 da manhã. Um atacante que passa pela porta da frente através de um pedido de aparência legítima não será parado pelo WAF — mas o GuardDuty vai notar que a mesma credencial está de repente a fazer chamadas de API da Roménia.

O GuardDuty é fundamentalmente diferente do Shield e do WAF. Não bloqueia ataques — **deteta comportamentos invulgares**.

O GuardDuty analisa continuamente vários fluxos de atividade para detetar ameaças: **eventos de gestão e de dados do CloudTrail** (chamadas de API e ações), **VPC Flow Logs** (padrões de tráfego de rede) e **logs de consultas de DNS** (pesquisas de domínio). Estas são as três fontes fundacionais nas quais o GuardDuty sempre se baseou:

- **Logs do AWS CloudTrail**: mudanças de IAM, chamadas de API, logins na consola
- **VPC Flow Logs**: padrões de tráfego de rede dentro do seu VPC
- **Logs de consultas de DNS**: o que as suas instâncias estão a resolver (malware conhecido frequentemente resolve domínios C2 específicos)

Mas o GuardDuty expandiu-se significativamente para além destas três. A AWS chama aos add-ons opcionais **planos de proteção** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring e Malware Protection — cada um ativado individualmente. Dependendo dos que você ativa, o GuardDuty também pode analisar **eventos de dados do S3** (padrões de acesso invulgares aos seus buckets), **logs de auditoria e atividade de runtime do EKS** (comportamento malicioso dentro de contentores em execução), **eventos de login do RDS** (tentativas de login anómalas na base de dados), **tráfego de rede do Lambda** (funções a chamar destinos externos inesperados), **comportamento de runtime do ECS/EC2**, e **volumes EBS analisados para malware**. Para o exame, conheça as três fontes principais de cor; os planos de proteção aparecem em cenários sobre contextos específicos de deteção de ameaças — "detetar tentativas de login anómalas no RDS" ou "identificar comportamento malicioso dentro de um contentor em execução" são sinais para pensar nos planos de proteção opcionais do GuardDuty.

Modelos de machine learning identificam padrões que se desviam da sua linha de base. O GuardDuty gera **findings** — alertas categorizados — quando deteta anomalias.

Exemplos do que o GuardDuty pode detetar:

- Um utilizador IAM a fazer login de um endereço IP não reconhecido (num país que nunca usou antes)
- Chamadas de API a serem feitas de um nó de saída Tor
- Uma instância EC2 a comunicar com um pool de mineração de criptomoedas conhecido
- Volume de chamadas de API invulgarmente alto (abuso de credenciais ou scanning)
- Um bucket S3 a ser acedido por um endereço IP que foi sinalizado por atividade maliciosa
- Tráfego de saída para um domínio conhecido por estar associado a comando-e-controlo de malware

"Isto é o que teria apanhado o IP romeno", disse Leo em voz baixa.

"Se tivéssemos tido o GuardDuty ativado, ele teria sinalizado a instância EC2 a fazer conexões de saída para um IP externo não reconhecido às 2 da manhã", confirmou Priya.

---

**Cinco Tipos de Finding do GuardDuty e O Que Fazer**

Priya criou um runbook para os cinco findings mais comuns do GuardDuty. Quando um finding dispara, a equipa sabe imediatamente o que significa e o que fazer.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Um utilizador IAM fez login com sucesso na Consola da AWS de um endereço IP que não foi visto antes para esta conta, ou de uma localização geográfica inconsistente com logins anteriores.

Resposta: Verifique com o utilizador que ele iniciou o login. Se não foi — ou não puder ser contactado — imediatamente: desative a chave de acesso e a palavra-passe da consola do utilizador, revogue as sessões ativas, e inicie uma auditoria do CloudTrail de tudo o que esse utilizador fez nas últimas 24 horas. Este finding precede frequentemente o abuso de credenciais.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Uma instância EC2 está a consultar endereços IP ou nomes de domínio associados a pools de mineração de criptomoedas. Isto é quase sempre o resultado de uma instância EC2 comprometida e usada como bot de mineração.

Resposta: Isole a instância imediatamente — modifique o seu grupo de segurança para bloquear todo o tráfego de entrada e de saída exceto para o seu host bastião. Tire um snapshot forense do volume EBS. Depois termine a instância e lance uma substituta a partir de uma AMI limpa.

**3. Recon:EC2/PortProbeUnprotectedPort**

Uma instância EC2 tem uma porta aberta à internet que está a ser sondada por scanners conhecidos ou de um nó de saída Tor. O GuardDuty sinaliza portas que aparecem nos flow logs como acessíveis de fontes externas.

Resposta: Reveja as regras do grupo de segurança. Se a porta está intencionalmente aberta, marque o finding como resolvido com uma nota. Se não é intencional, feche a porta imediatamente. Verifique o CloudTrail por qualquer acesso que possa ter ocorrido através dessa porta.

**4. Trojan:EC2/BlackholeTraffic**

Uma instância EC2 está a tentar comunicar com um endereço IP que foi identificado como um "buraco negro" — um destino associado a infraestrutura de comando-e-controlo de malware. O tráfego para estes IPs sugere que a instância foi infetada e está a tentar ligar para casa.

Resposta: Igual aos findings de CryptoCurrency — isolar, snapshot, substituir. Este finding indica malware ativo na instância. Não tente limpar a instância no lugar; construa uma nova a partir de uma AMI limpa.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Alguém desativou a definição Block Public Access num bucket S3. Isto não significa que o bucket é público — significa que o mecanismo de segurança que previne a exposição pública acidental foi desligado para esse bucket. Isto é feito frequentemente por acidente ou como parte de um deploy mal configurado.

Resposta: Investigue quem fez a mudança (o CloudTrail terá a chamada de API). Reative o Block Public Access a não ser que haja uma razão documentada para ele estar desativado. Considere ativar a definição Block Public Access ao nível da conta para prevenir que este finding ocorra no futuro.

"A coisa mais importante sobre os findings do GuardDuty", disse Priya, "é que não são alertas — são hipóteses. Cada finding diz 'este padrão parece anómalo'. Você verifica, investiga, responde. Alguns serão falsos positivos. A maioria não será."

"Como é que priorizamos?", perguntou Rafael.

"O GuardDuty atribui níveis de severidade: Baixa, Média, Alta. Os findings de severidade Alta requerem resposta no mesmo dia. Os findings de Trojan e de comprometimento de credenciais são sempre Altos. Os findings de sondagem de portas podem ser Médios ou Baixos. Comece pelos Altos, vá descendo."

---

"Quanto é que custa?", perguntou Tom.

O preço do GuardDuty é baseado no volume de logs analisados — eventos do CloudTrail, dados de flow do VPC, consultas de DNS. Para uma aplicação pequena a média, tipicamente $50-150/mês. Em escala, ainda é uma pequena fração dos custos de infraestrutura.

Tom abriu a consola e ativou-o.

"Vai ficar tudo bem", disse Leo. "É só monitorização. Não é como se fosse partir alguma coisa."

"Eu já fiz o deploy", acrescentou Leo — e depois verificou o painel do GuardDuty. "Oh. Apenas findings de amostra. Os reais demoram um bocado."

"O GuardDuty precisa de tempo para construir uma linha de base do que é normal", disse Priya. "Dá-lhe um par de dias. O primeiro finding real chegará — eles sempre chegam."

Ela viria a ter razão sobre isso. Mas o primeiro finding é uma história para o final deste capítulo.

**Conectar os Três Serviços**

O Shield, o WAF e o GuardDuty trabalham em camadas diferentes e complementam-se:

| Serviço    | Camada                    | Protege Contra                              | Ação                               |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Rede/Transporte (L3/L4)   | Inundações de DDoS                          | Absorve/mitiga ataques             |
| AWS WAF    | Aplicação (L7)            | OWASP Top 10, bots, scrapers                | Permite, bloqueia ou conta pedidos |
| GuardDuty  | Comportamental (todos os logs) | Anomalias, credenciais comprometidas, malware | Deteta e alerta                |

O Shield para a inundação. O WAF filtra a água. O GuardDuty vigia a canalização por padrões de fluxo invulgares. O Macie audita o que está armazenado nos reservatórios. O Security Hub é a sala de controlo onde todos os painéis são visíveis de uma vez.

O modo de falha de cada um explica por que você precisa de todos eles:

- Um SYN flood de 50 Gbps não é um pedido web. O WAF não o consegue inspecionar. O GuardDuty pode notar os eventos do CloudTrail associados. O Shield para-o.
- Um único pedido de injeção de SQL não é uma inundação. O Shield ignora-o. O GuardDuty não conhece o conteúdo dos pedidos HTTP. O WAF apanha-o.
- Um utilizador AWS legítimo a usar as suas próprias credenciais para exfiltrar dados lentamente — sem DDoS, sem injeção, HTTP válido — o Shield e o WAF não veem nada de invulgar. O GuardDuty nota que as credenciais estão a ser usadas de um novo país às 3 da manhã.
- Um programador que carrega acidentalmente dados de clientes para um bucket de acesso público não gera comportamento anómalo nenhum. O GuardDuty não tem nada para sinalizar. O Macie analisa o bucket e encontra a PII.

Cada serviço tem um ponto cego. A combinação cobre esses pontos cegos.

**CloudTrail: A Fundação**

Todos os três serviços dependem de logs. O **AWS CloudTrail** é o serviço de logging que captura cada chamada de API na sua conta AWS — quem chamou o quê, quando, de onde, com que resultado.

O CloudTrail está ativado por padrão para um histórico de 90 dias na consola. Para reter logs a longo prazo:

1. Crie um trail que escreve num bucket S3
2. Opcionalmente, envie para o CloudWatch Logs para alertas em tempo real
3. Ative a validação de ficheiros de log (para detetar se os logs foram adulterados)

O GuardDuty, o AWS Config, o Security Hub e o IAM Access Analyzer leem todos do CloudTrail. Sem os logs do CloudTrail, estes serviços não têm nada para analisar.

"E se alguém tentar desativar o CloudTrail?", perguntou Priya. "Se um atacante ganhar acesso de administrador, a sua primeira ação pode ser desativar o logging — apagar os seus rastos."

"É isso que a SCP do Capítulo 14 previne", disse Leo. "Ninguém nesta conta pode desativar o CloudTrail, nem mesmo os administradores."

"E se de alguma forma conseguissem?"

"O Security Hub geraria um finding. O CloudTrail envia uma notificação para o SNS em mudanças de configuração. Recebemos um alerta dentro de dois minutos de qualquer modificação do CloudTrail."

"E o GuardDuty sinalizaria a chamada de API", acrescentou Rafael, "como uma ação IAM invulgar — desativar o logging não é uma atividade operacional normal."

Múltiplas camadas de deteção para uma das ações de segurança mais críticas: adulterar logs. Isto não foi um acidente. Priya tinha-o concebido deliberadamente.

"A defesa em profundidade aplica-se também à camada de monitorização", disse ela. "Não apenas à camada de aplicação."

**Amazon Macie: Dados Sensíveis no S3**

"Já pensámos no que acontece se alguém carregar acidentalmente um ficheiro com números de cartão de crédito de clientes para o S3?", perguntou Priya. "Não maliciosamente — apenas um programador a exportar dados para debugging e a carregar o ficheiro errado?"

"Nunca saberíamos", disse Leo.

"Exatamente. A não ser que tenhamos o Macie."

O **Amazon Macie** é um serviço de segurança de dados que usa machine learning para descobrir e proteger automaticamente dados sensíveis no S3. Analisa continuamente os buckets S3 e identifica:

- PII (Informação de Identificação Pessoal): nomes, endereços de e-mail, números de telefone, datas de nascimento
- Dados financeiros: números de cartão de crédito, números de conta bancária
- Credenciais: palavras-passe, chaves de acesso, chaves privadas incorporadas em ficheiros
- Informação de saúde: registos de pacientes, diagnósticos

O Macie gera findings quando deteta dados sensíveis em lugares onde não deviam estar — ou quando os buckets S3 têm configurações de acesso demasiado permissivas.

"Isto é o mesmo que o GuardDuty?", perguntou Maya.

"Propósito diferente", disse Priya. "O GuardDuty vigia o comportamento — quais ações estão a ser tomadas, se essas ações parecem anómalas. O Macie vigia os dados — qual o conteúdo armazenado, se esse conteúdo é sensível. O GuardDuty sinalizaria uma instância EC2 a fazer chamadas de API invulgares. O Macie sinalizaria um bucket S3 que contém números de cartão de crédito."

"Então o GuardDuty é o analista comportamental", disse Leo, "e o Macie é o auditor de dados."

"Exatamente. Você precisa de ambos. Um atacante que exfiltra dados através de uma chamada de API de aparência legítima pode ser sinalizado pelo GuardDuty pelo padrão de API invulgar. Mas se um funcionário carregar um ficheiro com 10.000 registos de clientes para um bucket de desenvolvimento, não há comportamento anómalo para detetar — apenas dados sensíveis no lugar errado. O Macie apanha isso."

Para a Nimbus, o valor mais imediato do Macie foi no bucket `nimbus-debug-exports` — um bucket que os programadores usavam para despejar dados para debugging. O Macie encontrou três ficheiros que continham históricos de pedidos com nomes de clientes e endereços de entrega. Não dados de pagamento, mas dados pessoais que não deviam estar num bucket de desenvolvimento não encriptado.

Os ficheiros foram removidos. Uma política foi adicionada: o bucket de debug foi restrito apenas a dados de teste sintéticos. Dados reais de clientes requeriam a aprovação de Priya para serem exportados para qualquer ambiente fora de produção.

"Quanto é que isso custa por mês?", perguntou Tom.

O Macie cobra com base no número de buckets S3 avaliados por mês e no volume de dados analisados. Para uma startup com um número moderado de buckets, aproximadamente $10-50 por mês. Gratuito nos primeiros 30 dias.

Tom ativou-o antes do almoço.

---

**AWS Security Hub: O Painel**

Se você está a correr múltiplas contas AWS ou precisa de uma vista consolidada de findings de segurança, o **AWS Security Hub** agrega findings do GuardDuty, Inspector (avaliação de vulnerabilidades), Macie (privacidade de dados), Config e Firewall Manager num único painel.

Também verifica a sua configuração contra as melhores práticas de segurança (o padrão AWS Foundational Security Best Practices) e o CIS AWS Foundations Benchmark.

O Security Hub é a resposta a "como é que vejo todos os meus findings de segurança num só lugar sem alternar entre cinco consolas diferentes?". Quando o GuardDuty gera um finding, ele aparece no GuardDuty e no Security Hub. Quando o Macie encontra dados sensíveis num bucket S3, ele aparece no Macie e no Security Hub. Quando uma regra do Config deteta uma configuração incorreta, ela aparece no Config e no Security Hub.

Para uma equipa de conta única, o Security Hub acrescenta valor marginal — é mais uma consola para verificar. O seu poder emerge em escala: três contas, dez contas, cinquenta contas. Todos os findings de todas as contas agregam-se no Security Hub de uma conta de gestão. Uma equipa monitoriza um painel. Um conjunto de alertas. Sem verificação de logs conta a conta.

Para a Nimbus: o Security Hub ainda não era necessário. Quando crescessem para três contas (dev, staging, produção), tornar-se-ia essencial.

"Configura-o agora", disse Soo-Jin, na sua terceira semana. "Demora quinze minutos a ativar. Demora três meses a desejar que o tivesses feito mais cedo."

Eles ativaram-no.

**Amazon Inspector: Avaliação de Vulnerabilidades**

Uma semana depois de ativar o Macie, foi publicado um CVE para a versão do OpenSSL a correr em toda a frota de produção da Nimbus. Priya leu o aviso ao café.

"Precisamos de saber quais das nossas instâncias são afetadas", disse ela.

"Posso correr um scan manual", disse Leo.

"Para nove instâncias, claro. Para noventa? Para contentores?" Priya abriu a consola do Inspector. "É para isto que serve o Inspector."

O **Amazon Inspector** é um serviço automatizado de avaliação de vulnerabilidades. Onde o GuardDuty vigia o comportamento — o que a sua infraestrutura está a fazer agora — o Inspector olha para o que está presente que poderia ser explorado.

- **Instâncias EC2:** O Inspector analisa o sistema operativo e os pacotes instalados contra a NVD (National Vulnerability Database) — o catálogo autoritativo de CVEs conhecidos. Se você está a correr o OpenSSL 1.1.1 e um CVE visa essa versão, o Inspector sinaliza-o.
- **Imagens de contentores ECR:** O Inspector analisa imagens de contentores no Elastic Container Registry antes de serem implantadas. Um pacote vulnerável numa imagem base aparece como um finding antes de o contentor alguma vez correr em produção.
- **Pacotes de funções Lambda:** O Inspector analisa as dependências agrupadas nas suas funções Lambda — pacotes Python, módulos Node, dependências Java — para vulnerabilidades conhecidas.

A diferença crítica de um scan único: o Inspector corre **continuamente**. Não se limita a verificar as suas instâncias uma vez quando você o ativa e a declará-las limpas. Quando um novo CVE é publicado, o Inspector reavalia automaticamente os seus recursos existentes contra a nova vulnerabilidade. Quando uma instância EC2 muda — novo pacote instalado, AMI atualizada — o Inspector reanalisa-a. A frota EC2 de Priya foi sinalizada para o CVE do OpenSSL dentro de minutos após a ativação do Inspector, não porque ela tivesse pedido para o analisar, mas porque é isso que ele faz.

Os findings têm classificação de severidade: Crítica, Alta, Média, Baixa, Informativa. Fluem para o Security Hub ao lado dos findings do GuardDuty e do Macie. Um painel. Todas as três lentes.

"Três instâncias afetadas", disse Leo, lendo os findings do Inspector. "As outras seis estão numa versão corrigida."

"Corrige essas três esta semana", disse Priya.

"E quanto às imagens de contentores?"

Priya olhou para os findings de ECR do Inspector. Duas imagens base no seu registo de contentores tinham vulnerabilidades conhecidas — versões mais antigas de pacotes que entretanto tinham sido corrigidos. Ela marcou-as para reconstrução.

"O importante", disse Priya, "é que encontrámos isto antes de ser explorado. Não depois."

**O Modelo das Três Lentes**

O GuardDuty, o Inspector e o Macie vigiam cada um uma coisa diferente:

- O **GuardDuty** é comportamental. Pergunta: *o que está a acontecer agora que parece errado?* Chamadas de API de localizações inesperadas, instâncias EC2 a contactar servidores de comando-e-controlo, credenciais a serem usadas a horas invulgares. Apanha ameaças ativas e anomalias.
- O **Inspector** é estrutural. Pergunta: *o que está presente no nosso ambiente que poderia ser explorado?* Pacotes não corrigidos, dependências vulneráveis, runtimes desatualizados. Apanha as condições que tornam os ataques possíveis.
- O **Macie** é sobre dados. Pergunta: *que informação sensível está nos nossos buckets S3 que não devia lá estar?* PII, registos financeiros, credenciais deixadas em ficheiros. Apanha a exposição que não gera comportamento anómalo nenhum — apenas dados no lugar errado.

Um comprometimento envolvendo um CVE conhecido pode aparecer nos três: o Inspector teria sinalizado a vulnerabilidade antes do ataque. O GuardDuty sinalizaria o comportamento anómalo durante o ataque. O Macie sinalizaria os dados exfiltrados depois de aterrarem no S3.

Três lentes diferentes, três horizontes temporais diferentes, nenhuma delas substituta das outras.

**AWS Network Firewall: O Inspetor de Tráfego**

Mais um especialista merece uma menção antes de a caixa de ferramentas fechar. Os grupos de segurança e as NACLs (Capítulo 15) filtram o tráfego por IP, porta e protocolo — podem dizer *quem* pode falar com *o quê*, mas não conseguem olhar para dentro da conversa. O **AWS Network Firewall** é um firewall gerido e com estado que você implanta ao nível do VPC. Realiza inspeção profunda de pacotes: filtrar por nome de domínio (permitir saída apenas para `*.eatnimbus.com` e os seus repositórios de pacotes), bloquear tráfego que corresponde a assinaturas de intrusão (IDS/IPS, compatível com regras Suricata), e inspecionar fluxos que os grupos de segurança simplesmente deixariam passar porque o número da porta parecia bem.

"Então é um grupo de segurança com cérebro", disse Leo.

"É o appliance que você compraria de um fornecedor de firewalls", disse Priya, "exceto gerido, com auto-escalonamento, e implantado na sua própria subnet para que todo o tráfego que entra e sai do VPC seja encaminhado através dele."

Sinais de exame: "inspecionar ou filtrar tráfego por nome de domínio ou payload", "deteção/prevenção de intrusões (IDS/IPS) para um VPC", ou "filtragem de egresso centralizada para tráfego de saída" → Network Firewall. Os grupos de segurança e as NACLs são a resposta para permitir/negar ao nível da instância e da subnet por porta e IP; o Network Firewall é a resposta quando a pergunta exige inspeção *dentro* do tráfego. E quando a pergunta pergunta como gerir regras de WAF, Shield Advanced, grupos de segurança *e* políticas de Network Firewall de forma consistente por muitas contas — isso é o **AWS Firewall Manager**, a camada de administração de políticas por cima.

## Pontos Fortes e Limitações

**AWS Shield**:

- Standard: gratuito e automático — não há razão para não o usar
- Advanced: excelente para alvos de alto perfil; caro para equipas pequenas
- O Standard absorve ataques de camada 3/4 (SYN floods, UDP floods, amplificação de DNS) automaticamente
- O Advanced acrescenta proteção de camada 7, notificações em tempo real, e a Shield Response Team

**AWS WAF**:

- Os grupos de regras geridos simplificam significativamente a configuração — proteção contra o OWASP Top 10 com alguns cliques
- As regras personalizadas requerem perceção de padrões de ataque HTTP
- A limitação de taxa é uma funcionalidade poderosa muitas vezes negligenciada — eficaz contra scrapers e força bruta
- O WAF não é um substituto para código de aplicação seguro — é uma camada de defesa em profundidade
- Comece em modo Count, valide, depois mude para Block

**GuardDuty**:

- Extremamente baixo esforço para ativar (alguns cliques, teste gratuito de 30 dias)
- Os findings requerem revisão e resposta humana — o GuardDuty deteta, não corrige
- Ocorrem falsos positivos — alguma atividade legítima parece anómala aos modelos de ML
- Os níveis de severidade (Baixa/Média/Alta) ajudam a priorizar a resposta
- Integra-se com o Security Hub, EventBridge e Lambda para fluxos de resposta automatizada

**Amazon Inspector**:

- Análise de vulnerabilidades contínua e automatizada — não uma verificação única
- Reanalisa automaticamente quando novos CVEs são publicados ou quando os recursos mudam
- Cobre instâncias EC2 (pacotes de SO e de aplicação), imagens de contentores ECR, e pacotes de funções Lambda
- Os findings fluem para o Security Hub; as classificações de severidade ajudam a priorizar a correção
- Não bloqueia ataques — traz à superfície as condições que tornam os ataques possíveis

**Amazon Macie**:

- Descobre automaticamente dados sensíveis (PII, credenciais, dados financeiros) no S3
- Apanha exposição de dados que não tem padrão de comportamento anómalo — o GuardDuty falharia
- Teste gratuito de 30 dias; paga por bucket por mês depois disso
- Mais valioso para equipas com muitos buckets S3 e níveis de sensibilidade variáveis

**AWS Security Hub**:

- Agrega findings do GuardDuty, Macie, Inspector, Config e Firewall Manager
- Verifica a configuração contra benchmarks de segurança (CIS, NIST, PCI-DSS)
- Mais valioso em escala multi-conta
- Ative cedo, mesmo que só tenha uma conta — o histórico de findings é cumulativo

## Resumo

Cinco serviços, cinco camadas. Cada um aborda um tipo diferente de ameaça — e nenhum deles substitui os outros. Um ataque DDoS contorna o WAF e o GuardDuty. Uma tentativa de injeção de SQL contorna o Shield. Uma credencial comprometida usada lenta e cuidadosamente pode contornar o Shield e o WAF por completo — mas o GuardDuty verá a anomalia. Um programador a carregar acidentalmente PII de clientes para um bucket S3 de debug contorna os três — mas o Macie apanha-o.

- **AWS Shield Standard**: Proteção DDoS gratuita e automática na camada 3/4. Sempre ativo. Absorveu o SYN flood de 50 Gbps antes de ele chegar ao balanceador de carga da Nimbus.
- **AWS Shield Advanced**: Proteção DDoS premium com acesso à SRT e proteção de custos. Caso de uso empresarial.
- **AWS WAF**: Firewall ao nível da aplicação. Inspeciona e filtra pedidos HTTP. Anexe ao CloudFront, ALB ou API Gateway. Use os Grupos de Regras Geridos para proteção contra o OWASP Top 10. Regras baseadas em taxa para defesa contra scrapers.
- **Amazon GuardDuty**: Deteção comportamental de ameaças. Fontes de dados principais: eventos do CloudTrail, VPC Flow Logs e logs de DNS. As proteções estendidas opcionais acrescentam eventos do S3, monitorização de runtime do EKS/ECS, eventos de login do RDS, e atividade de rede do Lambda. Gera findings categorizados para atividade anómala. Cinco tipos de finding principais: UnauthorizedAccess (login na consola), CryptoCurrency (mineração), Recon (sondagem de portas), Trojan (tráfego C2), Policy (configuração incorreta do S3).
- **Amazon Inspector**: Avaliação automatizada de vulnerabilidades. Analisa instâncias EC2, imagens de contentores ECR, e pacotes de funções Lambda para CVEs conhecidos. Corre continuamente e reavalia quando novas vulnerabilidades são publicadas. Os findings fluem para o Security Hub.
- **Amazon Macie**: Descoberta de dados sensíveis no S3. Deteta PII, credenciais e dados financeiros. Apanha exposição que não tem padrão de comportamento anómalo.
- **AWS Security Hub**: Agrega findings de todos os serviços de segurança num só painel. Permite monitorização centralizada por múltiplas contas.
- **CloudTrail**: A fundação de todo o logging de segurança da AWS. Ative um trail que escreve no S3 para retenção a longo prazo. Cada serviço de segurança lê dele.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Seguras (Domínio 1, Tarefa 1.2)*

- **Shield Standard vs Advanced**: O Standard é gratuito e automático. O Advanced custa dinheiro e acrescenta a SRT, proteção de custos, e melhor deteção. Sinais de exame para o Advanced: "DDoS em larga escala", "garantia de SLA durante ataques", "proteção financeira contra picos de custo relacionados com DDoS".
- **Sinais de caso de uso de WAF**: "bloquear injeção de SQL", "bloquear cross-site scripting", "limitar a taxa de chamadas de API", "bloquear user-agents específicos", "proteção contra o OWASP Top 10" → WAF.
- **Sinais de GuardDuty**: "detetar atividade de API invulgar", "identificar credenciais comprometidas", "sinalizar conexões de rede EC2 anómalas", "threat intelligence" → GuardDuty.
- **Anexação de WAF**: Pode anexar ao CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Fontes de dados do GuardDuty**: Três fontes principais — eventos do CloudTrail, VPC Flow Logs, logs de DNS. As fontes opcionais estendidas incluem eventos de dados do S3, logs de auditoria do EKS, eventos de login do RDS, atividade de rede do Lambda, e runtime do ECS. O exame pode perguntar qual fonte de dados é relevante para um cenário específico de deteção: "logins anómalos no RDS" → GuardDuty RDS Protection; "ameaças de runtime de contentores" → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty**: Este é um distrator comum de exame. O **Macie** usa ML para detetar dados sensíveis no S3 (PII, credenciais, dados financeiros). O **GuardDuty** deteta ameaças e anomalias no comportamento. O Macie é sobre conteúdo. O GuardDuty é sobre comportamento.
- **Inspector vs. GuardDuty vs. Macie:** Três lentes diferentes, nenhuma substituta das outras. O **Inspector** = análise de vulnerabilidades — CVEs em instâncias EC2, imagens de contentores no ECR, e pacotes de funções Lambda. Corre continuamente e reanalisa quando novos CVEs são publicados. O **GuardDuty** = deteção comportamental de ameaças — o que está a acontecer agora que parece anómalo. O **Macie** = descoberta de dados sensíveis no S3 — PII, credenciais, e dados financeiros que não deviam lá estar. Gatilho de exame: "identificar vulnerabilidades não corrigidas em EC2" ou "analisar imagens de contentores para CVEs" → Inspector. "Detetar chamadas de API invulgares ou credenciais comprometidas" → GuardDuty. "Encontrar PII ou dados sensíveis no S3" → Macie.
- **Security Hub**: Agrega findings de segurança de múltiplos serviços e contas. Cenário de exame: "a empresa tem múltiplas contas AWS e quer uma vista única de todos os findings de segurança" → Security Hub.
- **Regras baseadas em taxa no WAF**: Usadas para limitar pedidos por IP dentro de uma janela de tempo. Diferente do Core Rule Set (que corresponde a padrões de ataque). O exame usa regras baseadas em taxa para "prevenir tentativas de login por força bruta" ou "mitigar scraping".
- **CloudTrail + GuardDuty + Security Hub**: Estes três juntos formam o núcleo da observabilidade de segurança da AWS. Ative o CloudTrail primeiro (o GuardDuty e o Security Hub dependem dele), depois o GuardDuty, depois o Security Hub para agregar findings.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre o AWS WAF e o Amazon GuardDuty. Contra o que é que cada serviço protege, e em que camada é que cada um opera?

*(Sugestão: Pense no WAF como um filtro nos pedidos recebidos, e no GuardDuty como um analista comportamental a vigiar os seus logs.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: O website de uma empresa de retalho está a ser alvo de um botnet que envia milhões de pedidos por hora à sua API de pesquisa de produtos. Os pedidos parecem legítimos (strings de User-Agent válidas, cookies de sessão válidos) mas não resultam em compras — estão a fazer scraping dos preços dos produtos. O ataque está a fazer com que os clientes legítimos experimentem tempos de resposta lentos.

Qual combinação de serviços MELHOR aborda esta ameaça?

A) AWS WAF com regras de limitação de taxa e CloudFront  
B) AWS Shield Advanced e CloudFront  
C) Amazon GuardDuty e AWS Shield Standard  
D) Network ACLs a bloquear os intervalos de IP do botnet

**Sugestão 1**: Os pedidos são ao nível HTTP (camada de aplicação). Qual serviço opera na camada HTTP?

**Sugestão 2**: Os botnets usam muitos endereços IP diferentes — bloquear intervalos de IP específicos ao nível da NACL é ineficaz contra botnets grandes.

**Sugestão 3**: A limitação de taxa por endereço IP pode abrandar o scraping mesmo que você não o consiga bloquear por completo.

**Resposta**: A

**Explicação**: O AWS WAF pode limitar a taxa de pedidos por endereço IP, reduzindo o impacto do scraping de alto volume de qualquer fonte única. O CloudFront distribui o tráfego de entrada pela rede de borda da AWS, absorvendo o volume e protegendo a origem. As regras do WAF também podem corresponder a padrões de pedidos (pedidos sequenciais rápidos ao mesmo endpoint de API) para identificar comportamento de scraping.

**Por que não B?** O Shield Advanced protege contra inundações de DDoS (camada 3/4). O cenário descreve scraping ao nível da aplicação (pedidos HTTP de camada 7), que o Shield não inspeciona.

**Por que não C?** O GuardDuty deteta anomalias no comportamento da sua conta AWS — não bloqueia pedidos HTTP recebidos. O Shield Standard não trata de ataques ao nível da aplicação.

**Por que não D?** Os botnets grandes usam milhares de endereços IP de fontes distribuídas. Bloquear intervalos específicos é uma abordagem de jogo do gato e do rato que falha contra botnets sofisticados.

*Domínio SAA-C03: Projetar Arquiteturas Seguras — Tarefa 1.2*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está a considerar o seu modelo de ameaças à medida que se prepara para lidar com dados de cartões de crédito. Uma revisão de conformidade PCI-DSS exige:

- Proteção contra ataques DDoS ao nível da rede
- Filtragem ao nível da aplicação para exploits web conhecidos
- Logging de todas as chamadas de API para um armazenamento de longo prazo, à prova de adulteração
- Deteção de padrões de acesso invulgares ao serviço de pagamentos

Mapeie cada requisito para um serviço ou configuração AWS específico. O Shield Standard é suficiente, ou o contexto PCI-DSS sugere o Advanced? Onde anexaria o WAF?

*(Não existe uma resposta única correta. O objetivo é praticar o mapeamento de requisitos de conformidade para serviços AWS.)*

## Cena Pós-Créditos

O GuardDuty foi ativado.

Quarenta e oito horas depois, gerou o seu primeiro finding: *"A instância EC2 i-0abc123 está a comunicar com um nó de saída Tor conhecido."*

Leo olhou para o ID da instância.

"Essa é a instância de monitorização interna", disse ele. "A que eu configurei para correr diagnósticos de rede."

"É suposto comunicar com nós de saída Tor?"

"Não." Ele fez uma pausa. "Por que é que faria isso?"

Ele abriu a instância. Alguém tinha instalado uma ferramenta nela — um scanner de rede legítimo de código aberto que, ao que parecia, também comunicava com a infraestrutura Tor para recolha de dados anonimizada.

"Então a ferramenta estava a ligar para casa", disse Priya.

"Sem o meu conhecimento", confirmou Leo.

"Isso é um risco de cadeia de fornecimento. Uma dependência que faz coisas que você não autorizou."

Leo desinstalou a ferramenta. Configurou um processo para rever cada ferramenta de terceiros antes da instalação.

"É este o nível de paranoia em que estamos agora?", perguntou Maya.

"Sim", disse Priya.

"É este o nível em que devíamos sempre ter estado?", perguntou Maya.

"Também sim", disse Priya.

No próximo capítulo: o que acontece quando o data center no Oregon desaparece — e por que a Nimbus continua a funcionar.
