# Capítulo 29: A Conta do Banco de Dados

A auditoria de armazenamento de Tom havia identificado US$ 8.800 em desperdício. Ele se voltou para os itens de banco de dados.

RDS Aurora: US$ 647/mês.
RDS PostgreSQL (réplicas de leitura): US$ 340/mês.
ElastiCache: US$ 183/mês.

Total da camada de banco de dados: US$ 1.170/mês.

"Deixa eu entender cada um antes de decidir qualquer coisa," disse ele. "Porque o banco de dados não é o lugar para economizar dinheiro cortando cantos."

Isso era sábio. Configuração incorreta do banco de dados que causa perda de dados ou degradação de desempenho custa muito mais do que as economias.

Pense em um banco de dados como o motor de um carro. Você pode economizar dinheiro em um carro trocando para um combustível mais barato, ajustando a pressão dos pneus e removendo peso desnecessário do porta-malas. Mas se você tentar economizar pulando uma troca de óleo, corre o risco de fundir o motor — e um motor fundido custa muito mais do que qualquer economia de combustível. A auditoria que Tom está prestes a realizar segue a mesma lógica: encontre o desperdício no porta-malas e no tanque de combustível, e deixe o motor em paz até saber exatamente o que está fazendo.

**Entenda Primeiro a Carga de Trabalho do Banco de Dados**

A otimização de custos em bancos de dados requer entender a carga de trabalho antes de tocar em qualquer coisa.

Perguntas-chave:

- Qual é a utilização média e de pico de CPU?
- Qual é a proporção leitura/escrita?
- O armazenamento está crescendo, estável ou diminuindo?
- As réplicas de leitura estão sendo utilizadas?
- A instância está subprovisionada (causando lentidão) ou superprovisionada (pagando por capacidade ociosa)?

Tom puxou as métricas do CloudWatch para os três serviços de banco de dados nos 30 dias anteriores:

**Cluster Aurora**:

- CPU média: 18% (pico: 67% nas noites de sexta-feira)
- Proporção leitura/escrita: 14:1 (pesada em leitura)
- Armazenamento: 180 GB (crescendo ~5 GB/mês)

**Réplicas de leitura (RDS PostgreSQL, separadas do Aurora)**:

- Eram duas réplicas de leitura RDS legadas criadas antes da migração para o Aurora, ainda em execução.
- Conexões médias para cada uma: 2 por dia. CPU média: 3%.

"Por que essas ainda estão rodando?" perguntou Tom.

Leo verificou as datas de criação da instância. "Foram criadas durante a migração para o Aurora como fallback. Esquecemos de excluí-las."

Esse momento — quando algo caro ficou rodando por meses sem ser usado — é familiar em ambientes de nuvem.

As réplicas foram encerradas. Economia mensal: US$ 340.

**RDS Reserved Instances: A Versão para Banco de Dados**

Assim como o EC2, o RDS oferece Reserved Instances para uso comprometido.

Para Aurora com Serverless v2, as Reserved Instances não se aplicam diretamente — o Serverless v2 escala dinamicamente e você paga por ACU-hora. No entanto, se você estiver usando uma configuração de instância Aurora fixa (não Serverless), as Reserved Instances podem economizar 30-60%.

Tom revisou as instâncias Aurora provisionadas (o escritor e um leitor):

- Instância de escritor: db.r6g.large, On-Demand = US$ 0,26/hora = US$ 190/mês
- Instância de leitor: db.r6g.large, On-Demand = US$ 0,26/hora = US$ 190/mês

Reserved Instances de 1 ano para ambas: ~US$ 108/mês cada. Economia anual: US$ 984.

"Espera," disse Leo. "Migramos para o Aurora Serverless v2 no Capítulo 24. Por que Tom está olhando para On-Demand de instâncias provisionadas?"

Boa observação. Vamos ser precisos: o escritor Aurora primário da Nimbus usa Serverless v2. O leitor (para réplicas de leitura) também usa Serverless v2. O Serverless v2 não tem Reserved Instances tradicionais — você paga por ACU-hora.

Para equipes executando instâncias Aurora fixas (não Serverless), as Reserved Instances são economias significativas. Para cargas de trabalho Serverless v2, as economias vêm da própria natureza do escalonamento automático do serviço — você não paga por capacidade não utilizada.

**DynamoDB: On-Demand vs Provisionado**

No Capítulo 9, apresentamos os dois modos de capacidade do DynamoDB: on-demand e provisionado.

A Nimbus havia estado executando o DynamoDB no modo on-demand desde o início. Com tráfego baixo, isso estava correto — o on-demand é mais caro por requisição, mas não tem cobrança mínima.

Agora, com 18 meses de dados de tráfego no CloudWatch, Tom podia ver padrões.

Unidades de capacidade de leitura médias por dia: 45.000
Unidades de capacidade de escrita médias por dia: 12.000
Dia de pico (sexta-feira): 180% das requisições médias do DynamoDB (o ElastiCache absorve ~95% das leituras, então o DynamoDB vê apenas uma fração do pico total de volume de pedidos de 25x)

**Preço on-demand**: US$ 1,25 por milhão de requisições de escrita, US$ 0,25 por milhão de requisições de leitura.
**Preço provisionado**: US$ 0,00065 por unidade de capacidade de escrita por hora, US$ 0,00013 por unidade de capacidade de leitura por hora.

Tom calculou o ponto de equilíbrio: a capacidade provisionada fica mais barata quando você a usa de forma consistente o suficiente para não pagar o prêmio on-demand durante os períodos ociosos.

Com 18 meses de dados mostrando padrões diários consistentes, a capacidade provisionada com **DynamoDB Auto Scaling** era a escolha certa:

- Defina a capacidade mínima em 60% da carga média
- Defina o máximo em 250% da média (lida com os picos de sexta-feira)
- O Auto Scaling ajusta a capacidade provisionada entre esses limites

Custo mensal do DynamoDB: caiu de US$ 340 (on-demand) para US$ 230 (provisionado com auto scaling). Redução de 32%.

"Mas se superprovisionarmos," perguntou Leo, "pagamos por capacidade não utilizada."

"Esse é o risco," disse Tom. "Com o Auto Scaling, definimos o mínimo alto o suficiente para evitar throttling e deixamos a AWS gerenciar dentro do nosso intervalo."

"E se o nosso padrão de tráfego mudar significativamente?"

"Então ajustamos os limites. Revisamos isso trimestralmente."

**ElastiCache: Dimensionamento Correto e Nós Reservados**

A conta do ElastiCache: US$ 183/mês. Uma instância cache.r6g.large do Redis em cada AZ (dois nós, primário + réplica).

As métricas do CloudWatch mostravam:

- Utilização média de memória: 34%
- Pico: 58%

A instância estava superprovisionada. Um cache.r6g.medium provavelmente lidaria com a carga com folga.

Passando de r6g.large (2 nós × US$ 0,127/hora) para r6g.medium (2 nós × US$ 0,065/hora):

- Economia mensal: US$ 113 → espera.

Na verdade as contas: large = 2 × US$ 0,127 × 730 horas = US$ 185/mês. Medium = 2 × US$ 0,065 × 730 = US$ 95/mês. Economia: US$ 90/mês.

Tom testou a instância medium em staging por duas semanas sob carga. A memória atingiu 71% no pico. Perto demais do limite para ele ficar confortável.

Ele tentou cache.r6g.large mas com Nós Reservados (compromisso de 1 ano): de On-Demand US$ 185 para Reservado US$ 120/mês. Economia: US$ 65/mês sem mudar o tipo de instância.

"Às vezes o dimensionamento correto para uma instância menor arrisca um incidente de desempenho," disse ele. "Os Nós Reservados nos dão as mesmas economias com menos risco."

**Retenção de Backup RDS: A Troca de Armazenamento**

Os backups automatizados do RDS são armazenados no S3 (sem custo adicional de armazenamento até 100% do tamanho do banco de dados). A retenção padrão é de 7 dias.

Para o banco de dados Aurora de 180 GB da Nimbus, 7 dias de backups era adequado — eles haviam conseguido restaurar a partir de backup dentro dessa janela nos testes.

Mas Tom notou: eles também tinham snapshots manuais de cada implantação significativa, mantidos indefinidamente.

23 snapshots manuais, totalizando 4,1 TB de armazenamento de snapshot.
Custo: US$ 0,095/GB/mês para backups Aurora = US$ 389/mês em armazenamento de snapshot manual.

Eles mantiveram os últimos 3 snapshots manuais por ambiente (produção, staging). Excluíram o restante.
Economia: US$ 350/mês.

"Estávamos pagando US$ 350 por mês por seguro que nunca usamos," disse Leo.

"Estávamos pagando por tranquilidade," corrigiu Tom. "A pergunta é: quanto vale a tranquilidade de US$ 350 por mês?"

"Com um plano adequado de recuperação de desastres," disse Priya, "você pode obter a mesma tranquilidade com 7 dias de backups automatizados e 3 snapshots manuais."

"Concordo. Agora."

**O Resumo da Otimização do Banco de Dados**

| Serviço                                              | Antes       | Depois   | Economia Mensal |
|------------------------------------------------------|-------------|----------|-----------------|
| Réplicas de Leitura RDS (não utilizadas)             | US$ 340     | US$ 0    | US$ 340         |
| Aurora (Reserved Instances)                          | US$ 190     | US$ 120  | US$ 70          |
| DynamoDB (On-Demand → Provisionado + Auto Scaling)   | US$ 340     | US$ 230  | US$ 110         |
| ElastiCache (Nós Reservados)                         | US$ 185     | US$ 120  | US$ 65          |
| Snapshots manuais Aurora                             | US$ 389     | US$ 39   | US$ 350         |
| **Total**                                            | **US$ 1.444** | **US$ 509** | **US$ 935/mês** |

US$ 935 por mês em economias de banco de dados. US$ 11.220 por ano.

Tom colocou esse número ao lado das economias de armazenamento (US$ 6.200/ano) e das economias com Savings Plans (US$ 14.200/ano).

Impacto total da otimização: US$ 31.620/ano.

"Isso é três engenheiros juniores," disse Maya.

"Ou um sênior," disse Priya.

"Ou doze meses de experimentos," disse Leo.

Todos os três estavam certos.

## Pontos Fortes e Limitações

**DynamoDB Provisionado com Auto Scaling**:

- Mais barato do que on-demand para cargas de trabalho previsíveis e consistentes
- O Auto Scaling lida com a variabilidade sem superprovisionamento permanente
- Requer monitoramento para garantir que os limites de capacidade permaneçam adequados

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Economias significativas para cargas de trabalho estáveis e de longa duração
- Compromisso travado — se suas necessidades mudarem, você pagou por capacidade não utilizada
- O RI Marketplace permite vender RIs RDS não utilizadas (ao contrário das Convertíveis, que não podem ser vendidas)

**O princípio geral**:

- Sempre entenda a utilização antes de otimizar
- Recursos não utilizados (como as réplicas de leitura legadas) são a otimização de maior retorno
- O dimensionamento correto requer validação em staging antes de aplicar em produção
- O preço reservado requer confiança na estabilidade da carga de trabalho

## Resumo

- **Audite primeiro**: Puxe as métricas do CloudWatch antes de fazer qualquer alteração no banco de dados.
- **Exclua recursos não utilizados**: Réplicas de leitura, bancos de dados ociosos e instâncias de teste que não são mais necessárias.
- **DynamoDB On-Demand vs Provisionado**: On-Demand para tráfego imprevisível; Provisionado + Auto Scaling para padrões consistentes.
- **ElastiCache Reserved Nodes**: Como EC2 Reserved Instances para Redis/Memcached. 30-50% de economia para cargas de trabalho estáveis.
- **Gerenciamento de snapshots RDS**: Mantenha apenas os snapshots que você precisa. Os snapshots manuais são armazenados indefinidamente a menos que sejam excluídos.
- **Dimensionamento correto com cautela**: O dimensionamento correto do banco de dados arrisca incidentes de desempenho. Teste em staging, valide sob carga.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.3)*

- **Modos de preços do DynamoDB**: On-Demand = pague por requisição (maior custo por unidade, sem mínimo). Provisionado = pague por unidade de capacidade por hora (menor custo por unidade, deve alocar capacidade). **DynamoDB Auto Scaling** ajusta automaticamente a capacidade provisionada.
- **RDS Reserved Instances**: Disponível para todos os tipos de motor RDS. As implantações Multi-AZ podem usar Reserved Instances (você se compromete com Multi-AZ). Prazo de 1 ou 3 anos.
- **ElastiCache Reserved Nodes**: Mesmo modelo de compromisso que EC2 Reserved Instances. Aplicado por nó, não por cluster.
- **Armazenamento de snapshot RDS**: Os backups automatizados são gratuitos até 100% do tamanho do banco de dados. Snapshots manuais cobrados por GB por mês no S3. Cenário do exame: "reduzir os custos de armazenamento RDS" → exclua snapshots manuais antigos.
- **Capacidade reservada DynamoDB**: Disponível para o DynamoDB também (comprometido com uma capacidade específica de leitura/escrita por 1 ou 3 anos com desconto). Diferente do provisionado padrão — você pré-paga por capacidade em todas as suas tabelas DynamoDB em uma região.
- **Aurora Serverless v2 vs provisionado**: O Serverless v2 escala automaticamente, ideal para cargas de trabalho variáveis. Provisionado com Reserved Instances é mais barato para cargas de trabalho estáveis e previsíveis.

## Exercícios

**Exercício 1 — Recordação**

Explique quando usar a capacidade on-demand do DynamoDB versus a capacidade provisionada com Auto Scaling. Que informações você precisa para tomar essa decisão?

*(Dica: Pense no que "previsível" significa em termos de dados de tráfego, e que risco o on-demand remove que o provisionado introduz.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa executa uma tabela DynamoDB para o placar de um jogo mobile. O tráfego aumenta muito durante um evento sazonal (uma semana por trimestre, tráfego 10x o normal), mas é muito consistente fora isso. Fora do evento sazonal, a empresa quer minimizar os custos do banco de dados mantendo o desempenho.

Qual estratégia de capacidade DynamoDB MELHOR atende a esses requisitos?

A) Capacidade on-demand para lidar com os picos sazonais sem throttling  
B) Capacidade provisionada definida nos níveis de pico sazonal (sempre provisionada para tráfego 10x)  
C) Capacidade provisionada com DynamoDB Auto Scaling, com capacidade máxima definida para o pico sazonal  
D) Unidades de capacidade reservada DynamoDB por 3 anos nos níveis de tráfego normal

**Dica 1**: "Tráfego consistente exceto por picos sazonais conhecidos" — qual modo lida com ambos de forma eficiente?

**Dica 2**: "Minimizar custos" durante o período de baixo movimento significa que você não pode superprovisionamento para 10x o tempo todo.

**Dica 3**: O DynamoDB Auto Scaling pode escalar para cima para o evento sazonal e voltar ao normal depois.

**Resposta**: C

**Explicação**: A capacidade provisionada com Auto Scaling escala a tabela com base no tráfego real. Durante os períodos normais, a capacidade está nos níveis normais (baixo custo). Durante o evento sazonal, o Auto Scaling detecta o aumento de tráfego e escala para o nível máximo configurado (lidando com o pico de 10x). Após o evento, volta ao normal. Isso é mais barato do que on-demand durante os períodos normais (on-demand custa mais por requisição) e mais barato do que sempre provisionar para 10x.

**Por que não A?** O on-demand lida com os picos sem throttling, mas custa mais por requisição do que o provisionado durante o tráfego normal e previsível.

**Por que não B?** Provisionar para 10x permanentemente significa 75% da capacidade provisionada ficando não utilizada 75% do ano — pagando por capacidade que nunca é usada.

**Por que não D?** As unidades de capacidade reservada o travam nos níveis de tráfego normal. Durante o evento de 10x sazonal, você seria throttled além da quantidade reservada, ou precisaria adicionar on-demand por cima.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está avaliando um novo recurso: um painel de análises de restaurantes que mostra contagens de pedidos em tempo real, receita por hora e dados demográficos de clientes. Esses dados consultariam um banco de dados aproximadamente 200 vezes por minuto (uma consulta por analista por atualização de página, com 10 analistas).

Atualmente, os dados analíticos estão no Athena (S3). Eles deveriam construir o painel no Athena, ou deveriam carregar os dados em um banco de dados? Se um banco de dados, qual (Aurora, DynamoDB, Redshift)?

Considere: frequência de consulta, requisitos de atualidade dos dados, complexidade da consulta (agregações, junções) e custo por consulta neste volume.

*(Não há uma única resposta correta. O objetivo é praticar a seleção de banco de dados para cargas de trabalho analíticas.)*

## Cena Pós-Créditos

Tom apresentou o resumo completo de otimização de custos para Maya.

Três meses de trabalho. US$ 31.620 em economias anuais identificadas. US$ 26.400 em mudanças já implementadas.

"Qual são os US$ 5.220 restantes?" perguntou Maya.

"Otimizações sobre as quais ainda não estou confiante," disse Tom. "A configuração do Aurora poderia ser ainda mais ajustada, mas quero mais um trimestre de dados antes de me comprometer. E há uma questão de transferência de dados que ainda não analisei completamente."

"Os custos de rede."

"Sim. Esse é o próximo."

Maya olhou para os números. "Tom, quero entender algo. Essa otimização — você ficou três meses nisso. É uma parte significativa do seu tempo."

"Aproximadamente 30%."

"E você economizou US$ 26.400 por ano. Então a otimização se paga em — o quê, quatro meses do seu salário?"

Tom olhou para ela. "Mais ou menos."

"E todo ano depois disso, é pura economia."

"Ou puro reinvestimento," disse ele. "Mesmo efeito."

Maya assentiu. "É isso que eu quero que você faça. Não apenas em armazenamento e bancos de dados — em tudo. Torne a otimização de custos uma função contínua do seu papel."

Tom nunca havia ouvido seu trabalho descrito dessa forma. Achou tanto preciso quanto satisfatório.

No próximo capítulo: a última categoria de custo restante — e a que surpreende quase todo mundo.
