# Capítulo 26: Dando Sentido a Tudo

Tom estava encarando uma impressão.

Eram duas páginas de números: contagens de pedidos, totais de receita, timestamps, códigos de região. Ele tinha pedido a Leo para reunir tudo o que havia disponível sobre os padrões de pedidos de sexta-feira. Leo tinha passado uma hora escrevendo um script que unia três fontes de dados diferentes — DynamoDB, logs do CloudWatch e uma exportação de analytics do S3 — e foi isso que saiu.

Os números estavam todos lá. Eles não lhe diziam nada.

Ele podia ver que 847 pedidos tinham sido feitos na sexta. Ele não conseguia dizer quando foram feitos, quais restaurantes tinham estado mais movimentados ou qual tinha sido a hora de pico. Essa informação estava nos dados. Apenas estava invisível.

---

Toda a otimização de rede do capítulo 25 tinha tornado a infraestrutura da Nimbus mais rápida e mais barata. Mas os dados que aquela infraestrutura estava gerando — no DynamoDB, nos logs do CloudWatch, na exportação de analytics do S3 que rodava uma vez por noite — estavam parados em três lugares diferentes, em três formatos diferentes, desconectados de qualquer coisa que Tom pudesse de fato usar.

A pergunta de Maya tornou isso concreto. "Qual é o nosso horário de maior movimento de pedidos nas sextas?"

Leo olhou para ela. "Isso não está no nosso painel."

"Podemos adicionar?"

"Os dados estão no DynamoDB. E nos logs do CloudWatch. E no S3 do job de exportação de analytics." Leo fez uma pausa. "Em três lugares diferentes, em três formatos diferentes."

Maya acrescentou: "E a exportação de analytics só roda uma vez por noite. Se você quiser os dados de sexta, teria de esperar até sábado de manhã."

Tom olhou a impressão. "Então temos os dados. Apenas não conseguimos usá-los."

Essa frase descreve metade da analytics moderna.

---

**O Quadro Branco**

Maya chegou ao escritório cedo e já tinha preenchido metade do quadro branco quando Leo chegou.

Sete perguntas, escritas em duas colunas, todas elas perguntas de negócio, nenhuma delas respondível a partir dos painéis atuais:

1. Quais restaurantes têm a maior taxa de cancelamento de pedidos nos primeiros 30 dias?
2. Qual é o tempo médio entre um restaurante receber uma notificação de pedido e confirmá-la? Como isso varia por restaurante e por dia da semana?
3. Quais cidades têm a maior taxa de clientes refazendo pedidos do mesmo restaurante em até 14 dias?
4. Que porcentagem dos pedidos é feita na primeira sessão do app vs. sessões de retorno?
5. Quais categorias de cardápio geram a maior receita por restaurante?
6. Qual é a correlação entre o tempo de resposta do restaurante e a taxa de reordenação do cliente?
7. Como o volume de pedidos muda nas 48 horas antes e depois de um parceiro de restaurante postar nas redes sociais?

"Conseguimos responder a alguma destas?" ela perguntou.

Leo olhou a lista. Ele olhou o painel atual — contagem de pedidos, total de receita, restaurantes ativos.

"A número um", disse ele lentamente. "Parcialmente. Temos registros de cancelamento. Mas precisaríamos uni-los às datas de onboarding dos restaurantes, e isso está em um sistema diferente."

"A número dois?" perguntou Tom.

"Armazenamos o timestamp da notificação. Armazenamos o timestamp da confirmação. Eles estão em tabelas diferentes em formatos diferentes. Precisaríamos fazer um JOIN deles e calcular o delta."

"Então os dados existem", disse Maya.

"Os dados existem", confirmou Leo. "Apenas não temos como consultá-los de forma cruzada."

"Espera — mas *por que* não podemos simplesmente consultar o banco de dados?" perguntou Maya. "Temos o PostgreSQL. Temos todos esses dados."

"Porque os dados estão em três lugares", disse Leo. "Os eventos de pedidos estão no DynamoDB. Os timestamps de notificação estão nos logs do CloudWatch. As datas de onboarding estão no banco de dados RDS PostgreSQL. E parte disso — as exportações de analytics — está no S3 como arquivos JSON que ninguém nunca uniu a nada."

Tom olhou o quadro branco. "Viemos gerando esses dados por 18 meses", disse ele. "Viemos voando às cegas por 18 meses."

"Não às cegas", disse Maya. "Apenas míopes. Conseguíamos ver o que estava imediatamente à nossa frente. Não conseguíamos ver padrões."

Esse era o enquadramento certo. Os pontos de dados individuais estavam lá. O sistema para conectá-los não estava.

**Três Problemas Diferentes**

O problema de dados da Nimbus tinha três dimensões:

**Streaming em tempo real**: Pedidos estão sendo feitos agora mesmo. Você quer ver um painel ao vivo da velocidade de pedidos — quantos por minuto, por região, por restaurante. Os dados precisam ser processados à medida que chegam.

**Transformação de dados**: Os dados estão no S3 vindos de vários sistemas, em formatos diferentes (JSON, CSV, Parquet). Antes de você poder analisá-los, você precisa normalizá-los — mesmo schema, mesmo formato, limpos, unidos a dados de referência.

**Análise ad-hoc**: Uma vez que os dados estão organizados, você quer rodar consultas SQL contra eles sem ter de carregá-los em um banco de dados primeiro. "Me dê os 10 principais restaurantes por receita nos últimos 30 dias." Sem carregar os dados em um banco de dados.

Cada um desses é um problema distinto. A AWS tem um serviço dedicado para cada um.

**O Fluxo em Tempo Real: Uma Fita de Cotação para Dados**

Imagine uma máquina de fita de cotação — do tipo que imprimia preços de ações em um rolo contínuo de papel. Os preços eram impressos à medida que mudavam. Todos que quisessem o preço atual podiam ler a fita. Ninguém tinha de esperar por ninguém; a fita continuava imprimindo independentemente de quantas pessoas estivessem lendo.

Esse é o modelo para streaming de dados em tempo real. Os produtores enviam dados conforme acontecem. Múltiplos consumidores podem ler o fluxo simultaneamente, cada um no seu próprio ritmo, cada um obtendo o quadro completo.

O **Amazon Kinesis Data Streams** é essa máquina para a Nimbus. Quando um pedido é feito, a aplicação publica um evento em um fluxo Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumidores deste fluxo:

- Um painel em tempo real (lê os eventos à medida que chegam, atualiza as métricas)
- Um Lambda de detecção de fraude (procura padrões de pedidos incomuns)
- Um fluxo para o S3 para armazenamento permanente

**Conceitos do Kinesis Data Streams**:

- **Shard**: A unidade básica de capacidade. Um shard lida com 1 MB/s de escrita, 2 MB/s de leitura.
- **Período de retenção**: Os dados permanecem no fluxo por 24 horas (padrão), estendível para **365 dias** (1 ano) com a Extended Data Retention.
- **Número de sequência**: Cada registro tem um número de sequência. Os consumidores rastreiam sua posição no fluxo.

**Amazon Data Firehose** (anteriormente **Kinesis Data Firehose**): O serviço gerenciado de entrega entre produtores de streaming e destinos como S3, Redshift e OpenSearch. Ele faz buffer, comprime, transforma e entrega os dados automaticamente.

Para a Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, comprimido, particionado por data).

"Eu já implantei — ah." Leo tinha definido a contagem de shards como um sem calcular o throughput de escrita primeiro. No volume de pedidos da Nimbus, um shard estava bem. Ele confirmou isso antes que alguém notasse que ele tinha chutado.

**O Tradutor: Dando Sentido aos Dados Brutos**

Os dados no S3 são brutos. Antes de você poder analisá-los de forma eficiente, você precisa descobrir o que há ali, transformá-los em um formato consistente, unir diferentes conjuntos de dados e lidar com registros ruins e valores faltantes.

Esse é um trabalho para uma camada de tradução dedicada.

O **AWS Glue** é um serviço gerenciado de ETL (Extract, Transform, Load). Ele tem dois componentes principais:

**Glue Data Catalog**: Um armazenamento de metadados que descreve os seus dados no S3 — quais tabelas existem, quais colunas elas têm, onde estão os arquivos de dados. É como um catálogo de fichas para o seu data lake.

**Glue Crawlers**: Agentes automatizados que varrem o S3, inferem o schema e populam o Data Catalog. Rode um crawler no seu bucket S3 e 10 minutos depois você tem um catálogo de todas as suas tabelas.

**Glue Jobs**: Jobs serverless de Spark/Python que realizam a transformação de fato. Você escreve a lógica de transformação (ou usa a ferramenta de ETL visual do Glue), e o Glue a roda em infraestrutura gerenciada.

Para a Nimbus:

1. O Glue Crawler varre os dados de pedidos no S3 → cria uma definição de tabela no Glue Data Catalog
2. O Glue Job transforma os eventos brutos de pedidos em JSON em um formato Parquet limpo e particionado
3. Os dados transformados são escritos de volta no S3 em um layout otimizado para consultas

**Quando o ETL Quebra: O Problema da Evolução de Schema**

O pipeline do Glue rodou de forma limpa nas primeiras três semanas. Então o parceiro de restaurante #412 adicionou um novo campo à sua exportação de cardápio: `allergen_tags`. O campo era um array de strings — `["gluten", "dairy", "nuts"]` — e apareceu na exportação de dados noturna do restaurante.

O schema do Glue job era estrito. Ele tinha sido escrito para esperar campos específicos no JSON do pedido. Quando encontrou `allergen_tags` — um campo que não estava no schema — o Glue job falhou.

Seis horas de dados de pedidos de 47 restaurantes (todos usando o mesmo formato de exportação de cardápio do parceiro #412) se acumularam no S3 sem serem processados. A execução noturna do Glue que deveria tornar os pedidos da noite anterior consultáveis até a manhã tinha, em vez disso, parado às 2h47 e escrito um registro de falha no CloudWatch.

Tom o encontrou quando tentou rodar uma consulta Athena às 9h e obteve `0 rows returned` para as 12 horas anteriores.

"O ETL quebrou porque os dados de origem mudaram?" perguntou Maya, quando Leo explicou o que tinha acontecido.

"O ETL quebrou porque o ETL não sabia como lidar com uma mudança de schema", disse Leo. "Escrevemos um job estrito que esperava exatamente estes campos. Quando um novo campo apareceu, ele entrou em pânico."

"E se alguém tentar invadir por uma mudança de schema?" perguntou Priya. "Um parceiro de restaurante malicioso submetendo deliberadamente campos inesperados para derrubar o pipeline?"

A pergunta valia a pena considerar. Um pipeline de ETL que trava com entrada inesperada é um vetor de negação de serviço: submeta um formato de dados incomum, derrube o pipeline, e aquele restaurante (e todos os outros que compartilham o formato) param de processar.

A correção tinha duas partes:

**Evolução de schema do Glue**: O dynamic frame do Glue oferece suporte à evolução de schema — campos que não estão no schema esperado são repassados em vez de causar falhas. Habilite-a usando DynamicFrames em vez de DataFrames no script do job, com `mergeSchema` definido nas opções adicionais. Os novos campos são adicionados ao schema automaticamente na próxima execução do crawler.

```python
# Before (strict, breaks on new fields)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# After (schema evolution enabled)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Alerta de Glue job**: A falha do pipeline ficou silenciosa por cerca de seis horas antes de Tom notar. Um alarme do CloudWatch no estado de execução do Glue job (`FAILED`) teria alertado o engenheiro de plantão em até 5 minutos. O custo do alarme: dez centavos por mês — efetivamente gratuito (a própria métrica não custa nada, e os primeiros dez alarmes caem na camada gratuita).

"Seis horas de dados ficaram sem processar no S3", disse Leo, depois de rerodar o Glue job manualmente para se atualizar. "Nada foi perdido — mas as analytics estavam atrasadas em todo esse tempo. Se tivéssemos tido o alarme, o atraso teria sido de 30 minutos."

A lição mais ampla: pipelines de ETL que processam dados externos precisam lidar com mudanças de schema de forma elegante. Parceiros externos — restaurantes, provedores de pagamento, serviços de entrega — vão mudar seus formatos de dados. O pipeline não pode ser frágil a essas mudanças.

**A Camada de Consulta: SQL Diretamente no S3**

Agora os dados estavam no S3, em formato Parquet, particionados por data. A peça final: uma forma de fazer perguntas a eles sem carregá-los em um banco de dados primeiro.

O **Amazon Athena** é um serviço de consulta interativo e serverless que roda consultas SQL diretamente nos dados do S3. Sem banco de dados para provisionar, sem dados para carregar. Você define uma tabela (ou usa o Glue Data Catalog), escreve SQL, e o Athena executa a consulta contra os arquivos do S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

O preço do Athena é baseado em quantos dados uma consulta varre. Em us-east-1, us-west-2 e na maioria das regiões principais, as consultas SQL padrão custam US$ 5 por terabyte varrido. Usar o formato Parquet (colunar) com partition pruning (`WHERE year='2024' AND month='09'`) significa que o Athena só varre os arquivos de que precisa, o que reduz dramaticamente o custo.

"Podemos rodar esta consulta para 30 dias de dados", disse Leo, "e pode custar surpreendentemente pouco se a armazenarmos bem."

"Como pode custar tão pouco?" perguntou Maya. "Se está varrendo terabytes de dados, como isso não é caro?"

Leo explicou o Parquet. Em um formato baseado em linhas (JSON, CSV), uma consulta procurando duas colunas de vinte tem de ler todas as vinte. Em um formato colunar como o Parquet, ela lê apenas as duas de que precisa. Para um conjunto de dados de 50TB, uma consulta bem otimizada pode varrer 200GB. A US$ 5/TB, isso é um dólar.

"E se alguém consultar a tabela inteira por acidente?" Maya pressionou.

"Esse é o risco de custo real", disse Leo.

Você pode estar se perguntando: se o Athena cobra por terabyte varrido, uma consulta mal escrita poderia gerar uma conta inesperada grande? Sim — e isso acontece em ambientes de produção reais. Uma consulta contra uma tabela não otimizada de 50TB pode custar mais que toda a sua conta mensal do S3. É por isso que o formato Parquet e o particionamento não são otimizações opcionais — eles são os controles de custo. O Athena também oferece suporte a limites de varredura de consulta por workgroup que limitam quantos dados uma única consulta tem permissão de varrer.

"Para qualquer pergunta arbitrária que pudermos pensar?" perguntou Tom.

"Qualquer pergunta que pudermos expressar em SQL, contra qualquer dado que tenhamos armazenado no S3."

Tom se sentou ao laptop de Leo e escreveu a primeira consulta:

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

A consulta rodou por 11 segundos. O resultado: 20 restaurantes, ordenados pelo tempo médio de confirmação mais rápido, com suas taxas de reordenação ao lado.

Tom encarou a saída.

Os restaurantes que confirmavam mais rápido — aqueles que reconheciam e confirmavam pedidos em uma média de 3-4 minutos — tinham uma taxa média de reordenação de 41%. Os restaurantes que confirmavam mais devagar (tempo médio de confirmação de 18-22 minutos) tinham uma taxa de reordenação de 13%.

"Os restaurantes que confirmam rápido recebem o triplo do negócio recorrente", disse Tom.

"Essa é uma diferença enorme", disse Maya. "Por que a velocidade de confirmação afetaria tanto a taxa de reordenação?"

"Porque o cliente fez um pedido e depois ficou ali olhando o celular", disse Leo. "Se a confirmação chega em 3 minutos, ele se sente seguro. Se chega em 22 minutos — ou nunca — ele se sente ansioso. A ansiedade é a falha do produto, mesmo se a comida chegar bem."

"Isso é um insight de produto", disse Maya. "Não apenas um insight de analytics. Deveríamos mostrar aos restaurantes o benchmark do tempo de confirmação deles comparado com a média da categoria."

A consulta do Athena tinha varrido 1,2 GB de dados (dois meses de pedidos em formato Parquet, particionados por ano e mês). Custo: US$ 0,006.

Meio centavo. Por um insight de negócio que mudou como a Nimbus projetaria o onboarding de restaurantes — quais restaurantes priorizar para coaching de sucesso, quais metas de tempo de confirmação definir como parte dos SLAs de parceiros.

Tom tinha o olhar de alguém recalculando o valor de todos os dados que vinham jogando fora.

"E se alguém tentar invadir pela camada de consulta?" perguntou Priya. "Ou simplesmente um analista que acidentalmente exporta endereços de clientes dos dados brutos de pedidos? PII de clientes, históricos de pedidos, registros financeiros — quem controla quais tabelas são sequer visíveis?"

Antes de ela terminar a pergunta, Leo também tinha percebido o problema operacional: como você impede uma equipe de rodar um full-table scan catastrófico que gera uma conta de US$ 500 no Athena em uma única consulta?

Os **Athena Workgroups** resolvem ambos os problemas simultaneamente.

Um workgroup é uma configuração nomeada que agrupa usuários do Athena e aplica configurações compartilhadas: localização dos resultados da consulta, criptografia e — criticamente — limites de varredura de dados por consulta.

```
Workgroup: analytics-team
  Query scan limit: 10 GB per query
  Action on limit exceeded: Cancel query

Workgroup: engineering-team
  Query scan limit: 100 GB per query
  Action on limit exceeded: Warn only

Workgroup: finance-reports
  Query scan limit: 1 GB per query
  Action on limit exceeded: Cancel query
```

Um analista no workgroup `analytics-team` não pode varrer acidentalmente 50TB de dados e gerar uma cobrança de US$ 250 no Athena. A consulta é cancelada quando excederia 10GB de dados varridos. O analista vê uma mensagem de erro e sabe que precisa adicionar um filtro de partição.

Os workgroups também impõem localizações de resultado separadas por equipe: os resultados de consulta da equipe de engenharia vão para `s3://nimbus-query-results/engineering/`; os resultados da equipe de finanças vão para `s3://nimbus-query-results/finance/`. Sem acesso a resultados de consulta entre equipes.

O IAM controla quais usuários podem usar qual workgroup. Uma função Lambda rodando relatórios automatizados usa o workgroup `finance-reports` (estritamente limitado). Um engenheiro depurando um problema de produção usa o workgroup `engineering-team` (limite mais amplo, avisar não cancelar). O acesso à tabela de eventos brutos (contendo PII de clientes) é restrito ao workgroup `engineering-team` por meio de uma condição IAM na tabela do Glue Data Catalog.

"Isso não é apenas controle de custo", disse Priya. "Isso é controle de acesso. Os workgroups são o ponto de imposição."

Isso respondeu à pergunta dela por completo. Toda discussão de pipeline de dados que pula o controle de acesso eventualmente se torna um incidente de conformidade — e aqui, a equipe de analytics via apenas tabelas de pedidos agregadas, enquanto os eventos brutos com PII de clientes permaneciam atrás de uma autorização IAM explícita. O Glue Data Catalog não era apenas um diretório de schema. Era um limite de controle de acesso.

"Isso não é trabalho extra", disse Priya. "Isso é o design."

**A Arquitetura de Data Lake**

Esses três serviços se combinam no que se chama de **arquitetura de data lake** — um repositório S3 centralizado para todos os seus dados, com ferramentas para processá-los e consultá-los:

```
Applications (orders, menus, events)
    |
    | Real-time events
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (raw)
                                                   |
                                                   | Glue Crawler discovers schema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transform
                                                   ↓
                                              S3 (clean, Parquet, partitioned)
                                                   |
                                                   | SQL queries
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Business Intelligence Tools
                                       (QuickSight, Tableau, etc.)
```

Os dados brutos são sempre preservados (no bucket S3 original). Os dados transformados são consultáveis via Athena. Novas perguntas sempre podem ser respondidas rodando novos Glue jobs nos dados brutos.

**Amazon Redshift: Quando o Athena Não É Suficiente**

Para alguns casos de uso, o Athena é muito lento ou muito caro:

- Consultas muito complexas com muitos joins
- Painéis que rodam a mesma consulta milhares de vezes por dia
- Machine learning em dados estruturados
- Requisitos de tempo de resposta sub-segundo para ferramentas de BI

O **Amazon Redshift** é um data warehouse totalmente gerenciado: um banco de dados analítico colunar projetado para cargas de trabalho analíticas grandes e repetidas. Ao contrário do Athena, que consulta os dados onde eles vivem no S3, o Redshift carrega os dados em um armazenamento de warehouse otimizado e usa otimização de consultas, estratégias de ordenação e estratégias de distribuição para acelerar analytics complexas.

Se o seu volume de dados é pequeno e suas consultas rodam com pouca frequência (semanal ou mensalmente), o Athena com dados S3 bem organizados é suficiente e quase gratuito — mas se você roda os mesmos painéis analíticos centenas de vezes por dia, o armazenamento colunar pré-otimizado do Redshift será mais rápido e, em última análise, mais econômico, apesar de exigir que os dados sejam carregados com antecedência.

O Redshift é significativamente mais rápido para consultas analíticas complexas às custas do custo (capacidade provisionada) e do requisito de carregar os dados antes de consultar.

O **Redshift Serverless** remove o fardo do planejamento de capacidade — você consulta, o Redshift escala. O custo é baseado na capacidade de computação de fato usada, medida em **RPU-horas** e cobrada por segundo (com um mínimo de 60 segundos por ativação), mais armazenamento gerenciado por GB-mês — e nada por computação enquanto o warehouse fica ocioso. (O Athena é o que é cobrado por consulta: US$ 5 por TB varrido.)

Para a Nimbus na escala atual: o Athena é suficiente. A cinco vezes o volume de dados e com ferramentas de BI consultando os mesmos painéis centenas de vezes por dia, o Redshift se tornaria econômico.

**Quando o Athena É a Ferramenta Errada**

"Então qual é a pegadinha?" perguntou Maya. "Por que não usaríamos o Athena para tudo? É serverless, pagamento por consulta, sem infraestrutura — parece perfeito."

Os casos onde o Athena não é a resposta certa:

**Painéis de alta frequência**: Um painel de analytics voltado ao cliente que atualiza a cada 30 segundos e roda 50 consultas por minuto não é um bom caso de uso do Athena. A US$ 5/TB varrido, essas consultas precisam ser extremamente bem otimizadas para serem econômicas nessa frequência. O Redshift ou um banco de dados pré-agregado (até o RDS) é mais apropriado para painéis com requisitos de tempo de resposta sub-segundo.

**Consultas operacionais com requisitos de baixa latência**: Se um agente de atendimento ao cliente precisa buscar um pedido específico em menos de 500ms, o Athena não é a ferramenta — uma busca no DynamoDB ou uma consulta RDS é. O Athena é otimizado para throughput analítico, não para latência operacional. Mesmo uma consulta Athena bem ajustada em um conjunto de dados pequeno tem um overhead de cold-start de 1-3 segundos.

**Sistemas transacionais**: O Athena é somente leitura. Você não pode INSERT, UPDATE ou DELETE registros no Athena (exceto por meio de integrações específicas como o Lake Formation ou o formato de tabela Iceberg, que têm sua própria complexidade). Para cargas de trabalho de escrita operacionais, use um banco de dados transacional.

**Conjuntos de dados muito pequenos e que mudam com frequência**: Se o seu conjunto de dados muda a cada minuto e tem apenas 1GB, carregá-lo no RDS ou DynamoDB e consultá-lo ali é mais simples e mais rápido que rodar consultas Athena contra arquivos S3 que podem estar defasados. O Athena consulta os arquivos S3 como estavam no momento da consulta — se os arquivos foram escritos há 2 minutos, essa é a atualidade que você obtém.

O padrão que emerge: o Athena é excelente para consultas analíticas ad-hoc de larga escala e pouco frequentes contra dados do S3. Para qualquer coisa operacional, transacional ou que exija latência sub-segundo, use o banco de dados operacional apropriado.

**Kinesis vs SQS: Esclarecendo a Confusão**

Esta é a pergunta que surge em toda discussão de arquitetura de dados. O Kinesis e o SQS ambos lidam com mensagens. Quando você usa cada um?

A confusão vem da semelhança superficial: ambos aceitam mensagens de produtores. Ambos entregam essas mensagens a consumidores. Ambos são serviços gerenciados da AWS. Mas seus modelos de dados são fundamentalmente diferentes.

O **SQS (Simple Queue Service)** é uma fila de tarefas. Você coloca uma mensagem. Um consumidor a tira e a processa. Quando o processamento se completa, a mensagem é excluída. Se você tem dez consumidores, cada mensagem vai para exatamente um deles. A mensagem some depois do consumo.

O **Kinesis Data Streams** é um log. Você coloca um registro. Todo consumidor lê todo registro. O consumidor A lê todos eles. O consumidor B também lê todos eles, no seu próprio ritmo. Nenhum dos consumidores exclui o registro — ele permanece no fluxo até o período de retenção expirar. Você pode adicionar um terceiro consumidor a qualquer momento, e ele pode ler desde o começo do fluxo (dentro da janela de retenção).

"Quando você realmente quereria que todo consumidor visse toda mensagem?" perguntou Maya.

A resposta são os casos de uso onde o Kinesis brilha:

**Painel em tempo real + detecção de fraude + arquivo no S3**: Todos os três consomem o mesmo fluxo de eventos de pedidos simultaneamente. Se você usasse o SQS, precisaria publicar em três filas separadas — e quem publica deve conhecer todos os três consumidores. Com o Kinesis, o produtor publica uma vez; qualquer número de consumidores pode ler de forma independente.

**Replay**: Um consumidor falha por 2 horas (limite de concorrência do Lambda atingido, serviço a jusante fora do ar). Com o SQS, essas mensagens já foram excluídas (ou têm um tempo limite de visibilidade definido). Com o Kinesis, o consumidor retoma do seu último checkpoint e processa as 2 horas de registros perdidos. Os dados foram retidos no fluxo (até 365 dias com a Extended Data Retention).

**Ordem dentro de um shard**: Registros com a mesma partition key sempre vão para o mesmo shard, preservando a ordem. Para um sistema de negociação de ações onde você precisa que todas as negociações do símbolo `AMZN` sejam processadas em sequência, o Kinesis garante isso. O SQS FIFO fornece ordenação por grupo mas a um throughput mais baixo (até 3.000 mensagens/segundo por fila com lotes no modo standard — o modo de alto throughput eleva isso para dezenas de milhares — vs. 1 MB/s ou 1.000 registros/s por shard do Kinesis, multiplicado por quantos shards você precisar).

A pergunta decisiva: **Toda mensagem precisa ser consumida por exatamente um consumidor e então descartada?** → SQS. **Cada mensagem precisa ser vista por múltiplos consumidores de forma independente, ou você precisa de capacidade de replay?** → Kinesis.

Para o painel em tempo real da Nimbus: Kinesis. Múltiplos consumidores (painel, detecção de fraude, arquivo no S3) todos lendo o mesmo fluxo.

Para a fila de processamento de pedidos da Nimbus (um pedido feito → uma tarefa ECS o processa): SQS. Um consumidor, sem replay necessário, sem fan-out exigido.

## Visualizando os Dados: Amazon QuickSight

O Athena consulta os dados. O Glue os prepara. Mas em algum momento alguém precisa ver um gráfico — e não rodando consultas SQL no console.

"Realmente precisamos de outro serviço para isso?" perguntou Maya. "Não posso simplesmente exportar os resultados do Athena para uma planilha?"

"Para uma consulta, sim", disse Tom. Ele tinha o olhar de alguém que já tinha tentado isso. "Para um painel que você quer compartilhar com toda a equipe, isso é uma nova planilha toda manhã."

O **Amazon QuickSight** é o serviço gerenciado de business intelligence (BI) da AWS. Ele se conecta diretamente ao Athena, S3, RDS, Redshift e outras fontes, e permite construir painéis e visualizações sem um servidor de BI separado.

Recursos-chave:

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine): O QuickSight pode importar conjuntos de dados para o seu engine em memória para desempenho de consulta sub-segundo em escala, sem reconsultar o Athena a cada carregamento do painel
- **ML Insights:** detecção de anomalias e previsão embutidas — sem necessidade de ciência de dados
- **Painéis incorporados:** você pode incorporar painéis do QuickSight na sua própria aplicação web via uma URL

Tom conectou o QuickSight à fonte de dados do Athena e teve um painel funcional mostrando pedidos diários, receita por restaurante e o funil de conversão em uma tarde.

"Quanto isso custa por mês?" ele perguntou — e então respondeu à própria pergunta antes que qualquer outro pudesse. "O QuickSight roda cerca de US$ 24/mês por autor — as pessoas que constroem os painéis — e US$ 3/mês por leitor. Temos quatro pessoas que o usariam."

"Então cerca de cem dólares por mês", disse Maya.

"Por um serviço de BI que de outra forma exigiria rodar um servidor de analytics separado", disse Priya. "Sim."

Tom publicou o painel. Na manhã seguinte, em vez de rodar consultas Athena, a equipe toda abriu uma URL.

> **Dica de Exame — QuickSight**
>
> O QuickSight é o serviço gerenciado de BI e visualização da AWS. Conecta-se ao Athena, S3, Redshift, RDS. O SPICE é o engine de consulta em memória que acelera consultas repetidas de painel. Gatilho do exame: "painel de business intelligence na AWS" ou "visualizar dados do Athena/Redshift" → QuickSight.

## Governando o Lago: AWS Lake Formation

À medida que o data lake da Nimbus crescia, o acesso aos dados se tornou um problema de governança.

"Quem pode consultar os logs brutos de transações?" perguntou Priya, na revisão de arquitetura seguinte. "Quem pode ver a PII dos clientes? Quem pode acessar as tabelas de resumo financeiro?"

"Engenharia tem acesso total", disse Leo. "A equipe de analytics tem acesso às tabelas agregadas. Finanças tem acesso às tabelas de receita."

"Configurado onde?"

Leo fez uma pausa. "Em... alguns lugares diferentes. As políticas de bucket do S3, as políticas IAM, as permissões do catálogo do Glue."

"Três sistemas separados, todos os quais têm de ser consistentes", disse Priya. "O que acontece quando adicionamos um novo analista? Ou quando decidimos restringir o acesso a uma coluna específica — digamos, números de telefone de clientes — da equipe de analytics?"

Essa pergunta expôs a lacuna. Gerenciar acesso granular a dados entre políticas de bucket do S3, IAM e o Glue Data Catalog simultaneamente era frágil.

O **AWS Lake Formation** é um serviço gerenciado que centraliza o controle de acesso para o seu data lake. Em vez de gerenciar políticas de bucket, políticas IAM e permissões do catálogo do Glue separadamente, o Lake Formation fornece um único lugar para conceder permissões em nível de coluna, em nível de linha e em nível de tabela nos seus dados.

Recursos-chave:

- Fica sobre o S3 e o Glue Data Catalog — sem necessidade de migração de dados
- **Controle de acesso granular:** conceda a usuários ou funções específicas acesso a tabelas, colunas ou até linhas filtradas específicas — o equivalente a permissões em nível de banco de dados em dados do S3
- **Filtragem de dados:** quando um usuário consulta uma tabela governada pelo Lake Formation via Athena, o Lake Formation automaticamente filtra as colunas ou linhas que ele não tem permissão de ver

Priya configurou o Lake Formation com três níveis de permissão, com Rafael redigindo as regras em nível de coluna: a função de engenharia via todas as tabelas e todas as colunas. A função de analytics via as tabelas de pedidos agregadas mas não as colunas de PII de clientes. A função de finanças via as tabelas de receita com os identificadores de clientes mascarados.

"Então o analista roda a mesma consulta Athena", confirmou Leo. "Mas o Lake Formation a intercepta e remove as colunas que ele não está autorizado a ver?"

"Correto. A filtragem é automática. O analista não precisa saber que está acontecendo — e ele não pode contorná-la consultando os arquivos S3 brutos diretamente, porque o Lake Formation controla o acesso no nível do catálogo."

"Isso não é trabalho extra", disse Priya. "Isso é o design."

> **Dica de Exame — Lake Formation**
>
> O Lake Formation centraliza o controle de acesso para um data lake construído sobre o S3 e o Glue Data Catalog. Oferece suporte a permissões granulares em nível de tabela, coluna e linha. Gatilho do exame: "restringir o acesso a colunas específicas em um data lake do S3" ou "centralizar a governança do data lake" → Lake Formation. A distinção chave do IAM puro: o Lake Formation impõe a filtragem em nível de coluna e linha que as políticas IAM sozinhas não conseguem expressar.

## Pontos Fortes e Limitações

**Kinesis Data Streams**: Use o Kinesis quando os seus dados chegam continuamente e a ordem importa — clickstreams, transações financeiras, telemetria de IoT. O Kinesis preserva a ordem dos registros dentro de um shard e permite o replay durante a janela de retenção configurada (24 horas por padrão, até 365 dias com a Extended Data Retention), o que o torna fundamentalmente diferente do SQS. O trade-off é a complexidade operacional: no modo provisionado, você gerencia a capacidade de shards e o comportamento dos consumidores. Para filas de tarefas simples onde a ordem não importa e o replay não é necessário, o SQS é a escolha mais simples.

**AWS Glue**: O Glue elimina a infraestrutura de um cluster de ETL tradicional. Você escreve a lógica de transformação; a AWS gerencia o ambiente Spark. Isso é valioso quando as transformações são complexas ou os volumes de dados são grandes. A limitação é o custo e o cold start — os Glue jobs têm um atraso de inicialização de vários minutos, tornando-os inadequados para transformações quase em tempo real. Para conversões simples de formato de arquivo (CSV para Parquet), o overhead do Glue pode não valer a pena comparado a uma função Lambda ou um script leve.

**Amazon Athena**: O Athena permite consultar dados do S3 com SQL padrão e sem infraestrutura para gerenciar. A restrição crítica é o custo: o Athena cobra por terabyte de dados varrido. Uma consulta contra uma tabela de 10 TB que varre tudo custa significativamente mais que a mesma consulta contra uma tabela em formato Parquet e particionada que varre 200 GB. Sempre use formatos colunares (Parquet ou ORC) e particione seus dados antes de rodar o Athena em produção. Sem essas otimizações, as contas do Athena podem te surpreender.

## Resumo

O trabalho de rede do capítulo 25 tornou o pipeline de dados da Nimbus possível. Este capítulo é para o que esse pipeline serve: tornar todos os dados que a Nimbus vinha gerando de fato visíveis e acionáveis.

- **Amazon Kinesis**: Streaming de dados em tempo real. Os produtores escrevem registros; os consumidores leem no seu próprio ritmo. O Amazon Data Firehose pode então entregar dados de streaming ao S3, Redshift e outros destinos com menos trabalho operacional.
- **AWS Glue**: ETL e catalogação de dados. Os crawlers descobrem schemas; os jobs transformam os dados; o Data Catalog torna os dados descobríveis pelo Athena e outras ferramentas.
- **Amazon Athena**: SQL serverless no S3. Consulte qualquer dado no S3 usando SQL padrão. Cobrado por TB varrido — use Parquet e particionamento para minimizar o custo.
- **Amazon Redshift**: Data warehouse gerenciado para analytics de alto desempenho. Carregue os dados, otimize para consultas analíticas repetidas e consulte rápido em escala de warehouse.
- O **padrão de data lake**: dados brutos para o S3 → o Glue os transforma → o Athena os consulta → as ferramentas de BI os visualizam.
- **Evolução de schema do Glue**: pipelines de ETL que processam dados externos devem lidar com mudanças de schema de forma elegante. Use DynamicFrames com `mergeSchema: true` para evitar falhas de pipeline quando os dados a montante adicionam novos campos.
- **Athena Workgroups**: limites de varredura de dados e localizações de resultado por equipe. Controle de custo e controle de acesso em uma configuração. Obrigatório para qualquer implantação multiequipe do Athena.
- **Kinesis vs SQS**: Kinesis para fan-out a múltiplos consumidores e capacidade de replay. SQS Standard para filas de tarefas simples; SQS FIFO para processamento de tarefas ordenado e desduplicado. A pergunta decisiva: todo consumidor precisa ver toda mensagem, ou cada mensagem vai para um consumidor?
- **Quando o Athena é errado**: painéis de alta frequência (use Redshift), consultas operacionais (use RDS ou DynamoDB), conjuntos de dados muito pequenos e que mudam com frequência (apenas use um banco de dados).
- **Amazon QuickSight**: O serviço gerenciado de BI da AWS. Conecta-se ao Athena, S3, Redshift e RDS para construir painéis sem rodar um servidor de BI separado. O SPICE é o engine em memória que acelera consultas repetidas de painel.
- **AWS Lake Formation**: Controle de acesso centralizado para data lakes no S3 + Glue Data Catalog. Permite permissões em nível de coluna, linha e tabela — governança de dados granular que o IAM sozinho não consegue expressar.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming ordenado, em tempo real, múltiplos consumidores, replay dentro da janela de retenção (24 horas por padrão, até 365 dias). SQS = fila de tarefas, cada mensagem processada uma vez. "Múltiplos consumidores lendo o mesmo fluxo simultaneamente" → Kinesis. "Um worker por mensagem" → SQS.
- **Sinais de exame do Athena**: "SQL serverless no S3", "analisar dados do S3 sem carregá-los em um banco de dados", "pagamento por consulta" → Athena.
- **Otimização de custo do Athena**: Formato colunar (Parquet ou ORC) + particionamento reduz dramaticamente os dados varridos e o custo. O exame pode perguntar como reduzir os custos do Athena.
- **Preços do Athena**: US$ 5 por TB varrido (us-east-1, us-west-2 e a maioria das regiões principais). O custo é calculado sobre os dados varridos, não sobre os dados retornados — sempre otimize o formato de armazenamento antes de rodar consultas de produção.
- **Glue Crawler**: "Descobrir o schema dos dados do S3 automaticamente" → Glue Crawler.
- **Amazon Data Firehose**: "Carregar automaticamente dados de streaming para S3/Redshift/OpenSearch sem gerenciar consumidores" → Amazon Data Firehose. Materiais mais antigos ainda podem chamá-lo de Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift para consultas de alta frequência e complexas em um conjunto de dados fixo (painéis de BI). Athena para consultas ad-hoc em dados do S3 que mudam com frequência.
- **EMR (Elastic MapReduce)**: Clusters Hadoop/Spark gerenciados pela AWS. O exame usa isso quando "cargas de trabalho Hadoop/Spark existentes" ou "frameworks de processamento de dados personalizados" são mencionados. O Glue é a alternativa gerenciada para a maioria dos casos de uso.
- **QuickSight:** BI e visualização gerenciados da AWS. Conecta-se ao Athena, S3, Redshift, RDS. SPICE = engine em memória para consultas repetidas rápidas. Gatilho do exame: "painel de business intelligence na AWS" → QuickSight.
- **Lake Formation:** Controle de acesso centralizado para um data lake (S3 + Glue Data Catalog). Permissões granulares: nível de tabela, coluna e linha. Gatilho do exame: "restringir o acesso a colunas específicas em um data lake do S3" ou "centralizar a governança do data lake" → Lake Formation.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre o Amazon Kinesis e o Amazon SQS. Quando você usaria cada um?

*(Dica: Pense em quantos consumidores podem ler os mesmos dados, se as mensagens são excluídas após a leitura e se a ordem importa.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de transporte por aplicativo quer analisar dados de viagens. 1 milhão de viagens são concluídas diariamente. Os registros de viagem são armazenados no S3 como arquivos JSON (aproximadamente 2KB cada). A equipe de analytics quer rodar consultas SQL ad-hoc como "duração média de viagem por cidade na semana passada". As consultas devem se completar em menos de 2 minutos. Os custos de armazenamento devem ser minimizados. A equipe rodará 20-30 consultas por semana.

Qual arquitetura MELHOR atende a esses requisitos?

A) Usar o AWS Glue para converter JSON em formato Parquet particionado por data e cidade; consultar com o Amazon Athena  
B) Carregar os dados de viagem no RDS PostgreSQL diariamente; consultar usando SQL padrão  
C) Usar o Amazon Data Firehose para entregar os dados de viagem ao Amazon Redshift; consultar com o Redshift  
D) Carregar os dados de viagem no DynamoDB e usar o PartiQL para consultas SQL

**Dica 1**: 20-30 consultas por semana é baixa frequência. Qual serviço é mais econômico para consultas ocasionais?

**Dica 2**: Formato Parquet + particionamento reduz dramaticamente os dados varridos pelo Athena — e, portanto, o custo.

**Dica 3**: 1 milhão de viagens × 2KB = ~2GB por dia. Ao longo de uma semana, ~14GB. A US$ 5/TB para o Athena, mesmo sem otimização, isso é acessível.

**Resposta**: A

**Explicação**: O Glue converte JSON em Parquet (formato colunar reduz dramaticamente os dados varridos) particionado por data e cidade (o partition pruning significa que as consultas de "semana passada" só varrem 7 dias de partições). O Athena consulta o S3 diretamente com SQL padrão. Para 20-30 consultas por semana, o Athena com pagamento por consulta é extremamente econômico vs o Redshift sempre rodando.

**Por que não B?** Carregar 2GB de dados diariamente no RDS, depois consultar, exige uma instância de banco de dados rodando 24 horas por dia. Para 20-30 consultas por semana, isso é amplamente superdimensionado e caro.

**Por que não C?** O Redshift é econômico para consultas de alta frequência (centenas por dia no mesmo conjunto de dados). Para 20-30 consultas por semana, o cluster Redshift sempre ligado custa muito mais que o preço por consulta do Athena.

**Por que não D?** O DynamoDB é um armazenamento de chave-valor/documento otimizado para acesso baseado em chave, não para consultas analíticas ad-hoc. O PartiQL no DynamoDB não oferece suporte ao tipo de agregações GROUP BY descritas.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.5*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer construir um sistema de detecção de fraude em tempo real para os pedidos. O sistema deve:

- Detectar pedidos feitos pela mesma conta mais de 5 vezes em 60 segundos
- Sinalizar pedidos acima de US$ 500 de contas novas (< 30 dias de idade)
- Enviar os pedidos sinalizados para uma fila de revisão humana

Projete a arquitetura. O que o Kinesis fornece? Onde a lógica de fraude roda? Como você correlaciona "mesma conta, janela de 60 segundos"? Qual serviço recebe os pedidos sinalizados?

*(Não há uma resposta única correta. O objetivo é praticar o design de arquitetura de streaming em tempo real.)*

## Cena Pós-Créditos

Tom rodou a primeira consulta Athena.

"Os 10 principais restaurantes por receita no trimestre passado", disse ele.

12 segundos depois, os resultados apareceram.

Ele os encarou.

"O restaurante 47 foi o primeiro", disse ele. Era o restaurante da família de Maya — aquele onde a Nimbus começou.

"Claro que foi", disse Maya. "A arepa é boa desse jeito."

Tom rodou outra consulta. E outra. "Quanto isso custa por mês?" perguntou Tom antes que Leo pudesse dizer qualquer coisa. Leo verificou o histórico de varredura de consultas. Três consultas, total de dados varridos: 1,2GB. Custo: menos de um centavo.

Depois de uma hora, Tom tinha um quadro completo do negócio da Nimbus de uma forma que ele nunca tinha tido antes. Quais categorias de restaurante cresciam mais rápido. Quais cohorts de clientes retinham por mais tempo. Quais itens de cardápio geravam mais pedidos repetidos.

"Por que não construímos isso antes?" ele perguntou.

"Tínhamos os dados", disse Leo. "Apenas não tínhamos o pipeline para usá-los."

"Os dados sempre estiveram lá", disse Maya baixinho. "Apenas não conseguíamos vê-los."

No próximo capítulo: agora que conseguimos ver o negócio claramente, vamos falar sobre como pagar pela infraestrutura que o faz rodar — de forma mais eficiente.
