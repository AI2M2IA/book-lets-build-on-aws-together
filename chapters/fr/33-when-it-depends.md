# Chapitre 33 : Ça dépend

Prenez une dernière respiration avant ce chapitre.

Vous avez atteint la fin du livre. C'est à la fois une conclusion et un commencement — le dernier chapitre, et le premier jour où vous prendrez des décisions architecturales par vous-même.

Ce chapitre a un seul objectif : être honnête avec vous sur la chose que personne ne vous dit clairement.

**La question**

À la fin de presque chaque discussion architecturale, quelqu'un finit par demander : « Quelle est la bonne réponse ? »

Et la réponse la plus utile, frustrante, honnête et mal comprise de tout le génie logiciel est :

**Ça dépend.**

Non pas parce que la question est sans réponse. Non pas parce que l'expert est évasif. Mais parce que la bonne réponse dépend genuinement, structurellement, du contexte qui n'était pas dans la question.

Ce chapitre traite d'apprendre à dire « ça dépend » correctement — ce qui signifie être capable de compléter la phrase.

Pensez à un médecin à qui on demande : « La chirurgie est-elle le bon traitement ? » Un mauvais médecin dit oui ou non sans examiner le patient. Un bon médecin dit : « Ça dépend — du diagnostic, de l'âge du patient, de ses autres conditions, et de ce qui se passe si on attend. » La réponse n'est pas de l'évasion. C'est de la précision. « Ça dépend » suivi d'une phrase complète est la chose la plus utile qu'un médecin — ou un architecte — puisse dire.

**La fin de Nimbus**

Deux ans après le début. Maya était debout dans une salle de conférence à Seattle, présentant à une salle d'investisseurs en capital-risque.

Nimbus avait grandi : 947 partenaires restaurants. 18 000 commandes quotidiennes. 2,1 millions de dollars en GMV mensuel. Trois villes actives, deux autres en lancement. Une équipe de quatorze ingénieurs sur deux fuseaux horaires.

Les investisseurs avaient des questions. L'un d'eux — un associé technique du fonds — se pencha en avant.

« Quelle base de données utilisez-vous ? » demanda-t-il.

Maya n'hésita pas.

« Pour les commandes et les données clients : Aurora PostgreSQL. Pour le catalogue de menus : DynamoDB. Pour la gestion des sessions et la mise en cache : ElastiCache Redis. Pour l'analytique : Athena sur des fichiers S3 Parquet, avec Redshift pour les requêtes de tableau de bord à haute fréquence. »

Il hocha la tête. « Pourquoi Aurora pour les commandes et pas DynamoDB ? »

« Parce que les commandes ont une structure relationnelle complexe — elles font référence aux articles de menu, aux comptes clients, aux adresses des restaurants, aux moyens de paiement. Nous avons besoin d'une cohérence transactionnelle sur plusieurs entités. Une base de données relationnelle est le bon outil pour ça. La force de DynamoDB est l'accès clé-valeur à haut débit avec un schéma flexible, ce qui correspond exactement au modèle d'accès du catalogue de menus. »

Il nota quelque chose. « Et la mise à l'échelle ? Vous avez dit 18 000 commandes quotidiennes. C'est environ 12 par minute en moyenne. Comment avez-vous conçu pour les pics ? »

« Le rush du vendredi soir est environ 25 fois la moyenne. Nous passons à l'échelle horizontalement avec ECS et Aurora Serverless v2, qui gère les pics automatiquement. CloudFront absorbe la charge de contenu statique. L'API est sans état, donc la mise à l'échelle horizontale est propre. »

« Et si Aurora Serverless v2 ne peut pas monter en puissance assez vite ? »

« Nous avons des résultats de tests de charge. Le temps de montée en puissance d'Aurora Serverless v2 est inférieur à 10 secondes. Notre pic moyen du vendredi prend 8 minutes depuis la référence. Nous sommes à l'aise avec la marge. »

L'associé technique regarda le reste des investisseurs. « Elle connaît son système. »

**Les quatre questions derrière "Ça dépend"**

Chaque compromis architectural se réduit à quatre questions fondamentales. Toutes les quatre ne comptent pas également pour chaque décision, mais toutes les quatre sont toujours en jeu :

**1. Quel est le modèle d'accès ?**

Comment les données sont-elles écrites et lues ? À quelle fréquence ? Par combien d'utilisateurs simultanés ? Dans quel ordre ? Par quelles clés ?

Cette question détermine la sélection technologique au niveau le plus fondamental. DynamoDB vs Aurora vs Redshift vs Athena — la bonne réponse dépend presque entièrement du modèle d'accès.

**2. Quelle est l'échelle ?**

Pas seulement maintenant — dans 12 mois, dans 5 ans. L'échelle change la bonne réponse. Ce qui fonctionne à 100 requêtes par jour casse à 100 millions. Ce qui est excessif à 10 utilisateurs est nécessaire à 10 000.

Et l'échelle n'est pas seulement le trafic. C'est la taille de l'équipe (l'architecture doit être maintenable par l'équipe que vous avez). C'est le volume de données. C'est la portée géographique.

**3. Quelle est la conséquence de la défaillance ?**

Si ça casse, que se passe-t-il ? Un utilisateur voit-il une page lente ? Une commande échoue-t-elle ? L'argent se déplace-t-il incorrectement ? Le dossier médical de quelqu'un devient-il inaccessible ?

La conséquence détermine combien vous investissez dans la fiabilité. Une page de menu lente justifie une cohérence éventuelle. Un paiement échoué justifie des écritures synchrones et une confirmation explicite.

**4. Quelle est la contrainte de coût ?**

Pas seulement l'argent — aussi la complexité opérationnelle (qui est elle-même une forme de coût). Une solution qui nécessite trois services supplémentaires peut être techniquement supérieure à une plus simple mais trop coûteuse à maintenir avec une équipe de quatre personnes.

**« Ça dépend » : comment compléter la phrase**

La bonne façon de dire « ça dépend » est de la compléter immédiatement :

*« Devrions-nous utiliser DynamoDB ou Aurora ? »*

« Ça dépend du modèle d'accès. Si vous avez besoin de recherches clé-valeur à haut débit avec un schéma flexible, DynamoDB. Si vous avez besoin d'une cohérence transactionnelle sur des entités liées avec des requêtes complexes, Aurora. »

*« Devrions-nous utiliser Lambda ou EC2 ? »*

« Ça dépend des caractéristiques de la charge de travail. Lambda pour les charges de travail événementielles, de courte durée, variables où le coût d'inactivité zéro est important. EC2 ou ECS pour les processus persistants, avec état ou de longue durée où une performance prévisible est plus importante que le coût d'inactivité. »

*« Devrions-nous utiliser Multi-AZ ou Multi-Région ? »*

« Ça dépend de vos exigences RTO/RPO et de votre modèle de menace. Multi-AZ protège contre les pannes d'AZ (le mode de défaillance AWS le plus courant) et fournit un RPO ~0 et un RTO ~60 secondes pour RDS. Multi-Région protège contre les pannes régionales (rares) et sert les utilisateurs mondiaux distribués. Si vous avez besoin d'un basculement en moins d'une minute depuis un sinistre régional, Multi-Région. Si la résilience d'AZ est suffisante, Multi-AZ est beaucoup plus simple et moins cher. »

« Ça dépend » n'est pas la fin de la réponse. C'est le début de la vraie réponse.

**Les modèles qui ne changent pas**

Bien que les choix technologiques spécifiques évoluent — de nouveaux services sont lancés, les prix changent, de meilleures alternatives émergent — certains modèles sous-jacents sont restés stables pendant des décennies :

**Séparation des préoccupations** : Les composants qui font des choses différentes doivent être indépendants. Un changement dans l'un ne devrait pas nécessiter un changement dans l'autre. C'est pourquoi vous découpler avec SQS, pas avec des appels directs. Pourquoi vous utilisez S3 pour les objets, pas des bases de données. Pourquoi la couche web et la couche base de données sont séparées.

**Défense en profondeur** : Aucun contrôle de sécurité unique n'est suffisant. Vous avez IAM, les groupes de sécurité, les NACL, WAF, GuardDuty, Secrets Manager, KMS. Si une couche tombe en panne, la suivante l'attrape.

**Payez pour ce que vous utilisez, quand vous l'utilisez** : Le principe économique fondamental du cloud. Lambda passe à zéro. Les instances Spot utilisent la capacité libre. Les politiques de cycle de vie S3 déplacent les données froides vers un stockage moins cher. DynamoDB à la demande facture par requête. Les modèles sont différents ; le principe est le même.

**Optimisez pour la défaillance la plus probable** : Multi-AZ d'abord (les pannes d'AZ se produisent). DR inter-région ensuite (les pannes régionales sont plus rares). Redondance intra-AZ (plusieurs instances) avant la complexité inter-région. Construisez pour la défaillance réaliste, pas pour la catastrophique mais improbable.

**Mesurez avant d'optimiser** : L'approche de Tom — tirer les métriques CloudWatch, comprendre le modèle réel, puis prendre des décisions — est plus précieuse que l'optimisation prématurée basée sur des hypothèses.

**Ce que ce livre ne peut pas vous apprendre**

Soyons directs sur les limites.

Ce livre vous a appris :

- Ce que fait chaque service AWS majeur
- Les analogies qui les rendent intuitifs
- Les compromis entre les alternatives
- Les connaissances d'examen dont vous avez besoin pour SAA-C03
- Un cadre pour réfléchir aux décisions architecturales

Ce livre ne peut pas vous apprendre :

- **L'instinct de production** : Le sentiment viscéral qui dit « ça va devenir bizarre sous charge » avant que vous ne l'ayez vu se produire. Cela vient de l'exploitation de vrais systèmes.
- **Le jugement technique sous pression** : Décider quoi faire à 3h du matin quand le système est en panne et que vous avez des informations incomplètes. Cela vient des incidents.
- **L'intuition des parties prenantes** : Savoir quand contester une exigence commerciale parce que le coût technique est trop élevé. Cela vient de l'expérience des deux côtés techniques et commerciaux.
- **La bonne question pour le contexte spécifique** : Carlos pouvait poser les bonnes questions parce qu'il avait vu des problèmes similaires des dizaines de fois. Cette connaissance est gagnée, pas lue.

Vous n'avez pas fini d'apprendre. Vous avez à peine commencé.

**L'examen n'est pas la destination**

Vous avez pris ce livre pour préparer l'examen AWS Solutions Architect Associate. C'est valable. La certification SAA-C03 est réelle, valorisée et ouvrira des portes.

Mais l'examen teste la connaissance et la reconnaissance de modèles. Il ne teste pas le jugement. Il ne teste pas l'expérience opérationnelle. Il ne teste pas ce que vous faites quand l'architecture que vous avez construite cesse de fonctionner à 23h un vendredi.

La certification est un identifiant de départ. Quand vous passerez l'examen, vous saurez comment les services AWS fonctionnent et comment ils se combinent. Vous aurez un cadre pour réfléchir à l'architecture. Vous ne l'aurez pas encore fait.

La prochaine étape après l'examen : construisez quelque chose de réel. Déployez-le. Exploitez-le. Regardez-le tomber en panne. Réparez-le. Manquez d'argent dans un service et déplacez le coût ailleurs. Être paginé au milieu de la nuit et prendre une décision avec des informations insuffisantes.

C'est ainsi que la connaissance de ce livre devient du jugement.

**La réponse finale de Maya**

À la fin de la réunion des investisseurs, l'associé technique avait une dernière question.

« Si vous recommenciez aujourd'hui, en sachant ce que vous savez maintenant, que feriez-vous différemment ? »

Maya prit un moment.

« Je commencerais avec l'infrastructure en tant que code dès le premier jour », dit-elle. « Leo a déployé la première instance EC2 manuellement. Nous avons passé six mois à tout migrer vers Terraform. C'était six mois de dette technique qui nous a coûté du temps réel. »

« Quoi d'autre ? »

« Je serais plus conservatrice sur les services gérés au début. Nous avons utilisé DynamoDB quand une base de données RDS simple aurait été suffisante pendant des mois. La conception du modèle d'accès DynamoDB nécessitait une réflexion expérimentée que nous n'avions pas encore. Nous avons repensé le schéma deux fois. »

« Donc plus simple c'est mieux au début ? »

« Plus simple c'est mieux *toujours*. La question est toujours : quelle est la chose la plus simple qui résout le problème réel, pas le problème futur anticipé ? Nous avons ajouté de la complexité pour résoudre des problèmes que nous n'avions pas encore. Une partie de cette complexité a causé ses propres problèmes. »

L'associé technique nota ça.

« Dernière question », dit-il. « Quelle est la chose la plus importante que vous sachiez sur la construction sur AWS que vous ne saviez pas quand vous avez commencé ? »

Maya pensa aux deux ans. Les incidents. Les revues de coûts. La revue Well-Architected. Les décisions architecturales prises sous pression et celles prises soigneusement. Celles qu'ils ont réussies et celles qu'ils ont dû refaire.

« Que le cloud ne résout pas les problèmes d'architecture », dit-elle. « Il les amplifie. Une mauvaise décision sur site peut vous coûter une semaine. Une mauvaise décision dans le cloud peut vous coûter de l'argent chaque mois, à l'échelle, jusqu'à ce que quelqu'un le remarque. »

Elle fit une pause.

« Le cloud fait que les bonnes décisions passent à l'échelle. Et les mauvaises aussi. »

**Conclusion**

Vous avez beaucoup appris. Les services AWS. Les compromis. Les modèles.

Maintenant, faites quelque chose avec ça.

Construisez quelque chose. Faites des erreurs exprès. Lisez des post-mortems (ils sont publics — AWS, Cloudflare, GitHub, Stripe en publient tous). Travaillez avec des équipes qui sont meilleures que vous dans les domaines où vous êtes les plus faibles.

L'examen SAA-C03 testera si vous connaissez la matière. Votre carrière testera si vous pouvez l'appliquer.

Les deux valent la peine d'être faits. Ni l'un ni l'autre n'est la destination finale.

Il n'y a pas de destination finale dans ce domaine. Il y a seulement le prochain problème, la prochaine décision, et l'habitude de poser la prochaine bonne question.

Bonne chance.

Dans le prochain chapitre : ce qui change quand le travail n'est plus de construire le système — mais d'en être responsable.

## Résumé

- **« Ça dépend » est le début de la réponse**, pas la fin. Complétez toujours la phrase avec les conditions dont ça dépend.
- Les quatre questions derrière chaque compromis architectural : modèle d'accès, échelle, conséquence de la défaillance, contrainte de coût.
- Les modèles qui perdurent : séparation des préoccupations, défense en profondeur, payez pour ce que vous utilisez, optimisez pour la défaillance probable, mesurez avant d'optimiser.
- **Le cloud amplifie les décisions** — les bonnes et les mauvaises. Une mauvaise décision sur site coûte une semaine ; une mauvaise décision dans le cloud s'accumule mensuellement, à l'échelle.
- La certification SAA-C03 teste la connaissance et la reconnaissance de modèles. L'expérience de production transforme cette connaissance en jugement.

## Conseils pour l'examen

*SAA-C03 Domaine : Inter-domaines — tous domaines*

Ce chapitre clôt le contenu d'examen de ce livre. Avant de passer l'examen :

**Révisez les services sur lesquels vous êtes le moins confiant** :

- Pour la plupart des gens : Kinesis vs SQS (la distinction flux vs queue)
- La mise en réseau VPC (tables de routage, sous-réseaux, NAT Gateway, Internet Gateway)
- La logique d'évaluation des politiques IAM (refus explicite > autorisation explicite > refus implicite)
- La sélection de classe de stockage (connaissez les six classes de stockage S3 et leurs compromis)
- RDS vs Aurora vs DynamoDB pour des cas d'utilisation spécifiques

**Connaissez la structure de scénario typique de l'examen** :

Le SAA-C03 présente une exigence commerciale (« l'entreprise a besoin d'une disponibilité de 99,99 % ») et vous demande d'identifier l'architecture qui la satisfait. Lisez toujours l'exigence, identifiez la contrainte clé et éliminez les options qui ne la satisfont pas.

**Pratiquez l'identification des distracteurs** :

Chaque mauvaise réponse à l'examen est fausse pour une raison spécifique. Apprendre à identifier *pourquoi* chaque mauvaise réponse est fausse est plus précieux que de mémoriser les bonnes réponses.

**L'examen récompense la reconnaissance de modèles** :

- « Découpler » → SQS/SNS
- « Sans serveur » → Lambda, DynamoDB, Aurora Serverless
- « Faible latence mondiale » → CloudFront, Global Accelerator, DynamoDB Global, Aurora Global
- « Conformité/audit » → CloudTrail, Config, Security Hub, Macie
- « Optimisation des coûts » → Instances Spot, Savings Plans, politiques de cycle de vie, redimensionnement

**Vous êtes prêt**. Non pas parce que ce livre a tout couvert — rien ne le fait. Mais parce que vous comprenez suffisamment les principes pour raisonner vers la réponse même quand vous ne reconnaissez pas immédiatement le scénario exact.


## Exercices

**Exercice final**

Il n'y a plus de questions d'examen structurées après ce chapitre.

À la place : une question ouverte.

Quel système construiriez-vous aujourd'hui, en sachant ce que vous savez ?

Écrivez-le. Esquissez l'architecture. Identifiez les services. Notez les compromis que vous feriez et pourquoi. Anticipez les modes de défaillance.

Puis construisez-le.

C'est la mission. Il n'y a pas de date limite. Il n'y a pas de note. Il y a juste le travail.

## Scène post-générique

L'investissement est arrivé.

Série A. 4 millions de dollars. Assez pour s'étendre à cinq nouvelles villes, tripler l'équipe d'ingénierie et construire Nimbus Instant.

Ce soir-là, Maya était dans le restaurant de sa famille. L'original. Celui où Nimbus a commencé, quand elle a réalisé qu'ils perdaient des commandes parce que le téléphone était toujours occupé.

Elle commanda de l'arepa — le même plat qu'elle commandait toujours.

Pendant qu'elle attendait, elle ouvrit son ordinateur portable et lut le premier chapitre de ce livre.

*« Où vit un site web ? »*

Elle se souvint de ne pas connaître la réponse.

Elle sourit.

Elle ferma l'ordinateur portable.

La nourriture arriva.

C'était parfait.

*Merci d'avoir lu.*

*L'examen AWS Solutions Architect Associate (SAA-C03) est disponible dans les centres de test Pearson VUE et en ligne via leur système de test à distance. Visitez aws.amazon.com/certification pour vous inscrire.*

*L'histoire de Nimbus est fictive. Les services AWS, les modèles de tarification et les meilleures pratiques décrits dans ce livre sont réels. Les deux peuvent changer — AWS met fréquemment à jour ses services. Vérifiez toujours les prix actuels et les capacités des services sur aws.amazon.com.*

*Bonne chance.*
