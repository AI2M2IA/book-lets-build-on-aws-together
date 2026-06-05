# Capítulo 9: Quando a Tabela Fica Grande

A tabela de menus tinha 50 000 itens.

Isso era em 287 restaurantes, cada um com especiais diários, itens sazonais e variações regionais.
Alguns itens tinham modificadores — tamanho, nível de picante, escolha de proteína. Alguns tinham
combos que referenciavam outros itens. Alguns apareciam no menu apenas nos dias de semana,
ou apenas durante o almoço, ou apenas em certas cidades.

A consulta SQL que obtinha o menu completo de um restaurante costumava devolver em 200 milissegundos.

Agora demorava quatro segundos.

Quatro segundos é a diferença entre alguém fazer uma encomenda e alguém fechar
a aplicação. Leo tinha corrido o plano de consulta. Tom tinha olhado para a configuração de índices. Priya
tinha aumentado a contagem de réplicas de leitura. Nenhuma delas tinha feito uma diferença significativa.

E isso mudou o ambiente na sala.

Quando um problema sobrevive a indexação, tentativas de cache e uma réplica extra, as pessoas param
de assumir que a solução vai ser inteligente.

Às vezes a solução é que a forma do sistema está errada.

"O problema," disse Leo, "é a forma dos dados. SQL quer tudo em linhas e
colunas. Os nossos menus não têm uma forma fixa."

Foi o início de uma conversa mais longa.

**O Problema de Encaixar Tudo numa Tabela**

Aqui está a tensão central das bases de dados relacionais: são concebidas para guardar dados *estruturados* em formas *fixas*.

Se cada item de menu tivesse os mesmos campos — nome, preço, descrição, categoria — o SQL seria perfeito. Teria uma tabela limpa de `menu_items`, linhas para cada item, e consultas que fazem sentido.

Mas os menus reais não funcionam assim.

Um item pode ter um modificador de "nível de picante". Outro pode ter uma "escolha de proteína". Um terceiro pode ter combos aninhados — "peça a refeição familiar e recebe dois pratos principais, duas guarnições e uma bebida." A estrutura dos dados varia *por item*.

Em SQL, tem duas opções:

**Opção 1**: Criar uma coluna para cada modificador possível. Isto produz uma tabela muito larga onde a maioria das colunas está vazia na maior parte do tempo.

**Opção 2**: Criar uma tabela separada de modificadores e juntá-la à tabela de itens de menu. Isto funciona, mas menus complexos requerem múltiplas junções, e com cinquenta mil itens e volume elevado de leitura, essas junções tornam-se caras.

"Há uma terceira opção," disse Priya, que tinha estado a ler documentação em silêncio num canto.

Abriu um novo separador. "E se os dados não tivessem de encaixar numa tabela?"

**Uma Forma Diferente de Pensar sobre Dados**

As bases de dados relacionais guardam dados como linhas em tabelas. Cada linha deve estar em conformidade com o esquema da tabela. O esquema é acordado antecipadamente.

As bases de dados NoSQL guardam dados de forma diferente. Uma abordagem comum é o *modelo de documento*: cada registo é guardado como um documento autónomo (normalmente JSON), e os documentos na mesma colecção não têm de ter os mesmos campos.

Um item de menu num modelo de documento poderia parecer assim:

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Arepa de Camarão",
  "price": 3200,
  "modifiers": [
    { "name": "Nível de Picante", "options": ["suave", "médio", "picante"] },
    { "name": "Proteína", "options": ["camarão", "peixe", "misto"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Outro item poderia parecer completamente diferente:

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Festa da Família",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Formas diferentes. Mesma colecção. Sem problema.

"Portanto a base de dados é mais como um sistema de arquivo do que uma tabela," disse Maya.

"Exactamente," disse Priya. "Pode colocar qualquer documento em qualquer gaveta. Não tem de cortar o documento para encaixar num tamanho fixo."

**Conheça o DynamoDB**

O Amazon DynamoDB é o serviço de base de dados NoSQL gerido da AWS. Guarda dados como itens (não linhas), e os itens são colectados em tabelas (a nomenclatura é semelhante ao SQL, mas o comportamento é diferente).

Cada item numa tabela DynamoDB deve ter uma **chave primária**, que o identifica de forma única. Todo o resto é flexível.

A chave primária pode ter uma de duas formas:

**Apenas chave de partição**: Um único atributo que deve ser único em todos os itens.

**Chave de partição + chave de ordenação (chave primária composta)**: Dois atributos que *juntos* formam uma combinação única. Isto permite ter múltiplos itens com a mesma chave de partição, diferenciados pela chave de ordenação.

Para o menu da Nimbus:

- Chave de partição: `restaurantId`
- Chave de ordenação: `itemId`

Isto significa que pode obter todos os itens de um restaurante específico eficientemente — o DynamoDB sabe exactamente em qual partição procurar.

"Por que razão se chama chave de partição?" perguntou Tom.

**Como o DynamoDB Guarda Dados Internamente**

O DynamoDB é construído para escalar horizontalmente para tamanhos enormes. Consegue isto através de *particionamento* — os dados são divididos por muitas máquinas físicas com base na chave de partição.

Quando escreve um item, o DynamoDB faz o hash do valor da chave de partição e usa esse hash para determinar qual partição física (e portanto qual servidor) guarda o item. Quando lê um item, o DynamoDB faz o mesmo cálculo para encontrá-lo instantaneamente.

Pense nisso como um sistema postal. Se cada envelope tiver um código postal, o serviço postal não lê cada envelope para perceber onde pertence — ordena por código postal. O DynamoDB ordena por hash de chave de partição.

É por isso que escolher uma boa chave de partição importa:

- **Boa**: Alta cardinalidade, valores uniformemente distribuídos (`restaurantId` com muitos restaurantes)
- **Má**: Baixa cardinalidade (`verdadeiro/falso`, `categoria`) — a maioria dos dados aterra em poucas partições, criando "pontos quentes"

Um ponto quente significa que uma partição fica com a maior parte do tráfego. Essa partição torna-se o gargalo. O DynamoDB começa a limitar pedidos. Os utilizadores começam a ver erros.

"Portanto, se eu usasse `available: true` como chave de partição," disse Leo devagar, "todos os itens disponíveis se acumulariam na mesma partição."

"E a sua base de dados derreteria na hora do jantar," confirmou Priya.

Leo fechou o portátil devagar.

**Ler e Escrever em Escala**

O DynamoDB pode lidar com milhões de pedidos por segundo. Mas precisa de saber quanta capacidade provisionar.

Existem dois modos de capacidade:

**Capacidade provisionada**: Especifica quantas unidades de leitura e escrita quer. O DynamoDB reserva essa capacidade para si e limita o tráfego que a excede. Custo previsível, preço mais baixo por pedido.

**Capacidade a pedido**: O DynamoDB escala automaticamente com o seu tráfego real. Sem planeamento de capacidade rotineiro necessário. Custo mais alto por pedido, e muito mais simples operacionalmente, embora picos repentinos muito além do padrão de tráfego recente de uma tabela ainda possam causar limitação se aumentarem demasiado depressa.

Para Nimbus, o menu é lido muito mais frequentemente do que é escrito. Um cliente abre a aplicação, navega no menu — são muitas leituras. Um parceiro de restaurante actualiza o menu duas vezes por semana — são escritas ocasionais.

"A pedido faz sentido por agora," disse Tom. "Ainda não conhecemos os nossos padrões de tráfego. Melhor pagar mais por pedido do que subaprovisionar e ser limitado."

Sabedoria de infraestrutura relutante. De Tom. A equipa tinha oficialmente crescido.

**Consistência: Quão Frescos São os Seus Dados?**

O DynamoDB replica dados por múltiplas Zonas de Disponibilidade automaticamente. Isso é óptimo para durabilidade, mas também significa que precisa de pensar claramente sobre consistência de leitura.

Quando lê do DynamoDB, tem uma escolha:

**Leitura eventualmente consistente**: Este é o padrão. É mais barato, e o resultado pode brevemente estar atrás de uma escrita recentemente concluída.

**Leitura fortemente consistente**: Para leituras contra uma tabela ou índice secundário local, o DynamoDB pode devolver o valor confirmado mais recente de escritas anteriores bem-sucedidas. Isto custa mais capacidade de leitura e não está disponível para índices secundários globais.

Para dados de menu, a consistência eventual está bem. Um item de menu que está um milissegundo desactualizado não importa.

Para dados de confirmação de encomenda — "esta encomenda foi feita?" — queria consistência forte. O cliente não deve ver uma mensagem "tente novamente" quando a sua encomenda acabou de ser guardada.

"É como a diferença entre verificar o saldo bancário na aplicação versus ligar ao banco directamente," disse Maya. "A aplicação pode estar trinta segundos atrás. A chamada telefónica está sempre actual."

**O Compromisso: O Que o DynamoDB Não Consegue Fazer**

NoSQL não é estritamente melhor do que SQL. É uma ferramenta diferente para um trabalho diferente.

O que o DynamoDB abandona:

**Consultas flexíveis**: Em SQL, pode filtrar e ordenar por qualquer coluna. No DynamoDB, só pode consultar eficientemente por chave primária. Consultar por campos arbitrários requer um *scan* (ler cada item na tabela), que é caro e lento em escala.

**Junções**: O DynamoDB não faz junções. Se precisar de dados de duas tabelas, faz duas leituras separadas no código da sua aplicação.

**Transacções**: O DynamoDB suporta transacções, mas as bases de dados relacionais ainda são o melhor candidato natural para muitos fluxos de trabalho multi-entidade, sistemas com muitos relatórios e designs com muitas junções.

**Familiaridade**: Décadas de ferramentas, competências e modelos mentais SQL não se transferem directamente.

O que o DynamoDB excele:

- Acesso a valores-chave e documentos
- Escala massiva (latência de milissegundos de um dígito a qualquer tamanho)
- Serverless, sem gestão de infraestrutura
- Escalonamento automático, replicação multi-AZ, cópias de segurança
- Desempenho previsível independentemente do volume de dados

"Portanto a regra é," disse Maya, "usar DynamoDB quando sabe *exactamente* como vai aceder aos dados. Usar SQL quando ainda não sabe."

Priya acenou. "Projecte primeiro os seus padrões de acesso. Depois escolha a sua base de dados."

Esta é uma das coisas mais sénior que uma conversa de base de dados pode produzir.

**Quando Usar Cada Um**

| Situação                                                | Use                     |
|---------------------------------------------------------|-------------------------|
| Dados estruturados, consultas complexas, relatórios     | RDS (PostgreSQL, MySQL) |
| Formas de dados flexíveis, acesso por chave, escala massiva | DynamoDB             |
| Intensivo em escritas com relações complexas            | RDS                     |
| Intensivo em leituras com padrões de acesso previsíveis | DynamoDB                |
| Precisa de junções e agregados                          | RDS                     |
| Precisa de latência de milissegundos a milhões de req/s | DynamoDB                |
| Transacções em múltiplas entidades                      | RDS (normalmente)       |
| Serverless / picos de tráfego imprevisíveis             | DynamoDB a pedido       |

A resposta errada é sempre "usar sempre um ou o outro." Nimbus acabou por usar ambos: RDS para histórico de encomendas e registos financeiros (estruturado, relacional, precisa de relatórios), DynamoDB para o menu (esquema flexível, alto volume de leitura, acesso por ID de restaurante).

## Pontos Fortes e Limitações

**Por que razão DynamoDB é poderoso**:

- Latência de milissegundos de um dígito a qualquer escala
- Totalmente gerido — sem patches, sem configuração de replicação, sem janelas de manutenção
- Replicação multi-AZ automática (durabilidade incorporada)
- O escalonamento a pedido significa zero planeamento de capacidade
- Integração nativa com Lambda, API Gateway, Streams
- Recuperação para um ponto no tempo (semelhante às cópias de segurança automatizadas RDS)
- DynamoDB Streams — captura cada alteração como um evento (útil para processamento em tempo real)

**Onde o DynamoDB fica complicado**:

- O design de padrões de acesso é inegociável — os erros são caros de desfazer
- Consultas complexas requerem índices secundários (acrescenta custo e complexidade)
- Os scans são caros — evite-os em produção
- O "limite de tamanho de item" é 400 KB — itens grandes precisam de armazenamento diferente
- Os preços podem surpreendê-lo se não perceber os custos de unidade de leitura/escrita

## Resumo

- O DynamoDB é o serviço de base de dados NoSQL gerido da AWS.
- Os itens são guardados como documentos flexíveis — sem esquema fixo necessário.
- Cada item deve ter uma **chave primária**: uma chave de partição isolada, ou uma chave de partição + chave de ordenação.
- A chave de partição determina qual partição física guarda o item. Escolha-a para distribuição uniforme.
- A capacidade **a pedido** escala automaticamente; a capacidade **provisionada** é mais barata se o seu tráfego for previsível.
- As leituras **eventualmente consistentes** são mais baratas e rápidas. As leituras **fortemente consistentes** estão sempre actuais.
- O DynamoDB excele no acesso por chave em escala massiva. Tem dificuldades com consultas ad-hoc e junções.
- Use RDS para dados relacionais. Use DynamoDB para dados de documentos/valores-chave. Use ambos quando a situação o exigir.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho (Domínio 3, Tarefa 3.3)*

- Conheça as regras da chave de partição: **alta cardinalidade, distribuição uniforme**. As partições quentes são uma armadilha comum no exame.
- **A pedido vs provisionado**: a pedido para tráfego imprevisível; provisionado (com Auto Scaling) para cargas de trabalho previsíveis.
- **DynamoDB Streams**: captura alterações ao nível do item em tempo real. Cenário comum no exame: "desencadear uma função Lambda quando um registo muda".
- **Tabelas Globais**: replicação multi-Região e multi-activa para aplicações distribuídas globalmente e cenários de recuperação de desastres. No exame, este é um sinal forte quando a carga de trabalho precisa de leituras e escritas locais em mais de uma Região.
- **DAX (DynamoDB Accelerator)**: camada de cache em memória para DynamoDB. Reduz a latência de leitura de milissegundos para microsegundos. O exame usa-o quando as réplicas de leitura RDS não ajudam (porque é uma cache específica do DynamoDB).
- **Chave primária composta**: chave de partição + chave de ordenação permite consultas flexíveis dentro de uma partição. Exemplo: obter todas as encomendas de um cliente entre duas datas — `customerId` é chave de partição, `orderDate` é chave de ordenação.
- Saiba quando NÃO usar DynamoDB: junções complexas, relatórios ad-hoc, transacções multi-entidade → RDS é normalmente a resposta.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre uma chave de partição e uma chave de ordenação. Quando usaria ambas?

*(Sugestão: Pense no menu Nimbus — por que razão ter restaurantId como chave de partição e itemId como chave de ordenação torna eficiente obter o menu completo de um restaurante?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de jogos global guarda perfis de jogadores no DynamoDB. Cada perfil inclui campos como nome de utilizador, nível, conquistas e inventário. Alguns jogadores têm 10 itens de inventário; outros têm 5 000 configurações personalizadas. A empresa precisa de latência de leitura de milissegundos de um dígito para pesquisas de perfil durante o jogo activo.

Qual abordagem de design MELHOR suporta este requisito?

A) Migrar para RDS Aurora com réplicas de leitura em cada região  
B) Usar DynamoDB com `playerId` como chave de partição e guardar o perfil completo como um único item  
C) Usar DynamoDB com `level` como chave de partição para agrupar jogadores de habilidade semelhante  
D) Usar ElastiCache na frente de RDS para alcançar latência sub-milissegundo

**Sugestão 1**: O padrão de acesso é "procurar um jogador específico por ID". Que chave torna isso eficiente?

**Sugestão 2**: Uma opção cria uma partição quente terrível. Que atributo tem cardinalidade muito baixa?

**Sugestão 3**: O DynamoDB já entrega latência de milissegundos de um dígito nativamente.

**Resposta**: B

**Explicação**: Usar `playerId` como chave de partição distribui os dados uniformemente pelas partições e permite pesquisas instantâneas por ID de jogador — exactamente o padrão de acesso descrito. O modelo de documento flexível do DynamoDB lida com tamanhos de inventário variáveis sem alterações de esquema.

**Por que não A?** O RDS Aurora com réplicas de leitura acrescenta complexidade e ainda não é a primeira escolha natural para este tipo de pesquisa de perfil por chave em escala de jogo.

**Por que não C?** Usar `level` como chave de partição cria partições quentes severas — a maior parte do tráfego vai para o nível 1 (novos jogadores) ou nível máximo (veteranos activos), deixando outras partições inactivas.

**Por que não D?** A pergunta descreve DynamoDB, não RDS. Adicionar ElastiCache à frente do RDS introduz dois novos serviços quando o DynamoDB sozinho resolve o problema.

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a adicionar uma funcionalidade de "favoritos": os clientes podem guardar os seus itens de menu favoritos e reencomendá-los com um toque.

Projecte a tabela DynamoDB para esta funcionalidade. Qual seria a chave de partição? Usaria uma chave de ordenação? Qual seria a estrutura do item?

Depois considere: o que acontece se precisar de mostrar os "top 100 itens mais marcados como favoritos em todos os clientes"? O DynamoDB consegue responder a isso eficientemente? Se não, o que acrescentaria à arquitectura?

*(Não existe uma resposta única correcta. O objectivo é praticar o design para padrões de acesso.)*

## Cena Pós-Créditos

Leo tinha migrado o menu para DynamoDB no final da semana. As leituras eram rápidas. O esquema era flexível. Os parceiros de restaurante podiam adicionar quaisquer campos de modificador que quisessem.

Sentia-se bem consigo mesmo.

Depois Priya olhou para o painel de monitorização.

"Leo," disse ela, "cada carregamento de página está a fazer quarenta e sete pedidos DynamoDB."

"Um por restaurante," confirmou Leo. "Porque o cliente está na página de navegar-todos."

"E cada um desses pedidos demora cerca de quatro milissegundos."

Leo fez as contas. Quarenta e sete vezes quatro. "Isso é... cento e oitenta e oito milissegundos só para o menu. Antes da renderização."

"Em cada carregamento de página."

"Para cada cliente."

Fixou o ecrã.

"Precisamos de uma cache," disse ele.

No próximo capítulo: a camada entre a aplicação e a base de dados de Nimbus que torna as consultas lentas rápidas.
