# Capítulo 13: Rápido em Todo o Lado

Uma foto a viajar de um servidor no Oregon para um telemóvel em Boston atravessa cerca de 4.100 quilómetros de cabo de fibra óptica. A dois terços da velocidade da luz, são cerca de 25 milissegundos de pura física — inevitável, inegociável, integrado nas leis do universo.

Depois some a viagem de regresso. Depois some o tempo de processamento. O browser ainda não começou a renderizar e já se passaram 80 milissegundos.

---

*`eatnimbus.com` estava ativo e o nome de domínio era real. Os utilizadores conseguiam encontrar a aplicação. Mas encontrá-la não era o mesmo que desfrutá-la. Tom andava a fazer medições de latência a partir de diferentes cidades, e os números da Costa Leste e da América do Sul não eram bons. O problema do nome de domínio estava resolvido. O problema da física não estava.*

---

`eatnimbus.com` estava ativo. Leo tinha verificado as métricas de latência de utilizadores da Costa Leste: 80 a 100 milissegundos por pedido. Pode parecer pequeno, mas acumula-se.

Carregar o menu: 90ms. Carregar a lista de restaurantes: 80ms. Carregar as fotos do restaurante: 200ms (as imagens são grandes). Tempo total antes de um utilizador poder fazer um pedido: mais de meio segundo numa boa conexão.

"A física é o problema", disse Leo. "Os servidores estão no Oregon. O crescimento está na Costa Leste — e em São Paulo."

"Então mova os servidores para a Costa Leste", disse Tom.

"Isso custa dinheiro."

"Quanto é que isso custa por mês?", perguntou Tom.

"Correr um duplicado completo da nossa infraestrutura em us-east-1? Provavelmente o triplo dos nossos custos atuais. E cria um problema completamente novo: manter a base de dados da Costa Oeste e a da Costa Leste em sincronismo."

Priya levantou os olhos do portátil. "Ou não movemos os servidores. Movemos o *conteúdo*."

Maya levantou os olhos. "Qual é a diferença? Se o conteúdo está num servidor, e o servidor está no Oregon, o conteúdo está no Oregon."

"A maior parte do que uma página entrega é estático", disse Priya. "Imagens, folhas de estilo, ficheiros JavaScript, fontes. Esses são os mesmos para cada utilizador. Não vêm da base de dados. Vivem no S3. E os objetos do S3 podem ser servidos de qualquer lugar."

"Então copiamo-los para servidores mais perto dos utilizadores?"

"Deixamos um serviço gerir isso por nós. Uma fonte de verdade. Cópias em todos os lugares onde são necessárias."

Tom já tinha aberto a página de preços. Estava a calcular antes de Priya acabar de explicar.

**A Analogia do Armazém Pré-Abastecido**

Imagine a Amazon retalhista, não a empresa de cloud. Têm um enorme armazém num único local com todos os produtos. Se enviassem cada pedido a partir desse único armazém, os clientes em cidades distantes esperariam dias.

Em vez disso, a Amazon tem centros de distribuição perto dos grandes centros populacionais. Quando um produto é popular, pré-abastecem esses armazéns locais. Quando um cliente em Seattle encomenda um livro, é enviado do centro de distribuição local — não do outro lado do país.

Esta é uma **Content Delivery Network (CDN)**: uma rede de servidores geograficamente distribuídos que guardam em cache cópias do seu conteúdo perto dos seus utilizadores.

Quando um utilizador em Boston pede a sua página inicial, a CDN serve-a a partir de um servidor em Boston. Não no Oregon. O pedido nunca atravessa o país.

**Conheça o CloudFront**

O Amazon CloudFront é a CDN da AWS. Opera através de uma rede global de **localizações de borda (edge locations)** — servidores de cache posicionados em cidades de todo o mundo. À data desta escrita, existem mais de 750 pontos de presença em mais de 100 cidades.

Quando você configura o CloudFront, especifica uma **origem**: a fonte do seu conteúdo real. A sua origem pode ser:

- Um bucket S3 (ficheiros estáticos: imagens, CSS, JavaScript, PDFs)
- Um Application Load Balancer (conteúdo dinâmico da sua aplicação)
- Uma instância EC2
- Um servidor HTTP em qualquer lugar na internet

O CloudFront fica à frente da sua origem. Os pedidos chegam à localização de borda mais próxima. Se a borda tem o conteúdo em cache, devolve-o imediatamente. Se não (uma *falha de cache*), vai buscá-lo à sua origem, guarda-o em cache e devolve-o.

**Como Funciona a Cache do CloudFront**

O primeiro pedido de qualquer conteúdo é sempre uma falha de cache — vai para a origem. Todos os pedidos subsequentes acertam na cache na localização de borda.

Para a Nimbus, as fotos de menus são candidatas perfeitas ao CloudFront. As fotos dos restaurantes mudam com pouca frequência (talvez quando o restaurante atualiza o seu perfil). Com o CloudFront:

1. Utilizador em Boston pede `images.eatnimbus.com/restaurant-047/photo.jpg`
2. O CloudFront verifica a localização de borda em Boston — ainda não em cache (falha de cache)
3. O CloudFront vai buscar ao S3 em us-west-2 (~80ms)
4. O CloudFront guarda a foto na localização de borda de Boston
5. Próximo utilizador em Boston pede a mesma foto
6. O CloudFront serve da cache de borda local (~5ms)

A mesma penalização de 80ms para o primeiro pedido. Mas o milésimo pedido da mesma cidade são 5 milissegundos.

Os cabeçalhos **Cache-Control** e as **definições de TTL** no CloudFront determinam quanto tempo o conteúdo fica em cache na borda. Os ficheiros de imagem podem ser guardados em cache durante horas ou dias. As páginas HTML (que mudam mais frequentemente) podem ser guardadas em cache durante minutos ou segundos.

Você pode estar a perguntar-se: por que não simplesmente alojar a aplicação inteira em múltiplas regiões em vez de usar uma CDN? Se os dados estão no Oregon, por que não pôr uma cópia completa em Nova Iorque, Tóquio e São Paulo? Você podia. Mas isso significa manter múltiplas bases de dados sincronizadas, gerir deploys por várias regiões em simultâneo, lidar com cenários de split-brain onde as regiões discordam. Uma CDN é uma resposta muito mais simples para conteúdo estático e semiestático: uma origem, muitas cópias em cache na borda. Você só acrescenta complexidade multi-região quando realmente precisa de operações de computação ou base de dados perto do utilizador — para a maioria do conteúdo, a cache de borda é suficiente.

"Espera — mas *por que* faríamos dessa forma?", perguntou Maya. "Por que pôr a cache na borda em vez de simplesmente adicionar um cluster ElastiCache maior no Oregon?"

"Porque a física continua a ser o problema", disse Priya. "Mesmo que o Oregon responda em um milissegundo, essa resposta ainda tem de viajar até Boston. O tempo de ida-e-volta é de 70 milissegundos no mínimo — a velocidade da luz não se importa com quão rápidos são os nossos servidores. A cache de borda move a resposta para mais perto da pergunta."

**Conteúdo Dinâmico: CloudFront para Mais do Que Cache**

"Mas e quanto às nossas respostas de API?", perguntou Leo. "Essas são dinâmicas — mudam por utilizador, por pedido. Você não consegue guardar em cache uma página de histórico de pedidos."

Verdade. Mas o CloudFront ainda ajuda com conteúdo dinâmico.

Mesmo quando o conteúdo não pode ser guardado em cache, o CloudFront encaminha o pedido da localização de borda para a origem através da rede de backbone privada da AWS — a fibra de alta velocidade que liga a infraestrutura AWS globalmente. Isto é mais rápido e mais fiável do que encaminhar pela internet pública, onde o tráfego pode saltar por múltiplos operadores.

O resultado: os pedidos dinâmicos ainda são 20 a 40% mais rápidos através do CloudFront do que ir diretamente à origem pela internet pública. Não por causa da cache, mas por causa do caminho de rede.

"Isso não bate certo", disse Maya. "Se a resposta da API ainda tem de viajar do Oregon para a borda e depois para Boston, como é que isso é mais rápido do que ir diretamente do Oregon para Boston?"

"Por duas razões", disse Priya. "Primeiro, o backbone privado da AWS é mais rápido e mais fiável do que a internet pública. O tráfego da internet pública encaminha através de múltiplos operadores, cada um a acrescentar a sua própria latência e variabilidade. O backbone é fibra direta de baixa latência. Segundo, a terminação SSL acontece na borda. O utilizador estabelece uma conexão TLS com a localização de borda do CloudFront mais próxima — o handshake é rápido. O CloudFront mantém depois uma conexão persistente e pré-estabelecida com a origem. Duas conexões de curta distância em vez de uma de longa distância."

"Então mesmo para conteúdo não em cache, o CloudFront corta tempo da sobrecarga da conexão", disse Leo.

"Normalmente dez a quarenta por cento. Não tão dramático como a cache. Mas real."

Adicionalmente, o CloudFront fornece:

**Terminação SSL/TLS**: O CloudFront trata de HTTPS na borda. A conexão entre o utilizador e o CloudFront é encriptada. O CloudFront pode ligar à sua origem por HTTP internamente (reduzindo a carga da origem) ou HTTPS (para encriptação de ponta a ponta).

**Proteção DDoS**: O CloudFront está integrado com o AWS Shield Standard. O tráfego distribuído por centenas de localizações de borda significa que os ataques são absorvidos na borda em vez de martelar a sua origem.

**Restrição geográfica**: Bloqueie o acesso de países específicos. Se a Nimbus só estiver licenciada para operar em certos mercados, o CloudFront pode impor isso na borda sem o pedido alguma vez chegar aos seus servidores.

**E se alguém tentar invadir através da CDN?**, perguntou Priya. "Envenenamento de cache — e se alguém conseguir injetar conteúdo mau na cache de borda?"

"O CloudFront tem controlos de chave de cache", disse Leo. "Você define exatamente quais atributos determinam se dois pedidos recebem a mesma resposta em cache. Cabeçalhos, query strings, cookies. Um atacante não consegue injetar uma resposta em cache diferente sem corresponder à chave de cache exata."

"E o Origin Access Control significa que o bucket S3 não servirá nada que não venha através do CloudFront", disse Priya. "Uma superfície de ataque em vez de duas."

**Comportamentos do CloudFront: Regras de Cache Refinadas**

Uma distribuição CloudFront pode ter múltiplos **comportamentos (behaviors)** — regras de encaminhamento baseadas em padrões de URL.

Para a Nimbus:

- `/images/*` → Guardar em cache na borda durante 7 dias (as fotos não mudam frequentemente)
- `/static/*` → Guardar em cache na borda durante 30 dias (CSS e JavaScript com nomes de ficheiro versionados)
- `/api/*` → Não guardar em cache; encaminhar diretamente para o balanceador de carga
- `/*` → Guardar em cache durante 5 minutos (páginas HTML)

Isto permite ao CloudFront ser inteligente: guardar em cache agressivamente o que é estável, deixar passar o que é dinâmico.

Os comportamentos são correspondidos do mais específico para o menos específico. `/images/hero.jpg` corresponde a `/images/*` antes de corresponder a `/*`. O catch-all `/*` no fundo é o padrão — aplica-se a qualquer coisa que não corresponda a um padrão mais específico.

"E se quisermos cache diferente para utilizadores autenticados vs não autenticados?", perguntou Priya. "O mesmo URL pode devolver conteúdo diferente dependendo de o utilizador estar autenticado."

"Então você inclui o cookie de sessão na chave de cache", disse Leo. "Mas isso significa que cada utilizador autenticado recebe a sua própria entrada de cache. A sua taxa de acertos colapsa para conteúdo autenticado."

"É por isso que você separa o conteúdo autenticado do conteúdo público ao nível do URL", disse Priya. "Tudo o que requeira autenticação vai para `/app/*` e não é guardado em cache. O conteúdo público vai para `/browse/*` e é guardado em cache agressivamente. Uma fronteira clara."

A lição: o CloudFront funciona melhor quando a sua estrutura de URLs reflete a intenção de cache. Os URLs que apontam para dados totalmente públicos e estáticos devem parecer-se diferentes dos URLs que devolvem dados personalizados e dinâmicos. Se se parecerem iguais para o CloudFront, ou a cache está partida ou o conteúdo errado é servido.

Leo reestruturou o esquema de URLs da Nimbus durante um fim de semana. Os endpoints de navegação passaram para `/browse/`. Os endpoints de API passaram para `/api/`. A UI autenticada da aplicação passou para `/app/`. Três comportamentos, três políticas de cache claras, zero ambiguidade.

"É um bocado de refactoring", disse ele.

"É a estrutura certa", disse Priya. "Você teria precisado dela eventualmente."

**Origin Access Control: Proteger o S3 com CloudFront**

Se o seu bucket S3 contém conteúdo privado que deve ser servido apenas através do CloudFront (não diretamente), você pode usar o **Origin Access Control (OAC)** para garantir que o S3 rejeita pedidos que não venham do CloudFront.

Desta forma:

- `d1234abcd.cloudfront.net/image.jpg` → Servido (o CloudFront tem permissão)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Bloqueado (acesso direto ao S3 negado)

O seu conteúdo só é alcançável através da sua distribuição, com as suas regras de cache e definições de segurança aplicadas.

---

**O Incidente da Foto Desatualizada**

O Restaurante 112 — o sítio colombiano no Eastside — enviou um e-mail ao suporte numa quinta-feira de manhã. Um cliente tinha-se queixado de que a foto principal do restaurante ainda mostrava a fachada antiga, embora o dono tivesse carregado uma nova há dois dias.

Leo abriu as definições da distribuição CloudFront.

O comportamento para `/images/*` tinha um TTL de sete dias. O portal de parceiros de restaurante tinha carregado uma nova foto há dois dias, substituindo o ficheiro no mesmo caminho de chave do S3: `restaurant-112/hero.jpg`. O ficheiro antigo tinha desaparecido do S3. Mas o CloudFront ainda o estava a servir da cache em cada localização de borda que o tinha ido buscar nos últimos sete dias.

"Mudámos o conteúdo na origem", disse Leo. "Mas o CloudFront não sabe disso. Tem uma cópia em cache e não vai verificar durante sete dias."

"Eu já fiz o deploy — oh." Ele tinha assumido que substituir o ficheiro do S3 atualizaria automaticamente a cache do CloudFront. Não atualiza. O CloudFront não tem mecanismo para detetar que o conteúdo numa chave do S3 mudou — ele simplesmente serve o que tiver em cache até o TTL expirar.

Duas opções:

**Opção um: Invalidação.** Envie ao CloudFront um pedido de invalidação para `/images/restaurant-112/hero.jpg`. O CloudFront marca esse caminho como desatualizado em todas as localizações de borda. O próximo pedido para esse caminho vai buscar conteúdo fresco ao S3. Custo: os primeiros 1.000 caminhos de invalidação por mês são gratuitos; para além disso, $0,005 *por caminho*. Para um ficheiro, gratuito. Para invalidar milhares de ficheiros durante uma atualização em massa, os custos acumulam-se.

**Opção dois: Nomes de ficheiro versionados.** Em vez de `hero.jpg`, nomeie o ficheiro `hero-v2.jpg`. Atualize a referência na base de dados. O CloudFront não tem entrada em cache para `hero-v2.jpg` — o primeiro pedido vai buscá-lo ao S3, e os utilizadores veem-no imediatamente. O antigo `hero.jpg` permanece em cache mas já não é referenciado em lado nenhum. Expira naturalmente após sete dias.

"Para conteúdo carregado pelo utilizador", disse Priya, "os nomes versionados são o padrão certo. Adicione um hash ou timestamp ao nome do ficheiro. Cada novo carregamento é uma nova entrada de cache. Sem custo de invalidação, sem conteúdo desatualizado."

Leo atualizou o portal de parceiros. Os novos carregamentos seriam agora guardados como `hero-{timestamp}.jpg`. O registo da base de dados foi atualizado com o novo caminho. O caminho antigo em cache era irrelevante.

"E quanto ao caso do deploy?", perguntou Maya. "Quando enviamos uma nova versão da aplicação e o JavaScript muda?"

"Mesmo princípio", disse Priya. "Ferramentas de build como o Webpack produzem nomes de ficheiro com hash: `app.a3b9c2d4.js`. Faça deploy de uma nova versão e o hash muda: `app.f7e1b3c5.js`. O CloudFront serve ambos da cache — os utilizadores antigos recebem o ficheiro antigo, os novos utilizadores recebem o ficheiro novo. Sem invalidação, sem problema de coordenação."

"A página HTML referencia o hash atual", disse Leo. "Por isso os novos utilizadores recebem o novo HTML com o novo hash do JS, e a CDN serve o ficheiro certo."

"Prática padrão", confirmou Priya.

---

**Latência com Números Reais**

Tom andava a fazer medições de latência a partir de três cidades.

| Localização | Sem CloudFront | Com CloudFront | Melhoria |
|---|---|---|---|
| Seattle | 15ms | 12ms | 20% |
| Nova Iorque | 80ms | 10ms | 88% |
| São Paulo | 290ms | 35ms | 88% |
| Tóquio | 260ms | 28ms | 89% |

"A melhoria é maior onde o problema da física é pior", observou Tom. "São Paulo ao Oregon são mais de duzentos milissegundos. Isso é mais de um quarto de segundo, só para começar a conversa."

"E o conteúdo nunca chega a São Paulo da segunda vez", disse Leo. "O primeiro utilizador em São Paulo vai buscar ao Oregon e guarda-o localmente em cache. Cada utilizador depois disso recebe trinta e cinco milissegundos."

"O primeiro utilizador em São Paulo come o custo", disse Tom. "Todos os outros beneficiam."

"É assim que as CDNs funcionam", disse Priya. "O primeiro pedido povoa a cache. Cada acerto de cache depois disso é quase gratuito."

A implicação para produtos globais é significativa. Sem o CloudFront, um utilizador em Tóquio à espera de 260 milissegundos pela sua imagem principal está à espera por causa da física — cabos de fibra óptica e a velocidade da luz. Com o CloudFront, você coloca uma cópia dessa imagem em Tóquio, e o problema da física essencialmente desaparece.

---

**Múltiplas Origens: ALB e S3 Juntos**

"Temos as nossas imagens no S3 e a nossa API no balanceador de carga", disse Maya. "Precisamos de duas distribuições CloudFront?"

"Não", disse Leo. "Uma distribuição, múltiplas origens."

Uma única distribuição CloudFront pode encaminhar diferentes padrões de URL para diferentes origens. Este é o padrão multi-origem:

```
eatnimbus.com/*         → Origem: ALB em us-west-2 (conteúdo dinâmico)
eatnimbus.com/images/*  → Origem: bucket S3 (imagens estáticas)
eatnimbus.com/static/*  → Origem: bucket S3 (CSS, JS, fontes)
```

O CloudFront avalia os comportamentos por ordem de especificidade. Um pedido a `/images/hero.jpg` corresponde ao comportamento `/images/*` e vai para o S3. Um pedido a `/api/orders` corresponde ao catch-all `/*` e vai para o ALB.

O benefício: um domínio, um certificado SSL, uma distribuição CloudFront, múltiplos backends. Os utilizadores veem um domínio unificado. O encaminhamento é invisível para eles.

Um detalhe operacional que também é um facto de exame garantido: esse certificado SSL vem do AWS Certificate Manager (ACM), e **um certificado usado pelo CloudFront tem de ser solicitado ou importado em `us-east-1`** — independentemente de onde as suas origens vivem. O CloudFront é um serviço global cujo control plane vive em us-east-1; um certificado que esteja em us-west-2 simplesmente não aparecerá no dropdown da distribuição. (Para serviços regionais como um ALB, o certificado vive na própria região do ALB.)

"E o ALB não é voltado para o público?", perguntou Priya.

"Só o CloudFront fala com o ALB", disse Leo. "Restringimos o grupo de segurança do ALB à prefix list gerida do CloudFront. As conexões diretas ao ALB a partir da internet são bloqueadas."

"Então a única forma de alcançar a aplicação é através do CloudFront."

"O que significa que as regras de WAF, a terminação SSL e a proteção DDoS se aplicam a todo o tráfego antes de chegar a nós."

---

**CloudFront Functions vs Lambda@Edge**

"Já pensámos no que faríamos se precisássemos de reescrever um URL na borda?", perguntou Priya. "Ou adicionar um cabeçalho de segurança a cada resposta?"

"Não podemos fazer isso na aplicação?", perguntou Leo.

"Podemos. Mas se acontecer na borda — antes de o CloudFront servir da cache — poupamos uma ida-e-volta à origem."

O CloudFront suporta dois mecanismos para correr código na borda:

As **CloudFront Functions** são funções JavaScript leves que correm em cada localização de borda. Executam em tempo sub-milissegundo, lidam com milhões de pedidos por segundo, e são projetadas para transformações simples: reescritas de URL, manipulação de cabeçalhos, normalização de query strings, redirecionamentos simples. Podem correr em pedidos de viewer e respostas de viewer (antes e depois da cache, da perspetiva do utilizador). Não podem fazer chamadas de rede. Custo: $0,10 por milhão de invocações.

O **Lambda@Edge** corre funções Lambda reais nas localizações de borda regionais do CloudFront (não em cada pop, mas em dezenas das principais globalmente). O Lambda@Edge pode fazer chamadas de rede, aceder a bases de dados, gerar respostas dinâmicas, fazer lógica de autenticação complexa. Corre em pedidos de viewer, pedidos de origem, respostas de origem e respostas de viewer — dando-lhe quatro pontos de intervenção no ciclo de vida do pedido. Custo: mais alto do que as CloudFront Functions, faturado por pedido e duração.

O modelo mental:

| Caso de uso | Ferramenta |
|---|---|
| Reescrever `/old-path` para `/new-path` | CloudFront Functions |
| Adicionar o cabeçalho `Strict-Transport-Security` | CloudFront Functions |
| Normalizar query strings antes da pesquisa de cache | CloudFront Functions |
| Teste A/B: atribuir um cookie de teste no pedido de viewer | CloudFront Functions |
| Teste A/B: encaminhar 10% dos utilizadores para uma origem diferente | Lambda@Edge (pedido de origem — as CloudFront Functions não podem mudar a origem) |
| Autenticar um token JWT (requer biblioteca de cripto) | Lambda@Edge |
| Buscar conteúdo personalizado de uma base de dados na borda | Lambda@Edge |
| Gerar uma miniatura de imagem sob demanda na borda | Lambda@Edge |

Para a Nimbus: eles usaram uma CloudFront Function para adicionar cabeçalhos de segurança a cada resposta — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Duas dezenas de linhas de JavaScript. Execução sub-milissegundo. Sem necessidade de ida-e-volta à origem.

"Demoraria mais tempo a explicar os cabeçalhos a um engenheiro júnior", disse Leo, "do que a escrever a função."

---

**Classes de Preço: Escolher Quais Localizações de Borda**

"Já pensámos no que isto custa em escala?", perguntou Tom, percorrendo a página de preços do CloudFront.

"Quanto é que isso custa por mês?" eram tecnicamente duas perguntas aqui. A primeira: o que é que o CloudFront cobra? A segunda: você precisa de cada localização de borda no mundo?

O preço de transferência de dados do CloudFront varia por região. O tráfego servido a partir de localizações de borda na América do Norte e na Europa é o mais barato. O tráfego da América do Sul, Ásia-Pacífico, Austrália e Índia é mais caro — porque a infraestrutura custa mais lá.

A AWS permite-lhe escolher uma **classe de preço** para a sua distribuição:

- **Price Class All**: Usa todas as localizações de borda globalmente. Melhor desempenho em todo o lado. Maior custo de transferência de dados para regiões fora da América do Norte e da Europa.
- **Price Class 200**: Usa a maioria das localizações de borda (América do Norte, Europa, Ásia, Médio Oriente, África). Exclui as localizações mais caras da América do Sul e algumas da Oceânia.
- **Price Class 100**: Usa apenas localizações de borda da América do Norte e da Europa. A mais barata. Os utilizadores em São Paulo, Tóquio e Sydney continuam a ser servidos — mas a partir de uma borda norte-americana ou europeia, não da mais próxima deles.

"Então se escolhermos a Price Class 100", disse Tom, "um utilizador em São Paulo é servido a partir de... Miami? Nova Iorque?"

"De onde quer que a borda incluída mais próxima esteja. Talvez 50 milissegundos em vez de 230 milissegundos direto ao Oregon", disse Priya. "Ainda uma melhoria significativa. Não tão boa como a Price Class All."

"E a diferença de custo?"

"A transferência de dados para fora da América do Sul custa cerca do dobro da América do Norte. Para uma startup ainda a construir tráfego, a Price Class 200 é um compromisso razoável — você obtém a Ásia e a Europa a um custo mais baixo do que a Price Class All, e a maioria dos seus utilizadores está coberta."

"Começa com a 200", disse Tom. "Quando tivermos dados de tráfego reais de cada região, decidimos se a All vale a pena."

A classe de preço certa depende de onde estão os seus utilizadores. Se você não tem utilizadores na América do Sul, pagar por localizações de borda sul-americanas é puro custo. Se vinte por cento da sua receita vem do Brasil, a melhoria de desempenho da Price Class All provavelmente paga-se a si mesma.

---

**Design da Chave de Cache**

"Já pensámos no que acontece quando dois utilizadores diferentes pedem o mesmo URL mas recebem conteúdo diferente?", perguntou Priya.

Leo pensou nisso. "Páginas personalizadas."

"Ou páginas específicas de idioma. Ou versões mobile versus desktop. Ou páginas que variam por cookie."

Por padrão, o CloudFront usa apenas o caminho do URL como chave de cache. Dois pedidos a `/browse` recebem a mesma resposta em cache, independentemente da preferência de idioma do utilizador, tipo de dispositivo ou cookie de sessão.

Se a sua aplicação serve conteúdo diferente com base em query strings, cabeçalhos ou cookies — e você quer que o CloudFront guarde essas variações separadamente — você precisa de incluir esses atributos na **chave de cache**.

Para a Nimbus:

- `/browse?city=miami` deve ser guardado em cache separadamente de `/browse?city=boston` — listas de restaurantes diferentes. Inclua as query strings na chave de cache.
- Os utilizadores mobile podem receber um layout diferente. Inclua um tipo de dispositivo normalizado (derivado do cabeçalho `User-Agent`) na chave de cache.
- O cabeçalho `Accept-Language` determina em que idioma a página é renderizada. Inclua-o na chave de cache.

Tenha cuidado, no entanto. Cada atributo de chave de cache que você adiciona cria mais variações de cache. Se você incluir toda a string `User-Agent` (que varia por versão de browser, versão de SO e nível de patch), efetivamente quebra a cache — cada utilizador tem um User-Agent ligeiramente diferente, por isso cada pedido é uma falha de cache.

A disciplina: normalizar antes de guardar em cache. Reduza "iPhone 15 Pro Safari 17.4.1" para "mobile". Reduza todos os idiomas aceites para os dois ou três que você de facto suporta. Inclua apenas o que genuinamente muda a resposta.

"Quanto mais específica a sua chave de cache", disse Leo, "pior a sua taxa de acertos."

"E quanto mais genérica", disse Priya, "mais provável é você servir o conteúdo errado ao utilizador errado."

"Então o design da chave de cache é o mesmo compromisso de tudo o resto na cache."

"Sim", disse Priya. "É sempre o mesmo compromisso."

---

## Quando o CloudFront Não É a Resposta: Global Accelerator

A aplicação mobile da Nimbus tinha uma funcionalidade que Tom andava a observar discretamente há dois meses: estado de pedido em tempo real. Quando um cliente fazia um pedido, a aplicação mantinha-se conectada via WebSocket e o ecrã de gestão de pedidos da cozinha atualizava em tempo real. Sem botão de refresh. Sem polling. Uma conexão ao vivo que enviava atualizações no instante em que uma cozinha marcava um item como pronto.

"Isto está a usar WebSockets", disse Tom, olhando para as métricas de latência uma manhã. "Dos utilizadores em São Paulo, o estabelecimento da conexão está a demorar 340 milissegundos. Algo está errado."

"O CloudFront não guarda em cache conexões WebSocket", disse Leo. "Faz proxy delas — passa-as para a origem. Nenhum benefício de cache."

"Certo. Então por que é que ainda está lento?"

"Porque o WebSocket ainda está a viajar de São Paulo para os nossos servidores no Oregon pela internet pública", disse Leo. "O CloudFront ajuda, porque termina o handshake TLS na borda e depois usa o backbone da AWS para a origem. Mas para uma conexão WebSocket persistente, isso continua a ser uma conexão de longa distância."

"Há um serviço exatamente para este problema", disse Priya.

O **AWS Global Accelerator** não é uma CDN. Não guarda nada em cache. Não serve conteúdo a partir de localizações de borda. O que faz é dar-lhe dois endereços IP Anycast estáticos que são anunciados globalmente a partir de todas as localizações de borda da AWS em simultâneo — e depois encaminhar o tráfego dos seus utilizadores pelo backbone privado da AWS em vez da internet pública.

Quando um cliente em São Paulo abre a aplicação da Nimbus, o seu dispositivo conecta-se à localização de borda da AWS mais próxima (que pode ser na própria São Paulo). A partir dessa localização de borda, o tráfego viaja para os servidores da Nimbus no Oregon pela rede de fibra privada, monitorizada e otimizada da AWS — não pela internet pública onde os pacotes saltam por operadores imprevisíveis e saltos de encaminhamento.

A internet pública não é projetada para latência. É projetada para resiliência — os pacotes podem tomar qualquer caminho disponível. O backbone da AWS é projetado de forma diferente: é direto, de baixa congestão, e sob o controlo operacional da AWS.

Tom mediu a diferença.

| Rota | Latência (São Paulo ao Oregon) |
|---|---|
| Internet pública | 340ms |
| Via Global Accelerator | 180ms |

Uma redução de 47%. Não da cache — de um melhor caminho de rede.

"Então por que é que não usaríamos simplesmente o CloudFront para tudo?", perguntou Maya. "O CloudFront já encaminha pelo backbone da AWS para conteúdo dinâmico."

"O CloudFront é apenas HTTP e HTTPS", disse Priya. "Os WebSockets funcionam com o CloudFront, mas apenas através de upgrade HTTP. E alguns dos nossos protocolos — os dados de sensores IoT, por exemplo — são puro TCP ou UDP. O CloudFront não trata desses. O Global Accelerator é agnóstico em relação ao protocolo. TCP, UDP, WebSockets, o que for. Move pacotes, não pedidos HTTP."

Havia outra diferença que Priya notou na sua documentação de segurança.

"O Global Accelerator dá-nos dois IPs Anycast estáticos", disse ela. "Esses IPs nunca mudam. Isso significa que podemos adicioná-los à nossa política de segurança, adicioná-los a whitelists de parceiros, adicioná-los a regras de firewall. Os endereços IP do CloudFront mudam ao longo do tempo — são geridos pela AWS e não são fixos."

"E quanto a failover?", perguntou Leo.

"Instantâneo", disse Priya. "Se a nossa aplicação em us-west-2 tiver um problema, o Global Accelerator pode deslocar o tráfego para um backup em us-east-1 em menos de 30 segundos — sem mudar o endereço IP a que os utilizadores se estão a conectar. O failover de DNS através do Route 53 demora 60 a 300 segundos dependendo do TTL. O Global Accelerator é mais rápido."

**CloudFront vs. Global Accelerator — o modelo mental:**

O CloudFront melhora a entrega através de cache. É construído para HTTP/HTTPS e o benefício é maior quando o conteúdo pode ser guardado em cache perto dos utilizadores — ficheiros estáticos, imagens, JavaScript. Quando o conteúdo não pode ser guardado em cache, o CloudFront ainda ajuda através do encaminhamento por backbone, mas a melhoria é menor.

O Global Accelerator melhora a entrega através de encaminhamento. Não move conteúdo. Não guarda nada em cache. O benefício aplica-se a cada pacote — em cache ou não, HTTP ou não, estático ou dinâmico. Os dois IPs estáticos funcionam globalmente. O failover é quase instantâneo. Os casos de uso onde o CloudFront não é suficiente — WebSockets em tempo real, protocolos baseados em UDP, tráfego não-HTTP, aplicações globais que requerem IPs fixos — são onde o Global Accelerator é a ferramenta certa.

Tom atualizou a aplicação mobile da Nimbus para se conectar ao endpoint do Global Accelerator para a funcionalidade de estado de pedido em tempo real. O estabelecimento de conexão WebSocket em São Paulo caiu de 340ms para 180ms. As atualizações da cozinha continuavam a parecer instantâneas — porque agora, para utilizadores fora da América do Norte, eram-no de facto.

## Pontos Fortes e Limitações

**Por que o CloudFront é poderoso**:

- Mais de 750 pontos de presença em mais de 100 cidades — a maioria dos utilizadores obtém conteúdo a menos de 20ms de distância
- Conteúdo estático servido em milissegundos de um dígito após a primeira cache
- Reduz significativamente a carga da origem (o tráfego repetido nunca atinge os seus servidores)
- Integrado com AWS Shield, WAF e Certificate Manager
- Sem necessidade de planeamento de capacidade — o CloudFront escala automaticamente
- As distribuições multi-origem encaminham diferentes caminhos para diferentes backends a partir de um domínio
- As CloudFront Functions tratam de lógica de borda leve com latência sub-milissegundo

**Onde fica complicado**:

- O conteúdo em cache pode ficar desatualizado — invalidar a cache custa dinheiro ($0,005 por caminho após os primeiros 1.000 caminhos gratuitos por mês). Use nomes de ficheiro versionados em vez disso.
- Os cabeçalhos Cache-Control têm de ser definidos corretamente na origem — os erros causam conteúdo desatualizado
- O conteúdo dinâmico beneficia da otimização de encaminhamento mas não da cache
- Depurar o comportamento da cache (o que está em cache onde, durante quanto tempo) requer perceber múltiplas camadas: cabeçalhos da origem, definições de TTL do CloudFront, regras de comportamento
- A transferência de dados para fora através do CloudFront custa dinheiro, embora menos do que a transferência de dados padrão
- O design da chave de cache requer pensamento cuidadoso — demasiado específico quebra a cache, demasiado genérico serve o conteúdo errado

## Resumo

O CloudFront não mudou a física. A luz ainda viaja à mesma velocidade. Mas mudou onde a resposta vivia — e para a maioria dos utilizadores, a resposta estava agora a alguns milissegundos de distância em vez de algumas centenas. Taxa de acertos de cache após o deploy: 83%. Isso significava que 830.000 de cada milhão de pedidos nunca chegavam de todo aos servidores de origem. Os utilizadores em São Paulo passaram de 290 milissegundos para 35 milissegundos. Os utilizadores em Tóquio de 260 para 28.

- Uma **CDN** guarda em cache cópias do seu conteúdo em localizações de borda perto dos seus utilizadores — reduzindo a latência e a carga da origem.
- O **CloudFront** é a CDN da AWS, com mais de 750 pontos de presença globalmente.
- As falhas de cache vão buscar à **origem** (S3, ALB, EC2). Os acertos de cache servem da borda — milissegundos, não centenas de milissegundos.
- Os **comportamentos** permitem-lhe definir diferentes regras de cache para diferentes padrões de URL. Uma distribuição pode servir `/images/*` a partir do S3 e `/*` a partir de um ALB.
- O conteúdo dinâmico não é guardado em cache, mas o CloudFront ainda melhora o desempenho através da rede de backbone privada da AWS.
- **Evite conteúdo desatualizado** usando nomes de ficheiro versionados (ex.: `hero-v2.jpg`) em vez de invalidações — mais barato e mais fiável.
- As **CloudFront Functions** tratam de lógica de borda leve (manipulação de cabeçalhos, reescritas de URL) a velocidade sub-milissegundo. O **Lambda@Edge** trata de processamento mais pesado que requer chamadas de rede.
- As **classes de preço** permitem-lhe controlar quais localizações de borda servem o seu tráfego — e portanto o seu custo de transferência de dados.
- O **design da chave de cache** determina quais atributos de pedido criam variações em cache separadas. Chaves mais específicas = taxa de acertos mais baixa. Menos específicas = risco de servir conteúdo errado.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.4)*

- **CloudFront + S3**: Padrão clássico de exame para servir websites estáticos globalmente. Bucket S3 como origem, CloudFront como CDN, Origin Access Control para evitar acesso direto ao S3.
- **Localizações de borda vs Regiões vs AZs**: As localizações de borda são mais numerosas e existem apenas para fins de cache/CDN. Não são o mesmo que AZs (que correm a sua computação).
- **Invalidação de cache**: Cria uma invalidação `/images/*` para forçar o CloudFront a ir buscar conteúdo fresco. Custa dinheiro — o exame pode pedir a alternativa mais eficiente em custo: URLs versionados (`image-v2.jpg` em vez de `image.jpg`), que naturalmente contornam a cache.
- **Controlo de TTL**: `Cache-Control: max-age=3600` na origem define um TTL de cache de 1 hora. O CloudFront honra estes cabeçalhos. O TTL mínimo, TTL máximo e TTL padrão também podem ser definidos no comportamento da distribuição.
- **CloudFront Functions vs Lambda@Edge**: As CloudFront Functions correm na borda para manipulação leve de pedidos/respostas (sub-milissegundo). O Lambda@Edge corre o seu código Lambda em localizações de borda regionais para processamento mais pesado. O exame distingue-os por complexidade do caso de uso. As CloudFront Functions não podem fazer chamadas de rede; o Lambda@Edge pode.
- **URLs assinados e Cookies assinados**: Controle quem pode aceder ao conteúdo através do CloudFront. Os URLs assinados dão acesso a ficheiros específicos; os cookies assinados dão acesso a múltiplos ficheiros. O exame usa-os para "conteúdo de subscritores pagantes".
- **Price Class**: O exame pode perguntar qual classe de preço escolher para uma audiência global vs. uma audiência da América do Norte/Europa. Price Class All = melhor desempenho, custo mais alto. Price Class 100 = apenas América do Norte e Europa, custo mais baixo.
- **Chave de cache**: A chave de cache padrão é o URL. Adicionar query strings, cabeçalhos ou cookies à chave de cache cria variações em cache separadas — mas aumenta a taxa de falhas de cache. O exame pode apresentar um cenário onde o conteúdo varia por um parâmetro de query e perguntar como configurar a cache.
- **Failover de origem**: O CloudFront suporta um grupo de origens com uma origem primária e uma secundária. Se a origem primária devolver um erro 5xx, o CloudFront tenta automaticamente de novo com a secundária. Diferente do failover do Route 53 — isto é dentro de uma única distribuição CloudFront.
- **Comportamentos multi-origem**: Uma única distribuição pode encaminhar `/images/*` para o S3 e `/*` para um ALB. O exame pode apresentar isto como "como servir conteúdo estático e dinâmico a partir de um domínio sem duas distribuições".
- **CloudFront vs. Global Accelerator:** CloudFront = CDN HTTP/HTTPS, guarda conteúdo em cache em localizações de borda, reduz a carga da origem, melhor para conteúdo estático e armazenável em cache. Global Accelerator = qualquer protocolo TCP/UDP, não guarda nada em cache, encaminha tráfego pelo backbone privado da AWS, fornece 2 IPs Anycast estáticos, suporta failover regional quase instantâneo. Gatilho de exame: "melhorar a latência para tráfego não-HTTP" ou "IP estático para uma aplicação global" ou "desempenho de WebSocket para utilizadores globais" ou "failover regional mais rápido do que DNS" → Global Accelerator. "Servir ficheiros estáticos globalmente com baixa latência" → CloudFront.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre um acerto de cache e uma falha de cache no CloudFront. O que acontece em cada caso?

*(Sugestão: Pense de onde vem o conteúdo, e como o tempo de resposta difere entre os dois casos.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de software distribui ficheiros de instalação grandes (~2GB cada) a partir de um bucket S3 para clientes em todo o mundo. As velocidades de download são lentas para clientes na Ásia. A equipa quer melhorar o desempenho sem replicar o bucket S3 para múltiplas regiões. Também precisam de garantir que apenas os clientes pagantes podem descarregar os instaladores.

Qual solução MELHOR satisfaz estes requisitos?

A) Ativar o S3 Transfer Acceleration no bucket e gerar URLs pré-assinados para clientes pagantes  
B) Usar CloudFront com o bucket S3 como origem, ativar Origin Access Control e usar URLs Assinados do CloudFront para clientes pagantes  
C) Criar um bucket S3 em cada região AWS e usar encaminhamento por geolocalização do Route 53 para dirigir os clientes ao bucket mais próximo  
D) Usar um Application Load Balancer em cada região com instâncias EC2 que servem os ficheiros de instalação

**Sugestão 1**: O requisito é melhorar o desempenho global *sem* replicar o bucket. Qual opção não requer múltiplos buckets?

**Sugestão 2**: Qual serviço controla especificamente quem pode aceder ao conteúdo servido através do CloudFront?

**Sugestão 3**: O S3 Transfer Acceleration é otimizado para carregamentos de longa distância *para* o S3. Para entregar conteúdo *do* S3 a utilizadores globais, o CloudFront é a ferramenta certa.

**Resposta**: B

**Explicação**: O CloudFront guarda em cache os ficheiros de instalação em localizações de borda globalmente após o primeiro download. Os downloads subsequentes da mesma região vêm da borda — muito mais rápido do que atravessar o Pacífico a partir do S3 em us-west-2. O Origin Access Control garante que o bucket S3 só é acessível através do CloudFront. Os URLs assinados restringem o acesso a clientes pagantes.

**Por que não A?** O S3 Transfer Acceleration é otimizado para carregamentos de longa distância *para dentro* do S3 — não para distribuir conteúdo *do* S3 a uma audiência global. Para isso, o CloudFront é a ferramenta correta. Os URLs pré-assinados controlam o acesso mas não melhoram o desempenho global.

**Por que não C?** Criar um bucket S3 por região funciona para desempenho, mas contradiz o requisito de evitar a replicação. Também requer uma estratégia de sincronização de dados entre buckets.

**Por que não D?** As instâncias EC2 atrás de um balanceador de carga em cada região são significativamente mais caras do que o CloudFront e requerem a gestão de servidores em múltiplas regiões.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.4*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus quer adicionar conteúdo de vídeo — vídeos tutoriais curtos de culinária de restaurantes parceiros. Os vídeos podem ter entre 50 e 500MB. Eles esperam que o mesmo vídeo seja visto por milhares de utilizadores na mesma cidade poucas horas após a publicação.

Projete a arquitetura de armazenamento e entrega. Usaria S3 e CloudFront? Como trataria do primeiro pedido (arranque a frio) para minimizar o atraso antes de o vídeo ser guardado em cache? Que TTL de cache definiria para um vídeo que não vai mudar após a publicação?

*(Não existe uma resposta única correta. O objetivo é praticar decisões de design de CDN.)*

## Cena Pós-Créditos

"Eu já fiz o deploy — oh." Leo tinha apontado a distribuição CloudFront para a origem errada — o bucket S3 de desenvolvimento em vez do de produção. Durante cerca de quatro minutos, alguns utilizadores da Costa Oeste tinham visto uma versão antiga da aplicação. Ele tinha corrigido as definições de origem, invalidado a cache e atualizado discretamente o log de incidentes.

Priya observou as métricas do CloudFront após o deploy.

Taxa de acertos de cache: 83%.

"O que significa isso?", perguntou Tom.

"Significa que 83% dos nossos utilizadores estão a obter conteúdo de uma localização de borda perto deles, não de us-west-2."

"E os outros 17%?"

"Pedidos pela primeira vez. Conteúdo que ainda não foi guardado em cache nessa localização de borda."

Tom fixou as métricas. "Então estamos a servir quase um milhão de pedidos por dia a partir de nós de borda do CloudFront. E apenas 170.000 desses atingem de facto os nossos servidores."

"Sim."

"Então se não tivéssemos o CloudFront, os nossos servidores estariam a lidar com um milhão de pedidos."

"A 140 a 160 milissegundos cada, para utilizadores globais."

Tom recostou-se. Tinha um ar que Maya reconhecia — o ar de alguém a recalcular o custo em tempo real.

"Vale a pena", disse ele.

Maya já estava no portátil. "Dois novos engenheiros juntam-se a nós na próxima semana. Soo-Jin, da equipa de plataforma na última empresa dela, e Rafael — especializou-se em segurança. Quero que sejam integrados no IAM antes do primeiro dia."

"IAM avançado?", perguntou Leo.

"Roles, políticas, acesso entre contas. O verdadeiro."

No próximo capítulo: as permissões refinadas que permitem a uma parte do sistema falar com outra — em segurança.
