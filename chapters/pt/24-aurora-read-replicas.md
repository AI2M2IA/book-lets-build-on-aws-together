# Capítulo 24: O Banco de Dados Que Cresce Com Você

Imagine uma biblioteca que começou com duas prateleiras e um bibliotecário. Isso era suficiente, por um tempo. O bibliotecário sabia onde tudo estava. As solicitações eram respondidas rapidamente. Então a biblioteca cresceu: dez prateleiras, vinte, quarenta. O mesmo bibliotecário, a mesma mesa, o mesmo catálogo de fichas. Agora encontrar qualquer coisa exige esperar. O bibliotecário não é lento — há apenas mais biblioteca do que uma pessoa consegue atender no ritmo original.

A solução não é um bibliotecário mais rápido. É um tipo diferente de biblioteca.

---

Depois da redução de custos do S3, Tom continuou sua revisão. A camada de banco de dados era um tipo diferente de problema — não dados ociosos na classe de armazenamento errada, mas um sistema lutando ativamente sob a carga de seis meses de crescimento de tráfego.

---

Os números não eram confortáveis.

A Nimbus estava rodando RDS PostgreSQL: Multi-AZ, instância db.r6g.large. US$ 340/mês.

Leo abriu o painel de métricas do CloudWatch. Os números tinham um padrão.

**DatabaseConnections**: 198 de um máximo de 200 durante o pico de sexta. Duas conexões da saturação. A 200, as novas tentativas de conexão falhariam com "too many connections" — um erro que se manifestaria como HTTP 500s para clientes pedindo o jantar.

**CPUUtilization**: 89% de pico durante o auge do jantar de sexta. A instância foi projetada para lidar com picos — uma db.r6g.large tem 2 vCPUs e 16 GB de memória — mas 89% de CPU sustentada significava que o banco de dados estava no limite de capacidade antes mesmo de a hora de pico chegar.

**ReadLatency**: 840 milissegundos P95. Seis meses antes, tinha sido 180ms. A degradação tinha sido gradual — 10 a 20ms por semana — invisível até ser catastrófica. Na semana anterior à revisão de Tom, a latência P99 tinha cruzado um segundo inteiro. Clientes clicando no cardápio de um restaurante esperavam mais de um segundo para a página carregar.

**FreeStorageSpace**: 18% do armazenamento provisionado restante. Nas taxas de crescimento atuais, o banco de dados ficaria sem armazenamento provisionado em aproximadamente 11 semanas.

"Cada um destes é solucionável isoladamente", disse Leo, olhando o painel. "Mas temos os quatro de uma vez."

O pico de contagem de conexões apontava para problemas de pooling de conexões na aplicação — tarefas ECS demais abrindo suas próprias conexões de banco de dados. O problema de CPU apontava para consultas caras. O problema de latência e o problema de CPU eram quase certamente o mesmo problema: uma consulta lenta rodando com frequência demais.

"Espera — mas *por que* estamos em 198 conexões?" perguntou Maya. "Temos três tarefas ECS. Como temos quase 200 conexões de banco de dados?"

Cada tarefa ECS usava SQLAlchemy com um tamanho de pool padrão de 5 conexões mais um overflow de 10. Três tarefas × 15 conexões potenciais = 45 conexões da aplicação. As outras 153 eram das funções Lambda de analytics, dos workers de jobs em segundo plano, do job de ETL do Glue, das conexões locais da equipe de desenvolvimento pelo bastion host e de várias conexões que tinham sido abertas mas não fechadas adequadamente por uma versão mais antiga do código.

"O problema da contagem de conexões", disse Leo, "é na verdade um problema de aplicação que parece um problema de banco de dados." Ele adicionou o PgBouncer (um pooler de conexões) à lista de tarefas — mas o gargalo imediato era a consulta lenta.

A CPU do banco de dados estava disparando para 89% durante o auge do jantar de sexta. As consultas de leitura estavam enfileirando. A latência de consulta P95 tinha dobrado em seis meses.

"O banco de dados é o gargalo", disse ele. "O tráfego cresceu. O banco de dados não escalou com ele."

"Não podemos simplesmente deixar a instância maior?" perguntou Maya. "Espera — mas *por que* temos um único banco de dados lidando com todas as leituras e escritas? Por que não distribuímos isso desde o começo?"

"Sim", disse Leo. "Isso é escalonamento vertical. Mudamos de r6g.large para r6g.xlarge. Mais CPU, mais memória. Vai custar mais e nos comprar tempo."

"Mas não corrige o problema subjacente", disse Priya. "Eventualmente vamos atingir a maior instância e precisar de uma abordagem diferente. E já pensamos no que acontece se uma escrita for para uma réplica de leitura por acidente? A réplica rejeita a escrita e o pedido falha silenciosamente."

"Há duas abordagens", disse Leo. "Réplicas de leitura, ou Aurora."

"Qual é a diferença?"

"Pense nisso como uma biblioteca", disse Leo, pegando um marcador. "Um bibliotecário que tanto registra a devolução de livros quanto responde às perguntas dos usuários. Quando a biblioteca fica popular, forma-se uma fila. A correção: contratar mais bibliotecários — mas só para responder perguntas. A devolução ainda passa pela mesa original."

"Isso é uma réplica de leitura", disse Priya.

"Exatamente. O Aurora vai um passo além — ele redesenha o próprio sistema de prateleiras para que todo bibliotecário compartilhe as mesmas prateleiras e sempre veja os mesmos livros, sem atraso. Sem esperar que as atualizações pinguem de uma mesa para outra."

**Réplicas de Leitura: Distribuindo o Tráfego de Leitura**

A maioria das aplicações web lê dados muito mais frequentemente do que os escreve. Um cliente navegando no cardápio faz dezenas de consultas SELECT. Fazer um pedido faz algumas consultas INSERT/UPDATE. A proporção é tipicamente de 10:1 ou mais alta.

Uma **réplica de leitura** é uma instância RDS adicional que recebe uma cópia de todas as escritas do primário e torna essas escritas disponíveis para consultas SELECT.

Como funciona:

1. As escritas da aplicação (INSERT, UPDATE, DELETE) vão para o banco de dados primário
2. O primário replica essas mudanças de forma assíncrona para as réplicas de leitura
3. As leituras da aplicação (SELECT) são distribuídas entre as réplicas de leitura
4. As réplicas de leitura compartilham a carga — cada uma lida com uma fração do tráfego total de leitura

O resultado: o banco de dados primário lida apenas com escritas (e opcionalmente algumas leituras). As réplicas de leitura lidam com a carga de leitura. Para uma proporção de leitura/escrita de 10:1, adicionar uma réplica de leitura aproximadamente reduz pela metade a carga total do primário.

**Limitação importante**: A replicação é **assíncrona**. Há lag de replicação — tipicamente milissegundos, mas pode ser segundos sob carga. Uma leitura de uma réplica pode ver dados ligeiramente atrasados em relação ao primário. Para a maioria das leituras (navegar no cardápio, visualizar o histórico de pedidos), isso é aceitável. Para "meu pedido acabou de passar?" — leia do primário.

**Réplicas de Leitura: Os Detalhes**

- Você pode ter até 15 réplicas de leitura por instância RDS primária (MySQL, PostgreSQL, MariaDB)
- As réplicas de leitura podem estar na mesma região ou em uma região diferente (réplicas inter-região)
- As réplicas de leitura podem elas mesmas ter réplicas de leitura (encadeamento)
- As réplicas de leitura são endpoints separados — sua aplicação deve direcionar as leituras para o endpoint da réplica
- As réplicas de leitura podem ser promovidas a bancos de dados autônomos (útil para DR)

Para a Nimbus, Leo adicionou uma réplica de leitura. "Vai ficar tudo bem", ele disse quando Priya perguntou se ele tinha testado a lógica de roteamento de leitura/escrita da aplicação antes de trocar o tráfego. Ele não tinha. Ele passou os quarenta minutos seguintes verificando que as escritas não estavam indo para o endpoint da réplica de leitura.

Ele atualizou a aplicação para:

- Operações de escrita → endpoint primário
- Navegação no cardápio, histórico de pedidos → endpoint da réplica

A CPU no primário caiu de 89% para 41% no pico.

**O Problema da Consistência Leitura-Após-Escrita**

Três dias depois de habilitar a réplica de leitura, chegou um ticket de suporte. Um parceiro de restaurante tinha atualizado seu cardápio — removido um item descontinuado — e então ligado para confirmar que ele tinha sido removido. O agente de atendimento ao cliente abriu o cardápio pela interface da Nimbus. O item ainda estava lá.

Vinte segundos depois, ele tinha sumido.

Lag de replicação assíncrona. A escrita (DELETE do item de cardápio) foi para o primário. A leitura do agente de atendimento ao cliente foi para a réplica, que ainda não tinha recebido a mudança. A réplica estava 15 segundos atrasada naquele momento — não incomum, mas visível.

"E se alguém tentar invadir pela janela de consistência eventual?" perguntou Priya. "Ou simplesmente — e se um pedido for feito para um item de cardápio que acabou de ser excluído? Cobraríamos o cliente e o restaurante não teria o item."

Esta era uma preocupação real de consistência, não apenas um incômodo de UX.

A solução: identificar quais leituras têm requisitos de consistência e roteá-las para o primário.

**Leituras que podem ir para a réplica** (consistência eventual está bem):
- Cliente navegando no cardápio de um restaurante (defasado em 1-2 segundos é imperceptível)
- Consultas de histórico de pedidos (um usuário visualizando seu histórico de pedidos de um minuto atrás)
- Leituras do tipo analytics (principais restaurantes desta semana)

**Leituras que devem ir para o primário** (consistência leitura-após-escrita necessária):
- Imediatamente após uma escrita, quando a aplicação precisa confirmar que a escrita teve sucesso
- Leituras de status de pedido imediatamente após a colocação do pedido
- Leituras de cardápio acionadas pela interface de gerenciamento do restaurante (o restaurante acabou de mudar o cardápio)

A aplicação adicionou uma dica de roteamento na camada de conexão do banco de dados: se a requisição veio do painel de gerenciamento do restaurante, rotear para o primário. Se veio de um cliente navegando, rotear para a réplica. O cabeçalho HTTP `X-Read-Consistency: strong` serviu como o sinal.

"Não é tão difícil", disse Leo. "Você só precisa saber quais leituras o exigem."

"E documentar", disse Priya. "Para que a próxima pessoa que adicionar um novo endpoint saiba qual pool usar."

"Quanto isso custa por mês?" perguntou Tom. Era sua pergunta de abertura padrão para qualquer novo serviço.

Uma réplica de leitura do mesmo tipo de instância custa o mesmo que o primário. De US$ 340/mês para US$ 680/mês.

"Dobramos o custo para reduzir aproximadamente pela metade a carga", disse Tom.

"Sim. Mas a alternativa era migrar para um tipo de instância maior, que também custaria mais e não distribuiria a carga de leitura."

Tom fez a conta. Ele assentiu, relutantemente.

"E se o primário falhar?" perguntou Maya, antes que Tom pudesse pivotar para o Aurora. "O que acontece com a réplica de leitura?"

Leo explicou a promoção de réplica.

**Se a instância RDS primária falha**, a AWS automaticamente faz failover para a réplica standby na configuração Multi-AZ (um tipo diferente de réplica — um standby síncrono, não uma réplica de leitura). O standby Multi-AZ se torna o novo primário. As réplicas de leitura continuam servindo leituras, agora replicando do novo primário. Da perspectiva da aplicação, o DNS do endpoint primário muda para apontar para o antigo standby, e a aplicação reconecta.

O failover tipicamente leva 60-120 segundos para o RDS PostgreSQL. Durante essa janela, as escritas falham.

**A promoção de réplica de leitura** é uma operação separada — e um cenário separado. Se você quer pegar uma réplica de leitura e torná-la um banco de dados independente e gravável (para DR, para migração para uma nova região, ou porque o primário sumiu e você precisa promover em vez de esperar pelo failover Multi-AZ), você pode promover uma réplica de leitura a primário autônomo. A promoção leva alguns minutos, após os quais a réplica não está mais replicando do primário original — ela é seu próprio banco de dados.

"Já pensamos no que acontece se o primário de us-west-2 cair completamente?" perguntou Priya. "Não apenas um failover para o standby Multi-AZ — a região inteira."

"Se a região falha", disse Leo, "o standby Multi-AZ também está em us-west-2. Ambos falham juntos."

"Então, para um verdadeiro cenário de DR regional", disse Tom, "precisaríamos de uma réplica de leitura em us-east-1 que pudéssemos promover."

"Sim. Uma réplica de leitura inter-região. Ainda não temos uma."

"Quanto isso custa por mês?" perguntou Tom. Ele já sabia que a resposta envolveria uma decisão.

Uma réplica de leitura inter-região de uma db.r6g.large em us-east-1: US$ 340/mês (mesmo custo de instância). Mais a transferência de dados inter-região para a replicação: mínima no volume de escrita da Nimbus. Total: aproximadamente US$ 350/mês por uma réplica de DR.

"Isso são US$ 4.200 por ano", disse Tom, "para proteger contra um cenário que aconteceu a regiões da AWS menos de cinco vezes em dez anos."

"E o custo de a Nimbus ficar fora do ar por 24 horas durante um evento regional é?" perguntou Priya.

Tom calculou. Ele não respondeu em voz alta. Mas adicionou "réplica de leitura inter-região" ao backlog de DR.

"O que é o Aurora?" perguntou ele.

**Amazon Aurora: Repensando o Engine do Banco de Dados**

O Aurora é o engine de banco de dados relacional proprietário da AWS, compatível com MySQL e PostgreSQL. Ele foi projetado do zero para cargas de trabalho de nuvem, reimaginando como a camada de armazenamento de um banco de dados relacional funciona.

Em uma configuração RDS tradicional (MySQL, PostgreSQL), o armazenamento e a computação são fortemente acoplados. O engine do banco de dados gerencia os arquivos de dados. A replicação copia os dados do primário para a réplica. A réplica deve refazer cada operação de escrita.

Isso cria um teto na velocidade de replicação: uma réplica só pode aplicar escritas tão rápido quanto consegue processar o log de replicação. Durante um período de muita escrita — uma importação em massa, uma promoção relâmpago, uma atualização em lote — a réplica pode ficar para trás. O lag de replicação não é uma falha na implementação; é uma consequência da arquitetura.

Priya tinha sinalizado isso imediatamente quando Leo propôs as réplicas de leitura. "E já pensamos no que acontece se o lag de replicação disparar para 30 segundos durante o auge de sexta? A réplica está 30 segundos atrasada. Um cliente faz um pedido, o horário da cozinha é reservado no primário, mas um segundo cliente consultando a réplica não vê a reserva. Dois pedidos, um horário."

"Isso é um problema de consistência de estoque", disse Leo.

"Isso é exatamente um problema de consistência de estoque", confirmou Priya. "Que é por que as leituras de estoque — 'este item ainda está disponível?' — devem ir para o primário."

A arquitetura do Aurora aborda o lag diretamente.

O Aurora separa o armazenamento da computação. Ele usa uma camada de armazenamento distribuída e tolerante a falhas que replica os dados automaticamente em três Zonas de Disponibilidade em seis cópias. A camada de computação (as instâncias de banco de dados) fica sobre essa camada de armazenamento.

**O que isso muda**:

**Réplicas de leitura**: As réplicas do Aurora não precisam replicar dados — elas já compartilham a mesma camada de armazenamento. Isso significa:

- Até 15 Aurora Replicas que compartilham o volume de armazenamento (o RDS normal também permite até 15 réplicas de leitura, mas cada uma é uma cópia completa de dados)
- O lag de replicação é tipicamente abaixo de 100 milissegundos (vs segundos para o RDS sob carga)
- As réplicas podem ser promovidas a primário em menos de 30 segundos (vs minutos)

**Failover**: Como as réplicas compartilham o armazenamento, o failover é muito mais rápido — a promoção não envolve transferência de dados, apenas o redirecionamento das escritas.

**Armazenamento**: O Aurora escala o armazenamento automaticamente em incrementos de 10GB, até 128 TiB (256 TiB em versões recentes do engine). Você nunca provisiona armazenamento com antecedência.

**Desempenho**: O Aurora afirma ter 5x o throughput do MySQL padrão e 3x o do PostgreSQL padrão para tipos de instância equivalentes.

Você pode estar se perguntando: se todas as réplicas compartilham o mesmo armazenamento, esse armazenamento não se torna um ponto único de falha? A camada de armazenamento do Aurora replica automaticamente os dados em seis cópias em três Zonas de Disponibilidade. O próprio armazenamento é mais resiliente que qualquer configuração RDS Multi-AZ única — ele foi projetado para sobreviver à perda de uma AZ inteira com zero perda de dados e sem necessidade de failover.

Uma segunda pergunta comum: se o Aurora é compatível com MySQL/PostgreSQL, você pode migrar do RDS PostgreSQL para o Aurora PostgreSQL sem mudar o código da aplicação? Quase. A compatibilidade do Aurora PostgreSQL significa que o Aurora implementa o protocolo de fio do PostgreSQL e suporta a grande maioria da sintaxe e dos recursos SQL do PostgreSQL. A maioria das aplicações migra com zero mudanças de código. Os casos extremos: um pequeno número de extensões do PostgreSQL não está disponível no Aurora, algumas consultas ao catálogo de sistema retornam valores diferentes, e certas operações administrativas diferem. Para migrações de produção, teste com tráfego de leitura paralelo antes de trocar as escritas.

Para a Nimbus, a migração do RDS PostgreSQL para o Aurora PostgreSQL levou uma tarde. A aplicação apontou para o endpoint do Aurora. A consulta de cardápio — depois que Leo adicionou o índice que o Performance Insights tinha apontado como o principal consumidor de carga do banco de dados — rodou em 4ms em vez de 620ms. O pool de conexões não atingia mais 198 de 200. A latência P95 caiu para 28ms.

"É um engine de banco de dados diferente", disse Leo, "que a aplicação acha que é o mesmo engine de banco de dados."

"E a parte interessante?" perguntou Maya.

"Clonagem rápida de banco de dados."

"Anotado", disse Sam baixinho do outro lado da sala, já digitando. Sam era um engenheiro de backend que tinha entrado na equipe algumas semanas antes para tirar parte do trabalho de banco de dados das mãos de Leo. Ninguém perguntou o que ele estava fazendo.

**Preços do Aurora: A Pergunta do Tom**

Os preços do Aurora são diferentes dos do RDS:

**Preço de instância**: Similar ao preço de instância do RDS por tipo.

**Preço de armazenamento**: US$ 0,10 por GB por mês (você paga pelo que está armazenado, escalado automaticamente).

**Preço de I/O**: O Aurora cobra por requisição de I/O (leitura/escrita no armazenamento). Isso pode ser significativo para cargas de trabalho de muita escrita.

"Espera", disse Tom. "Estamos pagando por I/O separadamente?"

"O Aurora Serverless v2 e o Aurora I/O-Optimized mudam esse modelo de preços", disse Leo. "O Aurora I/O-Optimized não cobra taxa de I/O mas tem um preço de armazenamento e instância mais alto. Melhor para cargas de trabalho de muito I/O."

Tom olhou o trade-off. Para a Nimbus, que tinha muita leitura (muitas consultas de cardápio, poucas escritas), o Aurora I/O-Optimized poderia custar mais. O preço padrão do Aurora poderia ser apropriado.

Uma heurística útil: se as suas cobranças de I/O excedem cerca de 25% da sua conta total do Aurora, o I/O-Optimized provavelmente é mais barato. Para a carga de trabalho de muita leitura da Nimbus, as cobranças de I/O eram baixas — o preço padrão se aplica. Para uma carga de trabalho de muita escrita como um sistema de logging de eventos, o I/O-Optimized poderia reduzir os custos significativamente.

Esta é uma decisão de custo real que os engenheiros sêniores tomam: você precisa conhecer os padrões de I/O da sua carga de trabalho para escolher corretamente.

Se a sua carga de trabalho é pequena, estável e previsível, o RDS PostgreSQL é mais simples e significativamente mais barato — mas se o seu tráfego é imprevisível, o seu volume de dados está crescendo além do que você pode provisionar com antecedência, ou você precisa de failover automático em menos de 30 segundos, o modelo de armazenamento compartilhado do Aurora justifica o custo de base mais alto.

**Aurora Serverless: Escalando Sem Pensar em Instâncias**

O **Aurora Serverless v2** é uma configuração que escala automaticamente a capacidade de computação com base na carga real do banco de dados. Em vez de escolher um tamanho de instância fixo (db.r6g.large), você define uma capacidade mínima e máxima em Aurora Capacity Units (ACUs).

O Aurora Serverless v2:

- Escala para cima em segundos quando a carga aumenta
- Escala para baixo durante períodos ociosos — e, desde o final de 2024, pode fazer auto-pause até 0 ACUs quando não há conexões (a retomada leva ~15 segundos; o auto-pause não funciona com o RDS Proxy ou outros proxies que mantêm conexões)
- Custo: US$ 0,12 por ACU-hora (mais armazenamento e I/O)

Para cargas de trabalho com tráfego variável — os picos de sexta da Nimbus vs a quietude da manhã de segunda — o Serverless v2 reduz os custos durante os períodos de pouco movimento e lida com os picos sem pré-provisionamento.

"Então, durante o pico de sexta", disse Leo, "o Aurora escala automaticamente para cima. Domingo de manhã, quando temos quase nenhum tráfego, ele escala de volta para o mínimo."

"E só pagamos pela capacidade que estamos usando", disse Tom.

"Correto."

Depois de um mês no Aurora Serverless v2, Leo abriu o gráfico de ACU (Aurora Capacity Unit) da semana anterior.

O gráfico mostrava dois padrões distintos. Durante a semana, o banco de dados rodava a 2-4 ACUs — um zumbido quieto de consultas em segundo plano, verificações de integridade do ECS, jobs de ETL do Glue e testes de desenvolvimento. Na noite de sexta entre 18h00 e 22h00, a contagem de ACUs subia:

```
Friday 18:00  → 6 ACUs
Friday 19:00  → 14 ACUs
Friday 19:45  → 26 ACUs  (peak — pizza orders spike before NFL kickoff)
Friday 20:30  → 18 ACUs
Friday 21:00  → 12 ACUs
Friday 22:30  → 4 ACUs
Saturday 02:00 → 2 ACUs  (minimum)
```

O escalonamento era quase instantâneo — o Aurora Serverless v2 escala em incrementos de 0,5 ACUs, e pode adicionar capacidade em segundos em vez dos minutos necessários para provisionar uma nova instância RDS.

"Quanto custou aquele pico de sexta?" perguntou Tom.

A US$ 0,12 por ACU-hora: o pico de sexta foi de 4 horas com média de 18 ACUs → US$ 8,64 para o período de pico. O resto da semana a 3 ACUs em média × 164 horas × US$ 0,12 = US$ 59,04. Total da semana: US$ 67,68.

A instância provisionada equivalente para lidar com o pico de sexta (db.r6g.xlarge, 4 vCPUs, 32 GB) custaria US$ 0,937/hora × 168 horas = **US$ 157,42 para a semana** — quer o pico de sexta jamais se materializasse ou não.

"O Serverless v2 é US$ 67 para a semana. Uma instância provisionada dimensionada para o pico é US$ 157", disse Tom. "Isso é uma redução de 57%."

"Em um banco de dados que legitimamente usa 26 ACUs por quatro horas na sexta e 2 ACUs pelo resto da semana", disse Leo. "Se o seu banco de dados roda com carga alta consistente a semana toda, uma instância provisionada é mais barata. A economia vem da variabilidade."

Tom assentiu lentamente. Ele estava adicionando isto a um padrão em suas notas: toda história de economia deste trimestre tinha o mesmo formato. Você paga pelo que usa, não pelo que pode precisar. As políticas de ciclo de vida do S3 pagavam apenas pela classe de armazenamento que cada objeto merecia. O Lambda pagava apenas pelo tempo de invocação. O Fargate pagava apenas pela CPU e memória das tarefas. O Aurora Serverless v2 pagava apenas pelas ACUs que o banco de dados de fato consumia.

Tom tinha a expressão de alguém que tinha encontrado exatamente o que estava procurando.

**Recuperando-se de uma Migração Ruim: Clones, PITR e o Botão de Desfazer**

Duas semanas depois de migrar para o Aurora, Sam rodou um script de migração de banco de dados em produção. O script deveria remover a coluna `legacy_menu_format` da tabela `menu_items`. Ele o rodou sem a cláusula WHERE que achava ter incluído.

O resultado não foi remover uma coluna. Foi uma instrução DELETE que limpou 40.000 linhas da tabela `menu_items` — aproximadamente 200 restaurantes de dados de cardápio, sumiram.

O alerta disparou em 30 segundos. As falhas de pedido dispararam. O serviço de cardápio começou a retornar resultados vazios para 200 restaurantes.

"Era para ter uma cláusula WHERE", disse Sam, encarando o console.

O caminho de recuperação tradicional: restaurar a partir do snapshot de backup automatizado mais recente. Os backups automatizados rodam uma vez a cada 24 horas, e uma restauração-e-troca completa levaria de 20 a 40 minutos — durante os quais *todos* os restaurantes ficariam no escuro, não apenas os 200 afetados — e cada pedido feito desde o backup seria perdido.

Leo não fez isso. Como o RDS padrão, o Aurora mantém backups contínuos para **recuperação point-in-time (PITR)** — você pode restaurar o cluster para qualquer segundo dentro da janela de retenção de backup, não apenas para o último snapshot noturno. E, criticamente, a restauração cria um *novo* cluster; a produção permanece no ar enquanto você se recupera.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

O timestamp: 15:42:00Z — quatro minutos antes de Sam rodar o script de migração. Enquanto o cluster de recuperação subia, o resto da produção continuou servindo os restaurantes não afetados. Assim que ele ficou disponível, Leo extraiu as linhas de `menu_items` dos 200 restaurantes afetados do cluster de recuperação e as inseriu de volta na produção. Tempo total do alerta aos cardápios totalmente restaurados: um pouco menos de 40 minutos — e como ele reparou as linhas cirurgicamente em vez de trocar o banco de dados inteiro, nenhum pedido feito após 15h42 foi perdido. O cluster de recuperação foi excluído depois; tinha cumprido seu propósito.

"O que perdemos?" perguntou Maya.

Seis pedidos feitos contra os cardápios brevemente vazios tinham falhado no checkout — todos eles estavam na fila SQS e podiam ser reprocessados. Nenhum dado de cliente foi permanentemente perdido.

"E é aqui que a **clonagem rápida de banco de dados** entra", disse Leo, reunindo a equipe depois. O Aurora pode criar um **clone** de um cluster em minutos, independentemente do tamanho do banco de dados, usando copy-on-write: o clone compartilha a camada de armazenamento do original e apenas as páginas novas ou alteradas consomem espaço adicional. Um clone do banco de dados de produção atual é barato, rápido e completamente isolado — as escritas no clone nunca tocam a produção.

"O que significa", disse Priya, olhando para Sam, "que o script de migração é testado contra um clone dos dados de produção antes de ele rodar em produção. Essa é a nova regra."

Sam assentiu. Ele já a tinha escrito em um post-it.

Mais uma ferramenta pertence a este quadro. O Aurora MySQL — não o Aurora PostgreSQL — tem o **Aurora Backtrack**: um recurso que rebobina o cluster *no lugar* para um ponto específico no tempo, sem restaurar para um novo cluster de forma alguma. Se o cluster da Nimbus fosse Aurora MySQL, Leo poderia tê-lo retrocedido para 15h42 em menos de três minutos — embora rebobinar o cluster inteiro também tivesse revertido o punhado de pedidos legítimos escritos após a exclusão, que a abordagem PITR cirúrgica preservou.

"E se alguém tentar invadir usando o Backtrack — ou uma restauração point-in-time?" perguntou Priya. "Um atacante poderia rebobinar logs de auditoria ou dados de conformidade?"

O Backtrack exige a permissão de API `rds:BacktrackDBCluster`, e as restaurações exigem `rds:RestoreDBClusterToPointInTime` — ações IAM separadas das operações normais de banco de dados. As funções de aplicação padrão não têm essas permissões. Apenas a equipe de operações, com política IAM explícita permitindo-as, poderia usá-las. Ela adicionou isto ao checklist de revisão de permissões IAM.

As ressalvas importantes: o Aurora Backtrack está disponível apenas para clusters compatíveis com Aurora MySQL, não para o PostgreSQL. A janela do Backtrack é configurada na criação do cluster (1 hora a 72 horas, cobra por hora de janela de backtrack). E o Backtrack afeta o cluster inteiro — você não pode fazer Backtrack de uma tabela ou de um conjunto de linhas. Para recuperação cirúrgica em nível de linha — em qualquer engine — a abordagem de PITR-para-um-cluster-temporário que Leo usou é a ferramenta.

**Aurora Global Database: Leituras Multi-Região**

O **Aurora Global Database** estende o Aurora por múltiplas regiões da AWS:

- **Uma região primária** lida com todas as escritas
- **Até cinco regiões secundárias** servem leituras com lag de replicação tipicamente <1 segundo
- As regiões secundárias podem ser promovidas a primária em menos de 1 minuto (para cenários de DR)

Para a expansão global da Nimbus, o Aurora Global Database permitiria que um parceiro de restaurante em Londres consultasse seu cardápio local da réplica de leitura da UE, enquanto todos os pedidos (escritas) ainda passam pelo primário dos EUA.

**RDS vs Aurora: Quando Escolher Cada Um**

| Fator             | RDS (PostgreSQL/MySQL)        | Aurora                                                     |
|-------------------|-------------------------------|------------------------------------------------------------|
| Custo             | Mais baixo para cargas pequenas | Base mais alta, mas escala melhor                        |
| Compatibilidade   | Total                         | Compatível com MySQL/PostgreSQL (com pequenas diferenças)  |
| Máx. de réplicas  | 15 (cada uma cópia completa)  | 15 (volume de armazenamento compartilhado)                 |
| Lag de réplica    | Pode ser de segundos          | Geralmente <100ms                                         |
| Armazenamento     | Provisionamento fixo          | Auto-escala até 128 TiB (256 TiB em versões recentes)      |
| Tempo de failover | 60-120 segundos               | <30 segundos                                               |
| Opção serverless  | Limitada                      | Aurora Serverless v2                                       |
| Melhor para       | Cargas estáveis e previsíveis | Tráfego variável, alto volume de leitura, necessidade de failover rápido |

**Além do Relacional: A Família de Propósito Específico**

O capítulo 9 apresentou o DocumentDB (documentos compatíveis com MongoDB), o Neptune (relacionamentos de grafo) e o Keyspaces (wide-column compatível com Cassandra), e o capítulo 10 apresentou o MemoryDB (banco de dados primário durável compatível com Redis). Mais dois nomes completam a família — você não precisa de profundidade neles, apenas da capacidade de reconhecer qual forma de dados aponta para qual engine, porque eles aparecem constantemente como opções de resposta:

- **Amazon Timestream**: dados de **séries temporais** — leituras de sensores, métricas, telemetria. Sinal do exame: "medições de IoT ao longo do tempo." (No mundo real, a oferta atual é o Timestream for InfluxDB; a variante original "LiveAnalytics" fechou para novos clientes em 2025.)
- **Amazon QLDB**: você ainda pode encontrá-lo em questões mais antigas como o "ledger imutável e criptograficamente verificável." A AWS descontinuou o QLDB em 2025 (recomendando o Aurora PostgreSQL em vez disso) — trate-o como um distrator legado, não como um bloco de construção.

A regra que vale a pena escrever em um quadro branco: **linhas relacionais → RDS/Aurora; chave-valor em escala → DynamoDB; documentos → DocumentDB; relacionamentos → Neptune; tempo → Timestream; Cassandra → Keyspaces; Redis durável → MemoryDB.** Combine a forma, e a questão se responde sozinha.

## Pontos Fortes e Limitações

**Pontos fortes do Aurora**:

- Failover significativamente mais rápido que o RDS padrão
- Até 15 réplicas de leitura com lag mínimo
- Armazenamento com auto-escala
- Serverless v2 para cargas de trabalho variáveis
- Global Database para implantação multi-região

**Limitações do Aurora**:

- Custo mais alto para cargas de trabalho pequenas e estáveis
- O preço de I/O pode ser significativo para cargas de trabalho de muita escrita (use o I/O-Optimized para isso)
- Pequenas diferenças de compatibilidade com MySQL/PostgreSQL podem exigir mudanças de código
- A retomada do Serverless v2 a partir do auto-pause (~15 segundos) e o rápido escalonamento para cima podem causar picos de latência

## Resumo

O trabalho de ciclo de vida do S3 no capítulo 23 reduziu custos movendo os dados para a camada de armazenamento certa. O Aurora faz o equivalente para a computação: em vez de provisionar para a carga de pico e pagar por isso o tempo todo, o Serverless v2 escala para combinar com a demanda.

- As **réplicas de leitura** distribuem o tráfego de leitura do primário. Replicação assíncrona — pequeno lag aceitável para a maioria das leituras. Roteie as leituras que exigem consistência de escrita (leituras imediatamente pós-escrita, leituras de interface de admin) para o primário, não para a réplica.
- O **Aurora** reimagina a camada de armazenamento: distribuída, compartilhada entre as réplicas, com auto-escala.
- O Aurora oferece: 15 réplicas de leitura, lag de réplica <100ms, failover <30s, armazenamento com auto-escala de até 128 TiB (256 TiB em versões recentes).
- **Performance Insights**: identifique as consultas SQL específicas que causam a carga do banco de dados antes de decidir como escalar. Um índice faltante pode eliminar a necessidade de uma instância maior.
- **Métricas de banco de dados do CloudWatch**: DatabaseConnections (perto da saturação significa que o pooling de conexões da aplicação está quebrado), CPUUtilization (CPU alta sustentada significa consultas caras), ReadLatency (degradação ao longo do tempo é frequentemente uma tabela crescendo com um índice faltante).
- **Aurora Serverless v2**: auto-escala a computação em incrementos de 0,5 ACUs. Cobrado por ACU-hora. Significativamente mais barato que instâncias provisionadas para cargas de trabalho com alta variabilidade entre pico e fora de pico.
- **Recuperação point-in-time (PITR)**: restaure um cluster Aurora para qualquer segundo dentro da janela de retenção de backup — em um *novo* cluster, de modo que a produção permaneça no ar enquanto você copia cirurgicamente as linhas perdidas de volta.
- **Clonagem rápida de banco de dados**: clone copy-on-write de um cluster em minutos, independentemente do tamanho. Barato, isolado — use-o para testar migrações contra dados de produção antes de elas rodarem em produção.
- **Aurora Backtrack** (apenas compatível com MySQL — não PostgreSQL): rebobine o cluster no lugar para um ponto no tempo sem restaurar de um backup. Disponível para janelas de até 72 horas. Exige a permissão IAM `rds:BacktrackDBCluster` — restrinja à equipe de operações.
- **Aurora Global Database**: primário em uma região, réplicas de leitura em até cinco regiões.
- **Promoção de réplica de leitura**: réplicas de leitura inter-região podem ser promovidas a primários autônomos para DR regional. Equilibre o benefício de DR contra o custo de rodar uma segunda instância completa.
- Escolha o RDS para cargas de trabalho menores, estáveis e previsíveis. Escolha o Aurora quando você precisa de escala, failover rápido ou tratamento de tráfego variável.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- **Réplica do Aurora vs réplica de leitura do RDS**: As réplicas do Aurora compartilham armazenamento (lag próximo de zero, failover <30s). As réplicas de leitura do RDS replicam dados (lag possível, minutos para o failover).
- **Aurora Serverless v2**: "auto-escalar a capacidade do banco de dados", "tráfego de banco de dados imprevisível ou irregular" → Aurora Serverless v2. Cuidado: historicamente apenas o Serverless **v1** escalava até zero; o mínimo do v2 era 0,5 ACU até o final de 2024, quando o v2 ganhou o auto-pause para 0 ACUs. Questões de exame mais antigas ainda podem presumir que o v2 não pode escalar até zero.
- **Aurora Global Database**: "banco de dados multi-região", "ler da UE com baixa latência a partir do primário dos EUA", "RTO < 1 minuto para failover regional" → Aurora Global Database.
- **Tempo de failover**: Aurora < 30 segundos. RDS Multi-AZ 60-120 segundos. Conheça ambos.
- **Bancos de dados de propósito específico por forma de dados**: "grafo social / recomendações / anéis de fraude" → Neptune. "MongoDB" → DocumentDB. "Cassandra" → Keyspaces. "séries temporais / telemetria de IoT" → Timestream. "banco de dados *primário* compatível com Redis (durável)" → MemoryDB (vs ElastiCache = cache). "Ledger criptográfico imutável" → QLDB em questões antigas (descontinuado em 2025).
- **Aurora I/O-Optimized**: Custo de armazenamento e instância mais alto, sem cobrança por I/O. Use quando os custos de I/O dominam (muita escrita). Aurora padrão: custo de armazenamento mais baixo, paga por I/O. Use para muita leitura.
- **Aurora Backtrack**: Rebobine o banco de dados no lugar para um ponto específico no tempo sem restaurar de um snapshot de backup. Disponível apenas para o Aurora compatível com MySQL — para o Aurora PostgreSQL, a resposta é a restauração point-in-time (para um novo cluster) ou um clone rápido. Sinal do exame: "dados excluídos acidentalmente, precisa recuperar rapidamente sem restaurar um backup completo" + MySQL → Backtrack.
- **Clonagem rápida de banco de dados do Aurora**: clone copy-on-write em minutos, independentemente do tamanho do banco de dados. Sinal do exame: "testar contra uma cópia dos dados de produção de forma rápida e barata" → clone, não restauração de snapshot.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre as réplicas de leitura do Aurora e do RDS padrão. Por que o lag de replicação do Aurora é tipicamente menor?

*(Dica: A diferença chave é armazenamento compartilhado vs replicação de dados. Pense no que cada réplica deve fazer quando uma escrita chega.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: O banco de dados MySQL de uma plataforma de mídia social está sofrendo alta latência de leitura devido ao tráfego crescente. A aplicação tem muita leitura (95% leituras, 5% escritas). A equipe precisa que a latência de leitura seja consistente, mesmo durante picos de tráfego. Eles precisam de failover automático com tempo de inatividade mínimo (RTO alvo < 30 segundos). O volume de dados está crescendo de forma imprevisível.

Qual solução de banco de dados MELHOR atende a esses requisitos?

A) RDS MySQL Multi-AZ com cinco réplicas de leitura  
B) Aurora MySQL com Aurora Replicas e Aurora Serverless v2  
C) RDS MySQL com um tipo de instância maior (escalonamento vertical)  
D) DynamoDB com DynamoDB DAX para cache de leitura

**Dica 1**: "RTO < 30 segundos" — qual serviço alcança isso? Verifique o tempo de failover de cada opção.

**Dica 2**: "Latência de leitura consistente durante picos" — quais réplicas de serviço têm lag próximo de zero vs potenciais segundos de lag?

**Dica 3**: "Volume de dados crescendo de forma imprevisível" — qual serviço auto-escala o armazenamento?

**Resposta**: B

**Explicação**: O Aurora MySQL com Aurora Replicas fornece lag de replicação próximo de zero (milissegundos, não segundos) para desempenho de leitura consistente sob carga. O Aurora Serverless v2 auto-escala a computação durante os picos de tráfego sem superprovisionar. O armazenamento do Aurora auto-escala à medida que os dados crescem. O failover do Aurora (promoção de uma réplica) se completa em menos de 30 segundos — atendendo ao requisito de RTO.

**Por que não A?** O failover do RDS Multi-AZ leva 60-120 segundos — não atende ao RTO < 30 segundos. O lag das réplicas de leitura do RDS padrão pode chegar a segundos sob carga — a latência de leitura "consistente" é mais difícil de garantir.

**Por que não C?** O escalonamento vertical (instância maior) aumenta a capacidade mas não distribui a carga de leitura. O banco de dados permanece um ponto único de falha para as leituras.

**Por que não D?** O DynamoDB é NoSQL — migrar do MySQL para o DynamoDB exige rearquitetar o modelo de dados e as consultas da aplicação, o que está muito além do escopo desta tarefa de melhoria de desempenho.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está projetando uma expansão global. Eles querem que os parceiros de restaurante na Costa Leste, na Alemanha e na Austrália vejam seus próprios dados de pedidos rapidamente, sem latência inter-região. No entanto, todas as escritas devem passar pelo único primário de us-west-2 para manter a consistência.

Projete a arquitetura de banco de dados usando o Aurora. Como você estruturaria o Global Database — por exemplo, clusters secundários em us-east-1, eu-central-1 e ap-southeast-2? O que acontece se o primário de us-west-2 cair? Como você lidaria com o processo de promoção?

*(Não há uma resposta única correta. O objetivo é praticar o design de banco de dados multi-região.)*

## Cena Pós-Créditos

Leo migrou para o Aurora com o Serverless v2.

O pico de sexta veio e foi. A CPU nunca excedeu 60%. A latência de consulta permaneceu consistente. O Aurora tinha escalado para cima para lidar com a carga automaticamente, depois escalado de volta para baixo após o auge.

"Quanto isso custou comparado à sexta passada?" perguntou Tom na manhã de segunda.

Leo abriu o billing explorer. "A sexta teve média de cerca de US$ 2,16/hora ao longo do pico da noite. A manhã de sábado foi US$ 0,24/hora."

Tom não disse nada.

"A configuração antiga era um fixo de US$ 0,47/hora independentemente da carga", acrescentou Leo.

"Então pagamos mais durante o pico do que antes", disse Tom.

"Sim. Mas significativamente menos fora do pico. O custo líquido ao longo da semana é menor."

Tom calculou. Depois assentiu.

"Há uma lição aqui", disse ele. "A pergunta certa não é 'isto é mais barato?' É 'isto é mais barato para o nosso padrão de uso real?'"

"Isso", disse Priya do outro lado da sala, "é o instinto de um engenheiro sênior."

Tom pareceu ligeiramente alarmado por ser descrito dessa forma.

No próximo capítulo: quando a sua rede é o gargalo, e por que uma rodovia privada pode valer o pedágio.
