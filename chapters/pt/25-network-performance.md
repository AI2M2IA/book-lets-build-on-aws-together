# Capítulo 25: A Rodovia Privada

Levante-se por um momento. Sacuda as mãos.

Sinta a distância entre as pontas dos seus dedos e algo do outro lado do país. Imagine enviar uma mensagem que tem de percorrer essa distância, abrir caminho por uma dúzia de repasses de operadoras e voltar antes de você poder continuar trabalhando. Agora imagine fazer isso milhares de vezes por segundo.

É isso que a transferência de dados de fato é — distância física, infraestrutura física, restrições físicas.

Vamos falar sobre mover dados. Não entre serviços na AWS, mas entre o mundo real e a AWS — entre o seu escritório e a sua infraestrutura de nuvem, entre continentes.

---

Com o banco de dados escalado e os custos de armazenamento reduzidos, Tom tinha se voltado para a conta de rede. Mas Leo tinha um problema mais imediato — mover 4 terabytes de dados históricos de pedidos para a AWS estava expondo os limites da conexão atual deles.

---

A equipe de infraestrutura da Nimbus (agora quatro engenheiros) trabalhava de um escritório compartilhado em Seattle. Eles precisavam de acesso à infraestrutura da AWS que gerenciavam. Algumas operações exigiam conexão a recursos na VPC.

Atualmente, eles usavam uma VPN em seus laptops para acessar o bastion host na sub-rede pública, depois SSH para os recursos a partir dali.

Funcionava. Era lento. A conexão VPN roteava pela internet pública: Seattle → múltiplos saltos de operadora → us-west-2. As idas e voltas eram inconsistentes — 30 a 80 milissegundos dependendo da hora — e o throughput era limitado pelo uplink do escritório e pelo caminho público.

"Para o SSH do dia a dia, isso é aceitável", disse Leo. "Mas estamos prestes a começar a mover o nosso banco de dados de analytics. 4 terabytes de dados históricos de pedidos. Por esta conexão, a migração vai levar semanas."

"Precisamos de uma conexão melhor", disse Maya.

"Uma conexão privada", acrescentou Priya. "Não pela internet pública. E se alguém tentar invadir durante a transferência de dados? 4TB de histórico de pedidos pela internet pública — mesmo criptografado — parece um alvo."

Pense nisso como ir para o trabalho de carro. Uma Site-to-Site VPN é como dirigir em vias públicas: você tranca as portas do carro (criptografia), mas ainda divide as faixas com todo mundo, e os engarrafamentos te atrasam de forma imprevisível. O Direct Connect é como alugar uma faixa privada exclusiva na rodovia — sem tráfego compartilhado, velocidade consistente e um pedágio mensal mais alto. Na maioria dos dias a via pública está bem. Quando você está movendo um caminhão cheio de carga valiosa em um cronograma apertado, você paga pela faixa privada.

A Snow Family é a opção que a maioria das pessoas não considera: fretar um voo de carga de verdade. Nem sempre está disponível. Não é a opção certa para cargas pequenas. Mas para um caminhão cheio, ela chega mais rápido do que dirigir e não depende em nada das condições da rodovia. A física não mudou — você ainda está movendo os mesmos bits — mas o mecanismo é fundamentalmente diferente.

**AWS Site-to-Site VPN: A Opção Rápida**

A **AWS Site-to-Site VPN** cria um túnel criptografado entre a sua rede on-premises e a sua VPC, atravessando a internet pública.

Configuração:

1. Crie um Virtual Private Gateway (VGW) anexado à sua VPC
2. Crie um Customer Gateway representando o seu roteador on-premises
3. Estabeleça dois túneis VPN (para redundância) entre eles

O tráfego é criptografado (AES-256). Ele viaja pela internet pública, o que significa que a latência depende das condições da internet. A AWS fornece dois túneis automaticamente para redundância — se um túnel tem problemas, o tráfego muda para o outro.

**Quando usar a Site-to-Site VPN**:

- Configuração rápida (minutos a horas)
- Econômica (US$ 0,05/hora por conexão VPN)
- Largura de banda: até 1,25 Gbps por túnel
- Latência de internet aceitável para o caso de uso

A **Accelerated Site-to-Site VPN** roteia o tráfego VPN pela rede global da AWS em vez da internet pública — a mesma otimização que o Global Accelerator fornece, aplicada aos túneis VPN. A latência é menor e mais consistente que a VPN padrão. O custo é ligeiramente mais alto (aplicam-se as cobranças de transferência de dados do Global Accelerator). Para equipes que querem a configuração rápida e o custo mais baixo da VPN mas precisam de melhor latência, a Accelerated VPN é o caminho intermediário prático entre a VPN padrão e o Direct Connect.

Para a migração de 4TB da Nimbus, a VPN baseada em internet a 1,25 Gbps no máximo levaria: 4TB / 1,25 Gbps ≈ 7 horas no mínimo, com overhead do mundo real mais próximo de 12-20 horas. Aceitável, mas o congestionamento no caminho da internet pública torna isso imprevisível.

Leo fez a conta com mais cuidado, porque o cálculo teórico e o tempo de transferência real nunca tinham batido uma única vez na experiência dele.

**Teórico**: 4 TB = 4.096 GB = 32.768 Gb. A 1 Gbps: 32.768 segundos ≈ 9,1 horas. Arredondando para 9 horas.

**Real**: Leo tinha rodado uma transferência de teste na semana anterior — 50 GB do escritório de Seattle para o S3. Tempo teórico na velocidade de upstream medida deles (875 Mbps): 457 segundos. Tempo real: 724 segundos. Fator de overhead: 1,58.

Aplicado à transferência de 4TB a 875 Mbps de upstream: 32.768 Gb / 0,875 Gbps × 1,58 de overhead ≈ **59.200 segundos ≈ 16,4 horas**.

O overhead vinha de várias fontes: o TCP slow-start no estabelecimento da conexão, a perda de pacotes exigindo retransmissão (o caminho público de Seattle para us-west-2 tinha média de 0,2% de perda de pacotes — pequeno, mas multiplicativo ao longo de milhões de pacotes), o overhead de handshake HTTPS para cada segmento de multipart upload, e o tempo de processamento para o S3 montar os multipart uploads.

"Dezesseis horas está bom para uma migração única", disse Leo. "O problema real é se a transferência for interrompida na hora 14."

O multipart upload do S3 resolve o problema da interrupção: se a transferência falha na hora 14, apenas a parte atual precisa ser reenviada. As partes anteriores são armazenadas no S3 e a transferência pode retomar. Mas o overhead de gerenciar os multipart uploads adicionou aproximadamente 3% ao tempo total de transferência.

A estimativa final do mundo real: **cerca de 9 horas teóricas em 1 Gbps de internet, cerca de 17 horas reais** — contabilizando a velocidade de upstream medida de 875 Mbps do escritório deles, o overhead de perda de pacotes e o processamento de multipart upload.

Leo considerou isso por um momento. Então olhou a página de preços da Snow Family.

"Qual é a outra opção?" perguntou Tom.

"Espera — mas *por que* precisaríamos de algo além de uma VPN?" perguntou Maya. "A migração de 4TB é um evento único."

"Não é", disse Priya. "Uma vez que os dados estão na AWS, a equipe ainda precisa acessá-los diariamente. E a latência da VPN se acumula."

**AWS Direct Connect: A Linha Dedicada**

O **AWS Direct Connect** estabelece uma conexão de rede privada e dedicada entre o seu local (ou a sua instalação de colocation) e a AWS. O tráfego nunca toca a internet pública.

O Direct Connect é uma conexão física — uma linha de fibra da sua rede até um local do AWS Direct Connect. Você trabalha com um provedor de telecom para estabelecer o circuito físico. A AWS fornece a porta do lado deles.

**Benefícios**:

- Latência consistente e previsível (sem variação da internet pública)
- Velocidades de 50 Mbps a 100 Gbps (com portas dedicadas nativas de 400 Gbps em locais selecionados desde 2024)
- Custos de transferência de dados mais baixos que a internet (as taxas de transferência de dados do Direct Connect são mais baratas que as taxas padrão de transferência de dados de saída da AWS)
- Mais seguro (circuito privado, não internet pública)

**Trade-offs**:

- A configuração leva semanas a meses (provisionamento de infraestrutura física)
- Custo significativamente mais alto que a VPN
- Sem redundância embutida (você estabelece circuitos redundantes você mesmo)
- Não é adequado para escritórios geograficamente distribuídos sem múltiplos circuitos

Você pode estar se perguntando: se o Direct Connect é um cabo de fibra física, o que acontece se alguém cortá-lo acidentalmente? Esse é o problema do ponto único de falha com um único circuito — que é por que as configurações de Direct Connect de produção usam circuitos redundantes em caminhos geograficamente separados, ou mantêm uma VPN como backup. O cabo pode ser cortado; o negócio continua.

"Quanto isso custa por mês?" perguntou Tom. Ele já tinha pesquisado. "Uma porta dedicada de 1Gbps custa US$ 216/mês", disse ele. "Mais o circuito do nosso escritório, que uma telecom cotou em US$ 800/mês."

"Então cerca de mil por mês no total."

Para a Nimbus: o Direct Connect era exagero para o tamanho atual deles. Mas para empresas com volumes significativos de transferência de dados ou requisitos de conformidade para conexões de rede privadas, o Direct Connect se paga.

**Hosted Connections: O Meio-Termo**

Nem toda organização pode se comprometer com um circuito de fibra dedicado de 100 Gbps. As **Direct Connect Hosted Connections** permitem que os AWS Direct Connect Partners (telecoms aprovadas) provisionem conexões abaixo de 1Gbps que você compartilha com outros clientes.

A configuração é mais rápida (dias a semanas, não meses) e custa menos que uma conexão dedicada. O trade-off: capacidade compartilhada significa throughput menos consistente.

Para a Nimbus (à medida que cresce): uma conexão hosted de 500 Mbps através de um parceiro forneceria conectividade privada a um ponto de preço razoável.

A diferença prática que importa na hora do exame: as Hosted Connections estão disponíveis em velocidades de 50 Mbps a 10 Gbps (alguns parceiros oferecem até 25 Gbps), provisionadas por um AWS Partner. As Dedicated Connections vão diretamente para a AWS e estão disponíveis a 1 Gbps, 10 Gbps e 100 Gbps (mais 400 Gbps em locais selecionados). Para velocidades abaixo de 1 Gbps, uma Hosted Connection é a única opção de Direct Connect — as Dedicated Connections começam em 1 Gbps no mínimo.

**AWS Transit Gateway: Hub-and-Spoke para VPCs**

À medida que a Nimbus crescia, eles acumulariam múltiplas VPCs: a VPC de produção, a VPC de staging, a VPC de analytics, a VPC de ferramentas de segurança.

Sem um planejamento cuidadoso, conectar essas VPCs exige uma malha completa de conexões de VPC peering. Para 4 VPCs: 6 conexões de peering. Para 10 VPCs: 45 conexões de peering. Para 20 VPCs: 190 conexões. Isso não escala.

O **AWS Transit Gateway** é um hub de rede que conecta múltiplas VPCs e redes on-premises. Em vez de uma malha de conexões de peering, cada VPC se conecta ao Transit Gateway. O Transit Gateway roteia o tráfego entre elas.

```
On-premises ──── Direct Connect ──┐
                                  │
Production VPC ───────────────── Transit Gateway
Staging VPC ──────────────────── Transit Gateway
Analytics VPC ────────────────── Transit Gateway
Security VPC ─────────────────── Transit Gateway
```

**Roteamento transitivo**: Se a VPC A e a VPC B ambas se conectam ao Transit Gateway, elas podem se comunicar — sem um peer direto. O Transit Gateway lida com o roteamento. Ao contrário do VPC peering (que não é transitivo), o Transit Gateway permite a topologia hub-and-spoke.

**Custos do Transit Gateway**: cobrado por anexo (VPC ou conexão VPN/Direct Connect) mais por GB de dados processados. Em escala, isso vale a simplicidade.

Para a Nimbus, o evento que disparou o Transit Gateway foi a adição de uma quarta VPC. Eles tinham: produção, staging, analytics e agora ferramentas de segurança (uma VPC para varredura de vulnerabilidades e monitoramento de conformidade SOC2 que não deveria estar no mesmo segmento de rede que a produção).

Sem o Transit Gateway, conectar quatro VPCs exige seis conexões de peering:
- Produção ↔ Staging
- Produção ↔ Analytics
- Produção ↔ Segurança
- Staging ↔ Analytics
- Staging ↔ Segurança
- Analytics ↔ Segurança

Seis conexões de peering, seis entradas de tabela de rotas por VPC, seis regras de grupo de segurança para revisar. E o VPC peering não é transitivo: se Produção e Analytics têm peering, e Analytics e Segurança têm peering, Produção não consegue alcançar Segurança através da VPC de Analytics. Você precisa do peering Produção ↔ Segurança explicitamente.

Com o Transit Gateway:

```
Production VPC  ──┐
Staging VPC     ──┤──── Transit Gateway ────── On-premises (Direct Connect)
Analytics VPC   ──┤
Security VPC    ──┘
```

Quatro anexos. Uma tabela de rotas para gerenciar. Roteamento transitivo: Produção pode alcançar Segurança através do Transit Gateway sem um peer direto.

"E se alguém tentar invadir pelo Transit Gateway?" perguntou Priya. "Se todas as quatro VPCs compartilham um Transit Gateway, um recurso comprometido na VPC de Staging poderia alcançar a Produção."

O Transit Gateway oferece suporte a **tabelas de rotas com isolamento**: você pode definir quais VPCs têm permissão para se comunicar através do Transit Gateway e quais são isoladas. A VPC de ferramentas de segurança pode alcançar todas as outras (ela precisa varrê-las). Staging não pode alcançar Produção. Produção não pode alcançar Analytics diretamente (Analytics consulta dados através de um endpoint específico somente leitura).

"Um Transit Gateway", disse Priya, "com políticas de roteamento que expressam o modelo de acesso real. Versus seis conexões de peering sem uma forma centralizada de auditar o que alcança o quê."

**VPC Endpoints: Acesso Privado a Serviços da AWS**

Um problema sutil de custo e segurança: quando a sua instância EC2 (em uma sub-rede privada) chama a API do S3, esse tráfego roteia pelo NAT Gateway (para alcançar a internet, onde está o endpoint público do S3). Você paga pelo processamento do NAT Gateway.

Os **VPC Endpoints** permitem que os recursos na sua VPC se comuniquem com os serviços da AWS de forma privada, sem passar pela internet pública — e sem o NAT Gateway.

Dois tipos:

**Gateway endpoints** (gratuitos): Para S3 e DynamoDB. Você adiciona uma rota na sua tabela de rotas que direciona o tráfego do S3 ou DynamoDB para o endpoint em vez do NAT Gateway. Gratuito para criar; gratuito para usar.

**Interface endpoints** (cobrados): Para outros serviços da AWS (SQS, SNS, Secrets Manager, SSM, etc.). Cria uma ENI (Elastic Network Interface) na sua sub-rede com um IP privado. O tráfego para o serviço usa esse IP privado. Custa ~US$ 0,01/hora por AZ mais processamento de dados.

Leo já tinha criado os Gateway endpoints na semana anterior sem atualizar as tabelas de rotas. "Eu já implantei — ah", disse ele, verificando a configuração. "As rotas não foram atualizadas. Deixa eu corrigir isso."

Tom imediatamente criou Gateway endpoints para S3 e DynamoDB depois de saber que eram gratuitos. A taxa de processamento de dados do NAT Gateway caiu 65%.

A conta de por quê: as funções Lambda e as tarefas ECS da Nimbus em sub-redes privadas estavam fazendo requisições constantes ao S3 (lendo arquivos de configuração, escrevendo exportações de log) e ao DynamoDB (lendo dados de restaurantes, escrevendo registros de pedidos). Cada requisição roteava pelo NAT Gateway, que cobrava US$ 0,045 por GB de dados processados.

Processamento mensal de dados do NAT Gateway da Nimbus: 533 GB. Custo: US$ 24/mês. Depois de adicionar os Gateway Endpoints de S3 e DynamoDB e atualizar as tabelas de rotas: o tráfego de S3 e DynamoDB contornou o NAT Gateway inteiramente. O processamento mensal do NAT Gateway caiu para 187 GB — o tráfego restante eram chamadas de API a outros serviços (Secrets Manager, SES, webhooks externos). Custo: US$ 8,40/mês.

Economia: US$ 15,60/mês, US$ 187/ano, por duas configurações gratuitas de Gateway Endpoint que levaram 10 minutos para configurar.

"Gratuito", disse Tom, pela terceira vez.

"Os gateway endpoints são gratuitos para criar e gratuitos para usar", confirmou Leo. "Eles não são apenas uma melhoria de segurança — rotear o tráfego de S3 e DynamoDB por um endpoint privado em vez do NAT Gateway o remove da internet pública inteiramente."

"E se alguém tentar invadir pelo tráfego do NAT Gateway?" perguntou Priya. "Se o tráfego para o S3 passa pelo NAT, ele é endereçável a partir da internet. Via Gateway Endpoint, é privado."

Este é o benefício secundário dos Gateway Endpoints que a discussão de custos às vezes ofusca. O tráfego para S3 e DynamoDB através de um VPC Gateway Endpoint nunca deixa a rede da AWS, nunca atravessa um endereço IP público e é governado pela política do endpoint (uma política baseada em recurso que pode restringir quais buckets S3 ou tabelas DynamoDB o endpoint pode acessar). Um Gateway Endpoint em um bucket que armazena dados de clientes adiciona uma camada extra: mesmo com uma política de bucket mal configurada, a política do endpoint pode restringir o acesso ao tráfego originado de dentro da VPC específica.

**AWS Global Accelerator: Roteamento na Borda**

Quando a Nimbus servia usuários da Costa Leste a partir de us-west-2 (Oregon), a latência era de 80ms. Não porque o servidor estivesse proibitivamente longe, mas porque o roteamento da internet pública entre Boston e Oregon era subótimo, ricocheteando por múltiplas redes de operadoras.

O **AWS Global Accelerator** usa o backbone global privado da AWS — uma rede distribuída de edge locations que roteia o tráfego para a sua aplicação por caminhos controlados pela AWS em vez de saltos de operadoras da internet pública. Em vez do roteamento pela internet pública, o tráfego entra na rede da AWS na edge location mais próxima e percorre o caminho privado otimizado até a sua aplicação.

Para a Nimbus, um usuário em Boston:

- **Sem o Global Accelerator**: Roteia por operadoras da internet pública → ~80ms
- **Com o Global Accelerator**: Chega à edge da AWS mais próxima em Boston → percorre o backbone da AWS → alcança us-west-2 → ~60ms

O Global Accelerator não faz cache de conteúdo (isso é o CloudFront). Ele otimiza o caminho de rede para requisições dinâmicas.

Leo rodou uma comparação de latência em várias cidades depois de habilitar o Global Accelerator para a API da Nimbus:

| Cidade | Antes | Depois | Melhoria |
|------|--------|-------|-------------|
| Seattle, WA | 12ms | 11ms | 8% |
| Los Angeles, CA | 28ms | 22ms | 21% |
| Chicago, IL | 55ms | 40ms | 27% |
| New York, NY | 82ms | 61ms | 26% |
| London, UK | 145ms | 112ms | 23% |
| Tokyo, Japan | 180ms | 95ms | 47% |
| Sydney, Australia | 210ms | 118ms | 44% |

A melhoria foi mais dramática para os usuários geograficamente distantes — Tóquio de 180ms para 95ms, Sydney de 210ms para 118ms. Para Seattle (próximo dos data centers de us-west-2 no Oregon), a melhoria foi menor — havia menos saltos de internet pública para otimizar.

"Espera — mas *por que* Tóquio está tendo uma melhoria de 47%?" perguntou Maya. "Se o data center ainda está em us-west-2, a velocidade da luz não é a restrição real?"

"A velocidade da luz é o piso", disse Leo. "A restrição real é o roteamento da internet pública. O tráfego de Tóquio para us-west-2 cruza dezenas de sistemas autônomos — operadoras diferentes, roteadores diferentes, acordos de peering diferentes. Cada salto adiciona latência. O Global Accelerator roteia o tráfego da edge location de Tóquio para us-west-2 pela fibra privada da AWS, que tem caminhos mais curtos e roteamento mais bem ajustado."

O mínimo teórico de Tóquio para us-west-2 (com base na velocidade da luz pela fibra, aproximadamente 15.500 km de ida e volta): ~77ms. Os 95ms com o Global Accelerator estão se aproximando desse mínimo teórico. Os 180ms sem ele refletem a ineficiência do roteamento da internet pública, não as leis da física.

O Global Accelerator fornece dois **endereços IP anycast** estáticos que roteiam para a edge location mais próxima. Ao contrário do CloudFront (que usa endereços IP dinâmicos que mudam), esses IPs são estáveis — úteis para allowlisting de firewall e para aplicações que exigem um IP fixo para os clientes se conectarem.

**Quando usar o Global Accelerator vs o CloudFront**:

- CloudFront: conteúdo estático e cacheável, caso de uso de CDN
- Global Accelerator: conteúdo dinâmico, protocolos não-HTTP (UDP, jogos, IoT), ou quando você precisa de um endereço IP Anycast estático

## Movendo Dados, Não Apenas Tráfego: DataSync e Transfer Family

Enquanto a arquitetura de rede tomava forma, Maya teve três novos projetos de onboarding de redes de restaurantes caindo simultaneamente. Cada um tinha um requisito de migração de dados — e cada requisito era diferente.

A primeira rede, Pacific Table, precisava mover 40 TB de compartilhamentos de arquivos NFS para o S3. O armazenamento de arquivos atual deles era on-premises, espalhado por quatro servidores de arquivos na sede de Seattle. Leo começou a escrever um plano de migração.

A segunda rede, Marisol Group, tinha uma equipe de contabilidade que carregava faturas diariamente em um servidor SFTP local. O fluxo de trabalho SFTP estava rodando desde 2015. A equipe de contabilidade sabia uma coisa: eles abriam o cliente SFTP toda manhã às 9h, soltavam suas faturas e o fechavam. Ninguém queria mudar isso. "Os contadores deles usam o WinSCP", disse Maya. "Isso não é negociável."

"Essas são duas ferramentas diferentes", disse Priya.

"Sim", disse Leo. "Mas as duas existem."

**AWS DataSync: rsync com Esteroides, Com um Console da AWS**

Para a migração de 40 TB da Pacific Table, o desafio não era a largura de banda — o escritório de Seattle tinha uma conexão de upstream sólida. O desafio era a orquestração: descobrir quais arquivos existiam, transferi-los de forma confiável, verificar os checksums, agendar a transferência para evitar saturar a rede do escritório durante o horário comercial e monitorar o progresso ao longo do que seriam vários dias de operação contínua.

O **AWS DataSync** é um serviço de migração e replicação de dados baseado em agente. Você instala um agente DataSync leve no seu ambiente on-premises — uma máquina virtual que roda no VMware ou como uma instância EC2. O agente se conecta aos seus servidores de arquivos por NFS ou SMB, descobre os seus compartilhamentos e os sincroniza para um destino na AWS: um bucket S3, um filesystem EFS ou um filesystem FSx.

Pense nele como rsync com esteroides, com um console da AWS. O DataSync lida com:

- **Descoberta**: o agente inventaria os seus compartilhamentos de origem automaticamente
- **Agendamento**: as transferências podem rodar em um agendamento definido (fora do horário comercial) ou continuamente
- **Verificação**: o DataSync computa checksums em ambas as pontas e alerta você sobre qualquer inconsistência
- **Monitoramento**: o progresso da transferência, as contagens de arquivos, os relatórios de erro e a utilização de largura de banda são todos visíveis no console
- **Criptografia em trânsito**: todos os dados são criptografados usando TLS durante a transferência

Para a Pacific Table, Leo instalou o agente DataSync em uma VM na rede de Seattle deles, apontou-o para os quatro compartilhamentos NFS e configurou um agendamento de transferência: 20h às 6h nos dias de semana, contínuo nos fins de semana. Depois de seis dias, todos os 40 TB tinham aterrissado no S3. Ele verificou a transferência com o relatório de checksum embutido do DataSync. Zero discrepâncias.

"E para a replicação contínua?" perguntou Maya. "A Pacific Table ainda vai adicionar arquivos depois da migração."

"O DataSync oferece suporte a transferências incrementais", disse Leo. "Depois da sincronização inicial, ele só copia o que mudou. Podemos rodá-lo todas as noites como um job de replicação."

**AWS Transfer Family: Seu Fluxo de Trabalho SFTP, Apoiado pelo S3**

Para a equipe de contabilidade da Marisol Group, o requisito era diferente. Ninguém estava abandonando o SFTP. Os contadores iam continuar usando o WinSCP. A pergunta era: onde esses uploads SFTP aterrissam?

Atualmente, eles aterrissavam em um servidor Linux local no back office da Marisol. Os arquivos eram então movidos manualmente para o sistema de contabilidade deles. O servidor local exigia manutenção, backups e alguém com acesso SSH para gerenciá-lo.

O **AWS Transfer Family** é um servidor SFTP, FTPS e FTP totalmente gerenciado — apoiado pelo S3 ou EFS como destino de armazenamento. Você provisiona um endpoint do Transfer Family (ele recebe um hostname e, opcionalmente, um endereço IP estático). Seus clientes se conectam a ele usando o software SFTP existente. Quando eles carregam arquivos, esses arquivos aterrissam diretamente em um bucket S3.

A equipe de contabilidade não muda nada. Eles ainda abrem o WinSCP toda manhã às 9h. Eles ainda se conectam a um servidor SFTP com suas credenciais existentes. Eles ainda soltam suas faturas na mesma pasta. A diferença é invisível para eles: do lado do servidor, os arquivos agora vão diretamente para o S3 em vez de para um servidor Linux local.

"E a partir do S3, podemos acionar o resto do fluxo de trabalho automaticamente", disse Priya. "Um evento do S3 aciona uma função Lambda que processa a fatura e a insere no sistema de contabilidade. Sem passo manual."

"Então o fluxo de trabalho dos contadores não muda", disse Maya, "mas do nosso lado, a coisa toda é automatizada."

"Sim. E o próprio servidor SFTP é totalmente gerenciado — sem patching, sem backups, sem servidor para manter."

Tom já tinha pesquisado os preços. O Transfer Family cobra por hora de disponibilidade do endpoint mais por GB transferido. Para o volume de faturas da Marisol Group, o custo mensal estava bem abaixo de US$ 30. O custo de manter o servidor local que ele estava substituindo — depreciação de hardware, tempo de engenharia para manutenção, gerenciamento de backups — era consideravelmente mais.

---

> **Dica de Exame — DataSync e Transfer Family**
>
> *Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.1)*
>
> - **DataSync** = mover dados em massa de on-premises para a AWS (compartilhamentos de arquivos NFS ou SMB → S3, EFS ou FSx). Os sinais do exame: "migrar compartilhamentos de arquivos", "replicar dados NFS para o S3", "transferência de dados on-premises para AWS", "replicação contínua de dados de arquivos". O DataSync usa um agente instalado on-premises; o agente lida com descoberta, agendamento e verificação.
> - **Transfer Family** = transferência contínua de arquivos usando os protocolos SFTP, FTPS ou FTP, sem mudar as ferramentas do cliente. Os sinais do exame: "fluxo de trabalho SFTP existente", "parceiros carregam arquivos via SFTP", "servidor SFTP apoiado pelo S3", "lift-and-shift de SFTP", "não pode mudar o processo de transferência de arquivos". O Transfer Family é a resposta quando o requisito é compatibilidade com SFTP, não volume de dados.
> - **A distinção importa**: o DataSync é para migração e replicação em massa (baseado em agente, orientado por agendamento, otimizado para rede). O Transfer Family é para serviços de transferência de arquivos compatíveis com protocolo (baseado em endpoint, sempre ligado, transparente para o cliente). Eles resolvem problemas diferentes.
> - O DataSync oferece suporte a S3, EFS e FSx como destinos. O Transfer Family oferece suporte a S3 e EFS como backends de armazenamento.

---

**Migrando Servidores, Não Apenas Arquivos: Os 7 Rs e o MGN**

A terceira rede no pipeline de Maya não tinha apenas arquivos — tinha servidores inteiros: uma aplicação de reservas personalizada rodando em duas máquinas on-premises que ninguém queria reescrever antes da mudança. Mover *aplicações* é sua própria disciplina, e a AWS descreve **sete formas de migrar** (os "7 Rs") que você principalmente precisa reconhecer:

- **Rehost** ("lift and shift"): mover os servidores como estão. Mais rápido, menos mudança.
- **Replatform** ("lift, tinker, and shift"): pequenas melhorias no caminho — como mover um banco de dados autogerenciado para o RDS.
- **Repurchase**: largar o sistema antigo, comprar SaaS em vez disso.
- **Refactor**: redesenhar de forma cloud-native. Mais esforço, mais retorno.
- **Retire**: acontece que ninguém usava. Delete.
- **Retain**: deixe onde está, por enquanto.
- **Relocate**: mover no nível do hypervisor sem mudar nada.

Para o caso de rehost, a ferramenta é o **AWS Application Migration Service (MGN)**: um agente replica os discos dos servidores de origem, bloco a bloco, em uma área de staging de baixo custo na AWS; você lança cópias de teste quando quiser; no cutover, o MGN converte os servidores replicados em instâncias EC2 nativas. Lift, shift, pronto — o refactoring pode vir depois, no tempo da nuvem. (Seus companheiros para o planejamento de portfólio, o Application Discovery Service e o Migration Hub, fecharam para novos clientes no final de 2025 — conheça seus nomes como "descoberta de inventário" e "rastreamento central de migração" se o exame os mencionar.)

---

**AWS Snow Family: A Opção Física**

Ainda havia a questão do conjunto de dados histórico de 4TB e a estimativa de 17 horas pela internet. Depois de calculá-la, Leo tinha olhado a página de preços da Snow Family e tomado a decisão imediatamente.

Para migrações acima de alguns terabytes onde o tempo importa mais que a simplicidade, a AWS envia appliances de armazenamento físico para o seu local. Você os enche com dados. Você os envia de volta. A AWS ingere os dados diretamente no S3.

**Snowball Edge Storage Optimized**: 80 TB de capacidade utilizável, gabinete reforçado. Envia para o seu local em 2-5 dias úteis. Você carrega os dados usando a interface local (NFS, interface S3). Você o envia de volta. A AWS ingere os dados em aproximadamente 1-3 dias úteis após o recebimento.

Para a migração de 4TB da Nimbus, o processo:

1. **Pedir** um Snowball Edge pelo console da AWS (leva 2 minutos, envia em 3 dias)
2. **Conectar** o appliance à rede do escritório de Seattle; ele se apresenta como um ponto de montagem NFS
3. **Copiar** os 4TB de dados históricos de pedidos usando a interface compatível com S3 do dispositivo: `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **A cópia se completa** em cerca de 2 horas (rede local, sem internet)
5. **Enviar** o appliance de volta para a AWS (etiqueta pré-paga incluída)
6. A AWS **ingere** os dados para o S3 dentro de 72 horas do recebimento
7. **Verificar** — o S3 fornece um relatório de conclusão de job mostrando cada arquivo transferido e o checksum

Tempo total decorrido: 3 dias para a entrega + 2 horas para copiar + 1 dia de envio + 2 dias de ingestão = aproximadamente 7 dias corridos. Versus cerca de 17 horas contínuas — que teriam exigido uma conexão de internet estável e ininterrupta, saturando o uplink do escritório durante a noite e a maior parte de um dia de trabalho.

Custo: o aluguel do dispositivo Snowball Edge é US$ 300 por 10 dias. Envio (ida e volta): aproximadamente US$ 80. A transferência de dados de entrada do S3 é gratuita. Custo total da migração: **US$ 380**.

Compare com cerca de 17 horas de uso sustentado de internet a 875 Mbps: o túnel VPN era gratuito (US$ 0,05/hora mas o túnel já estava rodando); a transferência de entrada do S3 era gratuita. O caminho de internet "gratuito" tinha um custo real em tempo de engenharia (monitorar uma transferência de 17 horas), risco (qualquer interrupção exigindo reinício) e custo de oportunidade (a conexão de internet deles estava saturada durante a janela de transferência). Leo fez o pedido. Como tudo se desenrolou está na cena pós-créditos deste capítulo.

---

## Pontos Fortes e Limitações

**Site-to-Site VPN**:

- Configuração rápida, baixo custo
- O caminho da internet pública significa latência variável
- Teto de largura de banda limitado (1,25 Gbps por túnel)
- A opção Accelerated VPN melhora a latência a um custo ligeiramente mais alto

**Direct Connect**:

- Consistente, privado, alta largura de banda
- Lento para configurar, custo recorrente significativo
- O circuito físico é um ponto único de falha (adicione redundância ou mantenha um backup VPN)
- Ponto de equilíbrio com a economia de custo de egresso em aproximadamente 10-15 TB/mês dependendo do cenário de preços

**AWS Snow Family**:

- Para migrações únicas acima de 1-2 TB, frequentemente mais rápida e mais barata que a transferência por rede
- Sem consumo de largura de banda de internet durante a migração
- Janela de aluguel de dispositivo de 10 dias; envio pré-pago

**Transit Gateway**:

- Simplifica dramaticamente a conectividade multi-VPC
- Roteamento transitivo (ao contrário do VPC peering)
- Tabelas de rotas de isolamento permitem segmentação sem conexões de peering separadas
- O custo se acumula para muitos anexos

**VPC Endpoints**:

- Benefício de segurança e custo para S3/DynamoDB (gateway endpoints gratuitos)
- Elimina os custos de NAT Gateway para o tráfego de serviços da AWS
- As políticas de endpoint adicionam uma camada extra de controle de acesso além do IAM e das políticas de bucket
- Os interface endpoints para outros serviços (Secrets Manager, SSM, SES) mantêm o tráfego privado mas custam ~US$ 0,01/hora por AZ

**Global Accelerator**:

- Melhora a latência de aplicações dinâmicas para usuários globais: 33-47% de melhoria na prática para usuários distantes
- IPs Anycast fixos (ao contrário dos IPs dinâmicos do CloudFront) — úteis para allowlisting de firewall
- Protocolos não-HTTP (UDP, TCP) — o CloudFront é apenas HTTP/HTTPS
- Custo adicional (US$ 0,025/hora por accelerator + transferência de dados)

## Resumo

O trabalho do Aurora no capítulo 24 otimizou como a Nimbus serve dados à sua própria aplicação. Este capítulo é sobre como os dados se movem entre o mundo externo e a AWS — e como tornar esse movimento mais confiável, mais rápido e menos caro.

- **Site-to-Site VPN**: Túnel criptografado pela internet pública entre on-premises e a VPC. Configuração rápida, custo mais baixo, latência variável. Dois túneis para redundância. Máximo de 1,25 Gbps por túnel.
- **Direct Connect**: Conexão de fibra privada e dedicada para a AWS. Latência previsível, largura de banda mais alta, semanas para configurar, custo significativo. Ponto de equilíbrio com a economia de egresso da VPN em aproximadamente 13,5 TB/mês para o cenário de preços da Nimbus.
- **AWS Snow Family**: Appliances de armazenamento físico para migração de dados em massa. Mais rápida que a transferência por internet para migrações de múltiplos TB. US$ 380 no total para a migração de 4TB da Nimbus vs. cerca de 17 horas de saturação de rede.
- **Transit Gateway**: Hub para conectividade de VPC e on-premises. Permite roteamento transitivo (ao contrário do VPC peering). Oferece suporte a tabelas de rotas de isolamento para controlar quais VPCs podem alcançar quais. Escala para centenas de conexões.
- **VPC Endpoints**: Acesso privado a serviços da AWS sem o NAT Gateway. Os gateway endpoints (S3, DynamoDB) são gratuitos — adicione-os a toda VPC que acessa S3 ou DynamoDB. Economizou US$ 15,60/mês à Nimbus e removeu o tráfego de S3/DynamoDB do NAT Gateway.
- **Global Accelerator**: Roteia o tráfego dinâmico pelo backbone privado da AWS para uma latência menor e mais consistente globalmente. IPs Anycast estáticos. Melhorias de latência de 33-47% para usuários distantes (Tóquio: 180ms → 95ms; Sydney: 210ms → 118ms). Não é um CDN — não faz cache.
- **AWS DataSync**: Serviço baseado em agente para migrar e replicar dados de arquivos NFS/SMB on-premises para S3, EFS ou FSx. Lida com agendamento, verificação de checksum, monitoramento. Usado para migrações únicas e replicação contínua de compartilhamentos de arquivos.
- **AWS Transfer Family**: Servidor SFTP, FTPS e FTP gerenciado apoiado pelo S3 ou EFS. Permite que clientes SFTP existentes carreguem arquivos para o S3 sem mudar seu fluxo de trabalho.

## Dicas de Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.4)*

- **Sinais de VPN vs Direct Connect**: VPN = "criptografar tráfego para a VPC", "configuração rápida", "sensível a custo". Direct Connect = "latência baixa consistente", "transferências grandes de dados", "conexão privada", "conformidade exigindo rede privada".
- **Transit Gateway vs VPC Peering**: O peering não é transitivo (A→B→C não permite A→C). O Transit Gateway é transitivo. "Muitas VPCs precisando se comunicar" → Transit Gateway.
- **VPC Gateway Endpoints**: Gratuitos. Apenas S3 e DynamoDB. Mudança na tabela de rotas. Sem custo extra. Cenário do exame: "reduzir os custos de transferência de dados para acesso ao S3 a partir de sub-rede privada" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = conteúdo dinâmico, não-HTTP, IP estático, otimização de rede. CloudFront = cache, conteúdo HTTP, CDN.
- **Direct Connect + VPN**: Você pode usar uma VPN como backup para uma conexão Direct Connect. Se o circuito Direct Connect falha, o tráfego faz failover para a VPN. Mais caro que apenas a VPN, mais confiável que apenas o Direct Connect.
- **Direct Connect Gateway**: Conecte um circuito Direct Connect a múltiplas VPCs em múltiplas regiões ou contas. Sem ele, um circuito Direct Connect se conecta a um VGW em uma região.
- **AWS Snow Family**: "Migração grande de dados", "a velocidade de transferência é muito lenta", "migração em escala de petabytes" → Snow Family. Snowball Edge = até 80TB. Faça a conta da transferência primeiro: se mover os dados pela rede disponível levaria cerca de uma semana ou mais, a resposta é um dispositivo físico. *Verificação da realidade (2026)*: a AWS vem aposentando a família — o Snowmobile foi retirado em 2024, o Snowcone foi descontinuado no final de 2024, e a partir de novembro de 2025 os dispositivos Snow não são mais oferecidos a novos clientes (a AWS agora aponta para o DataSync por links rápidos e para os **Data Transfer Terminals**, locais seguros onde você leva seus próprios drives). O banco de questões do SAA-C03 antecede tudo isso, então no exame, "semanas de transferência por rede, largura de banda limitada" ainda aponta para o Snowball.
- **Tabelas de rotas do Transit Gateway**: O Transit Gateway oferece suporte a múltiplas tabelas de rotas para segmentação de rede. Sinal do exame: "isolar a VPC de produção da de staging" com conectividade compartilhada através do Transit Gateway → tabelas de rotas separadas.
- **IPs fixos do Global Accelerator**: Ao contrário do CloudFront, o Global Accelerator fornece dois IPs Anycast estáticos. Sinal do exame: "a aplicação precisa de um endereço IP fixo para os clientes adicionarem à allowlist" ou "tráfego UDP" → Global Accelerator (o CloudFront é apenas HTTP/HTTPS).
- **Sinais do AWS DataSync**: "migrar compartilhamentos de arquivos NFS/SMB para S3/EFS/FSx", "replicação contínua de dados de arquivos on-premises", "migração de arquivos baseada em agente". O DataSync não é para transferência SFTP compatível com protocolo — é para migração e replicação em massa de compartilhamentos de arquivos.
- **Sinais do AWS Transfer Family**: "fluxo de trabalho SFTP existente", "parceiros ou clientes carregam arquivos via SFTP", "subir o servidor SFTP para a nuvem sem mudar as ferramentas do cliente", "SFTP/FTPS/FTP apoiado pelo S3". O Transfer Family não é uma ferramenta de migração de dados — é um endpoint de protocolo gerenciado. A distinção: o DataSync move dados em massa em um agendamento; o Transfer Family fornece um endpoint SFTP/FTP sempre ligado para uploads contínuos de arquivos.
- **MGN (Application Migration Service)**: "migrar centenas de VMs rapidamente, sem mudanças de código", "rehost / lift-and-shift de servidores para o EC2" → MGN (replicação em nível de bloco, lançamentos de teste, cutover para instâncias EC2 nativas). O DataSync move *arquivos*; o DMS move *bancos de dados*; o MGN move *servidores inteiros*.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre o AWS Site-to-Site VPN e o AWS Direct Connect. Em qual cenário você escolheria cada um?

*(Dica: Pense em tempo de configuração, custo, consistência de latência e requisitos de largura de banda.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: Uma empresa de serviços financeiros exige uma conexão de rede privada, criptografada e dedicada do seu data center on-premises para a AWS. Eles transferem 500GB de dados financeiros sensíveis diariamente. A conexão deve ter latência consistente e previsível e não deve atravessar a internet pública. Eles também precisam de uma conexão de backup caso a primária falhe.

Qual arquitetura MELHOR atende a esses requisitos?

A) Uma Site-to-Site VPN com roteamento BGP e uma segunda VPN para redundância  
B) Uma Direct Connect Hosted Connection com Direct Connect Gateway  
C) Duas conexões Site-to-Site VPN através de provedores de internet diferentes  
D) Uma conexão Direct Connect com uma Site-to-Site VPN como backup

**Dica 1**: "Não deve atravessar a internet pública" — o tráfego VPN passa pela internet pública (criptografado). Apenas o Direct Connect é privado.

**Dica 2**: "Latência consistente e previsível" — o desempenho da VPN pela internet pública varia. O Direct Connect é consistente.

**Dica 3**: "Conexão de backup" — qual é a abordagem recomendada quando o Direct Connect é o primário?

**Resposta**: D

**Explicação**: O Direct Connect fornece uma conexão privada e dedicada que não atravessa a internet pública — atendendo aos requisitos de privacidade e latência. Uma Site-to-Site VPN como backup fornece redundância: se o circuito Direct Connect falha, o tráfego faz failover para a VPN criptografada. Este é o padrão de HA padrão para o Direct Connect.

**Por que não A?** O tráfego da Site-to-Site VPN atravessa a internet pública, o que viola o requisito de "não deve atravessar a internet pública".

**Por que não B?** Uma Hosted Connection fornece uma conexão Direct Connect mas a opção B não inclui um backup. Um único Direct Connect sem backup é um ponto único de falha — a fibra física pode ser cortada.

**Por que não C?** Duas conexões VPN através de ISPs diferentes ainda atravessam a internet pública, mesmo se criptografadas. Não atende ao requisito de rede privada.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.4*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está se expandindo para ter equipes de engenharia regionais em Seattle, Berlim e Singapura. Cada equipe regional precisa de acesso a:

- A VPC de produção (somente leitura para depuração)
- A VPC de staging (acesso total para testes)
- A VPC de analytics (somente leitura para relatórios)

Projete a conectividade de rede. Você usaria o Transit Gateway? Direct Connect em cada região ou Site-to-Site VPN? Como você imporia o acesso somente leitura para produção? (Dica: esta é tanto uma questão de rede quanto de IAM.)

*(Não há uma resposta única correta. O objetivo é praticar o design de rede multi-região e multiequipe.)*

**Extensão**: A equipe de Berlim relata que a latência da VPN deles para a VPC de produção (us-west-2) tem média de 160ms. A partir de qual volume de dados a Accelerated Site-to-Site VPN ou uma Direct Connect Hosted Connection se tornaria a melhor opção? Pesquise os preços atuais de Direct Connect Hosted Connection de um AWS Partner europeu. A melhoria de latência sozinha justificaria o custo no seu volume de dados estimado?

## Cena Pós-Créditos

A migração de dados se completou em 8 dias corridos — 3 dias para o Snowball Edge chegar, 94 minutos para copiar os dados, 4 dias para a AWS receber o dispositivo e ingerir os dados, depois uma sincronização final do delta que tinha se acumulado enquanto o Snowball estava em trânsito. Tempo de mão na massa para tudo isso: menos de quatro horas.

Esse último passo importou. O Snowball Edge copiou um snapshot point-in-time do conjunto de dados de 4TB. Enquanto ele estava em trânsito, o banco de dados de produção tinha continuado rodando — novos pedidos estavam sendo feitos, novos registros estavam sendo criados. O delta sync pela VPN foi de 12GB, completado em 18 minutos.

"A transferência em massa foi o Snowball", disse Leo. "A sincronização foi só os dados novos dos 8 dias que levou."

"Eu já implantei — ah", disse Leo, observando a cópia se completar no Snowball Edge após 94 minutos. "Eu deveria ter definido o limitador de largura de banda na cópia local para evitar saturar a rede do escritório durante o horário comercial."

Ele não tinha definido o limitador. A internet do escritório estava bem — o Snowball era uma operação de rede local. Mas o switch de rede brevemente se tornou um gargalo à medida que a cópia se aproximava de 9 Gbps de throughput local.

"O ponto", disse ele, depois de corrigir a configuração do limitador, "é que o correio físico é mais rápido que a internet acima de um certo volume de dados."

"Isso é óbvio ou contraintuitivo", disse Maya, "dependendo de como você pensa sobre isso."

"Da próxima vez", disse Leo, "deveríamos configurar um Direct Connect."

Tom não pegou a calculadora — ele já tinha feito a conta antes, quando o Direct Connect surgiu pela primeira vez: cerca de mil por mês, porta mais circuito.

"Para o que fazemos agora, provavelmente não vale a pena. Mas se começarmos a mover mais de 10TB por mês entre o nosso escritório e a AWS, a economia de transferência de dados no Direct Connect compensaria o custo."

"Então monitoramos o volume de transferência de dados", disse Priya, "e revisitamos quando ele cruzar o limiar."

"Isso é arquitetura consciente de custo", disse Tom.

"Esse sempre foi o ponto", disse Maya.

Priya tinha observado a migração do outro lado da sala. "Da próxima vez que fizermos algo assim", disse ela, "podemos fazer antes de os dados estarem em produção e o negócio depender disso? Migrar dados ao vivo é sempre mais arriscado que migrar dados em repouso."

"Nunca está em repouso quando o negócio está rodando", disse Leo.

"Eu sei", disse ela. "Esse é o ponto. Planeje a migração antes de você precisar dela. Não depois."

Tom já tinha calculado quanto custaria ter um segundo conjunto de infraestrutura em us-east-1 pronto para receber uma migração a qualquer momento. Ele guardou o número para si por enquanto. Havia capítulos mais imediatos para fechar.

No próximo capítulo: o que acontece quando você tem mais dados do que qualquer banco de dados pode razoavelmente armazenar, e você precisa dar sentido a tudo isso.
