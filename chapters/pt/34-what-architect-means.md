# Epílogo: O Que Significa Ser Arquiteto

*Este capítulo é um epílogo. Não há exercícios, dicas de exame nem cena pós-créditos — porque não há próximo capítulo.*

A mesa do canto tinha a melhor luz do café. Pela janela, a tarde fazia algo lento e tranquilo na rua lá fora.

Maya havia pedido chá. Tom havia pedido espresso. Priya havia pedido algo que ela descreveu apenas como "o que eles estavam fazendo quando entrei." Leo chegou vinte minutos atrasado, o que era consistente.

Haviam se passado quatorze meses desde a Série A.

A equipe de engenharia era agora de dezenove pessoas. Havia dois fusos horários. Havia uma equipe de plataforma, uma equipe de produto, uma equipe de dados. Havia uma revisão de arquitetura semanal que durava noventa minutos e geralmente precisava de mais. O financiamento havia feito o que o financiamento faz: os 947 parceiros restaurantes que Maya havia apresentado aos investidores haviam se tornado 3.000, as duas cidades que estavam "lançando" estavam ativas junto com mais três, e a plataforma que um dia havia servido um único restaurante de família agora rodava um rush de jantar de sexta-feira de uma costa à outra.

Leo chegou com uma mochila para laptop e a expressão de alguém que havia participado de três chamadas antes das 9 da manhã. Sentou-se. Pediu café. Disse: "Ok. O que estamos fazendo?"

"Pensando," disse Maya.

"Sobre o quê?"

Ela havia estado pensando, no trem de volta, sobre algo que um novo contratado havia dito em sua primeira semana. Era um bom engenheiro — cuidadoso, preciso, fazia boas perguntas. Na sexta-feira, ao final da primeira revisão de arquitetura dele, havia dito: "Quero ser arquiteto algum dia."

Ela havia dito: "Você já está tomando decisões arquiteturais."

Ele havia parecido incerto. "Mas sou apenas um júnior."

"Eu também era," disse ela. "Todos nesta sala também eram, um dia."

Ela contou essa história para a mesa. Quando terminou, Tom disse: "O que você quis dizer com isso?"

"Não tenho certeza de que expliquei bem," disse Maya. "É por isso que estamos aqui."

E porque a pergunta havia ficado com ela o fim de semana inteiro.

Não porque era lisonjeiro ser perguntada.

Mas porque era o tipo de pergunta que muda a forma como alguém vê seu próprio futuro se você a responder bem.

**A Pergunta**

O que é um arquiteto?

Não o título. Não o organograma. Não os anos de experiência listados em uma descrição de cargo. A coisa real.

Nos quatorze meses desde a rodada de financiamento, todos os quatro haviam se tornado, formal ou informalmente, responsáveis pelas decisões arquiteturais na Nimbus. Maya era oficialmente a CTO. Tom era o Chefe de Infraestrutura. Priya liderava a equipe de plataforma. Leo era o Engenheiro Principal, o que significava que era consultado em tudo e não era responsável por nada específico, o que ele achava ao mesmo tempo libertador e ocasionalmente enlouquecedor.

Nenhum deles havia esperado chegar aqui. Maya havia estudado administração de empresas e tocado o restaurante de sua família — ela nunca havia escrito código de produção quando isso começou. Tom havia passado oito anos como administrador de sistemas que achava que continuaria sendo um. Priya tinha um diploma em ciência da computação e um estágio em uma empresa de segurança. Leo havia se autoensinado a programar, lançando seu primeiro aplicativo aos dezesseis anos.

Nada disso era a descrição de cargo para "arquiteto."

"Aqui está o que eu acho que é," disse Priya. "Um arquiteto é alguém que aceitou que é responsável pelas consequências de suas decisões — não apenas pela decisão em si."

"Diga mais," disse Leo.

"Quando você está no início da carreira, você toma uma decisão e segue em frente. Você a implementa ou não. Alguém acima de você a revisa, aprova, implanta. A consequência de estar errado é que alguém mais acima captura o erro."

"E depois?"

"Depois, ninguém está acima. A decisão é implantada. A consequência é a produção."

Tom assentiu lentamente. "É quando você começa a pensar diferente. Não porque você sabe mais — embora saiba — mas porque o raio de alcance de estar errado mudou."

**Do Júnior ao Arquiteto: A Progressão Real**

A progressão de engenheiro júnior a arquiteto não é uma linha reta de conhecimento acumulado. É uma série de mudanças na forma como você entende seu trabalho.

*Engenheiros juniores* perguntam: Como faço isso funcionar? A pergunta principal deles é implementação. Dado um requisito, como produzo um sistema funcional? Essa é a habilidade essencial inicial. Todo o resto se apoia nela.

*Engenheiros de nível médio* perguntam: Como faço isso funcionar corretamente? A pergunta se expande para incluir correção — não apenas "funciona" mas "lida com os casos extremos, as condições de erro, as entradas inesperadas." Eles começam a pensar em testes. Começam a pensar em manutenção.

*Engenheiros sênior* perguntam: Como faço isso funcionar corretamente *e* de forma sustentável? O horizonte temporal se estende. Eles pensam no engenheiro que lerá este código em um ano. Pensam no sistema que carregará dez vezes a carga atual. Pensam no que acontece quando uma dependência muda.

*Engenheiros staff e principal* perguntam: Por que estamos construindo isso? Eles recuam da implementação e questionam a premissa. Este é o problema certo a resolver? Este é o momento certo de resolvê-lo? Existe uma abordagem mais simples que abre mão da sofisticação em troca da sobrevivência?

*Arquitetos* perguntam: O que quebra primeiro, como sabemos, e o que alguém faz às 3 da manhã quando acontece?

"A pergunta das 3 da manhã," disse Leo. "Carlos usou essa."

"Porque é verdade," disse Priya. "Esse é o teste. Você consegue escrever o runbook? Você entende os modos de falha bem o suficiente para escrever os passos para alguém que está meio adormecido e sob pressão?"

**O Que Não Muda**

Existem coisas que os arquitetos sabem que os engenheiros juniores não sabem. Comportamento específico de serviços. Características de falha em escala. A dinâmica organizacional de obter aprovação para decisões. O histórico de decisões tomadas em contextos semelhantes que não funcionaram.

Mas o conhecimento não é a coisa.

A coisa é o conjunto padrão de perguntas. O modelo mental que se ativa quando alguém descreve um problema.

Os engenheiros juniores ouvem um problema e pensam em soluções. Os arquitetos ouvem um problema e pensam em restrições, modos de falha e a lacuna entre o que o negócio diz que precisa e o que realmente precisa.

Não porque são mais frios.

Mas porque estão tentando proteger as pessoas que terão que viver dentro das consequências.

"Não é que sabemos mais," disse Tom. "Fazemos perguntas diferentes primeiro."

Maya havia ficado quieta por um tempo. Ela disse: "Quando falei com aquele novo engenheiro, percebi o que estava realmente tentando dizer. Ele perguntou como se tornar um arquiteto. E eu queria dizer: comece notando o que quebra. Não apenas quando algo está quebrado — mas antes. Durante o design. Durante a revisão. Pergunte: o que quebra primeiro? Como saberemos? Para quem ligamos?"

"Isso não é um título," disse Leo. "É um hábito."

"Sim."

**Propriedade**

A outra coisa, eles concordaram, era propriedade.

Não propriedade no sentido jurídico. Propriedade no sentido psicológico: a sensação de que se este sistema se degradar, você será o que mais se importará.

No início da carreira, essa não é a postura esperada. Você é responsável pelos seus tickets, seus PRs, suas histórias atribuídas. O sistema pertence a outra pessoa.

Depois, o limite se dissolve. O sistema é seu. Não só seu — compartilhado, sempre compartilhado — mas seu no sentido de que você sente suas falhas pessoalmente. Um incidente de produção às 2 da manhã não é uma interrupção à sua vida. É uma parte do seu trabalho.

"Essa é a mudança que eu não poderia ter ensinado a ninguém," disse Tom. "Você tem que sentir alguns apagamentos. Você tem que ser aquele que não detectou o modo de falha antes de ele atingir a produção. É quando a pergunta muda."


A outra coisa que eles notaram sobre a mudança foi que ela aconteceu não em um momento específico, mas ao longo de uma série de incidentes.

Para Tom, havia sido a primeira vez que um volume EBS sem tag apareceu na conta e ninguém sabia para que servia. Ele havia passado duas horas rastreando-o. Havia encontrado. Havia excluído. E então — em vez de seguir em frente — havia escrito uma política sobre tagging e passado outra tarde garantindo que o resto da infraestrutura a seguisse. Ninguém havia pedido para ele fazer isso. Ele havia feito porque o pensamento de não fazer o incomodava.

Para Priya, havia sido a primeira vez que havia sido acionada às 2 da manhã por uma descoberta do GuardDuty. Ela havia ficado irritada no início. Então havia lido a descoberta. Um usuário IAM havia feito 47 chamadas de API com falha a um endpoint que normalmente não acessava. Acabou sendo um script de automação mal configurado. Mas os 20 minutos que ela passou rastreando a descoberta terminaram com ela perguntando: se isso tivesse sido um comprometimento real, o que teríamos conseguido ver? A resposta era: muito pouco. Ela havia passado a sprint seguinte construindo a infraestrutura de logging e alerta que teria respondido a essa pergunta.

Para Leo, havia sido o sistema de notificação. Não durante o incidente — durante as duas semanas depois dele. A forma como ele havia pensado sobre a arquitetura à noite, não porque alguém estava observando, mas porque algo nele não conseguia largar até entender o que havia construído errado e por quê.

Nenhum deles havia sido orientado a se importar tanto. Aquilo havia chegado da forma como a maioria das coisas importantes chega: gradualmente, sem anúncio, no meio do trabalho comum.


"Algumas pessoas não fazem essa mudança," disse Priya. "Bons engenheiros. Excelentes engenheiros. Fazem um trabalho excelente dentro de um escopo definido e são cuidadosos e confiáveis dentro dele. Eles não sentem a propriedade. Isso não é uma falha moral — é apenas uma relação diferente com o trabalho."

"E os arquitetos precisam sentir isso," disse Maya.

"Os arquitetos sentem por padrão," disse Priya. "Mesmo quando estão de folga. Especialmente então."

**Amplitude vs Profundidade Técnica**

Existe uma pergunta que é feita em toda entrevista de arquitetura: você é generalista ou especialista?

A resposta honesta é: nenhum sozinho é suficiente.

Os arquitetos precisam de profundidade suficiente para saber o que não sabem — para reconhecer quando um problema está na fronteira do seu conhecimento, quando trazer alguém com mais experiência específica. Você não pode saber quando chamar um especialista em banco de dados se não entender bancos de dados o suficiente para saber o que está perdendo.

E os arquitetos precisam de amplitude suficiente para conectar as coisas. Os sistemas que eles projetam abrangem domínios: armazenamento e computação e rede e segurança e observabilidade e custo. As decisões em uma área têm consequências em outra. Você não pode otimizar os custos de rede sem entender o comportamento da aplicação. Você não pode projetar um modelo de dados sem entender os padrões de acesso. Você não pode escolher um modelo de implantação sem entender os modos de falha.

"Não é profundidade ou amplitude," disse Leo. "É profundidade em algumas coisas e consciência de tudo."

"Em forma de T," disse Priya.

"Sempre odiei essa metáfora," disse ele. "Mas sim."

**Raciocínio sobre Contrapartidas**

A coisa mais comum que os arquitetos dizem é: depende.

O erro é dizê-lo sem completar a frase.

*Depende do padrão de acesso.* Depende da escala. Depende da consequência da falha. Depende da capacidade operacional da equipe. Depende da restrição de custo. Depende de por quanto tempo você espera que o sistema permaneça em sua forma atual.

Completar a frase é o trabalho. Cada frase completa revela uma dimensão do problema que era anteriormente invisível. Cada dimensão tornada visível é uma decisão que pode ser tomada deliberadamente em vez de acidentalmente.

Priya havia escrito uma lista, alguns meses atrás, das decisões que a Nimbus havia tomado acidentalmente — não maliciosamente, não negligentemente, mas sem entender completamente que a decisão estava sendo tomada. Ela a revisava às vezes. Era um documento útil.

"As melhores decisões arquiteturais que já vi," disse ela, "são aquelas em que alguém disse: aqui estão as quatro opções, aqui estão as contrapartidas, aqui está o que recomendo, aqui está o que me faria mudar a recomendação."

"Um ADR," disse Leo.

"Um ADR," ela concordou. "Ou apenas uma frase em uma mensagem do Slack. O formato não importa. O raciocínio importa."

"Porque o raciocínio sobrevive mesmo quando a decisão é revisitada," disse Tom.

"Porque o raciocínio é o conhecimento," disse Maya. "A decisão é apenas o resultado."

**O Que a Senioridade Não É**

Não é tempo de serviço. Você pode trabalhar em algum lugar por dez anos e não desenvolver julgamento arquitetural. Você pode estar há três anos e pensar como um arquiteto. O tempo se correlaciona fracamente com a coisa.

Não é saber tudo. Existem serviços no catálogo da AWS que nenhum deles havia usado — ofertas especializadas para setores específicos, recursos anunciados e ainda não necessários. Tudo bem. O catálogo é vasto. O trabalho não é conhecimento enciclopédico; é raciocínio fundamentado a partir do que você sabe.

Não é a ausência de dúvida. Os arquitetos duvidam constantemente. Eles mantêm suas decisões com mais leveza do que os engenheiros juniores, porque já viram boas decisões suficientes falharem em circunstâncias inesperadas para saber que a confiança é situacional. "Tenho confiança nisso dadas as restrições atuais" é a postura correta. Não "estou certo."

Não é a incapacidade de estar errado. Carlos havia lhes contado, naquela primeira revisão de arquitetura, sobre um sistema que havia projetado e que havia falhado catastroficamente porque havia feito a análise do modo de falha errada. Ele o descreveu de forma direta, sem defensividade. "Errei," disse ele. "Aprendemos com isso. O próximo sistema não tinha esse modo de falha."

Não é a certeza sobre o futuro. Os arquitetos mais experientes são os mais confortáveis em dizer: não sei como isso vai se comportar com 10x de tráfego. Vamos testar. A disposição de admitir incerteza — e de projetar sistemas que conseguem sobreviver a estarem errados — é um marcador de maturidade, não de fraqueza.

"É o que o tornava confiável," disse Maya, quando contou a história ao novo contratado. "Não que ele nunca havia estado errado. Que havia estado errado, entendido por quê, e carregou isso para frente."

**A Transição para Sênior**

Para quem está lendo isso e ainda é júnior ou de nível médio, que está no caminho para esse tipo de pensamento:

A transição não é um teste que você passa. É uma postura que você adota, gradualmente, e depois não abandona.

Comece fazendo a pergunta de falha. Em cada design, em cada revisão, para cada sistema que você toca: *o que quebra primeiro?* Não hipoteticamente — percorra isso. Siga a cadeia. O balanceador de carga recebe uma requisição. O servidor de aplicação a processa. O banco de dados recebe a consulta. O que quebra primeiro sob carga? O que quebra primeiro se uma dependência for lenta? O que quebra primeiro com 10x o tráfego atual?

Comece sendo dono das coisas além da entrega. Quando você implanta algo, não passe para outra pessoa e siga em frente. Observe por uma semana. Veja as métricas. Veja os logs de erros. Veja o custo. Pergunte: este sistema está se comportando da forma que eu esperava? Se não, por quê?

Comece tornando as contrapartidas explícitas. Quando você escolhe uma abordagem, articule por que rejeitou as alternativas. Escreva, mesmo que brevemente. "Escolhi X em vez de Y porque Z." Essa articulação é o começo do raciocínio arquitetural.

Comece tratando os post-mortems como educação, não como perseguição. Todo incidente é um estudo de caso. Leia os públicos — AWS, Cloudflare, Stripe, GitHub os publicam. Leia os internos. Pergunte: qual foi o modo de falha? Que suposição se revelou errada? O que eu teria feito diferente?

A progressão de júnior a arquiteto não é principalmente sobre o que você sabe. É sobre o que você nota.

**A Vista da Mesa do Canto**

O café estava acabado. A luz da tarde pela janela havia mudado enquanto eles falavam — da forma que muda quando você para de notar.

Leo disse: "Penso naquele primeiro incidente. Aquele em que o banco de dados parou durante o rush do jantar e não tínhamos runbook, nem monitoramento, e passamos quarenta minutos sem saber o que estava errado."

"Achamos que era a aplicação," disse Priya.

"Achamos que era o CDN," disse Tom.

"Era o pool de conexões do banco de dados," disse Maya. "E nenhum de nós sabia olhar lá primeiro."

"É nisso que penso," disse Leo. "Não porque foi embaraçoso. Porque ainda consigo sentir a lacuna entre o que eu sabia então e o que sei agora. E estou ciente de que em cinco anos, sentirei a mesma lacuna entre agora e então."

"É o sentimento certo de ter," disse Priya.

"Existe um nome para isso?"

"Humildade calibrada," disse ela. "Saber o que você não sabe. O que requer primeiro saber o que você sabe."


Então Leo disse algo que vinha sentado em seu peito havia um tempo.

"Posso contar a vocês aquele em que penso mais?"

Ninguém disse para ele não contar.

"O sistema de notificação," disse ele. "A fila SQS. Aquela que construí quando tínhamos 40 restaurantes."

Priya olhou para ele. Ela conhecia essa história. Havia sido ela quem a corrigiu.

"Nos conte," disse Maya.

Leo havia construído o sistema de notificação de restaurantes em um longo fim de semana durante a corrida da Series Seed. O requisito era simples: quando um pedido era realizado, notificar o restaurante imediatamente. O mecanismo que ele escolheu foi o SQS — uma fila Standard, uma função Lambda como consumidora, configurações de concorrência padrão. Havia funcionado imediatamente, de forma confiável e sem problemas — por mais de dois anos, enquanto 40 restaurantes silenciosamente se tornaram centenas, e centenas se tornaram milhares.

Até que tiveram 3.000 restaurantes.

"O rush de sexta com 3.000 restaurantes," disse Leo. "A essa altura cada pedido produzia um punhado de mensagens — a notificação de novo pedido, a confirmação, a atualização de pronto-para-retirada. Às 18h a fila estava recebendo cerca de 2.000 mensagens por minuto. Normalmente isso não era nada: cada invocação terminava em menos de dois segundos, então nunca tínhamos mais de sessenta ou setenta Lambdas rodando ao mesmo tempo. Mas naquela sexta, o provedor de push para tablets degradou. Chamadas que levavam dois segundos começaram a travar até atingirem o timeout de 30 segundos da função."

"E a Lambda começou a sofrer throttling," disse Priya.

"Essa é a aritmética que ninguém faz até doer," disse Leo. "Concorrência é taxa de chegada vezes duração. Trinta e três mensagens por segundo vezes dois segundos são cerca de setenta execuções concorrentes. Trinta e três mensagens por segundo vezes trinta segundos são mil — cada unidade de concorrência que a conta tinha. O limite padrão no nível da conta é de 1.000 execuções concorrentes. Nunca havíamos pensado nisso porque com 40 restaurantes, estávamos longe disso. Com 3.000 restaurantes numa sexta às 18h, com uma dependência downstream lenta, atingimos em sete minutos."

Quando uma função Lambda atinge o limite de concorrência, ela não processa mensagens adicionais. As mensagens ficam na fila SQS. Com uma fila Standard, o SQS continua tentando — mas não há concorrência adicional para processá-las. As mensagens se acumulam. As notificações acumulam. Os restaurantes não recebem as notificações de pedidos. Os cronômetros da cozinha não começam. Os pedidos atrasam ou são perdidos.

"Quanto tempo até os parceiros restaurantes começarem a ligar?" perguntou Tom.

"Onze minutos após o início do throttling," disse Leo. "Tínhamos 430 notificações acumuladas."

"O que você fez primeiro?" perguntou Maya.

Leo teve a delicadeza de parecer ligeiramente envergonhado. "Aumentei o timeout da Lambda de 30 segundos para 5 minutos. A ideia era que se cada invocação pudesse rodar mais tempo, talvez ela processasse o backlog mais rápido."

"Isso piorou?" perguntou Tom.

"Piorou. As mensagens acumuladas eram repetidas enquanto as invocações originais ainda estavam rodando com o timeout estendido. Eu havia criado uma situação em que a concorrência já-no-limite estava sendo mantida por funções de longa duração enquanto novas mensagens chegavam e não eram processadas."

"Eu lembro," disse Priya baixinho.

"Minha segunda tentativa," Leo continuou. "Adicionei uma segunda função Lambda. Mesma fila, novo consumidor. Achei que se dobrasse os consumidores, dobraria o throughput."

"Mas a concorrência é por conta, não por função," disse Priya.

"Correto. Duas funções Lambda, ambas atingindo o mesmo teto de concorrência no nível da conta. Throughput total: idêntico a uma função. Backlog: ainda crescendo. A segunda Lambda apenas dividiu a mesma capacidade limitada entre duas funções."

Tom estava encarando a mesa. "Qual é a solução correta?"

"Priya a encontrou," disse Leo.

"Às 2 da manhã," acrescentou Priya. Ela havia estado lendo a documentação do Lambda na cama, com o brilho do celular no mínimo.

"Concorrência reservada," disse ela. "Cada função Lambda pode receber uma concorrência reservada — uma parcela do limite total de concorrência da conta que é garantida exclusivamente para aquela função, e indisponível para qualquer outra função. Se eu desse à Lambda de notificação 400 unidades de concorrência reservada, as outras Lambdas da conta teriam 600 unidades para compartilhar, e a Lambda de notificação não poderia ser privada por outras funções."

"Isso corrigiu?" perguntou Tom.

"Corrigiu o problema de privação," disse Priya. "Mas ainda havia um teto de throughput na Lambda de notificação. 400 invocações concorrentes, cada uma processando uma mensagem por vez. A dois segundos por mensagem, isso é mais que suficiente para 2.000 mensagens por minuto. Mas no momento em que uma dependência downstream fica mais lenta do que doze segundos por chamada, a mesma aritmética que nos quebrou em 1.000 nos quebra em 400. As 400 unidades tinham margem suficiente para o tráfego daquela semana. Daquela semana."

"Foi uma correção temporária," disse Leo.

"Foi a terceira correção em uma série crescente," disse Priya. "Cada correção abordava um sintoma. Nenhuma delas abordava a arquitetura."

A solução correta — que eles construíram nas duas semanas seguintes — tinha três partes.

"Filas FIFO," disse Priya, "por tier de restaurante. Os restaurantes eram segmentados em três tiers: enterprise, growth e standard. Cada tier recebia sua própria fila SQS FIFO. Cada fila tinha seu próprio consumidor Lambda com sua própria alocação de concorrência reservada."

"Por que FIFO?" perguntou Tom. "Filas Standard são mais baratas."

"Porque as filas FIFO garantem a ordenação por grupo de mensagens," disse Priya. "Para notificações de restaurantes, a ordem das mensagens importa. Se uma atualização de pedido chega antes da notificação do pedido original, o restaurante vê uma sequência confusa. As filas FIFO, com um ID de grupo de mensagens por restaurante, garantem que as mensagens de cada restaurante sejam processadas na ordem em que foram enviadas."

"E a separação por tier?" perguntou Tom.

"Raios de explosão isolados," disse Priya. "Se a fila do tier enterprise tem um problema de processamento, ela não degrada o tier standard. Os restaurantes enterprise têm os requisitos de SLA mais altos — são aqueles em que uma notificação atrasada custa dinheiro real à Nimbus em penalidades contratuais. Separá-los garante que a fila deles não possa ser preenchida pelo tráfego de restaurantes standard."

"E a DLQ," acrescentou Leo.

"Uma dead-letter queue em cada fila FIFO," disse Priya. "Mensagens que falham no processamento após três tentativas são movidas para a DLQ. Um alarme do CloudWatch dispara quando a profundidade da DLQ excede zero. O engenheiro de plantão revisa as mensagens com falha e determina se precisam de reprocessamento ou investigação."

"Antes do alarme da DLQ," disse Leo, "descobríamos sobre notificações com falha quando um parceiro restaurante ligava. O alarme da DLQ significa que descobrimos antes da ligação."

A conversa havia ficado em silêncio por um momento. A luz da tarde havia continuado sua lenta mudança pela janela do café.

"No que penso," disse Leo, "é na lacuna entre o que construí e o que construiria agora. Não como autocrítica. Como medição. Porque essa lacuna é como eu sei que aprendi algo."

"O que você teria construído desde o início?" perguntou Maya.

"Filas FIFO em tiers desde o primeiro dia," disse Leo. "Não porque eu precisasse de três tiers quando tínhamos 40 restaurantes. Mas porque o design teria sido certo para o que nos tornamos. O custo de três filas em vez de uma era insignificante. O custo de uma fila que falhou em escala foi três horas de incidentes de noite de sexta e duas semanas de remediação."

"Você não sabia que iria escalar para 3.000 restaurantes quando o construiu," disse Priya. Não era uma defesa. Era um esclarecimento.

"Não," disse Leo. "Mas eu sabia que estávamos construindo um sistema de notificação para uma plataforma de restaurantes com ambições de crescimento. A pergunta que não fiz foi: como isso se parece em 10x? Em 100x? Qual é a primeira coisa que quebra quando ficamos maiores?"

"O limite de concorrência," disse Tom.

"O limite de concorrência," Leo concordou. "Que está na documentação do Lambda. Eu havia lido a documentação. Só nunca havia feito a pergunta que tornaria a seção relevante relevante."

"Esse é o hábito arquitetural," disse Priya. "A pergunta que torna a documentação certa relevante. Você não consegue ler cada linha. Mas se você pergunta 'o que quebra em escala?', você acaba lendo as linhas certas."

Maya vinha escutando sem falar por um tempo. Ela disse: "A razão pela qual eu quis falar sobre isso hoje — a razão pela qual pedi para todos vocês virem — é que venho tentando entender o que podemos ensinar aos novos engenheiros. Não os serviços. Os serviços eles aprenderão. Qual é a coisa que leva mais tempo para aprender do que deveria?"

Ninguém respondeu imediatamente.

"Essa pergunta," disse Leo finalmente. "A que é sobre o que quebra em escala. Nós a fazemos por reflexo agora. Não a fazíamos por reflexo quando começamos. Não sei como você ensina alguém a fazê-la reflexivamente sem deixá-lo construir algumas coisas que quebram em escala primeiro."

"Você não consegue," disse Tom. "Mas você pode tornar o ambiente mais seguro para o aprendizado. Você pode construir sistemas em que a falha é visível, contida e rastreável. Você pode garantir que o post-mortem seja um documento de aprendizado, não um documento de culpa. Você pode fazer a pergunta de escala na revisão de código, mesmo quando você sabe a resposta, porque a pessoa que escreve o código precisa ouvi-la ser feita."

"E você pode contar histórias," disse Priya. "Como esta."


Maya observou a rua.

"O novo engenheiro perguntou como se tornar um arquiteto," disse ela. "O que eu deveria ter dito é: torne-se alguém que se importa com o que quebra. Todo o resto segue disso."

Ninguém falou por um momento.

Era um desses silêncios que não precisam ser preenchidos.

Lá fora, alguém atravessou a rua carregando duas sacolas de papel com comida para viagem. Tom notou primeiro e riu.

"Círculo completo," disse ele.

Maya sorriu. "Sim," disse ela. "Círculo completo."

---

## A Progressão do Júnior ao Arquiteto

| Estágio         | Pergunta Principal                                           | Horizonte Temporal | Propriedade      |
|-----------------|--------------------------------------------------------------|--------------------|------------------|
| Júnior          | Como faço isso funcionar?                                    | Ticket atual       | Meu PR           |
| Nível Médio     | Como faço isso correto e manutenível?                        | Esta sprint        | Meu componente   |
| Sênior          | Como isso se mantém ao longo do tempo e em escala?           | Próximo trimestre  | Este serviço     |
| Staff/Principal | Por que estamos construindo isso, e há um caminho mais simples? | Próximo ano     | Este sistema     |
| Arquiteto       | O que quebra primeiro, como sabemos, e o que fazemos?        | Indefinido         | O produto        |

---

## O Que Muda à Medida Que Você Cresce

**De implementação a consequência.** Engenheiros juniores perguntam "funciona?" Engenheiros sênior perguntam "continua funcionando?" Arquitetos perguntam "o que acontece quando para?"

**De recursos a sistemas.** Engenheiros juniores adicionam recursos. Arquitetos pensam sobre o que o sistema se torna quando dez recursos foram adicionados. A forma das decisões futuras já é visível nas decisões atuais.

**De correção a contrapartidas.** Geralmente existe uma implementação "mais correta" de um recurso. Raramente existe uma arquitetura "mais correta". Existem contrapartidas, e os melhores arquitetos as fazem explícita e conscientemente em vez de acidentalmente.

**De confiança a calibração.** Os engenheiros juniores frequentemente são subconfiantes (inseguros das decisões corretas) ou excessivamente confiantes (sem consciência do que não sabem). Os arquitetos experientes são calibrados: eles conhecem a extensão e os limites de seu conhecimento, e mantêm suas conclusões no nível adequado de certeza.

**De conhecimento a julgamento.** Conhecimento é saber que o DynamoDB usa chaves de partição. Julgamento é saber que o padrão de acesso deste caso de uso específico causará partições quentes, e que o impacto de negócios desse modo de falha na escala projetada significa que você deve reconsiderar o design agora.

---

*Obrigado por ler.*

*O exame AWS Solutions Architect Associate (SAA-C03) está disponível nos centros de testes Pearson VUE e online por meio do sistema de testes remotos. Visite aws.amazon.com/certification para se registrar.*

*A história da Nimbus é fictícia. Os serviços AWS, modelos de preços e melhores práticas descritos neste livro são reais. Ambos podem mudar — a AWS atualiza seus serviços com frequência. Sempre verifique os preços e capacidades atuais dos serviços em aws.amazon.com.*

*Boa sorte.*

---

*Mesmo horário no ano que vem?*
