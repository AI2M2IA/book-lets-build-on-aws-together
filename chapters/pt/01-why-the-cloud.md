# Capítulo 1: Por Que Alugar Quando Se Pode Possuir?

Tom tinha estado a sentar-se sobre a pergunta desde a noite anterior. Tinha-a escrito no caderno, depois riscado, depois voltado a escrever.

Quando Leo e Priya chegaram na manhã seguinte — café na mão, a discutir sobre algo não relacionado — Tom já estava ao pé do quadro branco. A terceira opção continuava lá, intacta. Uma forma de nuvem, desenhada por alguém que tinha admitido não saber o que significava.

"Preciso que alguém me explique uma coisa," disse Tom, sem se virar. "Se alugamos computadores à Amazon em vez de comprar os nossos — por que razão seria isso *mais barato*?"

A sala ficou em silêncio. Era o tipo de pergunta que parece simples e não é.

"Porque," começou Leo.

"Não," disse Tom. "Quero perceber. Não apenas ouvir a resposta. Por que razão é alugar mais barato do que possuir?"

**O Problema Óbvio de Possuir Servidores**

Imagine que decide abrir um restaurante. Não do género Nimbus — um restaurante normal.

Antes de entrar o primeiro cliente, precisa de mesas. Cadeiras. Uma cozinha. Um fogão.
Pratos. Pessoal. Precisa de tudo isto no primeiro dia, mesmo que a primeira semana seja calma, mesmo
que passe três meses com seis clientes por dia antes de a notícia se espalhar.

Os servidores físicos funcionam da mesma forma.

Se Nimbus comprar os seus próprios servidores, tem de os comprar para o pico que espera.
A sexta-feira à noite mais movimentada que consiga imaginar. O momento viral em que um blogue de comida
escreve sobre as arepas e dez mil pessoas tentam fazer uma encomenda de uma vez.

Mas na maior parte do tempo, não é assim tão movimentado. Na maior parte do tempo, esses servidores ficam lá,
a consumir electricidade, a fazer quase nada.

"Estaríamos a pagar por capacidade que não estamos a usar," disse Maya.

"Exactamente," disse Tom, o que surpreendeu toda a gente porque era ele que tinha feito
a pergunta.

**O Modelo de Aluguer**

Eis o que torna a computação em nuvem diferente.

Quando usa AWS, não compra servidores. Aluga poder de computação, e paga apenas
pelo que usa. É mais parecido com alugar um espaço do que com possuir um edifício de restaurante.

Pense desta forma.

Se precisar de organizar uma festa de aniversário para cinquenta pessoas, podia comprar uma casa grande
o suficiente para cinquenta pessoas com as suas mesas e cadeiras. Ou poderia alugar um espaço
por quatro horas no sábado, pagar exactamente pelo espaço e tempo que precisa, e devolver
as chaves quando a festa terminar.

O espaço continua lá quando precisar. Está disponível novamente quando surgir algo.
Não teve de contratar um gestor de edifícios. Não pagou impostos sobre o imóvel
durante o ano inteiro.

Esse é o modelo da nuvem. A AWS tem os "espaços". Você aparece quando precisa.

**Mas Espere — Há Mais**

"Está bem," disse Leo, "mas e se o meu espaço pegar fogo?"

Bom instinto. Sombrio, mas bom.

Um dos pressupostos silenciosos quando possui os seus próprios servidores é que *você* é
responsável por os manter a funcionar. Se o servidor no seu escritório for derrubado
por um estagiário descuidado, o seu website fica inoperacional. Se o edifício perder energia, o seu website
fica inoperacional. Se o disco rígido falhar — e os discos rígidos falham sempre eventualmente — o seu
website fica inoperacional.

A AWS opera centros de dados. Instalações enormes, geridas profissionalmente, com energia de reserva,
conexões de rede redundantes, segurança física e equipas de engenheiros cujo único
trabalho é manter essas máquinas a funcionar.

Não está apenas a alugar poder de computação. Está a alugar fiabilidade.

"Quanto custa isso?" perguntou Tom.

Chegaremos a isso. Muitos capítulos mais adiante, quando os olhos de Tom não se fechem.

**Três Coisas Que a Nuvem Faz de Forma Diferente**

Vamos tornar isto concreto. Aqui estão as três diferenças centrais entre correr os seus
próprios servidores e usar um fornecedor de nuvem.

**1. Paga pelo que usa.**

Sem servidor parado. Sem compra antecipada. Se Nimbus não receber encomendas numa
manhã de segunda-feira, paga quase nada. Se forem inundados na véspera do Ano Novo, a AWS
tem automaticamente a capacidade preparada.

**2. Outra pessoa trata do hardware.**

A AWS mantém as máquinas físicas. Os cabos de rede. As fontes de alimentação.
Os sistemas de arrefecimento. Nimbus não contrata ninguém para fazer isto. Concentram-se na sua
aplicação, não na infraestrutura por baixo.

**3. Pode escalar para cima — e para baixo — instantaneamente.**

Este é o que demora algum tempo a apreciar completamente. Com servidores físicos, escalar
para cima significa encomendar novo hardware, esperar semanas pela entrega, configurá-lo. Com a AWS,
escalar para cima significa clicar num botão (ou ter o sistema a fazê-lo automaticamente). E quando
já não precisa da capacidade extra, escala para baixo. Pára de pagar.

Priya tinha estado calada durante esta explicação. Tinha uma pergunta.

"E a segurança? Quem é responsável por manter os dados seguros?"

E é aí que fica interessante.

**O Modelo de Responsabilidade Partilhada**

Este é um dos conceitos mais importantes em toda a AWS. É simples quando se percebe, mas engana muita gente — incluindo no exame.

A AWS e você partilham a responsabilidade pela segurança. Mas cada parte é responsável por
coisas diferentes.

**A AWS é responsável pela segurança *da* nuvem.**

Os centros de dados físicos. O hardware. A infraestrutura de rede. Os hipervisores
que correm as máquinas virtuais. Se alguém entrar num centro de dados da AWS, esse é
o problema da Amazon.

**Você é responsável pela segurança *na* nuvem.**

Os seus dados. A sua aplicação. As contas dos seus utilizadores e quem tem acesso ao quê. As
configurações que escolhe. Se alguém rouba a sua palavra-passe e faz login na sua conta AWS,
esse é o seu problema.

Priya acenou devagar. "Então eles protegem o edifício. Nós protegemos o que está dentro."

"Exactamente," disse Maya.

"Portanto, se Leo abrir uma porta que não deveria..."

"Continua a ser o nosso problema," confirmou Maya, olhando para Leo.

Leo já estava a escrever algo no seu portátil e a fingir que não ouvia.

## Pontos Fortes e Limitações

Nenhuma ferramenta é perfeita. Vamos ser honestos sobre ambos os lados.

**Por que razão a nuvem é excelente**:

- Sem custos iniciais de hardware
- Pague apenas pelo que usa
- Escala instantaneamente em ambas as direcções
- Fiabilidade profissional e segurança física
- Acesso a centenas de serviços geridos (bases de dados, filas, aprendizagem automática, e muito mais)
  sem ter de os construir ou manter você mesmo

**Onde fica complicado**:

- Os custos podem ser imprevisíveis se não estiver a prestar atenção (o futuro pesadelo de Tom)
- Depende de um terceiro para a sua infraestrutura — se a AWS tiver uma paragem na sua
  região, o seu serviço também é afectado
- Há uma curva de aprendizagem. A AWS tem centenas de serviços. Saber qual usar
  requer experiência, ou um livro como este.
- Os dados que saem da nuvem podem ser caros. Mover grandes quantidades de dados para fora da AWS
  custa dinheiro. (Voltaremos a isto no Capítulo 30.)

"Portanto estamos a trocar controlo por conveniência," disse Tom.

"E a trocar custo antecipado por custo contínuo," acrescentou Maya.

"E a trocar o problema de outra pessoa pelo nosso próprio problema, do lado da segurança," disse Priya.

"Mas também estamos a trocar o servidor avariado do Leo pelo servidor muito-não-avariado da Amazon," disse Leo,
que aparentemente tinha estado a ouvir o tempo todo.

Ele não estava completamente errado.

## Resumo

- A nuvem é poder de computação que aluga em vez de possuir.
- A AWS é o maior fornecedor de nuvem do mundo.
- O benefício central é o escalonamento com pagamento conforme o uso: paga apenas pelo que usa, e pode
  escalar para cima ou para baixo conforme necessário.
- A AWS trata da infraestrutura física. Você trata da sua aplicação, dos seus dados
  e das suas configurações. Esta divisão chama-se **Modelo de Responsabilidade Partilhada**.
- A nuvem não é sempre mais barata ou mais simples — mas remove as barreiras para começar,
  e torna possível o escalonamento de formas que os servidores físicos não conseguem igualar.

## Dicas de Exame

*Domínio SAA-C03: Transversal — Fundamentos de conceitos de nuvem*

- O **Modelo de Responsabilidade Partilhada** aparece regularmente no exame. Lembre-se: a AWS
  é responsável pela segurança *da* nuvem (hardware, centros de dados, rede global).
  Você é responsável pela segurança *na* nuvem (dados, identidades, configuração da aplicação).
- **Nuance crítica**: a divisão muda conforme o tipo de serviço. Para EC2
  (uma máquina virtual que controla), *você* aplica os patches ao sistema operativo. Para RDS (uma
  base de dados gerida), a AWS aplica os patches ao motor da base de dados. Quanto mais "gerido" for um serviço,
  mais responsabilidade passa para a AWS. Cenários de exame descreverão um incidente
  e perguntarão quem é responsável — pergunte sempre "quão gerido é este serviço?"
- As perguntas sobre *benefícios* da nuvem testam frequentemente CapEx vs. OpEx. O hardware on-premises é
  despesa de capital (CapEx — compra única, depreciada ao longo do tempo). A nuvem é
  despesa operacional (OpEx — pagamento mensal). A AWS transfere os custos de CapEx para OpEx.
- "Elasticidade" — a capacidade de escalar para cima *e para baixo* automaticamente — é um benefício central da nuvem.
  Pode vê-la associada a "escalabilidade" no exame. Elasticidade significa
  escalonamento automático e orientado pela procura em ambas as direcções. Escalabilidade significa que o sistema
  *pode* crescer, mas não encolhe necessariamente de forma automática.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: explique o Modelo de Responsabilidade Partilhada. Quem é responsável pelo quê,
e por que razão importa essa distinção?

*(Sugestão: Pense na analogia de Priya — quem protege o edifício e quem protege o que está
dentro.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa está a migrar a sua aplicação web de um centro de dados on-premises
para a AWS. A equipa de segurança está preocupada em manter a conformidade com as suas políticas de protecção de dados. Um novo engenheiro pergunta: "Agora que estamos na AWS, a Amazon trata
de todos os nossos requisitos de segurança?"

Qual das seguintes opções MELHOR descreve como as responsabilidades de segurança estão divididas?

A) A AWS é totalmente responsável por toda a segurança assim que a aplicação esteja alojada na nuvem  
B) O cliente é totalmente responsável por toda a segurança, incluindo a segurança física do centro de dados  
C) A AWS gere a segurança da infraestrutura subjacente; o cliente gere a segurança dos seus dados, aplicações e configurações  
D) As responsabilidades de segurança são negociadas por conta e dependem do nível de serviço do cliente

**Sugestão 1**: Pense no que a AWS controla fisicamente versus o que você controla.

**Sugestão 2**: A AWS possui os centros de dados. Você escolheu o que colocar neles e como configurar
a sua aplicação.

**Sugestão 3**: Introduzimos um nome específico para esta divisão de responsabilidades neste capítulo.

**Resposta**: C

**Explicação**: O Modelo de Responsabilidade Partilhada da AWS divide a segurança em dois domínios.
A AWS protege a infraestrutura física — centros de dados, hardware e redes.
O cliente protege tudo o que implanta sobre ela: os seus dados, os seus controlos de acesso,
as configurações da sua aplicação e as suas definições de rede.

**Por que não A?** A AWS nunca assume total responsabilidade pela segurança da aplicação do cliente.
No momento em que configura algo, essa configuração é sua para gerir.

**Por que não B?** Os clientes não são responsáveis pela segurança física do centro de dados —
essa é precisamente uma das vantagens de usar a AWS.

**Por que não D?** O Modelo de Responsabilidade Partilhada é uma estrutura fixa, não um
acordo negociado.

*Domínio SAA-C03: Transversal — Conceitos de nuvem / Responsabilidade Partilhada*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Um amigo está a lançar uma nova aplicação e pede a sua opinião. Está a decidir entre
comprar dois servidores físicos (um para a aplicação, um para a base de dados) ou usar um
fornecedor de nuvem. O tráfego previsto é de 10 a 100 utilizadores por dia, mas tem um evento de lançamento
daqui a três meses que poderá trazer 10 000 utilizadores num único dia.

Percorra os compromissos. Que opção recomendaria e qual é o motivo principal? O que abdicaria com a sua escolha?

*(Não existe uma resposta única correcta. O objectivo é praticar o raciocínio em termos de compromissos.)*

## Cena Pós-Créditos

Três dias depois, Nimbus tinha uma conta AWS.

Leo tinha-a criado às 23h usando o seu endereço de e-mail pessoal, um cartão de crédito que teve de
pedir emprestado ao Tom e um entusiasmo que, retrospectivamente, era ligeiramente preocupante.

"Encontrei uma coisa chamada EC2," disse na manhã seguinte, mostrando o ecrã do portátil.
"É como um computador que se aluga. Acho que iniciei um."

"*Acha*?" perguntou Priya.

"Quero dizer, definitivamente iniciei um." Percorreu a página. "Só não sei onde está."

Maya inclinou-se e olhou para o ecrã.

"Leo," disse ela. "Por que razão diz 'Região: ap-southeast-1'?"

"O que significa isso?"

No próximo capítulo: a geografia da AWS — onde os servidores realmente estão e por que importa.
