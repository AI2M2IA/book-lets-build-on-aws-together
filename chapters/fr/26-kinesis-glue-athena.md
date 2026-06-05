# Chapitre 26 : Donner du Sens à Tout

Les données sont brutes : horodatages, clics, événements, chiffres. L'information est ce que vous obtenez quand les données sont organisées, traitées et mises en contexte. L'écart entre les deux, c'est là que vit ce chapitre.

Et dans les systèmes en croissance, cet écart devient vite coûteux.

Nimbus générait d'énormes quantités de données. Chaque commande : enregistrée. Chaque vue de menu : tracée. Chaque mise à jour de restaurant : capturée. Chaque interaction client : suivie.

Tom avait une question.

« Quelle est notre heure de commande la plus chargée le vendredi ? »

Leo le regarda. « Ce n'est pas dans notre tableau de bord. »

« Peut-on l'ajouter ? »

« Les données sont dans DynamoDB. Et dans les logs CloudWatch. Et dans S3 depuis la tâche d'export analytique. » Leo s'arrêta. « Dans trois endroits différents, dans trois formats différents. »

Maya ajouta : « Et l'export analytique ne s'exécute qu'une fois par nuit. Si vous voulez les données du vendredi, vous devrez attendre jusqu'au samedi matin. »

Tom regarda l'écran. « Donc on a les données. On ne peut juste pas les utiliser. »

Cette phrase décrit la moitié de l'analytique moderne.

C'est le problème de l'ingénierie des données : vous avez des données, mais elles ne sont pas dans une forme que vous pouvez analyser quand vous en avez besoin.

**Trois Problèmes Différents**

Le problème de données de Nimbus avait trois dimensions :

**Streaming en temps réel** : Des commandes sont passées maintenant. Vous voulez voir un tableau de bord en direct de la vélocité des commandes — combien par minute, par région, par restaurant. Les données doivent être traitées à mesure qu'elles arrivent.

**Transformation de données** : Les données sont dans S3 depuis divers systèmes, dans différents formats (JSON, CSV, Parquet). Avant de pouvoir les analyser, vous devez les normaliser — même schéma, même format, nettoyé, joint avec des données de référence.

**Analyse ad hoc** : Une fois les données organisées, vous voulez exécuter des requêtes SQL dessus sans avoir à les charger d'abord dans une base de données. « Donnez-moi les 10 meilleurs restaurants par chiffre d'affaires au cours des 30 derniers jours. » Sans charger les données dans une base de données.

Chacun de ces problèmes est distinct. AWS a un service dédié pour chacun :

- **Amazon Kinesis** : Streaming de données en temps réel
- **AWS Glue** : Transformation de données et catalogage
- **Amazon Athena** : Requêtes SQL serverless sur S3

**Amazon Kinesis : Le Téléscripteur en Temps Réel**

**Amazon Kinesis Data Streams** est un service de streaming de données en temps réel. Les producteurs envoient des enregistrements de données au flux. Plusieurs consommateurs peuvent lire depuis le flux simultanément, chacun à son propre rythme.

Pensez à un téléscripteur : les prix s'impriment en continu, tout le monde peut lire le ruban, et le ruban ne ralentit pas pour aucun lecteur individuel.

Pour Nimbus, quand une commande est passée, l'application publie un événement dans un flux Kinesis : `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consommateurs de ce flux :

- Un tableau de bord en temps réel (lit les événements à mesure qu'ils arrivent, met à jour les métriques)
- Un Lambda de détection de fraude (cherche des modèles de commandes inhabituels)
- Un flux vers S3 pour le stockage permanent

**Concepts Kinesis Data Streams** :

- **Shard** : L'unité de base de capacité. Un shard gère 1 Mo/s en écriture, 2 Mo/s en lecture.
- **Période de rétention** : Les données restent dans le flux pendant 24 heures (par défaut) à 7 jours.
- **Numéro de séquence** : Chaque enregistrement a un numéro de séquence. Les consommateurs suivent leur position dans le flux.

**Amazon Data Firehose** (anciennement **Kinesis Data Firehose**) : Le service de livraison géré entre les producteurs de streaming et les destinations telles que S3, Redshift et OpenSearch. Il met en mémoire tampon, compresse, transforme et livre les données automatiquement.

Pour Nimbus : Kinesis Data Streams → Amazon Data Firehose → S3 (format Parquet, compressé, partitionné par date).

**AWS Glue : Le Traducteur**

Les données dans S3 sont brutes. Avant de pouvoir les analyser efficacement, vous devez :

- Découvrir ce qui s'y trouve et son schéma (quelles colonnes, quels types)
- Les transformer dans un format cohérent
- Joindre différents jeux de données ensemble
- Gérer les enregistrements incorrects, les changements de schéma, les valeurs manquantes

**AWS Glue** est un service ETL (Extract, Transform, Load) entièrement géré. Il a deux composantes principales :

**Glue Data Catalog** : Un magasin de métadonnées qui décrit vos données S3 — quelles tables existent, quelles colonnes elles ont, où se trouvent les fichiers de données. C'est comme un fichier catalogue pour votre lac de données.

**Glue Crawlers** : Des agents automatisés qui scannent S3, infèrent le schéma et remplissent le Data Catalog. Exécutez un crawler sur votre bucket S3 et 10 minutes plus tard vous avez un catalogue de toutes vos tables.

**Glue Jobs** : Des tâches Spark/Python serverless qui effectuent la transformation réelle. Vous écrivez la logique de transformation (ou utilisez l'outil ETL visuel de Glue), et Glue l'exécute sur une infrastructure gérée.

Pour Nimbus :

1. Glue Crawler scanne les données de commandes dans S3 → crée une définition de table dans le Glue Data Catalog
2. Glue Job transforme les événements de commandes JSON bruts en un format Parquet propre et partitionné
3. Les données transformées sont réécrites dans S3 dans une disposition optimisée pour les requêtes

**Amazon Athena : Le Bibliothécaire**

**Amazon Athena** est un service de requêtes interactives serverless qui exécute des requêtes SQL directement sur les données S3. Pas de base de données à provisionner, pas de données à charger. Vous définissez une table (ou utilisez le Glue Data Catalog), écrivez du SQL, et Athena exécute la requête sur les fichiers S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='01'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

La tarification Athena est basée sur la quantité de données qu'une requête analyse. Dans de nombreuses régions, les requêtes SQL standard commencent à 5 $ par téraoctet analysé. Utiliser le format Parquet (en colonnes) avec l'élagage de partitions (`WHERE year='2024' AND month='01'`) signifie qu'Athena ne scanne que les fichiers dont elle a besoin, ce qui réduit considérablement le coût.

« On peut exécuter cette requête sur 30 jours de données, » dit Leo, « et ça peut coûter étonnamment peu si on stocke bien. »

« Pour n'importe quelle question arbitraire qu'on peut penser ? » demanda Tom.

« N'importe quelle question qu'on peut exprimer en SQL, sur n'importe quelles données qu'on a stockées dans S3. »

Tom avait l'air de quelqu'un qui recalculait la valeur de toutes les données qu'il avait été en train de jeter.

**L'Architecture du Lac de Données**

Ces trois services se combinent en ce qu'on appelle une **architecture de lac de données** — un dépôt S3 centralisé pour toutes vos données, avec des outils pour les traiter et les interroger :

```
Applications (commandes, menus, événements)
    |
    | Événements en temps réel
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (brut)
                                                   |
                                                   | Glue Crawler découvre le schéma
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Glue Jobs transforment
                                                   ↓
                                              S3 (propre, Parquet, partitionné)
                                                   |
                                                   | Requêtes SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Outils Business Intelligence
                                       (QuickSight, Tableau, etc.)
```

Les données brutes sont toujours préservées (dans le bucket S3 d'origine). Les données transformées sont interrogeables via Athena. De nouvelles questions peuvent toujours être répondues en exécutant de nouveaux Glue Jobs sur les données brutes.

**Amazon Redshift : Quand Athena Ne Suffit Pas**

Pour certains cas d'utilisation, Athena est trop lente ou trop chère :

- Requêtes très complexes avec de nombreuses jointures
- Tableaux de bord qui exécutent la même requête des milliers de fois par jour
- Machine learning sur des données structurées
- Exigences de temps de réponse inférieur à la seconde pour les outils BI

**Amazon Redshift** est un entrepôt de données entièrement géré : une base de données analytique en colonnes conçue pour les charges de travail analytiques importantes et répétées. Contrairement à Athena, qui interroge les données là où elles se trouvent dans S3, Redshift charge les données dans un stockage d'entrepôt optimisé et utilise l'optimisation des requêtes, les stratégies de tri et de distribution pour accélérer les analyses complexes.

Redshift est significativement plus rapide pour les requêtes analytiques complexes au prix d'un coût (capacité provisionnée) et de l'obligation de charger les données avant de les interroger.

**Redshift Serverless** supprime le fardeau de la planification de la capacité — vous interrogez, Redshift évolue. Le coût est par requête.

Pour Nimbus à leur échelle actuelle : Athena est suffisant. À cinq fois le volume de données et avec des outils BI interrogeant les mêmes tableaux de bord des centaines de fois par jour, Redshift deviendrait rentable.

## Points Forts et Limites

**Kinesis Data Streams** : Utilisez Kinesis quand vos données arrivent en continu et que l'ordre compte — flux de clics, transactions financières, télémétrie IoT. Kinesis préserve l'ordre des enregistrements au sein d'un shard et permet la relecture pendant la fenêtre de rétention configurée, ce qui le différencie fondamentalement de SQS. Le compromis est la complexité opérationnelle : en mode provisionné, vous gérez la capacité des shards et le comportement des consommateurs. Pour les files de tâches simples où l'ordre n'a pas d'importance et la relecture n'est pas nécessaire, SQS est le choix plus simple.

**AWS Glue** : Glue élimine l'infrastructure d'un cluster ETL traditionnel. Vous écrivez la logique de transformation ; AWS gère l'environnement Spark. C'est précieux quand les transformations sont complexes ou que les volumes de données sont importants. La limitation est le coût et le démarrage à froid — les tâches Glue ont un délai de démarrage de plusieurs minutes, les rendant inadaptées aux transformations quasi temps réel. Pour les simples conversions de format de fichier (CSV vers Parquet), la surcharge de Glue peut ne pas en valoir la peine par rapport à une fonction Lambda ou un script léger.

**Amazon Athena** : Athena vous permet d'interroger des données S3 avec du SQL standard et aucune infrastructure à gérer. La contrainte critique est le coût : Athena facture par téraoctet de données analysées. Une requête sur une table de 10 To qui scanne tout coûte significativement plus que la même requête sur une table formatée en Parquet et partitionnée qui ne scanne que 200 Go. Utilisez toujours des formats en colonnes (Parquet ou ORC) et partitionnez vos données avant d'exécuter Athena en production. Sans ces optimisations, les factures Athena peuvent vous surprendre.

## Résumé

- **Amazon Kinesis** : Streaming de données en temps réel. Les producteurs écrivent des enregistrements ; les consommateurs lisent à leur propre rythme. Amazon Data Firehose peut ensuite livrer les données de streaming vers S3, Redshift et d'autres destinations avec moins de travail opérationnel.
- **AWS Glue** : ETL et catalogage de données. Les Crawlers découvrent les schémas ; les Jobs transforment les données ; le Data Catalog rend les données découvrables par Athena et d'autres outils.
- **Amazon Athena** : SQL serverless sur S3. Interrogez n'importe quelles données dans S3 en SQL standard. Facturé par To analysé — utilisez Parquet et le partitionnement pour minimiser les coûts.
- **Amazon Redshift** : Entrepôt de données géré pour les analyses haute performance. Chargez les données, optimisez pour les requêtes analytiques répétées, et interrogez rapidement à l'échelle de l'entrepôt.
- Le **modèle de lac de données** : données brutes vers S3 → Glue les transforme → Athena les interroge → les outils BI les visualisent.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.5)*

- **Kinesis vs SQS** : Kinesis = streaming ordonné en temps réel, plusieurs consommateurs, relecture dans la fenêtre de rétention. SQS = file de tâches, chaque message traité une fois. « Plusieurs consommateurs lisant le même flux simultanément » → Kinesis. « Un worker par message » → SQS.
- **Signaux d'examen Athena** : « SQL serverless sur S3 », « analyser des données S3 sans les charger dans une base de données », « payer par requête » → Athena.
- **Optimisation des coûts Athena** : Le format en colonnes (Parquet ou ORC) + le partitionnement réduit considérablement les données analysées et le coût. L'examen peut demander comment réduire les coûts Athena.
- **Glue Crawler** : « Découvrir automatiquement le schéma des données S3 » → Glue Crawler.
- **Amazon Data Firehose** : « Charger automatiquement les données de streaming vers S3/Redshift/OpenSearch sans gérer de consommateurs » → Amazon Data Firehose. Les anciens documents peuvent encore l'appeler Kinesis Data Firehose.
- **Redshift vs Athena** : Redshift pour les requêtes fréquentes et complexes sur un jeu de données fixe (tableaux de bord BI). Athena pour les requêtes ad hoc sur des données S3 qui changent fréquemment.
- **EMR (Elastic MapReduce)** : Clusters Hadoop/Spark gérés par AWS. L'examen l'utilise quand « charges de travail Hadoop/Spark existantes » ou « frameworks de traitement de données personnalisés » sont mentionnés. Glue est l'alternative gérée pour la plupart des cas d'utilisation.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre Amazon Kinesis et Amazon SQS. Quand utiliseriez-vous chacun ?

*(Indice : Réfléchissez au nombre de consommateurs qui peuvent lire les mêmes données, si les messages sont supprimés après la lecture, et si l'ordre est important.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de covoiturage veut analyser des données de trajets. 1 million de trajets sont complétés quotidiennement. Les enregistrements de trajets sont stockés dans S3 sous forme de fichiers JSON (environ 2 Ko chacun). L'équipe analytique veut exécuter des requêtes SQL ad hoc comme « durée moyenne des trajets par ville la semaine dernière ». Les requêtes doivent se compléter en moins de 2 minutes. Les coûts de stockage doivent être minimisés. L'équipe effectuera 20 à 30 requêtes par semaine.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Charger les données de trajets dans RDS PostgreSQL quotidiennement ; interroger avec du SQL standard  
B) Utiliser AWS Glue pour convertir JSON en format Parquet partitionné par date et ville ; interroger avec Amazon Athena  
C) Utiliser Amazon Data Firehose pour livrer les données de trajets vers Amazon Redshift ; interroger avec Redshift  
D) Charger les données de trajets dans DynamoDB et utiliser PartiQL pour les requêtes SQL

**Indice 1** : 20 à 30 requêtes par semaine est une faible fréquence. Quel service est le plus rentable pour les requêtes occasionnelles ?

**Indice 2** : Le format Parquet + le partitionnement réduit considérablement les données analysées par Athena — et donc le coût.

**Indice 3** : 1 million de trajets × 2 Ko = ~2 Go par jour. Sur une semaine, ~14 Go. À 5 $/To pour Athena, même sans optimisation, c'est abordable.

**Réponse** : B

**Explication** : Glue convertit JSON en Parquet (le format en colonnes réduit considérablement les données analysées) partitionné par date et ville (l'élagage de partitions signifie que les requêtes de « la semaine dernière » ne scannent que 7 jours de partitions). Athena interroge S3 directement avec du SQL standard. Pour 20 à 30 requêtes par semaine, Athena avec paiement par requête est extrêmement rentable par rapport à Redshift toujours en marche.

**Pourquoi pas A ?** Charger 2 Go de données quotidiennement dans RDS, puis interroger, nécessite une instance de base de données tournant 24h/24. Pour 20 à 30 requêtes par semaine, c'est vastement sur-conçu et coûteux.

**Pourquoi pas C ?** Redshift est rentable pour les requêtes fréquentes (des centaines par jour sur le même jeu de données). Pour 20 à 30 requêtes par semaine, le cluster Redshift toujours allumé coûte bien plus que la tarification par requête d'Athena.

**Pourquoi pas D ?** DynamoDB est un magasin clé-valeur/document optimisé pour l'accès basé sur des clés, pas pour les requêtes analytiques ad hoc. PartiQL sur DynamoDB ne supporte pas les agrégations GROUP BY décrites.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.5*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus veut construire un système de détection de fraude en temps réel pour les commandes. Le système devrait :

- Détecter les commandes passées par le même compte plus de 5 fois en 60 secondes
- Signaler les commandes supérieures à 500 $ provenant de nouveaux comptes (< 30 jours)
- Envoyer les commandes signalées dans une file de révision humaine

Concevez l'architecture. Que fournit Kinesis ? Où s'exécute la logique de fraude ? Comment corrèlez-vous « même compte, fenêtre de 60 secondes » ? Quel service reçoit les commandes signalées ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception d'architecture de streaming en temps réel.)*

## Scène Post-Générique

Tom exécuta la première requête Athena.

« Top 10 des restaurants par chiffre d'affaires du dernier trimestre, » dit-il.

12 secondes plus tard, les résultats apparurent.

Il les fixa.

« Le restaurant 47 était premier, » dit-il. C'était le restaurant de la famille de Maya — celui où Nimbus avait commencé, quand elle réalisa qu'ils perdaient des commandes parce que le téléphone était toujours occupé.

« Bien sûr que oui, » dit Maya. « L'arepa est si bonne. »

Tom exécuta une autre requête. Et une autre. Chacune répondue en secondes, chacune coûtant des fractions de cent.

Après une heure, il avait une image complète de l'entreprise Nimbus d'une façon qu'il n'avait jamais eue auparavant. Quelles catégories de restaurants avaient grandi le plus vite. Quelles cohortes de clients avaient eu la plus longue rétention. Quels plats au menu avaient généré le plus de commandes répétées.

« Pourquoi n'avons-nous pas construit ça plus tôt ? » demanda-t-il.

« On avait les données, » dit Leo. « On n'avait juste pas le pipeline pour les utiliser. »

« Les données ont toujours été là, » dit Maya doucement. « On ne pouvait juste pas les voir. »

Dans le prochain chapitre : maintenant qu'on peut voir clairement l'entreprise, parlons de la façon de payer pour l'infrastructure qui la fait tourner — plus efficacement.
