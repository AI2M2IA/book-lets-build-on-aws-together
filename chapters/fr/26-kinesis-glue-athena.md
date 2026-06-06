# Chapitre 26 : Donner du sens à tout

Tom fixait une impression.

C'était deux pages de chiffres : nombres de commandes, totaux de chiffre d'affaires, horodatages, codes de région. Il avait demandé à Leo de rassembler tout ce qui était disponible sur les schémas de commandes du vendredi. Leo avait passé une heure à écrire un script qui joignait trois sources de données différentes — DynamoDB, les journaux CloudWatch, et un export analytique S3 — et voilà ce qui en était sorti.

Les chiffres étaient tous là. Ils ne lui disaient rien.

Il pouvait voir que 847 commandes avaient été passées le vendredi. Il ne pouvait pas dire quand elles avaient été passées, quels restaurants avaient été les plus occupés, ni quelle était l'heure de pointe. Cette information était dans les données. Elle était simplement invisible.

---

Toute l'optimisation réseau du chapitre 25 avait rendu l'infrastructure de Nimbus plus rapide et moins chère. Mais les données que cette infrastructure générait — dans DynamoDB, dans les journaux CloudWatch, dans l'export analytique S3 qui tournait une fois par nuit — étaient dans trois endroits différents, dans trois formats différents, déconnectées de tout ce que Tom pouvait réellement utiliser.

La question de Maya rendit cela concret. « Quelle est notre heure de commande la plus chargée le vendredi ? »

Leo la regarda. « Ce n'est pas dans notre tableau de bord. »

« Peut-on l'ajouter ? »

« Les données sont dans DynamoDB. Et dans les journaux CloudWatch. Et dans S3 depuis la tâche d'export analytique. » Leo s'arrêta. « Dans trois endroits différents, dans trois formats différents. »

Maya ajouta : « Et l'export analytique ne s'exécute qu'une fois par nuit. Si vous voulez les données du vendredi, vous devrez attendre jusqu'au samedi matin. »

Tom regarda l'impression. « Donc on a les données. On ne peut juste pas les utiliser. »

Cette phrase décrit la moitié de l'analytique moderne.

---

**Le tableau blanc**

Maya arriva tôt au bureau et avait déjà rempli la moitié du tableau blanc quand Leo arriva.

Sept questions, écrites en deux colonnes, toutes des questions métier, aucune ne pouvant être répondue depuis les tableaux de bord actuels :

1. Quels restaurants ont le taux d'annulation de commandes le plus élevé dans les 30 premiers jours ?
2. Quel est le temps moyen entre la réception d'une notification de commande par un restaurant et sa confirmation ? Comment cela varie-t-il par restaurant et par jour de la semaine ?
3. Quelles villes ont le taux le plus élevé de clients recommandant au même restaurant dans les 14 jours ?
4. Quel pourcentage de commandes sont passées lors de la première session de l'application vs les sessions de retour ?
5. Quelles catégories de menu génèrent le chiffre d'affaires le plus élevé par restaurant ?
6. Quelle est la corrélation entre le temps de réponse d'un restaurant et le taux de recommande des clients ?
7. Comment le volume de commandes change-t-il dans les 48 heures avant et après qu'un partenaire restaurant publie sur les réseaux sociaux ?

« Peut-on répondre à l'une de celles-ci ? » demanda-t-elle.

Leo regarda la liste. Il regarda le tableau de bord actuel — nombre de commandes, total de chiffre d'affaires, restaurants actifs.

« Numéro un », dit-il lentement. « Partiellement. On a les enregistrements d'annulation. Mais il faudrait les joindre aux dates d'intégration des restaurants, et c'est dans un système différent. »

« Numéro deux ? » demanda Tom.

« On stocke l'horodatage de notification. On stocke l'horodatage de confirmation. Ils sont dans des tables différentes dans des formats différents. Il faudrait les JOIN et calculer le delta. »

« Donc les données existent », dit Maya.

« Les données existent », confirma Leo. « On n'a juste aucun moyen de les interroger de manière transversale. »

« Attends — mais *pourquoi* ne peut-on pas simplement interroger la base de données ? » demanda Maya. « On a PostgreSQL. On a toutes ces données. »

« Parce que les données sont dans trois endroits », dit Leo. « Les événements de commande sont dans DynamoDB. Les horodatages de notification sont dans les journaux CloudWatch. Les dates d'intégration sont dans la base de données RDS PostgreSQL. Et une partie — les exports analytiques — est dans S3 sous forme de fichiers JSON que personne n'a jamais joints à quoi que ce soit. »

Tom regarda le tableau blanc. « On génère ces données depuis 18 mois », dit-il. « On vole à l'aveugle depuis 18 mois. »

« Pas à l'aveugle », dit Maya. « Juste myope. On pouvait voir ce qui était immédiatement devant nous. On ne pouvait pas voir les schémas. »

C'était le bon cadrage. Les points de données individuels étaient là. Le système pour les connecter ne l'était pas.

**Trois problèmes différents**

Le problème de données de Nimbus avait trois dimensions :

**Streaming en temps réel** : Des commandes sont passées en ce moment. Vous voulez voir un tableau de bord en direct de la vélocité des commandes — combien par minute, par région, par restaurant. Les données doivent être traitées à mesure qu'elles arrivent.

**Transformation de données** : Les données sont dans S3 depuis divers systèmes, dans différents formats (JSON, CSV, Parquet). Avant de pouvoir les analyser, vous devez les normaliser — même schéma, même format, nettoyé, joint avec des données de référence.

**Analyse ad hoc** : Une fois les données organisées, vous voulez exécuter des requêtes SQL dessus sans avoir à les charger d'abord dans une base de données. « Donnez-moi les 10 meilleurs restaurants par chiffre d'affaires au cours des 30 derniers jours. » Sans charger les données dans une base de données.

Chacun de ces problèmes est distinct. AWS a un service dédié pour chacun.

**Le flux en temps réel : un téléscripteur pour les données**

Imaginez une machine à téléscripteur — celles qui imprimaient les cours de bourse sur un rouleau de papier continu. Les prix s'imprimaient à mesure qu'ils changeaient. Tous ceux qui voulaient le prix actuel pouvaient lire le ruban. Personne n'avait à attendre quelqu'un d'autre ; le ruban continuait d'imprimer quel que soit le nombre de personnes qui lisaient.

C'est le modèle du streaming de données en temps réel. Les producteurs envoient des données à mesure qu'elles se produisent. Plusieurs consommateurs peuvent lire le flux simultanément, chacun à son propre rythme, chacun obtenant l'image complète.

**Amazon Kinesis Data Streams** est cette machine pour Nimbus. Quand une commande est passée, l'application publie un événement dans un flux Kinesis : `{ "orderId": "ORD-7741", "restaurantId": "47", "total": 3200, "timestamp": "...", "region": "us-west-2" }`.

Consommateurs de ce flux :

- Un tableau de bord en temps réel (lit les événements à mesure qu'ils arrivent, met à jour les métriques)
- Un Lambda de détection de fraude (cherche des schémas de commandes inhabituels)
- Un flux vers S3 pour le stockage permanent

**Concepts Kinesis Data Streams** :

- **Shard** : L'unité de base de capacité. Un shard gère 1 Mo/s en écriture, 2 Mo/s en lecture.
- **Période de rétention** : Les données restent dans le flux pendant 24 heures (par défaut), extensible à **365 jours** (1 an) avec Extended Data Retention.
- **Numéro de séquence** : Chaque enregistrement a un numéro de séquence. Les consommateurs suivent leur position dans le flux.

**Amazon Data Firehose** (anciennement **Kinesis Data Firehose**) : Le service de livraison géré entre les producteurs de streaming et les destinations telles que S3, Redshift et OpenSearch. Il met en tampon, compresse, transforme et livre les données automatiquement.

Pour Nimbus : Kinesis Data Streams → Amazon Data Firehose → S3 (format Parquet, compressé, partitionné par date).

« Je l'ai déjà déployé — oh. » Leo avait réglé le nombre de shards à un sans calculer d'abord le débit d'écriture. Au volume de commandes de Nimbus, un shard convenait. Il le confirma avant que quiconque ne remarque qu'il avait deviné.

**Le traducteur : donner du sens aux données brutes**

Les données dans S3 sont brutes. Avant de pouvoir les analyser efficacement, vous devez découvrir ce qui s'y trouve, les transformer dans un format cohérent, joindre différents jeux de données ensemble, et gérer les mauvais enregistrements et les valeurs manquantes.

C'est le travail d'une couche de traduction dédiée.

**AWS Glue** est un service ETL (Extract, Transform, Load) entièrement géré. Il a deux composants principaux :

**Glue Data Catalog** : Un magasin de métadonnées qui décrit vos données S3 — quelles tables existent, quelles colonnes elles ont, où se trouvent les fichiers de données. C'est comme un catalogue à fiches pour votre data lake.

**Glue Crawlers** : Des agents automatisés qui scannent S3, déduisent le schéma, et peuplent le Data Catalog. Exécutez un crawler sur votre bucket S3 et 10 minutes plus tard vous avez un catalogue de toutes vos tables.

**Glue Jobs** : Des travaux Spark/Python serverless qui effectuent la transformation réelle. Vous écrivez la logique de transformation (ou utilisez l'outil ETL visuel de Glue), et Glue l'exécute sur une infrastructure gérée.

Pour Nimbus :

1. Le Glue Crawler scanne les données de commandes dans S3 → crée une définition de table dans le Glue Data Catalog
2. Le Glue Job transforme les événements de commande JSON bruts en un format Parquet propre et partitionné
3. Les données transformées sont réécrites dans S3 dans une disposition optimisée pour les requêtes

**Quand l'ETL casse : le problème de l'évolution de schéma**

Le pipeline Glue a tourné proprement pendant les trois premières semaines. Puis le partenaire restaurant n°412 a ajouté un nouveau champ à son export de menu : `allergen_tags`. Le champ était un tableau de chaînes — `["gluten", "dairy", "nuts"]` — et il est apparu dans l'export de données nocturne du restaurant.

Le schéma du Glue job était strict. Il avait été écrit pour attendre des champs spécifiques dans le JSON de commande. Quand il a rencontré `allergen_tags` — un champ pas dans le schéma — le Glue job a échoué.

Six heures de données de commandes de 47 restaurants (tous utilisant le même format d'export de menu que le partenaire n°412) se sont accumulées dans S3 sans être traitées. L'exécution Glue nocturne qui était censée rendre les commandes de la nuit dernière interrogeables le matin s'était à la place arrêtée à 2 h 47 et avait écrit un enregistrement d'échec dans CloudWatch.

Tom le découvrit quand il essaya d'exécuter une requête Athena à 9 h et obtint `0 rows returned` pour les 12 heures précédentes.

« L'ETL a cassé parce que les données source ont changé ? » demanda Maya, quand Leo expliqua ce qui s'était passé.

« L'ETL a cassé parce que l'ETL ne savait pas comment gérer un changement de schéma », dit Leo. « On a écrit un travail strict qui attendait exactement ces champs. Quand un nouveau champ est apparu, il a paniqué. »

« Et si quelqu'un essaie de s'introduire par un changement de schéma ? » demanda Priya. « Un partenaire restaurant malveillant soumettant délibérément des champs inattendus pour faire planter le pipeline ? »

La question valait la peine d'être considérée. Un pipeline ETL qui plante sur une entrée inattendue est un vecteur de déni de service : soumettez un format de données inhabituel, faites planter le pipeline, et ce restaurant (et tous les autres partageant le format) cesse d'être traité.

La solution avait deux parties :

**Évolution de schéma Glue** : Le dynamic frame de Glue prend en charge l'évolution de schéma — les champs pas dans le schéma attendu sont transmis plutôt que de causer des échecs. Activez-la en utilisant des DynamicFrames au lieu de DataFrames dans le script du travail, avec `mergeSchema` défini dans les options additionnelles. Les nouveaux champs sont ajoutés au schéma automatiquement lors de la prochaine exécution du crawler.

```python
# Avant (strict, casse sur les nouveaux champs)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders"
)

# Après (évolution de schéma activée)
datasource = glueContext.create_dynamic_frame.from_catalog(
    database="nimbus_db",
    table_name="orders",
    additional_options={"mergeSchema": "true"}
)
```

**Alerte du Glue job** : L'échec du pipeline est resté silencieux pendant environ six heures avant que Tom ne le remarque. Une alarme CloudWatch sur l'état d'exécution du Glue job (`FAILED`) aurait alerté l'ingénieur d'astreinte en moins de 5 minutes. Coût de l'alarme : dix centimes par mois — effectivement gratuit (la métrique elle-même ne coûte rien, et les dix premières alarmes relèvent du niveau gratuit).

« Six heures de données sont restées non traitées dans S3 », dit Leo, après avoir relancé le Glue job manuellement pour rattraper. « Rien n'a été perdu — mais l'analytique avait ce retard. Si on avait eu l'alarme, le retard aurait été de 30 minutes. »

La leçon plus large : les pipelines ETL qui traitent des données externes doivent gérer les changements de schéma avec grâce. Les partenaires externes — restaurants, fournisseurs de paiement, services de livraison — changeront leurs formats de données. Le pipeline ne doit pas être fragile face à ces changements.

**La couche de requête : SQL directement sur S3**

Maintenant les données étaient dans S3, au format Parquet, partitionnées par date. La dernière pièce : un moyen de leur poser des questions sans les charger d'abord dans une base de données.

**Amazon Athena** est un service de requête interactif serverless qui exécute des requêtes SQL directement sur les données S3. Pas de base de données à provisionner, pas de données à charger. Vous définissez une table (ou utilisez le Glue Data Catalog), écrivez du SQL, et Athena exécute la requête contre les fichiers S3.

```sql
SELECT 
    restaurant_id,
    COUNT(*) as order_count,
    SUM(total) as revenue
FROM orders
WHERE year='2024' AND month='09'
GROUP BY restaurant_id
ORDER BY revenue DESC
LIMIT 10;
```

La tarification d'Athena est basée sur la quantité de données qu'une requête scanne. Dans us-east-1, us-west-2, et la plupart des régions majeures, les requêtes SQL standard coûtent 5 $ par téraoctet scanné. Utiliser le format Parquet (en colonnes) avec l'élagage de partitions (`WHERE year='2024' AND month='09'`) signifie qu'Athena ne scanne que les fichiers dont elle a besoin, ce qui réduit considérablement le coût.

« On peut exécuter cette requête pour 30 jours de données », dit Leo, « et cela peut coûter étonnamment peu si on les stocke bien. »

« Comment cela peut-il coûter si peu ? » demanda Maya. « Si ça scanne des téraoctets de données, comment est-ce que ce n'est pas cher ? »

Leo expliqua Parquet. Dans un format en lignes (JSON, CSV), une requête cherchant deux colonnes sur vingt doit lire les vingt. Dans un format en colonnes comme Parquet, elle ne lit que les deux dont elle a besoin. Pour un jeu de données de 50 To, une requête bien optimisée pourrait scanner 200 Go. À 5 $/To, c'est un dollar.

« Et si quelqu'un interroge toute la table par accident ? » insista Maya.

« C'est le vrai risque de coût », dit Leo.

Vous vous demandez peut-être : si Athena facture par téraoctet scanné, une requête mal écrite pourrait-elle générer une facture importante et inattendue ? Oui — et cela arrive dans de vrais environnements de production. Une requête contre une table non optimisée de 50 To peut coûter plus que toute votre facture S3 mensuelle. C'est pourquoi le format Parquet et le partitionnement ne sont pas des optimisations optionnelles — ce sont les contrôles de coût. Athena prend aussi en charge les limites de scan de requête de groupe de travail qui plafonnent la quantité de données qu'une seule requête est autorisée à scanner.

« Pour n'importe quelle question arbitraire qu'on peut imaginer ? » demanda Tom.

« Toute question qu'on peut exprimer en SQL, contre toute donnée qu'on a stockée dans S3. »

Tom s'assit devant l'ordinateur portable de Leo et écrivit la première requête :

```sql
SELECT
    r.restaurant_id,
    r.restaurant_name,
    AVG(EXTRACT(EPOCH FROM (o.confirmed_at - o.notification_sent_at)) / 60) 
        AS avg_confirmation_minutes,
    COUNT(DISTINCT c.customer_id) AS unique_customers,
    COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) 
        AS returning_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.order_count > 1 THEN c.customer_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT c.customer_id), 0),
        2
    ) AS reorder_rate_pct
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN (
    SELECT customer_id, restaurant_id, COUNT(*) AS order_count
    FROM orders
    WHERE year >= '2024'
    GROUP BY customer_id, restaurant_id
) c ON c.customer_id = o.customer_id AND c.restaurant_id = o.restaurant_id
WHERE o.year = '2024'
  AND o.status = 'delivered'
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY avg_confirmation_minutes ASC
LIMIT 20;
```

La requête s'exécuta pendant 11 secondes. Le résultat : 20 restaurants, triés par temps de confirmation moyen le plus rapide, avec leurs taux de recommande à côté.

Tom fixa la sortie.

Les restaurants confirmant le plus vite — ceux qui accusaient réception et confirmaient les commandes en moyenne en 3 à 4 minutes — avaient un taux de recommande moyen de 41 %. Les restaurants confirmant le plus lentement (temps de confirmation moyen de 18 à 22 minutes) avaient un taux de recommande de 13 %.

« Les restaurants qui confirment rapidement obtiennent trois fois plus de fidélité », dit Tom.

« C'est un écart énorme », dit Maya. « Pourquoi la vitesse de confirmation affecterait-elle autant le taux de recommande ? »

« Parce que le client a passé une commande puis est resté là à fixer son téléphone », dit Leo. « Si la confirmation arrive en 3 minutes, il se sent certain. Si elle arrive en 22 minutes — ou jamais — il se sent anxieux. L'anxiété est l'échec du produit, même si la nourriture arrive bien. »

« C'est une intuition produit », dit Maya. « Pas seulement une intuition analytique. On devrait montrer aux restaurants leur référence de temps de confirmation comparée à la moyenne de la catégorie. »

La requête Athena avait scanné 1,2 Go de données (deux mois de commandes au format Parquet, partitionnées par année et mois). Coût : 0,006 $.

Un demi-centime. Pour une intuition métier qui changea la façon dont Nimbus concevrait l'intégration des restaurants — quels restaurants prioriser pour le coaching de réussite, quels objectifs de temps de confirmation fixer dans le cadre des SLA des partenaires.

Tom avait l'air de quelqu'un recalculant la valeur de toutes les données qu'ils avaient jetées.

« Et si quelqu'un essaie de s'introduire par la couche de requête ? » demanda Priya. « Ou juste un analyste qui exporte accidentellement les adresses des clients depuis les données de commande brutes ? PII des clients, historiques de commandes, dossiers financiers — qui contrôle quelles tables sont même visibles ? »

Avant qu'elle ne finisse la question, Leo avait aussi réalisé le problème opérationnel : comment empêchez-vous une équipe d'exécuter un scan de table complet catastrophique qui génère une facture Athena de 500 $ en une seule requête ?

**Les groupes de travail Athena** résolvent les deux problèmes simultanément.

Un groupe de travail est une configuration nommée qui regroupe les utilisateurs Athena et applique des paramètres partagés : emplacement des résultats de requête, chiffrement, et — de manière critique — des limites de scan de données par requête.

```
Groupe de travail : analytics-team
  Limite de scan de requête : 10 Go par requête
  Action en cas de dépassement de limite : Annuler la requête

Groupe de travail : engineering-team
  Limite de scan de requête : 100 Go par requête
  Action en cas de dépassement de limite : Avertir seulement

Groupe de travail : finance-reports
  Limite de scan de requête : 1 Go par requête
  Action en cas de dépassement de limite : Annuler la requête
```

Un analyste du groupe de travail `analytics-team` ne peut pas accidentellement scanner 50 To de données et générer une facturation Athena de 250 $. La requête est annulée quand elle dépasserait 10 Go de données scannées. L'analyste voit un message d'erreur et sait qu'il doit ajouter un filtre de partition.

Les groupes de travail imposent aussi des emplacements de résultats séparés par équipe : les résultats de requête de l'équipe d'ingénierie vont vers `s3://nimbus-query-results/engineering/` ; les résultats de l'équipe finance vont vers `s3://nimbus-query-results/finance/`. Pas d'accès inter-équipe aux résultats de requête.

IAM contrôle quels utilisateurs peuvent utiliser quel groupe de travail. Une fonction Lambda exécutant des rapports automatisés utilise le groupe de travail `finance-reports` (étroitement plafonné). Un ingénieur déboguant un problème de production utilise le groupe de travail `engineering-team` (plafond plus large, avertir au lieu d'annuler). L'accès à la table d'événements brute (contenant des PII de clients) est restreint au groupe de travail `engineering-team` via une condition IAM sur la table du Glue Data Catalog.

« Ce n'est pas seulement du contrôle de coût », dit Priya. « C'est du contrôle d'accès. Les groupes de travail sont le point d'application. »

Cela répondait pleinement à sa question. Chaque discussion sur un pipeline de données qui saute le contrôle d'accès finit par devenir un incident de conformité — et ici, l'équipe d'analytique ne voyait que les tables de commandes agrégées, tandis que les événements bruts avec les PII des clients restaient derrière une autorisation IAM explicite. Le Glue Data Catalog n'était pas juste un répertoire de schémas. C'était une frontière de contrôle d'accès.

« Ce n'est pas du travail en plus », dit Priya. « C'est la conception. »

**L'architecture data lake**

Ces trois services se combinent en ce qu'on appelle une **architecture data lake** — un dépôt S3 centralisé pour toutes vos données, avec des outils pour les traiter et les interroger :

```
Applications (commandes, menus, événements)
    |
    | Événements en temps réel
    ↓
Kinesis Data Streams ──→ Amazon Data Firehose ──→ S3 (brut)
                                                   |
                                                   | Le Glue Crawler découvre le schéma
                                                   ↓
                                              Glue Data Catalog
                                                   |
                                                   | Les Glue Jobs transforment
                                                   ↓
                                              S3 (propre, Parquet, partitionné)
                                                   |
                                                   | Requêtes SQL
                                                   ↓
                                              Amazon Athena
                                                   |
                                                   ↓
                                          Outils de Business Intelligence
                                       (QuickSight, Tableau, etc.)
```

Les données brutes sont toujours préservées (dans le bucket S3 d'origine). Les données transformées sont interrogeables via Athena. De nouvelles questions peuvent toujours être répondues en exécutant de nouveaux Glue jobs sur les données brutes.

**Amazon Redshift : quand Athena ne suffit pas**

Pour certains cas d'usage, Athena est trop lent ou trop cher :

- Requêtes très complexes avec de nombreuses jointures
- Tableaux de bord qui exécutent la même requête des milliers de fois par jour
- Machine learning sur des données structurées
- Exigences de temps de réponse sous la seconde pour les outils de BI

**Amazon Redshift** est un entrepôt de données entièrement géré : une base de données analytique en colonnes conçue pour les grandes charges de travail analytiques répétées. Contrairement à Athena, qui interroge les données là où elles vivent dans S3, Redshift charge les données dans un stockage d'entrepôt optimisé et utilise l'optimisation des requêtes, des stratégies de tri, et des stratégies de distribution pour accélérer l'analytique complexe.

Si votre volume de données est petit et que vos requêtes s'exécutent peu fréquemment (hebdomadairement ou mensuellement), Athena avec des données S3 bien organisées suffit et est presque gratuit — mais si vous exécutez les mêmes tableaux de bord analytiques des centaines de fois par jour, le stockage en colonnes pré-optimisé de Redshift sera plus rapide et finalement plus rentable, malgré l'exigence de charger les données à l'avance.

Redshift est significativement plus rapide pour les requêtes analytiques complexes au détriment du coût (capacité provisionnée) et de l'exigence de charger les données avant d'interroger.

**Redshift Serverless** supprime le fardeau de la planification de capacité — vous interrogez, Redshift s'adapte. Le coût est basé sur la capacité de calcul réellement utilisée, mesurée en **RPU-heures** et facturée à la seconde (avec un minimum de 60 secondes par activation), plus le stockage géré par Go-mois — et rien pour le calcul pendant que l'entrepôt reste inactif. (Athena est celui facturé par requête : 5 $ par To scanné.)

Pour Nimbus à leur échelle actuelle : Athena suffit. À cinq fois le volume de données et avec des outils de BI interrogeant les mêmes tableaux de bord des centaines de fois par jour, Redshift deviendrait rentable.

**Quand Athena est le mauvais outil**

« Alors quel est le piège ? » demanda Maya. « Pourquoi n'utiliserions-nous pas Athena pour tout ? C'est serverless, paiement par requête, pas d'infrastructure — ça semble parfait. »

Les cas où Athena n'est pas la bonne réponse :

**Tableaux de bord à haute fréquence** : Un tableau de bord d'analytique destiné au client qui se rafraîchit toutes les 30 secondes et exécute 50 requêtes par minute n'est pas un bon cas d'usage Athena. À 5 $/To scanné, ces requêtes doivent être extrêmement bien optimisées pour être rentables à cette fréquence. Redshift ou une base de données pré-agrégée (même RDS) est plus approprié pour les tableaux de bord avec des exigences de temps de réponse sous la seconde.

**Requêtes opérationnelles avec exigences de faible latence** : Si un agent de service client doit rechercher une commande spécifique en moins de 500 ms, Athena n'est pas l'outil — une recherche DynamoDB ou une requête RDS l'est. Athena est optimisé pour le débit analytique, pas la latence opérationnelle. Même une requête Athena bien réglée sur un petit jeu de données a une surcharge de démarrage à froid de 1 à 3 secondes.

**Systèmes transactionnels** : Athena est en lecture seule. Vous ne pouvez pas INSERT, UPDATE, ou DELETE des enregistrements dans Athena (sauf via des intégrations spécifiques comme Lake Formation ou le format de table Iceberg, qui ont leur propre complexité). Pour les charges de travail d'écriture opérationnelles, utilisez une base de données transactionnelle.

**Jeux de données très petits et changeant fréquemment** : Si votre jeu de données change chaque minute et ne fait que 1 Go, le charger dans RDS ou DynamoDB et l'interroger là-bas est plus simple et plus rapide qu'exécuter des requêtes Athena contre des fichiers S3 qui pourraient être périmés. Athena interroge les fichiers S3 tels qu'ils sont au moment de la requête — si les fichiers ont été écrits il y a 2 minutes, c'est la fraîcheur que vous obtenez.

Le schéma qui émerge : Athena est excellent pour les requêtes analytiques ad hoc à grande échelle et peu fréquentes contre des données S3. Pour tout ce qui est opérationnel, transactionnel, ou nécessitant une latence sous la seconde, utilisez la base de données opérationnelle appropriée.

**Kinesis vs SQS : clarifier la confusion**

C'est la question qui revient dans chaque discussion d'architecture de données. Kinesis et SQS traitent tous deux des messages. Quand utilisez-vous chacun ?

La confusion vient de la similarité de surface : tous deux acceptent des messages de producteurs. Tous deux livrent ces messages à des consommateurs. Tous deux sont des services AWS gérés. Mais leurs modèles de données sont fondamentalement différents.

**SQS (Simple Queue Service)** est une file de tâches. Vous mettez un message. Un consommateur le récupère et le traite. Quand le traitement est terminé, le message est supprimé. Si vous avez dix consommateurs, chaque message va exactement à l'un d'eux. Le message disparaît après consommation.

**Kinesis Data Streams** est un journal. Vous mettez un enregistrement. Chaque consommateur lit chaque enregistrement. Le consommateur A les lit tous. Le consommateur B les lit aussi tous, à son propre rythme. Aucun consommateur ne supprime l'enregistrement — il reste dans le flux jusqu'à l'expiration de la période de rétention. Vous pouvez ajouter un troisième consommateur à tout moment, et il peut lire depuis le début du flux (dans la fenêtre de rétention).

« Quand voudriez-vous réellement que chaque consommateur voie chaque message ? » demanda Maya.

La réponse est les cas d'usage où Kinesis brille :

**Tableau de bord en temps réel + détection de fraude + archive S3** : Les trois consomment le même flux d'événements de commande simultanément. Si vous utilisiez SQS, vous devriez publier dans trois files séparées — et celui qui publie doit connaître les trois consommateurs. Avec Kinesis, le producteur publie une fois ; n'importe quel nombre de consommateurs peut lire indépendamment.

**Rejeu** : Un consommateur échoue pendant 2 heures (limite de concurrence Lambda atteinte, service en aval en panne). Avec SQS, ces messages étaient déjà supprimés (ou ont un délai de visibilité défini). Avec Kinesis, le consommateur reprend depuis son dernier point de contrôle et traite les 2 heures d'enregistrements manqués. Les données ont été conservées dans le flux (jusqu'à 365 jours avec Extended Data Retention).

**Ordre au sein d'un shard** : Les enregistrements avec la même clé de partition vont toujours au même shard, préservant l'ordre. Pour un système de trading boursier où vous avez besoin que toutes les transactions du symbole `AMZN` soient traitées en séquence, Kinesis le garantit. SQS FIFO fournit un ordre par groupe mais à un débit plus faible (jusqu'à 3 000 messages/seconde par file avec le traitement par lots en mode standard — le mode haut débit porte cela à des dizaines de milliers — contre les 1 Mo/s ou 1 000 enregistrements/s par shard de Kinesis, multipliés par autant de shards que vous avez besoin).

La question décisive : **Chaque message doit-il être consommé par exactement un consommateur puis jeté ?** → SQS. **Chaque message doit-il être vu par plusieurs consommateurs indépendamment, ou avez-vous besoin de capacité de rejeu ?** → Kinesis.

Pour le tableau de bord en temps réel de Nimbus : Kinesis. Plusieurs consommateurs (tableau de bord, détection de fraude, archive S3) lisant tous le même flux.

Pour la file de traitement des commandes de Nimbus (une commande passée → une tâche ECS la traite) : SQS. Un consommateur, pas de rejeu nécessaire, pas de diffusion en éventail requise.

## Visualiser les données : Amazon QuickSight

Athena interroge les données. Glue les prépare. Mais à un moment donné, quelqu'un doit voir un graphique — et pas en exécutant des requêtes SQL dans la console.

« Avons-nous vraiment besoin d'un autre service pour cela ? » demanda Maya. « Ne puis-je pas juste exporter les résultats Athena vers un tableur ? »

« Pour une requête, oui », dit Tom. Il avait l'air de quelqu'un qui avait déjà essayé cela. « Pour un tableau de bord que vous voulez partager avec toute l'équipe, c'est un nouveau tableur chaque matin. »

**Amazon QuickSight** est le service de business intelligence (BI) géré d'AWS. Il se connecte directement à Athena, S3, RDS, Redshift, et d'autres sources, et vous permet de construire des tableaux de bord et des visualisations sans serveur de BI séparé.

Fonctionnalités clés :

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine) : QuickSight peut importer des jeux de données dans son moteur en mémoire pour des performances de requête sous la seconde à grande échelle, sans réinterroger Athena à chaque chargement du tableau de bord
- **ML Insights :** détection d'anomalies et prévision intégrées — pas de science des données requise
- **Tableaux de bord intégrés :** vous pouvez intégrer les tableaux de bord QuickSight dans votre propre application web via une URL

Tom connecta QuickSight à la source de données Athena et eut un tableau de bord fonctionnel montrant les commandes quotidiennes, le chiffre d'affaires par restaurant, et l'entonnoir de conversion en un après-midi.

« Combien cela coûte-t-il par mois ? » demanda-t-il — puis répondit à sa propre question avant que quiconque d'autre ne puisse. « QuickSight tourne à environ 24 $/mois par auteur — les gens qui construisent les tableaux de bord — et 3 $/mois par lecteur. On a quatre personnes qui l'utiliseraient. »

« Donc environ cent dollars par mois », dit Maya.

« Pour un service de BI qui nécessiterait autrement de faire tourner un serveur d'analytique séparé », dit Priya. « Oui. »

Tom publia le tableau de bord. Le lendemain matin, au lieu d'exécuter des requêtes Athena, toute l'équipe ouvrit une URL.

> **Conseil d'examen — QuickSight**
>
> QuickSight est le service de BI et de visualisation géré d'AWS. Se connecte à Athena, S3, Redshift, RDS. SPICE est le moteur de requête en mémoire qui accélère les requêtes de tableau de bord répétées. Déclencheur d'examen : « tableau de bord de business intelligence sur AWS » ou « visualiser des données depuis Athena/Redshift » → QuickSight.

## Gouverner le lac : AWS Lake Formation

À mesure que le data lake de Nimbus grandissait, l'accès aux données devint un problème de gouvernance.

« Qui peut interroger les journaux de transactions bruts ? » demanda Priya, lors de la revue d'architecture suivante. « Qui peut voir les PII des clients ? Qui peut accéder aux tables de résumé financier ? »

« L'ingénierie a un accès complet », dit Leo. « L'équipe d'analytique a accès aux tables agrégées. La finance a accès aux tables de chiffre d'affaires. »

« Configuré où ? »

Leo s'arrêta. « Dans... quelques endroits différents. Les politiques de bucket S3, les politiques IAM, les permissions du catalogue Glue. »

« Trois systèmes séparés, qui doivent tous être cohérents », dit Priya. « Que se passe-t-il quand on ajoute un nouvel analyste ? Ou quand on décide de restreindre l'accès à une colonne spécifique — disons, les numéros de téléphone des clients — à l'équipe d'analytique ? »

Cette question exposa la lacune. Gérer l'accès fin aux données à travers les politiques de bucket S3, IAM, et le Glue Data Catalog simultanément était fragile.

**AWS Lake Formation** est un service géré qui centralise le contrôle d'accès pour votre data lake. Au lieu de gérer les politiques de bucket, les politiques IAM, et les permissions du catalogue Glue séparément, Lake Formation fournit un seul endroit pour accorder des permissions au niveau de la colonne, de la ligne, et de la table sur vos données.

Fonctionnalités clés :

- Se place au-dessus de S3 et du Glue Data Catalog — pas de migration de données requise
- **Contrôle d'accès fin :** accordez à des utilisateurs ou rôles spécifiques l'accès à des tables, colonnes, ou même des lignes filtrées spécifiques — l'équivalent des permissions au niveau base de données sur des données S3
- **Filtrage de données :** quand un utilisateur interroge une table gouvernée par Lake Formation via Athena, Lake Formation filtre automatiquement les colonnes ou lignes qu'il n'est pas autorisé à voir

Priya configura Lake Formation avec trois niveaux de permission, avec Rafael rédigeant les règles au niveau colonne : le rôle d'ingénierie voyait toutes les tables et toutes les colonnes. Le rôle d'analytique voyait les tables de commandes agrégées mais pas les colonnes de PII des clients. Le rôle de finance voyait les tables de chiffre d'affaires avec les identifiants des clients masqués.

« Donc l'analyste exécute la même requête Athena », confirma Leo. « Mais Lake Formation l'intercepte et retire les colonnes qu'il n'est pas autorisé à voir ? »

« Correct. Le filtrage est automatique. L'analyste n'a pas besoin de savoir que ça se passe — et il ne peut pas le contourner en interrogeant les fichiers S3 bruts directement, parce que Lake Formation contrôle l'accès au niveau du catalogue. »

« Ce n'est pas du travail en plus », dit Priya. « C'est la conception. »

> **Conseil d'examen — Lake Formation**
>
> Lake Formation centralise le contrôle d'accès pour un data lake construit sur S3 et le Glue Data Catalog. Prend en charge les permissions fines au niveau de la table, de la colonne, et de la ligne. Déclencheur d'examen : « restreindre l'accès à des colonnes spécifiques dans un data lake S3 » ou « centraliser la gouvernance du data lake » → Lake Formation. La distinction clé avec IAM brut : Lake Formation impose un filtrage au niveau de la colonne et de la ligne que les politiques IAM seules ne peuvent pas exprimer.

## Points forts et limites

**Kinesis Data Streams** : Utilisez Kinesis quand vos données arrivent en continu et que l'ordre compte — flux de clics, transactions financières, télémétrie IoT. Kinesis préserve l'ordre des enregistrements au sein d'un shard et permet le rejeu pendant la fenêtre de rétention configurée (24 heures par défaut, jusqu'à 365 jours avec Extended Data Retention), ce qui le rend fondamentalement différent de SQS. Le compromis est la complexité opérationnelle : en mode provisionné, vous gérez la capacité des shards et le comportement des consommateurs. Pour les simples files de tâches où l'ordre n'a pas d'importance et où le rejeu n'est pas nécessaire, SQS est le choix plus simple.

**AWS Glue** : Glue élimine l'infrastructure d'un cluster ETL traditionnel. Vous écrivez la logique de transformation ; AWS gère l'environnement Spark. C'est précieux quand les transformations sont complexes ou les volumes de données importants. La limitation est le coût et le démarrage à froid — les Glue jobs ont un délai de démarrage de plusieurs minutes, les rendant inadaptés aux transformations en quasi-temps réel. Pour les simples conversions de format de fichier (CSV vers Parquet), la surcharge de Glue peut ne pas valoir le coup comparée à une fonction Lambda ou un script léger.

**Amazon Athena** : Athena vous permet d'interroger des données S3 avec du SQL standard et aucune infrastructure à gérer. La contrainte critique est le coût : Athena facture par téraoctet de données scanné. Une requête contre une table de 10 To qui scanne le tout coûte significativement plus que la même requête contre une table au format Parquet et partitionnée qui scanne 200 Go. Utilisez toujours des formats en colonnes (Parquet ou ORC) et partitionnez vos données avant d'exécuter Athena en production. Sans ces optimisations, les factures Athena peuvent vous surprendre.

## Résumé

Le travail réseau du chapitre 25 a rendu le pipeline de données de Nimbus possible. Ce chapitre est ce à quoi sert ce pipeline : rendre toutes les données que Nimbus génère réellement visibles et exploitables.

- **Amazon Kinesis** : Streaming de données en temps réel. Les producteurs écrivent des enregistrements ; les consommateurs lisent à leur propre rythme. Amazon Data Firehose peut ensuite livrer les données de streaming vers S3, Redshift, et d'autres destinations avec moins de travail opérationnel.
- **AWS Glue** : ETL et catalogage de données. Les Crawlers découvrent les schémas ; les Jobs transforment les données ; le Data Catalog rend les données découvrables par Athena et d'autres outils.
- **Amazon Athena** : SQL serverless sur S3. Interrogez n'importe quelles données dans S3 avec du SQL standard. Facturé par To scanné — utilisez Parquet et le partitionnement pour minimiser le coût.
- **Amazon Redshift** : Entrepôt de données géré pour l'analytique haute performance. Chargez les données, optimisez pour les requêtes analytiques répétées, et interrogez rapidement à l'échelle de l'entrepôt.
- Le **modèle data lake** : données brutes vers S3 → Glue les transforme → Athena les interroge → les outils de BI les visualisent.
- **Évolution de schéma Glue** : les pipelines ETL qui traitent des données externes doivent gérer les changements de schéma avec grâce. Utilisez des DynamicFrames avec `mergeSchema: true` pour éviter les échecs de pipeline quand les données en amont ajoutent de nouveaux champs.
- **Groupes de travail Athena** : limites de scan de données et emplacements de résultats par équipe. Contrôle de coût et contrôle d'accès dans une seule configuration. Requis pour tout déploiement Athena multi-équipe.
- **Kinesis vs SQS** : Kinesis pour la diffusion en éventail vers plusieurs consommateurs et la capacité de rejeu. SQS Standard pour les simples files de tâches ; SQS FIFO pour le traitement de tâches ordonné et dédupliqué. La question décisive : chaque consommateur doit-il voir chaque message, ou chaque message va-t-il à un seul consommateur ?
- **Quand Athena est le mauvais choix** : tableaux de bord à haute fréquence (utilisez Redshift), requêtes opérationnelles (utilisez RDS ou DynamoDB), très petits jeux de données changeant fréquemment (utilisez juste une base de données).
- **Amazon QuickSight** : Le service de BI géré d'AWS. Se connecte à Athena, S3, Redshift, et RDS pour construire des tableaux de bord sans faire tourner un serveur de BI séparé. SPICE est le moteur en mémoire qui accélère les requêtes de tableau de bord répétées.
- **AWS Lake Formation** : Contrôle d'accès centralisé pour les data lakes sur S3 + Glue Data Catalog. Permet des permissions au niveau de la colonne, de la ligne, et de la table — une gouvernance de données fine que IAM seul ne peut pas exprimer.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.5)*

- **Kinesis vs SQS** : Kinesis = ordonné, streaming en temps réel, plusieurs consommateurs, rejeu dans la fenêtre de rétention (24 heures par défaut, jusqu'à 365 jours). SQS = file de tâches, chaque message traité une fois. « Plusieurs consommateurs lisant le même flux simultanément » → Kinesis. « Un travailleur par message » → SQS.
- **Signaux d'examen Athena** : « SQL serverless sur S3 », « analyser des données S3 sans les charger dans une base de données », « paiement par requête » → Athena.
- **Optimisation des coûts Athena** : Format en colonnes (Parquet ou ORC) + partitionnement réduit considérablement les données scannées et le coût. L'examen peut demander comment réduire les coûts Athena.
- **Tarification Athena** : 5 $ par To scanné (us-east-1, us-west-2, et la plupart des régions majeures). Le coût est calculé sur les données scannées, pas les données retournées — optimisez toujours le format de stockage avant d'exécuter des requêtes de production.
- **Glue Crawler** : « Découvrir le schéma des données S3 automatiquement » → Glue Crawler.
- **Amazon Data Firehose** : « Charger automatiquement des données de streaming vers S3/Redshift/OpenSearch sans gérer de consommateurs » → Amazon Data Firehose. Les documents plus anciens peuvent encore l'appeler Kinesis Data Firehose.
- **Redshift vs Athena** : Redshift pour les requêtes complexes à haute fréquence sur un jeu de données fixe (tableaux de bord de BI). Athena pour les requêtes ad hoc sur des données S3 qui changent fréquemment.
- **EMR (Elastic MapReduce)** : Clusters Hadoop/Spark gérés par AWS. L'examen l'utilise quand « charges de travail Hadoop/Spark existantes » ou « frameworks de traitement de données personnalisés » sont mentionnés. Glue est l'alternative gérée pour la plupart des cas d'usage.
- **QuickSight :** BI et visualisation gérées par AWS. Se connecte à Athena, S3, Redshift, RDS. SPICE = moteur en mémoire pour des requêtes répétées rapides. Déclencheur d'examen : « tableau de bord de business intelligence sur AWS » → QuickSight.
- **Lake Formation :** Contrôle d'accès centralisé pour un data lake (S3 + Glue Data Catalog). Permissions fines : niveau table, colonne, et ligne. Déclencheur d'examen : « restreindre l'accès à des colonnes spécifiques dans un data lake S3 » ou « centraliser la gouvernance du data lake » → Lake Formation.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre Amazon Kinesis et Amazon SQS. Quand utiliseriez-vous chacun ?

*(Indice : Réfléchissez au nombre de consommateurs qui peuvent lire les mêmes données, si les messages sont supprimés après lecture, et si l'ordre compte.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise de covoiturage veut analyser les données de trajets. 1 million de trajets sont complétés quotidiennement. Les enregistrements de trajets sont stockés dans S3 sous forme de fichiers JSON (environ 2 Ko chacun). L'équipe d'analytique veut exécuter des requêtes SQL ad hoc comme « durée moyenne de trajet par ville la semaine dernière ». Les requêtes devraient se compléter en moins de 2 minutes. Les coûts de stockage devraient être minimisés. L'équipe exécutera 20 à 30 requêtes par semaine.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Utiliser AWS Glue pour convertir le JSON au format Parquet partitionné par date et ville ; interroger avec Amazon Athena  
B) Charger les données de trajets dans RDS PostgreSQL quotidiennement ; interroger avec du SQL standard  
C) Utiliser Amazon Data Firehose pour livrer les données de trajets vers Amazon Redshift ; interroger avec Redshift  
D) Charger les données de trajets dans DynamoDB et utiliser PartiQL pour les requêtes SQL

**Indice 1** : 20 à 30 requêtes par semaine est une faible fréquence. Quel service est le plus rentable pour les requêtes occasionnelles ?

**Indice 2** : Le format Parquet + le partitionnement réduit considérablement les données scannées par Athena — et donc le coût.

**Indice 3** : 1 million de trajets × 2 Ko = ~2 Go par jour. Sur une semaine, ~14 Go. À 5 $/To pour Athena, même sans optimisation, c'est abordable.

**Réponse** : A

**Explication** : Glue convertit le JSON en Parquet (le format en colonnes réduit considérablement les données scannées) partitionné par date et ville (l'élagage de partitions signifie que les requêtes « la semaine dernière » ne scannent que 7 jours de partitions). Athena interroge S3 directement avec du SQL standard. Pour 20 à 30 requêtes par semaine, Athena en paiement par requête est extrêmement rentable vs un Redshift toujours en marche.

**Pourquoi pas B ?** Charger 2 Go de données quotidiennement dans RDS, puis interroger, nécessite une instance de base de données tournant 24h/24 et 7j/7. Pour 20 à 30 requêtes par semaine, c'est largement surdimensionné et coûteux.

**Pourquoi pas C ?** Redshift est rentable pour les requêtes à haute fréquence (des centaines par jour sur le même jeu de données). Pour 20 à 30 requêtes par semaine, le cluster Redshift toujours allumé coûte bien plus que la tarification par requête d'Athena.

**Pourquoi pas D ?** DynamoDB est un magasin clé-valeur/document optimisé pour l'accès par clé, pas pour les requêtes analytiques ad hoc. PartiQL sur DynamoDB ne prend pas en charge le type d'agrégations GROUP BY décrites.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.5*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus veut construire un système de détection de fraude en temps réel pour les commandes. Le système devrait :

- Détecter les commandes passées par le même compte plus de 5 fois en 60 secondes
- Signaler les commandes de plus de 500 $ provenant de nouveaux comptes (< 30 jours)
- Envoyer les commandes signalées à une file de revue humaine

Concevez l'architecture. Que fournit Kinesis ? Où s'exécute la logique de fraude ? Comment corrélez-vous « même compte, fenêtre de 60 secondes » ? Quel service reçoit les commandes signalées ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception d'architecture de streaming en temps réel.)*

## Scène post-générique

Tom exécuta la première requête Athena.

« Top 10 des restaurants par chiffre d'affaires le trimestre dernier », dit-il.

12 secondes plus tard, les résultats apparurent.

Il les fixa.

« Le restaurant 47 était premier », dit-il. C'était le restaurant familial de Maya — celui où Nimbus a commencé.

« Bien sûr que oui », dit Maya. « L'arepa est si bonne. »

Tom exécuta une autre requête. Et une autre. « Combien cela coûte-t-il par mois ? » demanda Tom avant que Leo ne puisse dire quoi que ce soit. Leo vérifia l'historique de scan des requêtes. Trois requêtes, total de données scannées : 1,2 Go. Coût : moins d'un centime.

Après une heure, Tom avait une image complète de l'activité de Nimbus d'une manière qu'il n'avait jamais eue auparavant. Quelles catégories de restaurants croissaient le plus vite. Quelles cohortes de clients étaient retenues le plus longtemps. Quels articles de menu généraient le plus de commandes répétées.

« Pourquoi n'avons-nous pas construit ceci plus tôt ? » demanda-t-il.

« On avait les données », dit Leo. « On n'avait juste pas le pipeline pour les utiliser. »

« Les données ont toujours été là », dit Maya doucement. « On ne pouvait juste pas les voir. »

Dans le prochain chapitre : maintenant qu'on peut voir l'activité clairement, parlons de la façon de payer pour l'infrastructure qui la fait tourner — plus efficacement.
