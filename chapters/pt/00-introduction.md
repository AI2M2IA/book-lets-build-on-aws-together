# Capítulo 0: Antes de Começar

Maya estava atrás do balcão do restaurante da sua família numa sexta-feira à noite quando
o pensamento a atingiu.

Estavam abertos há quatro anos. A comida era boa — as pessoas atravessavam a cidade para
comer as arepas. Mas sempre que alguém ligava para fazer uma encomenda, a linha estava ocupada. Sempre
que alguém ia lá buscar comida que nunca tinha chegado a encomendar, era porque
tinha ligado e desistido.

Encomendas estavam a ser perdidas. Dinheiro saía pela porta antes de entrar.

E a pior parte era que ninguém conseguia apontar para uma falha dramática em concreto.

Nada tinha explodido. Nada tinha caído. Não havia nenhum vilão, nenhuma mensagem de avaria, nenhum
ecrã partido à vista.

Era apenas fricção. Pequena, silenciosa e cara.

"Precisamos de um website," disse Maya, para ninguém em particular.

O seu primo Tom levantou os olhos da folha de cálculo que estava a actualizar à mão. Tom tinha estado
a gerir os "sistemas" do restaurante — uma palavra generosa para uma folha Google partilhada e um
quadro branco — durante os últimos dois anos.

"Um website," repetiu ele. "E onde é que um website vive exactamente?"

Maya abriu a boca. Fechou-a.

Ela não fazia ideia.

**Uma Pergunta Que Parece Simples**

Onde é que um website vive?

Provavelmente nunca pensou nisso. A maioria das pessoas não pensa. Escreve um endereço no
browser, aparece uma página, e algures entre esses dois momentos, acontece magia.

Até ao dia em que é você a pagar pela magia.

Mas não é magia. São computadores.

Algures no mundo, neste momento, existe um computador físico — um servidor — que está
a guardar os ficheiros que compõem esse website. Quando pede ao browser a página,
o seu pedido viaja pela internet, chega a esse computador, e o computador envia
os ficheiros de volta para si.

É isso. É isso que é um website.

A pergunta real é: o computador de *quem*?

**Três Opções, Um Problema**

De volta ao restaurante, Maya e Tom esboçaram as opções no quadro branco.

**Opção um**: Comprar um computador, instalá-lo no restaurante e correr o website a partir
dali. (No sector, isto chama-se funcionar "on-premises" — o seu próprio edifício,
as suas próprias máquinas. Vai ver este termo constantemente.)

Tom escreveu "factura de electricidade" e "o que acontece se avariar" ao lado desta opção.

**Opção dois**: Pagar a uma empresa de hosting para correr um pequeno servidor por eles. Barato, simples.
Funcionava para blogs pessoais em 2008. Provavelmente não seria suficientemente flexível para um negócio em crescimento.

"E se de repente recebermos mil encomendas ao mesmo tempo?" perguntou Maya.

Tom acrescentou "não escala" à opção dois.

**Opção três**: Outra coisa. Algo de que tinham estado a ouvir falar. Algo chamado
"a nuvem".

Tom desenhou uma nuvem no quadro. Uma nuvem literal, como o desenho de uma criança.

"Na verdade não sei o que isso significa," admitiu ele.

"Eu também não," disse Maya.

Foi esse o início de tudo.

**O Que É Realmente "A Nuvem"**

Vamos esclarecer isto imediatamente, porque a palavra "nuvem" é um dos termos mais usados
e menos explicados em tecnologia.

A nuvem não é um lugar mágico onde os seus dados flutuam.

A nuvem são os computadores de outras pessoas.

É isso. Quando guarda uma foto no iCloud ou no Google Drive, a sua foto está guardada num
computador físico pertencente à Apple ou ao Google, situado num edifício algures. Quando
usa a Netflix, o vídeo que está a ver é enviado de servidores físicos em centros de
dados por todo o mundo.

A "nuvem" significa apenas: computadores a que acede pela internet, que não
tem de possuir ou manter você mesmo.

E a Amazon — sim, a empresa que entrega encomendas — construiu uma das maiores
colecções destes computadores no mundo. Chamam-lhe Amazon Web Services, ou AWS.

**Porquê a Amazon?**

É uma pergunta justa. A Amazon começou como uma livraria.

Eis o que aconteceu: a Amazon cresceu tão depressa que precisou de uma enorme quantidade de
poder de computação para gerir os seus próprios sistemas. Construiu centros de dados. Contratou engenheiros
para os gerir. Ficou muito, muito boa a correr computadores em escala.

Depois alguém na Amazon teve uma ideia: e se vendêssemos o acesso a todo este poder de computação
a outras pessoas?

Em 2006, a Amazon Web Services foi lançada. Hoje, a AWS corre uma parte significativa da
internet. O website que usa para reservar voos, a aplicação que rastreia a sua entrega, o
serviço de streaming que viu ontem à noite — há uma boa probabilidade de pelo menos parte
correr na AWS.

Não é um monopólio. O Google Cloud e o Microsoft Azure são concorrentes sérios. Mas a AWS
foi a primeira, é grande, e é sobre ela que este livro trata.

**Conhecer a Equipa**

Maya não construiu Nimbus sozinha.

Ligou primeiro ao Tom — obviamente. Tom tinha as folhas de cálculo, os contactos de fornecedores e
a teimosia necessária para realmente executar uma ideia.

Tom conhecia um programador. Leo. Vinte e quatro anos, autodidata, o tipo de pessoa que
já construiu um protótipo antes de você ter acabado de explicar o problema. Chegou
à primeira reunião com um portátil e uma aplicação a meio.

"Já comecei," disse ele, abrindo o ecrã. "Acho que a implantei algures."

Tinha. Num servidor que não compreendia totalmente, numa região que não tinha escolhido
intencionalmente, a correr código que definitivamente quebraria sob carga.

Gostaram dele imediatamente.

Priya chegou mais tarde — indicada por um amigo em comum. Licenciatura em engenharia, especialização em segurança,
o tipo de pessoa que lê post-mortems de falhas tecnológicas famosas nas noites de fim-de-semana.
Tinha uma pergunta na primeira reunião.

"Alguém pensou no que acontece se alguém tentar entrar?"

Silêncio.

"Bem-vinda à equipa," disse Maya.

**O Que É Este Livro**

Esta é a história de Nimbus.

Nimbus começou como um sistema de encomendas de restaurante e tornou-se algo muito maior. À medida que
crescia, deparou-se com todos os problemas que o software em crescimento enfrenta: sistemas que não conseguiam
lidar com o tráfego, dados que se perdiam, servidores que caíam nos piores momentos possíveis, custos que cresciam mais depressa do que as receitas.

E cada vez que encontravam um problema, descobriam um serviço AWS concebido para resolver exactamente
esse tipo de problema.

Este livro ensina-lhe AWS acompanhando essa jornada.

Aprenderá não apenas *o que* cada serviço faz, mas *porquê* existe, *quando* usá-lo,
e — igualmente importante — *quando não usá-lo*. Cada ferramenta tem compromissos. Cada
decisão tem custos. É isso que os engenheiros sénior entendem e que os engenheiros júnior ainda estão
a aprender.

Quando terminar este livro, estará preparado para fazer o exame AWS Solutions Architect
Associate (SAA-C03). Mais do que isso: estará preparado para entrar numa conversa técnica real e segurar a sua posição.

Essa é a promessa.

**Algumas Coisas Antes de Começar**

**Este livro assume que sabe quase nada sobre computação em nuvem.** Se já ouviu
falar de AWS mas nunca a usou, está no lugar certo. Se nunca ouviu falar de AWS em
absoluto, também está no lugar certo.

**Este livro não assume que é programador.** Maya não é. Tom mal é. Não
precisa de escrever código para compreender arquitectura. Precisa de compreender problemas
e soluções.

**Este livro por vezes estará errado de propósito.** A equipa vai cometer erros. Vai
escolher o serviço errado. Vai saltar um passo de segurança que lamentará. Vai
sobreaprovisionar e subprovisionr. É assim que aprenderão, e é assim que você também aprenderá.

**As dicas de exame são reais.** O SAA-C03 é um exame real. As questões baseadas em cenários
no final de cada capítulo são concebidas para parecer o exame real. Se conseguir respondê-las,
está no bom caminho.

E mais uma coisa.

Leia este livro com um lápis, ou uma aplicação de notas, ou uma lista corrente de momentos "acho que a resposta é...".

Faça uma pausa antes de a equipa decidir alguma coisa. Tome a decisão você mesmo. Depois continue a ler e
veja se teria tomado o mesmo compromisso.

## Resumo

- **A nuvem** é o acesso a pedido a recursos de computação pela internet — os computadores de outras pessoas que não precisa de possuir ou manter.
- As três opções de hosting: on-premises (o seu hardware, os seus custos), hosting partilhado (limitado, não escala), nuvem (pagamento conforme o uso, escala com a procura).
- A **AWS** foi lançada em 2006 quando a Amazon abriu a sua infraestrutura de centros de dados a clientes externos. Continua a ser o maior fornecedor de nuvem, seguido pelo Microsoft Azure e pelo Google Cloud.
- Nimbus — a história que este livro acompanha — começa como um sistema de encomendas de restaurante e cresce até se tornar uma arquitectura cloud de nível de produção.
- Este livro ensina não apenas *o que* cada serviço AWS faz, mas *porquê* existe, *quando* usá-lo e *quando não usá-lo*.

## Dicas de Exame

*Domínio SAA-C03: Transversal — Fundamentos de conceitos de nuvem*

- **A nuvem no exame** significa computação a pedido, com pagamento conforme o uso, pela internet. É um modelo de entrega, não uma tecnologia.
- **CapEx vs. OpEx**: A infraestrutura on-premises é despesa de capital (CapEx — compra de hardware antecipada). A nuvem é despesa operacional (OpEx — taxas de utilização recorrentes). Cenários de exame que perguntam sobre "eliminar custos antecipados" ou "passar de CapEx para OpEx" apontam para a adopção da nuvem.
- **Benefícios da nuvem**: Sem hardware antecipado, escalonamento elástico, pague apenas pelo que usa, sem gestão de infraestrutura física. Cenários com "tráfego imprevisível" ou "equipa pequena, sem experiência em hardware" são sinais fortes para a nuvem.
- **AWS não é a única nuvem** — Azure e GCP são concorrentes reais — mas o exame SAA-C03 é específico para AWS. Não será questionado sobre comparações entre fornecedores.

## Pontos Fortes e Limitações

**Pontos fortes desta abordagem**: Aprender através de uma narrativa contínua dá contexto aos conceitos antes de receberem nomes. Quando chegar ao IAM ou ao RDS, já terá sentido o problema que resolvem — porque Nimbus o sentiu primeiro. Isto torna a retenção mais elevada e o raciocínio sobre compromissos mais natural do que memorizar listas de funcionalidades.

**Limitações a ter em conta**: Este livro abrange o currículo AWS SAA-C03 Solutions Architect Associate. É um âmbito substancial, mas não cobre todos os serviços AWS — e as arquitecturas de produção envolvem sempre serviços e restrições específicas para o seu sector e escala. A história de Nimbus é fictícia; as startups reais tomam decisões mais confusas por razões mais confusas. Use este livro para construir o raciocínio, não para copiar a arquitectura.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: o que é "a nuvem" e por que razão uma pequena empresa a escolheria em vez de comprar os seus próprios servidores?

*(Sugestão: Pense no que Maya e Tom escreveram ao lado da Opção 1 no quadro branco.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma pequena startup está a lançar uma aplicação de entrega de comida. Esperam tráfego reduzido inicialmente, mas antecipam crescimento rápido se o produto tiver sucesso. A equipa fundadora não tem experiência na gestão de servidores físicos. Querem minimizar os custos iniciais e evitar o ónus operacional de manter hardware.

Qual das seguintes abordagens MELHOR satisfaz os seus requisitos?

A) Adquirir um servidor dedicado e alojar a aplicação no seu escritório  
B) Utilizar um fornecedor de nuvem para alojar a aplicação e pagar apenas pelo que usa  
C) Fazer parceria com um centro de dados de co-localização para instalar os seus próprios servidores  
D) Construir a aplicação para funcionar completamente offline sem infraestrutura de internet

**Sugestão 1**: Pense no que a startup precisa de *evitar* tanto quanto no que precisa de ter.

**Sugestão 2**: O cenário menciona especificamente "sem experiência a gerir hardware" e "minimizar custos iniciais". Qual opção elimina essas preocupações?

**Sugestão 3**: Descrevemos esta opção neste capítulo como pagar pelos "computadores de outras pessoas".

**Resposta**: B

**Explicação**: Fornecedores de nuvem como a AWS oferecem preços com pagamento conforme o uso sem custos iniciais de hardware, e tratam de toda a manutenção da infraestrutura física. Este é exactamente o modelo que faz sentido para uma startup com tráfego incerto e sem experiência em hardware — tal como Nimbus.

**Por que não A?** Adquirir um servidor dedicado requer capital antecipado, manutenção contínua e não oferece capacidade de escalonamento integrada à medida que o tráfego cresce.

**Por que não C?** A co-localização resolve o problema de espaço, mas a startup ainda tem de comprar, manter e gerir os seus próprios servidores.

**Por que não D?** Uma aplicação de entrega de comida requer conectividade à internet por definição.

*Domínio SAA-C03: Transversal — Fundamentos de conceitos de nuvem*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Maya quer convencer o seu tio (proprietário do restaurante) a deixá-la construir um sistema de encomendas baseado na nuvem. Ele é céptico: "Por que razão pagaríamos à Amazon todos os meses quando poderíamos simplesmente comprar um computador uma vez?"

Como explicaria os compromissos? O que diria serem as maiores vantagens da abordagem cloud para um restaurante? E qual seria o único cenário em que comprar o seu próprio computador poderia de facto fazer mais sentido?

*(Não existe uma resposta única correcta. O objectivo é praticar o raciocínio sobre compromissos.)*

## Cena Pós-Créditos

Naquela noite, depois de todos os outros terem ido embora, Maya ficou sozinha no restaurante
com o seu portátil.

Tinha encontrado o website da AWS. Tinha clicado por algumas páginas. Estavam listados centenas de
serviços. Centenas.

Percorreu a página. E mais. E mais.

Depois fechou o portátil.

"Vamos precisar de um plano," disse ela para a sala vazia.

No próximo capítulo: por que as empresas pararam de comprar servidores e começaram a alugá-los — e o que isso mudou.
