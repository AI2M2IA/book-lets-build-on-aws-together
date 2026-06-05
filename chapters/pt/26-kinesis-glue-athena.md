# Capítulo 26: Dando Sentido a Tudo

Dados são brutos: timestamps, cliques, eventos, números. Informação é o que você obtém quando os dados são organizados, processados e recebem contexto. A lacuna entre os dois é onde este capítulo vive.

E em sistemas em crescimento, essa lacuna fica cara rapidamente.

A Nimbus estava gerando enormes quantidades de dados. Cada pedido: registrado. Cada visualização de cardápio: registrada. Cada atualização de restaurante: capturada. Cada interação de cliente: rastreada.

Tom tinha uma pergunta.

"Qual é o nosso horário de pico de pedidos nas sextas-feiras?"

Leo olhou para ele. "Isso não está no nosso painel."

"Podemos adicionar?"

"Os dados estão no DynamoDB. E nos logs do CloudWatch. E no S3, a partir do trabalho de exportação de análises." Leo fez uma pausa. "Em três lugares diferentes, em três formatos diferentes."

Maya acrescentou: "E a exportação de análises só é executada uma vez por noite. Se você quiser os dados de sexta, teria que esperar até sábado de manhã."

Tom olhou para a tela. "Então temos os dados. Só não conseguimos usá-los."

Essa frase descreve metade da análise de dados moderna.

Esse é o problema de engenharia de dados: você tem dados, mas não em uma forma que possa analisar quando precisa.

**Três Problemas Diferentes**

O problema de dados da Nimbus tinha três dimensões:

**Streaming em tempo real**: Pedidos estão sendo feitos agora. Você quer ver um painel ao vivo da velocidade de pedidos — quantos por minuto, por região, por restaurante. Os dados precisam ser processados à medida que chegam.

**Transformação de dados**: Os dados estão no S3 de vários sistemas, em diferentes formatos (JSON, CSV, Parquet). Antes de poder analisá-los, você precisa normalizá-los — mesmo esquema, mesmo formato, limpos, unidos com dados de referência.

**Análise ad-hoc**: Uma vez que os dados estejam organizados, você quer executar consultas SQL contra eles sem precisar carregá-los em um banco de dados primeiro. "Me dê os 10 principais restaurantes por receita nos últimos 30 dias." Sem carregar os dados em um banco de dados.

Cada um desses é um problema distinto. A AWS tem um serviço dedicado para cada um:

- **Amazon Kinesis**: Dados de streaming em tempo real
- **AWS Glue**: Transformação e catalogação de dados
- **Amazon Athena**: Consultas SQL serverless no S3

**Amazon Kinesis: O Ticker Tape em Tempo Real**

O **Amazon Kinesis Data Streams** é um serviço de streaming de dados em tempo real. Os produtores enviam registros de dados para o stream. Múltiplos consumidores podem ler do stream simultaneamente, cada um no seu próprio ritmo.

Pense em uma máquina de ticker tape: os preços são impressos continuamente, todos podem ler a fita e a fita não desacelera para nenhum leitor individual.

Para a Nimbus, quando um pedido é feito, a aplicação publica um evento em um stream Kinesis: `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consumidores deste stream:

- Um painel em tempo real (lê os eventos à medida que chegam, atualiza as métricas)
- Um Lambda de detecção de fraudes (procura padrões de pedidos incomuns)
- Um stream para S3 para armazenamento permanente

**Conceitos do Kinesis Data Streams**:

- **Shard**: A unidade básica de capacidade. Um shard lida com 1 MB/s de escrita, 2 MB/s de leitura.
- **Período de retenção**: Os dados permanecem no stream por 24 horas (padrão) a 7 dias.
- **Número de sequência**: Cada registro tem um número de sequência. Os consumidores rastreiam sua posição no stream.

O **Amazon Data Firehose** (anteriormente **Kinesis Data Firehose**): O serviço de entrega gerenciado entre produtores de streaming e destinos como S3, Redshift e OpenSearch. Ele armazena em buffer, comprime, transforma e entrega dados automaticamente.

Para a Nimbus: Kinesis Data Streams → Amazon Data Firehose → S3 (formato Parquet, comprimido, particionado por data).

**AWS Glue: O Tradutor**

Os dados no S3 são brutos. Antes de poder analisá-los de forma eficiente, você precisa:

- Descobrir o que está lá e seu esquema (quais colunas, quais tipos)
- Transformá-los em um formato consistente
- Unir diferentes conjuntos de dados
- Lidar com registros inválidos, mudanças de esquema, valores ausentes

O **AWS Glue** é um serviço ETL (Extração, Transformação, Carregamento) totalmente gerenciado. Ele tem dois componentes principais:

**Glue Data Catalog**: Um repositório de metadados que descreve os seus dados no S3 — quais tabelas existem, quais colunas elas têm, onde estão os arquivos de dados. É como um catálogo de fichas para o seu data lake.

**Glue Crawlers**: Agentes automatizados que verificam o S3, inferem o esquema e populam o Data Catalog. Execute um crawler no seu bucket S3 e 10 minutos depois você tem um catálogo de todas as suas tabelas.

**Glue Jobs**: Trabalhos Spark/Python serverless que realizam a transformação real. Você escreve a lógica de transformação (ou usa a ferramenta ETL visual do Glue), e o Glue a executa em infraestrutura gerenciada.

Para a Nimbus:

1. Glue Crawler verifica os dados de pedidos no S3 → cria uma definição de tabela no Glue Data Catalog
2. Glue Job transforma os eventos de pedidos JSON brutos em um formato Parquet limpo e particionado
3. Os dados transformados são gravados de volta no S3 em um layout otimizado para consultas

**Amazon Athena: O Bibliotecário**

O **Amazon Athena** é um serviço de consulta interativo serverless que executa consultas SQL diretamente em dados do S3. Sem banco de dados para provisionar, sem dados para carregar. Você define uma tabela (ou usa o Glue Data Catalog), escreve SQL e o Athena executa a consulta nos arquivos S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

O preço do Athena é baseado em quanto dados uma consulta verifica. Em muitas regiões, consultas SQL padrão começam em US$ 5 por terabyte verificado. Usar o formato Parquet (colunar) com particionamento (`WHERE year='2024' AND month='01'`) significa que o Athena verifica apenas os arquivos de que precisa, o que reduz drasticamente o custo.

"Podemos executar essa consulta para 30 dias de dados," disse Leo, "e pode custar surpreendentemente pouco se armazenarmos bem."

"Para qualquer pergunta arbitrária que possamos pensar?" perguntou Tom.

"Qualquer pergunta que possamos expressar em SQL, contra quaisquer dados que tenhamos armazenado no S3."

Tom tinha a expressão de alguém recalculando o valor de todos os dados que havia descartado.

**A Arquitetura de Data Lake**

Esses três serviços se combinam no que se chama de **arquitetura de data lake** — um repositório S3 centralizado para todos os seus dados, com ferramentas para processá-los e consultá-los:

```
Aplicações (pedidos, cardápios, eventos)
    |
    | Eventos em tempo real
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (bruto)
                                                   |
                                                   | Glue Crawler descobre esquema
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transformam
                                                   ↓
                                              S3 (limpo, Parquet, particionado)
                                                   |
                                                   | Consultas SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Ferramentas de Business Intelligence
                                       (QuickSight, Tableau, etc.)
```

Os dados brutos são sempre preservados (no bucket S3 original). Os dados transformados são consultáveis via Athena. Novas perguntas podem sempre ser respondidas executando novos trabalhos Glue nos dados brutos.

**Amazon Redshift: Quando o Athena Não É Suficiente**

Para alguns casos de uso, o Athena é lento demais ou caro demais:

- Consultas muito complexas com muitas junções
- Painéis que executam a mesma consulta milhares de vezes por dia
- Aprendizado de máquina em dados estruturados
- Requisitos de tempo de resposta sub-segundo para ferramentas de BI

O **Amazon Redshift** é um data warehouse totalmente gerenciado: um banco de dados de análise colunar projetado para grandes cargas de trabalho analíticas repetidas. Ao contrário do Athena, que consulta os dados onde eles vivem no S3, o Redshift carrega os dados em armazenamento de warehouse otimizado e usa otimização de consultas, estratégias de ordenação e estratégias de distribuição para acelerar análises complexas.

O Redshift é significativamente mais rápido para consultas de análise complexas à custa de custo (capacidade provisionada) e do requisito de carregar os dados antes de consultá-los.

O **Redshift Serverless** remove o fardo do planejamento de capacidade — você consulta, o Redshift escala. O custo é por consulta.

Para a Nimbus na escala atual: o Athena é suficiente. Com cinco vezes o volume de dados e ferramentas de BI consultando os mesmos painéis centenas de vezes por dia, o Redshift se tornaria econômico.

## Pontos Fortes e Limitações

**Kinesis Data Streams**: Use o Kinesis quando seus dados chegam continuamente e a ordem importa — clickstreams, transações financeiras, telemetria de IoT. O Kinesis preserva a ordem dos registros dentro de um shard e permite a reprodução durante a janela de retenção configurada, o que o torna fundamentalmente diferente do SQS. A contrapartida é a complexidade operacional: no modo provisionado, você gerencia a capacidade de shard e o comportamento dos consumidores. Para filas de tarefas simples onde a ordem não importa e a reprodução não é necessária, o SQS é a escolha mais simples.

**AWS Glue**: O Glue elimina a infraestrutura de um cluster ETL tradicional. Você escreve a lógica de transformação; a AWS gerencia o ambiente Spark. Isso é valioso quando as transformações são complexas ou os volumes de dados são grandes. A limitação é o custo e o cold start — os trabalhos do Glue têm um atraso de inicialização de vários minutos, tornando-os inadequados para transformações quase em tempo real. Para conversões simples de formato de arquivo (CSV para Parquet), a sobrecarga do Glue pode não valer a pena em comparação com uma função Lambda ou um script leve.

**Amazon Athena**: O Athena permite consultar dados do S3 com SQL padrão e sem infraestrutura para gerenciar. A restrição crítica é o custo: o Athena cobra por terabyte de dados verificados. Uma consulta em uma tabela de 10 TB que verifica tudo custa significativamente mais do que a mesma consulta em uma tabela Parquet formatada e particionada que verifica 200 GB. Sempre use formatos colunares (Parquet ou ORC) e particione seus dados antes de executar o Athena em produção. Sem essas otimizações, as contas do Athena podem te surpreender.

## Resumo

- **Amazon Kinesis**: Streaming de dados em tempo real. Os produtores escrevem registros; os consumidores leem no seu próprio ritmo. O Amazon Data Firehose pode então entregar dados de streaming para S3, Redshift e outros destinos com menos trabalho operacional.
- **AWS Glue**: ETL e catalogação de dados. Os Crawlers descobrem esquemas; os Jobs transformam dados; o Data Catalog torna os dados descobríveis pelo Athena e outras ferramentas.
- **Amazon Athena**: SQL serverless no S3. Consulte quaisquer dados no S3 usando SQL padrão. Preço por TB verificado — use Parquet e particionamento para minimizar o custo.
- **Amazon Redshift**: Data warehouse gerenciado para análises de alto desempenho. Carregue dados, otimize para consultas analíticas repetidas e consulte rapidamente em escala de warehouse.
- O **padrão de data lake**: dados brutos para S3 → Glue os transforma → Athena os consulta → ferramentas de BI os visualizam.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.5)*

- **Kinesis vs SQS**: Kinesis = streaming ordenado em tempo real, múltiplos consumidores, reprodução dentro da janela de retenção. SQS = fila de tarefas, cada mensagem processada uma vez. "Múltiplos consumidores lendo o mesmo stream simultaneamente" → Kinesis. "Um trabalhador por mensagem" → SQS.
- **Sinais do Athena**: "SQL serverless no S3," "analisar dados do S3 sem carregá-los em um banco de dados," "pagar por consulta" → Athena.
- **Otimização de custo do Athena**: Formato colunar (Parquet ou ORC) + particionamento reduz drasticamente os dados verificados e o custo. O exame pode perguntar como reduzir os custos do Athena.
- **Glue Crawler**: "Descobrir esquema de dados S3 automaticamente" → Glue Crawler.
- **Amazon Data Firehose**: "Carregar automaticamente dados de streaming para S3/Redshift/OpenSearch sem gerenciar consumidores" → Amazon Data Firehose. Materiais mais antigos ainda podem chamá-lo de Kinesis Data Firehose.
- **Redshift vs Athena**: Redshift para consultas frequentes e complexas em um conjunto de dados fixo (painéis de BI). Athena para consultas ad-hoc em dados S3 que mudam frequentemente.
- **EMR (Elastic MapReduce)**: Clusters Hadoop/Spark gerenciados pela AWS. O exame usa isso quando "cargas de trabalho Hadoop/Spark existentes" ou "frameworks de processamento de dados personalizados" são mencionados. O Glue é a alternativa gerenciada para a maioria dos casos de uso.

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre Amazon Kinesis e Amazon SQS. Quando você usaria cada um?

*(Dica: Pense em quantos consumidores podem ler os mesmos dados, se as mensagens são excluídas após a leitura e se a ordem importa.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa de transporte por aplicativo quer analisar dados de viagens. 1 milhão de viagens são concluídas diariamente. Os registros de viagens são armazenados no S3 como arquivos JSON (aproximadamente 2 KB cada). A equipe de análise quer executar consultas SQL ad-hoc como "duração média de viagem por cidade na semana passada." As consultas devem ser concluídas em menos de 2 minutos. Os custos de armazenamento devem ser minimizados. A equipe executará 20-30 consultas por semana.

Qual arquitetura MELHOR atende a esses requisitos?

A) Carregar dados de viagens no RDS PostgreSQL diariamente; consultar usando SQL padrão  
B) Usar o AWS Glue para converter JSON para o formato Parquet particionado por data e cidade; consultar com o Amazon Athena  
C) Usar o Amazon Data Firehose para entregar dados de viagens para o Amazon Redshift; consultar com o Redshift  
D) Carregar dados de viagens no DynamoDB e usar PartiQL para consultas SQL

**Dica 1**: 20-30 consultas por semana é baixa frequência. Qual serviço é mais econômico para consultas ocasionais?

**Dica 2**: Formato Parquet + particionamento reduz drasticamente os dados verificados pelo Athena — e portanto o custo.

**Dica 3**: 1 milhão de viagens × 2 KB = ~2 GB por dia. Em uma semana, ~14 GB. A US$ 5/TB para o Athena, mesmo sem otimização, isso é acessível.

**Resposta**: B

**Explicação**: O Glue converte JSON para Parquet (o formato colunar reduz drasticamente os dados verificados) particionado por data e cidade (a eliminação de partições significa que consultas de "semana passada" verificam apenas 7 dias de partições). O Athena consulta o S3 diretamente com SQL padrão. Para 20-30 consultas por semana, o Athena com pagamento por consulta é extremamente econômico em comparação com o Redshift sempre ativo.

**Por que não A?** Carregar 2 GB de dados diariamente no RDS e depois consultar requer uma instância de banco de dados funcionando 24/7. Para 20-30 consultas por semana, isso é superdimensionado e caro.

**Por que não C?** O Redshift é econômico para consultas de alta frequência (centenas por dia no mesmo conjunto de dados). Para 20-30 consultas por semana, o cluster Redshift sempre ativo custa muito mais do que o preço por consulta do Athena.

**Por que não D?** O DynamoDB é um repositório de chave-valor/documento otimizado para acesso baseado em chave, não consultas analíticas ad-hoc. O PartiQL no DynamoDB não suporta os tipos de agregações GROUP BY descritas.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.5*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer construir um sistema de detecção de fraudes em tempo real para pedidos. O sistema deve:

- Detectar pedidos feitos pela mesma conta mais de 5 vezes em 60 segundos
- Sinalizar pedidos acima de US$ 500 de contas novas (< 30 dias de idade)
- Enviar pedidos sinalizados para uma fila de revisão humana

Projete a arquitetura. O que o Kinesis fornece? Onde a lógica de fraude é executada? Como você correlaciona "mesma conta, janela de 60 segundos"? Qual serviço recebe os pedidos sinalizados?

*(Não há uma única resposta correta. O objetivo é praticar o design de arquitetura de streaming em tempo real.)*

## Cena Pós-Créditos

Tom executou a primeira consulta Athena.

"Os 10 principais restaurantes por receita no último trimestre," disse ele.

12 segundos depois, os resultados apareceram.

Ele os encarou.

"O restaurante 47 foi o primeiro," disse ele. Era o restaurante da família de Maya — onde a Nimbus começou.

"É claro que foi," disse Maya. "Arepa é assim."

Tom executou outra consulta. E mais outra. Cada uma respondida em segundos, cada uma custando frações de centavo.

Após uma hora, ele tinha uma imagem completa do negócio da Nimbus de uma forma que nunca havia tido antes. Quais categorias de restaurantes cresceram mais rápido. Quais coortes de clientes mantiveram a fidelidade por mais tempo. Quais itens de cardápio geraram mais pedidos recorrentes.

"Por que não construímos isso mais cedo?" ele perguntou.

"Tínhamos os dados," disse Leo. "Só não tínhamos o pipeline para usá-los."

"Os dados sempre estiveram lá," disse Maya em voz baixa. "Só não conseguíamos vê-los."

No próximo capítulo: agora que podemos ver o negócio com clareza, vamos falar sobre como pagar pela infraestrutura que o executa — de forma mais eficiente.
