# Capítulo 17: Os Vigilantes

O incidente com o IP romeno tinha ficado contido. Os segredos estavam no Secrets Manager. As credenciais tinham sido rotadas. Os controlos de rede tinham sido reforçados.

Mas Priya tinha feito a pergunta que encerrou o Capítulo 16: "Se algo invulgar aparecesse no CloudTrail, como saberíamos?"

A resposta honesta era: provavelmente não saberiam.

O CloudTrail regista milhares de eventos por dia. Nenhum humano os lê todos. Priya verificava manualmente todas as semanas, mas isso significava que algo podia acontecer numa terça-feira e não ser notado até à segunda-feira seguinte.

"Precisamos de algo que vigie os logs por nós," disse ela.

Maya levantou os olhos. "Automaticamente?"

"Automaticamente."

A segunda pergunta de Tom do dia: "Quanto custa isso?"

**Três Categorias de Ameaças**

As ameaças de segurança contra uma aplicação cloud geralmente enquadram-se em três categorias:

**Ataques de volume (DDoS)**: Um atacante envia tanto tráfego que a aplicação não consegue responder a utilizadores legítimos. O ataque pode ser milhões de pedidos HTTP, ou uma inundação de pacotes TCP SYN concebida para esgotar a tabela de conexões do servidor.

**Ataques de aplicação (Exploits)**: Um atacante envia pedidos especificamente elaborados para explorar fraquezas na aplicação — injecção SQL, scripting entre sites, entrada malformada que colapsa um parser.

**Anomalias de comportamento (Reconhecimento e comprometimento)**: Chamadas API que não deviam estar a acontecer (alguém a consultar toda a base de dados de utilizadores às 3 da manhã), actividade IAM invulgar (credenciais sendo usadas de um novo país), ou tráfego de rede para destinos inesperados.

A AWS tem um serviço dedicado para cada um:

- **AWS Shield**: Protecção DDoS
- **AWS WAF**: Protecção ao nível da aplicação
- **Amazon GuardDuty**: Detecção de ameaças comportamentais

**AWS Shield: O Absorvedor DDoS**

O **AWS Shield Standard** está activado automaticamente para todos os clientes AWS sem encargo adicional. Protege contra os ataques DDoS mais comuns de camada 3 (rede) e camada 4 (transporte) — inundações SYN, inundações UDP, ataques de amplificação DNS.

O CloudFront, o Route 53 e o Elastic Load Balancing ficam na borda da rede da AWS. Quando um ataque DDoS visa a aplicação, atinge estes serviços geridos primeiro. A infraestrutura de rede da AWS absorve o ataque antes de alcançar as instâncias EC2.

O **AWS Shield Advanced** é o nível premium (3 000 $/mês por organização). Acrescenta:

- Protecção para EC2, ELB, CloudFront, Global Accelerator e Route 53
- Notificações de ataque em tempo quase real
- Acesso à Equipa de Resposta do AWS Shield (SRT) — engenheiros de segurança que podem ajudar a responder a ataques
- Protecção de custos: se um ataque fizer subir a factura, a AWS credita os custos do pico
- Detecção e mitigação DDoS melhorada na camada 7 (camada de aplicação)

"Três mil dólares por mês?" disse Tom.

"Para empresas que lidam com milhões em receitas, um DDoS que as deixa em baixo durante duas horas custa mais do que três mil dólares," disse Priya.

Tom fez as contas em silêncio.

"Começamos com Standard," disse ele finalmente.

**AWS WAF: O Filtro de Aplicação**

O **AWS WAF (Web Application Firewall)** opera ao nível HTTP — inspecciona o conteúdo dos pedidos web antes de alcançarem a aplicação.

O WAF é configurado com **Web ACLs (Listas de Controlo de Acesso)** — conjuntos de regras que definem o que permitir, bloquear ou contar.

O WAF pode ser associado a:

- Distribuições CloudFront (inspeccionar pedidos na borda, globalmente)
- Application Load Balancers (inspeccionar pedidos ao nível regional)
- API Gateway
- AWS AppSync

**Regras Geridas WAF**: A AWS e fornecedores terceiros publicam conjuntos de regras pré-construídos:

- **AWS Managed Rules - Core Rule Set**: Protege contra vulnerabilidades OWASP Top 10 (injecção SQL, XSS, injecção de comandos, travessia de directório, etc.)
- **AWS Managed Rules - Known Bad Inputs**: Bloqueia pedidos que correspondam a padrões de ataque conhecidos
- **AWS Managed Rules - Amazon IP Reputation List**: Bloqueia IPs conhecidos por estarem associados a botnets e scanners
- **AWS Managed Rules - Bot Control**: Identifica e gere tráfego de bots

Também pode criar regras personalizadas:

- "Bloquear qualquer pedido com um cabeçalho User-Agent que contenha 'sqlmap'" (um scanner de injecção SQL comum)
- "Limite de taxa: não permitir mais de 1000 pedidos por IP por 5 minutos"
- "Bloquear pedidos que contenham `<script>` em qualquer valor de parâmetro"

Para Nimbus, a configuração prática: WAF na distribuição CloudFront com o Core Rule Set activado. Isto bloqueia os padrões de ataque mais comuns antes de os pedidos alguma vez alcançarem as instâncias EC2.

**Amazon GuardDuty: O Analista Comportamental**

O GuardDuty é fundamentalmente diferente do Shield e do WAF. Não bloqueia ataques — **detecta comportamentos invulgares**.

O GuardDuty analisa continuamente:

- **Logs AWS CloudTrail**: Alterações IAM, chamadas API, logins na consola
- **Logs de Fluxo VPC**: Padrões de tráfego de rede dentro do VPC
- **Logs de consultas DNS**: O que as instâncias estão a resolver (malware conhecido resolve frequentemente domínios C2 específicos)

Os modelos de aprendizagem automática identificam padrões que desviam da linha de base. O GuardDuty gera **findings** — alertas categorizados — quando detecta anomalias.

Exemplos do que o GuardDuty pode detectar:

- Um utilizador IAM a fazer login de um endereço IP não reconhecido (num país que nunca usou antes)
- Chamadas API a ser feitas a partir de um nó de saída Tor
- Uma instância EC2 a comunicar com um grupo de mineração de criptomoedas conhecido
- Volume invulgarmente alto de chamadas API (abuso de credenciais ou scanning)
- Um bucket S3 a ser acedido por um endereço IP assinalado por actividade maliciosa
- Tráfego de saída para um domínio conhecido por estar associado a comando e controlo de malware

"Isto é o que teria apanhado o IP romeno," disse Leo em voz baixa.

"Se tivéssemos o GuardDuty activado, teria assinalado a instância EC2 a fazer conexões de saída para um IP externo não reconhecido às 2 da manhã," confirmou Priya.

"Quanto custa?"

O preço do GuardDuty baseia-se no volume de logs analisados — eventos CloudTrail, dados de fluxo VPC, consultas DNS. Para uma aplicação de pequena a média dimensão, tipicamente 50 a 150 $/mês. Em escala, é ainda uma pequena fracção dos custos de infraestrutura.

Tom abriu a consola e activou-o.

**Ligar os Três Serviços**

Shield, WAF e GuardDuty operam em camadas diferentes e complementam-se:

| Serviço    | Camada                       | Protege Contra                              | Acção                              |
|------------|------------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Rede/Transporte (L3/L4)      | Inundações DDoS                             | Absorve/mitiga ataques             |
| AWS WAF    | Aplicação (L7)               | OWASP Top 10, bots, scrapers                | Permite, bloqueia ou conta pedidos |
| GuardDuty  | Comportamental (todos os logs)| Anomalias, credenciais comprometidas, malware | Detecta e alerta                  |

O Shield para a inundação. O WAF filtra a água. O GuardDuty observa a canalização para padrões de fluxo invulgares.

**CloudTrail: A Fundação**

Os três serviços dependem de logs. O **AWS CloudTrail** é o serviço de registo que captura cada chamada API na conta AWS — quem chamou o quê, quando, de onde, com que resultado.

O CloudTrail está activado por defeito para um histórico de 90 dias na consola. Para reter logs a longo prazo:

1. Criar uma trilha que escreva para um bucket S3
2. Opcionalmente, enviar para os Logs CloudWatch para alertas em tempo real
3. Activar validação de ficheiros de log (para detectar se os logs foram adulterados)

O GuardDuty, o AWS Config e o Security Hub lêem todos do CloudTrail. Sem logs CloudTrail, estes serviços não têm nada para analisar.

**AWS Security Hub: O Painel**

Se estiver a gerir múltiplas contas AWS ou precisar de uma vista consolidada dos findings de segurança, o **AWS Security Hub** agrega findings do GuardDuty, Inspector (avaliação de vulnerabilidades), Macie (privacidade de dados), Config e Firewall Manager num único painel.

Também verifica a configuração em relação a boas práticas de segurança (o padrão AWS Foundational Security Best Practices) e o CIS AWS Foundations Benchmark.

Para Nimbus: o Security Hub ainda não era necessário. Quando crescessem para três contas (desenvolvimento, staging, produção), tornar-se-ia útil.

## Pontos Fortes e Limitações

**AWS Shield**:

- Standard: gratuito e automático — não há razão para não usar
- Advanced: excelente para alvos de alto perfil; caro para equipas pequenas

**AWS WAF**:

- Os grupos de regras geridos simplificam significativamente a configuração
- As regras personalizadas requerem perceber padrões de ataque HTTP
- O limite de taxa é uma funcionalidade poderosa frequentemente ignorada
- O WAF não é substituto para código de aplicação seguro — é uma camada de defesa em profundidade

**GuardDuty**:

- Extremamente fácil de activar (alguns cliques)
- Os findings requerem revisão e resposta humana — o GuardDuty detecta, não corrige
- Ocorrem falsos positivos — alguma actividade legítima parece anómala para modelos ML
- Avaliação gratuita de 30 dias — vale a pena activar imediatamente

## Resumo

- **AWS Shield Standard**: Protecção DDoS gratuita e automática na camada 3/4. Sempre activo.
- **AWS Shield Advanced**: Protecção DDoS premium com acesso SRT e protecção de custos. Caso de uso empresarial.
- **AWS WAF**: Firewall de camada de aplicação. Inspeccionar e filtrar pedidos HTTP. Associar ao CloudFront, ALB ou API Gateway. Usar Grupos de Regras Geridas para protecção OWASP Top 10.
- **Amazon GuardDuty**: Detecção de ameaças comportamentais. Analisa CloudTrail, Logs de Fluxo VPC e logs DNS. Gera findings para actividade anómala.
- **CloudTrail**: A fundação de todo o registo de segurança AWS. Activar uma trilha a escrever para S3 para retenção a longo prazo.
- Estes serviços complementam-se: Shield na camada de rede, WAF na camada de aplicação, GuardDuty na camada comportamental.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Seguras (Domínio 1, Tarefa 1.2)*

- **Shield Standard vs Advanced**: O Standard é gratuito e automático. O Advanced custa dinheiro e acrescenta o SRT, protecção de custos e melhor detecção. Sinais do exame para Advanced: "DDoS em grande escala", "garantia de SLA durante ataques", "protecção financeira contra picos de custos relacionados com DDoS".
- **Sinais de caso de uso WAF**: "bloquear injecção SQL", "bloquear scripting entre sites", "limitar taxa de chamadas API", "bloquear user-agents específicos", "protecção OWASP Top 10" → WAF.
- **Sinais GuardDuty**: "detectar actividade API invulgar", "identificar credenciais comprometidas", "assinalar conexões de rede EC2 anómalas", "inteligência de ameaças" → GuardDuty.
- **Associação WAF**: Pode associar ao CloudFront (global), ALB (regional), API Gateway (regional), AppSync.
- **Fontes de dados GuardDuty**: Eventos de gestão CloudTrail, eventos de dados S3 CloudTrail, Logs de Fluxo VPC, logs DNS. O exame pode perguntar que fonte de dados é relevante para um cenário de detecção específico.
- **Macie**: Frequentemente confundido com GuardDuty. O **Macie** usa ML para detectar dados sensíveis em S3 (PII, credenciais, dados financeiros). O **GuardDuty** detecta ameaças e anomalias no comportamento. Casos de uso diferentes.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre o AWS WAF e o Amazon GuardDuty. O que cada serviço protege e em que camada opera?

*(Sugestão: Pense no WAF como um filtro em pedidos recebidos, e no GuardDuty como um analista comportamental a observar os seus logs.)*

**Exercício 2 — Prática de Exame**

*Cenário*: O website de uma empresa de retalho está a ser visado por uma botnet que envia milhões de pedidos por hora para a sua API de pesquisa de produtos. Os pedidos parecem legítimos (cadeias User-Agent válidas, cookies de sessão válidos) mas não resultam em compras — estão a fazer scraping de preços de produtos. O ataque está a causar tempos de resposta lentos para clientes legítimos.

Qual combinação de serviços MELHOR aborda esta ameaça?

A) AWS Shield Advanced e CloudFront  
B) AWS WAF com regras de limite de taxa e CloudFront  
C) Amazon GuardDuty e AWS Shield Standard  
D) ACLs de Rede a bloquear os intervalos IP da botnet

**Sugestão 1**: Os pedidos são ao nível HTTP (camada de aplicação). Que serviço opera ao nível HTTP?

**Sugestão 2**: As botnets usam muitos endereços IP diferentes — bloquear intervalos IP específicos na NACL é ineficaz contra grandes botnets.

**Sugestão 3**: O limite de taxa por endereço IP pode abrandar o scraping mesmo que não o bloqueie completamente.

**Resposta**: B

**Explicação**: O AWS WAF pode limitar a taxa de pedidos por endereço IP, reduzindo o impacto de scraping de alto volume de qualquer fonte única. O CloudFront distribui o tráfego recebido pela rede de borda da AWS, absorvendo o volume e protegendo a origem. As regras WAF também podem corresponder a padrões de pedido (pedidos sequenciais rápidos para o mesmo endpoint API) para identificar comportamento de scraping.

**Por que não A?** O Shield Advanced protege contra inundações DDoS (camada 3/4). O cenário descreve scraping ao nível da aplicação (pedidos HTTP da camada 7), que o Shield não inspecciona.

**Por que não C?** O GuardDuty detecta anomalias no comportamento da conta AWS — não bloqueia pedidos HTTP recebidos. O Shield Standard não lida com ataques à camada de aplicação.

**Por que não D?** As grandes botnets usam milhares de endereços IP de fontes distribuídas. Bloquear intervalos específicos é uma abordagem de caça às moscas que falha contra botnets sofisticadas.

*Domínio SAA-C03: Projectar Arquitecturas Seguras — Tarefa 1.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a considerar o modelo de ameaças enquanto se prepara para lidar com dados de cartões de crédito. Uma revisão de conformidade PCI-DSS requer:

- Protecção contra ataques DDoS de camada de rede
- Filtragem de camada de aplicação para exploits web conhecidos
- Registo de todas as chamadas API num armazenamento a longo prazo resistente a adulteração
- Detecção de padrões de acesso invulgares ao serviço de pagamento

Mapeie cada requisito para um serviço AWS específico ou configuração. O Shield Standard é suficiente, ou o contexto PCI-DSS sugere Advanced? Onde associaria o WAF?

*(Não existe uma resposta única correcta. O objectivo é praticar o mapeamento de requisitos de conformidade para serviços AWS.)*

## Cena Pós-Créditos

O GuardDuty foi activado.

Quarenta e oito horas depois, gerou o seu primeiro finding: *"A Instância EC2 i-0abc123 está a comunicar com um nó de saída Tor conhecido."*

Leo olhou para o ID da instância.

"Essa é a instância de monitorização interna," disse ele. "A que configurei para correr diagnósticos de rede."

"Deve comunicar com nós de saída Tor?"

"Não." Fez uma pausa. "Por que razão o faria?"

Abriu a instância. Alguém tinha instalado uma ferramenta nela — um scanner de rede open-source legítimo que, verificou-se, também comunicava com infraestrutura Tor para recolha de dados anonimizados.

"Portanto a ferramenta estava a ligar a casa," disse Priya.

"Sem meu conhecimento," confirmou Leo.

"Isso é um risco da cadeia de fornecimento. Uma dependência que faz coisas que não autorizou."

Leo desinstalou a ferramenta. Configurou um processo para rever cada ferramenta de terceiros antes da instalação.

"É este o nível de paranóia a que chegámos agora?" perguntou Maya.

"Sim," disse Priya.

"É este o nível a que deveríamos sempre ter estado?" perguntou Maya.

"Também sim," disse Priya.

No próximo capítulo: o que acontece quando o centro de dados na Virgínia desaparece — e por que Nimbus continua a funcionar.
