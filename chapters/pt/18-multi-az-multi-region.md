# Capítulo 18: Quando as Coisas Falham

Este capítulo é sobre falhas — planeadas, projectadas e finalmente aceites como inevitáveis. Pode ser o capítulo mais importante do livro.

Nimbus estava a funcionar bem. As camadas de segurança estavam em vigor. A monitorização estava activa. O tráfego estava a crescer.

Depois Leo recebeu uma notificação Slack às 23:23 de uma quinta-feira.

"us-east-1 Zona de Disponibilidade us-east-1b — falha de hardware — serviço degradado."

Abriu a consola AWS. As instâncias EC2 em us-east-1b estavam a mostrar falhas nas verificações de estado. O Auto Scaling Group tinha detectado instâncias insalubres e estava a lançar substituições — em us-east-1b.

Na zona que estava a falhar.

As novas instâncias também não conseguiam iniciar. Estavam na mesma zona de falha de hardware.

"O balanceador de carga está a encaminhar tráfego para ambas as AZs," disse Leo para ninguém. "Metade do tráfego vai para instâncias que não funcionam."

Vinte e dois minutos de serviço degradado antes de notar e deslocar manualmente o ASG para usar apenas us-east-1a.

"Isto aconteceu porque tudo estava numa AZ," disse Priya na manhã seguinte.

"Não," disse Leo. "Tinha instâncias em duas AZs. O problema era que as instâncias de substituição estavam a ser criadas na AZ em falha."

"E a base de dados?"

Leo parou.

"A instância RDS é Multi-AZ," disse ele. "O standby está em us-east-1b. Que estava a falhar. E o RDS tentou fazer failover para o standby, que também falhou."

Vinte e dois minutos de serviço degradado tinham-se tornado trinta e oito.

**A Analogia da Rede Eléctrica**

Pense em como a sua casa recebe electricidade. A energia não vem de um único fio ligado a um único gerador. Vem de uma rede — uma teia de geradores, subestações e linhas de transmissão que se apoiam mutuamente. Se uma subestação apanhar fogo, as outras reencaminham a energia em seu redor. Não nota. As luzes ficam acesas.

As Zonas de Disponibilidade AWS funcionam da mesma forma. Em vez de um enorme centro de dados de que tudo depende, a AWS distribui os seus recursos por múltiplas instalações fisicamente separadas. Se uma instalação perde energia ou tem uma falha de hardware, as outras continuam a funcionar. O tráfego é reencaminhado automaticamente. A aplicação mantém-se activa — porque nunca havia um único fio para cortar.

Multi-Região é o próximo nível: imagine ter geradores de reserva numa cidade completamente diferente. Se toda a rede eléctrica local cair, a cidade remota assume. Mais complexo de configurar, mas mais resiliente a falhas catastróficas.

**O Vocabulário da Falha**

Antes de projectar para resiliência, precisa de palavras para o que está a projectar.

**Disponibilidade**: A percentagem de tempo que um sistema está operacional. "Quatro noves" (99,99%) significa menos de 52 minutos de tempo de inactividade por ano. "Cinco noves" (99,999%) significa cerca de 5 minutos por ano.

**RTO (Recovery Time Objective)**: Quanto tempo pode o sistema estar em baixo antes de se tornar um problema de negócio? Se o RTO for de 4 horas, tem 4 horas para restaurar o serviço antes de os SLAs serem violados.

**RPO (Recovery Point Objective)**: Quanta data pode perder? Se o RPO for de 1 hora, pode tolerar perder até uma hora de dados numa falha catastrófica. Tudo escrito na última hora antes da falha desapareceu.

**Tolerância a falhas**: A capacidade de continuar a operar (a algum nível) quando um componente falha.

**Recuperação de desastres (DR)**: O processo de recuperação de uma falha catastrófica — incêndio de centro de dados, paragem de toda a região, eliminação acidental em massa.

Estes cinco conceitos conduzem cada decisão arquitectural neste capítulo.

**Multi-AZ: Sobreviver a Falhas de Zona de Disponibilidade**

Uma Zona de Disponibilidade (AZ) é um centro de dados fisicamente separado dentro de uma Região. As AZs são projectadas para ser independentes: fontes de energia separadas, arrefecimento separado, infraestrutura de rede separada. Mas estão suficientemente perto para que a latência de rede entre elas seja de 1 a 2 milissegundos.

As **implantações Multi-AZ** distribuem recursos por duas ou mais AZs dentro de uma Região. Se uma AZ falhar:

- O balanceador de carga para de encaminhar para instâncias insalubres na AZ falhada
- O Auto Scaling Group substitui instâncias — mas na AZ *saudável*
- O RDS faz failover para o standby na AZ saudável

O erro de Leo: o Auto Scaling Group não estava configurado para limitar as instâncias de substituição a AZs saudáveis. Estava configurado para manter o equilíbrio entre AZs. Quando us-east-1b falhou, o ASG tentou equilibrar a contagem de instâncias lançando substituições em us-east-1b — a AZ em falha.

A correcção: configurar o ASG para lançar apenas em AZs saudáveis, com um mínimo de duas AZs sempre activas.

A lição mais profunda: testar os cenários de falha antes de acontecerem em produção.

**Simular Falhas: Engenharia do Caos**

"Como sabemos que a configuração Multi-AZ realmente funciona?" perguntou Maya.

"Quebramos coisas de propósito," disse Leo.

Isto parece imprudente. É na verdade a coisa mais responsável que uma equipa pode fazer.

A **engenharia do caos** é a prática de injectar intencionalmente falhas no sistema para verificar que as trata correctamente. Deliberadamente termina uma instância EC2. Faz manualmente failover da instância RDS. Bloqueia uma sub-rede do balanceador de carga.

Se o sistema recuperar automaticamente dentro do RTO, o design funciona.

Se não, aprendeu isso num ambiente controlado — não durante um incidente de produção às 2 da manhã.

Para Nimbus: Leo escreveu um runbook (um procedimento documentado) para testar cada cenário de falha. Uma vez por trimestre, falhariam intencionalmente um componente e mediriam o tempo de recuperação. Se a recuperação demorasse mais do que o RTO, corrigiriam o design.

**Multi-Região: Sobreviver a Falhas Regionais**

A maioria das falhas AWS afecta Zonas de Disponibilidade, não Regiões inteiras. As falhas regionais são raras — mas acontecem.

Numa falha regional (ou para aplicações globais que precisam de latência muito baixa em todo o lado), **Multi-Região** é a resposta: implantar a aplicação em duas ou mais Regiões AWS.

Multi-Região introduz complexidade fundamental:

**Replicação de dados**: As bases de dados precisam de estar em sincronismo entre regiões. Quaisquer dados escritos em us-east-1 devem eventualmente alcançar eu-west-1. "Eventualmente" é o problema — durante o atraso, as regiões têm visões ligeiramente diferentes do mundo.

**Activo-passivo vs. activo-activo**:

- **Activo-passivo**: Uma região serve todo o tráfego. A outra é um standby aquecido. Em caso de falha, o DNS muda o tráfego para o standby. Mais simples, mas o standby está inactivo e é caro.
- **Activo-activo**: Ambas as regiões servem tráfego simultaneamente. Mais complexo de construir (requer resolução de conflitos para escritas concorrentes), mas menor latência globalmente e sem recursos inactivos.

**Tempo de failover**: As alterações DNS demoram tempo a propagar (dependendo do TTL). Durante a janela de propagação, alguns utilizadores ainda vão para a região falhada. Projectar para RTO muito baixo requer pré-aquecimento do standby e minimizar o TTL antes de mudanças planeadas.

**Estratégias de Recuperação de Desastres: Um Espectro**

Existem quatro estratégias DR comuns, dispostas da mais barata (e mais lenta para recuperar) para a mais cara (e mais rápida para recuperar):

**Cópia de Segurança e Restauro** (RPO/RTO de horas):

- Fazer cópia de segurança de tudo para S3 numa região diferente
- Em caso de desastre: provisionar infraestrutura do zero, restaurar da cópia de segurança
- Custo: muito baixo (apenas paga armazenamento)
- Tempo de recuperação: horas

**Luz Piloto** (RPO/RTO de minutos a 1 hora):

- Manter uma versão mínima da aplicação a correr na região DR (a "luz piloto" que pode ser rapidamente aumentada)
- Os dados centrais são replicados (réplica de leitura RDS na região DR)
- Em caso de desastre: aumentar escala na região DR, promover a réplica de leitura para primária, mudar DNS
- Custo: moderado (paga por um pequeno rastilho a correr)
- Tempo de recuperação: dezenas de minutos

**Standby Aquecido** (RPO/RTO de segundos a minutos):

- Correr uma versão reduzida de toda a aplicação na região DR
- Totalmente operacional mas com capacidade reduzida
- Em caso de desastre: aumentar escala, mudar DNS
- Custo: mais alto (sempre a correr a pilha completa em escala reduzida)
- Tempo de recuperação: minutos

**Activo-Activo / Multi-Site** (RPO/RTO próximo de zero):

- Capacidade total em duas ou mais regiões, a servir tráfego simultaneamente
- Sem recuperação necessária — se uma região falhar, o tráfego encaminha para a outra automaticamente
- Custo: mais alto (duas implantações completas em escala completa)
- Tempo de recuperação: segundos (apenas propagação DNS)

Para Nimbus nesta fase: standby aquecido. Não podiam pagar activo-activo, mas cópia de segurança e restauro era demasiado lento para os requisitos de negócio.

**Amazon RDS: Multi-AZ vs. Réplicas de Leitura vs. Multi-Região**

Estes três são distintos e frequentemente confundidos:

| Funcionalidade | Multi-AZ                         | Réplica de Leitura   | Réplica de Leitura Multi-Região |
|----------------|----------------------------------|----------------------|----------------------------------|
| Propósito       | Alta disponibilidade (failover)  | Escalonamento de leitura | Escalonamento de leitura + DR |
| Sincronização de dados | Síncrona                 | Assíncrona           | Assíncrona                       |
| Failover        | Automático                       | Promoção manual      | Promoção manual                  |
| Legível?        | Não (standby é passivo)          | Sim                  | Sim                              |
| Inter-região?   | Não (mesma região)               | Sim (opcional)       | Sim                              |
| Usar para       | HA, RPO~0                        | Carga de leitura     | Recuperação de desastres         |

Insight chave: O standby Multi-AZ é **síncrono** — cada escrita para o primário é confirmada no standby antes de a escrita ser reconhecida. Isto significa que se o primário falhar, nenhum dado se perde. RPO = 0.

As réplicas de leitura são **assíncronas** — existe desfasamento de replicação. Se o primário falhar e promover uma réplica de leitura, pode perder segundos ou minutos de escritas recentes. RPO > 0.

## Pontos Fortes e Limitações

**Multi-AZ**:

- Essencial para cargas de trabalho de produção — AZ única é um ponto único de falha
- Bem suportado pelos serviços AWS (RDS, ElastiCache, EKS, ALB todos suportam Multi-AZ)
- Custo de overhead relativamente baixo comparado com a protecção que fornece

**Multi-Região**:

- Complexo de implementar correctamente, especialmente para bases de dados
- Os requisitos de residência/soberania de dados podem na verdade exigi-lo (dados de utilizadores UE devem ficar na UE)
- Os benefícios de latência para utilizadores globais vêm do encaminhamento, não de multi-região per se (use CloudFront para conteúdo estático)
- A maioria das organizações não precisa de activo-activo; a maioria sub-investe em standby aquecido

## Resumo

- **RTO** (Recovery Time Objective): quanto tempo pode estar em baixo. **RPO** (Recovery Point Objective): quanta data pode perder.
- **Multi-AZ** distribui recursos pelas Zonas de Disponibilidade dentro de uma Região. Protege contra falhas de AZ.
- **Multi-Região** implanta em múltiplas Regiões AWS. Protege contra falhas regionais e serve utilizadores globais com menor latência.
- Estratégias DR (da mais barata para a mais cara): Cópia de Segurança & Restauro → Luz Piloto → Standby Aquecido → Activo-Activo.
- Standby Multi-AZ RDS: síncrono, failover automático, RPO = 0. Réplicas de leitura: assíncronas, promoção manual, RPO > 0.
- Teste as falhas intencionalmente (engenharia do caos) antes de acontecerem em produção.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Resilientes (Domínio 2, Tarefa 2.2)*

- **RTO vs RPO**: Espere que o exame dê requisitos ("a organização pode tolerar no máximo 1 hora de tempo de inactividade e nenhuma perda de dados") e peça para escolher a estratégia DR correcta. Mapa: sem perda de dados = replicação síncrona = Multi-AZ ou activo-activo. 1 hora de tempo de inactividade = cópia de segurança e restauro é demasiado lento; standby aquecido pode funcionar.
- **Multi-AZ RDS vs Réplicas de Leitura**: O exame perguntará por HA (Multi-AZ) vs. escalonamento de leitura (réplicas de leitura). O standby Multi-AZ não é legível. As réplicas de leitura podem ser promovidas para primária (manualmente) para DR.
- **Luz Piloto vs Standby Aquecido**: A Luz Piloto tem infraestrutura mínima a correr (apenas a replicação de dados). O Standby Aquecido tem uma aplicação funcional mas reduzida a correr. A diferença é a rapidez com que pode aumentar escala.
- **Aurora Global Database**: Funcionalidade específica Aurora para activo-passivo multi-região. A região primária serve escritas; as regiões secundárias servem leituras com lag de replicação <1 segundo. Em failover, a secundária pode ser promovida em <1 minuto. Sinal do exame: "Aurora, multi-região, RTO < 1 minuto."
- **AWS Backup**: Serviço de cópia de segurança centralizado para EBS, RDS, DynamoDB, EFS, Storage Gateway. O exame usa-o para cenários de cópia de segurança e restauro.
- **Failover Route 53**: Camada DNS de DR. Falha de verificação de saúde primária → Route 53 encaminha para secundária. O tempo de propagação significa que não é instantâneo.

## Exercícios

**Exercício 1 — Recordar**

Explique a diferença entre RTO e RPO. Por que razão pode uma organização ter um RTO baixo (não pode estar em baixo durante muito tempo) mas um RPO alto (pode tolerar perder dados recentes)?

*(Sugestão: Pense num negócio onde é mais importante servir clientes rapidamente do que preservar cada transacção.)*

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa de saúde corre um sistema de registos de pacientes em RDS PostgreSQL em `us-east-1`. Os requisitos regulatórios exigem que os dados dos pacientes nunca se percam (RPO = 0). O sistema pode tolerar até 30 minutos de tempo de inactividade (RTO = 30 minutos) num desastre. O custo é uma preocupação.

Qual arquitectura MELHOR satisfaz estes requisitos?

A) RDS Multi-AZ em `us-east-1` com cópias de segurança automatizadas diárias para S3 em `us-west-2`  
B) RDS Multi-AZ em `us-east-1` com uma réplica de leitura em `us-west-2` configurada para promoção manual  
C) RDS em `us-east-1` com um standby aquecido em `us-west-2` e replicação activo-activo  
D) Aurora Global Database com primária em `us-east-1` e secundária em `us-west-2`

**Sugestão 1**: RPO = 0 significa sem perda de dados, o que requer replicação síncrona ou próxima de síncrona.

**Sugestão 2**: RTO = 30 minutos significa que tem tempo para intervenção manual. Não precisa de failover automático de milissegundos.

**Sugestão 3**: Qual opção fornece protecção Multi-AZ (RPO = 0 dentro da região) mais capacidade DR inter-região?

**Resposta**: A

**Explicação**: O RDS Multi-AZ em us-east-1 fornece replicação síncrona para o standby na mesma região — RPO = 0 para falhas de AZ. As cópias de segurança automatizadas diárias para S3 em us-west-2 fornecem DR inter-região. Numa falha regional completa, restaura da cópia de segurança S3 em us-west-2 — dentro de 30 minutos para uma base de dados pequena. Isto é custo-eficiente e satisfaz ambos os requisitos.

**Por que não B?** As réplicas de leitura são assíncronas — pode haver lag de replicação. Se o primário falhar, os dados escritos desde a última sincronização da réplica são perdidos. RPO > 0, o que viola o requisito.

**Por que não C?** "Replicação activo-activo" para PostgreSQL entre regiões é complexo de implementar e não é uma funcionalidade RDS padrão. Esta opção é tecnicamente difícil e cara.

**Por que não D?** O Aurora Global Database funcionaria mas é significativamente mais caro do que o RDS Multi-AZ. O cenário diz que o custo é uma preocupação, e o Aurora tem preços premium.

*Domínio SAA-C03: Projectar Arquitecturas Resilientes — Tarefa 2.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Nimbus foi seleccionado para fornecer serviços de encomendas para um grande festival de comida em Seattle. Durante 72 horas, esperam 50 vezes o tráfego normal, com tolerância zero para tempo de inactividade (o contrato do organizador do festival especifica penalidades financeiras para qualquer tempo de inactividade durante o evento).

Projecte uma estratégia DR para a janela do festival especificamente. Mudaria para activo-activo durante essas 72 horas? Como pré-testaria o failover? Qual seria o RTO e como o validaria antes do evento?

*(Não existe uma resposta única correcta. O objectivo é praticar o design de DR para requisitos SLA específicos.)*

## Cena Pós-Créditos

Leo construiu o runbook de engenharia do caos.

Cada trimestre, numa janela de manutenção planeada, a equipa:

1. Terminaria uma instância EC2 em us-east-1a e observaria o ASG substituí-la correctamente
2. Forçaria manualmente um failover Multi-AZ RDS e verificaria que a aplicação voltava a ligar em 60 segundos
3. Simularia uma falha completa de us-east-1b ajustando as zonas de disponibilidade do ASG
4. Restauraria uma cópia de segurança com uma semana de atraso para uma nova instância RDS e verificaria que os dados pareciam correctos

Na primeira vez que correram, o passo 2 demorou 4 minutos e 17 segundos.

"O nosso compromisso de RTO com parceiros de restaurante é 5 minutos," disse Tom.

"Portanto passámos. Por pouco."

"O que aconteceria se o failover demorasse mais de 5 minutos num incidente real?"

Maya respondeu: "Estaríamos em violação do SLA. Há uma penalidade financeira nos contratos."

Leo fixou o 4:17 no ecrã.

"Então precisamos de o tornar mais rápido," disse ele. E começou a ler a documentação do Aurora.

No próximo capítulo: a máquina de senhas que deixa cada parte de Nimbus trabalhar ao seu próprio ritmo.
