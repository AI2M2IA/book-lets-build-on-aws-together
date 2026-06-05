# Capítulo 16: Chaves, Fechaduras e Segredos

Leo estava a rever o histórico do git quando o encontrou. Uma palavra-passe de base de dados. Confirmada há seis meses, em texto simples, por alguém que já não trabalhava na Nimbus. A confirmação era pública. A palavra-passe tinha entretanto sido alterada — mas não tinham a certeza disso. Verificaram cada sistema que essa credencial alguma vez tinha tocado. Demorou quatro horas. Foi esse o dia em que Nimbus decidiu parar de colocar segredos no código.

**Os Dois Problemas: Guardar Segredos e Encriptar Dados**

A segurança em torno de informação sensível tem dois problemas distintos:

**Guardar credenciais** (palavras-passe de bases de dados, chaves API, cadeias de conexão): Onde vivem? Quem pode aceder-lhes? Como as roda sem reimplantar a aplicação?

**Encriptar dados** (informação de clientes, registos de pagamento, PII): Como garante que mesmo que alguém obtenha acesso não autorizado à base de dados ou bucket S3, não consegue ler os dados?

A AWS tem um serviço dedicado para cada problema:

- **AWS Secrets Manager**: Guarda e gere credenciais com segurança
- **AWS KMS (Key Management Service)**: Gere chaves de encriptação para encriptar e desencriptar dados

**AWS Secrets Manager: Sem Mais Credenciais no Código**

O Secrets Manager é um armazenamento seguro para segredos: credenciais de bases de dados, chaves API, tokens OAuth, chaves SSH, ou qualquer coisa sensível.

Em vez de a aplicação ler uma palavra-passe de uma variável de ambiente ou ficheiro de configuração, chama a API do Secrets Manager no arranque (ou quando necessário) e obtém o segredo. O segredo nunca toca no disco. Nunca aparece no seu código. Não está nas variáveis de ambiente.

Eis o que o fluxo parece:

**Forma antiga**:
```
DB_PASSWORD=supersecretpassword123  # no ficheiro .env ou variável de ambiente
```

**Forma Secrets Manager**:
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

A instância EC2 precisa de uma função IAM com permissão para chamar `secretsmanager:GetSecretValue` para esse segredo específico. Nenhum outro serviço pode lê-lo. O segredo nunca está no código.

**Rotação Automática: O Verdadeiro Poder**

A maior funcionalidade do Secrets Manager não é guardar segredos — é rotá-los automaticamente.

Eis o cenário: a cada 30 dias, o Secrets Manager gera uma nova palavra-passe de base de dados, actualiza-a no RDS, actualiza o segredo guardado, e a aplicação obtém a nova palavra-passe na próxima vez que precisar. Sem intervenção manual. Sem implantação. Sem "preciso de me lembrar de rodar isto."

A rotação é implementada como uma função Lambda. A AWS fornece modelos para bases de dados RDS (MySQL, PostgreSQL, Aurora). Pode personalizar a função para qualquer tipo de credencial.

Tom tinha uma pergunta sobre o custo. (Claro que tinha.)

O Secrets Manager cobra por segredo por mês mais por chamada API. Para um pequeno número de palavras-passe de bases de dados e chaves API, o custo são alguns euros por mês — negligenciável comparado com o custo de um incidente.

"O comprometimento da semana passada," disse Priya, "quanto teria custado a investigar e remediar?"

Tom ficou quieto por um momento. "Incluindo o meu tempo, o seu tempo, o fim-de-semana do Leo... alguns milhares de euros."

"O Secrets Manager teria apanhado a chave estática antes de ser explorada. E teria rodado automaticamente."

Tom abriu a página de preços.

**AWS KMS: A Fábrica de Fechaduras**

O AWS KMS (Key Management Service) gere **chaves criptográficas** — os valores secretos usados para encriptar e desencriptar dados.

A analogia: o KMS é como uma empresa de cofres que guarda a chave mestra. Os seus dados (o conteúdo do cofre) estão encriptados. Apenas alguém com permissão para usar a chave KMS pode desencriptá-los. O KMS regista cada utilização de cada chave no CloudTrail.

As **Customer Master Keys (CMKs)** — agora chamadas chaves KMS — vêm em dois tipos:

**Chaves geridas pela AWS**: A AWS cria e gere a chave automaticamente para serviços como S3, EBS, RDS. Não controla a chave directamente, mas pode ver que está a ser usada. Gratuito.

**Chaves geridas pelo cliente**: Cria a chave no KMS e controla cada aspecto dela: quem pode usá-la, quando roda, quem pode administrá-la. Pode activar a rotação anual automática. Custo: 1 $/mês por chave mais encargos por chamada API.

**Encriptação nos Serviços AWS: Integração KMS**

A maioria dos serviços AWS integra-se com o KMS para encriptação:

**S3**: Active "encriptação do lado do servidor com KMS" num bucket. Cada objecto é encriptado em repouso com uma chave KMS. Ler um objecto requer permissão tanto para o bucket S3 *como* para a chave KMS.

**RDS**: Active a encriptação no momento da criação. O armazenamento da base de dados, as cópias de segurança e os snapshots são todos encriptados com uma chave KMS. Nota: a encriptação não pode ser activada numa instância RDS não encriptada existente — deve tirar um snapshot, copiar o snapshot com encriptação activada e restaurar.

**EBS**: Encripte volumes com KMS. Os novos volumes criados a partir de snapshots encriptados são automaticamente encriptados.

**DynamoDB**: A encriptação em repouso usando KMS está activada por defeito em todas as tabelas.

**ElastiCache Redis**: Encriptação em repouso com KMS para dados em cache sensíveis.

O princípio: os dados devem ser encriptados em repouso (guardados em disco) e em trânsito (a mover-se por uma rede). O KMS trata da encriptação em repouso. TLS/SSL (fornecido automaticamente pelos serviços AWS) trata da encriptação em trânsito.

**Encriptação em Envelope: Como o KMS Realmente Funciona**

Aqui está um detalhe que ajuda a perceber o comportamento do KMS e as perguntas do exame.

O KMS não encripta os seus dados directamente na maioria dos casos. Usa **encriptação em envelope**:

1. O KMS gera uma **chave de dados** (uma chave simétrica única)
2. O serviço usa a chave de dados para encriptar os seus dados localmente (rápido — encriptação simétrica)
3. O serviço pede ao KMS para encriptar a própria chave de dados (usando a sua chave KMS)
4. Tanto os dados encriptados como a chave de dados encriptada são guardados
5. Os seus dados reais nunca saem do serviço — apenas a chave de dados vai ao KMS para encriptação/desencriptação

Quando lê os dados:

1. O serviço pede ao KMS para desencriptar a chave de dados
2. O KMS verifica permissões, desencripta a chave de dados, devolve-a
3. O serviço usa a chave de dados desencriptada para desencriptar os seus dados localmente

Isto significa que o KMS pode lidar com dados muito grandes sem os enviar todos através da API KMS. Apenas chaves pequenas vão ao KMS. O CloudTrail regista cada chamada API KMS — cada operação de encriptação e desencriptação.

**Secrets Manager vs. Parameter Store**

A AWS também tem o **Systems Manager Parameter Store**, que guarda valores de configuração (não apenas segredos). O Parameter Store é mais barato — gratuito para parâmetros padrão. Também pode guardar parâmetros encriptados usando KMS.

Para segredos que precisam de rotação: Secrets Manager.

Para valores de configuração e parâmetros não sensíveis: Parameter Store (o nível gratuito é muito generoso).

Para configuração de aplicação (números de porta, feature flags, definições específicas de ambiente): Parameter Store.

## Pontos Fortes e Limitações

**AWS Secrets Manager**:

- Rotação automática de segredos sem alterações de código
- Controlo de acesso IAM refinado por segredo
- Versionamento (aceder à versão anterior durante a rotação)
- Auditoria via CloudTrail
- Custo: ~0,40 $/segredo/mês + chamadas API

**AWS KMS**:

- Gestão centralizada de chaves com trilha de auditoria completa
- Rotação anual automática de chaves para chaves geridas pelo cliente
- Permissões IAM refinadas por chave (políticas de chave + políticas IAM)
- Suportado por Hardware Security Module (HSM) — as chaves nunca saem do HSM
- Custo: 1 $/mês por chave + 0,03 $ por 10 000 chamadas API

**Onde fica complicado**:

- As políticas de chave KMS são separadas de (e avaliadas juntamente com) as políticas IAM — pode ser confuso de depurar
- A encriptação em repouso deve ser planeada — não pode encriptar uma instância RDS não encriptada existente no lugar
- A eliminação de chaves no KMS tem um período de espera de 7 a 30 dias (um mecanismo de segurança — chaves perdidas significam dados perdidos)
- Os custos do Secrets Manager escalam com o número de segredos e chamadas API em escala

## Resumo

- Nunca guarde credenciais em código, variáveis de ambiente ou ficheiros de configuração confirmados para controlo de versão.
- O **Secrets Manager** guarda credenciais com segurança e roda-as automaticamente. As aplicações obtêm segredos via API.
- O **KMS** gere chaves de encriptação. A maioria dos serviços AWS integra-se com o KMS para encriptação em repouso.
- A **encriptação em repouso** (dados guardados em disco) usa chaves KMS geridas pela AWS ou por si. A **encriptação em trânsito** usa TLS.
- **Encriptação em envelope**: O KMS encripta a chave, não os dados directamente. O serviço encripta dados usando uma chave de dados local.
- **Chaves KMS geridas pelo cliente**: controlo total sobre rotação, acesso e auditoria. **Chaves geridas pela AWS**: automáticas, sem configuração necessária.
- O **Parameter Store** é uma alternativa mais leve ao Secrets Manager para valores de configuração não sensíveis.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Seguras (Domínio 1, Tarefa 1.3)*

- **Secrets Manager vs SSM Parameter Store**: Secrets Manager para credenciais que precisam de rotação automática; Parameter Store para configuração geral. O exame distingue-os pelo requisito de rotação e sensibilidade ao custo.
- **Políticas de chave KMS**: Uma chave KMS tem a sua própria política de chave (uma política baseada em recursos). As políticas IAM sozinhas não concedem acesso a uma chave KMS — a política de chave deve explicitamente permitir.
- **Encriptar RDS**: Não pode activar encriptação numa instância RDS não encriptada existente. O processo: criar um snapshot → copiar snapshot com encriptação activada → restaurar do snapshot encriptado → migrar tráfego para nova instância.
- **Encriptação EBS**: Novos volumes podem ser encriptados. Os snapshots de volumes encriptados são sempre encriptados. Os volumes não encriptados não podem ser directamente encriptados — snapshot + cópia + restauro.
- **CloudTrail + KMS**: Cada chamada API KMS é registada no CloudTrail. Esta é uma funcionalidade de conformidade chave.
- **Chaves KMS multi-Região**: Replique material de chave para múltiplas regiões para que a desencriptação possa acontecer sem chamadas API entre regiões. O exame usa-as para recuperação de desastres multi-região com dados encriptados.
- **KMS vs CloudHSM**: O KMS é multi-inquilino (gerido pela AWS). O CloudHSM é um módulo de segurança de hardware dedicado que apenas você controla. Sinais do exame: "FIPS 140-2 Nível 3", "HSM dedicado", "operações criptográficas geridas pelo cliente" → CloudHSM.

## Exercícios

**Exercício 1 — Recordar**

Explique o conceito de encriptação em envelope. Por que razão o KMS encripta uma pequena chave de dados em vez de encriptar directamente os dados da aplicação?

*(Sugestão: Pense no que acontece se tiver 1 GB de dados para encriptar e quais seriam as implicações de desempenho de enviar 1 GB para um serviço KMS remoto.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de serviços financeiros guarda dados sensíveis de clientes numa base de dados MySQL RDS. Um novo requisito de conformidade exige que:

1. Todos os dados devem ser encriptados em repouso
2. Toda a utilização de chaves de encriptação deve ser auditável
3. As chaves de encriptação devem ser controladas pelo cliente (não geridas pela AWS)
4. A palavra-passe da base de dados deve ser rotada automaticamente a cada 90 dias

A base de dados foi criada há seis meses sem encriptação activada. Que conjunto de acções MELHOR satisfaz todos os quatro requisitos?

A) Activar encriptação RDS na base de dados existente; criar uma chave KMS gerida pelo cliente; configurar Secrets Manager com rotação de 90 dias  
B) Criar um snapshot da base de dados existente; copiar o snapshot com encriptação usando uma chave KMS gerida pelo cliente; restaurar do snapshot encriptado; configurar Secrets Manager com rotação de 90 dias  
C) Criar uma nova instância RDS encriptada com uma chave gerida pela AWS; migrar dados da instância antiga; configurar Secrets Manager com rotação de 90 dias  
D) Activar encriptação em repouso RDS na base de dados existente usando uma chave gerida pela AWS; configurar Secrets Manager com rotação de 90 dias

**Sugestão 1**: Não pode activar encriptação numa instância RDS não encriptada existente directamente.

**Sugestão 2**: Chaves "controladas pelo cliente" significa chaves KMS geridas pelo cliente, não chaves geridas pela AWS.

**Sugestão 3**: O processo de cópia de snapshot é o caminho padrão de migração para RDS encriptado.

**Resposta**: B

**Explicação**: A encriptação RDS não pode ser activada numa instância existente. A abordagem padrão é: tirar snapshot da instância existente → copiar o snapshot com encriptação activada usando uma chave KMS gerida pelo cliente (satisfaz os requisitos 1, 2 e 3) → restaurar do snapshot encriptado. As chaves KMS geridas pelo cliente registam automaticamente toda a utilização no CloudTrail (auditoria) e mantêm as chaves de encriptação sob o seu controlo. O Secrets Manager trata da rotação automática de 90 dias (satisfaz o requisito 4).

**Por que não A?** Não pode activar encriptação numa instância RDS não encriptada existente no lugar.

**Por que não C?** As chaves geridas pela AWS não satisfazem o requisito de "controladas pelo cliente" (requisito 3).

**Por que não D?** Mesmo problema que A (não pode activar no lugar) mais a chave gerida pela AWS não satisfaz o requisito 3.

*Domínio SAA-C03: Projectar Arquitecturas Seguras — Tarefa 1.3*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus precisa de guardar os seguintes dados sensíveis:

- Palavra-passe da base de dados para a instância RDS de produção
- Chave secreta API do Stripe (usada para processamento de pagamentos)
- Uma chave de encriptação simétrica para encriptar o histórico de encomendas de clientes no DynamoDB
- Valores de configuração por restaurante (endpoints API, feature flags — não sensíveis)

Que serviço ou abordagem AWS usaria para cada um? Que estratégia de rotação aplicaria a cada um?

*(Não existe uma resposta única correcta. O objectivo é praticar a correspondência de ferramentas de segurança a casos de uso.)*

## Cena Pós-Créditos

Os segredos foram migrados.

Palavras-passe de bases de dados: Secrets Manager, a rodar a cada 30 dias.

Chaves API: Secrets Manager, com uma Lambda de rotação que chamava a API do fornecedor de pagamentos para gerar uma nova chave.

Dados de encomendas de clientes: encriptados com uma chave KMS gerida pelo cliente.

Antigas credenciais: desactivadas. Antigos ficheiros de configuração: eliminados. Antigos segredos do GitHub Actions: removidos.

"Estamos agora prontos para auditoria," disse Priya.

"Defina pronto para auditoria," disse Maya.

"Se um auditor de conformidade nos pedisse para provar que nenhuma credencial está codificada no código ou exposta na infraestrutura, poderíamos mostrar-lhes: cada segredo está no Secrets Manager, cada chave de encriptação está no KMS, cada acesso é registado no CloudTrail."

"Quando foi a última vez que alguém verificou os logs do CloudTrail?"

Uma pausa.

"Verifico-os todas as semanas," disse Priya.

"E se algo invulgar aparecesse, como saberíamos?"

"Isso," disse Priya, fechando o portátil, "é a próxima conversa."

No próximo capítulo: as três camadas de defesa que estão entre Nimbus e a internet.
