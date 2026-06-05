# Capítulo 22: O Fluxograma Que Se Executa Sozinho

Uma confirmação de pedido na Nimbus exigia que cinco coisas acontecessem em sequência: cobrar o cartão, enviar o e-mail de confirmação, notificar o restaurante, atualizar o estoque e registrar a transação para a contabilidade. Se a etapa três falhasse — se a notificação ao restaurante expirasse — as etapas um e dois já tinham acontecido. O cliente foi cobrado. O e-mail foi enviado. Mas o restaurante não sabia que o pedido existia.

Leo tinha um nome para essa categoria de bug: o sucesso parcial. "Tudo funcionou," disse ele, "exceto pela parte que importava."

"Quantas vezes isso aconteceu?" perguntou Maya.

"Onze vezes nas últimas duas semanas. Encontramos a maioria por ligações raivosas para o restaurante. Duas encontramos nos logs, depois do fato."

"Então não temos coordenação," disse Priya. "Cinco etapas, sendo executadas como um script, sem garantia de que todas sejam concluídas."

"Ou que sejam concluídas na ordem correta."

"Ou que saibamos qual delas falhou."

Leo exibiu o código no projetor. Era uma função Python: cinquenta linhas, cinco chamadas de API sequenciais, um único bloco try/except ao redor de tudo. "Se qualquer coisa aqui lançar uma exceção, recebemos um erro 500 e o cliente vê um erro. Mas cobranças e e-mails não são revertidos."

"Precisamos de um fluxo de trabalho," disse Maya. "Algo que rastreie cada etapa."

**AWS Step Functions: Orquestrando Fluxos de Trabalho**

O **AWS Step Functions** é um serviço de orquestração serverless que coordena as etapas de uma aplicação como um fluxo de trabalho visual. Cada etapa é um **estado** em uma **máquina de estados**.

Em vez de um script Python que é executado de cima para baixo e falha, você define o fluxo de trabalho como uma máquina de estados JSON/YAML:

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Cada estado pode:

- **Executar uma função Lambda** (o padrão mais comum)
- **Executar uma tarefa ECS** (para trabalhos de longa duração)
- **Aguardar um tempo específico** ou um **evento** (pausar o fluxo de trabalho até que algo externo aconteça)
- **Escolher um caminho** com base em condições (lógica if/else)
- **Executar ramificações em paralelo** simultaneamente
- **Tentar novamente em caso de falha** com backoff configurável
- **Capturar erros** e encaminhar para estados de tratamento de erros

O Step Functions gerencia o estado de execução de forma durável. Se a etapa 3 falhar, a execução pausa na etapa 3. Você pode inspecionar a execução com falha no console, corrigir o problema e reiniciar a partir da etapa 3 — sem repetir as etapas 1 e 2.

**Tipos de Estado: Os Blocos de Construção**

**Task**: Executa uma ação — chama uma função Lambda, inicia uma tarefa ECS, chama uma API. É aqui que o trabalho real acontece.

**Choice**: Ramifica com base em condições nos dados de entrada. Como um if/else no código.

**Parallel**: Executa múltiplas ramificações simultaneamente e aguarda que todas sejam concluídas.

**Map**: Aplica um conjunto de estados a cada item em uma lista. Processa 50 itens do cardápio de um restaurante em paralelo.

**Wait**: Pausa por um tempo especificado ou até um timestamp. Útil para atrasos programados.

**Pass**: Passa a entrada para a saída sem fazer trabalho. Usado para transformação de dados e testes.

**Succeed/Fail**: Estados terminais que encerram a execução.

Para o onboarding do restaurante, Leo projetou um fluxo de trabalho:

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, com 3 novas tentativas)
3. Ramificação paralela:
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, aguarda a conclusão do paralelo)
5. NotifySalesTeam (Task → Lambda)

As etapas 3a e 3b são executadas em paralelo — elas não dependem uma da outra, e executá-las simultaneamente economiza tempo.

**Fluxos de Trabalho Standard vs Express**

O Step Functions oferece dois tipos de fluxo de trabalho:

**Fluxos de trabalho Standard**:

- Duração máxima: 1 ano
- As execuções são duráveis — o estado é persistido, pode ser inspecionado e auditado
- Execução ao-menos-uma-vez (cada tarefa é executada pelo menos uma vez)
- Preço por transição de estado
- Ideal para fluxos de trabalho longos e importantes (processamento de pedidos, onboarding, fluxos de pagamento)

**Fluxos de trabalho Express**:

- Duração máxima: 5 minutos
- Maior throughput — até 100.000 por segundo
- Ao-menos-uma-vez ou ao-máximo-uma-vez (configurável)
- Preço por duração (como o Lambda)
- Ideal para fluxos de trabalho de alto volume e curta duração (processamento de eventos em tempo real, ingestão de dados de IoT)

Para o onboarding de restaurantes da Nimbus: Standard (é importante, durável, pode levar horas se etapas manuais estiverem envolvidas).

Para as atualizações de status de pedidos em tempo real da Nimbus: Express (alto volume, curta duração, menos crítico).

**Arquitetura Orientada a Eventos: A Visão Mais Ampla**

O Step Functions é uma parte de um padrão maior: a **arquitetura orientada a eventos**. Em vez de serviços chamando uns aos outros diretamente (acoplamento forte), os serviços emitem eventos, e outros serviços reagem a esses eventos.

Vimos isso ao longo do livro:

- Pedidos feitos → SNS publica evento → filas SQS entregam aos consumidores
- Arquivo S3 enviado → Lambda acionado para processá-lo
- Registro DynamoDB alterado → DynamoDB Streams → Lambda atualiza um cache

O **Amazon EventBridge** (anteriormente CloudWatch Events) é o barramento de eventos avançado para esse padrão. Ele roteia eventos de serviços AWS e de suas próprias aplicações para destinos (Lambda, SQS, Step Functions, etc.) com base em regras.

O EventBridge permite o desacoplamento fraco em nível arquitetural: o serviço de pedidos publica eventos `order.placed` sem saber quem está ouvindo. O serviço de análise, o serviço de notificações e o serviço de pontos de fidelidade ouvem de forma independente. Adicionar um novo ouvinte não requer alterar o serviço de pedidos.

**Quando o Step Functions é a Ferramenta Certa**

O Step Functions se destaca quando você tem:

**Fluxos de trabalho de múltiplas etapas** que precisam rastrear o progresso entre as etapas

**Processos com participação humana** — o Step Functions pode aguardar indefinidamente por um evento externo (como um ser humano aprovando algo) e depois continuar

**Tratamento de erros em escala** — lógica de nova tentativa, captura e fallback integradas em várias etapas

**Processos auditáveis** — cada execução registra cada transição de estado. Você pode ver exatamente o que aconteceu e quando.

**Lógica paralela ou sequencial complexa** — o fluxo de trabalho visual torna mais fácil raciocinar do que o código equivalente

O Step Functions é excessivo para processos simples de duas etapas. Use-o quando a coordenação em si for valiosa e os cenários de falha forem importantes.

## Pontos Fortes e Limitações

**Por que o Step Functions é poderoso**:

- Histórico de execução visual — veja exatamente onde um fluxo de trabalho está (ou falhou)
- Nova tentativa e tratamento de erros integrados — sem código de nova tentativa personalizado
- Estado durável — as execuções sobrevivem a reinicializações e interrupções de serviço
- Integrações diretas com mais de 200 serviços AWS (não apenas Lambda)
- O fluxo de trabalho visual é autodocumentado

**Onde fica complicado**:

- Fluxos de trabalho Standard têm preço por transição de estado — fluxos de trabalho complexos com muitos estados podem ficar caros em escala
- O formato JSON da ASL (Amazon States Language) tem uma curva de aprendizado
- O tamanho máximo do payload é 256 KB — dados grandes devem ser passados via referências S3, não diretamente pelo fluxo de trabalho
- Fluxos de trabalho de longa duração com muitas etapas manuais requerem configuração cuidadosa de timeout

## Resumo

- O **Step Functions** orquestra fluxos de trabalho de múltiplas etapas como máquinas de estados.
- Cada **estado** pode executar uma função Lambda, uma tarefa ECS, aguardar, ramificar ou executar etapas em paralelo.
- **Nova tentativa e captura** estão integrados em cada estado — sem código de nova tentativa personalizado necessário.
- **Fluxos de trabalho Standard**: longa duração (até 1 ano), durável, ao-menos-uma-vez. Para processos críticos de negócios.
- **Fluxos de trabalho Express**: curta duração (até 5 minutos), alto throughput. Para processamento de eventos de alto volume.
- A **arquitetura orientada a eventos** usa serviços como SNS, SQS, Lambda e EventBridge para desacoplar sistemas em torno de eventos em vez de chamadas diretas.
- Use o Step Functions quando a coordenação das etapas for em si complexa e quando a auditabilidade for importante.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Sinais de caso de uso do Step Functions**: "orquestrar múltiplas funções Lambda," "fluxo de trabalho com novas tentativas e tratamento de erros," "etapa de aprovação humana em um fluxo de trabalho automatizado," "trilha de auditoria de cada etapa do fluxo de trabalho" → Step Functions.
- **Standard vs Express**: Standard para fluxos de trabalho de longa duração, auditáveis e críticos para o negócio. Express para processamento de eventos de alto throughput e curta duração.
- **SQS vs Step Functions**: SQS para filas de tarefas simples (produtor/consumidor). Step Functions para fluxos de trabalho de múltiplas etapas com lógica complexa, novas tentativas e rastreamento de estado.
- **Sinais do EventBridge**: "rotear eventos de serviços AWS para destinos," "integração orientada a eventos entre serviços," "agendar uma função Lambda" → EventBridge (anteriormente CloudWatch Events).
- **Padrão de callback**: O Step Functions pode pausar a execução e aguardar um callback externo (um token de tarefa). O trabalhador chama de volta quando terminar. Útil para tarefas ECS de longa duração onde você não quer o limite de 15 minutos do Lambda.
- **Integrações diretas com o SDK**: O Step Functions pode chamar serviços AWS diretamente (DynamoDB, S3, SQS, etc.) sem passar pelo Lambda. Reduz custo e latência para chamadas simples de serviço.

## Exercícios

**Exercício 1 — Recordação**

Explique por que o Step Functions é útil para fluxos de trabalho de múltiplas etapas. O que ele fornece que uma simples função Lambda chamando outras funções Lambda não fornece?

*(Dica: Pense no que acontece quando a etapa 3 de 5 falha em cada abordagem. Como você sabe o que aconteceu? Como você tenta novamente apenas a etapa 3?)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa de serviços financeiros processa solicitações de empréstimo em várias etapas: verificação de crédito, verificação de renda, validação de documentos, revisão do analista de crédito (manual) e notificação de decisão. Cada etapa pode levar de segundos (verificação de crédito) a dias (revisão do analista). A empresa precisa de uma trilha de auditoria completa de cada etapa para conformidade. As etapas automatizadas com falha devem ser tentadas novamente automaticamente; as etapas manuais devem pausar e aguardar uma decisão humana.

Qual serviço MELHOR atende a esses requisitos?

A) Funções AWS Lambda encadeadas com filas SQS entre cada etapa  
B) Fluxos de trabalho Standard do AWS Step Functions com um padrão de Aguardar callback para a etapa de revisão do analista  
C) Fluxos de trabalho Express do AWS Step Functions para as etapas automatizadas e SQS FIFO para a etapa manual  
D) Amazon EventBridge com regras de evento roteando entre funções Lambda para cada etapa

**Dica 1**: Duração de "até dias" — qual tipo de Step Functions suporta isso?

**Dica 2**: "Aguardar uma decisão humana" — qual padrão do Step Functions foi projetado para isso?

**Dica 3**: "Trilha de auditoria completa para conformidade" — qual serviço fornece histórico de estado por execução?

**Resposta**: B

**Explicação**: Os fluxos de trabalho Standard do Step Functions podem ser executados por até 1 ano, suportando a etapa de revisão do analista que pode levar dias. O padrão Aguardar callback pausa a execução na etapa do analista com um token de tarefa; quando o analista toma uma decisão, ele chama de volta com o token para continuar o fluxo de trabalho. Os fluxos de trabalho Standard registram cada transição de estado — trilha de auditoria completa para conformidade.

**Por que não A?** Lambda encadeado via SQS não fornece rastreamento de estado integrado nem trilha de auditoria. As etapas com falha requerem lógica de nova tentativa personalizada. Reiniciar a partir de uma etapa específica com falha requer implementação personalizada.

**Por que não C?** Os fluxos de trabalho Express têm duração máxima de 5 minutos — incompatível com uma etapa que pode levar dias.

**Por que não D?** O EventBridge roteia eventos entre serviços, mas não mantém o estado do fluxo de trabalho nem fornece nova tentativa/auditoria integrados. Construir isso apenas no EventBridge requer gerenciamento de estado personalizado.

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está construindo um processo de resolução de disputas sobre qualidade de alimentos. Quando um cliente relata uma experiência ruim:

1. O relatório é validado automaticamente (verifica se o pedido existe, se é recente o suficiente)
2. O restaurante é notificado automaticamente
3. Um agente de suporte da Nimbus analisa a reclamação (etapa manual — pode levar de 1 a 3 dias úteis)
4. Com base na decisão do agente: emitir reembolso (Lambda → processador de pagamentos) OU enviar cupom de desculpas (Lambda → serviço de cupons) OU escalar para a gerência (sub-fluxo de trabalho Step Functions)
5. O cliente é notificado do resultado

Projete isso como um fluxo de trabalho Step Functions. Qual tipo de estado lida com cada etapa? Como você lidaria com a espera de 1 a 3 dias? Como você modelaria a ramificação na etapa 4?

*(Não há uma única resposta correta. O objetivo é praticar o design de estados do Step Functions.)*

## Cena Pós-Créditos

O fluxo de trabalho de onboarding de restaurantes estava ativo.

No mês seguinte, 12 novos parceiros restaurantes fizeram o onboarding. Dois tiveram falhas durante a etapa de processamento de pagamentos (etapa 3). Em ambos os casos, o Step Functions capturou o erro exato, salvou o estado da execução e enviou um alerta para a equipe da Nimbus.

Leo corrigiu a causa raiz (uma chave de API configurada incorretamente para o provedor de pagamentos) e tentou novamente ambas as execuções a partir da etapa 3. As execuções foram concluídas em 23 segundos cada, retomando exatamente de onde haviam falhado.

Nenhum restaurante precisou ser re-importado. Nenhuma função IAM foi criada em duplicata. Nenhum e-mail de boas-vindas duplicado foi enviado.

"Antes do Step Functions," disse Leo a Maya, "isso teria exigido que alguém rastreasse manualmente o que havia e não havia sido feito para cada restaurante, e reexecutasse manualmente as etapas ausentes."

"E agora?"

"Agora clico em tentar novamente no console. O sistema sabe o que está feito."

Maya pensou sobre isso.

"Não é apenas uma melhoria técnica," disse ela. "É a diferença entre um processo que escala e um que não escala."

No próximo capítulo: o que fazer com dados que você não está acessando agora, mas definitivamente quer manter para sempre.
