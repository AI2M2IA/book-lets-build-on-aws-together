# Capítulo 5: O Arquivo que Vive na Nuvem

Leo percebeu que Nimbus estava a guardar fotos de menus carregadas directamente na instância EC2.
Cada foto que os clientes carregam — a arepa crocante, o prato de salmão grelhado, a taça de salada perfeitamente emprionada — estava numa única máquina virtual.

E se essa máquina fosse alguma vez reiniciada, redimensionada ou substituída?

Desaparecida.

"Quantas fotos carregaram os clientes até agora?" perguntou Maya.

Leo abriu a consola. "Cerca de oitocentas."

"E o que acontece a essas oitocentas fotos se reiniciarmos o servidor?"

Mais uma das pausas significativas de Leo.

Este capítulo é sobre onde os ficheiros pertencem realmente na nuvem.

**O Problema de Guardar Ficheiros "No Servidor"**

Quando guarda ficheiros directamente numa instância EC2 — dentro do seu sistema de ficheiros — está
a associar esses ficheiros ao ciclo de vida dessa máquina específica.

Isto cria vários problemas:

**Efémero por natureza.** As instâncias EC2 podem ser paradas, terminadas, substituídas. O seu
disco local não é pensado para ser permanente. É espaço de trabalho temporário.

**Único ponto de falha.** Se a instância falhar, os ficheiros vão com ela. Sem
redundância. Sem cópia de segurança. Uma manhã má e oitocentas fotos de menus desaparecem.

**Não pode partilhar entre instâncias.** Quando adicionar um segundo servidor (o que fará,
no Capítulo 7), não verá os ficheiros guardados no disco do primeiro servidor. Os dois servidores
são isolados. Um utilizador que carrega uma foto pode vê-la; outro utilizador a aceder a um servidor diferente pode não a ver.

**Sem escala.** O espaço em disco EC2 é finito. Se o encher, ou pára de aceitar
carregamentos ou tenta expandir o armazenamento sob pressão.

Existe um modelo melhor. A AWS construiu-o em 2006, e continua a ser um dos serviços
cloud mais utilizados no mundo.

**Amazon S3: O Disco Rígido que Vive Online**

**Amazon S3** — Simple Storage Service — é o serviço de armazenamento de objectos da AWS.

Pense nele como um disco rígido que vive na internet. Um disco rígido infinito.
Um que é automaticamente copiado por múltiplas Zonas de Disponibilidade para que a perda
de qualquer centro de dados isolado não perca os seus ficheiros.

O conceito chave em S3 é o **objecto**.

Um objecto é qualquer ficheiro: uma foto, um vídeo, um PDF, um CSV, uma cópia de segurança, um ficheiro de log. O S3
não se preocupa com o tipo ou estrutura. Guarda bytes e devolve-os quando
os pede.

Os objectos vivem dentro de **buckets**. Um bucket é como uma pasta de nível superior — um
contentor com nome dentro do S3 que contém os seus objectos. Cada bucket tem um nome globalmente único
(dois buckets em todas as contas AWS não podem partilhar um nome) e existe numa Região específica.

**Como o S3 Funciona**

O modelo é simples, e essa simplicidade é o ponto.

**Carrega** um objecto para um bucket. O S3 dá-lhe uma **chave** — essencialmente um nome de caminho
como `menus/restaurante-001/foto-arepa.jpg`. Essa chave identifica de forma única o objecto
dentro do bucket.

**Descarrega** (ou obtém) o objecto usando o nome do bucket e a chave.

Também pode tornar os objectos publicamente acessíveis — o que significa que qualquer pessoa com o URL pode descarregá-los. É assim que a maioria dos websites serve imagens: guardar a imagem em S3, torná-la pública,
incorporar o URL no HTML.

Ou mantém os objectos privados — apenas acessíveis a pedidos autenticados. Este é o
modelo correcto para dados de clientes, cópias de segurança e qualquer coisa sensível.

O S3 não é um sistema de ficheiros. Não existem pastas reais. O `/` num nome de chave é apenas
uma convenção — o S3 trata a chave inteira como uma cadeia plana. Mas parece pastas
e a maioria das ferramentas apresenta-as como pastas, por isso não se preocupe com esta distinção na
prática.

**Por Que o S3 É Diferente de um Disco Rígido Normal**

Três coisas tornam o S3 fundamentalmente diferente do armazenamento de ficheiros numa instância EC2:

**Durabilidade.** A AWS projecta o S3 para 99,999999999% (onze noves) de durabilidade. Isso significa
que se guardar dez milhões de objectos, pode esperar perder um objecto a cada dez
mil anos devido a falha de hardware. Conseguem isso guardando múltiplas cópias
de cada objecto em pelo menos três Zonas de Disponibilidade automaticamente.

**Disponibilidade.** O S3 é projectado para ser acessível mesmo quando componentes individuais
falham. Não está a ligar-se a um servidor — está a ligar-se a um sistema distribuído
que contorna falhas.

**Escala.** O S3 contém uma quantidade essencialmente ilimitada de dados. Um único bucket pode conter
biliões de objectos. A própria Amazon usa o S3 para guardar dados numa escala difícil de
compreender.

**Versionamento: O Botão de Desfazer**

Aqui está algo que Maya encontrou quando estava a explorar a consola S3.

O S3 suporta **versionamento**. Quando activa o versionamento num bucket, o S3 mantém cada
versão de cada objecto — incluindo versões anteriores e versões eliminadas.

Este é o botão de desfazer para os seus ficheiros.

Carregou uma nova foto de menu que acidentalmente sobrescreveu a antiga? A versão antiga ainda
está lá. Eliminou um ficheiro por engano? É recuperável. Foi atingido por ransomware que
sobrescreveu todos os seus ficheiros com lixo encriptado? Com o versionamento, restaura a partir de
antes do ataque.

"Quanto custa manter todas essas versões?" perguntou Tom.

Paga pelo armazenamento de cada versão. Se tiver muitas versões de ficheiros grandes, acumula.
A AWS tem **políticas de ciclo de vida** que eliminam automaticamente versões antigas após
um certo tempo — cobrimo-las no Capítulo 23 quando aprofundamos a optimização de custos.

**Controlo de Acesso: Público vs. Privado**

Por defeito, tudo no S3 é privado. Apenas a sua conta AWS pode aceder a ele.

Pode tornar objectos individuais públicos — o que seria a forma de servir imagens de menus a
visitantes do website. Ou pode manter tudo privado e gerar **URLs pré-assinados**:
links com limite de tempo que permitem a alguém descarregar um objecto específico sem precisar de credenciais AWS. Perfeito para deixar um cliente descarregar a sua factura durante 24 horas.

Priya tinha opiniões muito fortes sobre isto.

"Nunca torne um bucket completamente público a não ser que tenha decidido conscientemente tornar cada
objecto nele acessível a toda a internet," disse ela. "O erro de segurança S3 mais comum
é expor acidentalmente um bucket que contém dados sensíveis."

A AWS agora tem uma definição "Bloquear Acesso Público" que pode aplicar ao nível da conta,
forçando todos os buckets a serem privados a não ser que os substitua explicitamente por bucket.

Active-a. Sempre.

**Classes de Armazenamento S3: Nem Todos os Dados São Iguais**

Nem todos os dados são acedidos igualmente.

As suas fotos de menus mais populares são obtidas dezenas de vezes por segundo. Os seus logs de
há três anos são acedidos talvez uma vez por ano, se tanto. O S3 reconhece isto e oferece
diferentes **classes de armazenamento** com diferentes compromissos de desempenho e custo.

| Classe de Armazenamento   | Caso de Uso                                          | Obtenção          | Custo                          |
|---------------------------|------------------------------------------------------|-------------------|--------------------------------|
| S3 Standard               | Dados acedidos frequentemente                        | Imediata          | Mais alto por GB               |
| S3 Standard-IA            | Acesso infrequente, mas obtenção rápida necessária   | Imediata          | Mais baixo por GB, taxa de obtenção |
| S3 Glacier Instant        | Arquivos acedidos ocasionalmente                     | Imediata          | Muito mais baixo               |
| S3 Glacier Flexible       | Arquivos raramente acedidos                          | Minutos a horas   | Muito baixo                    |
| S3 Glacier Deep Archive   | Arquivos de conformidade, acedidos quase nunca       | Até 12 horas      | O mais baixo                   |

Aprofundamos isto no Capítulo 23. Por agora: o conceito é que pode mover automaticamente
objectos entre classes de armazenamento com base na sua idade e padrões de acesso, poupando
dinheiro significativo em dados que raramente toca.

## Pontos Fortes e Limitações

**Por que razão S3 é excelente**:

- Durabilidade de onze noves. Os seus dados estão mais seguros no S3 do que em quase qualquer outro sistema.
- Escala ilimitada. Nunca precisa de provisionar armazenamento — simplesmente cresce.
- Extremamente barato pelo que proporciona (fracções de cêntimo por GB por mês).
- Integração nativa com quase todos os outros serviços AWS.
- Suporta alojamento de websites estáticos — pode servir um website estático completo
  directamente do S3, sem servidor necessário.

**Onde S3 não é a escolha certa**:

- O S3 não é um sistema de ficheiros. Se a sua aplicação precisar de montar uma drive e usá-la como
  um disco local (ler, escrever, modificar ficheiros no lugar), o S3 é a ferramenta errada.
  Use EFS (Elastic File System, Capítulo 6) ou EBS.
- O S3 tem latência notavelmente mais alta do que um disco local. Para bases de dados ou
  aplicações que precisam de I/O rápido e aleatório, o armazenamento de blocos (EBS, Capítulo 6)
  é adequado.
- Grandes transferências de dados para o S3 são gratuitas. Grandes transferências de dados *para fora* custam dinheiro.
  Esta é uma surpresa de facturação comum — abordamo-la no Capítulo 30.

## Resumo

- **Amazon S3** é armazenamento de objectos — um lugar para guardar ficheiros (chamados objectos) em
  contentores com nome (chamados buckets).
- O S3 é projectado para durabilidade de onze noves guardando automaticamente cópias de
  cada objecto em pelo menos três Zonas de Disponibilidade.
- Os ficheiros guardados em instâncias EC2 estão associados ao ciclo de vida dessa instância. Os ficheiros importantes pertencem ao S3, não ao servidor.
- O **Versionamento** preserva versões anteriores de objectos — o seu botão de desfazer.
- Por defeito, o S3 é privado. Active "Bloquear Acesso Público" ao nível da conta.
- O S3 tem múltiplas **classes de armazenamento** para diferentes padrões de acesso e custos.
  As classes de acesso infrequente são muito mais baratas, mas cobram taxas de obtenção.

## Dicas de Exame

*Domínio SAA-C03 3 — Tarefa 3.1 (soluções de armazenamento de alto desempenho)*

- **S3 é armazenamento de objectos, não armazenamento de blocos.** Quando um cenário de exame precisa de um
  sistema de ficheiros que múltiplos servidores possam montar, isso é EFS. Quando precisa de um disco
  para uma única instância EC2, isso é EBS. Quando precisa de guardar ficheiros, cópias de segurança,
  imagens ou dados acedidos via HTTP — isso é S3.
- **Durabilidade de onze noves** significa que o S3 replica dados por múltiplas AZs
  automaticamente. Não configura isto — é o comportamento por defeito.
- **S3 é regional**, mas acessível globalmente. Os buckets existem numa Região específica,
  mas pode aceder-lhes de qualquer lugar.
- **URLs pré-assinados** permitem acesso temporário a objectos privados. Padrão comum:
  a sua aplicação gera um URL pré-assinado válido por 15 minutos, dá-o ao
  utilizador, o utilizador descarrega o ficheiro directamente do S3.
- **S3 Standard-IA** tem uma duração mínima de armazenamento (30 dias). Não a use
  para dados que vai eliminar rapidamente. O exame testa se conhece os compromissos
  entre classes de armazenamento.
- **Árvore de decisão de classe de armazenamento**: *acedido frequentemente* → S3 Standard; *acedido infrequentemente mas precisa de obtenção rápida* → S3 Standard-IA; *arquivo acedido ocasionalmente* → S3 Glacier Instant Retrieval; *arquivo raramente acedido* → S3 Glacier Flexible Retrieval; *arquivo de conformidade, quase nunca acedido* → S3 Glacier Deep Archive. Quando um cenário menciona "optimização de custos" e "acesso infrequente", Standard-IA é quase sempre a resposta. Quando menciona "conformidade" ou "retenção de sete anos", pense em Glacier Deep Archive.

## Exercícios

**Exercício 1 — Recordar**

Com as suas próprias palavras: o que é um objecto S3? O que é um bucket S3? Por que razão guardar ficheiros
no S3 é melhor do que guardá-los no disco local de uma instância EC2?

*(Sugestão: Pense no que acontece aos ficheiros numa instância EC2 se a instância for
terminada. O que faz o S3 de forma diferente?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de média produz documentários em vídeo. Precisam de guardar metragem 4K original
(acedida frequentemente durante a produção), cortes finais editados (acedidos mensalmente
para distribuição) e masters de arquivo (guardados indefinidamente mas acedidos no máximo uma vez
por ano para fins de conformidade). Querem minimizar os custos de armazenamento enquanto satisfazem
os requisitos de acesso de cada nível.

Qual estratégia de armazenamento MELHOR satisfaz as suas necessidades?

A) Guardar todo o conteúdo em S3 Standard para desempenho consistente e simplicidade  
B) Guardar metragem original em S3 Standard, cortes finais em S3 Standard-IA e arquivos
   em S3 Glacier Deep Archive  
C) Guardar todo o conteúdo em armazenamento de instância EC2 para acesso mais rápido  
D) Guardar todo o conteúdo em S3 Glacier Deep Archive para minimizar custos

**Sugestão 1**: Ficheiros diferentes têm padrões de acesso diferentes. O S3 oferece diferentes classes de armazenamento
para diferentes frequências de acesso. Qual classe corresponde a "acedido frequentemente"?

**Sugestão 2**: Archives acedidos "no máximo uma vez por ano" não precisam de obtenção imediata.
Qual classe de armazenamento é projectada para arquivo de longo prazo ao custo mínimo?

**Sugestão 3**: Corresponda a frequência de acesso de cada nível à classe de armazenamento adequada.
Frequentemente acedido = Standard. Mensalmente = Standard-IA. Uma vez por ano = Glacier Deep Archive.

**Resposta**: B

**Explicação**: Esta estratégia corresponde correctamente cada nível de dados à classe de armazenamento S3 adequada.
A metragem original frequentemente acedida fica em Standard para
acesso imediato sem taxas de obtenção. Os cortes finais acedidos mensalmente vão para Standard-IA
(menor custo de armazenamento, taxa de obtenção acessível). Os archives acedidos uma vez por ano vão para
Glacier Deep Archive para o custo de armazenamento mais baixo possível.

**Por que não A?** Guardar tudo em Standard é simples mas caro. Está a pagar
preços premium por conteúdo de arquivo que raramente acede.

**Por que não C?** O armazenamento de instância EC2 é efémero e não é adequado para armazenamento de
média a longo prazo. Se a instância for terminada, todo o conteúdo é perdido.

**Por que não D?** O Glacier Deep Archive tem tempos de obtenção de até 12 horas. Guardar
metragem de produção frequentemente acedida lá tornaria o trabalho de produção impossível.

*Domínio SAA-C03 3 — Tarefa 3.1 / Domínio 4 — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus guarda fotos de encomendas carregadas por clientes no S3. Um regulamento de protecção de dados
requer que as fotos dos clientes sejam guardadas durante 7 anos mas possam ser eliminadas depois disso.
A equipa também quer minimizar o custo de guardar fotos antigas de anos anteriores.

Projecte uma estratégia de armazenamento S3 para este requisito. Que classes de armazenamento usaria
e quando faria a transição entre elas? O que faria em relação ao requisito de eliminação?

*(Sugestão: Pense em políticas de ciclo de vida. Não existe uma resposta única correcta — raciocine
sobre os compromissos entre custo e tempo de obtenção.)*

## Cena Pós-Créditos

Leo migrou as fotos de menus para S3 nessa tarde. Oitocentos objectos, guardados em segurança
em três Zonas de Disponibilidade, com versionamento activado.

"Estão na verdade mais seguros agora do que antes," disse ele, com alguma satisfação.

"Sempre estiveram mais seguros no S3," disse Priya. "Simplesmente esperámos até depois de construir o problema para o resolver."

Leo aceitou isto.

Na manhã seguinte, Tom chegou com uma impressão. A factura AWS, anotada com caneta vermelha.

"Temos um problema com a base de dados," disse ele. "Estamos a correr a nossa base de dados de encomendas na mesma
instância EC2 que o servidor web. E a nossa base de dados de menus. E os nossos registos de clientes."

Fez uma pausa.

"Tudo está na mesma máquina. Uma máquina. Todos os nossos dados."

Maya olhou para a impressão. Depois para Tom. Depois para o tecto.

"E se essa máquina avariar?"

Tom apontou para a anotação da caneta vermelha.

No próximo capítulo: a diferença entre um disco rígido que aluga e um arquivo que o escritório inteiro partilha.
