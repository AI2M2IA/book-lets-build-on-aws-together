# Capítulo 9: Quando a Tabela Fica Grande

A cozinha do primeiro restaurante parceiro da Nimbus cheirava a alho e pão quente mesmo às dez da manhã. Maya estava lá para uma demonstração, observando um cozinheiro deslizar o dedo pela aplicação para registar uma substituição — peixe em vez de camarão, temporariamente em falta. O deslize aconteceu. O menu atualizou. Um cliente em outra parte da cidade viu a mudança em segundos.

Aquilo tinha parecido mágica.

De volta ao escritório, a mágica tinha começado a ficar mais lenta.

A tabela de menus tinha 50.000 itens.

Isso era em 287 restaurantes — a contagem de parceiros tinha explodido dos quarenta e sete da época do balanceador de carga para quase trezentos em menos de um ano — cada um com especiais diários, itens sazonais e variações regionais. Alguns itens tinham modificadores — tamanho, nível de picante, escolha de proteína. Alguns tinham combos que referenciavam outros itens. Alguns apareciam no menu apenas nos dias de semana, ou apenas durante o almoço, ou apenas em certas cidades.

A consulta SQL que obtinha o menu completo de um restaurante costumava retornar em 200 milissegundos.

Agora demorava quatro segundos.

Quatro segundos é a diferença entre alguém fazer um pedido e alguém fechar a aplicação. Leo tinha rodado o plano de consulta. Tom tinha olhado para a configuração de índices. Priya tinha aumentado a contagem de réplicas de leitura. Nada disso tinha feito uma diferença significativa.

E isso mudou o clima na sala.

---

**A Primeira Tentativa: Mais Índices**

Leo tinha o plano de consulta aberto. Ele percorreu-o cuidadosamente.

"O problema é este join", disse ele. "Quando puxamos o menu de um restaurante, fazemos o join da tabela menu_items com a tabela modifiers, depois com a tabela combos, depois com a tabela availability_windows. Quatro tabelas, três joins, cinquenta mil linhas."

Ele adicionou um índice em `restaurantId` em cada tabela. Rodou a consulta novamente. Dois segundos. Melhor, mas não suficientemente bom.

Tom tinha lido algo sobre query hints. Passou uma tarde a ajustar. Um vírgula três segundos. Ainda não bom.

"E se desnormalizarmos?", perguntou Leo. "Combinar os modificadores numa coluna JSON diretamente na tabela menu_items. Menos joins."

Eles tentaram. Um segundo exato. Pareceu progresso. Maya enviou uma mensagem aos restaurantes parceiros dizendo que tinham resolvido o problema de velocidade. Foi numa terça-feira.

Na quinta-feira a consulta tinha voltado a 2,8 segundos. Os dados tinham crescido. Mais restaurantes tinham aderido. Mais itens por restaurante. A consulta que parecia resolvida não estava resolvida.

"A abordagem de índices está a aguentar os dados de hoje", disse Priya. "Mas estamos a adicionar quarenta restaurantes por semana. No próximo trimestre teremos o dobro dos itens. Como é que a consulta fica então?"

"Três segundos no mínimo", disse Leo. "Provavelmente cinco."

"Então comprámos algumas semanas para nós."

"Sim."

Eles ficaram com aquilo. Uma correção que expira não é realmente uma correção.

---

**A Segunda Tentativa: Réplicas de Leitura**

Priya já tinha aumentado a contagem de réplicas de leitura uma vez. Tentou novamente — duas réplicas de leitura agora, e a aplicação balanceava a carga entre elas. A teoria era sólida: distribuir o tráfego de leitura, cada réplica faz menos trabalho.

Ajudou um pouco. A carga de pico caiu de 2,8 segundos para 2,2 segundos.

"Isso é porque o gargalo não é o número de leituras", disse Tom, olhando para as métricas da base de dados. "É a própria consulta. Mais réplicas significa mais servidores a rodar a mesma consulta lenta. A consulta continua lenta."

"Quanto é que isso custa por mês?", acrescentou ele, porque ele sempre perguntava. "Duas réplicas de leitura extra num db.r5.large — são cerca de 350 dólares por mês. Por uma melhoria de dois segundos."

Leo fechou o painel de réplicas.

"Então mais hardware não corrige uma consulta má", disse Maya.

"Quando um problema sobrevive à indexação, às tentativas de cache e a réplicas extra", disse Leo devagar, "talvez o problema não seja a configuração. Talvez seja a forma do sistema."

Foi o início de uma conversa mais longa.

---

*Na semana anterior, a equipa tinha finalmente posto o RDS sob controlo. Standby Multi-AZ, backups automatizados, uma réplica de leitura a tratar das consultas de relatórios. O problema do DBA — aquele que costumava acordar Leo à noite — estava resolvido. A camada de base de dados gerida estava estável. Mas estável não significava rápida, e rápida era agora o problema. A tabela de menus tinha começado a atingir limites que mais réplicas não conseguiam resolver. A forma dos próprios dados estava errada.*

---

**O Problema de Encaixar Tudo numa Tabela**

Aqui está a tensão central das bases de dados relacionais: elas foram concebidas para guardar dados *estruturados* em formas *fixas*.

Se cada item de menu tivesse os mesmos campos — nome, preço, descrição, categoria — o SQL seria perfeito. Teria uma tabela `menu_items` limpa, linhas para cada item, e consultas que fazem sentido.

Mas os menus reais não funcionam assim.

Um item pode ter um modificador de "nível de picante". Outro pode ter uma "escolha de proteína". Um terceiro pode ter combos aninhados — "peça a refeição familiar e recebe dois pratos principais, duas guarnições e uma bebida". A estrutura dos dados varia *por item*.

Em SQL, você tem duas opções:

**Opção 1**: Criar uma coluna para cada modificador possível. Isto produz uma tabela muito larga onde a maioria das colunas está vazia na maior parte do tempo.

**Opção 2**: Criar uma tabela separada de modificadores e fazer o join com a tabela de itens de menu. Isto funciona, mas menus complexos exigem múltiplos joins, e com cinquenta mil itens e alto volume de leitura, esses joins tornam-se caros.

"Há uma terceira opção", disse Priya, que tinha estado a ler documentação em silêncio num canto.

Ela abriu uma nova aba. "E se os dados não tivessem de encaixar numa tabela?"

**Uma Forma Diferente de Pensar sobre Dados**

As bases de dados relacionais guardam dados como linhas em tabelas. Cada linha deve estar em conformidade com o esquema da tabela. O esquema é acordado de antemão.

As bases de dados NoSQL guardam dados de forma diferente. Uma abordagem comum é o *modelo de documento*: cada registo é guardado como um documento autocontido (normalmente JSON), e os documentos na mesma coleção não têm de ter os mesmos campos.

Um item de menu num modelo de documento poderia parecer-se com isto:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Outro item poderia parecer-se com algo completamente diferente:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Formas diferentes. Mesma coleção. Sem problema.

"Então a base de dados é mais como um sistema de arquivo do que uma tabela", disse Maya.

"Exatamente", disse Priya. "Você pode colocar qualquer documento em qualquer gaveta. Não tem de cortar o documento para encaixar num tamanho fixo."

**Conheça o DynamoDB**

O Amazon DynamoDB é o serviço de base de dados NoSQL gerido da AWS. Ele guarda dados como itens (não linhas), e os itens são reunidos em tabelas (a nomenclatura é semelhante ao SQL, mas o comportamento é diferente).

Cada item numa tabela DynamoDB deve ter uma **chave primária**, que o identifica de forma única. Todo o resto é flexível.

A chave primária pode ter uma de duas formas:

**Apenas chave de partição**: Um único atributo que deve ser único em todos os itens.

**Chave de partição + chave de ordenação (chave primária composta)**: Dois atributos que *juntos* formam uma combinação única. Isto permite ter múltiplos itens com a mesma chave de partição, diferenciados pela sua chave de ordenação.

Para o menu da Nimbus:

- Chave de partição: `restaurantId`
- Chave de ordenação: `itemId`

Isto significa que você pode obter todos os itens de um restaurante específico de forma eficiente — o DynamoDB sabe exatamente em qual partição procurar.

"Por que razão se chama chave de partição?", perguntou Tom.

"E se alguém tentar invadir?", perguntou Priya. "Se a chave de partição for adivinhável, alguém poderia inundar uma partição com escritas e causar a condição de ponto quente intencionalmente?"

"Sim", disse Leo. "Isso é na verdade um vetor de negação de serviço para tabelas mal concebidas. O que é mais uma razão para escolher chaves de alta cardinalidade."

Priya anotou isso.

**Como o DynamoDB Guarda Dados Internamente**

O DynamoDB foi construído para escalar horizontalmente a tamanhos enormes. Ele consegue isto através do *particionamento* — os dados são divididos por muitas máquinas físicas com base na chave de partição.

Quando você escreve um item, o DynamoDB faz o hash do valor da chave de partição e usa esse hash para determinar qual partição física (e portanto qual servidor) guarda o item. Quando você lê um item, o DynamoDB faz o mesmo cálculo para encontrá-lo instantaneamente.

Pense nisso como um sistema postal. Se cada envelope tiver um código postal, o serviço postal não lê cada envelope para perceber onde pertence — ordena por código postal. O DynamoDB ordena por hash da chave de partição.

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Por que é que a escolha da chave de partição importa tanto? Não podemos simplesmente escolher qualquer coisa?"

Esta é a pergunta certa. A chave de partição é a decisão de design mais importante num esquema DynamoDB. Eis o porquê:

Se você escolher uma chave de partição com baixa cardinalidade — digamos, `available: true/false`, ou `category: "main/side/drink"` — a maior parte dos seus dados aterra nas mesmas poucas partições. O DynamoDB chama a isto uma "partição quente". Um servidor trata da maioria do tráfego. Ele fica sobrecarregado. O DynamoDB começa a limitar (throttle) os pedidos. Os utilizadores começam a ver erros.

- **Boa**: Alta cardinalidade, valores uniformemente distribuídos (`restaurantId` com muitos restaurantes)
- **Má**: Baixa cardinalidade (`true/false`, `category`) — a maior parte dos dados aterra em poucas partições, criando "pontos quentes"

"Então se eu usasse `available: true` como chave de partição", disse Leo devagar, "todos os itens disponíveis se acumulariam na mesma partição."

"E a sua base de dados derreteria na hora de pico do jantar", confirmou Priya.

Leo fechou o portátil devagar.

---

**O Incidente da Partição Quente**

Eles não teriam de imaginar. Meses depois — durante o segundo mês no DynamoDB, antes de terem realmente internalizado a regra — aprenderiam da forma difícil.

A equipa tinha lançado uma nova funcionalidade: um selo de "Itens em Destaque". Os restaurantes parceiros podiam marcar até cinco itens como destacados. A funcionalidade guardava um atributo `featured: true` em cada item.

Leo achou que seria útil consultar todos os itens destacados em todos os restaurantes — para um widget de "itens em tendência" na página inicial. Ele tinha criado um índice secundário para suportar essa consulta. O índice usava `featured` como sua chave de partição.

"Vai ficar tudo bem", tinha dito ele. "Quantos itens destacados pode haver?"

Cerca de mil e duzentos, espalhados por duzentos e quarenta restaurantes.

Mas o widget de "itens em tendência" carregava em todas as páginas. Cada carregamento de página desencadeava uma consulta contra o índice `featured`. Todos os mil e duzentos itens viviam em duas partições — `true` e `false`. A partição `true` levava todos os acessos.

Hora de pico do jantar de sexta-feira à noite. Oito mil utilizadores simultâneos. Todos a carregar a página inicial.

A taxa de erros do DynamoDB disparou para dezoito por cento. Alguns utilizadores ficaram com um widget de tendências vazio. Alguns ficaram com indicadores de carregamento a girar. Alguns ficaram com erros que borbulhavam até ao fluxo de pedidos.

Leo puxou as métricas. "A partição do índice está a ser limitada", disse ele. "Estamos a atingir o limite de throughput numa única partição."

"Como?", perguntou Priya.

"A chave `featured` só tem dois valores. Todos os mil e duzentos itens destacados vivem na mesma partição. Cada carregamento da página inicial atinge essa partição."

Eles desativaram o widget de tendências em três minutos. A taxa de erros caiu para zero.

"Então uma chave de partição de dois valores limitou-nos numa noite de sexta-feira", disse Tom.

"Sim", disse Leo.

"Quanto é que isso nos custou?"

"Cerca de quarenta minutos de experiência degradada para oito mil utilizadores", disse Priya. "Impacto na receita, provavelmente algumas centenas de pedidos."

Leo substituiu o índice por um design diferente: uma tabela DynamoDB dedicada chamada `featured_items` com `restaurantId` como chave de partição e um Lambda agendado — um pequeno bocado de código que a AWS roda por si (Capítulo 20) — que a atualizava a cada quinze minutos a partir da tabela principal. A consulta tornou-se um scan sobre uma tabela pequena e isolada, em vez de uma partição quente na tabela principal.

"Projete primeiro os seus padrões de acesso", disse Priya. "Depois escolha o seu modelo de dados."

"Eu sei", disse Leo. "Eu sei agora."

---

**Ler e Escrever em Escala**

O DynamoDB consegue lidar com milhões de pedidos por segundo. Mas precisa de saber quanta capacidade provisionar.

Existem dois modos de capacidade:

**Capacidade provisionada**: Você especifica quantas unidades de leitura e escrita quer. O DynamoDB reserva essa capacidade para si e limita o tráfego que a excede. Custo previsível, preço mais baixo por pedido.

As unidades têm definições precisas, e o exame espera que você as conheça: uma **Unidade de Capacidade de Leitura (RCU)** é uma leitura fortemente consistente por segundo de um item de até 4 KB — ou duas leituras eventualmente consistentes do mesmo tamanho. Uma **Unidade de Capacidade de Escrita (WCU)** é uma escrita por segundo de um item de até 1 KB. Itens maiores consomem proporcionalmente mais: ler um item de 12 KB de forma fortemente consistente custa 3 RCUs; escrever um item de 3 KB custa 3 WCUs.

**Capacidade sob demanda**: O DynamoDB escala automaticamente com o seu tráfego real. Sem planeamento de capacidade rotineiro necessário. Custo mais alto por pedido, e muito mais simples operacionalmente, embora picos repentinos muito além do padrão de tráfego recente de uma tabela ainda possam causar limitação se aumentarem demasiado depressa.

Para a Nimbus, o menu é lido muito mais frequentemente do que é escrito. Um cliente abre a aplicação, navega no menu — são muitas leituras. Um restaurante parceiro atualiza o seu menu duas vezes por semana — são escritas ocasionais.

"Sob demanda faz sentido por agora", disse Tom. "Ainda não conhecemos os nossos padrões de tráfego. Melhor pagar mais por pedido do que subprovisionar e ser limitado."

Sabedoria de infraestrutura relutante. Vinda de Tom. A equipa tinha oficialmente crescido.

"Quanto é que isso custa por mês?", perguntou Tom, abrindo a calculadora de preços.

"Com o nosso volume de leitura atual — cerca de quarenta mil leituras por dia — sob demanda fica em torno de doze dólares por mês", disse Leo. "Provisionada, se afinarmos bem, fica mais perto de quatro. Mas teríamos de definir a capacidade manualmente e arriscar limitação se adivinharmos errado."

Tom anotou ambos os números. Ele sempre anotava números.

**Consistência: Quão Frescos São os Seus Dados?**

O DynamoDB replica dados por múltiplas Zonas de Disponibilidade automaticamente. Isso é ótimo para durabilidade, mas também significa que você precisa de pensar com clareza sobre a consistência de leitura.

Quando você lê do DynamoDB, tem uma escolha:

**Leitura eventualmente consistente**: Este é o padrão. É mais barata, e o resultado pode brevemente estar atrasado em relação a uma escrita recentemente concluída.

**Leitura fortemente consistente**: Para leituras contra uma tabela ou índice secundário local, o DynamoDB pode retornar o valor confirmado mais recente de escritas anteriores bem-sucedidas. Isto custa mais capacidade de leitura e não está disponível para índices secundários globais.

Para dados de menu, a consistência eventual está bem. Um item de menu que está um milissegundo desatualizado não importa.

Para dados de confirmação de pedido — "este pedido foi feito?" — você ia querer consistência forte. O cliente não deve ver uma mensagem de "tente novamente" quando o seu pedido acabou de ser guardado.

"É como a diferença entre verificar o saldo bancário na aplicação versus ligar ao banco diretamente", disse Maya. "A aplicação pode estar trinta segundos atrás. A chamada telefónica está sempre atual."

Você pode estar a perguntar-se: se o DynamoDB replica por múltiplas AZs automaticamente, por que é que o modo de consistência importa de todo? Eis a resposta: a replicação leva uma quantidade de tempo pequena, mas não nula — milissegundos, normalmente. Uma leitura eventualmente consistente pode ser servida a partir de uma réplica que ainda não recebeu a última escrita. Uma leitura fortemente consistente contacta sempre a cópia primária dos dados. Para a maioria dos casos de uso (itens de menu, catálogos de produtos, perfis de utilizador) o atraso é impercetível. Para casos de uso onde a correção importa no momento da leitura (confirmação de pagamento, disponibilidade de inventário), você quer consistência forte.

**Índices Secundários: Consultar Além da Chave Primária**

E se você precisar de aceder aos dados de uma forma diferente da que a chave primária permite?

O DynamoDB suporta **índices secundários** — chaves alternativas que permitem consultar os mesmos dados usando atributos diferentes.

**Índice Secundário Local (LSI)**: Usa a mesma chave de partição da tabela, mas uma chave de ordenação diferente. Deve ser definido no momento da criação da tabela e não pode ser adicionado depois. Partilha a capacidade provisionada da tabela. Como os LSIs partilham a partição, suportam leituras fortemente consistentes.

**Índice Secundário Global (GSI)**: Um índice completamente separado com a sua própria chave de partição e chave de ordenação — diferentes da chave primária da tabela. Pode ser adicionado ou removido depois de a tabela existir, o que lhe dá flexibilidade. Tem as suas próprias definições de capacidade provisionada, separadas da tabela.

Para a Nimbus: se eles precisassem de consultar itens por faixa de preço, um GSI poderia suportar isso — mas com uma regra em mente: uma chave de partição só aceita comparações de *igualdade*, portanto `price` (sobre o qual você quer fazer intervalos) deve ser a **chave de ordenação**, com um atributo de agrupamento como categoria ou `cuisineType#region` como chave de partição do GSI. Esse é exatamente o índice construído no passo a passo abaixo.

Se você escolher um LSI, então obtém consistência forte e capacidade partilhada, mas fica preso a esse design no momento da criação da tabela; se você escolher um GSI, então obtém flexibilidade para adicioná-lo mais tarde e escalonamento independente, mas perde a capacidade de fazer leituras fortemente consistentes contra o índice.

---

**Um Passo a Passo de Consulta com GSI**

Priya percorreu um exemplo concreto. A Nimbus queria suportar uma funcionalidade de "navegar por culinária": mostrar todos os pratos disponíveis de um determinado tipo de culinária em todos os restaurantes parceiros.

A tabela principal tem `restaurantId` como chave de partição e `itemId` como chave de ordenação. Você não consegue consultar "todos os itens com cuisineType = Colombian" de forma eficiente — isso exigiria um scan por todas as partições.

Eles criaram um GSI:

- Chave de partição do GSI: `cuisineType#region` (ex.: "Colombian#NYC", "Mexican#Chicago")
- Chave de ordenação do GSI: `price`

O GSI duplica uma projeção de cada item — apenas os campos necessários para a página de navegação — no armazenamento do índice. Agora uma consulta contra o GSI com `cuisineType#region = "Colombian#NYC"` vai diretamente para essa partição do índice.

"Por que não usar apenas `cuisineType` sozinho?", perguntou Leo.

"Porque o cuisineType sozinho tem baixa cardinalidade", disse Priya. "Colombiana, Mexicana, Tailandesa — vinte valores no total. Partições quentes de novo. Anexar a região dá-nos Colombian#NYC, Colombian#Chicago, Colombian#LA. Mais partições, melhor distribuição."

"Isso parece um bocado improvisado."

"É um padrão padrão do DynamoDB. Chama-se sharding de chave de partição. Às vezes você tem de trabalhar com a ferramenta."

A consulta do GSI em código parecia-se com isto:

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Isso retornou todos os pratos colombianos em Nova Iorque com preço entre $10 e $25, ordenados por preço, em cerca de 4 milissegundos.

"Isso é mais rápido do que a antiga consulta SQL por um fator de mil", disse Leo.

"Porque está a tocar apenas numa partição de um índice", confirmou Priya. "Não a fazer scan de cada linha numa tabela com joins."

---

**DynamoDB Streams: Reagir a Mudanças**

"Já pensámos no que acontece quando um item de menu é atualizado?", perguntou Priya uma manhã. "Um restaurante parceiro muda um preço. Precisamos de atualizar o índice de pesquisa. Precisamos de invalidar a entrada do ElastiCache" — o serviço de cache que vamos conhecer no próximo capítulo — "e precisamos de registar a mudança para o nosso pipeline de analytics."

"Podíamos fazer tudo isso no handler da API", disse Leo. "Quando a escrita acontece, desencadear todas as atualizações a jusante."

"E se uma delas falhar?"

"Então... tentamos de novo."

"E se a instância EC2 cair depois da escrita mas antes das atualizações a jusante? Os dados ficam guardados, mas nada sabe da mudança."

Leo pensou nisso.

"Precisamos que a atualização seja garantida", disse ele. "Mesmo que o nosso código de aplicação falhe a meio."

É isto que o **DynamoDB Streams** resolve.

O DynamoDB Streams captura um log ordenado no tempo de cada modificação de item numa tabela DynamoDB. Cada inserção, atualização e eliminação é escrita no stream como um evento. O stream retém os eventos durante 24 horas.

Você pode anexar uma função Lambda ao stream. Sempre que um item muda, a função Lambda é invocada com o estado antes-e-depois do item. O Lambda pode então:

- Atualizar um índice de pesquisa (OpenSearch)
- Invalidar uma entrada de cache no ElastiCache
- Enviar uma notificação para outro sistema
- Alimentar um pipeline de analytics
- Replicar a mudança para outra tabela ou base de dados

A diferença crítica: o Streams desacopla a escrita dos efeitos a jusante. A escrita no DynamoDB tem sucesso independentemente de o Lambda ter sucesso. Se o Lambda falhar, o DynamoDB tenta de novo. Se a aplicação cair depois da escrita, o evento do stream continua lá — o Lambda processá-lo-á quando as coisas recuperarem.

"Então escrevemos no DynamoDB", disse Leo devagar, "e o DynamoDB garante que o processamento a jusante acontece eventualmente, mesmo que caiamos."

"Exatamente", disse Priya. "É a diferença entre torcer para que todos os seus efeitos secundários rodem e ter a base de dados a garanti-los."

Para a Nimbus, eles ligaram o DynamoDB Streams na tabela de menus a um Lambda que invalidava entradas do ElastiCache quando itens de menu mudavam. A cache mantinha-se consistente com a base de dados, automaticamente, sem qualquer código de aplicação a gerir a invalidação.

"Quanto custa o Streams?", perguntou Tom.

"Você paga pela leitura a partir do stream — cada invocação do Lambda lê dele. Com o nosso volume, provavelmente dois a três dólares por mês."

Tom aprovou-o sem mais perguntas. Ele tinha aprendido quando dois dólares por mês valiam a pena.

**O Compromisso: O Que o DynamoDB Não Consegue Fazer**

NoSQL não é estritamente melhor do que SQL. É uma ferramenta diferente para um trabalho diferente.

O que o DynamoDB abdica:

**Consultas flexíveis**: Em SQL, você pode filtrar e ordenar por qualquer coluna. No DynamoDB, você só pode consultar eficientemente por chave primária. Consultar por campos arbitrários requer um *scan* (ler cada item na tabela), o que é caro e lento em escala.

**Joins**: O DynamoDB não faz joins. Se você precisar de dados de duas tabelas, faz duas leituras separadas no código da sua aplicação.

**Transações**: O DynamoDB suporta transações, mas as bases de dados relacionais ainda são o candidato natural mais adequado para muitos fluxos de trabalho multi-entidade, sistemas com muitos relatórios e designs com muitos joins.

**Familiaridade**: Décadas de ferramentas, competências e modelos mentais de SQL não se transferem diretamente.

Onde o DynamoDB se destaca:

- Padrões de acesso chave-valor e de documento
- Escala massiva (latência de milissegundos de um dígito a qualquer tamanho)
- Serverless, sem gestão de infraestrutura
- Escalonamento automático, replicação multi-AZ, backups
- Desempenho previsível independentemente do volume de dados

"Então a regra é", disse Maya, "usar DynamoDB quando você sabe *exatamente* como vai aceder aos dados. Usar SQL quando ainda não sabe."

Priya acenou. "Projete primeiro os seus padrões de acesso. Depois escolha a sua base de dados."

Esta é uma das coisas mais sénior que uma conversa sobre bases de dados pode produzir.

---

**Quando o DynamoDB É a Escolha Errada**

Tom, que tinha assumido o módulo de relatórios financeiros, tinha uma pergunta.

"Estamos a construir os relatórios financeiros", disse ele. "Resumos de receita mensal por restaurante, cálculos de impostos, histórico de faturas. Podemos pôr isso também no DynamoDB?"

A equipa olhou uns para os outros.

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya, antes que Priya pudesse.

Priya sorriu. Maya estava a apanhar o hábito.

"Explica-nos as consultas", disse Priya a Tom.

Ele abriu a especificação. "Precisamos de: receita total por restaurante, agrupada por semana. Itens de melhor desempenho por contagem de pedidos, em todos os restaurantes. Receita repartida por tipo de culinária. Valor médio de pedido por cidade. Comparação ano após ano para os relatórios dos parceiros."

Leo leu a lista. "Cada uma delas é uma agregação. Soma, agrupamento, média, comparação."

"O DynamoDB não tem funções de agregação", disse Priya. "Sem GROUP BY. Sem SUM. Sem AVG. Para responder a 'receita total por restaurante esta semana', você teria de fazer scan de cada pedido da semana, puxar tudo para a memória da aplicação e calculá-lo você mesmo."

"Isso parece mau", disse Tom.

"Na nossa escala, são dezenas de milhares de registos puxados para a memória a cada pedido de relatório. Seria lento e caro. E cada vez que adicionássemos um novo requisito de relatório, estaríamos a escrever novo código de scan-e-calcula."

"Então o que usamos?"

"Para relatórios financeiros? RDS. PostgreSQL com índices adequados. As consultas que você descreveu são exatamente para o que o SQL foi concebido. Seriam dez linhas de SQL. Seriam duzentas linhas de código de scan do DynamoDB."

O DynamoDB é errado quando:

- Você não conhece os seus padrões de acesso de antemão (relatórios são inerentemente exploratórios)
- Você precisa de agregações (SUM, GROUP BY, COUNT) em grandes conjuntos de dados
- Os seus dados têm relações complexas e você precisa de joins
- Você precisa de flexibilidade de consulta ad-hoc — para fazer perguntas em que ainda não pensou
- Os seus dados têm uma estrutura fundamentalmente relacional que não mapeia naturalmente para chave-valor

"Então a escolha não é 'tecnologia nova é melhor'", disse Maya.

"A escolha é 'que forma têm os seus dados, e como vai aceder a eles'", confirmou Priya. "O DynamoDB é genuinamente melhor para o menu. Seria genuinamente pior para os relatórios financeiros. As duas afirmações são verdadeiras ao mesmo tempo."

Tom construiu os relatórios financeiros em PostgreSQL. A primeira consulta GROUP BY que escreveu retornou em 80 milissegundos. Ele não teve de escrever uma única linha de código de scan.

---

**Quando Usar Cada Um**

| Situação                                              | Procure por             |
|-------------------------------------------------------|-------------------------|
| Dados estruturados, consultas complexas, relatórios   | RDS (PostgreSQL, MySQL) |
| Formas de dados flexíveis, acesso por chave, escala massiva | DynamoDB           |
| Intensivo em escritas com relações complexas          | RDS                     |
| Intensivo em leituras com padrões de acesso previsíveis | DynamoDB              |
| Você precisa de joins e agregados                     | RDS                     |
| Você precisa de latência de milissegundos a milhões de req/s | DynamoDB         |
| Transações em múltiplas entidades                     | RDS (normalmente)       |
| Serverless / picos de tráfego imprevisíveis           | DynamoDB sob demanda    |
| Relatórios financeiros, analytics ad-hoc              | RDS ou um data warehouse |
| Event sourcing, captura de mudanças, processamento em tempo real | DynamoDB + Streams |

A resposta errada é sempre "use sempre um ou o outro". A Nimbus acabou por usar ambos: RDS para histórico de pedidos e registos financeiros (estruturado, relacional, precisa de relatórios), DynamoDB para o menu (esquema flexível, alto volume de leitura, acesso por ID de restaurante).

## A Base de Dados Certa para a Carga de Trabalho Certa

Avance seis meses — bem depois de a migração para o DynamoDB ter assentado — e a Nimbus tinha três novos projetos no quadro. Maya percorreu-os com a equipa numa terça-feira de manhã.

"Primeiro: um motor de recomendações. Queremos mostrar aos clientes pratos que provavelmente vão pedir com base no seu histórico e no que pessoas com gostos semelhantes pediram. Segundo: estamos a mover os dados de menu para suportar conteúdo mais rico — documentos de menu completos em JSON, estrutura diferente por restaurante, esquema flexível. Terceiro: estamos prestes a fechar a aquisição da Barato, e a equipa de dados deles roda um cluster Cassandra para dados de comportamento de clientes. Eles querem trazê-lo para a AWS sem reescrever os seus pipelines."

Três projetos. Três requisitos de dados muito diferentes. Nenhum deles era um encaixe óbvio para o DynamoDB.

"Estes todos precisam de bases de dados diferentes", disse Priya.

"Temos o DynamoDB", disse Leo.

"Temos o direito de escolher a ferramenta certa", disse Priya.

**Amazon DocumentDB: Quando a Sua Carga de Trabalho Fala MongoDB**

O segundo projeto — documentos de menu JSON ricos com esquemas flexíveis por restaurante — descrevia uma base de dados de documentos. A Nimbus já estava a usar o esquema flexível do DynamoDB para o menu, mas à medida que a equipa construía funcionalidades de menu mais sofisticadas (modificadores aninhados, preços baseados no tempo, estruturas de combos complexas), o modelo de consulta do DynamoDB estava a mostrar os seus limites. A equipa queria consultas de documento mais ricas: encontrar todos os itens de menu onde um modificador aninhado contém uma opção específica, filtrar por campos arbitrários dentro da estrutura JSON.

"Isso é um padrão de base de dados de documentos", disse Priya. "MongoDB."

"Podíamos rodar MongoDB no EC2", ofereceu Leo.

"Ou podíamos usar o DocumentDB", disse Priya.

O **Amazon DocumentDB** é uma base de dados de documentos gerida compatível com MongoDB. Ele guarda dados como documentos do tipo JSON com esquemas flexíveis — documentos diferentes na mesma coleção podem ter campos diferentes. O DocumentDB suporta a linguagem de consulta, as APIs e os drivers do MongoDB. Se a sua carga de trabalho corre atualmente em MongoDB, o DocumentDB fala a mesma língua. O caminho de migração é mover uma string de conexão, não reescrever uma aplicação.

O DocumentDB é totalmente gerido: sem patches, backups automatizados, alta disponibilidade Multi-AZ, réplicas de leitura e armazenamento que cresce automaticamente à medida que os seus dados crescem.

"Então migramos o menu para o DocumentDB", disse Leo. "E as consultas que já temos em sintaxe MongoDB simplesmente funcionam?"

"Com testes de compatibilidade menores, sim", confirmou Priya. "O DocumentDB suporta a maior parte da API de consulta do MongoDB. Verifique a matriz de compatibilidade antes de assumir cobertura total, mas para consultas de documento e agregações, é direto."

O sinal de exame para o DocumentDB é simples: **"compatível com MongoDB"** ou **"document store"**. Se um cenário menciona MongoDB ou dados orientados a documentos, o DocumentDB é a resposta gerida da AWS.

**Amazon Neptune: Quando as Relações São os Dados**

O motor de recomendações era um problema mais difícil.

A pergunta não era "o que é que este cliente pediu?" — isso era uma simples consulta no DynamoDB. A pergunta era: "que clientes têm perfis de gosto semelhantes a este cliente, e que pratos é que esses clientes gostaram e que este cliente ainda não experimentou?"

Isso é um problema de grafos. O modelo de dados não é uma tabela de linhas nem uma coleção de documentos. É uma rede de relações: clientes ligados a pratos (pedidos, avaliados, vistos), pratos ligados a restaurantes e tipos de culinária, restaurantes ligados a bairros e cidades. A recomendação não está nos pontos de dados — está nos caminhos entre eles.

"Precisamos de uma base de dados de grafos", disse Priya.

O **Amazon Neptune** é uma base de dados de grafos totalmente gerida. Ele suporta dois modelos de grafo: **property graph** (consultado com a linguagem de travessia Gremlin) e **RDF** (consultado com SPARQL). Você escolhe com base na sua stack de grafos existente ou na preferência da equipa; ambos correm na mesma infraestrutura do Neptune.

As bases de dados de grafos são feitas de propósito para cargas de trabalho onde as relações entre pontos de dados são tão importantes como os próprios dados: redes sociais (quem está ligado a quem), motores de recomendação (de que gostaram utilizadores semelhantes), deteção de fraude (que transações partilham padrões suspeitos entre contas) e grafos de conhecimento (como os conceitos se relacionam).

Para o motor de recomendações da Nimbus: clientes e pratos tornaram-se nós no Neptune. Os eventos de pedido tornaram-se arestas. Uma travessia Gremlin podia encontrar, numa única consulta, todos os pratos que clientes com históricos de pedidos semelhantes tinham avaliado bem, ordenados pela força da ligação — sem as cadeias de JOIN complexas que seriam necessárias numa base de dados relacional nem as múltiplas consultas de ida-e-volta que seriam necessárias no DynamoDB.

O sinal de exame para o Neptune: **"rede social", "motor de recomendações", "grafo de conhecimento", "deteção de fraude"** ou **"travessia de grafo"**. Se um cenário descreve dados onde as conexões importam tanto como os próprios dados, o Neptune é a resposta.

**Amazon Keyspaces: Cassandra Sem as Operações**

A aquisição da Barato trouxe um cluster Cassandra para o cenário. O Cassandra é uma base de dados NoSQL wide-column — concebida para throughput de escrita muito elevado e escalabilidade horizontal, comumente usada para dados de séries temporais, logs de atividade de utilizadores e telemetria de IoT. A equipa de dados da Barato usava-o para rastrear o comportamento dos clientes: que itens foram vistos, quais foram adicionados ao carrinho, quais foram abandonados.

Migrar o Cassandra para a AWS tinha duas opções: rodá-lo no EC2 (sobrecarga operacional de gerir o cluster, atualizações, escalonamento) ou usar a opção gerida.

"Amazon Keyspaces", disse Priya.

O **Amazon Keyspaces** é uma base de dados gerida serverless e compatível com Cassandra. Ele suporta a Cassandra Query Language (CQL) — a mesma linguagem de consulta que os pipelines da Barato já estavam a usar. Tal como o DocumentDB para MongoDB, o Keyspaces é o caminho gerido: manter o código da aplicação como está, apontá-lo para um endpoint do Keyspaces em vez do cluster auto-gerido, e deixar a AWS tratar da infraestrutura.

O Keyspaces escala automaticamente com o tráfego, não requer planeamento de capacidade, e é serverless — você paga pelas leituras e escritas que realmente realiza. Para os dados de rastreamento de comportamento da Barato, este era o modelo certo: volume extremamente variável (hora de pico do jantar vs 3 da manhã), esquema wide-column, alto throughput de escrita.

O sinal de exame: **"compatível com Cassandra", "wide-column", "CQL"** ou **"carga de trabalho Cassandra"**.

**Escolher a Base de Dados Certa: Uma Tabela de Referência**

A esta altura da história, o panorama de bases de dados da Nimbus não se parecia em nada com o do capítulo sete. A ferramenta certa para cada carga de trabalho:

| Frase-Gatilho | Base de Dados |
|---|---|
| "Compatível com MongoDB" ou "document store" | DocumentDB |
| "Relações de grafo", "rede social", "motor de recomendações" | Neptune |
| "Compatível com Cassandra" ou "wide-column" | Keyspaces |
| "Chave-valor a qualquer escala", "latência de milissegundos de um dígito" | DynamoDB |
| "Relacional + serverless", "SQL com auto-escalonamento" | Aurora Serverless |
| "Dados estruturados, consultas complexas, relatórios" | RDS (PostgreSQL, MySQL) |

"Isto vai continuar a crescer?", perguntou Leo, olhando para a lista.

"Sim", disse Maya. "Porque problemas diferentes têm formas diferentes. E usar a forma errada custa-lhe desempenho, tempo de programação, ou ambos."

"A pergunta certa não é 'que base de dados devemos usar'", acrescentou Priya. "É 'que forma têm os nossos dados, e como vamos aceder a eles?' A base de dados decorre da resposta."

Foi a coisa mais importante que ela tinha dito sobre bases de dados em dois anos.

## Pontos Fortes e Limitações

**Por que o DynamoDB é poderoso**:

- Latência de milissegundos de um dígito a qualquer escala
- Totalmente gerido — sem patches, sem configuração de replicação, sem janelas de manutenção
- Replicação multi-AZ automática (durabilidade incorporada)
- O escalonamento sob demanda significa zero planeamento de capacidade
- Integração nativa com Lambda, API Gateway, Streams
- Recuperação para um ponto no tempo (semelhante aos backups automatizados do RDS)
- DynamoDB Streams — capture cada mudança como um evento (útil para processamento em tempo real)

**Onde o DynamoDB fica complicado**:

- O design dos padrões de acesso é inegociável — os erros são caros de desfazer
- Consultas complexas exigem índices secundários (acrescenta custo e complexidade)
- Os scans são caros — evite-os em produção
- O "limite de tamanho de item" é 400 KB — itens grandes precisam de armazenamento diferente
- Os preços podem surpreendê-lo se você não perceber os custos das unidades de leitura/escrita
- As partições quentes são assassinas silenciosas — sem erros até começar a limitação

## Resumo

O redesenho do esquema tinha levado dois dias e muito espaço de quadro branco. Escolher uma base de dados NoSQL não é apenas uma decisão técnica — muda totalmente a forma como você pensa sobre os dados. Mas o resultado foi uma tabela de menus que podia crescer a qualquer tamanho sem ficar mais lenta. Igualmente importante: a equipa aprendeu onde estão as bordas do DynamoDB, e a que bases de dados especializadas recorrer quando o problema muda de forma.

- O DynamoDB é o serviço de base de dados NoSQL gerido da AWS. Os itens são documentos flexíveis — sem esquema fixo. Cada item deve ter uma **chave primária**: uma chave de partição sozinha, ou uma chave de partição + chave de ordenação. Escolha a chave de partição para distribuição uniforme — partições quentes causam limitação.
- A capacidade **sob demanda** auto-escala; a capacidade **provisionada** é mais barata para tráfego previsível. As leituras **eventualmente consistentes** são mais baratas; as leituras **fortemente consistentes** estão sempre atuais mas indisponíveis em GSIs.
- O **DynamoDB Streams** captura mudanças ao nível do item em tempo real — use-o para conduzir invalidação de cache, atualizações de índices de pesquisa e pipelines de analytics.
- O DynamoDB é a escolha errada para relatórios, joins complexos e consultas ad-hoc — use RDS para isso.
- O **DocumentDB** (compatível com MongoDB), o **Neptune** (base de dados de grafos) e o **Keyspaces** (compatível com Cassandra) são alternativas geridas da AWS para cargas de trabalho que não encaixam no modelo chave-valor do DynamoDB.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- Conheça as regras da chave de partição: **alta cardinalidade, distribuição uniforme**. As partições quentes são uma armadilha comum no exame.
- **Sob demanda vs provisionado**: sob demanda para tráfego imprevisível; provisionado (com Auto Scaling) para cargas de trabalho previsíveis.
- **DynamoDB Streams**: captura mudanças ao nível do item em tempo real. Cenário comum no exame: "desencadear uma função Lambda quando um registo muda".
- **Tabelas Globais**: replicação multi-Região, multi-ativa para aplicações distribuídas globalmente e cenários de recuperação de desastres. No exame, este é um sinal forte quando a carga de trabalho precisa de leituras e escritas locais em mais de uma Região.
- **DynamoDB TTL (Time to Live)**: defina um atributo de timestamp de expiração nos itens e o DynamoDB elimina-os automaticamente após a expiração — a **custo zero**, sem consumir capacidade de escrita. Gatilho de exame: "dados de sessão/itens temporários devem ser removidos automaticamente após N horas ao menor custo" → TTL, nunca um scan agendado com Lambda. Itens expirados também podem fluir para o DynamoDB Streams para arquivo.
- **DAX (DynamoDB Accelerator)**: camada de cache em memória para DynamoDB. Reduz a latência de leitura de milissegundos para microssegundos. O exame usa-o quando as réplicas de leitura do RDS não ajudam (porque é uma cache específica do DynamoDB).
- **Chave primária composta**: chave de partição + chave de ordenação permite consultas flexíveis dentro de uma partição. Exemplo: obter todos os pedidos de um cliente entre duas datas — `customerId` é chave de partição, `orderDate` é chave de ordenação.
- **GSI vs LSI**: o GSI pode ser adicionado depois da criação da tabela; o LSI não. O LSI suporta leituras fortemente consistentes; o GSI não. O LSI partilha a capacidade da tabela; o GSI tem a sua própria.
- Saiba quando NÃO usar DynamoDB: joins complexos, relatórios ad-hoc, transações multi-entidade → RDS é normalmente a resposta.
- **Seleção de base de dados feita de propósito** — o exame frequentemente apresenta um cenário e pergunta qual base de dados encaixa. Use isto como referência rápida: "compatível com MongoDB" → DocumentDB. "Grafo/rede social/motor de recomendações/grafo de conhecimento" → Neptune. "Compatível com Cassandra/wide-column" → Keyspaces. "Chave-valor a qualquer escala/latência de milissegundos" → DynamoDB. "Relacional/consultas complexas/relatórios" → RDS ou Aurora.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre uma chave de partição e uma chave de ordenação. Quando usaria ambas?

*(Sugestão: Pense no menu da Nimbus — por que razão ter restaurantId como chave de partição e itemId como chave de ordenação torna eficiente obter o menu completo de um restaurante?)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de jogos global guarda perfis de jogadores no DynamoDB. Cada perfil inclui campos como nome de utilizador, nível, conquistas e inventário. Alguns jogadores têm 10 itens de inventário; outros têm algumas centenas — os perfis variam em forma mas cada um mantém-se confortavelmente abaixo do limite de tamanho de item de 400 KB do DynamoDB. A empresa precisa de latência de leitura de milissegundos de um dígito para pesquisas de perfil durante o jogo ativo.

Qual abordagem de design MELHOR suporta este requisito?

A) Usar DynamoDB com `playerId` como chave de partição e guardar o perfil completo como um único item  
B) Migrar para RDS Aurora com réplicas de leitura em cada região  
C) Usar DynamoDB com `level` como chave de partição para agrupar jogadores de habilidade semelhante  
D) Usar ElastiCache na frente do RDS para alcançar latência sub-milissegundo

**Sugestão 1**: O padrão de acesso é "procurar um jogador específico por ID". Que chave torna isso eficiente?

**Sugestão 2**: Uma opção cria uma partição quente terrível. Que atributo tem cardinalidade muito baixa?

**Sugestão 3**: O DynamoDB já entrega latência de milissegundos de um dígito nativamente.

**Resposta**: A

**Explicação**: Usar `playerId` como chave de partição distribui os dados uniformemente pelas partições e permite pesquisas instantâneas por ID de jogador — exatamente o padrão de acesso descrito. O modelo de documento flexível do DynamoDB lida com tamanhos de inventário variáveis sem alterações de esquema.

**Por que não B?** O RDS Aurora com réplicas de leitura acrescenta complexidade e ainda não é a primeira escolha natural para este tipo de pesquisa de perfil por chave em escala de jogo.

**Por que não C?** Usar `level` como chave de partição cria partições quentes severas — a maior parte do tráfego vai para o nível 1 (novos jogadores) ou nível máximo (veteranos ativos), deixando outras partições inativas.

**Por que não D?** A pergunta descreve DynamoDB, não RDS. Adicionar ElastiCache na frente do RDS introduz dois novos serviços quando o DynamoDB sozinho resolve o problema.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está a adicionar uma funcionalidade de "favoritos": os clientes podem guardar os seus itens de menu favoritos e voltar a pedi-los com um toque.

Projete a tabela DynamoDB para esta funcionalidade. Qual seria a chave de partição? Usaria uma chave de ordenação? Qual seria a estrutura do item?

Depois considere: o que acontece se você precisar de mostrar os "top 100 itens mais marcados como favoritos em todos os clientes"? O DynamoDB consegue responder a isso eficientemente? Se não, o que acrescentaria à arquitetura?

*(Não existe uma resposta única correta. O objetivo é praticar o design para padrões de acesso.)*

## Cena Pós-Créditos

"Eu já fiz o deploy — oh." Leo tinha rodado a migração do menu para o DynamoDB na quinta-feira à noite sem contar a ninguém. Funcionou. As leituras eram rápidas. O esquema era flexível. Os restaurantes parceiros podiam adicionar quaisquer campos de modificador que quisessem. Mas ele tinha-se esquecido de atualizar os painéis de monitorização, e Priya tinha passado vinte minutos na manhã de sexta-feira a perguntar-se por que é que as métricas da base de dados tinham ficado planas.

Ele estava a sentir-se bem consigo mesmo de qualquer forma.

Depois Priya, com os painéis restaurados, olhou para as métricas.

"Leo", disse ela, "cada carregamento de página está a fazer quarenta e sete pedidos DynamoDB."

"Um por restaurante mostrado", confirmou Leo. "A página de navegação carrega os quarenta e sete restaurantes mais próximos da localização do cliente."

"E cada um desses pedidos demora cerca de quatro milissegundos."

Leo fez as contas. Quarenta e sete vezes quatro. "Isso é... cento e oitenta e oito milissegundos só para o menu. Antes da renderização."

"Em cada carregamento de página."

"Para cada cliente."

Ele fixou o ecrã.

"Precisamos de uma cache", disse ele.

No próximo capítulo: a camada entre a aplicação da Nimbus e a sua base de dados que torna as consultas lentas rápidas.
