# Capítulo 10: Quando a Base de Dados É Demasiado Lenta

As métricas de carregamento de página estavam abertas no ecrã. Leo tinha estado a olhar para elas durante vinte minutos sem dizer nada.

Quarenta e sete pedidos DynamoDB por carregamento de página. Cento e oitenta e oito milissegundos apenas para obter os dados — antes de o browser renderizar um único pixel.

Tinha feito as contas. Dez mil utilizadores em simultâneo numa sexta-feira à noite: quatrocentos e setenta mil leituras DynamoDB por minuto. O custo era real. Mas a latência era o verdadeiro problema. Um utilizador a abrir a página de navegação Nimbus esperava quase duzentos milissegundos antes de aparecer qualquer coisa — e isso era numa conexão rápida.

"A base de dados está a responder em quatro milissegundos por pedido," disse Leo. "Isso é na verdade rápido. O DynamoDB está a fazer o seu trabalho."

"Então por que razão é a página lenta?" perguntou Maya.

"Porque a estamos a chamar quarenta e sete vezes por carregamento de página," disse Priya. "O problema não é a base de dados. O problema é que estamos a falar com ela demasiado."

Tom inclinou-se para a frente. Tinha o ar que ficava quando um problema estava prestes a tornar-se uma conversa de custos. "Portanto a solução é falar com ela menos?"

"Falar com ela menos. Lembrar mais."

**A Analogia do Restaurante**

Imagine a cozinha de um restaurante. Cada vez que um empregado precisa de saber os especiais do dia, caminha até ao fundo, pergunta ao cozinheiro e regressa à mesa.

Isso funciona bem se tiver dois empregados e três mesas.

Agora imagine duzentos empregados e mil mesas. Cada um deles a ir ao fundo para a mesma pergunta. A cozinha torna-se o gargalo. O cozinheiro está a responder à mesma pergunta quatrocentas vezes por hora.

A solução óbvia: escrever os especiais num quadro na frente do restaurante. Cada empregado lê do quadro. A cozinha fica descansada. O quadro é actualizado quando os especiais mudam.

Esse quadro é uma cache.

Uma cache é um armazenamento rápido e local de dados obtidos recentemente. Em vez de ir buscar a mesma coisa a uma fonte lenta repetidamente, vai buscá-la uma vez e mantém-na perto.

**Por Que Não Usar Simplesmente Memória?**

"Não podemos simplesmente guardar o menu na memória da aplicação?" perguntou Leo.

Pergunta válida.

Pode. Para uma aplicação de servidor único, a cache em memória funciona bem. Mas Nimbus corre atrás de um balanceador de carga, em múltiplas instâncias EC2. Se uma instância guarda o menu em cache na sua memória, as outras instâncias não têm esses dados. Cada uma mantém caches separadas. Quando o menu é actualizado, teria de invalidar todas elas.

Este é o *problema de coerência de cache* — manter múltiplas caches consistentes.

O ElastiCache resolve isto fornecendo uma cache *centralizada* que todas as suas instâncias partilham. Em vez de cada servidor ter a sua própria memória, cada servidor lê e escreve na mesma cache. Uma actualização propaga-se a todos.

**Conheça o ElastiCache**

O Amazon ElastiCache é um serviço de cache gerido. Corre motores de cache populares — Redis e Memcached — sem ter de gerir os servidores.

**Redis** é o mais poderoso dos dois. Suporta estruturas de dados complexas (strings, listas, conjuntos, hashes, conjuntos ordenados), persistência (os dados sobrevivem a reinícios), replicação e mensagens pub/sub. O Redis pode fazer mais do que cache — pode funcionar como um armazenamento de dados leve.

**Memcached** é mais simples. Cache pura de valor-chave, escalável horizontalmente, sem persistência. Mais rápido para casos de uso simples mas com menos funcionalidades.

Para Nimbus: Redis. Precisavam de guardar em cache dados de menu (estruturados), tokens de sessão (valor-chave), e mais tarde quereriam conjuntos ordenados para rankings de "restaurantes em tendência".

**Como a Cache Funciona na Prática**

O padrão básico de cache chama-se **cache-aside** (também chamado carregamento preguiçoso):

1. A aplicação precisa de dados
2. Verifica primeiro a cache
3. Se encontrado (*acerto de cache*): devolve os dados imediatamente
4. Se não encontrado (*falha de cache*): vai à base de dados, obtém os dados, guarda-os na cache, devolve-os

Em pseudocódigo:

```
dadosMenu = cache.get("menu:restaurante-047")
se dadosMenu for nulo:
    dadosMenu = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurante-047", dadosMenu, ttl=300)  # Cache por 5 minutos
devolver dadosMenu
```

O primeiro pedido vai sempre à base de dados. Todos os pedidos subsequentes vão à cache. Com uma cache, os quarenta e sete pedidos DynamoDB de Nimbus por carregamento de página tornam-se uma ou duas pesquisas de cache. Rápido, barato e escalável.

**O TTL: Quanto Tempo Se Lembra?**

Cada entrada de cache tem um **Tempo de Vida (TTL)**: a duração após a qual a entrada expira e o próximo pedido vai de volta à base de dados para dados frescos.

Esta é a tensão central da cache: frescura vs. desempenho.

- **TTL curto (segundos)**: Dados muito frescos, mas muitas falhas de cache. A cache quase não ajuda.
- **TTL longo (horas ou dias)**: Muito rápido, mas os dados podem ficar desactualizados. O cliente vê o menu de ontem.

Para dados de menu, cinco minutos é razoável. O menu não muda a cada segundo. Se um restaurante actualiza o menu, os clientes podem ver a versão antiga durante até cinco minutos — aceitável.

Para tokens de sessão (este utilizador está ligado?), um TTL mais curto faz sentido, ou actualiza a cache imediatamente quando a sessão muda.

Para dados financeiros (totais de encomendas, registos de pagamento), não os guarde em cache — ou se o fizer, invalide imediatamente ao escrever.

"Existem apenas dois problemas difíceis em ciência informática," citou Leo, com a entrega praticada de alguém que o tinha dito antes. "Invalidação de cache e nomear coisas."

"Por que razão é a invalidação de cache difícil?" perguntou Maya.

"Porque quando *realmente* mudam os dados? O menu mudou porque um parceiro de restaurante o actualizou? Ou porque um cron job correu? Ou porque um administrador o editou manualmente? Cada lugar que pode mudar os dados precisa de saber para informar a cache."

É por isso que os engenheiros sénior começam uma conversa de cache com "quais são os caminhos de escrita?" em vez de "vamos adicionar Redis".

**Evicção de Cache: Quando o Quadro Fica Cheio**

O quadro de especiais tem espaço limitado. Quando fica cheio, tem de apagar algo para criar espaço.

O Redis (e as caches em geral) têm *políticas de evicção* que determinam o que é removido quando a memória está cheia:

- **LRU (Menos Recentemente Usado)**: Remove itens que não foram acedidos durante mais tempo.
- **LFU (Menos Frequentemente Usado)**: Remove itens que são acedidos com menos frequência.
- **allkeys-random**: Evicção aleatória. Simples, não óptimo.
- **noeviction**: Devolve um erro quando a memória está cheia (a aplicação deve tratar disto).

Para a maioria das aplicações web: LRU. As coisas que não viu recentemente são provavelmente menos necessárias.

**ElastiCache para Redis: O Que Obtém Gerido**

Como o RDS, o ElastiCache pega numa ferramenta open-source e trata do trabalho operacional:

- **Cópias de segurança automatizadas**: Snapshots Redis num horário
- **Replicação Multi-AZ**: Nó primário + réplicas de leitura em diferentes AZs
- **Failover automático**: Se o nó Redis primário falhar, uma réplica é promovida automaticamente
- **Modo cluster**: Particionamento horizontal em múltiplos nós para caches muito grandes
- **Encriptação**: Encriptação em trânsito e em repouso para conformidade
- **Integração VPC**: A cache corre na sua rede privada, não acessível publicamente

Tom olhou para a lista de funcionalidades. "Quanto custa?"

"Menos do que as leituras DynamoDB que estamos a substituir," disse Leo. "Fiz as contas."

A expressão de Tom mudou de céptico para interessado. Isso era progresso.

## Pontos Fortes e Limitações

**Por que razão a cache é poderosa**:

- Reduz drasticamente a carga da base de dados (menos consultas, custos mais baixos)
- Tempos de resposta sub-milissegundo para acertos de cache
- Protege a sua base de dados de picos de tráfego
- O Redis suporta estruturas de dados mais ricas do que um simples armazenamento de valor-chave

**Onde a cache fica complicada**:

- A invalidação de cache é genuinamente difícil — dados desactualizados causam bugs
- Acrescenta complexidade operacional (outro serviço para monitorizar, outro ponto de falha)
- Problema de arranque a frio: quando implanta de novo, a cache está vazia — a base de dados recebe a carga total
- Estampida de cache: se muitas entradas expiram ao mesmo tempo, todos os pedidos vão à base de dados simultaneamente
- Os nós ElastiCache não são gratuitos — paga por eles mesmo quando inactivos

**ElastiCache vs. DAX DynamoDB**:

Se está especificamente a guardar em cache dados DynamoDB, a AWS oferece **DAX (DynamoDB Accelerator)** — uma cache em memória específica para DynamoDB. O DAX é transparente para o código da sua aplicação (mesma API), reduz a latência de leitura DynamoDB para microsegundos e trata da invalidação de cache automaticamente.

Use DAX quando o seu gargalo são leituras DynamoDB. Use ElastiCache quando precisar de uma cache de uso geral para qualquer fonte de dados.

## Resumo

- Uma cache é um armazenamento rápido de dados obtidos recentemente — pergunta uma vez, lembra a resposta.
- O ElastiCache é o serviço de cache gerido da AWS, que suporta Redis e Memcached.
- **Redis** é mais rico (estruturas de dados complexas, persistência, pub/sub). **Memcached** é mais simples (puro valor-chave, escalável horizontalmente).
- O **padrão cache-aside** (carregamento preguiçoso): verificar primeiro a cache, recorrer à base de dados em caso de falha.
- O **TTL** controla quanto tempo os dados ficam em cache. TTL curto = fresco, muitas falhas. TTL longo = rápido, potencialmente desactualizado.
- A invalidação de cache é difícil. Conheça todos os caminhos de escrita antes de adicionar uma cache.
- O ElastiCache gere replicação, failover, cópias de segurança e encriptação — concentra-se no design de cache.
- **DAX** é a cache específica do DynamoDB. O ElastiCache é de uso geral.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- **Redis vs Memcached no exame**: Redis = persistência, replicação, estruturas complexas, pub/sub. Memcached = valor-chave simples, escalonamento horizontal puro. Quando o cenário menciona "não pode perder dados em cache", a resposta é Redis (persiste para disco).
- **Sinais de caso de uso ElastiCache**: "base de dados é um gargalo", "carga de trabalho com muitas leituras", "reduzir latência", "armazenamento de sessão" — tudo aponta para ElastiCache.
- **Sinal DAX**: "reduzir latência de leitura DynamoDB" ou "leituras DynamoDB são demasiado lentas" → DAX, não ElastiCache.
- **Gestão de sessão**: ElastiCache Redis é a resposta canónica para guardar dados de sessão de utilizador. Aplicação sem estado + armazenamento de sessão Redis = escalonamento horizontal com sessões consistentes.
- **Write-through vs cache-aside**: Cache-aside (carregamento preguiçoso) é o mais comum. Write-through actualiza a cache em cada escrita — nunca desactualizado, mas mais operações de escrita. O exame pode distingui-los.
- **Políticas de evicção de cache**: LRU (menos recentemente usado) é a resposta de exame mais comum para cargas de trabalho web gerais.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: o que é a invalidação de cache e por que razão é difícil?

*(Sugestão: Pense em todos os lugares na Nimbus onde os dados de menu poderiam ser actualizados — o portal de parceiros de restaurante, uma ferramenta de administrador, um cron job. Cada um desses caminhos precisa de saber sobre a cache.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma plataforma de streaming de vídeo serve milhões de utilizadores. O catálogo de filmes disponíveis muda infrequentemente (actualizado nocturnamente). A aplicação está a experimentar utilização elevada de CPU da base de dados porque cada pedido de utilizador consulta o catálogo. A equipa quer reduzir a carga da base de dados mantendo os dados do catálogo precisos dentro de uma hora após as actualizações.

Qual solução MELHOR satisfaz estes requisitos?

A) Adicionar réplicas de leitura à base de dados RDS para distribuir a carga  
B) Migrar o catálogo para DynamoDB com capacidade a pedido  
C) Usar ElastiCache para Redis com um TTL de 1 hora para dados de catálogo  
D) Aumentar o tamanho da instância RDS para lidar com mais consultas em simultâneo

**Sugestão 1**: Os dados têm muitas leituras e mudam infrequentemente. Que padrão é ideal para isto?

**Sugestão 2**: "Preciso dentro de uma hora" traduz-se directamente num parâmetro de configuração de cache específico.

**Sugestão 3**: O objectivo é reduzir a carga da base de dados, não apenas lidar com mais dela.

**Resposta**: C

**Explicação**: ElastiCache com um TTL de uma hora guarda em cache os dados do catálogo após o primeiro pedido por chave. Os pedidos subsequentes retornam da cache sem tocar na base de dados. Quando a actualização nocturna corre, as entradas expiram dentro de uma hora e dados frescos são carregados no próximo pedido.

**Por que não A?** As réplicas de leitura distribuem o tráfego de leitura por mais nós de base de dados mas não reduzem o número total de consultas. São úteis para escalonamento de leituras, não para reduzir carga de base de dados de consultas frequentemente repetidas.

**Por que não B?** Migrar para DynamoDB não resolve o problema subjacente — os dados do catálogo continuariam a ser obtidos da base de dados (DynamoDB) em cada pedido de utilizador.

**Por que não D?** Aumentar a instância lida com mais consultas em simultâneo mas não reduz o número de consultas. A ineficiência fundamental permanece.

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus quer adicionar uma funcionalidade de "restaurantes em tendência": uma lista classificada dos top 10 restaurantes por volume de encomendas nas últimas 24 horas, actualizada a cada 15 minutos.

Como implementaria isto com ElastiCache Redis? Que estrutura de dados Redis usaria para a classificação? Qual seria o TTL da sua cache, e quando exactamente actualizaria a cache?

Considere também: o que acontece se o nó ElastiCache ficar inoperacional? A funcionalidade falha? Como projectaria em torno desta falha?

*(Não existe uma resposta única correcta. O objectivo é praticar design de cache e raciocínio sobre falhas.)*

## Cena Pós-Créditos

Leo adicionou cache Redis para o menu. O tempo de carregamento de página desceu de 188 milissegundos para 12 milissegundos.

Quarenta e sete chamadas DynamoDB tornaram-se uma pesquisa Redis. A chamada demorou 0,8 milissegundos.

Anunciou isto no standup de segunda-feira.

"Bom trabalho," disse Priya, sem levantar os olhos do portátil.

"Obrigado," disse Leo.

"Quando rodou pela última vez o token de autenticação Redis?"

Leo olhou para as suas notas. "Não acho que defini um."

"Portanto a cache não está autenticada."

"Está dentro do VPC."

"Também está tudo o resto que foi comprometido." Finalmente levantou os olhos. "Se o portátil do Leo ficar infectado e alguém entrar no VPC, a cache não tem palavra-passe."

Leo fixou-a.

"Vou definir o token de autenticação," disse ele.

No próximo capítulo: a rede privada que separa o que Nimbus possui do resto da internet.
