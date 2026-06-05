# Capítulo 30: O Custo Oculto

Os custos de armazenamento aparecem como uma linha: "S3: US$ 198." Os custos de computação aparecem como uma linha: "EC2: US$ 2.340." Os custos de rede se espalhram por uma dúzia de itens com nomes como "Data Transfer Out," "NAT Gateway Processing," "VPC Peering Data Transfer" e "CloudFront Data Transfer." A maioria dos engenheiros os soma uma vez, pisca, e os soma de novo.

Tom havia dito: "Os custos de rede. Esse é o próximo."

Ele abriu a conta. Encontrou a seção de transferência de dados. Somou todos os itens.

Os custos de rede na AWS são como o sistema de pedágios de uma cidade: entrar na cidade é gratuito, mas cada túnel que você pega na saída custa dinheiro, e dirigir entre os bairros também custa um pouco. A maioria das pessoas não pensa nos pedágios até receber a conta no final do mês e perceber que tem usado o túnel todos os dias quando havia uma via superficial gratuita o tempo todo. O objetivo deste capítulo é entender cada pedágio — e decidir quais valem pagar.

US$ 847/mês.

"Estamos gastando US$ 847 por mês em transferência de dados," disse ele.

"Isso é muito?" perguntou Leo.

"É mais do que nossa conta do S3 antes de otimizarmos. E eu nem sabia que tínhamos uma conta de transferência de dados desse tamanho."

Maya olhou por cima. "O que exatamente é transferência de dados?"

"É o que a AWS cobra por mover bytes. Bytes entrando na AWS: geralmente gratuito. Bytes saindo da AWS para a internet: cobrado. Bytes entre serviços em regiões diferentes: cobrado. Bytes passando por um NAT Gateway: cobrado."

"Você pode detalhar?"

Tom podia. E o que ele encontrou mudou a forma como a equipe pensava sobre sua arquitetura.

**Como a AWS Cobra pela Transferência de Dados**

O preço de transferência de dados da AWS é assimétrico:

**Entrando na AWS (inbound)**: Gratuito. Você pode fazer upload de quantos dados quiser.

**Saindo da AWS para a internet (outbound)**: Cobrado. Os primeiros 100 GB/mês são gratuitos. Depois disso:

- US$ 0,09/GB pelos primeiros 10 TB/mês (regiões dos EUA)
- US$ 0,085/GB pelos próximos 40 TB
- Menor em volumes maiores

**Dentro da mesma Zona de Disponibilidade**: Gratuito. Instâncias EC2 se comunicando entre si na mesma AZ não pagam nada.

**Entre Zonas de Disponibilidade (mesma região)**: US$ 0,01/GB em cada direção. Um custo pequeno, mas real.

**Entre Regiões**: US$ 0,02-0,08/GB dependendo das regiões. O tráfego entre regiões é significativamente mais caro.

**NAT Gateway**: US$ 0,045/GB processado. Cada byte que sua instância EC2 privada envia pelo NAT Gateway para alcançar a internet — e cada byte que retorna — é cobrado.

**CloudFront**: Taxas de transferência de dados mais baixas do que AWS para internet direto. US$ 0,085/GB pelos primeiros 10 TB (ligeiramente menos do que transferência de dados direta). O CloudFront frequentemente reduz os custos totais de transferência porque seu cache de borda significa que a origem serve dados com menos frequência.

**O Detalhamento de Tom**

Após categorizar cada item de linha:

**Dados de saída para a internet**: US$ 214/mês

- Respostas da API para clientes globalmente
- Preenchimentos de cache do CloudFront (quando os locais de borda buscam da origem)

**Processamento do NAT Gateway**: US$ 289/mês

- Servidores de aplicação chamando APIs externas (processador de pagamentos, serviço de e-mail, dados de mapas)
- Chamadas DynamoDB passando pelo NAT Gateway (antes de os endpoints VPC serem configurados para algumas tabelas)

**Transferência de dados entre AZs**: US$ 178/mês

- Balanceador de carga para instâncias EC2 (o balanceador de carga está em uma AZ, algumas instâncias em outra)
- Servidor de aplicação para réplica de leitura RDS (em uma AZ diferente)

**Transferência de dados entre regiões**: US$ 166/mês

- Replicação do Aurora Global Database (primário em us-east-1, leitor em us-west-2)
- S3 Cross-Region Replication para backups

**NAT Gateway: A Maior Surpresa**

US$ 289/mês em taxas de processamento do NAT Gateway era o maior item. E era parcialmente desnecessário.

No Capítulo 11, Tom havia configurado os VPC Gateway Endpoints para S3 e DynamoDB. Esses eram gratuitos. Mas ele havia esquecido de configurar os Interface Endpoints para vários outros serviços:

- Systems Manager (SSM) para gerenciamento de patches
- Secrets Manager para recuperação de credenciais
- CloudWatch para envio de métricas e logs
- SQS para consulta de mensagens

Cada chamada para esses serviços a partir de instâncias EC2 privadas estava passando pelo NAT Gateway. Cada chamada cobrada US$ 0,045/GB.

**Interface Endpoints** para esses serviços: US$ 0,01/hora por AZ + US$ 0,01/GB de dados processados.

No volume da Nimbus, o Interface Endpoint do SSM custaria cerca de US$ 15/mês e economizaria cerca de US$ 43/mês em cobranças do NAT Gateway (porque o SSM gera volume significativo de dados para gerenciamento de patches e chamadas ao parameter store).

Os custos e economias dos endpoints variavam por serviço e volume. Tom calculou que configurar Interface Endpoints para os quatro serviços de alto tráfego custaria US$ 62/mês no total e economizaria aproximadamente US$ 140/mês em processamento do NAT Gateway.

Economia líquida: US$ 78/mês apenas com a configuração dos endpoints.

**Tráfego Entre AZs: Uma Questão Arquitetural**

Os US$ 178/mês em transferência de dados entre AZs eram mais complicados.

Parte era inevitável: o balanceador de carga distribui o tráfego entre AZs, então algumas requisições se originam em uma AZ e o balanceador as encaminha para uma instância em outra AZ.

Parte era otimizável: a aplicação estava configurada para escrever na réplica primária RDS (em us-east-1a) e ler da réplica de leitura (em us-east-1b). Cada consulta de leitura cruzava os limites da AZ.

Para as leituras, uma solução: configurar a aplicação para preferir uma réplica de leitura na mesma AZ que a instância solicitante. Cada AZ obtém sua própria réplica de leitura. O tráfego permanece local.

Contrapartida: mais réplicas de leitura = mais custo. Se o custo de tráfego entre AZs é US$ 50/mês e uma réplica de leitura adicional custa US$ 190/mês, a otimização local por AZ não vale a pena.

Tom calculou: no volume de consultas atual, o tráfego entre AZs era apenas US$ 31/mês dos US$ 178. Não valia adicionar réplicas para isso.

Os outros custos entre AZs eram roteamento do balanceador de carga e comunicação serviço a serviço — em grande parte inevitáveis no nível de arquitetura atual.

"Este é um dos casos em que entender o custo não significa que você deve corrigi-lo," disse Tom.

"Quanto custaria eliminar completamente o tráfego entre AZs?" perguntou Maya.

"Colocar tudo em uma AZ derrota o propósito do Multi-AZ. Isso seria uma economia de US$ 31/mês ao custo de perder a alta disponibilidade."

"Então deixamos assim," disse ela.

"Deixamos assim."

Esta é a conversa madura sobre custos: às vezes você paga por algo porque a alternativa custa mais em risco.

**CloudFront: O Desconto na Transferência de Dados**

Aqui está um fato contra-intuitivo: servir dados pelo CloudFront é geralmente mais barato do que servi-los diretamente do EC2 ou S3.

**EC2 direto para internet**: US$ 0,09/GB
**CloudFront para internet**: US$ 0,085/GB (ligeiramente mais barato)

Mas a economia real não é a taxa por GB — é que o CloudFront armazena dados em cache nos locais de borda. Se 1.000 usuários solicitam a mesma foto de cardápio:

- **Sem CloudFront**: 1.000 requisições atingem a origem S3 × tamanho da foto × US$ 0,09/GB
- **Com CloudFront**: 1 requisição atinge o S3 (cache miss) + 999 requisições servidas do cache de borda às taxas do CloudFront

Para a Nimbus com uma taxa de acertos de cache de 83% (do Capítulo 13), eles estavam servindo 83% das requisições do cache de borda. A transferência real de dados da origem era 17% do total de requisições — 83% de seu tráfego "de saída" estava em cache na borda.

"O CloudFront não é apenas um CDN para desempenho," disse Tom. "Também é uma otimização de custo para transferência de dados."

Leo ficou pensativo. "Deveríamos mover toda a entrega de conteúdo estático pelo CloudFront, mesmo para ativos que não são sensíveis à latência."

"Correto. Se os usuários estão baixando da AWS, deve passar pelo CloudFront."

**S3 Select: Reduzindo a Transferência de Dados em Consultas**

Uma otimização sutil: o **S3 Select** permite recuperar apenas as linhas e colunas de que você precisa de um objeto S3 (CSV, JSON, Parquet), em vez de baixar o arquivo inteiro para filtrá-lo em sua aplicação.

Sem S3 Select:
```python
# Baixa arquivo de 500 MB, processa na memória
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Com S3 Select:
```python
# Deixa o S3 filtrar primeiro, transfere apenas as linhas correspondentes (~2 MB em vez de 500 MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

O S3 Select reduz os dados transferidos do S3 para sua aplicação. Para arquivos grandes com consultas seletivas, isso pode ser uma redução de 10 a 100 vezes no volume de dados — e portanto no custo.

**A Otimização Completa de Rede**

Após três semanas de análise e implementação:

| Item de Custo                                      | Antes    | Depois   | Economia Mensal |
|----------------------------------------------------|----------|----------|-----------------|
| NAT Gateway (Interface Endpoints)                  | US$ 289  | US$ 211  | US$ 78          |
| Otimização CloudFront (mover mais ativos)          | US$ 214  | US$ 147  | US$ 67          |
| Tráfego entre AZs (aceito como está)               | US$ 178  | US$ 178  | US$ 0           |
| Tráfego entre regiões (aceito como está)           | US$ 166  | US$ 166  | US$ 0           |
| **Total**                                          | **US$ 847** | **US$ 702** | **US$ 145/mês** |

US$ 145/mês, US$ 1.740/ano em economias de rede. Modesto comparado a computação e armazenamento, mas significativo.

Mais importante: Tom agora entendia cada linha da conta de rede. Podia explicar cada custo e havia conscientemente decidido quais otimizar e quais aceitar.

## Pontos Fortes e Limitações

**Custos do NAT Gateway**:

- Grandes volumes de dados pelo NAT Gateway se acumulam rapidamente
- Os VPC Endpoints eliminam alguns custos do NAT completamente
- Revise quais serviços suas instâncias privadas chamam e se os endpoints estão disponíveis

**CloudFront para custo**:

- A taxa de acertos do cache determina diretamente a economia de custos
- Alta taxa de acertos de cache = menor transferência de origem + menor custo total de transferência
- Mova toda a entrega de ativos estáticos pelo CloudFront

**Contrapartidas entre AZs**:

- Eliminar o tráfego entre AZs geralmente requer mudanças arquiteturais que custam mais do que a economia
- Calcule cuidadosamente antes de otimizar

**S3 Select**:

- Economias significativas para consultas seletivas em objetos S3 grandes
- Não ajuda quando você precisa do arquivo inteiro

No próximo capítulo: o framework de seis pilares que faz as perguntas com que toda revisão de arquitetura deve começar.

## Resumo

- A AWS cobra por **dados de saída** (internet: ~US$ 0,09/GB), **tráfego entre AZs** (US$ 0,01/GB em cada direção), **tráfego entre regiões** (US$ 0,02-0,08/GB) e **processamento do NAT Gateway** (US$ 0,045/GB).
- **Dados de entrada** são gratuitos. **Tráfego na mesma AZ** é gratuito.
- **VPC Gateway Endpoints** (S3, DynamoDB): Gratuito. Elimina os custos do NAT Gateway para esses serviços.
- **VPC Interface Endpoints**: Cobrado por hora mais por GB. Mais barato do que o NAT Gateway para serviços de alto volume.
- O **CloudFront** serve dados a taxas mais baixas do que EC2 para internet direta e reduz drasticamente o volume de transferência de origem por meio do cache.
- O **S3 Select** reduz a transferência de dados do S3 filtrando na origem.
- Alguns custos de rede são contrapartidas arquiteturais (entre AZs para HA) — entenda-os, não os elimine sempre.

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
- **PrivateLink (VPC Interface Endpoints)**: Fornece conectividade privada para serviços AWS e para serviços hospedados por outros clientes AWS. Mais seguro do que passar pelo NAT, frequentemente mais barato para serviços de alto volume.

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre um VPC Gateway Endpoint e um VPC Interface Endpoint. Para quais serviços AWS cada um está disponível, e qual é o custo de cada um?

*(Dica: Os Gateway Endpoints são gratuitos, mas apenas para S3 e DynamoDB. Os Interface Endpoints custam por hora, mas funcionam para a maioria dos outros serviços AWS.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: A aplicação de uma empresa é executada em instâncias EC2 em sub-redes privadas. As instâncias fazem chamadas frequentes à API para o Amazon SQS e o Amazon S3. Atualmente, todo o tráfego sai pelo NAT Gateway. A equipe quer reduzir os custos do NAT Gateway. A segurança dos dados deve ser mantida — nenhum tráfego deve traversar a internet pública.

Qual abordagem MELHOR atende a esses requisitos com custo mínimo contínuo?

A) Criar um Gateway Endpoint para SQS e um Gateway Endpoint para S3  
B) Criar um Interface Endpoint para SQS e um Gateway Endpoint para S3  
C) Criar Interface Endpoints para SQS e S3  
D) Remover o NAT Gateway e usar o internet gateway diretamente para chamadas de API

**Dica 1**: Os Gateway Endpoints estão disponíveis apenas para S3 e DynamoDB.

**Dica 2**: Os Interface Endpoints estão disponíveis para SQS e muitos outros serviços (mas custam dinheiro).

**Dica 3**: Um Internet Gateway na tabela de rotas da sub-rede privada a tornaria uma sub-rede pública — violando os requisitos de segurança.

**Resposta**: B

**Explicação**: O S3 usa um Gateway Endpoint (gratuito). O SQS requer um Interface Endpoint (com custo). Essa combinação elimina os custos de processamento de dados do NAT Gateway para ambos os serviços. Todo o tráfego permanece dentro da rede privada da AWS — sem traversar a internet pública.

**Por que não A?** Os Gateway Endpoints não estão disponíveis para SQS. Apenas S3 e DynamoDB têm Gateway Endpoints.

**Por que não C?** Embora isso funcione, usar um Interface Endpoint para S3 (em vez do Gateway Endpoint gratuito) incorre em cobranças horárias desnecessárias. Sempre use o Gateway Endpoint gratuito para S3 e DynamoDB.

**Por que não D?** Adicionar uma rota para o Internet Gateway a partir da sub-rede privada a torna uma sub-rede pública. As instâncias EC2 em sub-redes privadas normalmente não têm Elastic IPs, então não poderiam realmente rotear por um Internet Gateway sem alterações adicionais — e fazer isso as exporia ao tráfego de entrada da internet.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.4*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

Os usuários da Costa Oeste da Nimbus geram tráfego significativo. A aplicação os serve a partir de us-east-1 (Virgínia). Atualmente:

- As respostas da API vão diretamente das instâncias EC2 de us-east-1 para os usuários da Costa Oeste (~80ms, US$ 0,09/GB)
- As fotos de cardápio vão do S3 us-east-1 pelo CloudFront em Seattle (~8ms após o cache)

A equipe está considerando adicionar uma segunda região de aplicação em us-west-2 (Oregon) para os usuários da Costa Oeste reduzirem a latência da API.

Analise os custos de transferência de dados dessa mudança. Quais novos custos de transferência de dados entre regiões a configuração de dual-region incorreria? O roteamento por latência do Route 53 reduziria ou aumentaria os custos totais de transferência? Sob quais condições (volume de tráfego, sensibilidade à latência) a configuração dual-region valeria a pena?

*(Não há uma única resposta correta. O objetivo é praticar a análise custo-benefício de múltiplas regiões.)*

## Cena Pós-Créditos

Tom fechou a análise de rede.

Impacto total do projeto de otimização de três meses:

- EC2 Savings Plans: -US$ 14.200/ano
- Armazenamento (S3 + EBS): -US$ 6.200/ano
- Camada de banco de dados: -US$ 11.220/ano
- Rede: -US$ 1.740/ano
- **Total: -US$ 33.360/ano**

Ele escreveu no quadro branco da sala de reunião.

Leo encarou o número. "Trinta e três mil."

"E troco," disse Tom.

"Por ano."

"Por ano."

Priya fez as contas. "São US$ 2.780 por mês que estávamos gastando em coisas que não criavam valor."

"Nem tudo," corrigiu Tom. "Algumas eram coisas das quais obtínhamos valor, mas pagávamos demais. Os Savings Plans — estávamos obtendo exatamente a mesma capacidade EC2, apenas a um preço melhor."

Maya ficou parada diante do quadro por um longo tempo.

"Quando começamos a Nimbus," disse ela, "cada dólar contava. Mal podíamos pagar a primeira instância EC2."

"Sim," disse Tom.

"E em algum momento no caminho, paramos de acompanhar os dólares com o mesmo cuidado."

"O crescimento faz isso," disse Priya. "O foco muda para construir, não para otimizar."

"Ambos importam," disse Maya. "Ambos, sempre. Adicione isso à wiki. E agende uma revisão trimestral de custos."

Tom já estava abrindo o calendário.

Nos próximos capítulos: afastamos o zoom dos serviços individuais e começamos a pensar como arquitetos.
