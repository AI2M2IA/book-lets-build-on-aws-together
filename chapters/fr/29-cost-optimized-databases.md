# Chapitre 29 : La Facture de Base de Données

L'audit de stockage de Tom avait identifié 8 800 $ de gaspillage. Il se tourna vers les postes de base de données.

RDS Aurora : 647 $/mois.
RDS PostgreSQL (réplicas de lecture) : 340 $/mois.
ElastiCache : 183 $/mois.

Total du niveau base de données : 1 170 $/mois.

« Laissez-moi comprendre chacun avant de décider quoi que ce soit, » dit-il. « Parce que la base de données n'est pas l'endroit pour économiser de l'argent en prenant des raccourcis. »

C'était sage. Une mauvaise configuration de la base de données entraînant une perte de données ou une dégradation des performances coûte bien plus que les économies réalisées.

Pensez à une base de données comme au moteur d'une voiture. Vous pouvez économiser de l'argent sur une voiture en passant à un carburant moins cher, en ajustant la pression des pneus et en retirant du poids inutile du coffre. Mais si vous essayez d'économiser de l'argent en sautant une vidange d'huile, vous risquez de bloquer le moteur — et un moteur bloqué coûte bien plus que n'importe quelle économie de carburant. L'audit que Tom est sur le point de faire suit la même logique : trouver les gaspillages dans le coffre et le réservoir de carburant, et laisser le moteur tranquille jusqu'à ce que vous sachiez exactement ce que vous faites.

**Comprendre Votre Charge de Travail de Base de Données en Premier**

L'optimisation des coûts dans les bases de données nécessite de comprendre la charge de travail avant de toucher quoi que ce soit.

Questions clés :

- Quelle est l'utilisation moyenne et maximale du CPU ?
- Quel est le ratio lecture/écriture ?
- Le stockage croît-il, est-il stable ou diminue-t-il ?
- Les réplicas de lecture sont-ils utilisés ?
- L'instance est-elle sous-provisionnée (causant des ralentissements) ou sur-provisionnée (payant pour de la capacité inactive) ?

Tom a extrait les métriques CloudWatch pour les trois services de base de données au cours des 30 derniers jours :

**Cluster Aurora** :

- CPU moyen : 18% (pic : 67% les vendredis soirs)
- Ratio lecture/écriture : 14:1 (fortement en lecture)
- Stockage : 180 Go (en croissance de ~5 Go/mois)

**Réplicas de lecture (RDS PostgreSQL, séparés d'Aurora)** :

- Ce sont deux réplicas de lecture RDS hérités créés avant la migration Aurora, toujours en marche.
- Connexions moyennes à chacun : 2 par jour. CPU moyen : 3%.

« Pourquoi ces réplicas tournent-ils encore ? » demanda Tom.

Leo regarda les dates de création des instances. « Ils ont été créés pendant la migration Aurora pour le repli. On a oublié de les supprimer. »

Ce moment — quand une chose coûteuse tourne depuis des mois sans être utilisée — est familier dans les environnements cloud.

Les réplicas ont été résiliés. Économie mensuelle : 340 $.

**RDS Reserved Instances : La Version Base de Données**

Comme EC2, RDS offre des Instances Réservées pour l'utilisation engagée.

Pour Aurora avec Serverless v2, les Instances Réservées ne s'appliquent pas directement — Serverless v2 évolue dynamiquement et vous payez par ACU-heure. Cependant, si vous utilisez une configuration d'instance Aurora fixe (pas Serverless), les Instances Réservées peuvent économiser 30 à 60%.

Tom a examiné les instances Aurora provisionnées (le writer et un reader) :

- Instance writer : db.r6g.large, À la demande = 0,26 $/heure = 190 $/mois
- Instance reader : db.r6g.large, À la demande = 0,26 $/heure = 190 $/mois

Instances Réservées 1 an pour les deux : ~108 $/mois chacune. Économie annuelle : 984 $.

« Attendez, » dit Leo. « On a migré vers Aurora Serverless v2 au chapitre 24. Pourquoi Tom regarde-t-il À la demande pour les instances provisionnées ? »

Bonne remarque. Soyons précis : le writer Aurora principal de Nimbus utilise Serverless v2. Le reader (pour les réplicas de lecture) utilise aussi Serverless v2. Serverless v2 n'a pas d'Instances Réservées traditionnelles — vous payez par ACU-heure.

Pour les équipes exécutant des instances Aurora fixes (pas Serverless), les Instances Réservées représentent des économies significatives. Pour les charges de travail Serverless v2, les économies viennent de la nature auto-scaling du service lui-même — vous ne payez pas pour de la capacité inutilisée.

**DynamoDB : À la Demande vs Provisionné**

Dans le chapitre 9, nous avons présenté les deux modes de capacité de DynamoDB : à la demande et provisionné.

Nimbus avait utilisé DynamoDB en mode à la demande depuis le début. À faible trafic, c'était correct — à la demande est plus cher par requête mais n'a pas de frais minimum.

Maintenant, avec 18 mois de données de trafic dans CloudWatch, Tom pouvait voir des modèles.

Unités de capacité de lecture moyennes par jour : 45 000
Unités de capacité d'écriture moyennes par jour : 12 000
Jour de pic (vendredi) : 180% des requêtes DynamoDB moyennes (ElastiCache absorbe ~95% des lectures, donc DynamoDB ne voit qu'une fraction du pic de volume global de commandes de 25x)

**Tarification à la demande** : 1,25 $ par million de requêtes d'écriture, 0,25 $ par million de requêtes de lecture.
**Tarification provisionnée** : 0,00065 $ par unité de capacité d'écriture par heure, 0,00013 $ par unité de capacité de lecture par heure.

Tom a calculé le point d'équilibre : la capacité provisionnée devient moins chère quand vous l'utilisez suffisamment régulièrement pour ne pas payer la prime à la demande pendant les périodes inactives.

Avec 18 mois de données montrant des modèles quotidiens cohérents, la capacité provisionnée avec **DynamoDB Auto Scaling** était le bon choix :

- Définir la capacité minimale à 60% de la charge moyenne
- Définir le maximum à 250% de la moyenne (gère les pics du vendredi)
- Auto Scaling ajuste la capacité provisionnée entre ces limites

Coût DynamoDB mensuel : passé de 340 $ (à la demande) à 230 $ (provisionné avec auto scaling). Réduction de 32%.

« Mais si on sur-provisionne, » demanda Leo, « on paie pour de la capacité inutilisée. »

« C'est le risque, » dit Tom. « Avec Auto Scaling, on définit le minimum assez haut pour éviter le throttling, et on laisse AWS gérer dans notre plage. »

« Et si notre modèle de trafic change significativement ? »

« Alors on ajuste les limites. On revoit ça trimestriellement. »

**ElastiCache : Dimensionnement Correct et Nœuds Réservés**

La facture ElastiCache : 183 $/mois. Une instance Redis cache.r6g.large dans chaque AZ (deux nœuds, primaire + réplica).

Les métriques CloudWatch montraient :

- Utilisation moyenne de la mémoire : 34%
- Pic : 58%

L'instance était sur-provisionnée. Un cache.r6g.medium gérerait probablement la charge avec de la marge.

Passer de r6g.large (2 nœuds × 0,127 $/heure) à r6g.medium (2 nœuds × 0,065 $/heure) :

- Économie mensuelle : 113 $ → attendez.

En fait le calcul : large = 2 × 0,127 $ × 730 heures = 185 $/mois. Medium = 2 × 0,065 $ × 730 = 95 $/mois. Économie : 90 $/mois.

Tom a testé l'instance medium en staging pendant deux semaines sous charge. La mémoire a atteint un pic à 71%. Suffisamment proche de la limite pour qu'il soit mal à l'aise.

Il a essayé cache.r6g.large mais avec des Nœuds Réservés (engagement d'1 an) : de À la demande 185 $ à Réservé 120 $/mois. Économie : 65 $/mois sans changer le type d'instance.

« Parfois le dimensionnement correct vers une instance plus petite risque un incident de performance, » dit-il. « Les Nœuds Réservés nous donnent les mêmes économies avec moins de risque. »

**Rétention des Sauvegardes RDS : Le Compromis de Stockage**

Les sauvegardes automatisées RDS sont stockées dans S3 (sans frais supplémentaires pour le stockage jusqu'à 100% de la taille de votre base de données). La rétention par défaut est de 7 jours.

Pour la base de données Aurora de 180 Go de Nimbus, 7 jours de sauvegardes était approprié — ils avaient pu restaurer depuis une sauvegarde dans cette fenêtre en test.

Mais Tom a remarqué : ils avaient aussi des instantanés manuels de chaque déploiement significatif, conservés indéfiniment.

23 instantanés manuels, total de 4,1 To de stockage d'instantanés.
Coût : 0,095 $/Go/mois pour les sauvegardes Aurora = 389 $/mois en stockage d'instantanés manuels.

Ils ont conservé les 3 derniers instantanés manuels par environnement (production, staging). Supprimé le reste.
Économie : 350 $/mois.

« On payait 350 $ par mois pour une assurance qu'on n'a jamais utilisée, » dit Leo.

« On payait pour la tranquillité d'esprit, » corrigea Tom. « La question est : combien vaut la tranquillité d'esprit à 350 $ par mois ? »

« Avec un plan de reprise après sinistre approprié, » dit Priya, « vous pouvez obtenir la même tranquillité d'esprit avec 7 jours de sauvegardes automatisées et 3 instantanés manuels. »

« D'accord. Maintenant. »

**Le Résumé d'Optimisation de la Base de Données**

| Service                                              | Avant      | Après    | Économie Mensuelle |
|------------------------------------------------------|------------|----------|--------------------|
| Réplicas de Lecture RDS (inutilisés)                 | 340 $      | 0 $      | 340 $              |
| Aurora (Instances Réservées)                         | 190 $      | 120 $    | 70 $               |
| DynamoDB (À la Demande → Provisionné + Auto Scaling) | 340 $      | 230 $    | 110 $              |
| ElastiCache (Nœuds Réservés)                         | 185 $      | 120 $    | 65 $               |
| Instantanés manuels Aurora                           | 389 $      | 39 $     | 350 $              |
| **Total**                                            | **1 444 $** | **509 $** | **935 $/mois**   |

935 $ par mois d'économies sur la base de données. 11 220 $ par an.

Tom posa ce chiffre à côté des économies de stockage (6 200 $/an) et des économies des Savings Plans (14 200 $/an).

Impact total d'optimisation : 31 620 $/an.

« C'est trois ingénieurs juniors, » dit Maya.

« Ou un senior, » dit Priya.

« Ou douze mois d'expériences, » dit Leo.

Les trois avaient raison.

## Points Forts et Limites

**DynamoDB Provisionné avec Auto Scaling** :

- Moins cher que à la demande pour les charges de travail prévisibles et cohérentes
- Auto Scaling gère la variabilité sans sur-provisionner en permanence
- Nécessite une surveillance pour s'assurer que les limites de capacité restent appropriées

**RDS Reserved Instances / ElastiCache Reserved Nodes** :

- Économies significatives pour les charges de travail stables et de longue durée
- Engagement verrouillé — si vos besoins changent, vous avez payé pour de la capacité inutilisée
- Le Marché RI permet de vendre des RIs RDS inutilisés (contrairement aux Convertibles, qui ne peuvent pas être vendus)

**Le principe général** :

- Toujours comprendre l'utilisation avant d'optimiser
- Les ressources inutilisées (comme les réplicas de lecture hérités) sont l'optimisation au rendement le plus élevé
- Le dimensionnement correct nécessite une validation en staging avant application en production
- La tarification réservée nécessite une confiance dans la stabilité de la charge de travail

## Résumé

- **Auditer d'abord** : Extrayez les métriques CloudWatch avant d'effectuer tout changement de base de données.
- **Supprimer les ressources inutilisées** : Les réplicas de lecture, les bases de données inactives et les instances de test qui ne sont plus nécessaires.
- **DynamoDB À la Demande vs Provisionné** : À la Demande pour le trafic imprévisible ; Provisionné + Auto Scaling pour les modèles cohérents.
- **ElastiCache Reserved Nodes** : Comme les Instances Réservées EC2 pour Redis/Memcached. Économies de 30 à 50% pour les charges de travail stables.
- **Gestion des instantanés RDS** : Conservez uniquement les instantanés dont vous avez besoin. Les instantanés manuels sont conservés indéfiniment à moins d'être supprimés.
- **Dimensionner correctement avec prudence** : Le dimensionnement correct des bases de données risque des incidents de performance. Testez en staging, validez sous charge.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.3)*

- **Modes de tarification DynamoDB** : À la Demande = payer par requête (coût unitaire plus élevé, pas de minimum). Provisionné = payer par unité de capacité par heure (coût unitaire plus faible, doit allouer la capacité). **DynamoDB Auto Scaling** ajuste automatiquement la capacité provisionnée.
- **RDS Reserved Instances** : Disponible pour tous les types de moteurs RDS. Les déploiements Multi-AZ peuvent utiliser des Instances Réservées (vous vous engagez sur Multi-AZ). Terme de 1 ou 3 ans.
- **ElastiCache Reserved Nodes** : Même modèle d'engagement que les Instances Réservées EC2. Appliqué par nœud, pas par cluster.
- **Stockage des instantanés RDS** : Les sauvegardes automatisées sont gratuites jusqu'à 100% de la taille de la base de données. Les instantanés manuels facturés par Go par mois dans S3. Scénario d'examen : « réduire les coûts de stockage RDS » → supprimer les vieux instantanés manuels.
- **Capacité réservée DynamoDB** : Disponible pour DynamoDB également (engagement sur une capacité de lecture/écriture spécifique pendant 1 ou 3 ans à un prix réduit). Différent du provisionné standard — vous prépayez la capacité dans toutes vos tables DynamoDB dans une région.
- **Aurora Serverless v2 vs provisionné** : Serverless v2 évolue automatiquement, idéal pour les charges de travail variables. Provisionné avec Instances Réservées est moins cher pour les charges de travail stables et prévisibles.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez quand utiliser la capacité à la demande DynamoDB par rapport à la capacité provisionnée avec Auto Scaling. Quelle information vous faut-il pour prendre cette décision ?

*(Indice : Réfléchissez à ce que « prévisible » signifie en termes de données de trafic, et quel risque à la demande supprime que le provisionné introduit.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise exploite une table DynamoDB pour le classement d'un jeu mobile. Le trafic monte fortement lors d'un événement saisonnier (une semaine par trimestre, trafic 10x normal) mais est autrement très cohérent. En dehors de l'événement saisonnier, l'entreprise veut minimiser les coûts de base de données tout en maintenant les performances.

Quelle stratégie de capacité DynamoDB répond LE MIEUX à ces exigences ?

A) Capacité à la demande pour gérer les pics saisonniers sans throttling  
B) Capacité provisionnée fixée aux niveaux de pic saisonnier (toujours provisionné pour le trafic 10x)  
C) Capacité provisionnée avec DynamoDB Auto Scaling, avec une capacité maximale fixée pour le pic saisonnier  
D) Unités de capacité réservées DynamoDB pour 3 ans aux niveaux de trafic normaux

**Indice 1** : « Trafic cohérent sauf pics saisonniers connus » — quel mode gère les deux efficacement ?

**Indice 2** : « Minimiser les coûts » pendant les périodes creuses signifie qu'on ne peut pas sur-provisionner pour 10x tout le temps.

**Indice 3** : DynamoDB Auto Scaling peut monter à l'échelle pour l'événement saisonnier et redescendre après.

**Réponse** : C

**Explication** : La capacité provisionnée avec Auto Scaling ajuste la table en fonction du trafic réel. Pendant les périodes normales, la capacité est aux niveaux normaux (faible coût). Pendant l'événement saisonnier, Auto Scaling détecte l'augmentation du trafic et monte jusqu'au niveau maximum configuré (gérant le pic 10x). Après l'événement, il redescend. C'est moins cher qu'à la demande pendant les périodes normales (à la demande coûte plus par requête) et moins cher que de toujours provisionner pour 10x.

**Pourquoi pas A ?** À la demande gère les pics sans throttling mais coûte plus par requête que le provisionné pendant le trafic normal et prévisible.

**Pourquoi pas B ?** Provisionner à 10x en permanence signifie que 75% de la capacité provisionnée est inutilisée 75% de l'année — payer pour de la capacité jamais utilisée.

**Pourquoi pas D ?** Les unités de capacité réservées vous verrouillent aux niveaux de trafic normaux. Pendant l'événement saisonnier 10x, vous seriez throttlé au-delà du montant réservé, ou vous devrez ajouter à la demande par-dessus.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus évalue une nouvelle fonctionnalité : un tableau de bord analytique pour les restaurants qui affiche les comptages de commandes en temps réel, le chiffre d'affaires par heure et les données démographiques des clients. Ces données interrogeraient une base de données environ 200 fois par minute (une requête par analyste par rafraîchissement de page, avec 10 analystes).

Actuellement les données analytiques sont dans Athena (S3). Devraient-ils construire le tableau de bord sur Athena, ou devraient-ils charger les données dans une base de données ? Si une base de données, laquelle (Aurora, DynamoDB, Redshift) ?

Considérez : la fréquence des requêtes, les exigences de fraîcheur des données, la complexité des requêtes (agrégations, jointures), et le coût par requête à ce volume.

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la sélection de bases de données pour les charges de travail analytiques.)*

## Scène Post-Générique

Tom présenta le résumé complet d'optimisation des coûts à Maya.

Trois mois de travail. 31 620 $ d'économies annuelles identifiées. 26 400 $ de changements déjà mis en œuvre.

« Qu'est-ce que les 5 220 $ restants ? » demanda Maya.

« Des optimisations dont je ne suis pas encore suffisamment confiant, » dit Tom. « La configuration Aurora pourrait être davantage dimensionnée, mais je veux un trimestre de données supplémentaire avant de m'engager. Et il y a une question de transfert de données que je n'ai pas encore entièrement analysée. »

« Les coûts réseau. »

« Oui. C'est la prochaine étape. »

Maya regarda les chiffres. « Tom, je veux comprendre quelque chose. Cette optimisation — vous y avez travaillé pendant trois mois. C'est une partie significative de votre temps. »

« Environ 30%. »

« Et vous avez économisé 26 400 $ par an. Donc l'optimisation se rentabilise en — quoi, quatre mois de votre salaire ? »

Tom la regarda. « À peu près. »

« Et chaque année après ça, ce sont de pures économies. »

« Ou du pur réinvestissement, » dit-il. « Même effet. »

Maya hocha la tête. « C'est ce que je veux que vous fassiez. Pas seulement sur le stockage et les bases de données — sur tout. Faites de l'optimisation des coûts une fonction continue de votre rôle. »

Tom n'avait jamais entendu son travail décrit ainsi. Il trouva cela à la fois précis et satisfaisant.

Dans le prochain chapitre : la dernière catégorie de coûts restante — et celle qui surprend presque tout le monde.
