# Chapitre 8 : L'administrateur de base de données qui ne tombe jamais malade

Il était 3h du matin quand l'alerte arriva.

Le serveur de base de données avait besoin d'un correctif de sécurité — le type qui nécessitait un redémarrage. La
vulnérabilité était réelle, le correctif était disponible, et la fenêtre pour l'appliquer
sans perturber les clients était maintenant, au milieu de la nuit, quand le trafic
était faible.

Priya était la seule éveillée. Elle a appliqué le correctif, redémarré le serveur, regardé
les logs jusqu'à ce que l'application revienne en ligne, et s'est couchée à 4h15.

Le matin, elle a dit à l'équipe ce qui s'était passé. Il y eut un silence.

« Ça va se reproduire », dit Tom.

« Ça va se reproduire chaque fois qu'il y a un correctif », dit Priya. « Et il y a toujours
des correctifs. Il doit y avoir une meilleure façon de faire ça. »

Il y en avait une. Il fallait juste accepter l'idée qu'ils n'avaient pas besoin de gérer
la base de données eux-mêmes.

**Le problème traditionnel des bases de données**

Quand vous faites tourner une base de données vous-même sur une instance EC2, vous êtes responsable de tout.

Installer le logiciel de base de données. Le configurer de façon sécurisée. Le patcher quand des vulnérabilités de
sécurité sont découvertes. Prendre des sauvegardes. Tester que les sauvegardes fonctionnent vraiment
(une étape que la plupart des équipes sautent jusqu'à ce qu'il soit trop tard). Surveiller l'espace disque. Configurer la
réplication pour la redondance. Configurer le basculement pour quand le serveur principal tombe en panne.
Ajuster les performances des requêtes. Gérer les connexions sous charge.

Rien de tout ça n'est l'application. Rien de tout ça n'ajoute de fonctionnalités. Tout ça requiert de l'expertise.

La plupart des équipes de développement ne sont pas des administrateurs de bases de données. Cela crée un schéma prévisible :
la base de données est installée, configurée minimalement, puis principalement oubliée jusqu'à ce que quelque chose
aille catastrophiquement mal.

« C'est ce qu'on a fait ? » demanda Maya.

La réponse de Leo était le silence, ce qui valait comme oui.

**Amazon RDS : La base de données gérée**

**Amazon RDS** — Relational Database Service — gère la charge opérationnelle du fonctionnement
d'une base de données relationnelle pour que vous n'ayez pas à le faire.

Avec RDS, AWS gère :

- L'installation et le patch du moteur de base de données
- Les sauvegardes automatisées (stockées dans S3, conservées jusqu'à 35 jours)
- Le basculement automatique (quand le primaire tombe en panne, un serveur de secours prend le relais automatiquement)
- La surveillance et les métriques
- Le chiffrement au repos et en transit
- La mise à l'échelle automatique du stockage (si vous l'activez, le disque grandit quand il est plein)

Vous gérez :

- Le schéma de la base de données (la structure de vos tables)
- Vos requêtes et votre logique d'application
- Qui a accès à la base de données
- Quel type d'instance fait tourner la base de données
- L'ajustement des paramètres (bien que RDS fournisse des valeurs par défaut sensées)

L'analogie : embaucher un administrateur de base de données qui ne prend jamais de congé maladie, ne fait jamais d'erreurs
de configuration, prend automatiquement des sauvegardes quotidiennes, et se répare si
quelque chose se casse — mais qui n'écrit pas votre logique d'application.

**Moteurs supportés**

RDS supporte plusieurs moteurs de bases de données populaires :

- **MySQL** — la base de données relationnelle open source la plus utilisée
- **PostgreSQL** — puissant, extensible, de plus en plus populaire pour les charges de travail complexes
- **MariaDB** — fork MySQL open source, entièrement compatible
- **Oracle** — niveau entreprise, utilisé dans les grandes organisations avec des exigences legacy
- **Microsoft SQL Server** — pour les environnements très Windows
- **Amazon Aurora** — le propre moteur MySQL/PostgreSQL compatible d'AWS, construit pour le cloud
  (nous couvrons Aurora en profondeur au Chapitre 24)

Pour Nimbus, le choix était PostgreSQL. C'est ce que Leo connaissait, et ça gérait bien les données relationnelles.
Le choix du moteur importe moins que vous ne le pensez pour la plupart des applications —
les avantages opérationnels de RDS s'appliquent indépendamment.

**Multi-AZ : Le serveur de secours qui prend le relais**

C'est la fonctionnalité qui change complètement le calcul de fiabilité.

Le **déploiement Multi-AZ** signifie que RDS maintient une instance de secours synchrone dans une
Disponibilité Zone différente de la zone principale. Chaque transaction commitée vers la principale
est répliquée synchronement vers la seconde avant que le commit soit acquitté.

Quand la principale tombe en panne — panne matérielle, panne AZ, crash logiciel — RDS
bascule automatiquement vers la seconde. L'enregistrement DNS pour le point de terminaison de la base de données
est mis à jour. Votre application se reconnecte à la nouvelle principale.

Le basculement prend 60 à 120 secondes. Pendant cette fenêtre, votre application connaîtra
des erreurs de connexion. Les applications correctement écrites devraient gérer ça gracieusement (reprises de connexion
avec backoff).

La seconde n'est pas un réplica de lecture. Elle ne sert pas de trafic de lecture. Son seul objectif est
d'être prête à prendre le relais.

Tom : « Combien coûte Multi-AZ ? »

Environ le double du coût d'une seule instance — parce que vous faites littéralement tourner deux
instances de base de données. La seconde coûte autant que la principale.

Tom : « Et combien coûte une panne imprévue ? »

Il a répondu à sa propre question en ouvrant l'historique des commandes et en estimant les revenus
par heure pendant leur pic du vendredi.

Multi-AZ a été activé cet après-midi-là.

**Sauvegardes automatisées et récupération à un instant donné**

RDS prend des sauvegardes automatisées chaque jour. AWS stocke ces sauvegardes dans S3 (gérées par
RDS — vous ne les voyez pas directement dans votre console S3). Vous pouvez restaurer la base de données
à n'importe quel point dans votre période de rétention de sauvegarde.

Les sauvegardes se produisent pendant une **fenêtre de maintenance** configurable — une période de faible trafic,
généralement tôt le matin. Pour la plupart des types de moteurs, les sauvegardes ne causent pas de temps d'arrêt.

La **récupération à un instant donné** est l'une des fonctionnalités les plus précieuses : vous pouvez restaurer à
n'importe quelle seconde dans votre période de rétention. Pas seulement des snapshots quotidiens — *n'importe quelle seconde*.
C'est possible parce que RDS archive en continu les logs de transactions en plus des
sauvegardes quotidiennes.

Si quelqu'un exécute accidentellement `DELETE FROM orders WHERE 1=1` à 14h37, vous pouvez
restaurer à 14h36.

Leo s'est visiblement détendu quand il a compris ça.

« Est-ce qu'on aurait pu récupérer ce que j'ai supprimé le mois dernier ? » demanda-t-il.

« Avant RDS ? Non », dit Priya. « Après RDS ? Oui. »

**Réplicas de lecture : Mettre à l'échelle le trafic de lecture**

Multi-AZ concerne la disponibilité. Les **réplicas de lecture** concernent les performances.

Un réplica de lecture est une copie asynchrone de votre base de données principale qui peut servir des
requêtes de lecture. Vous pouvez avoir jusqu'à cinq réplicas de lecture pour la plupart des moteurs RDS (plus pour Aurora).

L'application est modifiée pour envoyer les requêtes de lecture au réplica et les requêtes d'écriture à
la principale. Cela distribue la charge : la principale gère les écritures et les transactions complexes ;
les réplicas gèrent les lectures.

Caractéristiques clés :

- La réplication est **asynchrone** — il peut y avoir un petit délai (lag) entre la
  principale et le réplica. Si vous écrivez un enregistrement et lisez immédiatement depuis le réplica,
  vous pourriez ne pas le voir encore.
- Les réplicas de lecture peuvent être dans la même Région ou dans une Région différente (les
  réplicas inter-Régions ajoutent de la latence mais permettent la distribution géographique).
- Les réplicas de lecture peuvent être promus en bases de données autonomes dans un scénario de sinistre.

Pour Nimbus : les recherches de menus sont des lectures. L'historique des commandes est des lectures. La grande majorité du
trafic est du trafic de lecture. Ajouter un réplica de lecture et router les lectures vers lui réduit
significativement la charge de la base de données principale.

Nous couvrons les réplicas de lecture plus en détail au Chapitre 24 quand nous discutons d'Aurora.

**Groupes de paramètres et d'options RDS**

Deux mécanismes de configuration qui apparaissent à l'examen :

Les **groupes de paramètres** contrôlent les paramètres du moteur de base de données — comme le nombre maximum de connexions,
la taille du cache de requêtes, les valeurs de timeout. RDS crée un groupe de paramètres par défaut qui fonctionne
pour la plupart des cas. Vous créez des groupes de paramètres personnalisés quand vous avez besoin d'ajuster des paramètres spécifiques.

Les **groupes d'options** activent des fonctionnalités supplémentaires pour certains moteurs — comme le chiffrement réseau
natif d'Oracle ou le chiffrement transparent des données de SQL Server. La plupart des déploiements de moteurs open source
n'ont pas besoin de groupes d'options personnalisés.

Vous n'avez pas besoin de les mémoriser. Sachez qu'ils existent pour personnaliser le comportement du moteur de base de données.

## Forces et limites

**Pourquoi RDS est excellent** :

- Élimine la charge opérationnelle de la gestion du logiciel de base de données
- Sauvegardes automatisées et récupération à un instant donné
- Multi-AZ pour un basculement automatique avec un RTO minimal
- Réplicas de lecture pour mettre à l'échelle le trafic de lecture
- Chiffrement au repos et en transit intégré
- Tous les principaux moteurs de bases de données relationnelles supportés

**Là où RDS a des limites** :

- Vous ne pouvez pas accéder au système d'exploitation sous-jacent. Vous ne pouvez pas installer des logiciels au niveau du
  système d'exploitation ou changer les paramètres du système d'exploitation. Si votre base de données a des exigences qui demandent
  un accès au niveau du système d'exploitation, vous pourriez avoir besoin de faire tourner votre propre base de données basée sur EC2.
- RDS n'est pas serverless (avec des exceptions — Aurora Serverless existe, couvert au
  Chapitre 24). Vous payez pour une instance en cours d'exécution même si elle est inactive.
- RDS n'est pas conçu pour les bases de données à sharding horizontal. Pour une mise à l'échelle massive des
  charges de travail relationnelles intensives en écriture, vous pourriez éventuellement avoir besoin d'une architecture différente.
- Pour les schémas de données non relationnels (NoSQL), DynamoDB (Chapitre 9) est plus approprié.

## Résumé

- **Amazon RDS** est un service de base de données relationnelle géré. AWS gère le patch,
  les sauvegardes, le basculement et la gestion du stockage. Vous gérez le schéma, les requêtes et
  la logique d'application.
- Le déploiement **Multi-AZ** maintient une seconde synchrone dans une AZ différente.
  Le basculement automatique se produit en 60 à 120 secondes si la principale tombe en panne.
- Les **sauvegardes automatisées** avec **récupération à un instant donné** vous permettent de restaurer à n'importe quelle
  seconde dans la période de rétention.
- Les **réplicas de lecture** sont des copies asynchrones qui servent le trafic de lecture, réduisant
  la charge sur la principale. Le lag de réplication signifie qu'ils peuvent être légèrement en retard.
- Choisissez RDS quand vous avez besoin d'une base de données relationnelle avec des opérations gérées. Utilisez Aurora
  (Chapitre 24) quand vous avez besoin de performances plus élevées ou d'options serverless.

## Conseils pour l'examen

*Domaine SAA-C03 3 — Tâche 3.3 (solutions de bases de données)*

- **Multi-AZ est pour la haute disponibilité, pas les performances.** La seconde ne sert pas
  de trafic de lecture. Les réplicas de lecture sont pour les performances. Cette distinction est testée fréquemment.
- **Le basculement Multi-AZ est automatique.** Vous ne configurez pas quand ou comment ça se produit.
  RDS surveille la principale et déclenche le basculement automatiquement.
- **Le lag de réplication importe.** Les réplicas de lecture peuvent être légèrement en retard sur la principale.
  Si votre application nécessite de lire des données qu'elle vient d'écrire, elle doit lire depuis la
  principale, pas le réplica. C'est ce qu'on appelle la « cohérence de lecture-après-écriture ».
- **Les sauvegardes automatisées sont conservées pendant 0 à 35 jours.** Mettre la rétention à 0
  désactive les sauvegardes automatisées. Les snapshots manuels sont conservés indéfiniment jusqu'à
  ce que vous les supprimiez.
- **La mise à l'échelle automatique du stockage RDS** prévient les pannes dues à un disque plein. Activez-la. Elle s'adapte
  seulement à la hausse, jamais à la baisse. L'examen peut tester si vous connaissez cette asymétrie.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre Multi-AZ et les réplicas de lecture dans RDS ?
Quel problème chacun résout-il ?

*(Indice : L'un protège contre les temps d'arrêt ; l'autre améliore les performances sous une
charge intensives en lecture. Ils résolvent des problèmes différents et peuvent être utilisés ensemble.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise fait tourner une base de données PostgreSQL de production sur RDS. La base de données
connaît un trafic de lecture élevé dû à des requêtes de rapport s'exécutant tout au long de la journée.
L'équipe s'inquiète aussi de la disponibilité de la base de données — ils ne peuvent pas se permettre plus de
quelques minutes de temps d'arrêt dans un scénario de panne. Ils veulent minimiser l'impact sur la
base de données principale des charges de travail de rapport.

Quelle combinaison de fonctionnalités RDS répond LE MIEUX aux deux préoccupations ?

A) Activer Multi-AZ et exécuter toutes les requêtes contre l'instance de secours  
B) Activer Multi-AZ pour la protection de basculement et créer un réplica de lecture pour les requêtes de rapport  
C) Créer plusieurs réplicas de lecture et désactiver Multi-AZ pour réduire les coûts  
D) Prendre des snapshots manuels plus fréquents et restaurer à partir d'eux si la principale tombe en panne

**Indice 1** : Les deux exigences sont : (1) disponibilité lors d'une panne, (2) décharge des lectures.
Quelles fonctionnalités répondent à quelle exigence ?

**Indice 2** : Multi-AZ fournit un basculement automatique. La seconde ne sert PAS de trafic de lecture.
Donc Multi-AZ seul n'aide pas avec le problème de lecture.

**Indice 3** : Les réplicas de lecture servent le trafic de lecture. Multi-AZ fournit le basculement. Vous avez besoin des deux.

**Réponse** : B

**Explication** : Multi-AZ fournit un basculement automatique vers une seconde dans une AZ différente —
cela répond à l'exigence de disponibilité. Un réplica de lecture permet aux requêtes de rapport
de s'exécuter sans impacter la base de données principale — cela répond à l'exigence de performance.
Les deux fonctionnalités peuvent être utilisées simultanément.

**Pourquoi pas A ?** La seconde Multi-AZ ne peut pas servir de trafic de lecture. Elle est exclusivement pour
le basculement. Tenter de la requêter directement n'est pas supporté.

**Pourquoi pas C ?** Les réplicas de lecture aident avec les performances de lecture mais ne fournissent pas
de basculement automatique. Si la principale tombe en panne, vous devriez promouvoir manuellement un réplica de lecture —
ce qui prend du temps et n'est pas automatique.

**Pourquoi pas D ?** Les snapshots manuels restaurent une copie complète de la base de données — un processus beaucoup plus long
(potentiellement des heures pour les grandes bases de données). Cela ne répond pas à une exigence de « quelques minutes
de temps d'arrêt ».

*Domaine SAA-C03 3 — Tâche 3.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus envisage de migrer leur base de données PostgreSQL auto-gérée existante
(tournant sur une instance EC2) vers RDS PostgreSQL. La migration doit se faire
avec un temps d'arrêt minimal — idéalement moins de 15 minutes. La base de données fait 200 Go.

Quelle approche recommanderiez-vous ? Quels services AWS pourraient aider avec la migration ?
Quels risques testeriez-vous avant de basculer le trafic de production ?

*(Il n'y a pas de réponse unique correcte. Pensez à AWS Database Migration Service,
la réplication logique, et le risque d'incohérence des données lors du basculement.)*

## Scène post-générique

À la fin de la journée, Nimbus avait migré vers RDS PostgreSQL avec Multi-AZ activé. La
migration elle-même avait pris la majeure partie de l'après-midi — Leo avait utilisé une approche de sauvegarde-et-restauration,
avec une brève fenêtre de maintenance.

Tom avait regardé la facture attentivement.

« L'instance RDS », dit-il, « coûte deux fois plus que la base de données EC2. »

« Et les sauvegardes automatisées ? » demanda Maya.

« Un peu plus. »

« Et le basculement qu'on obtiendra gratuitement si la principale tombe en panne ? »

Tom n'avait pas de prix pour ça. Il l'a noté comme une question.

Trois jours plus tard, la base de données était saine. Les temps de requête avaient baissé quelque peu mais pas
assez. Le menu était encore lent à charger. Vingt-deux mille éléments. Vingt-deux mille
lignes dans une requête qui les retournait tous, à chaque fois.

« Le problème », dit Priya, « n'est pas le moteur de base de données. C'est le modèle de données. »

Elle fit une pause.

« Certaines de ces données ne sont pas du tout relationnelles. Les éléments de menu, les profils de restaurant,
les zones de livraison — ces données ont des formes variables. SQL nous combat. »

Leo cherchait déjà quelque chose.

« Et si on utilisait un autre type de base de données pour le menu ? » dit-il.

Dans le prochain chapitre : la base de données qui ne ralentit pas, même quand un million de personnes commandent à la fois.
