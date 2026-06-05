# Capítulo 20: O Modelo Freelancer

A função de notificação de pedidos era executada exatamente uma vez por pedido. Entre os pedidos, não fazia nada. Por dezessete horas em uma terça-feira, nenhum pedido chegou. Durante essas dezessete horas, a função não custou nada. Nem um centavo. Nenhum servidor ocioso, nenhuma instância aguardando, nenhuma capacidade reservada inutilizada. A função existia. Ela simplesmente não era executada.

O fan-out via SNS/SQS estava funcionando. O serviço de análise, o serviço de notificação e o serviço de e-mail consumiam cada um de suas próprias filas SQS.

Mas Priya havia notado algo.

"O serviço de e-mail," disse ela. "Quantos e-mails enviamos por hora?"

Leo verificou as métricas. "Em média, 400. No pico, cerca de 1.200 nas noites de sexta-feira."

"E a instância EC2 executando o serviço de e-mail — por quanto tempo ela fica ligada?"

"Sempre. 24 horas por dia, 7 dias por semana."

"Mesmo às 3 da manhã, quando não enviamos nenhum e-mail?"

Silêncio.

"Estamos pagando por um computador que fica parado sem fazer nada," disse Leo.

"Por quantas horas por dia?"

Mais silêncio.

"Cerca de 18."

Tom estava muito atento agora.

**O Servidor Nem Sempre É a Resposta**

Instâncias EC2 são permanentes. Você inicia uma e ela continua em execução até você pará-la — 24 horas por dia, 7 dias por semana, independentemente do uso real. Para o seu servidor web (que lida com tráfego em todos os horários), isso é correto. Para o serviço de e-mail (que envia rajadas de e-mails e fica ocioso por horas), é desperdício.

O Auto Scaling Group pode reduzir o serviço de e-mail a uma única instância durante os períodos de menor movimento. Mas uma instância ainda é executada continuamente.

E se o código só fosse executado quando houvesse trabalho a fazer?

Essa é a premissa da **computação serverless**.

**AWS Lambda: Código Sem Servidores**

O **AWS Lambda** permite executar código em resposta a eventos sem provisionar ou gerenciar servidores. Você faz o upload de uma função, especifica o que a aciona e o Lambda a executa quando o gatilho é disparado.

Uma função Lambda:

- Não tem estado persistente (cada invocação é independente)
- É executada por até 15 minutos por invocação
- Escala automaticamente de 0 a milhares de invocações simultâneas
- É cobrada apenas quando em execução (por 1 ms de execução, arredondado para cima, por GB de memória alocada)

Quando não há gatilho, o Lambda não tem custo algum. Quando os gatilhos disparam, o Lambda é executado e cobra. Quando 10.000 gatilhos disparam simultaneamente, o Lambda executa 10.000 invocações simultâneas. O escalonamento é automático e quase instantâneo.

**Gatilhos de Eventos: O Que Acorda o Lambda**

Funções Lambda não são executadas por conta própria — elas respondem a eventos. Os gatilhos mais comuns incluem:

- **Fila SQS**: Processa mensagens de uma fila. O Lambda consulta a fila e invoca a função com lotes de mensagens.
- **API Gateway**: Uma requisição HTTP chega. O API Gateway aciona o Lambda. O Lambda gera uma resposta.
- **Evento S3**: Um arquivo é enviado para o S3. O Lambda o processa (redimensionar uma imagem, analisar um CSV, validar um documento).
- **SNS**: Uma mensagem é publicada em um tópico. O Lambda é notificado.
- **DynamoDB Streams**: Um registro no DynamoDB é alterado. O Lambda processa a alteração.
- **CloudWatch Events (EventBridge)**: Um evento programado (como um cron job) é executado em um horário definido.
- **ALB**: Uma requisição HTTP chega ao balanceador de carga. O Lambda pode lidar com determinadas rotas.

Para a Nimbus, o serviço de e-mail tornou-se uma função Lambda acionada por sua fila SQS. Quando uma mensagem chega na fila, o Lambda é invocado com o conteúdo da mensagem, envia o e-mail via SES (Simple Email Service) e encerra a execução.

Zero servidores. Zero tempo ocioso. Zero custo quando ocioso.

**O Problema do Cold Start**

As funções Lambda são executadas em **ambientes de execução** — pequenos contêineres isolados. Quando uma função é invocada:

1. A AWS verifica se há um ambiente de execução aquecido disponível (um que tratou uma invocação recente)
2. Se aquecido: a função é executada imediatamente
3. Se frio: a AWS inicializa um novo ambiente de execução — baixa o código, inicia o runtime, executa o código de inicialização — e então executa a função

Um **cold start** adiciona de 100 ms a alguns segundos de latência, dependendo do runtime (Java e .NET têm cold starts mais longos do que Python e Node.js) e do tamanho do pacote de código.

Para processamento assíncrono (envio de e-mails, redimensionamento de imagens), os cold starts são invisíveis para os usuários.

Para APIs síncronas (requisições HTTP em que um usuário aguarda uma resposta), os cold starts podem causar respostas ocasionalmente lentas.

**Mitigações**:

- **Concorrência provisionada**: Pré-aquece um número especificado de ambientes de execução. Eles estão sempre prontos. Você paga por isso mesmo quando não estão processando requisições.
- **Pacotes menores**: Código menor inicializa mais rapidamente.
- **Invocações de aquecimento**: Pings programados para manter as funções aquecidas (uma abordagem comum, mas pouco elegante).
- **Escolha o runtime certo**: Python e Node.js inicializam mais rápido do que Java.

**Preços do Lambda: Por Que Tom Sorriu**

O preço do Lambda tem dois componentes:

1. **Cobrança por requisição**: US$ 0,20 por milhão de invocações
2. **Cobrança por duração**: US$ 0,0000166667 por GB-segundo (memória alocada × segundos em execução)

O primeiro milhão de requisições por mês é gratuito (sempre, não apenas no primeiro ano).

Tom fez as contas para o serviço de e-mail:

- 1.200 e-mails por dia × 30 dias = 36.000 invocações por mês
- Cada invocação leva cerca de 2 segundos com 256 MB de memória
- Duração: 36.000 × 2 × 0,25 GB × US$ 0,0000166667 = US$ 0,30/mês
- Requisições: 36.000 << 1.000.000 (nível gratuito) = US$ 0,00/mês

A instância EC2 para o serviço de e-mail: US$ 18/mês.

Tom ficou em silêncio por um momento. Depois: "Deveríamos fazer isso com tudo."

**O Que o Lambda Faz Bem (e o Que Não Faz)**

O Lambda é excelente para:

- **Processamento orientado a eventos**: Responder a eventos (uploads de arquivos, mensagens em filas, tarefas programadas)
- **Tarefas de curta duração**: Processamento que conclui bem dentro do limite de 15 minutos
- **Tráfego irregular e imprevisível**: O Lambda escala de 0 a milhares instantaneamente — sem necessidade de pré-provisionamento
- **Operações infrequentes**: Um relatório que é executado às 2h da manhã diariamente. Uma tarefa de limpeza que é executada semanalmente.
- **Código de cola**: Pequenas funções que movem dados entre serviços

O Lambda é inadequado para:

- **Processos de longa duração**: O limite de 15 minutos é um limite absoluto
- **Aplicações com estado**: As funções Lambda são stateless por design — cada invocação é independente
- **APIs de alta taxa de transferência e baixa latência**: Cold starts podem causar picos de latência; a concorrência provisionada atenua isso, mas adiciona custo
- **Aplicações que precisam de conexões persistentes**: O Lambda não pode manter facilmente um pool de conexões de banco de dados de longa duração (embora ferramentas de pool de conexões como o RDS Proxy ajudem)
- **Servidores web tradicionais**: Possível, mas não é o uso mais natural

"Então o Lambda não substitui o EC2," disse Maya. "É uma ferramenta diferente para trabalhos diferentes."

"A API web da Nimbus permanece no EC2 ou ECS," confirmou Leo. "O serviço de e-mail, o redimensionador de imagens, o gerador de relatórios noturnos, o limpador de logs — esses migram para o Lambda."

**A Filosofia Serverless**

O Lambda faz parte de um conceito mais amplo: **serverless** — construir aplicações nas quais você não gerencia servidores, apenas código.

Uma pilha Nimbus totalmente serverless poderia ser assim:

- API Gateway + Lambda (em vez de EC2 com um servidor web)
- DynamoDB (em vez de RDS — também serverless, sem gerenciamento de servidor)
- S3 (ativos estáticos — inerentemente serverless)
- SNS + SQS (mensagens — serverless)
- Lambda (todo o processamento em segundo plano)

O apelo: você escreve código; a AWS gerencia todo o resto. Sem patches, sem configuração de escalonamento, sem planejamento de capacidade.

A realidade: o serverless tem sua própria complexidade operacional — depurar funções Lambda distribuídas, gerenciar cold starts, entender os limites de concorrência. Não é mais simples, apenas diferente.

## Pontos Fortes e Limitações

**Por que o Lambda é poderoso**:

- Pagamento real por uso — custo zero quando ocioso
- Escalonamento automático sem configuração
- Sem servidores para fazer patches ou manter
- Nível gratuito generoso (1 milhão de requisições por mês, para sempre)
- Integração estreita com o restante da AWS

**Onde fica complicado**:

- Cold starts são reais e requerem tratamento cuidadoso para cargas de trabalho sensíveis à latência
- O limite de execução de 15 minutos exclui tarefas de longa duração
- A depuração é mais difícil — sem servidor persistente para acessar via SSH
- O design stateless requer externalizar todo o estado (banco de dados, cache, S3)
- Limites de concorrência (padrão de 1.000 execuções simultâneas por conta) podem limitar o throughput em escala
- Funções Lambda conectadas a uma VPC têm latência adicional e problemas de cold start

## Resumo

- O **AWS Lambda** executa código em resposta a eventos sem gerenciar servidores.
- **Pagamento por uso**: cobrado por invocação e por 1 ms de execução (arredondado para cima). Custo zero quando ocioso.
- Escala automaticamente de 0 a milhares de invocações simultâneas.
- **Cold starts**: latência de inicialização quando não há ambiente de execução aquecido. Mitigado com concorrência provisionada ou runtimes leves.
- Ideal para: cargas de trabalho orientadas a eventos, de curta duração, irregulares ou infrequentes.
- Não ideal para: tarefas de longa duração, aplicações com estado, APIs de alta taxa de transferência e baixa latência sem concorrência provisionada.
- **Serverless** é uma filosofia de design — você gerencia o código, não a infraestrutura.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Lambda + S3**: Padrão clássico — arquivo enviado ao S3 aciona o Lambda para processamento (geração de miniaturas, varredura de vírus, transformação de dados). Sem necessidade de servidor.
- **Lambda + SQS**: O Lambda consulta o SQS e processa lotes. O SQS fornece o mecanismo de nova tentativa/DLQ. O Lambda fornece o processamento.
- **Lambda + API Gateway**: API HTTP serverless. O API Gateway lida com roteamento, autenticação e limitação de taxa. O Lambda lida com a lógica de negócios.
- **Sinais de cold start**: "picos de latência na primeira requisição," "tempos de resposta inconsistentes" → cold start. Solução: concorrência provisionada (tem custo), pacote menor, runtime mais leve.
- **Limites de execução**: máximo de 15 minutos. Memória máxima de 10 GB. Armazenamento efêmero /tmp de 512 MB por padrão (configurável até 10 GB). Esses limites aparecem em cenários do exame.
- **Concorrência do Lambda**: Padrão de 1.000 execuções simultâneas por conta (pode ser aumentado). **Concorrência reservada**: garante que uma função obtenha um número específico de execuções; impede que outras funções as consumam. **Concorrência provisionada**: pré-aquece um número de ambientes de execução.
- **Mapeamento de origem de eventos**: O recurso do Lambda que conecta SQS/DynamoDB Streams/Kinesis ao Lambda. O Lambda consulta a origem e agrupa os registros.

## Exercícios

**Exercício 1 — Recordação**

Explique o problema do cold start. Em que tipo de aplicação os cold starts seriam mais problemáticos? Em que tipo seriam aceitáveis?

*(Dica: Compare uma API em tempo real (usuário aguardando uma resposta) com um trabalho de segundo plano assíncrono (usuário já recebeu a confirmação e está fazendo outras coisas).)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa recebe imagens de produtos de seus fornecedores por meio de um bucket S3. Cada imagem precisa ser redimensionada para quatro dimensões padrão (miniatura, pequena, média, grande) e armazenada de volta no S3. O volume é imprevisível — alguns dias 10 imagens, outros 100.000. O processamento deve ser concluído em até 10 minutos por imagem. O custo deve ser minimizado.

Qual arquitetura MELHOR atende a esses requisitos?

A) Instâncias EC2 em um Auto Scaling Group monitorando o bucket S3 com long polling  
B) Notificação de evento S3 acionando uma função Lambda que redimensiona as imagens e armazena os resultados no S3  
C) Tarefas ECS Fargate acionadas por uma fila SQS, com eventos S3 publicando na fila  
D) Uma instância EC2 dedicada com um cron job que verifica o S3 a cada minuto em busca de novas imagens

**Dica 1**: Volume imprevisível favorece o escalonamento até zero. Qual opção faz isso?

**Dica 2**: 10 minutos por imagem está dentro do limite de 15 minutos do Lambda. Verifique se o trabalho de redimensionamento de imagens se encaixa nas restrições do Lambda.

**Dica 3**: Uma instância EC2 dedicada em execução 24/7 é cara e não escala.

**Resposta**: B

**Explicação**: As notificações de evento S3 acionam o Lambda quando uma imagem é enviada. O Lambda redimensiona a imagem para quatro dimensões e armazena os resultados no S3. O Lambda escala de 0 a milhares de invocações simultâneas automaticamente, lidando com volume imprevisível sem pré-provisionamento. Custo zero quando nenhuma imagem está sendo processada.

**Por que não A?** EC2 em um ASG não escala até zero — no mínimo uma instância sempre em execução. O long polling do S3 não é um mecanismo nativo de evento S3. Custo maior do que o Lambda para cargas de trabalho irregulares.

**Por que não C?** O ECS Fargate funciona, mas é mais complexo (requer gerenciamento de contêineres, ECR, definições de tarefa) e tem latência de cold start ligeiramente maior do que o Lambda para cargas de trabalho irregulares. O Lambda é mais simples para este caso de uso.

**Por que não D?** Uma instância EC2 dedicada é um ponto único de falha, não escala, funciona 24/7 e uma abordagem baseada em cron tem um atraso de detecção de até 60 segundos.

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer gerar um relatório diário às 5h com os 10 principais restaurantes do dia anterior por volume de pedidos. O relatório é gerado a partir de dados do DynamoDB, formatado como PDF, armazenado no S3 e enviado por e-mail a todos os parceiros restaurantes.

Projete o pipeline completo baseado em Lambda para isso. O que aciona o Lambda? O que acontece se a geração do PDF levar 12 minutos? E se houver 5.000 parceiros restaurantes e o envio de e-mails para todos eles levar tempo? Você usaria um Lambda ou vários?

*(Não há uma única resposta correta. O objetivo é praticar a composição do Lambda com outros serviços.)*

## Cena Pós-Créditos

Tom revisou a conta no final do mês.

O serviço de e-mail: havia desaparecido da conta do EC2.
O trabalho de redimensionamento de imagens: desaparecido.
A tarefa de limpeza noturna: desaparecida.
O relatório diário de análise: desaparecido.

Total de cobranças do Lambda no mês: US$ 4,23.

"Quatro dólares," disse Tom.

"E vinte e três centavos," acrescentou Leo, prestativo.

Tom olhou para a conta do mês anterior, quando esses serviços estavam todos em instâncias EC2.

"Estávamos pagando US$ 187 pelas mesmas cargas de trabalho."

"O Lambda não cobra pelo tempo ocioso," disse Leo. "E a maioria desses serviços ficava ociosa 90% do tempo."

Tom ficou olhando para a tela por um longo tempo.

"Retiro tudo o que disse sobre serverless ser apenas um termo da moda," disse ele.

No próximo capítulo: o contêiner de carga que faz qualquer servidor parecer um lar.
