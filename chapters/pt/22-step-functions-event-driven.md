# Capítulo 22: O Fluxograma Que Se Executa Sozinho

Leo estava encarando o mesmo arquivo de log havia uma hora. Os stack traces eram claros o suficiente individualmente, mas o padrão entre eles — a forma como um passo falhava silenciosamente e o próximo passo rodava mesmo assim — tinha levado um tempo para ele enxergar. Ele finalmente se recostou, pousou o café e escreveu uma única palavra em seu bloco de notas: *coordenação*.

Imagine um maestro saindo do pódio no meio de uma apresentação. A orquestra continua tocando — mas não há ninguém para fazer os metais entrarem no compasso 47, ninguém para sinalizar o silêncio antes do final. Os músicos individuais tocam suas partes corretamente. A apresentação ainda assim desmorona, porque as partes dependem de uma coordenação que ninguém está gerenciando.

Esse é o problema que Leo tinha encontrado no código de confirmação de pedidos. Não um bug em nenhum passo individual. Uma falha de coordenação.

---

Os contêineres estavam rodando corretamente e implantando de forma limpa. O pipeline de implantação do ECS estava sólido. Mas dentro do código da aplicação, um tipo diferente de falha vinha se acumulando havia semanas. Os contêineres estavam bem. A lógica dentro de um deles não estava.

Leo vinha acompanhando o padrão nos logs mas não o tinha entendido até contar as ocorrências.

Onze vezes. Em duas semanas.

---

Uma confirmação de pedido na Nimbus exigia que cinco coisas acontecessem em sequência: cobrar o cartão, enviar o e-mail de confirmação, notificar o restaurante, atualizar o estoque e registrar a transação para a contabilidade.

Quando Leo tinha escrito a função original de confirmação de pedidos, ele tinha envolvido tudo em um único bloco `try/except` e dito "vai ficar tudo bem — vamos capturar os erros nos logs". Isso foi há oito meses.

Não ficou tudo bem.

Se o passo três falhasse — se a notificação do restaurante expirasse — os passos um e dois já tinham acontecido. O cliente foi cobrado. O e-mail foi enviado. Mas o restaurante não sabia que o pedido existia.

Leo tinha um nome para essa categoria de bug: o sucesso parcial. "Tudo funcionou", disse ele, "exceto a parte que importava."

"Quantas vezes isso aconteceu?" perguntou Maya.

"Onze vezes nas últimas duas semanas. Pegamos a maioria delas por ligações furiosas ao restaurante. Duas encontramos nos logs, depois do ocorrido."

"Então não temos coordenação", disse Priya. "Cinco passos, rodando como um script, sem garantia de que todos se completem. E se alguém tentar invadir durante o passo dois — depois de a cobrança passar mas antes de o restaurante ser notificado? Já cobramos o cliente por um pedido que o restaurante não tem."

"Ou de que eles se completem na ordem certa."

"Ou de que saibamos qual falhou."

Leo abriu o código no projetor. Era uma função Python: cinquenta linhas, cinco chamadas de API sequenciais, um único bloco try/except em torno de tudo.

"Precisamos de um workflow", disse Maya. "Algo que rastreie cada passo. Espera — mas *por que* não podemos simplesmente adicionar um tratamento de erros melhor à função Python existente? Por que precisamos de um serviço totalmente novo?"

"Porque um tratamento de erros melhor ainda roda em um único processo que pode falhar em qualquer ponto", disse Leo. "Se o servidor reiniciar no meio da execução, o tratamento de erros reinicia com ele. O Step Functions persiste o estado externamente."

Pense em um checklist de manufatura — um em que cada estação confirma a conclusão antes de passar para a próxima, e em que toda a linha mantém sua posição quando algo falha. A linha não reinicia desde o começo. Ela retoma exatamente da estação que falhou. O estado dessa estação está registrado. Os passos antes dela estão feitos e não são repetidos. Os passos depois dela esperam até o problema ser resolvido.

Era isso que o fluxo de confirmação de pedidos precisava. Não mais código em torno do problema. Um sistema projetado para gerenciar o problema.

**AWS Step Functions: Orquestrando Workflows**

O **AWS Step Functions** é um serviço de orquestração serverless que coordena os passos de uma aplicação como um workflow visual. Cada passo é um **estado** em uma **máquina de estados (state machine)**.

Em vez de um script Python que roda de cima para baixo e trava, você define o workflow como uma máquina de estados em JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Cada estado pode:

- **Executar uma função Lambda** (o padrão mais comum)
- **Executar uma tarefa ECS** (para trabalho de maior duração)
- **Esperar por um horário específico** ou **evento** (pausar o workflow até que algo externo aconteça)
- **Escolher um caminho** com base em condições (lógica if/else)
- **Rodar ramificações paralelas** simultaneamente
- **Tentar novamente em caso de falha** com backoff configurável
- **Capturar erros** e roteá-los para estados de tratamento de erros

O Step Functions gerencia o estado da execução de forma durável. Se o passo 3 falha, a execução pausa no passo 3. Você pode inspecionar a execução com falha no console, corrigir o problema e reiniciar a partir do passo 3 — sem repetir os passos 1 e 2.

Você pode estar se perguntando: você não pode simplesmente escrever a lógica de repetição na sua função Lambda? Sim — mas então você também está escrevendo rastreamento de falhas, persistência de estado e logging de auditoria em código. E quando o passo 3 de 7 falha, você precisa saber qual restaurante estava sendo processado, o que aconteceu antes e onde retomar. O Step Functions faz tudo isso.

**O Fluxo de Pedidos da Nimbus: Máquina de Estados Anotada**

Aqui está uma versão simplificada da máquina de estados real do Step Functions que a Nimbus construiu para a confirmação de pedidos — anotada para que você possa ver o que cada parte faz:

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Algumas coisas para notar:

**`ChargeCard` tem duas cláusulas Catch.** Uma para `PaymentDeclinedError` (uma falha conhecida e esperada — o cartão foi recusado, não um erro de sistema) e uma para `States.ALL` (qualquer outra coisa — uma interrupção de sistema, um timeout, uma exceção inesperada). Elas roteiam para estados diferentes porque significam coisas diferentes.

**`NotifyRestaurant` tem um Catch que roteia para `RestaurantNotificationFailed`.** Este é o bug que causou os onze incidentes. No script Python antigo, não havia equivalente — se a notificação falhava, a função ou travava silenciosamente ou registrava um erro e continuava. O Step Functions torna o caminho de falha explícito: ele vai para algum lugar específico, e esse algum lugar alerta a equipe de suporte antes que alguém tenha de ligar.

**Toda Task tem Retry.** Se o serviço de e-mail tem um timeout transitório, ele tenta novamente automaticamente, três vezes, com backoff crescente. O cliente nunca vê isso. O pedido não é perdido.

**O fluxo é um grafo, não um script.** Se `NotifyRestaurant` falha permanentemente (depois das tentativas), a execução não continua para `UpdateInventory`. O workflow para em `RestaurantNotificationFailed`. O estoque não é atualizado para um restaurante que não sabe do pedido. Este é o comportamento correto.

"Espera — mas *por que* precisamos de caminhos de falha separados para cartão recusado vs erro de sistema?" perguntou Maya.

"Porque eles exigem respostas completamente diferentes", disse Leo. "Um cartão recusado significa que mandamos um e-mail ao cliente e pedimos para ele tentar de novo. Um erro de sistema na função de cobrança significa que precisamos de um engenheiro para investigar por que a função Lambda está falhando. O mesmo resultado observável — o pedido não passou — mas remediação completamente diferente."

**Tipos de Estado: Os Blocos de Construção**

**Task**: Executar uma ação — chamar uma função Lambda, iniciar uma tarefa ECS, chamar uma API. É aqui que o trabalho real acontece.

**Choice**: Ramificar com base em condições nos dados de entrada. Como um if/else no código.

**Parallel**: Rodar múltiplas ramificações simultaneamente e esperar que todas se completem.

**Map**: Aplicar um conjunto de estados a cada item de uma lista. Processar 50 itens de cardápio de restaurante em paralelo.

Quando a Nimbus importava o cardápio de um restaurante, o cardápio podia conter de 8 a 200 itens. Para cada item, o processo de importação precisava: validar o formato, verificar dados de alérgenos, redimensionar a foto e escrever o registro no DynamoDB.

Sem o estado Map, isso seria um único Lambda processando itens sequencialmente — 200 itens × 200ms por item = 40 segundos de tempo de processamento. Com o estado Map, o Step Functions lança execuções concorrentes dos estados de processamento — até o limite de concorrência configurado — e espera que todas elas se completem. Os mesmos 200 itens podem terminar em menos de 5 segundos.

**Wait**: Pausar por um tempo especificado ou até um timestamp. Útil para atrasos agendados.

**Pass**: Passar a entrada para a saída sem fazer trabalho. Usado para transformação de dados e testes.

**Succeed/Fail**: Estados terminais que encerram a execução.

Para o onboarding de restaurantes, Leo projetou um workflow:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, com 3 tentativas)
3. Ramificação paralela:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, espera a paralela se completar)
5. NotifySalesTeam (Task → Lambda)

Os passos 3a e 3b rodam em paralelo — eles não dependem um do outro, e rodá-los simultaneamente economiza tempo.

Depois que a primeira leva de restaurantes completou o onboarding, surgiu um requisito de conformidade: antes de um parceiro de restaurante poder entrar no ar, um gerente de contas da Nimbus tinha de revisar e aprovar manualmente a documentação da licença. Isso podia levar de um a três dias úteis.

"E se alguém tentar invadir durante essa janela?" perguntou Priya. "Se o restaurante está parcialmente configurado — conta de pagamento criada mas ainda não aprovada — e alguém descobre o estado pendente, poderia tentar explorar a configuração semiaberta."

Mais praticamente: como você pausa um workflow do Step Functions por três dias esperando por um humano?

A resposta é o **padrão de callback com um task token**.

Quando `ValidateLicense` roda, em vez de se completar automaticamente, ele chama um Lambda que faz três coisas:

1. Envia um e-mail ao gerente de contas com os documentos do restaurante
2. Registra um **task token** (um identificador único que o Step Functions gera para esta execução e este estado específicos) em um banco de dados, associado àquela revisão pendente
3. Retorna ao Step Functions com `.waitForTaskToken` — que diz ao Step Functions para pausar a execução neste estado indefinidamente

O Step Functions estaciona a execução. Nada mais é bloqueado — nenhum servidor fica esperando. A máquina de estados apenas espera, sem consumir recursos de computação.

Três dias depois, o gerente de contas clica em "Aprovar" na ferramenta de administração interna. A ferramenta de administração busca o task token no banco de dados e chama:

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

O Step Functions retoma. A execução continua a partir do passo 2 (`ImportMenu`), com a informação do revisor disponível no estado do workflow.

"A execução ficou pausada por três dias", disse Leo, "e a única coisa que aconteceu quando eu a aprovei foi uma chamada de API."

"E se o gerente de contas a rejeitar?" perguntou Maya.

"Chamamos `send_task_failure` em vez disso. A máquina de estados captura isso e roteia para um estado `NotifyRejection` que manda um e-mail ao parceiro de restaurante."

O Step Functions não faz polling. Não tenta novamente. Não expira (a menos que você configure um timeout de heartbeat). Ele simplesmente espera até o callback chegar, depois continua. Isso é fundamentalmente diferente de fazer polling em um banco de dados ou uma fila — e é por isso que o Step Functions é bem adequado para workflows que misturam passos automatizados e manuais.

**Lendo o Console de Execução: Como É uma Falha**

Quando o Lambda de notificação do restaurante expirou durante a primeira semana da Nimbus no Step Functions, Leo abriu o console do Step Functions e clicou na execução com falha.

O **Histórico de Eventos de Execução (Execution Event History)** mostrou uma linha do tempo de exatamente o que aconteceu:

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

Em 42 segundos, o Step Functions tinha cobrado o cartão, enviado o e-mail, tentado a notificação do restaurante três vezes, capturado a falha, alertado a equipe de suporte e registrado o histórico completo. Antes do Step Functions, essa falha teria sido invisível — a função Python teria registrado "notification failed" e retornado 200 ao chamador como se nada estivesse errado.

"A linha do tempo mostra exatamente onde as coisas deram errado e quando", disse Leo. "E cada tentativa de repetição tem timestamp. Você pode ver os intervalos de backoff."

Priya olhou o console. "E esse histórico é armazenado por quanto tempo?"

O histórico de execução de workflows Standard é armazenado por 90 dias. Para conformidade ou auditoria de longo prazo, os eventos de execução também podem ser exportados para o CloudWatch Logs e retidos indefinidamente.

**Workflows Standard vs Express**

O Step Functions oferece dois tipos de workflow:

**Workflows Standard**:

- Duração máxima: 1 ano
- As execuções são duráveis — o estado é persistido, pode ser inspecionado e auditado
- Execução exatamente-uma-vez (uma tarefa nunca é rodada mais de uma vez a menos que você configure um Retry)
- Cobrado por transição de estado
- Melhor para workflows de longa duração e importantes (processamento de pedidos, onboarding, fluxos de pagamento)

**Workflows Express**:

- Duração máxima: 5 minutos
- Throughput mais alto — até 100.000 por segundo
- Execução pelo-menos-uma-vez (assíncrona) ou no-máximo-uma-vez (síncrona) — projete as tarefas para serem idempotentes
- Cobrado por duração (como o Lambda)
- Melhor para workflows de alto volume e curta duração (processamento de eventos em tempo real, ingestão de dados de IoT)

"Quanto isso custa por mês?" perguntou Tom, abrindo a página de preços. "Por transição de estado para o Standard — isso soma se você tem muitos passos."

Leo percorreu a conta. Para o workflow de onboarding de restaurantes (seis estados de task por execução, cerca de 12-15 novos restaurantes por mês): menos de cem transições de estado — menos de um centavo, e inteiramente dentro da camada gratuita mensal de 4.000 transições, então efetivamente US$ 0. Para o workflow de confirmação de pedidos no tráfego total da Nimbus: mais significativo, mas ainda bem abaixo do custo de depurar onze sucessos parciais por mês manualmente.

"O tempo de depuração é o custo oculto", disse Leo.

"Esse é sempre o custo oculto", disse Tom.

Tom calculou os números com mais cuidado, porque era assim que Tom era.

**Custo do workflow Standard para o fluxo de confirmação de pedidos da Nimbus**: cinco estados por pedido no caminho feliz, a US$ 0,000025 por transição de estado. Cinco transições de estado × US$ 0,000025 × 15.000 pedidos por mês = **US$ 1,88/mês**. A dez vezes o volume de pedidos: cerca de US$ 19/mês. O custo de depuração de um incidente de sucesso parcial (24 minutos de tempo de um engenheiro de suporte) excedia a conta mensal do Step Functions muitas vezes.

A comparação se torna importante se alguém sugerir usar workflows Standard para eventos de analytics de alta frequência. Suponha que a Nimbus quisesse usar o Step Functions para processar cada evento bruto de clickstream — cada visualização de página de cardápio, cada scroll, cada busca. São aproximadamente 800.000 eventos por dia na escala atual. Um workflow Standard de cinco estados para cada evento: 800.000 × 5 × US$ 0,000025 × 30 dias = **US$ 3.000/mês**. Isso é dinheiro de verdade para um pipeline de analytics.

Workflows Express para esse mesmo volume: cobrados por requisição mais duração, não por transição de estado. As 24 milhões de execuções mensais custam US$ 1,00 por milhão de requisições = US$ 24. Duração: 24M × 500ms no mínimo de cobrança de 64MB ≈ 208 GB-horas × US$ 0,06 = US$ 12,50. Total ≈ **US$ 36,50/mês** — quase duas ordens de magnitude mais barato que os US$ 3.000 do Standard.

"Então o tipo de workflow não é apenas uma decisão arquitetural", disse Tom. "É uma decisão de custo. O mesmo número de estados pode custar quase cem vezes mais dependendo de qual tipo de workflow você usa."

"E qual é melhor depende inteiramente do que o workflow faz", disse Leo. "Confirmação de pedidos: Standard. É importante, tem caminhos de falha significativos, queremos a trilha de auditoria. Processamento de eventos de analytics: Express. É de alto volume, curta duração, e não precisamos de histórico de execução de 90 dias para cada visualização de página."

Se o seu processo tem dois passos e não precisa de uma trilha de auditoria, uma função Lambda simples é mais barata e não exige a sintaxe de máquina de estados em JSON — mas se qualquer passo pode falhar independentemente e precisa ser repetido ou reiniciado sem repetir os passos anteriores, o Step Functions se paga em depuração reduzida e remediação manual.

Para o onboarding de restaurantes da Nimbus: Standard (é importante, durável, pode levar horas se passos manuais estiverem envolvidos).

Para as atualizações de status de pedidos em tempo real da Nimbus: Express (alto volume, curta duração, menos crítico).

**Arquitetura Orientada a Eventos: O Quadro Maior**

O Step Functions é uma peça de um padrão maior: a **arquitetura orientada a eventos**. Em vez de os serviços chamarem uns aos outros diretamente (acoplamento forte), os serviços emitem eventos, e outros serviços reagem a esses eventos.

Vimos isso ao longo do livro:

- Pedidos feitos → o SNS publica o evento → as filas SQS entregam aos consumidores
- Arquivo carregado no S3 → o Lambda é acionado para processá-lo
- Registro do DynamoDB alterado → DynamoDB Streams → o Lambda atualiza um cache

O **Amazon EventBridge** (anteriormente CloudWatch Events) é o barramento de eventos avançado para esse padrão. Ele roteia eventos de serviços da AWS e de suas próprias aplicações para destinos (Lambda, SQS, Step Functions, etc.) com base em regras.

O EventBridge permite o acoplamento fraco em nível arquitetural: o serviço de pedidos publica eventos `order.placed` sem saber quem está escutando. O serviço de analytics, o serviço de notificação e o serviço de pontos de fidelidade todos escutam de forma independente. Adicionar um novo ouvinte não exige mudar o serviço de pedidos.

O EventBridge também se integra nativamente com dezenas de serviços da AWS como **fontes de eventos**. Quando uma chamada de API do CloudTrail corresponde a um padrão, o EventBridge pode disparar uma regra. Quando uma instância EC2 muda de estado, o EventBridge pode acionar um Lambda. Quando uma instância RDS faz failover, o EventBridge pode alertar o engenheiro de plantão. Você pode tratar todo o control plane da AWS como um fluxo de eventos.

Para a Nimbus, uma regra do EventBridge particularmente útil: acionar um Lambda sempre que uma nova imagem é enviada ao ECR. O Lambda verifica o resultado da varredura da imagem e posta no canal do Slack de engenharia se algum CVE HIGH ou CRITICAL for encontrado — antes que alguém implante a imagem. Isso combina a varredura de segurança do ECR (do capítulo 21) com o roteamento de eventos do EventBridge em um portão de segurança automatizado.

O princípio da arquitetura orientada a eventos é o mesmo da lógica de repetição do Step Functions: tornar a falha explícita e roteada, não silenciosa e engolida. Os serviços que se comunicam por eventos falham com elegância — se o Lambda de pontos de fidelidade está fora do ar quando um evento `OrderConfirmed` dispara, o EventBridge pode tentar a entrega novamente ou enviar para uma dead-letter queue. A própria confirmação do pedido não é afetada. O desacoplamento é a resiliência.

**EventBridge: Desacoplando Efeitos Colaterais do Fluxo Principal**

Depois que a máquina de estados de confirmação de pedidos estava rodando de forma limpa, Maya levantou uma questão na revisão de arquitetura seguinte.

"Queremos adicionar pontos de fidelidade quando um pedido é confirmado. O cliente ganha um ponto por dólar gasto. Onde isso entra na máquina de estados?"

O primeiro instinto de Leo: adicionar um estado `GrantLoyaltyPoints` depois de `LogTransaction`.

A resposta de Priya: "E quando adicionarmos bônus de indicação? E pesquisas pós-pedido? E pedidos de avaliação de restaurante? Cada um adiciona um estado ao caminho crítico. Se o Lambda de pontos de fidelidade falha, toda a confirmação do pedido falha."

"O fluxo de confirmação de pedidos deveria fazer uma coisa", disse ela. "Confirmar o pedido. Todo o resto é um efeito colateral."

Este é o argumento arquitetural para o **Amazon EventBridge** como o mecanismo para desacoplar efeitos colaterais do workflow principal.

A abordagem revisada: quando o estado `LogTransaction` se completa com sucesso, o Lambda publica um evento no EventBridge:

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Então as regras do EventBridge roteiam esse evento para destinos independentes:

- **Regra 1**: `OrderConfirmed` → Lambda de Pontos de Fidelidade (concede 32 pontos para um pedido de US$ 32)
- **Regra 2**: `OrderConfirmed` → Lambda de Pesquisa Pós-Pedido (enfileira uma pesquisa para 2 horas após a entrega)
- **Regra 3**: `OrderConfirmed` → Kinesis Stream de Analytics (alimenta o painel em tempo real)

Cada regra é independente. O Lambda de Pontos de Fidelidade pode falhar sem afetar a fila de pesquisas. O pipeline de analytics pode ficar para trás sem bloquear o sistema de fidelidade. Adicionar um novo efeito colateral (um pedido de avaliação de restaurante, uma notificação de cashback) exige criar uma nova regra do EventBridge — não modificar a máquina de estados.

"E se alguém tentar invadir por uma regra do EventBridge?" perguntou Priya. "Se o evento contém PII do cliente, todo Lambda que o recebe agora é um ponto de acesso a PII."

O evento foi projetado com cuidado: apenas os IDs, não os nomes, endereços ou detalhes de pagamento. Qualquer Lambda que precisasse de dados do cliente os buscaria do banco de dados usando o ID do cliente — com suas próprias permissões IAM controlando o que ele poderia acessar.

"O evento é um sinal", disse Priya. "Não um despejo de dados."

**Quando o Step Functions É a Ferramenta Certa**

O Step Functions se destaca quando você tem:

**Workflows de múltiplos passos** que precisam rastrear o progresso entre os passos

**Processos com humano no circuito (human-in-the-loop)** — o Step Functions pode esperar indefinidamente por um evento externo (como um humano aprovando algo) e então continuar

**Tratamento de erros em escala** — lógica embutida de repetição, captura e fallback entre muitos passos

**Processos auditáveis** — toda execução registra cada transição de estado. Você pode ver exatamente o que aconteceu e quando.

**Lógica paralela ou sequencial complexa** — o workflow visual torna mais fácil raciocinar sobre ela do que sobre código equivalente

O Step Functions é exagero para processos simples de dois passos. Use-o quando a própria coordenação é valiosa e os cenários de falha são importantes.

**Quando o Step Functions É a Ferramenta Errada**

"Espera — mas *por que* não usaríamos o Step Functions para tudo?" perguntou Maya ao final da sessão de design. "Construímos o workflow de onboarding de restaurantes. Temos o fluxo de confirmação de pedidos. Por que não converter tudo em máquinas de estados?"

A resposta honesta: porque o Step Functions adiciona overhead que nem todo workflow justifica.

**Processos simples de dois passos**: Se você tem um Lambda que processa um arquivo carregado chamando um segundo Lambda, o overhead de coordenação de uma máquina de estados não vale o benefício operacional. Dois Lambdas chamados sequencialmente dentro de uma única função é mais simples, mais fácil de testar e não tem custo por transição de estado.

**Workflows de ultra-alta frequência e sub-segundo**: Os workflows Standard têm um custo não trivial por transição de estado que se acumula em alto volume (como o exemplo de analytics acima mostrou). Os workflows Express resolvem o problema de custo mas não fornecem histórico de estado durável. Em frequência muito alta com duração muito curta, SQS mais Lambda (o padrão do capítulo 19) é mais simples e mais barato que qualquer tipo de Step Functions.

**Fan-out puro sem coordenação**: Se você precisa enviar o mesmo evento a vinte consumidores e não se importa com o resultado de cada um, o SNS é a ferramenta. O Step Functions adiciona rastreamento de estado de que você não precisa e pelo qual pagaria desnecessariamente.

**Interações síncronas em tempo real com o usuário**: As execuções do Step Functions são assíncronas. Se um usuário está esperando em uma tela de checkout por uma resposta síncrona em menos de 500ms, um workflow Standard do Step Functions não foi projetado para isso (os workflows Express podem ser invocados de forma síncrona, mas o overhead de latência ainda é maior que uma chamada Lambda direta). Para fluxos síncronos voltados ao usuário, Lambda + API Gateway com tratamento de erros bem projetado é frequentemente mais apropriado.

O princípio: use o Step Functions quando a *coordenação* dos passos é em si complexa — quando os passos podem falhar independentemente, quando você precisa repetir passos individuais sem repetir os anteriores, quando o histórico de execução tem valor de conformidade ou depuração, ou quando o workflow envolve passos de aprovação humana que podem levar dias. Não o use para adicionar overhead de orquestração a uma lógica sequencial simples que funciona bem como uma única função.

## Pontos Fortes e Limitações

**Por que o Step Functions é poderoso**:

- Histórico de execução visual — veja exatamente onde um workflow está (ou onde falhou)
- Repetição e tratamento de erros embutidos — sem código de repetição personalizado
- Estado durável — as execuções sobrevivem a reinícios e interrupções de serviço
- Integrações diretas com mais de 200 serviços da AWS (não apenas Lambda)
- O workflow visual é autodocumentado
- O padrão de callback permite espera indefinida por ações humanas sem consumir computação

**Onde fica complicado**:

- Os workflows Standard são cobrados por transição de estado — workflows complexos com muitos estados podem ficar caros em escala
- O formato JSON da ASL (Amazon States Language) tem uma curva de aprendizado
- O tamanho máximo do payload é de 256KB — dados grandes devem ser passados via referências do S3, não diretamente pelo workflow
- Workflows de longa duração com muitos passos manuais exigem configuração cuidadosa de timeout
- Depurar erros de ASL exige rodar execuções; não há um emulador local tão capaz quanto o serviço real
- As permissões IAM devem ser concedidas separadamente para cada recurso que a máquina de estados chama — esquecer uma permissão causa um erro confuso em tempo de execução

## Resumo

Os contêineres do capítulo 21 tornaram as implantações confiáveis. O Step Functions torna os processos de negócio de múltiplos passos confiáveis — o mesmo princípio de "eliminar o risco do handoff" aplicado à lógica da aplicação.

- O **Step Functions** orquestra workflows de múltiplos passos como máquinas de estados.
- Cada **estado** pode rodar uma função Lambda, executar uma tarefa ECS, esperar, ramificar ou rodar passos paralelos.
- **Retry e catch** são embutidos em cada estado — sem código de repetição personalizado necessário.
- **Workflows Standard**: longa duração (até 1 ano), duráveis, exatamente-uma-vez. Para processos de negócio críticos.
- **Workflows Express**: curta duração (até 5 minutos), alto throughput. Para processamento de eventos de alto volume.
- **Padrão de callback com task token**: pausar um workflow indefinidamente esperando por um evento externo ou ação humana; retomar com uma única chamada de API.
- **Estado Map**: processar uma lista de itens concorrentemente — substituir loops sequenciais por fan-out paralelo.
- **Integrações diretas de SDK**: chamar DynamoDB, S3, SQS e mais de 200 serviços da AWS diretamente de um estado, sem um wrapper Lambda.
- **EventBridge**: desacoplar efeitos colaterais do workflow principal — publicar um único evento, deixar regras independentes roteá-lo para serviços de pontos de fidelidade, analytics e pesquisa sem modificar a máquina de estados central.
- **Custo Standard vs Express**: o Standard a US$ 0,000025 por transição de estado funciona bem para workflows críticos de baixo volume (confirmação de pedidos a US$ 1,88/mês para a Nimbus). O Express, com preço por requisição mais duração, é apropriado para eventos de alta frequência onde o Standard custaria dezenas de vezes mais (~80x na conta de clickstream da Nimbus).
- A **arquitetura orientada a eventos** usa serviços como SNS, SQS, Lambda e EventBridge para desacoplar sistemas em torno de eventos em vez de chamadas diretas.
- Use o Step Functions quando a coordenação dos passos é em si complexa e quando a auditabilidade importa. Não o use para sequências simples de dois passos, workflows de ultra-alta frequência, fan-out puro ou fluxos síncronos voltados ao usuário.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Sinais de caso de uso do Step Functions**: "orquestrar múltiplas funções Lambda", "workflow com repetições e tratamento de erros", "passo de aprovação humana em um workflow automatizado", "trilha de auditoria de cada passo do workflow" → Step Functions.
- **Standard vs Express**: Standard para workflows de longa duração, auditáveis, críticos para o negócio. Express para processamento de eventos de alto throughput e curta duração.
- **SQS vs Step Functions**: SQS para filas de tarefas simples (produtor/consumidor). Step Functions para workflows de múltiplos passos com lógica complexa, repetições e rastreamento de estado.
- **Sinais do EventBridge**: "rotear eventos de serviços da AWS para destinos", "integração orientada a eventos entre serviços", "agendar uma função Lambda" → EventBridge (anteriormente CloudWatch Events).
- **Padrão de callback**: O Step Functions pode pausar a execução e esperar por um callback externo (um task token). O worker faz o callback quando termina. Útil para tarefas ECS de longa duração onde você não quer o limite de 15 minutos do Lambda.
- **Integrações diretas de SDK**: O Step Functions pode chamar serviços da AWS diretamente (DynamoDB, S3, SQS, etc.) sem passar pelo Lambda. Reduz custo e latência para chamadas de serviço simples. Por exemplo, escrever um registro de pedido no DynamoDB pode ser uma chamada direta de SDK a partir da máquina de estados sem uma função Lambda: `"Resource": "arn:aws:states:::dynamodb:putItem"`. Isso elimina o cold start do Lambda, o custo de execução do Lambda e o código que apenas chama `dynamodb.put_item(...)` e retorna.

## Exercícios

**Exercício 1 — Recordar**

Explique por que o Step Functions é útil para workflows de múltiplos passos. O que ele fornece que uma função Lambda simples chamando outras funções Lambda não fornece?

*(Dica: Pense no que acontece quando o passo 3 de 5 falha em cada abordagem. Como você sabe o que aconteceu? Como você repete apenas o passo 3?)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de serviços financeiros processa pedidos de empréstimo em múltiplos passos: verificação de crédito, verificação de renda, validação de documentos, revisão por subscritor (manual) e notificação da decisão. Cada passo pode levar de segundos (verificação de crédito) a dias (revisão por subscritor). A empresa precisa de uma trilha de auditoria completa de cada passo para conformidade. Passos automatizados com falha devem repetir automaticamente; passos manuais devem pausar e esperar por uma decisão humana.

Qual serviço MELHOR atende a esses requisitos?

A) Funções AWS Lambda encadeadas com filas SQS entre cada passo  
B) Workflows AWS Step Functions Standard com um padrão Wait for callback para o passo de revisão por subscritor  
C) Workflows AWS Step Functions Express para os passos automatizados e SQS FIFO para o passo manual  
D) Amazon EventBridge com regras de evento roteando entre funções Lambda para cada passo

**Dica 1**: Duração de "até dias" — qual tipo de Step Functions suporta isso?

**Dica 2**: "Esperar por uma decisão humana" — qual padrão do Step Functions é projetado para isso?

**Dica 3**: "Trilha de auditoria completa para conformidade" — qual serviço fornece histórico de estado por execução?

**Resposta**: B

**Explicação**: Os workflows Standard do Step Functions podem rodar por até 1 ano, suportando o passo de revisão por subscritor de dias de duração. O padrão Wait for callback pausa a execução no passo do subscritor com um task token; quando o subscritor toma uma decisão, ele faz o callback com o token para continuar o workflow. Os workflows Standard registram cada transição de estado — trilha de auditoria completa para conformidade.

**Por que não A?** O Lambda encadeado via SQS não fornece rastreamento de estado embutido nem trilha de auditoria. Os passos com falha exigem lógica de repetição personalizada. Reiniciar a partir de um passo específico com falha exige implementação personalizada.

**Por que não C?** Os workflows Express têm uma duração máxima de 5 minutos — incompatível com um passo que pode levar dias.

**Por que não D?** O EventBridge roteia eventos entre serviços mas não mantém o estado do workflow nem fornece repetição/auditoria embutidas. Construir isso apenas no EventBridge exige gerenciamento de estado personalizado.

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está construindo um processo de resolução de disputas de qualidade de comida. Quando um cliente relata uma experiência ruim:

1. O relato é validado automaticamente (verifica se o pedido existe, se é recente o suficiente)
2. O restaurante é notificado automaticamente
3. Um agente de suporte da Nimbus revisa a reclamação (passo manual — pode levar de 1 a 3 dias úteis)
4. Com base na decisão do agente: emitir reembolso (Lambda → processador de pagamento) OU enviar cupom de desculpas (Lambda → serviço de cupons) OU escalar para a gerência (sub-workflow do Step Functions)
5. O cliente é notificado do resultado

Projete isso como um workflow do Step Functions. Qual tipo de estado lida com cada passo? Como você lidaria com a espera de 1 a 3 dias? Como você modelaria a ramificação no passo 4?

*(Não há uma resposta única correta. O objetivo é praticar o design de estados do Step Functions.)*

**Extensão**: Depois que a máquina de estados se completa (qualquer que seja a ramificação), ela publica um evento `OrderDisputeResolved` no EventBridge. Quais efeitos colaterais poderiam escutar esse evento? Considere: o sistema de avaliação do restaurante, os pontos de fidelidade do cliente (reembolsos podem deduzir pontos), o pipeline de analytics (a taxa de disputas é uma métrica chave de qualidade do restaurante) e o painel de rastreamento de SLA da equipe de suporte ao cliente. Como usar o EventBridge aqui impede que a máquina de estados de disputas se torne uma aranha de dependências?

## Cena Pós-Créditos

O workflow de onboarding de restaurantes estava no ar.

Ao longo do mês seguinte, 12 novos parceiros de restaurante fizeram o onboarding. Dois tiveram falhas durante o passo de processamento de pagamento (passo 3). Em ambos os casos, o Step Functions capturou o erro exato, salvou o estado da execução e enviou um alerta à equipe da Nimbus.

Leo corrigiu a causa raiz (uma chave de API mal configurada para o provedor de pagamento) e repetiu ambas as execuções a partir do passo 3. As execuções se completaram em 23 segundos cada, retomando exatamente de onde tinham falhado.

Nenhum restaurante precisou ser reimportado. Nenhuma função IAM foi criada em dobro. Nenhum e-mail de boas-vindas duplicado foi enviado.

"Antes do Step Functions", Leo disse a Maya, "isso teria exigido que alguém rastreasse manualmente o que tinha e o que não tinha sido feito para cada restaurante, e reexecutasse manualmente os passos faltantes."

"E agora?"

"Agora eu clico em repetir no console. O sistema sabe o que está feito."

Maya pensou sobre isso.

"Isso não é apenas uma melhoria técnica", disse ela. "Essa é a diferença entre um processo que escala e um que não escala."

No próximo capítulo: o que fazer com dados que você não está acessando agora, mas que definitivamente quer guardar para sempre.
