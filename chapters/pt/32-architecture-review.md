# Capítulo 32: Defendendo o Plano

Carlos estava de volta, algumas semanas após a sessão Well-Architected. Dessa vez o laptop ficou na bolsa; em vez disso, ele pegou um marcador de quadro branco, cumprimentou cada pessoa na sala, encontrou um lugar perto do quadro e destampou o marcador.

"Fale-me sobre a Nimbus," disse ele. Como se nunca tivesse ouvido falar dela.

**Recapitulando: Da Revisão ao Acerto de Contas**

A Well-Architected review do Capítulo 31 havia revelado três descobertas de alto risco e a crescente consciência de Maya de que havia uma lacuna entre as decisões que a equipe havia tomado e as decisões que eles haviam *pensado a fundo*. O framework lhes havia dado um vocabulário para a lacuna. O que ele não podia lhes dar era a prática de fechá-la em tempo real — antes de um recurso ser lançado, não depois. Era para isso que Carlos estava ali. Maya o havia convidado especificamente porque a Nimbus estava prestes a construir algo significativo, e ela queria um desafio estruturado antes de a primeira linha de código de produção ser escrita.

Uma boa revisão de arquitetura é como uma lista de verificação pré-voo para um piloto. O avião pode parecer perfeitamente pronto para voar — motores funcionando, combustível cheio, passageiros embarcados. Mas a lista de verificação existe porque pilotos experientes sabem que as coisas com maior probabilidade de causar problemas são precisamente as que parecem estar bem até o momento em que deixam de estar. A lista de verificação não significa que o piloto não sabe o que está fazendo. Significa que eles internalizaram que até os especialistas perdem coisas quando pulam o processo estruturado.

**O Primeiro Movimento do Arquiteto**

O que aconteceu a seguir surpreendeu a equipe.

Maya começou a descrever o sistema — instâncias EC2, Aurora, CloudFront, ElastiCache, DynamoDB para o cardápio, VPC com sub-redes privadas...

Carlos a interrompeu gentilmente.

"Comece pelo negócio," disse ele. "Não pela tecnologia."

Ela fez uma pausa. Depois: "A Nimbus é uma plataforma de pedidos para restaurantes. Temos 287 parceiros restaurantes. Processamos cerca de 4.200 pedidos por dia. O valor médio do pedido é de US$ 34. Estamos crescendo 18% trimestre a trimestre."

"Bom. O que é a coisa mais importante que a Nimbus deve fazer?"

"Processar pedidos," disse Leo.

"Especificamente," pressionou Carlos.

"Um pedido deve chegar ao restaurante dentro de cinco segundos após a realização," disse Priya, "ou a cozinha perde a janela de tempo."

"O que acontece se não chegar?"

"O restaurante comete um erro. O cliente recebe a comida errada ou espera muito. Eles reclamam. Perdemos um parceiro restaurante."

"Então o SLA de cinco segundos," disse Carlos, "não é uma meta técnica. É um requisito de sobrevivência do negócio."

Silêncio.

"É por isso," disse ele, "que as conversas de arquitetura devem começar com os requisitos de negócios. A tecnologia é downstream da restrição."

**A Estrutura da Revisão de Arquitetura**

Uma revisão de arquitetura real — o tipo que acontece antes de você construir algo importante, ou quando você está avaliando se deve escalar — tem uma estrutura.

Carlos a escreveu no quadro branco:

**1. Entender as restrições**

O que deve ser verdade? O que não pode acontecer? (Não "o que queremos." Quais são os inegociáveis?)

**2. Entender as incógnitas**

O que não sabemos? Onde estamos fazendo suposições? O que acontece se essas suposições estiverem erradas?

**3. Avaliar as opções**

Quais são as alternativas realistas? Quais são as contrapartidas de cada uma?

**4. Identificar os modos de falha**

Como isso quebra? Qual é a sequência de eventos quando cada modo de falha se aciona?

**5. Validar o monitoramento**

Como você saberá quando algo estiver errado? Antes que os usuários lhe digam?

**6. Definir o runbook**

O que alguém faz às 3 da manhã quando isso quebra?

Esta não é uma lista de verificação a ser seguida mecanicamente. É um framework de pensamento. O objetivo é garantir que as perguntas importantes sejam feitas *antes* de estar em produção.

**Executando a Revisão: O Novo Recurso da Nimbus**

Carlos havia sido convidado especificamente porque a Nimbus estava prestes a construir algo novo.

**O recurso**: "Nimbus Instant" — uma garantia de entrega de 15 minutos. Se um restaurante parceiro não conseguir cumprir a janela de 15 minutos mais de uma vez por semana, a Nimbus reembolsaria o cliente automaticamente.

"Descreva os requisitos técnicos," disse Carlos.

Priya começou. "Precisamos de rastreamento em tempo real desde a realização do pedido até a entrega. Precisamos comparar o tempo de entrega real com o SLA de 15 minutos. Precisamos acionar reembolsos automaticamente."

"Qual é o requisito de latência para os dados de rastreamento?"

"Quase em tempo real. Os clientes veem atualizações de status no celular."

"Em quanto tempo?"

"Cinco segundos provavelmente."

"Provavelmente?"

"Dentro de cinco segundos. Esse é o requisito do produto."

"Bom. Kinesis para o stream de eventos, então. Qual é o modo de falha se o Kinesis atrasar?"

"As atualizações de status chegam tarde ao cliente."

"Isso é aceitável?"

"Por 10 segundos? Provavelmente. Por 60 segundos? Não."

"Então qual é o SLA para o sistema de rastreamento?"

Priya olhou para Leo. "Ainda não temos um."

Carlos escreveu no quadro: *Incógnita: SLA de rastreamento.*

"Isso importa," disse ele. "Porque o SLA determina o design da infraestrutura. Se o seu SLA for de 5 segundos, você precisa de uma solução diferente do que se for de 60 segundos."

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya. "Por que não usar um mecanismo de polling em que o app verifica a cada poucos segundos em vez de um push em tempo real?"

"Latência e custo," disse Carlos. "Uma abordagem de polling em escala — digamos, 10.000 pedidos ativos, cada app fazendo polling a cada 5 segundos — são 2.000 requisições por segundo, ou 120.000 requisições por minuto. Um modelo push pelo Kinesis entrega atualizações apenas quando o estado muda. Menos requisições, menor latência, e o compromisso de SLA é mais fácil de auditar a partir de um log de eventos. O polling funciona em pequena escala. Na escala para a qual a Nimbus está caminhando, o push é a base certa."

Leo havia ficado quieto durante a explicação de Carlos. Então: "Eu ia construir isso com WebSockets."

Carlos olhou para ele. "Descreva para mim."

"Cada pedido recebe uma conexão WebSocket. O cliente conecta quando o pedido é realizado. O servidor empurra as mudanças de estado — confirmado, preparando, a caminho, entregue — conforme acontecem. Sem polling, baixa latência, modelo simples."

"O que mantém a conexão WebSocket?"

"Um endpoint WebSocket do API Gateway. Funções Lambda lidam com os eventos de conexão e mensagem. O DynamoDB armazena os IDs de conexão."

Carlos escreveu no quadro. "E o modo de falha quando a rede do cliente cai por 15 segundos?"

"A conexão é encerrada. O cliente reconecta e pede o estado atual."

"De onde?"

"Do... handler Lambda, que lê do DynamoDB."

"Então você tem tanto um caminho de push quanto um caminho de pull," disse Carlos. "O push do WebSocket é o caminho feliz. A leitura do DynamoDB é o caminho de recuperação. Como você garante que a conexão seja restabelecida antes de o cliente perceber que o estado está desatualizado?"

Leo pensou. "O cliente detecta a desconexão e reconecta em poucos segundos. A lógica de reconexão é direta."

"Com 10.000 pedidos ativos simultaneamente — que é para onde a Nimbus está caminhando — quantas conexões WebSocket concorrentes são essas?"

"10.000."

"O API Gateway WebSocket tem uma cota padrão de 500 **novas conexões por segundo** por conta," disse Carlos. "Não conexões concorrentes — *taxa* de conexão. 10.000 conexões estáveis estão bem. O problema é a tempestade de reconexão: quando uma falha de rede derruba alguns milhares de clientes de uma vez e todos eles reconectam nos mesmos dois segundos, você atinge a cota de taxa e as reconexões começam a falhar exatamente quando os usuários estão prestando mais atenção. Você pode solicitar um aumento, mas é uma cota que você estaria revisitando conforme cresce. Além disso: o API Gateway WebSocket cobra US$ 0,25 por milhão de minutos de conexão, mais US$ 1,00 por milhão de mensagens. Com 10.000 pedidos por dia e uma janela média de rastreamento de 40 minutos, isso são apenas cerca de 400.000 minutos de conexão por dia — centavos. Com 10.000 pedidos ativos simultaneamente, é uma escala diferente."

"Isso não é muito," disse Leo.

"Não com 10.000 pedidos ativos," disse Carlos. "Nessa escala, digamos cerca de US$ 150 por mês com cobranças de minutos de conexão e mensagens. O custo não é o argumento contra WebSockets aqui. A cota de taxa de conexão sob tempestades de reconexão, e o gerenciamento do estado de conexão, são."

"Então os WebSockets ficam complicados em escala," disse Maya.

"Eles ficam gerenciáveis em escala se você arquitetar para isso," disse Carlos. "Não está errado — é um conjunto diferente de contrapartidas. Agora deixe-me mostrar a alternativa do polling."

Ele desenhou a segunda opção.

"Polling: o cliente envia uma requisição GET para `/orders/{order_id}/status` a cada 5 segundos. O backend lê do DynamoDB. Retorna o estado atual."

"São muitas requisições," disse Priya.

"10.000 pedidos ativos × 1 poll a cada 5 segundos = 2.000 requisições por segundo. Sua API precisa lidar com 2.000 RPS. O DynamoDB escala automaticamente. O API Gateway aguenta a carga. O custo: 2.000 RPS × 3.600 segundos × 24 horas × 30 dias = 5,18 bilhões de requisições por mês. Preço da API REST do API Gateway: US$ 3,50 por milhão de requisições = US$ 18.130/mês."

A sala ficou em silêncio.

"Essa não é uma opção viável em escala," disse Tom.

"Correto," disse Carlos. "O polling em intervalos de 5 segundos é a implementação mais simples e a mais cara em escala. Ele também gera carga proporcional às conexões ativas, não proporcional às mudanças de estado. Se um pedido fica em 'preparando' por 20 minutos, o polling gera 240 requisições que retornam todas o mesmo estado. Isso é desperdício."

"E o Kinesis?" perguntou Maya.

"O Kinesis gera um evento por mudança de estado. Uma confirmação de pedido: um evento. Aceitação da cozinha: um evento. Retirada pelo entregador: um evento. Entrega: um evento. Quatro eventos por pedido, independentemente de quanto tempo cada estado leva. O consumidor — o seu backend — lê do stream Kinesis e empurra a atualização para o cliente pelo mecanismo de entrega que você escolher."

"Mas o cliente ainda precisa de uma forma de receber o push," disse Leo.

"Sim. Você pode usar Server-Sent Events, um endpoint de long-poll, ou WebSockets para a entrega de última milha. O Kinesis lida com o stream de eventos confiável, ordenado e reproduzível para o seu backend. O mecanismo de entrega ao cliente é uma decisão separada. A vantagem fundamental: o Kinesis desacopla a fonte do evento do consumidor. O sistema de rastreamento de entrega, o sistema de reembolso, o sistema de notificação de restaurantes e o display de status do cliente, todos consomem do mesmo stream Kinesis independentemente."

"Então não é Kinesis em vez de WebSockets," disse Maya. "É Kinesis mais um mecanismo de entrega ao cliente mais leve."

"Exatamente. A análise de contrapartidas:"

Ele escreveu:

| Opção | Latência | Custo (500 / 10K pedidos ativos) | Complexidade |
|---|---|---|---|
| Apenas WebSockets | ~50ms | US$ 8 / US$ 150 por mês | Média |
| Polling (5s) | 0–5s | US$ 906 / US$ 18.130 por mês | Baixa |
| Kinesis + SSE | ~200ms | US$ 8 / US$ 75 por mês | Média-alta |

"A opção de polling é eliminada pelo custo," disse Carlos. "Os WebSockets são viáveis mas exigem gerenciamento de conexões em escala. O Kinesis mais Server-Sent Events tem latência ligeiramente maior e custo comparável — o que ele te compra é o log de eventos durável e reproduzível de que você precisa para o sistema de reembolso, e consumidores desacoplados."

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya. "Se os WebSockets têm menor latência, por que aceitar maior latência do Kinesis mais SSE?"

"200ms versus 50ms é perceptível para um cliente assistindo a uma atualização de status de entrega?" perguntou Carlos.

"Não," disse ela.

"Então a diferença de latência está abaixo do limiar perceptual. A diferença de custo com dez mil pedidos ativos é modesta — US$ 75 versus US$ 150 por mês. A diferença arquitetural é o argumento real: o Kinesis te dá um log de eventos durável e reproduzível — que você vai precisar para a trilha de auditoria de reembolso — e desacopla seus consumidores de rastreamento. Os WebSockets exigiriam que você reconstruísse o desacoplamento depois."

Leo olhou para a tabela. "Quase lançamos a versão com WebSocket."

"Teria funcionado," disse Carlos. "Essa é a coisa importante de entender. Os WebSockets teriam funcionado. A pergunta na arquitetura raramente é 'isso funciona?' A pergunta é 'quanto isso custa conforme cresce, e o que temos que reconstruir depois?'"


**As Perguntas que os Arquitetos Fazem**

Nas duas horas seguintes, Carlos guiou a equipe pela revisão. Uma seleção das suas perguntas:

**Sobre armazenamento de dados**:

"Onde o estado do pedido é armazenado durante o cumprimento? Se a aplicação travar no meio da entrega, qual é o processo de recuperação? Você consegue reconstruir o estado apenas a partir dos eventos?"

**Sobre o mecanismo de reembolso**:

"O reembolso é acionado automaticamente. O que impede que um reembolso seja emitido duas vezes? E se o processador de pagamentos expirar e você não tiver certeza se o reembolso foi aceito?"

**Sobre o rastreamento de entrega**:

"Você está contando com dados de GPS do entregador. O que acontece se o sinal GPS for perdido por 90 segundos? Como você distingue 'GPS perdido' de 'entrega em andamento' de 'problema na entrega'?"

**Sobre o tratamento de falhas**:

"Se o serviço de reembolso estiver inativo, o pedido ainda é processado? O cliente ainda recebe a comida? Qual é a experiência do usuário durante uma falha parcial do sistema?"

**Sobre observabilidade**:

"Como você sabe agora quantos pedidos estão atualmente a 5 minutos do SLA de 15 minutos? Se esse número disparar, quem é notificado?"

Cada pergunta revelou uma suposição que a equipe havia feito sem perceber.

"Eu já tinha implantado isso — ah," disse Leo. "O endpoint de reembolso. Eu ia simplesmente chamar a API de pagamento diretamente. Não havíamos pensado em chamá-la duas vezes." Ele fez uma pausa. "Então, se a primeira chamada for bem-sucedida mas nossa confirmação se perder no caminho, chamamos de novo e o cliente recebe dois reembolsos."

"Já pensamos no que acontece se a API de pagamento aceitar a primeira chamada mas nossa confirmação se perder no caminho?" perguntou Priya.

"Isso é idempotência," disse Carlos.

"Uma chave de idempotência — um ID único por tentativa de reembolso, armazenado em um banco de dados antes de chamar a API de pagamento," disse Priya. "Se chamarmos duas vezes com a mesma chave, a API de pagamento ignora a segunda chamada."

"O que significa," acrescentou Carlos, "que você precisa de um repositório de estado persistente para operações de reembolso, não apenas um evento em uma fila."


"O monitoramento que discutimos," disse Carlos, "é todo monitoramento de infraestrutura. CPU. Contagem de conexões. Atraso do Kinesis. Esses são importantes — mas não são o monitoramento que te diz se o Nimbus Instant está funcionando."

"Qual é o monitoramento que nos diz que está funcionando?" perguntou Maya.

"Tempo de confirmação de p95 por restaurante. Quanto tempo, no percentil 95, leva da realização do pedido até a confirmação do restaurante — medido separadamente para cada parceiro restaurante?"

"Não temos essa métrica," disse Priya.

"Essa é a lacuna," disse Carlos. "Você pode ter infraestrutura perfeita — CloudWatch verde em cada alarme — e ainda ter um parceiro restaurante cuja latência de confirmação vem se degradando por três semanas porque o software do tablet deles tem um bug. A infraestrutura está bem. O SLA de negócio está sendo violado. E você não vai saber até o restaurante ligar para reclamar."

"Como capturamos isso?" perguntou Leo.

"Emita uma métrica customizada do CloudWatch ou empurre para o seu pipeline de análise toda vez que uma confirmação de pedido for recebida. Marque o timestamp da realização do pedido. Marque o timestamp da confirmação. Calcule a diferença. Emita-a com a tag `restaurant_id`. Construa um dashboard do CloudWatch que mostre o tempo de confirmação de p95 por restaurante nos últimos 7 dias."

"E alarmar quando degradar?" perguntou Tom.

"Alarmar quando o p95 de um restaurante específico exceder 90 segundos por mais de 5 minutos consecutivos," disse Carlos. "Isso é uma anomalia que justifica um contato proativo, não uma resposta de esperar-pela-reclamação."

"Esta é a diferença entre monitorar a infraestrutura e monitorar o produto," disse Priya.

"Exatamente," disse Carlos. "O monitoramento de infraestrutura te diz se seus sistemas estão saudáveis. O monitoramento no nível de negócio te diz se seus clientes estão experimentando o que você prometeu a eles. Você precisa de ambos. A maioria das equipes tem apenas o primeiro."

Maya adicionou ao apêndice do ADR: rastrear o tempo de confirmação de p95 por restaurante além das métricas de saúde da infraestrutura. Limiares de alarme a serem definidos pela equipe de produto em consulta com a equipe de sucesso de restaurantes.

"Este também é o ponto onde o monitoramento de custos e o monitoramento de negócios se cruzam," disse Tom. "Se nossa latência de confirmação está disparando para um subconjunto de restaurantes nas noites de sexta, a causa raiz pode ser um cold start de Lambda atingindo os shards desses restaurantes no Kinesis. A métrica de negócio revela o sintoma. As métricas de infraestrutura revelam a causa."

"E a solução pode não ser mais infraestrutura," disse Carlos. "Pode ser concorrência provisionada na função Lambda específica. Ou pode ser rebalanceamento de shards. Ou pode ser um bug no endpoint de confirmação do restaurante. Você não consegue saber qual até ter ambas as camadas de observabilidade."

"Já pensamos no que acontece se corrigirmos a infraestrutura e a métrica de negócio ainda não melhorar?" perguntou Priya.

"Então a causa raiz não está na infraestrutura," disse Carlos. "O que é informação valiosa. Sem a métrica de negócio, você estaria perseguindo melhorias de infraestrutura para um problema que vive em outro lugar."


"Quanto isso custa por mês quando temos 500 entregas concorrentes sendo rastreadas?" perguntou Tom. "O repositório de estado, o stream Kinesis, as funções Lambda processando os eventos?"

Carlos assentiu. "Essa é a pergunta certa para fazer agora, enquanto você está projetando, não depois de tê-lo construído."

Esse é o tipo de detalhe arquitetural que emerge em uma revisão estruturada — e frequentemente não emerge quando você está apenas construindo.

**O Architecture Decision Record**

Após a revisão, Carlos recomendou que a equipe documentasse suas decisões em **Architecture Decision Records (ADRs)** — documentos curtos que capturam:

- **Que decisão foi tomada**
- **Quais alternativas foram consideradas**
- **Por que essa decisão foi tomada (o contexto e as restrições no momento)**
- **Quais são as contrapartidas**
- **O que nos faria reconsiderar essa decisão**

Você pode estar se perguntando: os ADRs precisam ser documentos formais? Não. Um ADR pode ser um parágrafo em uma thread do Slack se for ali que sua equipe trabalha. O formato é irrelevante. O ato de escrever o que você decidiu e por quê — antes de seguir em frente — é o que cria a memória institucional.

"Os ADRs são para o seu eu futuro," disse Carlos. "Em 18 meses, você olhará para uma parte da arquitetura e se perguntará por que foi feita dessa forma. Se você tiver um ADR, entenderá o contexto. Se não tiver, você a deixará do jeito que está (porque tem medo de mexer) ou a mudará (porque não entendeu por que foi feita assim)."

Leo escreveu o primeiro ADR naquela tarde: a decisão de usar o Kinesis para eventos de rastreamento de entrega, com o contexto, as alternativas consideradas (SQS, EventBridge, polling) e as contrapartidas.

Carlos olhou para o ADR que Leo havia redigido. Ele o leu em trinta segundos. Então disse: "Mostre à equipe como é o ADR-007."

Leo o projetou.

---

**ADR-007: Infraestrutura de Eventos de Rastreamento de Entrega**

**Data**: 2025-03-14
**Status**: Aceito
**Autor**: Leo (com revisão de Carlos, Priya)

---

**Problema**

O Nimbus Instant requer rastreamento de status de entrega em tempo real. Os pedidos devem atualizar seu status (confirmado → preparando → a caminho → entregue) e expor essas atualizações ao app móvel do cliente dentro de 5 segundos da mudança de estado. O sistema de reembolso também precisa de um log auditável e reproduzível de eventos de entrega para determinar a conformidade com o SLA.

---

**Opções Consideradas**

**Opção 1: API Gateway WebSocket + estado no DynamoDB**
- O cliente mantém uma conexão WebSocket por pedido
- O backend empurra mudanças de estado pela conexão aberta
- Na reconexão, o cliente puxa o estado atual do DynamoDB
- Custo estimado em escala (10K pedidos ativos simultaneamente): ~US$ 150/mês
- Fraqueza: Gerenciamento de limite de conexões em escala; sem replay embutido para auditoria

**Opção 2: Polling do cliente (intervalo de 5 segundos)**
- O cliente faz polling em `/orders/{order_id}/status` a cada 5 segundos
- O backend lê do DynamoDB a cada poll
- Implementação mais simples
- Custo estimado em escala (10K pedidos ativos simultaneamente): US$ 18.130/mês
- Eliminada devido ao custo

**Opção 3: Kinesis Data Streams + Server-Sent Events**
- Mudanças de estado de entrega publicadas em um stream Kinesis, dimensionado por throughput: um shard ingere 1 MB/s ou 1.000 registros/s. Com 10K pedidos ativos (~4 eventos de mudança de estado por pedido, payloads JSON pequenos), a taxa de escrita de pico é de ~40-50 eventos/s — o equivalente a um único shard. Provisionar 3 shards para distribuição de partições e folga de consumidores.
- O endpoint SSE se inscreve no shard Kinesis atribuído à partição do pedido
- O cliente recebe eventos SSE; reconecta usando a API EventSource padrão
- Custo estimado em escala (10K pedidos ativos simultaneamente): ~US$ 75/mês
- Fornece um log de eventos durável e reproduzível; desacopla todos os consumidores

---

**Decisão**

Opção 3: Kinesis Data Streams + SSE.

Justificativa: a vantagem de custo é significativa em escala; o log de eventos do Kinesis satisfaz o requisito de auditoria de reembolso sem uma implementação separada de trilha de auditoria; o tratamento de reconexão do SSE é mais simples do que o gerenciamento de conexões WebSocket em escala.

---

**Consequências**

- *Positiva*: O sistema de reembolso, o sistema de notificação de restaurantes e o app do cliente, todos consomem do mesmo stream Kinesis independentemente. Novos consumidores podem ser adicionados sem modificar o produtor.
- *Positiva*: Os eventos são reproduzíveis por até 7 dias (nossa retenção estendida configurada; o Kinesis suporta até 365 dias com custo extra). Se a Lambda de processamento de reembolso falhar, ela pode reproduzir os eventos perdidos.
- *Negativa*: A latência do SSE (~200ms) é maior do que a latência do WebSocket (~50ms). Aceitável porque essa diferença está abaixo do limiar de percepção do cliente para atualizações de status.
- *Negativa*: O preço provisionado do Kinesis escala com horas de shard, e a retenção estendida aproximadamente dobra o custo por shard. A folga de throughput é grande (um shard ingere 1.000 registros/s), mas conforme a contagem de consumidores e a carga de leitura por consumidor crescerem além de cerca de 50K pedidos ativos diários, a contagem de shards — e uma estratégia de re-shard/fan-out de consumidores — precisará ser revisitada.

**O que nos faria reconsiderar essa decisão**: Se o volume de pedidos crescer até o ponto em que os custos de shard do Kinesis excedam os custos de WebSocket na nova escala, ou se a latência de 200ms do SSE se tornar um problema de diferenciação de produto.

---

"A última linha," disse Maya. "É essa que eu não havia pensado."

"O gatilho para reconsiderar," disse Carlos. "Toda decisão tem condições sob as quais ela se torna errada. Escrevê-las significa que você as reconhecerá quando elas aparecerem."

"Em vez de descobri-las em um post-mortem," disse Priya.

"Em vez disso, sim."

Tom estava lendo a consequência de custo. "A estratégia de re-shard e fan-out — ainda não temos isso."

"Você não precisa dela até 50K pedidos ativos diários," disse Carlos. "Nos seus atuais 287 restaurantes e 4.200 pedidos diários, você tem folga significativa. O ADR te diz o que construir antes de se tornar urgente, não antes de se tornar relevante."

Leo vinha fazendo anotações. "O ADR está fazendo duas coisas," disse ele. "Está documentando o que decidimos. E está documentando o que precisaríamos decidir a seguir se a situação mudar."

"É isso que torna um ADR útil por dezoito meses," disse Carlos. "Não a decisão em si — as decisões ficam obsoletas. O raciocínio. O raciocínio te diz se a decisão deve ser reconsiderada, mesmo quando a decisão ainda está em vigor."


**O Que Faz um Arquiteto**

Ao final da sessão, Maya fez a pergunta original a Carlos: "Qual é a diferença entre tomar decisões arquiteturais e pensar como arquiteto?"

Ele pensou.

"Um arquiteto não sabe mais tecnologia do que um engenheiro sênior," disse ele. "Um bom arquiteto provavelmente sabe um pouco menos dos frameworks mais recentes. Mas um arquiteto tem um conjunto padrão de perguntas diferente."

"O que você quer dizer?"

"Quando você é um engenheiro sênior olhando para um novo recurso, suas primeiras perguntas geralmente são: 'O que construímos? Como funciona? Qual é a melhor biblioteca para isso?' Quando um arquiteto olha para o mesmo recurso, as primeiras perguntas são: 'Que problema isso resolve? O que quebra primeiro quando o tráfego dobra? Como sabemos quando está degradado? Qual é a experiência do usuário quando o processador de pagamentos está lento?'"

"O arquiteto pergunta sobre o sistema sob estresse," disse Leo.

"E sobre a consequência de negócios de cada falha," acrescentou Priya.

"E," disse Tom, "sobre o que acontece com a conta quando isso escala."

Carlos assentiu. "Todos vocês já estão fazendo isso. Estiveram fazendo desde o Capítulo 1. A diferença entre um engenheiro sênior e um arquiteto não é uma certificação ou um título. É o hábito de fazer a próxima pergunta — aquela que revela a coisa sobre a qual você ainda não pensou."

**Variação: Quando uma Revisão de Arquitetura Adiciona Risco em Vez de Removê-lo**

Se a sua revisão é tratada como um portão de aprovação em vez de um processo de aprendizado, as equipes começarão a esconder escolhas de design para evitar o atraso — e os modos de falha ainda existirão, apenas não documentados. Uma revisão de arquitetura que retarda o lançamento sem melhorar a qualidade é pior do que nenhuma revisão.

Se o problema de idempotência do serviço de reembolso tivesse sido tratado como um atraso inesperado no lançamento do recurso em vez de uma descoberta necessária, Leo teria lançado o endpoint original, o reembolso duplo eventualmente ocorreria, e a equipe teria ficado sabendo disso por um cliente irritado. A revisão revela o problema em um ponto onde corrigi-lo custa um dia, não um rollback.

O valor da revisão é proporcional a quão disposta a equipe está a deixá-la mudar o design.

## Pontos Fortes e Limitações

**Revisões de arquitetura**:

- Detectam modos de falha antes de entrarem em produção
- Criam entendimento compartilhado entre membros da equipe que frequentemente têm conhecimento em silos
- Geram documentação (ADRs) que rende dividendos por anos
- Desaceleram a tomada de decisões de formas benéficas — "mova rápido" sem uma revisão é "mova rápido e bata na parede que você não viu"

**Onde ficam complicadas**:

- Requerem alguém habilidoso o suficiente para fazer as perguntas certas — a revisão é tão boa quanto o revisor
- Podem se tornar burocráticas se tratadas como uma caixa de verificação em vez de uma conversa
- Algumas decisões arquiteturais genuinamente não precisam de uma revisão completa — saber quais precisam é em si uma habilidade arquitetural
- O resultado (ADRs, diagramas, registros de decisão) deve ser mantido à medida que o sistema evolui

## Resumo

A revisão com Carlos havia levado duas horas e produzido três ADRs, uma lista de seis incógnitas a resolver antes de o recurso ser construído, e uma mudança arquitetural (o repositório de estado de idempotência) que teria sido dolorosa de adaptar após o lançamento. A metáfora da lista de verificação pré-voo se sustentou o tempo todo: nada de catastrófico havia sido descoberto, mas várias coisas que teriam causado problemas depois haviam sido detectadas e documentadas enquanto ainda eram fáceis de corrigir.

- As revisões de arquitetura começam com **requisitos de negócios, não com tecnologia**.
- A estrutura da revisão: restrições → incógnitas → opções → modos de falha → monitoramento → runbooks.
- Os arquitetos perguntam: O que quebra primeiro? Como sabemos que está degradado? Qual é a experiência do usuário durante uma falha? Qual é o custo em escala?
- Os **Architecture Decision Records (ADRs)** capturam o que foi decidido, por que, e o que causaria reconsideração.
- Pensar como arquiteto é um hábito: fazer a próxima pergunta, especialmente sobre modos de falha, consequência de negócios e economia de escala.

## Dicas para o Exame

*Domínio SAA-C03: Domínio cruzado — raciocínio arquitetural*

Este capítulo é menos sobre tópicos específicos do exame e mais sobre a mentalidade que o exame testa.

- **Os cenários do SAA-C03** quase sempre descrevem uma restrição de negócios primeiro ("a empresa não pode ter mais de 1 hora de inatividade") e pedem para você selecionar a arquitetura que a atende. Pratique traduzir restrições de negócios em requisitos técnicos.
- **Pensamento sobre modos de falha**: Muitas perguntas do exame descrevem um sistema e perguntam o que acontece quando um componente falha. Pratique perguntar "o que quebra primeiro?" para as arquiteturas que você encontrar.
- **Pensamento sobre contrapartidas**: O exame raramente tem uma resposta "perfeita". Ele pede a resposta *melhor* dado um conjunto de restrições. Fique confortável com "esta opção está correta dados esses requisitos específicos, mesmo que outra opção fosse melhor sob requisitos diferentes."
- **Architecture Decision Records**: Não é um serviço AWS, mas uma melhor prática que reflete o pilar de Excelência Operacional do Well-Architected Framework.
- **Kinesis para streaming de eventos em tempo real**: O recurso Nimbus Instant do capítulo usa o Kinesis para o streaming de eventos de entrega. Sinal de exame: "ingestão de eventos em tempo real com processamento ordenado" → Kinesis Data Streams. "Desacoplar componentes, entrega pelo menos uma vez" → SQS. Saber quando recorrer a cada um é um padrão recorrente do exame.
- **Idempotência como um padrão testável**: O SAA-C03 frequentemente testa idempotência em sistemas distribuídos. O padrão central: gere uma chave de idempotência única antes de chamar um sistema externo; persista a chave e o resultado; no retry, verifique a chave existente antes de re-executar. Se encontrada, retorne o resultado previamente armazenado sem re-executar. Isso impede cobranças duplas, envios duplos e mutações de estado duplicadas quando os retries ocorrem após um timeout de rede. Sinal de exame: "impedir operações duplicadas quando uma chamada de serviço é repetida" ou "garantir processamento exatamente uma vez de eventos de pagamento" → chave de idempotência armazenada no DynamoDB com escrita condicional.
- **Server-Sent Events vs WebSockets**: O SSE é unidirecional (servidor para cliente), usa HTTP padrão e reconecta automaticamente via a API EventSource. Os WebSockets são bidirecionais, exigem gerenciamento de conexão e são adequados quando o cliente também precisa enviar dados ao servidor. Para atualizações de status de entrega (apenas servidor para cliente), o SSE é mais simples e mais barato do que os WebSockets em escala.

## Exercícios

**Exercício 1 — Recordação**

Carlos fez seis tipos de perguntas durante a revisão de arquitetura. Você consegue reconstruir as seis áreas sem olhar para o capítulo?

*(Dica: Elas estão listadas na seção "Estrutura da Revisão de Arquitetura". Tente relembrá-las de memória — o ato de tentar recordar (mesmo que você falhe) fortalece a retenção a longo prazo.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa está construindo um sistema de gerenciamento de lances em tempo real para publicidade online. Os lances devem ser avaliados e respondidos em 100 milissegundos. O sistema processa 1 milhão de lances por segundo no pico. Se o sistema de lances estiver inativo, a empresa perde receita de anúncios. A equipe de banco de dados da empresa propõe usar RDS Aurora com 10 réplicas de leitura. O arquiteto de soluções deve avaliar se a proposta é fundamentalmente viável antes de revisar suas características secundárias.

Qual preocupação o arquiteto deve levantar PRIMEIRO?

A) O custo de 10 réplicas de leitura Aurora é muito alto para o orçamento  
B) As réplicas de leitura Aurora têm atraso de replicação que pode causar problemas de consistência  
C) A latência de consulta típica do Aurora de 1-5ms pode não atender ao SLA de resposta de 100ms  
D) O RDS Aurora não suporta os volumes de transação de 1 milhão de requisições por segundo nesse requisito de latência

**Dica 1**: A restrição principal é um tempo de resposta total de 100ms a 1 milhão de requisições/segundo. Qual dessas preocupações, se válida, torna a proposta inviável não importa como as outras três sejam tratadas?

**Dica 2**: A latência de consulta do Aurora é tipicamente de 1-5ms. 1-5ms para a consulta do banco de dados deixa 95-99ms para rede, lógica de aplicação e serialização. A restrição de 100ms está em risco?

**Dica 3**: O Aurora pode lidar com alto IOPS, mas 1 milhão de requisições por segundo é uma taxa extraordinária. O que acontece com a arquitetura nessa escala?

**Resposta**: D

**Explicação**: Embora o Aurora seja de alto desempenho, 1 milhão de requisições por segundo com tempo de resposta total de 100ms é um requisito extremo — é o bloqueador arquitetural que determina se a proposta pode existir. O arquiteto deve primeiro questionar se o Aurora (ou qualquer banco de dados relacional) pode servir como o sistema principal de consulta nessa escala e latência. Sistemas como este tipicamente usam repositórios de dados na memória (Redis) ou bancos de dados especializados de baixa latência, não bancos de dados relacionais com semântica SQL completa. O SLA de 100ms é alcançável para consultas Aurora isoladas, mas a combinação de 1 M RPS e SLA total de 100ms excede as características típicas de throughput do Aurora. "PRIMEIRO" significa viabilidade antes do refinamento: se o motor não consegue sustentar a carga, toda outra preocupação sobre a proposta é irrelevante.

**Por que não A?** O custo é uma preocupação válida, mas a primeira preocupação deve ser se a arquitetura é tecnicamente viável nos requisitos declarados.

**Por que não B?** O atraso de replicação é uma característica real mas *secundária* da proposta — uma propriedade que você ajusta uma vez que a arquitetura é viável. O atraso de réplica do Aurora é tipicamente <100ms e aceitável para a maioria dos casos de uso; levantá-lo primeiro significaria debater o comportamento de consistência de um sistema que não consegue sustentar o throughput necessário em primeiro lugar. A questão de viabilidade (D) o subsume.

**Por que não C?** A latência do Aurora de 1-5ms está bem dentro do SLA de 100ms para a parte de consulta do banco de dados. Essa não é a preocupação principal.

*Domínio SAA-C03: Domínio cruzado — design de sistema*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

Aplique a estrutura de revisão de arquitetura a um sistema real ou hipotético:

Uma startup quer construir um jogo de trivia multijogador em tempo real. Os jogadores entram em salas de jogo (até 10 jogadores cada). Cada rodada mostra uma pergunta por 15 segundos; todos os jogadores respondem simultaneamente. As pontuações são tabuladas instantaneamente após cada pergunta. Os jogos duram 10 rodadas. Pico de uso: 50.000 jogos simultâneos.

Execute a revisão de seis etapas:

1. Quais são as restrições inegociáveis?
2. Quais são as incógnitas e suposições?
3. Quais são as opções tecnológicas realistas?
4. Quais são os modos de falha?
5. Como você saberá quando estiver degradado?
6. Como é o runbook das 3 da manhã?

*(Não há uma única resposta correta. O objetivo é praticar a estrutura de revisão como uma ferramenta de pensamento.)*

## Cena Pós-Créditos

Carlos saiu do escritório às 18h.

A equipe ficou sentada por um tempo depois, sem fazer nada em particular.

"Acho que aprendi mais nessas duas horas do que em qualquer capítulo individual de serviços AWS," disse Leo.

"Porque esses capítulos eram sobre ferramentas," disse Maya. "Isso foi sobre julgamento."

"Julgamento pode ser ensinado?" ele perguntou.

"Sim," disse Priya. "Mas não por meio de leitura. Por meio da prática. Por meio de tomar decisões, ver o que quebra, pensar sobre o porquê."

"Por meio da experiência," disse Tom.

"Por meio da experiência estruturada," Priya corrigiu. "Experiência sem reflexão não constrói julgamento. Você tem que fazer as perguntas depois."

Maya olhou para o quadro branco. As notas da revisão ainda estavam lá — restrições, incógnitas, modos de falha, perguntas de monitoramento. Preenchia dois quadros brancos.

"Isso deve ir no ADR," disse ela.

Leo já estava digitando.

No capítulo final: a única coisa que nenhuma ferramenta ou framework pode lhe dar — e por que "depende" é a resposta mais honesta e poderosa na arquitetura de software.
