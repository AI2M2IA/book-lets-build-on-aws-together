# Chapitre 9 : Quand la table devient grande

La cuisine du premier restaurant partenaire de Nimbus sentait l'ail et le pain chaud, même à dix heures du matin. Maya s'y trouvait pour une démo, observant un cuisinier faire défiler l'application pour enregistrer une substitution — du poisson au lieu de crevettes, temporairement en rupture. Le geste de balayage eut lieu. Le menu se mit à jour. Un client dans un autre quartier de la ville vit le changement en quelques secondes.

Ça avait semblé magique.

De retour au bureau, la magie avait commencé à ralentir.

La table des menus avait 50 000 éléments.

C'était réparti sur 287 restaurants — le nombre de partenaires avait explosé, passant des quarante-sept de l'époque du répartiteur de charge à près de trois cents en moins d'un an — chacun avec des plats du jour, des articles saisonniers et des variantes régionales. Certains articles avaient des modificateurs — taille, niveau d'épice, choix de protéine. Certains avaient des formules qui référençaient d'autres articles. Certains n'apparaissaient sur le menu que les jours de semaine, ou seulement pendant le déjeuner, ou seulement dans certaines villes.

La requête SQL qui récupérait le menu complet d'un restaurant retournait autrefois en 200 millisecondes.

Maintenant, elle prenait quatre secondes.

Quatre secondes, c'est la différence entre quelqu'un qui passe une commande et quelqu'un qui ferme l'application. Leo avait examiné le plan de requête. Tom avait regardé la configuration des index. Priya avait augmenté le nombre de réplicas de lecture. Rien de tout ça n'avait fait une différence significative.

Et ça a changé l'ambiance dans la salle.

---

**La première tentative : plus d'index**

Leo avait le plan de requête ouvert. Il le parcourut soigneusement.

« Le problème, c'est cette jointure », dit-il. « Quand on récupère le menu d'un restaurant, on joint la table menu_items à la table modifiers, puis à la table combos, puis à la table availability_windows. Quatre tables, trois jointures, cinquante mille lignes. »

Il ajouta un index sur `restaurantId` dans chaque table. Il relança la requête. Deux secondes. Mieux, mais pas assez bon.

Tom avait lu quelque chose sur les indices de requête. Il passa un après-midi à peaufiner. Une seconde trois. Toujours pas bon.

« Et si on dénormalisait ? » demanda Leo. « Combiner les modificateurs dans une colonne JSON directement sur la table menu_items. Moins de jointures. »

Ils essayèrent. Une seconde tout rond. Ça ressemblait à un progrès. Maya envoya un message aux partenaires restaurant disant qu'ils avaient corrigé le problème de vitesse. C'était un mardi.

Le jeudi, la requête était de retour à 2,8 secondes. Leurs données avaient grandi. Plus de restaurants avaient été intégrés. Plus d'articles par restaurant. La requête qui semblait résolue ne l'était pas.

« L'approche par index tient le coup avec les données d'aujourd'hui », dit Priya. « Mais on ajoute quarante restaurants par semaine. Au prochain trimestre, on aura le double d'articles. À quoi ressemblera la requête alors ? »

« Trois secondes minimum », dit Leo. « Probablement cinq. »

« Donc on s'est acheté quelques semaines. »

« Ouais. »

Ils restèrent avec ça. Un correctif qui expire n'est pas vraiment un correctif.

---

**La deuxième tentative : les réplicas de lecture**

Priya avait déjà augmenté le nombre de réplicas de lecture une fois. Elle essaya à nouveau — deux réplicas de lecture maintenant, et l'application répartissait la charge entre eux. La théorie était saine : répartir le trafic de lecture, chaque réplica fait moins de travail.

Ça aida un peu. La charge de pointe chuta de 2,8 secondes à 2,2 secondes.

« C'est parce que le goulot d'étranglement n'est pas le nombre de lectures », dit Tom, regardant les métriques de la base de données. « C'est la requête elle-même. Plus de réplicas signifie plus de serveurs exécutant la même requête lente. La requête est toujours lente. »

« Combien ça coûte par mois ? » ajouta-t-il, parce qu'il demandait toujours. « Deux réplicas de lecture supplémentaires sur un db.r5.large — c'est environ 350 dollars par mois. Pour une amélioration de deux secondes. »

Leo ferma le panneau des réplicas.

« Donc plus de matériel ne corrige pas une mauvaise requête », dit Maya.

« Quand un problème survit à l'indexation, aux tentatives de mise en cache et à des réplicas supplémentaires », dit Leo lentement, « peut-être que le problème n'est pas la configuration. Peut-être que c'est la forme du système. »

C'était le début d'une conversation plus longue.

---

*La semaine précédente, l'équipe avait enfin maîtrisé RDS. Veille Multi-AZ, sauvegardes automatisées, un réplica de lecture gérant les requêtes de reporting. Le problème du DBA — celui qui réveillait Leo la nuit — était résolu. La couche de base de données gérée était stable. Mais stable ne voulait pas dire rapide, et la rapidité était maintenant le problème. La table des menus avait commencé à atteindre des limites que plus de réplicas ne pouvaient pas corriger. La forme même des données était mauvaise.*

---

**Le problème de tout faire rentrer dans une table**

Voici la tension fondamentale des bases de données relationnelles : elles sont conçues pour stocker des données *structurées* dans des *formes fixes*.

Si chaque élément de menu avait les mêmes champs — nom, prix, description, catégorie — SQL serait parfait. Vous auriez une table `menu_items` propre, des lignes pour chaque article, et des requêtes qui ont du sens.

Mais les vrais menus ne fonctionnent pas comme ça.

Un article pourrait avoir un modificateur de « niveau d'épice ». Un autre pourrait avoir un « choix de protéine ». Un troisième pourrait avoir des formules imbriquées — « commandez le repas familial et vous obtenez deux plats principaux, deux accompagnements et une boisson ». La structure des données varie *par article*.

En SQL, vous avez deux options :

**Option 1** : Créer une colonne pour chaque modificateur possible. Cela produit une table très large où la plupart des colonnes sont vides la plupart du temps.

**Option 2** : Créer une table de modificateurs séparée et la joindre à la table des éléments de menu. Ça fonctionne, mais les menus complexes nécessitent de multiples jointures, et avec cinquante mille articles à volume de lecture élevé, ces jointures deviennent coûteuses.

« Il y a une troisième option », dit Priya, qui avait lu de la documentation tranquillement dans le coin.

Elle ouvrit un nouvel onglet. « Et si les données n'avaient pas à rentrer dans une table ? »

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

« Et si quelqu'un essaie de s'introduire ? » demanda Priya. « Si la clé de partition est devinable, est-ce que quelqu'un pourrait inonder une partition d'écritures et provoquer intentionnellement la condition de point chaud ? »

« Oui », dit Leo. « C'est en fait un vecteur de déni de service pour les tables mal conçues. Ce qui est une raison de plus de choisir des clés à haute cardinalité. »

Priya nota ça.

**Comment DynamoDB stocke les données en interne**

DynamoDB est construit pour s'adapter horizontalement à des tailles énormes. Il y parvient grâce au *partitionnement* — les données sont réparties sur de nombreuses machines physiques en fonction de la clé de partition.

Quand vous écrivez un élément, DynamoDB hache la valeur de la clé de partition et utilise ce hachage pour déterminer quelle partition physique (et donc quel serveur) stocke l'élément. Quand vous lisez un élément, DynamoDB fait le même calcul pour le trouver instantanément.

Pensez-y comme un système postal. Si chaque enveloppe a un code postal, le service postal ne lit pas chaque enveloppe pour déterminer où elle appartient — il trie par code postal. DynamoDB trie par hachage de clé de partition.

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Pourquoi le choix de la clé de partition importe-t-il autant ? Ne peut-on pas simplement choisir n'importe quoi ? »

C'est la bonne question. La clé de partition est la décision de conception la plus importante d'un schéma DynamoDB. Voici pourquoi :

Si vous choisissez une clé de partition à faible cardinalité — disons, `available: true/false`, ou `category: "main/side/drink"` — la plupart de vos données atterrissent sur les mêmes quelques partitions. DynamoDB appelle ça une « partition chaude ». Un serveur gère la majorité du trafic. Il se retrouve surchargé. DynamoDB commence à limiter les requêtes. Les utilisateurs commencent à voir des erreurs.

- **Bonne** : Haute cardinalité, valeurs uniformément distribuées (`restaurantId` avec de nombreux restaurants)
- **Mauvaise** : Faible cardinalité (`true/false`, `category`) — la plupart des données atterrissent sur quelques partitions, créant des « points chauds »

« Donc si j'utilisais `available: true` comme clé de partition », dit Leo lentement, « tous les articles disponibles s'entasseraient sur la même partition. »

« Et votre base de données fondrait pendant l'heure de pointe du dîner », confirma Priya.

Leo ferma lentement son ordinateur portable.

---

**L'incident de la partition chaude**

Ils n'auraient pas à l'imaginer. Des mois plus tard — pendant leur deuxième mois sur DynamoDB, avant d'avoir vraiment intériorisé la règle — ils l'apprendraient à la dure.

L'équipe avait lancé une nouvelle fonctionnalité : un badge « Articles en vedette ». Les partenaires restaurant pouvaient marquer jusqu'à cinq articles comme étant en vedette. La fonctionnalité stockait un attribut `featured: true` sur chaque article.

Leo pensait qu'il serait utile d'interroger tous les articles en vedette de tous les restaurants — pour un widget « articles tendance » sur la page d'accueil. Il avait créé un index secondaire pour prendre en charge cette requête. L'index utilisait `featured` comme clé de partition.

« Ça ira », avait-il dit. « Combien d'articles en vedette peut-il y avoir ? »

Environ mille deux cents, répartis sur deux cent quarante restaurants.

Mais le widget « articles tendance » se chargeait sur chaque page. Chaque chargement de page déclenchait une requête contre l'index `featured`. Les mille deux cents articles vivaient tous sur deux partitions — `true` et `false`. La partition `true` prenait chaque coup.

Vendredi soir, heure de pointe du dîner. Huit mille utilisateurs simultanés. Tous chargeant la page d'accueil.

Le taux d'erreur de DynamoDB grimpa en flèche à dix-huit pour cent. Certains utilisateurs obtinrent un widget tendance vide. Certains obtinrent des roues de chargement. Certains obtinrent des erreurs qui remontaient dans le flux de commande.

Leo récupéra les métriques. « La partition de l'index est limitée », dit-il. « On atteint la limite de débit sur une seule partition. »

« Comment ? » demanda Priya.

« La clé `featured` n'a que deux valeurs. Les mille deux cents articles en vedette vivent tous sur la même partition. Chaque chargement de la page d'accueil frappe cette partition. »

Ils désactivèrent le widget tendance en trois minutes. Le taux d'erreur tomba à zéro.

« Donc une clé de partition à deux valeurs nous a limités un vendredi soir », dit Tom.

« Oui », dit Leo.

« Combien ça nous a coûté ? »

« Environ quarante minutes d'expérience dégradée pour huit mille utilisateurs », dit Priya. « Impact sur le chiffre d'affaires, probablement quelques centaines de commandes. »

Leo remplaça l'index par une conception différente : une table DynamoDB dédiée appelée `featured_items` avec `restaurantId` comme clé de partition et une Lambda planifiée — un petit morceau de code qu'AWS exécute pour vous (Chapitre 20) — qui la mettait à jour toutes les quinze minutes à partir de la table principale. La requête devint un scan sur une petite table isolée plutôt qu'une partition chaude sur la table principale.

« Concevez d'abord vos schémas d'accès », dit Priya. « Puis choisissez votre modèle de données. »

« Je sais », dit Leo. « Je sais maintenant. »

---

**Lecture et écriture à grande échelle**

DynamoDB peut gérer des millions de requêtes par seconde. Mais il a besoin de savoir quelle capacité provisionner.

Il existe deux modes de capacité :

**Capacité provisionnée** : Vous spécifiez combien d'unités de lecture et d'écriture vous voulez. DynamoDB réserve cette capacité pour vous et limite le trafic qui la dépasse. Coût prévisible, prix inférieur par requête.

Les unités ont des définitions précises, et l'examen attend de vous que vous les connaissiez : une **unité de capacité de lecture (RCU)** correspond à une lecture fortement cohérente par seconde d'un élément allant jusqu'à 4 Ko — ou deux lectures éventuellement cohérentes de la même taille. Une **unité de capacité d'écriture (WCU)** correspond à une écriture par seconde d'un élément allant jusqu'à 1 Ko. Les éléments plus grands consomment proportionnellement plus : lire un élément de 12 Ko de façon fortement cohérente coûte 3 RCU ; écrire un élément de 3 Ko coûte 3 WCU.

**Capacité à la demande** : DynamoDB s'adapte automatiquement à votre trafic réel. Pas de planification de capacité de routine nécessaire. Coût plus élevé par requête, et beaucoup plus simple opérationnellement, bien que des pics soudains bien au-delà du schéma de trafic récent d'une table puissent toujours causer une limitation s'ils montent trop vite.

Pour Nimbus, le menu est lu beaucoup plus souvent qu'il n'est écrit. Un client ouvre l'application, parcourt le menu — c'est beaucoup de lectures. Un partenaire restaurant met à jour son menu deux fois par semaine — c'est des écritures occasionnelles.

« La capacité à la demande est logique pour l'instant », dit Tom. « On ne connaît pas encore nos schémas de trafic. Mieux vaut payer plus par requête que de sous-provisionner et d'être limité. »

Sagesse d'infrastructure réticente. De Tom. L'équipe avait officiellement grandi.

« Combien ça coûte par mois ? » demanda Tom, en ouvrant le calculateur de tarification.

« À notre volume de lecture actuel — environ quarante mille lectures par jour — la capacité à la demande est d'environ douze dollars par mois », dit Leo. « En provisionné, si on le règle bien, c'est plutôt quatre. Mais il faudrait définir la capacité manuellement et risquer une limitation si on se trompe. »

Tom nota les deux chiffres. Il notait toujours les chiffres.

**Cohérence : À quel point vos données sont-elles fraîches ?**

DynamoDB réplique les données dans plusieurs Zones de disponibilité automatiquement. C'est formidable pour la durabilité, mais ça signifie aussi que vous devez réfléchir clairement à la cohérence des lectures.

Quand vous lisez depuis DynamoDB, vous avez le choix :

**Lecture éventuellement cohérente** : C'est le défaut. Elle est moins chère, et le résultat pourrait brièvement être en retard sur une écriture récemment complétée.

**Lecture fortement cohérente** : Pour les lectures contre une table ou un index secondaire local, DynamoDB peut retourner la dernière valeur validée des écritures réussies précédentes. Cela coûte plus de capacité de lecture et n'est pas disponible pour les index secondaires globaux.

Pour les données de menu, la cohérence éventuelle convient. Un élément de menu qui a une milliseconde de retard n'importe pas.

Pour les données de confirmation de commande — « cette commande a-t-elle été passée ? » — vous voudriez une forte cohérence. Le client ne devrait pas voir un message « réessayez » quand sa commande vient d'être sauvegardée.

« C'est comme la différence entre vérifier votre solde bancaire sur l'application et appeler la banque directement », dit Maya. « L'application pourrait avoir trente secondes de retard. L'appel téléphonique est toujours à jour. »

Vous vous demandez peut-être : si DynamoDB réplique automatiquement sur plusieurs AZ, pourquoi le mode de cohérence importe-t-il du tout ? Voici la réponse : la réplication prend un temps faible mais non nul — des millisecondes, généralement. Une lecture éventuellement cohérente pourrait être servie par un réplica qui n'a pas encore reçu la dernière écriture. Une lecture fortement cohérente contacte toujours la copie primaire des données. Pour la plupart des cas d'usage (articles de menu, catalogues de produits, profils d'utilisateurs), le retard est imperceptible. Pour les cas d'usage où l'exactitude importe au moment de la lecture (confirmation de paiement, disponibilité de l'inventaire), vous voulez une forte cohérence.

**Index secondaires : interroger au-delà de la clé primaire**

Que faire si vous devez accéder aux données d'une manière différente de ce que la clé primaire permet ?

DynamoDB prend en charge les **index secondaires** — des clés alternatives qui vous permettent d'interroger les mêmes données en utilisant des attributs différents.

**Index secondaire local (LSI)** : Utilise la même clé de partition que la table, mais une clé de tri différente. Doit être défini à la création de la table et ne peut pas être ajouté plus tard. Partage la capacité provisionnée de la table. Parce que les LSI partagent la partition, ils prennent en charge les lectures fortement cohérentes.

**Index secondaire global (GSI)** : Un index complètement séparé avec sa propre clé de partition et sa propre clé de tri — différentes de la clé primaire de la table. Peut être ajouté ou supprimé après l'existence de la table, ce qui vous donne de la flexibilité. A ses propres paramètres de capacité provisionnée, distincts de la table.

Pour Nimbus : s'ils avaient besoin d'interroger les articles par plage de prix, un GSI pourrait le prendre en charge — mais avec une règle à l'esprit : une clé de partition n'accepte que les comparaisons d'*égalité*, donc `price` (sur lequel vous voulez faire une plage) doit être la **clé de tri**, avec un attribut de regroupement comme la catégorie ou `cuisineType#region` comme clé de partition du GSI. C'est exactement l'index construit dans la démonstration ci-dessous.

Si vous choisissez un LSI, alors vous obtenez une forte cohérence et une capacité partagée, mais vous êtes verrouillé dans cette conception à la création de la table ; si vous choisissez un GSI, alors vous obtenez la flexibilité de l'ajouter plus tard et une mise à l'échelle indépendante, mais vous perdez la capacité de faire des lectures fortement cohérentes contre l'index.

---

**Une démonstration de requête GSI**

Priya parcourut un exemple concret. Nimbus voulait prendre en charge une fonctionnalité « parcourir par cuisine » : afficher tous les plats disponibles d'un type de cuisine particulier dans tous les restaurants partenaires.

La table principale a `restaurantId` comme clé de partition et `itemId` comme clé de tri. Vous ne pouvez pas interroger efficacement « tous les articles avec cuisineType = Colombian » — cela nécessiterait un scan sur chaque partition.

Ils créèrent un GSI :

- Clé de partition du GSI : `cuisineType#region` (par exemple, « Colombian#NYC », « Mexican#Chicago »)
- Clé de tri du GSI : `price`

Le GSI duplique une projection de chaque article — seulement les champs nécessaires pour la page de parcours — dans le stockage de l'index. Maintenant, une requête contre le GSI avec `cuisineType#region = "Colombian#NYC"` va directement à cette partition de l'index.

« Pourquoi ne pas simplement utiliser `cuisineType` seul ? » demanda Leo.

« Parce que cuisineType seul a une faible cardinalité », dit Priya. « Colombian, Mexican, Thai — vingt valeurs au total. Encore des partitions chaudes. Ajouter la région nous donne Colombian#NYC, Colombian#Chicago, Colombian#LA. Plus de partitions, meilleure distribution. »

« Ça semble un peu bricolé. »

« C'est un schéma DynamoDB standard. Ça s'appelle le sharding de clé de partition. Parfois, il faut travailler avec l'outil. »

La requête GSI en code ressemblait à ça :

```python
response = dynamodb.query(
    TableName='menu',
    IndexName='cuisineType-price-index',
    KeyConditionExpression='#ct = :ct AND price BETWEEN :lo AND :hi',
    ExpressionAttributeNames={'#ct': 'cuisineType#region'},
    ExpressionAttributeValues={
        ':ct': {'S': 'Colombian#NYC'},
        ':lo': {'N': '1000'},
        ':hi': {'N': '2500'}
    }
)
```

Cela retournait tous les plats colombiens de New York City au prix compris entre 10 et 25 $, triés par prix, en environ 4 millisecondes.

« C'est plus rapide que l'ancienne requête SQL par un facteur de mille », dit Leo.

« Parce que ça ne touche qu'une partition d'un index », confirma Priya. « Pas de scan de chaque ligne dans une table jointe. »

---

**DynamoDB Streams : réagir aux changements**

« A-t-on réfléchi à ce qui se passe quand un élément de menu est mis à jour ? » demanda Priya un matin. « Un partenaire restaurant change un prix. On doit mettre à jour l'index de recherche. On doit invalider l'entrée ElastiCache » — le service de mise en cache que nous rencontrerons au prochain chapitre — « et on doit journaliser le changement pour notre pipeline d'analyse. »

« On pourrait faire tout ça dans le gestionnaire de l'API », dit Leo. « Quand l'écriture se produit, déclencher toutes les mises à jour en aval. »

« Et si l'une d'elles échoue ? »

« Alors... on réessaie. »

« Et si l'instance EC2 plante après l'écriture mais avant les mises à jour en aval ? Les données sont sauvegardées, mais rien ne connaît le changement. »

Leo y réfléchit.

« On a besoin que la mise à jour soit garantie », dit-il. « Même si notre code d'application échoue en cours de route. »

C'est ce que résout **DynamoDB Streams**.

DynamoDB Streams capture un journal ordonné dans le temps de chaque modification d'élément dans une table DynamoDB. Chaque insertion, mise à jour et suppression est écrite dans le flux comme un événement. Le flux conserve les événements pendant 24 heures.

Vous pouvez attacher une fonction Lambda au flux. Chaque fois qu'un élément change, la fonction Lambda est invoquée avec l'état avant-après de l'élément. La Lambda peut alors :

- Mettre à jour un index de recherche (OpenSearch)
- Invalider une entrée de cache dans ElastiCache
- Envoyer une notification à un autre système
- Alimenter un pipeline d'analyse
- Répliquer le changement vers une autre table ou base de données

La différence cruciale : Streams découple l'écriture des effets en aval. L'écriture DynamoDB réussit indépendamment du succès ou non de la Lambda. Si la Lambda échoue, DynamoDB la réessaie. Si l'application plante après l'écriture, l'événement du flux est toujours là — la Lambda le traitera quand les choses se rétabliront.

« Donc on écrit dans DynamoDB », dit Leo lentement, « et DynamoDB garantit que le traitement en aval se produit éventuellement, même si on plante. »

« Exactement », dit Priya. « C'est la différence entre espérer que tous vos effets de bord s'exécutent et avoir la base de données qui les garantit. »

Pour Nimbus, ils câblèrent DynamoDB Streams sur la table des menus vers une Lambda qui invalidait les entrées ElastiCache quand les éléments de menu changeaient. Le cache restait cohérent avec la base de données, automatiquement, sans aucun code d'application gérant l'invalidation.

« Combien coûte Streams ? » demanda Tom.

« Vous payez pour la lecture du flux — chaque invocation Lambda lit dedans. À notre volume, probablement deux à trois dollars par mois. »

Tom l'approuva sans autres questions. Il avait appris quand deux dollars par mois en valaient la peine.

**Le compromis : Ce que DynamoDB ne peut pas faire**

NoSQL n'est pas strictement meilleur que SQL. C'est un outil différent pour un travail différent.

Ce que DynamoDB abandonne :

**Requêtes flexibles** : En SQL, vous pouvez filtrer et trier par n'importe quelle colonne. Dans DynamoDB, vous ne pouvez interroger efficacement que par clé primaire. L'interrogation par champs arbitraires nécessite un *scan* (lecture de chaque élément dans la table), qui est coûteux et lent à grande échelle.

**Jointures** : DynamoDB ne fait pas de jointures. Si vous avez besoin de données de deux tables, vous faites deux lectures séparées dans votre code d'application.

**Transactions** : DynamoDB prend en charge les transactions, mais les bases de données relationnelles sont toujours le meilleur choix naturel pour de nombreux flux de travail multi-entités, les systèmes intensifs en rapports et les conceptions intensives en jointures.

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

---

**Quand DynamoDB est le mauvais choix**

Tom, qui s'était chargé du module de reporting financier, avait une question.

« On construit le reporting financier », dit-il. « Résumés mensuels du chiffre d'affaires par restaurant, calculs de taxes, historique des factures. Peut-on mettre ça dans DynamoDB aussi ? »

L'équipe se regarda.

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya, avant que Priya ne le puisse.

Priya sourit. Maya prenait l'habitude.

« Décris-nous les requêtes », dit Priya à Tom.

Il ouvrit la spécification. « On a besoin de : chiffre d'affaires total par restaurant, regroupé par semaine. Articles les plus performants par nombre de commandes, sur tous les restaurants. Chiffre d'affaires ventilé par type de cuisine. Valeur moyenne de commande par ville. Comparaison d'une année sur l'autre pour le reporting des partenaires. »

Leo lut la liste. « Chacune de ces requêtes est une agrégation. Somme, regroupement, moyenne, comparaison. »

« DynamoDB n'a pas de fonctions d'agrégation », dit Priya. « Pas de GROUP BY. Pas de SUM. Pas de AVG. Pour répondre à "chiffre d'affaires total par restaurant cette semaine", il faudrait scanner chaque commande de la semaine, tout charger dans la mémoire de l'application et le calculer vous-même. »

« Ça semble mauvais », dit Tom.

« À notre échelle, c'est des dizaines de milliers d'enregistrements chargés en mémoire pour chaque demande de rapport. Ce serait lent et coûteux. Et chaque fois qu'on ajouterait une nouvelle exigence de rapport, on écrirait du nouveau code de scan-et-calcul. »

« Alors on utilise quoi ? »

« Pour le reporting financier ? RDS. PostgreSQL avec des index appropriés. Les requêtes que tu as décrites sont exactement ce pour quoi SQL a été conçu. Ce serait dix lignes de SQL. Ce serait deux cents lignes de code de scan DynamoDB. »

DynamoDB est mauvais quand :

- Vous ne connaissez pas vos schémas d'accès à l'avance (le reporting est intrinsèquement exploratoire)
- Vous avez besoin d'agrégations (SUM, GROUP BY, COUNT) sur de grands ensembles de données
- Vos données ont des relations complexes et vous avez besoin de jointures
- Vous avez besoin de flexibilité de requête ad hoc — pour poser des questions que vous n'avez pas encore imaginées
- Vos données ont une structure fondamentalement relationnelle qui ne se mappe pas naturellement au clé-valeur

« Donc le choix n'est pas "la nouvelle technologie est meilleure" », dit Maya.

« Le choix est "quelle est la forme de vos données, et comment y accéderez-vous" », confirma Priya. « DynamoDB est véritablement meilleur pour le menu. Il serait véritablement pire pour les rapports financiers. Les deux affirmations sont vraies en même temps. »

Tom construisit le reporting financier sur PostgreSQL. La première requête GROUP BY qu'il écrivit retourna en 80 millisecondes. Il n'eut pas à écrire une seule ligne de code de scan.

---

**Quand utiliser chacun**

| Situation                                             | Optez pour              |
|-------------------------------------------------------|-------------------------|
| Données structurées, requêtes complexes, reporting    | RDS (PostgreSQL, MySQL) |
| Formes de données flexibles, accès par clé, grande échelle | DynamoDB           |
| Intensif en écriture avec des relations complexes     | RDS                     |
| Intensif en lecture avec des schémas d'accès prévisibles | DynamoDB             |
| Vous avez besoin de jointures et d'agrégats           | RDS                     |
| Vous avez besoin d'une latence en millisecondes à des millions de req/s | DynamoDB |
| Transactions sur plusieurs entités                    | RDS (généralement)      |
| Serverless / pics de trafic imprévisibles             | DynamoDB à la demande   |
| Reporting financier, analyse ad hoc                   | RDS ou un entrepôt de données |
| Sourcing d'événements, capture de changements, traitement en temps réel | DynamoDB + Streams |

La mauvaise réponse est toujours « toujours utiliser l'un ou l'autre ». Nimbus a fini par utiliser les deux : RDS pour l'historique des commandes et les enregistrements financiers (structurés, relationnels, besoin de reporting), DynamoDB pour le menu (schéma flexible, volume de lecture élevé, accès par ID de restaurant).

## La bonne base de données pour la bonne charge de travail

Avançons de six mois — bien après que la migration vers DynamoDB se soit installée — et Nimbus avait trois nouveaux projets au tableau. Maya les présenta à l'équipe un mardi matin.

« Premièrement : un moteur de recommandation. On veut montrer aux clients les plats qu'ils sont susceptibles de commander en fonction de leur historique et de ce que les gens aux goûts similaires ont commandé. Deuxièmement : on déplace les données du menu pour prendre en charge un contenu plus riche — des documents de menu complets en JSON, structure différente par restaurant, schéma flexible. Troisièmement : on est sur le point de finaliser l'acquisition de Barato, et leur équipe de données fait tourner un cluster Cassandra pour les données de comportement client. Ils veulent l'amener sur AWS sans réécrire leurs pipelines. »

Trois projets. Trois besoins de données très différents. Aucun d'eux n'était un cas évident pour DynamoDB.

« Tous ces projets ont besoin de bases de données différentes », dit Priya.

« On a DynamoDB », dit Leo.

« On a le droit de choisir le bon outil », dit Priya.

**Amazon DocumentDB : quand votre charge de travail parle MongoDB**

Le deuxième projet — des documents de menu JSON riches avec des schémas flexibles, par restaurant — décrivait une base de données documentaire. Nimbus utilisait déjà le schéma flexible de DynamoDB pour le menu, mais à mesure que l'équipe construisait des fonctionnalités de menu plus sophistiquées (modificateurs imbriqués, tarification basée sur le temps, structures de formules complexes), le modèle de requête de DynamoDB montrait ses limites. L'équipe voulait des requêtes de documents plus riches : trouver tous les éléments de menu où un modificateur imbriqué contient une option spécifique, filtrer par champs arbitraires à l'intérieur de la structure JSON.

« C'est un schéma de base de données documentaire », dit Priya. « MongoDB. »

« On pourrait faire tourner MongoDB sur EC2 », proposa Leo.

« Ou on pourrait utiliser DocumentDB », dit Priya.

**Amazon DocumentDB** est une base de données documentaire gérée compatible avec MongoDB. Elle stocke les données sous forme de documents de type JSON avec des schémas flexibles — différents documents dans la même collection peuvent avoir des champs différents. DocumentDB prend en charge le langage de requête, les API et les pilotes de MongoDB. Si votre charge de travail tourne actuellement sur MongoDB, DocumentDB parle le même langage. Le chemin de migration consiste à déplacer une chaîne de connexion, pas à réécrire une application.

DocumentDB est entièrement géré : pas de patch, sauvegardes automatisées, haute disponibilité Multi-AZ, réplicas de lecture et stockage qui grandit automatiquement à mesure que vos données grandissent.

« Donc on migre le menu vers DocumentDB », dit Leo. « Et les requêtes qu'on a déjà en syntaxe MongoDB fonctionnent telles quelles ? »

« Avec des tests de compatibilité mineurs, oui », confirma Priya. « DocumentDB prend en charge la plupart de l'API de requête de MongoDB. Vérifiez la matrice de compatibilité avant de présumer une couverture complète, mais pour les requêtes de documents et les agrégations, c'est simple. »

Le signal d'examen pour DocumentDB est simple : **« compatible MongoDB »** ou **« document store »**. Si un scénario mentionne MongoDB ou des données orientées document, DocumentDB est la réponse AWS gérée.

**Amazon Neptune : quand les relations sont les données**

Le moteur de recommandation était un problème plus difficile.

La question n'était pas « qu'a commandé ce client ? » — c'était une simple recherche DynamoDB. La question était : « quels clients ont des profils de goûts similaires à ce client, et quels plats ces clients ont-ils aimés que ce client n'a pas encore essayés ? »

C'est un problème de graphe. Le modèle de données n'est pas une table de lignes ou une collection de documents. C'est un réseau de relations : des clients connectés à des plats (commandés, notés, vus), des plats connectés à des restaurants et des types de cuisine, des restaurants connectés à des quartiers et des villes. La recommandation n'est pas dans les points de données — elle est dans les chemins entre eux.

« On a besoin d'une base de données de graphe », dit Priya.

**Amazon Neptune** est une base de données de graphe entièrement gérée. Elle prend en charge deux modèles de graphe : le **graphe de propriétés** (interrogé avec le langage de parcours Gremlin) et le **RDF** (interrogé avec SPARQL). Vous choisissez en fonction de votre pile de graphe existante ou de la préférence de l'équipe ; les deux tournent sur la même infrastructure Neptune.

Les bases de données de graphe sont conçues spécifiquement pour les charges de travail où les relations entre les points de données sont aussi importantes que les données elles-mêmes : réseaux sociaux (qui est connecté à qui), moteurs de recommandation (qu'ont aimé les utilisateurs similaires), détection de fraude (quelles transactions partagent des schémas suspects entre comptes) et graphes de connaissances (comment les concepts sont reliés).

Pour le moteur de recommandation de Nimbus : les clients et les plats devinrent des nœuds dans Neptune. Les événements de commande devinrent des arêtes. Un parcours Gremlin pouvait trouver, en une seule requête, tous les plats que des clients aux historiques de commande similaires avaient bien notés, triés par la force de la connexion — sans les chaînes de JOIN complexes qui seraient requises dans une base de données relationnelle ni les multiples requêtes aller-retour qui seraient nécessaires dans DynamoDB.

Le signal d'examen pour Neptune : **« réseau social », « moteur de recommandation », « graphe de connaissances », « détection de fraude »** ou **« parcours de graphe »**. Si un scénario décrit des données où les connexions importent autant que les données elles-mêmes, Neptune est la réponse.

**Amazon Keyspaces : Cassandra sans les opérations**

L'acquisition de Barato amena un cluster Cassandra dans le tableau. Cassandra est une base de données NoSQL à colonnes larges — conçue pour un débit d'écriture très élevé et une évolutivité horizontale, couramment utilisée pour les données de séries temporelles, les journaux d'activité des utilisateurs et la télémétrie IoT. L'équipe de données de Barato l'utilisait pour suivre le comportement des clients : quels articles étaient consultés, lesquels étaient ajoutés au panier, lesquels étaient abandonnés.

Migrer Cassandra vers AWS avait deux options : le faire tourner sur EC2 (charge opérationnelle de gestion du cluster, des mises à niveau, de la mise à l'échelle) ou utiliser l'option gérée.

« Amazon Keyspaces », dit Priya.

**Amazon Keyspaces** est une base de données gérée serverless, compatible avec Cassandra. Elle prend en charge le langage de requête Cassandra (CQL) — le même langage de requête que les pipelines de Barato utilisaient déjà. Comme DocumentDB pour MongoDB, Keyspaces est le chemin géré : garder le code de l'application tel quel, le pointer vers un point de terminaison Keyspaces au lieu du cluster auto-géré, et laisser AWS gérer l'infrastructure.

Keyspaces s'adapte automatiquement au trafic, ne nécessite aucune planification de capacité et est serverless — vous payez pour les lectures et écritures que vous effectuez réellement. Pour les données de suivi de comportement de Barato, c'était le bon modèle : volume extrêmement variable (heure de pointe du dîner vs 3 h du matin), schéma à colonnes larges, débit d'écriture élevé.

Le signal d'examen : **« compatible Cassandra », « colonnes larges », « CQL »** ou **« charge de travail Cassandra »**.

**Choisir la bonne base de données : une table de référence**

À ce stade de l'histoire, le paysage des bases de données de Nimbus ne ressemblait en rien à ce qu'il était au chapitre sept. Le bon outil pour chaque charge de travail :

| Phrase déclencheuse | Base de données |
|---|---|
| « compatible MongoDB » ou « document store » | DocumentDB |
| « relations de graphe », « réseau social », « moteur de recommandation » | Neptune |
| « compatible Cassandra » ou « colonnes larges » | Keyspaces |
| « clé-valeur à n'importe quelle échelle », « latence à un chiffre en millisecondes » | DynamoDB |
| « relationnel + serverless », « SQL à mise à l'échelle automatique » | Aurora Serverless |
| « données structurées, requêtes complexes, reporting » | RDS (PostgreSQL, MySQL) |

« Est-ce que ça va continuer à grandir ? » demanda Leo, en regardant la liste.

« Oui », dit Maya. « Parce que des problèmes différents ont des formes différentes. Et utiliser la mauvaise forme vous coûte soit en performance, soit en temps de développement, soit les deux. »

« La bonne question n'est pas "quelle base de données devrait-on utiliser" », ajouta Priya. « C'est "quelle est la forme de nos données, et comment y accéderons-nous ?" La base de données découle de la réponse. »

C'était la chose la plus importante qu'elle avait dite sur les bases de données en deux ans.

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
- Les partitions chaudes sont des tueuses silencieuses — aucune erreur jusqu'à ce que la limitation commence

## Résumé

La refonte du schéma avait pris deux jours et beaucoup d'espace de tableau blanc. Choisir une base de données NoSQL n'est pas seulement une décision technique — elle change entièrement votre façon de penser aux données. Mais le résultat était une table des menus qui pouvait grandir à n'importe quelle taille sans ralentir. Tout aussi important : l'équipe a appris où se trouvent les limites de DynamoDB, et vers quelles bases de données spécialisées se tourner quand le problème change de forme.

- DynamoDB est le service de base de données NoSQL géré d'AWS. Les éléments sont des documents flexibles — pas de schéma fixe. Chaque élément doit avoir une **clé primaire** : une clé de partition seule, ou une clé de partition + clé de tri. Choisissez la clé de partition pour une distribution uniforme — les partitions chaudes causent la limitation.
- La capacité **à la demande** s'adapte automatiquement ; la capacité **provisionnée** est moins chère pour un trafic prévisible. Les lectures **éventuellement cohérentes** sont moins chères ; les lectures **fortement cohérentes** sont toujours à jour mais indisponibles sur les GSI.
- **DynamoDB Streams** capture les changements au niveau des éléments en temps réel — utilisez-les pour piloter l'invalidation du cache, les mises à jour de l'index de recherche et les pipelines d'analyse.
- DynamoDB est le mauvais choix pour le reporting, les jointures complexes et les requêtes ad hoc — utilisez RDS pour cela.
- **DocumentDB** (compatible MongoDB), **Neptune** (base de données de graphe) et **Keyspaces** (compatible Cassandra) sont des alternatives gérées AWS pour les charges de travail qui ne correspondent pas au modèle clé-valeur de DynamoDB.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.3)*

- Connaissez les règles de la clé de partition : **haute cardinalité, distribution uniforme**. Les partitions chaudes sont un piège d'examen courant.
- **À la demande vs provisionné** : à la demande pour un trafic imprévisible ; provisionné (avec Auto Scaling) pour des charges de travail prévisibles.
- **DynamoDB Streams** : capture les changements au niveau des éléments en temps réel. Scénario d'examen courant : « déclencher une fonction Lambda quand un enregistrement change. »
- **Tables globales** : réplication multi-Région et multi-active pour les applications distribuées mondialement et les scénarios de reprise après sinistre. À l'examen, c'est un signal fort quand la charge de travail a besoin de lectures et d'écritures locales dans plus d'une Région.
- **DynamoDB TTL (Time to Live)** : définissez un attribut d'horodatage d'expiration sur les éléments et DynamoDB les supprime automatiquement après expiration — **sans coût**, sans consommer de capacité d'écriture. Déclencheur d'examen : « les données de session / les éléments temporaires doivent être supprimés automatiquement après N heures au coût le plus bas » → TTL, jamais un scan Lambda planifié. Les éléments expirés peuvent aussi alimenter DynamoDB Streams pour l'archivage.
- **DAX (DynamoDB Accelerator)** : couche de mise en cache en mémoire pour DynamoDB. Réduit la latence de lecture de millisecondes à microsecondes. L'examen utilise ça quand les réplicas de lecture RDS n'aident pas (parce que c'est un cache spécifique à DynamoDB).
- **Clé primaire composite** : clé de partition + clé de tri permet des requêtes flexibles dans une partition. Exemple : récupérer toutes les commandes d'un client entre deux dates — `customerId` est la clé de partition, `orderDate` est la clé de tri.
- **GSI vs LSI** : un GSI peut être ajouté après la création de la table ; un LSI ne le peut pas. Un LSI prend en charge les lectures fortement cohérentes ; un GSI ne le fait pas. Un LSI partage la capacité de la table ; un GSI a la sienne.
- Sachez quand NE PAS utiliser DynamoDB : jointures complexes, reporting ad hoc, transactions multi-entités → RDS est généralement la réponse.
- **Sélection de base de données spécialisée** — l'examen présente fréquemment un scénario et demande quelle base de données convient. Utilisez ceci comme référence rapide : « compatible MongoDB » → DocumentDB. « Graphe/réseau social/moteur de recommandation/graphe de connaissances » → Neptune. « Compatible Cassandra/colonnes larges » → Keyspaces. « Clé-valeur à n'importe quelle échelle/latence en millisecondes » → DynamoDB. « Relationnel/requêtes complexes/reporting » → RDS ou Aurora.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre une clé de partition et une clé de tri. Quand utiliseriez-vous les deux ?

*(Indice : Pensez au menu Nimbus — pourquoi avoir restaurantId comme clé de partition et itemId comme clé de tri rend-il efficace la récupération du menu complet d'un restaurant ?)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une société de jeux mondiale stocke des profils de joueurs dans DynamoDB. Chaque profil comprend des champs comme le nom d'utilisateur, le niveau, les succès et l'inventaire. Certains joueurs ont 10 articles d'inventaire ; d'autres en ont quelques centaines — les profils varient en forme mais chacun reste confortablement sous la limite de taille d'élément de 400 Ko de DynamoDB. La société a besoin d'une latence de lecture à un chiffre en millisecondes pour les recherches de profil pendant le jeu actif.

Quelle approche de conception prend LE MIEUX en charge cette exigence ?

A) Utiliser DynamoDB avec `playerId` comme clé de partition et stocker le profil entier comme un seul élément  
B) Migrer vers RDS Aurora avec des réplicas de lecture dans chaque région  
C) Utiliser DynamoDB avec `level` comme clé de partition pour regrouper les joueurs de compétence similaire  
D) Utiliser ElastiCache devant RDS pour atteindre une latence inférieure à la milliseconde

**Indice 1** : Le schéma d'accès est « chercher un joueur spécifique par ID ». Quelle clé rend ça efficace ?

**Indice 2** : Une option crée une partition chaude terrible. Quel attribut a une très faible cardinalité ?

**Indice 3** : DynamoDB offre déjà nativement une latence à un chiffre en millisecondes.

**Réponse** : A

**Explication** : Utiliser `playerId` comme clé de partition distribue les données uniformément sur les partitions et permet des recherches instantanées par ID de joueur — exactement le schéma d'accès décrit. Le modèle de document flexible de DynamoDB gère les tailles d'inventaire variables sans changements de schéma.

**Pourquoi pas B ?** RDS Aurora avec des réplicas de lecture ajoute de la complexité et n'est toujours pas le premier choix naturel pour ce type de recherche de profil basée sur les clés à l'échelle du jeu.

**Pourquoi pas C ?** Utiliser `level` comme clé de partition crée de sévères partitions chaudes — la plupart du trafic va au niveau 1 (nouveaux joueurs) ou au niveau maximum (vétérans actifs), laissant les autres partitions inactives.

**Pourquoi pas D ?** La question décrit DynamoDB, pas RDS. Ajouter ElastiCache devant RDS introduit deux nouveaux services quand DynamoDB seul résout le problème.

*Domaine SAA-C03 : Concevoir des architectures performantes — Tâche 3.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus ajoute une fonctionnalité « favoris » : les clients peuvent sauvegarder leurs articles de menu favoris et les recommander d'un seul tap.

Concevez la table DynamoDB pour cette fonctionnalité. Quelle serait la clé de partition ? Utiliseriez-vous une clé de tri ? À quoi ressemblerait la structure de l'élément ?

Ensuite, considérez : que se passe-t-il si vous avez besoin d'afficher les « 100 articles les plus favoris de tous les clients » ? DynamoDB peut-il répondre à ça efficacement ? Si non, qu'ajouteriez-vous à l'architecture ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à concevoir pour des schémas d'accès.)*

## Scène post-générique

« Je l'ai déjà déployé — oh. » Leo avait lancé la migration du menu vers DynamoDB le jeudi soir sans le dire à personne. Ça a marché. Les lectures étaient rapides. Le schéma était flexible. Les partenaires restaurant pouvaient ajouter n'importe quel champ modificateur qu'ils voulaient. Mais il avait oublié de mettre à jour les tableaux de bord de surveillance, et Priya avait passé vingt minutes le vendredi matin à se demander pourquoi les métriques de la base de données étaient devenues plates.

Il se sentait quand même bien dans sa peau.

Puis Priya, les tableaux de bord restaurés, regarda les métriques.

« Leo », dit-elle, « chaque chargement de page fait quarante-sept requêtes DynamoDB. »

« Une par restaurant affiché », confirma Leo. « La page de parcours charge les quarante-sept restaurants les plus proches de l'emplacement du client. »

« Et chacune de ces requêtes prend environ quatre millisecondes. »

Leo fit le calcul. Quarante-sept fois quatre. « Ça fait... cent quatre-vingt-huit millisecondes rien que pour le menu. Avant le rendu. »

« À chaque chargement de page. »

« Pour chaque client. »

Il fixa l'écran.

« On a besoin d'un cache », dit-il.

Dans le prochain chapitre : la couche entre l'application de Nimbus et sa base de données qui rend rapides les requêtes lentes.
