\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Todos os direitos reservados. Nenhuma parte desta publicação pode ser reproduzida, distribuída
ou transmitida sob qualquer forma ou por qualquer meio, incluindo fotocópia, gravação ou
outros métodos eletrônicos ou mecânicos, sem a autorização prévia e por escrito da
editora, exceto no caso de citações breves incorporadas em resenhas críticas
e certos outros usos não comerciais permitidos pela lei de direitos autorais.*

*A história de Nimbus e seus personagens é fictícia. Qualquer semelhança com pessoas
reais, vivas ou mortas, ou com eventos reais é mera coincidência.*

*Os serviços AWS, modelos de preços, boas práticas e conteúdos de exame descritos neste
livro baseiam-se em documentação de acesso público disponível na data de publicação.
Amazon Web Services, AWS e marcas relacionadas são marcas registradas da Amazon.com, Inc.
ou de suas afiliadas. Este livro é um recurso educacional independente e não é
afiliado à Amazon Web Services, nem aprovado ou patrocinado por ela.*

*Os preços e recursos dos serviços AWS mudam com frequência. Verifique sempre as informações
atuais em aws.amazon.com antes de tomar decisões de arquitetura ou financeiras.*

*O exame AWS Solutions Architect Associate (SAA-C03) é um exame de certificação real.
Visite aws.amazon.com/certification para se inscrever.*

*Primeira Edição, 2026*

*Impresso e distribuído através da Amazon KDP*

---

\newpage

# Uma Nota sobre o Método

Este livro foi escrito com assistência de inteligência artificial e divulgado sob o pseudônimo AI(2)M(2)IA, em sintonia com a prática de todos os volumes desta coleção.

O currículo que você está prestes a seguir — sua premissa, seus personagens, a forma como a infraestrutura de Nimbus evolui de uma linha telefônica de restaurante até uma arquitetura AWS de nível de produção, as escolhas que a equipe faz sob pressão e aquelas que erra na primeira tentativa — foi escolhido por um autor humano e conduzido, serviço a serviço, ao longo de uma longa colaboração com um modelo de linguagem de grande escala. A capa foi criada com o apoio de um modelo de geração de imagens, sob a mesma direção. O próprio e-book foi preparado por ferramentas automatizadas.

O que você lê é o que foi mantido.

Não há nestas páginas qualquer pretensão de autoria sem auxílio; tampouco se afirma que a máquina, sozinha, é a autora. A obra, assim como a infraestrutura que descreve, é sustentada por camadas que dependem umas das outras.

---

\newpage

*Para todos os que abriram um navegador, digitaram um comando e fizeram algo funcionar —
e para todos os que abriram um navegador, digitaram um comando e aprenderam com o que
não funcionou.*

---

\newpage

# Prefácio

Você provavelmente já tentou aprender AWS antes.

Talvez tenha aberto a documentação e, dez minutos depois, se visse encarando a sintaxe de políticas IAM antes mesmo de entender para que serve o IAM.

Talvez tenha concluído um curso em vídeo e percebido que ainda não conseguia explicar onde um site realmente vive.

Talvez tenha grifado um guia de exame, memorizado nomes de serviços e, na primeira vez que um cenário lhe perguntou o que você faria se um banco de dados falhasse durante o pico do jantar, congelado.

A culpa não é sua.

É assim que a computação em nuvem costuma ser ensinada: primeiro como um catálogo, e só depois como um sistema.

Este livro funciona de forma diferente.

**Você não vai estudar AWS. Vai usá-la.**

Começamos com um restaurante que está perdendo pedidos porque a linha telefônica está ocupada e não existe site.

A partir daí, você vai acompanhar Maya, Tom, Priya e Leo enquanto constroem a infraestrutura de Nimbus, uma decisão de cada vez. Não na ordem organizada que um currículo de certificação preferiria, mas na ordem caótica que os sistemas reais exigem.

No final, Nimbus estará processando 18.000 pedidos diários: rodando em múltiplas Zonas de Disponibilidade, recuperando-se automaticamente de falhas, atendendo usuários da Costa Oeste em milissegundos por meio de uma rede de distribuição de conteúdo, processando cada pedido através de um pipeline de análise em tempo real e mantendo os custos sob controle à medida que a arquitetura cresce junto com o negócio.

Cada serviço AWS neste livro aparece no momento em que se torna necessário. Não porque um currículo o exija. Mas porque o sistema o exige.

**Para quem é este livro** Se você aprende melhor por meio de problemas do que por meio de documentação, este livro foi escrito para você. Se você está se preparando para a certificação AWS Solutions Architect Associate (SAA-C03), este livro também é para você: todos os domínios do exame são cobertos, e cada capítulo termina com Dicas de Exame e questões práticas no estilo SAA-C03. Se você já trabalha com engenharia e quer entender *por que* as decisões de arquitetura funcionam, e não apenas como os serviços se chamam, encontrará esse raciocínio em cada página.

**O que você não encontrará aqui** Um atalho. Este não é um guia de revisão rápida. Ele é mais longo do que um guia de revisão rápida porque entender leva mais tempo do que memorizar, e é o entendimento que se transfere para o seu próximo cargo, o seu próximo sistema e o incidente de produção que ninguém documentou direito.

**Como ler este livro** Leia-o como um romance na primeira vez. Deixe que a arquitetura se revele à medida que a equipe esbarra em problemas reais e faz trade-offs reais. Ao final de cada capítulo, pare e use ativamente as Dicas de Exame e os exercícios: cubra as respostas, raciocine sobre o cenário por conta própria, e só então confira o que aconteceu.

Quando você terminar, Nimbus estará em produção. E o seu entendimento de AWS também.

Vamos começar.
