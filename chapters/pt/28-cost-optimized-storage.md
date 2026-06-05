# Capítulo 28: A Surpresa da Conta de Armazenamento

Tom havia enviado o Savings Plan para EC2. A próxima linha da conta era S3: US$ 198/mês (reduzido de US$ 847 após as mudanças na política de ciclo de vida do Capítulo 23).

Depois ele olhou para EBS: US$ 440/mês.

"Isso parece alto," disse ele.

Leo puxou a lista de volumes EBS. Havia 47 volumes EBS vinculados a instâncias. E depois havia outros 23 volumes não vinculados a nenhuma instância.

"Esses 23 volumes," disse Tom. "O que são eles?"

Leo os verificou. Todos estavam desvinculados — nenhuma instância estava usando-os. A maioria havia sido criada a partir de snapshots para fins de depuração. Alguns eram de instâncias que haviam sido encerradas, mas cujos volumes não haviam sido excluídos.

"Estamos pagando US$ 0,10 por GB por mês por armazenamento que ninguém está lendo," disse Leo.

Tom olhou para o total: 2,3 TB de volumes desvinculados.

"Duzentos e trinta dólares por mês por armazenamento que não estamos usando," disse Tom. "Há quanto tempo isso está acontecendo?"

Leo verificou as datas de criação. O volume mais antigo tinha 16 meses.

"Três mil seiscentos e oitenta dólares," disse Tom em voz baixa. "Gastamos três mil e seiscentos dólares em armazenamento que ninguém acessa."

Ele excluiu os volumes desvinculados. No mês seguinte, a conta do EBS caiu para US$ 210.

**A Auditoria de Custo de Armazenamento**

A descoberta de EBS de Tom era um sintoma de um padrão mais amplo: os custos de armazenamento se acumulam de forma invisível. Ao contrário da computação (você nota quando 47 servidores estão rodando), o armazenamento se acumula silenciosamente.

Pense nisso como alugar um depósito. Alugar uma unidade é óbvio no extrato do cartão de crédito. Mas se você aluga uma segunda unidade para um projeto, depois uma terceira para alguns móveis velhos, e nunca volta para verificar o que está dentro — as cobranças continuam aparecendo todo mês, silenciosamente, muito depois de você ter esquecido o que está armazenando. O armazenamento em nuvem funciona da mesma forma: os bytes ficam lá, a fatura chega, e ninguém questiona até que alguém finalmente abra a porta e encontre tudo cheio de coisas que ninguém mais precisa.

Uma auditoria completa de custo de armazenamento analisa:

**S3**:

- Existem políticas de ciclo de vida para todos os buckets?
- Existem snapshots antigos (RDS, EBS) no S3?
- O Intelligent-Tiering é adequado para algum bucket com padrões de acesso incertos?
- Existem objetos versionados criando múltiplas cópias que nunca são acessadas?

**EBS**:

- Algum volume está desvinculado (nenhuma instância EC2 o está usando)?
- Os volumes gp3 estão configurados corretamente? (Os volumes gp3 padrão podem ter throughput/IOPS provisionados em excesso que não são necessários)
- Snapshots mais antigos do que o necessário estão sendo retidos?

**RDS**:

- Os períodos de retenção de backup automatizado estão definidos de forma adequada? (Mais longo = maior custo de armazenamento)
- Snapshots manuais de instâncias antigas ainda estão por aí?
- Réplicas de leitura de migrações de banco de dados ainda estão rodando?

**EFS**:

- O volume EFS está na classe de armazenamento correta? (Standard vs Infrequent Access)

**Versionamento S3: O Custo Oculto**

No Capítulo 5, mencionamos que o versionamento S3 mantém cada versão anterior de um objeto. Isso é excelente para segurança. É terrível para custos se você não tiver também regras de ciclo de vida para as versões.

Quando o versionamento está habilitado em um bucket, toda vez que você sobrescreve um objeto, a versão antiga é retida. Com o tempo:

- Dia 1: Imagem enviada (v1)
- Dia 30: Imagem atualizada (v1 é agora uma versão "não atual", v2 é atual)
- Dia 60: Imagem atualizada novamente (v1 e v2 são não atuais, v3 é atual)
- Dia 365: v1, v2... v12 estão todas armazenadas. Você está pagando por 12 cópias de uma imagem.

A solução: regras de ciclo de vida para versões não atuais.

```
Expirar versões não atuais após 30 dias
Excluir uploads multipart com falha após 7 dias
```

Tom aplicou essas regras a todos os buckets com versionamento. No mês seguinte, o armazenamento S3 diminuiu 18%.

**EBS: Dimensionamento Correto e a Atualização para gp3**

O preço do volume EBS tem dois componentes:

1. Armazenamento (por GB por mês)
2. IOPS provisionados e throughput (se você estiver em io1/io2 ou pagando por desempenho extra gp3)

**A oportunidade gp3**: No Capítulo 6, observamos que o gp3 é o padrão atual e é mais barato do que o gp2. Se a Nimbus tivesse volumes criados antes de o gp3 estar disponível (lançado em dezembro de 2020), eles poderiam ainda ser gp2.

Tom encontrou 12 volumes gp2 totalizando 1.200 GB. Migrar para gp3 economizou 20% nesses volumes imediatamente, sem degradação de desempenho.

**IOPS e throughput**: Os volumes gp3 vêm com 3.000 IOPS e 125 MB/s de throughput por padrão, sem custo extra. Você pode provisionar mais se a sua carga de trabalho precisar. Revise se o desempenho provisionado está sendo realmente utilizado.

Tom encontrou dois volumes gp3 com 10.000 IOPS provisionados. Verificou as métricas do CloudWatch: o IOPS médio real era de 1.200. Reduziu os IOPS provisionados para 4.000 (uma margem de segurança acima do pico real).

Economia mensal: US$ 68.

**Ciclo de vida de snapshots**: Os snapshots EBS são incrementais (cada snapshot armazena apenas as alterações desde o anterior), mas se acumulam. Snapshots antigos dos primeiros dias da Nimbus ainda existiam. Tom manteve 30 dias de snapshots diários e excluiu o restante.

**EFS: Classes de Armazenamento**

O Amazon EFS tem suas próprias classes de armazenamento:

- **EFS Standard**: Para arquivos acessados com frequência. Maior custo.
- **EFS Infrequent Access (IA)**: Para arquivos não acessados por 30 dias. 92% mais barato do que o Standard.
- **EFS Archive**: Para arquivos não acessados por 90 dias. Ainda mais barato do que o IA.

**EFS Intelligent-Tiering**: Move automaticamente os arquivos entre classes de armazenamento com base nos padrões de acesso.

Tom habilitou o Intelligent-Tiering no volume EFS. Seis semanas depois, 68% dos arquivos haviam migrado para o Infrequent Access. O custo mensal do EFS caiu de US$ 89 para US$ 31.

**Tags de Alocação de Custo S3: Descobrindo Quem Está Gastando o Quê**

À medida que a Nimbus crescia, múltiplas equipes armazenavam dados no S3. A equipe de análise tinha seus próprios buckets. A equipe de engenharia tinha seus buckets. A equipe de dados de restaurantes tinha seus buckets.

A conta mostrava apenas "S3: US$ 198." Não havia detalhamento por equipe.

As **tags de alocação de custo** permitem marcar recursos AWS com metadados de negócios (equipe, projeto, ambiente) e depois ver os custos detalhados por essas tags no AWS Cost Explorer.

Tom adicionou tags a todos os buckets S3:
```
Team: analytics
Environment: production
Project: nimbus-core
```

Após um ciclo de faturamento com tagging, ele podia ver: "O data lake da equipe de análise custa US$ 74/mês. Os backups de engenharia custam US$ 43/mês. Os dados de restaurantes custam US$ 81/mês."

Agora ele podia ter conversas de orçamento com cada equipe em vez de apenas olhar para um número agregado.

**AWS Cost Explorer e AWS Budgets**

**AWS Cost Explorer**: Visualiza custos históricos e previstos por serviço, região, tag e tipo de uso. Essencial para entender para onde vai o dinheiro.

**AWS Budgets**: Define alertas quando os custos excedem (ou prevê-se que excedam) um limite. Você pode orçar por serviço, região, tag ou conta.

Tom configurou três orçamentos:

1. Conta total mensal: Alerta a 90% do valor orçado
2. EC2 On-Demand: Alerta se o gasto On-Demand exceder US$ 500/mês (sinaliza uma lacuna no Savings Plan)
3. Transferência de dados para fora: Alerta a US$ 200/mês (os custos de transferência de dados podem aumentar inesperadamente)

Os Budgets enviavam alertas para um canal do Slack. A equipe via quando estava se aproximando dos limites, em vez de descobrir na fatura mensal.

**O Custo do Descuido**

Tom criou uma planilha. Calculou quanto a Nimbus havia gasto em:

- Volumes EBS desvinculados (16 meses): US$ 3.680
- Snapshots S3 antigos (descobertos e excluídos): US$ 890
- IOPS provisionados desnecessários: US$ 816
- Economia da migração gp2 para gp3 (projetada, se feita antes): US$ 2.160 ao longo de 18 meses
- Versões S3 não atuais acumulando: US$ 1.340

Total de desperdício identificado: aproximadamente US$ 8.800 ao longo de 18 meses.

"Oito mil e oitocentos dólares," disse Maya.

"De descuido," disse Tom. "Não de tomar decisões arquitetônicas erradas. De não limpar."

"Qual é a solução sistemática?"

"Auditorias regulares," disse Priya. "Revisões mensais do Cost Explorer. O AWS Trusted Advisor sinaliza volumes desvinculados e recursos ociosos automaticamente. Automatize a limpeza de padrões conhecidos de desperdício: exclua snapshots mais antigos do que N dias, alerte sobre volumes EBS desvinculados, expire versões S3 antigas."

"E," acrescentou Tom, "torne a higiene de custos parte do processo de implantação. Quando um engenheiro encerra uma instância EC2, o volume EBS é excluído automaticamente, a menos que eles explicitamente optem por não fazer isso."

## Pontos Fortes e Limitações

**Disciplina de otimização de custos**:

- Revisões regulares capturam desperdícios acumulados antes de se tornarem significativos
- O tagging permite responsabilidade — as equipes veem seus próprios custos
- Os alertas automatizados evitam surpresas na fatura
- As políticas de ciclo de vida e o dimensionamento correto geralmente são economias que você configura uma vez e esquece

**Onde fica complicado**:

- Identificar desperdício em uma conta grande com muitas equipes requer ferramentas centralizadas
- Algum desperdício é intencional (manter snapshots extras "por precaução") — a troca custo/risco é uma decisão de julgamento
- A migração gp3 requer validação cuidadosa (os padrões de IOPS e throughput podem diferir do comportamento gp2 em alguns casos extremos)
- As tags de alocação de custo requerem disciplina em todas as equipes — um tagging inconsistente torna os dados incompletos

## Resumo

- **Os custos de armazenamento se acumulam de forma invisível** — auditorias regulares são essenciais.
- **Volumes EBS desvinculados** são uma fonte comum de desperdício. Exclua-os (ou automatize a exclusão quando as instâncias forem encerradas).
- **Dimensionamento correto EBS**: Migre gp2 para gp3 (tipicamente 20% de economia). Remova IOPS provisionados em excesso.
- **Versionamento S3**: Habilite regras de ciclo de vida para versões não atuais para evitar pagar por um histórico ilimitado de versões.
- **EFS Intelligent-Tiering**: Move automaticamente os arquivos para camadas de menor custo com base na frequência de acesso.
- **Tags de alocação de custo**: Marque recursos com metadados de equipe/projeto/ambiente para visibilidade e responsabilidade de custos.
- **AWS Budgets**: Alertas proativos quando os custos se aproximam dos limites. Nunca seja surpreendido pela fatura mensal.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.1)*

- **Tags de alocação de custo**: Habilite as tags definidas pelo usuário para alocação de custo no console de faturamento; depois marque os recursos. O Cost Explorer mostra detalhamentos por tag. Cenário do exame: "identificar qual departamento está gerando a maioria dos custos do S3" → tags de alocação de custo.
- **AWS Trusted Advisor**: Identifica instâncias EC2 subutilizadas, volumes EBS desvinculados, balanceadores de carga ociosos e outros desperdícios. Verificações básicas gratuitas; verificações completas requerem suporte Business/Enterprise.
- **Componentes de custo EBS**: Armazenamento (por GB), IOPS provisionados (se io1/io2 ou gp3 extra), throughput (se gp3 extra). Saiba quais componentes podem ter o dimensionamento correto.
- **Custos de versionamento S3**: Versões não atuais são armazenadas e cobradas à mesma taxa que as versões atuais. Regras de ciclo de vida que expiram versões não atuais são críticas para o controle de custos em buckets com versionamento.
- **AWS Compute Optimizer**: Analisa a utilização do EC2 e recomenda tipos de instância de tamanho correto. Sinal do exame: "reduzir os custos do EC2 selecionando o tipo de instância correto" → Compute Optimizer.
- **AWS Cost Anomaly Detection**: Usa ML para detectar padrões de gasto incomuns. Sinal do exame: "detectar automaticamente aumentos de custo inesperados" → Cost Anomaly Detection.

## Exercícios

**Exercício 1 — Recordação**

Explique por que volumes EBS desvinculados geram custos mesmo que nenhuma instância EC2 esteja usando-os. Que processo devem os engenheiros seguir ao encerrar uma instância EC2 para evitar esse desperdício?

*(Dica: Os volumes EBS armazenam dados em disco físico, e esse disco custa dinheiro independentemente de estar sendo lido.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: A conta AWS de uma empresa cresceu de US$ 5.000 para US$ 9.000/mês ao longo de seis meses, mas eles não adicionaram novos serviços. A equipe de engenharia suspeita que os custos de armazenamento são o problema. Qual combinação de ferramentas AWS MELHOR identificaria e explicaria o aumento de custo?

A) AWS CloudTrail para revisar as chamadas de API e identificar quem criou novos recursos  
B) AWS Cost Explorer para detalhamento de custo por serviço, e AWS Trusted Advisor para detecção de recursos ociosos e desvinculados  
C) Amazon CloudWatch para monitorar a utilização de recursos e criar alarmes de custo  
D) AWS Config para identificar todos os recursos e seu status de conformidade

**Dica 1**: "Identificar o aumento de custo" → visualizar o detalhamento de custo por serviço.

**Dica 2**: "Recursos ociosos e desvinculados" → uma ferramenta específica identifica isso proativamente.

**Dica 3**: O CloudTrail registra chamadas de API; o Cost Explorer mostra tendências de custo. Qual é mais útil para análise de custo?

**Resposta**: B

**Explicação**: O AWS Cost Explorer mostra tendências de custo detalhadas por serviço, região e tipo de uso — perfeito para identificar qual serviço gerou o aumento. As verificações de otimização de custos do AWS Trusted Advisor identificam volumes EBS desvinculados, instâncias EC2 ociosas, balanceadores de carga subutilizados e outras fontes comuns de desperdício.

**Por que não A?** O CloudTrail registra quem criou recursos e quando, mas não mostra diretamente tendências de custo ou identifica desperdícios.

**Por que não C?** O CloudWatch monitora o desempenho dos recursos (CPU, memória) — útil para dimensionamento correto, mas não para identificar desperdícios de armazenamento acumulados.

**Por que não D?** O AWS Config rastreia configurações de recursos e conformidade, mas não é uma ferramenta de análise de custos.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A conta S3 da Nimbus mostra US$ 340/mês para um bucket chamado "backups." O bucket tem versionamento habilitado e contém:

- Snapshots de banco de dados diários (7 dias é suficiente para a política deles)
- Backups completos semanais (mantidos por 3 meses)
- Arquivos trimestrais (mantidos por 7 anos para conformidade fiscal)

Projete uma política de ciclo de vida para este bucket que minimize o custo enquanto atende a esses requisitos de retenção. Qual classe de armazenamento cada tipo de dado deve usar? Como você lidaria com o versionamento para evitar que versões antigas se acumulem?

*(Não há uma única resposta correta. O objetivo é praticar o design de política de ciclo de vida.)*

## Cena Pós-Créditos

Tom publicou as descobertas da auditoria de custos para a equipe.

Desperdício identificado: US$ 8.800 ao longo de 18 meses.
Economia anual esperada com as mudanças implementadas: US$ 6.200.

Depois ele adicionou uma linha no final: "Isso não inclui a economia com Savings Plans (US$ 14.200/ano) ou políticas de ciclo de vida S3 (US$ 7.800/ano). Impacto total anual da otimização: aproximadamente US$ 28.200."

Maya leu duas vezes.

"Isso é quase o salário de um engenheiro júnior," disse ela.

"Em desperdício," confirmou Tom.

"Ou," disse Leo, "é a prova de que fazer essas otimizações mais cedo teria financiado esse engenheiro júnior."

Tom olhou para ele.

"É a forma certa de pensar sobre isso," disse ele. "A otimização de custos não é sobre cortar. É sobre não pagar por coisas que não criam valor."

Maya fixou o documento na wiki da empresa.

No próximo capítulo: a camada de banco de dados recebe o mesmo tratamento, e Tom descobre o único lugar em que estava genuinamente investindo de menos.
