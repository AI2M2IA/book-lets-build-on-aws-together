# Chapitre 31 : L'inspecteur des bâtiments pour l'architecture cloud

Levez-vous. Étirez-vous. Faites une vraie pause si vous en avez besoin.

Ce chapitre est différent de ceux qui précèdent. On a passé 30 chapitres à accumuler des connaissances sur des services et des modèles spécifiques. Maintenant, on prend du recul et on regarde l'ensemble.

À quoi ressemble réellement une *bonne* architecture cloud ? Y a-t-il un moyen systématique d'évaluer si ce que vous avez construit est vraiment bien conçu — ou seulement fonctionnel ?

Il y en a un. AWS l'appelle le Well-Architected Framework.

**Récapitulatif : la question qui suit les chiffres**

Trois mois d'optimisation des coûts avaient produit un chiffre qui les avait tous surpris : 35 904 $ d'économies annuelles, identifiées et en grande partie mises en œuvre. Les Savings Plans EC2, les politiques de cycle de vie S3, le nettoyage du stockage, les réplicas de base de données inutilisés, les endpoints NAT Gateway — chacun avait été une découverte séparée, une correction séparée. Mais quelque part durant ce processus, Maya avait commencé à poser une question différente. Pas « où est le gaspillage ? » mais « comment s'est-il accumulé en premier lieu ? » Les problèmes de coûts étaient les symptômes de quelque chose. Le Well-Architected Framework était le vocabulaire pour nommer ce qu'était ce quelque chose.

Nimbus fonctionnait depuis deux ans. L'équipe avait pris des centaines de décisions architecturales — certaines consciemment, certaines par accident, certaines sous pression. Le système fonctionnait. Mais Maya avait une question.

« Notre architecture est-elle vraiment *bonne* ? » demanda-t-elle. « Pas seulement fonctionnelle. Bonne. »

Personne ne répondit immédiatement.

« Parce que j'ai entendu parler d'une Well-Architected Review, » continua-t-elle. « AWS l'offre à ses clients. Certains de nos investisseurs en ont parlé. Je pense qu'on devrait en faire une. »

« Qu'est-ce que c'est ? » demanda Leo.

« Le cadre d'AWS pour évaluer les architectures cloud, » dit Priya. « Six piliers. Un ensemble de questions et de meilleures pratiques pour chacun. Vous évaluez votre architecture par rapport à tous et identifiez ce qui manque. »

« C'est comme une inspection de bâtiment, » dit Tom. « Vous savez que le bâtiment fonctionne. L'inspection vous dit s'il respecte les normes et ce qui pourrait céder lors d'un tremblement de terre. »

**Les six piliers**

Le AWS Well-Architected Framework est organisé autour de six piliers. Chaque pilier a un ensemble de principes de conception, de meilleures pratiques et de questions pour évaluer votre architecture.

**1. Excellence opérationnelle**

*Focus* : Gérer et surveiller les systèmes pour apporter de la valeur commerciale, et améliorer continuellement les processus et les procédures.

Domaines clés :

- Comment déployez-vous les changements ? (CI/CD, infrastructure as code, déploiements automatisés)
- Comment surveillez-vous le système et savez-vous quand quelque chose ne va pas ?
- Comment apprenez-vous des échecs ? (post-mortems, runbooks, culture sans blâme)
- Comment gérez-vous les changements à grande échelle ?

Évaluation Nimbus :

- Présent : Pipeline CI/CD avec déploiements automatisés
- Présent : Alarmes CloudWatch et GuardDuty
- Présent : Tests de chaos engineering trimestriels
- Avertissement : Processus post-mortem non formalisé — les incidents étaient investigués mais les enseignements n'étaient pas documentés de manière systématique

**2. Sécurité**

*Focus* : Protéger les informations, les systèmes et les ressources grâce à des stratégies d'évaluation et d'atténuation des risques.

Domaines clés :

- Qui peut accéder à quoi, et avec le minimum de privilèges possible ?
- Comment les données sont-elles chiffrées au repos et en transit ?
- Comment détectez-vous et répondez-vous aux menaces ?
- Y a-t-il des contrôles de sécurité automatisés ?

Évaluation Nimbus :

- Présent : IAM avec le moindre privilège (après le nettoyage du chapitre 14)
- Présent : KMS pour le chiffrement des données, Secrets Manager pour les identifiants
- Présent : GuardDuty, WAF, Shield Standard
- Présent : VPC avec sous-réseaux privés, groupes de sécurité
- Avertissement : Patching de sécurité sur les instances EC2 non entièrement automatisé (Priya l'avait signalé des mois auparavant, non encore résolu)

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya, quand la lacune du patching de sécurité fut soulevée. « On a automatisé les déploiements. On a automatisé les sauvegardes. Pourquoi a-t-on laissé le patching manuel ? »

« Parce que le patching semblait différent du déploiement de code, » dit Priya. « On craignait que le patching ne casse quelque chose. Alors on l'a gardé manuel pour garder le contrôle. »

« Et en le gardant manuel, on l'a rendu incohérent, » dit Maya. « Ce qui est pire. »

« Oui, » dit Priya. « AWS Systems Manager Patch Manager résout ça. On aurait dû le faire il y a six mois. »

**3. Fiabilité**

*Focus* : S'assurer qu'un système remplit correctement et de manière cohérente sa fonction prévue, et qu'il est capable de récupérer des défaillances.

Domaines clés :

- Comment le système gère-t-il les défaillances au niveau des composants ?
- Comment récupère-t-il des défaillances régionales ?
- Comment la demande est-elle gérée ?
- Comment le système est-il testé pour les défaillances ?

Évaluation Nimbus :

- Présent : Multi-AZ pour tous les composants critiques
- Présent : Aurora Serverless avec basculement automatique
- Présent : Auto Scaling pour EC2 et ECS
- Présent : Tests de chaos engineering (trimestriels)
- Avertissement : Pas de déploiement multi-régions (warm standby pas encore implémenté — prévu pour le prochain trimestre)

**4. Efficacité des performances**

*Focus* : Utiliser efficacement les ressources informatiques et de calcul.

Domaines clés :

- Le bon type d'instance et le bon type de base de données sont-ils utilisés pour la charge de travail ?
- La mise à l'échelle est-elle configurée correctement ?
- Les données sont-elles livrées aux utilisateurs depuis l'emplacement optimal ?

Évaluation Nimbus :

- Présent : CloudFront pour la livraison de contenu mondial
- Présent : ElastiCache pour l'accélération des lectures de base de données
- Présent : Réplicas de lecture Aurora
- Présent : Lambda pour les charges de travail appropriées
- Avertissement : Certaines instances EC2 jamais dimensionnées correctement depuis le déploiement initial

**5. Optimisation des coûts**

*Focus* : Éviter les coûts inutiles.

Domaines clés :

- Les ressources sont-elles correctement dimensionnées ?
- Les ressources inutilisées sont-elles décommissionnées ?
- Les modèles de tarification appropriés sont-ils utilisés ?
- Les anomalies de dépenses sont-elles détectées ?

Évaluation Nimbus :

- Présent : Savings Plans mis en œuvre (chapitre 27)
- Présent : Politiques de cycle de vie S3 (chapitre 23)
- Présent : DynamoDB Auto Scaling
- Présent : AWS Budgets avec alertes
- Présent : Revues trimestrielles des coûts

« Combien ça coûte par mois, exactement — toutes les choses qu'on n'a pas encore dimensionnées correctement ? » demanda Tom. « Les instances EC2 qui n'ont jamais été évaluées. Celles qui sont encore à la taille qu'on a provisionnée la première année. »

« Je ne sais pas, » dit Leo. « C'est tout le problème. »

« C'est la lacune de l'Efficacité des performances, » dit Priya. « On a optimisé les choses qu'on connaissait. On n'a pas de chiffre pour les choses qu'on n'a pas encore regardées. »

**6. Durabilité**

*Focus* : Minimiser les impacts environnementaux de l'exécution des charges de travail cloud.

Domaines clés :

- L'utilisation est-elle maximisée (évitant les ressources inactives) ?
- Les types d'instances sont-ils choisis pour l'efficacité énergétique ?
- Les données ne sont-elles stockées que le temps nécessaire ?

Évaluation Nimbus :

- Présent : Lambda et Fargate pour les charges de travail serverless/conteneurisées (meilleure efficacité des ressources que l'EC2 dédié)
- Présent : Politiques de cycle de vie S3 (supprimer les données quand elles ne sont plus nécessaires)
- Avertissement : Certaines instances basées sur Graviton pas encore adoptées (AWS Graviton est plus économe en énergie et moins cher)

**Le processus de Well-Architected Review**

La revue n'est pas un test que vous réussissez ou échouez. C'est une conversation structurée sur votre architecture, guidée par plus de 60 questions sur les six piliers.

Chaque question identifie une meilleure pratique. Si votre architecture la suit, c'est une force. Sinon, c'est un « problème » — catégorisé par niveau de risque (élevé, moyen, faible).

La sortie : une liste priorisée de recommandations d'amélioration. Tout n'a pas besoin d'être corrigé immédiatement. Le cadre vous aide à comprendre les compromis de chaque lacune et à décider quoi traiter en premier.

L'outil Well-Architected d'AWS (disponible dans la console AWS, gratuit) fournit le cadre de questions et génère un rapport avec des recommandations.

Pour Nimbus, Maya planifia une session de revue d'une demi-journée couvrant les six piliers — et décida de ne pas la mener seule. La session elle-même, et la liste de découvertes qu'elle produisit, est là où ce chapitre se dirige.

**Le Lens : spécialiser la revue**

Le Well-Architected Framework de base est agnostique à la technologie. AWS publie également des **Lenses** — des extensions du cadre pour des cas d'utilisation ou des industries spécifiques :

- **Serverless Lens** : Questions supplémentaires pour les architectures fortement basées sur Lambda
- **SaaS Lens** : Pour les applications SaaS multi-locataires
- **Machine Learning Lens** : Pour les charges de travail d'entraînement et d'inférence ML
- **Financial Services Lens** : Questions réglementaires et de conformité pour la FinTech
- **Healthcare Lens** : Considérations HIPAA

Vous vous demandez peut-être : faut-il faire la revue Well-Architected complète sur les six piliers avant de lancer ? Non. La valeur est dans les questions, pas dans le score. Si vous êtes avant le lancement, choisissez les deux piliers les plus pertinents pour votre situation — Sécurité et Fiabilité sont presque toujours le bon point de départ — et travaillez sur ces seules questions. Une revue partielle réellement faite est plus précieuse qu'une revue complète repoussée jusqu'à ce que l'architecture soit « prête ».

Pour Nimbus, le SaaS Lens était pertinent. Il ajoutait des questions sur l'isolation des locataires, l'automatisation de l'intégration et l'allocation des coûts par locataire — tous des domaines que Nimbus développait activement.

**La session de Well-Architected Review : Carlos anime**

Maya avait invité Carlos — un architecte senior qu'elle avait rencontré lors d'un événement communautaire AWS, qui animait des Well-Architected Reviews pour des équipes comme la leur — à mener la session. Il arriva avec l'outil Well-Architected ouvert sur son portable et un seul bloc-notes. Pas d'ordre du jour. Juste des questions.

« Je demande, vous répondez honnêtement, » dit-il. « Si la réponse honnête est "on ne sait pas", dites-le. C'est une découverte. »

Il commença par l'Excellence opérationnelle.

« Avez-vous des runbooks pour vos cinq principaux incidents ? »

Tom regarda Leo. Leo regarda le plafond.

« On a des runbooks pour deux incidents, » dit Priya. « Le dépassement de la limite de connexions à la base de données et le timeout d'origine CloudFront. Les trois autres — la défaillance d'instance EC2 pendant un pic, le throttling DynamoDB et l'échec de webhook Stripe — on les gère au cas par cas. »

Carlos écrivit : *OPS-1 : Runbooks pour les 5 principaux incidents. Actuel : 2/5. Lacune : 3.*

« Quand avez-vous fait pour la dernière fois un exercice à blanc avec les runbooks existants ? »

Silence.

« On ne l'a pas fait, » dit Priya. « On les a écrits après des incidents. On n'a jamais testé s'ils sont encore exacts. »

*OPS-2 : Validation des runbooks. Dernier test : jamais.*

Carlos passa à la suite. La Sécurité.

« Qui a accès au compte root en ce moment ? »

« Root ? » dit Leo. « Juste Maya. Et je crois que Tom a encore les identifiants root d'après quand on a configuré le compte — mais on les a fait tourner après le chapitre 14. » Il s'arrêta. « Tom, on a fait tourner le root après le nettoyage IAM ? »

Tom ouvrit une entrée 1Password. « On a changé le mot de passe et ajouté la MFA. Mais les identifiants root sont encore dans le coffre 1Password partagé. Trois personnes ont accès à ce coffre : moi, Maya et Leo. »

« Donc trois personnes ont accès au root, » dit Carlos. « La recommandation d'AWS est que le root ne devrait être utilisé que pour une courte liste documentée de tâches — environ dix opérations au niveau du compte, toutes rares et la plupart réservées aux urgences. Après ces opérations, la session root devrait être terminée. L'accès root est-il journalisé séparément ? »

« CloudTrail le journalise, » dit Priya.

« Y a-t-il une alerte quand le root est utilisé ? »

Une autre pause.

« Non, » dit Tom.

Carlos écrivit : *SEC-1 : Contrôle d'accès au compte root. Actuel : 3 utilisateurs dans le coffre partagé, pas d'alerte d'utilisation. Lacune : L'utilisation du root devrait déclencher une alerte SNS immédiate. Cible : 0 session root hors urgence.*

« Ensuite : qui examine les changements de permissions IAM ? Y a-t-il un processus de revue par les pairs pour les nouveaux rôles IAM ou les expansions de politique ? »

« Priya les examine, » dit Leo. « C'est la réviseuse de sécurité de facto. »

« Que se passe-t-il quand Priya est en vacances ? »

Personne ne répondit.

« C'est une lacune de processus, » dit Carlos, sans jugement. « Pas une lacune dans les compétences de Priya — une lacune dans la conception du processus. Une revue de sécurité qui dépend de la disponibilité d'une seule personne est un point de défaillance unique dans votre posture de sécurité. »

*SEC-2 : Processus de revue IAM. Actuel : un seul réviseur, pas de remplaçant. Lacune : Définir un réviseur remplaçant et documenter les critères de revue.*

Carlos se tourna vers la Fiabilité.

« Avez-vous testé le basculement Multi-AZ d'Aurora sous charge ? »

« On l'a testé à vide, » dit Tom. « On a exécuté la commande de basculement quand le système était calme et confirmé que le réplica a été promu en 45 secondes. »

« Quelle était la charge à ce moment-là ? »

« Peut-être 5 % du pic. »

« Que se passe-t-il pour le pool de connexions pendant un basculement à 80 % de la charge de pointe ? »

Tom y réfléchit. « Le point de terminaison DNS se met à jour. Les applications utilisant le point de terminaison d'écriture verront des erreurs de connexion pendant la fenêtre de bascule — typiquement 20 à 45 secondes. À 5 % de charge, on avait dix connexions actives. Au pic, on en aurait 300. Avec RDS Proxy devant, le proxy gère la reconnexion. »

« Est-ce que RDS Proxy se reconnecte réellement de manière transparente pendant un basculement Multi-AZ ? »

Tom regarda Priya. « Je crois que oui. Mais je ne l'ai pas testé. »

« C'est une réponse différente de "oui", » dit Carlos. « Une hypothèse non testée dans votre conception de haute disponibilité est une découverte. »

*REL-1 : Basculement Multi-AZ d'Aurora sous charge. Testé : à vide seulement. Lacune : Tester à 70 % de la charge de pointe avec RDS Proxy en place. Valider le comportement du pool de connexions pendant la fenêtre de basculement.*

« Avez-vous réfléchi à ce qui se passe si le basculement prend 90 secondes au lieu de 45 ? » demanda Priya, s'adressant à Tom plutôt qu'à Carlos. Elle faisait déjà le travail.

« À 90 secondes, on aurait des timeouts applicatifs pour toute requête qui ne peut pas être réessayée, » dit Tom. « Le flux de passation de commande a une logique de réessai. Le flux de confirmation — moins. Un basculement de 90 secondes pendant le coup de feu du dîner signifierait qu'un sous-ensemble de confirmations échoue, les restaurants ne reçoivent pas la commande, le client est remboursé. »

« C'est le rayon d'impact, » dit Carlos. « Bien. Maintenant tu sais contre quoi tu te protèges et comment le mesurer. Le test devrait valider à la fois la durée du basculement et le comportement applicatif pendant la fenêtre de bascule. »

Il passa à l'Efficacité des performances.

« Dimensionnez-vous correctement vos instances EC2 ? »

« On les a dimensionnées correctement pendant la revue des coûts, » dit Tom. « Les Savings Plans engagés sur les types d'instances actuels. »

« Quand avez-vous regardé pour la dernière fois les recommandations de Compute Optimizer ? »

Tom l'ouvrit. AWS Compute Optimizer avait signalé trois instances comme potentiellement sur-provisionnées : deux processeurs en arrière-plan c6g.medium et un serveur VPN t3.medium. La recommandation pour le serveur VPN était de descendre à une t3.small. Les processeurs étaient signalés comme « sur-provisionnés » avec 82 % de confiance.

« On n'a pas regardé ça depuis qu'on l'a configuré, » admit Tom.

« Compute Optimizer génère des recommandations depuis combien de temps ? »

Tom vérifia. « Six semaines. »

Carlos écrivit : *PERF-1 : Dimensionnement EC2 via Compute Optimizer. Actuel : recommandations disponibles, non examinées. Lacune : Revue mensuelle de la sortie de Compute Optimizer ; appliquer les recommandations après validation en staging.*

« Une dernière, » dit Carlos. « Celle-ci traverse tous les piliers. » Il écrivit sur le tableau blanc :

*Sans incident n'est pas la même chose que bien conçu.*

Il laissa cela un moment.

« Votre système tourne depuis deux ans sans panne majeure visible par les clients, » dit-il. « C'est vraiment bien. Mais je veux que vous remarquiez ce que ça vous dit — et ce que ça ne vous dit pas. »

« Que ça nous dit qu'on a eu de la chance ? » proposa Leo.

« Ça vous dit que les modes de défaillance que vous avez rencontrés étaient dans votre capacité à les gérer, étant donné l'architecture que vous avez aujourd'hui. Ça ne vous dit pas que l'architecture est solide. Un système qui n'a pas encore échoué n'est pas prouvé résilient. Il est prouvé n'avoir pas rencontré les conditions spécifiques qui exposeraient ses faiblesses. »

« Donc ne pas échouer ne signifie pas ne pas être vulnérable, » dit Maya.

« Correct. La Well-Architected Review ne cherche pas de preuves de défaillances passées. Elle cherche une exposition future. Le basculement non testé. Les runbooks qui n'existent pas. Le rôle IAM trop large. Aucun de ces éléments n'a encore causé d'incident. Tous le pourraient. »

« C'est pourquoi la lacune du patching compte, » dit Priya. « On n'a pas été compromis via une instance EC2 non patchée. Ça ne veut pas dire qu'on ne le sera pas. »

« Exactement, » dit Carlos. « L'absence de dommage n'est pas la preuve de la sécurité. La présence d'une vulnérabilité non traitée est la preuve d'un risque — que le risque se soit matérialisé ou non. »

Il reboucha son marqueur.

« C'est la différence entre un système bien conçu et un système chanceux. »


**La découverte de la sur-permission IAM**

Carlos signala une deuxième découverte pendant la revue du pilier sécurité qui nécessitait un examen plus approfondi.

« Votre fonction Lambda qui gère les notifications de commandes — quelles permissions IAM a-t-elle ? »

Leo ouvrit le rôle d'exécution. Il lui fallut trente secondes de plus qu'il n'aurait dû pour le trouver — le rôle avait été créé tôt dans la vie de Nimbus et nommé de manière générique.

« Accès complet à S3, » dit-il, quand il le trouva.

Carlos attendit.

« Quel bucket ? » demanda-t-il.

« Tous les buckets, » dit Leo. Il lut la politique. « `arn:aws:s3:::*`. On lui a donné un accès complet à S3. »

« Que fait réellement la fonction avec S3 ? »

« Elle lit la configuration des restaurants depuis un bucket, » dit Leo. « Le bucket `nimbus-restaurant-config`. Précisément les objets `restaurants/{restaurant_id}/config.json`. Elle les lit. C'est tout. »

« Donc la fonction a besoin de `s3:GetObject` sur `arn:aws:s3:::nimbus-restaurant-config/restaurants/*/config.json`, » dit Carlos. « Ce qu'elle a, ce sont des permissions S3 complètes sur chaque bucket du compte. »

« Y compris, » dit Priya, « le bucket des instantanés Aurora. Le bucket des logs CloudTrail. Le bucket de l'historique des commandes des clients. »

« Si cette fonction Lambda est compromise, » dit Carlos, « un attaquant a un accès complet à chaque bucket S3 du compte. Il peut lire, écrire ou supprimer n'importe quelle donnée. »

« Je l'ai déjà déployée — oh, » dit Leo. Il lisait la politique. « J'ai écrit ça il y a deux ans. J'étais pressé de faire fonctionner le système de notification. Je lui ai donné un accès large parce que je n'étais pas encore sûr de ce dont elle avait besoin. Et je ne suis jamais revenu le restreindre. »

« C'est la source la plus courante de sur-permission dans les systèmes de production, » dit Carlos, sans accusation. « Pas une négligence intentionnelle — un raccourci pris sous pression temporelle, qui n'a jamais été réexaminé. »

Tom regardait déjà la liste complète des rôles d'exécution Lambda.

« Combien de nos fonctions Lambda ont des permissions trop larges ? » demanda Maya.

La réponse, après vingt minutes de revue : 7 des 23 fonctions Lambda avaient des permissions plus larges que ne l'exigeait leur objectif documenté. La plus préoccupante : la Lambda de confirmation de paiement avait `dynamodb:*` sur toutes les tables. Elle n'avait besoin que de `dynamodb:GetItem` et `dynamodb:PutItem` sur la table des commandes.

« Trois heures de travail pour corriger les sept, » estima Priya. « Écrire les politiques de moindre privilège, les attacher, retirer les larges. »

« Est-ce la découverte au risque le plus élevé jusqu'à présent ? » demanda Maya à Carlos.

« À égalité avec la lacune des runbooks, » dit-il. « Le problème IAM est un problème de rayon d'impact — si l'une de ces fonctions est compromise, l'accès de l'attaquant est bien plus grand qu'il ne devrait l'être. Le problème des runbooks est un problème de temps de récupération — quand quelque chose tourne mal, vous improvisez au lieu de suivre une procédure testée. Les deux sont vraiment à risque élevé. »

Maya les marqua tous deux comme P1 dans le document de suivi.

« Et si quelqu'un essaie de s'introduire ? » dit Priya. « On s'inquiète des attaquants externes. Mais une Lambda sur-permissionnée signifie qu'une défaillance interne — une mauvaise configuration, une vulnérabilité de dépendance, une attaque de chaîne d'approvisionnement — peut avoir le même rayon d'impact. »

« La défense en profondeur suppose que chaque couche a l'accès minimum nécessaire, » dit Carlos. « Quand une couche a plus d'accès qu'elle n'en a besoin, la défense en profondeur cesse de fonctionner comme prévu. Vous avez une couche compromise, mais elle a les clés de trois autres couches. »

Priya marqua la découverte de sur-permission IAM comme P1, première colonne, avec une échéance d'une semaine.


**Classer les découvertes : P1, P2, P3**

À la fin de la session, l'équipe avait 14 découvertes au tableau. Carlos leur demanda de les trier avant de partir.

« Chaque découverte de cette liste a besoin d'une priorité, » dit-il. « Tout n'est pas également important. Priorisez par : quel est le rayon d'impact si ça échoue ? Quelle est la probabilité que ça échoue ? Quelle est la difficulté de la corriger ? »

Les 14 découvertes :

1. Pas de runbooks pour 3 des 5 principaux incidents (OPS)
2. Runbooks jamais testés (OPS)
3. Pas de processus formel de réponse aux incidents au-delà des runbooks (OPS)
4. Accès root dans le coffre partagé, pas d'alerte d'utilisation (SEC)
5. Le processus de revue IAM n'a pas de réviseur remplaçant (SEC)
6. 7 fonctions Lambda sur-permissionnées (SEC) ← la Lambda de notification de Leo
7. Quelques règles de groupe de sécurité plus larges que nécessaire (SEC)
8. Basculement Aurora non testé sous charge (REL)
9. Plan de reprise après sinistre multi-régions non implémenté (REL)
10. Patching de sécurité non automatisé (SEC)
11. Dimensionnement EC2 non examiné depuis le lancement (PERF)
12. Instances Graviton non adoptées (SUST)
13. TTL de cache CloudFront non ajustés (PERF)
14. 40 % de l'infrastructure pas en IaC (OPS)

« Commencez par les évidentes, » dit Carlos. « Lesquelles trois corrigeriez-vous d'abord si vous n'aviez qu'une semaine ? »

Maya répondit immédiatement : « Alerte d'accès root. Sur-permissions Lambda. Automatisation du patching de sécurité. »

« Pourquoi ? » demanda Carlos.

« Parce que ces trois sont des lacunes de sécurité avec un rayon d'impact clair. Les autres sont des améliorations de fiabilité et opérationnelles — importantes, mais on vit avec elles et elles n'ont pas causé d'incident. Les lacunes de sécurité s'aggravent silencieusement chaque jour où on ne les corrige pas. »

Tom était en désaccord, légèrement. « Les sur-permissions Lambda sont urgentes. Mais j'échangerais le patching de sécurité contre le test de basculement Aurora. On n'a jamais confirmé que notre configuration Multi-AZ fonctionne correctement sous charge. Si elle échoue pendant un coup de feu du dîner du vendredi et qu'on n'a pas de runbook testé pour ça, on est dans le pétrin. »

« Les deux peuvent être P1, » dit Priya. « On a une semaine. Cinq jours ouvrés. Les permissions Lambda sont une correction de deux heures par fonction. L'alerte d'accès root est une règle d'événement CloudWatch de trente minutes. L'automatisation du patching de sécurité est deux jours de configuration et de test de Systems Manager. Le test de basculement Aurora est une demi-journée planifiée un mardi à 2 h. »

Carlos hocha la tête. « C'est la bonne façon de trier. Pas seulement "qu'est-ce qui est le plus important" mais "qu'est-ce qu'on peut réellement faire cette semaine, et dans quel ordre ?" »

Le tri final :

**P1 (cette semaine)** :
- Correction du moindre privilège des rôles d'exécution Lambda (7 fonctions)
- Alerte CloudWatch sur le compte root
- Test de basculement Multi-AZ d'Aurora sous charge (planifié pour mardi prochain, 2 h)

**P2 (ce mois-ci)** :
- Automatisation du patching de sécurité via Systems Manager
- Runbooks manquants pour les 3 principaux incidents
- Processus formel de réponse aux incidents documenté
- Migration IaC des 40 % — identifier quelles ressources, construire un plan de migration

**P3 (ce trimestre)** :
- Exercice de validation des runbooks
- Réviseur remplaçant du processus de revue IAM documenté
- Règles de groupe de sécurité trop larges resserrées
- Revue du dimensionnement EC2 via Compute Optimizer
- Plan d'adoption de Graviton
- Ajustement des TTL CloudFront

« Ce sont quatorze découvertes avec des responsables, des échéances et des priorités, » dit Maya. « On n'a jamais été aussi organisés au sujet de la dette technique. »

« C'est à ça que sert la revue, » dit Carlos. « Pas à vous faire vous sentir mal au sujet des lacunes. À vous donner un vocabulaire et une liste contre laquelle vous pouvez réellement agir. »


**La différence entre bien conçu et qui fonctionne simplement**

« Notre système fonctionne, » dit Leo après la revue. « Mais je ne m'étais pas rendu compte du nombre de choses qu'on avait faites "assez bien" et sur lesquelles on était passé à autre chose. »

« Avez-vous réfléchi à ce qui se passe si on continue de laisser ces lacunes ? » demanda Priya. « Le problème du patching est ouvert depuis des mois. Le processus de réponse aux incidents n'existe pas. Ce ne sont pas des choses mineures — ce sont les choses qui déterminent si une panne un vendredi soir est une correction de 20 minutes ou un désastre de quatre heures. »

« C'est pourquoi on fait la revue, » dit Maya.

« C'est normal, » dit Priya. « Construire sous pression temporelle signifie que vous faites des choix pragmatiques. La Well-Architected Review est le moment planifié pour les revisiter. »

« Certaines de ces lacunes semblent évidentes avec le recul, » continua-t-elle. « Le patching de sécurité — je savais qu'on ne l'avait pas automatisé. Je ne l'avais juste jamais priorisé pour le corriger. »

« Parce que "ça fonctionne" et "c'est bien architecturé" se ressemblent au quotidien, » dit Maya. « La différence ne devient visible que quand quelque chose va mal. »

C'est l'une des choses les plus importantes qu'un ingénieur senior comprend : l'absence d'incidents ne signifie pas l'absence de risque. Cela signifie que le risque ne s'est pas encore déclenché.

**Infrastructure as Code : l'activateur de l'excellence opérationnelle**

Un thème récurrent dans plusieurs piliers : l'**Infrastructure as Code (IaC)**.

Si votre infrastructure est configurée manuellement via la console, alors :

- La recréer dans un scénario de reprise après sinistre est lent et sujet aux erreurs
- Auditer les changements est impossible (qui a changé quoi, et quand ?)
- Annuler un mauvais changement nécessite une inversion manuelle
- La cohérence entre les environnements (dev/staging/production) nécessite de la discipline

**AWS CloudFormation** vous permet de définir l'infrastructure en templates YAML/JSON. **AWS CDK (Cloud Development Kit)** vous permet de définir l'infrastructure en utilisant des langages de programmation (Python, TypeScript, Java). **Terraform** est une alternative tierce populaire.

Nimbus avait progressivement migré vers IaC en utilisant Terraform. Au moment de la Well-Architected Review, environ 60 % de leur infrastructure était définie en code. La revue recommandait d'atteindre 100 %.

« Pourquoi les 40 % restants ? » demanda Leo.

« Les 40 % restants sont là où se trouve notre infrastructure critique, » dit Priya. « Si on ne peut pas la recréer depuis le code, on ne peut pas récupérer de manière fiable d'une catastrophe régionale. »

Leo regarda la liste. « Les 40 % restants — ouais. Ça ira, on les migrera au prochain sprint. »

Priya garda son regard sur l'écran. « C'est l'infrastructure critique. La configuration de basculement multi-régions. La hiérarchie des rôles IAM. Les choses qui, si on doit les reconstruire de zéro à 3 h, on a besoin de savoir qu'elles sont exactement correctes. »

Leo réfléchit à cela un moment.

« ...Tu as raison, » dit-il calmement. « On a déjà une configuration manuelle qui a dérivé de ce que quiconque a écrit. Si on devait la reconstruire de zéro, on devinerait. »

« C'est pourquoi la revue l'a trouvée, » dit Maya. « Pas pour attribuer le blâme. Pour la corriger avant que ça compte. »

**CloudFormation en profondeur : l'outil IaC natif AWS**

Bien que Nimbus ait adopté Terraform, la Well-Architected Review fit aussi remonter que l'équipe n'avait jamais pleinement compris AWS CloudFormation — le service IaC natif AWS qui sous-tend des services comme CDK, SAM (le modèle d'application serverless) et le Service Catalog. L'examen teste CloudFormation spécifiquement, et plusieurs services AWS nécessitent de le comprendre.

Le problème que Carlos avait nommé plus tôt dans la session était concret : Leo cliquait manuellement dans la console pour créer des environnements. Cela lui prenait 45 minutes à chaque fois, et toute divergence entre staging et production était invisible jusqu'à ce que quelque chose se casse. Trois des cinq incidents de production de l'année écoulée avaient été causés par une configuration en production qui ne correspondait pas à staging — règles de groupe de sécurité différentes, variables d'environnement différentes, type d'instance différent.

« La console est une porte à sens unique, » dit Carlos. « Vous pouvez entrer et changer des choses, mais vous ne pouvez pas facilement ressortir et voir exactement ce qui a été changé, ou reproduire l'état d'hier. »

CloudFormation est la réponse à ça. Voici comment ça fonctionne :

**Template** : Un fichier YAML ou JSON qui déclare l'infrastructure AWS que vous voulez. Pas des instructions sur comment la créer — une déclaration de ce à quoi elle devrait ressembler. « Je veux un VPC avec ces plages CIDR, deux sous-réseaux publics, deux sous-réseaux privés, une passerelle internet et ces tables de routage. » CloudFormation lit le template et détermine comment faire correspondre l'infrastructure réelle à la déclaration.

Pensez à un template comme à une recette pour un environnement. La recette ne change pas. Chaque environnement créé à partir d'elle est identique. Staging et production utilisent le même template, avec des paramètres différents (tailles d'instances différentes, noms de domaine différents). Les décisions structurelles — quels sous-réseaux existent, quels groupes de sécurité, quels rôles IAM — sont identiques.

**Stack** : L'instance déployée d'un template. Quand Leo exécute `aws cloudformation deploy --template-file infrastructure.yaml`, CloudFormation crée une Stack — une collection nommée des ressources AWS réelles que le template décrit. La Stack se souvient des ressources qu'elle a créées, et elle les gère comme une unité. Mettez à jour le template et redéployez la Stack : CloudFormation calcule la différence entre l'état actuel et le nouveau template, et applique uniquement les changements nécessaires. Supprimez la Stack : CloudFormation démantèle chaque ressource qu'elle a créée, dans le bon ordre, sans que vous ayez à vous en souvenir.

« Donc la Stack est le déploiement, pas le template ? » demanda Maya.

« Le template est la recette. La Stack est le repas. Vous pouvez faire le même repas à partir de la même recette autant de fois que vous voulez. Chaque fois, c'est le même. »

**Change Set** : Avant d'appliquer une mise à jour à une Stack en cours d'exécution, vous pouvez créer un Change Set — un aperçu de ce que CloudFormation va faire. Ajouter une nouvelle ressource ? Le Change Set le montre. Modifier un groupe de sécurité ? Le Change Set montre l'avant et l'après. Remplacer une instance RDS ? Le Change Set le signale comme un remplacement — ce qui signifie une interruption de service — avant que vous ne validiez.

« Voir le diff avant l'application, » dit Priya. « C'est ce qui nous manque quand Leo clique des choses dans la console. »

Pour Nimbus, la politique devint : tous les changements d'infrastructure en production doivent passer par une revue de Change Set. Pas de modifications directes dans la console. Le Change Set est le processus de revue par les pairs pour l'infrastructure.

**Drift Detection** : Avec le temps, les gens cliquent des choses dans la console. Une règle de groupe de sécurité ajoutée pendant un incident. Une variable d'environnement changée au milieu d'un déploiement. Un type d'instance augmenté manuellement quand la correction planifiée prenait trop de temps. CloudFormation appelle cela la **dérive** — quand l'état réel d'une ressource ne correspond plus à ce que le template de la Stack dit qu'il devrait être.

La détection de dérive de CloudFormation scanne les ressources de la Stack et signale toute différence entre l'état réel et l'état défini par le template. Quand Leo exécuta la détection de dérive sur les stacks Nimbus existantes pour la première fois, il trouva onze ressources dérivées. Sept d'entre elles étaient des modifications de groupes de sécurité. Trois étaient des changements de politique IAM. Une était un bucket S3 dont la politique de cycle de vie avait été changée directement dans la console il y a six mois et jamais reflétée dans le template.

« Onze ressources où l'infrastructure réelle et le template sont en désaccord, » dit Priya. « Onze incohérences potentielles entre staging et production dont on ne sait rien. »

Leo ne dit rien. Certaines de ces modifications étaient les siennes.

Il passa la semaine suivante à réconcilier les ressources dérivées avec les templates. Trois des changements manuels étaient des bugs — une configuration qui n'aurait jamais dû être appliquée. Le reste était des changements légitimes qui n'avaient juste jamais été reportés dans le template.

**Pourquoi c'est important pour le Well-Architected Framework** : L'Infrastructure as Code se situe à l'intersection de l'Excellence opérationnelle (déploiements répétables, infrastructure sous contrôle de version, auditabilité de chaque changement), de la Fiabilité (si une région échoue, vous pouvez recréer l'environnement depuis le template, pas de mémoire) et de la Sécurité (les rôles IAM et les règles de groupe de sécurité sont examinés en code, pas découverts après coup dans la console). Ce n'est pas un confort — c'est l'une des pratiques fondamentales que le cadre recommande systématiquement.

---

> **Conseil d'examen — CloudFormation**
>
> *Domaine SAA-C03 : Inter-domaines — Excellence opérationnelle et Fiabilité*
>
> - **CloudFormation = IaC déclaratif sur AWS.** Vous déclarez l'état souhaité dans un template ; CloudFormation crée et gère les ressources. Signal d'examen : « déploiements répétables », « infrastructure as code », « environnements cohérents ».
> - **Template** → **Stack** : le template est la déclaration ; la Stack est les ressources déployées. Une Stack peut être créée, mise à jour ou supprimée comme une unité.
> - **Change Set** : Prévisualisez ce qui va changer avant d'appliquer une mise à jour à une Stack en cours d'exécution. « Voir le diff avant l'application. » Signal d'examen : « examiner les changements d'infrastructure avant le déploiement » → Change Set.
> - **Drift Detection** : Identifie les ressources qui ont été changées manuellement en dehors de CloudFormation. « Quelqu'un a cliqué quelque chose dans la console » → Drift Detection.
> - **Attribut DeletionPolicy** : Contrôle ce qui arrive à une ressource quand sa Stack est supprimée. `Retain` — la ressource est conservée (utile pour les buckets S3 avec des données que vous ne voulez pas perdre). `Delete` — la ressource est détruite (la valeur par défaut). `Snapshot` — pour RDS et certains autres services, CloudFormation prend un instantané final avant la suppression. Signal d'examen : « empêcher la suppression d'une base de données RDS quand la stack est supprimée » → `DeletionPolicy: Snapshot` ou `DeletionPolicy: Retain`.
> - **CloudFormation StackSets** : Déployez la même Stack sur plusieurs comptes et régions AWS depuis une seule opération. Signal d'examen : « déployer la même infrastructure sur tous les comptes d'une organisation ».

**Variation : quand le cadre vous induit en erreur**

Si vous cochez toutes les cases d'une Well-Architected Review mais n'avez pas validé votre récupération de défaillance en staging, votre architecture de haute disponibilité échouera au premier incident réel — parce que la documentation de la résilience n'est pas la même chose que la résilience testée. Le cadre demande « avez-vous du Multi-AZ ? » pas « avez-vous confirmé que le basculement fonctionne réellement correctement dans votre configuration spécifique ? »

Si vous utilisez le cadre comme une liste de vérification pour satisfaire un auditeur plutôt que comme un outil de réflexion pour améliorer le système, vous produirez une documentation précise d'une architecture que vous ne comprenez pas pleinement. Les questions sont les plus précieuses quand elles révèlent des lacunes que vous ne vous attendiez pas à trouver.

## Points forts et limites

**Ce que le Well-Architected Framework fait bien** : Il donne aux équipes un vocabulaire partagé pour discuter des compromis architecturaux — un langage qui survit aux changements de personnel et aux conversations avec les fournisseurs. Faire une Well-Architected Review force une reconnaissance explicite des risques qui seraient autrement invisibles : « Oui, on sait qu'on a un point de défaillance unique ici ; on a accepté ce compromis parce que le coût de l'éliminer dépasse le coût attendu de la défaillance. » Ce type de compromis documenté et intentionnel est la sortie d'une bonne revue.

**Ce qu'il ne peut pas faire** : Le Framework est descriptif, pas prescriptif. Il décrit les propriétés des systèmes bien architecturés — il ne vous dit pas comment les construire. Cocher toutes les cases d'une Well-Architected Review ne garantit pas une bonne architecture. Un système peut être hautement disponible, opérationnellement excellent, optimisé en coûts, et résoudre quand même le mauvais problème. Le Framework est un prisme, pas un plan. Utilisez-le pour faire émerger les bonnes questions, pas pour y répondre.

## Résumé

La Well-Architected Review leur laissa 14 éléments — trois qui nécessitaient une attention immédiate, le reste qui nécessitait un plan. Les découvertes à risque élevé n'étaient pas exactement des surprises ; c'étaient des choses que l'équipe connaissait et auxquelles elle n'était pas encore parvenue. La revue leur donna une manière structurée de reconnaître ces lacunes ouvertement, de les prioriser par risque et de s'engager sur un calendrier. Cette responsabilisation, plus que n'importe quelle découverte individuelle, était la valeur.

- Le **AWS Well-Architected Framework** a six piliers : Excellence opérationnelle, Sécurité, Fiabilité, Efficacité des performances, Optimisation des coûts et Durabilité.
- Chaque pilier a des principes de conception et des meilleures pratiques évalués via un ensemble de questions structurées.
- L'**outil Well-Architected** (gratuit dans la console AWS) guide la revue et génère un rapport.
- La sortie est une liste priorisée d'améliorations architecturales catégorisées par risque.
- L'**Infrastructure as Code** est un activateur inter-piliers — recommandé par les piliers Excellence opérationnelle, Sécurité et Fiabilité.

## Conseils pour l'examen

*Domaine SAA-C03 : Inter-domaines — tous les domaines*

- **Connaissez les six piliers et leur focus principal**. L'examen décrira un scénario (par exemple, « l'équipe veut s'assurer que son système peut récupérer des défaillances d'AZ ») et vous demandera à quel pilier il appartient (Fiabilité).
- **Correspondance des piliers** :
  - « Déployer les changements de manière fiable, apprendre des échecs, surveiller » → Excellence opérationnelle
  - « IAM, chiffrement, contrôles réseau, détection des menaces » → Sécurité
  - « HA, basculement, mise à l'échelle, reprise après sinistre » → Fiabilité
  - « Dimensionnement correct, CDN, bonne sélection de technologie » → Efficacité des performances
  - « Modèles de tarification, ressources inutilisées, visibilité des coûts » → Optimisation des coûts
  - « Efficacité énergétique, utilisation des ressources, cycle de vie des données » → Durabilité
- **Infrastructure as Code** : Recommandé par le cadre pour la répétabilité, l'auditabilité et la récupération. CloudFormation, CDK et SAM sont des outils IaC natifs AWS.
- **Outil Well-Architected** : L'outil de la console AWS qui guide le processus de revue. Gratuit à utiliser. Génère des plans d'amélioration.
- **AWS Trusted Advisor** : Similaire au Well-Architected Framework mais automatisé — scanne votre compte et fournit des recommandations sur les coûts, les performances, la sécurité et la tolérance aux pannes. Le chevauchement est réel : Trusted Advisor automatise certaines de ce que le cadre évalue manuellement.

## Exercices

**Exercice 1 — Mémorisation**

Nommez les six piliers du AWS Well-Architected Framework et décrivez la préoccupation principale de chacun en une phrase.

*(Essayez de le faire de mémoire. Si vous avez du mal, c'est une information utile sur les piliers qui nécessitent plus d'attention.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une équipe d'ingénierie se prépare à une Well-Architected Review. Son application tourne sur EC2 avec RDS Multi-AZ. Récemment, elle a découvert que :

- Leur processus de déploiement laisse parfois les instances EC2 avec des versions de bibliothèques différentes (dérive de configuration)
- Ils n'ont pas d'alerte automatisée quand le basculement RDS est déclenché
- Leurs utilisateurs IAM ont tous AdministratorAccess
- Ils n'ont pas testé leur processus de restauration des sauvegardes en 14 mois

Associez chaque problème au pilier Well-Architected LE PLUS PERTINENT.

A) Dérive de configuration : Excellence opérationnelle ; Pas d'alerte basculement RDS : Fiabilité ; AdministratorAccess : Sécurité ; Pas de test de restauration : Fiabilité

B) Dérive de configuration : Sécurité ; Pas d'alerte basculement RDS : Efficacité des performances ; AdministratorAccess : Excellence opérationnelle ; Pas de test de restauration : Optimisation des coûts

C) Dérive de configuration : Fiabilité ; Pas d'alerte basculement RDS : Efficacité des performances ; AdministratorAccess : Sécurité ; Pas de test de restauration : Excellence opérationnelle

D) Dérive de configuration : Sécurité ; Pas d'alerte basculement RDS : Fiabilité ; AdministratorAccess : Optimisation des coûts ; Pas de test de restauration : Sécurité

**Indice 1** : « Dérive de configuration » dans le processus de déploiement → quel pilier couvre les pratiques de déploiement ?

**Indice 2** : « AdministratorAccess » pour tous les utilisateurs → quel pilier couvre le contrôle d'accès ?

**Indice 3** : « Restauration des sauvegardes non testée » → quel pilier couvre le test de vos mécanismes de récupération ?

**Réponse** : A

**Explication** : La dérive de configuration dans les déploiements (environnements incohérents) est un problème d'Excellence opérationnelle — c'est une question de pratiques de déploiement fiables et cohérentes. Pas d'alerte sur le basculement RDS signifie que vous ne savez pas quand les mécanismes HA sont déclenchés — un problème de Fiabilité (connaître la santé de votre système). AdministratorAccess pour tous les utilisateurs viole le moindre privilège — un problème de Sécurité. La restauration des sauvegardes non testée signifie que vos mécanismes de Fiabilité (reprise après sinistre) ne sont pas vérifiés.

**Pourquoi pas B ?** B assigne à tort la dérive de configuration à la Sécurité (l'incohérence des versions de bibliothèques est un problème d'opérations de déploiement, pas une menace sécuritaire) et AdministratorAccess à l'Excellence opérationnelle (le contrôle d'accès est une préoccupation de Sécurité, pas un processus opérationnel).

**Pourquoi pas C ?** C place correctement AdministratorAccess en Sécurité mais assigne à tort la dérive de configuration à la Fiabilité (la cohérence des déploiements est l'Excellence opérationnelle) et la restauration des sauvegardes non testée à l'Excellence opérationnelle (tester la récupération est une préoccupation de Fiabilité — vous vérifiez que votre système peut récupérer, pas que vos processus sont cohérents).

**Pourquoi pas D ?** D assigne AdministratorAccess à l'Optimisation des coûts (des permissions trop larges n'ont rien à voir avec le coût) et la restauration des sauvegardes non testée à la Sécurité (ne pas pouvoir restaurer une sauvegarde est un échec de Fiabilité, pas une vulnérabilité de sécurité).

*Domaine SAA-C03 : Inter-domaines*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Faites une mini Well-Architected Review d'une application que vous connaissez ou que vous construisez. Pour chacun des six piliers, écrivez :

- Une chose que l'application fait bien
- Une chose que l'application pourrait améliorer

Ensuite, classez vos éléments d'amélioration par risque (qu'est-ce qui est le plus susceptible de causer un incident ou du gaspillage ?) et par priorité (qu'est-ce qui aurait le plus grand impact si corrigé ?).

*(Cet exercice est plus précieux qu'il ne peut le sembler. La pratique d'évaluer systématiquement l'architecture sous plusieurs angles est une compétence clé d'ingénieur senior.)*

## Scène post-générique

Trois semaines après la Well-Architected Review, l'équipe avait implémenté les trois corrections P1 — les sept rôles Lambda étaient au moindre privilège, l'utilisation du root déclenchait une alerte, et le basculement Aurora avait été testé sous charge un mardi à 2 h — et le travail P2 était en cours.

Le patching EC2 était maintenant automatisé via AWS Systems Manager Patch Manager. Un document de processus de réponse aux incidents existait (pas parfait, mais écrit et partagé). Le plan de warm standby multi-régions était rédigé et planifié pour une mise en œuvre le prochain trimestre.

Priya examina le rapport de l'outil Well-Architected. Les découvertes P1 étaient closes ou assignées avec des preuves. Les éléments à risque moyen et faible diminuaient, avec des responsables et des dates.

« On est dans une meilleure forme qu'avant, » dit-elle.

« C'est bien ? » demanda Leo.

« C'est du progrès, » dit-elle. « Vous ne finissez pas une Well-Architected Review. Vous faites des progrès, puis vous revoyez à nouveau dans six mois. »

Maya pensait à quelque chose.

« On a passé 31 chapitres à apprendre des services AWS individuels, » dit-elle. « Et maintenant on commence à regarder l'ensemble du système. C'est ainsi que pensent les architectes. »

« On pense comme des architectes depuis un moment, » dit Leo.

« On a pris des décisions architecturales, » dit Maya. « C'est différent. Penser comme un architecte signifie que vous évaluez les décisions *avant* de les prendre, pas après. »

« Quelle est la différence ? » demanda Tom.

« Dans le prochain chapitre, » dit-elle, « on essaie d'y répondre. »

Dans le prochain chapitre : à quoi ressemble une vraie revue d'architecture, depuis les premiers principes.
