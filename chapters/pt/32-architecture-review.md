# Capítulo 32: Defendendo o Plano

A pergunta de Maya ao final do Capítulo 31: "Qual é a diferença entre tomar decisões arquiteturais e pensar como arquiteto?"

Ela havia convidado um visitante para ajudar a respondê-la.

O nome dele era Carlos. Havia sido engenheiro por 20 anos, gerente de engenharia por sete e consultor de startups por três. Era o tipo de pessoa que havia visto sistemas suficientes serem bem-sucedidos e falharem para ter instintos calibrados sobre ambos.

Ele chegou sem nada: sem slides, sem agenda. Apenas um marcador de quadro branco e uma pergunta.

"Fale-me sobre a Nimbus," disse ele.

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

"Como você sabe agora quantos pedidos estão a 5 minutos do SLA de 15 minutos? Se esse número disparar, quem é notificado?"

Cada pergunta revelou uma suposição que a equipe havia feito sem perceber.

"Não havíamos pensado no problema do reembolso duplo," disse Leo depois. "Íamos simplesmente chamar a API de pagamento."

"Isso não está errado," disse Priya. "Mas você precisa de idempotência. A operação de reembolso precisa ser segura para chamar duas vezes."

"Uma chave de idempotência — um ID único por tentativa de reembolso, armazenado em um banco de dados antes de chamar a API de pagamento. Se chamarmos duas vezes com a mesma chave, a API de pagamento ignora a segunda chamada."

"O que significa," acrescentou Carlos, "que você precisa de um repositório de estado persistente para operações de reembolso, não apenas um evento em uma fila."

Esse é o tipo de detalhe arquitetural que emerge em uma revisão estruturada — e frequentemente não emerge quando você está apenas construindo.

**O Architecture Decision Record**

Após a revisão, Carlos recomendou que a equipe documentasse suas decisões em **Architecture Decision Records (ADRs)** — documentos curtos que capturam:

- **Que decisão foi tomada**
- **Quais alternativas foram consideradas**
- **Por que essa decisão foi tomada (o contexto e as restrições no momento)**
- **Quais são as contrapartidas**
- **O que nos faria reconsiderar essa decisão**

"Os ADRs são para o seu eu futuro," disse Carlos. "Em 18 meses, você olhará para uma parte da arquitetura e se perguntará por que foi feita dessa forma. Se você tiver um ADR, entenderá o contexto. Se não tiver, você a deixará do jeito que está (porque tem medo de mexer) ou a mudará (porque não entendeu por que foi feita assim)."

Leo escreveu o primeiro ADR naquela tarde: a decisão de usar o Kinesis para eventos de rastreamento de entrega, com o contexto, as alternativas consideradas (SQS, EventBridge, polling) e as contrapartidas.

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

No próximo capítulo: a resposta mais útil, frustrante e honesta em toda a engenharia de software.

## Resumo

- As revisões de arquitetura começam com **requisitos de negócios, não com tecnologia**.
- A estrutura da revisão: restrições → incógnitas → opções → modos de falha → monitoramento → runbooks.
- Os arquitetos perguntam: O que quebra primeiro? Como sabemos que está degradado? Qual é a experiência do usuário durante uma falha? Qual é o custo em escala?
- Os **Architecture Decision Records (ADRs)** capturam o que foi decidido, por que, e o que causaria reconsideração.
- Pensar como arquiteto é um hábito: fazer a próxima pergunta, especialmente sobre modos de falha, consequência de negócios e economia de escala.
- A diferença entre tomar decisões e ser um arquiteto é o conjunto padrão de perguntas: os arquitetos padrão para perguntas no nível do sistema e de falhas, não apenas perguntas de implementação.

## Dicas para o Exame

*Domínio SAA-C03: Domínio cruzado — raciocínio arquitetural*

Este capítulo é menos sobre tópicos específicos do exame e mais sobre a mentalidade que o exame testa.

- **Os cenários do SAA-C03** quase sempre descrevem uma restrição de negócios primeiro ("a empresa não pode ter mais de 1 hora de inatividade") e pedem para você selecionar a arquitetura que a atende. Pratique traduzir restrições de negócios em requisitos técnicos.
- **Pensamento sobre modos de falha**: Muitas perguntas do exame descrevem um sistema e perguntam o que acontece quando um componente falha. Pratique perguntar "o que quebra primeiro?" para as arquiteturas que você encontrar.
- **Pensamento sobre contrapartidas**: O exame raramente tem uma resposta "perfeita". Ele pede a resposta *melhor* dado um conjunto de restrições. Fique confortável com "esta opção está correta dados esses requisitos específicos, mesmo que outra opção fosse melhor sob requisitos diferentes."
- **Idempotência**: O problema do reembolso duplo é um desafio real de sistemas distribuídos. Chaves de idempotência (únicas por operação, verificadas antes da execução) são a solução padrão. Conheça esse padrão.
- **Architecture Decision Records**: Não é um serviço AWS, mas uma melhor prática que reflete o pilar de Excelência Operacional do Well-Architected Framework.

## Exercícios

**Exercício 1 — Recordação**

Carlos fez seis tipos de perguntas durante a revisão de arquitetura. Você consegue reconstruir as seis áreas sem olhar para o capítulo?

*(Dica: Elas estão listadas na seção "Estrutura da Revisão de Arquitetura". Tente relembrá-las de memória — o ato de tentar recordar (mesmo que você falhe) fortalece a retenção a longo prazo.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa está construindo um sistema de gerenciamento de lances em tempo real para publicidade online. Os lances devem ser avaliados e respondidos em 100 milissegundos. O sistema processa 1 milhão de lances por segundo no pico. Se o sistema de lances estiver inativo, a empresa perde receita de anúncios. A equipe de banco de dados da empresa propõe usar RDS Aurora com 10 réplicas de leitura. O arquiteto de soluções deve avaliar essa proposta.

Qual preocupação o arquiteto deve levantar PRIMEIRO?

A) O custo de 10 réplicas de leitura Aurora é muito alto para o orçamento  
B) As réplicas de leitura Aurora têm atraso de replicação que pode causar problemas de consistência  
C) A latência de consulta típica do Aurora de 1-5ms pode não atender ao SLA de resposta de 100ms  
D) O RDS Aurora não suporta os volumes de transação de 1 milhão de requisições por segundo nesse requisito de latência

**Dica 1**: A restrição principal é um tempo de resposta total de 100ms a 1 milhão de requisições/segundo. Qual dessas preocupações ameaça diretamente o cumprimento dessa restrição?

**Dica 2**: A latência de consulta do Aurora é tipicamente de 1-5ms. 1-5ms para a consulta do banco de dados deixa 95-99ms para rede, lógica de aplicação e serialização. A restrição de 100ms está em risco?

**Dica 3**: O Aurora pode lidar com alto IOPS, mas 1 milhão de requisições por segundo é uma taxa extraordinária. O que acontece com a arquitetura nessa escala?

**Resposta**: D

**Explicação**: Embora o Aurora seja de alto desempenho, 1 milhão de requisições por segundo com tempo de resposta total de 100ms é um requisito extremo. O arquiteto deve primeiro questionar se o Aurora (ou qualquer banco de dados relacional) pode servir como o sistema principal de consulta nessa escala e latência. Sistemas como este tipicamente usam repositórios de dados na memória (Redis) ou bancos de dados especializados de baixa latência, não bancos de dados relacionais com semântica SQL completa. O SLA de 100ms é alcançável para consultas Aurora isoladas, mas a combinação de 1 M RPS e SLA total de 100ms excede as características típicas de throughput do Aurora.

**Por que não A?** O custo é uma preocupação válida, mas a primeira preocupação deve ser se a arquitetura é tecnicamente viável nos requisitos declarados.

**Por que não B?** O atraso de replicação nas réplicas de leitura Aurora é tipicamente <100ms — aceitável para a maioria dos casos de uso. Os problemas de consistência são reais, mas secundários à questão de viabilidade.

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
