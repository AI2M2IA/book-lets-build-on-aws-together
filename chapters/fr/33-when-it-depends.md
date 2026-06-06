# Chapitre 33 : Ça dépend

Prenez une dernière respiration avant ce chapitre.

Le curseur clignotait sur la diapositive vide de Maya. Titre : « L'architecture chez Nimbus ». Elle l'effaça et tapa : « La question ». Puis elle regarda la salle et réalisa qu'elle n'avait pas besoin de la diapositive du tout.

**Récapitulatif : de la revue à la présentation**

La revue d'architecture avec Carlos — six mois et plusieurs centaines de lancements de restaurants derrière eux maintenant — avait laissé l'équipe avec une pile d'ADR et une manière plus claire de réfléchir aux décisions avant de les livrer. Maya préparait la présentation aux investisseurs quand elle réalisa que tout ce que Carlos avait demandé — et tout ce à quoi elle avait répondu avec assurance — se ramenait à la même logique sous-jacente. Les investisseurs demanderaient pourquoi. Elle avait appris, au fil de deux ans de construction de Nimbus, que la réponse n'était jamais le nom du service. La réponse était toujours l'ensemble des conditions qui rendaient un service approprié et un autre inapproprié. Elle était sur le point d'entrer dans une salle de gens qui lui demanderaient de défendre chaque choix architectural. Elle était prête.

**La question**

À la fin de presque chaque discussion architecturale, quelqu'un finit par demander : « Quelle est la bonne réponse ? »

Et la réponse la plus utile, frustrante, honnête et mal comprise de tout le génie logiciel est :

**Ça dépend.**

Non pas parce que la question est sans réponse. Non pas parce que l'expert est évasif. Mais parce que la bonne réponse dépend réellement, structurellement, d'un contexte qui n'était pas dans la question.

Ce chapitre traite d'apprendre à dire « ça dépend » correctement — ce qui signifie être capable de compléter la phrase.

Pensez à un médecin à qui on demande : « La chirurgie est-elle le bon traitement ? » Un mauvais médecin dit oui ou non sans examiner le patient. Un bon médecin dit : « Ça dépend — du diagnostic, de l'âge du patient, de ses autres conditions, et de ce qui se passe si on attend. » La réponse n'est pas de l'évasion. C'est de la précision. « Ça dépend » suivi d'une phrase complète est la chose la plus utile qu'un médecin — ou un architecte — puisse dire.

**La fin de Nimbus**

Deux ans et demi après le début. Maya était debout dans une salle de conférence à Seattle, présentant à une salle d'investisseurs en capital-risque.

Nimbus avait grandi : 947 partenaires restaurateurs. 18 000 commandes quotidiennes. 18 millions de dollars en GMV mensuel. Trois villes actives, deux autres en lancement. Une équipe de quatorze ingénieurs sur deux fuseaux horaires.

Les investisseurs avaient des questions. L'un d'eux — un associé technique du fonds — se pencha en avant.

« Quelle base de données utilisez-vous ? » demanda-t-il.

Maya n'hésita pas.

« Pour les commandes et les données clients : Aurora PostgreSQL. Pour le catalogue de menus : DynamoDB. Pour la gestion des sessions et la mise en cache : ElastiCache Redis. Pour l'analytique : Athena par-dessus des fichiers S3 Parquet, avec Redshift pour les requêtes de tableau de bord à haute fréquence. »

Il hocha la tête. « Pourquoi Aurora pour les commandes et pas DynamoDB ? »

« Parce que les commandes ont une structure relationnelle complexe — elles font référence aux articles de menu, aux comptes clients, aux adresses des restaurants, aux moyens de paiement. On a besoin d'une cohérence transactionnelle sur plusieurs entités. Une base de données relationnelle est le bon outil pour ça. La force de DynamoDB est l'accès clé-valeur à haut débit avec un schéma flexible, ce qui correspond exactement au modèle d'accès du catalogue de menus. »

Il nota quelque chose. « Et la mise à l'échelle ? Vous avez dit 18 000 commandes quotidiennes. C'est environ 12 par minute en moyenne. Comment avez-vous conçu pour les pics ? »

« Le coup de feu du vendredi soir est environ 25 fois la moyenne. On passe à l'échelle horizontalement avec ECS et Aurora Serverless v2, qui gère les pics automatiquement. CloudFront absorbe la charge de contenu statique. L'API est sans état, donc la mise à l'échelle horizontale est propre. »

« Et si Aurora Serverless v2 ne peut pas monter en puissance assez vite ? »

« On a des résultats de tests de charge. Le temps de montée en puissance d'Aurora Serverless v2 est inférieur à 10 secondes. Notre montée moyenne du pic du vendredi prend 8 minutes depuis la référence. On est à l'aise avec la marge. »

L'associé technique regarda le reste des investisseurs. « Elle connaît son système. »

Il avait d'autres questions.

« Comment gérez-vous la sécurité des déploiements ? À 947 restaurants, un mauvais déploiement signifie que 947 restaurants ne peuvent pas prendre de commandes. »

Maya s'était déjà fait poser la question, en interne. « Des feature flags pour tous les changements de comportement. On déploie le code en continu, mais le nouveau comportement est verrouillé derrière des flags qu'on active progressivement. Un déploiement qui change le flux de confirmation de commande est déployé sur 1 % des restaurants pendant 24 heures, puis 10 %, puis 50 %, puis 100 % — avec rollback automatique si les taux d'erreur dépassent le seuil à n'importe quelle étape. »

« Combien de temps prend un déploiement complet ? »

« Trois jours pour un changement à haut risque. Un jour pour un faible risque. Les rollbacks d'urgence sont complets en moins de quatre minutes. »

« Quelle est votre latence p99 Stripe ? »

Tom répondit avant que Maya ne le puisse. « 214 millisecondes. »

« C'est élevé, » dit l'investisseur.

« Notre SLA aux restaurants est : de la passation de commande à la confirmation en moins de 5 secondes, » dit Tom. « 214 ms pour l'appel Stripe, c'est 4,3 % de ce budget. Le temps restant, c'est l'écriture Aurora, la livraison du message SQS, la notification push vers la tablette du restaurant. On a de la marge. »

« Et si Stripe a un incident ? »

« On utilise la capture de paiement asynchrone de Stripe. La commande est acceptée et le restaurant notifié immédiatement. La capture de paiement se fait de manière asynchrone. Si Stripe est lent, la commande passe quand même — la capture réessaie. Si Stripe est complètement en panne, on met la tentative de capture en file d'attente avec un backoff exponentiel et on alerte notre astreinte. On n'a pas retenu une commande pour Stripe en 14 mois. »

L'investisseur nota quelque chose. « Avez-vous des points de défaillance uniques ? »

Priya répondit. « Aurora dans une seule région est une dépendance mono-région. On a du Multi-AZ pour les pannes au niveau AZ, et un reader Aurora Global Database qui tourne déjà dans us-east-1. Une panne régionale complète signifierait basculer vers ce reader — et le basculement régional automatisé autour de lui est ce qu'on construit ce trimestre. Jusque-là, oui — une panne régionale de us-west-2 mettrait Nimbus à terre. »

« Pourquoi n'avez-vous pas encore construit le basculement multi-régions ? »

« Parce que jusqu'à il y a six mois, le coût d'ingénierie pour le construire correctement dépassait le risque commercial de la panne, » dit Priya. « On n'a jamais eu de panne régionale AWS durant plus de 30 minutes dans notre région d'exploitation. À 287 restaurants — environ 4 200 commandes par jour à une valeur moyenne de commande de 34 $ — une panne régionale de 2 heures nous coûte approximativement 12 000 $ en GMV. Le coût d'ingénierie d'un warm standby correctement implémenté est de 3 mois de temps d'ingénieur senior. À notre revenu actuel, le calcul favorisait le report. »

« Et maintenant ? »

« À 947 restaurants et 18 000 commandes quotidiennes, la même panne de 2 heures coûte environ 51 000 $ en GMV et génère des dommages réputationnels significatifs auprès des partenaires restaurateurs qui dépendent de nous pour leur service du dîner. Le calcul a changé. Le projet de basculement démarre au prochain sprint. »

L'investisseur regarda les autres investisseurs dans la salle. « Elle connaît aussi son profil de risque. »


**Les quatre questions derrière « Ça dépend »**

Elle avait posé une version de chacune de ces questions pendant deux ans sans savoir qu'elle posait la même question de quatre manières différentes. La session avec les investisseurs l'avait rendu clair. Chaque choix qu'elle avait expliqué avec assurance revenait aux mêmes quatre axes.

**1. Quel est le modèle d'accès ?**

Comment les données sont-elles écrites et lues ? À quelle fréquence ? Par combien d'utilisateurs simultanés ? Dans quel ordre ? Par quelles clés ?

Cette question détermine la sélection technologique au niveau le plus fondamental. DynamoDB vs Aurora vs Redshift vs Athena — la bonne réponse dépend presque entièrement du modèle d'accès.

**2. Quelle est l'échelle ?**

Pas seulement maintenant — dans 12 mois, dans 5 ans. L'échelle change la bonne réponse. Ce qui fonctionne à 100 requêtes par jour casse à 100 millions. Ce qui est excessif à 10 utilisateurs est nécessaire à 10 000.

Et l'échelle n'est pas seulement le trafic. C'est la taille de l'équipe (l'architecture doit être maintenable par l'équipe que vous avez). C'est le volume de données. C'est la portée géographique.

**3. Quelle est la conséquence de la défaillance ?**

Si ça casse, que se passe-t-il ? Un utilisateur voit-il une page lente ? Une commande échoue-t-elle ? L'argent se déplace-t-il incorrectement ? Le dossier médical de quelqu'un devient-il inaccessible ?

La conséquence détermine combien vous investissez dans la fiabilité. Une page de menu lente justifie une cohérence à terme. Un paiement échoué justifie des écritures synchrones et une confirmation explicite.

**4. Quelle est la contrainte de coût ?**

Pas seulement l'argent — aussi la complexité opérationnelle (qui est elle-même une forme de coût). Une solution qui nécessite trois services supplémentaires peut être techniquement supérieure à une plus simple mais trop coûteuse à maintenir avec une équipe de quatre personnes.

« Attends — mais *pourquoi* le modèle d'accès compte-t-il autant ? » avait demandé Maya, deux ans plus tôt, quand Tom avait proposé pour la première fois de séparer le catalogue de menus de la base de données des commandes. « On ne peut pas juste optimiser plus tard ? »

Cette question, il s'est avéré, était le début de la réponse. Vous ne pouvez pas optimiser un schéma relationnel pour des modèles d'accès clé-valeur sans le reconstruire. Le modèle d'accès devait être connu au moment de la conception, pas intégré après coup. Chaque décision architecturale qu'elle avait prise depuis avait commencé par la même question.

Vous vous demandez peut-être : si « ça dépend » est toujours la bonne réponse, comment prend-on jamais une décision ? La réponse est que compléter la phrase vous force à nommer les conditions, et une fois que vous les avez nommées, vous savez quelle information il vous faut. « Ça dépend du modèle d'accès » devient « allez découvrir quel est réellement le modèle d'accès ». Les quatre questions ne sont pas une manière d'éviter les décisions — c'est une manière de les prendre avec la bonne information.

**« Ça dépend » : comment compléter la phrase**

La bonne façon de dire « ça dépend » est de la compléter immédiatement :

*« Devrait-on utiliser DynamoDB ou Aurora ? »*

« Ça dépend du modèle d'accès. Si vous avez besoin de recherches par clé à haut débit avec un schéma flexible, DynamoDB. Si vous avez besoin d'une cohérence transactionnelle sur des entités liées avec des requêtes complexes, Aurora. »

*« Devrait-on utiliser Lambda ou EC2 ? »*

« Ça dépend des caractéristiques de la charge de travail. Lambda pour les charges de travail événementielles, de courte durée, variables où le coût d'inactivité zéro compte. EC2 ou ECS pour les processus persistants, avec état ou de longue durée où une performance prévisible est plus importante que le coût d'inactivité. »

*« Devrait-on utiliser Multi-AZ ou Multi-Région ? »*

« Ça dépend de vos exigences RTO/RPO et de votre modèle de menace. Multi-AZ protège contre les pannes d'AZ (le mode de défaillance AWS le plus courant) et fournit un RPO ~0 et un RTO ~60 secondes pour RDS. Multi-Région protège contre les pannes régionales (rares) et sert les utilisateurs mondiaux distribués. Si vous avez besoin d'un basculement en moins d'une minute depuis un sinistre régional, Multi-Région. Si la résilience d'AZ est suffisante, Multi-AZ est beaucoup plus simple et moins cher. »

« Ça dépend » n'est pas la fin de la réponse. C'est le début de la vraie réponse.


*« Devrait-on utiliser EKS ou ECS pour l'orchestration de conteneurs ? »*

L'investisseur avait posé celle-ci avant que Maya ne passe à la diapositive suivante. Elle fit une pause.

« Ça dépend de la taille de l'équipe, de l'expertise Kubernetes existante, et du besoin de fonctionnalités spécifiques à Kubernetes. »

« Développez ça, » dit-il.

« Kubernetes est une plateforme d'orchestration puissante, » dit Maya. « Il a un écosystème riche — charts Helm, définitions de ressources personnalisées, fédération multi-cluster, politiques d'ordonnancement avancées. Si vous avez une équipe qui connaît Kubernetes, qui a des outils construits autour, et qui a besoin de ces capacités, EKS est le bon choix. Vous obtenez un plan de contrôle managé, mais vous gérez toujours la complexité Kubernetes des politiques réseau, de la sécurité des pods, des quotas de ressources, et le reste. »

« Et ECS ? »

« ECS est plus simple. Pas d'API Kubernetes. Pas d'etcd. Pas de complexité de réseau de pods. Vous définissez des tâches, des services et des clusters. IAM s'intègre nativement sans nécessiter de plugins supplémentaires. Le modèle mental est nettement plus petit. Pour une équipe qui ne connaît pas déjà Kubernetes, ECS élimine des mois de courbe d'apprentissage. »

« Lequel Nimbus utilise-t-il ? »

« ECS, » dit-elle. « On a évalué EKS il y a dix-huit mois. On avait un ingénieur avec de l'expérience Kubernetes. Les autres auraient eu besoin de 3 à 4 mois pour devenir productifs dans un environnement Kubernetes de production. Les fonctionnalités qu'EKS nous aurait données — gestion multi-cluster, ordonnancement personnalisé — on n'en avait pas besoin. ECS avec Fargate fait tourner nos conteneurs. L'équipe était productive en deux semaines. »

« Est-ce le bon choix à 50 ingénieurs ? » demanda-t-il.

« Ça pourrait ne pas l'être, » dit Maya. « À 50 ingénieurs avec plusieurs équipes produit nécessitant des namespaces isolés, des politiques réseau personnalisées et des quotas de ressources par équipe — le modèle de namespace de Kubernetes devient réellement précieux. ECS n'a pas d'isolation de namespace équivalente. À cette échelle, la courbe d'apprentissage Kubernetes est amortie sur une équipe bien plus grande. La réponse "ça dépend" se déplace. »

« À quelle taille d'équipe le déplacement se produit-il ? » demanda-t-il.

Elle y avait réfléchi. « La règle que j'utilise : quand le surcoût opérationnel de Kubernetes devient inférieur au surcoût organisationnel de contourner les limitations d'ECS, changez. Pour une équipe de 14 personnes, ECS. Pour une équipe de 50 personnes avec plusieurs verticales produit, probablement EKS. Le nombre n'est pas fixe — il dépend de ce que vous construisez et de qui le construit. »

« Attends — mais *pourquoi* ferait-on comme ça ? » se demanda Maya, répétant la question qu'elle avait apprise de deux ans de construction. « Pourquoi ne pas juste en choisir un et s'y tenir ? »

Parce que la bonne réponse change à mesure que l'organisation change. Une décision architecturale prise pour une équipe de 4 personnes n'est pas nécessairement correcte pour une équipe de 40 personnes. Les conditions changent. La réponse change avec elles.

« C'est tout le propos, » dit-elle à l'investisseur. « La bonne réponse aujourd'hui est ECS. La bonne réponse dans trois ans pourrait être EKS. On réexaminera quand les conditions le justifieront. On a un ADR documentant pourquoi on a choisi ECS, et il liste explicitement ce qui déclencherait une reconsidération. »

L'investisseur nota une dernière chose. « C'est une manière mature de tenir une décision technique. »


**Variation : quand « Ça dépend » vous met en difficulté**

Si le modèle d'accès favorise les recherches clé-valeur et que vous choisissez DynamoDB, vous surpasserez Aurora à l'échelle — mais si vous ajoutez une fonctionnalité nécessitant des requêtes JOIN sur trois entités, vous avez construit la mauvaise fondation et devrez migrer sous pression. La réponse « ça dépend » n'est aussi bonne que votre compréhension des conditions dont vous dépendez.

Si vous optimisez pour l'échelle actuelle et le modèle d'accès actuel, vous prendrez la bonne décision pour aujourd'hui — mais si le trafic croît de 50x en un an sans que votre architecture s'adapte, la décision correcte du premier jour devient le goulot d'étranglement du 365e jour. Les quatre questions doivent être posées non seulement au moment de la conception mais réexaminées à mesure que le système grandit.

**Les modèles qui ne changent pas**

Bien que les choix technologiques spécifiques évoluent — de nouveaux services sont lancés, les prix changent, de meilleures alternatives émergent — certains modèles sous-jacents sont restés stables pendant des décennies :

**Séparation des préoccupations** : Les composants qui font des choses différentes doivent être indépendants. Un changement dans l'un ne devrait pas nécessiter un changement dans l'autre. C'est pourquoi vous découplez avec SQS, pas avec des appels directs. Pourquoi vous utilisez S3 pour les objets, pas des bases de données. Pourquoi la couche web et la couche base de données sont séparées.

**Défense en profondeur** : Aucun contrôle de sécurité unique n'est suffisant. Vous avez IAM, les groupes de sécurité, les NACL, WAF, GuardDuty, Secrets Manager, KMS. Si une couche tombe en panne, la suivante l'attrape.

**Payez pour ce que vous utilisez, quand vous l'utilisez** : Le principe économique fondamental du cloud. Lambda passe à zéro. Les instances Spot utilisent la capacité libre. Les politiques de cycle de vie S3 déplacent les données froides vers un stockage moins cher. DynamoDB à la demande facture par requête. Tom avait demandé « Combien ça coûte par mois ? » dix mille fois en deux ans. Cette question — posée systématiquement, à laquelle on répondait rigoureusement — s'était transformée en près de 36 000 $ d'économies annuelles. Les modèles sont différents ; le principe est le même.

**Optimisez pour la défaillance la plus probable** : Multi-AZ d'abord (les pannes d'AZ se produisent). DR inter-région ensuite (les pannes régionales sont plus rares). Redondance intra-AZ (plusieurs instances) avant la complexité inter-région. Construisez pour la défaillance réaliste, pas pour la catastrophique mais improbable.

**Mesurez avant d'optimiser** : L'approche de Tom — tirer les métriques CloudWatch, comprendre le modèle réel, puis prendre des décisions — est plus précieuse que l'optimisation prématurée basée sur des hypothèses. L'instinct de Leo sur les tâches par lots nocturnes — « Ça ira » — était la chose la plus importante à se désentraîner. Ça va généralement, jusqu'à la seule fois où ça ne va pas, et vous n'avez rien mesuré.


**Le coût cumulé des mauvaises valeurs par défaut**.

Tom avait un autre modèle à ajouter à la liste, un qu'il n'avait identifié qu'après trois mois de revue des coûts : le coût de ne pas changer la valeur par défaut.

Les services AWS sont conçus pour être sûrs et fonctionnels dès la sortie de la boîte. Les valeurs par défaut ne sont pas conçues pour être optimales pour chaque charge de travail. gp2 était le type de volume EBS par défaut jusqu'au lancement de gp3 en décembre 2020. Après ça, gp3 est devenu la valeur par défaut pour les nouveaux volumes — mais les volumes gp2 existants n'ont jamais été convertis, parce qu'AWS ne modifie pas les ressources des clients existantes sans action explicite.

L'implication de coût : chaque équipe qui a créé des volumes EBS avant gp3 et n'a jamais fait d'audit de migration a payé 25 % de plus par Go pendant des années, non pas parce qu'elle a pris la mauvaise décision, mais parce qu'elle n'a pris aucune décision. La valeur par défaut a persisté, et le coût s'est accumulé silencieusement.

C'est pourquoi la question « attends, mais pourquoi ferait-on comme ça ? » était devenue la chose la plus précieuse que l'équipe demandait. Il ne s'agissait pas toujours de contester une décision qui avait été prise. Parfois il s'agissait de questionner une non-décision : une valeur par défaut acceptée sans examen.

Le modèle se généralise : réexaminez les valeurs par défaut quand AWS lance une nouvelle option. gp2 vers gp3. DynamoDB à la demande vers provisionné avec Auto Scaling quand le trafic se stabilise. S3 Standard vers Intelligent-Tiering quand les modèles d'accès deviennent incertains. Le réexamen n'a pas à être coûteux — un après-midi d'analyse par catégorie, trimestriellement. Mais il ne peut pas être sauté. Les valeurs par défaut s'accumulent.

« Chaque dollar qu'on dépense pour quelque chose qu'on a choisi est un coût intentionnel, » dit Tom, lors de la revue mensuelle. « Chaque dollar qu'on dépense pour quelque chose qu'on n'a pas regardé depuis qu'on l'a provisionné est une valeur par défaut potentielle qui devrait être questionnée. »

« Combien en avons-nous ? » demanda Maya.

« Moins qu'il y a six mois, » dit-il. « Plus que zéro. »

C'était la réponse honnête. C'était toujours la réponse honnête.


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
- **Le jugement technique sous pression** : Décider quoi faire à 3 h du matin quand le système est en panne et que vous avez des informations incomplètes. Cela vient des incidents.
- **L'intuition des parties prenantes** : Savoir quand contester une exigence commerciale parce que le coût technique est trop élevé. Cela vient de l'expérience des deux côtés, technique et commercial.
- **La bonne question pour le contexte spécifique** : Carlos pouvait poser les bonnes questions parce qu'il avait vu des problèmes similaires des dizaines de fois. Cette connaissance se gagne, elle ne se lit pas.

Vous n'avez pas fini d'apprendre. Vous avez à peine commencé.

**L'examen n'est pas la destination**

Vous avez pris ce livre pour préparer l'examen AWS Solutions Architect Associate. C'est valable. La certification SAA-C03 est réelle, valorisée et ouvrira des portes.

Mais l'examen teste la connaissance et la reconnaissance de modèles. Il ne teste pas le jugement. Il ne teste pas l'expérience opérationnelle. Il ne teste pas ce que vous faites quand l'architecture que vous avez construite cesse de fonctionner à 23 h un vendredi.

La certification est un titre de départ. Quand vous passerez l'examen, vous saurez comment les services AWS fonctionnent et comment ils se combinent. Vous aurez un cadre pour réfléchir à l'architecture. Vous ne l'aurez pas encore fait.

La prochaine étape après l'examen : construisez quelque chose de réel. Déployez-le. Exploitez-le. Regardez-le tomber en panne. Réparez-le. Manquez d'argent dans un service et déplacez le coût ailleurs. Faites-vous réveiller au milieu de la nuit et prenez une décision avec des informations insuffisantes.

C'est ainsi que la connaissance de ce livre devient du jugement.

**La réponse finale de Maya**

À la fin de la réunion des investisseurs, l'associé technique avait une dernière question.

« Si vous recommenciez aujourd'hui, en sachant ce que vous savez maintenant, que feriez-vous différemment ? »

Maya prit un moment.

« Je commencerais avec l'infrastructure as code dès le premier jour, » dit-elle. « Leo a déployé la première instance EC2 manuellement. On a passé six mois à tout migrer vers Terraform. C'était six mois de dette technique qui nous a coûté du temps réel. »

« Quoi d'autre ? »

« Je serais plus conservatrice sur les services managés au début. On a utilisé DynamoDB quand une simple base de données RDS aurait été suffisante pendant des mois. La conception du modèle d'accès DynamoDB nécessitait une réflexion expérimentée qu'on n'avait pas encore. On a repensé le schéma deux fois. »

« Donc plus simple c'est mieux au début ? »

« Plus simple c'est mieux *toujours*. La question est toujours : quelle est la chose la plus simple qui résout le problème réel, pas le problème futur anticipé ? On a ajouté de la complexité pour résoudre des problèmes qu'on n'avait pas encore. Une partie de cette complexité a causé ses propres problèmes. »

L'associé technique nota ça.

« Dernière question, » dit-il. « Quelle est la chose la plus importante que vous sachiez sur la construction sur AWS que vous ne saviez pas quand vous avez commencé ? »

Maya pensa aux deux ans. Les incidents. Les revues de coûts. La Well-Architected Review. Les décisions architecturales prises sous pression et celles prises soigneusement. Celles qu'ils ont réussies et celles qu'ils ont dû refaire.

« Que le cloud ne résout pas les problèmes d'architecture, » dit-elle. « Il les amplifie. Une mauvaise décision sur site peut vous coûter une semaine. Une mauvaise décision dans le cloud peut vous coûter de l'argent chaque mois, à l'échelle, jusqu'à ce que quelqu'un le remarque. »

Elle fit une pause.

« Le cloud fait passer les bonnes décisions à l'échelle. Et les mauvaises aussi. »

Ce soir-là, Maya raconta à Tom, Priya et Leo la session avec les investisseurs.

« Il a posé des questions sur les choix de base de données, » dit-elle. « Tous. »

« Combien ça coûte par mois ? » demanda immédiatement Tom, ce qui était exactement la mauvaise question et aussi la bonne. « A-t-il posé des questions sur le modèle de coût ? »

« Oui. J'ai expliqué les Savings Plans, le passage de DynamoDB au provisionné. Il a hoché la tête. »

« Et si quelqu'un essaie de s'introduire ? » demanda Priya. « Les questions de sécurité sont-elles venues ? »

« IAM, chiffrement, GuardDuty. Oui. Il a semblé satisfait. »

Leo était resté silencieux. « A-t-il posé des questions sur les parties qui ne se sont pas bien passées ? »

« Il a demandé ce que je ferais différemment. Je lui ai parlé de commencer avec l'infrastructure as code, et d'être plus conservatrice sur les services managés au début. »

« Le schéma DynamoDB qu'on a repensé deux fois, » dit Leo. « J'ai toujours senti que c'était de ma faute. »

« C'était de la faute de nous tous, » dit Maya. « C'est tout le propos. »

**Conclusion**

Vous avez beaucoup appris. Les services AWS. Les compromis. Les modèles.

Maintenant, faites quelque chose avec ça.

Construisez quelque chose. Faites des erreurs exprès. Lisez des post-mortems (ils sont publics — AWS, Cloudflare, GitHub, Stripe en publient tous). Travaillez avec des équipes meilleures que vous dans les domaines où vous êtes les plus faibles.

L'examen SAA-C03 testera si vous connaissez la matière. Votre carrière testera si vous pouvez l'appliquer.

Les deux valent la peine d'être faits. Ni l'un ni l'autre n'est la destination finale.

Il n'y a pas de destination finale dans ce domaine. Il y a seulement le prochain problème, la prochaine décision, et l'habitude de poser la prochaine bonne question.

**Les leçons qui n'ont pas figuré dans la présentation**

Dans le train de retour de Seattle, Maya raconta à Leo et Priya deux choses qu'elle était contente que l'investisseur n'ait pas abordées directement — parce que les réponses honnêtes auraient pris vingt minutes chacune.

**L'incident du pipeline analytique**.

Huit mois plus tôt, le pipeline analytique avait été couplé au service principal de traitement des commandes. Les événements de commande étaient écrits dans la même file d'attente SQS que le pipeline analytique consommait. Le couplage avait semblé raisonnable : l'analytique avait besoin des données de commande, le traitement des commandes produisait des données de commande.

Un mercredi soir, un bug dans la Lambda d'agrégation analytique l'avait fait cesser de consommer depuis la file. La profondeur de la file a grandi. Parce que le service de traitement des commandes partageait la même file SQS pour ses messages de confirmation, le pipeline analytique et le chemin de confirmation des commandes s'accumulaient simultanément. Les partenaires restaurateurs commencèrent à voir des retards de confirmation. La file SQS approchait sa limite de rétention des messages.

« J'ai déjà déployé le correctif, » avait dit Leo, à 23 h ce soir-là — puis il s'était arrêté. Le correctif du bug analytique nécessiterait un redéploiement Lambda qui viderait la file, mais il n'avait pas vérifié si les messages de confirmation de commande dans la file étaient encore dans leur timeout de visibilité. Si le timeout avait expiré, la Lambda les retraiterait, et les partenaires restaurateurs recevraient des confirmations de commande dupliquées.

L'incident avait duré trois heures et nécessité deux rollbacks.

La leçon architecturale était simple : l'analytique et le traitement opérationnel ne devraient jamais partager la même file. Ils ont des caractéristiques de performance différentes, des modes de défaillance différents et des conséquences différentes quand ils échouent. Les coupler signifiait qu'une défaillance dans le chemin de priorité inférieure pouvait dégrader le chemin de priorité supérieure.

Après l'incident, Nimbus sépara complètement les pipelines. Les événements de commande allaient vers une file opérationnelle dédiée. Une règle EventBridge séparée dupliquait les événements vers une file réservée à l'analytique. Les deux pipelines n'avaient aucune infrastructure partagée sauf la source d'événements. La fois suivante où la Lambda analytique eut un bug — et elle en eut un, deux mois plus tard — elle échoua silencieusement, la file analytique s'accumula, les rapports du matin furent en retard, et le chemin de confirmation des commandes ne fut absolument pas affecté.

« Séparation des préoccupations, » avait dit Priya, après le deuxième bug de la Lambda analytique. « Même principe au niveau de l'infrastructure qu'au niveau du code. Deux choses qui échouent différemment ne devraient pas partager le même domaine de défaillance. »

**L'abstraction prématurée.**

Trois mois avant la Série A, Leo avait proposé de construire un service de configuration de restaurant générique. Nimbus avait alors trois types de configuration spécifique aux restaurants : les paramètres de menu, les paramètres de zone de livraison et les préférences de notification. Un service de configuration générique, avait soutenu Leo, leur permettrait d'ajouter de nouveaux types de configuration sans construire de nouvelle logique de stockage et de récupération à chaque fois.

L'équipe l'avait construit. Deux semaines pour concevoir le modèle de données. Une semaine pour implémenter le service. Une autre semaine pour migrer les trois types de configuration existants dedans. Quatre semaines au total.

Au moment où ils finirent de construire le service de configuration générique, ils avaient... trois types de configuration. Les trois mêmes qu'ils avaient avant. Le service générique n'ajoutait aucune nouvelle capacité ; il rendait juste la capacité existante plus difficile à comprendre. Le schéma clé-valeur qui rendait le service « générique » le rendait aussi impossible d'ajouter de la validation ou des contraintes de type sans construire un registre de schémas par-dessus.

« On a construit un framework pour une bibliothèque, » dit Tom, quand il raconta l'histoire des investisseurs à Leo.

« Qu'est-ce que ça veut dire ? » demanda Leo.

« On avait trois livres. On a construit un système de gestion de bibliothèque pour les organiser. Il aurait été préférable de juste mettre les trois livres sur une étagère. »

Le service de configuration avait été silencieusement déprécié huit mois plus tard, quand l'équipe devint assez grande pour que quatre ingénieurs passent un temps non négligeable à apprendre comment il fonctionnait avant de découvrir que c'était une fine enveloppe autour d'une table DynamoDB. Ils migrèrent vers un accès DynamoDB direct avec des schémas typés par type de configuration en deux jours.

« Quatre semaines à le construire, » dit Tom. « Deux jours à le défaire. Plus le coût continu de l'expliquer à chaque nouvel ingénieur. »

« Quel était le bon choix ? » demanda Priya.

« Construire le service de configuration quand vous avez plus de dix types de configuration et que le modèle est clairement stable, » dit Tom. « Pas quand vous en avez trois et que vous spéculez sur des besoins futurs. L'abstraction était prématurée. Les besoins pour lesquels elle était conçue ne se sont pas matérialisés. »

« Avez-vous réfléchi à ce qui se passe si on construit des abstractions avant de comprendre l'espace du problème ? » demanda Priya.

« On vient de le décrire, » dit Tom. « Vous passez du temps à maintenir une abstraction qui coûte plus que le problème qu'elle résolvait. »

Maya ajouta ceci à son modèle mental des anti-modèles architecturaux : le service générique construit pour trois cas d'utilisation. Le pipeline couplé. La décision de dimensionnement prise sur une fenêtre d'observation insuffisante. Chacune était une décision qui avait du sens localement, sur le moment, avec l'information disponible. Chacune s'est avérée mauvaise de manières qui ne sont devenues visibles que plus tard.

« Celles qui ont l'air bien sur le papier, » dit-elle à Priya, « sont celles qui vous coûtent le plus. »

« Parce que vous ne les réexaminez pas, » dit Priya. « Vous regardez la conception, elle est cohérente, la logique tient, et vous passez à autre chose. Le mode de défaillance est invisible jusqu'à ce que le système soit sous une charge ou un stress que la version papier n'a jamais modélisé. »

« C'est pourquoi la revue d'architecture compte, » dit Maya. « Pas parce que le réviseur en sait plus. Parce qu'il posera la question que vous n'avez pas pensé à poser. »


## Résumé

La réunion avec les investisseurs s'était bien passée. Non pas parce que Maya avait mémorisé la structure de tarification de chaque service, mais parce qu'elle pouvait répondre *pourquoi* pour chaque choix que Nimbus avait fait. Les réponses « ça dépend » qu'elle avait données étaient précises, conditionnelles et ancrées dans les mêmes quatre questions qu'elle posait, sous diverses formes, depuis deux ans.

- **« Ça dépend » est le début de la réponse**, pas la fin. Complétez toujours la phrase avec les conditions dont ça dépend.
- Les quatre questions derrière chaque compromis architectural : modèle d'accès, échelle, conséquence de la défaillance, contrainte de coût.
- Les modèles qui perdurent : séparation des préoccupations, défense en profondeur, payez pour ce que vous utilisez, optimisez pour la défaillance probable, mesurez avant d'optimiser.
- **Le cloud amplifie les décisions** — les bonnes et les mauvaises. Une mauvaise décision sur site coûte une semaine ; une mauvaise décision dans le cloud s'accumule mensuellement, à l'échelle.
- La certification SAA-C03 teste la connaissance et la reconnaissance de modèles. L'expérience de production transforme cette connaissance en jugement.

## Conseils pour l'examen

*Domaine SAA-C03 : Inter-domaines — tous les domaines*

Ce chapitre clôt le contenu d'examen de ce livre. Avant de passer l'examen :

**Révisez les services sur lesquels vous êtes le moins confiant** :

- Pour la plupart des gens : Kinesis vs SQS (la distinction flux vs file d'attente)
- La mise en réseau VPC (tables de routage, sous-réseaux, NAT Gateway, Internet Gateway)
- La logique d'évaluation des politiques IAM (refus explicite > autorisation explicite > refus implicite)
- La sélection de classe de stockage (connaissez les huit classes de stockage S3 et leurs compromis)
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
- « Optimisation des coûts » → Instances Spot, Savings Plans, politiques de cycle de vie, dimensionnement correct

**Vous êtes prêt**. Non pas parce que ce livre a tout couvert — rien ne le fait. Mais parce que vous comprenez suffisamment les principes pour raisonner jusqu'à la réponse même quand vous ne reconnaissez pas immédiatement le scénario exact.

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

Dans le prochain chapitre : ce qui change quand le travail n'est plus de construire le système — mais d'en être responsable.
