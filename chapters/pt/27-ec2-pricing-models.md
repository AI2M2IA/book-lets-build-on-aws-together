# Capítulo 27: Pagando Pelo Que Você Precisa

Tom preparou um café antes de abrir a aba de cobrança. Sempre fazia isso — alguns relatórios eram melhor encarados com algo quente em mãos. Acomodou-se na cadeira perto da janela, caneca na mão, a manhã de sábado ainda silenciosa lá fora. Sem pings, sem dailies. Apenas a planilha e os números.

Ele abriu a aba.

**Recapitulando: Da Descoberta do Athena à Conta**

A análise com Athena do capítulo anterior havia feito algo inesperado: ao consultar os relatórios de custo e uso diretamente do S3, Tom finalmente conseguia ver não apenas o total da conta AWS, mas um detalhamento do que cada serviço estava realmente custando, semana a semana, ao longo de seis meses. O quadro que emergiu era claro o suficiente para ser alarmante. O EC2 era o maior item da conta, e o padrão era inconfundível — a equipe vinha pagando tarifas de balcão por um hotel em que morava em tempo integral. Essa constatação levou Tom à página de preços do EC2 numa manhã de sábado, com uma caneca de café fresco e a determinação de entender cada opção antes que a próxima fatura mensal chegasse.

Tom havia revisado a conta AWS todos os meses desde que a Nimbus começou. No primeiro ano, ele entendia aproximadamente 60% do que via. Agora, entendia quase tudo — exceto por que a seção do EC2 sempre o fazia sentir que estavam pagando demais. A seção do EC2 era uma mistura de "instâncias On-Demand" de vários tipos de instância, todas precificadas por hora, todas somando US$ 2.340/mês.

Antes de ligar para alguém, ele passou uma hora percorrendo a lista de instâncias por conta própria — não para concluir nada, mas para formar hipóteses que pudesse testar.

Ele viu quatro instâncias r6g.large marcadas como "api-prod". Viu duas instâncias c6g.medium rodando os processadores de tarefas em segundo plano. Viu uma t3.medium rotulada como "vpn-server" que vinha rodando desde o terceiro mês de existência da empresa. Viu um par de instâncias marcadas como "analytics-batch" que apareciam às 3h e desapareciam antes das 7h toda noite.

Ele anotou uma coluna de hipóteses:

- Servidores de API: previsíveis, sempre rodando.
- Processadores em segundo plano: provavelmente previsíveis.
- Servidor VPN: sempre rodando, nunca muda.
- Análise em lote: talvez elegível para Spot?

Então escreveu na margem: *verificar cada uma antes de decidir qualquer coisa.*

Essa disciplina — de separar "o que eu suponho" de "o que eu sei" — era o que tornava as revisões de custo de Tom úteis. Ele chamou os outros.

"Poderíamos simplesmente continuar pagando a tarifa de balcão," disse Tom, quando os outros entraram na chamada. "Mas não vamos."

"A tarifa de balcão?" perguntou Leo.

"Preços On-Demand," disse Tom. "É como reservar um quarto de hotel na manhã em que você precisa. Máxima flexibilidade. Preço máximo."

"Qual é a alternativa?"

**A Analogia do Hotel**

Tom pensou por um momento. "Você sabe como algumas pessoas reservam um quarto de hotel na manhã em que chegam? É a gente agora. Há estratégias melhores — reservar com seis meses de antecedência e ganhar desconto, pegar um quarto não vendido no último minuto por um preço bem reduzido, ou alugar o andar inteiro se você precisar do andar inteiro. Mesmo hotel, quatro preços diferentes."

Leo olhou para ele. "E as versões AWS disso são?"

Tom abriu a página de preços do EC2. "Há quatro modelos de preços. E estamos usando apenas um."

O preço do EC2 se mapeia surpreendentemente bem para as estratégias de reserva de quarto de hotel:

**On-Demand**: Vá até o balcão sem reserva. Você paga a tarifa cheia, mas pode fazer o check-out quando quiser. Perfeito para estadias imprevisíveis.

**Reserved Instances/Savings Plans**: Reserve um quarto para o ano inteiro com antecedência. Você obtém um desconto significativo — de 30 a 72% — em troca de se comprometer a usá-lo.

**Spot Instances**: Pegue um quarto não vendido pela tarifa fortemente reduzida que o hotel pratica no momento — sem pechinchar, o hotel define o preço com base em quão vazio está. Até 90% de desconto. Mas o hotel pode pedir que você saia com dois minutos de aviso se precisar do quarto para um cliente de preço integral. (Anos atrás você tinha que dar um *lance* por capacidade Spot; a AWS aposentou os lances em 2017 — você simplesmente paga o preço Spot atual.)

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

**Hibernação do EC2: Pausar Sem Perder o Estado**

Uma técnica de otimização de custos que não recebe atenção suficiente é a **Hibernação do EC2**. Quando você para uma instância normal, o conteúdo da RAM se perde — a próxima inicialização é a frio. O sistema operacional inicializa, a aplicação se inicializa, as conexões de banco de dados são restabelecidas. Para a maioria dos servidores web de produção, isso é aceitável. Para certas cargas de trabalho, é caro.

Quando você hiberna uma instância, o conteúdo da RAM é salvo no volume raiz EBS antes do desligamento. Na próxima inicialização, a instância retoma exatamente de onde parou — processos rodando, conexões estabelecidas, estado da aplicação intacto — em uma fração do tempo que uma inicialização a frio levaria. É particularmente útil para trabalhos de análise de longa duração que você quer pausar durante a noite sem perder o estado, ou para instâncias de desenvolvimento que levam vários minutos para inicializar e configurar seu ambiente.

"Tenho uma instância de ciência de dados," disse Leo, olhando para a impressão. "Leva nove minutos para inicializar. Ambiente customizado, uma dúzia de pacotes Python, alguns pesos de modelo pré-carregados. Eu a paro toda noite e reinicio toda manhã."

"Então você passa nove minutos vendo ela inicializar todo dia," disse Tom.

"Sim."

"São 45 minutos por semana de tempo de engenharia esperando uma instância EC2."

"Sim."

"Hiberne ela."

Com a hibernação, a instância de Leo pausava no fim do dia, salvava sua RAM no volume raiz EBS e retomava em menos de 90 segundos na manhã seguinte. As sessões de análise continuavam exatamente de onde ele havia parado.

Requisitos da hibernação: a hibernação deve ser **habilitada no lançamento** — você não pode ativá-la em uma instância já em execução (Leo teve que relançar sua máquina de ciência de dados a partir de uma AMI para conseguir). As instâncias devem ter RAM de até 150 GB (o conteúdo da RAM tem que caber no volume raiz EBS), o volume raiz deve ser grande o suficiente para conter tanto o SO quanto o despejo da RAM, e o volume raiz deve ser criptografado (a hibernação salva dados sensíveis em memória no disco). Instâncias bare-metal e instâncias com mais de 150 GB de RAM não suportam hibernação. Mais um limite: uma instância pode ficar hibernada por no máximo **60 dias** — depois disso, ela deve ser iniciada, parada ou encerrada; não pode dormir indefinidamente.

Tom identificou as instâncias On-Demand da Nimbus:

- Servidores de API web: 4 instâncias EC2, rodando 24/7 há 18 meses. *Carga de base previsível.*
- Servidor VPN: Sempre rodando. *Carga de base previsível.*
- Servidores de API adicionais para picos de tráfego: Imprevisível. *On-Demand está correto aqui.*

"Espera — mas *por que* os servidores de pico ficariam em On-Demand?" perguntou Maya. "Se temos picos toda sexta-feira, isso não é previsível o suficiente para nos comprometermos?"

Tom considerou. "A linha de base é previsível. O pico é previsível no momento, mas não na magnitude. Algumas noites de sexta ficam 30% acima do normal; outras, 150% acima. Se eu comprar capacidade Reserved para seis instâncias e um pico precisar de apenas duas extras, comprometi demais. Se eu comprar para duas e o pico precisar de oito, fico curto e o excedente roda em On-Demand de qualquer jeito. Para a capacidade de burst especificamente, On-Demand ou Spot é o correto — você não pode comprar uma Reserved Instance em tempo real quando o tráfego começa a subir."

Há uma razão para a lista de "quando não usar" importar: se você vem rodando as mesmas instâncias há seis meses e consegue prever que elas vão continuar rodando, cada mês em On-Demand é um mês em que você paga a tarifa de balcão por um quarto que ocupa permanentemente.

**Reserved Instances: O Compromisso de Um Ano**

As **Reserved Instances (RIs)** são um compromisso de faturamento — você concorda em usar um tipo de instância específico em uma região específica por 1 ou 3 anos. Em troca, a AWS cobra uma tarifa horária menor.

**Níveis de desconto**:

- 1 ano, Sem Adiantamento: ~30-40% de desconto vs On-Demand
- 1 ano, Adiantamento Parcial: ~35-45% de desconto (pague algo agora, menos por hora)
- 1 ano, Todo Adiantamento: ~40-50% de desconto (pague o ano inteiro agora)
- 3 anos, Todo Adiantamento: ~55-72% de desconto (desconto máximo, compromisso máximo)

**RIs Standard vs Convertíveis**:

- **Standard**: Travada no tipo de instância e região exatos. Pode ser vendida no Reserved Instance Marketplace se você não precisar mais dela.
- **Convertível**: Pode mudar o tipo de instância, OS e tenancy durante o período de compromisso. Desconto menor do que a Standard (até ~66% vs 72%).

Tom fez as contas para os 4 servidores de API (r6g.large, cerca de US$ 0,101/hora On-Demand):

- Custo anual On-Demand: US$ 0,101 × 24 × 365 × 4 ≈ US$ 3.540
- RI de 1 ano, Todo Adiantamento (1 instância): ~US$ 520 adiantado (≈41% de desconto)
- 4 instâncias: ~US$ 2.080 adiantado = **cerca de US$ 1.460 economizados no primeiro ano**

"Poderíamos economizar quase mil e quinhentos dólares no primeiro ano apenas nos comprometendo," disse Tom. "Quanto isso custa por mês, exatamente — cada instância reservada comparada ao que estamos pagando agora?"

"É concentrado no início," disse Maya. "Você paga o ano inteiro adiantado."

"Espera — mas *por que* nos comprometeríamos com a RI Standard se os tipos de instância ainda estão evoluindo?" perguntou Maya. "E se o r6g ficar obsoleto no ano que vem?"

"Pegamos RIs Convertíveis se acharmos que podemos precisar mudar. Menos desconto — até ~66% em vez de 72% — mas com a flexibilidade de trocar de família de instância durante o período de compromisso."

"E se a AWS lançar um tipo de instância melhor depois que nos comprometermos?"

"Verificamos quando a RI expira. Se o novo tipo for melhor, compramos uma nova RI para o próximo período. A RI atual ainda segue seu curso pelo preço comprometido."

Tom trouxe a comparação de ponto de equilíbrio para a tela compartilhada, para que todos pudessem acompanhar:

**Comparação tripla: r6g.large, 4 instâncias, 12 meses**

| Opção | Custo Anual | Equivalente Mensal | Flexibilidade |
|---|---|---|---|
| On-Demand (US$ 0,101/h × 4) | US$ 3.540 | US$ 295 | Total |
| Compute Savings Plan (~34% de desconto em 1 ano, US$ 0,27/h comprometido) | US$ 2.365 | US$ 197 | Alta |
| Standard RI, 1 ano Todo Adiantamento (4 × US$ 520) | US$ 2.080 | US$ 173 | Baixa |

"Espera," disse Leo. "A RI é mais barata do que o Savings Plan?"

"No mesmo período, sim — esse é o preço da flexibilidade," disse Tom. "Um Compute Savings Plan se aplica a *qualquer* tipo de instância, tamanho, região, até Fargate e Lambda, então seu desconto máximo é menor — até 66% no nível de 3 anos. Uma Standard RI, ou um EC2 Instance Savings Plan, te trava em uma família de instância e te paga por esse travamento com descontos de até 72%. Quanto mais liberdade você mantém, menos a AWS desconta."

"Qual é o ponto de equilíbrio para a RI de 3 anos?"

"3 anos Todo Adiantamento: cerca de US$ 1.060 por instância, então US$ 4.240 no total para as quatro — isso compra 36 meses. Equivalente mensal: US$ 118, contra US$ 295 do On-Demand. O adiantamento se paga por volta do mês quatorze; depois disso, você fica em território de economia por quase mais dois anos."

"Então, se decidirmos no mês quatro que precisamos de uma família de instância diferente," disse Priya, "ainda estaremos pagando pelo compromisso original."

"Correto. Você pode vender RIs Standard no RI Marketplace, mas nem sempre pelo valor cheio. RIs Convertíveis podem ser trocadas, mas não vendidas. É por isso que o Savings Plan costuma ser a escolha mais segura — mesmo princípio, menos travamento."

**Savings Plans: O Compromisso Flexível**

Os **Savings Plans** são uma alternativa mais nova e mais flexível às Reserved Instances. Em vez de se comprometer com um tipo de instância específico, você se compromete com um *valor específico de gasto horário* (em dólares).

**Compute Savings Plans**: Aplicam-se a qualquer instância EC2, independentemente do tipo, tamanho, região ou OS. Mais flexível. Até 66% de desconto.

**EC2 Instance Savings Plans**: Aplicam-se a uma família de instância específica em uma região (por exemplo, "instâncias c6g em us-west-2"). Mais restritivo do que o Compute, mas até 72% de desconto (igual ao máximo da RI).

**SageMaker Savings Plans**: Específico para treinamento e inferência de ML do SageMaker.

Para a Nimbus: Compute Savings Plans para seus servidores de API. Eles se comprometeram com US$ 0,45/hora de gasto com computação. Qualquer tipo de instância, qualquer tamanho — e o compromisso também cobre Fargate e Lambda, o que importava para o que viria a seguir. Quando eles escalam a frota ou mudam os tipos de instância, o Savings Plan ainda se aplica.

"Isso é melhor do que Reserved Instances para nós," disse Leo. "Ainda estamos experimentando com tipos de instância. O Compute Savings Plan nos dá o desconto sem nos travar no r6g especificamente."

"O que acontece quando nos comprometemos com US$ 0,45/hora e só usamos US$ 0,36 em alguns meses?" perguntou Maya.

"Você paga US$ 0,45 de qualquer jeito," disse Tom. "O compromisso é incondicional. O Savings Plan se aplica a qualquer uso que você tenha até o valor comprometido. Qualquer coisa acima disso roda em tarifas On-Demand. A disciplina está em definir o compromisso em um nível que você tenha confiança de sempre alcançar."

"E não devemos nos comprometer com a nossa média — devemos nos comprometer com o nosso piso," disse Priya.

"Exatamente. Olhe os últimos seis meses. Encontre a semana mais baixa. Comprometa-se com 90% desse número. Depois revise trimestralmente conforme crescemos."

"Já pensamos no que acontece se nos comprometermos demais?" continuou Priya. "Compramos um plano de US$ 2/hora, aí no trimestre seguinte otimizamos e nosso uso de computação cai para US$ 1,50?"

"A diferença de US$ 0,50/hora vira desperdício," disse Tom. "Estamos pagando por capacidade que não existe mais. Esse é o risco de definir o compromisso alto demais. A revisão trimestral existe exatamente para pegar isso — se nosso uso caiu abaixo do compromisso, sabemos que a próxima compra deve ser menor. Uma nuance importante: um Savings Plan *Compute* te acompanha até o Fargate e o Lambda — migrar cargas de trabalho EC2 para contêineres não o deixaria ocioso. O que deixa o compromisso ocioso é genuinamente usar menos computação, ou manter um *EC2 Instance* Savings Plan ou RI para uma família de instância que você parou de usar."

Você pode estar se perguntando: por que não simplesmente comprar sempre Savings Plans no valor máximo que se pode pagar e deixar a AWS resolver? A resposta é que o compromisso é um piso, não um teto. Se você se compromete com US$ 5/hora mas só usa US$ 3/hora, paga US$ 5/hora. Cada dólar de gasto comprometido que não corresponde ao uso real é um dólar desperdiçado. A revisão trimestral não é opcional — é o que mantém o Savings Plan uma otimização em vez de um excesso de compromisso.

**Spot Instances: O Desconto de 90%**

As **Spot Instances** usam a capacidade EC2 reserva da AWS. Quando a AWS tem servidores não utilizados, você pode alugá-los com 60-90% abaixo do preço On-Demand. Quando a AWS precisa da capacidade de volta (para clientes On-Demand ou Reserved), ela dá um aviso de 2 minutos e encerra sua instância.

Você pode estar se perguntando: quem projetaria um sistema em torno de instâncias que podem sumir com dois minutos de aviso? A resposta é: qualquer um cujo trabalho possa ser reiniciado do zero. Trabalhos em lote, análise, pipelines de renderização — nenhum deles exige que a instância específica que iniciou o trabalho seja a que o termina. O aviso de 2 minutos é suficiente para salvar um checkpoint, drenar conexões e sair de forma limpa.

O risco de interrupção é a característica definidora. As Spot Instances são adequadas apenas para:

- **Cargas de trabalho tolerantes a falhas**: Se uma instância for encerrada no meio de uma tarefa, a tarefa pode reiniciar sem corromper nada
- **Processamento stateless**: Redimensionamento de imagens, codificação de vídeo, análise em lote, treinamento de ML
- **Trabalhos em lote de curta duração**: O aviso de 2 minutos é suficiente para salvar o estado e criar checkpoints
- **Frotas mistas com Auto Scaling**: Use Spot para a maioria do seu ASG com On-Demand como linha de base

Para a Nimbus: As Spot Instances faziam sentido para os trabalhos de análise em lote executados todas as noites (processando os dados de pedidos do dia em relatórios agregados). Se uma Spot Instance for encerrada no meio do trabalho, o trabalho falha, mas reinicia do início em uma nova instância. Os dados no S3 estão seguros.

Mas Leo descobriu isso da forma difícil antes de a equipe entender completamente o padrão.

Três meses antes, ele havia movido o trabalho em lote noturno para Spot sem incorporar lógica de checkpoint. Na primeira noite, a Spot Instance rodou bem. Na segunda noite, ela foi interrompida às 4h47 — quarenta e sete minutos dentro de um trabalho que levava uma hora e vinte minutos para concluir. O trabalho falhou. O relatório final dos pedidos do dia anterior estava faltando quando os parceiros restaurantes fizeram login naquela manhã.

"Eu já tinha implantado — ah," dissera Leo, olhando para a notificação de trabalho falhado. "Achei que ia ficar tudo bem. Ficou bem na primeira noite."

"O que aconteceu?" perguntara Maya.

"Interrupção de Spot. A AWS precisou da capacidade de volta, nos deu dois minutos, a instância foi encerrada. O trabalho não tinha checkpoint. Quando uma nova Spot Instance foi lançada às 5h para tentar de novo, começou do zero. Terminou às 6h40. Os relatórios saíram duas horas atrasados."

A correção foi direta: gravar resultados intermediários no S3 a cada quinze minutos. Cada checkpoint era um estado parcial completo — suficiente para uma nova instância ler o último checkpoint e continuar daquele ponto em vez de reiniciar do início.

"Usar Spot para o trabalho noturno reduziu seu custo de US$ 12/noite para US$ 2/noite," relatou Leo, depois que a correção foi aplicada. "Mesmo com a noite ruim, o custo total de rodá-lo por três meses foi menor do que duas semanas de preço On-Demand."

"Vai ficar tudo bem," acrescentou Leo, "mesmo se for interrompido no meio da execução — certo?"

"Com o checkpoint implementado, sim," disse Tom. "Sem ele, não. A tolerância a interrupções tem que ser construída no trabalho, não presumida."

"E se alguém tentar invadir?" perguntou Priya. "A Spot Instance está em hardware compartilhado. Se for interrompida e uma nova for lançada, há alguma exposição de dados entre instâncias?"

"Não," disse Tom. "A AWS apaga o armazenamento da instância no encerramento. O próximo cliente que pegar aquele hardware vê uma lousa limpa. Mas é um bom instinto — sempre que você estiver usando capacidade compartilhada, vale a pena verificar o modelo de isolamento."

**Diversificação de Spot Fleet**

Leo aprendera mais uma coisa com o trabalho em lote interrompido: quando você solicita um único tipo de Spot Instance, está apostando na disponibilidade daquele tipo específico naquela AZ. Se a capacidade Spot para c5.2xlarge em us-west-2a estiver esgotada, seu trabalho espera — ou falha.

O **Spot Fleet** resolve isso permitindo que você especifique múltiplos tipos de instância e AZs em uma única solicitação. A AWS atende a frota a partir de qualquer combinação que tenha capacidade disponível ao menor preço.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Com uma frota diversificada, uma interrupção em um tipo de instância ou AZ afeta apenas uma parte da frota. O restante continua rodando. Para o trabalho em lote da Nimbus, rodar um Spot Fleet de quatro instâncias em vez de uma única instância grande significava que mesmo uma interrupção parcial permitia que o trabalho terminasse — mais devagar, mas sem o reinício completo.

"A frota diversificada também tende a obter melhores preços," disse Tom. "A AWS te dá o menor preço entre todos os tipos da sua frota. Em algumas noites você está pegando c5a a um preço menor que o c5 porque a capacidade simplesmente estava ali."

"Quanto isso custa por mês comparado a apenas usar um único tipo de instância?" Tom perguntou a si mesmo em voz alta — o hábito já era completamente reflexo agora. Ele rodou o número. O Spot Fleet com preços mistos teve média de US$ 1,80/noite contra US$ 2,00/noite com uma solicitação de tipo único. Diferença pequena em termos absolutos, mas só a melhoria na confiabilidade já justificava a mudança.

"E se alguém tentar invadir o Spot Fleet?" perguntou Priya.

"Mesma resposta de sempre," disse Tom. "Cada instância está isolada das outras. A Fleet não as coloca em um segmento privado compartilhado automaticamente. Seus security groups ainda se aplicam a cada instância individualmente."

O checkpoint havia tornado as interrupções gerenciáveis, não eliminadas. O trabalho ainda reiniciava do último checkpoint, e se o reinício coincidisse com um período de picos de preço Spot, a instância de substituição poderia levar de 10 a 20 minutos para ficar disponível. O trabalho já coberto pelo último checkpoint era pulado no reinício; o trabalho desde então era refeito. Sobrecarga total de retrabalho: pequena, mas real.

O Spot Fleet resolveu o problema de disponibilidade de forma limpa. Ao especificar cinco tipos de instância em três AZs, Leo reduziu a probabilidade de uma lacuna completa de capacidade para quase zero. A estratégia de alocação da AWS — diversificada — distribuía a frota de quatro instâncias pelos pools, de modo que a interrupção de nenhum pool isolado pudesse parar o trabalho. Quando uma instância era interrompida, as três restantes continuavam processando, e o checkpoint significava que a instância de substituição pegava apenas o trabalho que a instância interrompida estava no meio de processar. De ponta a ponta, o trabalho nunca mais perdeu seu prazo de relatório das 7h.

"Quanto a diversificação custou em complexidade?" perguntou Maya, quando Leo documentou isso.

"Três linhas extras na solicitação do Spot Fleet," disse Leo. "O código de processamento não sabe nem se importa com qual tipo de instância está rodando. A complexidade vive inteiramente na configuração da frota, não na aplicação."

Essa era a vantagem de projetar a aplicação para ser stateless desde o início: decisões de escalonamento e tolerância a falhas se tornavam decisões de infraestrutura, não decisões de código.


**Dedicated Hosts: A Opção de Conformidade**

Algumas licenças de software (Oracle, Windows Server em algumas configurações) são precificadas por soquete físico ou núcleo. Quando você executa esse software em um host compartilhado (o padrão para EC2), pode estar pagando por capacidade que não está usando.

Os **Dedicated Hosts** oferecem acesso a um servidor físico exclusivamente para seu uso. Você pode trazer suas licenças existentes por soquete. Nenhuma instância de outro cliente AWS é executada no mesmo hardware.

Os Dedicated Hosts são significativamente mais caros do que o EC2 padrão. São uma ferramenta de conformidade e licenciamento, não uma ferramenta de otimização de custos.

A Nimbus não tinha requisitos de licenciamento que necessitassem de Dedicated Hosts. A maioria das aplicações cloud-native não tem.

**Variação: Quando o Compromisso Sai Pela Culatra**

Se sua carga de trabalho é previsível e estável por 12 meses, as Reserved Instances entregam o desconto máximo — mas se suas necessidades de tipo de instância podem mudar significativamente durante esse período, esse travamento vai te custar uma flexibilidade que vale mais do que a diferença de preço. As RIs Convertíveis resolvem parte disso, mas com desconto reduzido. Os Compute Savings Plans resolvem a maior parte, com um desconto máximo ligeiramente menor do que as Standard RIs.

Se você usa Spot Instances para trabalhos em lote tolerantes a falhas, pode alcançar 60-90% de economia — mas se as mesmas instâncias atendem requisições de usuários ao vivo, uma interrupção no meio da requisição significa transações falhas e clientes insatisfeitos. A tolerância da carga de trabalho à interrupção é a variável decisiva.

Há um caso de escolha errada mais sutil: comprometer-se demais com um Savings Plan. Se você compra um Compute Savings Plan de US$ 3,00/hora porque seu uso de computação teve média de US$ 3,00/hora no último trimestre, e então otimiza seus serviços neste trimestre (reduzindo o uso total para US$ 1,80/hora), você paga os US$ 3,00/hora comprometidos de qualquer jeito. A diferença de US$ 1,20/hora é desperdício. (Observe que mover cargas de trabalho EC2 para Fargate ou Lambda *não* deixaria um Compute Savings Plan ocioso — ele cobre os três. Os riscos de ociosidade são a redução real de uso, ou o travamento de família com EC2 Instance Savings Plans e RIs.) É por isso que a estratégia do piso importa: comprometa-se com seu mínimo, não com sua média. E revise trimestralmente.

A regra: comprometa-se com aquilo de que você tem certeza. Use On-Demand para aquilo de que não tem. Use Spot apenas para aquilo que pode sobreviver a uma parada brusca.

**Construindo uma Frota Mista**

A abordagem madura: use múltiplos modelos de preços juntos.

Para a frota de API da Nimbus:

- **Carga de base (4 instâncias, sempre rodando)**: Coberta pelo compromisso do Savings Plan
- **Pico previsível (2 instâncias adicionais durante o horário comercial)**: Coberta pelo Savings Plan se o compromisso as cobrir, caso contrário On-Demand
- **Overflow de pico de tráfego**: Spot Instances (aceitável porque os servidores de API são stateless — as requisições são redistribuídas se uma instância for encerrada)

O resultado: uma frota que otimiza o custo em cada camada — preços comprometidos para a parte previsível, On-Demand para crescimento imprevisível, Spot para capacidade de burst.

**Monitorando a Utilização do Savings Plan**

Comprar um Savings Plan não é o fim do trabalho. É o começo de uma obrigação recorrente: saber se o compromisso está sendo aproveitado.

Tom configurou um lembrete no calendário para a primeira segunda-feira de cada trimestre: revisão de utilização do Savings Plan. A ferramenta era o AWS Cost Explorer. Especificamente, a aba "Savings Plans" sob "Reservations and Savings Plans", que mostrava três números com os quais ele se importava:

- **Taxa de utilização**: Que porcentagem do gasto comprometido foi de fato correspondida por uso elegível? Um número abaixo de 100% significava que ele estava pagando por compromisso que não estava sendo usado.
- **Taxa de cobertura**: Que porcentagem do uso elegível do EC2 estava sendo coberta pelo Savings Plan, em vez de rodar em tarifas On-Demand? Um número abaixo de 80% significava que havia uso não coberto que um compromisso maior capturaria.
- **Gasto On-Demand**: A parcela do gasto com EC2 não coberta por nenhum Savings Plan. Se isso estivesse crescendo, ou o Savings Plan estava subdimensionado ou novas cargas de trabalho haviam sido adicionadas fora do escopo do compromisso.

Na primeira revisão trimestral, os números ficaram assim:

- Utilização: 97%. Três por cento do gasto comprometido estava ficando sem correspondência — US$ 9,90 por mês sobre um compromisso de US$ 330/mês. Isso era aceitável; significava que o compromisso estava definido ligeiramente acima do uso de piso real, o que era intencional.
- Cobertura: 84%. Dezesseis por cento do uso elegível do EC2 estava rodando em On-Demand. Essa era a capacidade de burst — as instâncias de overflow que subiam durante picos de tráfego e não eram cobertas pelo compromisso.
- Gasto On-Demand com EC2: US$ 147/mês. As Spot Instances (não cobertas por Savings Plans, precificadas separadamente) respondiam pela maior parte do restante.

"Os 97% de utilização são saudáveis," disse Tom. "Significa que não estamos comprometidos demais. Se fosse 80%, eu saberia que tínhamos comprado em excesso."

"E os 84% de cobertura?" perguntou Maya.

"Isso também está bem. Os 16% que estão em On-Demand são a capacidade de burst — instâncias que rodam por horas durante o pico, não o dia inteiro. Precisaríamos comprar significativamente mais compromisso de Savings Plan para cobri-las, e elas podem não justificar isso." Ele rodou as contas: as instâncias On-Demand não cobertas estavam rodando talvez 40 horas por mês a US$ 0,101/hora por instância. Cobri-las com um Savings Plan exigiria um compromisso que estaríamos subutilizando 90% do tempo. Melhor deixá-las em On-Demand.

Na segunda revisão trimestral, seis meses depois, uma métrica havia mudado: o gasto On-Demand com EC2 havia crescido para US$ 290/mês. O recurso Nimbus Instant havia sido lançado, e várias novas instâncias de serviço em segundo plano haviam sido adicionadas sem que Tom notasse.

"Estas três instâncias," disse Tom, apontando para o detalhamento do Cost Explorer. "Vêm rodando em On-Demand há três meses. Se vão continuar rodando, devemos adicioná-las ao compromisso do Savings Plan."

A revisão trimestral havia pegado isso. Sem a revisão, essas três instâncias teriam continuado em tarifas de balcão indefinidamente.

"Como você ajusta o compromisso?" perguntou Priya.

"Você compra um novo Savings Plan adicional em cima do existente," disse Tom. "Savings Plans empilham. Eu adicionaria um Compute Savings Plan de US$ 0,10/hora para a nova linha de base. O plano existente de US$ 0,45/hora continua até o fim do seu período de três anos. O novo plano inicia seu próprio período de três anos."

"Então teríamos dois Savings Plans sobrepostos."

"Sim. Eles se aplicam independentemente a qualquer uso elegível que exista. A AWS os corresponde em ordem do mais benéfico para o menos benéfico."

"Já pensamos no que acontece se vendermos um desses serviços em segundo plano no ano que vem?" perguntou Priya. "Comprometemo-nos com US$ 0,55/hora por três anos."

"Esse é o risco do período de três anos," disse Tom. "É por isso que o novo compromisso é menor — estou me comprometendo com o piso das novas cargas de trabalho, não com a média. Se desativarmos um serviço e o uso cair, os serviços restantes ainda devem consumir o valor comprometido completo."

A disciplina da revisão trimestral não era glamorosa. Eram quinze minutos no Cost Explorer, três números verificados, uma decisão tomada ou adiada. Mas ao longo de três anos, essa disciplina era a diferença entre um Savings Plan que entregava mais de 90% de utilização — economia genuína — e um que derivava para o desperdício parcial conforme a infraestrutura evoluía ao seu redor.

## Pontos Fortes e Limitações

**On-Demand**: Sem compromisso. Preço integral. Use para cargas de trabalho imprevisíveis ou de curto prazo.

**Reserved Instances**: Até 72% de desconto. Travada em tipo de instância/região/OS específico. Venda capacidade não utilizada no RI Marketplace.

**Savings Plans**: Até 66-72% de desconto. Mais flexível do que RIs (Compute Savings Plans se aplicam a qualquer tipo de instância). Aplicação automática ao uso correspondente.

**Spot Instances**: Até 90% de desconto. Risco de interrupção de 2 minutos. Apenas para cargas de trabalho tolerantes a falhas, stateless e interrompíveis.

**Dedicated Hosts**: Servidor físico completo. Mais caro. Necessário para certos cenários de licenciamento ou conformidade.

## Resumo

Tom passou o resto do sábado mapeando cada carga de trabalho da Nimbus para seu modelo de preço ideal — linha de base para Savings Plans, trabalhos em lote noturnos para Spot, overflow imprevisível para On-Demand. O exercício transformou três meses de pagamento da tarifa de balcão em uma estratégia deliberada. Os números, uma vez calculados, eram difíceis de ignorar.

- O preço do EC2 tem quatro modelos: **On-Demand** (preço integral, sem compromisso), **Reserved Instances/Savings Plans** (gasto comprometido para desconto significativo), **Spot** (capacidade reserva com 60-90% de desconto, interrompível), **Dedicated Hosts** (exclusividade do servidor físico).
- Os **Savings Plans** são geralmente preferidos às Reserved Instances pela flexibilidade.
- As **Spot Instances** requerem cargas de trabalho tolerantes a falhas e stateless — apenas para trabalhos em lote, treinamento de ML e processamento interrompível.
- O **checkpoint para armazenamento durável** (S3) é necessário para trabalhos em lote baseados em Spot — trabalhos interrompidos devem retomar do último checkpoint, não reiniciar do zero.
- A **diversificação de Spot Fleet** entre múltiplos tipos de instância e AZs reduz o risco de interrupção e frequentemente gera melhores preços.
- A estratégia ideal é uma **frota mista**: Savings Plans para a linha de base, On-Demand para crescimento imprevisível, Spot para trabalho em lote interrompível.
- Revise os modelos de preços quando as cargas de trabalho estiverem rodando de forma estável por 3+ meses — é quando o On-Demand começa a ser desperdício.
- **Revise os compromissos de Savings Plan trimestralmente** — comprometa-se com seu piso, não com sua média, e ajuste conforme os padrões de uso mudam.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.2)*

- **Savings Plans vs Reserved Instances**: Os Savings Plans são mais flexíveis (se aplicam a qualquer instância EC2 para Compute Savings Plans). As Reserved Instances travam em um tipo de instância específico. Cenários do exame: "precisa de máxima flexibilidade enquanto ainda obtém descontos" → Savings Plans. "Conhece o tipo exato de instância por 3 anos" → Standard RI para desconto máximo.
- **Sinais de Spot**: "sensível a custo," "tolerante a falhas," "processamento em lote," "pode lidar com interrupções," "cargas de trabalho stateless," "treinamento de ML" → Spot.
- **Tratamento de interrupção Spot**: As instâncias Spot recebem um aviso de 2 minutos antes do encerramento. Sua aplicação deve lidar com isso graciosamente (salvar estado, drenar conexões, sair de forma limpa).
- **On-Demand vs Spot para servidores web**: Servidores web que atendem tráfego de usuários ao vivo NÃO devem usar Spot (a interrupção causa falha nas requisições). Use On-Demand ou Savings Plans para a camada web.
- **EC2 Savings Plans vs Compute Savings Plans**: EC2 Savings Plans se aplicam a uma família de instância e região específica (maior desconto). Compute Savings Plans se aplicam a qualquer instância EC2, Lambda e Fargate (menor desconto máximo, mais flexível).
- **RI Marketplace**: As Reserved Instances Standard não utilizadas podem ser vendidas para outros clientes AWS. RIs Convertíveis não podem ser vendidas.
- **Hibernação:** Salva o conteúdo da RAM no volume raiz EBS na parada; restaura-o na inicialização. A instância retoma mais rápido do que uma inicialização a frio, com todos os processos e estado intactos. Use quando o estado da instância deve ser preservado entre sessões. Requer: habilitada no lançamento (não pode ser adicionada a uma instância existente), RAM ≤ 150 GB, volume raiz EBS criptografado, não disponível para instâncias bare-metal; máximo de 60 dias hibernada. Sinal de exame: "retomar instância rapidamente com estado em memória preservado" ou "instância de desenvolvimento leva muito tempo para inicializar" → Hibernação.

## Exercícios

**Exercício 1 — Recordação**

Explique quando as Spot Instances são adequadas e quando não são. Que característica torna uma carga de trabalho adequada para Spot?

*(Dica: Pense no que acontece quando a instância é encerrada com 2 minutos de aviso. Quais cargas de trabalho se recuperam de forma limpa? Quais não se recuperam?)*

**Exercício 2 — Cenário SAA-C03**

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

Compromisso de US$ 0,45/hora. Prazo de três anos. Compute Savings Plans para flexibilidade.

Combinada com o Spot fleet para o lote noturno, a economia estimada: US$ 42.500 ao longo de três anos — pouco mais de US$ 14.000 por ano.

Maya leu o número. "Quarenta e dois mil dólares."

"Em comparação com rodar tudo em On-Demand, ao longo de três anos."

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
