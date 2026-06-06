# Annexe A : Référence rapide des services AWS

Chaque service couvert dans ce livre, dans l'ordre d'introduction. Utilisez ceci comme référence d'étude et de consultation rapide lors de la préparation à l'examen.

---

## Calcul

**EC2 — Elastic Compute Cloud** *(Chapitre 4)*

Machines virtuelles dans le cloud. Vous choisissez le type d'instance (CPU, mémoire, stockage), le système d'exploitation et la région. Vous payez à l'heure (À la demande), à l'engagement (Reserved Instances / Savings Plans) ou par créneau de capacité libre (Spot). La primitive de calcul fondamentale.

Concepts clés : AMI (Amazon Machine Image), types d'instance (familles t3, m6g, r6g, c6g), paires de clés, profils d'instance, groupes de placement.

Signal d'examen : Quand un scénario nécessite un calcul persistant, avec état ou de longue durée → EC2 ou ECS. Quand un scénario nécessite un calcul de courte durée, déclenché par des événements ou à coût d'inactivité nul → Lambda.

---

**Auto Scaling + Application Load Balancer** *(Chapitre 7)*

Les groupes Auto Scaling (ASG) ajoutent et suppriment des instances EC2 en fonction de la charge. Les Application Load Balancers (ALB) distribuent le trafic entre les instances et routent par chemin ou par hôte. Ensemble, ils forment la couche de mise à l'échelle horizontale.

Concepts clés : Modèle de lancement, politiques de mise à l'échelle (suivi de cible, par étapes, planifiée), vérifications de santé, groupes cibles ALB, règles d'écouteur, routage pondéré.

Signal d'examen : « Gérer une charge variable » ou « haute disponibilité sur plusieurs AZ » → ASG + ALB.

---

**Lambda** *(Chapitre 20)*

Fonctions sans serveur. Vous écrivez du code ; AWS l'exécute en réponse à des événements. Pas de serveurs à gérer. Vous payez par invocation et par milliseconde d'exécution. S'adapte automatiquement à des milliers d'exécutions simultanées.

Concepts clés : Sources d'événements (API Gateway, S3, SQS, EventBridge, Kinesis), rôle d'exécution, limites de simultanéité, simultanéité réservée et provisionnée, démarrage à froid, Layers, durée maximale de 15 minutes.

Signal d'examen : « Sans serveur », « piloté par les événements », « tâches de courte durée », « pas de coût d'inactivité » → Lambda.

---

**ECS — Elastic Container Service** *(Chapitre 21)*

Exécute des conteneurs Docker sur AWS. Deux types de lancement : EC2 (vous gérez l'hôte) et Fargate (AWS gère l'hôte). ECS gère les définitions de tâches, les services, la planification du cluster et l'intégration avec les équilibreurs de charge et la découverte de services.

Concepts clés : Définition de tâche, service ECS, type de lancement Fargate vs EC2, ECR (registre de conteneurs), rôle IAM de tâche, mise à l'échelle automatique du service.

Signal d'examen : « Charges de travail conteneurisées », « microservices », « Docker sur AWS » → ECS (généralement Fargate pour les conteneurs sans serveur).

---

**EKS — Elastic Kubernetes Service** *(Chapitre 21)*

Kubernetes géré. AWS gère le plan de contrôle ; vous gérez les nœuds de travail (EC2 ou Fargate). Utilisez EKS quand votre équipe utilise déjà Kubernetes ou a des charges de travail nécessitant des fonctionnalités spécifiques à Kubernetes.

Signal d'examen : « Kubernetes », « besoin de migrer des charges de travail K8s existantes » → EKS. « Juste besoin de conteneurs sans la surcharge de K8s » → ECS.

---

**AWS Batch** *(Chapitre 21)*

Calcul par lots géré pour les conteneurs Docker. Vous définissez une tâche (image Docker + commande), une file de tâches et un environnement de calcul (EC2 ou Fargate). AWS Batch provisionne et met à l'échelle le calcul automatiquement, puis le termine lorsque la tâche est achevée. Prend en charge les instances Spot pour réduire les coûts.

Concepts clés : Définition de tâche (ce qu'il faut exécuter), file de tâches (où les tâches attendent), environnement de calcul (EC2 ou Fargate, À la demande ou Spot), tâches en tableau (exécuter de nombreuses copies parallèles de la même tâche).

Signal d'examen : « Traitement par lots qui dépasse le délai de 15 minutes de Lambda », « tâches de calcul finies sur conteneurs », « charges de travail HPC sur AWS » → AWS Batch.

---

**AWS Outposts** *(Chapitre 2)*

Un rack entièrement géré de matériel AWS installé dans votre propre centre de données ou installation de colocation. Exécute les mêmes services, API et outils AWS que le cloud public (EC2, EBS, RDS, EKS, S3 sur Outposts) mais physiquement sur site.

Concepts clés : Mêmes API AWS sur site, AWS gère l'installation et les correctifs, le client fournit l'espace rack et l'alimentation, Local Gateway (LGW) connecte Outposts aux réseaux sur site.

Signal d'examen : « Exécuter AWS dans votre propre centre de données », « la résidence des données exige que le calcul reste sur site », « API AWS sans dépendance à Internet » → Outposts.

---

**AWS Wavelength** *(Chapitre 2)*

Infrastructure AWS déployée à l'intérieur des réseaux des fournisseurs de télécommunications 5G. Les Wavelength Zones se trouvent à la périphérie du réseau 5G, permettant une latence de l'ordre de quelques millisecondes vers les appareils mobiles.

Concepts clés : Les Wavelength Zones sont des extensions des régions AWS au sein des réseaux de télécommunications, le trafic reste sur le réseau de l'opérateur entre l'appareil et la Wavelength Zone.

Signal d'examen : « Latence de quelques millisecondes vers les utilisateurs mobiles 5G », « AR/VR mobile », « jeu en temps réel sur mobile », « télémétrie de véhicules autonomes » → Wavelength.

---

**AWS Application Migration Service (MGN)** *(Chapitre 25)*

Service de migration par réhébergement (lift-and-shift). Un agent réplique les disques des serveurs source bloc par bloc dans une zone de transit à faible coût sur AWS ; vous lancez des copies de test à la demande ; au basculement, MGN convertit les serveurs répliqués en instances EC2 natives. Aucune modification d'application requise.

Concepts clés : Réplication continue au niveau bloc, zone de transit, lancements de test avant le basculement, les stratégies de migration des « 7 R » (MGN = réhébergement).

Signal d'examen : « Migrer rapidement des centaines de VM sans modification de code », « lift-and-shift de serveurs vers EC2 » → MGN. DataSync déplace des *fichiers* ; DMS déplace des *bases de données* ; MGN déplace des *serveurs entiers*.

---

## Stockage

**S3 — Simple Storage Service** *(Chapitre 5)*

Stockage d'objets. Capacité illimitée, durabilité de 99,999999999 % (onze neuf). Stocke les fichiers sous forme d'objets dans des compartiments (buckets). Les compartiments résident dans une région. Les objets peuvent aller de 0 octet à 5 To.

Concepts clés : Politique de compartiment, ACL d'objet, gestion des versions, hébergement de site web statique, URL présignées, téléversement multipart, Transfer Acceleration, classes de stockage (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive, plus S3 Express One Zone pour les charges de travail à compartiment-répertoire mono-AZ et à latence critique).

Signal d'examen : « Stocker et récupérer des fichiers », « ressources statiques », « sauvegardes », « lac de données » → S3. La bonne classe de stockage dépend de la fréquence d'accès et de la vitesse de récupération.

---

**EBS — Elastic Block Store** *(Chapitre 6)*

Stockage en bloc attaché à une seule instance EC2. Agit comme un disque dur. Persiste indépendamment du cycle de vie de l'instance (vous pouvez le détacher et le rattacher). Types les plus courants : gp3 (SSD à usage général, par défaut), io2 (IOPS provisionnés pour les bases de données), st1 (HDD optimisé pour le débit pour les lectures séquentielles).

Concepts clés : Instantanés (incrémentiels, stockés dans S3), chiffrement (KMS), Multi-Attach (io1/io2 uniquement), provisionnement des IOPS et du débit.

Signal d'examen : « Stockage persistant pour EC2 », « stockage de base de données », « nécessite un accès en bloc à faible latence » → EBS.

---

**EFS — Elastic File System** *(Chapitre 6)*

Système de fichiers partagé, accessible depuis plusieurs instances EC2 simultanément. Protocole NFS. S'adapte automatiquement. Plus cher qu'EBS par Go. Les classes de stockage incluent Standard, Infrequent Access et Archive. Intelligent-Tiering déplace les fichiers automatiquement.

Signal d'examen : « Système de fichiers partagé », « plusieurs instances EC2 ont besoin des mêmes fichiers », « NFS » → EFS.

---

**Famille FSx** *(Chapitre 6)*

Serveurs de fichiers gérés pour des technologies nommées. FSx for Windows File Server : protocole SMB, NTFS, intégration Active Directory, Multi-AZ. FSx for Lustre : système de fichiers parallèle haute performance pour HPC/ML, présente les objets S3 comme des fichiers (chargement paresseux). FSx for NetApp ONTAP : multi-protocole (NFS + SMB + iSCSI), instantanés, réplication SnapMirror. FSx for OpenZFS : NFS à faible latence, instantanés instantanés et clones inscriptibles.

Signal d'examen : « SMB/Active Directory » → FSx for Windows. « Entraînement HPC/ML sur des données S3 » → FSx for Lustre. « NFS et SMB sur les mêmes données / migration NetApp » → FSx for ONTAP. « Migration ZFS / clones instantanés » → FSx for OpenZFS.

---

**Classes de stockage S3 et politiques de cycle de vie** *(Chapitre 23)*

S3 Intelligent-Tiering déplace automatiquement les objets entre les niveaux d'accès en fonction de la fréquence d'accès. Les politiques de cycle de vie font transiter les objets entre les classes (Standard → Standard-IA → Glacier) selon des règles d'ancienneté. Les classes de stockage Glacier ont un délai de récupération allant de quelques minutes (Glacier Instant) à 12 heures (Glacier Deep Archive).

Signal d'examen : « Réduire les coûts de stockage des données rarement consultées » → politiques de cycle de vie, Intelligent-Tiering ou Glacier.

---

**AWS Storage Gateway** *(Chapitre 6)*

Service de stockage hybride reliant les environnements sur site au stockage AWS. Présente le stockage via les protocoles que les applications comprennent déjà tout en conservant les données dans S3, S3 Glacier ou sous forme d'instantanés EBS.

Concepts clés : File Gateway (NFS/SMB → S3), Volume Gateway (iSCSI, mode mis en cache ou stocké), Tape Gateway (bibliothèque de bandes virtuelles → Glacier).

Signal d'examen : « Une application sur site a besoin de stockage cloud sans modification de code » → Storage Gateway. « Remplacer la sauvegarde sur bande » → Tape Gateway.

---

**AWS DataSync** *(Chapitre 25)*

Service de migration et de réplication de données basé sur un agent. Un agent léger se connecte aux serveurs de fichiers sur site via NFS ou SMB et synchronise les partages vers S3, EFS ou FSx — avec planification, limitation de bande passante et vérification d'intégrité intégrées.

Concepts clés : Agent DataSync (VM sur site ou EC2), sources NFS/SMB, destinations S3/EFS/FSx, transferts incrémentiels planifiés.

Signal d'examen : « Migrer ou synchroniser en continu un grand nombre de fichiers depuis un NAS sur site vers AWS via le réseau » → DataSync.

---

**AWS Transfer Family** *(Chapitre 25)*

Serveur SFTP, FTPS et FTP entièrement géré, adossé à S3 ou EFS comme destination de stockage. Les clients se connectent avec leur logiciel SFTP existant ; les fichiers téléversés atterrissent directement dans un compartiment ou un système de fichiers.

Concepts clés : Point de terminaison géré (éventuellement avec IP statique), stockage adossé à S3 ou EFS, compatibilité avec les protocoles existants pour les partenaires externes.

Signal d'examen : « Les partenaires doivent continuer à téléverser via SFTP, mais les fichiers doivent atterrir dans S3 » → Transfer Family.

---

**AWS Snow Family** *(Chapitre 25)*

Dispositifs physiques de transfert de données pour la migration en masse hors ligne. Snowball Edge Storage Optimized : 80 To utilisables, boîtier renforcé, expédié à votre emplacement ; vous chargez les données localement et le renvoyez pour ingestion dans S3.

Concepts clés : Faites d'abord le calcul du transfert — si le transfert réseau prendrait environ une semaine ou plus, un dispositif physique l'emporte. *Note héritée (2026)* : AWS a entrepris de retirer la famille — Snowmobile (2024) et Snowcone (fin 2024) ont disparu, et les dispositifs Snow ont été fermés aux nouveaux clients en novembre 2025 (AWS oriente désormais vers DataSync et les Data Transfer Terminals). La banque de questions du SAA-C03 est antérieure à cela, donc l'examen attend toujours Snowball comme réponse.

Signal d'examen : « Migration à l'échelle du pétaoctet », « bande passante limitée, des semaines de temps de transfert » → Snow Family.

---

**AWS Backup** *(Chapitres 18 et 23)*

Service de sauvegarde centralisé et basé sur des politiques, couvrant EBS, RDS, DynamoDB, EFS et Storage Gateway. Les plans de sauvegarde définissent les calendriers et la rétention ; les coffres-forts stockent les points de récupération.

Concepts clés : Plans et coffres-forts de sauvegarde, copies inter-régions et inter-comptes, Vault Lock pour l'immuabilité.

Signal d'examen : « Centraliser et automatiser les sauvegardes sur plusieurs services AWS », « copies de sauvegarde inter-comptes pour la protection contre les rançongiciels/compromission de compte » → AWS Backup.

---

## Bases de données

**RDS — Relational Database Service** *(Chapitre 8)*

Bases de données relationnelles gérées. Moteurs pris en charge : MySQL, PostgreSQL, MariaDB, Oracle, SQL Server et Aurora (le moteur propriétaire d'AWS). AWS gère les sauvegardes, les correctifs, le basculement et la réplication. Vous gérez la conception du schéma, les requêtes et le dimensionnement de l'instance.

Concepts clés : Déploiement Multi-AZ (basculement automatique, réplication synchrone), réplicas en lecture (asynchrones, pour la mise à l'échelle en lecture), sauvegardes automatisées (rétention de 1 à 35 jours), instantanés manuels (conservés jusqu'à suppression), RDS Proxy (regroupement de connexions).

Signal d'examen : « Base de données relationnelle », « transactions ACID », « charge de travail SQL existante » → RDS ou Aurora.

---

**Aurora** *(Chapitre 24)*

Le moteur de base de données relationnelle d'AWS, compatible avec MySQL et PostgreSQL. Moteur de stockage distribué qui réplique les données sur 3 AZ en 6 copies. Généralement 5 fois plus rapide que MySQL. Aurora Serverless v2 met à l'échelle la capacité automatiquement (mesurée en ACU — Aurora Capacity Units) et, sur les versions de moteur prises en charge, peut se mettre en pause automatiquement à 0 ACU lorsqu'aucune connexion n'est maintenue ouverte.

Concepts clés : Cluster Aurora (writer + jusqu'à 15 réplicas Aurora derrière un point de terminaison de lecture unique), Aurora Global Database (réplicas en lecture inter-régions avec un décalage de réplication < 1 seconde), Aurora Serverless v2, ACU, comportement de pause/reprise automatique.

Signal d'examen : « Base de données relationnelle haute performance », « compatible MySQL/PostgreSQL », « lectures globales », « charge de travail variable » → Aurora.

---

**DynamoDB** *(Chapitre 9)*

Base de données NoSQL entièrement gérée. Modèle clé-valeur et document. S'adapte à tout débit avec des performances de l'ordre de la milliseconde. Deux modes de capacité : à la demande (paiement par requête) et provisionné (paiement par unité de capacité par heure, avec Auto Scaling).

Concepts clés : Clé de partition (obligatoire), clé de tri (facultative), Global Secondary Index (GSI), Local Secondary Index (LSI), DynamoDB Streams (capture des données de modification), DynamoDB Accelerator (DAX) — cache en mémoire, TTL (Time to Live), transactions.

Signal d'examen : « Accès basé sur des clés à haut débit », « schéma flexible », « NoSQL sans serveur » → DynamoDB.

---

**ElastiCache** *(Chapitre 10)*

Mise en cache en mémoire gérée. Deux moteurs : Redis (persistant, pub/sub, scripts Lua, structures de données) et Memcached (cache pur, plus simple, multithread). À utiliser pour réduire la charge de la base de données et servir en microsecondes les données fréquemment lues.

Concepts clés : Modèle cache-aside, modèle write-through, politiques d'éviction, TTL, mode cluster (Redis), Multi-AZ avec basculement automatique.

Signal d'examen : « Réduire la charge de la base de données », « latence de lecture inférieure à la milliseconde », « gestion de session », « classement en temps réel » → ElastiCache Redis.

---

**Amazon MemoryDB for Redis** *(Chapitre 10)*

Base de données primaire en mémoire, durable et compatible Redis. Contrairement à ElastiCache (qui est un cache où la perte de données est acceptable), MemoryDB stocke un journal des transactions Multi-AZ et garantit la durabilité. Vous pouvez utiliser MemoryDB comme base de données primaire — pas seulement comme cache devant une autre base de données.

Concepts clés : Compatibilité de l'API Redis, journal des transactions Multi-AZ (garantie de durabilité), performances en mémoire, base de données primaire (pas une couche de cache).

Signal d'examen : « Compatible Redis ET la perte de données n'est pas acceptable », « base de données durable en mémoire » → MemoryDB. « Redis comme cache, perte de données acceptable » → ElastiCache Redis.

---

**Bases de données à usage spécifique** *(Chapitres 9, 10 et 24)*

Faites correspondre la forme des données au moteur. DocumentDB : documents compatibles MongoDB. Neptune : base de données graphe (relations, parcours — Gremlin/SPARQL). Keyspaces : colonnes larges compatibles Cassandra. Timestream : séries temporelles (offre actuelle : Timestream for InfluxDB). MemoryDB : base de données *primaire* durable compatible Redis (vs ElastiCache = cache). QLDB (« registre cryptographique immuable ») a été abandonné en 2025 — à traiter comme un distracteur hérité.

Signal d'examen : « graphe social / recommandations / réseaux de fraude » → Neptune. « MongoDB » → DocumentDB. « Cassandra » → Keyspaces. « Télémétrie IoT dans le temps » → Timestream.

---

**AWS DMS — Database Migration Service** *(Chapitre 8)*

Migre les bases de données vers AWS avec un temps d'arrêt minimal. Prend en charge le chargement complet (copie initiale) plus la CDC (Change Data Capture) pour maintenir la source et la cible synchronisées pendant l'exécution de la migration. Lors d'une migration entre le même type de moteur (MySQL → MySQL, PostgreSQL → PostgreSQL), utilisez DMS directement. Lors d'une migration entre des types de moteurs différents (Oracle → Aurora PostgreSQL), utilisez d'abord l'AWS Schema Conversion Tool (SCT) pour convertir le schéma, puis DMS pour les données.

Concepts clés : Instance de réplication, points de terminaison source et cible, chargement complet + CDC, SCT (Schema Conversion Tool) pour les migrations hétérogènes.

Signal d'examen : « Migrer une base de données avec un temps d'arrêt minimal » → DMS. « Oracle vers Aurora » ou toute migration hétérogène → SCT + DMS. « Même moteur, même type » → DMS directement.

---

## Réseau

**VPC — Virtual Private Cloud** *(Chapitre 11)*

Un réseau isolé au sein d'AWS. S'étend sur toutes les AZ d'une région. Vous définissez l'espace d'adressage IP (bloc CIDR), créez des sous-réseaux (publics ou privés), configurez les tables de routage et contrôlez l'accès via des groupes de sécurité et des NACL.

Concepts clés : Sous-réseau public (route vers Internet Gateway), sous-réseau privé (route vers NAT Gateway pour le sortant), Internet Gateway (entrant + sortant vers Internet), NAT Gateway (sortant uniquement pour les instances privées), VPC Peering (connecter deux VPC), VPC Endpoints (se connecter aux services AWS sans Internet).

Signal d'examen : « Réseau privé sur AWS », « isoler les ressources d'Internet », « contrôler le trafic réseau » → VPC.

---

**Groupes de sécurité et NACL** *(Chapitre 15)*

Les groupes de sécurité sont des pare-feux à état au niveau de l'instance — règles d'autorisation uniquement, le trafic de retour est automatique. Les NACL (Network Access Control Lists) sont des pare-feux sans état au niveau du sous-réseau — nécessitent des règles entrantes et sortantes, évaluées dans l'ordre par numéro de règle.

Signal d'examen : « Bloquer une IP spécifique d'accéder au sous-réseau » → NACL. « Contrôler le trafic vers/depuis une instance » → groupe de sécurité.

---

**Route 53** *(Chapitre 12)*

Le service DNS et registraire de domaines d'AWS. Achemine le trafic Internet vers les ressources AWS et les points de terminaison externes. Politiques de routage : Simple, Pondéré, Basé sur la latence, Basculement, Géolocalisation, Géoproximité, Réponse à valeurs multiples.

Concepts clés : Zones hébergées (publiques et privées), types d'enregistrement (A, AAAA, CNAME, Alias), vérifications de santé, Traffic Flow (éditeur visuel de politiques — notez que la géoproximité est également disponible comme politique de routage directe sur les enregistrements, avec un biais ajustable, sans nécessiter Traffic Flow).

Signal d'examen : « Routage DNS », « basculement entre régions », « router en fonction de la latence ou de l'emplacement » → Route 53 avec la politique de routage appropriée.

---

**CloudFront** *(Chapitre 13)*

Réseau de diffusion de contenu (CDN). Met en cache le contenu aux emplacements périphériques (plus de 750 points de présence dans le monde). Réduit la latence pour les utilisateurs finaux. Réduit les coûts de transfert depuis l'origine grâce à la mise en cache. S'intègre avec S3, EC2, ALB et API Gateway comme origines.

Concepts clés : Distribution, origines, comportements (routage basé sur le chemin vers les origines), TTL (contrôle du cache), invalidation du cache, URL et cookies signés (contrôle d'accès), Lambda@Edge et CloudFront Functions (exécuter du code à la périphérie), Origin Shield (réduire la charge sur l'origine).

Signal d'examen : « Faible latence globale », « mettre en cache du contenu statique », « réduire la charge sur l'origine », « se protéger contre les attaques DDoS avec Shield » → CloudFront.

---

**Direct Connect et VPN** *(Chapitre 25)*

AWS Direct Connect est une connexion réseau physique dédiée de votre centre de données sur site vers AWS. Contourne l'Internet public. Bande passante et latence plus constantes. AWS Site-to-Site VPN est un tunnel chiffré sur l'Internet public — plus rapide à mettre en place, moins coûteux, mais aux performances variables.

Concepts clés : Virtual Interface (VIF), Direct Connect Gateway (connexion à plusieurs régions), Transit Gateway (topologie réseau en étoile), redondance des tunnels VPN.

Signal d'examen : « Connexion privée dédiée à AWS » → Direct Connect. « Connexion chiffrée, mise en place plus rapide » → VPN. « Connecter plusieurs VPC » → Transit Gateway.

---

**VPC Endpoints** *(Chapitre 30)*

Connectent les ressources privées aux services AWS sans utiliser l'Internet public ni une NAT Gateway. Gateway Endpoints : gratuits, disponibles pour S3 et DynamoDB uniquement. Interface Endpoints (PrivateLink) : tarifés à l'heure + par Go, disponibles pour la plupart des services AWS.

Signal d'examen : « EC2 dans un sous-réseau privé appelle S3/DynamoDB — réduire les coûts de NAT Gateway » → Gateway Endpoint (gratuit). « Connexion privée à SQS, SSM, Secrets Manager depuis un sous-réseau privé » → Interface Endpoint.

---

**AWS Client VPN** *(Chapitre 11)*

Point de terminaison OpenVPN géré qui permet à des appareils individuels (ordinateurs portables, postes de travail) de se connecter de manière sécurisée à un VPC via Internet. Options d'authentification : Active Directory, fédération SAML 2.0 avec un fournisseur d'identité, ou TLS mutuel (basé sur des certificats). Prend en charge le split-tunnel (seul le trafic destiné au VPC passe par le tunnel) et le full-tunnel (tout le trafic est routé via AWS).

Concepts clés : Point de terminaison Client VPN, réseau cible (association de sous-réseau VPC), règles d'autorisation, split-tunnel vs full-tunnel.

Signal d'examen : « Des ingénieurs distants ont besoin d'un accès sécurisé à un VPC depuis chez eux », « connectivité d'appareil individuel vers un VPC » → Client VPN. Contraste : Site-to-Site VPN = réseau à réseau. Client VPN = appareil à réseau.

---

**Network Load Balancer (NLB) et Gateway Load Balancer (GWLB)** *(Chapitre 7)*

Le NLB opère à la couche 4 (TCP/UDP/TLS) : pas d'inspection HTTP, juste du routage de paquets à une vitesse extrême — des millions de requêtes par seconde, avec une IP statique par AZ et la préservation de l'IP source. Le GWLB opère à la couche 3 et existe dans un seul but : insérer en ligne des appliances réseau virtuelles tierces (pare-feux, IDS/IPS, inspection approfondie des paquets) dans les flux de trafic.

Concepts clés : NLB = couche 4, IP statiques, latence ultra-faible, protocoles non-HTTP. GWLB = couche 3, encapsulation GENEVE, flottes d'appliances derrière un point d'entrée unique. ALB = couche 7 (routage par chemin/hôte).

Signal d'examen : « Des millions de requêtes TCP par seconde », « IP statique pour l'équilibreur de charge », « préserver l'IP source » → NLB. « Insérer des appliances de sécurité tierces dans le chemin du trafic » → GWLB.

---

**AWS Global Accelerator** *(Chapitre 25)*

Achemine le trafic des utilisateurs sur le réseau dorsal mondial privé d'AWS à l'emplacement périphérique le plus proche, au lieu de traverser l'Internet public. Fournit deux adresses IP Anycast statiques qui servent de façade à vos ALB, NLB ou instances EC2 dans une ou plusieurs régions. Améliore la latence et la cohérence du trafic *dynamique* (non mis en cache).

Concepts clés : IP Anycast statiques, intégration périphérique au réseau dorsal AWS, basculement régional basé sur la vérification de santé en quelques secondes, groupes de points de terminaison avec cadrans de trafic.

Signal d'examen : « Utilisateurs mondiaux, trafic dynamique/non-HTTP, IP statique, basculement régional rapide » → Global Accelerator. « Contenu pouvant être mis en cache/statique » → CloudFront à la place.

---

## Sécurité et identité

**IAM — Identity and Access Management** *(Chapitres 3 et 14)*

Contrôle qui peut faire quoi dans votre compte AWS. Utilisateurs (informations d'identification à long terme), groupes (utilisateurs partageant des autorisations), rôles (informations d'identification temporaires pour les services et l'accès inter-comptes), politiques (documents JSON définissant les règles d'autorisation/refus).

Concepts clés : Principal, Action, Ressource, Condition, refus explicite > autorisation explicite > refus implicite, SCP (Service Control Policy dans AWS Organizations), Permission boundary, AssumeRole.

Signal d'examen : IAM est impliqué dans toutes les questions de sécurité. Modèle clé : les services utilisent des rôles IAM (pas des utilisateurs). L'accès inter-comptes utilise l'endossement de rôle. Moindre privilège — n'accordez que ce qui est nécessaire.

---

**KMS — Key Management Service** *(Chapitre 16)*

Service géré de clés de chiffrement. Crée, stocke et contrôle les clés cryptographiques. Les clés gérées par le client (CMK) vous permettent de définir les politiques de rotation, d'utilisation et d'accès. Les clés gérées par AWS sont gérées automatiquement.

Concepts clés : Politique de clé (distincte de la politique IAM), chiffrement par enveloppe (données chiffrées avec une clé de données ; clé de données chiffrée avec la CMK), rotation automatique des clés, clés multi-régions, octrois (grants).

Signal d'examen : « Chiffrer les données au repos », « clés de chiffrement gérées par le client », « rotation des clés » → KMS.

---

**Secrets Manager** *(Chapitre 16)*

Stocke et fait tourner automatiquement les valeurs sensibles : informations d'identification de base de données, clés d'API, jetons OAuth. S'intègre à RDS pour la rotation automatique des mots de passe. Les applications récupèrent les secrets au moment de l'exécution via l'API — ne codez jamais les informations d'identification en dur.

Signal d'examen : « Stocker et faire tourner les informations d'identification de base de données », « éviter les secrets codés en dur » → Secrets Manager. « Stocker des valeurs de configuration, pas des secrets » → Parameter Store (SSM).

---

**AWS Shield** *(Chapitre 17)*

Protection contre les attaques DDoS. Shield Standard est automatique et gratuit — protège contre les attaques volumétriques et protocolaires courantes. Shield Advanced ajoute une protection financière, une équipe de réponse DDoS 24/7 et une visibilité détaillée des attaques.

Signal d'examen : « Se protéger contre les attaques DDoS » → Shield Standard (automatique) ou Shield Advanced (entreprise, avec SLA).

---

**WAF — Web Application Firewall** *(Chapitre 17)*

Filtre le trafic HTTP/HTTPS selon des règles : blocages d'IP, limites de débit, motifs d'injection SQL, motifs XSS, restrictions géographiques, règles personnalisées. S'attache à CloudFront, ALB, API Gateway ou AppSync.

Signal d'examen : « Bloquer des adresses IP spécifiques », « empêcher l'injection SQL à la périphérie », « limiter le débit des appels d'API » → WAF.

---

**GuardDuty** *(Chapitre 17)*

Service de détection des menaces. Analyse les journaux CloudTrail, les VPC Flow Logs et les journaux DNS à l'aide du ML et du renseignement sur les menaces. Détecte l'activité API inhabituelle, la communication avec des IP malveillantes connues, les informations d'identification compromises.

Signal d'examen : « Détecter une activité inhabituelle », « identifier des informations d'identification IAM compromises », « surveillance continue des menaces » → GuardDuty.

---

**Amazon Inspector** *(Chapitre 17)*

Service automatisé d'évaluation des vulnérabilités. Analyse en continu les instances EC2, les images de conteneurs Amazon ECR et les fonctions Lambda à la recherche de vulnérabilités logicielles (CVE) et d'expositions réseau involontaires. Les résultats sont envoyés à AWS Security Hub pour une gestion centralisée.

Concepts clés : Analyse des CVE, évaluation continue (et non ponctuelle), couverture EC2 + ECR + Lambda, intégration à Security Hub.

Signal d'examen : « Analyser automatiquement EC2 à la recherche de vulnérabilités connues », « analyse des CVE pour les images de conteneurs », « évaluation continue des vulnérabilités » → Inspector.

---

**Amazon Cognito** *(Chapitre 14)*

Authentification gérée pour les utilisateurs finaux de votre application — un annuaire d'utilisateurs que vous n'avez pas à construire. Les User Pools gèrent l'inscription, la connexion, le MFA, la réinitialisation du mot de passe et les fournisseurs d'identité sociaux (Google, Facebook, tout fournisseur OIDC), en émettant des JWT que votre application valide. Les Identity Pools échangent ces jetons contre des informations d'identification AWS temporaires.

Concepts clés : User Pool (authentification, JWT) vs Identity Pool (informations d'identification AWS temporaires), interface utilisateur hébergée, fédération sociale/OIDC/SAML, autoriseur Cognito d'API Gateway.

Signal d'examen : « L'application a besoin d'inscription/connexion des utilisateurs », « connexion sociale », « donner aux utilisateurs d'une application mobile un accès temporaire aux ressources AWS » → Cognito. Contraste : IAM est pour vos ingénieurs et vos services ; Cognito est pour vos clients.

---

**AWS Certificate Manager (ACM)** *(Chapitre 16)*

Fournit des certificats TLS/SSL publics gratuits pour les services gérés par AWS (ALB, CloudFront, API Gateway) et gère l'intégralité du cycle de vie — pas de calendrier de renouvellement, pas de manipulation de clé privée. Renouvellement automatique via la validation DNS.

Concepts clés : Validation DNS vs e-mail, renouvellement automatique, les certificats pour CloudFront doivent être dans us-east-1, les certificats publics gratuits ne peuvent pas être exportés (une option exportable payante existe depuis 2025).

Signal d'examen : « HTTPS sur un équilibreur de charge ou un CDN », « renouvellement automatique des certificats » → ACM.

---

**Amazon Macie** *(Chapitre 17)*

Découverte de données sensibles pour S3. Utilise l'apprentissage automatique et la correspondance de motifs pour trouver des PII (noms, numéros de carte, informations d'identification) dans les compartiments et signale les risques d'accès comme l'exposition publique. Complète GuardDuty : GuardDuty surveille le comportement ; Macie audite ce qui est stocké.

Concepts clés : Identifiants de données gérés (motifs de PII), portée limitée à S3, résultats vers Security Hub/EventBridge.

Signal d'examen : « Découvrir des PII dans S3 », « identifier l'exposition de données sensibles » → Macie.

---

**AWS Control Tower** *(Chapitre 14)*

Automatise la configuration et la gouvernance d'un environnement multi-comptes. Crée une landing zone — comptes de gestion, d'archivage des journaux et d'audit pré-câblés avec Organizations, CloudTrail, Config et des garde-fous — en quelques minutes au lieu de plusieurs jours de câblage manuel.

Concepts clés : Landing zone, garde-fous (préventifs = SCP, détectifs = règles Config), Account Factory pour des nouveaux comptes standardisés.

Signal d'examen : « Configurer et gouverner un nouvel environnement multi-comptes avec les bonnes pratiques automatiquement » → Control Tower. Contraste : Organizations est la brique de base ; Control Tower est l'assemblage automatisé.

---

## Messagerie et traitement des événements

**SQS — Simple Queue Service** *(Chapitre 19)*

File de messages gérée. Les producteurs envoient des messages ; les consommateurs les lisent et les suppriment. Découple les services : l'expéditeur n'a pas besoin de savoir si le destinataire est disponible. Files standard : livraison au moins une fois, ordre au mieux. Files FIFO : traitement exactement une fois, ordre strict.

Concepts clés : Délai de visibilité (message masqué aux autres consommateurs pendant le traitement), Dead Letter Queue (DLQ) pour les messages qui échouent à répétition, rétention des messages (4 jours par défaut, jusqu'à 14), interrogation longue (réduire les réponses vides), charge utile maximale de 256 Ko par défaut (relevable à 1 Mio depuis 2025 ; pour des charges utiles plus importantes, l'Extended Client Library stocke le corps dans S3).

Signal d'examen : « Découpler les services », « tamponner les requêtes pendant les pics de charge », « traitement asynchrone » → SQS. « L'ordre compte et le traitement exactement une fois est requis » → SQS FIFO.

---

**SNS — Simple Notification Service** *(Chapitre 19)*

Service pub/sub géré. Les éditeurs envoient un message à un sujet (topic) ; tous les abonnés en reçoivent une copie. Modèle de diffusion (fan-out) : un message → de nombreux consommateurs. Protocoles : SQS, Lambda, HTTP/HTTPS, e-mail, SMS, push mobile.

Concepts clés : Sujet (topic), abonnement, modèle de diffusion (SNS → plusieurs files SQS), filtrage des messages (les abonnés ne reçoivent que les messages correspondants).

Signal d'examen : « Envoyer des notifications à plusieurs points de terminaison simultanément », « diffuser un seul événement à plusieurs consommateurs » → SNS. Modèle courant : SNS + SQS pour une diffusion durable.

---

**EventBridge** *(Chapitre 22)*

Bus d'événements pour la création d'architectures pilotées par les événements. Achemine les événements des services AWS, des partenaires SaaS et des sources personnalisées vers Lambda, SQS, SNS, Step Functions et d'autres cibles. Prend en charge les règles planifiées (cron) et la correspondance de motifs.

Signal d'examen : « Acheminer les événements des services AWS vers des cibles », « planifier des fonctions Lambda », « orchestration pilotée par les événements » → EventBridge.

---

**Step Functions** *(Chapitre 22)*

Orchestration de flux de travail sans serveur. Coordonne les fonctions Lambda, les tâches ECS, DynamoDB, SNS, SQS et d'autres services au sein de machines à états visuelles. Gère les nouvelles tentatives, la gestion des erreurs, les branches parallèles et les états d'attente.

Concepts clés : Machine à états, types d'états (Task, Wait, Choice, Parallel, Map, Pass, Succeed, Fail), Standard Workflows (exactement une fois, longue durée) vs Express Workflows : Asynchrones (au moins une fois, haut volume — concevoir les tâches pour qu'elles soient idempotentes) et Synchrones (au plus une fois, retourne le résultat directement comme un appel d'API).

Signal d'examen : « Orchestrer plusieurs fonctions Lambda », « flux de travail de longue durée avec logique de nouvelle tentative », « étapes d'approbation humaine » → Step Functions.

---

**Kinesis** *(Chapitre 26)*

Diffusion de données en temps réel. Kinesis Data Streams : flux durable et ordonné d'enregistrements (comme un journal de commit distribué). Les consommateurs traitent les enregistrements ; données conservées de 24 heures (par défaut) à 365 jours (avec Extended Data Retention). Amazon Data Firehose (anciennement Kinesis Data Firehose) : livraison entièrement gérée vers S3, Redshift, OpenSearch, Splunk — aucune gestion de consommateur nécessaire.

Concepts clés : Shard (unité de débit : 1 Mo/s en écriture, 2 Mo/s en lecture), clé de partition (détermine l'affectation du shard), numéro de séquence, checkpointing (KCL ou Lambda), Firehose vs Streams.

Signal d'examen : « Diffusion en temps réel », « enregistrements ordonnés », « rejouer des événements » → Kinesis Data Streams. « Livrer des données en flux vers S3/Redshift sans gérer de consommateurs » → Amazon Data Firehose (les questions plus anciennes peuvent dire « Kinesis Data Firehose »). « SQL sur des données en flux » → Amazon Managed Service for Apache Flink (anciennement Kinesis Data Analytics). Contraste avec SQS : Kinesis conserve et rejoue ; SQS supprime à la consommation.

---

**Amazon MQ** *(Chapitre 19)*

Service de courtier de messages géré prenant en charge Apache ActiveMQ et RabbitMQ. Prend en charge les protocoles de messagerie standard du secteur : AMQP, STOMP, MQTT, OpenWire et WebSocket. Le cas d'usage principal est la migration lift-and-shift de charges de travail de courtiers de messages sur site — les applications qui utilisent déjà ActiveMQ ou RabbitMQ peuvent se connecter sans modification de code.

Concepts clés : Choix du moteur ActiveMQ vs RabbitMQ, prise en charge des protocoles (AMQP/STOMP/MQTT), configuration de courtier mono-instance ou active/standby pour la HA.

Signal d'examen : « Migrer ActiveMQ ou RabbitMQ sur site vers AWS sans modifier le code de l'application » → Amazon MQ. « Messagerie native AWS en greenfield » → SQS ou SNS (plus simple, plus évolutif).

---

## Analytique

**Athena** *(Chapitre 26)*

Requêtes SQL sans serveur sur les données stockées dans S3. Aucune infrastructure à gérer. Paiement par requête (par To analysé). Optimal avec des formats en colonnes (Parquet, ORC) et des données partitionnées.

Signal d'examen : « Interroger des données S3 avec SQL », « analytique ad hoc sur un lac de données », « aucune gestion d'infrastructure » → Athena.

---

**Glue** *(Chapitre 26)*

Service ETL (Extract, Transform, Load) sans serveur. Les Glue Crawlers découvrent les données et mettent à jour le Glue Data Catalog. Les Glue Jobs exécutent des transformations Spark ou Python. Le Data Catalog s'intègre avec Athena, Redshift Spectrum et EMR.

Signal d'examen : « Transformer et charger des données pour l'analytique », « découvrir le schéma de données S3 », « pipeline ETL » → Glue.

---

**Amazon QuickSight** *(Chapitre 26)*

Service géré de business intelligence et de visualisation de données. Utilise SPICE (Super-fast, Parallel, In-memory Calculation Engine), un moteur en mémoire qui met en cache les données importées pour un rendu rapide des tableaux de bord. Se connecte à Athena, S3, Redshift, RDS et d'autres sources de données AWS. Aucun serveur BI à gérer.

Concepts clés : SPICE (moteur en mémoire), jeux de données, analyses, tableaux de bord, ML Insights (détection d'anomalies, prévisions), sécurité au niveau des lignes et des colonnes.

Signal d'examen : « Tableau de bord BI sur AWS sans gérer de serveur », « visualiser des données d'Athena ou de Redshift » → QuickSight.

---

**AWS Lake Formation** *(Chapitre 26)*

Couche de contrôle d'accès centralisée au lac de données au-dessus de S3 et du Glue Data Catalog. Fournit des autorisations à granularité fine au niveau de la table, de la colonne et de la ligne — plus granulaires que les seules politiques de compartiment S3. Simplifie la mise en place d'un lac de données sécurisé : Lake Formation gère le modèle d'autorisation ; Glue gère le catalogue ; S3 contient les données.

Concepts clés : Autorisations de lac de données (niveau table/colonne/ligne), intégration au Glue Data Catalog, LF-tags pour le contrôle d'accès basé sur les attributs, octroi/révocation centralisés pour les requêtes Athena et Redshift Spectrum.

Signal d'examen : « Contrôle d'accès à granularité fine sur un lac de données », « sécurité au niveau des colonnes ou des lignes sur des données S3 » → Lake Formation.

---

## Haute disponibilité et reprise après sinistre

**Multi-AZ et Multi-Région** *(Chapitre 18)*

Multi-AZ : réplication synchrone au sein d'une région pour un basculement automatique (RDS Multi-AZ, équilibreur de charge sur plusieurs AZ). RPO ~0, RTO ~60 s pour RDS. Multi-Région : réplication asynchrone pour la redondance géographique et une latence plus faible pour les utilisateurs mondiaux.

Concepts clés : RTO (Recovery Time Objective — combien de temps pour récupérer), RPO (Recovery Point Objective — quelle quantité de données peut être perdue). Stratégies de DR Pilot Light, Warm Standby, Active-Active.

Signal d'examen : Distinguez les pannes au niveau d'une AZ (gérées par Multi-AZ) des pannes régionales (gérées par Multi-Région). Le coût et la complexité augmentent considérablement avec le Multi-Région.

---

**AWS Elastic Disaster Recovery (DRS)** *(Chapitre 18)*

Reprise après sinistre gérée pour les serveurs (sur site ou EC2). Réplique en continu les serveurs source bloc par bloc dans une zone de transit à faible coût et lance des instances de récupération complètes en quelques minutes en cas de besoin — un pilot light géré : des temps de récupération proches du warm standby à des prix proches de la sauvegarde-restauration.

Concepts clés : Réplication continue au niveau bloc, zone de transit à faible coût, lancement de récupération à la demande, récupération à un instant donné.

Signal d'examen : « Minimiser les temps d'arrêt et la perte de données pour les charges de travail basées sur serveur avec un service de DR géré », « pilot light sans le construire vous-même » → DRS.

---

## Optimisation des coûts

**Modèles de tarification EC2** *(Chapitre 27)*

À la demande : prix complet, aucun engagement. Reserved Instances (1 ou 3 ans) : remise de 30 à 72 % pour un type d'instance spécifique. Savings Plans (Compute ou EC2 Instance) : dépense horaire engagée pour la flexibilité. Spot : 60 à 90 % de remise pour les charges de travail interruptibles.

Signal d'examen : « Minimiser le coût d'une charge de travail prévisible » → Savings Plans ou Reserved Instances. « Traitement par lots tolérant aux pannes » → Spot. « Imprévisible ou à court terme » → À la demande.

---

**Tarification du transfert de données** *(Chapitre 30)*

Entrant vers AWS : gratuit. Même AZ : gratuit. Inter-AZ : 0,01 $/Go dans chaque direction. Inter-région : 0,02 à 0,08 $/Go. Internet (sortant) : ~0,09 $/Go. Traitement NAT Gateway : 0,045 $/Go. Le transfert de données CloudFront est moins cher que le trafic direct EC2-vers-Internet, et la mise en cache réduit le volume total.

Signal d'examen : « Réduire les coûts de transfert de données pour S3/DynamoDB depuis un sous-réseau privé » → Gateway Endpoints (gratuits). « Réduire les coûts de NAT Gateway pour les autres services » → Interface Endpoints.

---

## Observabilité

**CloudWatch** *(référencé tout au long du livre)*

Surveillance et observabilité. CloudWatch Metrics : données de séries temporelles numériques provenant des services AWS et des applications personnalisées. CloudWatch Logs : collecter, rechercher et analyser les données de journaux. CloudWatch Alarms : déclencher des notifications ou une mise à l'échelle automatique en fonction de seuils de métriques. CloudWatch Dashboards : visualiser les métriques.

Concepts clés : Dimensions de métriques, périodes de rétention, groupes de journaux et flux de journaux, filtres de métriques, CloudWatch Agent (pour les métriques et journaux au niveau du système d'exploitation depuis EC2), Container Insights.

---

**CloudTrail** *(référencé tout au long du livre)*

Journalise chaque appel d'API effectué dans votre compte AWS : qui l'a effectué, depuis où, quand et quelle était la réponse. Une trace multi-régions stocke les journaux dans S3 indéfiniment. Utilisé pour l'audit de sécurité, la conformité et l'investigation d'incidents.

Signal d'examen : « Qui a supprimé cette ressource ? » « Auditer toute l'activité de l'API » → CloudTrail.

---

**X-Ray** *(Chapitre 20)*

Traçage distribué : suit les requêtes individuelles à travers les services (traces → segments → sous-segments), construit une carte de service avec la latence et les taux d'erreur par saut. L'échantillonnage maintient une faible surcharge ; les annotations rendent les traces recherchables. Le traçage actif s'active sur Lambda et sur les étapes d'API Gateway.

Signal d'examen : « Tracer les requêtes à travers les microservices », « trouver le goulot d'étranglement entre les services » → X-Ray (pas CloudWatch, pas CloudTrail).

---

**AWS Config** *(référencé au Chapitre 31)*

Suit les changements de configuration des ressources au fil du temps. Évalue les ressources par rapport aux règles de conformité. Enregistre l'historique de chaque changement de configuration pour chaque ressource. S'intègre à Systems Manager pour la remédiation.

Signal d'examen : « Cette ressource est-elle conforme à notre politique de sécurité ? » « À quoi ressemblait la configuration de cette ressource la semaine dernière ? » → AWS Config.

---

## Well-Architected

**Les six piliers** *(Chapitre 31)*

| Pilier                      | Question centrale                          | Services clés                                     |
|-----------------------------|--------------------------------------------|---------------------------------------------------|
| Excellence opérationnelle   | Fonctionnons-nous bien ?                   | CloudWatch, CloudTrail, SSM, Config               |
| Sécurité                    | Sommes-nous protégés ?                     | IAM, KMS, GuardDuty, WAF, Shield, Secrets Manager |
| Fiabilité                   | Récupérons-nous des pannes ?               | Multi-AZ, basculement Route 53, sauvegarde/restauration, SQS |
| Efficacité des performances | Utilisons-nous les bonnes ressources ?     | Dimensionnement adéquat, Auto Scaling, CloudFront, Kinesis |
| Optimisation des coûts      | Dépensons-nous judicieusement ?            | Savings Plans, Spot, cycle de vie S3, VPC Endpoints |
| Durabilité                  | Minimisons-nous l'impact environnemental ? | Dimensionnement adéquat, Graviton, niveaux de stockage efficaces |

AWS Well-Architected Tool : évalue votre architecture par rapport aux six piliers. Utilisez-le avant l'examen pour comprendre le raisonnement derrière les questions de chaque pilier.
