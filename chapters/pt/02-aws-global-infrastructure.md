# Capítulo 2: Onde no Mundo Está o Seu Servidor?

Levante-se. Vá até uma janela, se houver uma por perto.

Olhe lá para fora. O que quer que você veja — prédios, árvores, um estacionamento, o quintal de alguém —
nada disso é onde seus dados moram. Seus dados moram em outro lugar completamente. Provavelmente
em algum lugar onde você nunca esteve.

Isso não é um problema. Mas entender *onde* faz com que um número surpreendente de coisas
se encaixe.

Depois da sessão no quadro branco, a decisão estava tomada: a Nimbus usaria a AWS. A nuvem era a resposta. Mas "a nuvem" acabou sendo uma coisa específica em um lugar específico — e Leo tinha escolhido aquele lugar sem querer.

Na manhã seguinte, Maya reparou que o servidor estava em Singapura.

"Por que Singapura?" perguntou ela.

"Era o padrão," disse Leo.

Tom levantou os olhos do café. "Quanto custa rodar um servidor em Singapura quando
todos os nossos clientes estão na Costa Oeste?"

Leo não tinha resposta.

Priya já tinha uma preocupação diferente. "E quem sabe por quais jurisdições esses dados estão passando?"

Este capítulo é sobre corrigir essa decisão — e entender por que ela importa.

**O Problema com "Algum Lugar"**

Quando você usa a AWS, você não está usando um centro de dados. Você está usando uma rede global
deles. A AWS tem infraestrutura em dezenas de países.

Isso é um recurso, não apenas um fato. Mas significa que você tem que fazer uma escolha: *onde*
você quer que sua infraestrutura rode?

A escolha importa por três razões:

**Desempenho.** Quanto mais perto seus servidores estiverem dos seus usuários, mais rápida a resposta.
A física é inegociável. Os dados viajam a cerca de dois terços da velocidade da luz
através de cabos de fibra óptica. Uma viagem de ida e volta de Seattle a Singapura leva cerca de 170
milissegundos só em trânsito — antes da sua aplicação fazer qualquer coisa. Essa mesma
requisição de Seattle ao Oregon (`us-west-2`) leva cerca de 20 milissegundos. A
diferença não é um erro de arredondamento. Para um aplicativo de pedidos de restaurante em que os clientes
esperam que as páginas pareçam instantâneas — e em que uma única página dispara várias viagens
de ida e volta — 170 ms de latência base por viagem de ida e volta é a diferença entre um produto
rápido e um lento.

Tom pegou o celular, abriu o app da Nimbus e carregou a página de um restaurante. Ele cronometrou com um app de cronômetro.

"Quase três segundos," disse ele.

Leo checou a divisão de latência nos logs do servidor. Só a ida e volta a Singapura — nada a ver com consultas de banco de dados — estava adicionando cerca de 170 milissegundos por requisição, e o app fazia várias viagens de ida e volta por página.

"E se a gente mover o servidor para o Oregon?" perguntou Tom.

"Vinte milissegundos," disse Leo. "Talvez menos."

"Quanto isso custa por mês?"

A diferença de preço era de alguns por cento. Não zero, mas não a variável principal. Eles moveram o servidor para `us-west-2` naquela tarde.

"Eu já implantei o agente de monitoramento na instância de Singapura," disse Leo, meio que para si mesmo. "Ah." Ele fez uma pausa. "Vou configurá-lo no Oregon em vez disso."

**Conformidade.** Alguns setores têm leis sobre onde os dados podem ser armazenados. Dados de saúde
dos EUA podem precisar permanecer dentro do país. Dados financeiros podem precisar permanecer dentro de uma região
específica. Escolher a Região errada pode criar problemas legais.

Priya tinha pesquisado isso antes de alguém pedir.

"GDPR," disse ela, levantando os olhos das anotações no standup da manhã seguinte. "Se a Nimbus algum dia atender clientes na União Europeia — mesmo um cliente — dados pessoais sobre eles podem precisar permanecer dentro da UE ou em um país com proteções equivalentes. Isso não é opcional. É a lei."

"A gente é um app de pedidos de restaurante," disse Leo. "Na Califórnia."

"Por enquanto," disse Priya. "A gente pensou no que acontece se expandirmos para a Europa em dezoito meses e descobrirmos que estivemos armazenando dados de clientes europeus no Oregon por um ano e meio?"

Uma pausa.

"A gente corrigiria na hora," disse Leo.

"Você não pode corrigir violações retroativas de residência de dados," disse Priya. "A violação já aconteceu."

Ela não estava sendo dramática. Multas do GDPR chegam a 4% da receita global anual. Violações de HIPAA na saúde dos EUA podem alcançar mais de US$ 2 milhões por categoria de violação por ano. Esses não são casos hipotéticos — são a razão pela qual grandes decisões de nuvem empresarial começam com mapeamento de conformidade, não com configuração de infraestrutura.

Para a Nimbus, a exposição regulatória imediata era baixa: clientes nos EUA, sem dados de saúde, sem serviços financeiros. Mas escolher uma Região para um negócio que pretende crescer significa escolher com o crescimento em mente.

**Resiliência a desastres.** Se um local tiver uma queda de energia, um terremoto ou uma falha
de rede, você quer que seu sistema sobreviva. Distribuir a infraestrutura por múltiplos
locais é como você se protege contra desastres locais.

**Como a AWS Organiza Sua Infraestrutura**

A AWS divide sua infraestrutura global em três conceitos aninhados. Pense neles como
bonecas russas, da maior para a menor: uma boneca grande que abre revelando uma
boneca média, que abre revelando uma pequena. Cada camada aninhada dentro da seguinte.

A boneca mais externa é o que a AWS chama de **Região**. Dentro de uma Região fica um aglomerado de
**Zonas de Disponibilidade**. E espalhadas por toda parte pelo globo, independentes de ambas,
estão as **Localizações de Borda** (Edge Locations).

Vamos abrir cada uma.

**Regiões: As Grandes Caixas**

Uma **Região** é uma área geográfica onde a AWS tem um aglomerado de centros de dados. Cada Região
é nomeada pela sua localização: `us-west-2` é Oregon, `us-east-1` é o norte da Virgínia,
`eu-west-1` é a Irlanda, `ap-southeast-1` é Singapura — onde o servidor do Leo estava escondido.

Existem quase 40 Regiões no mundo todo, e a AWS adiciona mais regularmente. A lista continua crescendo
à medida que a AWS se expande: há Regiões na América do Norte, América do Sul, Europa, Oriente Médio,
Ásia-Pacífico e África. Cada nova Região tipicamente é anunciada meses antes de abrir,
inclui ao menos três Zonas de Disponibilidade no lançamento, e leva alguns anos antes que todos os serviços
da AWS estejam disponíveis nela.

Cada Região é completamente independente. Dados em `us-west-2` ficam em `us-west-2` a menos que
você os mova explicitamente. Isso é crítico para conformidade e para resiliência — uma grande
interrupção em uma Região não afeta automaticamente as outras. Um evento que perturbe a rede
elétrica no norte da Virgínia não afeta o Oregon. Um desastre natural na Irlanda não
afeta Singapura. As Regiões são genuinamente isoladas umas das outras no nível da infraestrutura
física.

A independência é tão completa que se uma Região está passando por uma grande interrupção, até mesmo o
console de gerenciamento da AWS pode carregar lentamente — porque o próprio console roda em
infraestrutura da AWS. Vale a pena saber disso: durante um incidente real da AWS, você pode achar difícil
acessar as ferramentas de monitoramento de que precisa precisamente quando mais precisa delas. Esta é parte da razão pela qual
equipes experientes monitoram seus próprios serviços de forma independente do console da AWS.

"Então a gente deveria escolher `us-west-2` para a Nimbus?" perguntou Tom.

Sim. Para um negócio dos EUA mirando clientes da Costa Oeste, sim. Menor latência e seus usuários
obtêm respostas mais rápidas.

"Quanto mais caro é do que Singapura?" acrescentou Tom.

O preço varia por Região — geralmente por alguns por cento. O benefício de desempenho e conformidade
da Região certa vale a pequena diferença de preço.

**O Debate de Seleção de Região Que a Nimbus Quase Errou**

Antes da equipe fixar em `us-west-2`, houve uma breve discussão sobre se `us-east-1` (norte da Virgínia) fazia mais sentido. É a Região mais antiga, a maior, aquela onde a AWS lança novos serviços primeiro. É também a Região mais barata na maioria das páginas de preços. Tom gostou disso.

"Mas nossos usuários estão na Califórnia, Oregon e Washington," disse Maya. "Por que rodaríamos nossos servidores do outro lado do país?"

"Mais barato," disse Tom. "E mais serviços disponíveis."

"Espera — mas *por que* faríamos desse jeito?" disse Maya. "Nossos usuários estão na Costa Oeste. Nossos servidores deveriam estar na Costa Oeste. A diferença de preço é o quê, seis por cento? Sete? Gastaríamos mais com a latência extra em clientes perdidos do que economizaríamos em contas de computação."

Ela tinha razão. A Região certa para uma carga de trabalho é a Região mais próxima dos usuários que mais importam — a menos que conformidade, disponibilidade de serviço ou diferencial de custo justifiquem o trade-off. Para a Nimbus, nenhum desses justificava.

Esta é uma decisão que parece pequena e não é. Equipes que escolhem `us-east-1` porque "é o padrão" e depois atendem usuários da Costa Oeste a partir da Costa Leste estão deixando desempenho real na mesa. O console da AWS tem como padrão `us-east-1` por razões históricas. Não é uma recomendação.

**Zonas de Disponibilidade: A Redundância Real**

É aqui que fica interessante.

Cada Região não é um único centro de dados. É um aglomerado de múltiplos centros de dados fisicamente separados
chamados **Zonas de Disponibilidade** (ou AZs).

Oregon (`us-west-2`) tem quatro Zonas de Disponibilidade: `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Esses são prédios reais, separados por distâncias significativas — distantes o suficiente
para que um incêndio, enchente ou queda de energia em um não afete os outros, mas próximos
o suficiente para que a rede entre eles seja extremamente rápida (latência de milissegundos de um dígito).

Quão distante é "distância significativa"? A AWS não publica coordenadas exatas, mas pesquisadores independentes estimam que AZs dentro de uma Região são tipicamente separadas por dezenas de quilômetros — distantes o suficiente para estarem em redes elétricas diferentes e caminhos de fibra diferentes, não tão distantes a ponto de a velocidade da luz se tornar um fator limitante para a replicação síncrona.

Essa separação é deliberada e importante. Se duas AZs compartilhassem a mesma subestação de energia, uma falha de subestação derrubaria ambas as AZs simultaneamente — eliminando a redundância. A separação física garante que falhas de modo comum (do tipo que afeta uma área geográfica inteira) sejam eventos genuinamente raros, e não riscos previsíveis.

Esta é a arquitetura que torna a AWS confiável em um nível que nenhum centro de dados único consegue igualar.

Priya se inclinou para a frente. "Então se a gente rodar nossa aplicação em duas Zonas de Disponibilidade e
uma cair—"

"A outra continua funcionando," completou Maya.

"Exatamente."

Leo, que tinha ficado ouvindo quieto: "Eu implantei tudo em uma AZ."

"Sim," disse Priya. "A gente reparou."

O conceito de distribuir sua aplicação por múltiplas AZs — chamado **implantação Multi-AZ**
— é um dos padrões de resiliência mais importantes na AWS. Vamos a fundo nele
no Capítulo 18. Por enquanto, entenda que as AZs existem especificamente para tornar isso possível.

Uma nuance que vale conhecer: os nomes de AZ (`us-west-2a`, `us-west-2b`, etc.) não são consistentes entre contas da AWS. O que aparece como `us-west-2a` na sua conta pode ser um centro de dados físico diferente do que aparece como `us-west-2a` na conta de um colega. A AWS aleatoriza o mapeamento para evitar que todos os clientes implantem na mesma AZ física quando assumem o padrão "a". Se você precisa coordenar em qual AZ física você está com outra conta (para comunicação entre contas de baixa latência, por exemplo), a AWS fornece IDs de AZ — identificadores estáveis que mapeiam para a mesma localização física entre contas. As AZs nomeadas (`2a`, `2b`) são relativas à conta. Os IDs de AZ (`usw2-az1`, `usw2-az2`) são físicos. O exame testa essa distinção ocasionalmente.

**Como Realmente É uma Falha de AZ**

Isto não é abstrato. Deixe-me percorrer uma linha do tempo real.

São 14h47 de uma terça-feira. Uma falha elétrica em um dos transformadores que fornecem energia a `us-west-2b` causa uma interrupção naquele centro de dados. O evento não é previsto.

Se a Nimbus roda inteiramente em `us-west-2b`:
- 14h47: a instância EC2 perde energia. O servidor de banco de dados perde energia.
- 14h47: requisições recebidas para o app da Nimbus começam a falhar com timeouts de conexão.
- 14h47: os alertas de monitoramento do Tom disparam.
- 14h50: Leo começa o processo de recuperação. Ele lança uma nova instância EC2 em `us-west-2a`.
- 15h05: o banco de dados volta a ficar online a partir de uma restauração de snapshot.
- 15h12: a aplicação é reconfigurada para apontar para o novo endpoint do banco de dados.
- 15h20: a Nimbus está atendendo tráfego de novo.

São 33 minutos de inatividade. Durante o serviço de jantar de uma sexta-feira, 33 minutos poderiam custar milhares em pedidos perdidos e o tipo de dano à reputação que não aparece no relatório de incidente.

Se a Nimbus roda distribuída entre `us-west-2a` e `us-west-2b` com implantação Multi-AZ apropriada:
- 14h47: a instância EC2 em `us-west-2b` perde energia.
- 14h47: o Application Load Balancer detecta a instância não saudável via health checks.
- 14h47: o ALB para de rotear tráfego para a instância com falha, automaticamente.
- 14h47: o tráfego continua fluindo para a instância em `us-west-2a`.
- 14h48: o Auto Scaling Group lança uma instância substituta.
- 14h55: a substituta passa nos health checks e volta a integrar a frota.

Inatividade: zero. Impacto no cliente: quase zero. O monitoramento do Tom dispara, mas a ação do Leo é "observar e confirmar que a recuperação se completou", não "reconstruir tudo manualmente".

Esta é a diferença entre Multi-AZ e single-AZ. A fronteira da AZ é onde o design de redundância da AWS se torna a resiliência da sua aplicação.

**A Matemática da Confiabilidade Multi-AZ**

A AWS projeta cada AZ para ser independente — não só fisicamente, mas com energia, refrigeração e rede separadas. A probabilidade de duas AZs na mesma Região falharem simultaneamente é projetada para ser extremamente baixa.

Se uma única AZ tem 99,9% de disponibilidade (cerca de 8,7 horas de inatividade por ano), então uma arquitetura de duas AZs que trata falhas como eventos independentes tem aproximadamente 99,9999% de disponibilidade para o mesmo modo de falha — cerca de 31 segundos de inatividade por ano oriundos de falhas de AZ.

Na prática, o fator limitante para a maioria das aplicações não é a disponibilidade da AZ. É o código da aplicação, o processo de implantação e o banco de dados. Mas a matemática ilustra por que Multi-AZ é a linha de base padrão: o custo de rodar em duas AZs é modesto; a melhoria de disponibilidade é grande.

**Localizações de Borda: Velocidade, em Todo Lugar**

As AZs resolvem a resiliência. Elas não resolvem o problema de servir conteúdo rapidamente a usuários em
cidades distantes da sua Região principal.

Entram as **Localizações de Borda**.

As Localizações de Borda são pontos de infraestrutura pequenos e leves — mais de 750 pontos de
presença espalhados por mais de 100 cidades no mundo todo. Elas não são centros de dados completos —
elas não conseguem rodar a sua aplicação.
O que elas *conseguem* fazer é cachear conteúdo perto dos seus usuários.

Imagine uma imagem de cardápio armazenada em um servidor na Virgínia. Toda vez que alguém em Tóquio quer
vê-la, a requisição viaja pelo Pacífico e volta. Com as Localizações de Borda, a AWS pode armazenar uma
cópia desse arquivo em Tóquio e servi-lo localmente — milissegundos em vez de centenas de
milissegundos.

Esta é a espinha dorsal do CloudFront, a rede de distribuição de conteúdo da AWS. Vamos cavar no
CloudFront no Capítulo 13. Por enquanto: as Localizações de Borda são sobre velocidade para conteúdo estático.

Você pode estar se perguntando: se as Localizações de Borda cacheiam conteúdo, elas também armazenam seus dados permanentemente? Não. As Localizações de Borda guardam cópias temporárias de conteúdo para servi-lo mais rápido — o original sempre mora na sua Região. Se o cache expira ou o conteúdo muda, a Localização de Borda busca uma cópia fresca da origem.

A rede de Localizações de Borda é separada da estrutura de Região e AZ. Quando você pensa em onde sua aplicação *roda*, você pensa em Regiões e AZs. Quando você pensa em como o conteúdo chega aos seus usuários *rapidamente*, você pensa em Localizações de Borda e CloudFront. Eles resolvem problemas diferentes e operam em camadas diferentes.

A AWS também tem um conceito relacionado chamado **Regional Edge Caches** — nós de cache maiores que ficam entre sua Região e as Localizações de Borda. Se uma Localização de Borda em uma cidade não tem uma cópia cacheada de um arquivo, ela busca no Regional Edge Cache em vez de voltar todo o caminho até sua Região. Isso reduz a carga na sua origem e melhora as taxas de acerto de cache para conteúdo menos popular. Você não configura os Regional Edge Caches diretamente — eles fazem parte da infraestrutura do CloudFront que opera automaticamente.

O resultado prático para a Nimbus: quando a equipe adicionar o CloudFront no Capítulo 13, imagens de cardápio que costumavam viajar do Oregon até o navegador de um cliente a cada requisição serão em vez disso servidas da Localização de Borda mais próxima — Dallas para clientes do Texas, Atlanta para clientes da Geórgia, Chicago para clientes de Illinois. O usuário em Chicago recebe sua imagem de cardápio de um servidor a 500 quilômetros de distância em vez de 3.200 quilômetros. A diferença é mensurável e significativa.

**Uma Ressalva Sobre Cópias Cacheadas**

Há um detalhe sobre as Localizações de Borda que vale sinalizar agora, mesmo que a história completa pertença ao Capítulo 13: uma cópia cacheada é uma *cópia*, e cópias podem ficar desatualizadas. Se o original muda na sua Região, a Localização de Borda pode continuar servindo a versão antiga por um tempo. Por quanto tempo, e o que você pode fazer a respeito, são exatamente os tipos de controle que uma CDN dá a você — e exatamente o que a equipe vai enfrentar quando a Nimbus de fato implantar o CloudFront. Por enquanto, leve adiante apenas isto: o conteúdo pode morar perto do usuário, e "perto" às vezes significa "ligeiramente desatualizado".

**Escolhendo uma Região: O Checklist do Engenheiro Sênior**

Se a Nimbus um dia se expandir para atender usuários no México e na Colômbia — um cenário que vamos
praticar nos exercícios deste capítulo — a decisão de Região não é arbitrária. Eis o raciocínio:

**1. Onde estão seus usuários?**

Comece aqui. Escolha a Região mais próxima da maioria dos seus usuários. A latência é o impacto
mais direto e mensurável da escolha de Região.

A distância física entre um usuário e um servidor importa de uma forma que é fácil de
subestimar. Uma ida e volta de 170 ms a Singapura versus uma ida e volta de 20 ms ao Oregon não é
uma métrica de desempenho abstrata — é a diferença entre uma página que parece
instantânea e uma página que parece lenta. Em um dispositivo móvel com latência de rádio
adicional, a penalidade de Singapura se agrava ainda mais. Para um usuário em San Jose, `us-west-2`
(Oregon) é a Região certa antes mesmo de você considerar qualquer outro fator.

**2. Há requisitos de conformidade?**

Cargas de trabalho de saúde, finanças e governo frequentemente têm regras rígidas de residência de dados.
Conheça seu ambiente regulatório antes de escolher. O GDPR exige que dados pessoais de residentes da UE sejam armazenados em jurisdições com proteção de dados adequada — ou a própria UE ou um país com uma decisão de adequação. O HIPAA exige salvaguardas documentadas para dados de saúde dos EUA. Essas não são considerações opcionais para revisitar depois.

Na prática: converse com sua equipe jurídica antes de escolher uma Região para qualquer carga de trabalho regulada. A AWS mantém ampla documentação de conformidade para cada Região, incluindo certificações como SOC 2, ISO 27001, PCI DSS e elegibilidade para HIPAA. Mas as certificações dizem o que a AWS fez; sua equipe jurídica diz se isso é suficiente para o seu contexto regulatório específico.

**3. De quais serviços você precisa?**

Nem todo serviço AWS está disponível em todas as Regiões. Novos serviços são lançados em `us-east-1`
primeiro. Se você precisa de um serviço específico, verifique se sua Região de destino o suporta.

Isso é menos preocupante para os serviços neste livro — todos os serviços principais estão
amplamente disponíveis — mas importa para serviços mais novos, hardware especializado (alguns tipos de
instância com GPU só existem em certas Regiões) e o AWS GovCloud (uma Região separada
projetada para cargas de trabalho do governo dos EUA com requisitos regulatórios específicos).

**4. Qual é o preço?**

As Regiões variam em preço. `us-east-1` (norte da Virgínia) tende a ser a mais barata por causa da
sua escala e idade. A América do Sul é ligeiramente mais cara. Verifique a página de preços da AWS
antes de finalizar.

O diferencial de preço geralmente é pequeno — de alguns a dez por cento entre Regiões populares. Raramente é o fator decisivo. Mas para uma carga de trabalho sensível a custo rodando milhares de instâncias, até uma diferença de preço de 5% se acumula com o tempo. Tom verificaria o número e o consideraria, como Tom verificava todos os números e os considerava.

**5. Você precisa de multirregião?**

Para a maioria das aplicações, múltiplas AZs dentro de uma Região são resiliência suficiente. Para
aplicações críticas em que mesmo uma interrupção regional é inaceitável, você projeta para
multirregião — mas isso é um compromisso arquitetural significativo. Não faça isso
especulativamente.

"Qual é a regra para quando a gente adicionar uma segunda Região?" perguntou Leo.

"Quando a gente tiver um requisito documentado que diga 'deve permanecer operacional se uma Região AWS inteira estiver indisponível'," disse Priya. "Não 'seria legal'. Um requisito específico, com uma justificativa de negócio específica, que pesamos contra a complexidade e o custo."

"Como isso é na prática?"

"Um contrato de cliente com um SLA que exige 99,99% de uptime. Uma obrigação regulatória de redundância geográfica. Um cenário de perda de região que a gente consegue de fato quantificar em termos de receita. Não só 'e se us-west-2 cair'."

Leo olhou para a arquitetura atual da Nimbus. Eles ainda estavam em uma AZ.

"Multi-AZ primeiro," disse ele.

"Multi-AZ primeiro," confirmou Priya.

**A Limitação de Que Ninguém Fala**

As Regiões são poderosas, mas criam uma tensão importante.

Rodar em múltiplas Regiões é genuinamente difícil.

A replicação de dados entre Regiões tem latência. Manter duas Regiões em sincronia — para que uma
transação na Região A seja instantaneamente visível na Região B — é um dos problemas mais
difíceis em sistemas distribuídos. A AWS fornece ferramentas para isso, mas custa dinheiro e adiciona
complexidade operacional.

A maioria das aplicações deveria começar com uma Região, múltiplas AZs, e expandir para multirregião
apenas quando tiver um requisito claro: obrigações regulatórias, SLAs contratuais que exijam
inatividade regional próxima de zero, ou uma base de usuários genuinamente distribuída por continentes.

Replicar dados entre regiões adiciona custo — a transferência de dados entre regiões é um dos itens mais subestimados de uma conta da AWS. Também adiciona complexidade operacional: toda escrita que deve ser consistente entre regiões adiciona latência.

A maioria das falhas que afetam aplicações reais não são catástrofes inter-regionais. São problemas dentro da região, como um security group mal configurado ou uma implantação mal feita. O dramático cenário de "uma região inteira cai" vira manchete precisamente porque é raro. Invista em multi-AZ antes de multirregião. Adicione multirregião quando o caso de negócio estiver claro.

Para colocar números específicos nisso: a AWS teve um pequeno número de eventos significativos de uma única região ao longo de sua história. Interrupções regionais completas são genuinamente incomuns. Eventos no nível de AZ — interrupções breves afetando um centro de dados dentro de uma região — são menos raros e são exatamente o que a implantação Multi-AZ foi projetada para absorver. A frequência de eventos de AZ comparada à de eventos regionais é cerca de uma ordem de grandeza maior. Gastar esforço arquitetural primeiro no modo de falha mais comum é a escolha racional.

A arquitetura multirregião prematura é um dos erros mais comuns e caros que
engenheiros juniores cometem quando começam a se sentir confiantes.

Tom assentiu. "Então a gente não faz multirregião só porque pode."

"Não até precisarmos," disse Maya. "E a gente vai saber quando precisar."

"Como a gente vai saber?" perguntou Leo.

"Quando o doc de revisão de arquitetura tiver um requisito que diga 'deve sobreviver a uma interrupção
regional'," disse Priya. "A gente pensou no que acontece se uma AZ inteira cair antes de a gente nem ter configurado Multi-AZ? A gente deveria corrigir isso primeiro. Até então: multi-AZ."

Você pode estar se perguntando: como você verifica que sua implantação Multi-AZ de fato funciona antes de precisar dela? Você a testa. A AWS fornece uma ferramenta chamada **AWS Fault Injection Service (FIS)** — anteriormente Fault Injection Simulator — que pode simular falhas de AZ, encerramentos de instância e outras condições de falha contra sua arquitetura em execução — para que você possa observar como seu sistema se comporta sob condições de falha de forma controlada, em vez de descobrir o comportamento durante um incidente real. Testar sua arquitetura de resiliência é tão importante quanto construí-la. Priya colocou "teste de injeção de falha" no calendário trimestral de revisão de arquitetura imediatamente após ler sobre isso.

## Quando a AWS Vem Até Você: Outposts e Wavelength

Regiões e Zonas de Disponibilidade cobrem o mundo — mas nem todo problema é resolvido movendo dados para a AWS. Algumas cargas de trabalho devem permanecer on-premises: sistemas de chão de fábrica que precisam de latência inferior a um milissegundo, aplicações de saúde com requisitos de residência de dados, sistemas de ponto de venda no varejo em lojas sem internet confiável. Para esses, a AWS estende sua infraestrutura até a localização do cliente.

"Espera — e se a gente eventualmente trabalhar com um sistema hospitalar?" perguntou Priya. "O software de monitoramento de pacientes deles literalmente não pode tolerar uma ida e volta à nuvem. E pode não ser legalmente permitido sair do prédio."

Maya abriu a documentação da AWS. Dois serviços apareciam repetidamente.

**AWS Outposts**

Um rack totalmente gerenciado de hardware da AWS instalado no seu próprio centro de dados ou instalação de colocation. O Outposts roda a mesma infraestrutura, serviços, APIs e ferramentas da AWS na nuvem — EC2, EBS, RDS, EKS, S3 on Outposts — mas fisicamente no seu prédio.

Casos de uso: cargas de trabalho de manufatura sensíveis a latência, requisitos de residência de dados em que os dados devem fisicamente permanecer em um local específico, aplicações que precisam das APIs da AWS mas não podem tolerar lacunas de conectividade com a nuvem pública.

Ponto-chave: o Outposts ainda é gerenciado pela AWS. A AWS o instala, aplica patches e o monitora. Você possui o espaço do rack e a energia. As APIs e ferramentas são idênticas às da nuvem pública — os mesmos templates do CloudFormation, as mesmas políticas IAM, os mesmos comandos de CLI. A distinção no exame é a localização física, não o modelo operacional.

"Então é AWS, mas no prédio do nosso cliente," disse Leo.

"Exatamente," disse Maya. "Mesmas APIs. CEP diferente."

**AWS Wavelength**

Infraestrutura da AWS implantada dentro das redes 5G de provedores de telecomunicações. As Wavelength Zones ficam na borda das redes 5G, fisicamente perto dos usuários móveis, viabilizando latência de milissegundos de um dígito para aplicações móveis.

Casos de uso: jogos em tempo real, AR/VR, telemetria de veículos autônomos, processamento de vídeo ao vivo na borda 5G.

"Esse não é para um hospital," disse Tom. "Esse é para alguém construindo a próxima geração de jogos móveis multiplayer."

"Ou telemetria de carro autônomo," disse Priya. "Qualquer coisa em que um dispositivo móvel precisa falar com um servidor e 50 milissegundos é lento demais."

**A diferença:** o Outposts traz a AWS para o seu centro de dados — seu prédio, seu rack, sua energia. O Wavelength traz a AWS para a borda da rede de telecom — fisicamente colocada junto da infraestrutura de rádio 5G, perto de usuários móveis que nunca tocam na sua rede privada.

**AWS Local Zones**

Há um terceiro irmão nessa família — e no exame, é o mais frequentemente testado dos três. As **Local Zones** são infraestrutura da AWS implantada em grandes áreas metropolitanas que não têm uma Região completa — Los Angeles, Houston, Miami, Lagos, e dezenas mais. Uma Local Zone é uma extensão de uma Região pai: você roda EC2, EBS e um subconjunto de outros serviços *na própria metrópole*, obtendo latência de milissegundos de um dígito para usuários naquela cidade, enquanto todo o resto (e todo o gerenciamento) permanece na Região pai.

O padrão para memorizar — três irmãos de "computação de borda", três gatilhos:

- "Latência de milissegundos de um dígito para usuários finais **em uma cidade/área metropolitana específica**" → **Local Zones**
- "Latência ultrabaixa para **dispositivos móveis 5G**" → **Wavelength**
- "Serviços AWS rodando **no nosso próprio centro de dados** / dados devem permanecer on-premises" → **Outposts**

Nenhum dos três é a resposta para uma aplicação web típica. Todos eles aparecem no exame SAA-C03 como armadilhas de correspondência de padrões: a frase-gatilho importa.

## Pontos Fortes e Limitações

**Use design multirregião e multi-AZ quando**: sua aplicação tem usuários em múltiplas geografias e a latência importa; seu SLA exige 99,99% ou mais de disponibilidade; requisitos regulatórios obrigam à residência de dados em regiões específicas; você precisa de recuperação de desastres com um RTO inferior a uma hora.

**Os trade-offs são reais**: Rodar em múltiplas Regiões dá a você redundância contra interrupções regionais — mas a um custo e complexidade significativos.

Lembre-se do aviso de custo de mais cedo neste capítulo: cada byte que se move entre regiões custa dinheiro. Em uma configuração multirregião ativo-ativo em que as escritas devem ser consistentes, você está pagando esse custo constantemente.

A complexidade operacional também escala. Depurar um incidente em uma região é difícil. Depurar um incidente distribuído, inter-regional — em que a mesma requisição tocou infraestrutura em dois continentes — é um tipo de difícil completamente diferente.

**A progressão certa para a maioria das aplicações**: Comece com uma única Região e múltiplas AZs. Isso dá a você resiliência contra as falhas que de fato acontecem — interrupções no nível de AZ, falhas de hardware, eventos de energia — a uma fração da complexidade de uma arquitetura multirregião. Adicione multirregião quando um requisito específico e documentado o tornar necessário. Não antes.

O padrão comum para equipes que pulam para multirregião cedo demais: a complexidade de gerenciar duas regiões introduz seus próprios modos de falha — bugs de sincronização de dados, cenários de split-brain, implantações inconsistentes. A própria arquitetura de resiliência projetada para prevenir falhas às vezes introduz novas categorias de falha que não existiriam em um design mais simples.

Priya tinha um documento que ela chamava de "o orçamento de complexidade". A ideia: toda decisão arquitetural que adiciona complexidade operacional tem um custo, e a organização tem uma capacidade finita de gerenciar essa complexidade. Gastar o orçamento de complexidade em arquitetura multirregião antes de você ter dominado a confiabilidade de região única é um investimento ruim. A complexidade deveria ir para os modos de falha que você de fato enfrenta, não para os que dão boas histórias de recuperação de desastres.

"A gente tem uma região, uma AZ, e um processo de implantação que deixa o Leo nervoso toda vez que ele roda," disse Priya. "O próximo passo certo é multi-AZ, não multirregião."

Tom escreveu "orçamento de complexidade" no caderno. Ele usaria essa expressão regularmente pelos dois anos seguintes.

## Resumo

O acidente de Singapura do Leo acabou sendo uma lição útil — não porque causou dano duradouro, mas porque forçou a equipe a entender algo que normalmente é pulado: onde sua infraestrutura roda não é uma decisão cosmética. A física é inegociável. Cento e setenta milissegundos de latência base por viagem de ida e volta são a diferença entre um produto rápido e um lento, e as regras de conformidade sobre onde os dados moram não se importam com quão rápido você se moveu.

- A AWS organiza sua infraestrutura global em **Regiões**, **Zonas de Disponibilidade** e **Localizações de Borda**.
- Uma **Região** é um aglomerado geográfico de centros de dados. Cada Região é isolada — os dados ficam na Região a menos que você os mova explicitamente.
- As **Zonas de Disponibilidade** são centros de dados fisicamente separados dentro de uma Região, conectados por rede de baixa latência. Implantar em múltiplas AZs é a forma padrão de sobreviver a falhas locais.
- Escolha sua Região com base na localização dos usuários, requisitos de conformidade, disponibilidade de serviços e preço — nessa ordem.
- Multi-AZ é a linha de base padrão de resiliência. Multirregião é para cargas de trabalho críticas com requisitos específicos e documentados — não um ponto de partida por padrão.

## Dicas de Exame

*Domínio SAA-C03 1 — Tarefa 1.1 / Domínio 2 — Tarefa 2.2*

- **As Regiões são isoladas por padrão.** Os dados não se replicam entre Regiões a menos que
  você configure isso. Isso é importante para cenários de soberania de dados e conformidade.
- **As AZs são a unidade de resiliência para a maioria das questões.** Quando o exame pergunta como sobreviver
  a uma falha de centro de dados, a resposta envolve múltiplas AZs dentro de uma Região.
- **Multirregião é para resiliência a interrupções regionais.** Se o cenário diz "deve permanecer
  operacional mesmo que uma Região AWS inteira falhe," a resposta envolve arquitetura
  multirregião.
- **Localizações de Borda ≠ AZs.** As Localizações de Borda cacheiam conteúdo — elas não conseguem rodar o
  servidor da sua aplicação. Não as confunda com centros de dados.
- O exame frequentemente testa a relação entre conformidade e seleção de Região.
  Se um cenário menciona requisitos de residência de dados, a escolha de Região faz parte da resposta.
- Cenários de **GDPR e residência de dados** no exame tipicamente apontam para manter dados dentro de uma Região específica e garantir que a replicação entre regiões esteja desativada ou controlada.
- **Outposts vs Wavelength vs Local Zones:** Outposts = rack da AWS no seu centro de dados (on-premises, residência de dados, latência local). Wavelength = AWS na borda da rede 5G (usuários móveis, latência ultrabaixa). Local Zones = computação da AWS em uma área metropolitana sem uma Região completa. Gatilhos de exame: "rodar AWS na sua própria instalação" → Outposts. "Latência ultrabaixa para usuários móveis 5G" → Wavelength. "Latência de milissegundos de um dígito para usuários em uma cidade específica" → Local Zones.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: qual é a diferença entre uma Região e uma Zona de Disponibilidade?
Por que essa distinção importa ao projetar uma aplicação web resiliente?

*(Dica: Pense nos dois tipos diferentes de falha contra os quais cada uma protege.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de saúde dos EUA deve armazenar todos os dados de pacientes dentro de uma única
Região AWS para cumprir políticas internas de residência de dados. Eles estão projetando uma nova
aplicação na nuvem na Costa Oeste e querem maximizar a resiliência sem mover dados para
outra Região.

Qual configuração MELHOR atende aos requisitos deles?

A) Implantar em `us-east-1` e usar Localizações de Borda do CloudFront no Oregon para servir conteúdo
   mais rápido  
B) Implantar em `us-west-2` em uma única Zona de Disponibilidade para minimizar custos  
C) Implantar em múltiplas Regiões incluindo `us-west-2` e `us-east-1` com replicação
   de dados entre Regiões  
D) Implantar em `us-west-2` (Oregon) em múltiplas Zonas de Disponibilidade

**Dica 1**: A política significa que os dados devem permanecer em uma única Região. Quais opções
movem dados para outra Região?

**Dica 2**: Entre as opções que mantêm os dados em `us-west-2`, qual fornece mais resiliência?

**Dica 3**: Múltiplas AZs dentro de uma única Região fornecem resiliência sem cruzar
fronteiras de Região.

**Resposta**: D

**Explicação**: `us-west-2` mantém todos os dados em uma única Região, satisfazendo o requisito
da política. Implantar em múltiplas AZs dentro dessa Região protege contra
falhas de centro de dados sem mover dados para outra Região. Este é o equilíbrio correto
de conformidade e resiliência.

**Por que não A?** A opção A implanta em `us-east-1`, longe dos usuários da Costa Oeste — e o
CloudFront cachearia conteúdo adjacente a dados de pacientes em Localizações de Borda fora da Região
escolhida, violando a política de residência.

**Por que não B?** Uma única AZ não tem resiliência. Se essa AZ sofrer uma interrupção,
a aplicação falha completamente.

**Por que não C?** Replicar para `us-east-1` move dados de pacientes para a Costa Leste,
violando diretamente o requisito de Região única.

*Domínio SAA-C03 1 — Tarefa 1.1 (infraestrutura global, soberania de dados)*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está se expandindo para atender clientes no México e na Colômbia. Atualmente tudo
roda em `us-west-2`. A equipe está debatendo: eles devem adicionar uma segunda Região `us-east-1`,
ou permanecer em região única com múltiplas AZs?

Que perguntas você faria antes de decidir? Quais são os principais custos e riscos de
adicionar uma segunda Região? Qual é o principal custo de *não* adicionar uma?

*(Não há uma única resposta correta. Pratique o raciocínio sobre o trade-off multirregião.)*

## Cena Pós-Créditos

Leo corrigiu o problema de Singapura. A Nimbus mudou para `us-west-2`. A latência caiu.
A única pergunta de acompanhamento do Tom — "isso mudou nossa conta?" — foi respondida com um
número ligeiramente mais alto, que ele aceitou com relutância visível.

Isso durou dois dias antes do próximo problema.

Leo chegou ao standup com a expressão que Maya tinha aprendido a reconhecer: o olhar de
alguém que tinha feito algo que não conseguia desfazer.

"Então," disse ele com cuidado. "Eu configurei o servidor. E precisava de uma forma de fazer login.
Então criei um nome de usuário."

"E?" perguntou Priya.

"'Admin'."

Silêncio.

"E a senha?"

Um silêncio mais longo.

"'Admin123'."

Priya se levantou.

No próximo capítulo: como a Nimbus controla quem pode tocar no quê — e o que acontece quando erram.
