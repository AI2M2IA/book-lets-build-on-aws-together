# Annexe C : Registre des concepts

Chaque concept clé introduit dans le livre, associé à son chapitre, à l'analogie utilisée et au domaine SAA-C03 où il apparaît.

Utilisez ceci comme index d'étude : si vous avez un doute sur un concept avant l'examen, trouvez-le ici et revenez à son chapitre pour le contexte.

---

## A

**ACM (AWS Certificate Manager)** — Certificats TLS publics gratuits pour ALB, CloudFront et API Gateway, avec renouvellement automatique via la validation DNS. Les certificats CloudFront doivent résider dans us-east-1. Chapitre 16. Domaine 1.

**ACU (Aurora Capacity Unit)** — L'unité de mesure de la capacité Aurora Serverless v2. S'adapte automatiquement et, sur les versions de moteur prises en charge, peut se mettre en pause automatiquement à 0 ACU lorsqu'aucune connexion n'est maintenue ouverte. Chapitre 24. Domaine 3.

**Alarme (CloudWatch)** — Une règle qui se déclenche quand une métrique franchit un seuil, déclenchant une notification ou une action de mise à l'échelle automatique. Chapitre 7. Domaine 2.

**ALB (Application Load Balancer)** — Équilibreur de charge de couche 7 qui route le trafic HTTP/HTTPS en fonction des règles de chemin et d'hôte. Chapitre 7. Domaine 2.

**AMI (Amazon Machine Image)** — Un modèle contenant le système d'exploitation, les logiciels et la configuration pour une instance EC2. Chapitre 4. Domaine 3.

**État d'esprit architecte** — Demander « qu'est-ce qui casse en premier, comment le savons-nous, et que fait quelqu'un à 3h du matin ? » plutôt que seulement « comment ça fonctionne ? ». Chapitre 32, Chapitre 34. Inter-domaines.

**Architecture Decision Record (ADR)** — Un court document capturant une décision, ses alternatives, sa justification et ce qui justifierait de la reconsidérer. Chapitre 32. Inter-domaines.

**Revue d'architecture** — Un processus structuré couvrant : contraintes → inconnues → options → modes de défaillance → surveillance → runbooks. Chapitre 32. Inter-domaines.

**Athena** — Service de requêtes SQL sans serveur pour les données dans S3. Paiement par To analysé. Optimal avec les formats en colonnes Parquet/ORC. Chapitre 26. Domaine 3.

**Auto Scaling Group (ASG)** — Un groupe d'instances EC2 gérées ensemble, remplaçant automatiquement les instances défaillantes et s'adaptant en fonction de la charge. Chapitre 7. Domaines 2, 3.

**Availability Zone (AZ)** — Un ou plusieurs centres de données physiquement distincts au sein d'une région, reliés par des liaisons à faible latence. Chapitre 2. Domaine 2.

---

## B

**AWS Backup** — Sauvegarde centralisée et basée sur des politiques couvrant EBS, RDS, DynamoDB, EFS et Storage Gateway. Prend en charge les copies inter-régions et inter-comptes. Chapitres 18, 23. Domaine 2.

**AWS Batch** — Calcul par lots géré pour les conteneurs Docker. Composé d'une définition de tâche (ce qu'il faut exécuter), d'une file de tâches (où les tâches attendent) et d'un environnement de calcul (EC2 ou Fargate, À la demande ou Spot). Pour les charges de travail qui dépassent la limite de 15 minutes de Lambda. Chapitre 21. Domaine 3.

**Compartiment (S3)** — Un conteneur pour les objets S3. Les compartiments ont des noms uniques au niveau mondial et résident dans une région spécifique. Chapitre 5. Domaine 3.

**Politique de compartiment** — Une politique basée sur les ressources attachée à un compartiment S3 contrôlant l'accès pour les principaux IAM et les comptes externes. Chapitre 5. Domaine 1.

---

## C

**Modèle cache-aside** — L'application vérifie d'abord le cache ; en cas d'échec, interroge la base de données, puis stocke le résultat dans le cache. Chapitre 10. Domaine 3.

**Taux de succès du cache** — Pourcentage de requêtes servies depuis le cache plutôt que depuis l'origine. Plus c'est élevé, mieux c'est. Chapitre 13. Domaine 3.

**AWS Client VPN** — Point de terminaison OpenVPN géré. Connecte des appareils individuels (ordinateurs portables, postes de travail) à un VPC via Internet. Authentification via Active Directory, fédération SAML 2.0 avec un fournisseur d'identité, ou TLS mutuel. Prend en charge les modes split-tunnel et full-tunnel. Contraste avec Site-to-Site VPN (réseau à réseau). Chapitre 11. Domaine 1.

**CloudFront** — Le CDN d'AWS. Met en cache le contenu sur plus de 750 emplacements périphériques dans le monde. Réduit la latence et les coûts de transfert de données depuis l'origine. Chapitre 13. Domaines 3, 4.

**CloudTrail** — Journalise chaque appel d'API AWS : qui, quoi, quand, depuis où. Stocké dans S3. Utilisé pour l'audit et l'investigation d'incidents. Domaine 1.

**CloudWatch** — Métriques, journaux, alarmes et tableaux de bord pour les ressources AWS et les applications personnalisées. Référencé tout au long du livre. Tous les domaines.

**Amazon Cognito** — Authentification pour les utilisateurs finaux de votre application : les User Pools sont un annuaire d'utilisateurs géré (inscription, connexion, MFA, connexion sociale, JWT) ; les Identity Pools émettent des informations d'identification AWS temporaires. IAM est pour vos ingénieurs ; Cognito est pour vos clients. Chapitre 14. Domaine 1.

**Démarrage à froid (Lambda)** — Délai lors de la première invocation (ou après inactivité) pendant que Lambda initialise l'environnement d'exécution. Utilisez la simultanéité provisionnée pour l'éliminer. Chapitre 20. Domaine 3.

**Compute Savings Plan** — Engagement sur un montant en dollars de dépense horaire EC2, s'appliquant à tout type ou taille d'instance. Chapitre 27. Domaine 4.

**Config (AWS)** — Suit les changements de configuration des ressources AWS au fil du temps et évalue la conformité par rapport aux règles. Chapitre 31. Domaine 1.

**AWS Control Tower** — Automatise la gouvernance multi-comptes : construit une landing zone (comptes de gestion, d'archivage des journaux et d'audit) avec des garde-fous en quelques minutes — la version préfabriquée du câblage manuel d'Organizations, CloudTrail et Config. Chapitre 14. Domaine 1.

**Transfert de données inter-AZ** — Trafic entre zones de disponibilité au sein d'une région. Facturé à 0,01 $/Go dans chaque direction. Chapitre 30. Domaine 4.

**Réplication inter-régions** — Copie de données (S3 CRR, Aurora Global, DynamoDB Global Tables) vers une région différente. Entraîne des frais de transfert de données. Chapitres 18, 23, 30. Domaine 2.

---

## D

**AWS DataSync** — Migration et synchronisation, basées sur un agent, de partages de fichiers (NFS/SMB) vers S3, EFS ou FSx. « rsync sous stéroïdes, avec une console AWS. » Chapitre 25. Domaine 3.

**DAX (DynamoDB Accelerator)** — Cache en mémoire spécifiquement pour DynamoDB. Latence de lecture en microsecondes. Chapitre 9. Domaine 3.

**Dead Letter Queue (DLQ)** — Une file où sont envoyés les messages qui échouent à répétition au traitement, empêchant le blocage de la file. Chapitre 19. Domaine 2.

**AWS DMS (Database Migration Service)** — Migre les bases de données vers AWS avec un temps d'arrêt minimal. Le chargement complet (copie initiale) plus la CDC (Change Data Capture) maintient la source et la cible synchronisées pendant la migration. Migrations homogènes (même type de moteur) : utilisez DMS directement. Migrations hétérogènes (types de moteurs différents, par ex. Oracle → Aurora PostgreSQL) : utilisez d'abord le SCT (Schema Conversion Tool), puis DMS. Chapitre 8. Domaine 3.

**Dedicated Host** — Un serveur EC2 physique réservé exclusivement à votre usage. Requis pour certaines licences logicielles. Chapitre 27. Domaine 4.

**Défense en profondeur** — Superposition de plusieurs contrôles de sécurité (IAM + groupes de sécurité + NACL + WAF + GuardDuty) afin que la compromission d'une couche n'expose pas le système. Chapitre 33. Domaine 1.

**Direct Connect** — Une connexion réseau privée dédiée depuis un emplacement sur site vers AWS. Plus constante qu'un VPN. Chapitre 25. Domaine 3.

**DLQ** — Voir Dead Letter Queue.

**DynamoDB** — Base de données NoSQL entièrement gérée avec une latence de l'ordre de la milliseconde à n'importe quelle échelle. Modèle clé-valeur et document. Chapitre 9. Domaine 3.

**DynamoDB Auto Scaling** — Ajuste automatiquement la capacité de lecture/écriture provisionnée en fonction des métriques CloudWatch. Chapitre 29. Domaine 4.

**DynamoDB Streams** — Un journal des modifications ordonné dans le temps de tous les changements d'éléments dans une table DynamoDB. Utilisé avec Lambda pour le traitement piloté par les événements. Chapitre 9. Domaine 2.

---

## E

**EBS (Elastic Block Store)** — Stockage en bloc attaché à une seule instance EC2. Persiste indépendamment. Types : gp3, io2, st1. Chapitre 6. Domaine 3.

**EC2 (Elastic Compute Cloud)** — Machines virtuelles dans le cloud. Chapitre 4. Domaine 3.

**ECS (Elastic Container Service)** — Orchestration de conteneurs gérée. Le type de lancement Fargate supprime la gestion des serveurs. Chapitre 21. Domaines 2, 3.

**EFS (Elastic File System)** — Système de fichiers NFS partagé accessible depuis plusieurs instances EC2. S'adapte automatiquement. Les classes de stockage incluent Standard, Infrequent Access et Archive, avec Intelligent-Tiering pour le déplacement automatique entre les niveaux. Chapitre 6. Domaine 3.

**EKS (Elastic Kubernetes Service)** — Plan de contrôle Kubernetes géré sur AWS. Chapitre 21. Domaine 3.

**Elastic Disaster Recovery (DRS)** — Réplication continue au niveau bloc des serveurs (sur site ou EC2) dans une zone de transit à faible coût, avec des instances de récupération lancées en quelques minutes — un pilot light géré. Chapitre 18. Domaine 2.

**ElastiCache** — Mise en cache en mémoire gérée. Redis (fonctionnalités plus riches) ou Memcached (plus simple). Chapitre 10. Domaine 3.

**Elastic IP** — Une adresse IP publique statique que vous pouvez allouer et réassocier à des instances EC2. Chapitre 11. Domaine 3.

**Chiffrement par enveloppe** — Un modèle où les données sont chiffrées avec une clé de données (DEK), et la DEK est chiffrée avec une clé maîtresse (CMK dans KMS). Chapitre 16. Domaine 1.

**EventBridge** — Bus d'événements pour acheminer les événements des services AWS, des partenaires SaaS et des sources personnalisées vers des cibles. Prend en charge les règles planifiées. Chapitre 22. Domaine 2.

**Refus explicite** — Une instruction de refus IAM qui ne peut être annulée par aucune autorisation. A préséance sur toutes les autorisations. Chapitre 3. Domaine 1.

---

## F

**Routage de basculement (Route 53)** — Achemine le trafic vers un point de terminaison secondaire lorsque le primaire échoue aux vérifications de santé. Chapitre 12. Domaine 2.

**Fargate** — Moteur de calcul sans serveur pour ECS et EKS. Aucune instance EC2 à gérer. Chapitre 21. Domaine 3.

**Modèle de diffusion (fan-out)** — Un sujet SNS livre le même message à plusieurs files SQS simultanément. Chapitre 19. Domaine 2.

**File FIFO (SQS)** — Traitement exactement une fois, ordre strict. Débit inférieur à celui des files standard. Chapitre 19. Domaine 2.

**Mode de défaillance** — Une façon spécifique dont un système peut échouer. Identifier les modes de défaillance avant la production est le cœur de la revue d'architecture. Chapitre 32. Inter-domaines.

---

## G

**Gateway Endpoint** — Un type de VPC endpoint gratuit pour S3 et DynamoDB. Achemine le trafic via le réseau privé AWS, éliminant les frais de NAT Gateway. Chapitre 30. Domaine 4.

**Gateway Load Balancer (GWLB)** — Équilibreur de charge de couche 3 pour insérer en ligne des appliances réseau virtuelles tierces (pare-feux, IDS/IPS) dans les flux de trafic. Chapitre 7. Domaine 1.

**Routage par géolocalisation (Route 53)** — Achemine en fonction de l'emplacement géographique de l'origine de la requête DNS. Chapitre 12. Domaine 3.

**Global Accelerator** — Achemine le trafic vers la périphérie AWS la plus proche via Anycast, améliorant la latence pour les applications dynamiques. Chapitre 25. Domaine 3.

**Glue (AWS)** — ETL sans serveur. Les Glue Crawlers découvrent le schéma ; les Glue Jobs transforment les données ; le Data Catalog stocke les métadonnées. Chapitre 26. Domaine 3.

**GSI (Global Secondary Index)** — Un index alternatif sur une table DynamoDB avec une clé de partition différente et une clé de tri facultative. Permet des modèles de requête flexibles. Chapitre 9. Domaine 3.

**GuardDuty** — Service de détection des menaces utilisant le ML sur CloudTrail, les VPC Flow Logs et les journaux DNS pour détecter une activité inhabituelle. Chapitre 17. Domaine 1.

---

## H

**Vérification de santé (Route 53)** — Surveille la disponibilité d'un point de terminaison. Les vérifications de santé échouées déclenchent le routage de basculement. Chapitre 12. Domaine 2.

**Partition chaude (DynamoDB)** — Une partition recevant un trafic disproportionné parce que de nombreuses requêtes partagent la même clé de partition. Chapitre 9. Domaine 3.

---

## I

**IAM (Identity and Access Management)** — Contrôle l'authentification et l'autorisation pour les comptes AWS. Utilisateurs, groupes, rôles, politiques. Chapitres 3, 14. Domaine 1.

**Rôle IAM** — Une identité IAM avec des informations d'identification temporaires, endossée par des services, des utilisateurs ou d'autres comptes. Chapitres 3, 14. Domaine 1.

**Idempotence** — La propriété d'une opération qui produit le même résultat qu'elle soit appelée une ou plusieurs fois. Critique pour les systèmes distribués (remboursements, paiements, traitement des commandes). Chapitre 32. Inter-domaines.

**Clé d'idempotence** — Un identifiant unique pour une opération, vérifié avant l'exécution pour empêcher un traitement en double. Chapitre 32. Inter-domaines.

**Interface Endpoint (PrivateLink)** — Un VPC endpoint pour la plupart des services AWS. Tarifé à l'heure + par Go. Fournit une connectivité privée sans Internet ni NAT. Chapitre 30. Domaine 4.

**Internet Gateway (IGW)** — Permet aux instances des sous-réseaux publics de communiquer avec Internet. Nécessite que la table de routage du sous-réseau ait une route vers l'IGW. Chapitre 11. Domaine 3.

**« Ça dépend »** — La réponse honnête à la plupart des questions d'architecture, qui doit toujours être complétée : « Ça dépend du modèle d'accès / de l'échelle / de la conséquence de la défaillance / de la contrainte de coût. » Chapitre 33. Inter-domaines.

---

## K

**Kinesis Data Firehose** — Ancien nom d'Amazon Data Firehose : livraison gérée de données en flux vers S3, Redshift, OpenSearch. Aucune gestion de consommateur. Les questions d'examen plus anciennes peuvent encore utiliser l'ancien nom. Chapitre 26. Domaine 3.

**Kinesis Data Streams** — Flux d'événements ordonnés en temps réel. Durable, rejouable dans la fenêtre de rétention (24 heures par défaut, jusqu'à 365 jours). Mesuré en shards. Chapitre 26. Domaine 3.

**KMS (Key Management Service)** — Crée, stocke et contrôle les clés cryptographiques pour le chiffrement au repos. Chapitre 16. Domaine 1.

---

## L

**Lambda** — Fonctions sans serveur déclenchées par des événements. Paiement par invocation et par ms. Durée maximale de 15 minutes. Chapitre 20. Domaines 2, 3, 4.

**Lambda@Edge** — Fonctions Lambda qui s'exécutent aux emplacements périphériques CloudFront, modifiant les requêtes et les réponses. Chapitre 13. Domaine 3.

**AWS Lake Formation** — Couche de contrôle d'accès centralisée au lac de données au-dessus de S3 et du Glue Data Catalog. Fournit des autorisations à granularité fine au niveau de la table, de la colonne et de la ligne. Simplifie la mise en place d'un lac de données sécurisé. Chapitre 26. Domaine 3.

**Routage basé sur la latence (Route 53)** — Achemine les requêtes DNS vers la région AWS ayant la latence mesurée la plus faible. Chapitre 12. Domaine 3.

**Modèle de lancement (Launch template)** — Un modèle versionné spécifiant la configuration des instances EC2 pour les groupes Auto Scaling. Chapitre 7. Domaine 3.

**Moindre privilège** — Bonne pratique IAM : n'accordez que les autorisations nécessaires, pas plus. Chapitre 3. Domaine 1.

**Politique de cycle de vie (S3)** — Règles qui font automatiquement transiter les objets vers des classes de stockage moins chères ou les suppriment en fonction de l'âge. Chapitre 23. Domaine 4.

**LSI (Local Secondary Index)** — Un index alternatif sur une table DynamoDB utilisant la même clé de partition mais une clé de tri différente. Doit être créé à la création de la table. Chapitre 9. Domaine 3.

---

## M

**Amazon Macie** — Découverte basée sur le ML de données sensibles (PII) dans S3 et signalement des risques d'exposition. GuardDuty surveille le comportement ; Macie audite ce qui est stocké. Chapitre 17. Domaine 1.

**Memcached** — Moteur de mise en cache en mémoire simple et multithread. Aucune persistance, aucune structure de données. Utilisez Redis sauf si vous avez spécifiquement besoin du multithreading au prix des fonctionnalités. Chapitre 10. Domaine 3.

**Amazon MemoryDB for Redis** — Base de données primaire en mémoire, durable et compatible Redis. Contrairement à ElastiCache, MemoryDB écrit dans un journal des transactions Multi-AZ, garantissant la durabilité des données. À utiliser lorsque la compatibilité de l'API Redis est requise ET que la perte de données n'est pas acceptable. Chapitre 10. Domaine 3.

**MGN (AWS Application Migration Service)** — Réhébergement/lift-and-shift : réplication au niveau bloc de serveurs entiers vers AWS, lancements de test, puis basculement vers des instances EC2 natives. DataSync déplace des fichiers ; DMS déplace des bases de données ; MGN déplace des serveurs. Chapitre 25. Domaine 3.

**Amazon MQ** — Courtier ActiveMQ/RabbitMQ géré parlant des protocoles standard (AMQP, MQTT, STOMP). Pour le lift-and-shift de charges de travail de courtiers existantes sans modification de code ; messagerie greenfield → SQS/SNS. Chapitre 19. Domaine 2.

**Multi-AZ (RDS)** — Réplica de secours synchrone dans une AZ différente avec basculement automatique. RPO ~0, RTO ~60 secondes. Pour la haute disponibilité, pas la mise à l'échelle en lecture. Chapitres 8, 18. Domaine 2.

**Multi-Région** — Déploiement de composants d'application sur plusieurs régions AWS pour la redondance géographique et la performance mondiale. Complexité et coût plus élevés. Chapitre 18. Domaine 2.

---

## N

**Network Load Balancer (NLB)** — Équilibreur de charge de couche 4 (TCP/UDP/TLS) : des millions de requêtes par seconde, IP statique par AZ, préserve l'IP source. Aucune conscience HTTP — c'est le rôle de l'ALB. Chapitre 7. Domaine 3.

**NACL (Network Access Control List)** — Pare-feu sans état au niveau du sous-réseau. Nécessite des règles entrantes et sortantes. Règles évaluées dans l'ordre numérique. Chapitre 15. Domaine 1.

**NAT Gateway** — Permet aux instances des sous-réseaux privés d'établir des connexions sortantes vers Internet. Facture 0,045 $/Go traité. Chapitres 11, 30. Domaine 4.

---

## O

**Objet (S3)** — Un fichier stocké dans S3. Composé d'une clé (nom), d'une valeur (données) et de métadonnées. Taille maximale de 5 To. Chapitre 5. Domaine 3.

**Capacité à la demande (DynamoDB)** — Mode de paiement par requête. Plus cher par requête que le provisionné, mais aucune planification de capacité nécessaire. Chapitre 29. Domaine 4.

**Instances à la demande (EC2)** — Paiement à l'heure sans engagement. Flexibilité maximale, prix maximal. Chapitre 27. Domaine 4.

**AWS Outposts** — Un rack entièrement géré de matériel AWS installé dans le propre centre de données ou installation de colocation d'un client. Exécute les mêmes services, API et outils AWS que le cloud public, sur site. AWS gère l'installation et les correctifs ; le client fournit l'espace rack et l'alimentation. Pour la résidence des données, les charges de travail à faible latence sur site, ou les scénarios déconnectés. Chapitre 2. Domaine 4.

---

## P

**Clé de partition (DynamoDB)** — Le composant de clé primaire qui détermine quelle partition stocke un élément. Choisissez une clé à forte cardinalité pour une distribution uniforme. Chapitre 9. Domaine 3.

**Permission boundary** — Une politique IAM qui définit les autorisations maximales qu'une identité IAM peut avoir, même si d'autres politiques en accordent davantage. Chapitre 14. Domaine 1.

**Groupe de placement** — Contrôle le placement physique des instances EC2 pour minimiser la latence (cluster) ou maximiser la disponibilité (spread). Chapitre 4. Domaine 3.

**PrivateLink** — Service AWS pour créer des points de terminaison privés vers des services hébergés dans AWS, accessibles via des Interface Endpoints. Chapitre 30. Domaine 1.

**Simultanéité provisionnée (Lambda)** — Environnements d'exécution préinitialisés qui éliminent les délais de démarrage à froid. Chapitre 20. Domaine 3.

**Capacité provisionnée (DynamoDB)** — Débit de lecture et d'écriture préalloué, mesuré en unités de capacité par seconde. Moins cher que le mode à la demande pour un trafic prévisible. Chapitres 9, 29. Domaine 4.

---

## Q

**Amazon QuickSight** — Service géré de business intelligence et de visualisation de données. Utilise SPICE (Super-fast, Parallel, In-memory Calculation Engine) pour mettre en cache les données afin d'un rendu rapide des tableaux de bord. Se connecte à Athena, S3, Redshift, RDS et d'autres sources de données AWS. Aucun serveur BI à gérer. Chapitre 26. Domaine 3.

---

## R

**RDS (Relational Database Service)** — Base de données relationnelle gérée. Gère les sauvegardes, les correctifs, le basculement. Chapitre 8. Domaine 3.

**RDS Proxy** — Gère un pool de connexions entre Lambda/l'application et RDS, empêchant l'épuisement des connexions. Chapitre 8. Domaine 3.

**Réplica en lecture (RDS)** — Copie asynchrone de la base de données pour la mise à l'échelle en lecture. Ne fournit PAS de basculement automatique. Chapitres 8, 24. Domaine 3.

**Redis** — Magasin de structures de données en mémoire utilisé pour la mise en cache, la gestion de session, les classements en temps réel, le pub/sub. Chapitre 10. Domaine 3.

**Reserved Instance (EC2)** — Un engagement à utiliser un type d'instance spécifique dans une région spécifique pendant 1 ou 3 ans en échange d'une remise. Chapitre 27. Domaine 4.

**Route 53** — Service DNS et registraire de domaines d'AWS. Prend en charge plusieurs politiques de routage. Chapitre 12. Domaines 2, 3.

**RPO (Recovery Point Objective)** — Perte de données maximale acceptable mesurée en temps. « Quelle quantité de données pouvons-nous nous permettre de perdre ? » Chapitre 18. Domaine 2.

**RTO (Recovery Time Objective)** — Temps maximal acceptable pour restaurer le service après une panne. « Combien de temps pouvons-nous être hors service ? » Chapitre 18. Domaine 2.

**Runbook** — Instructions étape par étape pour exploiter un système, spécifiquement pour la réponse aux incidents. « Que fait quelqu'un à 3h du matin ? » Chapitre 32. Inter-domaines.

---

## S

**S3 Intelligent-Tiering** — Déplace automatiquement les objets S3 entre les niveaux d'accès en fonction des modèles d'accès. Aucun frais de récupération. Chapitre 23. Domaine 4.

**S3 Select** — Récupère un sous-ensemble du contenu d'un objet S3 à l'aide d'expressions SQL, réduisant le transfert de données. Hérité : indisponible pour les nouveaux clients depuis mi-2024 — Athena est désormais la voie principale pour filtrer et interroger les données dans S3. S3 Object Lambda, autrefois l'alternative suggérée, est lui-même hérité (fermé aux nouveaux clients en novembre 2025 ; les charges de travail existantes continuent de fonctionner). Chapitre 30. Domaine 4.

**Savings Plan** — Un modèle de tarification flexible engageant un montant en dollars de dépense horaire en échange d'une remise. Plus flexible que les Reserved Instances. Chapitre 27. Domaine 4.

**SCP (Service Control Policy)** — Politique AWS Organizations qui restreint les autorisations maximales disponibles pour les comptes d'une OU. Chapitre 14. Domaine 1.

**Secrets Manager** — Stocke et fait tourner automatiquement les secrets (mots de passe de base de données, clés d'API). Chapitre 16. Domaine 1.

**Groupe de sécurité** — Un pare-feu virtuel à état au niveau de l'instance. Règles d'autorisation uniquement ; le trafic de retour est automatique. Chapitre 15. Domaine 1.

**Shard (Kinesis)** — L'unité de base du débit dans Kinesis Data Streams : 1 Mo/s en écriture, 2 Mo/s en lecture. Chapitre 26. Domaine 3.

**Modèle de responsabilité partagée** — AWS est responsable de la sécurité *du* cloud (infrastructure) ; vous êtes responsable de la sécurité *dans* le cloud (données, configuration, accès). Chapitre 1. Domaine 1.

**Shield** — Protection contre les attaques DDoS. Standard : gratuit, automatique. Advanced : payant, avec support DRT et protection financière. Chapitre 17. Domaine 1.

**Snow Family** — Dispositifs physiques pour le transfert de données en masse hors ligne (Snowball Edge : 80 To) — affréter un vol cargo au lieu de rouler sur l'autoroute. Hérité (2026) : Snowmobile et Snowcone abandonnés ; dispositifs Snow fermés aux nouveaux clients en novembre 2025 (AWS oriente vers DataSync et les Data Transfer Terminals), mais l'examen SAA-C03 attend toujours Snowball pour « des semaines de transfert, bande passante limitée ». Chapitre 25. Domaine 3.

**SNS (Simple Notification Service)** — Messagerie pub/sub. Pousse les messages à tous les abonnés simultanément. Modèle de diffusion (fan-out). Chapitre 19. Domaine 2.

**Clé de tri (DynamoDB)** — Second composant facultatif de la clé primaire. Permet les requêtes par plage au sein d'une partition. Chapitre 9. Domaine 3.

**Instances Spot** — Instances EC2 utilisant la capacité libre à une remise de 60 à 90 %. Peuvent être interrompues avec un préavis de 2 minutes. Uniquement pour les charges de travail tolérantes aux pannes. Chapitre 27. Domaine 4.

**SQS (Simple Queue Service)** — File de messages gérée. Découple les producteurs des consommateurs. Files standard (au moins une fois) et FIFO (exactement une fois). Chapitre 19. Domaine 2.

**Step Functions** — Service d'orchestration de flux de travail sans serveur. Machines à états pour coordonner les services AWS. Chapitre 22. Domaine 2.

**AWS Storage Gateway** — Le pont entre le stockage sur site et le stockage cloud : présente localement des interfaces NFS/SMB (File), iSCSI (Volume) ou bande virtuelle (Tape) tout en conservant les données dans S3, Glacier ou des instantanés EBS. Chapitre 6. Domaine 3.

---

## T

**Mise à l'échelle par suivi de cible (target tracking)** — Politique Auto Scaling qui ajuste la capacité pour maintenir une valeur de métrique cible (par ex. 60 % d'utilisation du CPU). Chapitre 7. Domaine 2.

**AWS Transfer Family** — Point de terminaison SFTP/FTPS/FTP géré, adossé à S3 ou EFS. Les partenaires conservent leurs clients SFTP existants ; les fichiers atterrissent directement dans votre compartiment. Chapitre 25. Domaine 3.

**Transit Gateway** — Topologie réseau en étoile connectant plusieurs VPC et réseaux sur site via une passerelle centrale. Chapitre 25. Domaine 3.

**TTL (Time to Live)** — Un horodatage après lequel DynamoDB supprime automatiquement un élément. Également utilisé dans le DNS (durée pendant laquelle les résolveurs mettent en cache un enregistrement) et la mise en cache (durée pendant laquelle une valeur en cache est valide). Chapitres 9, 12. Domaine 3.

---

## V

**VIF (Virtual Interface)** — La connexion logique utilisée avec AWS Direct Connect. Un VIF public accède aux points de terminaison publics AWS ; un VIF privé accède aux ressources VPC. Chapitre 25. Domaine 3.

**Délai de visibilité (SQS)** — La période pendant laquelle un message reçu est masqué aux autres consommateurs. Permet le traitement sans que d'autres consommateurs voient le même message. Chapitre 19. Domaine 2.

**VPC (Virtual Private Cloud)** — Un réseau virtuel isolé dans AWS. Contient des sous-réseaux, des tables de routage et des passerelles. Chapitre 11. Domaine 1.

**VPC Endpoint** — Connecte les ressources VPC aux services AWS via le réseau privé AWS. Gateway (gratuit, S3/DynamoDB) et Interface (tarifé, la plupart des autres services). Chapitre 30. Domaines 1, 4.

**VPC Flow Logs** — Capture les informations sur le trafic IP entrant et sortant des interfaces réseau d'un VPC. Utilisé par GuardDuty et pour le dépannage réseau. Chapitre 17. Domaine 1.

**VPC Peering** — Une connexion réseau entre deux VPC permettant au trafic d'être routé entre eux à l'aide d'adresses IP privées. Chapitre 11. Domaine 3.

---

## W

**WAF (Web Application Firewall)** — Filtre le trafic HTTP/HTTPS à l'aide de règles (blocages d'IP, injection SQL, limites de débit). S'attache à CloudFront, ALB ou API Gateway. Chapitre 17. Domaine 1.

**AWS Wavelength** — Infrastructure AWS déployée à l'intérieur des réseaux des fournisseurs de télécommunications 5G, à la périphérie radio. Permet une latence de l'ordre de quelques millisecondes vers les appareils mobiles. Pour l'AR/VR mobile, le jeu en temps réel, la télémétrie de véhicules autonomes et la vidéo en direct à la périphérie 5G. Les Wavelength Zones sont des extensions des régions AWS au sein des réseaux de télécommunications. Chapitre 2. Domaine 3.

**Well-Architected Framework** — Le framework d'évaluation à six piliers d'AWS : Excellence opérationnelle, Sécurité, Fiabilité, Efficacité des performances, Optimisation des coûts, Durabilité. Chapitre 31. Inter-domaines.

**Routage pondéré (Route 53)** — Distribue les requêtes DNS entre les points de terminaison par poids. Utilisé pour les déploiements blue-green et les tests A/B. Chapitre 12. Domaine 3.

**Mise en cache write-through** — Met à jour le cache chaque fois que la base de données est mise à jour. Les données sont toujours cohérentes mais le cache peut contenir de nombreux éléments qui ne sont jamais relus. Chapitre 10. Domaine 3.

---

## Référence rapide des modèles SAA-C03

| Si l'examen dit...                             | Pensez à...                                  |
|-----------------------------------------------|----------------------------------------------|
| « Découpler les services »                    | SQS, SNS, EventBridge                        |
| « Diffusion vers plusieurs consommateurs »    | SNS + abonnements SQS                        |
| « Événements ordonnés en temps réel »         | Kinesis Data Streams                         |
| « Sans serveur »                              | Lambda, DynamoDB, Aurora Serverless, Fargate |
| « Faible latence globale (dynamique) »        | Global Accelerator                           |
| « Faible latence globale (statique/en cache) »| CloudFront                                   |
| « Protection DDoS »                           | Shield (Standard : gratuit ; Advanced : payant) |
| « Bloquer l'injection SQL à la périphérie »   | WAF                                          |
| « Détecter des informations d'identification compromises » | GuardDuty                       |
| « Auditer l'activité de l'API »               | CloudTrail                                   |
| « Faire tourner les informations d'identification de base de données » | Secrets Manager         |
| « Chiffrer les données au repos, clés gérées par le client » | KMS avec CMK                  |
| « Stocker des valeurs de configuration »      | SSM Parameter Store                          |
| « Stockage de base de données à IOPS élevés » | io2 EBS                                      |
| « Système de fichiers partagé pour EC2 »      | EFS                                          |
| « Interroger des données S3 avec SQL »        | Athena                                       |
| « Pipeline ETL pour l'analytique »            | AWS Glue                                     |
| « Livrer des données en flux vers S3 »        | Amazon Data Firehose                         |
| « Tâches par lots tolérantes aux pannes, minimiser le coût » | Instances Spot                |
| « Charge de production engagée et stable »    | Savings Plans                                |
| « Sous-réseau privé → S3 sans NAT »           | S3 Gateway Endpoint                          |
| « Sous-réseau privé → SQS sans NAT »          | SQS Interface Endpoint                       |
| « Multi-AZ pour RDS »                         | Basculement automatique (pas mise à l'échelle en lecture) |
| « Réplica en lecture pour RDS »               | Mise à l'échelle en lecture (pas basculement automatique) |
| « Temps de récupération de 1–2 minutes, inter-AZ » | Multi-AZ (basculement RDS : 60–120 secondes) |
| « Récupération inter-régions, RTO en minutes »| Pilot Light ou Warm Standby                  |
| « Active-Active, RTO nul »                    | Multi-Région Active-Active (le plus complexe)|
| « Traitement par lots au-delà du délai Lambda »| AWS Batch                                   |
| « Compatible Redis ET durable »              | MemoryDB for Redis                           |
| « Ingénieurs distants accèdent au VPC depuis chez eux » | Client VPN                         |
| « Migrer une base de données avec un temps d'arrêt minimal » | DMS (+ SCT pour l'hétérogène)  |
| « Tableau de bord BI sur AWS »                | QuickSight                                   |
| « Exécuter AWS dans votre propre centre de données » | Outposts                              |
| « Calcul en périphérie mobile 5G »            | Wavelength                                   |
