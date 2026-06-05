# Capítulo 33: Depende

Respire fundo uma última vez antes deste capítulo.

Você chegou ao fim do livro. Isso é ao mesmo tempo uma conclusão e um começo — o último capítulo e o primeiro dia em que você estará tomando decisões arquiteturais por conta própria.

Este capítulo tem um único objetivo: ser honesto com você sobre a coisa que ninguém lhe diz com clareza suficiente.

**A Pergunta**

No final de quase toda discussão de arquitetura, alguém eventualmente pergunta: "Qual é a resposta certa?"

E a resposta mais útil, frustrante, honesta e incompreendida em toda a engenharia de software é:

**Depende.**

Não porque a pergunta não tem resposta. Não porque o especialista está sendo evasivo. Mas porque a resposta certa genuína e estruturalmente depende de um contexto que não estava na pergunta.

Este capítulo é sobre aprender a dizer "depende" corretamente — o que significa ser capaz de completar a frase.

Pense em um médico que é perguntado: "A cirurgia é o tratamento certo?" Um mau médico diz sim ou não sem examinar o paciente. Um bom médico diz: "Depende — do diagnóstico, da idade do paciente, de suas outras condições e do que acontece se esperarmos." A resposta não é evasão. É precisão. "Depende" seguido de uma frase completa é a coisa mais útil que um médico — ou um arquiteto — pode dizer.

**O Fim da Nimbus**

Dois anos após o início. Maya estava em uma sala de conferência em Seattle, apresentando a um grupo de investidores de capital de risco.

A Nimbus havia crescido: 947 parceiros restaurantes. 18.000 pedidos diários. US$ 2,1 milhões em GMV mensal. Três cidades ativas, mais duas lançando. Uma equipe de quatorze engenheiros em dois fusos horários.

Os investidores tinham perguntas. Um deles — um sócio técnico do fundo — se inclinou para a frente.

"Qual banco de dados você está usando?" ele perguntou.

Maya não hesitou.

"Para pedidos e dados de clientes: Aurora PostgreSQL. Para o catálogo de cardápio: DynamoDB. Para gerenciamento de sessões e cache: ElastiCache Redis. Para análises: Athena sobre arquivos Parquet no S3, com Redshift para as consultas de painel de alta frequência."

Ele assentiu. "Por que Aurora para pedidos e não DynamoDB?"

"Porque os pedidos têm estrutura relacional complexa — eles referenciam itens do cardápio, contas de clientes, endereços de restaurantes, métodos de pagamento. Precisamos de consistência transacional em múltiplas entidades. Um banco de dados relacional é a ferramenta certa para isso. O ponto forte do DynamoDB é o acesso de alto throughput baseado em chave com esquema flexível, que é exatamente o padrão de acesso do catálogo de cardápio."

Ele anotou algo. "E quanto ao escalonamento? Você disse 18.000 pedidos diários. Isso é cerca de 12 por minuto em média. Como você projetou para o pico?"

"O rush do jantar de sexta-feira é cerca de 25x a média. Escalamos horizontalmente com ECS e Aurora Serverless v2, que lida com o burst automaticamente. O CloudFront absorve a carga de conteúdo estático. A API é stateless, então o escalonamento horizontal é limpo."

"E se o Aurora Serverless v2 não conseguir escalar rápido o suficiente?"

"Temos resultados de testes de carga. O tempo para escalar do Aurora Serverless v2 é de menos de 10 segundos. O pico de sexta-feira médio leva 8 minutos desde a linha de base. Estamos confortáveis com a margem."

O sócio técnico olhou para o restante dos investidores. "Ela conhece seu sistema."

**As Quatro Perguntas Por Trás do "Depende"**

Toda contrapartida arquitetural se reduz a quatro perguntas fundamentais. Nem toda pergunta importa igualmente para cada decisão, mas todas as quatro estão sempre em jogo:

**1. Qual é o padrão de acesso?**

Como os dados são escritos e lidos? Com qual frequência? Por quantos usuários simultâneos? Em qual ordem? Por quais chaves?

Essa pergunta determina a seleção de tecnologia no nível mais fundamental. DynamoDB vs Aurora vs Redshift vs Athena — a resposta correta depende quase inteiramente do padrão de acesso.

**2. Qual é a escala?**

Não apenas agora — em 12 meses, em 5 anos. A escala muda a resposta correta. O que funciona para 100 requisições por dia quebra em 100 milhões. O que é excessivo para 10 usuários é necessário para 10.000.

E a escala não é apenas tráfego. É tamanho da equipe (a arquitetura deve ser mantida pela equipe que você tem). É volume de dados. É alcance geográfico.

**3. Qual é a consequência da falha?**

Se isso quebrar, o que acontece? Um usuário vê uma página lenta? Um pedido falha? O dinheiro se move incorretamente? O prontuário médico de alguém fica inacessível?

A consequência determina quanto você investe em confiabilidade. Uma página de cardápio lenta justifica consistência eventual. Um pagamento falhado justifica escritas síncronas e confirmação explícita.

**4. Qual é a restrição de custo?**

Não apenas dinheiro — também complexidade operacional (que é ela própria uma forma de custo). Uma solução que requer três serviços adicionais pode ser tecnicamente superior a uma mais simples, mas cara demais para manter com uma equipe de quatro pessoas.

**"Depende": Como Completar a Frase**

A forma correta de dizer "depende" é completá-lo imediatamente:

*"Devemos usar DynamoDB ou Aurora?"*

"Depende do padrão de acesso. Se você precisa de consultas baseadas em chave de alto throughput com esquema flexível, DynamoDB. Se precisa de consistência transacional entre entidades relacionadas com consultas complexas, Aurora."

*"Devemos usar Lambda ou EC2?"*

"Depende das características da carga de trabalho. Lambda para cargas de trabalho orientadas a eventos, de curta duração, variáveis onde o custo zero em inatividade importa. EC2 ou ECS para processos persistentes, com estado ou de longa duração onde o desempenho previsível é mais importante do que o custo em inatividade."

*"Devemos usar Multi-AZ ou Multi-Region?"*

"Depende dos seus requisitos de RTO/RPO e do seu modelo de ameaças. Multi-AZ protege contra falhas de AZ (o modo de falha AWS mais comum) e fornece RPO ~0 e RTO ~60 segundos para RDS. Multi-Region protege contra falhas regionais (raras) e serve usuários globalmente distribuídos. Se você precisa de failover sub-minuto de um desastre regional, Multi-Region. Se a resiliência por AZ é suficiente, Multi-AZ é muito mais simples e barato."

"Depende" não é o fim da resposta. É o começo da resposta real.

**Os Padrões Que Não Mudam**

Enquanto as escolhas de tecnologia específica evoluem — novos serviços são lançados, os preços mudam, alternativas melhores surgem — alguns padrões subjacentes permanecem estáveis há décadas:

**Separação de preocupações**: Componentes que fazem coisas diferentes devem ser independentes. Uma mudança em um não deve exigir uma mudança em outro. É por isso que você desacopla com SQS, não chamadas diretas. Por que você usa S3 para objetos, não bancos de dados. Por que a camada web e a camada de banco de dados são separadas.

**Defesa em profundidade**: Nenhum controle de segurança único é suficiente. Você tem IAM, grupos de segurança, NACLs, WAF, GuardDuty, Secrets Manager, KMS. Se uma camada falhar, a próxima a captura.

**Pague pelo que usa, quando usa**: O princípio econômico fundamental da nuvem. O Lambda escala até zero. As Spot Instances usam capacidade reserva. As políticas de ciclo de vida S3 movem dados frios para armazenamento mais barato. O DynamoDB on-demand cobra por requisição. Os padrões são diferentes; o princípio é o mesmo.

**Otimize para a falha mais provável**: Multi-AZ primeiro (falhas de AZ acontecem). DR multi-região segundo (falhas regionais são mais raras). Redundância dentro da AZ (múltiplas instâncias) antes de complexidade entre regiões. Construa para a falha realista, não para a catastrófica mas improvável.

**Meça antes de otimizar**: A abordagem de Tom — puxar as métricas do CloudWatch, entender o padrão real, depois tomar decisões — é mais valiosa do que otimização prematura baseada em suposições.

**O Que Este Livro Não Pode Ensinar**

Vamos ser diretos sobre os limites.

Este livro ensinou:

- O que cada serviço AWS principal faz
- As analogias que os tornam intuitivos
- As contrapartidas entre alternativas
- O conhecimento do exame que você precisa para o SAA-C03
- Um framework para pensar sobre decisões arquiteturais

Este livro não pode ensinar:

- **Instinto de produção**: A sensação visceral de que "isso vai ficar estranho sob carga" antes de você ter visto acontecer. Isso vem de operar sistemas reais.
- **Julgamento técnico sob pressão**: Decidir o que fazer às 3 da manhã quando o sistema está inativo e você tem informações incompletas. Isso vem de incidentes.
- **Intuição com partes interessadas**: Saber quando refutar um requisito de negócios porque o custo técnico é muito alto. Isso vem da experiência com os lados técnico e de negócios.
- **A pergunta certa para o contexto específico**: Carlos podia fazer as perguntas certas porque havia visto problemas semelhantes dezenas de vezes. Esse conhecimento é conquistado, não lido.

Você não terminou de aprender. Mal começou.

**O Exame Não É o Destino**

Você pegou este livro para se preparar para o exame AWS Solutions Architect Associate. Isso é válido. A certificação SAA-C03 é real, valorizada e abrirá portas.

Mas o exame testa conhecimento e reconhecimento de padrões. Não testa julgamento. Não testa experiência operacional. Não testa o que você faz quando a arquitetura que construiu para de funcionar às 23h de uma sexta-feira.

A certificação é uma credencial inicial. Quando você passar no exame, saberá como os serviços AWS funcionam e como eles se combinam. Você terá um framework para pensar sobre arquitetura. Você não terá feito isso ainda.

O próximo passo após o exame: construa algo real. Implante-o. Opere-o. Veja-o falhar. Corrija-o. Fique sem dinheiro em um serviço e mova o custo para outro lugar. Seja acordado no meio da noite e tome uma decisão com informações insuficientes.

É assim que o conhecimento deste livro se torna julgamento.

**A Resposta Final de Maya**

No final da reunião com os investidores, o sócio técnico tinha mais uma pergunta.

"Se você estivesse recomeçando hoje, sabendo o que sabe agora, o que faria diferente?"

Maya levou um momento.

"Começaria com infraestrutura como código desde o primeiro dia," disse ela. "Leo implantou a primeira instância EC2 manualmente. Passamos seis meses migrando tudo para o Terraform. Isso foi seis meses de dívida técnica que nos custou tempo real."

"O que mais?"

"Seria mais conservadora com serviços gerenciados no início. Usamos DynamoDB quando um simples banco de dados RDS teria sido suficiente por meses. O design do padrão de acesso do DynamoDB exigiu pensamento experiente que ainda não tínhamos. Redesenhamos o esquema duas vezes."

"Então mais simples é melhor no início?"

"Mais simples é melhor *sempre*. A pergunta é sempre: qual é a coisa mais simples que resolve o problema real, não o problema futuro antecipado? Adicionamos complexidade para resolver problemas que ainda não tínhamos. Parte dessa complexidade causou seus próprios problemas."

O sócio técnico anotou isso.

"Última pergunta," disse ele. "Qual é a coisa mais importante que você sabe sobre construir na AWS que não sabia quando começou?"

Maya pensou nos dois anos. Os incidentes. As revisões de custo. A Well-Architected Review. As decisões arquiteturais tomadas sob pressão e as tomadas com cuidado. As que acertaram e as que tiveram que ser refeitas.

"Que a nuvem não resolve problemas de arquitetura," disse ela. "Ela os amplifica. Uma má decisão on-premises pode custar uma semana. Uma má decisão na nuvem pode custar dinheiro todo mês, em escala, até que alguém perceba."

Ela fez uma pausa.

"A nuvem faz as boas decisões escalarem. E as ruins também."

**Fechamento**

Você aprendeu muito. Os serviços AWS. As contrapartidas. Os padrões.

Agora faça algo com isso.

Construa algo. Cometa erros de propósito. Leia post-mortems (eles são públicos — AWS, Cloudflare, GitHub, Stripe todos os publicam). Trabalhe com equipes que são melhores do que você nas coisas em que você é mais fraco.

O exame SAA-C03 testará se você conhece o material. Sua carreira testará se você consegue aplicá-lo.

Ambos valem a pena fazer. Nenhum é o destino final.

Não há destino final neste campo. Há apenas o próximo problema, a próxima decisão e o hábito de fazer a próxima pergunta certa.

Boa sorte.

No próximo capítulo: o que muda quando o trabalho não é mais construir o sistema — mas ser responsável por ele.

## Resumo

- **"Depende" é o começo da resposta**, não o fim. Complete sempre a frase com as condições das quais depende.
- As quatro perguntas por trás de cada contrapartida arquitetural: padrão de acesso, escala, consequência da falha, restrição de custo.
- Os padrões que perduram: separação de preocupações, defesa em profundidade, pague pelo que usa, otimize para a falha provável, meça antes de otimizar.
- **A nuvem amplifica as decisões** — as boas e as ruins. Uma má decisão on-premises custa uma semana; uma má decisão na nuvem se acumula mensalmente, em escala.
- A certificação SAA-C03 testa conhecimento e reconhecimento de padrões. A experiência de produção transforma esse conhecimento em julgamento.

## Dicas para o Exame

*Domínio SAA-C03: Domínio cruzado — todos os domínios*

Este capítulo fecha o conteúdo do exame deste livro. Antes de fazer o exame:

**Revise os serviços sobre os quais você tem menos confiança**:

- Para a maioria das pessoas: Kinesis vs SQS (a distinção stream vs fila)
- Rede VPC (tabelas de rotas, sub-redes, NAT Gateway, Internet Gateway)
- Lógica de avaliação de política IAM (negação explícita > permissão explícita > negação implícita)
- Seleção de classe de armazenamento (conheça todas as seis classes de armazenamento S3 e suas contrapartidas)
- RDS vs Aurora vs DynamoDB para casos de uso específicos

**Conheça a estrutura de cenário típica do exame**:

O SAA-C03 apresenta um requisito de negócios ("a empresa precisa de 99,99% de disponibilidade") e pede que você identifique a arquitetura que o atende. Sempre leia o requisito, identifique a restrição principal e elimine as opções que não a atendem.

**Pratique a identificação de distratores**:

Cada resposta errada no exame está errada por uma razão específica. Aprender a identificar *por que* cada resposta errada está errada é mais valioso do que memorizar respostas corretas.

**O exame recompensa o reconhecimento de padrões**:

- "Desacoplar" → SQS/SNS
- "Serverless" → Lambda, DynamoDB, Aurora Serverless
- "Baixa latência global" → CloudFront, Global Accelerator, DynamoDB Global, Aurora Global
- "Conformidade/auditoria" → CloudTrail, Config, Security Hub, Macie
- "Otimização de custos" → Spot Instances, Savings Plans, políticas de ciclo de vida, dimensionamento correto

**Você está pronto**. Não porque este livro cobriu tudo — nada cobre. Mas porque você entende os princípios bem o suficiente para raciocinar até a resposta mesmo quando não reconhece imediatamente o cenário exato.


## Exercícios

**Exercício Final**

Não há mais perguntas estruturadas de exame após este capítulo.

Em vez disso: uma pergunta aberta.

Que sistema você construiria hoje, sabendo o que sabe?

Escreva. Esboce a arquitetura. Identifique os serviços. Anote as contrapartidas que você faria e por quê. Antecipe os modos de falha.

Depois construa-o.

Essa é a tarefa. Não há data de entrega. Não há nota. Há apenas o trabalho.

## Cena Pós-Créditos

O investimento veio.

Série A. US$ 4 milhões. O suficiente para expandir para cinco novas cidades, triplicar a equipe de engenharia e construir o Nimbus Instant.

Naquela noite, Maya estava no restaurante de sua família. O original. Onde a Nimbus começou, quando ela percebeu que estavam perdendo pedidos porque o telefone estava sempre ocupado.

Ela pediu arepa — o mesmo prato que sempre pedia.

Enquanto esperava, abriu o laptop e leu o primeiro capítulo deste livro.

*"Onde fica um site?"*

Ela se lembrou de não saber a resposta.

Ela sorriu.

Fechou o laptop.

A comida chegou.

Era perfeita.

*Obrigado por ler.*

*O exame AWS Solutions Architect Associate (SAA-C03) está disponível nos centros de testes Pearson VUE e online por meio do sistema de testes remotos. Visite aws.amazon.com/certification para se registrar.*

*A história da Nimbus é fictícia. Os serviços AWS, modelos de preços e melhores práticas descritos neste livro são reais. Ambos podem mudar — a AWS atualiza seus serviços com frequência. Sempre verifique os preços e capacidades atuais dos serviços em aws.amazon.com.*

*Boa sorte.*
