# Capítulo 4: Um Computador no Edifício de Outra Pessoa

A aplicação Nimbus estava a correr no portátil de Tom.

Isso era aceitável para mostrar uma demonstração a investidores. Não era aceitável quando Maya carregou em "lançar"
e 200 restaurantes se inscreveram na primeira semana. O portátil de Tom estava agora a processar encomendas reais,
menus reais e clientes reais — debaixo da secretária de Tom, ligado à rede Wi-Fi do escritório,
ligado a uma extensão que também alimentava um aquecedor portátil e uma
máquina de café.

"Precisamos de um servidor," disse Maya. "Um de verdade. A correr nalgum lugar que não seja debaixo da sua secretária."

Tom olhou para o seu portátil. O ventilador era audível do outro lado da sala.

Foi então que começaram a analisar o que significa realmente alugar um computador.

**A Abstracção Que Ninguém Explica**

Quando as pessoas dizem que a sua aplicação "corre na nuvem", normalmente querem dizer que corre numa
máquina virtual — um computador que não existe fisicamente como hardware dedicado,
mas que se comporta em todos os sentidos como se existisse.

Eis o mecanismo.

Um servidor físico num centro de dados AWS tem muitos recursos: núcleos de CPU, memória, disco
e largura de banda de rede. A AWS pega nesse servidor físico e divide-o usando software
chamado **hipervisor**. O hipervisor cria múltiplas máquinas virtuais, cada uma
aparentando ter a sua própria CPU dedicada, memória e disco — mas partilhando na realidade o
hardware físico subjacente.

Cada uma dessas máquinas virtuais é o que a AWS chama uma **instância EC2**.

EC2 significa Elastic Compute Cloud. A parte "elástica" é importante, e chegaremos
a ela. Por agora: uma instância EC2 é um computador que aluga por hora. Tem um sistema operativo, uma conexão de rede e poder de computação. Corre a sua aplicação tal como
um servidor físico faria.

A analogia: alugar um apartamento num grande edifício versus comprar uma casa.

O dono do edifício (AWS) mantém a estrutura física, a canalização, a electricidade,
a segurança. Tem uma unidade. Amobla-a como quiser. Paga mensalmente (ou
por hora). Quando precisar de mais espaço, muda para uma unidade maior. Quando se mudar, pára
de pagar.

**Escolher a Sua Instância: O Tamanho Importa**

Nem todas as instâncias EC2 são iguais. A AWS oferece centenas de tipos de instância, organizados
em famílias com base no que são optimizadas.

**Uso geral** (ex.: `t3`, `m6i`): CPU e memória equilibradas. Boa escolha por defeito
para a maioria das aplicações web.

**Optimizada para computação** (ex.: `c7g`): Mais CPU em relação à memória. Boa para codificação de vídeo,
modelação científica, processamento em lote.

**Optimizada para memória** (ex.: `r7i`): Mais memória em relação à CPU. Boa para bases de dados,
cache, análise em memória.

**Optimizada para armazenamento** (ex.: `i3`): Armazenamento local de alta velocidade. Boa para cargas de trabalho intensivas em dados
que precisam de I/O de disco muito rápido.

**Computação acelerada** (ex.: `p4`): GPUs incluídas. Boa para treino de aprendizagem automática
e renderização gráfica.

Cada família tem tamanhos. Uma `t3.micro` tem 2 CPUs virtuais e 1 GB de memória. Uma
`t3.xlarge` tem 4 CPUs virtuais e 16 GB. Escolhe o tamanho certo para a carga de trabalho.

Leo tinha escolhido uma `t3.micro`.

"Quantos utilizadores consegue uma `t3.micro` aguentar?" perguntou Tom.

"Depende da aplicação," disse Leo. "Mas provavelmente não cem utilizadores em simultâneo
a fazer carregamentos de imagens e consultas à base de dados."

Tom escreveu "t3.micro" no quadro branco e desenhou uma cara triste ao lado.

**A AMI: O Estado Inicial da Sua Máquina**

Antes de lançar uma instância EC2, escolhe o seu sistema operativo e configuração inicial.
Na AWS, isto chama-se **Amazon Machine Image** (AMI).

Uma AMI é um modelo. Define:

- O sistema operativo (Amazon Linux, Ubuntu, Windows Server, etc.)
- Software pré-instalado
- O estado inicial do disco

Quando lança uma instância a partir de uma AMI, a AWS cria uma cópia fresca desse modelo
especificamente para si. Também pode criar as suas próprias AMIs — se configurar um servidor exactamente
como quer, pode "guardar" esse estado como uma AMI personalizada e usá-la para lançar
servidores idênticos rapidamente. É assim que implanta ambientes consistentes em escala.

Pense numa AMI como uma receita. A receita descreve a refeição. Cada vez que segue a
receita, obtém a mesma refeição. Se quiser mudar a refeição permanentemente, actualiza
a receita.

**Pares de Chaves: A Forma Correcta de Aceder a um Servidor**

Lembra-se do desastre "Admin123" do capítulo anterior?

A forma correcta de fazer login numa instância EC2 é com um **par de chaves**.

Um par de chaves é um par criptográfico: uma chave pública (guardada pela AWS no servidor) e uma
chave privada (um ficheiro que descarrega e mantém em segredo). Para fazer login, usa SSH — um protocolo seguro — com a sua chave privada. Não há palavra-passe. Se perder a chave privada,
perde o acesso. Não existe "esqueci a minha palavra-passe" para SSH.

Isto importa porque os pares de chaves são:

- Únicos para si
- Criptograficamente impossíveis de adivinhar
- Não guardados pela AWS (você mantém a chave privada)
- Fáceis de revogar (eliminar a chave do servidor, gerar um novo par)

Priya já tinha configurado o acesso baseado em chaves no servidor Nimbus. O servidor Admin123
foi desactivado. Ninguém estava triste por isso.

**Ciclo de Vida das Instâncias: Não é Para Sempre**

Isto é algo que muitos principiantes perdem.

As instâncias EC2 não são permanentes por defeito. Quando para uma instância, o recurso de computação
é libertado. Quando a inicia novamente, pode correr em hardware físico diferente. Quaisquer dados guardados *na própria instância* (no seu volume raiz) sobrevivem
a um ciclo de paragem/início — mas o endereço IP público muda.

Quando *termina* uma instância, ela desaparece. A não ser que tenha armazenamento separado associado
(que cobrimos no Capítulo 6), quaisquer dados na instância desaparecem.

Esta "efemeridade" é na verdade uma funcionalidade, não um problema. Significa que pode lançar
servidores, usá-los e descartá-los. Permite o escalonamento horizontal. Mas também
significa que nunca deve guardar dados importantes *na* própria instância EC2.

Onde vivem os dados então?

Em armazenamento separado. Chegamos a isso nos próximos dois capítulos.

**O Que Significa "Elástico"**

Dissemos que EC2 significa Elastic Compute Cloud. O que tem de elástico?

Duas coisas:

**Elasticidade vertical**: Pode alterar o tamanho de uma instância. Pare a instância,
mude-a de `t3.micro` para `t3.xlarge`, reinicie. Mais CPU e memória, mesma
aplicação, mesma configuração.

**Elasticidade horizontal**: Pode adicionar mais instâncias. Em vez de um servidor grande,
corra dez servidores médios atrás de um balanceador de carga. Quando o tráfego diminui, remova instâncias
e pare de pagar por elas.

Ambas as abordagens resolvem o problema de "um servidor, demasiado tráfego". Têm diferentes
compromissos, que exploramos no Capítulo 7 quando adicionamos Auto Scaling à história.

O insight fundamental: com EC2, o poder de computação é algo que *regula* em vez de algo que
*compra*. Precisa de mais? Aumente. Precisa de menos? Diminua. Pague em conformidade.

## Pontos Fortes e Limitações

**Por que razão EC2 é poderoso**:

- Controlo total. Escolhe o SO, o software, a configuração. É o seu computador.
- Dimensionamento flexível. Centenas de tipos de instância para cada caso de uso.
- Sem hardware para gerir. A AWS trata da camada física.
- Facturação por segundo (para a maioria dos tipos de instância). Para a instância, pára de pagar.
- Funciona com tudo. EC2 é a base sobre a qual a maioria dos outros serviços AWS é construída.

**Onde fica complicado**:

- É responsável por aplicar patches e actualizar o sistema operativo. (Modelo de Responsabilidade
  Partilhada — esta é a parte "na nuvem" que é sua.)
- Gerir EC2 em escala significa gerir estado de instâncias, AMIs, patches de segurança e
  ciclo de vida em potencialmente milhares de máquinas. Isso é sobrecarga operacional.
- EC2 não é a resposta certa para tudo. Para código orientado a eventos que corre
  infrequentemente, Lambda (Capítulo 20) é mais barato e mais simples. Para cargas de trabalho
  em contentores, ECS e EKS (Capítulo 21) oferecem melhor eficiência de recursos.
- Instâncias não utilizadas ainda custam dinheiro. Se parar uma instância, pára de pagar pela
  computação — mas se tiver armazenamento associado, ainda paga por isso.

## Resumo

- Uma **instância EC2** é uma máquina virtual que aluga na AWS. Tem um SO, acesso à rede
  e recursos de computação.
- Os tipos de instância são organizados por caso de uso: uso geral, optimizado para computação,
  optimizado para memória, optimizado para armazenamento, computação acelerada. Escolha a família
  e o tamanho certos para a sua carga de trabalho.
- Uma **AMI** (Amazon Machine Image) é o modelo para o SO e configuração inicial da sua instância. As AMIs personalizadas permitem implantações consistentes e repetíveis.
- **Pares de chaves** são a forma segura de aceder a instâncias EC2. Sem palavras-passe.
- As instâncias EC2 não são permanentes por defeito. As instâncias terminadas perdem os seus dados.
  Guarde dados importantes em serviços de armazenamento separados.
- "Elástico" significa que pode escalar a computação para cima e para baixo — tanto verticalmente (instâncias maiores)
  como horizontalmente (mais instâncias).

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.2 (soluções de computação de alto desempenho)*

- **Responsabilidade Partilhada para EC2**: É responsável por aplicar patches ao SO.
  A AWS mantém o hardware físico e o hipervisor. Esta é uma distinção testada frequentemente.
- **As famílias de instâncias importam para perguntas de cenário.** Se um cenário menciona requisitos de alta
  memória (cache em memória, SAP HANA), a resposta provavelmente envolve uma
  instância optimizada para memória. Se menciona processamento em lote ou HPC, optimizado para computação.
- **Parar ≠ Terminar.** Parar uma instância preserva-a (pode reiniciá-la).
  Terminar elimina-a. Cenários de exame testam se conhece esta distinção.
- **O IP público muda no reinício.** Se a sua aplicação precisa de um endereço IP estável,
  use um **Elastic IP** — um IP público estático que fica associado à sua conta.
  Isto custa dinheiro se alocar um e não o usar.
- Os modelos de preços **On-Demand, Reservado e Spot** são testados intensamente no Domínio 4.
  Cobrimo-los no Capítulo 27. Por agora, saiba que On-Demand significa pagar por segundo
  sem compromisso.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: o que é uma instância EC2? O que é uma AMI? Qual é a relação
entre elas?

*(Sugestão: Pense na analogia da receita — qual é a receita e qual é a refeição?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa está a implantar uma aplicação web de alto tráfego. A aplicação
processa pesquisas no catálogo de produtos com lógica de filtragem complexa que é intensiva em CPU.
A equipa espera picos de tráfego significativos durante eventos de saldo. Quer garantir
que escolhe o tipo de instância EC2 certo e está preparada para picos de tráfego.

Qual combinação de escolhas MELHOR satisfaz os seus requisitos?

A) Instâncias optimizadas para memória com um número fixo para garantir desempenho consistente  
B) Instâncias optimizadas para computação com Auto Scaling para lidar com picos de tráfego  
C) Instâncias de uso geral com um único tamanho de instância grande  
D) Instâncias optimizadas para armazenamento porque o catálogo de produtos requer acesso rápido ao disco

**Sugestão 1**: A carga de trabalho é descrita como "intensiva em CPU". Qual família de instâncias é
optimizada para CPU?

**Sugestão 2**: O cenário menciona "picos de tráfego durante eventos de saldo". Um número fixo
de instâncias não lidará eficientemente com tráfego variável. Que funcionalidade AWS lida com isso?

**Sugestão 3**: As instâncias optimizadas para computação lidam com trabalho intensivo em CPU. O Auto Scaling adiciona
e remove instâncias com base na procura. Juntos respondem a ambos os requisitos.

**Resposta**: B

**Explicação**: As instâncias optimizadas para computação (como a família `c`) fornecem mais CPU
por valor para cargas de trabalho intensivas em CPU. O Auto Scaling ajusta automaticamente o número
de instâncias com base na carga — adicionando instâncias durante eventos de saldo, removendo-as quando
o tráfego regressa ao normal. Esta combinação optimiza tanto o desempenho como o custo.

**Por que não A?** As instâncias optimizadas para memória são concebidas para cargas de trabalho que precisam de grandes
quantidades de RAM (bases de dados, caches em memória). Esta é uma carga de trabalho limitada por CPU. E contagens fixas
de instâncias significam ou sobreaprovisionar (desperdício) ou subprovisionr (falha).

**Por que não C?** As instâncias de uso geral trocam alguma eficiência de CPU por equilíbrio. Para
uma carga de trabalho intensiva em CPU conhecida, optimizado para computação é mais apropriado. E uma única
instância grande é um único ponto de falha.

**Por que não D?** O gargalo é CPU, não I/O de disco. As instâncias optimizadas para armazenamento
são concebidas para cargas de trabalho que precisam de muito alto rendimento para armazenamento local.

*Domínio SAA-C03 3 — Tarefa 3.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus actualmente corre uma única instância EC2 `t3.micro` para toda a aplicação.
A equipa precisa de decidir: actualizar para uma instância maior (`t3.2xlarge`) ou adicionar mais
instâncias `t3.micro` atrás de um balanceador de carga?

Percorra os compromissos. Quais são as vantagens de cada abordagem? Que
perguntas faria para decidir? (Sugestão: pense em pontos únicos de falha,
custo, complexidade de implantação e o que acontece durante a manutenção.)

*(Não existe uma resposta única correcta. Trata-se de raciocinar sobre escalonamento vertical vs.
horizontal.)*

## Cena Pós-Créditos

Leo passou a tarde a redimensionar o servidor. Mudou de uma `t3.micro` para uma `t3.large`.
A CPU desceu para 30%. As páginas carregavam em menos de um segundo.

Tom observou a factura AWS a actualizar em tempo real. A nova instância custava quatro vezes mais
por hora. Fez uma nota.

Maya estava a olhar para outra coisa no seu ecrã.

"Leo," disse ela. "Enquanto estava a redimensionar a instância, o website esteve em baixo durante
doze minutos."

Leo levantou os olhos.

"Tínhamos uma fila de duzentas encomendas por cumprir."

Ele olhou para o ecrã. Depois para o tecto. Depois de volta para o ecrã.

"Precisamos de algo para as nossas imagens," disse ele, mudando ligeiramente de assunto. "Agora,
as fotos de menus carregadas são guardadas directamente no servidor. Se redimensionarmos ou reiniciarmos a
instância, perdemo-las?"

Priya já sabia a resposta.

No próximo capítulo: onde vivem os ficheiros quando não há disco rígido para apontar.
