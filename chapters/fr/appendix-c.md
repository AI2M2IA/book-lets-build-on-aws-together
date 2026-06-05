# Annexe C : Registre des concepts

Chaque concept clé introduit dans le livre, associé à son chapitre, à l'analogie utilisée et au domaine SAA-C03 où il apparaît.

Utilisez ceci comme index d'étude : si vous avez un doute sur un concept avant l'examen, trouvez-le ici et revenez à son chapitre pour le contexte.

---

## A

**ACU (Aurora Capacity Unit)** — L'unité de mesure de la capacité Aurora Serverless v2. S'adapte automatiquement. Chapitre 24. Domaine 3.

**Alarme (CloudWatch)** — Une règle qui se déclenche quand une métrique franchit un seuil, déclenchant une notification ou une action de mise à l'échelle automatique. Chapitre 7. Domaine 2.

**ALB (Application Load Balancer)** — Équilibreur de charge de couche 7 qui route le trafic HTTP/HTTPS en fonction des règles de chemin et d'hôte. Chapitre 7. Domaine 2.

**AMI (Amazon Machine Image)** — Un modèle contenant le système d'exploitation, les logiciels et la configuration pour une instance EC2. Chapitre 4. Domaine 3.

**État d'esprit architecte** — Demander « qu'est-ce qui casse en premier, comment le savons-nous, et que fait quelqu'un à 3h du matin ? » plutôt que seulement « comment ça fonctionne ? ». Chapitre 32, Chapitre 34. Inter-domaines.

**Enregistrement de décision architecturale (ADR)** — Un court document capturant une décision, ses alternatives, sa justification et ce qui causerait une reconsidération. Chapitre 32. Inter-domaines.

**Revue d'architecture** — Un processus structuré couvrant : contraintes → inconnues → options → modes de défaillance → surveillance → runbooks. Chapitre 32. Inter-domaines.

**Athena** — Service de requêtes SQL sans serveur pour les données dans S3. Paiement par To scanné. Meilleur avec les formats en colonnes Parquet/ORC. Chapitre 26. Domaine 3.

**Groupe Auto Scaling (ASG)** — Un groupe d'instances EC2 gérées ensemble, remplaçant automatiquement les instances défectueuses et s'adaptant en fonction de la charge. Chapitre 7. Domaine 2, 3.

**Zone de disponibilité (AZ)** — Un ou plusieurs centres de données physiquement séparés au sein d'une région, connectés par des liens à faible latence. Chapitre 2. Domaine 2.

---

## B

**Compartiment (S3)** — Un conteneur pour les objets S3. Les compartiments ont des noms globaux uniques et résident dans une région spécifique. Chapitre 5. Domaine 3.

**Politique de compartiment** — Une politique basée sur la ressource attachée à un compartiment S3 contrôlant l'accès pour les principaux IAM et les comptes externes. Chapitre 5. Domaine 1.

---

## C

**Modèle cache-aside** — L'application vérifie d'abord le cache ; en cas d'échec, interroge la base de données, puis stocke le résultat dans le cache. Chapitre 10. Domaine 3.

**Taux de succès du cache** — Pourcentage de requêtes servies depuis le cache plutôt que depuis l'origine. Plus élevé est mieux. Chapitre 13. Domaine 3.

**CloudFront** — CDN AWS. Met en cache le contenu dans 400+ points de présence dans le monde. Réduit la latence et les coûts de transfert de données d'origine. Chapitre 13. Domaine 3, 4.

**CloudTrail** — Enregistre chaque appel API AWS : qui, quoi, quand, depuis où. Stocké dans S3. Utilisé pour l'audit et l'investigation des incidents. Domaine 1.

**CloudWatch** — Métriques, journaux, alarmes et tableaux de bord pour les ressources AWS et les applications personnalisées. Référencé tout au long. Tous les domaines.

**Démarrage à froid (Lambda)** — Délai lors de la première invocation (ou après inactivité) pendant que Lambda initialise l'environnement d'exécution. Utilisez la simultanéité provisionnée pour l'éliminer. Chapitre 20. Domaine 3.

**Compute Savings Plan** — Engagement pour un montant en dollars de dépenses horaires EC2, s'appliquant à tout type ou taille d'instance. Chapitre 27. Domaine 4.

**Config (AWS)** — Suit les changements de configuration des ressources AWS au fil du temps et évalue la conformité par rapport aux règles. Chapitre 31. Domaine 1.

**Transfert de données inter-AZ** — Trafic entre les Zones de disponibilité au sein d'une région. Facturé à 0,01 $/Go dans chaque sens. Chapitre 30. Domaine 4.

**Réplication inter-région** — Copie des données (S3 CRR, Aurora Global, DynamoDB Global Tables) vers une région différente. Entraîne des frais de transfert de données. Chapitres 18, 30. Domaine 2.

---

## D

**DAX (DynamoDB Accelerator)** — Cache en mémoire spécifiquement pour DynamoDB. Latence de lecture en microsecondes. Chapitre 9. Domaine 3.

**File de lettres mortes (DLQ)** — Une file où les messages qui échouent au traitement à plusieurs reprises sont envoyés, empêchant le blocage de la file. Chapitre 19. Domaine 2.

**Dedicated Host** — Un serveur EC2 physique réservé exclusivement à votre utilisation. Requis pour certaines licences logicielles. Chapitre 27. Domaine 4.

**Défense en profondeur** — Superposition de plusieurs contrôles de sécurité (IAM + groupes de sécurité + NACL + WAF + GuardDuty) pour qu'une compromission d'une couche n'expose pas le système. Chapitre 33. Domaine 1.

**Direct Connect** — Une connexion réseau privée dédiée depuis un emplacement sur site vers AWS. Plus cohérent que le VPN. Chapitre 25. Domaine 3.

**DLQ** — Voir File de lettres mortes.

**DynamoDB** — Base de données NoSQL entièrement gérée avec une latence à un chiffre de milliseconde à toute échelle. Modèle clé-valeur et document. Chapitre 9. Domaine 3.

**DynamoDB Auto Scaling** — Ajuste automatiquement la capacité de lecture/écriture provisionnée en fonction des métriques CloudWatch. Chapitre 29. Domaine 4.

**DynamoDB Streams** — Un journal de modifications de tous les éléments dans une table DynamoDB, ordonné dans le temps. Utilisé avec Lambda pour le traitement piloté par les événements. Chapitre 9. Domaine 2.

---

## E

**EBS (Elastic Block Store)** — Stockage par blocs attaché à une seule instance EC2. Persiste indépendamment. Types : gp3, io2, st1. Chapitre 6. Domaine 3.

**EC2 (Elastic Compute Cloud)** — Machines virtuelles dans le cloud. Chapitre 4. Domaine 3.

**ECS (Elastic Container Service)** — Orchestration de conteneurs gérée. Le type de lancement Fargate supprime la gestion du serveur. Chapitre 21. Domaine 2, 3.

**EFS (Elastic File System)** — Système de fichiers NFS partagé accessible depuis plusieurs instances EC2. S'adapte automatiquement. Chapitre 6. Domaine 3.

**EKS (Elastic Kubernetes Service)** — Plan de contrôle Kubernetes géré sur AWS. Chapitre 21. Domaine 3.

**ElastiCache** — Mise en cache en mémoire gérée. Redis (fonctionnalités plus riches) ou Memcached (plus simple). Chapitre 10. Domaine 3.

**IP Elastic** — Une adresse IP publique statique que vous pouvez allouer et réassocier aux instances EC2. Chapitre 11. Domaine 3.

**Chiffrement enveloppé** — Un modèle où les données sont chiffrées avec une clé de données (DEK), et la DEK est chiffrée avec une clé maîtresse (CMK dans KMS). Chapitre 16. Domaine 1.

**EventBridge** — Bus d'événements pour router les événements depuis les services AWS, les partenaires SaaS et les sources personnalisées vers des cibles. Prend en charge les règles planifiées. Chapitre 22. Domaine 2.

**Refus explicite** — Une déclaration de refus IAM qui ne peut pas être annulée par une autorisation. Prime sur toutes les autorisations. Chapitre 3. Domaine 1.

---

## F

**Routage de basculement (Route 53)** — Route le trafic vers un point de terminaison secondaire quand le principal échoue aux vérifications de santé. Chapitre 12. Domaine 2.

**Fargate** — Moteur de calcul sans serveur pour ECS et EKS. Pas d'instances EC2 à gérer. Chapitre 21. Domaine 3.

**Modèle de diffusion en éventail** — Un sujet SNS livre le même message à plusieurs files SQS simultanément. Chapitre 19. Domaine 2.

**File FIFO (SQS)** — Traitement exactement une fois, ordre strict. Débit plus faible que les files standard. Chapitre 19. Domaine 2.

**Mode de défaillance** — Une façon spécifique dont un système peut tomber en panne. Identifier les modes de défaillance avant la production est au cœur de la revue d'architecture. Chapitre 32. Inter-domaines.

---

## G

**Gateway Endpoint** — Un type de point de terminaison VPC gratuit pour S3 et DynamoDB. Route le trafic via le réseau privé AWS, éliminant les frais NAT Gateway. Chapitre 30. Domaine 4.

**Routage par géolocalisation (Route 53)** — Route en fonction de la localisation géographique de l'origine de la requête DNS. Chapitre 12. Domaine 3.

**Global Accelerator** — Route le trafic vers le point de présence AWS le plus proche via Anycast, améliorant la latence pour les applications dynamiques. Chapitre 25. Domaine 3.

**Glue (AWS)** — ETL sans serveur. Les Crawlers Glue découvrent le schéma ; les Jobs Glue transforment les données ; le catalogue de données stocke les métadonnées. Chapitre 26. Domaine 3.

**GSI (Global Secondary Index)** — Un index alternatif sur une table DynamoDB avec une clé de partition différente et une clé de tri optionnelle. Permet des modèles de requête flexibles. Chapitre 9. Domaine 3.

**GuardDuty** — Service de détection des menaces utilisant le ML sur CloudTrail, les journaux de flux VPC et les journaux DNS pour détecter une activité inhabituelle. Chapitre 17. Domaine 1.

---

## H

**Vérification de santé (Route 53)** — Surveille la disponibilité des points de terminaison. Les vérifications de santé échouées déclenchent le routage de basculement. Chapitre 12. Domaine 2.

**Partition chaude (DynamoDB)** — Une partition recevant un trafic disproportionné parce que de nombreuses requêtes partagent la même clé de partition. Chapitre 9. Domaine 3.

---

## I

**IAM (Identity and Access Management)** — Contrôle l'authentification et l'autorisation pour les comptes AWS. Utilisateurs, groupes, rôles, politiques. Chapitres 3, 14. Domaine 1.

**Rôle IAM** — Une identité IAM avec des identifiants temporaires, assumée par des services, des utilisateurs ou d'autres comptes. Chapitres 3, 14. Domaine 1.

**Idempotence** — La propriété d'une opération qui produit le même résultat qu'elle soit appelée une ou plusieurs fois. Critique pour les systèmes distribués (remboursements, paiements, traitement des commandes). Chapitre 32. Inter-domaines.

**Clé d'idempotence** — Un identifiant unique pour une opération, vérifié avant l'exécution pour prévenir le traitement en double. Chapitre 32. Inter-domaines.

**Interface Endpoint (PrivateLink)** — Un point de terminaison VPC pour la plupart des services AWS. Facturé par heure + par Go. Fournit une connectivité privée sans Internet ou NAT. Chapitre 30. Domaine 4.

**Internet Gateway (IGW)** — Permet aux instances dans les sous-réseaux publics de communiquer avec Internet. Nécessite que la table de routage du sous-réseau ait une route vers l'IGW. Chapitre 11. Domaine 3.

**« Ça dépend »** — La réponse honnête à la plupart des questions d'architecture, qui doit toujours être complétée : « Ça dépend du modèle d'accès / de l'échelle / de la conséquence de la défaillance / de la contrainte de coût. » Chapitre 33. Inter-domaines.

---

## K

**Kinesis Data Firehose** — Livraison gérée de données de diffusion vers S3, Redshift, OpenSearch. Pas de gestion des consommateurs. Chapitre 26. Domaine 3.

**Kinesis Data Streams** — Flux d'événements ordonné en temps réel. Durable, rejouable. Mesuré en shards. Chapitre 26. Domaine 3.

**KMS (Key Management Service)** — Crée, stocke et contrôle les clés cryptographiques pour le chiffrement au repos. Chapitre 16. Domaine 1.

---

## L

**Lambda** — Fonctions sans serveur déclenchées par des événements. Paiement par invocation et par ms. Durée maximale de 15 minutes. Chapitre 20. Domaine 2, 3, 4.

**Lambda@Edge** — Fonctions Lambda qui s'exécutent aux points de présence CloudFront, modifiant les requêtes et les réponses. Chapitre 13. Domaine 3.

**Routage basé sur la latence (Route 53)** — Route les requêtes DNS vers la région AWS avec la latence mesurée la plus faible. Chapitre 12. Domaine 3.

**Modèle de lancement** — Un modèle versionné spécifiant la configuration des instances EC2 pour les groupes Auto Scaling. Chapitre 7. Domaine 3.

**Moindre privilège** — Bonne pratique IAM : n'accorder que les autorisations nécessaires, pas plus. Chapitre 3. Domaine 1.

**Politique de cycle de vie (S3)** — Des règles qui font automatiquement passer les objets vers des classes de stockage moins chères ou les suppriment en fonction de l'âge. Chapitre 23. Domaine 4.

**LSI (Local Secondary Index)** — Un index alternatif sur une table DynamoDB utilisant la même clé de partition mais une clé de tri différente. Doit être créé lors de la création de la table. Chapitre 9. Domaine 3.

---

## M

**Memcached** — Moteur de mise en cache en mémoire simple et multi-thread. Pas de persistance, pas de structures de données. Utilisez Redis sauf si vous avez spécifiquement besoin du multi-thread au détriment des fonctionnalités. Chapitre 10. Domaine 3.

**Multi-AZ (RDS)** — Réplique de standby synchrone dans une AZ différente avec basculement automatique. RPO ~0, RTO ~60 secondes. Pour la haute disponibilité, pas la mise à l'échelle en lecture. Chapitres 8, 18. Domaine 2.

**Multi-Région** — Déploiement des composants d'application sur plusieurs régions AWS pour la redondance géographique et les performances mondiales. Complexité et coût plus élevés. Chapitre 18. Domaine 2.

---

## N

**NACL (Network Access Control List)** — Pare-feu sans état au niveau du sous-réseau. Nécessite des règles entrantes et sortantes. Règles évaluées dans l'ordre numérique. Chapitre 15. Domaine 1.

**NAT Gateway** — Permet aux instances dans les sous-réseaux privés d'effectuer des connexions sortantes vers Internet. Facture 0,045 $/Go traité. Chapitres 11, 30. Domaine 4.

---

## O

**Objet (S3)** — Un fichier stocké dans S3. Composé d'une clé (nom), d'une valeur (données) et de métadonnées. Taille maximale 5 To. Chapitre 5. Domaine 3.

**Capacité à la demande (DynamoDB)** — Mode paiement par requête. Plus cher par requête que le provisionné, mais pas de planification de capacité nécessaire. Chapitre 29. Domaine 4.

**Instances à la demande (EC2)** — Paiement à l'heure sans engagement. Flexibilité maximale, prix maximum. Chapitre 27. Domaine 4.

---

## P

**Clé de partition (DynamoDB)** — Le composant de clé primaire qui détermine quelle partition stocke un élément. Choisissez une clé à haute cardinalité pour une distribution uniforme. Chapitre 9. Domaine 3.

**Limite d'autorisation** — Une politique IAM qui définit les autorisations maximales qu'une identité IAM peut avoir, même si d'autres politiques en accordent davantage. Chapitre 14. Domaine 1.

**Groupe de placement** — Contrôle le placement physique des instances EC2 pour minimiser la latence (cluster) ou maximiser la disponibilité (étendu). Chapitre 4. Domaine 3.

**PrivateLink** — Service AWS pour créer des points de terminaison privés vers des services hébergés dans AWS, accessibles via les Interface Endpoints. Chapitre 30. Domaine 1.

**Simultanéité provisionnée (Lambda)** — Environnements d'exécution pré-initialisés qui éliminent les délais de démarrage à froid. Chapitre 20. Domaine 3.

**Capacité provisionnée (DynamoDB)** — Débit de lecture et d'écriture pré-alloué, mesuré en unités de capacité par seconde. Moins cher que la capacité à la demande pour un trafic prévisible. Chapitres 9, 29. Domaine 4.

---

## R

**RDS (Relational Database Service)** — Base de données relationnelle gérée. Gère les sauvegardes, les correctifs, le basculement. Chapitre 8. Domaine 3.

**RDS Proxy** — Gère un pool de connexions entre Lambda/application et RDS, évitant l'épuisement des connexions. Chapitre 8. Domaine 3.

**Réplique en lecture (RDS)** — Copie asynchrone de la base de données pour la mise à l'échelle en lecture. Ne fournit PAS de basculement automatique. Chapitres 8, 24. Domaine 3.

**Redis** — Magasin de structures de données en mémoire utilisé pour la mise en cache, la gestion des sessions, les classements en temps réel, pub/sub. Chapitre 10. Domaine 3.

**Reserved Instance (EC2)** — Un engagement à utiliser un type d'instance spécifique dans une région spécifique pendant 1 ou 3 ans en échange d'une réduction. Chapitre 27. Domaine 4.

**Route 53** — Service DNS et bureau d'enregistrement de domaines AWS. Prend en charge plusieurs politiques de routage. Chapitre 12. Domaine 2, 3.

**RPO (Recovery Point Objective)** — Perte de données maximale acceptable mesurée en temps. « Quelle quantité de données pouvons-nous nous permettre de perdre ? » Chapitre 18. Domaine 2.

**RTO (Recovery Time Objective)** — Temps maximum acceptable pour restaurer le service après une panne. « Combien de temps pouvons-nous être hors service ? » Chapitre 18. Domaine 2.

**Runbook** — Instructions étape par étape pour opérer un système, spécifiquement pour la réponse aux incidents. « Que fait quelqu'un à 3h du matin ? » Chapitre 32. Inter-domaines.

---

## S

**S3 Intelligent-Tiering** — Déplace automatiquement les objets S3 entre les niveaux d'accès en fonction des modèles d'accès. Pas de frais de récupération. Chapitre 23. Domaine 4.

**S3 Select** — Récupère un sous-ensemble du contenu d'un objet S3 en utilisant des expressions SQL, réduisant le transfert de données. Chapitre 30. Domaine 4.

**Savings Plan** — Un modèle de tarification flexible s'engageant à un montant en dollars de dépenses horaires en échange d'une réduction. Plus flexible que les Reserved Instances. Chapitre 27. Domaine 4.

**SCP (Politique de contrôle de service)** — Politique AWS Organizations qui restreint les autorisations maximales disponibles pour les comptes dans une OU. Chapitre 14. Domaine 1.

**Secrets Manager** — Stocke et fait tourner automatiquement les secrets (mots de passe de base de données, clés API). Chapitre 16. Domaine 1.

**Groupe de sécurité** — Un pare-feu virtuel avec état au niveau de l'instance. Règles d'autorisation uniquement ; le trafic de retour est automatique. Chapitre 15. Domaine 1.

**Shard (Kinesis)** — L'unité de base du débit dans Kinesis Data Streams : 1 Mo/s écriture, 2 Mo/s lecture. Chapitre 26. Domaine 3.

**Modèle de responsabilité partagée** — AWS est responsable de la sécurité *du* cloud (infrastructure) ; vous êtes responsable de la sécurité *dans* le cloud (données, configuration, accès). Chapitre 1. Domaine 1.

**Shield** — Protection DDoS. Standard : gratuit, automatique. Advanced : payant, avec support DRT et protection financière. Chapitre 17. Domaine 1.

**SNS (Simple Notification Service)** — Messagerie pub/sub. Pousse les messages à tous les abonnés simultanément. Modèle de diffusion en éventail. Chapitre 19. Domaine 2.

**Clé de tri (DynamoDB)** — Deuxième composant optionnel de la clé primaire. Permet des requêtes de plage au sein d'une partition. Chapitre 9. Domaine 3.

**Instances Spot** — Instances EC2 utilisant la capacité libre à 60-90 % de réduction. Peuvent être interrompues avec un préavis de 2 minutes. Uniquement pour les charges de travail tolérantes aux pannes. Chapitre 27. Domaine 4.

**SQS (Simple Queue Service)** — File de messages gérée. Découple les producteurs des consommateurs. Files Standard (au moins une fois) et FIFO (exactement une fois). Chapitre 19. Domaine 2.

**Step Functions** — Service d'orchestration de flux de travail sans serveur. Machines d'état pour coordonner les services AWS. Chapitre 22. Domaine 2.

---

## T

**Mise à l'échelle par suivi de cible** — Politique Auto Scaling qui ajuste la capacité pour maintenir une valeur de métrique cible (par ex., 60 % d'utilisation CPU). Chapitre 7. Domaine 2.

**Transit Gateway** — Topologie réseau hub-and-spoke connectant plusieurs VPC et réseaux sur site via une passerelle centrale. Chapitre 25. Domaine 3.

**TTL (Time to Live)** — Un horodatage après lequel DynamoDB supprime automatiquement un élément. Aussi utilisé en DNS (durée pendant laquelle les résolveurs mettent en cache un enregistrement) et en mise en cache (durée de validité d'une valeur mise en cache). Chapitres 9, 12. Domaine 3.

---

## V

**VIF (Virtual Interface)** — La connexion logique utilisée avec AWS Direct Connect. Le VIF public accède aux points de terminaison publics AWS ; le VIF privé accède aux ressources VPC. Chapitre 25. Domaine 3.

**Délai de visibilité (SQS)** — La période pendant laquelle un message reçu est caché des autres consommateurs. Permet le traitement sans que d'autres consommateurs voient le même message. Chapitre 19. Domaine 2.

**VPC (Virtual Private Cloud)** — Un réseau virtuel isolé dans AWS. Contient des sous-réseaux, des tables de routage et des passerelles. Chapitre 11. Domaine 1.

**VPC Endpoint** — Connecte les ressources VPC aux services AWS via le réseau privé AWS. Gateway (gratuit, S3/DynamoDB) et Interface (payant, la plupart des autres services). Chapitre 30. Domaine 1, 4.

**Journaux de flux VPC** — Capture des informations sur le trafic IP vers et depuis les interfaces réseau dans un VPC. Utilisé par GuardDuty et pour le dépannage réseau. Chapitre 17. Domaine 1.

**VPC Peering** — Une connexion réseau entre deux VPC permettant au trafic de router entre eux en utilisant des adresses IP privées. Chapitre 11. Domaine 3.

---

## W

**WAF (Web Application Firewall)** — Filtre le trafic HTTP/HTTPS en utilisant des règles (blocages d'IP, injection SQL, limites de débit). S'attache à CloudFront, ALB ou API Gateway. Chapitre 17. Domaine 1.

**Well-Architected Framework** — Cadre d'évaluation AWS à six piliers : Excellence opérationnelle, Sécurité, Fiabilité, Efficacité des performances, Optimisation des coûts, Durabilité. Chapitre 31. Inter-domaines.

**Routage pondéré (Route 53)** — Distribue les requêtes DNS entre les points de terminaison par poids. Utilisé pour les déploiements bleu-vert et les tests A/B. Chapitre 12. Domaine 3.

**Mise en cache write-through** — Met à jour le cache chaque fois que la base de données est mise à jour. Les données sont toujours cohérentes mais le cache peut contenir de nombreux éléments qui ne sont jamais relus. Chapitre 10. Domaine 3.

---

## Référence rapide des modèles SAA-C03

| Si l'examen dit...                                | Pensez à...                                         |
|---------------------------------------------------|-----------------------------------------------------|
| « Découpler les services »                        | SQS, SNS, EventBridge                               |
| « Diffusion en éventail vers plusieurs consommateurs » | SNS + abonnements SQS                           |
| « Événements ordonnés en temps réel »             | Kinesis Data Streams                                |
| « Sans serveur »                                  | Lambda, DynamoDB, Aurora Serverless, Fargate         |
| « Faible latence mondiale (dynamique) »           | Global Accelerator                                  |
| « Faible latence mondiale (statique/mis en cache) » | CloudFront                                        |
| « Protection DDoS »                               | Shield (Standard : gratuit ; Advanced : payant)     |
| « Bloquer l'injection SQL au point de présence »  | WAF                                                 |
| « Détecter les identifiants compromis »           | GuardDuty                                           |
| « Auditer l'activité API »                        | CloudTrail                                          |
| « Faire tourner les identifiants de base de données » | Secrets Manager                                 |
| « Chiffrer les données au repos, clés gérées par le client » | KMS avec CMK                              |
| « Stocker les valeurs de configuration »          | SSM Parameter Store                                 |
| « Stockage de base de données IOPS élevés »       | io2 EBS                                             |
| « Système de fichiers partagé pour EC2 »          | EFS                                                 |
| « Interroger les données S3 avec SQL »            | Athena                                              |
| « Pipeline ETL pour l'analytique »                | AWS Glue                                            |
| « Livrer des données de diffusion vers S3 »       | Kinesis Firehose                                    |
| « Jobs par lots tolérants aux pannes, minimiser le coût » | Instances Spot                              |
| « Charge de travail de production stable et engagée » | Savings Plans                                  |
| « Sous-réseau privé → S3 sans NAT »              | S3 Gateway Endpoint                                 |
| « Sous-réseau privé → SQS sans NAT »             | SQS Interface Endpoint                              |
| « Multi-AZ pour RDS »                             | Basculement automatique (pas la mise à l'échelle en lecture) |
| « Réplique en lecture pour RDS »                  | Mise à l'échelle en lecture (pas le basculement automatique) |
| « Temps de récupération < 1 minute, inter-AZ »   | Multi-AZ                                            |
| « Récupération inter-régions, RTO en minutes »    | Veilleuse ou Standby chaud                          |
| « Actif-actif, RTO zéro »                        | Multi-Région Actif-Actif (le plus complexe)         |
