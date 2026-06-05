# Capítulo 14: Quem Tem Permissão Para Fazer O Quê

Tom tinha as chaves de acesso abertas num ficheiro de texto, prontas para colar.

"O que está a fazer?" perguntou Priya.

"A instância EC2 precisa de ler ficheiros de configuração do S3. Estou a colocar as credenciais na configuração do servidor."

Ela olhou para o ecrã por um momento. "Feche esse ficheiro."

"Eu estava apenas—"

"Se alguém entrar nesse servidor," disse ela, "obtém essas chaves. E essas chaves tocam o que quer que o utilizador IAM tenha permissão para tocar. Que é provavelmente mais do que apenas S3."

Tom fechou o ficheiro.

"Há uma forma melhor," disse ela. "O servidor em si pode ter uma função. Pense nisso como um cargo — a instância não precisa de credenciais porque o sistema já sabe o que é e o que tem permissão para fazer."

Tom pareceu céptico. "Portanto o servidor autentica-se a si mesmo?"

"Sim. Sem palavra-passe. Sem chaves num ficheiro de configuração. Sem nada que possa ser acidentalmente confirmado no git."

Esta última parte aterrou. Tom tinha encontrado uma palavra-passe de base de dados no histórico do git duas semanas atrás. Abriu um novo separador do browser.

**Revisitar o IAM: O Quadro Completo**

O Capítulo 3 introduziu o IAM: utilizadores, grupos, funções e políticas. Agora é hora de ir mais fundo.

As políticas IAM são documentos JSON que especificam que acções são permitidas ou negadas em que recursos. Parecem assim:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Esta política permite ler e escrever objectos no bucket `nimbus-assets`, e nada mais. Não eliminar. Não listar buckets. Não qualquer outra operação S3. Não qualquer outro serviço AWS.

Esta é a forma correcta de conceder permissões: acções específicas, recursos específicos.

**O Problema com "Acesso de Administrador"**

As Políticas Geridas AWS como `AdministratorAccess` são concebidas para começar rapidamente. Não são concebidas para correr sistemas de produção com membros reais da equipa.

`AdministratorAccess` concede cada acção em cada recurso. Se um membro da equipa com esta política cometer um erro — eliminar acidentalmente um bucket S3, terminar a instância EC2 errada, alterar regras de grupos de segurança — não há nada que a AWS possa fazer para os impedir. A permissão foi concedida.

Se as credenciais de um membro da equipa forem comprometidas (ataque de phishing, chave de acesso exposta, roubo de portátil), o atacante tem acesso de administrador a tudo na sua conta AWS.

"Portanto, o que deve ter Soo-Jin?" perguntou Leo.

"O que precisa Soo-Jin de fazer?" respondeu Priya.

"Implantar a API. Verificar logs. Nada mais."

"Então ela tem: capacidade de enviar para o pipeline de código, acesso de leitura a logs CloudWatch, e nada mais."

"Isso é... muito específico."

"Sim. Esse é o ponto."

**Funções IAM: Identidades para Serviços**

O Capítulo 3 introduziu funções como uma forma de instâncias EC2 acederem a serviços AWS sem guardar credenciais. Vamos tornar isto concreto.

As suas instâncias EC2 a correr a API Nimbus precisam de:

- Ler do DynamoDB (o menu)
- Escrever no DynamoDB (encomendas)
- Colocar objectos em S3 (recibos, carregamentos)
- Escrever logs para CloudWatch
- Ler segredos do Secrets Manager

Em vez de criar um utilizador com uma chave de acesso e guardar essa chave na instância EC2 (um pesadelo de segurança — as chaves de acesso podem ser lidas por qualquer pessoa com acesso SSH), cria uma **função IAM** para a instância EC2 com exactamente estas permissões.

A instância EC2 assume a função automaticamente. A AWS fornece credenciais temporárias através do serviço de metadados da instância. As credenciais rodam automaticamente. Sem chave de acesso para expor.

"E se alguém hackear a instância EC2?" perguntou Leo.

"Podem fazer o que a função EC2 permite," disse Priya. "O que é ler o menu, escrever encomendas e enviar logs. Não podem eliminar o bucket S3. Não podem terminar instâncias EC2. Não podem tocar no IAM."

"Porque a função EC2 não tem essas permissões."

"Exactamente."

**Assunção de Função: Como os Serviços se Tornam Outros Serviços**

As funções podem ser assumidas por:

- **Serviços AWS** (EC2, Lambda, tarefas ECS, etc.)
- **Utilizadores IAM** na sua própria conta (elevação de função — assume uma função com mais permissões para uma tarefa específica)
- **Utilizadores IAM noutras contas AWS** (acesso entre contas — a conta de outra organização pode assumir uma função na sua)
- **Fornecedores de identidade externos** (Google, Active Directory, Okta — acesso federado para utilizadores humanos)

Este último padrão — **federação de identidade** — é como as grandes organizações dão aos seus funcionários acesso AWS sem criar utilizadores IAM individuais para cada pessoa. O Active Directory da sua empresa tem as suas credenciais. Quando inicia sessão na AWS, autentica-se contra o Active Directory, e a AWS concede-lhe uma função.

**Limites de Permissão: Limitar o Que as Funções Podem Conceder**

Aqui está um problema subtil mas importante: por defeito, o IAM não impede um utilizador de conceder permissões que actualmente não tem.

Se Soo-Jin tem `iam:CreatePolicy` e `iam:AttachUserPolicy`, pode criar uma política a conceder acesso de escrita S3 e associá-la a si mesma — mesmo que as suas políticas existentes só permitam leitura S3. Esta classe de vulnerabilidade chama-se **escalada de privilégios**, e é exactamente por isso que existem limites de permissão.

Mas e se quiser delegar a criação de permissões IAM a um líder de equipa, garantindo que não pode conceder mais do que pretendia?

Os **limites de permissão** definem as permissões máximas que podem alguma vez ser concedidas a uma identidade. Mesmo que as políticas associadas da identidade sejam mais amplas, as permissões efectivas são limitadas pelo limite de permissão.

Exemplo: Dá a um líder de equipa uma política que lhes permite criar funções IAM. Mas associa um limite de permissão que diz "as funções criadas por este líder de equipa nunca podem ter acesso de eliminação S3." Mesmo que o líder de equipa crie uma função com acesso completo S3, o limite impede que a eliminação S3 tenha efeito.

Este é um conceito avançado, mas aparece no exame e reflecte como as organizações delegam gestão IAM em escala.

**IAM Access Analyzer: Auditar Permissões**

Priya passou dois dias a rever a configuração IAM da equipa. Encontrou:

- O utilizador pessoal do Leo tinha acesso de administrador (como descoberto)
- Uma antiga função Lambda tinha permissões para ler todos os buckets S3 (sobrado de um teste)
- Uma função de serviço tinha acesso de escrita a tabelas DynamoDB que já não existiam

Isto é normal. As configurações IAM acumulam resíduos ao longo do tempo.

O **IAM Access Analyzer** é um serviço AWS que identifica automaticamente recursos (buckets S3, funções IAM, chaves KMS, funções Lambda) que são partilhados com entidades externas. Também identifica políticas com permissões excessivas.

As auditorias IAM regulares devem fazer parte das suas operações. As permissões crescem; raramente encolhem organicamente. O Access Analyzer ajuda a tornar o invisível visível.

**As Service Control Policies: Barreiras de Protecção ao Nível da Organização**

Se o seu ambiente AWS crescer para múltiplas contas (um padrão comum para grandes equipas — conta de desenvolvimento, conta de staging, conta de produção), o **AWS Organizations** permite-lhe geri-las a partir de uma conta central.

Dentro do Organizations, as **Service Control Policies (SCPs)** aplicam barreiras de protecção que afectam *cada* entidade IAM na conta, incluindo administradores.

Exemplo de SCP: "Ninguém na conta de desenvolvimento pode criar instâncias EC2 na região eu-west-1."

Mesmo que alguém tenha acesso de administrador na conta de desenvolvimento, não pode violar esta SCP. É imposta ao nível da organização, acima do nível da conta.

As SCPs não concedem permissões — restringem-nas. Definem as permissões máximas que qualquer entidade IAM numa conta pode alguma vez ter.

## Pontos Fortes e Limitações

**Por que razão as funções IAM e o mínimo privilégio importam**:

- Limita o raio de explosão quando as credenciais são comprometidas
- Requer que os atacantes escalem por múltiplos sistemas em vez de obter acesso total imediatamente
- Fornece uma trilha de auditoria — o CloudTrail regista qual função fez o quê
- Força decisões conscientes sobre acesso — "de que precisa realmente este serviço?"

**Onde fica complicado**:

- Escrever políticas IAM precisas requer perceber o modelo de acção/recurso da AWS para cada serviço (e cada serviço tem dezenas de acções)
- Políticas excessivamente restritivas quebram aplicações — depurar erros "acesso negado" em múltiplos serviços é moroso
- O IAM propaga alterações com ligeiro atraso (normalmente segundos, por vezes mais) — pode causar problemas de temporização confusos
- As funções entre contas requerem configuração cuidadosa da política de confiança

## Resumo

- Evite **acesso de administrador** em produção — é para configuração, não para operações.
- As políticas IAM especificam **Effect**, **Action** e **Resource** — seja específico nos três.
- Associe políticas a **grupos** (para humanos) e **funções** (para serviços).
- As instâncias EC2, funções Lambda e outros serviços AWS devem usar **funções IAM**, não chaves de acesso.
- Os **limites de permissão** limitam as permissões máximas que qualquer identidade pode ter, independentemente das políticas associadas.
- As **SCPs** (Service Control Policies) aplicam restrições a toda a organização que mesmo administradores não podem contornar.
- O **IAM Access Analyzer** identifica políticas com permissões excessivas e acesso externo a recursos.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Seguras (Domínio 1, Tarefa 1.1)*

- **Funções IAM para EC2**: A resposta canónica quando EC2 precisa de aceder a S3, DynamoDB, Secrets Manager ou qualquer serviço AWS. Nunca guarde chaves de acesso numa instância.
- **Lógica de avaliação de política**: Quando o IAM avalia um pedido, usa uma hierarquia explícita de permitir/negar. Uma **Negação** explícita ganha sempre, mesmo contra um Permitir explícito. O padrão é Negar.
- **Limites de permissão**: Usados ao delegar administração IAM. Cenário do exame: "permitir que os programadores criem funções para as suas funções Lambda, mas impedi-los de conceder permissões além do que têm." → Limites de permissão.
- **As SCPs não concedem permissões**: Apenas restringem. Se uma SCP permite S3 mas uma política IAM o nega, S3 é negado. Se uma SCP nega S3 mas uma política IAM o permite, S3 é negado.
- **Políticas baseadas em recursos**: Alguns serviços AWS (S3, SQS, Lambda) têm políticas baseadas em recursos — permissões associadas ao recurso, não à identidade. Estas funcionam em conjunto com políticas IAM.
- **Acesso entre contas**: Função IAM na Conta A com uma política de confiança permitindo à Conta B assumir. O utilizador/função da Conta B usa então `sts:AssumeRole` para obter credenciais temporárias na Conta A.
- **Utilizadores IAM vs Acesso Federado**: Para grandes organizações, o acesso federado (via IAM Identity Center ou federação directa com um IdP) é preferível a utilizadores IAM individuais.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre uma política IAM associada a um utilizador e uma função IAM assumida por uma instância EC2. Quando usaria cada uma?

*(Sugestão: Pense nas credenciais — onde vivem e quem gere a sua rotação?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma função Lambda precisa de ler de um bucket S3 e escrever numa tabela DynamoDB. Um programador deu à função Lambda uma função com `AdministratorAccess` por simplicidade durante o desenvolvimento. Antes de passar para produção, a equipa de segurança quer seguir o mínimo privilégio.

Qual das seguintes é a MELHOR abordagem?

A) Criar um novo utilizador IAM com permissões de leitura S3 e escrita DynamoDB; gerar uma chave de acesso; guardar a chave nas variáveis de ambiente Lambda  
B) Associar uma política inline à função de execução Lambda concedendo `s3:GetObject` no bucket específico e `dynamodb:PutItem` na tabela específica  
C) Manter `AdministratorAccess` mas adicionar uma SCP que bloqueia todas as acções excepto S3 e DynamoDB  
D) Criar um grupo IAM com permissões de leitura S3 e escrita DynamoDB e adicionar a função Lambda ao grupo

**Sugestão 1**: As funções Lambda usam funções de execução, não chaves de acesso. Qual opção respeita isso?

**Sugestão 2**: Mínimo privilégio significa acções específicas em recursos específicos, não políticas amplas.

**Sugestão 3**: Os grupos IAM contêm utilizadores, não funções Lambda.

**Resposta**: B

**Explicação**: A função de execução Lambda deve ter apenas as permissões específicas de que a função precisa. As políticas inline com âmbito para acções específicas (`s3:GetObject`) e recursos específicos (ARN do bucket, ARN da tabela DynamoDB) é a implementação de mínimo privilégio.

**Por que não A?** Guardar chaves de acesso em variáveis de ambiente Lambda é um antipadrão de segurança — as chaves podem ser lidas por qualquer pessoa com acesso à consola Lambda ou através do contexto de execução. As funções Lambda usam funções de execução com credenciais temporárias do IAM.

**Por que não C?** As SCPs aplicam-se ao nível da Organização/conta e não funcionam como controlos de permissão por função. AdministratorAccess com uma SCP é a camada errada.

**Por que não D?** As funções Lambda não podem ser adicionadas a grupos IAM. Os grupos são apenas para utilizadores IAM.

*Domínio SAA-C03: Projectar Arquitecturas Seguras — Tarefa 1.1*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus cresceu para três equipas: a equipa de API central, a equipa de portal de parceiros de restaurante e a equipa de análise. Cada equipa tem cinco programadores e implanta numa conta AWS partilhada.

Projecte uma estrutura IAM que:

- Dá a cada equipa acesso apenas aos seus serviços
- Impede a equipa de análise de escrever em bases de dados de produção
- Permite a um líder de equipa em cada equipa criar funções IAM para os seus serviços, mas não de escalar as suas próprias permissões
- Fornece um grupo de administração para a equipa de plataforma que pode gerir todos os serviços

Que construções IAM usaria? Onde seriam aplicados os limites de permissão?

*(Não existe uma resposta única correcta. O objectivo é praticar o design IAM multi-equipa.)*

## Cena Pós-Créditos

Leo passou um fim-de-semana a reformular o IAM.

Na segunda-feira, cada serviço tinha uma função com exactamente as permissões de que precisava. Soo-Jin e Rafael tinham membros de grupo que correspondiam às suas funções de trabalho reais. O próprio Leo tinha abandonado o acesso de administrador e estava a usar uma função que tinha concebido — com permissão para fazer o seu trabalho, e nada mais.

Tinha demorado mais do que o esperado.

Priya reviu o seu trabalho na terça-feira de manhã. Leu os documentos de política cuidadosamente.

"Isto está bom," disse ela.

"Obrigado," disse Leo, com o alívio de alguém que tinha passado um fim-de-semana a ser humilhado por JSON.

"Deixou uma coisa."

Leo ficou rígido.

"A antiga chave de implantação da primeira versão. Num segredo do GitHub Actions."

"Essa foi desactivada."

Priya escreveu algo. "Foi?"

Uma pausa.

"Vou desactivá-la," disse Leo.

"Os logs do CloudTrail mostram que fez três chamadas API na semana passada."

Uma pausa mais longa.

"Algo estava a usá-la," disse Leo. "Vou investigar."

No próximo capítulo: a diferença entre um segurança que se lembra de rostos e uma porta que só lê crachás.
