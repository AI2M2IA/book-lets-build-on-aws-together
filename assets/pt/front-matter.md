\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Todos os direitos reservados. Nenhuma parte desta publicação pode ser reproduzida, distribuída
ou transmitida sob qualquer forma ou por qualquer meio, incluindo fotocópia, gravação ou
outros métodos eletrónicos ou mecânicos, sem autorização prévia e por escrito do
editor, exceto no caso de citações breves incorporadas em recensões críticas
e outros usos não comerciais permitidos pela lei de direitos de autor.*

*A história de Nimbus e as suas personagens são fictícias. Qualquer semelhança com pessoas
reais, vivas ou mortas, ou com eventos reais é mera coincidência.*

*Os serviços AWS, modelos de preços, boas práticas e conteúdos de exame descritos neste
livro baseiam-se em documentação de acesso público disponível à data de publicação.
Amazon Web Services, AWS e marcas relacionadas são marcas registadas da Amazon.com, Inc.
ou das suas afiliadas. Este livro é um recurso educativo independente e não está
afiliado, aprovado nem patrocinado pela Amazon Web Services.*

*Os preços e funcionalidades dos serviços AWS mudam com frequência. Verifique sempre as informações
atuais em aws.amazon.com antes de tomar decisões de arquitetura ou financeiras.*

*O exame AWS Solutions Architect Associate (SAA-C03) é um exame de certificação real.
Visite aws.amazon.com/certification para se inscrever.*

*Primeira Edição, 2026*

*Impresso e distribuído através da Amazon KDP*

---

\newpage

# Uma Nota sobre o Método

Este livro foi escrito com assistência de inteligência artificial e divulgado sob o pseudónimo AI(2)M(2)IA, em consonância com a prática de todos os volumes desta colecção.

O currículo que está prestes a seguir — a sua premissa, as suas personagens, a forma como a infraestrutura de Nimbus evolui de uma linha telefónica de restaurante para uma arquitetura AWS de nível de produção, as escolhas que a equipa faz sob pressão e as que erram numa primeira tentativa — foram escolhidos por um autor humano e desenvolvidos, serviço a serviço, ao longo de uma longa colaboração com um modelo de linguagem de grande escala. A capa foi desenhada com o apoio de um modelo de geração de imagens, sob a mesma orientação. O próprio ebook foi preparado por ferramentas automatizadas.

O que lê é o que ficou.

Nestas páginas não existe qualquer pretensão de autoria sem auxílio; tampouco se afirma que a máquina é, por si só, a autora. A obra, tal como a infraestrutura que descreve, é sustentada por camadas que dependem umas das outras.

---

\newpage

*Para todos os que abriram um browser, escreveram um comando e fizeram algo funcionar —
e para todos os que abriram um browser, escreveram um comando e aprenderam com o que
não funcionou.*

---

\newpage

# Prefácio

Provavelmente já tentou aprender AWS antes.

Talvez tenha aberto a documentação e, dez minutos depois, se encontrasse a olhar para a sintaxe de políticas IAM antes de sequer perceber para que serve o IAM.

Talvez tenha concluído um curso em vídeo e se tenha dado conta de que ainda não conseguia explicar onde um website realmente vive.

Talvez tenha sublinhado um guia de exame, memorizado nomes de serviços e, na primeira vez que um cenário lhe perguntou o que faria se uma base de dados falhasse durante a hora de ponta do jantar, ficou em branco.

Isso não é culpa sua.

É assim que a computação em nuvem é habitualmente ensinada: primeiro como um catálogo, e só depois como um sistema.

Este livro funciona de forma diferente.

**Não vai estudar AWS. Vai usá-la.**

Começamos com um restaurante que está a perder encomendas porque a linha está ocupada e não existe website.

A partir daí, vai acompanhar Maya, Tom, Priya e Leo enquanto constroem a infraestrutura de Nimbus, uma decisão de cada vez. Não na ordem ordenada que um programa de certificação preferiria, mas na ordem caótica que os sistemas reais exigem.

No final, Nimbus estará a processar 18 000 encomendas diárias: a funcionar em múltiplas Zonas de Disponibilidade, a recuperar automaticamente de falhas, a servir utilizadores da Costa Oeste em milissegundos através de uma rede de distribuição de conteúdo, a processar cada encomenda através de um pipeline de análise em tempo real e a manter os custos sob controlo à medida que a arquitetura cresce com o negócio.

Cada serviço AWS neste livro aparece no momento em que se torna necessário. Não porque um programa de estudos o exija. Mas porque o sistema o exige.

**Para quem é este livro** Se aprende melhor através de problemas do que através de documentação, este livro foi escrito para si. Se está a preparar-se para a certificação AWS Solutions Architect Associate (SAA-C03), este livro é também para si: todos os domínios do exame estão cobertos, e cada capítulo termina com Dicas de Exame e questões práticas no estilo SAA-C03. Se já trabalha em engenharia e quer perceber o *porquê* das decisões arquiteturais, e não apenas o nome dos serviços, encontrará esse raciocínio em cada página.

**O que não encontrará aqui** Um atalho. Este não é um guia de estudo intensivo. É mais longo porque compreender demora mais do que memorizar, e é a compreensão que se transfere para o seu próximo cargo, o seu próximo sistema e o incidente de produção que ninguém documentou devidamente.

**Como ler este livro** Leia-o como um romance na primeira leitura. Deixe que a arquitetura se revele à medida que a equipa encontra problemas reais e toma decisões reais. No final de cada capítulo, pare e utilize activamente as Dicas de Exame e os exercícios: cubra as respostas, raciocine pelo cenário você mesmo, e só então verifique o que aconteceu.

Quando terminar, Nimbus estará em produção. O mesmo acontecerá com a sua compreensão de AWS.

Vamos começar.
