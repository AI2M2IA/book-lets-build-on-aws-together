# Capítulo 29: A Conta do Banco de Dados

Tom imprimiu as métricas do CloudWatch. Quatorze páginas. Ele as espalhou pela mesa antes de confiar em si mesmo para ler os números. Melhor ver tudo de uma vez do que encontrar surpresas no meio da página.

**Recapitulando: Armazenamento Feito, Bancos de Dados a Seguir**

A auditoria de armazenamento havia revelado US$ 6.700 em desperdício acumulado — não por más decisões, mas por desatenção. Volumes desvinculados, snapshots antigos, históricos de versão que ninguém havia mandado o S3 limpar, uploads multipart incompletos que vinham se acumulando silenciosamente por meses. Tom havia corrigido tudo, implementado regras de limpeza automática e passado para a próxima aba da planilha. A camada de dados era a maior incógnita restante: bancos de dados relacionais, tabelas NoSQL, nós de cache, armazenamento de backup, e um item da conta que vinha incomodando-o havia semanas.

Os itens da camada de dados em revisão:

Cluster Aurora: US$ 647/mês.
Réplicas de leitura RDS PostgreSQL legadas: US$ 340/mês.
Tabelas DynamoDB: US$ 340/mês.
ElastiCache: US$ 185/mês.
Snapshots manuais Aurora: US$ 87/mês.

Total da camada de dados em revisão: US$ 1.599/mês.

"Deixa eu entender cada um antes de decidir qualquer coisa," disse ele. "Porque o banco de dados não é o lugar para economizar dinheiro cortando cantos."

Isso era sábio. Configuração incorreta do banco de dados que causa perda de dados ou degradação de desempenho custa muito mais do que as economias.

Pense em um banco de dados como o motor de um carro. Você pode economizar dinheiro em um carro trocando para um combustível mais barato, ajustando a pressão dos pneus e removendo peso desnecessário do porta-malas. Mas se você tentar economizar pulando uma troca de óleo, corre o risco de fundir o motor — e um motor fundido custa muito mais do que qualquer economia de combustível. A auditoria que Tom está prestes a realizar segue a mesma lógica: encontre o desperdício no porta-malas e no tanque de combustível, e deixe o motor em paz até saber exatamente o que está fazendo.

**Entenda Primeiro a Carga de Trabalho do Banco de Dados**

A otimização de custos em bancos de dados requer entender a carga de trabalho antes de tocar em qualquer coisa. Tom havia aprendido isso de um quase-acidente seis meses antes: ele havia começado a reduzir o tamanho da instância do banco de dados com base na utilização média de CPU — 18% — sem antes olhar os números de p95. Um colega havia pedido para ele verificar as métricas do CloudWatch com mais cuidado. A CPU de p95 era de 61%, e durante um rush de jantar de sexta-feira particularmente pesado, havia atingido 84%.

"A média não te diz o que acontece no pico," disse Tom, quando contou a Priya sobre isso. "Se eu tivesse dimensionado para a média, teríamos sofrido throttling nas noites de sexta."

"É por isso que você olha o p95, não a média," disse Priya. "Sempre."

Esse princípio se estendia para além da CPU. Tom agora tinha um checklist padrão de pré-auditoria:

- CPU: p95, não a média
- Memória: FreeableMemory (em bytes absolutos, não porcentagem) — quão perto estamos do limite?
- Conexões: DatabaseConnections máximo nos últimos 30 dias — quão perto chegamos do limite de conexões?
- Proporção leitura/escrita: Determina se as réplicas de leitura estão justificando seu custo
- Taxa de crescimento de armazenamento: Quantos GB por mês estamos adicionando?
- Atraso de replicação (para réplicas): A réplica está acompanhando?

Perguntas-chave:

- Qual é a utilização média e de pico de CPU?
- Qual é a proporção leitura/escrita?
- O armazenamento está crescendo, estável ou diminuindo?
- As réplicas de leitura estão sendo utilizadas?
- A instância está subprovisionada (causando lentidão) ou superprovisionada (pagando por capacidade ociosa)?

Tom puxou as métricas do CloudWatch para os três serviços de banco de dados nos 30 dias anteriores:

**Cluster Aurora**:

- CPU média: 18% (p95: 61%; pico: 84% nas noites de sexta-feira)
- FreeableMemory: consistentemente acima de 4GB dos 8GB disponíveis. Não é uma preocupação.
- Proporção leitura/escrita: 14:1 (pesada em leitura)
- Armazenamento: 180GB (crescendo ~5GB/mês)
- DatabaseConnections máximo: 312 de 1.000 disponíveis. Confortável.

**Réplicas de leitura (RDS PostgreSQL, separadas do Aurora)**:

- Eram duas réplicas de leitura RDS legadas criadas antes da migração para o Aurora, ainda em execução.
- Conexões médias para cada uma: 2 por dia. CPU média: 3%.
- FreeableMemory: 7,2GB de 8GB disponíveis. As instâncias estavam quase ociosas.

"Por que essas ainda estão rodando?" perguntou Tom.

"Eu já tinha implantado elas — ah," disse Leo. Ele olhou as datas de criação das instâncias. "Eram para fallback durante a migração para o Aurora. Nunca as excluí."

Esse momento — quando algo caro ficou rodando por meses sem ser usado — é familiar em ambientes de nuvem. Leo havia criado as réplicas como uma rede de segurança. A rede de segurança nunca havia sido necessária. Mas ninguém havia feito a pergunta até agora.

"Como está a situação do pool de conexões?" perguntou Priya, inclinando-se. "Antes de excluí-las, algum componente da aplicação ainda está roteando leituras para lá?"

Tom verificou os logs de conexão. As duas conexões por dia vinham de um script de monitoramento que Priya havia escrito quatorze meses antes — ele consultava todos os endpoints de banco de dados conhecidos para verificar se estavam respondendo. As réplicas estavam sendo consultadas apenas pelo verificador de saúde, não por nenhum tráfego real de aplicação.

"Exclua-as," disse Maya.

As réplicas foram encerradas. Economia mensal: US$ 340.

**Quase-Acidente no Pool de Conexões**

Enquanto estava com as métricas de conexão abertas, Tom rodou uma verificação mais ampla em todos os endpoints de banco de dados. O que encontrou o fez parar.

O endpoint de escritor do Aurora mostrava um DatabaseConnections máximo de 312. Confortável. Mas o endpoint de leitor contava uma história diferente.

"O endpoint de leitor atingiu 847 conexões em três noites de sexta-feira consecutivas," disse Tom.

"Qual é o limite?" perguntou Priya.

"O limite para a nossa classe de instância atual é 1.000. Chegamos a 847. Isso é 85% do limite."

"E não percebemos porque só tínhamos alarme em 90%?" perguntou Maya.

"Não tínhamos alarme nenhum," disse Tom. "Não há nenhum alarme do CloudWatch nas conexões do endpoint de leitor. Só encontrei isso porque estava olhando as métricas brutas."

Em 1.000 conexões, o banco de dados recusa novas conexões. Qualquer thread da aplicação tentando adquirir uma conexão de banco de dados naquele momento lança uma exceção. Se essa exceção não for tratada graciosamente, o usuário vê um erro 500.

"Estávamos a trinta segundos de um incidente de noite de sexta," disse Leo. "Três vezes seguidas."

"Já pensamos no que acontece quando esse limiar é ultrapassado?" perguntou Priya.

"Os parceiros restaurantes veem pedidos falhando durante o rush de jantar," disse Maya. "Essa não é uma preocupação teórica."

Tom configurou um alarme do CloudWatch imediatamente: alerta em 750 conexões (75% do limite), chamada em 900 (90%). Ele também implementou o RDS Proxy para o endpoint de leitor — o RDS Proxy agrupa e gerencia conexões de banco de dados a partir da camada de aplicação, o que significa que cinquenta threads da aplicação podem compartilhar dez conexões de banco de dados. O proxy lida com a multiplexação. O banco de dados vê muito menos conexões mesmo quando a aplicação está sob carga pesada.

"Para o Aurora Serverless v2, o RDS Proxy é precificado em US$ 0,015 por ACU por hora, com uma cobrança mínima de 8 ACUs por proxy," disse Tom. "Mas se uma violação do limite de conexões causar até mesmo uma interrupção parcial numa noite de sexta, o custo de reputação para a Nimbus é ordens de magnitude maior."

"Quanto isso custa por mês?" Tom perguntou a si mesmo, rodando o número. O leitor deles roda em Serverless v2, então o proxy é cobrado contra o mínimo de 8 ACUs: US$ 0,015 × 8 × 730 = US$ 87,60/mês. Esse era um custo que ele ficava feliz em pagar.

Você pode estar se perguntando: se já estamos economizando dinheiro com o escalonamento automático do Serverless v2, por que se incomodar com Reserved Instances para a camada provisionada? A resposta é que o escalonamento do Serverless v2 tem um custo — você paga por ACU-hora, tenha planejado ou não. Para equipes que rodam configurações Aurora fixas, o compromisso de RI converte custo variável em custo previsível. Para as equipes que rodam instâncias provisionadas (não Serverless v2), essa distinção importa significativamente.

**RDS Reserved Instances: Para Camadas de Banco de Dados Provisionadas**

Assim como o EC2, o RDS oferece Reserved Instances para uso comprometido.

Para equipes usando configurações de instância Aurora fixas (não Serverless v2), as Reserved Instances podem economizar 30-60%. Veja como funciona a abordagem de RI provisionada: você se compromete com um tipo de instância específico por 1 ou 3 anos em troca de um desconto significativo na tarifa horária.

A título de ilustração: uma instância de escritor db.r6g.large a US$ 0,26/hora On-Demand custa US$ 190/mês. Uma Reserved Instance de 1 ano para a mesma reduz isso para aproximadamente US$ 108/mês — economizando US$ 82/mês por instância, ou quase US$ 1.000 por ano por instância de banco de dados.

**Aurora Serverless v2 vs Standard RI — O Ponto de Equilíbrio**

Tom rodou os números para a configuração Aurora específica deles. A pergunta: o escalonamento automático do Aurora Serverless v2 estava fornecendo benefício suficiente, ou uma instância provisionada fixa com um compromisso de Reserved Instance seria mais barata?

Preço do Serverless v2: US$ 0,12 por ACU-hora. O cluster deles escalava entre 0,5 ACU (ocioso) e 16 ACU (carga de pico). Nos últimos 30 dias, a média foi de 4,2 ACU.

Custo mensal do Serverless v2: 4,2 ACU × US$ 0,12 × 730 horas = US$ 368/mês para o escritor.

Compare: um db.r6g.xlarge fixo (o equivalente provisionado estimado deles, dimensionado para lidar com a carga de p95 dos dias úteis) com uma RI de 1 ano: US$ 0,52/hora × 0,60 (desconto de RI) × 730 = US$ 228/mês.

"A RI é mais barata," disse Leo.

"Para uma carga fixa, sim," disse Tom. "Mas olhe a amplitude. Nosso período de tráfego baixo — 2h às 7h, segunda a quinta — tem média de 0,8 ACU. Em uma instância provisionada fixa, estaríamos pagando por 8x o que estamos usando durante essas horas, simplesmente ocioso."

"E o Serverless v2 escala para baixo para acompanhar?"

"Para 0,5 ACU. O custo ocioso é uma fração do que pagaríamos por uma instância provisionada dimensionada para o pico."

O cálculo de ponto de equilíbrio: o Serverless v2 é mais barato quando a sua proporção pico/base está acima de cerca de 4:1. Para a Nimbus, com picos de sexta a 16 ACU e mínimos de segunda de manhã a 0,8 ACU — uma proporção de 20:1 — o Serverless v2 era a escolha certa. Se o tráfego deles tivesse sido mais consistente (digamos, 8 ACU ± 20%), uma RI provisionada teria sido mais barata.

"Não é só sobre qual número é menor neste mês," disse Tom. "É sobre qual modelo lida com nosso crescimento corretamente. Se crescermos 50% no próximo trimestre, o Serverless v2 simplesmente escala para cima. Uma RI provisionada precisaria de redimensionamento, e estaríamos pagando por folga não utilizada durante a transição."

Tom mapeou a comparação de um ano explicitamente para que a equipe pudesse acompanhar o raciocínio, não apenas a conclusão.

**Custo mensal do Aurora mês a mês: Serverless v2 vs RI provisionada**

A opção provisionada: um db.r6g.xlarge com uma Reserved Instance de 1 ano. Custo: US$ 0,52/hora On-Demand × 0,60 (desconto de RI) × 730 horas = US$ 228/mês. Fixo, independentemente da carga.

A opção Serverless v2: pague por ACU-hora a US$ 0,12. Variável, acompanhando a carga real.

Tom puxou 30 dias de métricas de ACU do Aurora Serverless v2 do CloudWatch e montou uma distribuição:

- 2h–7h, segunda–quinta (tráfego baixo): média 0,8 ACU → US$ 0,096/hora
- 7h–11h, dias úteis (moderado): média 3,2 ACU → US$ 0,384/hora  
- 11h–21h, dias úteis (horário comercial de pico): média 5,8 ACU → US$ 0,696/hora
- Sexta 18h–22h (rush de jantar): média 14,1 ACU → US$ 1,692/hora
- Sábado 12h–20h (movimento de fim de semana): média 9,3 ACU → US$ 1,116/hora
- Domingo (dia mais leve): média 2,1 ACU → US$ 0,252/hora

Média ponderada ao longo do mês inteiro: 4,2 ACU → US$ 0,504/hora → US$ 368/mês.

Em uma RI provisionada: US$ 228/mês. Serverless: US$ 368/mês. A opção provisionada economizava US$ 140/mês.

"Isso parece óbvio," disse Leo. "Por que estamos em Serverless?"

"Porque US$ 368 é a média," disse Tom. "Olhe as noites de sexta."

Sexta 18h–22h: média de 14,1 ACU. Para essa janela de quatro horas, o Serverless custa US$ 1,692/hora. Um db.r6g.xlarge a US$ 228/mês tem capacidade máxima de 32 GiB de memória — equivalente a cerca de 16 ACUs. O cluster Serverless estava com média de 14,1 ACUs durante essa janela, chegando no limite do xlarge sem margem para picos.

"Uma instância provisionada dimensionada para o nosso pico de sexta com folga real seria um db.r6g.2xlarge," disse Tom. "Na tarifa de RI, isso é US$ 1,04/hora × 0,60 = US$ 0,624/hora. Mensal: US$ 456/mês."

"Isso é mais do que a média Serverless de US$ 368," disse Maya.

"Certo. E se dimensionássemos a instância provisionada para a base dos dias úteis — o db.r6g.xlarge — as noites de sexta seriam um problema. Na carga de pico, estaríamos empurrando 14 ACUs em praticamente toda a capacidade do xlarge. Isso é saturação."

"Então você precisaria pré-dimensionar para o pico," disse Priya.

"Ao custo de pagar por capacidade ociosa nas outras 160 horas da semana," disse Tom. "A conta de RI provisionada que sai mais barata só funciona quando a sua proporção pico/base é baixa. A nossa é 20:1. Esse é exatamente o cenário para o qual o Serverless v2 foi projetado."

Ele mostrou os números lado a lado:

| Opção | Mês médio | Noite tranquila (2h) | Rush de sexta (20h) |
|---|---|---|---|
| Serverless v2 | US$ 368 | US$ 0,096/h | US$ 1,692/h |
| RI provisionada (r6g.xl) | US$ 228 | US$ 228/730h = US$ 0,312/h | no limite — risco de saturação |
| RI provisionada (r6g.2xl) | US$ 456 | US$ 0,624/h | folga confortável |

"A opção Serverless é US$ 368," disse Tom. "A opção provisionada dimensionada corretamente é US$ 456 — e isso é antes de contabilizar o custo operacional de monitorar e escalar manualmente a instância provisionada quando nossos padrões de tráfego mudarem no próximo trimestre."

"E o custo operacional," disse Priya, "não é nada desprezível."

"Não. Com o Serverless, não precisamos pensar no dimensionamento da instância. O Aurora cuida disso. Com provisionado, a cada trimestre eu precisaria reavaliar se a classe de instância atual ainda serve para o nosso tráfego. Isso não é caro em tempo, mas é algo que pode dar errado se pararmos de prestar atenção."

"Vai dar tudo certo desde que não esqueçamos de redimensioná-la," disse Leo, e então se corrigiu. "Que é exatamente quando não vai dar certo."

"Exatamente," disse Tom.

A conclusão se sustentava: o Serverless v2 a US$ 368/mês era a escolha certa para a proporção pico/base de 20:1 da Nimbus e para a preferência de sua equipe por simplicidade operacional. A RI provisionada só era atraente para equipes com tráfego que não variava significativamente — uma proporção de 2:1 ou 3:1 onde a instância provisionada raramente ficava ociosa.

"O que nos faria mudar para provisionado?" perguntou Maya.

"Se nosso padrão de tráfego se achatasse," disse Tom. "Se a Nimbus crescesse a ponto de a base de tráfego baixo também ser alta — digamos, 8 ACU às 2h em vez de 0,8 — a proporção cairia para 2:1 e o provisionado faria sentido econômico. Esse é um problema de negócio diferente. Um que gostaríamos de ter."


Para o Aurora com Serverless v2, as Reserved Instances não se aplicam diretamente — o Serverless v2 escala dinamicamente e você paga por ACU-hora. Esta é a configuração atual da Nimbus: tanto o escritor quanto o leitor Aurora primários usam Serverless v2. As economias para a Nimbus vêm da própria natureza de escalonamento automático do Serverless v2 — você não paga por capacidade não utilizada quando o tráfego está baixo.

Equipes que ainda rodam instâncias Aurora fixas devem avaliar o compromisso de RI assim que o tipo de instância estiver estável por três ou mais meses.

**DynamoDB: On-Demand vs Provisionado**

No Capítulo 9, apresentamos os dois modos de capacidade do DynamoDB: on-demand e provisionado.

A Nimbus havia estado executando o DynamoDB no modo on-demand desde o início. Com tráfego baixo, isso estava correto — o on-demand é mais caro por requisição, mas não tem cobrança mínima.

Agora, com 18 meses de dados de tráfego no CloudWatch, Tom podia ver padrões.

Requisições de leitura médias: 225 por segundo (cerca de 19,4 milhões por dia)
Requisições de escrita médias: 60 por segundo (cerca de 5,2 milhões por dia)
Dia de pico (sexta-feira): 180% das requisições médias do DynamoDB (o ElastiCache absorve ~95% das leituras, então o DynamoDB vê apenas uma fração do pico total de volume de pedidos de 25x)

**Preço on-demand**: US$ 1,25 por milhão de requisições de escrita, US$ 0,25 por milhão de requisições de leitura.
**Preço provisionado**: US$ 0,00065 por unidade de capacidade de escrita por hora, US$ 0,00013 por unidade de capacidade de leitura por hora.

Tom calculou o ponto de equilíbrio: a capacidade provisionada fica mais barata quando você a usa de forma consistente o suficiente para não pagar o prêmio on-demand durante os períodos ociosos.

(Uma observação sobre os números desta seção: eles refletem a conta da equipe na época, e são ilustrativos. No final de 2024, a AWS cortou os preços on-demand do DynamoDB em 50%, o que moveu substancialmente o ponto de equilíbrio — hoje, a capacidade provisionada só vence quando a utilização é consistentemente alta. Sempre refaça essa conta com os preços atuais.)

Com 18 meses de dados mostrando padrões diários consistentes, a capacidade provisionada com **DynamoDB Auto Scaling** era a escolha certa:

- Defina a capacidade mínima em 60% da carga média
- Defina o máximo em 250% da média (lida com os picos de sexta-feira)
- O Auto Scaling ajusta a capacidade provisionada entre esses limites

Custo mensal do DynamoDB: caiu de US$ 340 (on-demand) para US$ 230 (provisionado com auto scaling). Redução de 32%.

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya. "Estamos em on-demand desde o início porque não confiávamos nos nossos próprios padrões de tráfego. O que mudou?"

"Dezoito meses de dados," disse Tom. "Agora sabemos como são os nossos padrões — base consistente nos dias úteis, picos de sexta, períodos tranquilos de domingo. On-demand era a decisão certa quando não sabíamos. Provisionado com Auto Scaling é a decisão certa agora que sabemos."

"Mas se superprovisionarmos," perguntou Leo, "pagamos por capacidade não utilizada."

"Esse é o risco," disse Tom. "Com o Auto Scaling, definimos o mínimo alto o suficiente para evitar throttling e deixamos a AWS gerenciar dentro do nosso intervalo."

"E se o nosso padrão de tráfego mudar significativamente?"

"Então ajustamos os limites. Revisamos isso trimestralmente."

**ElastiCache: Dimensionamento Correto e a História de Advertência**

A conta do ElastiCache: US$ 185/mês. Uma instância cache.r6g.large do Redis em cada AZ (dois nós, primário + réplica).

As métricas do CloudWatch mostravam:

- Utilização média de memória: 34%
- Pico: 44%

A instância estava superprovisionada. Um cache.m6g.large — metade da memória do r6g.large — provavelmente lidaria com a carga com alguma folga.

Mas aqui Tom fez uma pausa. Ele lembrou do que havia acontecido em uma empresa anterior quando havia dimensionado um cache de forma agressiva — e contou à equipe a história completa, porque era o tipo de história que precisava ser contada antes de você se ver no meio dela.

Na empresa anterior dele — uma plataforma SaaS para relatórios financeiros — o cluster ElastiCache havia sido um cache.r6g.large. Dois nós, primário e réplica. Utilização média de memória: 26%. Pico observado: 37%. O engenheiro de plantão que o sinalizou havia feito a conta: um cache.m6g.large lidaria com a carga com 25% de folga acima do pico observado. Economia: US$ 60/mês — preço na região e geração de nó daquela empresa na época, menor do que a diferença equivalente na Nimbus hoje. A mudança foi aprovada em uma terça-feira.

No mês seguinte, em uma quinta-feira à noite às 23h47, o lote de liquidação de fim de mês começou.

O lote de liquidação rodava trimestralmente. Ele puxava os registros de transações de cada conta ativa dos três meses anteriores, agregava-os, calculava impostos e gravava registros de liquidação. O cache era usado para armazenar o estado intermediário de agregação — o total acumulado de cada conta conforme o lote progredia. O cache.r6g.large sempre havia dado conta. Ninguém havia olhado especificamente as métricas do lote de liquidação ao tomar a decisão de dimensionamento, porque o lote era trimestral e a janela de observação havia sido de quatro semanas.

Na instância medium, a maxMemoryPolicy estava definida como `allkeys-lru` — quando a memória estava cheia, o Redis despejava a chave usada menos recentemente para abrir espaço. Essa é a política correta para um cache geral. Mas para o lote de liquidação, cada chave no cache era ativamente necessária. Quando a memória encheu em 84% dos 6,38 GB da instância medium, o Redis começou a despejar chaves. Cada despejo era um cache miss. Cada cache miss enviava uma consulta ao banco de dados PostgreSQL subjacente para recalcular o valor despejado a partir dos registros brutos de transações.

O pool de conexões do banco de dados estava configurado para tráfego em estado estacionário, não para carga de lote de liquidação. Em quatro minutos do início dos despejos, o banco de dados tinha 847 conexões ativas. O limite de conexões era 1.000. Aos 9 minutos, as primeiras threads da aplicação começaram a ver erros de "too many connections". Aos 12 minutos, três serviços que compartilhavam o pool de conexões do banco de dados — o lote de liquidação, o serviço de relatórios em tempo real e a API voltada ao cliente — estavam todos afetados.

O engenheiro de plantão escalou às 23h59. A revisão do incidente começou às 0h08.

Primeira resposta: aumentar o timeout do Lambda para a função do lote de liquidação (o lote de liquidação era parcialmente baseado em Lambda). Isso estava errado. O timeout não era o problema.

Segunda resposta: adicionar uma segunda função Lambda para paralelizar o lote de liquidação. Também errado. Mais paralelismo significava mais acesso simultâneo ao cache, o que significava despejos mais rápidos, o que piorava a situação.

Terceira resposta: reduzir a escala do lote de liquidação para diminuir a pressão sobre o banco de dados. Isso ajudou um pouco, mas não resolveu a causa raiz.

Quarta resposta, às 2h31: restaurar o cache.r6g.large. A pressão de memória caiu imediatamente. Os despejos pararam. O pool de conexões do banco de dados se limpou. O lote de liquidação foi concluído às 4h17, atrasado em mais de quatro horas.

Total do incidente: quatro horas de desempenho degradado de API para clientes tentando acessar relatórios. Um lote de liquidação completo atrasado. Tempo de engenharia: aproximadamente 22 horas entre cinco engenheiros. Custo direto estimado: US$ 40.000.

A economia de US$ 60/mês havia custado US$ 40.000 em um único incidente.

"O erro não foi a decisão de dimensionamento," disse Tom. "A decisão era defensável com base nos dados disponíveis. O erro foi a janela de observação. Medimos quatro semanas de métricas. O lote de liquidação era trimestral. Estávamos olhando o período de tempo errado."

"Então como você evita isso?" perguntou Maya.

"Você pergunta: qual é a operação de maior risco que este cache suporta? E você encontra as métricas específicas dessa operação. Não a semana média. A semana específica — ou mês — ou trimestre — em que a carga é mais alta. E você dimensiona para isso."

"E se você não consegue encontrar as métricas porque a operação é rara?"

"Essa é a resposta," disse Tom. "Se você não consegue encontrar as métricas para um cenário específico de alta carga, a resposta correta é não dimensionar ainda. Espere a próxima ocorrência, instrumente-a fortemente, e depois dimensione com base no que você observou."

O cluster ElastiCache da Nimbus tinha sua própria operação de alto risco: o rush de jantar de sexta. Tom tinha esses dados — três noites de sexta consecutivas haviam atingido 44% de utilização de memória no r6g.large, cerca de 5,7 GB de dados ativos. No m6g.large com seus 6,38 GB, esse mesmo conjunto de trabalho já ficaria perto de 90% — e se qualquer coisa no pipeline de processamento de pedidos mudasse para usar mais espaço de cache — um novo recurso, uma estratégia de cache diferente — 90% vira território de despejo.

Ele rodou os números mesmo assim. Mudar de r6g.large para m6g.large: dois nós a US$ 0,127/hora versus dois nós a US$ 0,090/hora, rodando 730 horas por mês. Large: US$ 185/mês. O par m6g: US$ 131/mês. Economia potencial: US$ 54/mês. Ele testou a instância m6g.large em staging por duas semanas sob carga. A memória atingiu o pico de 71% — perto o suficiente do limite para deixá-lo desconfortável.

Então ele precificou a alternativa: manter o cache.r6g.large, mas comprar Nós Reservados (compromisso de 1 ano). De On-Demand US$ 185 para Reservado US$ 120/mês. Economia: US$ 65/mês sem mudar o tipo de instância.

"Os US$ 65/mês que eu economizaria em Nós Reservados no mesmo tamanho de instância são uma economia real," disse Tom. "Os US$ 54/mês que eu economizaria indo para o m6g.large são uma falsa economia se arriscarem o rush de jantar de sexta — e nem sequer economizam tanto. Às vezes o dimensionamento correto para uma instância menor arrisca um incidente de desempenho — os Nós Reservados nos dão mais economia sem nenhum risco."

Ele comprou os Nós Reservados para o r6g.large.

"Quando a opção mais segura também economiza mais," disse Tom, "nem é sequer uma troca."

**Retenção de Backup RDS: A Troca de Armazenamento**

Os backups automatizados do RDS são armazenados no S3 (sem custo adicional de armazenamento até 100% do tamanho do banco de dados). A retenção padrão é de 7 dias.

Para o banco de dados Aurora de 180GB da Nimbus, 7 dias de backups era adequado — eles haviam conseguido restaurar a partir de backup dentro dessa janela nos testes.

Mas Tom notou: eles também tinham snapshots manuais de cada implantação significativa, mantidos indefinidamente.

23 snapshots manuais, totalizando 4,1TB de armazenamento de snapshot.
Custo: US$ 0,021/GB/mês para armazenamento de backup Aurora = cerca de US$ 87/mês em armazenamento de snapshot manual.

Eles mantiveram os últimos 3 snapshots manuais por ambiente (produção, staging). Excluíram o restante — cerca de 1,1TB retido.
Economia: US$ 64/mês.

"Estávamos pagando US$ 64 por mês por seguro que nunca usamos," disse Leo.

"Estávamos pagando por tranquilidade," corrigiu Tom. "A pergunta é: quanto vale a tranquilidade de US$ 64 por mês?"

"Com um plano adequado de recuperação de desastres," disse Priya, "você pode obter a mesma tranquilidade com 7 dias de backups automatizados e 3 snapshots manuais."

"Concordo. Agora."

**Variação: Quando o Provisionado Sai Pela Culatra**

Se o seu padrão de tráfego é consistente e previsível, a capacidade provisionada com Auto Scaling economiza 30% em relação ao on-demand. Mas se um novo recurso é lançado e seu volume de escrita dispara 5x da noite para o dia, você sofrerá throttling antes de o Auto Scaling alcançar — o Auto Scaling reage ao tráfego observado, o que significa que há um atraso. Manter o modo on-demand nas semanas que cercam o lançamento de um recurso importante é uma troca razoável: custo ligeiramente maior, nenhum risco de throttling durante um período em que você está observando os padrões de tráfego mudarem em tempo real.

Se você elimina réplicas de leitura não utilizadas (como as réplicas PostgreSQL legadas da Nimbus), as economias são imediatas e inequívocas — não há troca, porque as réplicas não estavam fornecendo nenhum valor. Mas se você está tentado a eliminar uma réplica de leitura que está lidando com apenas 2% do tráfego, verifique o que acontece com a primária quando esses 2% não têm para onde ir durante um pico. Algumas réplicas de leitura existem por folga, não pela carga atual.

**O Resumo da Otimização do Banco de Dados**

| Serviço                                            | Antes      | Depois   | Economia Mensal |
|----------------------------------------------------|------------|----------|-----------------|
| Aurora (Serverless v2 mantido após análise)        | US$ 647    | US$ 647  | US$ 0 (modelo correto) |
| Réplicas de Leitura RDS (não utilizadas)           | US$ 340    | US$ 0    | US$ 340         |
| DynamoDB (On-Demand → Provisionado + Auto Scaling) | US$ 340    | US$ 230  | US$ 110         |
| ElastiCache (Nós Reservados)                       | US$ 185    | US$ 120  | US$ 65          |
| Snapshots manuais Aurora                           | US$ 87     | US$ 23   | US$ 64          |
| RDS Proxy (segurança de conexões)                  | US$ 0      | US$ 88   | -US$ 88         |
| **Total**                                          | **US$ 1.599** | **US$ 1.108** | **US$ 491/mês** |

US$ 491 por mês em economias de banco de dados. US$ 5.892 por ano.

Tom colocou esse número ao lado da limpeza de armazenamento (US$ 6.200/ano), das políticas de ciclo de vida S3 do Capítulo 23 (US$ 7.800/ano) e das economias com Savings Plans (US$ 14.200/ano).

Impacto total da otimização até o momento: US$ 34.092/ano.

"Isso é fôlego de verdade," disse Maya.

"Ou vários experimentos sérios," disse Priya.

"Ou doze meses de experimentos," disse Leo.

Todos os três estavam certos.

## Pontos Fortes e Limitações

**DynamoDB Provisionado com Auto Scaling**:

- Mais barato do que on-demand para cargas de trabalho previsíveis e consistentes
- O Auto Scaling lida com a variabilidade sem superprovisionamento permanente
- Requer monitoramento para garantir que os limites de capacidade permaneçam adequados

**RDS Reserved Instances / ElastiCache Reserved Nodes**:

- Economias significativas para cargas de trabalho estáveis e de longa duração
- Compromisso travado — se suas necessidades mudarem, você pagou por capacidade não utilizada
- Ao contrário das EC2 Standard RIs, as RDS RIs **não podem** ser revendidas no Reserved Instance Marketplace — o Marketplace é exclusivo do EC2. Uma RDS RI não utilizada é custo afundado, o que faz a decisão de dimensionamento importar mais

**O princípio geral**:

- Sempre entenda a utilização antes de otimizar — use p95, não a média
- Recursos não utilizados (como as réplicas de leitura legadas) são a otimização de maior retorno
- O dimensionamento correto requer validação em staging antes de aplicar em produção, e verificação de padrões de carga sazonais que podem não aparecer em uma janela de observação padrão
- O preço reservado requer confiança na estabilidade da carga de trabalho

## Resumo

- **Audite primeiro**: Puxe as métricas do CloudWatch antes de fazer qualquer alteração no banco de dados. Use latência de p95 e CPU de p95 — não médias. Verifique FreeableMemory e máximos de conexão.
- **Exclua recursos não utilizados**: Réplicas de leitura, bancos de dados ociosos e instâncias de teste que não são mais necessárias.
- **Observe seu pool de conexões**: Defina alarmes em DatabaseConnections em 75% e 90% do limite. Considere o RDS Proxy para multiplexação de conexões.
- **DynamoDB On-Demand vs Provisionado**: On-Demand para tráfego imprevisível; Provisionado + Auto Scaling para padrões consistentes.
- **Dimensionamento correto do ElastiCache**: Teste em staging sob cargas de pico realistas, incluindo picos sazonais. Os Nós Reservados oferecem economias no mesmo tamanho de instância quando a redução agressiva carrega risco.
- **Gerenciamento de snapshots RDS**: Mantenha apenas os snapshots que você precisa. Os snapshots manuais são armazenados indefinidamente a menos que sejam excluídos.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.3)*

- **Modos de preços do DynamoDB**: On-Demand = pague por requisição (maior custo por unidade, sem mínimo). Provisionado = pague por unidade de capacidade por hora (menor custo por unidade, deve alocar capacidade). **DynamoDB Auto Scaling** ajusta automaticamente a capacidade provisionada.
- **RDS Reserved Instances**: Disponível para todos os tipos de motor RDS. As implantações Multi-AZ podem usar Reserved Instances (você se compromete com Multi-AZ). Prazo de 1 ou 3 anos.
- **ElastiCache Reserved Nodes**: Mesmo modelo de compromisso que EC2 Reserved Instances. Aplicado por nó, não por cluster.
- **Armazenamento de snapshot RDS**: Os backups automatizados são gratuitos até 100% do tamanho do banco de dados. Snapshots manuais cobrados por GB por mês no S3. Cenário do exame: "reduzir os custos de armazenamento RDS" → exclua snapshots manuais antigos.
- **Capacidade reservada DynamoDB**: Disponível para o DynamoDB também (comprometido com uma capacidade específica de leitura/escrita por 1 ou 3 anos com desconto). Diferente do provisionado padrão — você pré-paga por capacidade em todas as suas tabelas DynamoDB em uma região.
- **Aurora Serverless v2 vs provisionado**: O Serverless v2 escala automaticamente, ideal para cargas de trabalho variáveis. Provisionado com Reserved Instances é mais barato para cargas de trabalho estáveis e previsíveis.

## Exercícios

**Exercício 1 — Recordação**

Explique quando usar a capacidade on-demand do DynamoDB versus a capacidade provisionada com Auto Scaling. Que informações você precisa para tomar essa decisão?

*(Dica: Pense no que "previsível" significa em termos de dados de tráfego, e que risco o on-demand remove que o provisionado introduz.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa executa uma tabela DynamoDB para o placar de um jogo mobile. O tráfego é muito consistente ao longo do ano, exceto durante um evento sazonal que é agendado com meses de antecedência (uma semana por trimestre, atingindo 10x o tráfego normal conforme os jogadores entram ao longo do primeiro dia). A prioridade da empresa é minimizar os custos do banco de dados durante os longos e previsíveis períodos de estado estacionário, mantendo o desempenho durante as semanas conhecidas do evento.

Qual estratégia de capacidade DynamoDB MELHOR atende a esses requisitos?

A) Capacidade on-demand para lidar com os picos sazonais sem throttling  
B) Capacidade provisionada definida nos níveis de pico sazonal (sempre provisionada para tráfego 10x)  
C) Capacidade provisionada com DynamoDB Auto Scaling, com capacidade máxima definida para o pico sazonal  
D) Unidades de capacidade reservada DynamoDB por 3 anos nos níveis de tráfego normal

**Dica 1**: "Tráfego muito consistente exceto por um pico sazonal agendado e conhecido" — qual modo lida com ambos de forma eficiente? (A força do on-demand é o tráfego *imprevisível*; este tráfego é previsível.)

**Dica 2**: "Minimizar custos" durante o período de baixo movimento significa que você não pode superprovisionar para 10x o tempo todo.

**Dica 3**: O DynamoDB Auto Scaling pode escalar para cima para o evento sazonal e voltar ao normal depois.

**Resposta**: C

**Explicação**: A capacidade provisionada com Auto Scaling escala a tabela com base no tráfego real. Durante os períodos normais, a capacidade está nos níveis normais (baixo custo). Durante o evento sazonal — cujas datas são conhecidas com antecedência e cujo tráfego cresce gradualmente ao longo do primeiro dia — o Auto Scaling acompanha o aumento até o nível máximo configurado (lidando com o pico de 10x), e a equipe também pode elevar o mínimo antes do início agendado como folga extra. Após o evento, a capacidade volta ao normal. Isso é mais barato do que on-demand durante o estado estacionário que domina o ano (on-demand custa mais por requisição) e mais barato do que sempre provisionar para 10x.

**Por que não A?** O on-demand lida com picos sem throttling, mas sua força é o tráfego *imprevisível*. Aqui o tráfego é muito consistente e o pico é agendado e gradual — pagar o prêmio on-demand por requisição pelos ~92% do ano que são estado estacionário contradiz a prioridade declarada de minimizar custos durante os períodos normais.

**Por que não B?** Provisionar para 10x permanentemente significa que ~90% da capacidade provisionada fica não utilizada por ~92% do ano — pagando por capacidade que nunca é usada.

**Por que não D?** As unidades de capacidade reservada o travam nos níveis de tráfego normal. Durante o evento de 10x sazonal, você seria throttled além da quantidade reservada, ou precisaria adicionar on-demand por cima.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.3*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está avaliando um novo recurso: um painel de análises de restaurantes que mostra contagens de pedidos em tempo real, receita por hora e dados demográficos de clientes. Esses dados consultariam um banco de dados aproximadamente 200 vezes por minuto (uma consulta por analista por atualização de página, com 10 analistas).

Atualmente, os dados analíticos estão no Athena (S3). Eles deveriam construir o painel no Athena, ou deveriam carregar os dados em um banco de dados? Se um banco de dados, qual (Aurora, DynamoDB, Redshift)?

Considere: frequência de consulta, requisitos de atualidade dos dados, complexidade da consulta (agregações, junções) e custo por consulta neste volume.

*(Não há uma única resposta correta. O objetivo é praticar a seleção de banco de dados para cargas de trabalho analíticas.)*

## Cena Pós-Créditos

Tom apresentou o resumo completo de otimização de custos para Maya.

Três meses de trabalho. US$ 34.092 em economias anuais identificadas, a maior parte já implementada.

"Qual é o restante?" perguntou Maya.

"Otimizações sobre as quais ainda não estou confiante," disse Tom. "A configuração do Aurora talvez pudesse ser ainda mais ajustada, mas quero mais um trimestre de dados antes de me comprometer. E há uma questão de transferência de dados que ainda não analisei completamente."

"Os custos de rede."

"Sim. Esse é o próximo."

Maya olhou para os números. "Tom, quero entender algo. Essa otimização — você ficou três meses nisso. É uma parte significativa do seu tempo."

"Aproximadamente 30%."

"E você encontrou cerca de US$ 34.000 por ano. Então a otimização se paga em — o quê, alguns meses do seu salário?"

Tom olhou para ela. "Mais ou menos."

"E todo ano depois disso, é pura economia."

"Ou puro reinvestimento," disse ele. "Mesmo efeito."

Maya assentiu. "É isso que eu quero que você faça. Não apenas em armazenamento e bancos de dados — em tudo. Torne a otimização de custos uma função contínua do seu papel."

Tom nunca havia ouvido seu trabalho descrito dessa forma. Achou tanto preciso quanto satisfatório.

No próximo capítulo: a última categoria de custo restante — e a que surpreende quase todo mundo.
