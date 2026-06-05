# Capítulo 19: A Máquina de Senhas

A máquina de senhas foi uma revolução silenciosa. Tire um número, espere a vez. A fila tornou-se uma queue. As pessoas podiam sentar-se. O balcão de atendimento trabalhava ao seu próprio ritmo. Ninguém bloqueava ninguém.

Nimbus tinha um problema que não parecia um problema até as encomendas ficarem populares.

Cada vez que uma encomenda era feita, o servidor API tinha de:

1. Guardar a encomenda na base de dados
2. Enviar uma notificação para o tablet do restaurante
3. Enviar um e-mail de confirmação ao cliente
4. Actualizar o painel de análise do restaurante
5. Registar o evento para facturação

Tudo isto tinha de acontecer sincronamente antes de a API poder responder ao cliente. Se o serviço de e-mail estava lento (por vezes estava), o cliente esperava. Se o painel de análise estava em baixo (por vezes estava), a encomenda falhava.

"Estamos fortemente acoplados," disse Priya. "Se algum passo a jusante falhar, toda a encomenda falha."

"E se pudéssemos guardar a encomenda e imediatamente confirmar ao cliente," disse Leo, "e depois processar o resto em segundo plano?"

"Isso é uma queue," disse Priya.

**O Modelo do Balcão de Pronto-a-Comer**

Num movimentado balcão de pronto-a-comer, a pessoa na caixa não espera que o cortador termine de fatiar antes de passar para o próximo cliente. Recebem a encomenda, passam-na para a cozinha e começam a servir a próxima pessoa. A cozinha trabalha pelas encomendas ao seu próprio ritmo.

O cliente recebe um serviço mais rápido. A cozinha não é avassalada por rajadas repentinas. Se a cozinha tem um momento lento, as encomendas acumulam-se na queue em vez de causar erros na caixa.

Isto é **desacoplamento**: separar o componente que aceita trabalho dos componentes que o processam.

Em sistemas de software, a queue é frequentemente um message broker — um serviço que aceita mensagens de produtores e as entrega a consumidores.

**Amazon SQS: A Queue**

O **Amazon SQS (Simple Queue Service)** é o serviço de filas de mensagens gerido da AWS. Guarda mensagens duramente até serem processadas por um consumidor.

O fluxo básico:

1. **Produtor** (o servidor API) coloca uma mensagem na queue: `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. A API responde imediatamente ao cliente: "Encomenda confirmada!"
3. **Consumidores** (serviços de trabalhador separados) lêem mensagens da queue e processam-nas: enviar a notificação do restaurante, enviar o e-mail de confirmação, actualizar análises

A experiência do cliente: confirmação instantânea. O processamento a jusante: acontece assincronamente, ao ritmo dos trabalhadores.

**Conceitos Chave SQS**

**Timeout de visibilidade das mensagens**: Quando um consumidor lê uma mensagem do SQS, a mensagem torna-se *invisível* para outros consumidores por um período (por defeito: 30 segundos). Isso dá ao consumidor tempo para processá-la. Se o consumidor terminar com sucesso, elimina a mensagem. Se o consumidor colapsar, o timeout de visibilidade expira e a mensagem fica novamente visível para outro consumidor retentar.

Isso garante entrega pelo menos uma vez: cada mensagem será processada pelo menos uma vez, mesmo que um consumidor falhe a meio do processamento.

**Filas de mensagens mortas (DLQ)**: Se uma mensagem falha o processamento demasiadas vezes (configurável — ex.: 5 tentativas), o SQS move-a para uma fila de mensagens mortas. Inspecciona a DLQ para perceber por que razão as mensagens estão a falhar sem as perder.

**Tipos de fila**:

**Filas padrão**: Rendimento máximo (mensagens ilimitadas por segundo). A ordem de entrega é de melhor esforço (não garantida). Entrega pelo menos uma vez (muito raramente, uma mensagem pode ser entregue duas vezes).

**Filas FIFO**: Ordem rigorosa first-in, first-out. Entrega exactamente uma vez. Limitada a 3 000 mensagens por segundo com batching, 300 sem. Use quando a ordem importa (transacções financeiras, alterações de estado sequenciais).

Para Nimbus, a maioria das filas usava filas padrão. A fila de facturação usava FIFO para garantir que os encargos eram processados em ordem.

**Amazon SNS: O Difusor**

O **Amazon SNS (Simple Notification Service)** é um serviço de mensagens publicar/subscrever (pub/sub). Em vez de um produtor, um consumidor (fila), o SNS suporta que uma mensagem seja entregue a *muitos* subscritores simultaneamente.

O modelo:

1. Um **publicador** envia uma mensagem para um **tópico** SNS
2. Todos os **subscritores** desse tópico recebem a mensagem simultaneamente (fan-out)

Os subscritores podem ser:

- Filas SQS (empurrar a mensagem para uma fila para processamento assíncrono)
- Funções Lambda (accionar a função directamente)
- Endpoints HTTP/HTTPS (entrega por webhook)
- Endereços de e-mail
- SMS (números de telefone)

Para Nimbus, o evento de encomenda colocada é publicado num tópico SNS chamado `order-events`:

- O serviço de notificação do restaurante subscreve (recebe na sua fila SQS)
- O serviço de e-mail subscreve (recebe na sua fila SQS)
- O serviço de análise subscreve (recebe na sua fila SQS)
- O serviço de facturação subscreve (recebe na sua fila SQS FIFO)

Um evento de encomenda. Quatro subscritores. Todos notificados simultaneamente. Cada um processa ao seu próprio ritmo.

"Portanto o SNS é o anúncio," disse Maya, "e o SQS é a caixa de entrada onde cada equipa processa o anúncio à sua própria velocidade."

"Exactamente," disse Leo. "O fan-out SNS/SQS é o padrão padrão."

**O Padrão Fan-Out SNS/SQS**

Esta combinação — tópico SNS a alimentar múltiplas filas SQS — é um dos padrões arquitecturais mais importantes na AWS:

```
Servidor API
    |
    | publica para
    ↓
Tópico SNS: "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
Fila SQS          Fila SQS          Fila SQS
(notificações)  (serviço e-mail)  (análises)
    |                 |                 |
    ↓                 ↓                 ↓
Trabalhador       Trabalhador       Trabalhador
Lambda/EC2        Lambda/EC2        Lambda/EC2
```

Cada fila é independente. O serviço de análise pode ser lento — a sua fila enche, mas os serviços de notificação e e-mail continuam sem ser afectados. Se o serviço de análise ficar em baixo, as suas mensagens esperam na fila até ele voltar. Nada se perde.

Esta é a propriedade chave: **falha independente**. Problemas num consumidor não se propagam a outros.

**Filtragem de Mensagens: Não Todas as Mensagens Para Todos os Subscritores**

À medida que os sistemas crescem, não quer que cada subscritor processe cada mensagem. Um serviço de análise não deve receber mensagens sobre processamento de pagamentos falhado se só se preocupa com encomendas concluídas.

A **filtragem de mensagens SNS** deixa os subscritores especificar políticas de filtro — apenas entregar mensagens que correspondam a certos atributos.

O serviço de notificação do restaurante subscreve com um filtro: apenas mensagens onde `status = "confirmed"`.

O serviço de alertas de erros subscreve com um filtro: apenas mensagens onde `status = "failed"`.

Cada subscritor recebe apenas o que precisa.

**Quando Usar SQS vs SNS**

**SQS sozinho**: Um produtor, um consumidor (ou múltiplos consumidores concorrentes na mesma fila). As mensagens precisam de ser processadas uma vez, em ordem (FIFO) ou não (padrão). Padrão de fila de trabalhador — uma fila, múltiplos trabalhadores a consumir.

**SNS sozinho**: Notificações do tipo disparar e esquecer. Enviar para e-mail, SMS ou endpoints HTTP. Sem necessidade de enfileirar a mensagem — apenas notificar e seguir em frente.

**SNS + SQS (fan-out)**: Um evento, múltiplos consumidores independentes. Cada consumidor tem a sua própria fila, processa independentemente e pode falhar independentemente.

## Pontos Fortes e Limitações

**Por que razão SQS e SNS são poderosos**:

- O SQS fornece entrega de mensagens durável e fiável — as mensagens são guardadas em múltiplas AZs
- O desacoplamento permite escalonamento e implantação independentes de serviços produtor e consumidor
- As filas de mensagens mortas garantem que nenhuma mensagem se perde silenciosamente em caso de falha
- O padrão fan-out SNS permite adicionar novos consumidores sem alterar o produtor

**Onde fica complicado**:

- A entrega pelo menos uma vez significa que os consumidores devem ser *idempotentes* — processar a mesma mensagem duas vezes não deve causar problemas (encomendas duplicadas, encargos duplicados)
- As filas FIFO são mais caras e têm limites de rendimento
- Depurar mensagens falhadas em múltiplas filas e serviços requer bom registo e observabilidade
- As garantias de ordem de mensagens são limitadas — se a ordem rigorosa importar em múltiplos serviços, o design fica complexo

## Resumo

- O **desacoplamento** separa os componentes que produzem trabalho dos componentes que o processam.
- O **SQS** é uma fila gerida. Os produtores enviam mensagens; os consumidores lêem e processam-nas assincronamente.
- **SQS Padrão**: alto rendimento, ordem de melhor esforço, entrega pelo menos uma vez.
- **SQS FIFO**: ordem rigorosa, entrega exactamente uma vez, menor rendimento.
- O **SNS** é um serviço pub/sub. Uma mensagem, muitos subscritores simultaneamente.
- **Fan-out SNS + SQS**: o padrão padrão para um evento a accionar múltiplos pipelines de processamento independentes.
- **Filas de mensagens mortas**: apanham mensagens que falham o processamento após demasiadas tentativas.
- **Idempotência**: projecte consumidores para processar com segurança mensagens duplicadas.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Resilientes (Domínio 2, Tarefa 2.1)*

- **SQS Padrão vs FIFO**: O exame distingue por ordem e garantias de entrega. "Deve processar em ordem" → FIFO. "Rendimento máximo" → Padrão.
- **Timeout de visibilidade**: Conceito chave para entrega pelo menos uma vez. Se um consumidor falhar, a mensagem fica visível novamente após o timeout. Cenário do exame: "as mensagens estão a ser processadas duas vezes" → timeout de visibilidade demasiado curto (o consumidor demora mais do que o timeout a processar).
- **Fila de mensagens mortas**: As mensagens que falham após N tentativas são movidas para aqui. Cenário do exame: "garantir que nenhuma mensagem se perde, mesmo que o processamento falhe repetidamente" → DLQ.
- **Fan-out SNS**: Padrão clássico do exame para um evento a accionar múltiplos consumidores. "Notificação de encomenda colocada deve accionar e-mail, SMS e actualização de inventário simultaneamente" → tópico SNS com subscrições SQS.
- **SQS + Lambda**: O Lambda pode ser configurado para fazer polling de uma fila SQS e accionar em cada lote de mensagens. O exame usa-o para processamento orientado a eventos em escala.
- **Long polling SQS**: Em vez de os consumidores fazerem polling a cada poucos segundos (short polling, desperdiça chamadas API), o long polling espera até 20 segundos por uma mensagem. Reduz custos e respostas falsamente vazias.

## Exercícios

**Exercício 1 — Recordar**

Explique o padrão fan-out SNS/SQS. Por que razão o padrão usa filas SQS em vez de ter serviços a subscrever directamente o tópico SNS com endpoints HTTP?

*(Sugestão: Pense no que acontece se um dos endpoints HTTP estiver em baixo quando o SNS publica uma mensagem.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma plataforma de comércio electrónico processa 10 000 encomendas por hora. Quando uma encomenda é feita, o sistema deve: (1) guardar a encomenda na base de dados, (2) deduzir inventário, (3) enviar um e-mail de confirmação e (4) actualizar o painel de análise. Actualmente, todos os quatro passos acontecem sincronamente — se o serviço de análise está lento, os clientes esperam. A equipa quer melhorar o tempo de resposta voltado para o cliente garantindo que nenhuma encomenda se perde.

Qual arquitectura MELHOR aborda este requisito?

A) Usar filas SQS FIFO para processar todos os quatro passos em sequência  
B) Ter a API a guardar a encomenda e imediatamente confirmar ao cliente; publicar um evento para um tópico SNS; ter serviços de inventário, e-mail e análise a subscrever via filas SQS  
C) Usar instâncias EC2 paralelas para processar cada passo simultaneamente, sincronamente  
D) Usar um API Gateway com validação de pedidos para acelerar o processamento de encomendas

**Sugestão 1**: A confirmação ao cliente deve ser imediata. Que passos devem acontecer antes da resposta, e quais podem acontecer depois?

**Sugestão 2**: O serviço de análise ser lento não deve afectar os serviços de e-mail ou inventário.

**Sugestão 3**: O fan-out SNS permite que todos os três serviços a jusante recebam o evento simultaneamente.

**Resposta**: B

**Explicação**: A API guarda a encomenda na base de dados (síncrono — deve ser feito antes de confirmar) e devolve imediatamente uma confirmação. Depois publica um evento `order-placed` para um tópico SNS. Os serviços de inventário, e-mail e análise subscrevem cada um via filas SQS independentes. Processam ao seu próprio ritmo — se as análises forem lentas, a sua fila cresce mas os outros serviços não são afectados. Se algum serviço falhar, as suas mensagens permanecem na fila SQS e são tentadas novamente; após o número configurado de tentativas falhadas são movidas para a DLQ.

**Por que não A?** As filas FIFO processam mensagens em sequência — isso não ajuda com a abrandamento síncrono. Além disso, o processamento sequencial significa que as análises a ser lentas ainda bloqueiam o e-mail.

**Por que não C?** "Instâncias EC2 paralelas a processar sincronamente" ainda requer que todos os passos sejam concluídos antes de responder ao cliente. Adicionar instâncias não resolve o acoplamento síncrono.

**Por que não D?** O API Gateway acelera o encaminhamento e validação de API, mas não desacopla os passos de processamento a jusante.

*Domínio SAA-C03: Projectar Arquitecturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a construir um sistema de notificação para parceiros de restaurante. Quando um cliente faz uma encomenda, o restaurante precisa de ser notificado via:

- A aplicação tablet (notificação push)
- Um sistema de display de cozinha (webhook HTTP para o hardware local)
- Um SMS de reserva (se a notificação tablet falhar)

O serviço de notificação de tablet é fiável. O webhook de cozinha está por vezes em baixo (os restaurantes desligam o hardware quando fecham). O SMS deve disparar apenas se a notificação tablet falhar.

Projecte a arquitectura usando SNS e SQS. Como trataria o requisito "SMS apenas se tablet falhar"? Como garantiria que o webhook de cozinha não bloqueia a notificação tablet quando está offline?

*(Não existe uma resposta única correcta. O objectivo é praticar o design fan-out com encaminhamento condicional.)*

## Cena Pós-Créditos

O novo fluxo de encomendas estava activo.

Os clientes faziam encomendas. A API respondia em 95 milissegundos. A confirmação aparecia nos telemóveis instantaneamente.

Em segundo plano: quatro serviços a processar assincronamente. O serviço de análise tinha um bug que o fazia colapsar em encomendas com determinados caracteres especiais no nome do item. A fila acumulou 3 200 mensagens ao longo de duas horas.

Os clientes nunca notaram.

Quando Leo corrigiu o bug e o serviço de análise reiniciou, processou o registo pendente em 18 minutos. Não se perderam dados. A DLQ estava vazia.

"É isto que desacoplamento significa," disse Priya.

Tom estava a ler a página de preços SQS. "Por milhão de pedidos, 0,40 dólares."

"Isso é mau?"

"Ao nosso volume actual, cerca de doze dólares por mês." Fixou o ecrã. "Estava a esperar mais."

Tinha o ar de alguém a descobrir que algo inesperadamente barato era também inesperadamente bom.

No próximo capítulo: a função que só corre quando alguém bate à porta — e não custa nada quando não batem.
