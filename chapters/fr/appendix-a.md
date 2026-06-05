# Annexe A : Référence rapide des services AWS

Chaque service couvert dans ce livre, dans l'ordre d'introduction. Utilisez ceci comme référence d'étude et de consultation rapide lors de la préparation à l'examen.

---

## Calcul

**EC2 — Elastic Compute Cloud** *(Chapitre 4)*

Machines virtuelles dans le cloud. Vous choisissez le type d'instance (CPU, mémoire, stockage), le système d'exploitation et la région. Vous payez à l'heure (À la demande), à l'engagement (Reserved Instances / Savings Plans) ou par créneau de capacité libre (Spot). La primitive de calcul fondamentale.

Concepts clés : AMI (Amazon Machine Image), types d'instance (familles t3, m6g, r6g, c6g), paires de clés, profils d'instance, groupes de placement.

Signal d'examen : Quand un scénario nécessite un calcul persistant, avec état ou de longue durée → EC2 ou ECS. Quand un scénario nécessite un calcul de courte durée, déclenché par des événements ou à coût d'inactivité zéro → Lambda.

---

**Auto Scaling + Application Load Balancer** *(Chapitre 7)*

Les groupes Auto Scaling (ASG) ajoutent et suppriment des instances EC2 en fonction de la charge. Les Application Load Balancers (ALB) distribuent le trafic entre les instances et routent par chemin ou hôte. Ensemble, ils forment la couche de mise à l'échelle horizontale.

Concepts clés : Modèle de lancement, politiques de mise à l'échelle (suivi de cible, par étapes, planifiée), vérifications de santé, groupes cibles ALB, règles d'écouteur, routage pondéré.

Signal d'examen : « Gérer une charge variable » ou « haute disponibilité sur plusieurs AZ » → ASG + ALB.

---

**Lambda** *(Chapitre 20)*

Fonctions sans serveur. Vous écrivez du code ; AWS l'exécute en réponse à des événements. Pas de serveurs à gérer. Vous payez par invocation et par milliseconde d'exécution. S'adapte automatiquement à des milliers d'exécutions simultanées.

Concepts clés : Sources d'événements (API Gateway, S3, SQS, EventBridge, Kinesis), rôle d'exécution, limites de simultanéité, simultanéité réservée et provisionnée, démarrage à froid, couches, durée maximale de 15 minutes.

Signal d'examen : « Sans serveur », « piloté par les événements », « tâches de courte durée », « pas de coût d'inactivité » → Lambda.

---

**ECS — Elastic Container Service** *(Chapitre 21)*

Exécute des conteneurs Docker sur AWS. Deux types de lancement : EC2 (vous gérez l'hôte) et Fargate (AWS gère l'hôte). ECS gère les définitions de tâches, les services, la planification du cluster et l'intégration avec les équilibreurs de charge et la découverte de services.

Concepts clés : Définition de tâche, service ECS, type de lancement Fargate vs EC2, ECR (registre de conteneurs), rôle IAM de tâche, mise à l'échelle automatique du service.

Signal d'examen : « Charges de travail conteneurisées », « microservices », « Docker sur AWS » → ECS (généralement Fargate pour les conteneurs sans serveur).

---

**EKS — Elastic Kubernetes Service** *(Chapitre 21)*

Kubernetes géré. AWS gère le plan de contrôle ; vous gérez les nœuds de travail (EC2 ou Fargate). Utilisez EKS quand votre équipe utilise déjà Kubernetes ou a des charges de travail nécessitant des fonctionnalités spécifiques à Kubernetes.

Signal d'examen : « Kubernetes », « besoin de migrer des charges de travail K8s existantes » → EKS. « Juste besoin de conteneurs sans la surcharge K8s » → ECS.

---

## Stockage

**S3 — Simple Storage Service** *(Chapitre 5)*

Stockage d'objets. Capacité illimitée, durabilité de 99,999999999 % (onze neuf). Stocke les fichiers sous forme d'objets dans des compartiments. Les compartiments vivent dans une région. Les objets peuvent aller de 0 octets à 5 To.

Concepts clés : Politique de compartiment, ACL d'objet, versionnage, hébergement de site web statique, URL pré-signées, téléchargement multi-parties, Transfer Acceleration, classes de stockage (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive).

Signal d'examen : « Stocker et récupérer des fichiers », « ressources statiques », « sauvegardes », « lac de données » → S3. La bonne classe de stockage dépend de la fréquence d'accès et de la vitesse de récupération.

---

**EBS — Elastic Block Store** *(Chapitre 6)*

Stockage par blocs attaché à une seule instance EC2. Se comporte comme un disque dur. Persiste indépendamment du cycle de vie de l'instance (vous pouvez le détacher et le réattacher). Types les plus courants : gp3 (SSD à usage général, la valeur par défaut), io2 (IOPS provisionnés pour les bases de données), st1 (HDD optimisé pour le débit pour les lectures séquentielles).

Concepts clés : Instantanés (incrémentiels, stockés dans S3), chiffrement (KMS), multi-attachement (io1/io2 uniquement), provisionnement des IOPS et du débit.

Signal d'examen : « Stockage persistant pour EC2 », « stockage de base de données », « nécessite un accès par blocs à faible latence » → EBS.

---

**EFS — Elastic File System** *(Chapitre 6)*

Système de fichiers partagé, accessible depuis plusieurs instances EC2 simultanément. Protocole NFS. S'adapte automatiquement. Plus cher qu'EBS par Go. Deux classes de stockage : Standard et Accès peu fréquent. Intelligent-Tiering déplace les fichiers automatiquement.

Signal d'examen : « Système de fichiers partagé », « plusieurs instances EC2 ont besoin des mêmes fichiers », « NFS » → EFS.

---

**Classes de stockage S3 et politiques de cycle de vie** *(Chapitre 23)*

S3 Intelligent-Tiering déplace automatiquement les objets entre les niveaux d'accès en fonction de la fréquence d'accès. Les politiques de cycle de vie font passer les objets entre les classes (Standard → Standard-IA → Glacier) en fonction de règles d'âge. Les classes de stockage Glacier ont des délais de récupération allant de quelques minutes (Glacier Instant) à 12 heures (Glacier Deep Archive).

Signal d'examen : « Réduire les coûts de stockage pour les données peu consultées » → politiques de cycle de vie, Intelligent-Tiering ou Glacier.

---

## Bases de données

**RDS — Relational Database Service** *(Chapitre 8)*

Bases de données relationnelles gérées. Moteurs pris en charge : MySQL, PostgreSQL, MariaDB, Oracle, SQL Server et Aurora (moteur propriétaire AWS). AWS gère les sauvegardes, les correctifs, le basculement et la réplication. Vous gérez la conception du schéma, les requêtes et le dimensionnement des instances.

Concepts clés : Déploiement Multi-AZ (basculement automatique, réplication synchrone), répliques en lecture (asynchrones, pour la mise à l'échelle en lecture), sauvegardes automatisées (rétention 1-35 jours), instantanés manuels (conservés jusqu'à suppression), RDS Proxy (pool de connexions).

Signal d'examen : « Base de données relationnelle », « transactions ACID », « charge de travail SQL existante » → RDS ou Aurora.

---

**Aurora** *(Chapitre 24)*

Moteur de base de données relationnelle AWS, compatible avec MySQL et PostgreSQL. Moteur de stockage distribué qui réplique les données sur 3 AZ en 6 copies. Généralement 5x plus rapide que MySQL. Aurora Serverless v2 met à l'échelle la capacité automatiquement (mesuré en ACU — Aurora Capacity Units).

Concepts clés : Cluster Aurora (point de terminaison d'écriture + jusqu'à 15 points de terminaison de lecture), Aurora Global Database (répliques en lecture inter-régions avec un délai de réplication inférieur à 1 seconde), Aurora Serverless v2.

Signal d'examen : « Base de données relationnelle haute performance », « compatible MySQL/PostgreSQL », « lectures mondiales », « charge de travail variable » → Aurora.

---

**DynamoDB** *(Chapitre 9)*

Base de données NoSQL entièrement gérée. Modèle clé-valeur et document. Passe à l'échelle à n'importe quel débit avec des performances à un chiffre de milliseconde. Deux modes de capacité : à la demande (paiement par requête) et provisionné (paiement par unité de capacité par heure, avec Auto Scaling).

Concepts clés : Clé de partition (obligatoire), clé de tri (optionnelle), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (capture de données de modification), DynamoDB Accelerator (DAX) — cache en mémoire, TTL (durée de vie), transactions.

Signal d'examen : « Accès clé-valeur à haut débit », « schéma flexible », « NoSQL sans serveur » → DynamoDB.

---

**ElastiCache** *(Chapitre 10)*

Mise en cache en mémoire gérée. Deux moteurs : Redis (persistant, pub/sub, scripts Lua, structures de données) et Memcached (cache pur, plus simple, multi-thread). Utilisez pour réduire la charge de la base de données et servir les données fréquemment lues en microsecondes.

Concepts clés : Modèle cache-aside, modèle write-through, politiques d'éviction, TTL, mode cluster (Redis), Multi-AZ avec basculement automatique.

Signal d'examen : « Réduire la charge de la base de données », « latence de lecture sous-milliseconde », « gestion des sessions », « classement en temps réel » → ElastiCache Redis.

---

## Mise en réseau

**VPC — Virtual Private Cloud** *(Chapitre 11)*

Un réseau isolé dans AWS. S'étend sur toutes les AZ d'une région. Vous définissez l'espace d'adressage IP (bloc CIDR), créez des sous-réseaux (publics ou privés), configurez des tables de routage et contrôlez l'accès via des groupes de sécurité et des NACL.

Concepts clés : Sous-réseau public (route vers Internet Gateway), sous-réseau privé (route vers NAT Gateway pour le sortant), Internet Gateway (entrant + sortant vers Internet), NAT Gateway (sortant uniquement pour les instances privées), VPC Peering (connecter deux VPC), VPC Endpoints (connecter aux services AWS sans Internet).

Signal d'examen : « Réseau privé sur AWS », « isoler les ressources d'Internet », « contrôler le trafic réseau » → VPC.

---

**Groupes de sécurité et NACL** *(Chapitre 15)*

Les groupes de sécurité sont des pare-feux avec état au niveau de l'instance — règles d'autorisation uniquement, le trafic de retour est automatique. Les NACL (Network Access Control Lists) sont des pare-feux sans état au niveau du sous-réseau — nécessitent des règles entrantes et sortantes, évaluées dans l'ordre par numéro de règle.

Signal d'examen : « Bloquer une adresse IP spécifique d'accéder au sous-réseau » → règle de refus NACL. « Contrôler le trafic vers/depuis une instance » → groupe de sécurité.

---

**Route 53** *(Chapitre 12)*

Service DNS et bureau d'enregistrement de domaines AWS. Route le trafic Internet vers les ressources AWS et les points de terminaison externes. Politiques de routage : Simple, Pondéré, Basé sur la latence, Basculement, Géolocalisation, Géoproximité, Réponse à valeur multiple.

Concepts clés : Zones hébergées (publiques et privées), types d'enregistrements (A, AAAA, CNAME, Alias), vérifications de santé, Traffic Flow (éditeur visuel de politiques).

Signal d'examen : « Routage DNS », « basculement entre régions », « router en fonction de la latence ou de la localisation » → Route 53 avec la politique de routage appropriée.

---

**CloudFront** *(Chapitre 13)*

Réseau de diffusion de contenu (CDN). Met en cache le contenu dans des points de présence (400+ dans le monde). Réduit la latence pour les utilisateurs finaux. Réduit les coûts de transfert d'origine grâce à la mise en cache. S'intègre avec S3, EC2, ALB et API Gateway comme origines.

Concepts clés : Distribution, origines, comportements (routage basé sur le chemin vers les origines), TTL (contrôle du cache), invalidation du cache, URL signées et cookies signés (contrôle d'accès), Lambda@Edge et CloudFront Functions (exécution de code au point de présence), Origin Shield (réduction de la charge d'origine).

Signal d'examen : « Faible latence mondiale », « mettre en cache le contenu statique », « réduire la charge d'origine », « protéger contre les DDoS avec Shield » → CloudFront.

---

**Direct Connect et VPN** *(Chapitre 25)*

AWS Direct Connect est une connexion réseau physique dédiée depuis votre centre de données sur site vers AWS. Contourne l'Internet public. Bande passante et latence plus cohérentes. AWS Site-to-Site VPN est un tunnel chiffré sur l'Internet public — plus rapide à configurer, coût plus faible, mais performance variable.

Concepts clés : Interface virtuelle (VIF), Direct Connect Gateway (connexion à plusieurs régions), Transit Gateway (topologie réseau hub-and-spoke), redondance des tunnels VPN.

Signal d'examen : « Connexion privée dédiée à AWS » → Direct Connect. « Connexion chiffrée, configuration plus rapide » → VPN. « Connecter plusieurs VPC » → Transit Gateway.

---

**VPC Endpoints** *(Chapitre 30)*

Connectez les ressources privées aux services AWS sans utiliser l'Internet public ou NAT Gateway. Endpoints Gateway : gratuits, disponibles uniquement pour S3 et DynamoDB. Endpoints d'interface (PrivateLink) : facturés par heure + par Go, disponibles pour la plupart des services AWS.

Signal d'examen : « EC2 dans un sous-réseau privé appelle S3/DynamoDB — réduire les coûts NAT Gateway » → Gateway Endpoint (gratuit). « Connexion privée à SQS, SSM, Secrets Manager depuis un sous-réseau privé » → Interface Endpoint.

---

## Sécurité et identité

**IAM — Identity and Access Management** *(Chapitres 3 et 14)*

Contrôle qui peut faire quoi dans votre compte AWS. Utilisateurs (identifiants à long terme), Groupes (utilisateurs partageant des autorisations), Rôles (identifiants temporaires pour les services et l'accès inter-comptes), Politiques (documents JSON définissant les règles d'autorisation/refus).

Concepts clés : Principal, Action, Ressource, Condition, refus explicite > autorisation explicite > refus implicite, SCP (Politique de contrôle de service dans AWS Organizations), Limite d'autorisation, AssumeRole.

Signal d'examen : IAM est impliqué dans chaque question de sécurité. Modèle clé : les services utilisent des rôles IAM (pas des utilisateurs). L'accès inter-comptes utilise l'assumption de rôle. Moindre privilège — n'accordez que ce qui est requis.

---

**KMS — Key Management Service** *(Chapitre 16)*

Service de gestion des clés de chiffrement. Crée, stocke et contrôle les clés cryptographiques. Les clés gérées par le client (CMK) vous permettent de définir la rotation, l'utilisation et les politiques d'accès. Les clés gérées par AWS sont gérées automatiquement.

Concepts clés : Politique de clé (séparée de la politique IAM), Chiffrement enveloppé (données chiffrées avec une clé de données ; clé de données chiffrée avec la CMK), Rotation automatique des clés, Clés multi-régions, Autorisations.

Signal d'examen : « Chiffrer les données au repos », « clés de chiffrement gérées par le client », « rotation des clés » → KMS.

---

**Secrets Manager** *(Chapitre 16)*

Stocke et fait tourner automatiquement les valeurs sensibles : identifiants de base de données, clés API, jetons OAuth. S'intègre avec RDS pour la rotation automatique des mots de passe. Les applications récupèrent les secrets au moment de l'exécution via API — ne jamais coder en dur les identifiants.

Signal d'examen : « Stocker et faire tourner les identifiants de base de données », « éviter les secrets codés en dur » → Secrets Manager. « Stocker des valeurs de configuration, pas des secrets » → Parameter Store (SSM).

---

**AWS Shield** *(Chapitre 17)*

Protection DDoS. Shield Standard est automatique et gratuit — protège contre les attaques volumétriques et de protocole courantes. Shield Advanced ajoute la protection financière, une équipe de réponse DDoS 24/7 et une visibilité détaillée des attaques.

Signal d'examen : « Protéger contre les DDoS » → Shield Standard (automatique) ou Shield Advanced (entreprise, avec SLA).

---

**WAF — Web Application Firewall** *(Chapitre 17)*

Filtre le trafic HTTP/HTTPS en fonction de règles : blocages d'IP, limites de débit, modèles d'injection SQL, modèles XSS, restrictions géographiques, règles personnalisées. S'attache à CloudFront, ALB, API Gateway ou AppSync.

Signal d'examen : « Bloquer des adresses IP spécifiques », « prévenir l'injection SQL au point de présence », « limiter le débit des appels API » → WAF.

---

**GuardDuty** *(Chapitre 17)*

Service de détection des menaces. Analyse les journaux CloudTrail, les journaux de flux VPC et les journaux DNS en utilisant le ML et le renseignement sur les menaces. Détecte une activité API inhabituelle, les communications avec des IP malveillantes connues, les identifiants compromis.

Signal d'examen : « Détecter une activité inhabituelle », « identifier des identifiants IAM compromis », « surveillance continue des menaces » → GuardDuty.

---

## Messagerie et traitement d'événements

**SQS — Simple Queue Service** *(Chapitre 19)*

File de messages gérée. Les producteurs envoient des messages ; les consommateurs les lisent et les suppriment. Découple les services : l'émetteur n'a pas besoin de savoir si le récepteur est disponible. Files standard : livraison au moins une fois, ordre au mieux. Files FIFO : traitement exactement une fois, ordre strict.

Concepts clés : Délai de visibilité (message caché des autres consommateurs pendant le traitement), File de lettres mortes (DLQ) pour les messages qui échouent à répétition, Rétention des messages (4 jours par défaut, jusqu'à 14), Sondage long (réduire les réponses vides).

Signal d'examen : « Découpler les services », « tamponner les requêtes pendant les pics de charge », « traitement asynchrone » → SQS. « L'ordre est important et le traitement exactement une fois est requis » → SQS FIFO.

---

**SNS — Simple Notification Service** *(Chapitre 19)*

Service pub/sub géré. Les éditeurs envoient un message à un sujet ; tous les abonnés en reçoivent une copie. Modèle de diffusion en éventail : un message → plusieurs consommateurs. Protocoles : SQS, Lambda, HTTP/HTTPS, e-mail, SMS, push mobile.

Concepts clés : Sujet, abonnement, modèle de diffusion en éventail (SNS → plusieurs files SQS), filtrage de messages (les abonnés reçoivent uniquement les messages correspondants).

Signal d'examen : « Envoyer des notifications à plusieurs points de terminaison simultanément », « diffuser un seul événement à plusieurs consommateurs » → SNS. Modèle courant : SNS + SQS pour une diffusion en éventail durable.

---

**EventBridge** *(Chapitre 22)*

Bus d'événements pour construire des architectures pilotées par les événements. Route les événements depuis les services AWS, les partenaires SaaS et les sources personnalisées vers Lambda, SQS, SNS, Step Functions et d'autres cibles. Prend en charge les règles planifiées (cron) et la correspondance de modèles.

Signal d'examen : « Router les événements des services AWS vers des cibles », « planifier des fonctions Lambda », « orchestration pilotée par les événements » → EventBridge.

---

**Step Functions** *(Chapitre 22)*

Orchestration de flux de travail sans serveur. Coordonne les fonctions Lambda, les tâches ECS, DynamoDB, SNS, SQS et d'autres services dans des machines d'état visuelles. Gère les réessais, la gestion des erreurs, les branches parallèles et les états d'attente.

Concepts clés : Machine d'état, types d'état (Tâche, Attente, Choix, Parallèle, Map, Passage, Succès, Échec), Flux de travail standard (exactement une fois, longue durée) vs Flux de travail Express (au moins une fois, volume élevé).

Signal d'examen : « Orchestrer plusieurs fonctions Lambda », « flux de travail de longue durée avec logique de réessai », « étapes d'approbation humaine » → Step Functions.

---

**Kinesis** *(Chapitre 26)*

Diffusion de données en temps réel. Kinesis Data Streams : flux ordonné et durable d'enregistrements (comme un journal de commit distribué). Les consommateurs traitent les enregistrements ; données conservées de 24 heures à 7 jours. Kinesis Data Firehose : livraison entièrement gérée vers S3, Redshift, OpenSearch, Splunk — pas de gestion des consommateurs nécessaire.

Concepts clés : Shard (unité de débit : 1 Mo/s écriture, 2 Mo/s lecture), clé de partition (détermine l'attribution au shard), numéro de séquence, points de contrôle (KCL ou Lambda), Firehose vs Streams.

Signal d'examen : « Diffusion en temps réel », « enregistrements ordonnés », « rejouer les événements » → Kinesis Data Streams. « Livrer des données de diffusion vers S3/Redshift sans gérer les consommateurs » → Kinesis Firehose. Contraste avec SQS : Kinesis conserve et rejoue ; SQS supprime à la consommation.

---

## Analytique

**Athena** *(Chapitre 26)*

Requêtes SQL sans serveur sur les données stockées dans S3. Pas d'infrastructure à gérer. Paiement par requête (par To scanné). Meilleur avec les formats en colonnes (Parquet, ORC) et les données partitionnées.

Signal d'examen : « Interroger les données S3 avec SQL », « analytique ad hoc sur un lac de données », « pas de gestion de l'infrastructure » → Athena.

---

**Glue** *(Chapitre 26)*

Service ETL (Extraction, Transformation, Chargement) sans serveur. Les Crawlers Glue découvrent les données et mettent à jour le catalogue de données Glue. Les Jobs Glue exécutent des transformations Spark ou Python. Le catalogue de données s'intègre avec Athena, Redshift Spectrum et EMR.

Signal d'examen : « Transformer et charger des données pour l'analytique », « découvrir le schéma des données S3 », « pipeline ETL » → Glue.

---

## Haute disponibilité et reprise après sinistre

**Multi-AZ et Multi-Région** *(Chapitre 18)*

Multi-AZ : réplication synchrone au sein d'une région pour le basculement automatique (RDS Multi-AZ, équilibreur de charge sur plusieurs AZ). RPO ~0, RTO ~60 s pour RDS. Multi-Région : réplication asynchrone pour la redondance géographique et une latence plus faible pour les utilisateurs mondiaux.

Concepts clés : RTO (Recovery Time Objective — temps de récupération), RPO (Recovery Point Objective — quantité de données pouvant être perdues). Stratégies DR Veilleuse, Standby chaud, Actif-actif.

Signal d'examen : Distinguez entre les défaillances de niveau AZ (Multi-AZ gère) vs les défaillances régionales (Multi-Région gère). Le coût et la complexité augmentent considérablement avec Multi-Région.

---

## Optimisation des coûts

**Modèles de tarification EC2** *(Chapitre 27)*

À la demande : prix plein, sans engagement. Reserved Instances (1 ou 3 ans) : réduction de 30 à 72 % pour un type d'instance spécifique. Savings Plans (Compute ou EC2 Instance) : dépenses horaires engagées pour plus de flexibilité. Spot : 60 à 90 % de réduction pour les charges de travail interruptibles.

Signal d'examen : « Minimiser le coût pour une charge de travail prévisible » → Savings Plans ou Reserved Instances. « Traitement par lots tolérant aux pannes » → Spot. « Imprévisible ou court terme » → À la demande.

---

**Tarification du transfert de données** *(Chapitre 30)*

Entrant vers AWS : gratuit. Même AZ : gratuit. Inter-AZ : 0,01 $/Go dans chaque sens. Inter-région : 0,02 à 0,08 $/Go. Internet (sortant) : ~0,09 $/Go. Traitement NAT Gateway : 0,045 $/Go. Le transfert de données CloudFront est moins cher que le transfert direct EC2-vers-Internet, et la mise en cache réduit le volume total.

Signal d'examen : « Réduire les coûts de transfert de données pour S3/DynamoDB depuis un sous-réseau privé » → Gateway Endpoints (gratuits). « Réduire les coûts NAT Gateway pour d'autres services » → Interface Endpoints.

---

## Observabilité

**CloudWatch** *(référencé tout au long)*

Surveillance et observabilité. Métriques CloudWatch : données de séries chronologiques numériques depuis les services AWS et les applications personnalisées. Journaux CloudWatch : collecter, rechercher et analyser les données de journaux. Alarmes CloudWatch : déclencher des notifications ou la mise à l'échelle automatique en fonction des seuils de métriques. Tableaux de bord CloudWatch : visualiser les métriques.

Concepts clés : Dimensions de métriques, périodes de rétention, groupes et flux de journaux, filtres de métriques, agent CloudWatch (pour les métriques au niveau OS et les journaux depuis EC2), Container Insights.

---

**CloudTrail** *(référencé tout au long)*

Enregistre chaque appel API effectué dans votre compte AWS : qui l'a fait, depuis où, quand, et quelle était la réponse. La piste multi-région stocke les journaux dans S3 indéfiniment. Utilisé pour l'audit de sécurité, la conformité et l'investigation des incidents.

Signal d'examen : « Qui a supprimé cette ressource ? » « Auditer toute l'activité API » → CloudTrail.

---

**AWS Config** *(référencé au Chapitre 31)*

Suit les changements de configuration des ressources au fil du temps. Évalue les ressources par rapport aux règles de conformité. Enregistre l'historique de chaque changement de configuration pour chaque ressource. S'intègre avec Systems Manager pour la remédiation.

Signal d'examen : « Cette ressource est-elle conforme à notre politique de sécurité ? » « À quoi ressemblait la configuration de cette ressource la semaine dernière ? » → AWS Config.

---

## Well-Architected

**Les six piliers** *(Chapitre 31)*

| Pilier                     | Question principale                         | Services clés                                      |
|----------------------------|---------------------------------------------|----------------------------------------------------|
| Excellence opérationnelle  | Fonctionnons-nous bien ?                    | CloudWatch, CloudTrail, SSM, Config                |
| Sécurité                   | Sommes-nous protégés ?                      | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager  |
| Fiabilité                  | Récupérons-nous des défaillances ?          | Multi-AZ, basculement Route 53, sauvegarde/restauration, SQS |
| Efficacité des performances | Utilisons-nous les bonnes ressources ?     | Redimensionnement, Auto Scaling, CloudFront, Kinesis |
| Optimisation des coûts     | Dépensons-nous judicieusement ?             | Savings Plans, Spot, cycle de vie S3, VPC Endpoints |
| Durabilité                 | Minimisons-nous notre impact environnemental ? | Redimensionnement, Graviton, niveaux de stockage efficaces |

AWS Well-Architected Tool : évalue votre architecture par rapport aux six piliers. Utilisez-le avant l'examen pour comprendre le raisonnement derrière les questions de chaque pilier.
