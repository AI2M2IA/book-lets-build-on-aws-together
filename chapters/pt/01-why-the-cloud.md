# Capítulo 1: Por Que Alugar Quando Você Poderia Possuir?

O caderno estava aberto sobre a mesa, e Tom já tinha riscado a mesma linha três vezes.

Ele tinha ficado acordado até tarde. A pergunta não o largava. Por volta da meia-noite ele a escreveu por completo, depois a sublinhou, depois desenhou uma caixa ao redor dela, e então a riscou porque escrevê-la não a tinha deixado nem um pouco mais clara. Ele a escreveu de novo na margem.

Quando Leo e Priya chegaram na manhã seguinte — café na mão, discutindo sobre algo sem relação — Tom já estava no quadro branco. A terceira opção ainda estava lá, intocada. Uma forma de nuvem, desenhada por alguém que tinha admitido não saber o que ela significava.

O problema de pedidos do restaurante tinha cristalizado algo real. Maya tinha declarado a nuvem como o caminho a seguir. Essa decisão estava tomada. O que restava era a pergunta que Tom não conseguia tirar da cabeça, parada na margem do caderno dele: se alugar era a resposta, por que era mais barato do que possuir?

"Preciso que alguém me explique uma coisa," disse Tom, sem se virar. "Se alugarmos computadores da Amazon em vez de comprar os nossos — por que isso seria *mais barato*?"

A sala ficou em silêncio. Era o tipo de pergunta que soa simples e não é.

"Porque," começou Leo.

"Não," disse Tom. "Eu quero entender. Não só ouvir a resposta. Por que alugar é mais barato do que possuir?"

Leo se sentou. Pousou o café sobre a mesa. Ele de fato pensou a respeito.

"Porque," disse ele de novo, com mais cuidado dessa vez, "estaríamos comprando para o pior caso. A maior sexta-feira à noite, o momento viral, o evento de lançamento. Mas na maior parte do tempo não está tão movimentado."

"Certo," disse Tom. "Continue."

"Então estaríamos pagando por capacidade que não estamos usando. Toda terça-feira calma. Toda segunda de manhã. Teríamos um servidor parado ali, consumindo eletricidade, fazendo quase nada."

"E se alugarmos em vez disso?"

"Pagamos pelo que usamos," disse Leo. "Quando está calmo, pagamos quase nada. Quando está movimentado, pagamos mais. Mas nunca pagamos por capacidade que está só parada ali."

Tom pareceu satisfeito. Não porque a resposta fosse nova para ele — ele a tinha deduzido na noite anterior. Mas porque dizê-la em voz alta a tornava real. Ele pegou o caderno e riscou a pergunta uma última vez.

Essa foi a fundação. Todo o resto deste capítulo se constrói sobre ela.

**O Problema Óbvio de Possuir Servidores**

Imagine que você decide abrir um restaurante. Não do tipo Nimbus — um restaurante comum.

Antes do seu primeiro cliente entrar, você precisa de mesas. Cadeiras. Uma cozinha. Um fogão.
Pratos. Equipe. Você precisa de tudo isso no primeiro dia, mesmo que a sua primeira semana seja fraca, mesmo
que você passe três meses com seis clientes por dia antes de a notícia se espalhar.

Servidores físicos funcionam da mesma forma.

Se a Nimbus comprar seus próprios servidores, ela tem que comprá-los para o pico que espera.
A sexta-feira à noite mais movimentada que conseguem imaginar. O momento viral em que um blogueiro de comida
posta sobre a arepa e dez mil pessoas tentam pedir de uma vez.

Mas na maior parte do tempo, não está tão movimentado. Na maior parte do tempo, esses servidores ficam parados ali,
consumindo eletricidade, fazendo quase nada.

"Estaríamos pagando por capacidade que não estamos usando," disse Maya.

"Exatamente," disse Tom, o que surpreendeu todo mundo porque foi ele quem fez
a pergunta.

**O Custo Real do Hardware: A Planilha do Tom**

Tom tinha montado um modelo de custo apropriado quando a equipe se reuniu. Ele explicou tudo para eles.

Ele tinha de fato precificado hardware real. Um Dell PowerEdge R550 — um servidor de gama intermediária capaz de lidar com várias centenas de usuários simultâneos — custava cerca de US$ 8.000 configurado com RAM e armazenamento suficientes para uma aplicação web de produção. Isso é um servidor. Para redundância (de modo que uma falha não derrubasse o sistema inteiro), você precisaria de pelo menos dois. Dezesseis mil dólares antes de começar.

A estimativa de US$ 2.000 do quadro branco era otimista. Hardware de produção custava mais. Você precisava de memória suficiente para a aplicação e o banco de dados rodarem simultaneamente. Você precisava de RAID para redundância de armazenamento. Você precisava de uma placa de rede rápida o suficiente para lidar com tráfego real. Quando você configurava um servidor de produção de verdade, o número de US$ 8.000 não era exagero.

"Dois servidores: US$ 16.000," disse Tom, anotando.

Depois os custos contínuos. Energia: um servidor rodando 24/7 a 400 watts consumia cerca de 3.500 quilowatts-hora por ano. A US$ 0,12 por kWh, isso era aproximadamente US$ 420 por ano, por servidor. Vezes dois: US$ 840 por ano só em eletricidade.

Depois a internet. Uma conexão empresarial rápida o suficiente para lidar com tráfego real — não o Wi-Fi residencial que o restaurante usava atualmente, mas uma conexão de fibra simétrica de nível empresarial com um acordo de nível de serviço — custava de US$ 200 a US$ 400 por mês. Isso era de US$ 2.400 a US$ 4.800 por ano.

Depois o ciclo de vida do hardware. Servidores duravam de três a cinco anos antes de ficarem lentos demais ou pouco confiáveis demais para rodar uma carga de trabalho de produção. Depois do quarto ano, você estava rodando em hardware que não podia receber patches contra certas vulnerabilidades e que seu fornecedor de servidor não dava mais suporte. Então você amortizava o custo inicial: US$ 16.000 ao longo de quatro anos eram US$ 4.000 por ano em depreciação de capital.

Depois os custos que ninguém anotava: um nobreak (UPS) para sobreviver a quedas breves de energia, cerca de US$ 400. Um switch de rede gerenciável, US$ 300. Um appliance de firewall com recursos de segurança apropriados, US$ 500 a US$ 2.000. Discos rígidos sobressalentes na prateleira para a falha inevitável, US$ 200. Refrigeração — se os servidores ficassem no escritório dos fundos do restaurante, alguém precisava considerar o calor que eles geravam, o que significava ou um circuito dedicado de ar-condicionado ou uma conta de luz surpresa.

Some tudo: algo entre US$ 8.000 e US$ 12.000 por ano em depreciação de capital e custos contínuos, antes de você pagar alguém para manter, configurar ou consertar o hardware. E "manutenção" não era só um item de planilha — era um requisito de expertise. Ou você contratava alguém que sabia operar servidores, ou você era a pessoa operando-os às 2h da manhã quando algo dava errado.

"E quando quebra," disse Tom, "a gente não sabe consertar. Pagaríamos alguém a preço de emergência. E enquanto esperamos por essa pessoa, o restaurante fica no escuro."

"Compare isso com a AWS," disse Tom. Ele abriu a página de preços do EC2. Uma instância `t3.medium` — computação suficiente para a carga de trabalho inicial da Nimbus — custava cerca de US$ 30 por mês. Duas delas, para redundância, eram US$ 60 por mês, ou US$ 720 por ano.

Quatro mil dólares por ano em depreciação versus US$ 720. A diferença não chegava nem perto. Mesmo que você somasse rede, transferência de dados e um serviço de banco de dados gerenciado na AWS, a conta da nuvem para uma carga de trabalho em escala de startup era uma fração do custo do hardware físico.

"Mas," disse Tom, porque Tom sempre tinha um mas, "a gente deveria ser honesto sobre quando isso deixa de ser tão claro assim."

Ele tinha razão. Em escala enorme — milhares de servidores, utilização constante — a economia muda. Uma empresa rodando 5.000 servidores a 90% de utilização o tempo todo pode descobrir que possuir hardware é mais barato por unidade do que alugar nesses volumes. Grandes empresas às vezes chegam a esse ponto. Startups quase nunca. Para uma startup com crescimento imprevisível, sem expertise em hardware e escala incerta, a matemática da nuvem era óbvia.

**O Modelo de Aluguel**

Eis o que torna a computação em nuvem diferente.

Quando você usa a AWS, você não compra servidores. Você aluga poder computacional, e paga apenas
pelo que usa. É mais parecido com alugar um espaço de eventos do que com possuir o prédio de um restaurante.

Pense desta forma.

Se você precisa realizar uma festa de aniversário para cinquenta pessoas, você poderia comprar uma casa grande
o suficiente para cinquenta pessoas e suas mesas e suas cadeiras. Ou você poderia alugar um espaço
por quatro horas no sábado, pagar exatamente pelo espaço e tempo de que precisa, e devolver
as chaves quando a festa terminar.

O espaço continua lá quando você precisar. Está disponível de novo quando outra coisa
surgir. Você não teve que contratar um gerente predial. Você não pagou imposto sobre o imóvel
o ano todo.

Mas eis a parte que a analogia não captura totalmente: com a AWS, o "espaço" pode crescer ou encolher para se ajustar à sua festa. Se cinquenta pessoas aparecessem e depois mais duzentas chegassem inesperadamente, o espaço se expandiria para acomodá-las. Se a festa terminasse mais cedo, o espaço se contrairia e você pararia de pagar pelo espaço extra imediatamente.

Nenhum aluguel de espaço funciona assim. A computação em nuvem funciona.

Esse é o modelo da nuvem. A AWS tem os "espaços". Você aparece quando precisa deles.

Há uma segunda analogia que atinge uma parte diferente do quadro.

Imagine que você é uma startup que precisa de fotografia profissional. Você poderia contratar um fotógrafo em tempo integral — salário, equipamento, benefícios, espaço de escritório, o pacote completo. Ou você poderia contratar um fotógrafo por hora quando precisasse de um, pagar pelo trabalho feito, e dispensá-lo quando a sessão terminasse.

O fotógrafo sob demanda custa mais por hora do que um assalariado. Mas a menos que você precise de fotografia a cada hora de cada dia, o modelo sob demanda é dramaticamente mais barato no total. E você pode contratar um especialista diferente para trabalhos diferentes — um fotógrafo de retratos para fotos de perfil, um fotógrafo de produtos para fotos de catálogo — sem manter quadro de pessoal para ambos.

A computação em nuvem tem essa mesma economia de especialização. A AWS mantém equipes de especialistas para cada camada da infraestrutura: engenheiros de rede, administradores de banco de dados, pesquisadores de segurança, especialistas em aquisição de hardware. Você acessa o resultado da expertise deles — um banco de dados confiável, uma rede segura, um servidor bem configurado — por hora, sem contratar nenhum desses especialistas você mesmo.

Você pode estar se perguntando: se alugar por hora é mais caro do que comprar de vez por unidade, como a economia funciona? A resposta é utilização. Um servidor físico que você possui fica a 9% de CPU em terças-feiras calmas. Um servidor na nuvem que você aluga pelas horas de que de fato precisa roda na utilização que a carga de trabalho exigir, e você para de pagar quando a carga de trabalho para. O total que você paga pelas horas que de fato usa é menor do que o total que você pagaria pelo servidor parado no canto.

**Mas Espere — Tem Mais**

"Ok," disse Leo, "mas e se o meu espaço pegar fogo?"

Bom instinto. Sombrio, mas bom.

Um dos pressupostos silenciosos quando você possui seus próprios servidores é que *você* é
responsável por mantê-los funcionando. Se o servidor no seu escritório for derrubado
por um estagiário desastrado, seu site está fora do ar. Se o prédio perder energia, seu site
está fora do ar. Se o disco rígido falhar — e discos rígidos sempre falham mais cedo ou mais tarde — seu
site está fora do ar.

A AWS opera centros de dados. Instalações enormes, gerenciadas profissionalmente, com energia de reserva,
conexões de rede redundantes, segurança física e equipes de engenheiros cujo único
trabalho é manter essas máquinas funcionando. Eles têm fontes de alimentação redundantes. Eles têm
geradores de reserva. Eles têm conexões de rede redundantes de múltiplos provedores.
Eles têm uma segurança física que a maioria dos prédios de escritório não conseguiria nem chegar perto.

Você não está apenas alugando poder computacional. Você está alugando confiabilidade.

"Quanto isso custa?" perguntou Tom.

Chegaremos a isso. Preço é um capítulo próprio, e ele merece isso.

**Três Coisas Que a Nuvem Faz de Forma Diferente**

Vamos tornar isto concreto. Aqui estão as três diferenças centrais entre operar seus
próprios servidores e usar um provedor de nuvem.

**1. Você paga pelo que usa.**

Sem servidor parado ocioso. Sem compra inicial. Se a Nimbus receber zero pedidos numa segunda
de manhã, eles pagam quase nada. Se forem soterrados na véspera de Ano-Novo, a AWS
automaticamente tem a capacidade pronta.

Esse modelo casa custo com valor de uma forma que infraestrutura fixa não consegue. Quando seus
custos acompanham sua receita, o planejamento financeiro fica mais simples.

Há um termo para isso na contabilidade: passar de despesa de capital para despesa operacional. CapEx é uma compra inicial que você deprecia ao longo do tempo — como comprar o Dell PowerEdge. OpEx é uma despesa contínua que você paga conforme usa — como a conta da AWS. Para uma startup com capital limitado e receita incerta, OpEx é dramaticamente preferível. Você não está apostando US$ 16.000 numa previsão de demanda da qual não pode ter certeza.

"Cada dólar que a gente não gasta em hardware," disse Tom, "é um dólar que a gente pode gastar de fato construindo o produto."

Esse não é um ponto trivial. O custo inicial de hardware que Tom tinha calculado — US$ 16.000 para dois servidores de nível de produção — representava o tipo de desembolso de capital que faz investidores fazerem perguntas desconfortáveis e força fundadores a tomar decisões difíceis sobre fôlego de caixa.

**2. Outra pessoa cuida do hardware.**

A AWS mantém as máquinas físicas. Os cabos de rede. As fontes de alimentação.
Os sistemas de refrigeração. A Nimbus não contrata ninguém para fazer isso. Eles se concentram na sua
aplicação, não na infraestrutura por baixo dela.

Vale a pena pausar nisto. A expertise necessária para operar a infraestrutura física de um centro de
dados é real. Sistemas de refrigeração, gestão de energia, cronogramas de substituição de hardware,
redundância de rede — essas são disciplinas distintas. Ao usar a AWS, a Nimbus
ganha acesso a essa expertise sem contratar para isso.

Um administrador de sistemas com as habilidades para manter servidores de produção adequadamente ganha de US$ 80.000 a US$ 130.000 por ano. Uma equipe que consiga lidar com falhas de hardware, segurança em nível de SO, configuração de rede e gestão de armazenamento custa mais. Os serviços da AWS custam uma fração disso — e a expertise operacional vem incluída no serviço.

Este é o argumento das economias de escala que a AWS faz explicitamente. Como a AWS opera infraestrutura para milhares de clientes simultaneamente, o custo por unidade de manter essa expertise é compartilhado entre todos eles. Cada cliente individual ganha acesso a operações de infraestrutura de nível mundial por uma conta que é uma pequena fração do que essas operações custariam se ele as construísse sozinho.

**3. Você pode escalar para cima — e para baixo — instantaneamente.**

Este é o que leva um tempo para apreciar completamente. Com servidores físicos, escalar
para cima significa encomendar novo hardware, esperar semanas pela entrega, configurá-lo. Com a AWS,
escalar para cima significa clicar num botão (ou ter o sistema fazendo isso automaticamente). E quando
você não precisa mais da capacidade extra, você escala de volta para baixo. Você para de pagar.

A parte do "e para baixo" é subvalorizada. Escalar para baixo em hardware físico significa que você
ainda possui o hardware, ainda paga a eletricidade, ainda mantém o sistema. Você só tem
mais do que precisa. Com a nuvem, escalar para baixo é real — os recursos vão embora, e
o custo vai embora com eles.

Leo descreveu isso como "a parte que parece trapaça". Ele tinha passado anos contornando sistemas de capacidade fixa — estimando cuidadosamente quanto servidor precisaria, provisionando de forma conservadora, observando o medidor de capacidade, e às vezes errando nas duas direções. A ideia de que ele podia adicionar um servidor, usá-lo por quatro horas numa sexta-feira à noite, e removê-lo — pagando apenas por essas quatro horas — parecia errada do jeito que coisas boas demais para serem verdade parecem erradas.

Não era bom demais para ser verdade. Era o modelo de negócio. A AWS ganha dinheiro quando você usa a infraestrutura deles. Eles têm todo o incentivo para tornar esse uso o mais sem atrito possível.

Priya tinha ficado quieta durante essa explicação. Ela tinha uma pergunta.

"E se alguém tentar invadir? De quem é esse problema?"

E é aí que fica interessante.

**O Modelo de Responsabilidade Compartilhada**

Este é um dos conceitos mais importantes em toda a AWS. É simples assim que você
entende, mas confunde muita gente — inclusive no exame.

A AWS e você compartilham a responsabilidade pela segurança. Mas cada parte é responsável por
coisas diferentes.

**A AWS é responsável pela segurança *da* nuvem.**

Os centros de dados físicos. O hardware. A infraestrutura de rede. Os hipervisores
que rodam as máquinas virtuais. Se alguém invadir um centro de dados da AWS, esse é
o problema da Amazon. Se um disco físico falhar e corromper dados, esse é o problema da Amazon.
Se a infraestrutura de rede entre zonas de disponibilidade for comprometida, esse é
o problema da Amazon.

**Você é responsável pela segurança *na* nuvem.**

Seus dados. Sua aplicação. As contas de seus usuários e quem tem acesso a quê. As
configurações que você escolhe. Se alguém rouba sua senha e faz login na sua conta AWS,
esse é o seu problema. Se você configura mal um banco de dados para ser acessível publicamente,
esse é o seu problema. Se sua aplicação tem uma vulnerabilidade que permite injeção de SQL,
esse é o seu problema.

Priya assentiu devagar. "Então eles protegem o prédio. Nós protegemos o que está dentro."

"Exatamente," disse Maya.

"Então se o Leo abrir uma porta que não deveria…"

"Continua sendo nosso problema," confirmou Maya, olhando para Leo.

Leo já estava digitando algo no laptop e fingindo não ouvir.

Você pode estar se perguntando: isso significa que a AWS algum dia é responsável por um vazamento de dados? Apenas se o vazamento acontecer no nível físico ou de infraestrutura — um centro de dados comprometido, uma falha de hardware, uma vulnerabilidade no próprio hipervisor. Vazamentos causados por aplicações mal configuradas, senhas fracas ou controles de acesso mal definidos são sempre responsabilidade do cliente, não importa quão grande ou respeitável seja o provedor de nuvem.

**A Analogia do Aeroporto**

Eis uma segunda maneira de pensar sobre o Modelo de Responsabilidade Compartilhada, porque ela aparece o suficiente no exame para valer dois ângulos.

Imagine um aeroporto.

O operador do aeroporto protege as instalações — as pistas, os terminais, as cercas, os pontos de inspeção de segurança, o que acontece quando alguém não autorizado é encontrado perto do depósito de combustível.

Mas uma vez lá dentro, cada companhia aérea é responsável por suas próprias operações: sua própria manutenção de aeronaves, seus próprios procedimentos de tripulação, suas próprias listas de passageiros. Se uma companhia aérea perde a bagagem de um passageiro ou um piloto pula um checklist, a culpa não é do aeroporto. As instalações foram protegidas. A companhia aérea operando dentro delas fez uma escolha ruim.

A AWS é o aeroporto. Você é a companhia aérea operando dentro dele. A AWS protege a estrutura física e a infraestrutura central. Você protege seus dados, seus controles de acesso e as decisões da sua aplicação.

Essa analogia importa porque esclarece onde fica a linha quando as coisas dão errado. "Estamos na AWS, então o problema é deles" é sempre a resposta errada no exame, e quase sempre a resposta errada no mundo real.

**O Tipo de Serviço Importa**

Há mais uma sutileza que vale a pena conhecer agora, mesmo que vamos revisitá-la ao longo do livro.

A divisão de responsabilidade muda dependendo de quão gerenciado é um serviço.

Para o EC2 — as máquinas virtuais que você controla — você é responsável por aplicar patches no sistema operacional. A AWS fornece a máquina física e o hipervisor. Tudo acima do SO é seu.

Para o RDS — o serviço de banco de dados gerenciado que cobrimos no Capítulo 8 — a AWS aplica patches no próprio motor do banco de dados. Você não gerencia o SO. Sua responsabilidade se reduz à configuração do banco de dados, aos dados dentro dele e a quem tem acesso.

Para o S3 — o serviço de armazenamento de arquivos — a AWS gerencia a infraestrutura por completo. Sua responsabilidade é o controle de acesso (quem pode ler e escrever nos seus buckets) e os próprios dados.

Quanto mais gerenciado o serviço, mais responsabilidade muda para a AWS. Este é um padrão-chave de exame: quando uma questão pergunta quem é responsável por algo, pergunte primeiro "quão gerenciado é este serviço?".

**Se Nuvem Então Conveniência Mas Não Controle**

O modelo da nuvem oferece vantagens reais: nenhum hardware para gerenciar, custo elástico, escala instantânea. Mas significa abrir mão de algo, também.

Se você move sua infraestrutura para a nuvem, então você ganha flexibilidade e reduz custos de capital iniciais — mas abre mão do controle total sobre as máquinas subjacentes. Você não pode inspecioná-las fisicamente. Você não pode garantir onde dentro de um centro de dados elas ficam. Você depende do uptime da AWS, das janelas de manutenção da AWS e da resposta a incidentes da AWS quando algo dá errado no nível da infraestrutura. Para a maioria das equipes, essa é uma excelente troca. Para alguns setores regulados, ela exige documentação cuidadosa e as certificações de conformidade da AWS. Saiba o que você está trocando antes de trocar.

## Pontos Fortes e Limitações

Nenhuma ferramenta é perfeita. Vamos ser honestos sobre os dois lados.

**Por que a nuvem é excelente**:

- Sem custos iniciais de hardware
- Pague apenas pelo que usa
- Escala instantaneamente em ambas as direções
- Confiabilidade profissional e segurança física
- Acesso a centenas de serviços gerenciados (bancos de dados, filas, machine learning, e muito mais)
  sem ter que construí-los ou mantê-los você mesmo
- Alcance global: implantar em uma nova geografia é uma mudança de configuração, não um processo de
  aquisição de hardware

**Onde fica complicado**:

- Os custos podem ser imprevisíveis se você não estiver prestando atenção (o futuro pesadelo de Tom)
- Você depende de um terceiro para a sua infraestrutura — se a AWS tiver uma interrupção na sua
  região, seu serviço é afetado também
- Há uma curva de aprendizado. A AWS tem centenas de serviços. Saber qual usar
  exige experiência, ou um livro como este.
- Dados saindo da nuvem podem ser caros. Mover grandes quantidades de dados para fora da AWS
  custa dinheiro. (Vamos revisitar isso no Capítulo 30.)
- O aprisionamento a fornecedor (vendor lock-in) é real para serviços de nível mais alto. Usar um banco de dados
  gerenciado da AWS é fácil de começar e mais difícil de abandonar. Quanto mais serviços específicos da AWS você usa,
  mais comprometido você está com o ecossistema e os preços da AWS.

"Então estamos trocando controle por conveniência," disse Tom.

"E trocando custo inicial por custo contínuo," acrescentou Maya.

"E trocando o problema de outra pessoa pelo nosso próprio problema, do lado da segurança," disse Priya.

"Mas também estamos trocando o servidor quebrado do Leo pelo servidor muito-não-quebrado da Amazon," disse Leo,
que aparentemente tinha estado ouvindo o tempo todo.

Ele não estava completamente errado.

Tom tinha mais uma preocupação.

"Se a gente construir tudo na AWS e a AWS aumentar os preços daqui a três anos, a gente não pode exatamente
mover nosso banco de dados para o quartinho dos fundos do restaurante."

"Verdade," disse Maya. "Mas a trajetória de preços da Amazon tem sido geralmente para baixo — eles
cortaram preços mais de 100 vezes desde 2006. O risco de lock-in é real, mas o risco
histórico de aumentos surpresa de preço é baixo."

"Geralmente," disse Tom. Ele anotou. Ele revisitaria esse cálculo, como
revisitava todos os seus cálculos, num futuro sábado de manhã com uma caneta vermelha e um café.

**Quando On-Premises É a Escolha Certa**

A nuvem vence a comparação da Nimbus claramente. Mas a honestidade intelectual exige dizer quando ela não vence.

**Grandes empresas com cargas de trabalho estáveis e previsíveis** às vezes descobrem que possuir hardware se torna competitivo em custo com alugar uma vez que a utilização é consistentemente alta. Se você está rodando milhares de servidores a 80% de utilização o tempo todo, a economia da propriedade tem uma aparência diferente da que tem para uma startup com tráfego variável. O modelo de pagamento por uso da nuvem é mais vantajoso quando a utilização é variável. Quando a utilização é estável e alta, a economia por unidade da propriedade pode ser competitiva. É por isso que algumas grandes corporações rodam arquiteturas híbridas: nuvem para cargas de trabalho variáveis, on-premises para as estáveis.

**Ambientes de dados regulados com requisitos rígidos de localidade** podem não ter opção a não ser on-premises. Ambientes de computação classificada do governo — sistemas que lidam com informação sigilosa de segurança nacional — não podem usar provedores de nuvem comerciais. Os dados não podem deixar uma instalação fisicamente controlada. Sistemas financeiros em certas jurisdições têm requisitos semelhantes. Organizações de saúde processando certas categorias de dados podem enfrentar requisitos que as certificações de nuvem comerciais não satisfazem totalmente. Nessas situações, on-premises não é uma preferência; é uma obrigação.

**Latência extremamente baixa, requisitos de proximidade física** criam uma terceira categoria. Alguns sistemas de negociação financeira precisam de latência inferior a um milissegundo entre sua aplicação e o motor de correspondência da bolsa. A colocation no mesmo centro de dados físico que a bolsa — com conexões de fibra diretas — atinge latências que nenhuma região de nuvem conseguiria igualar. Alguns instrumentos científicos — aceleradores de partículas, redes sísmicas, radiotelescópios — geram dados que devem ser processados localmente antes que a transmissão seja viável. Esses são casos de uso reais que exigem proximidade física ao hardware.

**Contratos de longo prazo existentes** são a restrição mais mundana, mas frequentemente mais relevante. Uma empresa que assinou um arrendamento de centro de dados de cinco anos em 2022 tem uma obrigação contratual. Mover-se para a nuvem antes do arrendamento expirar tem um custo real — os pagamentos restantes do arrendamento — que muda a economia de forma significativa. Decisões arquiteturais não acontecem no vácuo. Elas acontecem em organizações com contratos existentes, cronogramas de depreciação de hardware existentes e expertise de equipe existente.

"Alguma dessas é a gente?" perguntou Maya.

"Não," disse Tom. "A gente não tem hardware. Sem contratos. Sem obrigações regulatórias. E uma equipe sem experiência em administração de servidores."

"Então, nuvem seja."

"Nuvem seja. Mas saber quando ela não é a resposta é parte de saber o que você está fazendo."

Nenhuma das exceções de on-premises se aplica à Nimbus. Mas elas são reais, e um bom arquiteto de nuvem sabe quando dizer "a nuvem não é a resposta certa aqui". O objetivo não é ser um defensor da nuvem. O objetivo é estar certo.

## Resumo

A pergunta que Tom não conseguia tirar da cabeça — por que alugar é mais barato do que possuir? — acabou tendo uma resposta simples e uma complicada. A resposta simples é utilização: você para de pagar por capacidade que fica ociosa em terças-feiras calmas. A resposta complicada envolve o Modelo de Responsabilidade Compartilhada, o trade-off entre CapEx e OpEx, e algumas situações honestas em que a nuvem é de fato a escolha errada. Tom estava certo em fazer a pergunta. A resposta mudou como a equipe pensou sobre tudo o que se seguiu.

- O benefício central é o escalonamento com pagamento conforme o uso: você paga apenas pelo que usa, e pode escalar para cima ou para baixo conforme necessário.
- A comparação de custos de Tom mostrou a economia do hardware com clareza: US$ 720/ano para duas instâncias EC2 vs. US$ 8.000–US$ 12.000/ano para hardware físico equivalente, antes dos custos de manutenção.
- A AWS cuida da infraestrutura física. Você cuida da sua aplicação, dos seus dados e das suas configurações. Essa divisão se chama **Modelo de Responsabilidade Compartilhada**.
- O Modelo de Responsabilidade Compartilhada muda dependendo do tipo de serviço — serviços mais gerenciados significam mais responsabilidade da AWS.
- A nuvem nem sempre é mais barata ou mais simples — mas ela remove as barreiras para começar, e torna o escalonamento possível de formas que servidores físicos não conseguem igualar.

## Dicas de Exame

*Domínio SAA-C03: Transversal — Fundamentos de conceitos de nuvem*

- O **Modelo de Responsabilidade Compartilhada** aparece regularmente no exame. Lembre-se: a AWS
  é responsável pela segurança *da* nuvem (hardware, centros de dados, rede global).
  Você é responsável pela segurança *na* nuvem (dados, identidades, configuração da aplicação).
- **Nuance crítica**: a divisão muda dependendo do tipo de serviço. Para EC2
  (uma máquina virtual que você controla), *você* aplica os patches no sistema operacional. Para RDS (um
  banco de dados gerenciado), a AWS aplica os patches no motor do banco de dados. Quanto mais "gerenciado" for um serviço,
  mais responsabilidade se move para a AWS. Cenários de exame descreverão um incidente
  e perguntarão quem é responsável — sempre pergunte "quão gerenciado é este serviço?".
- Questões sobre *benefícios* da nuvem frequentemente testam CapEx vs. OpEx. Hardware on-premises
  é despesa de capital (CapEx — compre uma vez, deprecie ao longo do tempo). A nuvem é
  despesa operacional (OpEx — pague mensalmente). A AWS transfere custos de CapEx para OpEx.
- "Elasticidade" — a capacidade de escalar para cima *e para baixo* automaticamente — é um benefício central
  da nuvem. Você pode vê-la pareada com "escalabilidade" no exame. Elasticidade significa
  escalonamento automático, orientado pela demanda, em ambas as direções. Escalabilidade significa que o sistema
  *pode* crescer, mas não necessariamente encolhe automaticamente.
- O exame pode descrever um cenário em que uma empresa está migrando de "comprar servidores" para "nuvem". O enquadramento correto: migrar de CapEx para OpEx, eliminar custos iniciais, ganhar elasticidade e transferir a responsabilidade pela infraestrutura para o provedor de nuvem.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: explique o Modelo de Responsabilidade Compartilhada. Quem é responsável pelo quê,
e por que essa distinção importa?

*(Dica: Pense na analogia de Priya — quem protege o prédio, e quem protege o que está
dentro dele.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa está migrando sua aplicação web de um centro de dados on-premises
para a AWS. A equipe de segurança está preocupada em manter a conformidade com suas políticas de
proteção de dados. Um novo engenheiro pergunta: "Agora que estamos na AWS, a Amazon cuida
de todos os nossos requisitos de segurança?"

Qual das alternativas a seguir MELHOR descreve como as responsabilidades de segurança são divididas?

A) A AWS é totalmente responsável por toda a segurança assim que a aplicação está hospedada na nuvem  
B) O cliente é totalmente responsável por toda a segurança, incluindo a segurança física do centro de dados  
C) A AWS gerencia a segurança da infraestrutura subjacente; o cliente gerencia a segurança dos seus dados, aplicações e configurações  
D) As responsabilidades de segurança são negociadas por conta e dependem do nível de serviço do cliente

**Dica 1**: Pense no que a AWS controla fisicamente versus o que você controla.

**Dica 2**: A AWS é dona dos centros de dados. Você escolheu o que colocar neles e como configurar
sua aplicação.

**Dica 3**: Introduzimos um nome específico para essa divisão de responsabilidades neste
capítulo.

**Resposta**: C

**Explicação**: O Modelo de Responsabilidade Compartilhada da AWS divide a segurança em dois domínios.
A AWS protege a infraestrutura física — centros de dados, hardware e redes.
O cliente protege tudo o que implanta sobre ela: seus dados, seus controles de
acesso, as configurações da sua aplicação e suas definições de rede.

**Por que não A?** A AWS nunca assume total responsabilidade pela segurança da aplicação do cliente.
No momento em que você configura algo, essa configuração é sua para gerenciar.

**Por que não B?** Os clientes não são responsáveis pela segurança física do centro de dados —
essa é precisamente uma das vantagens de usar a AWS.

**Por que não D?** O Modelo de Responsabilidade Compartilhada é uma estrutura fixa, não um
acordo negociado.

*Domínio SAA-C03: Transversal — Conceitos de nuvem / Responsabilidade Compartilhada*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

Um amigo está lançando um novo aplicativo e pede sua opinião. Ele está decidindo entre
comprar dois servidores físicos (um para o aplicativo, um para o banco de dados) ou usar um provedor
de nuvem. O tráfego projetado dele é de 10 a 100 usuários por dia, mas ele tem um evento de lançamento
daqui a três meses que pode trazer 10.000 usuários em um único dia.

Percorra os trade-offs. Qual opção você recomendaria, e qual é o principal
motivo? Do que você abriria mão com a sua escolha?

*(Não há uma única resposta correta. O objetivo é praticar o raciocínio em trade-offs.)*

## Cena Pós-Créditos

Três dias depois, a Nimbus tinha uma conta AWS.

Leo a tinha criado às 23h usando seu endereço de e-mail pessoal, um cartão de crédito que teve que
pedir emprestado ao Tom, e um entusiasmo que era, em retrospecto, ligeiramente alarmante.

"Encontrei uma coisa chamada EC2," disse ele na manhã seguinte, mostrando a tela do laptop.
"É tipo um computador que você aluga. Acho que iniciei um."

"Você *acha*?" perguntou Priya.

"Quer dizer, definitivamente iniciei um." Ele rolou a tela para baixo. "Só não sei onde ele está."

Maya se inclinou e olhou para a tela.

"Leo," disse ela. "Por que está escrito 'Região: ap-southeast-1'?"

"O que isso significa?"

"Espera — mas *por que* a gente estaria em Singapura?" disse Maya. "Todos os nossos clientes estão na Costa Oeste."

No próximo capítulo: a geografia da AWS — onde os servidores realmente estão, e por que isso importa.
