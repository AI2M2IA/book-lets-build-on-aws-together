# Capítulo 2: Onde No Mundo Está o Seu Servidor?

Levante-se. Vá a uma janela, se houver uma por perto.

Olhe cá para fora. O que quer que veja — edifícios, árvores, um parque de estacionamento, o quintal de alguém —
nada disso é onde os seus dados vivem. Os seus dados vivem noutro sítio completamente. Provavelmente
nalgum lugar onde nunca esteve.

Isso não é um problema. Mas perceber *onde* faz com que um número surpreendente de coisas
faça sentido.

No último capítulo, Leo abriu uma conta AWS às 23h e lançou um servidor algures.
Algures sendo a palavra operativa — não tinha a certeza de que parte do mundo tinha
escolhido, porque não o tinha escolhido intencionalmente.

Na manhã seguinte, Maya reparou que o servidor estava em Singapura.

"Por que Singapura?" perguntou ela.

"Era o valor predefinido," disse Leo.

Tom levantou os olhos do café. "Quanto custa correr um servidor em Singapura quando
todos os nossos clientes estão na Costa Oeste?"

Leo não tinha resposta.

Priya já tinha: "É também mais lento. Cada pedido tem de viajar para metade do mundo
e voltar."

Este capítulo é sobre corrigir essa decisão — e perceber por que importa.

**O Problema com "Algures"**

Quando usa a AWS, não está a usar um centro de dados. Está a usar uma rede global deles.
A AWS tem infraestrutura em dezenas de países.

Isso é uma funcionalidade, não apenas um facto. Mas significa que tem de fazer uma escolha: *onde*
quer que a sua infraestrutura corra?

A escolha importa por três razões:

**Desempenho.** Quanto mais perto os seus servidores estiverem dos seus utilizadores, mais rápida a resposta.
A física é inegociável. Os dados viajam a cerca de dois terços da velocidade da luz
através de cabos de fibra óptica. Um pedido de Seattle para Singapura demora cerca de 300
milissegundos apenas em trânsito — antes de a sua aplicação fazer seja o que for.

**Conformidade.** Alguns sectores têm leis sobre onde os dados podem ser armazenados. Os dados de saúde norte-americanos podem
precisar de permanecer dentro do país. Os dados financeiros podem precisar de permanecer dentro de uma região específica.
Escolher a Região errada pode criar problemas legais.

**Resiliência a desastres.** Se um local tiver uma falha de energia, um terramoto ou uma falha de rede,
quer que o seu sistema sobreviva. Distribuir a infraestrutura por múltiplos
locais é como se protege contra desastres locais.

**Como a AWS Organiza a Sua Infraestrutura**

A AWS divide a sua infraestrutura global em três conceitos aninhados. Pense neles como
bonecas russas, da maior para a menor.

**Regiões → Zonas de Disponibilidade → Localizações de Borda**

Vamos abrir cada uma.

**Regiões: As Grandes Caixas**

Uma **Região** é uma área geográfica onde a AWS tem um conjunto de centros de dados. Cada Região
é nomeada pelo seu local: `us-west-2` é Oregon, `us-east-1` é o norte da Virgínia,
`eu-west-1` é a Irlanda, `ap-southeast-1` é Singapura — onde o servidor do Leo estava escondido.

Existem mais de 30 Regiões em todo o mundo, e a AWS adiciona mais regularmente.

Cada Região é completamente independente. Os dados em `us-west-2` ficam em `us-west-2` a não ser
que os mova explicitamente. Isto é crítico para conformidade e para resiliência — uma grande
paragem numa Região não afecta automaticamente as outras.

"Portanto devemos escolher `us-west-2` para Nimbus?" perguntou Tom.

Sim. Para um negócio americano a servir clientes da Costa Oeste, sim. Menor latência e as respostas chegam mais depressa aos seus utilizadores.

"Quanto mais caro é do que Singapura?" acrescentou Tom.

Os preços variam por Região — normalmente por algumas percentagens. O benefício de desempenho e conformidade da Região certa justifica a pequena diferença de preço.

**Zonas de Disponibilidade: A Redundância Real**

É aqui que fica interessante.

Cada Região não é um único centro de dados. É um conjunto de múltiplos centros de dados fisicamente separados
chamados **Zonas de Disponibilidade** (ou AZs).

Oregon (`us-west-2`) tem quatro Zonas de Disponibilidade: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Estes são edifícios reais, separados por distâncias significativas — suficientemente
afastados para que um incêndio, inundação ou falha de energia num deles não afecte os outros, mas suficientemente
próximos para que a rede entre eles seja extremamente rápida (latência de milissegundos de um dígito).

Esta é a arquitectura que torna a AWS fiável a um nível que nenhum centro de dados único consegue igualar.

Priya inclinou-se para a frente. "Portanto, se corrermos a nossa aplicação em duas Zonas de Disponibilidade e
uma falhar—"

"A outra continua a funcionar," completou Maya.

"Exactamente."

Leo, que tinha estado a ouvir em silêncio: "Implantei tudo numa AZ."

"Sim," disse Priya. "Reparámos."

O conceito de distribuir a aplicação por múltiplas AZs — chamado **implantação Multi-AZ**
— é um dos padrões de resiliência mais importantes na AWS. Aprofundamos isso
no Capítulo 18. Por agora, perceba que as AZs existem especificamente para tornar isto possível.

**Localizações de Borda: Velocidade, em Todo o Lado**

As AZs resolvem a resiliência. Não resolvem o problema de servir conteúdo rapidamente a utilizadores em
cidades distantes da sua Região principal.

Entram em cena as **Localizações de Borda**.

As Localizações de Borda são pontos de infraestrutura pequenos e leves espalhados por mais de 400
cidades em todo o mundo. Não são centros de dados completos — não conseguem correr a sua aplicação.
O que *conseguem* fazer é armazenar em cache conteúdo perto dos seus utilizadores.

Imagine uma imagem de menu guardada num servidor na Virgínia. Sempre que alguém no Tóquio quer
vê-la, o pedido viaja pelo Pacífico e regressa. Com as Localizações de Borda, a AWS pode guardar uma
cópia desse ficheiro em Tóquio e servi-lo localmente — milissegundos em vez de centenas de
milissegundos.

Esta é a espinha dorsal do CloudFront, a rede de distribuição de conteúdo da AWS. Aprofundamos o
CloudFront no Capítulo 13. Por agora: as Localizações de Borda são sobre velocidade para conteúdo estático.

**Escolher uma Região: A Lista de Verificação do Engenheiro Sénior**

Quando Nimbus se expande para servir utilizadores no México e na Colômbia (o que acontece no Capítulo 12),
a decisão de Região não é arbitrária. Eis o raciocínio:

**1. Onde estão os seus utilizadores?**

Comece aqui. Escolha a Região mais próxima da maioria dos seus utilizadores. A latência é o impacto
mais directo e mensurável da escolha de Região.

**2. Existem requisitos de conformidade?**

As cargas de trabalho de saúde, finanças e governo têm frequentemente regras estritas de residência de dados.
Conheça o seu ambiente regulatório antes de escolher.

**3. De quais serviços precisa?**

Nem todos os serviços AWS estão disponíveis em todas as Regiões. Os novos serviços lançam em `us-east-1`
primeiro. Se precisar de um serviço específico, verifique se a sua Região de destino o suporta.

**4. Qual é o preço?**

As Regiões variam em preço. `us-east-1` (norte da Virgínia) tende a ser mais barata devido à
sua escala e antiguidade. A América do Sul é ligeiramente mais cara. Verifique a página de preços da AWS
antes de finalizar.

**5. Precisa de multi-Região?**

Para a maioria das aplicações, múltiplas AZs dentro de uma Região são suficientes para resiliência. Para
aplicações críticas onde mesmo uma paragem regional é inaceitável, projecta-se para
multi-Região — mas isso é um compromisso arquitectural significativo. Não o faça
especulativamente.

**A Limitação de Que Ninguém Fala**

As Regiões são poderosas, mas criam uma tensão importante.

Correr em múltiplas Regiões é genuinamente difícil.

A replicação de dados entre Regiões tem latência. Manter duas Regiões em sincronismo — para que uma
transacção na Região A seja instantaneamente visível na Região B — é um dos problemas mais difíceis
em sistemas distribuídos. A AWS fornece ferramentas para isso, mas custa dinheiro e acrescenta
complexidade operacional.

A maioria das aplicações deve começar com uma Região, múltiplas AZs, e expandir para multi-Região
apenas quando tiver um requisito claro: mandatos regulatórios, SLAs contratuais que exijam
praticamente zero de tempo de paragem regional, ou uma base de utilizadores genuinamente distribuída por continentes.

A arquitectura multi-Região prematura é um dos erros mais comuns e caros que os engenheiros
júnior cometem quando começam a sentir-se confiantes.

Tom acenou. "Portanto não fazemos multi-Região só porque podemos."

"Não até precisarmos," disse Maya. "E saberemos quando precisarmos."

"Como saberemos?" perguntou Leo.

"Quando o documento de revisão de arquitectura tiver um requisito que diz 'deve sobreviver a uma paragem regional,'" disse Priya. "Até então: multi-AZ."

## Pontos Fortes e Limitações

**Use design multi-região e multi-AZ quando**: a sua aplicação tem utilizadores em múltiplas geografias e a latência importa; o seu SLA requer 99,99% ou mais de disponibilidade; os requisitos regulatórios obrigam à residência de dados em regiões específicas; precisa de recuperação de desastres com um RTO inferior a uma hora.

**Os compromissos são reais**: Replicar dados entre regiões acrescenta custo — a transferência de dados entre regiões é uma das rubricas mais subestimadas numa factura AWS. Também acrescenta complexidade operacional: cada escrita que deve ser consistente entre regiões acrescenta latência. A maioria das falhas que afectam aplicações reais não são catástrofes inter-regionais — são problemas intra-regionais como um grupo de segurança mal configurado ou uma implantação falhada. Invista em multi-AZ antes de multi-região. Adicione multi-região quando o caso de negócio for claro.

## Resumo

- A AWS organiza a sua infraestrutura global em **Regiões**, **Zonas de Disponibilidade**
  e **Localizações de Borda**.
- Uma **Região** é um conjunto geográfico de centros de dados. Cada Região é isolada —
  os dados ficam na Região a não ser que os mova explicitamente.
- As **Zonas de Disponibilidade** são centros de dados fisicamente separados dentro de uma Região, ligados
  por redes de baixa latência. Implantar em múltiplas AZs é a forma padrão de
  sobreviver a falhas locais.
- As **Localizações de Borda** armazenam conteúdo em cache perto de utilizadores em todo o mundo. Alimentam o CloudFront.
- Escolha a sua Região com base na localização dos utilizadores, requisitos de conformidade, disponibilidade de serviços
  e preço — nessa ordem.
- Multi-AZ é o nível de resiliência padrão. Multi-Região é para cargas de trabalho críticas
  com requisitos específicos e documentados — não um ponto de partida por defeito.

## Dicas de Exame

*Domínio SAA-C03 1 — Tarefa 1.1 / Domínio 2 — Tarefa 2.2*

- **As Regiões são isoladas por defeito.** Os dados não se replicam entre Regiões a não ser
  que configure isso. Isto é importante para cenários de soberania de dados e conformidade.
- **As AZs são a unidade de resiliência para a maioria das perguntas.** Quando o exame pergunta como sobreviver
  a uma falha de centro de dados, a resposta envolve múltiplas AZs dentro de uma Região.
- **Multi-Região é para resiliência a paragens regionais.** Se o cenário diz "deve permanecer
  operacional mesmo que uma Região AWS inteira falhe," a resposta envolve arquitectura multi-Região.
- **Localizações de Borda ≠ AZs.** As Localizações de Borda armazenam conteúdo em cache — não conseguem correr o servidor da
  sua aplicação. Não as confunda com centros de dados.
- O exame testa frequentemente a relação entre conformidade e selecção de Região.
  Se um cenário menciona requisitos de residência de dados, a escolha de Região faz parte da resposta.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: qual é a diferença entre uma Região e uma Zona de Disponibilidade?
Por que razão importa essa distinção ao projectar uma aplicação web resiliente?

*(Sugestão: Pense nos dois tipos diferentes de falha de que cada uma protege.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de saúde dos EUA deve armazenar todos os dados de pacientes dentro de uma única Região AWS
para cumprir políticas internas de residência de dados. Estão a projectar uma nova aplicação cloud
na Costa Oeste e querem maximizar a resiliência sem mover dados para outra Região.

Qual configuração MELHOR satisfaz os seus requisitos?

A) Implantar em `us-east-1` e usar Localizações de Borda CloudFront no Oregon para servir conteúdo
   mais depressa  
B) Implantar em `us-west-2` (Oregon) em múltiplas Zonas de Disponibilidade  
C) Implantar em múltiplas Regiões incluindo `us-west-2` e `us-east-1` com replicação
   de dados entre Regiões  
D) Implantar em `us-west-2` numa única Zona de Disponibilidade para minimizar custos

**Sugestão 1**: A política significa que os dados devem ficar numa única Região. Quais opções
movem dados para outra Região?

**Sugestão 2**: Entre as opções que mantêm os dados em `us-west-2`, qual proporciona mais resiliência?

**Sugestão 3**: Múltiplas AZs dentro de uma única Região proporcionam resiliência sem cruzar
fronteiras de Região.

**Resposta**: B

**Explicação**: `us-west-2` mantém todos os dados numa única Região, satisfazendo o requisito de política.
Implantar em múltiplas AZs dentro dessa Região protege contra
falhas de centro de dados sem mover dados para outra Região. Este é o equilíbrio correcto
de conformidade e resiliência.

**Por que não A?** O CloudFront armazena conteúdo em cache nas Localizações de Borda globalmente — os dados sairiam
fisicamente de `us-west-2`, violando a política de residência.

**Por que não C?** Replicar para `us-east-1` move dados de pacientes para a Costa Leste,
violando directamente o requisito de Região única.

**Por que não D?** Uma única AZ não tem resiliência. Se essa AZ sofrer uma paragem,
a aplicação falha completamente.

*Domínio SAA-C03 1 — Tarefa 1.1 (infraestrutura global, soberania de dados)*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a expandir para servir clientes no México e na Colômbia. Actualmente tudo
corre em `us-west-2`. A equipa está a debater: devem adicionar uma segunda Região `us-east-1`,
ou permanecer numa única Região com múltiplas AZs?

Que perguntas faria antes de decidir? Quais são os principais custos e riscos de
adicionar uma segunda Região? Qual é o principal custo de *não* adicionar uma?

*(Não existe uma resposta única correcta. Pratique o raciocínio sobre os compromissos multi-Região.)*

## Cena Pós-Créditos

Leo corrigiu o problema de Singapura. Nimbus mudou para `us-west-2`. A latência desceu.
A única pergunta de acompanhamento de Tom — "isso mudou a nossa factura?" — foi respondida com um
número ligeiramente mais alto, que ele aceitou com relutância visível.

Isso durou dois dias antes do próximo problema.

Leo chegou ao standup com a expressão que Maya tinha aprendido a reconhecer: o aspecto de
alguém que tinha feito algo que não conseguia desfazer.

"Então," disse ele com cuidado. "Configurei o servidor. E precisava de uma forma de fazer login.
Então criei um nome de utilizador."

"E?" perguntou Priya.

"'Admin'."

Silêncio.

"E a palavra-passe?"

Um silêncio mais longo.

"'Admin123'."

Priya levantou-se.

No próximo capítulo: como Nimbus controla quem pode tocar no quê — e o que acontece quando o fazem mal.
