# Capítulo 24: O Banco de Dados Que Cresce Com Você

A revisão de custos de Tom havia encontrado algo inesperado na camada de banco de dados.

A Nimbus estava executando RDS PostgreSQL: Multi-AZ, instância db.r6g.large. US$ 340/mês.

"Isso parece alto," disse Tom. "Mas não sei com o que comparar."

Leo puxou as métricas de desempenho. A CPU do banco de dados estava atingindo 85% durante a correria do jantar de sexta-feira. As consultas de leitura estavam em fila. A latência de consulta P95 havia dobrado em seis meses.

"O banco de dados é o gargalo," disse ele. "O tráfego cresceu. O banco de dados não acompanhou."

"Podemos simplesmente usar uma instância maior?" perguntou Maya.

"Sim," disse Leo. "Isso é escalonamento vertical. Passamos de r6g.large para r6g.xlarge. Mais CPU, mais memória. Vai custar mais e nos dar um tempo."

"Mas não resolve o problema subjacente," disse Priya. "Eventualmente chegaremos à maior instância e precisaremos de uma abordagem diferente."

"Existem duas abordagens," disse Leo. "Réplicas de leitura ou Aurora."

"Qual é a diferença?"

Uma boa pergunta. O restante deste capítulo é a resposta.

Pense em uma biblioteca movimentada com um único bibliotecário que tanto devolve livros quanto responde às perguntas dos frequentadores. Quando a biblioteca fica popular, forma-se uma fila. A solução: contratar mais bibliotecários — mas apenas para responder às perguntas. As devoluções ainda passam pela mesa original. Isso é uma réplica de leitura: capacidade extra que lida com leituras, enquanto todas as escritas ainda passam pela única fonte autoritativa. O Aurora vai um passo além, redesenhando o próprio sistema de prateleiras para que cada bibliotecário compartilhe as mesmas prateleiras e veja sempre os mesmos livros, sem atraso.

**Réplicas de Leitura: Distribuindo o Tráfego de Leitura**

A maioria das aplicações web lê dados muito mais frequentemente do que os escreve. Um cliente navegando pelo cardápio faz dezenas de consultas SELECT. Fazer um pedido faz algumas consultas INSERT/UPDATE. A proporção é tipicamente 10:1 ou maior.

Uma **réplica de leitura** é uma instância RDS adicional que recebe uma cópia de todas as escritas do primário e disponibiliza essas escritas para consultas SELECT.

Como funciona:

1. As escritas da aplicação (INSERT, UPDATE, DELETE) vão para o banco de dados primário
2. O primário replica essas mudanças de forma assíncrona para as réplicas de leitura
3. As leituras da aplicação (SELECT) são distribuídas pelas réplicas de leitura
4. As réplicas de leitura compartilham a carga — cada uma lida com uma fração do tráfego total de leitura

O resultado: o banco de dados primário lida apenas com escritas (e opcionalmente algumas leituras). As réplicas de leitura lidam com a carga de leitura. Para uma proporção de leitura/escrita de 10:1, adicionar uma réplica de leitura reduz aproximadamente pela metade a carga total do primário.

**Limitação importante**: A replicação é **assíncrona**. Há um atraso de replicação — tipicamente milissegundos, mas pode ser segundos sob carga. Uma leitura de uma réplica pode ver dados ligeiramente defasados em relação ao primário. Para a maioria das leituras (navegar pelo cardápio, ver o histórico de pedidos), isso é aceitável. Para "meu pedido acabou de ser feito?" — leia do primário.

**Réplicas de Leitura: Os Detalhes**

- Você pode ter até 5 réplicas de leitura por instância RDS primária
- As réplicas de leitura podem estar na mesma região ou em uma região diferente (réplicas entre regiões)
- As réplicas de leitura podem ter suas próprias réplicas de leitura (encadeamento)
- As réplicas de leitura são endpoints separados — sua aplicação deve direcionar as leituras para o endpoint da réplica
- As réplicas de leitura podem ser promovidas a bancos de dados autônomos (útil para DR)

Para a Nimbus, Leo adicionou uma réplica de leitura. Ele atualizou a aplicação para:

- Operações de escrita → endpoint primário
- Navegação pelo cardápio, histórico de pedidos → endpoint da réplica

A CPU no primário caiu de 85% para 41% no pico.

Tom olhou para o custo: uma réplica de leitura do mesmo tipo de instância custa o mesmo que o primário. De US$ 340/mês para US$ 680/mês.

"Dobramos o custo para reduzir aproximadamente à metade a carga," disse Tom.

"Sim. Mas a alternativa era passar para um tipo de instância maior, que também custaria mais e não distribuiria a carga de leitura."

Tom fez as contas. Assentiu, relutantemente.

"O que é o Aurora?" perguntou ele.

**Amazon Aurora: Repensando o Motor de Banco de Dados**

O Aurora é o motor de banco de dados proprietário da AWS, compatível com MySQL e PostgreSQL. Foi projetado do zero para cargas de trabalho em nuvem, reimaginando como funciona a camada de armazenamento de um banco de dados relacional.

Em uma configuração RDS tradicional (MySQL, PostgreSQL), o armazenamento e a computação estão fortemente acoplados. O motor de banco de dados gerencia os arquivos de dados. A replicação copia os dados do primário para a réplica. A réplica deve refazer cada operação de escrita.

O Aurora separa o armazenamento da computação. Ele usa uma camada de armazenamento distribuída e tolerante a falhas que replica os dados automaticamente em três Zonas de Disponibilidade em seis cópias. A camada de computação (as instâncias de banco de dados) fica em cima dessa camada de armazenamento.

**O que isso muda**:

**Réplicas de leitura**: As réplicas do Aurora não precisam replicar dados — elas já compartilham a mesma camada de armazenamento. Isso significa:

- Até 15 réplicas de leitura (vs 5 para RDS convencional)
- O atraso de replicação é tipicamente inferior a 100 milissegundos (vs segundos para RDS sob carga)
- As réplicas podem ser promovidas a primárias em menos de 30 segundos (vs minutos)

**Failover**: Como as réplicas compartilham o armazenamento, o failover é muito mais rápido — a promoção não envolve transferência de dados, apenas redirecionamento das escritas.

**Armazenamento**: O Aurora escala automaticamente o armazenamento em incrementos de 10 GB, até 128 TB. Você nunca provisiona armazenamento antecipadamente.

**Desempenho**: O Aurora afirma ter 5x o throughput do MySQL padrão e 3x o do PostgreSQL padrão para tipos de instância equivalentes.

**Preços do Aurora: A Pergunta de Tom**

"Quanto custa?" perguntou Tom.

O preço do Aurora é diferente do RDS:

**Preço da instância**: Semelhante ao preço da instância RDS por tipo.

**Preço do armazenamento**: US$ 0,10 por GB por mês (você paga pelo que está armazenado, escalado automaticamente).

**Preço de E/S**: O Aurora cobra por requisição de E/S (leitura/escrita no armazenamento). Isso pode ser significativo para cargas de trabalho com muita escrita.

"Espera," disse Tom. "Estamos pagando pela E/S separadamente?"

"O Aurora Serverless v2 e o Aurora I/O-Optimized mudam esse modelo de preços," disse Leo. "O Aurora I/O-Optimized não cobra taxa de E/S, mas tem um preço mais alto de armazenamento e instância. Melhor para cargas de trabalho com muita E/S."

Tom olhou para a troca. Para a Nimbus, que era pesada em leitura (muitas consultas ao cardápio, poucas escritas), o Aurora I/O-Optimized poderia custar mais. O preço padrão do Aurora poderia ser mais adequado.

Essa é uma decisão real de custo que engenheiros sênior tomam: você precisa conhecer os padrões de E/S da sua carga de trabalho para escolher corretamente.

**Aurora Serverless: Escalonamento Sem Pensar em Instâncias**

O **Aurora Serverless v2** é uma configuração que escala automaticamente a capacidade de computação com base na carga real do banco de dados. Em vez de escolher um tamanho de instância fixo (db.r6g.large), você define uma capacidade mínima e máxima em Aurora Capacity Units (ACUs).

Aurora Serverless v2:

- Escala em segundos quando a carga aumenta
- Escala até quase zero durante períodos ociosos
- Custo: US$ 0,12 por ACU-hora (mais armazenamento e E/S)

Para cargas de trabalho com tráfego variável — os picos de sexta-feira da Nimbus vs a tranquilidade da manhã de segunda-feira — o Serverless v2 reduz os custos durante os períodos de baixo movimento e lida com os picos sem pré-provisionamento.

"Então durante o pico de sexta-feira," disse Leo, "o Aurora escala automaticamente para cima. No domingo de manhã, quando temos quase nenhum tráfego, ele volta ao mínimo."

"E pagamos apenas pela capacidade que estamos usando," disse Tom.

"Correto."

Tom tinha a expressão de alguém que havia encontrado exatamente o que estava procurando.

**Aurora Global Database: Leituras em Múltiplas Regiões**

O **Aurora Global Database** estende o Aurora por múltiplas regiões AWS:

- **Uma região primária** lida com todas as escritas
- **Até cinco regiões secundárias** servem leituras com atraso de replicação tipicamente < 1 segundo
- As regiões secundárias podem ser promovidas a primárias em menos de 1 minuto (para cenários de DR)

Para a expansão global da Nimbus, o Aurora Global Database permitiria que um parceiro restaurante em Londres consultasse seu cardápio local a partir da réplica de leitura da UE, enquanto todos os pedidos (escritas) ainda passam pelo primário nos EUA.

**RDS vs Aurora: Quando Escolher Cada Um**

| Fator             | RDS (PostgreSQL/MySQL)          | Aurora                                                       |
|-------------------|---------------------------------|--------------------------------------------------------------|
| Custo             | Menor para cargas de trabalho pequenas | Maior custo base, mas escala melhor               |
| Compatibilidade   | Total                           | Compatível com MySQL/PostgreSQL (com pequenas diferenças)    |
| Máx. de réplicas  | 5                               | 15                                                           |
| Atraso de réplica | Pode ser segundos               | Geralmente <100ms                                            |
| Armazenamento     | Provisionamento fixo            | Escalado automaticamente até 128 TB                          |
| Tempo de failover | 60-120 segundos                 | <30 segundos                                                 |
| Opção serverless  | Limitada                        | Aurora Serverless v2                                         |
| Ideal para        | Cargas de trabalho estáveis e previsíveis | Tráfego variável, alto volume de leitura, necessidade de failover rápido |

## Pontos Fortes e Limitações

**Pontos fortes do Aurora**:

- Failover significativamente mais rápido do que o RDS padrão
- Até 15 réplicas de leitura com atraso mínimo
- Armazenamento com escalonamento automático
- Serverless v2 para cargas de trabalho variáveis
- Global Database para implantação em múltiplas regiões

**Limitações do Aurora**:

- Maior custo para cargas de trabalho pequenas e estáveis
- O preço de E/S pode ser significativo para cargas de trabalho com muita escrita (use o I/O-Optimized para isso)
- Pequenas diferenças de compatibilidade com MySQL/PostgreSQL podem exigir alterações no código
- Cold starts do Serverless v2 (de quase zero) podem causar picos de latência

## Resumo

- **Réplicas de leitura** distribuem o tráfego de leitura do primário. Replicação assíncrona — atraso ligeiro aceitável para a maioria das leituras.
- O **Aurora** reimagina a camada de armazenamento: distribuída, compartilhada entre réplicas, com escalonamento automático.
- O Aurora oferece: 15 réplicas de leitura, atraso de réplica <100ms, failover <30s, armazenamento com escalonamento automático até 128 TB.
- **Aurora Serverless v2**: escala automaticamente a capacidade de computação com base na carga. Bom para tráfego variável.
- **Aurora Global Database**: primário em uma região, réplicas de leitura em até cinco regiões.
- Escolha RDS para cargas de trabalho menores, estáveis e previsíveis. Escolha Aurora quando precisar de escala, failover rápido ou lidar com tráfego variável.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- **Réplica Aurora vs réplica de leitura RDS**: As réplicas Aurora compartilham o armazenamento (atraso quase zero, failover <30s). As réplicas de leitura RDS replicam dados (atraso possível, minutos para failover).
- **Aurora Serverless v2**: "escalonamento automático da capacidade do banco de dados," "tráfego de banco de dados imprevisível ou irregular," "escalonamento até zero" → Aurora Serverless v2.
- **Aurora Global Database**: "banco de dados em múltiplas regiões," "leitura da UE com baixa latência a partir do primário nos EUA," "RTO < 1 minuto para failover regional" → Aurora Global Database.
- **Tempo de failover**: Aurora < 30 segundos. RDS Multi-AZ 60-120 segundos. Conheça os dois.
- **Aurora I/O-Optimized**: Maior custo de armazenamento e instância, sem cobrança por E/S. Use quando os custos de E/S dominam (muita escrita). Aurora padrão: menor custo de armazenamento, pague por E/S. Use para muita leitura.
- **Aurora Backtrack**: Retrocede o banco de dados para um ponto específico no tempo sem restaurar a partir de um snapshot de backup. Disponível apenas para Aurora compatível com MySQL. Sinal do exame: "dados excluídos acidentalmente, precisa recuperar rapidamente sem restaurar um backup completo."

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre o Aurora e as réplicas de leitura do RDS padrão. Por que o atraso de replicação do Aurora é tipicamente menor?

*(Dica: A diferença fundamental é armazenamento compartilhado vs replicação de dados. Pense no que cada réplica deve fazer quando uma escrita chega.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: O banco de dados MySQL de uma plataforma de redes sociais está experimentando alta latência de leitura devido ao aumento do tráfego. A aplicação é pesada em leitura (95% leituras, 5% escritas). A equipe precisa que a latência de leitura seja consistente, mesmo durante picos de tráfego. Eles precisam de failover automático com tempo de inatividade mínimo (RTO alvo < 30 segundos). O volume de dados está crescendo de forma imprevisível.

Qual solução de banco de dados MELHOR atende a esses requisitos?

A) RDS MySQL Multi-AZ com cinco réplicas de leitura  
B) Aurora MySQL com Réplicas Aurora e Aurora Serverless v2  
C) RDS MySQL com um tipo de instância maior (escalonamento vertical)  
D) DynamoDB com DynamoDB DAX para cache de leitura

**Dica 1**: "RTO < 30 segundos" — qual serviço consegue isso? Verifique o tempo de failover para cada opção.

**Dica 2**: "Latência de leitura consistente durante picos" — qual serviço tem réplicas com atraso quase zero vs possíveis segundos de atraso?

**Dica 3**: "Volume de dados crescendo de forma imprevisível" — qual serviço escala o armazenamento automaticamente?

**Resposta**: B

**Explicação**: O Aurora MySQL com Réplicas Aurora fornece atraso de replicação quase zero (milissegundos, não segundos) para desempenho consistente de leitura sob carga. O Aurora Serverless v2 escala automaticamente a computação durante picos de tráfego sem superprovisionamento. O armazenamento do Aurora escala automaticamente à medida que os dados crescem. O failover do Aurora (promoção de uma réplica) é concluído em menos de 30 segundos — atendendo ao requisito de RTO.

**Por que não A?** O failover do RDS Multi-AZ leva 60-120 segundos — não atende ao RTO < 30 segundos. O atraso das réplicas de leitura do RDS padrão pode chegar a segundos sob carga — latência de leitura "consistente" é mais difícil de garantir.

**Por que não C?** O escalonamento vertical (instância maior) aumenta a capacidade, mas não distribui a carga de leitura. O banco de dados continua sendo um ponto único de falha para leituras.

**Por que não D?** O DynamoDB é NoSQL — migrar do MySQL para o DynamoDB requer rearquitetar o modelo de dados e as consultas da aplicação, o que está muito além do escopo desta tarefa de melhoria de desempenho.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está projetando uma expansão global. Eles querem que os parceiros restaurantes na Costa Oeste, na Alemanha e na Austrália vejam seus próprios dados de pedidos rapidamente, sem latência entre regiões. No entanto, todas as escritas devem passar por um único primário no US-East para manter a consistência.

Projete a arquitetura de banco de dados usando o Aurora. Como você estruturaria o Global Database? O que acontece se o primário no US-East cair? Como você lidaria com o processo de promoção?

*(Não há uma única resposta correta. O objetivo é praticar o design de banco de dados em múltiplas regiões.)*

## Cena Pós-Créditos

Leo migrou para o Aurora com Serverless v2.

O pico de sexta-feira veio e foi. A CPU nunca ultrapassou 60%. A latência de consulta permaneceu consistente. O Aurora havia escalado automaticamente para lidar com a carga e depois voltou ao normal após o rush.

"Quanto isso custou em comparação com a sexta-feira passada?" perguntou Tom na manhã de segunda-feira.

Leo abriu o explorador de faturamento. "Na sexta-feira o pico foi de US$ 0,89/hora. Na manhã de sábado foi de US$ 0,11/hora."

Tom ficou em silêncio.

"A configuração antiga era um custo fixo de US$ 0,47/hora independentemente da carga," acrescentou Leo.

"Então pagamos mais durante o pico do que antes," disse Tom.

"Sim. Mas significativamente menos durante os períodos de baixo movimento. O custo líquido ao longo da semana é menor."

Tom calculou. Depois assentiu.

"Há uma lição aqui," disse ele. "A pergunta certa não é 'isso é mais barato?' É 'isso é mais barato para o nosso padrão real de uso?'"

"Isso," disse Priya do outro lado da sala, "é o instinto de um engenheiro sênior."

Tom pareceu ligeiramente alarmado por ser descrito dessa forma.

No próximo capítulo: quando sua rede é o gargalo, e por que uma rodovia privada pode valer o pedágio.
