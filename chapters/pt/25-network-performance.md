# Capítulo 25: A Rodovia Privada

Levante-se por um momento. Sacuda as mãos.

Vamos falar sobre mover dados. Não entre serviços na AWS, mas entre o mundo real e a AWS — entre o seu escritório e a sua infraestrutura em nuvem, entre continentes.

A equipe de infraestrutura da Nimbus (agora composta por quatro engenheiros) trabalhava em um escritório compartilhado em Seattle. Eles precisavam de acesso à infraestrutura AWS que gerenciavam. Algumas operações exigiam a conexão a recursos na VPC.

Atualmente, eles usavam uma VPN em seus laptops para acessar o host bastião na sub-rede pública e depois faziam SSH para os recursos a partir daí.

Funcionava. Era lento. A conexão VPN roteava pelo internet pública: Seattle → fibra transcontinental → múltiplos saltos de operadora → us-east-1. Cada viagem de ida e volta tinha mais de 80 milissegundos.

"Para SSH do dia a dia, isso é aceitável," disse Leo. "Mas estamos prestes a começar a mover nosso banco de dados de análise. 4 terabytes de dados históricos de pedidos. Por essa conexão, a migração levará semanas."

"Precisamos de uma conexão melhor," disse Maya.

"Uma conexão privada," acrescentou Priya. "Não pela internet pública."

Pense nisso como ir ao trabalho. Uma VPN Site-to-Site é como dirigir em vias públicas: você tranca as portas do carro (criptografia), mas ainda compartilha as faixas com todos os outros, e os engarrafamentos o atrasam de forma imprevisível. O Direct Connect é como alugar uma faixa privada dedicada na rodovia — sem tráfego compartilhado, velocidade consistente e uma tarifa mensal mais alta. Na maioria dos dias, a via pública é suficiente. Quando você está movendo um caminhão cheio de carga valiosa com um prazo apertado, você paga pela faixa privada.

**AWS Site-to-Site VPN: A Opção Rápida**

A **AWS Site-to-Site VPN** cria um túnel criptografado entre a sua rede on-premises e a sua VPC, atravessando a internet pública.

Configuração:

1. Crie um Virtual Private Gateway (VGW) vinculado à sua VPC
2. Crie um Customer Gateway representando o seu roteador on-premises
3. Estabeleça dois túneis VPN (para redundância) entre eles

O tráfego é criptografado (AES-256). Ele percorre a internet pública, o que significa que a latência depende das condições da internet. A AWS fornece dois túneis automaticamente para redundância — se um túnel tiver problemas, o tráfego muda para o outro.

**Quando usar Site-to-Site VPN**:

- Configuração rápida (minutos a horas)
- Econômico (US$ 0,05/hora por conexão VPN)
- Largura de banda: até 1,25 Gbps por túnel
- Latência de internet aceitável para o caso de uso

Para a migração de 4 TB da Nimbus, a VPN baseada em internet a 1,25 Gbps máximo levaria: 4 TB / 1,25 Gbps ≈ 7 horas no mínimo, com sobrecarga do mundo real mais próxima de 12-20 horas. Aceitável, mas o congestionamento no caminho de internet pública o torna imprevisível.

"Qual é a outra opção?" perguntou Tom.

**AWS Direct Connect: A Linha Dedicada**

O **AWS Direct Connect** estabelece uma conexão de rede dedicada e privada entre o seu local (ou sua instalação de colocation) e a AWS. O tráfego nunca toca a internet pública.

O Direct Connect é uma conexão física — uma linha de fibra da sua rede para um local Direct Connect da AWS. Você trabalha com um provedor de telecomunicações para estabelecer o circuito físico. A AWS fornece a porta do lado deles.

**Benefícios**:

- Latência consistente e previsível (sem variância da internet pública)
- Velocidades de 50 Mbps a 100 Gbps
- Menores custos de transferência de dados do que a internet (as taxas de transferência de dados do Direct Connect são mais baratas do que as taxas padrão de saída de dados da AWS)
- Mais seguro (circuito privado, não internet pública)

**Contrapartidas**:

- A configuração leva semanas a meses (provisionamento de infraestrutura física)
- Custo significativamente maior do que VPN (US$ 0,025-0,30/hora por porta, mais os custos do circuito de telecomunicações — frequentemente US$ 500-1.000+/mês no mínimo)
- Sem redundância integrada (você estabelece circuitos redundantes por conta própria)
- Não adequado para escritórios geograficamente distribuídos sem múltiplos circuitos

Para a Nimbus: o Direct Connect era excessivo para o tamanho atual deles. Mas para empresas com volumes significativos de transferência de dados ou requisitos de conformidade para conexões de rede privadas, o Direct Connect se paga.

**Conexões Hospedadas: O Meio-Termo**

Nem toda organização pode se comprometer com um circuito de fibra dedicado de 100 Gbps. As **Conexões Hospedadas Direct Connect** permitem que Parceiros Direct Connect da AWS (telecomunicações aprovadas) provisionem conexões abaixo de 1 Gbps que você compartilha com outros clientes.

A configuração é mais rápida (dias a semanas, não meses) e custa menos do que uma conexão dedicada. A contrapartida: a capacidade compartilhada significa throughput menos consistente.

Para a Nimbus (à medida que crescem): uma conexão hospedada de 500 Mbps por meio de um parceiro forneceria conectividade privada a um preço razoável.

**AWS Transit Gateway: Hub-and-Spoke para VPCs**

À medida que a Nimbus crescia, eles acumulariam múltiplas VPCs: a VPC de produção, a VPC de staging, a VPC de análise, a VPC de ferramentas de segurança.

Sem planejamento cuidadoso, conectar essas VPCs requer uma malha completa de conexões de peering de VPC. Para 4 VPCs: 6 conexões de peering. Para 10 VPCs: 45 conexões de peering. Para 20 VPCs: 190 conexões. Isso não escala.

O **AWS Transit Gateway** é um hub de rede que conecta múltiplas VPCs e redes on-premises. Em vez de uma malha de conexões de peering, cada VPC se conecta ao Transit Gateway. O Transit Gateway roteia o tráfego entre elas.

```
On-premises ──── Direct Connect ──┐
                                  │
VPC de Produção ──────────────── Transit Gateway
VPC de Staging ───────────────── Transit Gateway
VPC de Análise ───────────────── Transit Gateway
VPC de Segurança ─────────────── Transit Gateway
```

**Roteamento transitivo**: Se a VPC A e a VPC B se conectam ao Transit Gateway, elas podem se comunicar — sem um peering direto. O Transit Gateway lida com o roteamento. Ao contrário do peering de VPC (que não é transitivo), o Transit Gateway habilita a topologia hub-and-spoke.

**Custos do Transit Gateway**: cobrado por anexo (VPC ou conexão VPN/Direct Connect) mais por GB de dados processados. Em escala, isso vale a simplicidade.

**VPC Endpoints: Acesso Privado aos Serviços AWS**

Um problema sutil de custo e segurança: quando sua instância EC2 (em uma sub-rede privada) chama a API do S3, esse tráfego roteia pelo NAT Gateway (para alcançar a internet, onde está o endpoint público do S3). Você paga pelo processamento do NAT Gateway.

Os **VPC Endpoints** permitem que os recursos na sua VPC se comuniquem com os serviços AWS de forma privada, sem passar pela internet pública — e sem o NAT Gateway.

Dois tipos:

**Gateway endpoints** (gratuito): Para S3 e DynamoDB. Você adiciona uma rota na sua tabela de rotas que direciona o tráfego do S3 ou DynamoDB para o endpoint em vez do NAT Gateway. Gratuito para criar; gratuito para usar.

**Interface endpoints** (com custo): Para outros serviços AWS (SQS, SNS, Secrets Manager, SSM, etc.). Cria uma ENI (Elastic Network Interface) na sua sub-rede com um IP privado. O tráfego para o serviço usa esse IP privado. Custa ~US$ 0,01/hora por AZ mais processamento de dados.

Tom criou imediatamente os Gateway endpoints para S3 e DynamoDB ao descobrir que eram gratuitos. A taxa de processamento de dados do NAT Gateway caiu 30%.

**AWS Global Accelerator: Roteamento na Borda**

Quando a Nimbus servia usuários da Costa Oeste a partir de us-east-1 (Virgínia), a latência era de 80ms. Não porque o servidor estivesse proibitivamente distante, mas porque o roteamento de internet pública entre Seattle e Virgínia era subótimo, passando por múltiplas redes de operadoras.

O **AWS Global Accelerator** usa a rede backbone privada da AWS (a mesma infraestrutura que alimenta o CloudFront) para rotear o tráfego entre os usuários e as aplicações AWS. Em vez do roteamento pela internet pública, o tráfego entra na rede da AWS no local de borda mais próximo e percorre o caminho privado otimizado até a sua aplicação.

Para a Nimbus, um usuário em Seattle:

- **Sem Global Accelerator**: Rotear pelas operadoras de internet pública → ~80ms
- **Com Global Accelerator**: Atingir a borda AWS mais próxima em Seattle → percorrer o backbone AWS → chegar a us-east-1 → ~45ms

O Global Accelerator não armazena conteúdo em cache (isso é o CloudFront). Ele otimiza o caminho de rede para requisições dinâmicas.

**Quando usar Global Accelerator vs CloudFront**:

- CloudFront: conteúdo estático e armazenável em cache, caso de uso de CDN
- Global Accelerator: conteúdo dinâmico, protocolos não HTTP (UDP, jogos, IoT), ou quando você precisa de um endereço IP Anycast estático

## Pontos Fortes e Limitações

**Site-to-Site VPN**:

- Configuração rápida, baixo custo
- O caminho pela internet pública significa latência variável
- Limite máximo de largura de banda limitado

**Direct Connect**:

- Consistente, privado, alta largura de banda
- Lento para configurar, custo recorrente significativo
- O circuito físico é um ponto único de falha (adicione redundância)

**Transit Gateway**:

- Simplifica drasticamente a conectividade de múltiplas VPCs
- Roteamento transitivo (ao contrário do peering de VPC)
- O custo aumenta para muitos anexos

**VPC Endpoints**:

- Benefício de segurança e custo para S3/DynamoDB (gateway endpoints gratuitos)
- Elimina os custos do NAT Gateway para tráfego de serviços AWS

**Global Accelerator**:

- Melhora a latência de aplicações dinâmicas para usuários globais
- IPs Anycast fixos (ao contrário dos IPs dinâmicos do CloudFront)
- Custo adicional (US$ 0,025/hora por acelerador + transferência de dados)

## Resumo

- **Site-to-Site VPN**: Túnel criptografado pela internet pública entre on-premises e VPC. Configuração rápida, menor custo, latência variável.
- **Direct Connect**: Conexão de fibra privada e dedicada para a AWS. Latência previsível, maior largura de banda, semanas para configurar, custo significativo.
- **Transit Gateway**: Hub para conectividade de VPC e on-premises. Habilita roteamento transitivo. Escala para centenas de conexões.
- **VPC Endpoints**: Acesso privado a serviços AWS sem NAT Gateway. Gateway endpoints (S3, DynamoDB) são gratuitos.
- **Global Accelerator**: Roteia tráfego dinâmico pelo backbone AWS para latência menor e mais consistente globalmente.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho (Domínio 3, Tarefa 3.4)*

- **Sinais VPN vs Direct Connect**: VPN = "criptografar tráfego para a VPC," "configuração rápida," "sensível a custo." Direct Connect = "latência baixa consistente," "grandes transferências de dados," "conexão privada," "conformidade exigindo rede privada."
- **Transit Gateway vs Peering de VPC**: O Peering não é transitivo (A→B→C não permite A→C). O Transit Gateway é transitivo. "Muitas VPCs precisando se comunicar" → Transit Gateway.
- **VPC Gateway Endpoints**: Gratuito. Apenas S3 e DynamoDB. Alteração na tabela de rotas. Sem custo extra. Cenário do exame: "reduzir os custos de transferência de dados para acesso ao S3 a partir de sub-rede privada" → Gateway Endpoint.
- **Global Accelerator vs CloudFront**: Accelerator = conteúdo dinâmico, não HTTP, IP estático, otimização de rede. CloudFront = cache, conteúdo HTTP, CDN.
- **Direct Connect + VPN**: Você pode usar uma VPN como backup para uma conexão Direct Connect. Se o circuito Direct Connect falhar, o tráfego faz failover para a VPN. Mais caro do que VPN sozinha, mais confiável do que Direct Connect sozinho.
- **Direct Connect Gateway**: Conecte um circuito Direct Connect a múltiplas VPCs em múltiplas regiões ou contas. Sem ele, um circuito Direct Connect se conecta a um VGW em uma região.

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre AWS Site-to-Site VPN e AWS Direct Connect. Em qual cenário você escolheria cada um?

*(Dica: Pense em tempo de configuração, custo, consistência de latência e requisitos de largura de banda.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa de serviços financeiros requer uma conexão de rede privada, criptografada e dedicada do seu data center on-premises para a AWS. Eles transferem 500 GB de dados financeiros confidenciais diariamente. A conexão deve ter latência consistente e previsível e não deve traversar a internet pública. Eles também precisam de uma conexão de backup caso a principal falhe.

Qual arquitetura MELHOR atende a esses requisitos?

A) Uma conexão Site-to-Site VPN com roteamento BGP e uma segunda VPN para redundância  
B) Uma conexão Direct Connect com uma Site-to-Site VPN como backup  
C) Duas conexões Site-to-Site VPN por meio de diferentes provedores de internet  
D) Uma Conexão Hospedada Direct Connect com Direct Connect Gateway

**Dica 1**: "Não deve traversar a internet pública" — o tráfego VPN passa pela internet pública (criptografado). Apenas o Direct Connect é privado.

**Dica 2**: "Latência consistente e previsível" — o desempenho da VPN pela internet pública varia. O Direct Connect é consistente.

**Dica 3**: "Conexão de backup" — qual é a abordagem recomendada quando o Direct Connect é o primário?

**Resposta**: B

**Explicação**: O Direct Connect fornece uma conexão privada e dedicada que não traversa a internet pública — atendendo aos requisitos de privacidade e latência. Uma Site-to-Site VPN como backup fornece redundância: se o circuito Direct Connect falhar, o tráfego faz failover para a VPN criptografada. Esse é o padrão padrão de HA para Direct Connect.

**Por que não A?** O tráfego da Site-to-Site VPN traversa a internet pública, o que viola o requisito de "não deve traversar a internet pública."

**Por que não C?** Duas conexões VPN por diferentes provedores de internet ainda traversam a internet pública, mesmo que criptografadas. Não atende ao requisito de rede privada.

**Por que não D?** Uma Conexão Hospedada fornece uma conexão Direct Connect, mas a opção D não inclui um backup. Um Direct Connect único sem backup é um ponto único de falha — a fibra física pode ser cortada.

*Domínio SAA-C03: Projetar Arquiteturas de Alto Desempenho — Tarefa 3.4*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus está expandindo para ter equipes de engenharia regionais em Seattle, Berlim e Cingapura. Cada equipe regional precisa de acesso a:

- A VPC de produção (somente leitura para depuração)
- A VPC de staging (acesso total para testes)
- A VPC de análise (somente leitura para relatórios)

Projete a conectividade de rede. Você usaria o Transit Gateway? Direct Connect em cada região ou Site-to-Site VPN? Como você imporia o acesso somente leitura para produção? (Dica: isso é uma questão tanto de rede quanto de IAM.)

*(Não há uma única resposta correta. O objetivo é praticar o design de rede multi-região e multi-equipe.)*

## Cena Pós-Créditos

A migração de dados foi concluída em 14 horas.

Não pelo lento caminho de internet pública — Leo havia usado o AWS Snow Family (dispositivos físicos de armazenamento enviados de e para a AWS) para a maior parte dos dados e depois sincronizado o delta restante pela VPN.

"Da próxima vez," disse ele, "deveríamos configurar um Direct Connect."

Tom verificou o preço.

"Uma porta dedicada de 1 Gbps custa US$ 216/mês," disse ele. "Mais o circuito do nosso escritório, que uma telecomunicações cotou em US$ 800/mês."

"Então cerca de mil por mês no total."

"Para o que fazemos agora, provavelmente não vale. Mas se começarmos a mover mais de 10 TB por mês entre o nosso escritório e a AWS, as economias na transferência de dados do Direct Connect compensariam o custo."

"Então monitoramos o volume de transferência de dados," disse Priya, "e revisamos quando cruzar o limite."

"Isso é arquitetura consciente de custos," disse Tom.

"Esse sempre foi o objetivo," disse Maya.

No próximo capítulo: o que acontece quando você tem mais dados do que qualquer banco de dados pode armazenar razoavelmente, e você precisa dar sentido a todos eles.
