# Capítulo 30: O Custo Oculto

Tom tinha um quadro branco na sala de reunião com três colunas: computação, armazenamento, rede. As duas primeiras estavam preenchidas — números, datas, nomes de otimizações concluídas. Ele ficou parado diante do quadro por um momento antes de escrever qualquer coisa na terceira coluna. As linhas de rede na conta AWS se espalhavam pela página de um jeito que as outras não. Cada uma tinha um nome diferente, uma unidade diferente, uma justificativa diferente para o dinheiro estar saindo.

Ele destampou o marcador.

**Recapitulando: A Última Incógnita na Conta**

A auditoria de banco de dados havia fechado o último grande item da conta em que Tom vinha trabalhando ativamente — US$ 491/mês recuperados, US$ 5.892 por ano. Some os Savings Plans do EC2, as políticas de ciclo de vida S3 e a limpeza de armazenamento, e o total acumulado era de US$ 34.092 em economias anuais ao longo de três meses de trabalho. Mas Tom havia notado, durante o mergulho no banco de dados, que uma categoria mal havia sido examinada. Os custos de armazenamento apareciam como uma linha: "S3: US$ 198." Os custos de computação apareciam como uma linha: "EC2: US$ 2.340" — antes de os descontos do Savings Plan do Capítulo 27 entrarem em vigor. Os custos de rede se espalhavam por uma dúzia de entradas com nomes como "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer" e "CloudFront Data Transfer." Ele nunca os havia somado e olhado para o total. Esse era o trabalho de hoje.

Tom abriu a conta. Encontrou a seção de transferência de dados. Somou todos os itens.

Os custos de rede na AWS são como o sistema de pedágios de uma cidade: entrar na cidade é gratuito, mas cada túnel que você pega na saída custa dinheiro, e dirigir entre os bairros também custa um pouco. A maioria das pessoas não pensa nos pedágios até receber a conta no final do mês e perceber que tem pegado o túnel todos os dias quando havia uma via superficial gratuita o tempo todo. O objetivo deste capítulo é entender cada cabine de pedágio — e decidir quais valem a pena pagar.

US$ 847/mês.

"Estamos gastando US$ 847 por mês em transferência de dados," disse ele.

"Isso é muito?" perguntou Leo.

"É exatamente o que nossa conta do S3 era antes de otimizarmos. E eu nem sabia que tínhamos uma conta de transferência de dados desse tamanho."

Maya olhou por cima. "O que exatamente é transferência de dados?"

"É o que a AWS cobra por mover bytes. Bytes entrando na AWS: geralmente gratuito. Bytes saindo da AWS para a internet: cobrado. Bytes entre serviços em regiões diferentes: cobrado. Bytes passando por um NAT Gateway: cobrado."

"Você pode detalhar?"

Tom podia. Mas dessa vez ele não parou no console de cobrança. Ele habilitou os VPC Flow Logs em todas as suas VPCs e os alimentou no CloudWatch Logs Insights. Isso lhe permitiu consultar os fluxos de tráfego reais — não apenas valores em dólar, mas quais origens estavam enviando dados para onde, e quanto.

A consulta levou dois minutos para rodar. Combinada com mais uma fonte de logs que ele puxaria logo em seguida, a saída era específica o suficiente para agir.

**Análise de Tráfego: O Que Está de Fato Gerando a Conta**

Os cinco principais fluxos de tráfego por volume, em ordem:

1. Servidores de aplicação EC2 → NAT Gateway → serviços AWS (SSM, Secrets Manager, CloudWatch, SQS): 3,9TB/mês
2. Servidores de aplicação EC2 → NAT Gateway → APIs externas: 1,3TB/mês
3. Endpoint de leitor do Aurora → servidores de aplicação EC2 (entre AZs): 0,4TB/mês
4. Pipeline de análise → bucket S3 em us-east-1 (entre regiões): 0,3TB/mês
5. CloudFront → origem S3 (cache misses): 0,2TB/mês

Os quatro primeiros vieram direto dos Flow Logs. O quinto não poderia ter vindo: os VPC Flow Logs só veem tráfego que cruza interfaces de rede dentro das suas VPCs, e um cache miss do CloudFront buscando do S3 nunca toca a VPC — é o CloudFront falando diretamente com o S3. Para esse fluxo, Tom puxou os logs de acesso padrão do CloudFront e filtrou pelo campo `x-edge-result-type`: cada entrada marcada como `Miss` é uma requisição que o CloudFront teve que buscar da origem, e somar os bytes lhe deu os 0,2TB. Uma conta, dois instrumentos — cada um cego para o que o outro vê.

"O fluxo número quatro," disse Priya. "Por que nosso pipeline de análise está falando com um bucket em us-east-1?"

Leo tinha uma expressão no rosto que Tom reconheceu.

"Eu já tinha implantado isso — ah," disse Leo. "Seis meses atrás eu estava testando se nosso pipeline de análise poderia se distribuir para múltiplas regiões em paralelo. Subi um bucket de teste em us-east-1, apontei o pipeline para ele, e rodei por uma semana. O teste terminou mas esqueci de remover o destino us-east-1 da configuração do pipeline."

"Então, por cinco meses," disse Tom, "viemos escrevendo uma cópia de cada resultado de análise em um bucket na Virgínia."

"Quanto isso custa por mês?" perguntou Tom.

Transferência entre regiões de us-west-2 para us-east-1: US$ 0,02/GB. 300GB/mês = US$ 6/mês pela transferência. Mais o armazenamento S3 dos dados duplicados em us-east-1: 300GB × 5 meses × US$ 0,023/GB = US$ 34,50 em dados armazenados.

"Não é enorme," disse Leo.

"Não é enorme por mês," disse Tom. "Mas vem rodando há cinco meses e ninguém sabia. É custo não intencional. A questão não é se US$ 6 importa — é se sabemos por que cada dólar está sendo gasto."

Leo excluiu o bucket de teste de us-east-1 e removeu o destino da configuração do pipeline.

A descoberta mais acionável na saída dos flow logs foi o fluxo número um: servidores de aplicação EC2 chamando serviços AWS através do NAT Gateway.

Tom puxou as entradas de log específicas para a consulta do CloudWatch Logs Insights, filtradas para mostrar apenas tráfego destinado a faixas de IP de serviços AWS:

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

A saída mostrou algo que ele não havia esperado: cerca de 300 GB por mês de tráfego S3 da mesma região — separado do fluxo entre regiões para o bucket us-east-1 de Leo — estava passando pelo NAT Gateway. Mas Tom já havia configurado os S3 Gateway Endpoints meses antes.

"Temos um S3 Gateway Endpoint," disse Leo. "Por que o tráfego S3 ainda está passando pelo NAT?"

Tom olhou a tabela de rotas. O Gateway Endpoint estava configurado — mas apenas para a VPC da aplicação. O pipeline de análise rodava em uma VPC separada que havia sido criada nove meses antes para isolamento de dados. Essa VPC não tinha S3 Gateway Endpoint. Cada chamada S3 das instâncias EC2 do pipeline de análise roteava pelo NAT Gateway daquela VPC.

"0,3TB de tráfego do pipeline de análise × US$ 0,045/GB = US$ 13,50/mês," disse Tom. "Só pelo endpoint faltando na segunda VPC."

"Quanto custaria adicionar o endpoint?" perguntou Leo.

"Zero," disse Tom. "Os S3 Gateway Endpoints são gratuitos. É uma entrada na tabela de rotas."

Adicionar o Gateway Endpoint à VPC de análise levaria quatro minutos e cortaria US$ 13,50 da cobrança mensal do NAT Gateway — um número absoluto pequeno, mas a descoberta era o princípio. Eles haviam adicionado um controle de custos em uma VPC e esquecido de replicá-lo quando criaram a segunda. A consistência exigia processo, não apenas conhecimento.

Tom adicionou ao checklist de implantação: ao criar uma nova VPC, adicione os Gateway Endpoints de S3 e DynamoDB antes de anexar quaisquer cargas de trabalho.

A segunda descoberta específica dos flow logs era mais cara. O tráfego das funções Lambda que rodavam o sistema de notificação de pedidos — acesso S3 para ler arquivos de configuração de restaurantes — estava passando pelo NAT Gateway em vez do endpoint S3. As funções Lambda rodavam dentro da VPC (para acesso ao RDS), e o endpoint S3 da VPC estava configurado apenas para instâncias EC2 na sub-rede de aplicação. As funções Lambda na sub-rede Lambda estavam roteando pelo NAT.

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya. "Temos o endpoint. Por que o Lambda não está usando?"

"Os VPC Gateway Endpoints se aplicam por sub-rede com base nas tabelas de rotas," disse Tom. "As funções Lambda estão em sua própria sub-rede com sua própria tabela de rotas. Essa tabela de rotas não tinha a rota do endpoint. Eu a adicionei para a sub-rede de aplicação. Esqueci da sub-rede Lambda."

Adicionar a rota do endpoint S3 à tabela de rotas da sub-rede Lambda economizaria outros US$ 41/mês em taxas de processamento do NAT Gateway que vinham cobrando por chamadas S3 que deveriam ter sido gratuitas.

A análise dos flow logs havia se pagado. Três horas de tempo de consulta, três descobertas concretas: o endpoint esquecido da VPC de análise (US$ 13,50/mês), a lacuna de roteamento da sub-rede Lambda (US$ 41/mês), e a descoberta grande original que se tornou a base para as decisões de Interface Endpoint. Economia mensal adicional total identificada pela análise dos flow logs: US$ 54,50, além dos US$ 78 dos Interface Endpoints que a análise já havia revelado. Essas duas correções menores foram para o backlog da próxima sprint; a tabela de economias ao final deste capítulo conta apenas o que foi entregue.

"A lição é que os VPC endpoints não são uma configuração única," disse Tom. "Cada nova VPC, cada nova sub-rede, cada novo tipo de carga de trabalho exige a mesma verificação. O padrão para qualquer coisa em uma sub-rede privada é rotear pelo NAT. A verificação é: esta carga de trabalho chama S3, DynamoDB, ou algum dos serviços AWS de alto tráfego? Se sim, ela tem uma rota de endpoint?"

"Já pensamos em automatizar essa verificação?" perguntou Priya. "Uma regra do AWS Config que alerta quando uma sub-rede privada é criada sem uma rota de endpoint S3?"

"Está na lista," disse Tom. "Logo depois do alerta de volume órfão."


E com isso, Tom tinha sua resposta para a pergunta que havia iniciado a análise. Os custos de rede não eram um único problema. Eram cinco problemas diferentes, cada um com uma solução diferente.

**Como a AWS Cobra pela Transferência de Dados**

O preço de transferência de dados da AWS é assimétrico:

**Entrando na AWS (inbound)**: Gratuito. Você pode fazer upload de quantos dados quiser.

**Saindo da AWS para a internet (outbound)**: Cobrado. Os primeiros 100GB/mês são gratuitos. Depois disso:

- US$ 0,09/GB pelos primeiros 10TB/mês (regiões dos EUA)
- US$ 0,085/GB pelos próximos 40TB
- Menor em volumes maiores

**Dentro da mesma Zona de Disponibilidade**: Gratuito. Instâncias EC2 se comunicando entre si na mesma AZ não pagam nada.

**Entre Zonas de Disponibilidade (mesma região)**: US$ 0,01/GB em cada direção. Um custo pequeno, mas real.

**Entre Regiões**: US$ 0,02-0,08/GB dependendo das regiões. O tráfego entre regiões é significativamente mais caro.

**NAT Gateway**: US$ 0,045/GB processado. Cada byte que sua instância EC2 privada envia pelo NAT Gateway para alcançar a internet — e cada byte que retorna — é cobrado.

**CloudFront**: Taxas de transferência de dados mais baixas do que AWS para internet direto. US$ 0,085/GB pelos primeiros 10TB (ligeiramente menos do que transferência de dados direta de saída). O CloudFront frequentemente reduz os custos totais de transferência porque seu cache de borda significa que a origem serve dados com menos frequência.

**O Detalhamento de Tom**

"Quanto isso custa por mês?" perguntou Tom, para cada item da conta, um por um. Ele os adicionou a uma aba separada na planilha — não o total mensal, mas cada categoria destrinchada. O total era menos útil do que entender qual parte da conta era qual tipo de custo.

Após categorizar cada item:

**Dados de saída para a internet**: US$ 214/mês

- Respostas da API para clientes globalmente
- Ativos ainda servidos direto do S3 e do ALB para os clientes, ignorando o CloudFront (os próprios preenchimentos de cache — o CloudFront buscando de uma origem AWS — são gratuitos: a AWS isenta a transferência de origem para CloudFront)

**Processamento do NAT Gateway**: US$ 289/mês

- Servidores de aplicação chamando APIs externas (processador de pagamentos, serviço de e-mail, dados de mapas)
- Chamadas DynamoDB passando pelo NAT Gateway (antes de os endpoints VPC serem configurados para algumas tabelas)

**Transferência de dados entre AZs**: US$ 178/mês

- Balanceador de carga para instâncias EC2 (o balanceador de carga está em uma AZ, algumas instâncias em outra)
- Servidor de aplicação para réplica de leitura RDS (em uma AZ diferente)

**Transferência de dados entre regiões**: US$ 166/mês

- Replicação do Aurora Global Database (primário em us-west-2, leitor em us-east-1)
- S3 Cross-Region Replication para backups
- O pipeline de teste esquecido de Leo (US$ 6/mês desse total)

**NAT Gateway: A Maior Surpresa**

US$ 289/mês em taxas de processamento do NAT Gateway era o maior item. E a análise dos VPC Flow Logs o havia tornado específico: o maior consumidor eram os servidores de aplicação chamando APIs de serviços AWS (SSM, Secrets Manager, CloudWatch Logs) através do NAT Gateway.

No Capítulo 11, Tom havia configurado os VPC Gateway Endpoints para S3 e DynamoDB. Esses eram gratuitos. Mas ele havia esquecido de configurar os Interface Endpoints para vários outros serviços:

- Systems Manager (SSM) para gerenciamento de patches
- Secrets Manager para recuperação de credenciais
- CloudWatch para envio de métricas e logs
- SQS para consulta de mensagens

Cada chamada para esses serviços a partir de instâncias EC2 privadas estava passando pelo NAT Gateway. Cada chamada cobrada US$ 0,045/GB.

Você pode estar se perguntando por que a AWS cobra pelo tráfego que passa pelo NAT Gateway quando você já está dentro da rede da AWS. A resposta é que o NAT Gateway em si é um serviço gerenciado — custa dinheiro para rodar, e a AWS repassa esse custo por gigabyte. Os VPC Endpoints eliminam o intermediário, e é por isso que reduzem a conta.

"Espera — mas *por que* faríamos desse jeito?" perguntou Maya, quando Tom mostrou os números. "Configuramos Gateway Endpoints para S3 e DynamoDB. Por que não fizemos o mesmo para SSM e CloudWatch?"

"Os Gateway Endpoints só estão disponíveis para S3 e DynamoDB," disse Tom. "Para todo o resto — SSM, Secrets Manager, SQS — você precisa de Interface Endpoints. Eles não são gratuitos, mas são mais baratos do que rotear pelo NAT no volume que estamos gerando."

**Interface Endpoints** para esses serviços: US$ 0,01/hora por AZ + US$ 0,01/GB de dados processados.

No volume da Nimbus, o Interface Endpoint do SSM custaria cerca de US$ 25/mês (cobranças horárias mais o processamento por GB) e economizaria cerca de US$ 45/mês em cobranças do NAT Gateway (porque o SSM gera volume significativo de dados para gerenciamento de patches e chamadas ao parameter store).

Os custos e economias dos endpoints variavam por serviço e volume. Tom calculou que configurar Interface Endpoints para os quatro serviços de alto tráfego — duas AZs cada, mais o processamento de US$ 0,01/GB sobre os 3,9TB que carregariam — custaria cerca de US$ 97/mês no total e economizaria aproximadamente US$ 176/mês em processamento do NAT Gateway.

Economia líquida: US$ 78/mês apenas com a configuração dos endpoints.

"E se alguém tentar invadir?" disse Priya, quando a conversa sobre VPC endpoints chegou à implementação. "O VPC endpoint significa que o tráfego nunca toca a internet pública — isso não é só custo, é redução da superfície de ameaça. Deveríamos ter feito isso só pelo benefício de segurança."

"Concordo," disse Tom. "As economias de custo são um bônus."

Leo olhou a lista de serviços que vinham roteando pelo NAT. "Posso ter configurado os endpoints de logging do CloudWatch sem verificar se havia um VPC endpoint para isso," disse ele. "Vai ficar bem por agora — mas é, isso vem passando pelo NAT há seis meses."

"Está na lista," disse Tom. "O CloudWatch é um dos quatro que estamos corrigindo."

**O Cálculo do PrivateLink: Quando Faz Sentido**

Há uma versão mais complexa dessa conversa que surge conforme as arquiteturas crescem: usar o AWS PrivateLink para fornecer conectividade privada a serviços hospedados por outros clientes AWS (ou seus próprios serviços em outras VPCs).

Os Interface Endpoints do PrivateLink custam US$ 0,01/hora por AZ mais US$ 0,01/GB. Para um serviço que gera 1TB/mês de tráfego através do endpoint:

- Custo do PrivateLink: US$ 0,01 × 2 AZs × 730 horas + US$ 0,01 × 1.000GB = US$ 14,60 + US$ 10 = US$ 24,60/mês
- Rotear o mesmo tráfego pelo NAT Gateway existente em vez disso: US$ 0,045 × 1.000GB = US$ 45/mês de cobranças incrementais de processamento

A comparação é *incremental*, porque o NAT Gateway permanece de qualquer jeito — ele ainda serve o resto do tráfego destinado à internet, então seu custo horário (US$ 0,045 × 2 × 730 = US$ 65,70) não desaparece quando este serviço migra para um endpoint. Para esse volume de tráfego, o PrivateLink economiza aproximadamente US$ 20/mês. O ponto de equilíbrio é cerca de 420GB/mês — abaixo disso, o custo horário do próprio endpoint supera a economia por GB em relação ao processamento do NAT.

"Espera — mas *por que* usaríamos o PrivateLink em vez de só uma VPN ou peering?" perguntou Maya.

"O VPC Peering é mais simples e gratuito para transferências dentro da região," disse Tom. "Mas o peering cria uma conexão totalmente roteada entre VPCs — qualquer coisa na VPC A pode potencialmente alcançar qualquer coisa na VPC B. O PrivateLink é mais cirúrgico. O endpoint expõe um serviço específico, não uma rota de rede completa. Para arquiteturas conscientes de segurança, essa especificidade importa."

"E se alguém tentar invadir uma VPC com peering?" perguntou Priya. "Peering completo significa que uma instância comprometida em uma VPC tem uma rota para cada instância na VPC com peering."

"Esse é o argumento para o PrivateLink em vez do peering quando você está conectando a um serviço de terceiros ou a um serviço de propriedade de uma equipe separada," disse Tom. "Peering para VPCs confiáveis dentro da empresa. PrivateLink para qualquer coisa em que você queira a conexão de exposição mínima."

**Tráfego Entre AZs: Uma Questão Arquitetural**

Os US$ 178/mês em transferência de dados entre AZs eram mais complicados.

Parte era inevitável: o balanceador de carga distribui o tráfego entre AZs, então algumas requisições se originam em uma AZ e o balanceador as encaminha para uma instância em outra AZ.

Parte era otimizável: a aplicação estava configurada para escrever na primária RDS (em us-west-2a) e ler da réplica de leitura (em us-west-2b). Cada consulta de leitura cruzava os limites da AZ.

Para as leituras, uma solução: configurar a aplicação para preferir uma réplica de leitura na mesma AZ que a instância solicitante. Cada AZ obtém sua própria réplica de leitura. O tráfego permanece local.

Contrapartida: mais réplicas de leitura = mais custo. Se o custo de tráfego entre AZs é US$ 50/mês e uma réplica de leitura adicional custa US$ 190/mês, a otimização local por AZ não vale a pena.

Tom calculou: no volume de consultas atual, o tráfego entre AZs era apenas US$ 31/mês dos US$ 178. Não valia adicionar réplicas para isso.

Os outros custos entre AZs eram roteamento do balanceador de carga e comunicação serviço a serviço — em grande parte inevitáveis no nível de arquitetura atual.

"Este é um dos casos em que entender o custo não significa que você deve corrigi-lo," disse Tom.

"Quanto custaria eliminar completamente o tráfego entre AZs?" perguntou Maya.

"Colocar tudo em uma AZ derrota o propósito do Multi-AZ. Isso seria uma economia de US$ 31/mês ao custo de perder a alta disponibilidade."

"Então deixamos assim," disse ela.

"Deixamos assim."

**S3 Select: Reduzindo a Transferência de Dados em Consultas**

Ao revisar o pipeline de análise, Tom encontrou outra otimização específica de como a equipe de análise estava consultando arquivos S3 grandes.

O padrão: toda manhã, um trabalho de análise baixava um arquivo Parquet de 500MB do S3 para filtrá-lo em memória em busca de dados de pedidos específicos de restaurantes. Cerca de 95% do arquivo era descartado após o download.

O **S3 Select** permite recuperar apenas as linhas e colunas de que você precisa de um objeto S3 (CSV, JSON, Parquet), em vez de baixar o arquivo inteiro para filtrá-lo em sua aplicação.

> **Atualização importante**: em meados de 2024, a AWS parou de oferecer o S3 Select a novos clientes — usuários existentes o mantêm, mas é um beco sem saída para novas arquiteturas. O princípio que esta seção ensina (filtre na camada de armazenamento, não transporte o arquivo inteiro) é atemporal; a ferramenta moderna para isso é o **Amazon Athena** (SQL diretamente sobre o S3, incluindo joins e agregações que o S3 Select nunca teve). O **S3 Object Lambda**, outrora a outra alternativa, seguiu o S3 Select para o status de legado: a partir de 7 de novembro de 2025, ele também está fechado para novos clientes (as cargas de trabalho existentes continuam rodando). Em um exame atual, "consultar dados in place no S3" aponta para o Athena. A história abaixo é preservada porque o *raciocínio* — meça primeiro, mova o filtro para os dados — é a lição.

Sem S3 Select:
```python
# Baixa arquivo de 500MB, processa na memória
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Com S3 Select:
```python
# Deixa o S3 filtrar primeiro, transfere apenas as linhas correspondentes (~2MB em vez de 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

O S3 Select reduz os dados movidos do S3 para sua aplicação. Para arquivos grandes com consultas seletivas, isso pode ser uma redução de 10 a 100 vezes no volume de dados — e, como a instância de análise roda na mesma região que o bucket, o ganho não é uma conta de transferência (a transferência S3-para-EC2 na mesma região é gratuita): é a computação, a memória e o tempo gastos baixando e filtrando dados que você joga fora imediatamente.

Tom levantou isso com a equipe de análise. Eles resistiram inicialmente.

"Já sabemos escrever pandas," disse um analista.

"Isso não é sobre pandas," disse Tom. "É sobre o fato de que vocês estão baixando 500MB para obter 2MB de dados. O download em si é gratuito — mesma região — mas a instância não é. Vocês rodam isso para cada restaurante: 287 restaurantes, 287 consultas, 140GB puxados e filtrados em pandas toda noite. É isso que mantém a máquina de análise ocupada por duas horas — e é por isso que ela é uma xlarge."

"E o S3 Select?"

"O S3 Select cobra US$ 0,002 por GB escaneado e US$ 0,0007 por GB retornado — cerca de um décimo de centavo por consulta. Em troca, a instância recebe 600MB por noite em vez de 140GB, o trabalho termina em minutos, e a máquina pode diminuir um tamanho."

"São US$ 450 por mês," disse o analista, depois de fazer as contas da instância — uma estimativa de guardanapo a partir da tarifa horária da instância e das horas que ela passava processando.

"É por isso que estou aqui," disse Tom. O número real acabaria sendo menor — quando Tom mais tarde puxou o gasto real de computação atribuível ao trabalho noturno, deu US$ 202/mês, não US$ 450. As contas de guardanapo encontram o problema; a medição o dimensiona.

Tom levantou isso com Leo primeiro, antes de trazer a equipe de análise para a conversa. Ele sabia que Leo resistiria, e queria entender a resistência antes que ela virasse um debate no nível da sala.

"O S3 Select economizaria US$ 180/mês nas consultas do pipeline de análise," disse Tom.

"Isso exige reescrever cada consulta," disse Leo.

"Exige mudar o padrão de acesso aos dados de 'baixar e filtrar' para 'consultar via API do S3 Select.'"

"Que é uma reescrita."

"É uma mudança nas chamadas da biblioteca cliente," disse Tom. "A lógica da consulta — as expressões de filtragem — permanece a mesma. O que muda é onde a filtragem acontece. Atualmente: EC2. Com o S3 Select: S3."

"Eu li a documentação do S3 Select," disse Leo. "Você não pode fazer joins. Não pode fazer agregações mais complexas do que SUM e COUNT básicos. Algumas das nossas consultas de análise são mais sofisticadas do que isso."

"Eu sei," disse Tom. "É por isso que não estou propondo o S3 Select para todas as consultas. Estou propondo para as consultas diárias de resumo específicas de restaurantes. É o arquivo Parquet de 500MB filtrado por restaurant_id, puxando duas colunas. Essa consulta é um filtro-e-projeção puro. O S3 Select é exatamente a ferramenta certa para esse caso."

Leo ficou quieto por um momento. Ele abriu a consulta em questão.

```python
# Atual: baixa 500MB, filtra na memória
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

"A versão com S3 Select seria o quê — a chamada select_object_content?"

"Sim," disse Tom. "Você substituiria a chamada read_parquet por uma chamada select_object_content que empurra a cláusula WHERE para o S3. O resultado volta já filtrado. Você recebe um stream de registros correspondentes em vez do arquivo Parquet inteiro."

"E eu teria que lidar com a resposta de forma diferente."

"O formato da resposta é CSV por padrão. Você precisaria de um pequeno wrapper para fazer o parse de volta para um DataFrame, ou usa o formato de saída Parquet se quiser manter a lógica de parsing atual."

Leo olhou para aquilo. "Quanto trabalho é isso?"

"Meio dia," disse Tom. "Talvez um dia se você quiser testar bem em todos os 287 IDs de restaurantes no lote noturno."

"Por US$ 180/mês."

"US$ 2.160 por ano," disse Tom. "E a abordagem escala. Com 2.000 restaurantes, a mesma consulta no mesmo tamanho de arquivo custa ainda mais sem o S3 Select. Você está investindo um dia hoje para evitar um problema muito maior depois."

Leo fechou o notebook. "As consultas em que o S3 Select não funciona — as consultas de agregação, as comparações entre restaurantes — essas ficam como estão?"

"Essas ficam como estão," confirmou Tom. "Não estou tentando reescrever o pipeline de análise. Estou tentando parar de baixar 500 MB para usar 2 MB dele."

"Ok," disse Leo. "Vou fazer essa semana."

E fez. A implementação levou seis horas. Ele encapsulou a chamada do S3 Select em uma função utilitária que correspondia à mesma interface da chamada read_parquet existente — o código que chamava no lote noturno não precisou de nenhuma mudança. Apenas a camada de acesso a dados mudou.

No mês seguinte, a conta de computação noturna do pipeline de análise caiu de US$ 202 para US$ 22 — o trabalho terminava em minutos em vez de horas, em uma instância menor. A economia de US$ 180/mês havia custado seis horas de tempo de engenharia. Anualizado, isso era um retorno de 1.800% sobre o investimento de tempo.

"A parte a que resisti," disse Leo, na revisão mensal, "foi a reescrita. Acabou sendo uma substituição de função, não uma reescrita. Eu estava resolvendo um problema imaginado."

"Isso vale a pena notar," disse Tom. "Quando você está avaliando se deve implementar uma otimização, seja específico sobre o que o trabalho realmente é. 'Exige reescrever consultas' era a versão imaginada. 'Exige mudar a função de acesso a dados' era a versão real."


**"Custo Intencional vs Não Intencional"**

Ao final das três semanas de análise de rede, Tom trouxe o detalhamento completo de volta para a equipe. Ele tinha uma nova coluna em sua planilha: "Intencional?" com um sim ou não para cada item.

"É a lente que estou usando agora," disse ele. "Não apenas 'quanto custa' mas 'nós decidimos gastar isso?'"

"O que é um custo intencional?" perguntou Maya.

"A replicação do Aurora Global Database. Decidimos replicar para us-east-1 porque temos parceiros restaurantes na Costa Leste. São US$ 120/mês em replicação entre regiões — cerca do dobro da estimativa de guardanapo dos dias de planejamento de DR. Escolhemos esse custo por uma razão específica."

"E não intencional?"

"O pipeline de análise de Leo escrevendo em us-east-1 por cinco meses depois que um teste terminou. Ninguém escolheu isso. Estava acontecendo porque ninguém estava observando."

"E as cobranças do NAT Gateway pelas chamadas de serviços AWS?"

"Algo no meio do caminho," disse Tom. "Não decidimos explicitamente rotear o SSM pelo NAT Gateway — esse era o padrão. Não sabíamos que havia uma opção mais barata. Isso é intencional? Fizemos uma escolha, só não sabíamos o que estávamos escolhendo."

"Essa é a categoria mais perigosa," disse Priya. "As decisões que você não sabe que está tomando."

"É por isso que a análise dos VPC Flow Logs importa," disse Tom. "Ela torna o invisível visível. Cada byte que cruza um limite agora tem uma história que podemos rastrear."

"Já pensamos no que acontece se deixarmos isso derivar de novo?" perguntou Priya. "Fizemos uma análise única. Em seis meses, Leo terá criado outro bucket de teste em algum lugar."

"Vou estar bem aqui," disse Leo. "Da próxima vez vou fazer em eu-west-1 para que pelo menos custe mais por GB e vocês percebam mais rápido."

"Revisão mensal dos VPC Flow Logs," disse Tom. "Vou adicionar à revisão trimestral de custos. Se virmos um novo fluxo entre regiões ou um pico no NAT Gateway, rastreamos antes da próxima conta."

**Variação: A Contrapartida Que Você Aceita**

Se você eliminar o tráfego entre AZs rodando tudo em uma única Zona de Disponibilidade, economiza aproximadamente US$ 31/mês no volume atual da Nimbus — mas perde a redundância Multi-AZ que vale muito mais do que isso em risco de incidente. A conversa madura sobre custos nem sempre é sobre encontrar economias; às vezes é sobre entender exatamente pelo que você está pagando e decidir que vale a pena.

A cobrança entre AZs é o preço da resiliência. Alguns custos de rede são compromissos arquiteturais, não ineficiências.

Conexão SAA-C03: o exame frequentemente apresenta cenários em que uma "otimização de custos" eliminaria uma redundância. A resposta correta geralmente é preservar a redundância e otimizar em outro lugar — saiba a diferença entre desperdício e o custo da confiabilidade.

**CloudFront: O Desconto na Transferência de Dados**

Aqui está um fato contra-intuitivo: servir dados pelo CloudFront é geralmente mais barato do que servi-los diretamente do EC2 ou S3.

**EC2 direto para internet**: US$ 0,09/GB
**CloudFront para internet**: US$ 0,085/GB (ligeiramente mais barato)

Mas a economia real não é a taxa por GB — é que o CloudFront armazena dados em cache nos locais de borda. Se 1.000 usuários solicitam a mesma foto de cardápio:

- **Sem CloudFront**: 1.000 requisições saem do S3 diretamente para a internet × tamanho da foto × US$ 0,09/GB
- **Com CloudFront**: os clientes obtêm a foto da borda à taxa do CloudFront (US$ 0,085/GB), e o preenchimento de cache — o CloudFront buscando do S3 no 1 miss — é **gratuito** (a AWS isenta a transferência de origem para CloudFront; você paga apenas as requisições GET na origem)

Para a Nimbus com uma taxa de acertos de cache de 83% (do Capítulo 13), 83% das requisições nunca tocaram a origem — menos requisições de origem, menos carga na origem, e cada byte cobrado à taxa de borda em vez da taxa de internet do S3.

"O CloudFront não é apenas um CDN para desempenho," disse Tom. "Também é uma otimização de custo para transferência de dados."

Leo ficou pensativo. "Deveríamos mover toda a entrega de conteúdo estático pelo CloudFront, mesmo para ativos que não são sensíveis à latência."

"Correto. Se os usuários estão baixando da AWS, deve passar pelo CloudFront."

**A Otimização Completa de Rede**

Após três semanas de análise e implementação:

| Item de Custo                                      | Antes    | Depois   | Economia Mensal |
|----------------------------------------------------|----------|----------|-----------------|
| NAT Gateway (Interface Endpoints)                  | US$ 289  | US$ 211  | US$ 78          |
| Otimização CloudFront (mover mais ativos)          | US$ 214  | US$ 147  | US$ 67          |
| Tráfego entre AZs (aceito como está)               | US$ 178  | US$ 178  | US$ 0           |
| Tráfego entre regiões (bucket de teste de Leo)     | US$ 166  | US$ 160  | US$ 6           |
| **Total**                                          | **US$ 847** | **US$ 696** | **US$ 151/mês** |

US$ 151/mês, US$ 1.812/ano em economias de rede. Modesto comparado a computação e armazenamento, mas significativo.

Mais importante: Tom agora entendia cada linha da conta de rede. Podia explicar cada custo e havia conscientemente decidido quais otimizar e quais aceitar. A distinção entre custo intencional e não intencional agora era explícita e documentada.

## Pontos Fortes e Limitações

**Custos do NAT Gateway**:

- Grandes volumes de dados pelo NAT Gateway se acumulam rapidamente
- Os VPC Endpoints eliminam alguns custos do NAT completamente
- Revise quais serviços suas instâncias privadas chamam e se os endpoints estão disponíveis

**CloudFront para custo**:

- A taxa de acertos do cache determina diretamente a economia de custos
- Alta taxa de acertos de cache = menos requisições de origem e menos carga na origem, além de mais bytes cobrados à taxa mais barata do lado do espectador do CloudFront (a transferência de origem para CloudFront a partir de origens AWS não é cobrada de forma alguma)
- Mova toda a entrega de ativos estáticos pelo CloudFront

**Contrapartidas entre AZs**:

- Eliminar o tráfego entre AZs geralmente requer mudanças arquiteturais que custam mais do que a economia
- Calcule cuidadosamente antes de otimizar

**S3 Select** (legado — indisponível para novos clientes desde 2024; use o Athena. O S3 Object Lambda também é legado agora — fechado para novos clientes a partir de novembro de 2025, cargas de trabalho existentes não afetadas):

- O princípio se mantém: filtre na camada de armazenamento em vez de baixar objetos S3 grandes — as economias aparecem no tempo de computação, no tamanho da instância e na duração do trabalho (a transferência S3 na mesma região já é gratuita)
- Não ajuda quando você precisa do arquivo inteiro

## Resumo

Tom encerrou a análise de rede com um número no quadro branco e um entendimento mais claro do que a última incógnita na conta realmente era. Os US$ 847/mês em custos de rede não haviam sido um mistério de incompetência — eram o custo esperado de um sistema distribuído que abrangia zonas de disponibilidade, servia usuários globais e replicava dados entre regiões. A maior parte valia a pena pagar. Parte não valia. O avanço fundamental foi conseguir distinguir uma da outra.

- A AWS cobra por **dados de saída** (internet: ~US$ 0,09/GB), **tráfego entre AZs** (US$ 0,01/GB em cada direção), **tráfego entre regiões** (US$ 0,02-0,08/GB) e **processamento do NAT Gateway** (US$ 0,045/GB).
- **Dados de entrada** são gratuitos. **Tráfego na mesma AZ** é gratuito.
- Os **VPC Flow Logs** revelam quais fluxos de tráfego específicos dentro das suas VPCs estão gerando cada categoria de custo — essencial para otimização direcionada. Fluxos que nunca cruzam uma interface de rede da VPC (como o CloudFront buscando de uma origem S3) precisam de seus próprios instrumentos: logs padrão do CloudFront ou logs de acesso ao servidor S3.
- **VPC Gateway Endpoints** (S3, DynamoDB): Gratuito. Elimina os custos do NAT Gateway para esses serviços.
- **VPC Interface Endpoints**: Cobrado por hora mais por GB. Mais barato do que o NAT Gateway para serviços de alto volume.
- O **CloudFront** serve dados a taxas mais baixas do que EC2 para internet direta e reduz drasticamente o volume de transferência de origem por meio do cache.
- A pergunta crítica não é apenas "quanto" mas "este custo é intencional?" Custos não intencionais — pipelines de teste esquecidos, roteamento padrão pelo NAT — são onde as economias reais se escondem.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.4)*

- **NAT Gateway vs VPC Endpoints**: Cenário do exame: "EC2 em sub-rede privada chama S3/DynamoDB com frequência — como reduzir os custos do NAT Gateway?" → VPC Gateway Endpoints (gratuitos para S3 e DynamoDB).
- **Regras de preços de transferência de dados**:
  - Entrando na AWS: gratuito
  - Mesma AZ: gratuito
  - Entre AZs: cobrado
  - Entre regiões: cobrado (taxa mais alta)
  - Internet: cobrado (taxa significativa)
- **CloudFront como otimização de custo**: "Reduzir os custos de transferência de dados para entrega de conteúdo global" → CloudFront. A camada de cache reduz as requisições de origem.
- **S3 Transfer Acceleration**: Acelera os uploads *para* o S3 usando os locais de borda do CloudFront. Custo mais alto do que o S3 padrão. Use para clientes enviando arquivos grandes de locais geograficamente distantes.
- **Custos de replicação entre regiões**: Replicar dados entre regiões incorre em cobranças de transferência de dados. Para S3 CRR, você paga tanto a taxa de transferência de dados de saída quanto o custo de requisição S3.
- **PrivateLink (VPC Interface Endpoints)**: Fornece conectividade privada para serviços AWS e para serviços hospedados por outros clientes AWS. Mais seguro do que passar pelo NAT, frequentemente mais barato para serviços de alto volume. O ponto de equilíbrio vs processamento do NAT Gateway é aproximadamente 420GB/mês (contando o custo horário por AZ do próprio endpoint, e assumindo que o NAT Gateway permanece para outro tráfego).

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre um VPC Gateway Endpoint e um VPC Interface Endpoint. Para quais serviços AWS cada um está disponível, e qual é o custo de cada um?

*(Dica: Os Gateway Endpoints são gratuitos, mas apenas para S3 e DynamoDB. Os Interface Endpoints custam por hora, mas funcionam para a maioria dos outros serviços AWS.)*

**Exercício 2 — Cenário SAA-C03**

*Cenário*: A aplicação de uma empresa é executada em instâncias EC2 em sub-redes privadas. As instâncias fazem chamadas frequentes à API para o Amazon SQS e o Amazon S3. Atualmente, todo o tráfego sai pelo NAT Gateway. A equipe quer reduzir os custos do NAT Gateway. A segurança dos dados deve ser mantida — nenhum tráfego deve atravessar a internet pública.

Qual abordagem MELHOR atende a esses requisitos com custo mínimo contínuo?

A) Criar um Gateway Endpoint para SQS e um Gateway Endpoint para S3  
B) Criar Interface Endpoints para SQS e S3  
C) Criar um Interface Endpoint para SQS e um Gateway Endpoint para S3  
D) Remover o NAT Gateway e usar o internet gateway diretamente para chamadas de API

**Dica 1**: Os Gateway Endpoints estão disponíveis apenas para S3 e DynamoDB.

**Dica 2**: Os Interface Endpoints estão disponíveis para SQS e muitos outros serviços (mas custam dinheiro).

**Dica 3**: Um Internet Gateway na tabela de rotas da sub-rede privada a tornaria uma sub-rede pública — violando os requisitos de segurança.

**Resposta**: C

**Explicação**: O S3 usa um Gateway Endpoint (gratuito). O SQS requer um Interface Endpoint (com custo). Essa combinação elimina os custos de processamento de dados do NAT Gateway para ambos os serviços. Todo o tráfego permanece dentro da rede privada da AWS — sem atravessar a internet pública.

**Por que não A?** Os Gateway Endpoints não estão disponíveis para SQS. Apenas S3 e DynamoDB têm Gateway Endpoints.

**Por que não B?** Embora isso funcione, usar um Interface Endpoint para S3 (em vez do Gateway Endpoint gratuito) incorre em cobranças horárias desnecessárias. Sempre use o Gateway Endpoint gratuito para S3 e DynamoDB.

**Por que não D?** Adicionar uma rota para o Internet Gateway a partir da sub-rede privada a torna uma sub-rede pública. As instâncias EC2 em sub-redes privadas normalmente não têm Elastic IPs, então não poderiam realmente rotear por um Internet Gateway sem alterações adicionais — e fazer isso as exporia ao tráfego de entrada da internet.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.4*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

Os usuários da Costa Leste da Nimbus geram tráfego significativo. A aplicação os serve a partir de us-west-2 (Oregon). Atualmente:

- As respostas da API vão diretamente das instâncias EC2 de us-west-2 para os usuários da Costa Leste (~80ms, US$ 0,09/GB)
- As fotos de cardápio vão do S3 us-west-2 pelo CloudFront em Boston (~8ms após o cache)

A equipe está considerando adicionar uma segunda região de aplicação em us-east-1 (Norte da Virgínia) para os usuários da Costa Leste reduzirem a latência da API.

Analise os custos de transferência de dados dessa mudança. Quais novos custos de transferência de dados entre regiões a configuração de dual-region incorreria? O roteamento por latência do Route 53 reduziria ou aumentaria os custos totais de transferência? Sob quais condições (volume de tráfego, sensibilidade à latência) a configuração dual-region valeria a pena?

*(Não há uma única resposta correta. O objetivo é praticar a análise custo-benefício de múltiplas regiões.)*

## Cena Pós-Créditos

Tom fechou a análise de rede.

Impacto total do projeto de otimização de três meses:

- EC2 Savings Plans: -US$ 14.200/ano
- Políticas de ciclo de vida S3: -US$ 7.800/ano
- Armazenamento (S3 + EBS): -US$ 6.200/ano
- Camada de banco de dados: -US$ 5.892/ano
- Rede: -US$ 1.812/ano
- **Total: -US$ 35.904/ano**

Ele escreveu no quadro branco da sala de reunião.

Leo encarou o número. "Trinta e cinco mil."

"E troco," disse Tom.

"Por ano."

"Por ano."

Priya fez as contas. "São US$ 2.992 por mês que estávamos gastando em coisas que não criavam valor."

"Nem tudo," corrigiu Tom. "Algumas eram coisas das quais obtínhamos valor, mas pagávamos demais. Os Savings Plans — estávamos obtendo exatamente a mesma capacidade EC2, apenas a um preço melhor."

Maya ficou parada diante do quadro por um longo tempo.

"Quando começamos a Nimbus," disse ela, "cada dólar contava. Mal podíamos pagar a primeira instância EC2."

"Sim," disse Tom.

"E em algum momento no caminho, paramos de acompanhar os dólares com o mesmo cuidado."

"O crescimento faz isso," disse Priya. "O foco muda para construir, não para otimizar."

"Ambos importam," disse Maya. "Ambos, sempre. Adicione isso à wiki. E agende uma revisão trimestral de custos."

Tom já estava abrindo o calendário.

Nos próximos capítulos: afastamos o zoom dos serviços individuais e começamos a pensar como arquitetos.
