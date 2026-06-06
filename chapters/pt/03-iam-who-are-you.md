# Capítulo 3: Quem É Você, Exatamente?

Eram pouco mais de nove da manhã. Leo estava na sua mesa desde as sete, o café já frio ao lado do teclado. O escritório estava quieto — Maya ainda não tinha chegado, Tom estava numa ligação. Lá fora, alguém estava cortando a grama.

Leo digitou o comando mais uma vez.

O terminal retornou duas palavras: Acesso Negado.

A crise de Singapura estava para trás. A região estava corrigida, o servidor estava rodando em us-west-2, e a equipe se sentiu brevemente competente. Esse sentimento durou cerca de quarenta e oito horas antes de o novo problema vir à tona: Leo não conseguia implantar em produção. Ninguém tinha configurado as permissões dele. Ninguém tinha configurado as permissões de ninguém. A conta AWS estava totalmente aberta no nível root e completamente trancada em todo o resto, e ninguém tinha reparado porque ninguém tinha tentado.

"Eu já implantei isso — ah," murmurou Leo, rolando de volta pelo terminal. Ele tinha estado implantando no que achava ser produção por uma semana. Era staging. O ambiente de produção de verdade nunca tinha sido tocado.

Maya olhou por cima do ombro dele para a mensagem de erro. "Quem te deu essa permissão?"

Leo se virou. "Que permissão?"

"A permissão para implantar em produção. Quem configurou isso?"

Leo abriu o console da AWS e começou a clicar pelos menus. Ninguém tinha. Não havia
política, nem função (role), nem concessão explícita. Também não havia uma negação explícita — apenas uma
ausência. Ninguém na Nimbus jamais tinha se sentado e pensado sobre quem podia fazer o quê.

Esse era o problema.

**O Problema com as Senhas**

Senhas são um modelo ruim para sistemas computacionais.

Não porque sejam sempre fracas. Mas porque são binárias: ou você tem a senha
ou não tem. Se você a tem, pode fazer tudo o que a conta tem permissão para fazer.

Isso está bem para um único usuário no seu laptop pessoal. É catastrófico para a
infraestrutura de nuvem de uma empresa.

Considere o que a Nimbus precisa gerenciar: o servidor web, o banco de dados, o armazenamento de arquivos,
a rede, os alertas de cobrança, as contas de usuários. Se tudo for protegido por uma senha —
ou mesmo um conjunto de credenciais — então qualquer pessoa que obtenha essa senha obtém tudo.

E "tudo" na AWS significa a capacidade de excluir bancos de dados. Lançar servidores que acumulam
uma conta de US$ 50.000. Exfiltrar cada registro de cliente. Destruir dados de backup.

Há outro problema além da natureza binária das senhas: senhas são estáticas.
Elas não expiram automaticamente. Frequentemente são reutilizadas entre serviços. São anotadas
em papel. São guardadas em planilhas rotuladas "senhas NÃO COMPARTILHAR". São compartilhadas
mesmo assim, porque a conveniência vence a segurança quando o mecanismo de segurança é atrito.

O problema das "credenciais compartilhadas" não é um defeito de caráter. É um problema de sistemas. Quando
a única forma de conceder a alguém acesso temporário a um sistema é dar a essa pessoa a senha
permanente, as pessoas compartilham senhas. A solução é construir um sistema em que acesso
temporário e escopado seja o padrão — não uma gambiarra que requer esforço heroico.

É isso que o IAM faz. Não apenas "senhas melhores", mas um modelo fundamentalmente diferente
em que o acesso é definido por identidade e política em vez de por quem conhece uma sequência de
caracteres.

Priya não descreveu isso em termos calmos e abstratos. Ela descreveu como uma história.

**A Violação Que Custou US$ 80.000 em Quatro Horas**

Um desenvolvedor em uma startup enviou um script de implantação do GitHub Actions para o repositório público deles. O script continha credenciais da AWS hardcoded como variáveis de ambiente — um erro comum o suficiente para ter sua própria categoria nos post-mortems de segurança em nuvem. As credenciais tinham acesso admin total à conta AWS da empresa, porque alguém as tinha configurado dessa forma seis meses antes para evitar lidar com políticas IAM.

As credenciais ficaram no arquivo por aproximadamente seis minutos antes de um scanner automatizado — rodado por um atacante, não por um pesquisador de segurança — encontrá-las.

O scanner indexou as credenciais, avaliou as permissões da conta e começou a lançar instâncias com GPU em múltiplas regiões. Instâncias com GPU são caras. Elas também são úteis para mineração de criptomoeda. Na primeira hora, quarenta e sete instâncias `p3.8xlarge` estavam rodando em `us-east-1`, `eu-west-1` e `ap-southeast-1`.

Uma `p3.8xlarge` custa cerca de US$ 12 por hora. Quarenta e sete delas custavam US$ 564 por hora.

Quando o alerta de cobrança da startup disparou — configurado em US$ 1.000 por dia, que ninguém tinha pensado em apertar — quatro horas tinham se passado. A conta estava se aproximando de US$ 2.200 e subindo.

Quando alguém entendeu o que estava acontecendo e revogou as credenciais, a conta tinha chegado a US$ 3.400 por aquelas poucas horas. Mas o custo real veio depois: a auditoria revelou que o atacante já vinha minerando havia semanas, silenciosamente, à noite, usando um segundo conjunto de credenciais vazadas que ninguém tinha reparado. Dano total quando a auditoria foi concluída: mais de US$ 80.000.

"E eles fecharam?" perguntou Tom.

"Três meses depois," disse Priya. "Os investidores saíram. A violação foi divulgada. A cobertura da imprensa tornou a captação de recursos impossível."

A sala ficou quieta.

"Então qual é a alternativa?" perguntou Tom.

**O Conceito: Gerenciamento de Identidade e Acesso**

A alternativa é um sistema em que você não dá a mesma chave para todo mundo.

Imagine um prédio de escritórios em que cada andar tem áreas diferentes, e cada funcionário
tem um cartão de acesso que só abre as portas de que ele precisa para o trabalho. O cartão do estagiário
funciona no terceiro andar. O cartão do contador abre o escritório financeiro mas não
a sala de servidores. Ninguém passa por uma porta pela qual não tem motivo para passar.

Esse é o modelo que a AWS usa.

A AWS chama esse sistema de **IAM**: Identity and Access Management (Gerenciamento de Identidade e Acesso).

O IAM é o sistema de cartão de acesso para toda a sua conta de nuvem. Você define quem existe
(identidades), o que essas pessoas têm permissão de fazer (permissões), e aplica essas permissões
através de políticas. O prédio tem dezenas de andares. O IAM garante que cada pessoa só
consiga alcançar os andares de que precisa.

A analogia do cartão de acesso vai além. Em um prédio bem administrado, você sabe a qualquer momento quem tem acesso a quê. Você pode imprimir um relatório: aqui estão os direitos de acesso de cada cartão. Aqui está quem esteve na sala de servidores nos últimos 30 dias. Aqui estão os cartões que não foram usados em 90 dias (um possível indicador do cartão de um funcionário desligado que não foi desativado).

O IAM fornece a mesma visibilidade. Toda ação tomada através do IAM — toda chamada de API, todo login no console, toda concessão de permissão — é registrada no **AWS CloudTrail**. Se você precisa saber quem excluiu um banco de dados às 2h de uma terça-feira, o CloudTrail tem a resposta. Se você precisa demonstrar a um auditor que apenas usuários autorizados tinham acesso aos sistemas de produção, o CloudTrail fornece a evidência.

O AWS CloudTrail mantém automaticamente um histórico de 90 dias de eventos de gerenciamento, legível a partir do console. Mas 90 dias têm o costume de não ser bem suficientes quando sua equipe de segurança precisa auditar algo do trimestre passado. Para registro persistente e de longo prazo — e para alertas — você precisa criar uma **Trail**, que escreve todos os eventos em um bucket do S3 e pode transmitir para o CloudWatch Logs. A Trail não é automática; é algo que você configura uma vez e depois esquece. Até precisar dela.

A combinação dos controles de acesso do IAM e do registro de auditoria do CloudTrail é o que permite que grandes organizações operem contas AWS em escala com confiança: o acesso é definido e aplicado pelo IAM; todo exercício desse acesso é registrado pelo CloudTrail.

**A Analogia do Hospital**

Eis uma segunda forma de pensar sobre isso — uma que torna a hierarquia de acesso mais intuitiva.

Imagine um hospital. Não só o prédio físico, mas toda a estrutura organizacional de pessoas, funções e dados.

O **recepcionista** pode ver agendas de consultas de pacientes e informações de plano de saúde. Pode dar entrada e saída de pacientes. Não pode acessar prontuários médicos, não pode modificar prescrições, não pode visualizar históricos cirúrgicos.

O **enfermeiro** pode acessar prontuários médicos dos pacientes da sua ala. Pode administrar medicações conforme ordem médica. Não pode prescrever medicações. Não pode autorizar cirurgias.

O **médico** pode visualizar e modificar prontuários médicos, escrever prescrições e solicitar exames. Não pode acessar o sistema de folha de pagamento. Não pode modificar as prescrições de outros médicos sem uma autorização específica.

O **cirurgião** pode acessar os sistemas do centro cirúrgico. Ele tem permissões específicas para registros cirúrgicos que a maioria dos médicos não precisa.

A **equipe de limpeza** pode acessar plantas e cronogramas de salas. Não pode acessar nenhum dado de paciente.

Cada pessoa no hospital tem o acesso de que precisa para o trabalho — e somente isso. O recepcionista não tem acesso cirúrgico. A equipe de limpeza não vê prontuários de pacientes. E, crucialmente: se o cartão de acesso de um membro da equipe de limpeza for roubado, o atacante obtém cronogramas de limpeza. Não obtém prontuários de pacientes. O raio de explosão da violação é limitado ao que aquele cartão poderia acessar.

É assim que o IAM funciona. Cada identidade — cada usuário, cada serviço, cada processo automatizado — recebe exatamente as permissões de que precisa. Nada mais.

Tom se recostou. "Então o Leo é o enfermeiro, e eu sou o contador."

"Algo assim," disse Priya. "E nenhum de vocês dois é o cirurgião."

"Quem é o cirurgião?"

"Ninguém, no dia a dia," disse Priya. "A conta root é o cirurgião. Ela só sai para procedimentos específicos e documentados."

**Os Blocos de Construção do IAM**

O IAM tem quatro conceitos centrais. Eles se constroem uns sobre os outros.

**Usuários** são identidades individuais. Maya tem um usuário IAM. Tom tem um usuário IAM.
Cada usuário tem suas próprias credenciais — e deve ter apenas as permissões de que
especificamente precisa.

Um usuário IAM tem dois tipos de credenciais: uma **senha** para acesso ao console (login na interface web da AWS) e **chaves de acesso** (um ID de chave e uma chave secreta) para acesso programático via CLI ou SDKs. Você nem sempre precisa de ambas. Um desenvolvedor que só usa a CLI não precisa de uma senha de console. Um usuário não técnico que só precisa do console não precisa de chaves de acesso. Conceda apenas o necessário.

**Grupos** são coleções de usuários. Em vez de definir permissões para Maya, Tom,
Priya e Leo individualmente, você cria um grupo "Desenvolvedores" com permissões de desenvolvedor
e os adiciona a ele. Quando uma quinta pessoa entra, você a adiciona ao grupo e ela
instantaneamente herda as permissões certas.

O benefício prático dos grupos é a manutenibilidade. Se o grupo "Desenvolvedores" precisa de uma nova permissão — digamos, acesso a um novo bucket do S3 — você a adiciona ao grupo uma vez e todos os desenvolvedores imediatamente a têm. Sem grupos, você atualizaria cada usuário individualmente, o que cria oportunidades para inconsistência e deixa pessoas de fora.

**Funções (Roles)** são identidades temporárias que podem ser *assumidas* por algo — uma pessoa, um
serviço ou outra conta AWS. Vamos a fundo nas funções no Capítulo 14. Por enquanto: se
um Usuário é um funcionário permanente, uma Função é um crachá de visitante. Ela concede acesso específico
por um tempo ou propósito específico.

O uso mais importante de Funções para este capítulo: Funções IAM para instâncias EC2. Quando você anexa uma Função a uma instância EC2, a aplicação rodando naquela instância pode fazer chamadas de API da AWS usando as permissões da Função — sem nenhuma credencial estática armazenada em lugar algum. As credenciais são temporárias, rotacionadas automaticamente pela AWS, e escopadas às políticas da Função. Isso elimina o problema das "credenciais em arquivos de configuração" por completo.

**Políticas** são as regras de permissão de fato. Uma política é um documento (escrito em JSON
internamente, mas você não precisa memorizar o formato) que diz: "O detentor desta
política tem PERMISSÃO para executar a ação X no recurso Y." Ou "NEGADA a ação Z."

A AWS fornece centenas de **políticas gerenciadas** — políticas pré-escritas para casos de uso comuns. `AmazonS3ReadOnlyAccess` concede acesso de leitura a todos os buckets do S3. `AmazonEC2FullAccess` concede controle total do EC2. Para uso em produção, você frequentemente quer **políticas gerenciadas pelo cliente** — políticas que você mesmo escreve, escopadas precisamente aos recursos e ações de que sua aplicação de fato precisa.

O modelo de avaliação do IAM é: por padrão, tudo é negado. As permissões devem ser
explicitamente concedidas. Se uma política não diz que você pode fazer algo, você não pode.

**O Princípio do Menor Privilégio**

Dê às pessoas e aos sistemas apenas o acesso de que precisam para fazer o trabalho. Nada mais.

Priya chamou isso de "o princípio do menor privilégio". Soa óbvio. Na prática,
a maioria das equipes o viola constantemente — não por maldade, mas por conveniência.

"A gente não pode simplesmente dar acesso admin ao Leo para ele implantar coisas mais rápido?"

Não.

"A gente não pode simplesmente usar a conta root para tudo?"

Absolutamente não.

A conta root é a chave-mestra de toda a sua conta AWS. Ela pode fazer qualquer coisa,
inclusive fechar a própria conta. Você deve criá-la uma vez, configurar autenticação
multifator, e então nunca mais usá-la para o trabalho do dia a dia.

Há exatamente um punhado de tarefas que exigem a conta root: alterar o endereço de e-mail da conta, visualizar informações de cobrança que não tenham sido delegadas de outra forma, fechar a conta, e algumas outras operações administrativas que a AWS explicitamente restringe à root. Para todo o resto — criar usuários, implantar infraestrutura, acessar bancos de dados — você usa usuários e funções do IAM. A conta root é para o gerente do prédio. Todos os demais têm cartões de acesso apropriados.

Priya criou usuários IAM separados para todo mundo naquela tarde. Ela deu ao Leo permissões
para implantar no ambiente de desenvolvimento. Não em produção. Não em cobrança. Não em rede.
Apenas implantação.

"Isso parece restritivo," disse Leo.

"É assim que você sabe que está certo," respondeu Priya.

A fronteira desenvolvimento-versus-produção foi a primeira e mais importante linha de menor privilégio que Priya traçou. Os desenvolvedores precisavam se mover rápido em desenvolvimento: criar recursos, testar configurações, cometer erros. Mas produção era diferente. Mudanças em produção precisavam ser deliberadas, revisadas e executadas através de um processo controlado. Dar a um desenvolvedor acesso direto à produção era dar a ele a capacidade de cometer erros de produção na velocidade de desenvolvimento.

Com o tempo, Priya construiu um sistema em que o acesso à produção era concedido temporariamente através de um processo de assunção de função: um desenvolvedor que precisava fazer uma mudança em produção solicitava o acesso, recebia-o por uma janela de 4 horas, fazia a mudança, e o acesso expirava automaticamente. A janela era registrada no CloudTrail. O acesso não podia ser usado depois de expirar. A produção era protegida não negando o acesso permanentemente, mas tornando o acesso limitado no tempo e auditável.

Você pode estar se perguntando: se tudo é negado por padrão, por que a conta root tem acesso total? A conta root é especial — ela contorna o IAM por completo. É precisamente por isso que você a tranca a sete chaves. Toda outra ação na AWS passa pela cadeia de avaliação do IAM, onde um Allow ausente é o mesmo que um Deny.

**Raio de Explosão: Por Que o Menor Privilégio Salva Empresas**

Há um conceito que engenheiros de segurança usam para pensar sobre comprometimento de credenciais: **raio de explosão** (blast radius).

O raio de explosão é o dano máximo que um atacante pode causar se obtiver uma dada credencial.

Um atacante com as credenciais root de uma conta AWS tem raio de explosão ilimitado. Ele pode excluir todos os recursos, exfiltrar cada byte de dado, lançar instâncias com GPU em todas as Regiões, e fechar a conta. A própria credencial não contém limites.

Um atacante com as credenciais IAM do Leo — escopadas para implantar no ambiente de desenvolvimento e ler de um bucket do S3 — tem um raio de explosão minúsculo. Ele pode implantar em dev. Pode ler alguns arquivos. Não pode tocar em produção. Não pode acessar o banco de dados. Não pode ver cobrança. Não pode lançar instâncias com GPU.

A história da violação de antes teve um grande raio de explosão porque as credenciais do desenvolvedor eram de admin. Se essas mesmas credenciais tivessem sido escopadas ao trabalho real dele — implantar em um ambiente específico — o dano teria sido muito menor. O ataque ainda poderia ter acontecido. O resultado teria sido diferente.

É por isso que o menor privilégio não é só política. É arquitetura. Toda permissão que você não concede é raio de explosão que você não tem.

**O Que Acontece Quando Você Erra Isto**

Três cenários, em ordem crescente de gravidade:

**Cenário 1**: Um funcionário com acesso admin sai da empresa. Ninguém desativa
a conta dele. Três meses depois, ele ainda tem acesso. Isso acontece constantemente.
O IAM resolve: você desabilita o usuário. Instantaneamente, em todo lugar.

Este é o modo de falha de IAM mais comum, e é inteiramente evitável. A maioria das organizações
tem um processo para revogar o acesso físico (devolver um crachá, devolver um laptop) mas
ignora o IAM. O checklist de desligamento que inclui "desabilitar o usuário IAM" e
"remover de todos os grupos IAM" não é um desafio complexo de engenharia — é disciplina
de processo. As equipes que fazem isso de forma consistente são as que nunca descobrem o que
acontece quando um ex-funcionário ainda consegue acessar o banco de dados de produção.

**Cenário 2**: O laptop de um desenvolvedor é comprometido. O atacante encontra credenciais da AWS
armazenadas em um arquivo de configuração com permissões admin totais. Como as credenciais têm acesso
amplo, o atacante pode fazer qualquer coisa: minerar criptomoeda, roubar dados, excluir backups.
Com menor privilégio: as credenciais só funcionam para seu escopo limitado. O raio de explosão é contido.

O padrão de credenciais-em-arquivo-de-configuração é mais comum do que deveria. Desenvolvedores
frequentemente armazenam credenciais da AWS em `~/.aws/credentials` para desenvolvimento local — o que
está bem. O problema é quando essas credenciais têm acesso de nível de produção em vez de
serem escopadas a um ambiente de sandbox. Credenciais de desenvolvimento deveriam ser escopadas a um
ambiente de desenvolvimento. O acesso à produção deveria exigir passos explícitos para assumir, não
estar presente em todo laptop o tempo todo.

**Cenário 3**: Uma aplicação mal escrita acidentalmente expõe credenciais da AWS nos seus
logs. Se essas credenciais têm acesso amplo, você tem uma violação catastrófica. Se elas
têm acesso restrito — apenas ao bucket específico do S3 de que a aplicação precisa — a exposição
é limitada e contida.

O cenário de credenciais-de-aplicação-em-logs é sutil. Frequentemente acontece quando código de depuração
registra o contexto completo da requisição — incluindo cabeçalhos de autorização — ou quando um manipulador
de erro serializa todas as variáveis de ambiente (incluindo `AWS_ACCESS_KEY_ID`) para um arquivo
de log. A salvaguarda aqui são as Funções IAM para EC2, que eliminam credenciais estáticas do
ambiente da aplicação por completo. Se não há credenciais estáticas, elas não podem
aparecer nos logs.

O padrão: o acesso deve ser escopado ao mínimo. Sempre. Não porque você desconfia
das suas pessoas, mas porque você não pode controlar o que acontece com credenciais comprometidas.

**Se Acesso Amplo Então Conveniência Mas Exposição**

Há sempre uma tentação de dar às equipes acesso mais amplo do que precisam — isso torna as
implantações mais rápidas, reduz o atrito, evita os momentos de "Acesso Negado" que quebram
o fluxo. Se você dá acesso admin a todo mundo, então as implantações são suaves e ninguém fica
bloqueado — mas quando credenciais vazam (e elas vazam), o atacante herda direitos admin
totais. Um laptop comprometido se torna uma violação completa da conta. Escreva a permissão
mínima primeiro. Expanda apenas quando algo falhar. Essa regra salva empresas.

**Autenticação Multifator: A Segunda Tranca**

Mesmo com menor privilégio, credenciais podem ser roubadas. Senhas podem ser adivinhadas,
obtidas por phishing ou vazadas. O IAM aborda isso com a **Autenticação Multifator (MFA)**.

A MFA exige algo que você *sabe* (senha) mais algo que você *tem* (um telefone, uma
chave de hardware). Mesmo que um atacante roube sua senha, ele não consegue fazer login sem
também ter seu telefone.

A MFA deveria estar habilitada para todo usuário IAM. Ela é inegociável para a conta root.

Priya passou a tarde configurando isso para todo mundo. Não foi tranquilo.

O app autenticador do Leo registrou a conta errada duas vezes. Ele teve que escanear o QR code três vezes porque o relógio do laptop dele estava ligeiramente fora de sincronia, o que fazia os tokens baseados em tempo falharem. Na terceira tentativa, funcionou.

"Tem como fazer isso sem o app?" perguntou Leo, olhando para o telefone.

"Chaves de hardware," disse Priya. "Um dispositivo físico que se conecta ao USB. Mais seguro que o app. Mais caro."

"Quanto mais?"

"Cerca de US$ 50 por chave. Você ia querer duas, caso perca uma."

Tom escreveu "US$ 100 por desenvolvedor" no caderno.

"A gente vai comprá-las," disse Priya. "Para a conta root, no mínimo."

Tom perguntou se era atrito demais no geral. Priya abriu a história da violação de novo.

Tom configurou a MFA imediatamente.

"E se alguém tentar invadir enquanto a gente está no meio dessa transição?" perguntou Priya. "Antes de todo mundo ter MFA habilitada?"

Ninguém tinha uma boa resposta. Ela configurou a MFA para a conta root primeiro, antes de todos os demais.

**IAM Access Analyzer: O Segundo Par de Olhos**

Priya tinha mais uma ferramenta para mostrar à equipe depois que a configuração da MFA estava completa.

"Esta aqui roda automaticamente," disse ela, abrindo uma nova aba do console.

O **IAM Access Analyzer** é um serviço que analisa continuamente suas políticas IAM e sinaliza qualquer coisa que conceda acesso a recursos fora da sua conta — ou fora do que você esperaria.

Ele encontrou algo na primeira execução.

Um bucket do S3 — um que Leo tinha configurado como "temporário" três semanas atrás e depois esquecido — tinha uma política de bucket que permitia acesso público de leitura. O bucket continha alguns arquivos de dados de teste, nada sensível. Mas também continha uma pasta que Leo tinha nomeado `db-backups-staging` e populado com alguns arquivos SQL exportados para testar o processo de importação.

"Tem alguma coisa sensível nesses arquivos SQL?" perguntou Priya.

Leo olhou para o nome da pasta. Depois para os arquivos dentro dela. Depois para o teto.

"Eu exportei o banco de dados de staging," disse ele. "Que tem cópias de dados de clientes da produção inicial."

Priya fechou o laptop devagar.

O bucket foi definido como privado em cinco minutos. O Access Analyzer continuou monitorando qualquer política futura que abrisse recursos inesperadamente.

"Pensa nisso como um alarme de perímetro," disse Priya. "Toda vez que alguém deixa uma porta aberta por acidente, ele nos avisa."

Você pode estar se perguntando: o IAM Access Analyzer substitui a revisão manual de políticas? Não. É uma ferramenta de detecção, não de prevenção. Ela te avisa sobre acesso que foi concedido — não consegue dizer se esse acesso foi intencional. A revisão humana de "essa política estava correta?" ainda precisa acontecer. O Access Analyzer só garante que as janelas abertas não passem despercebidas.

## Pontos Fortes e Limitações

**O IAM é a ferramenta certa para**:

- Controlar quem e o que pode acessar cada recurso da AWS
- Implementar menor privilégio entre usuários, serviços e fronteiras entre contas
- Eliminar a necessidade de compartilhar credenciais de longa duração entre sistemas
- Toda ação IAM é registrada automaticamente, dando a você uma trilha de auditoria de quem fez o quê e quando (coberto no Capítulo 14)
- Acesso entre contas: uma Função IAM na Conta A pode ser assumida por um principal na Conta B, permitindo o compartilhamento controlado de recursos entre contas AWS sem compartilhamento de credenciais

**Onde o IAM fica difícil**: políticas IAM podem crescer até centenas de declarações distribuídas por dezenas de funções, e depurar um erro de "Acesso Negado" exige entender qual dessas políticas é a efetiva — uma tarefa que é mais difícil do que parece. O erro de IAM mais comum não é acesso de menos — é acesso demais. Políticas excessivamente permissivas criadas para "só fazer funcionar" se tornam passivos de segurança dolorosos de reverter depois do fato. Escreva a permissão mínima primeiro. Expanda apenas quando algo falhar.

Há um desafio prático com o IAM em escala: **proliferação de políticas** (policy sprawl). Organizações que rodam a AWS há vários anos frequentemente têm dezenas ou centenas de políticas customizadas, muitas das quais se sobrepõem, algumas das quais nunca são usadas, e algumas das quais se contradizem de formas que ninguém reparou porque as contradições só importam para casos extremos. A AWS fornece o **IAM Access Analyzer** (que introduzimos neste capítulo) e ferramentas de **simulação de política IAM** para ajudar a auditar e racionalizar políticas. Mas a estratégia mais eficaz é construir políticas limpas desde o início e auditar regularmente — em vez de deixar as políticas se acumularem e tentar desemaranhá-las depois.

Priya configurou uma revisão IAM trimestral: listar todas as funções e políticas, verificar quais delas são ativamente usadas via logs do CloudTrail, sinalizar quaisquer credenciais não usadas ou políticas excessivamente amplas para remoção ou restrição. A revisão levava duas horas por trimestre e pegou três problemas de política no seu primeiro ano.

"Não é um trabalho empolgante," disse ela. "Mas revisões de acesso são como você encontra as coisas que teriam sido catastróficas se outra pessoa as tivesse reparado primeiro."

## Resumo

A senha Admin123 era o sintoma. A doença era que a Nimbus não tinha nenhuma estratégia de controle de acesso — uma credencial root compartilhada, sem funções, sem políticas, sem trilha de auditoria. O IAM não só corrige o sintoma; ele força a equipe a responder uma pergunta que vinham evitando: quem, exatamente, tem permissão de fazer o quê? A resposta a essa pergunta é a fundação de toda arquitetura AWS segura.

- O **IAM** (Identity and Access Management) é como você controla quem pode fazer o quê na AWS. Os blocos de construção centrais são: **Usuários**, **Grupos**, **Funções** e **Políticas**.
- Por padrão, tudo na AWS é **negado**. As permissões devem ser explicitamente concedidas.
- O **Princípio do Menor Privilégio** significa dar a cada identidade apenas o acesso de que ela precisa — minimizando o **raio de explosão** se uma credencial for comprometida.
- A **conta root** pode fazer qualquer coisa, inclusive coisas catastróficas. Tranque-a atrás de MFA e use-a o mínimo possível.
- Habilite **MFA** para todo usuário IAM. Inegociável — no exame e em produção.

## Dicas de Exame

*Domínio SAA-C03 1 — Tarefa 1.1 (acesso seguro a recursos da AWS)*

- **Tudo é negado por padrão.** Um "Allow" explícito é necessário. Se uma política
  não menciona uma ação, a ação é negada.
- **Um Deny explícito sempre vence.** Se qualquer política na cadeia nega uma ação, esse
  deny não pode ser sobrescrito por um Allow em qualquer outro lugar da cadeia. Isso pega muitos
  candidatos desprevenidos.
- **Conta root ≠ admin IAM.** A conta root é uma credencial separada do IAM.
  Você não pode excluir a conta root. Você *pode* (e deve) restringir quando ela é usada.
- **O IAM é global**, não regional. Usuários, grupos, funções e políticas do IAM existem
  por toda a conta AWS, não por Região.
- **Funções são a forma preferida de conceder acesso a serviços da AWS.** Se uma instância EC2
  precisa acessar o S3, você anexa uma Função IAM à instância — você não armazena
  credenciais na máquina. Esse padrão aparece constantemente no exame.
- **O IAM Access Analyzer** gera achados quando recursos são acessíveis de fora da conta ou de fora da organização. Quando um cenário de exame menciona detectar acesso externo não intencional ao S3 ou ao KMS, o Access Analyzer é a resposta.
- **MFA para a conta root é obrigatória**, não opcional, no contexto das melhores práticas de segurança da AWS. Questões de exame sobre proteger a conta root sempre incluem MFA como parte da resposta correta.
- **Permission boundaries** (limites de permissão) são um recurso avançado do IAM (coberto no Capítulo 14) que limita as permissões máximas que um usuário ou função IAM pode ter, mesmo que suas políticas concedam mais. Questões de exame sobre "prevenir escalonamento de privilégio" ou "definir um teto máximo de permissão" apontam para permission boundaries.
- **Service Control Policies (SCPs)** são políticas de nível organizacional que restringem o que pode ser feito em contas membros de uma AWS Organization. Elas funcionam acima do nível do IAM — nem mesmo um administrador de conta pode exceder os limites definidos por uma SCP. Quando um cenário de exame envolve governança de segurança multiconta, pense em SCPs.
- **O CloudTrail** registra todas as chamadas de API do IAM. Quando um cenário de exame pergunta "como você auditaria quais usuários fizeram mudanças nas políticas IAM," a resposta é CloudTrail. Toda ação IAM — criar um usuário, modificar uma política, assumir uma função — é registrada. O histórico de eventos de 90 dias é automático e gratuito; para retenção de longo prazo e alertas, você deve criar uma Trail que entrega logs a um bucket do S3.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: qual é a diferença entre um Usuário IAM, um Grupo e uma Função?
Quando você usaria cada um?

*(Dica: Pense na analogia do prédio com cartões de acesso — qual é um cartão permanente,
qual é um agrupamento de departamento, e qual é um crachá de visitante?)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa roda uma aplicação web em instâncias EC2 que precisam ler arquivos
de um bucket do S3. Um desenvolvedor júnior sugere armazenar chaves de acesso da AWS diretamente
no código da aplicação nas instâncias EC2. A equipe de segurança se opõe.

Qual é a solução MAIS segura e operacionalmente apropriada?

A) Armazenar as chaves de acesso em variáveis de ambiente na instância EC2 em vez do
   código  
B) Criar um usuário IAM dedicado com permissões de leitura do S3 e compartilhar as credenciais
   com a equipe de desenvolvimento  
C) Anexar uma Função IAM com as permissões apropriadas de leitura do S3 diretamente às instâncias
   EC2  
D) Usar as credenciais da conta root para dar à aplicação acesso total a todos os recursos
   da AWS

**Dica 1**: O problema de armazenar credenciais em qualquer lugar da instância é que
credenciais podem vazar. Existe uma forma de dar à instância EC2 acesso sem
usar credenciais de jeito nenhum?

**Dica 2**: A AWS tem um mecanismo em que serviços podem receber permissões sem
precisar de credenciais estáticas. Como esse mecanismo se chama?

**Dica 3**: Funções IAM podem ser anexadas a instâncias EC2. Quando são, a instância
automaticamente recebe credenciais temporárias que são rotacionadas pela AWS. Nenhuma credencial
estática necessária.

**Resposta**: C

**Explicação**: Anexar uma Função IAM a uma instância EC2 é o padrão correto.
A instância automaticamente obtém credenciais temporárias e rotativas através do serviço de metadados
do EC2. Não há credenciais de longa duração para vazar, rotacionar ou acidentalmente
fazer commit em um repositório.

**Por que não A?** Variáveis de ambiente em uma instância EC2 ainda podem vazar —
através de logs da aplicação, endpoints de depuração, ou se a instância for comprometida.
Credenciais estáticas são o problema, não a localização delas.

**Por que não B?** Criar um usuário IAM compartilhado e distribuir credenciais para uma equipe
viola o menor privilégio e torna a rotação de credenciais um pesadelo. Se uma pessoa
sai, você não consegue revogar facilmente apenas o acesso dela sem mudar as credenciais compartilhadas.

**Por que não D?** Usar credenciais da conta root para qualquer aplicação é uma violação grave
de segurança. A conta root tem acesso ilimitado e suas credenciais nunca deveriam
sair do controle do dono da conta.

*Domínio SAA-C03 1 — Tarefa 1.1 (funções IAM, menor privilégio)*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está integrando três novos desenvolvedores no próximo mês. Cada um vai precisar de níveis
diferentes de acesso: um trabalha na camada de banco de dados, um nos servidores de aplicação, um
nos arquivos estáticos do front-end. Há também um pipeline de CI/CD que precisa implantar código.

Projete uma estrutura IAM para este cenário. Quais usuários, grupos, funções e políticas
você criaria? Qual seria a fronteira de menor privilégio mais importante a impor?

*(Não há uma única resposta correta. Pense em minimizar o raio de explosão se qualquer
identidade for comprometida.)*

## Cena Pós-Créditos

Ao fim do dia, todo usuário IAM tinha MFA habilitada. A conta do Leo tinha sido reduzida
a acesso de nível de desenvolvedor: implantar no ambiente de dev, ler do bucket de configuração
compartilhado, nada mais.

Ele tinha tentado, uma vez, acessar o banco de dados de produção.

Acesso negado.

"É assim que parece ser confiável mas não confiável demais?" perguntou ele.

"É exatamente assim que parece," disse Priya.

Na manhã seguinte, Tom chegou cedo e encontrou algo que o fez imediatamente chamar
a equipe.

No console da AWS, ele conseguia ver que o site deles estava recebendo tráfego. Mais do que
esperavam. E o servidor web — o original do Leo — estava esquentando. Esquentando muito.

"A gente tem cem usuários simultâneos," disse Tom. "E um servidor."

No próximo capítulo: o primeiro servidor — alugando um computador no centro de dados de outra pessoa.
