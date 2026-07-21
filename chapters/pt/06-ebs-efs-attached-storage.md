# Capítulo 6: O Disco Que Te Acompanha

Tom tinha uma caneta vermelha e um hábito que deixava Leo nervoso.

Toda manhã de sábado, ele se sentava com um café e imprimia algo. Não e-mail. Não relatórios. Ele imprimia a lista do que a Nimbus estava rodando e a lia como um livro-caixa, linha por linha, caneta na mão. Ele vinha fazendo isso desde a segunda semana. O som da impressora esquentando tinha virado parte do fim de semana.

Leo chamava isso de "a coisa que o Tom faz que faz o Leo sentir que fez algo errado".

Naquele sábado, Tom circulou algo e deixou a impressão na mesa de Maya sem uma palavra.

Ela a encontrou na segunda de manhã. Um círculo. Uma nota na margem, três palavras:

*Tudo. Uma máquina.*

As fotos estavam seguras no S3 agora — aquele problema estava resolvido. Mas o banco de dados ainda estava na mesma instância EC2 que o servidor web. Histórico de pedidos, registros de clientes, dois meses de transações. A aplicação e tudo por baixo dela, compartilhando um único disco virtual.

"O que acontece com o banco de dados se a instância cair?" perguntou Maya, a impressão na mão.

"Ele cai também," disse Leo.

"E os dados?"

"Depende de como o banco de dados os armazena."

Esse "depende" era o problema.

**Como Instâncias EC2 Armazenam Dados**

Quando uma instância EC2 roda, seu sistema operacional vive em algum lugar de um disco. Esse disco
se chama **volume raiz** (root volume). Por padrão, isso é um **volume EBS** — mesmo quando você
não pensa nisso.

Mas há outra coisa: instâncias EC2 também têm armazenamento **instance store**.

O instance store é armazenamento temporário fisicamente anexado ao hardware subjacente que
roda sua máquina virtual. Ele é extremamente rápido — mais rápido que quase qualquer outra opção de
armazenamento na AWS. Mas vem com uma pegadinha.

O instance store é **efêmero**.

Quando a instância para ou é encerrada, os dados do instance store se foram. Permanentemente.
Não recuperáveis. A AWS não avisa você muito alto sobre isso, que é como as equipes
descobrem: perdendo dados.

O instance store é apropriado para caches, arquivos de processamento temporários e espaço
de rascunho. Nunca para dados com os quais você se importa.

**EBS: O Disco Persistente**

Imagine um disco rígido externo que você pode conectar à sua instância EC2 — um que
não desaparece quando você o desconecta, e que você pode mover para uma máquina diferente
se precisar. A AWS chama isso de **EBS**: Elastic Block Store.

O EBS é armazenamento em bloco persistente para instâncias EC2.

Armazenamento em bloco significa que ele se comporta como um disco rígido de verdade: seu sistema operacional pode criar
sistemas de arquivos nele, ler e escrever bytes arbitrários em posições arbitrárias, rodar bancos de dados
nele, e tratá-lo exatamente como um disco anexado.

As propriedades-chave:

**Persistente.** Diferente do instance store, volumes EBS sobrevivem a paradas, inícios, e
até ao encerramento da instância (dependendo da configuração). Os dados ficam no volume
mesmo quando nenhuma instância está usando.

Há uma nuance de configuração aqui: quando você cria uma instância EC2, o volume raiz
tem uma configuração chamada "Delete on Termination" (Excluir ao Encerrar). Por padrão, está definida como true — o
volume raiz é excluído quando a instância é encerrada. Para volumes de dados adicionais
que você anexa, o padrão é false — eles persistem depois que a instância é encerrada.
Você pode mudar ambas as configurações. Se você quer que o volume raiz sobreviva ao encerramento da instância
(para análise forense ou recuperação de dados), desabilite "Delete on Termination". Se você quer que
volumes de dados sejam limpos automaticamente, habilite-a.

**Anexável e desanexável.** Um volume EBS pode ser desanexado de uma instância e
anexado a outra. Se você precisa migrar dados ou se recuperar de uma instância com falha,
você pode desanexar o volume e reanexá-lo em outro lugar.

O fluxo de desanexar-e-reanexar é mais lento que uma restauração de snapshot mas preserva
o estado exato do volume — todas as escritas não confirmadas, todos os dados em cache, o estado exato
do sistema de arquivos. Isso o torna útil para análise forense (anexar o volume a
uma instância de análise sem inicializar o sistema original) e para migração de dados
(mover um volume de banco de dados para uma instância maior sem tirar um snapshot).

**Anexação única (na maioria das vezes).** Por padrão, um volume EBS é anexado a exatamente uma
instância EC2 por vez. Uma única instância pode ter múltiplos volumes EBS, mas um único
volume EBS não pode ser montado por múltiplas instâncias simultaneamente (com uma exceção:
o EBS Multi-Attach, que tem casos de uso limitados e restrições importantes).

O EBS Multi-Attach permite que volumes io1/io2 (Provisioned IOPS) sejam anexados a múltiplas instâncias simultaneamente
na mesma AZ. Isso parece resolver o problema de "armazenamento compartilhado", mas vem
com restrições sérias: as aplicações nas instâncias anexadas devem ser capazes de
coordenar o acesso concorrente — a semântica de sistema de arquivos compartilhado (gestão de locks, ordenação
de escrita) não é fornecida pelo EBS. Na prática, o EBS Multi-Attach é usado para aplicações de
banco de dados em cluster que lidam com a coordenação por conta própria. Para acesso geral a arquivos
compartilhados, o EFS é mais simples e mais apropriado.

A analogia do EBS: um disco rígido externo conectado a um laptop. O laptop
(instância EC2) pode ler e escrever nele. Quando você termina, você pode desconectá-lo e
conectá-lo a um laptop diferente.

**Tipos de Volume EBS**

Nem todos os volumes EBS são iguais. A AWS oferece vários tipos com diferentes perfis de desempenho
e custo.

**gp3 (SSD de Uso Geral)**: A escolha padrão para a maioria das cargas de trabalho. Bom equilíbrio de
desempenho e preço. Adequado para volumes de boot, bancos de dados pequenos e ambientes de
desenvolvimento.

Antes de o gp3 se tornar o padrão, havia o **gp2** — e você ainda vai encontrá-lo por aí. Volumes gp2 atrelam seu desempenho de IOPS diretamente ao tamanho do volume: você obtém 3 IOPS por gigabyte, até um máximo de 16.000 IOPS (que requer um volume de 5.334 GB). A taxa de transferência é limitada a 250 MB/s. Esse acoplamento significa que no gp2, a única forma de obter mais IOPS é deixar o volume maior — mesmo que você não precise do espaço extra. O gp3 quebrou essa dependência: ele começa em 3.000 IOPS e 125 MB/s independentemente do tamanho, e deixa você configurar IOPS e taxa de transferência independentemente, a um custo menor. A AWS recomenda o gp3 para novos volumes, mas como muitas cargas de trabalho existentes ainda rodam em gp2, você precisa conhecer ambos.

**io2 (SSD de IOPS Provisionado)**: Opção de alto desempenho para cargas de trabalho intensivas em I/O.
Você especifica quantas operações de I/O por segundo (IOPS) você precisa, e a AWS garante
esse desempenho. Apropriado para grandes bancos de dados de produção.

**st1 (HDD Otimizado para Taxa de Transferência)**: Armazenamento magnético otimizado para grandes leituras e
escritas sequenciais. Custo mais baixo que SSD, mas mais lento para I/O aleatório. Bom para
data warehousing e processamento de logs.

**sc1 (Cold HDD)**: A opção EBS mais barata. Para dados acessados com pouca frequência. Não
apropriado para nada sensível ao tempo.

"Quanto a mais o io2 custa comparado ao gp3?" perguntou Tom, levantando os olhos do caderno.

Leo abriu a página de preços. O io2 custava cerca de 50–60% a mais por GB do que o gp3,
mais uma cobrança separada por IOPS provisionado — e em um volume de alto desempenho, são essas cobranças por IOPS que dominam a conta. Tom anotou a diferença. "Então a gente usa gp3 até
o banco de dados de fato precisar da garantia de desempenho."

O exame não exige que você memorize todos os tipos. Ele de fato testa sua capacidade de
casar requisitos com o tipo certo: requisitos de IOPS → io2. Cargas de trabalho sequenciais
sensíveis a custo → st1. Aplicações web gerais → gp3.

**IOPS vs. Taxa de Transferência: Por Que a Distinção Importa**

Tom voltou à questão do volume EBS na terça-feira seguinte, depois de verificar o CloudWatch.

"Eu vejo duas métricas no painel do EBS," disse ele. "IOPS e taxa de transferência. São coisas diferentes?"

São.

**IOPS** (Operações de Input/Output por Segundo) mede quantas operações de leitura ou escrita o disco consegue lidar por segundo. Cada operação é tipicamente pequena — 4KB a 256KB. IOPS alto importa para bancos de dados que fazem muitas leituras e escritas pequenas e aleatórias: buscar linhas individuais, atualizar registros, lidar com consultas concorrentes.

**Taxa de transferência** (medida em MB/s) mede quantos dados se movem por segundo. Taxa de transferência alta importa para cargas de trabalho sequenciais: ler grandes arquivos de log, analytics de streaming, carregar grandes conjuntos de dados.

Um banco de dados tipicamente precisa de IOPS alto e taxa de transferência de baixa a moderada. Um data warehouse varrendo grandes tabelas precisa de taxa de transferência alta e pode conviver com IOPS moderado.

Tom vinha observando as métricas do CloudWatch do banco de dados da Nimbus. As IOPS estavam dando picos durante o horário de pico do jantar — leituras curtas e aleatórias à medida que a aplicação buscava itens de cardápio e dados de pedidos. A taxa de transferência estava baixa. O padrão batia com uma carga de trabalho de banco de dados que precisava de IOPS melhor, não de taxa de transferência melhor.

"Então se o banco de dados fica lento," disse Tom, "a gente verifica se está limitado por IOPS ou por taxa de transferência antes de fazer upgrade do volume?"

"Certo," disse Priya. "Fazer upgrade de gp3 para io2 adiciona IOPS a um custo. Se o problema é taxa de transferência, esse upgrade não vai ajudar. Verifique a métrica primeiro."

É exatamente assim que você evita upgrades de armazenamento caros que resolvem o problema errado.

**Snapshots EBS: O Backup**

Eis algo que salva empresas regularmente.

Um **snapshot EBS** é um backup pontual de um volume EBS, armazenado no S3 (embora
você o acesse através da interface do EBS, não diretamente pelo S3). Snapshots são
incrementais: o primeiro snapshot captura o volume completo; snapshots subsequentes só
armazenam o que mudou desde o último.

Você pode criar um novo volume EBS a partir de um snapshot — restaurando para um ponto no tempo antes
de uma corrupção de banco de dados, uma implantação ruim ou uma exclusão acidental.

Você deveria automatizar snapshots. A AWS fornece o **Amazon Data Lifecycle Manager** para esse
propósito: defina uma política (tire um snapshot a cada 6 horas, mantenha os últimos 7 dias), e
ele roda automaticamente.

Priya tinha isso configurado antes de o banco de dados sequer entrar em produção.

Leo não tinha pensado nisso.

"A gente pensou no que acontece se o job de snapshot falhar silenciosamente?" perguntou Priya. "Se a política roda mas os snapshots não são de fato válidos?"

Eles testaram o processo de restauração naquela tarde.

A política completa de backup por snapshot da Priya para o banco de dados de produção da Nimbus, assim que ela teve tempo de documentá-la apropriadamente:

- **Snapshots diários**, retidos por 7 dias. Estes cobrem o cenário normal de recuperação: uma implantação ruim, uma exclusão acidental, um evento de corrupção descoberto dentro de uma semana.
- **Snapshots semanais** (tirados todo domingo às 2h), retidos por 30 dias. Estes cobrem o cenário em que um problema não é detectado imediatamente — uma corrupção sutil de dados que só é notada semanas depois.
- Cópia de snapshot entre regiões para `us-east-1`, uma vez por semana, retida por 30 dias. Estes cobrem o cenário em que a Região inteira `us-west-2` está indisponível e a Nimbus precisa reconstruir o banco de dados em outro lugar.

"Isso parece muitos snapshots," disse Leo.

"Cada snapshot incremental depois do primeiro é pequeno," disse Priya. "Você só está armazenando o que mudou. O custo total de armazenamento é modesto."

Tom já tinha pesquisado o preço. Snapshots diários de um banco de dados de 50GB, mantidos por 7 dias, mais snapshots semanais retidos por 30 dias — aproximadamente US$ 3 a US$ 5 por mês. O custo de não tê-los, se o banco de dados algum dia fosse corrompido, era imensuravelmente maior.

"E o Fast Snapshot Restore?" perguntou Leo. "Eu vi essa opção quando estava olhando as configurações."

O **Fast Snapshot Restore** (FSR) é um recurso do EBS que elimina a penalidade de desempenho de I/O que normalmente ocorre quando você usa pela primeira vez um snapshot restaurado. Sem FSR, um volume EBS recém-restaurado tem desempenho ruim nos primeiros minutos ou horas à medida que os dados são carregados preguiçosamente do S3 — leituras vão ao S3 buscar dados que ainda não foram puxados para o volume. Com FSR habilitado em um snapshot em uma AZ específica, o volume restaurado está imediatamente pronto para desempenho total.

O FSR custa a mais — você paga por snapshot por AZ por hora que o FSR está habilitado. Para os snapshots de recuperação de desastres da Nimbus, o uso ocasional não justificava o custo contínuo do FSR. Para um snapshot de banco de dados de produção que precisava ser restaurado e operacional em minutos numa emergência, o FSR valia a pena.

"Habilite o FSR no snapshot semanal que a gente de fato usaria para recuperação de desastres," disse Priya. "Não habilite em todo snapshot diário na janela de retenção."

Tom adicionou o cálculo de custo à planilha.

**Cópia de Snapshot Entre Regiões para Recuperação de Desastres**

Snapshots EBS vivem na Região onde foram criados. Se a Região inteira `us-west-2` cair, seus snapshots em `us-west-2` ficam inacessíveis.

A solução: **cópia de snapshot entre regiões**. Você pode copiar um snapshot EBS para outra Região, dando a você um backup utilizável mesmo se sua Região primária estiver indisponível.

O AWS Data Lifecycle Manager suporta cópia automatizada entre regiões como parte de uma política de snapshot: tire um snapshot diário em `us-west-2`, copie-o automaticamente para `us-east-1` uma vez por semana. Se o desastre acontecer, lance uma nova instância EC2 em `us-east-1`, restaure a partir do snapshot entre regiões, atualize o endpoint de DNS, e continue operando.

"Este é nosso plano de recuperação de desastres para o banco de dados," disse Priya, apresentando a documentação da política à equipe. "Não uma arquitetura multirregião completa — isso é mais complexidade do que a gente precisa agora. Mas se `us-west-2` cair completamente, a gente pode restaurar em `us-east-1` dentro de duas horas."

"Duas horas de inatividade," disse Tom.

"Versus inatividade infinita," disse Priya.

Tom reconheceu a distinção.

**Criptografia EBS: A História de Por Que Você Não Pode Criptografar No Lugar**

O banco de dados de produção da Nimbus vinha rodando havia seis semanas quando Priya sinalizou algo.

"O volume EBS não está criptografado," disse ela.

"A gente pode criptografá-lo?" perguntou Leo.

"Sim. Mas não no lugar."

Eis a questão sobre criptografia EBS: você não pode criptografar um volume EBS existente, não criptografado, diretamente. Os dados já estão escritos em texto plano. Para criptografá-lo, você tem que:

1. Criar um snapshot do volume não criptografado
2. Copiar o snapshot, habilitando criptografia na cópia
3. Criar um novo volume EBS criptografado a partir do snapshot criptografado
4. Parar a instância
5. Desanexar o volume antigo não criptografado
6. Anexar o novo volume criptografado
7. Iniciar a instância e verificar que tudo funciona

Esse processo tem uma janela de inatividade — a sequência parar, desanexar, anexar, iniciar. Para a Nimbus, com um banco de dados pequeno, a janela foi de cerca de quinze minutos. Para um grande banco de dados de produção com centenas de GB, o processo de snapshot e cópia pode levar mais tempo, embora a inatividade real da instância ainda seja só o ciclo de parar/iniciar.

"Por que a gente não pode simplesmente apertar um botão?" perguntou Leo.

"Porque os dados existentes no disco são bytes não criptografados," disse Priya. "A AWS não pode recriptografá-los sem ler e reescrever cada bloco — que é exatamente o que o processo de cópia de snapshot faz. Ele lê cada bloco do snapshot de origem, criptografa cada um, e o escreve no novo snapshot."

Leo percorreu o processo. O novo volume criptografado foi anexado. A instância voltou a ficar online. O banco de dados estava rodando em um volume criptografado.

"Novos volumes EBS podem ser criados criptografados por padrão," disse Priya. "Há uma configuração no nível da conta. Todo novo volume é criptografado automaticamente. A gente deveria ter habilitado isso no primeiro dia."

Ela a habilitou. A partir daquele ponto, todo volume EBS criado na conta AWS da Nimbus era criptografado por padrão — nenhum passo extra necessário.

**EFS: O Arquivo Compartilhado**

O EBS é um disco anexado a uma instância. E se múltiplas instâncias precisam acessar os
mesmos arquivos simultaneamente?

O que você precisa é de algo como o arquivo no centro de um escritório — qualquer um
pode chegar, pegar um documento, recolocá-lo, e a próxima pessoa vê a mudança imediatamente.
Múltiplas pessoas, simultaneamente, acessando o mesmo armazenamento.

A AWS chama isso de **EFS**: Elastic File System.

O EFS é um sistema de arquivos de rede gerenciado. Múltiplas instâncias EC2 podem montar o mesmo sistema de
arquivos EFS ao mesmo tempo e ler/escrever em arquivos compartilhados. Esta é a capacidade-chave
que o EBS não fornece.

Para colocar claramente:

O EBS é um disco rígido externo conectado a um laptop. Só aquele laptop pode usá-lo de cada
vez.

O EFS é o arquivo no centro do escritório. Qualquer membro da equipe pode chegar, abrir
uma gaveta, ler um documento, recolocar algo.

**Quando você precisa de EFS?**

- Quando múltiplas instâncias EC2 precisam compartilhar arquivos — sistemas de gerenciamento de conteúdo, arquivos
  de configuração compartilhados, bibliotecas de mídia compartilhadas
- Quando você tem uma aplicação escalada horizontalmente em que todas as instâncias precisam de acesso aos
  mesmos dados
- Quando você precisa de um sistema de arquivos persistente que sobrevive a falhas de instância

O EFS é acessado pela rede usando o protocolo NFS (especificamente NFSv4). Qualquer instância EC2
que tenha conectividade de rede com o mount target do EFS pode montá-lo — incluindo
instâncias em diferentes AZs dentro da mesma Região. Você configura mount targets em cada
AZ, e instâncias se conectam ao mount target mais próximo para desempenho ótimo.

A implicação prática: o EFS funciona entre AZs de imediato. Se você tem servidores web
em `us-west-2a` e `us-west-2b` ambos montando o mesmo sistema de arquivos EFS, um arquivo escrito
por um servidor em `2a` é imediatamente visível para um servidor em `2b`. Este é o comportamento de
sistema de arquivos compartilhado que o EBS não consegue fornecer.

**Modos de Desempenho do EFS**

O EFS tem dois modos de taxa de transferência que importam para o dimensionamento:

**Elastic Throughput** (o padrão para a maioria dos sistemas de arquivos novos): o EFS escala automaticamente a taxa de transferência para cima e para baixo com base no uso real. Você não provisiona um nível de taxa de transferência. Você paga pelo que usa. Este é o modo certo para cargas de trabalho variáveis em que as necessidades de taxa de transferência flutuam — como a Nimbus, em que o tráfego de segunda de manhã é diferente do de sexta à noite.

**Provisioned Throughput**: você especifica o nível de taxa de transferência independentemente dos dados armazenados. Útil quando sua carga de trabalho precisa de taxa de transferência consistentemente alta que excede o que o volume de dados armazenado forneceria no modo Elastic. Se você está rodando um sistema de build que lê dezenas de gigabytes por minuto independentemente de quanto está armazenado, o Provisioned Throughput é apropriado.

Há também um terceiro modo, **Bursting Throughput**, que é o comportamento original do EFS e ainda o padrão para sistemas de arquivos criados antes de o Elastic ficar disponível. No modo Bursting, a taxa de transferência escala com quanto dado você armazena: você obtém uma linha de base de 50 KB/s por GB, mais créditos de burst que se acumulam quando você está abaixo da linha de base e podem ser gastos quando você precisa de taxa de transferência mais alta (até 100 MB/s para sistemas de arquivos menores, ou até um múltiplo da linha de base para os maiores). É a escolha certa para cargas de trabalho com padrões de acesso imprevisíveis ou irregulares em que o sistema de arquivos é grande o suficiente para ganhar créditos de burst significativos. Se seu sistema de arquivos é pequeno e seu padrão de acesso é irregular, você pode queimar seus créditos rapidamente — observe a métrica `BurstCreditBalance` do CloudWatch para saber onde você está.

A pergunta do Tom foi imediata: "O Elastic é mais caro?"

"Depende do padrão de uso," disse Leo. "Com o Elastic, você paga pela taxa de transferência que de fato consome. Com o Provisioned, você paga pela taxa de transferência que especificou mesmo que não esteja usando."

"Então para cargas de trabalho variáveis, o Elastic geralmente é mais barato," disse Tom.

"Geralmente," disse Priya. "Verifique seus padrões reais de taxa de transferência no CloudWatch antes de decidir."

O EFS também tem dois modos de desempenho: **General Purpose** (baixa latência, adequado para a maioria das cargas de trabalho, o padrão) e **Max I/O** (taxa de transferência mais alta para cargas de trabalho altamente paralelizadas ao custo de latência ligeiramente mais alta). O General Purpose lida com a vasta maioria dos casos de uso. O Max I/O foi projetado para aplicações que precisam fazer milhares de operações de sistema de arquivos simultâneas — pipelines de processamento de mídia em larga escala, fluxos de trabalho de computação científica com muitos leitores paralelos.

**EFS vs. S3:** o EFS é um sistema de arquivos (pastas, arquivos, permissões, locking). O S3 é
armazenamento de objetos (upload, download, sem semântica de sistema de arquivos). O EFS é muito mais caro
que o S3 — cerca de US$ 0,30 por GB por mês para EFS Standard versus US$ 0,023 por GB por mês
para S3 Standard. Use o S3 para arquivos que são armazenados e recuperados inteiros. Use o EFS para arquivos
que aplicações ativamente leem e escrevem através de operações padrão de sistema de arquivos.

**Se EBS Então Uma Instância, Mas Se EFS Então Muitas**

A decisão EBS/EFS se resume a uma pergunta: quantas instâncias precisam acessar este armazenamento ao mesmo tempo?

Se você constrói uma aplicação escalada horizontalmente em EBS, então cada instância tem seu próprio disco — mas quando um usuário envia um arquivo para a instância A, a instância B não consegue vê-lo. Isso está bem para bancos de dados (cada BD tem seu próprio disco), mas quebrado para conteúdo compartilhado. Se você precisa de acesso compartilhado, o EFS é a resposta — mas o EFS custa mais por GB que o S3, e tem latência mais alta que o EBS para I/O aleatório. A escolha certa depende inteiramente do que sua aplicação faz com os dados.

**Escolhendo o Armazenamento Certo**

A esta altura você viu três tipos de armazenamento na AWS. Vamos deixar a decisão nítida.

| Necessidade                                | Tipo de Armazenamento |
|--------------------------------------------|-----------------------|
| Banco de dados precisa de disco persistente e rápido | EBS (gp3 ou io2)      |
| Múltiplos servidores precisam de arquivos compartilhados | EFS                   |
| Arquivos, backups, imagens, objetos grandes | S3                    |
| Espaço de rascunho de computação temporário | Instance Store        |
| Arquivos de longo prazo a custo mínimo     | S3 Glacier            |

Você pode estar se perguntando: se o EFS deixa múltiplas instâncias compartilharem arquivos, por que não usá-lo para tudo? Porque o EFS custa significativamente mais por GB que o S3, e tem latência mais alta que o EBS local para I/O aleatório. É a ferramenta certa para acesso a sistema de arquivos compartilhado — não para armazenamento geral de arquivos ou armazenamento de banco de dados.

Acertar essa decisão importa. Usar S3 onde você precisa de EFS adiciona complexidade
operacional. Usar EBS onde você precisa de EFS causa falhas quando você escala. Usar
instance store onde você precisa de persistência perde dados.

Priya imprimiu esta tabela e a colou na parede.

"Toda vez que a gente adiciona um requisito de armazenamento," disse ela, "a gente começa aqui."

Vamos percorrer alguns cenários reais para tornar a decisão concreta:

**Cenário A**: Um job de treinamento de machine learning roda em uma instância EC2 com GPU e precisa
ler um conjunto de dados de 200GB. O job roda uma vez por dia e leva duas horas. O conjunto de dados
é compartilhado por múltiplas equipes de pesquisa.

Decisão: S3. O conjunto de dados é grande, lido-uma-vez-por-job, e compartilhado. O S3 é barato, durável,
e acessível de qualquer instância EC2 ou da conta de qualquer equipe. A instância com GPU o lê
via a API do S3. Não há necessidade de um sistema de arquivos aqui.

**Cenário B**: Um site WordPress roda em quatro instâncias EC2 atrás de um balanceador de carga.
O WordPress armazena arquivos de plugin, arquivos de tema e uploads de usuários em um diretório no
servidor. Todas as quatro instâncias precisam ler e escrever os mesmos arquivos.

Decisão: EFS. O WordPress usa semântica de sistema de arquivos — ele cria diretórios, escreve
arquivos, lê arquivos por caminho. O S3 exigiria reescrever o ecossistema de plugins do WordPress.
O EFS monta como um sistema de arquivos NFS padrão, com o qual o WordPress trabalha nativamente.

**Cenário C**: Um banco de dados PostgreSQL roda em uma instância EC2. Ele precisa de I/O aleatório rápido
para execução de consultas e buscas em índices.

Decisão: EBS (gp3 ou io2). Bancos de dados precisam de armazenamento em bloco com baixa latência para
leituras e escritas pequenas e aleatórias. O S3 é lento demais e não suporta semântica de sistema de arquivos.
O EFS tem latência mais alta que o EBS para I/O aleatório.

O padrão: o padrão para arquivos é S3. Adicione EBS quando você precisa de armazenamento em bloco para uma
instância específica. Adicione EFS quando múltiplas instâncias precisam compartilhar um sistema de arquivos.
Instance store apenas para espaço de rascunho temporário.

## Quando o EFS Não É Suficiente: Amazon FSx

A próxima lição de armazenamento não chegou como uma interrupção ou um debate de quadro branco. Ela chegou como um contrato de venda — do tipo que Maya vinha perseguindo desde que o portal foi lançado, do tipo que levava um trimestre inteiro de demos e ligações de acompanhamento para fechar. Três meses depois de o portal para operadores de restaurante ser lançado, a Nimbus assinou seu primeiro cliente de múltiplas localizações: a Copper Kettle, um grupo familiar de uma dúzia de localizações pelo meio-oeste. Maya tinha conduzido o negócio. Tom tinha construído o modelo financeiro. Leo tinha começado a planejar a integração técnica antes de a tinta secar.

Então ele leu as notas de infraestrutura da equipe de TI da Copper Kettle.

"Os servidores de arquivo deles são Windows," disse ele. "Tudo é Windows. O software de gestão de cozinha, o sistema de RH, a ferramenta de agendamento — tudo isso escreve em drives compartilhados em servidores de arquivo Windows. Protocolo SMB. Autenticação Active Directory."

"A gente consegue migrá-los para o EFS?" perguntou Maya.

Leo balançou a cabeça. "O EFS usa NFS. As aplicações deles falam SMB. Esses são protocolos diferentes. O software da Copper Kettle não sabe o que é NFS. Você não pode simplesmente apontá-lo para um mount EFS."

"Então a gente não pode usar o EFS."

"Não para isso. Há um serviço diferente."

**FSx for Windows File Server: EFS, Mas para Windows**

O **Amazon FSx for Windows File Server** é um sistema de arquivos compartilhado totalmente gerenciado e nativo do Windows. Ele suporta o protocolo SMB (Server Message Block) — o mesmo protocolo que servidores Windows, aplicações Windows e compartilhamentos de arquivo Windows on-premises têm usado por décadas. Ele se integra com o Active Directory, suporta ACLs do Windows (permissões no nível de arquivo), e suporta os recursos específicos do Windows dos quais aplicações Windows de fato dependem.

Pense nele como EFS, mas para Windows — com todos os recursos específicos do Windows que seu ambiente Active Directory já espera. O software de gestão de cozinha da Copper Kettle se conectaria a ele exatamente como tinha se conectado aos servidores de arquivo on-premises. A aplicação não muda. O protocolo não muda. Os dados só passam a viver em um serviço AWS gerenciado em vez de um servidor num porão em algum lugar de Chicago.

Para a migração da Copper Kettle: Leo provisionou um sistema de arquivos FSx for Windows File Server, conectou-o ao Active Directory da Copper Kettle (estendido para a AWS via AWS Managed Microsoft AD), e mapeou as letras de drive existentes. O software de cozinha encontrou seus compartilhamentos de arquivo exatamente onde esperava.

"Quanto isso custa por mês?" perguntou Tom.

Leo já tinha olhado. O FSx for Windows é precificado por GB de armazenamento por mês — mais caro que o EFS, significativamente mais que o S3, mas muito mais barato que manter servidores de arquivo Windows em uma dúzia de localizações. Tom anotou o número sem objeção.

**FSx for Lustre: Quando Seu Job de ML Precisa Alimentar Centenas de GPUs**

Enquanto isso, Leo tinha começado a prototipar um motor de recomendação por conta própria — prevendo quais pratos um cliente provavelmente pediria com base no comportamento passado e no que clientes similares pediram. Os dados de treinamento ainda eram pequenos, mas o experimento o levou por uma toca de coelho de como equipes sérias de ML alimentam seus modelos: jobs de treinamento que leem centenas de gigabytes do S3 a cada execução.

"O padrão que continua aparecendo nos estudos de caso," ele relatou no almoço seguinte da equipe, "é jobs de treinamento gargalados em I/O. GPUs caras ficando ociosas 40% do tempo, esperando o próximo lote de dados."

Este é um problema diferente do armazenamento de arquivos compartilhado. É um problema de computação de alto desempenho (HPC): quando você tem centenas de unidades de processamento que todas precisam ler dados simultaneamente, a taxa de transferência muito alta, do mesmo conjunto de dados.

O **Amazon FSx for Lustre** é uma implementação totalmente gerenciada do sistema de arquivos paralelo Lustre. O Lustre é feito sob medida para exatamente esse cenário — leituras paralelas a taxa de transferência extremamente alta, através de muitos clientes simultâneos. Ele se integra nativamente com o S3: você aponta o FSx for Lustre para um bucket do S3, e ele automaticamente torna esses dados disponíveis através do sistema de arquivos Lustre. O job de treinamento lê de um mount point local; o FSx transmite os dados do S3 nos bastidores.

Quando seu job de treinamento de ML precisa alimentar dados para centenas de GPUs simultaneamente, o FSx for Lustre é a ferramenta. O mesmo se aplica a modelagem financeira, cargas de trabalho de genômica e renderização de vídeo — qualquer carga de trabalho em que o gargalo é a taxa de transferência de I/O paralela em vez da capacidade de armazenamento.

O estudo de caso que Leo tinha marcado contava a história em dois números: depois de migrar o job de treinamento para o FSx for Lustre, a utilização de GPU subiu de 60% para 94%, e a execução de treinamento que tinha levado seis horas se completou em três e meia. A Nimbus não precisaria desse tipo de potência por muito tempo — mas Leo arquivou o padrão para o dia em que o motor de recomendação crescesse.

**As Outras Opções de FSx**

A AWS também oferece o **FSx for NetApp ONTAP** — para empresas que já rodam armazenamento NetApp on-premises e querem acesso multiprotocolo (NFS, SMB e iSCSI do mesmo sistema de arquivos) — e o **FSx for OpenZFS**, para cargas de trabalho que precisam de recursos específicos do ZFS como snapshots e clones no nível do sistema de arquivos. Ambos são ferramentas especializadas para organizações com infraestrutura ou requisitos existentes específicos.

Para a maioria das equipes, a decisão é entre as quatro variantes de FSx e o EFS. A pergunta é sempre a mesma: qual protocolo a carga de trabalho fala, e quais características de desempenho ela precisa?

---

> **Dica de Exame — Amazon FSx**
>
> *Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + cargas de trabalho Windows**. O exame sinaliza: "servidor de arquivo Windows", "protocolo SMB", "integração com Active Directory", "lift-and-shift de aplicações Windows". Quando você vê qualquer uma dessas frases, FSx for Windows é a resposta.
> - **FSx for Lustre = HPC + treinamento de ML + I/O paralelo + integração com S3**. O exame sinaliza: "treinamento de machine learning", "computação de alto desempenho", "HPC", "sistema de arquivos paralelo", "cargas de trabalho intensivas em I/O", "cluster de GPU", "integrar sistema de arquivos com S3". Quando você vê essas frases, FSx for Lustre é a resposta.
> - **O EFS não é substituto para nenhum dos dois.** O EFS é NFS para cargas de trabalho Linux. Ele não fala SMB. Não é um sistema de arquivos paralelo de alto desempenho. Usar EFS onde FSx é necessário significa que a aplicação não funciona (Windows) ou está gargalada em I/O (HPC).
> - **FSx for NetApp ONTAP e FSx for OpenZFS** aparecem com menos frequência, mas os sinais são distintos. "Migrar armazenamento NetApp/ONTAP existente", "acesso multiprotocolo (NFS + SMB + iSCSI)" ou "SnapMirror" → FSx for NetApp ONTAP. "ZFS", "NFS com snapshots/clones instantâneos" ou "migrar um servidor de arquivo ZFS on-premises" → FSx for OpenZFS.
> - Referência rápida: "SMB ou servidor de arquivo Windows" → FSx for Windows. "Treinamento de machine learning ou computação de alto desempenho" → FSx for Lustre. "NetApp/multiprotocolo" → FSx for ONTAP. "ZFS" → FSx for OpenZFS.

---

## A Ponte para a Nuvem: AWS Storage Gateway

O maior prospect da Nimbus até então — uma rede regional chamada Meridian Kitchen, vinte localizações em três estados — veio com um problema que não podia ser resolvido com `aws s3 cp`.

A Meridian tinha anos de dados operacionais vivendo em servidores de arquivo on-premises. Receitas, faturas, gravações de vídeo de cozinha, contratos de fornecedores. Não alguns gigabytes. Terabytes. E o software que gerava e consumia esses dados — o sistema de gestão de cozinha, a plataforma de faturamento, as ferramentas de RH — tudo isso escrevia em compartilhamentos de arquivo locais usando NFS ou SMB. Reescrever essas aplicações não era viável. Mover todos os dados da noite para o dia também não era viável.

"Então como a gente começa a colocar os dados deles na AWS," perguntou Maya, "sem pedir para eles mudarem uma única aplicação?"

"Há um serviço para exatamente isso," disse Priya. "Ele roda no centro de dados deles como uma VM, parece um servidor de arquivo ou dispositivo de armazenamento normal para o software existente, e silenciosamente armazena tudo na AWS nos bastidores."

Esse serviço é o **AWS Storage Gateway**: um serviço de armazenamento híbrido que conecta ambientes on-premises ao armazenamento da AWS. Ele apresenta armazenamento às suas aplicações usando os protocolos que elas já entendem, enquanto na verdade persiste dados no S3, S3 Glacier, ou como snapshots EBS.

Há três tipos de gateway, cada um resolvendo um problema on-premises diferente.

O **File Gateway** apresenta uma interface NFS ou SMB a aplicações on-premises. Arquivos escritos no gateway são armazenados como objetos no S3 — mas a aplicação não sabe disso. Ela vê um sistema de arquivos. Arquivos acessados com frequência são cacheados localmente para leituras de baixa latência; o resto vive no S3. Isso era o que a Meridian precisava: o software de gestão de cozinha escreve no que parece um compartilhamento de arquivo, e os dados acabam no S3 onde a Nimbus pode analisá-los, fazer backup deles e pesquisá-los.

"Espera — mas *por que* a gente faria desse jeito?" perguntou Maya. "Por que não apontar o software direto para o S3?"

Porque NFS e SMB não são S3. O software de cozinha não fala a API do S3. Ele abre caminhos de arquivo. Ele escreve bytes em um diretório. O File Gateway traduz isso em operações de objeto do S3 sem a aplicação saber que algo mudou.

O **Volume Gateway** apresenta volumes de armazenamento em bloco iSCSI a servidores on-premises — a mesma interface que um disco rígido físico ou dispositivo SAN apresentaria. Ele tem dois modos: *volumes armazenados* (stored volumes) mantêm os dados primários on-premises com backups assíncronos para o S3 como snapshots EBS (para cargas de trabalho on-premises-primeiro que também querem backup na nuvem), e *volumes cacheados* (cached volumes) mantêm os dados primários no S3 com dados acessados com frequência cacheados on-premises (para organizações prontas para tratar o S3 como armazenamento primário).

O **Tape Gateway** apresenta uma biblioteca de fitas virtual (VTL) a software de backup como Veeam, Veritas ou NetBackup. O software de backup escreve no que parece cartuchos de fita física. Essas fitas virtuais são armazenadas no S3 e podem ser arquivadas no S3 Glacier. O software de backup não muda. Os robôs e prateleiras de fita física vão embora.

"A equipe de backup da Meridian roda Veeam," disse Leo. "Eles têm fitas físicas de verdade. Armazenamento fora do local, cronogramas de rotação, tudo."

"O Tape Gateway substitui as fitas físicas," disse Priya. "Mesma configuração do Veeam. Mesmos jobs de backup. As fitas só vivem no S3 em vez de um rack."

Tom pesquisou o custo de armazenamento de fita fora do local. Ele fechou aquela aba sem comentar e aprovou o plano de migração.

---

> **Dica de Exame — AWS Storage Gateway**
>
> *Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3)*
>
> - **File Gateway = NFS/SMB → S3.** Arquivos escritos por aplicações on-premises se tornam objetos do S3. Arquivos acessados com frequência são cacheados localmente. Gatilho de exame: "aplicação on-premises precisa armazenar arquivos no S3 sem mudanças de código".
> - **Volume Gateway = armazenamento em bloco iSCSI → snapshots do S3.** Modo stored: dados primários on-premises, com backup no S3 como snapshots EBS. Modo cached: dados primários no S3, blocos acessados com frequência cacheados localmente. Gatilho de exame: "servidor on-premises precisa de armazenamento em bloco respaldado pela nuvem".
> - **Tape Gateway = VTL → S3/Glacier.** Software de backup escreve em fitas virtuais; fitas armazenadas no S3 ou arquivadas no Glacier. Gatilho de exame: "substituir infraestrutura de backup em fita física sem mudar o software de backup".
> - **Padrão-chave de exame:** "aplicação on-premises precisa de armazenamento na nuvem sem mudanças de código" → Storage Gateway. "Substituir backup em fita" → Tape Gateway especificamente.

---

## Pontos Fortes e Limitações

**Pontos fortes do EBS**:

- Armazenamento em bloco persistente e rápido para EC2
- Snapshots para backup e recuperação pontuais
- Múltiplos níveis de desempenho para diferentes cargas de trabalho
- Criptografia em repouso suportada nativamente — habilite a criptografia no nível da conta por padrão

**Limitações do EBS**:

- Anexado a uma instância por vez (com pequenas exceções)
- Na mesma AZ que a instância EC2 (copiar para outra AZ requer um snapshot)
- Você paga pelo armazenamento provisionado, não só pelo que usa
- Criptografar um volume existente não criptografado requer um ciclo de snapshot-cópia-restauração com uma janela de manutenção

**Pontos fortes do EFS**:

- Sistema de arquivos compartilhado entre múltiplas instâncias — protocolo NFS nativo
- Escala automaticamente, você não provisiona capacidade
- Acessível entre AZs dentro de uma Região
- O modo Elastic Throughput se ajusta automaticamente à carga de trabalho

**Limitações do EFS**:

- Mais caro que o S3 por GB
- Latência mais alta que o EBS para I/O aleatório
- Não disponível em todas as Regiões

## Movendo Dados em Massa: DataSync e a Família Snow

O Storage Gateway mantém aplicações on-premises *continuamente conectadas* ao armazenamento na nuvem. Mas dois outros cenários de migração aparecem constantemente no exame — e eventualmente em projetos reais:

O **AWS DataSync** é para *transferência em massa online*: mover grandes conjuntos de dados pela rede entre servidores de arquivo NFS/SMB on-premises (ou outras nuvens) e S3, EFS ou FSx — uma vez, ou em um cronograma. Ele lida com paralelização, verificação de integridade, retentativas e throttling de banda, e é cerca de 10x mais rápido que scripts artesanais no estilo rsync. Gatilho de exame: "migrar/transferir milhões de arquivos de um servidor NFS on-premises para o Amazon EFS/S3" → DataSync. (Não o confunda com o Storage Gateway, que é para *acesso híbrido contínuo*, ou o DMS, que migra *bancos de dados*.)

A **AWS Snow Family** é para quando a rede é o gargalo. Mover 100 TB por uma linha de 100 Mbps leva mais de três meses; um caminhão é mais rápido. O **Snowball Edge** é um appliance robusto que a AWS envia para você — carregue até ~80 TB localmente, envie-o de volta, a AWS o importa para o S3. O **Snowcone** era a versão pequena e portátil (~8–14 TB) para localizações de borda — descontinuado no fim de 2024, embora ainda possa aparecer em questões de exame mais antigas (veja o aviso de realidade no Capítulo 25). Gatilho matemático de exame: quando o enunciado dá a você um tamanho de conjunto de dados e um link fino ou não confiável e pergunta pela migração mais rápida/prática, calcule o tempo de transferência — se for semanas ou meses, a resposta é a Snow Family.

> **Dica de Exame — AWS Backup**
>
> Mais um serviço que costura este capítulo: o **AWS Backup** centraliza e automatiza backups entre EBS, EFS, RDS, DynamoDB, FSx e Storage Gateway com um único plano de backup — cronogramas, retenção, cópias entre regiões e entre contas, e Backup Vault Lock para imutabilidade. Gatilho de exame: "gerenciar centralmente backups entre múltiplos serviços/contas da AWS" → AWS Backup, não scripts por serviço.


## Resumo

A caneta vermelha do Tom circulou o problema real: coisas demais em uma máquina. Mover o armazenamento para fora da instância EC2 não é só sobre capacidade — é sobre separar preocupações para que cada camada possa ser gerenciada, escalada e protegida independentemente. A escolha de armazenamento certa depende de quatro perguntas: o que precisa do armazenamento, quantas coisas precisam dele ao mesmo tempo, quanto tempo ele vive, e como ele é acessado? Essas quatro perguntas levam consistentemente à resposta certa.

- O **EBS** (Elastic Block Store) é armazenamento em bloco persistente para uma única instância EC2. Ele sobrevive a paradas de instância e pode ter snapshots para backup. Use gp3 para cargas de trabalho gerais, io2 para requisitos de IOPS alto. O instance store é temporário e rápido mas perdido quando a instância encerra.
- O **EFS** (Elastic File System) é um sistema de arquivos de rede compartilhado que múltiplas instâncias podem montar simultaneamente. O EFS abrange AZs dentro de uma Região; o EBS é restrito a uma única AZ.
- Case o tipo de armazenamento ao requisito: banco de dados em EC2 único → EBS; arquivos compartilhados entre servidores → EFS; objetos, mídia, backups → S3; arquivos de longo prazo → S3 Glacier.
- Criptografar um volume EBS existente requer: snapshot → cópia criptografada → novo volume → troca. Habilite a criptografia no nível da conta por padrão para evitar isso para novos volumes.
- **EBS "Delete on Termination"**: volumes raiz por padrão são excluídos ao encerrar a instância; volumes de dados por padrão persistem. Revise ambas as configurações ao projetar políticas de ciclo de vida de instância.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.1 (soluções de armazenamento)*

- **Volumes EBS vivem em uma AZ.** Eles só podem ser anexados a uma instância na
  mesma AZ. Para usar um volume EBS em uma AZ diferente, você cria um snapshot e o restaura
  na AZ de destino.
- **Snapshots EBS são incrementais e armazenados no S3.** O primeiro snapshot é completo;
  os subsequentes só armazenam mudanças. Você pode copiar snapshots para outras Regiões para
  recuperação de desastres.
- **O EFS é entre AZs.** Múltiplas instâncias em diferentes AZs dentro da mesma Região
  podem montar o mesmo sistema de arquivos EFS. Este é um diferenciador-chave em relação ao EBS.
- **Quando um cenário de exame diz "aplicação web com conteúdo compartilhado" ou "múltiplas
  instâncias acessando os mesmos arquivos", pense em EFS.** Quando diz "armazenamento de banco de dados"
  ou "disco persistente para um servidor", pense em EBS.
- **Dados do instance store sobrevivem a um reboot mas não a uma parada ou encerramento.** Uma questão
  pode descrever dados que "desaparecem depois que a instância é parada" — isso é instance
  store em jogo.
- **gp3 vs. io2**: o gp3 é o padrão para uso geral; o io2 é para cargas de trabalho que
  precisam de IOPS garantido (grandes bancos de dados, sistemas de missão crítica). Cenários de exame
  descrevendo "requisitos de IOPS" ou "desempenho de banco de dados consistente de baixa latência"
  apontam para io2.
- **gp2 vs. gp3:** as IOPS do gp2 são acopladas ao tamanho (3 IOPS/GB, máx. 16.000 IOPS a 5.334 GB); as IOPS do gp3 são independentes do tamanho (3.000 de base, configurável até 80.000 desde setembro de 2025 — material mais antigo, e possivelmente o banco de questões do exame, ainda assume o limite anterior de 16.000). Padrão de questão de exame: uma carga de trabalho precisa de mais IOPS sem aumentar o armazenamento — a resposta é gp3 ou io2, não gp2.
- **Criptografia em repouso para EBS**: você não pode criptografar um volume existente não criptografado
  no lugar — você deve fazer snapshot, copiar criptografado, restaurar. Habilite padrões de criptografia
  no nível da conta para evitar criar volumes não criptografados acidentalmente. A criptografia é AES-256
  usando chaves KMS.
- **O Fast Snapshot Restore** elimina a penalidade de desempenho em volumes recém-restaurados
  mas custa dinheiro por snapshot por AZ. Questões de exame sobre restaurar volumes
  "imediatamente com desempenho total" apontam para FSR.
- **Modos de desempenho do EFS**: General Purpose (baixa latência, adequado para a maioria das cargas de trabalho)
  vs. Max I/O (taxa de transferência mais alta para cargas de trabalho altamente paralelizadas).
- **Modos de taxa de transferência do EFS — três opções:** Bursting (a taxa de transferência escala com o tamanho do armazenamento, usa créditos de burst — bom para cargas de trabalho irregulares), Elastic (auto-escala, pague por uso — bom para cargas de trabalho imprevisíveis), Provisioned (taxa de transferência fixa independentemente do armazenamento — bom para necessidades consistentes de taxa de transferência alta). O exame testa se você sabe quando provisionar a taxa de transferência vs. deixá-la escalar elasticamente ou contar com créditos de burst.
- **Cópia de snapshot entre regiões**: snapshots EBS podem ser copiados para outras Regiões para
  recuperação de desastres. O snapshot copiado é independente e não adiciona custos de transferência
  de dados durante a restauração — apenas durante a operação de cópia em si.
- **Tipos de Storage Gateway:** File Gateway = NFS/SMB → S3 (arquivos se tornam objetos). Volume Gateway = armazenamento em bloco iSCSI → snapshots do S3 (stored: primário on-premises; cached: primário no S3). Tape Gateway = VTL → S3/Glacier (substitui fitas físicas). Gatilho de exame: "app on-premises precisa de armazenamento na nuvem sem mudanças de código" → Storage Gateway. "Substituir backup em fita" → Tape Gateway.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: qual é a diferença entre EBS e EFS? Quando você escolheria
um em vez do outro?

*(Dica: Pense se uma instância ou múltiplas instâncias precisam acessar o
armazenamento ao mesmo tempo.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa roda uma aplicação web em quatro instâncias EC2 atrás de um balanceador
de carga. Usuários podem enviar fotos de perfil. Qualquer foto deve ser visualizável por usuários
imediatamente após o upload, independentemente de qual instância a processou. As fotos são
servidas aos navegadores via HTTP, nunca são modificadas no lugar, e a equipe quer a
solução escalável MAIS custo-eficiente com a menor sobrecarga operacional.

Qual solução de armazenamento MELHOR atende aos requisitos deles?

A) Anexar um volume EBS gp3 a cada instância EC2 e sincronizar arquivos entre elas usando
   um cron job  
B) Armazenar fotos diretamente no instance store da instância EC2  
C) Usar o Amazon EFS, montado em todas as quatro instâncias EC2 simultaneamente  
D) Armazenar fotos no S3 e acessá-las diretamente do código da aplicação

**Dica 1**: O requisito é "todas as quatro instâncias devem servir qualquer foto". Quais opções
tornam um arquivo imediatamente visível para todas as instâncias?

**Dica 2**: O instance store é efêmero. O EBS não pode ser montado em múltiplas instâncias
simultaneamente. Isso reduz as opções.

**Dica 3**: Tanto C quanto D poderiam teoricamente funcionar. Qual é mais apropriado para um
caso em que a aplicação precisa acessar fotos através de operações de sistema de arquivos vs.
requisições HTTP?

**Resposta**: D

**Explicação**: Armazenar fotos no S3 e servi-las via URL é a escolha arquiteturalmente
correta para uma aplicação web. Fotos enviadas são imediatamente acessíveis de
qualquer servidor (e de qualquer navegador) através da URL do S3. O S3 é projetado para exatamente este
caso de uso: armazenar arquivos enviados por usuários em escala com alta disponibilidade e zero
sobrecarga de gerenciamento.

Nota: C (EFS) tecnicamente funcionaria, mas o S3 é o padrão preferido para arquivos binários
enviados por usuários em aplicações web porque é mais barato, mais escalável, e serve arquivos
via HTTP diretamente sem a aplicação agir como um proxy.

**Por que não A?** Sincronizar arquivos via cron job cria condições de corrida e problemas
de consistência. Entre os uploads e a próxima sincronização, arquivos estariam faltando em outras instâncias.

**Por que não B?** Dados do instance store são perdidos quando a instância é parada ou encerrada.
As fotos desapareceriam.

**Por que não C?** O EFS é a resposta certa quando a questão exige semântica de sistema de arquivos
(ex.: um CMS que modifica arquivos no lugar). Para fotos enviadas por usuários servidas pela
web, o S3 é mais simples, mais barato e mais apropriado.

**Aviso de palavra-chave de exame**: no exame real, leia o enunciado literalmente. Se ele diz
"armazenamento de **arquivos** compartilhado", "sistema de arquivos", "NFS" ou "POSIX", a resposta-chave é
**EFS** — não sobreponha o requisito declarado com gosto arquitetural. Este
cenário aponta para S3 porque pede entrega de objetos custo-eficiente via HTTP,
não um sistema de arquivos.

*Domínio SAA-C03 3 — Tarefa 3.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está adicionando um novo recurso: donos de restaurante podem enviar cardápios em PDF que são
então analisados e usados para popular o banco de dados da Nimbus. O job de processamento de PDF roda
em uma frota de instâncias EC2 que precisam: (a) ler o PDF enviado, (b) escrever
arquivos temporários de processamento, (c) escrever a saída analisada.

Quais serviços de armazenamento você usaria para cada um desses três passos, e por quê?

*(Não há uma única resposta correta. Foque em casar o tipo de armazenamento com as
características de cada passo.)*

## Cena Pós-Créditos

Naquela tarde, a Nimbus separou seu armazenamento apropriadamente. O banco de dados ganhou seu próprio
volume EBS com snapshots automatizados e criptografia habilitada. As fotos de cardápio se mudaram para o S3. A instância EC2
finalmente teve espaço para respirar.

Leo rodou um teste de carga. O site lidou com duzentos usuários simultâneos sem nem
suar.

"Vai dar certo daqui em diante," disse ele, observando os gráficos se estabilizarem suavemente.

Tom olhou para a conta. O volume EBS estava adicionando US$ 8 por mês. Ele anotou.

"Eu fico adicionando coisas a essa conta," disse ele. "Quando isso se equilibra?"

"Quando a gente parar de ter interrupções," disse Maya. "Toda interrupção custa mais que a prevenção."

Tom não pareceu convencido. Ele estaria, eventualmente.

Três dias depois, um dono de restaurante na plataforma tentou fazer um pedido e recebeu
um erro. Maya verificou os logs.

O banco de dados estava lá. A aplicação estava rodando. Mas vinte usuários simultâneos
estavam todos tentando ler o cardápio de uma vez, e cada um estava batendo no banco de dados.

"Cada carregamento de página é uma consulta de banco de dados," disse Leo. "Cada uma delas."

Priya já estava pesquisando algo no Google.

No próximo capítulo: o que acontece quando chegam mais clientes do que o servidor consegue lidar.
