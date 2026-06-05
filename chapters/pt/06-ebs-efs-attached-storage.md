# Capítulo 6: O Disco que o Acompanha

Tom tinha uma caneta vermelha e um hábito que deixava Leo nervoso.

Cada manhã de sábado, Tom imprimia o resumo da consola AWS — instâncias em execução, volumes de armazenamento, discos associados — e percorria-o linha a linha. Tinha estado a fazer isto desde a segunda semana. Chamava-lhe "o livro-razão". Leo chamava-lhe "a coisa que Tom faz que faz Leo sentir que fez algo errado".

Nesse sábado, Tom circulou algo e deixou a impressão na secretária de Maya sem dizer uma palavra.

Ela encontrou-a na manhã de segunda-feira. Um círculo. Uma nota na margem, três palavras:

*Tudo. Uma Máquina.*

O servidor web. A base de dados. Todos os registos de clientes. Dois meses de histórico de encomendas. Tudo a correr numa única instância EC2.

"O que acontece à base de dados se a instância colapsar?" perguntou Maya, a impressão na mão.

"Colapsa também," disse Leo.

"E os dados?"

"Depende de como a base de dados os guarda."

Esse "depende" era o problema.

**Como as Instâncias EC2 Guardam Dados**

Quando uma instância EC2 corre, o seu sistema operativo vive algures num disco. Esse disco
chama-se **volume raiz**. Por defeito, este é um **volume EBS** — mesmo quando não pensa nisso.

Mas existe outra coisa: as instâncias EC2 também têm armazenamento de **instance store**.

O instance store é armazenamento temporário fisicamente ligado ao hardware subjacente que
corre a sua máquina virtual. É extremamente rápido — mais rápido do que quase qualquer outra opção de armazenamento
na AWS. Mas tem um problema.

O instance store é **efémero**.

Quando a instância pára ou é terminada, os dados do instance store desaparecem. Permanentemente.
Irrecuperável. A AWS não avisa muito claramente sobre isso, o que é como as equipas
o descobrem: ao perder dados.

O instance store é adequado para caches, ficheiros de processamento temporários e espaço de trabalho. Nunca para dados importantes.

**EBS: O Disco Persistente**

**Amazon EBS** — Elastic Block Store — é armazenamento de blocos persistente para instâncias EC2.

Armazenamento de blocos significa que se comporta como um disco rígido real: o seu sistema operativo pode criar
sistemas de ficheiros nele, ler e escrever bytes arbitrários em posições arbitrárias, correr bases de dados
nele e tratá-lo exactamente como um disco associado.

As propriedades chave:

**Persistente.** Ao contrário do instance store, os volumes EBS sobrevivem a paragens, arranques e
mesmo à terminação de instâncias (dependendo da configuração). Os dados ficam no volume
mesmo quando nenhuma instância o está a usar.

**Associável e desassociável.** Um volume EBS pode ser desassociado de uma instância e
associado a outra. Se precisar de migrar dados ou recuperar de uma instância falhada,
pode desassociar o volume e reassociá-lo noutro lugar.

**Associação única (principalmente).** Por defeito, um volume EBS é associado a exactamente uma
instância EC2 de cada vez. Uma única instância pode ter múltiplos volumes EBS, mas um único
volume EBS não pode ser montado por múltiplas instâncias simultaneamente (com uma excepção:
EBS Multi-Attach, que tem casos de uso limitados e restrições importantes).

A analogia: EBS é um disco externo que se liga a um portátil. O portátil
(instância EC2) pode ler e escrever nele. Quando terminar, pode desligá-lo e
ligá-lo a um portátil diferente.

**Tipos de Volume EBS**

Nem todos os volumes EBS são iguais. A AWS oferece vários tipos com diferentes desempenho
e perfis de custo.

**gp3 (SSD de Uso Geral)**: A escolha por defeito para a maioria das cargas de trabalho. Bom equilíbrio de
desempenho e preço. Adequado para volumes de arranque, bases de dados pequenas e ambientes de desenvolvimento.

**io2 (SSD de IOPS Provisionados)**: Opção de alto desempenho para cargas de trabalho intensivas em I/O.
Especifica quantas operações de I/O por segundo (IOPS) precisa, e a AWS garante
esse desempenho. Adequado para bases de dados de produção grandes.

**st1 (HDD de Rendimento Optimizado)**: Armazenamento magnético optimizado para grandes leituras e escritas sequenciais. Custo mais baixo do que SSD, mas mais lento para I/O aleatório. Bom para armazenamento de dados e processamento de logs.

**sc1 (HDD Frio)**: A opção EBS mais barata. Para dados acedidos infrequentemente. Não
adequado para nada sensível ao tempo.

O exame não requer que memorize todos os tipos. Testa a sua capacidade de
corresponder requisitos ao tipo certo: requisitos de IOPS → io2. Cargas de trabalho sequenciais sensíveis ao custo → st1. Aplicações web gerais → gp3.

**Snapshots EBS: A Cópia de Segurança**

Aqui está algo que salva empresas regularmente.

Um **snapshot EBS** é uma cópia de segurança de um volume EBS num ponto no tempo, guardada em S3 (embora
aceda a ela através da interface EBS, não directamente através do S3). Os snapshots são
incrementais: o primeiro snapshot captura o volume completo; os snapshots subsequentes guardam apenas
o que mudou desde o último.

Pode criar um novo volume EBS a partir de um snapshot — restaurando para um ponto no tempo antes
de uma corrupção de base de dados, uma implantação má ou uma eliminação acidental.

Deve automatizar os snapshots. A AWS fornece o **Amazon Data Lifecycle Manager** para este
propósito: define uma política (tirar um snapshot a cada 6 horas, manter os últimos 7 dias), e
corre automaticamente.

Priya tinha isto configurado antes de a base de dados entrar em produção.

Leo não tinha pensado nisso.

**EFS: O Arquivo Partilhado**

O EBS é um disco associado a uma instância. E se múltiplas instâncias precisarem de aceder aos
mesmos ficheiros simultaneamente?

Entra em cena o **Amazon EFS** — Elastic File System.

O EFS é um sistema de ficheiros de rede gerido. Múltiplas instâncias EC2 podem montar o mesmo
sistema de ficheiros EFS ao mesmo tempo e ler/escrever em ficheiros partilhados. Esta é a capacidade chave
que o EBS não fornece.

Pense desta forma:

O EBS é um disco externo ligado a um portátil. Apenas esse portátil pode usá-lo de cada vez.

O EFS é um arquivo no centro de um escritório. Qualquer membro da equipa pode aproximar-se, abrir
uma gaveta, ler um ficheiro, colocar algo de volta. Múltiplas pessoas, simultaneamente, a aceder
ao mesmo armazenamento.

**Quando precisa de EFS?**

- Quando múltiplas instâncias EC2 precisam de partilhar ficheiros — sistemas de gestão de conteúdo, ficheiros de
  configuração partilhados, bibliotecas de média partilhadas
- Quando tem uma aplicação escalada horizontalmente onde todas as instâncias precisam de acesso
  aos mesmos dados
- Quando precisa de um sistema de ficheiros persistente que sobreviva a falhas de instâncias

**EFS vs. S3:** O EFS é um sistema de ficheiros (pastas, ficheiros, permissões, bloqueio). O S3 é
armazenamento de objectos (carregar, descarregar, sem semântica de sistema de ficheiros). O EFS é muito mais caro
do que o S3. Use S3 para ficheiros que são guardados e obtidos inteiros. Use EFS para ficheiros
que as aplicações lêem e escrevem activamente através de operações padrão de sistema de ficheiros.

**Escolher o Armazenamento Certo**

Já viu três tipos de armazenamento na AWS. Vamos tornar a decisão clara.

| Necessidade                                          | Tipo de Armazenamento    |
|------------------------------------------------------|--------------------------|
| Base de dados precisa de disco persistente e rápido  | EBS (gp3 ou io2)         |
| Múltiplos servidores precisam de ficheiros partilhados | EFS                    |
| Ficheiros, cópias de segurança, imagens, objectos grandes | S3                  |
| Espaço de trabalho temporário de computação          | Instance Store           |
| Archives de longo prazo ao custo mínimo              | S3 Glacier               |

Tomar esta decisão correctamente importa. Usar S3 onde precisa de EFS acrescenta complexidade operacional.
Usar EBS onde precisa de EFS causa falhas quando escala. Usar instance store onde precisa de persistência perde dados.

Priya imprimiu esta tabela e pregou-a na parede.

"Cada vez que adicionamos um requisito de armazenamento," disse ela, "começamos aqui."

## Pontos Fortes e Limitações

**Pontos fortes do EBS**:

- Armazenamento de blocos persistente e rápido para EC2
- Snapshots para cópia de segurança e recuperação num ponto no tempo
- Múltiplos níveis de desempenho para diferentes cargas de trabalho
- Encriptação em repouso suportada nativamente

**Limitações do EBS**:

- Associado a uma instância de cada vez (com excepções menores)
- Na mesma AZ que a instância EC2 (copiar para outra AZ requer um snapshot)
- Paga pelo armazenamento provisionado, não apenas pelo que usa

**Pontos fortes do EFS**:

- Sistema de ficheiros partilhado multi-instância — protocolo NFS nativo
- Escala automaticamente, não provisiona capacidade
- Acessível entre AZs dentro de uma Região

**Limitações do EFS**:

- Mais caro do que S3 por GB
- Maior latência do que EBS para I/O aleatório
- Não disponível em todas as Regiões

## Resumo

- O **Instance store** é armazenamento temporário e rápido fisicamente ligado ao anfitrião.
  Os dados perdem-se quando a instância pára ou termina. Apenas para espaço de trabalho.
- **EBS** (Elastic Block Store) é armazenamento de blocos persistente para uma única instância EC2.
  Sobrevive a paragens de instâncias. Pode ser tirado snapshot para cópia de segurança. Escolha o tipo de volume
  certo (gp3 para uso geral, io2 para requisitos de IOPS elevados).
- **EFS** (Elastic File System) é um sistema de ficheiros de rede partilhado que múltiplas instâncias
  podem montar simultaneamente. Use-o quando múltiplos servidores precisam de acesso aos mesmos ficheiros.
- Corresponda o tipo de armazenamento ao requisito: base de dados → EBS; ficheiros partilhados → EFS;
  objectos/cópias de segurança → S3; archives → S3 Glacier.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.1 (soluções de armazenamento)*

- **Os volumes EBS vivem numa AZ.** Só podem ser associados a uma instância na
  mesma AZ. Para usar um volume EBS numa AZ diferente, cria um snapshot e restaura-o
  na AZ de destino.
- **Os snapshots EBS são incrementais e guardados em S3.** O primeiro snapshot é completo;
  os seguintes guardam apenas as alterações. Pode copiar snapshots para outras Regiões para
  recuperação de desastres.
- **EFS é inter-AZ.** Múltiplas instâncias em diferentes AZs dentro da mesma Região
  podem montar o mesmo sistema de ficheiros EFS. Este é um diferenciador chave do EBS.
- **Quando um cenário de exame diz "aplicação web com conteúdo partilhado" ou "múltiplas
  instâncias a aceder aos mesmos ficheiros", pense em EFS.** Quando diz "armazenamento de base de dados"
  ou "disco persistente para um servidor", pense em EBS.
- **Os dados do instance store sobrevivem a um reinício mas não a uma paragem ou terminação.** Uma pergunta
  pode descrever dados que "desaparecem depois de a instância ser parada" — isso é instance store em jogo.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: qual é a diferença entre EBS e EFS? Quando escolheria
um em vez do outro?

*(Sugestão: Pense se uma instância ou múltiplas instâncias precisam de aceder ao
armazenamento ao mesmo tempo.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa corre uma aplicação web em quatro instâncias EC2 atrás de um balanceador de carga.
Os utilizadores podem carregar fotos de perfil. Todas as quatro instâncias devem poder servir
a foto de qualquer utilizador imediatamente após o carregamento, independentemente de qual instância tratou
o carregamento. A equipa precisa de armazenamento de ficheiros partilhado e persistente.

Qual solução de armazenamento MELHOR satisfaz os seus requisitos?

A) Associar um volume EBS gp3 a cada instância EC2 e sincronizar ficheiros entre elas usando
   um cron job  
B) Guardar fotos directamente no instance store da instância EC2  
C) Usar Amazon EFS, montado em todas as quatro instâncias EC2 simultaneamente  
D) Guardar fotos em S3 e aceder-lhes directamente a partir do código da aplicação

**Sugestão 1**: O requisito é "todas as quatro instâncias devem servir qualquer foto". Quais opções
tornam um ficheiro imediatamente visível a todas as instâncias?

**Sugestão 2**: O instance store é efémero. O EBS não pode ser montado em múltiplas instâncias
simultaneamente. Isso reduz as opções.

**Sugestão 3**: Tanto C como D poderiam teoricamente funcionar. Qual é mais adequado para um
caso em que a aplicação precisa de aceder a fotos através de operações de sistema de ficheiros vs.
pedidos HTTP?

**Resposta**: D

**Explicação**: Guardar fotos em S3 e servi-las via URL é a escolha arquitecturalmente
correcta para uma aplicação web. As fotos carregadas são imediatamente acessíveis a partir de
qualquer servidor (e de qualquer browser) através do URL do S3. O S3 é projectado exactamente para este
caso de uso: guardar ficheiros carregados por utilizadores em escala com alta disponibilidade e zero
de sobrecarga de gestão.

Nota: C (EFS) funcionaria tecnicamente, mas o S3 é o padrão preferido para ficheiros binários carregados por utilizadores em aplicações web porque é mais barato, mais escalável e serve ficheiros
via HTTP directamente sem a aplicação actuar como proxy.

**Por que não A?** Sincronizar ficheiros via cron job cria condições de corrida e problemas de consistência.
Entre carregamentos e a próxima sincronização, os ficheiros estariam em falta noutras instâncias.

**Por que não B?** Os dados do instance store perdem-se quando a instância é parada ou terminada.
As fotos desapareceriam.

**Por que não C?** O EFS é a resposta certa se a aplicação precisar de semântica de sistema de ficheiros
(ex.: um CMS que modifica ficheiros no lugar). Para fotos carregadas por utilizadores servidas pela web,
o S3 é mais simples, mais barato e mais adequado.

*Domínio SAA-C03 3 — Tarefa 3.1*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a adicionar uma nova funcionalidade: os proprietários de restaurantes podem carregar menus PDF que são
depois analisados e usados para popular a base de dados Nimbus. O trabalho de processamento de PDF corre
num conjunto de instâncias EC2 que precisam de: (a) ler o PDF carregado, (b) escrever
ficheiros de processamento temporários, (c) escrever o resultado analisado.

Que serviços de armazenamento usaria para cada um destes três passos, e porquê?

*(Não existe uma resposta única correcta. Concentre-se em corresponder o tipo de armazenamento às
características de cada passo.)*

## Cena Pós-Créditos

Nessa tarde, Nimbus separou o seu armazenamento correctamente. A base de dados obteve o seu próprio
volume EBS com snapshots automatizados. As fotos de menus mudaram para S3. A instância EC2 finalmente
tinha espaço para respirar.

Leo correu um teste de carga. O site aguentou duzentos utilizadores em simultâneo sem avariar.

Tom olhou para a factura. O volume EBS estava a acrescentar 8 dólares por mês. Escreveu-o.

"Continuo a acrescentar coisas a esta factura," disse ele. "Quando equilibra?"

"Quando pararmos de ter paragens," disse Maya. "Cada paragem custa mais do que a prevenção."

Tom não pareceu convencido. Estaria, eventualmente.

Três dias depois, um proprietário de restaurante na plataforma tentou fazer uma encomenda e obteve
um erro. Maya verificou os logs.

A base de dados estava lá. A aplicação estava a correr. Mas vinte utilizadores em simultâneo
estavam todos a tentar ler o menu de uma vez, e cada um estava a aceder à base de dados.

"Cada carregamento de página é uma consulta à base de dados," disse Leo. "Cada uma delas."

Priya já estava a pesquisar algo.

No próximo capítulo: o que acontece quando chegam mais clientes do que o servidor consegue aguentar.
