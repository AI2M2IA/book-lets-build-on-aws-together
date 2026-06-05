# Chapitre 9 : Quand la table devient grande

La table des menus avait 50 000 éléments.

C'était à travers 287 restaurants, chacun avec des plats du jour, des articles saisonniers et des variantes
régionales. Certains articles avaient des modificateurs — taille, niveau d'épice, choix de protéine. Certains avaient
des formules qui référençaient d'autres articles. Certains n'apparaissaient sur le menu que les jours de semaine,
ou seulement pendant le déjeuner, ou seulement dans certaines villes.

La requête SQL qui récupérait le menu complet d'un restaurant retournait en 200 millisecondes.

Maintenant, elle prenait quatre secondes.

Quatre secondes, c'est la différence entre quelqu'un qui passe une commande et quelqu'un qui ferme
l'application. Leo avait examiné le plan de requête. Tom avait regardé la configuration des index. Priya
avait augmenté le nombre de réplicas de lecture. Rien de tout ça n'avait fait une différence significative.

Et ça a changé l'ambiance dans la salle.

Quand un problème survit à l'indexation, aux tentatives de mise en cache, et à un réplica supplémentaire, les gens arrêtent
de supposer que le correctif sera intelligent.

Parfois, le correctif est que la forme du système est mauvaise.

« Le problème », dit Leo, « est la forme des données. SQL veut tout dans des lignes et
des colonnes. Nos menus n'ont pas de forme fixe. »

C'était le début d'une conversation plus longue.

**Le problème de tout faire rentrer dans une table**

Voici la tension fondamentale des bases de données relationnelles : elles sont conçues pour stocker des données *structurées* dans des *formes fixes*.

Si chaque élément de menu avait les mêmes champs — nom, prix, description, catégorie — SQL serait parfait. Vous auriez une table `menu_items` propre, des lignes pour chaque article, et des requêtes qui ont du sens.

Mais les vrais menus ne fonctionnent pas comme ça.

Un article pourrait avoir un modificateur de « niveau d'épice ». Un autre pourrait avoir un « choix de protéine ». Un troisième pourrait avoir des formules imbriquées — « commandez le repas familial et vous obtenez deux plats principaux, deux accompagnements et une boisson ». La structure des données varie *par article*.

En SQL, vous avez deux options :

**Option 1** : Créer une colonne pour chaque modificateur possible. Cela produit une table très large où la plupart des colonnes sont vides la plupart du temps.

**Option 2** : Créer une table de modificateurs séparée et la joindre à la table des éléments de menu. Ça fonctionne, mais les menus complexes nécessitent de multiples jointures, et avec cinquante mille articles à volume de lecture élevé, ces jointures deviennent coûteuses.

« Il y a une troisième option », dit Priya, qui avait lu de la documentation tranquillement dans le coin.

Elle a ouvert un nouvel onglet. « Et si les données n'avaient pas à rentrer dans une table ? »

**Une façon différente de penser aux données**

Les bases de données relationnelles stockent les données sous forme de lignes dans des tables. Chaque ligne doit se conformer au schéma de la table. Le schéma est convenu à l'avance.

Les bases de données NoSQL stockent les données différemment. Une approche courante est le *modèle document* : chaque enregistrement est stocké comme un document autonome (généralement JSON), et les documents dans la même collection n'ont pas à avoir les mêmes champs.

Un élément de menu dans un modèle document pourrait ressembler à ça :

```json
{
  "itemId": "ITEM-001",
  "restaurantId": "NIMBUS-047",
  "name": "Shrimp Arepa",
  "price": 3200,
  "modifiers": [
    { "name": "Spice Level", "options": ["mild", "medium", "hot"] },
    { "name": "Protein", "options": ["shrimp", "fish", "mixed"] }
  ],
  "available": true,
  "seasonalUntil": "2024-03-31"
}
```

Un autre article pourrait avoir une forme complètement différente :

```json
{
  "itemId": "ITEM-002",
  "restaurantId": "NIMBUS-047",
  "name": "Family Feast",
  "price": 9800,
  "includes": ["ITEM-010", "ITEM-011", "ITEM-015", "ITEM-020"],
  "servings": 4,
  "available": true
}
```

Formes différentes. Même collection. Pas de problème.

« Donc la base de données ressemble plus à un système de classement qu'à une table », dit Maya.

« Exactement », dit Priya. « Vous pouvez mettre n'importe quel document dans n'importe quel tiroir. Vous n'avez pas à couper le document pour le faire rentrer dans une taille fixe. »

**Découvrez DynamoDB**

Amazon DynamoDB est le service de base de données NoSQL géré d'AWS. Il stocke les données sous forme d'éléments (pas de lignes), et les éléments sont rassemblés dans des tables (le nommage est similaire à SQL, mais le comportement est différent).

Chaque élément d'une table DynamoDB doit avoir une **clé primaire**, qui l'identifie de façon unique. Tout le reste est flexible.

La clé primaire peut avoir l'une des deux formes suivantes :

**Clé de partition uniquement** : Un seul attribut qui doit être unique dans tous les éléments.

**Clé de partition + clé de tri (clé primaire composite)** : Deux attributs qui *ensemble* forment une combinaison unique. Cela vous permet d'avoir plusieurs éléments avec la même clé de partition, différenciés par leur clé de tri.

Pour le menu de Nimbus :

- Clé de partition : `restaurantId`
- Clé de tri : `itemId`

Cela signifie que vous pouvez récupérer efficacement tous les articles pour un restaurant spécifique — DynamoDB sait exactement dans quelle partition chercher.

« Pourquoi ça s'appelle une clé de partition ? » demanda Tom.

**Comment DynamoDB stocke les données en interne**

DynamoDB est construit pour s'adapter horizontalement à des tailles énormes. Il y parvient grâce au *partitionnement* — les données sont réparties sur de nombreuses machines physiques en fonction de la clé de partition.

Quand vous écrivez un élément, DynamoDB hache la valeur de la clé de partition et utilise ce hachage pour déterminer quelle partition physique (et donc quel serveur) stocke l'élément. Quand vous lisez un élément, DynamoDB fait le même calcul pour le trouver instantanément.

Pensez-y comme un système postal. Si chaque enveloppe a un code postal, le service postal ne lit pas chaque enveloppe pour déterminer où elle appartient — il trie par code postal. DynamoDB trie par hachage de clé de partition.

C'est pourquoi le choix d'une bonne clé de partition importe :

- **Bonne** : Haute cardinalité, valeurs uniformément distribuées (`restaurantId` avec de nombreux restaurants)
- **Mauvaise** : Faible cardinalité (`vrai/faux`, `catégorie`) — la plupart des données atterrissent sur quelques partitions, créant des « points chauds »

Un point chaud signifie qu'une partition reçoit la majeure partie du trafic. Cette partition devient le goulot d'étranglement. DynamoDB commence à limiter les requêtes. Les utilisateurs commencent à voir des erreurs.

« Donc si j'utilisais `available: true` comme clé de partition », dit Leo lentement, « tous les articles disponibles s'entasseraient sur la même partition. »

« Et votre base de données fondrait pendant l'heure de pointe du dîner », confirma Priya.

Leo ferma lentement son ordinateur portable.

**Lecture et écriture à grande échelle**

DynamoDB peut gérer des millions de requêtes par seconde. Mais il a besoin de savoir quelle capacité provisionner.

Il existe deux modes de capacité :

**Capacité provisionnée** : Vous spécifiez combien d'unités de lecture et d'écriture vous voulez. DynamoDB réserve cette capacité pour vous et limite le trafic qui la dépasse. Coût prévisible, prix inférieur par requête.

**Capacité à la demande** : DynamoDB s'adapte automatiquement à votre trafic réel. Pas de planification de capacité de routine nécessaire. Coût plus élevé par requête, et beaucoup plus simple opérationnellement, bien que des pics soudains bien au-delà du schéma de trafic récent d'une table puissent toujours causer une limitation si ils montent trop vite.

Pour Nimbus, le menu est lu beaucoup plus souvent qu'il n'est écrit. Un client ouvre l'application, parcourt le menu — c'est beaucoup de lectures. Un partenaire restaurant met à jour son menu deux fois par semaine — c'est des écritures occasionnelles.

« La capacité à la demande est logique pour l'instant », dit Tom. « On ne connaît pas encore nos schémas de trafic. Mieux vaut payer plus par requête que de sous-provisionner et d'être limité. »

Sagesse d'infrastructure réticente. De Tom. L'équipe avait officiellement grandi.

**Cohérence : À quel point vos données sont-elles fraîches ?**

DynamoDB réplique les données dans plusieurs Zones de disponibilité automatiquement. C'est formidable pour la durabilité, mais ça signifie aussi que vous devez réfléchir clairement à la cohérence des lectures.

Quand vous lisez depuis DynamoDB, vous avez le choix :

**Lecture éventuellement cohérente** : C'est le défaut. Elle est moins chère, et le résultat pourrait brièvement être en retard sur une écriture récemment complétée.

**Lecture fortement cohérente** : Pour les lectures contre une table ou un index secondaire local, DynamoDB peut retourner la dernière valeur commitée des écritures réussies précédentes. Cela coûte plus de capacité de lecture et n'est pas disponible pour les index secondaires globaux.

Pour les données de menu, la cohérence éventuelle convient. Un élément de menu qui a une milliseconde de retard n'importe pas.

Pour les données de confirmation de commande — « cette commande a-t-elle été passée ? » — vous voudriez une forte cohérence. Le client ne devrait pas voir un message « réessayez » quand sa commande vient d'être sauvegardée.

« C'est comme la différence entre vérifier votre solde bancaire sur l'application vs appeler la banque directement », dit Maya. « L'application pourrait avoir trente secondes de retard. L'appel téléphonique est toujours à jour. »

**Le compromis : Ce que DynamoDB ne peut pas faire**

NoSQL n'est pas strictement meilleur que SQL. C'est un outil différent pour un travail différent.

Ce que DynamoDB abandonne :

**Requêtes flexibles** : En SQL, vous pouvez filtrer et trier par n'importe quelle colonne. Dans DynamoDB, vous ne pouvez interroger efficacement que par clé primaire. L'interrogation par champs arbitraires nécessite un *scan* (lecture de chaque élément dans la table), qui est coûteux et lent à grande échelle.

**Jointures** : DynamoDB ne fait pas de jointures. Si vous avez besoin de données de deux tables, vous faites deux lectures séparées dans votre code d'application.

**Transactions** : DynamoDB supporte les transactions, mais les bases de données relationnelles sont toujours le meilleur choix naturel pour de nombreux flux de travail multi-entités, les systèmes intensifs en rapports et les conceptions intensives en jointures.

**Familiarité** : Des décennies d'outillage SQL, de compétences et de modèles mentaux ne se transfèrent pas directement.

Ce dans quoi DynamoDB excelle :

- Schémas d'accès clé-valeur et document
- Échelle massive (latence à un chiffre en millisecondes à n'importe quelle taille)
- Serverless, pas de gestion d'infrastructure
- Mise à l'échelle automatique, réplication multi-AZ, sauvegardes
- Performances prévisibles indépendamment du volume de données

« Donc la règle est », dit Maya, « d'utiliser DynamoDB quand vous savez *exactement* comment vous accéderez aux données. Utilisez SQL quand vous ne le savez pas encore. »

Priya hocha la tête. « Concevez d'abord vos schémas d'accès. Puis choisissez votre base de données. »

C'est l'une des choses les plus seniors qu'une conversation sur les bases de données peut produire.

**Quand utiliser chacun**

| Situation                                               | Utilisez                    |
|---------------------------------------------------------|-----------------------------|
| Données structurées, requêtes complexes, rapports       | RDS (PostgreSQL, MySQL)     |
| Formes de données flexibles, accès par clé, grande échelle | DynamoDB                |
| Intensif en écriture avec des relations complexes       | RDS                         |
| Intensif en lecture avec des schémas d'accès prévisibles | DynamoDB                   |
| Vous avez besoin de jointures et d'agrégats             | RDS                         |
| Vous avez besoin d'une latence en millisecondes à des millions de req/sec | DynamoDB       |
| Transactions sur plusieurs entités                      | RDS (généralement)          |
| Serverless / pics de trafic imprévisibles               | DynamoDB à la demande       |

La mauvaise réponse est toujours « toujours utiliser l'un ou l'autre ». Nimbus a fini par utiliser les deux : RDS pour l'historique des commandes et les enregistrements financiers (structurés, relationnels, besoin de rapports), DynamoDB pour le menu (schéma flexible, volume de lecture élevé, accès par ID de restaurant).

## Forces et limites

**Pourquoi DynamoDB est puissant** :

- Latence à un chiffre en millisecondes à n'importe quelle échelle
- Entièrement géré — pas de patch, pas de configuration de réplication, pas de fenêtres de maintenance
- Réplication multi-AZ automatique (durabilité intégrée)
- La mise à l'échelle à la demande signifie zéro planification de capacité
- Intégration native avec Lambda, API Gateway, Streams
- Récupération à un instant donné (similaire aux sauvegardes automatisées RDS)
- DynamoDB Streams — capture chaque changement comme un événement (utile pour le traitement en temps réel)

**Là où DynamoDB se complique** :

- La conception des schémas d'accès est non négociable — les erreurs sont coûteuses à défaire
- Les requêtes complexes nécessitent des index secondaires (ajoute des coûts et de la complexité)
- Les scans sont coûteux — évitez-les en production
- La « limite de taille d'élément » est de 400 Ko — les grands éléments ont besoin d'un stockage différent
- La tarification peut vous surprendre si vous ne comprenez pas les coûts des unités de lecture/écriture

## Résumé

- DynamoDB est le service de base de données NoSQL géré d'AWS.
- Les éléments sont stockés sous forme de documents flexibles — aucun schéma fixe requis.
- Chaque élément doit avoir une **clé primaire** : une clé de partition seule, ou une clé de partition + clé de tri.
- La clé de partition détermine quelle partition physique stocke l'élément. Choisissez-la pour une distribution uniforme.
- La capacité **à la demande** s'adapte automatiquement ; la capacité **provisionnée** est moins chère si votre trafic est prévisible.
- Les lectures **éventuellement cohérentes** sont moins chères et plus rapides. Les lectures **fortement cohérentes** sont toujours à jour.
- DynamoDB excelle à l'accès basé sur les clés à grande échelle. Il a du mal avec les requêtes ad hoc et les jointures.
- Utilisez RDS pour les données relationnelles. Utilisez DynamoDB pour les données document/clé-valeur. Utilisez les deux quand la situation l'exige.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.3)*

- Connaissez les règles de la clé de partition : **haute cardinalité, distribution uniforme**. Les partitions chaudes sont un piège d'examen courant.
- **À la demande vs provisionné** : à la demande pour un trafic imprévisible ; provisionné (avec Auto Scaling) pour des charges de travail prévisibles.
- **DynamoDB Streams** : capture les changements au niveau des éléments en temps réel. Scénario d'examen courant : « déclencher une fonction Lambda quand un enregistrement change. »
- **Tables globales** : réplication multi-Région et multi-active pour les applications distribuées mondialement et les scénarios de reprise sur sinistre. À l'examen, c'est un signal fort quand la charge de travail a besoin de lectures et d'écritures locales dans plus d'une Région.
- **DAX (DynamoDB Accelerator)** : couche de mise en cache en mémoire pour DynamoDB. Réduit la latence de lecture de millisecondes à microsecondes. L'examen utilise ça quand les réplicas de lecture RDS n'aident pas (parce que c'est un cache spécifique à DynamoDB).
- **Clé primaire composite** : clé de partition + clé de tri permet des requêtes flexibles dans une partition. Exemple : récupérer toutes les commandes d'un client entre deux dates — `customerId` est la clé de partition, `orderDate` est la clé de tri.
- Sachez quand NE PAS utiliser DynamoDB : jointures complexes, rapports ad hoc, transactions multi-entités → RDS est généralement la réponse.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre une clé de partition et une clé de tri. Quand utiliseriez-vous les deux ?

*(Indice : Pensez au menu Nimbus — pourquoi avoir restaurantId comme clé de partition et itemId comme clé de tri rend-il efficace la récupération du menu complet d'un restaurant ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une société de jeux mondiale stocke des profils de joueurs dans DynamoDB. Chaque profil comprend des champs comme le nom d'utilisateur, le niveau, les succès et l'inventaire. Certains joueurs ont 10 articles d'inventaire ; d'autres ont 5 000 configurations personnalisées. La société a besoin d'une latence de lecture à un chiffre en millisecondes pour les recherches de profil pendant le jeu actif.

Quelle approche de conception prend LE MIEUX en charge cette exigence ?

A) Migrer vers RDS Aurora avec des réplicas de lecture dans chaque région  
B) Utiliser DynamoDB avec `playerId` comme clé de partition et stocker le profil entier comme un seul élément  
C) Utiliser DynamoDB avec `level` comme clé de partition pour regrouper les joueurs de compétence similaire  
D) Utiliser ElastiCache devant RDS pour atteindre une latence inférieure à la milliseconde

**Indice 1** : Le schéma d'accès est « chercher un joueur spécifique par ID ». Quelle clé rend ça efficace ?

**Indice 2** : Une option crée une partition chaude terrible. Quel attribut a une très faible cardinalité ?

**Indice 3** : DynamoDB offre déjà nativement une latence à un chiffre en millisecondes.

**Réponse** : B

**Explication** : Utiliser `playerId` comme clé de partition distribue les données uniformément sur les partitions et permet des recherches instantanées par ID de joueur — exactement le schéma d'accès décrit. Le modèle de document flexible de DynamoDB gère les tailles d'inventaire variables sans changements de schéma.

**Pourquoi pas A ?** RDS Aurora avec des réplicas de lecture ajoute de la complexité et n'est toujours pas le premier choix naturel pour ce type de recherche de profil basée sur les clés à l'échelle du jeu.

**Pourquoi pas C ?** Utiliser `level` comme clé de partition crée de sévères partitions chaudes — la plupart du trafic va au niveau 1 (nouveaux joueurs) ou au niveau maximum (vétérans actifs), laissant les autres partitions inactives.

**Pourquoi pas D ?** La question décrit DynamoDB, pas RDS. Ajouter ElastiCache devant RDS introduit deux nouveaux services quand DynamoDB seul résout le problème.

*Domaine SAA-C03 : Concevoir des architectures performantes — Tâche 3.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus ajoute une fonctionnalité « favoris » : les clients peuvent sauvegarder leurs articles de menu favoris et les recommander d'un seul tap.

Concevez la table DynamoDB pour cette fonctionnalité. Quelle serait la clé de partition ? Utiliseriez-vous une clé de tri ? À quoi ressemblerait la structure de l'élément ?

Ensuite, considérez : que se passe-t-il si vous avez besoin d'afficher les « 100 articles les plus favoris de tous les clients » ? DynamoDB peut-il répondre à ça efficacement ? Si non, qu'ajouteriez-vous à l'architecture ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à concevoir pour des schémas d'accès.)*

## Scène post-générique

Leo avait migré le menu vers DynamoDB à la fin de la semaine. Les lectures étaient rapides. Le schéma était flexible. Les partenaires restaurant pouvaient ajouter n'importe quel champ modificateur qu'ils voulaient.

Il se sentait bien.

Puis Priya regarda le tableau de bord de surveillance.

« Leo », dit-elle, « chaque chargement de page fait quarante-sept requêtes DynamoDB. »

« Une par restaurant », confirma Leo. « Parce que le client est sur la page parcourir-tout. »

« Et chacune de ces requêtes prend environ quatre millisecondes. »

Leo fit le calcul. Quarante-sept fois quatre. « Ça fait... cent quatre-vingt-huit millisecondes rien que pour le menu. Avant le rendu. »

« À chaque chargement de page. »

« Pour chaque client. »

Il fixa l'écran.

« On a besoin d'un cache », dit-il.

Dans le prochain chapitre : la couche entre l'application de Nimbus et sa base de données qui rend les requêtes lentes rapides.
