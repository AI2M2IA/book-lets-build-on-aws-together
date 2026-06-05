# Chapitre 31 : L'Inspecteur des Bâtiments pour l'Architecture Cloud

Levez-vous. Étirez-vous. Faites une vraie pause si vous en avez besoin.

Ce chapitre est différent de ceux qui précèdent. On a passé 30 chapitres à accumuler des connaissances sur des services et des modèles spécifiques. Maintenant on prend du recul et on regarde l'ensemble.

À quoi ressemble réellement une *bonne* architecture cloud ? Y a-t-il un moyen systématique d'évaluer si ce que vous avez construit est vraiment bien conçu — ou seulement fonctionnel ?

Il y en a un. AWS l'appelle le Well-Architected Framework.

Nimbus fonctionnait depuis deux ans. L'équipe avait pris des centaines de décisions architecturales — certaines consciemment, certaines par accident, certaines sous pression. Le système fonctionnait. Mais Maya avait une question.

« Notre architecture est-elle vraiment *bonne* ? » demanda-t-elle. « Pas seulement fonctionnelle. Bonne. »

Personne ne répondit immédiatement.

« Parce que j'ai entendu parler d'une Well-Architected Review, » continua-t-elle. « AWS l'offre à ses clients. Certains de nos investisseurs en ont parlé. Je pense qu'on devrait en faire une. »

« Qu'est-ce que c'est ? » demanda Leo.

« Le cadre d'AWS pour évaluer les architectures cloud, » dit Priya. « Six piliers. Un ensemble de questions et de meilleures pratiques pour chacun. Vous évaluez votre architecture par rapport à tous et identifiez ce qui manque. »

« C'est comme une inspection de bâtiment, » dit Tom. « Vous savez que le bâtiment fonctionne. L'inspection vous dit s'il respecte les normes et ce qui pourrait céder lors d'un tremblement de terre. »

**Les Six Piliers**

Le AWS Well-Architected Framework est organisé autour de six piliers. Chaque pilier a un ensemble de principes de conception, de meilleures pratiques et de questions pour évaluer votre architecture.

**1. Excellence Opérationnelle**

*Focus* : Gérer et surveiller les systèmes pour apporter de la valeur commerciale, et améliorer continuellement les processus et les procédures.

Domaines clés :

- Comment déployez-vous les changements ? (CI/CD, infrastructure as code, déploiements automatisés)
- Comment surveillez-vous le système et savez-vous quand quelque chose ne va pas ?
- Comment apprenez-vous des échecs ? (post-mortems, runbooks, culture blameless)
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
- Présent : KMS pour le chiffrement des données, Secrets Manager pour les credentials
- Présent : GuardDuty, WAF, Shield Standard
- Présent : VPC avec sous-réseaux privés, groupes de sécurité
- Avertissement : Patching de sécurité sur les instances EC2 non entièrement automatisé (Priya l'avait signalé des mois auparavant, non encore résolu)

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

**4. Efficacité des Performances**

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

**5. Optimisation des Coûts**

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

**Le Processus de Well-Architected Review**

La revue n'est pas un test que vous réussissez ou échouez. C'est une conversation structurée sur votre architecture, guidée par 60+ questions sur les six piliers.

Chaque question identifie une meilleure pratique. Si votre architecture la suit, c'est une force. Sinon, c'est un « problème » — catégorisé par niveau de risque (élevé, moyen, faible).

La sortie : une liste priorisée de recommandations d'amélioration. Tout n'a pas besoin d'être corrigé immédiatement. Le cadre vous aide à comprendre les compromis de chaque lacune et à décider quoi traiter en premier.

L'Outil Well-Architected AWS (disponible dans la console AWS, gratuit) fournit le cadre de questions et génère un rapport avec des recommandations.

Pour Nimbus, Maya a planifié un atelier d'une demi-journée. Les quatre membres de l'équipe ont examiné chaque pilier ensemble. À la fin, ils avaient une liste de 12 « problèmes » — trois à risque élevé, cinq à risque moyen, quatre à faible risque.

**Problèmes à risque élevé** :

1. Pas de plan de reprise après sinistre multi-régions (fiabilité)
2. Patching de sécurité EC2 non automatisé (sécurité)
3. Pas de processus de réponse aux incidents formel (excellence opérationnelle)

**Problèmes à risque moyen** :

5 éléments dont : pas d'adoption de Graviton, certaines instances EC2 non dimensionnées correctement, pas de runbook formel pour le basculement de base de données

**Problèmes à faible risque** :

4 éléments dont : le taux de cache hit CloudFront pourrait être plus élevé avec des TTLs ajustés, quelques règles de groupe de sécurité plus larges que nécessaire

**Le Lens : Spécialiser la Revue**

Le Well-Architected Framework de base est agnostique à la technologie. AWS publie également des **Lenses** — des extensions du cadre pour des cas d'utilisation ou des industries spécifiques :

- **Serverless Lens** : Questions supplémentaires pour les architectures fortement basées sur Lambda
- **SaaS Lens** : Pour les applications SaaS multi-locataires
- **Machine Learning Lens** : Pour les charges de travail d'entraînement et d'inférence ML
- **Financial Services Lens** : Questions réglementaires et de conformité pour la FinTech
- **Healthcare Lens** : Considérations HIPAA

Pour Nimbus, le SaaS Lens était pertinent. Il ajoutait des questions sur l'isolation des locataires, l'automatisation de l'intégration et l'allocation des coûts par locataire — tous des domaines que Nimbus développait activement.

**La Différence Entre Bien Conçu et Qui Fonctionne Simplement**

« Notre système fonctionne, » dit Leo après la revue. « Mais je ne m'étais pas rendu compte du nombre de choses qu'on avait faites "assez bien" et sur lesquelles on était passé à autre chose. »

« C'est normal, » dit Priya. « Construire sous pression temporelle signifie que vous faites des choix pragmatiques. La Well-Architected Review est le moment planifié pour les revisiter. »

« Certaines de ces lacunes semblent évidentes avec le recul, » continua-t-il. « Le patching de sécurité — je savais qu'on ne l'avait pas automatisé. Je ne l'avais juste jamais priorisé pour le corriger. »

« Parce que "ça fonctionne" et "c'est bien architecturé" se ressemblent au quotidien, » dit Maya. « La différence ne devient visible que quand quelque chose va mal. »

C'est l'une des choses les plus importantes qu'un ingénieur senior comprend : l'absence d'incidents ne signifie pas l'absence de risque. Cela signifie que le risque ne s'est pas encore déclenché.

**Infrastructure as Code : L'Activateur de l'Excellence Opérationnelle**

Un thème récurrent dans plusieurs piliers : l'**Infrastructure as Code (IaC)**.

Si votre infrastructure est configurée manuellement via la console, alors :

- La recréer dans un scénario de reprise après sinistre est lente et sujette aux erreurs
- Auditer les changements est impossible (qui a changé quoi, et quand ?)
- Annuler un mauvais changement nécessite une inversion manuelle
- La cohérence entre les environnements (dev/staging/production) nécessite de la discipline

**AWS CloudFormation** vous permet de définir l'infrastructure en templates YAML/JSON. **AWS CDK (Cloud Development Kit)** vous permet de définir l'infrastructure en utilisant des langages de programmation (Python, TypeScript, Java). **Terraform** est une alternative tierce populaire.

Nimbus avait progressivement migré vers IaC en utilisant Terraform. Au moment de la Well-Architected Review, environ 60% de leur infrastructure était définie en code. La revue recommandait d'atteindre 100%.

« Pourquoi les 40% restants ? » demanda Leo.

« Les 40% restants sont là où se trouve notre infrastructure critique, » dit Priya. « Si on ne peut pas la recréer depuis le code, on ne peut pas récupérer de manière fiable d'une catastrophe régionale. »

## Points Forts et Limites

**Ce que le Well-Architected Framework fait bien** : Il donne aux équipes un vocabulaire partagé pour discuter des compromis architecturaux — un langage qui survit aux changements de personnel et aux conversations avec les fournisseurs. Faire une Well-Architected Review force une reconnaissance explicite des risques qui seraient autrement invisibles : « Oui, on sait qu'on a un point de défaillance unique ici ; on a accepté ce compromis parce que le coût de l'éliminer dépasse le coût attendu de la défaillance. » Ce type de compromis documenté et intentionnel est la sortie d'une bonne revue.

**Ce qu'il ne peut pas faire** : Le Framework est descriptif, pas prescriptif. Il décrit les propriétés des systèmes bien architecturés — il ne vous dit pas comment les construire. Cocher toutes les cases d'une Well-Architected Review ne garantit pas une bonne architecture. Un système peut être hautement disponible, opérationnellement excellent, optimisé en coûts, et résoudre quand même le mauvais problème. Le Framework est un prisme, pas un plan. Utilisez-le pour faire émerger les bonnes questions, pas pour y répondre.

## Résumé

- Le **AWS Well-Architected Framework** a six piliers : Excellence Opérationnelle, Sécurité, Fiabilité, Efficacité des Performances, Optimisation des Coûts et Durabilité.
- Chaque pilier a des principes de conception et des meilleures pratiques évalués via un ensemble de questions structurées.
- L'**Outil Well-Architected** (gratuit dans la console AWS) guide la revue et génère un rapport.
- La sortie est une liste priorisée d'améliorations architecturales catégorisées par risque.
- Les **Lenses** spécialisent le cadre pour des domaines spécifiques (serverless, SaaS, santé, ML).
- L'**Infrastructure as Code** est un activateur inter-piliers — recommandé par les piliers Excellence Opérationnelle, Sécurité et Fiabilité.
- Une Well-Architected Review n'est pas un test réussite/échec. C'est une conversation d'amélioration structurée.

## Conseils pour l'Examen

*Domaine SAA-C03 : Inter-domaines — tous les domaines*

- **Connaissez les six piliers et leur focus principal**. L'examen décrira un scénario (ex : « l'équipe veut s'assurer que leur système peut récupérer des défaillances d'AZ ») et vous demandera à quel pilier il appartient (Fiabilité).
- **Correspondance des piliers** :
  - « Déployer les changements de manière fiable, apprendre des échecs, surveiller » → Excellence Opérationnelle
  - « IAM, chiffrement, contrôles réseau, détection des menaces » → Sécurité
  - « HA, basculement, mise à l'échelle, reprise après sinistre » → Fiabilité
  - « Dimensionnement correct, CDN, bonne sélection de technologie » → Efficacité des Performances
  - « Modèles de tarification, ressources inutilisées, visibilité des coûts » → Optimisation des Coûts
  - « Efficacité énergétique, utilisation des ressources, cycle de vie des données » → Durabilité
- **Infrastructure as Code** : Recommandé par le cadre pour la répétabilité, l'auditabilité et la récupération. CloudFormation, CDK et SAM sont des outils IaC natifs AWS.
- **Outil Well-Architected** : L'outil de la console AWS qui guide le processus de revue. Gratuit à utiliser. Génère des plans d'amélioration.
- **AWS Trusted Advisor** : Similaire au Well-Architected Framework mais automatisé — scanne votre compte et fournit des recommandations sur les coûts, les performances, la sécurité et la tolérance aux pannes. Le chevauchement est réel : Trusted Advisor automatise certaines de ce que le cadre évalue manuellement.

## Exercices

**Exercice 1 — Mémorisation**

Nommez les six piliers du AWS Well-Architected Framework et décrivez la préoccupation principale de chacun en une phrase.

*(Essayez de le faire de mémoire. Si vous avez du mal, c'est une information utile sur les piliers qui nécessitent plus d'attention.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une équipe d'ingénierie se prépare à une Well-Architected Review. Son application tourne sur EC2 avec RDS Multi-AZ. Récemment, elle a découvert que :

- Leur processus de déploiement laisse parfois les instances EC2 avec des versions de bibliothèques différentes (dérive de configuration)
- Ils n'ont pas d'alerte automatisée quand le basculement RDS est déclenché
- Leurs utilisateurs IAM ont tous AdministratorAccess
- Ils n'ont pas testé leur processus de restauration des sauvegardes en 14 mois

Associez chaque problème au pilier Well-Architected LE PLUS PERTINENT.

A) Dérive de configuration : Excellence Opérationnelle ; Pas d'alerte basculement RDS : Fiabilité ; AdministratorAccess : Sécurité ; Pas de test de restauration : Fiabilité

B) Dérive de configuration : Sécurité ; Pas d'alerte basculement RDS : Efficacité des Performances ; AdministratorAccess : Excellence Opérationnelle ; Pas de test de restauration : Optimisation des Coûts

C) Dérive de configuration : Fiabilité ; Pas d'alerte basculement RDS : Efficacité des Performances ; AdministratorAccess : Sécurité ; Pas de test de restauration : Excellence Opérationnelle

D) Dérive de configuration : Sécurité ; Pas d'alerte basculement RDS : Fiabilité ; AdministratorAccess : Optimisation des Coûts ; Pas de test de restauration : Sécurité

**Indice 1** : « Dérive de configuration » dans le processus de déploiement → quel pilier couvre les pratiques de déploiement ?

**Indice 2** : « AdministratorAccess » pour tous les utilisateurs → quel pilier couvre le contrôle d'accès ?

**Indice 3** : « Test de restauration des sauvegardes non testé » → quel pilier couvre le test de vos mécanismes de récupération ?

**Réponse** : A

**Explication** : La dérive de configuration dans les déploiements (environnements incohérents) est un problème d'Excellence Opérationnelle — c'est une question de pratiques de déploiement fiables et cohérentes. Pas d'alerte sur le basculement RDS signifie que vous ne savez pas quand les mécanismes HA sont déclenchés — un problème de Fiabilité (connaître la santé de votre système). AdministratorAccess pour tous les utilisateurs viole le moindre privilège — un problème de Sécurité. La restauration des sauvegardes non testée signifie que vos mécanismes de Fiabilité (reprise après sinistre) ne sont pas vérifiés.

**Pourquoi pas B ?** B assigne à tort la dérive de configuration à la Sécurité (l'incohérence des versions de bibliothèques est un problème d'opérations de déploiement, pas une menace sécuritaire) et AdministratorAccess à l'Excellence Opérationnelle (le contrôle d'accès est une préoccupation de Sécurité, pas un processus opérationnel).

**Pourquoi pas C ?** C place correctement AdministratorAccess en Sécurité mais assigne à tort la dérive de configuration à la Fiabilité (la cohérence des déploiements est l'Excellence Opérationnelle) et la restauration des sauvegardes non testée à l'Excellence Opérationnelle (tester la récupération est une préoccupation de Fiabilité — vous vérifiez que votre système peut récupérer, pas que vos processus sont cohérents).

**Pourquoi pas D ?** D assigne AdministratorAccess à l'Optimisation des Coûts (des permissions trop larges n'ont rien à voir avec le coût) et la restauration des sauvegardes non testée à la Sécurité (ne pas pouvoir restaurer une sauvegarde est un échec de Fiabilité, pas une vulnérabilité de sécurité).

*Domaine SAA-C03 : Inter-domaines*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Faites une mini Well-Architected Review d'une application que vous connaissez ou que vous construisez. Pour chacun des six piliers, écrivez :

- Une chose que l'application fait bien
- Une chose que l'application pourrait améliorer

Ensuite, classez vos éléments d'amélioration par risque (qu'est-ce qui est le plus susceptible de causer un incident ou du gaspillage ?) et par priorité (qu'est-ce qui aurait le plus grand impact si corrigé ?).

*(Cet exercice est plus précieux qu'il ne peut le sembler. La pratique d'évaluer systématiquement l'architecture sous plusieurs angles est une compétence clé d'ingénieur senior.)*

## Scène Post-Générique

Trois semaines après la Well-Architected Review, l'équipe avait implémenté les trois corrections à risque élevé.

Le patching EC2 était maintenant automatisé via AWS Systems Manager Patch Manager. Un document de processus de réponse aux incidents existait (pas parfait, mais écrit et partagé). Le plan de warm standby multi-régions était rédigé et planifié pour une mise en œuvre le prochain trimestre.

Priya examina le rapport de l'Outil Well-Architected. Nombre à risque élevé : 0. Risque moyen : 3. Risque faible : 4.

« On est dans une meilleure forme qu'avant, » dit-elle.

« C'est bien ? » demanda Leo.

« C'est du progrès, » dit-elle. « Vous ne finissez pas une Well-Architected Review. Vous faites des progrès, puis vous revoyez à nouveau dans six mois. »

Maya pensait à quelque chose.

« On a passé 31 chapitres à apprendre des services AWS individuels, » dit-elle. « Et maintenant on commence à regarder l'ensemble du système. C'est ainsi que pensent les architectes. »

« On a pensé comme des architectes depuis un moment, » dit Leo.

« On a pris des décisions architecturales, » dit Maya. « C'est différent. Penser comme un architecte signifie que vous évaluez les décisions *avant* de les prendre, pas après. »

« Quelle est la différence ? » demanda Tom.

« Dans le prochain chapitre, » dit-elle, « on essaie d'y répondre. »

Dans le prochain chapitre : à quoi ressemble une vraie revue d'architecture, depuis les premiers principes.
