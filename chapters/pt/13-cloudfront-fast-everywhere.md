# Capítulo 13: Rápido em Todo o Lado

Uma foto a viajar de um servidor na Virgínia para um telemóvel em Seattle percorre cerca de 4 400 quilómetros de cabo de fibra óptica. A dois terços da velocidade da luz, são cerca de 25 milissegundos de pura física — inevitável, inegociável, integrado nas leis do universo.

Depois some a viagem de regresso. Depois some o tempo de processamento. O browser ainda não começou a renderizar e já se passaram 80 milissegundos.

`eatnimbus.com` estava activo. Leo tinha verificado as métricas de latência de utilizadores da Costa Oeste: 80 a 100 milissegundos por pedido. Pode parecer pequeno, mas acumula.

Carregue o menu: 90 ms. Carregue a lista de restaurantes: 80 ms. Carregue as fotos do restaurante: 200 ms (as imagens são grandes). Tempo total antes de um utilizador poder fazer uma encomenda: mais de meio segundo numa boa conexão.

"A física é o problema," disse Leo. "Os servidores estão na Virgínia. Os utilizadores estão na Costa Oeste."

"Então mova os servidores para a Costa Oeste," disse Tom.

"Isso custa dinheiro."

"Quanto?"

"Muito. E cria um problema completamente novo: manter a base de dados da Costa Leste e a da Costa Oeste em sincronismo."

Priya levantou os olhos do portátil. "Ou não movemos os servidores. Movemos o *conteúdo*."

**A Analogia do Armazém Pré-Abastecido**

Imagine a Amazon retalhista, não a empresa cloud. Têm um enorme armazém num único local com todos os produtos. Se enviassem cada encomenda a partir desse único armazém, os clientes em cidades distantes esperariam dias.

Em vez disso, a Amazon tem centros de distribuição perto de grandes centros populacionais. Quando um produto é popular, pré-abastecem esses armazéns locais. Quando um cliente em Seattle encomenda um livro, é enviado do centro de distribuição local — não da Virgínia.

Esta é uma **Rede de Distribuição de Conteúdo (CDN)**: uma rede de servidores geograficamente distribuídos que guardam em cache cópias do seu conteúdo perto dos seus utilizadores.

Quando um utilizador em Seattle pede a sua página inicial, a CDN serve-a a partir de um servidor em Seattle. Não na Virgínia. O pedido nunca atravessa o país.

**Conheça o CloudFront**

O Amazon CloudFront é a CDN da AWS. Opera através de uma rede global de **localizações de borda** — servidores de cache posicionados em cidades de todo o mundo. À data desta escrita, existem mais de 500 localizações de borda em mais de 90 cidades.

Quando configura o CloudFront, especifica uma **origem**: a fonte do seu conteúdo real. A sua origem pode ser:

- Um bucket S3 (ficheiros estáticos: imagens, CSS, JavaScript, PDFs)
- Um Application Load Balancer (conteúdo dinâmico da sua aplicação)
- Uma instância EC2
- Um servidor HTTP em qualquer lugar na internet

O CloudFront fica à frente da sua origem. Os pedidos chegam à localização de borda mais próxima. Se a borda tem o conteúdo em cache, devolve-o imediatamente. Se não (uma *falha de cache*), vai buscar à sua origem, guarda-o em cache e devolve-o.

**Como Funciona a Cache CloudFront**

O primeiro pedido de qualquer conteúdo é sempre uma falha de cache — vai para a origem. Todos os pedidos subsequentes vão para a cache na localização de borda.

Para Nimbus, as fotos de menus são candidatas perfeitas ao CloudFront. As fotos dos restaurantes mudam infrequentemente (talvez quando o restaurante actualiza o perfil). Com CloudFront:

1. Utilizador em Seattle pede `images.eatnimbus.com/restaurante-047/foto.jpg`
2. CloudFront verifica a localização de borda em Seattle — ainda não em cache (falha de cache)
3. CloudFront vai buscar ao S3 em us-east-1 (~80 ms)
4. CloudFront guarda a foto na localização de borda de Seattle
5. Próximo utilizador em Seattle pede a mesma foto
6. CloudFront serve da cache local (~5 ms)

A mesma penalização de 80 ms para o primeiro pedido. Mas o milésimo pedido da mesma cidade são 5 milissegundos.

Os cabeçalhos **Cache-Control** e as **definições de TTL** no CloudFront determinam quanto tempo o conteúdo fica em cache na borda. Os ficheiros de imagem podem ser guardados em cache durante horas ou dias. As páginas HTML (que mudam mais frequentemente) podem ser guardadas em cache durante minutos ou segundos.

**Conteúdo Dinâmico: CloudFront para Mais do Que Cache**

"E quanto às nossas respostas API?" perguntou Leo. "Essas são dinâmicas — mudam por utilizador, por pedido. Não se pode guardar em cache uma página de histórico de encomendas."

Verdade. Mas o CloudFront ainda ajuda com conteúdo dinâmico.

Mesmo quando o conteúdo não pode ser guardado em cache, o CloudFront encaminha o pedido da localização de borda para a origem através da rede privada da AWS — a fibra de alta velocidade que liga a infraestrutura AWS globalmente. Isto é mais rápido e mais fiável do que encaminhar pela internet pública, onde o tráfego pode saltar por múltiplos operadores.

O resultado: os pedidos dinâmicos ainda são 20 a 40% mais rápidos através do CloudFront do que indo directamente para a origem pela internet pública. Não por causa da cache, mas por causa do caminho de rede.

Adicionalmente, o CloudFront fornece:

**Terminação SSL/TLS**: O CloudFront trata de HTTPS na borda. A conexão entre o utilizador e o CloudFront é encriptada. O CloudFront pode ligar à sua origem via HTTP internamente (reduzindo a carga da origem) ou HTTPS (para encriptação de ponta a ponta).

**Protecção DDoS**: O CloudFront está integrado com AWS Shield Standard. O tráfego distribuído por centenas de localizações de borda significa que os ataques são absorvidos na borda em vez de martelar a sua origem.

**Restrição geográfica**: Bloqueia o acesso de países específicos. Se Nimbus só estiver licenciado para operar em certos mercados, o CloudFront pode impor isso na borda sem o pedido alguma vez chegar aos seus servidores.

**Comportamentos CloudFront: Regras de Cache Refinadas**

Uma distribuição CloudFront pode ter múltiplos **comportamentos** — regras de encaminhamento baseadas em padrões de URL.

Para Nimbus:

- `/images/*` → Guardar em cache na borda durante 7 dias (as fotos não mudam frequentemente)
- `/static/*` → Guardar em cache na borda durante 30 dias (CSS e JavaScript com nomes de ficheiro versionados)
- `/api/*` → Não guardar em cache; encaminhar directamente para o balanceador de carga
- `/*` → Guardar em cache durante 5 minutos (páginas HTML)

Isto permite ao CloudFront ser inteligente: guardar em cache agressivamente o que é estável, deixar passar o que é dinâmico.

**Origin Access Control: Proteger o S3 com CloudFront**

Se o seu bucket S3 contém conteúdo privado que deve ser servido apenas através do CloudFront (não directamente), pode usar **Origin Access Control (OAC)** para garantir que o S3 rejeita pedidos que não venham do CloudFront.

Desta forma:

- `d1234abcd.cloudfront.net/image.jpg` Servido (o CloudFront tem permissão)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Bloqueado (acesso directo ao S3 negado)

O seu conteúdo só é acessível através da sua distribuição, com as suas regras de cache e definições de segurança aplicadas.

## Pontos Fortes e Limitações

**Por que razão CloudFront é poderoso**:

- Localizações de borda em mais de 90 cidades — a maioria dos utilizadores obtém conteúdo a menos de 20 ms de distância
- Conteúdo estático servido em milissegundos de um dígito após a primeira cache
- Reduz significativamente a carga da origem (tráfego repetido nunca chega aos seus servidores)
- Integrado com AWS Shield, WAF e Certificate Manager
- Sem necessidade de planeamento de capacidade — o CloudFront escala automaticamente

**Onde fica complicado**:

- O conteúdo em cache pode ficar desactualizado — invalidar cache custa dinheiro (0,005 dólares por 1 000 caminhos)
- Os cabeçalhos Cache-Control devem ser definidos correctamente na origem — os erros causam conteúdo desactualizado
- O conteúdo dinâmico beneficia da optimização de encaminhamento mas não da cache
- Depurar o comportamento da cache (o que está em cache onde, durante quanto tempo) requer perceber múltiplas camadas: cabeçalhos da origem, definições de TTL CloudFront, regras de comportamento
- A transferência de dados para fora através do CloudFront custa dinheiro, embora menos do que a transferência de dados padrão

## Resumo

- Uma **CDN** guarda em cache cópias do seu conteúdo em localizações de borda perto dos seus utilizadores — reduzindo a latência e a carga da origem.
- **CloudFront** é a CDN da AWS, com mais de 500 localizações de borda globalmente.
- As falhas de cache vão buscar à **origem** (S3, ALB, EC2). Os acertos de cache servem da borda — milissegundos, não centenas de milissegundos.
- Os **comportamentos** permitem definir diferentes regras de cache para diferentes padrões de URL.
- O conteúdo dinâmico não é guardado em cache, mas o CloudFront ainda melhora o desempenho através da rede privada da AWS.
- O **Origin Access Control** restringe o acesso directo ao S3 — conteúdo servido apenas através do CloudFront.
- Integrado com Shield (DDoS), WAF (firewall de aplicação) e ACM (certificados SSL).

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho (Domínio 3, Tarefa 3.4)*

- **CloudFront + S3**: Padrão clássico do exame para servir websites estáticos globalmente. Bucket S3 como origem, CloudFront como CDN, Origin Access Control para evitar acesso directo ao S3.
- **Localizações de borda vs Regiões vs AZs**: As localizações de borda são mais numerosas e existem apenas para fins de cache/CDN. Não são o mesmo que AZs (que correm a sua computação).
- **Invalidação de cache**: Cria uma invalidação `/images/*` para forçar o CloudFront a ir buscar conteúdo fresco. Custa dinheiro — o exame pode pedir a alternativa mais eficiente em termos de custo: URLs versionados (`image-v2.jpg` em vez de `image.jpg`), que naturalmente contornam a cache.
- **Controlo de TTL**: `Cache-Control: max-age=3600` na origem define um TTL de cache de 1 hora. O CloudFront honra estes cabeçalhos.
- **CloudFront Functions vs Lambda@Edge**: As CloudFront Functions correm na borda para manipulação leve de pedidos/respostas (sub-milissegundo). O Lambda@Edge corre o seu código Lambda em localizações de borda para processamento mais pesado. O exame distingue-os por complexidade do caso de uso.
- **URLs assinados e Cookies assinados**: Controle quem pode aceder ao conteúdo através do CloudFront. Os URLs assinados dão acesso a ficheiros específicos; os cookies assinados dão acesso a múltiplos ficheiros. O exame usa-os para "conteúdo de subscritores pagantes".

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre um acerto de cache e uma falha de cache no CloudFront. O que acontece em cada caso?

*(Sugestão: Pense de onde vem o conteúdo e como o tempo de resposta difere entre os dois casos.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de software distribui ficheiros de instalação grandes (~2 GB cada) a partir de um bucket S3 para clientes em todo o mundo. As velocidades de download são lentas para clientes na Ásia. A equipa quer melhorar o desempenho sem replicar o bucket S3 para múltiplas regiões. Também precisam de garantir que apenas os clientes pagantes podem descarregar os instaladores.

Qual solução MELHOR satisfaz estes requisitos?

A) Activar S3 Transfer Acceleration no bucket e gerar URLs pré-assinados para clientes pagantes  
B) Usar CloudFront com o bucket S3 como origem, activar Origin Access Control e usar URLs Assinados CloudFront para clientes pagantes  
C) Criar um bucket S3 em cada Região AWS e usar encaminhamento por geolocalização Route 53 para dirigir clientes para o bucket mais próximo  
D) Usar um Application Load Balancer em cada região com instâncias EC2 que servem os ficheiros de instalação

**Sugestão 1**: O requisito é melhorar o desempenho global *sem* replicar o bucket. Qual opção não requer múltiplos buckets?

**Sugestão 2**: Qual serviço controla especificamente quem pode aceder ao conteúdo servido através do CloudFront?

**Sugestão 3**: O S3 Transfer Acceleration é optimizado para carregamentos de longa distância *para* S3. Para distribuir conteúdo *do* S3 a utilizadores globais, o CloudFront é a ferramenta certa.

**Resposta**: B

**Explicação**: O CloudFront guarda em cache os ficheiros de instalação em localizações de borda globalmente após o primeiro download. Os downloads subsequentes da mesma região vêm da borda — muito mais rápido do que atravessar o Pacífico a partir do S3 em us-east-1. O Origin Access Control garante que o bucket S3 só é acessível através do CloudFront. Os URLs assinados restringem o acesso a clientes pagantes.

**Por que não A?** O S3 Transfer Acceleration é optimizado para carregamentos de longa distância *para dentro* do S3 — não para distribuir conteúdo *do* S3 a uma audiência global. Para isso, o CloudFront é a ferramenta correcta. Os URLs pré-assinados controlam o acesso mas não melhoram o desempenho global.

**Por que não C?** Criar um bucket S3 por região funciona para desempenho, mas contradiz o requisito de evitar replicação. Também requer uma estratégia de sincronização de dados entre buckets.

**Por que não D?** As instâncias EC2 atrás de um balanceador de carga em cada região são significativamente mais caras do que o CloudFront e requerem a gestão de servidores em múltiplas regiões.

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho — Tarefa 3.4*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus quer adicionar conteúdo de vídeo — curtos vídeos tutoriais de culinária de parceiros de restaurante. Os vídeos podem ter entre 50 e 500 MB. Esperam que o mesmo vídeo seja visto por milhares de utilizadores na mesma cidade poucas horas após a publicação.

Projecte a arquitectura de armazenamento e entrega. Usaria S3 e CloudFront? Como trataria do primeiro pedido (arranque a frio) para minimizar o atraso antes de o vídeo ser guardado em cache? Que TTL de cache definiria para um vídeo que não vai mudar após a publicação?

*(Não existe uma resposta única correcta. O objectivo é praticar decisões de design CDN.)*

## Cena Pós-Créditos

Priya observou as métricas CloudFront após a implantação.

Taxa de acerto de cache: 83%.

"O que significa isso?" perguntou Tom.

"Significa que 83% dos nossos utilizadores estão a obter conteúdo de uma localização de borda perto deles, não de us-east-1."

"E os outros 17%?"

"Primeiros pedidos. Conteúdo que ainda não foi guardado em cache nessa localização de borda."

Tom fixou as métricas. "Portanto estamos a servir quase um milhão de pedidos por dia a partir de nós de borda CloudFront. E apenas 170 000 desses realmente atingem os nossos servidores."

"Sim."

"Portanto, se não tivéssemos CloudFront, os nossos servidores estariam a lidar com um milhão de pedidos."

"A 140 a 160 milissegundos cada, para utilizadores globais."

Tom recostou-se. Tinha um ar que Maya reconhecia — o ar de alguém a recalcular o custo em tempo real.

"Vale a pena," disse ele.

Maya já estava no portátil. "Dois novos engenheiros juntam-se a nós na próxima semana. Soo-Jin, da equipa de plataforma na última empresa dela, e Rafael — especializou-se em segurança. Quero que sejam integrados no IAM antes do primeiro dia."

"IAM avançado?" perguntou Leo.

"Funções, políticas, acesso entre contas. O verdadeiro."

No próximo capítulo: as permissões refinadas que permitem a uma parte do sistema falar com outra — em segurança.
