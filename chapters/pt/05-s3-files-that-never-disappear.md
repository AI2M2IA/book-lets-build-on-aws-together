# Capítulo 5: O Arquivo Que Vive na Nuvem

Leo estava limpando a instância EC2 às nove da manhã quando encontrou a pasta.

O escritório estava quieto. Maya ainda não tinha chegado. O café ainda estava passando. Do lado de fora da janela, os primeiros trabalhadores iam passando aos poucos. Leo estava com os fones de ouvido e rolando pelos diretórios quando parou.

Oitocentos arquivos. Todos eles fotos de cardápio. Todos eles em uma única máquina sem backup.

A instância EC2 onde o app da Nimbus rodava tinha recebido um upgrade desde a interrupção de doze minutos, mas o armazenamento de fotos nunca tinha sido movido. Cada arepa crocante, cada prato de salmão grelhado, cada tigela de salada perfeitamente montada — em uma única máquina virtual que já tinham provado que podia cair sem aviso.

E se aquela máquina algum dia fosse reiniciada, redimensionada ou substituída?

Sumiu.

"Quantas fotos os clientes já enviaram até agora?" perguntou Maya, quando chegou.

Leo se virou. "Cerca de oitocentas."

"E o que acontece com essas oitocentas fotos se a gente reiniciar o servidor?"

Mais uma das pausas significativas do Leo.

Este capítulo é sobre onde os arquivos de fato pertencem na nuvem.

**O Problema de Armazenar Arquivos "No Servidor"**

Quando você armazena arquivos diretamente em uma instância EC2 — dentro do sistema de arquivos dela — você está
amarrando esses arquivos ao ciclo de vida daquela máquina específica.

Isso cria vários problemas:

**Efêmero por natureza.** Instâncias EC2 podem ser paradas, encerradas, substituídas. O
disco local delas não foi feito para ser permanente. É espaço temporário de trabalho.

**Ponto único de falha.** Se a instância falha, os arquivos vão com ela. Sem
redundância. Sem backup. Uma manhã ruim e oitocentas fotos de cardápio desaparecem.

**Não pode compartilhar entre instâncias.** Quando você adiciona um segundo servidor (e você vai, no
Capítulo 7), ele não vai ver os arquivos armazenados no disco do primeiro servidor. Os dois servidores
estão isolados. Um usuário que envia uma foto pode vê-la; outro usuário batendo em um servidor
diferente pode não ver.

**Sem escala.** O espaço em disco do EC2 é finito. Se você o enche, você ou para de aceitar
uploads ou corre para expandir o armazenamento sob pressão.

Leo não tinha considerado o que aconteceria com múltiplos servidores. Ele mencionou isso casualmente para Priya.

"Espera — como o problema das fotos funcionaria com dois servidores?" perguntou Priya.

"Como assim?"

"Se a gente tem o Servidor A e o Servidor B atrás de um balanceador de carga," disse Priya, "e um cliente envia uma foto — a requisição dele vai para o Servidor A, certo? Então a foto é salva no disco do Servidor A. Agora a próxima requisição dele vai para o Servidor B. O Servidor B não tem a foto. O que o cliente vê?"

Leo abriu a boca. Depois fechou.

"Uma imagem quebrada," disse ele finalmente.

"Ou um erro 404," disse Priya. "Ou, se a aplicação tenta carregá-la e trava, uma página de erro."

Ela esboçou o plano do balanceador de carga no quadro branco — adicionar um segundo servidor já estava no roadmap. No momento em que isso acontecesse, cada upload de foto se tornaria um cara ou coroa: upload para o Servidor A, possivelmente servido pelo Servidor B, foto faltando, cliente confuso.

"A gente teria ficado depurando isso por uma semana antes de descobrir o que estava errado," disse Leo.

"A gente pensou no que acontece quando ligarmos o Auto Scaling e de repente tivermos três ou quatro servidores?" perguntou Priya. "A gente estaria com fotos faltando constantemente."

Esta é uma classe de bug que não aparece em testes unitários. Ela só aparece em produção, sob carga, quando o tráfego real está espalhado por múltiplos servidores. A correção é parar de armazenar arquivos nos servidores por completo.

Há um modelo melhor. A AWS o construiu em 2006, e ele ainda é um dos serviços de nuvem mais
usados do mundo.

**O Disco Rígido Que Vive Online**

Imagine um disco rígido que vive na internet — um que escala para guardar tanto quanto
você jamais precisar, e cobra de você apenas pelo que você de fato usa. Você nunca o provisiona.
Você nunca se preocupa em ficar sem espaço. Se você coloca oitocentas fotos hoje
e oito milhões no ano que vem, nada muda do seu lado exceto o item da conta.

É isso que a AWS oferece. Eles chamam de **Amazon S3** — Simple Storage Service.

O S3 é o serviço de armazenamento de objetos da AWS. Não é bem como um sistema de arquivos, e não é bem
como um banco de dados. Ele armazena arquivos — chamados de objetos — em contêineres nomeados chamados buckets.
O modelo é simples, e essa simplicidade é o ponto.

O conceito-chave no S3 é o **objeto**.

Um objeto é qualquer arquivo: uma foto, um vídeo, um PDF, um CSV, um backup, um arquivo de log. O S3
não se importa com o tipo ou a estrutura. Ele armazena bytes e os devolve quando
você pede.

Objetos vivem dentro de **buckets**. Um bucket é como uma pasta de nível superior — um contêiner
nomeado dentro do S3 que guarda seus objetos. Cada bucket tem um nome globalmente único
(não pode haver dois buckets com o mesmo nome em todas as contas AWS) e existe em uma Região
específica.

**Como o S3 Funciona**

Você faz **upload** de um objeto para um bucket. O S3 dá a ele uma **chave** (key) — essencialmente um nome de caminho
como `menus/restaurant-001/photo-arepa.jpg`. Essa chave identifica unicamente o objeto
dentro do bucket.

Você faz **download** (ou recupera) o objeto usando o nome do bucket e a chave.

Você também pode tornar objetos acessíveis publicamente — significando que qualquer pessoa com a URL pode baixá-los.
É assim que a maioria dos sites serve imagens: armazene a imagem no S3, torne-a pública,
incorpore a URL no seu HTML.

Ou você mantém objetos privados — acessíveis apenas a requisições autenticadas. Este é o
modelo certo para dados de clientes, backups e qualquer coisa sensível.

O S3 não é um sistema de arquivos. Não há pastas reais. O `/` no nome de uma chave é apenas
uma convenção — o S3 trata a chave inteira como uma string plana. Mas parece pastas
e a maioria das ferramentas o apresenta como pastas, então não se preocupe com essa distinção na
prática.

Há algumas características operacionais do S3 que importam na prática mas não são
óbvias a partir da descrição:

**Imutabilidade de objeto**: objetos do S3 não são editados no lugar. Se você atualiza um arquivo, você
faz upload de uma nova versão do objeto com a mesma chave. O S3 substitui o objeto antigo pelo
novo (ou, com versionamento habilitado, mantém ambos). Diferente de um banco de dados onde você
faz `UPDATE` em uma linha, objetos do S3 são write-once, read-many (escreve uma vez, lê muitas).
Para arquivos de texto e documentos que você edita com frequência, isso está bem — apenas faça upload da
nova versão. Para arquivos muito grandes em que você quer atualizar só parte do conteúdo, o modelo de
objeto do S3 significa que você refaz o upload do arquivo inteiro toda vez.

**Forte consistência read-after-write**: a partir de dezembro de 2020, o S3 fornece forte
consistência para todos os objetos — novas escritas são imediatamente visíveis a leituras subsequentes.
Antes de 2020, o S3 tinha consistência eventual para algumas operações, o que causava bugs sutis
em aplicações que escreviam um objeto e imediatamente tentavam lê-lo. A melhoria do modelo de
consistência eliminou essa classe de bugs.

**URLs de objeto**: todo objeto do S3 tem uma URL. Para um objeto público, ela se parece com:
`https://bucket-name.s3.region.amazonaws.com/key/path`. Para objetos privados, você
pode gerar URLs pré-assinadas que incluem informação de autenticação e expiram após
um tempo configurado. Ambos os formatos de URL são como aplicações e navegadores de fato recuperam
objetos — não há protocolo proprietário envolvido.

**Sem diretórios para criar**: como o S3 não tem pastas reais, não há operações de criação de
diretório. Você simplesmente faz upload de um objeto com uma chave que inclui o prefixo de caminho.
A "pasta" aparece automaticamente no console quando objetos com aquele prefixo
existem, e desaparece automaticamente quando todos os objetos com aquele prefixo são excluídos.

**Por Que o S3 É Diferente de um Disco Rígido Comum**

Três coisas tornam o S3 fundamentalmente diferente do armazenamento de arquivos em uma instância EC2:

**Durabilidade.** A AWS projeta o S3 para 99,999999999% (onze noves) de durabilidade. Isso significa
que se você armazena dez milhões de objetos, você poderia esperar perder um objeto a cada dez
mil anos devido a falha de hardware. Eles conseguem isso armazenando múltiplas cópias
de cada objeto em pelo menos três Zonas de Disponibilidade automaticamente.

Mas a durabilidade protege contra falha de hardware — não contra você excluir algo acidentalmente. É para isso que serve o versionamento.

Há uma distinção importante entre **durabilidade** e **disponibilidade**. Durabilidade é sobre se seus dados ainda existem. Disponibilidade é sobre se você consegue acessá-los agora. O S3 Standard oferece 99,999999999% de durabilidade e 99,99% de disponibilidade. O número de durabilidade é quase incompreensivelmente alto; a cifra de 99,99% de disponibilidade é uma *meta de projeto* — cerca de 52 minutos de indisponibilidade por ano. O *SLA* contratual na verdade é mais baixo (99,9% por mês), e descumpri-lo lhe rende créditos de serviço, não uptime. Na prática, a disponibilidade do S3 é muito maior do que qualquer um dos números — mas vale entender que durabilidade e disponibilidade são garantias separadas, e que metas de projeto e SLAs são promessas separadas.

**Disponibilidade.** O S3 é projetado para ser acessível mesmo quando componentes individuais
falham. Você não está se conectando a um servidor — você está se conectando a um sistema distribuído
que contorna falhas.

**Escala.** O S3 guarda uma quantidade essencialmente ilimitada de dados. Um único bucket pode guardar
trilhões de objetos. A própria Amazon usa o S3 para armazenar dados em uma escala difícil de
compreender. Os maiores buckets do S3 do mundo guardam exabytes de dados — milhões de
terabytes. Você não gerencia essa escala; você apenas faz upload de objetos e o S3 cuida de
tudo por baixo.

**Custo.** O S3 Standard custa aproximadamente US$ 0,023 por GB por mês no momento desta escrita.
Para as oitocentas fotos de cardápio da Nimbus a uma média de 2MB cada, isso é 1,6 GB de
armazenamento — cerca de US$ 0,04 por mês. Mesmo com 800.000 fotos, você está olhando para US$ 37 por
mês de armazenamento. O custo do mesmo armazenamento em um volume EBS seria aproximadamente
US$ 128 por mês, com um teto fixo que exigia expansão antes de você poder adicionar mais.
O S3 cresce automaticamente e cobra proporcionalmente. O EBS tem tamanho fixo e custo fixo.

**Versionamento: O Botão Desfazer**

Eis algo que Maya encontrou quando estava explorando o console do S3.

O S3 suporta **versionamento**. Quando você habilita versionamento em um bucket, o S3 mantém toda
versão de todo objeto — incluindo versões anteriores e versões excluídas.

Este é o botão desfazer para seus arquivos.

Priya quis testá-lo antes de confiar nele. Ela fez upload de uma foto de cardápio para o bucket, depois fez upload de uma nova versão com o arquivo errado — uma imagem toda preta que ela criou em trinta segundos.

Ela abriu o console do S3, clicou em "Mostrar versões", e encontrou ambas: a versão ruim (atual) e a original (anterior). Ela restaurou a versão anterior copiando-a de volta como a nova versão atual.

"Funciona," disse ela.

"Quanto custa manter todas essas versões?" perguntou Tom.

Você paga pelo armazenamento de toda versão. Se você tem muitas versões de arquivos grandes, isso
soma. A AWS tem **políticas de ciclo de vida** (lifecycle policies) que excluem automaticamente versões antigas após
um certo tempo — cobrimos isso no Capítulo 23 quando vamos a fundo na otimização de custos.

"Então a gente habilita versionamento mas define uma regra de ciclo de vida para excluir versões antigas após trinta dias," disse Priya. "Assim a gente tem uma janela de recuperação sem pagar para armazenar toda versão para sempre."

Tom anotou o número. O custo de armazenamento de trinta dias de versões era aceitável.

**S3 Event Notifications: Arquivos Que Fazem Coisas**

Leo estava olhando para as fotos de cardápio de um ângulo diferente.

"Agora mesmo," disse ele, "quando um restaurante envia uma foto, a gente armazena o original em resolução cheia. Algumas delas são quatro mil por três mil pixels. Toda vez que um cliente carrega a página de cardápio num celular, a gente está servindo uma imagem de quatro megabytes."

"Quanto isso custa em banda?" perguntou Tom.

Leo abriu os números de transferência de dados na conta. A resposta era "mais do que deveria".

O S3 tem um recurso chamado **Event Notifications** (Notificações de Evento). Quando um objeto é enviado para um bucket, o S3 pode automaticamente disparar outro serviço — como o Lambda, o serviço de computação serverless que cobrimos no Capítulo 20. Esse gatilho pode rodar código em resposta ao upload sem nenhuma intervenção manual.

A solução da Nimbus: toda vez que uma foto é enviada para o bucket de fotos brutas, uma S3 Event Notification dispara uma função Lambda. A função Lambda lê a foto original, gera uma miniatura de 400 pixels de largura, e a salva em um bucket de fotos processadas. O app voltado para o cliente serve a miniatura em vez do original.

O pipeline:

1. Restaurante faz upload da foto original de 4MB para `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. O S3 dispara a Event Notification
3. A função Lambda lê o original, gera uma miniatura de 400x300
4. O Lambda salva a miniatura em `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. O cliente carrega o cardápio, o app serve a miniatura de 40KB em vez do original de 4MB

O resultado: 99% de redução na banda de imagem. Carregamentos de página mais rápidos. Uma linha menor de transferência de dados na conta. Os originais são preservados no bucket bruto, então se a Nimbus algum dia quiser gerar versões de resolução mais alta, o material-fonte está lá.

"Isso roda automaticamente?" perguntou Maya.

"Toda vez que alguém faz upload de uma foto," disse Leo. "A gente nunca toca nele."

Esse padrão — processamento orientado a eventos disparado por eventos de armazenamento — é um dos padrões mais comuns e poderosos na arquitetura de nuvem moderna. Nós o revisitamos detalhadamente no Capítulo 20.

**Cross-Region Replication: Quando Uma Cópia Não É Suficiente**

Priya levantou uma questão de conformidade no fim da semana.

"Se a Nimbus se expande para atender restaurantes na UE," disse ela, "e esses restaurantes enviam fotos — essas fotos são armazenadas no nosso bucket em `us-west-2`?"

"Sim," disse Leo.

"E o GDPR tem algo a dizer sobre onde esses dados são armazenados?"

Tem. As disposições de transferência de dados do GDPR significam que dados pessoais sobre residentes da UE podem exigir armazenamento dentro da UE ou em uma jurisdição com proteção de dados adequada.

A resposta do S3 para isso é a **Cross-Region Replication** (CRR). Quando você habilita CRR em um bucket, todo novo objeto enviado é automaticamente replicado para um bucket em outra Região. Você configura o bucket de origem, o bucket de destino, e a função IAM que dá ao S3 permissão para executar a replicação.

Quando a expansão para a UE acontecer, o plano é este: fotos enviadas por restaurantes da UE vão para um bucket em `eu-west-1`, e a CRR vai replicá-las para um bucket de backup em `eu-central-1` (Frankfurt) para recuperação de desastres. Dados da UE permanecem em Regiões da UE.

"Quanto isso custaria?" perguntou Tom.

Custos de transferência e armazenamento de dados entre regiões se aplicam — aproximadamente a taxa de transferência por GB da Região de origem até o destino, mais o armazenamento das cópias replicadas. Tom fez as contas sobre o volume projetado de fotos da UE da Nimbus e determinou que seria aceitável.

"E se alguém tentar invadir o pipeline de replicação?" perguntou Priya. "A função IAM que executa a replicação deveria ser escopada de forma restrita — apenas ações de replicação do S3, apenas nos buckets específicos."

Ela escreveu esse requisito no plano de expansão.

**Multipart Upload e o Problema do Upload Incompleto**

Tom encontrou um item inesperado na conta da AWS.

"A gente está pagando por armazenamento no S3," disse ele, "mas o valor está mais alto do que eu esperaria pela quantidade de fotos que a gente tem."

Leo investigou. Ele encontrou uma categoria no relatório do S3 Storage Lens: **uploads multipart incompletos**.

Quando o S3 faz upload de um arquivo maior que um certo tamanho, ele usa o **multipart upload**: o arquivo é dividido em partes, cada parte é enviada separadamente, e então as partes são montadas no objeto final. Isso torna uploads grandes mais confiáveis — se uma parte falha, apenas aquela parte precisa ser retentada, não o arquivo inteiro.

Mas se um multipart upload é iniciado e depois abandonado — o usuário fechou o navegador, a rede caiu, a aplicação travou — as partes parciais permanecem no S3, acumulando cobranças de armazenamento. Elas não são visíveis como objetos completos, mas estão sendo cobradas como armazenamento.

"Quanto?" perguntou Tom.

"Cerca de US$ 12 por mês," disse Leo. "De uploads parciais que nunca foram concluídos."

A correção: uma **regra de ciclo de vida** do S3 que exclui automaticamente uploads multipart incompletos após sete dias. Qualquer upload que não tenha sido concluído em uma semana é abandonado, e as partes parciais são limpas.

Tom adicionou a regra de ciclo de vida naquela tarde. A cobrança de US$ 12/mês desapareceu em poucos dias.

"Isso é US$ 144 por ano," disse Tom, olhando para a planilha. "Por nada."

"Eu já configurei um teste de carga que usava multipart uploads," disse Leo. "Ah." Uma pausa. "Provavelmente são a maioria deles. Esqueci de limpar quando o teste terminou."

Tom anotou mesmo assim.

**Controle de Acesso: Público vs. Privado**

Por padrão, tudo no S3 é privado. Apenas sua conta AWS pode acessá-lo.

Você pode tornar objetos individuais públicos — que é como você serviria imagens de cardápio a
visitantes de site. Ou você pode manter tudo privado e gerar **URLs pré-assinadas**:
links com tempo limitado que deixam alguém baixar um objeto específico sem precisar de credenciais
da AWS. Perfeito para deixar um cliente baixar sua fatura por 24 horas.

Priya tinha opiniões muito fortes sobre isso.

"E se alguém tentar invadir através de um bucket mal configurado?" disse ela. "Nunca torne um bucket totalmente público a menos que você tenha conscientemente decidido tornar todo
objeto nele acessível à internet inteira. O erro de segurança de S3 mais comum
é expor acidentalmente um bucket que contém dados sensíveis."

A AWS agora tem uma configuração "Block Public Access" que você pode aplicar no nível da conta,
forçando todos os buckets a serem privados a menos que você explicitamente a sobreponha por bucket.

Habilite-a. Sempre.

A história por trás disso: antes de a AWS adicionar o Block Public Access no nível da conta, o
incidente de segurança de S3 mais comum era tornar acidentalmente um bucket público. Um desenvolvedor criava
um bucket para teste, marcava a caixa "público" por conveniência, adicionava alguns arquivos incluindo
alguns de outras pastas em que ele não tinha pensado, e depois esquecia dele. O bucket
ficava lá, publicamente acessível, por meses. Em alguns casos de grande repercussão, o "bucket de teste
esquecido" continha dados de clientes, documentos internos ou credenciais.

O Block Public Access no nível da conta é uma salvaguarda contra isso. Mesmo que um desenvolvedor
acidentalmente configure um bucket para ser público, a configuração no nível da conta a sobrepõe.
Você tem que explicitamente desabilitar a configuração no nível da conta antes de qualquer bucket poder se tornar
público — o que cria um obstáculo deliberado que previne acidentes.

A Nimbus tinha o Block Public Access habilitado no nível da conta. Então como imagens de cardápio
que precisavam ser publicamente acessíveis seriam servidas? O padrão-padrão — um que a Nimbus
adotaria depois, no Capítulo 13 — é colocar uma CDN como o CloudFront na frente do
bucket com uma política de Origin Access Control: a CDN pode buscar objetos de um bucket
S3 privado, mas ninguém pode acessar o bucket diretamente. Esse padrão é mais seguro que
um bucket público e permite que o cache da CDN reduza os custos de requisição do S3.

"Espera — mas *por que* a gente faria desse jeito?" perguntou Maya. "As imagens são públicas de qualquer forma,
então por que importa se o bucket é público?"

"Porque um bucket público significa que qualquer pessoa pode enumerar o que tem nele," disse Priya. "Eles
podem listar todos os objetos no bucket. Com o CloudFront na frente, eles só veem as
URLs que a gente expõe na aplicação. O bucket em si permanece privado."

Maya adicionou "enumerar" ao seu modelo mental de superfícies de ataque.

**Classes de Armazenamento do S3: Nem Todo Dado É Igual**

Nem todo dado é acessado igualmente.

Suas fotos de cardápio mais populares são buscadas dezenas de vezes por segundo. Seus logs de
três anos atrás são acessados talvez uma vez por ano, se é que são. O S3 reconhece isso e oferece
diferentes **classes de armazenamento** com diferentes trade-offs de desempenho e custo.

| Classe de Armazenamento | Caso de Uso                                       | Obtenção          | Custo                          |
|-------------------------|---------------------------------------------------|-------------------|--------------------------------|
| S3 Standard             | Dados acessados frequentemente                    | Imediata          | Mais alto por GB               |
| S3 Standard-IA          | Acesso infrequente, mas precisa de obtenção rápida| Imediata          | Mais baixo por GB, taxa de obtenção |
| S3 Glacier Instant      | Arquivos acessados ocasionalmente                 | Imediata          | Muito mais baixo               |
| S3 Glacier Flexible     | Arquivos raramente acessados                      | Minutos a horas   | Muito baixo                    |
| S3 Glacier Deep Archive | Arquivos de conformidade, acessados quase nunca   | Até 12 horas      | O mais baixo                   |

Vamos a fundo nestes no Capítulo 23. Por enquanto: o conceito é que você pode automaticamente
mover objetos entre classes de armazenamento com base na idade e nos padrões de acesso deles, economizando
dinheiro significativo em dados que você raramente toca.

Há também o **S3 Intelligent-Tiering** — uma classe de armazenamento que move automaticamente
objetos entre camadas de acesso frequente e infrequente com base nos padrões de acesso
observados. Você paga uma pequena taxa de monitoramento por objeto por mês, e o S3 cuida do
tiering automaticamente. Isso é útil quando você não tem certeza de quais objetos serão
acessados com frequência e quais não — o serviço aprende o padrão e otimiza
de acordo.

A abordagem do Tom era mais manual: "Eu quero saber para onde cada dólar está indo." Ele escolheu
regras de ciclo de vida explícitas em vez do Intelligent-Tiering, porque regras explícitas são previsíveis
e auditáveis. Depois de seis meses operando o armazenamento S3 da Nimbus, ele tinha um quadro claro
dos padrões de acesso e pôde definir regras de ciclo de vida que moviam objetos para Standard-IA
após 30 dias e para Glacier Flexible Retrieval após 180 dias.

A economia total de armazenamento da gestão de ciclo de vida no primeiro ano: aproximadamente
US$ 340. Não muda a vida, mas é real — e o padrão se repete em dezenas de buckets
em qualquer conta AWS séria.

"Isso é quase uma passagem de avião ida e volta," disse Maya.

"É uma boa prática de engenharia," disse Tom. Ele colocou na planilha.

Há uma armadilha na seleção de classe de armazenamento que pega muitas equipes: a **duração
mínima de armazenamento**. O S3 Standard-IA tem uma duração mínima de armazenamento de 30 dias — se você
armazena um objeto em Standard-IA e o exclui após 15 dias, você ainda paga por 30 dias.
O Glacier Flexible Retrieval tem um mínimo de 90 dias. O Glacier Deep Archive tem um mínimo de
180 dias.

Para objetos que são excluídos com frequência ou têm vidas curtas, esses mínimos tornam
as classes IA e Glacier mais caras que o Standard, não menos. Antes de mover para uma
classe de armazenamento mais barata, verifique se os objetos vão de fato viver lá tempo suficiente para
a economia exceder as penalidades de duração mínima.

## Pontos Fortes e Limitações

**Por que o S3 é excelente**:

- Durabilidade de onze noves. Seus dados estão mais seguros no S3 do que em quase qualquer outro sistema.
- Escala ilimitada. Você nunca precisa provisionar armazenamento — ele simplesmente cresce.
- Extremamente barato pelo que fornece (frações de centavo por GB por mês).
- Integração nativa com quase todos os outros serviços da AWS.
- Suporta hospedagem de site estático — você pode servir um site estático completo
  diretamente do S3, sem servidor necessário.
- Processamento orientado a eventos: S3 Event Notifications disparam Lambda, SQS ou SNS
  automaticamente quando objetos são criados ou excluídos, viabilizando pipelines de processamento
  poderosos sem polling ou jobs agendados.
- Cross-Region Replication para residência de dados de conformidade e recuperação de desastres.

**Onde o S3 não é a escolha certa**:

- O S3 não é um sistema de arquivos. Se sua aplicação precisa montar um drive e usá-lo como
  um disco local (lendo, escrevendo, modificando arquivos no lugar), o S3 é a ferramenta errada.
  Use o EFS (Elastic File System, Capítulo 6) ou o EBS em vez disso.
- O S3 tem latência que é perceptivelmente mais alta que um disco local. Para bancos de dados ou
  aplicações que precisam de I/O de acesso aleatório rápido, o armazenamento em bloco (EBS, Capítulo 6)
  é apropriado.
- A transferência de dados *para dentro* do S3 é livre de cobranças de banda — mas não inteiramente gratuita:
  todo upload é uma requisição PUT, e o S3 cobra por requisição. Fazer upload de milhões de
  objetos pequenos pode custar mais em taxas de requisição do que em armazenamento. A transferência de dados *para fora*
  custa dinheiro por GB. Ambas são surpresas de cobrança comuns — nós as abordamos no Capítulo 30.
- O S3 não é um banco de dados. Você pode armazenar e recuperar objetos por chave, mas você não pode
  consultar objetos pelo conteúdo deles, rodar agregações ou fazer operações relacionais.
  Se você precisa consultar o conteúdo de dados armazenados (não só recuperá-los por nome),
  você precisa de um banco de dados ou de um serviço como o Athena (Capítulo 26) que pode consultar objetos do S3
  usando SQL.
- O versionamento de objetos armazena custos que se acumulam. Toda versão anterior de todo objeto
  versionado é cobrada como armazenamento. Regras de ciclo de vida que expiram versões antigas
  não são opcionais — elas são parte da estratégia de gestão de custos para qualquer bucket
  com versionamento habilitado.

**Como Objetos do S3 São Criptografados**

"E se alguém tentar invadir?" perguntou Priya, previsivelmente, no dia em que as fotos foram ao ar. "Esses objetos estão criptografados em repouso?"

Estavam — e isso vale a pena entender, porque a criptografia do S3 é um dos tópicos mais testados no exame. Todo objeto enviado para o S3 é criptografado em repouso por padrão. A questão é *quem detém a chave*:

**SSE-S3 (o padrão)**: o S3 criptografa todo objeto com chaves que o próprio S3 gerencia, usando AES-256. Você não faz nada, configura nada, paga nada. Desde janeiro de 2023, isso é automático em todo bucket. Para a maioria dos dados, é suficiente.

**SSE-KMS**: o S3 criptografa objetos com uma chave KMS — ou a chave gerenciada pela AWS `aws/s3` ou uma chave gerenciada pelo cliente que você controla (o Capítulo 16 cobre o KMS em profundidade). O que você ganha: uma trilha de auditoria no CloudTrail de todo uso de chave, a capacidade de controlar exatamente quem pode descriptografar via a política da chave, e a capacidade de revogar acesso desabilitando a chave. O que você paga: cobranças de API do KMS por requisição. Em taxas de requisição altas, habilite **S3 Bucket Keys** — o S3 deriva uma chave de curta duração no nível do bucket a partir da sua chave KMS, cortando chamadas de API do KMS (e custo) em até 99%.

**SSE-C**: você fornece sua própria chave de criptografia *a cada requisição*. A AWS a usa na memória e nunca a armazena. Para organizações cujas regras de conformidade dizem que a AWS nunca deve deter a chave. Operacionalmente exigente — perdeu a chave, perdeu os dados.

O padrão de exame: "criptografia com uma trilha de auditoria de uso de chave" ou "controlar quem pode descriptografar" → SSE-KMS. "A empresa deve gerenciar suas próprias chaves e a AWS nunca deve armazená-las" → SSE-C. "Criptografia em repouso sem sobrecarga de gestão" → SSE-S3 (já ligado).

**S3 Object Lock: Escreve Uma Vez, Lê Muitas**

Alguns dados devem ser *impossíveis* de excluir — não protegidos por política, estruturalmente imutáveis. Registros financeiros de negociações, logs de auditoria, evidência legal. O **S3 Object Lock** torna objetos não excluíveis e não modificáveis por um período de retenção, mesmo por administradores. Ele requer versionamento, e vem em dois modos que o exame adora contrastar: **modo governance** (usuários com uma permissão especial ainda podem contornar o lock) e **modo compliance** (ninguém pode encurtar a retenção ou excluir o objeto — nem mesmo o usuário root — até o período expirar). Frases regulatórias como "armazenamento WORM" ou "SEC Rule 17a-4" são gatilhos de exame para o Object Lock em modo compliance.

**S3 Transfer Acceleration: Uploads Rápidos de Longe**

Quando usuários fazem upload de arquivos grandes para um bucket do outro lado do mundo, a parte lenta é o longo caminho pela internet pública até a região do bucket. O **S3 Transfer Acceleration** dá ao bucket um endpoint especial que roteia uploads para a localização de borda da AWS mais próxima, e então os carrega pelo backbone privado da AWS até o bucket. Gatilho de exame: "usuários ao redor do mundo fazem upload de arquivos grandes para um bucket central; os uploads são lentos" → Transfer Acceleration (frequentemente pareado com multipart upload). Note a direção: o Transfer Acceleration é sobre colocar dados *para dentro* do S3; o CloudFront é sobre servir dados *para fora*.

Mais uma classe de armazenamento que vale conhecer agora: o **S3 One Zone-IA** — como o Standard-IA mas armazenado em uma única Zona de Disponibilidade, cerca de 20% mais barato, para dados acessados com pouca frequência que você poderia recriar se aquela AZ fosse perdida (miniaturas, relatórios regeráveis). É um distrator de exame padrão; o Capítulo 23 cobre o espectro completo de classes de armazenamento.


## Resumo

Oitocentas fotos em uma única instância era o problema. O S3 o resolveu — mas o S3 é mais do que um lugar para guardar arquivos. É um armazenamento de objetos durável, escalável, globalmente acessível, com seu próprio modelo de acesso, classes de armazenamento, políticas de ciclo de vida e sistema de eventos. Entender o que o S3 faz bem, e o que ele deliberadamente não faz, molda toda decisão de armazenamento que a equipe tomaria daqui para frente.

- O **Amazon S3** é armazenamento de objetos — arquivos (objetos) em contêineres nomeados (buckets). Ele armazena cópias em pelo menos três Zonas de Disponibilidade para durabilidade de onze noves. O S3 não é um sistema de arquivos: use EFS para montagens compartilhadas, EBS para armazenamento em bloco de instância única.
- Arquivos armazenados em instâncias EC2 ficam amarrados ao ciclo de vida daquela instância, causando bugs de fotos-faltando quando o tráfego se espalha por múltiplos servidores. O S3 resolve isso por ser independente de qualquer instância.
- O **versionamento** preserva versões anteriores de objetos. **Regras de ciclo de vida** automatizam transições entre classes de armazenamento e limpam uploads multipart incompletos que de outra forma acumulariam cobranças silenciosas.
- Por padrão, o S3 é privado. Habilite o "Block Public Access" no nível da conta. Sirva objetos públicos através do CloudFront com Origin Access Control em vez de tornar os buckets diretamente públicos.
- As classes de armazenamento do S3 deixam você casar custo com frequência de acesso — mas fique atento às cobranças de duração mínima de armazenamento antes de transicionar objetos de vida curta para camadas Infrequent Access ou Glacier.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.1 (soluções de armazenamento de alto desempenho)*

- **O S3 é armazenamento de objetos, não armazenamento em bloco.** Quando um cenário de exame precisa de um
  sistema de arquivos que múltiplos servidores possam montar, isso é EFS. Quando precisa de um disco
  para uma única instância EC2, isso é EBS. Quando precisa armazenar arquivos, backups,
  imagens ou dados acessados via HTTP — isso é S3.
- **Durabilidade de onze noves** significa que o S3 replica dados em múltiplas AZs
  automaticamente. Você não configura isso — é o padrão.
- **O S3 é regional**, mas acessível globalmente. Buckets existem em uma Região específica,
  mas você pode acessá-los de qualquer lugar.
- **URLs pré-assinadas** permitem acesso com tempo limitado a objetos privados. Padrão comum:
  sua aplicação gera uma URL pré-assinada válida por 15 minutos, a dá ao
  usuário, o usuário baixa o arquivo diretamente do S3.
- **O S3 Standard-IA** tem uma cobrança de duração mínima de armazenamento (30 dias). Não o use
  para dados que você vai excluir rápido. O exame testa se você conhece os trade-offs
  entre classes de armazenamento.
- **Árvore de decisão de classe de armazenamento**: *acessado frequentemente* → S3 Standard; *acessado com pouca frequência mas precisa de obtenção rápida* → S3 Standard-IA; *arquivo acessado ocasionalmente* → S3 Glacier Instant Retrieval; *arquivo raramente acessado* → S3 Glacier Flexible Retrieval; *arquivo de conformidade, quase nunca acessado* → S3 Glacier Deep Archive.
- **A Cross-Region Replication** requer que o versionamento esteja habilitado tanto no bucket de origem quanto no de destino. Questões de exame sobre recuperação de desastres ou soberania de dados frequentemente envolvem CRR.

## Exercícios

**Exercício 1 — Recordação**

Com suas próprias palavras: o que é um objeto do S3? O que é um bucket do S3? Por que armazenar arquivos
no S3 é melhor do que armazená-los no disco local de uma instância EC2?

*(Dica: Pense no que acontece com arquivos em uma instância EC2 se a instância for
encerrada. O que o S3 faz de diferente?)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de mídia produz vídeos documentários. Eles precisam armazenar imagens
originais em 4K (acessadas frequentemente durante a produção), cortes finais editados (acessados mensalmente
para distribuição), e masters de arquivo (mantidos indefinidamente mas acessados no máximo uma vez
por ano para fins de conformidade). Eles querem minimizar os custos de armazenamento atendendo aos
requisitos de acesso de cada camada.

Qual estratégia de armazenamento MELHOR atende às necessidades deles?

A) Armazenar imagens originais em S3 Standard, cortes finais em S3 Standard-IA, e arquivos
   em S3 Glacier Deep Archive  
B) Armazenar todo o conteúdo em S3 Standard para desempenho consistente e simplicidade  
C) Armazenar todo o conteúdo no armazenamento de instância EC2 para acesso mais rápido  
D) Armazenar todo o conteúdo em S3 Glacier Deep Archive para minimizar custos

**Dica 1**: Arquivos diferentes têm padrões de acesso diferentes. O S3 oferece diferentes classes
de armazenamento para diferentes frequências de acesso. Qual classe corresponde a "acessado frequentemente"?

**Dica 2**: Arquivos acessados "no máximo uma vez por ano" não precisam de obtenção imediata.
Qual classe de armazenamento é projetada para arquivamento de longo prazo a custo mínimo?

**Dica 3**: Case a frequência de acesso de cada camada com a classe de armazenamento apropriada.
Acessado frequentemente = Standard. Mensal = Standard-IA. Uma vez por ano = Glacier Deep Archive.

**Resposta**: A

**Explicação**: Esta estratégia casa corretamente cada camada de dados com a classe de armazenamento
S3 apropriada. As imagens originais acessadas frequentemente ficam em Standard para
acesso imediato sem taxas de obtenção. Os cortes finais acessados mensalmente vão para Standard-IA
(custo de armazenamento mais baixo, taxa de obtenção acessível). Os arquivos acessados uma vez por ano vão para
Glacier Deep Archive para o menor custo de armazenamento possível.

**Por que não B?** Armazenar tudo em Standard é simples mas caro.

**Por que não C?** O armazenamento de instância EC2 é efêmero e não apropriado para armazenamento
de mídia de longo prazo. Se a instância for encerrada, todo o conteúdo é perdido.

**Por que não D?** O Glacier Deep Archive tem tempos de obtenção de até 12 horas. Armazenar
imagens de produção acessadas frequentemente lá tornaria o trabalho de produção impossível.

*Domínio SAA-C03 3 — Tarefa 3.1 / Domínio 4 — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus armazena fotos de pedidos enviadas por clientes no S3. Uma regulação de proteção de dados
exige que as fotos de clientes sejam armazenadas por 7 anos mas possam ser excluídas após
isso. A equipe também quer minimizar o custo de armazenar fotos antigas de anos anteriores.

Projete uma estratégia de armazenamento S3 para este requisito. Quais classes de armazenamento você
usaria, e quando você transicionaria entre elas? O que você faria sobre o requisito de
exclusão?

*(Dica: Pense em políticas de ciclo de vida. Não há uma única resposta correta — raciocine
sobre os trade-offs de custo vs. tempo de obtenção.)*

## Cena Pós-Créditos

Leo migrou as fotos de cardápio para o S3 naquela tarde. Oitocentos objetos, armazenados com segurança
em três Zonas de Disponibilidade, com versionamento habilitado.

"Elas estão na verdade mais seguras agora do que estavam antes," disse ele, com alguma satisfação.

"Elas sempre estiveram mais seguras no S3," disse Priya. "A gente só esperou até depois de construir o
problema para corrigi-lo."

Leo aceitou isso.

Na manhã seguinte, Tom chegou com uma impressão. A conta da AWS, anotada em caneta vermelha.

"A gente tem um problema de banco de dados," disse ele. "A gente está rodando nosso banco de dados de pedidos na mesma
instância EC2 que o servidor web. E nosso banco de dados de cardápio. E nossos registros de clientes."

Ele fez uma pausa.

"Tudo está na mesma máquina. Uma máquina. Todos os nossos dados."

Maya olhou para a impressão. Depois para Tom. Depois para o teto.

"E se aquela máquina quebrar?"

Tom apontou para a anotação em caneta vermelha.

No próximo capítulo: a diferença entre um disco rígido que você aluga e um arquivo que o escritório inteiro compartilha.
