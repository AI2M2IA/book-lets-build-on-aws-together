# Capítulo 8: O Administrador de Base de Dados Que Nunca Fica Doente

Era 3 da manhã quando chegou o alerta.

O servidor de base de dados precisava de um patch de segurança — do tipo que exigia um reinício. A
vulnerabilidade era real, o patch estava disponível, e a janela para o aplicar
sem perturbar os clientes era agora mesmo, a meio da noite, quando o tráfego
estava baixo.

Priya era a única que estava acordada. Aplicou o patch, reiniciou o servidor, observou
os logs até a aplicação voltar a funcionar, e foi para a cama às 4:15 da manhã.

De manhã contou à equipa o que tinha acontecido. Houve um silêncio.

"Isso vai acontecer de novo," disse Tom.

"Vai acontecer sempre que houver um patch," disse Priya. "E há sempre patches. Tem de haver uma forma melhor de fazer isto."

Havia. Só requeria abandonar a ideia de que precisavam de gerir a base de dados
eles mesmos.

**O Problema Tradicional da Base de Dados**

Quando corre uma base de dados você mesmo numa instância EC2, é responsável por tudo.

Instalar o software da base de dados. Configurá-la de forma segura. Aplicar patches quando vulnerabilidades
de segurança são descobertas. Fazer cópias de segurança. Testar que as cópias de segurança realmente funcionam
(um passo que a maioria das equipas salta até ser tarde demais). Monitorizar espaço em disco. Configurar
replicação para redundância. Configurar failover para quando o servidor primário fica inoperacional.
Ajustar desempenho de consultas. Gerir conexões sob carga.

Nada disto é a aplicação. Nada disto acrescenta funcionalidades. Tudo requer experiência.

A maioria das equipas de desenvolvimento não são administradores de base de dados. Isto cria um padrão previsível:
a base de dados é instalada, configurada minimamente, e depois maioritariamente esquecida até algo
correr catastroficamente mal.

"Foi isso que fizemos?" perguntou Maya.

A resposta do Leo foi silêncio, que equivalia a um sim.

**Amazon RDS: A Base de Dados Gerida**

**Amazon RDS** — Relational Database Service — trata do ónus operacional de correr
uma base de dados relacional para que não tenha de o fazer.

Com RDS, a AWS gere:

- Instalar e aplicar patches ao motor da base de dados
- Cópias de segurança automatizadas (guardadas em S3, retidas até 35 dias)
- Failover automatizado (quando o primário cai, um standby assume automaticamente)
- Monitorização e métricas
- Encriptação em repouso e em trânsito
- Auto-escalonamento de armazenamento (se o activar, o disco cresce quando fica cheio)

Você gere:

- O esquema da base de dados (a estrutura das suas tabelas)
- As suas consultas e lógica de aplicação
- Quem tem acesso à base de dados
- Que tipo de instância corre a base de dados
- Ajuste de parâmetros (embora o RDS forneça padrões razoáveis)

A analogia: contratar um administrador de base de dados que nunca tira dias de doença, nunca comete
erros de configuração, faz automaticamente cópias de segurança diárias e se corrige se
algo se avariar — mas que não escreve a lógica da sua aplicação.

**Motores Suportados**

O RDS suporta vários motores de base de dados populares:

- **MySQL** — a base de dados relacional open-source mais amplamente utilizada
- **PostgreSQL** — poderoso, extensível, cada vez mais popular para cargas de trabalho complexas
- **MariaDB** — fork MySQL open-source, totalmente compatível
- **Oracle** — de nível empresarial, usado em grandes organizações com requisitos legados
- **Microsoft SQL Server** — para ambientes com predominância Windows
- **Amazon Aurora** — o próprio motor MySQL/PostgreSQL compatível da AWS, construído para a nuvem
  (cobrimos Aurora em profundidade no Capítulo 24)

Para Nimbus, a escolha foi PostgreSQL. Era o que Leo conhecia, e lidava bem com dados relacionais. A escolha do motor importa menos do que se pensa para a maioria das aplicações —
os benefícios operacionais do RDS aplicam-se independentemente.

**Multi-AZ: O Standby Que Assume**

Esta é a funcionalidade que muda completamente o cálculo de fiabilidade.

A **implantação Multi-AZ** significa que o RDS mantém uma instância standby síncrona numa
Zona de Disponibilidade diferente da primária. Cada transacção confirmada no primário
é replicada sincronicamente para o standby antes de a confirmação ser reconhecida.

Quando o primário falha — falha de hardware, paragem de AZ, colapso de software — o RDS
faz failover automaticamente para o standby. O registo DNS para o endpoint da base de dados
é actualizado. A sua aplicação volta a ligar-se ao novo primário.

O failover demora 60 a 120 segundos. Durante essa janela, a sua aplicação experimentará
erros de conexão. As aplicações bem escritas devem lidar com isto graciosamente (tentativas de conexão com recuo).

O standby não é uma réplica de leitura. Não serve tráfego de leitura. O seu único propósito é
estar pronto para assumir.

Tom: "Quanto custa Multi-AZ?"

Aproximadamente o dobro do custo de uma única instância — porque está literalmente a correr duas
instâncias de base de dados. O standby custa o mesmo que o primário.

Tom: "E quanto custa uma paragem não planeada?"

Respondeu à sua própria pergunta abrindo o histórico de encomendas e estimando a receita
por hora durante o pico de sexta-feira.

Multi-AZ foi activado nessa tarde.

**Cópias de Segurança Automatizadas e Recuperação para um Ponto no Tempo**

O RDS faz cópias de segurança automatizadas todos os dias. A AWS guarda estas cópias em S3 (geridas pelo
RDS — não as vê directamente na sua consola S3). Pode restaurar a base de dados
para qualquer ponto dentro do seu período de retenção de cópias de segurança.

As cópias de segurança acontecem durante uma **janela de manutenção** configurável — um período de baixo tráfego,
tipicamente de madrugada. Para a maioria dos tipos de motores, as cópias de segurança não causam tempo de inatividade.

A **recuperação para um ponto no tempo** é uma das funcionalidades mais valiosas: pode restaurar para
qualquer segundo dentro do seu período de retenção. Não apenas snapshots diários — *qualquer segundo*.
Isto é possível porque o RDS arquiva continuamente logs de transacções além das
cópias de segurança diárias.

Se alguém executar acidentalmente `DELETE FROM orders WHERE 1=1` às 14:37, pode
restaurar para as 14:36.

Leo relaxou visivelmente quando percebeu isto.

"Poderíamos ter recuperado do que apaguei no mês passado?" perguntou ele.

"Antes do RDS? Não," disse Priya. "Depois do RDS? Sim."

**Réplicas de Leitura: Escalonamento de Tráfego de Leitura**

Multi-AZ é sobre disponibilidade. As **réplicas de leitura** são sobre desempenho.

Uma réplica de leitura é uma cópia assíncrona da sua base de dados primária que pode servir
consultas de leitura. Pode ter até cinco réplicas de leitura para a maioria dos motores RDS (mais para Aurora).

A aplicação é modificada para enviar consultas de leitura para a réplica e consultas de escrita para o
primário. Isto distribui a carga: o primário trata das escritas e transacções complexas; as réplicas tratam das leituras.

Características chave:

- A replicação é **assíncrona** — pode haver um pequeno atraso (desfasamento) entre o
  primário e a réplica. Se escrever um registo e imediatamente ler da réplica,
  pode não o ver ainda.
- As réplicas de leitura podem estar na mesma Região ou numa Região diferente (as réplicas entre Regiões
  acrescentam latência mas permitem distribuição geográfica).
- As réplicas de leitura podem ser promovidas a bases de dados autónomas num cenário de desastre.

Para Nimbus: as pesquisas de menus são leituras. O histórico de encomendas são leituras. A vasta maioria do
tráfego é tráfego de leitura. Adicionar uma réplica de leitura e encaminhar leituras para ela reduz significativamente a carga da base de dados primária.

Cobrimos as réplicas de leitura mais detalhadamente no Capítulo 24 quando discutimos Aurora.

**Grupos de Parâmetros e Grupos de Opções RDS**

Dois mecanismos de configuração que aparecem no exame:

Os **grupos de parâmetros** controlam definições do motor de base de dados — como conexões máximas,
tamanho da cache de consultas, valores de timeout. O RDS cria um grupo de parâmetros por defeito que funciona
para a maioria dos casos. Cria grupos de parâmetros personalizados quando precisa de ajustar definições específicas.

Os **grupos de opções** activam funcionalidades adicionais para alguns motores — como a encriptação de rede nativa do Oracle ou a encriptação transparente de dados do SQL Server. A maioria das implantações de motores open-source não precisam de grupos de opções personalizados.

Não precisa de memorizar estes. Saiba que existem para personalizar o comportamento do motor da base de dados.

## Pontos Fortes e Limitações

**Por que razão RDS é excelente**:

- Elimina o ónus operacional de gerir software de base de dados
- Cópias de segurança automatizadas e recuperação para um ponto no tempo
- Multi-AZ para failover automático com RTO mínimo
- Réplicas de leitura para escalonamento de tráfego de leitura
- Encriptação em repouso e em trânsito incorporada
- Todos os principais motores de base de dados relacionais suportados

**Onde o RDS tem limites**:

- Não pode aceder ao SO subjacente. Não pode instalar software personalizado ao nível do SO ou
  alterar definições do sistema operativo. Se a sua base de dados tiver requisitos que exijam
  acesso ao SO, pode precisar de correr a sua própria base de dados baseada em EC2.
- O RDS não é serverless (com excepções — Aurora Serverless existe, coberto no
  Capítulo 24). Paga por uma instância a correr mesmo que esteja inactiva.
- O RDS não é projectado para bases de dados com particionamento horizontal. Para escalonamento massivo
  de cargas de trabalho relacionais com muitas escritas, pode eventualmente precisar de uma arquitectura diferente.
- Para padrões de dados não relacionais (NoSQL), DynamoDB (Capítulo 9) é mais adequado.

## Resumo

- **Amazon RDS** é um serviço de base de dados relacional gerido. A AWS trata de patches,
  cópias de segurança, failover e gestão de armazenamento. Você trata do esquema, das consultas e
  da lógica de aplicação.
- A implantação **Multi-AZ** mantém um standby síncrono numa AZ diferente.
  O failover automático ocorre em 60 a 120 segundos se o primário falhar.
- As **cópias de segurança automatizadas** com **recuperação para um ponto no tempo** permitem restaurar para qualquer
  segundo dentro do período de retenção.
- As **réplicas de leitura** são cópias assíncronas que servem tráfego de leitura, reduzindo
  a carga no primário. O desfasamento de replicação significa que podem estar ligeiramente atrás.
- Escolha RDS quando precisar de uma base de dados relacional com operações geridas. Use Aurora
  (Capítulo 24) quando precisar de maior desempenho ou opções serverless.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.3 (soluções de base de dados)*

- **Multi-AZ é para alta disponibilidade, não desempenho.** O standby não serve
  tráfego de leitura. As réplicas de leitura são para desempenho. Esta distinção é testada frequentemente.
- **O failover Multi-AZ é automático.** Não configura quando ou como acontece.
  O RDS monitoriza o primário e desencadeia o failover automaticamente.
- **O desfasamento de replicação importa.** As réplicas de leitura podem estar ligeiramente atrás do primário.
  Se a sua aplicação precisa de ler dados que acabou de escrever, deve ler do
  primário, não da réplica. Isto chama-se "consistência de ler-as-próprias-escritas".
- **As cópias de segurança automatizadas são retidas por 0 a 35 dias.** Definir a retenção para 0
  desactiva as cópias de segurança automatizadas. Os snapshots manuais são retidos indefinidamente até
  os eliminar.
- **O auto-escalonamento de armazenamento RDS** evita paragens por disco cheio. Active-o. Só escala
  para cima, nunca para baixo. O exame pode testar se conhece esta assimetria.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: qual é a diferença entre Multi-AZ e réplicas de leitura no RDS?
Que problema cada um resolve?

*(Sugestão: Um protege contra tempo de inactividade; o outro melhora o desempenho sob carga intensa de leitura.
Resolvem problemas diferentes e podem ser usados em conjunto.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa corre uma base de dados PostgreSQL de produção em RDS. A base de dados
experimenta tráfego de leitura elevado devido a consultas de relatório a correr ao longo do dia.
A equipa também está preocupada com a disponibilidade da base de dados — não podem suportar mais de
alguns minutos de tempo de inactividade num cenário de falha. Querem minimizar o impacto na
base de dados primária das cargas de trabalho de relatório.

Qual combinação de funcionalidades RDS MELHOR aborda ambas as preocupações?

A) Activar Multi-AZ e correr todas as consultas contra a instância standby  
B) Activar Multi-AZ para protecção de failover e criar uma réplica de leitura para consultas de relatório  
C) Criar múltiplas réplicas de leitura e desactivar Multi-AZ para reduzir custos  
D) Tirar snapshots manuais mais frequentes e restaurar a partir deles se o primário falhar

**Sugestão 1**: Os dois requisitos são: (1) disponibilidade durante falha, (2) descarregar
leituras. Quais funcionalidades abordam qual requisito?

**Sugestão 2**: Multi-AZ fornece failover automático. O standby NÃO serve tráfego de leitura.
Portanto Multi-AZ sozinho não ajuda com o problema de leitura.

**Sugestão 3**: As réplicas de leitura servem tráfego de leitura. Multi-AZ fornece failover. Precisa de ambos.

**Resposta**: B

**Explicação**: Multi-AZ fornece failover automático para um standby numa AZ diferente —
isso aborda o requisito de disponibilidade. Uma réplica de leitura permite que consultas de relatório
corram sem impactar a base de dados primária — isso aborda o requisito de desempenho.
Ambas as funcionalidades podem ser usadas simultaneamente.

**Por que não A?** O standby Multi-AZ não pode servir tráfego de leitura. É exclusivamente para
failover. Tentar consultá-lo directamente não é suportado.

**Por que não C?** As réplicas de leitura ajudam com o desempenho de leitura mas não fornecem failover automático.
Se o primário falhar, teria de promover manualmente uma réplica de leitura —
o que demora tempo e não é automático.

**Por que não D?** Os snapshots manuais restauram uma cópia completa da base de dados — um processo muito mais longo
(potencialmente horas para bases de dados grandes). Isso não satisfaz um requisito de "alguns minutos
de tempo de inactividade".

*Domínio SAA-C03 3 — Tarefa 3.3*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a considerar migrar a sua base de dados PostgreSQL auto-gerida
(a correr numa instância EC2) para RDS PostgreSQL. A migração precisa de acontecer
com tempo de inactividade mínimo — idealmente menos de 15 minutos. A base de dados tem 200 GB.

Que abordagem recomendaria? Que serviços AWS poderiam ajudar com a migração?
Que riscos testaria antes de encaminhar tráfego de produção?

*(Não existe uma resposta única correcta. Pense no AWS Database Migration Service,
replicação lógica e o risco de inconsistência de dados durante o corte.)*

## Cena Pós-Créditos

No final do dia, Nimbus tinha migrado para RDS PostgreSQL com Multi-AZ activado. A
própria migração demorou a maior parte da tarde — Leo usou uma abordagem de cópia de segurança e restauro,
com uma breve janela de manutenção.

Tom tinha observado a factura atentamente.

"A instância RDS," disse ele, "custa o dobro do que a base de dados EC2 custava."

"E as cópias de segurança automatizadas?" perguntou Maya.

"Um pouco mais."

"E o failover que teremos de graça se o primário morrer?"

Tom não tinha preço para isso. Escreveu-o como uma pergunta.

Três dias depois, a base de dados estava saudável. Os tempos de consulta tinham baixado um pouco mas não
o suficiente. O menu ainda era lento a carregar. Vinte e dois mil itens. Vinte e dois mil
linhas numa consulta que os devolvia todos, sempre.

"O problema," disse Priya, "não é o motor da base de dados. É o modelo de dados."

Fez uma pausa.

"Alguns destes dados não são relacionais de todo. Itens de menu, perfis de restaurante,
zonas de entrega — estes dados têm formas variáveis. O SQL está a lutar contra nós."

Leo já estava a pesquisar algo.

"E se usarmos um tipo diferente de base de dados para o menu?" disse ele.

No próximo capítulo: a base de dados que não abranda, mesmo quando um milhão de pessoas encomenda ao mesmo tempo.
