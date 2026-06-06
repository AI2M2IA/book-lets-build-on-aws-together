# Capítulo 28: A Surpresa da Conta de Armazenamento

A planilha já tinha dezesseis abas a essa altura. Tom a mantinha aberta em uma segunda janela, do jeito que algumas pessoas mantêm uma lista de compras — sempre visível, sempre acumulando. Ele adicionou uma nova linha para EC2 (feito, Savings Plan comprometido) e moveu o cursor para a linha seguinte.

Armazenamento.

**Recapitulando: EC2 Resolvido, Falta Um Item da Conta**

O trabalho de preços de computação do Capítulo 27 havia travado a estratégia de EC2: um Compute Savings Plan de US$ 0,45/hora em um prazo de três anos, mais Spot para o lote noturno — uma economia estimada de US$ 42.500 ao longo do período. Esse trabalho estava feito, e bem feito. Mas era uma linha da conta. Tom havia aprendido, com seis meses de análise de custos com Athena, que a conta tinha muitas linhas — e que cada uma merecia o mesmo escrutínio. O S3 era o próximo: US$ 198/mês, já melhorado a partir de US$ 847 após as mudanças na política de ciclo de vida do Capítulo 23. O número que chamou sua atenção, porém, estava mais abaixo na página. EBS: US$ 440/mês.

"Isso parece alto," disse ele.

Leo puxou a lista de volumes EBS. Havia 47 volumes EBS vinculados a instâncias. E depois havia outros 23 volumes não vinculados a nenhuma instância.

"Esses 23 volumes," disse Tom. "O que são eles?"

**A Auditoria dos Volumes Órfãos**

Leo começou a percorrê-los um por um. Esse não era um processo rápido — os volumes não estavam rotulados de forma uniforme, as tags eram inconsistentes, e alguns haviam sido criados tanto tempo atrás que ninguém lembrava do contexto. Tom puxou uma cadeira e ficou observando.

Volume ebs-021a4c. Criado há 16 meses. Tag: "debug-prod-db-snapshot-restore." Tamanho: 200GB. Última vinculação: nunca, ou o histórico de vinculação havia sido expurgado.

"Esse eu lembro," disse Leo. "Tivemos um problema de consulta no banco de dados e restaurei um snapshot para verificar os dados. Verifiquei, não encontrei o problema ali, e esqueci de excluir o volume."

Volume ebs-07f38b. Criado há 11 meses. Tag: "load-test-temp." Tamanho: 400GB.

Leo ficou quieto por um momento. "Acho que esse foi o teste de carga que fizemos antes do pitch da Series Seed. Provisionamos instâncias extras com armazenamento extra para simular carga de pico e depois... acho que não excluí nenhum deles depois."

"Eu já tinha implantado — ah," disse ele. "O teste de carga era temporário. Os volumes não eram."

Volume ebs-0ab12c até ebs-0ab134. Oito volumes consecutivos, criados há 9 meses. Tag: "k8s-experiment." Tamanho: 100GB cada, 800GB no total.

"Foi a avaliação do Kubernetes," disse Priya, olhando por cima do ombro de Leo. "Passamos três semanas avaliando se migraríamos para ECS ou EKS. O EKS foi o segundo colocado. Desmontamos o cluster de experimento, mas aparentemente deixamos os volumes persistentes."

Tom estava somando em uma aba separada. Volume a volume, os números se acumulavam:

- Volumes de restauração de debug: 4 volumes × 200GB = 800GB
- Volumes de teste de carga: seis volumes entre 200 e 400GB — cerca de 1.200GB no total
- Volumes do experimento Kubernetes: 8 volumes × 100GB = 800GB
- Diversos sem tag: 5 volumes × tamanhos variados = ~700GB

Total: aproximadamente 3.500GB em 23 volumes não vinculados.

"Quanto isso custa por mês?" perguntou Tom. A resposta: gp3 a US$ 0,08/GB/mês. 3.500GB × US$ 0,08 = US$ 280/mês.

Ele verificou a data de criação mais antiga. Dezesseis meses. Pegou a calculadora.

"Estamos pagando por alguns desses há dezesseis meses," disse ele. "Alguns há nove. Em média, provavelmente dez meses considerando todos eles." 23 volumes, média de US$ 12/mês cada, média de 10 meses. Isso dava aproximadamente US$ 2.760. Some os volumes maiores e a conta chegava a cerca de US$ 3.200 de desperdício total.

"Três mil e duzentos dólares," disse Tom. "De volumes que ninguém estava usando."

"E ninguém percebeu porque a cobrança está espalhada por dezenas de itens da conta," disse Leo. "Não é uma cobrança de US$ 3.200. São 23 cobranças de US$ 12 ou US$ 50 ou US$ 80 por mês, cada uma individualmente pequena o suficiente para não disparar nenhum alarme."

Tom excluiu todos os 23 volumes não vinculados. Confirmou com Leo e Priya que nenhum deles tinha dados de que precisavam — o volume de debug eram dados obsoletos de um banco de dados que já havia sido migrado, os dados de teste de carga eram irrelevantes, os volumes do experimento Kubernetes estavam vazios. A exclusão levou quinze minutos. No mês seguinte, a conta do EBS caiu de US$ 440 para US$ 160.

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya, quando Tom a guiou pela descoberta. "Por que excluir o volume não é o padrão quando você encerra uma instância?"

"Depende do volume," disse Tom. "O volume **raiz** é excluído por padrão — o `DeleteOnTermination` é true para ele. Mas quaisquer volumes de dados **adicionais** que você vincula têm como padrão serem preservados. A suposição é que você pode precisar dos dados que estavam neles. Esses 23 órfãos eram todos volumes de dados — vinculados para uma sessão de debug ou um teste de carga, e depois deixados para trás quando a instância foi encerrada."

"Então o padrão te protege da perda acidental de dados em volumes de dados."

"E te custa dinheiro se você não estiver prestando atenção. De agora em diante: quaisquer volumes de dados adicionais são explicitamente excluídos quando a instância é encerrada — ou recebem o `DeleteOnTermination` definido no momento da vinculação — a menos que alguém apresente um caso documentado de por que precisa mantê-los."

"Já pensamos no que acontece se alguém esquecer de documentar esse caso?" perguntou Priya. "Poderíamos excluir algo importante."

"Esse é o trade-off," disse Tom. "Agora o trade-off está na outra direção — estamos assumindo que tudo deve ser mantido e pagando por isso quando não é o caso. A disciplina de documentar 'mantenha este volume' é menos arriscada do que o padrão atual de 'mantenha tudo silenciosamente.'"

**A Auditoria de Custo de Armazenamento**

A descoberta de EBS de Tom era um sintoma de um padrão mais amplo: os custos de armazenamento se acumulam de forma invisível. Ao contrário da computação (você nota quando 47 servidores estão rodando), o armazenamento se acumula silenciosamente.

Pense nisso como alugar um depósito. Alugar uma unidade é óbvio no extrato do cartão de crédito. Mas se você aluga uma segunda unidade para um projeto, depois uma terceira para alguns móveis velhos, e nunca volta para verificar o que está dentro — as cobranças continuam aparecendo todo mês, silenciosamente, muito depois de você ter esquecido o que está armazenando. O armazenamento em nuvem funciona da mesma forma: os bytes ficam lá, a fatura chega, e ninguém questiona até que alguém finalmente abra a porta e encontre tudo cheio de coisas que ninguém mais precisa.

Uma auditoria completa de custo de armazenamento analisa:

**S3**:

- Existem políticas de ciclo de vida para todos os buckets?
- Existem snapshots antigos (RDS, EBS) no S3?
- O Intelligent-Tiering é adequado para algum bucket com padrões de acesso incertos?
- Existem objetos versionados criando múltiplas cópias que nunca são acessadas?
- Existem uploads multipart incompletos se acumulando silenciosamente?

**EBS**:

- Algum volume está desvinculado (nenhuma instância em execução o está usando)?
- Os volumes gp3 estão configurados corretamente? (Os volumes gp3 padrão podem ter throughput/IOPS provisionados em excesso que não são necessários)
- Snapshots mais antigos do que o necessário estão sendo retidos?

**RDS**:

- Os períodos de retenção de backup automatizado estão definidos de forma adequada? (Mais longo = maior custo de armazenamento)
- Snapshots manuais de instâncias antigas ainda estão por aí?
- Réplicas de leitura de migrações de banco de dados ainda estão rodando?

**EFS**:

- O volume EFS está na classe de armazenamento correta? (Standard vs Infrequent Access)

**Versionamento S3: O Custo Oculto**

No Capítulo 5, mencionamos que o versionamento S3 mantém cada versão anterior de um objeto. Isso é excelente para segurança. É terrível para custos se você não tiver também regras de ciclo de vida para as versões.

Quando o versionamento está habilitado em um bucket, toda vez que você sobrescreve um objeto, a versão antiga é retida. Com o tempo:

- Dia 1: Imagem enviada (v1)
- Dia 30: Imagem atualizada (v1 é agora uma versão "não atual", v2 é atual)
- Dia 60: Imagem atualizada novamente (v1 e v2 são não atuais, v3 é atual)
- Dia 365: v1, v2... v12 estão todas armazenadas. Você está pagando por 12 cópias de uma imagem.

Você pode estar se perguntando por que o versionamento não limpa automaticamente as versões antigas. A resposta é intencional — a AWS não quer excluir seus dados automaticamente. Mas a consequência é que cada versão se acumula até que você diga ao S3 explicitamente por quanto tempo mantê-las. A solução: regras de ciclo de vida para versões não atuais.

```
Expirar versões não atuais após 30 dias
Excluir uploads multipart com falha após 7 dias
```

Tom aplicou essas regras a todos os buckets com versionamento. No mês seguinte, o armazenamento S3 diminuiu 18%.

**Uploads Multipart Incompletos: A Acumulação Invisível**

Há um custo de S3 mais sutil que a maioria dos engenheiros perde completamente: uploads multipart incompletos.

Quando o S3 faz upload de um arquivo grande, ele o divide em partes e envia cada uma separadamente. Esse é o mecanismo de upload multipart — mais confiável do que um único PUT grande para arquivos acima de algumas centenas de megabytes. Mas se um upload começa e então falha no meio do caminho — uma interrupção de rede, uma queda do cliente, um bug na aplicação — as partes já enviadas permanecem no S3. Elas não são visíveis como objetos no seu bucket. Não aparecem em nenhuma listagem. Mas estão armazenadas, e você é cobrado por elas a taxas padrão do S3.

Tom descobriu isso ao habilitar o dashboard do S3 Storage Lens no console do S3 e ordenar por "uploads multipart incompletos." A Nimbus tinha 340GB de dados de upload multipart incompleto sentados silenciosamente em buckets de quatro contas AWS, alguns deles com mais de um ano.

"Quanto isso custa por mês?" perguntou Tom. US$ 0,023/GB/mês × 340GB = US$ 7,82/mês. Pequeno individualmente. Mas vinha se acumulando por um ano sem que ninguém percebesse.

A solução: adicionar uma regra de ciclo de vida a cada bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Após sete dias, qualquer upload multipart incompleto é limpo automaticamente. Isso roda indefinidamente sem nenhuma atenção contínua.

"Se tudo aquilo estivesse parado lá por um ano inteiro — digamos US$ 94 que gastamos com uploads que falharam," disse Leo.

"Com uploads que falharam," confirmou Tom. "Nem mesmo com armazenamento bem-sucedido. Esta é a definição de desperdício de infraestrutura."

**EBS: Dimensionamento Correto e a Atualização para gp3**

O preço do volume EBS tem dois componentes:

1. Armazenamento (por GB por mês)
2. IOPS provisionados e throughput (se você estiver em io1/io2 ou pagando por desempenho extra gp3)

**A oportunidade gp3**: No Capítulo 6, observamos que o gp3 é o padrão atual e é mais barato do que o gp2. Se a Nimbus tivesse volumes criados antes de o gp3 estar disponível (lançado em dezembro de 2020), eles poderiam ainda ser gp2.

A migração é direta: modifique o tipo de volume de gp2 para gp3 no console AWS ou via CLI. Nenhum downtime necessário. O volume permanece disponível durante a conversão. As características de desempenho são iguais ou melhores — o gp3 fornece 3.000 IOPS e 125 MB/s de throughput de base, comparado ao modelo burstable do gp2 que podia ser inconsistente para volumes menores.

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya. "Se o gp3 é mais barato e pelo menos tão bom quanto o gp2, por que a AWS simplesmente não migrou todo mundo automaticamente?"

"Porque a AWS não faz mudanças unilaterais na infraestrutura do cliente," disse Tom. "Mesmo as benéficas. A modificação poderia teoricamente ter efeitos colaterais para alguma carga de trabalho. O cliente tem que iniciá-la. É por isso que milhares de equipes ainda estão pagando preços de gp2 anos depois do lançamento do gp3, simplesmente porque ninguém foi procurar."

Tom decidiu fazer a migração gp3 numa manhã de sábado — a mesma disciplina matinal que havia aplicado à análise de preços do EC2. Tempo tranquilo. Sem dailies. Apenas o console AWS e um plano.

Ele havia identificado 8 volumes no ambiente de produção que ainda eram gp2: os quatro volumes raiz dos servidores de API, dois volumes vinculados a processadores em segundo plano, e dois volumes de dados legados que haviam sido criados antes de a migração gp3 ter se tornado prática padrão para novas implantações. Juntos, totalizavam 960 GB.

O processo de migração era uma única chamada de API por volume:

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Os parâmetros `--iops 3000` e `--throughput 125` correspondiam aos padrões de base do gp3. Para o gp2, Tom havia verificado primeiro as métricas do CloudWatch: o IOPS médio em cada volume ficava entre 200 e 800. Nenhum deles precisava de mais do que a base de 3.000 IOPS que o gp3 fornecia gratuitamente. O throughput estava igualmente confortável — bem dentro do padrão de 125 MB/s.

"E se um volume precisar de mais IOPS depois que trocarmos?" perguntou Maya, quando Tom explicou o plano de migração.

"Podemos aumentar os IOPS provisionados em um volume gp3 a qualquer momento," disse Tom. "A migração não trava nada. Se formos para gp3 com 3.000 IOPS e descobrirmos que é insuficiente, modificamos o volume de novo para adicionar mais. A modificação é ao vivo — sem downtime, sem desmontar."

"E o gp2 não pode ser modificado no lugar?"

"O gp2 pode ser modificado para gp3 no lugar. O que você não pode fazer é voltar de gp3 para gp2 — pelo menos, não facilmente, e não há razão para isso."

A migração de fato levou 73 minutos do primeiro comando até a conclusão em todos os 8 volumes. A AWS modificou cada volume enquanto ele estava montado e em uso. Os servidores de API continuaram recebendo tráfego o tempo todo. O CloudWatch não mostrou picos na latência de I/O durante a conversão — a transição foi completamente transparente para a aplicação em execução.

"É assim que 'nenhum downtime necessário' realmente se parece," disse Leo, olhando para as métricas de antes e depois que Tom havia capturado. "Eu achava que 'sem downtime' significava 'reinício breve.' Significa literalmente que nada muda da perspectiva da aplicação."

A economia: gp2 era US$ 0,10/GB/mês; gp3 era US$ 0,08/GB/mês. Em 960 GB: US$ 96/mês vs US$ 76,80/mês. Economia mensal: US$ 19,20. Não transformador por si só, mas a disciplina que representava, sim. Qualquer novo volume criado dali em diante usava gp3 por padrão. A regra organizacional que Tom escreveu naquela manhã: nada de volumes gp2. Qualquer engenheiro criando um volume EBS deve usar gp3 a menos que haja uma razão específica e documentada em contrário.

**IOPS e throughput**: Os volumes gp3 vêm com 3.000 IOPS e 125 MB/s de throughput por padrão, sem custo extra. Você pode provisionar mais se a sua carga de trabalho precisar. Revise se o desempenho provisionado está sendo realmente utilizado.

Na mesma auditoria, Tom encontrou dois volumes com 10.000 IOPS provisionados — uma configuração legada de antes de ele ter entrado, dimensionada para um banco de dados que já havia migrado para o Aurora. Ele verificou as métricas do CloudWatch: o IOPS médio real era de 1.200. Reduziu os IOPS provisionados para 4.000 (uma margem de segurança acima do pico real).

Economia mensal: US$ 68 em custos de IOPS provisionados que vinham pagando por uma folga de desempenho que ninguém estava usando.

**Ciclo de vida de snapshots**: Os snapshots EBS são incrementais (cada snapshot armazena apenas as alterações desde o anterior), mas se acumulam. Snapshots antigos dos primeiros dias da Nimbus ainda existiam. Tom manteve 30 dias de snapshots diários e excluiu o restante.

**EFS: Classes de Armazenamento e a Decisão do Intelligent-Tiering**

O Amazon EFS tem suas próprias classes de armazenamento:

- **EFS Standard**: Para arquivos acessados com frequência. Maior custo.
- **EFS Infrequent Access (IA)**: Para arquivos não acessados por 30 dias. 92% mais barato do que o Standard.
- **EFS Archive**: Para arquivos não acessados por 90 dias. Ainda mais barato do que o IA.

**EFS Intelligent-Tiering**: Move automaticamente os arquivos entre classes de armazenamento com base nos padrões de acesso.

Tom habilitou o Intelligent-Tiering no volume EFS. Seis semanas depois, 68% dos arquivos haviam migrado para o Infrequent Access. O custo mensal do EFS caiu de US$ 89 para US$ 31.

Mas a escolha entre Intelligent-Tiering e uma regra de ciclo de vida manual não era trivial. Tom havia considerado isso.

"Espera — mas *por que* faríamos Intelligent-Tiering em vez de simplesmente definir uma regra de ciclo de vida manual?" perguntou Maya. "Se sabemos que arquivos com mais de 30 dias não estão sendo acessados, por que não definir a regra e pronto?"

"O Intelligent-Tiering lida com arquivos que voltam," disse Tom. "Se eu definir uma regra de ciclo de vida para mover arquivos para IA após 30 dias, e então alguém acessar um arquivo que está no IA há seis meses, ele permanece no IA. Com o Intelligent-Tiering, se o acesso for retomado, o arquivo move automaticamente de volta para o Standard. É bidirecional."

"Quando você preferiria a regra de ciclo de vida, então?"

"Quando você tem certeza de que o padrão de acesso é unidirecional. Logs de arquivamento — eles são escritos, envelhecem, são acessados uma vez para uma auditoria de conformidade e depois nunca mais. Para esse padrão, uma regra de ciclo de vida que move para Archive após 90 dias é mais barata do que o Intelligent-Tiering porque você não está pagando a sobrecarga de monitoramento."

"Há uma taxa de monitoramento?"

"Para o S3 Intelligent-Tiering, sim, e foi por isso que cobrimos a economia de objetos pequenos lá no capítulo de ciclo de vida do S3. Para o EFS, a decisão é principalmente sobre padrão de acesso: se os arquivos podem ficar quentes de novo, o Intelligent-Tiering é mais seguro. Se eles só envelhecem em uma direção, uma regra de ciclo de vida para Archive é mais barata e mais simples."

**Tags de Alocação de Custo S3: Descobrindo Quem Está Gastando o Quê**

À medida que a Nimbus crescia, múltiplas equipes armazenavam dados no S3. A equipe de análise tinha seus próprios buckets. A equipe de engenharia tinha seus buckets. A equipe de dados de restaurantes tinha seus buckets.

A conta mostrava apenas "S3: US$ 198." Não havia detalhamento por equipe.

As **tags de alocação de custo** permitem marcar recursos AWS com metadados de negócios (equipe, projeto, ambiente) e depois ver os custos detalhados por essas tags no AWS Cost Explorer.

Tom adicionou tags a todos os buckets S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Após um ciclo de faturamento com tagging, ele podia ver: "O data lake da equipe de análise custa US$ 74/mês. Os backups de engenharia custam US$ 43/mês. Os dados de restaurantes custam US$ 81/mês."

Agora ele podia ter conversas de orçamento com cada equipe em vez de apenas olhar para um número agregado.

**AWS Cost Explorer e AWS Budgets**

**AWS Cost Explorer**: Visualiza custos históricos e previstos por serviço, região, tag e tipo de uso. Essencial para entender para onde vai o dinheiro.

**AWS Budgets**: Define alertas quando os custos excedem (ou prevê-se que excedam) um limite. Você pode orçar por serviço, região, tag ou conta.

Tom configurou três orçamentos:

1. Conta total mensal: Alerta a 90% do valor orçado
2. EC2 On-Demand: Alerta se o gasto On-Demand exceder US$ 500/mês (sinaliza uma lacuna no Savings Plan)
3. Transferência de dados para fora: Alerta a US$ 200/mês (os custos de transferência de dados podem aumentar inesperadamente)

Os Budgets enviavam alertas para um canal do Slack. A equipe via quando estava se aproximando dos limites, em vez de descobrir na fatura mensal.

**O Recibo Com Cada Linha: Cost and Usage Reports**

O Cost Explorer respondia à maioria das perguntas de Tom. Então ele esbarrou em uma que ele não conseguia responder: "exatamente quais buckets S3, hora a hora, impulsionaram o pico da última terça-feira — e sob quais tags?"

Para perguntas de nível forense, a AWS fornece o **Cost and Usage Report (CUR)** — agora entregue por meio dos **Data Exports** — os dados de faturamento mais detalhados que a AWS produz: cada item da conta, **por recurso, por hora**, com tags, entregue a um bucket S3 que você possui. Não é um dashboard; é o livro-razão bruto. O padrão habitual é consultá-lo com o Athena (ele chega em formato colunar) ou alimentá-lo no QuickSight para dashboards.

A divisão de trabalho no exame: **Cost Explorer** = visualização interativa e previsões no console. **Budgets** = alertas sobre limites. **CUR/Data Exports** = os dados mais granulares, entregues ao S3, para sua própria análise. Quando uma pergunta diz "dados de custo de nível de recurso, por hora, para análise customizada" — esse é o CUR, não o Cost Explorer.

"Já pensamos no que acontece se simplesmente nunca olharmos para isso?" perguntou Priya. "Encontramos US$ 6.700 em dois dias. O que ainda está escondido?"

"Auditorias regulares," ela continuou. "Revisões mensais do Cost Explorer. O AWS Trusted Advisor sinaliza volumes desvinculados e recursos ociosos automaticamente. Automatize a limpeza de padrões conhecidos de desperdício: exclua snapshots mais antigos do que N dias, alerte sobre volumes EBS desvinculados, expire versões S3 antigas."

**S3 Requester-Pays: Transferindo o Custo de Transferência**

Durante a auditoria de armazenamento, Tom encontrou uma situação que não havia antecipado.

Os parceiros restaurantes da Nimbus precisavam baixar os ativos de fotos de seus cardápios — as imagens processadas e redimensionadas que a plataforma de pedidos servia aos clientes. Para um restaurante atualizando seu cardápio, isso significava baixar de 50 MB (uma pequena atualização) a 800 MB (uma renovação sazonal completa) de arquivos de imagem. Atualmente, a Nimbus estava pagando o custo de transferência de dados de saída em cada download: US$ 0,09/GB do S3 para a localização do parceiro.

Com 287 parceiros restaurantes, com uma média de uma renovação de cardápio por mês e um download médio de 200 MB, a conta era: 287 × 0,2GB × US$ 0,09 = US$ 5,17/mês. Não significativo na escala atual.

"O que acontece com 2.000 restaurantes?" perguntou Tom.

"Mesma conta," disse Maya. "Cerca de US$ 36/mês."

"E com 10.000 restaurantes, e os parceiros baixando grandes pacotes de ativos sazonais — digamos, 2 GB para atualizações de cardápio de feriado?"

Ele fez a conta. 10.000 × 2GB × US$ 0,09 = US$ 1.800/mês em transferência de dados, só para parceiros baixando ativos de que precisavam.

"Esse é um número real," disse Priya.

"Já pensamos no que acontece se essa conta aparecer no mesmo mês em que estamos tentando fechar uma Series B?" continuou Priya.

"S3 Requester-Pays," disse Tom.

O S3 tem um recurso chamado Requester-Pays: quando habilitado em um bucket, a entidade que faz a requisição — não o proprietário do bucket — paga os custos de transferência de dados e de requisição. O proprietário do bucket ainda paga pelo armazenamento. Mas cada download do bucket é cobrado da conta AWS do requisitante.

O trade-off é o acesso. O Requester-Pays exige que os requisitantes sejam clientes AWS com uma conta válida — acesso não autenticado ou anônimo a um bucket Requester-Pays retorna um erro. Para os parceiros restaurantes da Nimbus, que eram negócios com níveis variados de sofisticação técnica, exigir que tivessem uma conta AWS para baixar seus próprios ativos de cardápio não era um modelo viável.

"Não podemos fazer Requester-Pays para acesso direto de parceiros," disse Maya. "A maioria dos nossos parceiros não vai configurar uma conta AWS para baixar fotos."

"Correto," disse Tom. "Mas podemos usá-lo para as integrações B2B — as redes maiores que têm equipes técnicas e contas AWS. Não o restaurantezinho da esquina, mas a rede de hambúrgueres de 50 unidades que tem uma equipe de engenharia e integra diretamente com nossa API. Para esse segmento, o Requester-Pays faz sentido."

"E para o resto?"

"Damos a eles um portal de download que usa URLs S3 pré-assinadas. A transferência ainda passa pela AWS, o custo ainda é nosso — mas também já está incluído no preço cobrado dos parceiros. A opção Requester-Pays é algo que incorporaríamos nas negociações de contrato para parceiros maiores, não algo que implantamos hoje."

Tom adicionou isso à planilha sob "otimizações futuras": S3 Requester-Pays para parceiros enterprise com contas AWS. Com 2.000 restaurantes, 20% de clientes enterprise, com downloads mensais de 2 GB: US$ 72/mês potencialmente transferidos para os parceiros. Pequeno nessa escala, mas o mesmo padrão se torna significativo conforme os pacotes de ativos crescem. Revisar quando a contagem de parceiros exceder 1.000 ou quando os parceiros enterprise começarem a puxar pacotes sazonais maiores.

"A lição é a mesma de sempre," disse Tom. "Saiba no que o custo se transforma em escala antes de estar em escala. O problema de US$ 5 de hoje é o problema de US$ 1.800 daqui a três anos. Projetar para isso agora não custa nada."

**Governança: Auto-Exclusão vs Apenas-Alerta**

A questão da automação foi a que gerou mais desacordo.

"Devemos auto-excluir volumes EBS desvinculados após 14 dias?" perguntou Tom. "Regras do AWS Config podem sinalizá-los. O Lambda pode excluí-los automaticamente."

"Não," disse Priya imediatamente.

"Por que não?"

"Porque a auto-exclusão significa que vamos eventualmente excluir algo que estava desvinculado por uma razão. Talvez alguém tenha desvinculado um volume para movê-lo para uma instância diferente, e ele está parado há 12 dias enquanto uma mudança é revisada. Auto-excluir no dia 14 destrói esses dados."

"Então apenas-alerta?" disse Tom. "Recebemos uma notificação mas não excluímos automaticamente."

"Alerte primeiro," disse Priya. "Force um humano a tomar a decisão. O alerta é: 'Este volume está desvinculado há 14 dias. Marque-o como `keep: true` se você precisar dele, ou ele será sinalizado para exclusão na próxima revisão.' A decisão humana é então documentada pela presença ou ausência da tag."

"Isso é mais lento," disse Leo.

"É mais lento e menos provável de destruir dados," disse Priya. "Já perdemos US$ 3.200 por negligência. Não perdemos nenhum dado por automação. Eu sei qual dos dois prefiro manter."

Tom chegou a um híbrido: auto-alerta aos 7 dias, exigir uma tag `keep: true` para suprimir alertas futuros, e rodar um relatório semanal de todos os volumes sem-tag-e-desvinculados para a equipe revisar em conjunto. Sem auto-exclusão.

**Variação: Quando a Limpeza Custa Mais do que Economiza**

Se você precisa da segurança de snapshots extras, mantenha-os — mas todo snapshot com mais de 90 dias sem acesso deve justificar seu lugar. O trade-off é assimétrico: excluir um snapshot de que você precisava custa um incidente; manter um snapshot de que você não precisava custa apenas uma pequena taxa mensal. Para dados sensíveis a conformidade, o custo de manter snapshots antigos é real mas geralmente menor do que o custo de não tê-los quando um auditor pergunta. Para snapshots de desenvolvimento de um teste que rodou há 14 meses, o cálculo vai na direção oposta.

Se você habilita o EFS Intelligent-Tiering para arquivos com padrões de acesso incertos, a transição automática economiza dinheiro e não requer intervenção contínua. Se os arquivos previsivelmente envelhecem em direção ao acesso de arquivamento, uma regra de ciclo de vida direta é mais simples. Meça antes de habilitar.

Conexão SAA-C03: O exame testa se você consegue escolher entre as classes de armazenamento S3 (Standard, IA, Glacier) dado um cenário de frequência de acesso. A mesma lógica se aplica aqui — a classe certa depende de quão frequentemente os dados são acessados.

**O Custo do Descuido**

Tom criou uma planilha. Calculou quanto a Nimbus havia gasto em:

- Volumes EBS desvinculados (16 meses): US$ 3.200
- Snapshots S3 antigos (descobertos e excluídos): US$ 890
- IOPS provisionados desnecessários: US$ 816
- Economia da migração gp2 para gp3 (projetada, se feita antes): US$ 346 ao longo de 18 meses
- Versões S3 não atuais acumulando: US$ 1.340
- Uploads multipart incompletos: US$ 94

Total de desperdício identificado: aproximadamente US$ 6.700 ao longo de 18 meses.

"Seis mil e setecentos dólares," disse Maya.

"De descuido," disse Tom. "Não de tomar decisões arquitetônicas erradas. De não limpar."

"Qual é a solução sistemática?"

"E," acrescentou Tom, "torne a higiene de custos parte do processo de implantação. Quando um engenheiro encerra uma instância EC2, o volume EBS é excluído automaticamente, a menos que ele explicitamente opte por não fazer isso."

## Pontos Fortes e Limitações

**Disciplina de otimização de custos**:

- Revisões regulares capturam desperdícios acumulados antes de se tornarem significativos
- O tagging permite responsabilidade — as equipes veem seus próprios custos
- Os alertas automatizados evitam surpresas na fatura
- As políticas de ciclo de vida e o dimensionamento correto geralmente são economias que você configura uma vez e esquece

**Onde fica complicado**:

- Identificar desperdício em uma conta grande com muitas equipes requer ferramentas centralizadas
- Algum desperdício é intencional (manter snapshots extras "por precaução") — a troca custo/risco é uma decisão de julgamento
- A migração gp3 requer validação cuidadosa (os padrões de IOPS e throughput podem diferir do comportamento gp2 em alguns casos extremos)
- As tags de alocação de custo requerem disciplina em todas as equipes — um tagging inconsistente torna os dados incompletos
- A automação de auto-exclusão é perigosa para armazenamento — alertar-e-revisar é mais seguro para volumes e snapshots

## Resumo

A auditoria de armazenamento havia levado dois dias. O desperdício que revelou — US$ 6.700 ao longo de 18 meses de acumulação invisível — foi menos uma falha de tomada de decisão do que uma falha de atenção. Nada havia sido configurado errado de propósito. Os snapshots, os volumes desvinculados, o histórico de versões acumulando, os uploads multipart incompletos: cada um fazia sentido na época e simplesmente nunca foi revisitado. A lição não era sobre serviços AWS específicos. Era sobre construir o hábito de olhar.

- **Os custos de armazenamento se acumulam de forma invisível** — auditorias regulares são essenciais.
- **Volumes EBS desvinculados** são uma fonte comum de desperdício. Exclua-os (ou automatize a exclusão quando as instâncias forem encerradas).
- **Dimensionamento correto EBS**: Migre gp2 para gp3 (tipicamente 20% de economia). Remova IOPS provisionados em excesso.
- **Versionamento S3**: Habilite regras de ciclo de vida para versões não atuais para evitar pagar por um histórico ilimitado de versões.
- **Uploads multipart incompletos**: Adicione uma regra de ciclo de vida `AbortIncompleteMultipartUpload` a cada bucket. Isso é frequentemente esquecido e se acumula silenciosamente.
- **EFS Intelligent-Tiering**: Move automaticamente os arquivos para camadas de menor custo com base na frequência de acesso. Para padrões de acesso previsíveis, regras de ciclo de vida manuais podem ser mais baratas.
- **Governança**: Alerte sobre volumes desvinculados após 7-14 dias; exija tagging explícito para suprimir. Evite auto-exclusão para recursos de armazenamento.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.1)*

- **Tags de alocação de custo**: Habilite as tags definidas pelo usuário para alocação de custo no console de faturamento; depois marque os recursos. O Cost Explorer mostra detalhamentos por tag. Cenário do exame: "identificar qual departamento está gerando a maioria dos custos do S3" → tags de alocação de custo.
- **AWS Trusted Advisor**: Identifica instâncias EC2 subutilizadas, volumes EBS desvinculados, balanceadores de carga ociosos e outros desperdícios. Verificações básicas gratuitas; verificações completas requerem suporte Business/Enterprise.
- **Componentes de custo EBS**: Armazenamento (por GB), IOPS provisionados (se io1/io2 ou gp3 extra), throughput (se gp3 extra). Saiba quais componentes podem ter o dimensionamento correto.
- **Custos de versionamento S3**: Versões não atuais são armazenadas e cobradas à mesma taxa que as versões atuais. Regras de ciclo de vida que expiram versões não atuais são críticas para o controle de custos em buckets com versionamento.
- **AWS Compute Optimizer**: Analisa a utilização do EC2 e recomenda tipos de instância de tamanho correto. Sinal do exame: "reduzir os custos do EC2 selecionando o tipo de instância correto" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Usa ML para detectar padrões de gasto incomuns. Sinal do exame: "detectar automaticamente aumentos de custo inesperados" → Cost Anomaly Detection.
- **Lista de ferramentas de custo**: gráficos/previsões interativos → Cost Explorer. Alertas de limite → Budgets. "Dados de faturamento mais granulares, de nível de recurso/por hora, entregues ao S3 para análise customizada (Athena/QuickSight)" → **Cost and Usage Report (Data Exports)**.
- **Requester Pays**: "compartilhar um grande conjunto de dados S3; os consumidores pagam seus próprios custos de download" → S3 Requester Pays (o proprietário continua pagando apenas o armazenamento; os requisitantes devem se autenticar com uma conta AWS).

## Exercícios

**Exercício 1 — Recordação**

Explique por que volumes EBS desvinculados geram custos mesmo que nenhuma instância EC2 esteja usando-os. Que processo devem os engenheiros seguir ao encerrar uma instância EC2 para evitar esse desperdício?

*(Dica: Os volumes EBS armazenam dados em disco físico, e esse disco custa dinheiro independentemente de estar sendo lido.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: A conta AWS de uma empresa cresceu de US$ 5.000 para US$ 9.000/mês ao longo de seis meses, mas eles não adicionaram novos serviços. A equipe de engenharia suspeita que os custos de armazenamento são o problema. Qual combinação de ferramentas AWS MELHOR identificaria e explicaria o aumento de custo?

A) AWS CloudTrail para revisar as chamadas de API e identificar quem criou novos recursos  
B) AWS Cost Explorer para detalhamento de custo por serviço, e AWS Trusted Advisor para detecção de recursos ociosos e desvinculados  
C) Amazon CloudWatch para monitorar a utilização de recursos e criar alarmes de custo  
D) AWS Config para identificar todos os recursos e seu status de conformidade

**Dica 1**: "Identificar o aumento de custo" → visualizar o detalhamento de custo por serviço.

**Dica 2**: "Recursos ociosos e desvinculados" → uma ferramenta específica identifica isso proativamente.

**Dica 3**: O CloudTrail registra chamadas de API; o Cost Explorer mostra tendências de custo. Qual é mais útil para análise de custo?

**Resposta**: B

**Explicação**: O AWS Cost Explorer mostra tendências de custo detalhadas por serviço, região e tipo de uso — perfeito para identificar qual serviço gerou o aumento. As verificações de otimização de custos do AWS Trusted Advisor identificam volumes EBS desvinculados, instâncias EC2 ociosas, balanceadores de carga subutilizados e outras fontes comuns de desperdício.

**Por que não A?** O CloudTrail registra quem criou recursos e quando, mas não mostra diretamente tendências de custo ou identifica desperdícios.

**Por que não C?** O CloudWatch monitora o desempenho dos recursos (CPU, memória) — útil para dimensionamento correto, mas não para identificar desperdícios de armazenamento acumulados.

**Por que não D?** O AWS Config rastreia configurações de recursos e conformidade, mas não é uma ferramenta de análise de custos.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A conta S3 da Nimbus mostra US$ 340/mês para um bucket chamado "backups." O bucket tem versionamento habilitado e contém:

- Snapshots de banco de dados diários (7 dias é suficiente para a política deles)
- Backups completos semanais (mantidos por 3 meses)
- Arquivos trimestrais (mantidos por 7 anos para conformidade fiscal)

Projete uma política de ciclo de vida para este bucket que minimize o custo enquanto atende a esses requisitos de retenção. Qual classe de armazenamento cada tipo de dado deve usar? Como você lidaria com o versionamento para evitar que versões antigas se acumulem?

*(Não há uma única resposta correta. O objetivo é praticar o design de política de ciclo de vida.)*

## Cena Pós-Créditos

Tom publicou as descobertas da auditoria de custos para a equipe.

Desperdício identificado: US$ 6.700 ao longo de 18 meses.
Economia anual esperada com as mudanças implementadas: US$ 6.200.

Depois ele adicionou uma linha no final: "Isso não inclui a economia com Savings Plans (US$ 14.200/ano) ou políticas de ciclo de vida S3 (US$ 7.800/ano). Impacto total anual da otimização: aproximadamente US$ 28.200."

Maya leu duas vezes.

"Isso é quase o salário de um engenheiro júnior," disse ela.

"Em desperdício," confirmou Tom.

"Ou," disse Leo, "é a prova de que fazer essas otimizações mais cedo teria financiado esse engenheiro júnior."

Tom olhou para ele.

"É a forma certa de pensar sobre isso," disse ele. "A otimização de custos não é sobre cortar. É sobre não pagar por coisas que não criam valor."

Maya fixou o documento na wiki da empresa.

No próximo capítulo: a camada de banco de dados recebe o mesmo tratamento, e Tom descobre o único lugar em que estava genuinamente investindo de menos.
