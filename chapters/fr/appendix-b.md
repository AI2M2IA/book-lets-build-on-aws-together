# Annexe B : Carte des domaines SAA-C03

L'examen AWS Solutions Architect Associate (SAA-C03) est organisé en quatre domaines. Cette annexe associe chaque chapitre du livre au domaine et à la tâche pertinents, afin que vous puissiez étudier par domaine d'examen plutôt que par ordre de chapitre.

---

## Vue d'ensemble des domaines

| Domaine                                            | Poids | Description                                               |
|----------------------------------------------------|-------|-----------------------------------------------------------|
| Domaine 1 : Concevoir des architectures sécurisées | 30 %  | IAM, sécurité réseau, protection des données              |
| Domaine 2 : Concevoir des architectures résilientes | 26 % | Haute disponibilité, tolérance aux pannes, reprise après sinistre |
| Domaine 3 : Concevoir des architectures haute performance | 24 % | Performance de calcul, stockage, base de données, réseau |
| Domaine 4 : Concevoir des architectures à coût optimisé | 20 % | Modèles de tarification, gestion des coûts, optimisation des ressources |

---

## Domaine 1 : Concevoir des architectures sécurisées (30 %)

**Tâche 1.1 — Concevoir un accès sécurisé aux ressources AWS**

Concepts clés : Utilisateurs, groupes, rôles, politiques IAM. Principe du moindre privilège. Accès inter-comptes. Rôles de service. SCP (Politiques de contrôle de service) dans AWS Organizations.

| Chapitre    | Sujet                                                                                    |
|-------------|------------------------------------------------------------------------------------------|
| Chapitre 3  | Fondamentaux IAM : utilisateurs, groupes, rôles, politiques, logique d'évaluation des politiques |
| Chapitre 14 | IAM avancé : rôles pour les services, limites d'autorisation, rôles inter-comptes        |
| Chapitre 3  | Logique d'évaluation des politiques : refus explicite > autorisation explicite > refus implicite |
| Chapitre 14 | AWS Organizations et SCP                                                                  |

Modèles d'examen clés :

- « EC2 doit accéder à S3 sans identifiants codés en dur » → Rôle IAM avec politique S3 attachée au profil d'instance EC2
- « Différents comptes doivent partager des ressources » → Rôle IAM avec politique de confiance inter-comptes
- « Empêcher tous les utilisateurs IAM dans une OU d'accéder à un service » → SCP dans AWS Organizations

---

**Tâche 1.2 — Concevoir des charges de travail et des applications sécurisées**

Concepts clés : Conception VPC, groupes de sécurité vs NACL, isolation réseau, protection DDoS, WAF, GuardDuty.

| Chapitre    | Sujet                                                                                        |
|-------------|----------------------------------------------------------------------------------------------|
| Chapitre 11 | Conception VPC : sous-réseaux publics/privés, NAT Gateway, Internet Gateway, tables de routage |
| Chapitre 15 | Groupes de sécurité (avec état, niveau instance) vs NACL (sans état, niveau sous-réseau)    |
| Chapitre 17 | Shield (protection DDoS), WAF (pare-feu applicatif), GuardDuty (détection des menaces)     |
| Chapitre 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                            |

Modèles d'examen clés :

- « Bloquer une IP spécifique du sous-réseau » → Règle de refus NACL
- « Autoriser le HTTP entrant, autoriser automatiquement la réponse HTTP sortante » → Groupe de sécurité (avec état)
- « Protéger l'application web contre l'injection SQL » → WAF avec règle d'injection SQL
- « Détecter les identifiants IAM compromis » → GuardDuty

---

**Tâche 1.3 — Déterminer les contrôles de sécurité des données appropriés**

Concepts clés : Chiffrement au repos et en transit, KMS, Secrets Manager, Parameter Store, chiffrement côté serveur S3.

| Chapitre    | Sujet                                                                         |
|-------------|-------------------------------------------------------------------------------|
| Chapitre 16 | KMS : clés gérées par le client, rotation des clés, chiffrement enveloppé    |
| Chapitre 16 | Secrets Manager : rotation automatique des identifiants, récupération des secrets au moment de l'exécution |
| Chapitre 5  | Options de chiffrement S3 : SSE-S3, SSE-KMS, SSE-C                           |
| Chapitre 8  | Chiffrement RDS au repos (doit être activé lors de la création)               |

Modèles d'examen clés :

- « Faire tourner automatiquement les identifiants de base de données » → Secrets Manager avec intégration RDS
- « Contrôler qui peut utiliser les clés de chiffrement entre les comptes » → Politique de clé KMS
- « Stocker des valeurs de configuration non secrètes » → SSM Parameter Store (pas Secrets Manager)
- « Chiffrer les objets S3 avec des clés gérées par l'entreprise » → SSE-KMS avec CMK

---

## Domaine 2 : Concevoir des architectures résilientes (26 %)

**Tâche 2.1 — Concevoir des architectures évolutives et faiblement couplées**

Concepts clés : Auto Scaling, équilibreurs de charge, découplage SQS/SNS, déclencheurs d'événements Lambda, ECS/EKS, Step Functions.

| Chapitre    | Sujet                                                                     |
|-------------|---------------------------------------------------------------------------|
| Chapitre 7  | Groupes Auto Scaling, Application Load Balancer, politiques de mise à l'échelle |
| Chapitre 19 | SQS (découplage avec des files), SNS (notifications de diffusion en éventail) |
| Chapitre 20 | Lambda : calcul sans serveur, déclencheurs d'événements, simultanéité     |
| Chapitre 21 | ECS et EKS : microservices conteneurisés                                  |
| Chapitre 22 | Step Functions : orchestration de flux de travail                         |
| Chapitre 26 | Kinesis : diffusion de données en temps réel                              |

Modèles d'examen clés :

- « Découpler le traitement des commandes de la mise à jour de l'inventaire » → File SQS entre les services
- « Notifier plusieurs services lors d'une nouvelle commande » → Sujet SNS avec abonnements SQS (diffusion en éventail)
- « Traiter automatiquement les téléchargements S3 » → Notification d'événement S3 → Lambda
- « Exécuter un flux de travail en plusieurs étapes avec logique de réessai » → Step Functions

---

**Tâche 2.2 — Concevoir des architectures hautement disponibles et/ou tolérantes aux pannes**

Concepts clés : Multi-AZ, Multi-Région, basculement Route 53, répliques en lecture RDS, Aurora Global Database, sauvegarde et restauration.

| Chapitre    | Sujet                                                                                              |
|-------------|---------------------------------------------------------------------------------------------------|
| Chapitre 2  | Infrastructure mondiale AWS : Régions, AZ, points de présence                                     |
| Chapitre 7  | ALB sur plusieurs AZ, ASG remplace les instances défectueuses                                     |
| Chapitre 8  | RDS Multi-AZ : réplication synchrone, basculement automatique                                    |
| Chapitre 12 | Route 53 : routage de basculement, routage par latence, vérifications de santé                   |
| Chapitre 18 | Multi-AZ vs Multi-Région : RTO/RPO, stratégies DR (veilleuse, standby chaud, actif-actif)        |
| Chapitre 24 | Aurora Global Database : répliques en lecture inter-régions, délai de réplication inférieur à 1 s |

Modèles d'examen clés :

- « Basculer automatiquement si le RDS principal tombe en panne » → RDS Multi-AZ (pas la réplique en lecture)
- « Servir les lectures mondialement avec une faible latence » → Aurora Global Database
- « Router le trafic vers la région secondaire si la primaire est indisponible » → Route 53 avec routage de basculement + vérifications de santé
- « RTO de 1 minute, RPO de 0 » → Déploiement Multi-AZ (pas Multi-Région)
- « RTO de 15 minutes, inter-région » → Stratégie Veilleuse

---

## Domaine 3 : Concevoir des architectures haute performance (24 %)

**Tâche 3.1 — Déterminer des solutions de stockage haute performance et/ou évolutives**

Concepts clés : S3 vs EBS vs EFS, sélection de classe de stockage, S3 Transfer Acceleration, téléchargement multi-parties, CloudFront pour les ressources.

| Chapitre    | Sujet                                                                           |
|-------------|---------------------------------------------------------------------------------|
| Chapitre 5  | S3 : stockage d'objets, classes de stockage, versionnage, cycle de vie          |
| Chapitre 6  | EBS : types de stockage par blocs (gp3, io2, st1), EFS : stockage de fichiers partagé |
| Chapitre 23 | Transitions de classe de stockage S3, options de récupération Glacier           |
| Chapitre 28 | Redimensionnement EBS, migration gp2→gp3, gestion des instantanés              |

Modèles d'examen clés :

- « Système de fichiers partagé accessible depuis plusieurs instances EC2 » → EFS (pas EBS ; EBS s'attache à une seule instance)
- « IOPS élevés pour une charge de travail de base de données » → io2 EBS
- « Réduire le coût des fichiers non consultés depuis 90 jours » → Politique de cycle de vie S3 → Glacier
- « Télécharger des fichiers volumineux depuis des emplacements distants plus rapidement » → S3 Transfer Acceleration

---

**Tâche 3.2 — Déterminer des solutions de calcul haute performance et/ou évolutives**

Concepts clés : Familles d'instances EC2, processeurs Graviton, Auto Scaling, Lambda, Fargate, instances Spot.

| Chapitre    | Sujet                                                                                        |
|-------------|----------------------------------------------------------------------------------------------|
| Chapitre 4  | Types d'instances EC2 : optimisé calcul (c), optimisé mémoire (r), usage général (m, t)    |
| Chapitre 7  | Auto Scaling : mise à l'échelle horizontale pour les couches web                            |
| Chapitre 20 | Lambda : simultanéité, simultanéité provisionnée (pour une latence cohérente)               |
| Chapitre 21 | ECS Fargate : conteneurs sans serveur                                                        |
| Chapitre 27 | Instances Spot pour les charges de travail par lots tolérantes aux pannes                   |

Modèles d'examen clés :

- « Charge de travail d'entraînement ML, minimiser le coût, peut être interrompue » → Instances Spot
- « Réponse Lambda cohérente sous les 100 ms » → Simultanéité provisionnée (élimine le démarrage à froid)
- « Microservice conteneurisé, pas de gestion d'infrastructure » → ECS Fargate

---

**Tâche 3.3 — Déterminer des solutions de base de données haute performance**

Concepts clés : RDS vs DynamoDB vs Aurora vs Redshift vs ElastiCache, modèles d'accès, répliques en lecture, DAX.

| Chapitre    | Sujet                                                                         |
|-------------|-------------------------------------------------------------------------------|
| Chapitre 8  | RDS : bases de données relationnelles gérées, quand utiliser RDBMS            |
| Chapitre 9  | DynamoDB : NoSQL, clés de partition, GSI, DAX (cache en mémoire)             |
| Chapitre 10 | ElastiCache : Redis vs Memcached, stratégies de cache                         |
| Chapitre 24 | Aurora : performance, Serverless v2, répliques en lecture, Global Database    |
| Chapitre 29 | DynamoDB à la demande vs capacité provisionnée avec Auto Scaling              |

Modèles d'examen clés :

- « Lectures en microsecondes pour un magasin de sessions » → ElastiCache Redis ou DAX (si backend DynamoDB)
- « Accès clé-valeur à haut débit avec schéma flexible » → DynamoDB
- « Jointures complexes et transactions ACID » → Aurora ou RDS
- « Analytique sur des pétaoctets de données structurées » → Redshift (non couvert en détail mais signal : « entrepôt de données » → Redshift)

---

**Tâche 3.4 — Déterminer des architectures réseau haute performance et/ou évolutives**

Concepts clés : CloudFront, Global Accelerator, Direct Connect, VPN, groupes de placement, mise en réseau améliorée.

| Chapitre    | Sujet                                                                            |
|-------------|----------------------------------------------------------------------------------|
| Chapitre 12 | Route 53 : politiques de routage : basé sur la latence, géolocalisation, pondéré |
| Chapitre 13 | CloudFront : CDN, mise en cache au point de présence, Lambda@Edge                |
| Chapitre 25 | Direct Connect : connectivité privée dédiée                                      |
| Chapitre 25 | AWS Global Accelerator : routage Anycast vers le point de présence AWS le plus proche |
| Chapitre 30 | VPC Endpoints : connectivité privée aux services AWS                             |

Modèles d'examen clés :

- « Réduire la latence pour les utilisateurs mondiaux accédant aux réponses API dynamiques » → Global Accelerator (pas CloudFront, qui est le meilleur pour le contenu cacheable)
- « Réduire la latence pour les ressources statiques mondialement » → CloudFront
- « Connectivité privée cohérente à AWS depuis les locaux » → Direct Connect
- « Téléchargement rapide depuis des clients du monde entier vers votre compartiment S3 » → S3 Transfer Acceleration

---

**Tâche 3.5 — Déterminer des solutions d'ingestion et de transformation de données haute performance**

Concepts clés : Kinesis Data Streams, Kinesis Firehose, Glue, Athena, EMR.

| Chapitre    | Sujet                                                                              |
|-------------|------------------------------------------------------------------------------------|
| Chapitre 26 | Kinesis Data Streams : traitement d'événements ordonné en temps réel               |
| Chapitre 26 | Kinesis Data Firehose : livraison gérée vers S3, Redshift, OpenSearch              |
| Chapitre 26 | AWS Glue : ETL sans serveur, catalogue de données, Crawlers                         |
| Chapitre 26 | Athena : SQL sans serveur sur S3                                                    |

Modèles d'examen clés :

- « Traiter des données de flux de clics en temps réel » → Kinesis Data Streams + Lambda ou KDA
- « Livrer des données de diffusion vers S3 pour une analyse ultérieure » → Kinesis Firehose
- « Transformer et cataloguer des données de plusieurs sources » → AWS Glue
- « Interroger des données historiques stockées dans S3 avec SQL » → Athena

---

## Domaine 4 : Concevoir des architectures à coût optimisé (20 %)

**Tâche 4.1 — Concevoir des solutions de stockage à coût optimisé**

| Chapitre    | Sujet                                                                              |
|-------------|------------------------------------------------------------------------------------|
| Chapitre 23 | Politiques de cycle de vie S3, transitions entre classes de stockage               |
| Chapitre 28 | Redimensionnement EBS, migration gp2→gp3, règles de cycle de vie du versionnage S3 |
| Chapitre 28 | EFS Intelligent-Tiering, balises d'allocation des coûts, AWS Budgets               |

Modèles d'examen clés :

- « Identifier quelle équipe génère le plus de coûts S3 » → Balises d'allocation des coûts + Cost Explorer
- « Réduire automatiquement les coûts des objets rarement consultés » → S3 Intelligent-Tiering
- « Alerter quand les coûts mensuels dépassent 10 000 $ » → AWS Budgets

---

**Tâche 4.2 — Concevoir des solutions de calcul à coût optimisé**

| Chapitre    | Sujet                                                                                           |
|-------------|------------------------------------------------------------------------------------------------|
| Chapitre 27 | Tarification EC2 : À la demande, Reserved Instances, Savings Plans, Spot, Dedicated Hosts      |
| Chapitre 20 | Lambda : paiement par invocation (coût d'inactivité zéro)                                      |

Modèles d'examen clés :

- « Réduire le coût pour les charges de travail de production en état stable » → Savings Plans (plus flexible) ou Reserved Instances
- « Minimiser le coût pour les jobs par lots pouvant être interrompus » → Instances Spot
- « Traitement piloté par les événements avec coût d'inactivité zéro » → Lambda

---

**Tâche 4.3 — Concevoir des solutions de base de données à coût optimisé**

| Chapitre    | Sujet                                                                       |
|-------------|-----------------------------------------------------------------------------|
| Chapitre 29 | DynamoDB à la demande vs provisionné + Auto Scaling                         |
| Chapitre 29 | RDS et ElastiCache Reserved Instances/Nodes                                 |
| Chapitre 29 | Gestion des instantanés RDS                                                 |

Modèles d'examen clés :

- « Trafic DynamoDB imprévisible » → Mode de capacité à la demande
- « Trafic DynamoDB cohérent avec des pics connus » → Provisionné + Auto Scaling
- « Réduire les coûts RDS pour une charge de travail stable » → Reserved Instances (1 ou 3 ans)

---

**Tâche 4.4 — Concevoir des architectures réseau à coût optimisé**

| Chapitre    | Sujet                                                                                            |
|-------------|--------------------------------------------------------------------------------------------------|
| Chapitre 30 | Tarification du transfert de données : entrant (gratuit), inter-AZ (0,01 $/Go), inter-région, Internet (0,09 $/Go) |
| Chapitre 30 | NAT Gateway (0,045 $/Go) vs VPC Endpoints (Gateway : gratuit ; Interface : payant)              |
| Chapitre 30 | CloudFront comme optimiseur des coûts de transfert de données                                    |

Modèles d'examen clés :

- « EC2 dans un sous-réseau privé appelle S3 — éliminer les coûts NAT Gateway » → S3 Gateway Endpoint (gratuit)
- « EC2 dans un sous-réseau privé appelle SQS — réduire les coûts NAT Gateway » → SQS Interface Endpoint
- « Réduire les coûts de transfert de données pour la livraison de contenu mondial » → CloudFront (la mise en cache réduit les requêtes vers l'origine)

---

## Sujets inter-domaines

Certains sujets apparaissent dans plusieurs domaines :

| Sujet                                  | Domaines | Chapitres    |
|----------------------------------------|----------|--------------|
| Well-Architected Framework             | Tous     | 31           |
| Revues d'architecture et ADR           | Tous     | 32           |
| Raisonnement sur les compromis (« ça dépend ») | Tous | 33      |
| Conception Multi-AZ                    | 2, 3     | 7, 8, 18, 24 |
| Surveillance et observabilité          | 1, 2     | Tout au long |
| CloudFront                             | 3, 4     | 13, 30       |

---

## Liste de vérification pré-examen

Avant de passer le SAA-C03 :

**Domaines à fort poids (les plus susceptibles d'apparaître)**

- [ ] Logique d'évaluation des politiques IAM (refus explicite → autorisation explicite → refus implicite)
- [ ] Composants VPC : sous-réseaux, tables de routage, IGW, NAT Gateway, groupes de sécurité, NACL
- [ ] Classes de stockage S3 et quand utiliser chacune
- [ ] RDS Multi-AZ vs réplique en lecture (basculement vs mise à l'échelle en lecture)
- [ ] SQS vs SNS vs EventBridge (extraction vs poussée vs routage d'événements)
- [ ] Modèles de tarification EC2 : Spot pour tolérant aux pannes, Savings Plans pour les charges de travail engagées
- [ ] Déclencheurs Lambda et simultanéité
- [ ] DynamoDB vs Aurora vs Redshift (le modèle d'accès détermine le choix)
- [ ] CloudFront : CDN pour statique, Global Accelerator pour dynamique

**Pièges courants**

- [ ] EBS s'attache à UNE instance ; EFS est partagé
- [ ] Les répliques en lecture RDS sont pour la mise à l'échelle en lecture, PAS le basculement automatique (c'est Multi-AZ)
- [ ] Les NACL sont sans état (nécessitent des règles entrantes et sortantes)
- [ ] Les Gateway Endpoints sont gratuits et uniquement pour S3 et DynamoDB
- [ ] Kinesis conserve et rejoue ; SQS supprime à la consommation
- [ ] « Découpler » ne signifie pas toujours SQS — la diffusion en éventail SNS et EventBridge sont aussi des modèles de découplage
- [ ] Shield Standard est gratuit et automatique ; Advanced est un abonnement payant

**La structure de l'examen**

- 65 questions, 130 minutes (2 heures 10 minutes)
- Choix multiple (une seule bonne réponse) et réponse multiple (sélectionner N bonnes réponses)
- Score de réussite : 720 sur 1 000
- Les questions non notées sont intégrées ; vous ne pouvez pas distinguer lesquelles elles sont
- Gérez le temps : ~2 minutes par question ; marquez les difficiles et revenez-y
