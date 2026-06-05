# Capítulo 21: Contêineres de Carga para Código

"Funciona na minha máquina."

Leo havia aprendido a não dizer isso em voz alta. Não era uma defesa — era um diagnóstico. E o diagnóstico desta vez era a instância EC2 de produção número três, que havia recebido um patch de biblioteca seis semanas antes, que ninguém havia documentado, que as outras duas instâncias não tinham recebido e que agora estava causando um bug que existia apenas ali, naquela instância, invisível em todos os outros lugares.

Ele havia passado três horas na noite anterior rastreando a causa.

"Toda vez que implantamos," disse ele na manhã seguinte, "coordenamos entre múltiplas instâncias. Nova versão, dependências diferentes. Funciona em staging, quebra em produção porque os ambientes divergiram."

"Porque alguém atualizou um pacote na instância três sem atualizar as outras," disse Priya. Sem maldade.

"Eu precisava de uma versão específica de—"

"Eu sei," disse ela. "E agora a instância três tem uma história diferente da instância um e dois. Isso é desvio de configuração. É silencioso até que deixa de ser."

O Lambda havia resolvido o problema de servidor ocioso para os serviços menores da Nimbus. Mas a API principal — a que carregava todo o tráfego de pedidos — ainda estava no EC2. E instâncias EC2, ao contrário de funções, acumulavam histórico.

"Qual é a solução real?" perguntou Maya.

"Parar de tratar servidores como coisas permanentes que você configura," disse Priya. "Começar a tratá-los como unidades descartáveis que você substitui."

Há uma analogia que explica isso com tamanha precisão que aparece em quase toda explicação sobre contêineres de software. Ela vem de 1956 e não tem nada a ver com software. A resposta, quando alguém finalmente perguntou "qual é a solução para transportar mercadorias de forma confiável em diferentes transportadoras?", foi: padronize o contêiner. Transporte a caixa, não apenas o conteúdo.

**O Que É um Contêiner?**

Um **contêiner** é uma unidade leve e portátil que empacota sua aplicação junto com tudo o que ela precisa para funcionar: o runtime (Python 3.11, Node.js 20, Java 17), as bibliotecas e dependências, os arquivos de configuração e o próprio código da aplicação.

Ao contrário de uma máquina virtual (que emula um computador inteiro, incluindo o kernel do sistema operacional), um contêiner compartilha o kernel do SO do host enquanto mantém tudo o mais isolado. Isso torna os contêineres rápidos de iniciar (segundos, às vezes milissegundos) e pequenos (megabytes, não gigabytes).

A tecnologia de contêineres mais popular é o **Docker**. Uma imagem Docker é o blueprint — um instantâneo da aplicação e de seu ambiente. Um contêiner Docker é uma instância em execução dessa imagem.

A propriedade essencial: **imutabilidade**. Uma imagem construída hoje será executada de forma idêntica em qualquer host que suporte Docker — um laptop, uma instância EC2, um servidor em um data center diferente. O ambiente está incorporado na imagem. O desvio de configuração é impossível.

"Então, em vez de nos preocuparmos com o que está instalado na instância EC2," disse Leo, "construímos uma imagem que tem tudo. A imagem é executada da mesma forma em qualquer lugar."

"E se você precisar testá-la localmente, você executa a mesma imagem," acrescentou Priya. "Chega de 'funciona na minha máquina.'"

**Amazon ECS: O Orquestrador**

Executar um contêiner é simples. Executar dezenas de contêineres em múltiplos hosts, rotear o tráfego entre eles, reiniciar contêineres com falha, implantar novas versões sem tempo de inatividade — isso requer um **orquestrador**.

O **Amazon ECS (Elastic Container Service)** é o serviço gerenciado de orquestração de contêineres da AWS. Você define:

- **Definição de tarefa**: Qual imagem de contêiner executar, quanta CPU e memória, quais variáveis de ambiente, quais portas expor
- **Serviço**: Quantas cópias da tarefa executar, como lidar com falhas e implantações
- **Cluster**: A infraestrutura de computação subjacente

O ECS cuida do resto: posicionar tarefas na capacidade disponível, reiniciar tarefas com falha, drenar conexões durante implantações, registrar tarefas saudáveis no balanceador de carga.

Para a Nimbus, a API migrou de instâncias EC2 com implantações gerenciadas manualmente para o ECS. Cada nova implantação enviava uma nova imagem Docker para o **Amazon ECR (Elastic Container Registry)** — o registro de contêineres gerenciado da AWS — e o ECS a distribuía por todas as tarefas sem tempo de inatividade.

**Fargate vs Tipo de Lançamento EC2**

O ECS pode executar contêineres de dois modos:

**Tipo de lançamento EC2**: Você gerencia as instâncias EC2 subjacentes. Você é responsável por aplicar patches nas instâncias, dimensioná-las adequadamente e garantir que haja capacidade suficiente para os seus contêineres. Mais controle, mais responsabilidade.

**Fargate (computação serverless para contêineres)**: A AWS gerencia a infraestrutura subjacente inteiramente. Você especifica CPU e memória por tarefa; o Fargate provisiona a capacidade adequada automaticamente. Sem instâncias EC2 para gerenciar. Você paga por vCPU-segundo e GB-segundo de memória.

O Fargate é o modelo de "contêineres serverless" — você obtém o isolamento de ambiente dos contêineres sem gerenciar servidores. A troca: menos controle sobre a configuração da instância subjacente e custo por unidade ligeiramente maior.

Para a Nimbus: Fargate para o serviço de API. Eles não queriam gerenciar instâncias EC2 para contêineres.

**Amazon EKS: Quando Você Precisa do Kubernetes**

O **Kubernetes** é um sistema de orquestração de contêineres de código aberto — essencialmente o padrão do setor para gerenciar contêineres em escala. É poderoso, extensível e complexo.

O **Amazon EKS (Elastic Kubernetes Service)** é o serviço Kubernetes gerenciado da AWS. Ele executa o plano de controle do Kubernetes (a camada de gerenciamento) para você, enquanto você gerencia os nós de trabalho (ou usa o Fargate para isso também).

Quando usar EKS vs ECS?

**Use ECS** se:

- Você está principalmente na AWS e quer a experiência mais simples e nativa da AWS
- Sua equipe não tem experiência prévia com Kubernetes
- Você quer menos sobrecarga operacional

**Use EKS** se:

- Você precisa de recursos específicos do Kubernetes (Custom Resource Definitions, Helm charts, o ecossistema do Kubernetes)
- Sua equipe já conhece o Kubernetes
- Você está executando um ambiente híbrido (parte on-premises, parte na AWS) e quer uma camada de orquestração consistente
- Sua carga de trabalho tem requisitos que correspondem à extensibilidade do Kubernetes

"Qual devemos usar?" perguntou Maya.

"ECS," disse Priya imediatamente. "Não temos experiência com Kubernetes. O ECS faz tudo o que precisamos. Adicionar o Kubernetes agora seria acrescentar complexidade operacional sem benefício prático."

"Sempre podemos migrar para o EKS depois, se crescermos além do ECS," acrescentou Leo.

Essa é uma resposta correta de engenheiro sênior: escolha a ferramenta mais simples que atenda às suas necessidades atuais.

**Como os Contêineres Transformam as Implantações**

Antes dos contêineres, implantar uma nova versão da API da Nimbus significava:

1. Acessar via SSH cada instância EC2
2. Baixar o código mais recente do Git
3. Instalar/atualizar dependências
4. Reiniciar o processo da aplicação
5. Verificar a integridade
6. Passar para a próxima instância

Isso era propenso a erros e demorado. Requeria coordenação. Se a etapa 3 falhasse na instância 4, havia uma implantação parcial com algumas instâncias executando a versão antiga e algumas falhando ao executar a nova versão.

Com ECS e contêineres:

1. Construir uma nova imagem Docker (automatizado no pipeline de CI/CD)
2. Enviar para o ECR
3. Atualizar o serviço ECS para usar a nova versão da imagem

O ECS lida com a implantação gradual: inicia novas tarefas com a nova imagem, aguarda que estejam saudáveis e então para as tarefas antigas. Implantação sem tempo de inatividade, automatizada.

Se a nova versão falhar nas verificações de integridade, o ECS interrompe a implantação e a versão antiga continua atendendo o tráfego.

## Pontos Fortes e Limitações

**Contêineres**:

- Eliminam a inconsistência de ambiente ("funciona na minha máquina")
- Possibilitam implantações rápidas e confiáveis
- Imutáveis — a mesma imagem é executada de forma idêntica em qualquer lugar
- Eficientes — mais leves do que VMs, inicialização mais rápida

**ECS**:

- Mais simples do que o Kubernetes para cargas de trabalho centradas na AWS
- Integração estreita com a AWS (IAM, ALB, CloudWatch, Secrets Manager)
- A opção Fargate elimina completamente o gerenciamento de EC2

**EKS**:

- Compatibilidade total com Kubernetes — use todo o ecossistema
- Melhor para ambientes híbridos ou equipes com experiência em Kubernetes
- Mais complexo de configurar e operar do que o ECS

**Onde fica complicado**:

- As imagens de contêiner precisam ser construídas e versionadas — requer um pipeline de CI/CD
- A depuração de contêineres requer ferramentas diferentes da depuração de processos tradicionais
- Contêineres com estado (bancos de dados em contêineres) requerem configuração cuidadosa de armazenamento persistente
- A rede entre contêineres (comunicação serviço a serviço) requer o entendimento dos conceitos de rede de contêineres

## Resumo

- **Contêineres** empacotam o código da aplicação, o runtime e as dependências juntos — executados de forma idêntica em qualquer lugar.
- O **Docker** é a tecnologia de contêineres padrão. Imagens são blueprints; contêineres são instâncias em execução.
- O **ECR (Elastic Container Registry)** é o registro Docker gerenciado da AWS — armazene e versione suas imagens aqui.
- O **ECS (Elastic Container Service)** orquestra contêineres. Você define tarefas e serviços; o ECS gerencia o posicionamento e o ciclo de vida.
- O **Fargate** é computação serverless para contêineres — sem instâncias EC2 para gerenciar.
- O **EKS (Elastic Kubernetes Service)** é o Kubernetes gerenciado — para equipes que precisam de recursos ou compatibilidade com o Kubernetes.
- Escolha ECS para simplicidade na AWS; escolha EKS para compatibilidade com o ecossistema do Kubernetes.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Sinais ECS vs EKS**: Cenários de exame que mencionam "Kubernetes," "Helm," "experiência existente com Kubernetes," ou "orquestração de contêineres multi-cloud" → EKS. Todo o resto → ECS.
- **Fargate vs tipo de lançamento EC2**: "Não quer gerenciar instâncias EC2 para contêineres," "contêineres serverless," "sem gerenciamento de infraestrutura" → Fargate. "Precisa de tipos de instância específicos," "cargas de trabalho com GPU," "controle granular de instâncias" → tipo de lançamento EC2.
- **Funções de tarefa ECS**: Assim como as funções de instância EC2, as tarefas ECS têm funções IAM. Cada tarefa pode ter permissões diferentes. Cenário do exame: "contêiner precisa ler do S3" → anexar uma função IAM à definição de tarefa.
- **Varredura de imagem ECR**: O ECR pode verificar imagens de contêineres em busca de vulnerabilidades conhecidas (CVEs). Sinal do exame: "varrer contêineres em busca de vulnerabilidades de segurança" → varredura de imagem ECR.
- **Implantações blue/green**: O ECS suporta implantações blue/green via integração com o CodeDeploy. Implantação sem tempo de inatividade com reversão automática. Padrão do exame: "implantar sem tempo de inatividade com reversão automática" → ECS + CodeDeploy blue/green.
- **Auto Scaling do Serviço ECS**: Escala o número de tarefas com base em CPU, memória ou métricas personalizadas do CloudWatch. Funciona com ALB para rotear o tráfego para o número correto de tarefas em execução.

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre uma imagem Docker e um contêiner Docker. Explique a diferença entre ECS e ECR.

*(Dica: Imagem para contêiner é como uma receita para um prato preparado. O ECR armazena imagens; o ECS as executa.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa tem uma aplicação de microsserviços atualmente em execução em instâncias EC2 gerenciadas manualmente. A equipe lida com implantações inconsistentes — diferentes instâncias EC2 têm versões de biblioteca diferentes, causando bugs difíceis de reproduzir. Eles querem padronizar as implantações enquanto minimizam a sobrecarga operacional para gerenciar os servidores subjacentes. A equipe não tem experiência com Kubernetes.

Qual solução MELHOR atende a esses requisitos?

A) Implantar no EC2 com o AWS Systems Manager Patch Manager para manter as instâncias consistentes  
B) Conteinerizar a aplicação com Docker; usar o Amazon ECS com o tipo de lançamento Fargate  
C) Conteinerizar a aplicação com Docker; usar o Amazon EKS com grupos de nós autogerenciados  
D) Usar o AWS Elastic Beanstalk para gerenciar implantações e configuração de instâncias automaticamente

**Dica 1**: Os contêineres resolvem diretamente o problema de "ambiente inconsistente". Quais opções usam contêineres?

**Dica 2**: "Minimizar a sobrecarga operacional para gerenciar servidores" → Fargate (sem gerenciamento de EC2) vs nós autogerenciados (ainda gerencia EC2).

**Dica 3**: "Sem experiência com Kubernetes" → EKS é mais complexidade operacional do que ECS.

**Resposta**: B

**Explicação**: Conteinerizar com Docker garante que cada implantação use a mesma imagem com as mesmas dependências — eliminando o desvio de configuração. ECS com Fargate significa sem instâncias EC2 para gerenciar. A equipe se concentra no código da aplicação e nas definições de contêiner, não na manutenção de servidores. ECS (não EKS) é adequado para equipes sem experiência com Kubernetes.

**Por que não A?** O Patch Manager mantém as instâncias EC2 atualizadas, mas não resolve a inconsistência de versão de biblioteca entre aplicações. O problema fundamental (diferentes ambientes de código em instâncias diferentes) permanece.

**Por que não C?** EKS com grupos de nós autogerenciados requer o gerenciamento de instâncias EC2 *e* o aprendizado do Kubernetes. Nenhum dos dois se alinha com os requisitos.

**Por que não D?** O Elastic Beanstalk gerencia a implantação de aplicações no EC2, mas não resolve a inconsistência fundamental do ambiente a menos que contêineres sejam usados. O Beanstalk não usa imagens Docker por padrão (embora possa ser configurado para isso).

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está dividindo a API monolítica em três microsserviços: o serviço de pedidos, o serviço de cardápio e o serviço de notificações. Cada serviço tem requisitos de escalonamento diferentes (o serviço de pedidos escala com o tráfego; o serviço de cardápio é principalmente somente leitura e estável; o serviço de notificações tem picos irregulares).

Projete a arquitetura ECS para esses três serviços. Como você lidaria com a comunicação entre serviços? Você usaria um cluster ECS ou três? Como configuraria o Auto Scaling de forma diferente para cada serviço?

*(Não há uma única resposta correta. O objetivo é praticar a arquitetura de microsserviços no ECS.)*

## Cena Pós-Créditos

A primeira implantação com contêiner foi impecável.

Nova versão da API: zero tempo de inatividade. O ECS a distribuiu, as verificações de integridade passaram, as tarefas antigas foram drenadas, as novas tarefas assumiram o controle. Leo acompanhou o status das tarefas no console com algo próximo à incredulidade.

"Simplesmente funcionou," disse ele.

"Esse é o ponto," disse Priya.

"Sem SSH. Sem tempo de inatividade. Sem 'aguarde enquanto reinicia.'"

"A imagem é o artefato de implantação," disse ela. "O ambiente é imutável. O processo de implantação é declarativo. É assim que o software deve ser distribuído."

Leo olhou para o console por mais um momento.

"Passei três anos coordenando implantações de EC2," disse ele. "Coordenando scripts SSH. Escrevendo runbooks de implantação."

"Você estava resolvendo um problema," disse Priya, "que os contêineres resolvem por design."

Ele não disse mais nada depois disso. Mas na manhã seguinte, começou a escrever documentação sobre o processo de construção de contêineres, para que mais ninguém precisasse passar três anos descobrindo isso.

No próximo capítulo: o fluxograma que se executa sozinho — e lembra onde parou.
