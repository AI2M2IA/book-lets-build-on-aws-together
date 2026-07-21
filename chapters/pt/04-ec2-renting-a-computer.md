# Capítulo 4: Um Computador no Prédio de Outra Pessoa

O gráfico de CPU tinha virado música de fundo.

O laptop do Tom estava aberto no canto da mesa, o CloudWatch atualizando a cada minuto, a linha de utilização subindo com uma inclinação que significava que algo estava trabalhando duro. Maya tinha reparado nisso três dias atrás e não tinha mencionado a ninguém. Ela estivera observando a fila de pedidos em vez disso.

O IAM estava no lugar. As credenciais estavam em ordem. Priya tinha MFA em tudo. A equipe se sentia, pela primeira vez, como se estivesse sendo ligeiramente responsável. Mas ser responsável não resolvia o problema que Maya estava observando: os números no painel de pedidos subindo enquanto a linha de CPU subia com eles.

O app da Nimbus estava rodando na instância que Leo tinha lançado sem pensar — aquela que ele "implantou em algum lugar" lá atrás, antes de alguém saber o que era uma Região.

Isso estava ótimo para mostrar uma demo a investidores. Não estava ótimo quando Maya apertou "lançar" e duzentos cadastros entraram na primeira semana — quarenta e sete restaurantes ativamente recebendo pedidos todo dia. A instância improvisada do Leo agora estava lidando com pedidos reais, cardápios reais e clientes reais — uma máquina escolhida por acidente, dimensionada por padrão, configurada por uma pessoa que tinha aprendido AWS enquanto digitava.

"A gente precisa de um servidor," disse Maya. "Um de verdade. Um que alguém de fato tenha escolhido de propósito."

Tom olhou para o gráfico de CPU. A linha era visível do outro lado da sala.

Foi então que começaram a investigar o que de fato significa alugar um computador.

**A Abstração Que Ninguém Explica**

Quando as pessoas dizem que sua aplicação "roda na nuvem", elas geralmente querem dizer que ela roda em uma
máquina virtual — um computador que não existe fisicamente como hardware dedicado,
mas que se comporta em todos os sentidos como se existisse.

Eis o mecanismo.

Um servidor físico em um centro de dados da AWS tem muitos recursos: núcleos de CPU, memória, disco
e largura de banda de rede. A AWS pega esse servidor físico e o divide usando software
chamado **hipervisor** — software que age como o zelador de um prédio, dividindo
os recursos do servidor físico entre múltiplos inquilinos virtuais. O hipervisor cria
múltiplas máquinas virtuais, cada uma parecendo ter sua própria CPU, memória e
disco dedicados — mas na verdade compartilhando o hardware físico subjacente.

Pense nisso como alugar um apartamento em um prédio grande, em vez de comprar uma casa.

O dono do prédio (AWS) mantém a estrutura física — o encanamento, a parte elétrica,
a segurança. Você recebe uma unidade. Você a mobília como quiser. Você paga mensalmente (ou
por hora). Quando você precisa de mais espaço, você se muda para uma unidade maior. Quando você se muda para fora, você
para de pagar.

Cada um desses aluguéis de máquina virtual é o que a AWS chama de **instância EC2** — Elastic
Compute Cloud.

EC2 significa Elastic Compute Cloud. A parte "elastic" (elástica) é importante, e vamos
chegar nela. Por enquanto: uma instância EC2 é um computador que você aluga por hora. Ela tem um sistema
operacional, uma conexão de rede e poder computacional. Ela roda sua aplicação assim como
um servidor físico rodaria.

**Escolhendo Sua Instância: O Tamanho Importa**

Nem todas as instâncias EC2 são iguais. A AWS oferece centenas de tipos de instância, organizados
em famílias com base no que são otimizadas para fazer.

**Uso geral** (ex.: `t3`, `m6i`): CPU e memória balanceadas. Boa escolha padrão
para a maioria das aplicações web. A família `t3` é burstable — ela acumula créditos de CPU
durante períodos de baixa utilização e os gasta durante picos. Ótima para ambientes de
desenvolvimento e cargas de trabalho com demanda variável de CPU. A família `m6i` fornece
desempenho consistente e não burstable — melhor para cargas de trabalho de produção com necessidades sustentadas de CPU.

**Otimizadas para computação** (ex.: `c7g`): Mais CPU em relação à memória. Boas para
codificação de vídeo, modelagem científica, processamento em lote. O sufixo "g" em `c7g` significa que a
instância usa processadores AWS Graviton — chips baseados em ARM que a AWS projetou internamente,
oferecendo melhor relação preço-desempenho para muitas cargas de trabalho do que instâncias x86 equivalentes.

**Otimizadas para memória** (ex.: `r7i`): Mais memória em relação à CPU. Boas para bancos de dados,
cache, analytics em memória. Se você está rodando um banco de dados cujo desempenho melhora
dramaticamente ao manter mais dados em RAM, a família R é o ponto de partida certo.

**Otimizadas para armazenamento** (ex.: `i3`): Armazenamento local de alta velocidade. Boas para cargas de trabalho
intensivas em dados que precisam de I/O de disco muito rápido. O armazenamento NVMe local nessas instâncias é
significativamente mais rápido que o EBS — mas também é efêmero. Use-o para dados temporários,
não para nada que você não possa se dar ao luxo de perder.

**Computação acelerada** (ex.: `p4`): GPUs anexadas. Boas para treinamento de machine
learning e renderização de gráficos. Essas instâncias são caras — uma `p3.8xlarge` custa
mais de US$ 12 por hora — mas para cargas de trabalho que se beneficiam do paralelismo de GPU, não há
substituto.

Cada família tem tamanhos. Uma `t3.micro` tem 2 CPUs virtuais e 1 GB de memória. Uma
`t3.xlarge` tem 4 CPUs virtuais e 16 GB. Uma `t3.2xlarge` dobra de novo. O padrão de
nomenclatura é consistente: o sufixo vai `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, e além.

Leo tinha escolhido uma `t3.micro`.

"Quantos usuários uma `t3.micro` aguenta?" perguntou Tom. "E quanto a mais custa uma maior?"

"Depende da aplicação," disse Leo. "Mas provavelmente não cem usuários simultâneos
rodando uploads de imagem e consultas de banco de dados."

"Quanto isso custa por mês?" perguntou Tom, olhando a página de comparação de tipos de instância.

Leo abriu a página de preços da AWS. A t3.micro custava cerca de US$ 8 por mês. A t3.small era US$ 17. A t3.medium era US$ 33. A t3.large era cerca de US$ 60. A diferença aumentava rápido conforme você subia — não de forma linear, mas dobrando aproximadamente a cada passo de tamanho. Tom anotou os números, notando que cada passo de tamanho dobrava a memória — mas, curiosamente, não a contagem de CPU. Toda t3 de micro até large tinha as mesmas 2 vCPUs; a contagem não aumentava até a xlarge. A **linha de base de créditos de CPU** — a fatia dessas vCPUs que a instância podia usar continuamente sem queimar seus créditos de burst — também crescia, embora não a cada passo.

Tom escreveu "t3.micro" no quadro branco e desenhou uma carinha triste ao lado.

**A Conversa Sobre Dimensionamento Correto**

A t3.micro durou cerca de um mês antes de o tráfego de sexta à noite esmagá-la. Leo fez o upgrade às pressas — direto para uma t3.large, raciocinando que grande demais era mais seguro que pequeno. Duas semanas após a mudança para a t3.large, Tom sinalizou algo.

"A CPU está em 9%," disse ele. "Média. Nos últimos sete dias."

Leo olhou para o gráfico do CloudWatch. 9% de CPU em média. Picos de talvez 35% durante o jantar de sexta. O resto do tempo: mal se mexendo.

"A gente está rodando um servidor de US$ 60 por mês," disse Tom, "a 9% da sua capacidade."

"Mas e os picos de sexta?" disse Leo. "A gente precisa de folga."

"Os picos de sexta chegam a 35%," disse Tom. "Uma t3.small tem as mesmas duas vCPUs — o que é menor é a linha de base de créditos, cerca de 20% sustentado. A gente tem média de 9%. Isso significa que estaríamos acumulando créditos de CPU o dia todo, todo dia, e gastando alguns deles por algumas horas nas noites de sexta. Eu verifiquei a matemática do `CPUCreditBalance` — o saldo nunca chega perto de zerar. São US$ 17 por mês. A gente tem folga."

Leo olhou para os números. Olhou para o gráfico. Sentiu o desconforto de um engenheiro que superprovisionou e sabe disso.

"Mas e se a gente tiver um pico?" disse ele.

"Então as métricas vão nos avisar antes de doer," disse Priya. "E eventualmente a gente vai configurar Auto Scaling — é literalmente para isso que ele serve. Você não vai precisar provisionar para o pico manualmente assim que o sistema puder adicionar instâncias automaticamente."

Eles reduziram para uma t3.small. A conta mensal caiu US$ 40. Ao longo de um ano, isso era US$ 480 — não é nada, especialmente para uma startup. Tom anotou na sua planilha com a satisfação tranquila de alguém que vinha esperando para fazer essa observação por duas semanas.

Esse padrão tem um nome: **dimensionamento correto** (right-sizing). Significa casar o tamanho da instância com a carga de trabalho real, não com o pior caso imaginado. Ferramentas da AWS como o AWS Compute Optimizer e métricas do CloudWatch tornam o dimensionamento correto uma decisão orientada por dados em vez de um chute.

**A AMI: O Estado Inicial da Sua Máquina**

Antes de lançar uma instância EC2, você escolhe o sistema operacional e a configuração
inicial dela. Na AWS, isso se chama **Amazon Machine Image** (AMI).

Uma AMI é um template. Ela define:

- O sistema operacional (Amazon Linux, Ubuntu, Windows Server, etc.)
- Software pré-instalado
- O estado inicial do disco

Quando você lança uma instância a partir de uma AMI, a AWS cria uma cópia nova desse template
só para você. Você também pode criar suas próprias AMIs — se você configura um servidor exatamente
do jeito que quer, você pode "salvar" esse estado como uma AMI customizada e usá-la para lançar
servidores idênticos rapidamente. É assim que você implanta ambientes consistentes em escala.

Pense em uma AMI como uma receita. A receita descreve o prato. Cada vez que você segue a
receita, você obtém o mesmo prato. Se você quer mudar o prato permanentemente, você atualiza
a receita.

A AWS fornece um marketplace de AMIs — algumas são mantidas pela AWS (Amazon Linux 2, Amazon
Linux 2023), algumas são mantidas pelas grandes distribuições Linux (Ubuntu, Red Hat, SUSE),
e algumas vêm de fornecedores terceiros (servidores de banco de dados pré-configurados, appliances
de segurança, software comercial). Para a maioria das aplicações web, uma AMI Amazon Linux
mantida pela AWS ou uma AMI Ubuntu LTS é o ponto de partida certo.

Para a Nimbus, Leo construiu uma AMI customizada que partia da base mais recente do Amazon Linux 2023
e adicionava o runtime do Node.js, as dependências de sistema da aplicação, e um arquivo de
serviço pré-criado para o processo da aplicação. Novas instâncias lançadas a partir dessa AMI começavam
a atender tráfego em menos de 90 segundos — significativamente mais rápido que o tempo de boot de quatro
minutos ao usar scripts de UserData para instalar tudo do zero.

Há um trade-off: AMIs customizadas precisam ser mantidas. Toda vez que você atualiza uma dependência
de sistema ou a versão do runtime, você precisa reconstruir a AMI. Equipes que deixam suas
AMIs ficarem desatualizadas se encontram rodando instâncias com software defasado — um risco
de segurança. Priya colocou "reconstruir AMI com pacotes mais recentes" no checklist mensal de engenharia.

"Quanto custa armazenar AMIs?" perguntou Tom.

AMIs são armazenadas como snapshots EBS — você paga a taxa de snapshot EBS (aproximadamente US$ 0,05
por GB por mês) pelo tamanho da AMI. Uma AMI Amazon Linux típica com a stack da aplicação
Nimbus tinha cerca de 4 GB. A US$ 0,05/GB: US$ 0,20 por mês por AMI. Manter cinco
AMIs históricas para fins de rollback: US$ 1/mês. Não é um custo significativo.

**UserData: O Script de Bootstrap**

Há mais uma opção de configuração no EC2 que Leo descobriu quando estava tentando evitar construir uma nova AMI toda vez que o código da aplicação mudava.

Quando você lança uma instância EC2, você pode fornecer um **script de UserData** — um script de shell que roda automaticamente quando a instância inicia pela primeira vez. Ele roda como root, antes de a instância ser considerada "pronta".

Para a Nimbus, o script de UserData se parecia com algo assim:

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Esse script instala o Node.js, puxa o código mais recente da aplicação, instala dependências, e inicia o serviço da aplicação. Toda nova instância que é lançada a partir da AMI base roda esse script e sobe com a versão atual da aplicação instalada — automaticamente.

Essa abordagem significa que a AMI permanece simples (apenas um SO base), e o UserData cuida da configuração da aplicação. O trade-off: scripts de UserData levam tempo para rodar. Uma instância pode levar de três a cinco minutos para iniciar e ficar pronta. Para aplicações em que o tempo de inicialização importa — para Auto Scaling, em que você precisa que novas instâncias estejam prontas rapidamente — pré-incorporar a aplicação em uma AMI customizada reduz o tempo de boot significativamente.

"Vai dar certo," disse Leo, quando Priya perguntou sobre o tempo de boot.

"Qual é o tempo de boot?" perguntou ela.

"Quatro minutos."

"E durante esses quatro minutos, a instância está rodando mas não atendendo tráfego?"

"Sim."

"Então durante um pico súbito de tráfego, a gente poderia ter quatro minutos em que as novas instâncias ainda não estão ajudando?"

Leo olhou para o seu script de UserData. Ele começou a olhar como construir uma AMI customizada.

**Pares de Chaves: A Forma Certa de Acessar um Servidor**

Lembra do desastre do "Admin123" do capítulo passado?

A forma correta de fazer login em uma instância EC2 é com um **par de chaves** (key pair).

Um par de chaves é um par criptográfico: uma chave pública (armazenada pela AWS no servidor) e uma
chave privada (um arquivo que você baixa e mantém em segredo). Para fazer login, você usa SSH — um protocolo
seguro — com sua chave privada. Não há senha. Se você perde a chave privada,
você perde o acesso. Não há "esqueci minha senha" no SSH.

Isso importa porque os pares de chaves são:

- Exclusivos para você
- Criptograficamente impossíveis de adivinhar
- Não armazenados pela AWS (você guarda a chave privada)
- Fáceis de revogar (exclua a chave do servidor, gere um novo par)

Priya já tinha configurado acesso baseado em chave no servidor da Nimbus. O servidor Admin123
foi desativado. Ninguém ficou triste por isso.

"E se alguém tentar invadir e interceptar um par de chaves em trânsito?" perguntou Priya. Ela já tinha deduzido a resposta: a chave privada nunca viaja pela rede. Você a baixa uma vez. Você a mantém localmente. Ela nunca sai da sua máquina.

**O Que Acontece Se Você Perder o Par de Chaves**

Leo fez essa pergunta na terceira semana, com a energia específica de alguém que ainda não perdeu seu par de chaves mas está pensando nisso.

"Se eu perder o arquivo da chave privada, o que acontece?"

"Você perde o acesso SSH à instância," disse Priya.

"Permanentemente?"

"Não necessariamente. Mas o processo de recuperação é desagradável."

O processo de recuperação: pare a instância, desanexe seu volume EBS raiz, anexe-o a uma instância diferente à qual você *tem* acesso, monte o volume, adicione uma nova chave pública ao arquivo `authorized_keys` no volume montado, desanexe e reanexe-o à instância original, reinicie.

Isso funciona. Leva de trinta a sessenta minutos e exige execução cuidadosa. Um passo errado e você pode piorar as coisas.

A alternativa, se sua aplicação não armazena nada crítico no volume raiz (porque você vem seguindo o conselho deste livro e armazenando dados no S3 e no EBS): encerre a instância e lance uma nova a partir da AMI. Gere um novo par de chaves quando fizer isso.

"Guarde a chave privada em algum lugar seguro," disse Priya. "E nunca em uma instância EC2."

Leo olhou para a pasta na sua área de trabalho rotulada `AWS_keys`. Depois para Priya. Depois moveu a pasta para o seu gerenciador de senhas criptografado.

**Security Groups: O Firewall da Sua Instância**

Quando uma instância EC2 é lançada, ela precisa de um **security group** — um firewall virtual que controla qual tráfego de rede pode alcançá-la e qual tráfego ela pode enviar para fora.

Um security group tem dois conjuntos de regras: **inbound** (tráfego entrando) e **outbound** (tráfego saindo).

Por padrão, um novo security group bloqueia todo tráfego inbound e permite todo tráfego outbound. Você adiciona regras inbound para abrir portas específicas para origens específicas.

Para o servidor web da Nimbus, Priya configurou:

- Permitir TCP porta 443 (HTTPS) de `0.0.0.0/0` (a internet inteira)
- Permitir TCP porta 80 (HTTP) de `0.0.0.0/0` (redirecionado para 443 na aplicação)
- Permitir TCP porta 22 (SSH) apenas do endereço IP do escritório — não da internet

"Espera — mas *por que* a gente restringiria SSH só ao IP do escritório?" perguntou Maya.

"Porque se o SSH está aberto para a internet inteira," disse Priya, "bots automatizados vão bater na porta 22 testando combinações de credenciais vinte e quatro horas por dia. Nossos logs vão encher de tentativas falhas. E se algum dia houver uma vulnerabilidade no próprio daemon SSH, todo atacante do mundo pode tentar explorá-la."

"Mas e se o Leo precisar fazer login de casa?"

"VPN," disse Priya.

Leo já tinha uma VPN configurada. Ele tinha a expressão de alguém a quem essa pergunta já tinha sido feita antes.

O banco de dados ainda morava na mesma máquina que a aplicação — mas Priya preparou um security group separado para o dia em que não moraria: a porta do banco de dados aberta apenas para tráfego do security group do servidor web — não da internet, não do SSH (para acesso direto ao BD), não de qualquer outro lugar. Enquanto isso, ela garantiu que o security group da instância compartilhada não expusesse a porta do banco de dados à internet de jeito nenhum. O banco de dados seria invisível para tudo, exceto para a aplicação que precisava dele.

Para alcançar o banco de dados diretamente, um atacante precisaria comprometer o servidor web primeiro. Essa era a primeira camada de defesa.

"E a segunda camada?" perguntou Tom.

"Autenticação IAM para o banco de dados. E criptografia em trânsito."

Ela adicionou ambas ao checklist de configuração.

**Metadados de Instância EC2 e IMDSv2**

Há mais um pedaço de segurança do EC2 que importa na prática, mesmo que raramente seja explicado em conteúdo introdutório.

Quando uma aplicação roda em uma instância EC2, ela pode consultar um endpoint interno especial em `http://169.254.169.254/latest/meta-data/` para recuperar informações sobre a instância: seu ID de instância, sua Região, sua zona de disponibilidade, e — criticamente — as credenciais IAM temporárias associadas a qualquer Função IAM anexada.

É assim que a aplicação na instância EC2 chama serviços da AWS sem ter credenciais hardcoded. Ela pergunta ao serviço de metadados: "Quais credenciais eu deveria usar agora?" O serviço de metadados retorna credenciais temporárias que expiram e rotacionam automaticamente.

O problema de segurança: versões mais antigas desse serviço de metadados (IMDSv1) respondiam a qualquer requisição de qualquer processo na instância. Se uma aplicação tinha uma vulnerabilidade de server-side request forgery (SSRF) — um bug em que um atacante podia fazer o servidor buscar uma URL da escolha do atacante — o atacante podia usar essa vulnerabilidade para buscar `http://169.254.169.254/latest/meta-data/iam/security-credentials/` e recuperar as credenciais IAM da instância.

Esse ataque já foi usado em violações reais.

O **IMDSv2** (Instance Metadata Service versão 2) corrige isso exigindo um token de sessão antes de o serviço de metadados responder. O token é obtido através de uma requisição PUT. Ataques SSRF, que tipicamente usam requisições GET, não conseguem completar o passo PUT — então não conseguem obter o token, e os metadados não são retornados.

"A gente deveria habilitar o IMDSv2?" perguntou Leo.

"É o padrão para novas instâncias agora," disse Priya. "Mas para instâncias existentes, você tem que optar por ele."

Ela o habilitou em todas as instâncias existentes da Nimbus naquela tarde.

**Ciclo de Vida da Instância: Não Para Sempre**

Isto é algo que muitos iniciantes deixam passar.

Instâncias EC2 não são permanentes por padrão. Quando você para uma instância, o recurso de
computação é liberado. Quando você a inicia de novo, ela pode rodar em hardware físico
diferente. Quaisquer dados armazenados *na própria instância* (no seu volume raiz) sobrevivem
a um ciclo de parar/iniciar — mas o endereço IP público muda.

Quando você *encerra* (terminate) uma instância, ela se foi. A menos que você tenha armazenamento separado anexado
(que cobrimos no Capítulo 6), quaisquer dados na instância desaparecem.

Os quatro estados em que uma instância EC2 pode estar:

**Pending**: A instância está iniciando. Ela recebeu hardware mas não terminou de inicializar.

**Running**: A instância está ativa e acessível. Você está pagando por ela. No primeiro boot, é também quando o script de UserData roda.

**Stopping/Stopped**: A instância está desligada. O volume EBS raiz é preservado.
Você não está pagando por computação, mas ainda está pagando pelo armazenamento EBS anexado.

**Shutting-down/Terminated**: A instância está sendo excluída. A menos que você tenha configurado
os volumes EBS para persistir, os dados deles se foram.

Essa "efemeridade" é na verdade um recurso, não um bug. Significa que você pode lançar
servidores, usá-los, e descartá-los. Ela viabiliza o escalonamento horizontal. Mas também
significa que você nunca deveria armazenar dados importantes *na* própria instância EC2.

Onde os dados moram, então?

Em armazenamento separado. Chegamos a isso nos próximos dois capítulos.

Você pode estar se perguntando: se uma instância recebe um novo endereço IP toda vez que reinicia, como sua aplicação mantém um endereço estável? A AWS tem uma solução chamada Elastic IP — um IP público estático que você possui e que permanece o mesmo mesmo após reinicializações. Uma nota sobre custo: desde fevereiro de 2024, a AWS cobra uma pequena taxa por hora para todo endereço IPv4 público — Elastic IPs (anexados ou não) e os IPs públicos auto-atribuídos nas instâncias, igualmente. IPv4 público não é mais gratuito, o que é mais uma razão para manter instâncias em sub-redes privadas atrás de um balanceador de carga.

Para aplicações atrás de um balanceador de carga — que é a arquitetura correta para qualquer
aplicação web de produção — você não precisa de Elastic IPs de jeito nenhum. Os usuários se conectam ao
nome DNS estável do balanceador de carga. O balanceador de carga se conecta às instâncias pelos
endereços IP privados delas dentro da VPC. Instâncias podem ir e vir, receber novos IPs, escalar
para dentro e para fora — o balanceador de carga cuida de tudo isso de forma transparente. Elastic IPs são para
casos de uso específicos: um servidor ao qual clientes se conectam diretamente por IP, um host bastião
com um endereço estável, uma aplicação que não está atrás de um balanceador de carga por alguma
razão específica.

Leo inicialmente planejou usar Elastic IPs para os servidores web da Nimbus. Priya apontou
que com um balanceador de carga, os endereços IP dos servidores web eram irrelevantes para
clientes externos. O balanceador de carga tinha o nome DNS estável. As instâncias atrás dele
eram descartáveis por design.

"Então Elastic IPs são para a exceção, não para a regra," disse Leo.

"Correto," disse Priya. "E se você se vir querendo usar um, pergunte se a
arquitetura não deveria ter um balanceador de carga em vez disso."

**O Que "Elastic" Significa**

Dissemos que EC2 significa Elastic Compute Cloud. O que é elástico nele?

Duas coisas:

**Elasticidade vertical**: Você pode mudar o tamanho de uma instância. Pare a instância,
mude-a de `t3.micro` para `t3.xlarge`, reinicie-a. Mais CPU e memória, mesma
aplicação, mesma configuração.

**Elasticidade horizontal**: Você pode adicionar mais instâncias. Em vez de um servidor grande,
rode dez servidores médios atrás de um balanceador de carga. Quando o tráfego cai, remova instâncias
e pare de pagar por elas.

Ambas as abordagens resolvem o problema "um servidor, tráfego demais". Elas têm trade-offs
diferentes, que exploramos no Capítulo 7 quando adicionamos Auto Scaling à história.

O insight-chave: com o EC2, poder computacional é algo que você *ajusta* em vez de algo
que você *compra*. Precisa de mais? Aumente o botão. Precisa de menos? Diminua. Pague proporcionalmente.

Maya olhou para a tabela de tipos de instância. "Se a gente pode simplesmente deixar o servidor maior, por que se incomodar com dez médios?"

"Porque," disse Leo, "um servidor grande ainda é um servidor. Se ele cai, tudo cai. Dez servidores médios significam que um pode falhar e nove continuam rodando."

"E," acrescentou Priya, "você não pode deixar um servidor maior sem reiniciá-lo. Dez pequenos significam que você pode adicionar mais sem tocar nos que estão rodando."

Tom já tinha escrito "reiniciar = inatividade" no caderno.

## Pontos Fortes e Limitações

**Por que o EC2 é poderoso**:

- Controle total. Você escolhe o SO, o software, a configuração. É o seu computador.
- Dimensionamento flexível. Centenas de tipos de instância para todo caso de uso.
- Nenhum hardware para gerenciar. A AWS cuida da camada física.
- Cobrança por segundo, com um mínimo de 60 segundos, para AMIs Amazon Linux, Windows e Ubuntu. (Algumas AMIs Linux comerciais, como RHEL e SUSE, ainda cobram por hora — verifique os termos de cobrança da AMI.) Você para a instância, você para de pagar.
- Funciona com tudo. O EC2 é a fundação sobre a qual a maioria dos outros serviços da AWS é construída.
- Múltiplos modelos de preço (On-Demand, Reserved, Spot) permitem otimização de custo significativa
  para cargas de trabalho previsíveis ou flexíveis — coberto em detalhe no Capítulo 27.

**Onde fica complicado**:

- Você é responsável por aplicar patches e atualizar o sistema operacional. (Modelo de Responsabilidade
  Compartilhada — esta é a parte "na nuvem" que é sua.)
- Aplicar patches no SO não é opcional. Instâncias EC2 sem patches são um dos vetores de ataque
  mais comuns em violações de nuvem. O AWS Systems Manager Patch Manager pode automatizar
  isso — mas você tem que configurá-lo e monitorá-lo.
- Gerenciar EC2 em escala significa gerenciar o estado das instâncias, AMIs, patches de segurança e
  ciclo de vida em potencialmente milhares de máquinas. Isso é sobrecarga operacional.
- O EC2 não é a resposta certa para tudo. Para código orientado a eventos que roda
  com pouca frequência, o Lambda (Capítulo 20) é mais barato e mais simples. Para cargas de trabalho
  conteinerizadas, ECS e EKS (Capítulo 21) oferecem melhor eficiência de recursos.
- Instâncias não usadas ainda custam dinheiro. Se você para uma instância, você para de pagar por
  computação — mas se você tem armazenamento anexado, você ainda paga por ele.

**O julgamento de quando-não-usar-EC2**: O EC2 dá a você o máximo de controle — mas controle tem um custo operacional. Toda instância EC2 que você roda é algo que você tem que atualizar com patches, monitorar e eventualmente substituir. Para aplicações que rodam com pouca frequência (o Lambda é mais barato), para aplicações que precisam escalar horizontalmente para dezenas ou centenas de instâncias (contêineres são mais eficientes), ou para bancos de dados e outras cargas de trabalho gerenciadas (RDS, ElastiCache), os serviços totalmente gerenciados eliminam sobrecarga operacional significativa a um modesto prêmio de custo. O EC2 é a escolha certa quando você precisa do controle que ele fornece — não por padrão.

Priya tinha uma heurística: "Se a gente ficaria feliz com um serviço gerenciado que faz o que precisamos, use o serviço gerenciado. Use EC2 quando a opção gerenciada não existir ou não servir."

Leo inicialmente resistiu a isso. "Mas o EC2 nos dá mais opções."

"Opções são sobrecarga," disse Priya. "A gente não precisa de toda opção. A gente precisa da configuração certa, mantida de forma confiável."

**Placement Groups do EC2: Controlando Onde as Instâncias Caem**

O EC2 dá a você controle sobre o que sua instância é — seu tamanho, seu SO, sua configuração. Ele também dá a você controle limitado sobre *onde* ela cai fisicamente, através de um recurso chamado **placement groups**.

Por padrão, a AWS espalha instâncias pelo hardware físico para maximizar a disponibilidade. Mas para certas cargas de trabalho, você quer sobrepor esse padrão — seja para aproximar as instâncias, ou para garantir que elas fiquem bem distantes.

Três tipos de placement group:

**Cluster**: Empacota instâncias bem próximas dentro de uma única Zona de Disponibilidade, tipicamente no mesmo rack físico ou em hardware adjacente. O resultado é a menor latência de rede e a maior taxa de transferência de rede entre instâncias no grupo — com taxa de transferência de rede de 10 Gbps ou mais entre instâncias (não confunda isso com Enhanced Networking/ENA, que é um recurso de rede por instância independente dos placement groups). Esta é a escolha para HPC (computação de alto desempenho), jobs de treinamento de ML em larga escala e cargas de trabalho paralelas fortemente acopladas em que as instâncias passam muito tempo enviando dados umas às outras. O trade-off é a disponibilidade: se o segmento de hardware subjacente falhar, todas as instâncias no cluster podem ser afetadas simultaneamente.

**Partition**: Divide instâncias em partições lógicas, em que cada partição fica em seu próprio conjunto de hardware — racks separados, energia separada, switches de rede separados. Instâncias dentro de uma partição compartilham hardware entre si, mas partições nunca compartilham hardware com outras partições. Esse design limita o raio de explosão de uma falha de hardware: um rack caindo afeta uma partição mas não as outras. Placement groups de partição são feitos para grandes cargas de trabalho distribuídas e replicadas — Apache Hadoop, Apache Cassandra, Apache Kafka — em que você quer isolamento de falha suficiente para que uma falha de nível de rack não derrube seu cluster inteiro.

**Spread**: Coloca cada instância em hardware subjacente completamente separado. Máximo isolamento entre instâncias. Se você tem cinco instâncias críticas de aplicação que nunca devem compartilhar um host físico (porque uma única falha de hardware nunca deveria derrubar mais de uma), Spread é a resposta. O limite: **7 instâncias por Zona de Disponibilidade por placement group**. Spread é projetado para pequenos números de instâncias críticas que não podem tolerar colocation, não para grandes frotas.

"Então Cluster é para velocidade, Spread é para isolamento, e Partition é para sistemas distribuídos que precisam tanto de algum agrupamento quanto de algum isolamento?" perguntou Maya.

"Perto o suficiente," disse Priya. "Cluster: baixa latência entre instâncias, um grande risco. Spread: máximo isolamento, limite rígido de sete por AZ. Partition: isolamento estruturado para grandes sistemas distribuídos — você controla em qual partição cada instância entra."

Para a arquitetura atual da Nimbus, nenhum desses se aplicava ainda. Mas saber que existiam significava saber quando recorrer a eles — e mais imediatamente, saber o que uma questão de exame sobre "cargas de trabalho HPC que precisam de baixa latência entre nós" estava de fato perguntando.

## Resumo

Uma instância lançada por acidente nunca seria um servidor de produção. Entender o EC2 direito não só resolveu o problema de capacidade — introduziu um novo conjunto de conceitos que apareceriam em quase todo capítulo subsequente. Tipos de instância, AMIs, pares de chaves, security groups e dimensionamento correto não são curiosidades sobre o EC2; são o vocabulário sobre o qual o resto do livro é construído. Aprenda-os aqui e todo o resto faz mais sentido.

- Uma **instância EC2** é uma máquina virtual que você aluga na AWS. Tipos de instância são organizados por caso de uso: uso geral, otimizada para computação, otimizada para memória, otimizada para armazenamento. Escolha a família certa e dimensione corretamente conforme as métricas reais da carga de trabalho — não o pior caso imaginado.
- Uma **AMI** (Amazon Machine Image) é o template para o SO e a configuração inicial da sua instância. AMIs customizadas viabilizam implantações consistentes e repetíveis.
- **Pares de chaves** são a forma segura de acessar instâncias EC2. **Security groups** são o firewall da sua instância — restrinja SSH a IPs conhecidos e tranque as portas do banco de dados apenas para o security group da aplicação.
- O **IMDSv2** deveria estar habilitado em todas as instâncias para proteger contra roubo de credenciais baseado em SSRF a partir do serviço de metadados de instância.
- Instâncias EC2 não são permanentes por padrão. Instâncias encerradas perdem seus dados locais — armazene dados importantes no S3 ou EBS, não no disco da instância.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.2 (soluções de computação de alto desempenho)*

- **Responsabilidade Compartilhada para EC2**: Você é responsável por aplicar patches no SO.
  A AWS mantém o hardware físico e o hipervisor. Esta é uma distinção frequentemente
  testada.
- **Famílias de instância importam para questões de cenário.** Se um cenário menciona altos
  requisitos de memória (cache em memória, SAP HANA), a resposta provavelmente envolve uma
  instância otimizada para memória. Se menciona processamento em lote ou HPC, otimizada para computação.
- **Parar ≠ Encerrar.** Parar uma instância a preserva (você pode reiniciar).
  Encerrar a exclui. Cenários de exame testam se você conhece essa distinção.
- **O IP público muda ao reiniciar.** Se sua aplicação precisa de um endereço IP estável,
  use um **Elastic IP** — um IP público estático que permanece associado à sua conta.
  Desde fevereiro de 2024, a AWS cobra por hora todo endereço IPv4 público — Elastic IPs
  (anexados ou não) e IPs públicos auto-atribuídos, igualmente.
- **Os modelos de preço On-Demand, Reserved e Spot** são fortemente testados no Domínio 4.
  Nós os cobrimos no Capítulo 27. Por enquanto, saiba que On-Demand significa pagar por segundo
  sem compromisso.
- **Security groups são stateful.** Se você permite tráfego inbound em uma porta, o
  tráfego de retorno é automaticamente permitido sem uma regra outbound explícita. NACLs
  (cobertas no Capítulo 15) são stateless — elas exigem tanto regras inbound quanto outbound.
- **Placement Groups:** Cluster = menor latência entre instâncias (HPC, treinamento de ML — mas risco de ponto único de falha para o grupo); Partition = sistemas distribuídos (Hadoop, Kafka, Cassandra) com isolamento de falha por partição; Spread = máximo isolamento de instância, máx. 7 por AZ. Padrão de questão de exame: "carga de trabalho HPC fortemente acoplada precisa de máxima taxa de transferência de rede entre nós" → placement group Cluster.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: o que é uma instância EC2? O que é uma AMI? Qual é a relação
entre elas?

*(Dica: Pense na analogia da receita — o que é a receita, e o que é o prato?)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa está implantando uma aplicação web de alto tráfego. A aplicação
lida com buscas em catálogo de produtos com lógica de filtragem complexa que é intensiva em CPU.
A equipe espera picos de tráfego significativos durante eventos de promoção. Eles querem garantir
que escolham o tipo de instância EC2 certo e estejam preparados para surtos de tráfego.

Qual combinação de escolhas MELHOR atende aos requisitos deles?

A) Instâncias otimizadas para memória com um número fixo para garantir desempenho consistente  
B) Instâncias otimizadas para computação com Auto Scaling para lidar com picos de tráfego  
C) Instâncias de uso geral com um único tamanho de instância grande  
D) Instâncias otimizadas para armazenamento porque o catálogo de produtos requer acesso rápido ao disco

**Dica 1**: A carga de trabalho é descrita como "intensiva em CPU". Qual família de instância é
otimizada para CPU?

**Dica 2**: O cenário menciona "picos de tráfego durante eventos de promoção". Um número fixo
de instâncias não vai lidar eficientemente com tráfego variável. Qual recurso da AWS lida com isso?

**Dica 3**: Instâncias otimizadas para computação lidam com trabalho pesado de CPU. O Auto Scaling adiciona
e remove instâncias com base na demanda. Juntos eles atendem aos dois requisitos.

**Resposta**: B

**Explicação**: Instâncias otimizadas para computação (como a família `c`) fornecem mais CPU
por dólar para cargas de trabalho intensivas em CPU. O Auto Scaling ajusta automaticamente o número
de instâncias com base na carga — adicionando instâncias durante eventos de promoção, removendo-as quando o
tráfego volta ao normal. Essa combinação otimiza tanto desempenho quanto custo.

**Por que não A?** Instâncias otimizadas para memória são projetadas para cargas de trabalho que precisam de grandes
quantidades de RAM (bancos de dados, caches em memória). Esta é uma carga de trabalho limitada por CPU. E contagens
fixas de instância significam ou superprovisionamento (desperdício) ou subprovisionamento (falha).

**Por que não C?** Instâncias de uso geral trocam alguma eficiência de CPU por equilíbrio. Para
uma carga de trabalho conhecidamente intensiva em CPU, otimizada para computação é mais apropriado. E uma única
instância grande é um ponto único de falha.

**Por que não D?** O gargalo é a CPU, não o I/O de disco. Instâncias otimizadas para armazenamento
são projetadas para cargas de trabalho que precisam de taxa de transferência muito alta para armazenamento local.

*Domínio SAA-C03 3 — Tarefa 3.2*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus atualmente roda uma única instância EC2 `t3.micro` para a aplicação inteira.
A equipe precisa decidir: fazer upgrade para uma instância maior (`t3.2xlarge`) ou adicionar mais
instâncias `t3.micro` atrás de um balanceador de carga?

Percorra os trade-offs. Quais são as vantagens de cada abordagem? Que
perguntas você faria para decidir? (Dica: pense em pontos únicos de falha,
custo, complexidade de implantação, e o que acontece durante a manutenção.)

*(Não há uma única resposta correta. Trata-se de raciocinar sobre escalonamento vertical vs.
horizontal.)*

## Cena Pós-Créditos

Leo passou a tarde executando o downsize. Ele migrou da `t3.large` para uma `t3.small`,
usando os dados de dimensionamento correto que Tom tinha coletado do CloudWatch. A CPU se estabilizou em cerca de
12% durante carga normal. As páginas carregavam em menos de um segundo.

Tom observou a conta da AWS atualizar em tempo real. A t3.small ainda custava cerca do dobro por hora que a micro original — mas um terço da t3.large pela qual eles vinham pagando demais. Ele fez uma anotação: *US$ 40/mês economizados vs. t3.large anterior. Decisão certa.*

Maya estava olhando para outra coisa na tela dela.

"Leo," disse ela. "Enquanto você estava redimensionando a instância, o site ficou fora do ar por
doze minutos."

Leo levantou os olhos.

"A gente teve uma fila de duzentos pedidos não atendidos."

Ele olhou para a tela. Depois para o teto. Depois de volta para a tela.

"A gente precisa de algo para nossas imagens," disse ele, mudando ligeiramente de assunto. "Agora mesmo,
fotos de cardápio enviadas são salvas diretamente no servidor. Se a gente redimensiona ou reinicia a
instância, a gente perde elas?"

Priya já sabia a resposta.

No próximo capítulo: onde os arquivos moram quando não há disco rígido para apontar.
