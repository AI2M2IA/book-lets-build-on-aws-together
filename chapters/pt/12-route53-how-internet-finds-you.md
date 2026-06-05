# Capítulo 12: Como a Internet o Encontra

Nimbus estava a funcionar. O balanceador de carga tinha um IP público. As instâncias EC2 tinham um IP privado. As bases de dados estavam fechadas em sub-redes privadas. Priya tinha acenade com aprovação ao diagrama de rede.

Tom olhou para o URL do balanceador de carga: `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

"É isso que os clientes escrevem no browser?" perguntou ele.

"É o que a AWS atribui automaticamente," disse Maya.

"Não vou colocar isso num cartão de visita."

"Eu também não."

Precisavam de um nome de domínio. Compraram `eatnimbus.com` num registador de domínios. Agora precisavam de ligar esse nome à sua infraestrutura AWS.

"Como sabe a internet que `eatnimbus.com` significa o balanceador de carga em us-east-1?" perguntou Leo.

Boa pergunta, Leo.

**A Analogia da Lista Telefónica**

Antes dos smartphones, cada cidade tinha uma lista telefónica. Se quisesse contactar "Pizzaria do Mário", não memorizava o número de telefone — procurava o nome, obtinha o número e ligava.

A internet tem a sua própria lista telefónica: o **Sistema de Nomes de Domínio (DNS)**.

O DNS traduz nomes legíveis por humanos (como `eatnimbus.com`) em endereços IP legíveis por máquinas (como `203.0.113.42`). Sempre que visita um website, o seu computador procura silenciosamente o nome de domínio no DNS e obtém o endereço IP para se ligar.

Se mudasse o endereço IP do servidor, actualizaria o registo DNS — como mudar o número na lista telefónica — e a internet encontraria no novo local.

**Conheça o Route 53**

O Amazon Route 53 é o serviço DNS gerido da AWS. Chama-se Route 53 porque a porta 53 é a porta DNS padrão. (Por vezes a AWS nomeia as coisas directamente.)

O Route 53 faz várias coisas:

**Registo de domínios**: Pode comprar nomes de domínio directamente através do Route 53.

**Alojamento DNS (zonas alojadas)**: Cria uma *zona alojada* para o seu domínio, e o Route 53 gere os registos DNS que dizem ao mundo onde o encontrar.

**Verificações de saúde**: O Route 53 pode monitorizar os seus endpoints e encaminhar tráfego para longe dos insalubres.

**Políticas de encaminhamento de tráfego**: O Route 53 suporta múltiplas estratégias de encaminhamento além do DNS simples — ponderado, baseado em latência, geolocalização, failover.

**Registos DNS: As Entradas da Lista Telefónica**

Um registo DNS mapeia um nome para um destino. Os tipos mais comuns:

**Registo A**: Mapeia um nome para um endereço IPv4.
`eatnimbus.com → 203.0.113.42`

**Registo AAAA**: Mapeia um nome para um endereço IPv6.

**Registo CNAME**: Mapeia um nome para outro nome (um alias).
`www.eatnimbus.com → eatnimbus.com`

**Registo MX**: Especifica que servidores tratam do e-mail para o domínio.

**Registo TXT**: Guarda texto arbitrário. Normalmente usado para verificação de domínio (provar que é dono do domínio) e autenticação de e-mail (SPF, DKIM).

Para Nimbus, a configuração principal:

- `eatnimbus.com` → Registo A apontando para o IP do balanceador de carga
- `www.eatnimbus.com` → CNAME apontando para `eatnimbus.com`
- `api.eatnimbus.com` → Registo A apontando para o balanceador de carga da API

"Espere," disse Tom. "O IP do balanceador de carga pode mudar. A AWS disse isso na documentação."

Boa observação, Tom.

**Registos Alias: A Solução da AWS para IPs Dinâmicos**

Os balanceadores de carga, distribuições CloudFront e websites S3 têm nomes DNS, não endereços IP estáticos. Os IPs subjacentes podem mudar.

Se criar um CNAME apontando para o nome DNS de um balanceador de carga, funciona — mas não pode usar CNAMEs para domínios raiz (`eatnimbus.com` sem o `www`) por causa de padrões DNS.

O Route 53 resolve isto com **registos Alias** — uma extensão DNS específica da AWS. Um registo Alias mapeia um nome directamente para um recurso AWS (balanceador de carga, distribuição CloudFront, website S3), e o Route 53 trata da resolução dinâmica do IP automaticamente. Os registos Alias podem ser usados ao nível do domínio raiz. E ao contrário das consultas DNS normais a serviços externos, as consultas de registos Alias a recursos AWS são gratuitas.

"Portanto usamos um registo Alias para `eatnimbus.com` apontando para o balanceador de carga," confirmou Leo.

"E o Route 53 trata de qualquer IP que o balanceador de carga esteja a usar em qualquer momento," acrescentou Priya.

"De graça," disse Tom, de repente muito interessado.

**Políticas de Encaminhamento: Mais do Que Apenas "Onde Está?"**

É aqui que o Route 53 fica interessante. O DNS não é apenas um serviço de pesquisa — pode ser uma ferramenta de gestão de tráfego.

**Encaminhamento simples**: Um registo, um destino. DNS padrão.

**Encaminhamento ponderado**: Divida o tráfego entre múltiplos destinos por peso. Envie 90% para o novo servidor, 10% para o antigo durante uma migração. Ajuste os pesos até estar confiante no novo servidor, depois mude para 100%.

**Encaminhamento baseado em latência**: Encaminhe utilizadores para a Região AWS com menor latência para eles. Um utilizador em Seattle é encaminhado para `us-west-2`. Um utilizador no Tóquio é encaminhado para `ap-northeast-1`. Mesmo nome de domínio, destinos diferentes.

**Encaminhamento por geolocalização**: Encaminhe com base na localização geográfica do utilizador. Todos os utilizadores europeus vão para `eu-west-1`. Todos os utilizadores da América do Norte vão para `us-east-1`. Útil para soberania de dados (manter dados de utilizadores UE em Regiões UE) ou personalização de conteúdo (idioma, moeda).

**Encaminhamento por failover**: Designe um endpoint primário e um secundário. Se o primário falhar na verificação de saúde do Route 53, o tráfego é automaticamente redirecionado para o secundário. Esta é a camada DNS da recuperação de desastres.

**Encaminhamento de resposta multi-valor**: Devolva até oito endereços IP saudáveis para uma consulta, deixando o cliente escolher. Uma alternativa simples a um balanceador de carga para distribuir tráfego por múltiplos servidores.

"Portanto, o Route 53 não é apenas uma lista telefónica," disse Maya. "É uma lista telefónica inteligente que pode encaminhar chamadas com base de onde está a ligar."

"E desligar-se se o número estiver insalubre," acrescentou Priya.

**Verificações de Saúde: Encaminhar em Torno de Falhas**

O Route 53 pode monitorizar os seus endpoints com verificações de saúde. Se um endpoint falhar, o Route 53 pode:

- Removê-lo de respostas DNS (parar de enviar tráfego para lá)
- Accionar um failover para um endpoint de reserva
- Enviar um alerta via CloudWatch

As verificações de saúde são a ligação entre o encaminhamento DNS e a saúde real da aplicação. Numa configuração de failover: o Route 53 monitoriza o endpoint primário a cada 30 segundos. Se três verificações consecutivas falharem, o Route 53 começa a devolver o endereço do endpoint secundário.

Isto não é instantâneo — o DNS tem tempo de propagação. Assim que o Route 53 muda um registo DNS, os resolvedores DNS por todo o mundo precisam de captar a alteração, o que pode demorar segundos a minutos dependendo das definições de TTL.

**TTL: A Cache DNS**

As respostas DNS são guardadas em cache em múltiplos níveis — no seu router, no seu ISP, no seu browser. O **TTL (Tempo de Vida)** num registo DNS diz às caches quanto tempo devem lembrar a resposta antes de verificar novamente.

TTL alto (1 hora ou mais): Menos consultas DNS, menor carga no Route 53, mas as alterações demoram mais a propagar.

TTL baixo (60 segundos ou menos): As alterações propagam-se rapidamente, mas são necessárias mais consultas DNS.

Antes de uma migração planeada (actualizar DNS para apontar para um novo servidor), baixe o TTL para 60 segundos com um dia de antecedência. Depois quando fizer a alteração, ela propaga-se em cerca de um minuto. Após a migração, suba-o de volta ao valor normal.

"Se o baixarmos só durante a migração e não antes," disse Leo devagar, "o TTL antigo significa que alguns utilizadores verão o servidor antigo durante uma hora."

"Exactamente," disse Priya. "As migrações DNS requerem planeamento antes da migração, não apenas durante."

## Pontos Fortes e Limitações

**O Route 53 é a escolha certa para**: registar e gerir nomes de domínio inteiramente dentro da AWS; encaminhar tráfego com base em latência, geolocalização ou distribuição ponderada em múltiplos endpoints; failover baseado em verificação de saúde entre regiões ou entre um endpoint primário e de recuperação de desastres; integrar DNS com outros serviços AWS através de registos alias.

**Quando o Route 53 não é o que precisa**: O Route 53 é um serviço DNS, não um balanceador de carga. Se precisar de distribuir tráfego entre múltiplos servidores ou contentores dentro de uma região, use um Application Load Balancer — o Route 53 não consegue fazer round-robin ponderado ao nível da conexão como um balanceador de carga consegue. O encaminhamento baseado em latência entre regiões acrescenta custo e complexidade operacional que só faz sentido quando os seus utilizadores estão genuinamente distribuídos globalmente e os milissegundos importam para a conversão. Para a maioria das aplicações de uma única região, um único registo A apontando para um ALB é toda a configuração Route 53 que precisa.

## Resumo

- **DNS** traduz nomes de domínio em endereços IP — a lista telefónica da internet.
- **Route 53** é o serviço DNS gerido da AWS: registo de domínios, alojamento DNS, verificações de saúde e políticas de encaminhamento.
- Os **registos A** mapeiam nomes para endereços IPv4. Os **CNAMEs** mapeiam nomes para outros nomes. Os **registos Alias** mapeiam nomes para recursos AWS (balanceadores de carga, CloudFront, S3).
- Use registos Alias (não CNAMEs) para domínios raiz e para recursos com IPs dinâmicos.
- As políticas de encaminhamento vão além do DNS simples: **ponderado** (divisão de tráfego), **baseado em latência** (desempenho), **geolocalização** (soberania de dados), **failover** (recuperação de desastres).
- As **verificações de saúde** monitorizam endpoints e removem automaticamente alvos insalubres das respostas DNS.
- Planeie as alterações de TTL antes das migrações — baixe o TTL com antecedência para que as alterações se propaguem rapidamente.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho (Domínio 3, Tarefa 3.4)*

- **Alias vs CNAME**: Os registos Alias podem ser usados no domínio raiz; os CNAMEs não podem. As consultas de registos Alias a recursos AWS são gratuitas; as consultas DNS CNAME têm preço. Quando o exame pede para mapear um domínio raiz para um balanceador de carga → registo Alias.
- **Casos de uso de política de encaminhamento** (cenários comuns do exame):
  - "Migrar gradualmente tráfego para uma nova versão" → Encaminhamento ponderado
  - "Encaminhar utilizadores para a Região AWS mais próxima" → Encaminhamento baseado em latência
  - "Manter dados de utilizadores UE em Regiões UE" → Encaminhamento por geolocalização
  - "Failover DNS automático quando o primário cai" → Encaminhamento por failover com verificações de saúde
- **Verificações de saúde Route 53**: Pode verificar endpoints HTTP/HTTPS/TCP e pode accionar alarmes CloudWatch. O exame usa-as em cenários de recuperação de desastres.
- **TTL e propagação**: Saiba que o TTL controla quanto tempo os resolvedores DNS guardam em cache um registo. TTL curto = alterações mais rápidas. Cenário do exame: "a equipa actualizou DNS mas os utilizadores ainda estão a aceder ao servidor antigo" → TTL demasiado alto.
- **Zonas alojadas privadas**: O Route 53 pode criar registos DNS que apenas resolvem dentro de um VPC. O exame usa-as para descoberta de serviços internos (ex.: `database.internal` a resolver para um endpoint RDS privado).
- O Route 53 é **global** — não é implantado numa região. Não é necessária selecção de região ao criar zonas alojadas.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre um registo CNAME e um registo Alias. Quando usaria cada um?

*(Sugestão: Considere as restrições nos CNAMEs em domínios raiz e o comportamento dos registos Alias com recursos AWS dinâmicos.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de média opera um website a partir de duas Regiões AWS: `us-east-1` (primária) e `eu-west-1` (secundária). A equipa quer que o tráfego seja automaticamente encaminhado para `eu-west-1` se a Região primária ficar indisponível. A empresa também quer verificar que este mecanismo de failover funciona correctamente sem realmente desactivar a Região primária.

Qual configuração Route 53 MELHOR satisfaz estes requisitos?

A) Encaminhamento ponderado com 100% de peso em `us-east-1` e 0% de peso em `eu-west-1`  
B) Encaminhamento baseado em latência com verificações de saúde em ambos os endpoints  
C) Encaminhamento por failover com uma verificação de saúde no endpoint primário e um registo secundário apontando para `eu-west-1`  
D) Encaminhamento por geolocalização com América do Norte apontando para `us-east-1` e Europa apontando para `eu-west-1`

**Sugestão 1**: O requisito é failover automático quando o primário cai. Qual política de encaminhamento é projectada exactamente para isto?

**Sugestão 2**: "Testar sem desactivar a Região primária" — as verificações de saúde podem ser forçadas manualmente para "insalubre" para testes.

**Sugestão 3**: O encaminhamento baseado em latência optimiza para velocidade, não para failover.

**Resposta**: C

**Explicação**: O encaminhamento por failover é projectado exactamente para este caso de uso. O registo primário aponta para `us-east-1` com uma verificação de saúde. O registo secundário aponta para `eu-west-1`. Se a verificação de saúde falhar, o Route 53 serve automaticamente o registo secundário. As verificações de saúde podem ser forçadas a falhar para testes sem realmente perturbar a Região primária.

**Por que não A?** O encaminhamento ponderado com 100%/0% é efectivamente estático — não muda automaticamente quando o primário falha.

**Por que não B?** O encaminhamento baseado em latência escolhe o endpoint mais rápido para cada utilizador. Não exclui automaticamente uma Região com base na saúde — ainda encaminharia algum tráfego para um `us-east-1` insalubre se a latência o favorecesse.

**Por que não D?** O encaminhamento por geolocalização encaminha por localização do utilizador, não por saúde do endpoint. Os utilizadores europeus ficariam presos no `eu-west-1` mesmo que `us-east-1` estivesse saudável, e os utilizadores norte-americanos não fariam failover para `eu-west-1` mesmo que `us-east-1` ficasse inoperacional.

*Domínio SAA-C03: Projectar Arquitecturas de Alto Desempenho — Tarefa 3.4*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a expandir internacionalmente. Querem que `eatnimbus.com` carregue rapidamente para utilizadores na Costa Oeste, Costa Leste e Austrália. Têm também um requisito regulatório: as encomendas feitas por utilizadores europeus devem ser processadas por servidores na UE.

Projecte uma estratégia de encaminhamento Route 53 que satisfaça ambos os requisitos. Que política de encaminhamento ou combinação de políticas usaria? Que infraestrutura em cada região precisaria?

*(Não existe uma resposta única correcta. O objectivo é praticar o design de encaminhamento multi-região.)*

## Cena Pós-Créditos

`eatnimbus.com` estava activo.

Maya tinha-o escrito no browser, e a página de encomendas Nimbus tinha carregado. Tinha encomendado arepa do restaurante da sua família, apenas para testar o fluxo. A encomenda tinha passado. A cozinha tinha-a recebido.

Recostou-se.

Tom já estava a ler os logs de verificação de saúde Route 53. "O tempo de resposta é de 47 milissegundos a partir de us-east-1."

"É rápido?" perguntou Maya.

"Para DNS? Sim."

"Mas para um utilizador em Seattle?"

Tom olhou para o gráfico de latência. "Cerca de 80 milissegundos."

Maya pensou nisso. "Se a maioria dos nossos clientes está na Costa Oeste, e os nossos servidores estão na Virgínia..."

"Cada pedido viaja de Seattle para a Virgínia e de volta," disse Leo do outro lado da sala. "Velocidade da luz. Não pode vencer a física."

"Portanto precisamos de servidores mais perto de Seattle."

"Ou algo mais perto de Seattle que sirva conteúdo em seu nome."

Esse pensamento ficou no ar.

No próximo capítulo: os armazéns que colocam o conteúdo de Nimbus a um milissegundo de distância de cada utilizador, em todo o lado.
