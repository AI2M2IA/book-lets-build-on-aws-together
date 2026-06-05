# Capítulo 27: Pagando Pelo Que Você Precisa

Tom havia revisado a conta AWS todos os meses desde que a Nimbus começou. No primeiro ano, ele entendia aproximadamente 60% do que via. Agora, entendia quase tudo — exceto a seção do EC2.

A seção do EC2 era uma mistura de "instâncias On-Demand" de vários tipos de instância, todas precificadas por hora, todas somando US$ 2.340/mês.

"Sei que precisamos dessas instâncias," disse Tom. "Mas não entendo por que estamos pagando a tarifa de balcão por todas elas."

"A tarifa de balcão?" perguntou Leo.

"Preços On-Demand," disse Tom. "É como reservar um quarto de hotel na manhã em que você precisa. Máxima flexibilidade. Preço máximo."

"Então qual é a alternativa?"

Tom abriu a página de preços do EC2.

"Há quatro modelos de preços," disse ele. "E estamos usando apenas um."

**A Analogia do Hotel**

O preço do EC2 se mapeia surpreendentemente bem para as estratégias de reserva de quarto de hotel:

**On-Demand**: Você vai ao balcão sem reserva. Paga a tarifa completa, mas pode fazer o check-out quando quiser. Perfeito para estadias imprevisíveis.

**Reserved Instances/Savings Plans**: Reserve um quarto para o ano inteiro com antecedência. Você obtém um desconto significativo — de 30 a 72% — em troca de se comprometer a usá-lo.

**Spot Instances**: Faça um lance pelos quartos não vendidos pelo preço que o hotel estiver disposto a aceitar no momento. Até 90% de desconto. Mas o hotel pode pedir que você saia com dois minutos de aviso se precisar do quarto para um cliente de preço integral.

**Dedicated Hosts**: Alugue todo o andar do hotel exclusivamente para você. Sem compartilhamento com outros hóspedes. Significativamente mais caro. Necessário quando regras de licenciamento de software ou conformidade proíbem o compartilhamento de um host físico.

Cada modelo tem um caso de uso. O erro que a Nimbus estava cometendo: usar On-Demand para tudo, incluindo cargas de trabalho que rodavam 24/7 e eram totalmente previsíveis.

**Instâncias On-Demand: Máxima Flexibilidade, Máximo Custo**

**Quando usar**:

- Cargas de trabalho imprevisíveis (picos de tráfego que você não pode prever)
- Desenvolvimento e testes (iniciar e parar com frequência)
- Cargas de trabalho de curto prazo (executar um experimento por uma semana)
- Primeira implantação (antes de entender os padrões de uso)

**Quando não usar**:

- Cargas de trabalho de produção em estado estacionário que você sabe que vão funcionar por mais de um ano
- Qualquer coisa com carga de base previsível

Tom identificou as instâncias On-Demand da Nimbus:

- Servidores de API web: 4 instâncias EC2, rodando 24/7 há 18 meses. *Carga de base previsível.*
- Proxy de banco de dados (RDS Proxy): Sempre rodando. *Carga de base previsível.*
- Servidor VPN: Sempre rodando. *Carga de base previsível.*
- Servidores de API adicionais para picos de tráfego: Imprevisível. *On-Demand está correto aqui.*

**Reserved Instances: O Compromisso de Um Ano**

As **Reserved Instances (RIs)** são um compromisso de faturamento — você concorda em usar um tipo de instância específico em uma região específica por 1 ou 3 anos. Em troca, a AWS cobra uma tarifa horária menor.

**Níveis de desconto**:

- 1 ano, Sem Adiantamento: ~30-40% de desconto vs On-Demand
- 1 ano, Adiantamento Parcial: ~35-45% de desconto (pague algo agora, menos por hora)
- 1 ano, Todo Adiantamento: ~40-50% de desconto (pague o ano inteiro agora)
- 3 anos, Todo Adiantamento: ~55-72% de desconto (desconto máximo, compromisso máximo)

**RIs Standard vs Convertíveis**:

- **Standard**: Travada no tipo de instância e região exatos. Pode ser vendida no Reserved Instance Marketplace se você não precisar mais.
- **Convertível**: Pode mudar o tipo de instância, OS e tenancy durante o período de compromisso. Desconto menor do que a Standard (~50% máximo vs 72%).

Tom fez as contas para os 4 servidores de API (r6g.large, US$ 0,252/hora On-Demand):

- Custo anual On-Demand: US$ 0,252 × 24 × 365 × 4 = US$ 8.820
- RI de 1 ano, Todo Adiantamento (1 instância): ~US$ 1.600 adiantado
- 4 instâncias: ~US$ 6.400 adiantado = **US$ 2.420 economizados no primeiro ano**

"Poderíamos economizar US$ 2.420 no primeiro ano apenas nos comprometendo," disse Tom.

"É um compromisso," disse Maya. "E se precisarmos mudar os tipos de instância?"

"Pegamos RIs Convertíveis se acharmos que podemos."

"E se a AWS lançar um tipo de instância melhor?"

"Verificamos quando a RI expirar. Se o novo tipo for melhor, compramos uma nova RI."

**Savings Plans: O Compromisso Flexível**

Os **Savings Plans** são uma alternativa mais nova e mais flexível às Reserved Instances. Em vez de se comprometer com um tipo de instância específico, você se compromete com um *valor específico de gasto horário* (em dólares).

**Compute Savings Plans**: Aplicam-se a qualquer instância EC2, independentemente do tipo, tamanho, região ou OS. Mais flexível. Até 66% de desconto.

**EC2 Instance Savings Plans**: Aplicam-se a uma família de instância específica em uma região (por exemplo, "instâncias c6g em us-east-1"). Mais restritivo do que o Compute, mas até 72% de desconto (igual ao máximo da RI).

**SageMaker Savings Plans**: Específico para treinamento e inferência de ML do SageMaker.

Para a Nimbus: Compute Savings Plans para seus servidores de API. Eles se comprometeram com US$ 1,50/hora de gasto com EC2. Qualquer tipo de instância, qualquer tamanho. Quando eles escalam a frota ou mudam os tipos de instância, o Savings Plan ainda se aplica.

"Isso é melhor do que Reserved Instances para nós," disse Leo. "Ainda estamos experimentando com tipos de instância. O Compute Savings Plan nos dá o desconto sem nos travar no r6g especificamente."

**Spot Instances: O Desconto de 90%**

As **Spot Instances** usam a capacidade EC2 reserva da AWS. Quando a AWS tem servidores não utilizados, você pode alugá-los com 60-90% abaixo do preço On-Demand. Quando a AWS precisa da capacidade de volta (para clientes On-Demand ou Reserved), ela dá um aviso de 2 minutos e encerra sua instância.

O risco de interrupção é a característica definidora. As Spot Instances são adequadas apenas para:

- **Cargas de trabalho tolerantes a falhas**: Se uma instância for encerrada no meio de uma tarefa, a tarefa pode reiniciar sem corromper nada
- **Processamento stateless**: Redimensionamento de imagens, codificação de vídeo, análise em lote, treinamento de ML
- **Trabalhos em lote de curta duração**: O aviso de 2 minutos é suficiente para salvar o estado e criar checkpoints
- **Frotas mistas com Auto Scaling**: Use Spot para a maioria do seu ASG com On-Demand como linha de base

Para a Nimbus: As Spot Instances faziam sentido para os trabalhos de análise em lote executados todas as noites (processando os dados de pedidos do dia em relatórios agregados). Se uma Spot Instance for encerrada no meio do trabalho, o trabalho falha, mas reinicia do início em uma nova instância. Os dados no S3 estão seguros.

"Usar Spot para o trabalho noturno reduziu seu custo de US$ 12/noite para US$ 2/noite," relatou Leo.

**Dedicated Hosts: A Opção de Conformidade**

Algumas licenças de software (Oracle, Windows Server em algumas configurações) são precificadas por soquete físico ou núcleo. Quando você executa esse software em um host compartilhado (o padrão para EC2), pode estar pagando por capacidade que não está usando.

Os **Dedicated Hosts** oferecem acesso a um servidor físico exclusivamente para seu uso. Você pode trazer suas licenças existentes por soquete. Nenhuma instância de outro cliente AWS é executada no mesmo hardware.

Os Dedicated Hosts são significativamente mais caros do que o EC2 padrão. São uma ferramenta de conformidade e licenciamento, não uma ferramenta de otimização de custos.

A Nimbus não tinha requisitos de licenciamento que necessitassem de Dedicated Hosts. A maioria das aplicações cloud-native não tem.

**Construindo uma Frota Mista**

A abordagem madura: use múltiplos modelos de preços juntos.

Para a frota de API da Nimbus:

- **Carga de base (4 instâncias, sempre rodando)**: Coberta pelo compromisso do Savings Plan
- **Pico previsível (2 instâncias adicionais durante o horário comercial)**: Coberta pelo Savings Plan se o compromisso as cobrir, caso contrário On-Demand
- **Overflow de pico de tráfego**: Spot Instances (aceitável porque os servidores de API são stateless — as requisições são redistribuídas se uma instância for encerrada)

O resultado: uma frota que otimiza o custo em cada camada — preços comprometidos para a parte previsível, On-Demand para crescimento imprevisível, Spot para capacidade de burst.

## Pontos Fortes e Limitações

**On-Demand**: Sem compromisso. Preço integral. Use para cargas de trabalho imprevisíveis ou de curto prazo.

**Reserved Instances**: Até 72% de desconto. Travada em tipo de instância/região/OS específico. Venda capacidade não utilizada no RI Marketplace.

**Savings Plans**: Até 66-72% de desconto. Mais flexível do que RIs (Compute Savings Plans se aplicam a qualquer tipo de instância). Aplicação automática ao uso correspondente.

**Spot Instances**: Até 90% de desconto. Risco de interrupção de 2 minutos. Apenas para cargas de trabalho tolerantes a falhas, stateless e interrompíveis.

**Dedicated Hosts**: Servidor físico completo. Mais caro. Necessário para certos cenários de licenciamento ou conformidade.

## Resumo

- O preço do EC2 tem quatro modelos: **On-Demand** (preço integral, sem compromisso), **Reserved Instances/Savings Plans** (gasto comprometido para desconto significativo), **Spot** (capacidade reserva com 60-90% de desconto, interrompível), **Dedicated Hosts** (exclusividade do servidor físico).
- Os **Savings Plans** são geralmente preferidos às Reserved Instances pela flexibilidade.
- As **Spot Instances** requerem cargas de trabalho tolerantes a falhas e stateless — apenas para trabalhos em lote, treinamento de ML e processamento interrompível.
- A estratégia ideal é uma **frota mista**: Savings Plans para a linha de base, On-Demand para crescimento imprevisível, Spot para trabalho em lote interrompível.
- Revise os modelos de preços quando as cargas de trabalho estiverem rodando de forma estável por 3+ meses — é quando o On-Demand começa a ser desperdício.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.2)*

- **Savings Plans vs Reserved Instances**: Os Savings Plans são mais flexíveis (se aplicam a qualquer instância EC2 para Compute Savings Plans). As Reserved Instances travam em um tipo de instância específico. Cenários do exame: "precisa de máxima flexibilidade enquanto ainda obtém descontos" → Savings Plans. "Conhece o tipo exato de instância por 3 anos" → Standard RI para desconto máximo.
- **Sinais de Spot**: "sensível a custo," "tolerante a falhas," "processamento em lote," "pode lidar com interrupções," "cargas de trabalho stateless," "treinamento de ML" → Spot.
- **Tratamento de interrupção Spot**: As instâncias Spot recebem um aviso de 2 minutos antes do encerramento. Sua aplicação deve lidar com isso graciosamente (salvar estado, drenar conexões, sair de forma limpa).
- **On-Demand vs Spot para servidores web**: Servidores web que atendem tráfego de usuários ao vivo NÃO devem usar Spot (a interrupção causa falha nas requisições). Use On-Demand ou Savings Plans para a camada web.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans se aplicam a uma família de instância e região específica (maior desconto). Compute Savings Plans se aplicam a qualquer instância EC2, Lambda e Fargate (menor desconto máximo, mais flexível).
- **RI Marketplace**: As Reserved Instances Standard não utilizadas podem ser vendidas para outros clientes AWS. RIs Convertíveis não podem ser vendidas.

## Exercícios

**Exercício 1 — Recordação**

Explique quando as Spot Instances são adequadas e quando não são. Que característica torna uma carga de trabalho adequada para Spot?

*(Dica: Pense no que acontece quando a instância é encerrada com 2 minutos de aviso. Quais cargas de trabalho se recuperam de forma limpa? Quais não se recuperam?)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa de mídia executa um pipeline de transcodificação de vídeo que converte vídeos enviados em múltiplos formatos. Os trabalhos de transcodificação são executados continuamente sempre que vídeos são enviados (operação 24/7, volume variável). Cada trabalho leva de 5 a 30 minutos. Se um trabalho de transcodificação for interrompido, ele pode ser reiniciado do início sem perda de dados. A empresa quer minimizar custos.

Qual modelo de preço EC2 MELHOR atende a esses requisitos?

A) Instâncias On-Demand em um Auto Scaling Group  
B) Reserved Instances (1 ano, Todo Adiantamento)  
C) Spot Instances com Spot Fleet para diversificação automática de instâncias  
D) Dedicated Hosts com as licenças de software de mídia existentes da empresa

**Dica 1**: "Pode ser reiniciado do início sem perda de dados" — essa é a frase-chave que habilita um modelo de preços específico.

**Dica 2**: "Minimizar custo" com uma carga de trabalho interrompível aponta para a opção de desconto máximo.

**Dica 3**: O Spot Fleet solicita instâncias de múltiplos tipos de instância e AZs, reduzindo a chance de interrupção.

**Resposta**: C

**Explicação**: Os trabalhos de transcodificação são tolerantes a falhas — podem ser reiniciados se interrompidos. Isso os torna ideais para Spot Instances, que oferecem 60-90% de desconto em relação ao On-Demand. O Spot Fleet diversifica entre tipos de instância e Zonas de Disponibilidade, reduzindo a probabilidade de interrupção em massa.

**Por que não A?** On-Demand é a opção de maior custo. Para uma carga de trabalho continuamente em execução e tolerante a falhas, isso é desperdício.

**Por que não B?** As Reserved Instances fornecem um desconto de 50-72%, mas não oferecem o potencial de 90% de desconto da Spot para cargas de trabalho tolerantes a falhas. Além disso, as RIs são para cargas de trabalho previsíveis em estado estacionário — a Spot é especificamente para processamento em lote interrompível.

**Por que não D?** Os Dedicated Hosts são para conformidade de licenciamento, não otimização de custos. São a opção mais cara.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.2*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A infraestrutura da Nimbus tem estas cargas de trabalho:

1. Servidores de API: 6 instâncias, rodando 24/7, estáveis há 2 anos, usam r6g.large
2. Trabalhos em lote de análise noturna: 4 instâncias, rodando das 3h às 6h todos os dias, sempre o mesmo tipo de instância
3. Ambiente de testes: 2 instâncias, usadas por engenheiros das 9h às 18h nos dias úteis
4. Overflow de pico de tráfego: 0-8 instâncias, iniciam durante os horários de pico, completamente imprevisíveis

Projete a estratégia de preços ideal para cada tipo de carga de trabalho. Qual valor de compromisso do Savings Plan cobriria as cargas de trabalho 1 e 2? Para a carga de trabalho 3, há uma estratégia mais inteligente do que On-Demand?

*(Não há uma única resposta correta. O objetivo é praticar a estratégia de preços do EC2.)*

## Cena Pós-Créditos

Tom enviou a compra do Savings Plan.

Compromisso de US$ 5,76/hora. Prazo de três anos. Compute Savings Plans para flexibilidade.

A economia estimada: US$ 42.500 ao longo de três anos.

Maya leu o número. "Quarenta e dois mil dólares."

"Em comparação com On-Demand pelas mesmas instâncias, ao longo de três anos."

"Quanto custou fazer isso?"

"Uma tarde de análise," disse Tom. "E a decisão de se comprometer."

"Três anos é muito tempo," disse Leo. "E se mudarmos os tipos de instância?"

"Os Compute Savings Plans se aplicam a qualquer tipo de instância EC2. E em três anos, somos grandes o suficiente para que essa conversa pareça diferente de qualquer forma."

Leo pensou sobre isso.

"Há quanto tempo você sabe sobre Savings Plans?" perguntou ele.

"Desde que começamos," disse Tom. "Estava esperando até que a carga de trabalho fosse estável o suficiente para me comprometer."

"Dezoito meses pagando On-Demand enquanto esperávamos."

"Sim." Tom fechou o console. "Às vezes a coisa mais cara que você faz é esperar para economizar dinheiro."

No próximo capítulo: a mesma disciplina aplicada aos custos de armazenamento, com algumas surpresas sobre o que está impulsionando a conta.
