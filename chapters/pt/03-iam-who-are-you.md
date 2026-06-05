# Capítulo 3: Quem É Você, Exactamente?

Leo clicou em Implantar.

O terminal devolveu duas palavras: Acesso Negado.

Tentou novamente. Mesmo resultado. Tinha estado a trabalhar na Nimbus durante três semanas, tinha
recebido acesso à conta AWS no primeiro dia e tinha estado a implantar no ambiente de
desenvolvimento sem qualquer problema. Mas isto era produção. E produção,
aparentemente, era diferente.

Maya olhou por cima do ombro para a mensagem de erro. "Quem lhe deu essa permissão?"

Leo virou-se. "Que permissão?"

"A permissão para implantar em produção. Quem configurou isso?"

Leo abriu a consola AWS e começou a clicar pelos menus. Ninguém o tinha feito. Não havia
política, nem função, nem concessão explícita. Também não havia uma negação explícita — apenas uma
ausência. Ninguém na Nimbus alguma vez se tinha sentado a pensar em quem podia fazer o quê.

Esse era o problema.

**O Problema com as Palavras-Passe**

As palavras-passe são um modelo mau para sistemas informáticos.

Não porque sejam sempre fracas. Mas porque são binárias: ou se tem a palavra-passe
ou não se tem. Se a tiver, pode fazer tudo o que a conta tem permissão para fazer.

Isso está bem para um único utilizador no seu portátil pessoal. É catastrófico para a
infraestrutura cloud de uma empresa.

Considere o que Nimbus precisa de gerir: o servidor web, a base de dados, o armazenamento de ficheiros,
a rede, os alertas de facturação, as contas de utilizadores. Se tudo for protegido por uma palavra-passe —
ou mesmo um conjunto de credenciais — então qualquer pessoa que obtenha essa palavra-passe obtém tudo.

E "tudo" na AWS significa a capacidade de eliminar bases de dados. Lançar servidores que acumulam
uma factura de 50 000 dólares. Exfiltrar cada registo de cliente. Destruir dados de cópia de segurança.

Priya não descreveu isto em termos calmos e abstractos. Descreveu como uma história sobre
uma startup que sofreu uma violação, recebeu uma factura AWS de 80 000 dólares em 24 horas de atacantes a minerar
criptomoedas na sua conta, e fechou três meses depois.

A sala ficou em silêncio.

"Então qual é a alternativa?" perguntou Tom.

**O Conceito: Gestão de Identidade e Acesso**

A alternativa é um sistema onde não dá a toda a gente a mesma chave. Dá a cada
pessoa — e a cada serviço — precisamente o acesso de que precisam. Nada mais, nada menos.

Na AWS, este sistema chama-se **IAM**: Gestão de Identidade e Acesso (Identity and Access Management).

Pense no IAM como o sistema de cartões de acesso num grande edifício de escritórios.

O edifício tem dezenas de andares. A sala de servidores está no 12.º andar. O escritório de finanças
está no 8.º andar. A suite da direcção está no 20.º andar. Cada funcionário tem um cartão, mas
cada cartão só abre as portas que o funcionário precisa de abrir para o seu trabalho. O
estagiário não pode entrar na sala de servidores. O contabilista não pode aceder ao andar executivo fora do horário.

O IAM funciona da mesma forma. Define quem existe (identidades), o que lhe é permitido fazer
(permissões) e aplica essas permissões através de políticas.

**Os Blocos de Construção do IAM**

O IAM tem quatro conceitos centrais. Constroem-se uns sobre os outros.

**Utilizadores** são identidades individuais. Maya tem um utilizador IAM. Tom tem um utilizador IAM.
Cada utilizador tem as suas próprias credenciais — e deve ter apenas as permissões de que
especificamente precisa.

**Grupos** são colecções de utilizadores. Em vez de definir permissões para Maya, Tom,
Priya e Leo individualmente, cria-se um grupo "Programadores" com permissões de programador
e adiciona-se-lhes. Quando uma quinta pessoa se junta, adiciona-se ao grupo e herda imediatamente as permissões correctas.

**Funções** são identidades temporárias que podem ser *assumidas* por algo — uma pessoa, um
serviço ou outra conta AWS. Aprofundaremos as funções no Capítulo 14. Por agora: se
um Utilizador é um funcionário permanente, uma Função é um crachá de visitante. Concede acesso específico
por um tempo ou propósito específico.

**Políticas** são as regras de permissão reais. Uma política é um documento (escrito em JSON
internamente, mas não precisa de memorizar o formato) que diz: "O detentor desta
política tem PERMISSÃO para executar a acção X no recurso Y." Ou "NEGADA a acção Z."

O modelo de avaliação do IAM é: por defeito, tudo é negado. As permissões devem ser
concedidas explicitamente. Se uma política não diz que pode fazer algo, não pode.

**O Princípio do Mínimo Privilégio**

Este é o conceito mais importante em toda a segurança, não apenas no IAM.

**Dê às pessoas e sistemas apenas o acesso de que precisam para fazer o seu trabalho. Nada mais.**

Priya chamou a isto "o princípio do mínimo privilégio". Parece óbvio. Na prática,
a maioria das equipas viola-o constantemente — não maliciosamente, mas por conveniência.

"Podemos simplesmente dar ao Leo acesso de administrador para que possa implantar as coisas mais depressa?"

Não.

"Podemos simplesmente usar a conta raiz para tudo?"

Absolutamente não.

A conta raiz é a chave mestra para toda a sua conta AWS. Pode fazer qualquer coisa,
incluindo fechar a própria conta. Deve criá-la uma vez, configurar autenticação multi-factor,
e depois nunca mais usá-la para trabalho do dia-a-dia.

Priya criou utilizadores IAM separados para toda a gente nessa tarde. Deu ao Leo permissões
para implantar no ambiente de desenvolvimento. Não em produção. Não em facturação. Não em rede.
Apenas implantação.

"Isto parece restritivo," disse Leo.

"É assim que sabe que está certo," respondeu Priya.

**O Que Acontece Quando Erra Nisto**

Três cenários, por ordem de gravidade crescente:

**Cenário 1**: Um funcionário com acesso de administrador sai da empresa. Ninguém desactiva
a sua conta. Três meses depois, ainda tem acesso. Isto acontece constantemente.
O IAM resolve-o: desactiva o utilizador. Instantaneamente, em todo o lado.

**Cenário 2**: O portátil de um programador é comprometido. O atacante encontra credenciais AWS
guardadas num ficheiro de configuração com permissões completas de administrador. Porque as credenciais têm acesso amplo,
o atacante pode fazer tudo: minerar criptomoedas, roubar dados, eliminar cópias de segurança.
Com o mínimo privilégio: as credenciais só funcionam para o seu âmbito limitado. O raio de explosão fica contido.

**Cenário 3**: Uma aplicação mal escrita expõe acidentalmente credenciais AWS nos seus
logs. Se essas credenciais têm acesso amplo, tem uma violação catastrófica. Se têm
acesso restrito — apenas ao bucket S3 específico de que a aplicação precisa — a exposição
é limitada e contida.

O padrão: o acesso deve ter o mínimo de âmbito. Sempre. Não porque desconfie das
suas pessoas, mas porque não pode controlar o que acontece a credenciais comprometidas.

**Autenticação Multi-Factor: O Segundo Fecho**

Mais um conceito antes de fechar o capítulo.

Mesmo com o mínimo privilégio, as credenciais podem ser roubadas. As palavras-passe podem ser adivinhadas,
enviadas por phishing ou expostas. O IAM aborda isto com **Autenticação Multi-Factor (MFA)**.

A MFA requer algo que *sabe* (palavra-passe) mais algo que *tem* (um telemóvel, uma
chave de hardware). Mesmo que um atacante roube a sua palavra-passe, não consegue fazer login sem
ter também o seu telemóvel.

A MFA deve estar activada para cada utilizador IAM. É inegociável para a conta raiz.

Priya passou a tarde a configurá-la para todos.

Tom perguntou se era demasiada fricção. Priya voltou a contar a história da violação.

Tom configurou a MFA imediatamente.

## Pontos Fortes e Limitações

**O IAM é a ferramenta certa para**: controlar quem e o que pode aceder a cada recurso AWS; implementar o mínimo privilégio em utilizadores, serviços e fronteiras entre contas; gerar uma trilha de auditoria de cada chamada API através da integração com CloudTrail; eliminar a necessidade de partilhar credenciais de longa duração entre sistemas.

**Onde o IAM se torna difícil**: As políticas IAM podem crescer até centenas de declarações em dezenas de funções, e depurar um erro "Acesso Negado" requer perceber qual dessas políticas é a efectiva — uma tarefa que é mais difícil do que parece. O erro IAM mais comum não é acesso a menos — é acesso a mais. Políticas com permissões excessivas criadas para "simplesmente funcionar" tornam-se passivos de segurança difíceis de reverter. Escreva a permissão mínima primeiro. Expanda apenas quando algo falhar.

## Resumo

- **IAM** (Gestão de Identidade e Acesso) é a forma como controla quem pode fazer o quê na AWS.
- Os blocos de construção centrais são: **Utilizadores** (indivíduos), **Grupos** (colecções de
  utilizadores), **Funções** (identidades temporárias) e **Políticas** (regras de permissão).
- Por defeito, tudo na AWS é **negado**. As permissões devem ser concedidas explicitamente.
- O **Princípio do Mínimo Privilégio** significa dar a cada identidade apenas o acesso de que
  precisa. Nada mais.
- A **conta raiz** pode fazer tudo, incluindo coisas catastróficas. Bloqueie-a com
  MFA e use-a o menos possível.
- Active **MFA** para cada utilizador IAM. Inegociável.

## Dicas de Exame

*Domínio SAA-C03 1 — Tarefa 1.1 (acesso seguro a recursos AWS)*

- **Tudo é negado por defeito.** Um "Permitir" explícito é obrigatório. Se uma política
  não menciona uma acção, a acção é negada.
- **A Negação Explícita ganha sempre.** Se alguma política na cadeia negar uma acção, essa
  negação não pode ser anulada por um Permitir em qualquer outro lugar da cadeia. Isto apanha muitos
  candidatos desprevenidos.
- **Conta raiz ≠ administrador IAM.** A conta raiz é uma credencial separada do IAM.
  Não pode eliminar a conta raiz. *Pode* (e deve) restringir quando é usada.
- **O IAM é global**, não regional. Os utilizadores, grupos, funções e políticas IAM existem
  em toda a conta AWS, não por Região.
- **As Funções são a forma preferida de conceder acesso a serviços AWS.** Se uma instância EC2
  precisa de aceder ao S3, associa uma Função IAM à instância — não guarda
  credenciais na máquina. Este padrão aparece constantemente no exame.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: qual é a diferença entre um Utilizador IAM, um Grupo e uma Função?
Quando usaria cada um?

*(Sugestão: Pense na analogia do edifício com cartões de acesso — qual é um cartão permanente,
qual é um agrupamento departamental e qual é um crachá de visitante?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa corre uma aplicação web em instâncias EC2 que precisam de ler ficheiros
de um bucket S3. Um programador júnior sugere guardar as chaves de acesso AWS directamente no
código da aplicação nas instâncias EC2. A equipa de segurança objecciona.

Qual é a solução MAIS segura e operacionalmente adequada?

A) Guardar as chaves de acesso em variáveis de ambiente na instância EC2 em vez de no
   código  
B) Criar um utilizador IAM dedicado com permissões de leitura S3 e partilhar as credenciais
   com a equipa de desenvolvimento  
C) Associar uma Função IAM com as permissões de leitura S3 adequadas directamente às instâncias EC2  
D) Usar as credenciais da conta raiz para dar à aplicação acesso completo a todos os recursos AWS

**Sugestão 1**: O problema de guardar credenciais em qualquer lugar na instância é que
as credenciais podem ser expostas. Existe uma forma de dar à instância EC2 acesso sem
usar credenciais de todo?

**Sugestão 2**: A AWS tem um mecanismo pelo qual os serviços podem receber permissões sem
precisar de credenciais estáticas. Como se chama esse mecanismo?

**Sugestão 3**: As Funções IAM podem ser associadas a instâncias EC2. Quando o são, a instância
recebe automaticamente credenciais temporárias rotadas pela AWS. Sem credenciais estáticas necessárias.

**Resposta**: C

**Explicação**: Associar uma Função IAM a uma instância EC2 é o padrão correcto.
A instância obtém automaticamente credenciais temporárias e rotadas através do serviço de metadados EC2. Não existem credenciais de longa duração para expor, rodar ou acidentalmente
confirmar num repositório.

**Por que não A?** As variáveis de ambiente numa instância EC2 ainda podem ser expostas —
através de logs da aplicação, pontos de depuração ou se a instância for comprometida.
As credenciais estáticas são o problema, não a sua localização.

**Por que não B?** Criar um utilizador IAM partilhado e distribuir credenciais a uma equipa
viola o mínimo privilégio e torna a rotação de credenciais um pesadelo. Se uma pessoa
sair, não pode revogar facilmente apenas o seu acesso sem alterar as credenciais partilhadas.

**Por que não D?** Usar credenciais da conta raiz para qualquer aplicação é uma violação grave de segurança.
A conta raiz tem acesso ilimitado e as suas credenciais nunca devem sair do controlo do proprietário da conta.

*Domínio SAA-C03 1 — Tarefa 1.1 (funções IAM, mínimo privilégio)*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a integrar três novos programadores no mês que vem. Cada um precisará de diferentes níveis
de acesso: um trabalha na camada de base de dados, um nos servidores de aplicação, um nos ficheiros estáticos
do frontend. Existe também um pipeline CI/CD que precisa de implantar código.

Projecte uma estrutura IAM para este cenário. Que utilizadores, grupos, funções e políticas
criaria? Qual seria o limite de mínimo privilégio mais importante a impor?

*(Não existe uma resposta única correcta. Pense em minimizar o raio de explosão se alguma
identidade for comprometida.)*

## Cena Pós-Créditos

No final do dia, cada utilizador IAM tinha MFA activada. A conta do Leo tinha sido reduzida
para acesso de nível de programador: implantar no ambiente de desenvolvimento, ler do bucket de configuração partilhado, nada mais.

Tinha tentado, uma vez, aceder à base de dados de produção.

Acesso negado.

"É isto que parece ser de confiança mas não demasiado?" perguntou ele.

"É exactamente isso que parece," disse Priya.

Na manhã seguinte, Tom chegou cedo e encontrou algo que o fez imediatamente chamar a equipa.

Na consola AWS, conseguia ver que o website estava a receber tráfego. Mais do que
esperavam. E o servidor web — o original do Leo — estava a ficar sobrecarregado. Muito sobrecarregado.

"Temos cem utilizadores em simultâneo," disse Tom. "E um servidor."

No próximo capítulo: o primeiro servidor — alugar um computador no centro de dados de outra pessoa.
