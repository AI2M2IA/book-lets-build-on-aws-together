# Capítulo 23: O Sistema de Arquivamento Que Se Organiza Sozinho

Um escritório de advocacia mantém os arquivos de casos ativos sobre a mesa. Os casos concluídos vão para um arquivo. Os casos de três anos atrás vão para caixas de armazenamento no porão. Os casos de dez anos atrás vão para uma instalação de arquivo externa que custa centavos por caixa mas leva dois dias para recuperar qualquer coisa.

A mesma informação, armazenada a custos diferentes com base em quão frequentemente é acessada.

---

Com a automação de workflows em vigor e o fluxo de pedidos finalmente estável, Tom tinha voltado à sua revisão de custos. A conta do S3 vinha rondando o fundo da sua mente desde o trimestre anterior — um daqueles itens de linha que continuava crescendo sem ninguém olhar diretamente para ele. Ele finalmente teve tempo de olhar.

Ele chamou Leo.

"Temos 4,2 terabytes no S3", disse Leo depois de verificar.

"De quê?"

"Fotos de restaurantes. Recibos de pedidos. Exportações de analytics. Snapshots de backup de 18 meses atrás."

"Quando foi a última vez que alguém acessou um backup de 18 meses atrás?"

Leo verificou os logs de acesso.

"Outubro passado", disse ele. "Uma vez. Para verificar o formato do backup."

"Então estamos pagando por 18 meses de backups no preço integral do S3 Standard."

"Sim."

"Quanto isso custa por mês — Glacier vs Standard?" perguntou Tom, já abrindo a página de preços.

S3 Standard: US$ 0,023 por GB por mês. S3 Glacier Instant Retrieval: US$ 0,004 por GB por mês.

Tom fez a conta.

"Poderíamos reduzir essa conta significativamente", disse ele, "só movendo dados antigos para armazenamento mais barato."

"Precisaríamos saber o que é antigo", disse Leo.

"O S3 sabe. Ele rastreia a hora do último acesso."

**Classes de Armazenamento do S3: O Espectro Completo**

O capítulo 5 apresentou o S3 Standard como a classe de armazenamento principal. Na verdade, o S3 tem oito classes de armazenamento, cada uma projetada para padrões de acesso diferentes (a oitava, o **S3 Express One Zone**, é uma classe especializada de AZ única para cargas de trabalho críticas em latência e raramente aparece fora de cenários de alto desempenho):

**S3 Standard**: Para dados acessados com frequência. Baixa latência (milissegundos). Custo mais alto. Sem duração mínima de armazenamento. Use para dados ativos: as fotos de cardápio atuais, os pedidos de hoje, os logs recentes.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Para dados acessados menos de uma vez por mês. A mesma recuperação em milissegundos do Standard, mas custo de armazenamento mais baixo + taxa de recuperação por GB. Duração mínima de armazenamento de 30 dias. Use para dados que você precisa imediatamente quando os acessa, mas raramente faz: recibos de pedidos mais antigos, exportações de analytics de 6 meses atrás.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: Igual ao S3 Standard-IA (incluindo o mínimo de 30 dias) mas armazenado em apenas uma Zona de Disponibilidade (em vez de três). Menos durável (se aquela AZ tem um desastre, os dados podem ser perdidos), mas 20% mais barato. Use para dados que podem ser recriados se perdidos: cache de thumbnails, saídas temporárias de processamento.

**S3 Glacier Instant Retrieval**: Dados arquivados que você precisa ocasionalmente. Recuperação em milissegundos. Custo de armazenamento muito baixo, custo de recuperação por GB mais alto. Mínimo de 90 dias de armazenamento. Use para dados acessados uma vez por trimestre ou menos: relatórios de conformidade trimestrais, snapshots de backup de 12 meses atrás.

**S3 Glacier Flexible Retrieval**: Arquivo profundo, recuperado em minutos a horas. Custo mais baixo que o Glacier Instant Retrieval. Use para dados de arquivo com menos urgência.

**S3 Glacier Deep Archive**: A opção de menor custo. Recuperado em 12 horas. Mínimo de 180 dias de armazenamento. Use para dados que devem ser mantidos por conformidade regulatória mas que nunca se espera que sejam acessados: registros fiscais de 7 anos, logs de auditoria de 10 anos.

O padrão: à medida que a frequência de acesso diminui, o custo diminui mas o tempo de recuperação aumenta (e o custo por recuperação aumenta). Escolha a classe que combina com o seu padrão de acesso.

**Políticas de Ciclo de Vida do S3: O Sistema de Arquivamento Automatizado**

Mover arquivos manualmente entre classes de armazenamento é propenso a erros e demorado. As **políticas de ciclo de vida (lifecycle policies)** do S3 automatizam isso com base em regras que você define.

Uma regra de ciclo de vida tem dois componentes:

**Filtro**: A quais objetos a regra se aplica (todos os objetos, objetos com um prefixo específico, objetos com tags específicas).

**Ações**: O que fazer, depois de quantos dias.

Exemplo de política de ciclo de vida para os recibos de pedidos da Nimbus:

```
Transition to S3 Standard-IA after 90 days
Transition to S3 Glacier Instant Retrieval after 365 days
Transition to S3 Glacier Flexible Retrieval after 540 days (18 months)
Transition to S3 Glacier Deep Archive after 2555 days (7 years)
Delete after 2920 days (8 years)
```

Esta única política garante:

- Recibos ativos (< 90 dias): S3 Standard, acesso rápido
- Recibos recentes (90-365 dias): Standard-IA, barato mas instantaneamente disponível
- Recibos mais antigos (1 ano a 18 meses): Glacier Instant, muito barato, milissegundos quando necessário
- Recibos históricos (18 meses a 7 anos): Glacier Flexible, ainda mais barato — a recuperação leva horas, não milissegundos
- Recibos expirados (> 8 anos): Automaticamente excluídos

Uma pegadinha quase descarrilou o plano. Desde o final de 2024, as regras de ciclo de vida **não
transicionam objetos menores que 128 KB por padrão** — e os recibos da Nimbus
tinham em média 18 KB cada. Para fazer a política de fato movê-los, Leo teve de
sobrescrever o tamanho mínimo de objeto padrão na regra (os filtros de ciclo de vida também podem
selecionar por tamanho com `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). O
padrão existe por um bom motivo: as classes de arquivo cobram ~40 KB de overhead de metadados
por objeto e toda transição custa uma taxa de requisição, então para milhões
de objetos minúsculos a transição pode custar mais do que economiza. Leo fez a conta
para os recibos — com retenção de sete anos, ainda compensava.

Tom revisou a economia projetada: de US$ 847/mês para cerca de US$ 220/mês.

"Só... definindo o que é antigo e para onde deveria ir?" disse ele.

"E o S3 o move automaticamente", confirmou Leo. "Sem cron job. Sem migração manual. Sem esquecimento."

"Espera — mas *por que* o S3 não faz isso por padrão?" perguntou Maya do outro lado da sala. "Por que você precisa definir uma política?"

"Porque 'antigo' é diferente para cada bucket", disse Leo. "Um arquivo de conformidade e um upload de fotos precisam de regras de retenção completamente diferentes. O S3 não pode adivinhar qual é qual."

Você pode estar se perguntando: o que acontece se os dados errados forem movidos para o Glacier e você precisar deles com urgência? Você pagaria uma taxa de recuperação e esperaria — que é por que você deveria testar suas regras de ciclo de vida primeiro em um bucket pequeno e não crítico, e verificar os logs de acesso antes de implementar nos dados de produção. Um erro de recuperação em 18 meses de backups custaria muito menos do que um incidente voltado ao cliente, mas ainda vale a pena testar primeiro.

Se o padrão de acesso dos seus dados é previsível (os logs sempre ficam frios depois de 30 dias), use regras de ciclo de vida explícitas — elas são mais econômicas que a taxa de monitoramento por objeto do Intelligent-Tiering. Se os seus padrões de acesso mudam ao longo do tempo ou são difíceis de prever, use o Intelligent-Tiering — mas esteja ciente de que ele simplesmente ignora objetos menores que 128 KB: eles não são monitorados, não são cobrados pela taxa de monitoramento e nunca deixam a camada Frequent Access.

**S3 Intelligent-Tiering: A Classe Autoorganizada**

E se você não sabe com que frequência vai acessar os seus dados?

O **S3 Intelligent-Tiering** monitora os padrões de acesso de cada objeto e automaticamente o move entre as camadas de acesso:

- **Camada Frequent Access**: Para objetos acessados recentemente
- **Camada Infrequent Access**: Objetos não acessados por 30 dias
- **Camada Archive Instant Access**: Objetos não acessados por 90 dias
- **Camada Archive Access**: Objetos não acessados por 90-730 dias (opcional)
- **Camada Deep Archive Access**: Objetos não acessados por 180-730+ dias (opcional)

O S3 Intelligent-Tiering cobra uma pequena taxa de monitoramento por objeto por mês (US$ 0,0025 por 1.000 objetos), mas nenhuma taxa de recuperação para as camadas Frequent e Infrequent.

Use o Intelligent-Tiering quando:

- Os padrões de acesso são imprevisíveis ou mudam ao longo do tempo
- Você tem uma mistura de dados quentes e frios que não consegue classificar facilmente
- Você tem objetos maiores que 128KB (objetos menores não são monitorados nem auto-tierizados de forma alguma)

Use classes de armazenamento explícitas (com políticas de ciclo de vida) quando:

- Os padrões de acesso são previsíveis
- Você quer que todo objeto — incluindo os pequenos — de fato se mova para classes mais baratas
- Os objetos são pequenos (< 128KB)

A ressalva dos arquivos pequenos merece ênfase. A Nimbus tinha 2,3 milhões de objetos de recibos de pedidos no S3 — cada um era um pequeno arquivo JSON, com média de cerca de 18KB. Tom inicialmente tinha considerado o Intelligent-Tiering para o bucket de recibos, até ler as letras miúdas.

Objetos menores que 128KB **não são monitorados e não são auto-tierizados** no Intelligent-Tiering. Eles não pagam a taxa de monitoramento (US$ 0,0025 por 1.000 objetos por mês) — mas também nunca se movem: ficam na camada Frequent Access, a preços equivalentes ao Standard, para sempre.

Então, para os recibos de 18KB, o Intelligent-Tiering não teria custado nada extra à Nimbus — ele simplesmente não teria *feito* nada. 2,3 milhões de recibos frios teriam continuado pagando preços de armazenamento quente (US$ 0,023/GB) indefinidamente, enquanto as camadas Archive (US$ 0,00099/GB) ficavam fora de alcance.

"Então o Intelligent-Tiering é projetado para objetos grandes", disse Maya.

"Ou para cargas de trabalho onde você genuinamente não conhece o padrão de acesso", disse Tom. "Para um bucket de arquivos minúsculos onde sabemos que os recibos ficam quentes por 90 dias e frios depois disso, uma regra de ciclo de vida explícita — com a sobrescrita de objeto pequeno de antes — é a única coisa que de fato os move."

O Intelligent-Tiering é um serviço excelente. Ele apenas não é a ferramenta certa para todo bucket: abaixo do limite de 128KB ele é inofensivo mas inútil, e somente regras de ciclo de vida explícitas (com uma sobrescrita de tamanho) tierizarão objetos pequenos.

**Quando Você Realmente Precisa dos Dados de Volta: Uma História de Recuperação do Glacier**

Três meses depois de as políticas de ciclo de vida serem implantadas, a Nimbus recebeu uma notificação jurídica. Um ex-parceiro de restaurante estava contestando uma cláusula de contrato, e os advogados da Nimbus precisavam de 18 meses de registros de pedidos daquele parceiro — tudo desde a abertura até o encerramento do contrato.

"E se alguém tentar invadir pelo processo de descoberta jurídica?" disse Priya. Ela não estava brincando. "Advogados solicitando exportações de dados em massa é um vetor comum de engenharia social. Verifique se a solicitação é legítima antes de abrir qualquer armazenamento de dados."

A solicitação era legítima. Os registros estavam no S3, em três classes de armazenamento: os 90 dias mais recentes em Standard-IA, o ano anterior em Glacier Instant Retrieval, o restante em Glacier Flexible Retrieval (a política de ciclo de vida tinha usado Flexible para dados com mais de 18 meses).

Os registros do Glacier Instant estavam imediatamente disponíveis. Leo filtrou por ID de restaurante, rodou uma consulta Athena para identificar os registros de pedidos correspondentes e os exportou para um local seguro no S3. Cinco minutos de trabalho.

Os registros do Glacier Flexible exigiram uma solicitação de restauração:

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **camada Standard**: 3-5 horas. Os registros estariam disponíveis como uma cópia temporária no S3 Standard por 7 dias, depois automaticamente removidos. A cópia arquivada original permanece no Glacier.

Custo da recuperação inteira: US$ 0,01 por GB recuperado na camada Standard, para 4,2 GB de registros arquivados. Cerca de quatro centavos. (A camada Expedited — 1 a 5 minutos — custa US$ 0,03 por GB, mas sua disponibilidade não é garantida da forma como a Standard é.)

"Quatro centavos", disse Maya, quando Leo reportou. "Por 18 meses de registros."

"Armazenamos 4,2GB a US$ 0,0036 por GB por mês por um ano e meio", disse Leo. "O custo de armazenamento foi de cerca de vinte e sete centavos no total. O custo de recuperação foi de quatro. Versus um dólar e setenta e quatro se tivéssemos mantido no S3 Standard por 18 meses."

"E a única coisa que importou", disse Priya, "foi que lembramos que estava em Flexible Retrieval e planejamos para a espera de 3-5 horas. Se os advogados precisassem disso em 30 minutos, teríamos tido um problema."

Esta é a lição operacional importante sobre o Glacier: não é apenas uma decisão de custo, é uma decisão de SLA de recuperação. Antes de arquivar dados no Glacier Flexible ou Deep Archive, documente o tempo de recuperação para qualquer um que possa precisar deles. "Os dados existem" e "podemos obtê-los em 30 minutos" são duas garantias diferentes.

**Multipart Upload: Para Objetos Grandes**

O S3 tem um limite de 5GB para upload único. Para objetos maiores, você deve usar o **multipart upload**: dividir o objeto em partes, fazer upload de cada uma em paralelo, e o S3 as monta.

Benefícios:

- Uploads mais rápidos (paralelos)
- Pode retomar uploads com falha (apenas reenviar as partes com falha)
- Obrigatório para objetos > 5GB

Dica de regra de ciclo de vida: Defina uma regra de ciclo de vida para excluir multipart uploads incompletos após 7 dias. Se um upload falha no meio e não é limpo, essas partes parciais são armazenadas e cobradas — sem um objeto montado para mostrar em troca.

Tom apreciou enormemente essa dica.

Ele rodou o comando do AWS CLI para listar os multipart uploads incompletos em todos os buckets da Nimbus:

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

A saída foi mais longa do que ele esperava. Ele a passou por um contador.

340 uploads incompletos. O mais antigo era de 8 meses atrás — o teste de carga de Leo do fluxo de upload de fotos de restaurante. O teste de carga tinha gerado centenas de uploads parciais, nenhum dos quais tinha sido concluído (o teste não tinha sido projetado para concluí-los, apenas para testar o endpoint de inicialização). 340 uploads incompletos, parados no S3, cada um representando dados parciais que a AWS estava armazenando e cobrando.

"Quanto isso custa por mês?" disse Tom. Ele não estava pedindo informação. Estava calculando em voz alta.

O tamanho combinado das partes incompletas: 48 GB. A US$ 0,023/GB: US$ 1,10/mês. Por oito meses: US$ 8,80 já gastos.

Na taxa de crescimento atual, se não fossem limpos: continuando indefinidamente.

"Leo", disse Tom.

"Eu já implantei — ah", disse Leo, chegando perto. "O teste de carga. Esqueci de limpar os uploads parciais."

"Oito meses atrás."

"Eu não sabia que o S3 armazena as partes mesmo se o upload nunca for concluído."

"Ele as armazena. Ele as cobra. E não há painel avisando você sobre isso. Elas simplesmente se acumulam."

A correção: uma regra de ciclo de vida para excluir as partes de multipart upload incompletas após 7 dias.

```
Rule: Delete incomplete multipart upload parts
Prefix: (all objects)
Action: Delete incomplete multipart uploads after 7 days
```

Os 340 uploads existentes foram limpos manualmente. A regra de ciclo de vida garante que nenhum teste de carga ou upload com falha futuro se acumule da mesma forma. Os US$ 1,10/mês que vinham se acumulando silenciosamente por oito meses pararam — pequeno em dólares, mas o padrão (invisível, crescente, sem teto) era a parte que valia a pena matar.

"A regra tem três linhas", disse Tom. "Eu deveria tê-la definido em todo bucket na criação." Ele atualizou o checklist de criação de buckets: todo novo bucket S3 recebe uma regra de limpeza de multipart upload por padrão.

**Três Camadas de Segurança: Uma Recapitulação Rápida Antes do Desvio**

"E se alguém tentar invadir e excluir os logs de auditoria?" perguntou Priya de novo — desta vez no contexto de um modelo de ameaça específico. "Não apenas uma regra de ciclo de vida mal configurada. Um insider malicioso. Uma chave IAM comprometida com acesso de escrita."

A equipe já tinha as respostas — apenas não as tinha aplicado a este bucket. Três camadas, cada uma coberta antes no livro, cada uma abordando um vetor de ameaça diferente:

O **versionamento** (capítulo 5) torna as exclusões reversíveis — um DELETE se torna um marcador de exclusão, e as versões anteriores permanecem restauráveis. Para dados gravados uma vez como os recibos de pedidos, o overhead de armazenamento é mínimo: só existe uma versão por objeto.

O **S3 Object Lock** (capítulo 5) torna os objetos verdadeiramente imutáveis — armazenamento WORM que nem uma chave de admin pode excluir durante o período de retenção. Para os recibos, com seu requisito de retenção fiscal de 7 anos, a equipe escolheu o modo Compliance: nenhuma má configuração de ciclo de vida, nenhum erro de IAM, nenhuma credencial comprometida pode removê-los antes de o auditor pedir. E o Object Lock coexiste com as transições de ciclo de vida — uma regra movendo os recibos para o Glacier Deep Archive ainda funciona; os dados ficam mais baratos e permanecem imutáveis.

Os **eventos de dados do S3 no CloudTrail** (capítulos 16-17) dizem o que aconteceu com os dados: cada GET, PUT, DELETE e COPY registrado com quem, de onde e quando — a matéria-prima que o GuardDuty (capítulo 17) usa para alertar sobre anomalias.

"Versionamento para recuperação de acidentes. Object Lock para imutabilidade de conformidade. CloudTrail para forense", resumiu Priya. "Cobrimos cada um deles por conta própria. A nova decisão de hoje é ligar os três para este bucket."

**Replicação Inter-Região: Registros de Pedidos como Recuperação de Desastres**

O bucket de recibos de pedidos da Nimbus estava em us-west-2. Isso era intencional — us-west-2 é onde a aplicação rodava. Mas "a aplicação está em us-west-2" e "todos os registros de pedidos estão apenas em us-west-2" são perfis de risco diferentes.

Se a Nimbus precisasse ativar um site de recuperação de desastres em us-east-1, os registros de pedidos precisariam estar lá também. Esperar para copiá-los no meio de uma falha regional não é um plano de recuperação.

Priya recomendou a **Cross-Region Replication (CRR)** para o bucket de recibos de pedidos. A regra:

```
Source: nimbus-order-receipts (us-west-2)
Destination: nimbus-order-receipts-dr (us-east-1)
Replication: All objects
Storage class in destination: S3 Standard-IA (cheaper — this is the DR copy, rarely accessed)
```

A mecânica era familiar do capítulo 5: replicação assíncrona de novas gravações (a maioria dos objetos em até 15 minutos; um SLA garantido exige pagar pelo **S3 Replication Time Control**), versionamento obrigatório em ambos os buckets, uma função IAM com permissão de ler-origem/escrever-destino. O detalhe que vale a pena notar na regra acima: o destino usa uma *classe de armazenamento diferente* da origem — Standard-IA para a cópia de DR, em vez de pagar por uma segunda cópia Standard que é raramente lida. E o pré-requisito de versionamento não custou nada extra — eles já estavam habilitando o versionamento para recuperação de acidentes. (A irmã da CRR, a **Same-Region Replication (SRR)**, copia objetos entre buckets na *mesma* região — útil para uma cópia de conformidade em uma conta separada, agregação de logs ou ambientes de teste alimentados com dados de produção.)

Uma pegadinha que Priya apontou antes de alguém esbarrar nela: a replicação **não é retroativa**. Objetos que já existem no bucket quando você habilita a regra não são replicados — apenas as novas gravações. As equipes habilitam a CRR esperando que todos os seus dados existentes apareçam no destino, depois descobrem que o bucket de DR está quase vazio. Para objetos pré-existentes, você roda a **S3 Batch Replication**, uma operação separada que aplica as regras de replicação aos objetos que já estavam lá. A Nimbus a rodou uma vez para alimentar o bucket de DR com os 0,8 TB de recibos existentes.

"E os marcadores de exclusão?" perguntou Priya. "Se alguém exclui um recibo em us-west-2, isso replica a exclusão para us-east-1?"

Por padrão, não — nas configurações de replicação atuais (o esquema V2 que o console cria), **os marcadores de exclusão não são replicados**. Alguém exclui um recibo em us-west-2, e a cópia em us-east-1 continua servindo-o como se nada tivesse acontecido. Se você *quer* que o bucket de DR espelhe as exclusões, você habilita a replicação de marcadores de exclusão explicitamente na regra (não suportado em regras com filtros de tag) — esse era o padrão no esquema legado V1, que material mais antigo ainda descreve. De qualquer forma, as expirações de ciclo de vida nunca replicam seus marcadores de exclusão.

A replicação ainda *não* é uma solução de backup, no entanto — pelos motivos opostos: ela não protege contra exclusões permanentes de versões ou sobrescritas maliciosas replicando para o espelho, e não tem semântica de retenção. Para um backup verdadeiro, combine versionamento com Object Lock, ou use o AWS Backup.

"Quanto isso custa por mês?" perguntou Tom.

Armazenamento de 0,8 TB em S3 Standard-IA em us-east-1: US$ 10,00/mês. Mais a transferência de dados de replicação (cobrada por GB transferido entre regiões): mínima no volume de gravação atual deles. Custo adicional total: cerca de US$ 10-11/mês por uma cópia inter-região completa de todos os registros de pedidos.

Tom anotou isso sem reclamar.

**S3 Storage Lens: Vendo o Quadro Completo**

Tom tinha feito sua auditoria manualmente — abrindo o console da AWS bucket por bucket, rodando comandos do AWS CLI para contar objetos, verificando o billing explorer para custos de armazenamento por bucket. Tinha levado a maior parte de uma tarde para construir aquela planilha.

O **S3 Storage Lens** é a ferramenta da AWS que substitui esse processo manual. Ele fornece visibilidade de toda a organização sobre o uso e a atividade do S3 em todos os buckets, todas as contas e todas as regiões — em um único painel.

As métricas que mais importam para a otimização de custos:

**Bytes de versões não atuais**: Quanto armazenamento é consumido por versões mais antigas (quando o versionamento está habilitado). O versionamento é essencial para a segurança, mas se um documento é atualizado com frequência, as versões mais antigas se acumulam. Uma regra de ciclo de vida para expirar versões não atuais após 30 dias previne o inchaço de versões.

**Bytes de multipart uploads incompletos**: Exatamente o problema que Leo tinha causado com o teste de carga, exposto automaticamente. Sem o Storage Lens, Tom tinha de saber procurar por multipart uploads incompletos. Com o Storage Lens, eles aparecem no painel como um item de linha.

**% de requisições retornando 403**: Um pico em respostas 403 (Forbidden) em um bucket que deveria ser publicamente acessível pode indicar uma política de bucket mal configurada. Um pico em um bucket privado pode indicar uma tentativa de varredura ou sondagem. De qualquer forma, é um sinal que vale a pena investigar.

**Tamanho médio de objeto**: Um bucket de objetos minúsculos (média de 2KB) se comporta de forma diferente de um bucket de objetos grandes (média de 50MB) em termos de economia do Intelligent-Tiering, custos de requisição e desempenho de consulta para o Athena.

O S3 Storage Lens tem uma camada gratuita que cobre as métricas essenciais. As métricas avançadas (estatísticas de requisição, grupos de lens para filtragem) têm um custo adicional por milhão de objetos por mês — pequeno em relação à economia que ele possibilita.

"Por que não usamos isso desde o começo?" perguntou Maya.

"Não tínhamos 4,2 terabytes desde o começo", disse Tom. "Em escala pequena, uma planilha funciona. Nesta escala, a própria escala se torna um argumento para a ferramenta."

Este é um tema recorrente na arquitetura da Nimbus: a ferramenta certa para uma dada escala nem sempre é a ferramenta certa para a próxima escala. O S3 Storage Lens vale a pena configurar assim que o seu uso do S3 cresce além do que você consegue auditar manualmente em uma tarde — que é mais ou menos quando a economia que ele possibilita começa a exceder de forma significativa o tempo que ele economiza.

## Pontos Fortes e Limitações

**Por que as camadas de armazenamento do S3 importam**:

- Redução de custo significativa sem sacrificar durabilidade ou disponibilidade para o que é de fato acessado
- As políticas de ciclo de vida automatizam o processo inteiro — sem fardo operacional
- O S3 Intelligent-Tiering remove a necessidade de prever padrões de acesso

**Onde fica complicado**:

- As cobranças de duração mínima de armazenamento se aplicam às classes Glacier (90 dias para Glacier Instant, 180 dias para Deep Archive) — excluir cedo ainda incorre na cobrança mínima
- As taxas de recuperação podem surpreender você se você acessa dados arquivados com frequência
- As transições de ciclo de vida levam tempo — os objetos não são movidos instantaneamente após a regra disparar
- O Intelligent-Tiering ignora objetos abaixo de 128KB — sem taxa, mas sem tierização também; e as regras de ciclo de vida os pulam por padrão a menos que você sobrescreva o tamanho mínimo de objeto

## Resumo

A automação de workflows do capítulo 22 otimizou como a Nimbus processa requisições. Este capítulo otimiza o que a Nimbus paga por dados que ela mantém mas não acessa. O princípio é o mesmo: pare de pagar pela camada errada.

- O S3 tem oito classes de armazenamento: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — mais o Express One Zone (baixa latência especializada, AZ única).
- As **políticas de ciclo de vida** automatizam as transições entre classes de armazenamento com base na idade — defina uma vez, o S3 cuida disso para sempre.
- O **S3 Intelligent-Tiering** move automaticamente os objetos entre camadas com base nos padrões de acesso reais — use para cargas de trabalho imprevisíveis com objetos maiores que 128KB. Objetos menores não são monitorados nem auto-tierizados (e não pagam taxa de monitoramento) — eles ficam na camada Frequent Access.
- A **recuperação do Glacier** exige uma solicitação de restauração para as camadas Flexible e Deep Archive. Planeje o tempo de recuperação (minutos a 12 horas) antes de arquivar qualquer dado com um SLA de recuperação.
- Os **multipart uploads incompletos** se acumulam silenciosamente e incorrem em cobranças de armazenamento. Adicione uma regra de ciclo de vida para excluir as partes incompletas após 7 dias em todo bucket.
- **Três camadas de segurança**: versionamento (exclusões reversíveis), Object Lock (imutabilidade para conformidade), eventos de dados do CloudTrail (forense e detecção de anomalias).
- **Cross-Region Replication (CRR)**: replique os registros de pedidos para uma região de DR automaticamente. Exige versionamento em ambos os buckets. Configure se os marcadores de exclusão replicam com base em se a cópia de DR é um espelho ou um backup.
- O **multipart upload** é obrigatório para objetos > 5GB e recomendado para qualquer coisa > 100MB.
- O **S3 Object Lock** fornece armazenamento WORM para cenários de conformidade — o modo Governance pode ser sobrescrito por admins; o modo Compliance não pode ser sobrescrito por ninguém.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas Otimizadas em Custo (Domínio 4, Tarefa 4.1)*

- **Sinais de seleção de classe de armazenamento**:
  - "Acessado com frequência" → Standard
  - "Acessado uma vez por mês, precisa de recuperação instantânea" → Standard-IA
  - "Pode tolerar horas de tempo de recuperação, raramente acessado" → Glacier Flexible Retrieval
  - "Conformidade regulatória, retenção de 7+ anos, nunca acessado" → Glacier Deep Archive
  - "Padrões de acesso desconhecidos ou em mudança" → Intelligent-Tiering
- **Padrões de exame de política de ciclo de vida**: "reduzir automaticamente os custos de armazenamento à medida que os dados envelhecem", "transicionar para arquivo após 90 dias" → políticas de ciclo de vida.
- **Intelligent-Tiering e objetos pequenos**: objetos abaixo de 128KB não são monitorados, não pagam taxa de monitoramento e nunca são auto-tierizados — eles ficam em Frequent Access. As regras de ciclo de vida também pulam objetos abaixo de 128KB por padrão (sobrescrevível). O exame pode testar qualquer um dos fatos.
- **Requisitos da CRR**: O versionamento deve estar habilitado em ambos os buckets de origem e destino. A origem e o destino devem estar em regiões diferentes.
- **S3 Object Lock**: "WORM", "imutável", "SEC 17a-4", "não pode ser excluído ou modificado" → Object Lock. Modo Governance (pode ser sobrescrito por admins). Modo Compliance (não pode ser sobrescrito por ninguém, incluindo o root).
- **Restauração do Glacier**: Os objetos no Glacier não estão imediatamente disponíveis. Você deve "restaurar" uma cópia para o S3 Standard para acesso. A cópia restaurada é temporária (você define a duração). O original permanece no Glacier.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre o S3 Standard-IA e o S3 Glacier Instant Retrieval. Qual padrão de acesso torna cada um apropriado?

*(Dica: Pense em quão frequentemente você acessaria os dados e quão rapidamente você precisa deles quando os acessa.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa gera 500GB de logs de aplicação diariamente. Os logs são fortemente consultados nos primeiros 7 dias (depuração e monitoramento). Após 7 dias, os logs são raramente acessados mas devem estar disponíveis em até 30 minutos se necessário. Após 1 ano, os logs devem ser retidos para conformidade mas nunca são acessados. A empresa precisa minimizar os custos de armazenamento ao mesmo tempo em que atende a esses requisitos.

Qual política de ciclo de vida do S3 MELHOR atende a esses requisitos?

A) Armazenar no S3 Standard por 7 dias; transicionar para o S3 Glacier Deep Archive após 7 dias; expirar após 365 dias  
B) Armazenar no S3 Standard por 7 dias; transicionar para o S3 Standard-IA após 7 dias; transicionar para o S3 Glacier Flexible Retrieval após 365 dias  
C) Armazenar todos os logs no S3 Intelligent-Tiering a partir do dia 1  
D) Armazenar no S3 Standard por 7 dias; transicionar para o S3 Glacier Instant Retrieval após 7 dias; transicionar para o S3 Glacier Deep Archive após 365 dias

**Dica 1**: "Disponível em até 30 minutos" exclui qual classe de armazenamento?

**Dica 2**: O Deep Archive leva 12 horas para recuperar — não atende ao requisito de 30 minutos para os dias 7-365.

**Dica 3**: Após 365 dias, o tempo de recuperação não importa (nunca acessado), então a opção mais barata se aplica.

**Resposta**: D

**Explicação**: O S3 Standard por 7 dias lida com o acesso frequente. O Glacier Instant Retrieval fornece acesso em milissegundos para os dias 7-365 — atendendo ao requisito de 30 minutos a um custo significativamente menor que o Standard-IA. Após 365 dias, o Glacier Deep Archive é a opção mais barata para dados que nunca são acessados.

**Por que não A?** O Glacier Deep Archive leva 12 horas para recuperar — não atende ao requisito de "disponibilidade em 30 minutos" para os dias 7-365.

**Por que não B?** O Standard-IA não pode sequer ser a primeira parada aqui: o S3 exige que os objetos envelheçam 30 dias no Standard antes que uma regra de ciclo de vida possa transicioná-los para Standard-IA ou One Zone-IA — então "Standard-IA após 7 dias" é uma regra inválida. (A regra de 30 dias não se aplica às classes Glacier, que é exatamente por que D funciona.) E mesmo deixando isso de lado, o Glacier Instant Retrieval é significativamente mais barato para dados raramente acessados após o dia 7.

**Por que não C?** O Intelligent-Tiering tem uma taxa de monitoramento por objeto e pode não mover os logs para as camadas de arquivo de forma tão agressiva quanto as regras de ciclo de vida explícitas. Para um grande volume de logs com um padrão de acesso previsível, as regras de ciclo de vida explícitas são mais econômicas.

*Domínio SAA-C03: Projetar Arquiteturas Otimizadas em Custo — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus tem três tipos de dados no S3 com características diferentes:

- Fotos de restaurantes: carregadas uma vez, acessadas muitas vezes pelos clientes, nunca excluídas
- Recibos de pedidos: acessados pelos clientes no primeiro mês, mantidos por 7 anos para fins fiscais
- Exportações de analytics: geradas diariamente, analisadas na semana seguinte, mantidas por 2 anos

Projete uma política de ciclo de vida para cada um. Para as fotos de restaurantes, o Intelligent-Tiering faria sentido? Para os recibos de pedidos, qual classe de armazenamento cobre a janela de 1 mês a 7 anos? Para as exportações de analytics, como você estruturaria o bucket para aplicar políticas diferentes a prefixos diferentes?

*(Não há uma resposta única correta. O objetivo é praticar a seleção de camadas de armazenamento para dados do mundo real.)*

## Cena Pós-Créditos

Tom implementou as políticas de ciclo de vida.

Leo tinha ajudado a configurar a primeira regra. "Vai ficar tudo bem", ele tinha dito. "A duração mínima de armazenamento só se aplica se excluirmos cedo — e não estamos excluindo nada." Ele verificou os requisitos de duração mínima do Glacier no meio do caminho. "Na verdade, deixa eu reler isto."

Em um bucket diferente — as exportações de staging de analytics temporárias — ele quase combinou uma transição de 30 dias para o Glacier Instant Retrieval com uma regra de expiração de 60 dias. A duração mínima de armazenamento para o Glacier Instant é de 90 dias: aqueles objetos teriam entrado no Glacier no dia 30 e sido excluídos no dia 60, e o S3 ainda teria cobrado os 90 dias completos por cada um deles — pagando preços de arquivo por armazenamento que não existia mais. Ele descartou a transição para o Glacier para aquele bucket inteiramente; dados excluídos no dia 60 nunca vivem o suficiente para amortizar um mínimo de 90 dias. A política dos recibos estava segura como projetada: transição para Standard-IA no dia 90, Glacier Instant Retrieval no dia 365, Glacier Flexible Retrieval no dia 540, Glacier Deep Archive no dia 2.555.

Ele também definiu a regra de limpeza de multipart upload em todo bucket. Não porque havia mais uploads abandonados — não havia —, mas porque haveria. Testes de carga acontecem. Implantações falham no meio. A regra era mais barata do que a memória necessária para lembrar de limpar manualmente.

A conta do S3 caiu de US$ 847 para US$ 198 no mês seguinte.

Ele imprimiu a comparação e a colocou na mesa de Maya sem dizer nada.

Maya olhou para ela. Depois para a data. Depois para Tom.

"Três semanas", disse ela.

"Uma tarde para projetar as políticas", disse ele. "Uma hora para implementá-las. Três semanas para ver o primeiro ciclo de faturamento completo."

"Três quartos de redução nos custos do S3."

"Para dados que não acessamos."

"E a replicação inter-região?" perguntou Leo.

"Dez dólares por mês a mais", disse Tom. "Por uma cópia completa de cada recibo de pedido em uma segunda região."

"Essa é a decisão de recuperação de desastres mais barata que tomamos."

Maya olhou os números de novo.

"Tom", disse ela, "quero que você faça esta revisão para cada serviço da AWS que usamos. Armazenamento, computação, rede. Encontre o desperdício."

Ele já estava de volta à sua mesa.

"Comecei semana passada", disse ele.

No próximo capítulo: a camada de banco de dados tem sua própria versão desta conversa, e o Aurora é a resposta de que Tom não esperava gostar.
