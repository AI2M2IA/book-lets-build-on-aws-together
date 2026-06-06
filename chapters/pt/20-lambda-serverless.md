# Capítulo 20: O Modelo Freelancer

Era uma tarde tranquila de quarta-feira. Priya estava sem os fones de ouvido pela primeira vez, e o escritório tinha aquele tipo de zumbido baixo que significava que todos estavam concentrados mas ninguém estava em pânico. Leo tinha um painel de custos aberto em uma tela e a lista de instâncias EC2 na outra.

Pense em um freelancer que trabalha sob demanda. Ele não fica sentado em uma mesa das nove às cinco. Ele espera. O telefone toca, ele faz o trabalho, envia uma fatura, volta a esperar. Sem trabalho, sem custo. Uma rajada de requisições, ele lida com todas elas simultaneamente. Você só paga pelas horas efetivamente trabalhadas — não pelas horas que ele passou disponível.

É desse modelo que este capítulo trata.

Há uma sutileza aqui que vale a pena guardar. O modelo tradicional é: contrate um funcionário, pague por 8 horas, obtenha uma produção variável. O modelo freelancer é: pague apenas quando o telefone toca, obtenha exatamente o que foi solicitado. Para uma empresa com demanda previsível e constante, o modelo de funcionário é mais eficiente — você sabe que o telefone vai tocar constantemente, então pagar por hora é equivalente e não há overhead de engajamento e desengajamento. Para uma empresa com demanda variável, irregular ou infrequente, o modelo freelancer é dramaticamente mais barato.

A AWS oferece esse modelo para computação — e se ele faz sentido depende do seu padrão de demanda. A primeira pergunta nunca é "este modelo é bom?", mas "como é, de fato, a minha carga de trabalho?"

Para a maioria das cargas de trabalho maiores que as de uma startup: uma mistura. Algumas coisas rodam constantemente (o servidor de API, o banco de dados). Algumas coisas rodam apenas quando acionadas (processamento de eventos, geração de relatórios, redimensionamento de imagens). O modelo freelancer é para a segunda categoria — e a Nimbus estava prestes a descobrir o quanto da sua conta pertencia a ela.

---

O fan-out SQS/SNS tinha desacoplado o fluxo de pedidos, mas os workers que consumiam essas filas ainda rodavam em instâncias EC2 que cobravam por hora — independentemente de quantos e-mails eles realmente enviavam. A arquitetura estava certa; o modelo de custo ainda tinha um vazamento.

Priya tinha percebido primeiro.

"O serviço de e-mail", disse ela. "Quantos e-mails enviamos por dia?"

Leo verificou as métricas. "Média de 400 por dia. Pico de cerca de 1.200 nas noites de sexta."

"E a instância EC2 que roda o serviço de e-mail — por quanto tempo ela roda?"

"Sempre. 24 horas por dia, 7 dias por semana."

"Mesmo às 3 da manhã, quando enviamos zero e-mails?"

Silêncio.

Leo abriu o gráfico de CPU do CloudWatch para a instância EC2 do serviço de e-mail. O gráfico mostrava 18 horas de operação contínua. No pico de sexta: CPU em 38%, lidando com a rajada de e-mails. Depois da meia-noite: a CPU caía para 3%. Ficava lá até os pedidos do almoço começarem.

Três por cento de CPU por 18 horas seguidas. A instância estava rodando. Estava sendo cobrada. Não estava fazendo nada significativo.

"Estamos pagando por um computador para ficar lá sem fazer nada", disse Leo.

"Por quantas horas por dia?"

Mais silêncio.

"Cerca de 18."

Tom estava muito atento agora.

"E não é só o serviço de e-mail", acrescentou Priya. "O serviço de redimensionamento de imagens das fotos dos restaurantes roda a 1% de CPU na maior parte do tempo. Ele só dispara quando um restaurante carrega um novo cardápio. O que acontece, o quê, algumas vezes por dia por restaurante?"

"Sim", confirmou Leo.

"O job de limpeza noturna que exclui arquivos temporários — esse roda por 4 minutos às 2 da manhã e depois fica completamente ocioso por 23 horas e 56 minutos."

"Também sim."

O padrão era o mesmo em todos os serviços menores da Nimbus: computação paga 24 horas por dia, usada por uma fração disso.

---

**O Servidor Nem Sempre É a Resposta**

Instâncias EC2 são permanentes. Você inicia uma e ela roda até você pará-la — 24 horas por dia, 7 dias por semana, independentemente do uso real. Para o seu servidor web (que lida com tráfego a todas as horas), isso está correto. Para o serviço de e-mail (que envia rajadas de e-mails e depois fica ocioso por horas), é um desperdício.

O Auto Scaling Group pode reduzir o serviço de e-mail para uma instância durante as horas de pouco movimento. Mas uma instância ainda roda constantemente.

Esta é a pergunta à qual Tom continuava voltando ao olhar a conta: o que cada serviço estava de fato fazendo durante aquelas 18 horas de 3% de CPU? Tecnicamente não nada — a instância estava esperando, verificando eventos, mantendo seu estado. Mas de uma perspectiva de negócio: nada. O serviço não estava entregando valor. Estava sendo cobrado.

Para cargas de trabalho que estão verdadeiramente ociosas na maior parte do tempo, uma instância EC2 sempre ligada é pagar aluguel de um apartamento que você só visita nos fins de semana. O apartamento é seu; o aluguel não para.

O modelo freelancer resolve isso completamente. O código existe. Ele simplesmente não roda até que haja um motivo para rodar. Sem custo ocioso. Sem capacidade reservada. Sem servidor esperando ao lado do telefone.

Essa é a premissa da **computação serverless**.

**AWS Lambda: Código Sem Servidores**

O **AWS Lambda** permite rodar código em resposta a eventos sem provisionar ou gerenciar servidores. Você faz upload de uma função, especifica o que a aciona, e o Lambda a roda quando o gatilho dispara.

Uma função Lambda:

- Não tem estado persistente (cada invocação é independente)
- Roda por até 15 minutos por invocação
- Escala automaticamente de 0 a milhares de invocações concorrentes
- É cobrada apenas quando está rodando (por 1 ms de execução, arredondado para cima, por GB de memória alocada)

Quando não há gatilho, o Lambda não custa nada. Quando os gatilhos disparam, o Lambda roda e cobra. Quando 10.000 gatilhos disparam simultaneamente, o Lambda roda 10.000 invocações concorrentes. O escalonamento é automático e quase instantâneo.

**Gatilhos de Evento: O Que Acorda o Lambda**

As funções Lambda não rodam por conta própria — elas respondem a eventos. Gatilhos comuns incluem:

- **Fila SQS**: Processar mensagens de uma fila. O Lambda faz polling da fila e invoca a função com lotes de mensagens.
- **API Gateway**: Uma requisição HTTP chega. O API Gateway aciona o Lambda. O Lambda gera uma resposta.
- **Evento do S3**: Um arquivo é carregado no S3. O Lambda o processa (redimensionar uma imagem, fazer parse de um CSV, validar um documento).
- **SNS**: Uma mensagem é publicada em um tópico. O Lambda é notificado.
- **DynamoDB Streams**: Um registro no DynamoDB muda. O Lambda processa a mudança.
- **CloudWatch Events (EventBridge)**: Um evento agendado (como um cron job) roda em um horário definido.
- **ALB**: Uma requisição HTTP chega ao balanceador de carga. O Lambda pode lidar com certas rotas.

Para a Nimbus, o serviço de e-mail virou uma função Lambda acionada por sua fila SQS. Quando uma mensagem chega à fila, o Lambda é invocado com o conteúdo da mensagem, envia o e-mail via SES (Simple Email Service) e sai.

Zero servidores. Zero tempo ocioso. Zero custo quando ocioso.

O padrão de Lambda + SQS vale a pena internalizar: o SQS cuida da fila, da durabilidade, da lógica de repetição e da DLQ. O Lambda cuida do processamento. Você obtém os benefícios de desacoplamento do SQS com a economia de escala-até-zero do Lambda. Nenhum serviço faz o trabalho do outro. Eles se compõem de forma limpa.

"O que acontece com uma mensagem malformada na fila?" perguntou Priya. "Uma entrada ruim pode travar o Lambda de um jeito que afete outras funções na conta?"

As invocações do Lambda são isoladas umas das outras. Uma função que trava não afeta outras funções. Um Lambda que lança uma exceção não tratada em uma mensagem malformada: a mensagem volta para a fila, tenta novamente até o limite configurado, depois vai para a DLQ. O próprio Lambda permanece disponível para a próxima mensagem. A validação de entrada dentro do handler do Lambda ainda é importante — para capturar dados malformados antes de tentar processá-los —, mas uma única mensagem ruim não pode derrubar a função.

**O Problema do Cold Start**

As funções Lambda rodam em **ambientes de execução** — pequenos contêineres isolados. Quando uma função é invocada:

1. A AWS verifica se há um ambiente de execução aquecido disponível (um que lidou com uma invocação recente)
2. Se aquecido: a função roda imediatamente
3. Se frio: a AWS inicializa um novo ambiente de execução — baixa seu código, inicia o runtime, roda seu código de inicialização — e então roda a função

Um **cold start** adiciona de 100ms a vários segundos de latência, dependendo do runtime (Java e .NET têm cold starts mais longos que Python e Node.js) e do tamanho do seu pacote de código.

Você pode estar se perguntando: se o Lambda começa do zero a cada vez, isso não o torna mais lento que um servidor que já está rodando? Sim — às vezes. Esse é o problema do cold start, e ele importa para APIs voltadas ao usuário sensíveis a tempo. Ele não importa nem um pouco para jobs em segundo plano onde o usuário já recebeu sua confirmação. Um cold start de 200ms em um serviço de e-mail que roda em segundo plano é invisível para qualquer um.

Para o processamento assíncrono (envio de e-mail, redimensionamento de imagem), os cold starts são invisíveis para os usuários.

Para APIs síncronas (requisições HTTP onde um usuário está esperando por uma resposta), os cold starts podem causar respostas lentas ocasionais.

**Mitigações**:

- **Provisioned concurrency**: Pré-aquecer um número especificado de ambientes de execução. Eles estão sempre prontos. Você paga por isso mesmo quando eles não estão processando requisições.
- **Pacotes menores**: Código menor inicializa mais rápido.
- **Invocações de aquecimento**: Pings agendados para manter as funções aquecidas (uma abordagem comum mas deselegante).
- **Escolha o runtime certo**: Python e Node.js fazem cold start mais rápido que Java.

**Uma Investigação Real de Cold Start**

Duas semanas depois da migração para o Lambda, Leo recebeu uma mensagem no Slack de um parceiro de restaurante: "A confirmação do pedido às vezes leva 3 segundos. Normalmente é rápida. O que está acontecendo?"

Leo abriu as métricas do CloudWatch para a função Lambda. No gráfico "Duration", ele podia ver um padrão: a primeira invocação após qualquer intervalo de mais de 15-20 minutos disparava para 2.800-3.200 milissegundos. As invocações subsequentes: 180-220 milissegundos.

Cold starts clássicos.

Ele puxou o trace do X-Ray para uma das invocações de 3 segundos. A linha do tempo mostrava isso claramente:

- Fase de inicialização: 2.640ms (baixando o código da função, iniciando o runtime do Node.js, rodando o código de inicialização em nível de módulo)
- Execução da função handler: 290ms

A fase de inicialização era o problema. Ele olhou o código de inicialização. A função estava importando um SDK grande, inicializando uma conexão de banco de dados e carregando configuração do AWS Secrets Manager — tudo na inicialização.

"Parte dessa inicialização só precisa acontecer uma vez por ambiente de execução", disse Leo. "Mas está acontecendo em todo cold start."

Ele reestruturou o código do Lambda para inicializar a conexão de banco de dados fora da função handler (de modo que ela seja reutilizada entre invocações aquecidas) e reduziu o tamanho do pacote removendo módulos não utilizados do SDK. Ele também trocou de empacotar o SDK inteiro da AWS para importar apenas os serviços específicos de que precisava.

Após a otimização:

- Duração do cold start: 1.100ms (ainda presente, mas menos severa)
- Invocações aquecidas: 165ms

O cold start de 1,1 segundo ainda acontecia ocasionalmente. Para o serviço de e-mail (assíncrono, atraso voltado ao usuário invisível), isso era aceitável. Para o Lambda de notificação do restaurante (voltado ao cliente, pedido de um tablet), Priya defendeu a provisioned concurrency: dois ambientes pré-aquecidos sempre prontos.

"Quanto isso custa por mês?" perguntou Tom.

Dois ambientes de provisioned concurrency a 256MB: cerca de US$ 5,40/mês. Os picos de latência pararam.

**Preços do Lambda: Por Que Tom Sorriu**

Os preços do Lambda têm dois componentes:

1. **Cobrança por requisição**: US$ 0,20 por milhão de invocações
2. **Cobrança por duração**: US$ 0,0000166667 por GB-segundo (memória alocada × segundos rodando)

O primeiro milhão de requisições por mês é gratuito (sempre, não apenas no primeiro ano).

"Quanto isso custa por mês?" perguntou Tom antes que Leo pudesse abrir a calculadora.

Tom fez a conta para o serviço de e-mail ele mesmo:

- Suponha que todo dia seja uma sexta — pior caso: 1.200 e-mails por dia × 30 dias = 36.000 invocações por mês
- Cada invocação leva ~2 segundos a 256MB de memória
- Duração: 36.000 × 2 × 0,25GB × US$ 0,0000166667 = US$ 0,30/mês
- Requisições: 36.000 << 1.000.000 (camada gratuita) = US$ 0,00/mês

"E esses 18.000 GB-segundos estão bem dentro dos 400.000 GB-segundos de duração que são sempre gratuitos", acrescentou Tom. "Então a cobrança real seria zero. Mas estou ignorando a camada gratuita de propósito — quero saber o custo unitário real."

A instância EC2 do serviço de e-mail: US$ 18/mês.

"Eu já implantei — ah." Leo se conteve. Ele tinha empurrado o Lambda do serviço de e-mail para produção antes de terminar a configuração da DLQ. "Me dá cinco minutos."

Tom ficou quieto por um momento. Então: "Deveríamos fazer isso para tudo."

**No Que o Lambda É Bom (e No Que Não É)**

"Espera — mas *por que* não usaríamos o Lambda para tudo, então?" perguntou Maya. "Se é mais barato e escala automaticamente, qual é a pegadinha?"

"O limite de 15 minutos", disse Leo. "E os cold starts para qualquer coisa voltada ao usuário. E a ausência de estado — você não pode manter nada em memória entre invocações."

Se a sua carga de trabalho é irregular, orientada a eventos e se completa em menos de 15 minutos, o Lambda custará uma fração de uma instância EC2 sempre ligada — mas se a sua carga de trabalho é um job de processamento de dados de longa duração que se aproxima ou excede o limite de 15 minutos, o Lambda é a ferramenta errada e você precisará de ECS, Batch ou uma abordagem baseada em EC2.

O Lambda é excelente para:

- **Processamento orientado a eventos**: Responder a eventos (uploads de arquivos, mensagens de fila, tarefas agendadas)
- **Tarefas de curta duração**: Processamento que se completa bem dentro de 15 minutos
- **Tráfego irregular e imprevisível**: O Lambda escala de 0 a milhares instantaneamente — sem pré-provisionamento
- **Operações infrequentes**: Um relatório que roda diariamente às 2 da manhã. Um job de limpeza que roda semanalmente.
- **Código de cola**: Pequenas funções que movem dados entre serviços

Você pode estar se perguntando: o que acontece com o escalonamento do Lambda quando uma rajada repentina de 10.000 eventos chega simultaneamente? O limite de concorrência padrão do Lambda é de 1.000 execuções concorrentes por conta. Se 10.000 eventos chegam de uma vez, até 1.000 invocações rodam imediatamente; o resto espera na fila SQS (se acionado via SQS) e é processado à medida que a capacidade se libera. Isso geralmente é tranquilo para processamento baseado em fila. Para casos de uso sensíveis à latência, o limite de rajada do Lambda (a taxa inicial na qual novas execuções concorrentes são adicionadas) pode causar throttling breve durante picos repentinos — a provisioned concurrency contorna isso tendo capacidade pré-alocada.

Para o serviço de e-mail da Nimbus na escala atual, 1.000 invocações concorrentes eram muito mais do que eles jamais precisariam. Mas é a restrição certa a conhecer antes de atingi-la.

O Lambda é ruim para:

- **Processos de longa duração**: O limite de 15 minutos é uma parede rígida
- **Aplicações com estado**: As funções Lambda são sem estado por design — cada invocação é independente
- **APIs de alto throughput e baixa latência**: Os cold starts podem causar picos de latência; a provisioned concurrency mitiga isso mas adiciona custo
- **Aplicações que precisam de conexões persistentes**: O Lambda não consegue manter facilmente um pool de conexões de banco de dados de longa duração (embora ferramentas de pooling de conexões como o RDS Proxy ajudem)
- **Servidores web tradicionais**: Possível, mas não o encaixe natural

**A Parede dos 15 Minutos: Quando o Lambda É a Ferramenta Errada**

Três semanas depois da migração, Leo tentou mover mais uma carga de trabalho para o Lambda: o gerador de relatório de analytics noturno. Ele puxava dados de pedidos do banco de dados, os unia com metadados de restaurante, calculava estatísticas e gerava um PDF.

Na primeira noite, a invocação do Lambda falhou com um erro de timeout.

"A geração do relatório levou 17 minutos", disse Leo na manhã seguinte.

"O máximo do Lambda é 15", disse Priya.

"Sim. Eu sei disso agora."

Ele tinha verificado o tempo médio de processamento (8 minutos) e presumido que o Lambda funcionaria. Ele não tinha verificado a cauda — as noites em que o volume de dados era maior e a consulta levava mais tempo. Nessas noites, 15 minutos não eram suficientes.

"Então o relatório simplesmente... não é gerado?" perguntou Maya.

"Correto. Sem notificação de erro. Sem relatório parcial. Apenas silêncio."

"Eu já implantei — ah", disse Leo.

Esta era uma das maneiras específicas pelas quais o Lambda falha sem graça: um timeout não produz saída, nenhuma mensagem de erro na aplicação, apenas um log de erro no CloudWatch. Se você não está monitorando especificamente os erros de timeout do Lambda, pode não notar por dias.

A correção: mover o gerador de relatório para o ECS Fargate — contêineres sem gerenciar servidores; próximo capítulo — que não tem limite de tempo. O Lambda era a ferramenta errada para cargas de trabalho que poderiam exceder 15 minutos mesmo que ocasionalmente. A lição não era "o Lambda é ruim". A lição era "o Lambda é a ferramenta certa para cargas de trabalho que cabem dentro de suas restrições — e uma fonte de falhas surpreendentes quando não cabem".

**RDS Proxy: Pooling de Conexões para o Lambda**

A natureza sem estado do Lambda cria um problema específico de banco de dados.

Quando uma instância EC2 se conecta ao RDS, ela mantém um pool de conexões persistente. A aplicação reutiliza conexões do pool. O RDS consegue lidar com, digamos, 200 conexões simultâneas.

Quando o Lambda lida com 500 invocações simultâneas, cada invocação tenta abrir sua própria conexão de banco de dados. São 500 novas conexões — sobrecarregando um banco de dados que suporta 200.

O **Amazon RDS Proxy** fica entre as funções Lambda e o RDS, mantendo um pool de conexões persistente e multiplexando as conexões de curta duração do Lambda por meio dele.

Em vez de: invocação do Lambda → nova conexão RDS (para cada uma das 500 invocações concorrentes)

Com o RDS Proxy: invocação do Lambda → RDS Proxy → pool de 20 conexões RDS persistentes

"O proxy precisa de credenciais do RDS", disse Priya. "Onde elas ficam? Ele as armazena?"

O RDS Proxy armazena as credenciais no Secrets Manager e as rotaciona automaticamente. A função IAM da função Lambda concede acesso ao proxy (usando autenticação IAM), não às credenciais do RDS diretamente. As credenciais nunca são expostas ao código do Lambda.

"Então a função Lambda se autentica via IAM", confirmou Leo, "e o proxy lida com as credenciais reais do banco de dados."

Para o Lambda de processamento de pedidos da Nimbus (aquele que consultava o RDS para validação de pedidos), o RDS Proxy eliminou a exaustão do pool de conexões durante o pico de tráfego de sexta-feira.

**Lambda Layers: Dependências Compartilhadas**

O Lambda do serviço de e-mail, o Lambda de notificação e o Lambda de relatório todos compartilhavam o mesmo código de biblioteca interna: funções utilitárias para formatar moeda, sanitizar entradas, fazer logging no formato padrão.

Sem as Lambda Layers, esse código compartilhado tinha de ser empacotado no pacote de implantação de cada função. Três funções, três cópias da mesma biblioteca de 2MB. Quando a biblioteca era atualizada, todas as três funções precisavam de novas implantações.

As **Lambda Layers** são pacotes separados que as funções Lambda podem referenciar em tempo de execução. A biblioteca compartilhada foi extraída para uma layer. As três funções referenciavam a layer. Atualizações na biblioteca compartilhada significavam atualizar a versão da layer — não reimplantar as três funções.

Benefício adicional: pacotes de função individuais menores significam cold starts mais rápidos.

"Uma coisa que as layers não mudam: a função de execução", disse Priya. "Se um Lambda tem permissões amplas demais, uma função comprometida pode acessar tudo na conta."

"Mesmo princípio das funções de EC2", disse Leo. "Privilégio mínimo. Cada Lambda recebe apenas as permissões de que realmente precisa."

"Então o Lambda não é um substituto para o EC2", disse Maya. "É uma ferramenta diferente para trabalhos diferentes."

"A API web da Nimbus fica no EC2 ou ECS", confirmou Leo. "O serviço de e-mail, o redimensionador de imagens, o gerador de relatório noturno, o limpador de logs — esses vão para o Lambda."

**A Filosofia Serverless**

O Lambda faz parte de um conceito mais amplo: **serverless** — construir aplicações onde você não gerencia servidores, apenas código.

Uma stack totalmente serverless da Nimbus poderia ser assim:

- API Gateway + Lambda (em vez de EC2 com um servidor web)
- DynamoDB (em vez de RDS — também serverless, sem gerenciamento de servidor)
- S3 (ativos estáticos — inerentemente serverless)
- SNS + SQS (mensageria — serverless)
- Lambda (todo o processamento em segundo plano)

O apelo: você escreve código; a AWS gerencia todo o resto. Sem patching, sem configuração de escalonamento, sem planejamento de capacidade.

## Amazon API Gateway

A lista de gatilhos do Lambda mencionou o API Gateway brevemente: uma requisição HTTP chega, o API Gateway aciona o Lambda. Isso é preciso, mas subestima o que o API Gateway de fato é.

"Espera — mas *por que* colocaríamos o API Gateway na frente do Lambda?" perguntou Maya. "O Lambda não pode simplesmente receber requisições HTTP diretamente?"

O Lambda pode receber requisições HTTP via uma function URL — um endpoint HTTPS simples e direto. Mas ele não lida com roteamento, autorização, throttling, cache ou transformação de requisição. Para uma API de produção, essas preocupações existem independentemente de seu backend ser Lambda ou EC2.

O **Amazon API Gateway** é um serviço totalmente gerenciado para criar, implantar e gerenciar APIs em qualquer escala. Ele lida com gerenciamento de tráfego, autorização, throttling, cache e monitoramento para que a sua função Lambda (ou EC2, ou qualquer backend HTTP) não precise implementá-los ela mesma.

**Três tipos de API:**

A **REST API** é a opção com mais recursos. Ela oferece suporte a transformação de requisição e resposta, cache de resposta, planos de uso atrelados a chaves de API e todos os tipos de autorização. A maioria das questões de exame SAA-C03 que mencionam o API Gateway envolve a REST API.

A **HTTP API** é mais simples e mais barata — cerca de 70% menos de custo que a REST API. Ela foi projetada para backends Lambda e proxies HTTP. Oferece suporte a autorização OIDC e OAuth 2.0, mas não a transformação de requisição ou cache. Se você não precisa dos recursos avançados da REST API, a HTTP API é a escolha certa.

A **WebSocket API** gerencia conexões persistentes de mão dupla. O API Gateway lida com o ciclo de vida da conexão e roteia mensagens para o Lambda com base no conteúdo da mensagem. A função Lambda não precisa gerenciar o estado do socket — o API Gateway faz isso.

**Opções de autorização** (as que o exame testa):

O **autorizador de User Pool do Cognito** valida um JWT de um User Pool do Cognito. Nenhum Lambda necessário. O API Gateway verifica o token ele mesmo. Se for válido, a requisição passa.

O **autorizador Lambda** roda a sua própria função Lambda para validar um token — um JWT personalizado, um token OAuth de um provedor de identidade terceiro, uma chave de API em um formato proprietário. O Lambda retorna uma política IAM. Se a política permitir a ação, a requisição prossegue.

A **chave de API** é uma chave simples passada em um cabeçalho de requisição. As chaves de API são para limitação de taxa por cliente, não para autenticação. Não as use como mecanismo de segurança — elas não são segredos, são identificadores.

**Throttling e planos de uso:**

Por padrão, o API Gateway permite 10.000 requisições por segundo no nível da conta (um limite flexível), com uma rajada de 5.000. Exceda isso e os clientes recebem um `429 Too Many Requests` — seu backend nem sequer sente. Quando você precisa de limites por cliente, você cria um plano de uso: anexe-o a uma chave de API, defina uma taxa de requisição e uma cota diária ou mensal. As rajadas de um cliente não consomem a alocação de outro cliente.

Dois números que vale a pena guardar: o payload máximo é de **10 MB**, e o timeout de integração padrão é de **29 segundos** — se o seu backend demorar mais, o gateway desiste. (Desde 2024, esse timeout pode ser elevado além de 29 segundos para REST APIs Regional e privadas via um aumento de cota — mas o padrão de 29 segundos ainda é o que o exame espera.) O API Gateway é para APIs de requisição/resposta, não para jobs de longa duração; para esses, entregue o trabalho ao SQS ou Step Functions e responda imediatamente.

"Quanto isso custa por mês?" perguntou Tom.

Para a REST API: US$ 3,50 por milhão de chamadas de API, mais US$ 0,09 por GB de transferência de dados. Para tráfego pequeno-a-médio, é essencialmente gratuito. Para APIs de alto volume, o ponto de preço mais baixo da HTTP API se torna significativo.

Leo apontou para a lista de gatilhos do Lambda que ele tinha escrito antes. "Então o API Gateway não é apenas uma maneira de acionar o Lambda. É a coisa que faz o Lambda parecer uma API de verdade."

"A função Lambda lida com a lógica de negócio", disse Priya. "O API Gateway lida com tudo na frente dela — roteamento, autenticação, throttling, monitoramento. Cada um faz uma coisa."

"E se alguém tentar chamar o Lambda diretamente, contornando o API Gateway?"

"A política de execução do Lambda só permite invocações do API Gateway", disse Priya. "A política baseada em recurso do Lambda nega todo o resto."

A realidade: o serverless tem uma complexidade operacional própria — depurar funções Lambda distribuídas, gerenciar cold starts, entender limites de concorrência. Não é mais simples, apenas diferente.

"Espera — mas *por que* o serverless 'não é mais simples'?" perguntou Maya. "Todo o discurso é que ele remove o fardo operacional."

"Ele remove parte do fardo operacional", disse Leo. "Provisionamento de infraestrutura, patching, configuração de escalonamento — esses somem. O que resta é diferente: gerenciamento de cold start, tracing distribuído entre funções nas quais você não pode dar SSH, limites de concorrência, gerenciar versões e aliases de função, entender como as atualizações de Layer se propagam, lidar com timeouts de 15 minutos com elegância."

"Então o fardo muda", disse Priya. "De operações de infraestrutura para operações de função."

"Sim. Para muitas cargas de trabalho — especialmente as orientadas a eventos, pequenas e irregulares — essa é uma troca melhor. Para um servidor de aplicação de longa duração com o qual os engenheiros precisam interagir e depurar, o EC2 ou contêineres frequentemente continuam sendo a escolha certa."

Você pode estar se perguntando: o serverless é o futuro, e tudo deveria eventualmente migrar para o Lambda? A resposta honesta é que depende da carga de trabalho. O serverless dominou o processamento orientado a eventos. Fez incursões significativas em APIs HTTP (via API Gateway + Lambda). Ele não substituiu os servidores de aplicação sempre ligados, o processamento em lote de longa duração ou os serviços com estado — e provavelmente não substituirá, porque esses casos de uso não se beneficiam do modelo do Lambda. A pergunta da ferramenta certa nunca vai embora; ela apenas se aplica a opções diferentes ao longo do tempo.

## Pontos Fortes e Limitações

**Por que o Lambda é poderoso**:

- Verdadeiro pagamento por uso — custo zero quando ocioso
- Escalonamento automático sem configuração
- Sem servidores para fazer patch ou manter
- Camada gratuita generosa (1 milhão de requisições por mês, gratuita para sempre)
- Integração estreita com o resto da AWS
- O RDS Proxy e as Lambda Layers abordam dois dos pontos de dor mais comuns do Lambda (pooling de conexões e compartilhamento de código) sem exigir mudanças arquiteturais

**Onde fica complicado**:

- Os cold starts são reais e exigem tratamento cuidadoso para cargas de trabalho sensíveis à latência
- O limite de execução de 15 minutos exclui tarefas de longa duração
- A depuração é mais difícil — não há servidor persistente no qual dar SSH
- O design sem estado exige externalizar todo o estado (banco de dados, cache, S3)
- Os limites de concorrência (padrão de 1.000 invocações concorrentes por conta) podem causar throttling em escala
- Funções Lambda conectadas a uma VPC têm latência adicional e problemas de cold start

**Monitorando o Lambda Sem SSH**

A primeira vez que algo quebrou em uma função Lambda, o instinto de Leo foi dar SSH e olhar o processo. Não há processo para dar SSH. Os ambientes de execução do Lambda são efêmeros e inacessíveis.

Depurar o Lambda exige aprender um conjunto de ferramentas diferente:

**CloudWatch Logs**: Toda invocação do Lambda escreve seu stdout/stderr em um Log Group do CloudWatch. Logging estruturado (formato JSON) torna esses logs filtráveis. Os campos mais úteis: nome da função, ID da invocação, duração, tipo de erro e seu correlation ID personalizado.

**CloudWatch Metrics**: O Lambda publica automaticamente as métricas Invocations, Duration, Errors, Throttles e ConcurrentExecutions. Configurar alarmes em Errors e Throttles deveria ser o dia um de qualquer implantação de Lambda.

**AWS X-Ray**: Tracing distribuído para o Lambda. Adiciona um pequeno overhead (2-5ms por invocação) mas dá a você um flame graph de onde o tempo é gasto dentro da função. Essencial para análise de cold start — o X-Ray mostra a fase de inicialização separadamente da fase de handler.

**Lambda Insights**: Monitoramento aprimorado para o Lambda, disponível via CloudWatch Lambda Insights. Adiciona uso de memória, tempo de CPU e duração de init às métricas padrão. Custa um pouco a mais mas vale a pena para funções de produção.

"E se alguém tentar invadir pelo ambiente de execução?" perguntou Priya. "As funções Lambda rodam em contêineres isolados, mas se uma dependência tem uma vulnerabilidade, um atacante poderia conseguir execução de código dentro do nosso Lambda?"

As mitigações: mantenha as dependências mínimas e atualizadas (a análise de cold start já tinha empurrado Leo a reduzir os tamanhos dos pacotes), use Lambda Layers para versionar bibliotecas compartilhadas e conceda à função de execução do Lambda as permissões mínimas necessárias. Se a função só pode escrever em um bucket S3 específico e consultar uma tabela DynamoDB específica, o raio de impacto de uma função comprometida é limitado a exatamente isso.

"Privilégio mínimo para funções de execução do Lambda não é opcional", disse Priya. "É o que limita o dano quando algo dá errado."

Ela estava certa. E como a maioria dos conselhos de segurança, também era simplesmente boa engenharia.

## Resumo

A arquitetura SQS/SNS do capítulo 19 separou as preocupações de aceitar trabalho e de processá-lo. O Lambda leva isso adiante: ele separa as preocupações de processar trabalho e de pagar pela capacidade de fazê-lo.

- O **AWS Lambda** roda código em resposta a eventos sem gerenciar servidores.
- **Pagamento por uso**: cobrado por invocação e por 1 ms de execução (arredondado para cima). Custo zero quando ocioso.
- Escala automaticamente de 0 a milhares de invocações concorrentes.
- **Cold starts**: latência de inicialização quando não existe um ambiente de execução aquecido. Mitigado com provisioned concurrency ou runtimes leves.
- **Lambda Layers**: pacotes de código compartilhados que múltiplas funções podem referenciar, reduzindo duplicação e tamanho de pacote.
- **RDS Proxy**: resolve o problema de exaustão de conexões do Lambda mantendo um pool de conexões de banco de dados persistente entre o Lambda e o RDS.
- **Monitoramento**: use CloudWatch Logs, Metrics, tracing do X-Ray e Lambda Insights — não há servidor no qual dar SSH.
- Melhor para: cargas de trabalho orientadas a eventos, de curta duração, irregulares ou infrequentes.
- Não ideal para: tarefas de longa duração (limite rígido de 15 minutos), aplicações com estado, APIs de alto throughput e baixa latência sem provisioned concurrency.
- **Serverless** é uma filosofia de design — você gerencia código, não infraestrutura. A complexidade operacional muda, não desaparece.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Lambda + S3**: Padrão clássico — arquivo carregado no S3 aciona o Lambda para processamento (geração de thumbnail, varredura de vírus, transformação de dados). Nenhum servidor necessário.
- **Lambda + SQS**: O Lambda faz polling do SQS e processa lotes. O SQS fornece o mecanismo de repetição/DLQ. O Lambda fornece o processamento.
- **Lambda + API Gateway**: API HTTP serverless. O API Gateway lida com roteamento, autenticação, throttling. O Lambda lida com a lógica de negócio.
- **Tipos de API Gateway:** REST API = recursos completos, transformação de requisição, cache, planos de uso. HTTP API = mais simples, mais barata, apenas OIDC/OAuth. WebSocket API = conexões bidirecionais persistentes. **Autorização:** autorizador Cognito = validar JWT do Cognito nativamente. Autorizador Lambda = lógica de validação de token personalizada. Chave de API = limitação de taxa por cliente (não autenticação). Gatilho do exame: "REST API serverless" → API Gateway + Lambda.
- **Sinais de cold start**: "picos de latência na primeira requisição", "tempos de resposta inconsistentes" → cold start. Solução: provisioned concurrency (custa dinheiro), pacote menor, runtime mais leve.
- **Limites de execução**: máximo de 15 minutos. Máximo de 10GB de memória. 512MB de armazenamento efêmero /tmp por padrão (configurável até 10GB). Esses limites aparecem em cenários de exame.
- **Erros de timeout do Lambda são silenciosos**: Se uma função Lambda expira, ela produz um erro no CloudWatch mas nenhuma resposta de erro em nível de aplicação. Monitore explicitamente os erros de Timeout do Lambda no CloudWatch. Foi assim que o gerador de relatório de 17 minutos de Leo falhou na sua primeira noite sem qualquer alarme em nível de aplicação.
- **Cold starts de Lambda em VPC**: Funções Lambda dentro de uma VPC têm latência de cold start adicional (provisionamento de ENI). A AWS melhorou isso significativamente com as Hyperplane ENIs, mas os cold starts de Lambda em VPC ainda são mais lentos que os de fora da VPC. Evite VPC para funções Lambda que não precisam de recursos da VPC (ou seja, que não se conectam a RDS, ElastiCache ou outros recursos exclusivos de VPC).
- **Concorrência do Lambda**: Padrão de 1.000 execuções concorrentes por conta (pode ser aumentado). **Concorrência reservada**: garantir que uma função obtenha um número específico de execuções; previne que outras funções as consumam. **Provisioned concurrency**: pré-aquecer um número de ambientes de execução.
- **Event source mapping**: O recurso do Lambda que conecta SQS/DynamoDB Streams/Kinesis ao Lambda. O Lambda faz polling da fonte e agrupa os registros em lotes.
- **Atingindo limites de conta**: "a aplicação está sofrendo throttling / LimitExceeded à medida que escala" → verifique o limite no **Service Quotas** e solicite um aumento lá (muitas cotas, como a concorrência do Lambda, são ajustáveis; algumas são limites rígidos).
- **RDS Proxy**: Sinal do exame: "funções Lambda causando muitas conexões de banco de dados", "exaustão do pool de conexões com Lambda" → o RDS Proxy mantém conexões persistentes e multiplexa as conexões de curta duração do Lambda.
- **Lambda Layers**: Sinal do exame: "compartilhar código entre múltiplas funções Lambda", "reduzir o tamanho do pacote de implantação" → Lambda Layers.
- **Lambda + X-Ray**: Tracing distribuído para o Lambda. Cenário do exame: "rastrear requisições entre múltiplas funções Lambda e serviços" → habilite o tracing do X-Ray no Lambda.
- **Lambda Destinations:** Para invocações assíncronas do Lambda, você pode configurar um Destination tanto para resultados de sucesso quanto de falha. Envie resultados bem-sucedidos para SQS, SNS, EventBridge ou outra função Lambda. Envie falhas para SQS ou SNS para alertas. Esta é a alternativa preferida às DLQs para invocações assíncronas porque captura tanto sucesso quanto falha, não apenas falha. Sinal do exame: "rotear resultados bem-sucedidos do Lambda para outro serviço" ou "capturar resultados de sucesso e falha de Lambda assíncrono" → Lambda Destinations. "Capturar apenas mensagens com falha para invocação assíncrona" → a DLQ ainda é válida mas Destinations é a solução mais completa.

## Exercícios

**Exercício 1 — Recordar**

Explique o problema do cold start. Em que tipo de aplicação os cold starts seriam mais problemáticos? Em que tipo eles seriam aceitáveis?

*(Dica: Compare uma API em tempo real (usuário esperando por uma resposta) com um job assíncrono em segundo plano (usuário já recebeu sua confirmação e está fazendo outras coisas).)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa recebe imagens de produtos de seus fornecedores via um bucket S3. Cada imagem precisa ser redimensionada para quatro dimensões padrão (thumbnail, pequena, média, grande) e armazenada de volta no S3. O volume é imprevisível — alguns dias 10 imagens, alguns dias 100.000. O processamento deve se completar em até 10 minutos por imagem. O custo deve ser minimizado.

Qual arquitetura MELHOR atende a esses requisitos?

A) Instâncias EC2 em um Auto Scaling Group monitorando o bucket S3 com long polling  
B) Uma instância EC2 dedicada com um cron job que verifica o S3 a cada minuto em busca de novas imagens  
C) Tarefas ECS Fargate acionadas por uma fila SQS, com eventos do S3 publicando na fila  
D) Notificação de evento do S3 acionando uma função Lambda que redimensiona as imagens e armazena os resultados no S3

**Dica 1**: Volume imprevisível favorece o escalonamento até zero. Qual opção faz isso?

**Dica 2**: 10 minutos por imagem está dentro do limite de 15 minutos do Lambda. Verifique se o trabalho de redimensionamento de imagem cabe nas restrições do Lambda.

**Dica 3**: Uma instância EC2 dedicada rodando 24 horas por dia é cara e não escala.

**Resposta**: D

**Explicação**: As notificações de evento do S3 acionam o Lambda quando uma imagem é carregada. O Lambda redimensiona a imagem para quatro dimensões e armazena os resultados no S3. O Lambda escala de 0 a milhares de invocações concorrentes automaticamente, lidando com o volume imprevisível sem pré-provisionamento. Custo zero quando nenhuma imagem está sendo processada.

**Por que não A?** O EC2 em um ASG não escala até zero — no mínimo uma instância sempre rodando. Long polling do S3 não é um mecanismo de evento nativo do S3. Custo mais alto que o Lambda para cargas de trabalho irregulares.

**Por que não B?** Uma instância EC2 dedicada é um ponto único de falha, não escala, roda 24 horas por dia, e uma abordagem baseada em cron tem até 60 segundos de atraso de detecção.

**Por que não C?** O ECS Fargate funciona, mas é mais complexo (exige gerenciamento de contêineres, ECR, definições de tarefa) e a inicialização de tarefa do Fargate leva de dezenas de segundos a minutos — bem mais lenta que um cold start do Lambda — tornando-o um encaixe ruim para trabalho irregular e orientado a eventos. O Lambda é mais simples para esse caso de uso.

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer gerar um relatório diário às 5 da manhã com os 10 principais restaurantes do dia anterior por volume de pedidos. O relatório é gerado a partir de dados do DynamoDB, formatado como PDF, armazenado no S3 e enviado por e-mail a todos os parceiros de restaurante.

Projete o pipeline completo baseado em Lambda para isso. O que aciona o Lambda? O que acontece se a geração do PDF levar 12 minutos? E se houver 5.000 parceiros de restaurante e enviar e-mail para todos eles levar tempo? Você usaria um Lambda ou múltiplos?

Considere também: e se o Lambda expirar após 14 minutos, tendo processado 4.500 de 5.000 e-mails de restaurante? Como você evita enviar e-mails duplicados quando o Lambda é repetido? Quais permissões IAM esse Lambda precisa, e qual é o conjunto mínimo necessário?

*(Não há uma resposta única correta. O objetivo é praticar a composição do Lambda com outros serviços.)*

## Cena Pós-Créditos

Tom revisou a conta no final do mês.

O serviço de e-mail: tinha sumido da conta de EC2.
O job de redimensionamento de imagens: sumiu.
A tarefa de limpeza noturna: sumiu.
O relatório de analytics diário: sumiu. (O gerador de relatório tinha sido movido para o ECS Fargate depois do incidente do timeout de 17 minutos, mas o custo de computação do Lambda era zero porque agora ele era orquestrado de forma diferente.)

Cobranças totais do Lambda no mês: US$ 5,47.

"Cinco dólares", disse Tom.

"E quarenta e sete centavos", acrescentou Leo prestativamente.

Tom olhou a conta do mês anterior, quando aqueles serviços estavam todos em instâncias EC2.

"Estávamos pagando US$ 187 por essas mesmas cargas de trabalho."

"O Lambda não cobra por tempo ocioso", disse Leo. "E a maioria desses serviços ficava ociosa 90% do tempo."

Tom abriu os gráficos do CloudWatch mais uma vez. O Lambda do serviço de e-mail tinha sido invocado 36.412 vezes. Duração total: cerca de 18.200 GB-segundos. A US$ 0,0000166667 por GB-segundo: US$ 0,30 — e mesmo isso era nocional, já que 18.200 GB-segundos cabiam confortavelmente dentro dos 400.000 GB-segundos de duração sempre gratuita. O item de linha real era zero.

"A instância EC2 era US$ 18 por mês", disse Tom. "Gastamos trinta centavos — e isso é eu ignorando a camada gratuita, então sabemos o custo unitário real. A conta diz zero."

"A maior parte dos US$ 5,47 foi a provisioned concurrency no Lambda de notificação — esse cobra rode ou não. O redimensionador de imagens, a tarefa de limpeza e o resto cabem dentro da camada gratuita."

Tom encarou a tela por um longo tempo.

"Retiro tudo o que disse sobre serverless ser uma palavra de hype", disse ele.

"Você nunca disse isso", disse Leo.

"Eu pensei bem alto."

No próximo capítulo: o contêiner de carga que faz qualquer servidor parecer um lar.
