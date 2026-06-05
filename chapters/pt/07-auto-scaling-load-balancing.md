# Capítulo 7: O Restaurante que Cresce Quando Fica Movimentado

Eram 19:43 de uma sexta-feira à noite quando a taxa de erro ultrapassou os 12%.

Tom foi o primeiro a notar porque Tom era sempre o primeiro a notar. Tinha um separador aberto para o painel CloudWatch que actualizava da mesma forma que outras pessoas verificam as redes sociais — reflexivamente, constantemente, sem bem querer.

"Leo," disse ele.

Leo já estava a olhar. Tempos de resposta: a subir. Pedidos em fila: a subir. A única instância EC2 — mesmo a maior que tinham actualizado no mês passado — estava a 94% de CPU.

"Estamos a recusar clientes," disse Tom.

"Não estamos a recusá-los," disse Leo. "O servidor está."

"É a mesma coisa."

Era. E tinha acontecido todas as sextas-feiras durante três semanas. Nimbus tinha sobrevivido à crise de armazenamento — a base de dados tinha o seu próprio disco, as fotos viviam em S3 — mas estável e escalável são problemas completamente diferentes. O sistema funcionava. Simplesmente não crescia.

A equipa precisava que o sistema lidasse com carga variável automaticamente. Não para comprar suficiente servidor para o pior caso e desperdiçar dinheiro durante períodos calmos. E não para lutar manualmente quando os picos de tráfego chegassem.

Existe um padrão para isto. A AWS tem dois serviços que o implementam.

**O Conceito: Escalonamento Horizontal**

Há duas formas de fazer um sistema lidar com mais carga.

O **escalonamento vertical** significa tornar o servidor único maior. Mais CPU. Mais RAM.
Fizemos isto no Capítulo 4 quando actualizámos de `t3.micro` para `t3.large`. Ajuda.
Mas tem limites: só pode ficar assim tão grande, a instância tem de reiniciar para redimensionar,
e ainda tem um único ponto de falha.

O **escalonamento horizontal** significa adicionar mais servidores. Em vez de um servidor grande, corra
cinco servidores médios. Quando o tráfego diminui, corra dois. Quando pica, corra dez.

O escalonamento horizontal tem vantagens que o vertical não tem:

- Sem ponto único de falha. Se um servidor morrer, os outros continuam a servir.
- Sem necessidade de reiniciar para adicionar capacidade.
- Pague apenas pelo que está a usar — adicione servidores quando precisar, remova quando não precisar.
- Escalonamento linear: o dobro dos servidores, aproximadamente o dobro do rendimento.

O problema: se tiver múltiplos servidores, como sabem os utilizadores com qual falar?

**O Application Load Balancer: Uma Porta, Muitas Salas**

Um **Application Load Balancer** (ALB) é a porta da frente da sua aplicação.

Os utilizadores ligam-se ao balanceador de carga. O balanceador de carga distribui os pedidos recebidos
pelo seu conjunto de instâncias EC2. Cada utilizador vê um endereço (o URL do balanceador de carga). Por trás desse endereço, os pedidos são distribuídos por quantos servidores estejam a correr.

Pense nele como um grande restaurante com uma recepção na porta. Os clientes chegam e
o anfitrião dirige-os para uma mesa disponível. O anfitrião sabe quais mesas estão ocupadas e
quais estão livres. Os clientes não precisam de saber quantas mesas existem — apenas
entram e o anfitrião trata da distribuição.

Um ALB faz isto com pedidos web. Recebe cada pedido HTTP recebido e decide
qual instância EC2 (chamada **alvo**) deve tratá-lo, com base em factores como:

- Round-robin (cada servidor tem turnos em rotação)
- Menor número de pedidos pendentes (o servidor com menos pedidos em curso recebe o próximo pedido)
- Saúde — apenas os alvos saudáveis recebem tráfego

As **verificações de saúde** são essenciais. O ALB envia regularmente pedidos de teste a cada alvo.
Se um alvo não responder correctamente, o ALB marca-o como insalubre e para de enviar
tráfego para ele. Quando o alvo se recupera, o tráfego recomeça.

Isto é automático. Configura os parâmetros de verificação de saúde; o ALB impõe-nos.

**Auto Scaling: O Restaurante que Abre Mais Mesas**

Um ALB distribui tráfego pelos seus servidores existentes. Mas não adiciona servidores
quando precisar de mais.

**Auto Scaling** faz isso.

Um **Auto Scaling Group** (ASG) é uma configuração que diz à AWS:

- O número mínimo de instâncias a ter sempre a correr
- O número máximo de instâncias permitido
- As condições sob as quais escalar para fora (adicionar instâncias) ou para dentro (removê-las)

As condições de escalonamento chamam-se **políticas**. O tipo mais comum:

**Rastreamento de alvo**: "Manter a utilização média de CPU a 70%." Quando a CPU média excede
70%, a AWS lança novas instâncias. Quando desce, as instâncias são terminadas.

Isto é automático. Ninguém tem de observar as métricas. Ninguém tem de lançar manualmente
servidores. O sistema reage à carga em tempo real.

Priya observou isto acontecer ao vivo durante um pico de sexta-feira pela primeira vez. A contagem de servidores foi de 2 para 5 ao longo de quinze minutos, depois de volta para 2 após o pico.

"Isso," disse ela, "é genuinamente impressionante."

Tom estava a observar o gráfico de custos em vez disso. A factura aumentou durante o pico e desceu
depois. "Pagámos apenas pelo que usámos," disse ele, igualmente impressionado.

**Como ALB e ASG Trabalham Juntos**

Os dois serviços são projectados para serem usados em conjunto.

Coloca o ALB na frente. O ALB aponta para um **grupo de alvos** — uma colecção de
instâncias que devem receber tráfego. O Auto Scaling Group gere essas instâncias:
adiciona-as ao grupo de alvos ao escalar para fora, remove-as ao escalar para dentro.

O fluxo:

1. O tráfego chega ao ALB
2. O ALB distribui pedidos pelos alvos saudáveis
3. A CPU/carga sobe nesses alvos
4. O ASG detecta o aumento de carga, lança novas instâncias
5. As novas instâncias passam nas verificações de saúde, ficam registadas com o ALB
6. O ALB começa a enviar tráfego para elas
7. A carga diminui, o ASG termina instâncias extra
8. O ALB pára de enviar tráfego para instâncias terminadas

Isto acontece sem qualquer intervenção humana.

**Modelos de Lançamento: O Modelo para Novas Instâncias**

Quando o ASG lança uma nova instância, precisa de saber o que lançar. Isto é definido
num **Modelo de Lançamento** — uma AMI, um tipo de instância, os grupos de segurança a aplicar,
e qualquer dados de utilizador (scripts de arranque que correm quando a instância arranca).

Um padrão comum: constrói a sua aplicação numa AMI personalizada (ver Capítulo 4).
Quando o ASG precisa de uma nova instância, lança essa AMI. A nova instância arranca com
a sua aplicação já instalada. Sem configuração manual necessária.

Para ambientes mais dinâmicos, também pode usar **scripts de dados de utilizador** que obtêm e
instalam a versão mais recente do seu código no arranque. Isto é mais flexível mas demora
mais a arrancar.

A escolha certa depende de quanto tempo as suas instâncias precisam para arrancar e com que frequência a sua aplicação muda.

**Sessões Persistentes: Um Problema Subtil**

Aqui está algo que engana muitas equipas quando implementam balanceamento de carga pela primeira vez.

Algumas aplicações web guardam dados de sessão — estado de login, conteúdo do carrinho de compras — no
próprio servidor (em memória ou em disco local). Isto funciona bem com um servidor.
Com múltiplos servidores, falha.

Um utilizador faz login. O pedido vai para o Servidor A. O Servidor A guarda a sessão. O próximo
pedido vai para o Servidor B. O Servidor B não tem sessão. O utilizador parece ter saído.

Isto pode ser tratado de duas formas:

**Sessões persistentes** (ou afinidade de sessão): Configura o ALB para enviar sempre pedidos
do mesmo utilizador para o mesmo servidor. Isto é uma solução de curto prazo. Prejudica o balanceamento de carga (alguns servidores ficam com mais utilizadores "persistentes" do que outros) e cria problemas
quando uma instância é terminada.

**Design de aplicação sem estado**: Guarda dados de sessão externamente — numa base de dados ou
numa cache como ElastiCache (Capítulo 10). Cada servidor pode reconstruir a sessão de qualquer utilizador
a partir do armazenamento externo. Os servidores tornam-se intercambiáveis. Esta é a abordagem correcta
para aplicações escaláveis horizontalmente.

Priya chamou a isto "a decisão arquitectural mais importante que toma quando passa para
multi-servidor". Ela tem razão. Voltamos a encontrá-la no Capítulo 10.

**Tipos de Balanceadores de Carga**

A AWS oferece três tipos de balanceadores de carga, cada um adequado a tráfego diferente:

**Application Load Balancer (ALB)**: Tráfego HTTP e HTTPS. Camada 7 (entende
HTTP). Pode encaminhar com base em caminho URL (`/api` para um grupo, `/static` para outro),
cabeçalhos de host e parâmetros de consulta. É o que a maioria das aplicações web usa.

**Network Load Balancer (NLB)**: Tráfego TCP, UDP e TLS. Camada 4 (não
entende HTTP). Extremamente alto desempenho, milhões de pedidos por segundo, muito
baixa latência. Use quando precisa de velocidade bruta ou quando não lida com HTTP.

**Gateway Load Balancer (GWLB)**: Para encaminhar tráfego através de aparelhos de rede
virtuais de terceiros (firewalls, detecção de intrusão). Raramente precisará disto ao nível júnior.

Para Nimbus (e para a maioria das aplicações web), ALB é a escolha correcta.

## Pontos Fortes e Limitações

**Por que razão ALB + Auto Scaling é poderoso**:

- Escalonamento sem tempo de inatividade (instâncias são adicionadas/removidas sem perturbar conexões existentes)
- Failover automático (instâncias insalubres são removidas do tráfego automaticamente)
- Eficiência de custo (pague apenas pelas instâncias em execução)
- Sem ponto único de falha — múltiplas instâncias em múltiplas AZs

**Onde fica complicado**:

- As aplicações com estado precisam de tratamento especial (sessões persistentes ou estado externo)
- O escalonamento para fora demora tempo — se o tráfego pica instantaneamente, há um atraso antes das novas
  instâncias estarem prontas. Pode mitigar isto com **escalonamento agendado** (pré-escalar
  antes de eventos conhecidos) ou um número mínimo de instâncias maior
- Mais peças móveis significa mais para monitorizar e depurar
- Algumas aplicações não podem ser facilmente escaladas horizontalmente (bases de dados, certos sistemas legados). O escalonamento horizontal funciona melhor para camadas sem estado.

## Resumo

- O **escalonamento horizontal** (adicionar mais servidores) é preferível ao escalonamento vertical
  (tornar um servidor maior) porque elimina pontos únicos de falha e
  permite custo elástico.
- Um **Application Load Balancer (ALB)** distribui tráfego HTTP/HTTPS recebido
  por múltiplos alvos EC2. Executa verificações de saúde e encaminha apenas para instâncias saudáveis.
- Um **Auto Scaling Group (ASG)** ajusta automaticamente o número de instâncias EC2
  com base em políticas de escalonamento definidas (ex.: utilização de CPU alvo).
- ALB e ASG trabalham em conjunto: o ASG gere o conjunto, o ALB distribui tráfego por ele.
- As aplicações com estado devem usar sessões persistentes (solução de curto prazo) ou
  externalizar o estado (design correcto a longo prazo).
- Para tráfego HTTP, use ALB. Para desempenho bruto TCP/UDP, use NLB.

## Dicas de Exame

*Domínio SAA-C03 2 — Tarefa 2.1 (arquitecturas escaláveis) / Domínio 3 — Tarefa 3.2*

- **As verificações de saúde do ASG podem vir do EC2 ou do ALB.** As verificações de saúde EC2 apenas detectam
  se a instância está a correr. As verificações de saúde ALB detectam se a aplicação está
  a responder correctamente. As verificações de saúde ALB são mais completas e devem ser preferidas
  para aplicações web.
- **O escalonamento de rastreamento de alvo é a resposta de exame mais comum** para políticas de escalonamento.
  O escalonamento simples (adicionar N instâncias quando alarme dispara) é mais antigo e menos adaptativo.
- **Escalar para fora é rápido; escalar para dentro é lento.** A AWS termina instâncias gradualmente durante
  o escalonamento para dentro para evitar perturbar conexões activas — um comportamento controlado pela definição de **atraso de desregisto** do ALB.
- **A contagem mínima de instâncias é o seu piso de resiliência.** Se definir o mínimo = 1
  e essa instância falhar, a sua aplicação está em baixo antes de o ASG poder reagir. Defina
  o mínimo ≥ 2 e distribua pelas AZs para resiliência real.
- **O ALB pode distribuir tráfego pelas AZs automaticamente.** Com o balanceamento de carga entre zonas activado, cada nó ALB distribui pedidos uniformemente por todos os alvos registados independentemente da AZ. Isto é importante para carga equilibrada quando as contagens de instâncias por AZ diferem.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: qual é a diferença entre um Application Load Balancer e
um Auto Scaling Group? Que problema cada um resolve e por que razão os usa normalmente em conjunto?

*(Sugestão: Um distribui tráfego que já existe; o outro ajusta a quantidade de
capacidade que tem.)*

**Exercício 2 — Prática de Exame**

*Cenário*: O website de comércio electrónico de uma empresa de retalho experimenta tráfego altamente variável:
pouco tráfego durante os dias da semana, picos massivos aos fins-de-semana e durante eventos de saldo instantâneos.
Querem que a aplicação lide com cargas de pico sem manter capacidade não utilizada
durante períodos calmos. A aplicação actualmente guarda dados de sessão em memória do servidor.

Qual alteração arquitectural MELHOR abordaria os seus requisitos de escalabilidade?

A) Actualizar para uma única instância EC2 muito grande que consiga lidar com o tráfego de pico
B) Implantar múltiplas instâncias EC2 atrás de um ALB com um Auto Scaling Group, e
   externalizar o armazenamento de sessão para ElastiCache
C) Implantar múltiplas instâncias EC2 atrás de um ALB com sessões persistentes activadas
D) Adicionar manualmente instâncias EC2 antes de cada pico de tráfego esperado e terminá-las depois

**Sugestão 1**: "Sem manter capacidade não utilizada" significa que precisa de escalonamento automático,
não uma instância grande fixa ou gestão manual.

**Sugestão 2**: O armazenamento de sessão em memória do servidor é um problema para implantações multi-instância.
Quais opções abordam isto?

**Sugestão 3**: A Opção C usa sessões persistentes — isso é uma solução alternativa, não uma correcção.
Qual opção aborda tanto o escalonamento como o problema de armazenamento de sessão correctamente?

**Resposta**: B

**Explicação**: Um ALB com um Auto Scaling Group fornece escalonamento automático e elástico
— instâncias são adicionadas durante picos e removidas durante períodos calmos. Mover o armazenamento de sessão
para ElastiCache (uma cache externa) torna a aplicação sem estado: qualquer
instância pode lidar com o pedido de qualquer utilizador, e o ALB pode distribuir tráfego livremente.
Esta é a solução arquitecturalmente correcta.

**Por que não A?** Uma única instância grande, por maior que seja, continua a ser um ponto único
de falha. Também desperdiça dinheiro durante períodos calmos quando a maior parte da sua capacidade fica inactiva.

**Por que não C?** As sessões persistentes encaminham um utilizador para a mesma instância, o que parcialmente
mitiga o problema de sessão mas prejudica o balanceamento de carga. Se essa instância
for terminada (durante o escalonamento para dentro ou falha), o utilizador perde a sessão de qualquer forma.

**Por que não D?** O escalonamento manual requer que alguém preveja os picos de tráfego correctamente
e actue com antecedência. É lento, propenso a erros e trabalhoso. O Auto Scaling lida
com isto automaticamente.

*Domínio SAA-C03 2 — Tarefa 2.1 / Domínio 3 — Tarefa 3.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus tem uma grande promoção a caminho: 50% de desconto em todas as encomendas durante 4 horas
no próximo sábado. No ano passado, uma promoção semelhante causou tráfego 10 vezes superior ao normal. A equipa
espera que o pico seja repentino e dure exactamente 4 horas.

O Auto Scaling vai eventualmente reagir, mas há um atraso. Como projectaria para este
pico conhecido? Qual é a diferença entre escalonamento reactivo e proactivo, e quando
faz sentido cada um?

*(Não existe uma resposta única correcta. Pense em acções de escalonamento agendado,
pré-aquecimento e as implicações de custo de cada abordagem.)*

## Cena Pós-Créditos

Na primeira sexta-feira após implantar Auto Scaling e o ALB, a equipa observou as
métricas juntos.

19:15: duas instâncias a correr. Carga normal.
19:45: carga sobe. Auto Scaling lança mais duas instâncias.
20:00: quatro instâncias a lidar com o pico. Tempos de resposta estáveis.
21:30: carga diminui. Auto Scaling termina duas instâncias.
21:45: de volta a duas instâncias.

O site nunca ficou em baixo. Nem uma vez.

Leo actualizou a página de métricas três vezes, como se esperasse encontrar uma falha que tinha perdido.

"É estranho que me sinta ligeiramente desapontado de que nada avariou?" disse ele.

"Sim," disse Priya.

Tom estava a olhar para a factura. O custo tinha acompanhado o tráfego quase perfeitamente.
"Pagámos exactamente pelo que usámos," disse ele. "Não mais. Não menos."

Parecia genuinamente surpreendido.

Na manhã seguinte, Maya encontrou um novo problema nos logs de erro. Não uma paragem — pior.

"A nossa base de dados," disse ela, "está a devolver tempos de consulta de oito segundos em média."

Oito segundos. Para uma aplicação de encomendas de restaurante.

"Cada vez que alguém carrega o menu, estamos a consultar todos os itens na base de dados para
construir a página," disse Leo. "E temos quarenta e sete restaurantes agora."

"Quantos itens de menu no total?" perguntou Tom.

Leo correu a consulta.

"Cerca de vinte e dois mil."

Silêncio.

No próximo capítulo: a base de dados que não precisa de um DBA — apenas de um cartão de crédito.
