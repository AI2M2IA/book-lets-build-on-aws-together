# Chapitre 24 : La Base de Données Qui Grandit Avec Vous

La revue des coûts de Tom avait trouvé quelque chose d'inattendu dans le niveau de base de données.

Nimbus utilisait RDS PostgreSQL : Multi-AZ, instance db.r6g.large. 340 $/mois.

« Ça semble élevé, » dit Tom. « Mais je ne sais pas quoi comparer. »

Leo consulta les métriques de performance. Le CPU de la base de données atteignait des pics à 85% pendant le rush du dîner du vendredi. Les requêtes de lecture s'accumulaient. La latence P95 des requêtes avait doublé en six mois.

« La base de données est le goulot d'étranglement, » dit-il. « Le trafic a augmenté. La base de données ne s'est pas adaptée. »

« On peut juste agrandir l'instance ? » demanda Maya.

« Oui, » dit Leo. « C'est de la mise à l'échelle verticale. On passe de r6g.large à r6g.xlarge. Plus de CPU, plus de mémoire. Ça coûtera plus et nous donnera du temps. »

« Mais ça ne résout pas le problème sous-jacent, » dit Priya. « Éventuellement on atteindra la plus grande instance et aura besoin d'une approche différente. »

« Il y a deux approches, » dit Leo. « Les réplicas de lecture, ou Aurora. »

« Quelle est la différence ? »

Bonne question. Le reste de ce chapitre est la réponse.

Imaginez une bibliothèque animée avec un seul bibliothécaire qui à la fois enregistre les livres et répond aux questions des usagers. Quand la bibliothèque devient populaire, une file se forme. La solution : embaucher plus de bibliothécaires — mais seulement pour répondre aux questions. L'enregistrement passe toujours par le bureau d'origine. C'est un réplica de lecture : capacité supplémentaire qui gère les lectures, pendant que toutes les écritures passent toujours par l'unique source faisant autorité. Aurora va plus loin, en repensant le système de rangement lui-même de sorte que chaque bibliothécaire partage les mêmes étagères et voie toujours les mêmes livres, sans délai.

**Réplicas de Lecture : Distribuer le Trafic de Lecture**

La plupart des applications web lisent les données bien plus souvent qu'elles n'écrivent. Un client parcourant le menu effectue des dizaines de requêtes SELECT. Passer une commande effectue quelques requêtes INSERT/UPDATE. Le ratio est typiquement de 10:1 ou plus.

Un **réplica de lecture** est une instance RDS supplémentaire qui reçoit une copie de toutes les écritures de la primaire et met ces écritures à disposition pour les requêtes SELECT.

Comment ça fonctionne :

1. Les écritures de l'application (INSERT, UPDATE, DELETE) vont vers la base de données primaire
2. La primaire réplique ces changements de manière asynchrone vers les réplicas de lecture
3. Les lectures de l'application (SELECT) sont distribuées sur les réplicas de lecture
4. Les réplicas de lecture partagent la charge — chacun gère une fraction du trafic de lecture total

Résultat : la base de données primaire ne gère que les écritures (et optionnellement quelques lectures). Les réplicas de lecture gèrent la charge de lecture. Pour un ratio lecture/écriture de 10:1, l'ajout d'un réplica de lecture réduit approximativement de moitié la charge totale de la primaire.

**Limitation importante** : La réplication est **asynchrone**. Il y a un délai de réplication — typiquement des millisecondes, mais peut être des secondes sous charge. Une lecture depuis un réplica pourrait voir des données légèrement en retard par rapport à la primaire. Pour la plupart des lectures (parcourir le menu, consulter l'historique des commandes), c'est acceptable. Pour « est-ce que ma commande vient de passer ? » — lire depuis la primaire.

**Réplicas de Lecture : Les Détails**

- Vous pouvez avoir jusqu'à 5 réplicas de lecture par instance RDS primaire
- Les réplicas de lecture peuvent être dans la même région ou une région différente (réplicas inter-régions)
- Les réplicas de lecture peuvent eux-mêmes avoir des réplicas de lecture (chaînage)
- Les réplicas de lecture sont des endpoints séparés — votre application doit diriger les lectures vers l'endpoint du réplica
- Les réplicas de lecture peuvent être promus en bases de données autonomes (utile pour la reprise après sinistre)

Pour Nimbus, Leo a ajouté un réplica de lecture. Il a mis à jour l'application pour :

- Opérations d'écriture → endpoint primaire
- Navigation dans les menus, historique des commandes → endpoint du réplica

Le CPU sur la primaire est passé de 85% à 41% en pic.

Tom regarda le coût : un réplica de lecture du même type d'instance coûte autant que la primaire. De 340 $/mois à 680 $/mois.

« On a doublé le coût pour à peu près diviser la charge par deux, » dit Tom.

« Oui. Mais l'alternative était de passer à un type d'instance plus grand, ce qui coûterait aussi plus cher et ne distribuerait pas la charge de lecture. »

Tom fit le calcul. Il hocha la tête, à contrecœur.

« C'est quoi Aurora ? » demanda-t-il.

**Amazon Aurora : Repenser le Moteur de Base de Données**

Aurora est le moteur de base de données relationnelle propriétaire d'AWS, compatible avec MySQL et PostgreSQL. Il a été conçu de zéro pour les charges de travail cloud, en repensant le fonctionnement de la couche de stockage d'une base de données relationnelle.

Dans une configuration RDS traditionnelle (MySQL, PostgreSQL), le stockage et le calcul sont étroitement couplés. Le moteur de base de données gère les fichiers de données. La réplication copie les données de la primaire vers le réplica. Le réplica doit refaire chaque opération d'écriture.

Aurora sépare le stockage du calcul. Il utilise une couche de stockage distribuée et tolérante aux pannes qui réplique automatiquement les données dans trois Zones de Disponibilité en six copies. La couche de calcul (les instances de base de données) se trouve au-dessus de cette couche de stockage.

**Ce que cela change** :

**Réplicas de lecture** : Les réplicas Aurora n'ont pas besoin de répliquer les données — ils partagent déjà la même couche de stockage. Cela signifie :

- Jusqu'à 15 réplicas de lecture (vs 5 pour RDS standard)
- Le délai de réplication est typiquement inférieur à 100 millisecondes (vs secondes pour RDS sous charge)
- Les réplicas peuvent être promus en primaire en moins de 30 secondes (vs minutes)

**Basculement** : Comme les réplicas partagent le stockage, le basculement est bien plus rapide — la promotion n'implique pas de transfert de données, juste de rediriger les écritures.

**Stockage** : Aurora fait automatiquement évoluer le stockage par incréments de 10 Go, jusqu'à 128 To. Vous ne provisionnez jamais le stockage à l'avance.

**Performance** : Aurora revendique 5 fois le débit de MySQL standard et 3 fois PostgreSQL standard pour des types d'instances équivalents.

**Tarification Aurora : La Question de Tom**

« Combien ça coûte ? » demanda Tom.

La tarification Aurora est différente de celle de RDS :

**Tarification des instances** : Similaire à la tarification des instances RDS par type.

**Tarification du stockage** : 0,10 $ par Go par mois (vous payez pour ce qui est stocké, mis à l'échelle automatiquement).

**Tarification des E/S** : Aurora facture par requête E/S (lecture/écriture vers le stockage). Cela peut être significatif pour les charges de travail à forte écriture.

« Attendez, » dit Tom. « On paie pour les E/S séparément ? »

« Aurora Serverless v2 et Aurora I/O-Optimized changent ce modèle de tarification, » dit Leo. « Aurora I/O-Optimized ne facture pas les E/S mais a un prix de stockage et d'instance plus élevé. Meilleur pour les charges de travail à forte E/S. »

Tom regarda le compromis. Pour Nimbus, qui était à forte lecture (beaucoup de requêtes de menus, peu d'écritures), Aurora I/O-Optimized pourrait coûter plus cher. La tarification Aurora standard pourrait être appropriée.

C'est une vraie décision de coût que les ingénieurs seniors prennent : vous devez connaître les modèles E/S de votre charge de travail pour choisir correctement.

**Aurora Serverless : Mise à l'Échelle Sans Penser aux Instances**

**Aurora Serverless v2** est une configuration qui met automatiquement à l'échelle la capacité de calcul en fonction de la charge réelle de la base de données. Au lieu de choisir une taille d'instance fixe (db.r6g.large), vous définissez une capacité minimale et maximale en Aurora Capacity Units (ACUs).

Aurora Serverless v2 :

- Évolue à la hausse en quelques secondes quand la charge augmente
- Évolue à la baisse vers presque zéro pendant les périodes inactives
- Coût : 0,12 $ par ACU-heure (plus le stockage et les E/S)

Pour les charges de travail à trafic variable — les pics du vendredi de Nimbus vs la tranquillité du lundi matin — Serverless v2 réduit les coûts pendant les périodes creuses et gère les pics sans préprovisionning.

« Donc pendant le pic du vendredi, » dit Leo, « Aurora évolue automatiquement à la hausse. Le dimanche matin quand on a presque pas de trafic, il redescend au minimum. »

« Et on ne paie que pour la capacité qu'on utilise, » dit Tom.

« Correct. »

Tom avait l'expression de quelqu'un qui avait trouvé exactement ce qu'il cherchait.

**Aurora Global Database : Lectures Multi-Régions**

**Aurora Global Database** étend Aurora sur plusieurs régions AWS :

- **Une région primaire** gère toutes les écritures
- **Jusqu'à cinq régions secondaires** servent les lectures avec typiquement < 1 seconde de délai de réplication
- Les régions secondaires peuvent être promues en primaire en moins d'1 minute (pour les scénarios de reprise après sinistre)

Pour l'expansion mondiale de Nimbus, Aurora Global Database permettrait à un partenaire restaurant à Londres d'interroger son menu local depuis le réplica de lecture EU, pendant que toutes les commandes (écritures) passent toujours par la primaire US.

**RDS vs Aurora : Quand Choisir Lequel**

| Facteur               | RDS (PostgreSQL/MySQL)              | Aurora                                                     |
|-----------------------|-------------------------------------|------------------------------------------------------------|
| Coût                  | Plus faible pour les petites charges | Plus élevé à la base, mais évolue mieux                   |
| Compatibilité         | Complète                            | Compatible MySQL/PostgreSQL (avec quelques différences)    |
| Réplicas max          | 5                                   | 15                                                         |
| Délai de réplica      | Peut être de plusieurs secondes     | Généralement < 100ms                                       |
| Stockage              | Provisionnement fixe                | Auto-évolue jusqu'à 128 To                                 |
| Temps de basculement  | 60-120 secondes                     | < 30 secondes                                              |
| Option serverless     | Limitée                             | Aurora Serverless v2                                       |
| Idéal pour            | Charges stables et prévisibles      | Trafic variable, fort volume de lecture, basculement rapide |

## Points Forts et Limites

**Avantages Aurora** :

- Basculement significativement plus rapide que RDS standard
- Jusqu'à 15 réplicas de lecture avec un délai minimal
- Stockage à mise à l'échelle automatique
- Serverless v2 pour les charges de travail variables
- Global Database pour le déploiement multi-régions

**Limites Aurora** :

- Coût plus élevé pour les petites charges stables
- La tarification des E/S peut être significative pour les charges à forte écriture (utilisez I/O-Optimized pour cela)
- Des différences mineures de compatibilité MySQL/PostgreSQL peuvent nécessiter des changements de code
- Les démarrages à froid de Serverless v2 (depuis presque zéro) peuvent provoquer des pics de latence

## Résumé

- Les **réplicas de lecture** distribuent le trafic de lecture depuis la primaire. Réplication asynchrone — léger délai acceptable pour la plupart des lectures.
- **Aurora** repense la couche de stockage : distribuée, partagée entre les réplicas, à mise à l'échelle automatique.
- Aurora offre : 15 réplicas de lecture, délai de réplica < 100ms, basculement < 30s, jusqu'à 128 To de stockage à mise à l'échelle automatique.
- **Aurora Serverless v2** : met automatiquement à l'échelle la capacité de calcul en fonction de la charge. Bon pour le trafic variable.
- **Aurora Global Database** : primaire dans une région, réplicas de lecture dans jusqu'à cinq régions.
- Choisissez RDS pour les charges plus petites, stables et prévisibles. Choisissez Aurora quand vous avez besoin d'évolutivité, d'un basculement rapide, ou de gestion du trafic variable.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.3)*

- **Réplica Aurora vs réplica de lecture RDS** : Les réplicas Aurora partagent le stockage (délai quasi nul, basculement < 30s). Les réplicas de lecture RDS répliquent les données (délai possible, minutes pour le basculement).
- **Aurora Serverless v2** : « mise à l'échelle automatique de la capacité de base de données », « trafic de base de données imprévisible ou irrégulier », « mise à l'échelle vers zéro » → Aurora Serverless v2.
- **Aurora Global Database** : « base de données multi-régions », « lecture depuis EU avec faible latence depuis une primaire US », « RTO < 1 minute pour le basculement régional » → Aurora Global Database.
- **Temps de basculement** : Aurora < 30 secondes. RDS Multi-AZ 60-120 secondes. Connaissez les deux.
- **Aurora I/O-Optimized** : Coût de stockage et d'instance plus élevé, pas de frais d'E/S par requête. À utiliser quand les coûts d'E/S dominent (forte écriture). Aurora standard : coût de stockage plus faible, payer par E/S. À utiliser pour la forte lecture.
- **Aurora Backtrack** : Rembobiner la base de données à un point spécifique dans le temps sans restaurer depuis un instantané de sauvegarde. Disponible uniquement pour Aurora compatible MySQL. Signal d'examen : « suppression accidentelle de données, besoin de récupérer rapidement sans restaurer une sauvegarde complète ».

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre Aurora et les réplicas de lecture RDS standard. Pourquoi le délai de réplication d'Aurora est-il typiquement plus faible ?

*(Indice : La différence clé est le stockage partagé vs la réplication de données. Réfléchissez à ce que chaque réplica doit faire quand une écriture arrive.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : La base de données MySQL d'une plateforme de médias sociaux connaît une forte latence de lecture due à l'augmentation du trafic. L'application est à forte lecture (95% de lectures, 5% d'écritures). L'équipe a besoin que la latence de lecture soit cohérente, même pendant les pics de trafic. Ils ont besoin d'un basculement automatique avec un temps d'arrêt minimal (RTO cible < 30 secondes). Le volume de données croît de manière imprévisible.

Quelle solution de base de données répond LE MIEUX à ces exigences ?

A) RDS MySQL Multi-AZ avec cinq réplicas de lecture  
B) Aurora MySQL avec des réplicas Aurora et Aurora Serverless v2  
C) RDS MySQL avec un type d'instance plus grand (mise à l'échelle verticale)  
D) DynamoDB avec DynamoDB DAX pour la mise en cache des lectures

**Indice 1** : « RTO < 30 secondes » — quel service atteint cela ? Vérifiez le temps de basculement pour chaque option.

**Indice 2** : « Latence de lecture cohérente pendant les pics » — quel service a des réplicas avec un délai quasi nul vs des secondes potentielles ?

**Indice 3** : « Volume de données qui croît de manière imprévisible » — quel service met automatiquement à l'échelle le stockage ?

**Réponse** : B

**Explication** : Aurora MySQL avec des réplicas Aurora fournit un délai de réplication quasi nul (millisecondes, pas secondes) pour des performances de lecture cohérentes sous charge. Aurora Serverless v2 met automatiquement à l'échelle le calcul pendant les pics de trafic sans surprovisionning. Le stockage Aurora s'adapte automatiquement à la croissance des données. Le basculement Aurora (promotion d'un réplica) se complète en moins de 30 secondes — répondant à l'exigence de RTO.

**Pourquoi pas A ?** Le basculement RDS Multi-AZ prend 60-120 secondes — ne répond pas au RTO < 30 secondes. Le délai des réplicas de lecture RDS standard peut atteindre des secondes sous charge — « cohérent » est plus difficile à garantir.

**Pourquoi pas C ?** La mise à l'échelle verticale (instance plus grande) augmente la capacité mais ne distribue pas la charge de lecture. La base de données reste un point de défaillance unique pour les lectures.

**Pourquoi pas D ?** DynamoDB est NoSQL — migrer de MySQL vers DynamoDB nécessite de rearchitecturer le modèle de données et les requêtes de l'application, ce qui dépasse largement la portée de cette tâche d'amélioration des performances.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus conçoit une expansion mondiale. Ils veulent que les partenaires restaurants sur la Côte Ouest, en Allemagne et en Australie voient rapidement leurs propres données de commandes, sans latence inter-régions. Cependant, toutes les écritures doivent passer par une primaire unique US-East pour maintenir la cohérence.

Concevez l'architecture de base de données utilisant Aurora. Comment structureriez-vous la Global Database ? Que se passe-t-il si la primaire US-East tombe ? Comment géreriez-vous le processus de promotion ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception de base de données multi-régions.)*

## Scène Post-Générique

Leo migra vers Aurora avec Serverless v2.

Le pic du vendredi arriva et passa. Le CPU ne dépassa jamais 60%. La latence des requêtes resta cohérente. Aurora avait évolué à la hausse pour gérer la charge automatiquement, puis redescendu après le rush.

« Combien ça a coûté par rapport au vendredi dernier ? » demanda Tom le lundi matin.

Leo consulta l'explorateur de facturation. « Le vendredi a atteint un pic à 0,89 $/heure. Le samedi matin était à 0,11 $/heure. »

Tom ne dit rien.

« L'ancienne configuration était fixe à 0,47 $/heure quelle que soit la charge, » ajouta Leo.

« Donc on a payé plus pendant le pic que avant, » dit Tom.

« Oui. Mais significativement moins pendant les heures creuses. Le coût net sur la semaine est plus faible. »

Tom calcula. Puis hocha la tête.

« Il y a une leçon ici, » dit-il. « La bonne question n'est pas "est-ce moins cher ?" C'est "est-ce moins cher pour notre modèle d'utilisation réel ?" »

« Ça, » dit Priya depuis l'autre côté de la pièce, « c'est l'instinct d'un ingénieur senior. »

Tom parut légèrement alarmé d'être décrit ainsi.

Dans le prochain chapitre : quand votre réseau est le goulot d'étranglement, et pourquoi une autoroute privée pourrait valoir le péage.
