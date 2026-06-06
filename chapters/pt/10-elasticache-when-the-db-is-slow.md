# Capítulo 10: Quando a Base de Dados É Demasiado Lenta

As métricas de carregamento de página estavam abertas no ecrã. Leo tinha estado a olhar para elas durante vinte minutos sem dizer nada.

Quarenta e sete pedidos DynamoDB por carregamento de página. Cento e oitenta e oito milissegundos apenas para obter os dados — antes de o browser renderizar um único pixel.

Ele tinha feito as contas. Dez mil utilizadores simultâneos numa sexta-feira à noite, cada um a carregar a página de navegação cerca de uma vez por minuto: quatrocentas e setenta mil leituras DynamoDB por minuto. O custo era real. Mas a latência era o verdadeiro problema. Um utilizador a abrir a página de navegação da Nimbus esperava quase duzentos milissegundos antes de aparecer qualquer coisa — e isso era numa conexão rápida.

---

*Na semana anterior, o redesenho do esquema do DynamoDB tinha funcionado. A tabela de menus era agora flexível — qualquer restaurante podia adicionar qualquer modificador, qualquer estrutura de combo, qualquer variação sazonal. O desempenho em pesquisas individuais era excelente. Mas pesquisas individuais excelentes, multiplicadas por quarenta e sete por página, continuavam a somar páginas lentas. O problema do DynamoDB estava resolvido. Um novo problema tinha tomado o seu lugar.*

---

"A base de dados está a responder em quatro milissegundos por pedido", disse Leo. "Isso é na verdade rápido. O DynamoDB está a fazer o seu trabalho."

"Então por que é que a página está lenta?", perguntou Maya.

"Porque a estamos a chamar quarenta e sete vezes por carregamento de página", disse Priya. "O problema não é a base de dados. O problema é que estamos a falar com ela demasiado."

Tom inclinou-se para a frente. Tinha o ar que ficava quando um problema estava prestes a tornar-se uma conversa de custos. "Então a solução é falar com ela menos?"

"Falar com ela menos. Lembrar mais."

---

**A Primeira Tentativa Errada**

O primeiro instinto de Leo foi guardar em cache dados por utilizador. Cada utilizador tinha uma sessão, e a sessão carregava o seu perfil: endereços guardados, métodos de pagamento, resumo do histórico de pedidos. Talvez guardar isso em cache acelerasse as coisas.

Ele implementou-o. Formato da chave Redis: `user:{userId}:profile`. TTL: dez minutos.

Ele rodou o teste de carga. O carregamento de página caiu seis milissegundos.

"Isso não é muito", observou Tom.

"Não", disse Leo.

"Por que não?"

Leo fixou o gráfico por um momento. "Porque o perfil do utilizador é apenas um pedido. Ainda há quarenta e seis chamadas DynamoDB por página. E essas são as chamadas de menu — uma por restaurante na página de navegação. Guardei a coisa errada em cache."

Este é um erro comum na cache: otimizar a coisa que não é o gargalo. O perfil do utilizador carregava em dois milissegundos. Guardar em cache algo tão rápido poupava quase nada. Os dados de menu — obtidos quarenta e sete vezes, levando quatro milissegundos cada — eram o verdadeiro problema.

"Você precisa de guardar em cache por menu, não por utilizador", disse Priya. "O menu do Restaurante 047 é o mesmo para todos os utilizadores que o navegam. Esses são os dados que valem a pena guardar em cache — são idênticos em milhares de pedidos."

As caches por utilizador são valiosas quando os utilizadores têm um estado personalizado dispendioso. As caches por entidade (menus, catálogos de produtos, configuração) são valiosas quando os mesmos dados são servidos a milhares de utilizadores. Saiba qual problema você tem antes de escrever o código.

Leo redesenhou as chaves de cache: `menu:{restaurantId}`. Uma entrada de cache por restaurante, partilhada por todos os utilizadores que navegam esse restaurante.

Ele rodou o teste de carga novamente. O carregamento de página caiu de 188 milissegundos para 12 milissegundos. Essa era a melhoria que eles andavam à procura.

---

**A Analogia do Restaurante**

Imagine a cozinha de um restaurante. Cada vez que um empregado precisa de saber os especiais do dia, caminha até ao fundo, pergunta ao chef e regressa à mesa.

Isso funciona bem se você tiver dois empregados e três mesas.

Agora imagine duzentos empregados e mil mesas. Cada um deles a ir ao fundo para a mesma pergunta. A cozinha torna-se o gargalo. O chef está a responder à mesma pergunta quatrocentas vezes por hora.

A solução óbvia: escrever os especiais num quadro na frente do restaurante. Cada empregado lê do quadro. A cozinha tem uma folga. O quadro é atualizado quando os especiais mudam.

Esse quadro é uma cache.

Uma cache é um armazenamento rápido e local de dados obtidos recentemente. Em vez de ir buscar a mesma coisa a uma fonte lenta repetidamente, você vai buscá-la uma vez e mantém-na perto.

Há outra analogia que os engenheiros acham útil: a prateleira de reserva da biblioteca. Quando um livro popular é devolvido, o bibliotecário sabe que será pedido de novo em breve, por isso coloca-o na prateleira de reserva perto do balcão em vez de o arrumar nas estantes. O próximo utente não tem de percorrer a biblioteca toda — encontra-o logo no balcão. A prateleira de reserva tem espaço limitado. Se enche, os livros mais antigos voltam para as estantes para abrir espaço aos mais novos. Uma cache funciona de forma idêntica: os dados acedidos frequentemente ficam perto da frente, os dados acedidos com pouca frequência são despejados para abrir espaço.

**Por Que Não Usar Simplesmente Memória?**

"Não podemos simplesmente guardar o menu na memória da aplicação?", perguntou Leo.

Pergunta válida.

Você pode. Para uma aplicação de servidor único, a cache em memória funciona bem. Mas a Nimbus corre atrás de um balanceador de carga, em múltiplas instâncias EC2. Se uma instância guarda o menu em cache na sua memória, as outras instâncias não têm esses dados. Cada uma mantém caches separadas. Quando o menu é atualizado, você teria de invalidar todas elas.

Este é o *problema de coerência de cache* — manter múltiplas caches consistentes.

O ElastiCache resolve isto fornecendo uma cache *centralizada* que todas as suas instâncias partilham. Em vez de cada servidor ter a sua própria memória, cada servidor lê e escreve na mesma cache. Uma atualização propaga-se a todos.

**Conheça o ElastiCache**

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Por que um serviço completamente novo? Por que não simplesmente adicionar mais capacidade à base de dados?"

Boa pergunta. A resposta é que adicionar mais capacidade à base de dados — instâncias maiores, mais réplicas de leitura — não resolve o problema fundamental. Cada um daqueles quarenta e sete pedidos por carregamento de página continua a custar tempo e dinheiro, mesmo numa base de dados mais rápida. Uma cache não torna a base de dados mais rápida; significa que à base de dados é feita a mesma pergunta muito menos vezes. Para dados que são lidos repetidamente e mudam com pouca frequência — como o menu de um restaurante — uma cache significa que a base de dados pode responder a essa pergunta uma vez a cada cinco minutos em vez de quarenta e sete vezes por carregamento de página.

O Amazon ElastiCache é um serviço de cache gerido. Ele corre motores de cache populares — Redis e Memcached — sem você ter de gerir os servidores.

O **Redis** é o mais poderoso dos dois. Ele suporta estruturas de dados complexas (strings, listas, conjuntos, hashes, conjuntos ordenados), persistência (os dados sobrevivem a reinícios), replicação e mensagens pub/sub. O Redis pode fazer mais do que cache — pode funcionar como um armazenamento de dados leve.

O **Memcached** é mais simples. Cache pura de chave-valor, escalável horizontalmente, sem persistência. Mais rápido para casos de uso simples mas com menos funcionalidades.

Para a Nimbus: Redis. Eles precisavam de guardar em cache dados de menu (estruturados), tokens de sessão (chave-valor), e mais tarde quereriam conjuntos ordenados para rankings de "restaurantes em tendência".

**Como a Cache Funciona na Prática**

O padrão básico de cache chama-se **cache-aside** (também chamado carregamento preguiçoso):

1. A aplicação precisa de dados
2. Verifica primeiro a cache
3. Se encontrado (*acerto de cache*): retorna os dados imediatamente
4. Se não encontrado (*falha de cache*): vai à base de dados, obtém os dados, guarda-os na cache, retorna-os

Em pseudocódigo:

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache por 5 minutos
return menuData
```

O primeiro pedido vai sempre à base de dados. Todos os pedidos subsequentes vão à cache. Com uma cache, as quarenta e sete leituras DynamoDB da Nimbus por carregamento de página tornam-se uma ou duas pesquisas de cache. Rápido, barato e escalável.

**O TTL: Quanto Tempo Você Se Lembra?**

Cada entrada de cache tem um **Tempo de Vida (TTL)**: a duração após a qual a entrada expira e o próximo pedido vai de volta à base de dados buscar dados frescos.

Esta é a tensão central da cache: frescura vs. desempenho.

- **TTL curto (segundos)**: Dados muito frescos, mas muitas falhas de cache. A cache quase não ajuda.
- **TTL longo (horas ou dias)**: Muito rápido, mas os dados podem ficar desatualizados. O cliente vê o menu de ontem.

Para dados de menu, cinco minutos é razoável. O menu não muda a cada segundo. Se um restaurante atualiza o seu menu, os clientes podem ver a versão antiga durante até cinco minutos — aceitável.

Para tokens de sessão (este utilizador está autenticado?), um TTL mais curto faz sentido, ou você atualiza a cache imediatamente quando a sessão muda.

Para dados financeiros (totais de pedidos, registos de pagamento), não os guarde em cache — ou se o fizer, invalide imediatamente na escrita.

Você pode estar a perguntar-se: por que não simplesmente adicionar mais capacidade à base de dados em vez de introduzir uma camada de cache completamente nova? Mais réplicas, uma instância maior — por que não isso? A resposta é que a capacidade adicional de base de dados multiplica a sua capacidade de lidar com pedidos simultâneos, mas não reduz o número de pedidos. Se dez mil utilizadores estão cada um a desencadear quarenta e sete leituras por carregamento de página, adicionar uma segunda réplica de leitura significa apenas que cada réplica lida com vinte e três mil pedidos em vez de quarenta e sete mil — o trabalho total não encolhe. Uma cache elimina o trabalho redundante por completo: esses dez mil utilizadores partilham o mesmo resultado em cache.

"Só há dois problemas difíceis em ciência da computação", citou Leo, com a entrega praticada de alguém que já o tinha dito antes. "Invalidação de cache e nomear coisas."

"Por que é que a invalidação de cache é difícil?", perguntou Maya.

"Porque quando é que os dados *realmente* mudam? O menu mudou porque um restaurante parceiro o atualizou? Ou porque um cron job correu? Ou porque um administrador o editou manualmente? Cada lugar que pode mudar os dados precisa de saber que tem de informar a cache."

É por isto que os engenheiros sénior começam uma conversa de cache com "quais são os caminhos de escrita?" em vez de "vamos adicionar Redis".

---

**A História da Invalidação de Cache**

Eles descobriram quão difícil era a invalidação de cache na primeira vez que um restaurante parceiro se queixou.

O Restaurante 112 — um sítio colombiano no Eastside — tinha atualizado os seus preços numa quinta-feira à tarde. Tinham subido a arepa de $8 para $9. Ligaram ao suporte da Nimbus vinte minutos depois.

"O nosso menu ainda mostra o preço antigo", disse o dono. "Os clientes estão a fazer pedidos a $8. Agora temos de honrar esse preço."

Tom calculou a perda enquanto Priya rastreava o bug. Cada pedido feito naqueles vinte minutos tinha cobrado $8. O restaurante queria $9. A Nimbus teria de absorver a diferença.

O TTL de cinco minutos já devia ter expirado há muito. Tinham passado vinte minutos. Priya puxou o código.

A chave de cache era `menu:restaurant-112`. Tinha sido definida com um TTL de 300 segundos. Ela verificou quando tinha sido escrita pela última vez.

"Foi definida às 14:03", disse ela. "Há vinte e dois minutos."

"Mas o TTL é cinco minutos", disse Leo.

"O TTL é cinco minutos a partir de quando foi primeiro guardada em cache. Mas cada pedido que acertava na cache estava a refrescar o TTL. A entrada de cache estava a ser tocada a cada poucos segundos por pedidos recebidos, e o TTL estava a ser reposto."

"Então nunca expirou."

"Não nesta implementação. Definíamos o TTL em cada leitura de cache. Janela deslizante. A entrada mantinha-se viva enquanto alguém a estivesse a acertar."

A correção: usar um TTL fixo definido apenas na escrita, nunca estendido na leitura. A entrada expira exatamente cinco minutos depois de ser guardada, independentemente de quantas vezes seja lida. Quando o restaurante atualizou o seu menu, a entrada antiga expirou dentro de cinco minutos e o próximo pedido obteve dados frescos.

"E para casos em que um restaurante atualiza preços e precisamos que seja refletido imediatamente?", perguntou Tom.

"Invalidação ativa", disse Priya. "Quando o portal de parceiros de restaurante submete uma atualização, a API chama `cache.delete('menu:restaurant-112')` antes de retornar. O próximo pedido obtém dados frescos imediatamente."

"Mas isso exige que o portal saiba sobre a cache."

"Cada caminho de escrita para a base de dados precisa de saber sobre a cache. Foi o que Leo disse antes. Agora vivemo-lo."

"Eu já fiz o deploy — oh." Leo tinha implementado a invalidação no portal mas tinha-se esquecido da interface de edição de administrador. Duas semanas depois, um administrador tinha atualizado um menu através do painel interno, e o preço antigo persistiu na cache durante cinco minutos. Uma versão menor do mesmo incidente.

Eles adicionaram um handler de DynamoDB Streams — do capítulo anterior — que invalidava automaticamente a cache sempre que um item de menu mudava, independentemente de qual sistema tinha desencadeado a escrita. Um handler, todos os caminhos de escrita cobertos.

---

**Evicção de Cache: Quando o Quadro Fica Cheio**

O quadro de especiais tem espaço limitado. Quando enche, você tem de apagar algo para abrir espaço.

O Redis (e as caches em geral) têm *políticas de evicção* que determinam o que é removido quando a memória está cheia:

- **LRU (Menos Recentemente Usado)**: Remove itens que não foram acedidos há mais tempo.
- **LFU (Menos Frequentemente Usado)**: Remove itens que são acedidos com menos frequência.
- **allkeys-random**: Evicção aleatória. Simples, não ótimo.
- **noeviction**: Retorna um erro quando a memória está cheia (a aplicação tem de tratar disto).

Para a maioria das aplicações web: LRU. As coisas que você não viu recentemente são provavelmente menos necessárias.

---

**O Problema da Estampida de Cache**

"Já pensámos no que acontece se a cache inteira ficar vazia de uma vez?", perguntou Priya.

"Quando é que isso aconteceria?", disse Leo.

"Quando você faz deploy de um novo cluster ElastiCache. Quando o TTL de um grande lote de entradas expira simultaneamente. Quando você esvazia a cache para forçar um refresh depois de corrigir um bug."

Leo pensou nisso. "Se a cache está vazia, cada pedido vai à base de dados. Todos de uma vez. Durante alguns segundos, a base de dados lida com a carga total de cada utilizador simultâneo."

"Sem cache à frente dela."

"Isso doeria." Leo olhou para as definições de capacidade da base de dados. "Seríamos limitados de certeza."

Isto chama-se uma **estampida de cache** (também chamada thundering herd). Acontece quando muitas entradas de cache expiram ao mesmo tempo — frequentemente porque foram todas criadas ao mesmo tempo durante um deploy ou arranque a frio — e a onda repentina de falhas de cache atinge toda a base de dados simultaneamente.

Estratégias de mitigação:

**Jitter no TTL**: Em vez de definir cada entrada de menu para exatamente 300 segundos, adicione variação aleatória: 270 a 330 segundos. As entradas expiram em momentos ligeiramente diferentes, espalhando a onda de falhas de cache ao longo de um minuto em vez de atingir simultaneamente.

**Expiração antecipada probabilística**: Antes de uma entrada expirar, uma pequena percentagem de pedidos refresca-a proativamente. Isto mantém as entradas frescas antes de ficarem desatualizadas, evitando que a expiração se torne uma falha.

**Coalescência de pedidos (mutex/lock)**: Quando ocorre uma falha de cache, adquire-se um lock antes de ir à base de dados. Outros pedidos simultâneos para a mesma chave esperam que o primeiro pedido termine e repovoe a cache, depois leem da cache. Apenas um pedido à base de dados é feito por falha de cache, mesmo sob alta concorrência.

Para a Nimbus, eles implementaram jitter no TTL. Simples, eficaz, sem complexidade adicional.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

"Duas linhas de código", disse Leo. "Para evitar uma potencial indisponibilidade da base de dados durante deploys."

"A maioria das melhorias de fiabilidade são assim", disse Priya. "Baratas de implementar, caras de descobrir que você precisava delas."

---

**Estruturas de Dados do Redis: Mais do Que Chave-Valor**

Quando a Nimbus adicionou a funcionalidade de "restaurantes em tendência", Leo inicialmente guardou o ranking como uma simples lista JSON: `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Funcionava, mas atualizá-lo era desajeitado. Para adicionar um novo restaurante ou atualizar uma pontuação, ele tinha de ler a lista inteira, modificá-la em código de aplicação e voltar a escrever tudo. Sob escritas simultâneas do pipeline de analytics, condições de corrida faziam com que as pontuações fossem sobrescritas.

Priya apontou-lhe os conjuntos ordenados do Redis.

Um **conjunto ordenado** no Redis guarda membros com pontuações numéricas associadas. Os membros são automaticamente ordenados por pontuação. As operações são atómicas — sem condições de corrida de atualizações simultâneas.

```
# Adicionar/atualizar a pontuação de um restaurante
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Obter os top 10 restaurantes por pontuação (maior primeiro)
ZREVRANGE trending:global 0 9 WITHSCORES

# Incrementar a pontuação de um restaurante atomicamente
ZINCRBY trending:global 50 "NIMBUS-047"
```

O Lambda de analytics chamava `ZINCRBY` cada vez que um pedido era feito, incrementando a pontuação do restaurante. A página inicial chamava `ZREVRANGE` para obter os dez primeiros. Sem locks, sem condições de corrida, sem ciclos de ler-modificar-escrever.

O Redis suporta várias outras estruturas de dados para além de simples chave-valor:

**Listas**: Sequências ordenadas. Empurre para a frente ou para trás. Use para filas, feeds de atividade recente, streams de logs.

**Conjuntos**: Coleções não ordenadas sem duplicados. Operações de união, interseção, diferença. Use para "que utilizadores viram esta notificação?" ou "que restaurantes estão nesta categoria?"

**Hashes**: Campos nomeados dentro de uma chave. Use para objetos estruturados onde você quer atualizar campos individuais sem reescrever o objeto inteiro.

**HyperLogLog**: Estimativa probabilística de cardinalidade. Conte visitantes únicos de uma página sem guardar cada ID de visitante. Compacto e rápido.

**Pub/Sub**: Publique mensagens em canais; os subscritores recebem-nas em tempo real. Use para notificações leves em tempo real entre serviços.

"O Redis não é apenas uma cache", disse Leo. "É um servidor de estruturas de dados."

"Essa é a sua descrição oficial", disse Priya.

"Eu pensava que era apenas um dicionário sofisticado."

"Começou assim."

---

**Write-Through: O Outro Padrão de Cache**

O cache-aside (carregamento preguiçoso) é o padrão mais comum. Mas há um segundo que vale a pena conhecer: **write-through**.

Na cache write-through, cada vez que a sua aplicação escreve na base de dados, ela também escreve na cache imediatamente.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

A vantagem: a cache está sempre atualizada. Não há dados desatualizados entre uma escrita e a expiração do TTL.

A desvantagem: cada escrita vai a dois lugares. E você povoa a cache com dados que podem nunca ser lidos. Se dez restaurantes atualizam os seus menus mas só dois deles têm tráfego significativo nos próximos cinco minutos, você fez trabalho de write-through para oito caches que não serão usadas antes de expirarem.

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Se escrevemos na cache em cada atualização, estamos a fazer mais trabalho por escrita do que antes. Como é que isso é melhor?"

"Nem sempre é melhor", disse Priya. "O write-through faz sentido quando você não pode tolerar nenhuma janela de dados desatualizados após uma escrita. O cache-aside aceita até um TTL de desatualização em troca de não fazer trabalho extra em cada escrita."

Para a Nimbus: o cache-aside era a escolha certa. Os menus eram lidos muito mais frequentemente do que eram escritos. Uma janela de cinco minutos de desatualização era aceitável. Para um sistema de negociação financeira onde cada atualização de preço precisava de ser imediatamente refletida, o write-through seria mais apropriado.

A decisão resume-se a duas perguntas: qual é a sua relação escrita-para-leitura, e quão tolerante você é a leituras desatualizadas após uma escrita?


---

**ElastiCache para Redis: O Que Você Obtém Gerido**

Como o RDS, o ElastiCache pega numa ferramenta open-source e trata do trabalho operacional:

- **Backups automatizados**: Snapshots Redis num horário
- **Replicação Multi-AZ**: Nó primário + réplicas de leitura em diferentes AZs
- **Failover automático**: Se o nó Redis primário falhar, uma réplica é promovida automaticamente
- **Modo cluster**: Sharding horizontal por múltiplos nós para caches muito grandes
- **Encriptação**: Encriptação em trânsito e em repouso para conformidade
- **Integração VPC**: A cache corre na sua rede privada, não acessível publicamente

"Quanto é que isso custa por mês?", perguntou Tom.

"Menos do que as leituras DynamoDB que estamos a substituir", disse Leo. "Cerca de duzentos dólares por mês a menos."

Leo abriu a página de preços. Ele já tinha feito as contas, mas explicou tudo a Tom.

Um `cache.t3.micro` — o nó mais pequeno — custava cerca de $12 por mês. Tinha 0,5 GB de memória. Suficiente para uma aplicação pequena com algumas centenas de chaves de cache.

Um `cache.r6g.large` — o tier apropriado para o tráfego da Nimbus — tinha 13 GB de memória e custava cerca de $140 por mês. Para comparação, a Nimbus tinha estado a gastar cerca de $400 por mês em leituras DynamoDB antes da cache. Depois da cache, essas leituras tinham caído cerca de 89 por cento. As contas davam cerca de $356 por mês poupados em leituras DynamoDB, menos $140 gastos em ElastiCache — uma poupança líquida de cerca de $216 por mês.

A expressão de Tom passou de cética a satisfeita. "Faz as contas como deve ser antes de escalarmos, mas isso bate certo." Ele anotou.

"E se alguém tentar invadir?", disse Priya. "A cache pode ter tokens de sessão. Dados de utilizadores. Precisamos de tokens de autenticação na instância Redis e de nenhum acesso público."

"Vai estar na subnet privada", disse Leo.

"Bom. Mas 'vai ficar tudo bem' não é uma postura de segurança", disse ela. "Token de autenticação. Encriptação em trânsito. Apenas VPC."

Leo acenou. Ela tinha razão.

---

**Monitorizar a Cache**

"Já pensámos no que acontece quando a cache não está a funcionar corretamente?", perguntou Priya, uma semana depois do deploy do Redis. "Não que falhe completamente — funciona, mas mal. Taxa de falhas alta. Taxa de evicção alta. Latência a subir."

"Eu reparava quando os tempos de carregamento de página aumentassem", disse Leo.

"Altura em que a base de dados já está a sofrer", disse ela.

O ElastiCache expõe métricas através do CloudWatch. As que mais importam:

**CacheHitRate**: A percentagem de leituras de cache que retornaram um resultado. Idealmente acima de 80% para uma cache madura. Uma taxa de acertos em queda sinaliza que os seus dados mais acedidos não estão na cache — ou os TTLs são demasiado curtos, ou a cache é demasiado pequena, ou os seus padrões de acesso mudaram.

**CacheMisses**: Contagem absoluta de falhas de cache. Um pico repentino aqui significa que a cache não está a ajudar e a base de dados está a receber a carga total.

**Evictions**: O número de itens de cache despejados para abrir espaço a novos. Taxas de evicção altas significam que a sua cache é demasiado pequena para o seu working set. Você precisa de mais memória ou de uma estratégia de cache mais seletiva.

**CurrConnections**: Conexões de cliente atuais ao Redis. Demasiadas conexões podem esgotar o limite de conexões do Redis. As aplicações devem usar pooling de conexões para evitar abrir uma nova conexão em cada pedido.

**ReplicationLag**: Quão atrasada está a réplica de leitura em relação à primária. Se isto cresce, as leituras da réplica podem retornar dados desatualizados.

Leo configurou dois alarmes no CloudWatch. Primeiro: alertar se a taxa de acertos de cache caísse abaixo de 70% durante quinze minutos consecutivos — isso sinalizaria um problema que vale a pena investigar antes de a base de dados o sentir. Segundo: alertar se a taxa de evicção excedesse 100 evicções por minuto — isso sinalizaria que a cache estava subdimensionada.

"Dois alarmes", disse Priya, revendo a configuração. "É um bom começo."

"Também adicionei um painel", disse Leo. "Taxa de acertos, taxa de falhas, evicções, latência. Tudo visível num só lugar."

"Isso é melhor do que esperar que a página fique lenta."

"Consideravelmente melhor", concordou Leo.


---

**ElastiCache vs DAX: Qual Cache para DynamoDB?**

"Se estamos a guardar em cache dados DynamoDB", perguntou Maya, "por que não usar DAX em vez de ElastiCache? Vi isso na documentação."

Boa pergunta.

O **DAX (DynamoDB Accelerator)** é uma cache em memória feita de propósito para DynamoDB. Ele interceta chamadas à API do DynamoDB ao nível do cliente — o código da sua aplicação fala com o DAX usando o mesmo SDK do DynamoDB. As falhas de cache são automaticamente obtidas do DynamoDB. Os acertos de cache retornam em microssegundos. A invalidação é tratada automaticamente quando os dados mudam.

O **ElastiCache** é uma cache de uso geral. Você gere as chaves de cache, a lógica de TTL, a invalidação — tudo. Mais controlo, mais responsabilidade.

Quando usar cada um:

| Cenário | Recomendação |
|---|---|
| Você está a guardar em cache leituras DynamoDB e quer zero alterações na aplicação | DAX |
| Você precisa de latência de microssegundos em leituras DynamoDB | DAX |
| Você está a guardar em cache de múltiplas fontes (DynamoDB + RDS + APIs externas) | ElastiCache |
| Você precisa de estruturas de dados Redis (conjuntos ordenados, pub/sub, HyperLogLog) | ElastiCache |
| Você precisa de controlo fino de TTL e lógica de invalidação personalizada | ElastiCache |
| Você precisa de armazenamento de sessão, limitação de taxa ou locks distribuídos | ElastiCache |

Para a Nimbus: eles escolheram o ElastiCache porque estavam a guardar em cache dados de múltiplas fontes — DynamoDB para menus, RDS para resumos de histórico de pedidos, APIs externas para avaliações de restaurantes. O DAX só funciona com DynamoDB. E eles precisavam de conjuntos ordenados do Redis para os rankings de tendências.

"Se fosse puramente um problema de cache de DynamoDB", disse Priya, "o DAX seria a resposta mais simples. Um serviço, invalidação automática, mesma API. Mas temos mais do que uma fonte de dados."

"Então o DAX é mais simples quando você usa apenas DynamoDB", resumiu Maya. "O ElastiCache quando você precisa da caixa de ferramentas completa."

"Esse é o compromisso."

### Quando os Dados em Cache Não Podem Ser Perdidos: Amazon MemoryDB

"Por que é que alguém usaria o Redis como base de dados primária?", perguntou Maya. "Não é uma cache?"

Essa é exatamente a pergunta certa.

O ElastiCache para Redis é uma cache — rápido, em memória, e por design, não a fonte da verdade. Se um nó ElastiCache falha, a cache está vazia ao reiniciar. As aplicações reaquecem-na a partir da base de dados. Isso está bem para uma cache.

Mas alguns casos de uso tratam o Redis não como uma cache mas como um armazenamento de dados primário — estado de sessão que tem de sobreviver a reinícios, um leaderboard em tempo real que não pode ser perdido, um carrinho de compras que tem de persistir através de uma falha de AZ. Para estes casos de uso, a durabilidade eventual do ElastiCache é um risco.

O **Amazon MemoryDB for Redis** é uma base de dados em memória durável, totalmente gerida e compatível com Redis. Ao contrário do ElastiCache, o MemoryDB usa um log de transações distribuído guardado por múltiplas AZs que torna cada escrita durável antes de ser confirmada. Os dados sobrevivem a falhas de nós — não porque são reproduzidos a partir de uma base de dados mais lenta, mas porque nunca estiveram apenas num lugar.

A distinção-chave:

| | ElastiCache for Redis | MemoryDB for Redis |
|---|---|---|
| Papel | Camada de cache | Base de dados primária |
| Durabilidade | Não garantida em caso de falha | Log de transações Multi-AZ |
| Latência | Leituras e escritas em microssegundos | Leituras em microssegundos, escritas em milissegundos de um dígito |

Ambos suportam os mesmos comandos e estruturas de dados do Redis. A API é a mesma. A garantia de durabilidade não é.

Para a Nimbus: a equipa quer guardar contagens de pedidos por restaurante em tempo real como um conjunto ordenado do Redis — e tem de sobreviver a uma falha de AZ sem reabastecer a partir da base de dados. Esse requisito — compatível com Redis *e* durável — é o sinal exato para o MemoryDB.

"Então não temos de a reaquecer depois de uma falha?", perguntou Leo.

"É essa a questão", disse Priya. "Se o nó falha e volta, os dados estão lá. O log de transações guardou-os."

Leo fixou a página de preços por um momento. "Custa mais do que o ElastiCache."

"Tudo em que vale a pena confiar custa", disse Priya.

## Pontos Fortes e Limitações

**Por que a cache é poderosa**:

- Reduz drasticamente a carga da base de dados (menos consultas, custos mais baixos)
- Tempos de resposta sub-milissegundo para acertos de cache
- Protege a sua base de dados de picos de tráfego
- O Redis suporta estruturas de dados mais ricas do que um simples armazenamento chave-valor
- A mitigação de estampida de cache (jitter no TTL, coalescência) protege contra surtos de arranque a frio

**Onde a cache fica complicada**:

- A invalidação de cache é genuinamente difícil — dados desatualizados causam bugs
- Acrescenta complexidade operacional (outro serviço para monitorizar, outro ponto de falha)
- Problema do arranque a frio: quando você faz deploy de raiz, a cache está vazia — a base de dados recebe a carga total
- Estampida de cache: se muitas entradas expiram de uma vez, todos os pedidos atingem a base de dados simultaneamente
- Os nós ElastiCache não são gratuitos — você paga por eles mesmo quando inativos

**ElastiCache vs DAX do DynamoDB**:

Se você está a guardar em cache dados DynamoDB especificamente, a AWS oferece o **DAX (DynamoDB Accelerator)** — uma cache em memória feita de propósito para DynamoDB. O DAX é transparente para o código da sua aplicação (mesma API), reduz a latência de leitura do DynamoDB para microssegundos e trata da invalidação de cache automaticamente.

Use DAX quando o seu gargalo são leituras DynamoDB e você quer cache sem alterações. Use ElastiCache quando você precisa de uma cache de uso geral para qualquer fonte de dados, ou quando precisa de estruturas de dados Redis.

## Resumo

Quarenta e sete chamadas à base de dados tornaram-se uma pesquisa de cache. A página passou de 188 milissegundos para 12. Adicionar uma camada de cache é uma das mudanças de maior alavancagem que uma aplicação em crescimento pode fazer — mas apenas quando a cache é projetada com cuidado, com respostas claras à pergunta "quando é que estes dados mudam?".

- Uma cache é um armazenamento rápido de dados obtidos recentemente — você pergunta uma vez, lembra-se da resposta. O ElastiCache é o serviço de cache gerido da AWS, suportando **Redis** (persistência, estruturas de dados complexas, pub/sub) e **Memcached** (puro chave-valor, escalonamento horizontal).
- O **padrão cache-aside** (carregamento preguiçoso): verificar primeiro a cache, recorrer à base de dados em caso de falha. O **TTL** controla quanto tempo os dados ficam em cache — TTL curto significa dados mais frescos e mais falhas; TTL longo significa respostas mais rápidas e potencial desatualização.
- Guarde em cache a coisa certa: dados por entidade partilhados por muitos utilizadores, não dados por utilizador únicos de cada sessão. A estampida de cache ocorre quando muitas entradas expiram simultaneamente — mitigue com jitter no TTL.
- O **DAX** é a escolha certa para cache apenas de DynamoDB. O **ElastiCache** é mais flexível para cache de múltiplas fontes e estruturas de dados Redis.
- A parte mais difícil da cache é a invalidação: saber quando os dados mudam e atualizar a cache em todos os caminhos de código que os escrevem. Uma cache é tão fiável quanto a sua estratégia de invalidação.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- **Redis vs Memcached no exame**: Redis = persistência, replicação, estruturas complexas, pub/sub. Memcached = chave-valor simples, escalonamento horizontal puro. Quando o cenário menciona "você não pode perder dados em cache", a resposta é Redis (persiste para disco).
- **Sinais de caso de uso de ElastiCache**: "base de dados é um gargalo", "carga de trabalho com muitas leituras", "reduzir latência", "armazenamento de sessão" — tudo aponta para ElastiCache.
- **Sinal de DAX**: "reduzir latência de leitura do DynamoDB" ou "leituras do DynamoDB são demasiado lentas" → DAX, não ElastiCache.
- **Gestão de sessão**: ElastiCache Redis é a resposta canónica para guardar dados de sessão de utilizador. Aplicação sem estado + armazenamento de sessão Redis = escalonamento horizontal com sessões consistentes.
- **Write-through vs cache-aside**: O cache-aside (carregamento preguiçoso) é o mais comum. O write-through atualiza a cache em cada escrita — nunca desatualizado, mas mais operações de escrita. O exame pode distingui-los.
- **Políticas de evicção de cache**: LRU (menos recentemente usado) é a resposta de exame mais comum para cargas de trabalho web gerais.
- **ElastiCache vs. MemoryDB:** ElastiCache = camada de cache, rápido, perda de dados aceitável em caso de falha. MemoryDB = base de dados primária em memória durável, compatível com Redis, log de transações Multi-AZ. Gatilho de exame: "compatível com Redis E durável" ou "armazenamento de dados primário em Redis" → MemoryDB, não ElastiCache.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: o que é a invalidação de cache e por que é difícil?

*(Sugestão: Pense em todos os lugares na Nimbus onde os dados de menu poderiam ser atualizados — o portal de parceiros de restaurante, uma ferramenta de administrador, um cron job. Cada um desses caminhos precisa de saber sobre a cache.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma plataforma de streaming de vídeo serve milhões de utilizadores. O catálogo de filmes disponíveis muda com pouca frequência (atualizado durante a noite). A aplicação está a experimentar utilização elevada de CPU da base de dados porque cada pedido de utilizador consulta o catálogo. A equipa quer reduzir a carga da base de dados mantendo os dados do catálogo precisos dentro de uma hora após as atualizações.

Qual solução MELHOR satisfaz estes requisitos?

A) Adicionar réplicas de leitura à base de dados RDS para distribuir a carga  
B) Migrar o catálogo para DynamoDB com capacidade sob demanda  
C) Usar ElastiCache para Redis com um TTL de 1 hora para dados de catálogo  
D) Aumentar o tamanho da instância RDS para lidar com mais consultas simultâneas

**Sugestão 1**: Os dados têm muitas leituras e mudam com pouca frequência. Que padrão é ideal para isto?

**Sugestão 2**: "Preciso dentro de uma hora" traduz-se diretamente num parâmetro de configuração de cache específico.

**Sugestão 3**: O objetivo é reduzir a carga da base de dados, não apenas lidar com mais dela.

**Resposta**: C

**Explicação**: O ElastiCache com um TTL de uma hora guarda em cache os dados do catálogo após o primeiro pedido por chave. Os pedidos subsequentes retornam da cache sem tocar na base de dados. Quando a atualização noturna corre, as entradas expiram dentro de uma hora e dados frescos são carregados no próximo pedido.

**Por que não A?** As réplicas de leitura distribuem o tráfego de leitura por mais nós de base de dados mas não reduzem o número total de consultas. São úteis para escalar leituras, não para reduzir a carga da base de dados de consultas frequentemente repetidas.

**Por que não B?** Migrar para DynamoDB não resolve o problema subjacente — os dados do catálogo continuariam a ser obtidos da base de dados (DynamoDB) em cada pedido de utilizador.

**Por que não D?** Aumentar a instância lida com mais consultas simultâneas mas não reduz o número de consultas. A ineficiência fundamental permanece.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer adicionar uma funcionalidade de "restaurantes em tendência": uma lista classificada dos top 10 restaurantes por volume de pedidos nas últimas 24 horas, atualizada a cada 15 minutos.

Como implementaria isto com ElastiCache Redis? Que estrutura de dados Redis usaria para a classificação? Qual seria o TTL da sua cache, e quando exatamente atualizaria a cache?

Considere também: o que acontece se o nó ElastiCache ficar inoperacional? A funcionalidade falha? Como projetaria em torno desta falha?

*(Não existe uma resposta única correta. O objetivo é praticar design de cache e raciocínio sobre falhas.)*

## Cena Pós-Créditos

"Eu já fiz o deploy — oh." Leo tinha enviado a integração do Redis para produção antes de atualizar as definições do pool de conexões. Sob carga, a aplicação estava a abrir demasiadas conexões Redis. Ele teve de reverter e fazer deploy de novo com a configuração certa.

Leo adicionou cache Redis para o menu. O tempo de carregamento de página caiu de 188 milissegundos para 12 milissegundos.

Quarenta e sete chamadas DynamoDB tornaram-se uma pesquisa Redis. A chamada demorou 0,8 milissegundos.

Ele anunciou isto no standup de segunda-feira.

"Bom trabalho", disse Priya, sem levantar os olhos do portátil.

"Obrigado", disse Leo.

"Quando foi a última vez que rodou o token de autenticação do Redis?"

Leo olhou para as suas notas. "Acho que não defini nenhum."

"Então a cache não está autenticada."

"Está dentro do VPC."

"Tal como tudo o resto que é comprometido." Ela finalmente levantou os olhos. "Se o portátil do Leo ficar infetado e alguém entrar no VPC, a sua cache não tem palavra-passe."

Leo fixou-a.

"Vou definir o token de autenticação", disse ele.

No próximo capítulo: a rede privada que separa o que a Nimbus possui do resto da internet.
