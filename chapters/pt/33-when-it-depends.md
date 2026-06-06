# Capítulo 33: Depende

Respire fundo uma última vez antes deste capítulo.

O cursor piscava no slide em branco de Maya. Título: "Arquitetura na Nimbus." Ela o apagou e digitou: "A Pergunta." Então olhou para a sala e percebeu que não precisava do slide de jeito nenhum.

**Recapitulando: Da Revisão à Apresentação**

A revisão de arquitetura com Carlos — seis meses e várias centenas de lançamentos de restaurantes atrás agora — havia deixado a equipe com uma pilha de ADRs e uma forma mais limpa de pensar sobre decisões antes de lançá-las. Maya vinha se preparando para a apresentação aos investidores quando percebeu que tudo o que Carlos havia perguntado — e tudo o que ela havia respondido com confiança — se reduzia à mesma lógica subjacente. Os investidores perguntariam por quê. Ela havia aprendido, ao longo de dois anos construindo a Nimbus, que a resposta nunca era o nome do serviço. A resposta era sempre o conjunto de condições que tornava um serviço certo e outro errado. Ela estava prestes a entrar em uma sala de pessoas que lhe pediriam para defender cada escolha arquitetural. Ela estava pronta.

**A Pergunta**

No final de quase toda discussão de arquitetura, alguém eventualmente pergunta: "Qual é a resposta certa?"

E a resposta mais útil, frustrante, honesta e incompreendida em toda a engenharia de software é:

**Depende.**

Não porque a pergunta não tem resposta. Não porque o especialista está sendo evasivo. Mas porque a resposta certa genuína e estruturalmente depende de um contexto que não estava na pergunta.

Este capítulo é sobre aprender a dizer "depende" corretamente — o que significa ser capaz de completar a frase.

Pense em um médico que é perguntado: "A cirurgia é o tratamento certo?" Um mau médico diz sim ou não sem examinar o paciente. Um bom médico diz: "Depende — do diagnóstico, da idade do paciente, de suas outras condições e do que acontece se esperarmos." A resposta não é evasão. É precisão. "Depende" seguido de uma frase completa é a coisa mais útil que um médico — ou um arquiteto — pode dizer.

**O Fim da Nimbus**

Dois anos e meio após o início. Maya estava em uma sala de conferência em Seattle, apresentando a um grupo de investidores de capital de risco.

A Nimbus havia crescido: 947 parceiros restaurantes. 18.000 pedidos diários. US$ 18 milhões em GMV mensal. Três cidades ativas, mais duas lançando. Uma equipe de quatorze engenheiros em dois fusos horários.

Os investidores tinham perguntas. Um deles — um sócio técnico do fundo — se inclinou para a frente.

"Qual banco de dados você está usando?" ele perguntou.

Maya não hesitou.

"Para pedidos e dados de clientes: Aurora PostgreSQL. Para o catálogo de cardápio: DynamoDB. Para gerenciamento de sessões e cache: ElastiCache Redis. Para análises: Athena sobre arquivos Parquet no S3, com Redshift para as consultas de painel de alta frequência."

Ele assentiu. "Por que Aurora para pedidos e não DynamoDB?"

"Porque os pedidos têm estrutura relacional complexa — eles referenciam itens do cardápio, contas de clientes, endereços de restaurantes, métodos de pagamento. Precisamos de consistência transacional em múltiplas entidades. Um banco de dados relacional é a ferramenta certa para isso. O ponto forte do DynamoDB é o acesso de alto throughput baseado em chave com esquema flexível, que é exatamente o padrão de acesso do catálogo de cardápio."

Ele anotou algo. "E quanto ao escalonamento? Você disse 18.000 pedidos diários. Isso é cerca de 12 por minuto em média. Como você projetou para o pico?"

"O rush do jantar de sexta-feira é cerca de 25x a média. Escalamos horizontalmente com ECS e Aurora Serverless v2, que lida com o burst automaticamente. O CloudFront absorve a carga de conteúdo estático. A API é stateless, então o escalonamento horizontal é limpo."

"E se o Aurora Serverless v2 não conseguir escalar rápido o suficiente?"

"Temos resultados de testes de carga. O tempo para escalar do Aurora Serverless v2 é de menos de 10 segundos. A rampa de pico de sexta-feira média leva 8 minutos desde a linha de base. Estamos confortáveis com a margem."

O sócio técnico olhou para o restante dos investidores. "Ela conhece seu sistema."

Ele tinha mais perguntas.

"Como você lida com a segurança de implantação? Com 947 restaurantes, uma implantação ruim significa que 947 restaurantes não conseguem receber pedidos."

Maya já havia sido perguntada isso, internamente. "Feature flags para todas as mudanças de comportamento. Implantamos código continuamente, mas o novo comportamento é controlado por flags que ativamos gradualmente. Uma implantação que muda o fluxo de confirmação de pedidos é liberada para 1% dos restaurantes por 24 horas, depois 10%, depois 50%, depois 100% — com rollback automático se as taxas de erro excederem o limiar em qualquer estágio."

"Quanto tempo leva uma liberação completa?"

"Três dias para uma mudança de alto risco. Um dia para baixo risco. Rollbacks de emergência são concluídos em menos de quatro minutos."

"Qual é a sua latência p99 do Stripe?"

Tom respondeu antes de Maya conseguir. "214 milissegundos."

"Isso é alto," disse o investidor.

"Nosso SLA aos restaurantes é da realização do pedido à confirmação em menos de 5 segundos," disse Tom. "214ms para a chamada do Stripe são 4,3% desse orçamento. O tempo restante é a escrita no Aurora, a entrega da mensagem SQS, a notificação push para o tablet do restaurante. Temos margem."

"E se o Stripe tiver um incidente?"

"Usamos a captura de pagamento assíncrona do Stripe. O pedido é aceito e o restaurante notificado imediatamente. A captura de pagamento acontece de forma assíncrona. Se o Stripe estiver lento, o pedido ainda é processado — a captura é repetida. Se o Stripe estiver totalmente fora do ar, enfileiramos a tentativa de captura com backoff exponencial e alertamos nosso plantão. Não seguramos um pedido por causa do Stripe em 14 meses."

O investidor anotou algo. "Vocês têm algum ponto único de falha?"

Priya respondeu. "O Aurora em uma única região é uma dependência de região única. Temos Multi-AZ para falhas no nível de AZ, e um leitor do Aurora Global Database já rodando em us-east-1. Uma falha regional completa significaria fazer failover para esse leitor — e o failover regional automatizado em torno dele é o que estamos construindo neste trimestre. Até lá, sim — uma falha regional em us-west-2 derrubaria a Nimbus."

"Por que vocês ainda não construíram o failover multi-região?"

"Porque até seis meses atrás, o custo de engenharia de construí-lo corretamente excedia o risco de negócio da interrupção," disse Priya. "Nunca tivemos uma falha regional da AWS durando mais de 30 minutos na nossa região de operação. Com 287 restaurantes — cerca de 4.200 pedidos por dia a um valor médio de pedido de US$ 34 — uma interrupção regional de 2 horas nos custa aproximadamente US$ 12.000 em GMV. O custo de engenharia de um warm standby corretamente implementado é de 3 meses de tempo de engenheiro sênior. Com nossa receita atual, a conta favorecia adiar."

"E agora?"

"Com 947 restaurantes e 18.000 pedidos diários, a mesma interrupção de 2 horas custa cerca de US$ 51.000 em GMV e gera dano reputacional significativo com parceiros restaurantes que dependem de nós para o serviço de jantar deles. A conta mudou. O projeto de failover começa na próxima sprint."

O investidor olhou para os outros investidores na sala. "Ela também conhece seu perfil de risco."


**As Quatro Perguntas Por Trás do "Depende"**

Ela havia feito alguma versão de cada uma dessas perguntas por dois anos sem saber que estava fazendo a mesma pergunta de quatro formas diferentes. A sessão com os investidores deixou isso claro. Cada escolha que ela havia explicado com confiança remetia aos mesmos quatro eixos.

**1. Qual é o padrão de acesso?**

Como os dados são escritos e lidos? Com qual frequência? Por quantos usuários simultâneos? Em qual ordem? Por quais chaves?

Essa pergunta determina a seleção de tecnologia no nível mais fundamental. DynamoDB vs Aurora vs Redshift vs Athena — a resposta correta depende quase inteiramente do padrão de acesso.

**2. Qual é a escala?**

Não apenas agora — em 12 meses, em 5 anos. A escala muda a resposta correta. O que funciona para 100 requisições por dia quebra em 100 milhões. O que é excessivo para 10 usuários é necessário para 10.000.

E a escala não é apenas tráfego. É tamanho da equipe (a arquitetura deve ser mantida pela equipe que você tem). É volume de dados. É alcance geográfico.

**3. Qual é a consequência da falha?**

Se isso quebrar, o que acontece? Um usuário vê uma página lenta? Um pedido falha? O dinheiro se move incorretamente? O prontuário médico de alguém fica inacessível?

A consequência determina quanto você investe em confiabilidade. Uma página de cardápio lenta justifica consistência eventual. Um pagamento falhado justifica escritas síncronas e confirmação explícita.

**4. Qual é a restrição de custo?**

Não apenas dinheiro — também complexidade operacional (que é ela própria uma forma de custo). Uma solução que requer três serviços adicionais pode ser tecnicamente superior a uma mais simples, mas cara demais para manter com uma equipe de quatro pessoas.

"Espera — mas *por que* o padrão de acesso importa tanto?" Maya havia perguntado, dois anos antes, quando Tom propôs pela primeira vez separar o catálogo de cardápio do banco de dados de pedidos. "Não podemos simplesmente otimizar depois?"

Essa pergunta, descobriu-se, era o começo da resposta. Você não consegue otimizar um esquema relacional para padrões de acesso chave-valor sem reconstruí-lo. O padrão de acesso tinha que ser conhecido no momento do design, não adaptado depois. Cada decisão arquitetural que ela havia tomado desde então havia começado com a mesma pergunta.

Você pode estar se perguntando: se "depende" é sempre a resposta certa, como você chega a tomar uma decisão? A resposta é que completar a frase força você a nomear as condições, e uma vez que você as nomeou, você sabe de que informação precisa. "Depende do padrão de acesso" se torna "vá descobrir qual é de fato o padrão de acesso." As quatro perguntas não são uma forma de evitar decisões — são uma forma de tomá-las com a informação certa.

**"Depende": Como Completar a Frase**

A forma correta de dizer "depende" é completá-lo imediatamente:

*"Devemos usar DynamoDB ou Aurora?"*

"Depende do padrão de acesso. Se você precisa de consultas baseadas em chave de alto throughput com esquema flexível, DynamoDB. Se precisa de consistência transacional entre entidades relacionadas com consultas complexas, Aurora."

*"Devemos usar Lambda ou EC2?"*

"Depende das características da carga de trabalho. Lambda para cargas de trabalho orientadas a eventos, de curta duração, variáveis onde o custo zero em inatividade importa. EC2 ou ECS para processos persistentes, com estado ou de longa duração onde o desempenho previsível é mais importante do que o custo em inatividade."

*"Devemos usar Multi-AZ ou Multi-Region?"*

"Depende dos seus requisitos de RTO/RPO e do seu modelo de ameaças. Multi-AZ protege contra falhas de AZ (o modo de falha AWS mais comum) e fornece RPO ~0 e RTO ~60 segundos para RDS. Multi-Region protege contra falhas regionais (raras) e serve usuários globalmente distribuídos. Se você precisa de failover sub-minuto de um desastre regional, Multi-Region. Se a resiliência por AZ é suficiente, Multi-AZ é muito mais simples e barato."

"Depende" não é o fim da resposta. É o começo da resposta real.


*"Devemos usar EKS ou ECS para orquestração de contêineres?"*

O investidor havia perguntado essa antes de Maya passar para o próximo slide. Ela fez uma pausa.

"Depende do tamanho da equipe, da expertise existente em Kubernetes, e de se você precisa de recursos específicos do Kubernetes."

"Detalhe isso," disse ele.

"O Kubernetes é uma plataforma de orquestração poderosa," disse Maya. "Tem um ecossistema rico — Helm charts, custom resource definitions, federação multi-cluster, políticas de agendamento avançadas. Se você tem uma equipe que conhece Kubernetes, tem ferramentas construídas em torno dele e precisa dessas capacidades, o EKS é a escolha certa. Você obtém um control plane gerenciado, mas ainda está gerenciando a complexidade do Kubernetes de políticas de rede, segurança de pods, cotas de recursos e o resto."

"E o ECS?"

"O ECS é mais simples. Sem API do Kubernetes. Sem etcd. Sem complexidade de rede de pods. Você define tasks, services e clusters. O IAM integra nativamente sem exigir plugins adicionais. O modelo mental é significativamente menor. Para uma equipe que ainda não conhece Kubernetes, o ECS elimina meses de curva de aprendizado."

"Qual a Nimbus está usando?"

"ECS," disse ela. "Avaliamos o EKS dezoito meses atrás. Tínhamos um engenheiro com experiência em Kubernetes. Os outros teriam precisado de 3 a 4 meses para se tornarem produtivos em um ambiente Kubernetes de produção. Os recursos que o EKS nos daria — gerenciamento multi-cluster, agendamento customizado — não precisávamos. O ECS com Fargate roda nossos contêineres. A equipe estava produtiva em duas semanas."

"Essa é a escolha certa com 50 engenheiros?" ele perguntou.

"Pode não ser," disse Maya. "Com 50 engenheiros e múltiplas equipes de produto precisando de namespaces isolados, políticas de rede customizadas e cotas de recursos por equipe — o modelo de namespace do Kubernetes se torna genuinamente valioso. O ECS não tem isolamento de namespace equivalente. Nessa escala, a curva de aprendizado do Kubernetes é amortizada por uma equipe muito maior. A resposta 'depende' muda."

"Em que tamanho de equipe a mudança acontece?" ele perguntou.

Ela havia pensado sobre isso. "A regra que uso: quando a sobrecarga operacional do Kubernetes se torna menor do que a sobrecarga organizacional de contornar as limitações do ECS, troque. Para uma equipe de 14 pessoas, ECS. Para uma equipe de 50 pessoas com múltiplas verticais de produto, provavelmente EKS. O número não é fixo — depende do que você está construindo e de quem está construindo."

"Espera — mas *por que* faríamos desse jeito?" Maya perguntou a si mesma, repetindo a pergunta que havia aprendido em dois anos de construção. "Por que não simplesmente escolher um e ficar com ele?"

Porque a resposta certa muda conforme a organização muda. Uma decisão arquitetural tomada para uma equipe de 4 pessoas não é necessariamente correta para uma equipe de 40 pessoas. As condições mudam. A resposta muda com elas.

"Esse é o ponto," disse ela ao investidor. "A resposta correta hoje é ECS. A resposta correta em três anos pode ser EKS. Vamos reconsiderar quando as condições justificarem. Temos um ADR documentando por que escolhemos o ECS, e ele lista explicitamente o que disparariam a reconsideração."

O investidor anotou mais uma observação. "Essa é uma forma madura de sustentar uma decisão técnica."


**Variação: Quando "Depende" Te Coloca em Apuros**

Se o padrão de acesso favorece consultas chave-valor e você escolhe o DynamoDB, você vai superar o Aurora em escala — mas se você adicionar um recurso que exija consultas JOIN em três entidades, você construiu a base errada e precisará migrar sob pressão. A resposta "depende" é tão boa quanto o seu entendimento das condições das quais você está dependendo.

Se você otimiza para a escala atual e o padrão de acesso atual, você tomará a decisão certa para hoje — mas se o tráfego crescer 50x em um ano sem que sua arquitetura se adapte, a decisão correta do primeiro dia se torna o gargalo do dia 365. As quatro perguntas devem ser feitas não apenas no momento do design, mas revisitadas conforme o sistema cresce.

**Os Padrões Que Não Mudam**

Enquanto as escolhas de tecnologia específica evoluem — novos serviços são lançados, os preços mudam, alternativas melhores surgem — alguns padrões subjacentes permanecem estáveis há décadas:

**Separação de preocupações**: Componentes que fazem coisas diferentes devem ser independentes. Uma mudança em um não deve exigir uma mudança em outro. É por isso que você desacopla com SQS, não chamadas diretas. Por que você usa S3 para objetos, não bancos de dados. Por que a camada web e a camada de banco de dados são separadas.

**Defesa em profundidade**: Nenhum controle de segurança único é suficiente. Você tem IAM, grupos de segurança, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Se uma camada falhar, a próxima a captura.

**Pague pelo que usa, quando usa**: O princípio econômico fundamental da nuvem. O Lambda escala até zero. As Spot Instances usam capacidade reserva. As políticas de ciclo de vida S3 movem dados frios para armazenamento mais barato. O DynamoDB on-demand cobra por requisição. Tom havia perguntado "Quanto isso custa por mês?" dez mil vezes ao longo de dois anos. Essa pergunta — feita consistentemente, respondida rigorosamente — havia se transformado em quase US$ 36.000 em economias anuais. Os padrões são diferentes; o princípio é o mesmo.

**Otimize para a falha mais provável**: Multi-AZ primeiro (falhas de AZ acontecem). DR multi-região segundo (falhas regionais são mais raras). Redundância dentro da AZ (múltiplas instâncias) antes de complexidade entre regiões. Construa para a falha realista, não para a catastrófica mas improvável.

**Meça antes de otimizar**: A abordagem de Tom — puxar as métricas do CloudWatch, entender o padrão real, depois tomar decisões — é mais valiosa do que otimização prematura baseada em suposições. O instinto de Leo nos trabalhos em lote noturnos — "Vai ficar tudo bem" — era a coisa mais importante de se treinar para evitar. Geralmente fica tudo bem, até a única vez em que não fica, e você não mediu nada.


**O custo acumulado dos padrões errados**.

Tom tinha outro padrão para adicionar à lista, um que ele havia identificado apenas após três meses de revisão de custos: o custo de não mudar o padrão de fábrica.

Os serviços AWS são projetados para serem seguros e funcionais prontos para uso. Os padrões não são projetados para serem ideais para cada carga de trabalho. O gp2 era o tipo de volume EBS padrão até o gp3 ser lançado em dezembro de 2020. Depois disso, o gp3 se tornou o padrão para novos volumes — mas os volumes gp2 existentes nunca foram convertidos, porque a AWS não modifica recursos existentes do cliente sem ação explícita.

A implicação de custo: cada equipe que criou volumes EBS antes do gp3 e nunca rodou uma auditoria de migração pagou 25% a mais por GB durante anos, não porque tomou a decisão errada, mas porque não tomou decisão nenhuma. O padrão persistiu, e o custo se acumulou silenciosamente.

É por isso que a pergunta "espera, mas por que faríamos desse jeito?" havia se tornado a coisa mais valiosa que a equipe perguntava. Nem sempre era sobre desafiar uma decisão que foi tomada. Às vezes era sobre questionar uma não-decisão: um padrão que foi aceito sem exame.

O padrão se generaliza: reconsidere os padrões de fábrica quando a AWS lança uma nova opção. gp2 para gp3. DynamoDB On-Demand para provisionado com Auto Scaling quando o tráfego estabiliza. S3 Standard para Intelligent-Tiering quando os padrões de acesso se tornam incertos. A reconsideração não precisa ser cara — uma tarde de análise por categoria, trimestralmente. Mas não pode ser pulada. Os padrões se acumulam.

"Cada dólar que estamos gastando em algo que escolhemos é um custo intencional," disse Tom, na revisão mensal. "Cada dólar que estamos gastando em algo que não olhamos desde que provisionamos é um padrão de fábrica potencial que deveria ser questionado."

"Quantos desses temos?" perguntou Maya.

"Menos do que tínhamos seis meses atrás," disse ele. "Mais do que zero."

Essa era a resposta honesta. Sempre era a resposta honesta.


**O Que Este Livro Não Pode Ensinar**

Vamos ser diretos sobre os limites.

Este livro ensinou:

- O que cada serviço AWS principal faz
- As analogias que os tornam intuitivos
- As contrapartidas entre alternativas
- O conhecimento do exame que você precisa para o SAA-C03
- Um framework para pensar sobre decisões arquiteturais

Este livro não pode ensinar:

- **Instinto de produção**: A sensação visceral de que "isso vai ficar estranho sob carga" antes de você ter visto acontecer. Isso vem de operar sistemas reais.
- **Julgamento técnico sob pressão**: Decidir o que fazer às 3 da manhã quando o sistema está inativo e você tem informações incompletas. Isso vem de incidentes.
- **Intuição com partes interessadas**: Saber quando refutar um requisito de negócios porque o custo técnico é muito alto. Isso vem da experiência com os lados técnico e de negócios.
- **A pergunta certa para o contexto específico**: Carlos podia fazer as perguntas certas porque havia visto problemas semelhantes dezenas de vezes. Esse conhecimento é conquistado, não lido.

Você não terminou de aprender. Mal começou.

**O Exame Não É o Destino**

Você pegou este livro para se preparar para o exame AWS Solutions Architect Associate. Isso é válido. A certificação SAA-C03 é real, valorizada e abrirá portas.

Mas o exame testa conhecimento e reconhecimento de padrões. Não testa julgamento. Não testa experiência operacional. Não testa o que você faz quando a arquitetura que construiu para de funcionar às 23h de uma sexta-feira.

A certificação é uma credencial inicial. Quando você passar no exame, saberá como os serviços AWS funcionam e como eles se combinam. Você terá um framework para pensar sobre arquitetura. Você não terá feito isso ainda.

O próximo passo após o exame: construa algo real. Implante-o. Opere-o. Veja-o falhar. Corrija-o. Fique sem dinheiro em um serviço e mova o custo para outro lugar. Seja acordado no meio da noite e tome uma decisão com informações insuficientes.

É assim que o conhecimento deste livro se torna julgamento.

**A Resposta Final de Maya**

No final da reunião com os investidores, o sócio técnico tinha mais uma pergunta.

"Se você estivesse recomeçando hoje, sabendo o que sabe agora, o que faria diferente?"

Maya levou um momento.

"Começaria com infraestrutura como código desde o primeiro dia," disse ela. "Leo implantou a primeira instância EC2 manualmente. Passamos seis meses migrando tudo para o Terraform. Isso foi seis meses de dívida técnica que nos custou tempo real."

"O que mais?"

"Seria mais conservadora com serviços gerenciados no início. Usamos DynamoDB quando um simples banco de dados RDS teria sido suficiente por meses. O design do padrão de acesso do DynamoDB exigiu pensamento experiente que ainda não tínhamos. Redesenhamos o esquema duas vezes."

"Então mais simples é melhor no início?"

"Mais simples é melhor *sempre*. A pergunta é sempre: qual é a coisa mais simples que resolve o problema real, não o problema futuro antecipado? Adicionamos complexidade para resolver problemas que ainda não tínhamos. Parte dessa complexidade causou seus próprios problemas."

O sócio técnico anotou isso.

"Última pergunta," disse ele. "Qual é a coisa mais importante que você sabe sobre construir na AWS que não sabia quando começou?"

Maya pensou nos dois anos. Os incidentes. As revisões de custo. A Well-Architected Review. As decisões arquiteturais tomadas sob pressão e as tomadas com cuidado. As que acertaram e as que tiveram que ser refeitas.

"Que a nuvem não resolve problemas de arquitetura," disse ela. "Ela os amplifica. Uma má decisão on-premises pode custar uma semana. Uma má decisão na nuvem pode custar dinheiro todo mês, em escala, até que alguém perceba."

Ela fez uma pausa.

"A nuvem faz as boas decisões escalarem. E as ruins também."

Naquela noite, Maya contou a Tom, Priya e Leo sobre a sessão com os investidores.

"Ele perguntou sobre as escolhas de banco de dados," disse ela. "Todas elas."

"Quanto isso custa por mês?" perguntou Tom imediatamente, o que era exatamente a pergunta errada e também a certa. "Ele perguntou sobre o modelo de custo?"

"Perguntou. Expliquei os Savings Plans, a mudança do DynamoDB para provisionado. Ele assentiu."

"E se alguém tentar invadir?" perguntou Priya. "As perguntas de segurança surgiram?"

"IAM, criptografia, GuardDuty. Sim. Ele pareceu satisfeito."

Leo havia ficado quieto. "Ele perguntou sobre as partes que não foram bem?"

"Ele perguntou o que eu faria diferente. Contei a ele sobre começar com infraestrutura como código, e ser mais conservadora com serviços gerenciados no início."

"O esquema do DynamoDB que redesenhamos duas vezes," disse Leo. "Sempre senti que aquilo estava por minha conta."

"Estava por conta de todos nós," disse Maya. "Esse é o ponto."

**Fechamento**

Você aprendeu muito. Os serviços AWS. As contrapartidas. Os padrões.

Agora faça algo com isso.

Construa algo. Cometa erros de propósito. Leia post-mortems (eles são públicos — AWS, Cloudflare, GitHub, Stripe todos os publicam). Trabalhe com equipes que são melhores do que você nas coisas em que você é mais fraco.

O exame SAA-C03 testará se você conhece o material. Sua carreira testará se você consegue aplicá-lo.

Ambos valem a pena fazer. Nenhum é o destino final.

Não há destino final neste campo. Há apenas o próximo problema, a próxima decisão e o hábito de fazer a próxima pergunta certa.

**As Lições Que Não Entraram no Slide Deck**

No trem de volta de Seattle, Maya contou a Leo e Priya sobre duas coisas que ela ficou feliz que o investidor não havia perguntado diretamente — porque as respostas honestas teriam levado vinte minutos cada.

**O incidente do pipeline de análise**.

Oito meses antes, o pipeline de análise havia sido acoplado ao serviço principal de processamento de pedidos. Os eventos de pedidos eram escritos na mesma fila SQS que o pipeline de análise consumia. O acoplamento havia parecido razoável: a análise precisava de dados de pedidos, o processamento de pedidos produzia dados de pedidos.

Em uma quarta-feira à noite, um bug na Lambda de agregação de análise fez com que ela parasse de consumir da fila. A profundidade da fila cresceu. Como o serviço de processamento de pedidos compartilhava a mesma fila SQS para suas mensagens de confirmação, tanto o pipeline de análise quanto o caminho de confirmação de pedidos estavam acumulando simultaneamente. Os parceiros restaurantes começaram a ver atrasos de confirmação. A fila SQS estava se aproximando de seu limite de retenção de mensagens.

"Eu já implantei a correção," Leo havia dito, às 23h daquela noite — e então parou. A correção para o bug de análise exigiria um redeploy da Lambda que limparia a fila, mas ele não havia verificado se as mensagens de confirmação de pedidos na fila ainda estavam dentro do seu visibility timeout. Se o timeout tivesse expirado, a Lambda as reprocessaria, e os parceiros restaurantes receberiam confirmações de pedidos duplicadas.

O incidente havia durado três horas e exigido dois rollbacks.

A lição arquitetural era simples: análise e processamento operacional nunca devem compartilhar a mesma fila. Eles têm características de desempenho diferentes, modos de falha diferentes e consequências diferentes quando falham. Acoplá-los significava que uma falha no caminho de menor prioridade poderia degradar o caminho de maior prioridade.

Após o incidente, a Nimbus separou os pipelines completamente. Os eventos de pedidos iam para uma fila operacional dedicada. Uma regra separada do EventBridge duplicava os eventos para uma fila exclusiva de análise. Os dois pipelines não tinham nenhuma infraestrutura compartilhada exceto a fonte de eventos. Na próxima vez que a Lambda de análise teve um bug — e teve, dois meses depois — ela falhou silenciosamente, a fila de análise acumulou, os relatórios da manhã saíram atrasados, e o caminho de confirmação de pedidos ficou completamente inafetado.

"Separação de preocupações," Priya havia dito, após o segundo bug da Lambda de análise. "Mesmo princípio no nível da infraestrutura que no nível do código. Duas coisas que falham de formas diferentes não devem compartilhar o mesmo domínio de falha."

**A abstração prematura.**

Três meses antes da Series A, Leo havia proposto construir um serviço genérico de configuração de restaurantes. A Nimbus tinha três tipos de configuração específica de restaurante na época: configurações de cardápio, parâmetros de zona de entrega e preferências de notificação. Um serviço de configuração genérico, Leo havia argumentado, permitiria que eles adicionassem novos tipos de configuração sem construir nova lógica de armazenamento e recuperação a cada vez.

A equipe o construiu. Duas semanas para projetar o modelo de dados. Uma semana para implementar o serviço. Mais uma semana para migrar os três tipos de configuração existentes para ele. Quatro semanas no total.

No momento em que terminaram de construir o serviço de configuração genérico, eles tinham... três tipos de configuração. Os mesmos três que tinham antes. O serviço genérico não adicionou nenhuma nova capacidade; apenas tornou a capacidade existente mais difícil de entender. O esquema chave-valor que tornava o serviço "genérico" também tornava impossível adicionar validação ou restrições de tipo sem construir um registro de esquemas em cima dele.

"Construímos um framework para uma biblioteca," disse Tom, quando contou a história do investidor a Leo.

"O que isso significa?" perguntou Leo.

"Tínhamos três livros. Construímos um sistema de gerenciamento de biblioteca para organizá-los. Teria sido melhor simplesmente colocar os três livros em uma prateleira."

O serviço de configuração havia sido silenciosamente descontinuado oito meses depois, quando a equipe cresceu o suficiente para que quatro engenheiros tivessem gasto um tempo não trivial aprendendo como ele funcionava antes de descobrir que era um wrapper fino em torno de uma tabela DynamoDB. Eles migraram de volta para acesso direto ao DynamoDB com esquemas tipados por tipo de configuração em dois dias.

"Quatro semanas construindo," disse Tom. "Dois dias desfazendo. Mais o custo contínuo de explicá-lo para cada novo engenheiro."

"Qual era a decisão certa?" perguntou Priya.

"Construir o serviço de configuração quando você tiver mais de dez tipos de configuração e o padrão estiver claramente estável," disse Tom. "Não quando você tem três e está especulando sobre necessidades futuras. A abstração foi prematura. As necessidades para as quais ela foi projetada não se materializaram."

"Já pensamos no que acontece se construirmos abstrações antes de entender o espaço do problema?" perguntou Priya.

"Acabamos de descrever," disse Tom. "Você gasta tempo mantendo uma abstração que custa mais do que o problema que estava resolvendo."

Maya adicionou isso ao seu modelo mental de antipadrões arquiteturais: o serviço genérico construído para três casos de uso. O pipeline acoplado. A decisão de dimensionamento tomada com uma janela de observação insuficiente. Cada uma era uma decisão que fazia sentido localmente, no momento, com a informação disponível. Cada uma se revelou errada de formas que só se tornaram visíveis depois.

"As que parecem bem no papel," disse ela a Priya, "são as que custam mais."

"Porque você não as revisita," disse Priya. "Você olha para o design, ele é coerente, a lógica se sustenta, e você segue em frente. O modo de falha é invisível até que o sistema esteja sob uma carga ou um estresse que a versão no papel nunca modelou."

"É por isso que a revisão de arquitetura importa," disse Maya. "Não porque o revisor sabe mais. Porque ele fará a pergunta que você não pensou em fazer."


## Resumo

A reunião com os investidores havia corrido bem. Não porque Maya havia memorizado a estrutura de preços de cada serviço, mas porque ela conseguia responder *por quê* para cada escolha que a Nimbus havia feito. As respostas "depende" que ela havia dado eram precisas, condicionais e fundamentadas nas mesmas quatro perguntas que ela vinha fazendo, em várias formas, por dois anos.

- **"Depende" é o começo da resposta**, não o fim. Complete sempre a frase com as condições das quais depende.
- As quatro perguntas por trás de cada contrapartida arquitetural: padrão de acesso, escala, consequência da falha, restrição de custo.
- Os padrões que perduram: separação de preocupações, defesa em profundidade, pague pelo que usa, otimize para a falha provável, meça antes de otimizar.
- **A nuvem amplifica as decisões** — as boas e as ruins. Uma má decisão on-premises custa uma semana; uma má decisão na nuvem se acumula mensalmente, em escala.
- A certificação SAA-C03 testa conhecimento e reconhecimento de padrões. A experiência de produção transforma esse conhecimento em julgamento.

## Dicas para o Exame

*Domínio SAA-C03: Domínio cruzado — todos os domínios*

Este capítulo fecha o conteúdo do exame deste livro. Antes de fazer o exame:

**Revise os serviços sobre os quais você tem menos confiança**:

- Para a maioria das pessoas: Kinesis vs SQS (a distinção stream vs fila)
- Rede VPC (tabelas de rotas, sub-redes, NAT Gateway, Internet Gateway)
- Lógica de avaliação de política IAM (negação explícita > permissão explícita > negação implícita)
- Seleção de classe de armazenamento (conheça todas as oito classes de armazenamento S3 e suas contrapartidas)
- RDS vs Aurora vs DynamoDB para casos de uso específicos

**Conheça a estrutura de cenário típica do exame**:

O SAA-C03 apresenta um requisito de negócios ("a empresa precisa de 99,99% de disponibilidade") e pede que você identifique a arquitetura que o atende. Sempre leia o requisito, identifique a restrição principal e elimine as opções que não a atendem.

**Pratique a identificação de distratores**:

Cada resposta errada no exame está errada por uma razão específica. Aprender a identificar *por que* cada resposta errada está errada é mais valioso do que memorizar respostas corretas.

**O exame recompensa o reconhecimento de padrões**:

- "Desacoplar" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Baixa latência global" → CloudFront, Global Accelerator, DynamoDB Global, Aurora Global
- "Conformidade/auditoria" → CloudTrail, Config, Security Hub, Macie
- "Otimização de custos" → Spot Instances, Savings Plans, políticas de ciclo de vida, dimensionamento correto

**Você está pronto**. Não porque este livro cobriu tudo — nada cobre. Mas porque você entende os princípios bem o suficiente para raciocinar até a resposta mesmo quando não reconhece imediatamente o cenário exato.

## Exercícios

**Exercício Final**

Não há mais perguntas estruturadas de exame após este capítulo.

Em vez disso: uma pergunta aberta.

Que sistema você construiria hoje, sabendo o que sabe?

Escreva. Esboce a arquitetura. Identifique os serviços. Anote as contrapartidas que você faria e por quê. Antecipe os modos de falha.

Depois construa-o.

Essa é a tarefa. Não há data de entrega. Não há nota. Há apenas o trabalho.

## Cena Pós-Créditos

O investimento veio.

Série A. US$ 4 milhões. O suficiente para expandir para cinco novas cidades, triplicar a equipe de engenharia e construir o Nimbus Instant.

Naquela noite, Maya estava no restaurante de sua família. O original. Onde a Nimbus começou, quando ela percebeu que estavam perdendo pedidos porque o telefone estava sempre ocupado.

Ela pediu arepa — o mesmo prato que sempre pedia.

Enquanto esperava, abriu o laptop e leu o primeiro capítulo deste livro.

*"Onde fica um site?"*

Ela se lembrou de não saber a resposta.

Ela sorriu.

Fechou o laptop.

A comida chegou.

Era perfeita.

No próximo capítulo: o que muda quando o trabalho não é mais construir o sistema — mas ser responsável por ele.
