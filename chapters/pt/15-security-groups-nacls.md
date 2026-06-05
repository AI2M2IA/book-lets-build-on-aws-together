# Capítulo 15: Os Guardas no Portão

A antiga chave de implantação da primeira versão de Nimbus ainda estava activa. Tinha feito três chamadas API na semana passada. Leo não sabia o que as tinha feito.

Priya abriu os logs de fluxo VPC — registos de tráfego de rede que mostram cada conexão para dentro e para fora do VPC.

"Na terça-feira às 2:17 da manhã," disse ela, "havia uma conexão de saída da instância EC2 a correr a antiga API para um endereço IP na Roménia."

"Isso não é a nossa infraestrutura," disse Leo.

"Não."

"Portanto alguém estava na nossa instância EC2."

"Ou algo."

Rastrearam a origem: a antiga chave de implantação tinha sido usada para carregar um pequeno script para a instância EC2. O script tinha tentado fazer scan de portas em servidores adjacentes. A maioria dos scans tinham falhado.

"Os grupos de segurança bloquearam-nos," disse Priya. "O atacante entrou numa instância EC2. Não conseguia alcançar as outras porque os grupos de segurança só permitiam tráfego do balanceador de carga."

"Portanto o dano ficou contido."

"Porque tínhamos grupos de segurança correctamente configurados. Imagine se tivéssemos deixado a porta 5432 aberta para qualquer instância EC2 na conta."

Leo não precisou de imaginar. Tinha visto essa configuração na configuração original.

**Duas Camadas de Segurança de Rede**

Num VPC, tem duas ferramentas distintas para controlar o tráfego de rede:

**Grupos de Segurança**: Firewalls virtuais associados a recursos individuais (instâncias EC2, bases de dados RDS, balanceadores de carga, funções Lambda num VPC). Operam ao nível do recurso.

**ACLs de Rede (NACLs)**: Regras de firewall associadas a sub-redes. Operam na fronteira da sub-rede — antes do tráfego alcançar qualquer recurso nessa sub-rede.

Perceber ambas requer perceber uma diferença crítica: **com estado vs. sem estado**.

**Com Estado: Grupos de Segurança**

Um grupo de segurança é **com estado**.

Quando permite tráfego de entrada numa porta específica, o tráfego de resposta é automaticamente permitido para fora, mesmo que não haja uma regra de saída explícita para isso.

Quando permite tráfego de saída para um destino, a resposta que regressa é automaticamente permitida.

Pense num segurança com estado num edifício de escritórios. Mostra o crachá para entrar. Sai mais tarde. O segurança não precisa de o verificar novamente na saída — o sistema sabe que foi deixado entrar e tem permissão para sair.

**Regras de Grupo de Segurança para a instância EC2 da API Nimbus:**

- **Entrada — TCP 8080 — do SG do Balanceador de Carga** → Aceitar tráfego API do ALB
- **Entrada — TCP 22 — do SG do Host Bastião** → SSH apenas do bastião
- **Saída — TCP 5432 — para o SG RDS** → Ligar ao PostgreSQL
- **Saída — TCP 6379 — para o SG ElastiCache** → Ligar ao Redis
- **Saída — TCP 443 — para 0.0.0.0/0** → HTTPS para APIs externas

Repare: sem regra de saída explícita para a porta 8080. A regra de entrada é com estado — o tráfego de resposta (a resposta da API ao balanceador de carga) é automaticamente permitido.

Repare também: as regras do grupo de segurança referenciam *outros grupos de segurança*, não endereços IP. "Permitir entrada do grupo de segurança do balanceador de carga" significa "permitir tráfego de qualquer recurso que tenha este grupo de segurança associado." Isto é mais flexível e manutenível do que rastrear endereços IP.

**Comportamento por defeito:**

- Por defeito, todo o tráfego de entrada é negado
- Por defeito, todo o tráfego de saída é permitido
- Todas as regras são avaliadas (os grupos de segurança não têm regras ordenadas — todas as regras correspondentes se aplicam)
- Os grupos de segurança só podem **permitir** tráfego — não pode criar regras de negação explícitas

**Sem Estado: ACLs de Rede**

Uma NACL é **sem estado**.

Quando permite tráfego de entrada na porta 8080, isso cobre apenas a entrada. A resposta (tráfego de saída nas portas efémeras) deve ser explicitamente permitida com uma regra de saída.

Pense num detector de metais. Passa por ele na entrada. O detector de metais não sabe que já passou — tem de passar de novo na saída.

**As regras NACL são numeradas e avaliadas em ordem.** A primeira regra que corresponde ganha. A regra 100 é avaliada antes da regra 200. Se a regra 100 negar tráfego e a regra 200 o permitir, o tráfego é negado.

As NACLs podem **negar** explicitamente tráfego — ao contrário dos grupos de segurança, que só podem permitir. Isto torna-as úteis para bloquear intervalos IP específicos.

**Comportamento NACL por defeito:**

- A NACL por defeito (criada com o VPC) permite todo o tráfego de entrada e saída
- Uma NACL personalizada nega todo o tráfego por defeito (deve permitir explicitamente o que quer)

**NACL para a sub-rede pública (simplificada):**

*Regras de entrada (avaliadas em ordem — a primeira correspondência ganha):*

- Regra 100: TCP 443, de 0.0.0.0/0 → **Permitir** (HTTPS)
- Regra 110: TCP 80, de 0.0.0.0/0 → **Permitir** (HTTP)
- Regra 120: TCP 1024–65535, de 0.0.0.0/0 → **Permitir** (portas de retorno efémeras)
- Regra \*: Todo o tráfego → **Negar**

*Regras de saída:*

- Regra 100: TCP 443, para 0.0.0.0/0 → **Permitir** (HTTPS)
- Regra 110: TCP 80, para 0.0.0.0/0 → **Permitir** (HTTP)
- Regra 120: TCP 1024–65535, para 0.0.0.0/0 → **Permitir** (portas de retorno efémeras)
- Regra \*: Todo o tráfego → **Negar**

A Regra 120 (portas 1024-65535) permite portas efémeras — as portas temporárias de números altos usadas para tráfego de resposta TCP. Como as NACLs são sem estado, deve permitir explicitamente estas saídas, ou as respostas do servidor não passarão.

**Quando Usar Qual**

Use **grupos de segurança** para a camada primária de controlo de acesso. São mais fáceis de gerir, com estado (menor probabilidade de bloqueios acidentais por se esquecer de portas efémeras), e suportam referenciar outros grupos de segurança.

Use **NACLs** para controlos ao nível da sub-rede, especialmente:

- **Regras de negação explícita**: Bloquear um endereço IP ou intervalo específico de alcançar uma sub-rede inteira
- **Bloqueio de emergência**: Um IP está a atacar activamente — adicionar uma regra de negação NACL para bloquear a sub-rede inteira antes de alcançar qualquer recurso

"Portanto o grupo de segurança é o controlo refinado," disse Maya, "e a NACL é o traço amplo?"

"Os grupos de segurança protegem recursos individuais," confirmou Priya. "As NACLs protegem sub-redes inteiras. Quando quer bloquear um IP de alcançar qualquer coisa na sua rede, NACL. Quando quer permitir apenas o balanceador de carga alcançar o servidor API, grupo de segurança."

**O Incidente: O Que as Camadas Apanharam**

Voltando ao ataque do IP romeno:

**O que aconteceu**: O atacante usou a chave de implantação comprometida para carregar um script de scan para uma instância EC2. O script tentou ligar-se a outros serviços.

**O que os parou**:

- O grupo de segurança RDS só permitia entrada na porta 5432 do grupo de segurança EC2 da API. O script não conseguia alcançar a base de dados a partir de uma ferramenta de scan — não estava a associar o grupo de segurança correcto.
- O grupo de segurança ElastiCache só permitia entrada na porta 6379 do grupo de segurança EC2 da API.
- Outras instâncias EC2 só permitiam SSH do grupo de segurança do host bastião.

**O que não os parou**: 

- As regras de saída da instância EC2 permitiam HTTPS para 0.0.0.0/0 (necessário para downloads de pacotes). O script usou isto para fazer conexões de saída para o servidor do atacante.

Após o incidente, Priya adicionou:

- Uma regra NACL bloqueando o intervalo IP romeno
- Uma regra de saída mais restritiva nas instâncias EC2 (apenas permitia destinos específicos conhecidos como bons)

## Pontos Fortes e Limitações

**Grupos de Segurança**:

- Com estado (sem dores de cabeça de portas efémeras)
- Podem referenciar outros grupos de segurança (mais flexível do que IPs)
- Apenas regras de permitir — sem negação explícita
- Operam ao nível do recurso — granular

**NACLs**:

- Sem estado (requer regras explícitas para ambas as direcções incluindo portas efémeras)
- Podem negar explicitamente — útil para bloquear IPs conhecidamente maus
- Operam ao nível da sub-rede — traço mais amplo
- Regras numeradas avaliadas em ordem — previsível mas requer gestão cuidadosa

## Resumo

- Os **Grupos de Segurança** são firewalls virtuais com estado para recursos individuais. Apenas regras de permitir. Todas as regras avaliadas.
- As **NACLs** são firewalls sem estado para sub-redes inteiras. Regras de permitir e negar. Regras avaliadas por ordem numérica.
- **Com estado** significa que o tráfego de resposta é automaticamente permitido. **Sem estado** significa que deve permitir explicitamente tráfego em ambas as direcções.
- Os grupos de segurança são a sua camada primária de controlo de acesso. As NACLs são uma camada adicional para controlos ao nível da sub-rede e bloqueio explícito.
- Quando uma NACL permite tráfego de entrada, também deve permitir portas efémeras de saída (1024-65535) para que a resposta TCP passe.
- Os grupos de segurança podem referenciar-se uns aos outros — permitir tráfego "do grupo de segurança do balanceador de carga" é mais manutenível do que rastrear endereços IP.

## Dicas de Exame

*Domínio SAA-C03: Projectar Arquitecturas Seguras (Domínio 1, Tarefa 1.2)*

- **Com estado vs. sem estado**: Esta distinção é o conceito mais testado neste capítulo. Grupos de segurança = com estado = resposta permitida automaticamente. NACLs = sem estado = deve permitir explicitamente tráfego de resposta.
- **Regras de grupos de segurança**: Sem negação explícita. Quando múltiplos grupos de segurança estão associados a uma instância, a união de todas as regras se aplica. Todas as regras correspondentes são avaliadas.
- **Ordem de regras NACL**: As regras são avaliadas do número mais baixo para o mais alto. Regra 100 antes de 200. A primeira correspondência ganha. A regra `*` (asterisco) no fundo é a negação implícita.
- **Portas efémeras**: O erro clássico NACL é esquecer de permitir saída nas portas 1024-65535. Se a sua NACL permite entrada HTTP (porta 80) mas não permite saída nas portas efémeras, os utilizadores podem enviar pedidos mas nunca receber respostas.
- **Referência de grupos de segurança**: Pode permitir tráfego de outro grupo de segurança (não apenas de um IP). Este é o padrão recomendado para tráfego intra-VPC.
- **NACL por defeito vs. NACL personalizada**: A NACL por defeito permite todo o tráfego. Uma NACL personalizada (que cria) nega todo o tráfego por defeito. Cenário do exame: "criou uma nova NACL e agora o tráfego está bloqueado" → verificar regras de permitir em falta.

## Exercícios

**Exercício 1 — Recordar**

Uma programadora adiciona uma regra de entrada a um grupo de segurança permitindo tráfego na porta 443. Também precisa de adicionar uma regra de saída para permitir a resposta do servidor? Por que razão ou razão não?

Se em vez disso adicionar uma regra de entrada a uma NACL permitindo tráfego na porta 443, precisa de adicionar uma regra de saída? Por que razão ou razão não?

**Exercício 2 — Prática de Exame**

*Cenário*: Uma empresa tem uma aplicação web a correr em instâncias EC2 numa sub-rede pública. A aplicação aceita tráfego HTTPS (porta 443) da internet. Os utilizadores estão a relatar que conseguem ligar-se à aplicação mas não conseguem receber respostas — os pedidos ficam pendentes e expiram.

O grupo de segurança EC2 tem uma regra de entrada que permite TCP 443 de 0.0.0.0/0. A NACL da sub-rede tem uma regra de entrada (regra 100) que permite TCP 443 de 0.0.0.0/0 e uma regra de saída (regra 100) que permite TCP 443 para 0.0.0.0/0.

Qual é a causa MAIS provável do problema?

A) O grupo de segurança está em falta de uma regra de saída para TCP 443  
B) A NACL está em falta de uma regra de saída que permite portas efémeras (1024-65535)  
C) O grupo de segurança está em falta de uma regra de entrada para portas efémeras  
D) As instâncias EC2 não têm endereços Elastic IP

**Sugestão 1**: Os grupos de segurança são com estado — permitem respostas automaticamente. As NACLs são sem estado — não o fazem.

**Sugestão 2**: Quando um browser se liga a um servidor web na porta 443, a resposta do servidor viaja de volta numa porta efémera aleatória (1024-65535), não na porta 443.

**Sugestão 3**: A NACL tem uma regra de saída para a 443, mas a resposta não vai para a porta 443.

**Resposta**: B

**Explicação**: A NACL é sem estado. Quando os utilizadores se ligam ao servidor na porta 443, a resposta TCP do servidor viaja de volta numa porta efémera (escolhida aleatoriamente de 1024-65535). A regra de saída NACL só permite a porta 443, por isso a resposta é bloqueada pela regra de negação por defeito. Adicionar uma regra de saída NACL a permitir TCP 1024-65535 resolveria isto.

**Por que não A?** Os grupos de segurança são com estado — o tráfego de resposta é automaticamente permitido independentemente das regras de saída. Não é necessária nenhuma regra de saída do grupo de segurança.

**Por que não C?** As portas efémeras são para tráfego de resposta de saída, não de entrada. A conexão de entrada dos utilizadores chega na porta 443, que já é permitida.

**Por que não D?** Os Elastic IPs afectam se as instâncias têm IPs públicos, não se as conexões estabelecidas podem receber respostas.

*Domínio SAA-C03: Projectar Arquitecturas Seguras — Tarefa 1.2*

**Exercício 3 — Desafio de Arquitectura** *(Opcional)*

Após o ataque do IP romeno, Priya quer implementar dois controlos adicionais:

1. Bloquear o intervalo IP inteiro 185.0.0.0/8 de alcançar qualquer recurso na sub-rede pública
2. Garantir que a sub-rede privada contendo a base de dados nunca pode comunicar com a internet, mesmo que alguém configure incorrectamente um grupo de segurança

Que ferramentas usaria para cada requisito e como as configuraria? Poderia usar grupos de segurança para ambos? Poderia usar NACLs para ambos?

*(Não existe uma resposta única correcta. O objectivo é perceber que ferramenta se adequa a qual problema.)*

## Cena Pós-Créditos

O incidente ficou contido. A chave de implantação comprometida foi desactivada. O intervalo IP romeno foi bloqueado na NACL. O antigo script tinha sido removido da instância EC2.

Priya escreveu um relatório de incidente. Partilhou-o com a equipa.

A última linha do relatório: "Causa raiz: uma credencial activa de um pipeline de implantação desactivado nunca foi rotada ou revogada. Recomendação: rotação automatizada de credenciais e auditoria regular de todas as credenciais IAM."

Leo leu-o três vezes.

"Devia ter rotado essa chave," disse ele.

"Sim," disse Priya.

"Como garantimos que isto não acontece de novo?"

"Automatização," disse ela. "E algo que vigie os vigilantes."

No próximo capítulo: o cofre onde Nimbus guarda os seus segredos — e a rotação que torna as chaves roubadas inúteis.
