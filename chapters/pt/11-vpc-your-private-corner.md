# Capítulo 11: O Seu Canto Privado na Nuvem

Priya tinha um pedaço de papel com um desenho.

Não era um desenho complicado. Um rectângulo, com a etiqueta "AWS". Dentro do rectângulo, um conjunto de caixas: instâncias EC2, uma base de dados RDS, um cluster ElastiCache. Linhas a ligar tudo a tudo. E fora do rectângulo, uma única etiqueta: "Internet".

Colocou-o no centro da mesa.

"É isto que temos," disse ela. "A nossa base de dados tem um endereço IP público. A nossa camada de cache pode ser acedida a partir da internet. As nossas instâncias EC2 estão todas na mesma rede plana."

"Parece bem," disse Leo. "Temos grupos de segurança."

"Grupos de segurança que você configurou," disse Priya. "À noite. Durante a configuração inicial."

Leo não disse nada.

"Não estou a criticar a configuração," disse ela. "Estou a dizer que quando tudo vive numa rede pública plana, uma única configuração incorrecta é a diferença entre um sistema que funciona e um que é acessível a toda a gente na internet."

Pegou num marcador vermelho e desenhou um círculo em volta da base de dados.

"Isto não deve ser acessível a partir da internet. De modo algum. Não através de uma regra de grupo de segurança, não através de uma configuração reforçada. Deve ser estruturalmente inacessível."

"Precisamos de falar sobre arquitectura de rede," disse Maya.

"Precisávamos de falar sobre isso há três meses," disse Priya. "Mas agora também serve."

A equipa reuniu-se em torno de um quadro branco pela primeira vez em semanas.

**O Problema com o Parque de Estacionamento Aberto**

Imagine um enorme parque de estacionamento público. Dez mil carros. Qualquer carro pode estacionar em qualquer lugar. Não há barreiras entre zonas, sem portões, sem secções reservadas.

Esta é uma rede aberta. Cada serviço pode alcançar qualquer outro serviço. O servidor web pode falar com a base de dados. A base de dados pode alcançar a internet. A camada de cache pode receber conexões de qualquer lugar.

Quando tudo pode falar com tudo, um comprometimento afecta tudo.

"Portanto, se alguém entrar no parque de estacionamento," disse Tom, "pode entrar em qualquer carro."

"E de qualquer carro, ir para qualquer lugar," confirmou Priya. "Queremos vedações. Queremos portões fechados. Queremos zonas."

O VPC é como se constroem essas zonas na AWS.

**O Que É um VPC?**

Uma **Virtual Private Cloud (VPC)** é uma secção logicamente isolada da nuvem AWS — uma rede privada que define, à qual apenas os seus recursos podem aceder por defeito.

Pense nela como um terreno privado vedado dentro do enorme parque de estacionamento público. O seu terreno tem as suas próprias regras: quem pode entrar, quem pode sair, que rotas existem entre secções.

Quando cria um VPC, define:

**Um bloco CIDR**: O intervalo de endereços IP disponíveis dentro da sua rede. Por exemplo, `10.0.0.0/16` dá-lhe 65 536 endereços IP possíveis (10.0.0.0 a 10.0.255.255).

**Sub-redes**: Subdivisões do seu VPC, cada uma com uma porção do seu intervalo de endereços IP e associada a uma Zona de Disponibilidade específica.

**Tabelas de rotas**: Regras que determinam para onde vai o tráfego de rede.

**Internet Gateway**: A conexão entre o seu VPC e a internet pública.

**Sub-redes: Pública vs. Privada**

Nem todos os recursos devem ser publicamente acessíveis.

O seu servidor web precisa de aceitar tráfego da internet — os browsers dos utilizadores precisam de o alcançar.

A sua base de dados *nunca* deve aceitar tráfego da internet — apenas o seu servidor web deve poder falar com ela.

É aqui que entram as sub-redes.

Uma **sub-rede pública** está ligada a um Internet Gateway e pode ter recursos com endereços IP públicos. O tráfego pode fluir de e para a internet.

Uma **sub-rede privada** não tem conexão directa com a internet. Os recursos numa sub-rede privada só podem comunicar com outros recursos no seu VPC (a não ser que configure rotas de saída específicas). Não têm endereços IP públicos.

Para Nimbus, o design ficou claro:

```
Internet
    |
Internet Gateway
    |
Sub-rede Pública (AZ-a)     Sub-rede Pública (AZ-b)
  [Balanceador de Carga]      [Balanceador de Carga]
    |                              |
Sub-rede Privada (AZ-a)     Sub-rede Privada (AZ-b)
  [Instâncias EC2]              [Instâncias EC2]
    |                              |
Sub-rede Privada (AZ-a)     Sub-rede Privada (AZ-b)
  [RDS Primário]              [RDS Standby]
  [ElastiCache]               [ElastiCache]
```

O balanceador de carga é voltado para o público — precisa de receber tráfego da internet. As instâncias EC2 são privadas — apenas recebem tráfego do balanceador de carga. As bases de dados são privadas — apenas recebem tráfego das instâncias EC2.

"Portanto, para alcançar a base de dados," disse Tom, "alguém teria de passar pelo balanceador de carga, depois pela instância EC2, depois pelo grupo de segurança da base de dados?"

"Três camadas," confirmou Priya. "Defesa em profundidade."

**O NAT Gateway: Sub-redes Privadas Que Ainda Podem Descarregar Coisas**

As sub-redes privadas não podem alcançar a internet. Mas por vezes precisam. A sua instância EC2 precisa de descarregar uma actualização de software. A sua aplicação precisa de chamar uma API externa.

É aqui que entra o **NAT Gateway** (Network Address Translation).

Um NAT Gateway fica numa sub-rede pública. Os recursos em sub-redes privadas podem enviar tráfego de saída para o NAT Gateway, que o retransmite para a internet — mas a internet não pode iniciar conexões de volta.

É como uma porta giratória unidireccional. Pode sair. Ninguém de fora pode entrar.

"Quanto custa um NAT Gateway?" perguntou Tom.

A pergunta não surpreendeu ninguém.

O preço do NAT Gateway tem dois componentes: uma taxa horária por cada NAT Gateway, mais uma taxa de processamento de dados por GB. Isto pode acumular inesperadamente (o Capítulo 30 cobre isto em detalhe). Por agora: não use mais NAT Gateways do que precisa, e esteja ciente de que grandes quantidades de dados de saída aparecerão na sua factura.

**Tabelas de Rotas: Como o Tráfego Encontra o Seu Caminho**

Cada sub-rede tem uma **tabela de rotas** que diz ao tráfego para onde ir.

Uma tabela de rotas de sub-rede pública típica:

| Destino     | Alvo                           |
|-------------|--------------------------------|
| 10.0.0.0/16 | local                          |
| 0.0.0.0/0   | igw-xxxx (Internet Gateway)    |

A primeira regra: o tráfego para qualquer IP no intervalo do seu VPC fica local. A segunda regra: todo o outro tráfego (`0.0.0.0/0` significa "tudo") vai para o Internet Gateway.

Uma tabela de rotas de sub-rede privada:

| Destino     | Alvo                   |
|-------------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

O tráfego de sub-rede privada fica local ou sai através do NAT Gateway. Sem rota directa para o Internet Gateway.

**Grupos de Segurança vs NACLs (Pré-visualização)**

Dentro do VPC, tem duas ferramentas para controlar tráfego ao nível do recurso:

Os **Grupos de Segurança** (o Capítulo 15 cobre isto em profundidade) actuam como firewalls virtuais para recursos individuais — uma instância EC2, uma instância RDS, um balanceador de carga. São *com estado*: se o tráfego é permitido na entrada, o tráfego de resposta é automaticamente permitido na saída.

As **ACLs de Rede (NACLs)** operam ao nível da sub-rede e são *sem estado*: deve permitir explicitamente tanto o tráfego de entrada como de saída separadamente.

Para a maioria dos casos de uso, os Grupos de Segurança são suficientes. As NACLs acrescentam uma camada extra quando precisa de controlos ao nível da sub-rede — por exemplo, bloquear um intervalo IP específico de alcançar alguma vez uma sub-rede.

"Grupos de segurança ao nível da instância," escreveu Leo no quadro branco. "NACLs ao nível da sub-rede."

"E nunca deixe a porta 22 aberta para 0.0.0.0/0," acrescentou Priya, olhando para Leo.

"Foi uma vez," disse Leo.

"É sempre exactamente uma vez," disse Priya, "até não ser."

**VPC Peering: Ligar Redes Privadas**

E se Nimbus crescer para múltiplos VPCs? (Isto acontece. As equipas ficam grandes. Os serviços ficam isolados em contas separadas.)

O **VPC Peering** deixa dois VPCs comunicar privadamente como se estivessem na mesma rede. O tráfego não sai da rede privada da AWS.

Limites importantes:

- O VPC peering não é transitivo. Se o VPC A faz peering com o VPC B, e o VPC B faz peering com o VPC C, A e C não podem comunicar — a não ser que adicione um peer A-C directo.
- Os blocos CIDR não podem sobrepor-se entre VPCs com peering.

Para arquitecturas maiores com muitos VPCs, o **AWS Transit Gateway** (Capítulo 25) trata do encaminhamento transitivo sem exigir uma malha completa de conexões de peering.

## Pontos Fortes e Limitações

**Por que razão o design VPC importa**:

- O isolamento de rede é defesa em profundidade — violar uma camada não significa comprometer tudo
- As sub-redes privadas reduzem significativamente a superfície de ataque
- As tabelas de rotas e grupos de segurança dão controlo preciso sobre fluxos de tráfego
- Os VPCs integram-se com cada serviço de rede AWS (Direct Connect, VPN, Transit Gateway)

**Onde fica complicado**:

- O design VPC requer planeamento antecipado — os blocos CIDR são difíceis de alterar depois
- Demasiados VPCs pequenos criam complexidade de peering (problema n-ao-quadrado)
- Depurar problemas de rede em VPCs requer perceber tabelas de rotas, grupos de segurança, NACLs e associações de sub-redes simultaneamente
- Os custos do NAT Gateway podem surpreender em escala (taxas de processamento por GB)

## Resumo

- Um **VPC** é uma rede privada logicamente isolada na AWS — o seu terreno vedado dentro da nuvem pública.
- As **sub-redes** dividem o VPC por Zona de Disponibilidade. As sub-redes públicas ligam-se ao Internet Gateway; as sub-redes privadas não.
- Coloque recursos voltados para a internet (balanceadores de carga) em sub-redes públicas. Coloque todo o resto (EC2, bases de dados, caches) em sub-redes privadas.
- As **tabelas de rotas** controlam onde flui o tráfego. Cada sub-rede tem uma.
- O **NAT Gateway** (numa sub-rede pública) deixa recursos privados iniciar conexões de saída à internet sem aceitar conexões de entrada.
- O **VPC Peering** liga dois VPCs privadamente. Não é transitivo — para conectividade em grande escala, use Transit Gateway.
- Os **grupos de segurança** protegem recursos individuais (com estado). As **NACLs** protegem sub-redes inteiras (sem estado).

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Seguras (Domínio 1, Tarefa 1.2)*

- **Sub-rede pública vs. privada**: a diferença é a tabela de rotas. A sub-rede pública tem uma rota para um Internet Gateway. A sub-rede privada não tem.
- **Colocação do NAT Gateway**: sempre na sub-rede *pública*. Os recursos de sub-rede privada encaminham tráfego de saída para ele.
- **Alta disponibilidade para NAT**: crie um NAT Gateway por AZ. Se tiver um NAT Gateway em AZ-a e as instâncias AZ-b encaminham através dele, a falha de AZ-a desactiva também o acesso à internet de AZ-b.
- **O VPC Peering não é transitivo**: o exame descreverá três VPCs e perguntará se podem comunicar através do do meio — a resposta é não sem peering directo ou Transit Gateway.
- **Sobreposição CIDR**: VPCs com peering não podem ter blocos CIDR sobrepostos. Armadilha clássica do exame.
- **Host bastião (jump box)**: para SSH numa instância EC2 privada, precisa de um host bastião na sub-rede pública. O bastião é a única máquina com IP público; as instâncias privadas só aceitam SSH do grupo de segurança do bastião.
- **VPC Endpoints**: permitem que recursos privados alcancem serviços AWS (S3, DynamoDB) sem passar pelo NAT Gateway. Dois tipos: **endpoints de Gateway** (S3, DynamoDB — gratuitos) e **endpoints de Interface** (outros serviços — preço por hora mais dados).

## Exercícios

**Exercício 1 — Recordar**

Explique por que razão uma base de dados deve estar numa sub-rede privada. Que ameaça específica isso mitiga?

*(Sugestão: O que pode alguém fazer a uma base de dados que está na internet pública que não pode fazer a uma que só é acessível de dentro do VPC?)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa está a projectar uma aplicação web de três camadas na AWS. A camada web (ALB + EC2) deve aceitar tráfego da internet. A camada de aplicação (EC2) deve apenas receber tráfego da camada web. A camada de base de dados (RDS) deve apenas receber tráfego da camada de aplicação. As instâncias EC2 da camada de aplicação precisam de descarregar pacotes de software da internet. A solução deve ser altamente disponível.

Qual arquitectura MELHOR satisfaz estes requisitos?

A) Todas as camadas em sub-redes públicas; grupos de segurança restringem tráfego entre camadas  
B) Camada web em sub-redes públicas; camadas de aplicação e base de dados em sub-redes privadas; um NAT Gateway numa sub-rede pública  
C) Camada web em sub-redes públicas; camadas de aplicação e base de dados em sub-redes privadas; um NAT Gateway por AZ  
D) Todas as camadas em sub-redes privadas; um Internet Gateway fornece acesso bidireccional à internet a todas as camadas

**Sugestão 1**: "Altamente disponível" significa sem ponto único de falha. Qual opção introduz um NAT Gateway como ponto único de falha?

**Sugestão 2**: Se o AZ do NAT Gateway ficar inoperacional, quais instâncias perdem acesso à internet?

**Sugestão 3**: Leia o requisito cuidadosamente — a camada de aplicação precisa de acesso à internet *de saída*, não de entrada.

**Resposta**: C

**Explicação**: A camada web em sub-redes públicas fornece acesso voltado para a internet através do ALB. As camadas de aplicação e base de dados em sub-redes privadas garantem que não são directamente acessíveis a partir da internet. Um NAT Gateway por AZ (um em cada sub-rede pública) fornece acesso de saída à internet de alta disponibilidade para instâncias de sub-redes privadas — se uma AZ falhar, o NAT Gateway da outra AZ continua a servir tráfego.

**Por que não A?** Sub-redes públicas para todas as camadas expõem a aplicação e base de dados directamente à internet, derrotando o propósito do modelo de segurança em camadas.

**Por que não B?** Um NAT Gateway numa única AZ é um ponto único de falha. Se o NAT Gateway dessa AZ falhar, todas as instâncias privadas perdem acesso à internet de saída.

**Por que não D?** Um Internet Gateway fornece conectividade bidirecional — sub-redes privadas com uma rota para o Internet Gateway são efectivamente sub-redes públicas.

*Domínio SAA-C03: Projectar Arquitecturas Seguras — Tarefa 1.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus está a crescer. A equipa de engenharia quer separar o "serviço de menus" na sua própria conta com o seu próprio VPC, mantendo a aplicação principal Nimbus numa conta e VPC separados.

Como ligaria estes dois VPCs para que a aplicação principal possa consultar o serviço de menus? Que restrições teria de planear? O que usaria em vez disso se Nimbus tivesse dez VPCs de microsserviços separados que todos precisassem de comunicar?

*(Não existe uma resposta única correcta. O objectivo é praticar o design de rede multi-VPC.)*

## Cena Pós-Créditos

Priya redesenhou a rede.

Três dias depois, cada recurso estava no lugar certo. Instâncias EC2 em sub-redes privadas. Balanceadores de carga em sub-redes públicas. RDS e ElastiCache acessíveis apenas a partir da camada de aplicação. Grupos de segurança com as portas mínimas necessárias.

Leo tinha tentado fazer SSH directamente na base de dados para verificar algo. Não conseguiu. A conexão expirou.

"Bom," disse Priya.

"Só precisava de verificar uma coisa," disse Leo.

"O quê?"

"Se o índice estava correctamente configurado."

Priya abriu o portátil. "Posso verificar a partir do host bastião, através da instância de aplicação, que tem as credenciais correctas da base de dados em Secrets Manager."

"São quatro saltos."

"É correcto." Escreveu algo. "O índice está configurado. De nada."

Leo olhou para o ecrã por um momento.

"Vou aprender isto," disse ele.

"Já estás," disse ela. "Acabaste de te queixar dos controlos de segurança em vez de te queixares de que não existiam."

No próximo capítulo: como a internet encontra Nimbus — a maquinaria invisível dos nomes de domínio.
