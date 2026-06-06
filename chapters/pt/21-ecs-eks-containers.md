# Capítulo 21: Contêineres de Carga para Código

Antes de 1956, carregar mercadorias em um navio era uma negociação especializada e que exigia perícia. Cada navio tinha porões diferentes. Cada porto tinha guindastes diferentes. Cada transportadora tinha sistemas diferentes para rastrear o que ia para onde. Um caixote de mercadorias se movia do caminhão para o cais para o navio para o cais para o caminhão por uma cadeia de pessoas que o manuseavam de formas diferentes. Cargas se perdiam. Cargas se danificavam. As mesmas mercadorias, enviadas duas vezes, chegavam em condições diferentes porque o manuseio tinha sido diferente nas duas vezes.

A resposta, quando alguém finalmente a fez claramente, foi: padronize o contêiner. Não resolva o problema em cada porto. Resolva-o uma vez, no nível do contêiner. Envie a caixa, não apenas o conteúdo.

O contêiner de carga padronizado não apenas tornou o transporte mais rápido. Ele tornou o transporte *previsível*. O conteúdo de um contêiner em Xangai estava em exatamente a mesma condição quando chegava em Roterdã — porque o contêiner o protegia da variabilidade em cada ponto de transferência.

Esse é exatamente o mesmo problema que Leo tinha. A API da Nimbus estava sendo "carregada" de forma diferente em cada "porto": o staging era implantado de forma diferente da produção, a instância um era implantada de forma diferente da instância três, e seis semanas de mudanças não documentadas tinham tornado a frota imprevisível.

O contêiner não tornaria Leo um desenvolvedor mais rápido. Ele tornaria as implantações previsíveis.

---

A migração para o Lambda tinha reduzido a conta de EC2 para os serviços menores. Mas a API central era diferente — ela rodava continuamente, carregava todo o tráfego de pedidos e vinha acumulando histórico de configuração por oito meses. O Lambda resolveu a ociosidade. Os contêineres resolveriam a inconsistência.

A API central não estava ociosa; ela não podia migrar para o Lambda. Mas tinha um problema diferente: as instâncias EC2 que a rodavam tinham divergido umas das outras.

---

Leo tinha aprendido a não dizer "funciona na minha máquina" em voz alta. Não era uma defesa — era um diagnóstico. E o diagnóstico desta vez era a instância EC2 de produção número três, que tinha recebido um patch de biblioteca seis semanas antes que ninguém tinha documentado, que as outras duas instâncias não tinham recebido, e que agora causava um bug que existia apenas ali, naquela única instância, invisível em todo o resto.

Ele tinha passado três horas na noite anterior rastreando isso.

"Toda vez que implantamos", disse ele na manhã seguinte, "coordenamos entre múltiplas instâncias. Nova versão, dependências diferentes. Funciona no staging, quebra na produção porque os ambientes divergiram."

"Porque alguém atualizou um pacote na instância três sem atualizar as outras", disse Priya. Sem maldade.

"Eu precisava de uma versão específica de—"

"Eu sei", disse ela. "E agora a instância três tem um histórico diferente das instâncias um e dois. Isso é configuration drift. É silencioso até deixar de ser."

"Qual é a solução de fato?" perguntou Maya.

"Pare de tratar os servidores como coisas permanentes que você configura", disse Priya. "Comece a tratá-los como unidades descartáveis que você substitui."

**O Que É um Contêiner?**

"Pense nisso como um contêiner de carga", disse Leo, pegando um marcador. "O contêiner não se importa com em que navio está. O navio não se importa com o que há no contêiner. Eles concordaram com as dimensões e o mecanismo de travamento. Todo o resto está dentro da caixa."

Um **contêiner** é uma unidade leve e portátil que empacota a sua aplicação junto com tudo o que ela precisa para rodar: o runtime (Python 3.11, Node.js 20, Java 17), as bibliotecas e dependências, os arquivos de configuração e o próprio código da aplicação.

Ao contrário de uma máquina virtual (que emula um computador inteiro, incluindo o kernel do sistema operacional), um contêiner compartilha o kernel do SO host enquanto mantém todo o resto isolado. Isso torna os contêineres rápidos para iniciar (segundos, às vezes milissegundos) e pequenos (megabytes, não gigabytes).

A tecnologia de contêineres mais popular é o **Docker**. Uma imagem Docker é o blueprint — um snapshot da aplicação e de seu ambiente. Um contêiner Docker é uma instância em execução dessa imagem.

A propriedade chave: **imutabilidade**. Uma imagem construída hoje rodará de forma idêntica em qualquer host que suporte Docker — um laptop, uma instância EC2, um servidor em um data center diferente. O ambiente está embutido. O configuration drift é impossível.

"Então, em vez de nos preocuparmos com o que está instalado na instância EC2", disse Leo, "construímos uma imagem que tem tudo. A imagem roda da mesma forma em todo lugar."

"E se você precisar testá-la localmente, você roda a mesma imagem", acrescentou Priya. "Acabou o 'funciona na minha máquina'."

**Construindo a Imagem Docker e Fazendo Push para o ECR**

Antes que qualquer orquestrador pudesse gerenciar o contêiner, Leo tinha de construí-lo e armazená-lo em algum lugar de onde o ECS pudesse puxar.

Ele escreveu o Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

A linha chave: `FROM python:3.11-slim`. Não Python 3.9. Não Python 3.10. 3.11 — a versão específica com que a equipe tinha concordado, embutida na imagem. Toda instância rodando essa imagem usaria exatamente Python 3.11. O comportamento de arredondamento do módulo decimal seria idêntico em todo lugar.

Ele construiu a imagem localmente: `docker build -t nimbus-api:1.0.0 .`

A build levou 4 minutos. O Docker puxou a imagem base, instalou as dependências, copiou o código da aplicação e produziu uma imagem com a tag `nimbus-api:1.0.0`.

Ele a rodou localmente: `docker run -p 8000:8000 nimbus-api:1.0.0`

A API iniciou. Mesma porta, mesmo comportamento do servidor de produção — porque o ambiente era idêntico.

Então ele fez push para o ECR:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag the image for ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Push
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

O push levou 2 minutos. O ECR armazenou a imagem, imediatamente acionou uma varredura de imagem e reportou os resultados em até 5 minutos.

**Amazon ECS: O Orquestrador**

Rodar um contêiner é simples. Rodar dezenas de contêineres em múltiplos hosts, rotear tráfego entre eles, reiniciar contêineres com falha, implantar novas versões sem tempo de inatividade — isso exige um **orquestrador**.

O **Amazon ECS (Elastic Container Service)** é o serviço gerenciado de orquestração de contêineres da AWS. Você define:

- **Definição de tarefa (task definition)**: Qual imagem de contêiner rodar, quanta CPU e memória, quais variáveis de ambiente, quais portas expor
- **Serviço (service)**: Quantas cópias da tarefa rodar, como lidar com falhas e implantações
- **Cluster**: A infraestrutura de computação subjacente

O ECS cuida do resto: colocar tarefas na capacidade disponível, reiniciar tarefas com falha, drenar conexões durante as implantações, registrar tarefas íntegras com o balanceador de carga.

Para a Nimbus, a API migrou de instâncias EC2 com implantações gerenciadas manualmente para o ECS. Cada nova implantação fazia push de uma nova imagem Docker para o **Amazon ECR (Elastic Container Registry)** — o registro de contêineres gerenciado da AWS — e o ECS a implementava em todas as tarefas com zero tempo de inatividade.

**Fargate vs Tipo de Lançamento EC2**

O ECS pode rodar contêineres em dois modos:

**Tipo de lançamento EC2**: Você gerencia as instâncias EC2 subjacentes. Você é responsável por fazer patch das instâncias, dimensioná-las corretamente e garantir que haja capacidade suficiente para seus contêineres. Mais controle, mais responsabilidade.

**Fargate (computação serverless para contêineres)**: A AWS gerencia a infraestrutura subjacente inteiramente. Você especifica CPU e memória por tarefa; o Fargate provisiona a capacidade certa automaticamente. Sem instâncias EC2 para gerenciar. Você paga por vCPU-segundo e GB-segundo de memória.

O Fargate é o modelo de "contêineres serverless" — você obtém o isolamento de ambiente dos contêineres sem gerenciar servidores. O trade-off: menos controle sobre a configuração da instância subjacente e um custo por unidade ligeiramente mais alto.

"Quanto isso custa por mês?" perguntou Tom, abrindo a calculadora de preços. "Fargate versus tipo de lançamento EC2 — quero ver os números reais."

A estimativa de cabeça de Leo — aquela que todo mundo carrega — era que o Fargate custaria mais. Conveniência serverless, preço premium. Ele chutou talvez vinte ou trinta por cento acima do EC2.

"Faça as contas reais", disse Tom, porque era assim que Tom era.

O serviço de API da Nimbus rodava 3 tarefas, cada uma precisando de 0,5 vCPU e 1GB de memória, 24 horas por dia:

**Fargate**: US$ 0,04048/vCPU-hora × 0,5 × 3 × 720 horas = US$ 43,72/mês de CPU. US$ 0,004445/GB-hora × 1 × 3 × 720 = US$ 9,60/mês de memória. Total: US$ 53,32/mês.

**Tipo de lançamento EC2** (3 × t3.medium a US$ 0,0416/hora): US$ 0,0416 × 3 × 720 = US$ 89,86/mês.

"Espera", disse Tom. "O Fargate é mais barato?"

"Neste tamanho, sim", disse Leo. "O Fargate cobra exatamente pelo que você aloca. As instâncias EC2 têm overhead — o SO e o agente do ECS consomem alguma CPU e memória antes mesmo de seus contêineres começarem. Uma t3.medium dá 2 vCPU e 4GB, mas você está usando 0,5 vCPU e 1GB por contêiner. O resto é desperdiçado."

"Mas o tipo de lançamento EC2 permite empacotar múltiplas tarefas em uma instância."

"Sim. Em escalas maiores, com bin-packing cuidadoso, o tipo de lançamento EC2 fica mais barato. Na nossa escala — três tarefas — o Fargate vence."

Tom anotou isso.

Para a Nimbus: Fargate para o serviço de API. Eles não queriam gerenciar instâncias EC2 para contêineres.

Se você containerizar com o Fargate, você elimina todo o overhead de gerenciamento de EC2 — mas abre mão da capacidade de personalizar tipos de instância, o que importa para cargas de trabalho de GPU ou redes especializadas. Se você escolher o ECS pela simplicidade nativa da AWS, você ganha integração estreita com IAM e ALB — mas fica de fora do ecossistema Kubernetes, o que exige rearquitetar caso você mais tarde precise de portabilidade multi-cloud.

**Amazon EKS: Quando Você Precisa de Kubernetes**

O **Kubernetes** é um sistema de orquestração de contêineres de código aberto — essencialmente o padrão da indústria para gerenciar contêineres em escala. É poderoso, extensível e complexo.

O **Amazon EKS (Elastic Kubernetes Service)** é o serviço gerenciado de Kubernetes da AWS. Ele roda o control plane do Kubernetes (a camada de gerenciamento) para você, enquanto você gerencia os worker nodes (ou usa o Fargate para eles também).

Você pode estar se perguntando: se o Kubernetes é o padrão da indústria e toda vaga de emprego o menciona, por que não usaríamos simplesmente ele? Porque "padrão da indústria" descreve o que grandes empresas com equipes de plataforma dedicadas usam. Para uma equipe de seis pessoas construindo um app de pedidos de comida, o Kubernetes adiciona complexidade operacional sem benefício prático agora. A complexidade é real; o benefício é teórico nesta escala.

O Kubernetes oferece valor em um nível de complexidade que a maioria das equipes não precisa: definições de recursos personalizados para construir plataformas internas, restrições avançadas de agendamento, pod disruption budgets para controle granular de implantação e integração com service mesh para gerenciamento de tráfego entre centenas de microsserviços. Essas são capacidades genuínas. Também são capacidades que uma startup do tamanho da Nimbus nunca exercerá.

O princípio de engenharia aqui é às vezes chamado de YAGNI: You Aren't Gonna Need It (Você Não Vai Precisar Disso). O ECS dá à Nimbus tudo o que ela atualmente precisa. O EKS dá a ela mais do que precisa, além de uma curva de aprendizado significativa e overhead operacional. "Vai ser útil mais tarde" não é um bom motivo para adicionar complexidade agora.

Quando você deveria usar EKS vs ECS?

**Use ECS** se:

- Você está principalmente na AWS e quer a experiência mais simples e mais nativa da AWS
- Sua equipe não tem expertise existente em Kubernetes
- Você quer menos overhead operacional

**Use EKS** se:

- Você precisa de recursos específicos do Kubernetes (Custom Resource Definitions, Helm charts, o ecossistema Kubernetes)
- Sua equipe já conhece o Kubernetes
- Você está rodando um ambiente híbrido (parte on-premises, parte na AWS) e quer uma camada de orquestração consistente
- Sua carga de trabalho tem requisitos que combinam com a extensibilidade do Kubernetes

**Rede de Contêineres: IPs Efêmeros e Service Discovery**

Uma coisa que pega as equipes de surpresa ao migrar para contêineres: o endereço IP de um contêiner muda toda vez que ele reinicia.

No mundo do EC2, as instâncias tinham IPs privados relativamente estáveis. Você podia (embora não devesse) codificá-los diretamente em arquivos de configuração. Os serviços se conheciam por IP.

No mundo dos contêineres, cada tarefa no ECS recebe um IP da sub-rede da VPC quando inicia. Quando ela para e uma nova tarefa inicia (como parte de uma implantação ou um reinício), essa nova tarefa recebe um IP diferente.

"O que acontece quando um serviço está codificado para chamar `10.0.1.45` e aquele contêiner é substituído por `10.0.1.82`?" perguntou Priya. "O serviço que faz a chamada começa a bater em nada."

É por isso que o service discovery importa em ambientes de contêineres. O ECS + Application Load Balancer lida com isso automaticamente: o nome DNS do ALB é estável; o ECS registra as tarefas íntegras com o grupo de destino; o ALB roteia para quaisquer tarefas que estejam atualmente íntegras. O serviço que faz a chamada fala com o nome DNS do ALB, não com IPs de contêiner individuais.

Para comunicação interna serviço-a-serviço (não voltada ao usuário), o **AWS Cloud Map** fornece service discovery: cada serviço ECS se registra no Cloud Map, que fornece um nome DNS estável. O serviço de pedidos chama `http://notification.nimbus.local:8080`, e o Cloud Map resolve isso para quaisquer tarefas do serviço de notificação que estejam atualmente íntegras.

"Então os contêineres falam uns com os outros através de nomes DNS, não IPs?" confirmou Leo.

"Correto. O IP é efêmero. O nome DNS é o contrato."

**Injeção de Segredos: Sem Segredos em Variáveis de Ambiente**

A implantação original do EC2 tinha um problema que Priya vinha sinalizando havia meses: os segredos (senha do banco de dados, chaves de API, credenciais do SES) estavam armazenados em variáveis de ambiente na instância EC2, definidos via um script de implantação.

As variáveis de ambiente são acessíveis a qualquer processo rodando na instância. Elas aparecem em ferramentas de depuração, em alguns relatórios de crash e em listas de processos. Também são visíveis no CloudWatch se você as logar (o que algumas ferramentas de desenvolvimento fazem por padrão).

Os contêineres não resolvem isso automaticamente — você ainda poderia passar segredos como variáveis de ambiente na definição de tarefa do ECS. E as definições de tarefa do ECS são armazenadas no console da AWS, visíveis a qualquer um com acesso ao ECS.

O padrão correto: **integração do AWS Secrets Manager + definição de tarefa do ECS**.

Em vez de armazenar a senha do banco de dados na definição de tarefa:

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

O ECS recupera o segredo do Secrets Manager no momento do lançamento da tarefa e o injeta no contêiner como uma variável de ambiente. O valor do segredo nunca é armazenado na definição de tarefa — apenas o ARN do segredo do Secrets Manager. O contêiner recebe o valor em tempo de execução. O Secrets Manager pode rotacionar o valor sem mudar a definição de tarefa.

"E se alguém ler a definição de tarefa?" perguntou Priya. "Veria o ARN do Secrets Manager, mas não o valor."

"E sem as permissões IAM certas", confirmou Leo, "também não consegue recuperar o valor do Secrets Manager."

"Esse é o design", disse Priya. "A função de execução da tarefa tem permissão para ler aquele segredo específico. Nada mais. Comprometer a definição de tarefa dá a você um ARN, não uma senha."

"Qual deles deveríamos usar?" perguntou Maya. "E por que não Kubernetes? Ele está em toda descrição de vaga. Em toda palestra de conferência."

"ECS", disse Priya imediatamente. "Não temos expertise em Kubernetes. O ECS faz tudo o que precisamos. Adicionar Kubernetes agora seria adicionar complexidade operacional sem benefício prático."

Soo-Jin, que tinha rodado clusters Kubernetes na empresa anterior, assentiu. "Eu carreguei aquele pager. Você não quer isso até precisar."

"Sempre podemos migrar para o EKS mais tarde se ficarmos grandes demais para o ECS", acrescentou Leo.

Esta é uma resposta sênior correta: escolha a ferramenta mais simples que atende às suas necessidades atuais.

**ECR: Protegendo Suas Imagens**

"E se alguém tentar invadir por uma imagem base vulnerável?" perguntou Priya. "Alguém pega uma imagem antiga com um CVE conhecido e a usa para conseguir uma posição no contêiner da aplicação?"

Era a pergunta certa a fazer antes de implantar qualquer contêiner em produção.

O **Amazon ECR (Elastic Container Registry)** armazena suas imagens Docker e pode varrê-las em busca de vulnerabilidades conhecidas antes da implantação. A varredura de imagens do ECR verifica a imagem contra um banco de dados de CVEs conhecidos (Common Vulnerabilities and Exposures) e sinaliza problemas por severidade.

A política que Priya escreveu: nenhuma imagem com um CVE de severidade CRITICAL seria implantada em produção. O pipeline de CI/CD verificaria os resultados da varredura antes de atualizar o serviço ECS. Se uma vulnerabilidade crítica fosse encontrada, o pipeline falharia e alertaria a equipe.

"Isso não é paranoia", disse Priya. "É apenas ter uma verificação antes de implantar."

**Como os Contêineres Mudam as Implantações**

Antes dos contêineres, implantar uma nova versão da API da Nimbus significava:

1. Dar SSH em cada instância EC2
2. Puxar o código mais recente do Git
3. Instalar/atualizar dependências
4. Reiniciar o processo da aplicação
5. Verificar a integridade
6. Passar para a próxima instância

Isso era propenso a erros e lento. Exigia coordenação. Se o passo 3 falhasse na instância 4, você tinha uma implantação mista com algumas instâncias rodando a versão antiga e algumas falhando em rodar a nova versão.

Com o ECS e contêineres:

1. Construir uma nova imagem Docker (automatizado no pipeline de CI/CD)
2. Fazer push para o ECR
3. Atualizar o serviço ECS para usar a nova versão da imagem

O ECS lida com a implantação contínua (rolling): inicia novas tarefas com a nova imagem, espera que elas fiquem íntegras, depois para as tarefas antigas. Implantação com zero tempo de inatividade, automatizada.

Se a nova versão falha nas verificações de integridade, o ECS para a implantação e a versão antiga continua servindo o tráfego.

**A Configuração Mínima de Implantação: Verificações de Integridade**

Toda a segurança das implantações de contêineres depende de as verificações de integridade realmente funcionarem.

O ECS usa dois tipos de verificação de integridade:

**Verificação de integridade em nível de contêiner**: Definida no Dockerfile ou na definição de tarefa. Roda dentro do contêiner para verificar se a aplicação está respondendo.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Verificação de integridade do grupo de destino do ALB**: O balanceador de carga periodicamente envia requisições HTTP a um endpoint de integridade. As tarefas que falham na verificação de integridade são removidas do grupo de destino.

Se nenhuma das verificações de integridade estiver configurada corretamente, o ECS considera toda tarefa íntegra — e implantará uma imagem quebrada sem parar. Este é o erro mais comum de implantação de contêineres.

"O endpoint de verificação de integridade poderia vazar informação interna?" perguntou Priya.

O endpoint de verificação de integridade em `/health` retornava apenas: `{"status": "ok"}`. Sem números de versão, sem estados de dependência, sem configuração interna. Qualquer informação na resposta de integridade poderia ser útil a alguém mapeando a aplicação. Mantenha os endpoints de integridade mínimos.

Para um status de integridade interno detalhado (conectividade do banco de dados, verificações de dependência), use um endpoint `/health/detail` separado e autenticado — acessível apenas de dentro da VPC.

**Logging Estruturado: A Única Janela Para um Contêiner em Execução**

No EC2, algo dava errado e você dava SSH. Você fazia tail do arquivo de log. Você olhava a tabela de processos. Você verificava o uso de disco. Você ficava bisbilhotando.

Em um contêiner, não há SSH. O contêiner é efêmero — ele pode estar rodando em qualquer host do cluster, e o ECS o substituirá sem aviso se ele falhar nas verificações de integridade. Quando você pensar em dar SSH, o contêiner que você queria examinar pode não existir mais.

Os logs não são uma conveniência de depuração em ambientes containerizados. Eles são a única evidência de que algo aconteceu.

"E se um contêiner falha silenciosamente e não temos logs?" perguntou Priya durante a revisão de arquitetura de contêineres. "Poderíamos ter uma tarefa saindo com código 1 e nunca saber a causa se os logs não fossem capturados antes de ela terminar."

Isso não é hipotético. Acontece nas primeiras implantações de contêineres, consistentemente.

O padrão correto: configurar todo contêiner para enviar logs estruturados ao **Amazon CloudWatch Logs** usando o log driver `awslogs`. O ECS lida com o envio automaticamente — nenhum agente de log para instalar, nenhum contêiner sidecar necessário.

Na definição de tarefa:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Toda linha escrita no stdout ou stderr dentro do contêiner é capturada e enviada ao log group `/ecs/nimbus-api`, organizada por ID de tarefa. O ECS cria um novo log stream para cada tarefa, de modo que você pode encontrar os logs do contêiner específico que falhou — mesmo depois de ele ter sido substituído.

A função de execução da tarefa precisa de permissão para escrever no CloudWatch Logs. Sem ela, o log driver falha silenciosamente e toda a saída de log é perdida.

**Logs estruturados vs texto puro**: Logs de texto puro ("Order 7741 placed") exigem grep. Logs JSON estruturados (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) podem ser consultados com o CloudWatch Logs Insights usando uma sintaxe que se assemelha a SQL:

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Essa consulta roda diretamente contra o log group. Sem banco de dados. Sem pipeline de dados. Sem job de ETL. A resposta está lá em segundos.

Isso não substitui o data lake de analytics que construiremos no capítulo 26. Ele responde a perguntas operacionais — "quantos pedidos do restaurante 47 nos últimos 30 minutos?" — no meio de um incidente, quando você não tem tempo de rodar uma consulta Athena.

**CloudWatch Container Insights**

O **Container Insights** é um recurso do CloudWatch que coleta e agrega métricas em nível de contêiner — CPU, memória, I/O de rede, I/O de armazenamento — por cluster, serviço e tarefa do ECS. Em vez de métricas em nível de EC2 (como o host está?), você vê métricas em nível de tarefa (como este serviço ECS específico está?).

Habilite-o com uma única configuração no cluster ECS:

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Após habilitar:

- Você vê um painel por serviço: contagem de tarefas, utilização de CPU, utilização de memória
- Você pode alarmar na CPU em nível de tarefa (em vez da CPU do host EC2, que é um sinal muito mais grosseiro)
- Você pode correlacionar picos de memória com eventos de log — a memória da tarefa subiu para 95% às 14h22; os logs mostram um pico de requisições de entrada da importação de cardápio do restaurante 47 exatamente às 14h21

"Quanto isso custa por mês?" perguntou Tom.

O Container Insights cobra pelas métricas personalizadas e pelo armazenamento de logs que ele gera. Na escala da Nimbus (três serviços, 3-6 tarefas cada), isso era aproximadamente US$ 12/mês — uma troca razoável por visibilidade operacional em nível de tarefa.

Leo o tinha habilitado no mesmo dia.

A primeira vez que uma tarefa falhou em uma verificação de integridade e foi substituída pelo ECS, o painel do Container Insights capturou o evento automaticamente: ID da tarefa, hora de início, hora da falha, código de saída. O log stream do CloudWatch para aquela tarefa preservou as últimas 40 linhas de saída antes do encerramento — que mostravam uma exceção não capturada acionada por um JSON de cardápio malformado de um novo parceiro de restaurante.

Sem Container Insights e logging estruturado: um pico misterioso nas taxas de erro, investigação exigindo dar SSH em um host que não roda mais a tarefa com falha, 45 minutos de adivinhação.

Com eles: um link para o log stream no painel do CloudWatch, a exceção exata, o ID do restaurante, o campo problemático — em menos de cinco minutos.

"Sem SSH", disse Leo, revisando o post-mortem. "Sem tempo de inatividade para investigar. Os logs fizeram o trabalho."

"Os logs só fazem o trabalho", disse Priya, "se você os configurou para serem capturados."


**Quando os Contêineres São a Escolha Errada**

"Espera — mas *por que* não containerizaríamos tudo?" perguntou Maya. "Você acabou de me convencer de que os contêineres resolvem todos os problemas de configuration drift. Por que não rodar cada serviço como um contêiner?"

Era a mesma pergunta que ela tinha feito sobre o Lambda. A resposta era similar.

Os contêineres adicionam requisitos operacionais: você precisa de um registro de contêineres (ECR), um pipeline de CI/CD que constrói e faz push de imagens, um orquestrador (ECS), monitoramento configurado para visibilidade em nível de tarefa em vez de em nível de instância, e uma equipe que entenda Docker e versionamento de imagens.

Para um serviço que já está funcionando bem no EC2, estável e que não sofre de configuration drift, o custo de containerizá-lo pode exceder o benefício.

Casos específicos onde os contêineres são a escolha errada:

**Serviços com estado que não são construídos para a mobilidade de contêineres**: Bancos de dados em contêineres exigem um gerenciamento cuidadoso de volumes persistentes. A maioria das equipes que rodam bancos de dados em contêineres eventualmente os move de volta para serviços gerenciados (RDS, ElastiCache) depois de encontrar essa complexidade.

**Serviços com requisitos de hardware especializado**: Cargas de trabalho de GPU, configurações específicas de interface de rede ou processamento baseado em FPGA exigem instâncias EC2 com hardware específico. Os contêineres não mudam isso — você ainda usaria o tipo de lançamento EC2, apenas com contêineres por cima, e a abstração do contêiner adiciona complexidade sem benefício.

**Scripts e jobs muito simples**: Um script Python de 40 linhas que roda uma vez por semana e não tem problemas de drift de dependências. Adicionar Docker, ECR, definições de tarefa do ECS e um pipeline de CI/CD para isso é desproporcional. O Lambda é mais simples. Um simples cron job no EC2 pode ser ainda mais simples.

"O princípio", disse Leo, "é o mesmo de sempre: combine a ferramenta com o problema. Os contêineres resolvem o configuration drift e a consistência de implantação. Se você não tem esse problema, você não precisa de contêineres."

## AWS Batch: Contêineres para Jobs em Larga Escala

O ECS e o EKS são projetados para serviços de longa duração — aplicações que rodam continuamente, aceitam requisições e escalam com o tráfego. Mas algumas cargas de trabalho são diferentes: elas rodam por uma duração fixa, processam um conjunto de dados definido e então param. Gerar faturas de fim de mês para centenas de restaurantes. Rodar um job de treinamento de machine learning. Processar uma exportação de analytics noturna.

Para essas cargas de trabalho, você não quer um serviço — você quer um job.

O **AWS Batch** é um serviço totalmente gerenciado que roda jobs de computação em lote em qualquer escala. Você define seu job como um contêiner Docker (o mesmo formato de contêiner que o ECS usa), e o Batch cuida do resto: provisionar computação EC2 ou Fargate, agendar jobs em filas, escalar a capacidade para cima quando os jobs chegam e de volta a zero quando eles terminam.

Conceitos-chave:

- **Definição de job:** o contêiner Docker, os requisitos de recursos (vCPU, memória) e o comando a rodar
- **Fila de jobs:** onde os jobs submetidos esperam antes de rodar; cada fila é associada a um ou mais ambientes de computação
- **Ambiente de computação:** a capacidade EC2 ou Fargate subjacente. Pode usar Spot Instances para até 90% de economia de custo — o Batch lida com interrupções e repetições automaticamente

"Espera — mas *por que* usaríamos o Batch em vez de simplesmente rodar uma tarefa ECS?" perguntou Maya.

"Porque um serviço ECS está sempre ligado", disse Leo. "Ele espera por requisições. Um job do Batch roda, termina, e o Batch escala a computação de volta a zero. Você não paga nada entre as execuções."

Tom ergueu os olhos da página de preços. "E as Spot Instances?"

"O Batch pode rodar em Spot. Se uma Spot Instance é recuperada no meio do job, o Batch tenta novamente automaticamente. Para um job de faturas de 45 minutos, isso é tranquilo."

**vs. ECS/EKS:** ECS/EKS rodam serviços — sempre ligados, orientados a requisições. O Batch roda jobs — duração finita, orientados a dados, escala a zero quando ocioso.

**vs. Lambda:** O Lambda tem um timeout de 15 minutos. Os jobs do Batch podem rodar por horas ou dias.

Contexto da Nimbus: o job de geração de faturas noturno leva 45 minutos para centenas de parceiros de restaurante. O Lambda expira em 15 minutos. Um serviço ECS sempre ligado desperdiça dinheiro 23 horas por dia. O Batch roda o job em Spot Instances, termina em 38 minutos, custa US$ 1,20 e se desliga.

"Isso é mais barato que o café que comprei enquanto esperava o script antigo terminar", disse Leo.

"E sem EC2 para gerenciar", acrescentou Priya. "O Batch o provisiona, o roda, o encerra."

## Pontos Fortes e Limitações

**Contêineres**:

- Eliminam a inconsistência de ambiente ("funciona na minha máquina")
- Permitem implantações rápidas e confiáveis
- Imutáveis — a mesma imagem roda de forma idêntica em todo lugar
- Eficientes — mais leves que VMs, inicialização mais rápida

**ECS**:

- Mais simples que o Kubernetes para cargas de trabalho centradas na AWS
- Integração estreita com a AWS (IAM, ALB, CloudWatch, Secrets Manager)
- A opção Fargate remove o gerenciamento de EC2 inteiramente

**EKS**:

- Compatibilidade total com Kubernetes — use o ecossistema inteiro
- Melhor para ambientes híbridos ou equipes com expertise em Kubernetes
- Mais complexo de configurar e operar que o ECS

**Onde fica complicado**:

- As imagens de contêiner devem ser construídas e versionadas — exige um pipeline de CI/CD
- Depurar contêineres exige ferramentas diferentes da depuração de processos tradicionais
- Contêineres com estado (bancos de dados em contêineres) exigem configuração cuidadosa de armazenamento persistente
- A rede entre contêineres (comunicação serviço-a-serviço) exige entender conceitos de rede de contêineres

## Resumo

O Lambda tornou a computação ociosa gratuita. Os contêineres tornaram a implantação determinística. Juntos, eles resolveram duas das causas mais comuns de dor operacional para equipes de engenharia em crescimento.

- Os **contêineres** empacotam o código da aplicação, o runtime e as dependências juntos — rodam de forma idêntica em qualquer lugar.
- O **Docker** é a tecnologia de contêineres padrão. As imagens são blueprints; os contêineres são instâncias em execução.
- O **ECR (Elastic Container Registry)** é o registro Docker gerenciado da AWS — armazene, versione e varra suas imagens aqui. Habilite a varredura de imagens para capturar CVEs antes da implantação.
- O **ECS (Elastic Container Service)** orquestra contêineres. Você define tarefas e serviços; o ECS gerencia a colocação e o ciclo de vida.
- O **Fargate** é computação serverless para contêineres — sem instâncias EC2 para gerenciar. Frequentemente mais barato que o tipo de lançamento EC2 em escalas pequenas devido à eliminação do overhead do EC2. Em escalas maiores com bin-packing cuidadoso de tarefas, o tipo de lançamento EC2 pode se tornar mais econômico.
- O **EKS (Elastic Kubernetes Service)** é Kubernetes gerenciado — para equipes que precisam de recursos ou compatibilidade com Kubernetes.
- **Integração com o Secrets Manager**: injete segredos em contêineres no momento do lançamento via a definição de tarefa — não armazene valores de segredos em variáveis de ambiente ou definições de tarefa diretamente.
- **Service discovery**: os IPs de contêiner são efêmeros. Use nomes DNS do ALB ou o Cloud Map para endereçamento estável de serviços.
- Escolha o ECS pela simplicidade na AWS; escolha o EKS pela compatibilidade com o ecossistema Kubernetes.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Resilientes (Domínio 2, Tarefa 2.1)*

- **Sinais de ECS vs EKS**: Cenários de exame que mencionam "Kubernetes", "Helm", "expertise existente em Kubernetes" ou "orquestração de contêineres multi-cloud" → EKS. Todo o resto → ECS.
- **Fargate vs tipo de lançamento EC2**: "Não quer gerenciar instâncias EC2 para contêineres", "contêineres serverless", "sem gerenciamento de infraestrutura" → Fargate. "Precisa de tipos de instância específicos", "cargas de trabalho de GPU", "controle granular da instância" → tipo de lançamento EC2.
- **Função de tarefa vs. função de execução de tarefa** — um discriminador real de exame. A **função de execução de tarefa** é usada pelo *agente* do ECS em nome da tarefa, antes e em torno do seu código: puxar a imagem do ECR, buscar segredos do Secrets Manager, escrever logs no CloudWatch. A **função de tarefa** é o que *o código da sua aplicação dentro do contêiner* usa para chamar serviços da AWS: ler do S3, escrever no DynamoDB — como as funções de instância EC2, mas por tarefa, de modo que cada tarefa pode ter permissões diferentes. "O contêiner precisa ler do S3" → **função de tarefa** (anexada na definição de tarefa). "A tarefa falha em puxar sua imagem / não consegue buscar seu segredo" → a **função de execução** está sem permissões.
- **Fargate Spot**: rode contêineres tolerantes a falhas em capacidade ociosa por até ~70% de desconto, com um aviso de interrupção de dois minutos — o equivalente do Fargate ao EC2 Spot, configurado via capacity providers. Gatilho do exame: "rodar contêineres tolerantes a interrupção pelo menor custo sem gerenciar instâncias" → Fargate Spot.
- **Varredura de imagens do ECR**: O ECR pode varrer imagens de contêiner em busca de vulnerabilidades conhecidas (CVEs). Sinal do exame: "varrer contêineres em busca de vulnerabilidades de segurança" → varredura de imagens do ECR.
- **Implantações blue/green**: O ECS oferece suporte a implantações blue/green via integração com o CodeDeploy. Implantação com zero tempo de inatividade com rollback automático. Padrão do exame: "implantar sem tempo de inatividade com rollback automático" → ECS + CodeDeploy blue/green.
- **Integração com o Secrets Manager**: Sinal do exame: "injetar segredos em contêineres sem armazenar valores nas definições de tarefa" → use o campo `secrets` na definição de tarefa referenciando um ARN do Secrets Manager. A função de execução de tarefa precisa da permissão `secretsmanager:GetSecretValue`.
- **ECS Service Auto Scaling**: Escale o número de tarefas com base em CPU, memória ou métricas personalizadas do CloudWatch. Funciona com o ALB para rotear tráfego ao número certo de tarefas em execução.
- **AWS Batch:** Computação em lote gerenciada para contêineres Docker. Fila de jobs → ambiente de computação (EC2 ou Fargate, suporta Spot). Use quando: o timeout do Lambda é curto demais, o serviço ECS é um desperdício para jobs finitos. Gatilho do exame: "processamento em lote de larga escala" ou "job que roda por horas" → AWS Batch.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre uma imagem Docker e um contêiner Docker. Explique a diferença entre ECS e ECR.

*(Dica: A imagem está para o contêiner assim como uma receita está para um prato pronto. O ECR armazena imagens; o ECS as roda.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa tem uma aplicação de microsserviços atualmente rodando em instâncias EC2 gerenciadas manualmente. A equipe tem dificuldades com implantações inconsistentes — diferentes instâncias EC2 têm versões diferentes de bibliotecas, causando bugs difíceis de reproduzir. Eles querem padronizar as implantações ao mesmo tempo em que minimizam o overhead operacional de gerenciar os servidores subjacentes. A equipe não tem experiência com Kubernetes.

Qual solução MELHOR atende a esses requisitos?

A) Containerizar a aplicação com Docker; usar o Amazon ECS com o tipo de lançamento Fargate  
B) Implantar no EC2 com o AWS Systems Manager Patch Manager para manter as instâncias consistentes  
C) Containerizar a aplicação com Docker; usar o Amazon EKS com node groups autogerenciados  
D) Usar o AWS Elastic Beanstalk para gerenciar as implantações e a configuração das instâncias automaticamente

**Dica 1**: Os contêineres resolvem o problema do "ambiente inconsistente" diretamente. Quais opções usam contêineres?

**Dica 2**: "Minimizar o overhead operacional de gerenciar servidores" → Fargate (sem gerenciamento de EC2) vs nodes autogerenciados (ainda gerencia EC2).

**Dica 3**: "Sem experiência com Kubernetes" → o EKS é mais complexidade operacional que o ECS.

**Resposta**: A

**Explicação**: Containerizar com Docker garante que toda implantação use a mesma imagem com as mesmas dependências — eliminando o configuration drift. O ECS com Fargate significa nenhuma instância EC2 para gerenciar. A equipe se concentra no código da aplicação e nas definições de contêiner, não na manutenção de servidores. O ECS (não o EKS) é apropriado para equipes sem experiência com Kubernetes.

**Por que não B?** O Patch Manager mantém as instâncias EC2 atualizadas mas não resolve a inconsistência de versão de bibliotecas entre as aplicações. O problema fundamental (ambientes de código diferentes em instâncias diferentes) permanece.

**Por que não C?** O EKS com node groups autogerenciados exige gerenciar instâncias EC2 *e* aprender Kubernetes. Nenhum dos dois se alinha aos requisitos.

**Por que não D?** O Elastic Beanstalk gerencia a implantação da aplicação no EC2 mas não resolve a inconsistência fundamental de ambiente a menos que contêineres sejam usados. O Beanstalk não usa imagens Docker por padrão (embora possa ser configurado para isso).

*Domínio SAA-C03: Projetar Arquiteturas Resilientes — Tarefa 2.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está dividindo a API monolítica em três microsserviços: o serviço de pedidos, o serviço de cardápio e o serviço de notificação. Cada serviço tem requisitos de escalonamento diferentes (o serviço de pedidos escala com o tráfego; o serviço de cardápio é principalmente somente leitura e estável; o serviço de notificação tem rajadas irregulares).

Projete a arquitetura ECS para esses três serviços. Como você lidaria com a comunicação serviço-a-serviço? Você usaria um cluster ECS ou três? Como você configuraria o Auto Scaling de forma diferente para cada serviço?

Considere: o serviço de cardápio tem muita leitura e poderia servir dados defasados por 60 segundos — você adicionaria cache na frente dele? O serviço de notificação escala fortemente em rajadas nas noites de sexta — você definiria a capacidade Min do Fargate como 1 e a Max como 20? O que acontece com as notificações em trânsito durante um evento de redução de escala?

*(Não há uma resposta única correta. O objetivo é praticar a arquitetura de microsserviços no ECS.)*

## Cena Pós-Créditos

A primeira implantação de contêiner foi impecável.

Nova versão da API: zero tempo de inatividade. O ECS a implementou, as verificações de integridade passaram, as tarefas antigas drenaram, as novas tarefas assumiram. Leo observou o status das tarefas no console com algo próximo da descrença.

"Simplesmente funcionou", disse ele.

"Semana passada você disse a mesma coisa sobre o deploy manual por SSH antes de ele falhar na instância três", disse Priya.

"Eu já implantei — ah." Leo fez uma pausa. "Implantei sem marcar a versão da imagem. Deixa eu corrigir isso."

"Esse é o ponto", disse Priya. "O versionamento de imagens é como você rastreia o que está rodando."

"Como você sabe qual versão está em produção agora?" perguntou Maya.

Leo abriu o console do ECS. Sob a tarefa em execução, a imagem estava listada: `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Versão 1.0.3. Construída às 14h22 UTC. Implantada às 14h31 UTC.

"Na configuração antiga de EC2", disse Leo, "eu teria de dar SSH em uma instância e rodar `pip show` para ver qual versão de cada dependência estava instalada. E poderia ser diferente nas outras instâncias."

"E agora?"

"A tag na imagem me diz exatamente o que está rodando. O histórico de varredura do ECR me diz se ela foi varrida. O histórico de implantação do ECS me diz quando ela foi implantada e qual era a versão anterior."

"Sem SSH. Sem tempo de inatividade. Sem 'espera reiniciar'."

"A imagem é o artefato de implantação", disse Priya. "O ambiente é imutável. O processo de implantação é declarativo. É assim que o software deveria ser enviado."

Leo encarou o console por mais um momento.

"Passei três anos coordenando implantações de EC2", disse ele. "Coordenando scripts de SSH. Escrevendo runbooks de implantação."

"Você estava resolvendo um problema", disse Priya, "que os contêineres resolvem por design."

Ele não disse nada depois disso. Mas na manhã seguinte, começou a escrever documentação sobre o processo de build de contêineres, para que mais ninguém precisasse passar três anos descobrindo isso.

O bug da instância três, as seis semanas de drift não documentado e os problemas como ele que ainda não tinham capturado — tudo isso tinha uma única causa raiz. Não um ator malicioso. Não uma falha de hardware. Apenas um servidor que tinha sido tratado como uma instalação permanente em vez de uma unidade descartável.

O contêiner era a resposta para isso. Não porque era novo e interessante. Porque tornava a pergunta impossível de fazer.

No próximo capítulo: o fluxograma que roda a si mesmo — e lembra onde parou.
