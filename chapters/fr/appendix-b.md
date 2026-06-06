# Annexe B : Carte des domaines SAA-C03

L'examen AWS Solutions Architect Associate (SAA-C03) est organisé en quatre domaines. Cette annexe associe chaque chapitre du livre au domaine et à la tâche pertinents, afin que vous puissiez étudier par domaine d'examen plutôt que par ordre de chapitre.

---

## Vue d'ensemble des domaines

| Domaine                                              | Poids | Description                                              |
|-----------------------------------------------------|-------|---------------------------------------------------------|
| Domaine 1 : Concevoir des architectures sécurisées   | 30 %  | IAM, sécurité réseau, protection des données            |
| Domaine 2 : Concevoir des architectures résilientes  | 26 %  | Haute disponibilité, tolérance aux pannes, reprise après sinistre |
| Domaine 3 : Concevoir des architectures performantes | 24 %  | Performance du calcul, du stockage, des bases de données et du réseau |
| Domaine 4 : Concevoir des architectures optimisées en coûts | 20 % | Modèles de tarification, gestion des coûts, optimisation des ressources |

---

## Domaine 1 : Concevoir des architectures sécurisées (30 %)

**Tâche 1.1 — Concevoir un accès sécurisé aux ressources AWS**

Concepts fondamentaux : utilisateurs, groupes, rôles et politiques IAM. Principe du moindre privilège. Accès inter-comptes. Rôles de service. SCP (Service Control Policies) dans AWS Organizations.

| Chapitre    | Sujet                                                                            |
|-------------|----------------------------------------------------------------------------------|
| Chapitre 3  | Fondamentaux d'IAM : utilisateurs, groupes, rôles, politiques, évaluation des politiques |
| Chapitre 14 | IAM avancé : rôles pour les services, permission boundaries, rôles inter-comptes  |
| Chapitre 3  | Logique d'évaluation des politiques : refus explicite > autorisation explicite > refus implicite |
| Chapitre 14 | AWS Organizations, SCP, Control Tower, Account Factory                            |
| Chapitre 14 | Cognito : User Pools (connexion à l'application, JWT) et Identity Pools (informations d'identification AWS temporaires) |

Modèles d'examen clés :

- « EC2 doit accéder à S3 sans informations d'identification codées en dur » → rôle IAM avec politique S3 attachée au profil d'instance EC2
- « Différents comptes doivent partager des ressources » → rôle IAM avec politique de confiance inter-comptes
- « Empêcher tous les utilisateurs IAM d'une OU d'accéder à un service » → SCP dans AWS Organizations

---

**Tâche 1.2 — Concevoir des charges de travail et applications sécurisées**

Concepts fondamentaux : conception de VPC, groupes de sécurité vs NACL, isolation réseau, protection DDoS, WAF, GuardDuty.

| Chapitre    | Sujet                                                                                        |
|-------------|----------------------------------------------------------------------------------------------|
| Chapitre 11 | Conception de VPC : sous-réseaux publics/privés, NAT Gateway, Internet Gateway, tables de routage |
| Chapitre 15 | Groupes de sécurité (à état, au niveau de l'instance) vs NACL (sans état, au niveau du sous-réseau) |
| Chapitre 17 | Shield (DDoS), WAF (pare-feu applicatif), GuardDuty (détection des menaces), Inspector (analyse des CVE) |
| Chapitre 17 | Macie : découverte de données sensibles dans S3 (PII, informations d'identification)          |
| Chapitre 25 | Direct Connect, VPN, Transit Gateway, PrivateLink                                             |

Modèles d'examen clés :

- « Bloquer une IP spécifique du sous-réseau » → règle de refus NACL
- « Autoriser le HTTP en entrée, autoriser automatiquement la réponse HTTP en sortie » → groupe de sécurité (à état)
- « Protéger une application web contre l'injection SQL » → WAF avec règle d'injection SQL
- « Détecter des informations d'identification IAM compromises » → GuardDuty

---

**Tâche 1.3 — Déterminer les contrôles de sécurité des données appropriés**

Concepts fondamentaux : chiffrement au repos et en transit, KMS, Secrets Manager, Parameter Store, chiffrement côté serveur S3.

| Chapitre    | Sujet                                                                      |
|-------------|----------------------------------------------------------------------------|
| Chapitre 16 | KMS : clés gérées par le client, rotation des clés, chiffrement par enveloppe |
| Chapitre 16 | Secrets Manager : rotation automatique des informations d'identification, récupération de secrets au moment de l'exécution |
| Chapitre 16 | ACM (AWS Certificate Manager) : certificats SSL/TLS pour ALB, CloudFront    |
| Chapitre 5  | Options de chiffrement S3 : SSE-S3, SSE-KMS, SSE-C                          |
| Chapitre 8  | Chiffrement au repos RDS (doit être activé à la création)                   |

Modèles d'examen clés :

- « Faire tourner automatiquement les informations d'identification de base de données » → Secrets Manager avec intégration RDS
- « Contrôler qui peut utiliser les clés de chiffrement entre les comptes » → politique de clé KMS
- « Stocker des valeurs de configuration non secrètes » → SSM Parameter Store (pas Secrets Manager)
- « Chiffrer les objets S3 avec des clés gérées par l'entreprise » → SSE-KMS avec CMK

---

## Domaine 2 : Concevoir des architectures résilientes (26 %)

**Tâche 2.1 — Concevoir des architectures évolutives et faiblement couplées**

Concepts fondamentaux : Auto Scaling, équilibreurs de charge, découplage SQS/SNS, déclencheurs d'événements Lambda, ECS/EKS, Step Functions.

| Chapitre    | Sujet                                                              |
|-------------|--------------------------------------------------------------------|
| Chapitre 7  | Groupes Auto Scaling, Application Load Balancer, politiques de mise à l'échelle |
| Chapitre 19 | SQS (découplage avec des files), SNS (notifications de diffusion)   |
| Chapitre 20 | Lambda : calcul sans serveur, déclencheurs d'événements, simultanéité |
| Chapitre 20 | API Gateway : API REST/HTTP/WebSocket gérées, autonomes ou + Lambda |
| Chapitre 21 | ECS et EKS : microservices conteneurisés                           |
| Chapitre 22 | Step Functions : orchestration de flux de travail                  |
| Chapitre 26 | Kinesis : diffusion de données en temps réel                       |

Modèles d'examen clés :

- « Découpler le traitement des commandes de la mise à jour de l'inventaire » → file SQS entre les services
- « Notifier plusieurs services lorsqu'une nouvelle commande est passée » → sujet SNS avec abonnements SQS (diffusion)
- « Traiter automatiquement les téléversements S3 » → notification d'événement S3 → Lambda
- « Exécuter un flux de travail à plusieurs étapes avec logique de nouvelle tentative » → Step Functions

---

**Tâche 2.2 — Concevoir des architectures hautement disponibles et/ou tolérantes aux pannes**

Concepts fondamentaux : Multi-AZ, Multi-Région, basculement Route 53, réplicas en lecture RDS, Aurora Global Database, sauvegarde et restauration.

| Chapitre    | Sujet                                                                                          |
|-------------|------------------------------------------------------------------------------------------------|
| Chapitre 2  | Infrastructure mondiale AWS : régions, AZ, emplacements périphériques                           |
| Chapitre 7  | ALB sur plusieurs AZ, l'ASG remplace les instances défaillantes                                |
| Chapitre 8  | RDS Multi-AZ : réplication synchrone, basculement automatique                                  |
| Chapitre 12 | Route 53 : routage de basculement, routage par latence, vérifications de santé                  |
| Chapitre 18 | Multi-AZ vs Multi-Région : RTO/RPO, stratégies de DR (pilot light, warm standby, active-active) |
| Chapitre 18 | AWS Backup (sauvegardes centralisées, inter-comptes), Elastic Disaster Recovery (pilot light géré) |
| Chapitre 24 | Aurora Global Database : réplicas en lecture inter-régions, décalage de réplication < 1 s        |

Modèles d'examen clés :

- « Basculer automatiquement si le RDS primaire tombe en panne » → RDS Multi-AZ (pas un réplica en lecture)
- « Servir des lectures globalement avec une faible latence » → Aurora Global Database
- « Acheminer le trafic vers une région secondaire si la primaire est indisponible » → Route 53 avec routage de basculement + vérifications de santé
- « RTO de 1 minute, RPO de 0 » → déploiement Multi-AZ (pas Multi-Région)
- « RTO de 15 minutes, inter-régions » → stratégie Pilot Light

---

## Domaine 3 : Concevoir des architectures performantes (24 %)

**Tâche 3.1 — Déterminer des solutions de stockage performantes et/ou évolutives**

Concepts fondamentaux : S3 vs EBS vs EFS, sélection de la classe de stockage, S3 Transfer Acceleration, téléversement multipart, CloudFront pour les ressources.

| Chapitre    | Sujet                                                                    |
|-------------|--------------------------------------------------------------------------|
| Chapitre 5  | S3 : stockage d'objets, classes de stockage, gestion des versions, cycle de vie |
| Chapitre 6  | EBS : types de stockage en bloc (gp3, io2, st1), EFS : stockage de fichiers partagé |
| Chapitre 6  | Storage Gateway : pont hybride sur site vers S3 (File, Volume, Tape)      |
| Chapitre 23 | Transitions de classe de stockage S3, options de récupération Glacier     |
| Chapitre 25 | DataSync (synchronisation de fichiers en ligne), Transfer Family (SFTP→S3 géré), Snow Family (transfert en masse hors ligne — hérité : fermé aux nouveaux clients en novembre 2025 ; AWS oriente désormais vers DataSync et les Data Transfer Terminals), MGN (réhébergement de serveur) |
| Chapitre 28 | Dimensionnement adéquat d'EBS, migration gp2→gp3, gestion des instantanés  |

Modèles d'examen clés :

- « Système de fichiers partagé accessible depuis plusieurs instances EC2 » → EFS (pas EBS ; EBS s'attache à une seule instance)
- « IOPS élevés pour une charge de travail de base de données » → io2 EBS
- « Réduire le coût des fichiers non consultés depuis 90 jours » → politique de cycle de vie S3 → Glacier
- « Téléverser plus rapidement de gros fichiers depuis des emplacements distants » → S3 Transfer Acceleration
- « Des semaines de transfert sur une bande passante limitée » → l'examen SAA-C03 attend toujours Snowball, malgré la fermeture de la Snow Family aux nouveaux clients en 2025

---

**Tâche 3.2 — Déterminer des solutions de calcul performantes et/ou évolutives**

Concepts fondamentaux : familles d'instances EC2, processeurs Graviton, Auto Scaling, Lambda, Fargate, instances Spot.

| Chapitre    | Sujet                                                                                    |
|-------------|-----------------------------------------------------------------------------------------|
| Chapitre 4  | Types d'instances EC2 : optimisées pour le calcul (c), optimisées pour la mémoire (r), usage général (m, t) |
| Chapitre 7  | Auto Scaling : mise à l'échelle horizontale pour les niveaux web                          |
| Chapitre 20 | Lambda : simultanéité, simultanéité provisionnée (pour une latence constante)             |
| Chapitre 21 | ECS Fargate : conteneurs sans serveur                                                     |
| Chapitre 21 | AWS Batch : calcul par lots géré pour les conteneurs Docker, adossé à Spot                |
| Chapitre 27 | Instances Spot pour les charges de travail par lots tolérantes aux pannes                 |

Modèles d'examen clés :

- « Charge de travail d'entraînement ML, minimiser le coût, peut être interrompue » → instances Spot
- « Réponse Lambda constante sous 100 ms » → simultanéité provisionnée (élimine le démarrage à froid)
- « Microservice conteneurisé, sans gestion d'infrastructure » → ECS Fargate

---

**Tâche 3.3 — Déterminer des solutions de base de données performantes**

Concepts fondamentaux : RDS vs DynamoDB vs Aurora vs Redshift vs ElastiCache, modèles d'accès, réplicas en lecture, DAX.

| Chapitre    | Sujet                                                              |
|-------------|--------------------------------------------------------------------|
| Chapitre 8  | RDS : bases de données relationnelles gérées, quand utiliser un SGBDR |
| Chapitre 9  | DynamoDB : NoSQL, clés de partition, GSI, DAX (cache en mémoire)    |
| Chapitre 10 | ElastiCache : Redis vs Memcached, stratégies de cache              |
| Chapitre 10 | MemoryDB for Redis : base de données primaire durable compatible Redis |
| Chapitre 24 | Aurora : performance, Serverless v2, réplicas en lecture, Global Database |
| Chapitre 29 | DynamoDB capacité à la demande vs provisionnée avec Auto Scaling    |

Modèles d'examen clés :

- « Lectures en microsecondes pour un magasin de sessions » → ElastiCache Redis ou DAX (si backend DynamoDB)
- « Accès clé-valeur à haut débit avec schéma flexible » → DynamoDB
- « Jointures complexes et transactions ACID » → Aurora ou RDS
- « Analytique sur des pétaoctets de données structurées » → Redshift (non couvert en détail mais signal : « entrepôt de données » → Redshift)

---

**Tâche 3.4 — Déterminer des architectures réseau performantes et/ou évolutives**

Concepts fondamentaux : CloudFront, Global Accelerator, Direct Connect, VPN, groupes de placement, mise en réseau améliorée.

| Chapitre    | Sujet                                                              |
|-------------|--------------------------------------------------------------------|
| Chapitre 7  | NLB (couche 4) et GWLB (Gateway Load Balancer pour les appliances réseau) |
| Chapitre 11 | Client VPN : accès chiffré d'appareil individuel vers un VPC        |
| Chapitre 12 | Route 53 : politiques de routage : basé sur la latence, géolocalisation, pondéré |
| Chapitre 13 | CloudFront : CDN, mise en cache périphérique, Lambda@Edge          |
| Chapitre 25 | AWS Global Accelerator : routage Anycast sur le réseau dorsal AWS   |
| Chapitre 25 | Direct Connect : connectivité privée dédiée                        |
| Chapitre 30 | VPC Endpoints : connectivité privée aux services AWS               |

Modèles d'examen clés :

- « Réduire la latence des utilisateurs mondiaux accédant à des réponses d'API dynamiques » → Global Accelerator (pas CloudFront, qui est optimal pour le contenu pouvant être mis en cache)
- « Réduire la latence des ressources statiques à l'échelle mondiale » → CloudFront
- « Connectivité privée constante à AWS depuis un site » → Direct Connect
- « Téléversement rapide depuis des clients du monde entier vers votre compartiment S3 » → S3 Transfer Acceleration

---

**Tâche 3.5 — Déterminer des solutions performantes d'ingestion et de transformation de données**

Concepts fondamentaux : Kinesis Data Streams, Amazon Data Firehose, Glue, Athena, EMR.

| Chapitre    | Sujet                                                               |
|-------------|---------------------------------------------------------------------|
| Chapitre 26 | Kinesis Data Streams : traitement d'événements ordonnés en temps réel |
| Chapitre 26 | Amazon Data Firehose (ex-Kinesis Data Firehose) : livraison gérée vers S3, Redshift, OpenSearch |
| Chapitre 26 | AWS Glue : ETL sans serveur, Data Catalog, Crawlers                  |
| Chapitre 26 | Athena : SQL sans serveur sur S3                                     |
| Chapitre 26 | QuickSight : tableaux de bord BI gérés, moteur en mémoire SPICE      |
| Chapitre 26 | Lake Formation : contrôle d'accès à granularité fine au lac de données |

Modèles d'examen clés :

- « Traiter des données de flux de clics en temps réel » → Kinesis Data Streams + Lambda ou Managed Service for Apache Flink (anciennement Kinesis Data Analytics)
- « Livrer des données en flux vers S3 pour une analyse ultérieure » → Amazon Data Firehose
- « Transformer et cataloguer des données provenant de plusieurs sources » → AWS Glue
- « Interroger avec SQL des données historiques stockées dans S3 » → Athena

---

## Domaine 4 : Concevoir des architectures optimisées en coûts (20 %)

**Tâche 4.1 — Concevoir des solutions de stockage optimisées en coûts**

| Chapitre    | Sujet                                                              |
|-------------|--------------------------------------------------------------------|
| Chapitre 23 | Politiques de cycle de vie S3, transitions de classe de stockage   |
| Chapitre 28 | Dimensionnement adéquat d'EBS, migration gp2→gp3, règles de cycle de vie de gestion des versions S3 |
| Chapitre 28 | EFS Intelligent-Tiering, balises de répartition des coûts, AWS Budgets |

Modèles d'examen clés :

- « Identifier quelle équipe génère le plus de coûts S3 » → balises de répartition des coûts + Cost Explorer
- « Réduire automatiquement les coûts des objets rarement consultés » → S3 Intelligent-Tiering
- « Alerter lorsque les coûts mensuels dépassent 10 000 $ » → AWS Budgets

---

**Tâche 4.2 — Concevoir des solutions de calcul optimisées en coûts**

| Chapitre    | Sujet                                                                            |
|-------------|----------------------------------------------------------------------------------|
| Chapitre 2  | Outposts : rack AWS sur site (arbitrage coût d'investissement vs opex cloud)      |
| Chapitre 2  | Wavelength : calcul en périphérie 5G (partenariat télécom, placement motivé par la latence) |
| Chapitre 27 | Tarification EC2 : À la demande, Reserved Instances, Savings Plans, Spot, Dedicated Hosts |
| Chapitre 20 | Lambda : paiement par invocation (coût d'inactivité nul)                          |

Modèles d'examen clés :

- « Réduire le coût des charges de travail de production en régime stable » → Savings Plans (plus flexibles) ou Reserved Instances
- « Minimiser le coût des tâches par lots qui peuvent être interrompues » → instances Spot
- « Traitement piloté par les événements avec coût d'inactivité nul » → Lambda

---

**Tâche 4.3 — Concevoir des solutions de base de données optimisées en coûts**

| Chapitre    | Sujet                                             |
|-------------|---------------------------------------------------|
| Chapitre 29 | DynamoDB à la demande vs provisionné + Auto Scaling |
| Chapitre 29 | Reserved Instances/Nodes RDS et ElastiCache       |
| Chapitre 29 | Gestion des instantanés RDS                        |

Modèles d'examen clés :

- « Trafic DynamoDB imprévisible » → mode de capacité à la demande
- « Trafic DynamoDB constant avec des pics connus » → provisionné + Auto Scaling
- « Réduire les coûts RDS pour une charge de travail stable » → Reserved Instances (1 ou 3 ans)

---

**Tâche 4.4 — Concevoir des architectures réseau optimisées en coûts**

| Chapitre    | Sujet                                                                                          |
|-------------|------------------------------------------------------------------------------------------------|
| Chapitre 30 | Tarification du transfert de données : entrant (gratuit), inter-AZ (0,01 $/Go), inter-région, Internet (0,09 $/Go) |
| Chapitre 30 | NAT Gateway (0,045 $/Go) vs VPC Endpoints (Gateway : gratuit ; Interface : tarifé)             |
| Chapitre 30 | CloudFront comme optimiseur de coût de transfert de données                                     |

Modèles d'examen clés :

- « EC2 dans un sous-réseau privé appelle S3 — éliminer les coûts de NAT Gateway » → S3 Gateway Endpoint (gratuit)
- « EC2 dans un sous-réseau privé appelle SQS — réduire les coûts de NAT Gateway » → SQS Interface Endpoint
- « Réduire les coûts de transfert de données pour la diffusion de contenu mondiale » → CloudFront (la mise en cache réduit les requêtes vers l'origine)

---

## Sujets transversaux

Certains sujets apparaissent dans plusieurs domaines :

| Sujet                                  | Domaines | Chapitres    |
|----------------------------------------|----------|--------------|
| Well-Architected Framework             | Tous     | 31           |
| Revues d'architecture et ADR           | Tous     | 32           |
| Raisonnement sur les compromis (« ça dépend ») | Tous | 33       |
| Conception Multi-AZ                    | 2, 3     | 7, 8, 18, 24 |
| Surveillance et observabilité          | 1, 2     | Tout au long |
| CloudFront                             | 3, 4     | 13, 30       |

---

## Liste de contrôle avant l'examen

Avant de passer le SAA-C03 :

**Domaines à forte pondération (les plus susceptibles d'apparaître)**

- [ ] Logique d'évaluation des politiques IAM (refus explicite → autorisation explicite → refus implicite)
- [ ] Composants VPC : sous-réseaux, tables de routage, IGW, NAT Gateway, groupes de sécurité, NACL
- [ ] Classes de stockage S3 et quand utiliser chacune
- [ ] RDS Multi-AZ vs réplica en lecture (basculement vs mise à l'échelle en lecture)
- [ ] SQS vs SNS vs EventBridge (pull vs push vs routage d'événements)
- [ ] Modèles de tarification EC2 : Spot pour la tolérance aux pannes, Savings Plans pour les charges de travail engagées
- [ ] Déclencheurs et simultanéité Lambda
- [ ] DynamoDB vs Aurora vs Redshift (le modèle d'accès détermine le choix)
- [ ] CloudFront : CDN pour le statique, Global Accelerator pour le dynamique

**Pièges courants**

- [ ] EBS s'attache à UNE instance ; EFS est partagé
- [ ] Les réplicas en lecture RDS servent à la mise à l'échelle en lecture, PAS au basculement automatique (c'est Multi-AZ)
- [ ] Les NACL sont sans état (nécessitent des règles entrantes et sortantes)
- [ ] Les Gateway Endpoints sont gratuits et uniquement pour S3 et DynamoDB
- [ ] Kinesis conserve et rejoue ; SQS supprime à la consommation
- [ ] « Découpler » ne signifie pas toujours SQS — la diffusion SNS et EventBridge sont aussi des modèles de découplage
- [ ] Shield Standard est gratuit et automatique ; Advanced est un abonnement payant
- [ ] ElastiCache vs MemoryDB : ElastiCache = cache (perte de données acceptable). MemoryDB = base de données primaire durable.
- [ ] Client VPN vs Site-to-Site VPN : Client VPN = appareils individuels. Site-to-Site = réseau à réseau.
- [ ] Outposts vs Wavelength : Outposts = rack AWS sur site. Wavelength = périphérie 5G.
- [ ] DMS : homogène = DMS directement. Hétérogène = SCT d'abord, puis DMS.
- [ ] DataSync déplace des *fichiers* ; DMS déplace des *bases de données* ; MGN déplace des *serveurs entiers*.

**La structure de l'examen**

- 65 questions, 130 minutes (2 heures 10 minutes)
- Choix multiple (une seule bonne réponse) et réponse multiple (sélectionner N bonnes réponses)
- Score de réussite : 720 sur 1000
- Des questions non notées sont intégrées ; vous ne pouvez pas savoir lesquelles
- Gérez votre temps : ~2 minutes par question ; marquez les questions difficiles et revenez-y
