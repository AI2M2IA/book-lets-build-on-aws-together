# Capítulo 23: O Sistema de Arquivamento Que Se Organiza Sozinho

Um escritório de advocacia mantém os processos ativos sobre a mesa. Os processos concluídos vão para um arquivo. Os processos de três anos atrás vão para caixas de armazenamento no porão. Os processos de dez anos atrás vão para uma instalação de arquivamento externo que custa centavos por caixa, mas leva dois dias para recuperar qualquer coisa.

A mesma informação, armazenada a custos diferentes com base na frequência de acesso.

O S3 faz isso automaticamente.

Tom estava revisando a conta AWS da Nimbus. Linha do item: armazenamento S3. US$ 847/mês.

Ele chamou Leo.

"Temos 4,2 terabytes no S3," disse Leo depois de verificar.

"De quê?"

"Fotos de restaurantes. Recibos de pedidos. Exportações de análises. Snapshots de backup de 18 meses atrás."

"Quando foi a última vez que alguém acessou um backup de 18 meses atrás?"

Leo verificou os logs de acesso.

"No último outubro," disse ele. "Uma vez. Para verificar o formato do backup."

"Então estamos pagando por 18 meses de backups com preço integral do S3 Standard."

"Sim."

Tom olhou para a página de preços do S3. S3 Standard: US$ 0,023 por GB por mês. S3 Glacier Instant Retrieval: US$ 0,004 por GB por mês.

Fez as contas. Alguns cálculos rápidos.

"Poderíamos reduzir significativamente essa conta," disse ele, "apenas movendo dados antigos para armazenamento mais barato."

"Precisaríamos saber o que é antigo," disse Leo.

"O S3 sabe. Ele rastreia o tempo do último acesso."

**Classes de Armazenamento S3: O Espectro Completo**

O Capítulo 5 apresentou o S3 Standard como a classe de armazenamento principal. O S3 na verdade tem sete classes de armazenamento, cada uma projetada para padrões de acesso diferentes:

**S3 Standard**: Para dados acessados com frequência. Baixa latência (milissegundos). Maior custo. Sem duração mínima de armazenamento. Use para dados ativos: as fotos do cardápio atual, os pedidos de hoje, os logs recentes.

**S3 Standard-Infrequent Access (S3 Standard-IA)**: Para dados acessados menos de uma vez por mês. A mesma recuperação em milissegundos do Standard, mas menor custo de armazenamento + taxa de recuperação por GB. Use para dados que você precisa imediatamente quando acessa, mas raramente o faz: recibos de pedidos mais antigos, exportações de análises de 6 meses atrás.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)**: O mesmo que S3 Standard-IA, mas armazenado em apenas uma Zona de Disponibilidade (em vez de três). Menos durável (se essa AZ sofrer um desastre, os dados podem ser perdidos), mas 20% mais barato. Use para dados que podem ser recriados se perdidos: cache de miniaturas, saídas de processamento temporárias.

**S3 Glacier Instant Retrieval**: Dados arquivados que você precisa ocasionalmente. Recuperação em milissegundos. Custo de armazenamento muito baixo, maior custo de recuperação por GB. Duração mínima de armazenamento de 90 dias. Use para dados acessados uma vez por trimestre ou menos: relatórios de conformidade trimestrais, snapshots de backup de 12 meses atrás.

**S3 Glacier Flexible Retrieval**: Arquivo profundo, recuperado em minutos a horas. Menor custo do que o Glacier Instant Retrieval. Use para dados de arquivamento com menos urgência.

**S3 Glacier Deep Archive**: Opção de menor custo. Recuperado em 12 horas. Duração mínima de armazenamento de 180 dias. Use para dados que devem ser mantidos para conformidade regulatória, mas nunca se espera que sejam acessados: registros fiscais de 7 anos, logs de auditoria de 10 anos.

O padrão: à medida que a frequência de acesso diminui, o custo diminui, mas o tempo de recuperação aumenta (e o custo por recuperação aumenta). Escolha a classe que corresponde ao seu padrão de acesso.

**Políticas de Ciclo de Vida S3: O Sistema de Arquivamento Automatizado**

Mover arquivos manualmente entre classes de armazenamento é propenso a erros e demorado. As **políticas de ciclo de vida** do S3 automatizam isso com base em regras que você define.

Uma regra de ciclo de vida tem dois componentes:

**Filtro**: A quais objetos a regra se aplica (todos os objetos, objetos com um prefixo específico, objetos com tags específicas).

**Ações**: O que fazer, após quantos dias.

Exemplo de política de ciclo de vida para os recibos de pedidos da Nimbus:

```
Transição para S3 Standard-IA após 90 dias
Transição para S3 Glacier Instant Retrieval após 365 dias
Transição para S3 Glacier Deep Archive após 2555 dias (7 anos)
Excluir após 2920 dias (8 anos)
```

Esta política única garante:

- Recibos ativos (< 90 dias): S3 Standard, acesso rápido
- Recibos recentes (90-365 dias): Standard-IA, barato mas disponível instantaneamente
- Recibos históricos (1-7 anos): Glacier, muito barato, raramente necessário
- Recibos expirados (> 8 anos): Excluídos automaticamente

Tom revisou a economia projetada: de US$ 847/mês para cerca de US$ 220/mês.

"Apenas... definindo o que é antigo e para onde deve ir?" disse ele.

"E o S3 move automaticamente," confirmou Leo. "Sem cron job. Sem migração manual. Sem esquecer."

**S3 Intelligent-Tiering: A Classe Auto-Organizável**

E se você não sabe com que frequência acessará seus dados?

O **S3 Intelligent-Tiering** monitora os padrões de acesso para cada objeto e o move automaticamente entre as camadas de acesso:

- **Camada de Acesso Frequente**: Para objetos acessados recentemente
- **Camada de Acesso Infrequente**: Objetos não acessados por 30 dias
- **Camada de Acesso Instantâneo ao Arquivo**: Objetos não acessados por 90 dias
- **Camada de Acesso ao Arquivo**: Objetos não acessados por 90-730 dias (opcional)
- **Camada de Acesso ao Arquivo Profundo**: Objetos não acessados por 180-730+ dias (opcional)

O S3 Intelligent-Tiering cobra uma pequena taxa de monitoramento por objeto por mês (US$ 0,0025 por 1.000 objetos), mas sem taxa de recuperação para as camadas Frequente e Infrequente.

Use o Intelligent-Tiering quando:

- Os padrões de acesso são imprevisíveis ou mudam com o tempo
- Você tem uma mistura de dados quentes e frios que não consegue classificar facilmente
- Você tem objetos maiores que 128 KB (objetos pequenos custam mais em taxas de monitoramento do que economizam)

Use classes de armazenamento explícitas (com políticas de ciclo de vida) quando:

- Os padrões de acesso são previsíveis
- Você quer minimizar as cobranças de monitoramento por objeto
- Os objetos são pequenos (< 128 KB)

**Upload Multipart: Para Objetos Grandes**

O S3 tem um limite de upload único de 5 GB. Para objetos maiores, você deve usar o **upload multipart**: dividir o objeto em partes, fazer o upload de cada uma em paralelo e o S3 as monta.

Benefícios:

- Uploads mais rápidos (paralelo)
- Pode retomar uploads com falha (só faz o upload novamente das partes com falha)
- Obrigatório para objetos > 5 GB

Dica de regra de ciclo de vida: Defina uma regra de ciclo de vida para excluir uploads multipart incompletos após 7 dias. Se um upload falhar no meio do caminho e não for limpo, essas partes parciais ficam armazenadas e são cobradas — sem um objeto montado para mostrar por isso.

Tom apreciou muito essa dica.

**Replicação S3: Copiando Dados Entre Buckets**

O S3 pode replicar automaticamente objetos de um bucket para outro:

**Replicação na Mesma Região (SRR)**: Copiar objetos dentro da mesma região. Use para conformidade (manter uma cópia separada em uma conta diferente), agregar logs de vários buckets ou criar ambientes de teste a partir de dados de produção.

**Replicação Entre Regiões (CRR)**: Copiar objetos para uma região diferente. Use para recuperação de desastres (redundância de dados entre regiões), conformidade (os dados devem estar em uma geografia específica) e menor latência para usuários globais.

A replicação não é uma solução de backup — se você excluir um objeto no bucket de origem, ele será excluído na réplica (a menos que a replicação do marcador de exclusão esteja desabilitada). Use o AWS Backup ou o versionamento com bloqueio de objeto para backup.

**Bloqueio de Objeto S3: Imutabilidade para Conformidade**

Alguns regulamentos exigem que os dados sejam **imutáveis** — uma vez escritos, não podem ser modificados ou excluídos por um período especificado.

O **Bloqueio de Objeto S3** implementa o armazenamento WORM (Escrever Uma Vez, Ler Muitas Vezes):

**Período de retenção**: Os objetos não podem ser excluídos ou sobrescritos por uma duração especificada.

**Retenção legal**: Os objetos não podem ser excluídos, independentemente do período de retenção, até que a retenção legal seja explicitamente removida.

Use o Bloqueio de Objeto S3 para setores regulamentados: registros financeiros (SEC Regra 17a-4), registros de saúde (HIPAA), arquivos de conformidade.

## Pontos Fortes e Limitações

**Por que as camadas de armazenamento S3 importam**:

- Redução significativa de custos sem sacrificar durabilidade ou disponibilidade para o que é realmente acessado
- Políticas de ciclo de vida automatizam todo o processo — sem sobrecarga operacional
- O S3 Intelligent-Tiering elimina a necessidade de prever padrões de acesso

**Onde fica complicado**:

- Cobranças de duração mínima de armazenamento se aplicam às classes Glacier (90 dias para Glacier Instant, 180 dias para Deep Archive) — excluir antes ainda incorre na cobrança mínima
- Taxas de recuperação podem surpreender se você acessar dados arquivados com frequência
- As transições de ciclo de vida levam tempo — os objetos não são movidos instantaneamente após o disparo da regra
- As taxas de monitoramento do Intelligent-Tiering se acumulam para buckets com milhões de objetos pequenos

## Resumo

- O S3 tem sete classes de armazenamento: Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval e Glacier Deep Archive.
- As **políticas de ciclo de vida** automatizam as transições entre classes de armazenamento com base na idade — defina uma vez, o S3 lida com isso para sempre.
- O **S3 Intelligent-Tiering** move automaticamente os objetos entre camadas com base nos padrões de acesso reais — use para cargas de trabalho imprevisíveis.
- O **upload multipart** é obrigatório para objetos > 5 GB e recomendado para qualquer coisa > 100 MB.
- A **Replicação S3** (SRR e CRR) copia objetos entre buckets e regiões — para DR, conformidade ou agregação.
- O **Bloqueio de Objeto S3** fornece armazenamento WORM para cenários de conformidade.

## Dicas para o Exame

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado (Domínio 4, Tarefa 4.1)*

- **Sinais de seleção de classe de armazenamento**:
  - "Acessado com frequência" → Standard
  - "Acessado uma vez por mês, precisa de recuperação instantânea" → Standard-IA
  - "Pode tolerar horas de tempo de recuperação, raramente acessado" → Glacier Flexible Retrieval
  - "Conformidade regulatória, retenção de 7+ anos, nunca acessado" → Glacier Deep Archive
  - "Padrões de acesso desconhecidos ou variáveis" → Intelligent-Tiering
- **Padrões de exame de política de ciclo de vida**: "reduzir automaticamente os custos de armazenamento à medida que os dados envelhecem," "transição para arquivo após 90 dias" → políticas de ciclo de vida.
- **Taxa de monitoramento do Intelligent-Tiering**: Pequena taxa por objeto. Para grandes quantidades de objetos pequenos, isso pode exceder a economia. O exame pode testar isso.
- **Requisitos do CRR**: O versionamento deve estar habilitado nos buckets de origem e destino. A origem e o destino devem estar em regiões diferentes.
- **Bloqueio de Objeto S3**: "WORM," "imutável," "SEC 17a-4," "não pode ser excluído ou modificado" → Bloqueio de Objeto. Modo de governança (pode ser substituído por administradores). Modo de conformidade (não pode ser substituído por ninguém, incluindo o usuário root).
- **Restauração do Glacier**: Objetos no Glacier não estão disponíveis imediatamente. Você deve "restaurar" uma cópia para o S3 Standard para acesso. A cópia restaurada é temporária (você define a duração). O original permanece no Glacier.

## Exercícios

**Exercício 1 — Recordação**

Explique a diferença entre S3 Standard-IA e S3 Glacier Instant Retrieval. Qual padrão de acesso torna cada um adequado?

*(Dica: Pense em com que frequência você acessaria os dados e com que rapidez precisa deles quando os acessa.)*

**Exercício 2 — Prática para o Exame**

*Cenário*: Uma empresa gera 500 GB de logs de aplicação diariamente. Os logs são intensamente consultados nos primeiros 7 dias (depuração e monitoramento). Após 7 dias, os logs são raramente acessados, mas devem estar disponíveis em até 30 minutos se necessário. Após 1 ano, os logs devem ser retidos para conformidade, mas nunca são acessados. A empresa precisa minimizar os custos de armazenamento mantendo esses requisitos.

Qual política de ciclo de vida S3 MELHOR atende a esses requisitos?

A) Armazenar no S3 Standard por 7 dias; transição para S3 Glacier Deep Archive após 7 dias; expirar após 365 dias  
B) Armazenar no S3 Standard por 7 dias; transição para S3 Standard-IA após 7 dias; transição para S3 Glacier Flexible Retrieval após 365 dias  
C) Armazenar todos os logs no S3 Intelligent-Tiering desde o primeiro dia  
D) Armazenar no S3 Standard por 7 dias; transição para S3 Glacier Instant Retrieval após 7 dias; transição para S3 Glacier Deep Archive após 365 dias

**Dica 1**: "Disponível em 30 minutos" elimina qual classe de armazenamento?

**Dica 2**: O Deep Archive leva 12 horas para recuperar — não atende ao requisito de 30 minutos para os dias 7-365.

**Dica 3**: Após 365 dias, o tempo de recuperação não importa (nunca acessado), então a opção mais barata se aplica.

**Resposta**: D

**Explicação**: S3 Standard por 7 dias lida com o acesso frequente. O Glacier Instant Retrieval fornece acesso em milissegundos para os dias 7-365 — atendendo ao requisito de 30 minutos a um custo significativamente menor do que o Standard-IA. Após 365 dias, o Glacier Deep Archive é a opção mais barata para dados que nunca são acessados.

**Por que não A?** O Glacier Deep Archive leva 12 horas para recuperar — não atende ao requisito de "disponibilidade em 30 minutos" para os dias 7-365.

**Por que não B?** Standard-IA após 7 dias funciona, mas o Glacier Instant Retrieval é significativamente mais barato. O Standard-IA é mais adequado quando você precisa de recuperação instantânea, mas o acesso é infrequente — aqui, os dados são raramente acessados depois do dia 7, tornando o Glacier mais econômico.

**Por que não C?** O Intelligent-Tiering tem uma taxa de monitoramento por objeto e pode não mover os logs para camadas de arquivo tão agressivamente quanto regras de ciclo de vida explícitas. Para um grande volume de logs com um padrão de acesso previsível, regras de ciclo de vida explícitas são mais econômicas.

*Domínio SAA-C03: Projetar Arquiteturas com Custo Otimizado — Tarefa 4.1*

**Exercício 3 — Desafio de Arquitetura** *(Opcional)*

A Nimbus tem três tipos de dados S3 com características diferentes:

- Fotos de restaurantes: enviadas uma vez, acessadas muitas vezes pelos clientes, nunca excluídas
- Recibos de pedidos: acessados pelos clientes no primeiro mês, mantidos por 7 anos para fins fiscais
- Exportações de análises: geradas diariamente, analisadas na semana seguinte, mantidas por 2 anos

Projete uma política de ciclo de vida para cada um. Para as fotos de restaurantes, o Intelligent-Tiering faria sentido? Para os recibos de pedidos, qual classe de armazenamento cobre a janela de 1 mês a 7 anos? Para as exportações de análises, como você estruturaria o bucket para aplicar políticas diferentes a prefixos diferentes?

*(Não há uma única resposta correta. O objetivo é praticar a seleção de camadas de armazenamento para dados do mundo real.)*

## Cena Pós-Créditos

Tom implementou as políticas de ciclo de vida.

A conta do S3 caiu de US$ 847 para US$ 198 no mês seguinte.

Ele imprimiu a comparação e colocou na mesa de Maya sem dizer nada.

Maya olhou para ela. Depois para a data. Depois para Tom.

"Três semanas," disse ela.

"Uma tarde para projetar as políticas," disse ele. "Uma hora para implementá-las. Três semanas para ver o primeiro ciclo de faturamento completo."

"Redução de dois terços nos custos de S3."

"Para dados que não acessamos."

Maya olhou para os números novamente.

"Tom," disse ela, "quero que você faça essa revisão para cada serviço AWS que usamos. Armazenamento, computação, rede. Encontre o desperdício."

Ele já estava de volta à mesa.

"Comecei na semana passada," disse ele.

No próximo capítulo: a camada de banco de dados tem sua própria versão desta conversa, e o Aurora é a resposta que Tom não esperava gostar.
