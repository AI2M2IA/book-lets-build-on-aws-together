# Annexe D : Examen blanc complet (65 questions)

Ceci est un examen blanc SAA-C03 de format intégral : 65 questions, reflétant les pondérations des domaines du véritable examen — Concevoir des architectures sécurisées (questions 1 à 20, ~30 %), Concevoir des architectures résilientes (21 à 37, ~26 %), Concevoir des architectures performantes (38 à 53, ~24 %) et Concevoir des architectures optimisées en coûts (54 à 65, ~20 %).

**Comment le passer :**

- Réglez un minuteur sur **130 minutes** — la durée du véritable examen. Entraînez-vous au rythme : cela fait deux minutes par question.
- Sept questions indiquent **« (Choisissez DEUX.) »** — elles ont cinq options et exactement deux bonnes réponses, exactement comme les questions à réponse multiple du véritable examen. Les deux doivent être correctes pour marquer la question.
- Ne regardez pas le corrigé tant que vous n'avez pas terminé les 65 questions. Lors du véritable examen, il n'y a aucun retour en cours de route, et entraîner votre tolérance à l'incertitude fait partie de la préparation.
- Le véritable examen comprend 15 questions expérimentales non notées que vous ne pouvez pas identifier. Les 65 questions présentées ici sont toutes « notées ». Un seuil de réussite : **47 bonnes réponses ou plus (~72 %)** vous place dans la fourchette du score de réussite pondéré de 720/1000. En dessous de 47, revisitez les chapitres associés dans l'annexe B pour vos domaines faibles avant de réserver l'examen.
- Pour chaque question manquée — et chaque question réussie mais sur laquelle vous avez hésité — lisez l'analyse des distracteurs. L'examen teste les *différences* entre des options plausibles, et c'est là que se trouve l'apprentissage.

---

## Partie 1 — Concevoir des architectures sécurisées (questions 1 à 20)

**Question 1** *(Domain 1 — Task 1.1)*
Une entreprise de services financiers utilise AWS Organizations avec toutes les fonctionnalités activées. L'équipe de sécurité a attaché une service control policy (SCP) à la racine de l'organisation qui refuse l'utilisation de toutes les régions AWS sauf eu-west-1. Lors d'un audit, l'équipe découvre qu'un administrateur dans un compte a tout de même pu lancer des instances EC2 dans us-east-2 malgré la SCP. Quel compte a très probablement autorisé cette action ?

A) Un compte membre dans une unité organisationnelle (OU) imbriquée, car les SCP ne se propagent pas aux OU imbriquées
B) Le compte de gestion, car les SCP ne s'appliquent pas au compte de gestion
C) Un compte membre dont la politique d'administrateur IAM inclut un Allow explicite, qui prime sur les SCP
D) Un compte membre créé après l'attachement de la SCP, car les SCP ne s'appliquent qu'aux comptes qui existaient au moment de l'attachement

**Question 2** *(Domain 1 — Task 1.1)*
Une startup souhaite permettre à ses développeurs de créer des rôles IAM pour leurs applications, mais l'équipe de sécurité craint que les développeurs puissent créer des rôles avec plus d'autorisations qu'ils n'en ont eux-mêmes, conduisant à une élévation de privilèges. L'équipe de sécurité veut que les développeurs conservent la création de rôles en libre-service. Quelle est la solution la PLUS appropriée ?

A) Exiger que les développeurs soumettent les demandes de création de rôle via un système de tickets examiné par l'équipe de sécurité
B) Attacher une SCP aux comptes des développeurs qui refuse entièrement l'action iam:CreateRole
C) Exiger que tous les rôles créés par les développeurs incluent une permissions boundary spécifique, appliquée via une condition IAM sur iam:CreateRole et iam:AttachRolePolicy
D) Activer AWS CloudTrail et configurer des alertes chaque fois qu'un développeur crée un nouveau rôle IAM

**Question 3** *(Domain 1 — Task 1.1)*
Un fournisseur SaaS doit accéder aux ressources dans les comptes AWS de ses clients pour effectuer une analyse de coûts automatisée. Les clients créent un rôle IAM que le compte du fournisseur SaaS peut endosser. Un consultant en sécurité avertit qu'un tiers qui apprendrait l'ARN du rôle d'un client pourrait tromper le fournisseur SaaS pour qu'il accède au compte de ce client pour le compte du tiers. Quel mécanisme atténue ce risque de « député confus » (confused deputy) ?

A) Exiger l'authentification multifacteur (MFA) sur la politique de confiance du rôle inter-comptes
B) Exiger que le fournisseur SaaS transmette un ExternalId unique, défini par le client, dans l'appel sts:AssumeRole et validé par une condition dans la politique de confiance du rôle
C) Chiffrer l'ARN du rôle avec AWS KMS avant de le partager avec le fournisseur SaaS
D) Remplacer le rôle inter-comptes par un utilisateur IAM dont les clés d'accès sont renouvelées tous les 90 jours

**Question 4** *(Domain 1 — Task 1.1)*
Une entreprise avec 40 comptes AWS dans AWS Organizations souhaite que ses employés se connectent une seule fois avec leurs identifiants Microsoft Entra ID (Azure AD) existants et accèdent à tous les comptes AWS via un portail unique, avec des autorisations attribuées de manière centralisée par compte. Quelle solution répond à ces exigences avec le MOINS de charge opérationnelle ?

A) Créer des utilisateurs IAM dans chacun des 40 comptes et synchroniser les mots de passe avec Entra ID
B) Configurer AWS IAM Identity Center avec Entra ID comme fournisseur d'identité externe et attribuer des permission sets aux utilisateurs et groupes par compte
C) Déployer des Amazon Cognito user pools dans chaque compte et les fédérer à Entra ID
D) Créer un fournisseur d'identité SAML dans chaque compte et écrire manuellement des rôles IAM et des politiques de confiance par compte

**Question 5** *(Domain 1 — Task 1.1)*
Une entreprise de jeux mobiles construit une application où les joueurs s'inscrivent avec une adresse e-mail ou une connexion sociale, et après authentification, l'application doit téléverser des captures d'écran de joueurs directement vers un compartiment Amazon S3 à l'aide d'informations d'identification AWS temporaires. Quelle combinaison de services l'architecte de solutions devrait-il recommander ?

A) Un Amazon Cognito user pool pour l'inscription/connexion, et un Amazon Cognito identity pool pour échanger le jeton authentifié contre des informations d'identification AWS temporaires
B) Un Amazon Cognito identity pool pour l'inscription/connexion, et un Amazon Cognito user pool pour émettre des informations d'identification AWS temporaires
C) AWS IAM Identity Center pour l'inscription/connexion, et AWS STS GetSessionToken pour les informations d'identification
D) Un Amazon Cognito user pool seul, car les jetons du user pool accordent un accès direct à S3

**Question 6** *(Domain 1 — Task 1.3)*
Une entreprise de santé doit chiffrer les données dans Amazon S3 avec une clé qui prend en charge la rotation annuelle automatique gérée par AWS, tout en permettant à l'entreprise de définir la politique de clé, d'activer la journalisation CloudTrail de l'utilisation de la clé et de désactiver la clé si nécessaire. Quel type de clé KMS répond à ces exigences ?

A) Une clé gérée par AWS (aws/s3)
B) Une clé gérée par le client avec rotation automatique activée
C) Une clé détenue par AWS (AWS owned key)
D) Une clé gérée par le client avec matériel de clé importé (BYOK) et rotation automatique activée

**Question 7** *(Domain 1 — Task 1.3)*
Un architecte de solutions explique comment AWS KMS chiffre un fichier de 4 Go stocké par une application, étant donné que KMS ne peut chiffrer directement que jusqu'à 4 Ko de données. Quelle affirmation décrit avec précision le chiffrement par enveloppe ?

A) KMS divise le fichier en blocs de 4 Ko et chiffre chaque bloc avec la clé KMS
B) L'application demande une clé de données à KMS, chiffre le fichier localement avec la clé de données en clair, puis stocke la clé de données chiffrée à côté des données et supprime la clé de données en clair
C) KMS fait passer le fichier en flux via l'API KMS, qui le chiffre côté serveur avec la clé KMS
D) L'application chiffre le fichier avec une clé symétrique codée en dur, et KMS signe le résultat pour l'intégrité

**Question 8** *(Domain 1 — Task 1.3)*
Une entreprise stocke un mot de passe maître Amazon RDS for PostgreSQL et a besoin qu'il soit renouvelé automatiquement tous les 30 jours sans temps d'arrêt applicatif. L'application maintient des connexions de base de données de longue durée, donc l'équipe veut une stratégie de rotation où l'ancienne information d'identification reste valide pendant que la nouvelle est activée. Quelle solution répond à ces exigences ?

A) Des paramètres SecureString d'AWS Systems Manager Parameter Store avec une fonction Lambda déclenchée mensuellement
B) AWS Secrets Manager avec la stratégie de rotation à utilisateur unique
C) AWS Secrets Manager avec la stratégie de rotation à utilisateurs alternés, qui bascule entre deux utilisateurs de base de données de sorte qu'une information d'identification reste toujours valide
D) La rotation automatique de clé AWS KMS appliquée au mot de passe de la base de données

**Question 9** *(Domain 1 — Task 1.3)*
Une entreprise de médias stocke des vidéos brutes dans Amazon S3. La conformité exige que l'entreprise gère et fournisse ses propres clés de chiffrement, qu'AWS ne stocke jamais ces clés, et que les clés soient fournies à chaque requête. Quelle option de chiffrement répond à ces exigences ?

A) SSE-S3
B) SSE-KMS avec une clé gérée par le client
C) SSE-C
D) Chiffrement côté client à l'aide de la clé gérée par AWS aws/s3

**Question 10** *(Domain 1 — Task 1.3)*
Un courtier-négociant doit conserver les enregistrements de transactions dans Amazon S3 pendant sept ans d'une manière qui empêche quiconque — y compris l'utilisateur root du compte AWS — de supprimer ou d'écraser les objets pendant la période de rétention, afin de satisfaire à la règle SEC 17a-4. Quelle configuration répond à cette exigence ?

A) S3 Object Lock en mode gouvernance avec une période de rétention de 7 ans
B) S3 Object Lock en mode conformité avec une période de rétention de 7 ans sur un compartiment avec gestion des versions activée
C) Une politique de compartiment S3 refusant s3:DeleteObject pour tous les principaux
D) S3 Glacier Deep Archive avec une règle de cycle de vie qui fait expirer les objets après 7 ans

**Question 11** *(Domain 1 — Task 1.2)*
Une application web s'exécute sur des instances EC2 derrière un Application Load Balancer. Un ingénieur réseau ajoute une règle de network ACL au sous-réseau autorisant le port TCP 443 entrant depuis 0.0.0.0/0, mais les clients ne peuvent toujours pas effectuer de requêtes HTTPS. Les groupes de sécurité sont configurés correctement. Quelle est la cause la PLUS probable ?

A) La network ACL est à état et nécessite une règle de suivi de connexion
B) La network ACL n'a aucune règle sortante autorisant les ports éphémères (1024–65535), donc le trafic de retour est bloqué parce que les NACL sont sans état
C) Le groupe de sécurité doit également autoriser le port 443 sortant, car les groupes de sécurité sont sans état
D) Les network ACL ne peuvent pas autoriser le trafic depuis 0.0.0.0/0 ; un CIDR spécifique est requis

**Question 12** *(Domain 1 — Task 1.2)*
Quelles DEUX affirmations sur les groupes de sécurité et les network ACL dans un VPC sont exactes ? (Choisissez DEUX.)

A) Les groupes de sécurité sont à état, donc le trafic de retour est automatiquement autorisé indépendamment des règles sortantes
B) Les network ACL évaluent les règles dans l'ordre numérique et prennent en charge les règles Deny explicites
C) Les groupes de sécurité prennent en charge à la fois les règles Allow et Deny
D) Les network ACL sont attachées à des interfaces réseau élastiques individuelles
E) Les règles des groupes de sécurité sont évaluées dans l'ordre numérique, en s'arrêtant à la première correspondance

**Question 13** *(Domain 1 — Task 1.2)*
Une entreprise de commerce électronique exécutant une application accessible au public sur CloudFront et ALB s'inquiète des attaques DDoS de grande envergure et sophistiquées. L'entreprise souhaite un accès 24/7 à l'AWS Shield Response Team, une protection des coûts contre les frais de mise à l'échelle causés par les attaques, et des diagnostics d'attaque. Quel service devrait-elle utiliser ?

A) AWS Shield Standard, activé automatiquement sans frais
B) AWS Shield Advanced
C) AWS WAF avec des règles basées sur le débit
D) Amazon GuardDuty avec le plan de protection EC2

**Question 14** *(Domain 1 — Task 1.2)*
Une API REST derrière un Application Load Balancer subit des tentatives d'injection SQL et des requêtes excessives provenant d'un petit ensemble d'adresses IP. Quelle solution bloque les modèles de requêtes malveillantes à la périphérie de l'application avec le MOINS d'effort de développement ?

A) Ajouter du code de validation des entrées à chaque gestionnaire d'API
B) Associer AWS WAF à l'ALB, en utilisant le groupe de règles géré contre l'injection SQL et une règle basée sur le débit
C) Activer AWS Shield Standard sur l'ALB
D) Configurer le groupe de sécurité de l'ALB pour refuser les requêtes contenant des mots-clés SQL

**Question 15** *(Domain 1 — Task 1.2)*
Une entreprise souhaite répondre à trois besoins de sécurité : (1) détecter en continu les instances EC2 compromises et l'activité API anormale à l'aide du renseignement sur les menaces, (2) découvrir et classer les informations personnellement identifiables (PII) stockées dans les compartiments S3, et (3) analyser les instances EC2 et les images de conteneurs à la recherche de vulnérabilités logicielles (CVE). Quelle association de services AWS aux besoins est correcte ?

A) 1 : Amazon Inspector, 2 : Amazon GuardDuty, 3 : Amazon Macie
B) 1 : Amazon GuardDuty, 2 : Amazon Macie, 3 : Amazon Inspector
C) 1 : Amazon Macie, 2 : Amazon Inspector, 3 : Amazon GuardDuty
D) 1 : Amazon GuardDuty, 2 : Amazon Inspector, 3 : Amazon Macie

**Question 16** *(Domain 1 — Task 1.2)*
Une application s'exécutant sur des instances EC2 dans des sous-réseaux privés doit téléverser des objets vers Amazon S3 et appeler Amazon DynamoDB. La politique de l'entreprise interdit que le trafic traverse l'Internet public, et l'équipe veut l'option la moins coûteuse pour les deux services. Quelle solution répond à ces exigences ?

A) Une NAT gateway dans un sous-réseau public
B) Des gateway VPC endpoints pour S3 et DynamoDB, référencés dans les tables de routage des sous-réseaux
C) Des interface VPC endpoints (AWS PrivateLink) pour S3 et DynamoDB
D) Une internet gateway avec des règles de groupe de sécurité restrictives

**Question 17** *(Domain 1 — Task 1.3)*
À la suite d'un incident de server-side request forgery (SSRF) au cours duquel un attaquant a récupéré les informations d'identification de rôle IAM depuis le service de métadonnées d'une instance EC2 via une application web vulnérable, une équipe de sécurité souhaite renforcer toutes les instances contre cette classe d'attaque. Que devrait faire l'équipe ?

A) Imposer IMDSv2 en exigeant des jetons de session (HttpTokens=required), de sorte que les requêtes de métadonnées nécessitent un jeton obtenu par PUT que de simples requêtes SSRF ne peuvent pas acquérir
B) Désactiver le service de métadonnées d'instance sur toutes les instances, car les applications n'en ont jamais besoin
C) Bloquer 169.254.169.254 dans la network ACL du sous-réseau
D) Déplacer les informations d'identification du rôle d'instance dans un fichier de configuration sur l'instance

**Question 18** *(Domain 1 — Task 1.3)*
Un architecte de solutions doit stocker environ 200 valeurs de configuration d'application en clair (drapeaux de fonctionnalité, noms d'environnement, URL de points de terminaison) et 5 mots de passe de base de données. Les mots de passe nécessitent une rotation automatique ; les valeurs de configuration non, et l'équipe veut minimiser les coûts. Quelle combinaison est la PLUS économique ?

A) Tout stocker dans AWS Secrets Manager
B) Tout stocker dans des paramètres standard d'AWS Systems Manager Parameter Store
C) Stocker les valeurs de configuration dans des paramètres standard de Parameter Store (sans frais) et les mots de passe dans AWS Secrets Manager avec rotation activée
D) Stocker les valeurs de configuration dans S3 et les mots de passe dans des paramètres SecureString de Parameter Store avec rotation automatique intégrée

**Question 19** *(Domain 1 — Task 1.3)*
Une entreprise chiffre les objets S3 avec SSE-KMS à l'aide d'une clé gérée par le client. Une application dans le même compte lit ces objets des milliers de fois par seconde, et l'équipe constate une limitation (throttling) et des préoccupations de coût liées aux appels d'API KMS. Quel changement réduit le trafic de requêtes KMS tout en conservant le chiffrement SSE-KMS ?

A) Basculer le compartiment vers SSE-S3, qui n'utilise aucune clé
B) Activer les S3 Bucket Keys, de sorte que S3 utilise une clé de courte durée au niveau du compartiment pour réduire les appels à KMS
C) Désactiver la rotation automatique de clé sur la clé gérée par le client
D) Remplacer la clé gérée par le client par un matériel de clé importé

**Question 20** *(Domain 1 — Task 1.1)*
Quelles DEUX affirmations sur l'évaluation des politiques IAM et AWS Organizations sont exactes ? (Choisissez DEUX.)

A) Les SCP accordent des autorisations aux utilisateurs et rôles IAM dans les comptes membres
B) Un Deny explicite dans toute politique applicable prime toujours sur tout Allow
C) Les politiques basées sur les ressources ne peuvent pas accorder d'accès inter-comptes sans une SCP
D) Une permissions boundary définit les autorisations maximales qu'une politique basée sur l'identité peut accorder à un utilisateur ou un rôle, mais n'accorde rien par elle-même
E) Si aucune politique ne mentionne une action, l'action est autorisée par défaut pour les utilisateurs IAM

---

## Partie 2 — Concevoir des architectures résilientes (questions 21 à 37)

**Question 21** *(Domain 2 — Task 2.2)*
Un détaillant en ligne exécute Amazon RDS for MySQL. La base de données subit un trafic de lecture intense provenant des tableaux de bord de reporting, et l'entreprise a également besoin que la base de données survive à une panne de zone de disponibilité avec un basculement automatique et sans intervention manuelle. Quelle combinaison répond aux DEUX exigences ?

A) Activer uniquement le déploiement Multi-AZ ; l'instance de secours peut servir les lectures de reporting
B) Créer uniquement des réplicas en lecture ; un réplica est automatiquement promu lorsque l'AZ du primaire tombe en panne
C) Activer le déploiement Multi-AZ pour le basculement automatique, et ajouter des réplicas en lecture pour décharger les lectures de reporting
D) Migrer vers une classe d'instance mono-AZ plus grande pour gérer les deux charges de travail

**Question 22** *(Domain 2 — Task 2.2)*
Une entreprise souhaite une haute disponibilité RDS entre les zones de disponibilité, mais elle s'oppose à payer pour une instance de secours Multi-AZ traditionnelle qui ne sert aucun trafic. Quelle option de déploiement RDS fournit un basculement automatique ET permet à la capacité de secours de servir le trafic de lecture ?

A) Déploiement d'instance de base de données RDS Multi-AZ (une instance de secours)
B) Déploiement de cluster de base de données RDS Multi-AZ, qui dispose de deux instances de secours lisibles avec un point de terminaison de lecture
C) Réplicas en lecture RDS dans trois AZ avec un Application Load Balancer
D) RDS Single-AZ avec sauvegardes automatisées

**Question 23** *(Domain 2 — Task 2.2)*
Une plateforme de paiements mondiale sur Amazon Aurora doit basculer vers une seconde région AWS si la région primaire devient indisponible. L'équipe de conformité demande si Aurora Global Database peut garantir une perte de données nulle (RPO = 0) entre les régions. Que devrait leur dire l'architecte de solutions ?

A) Oui — Aurora Global Database réplique de manière synchrone entre les régions, donc le RPO est exactement 0
B) Non — Aurora Global Database utilise une réplication asynchrone basée sur le stockage avec un décalage typique inférieur à 1 seconde, donc le RPO inter-régions est proche de zéro mais jamais garanti à exactement 0
C) Oui — mais uniquement si le write forwarding est activé dans la région secondaire
D) Non — Aurora Global Database réplique selon un calendrier de 5 minutes, donnant un RPO de 5 minutes

**Question 24** *(Domain 2 — Task 2.2)*
Le plan de reprise après sinistre d'une entreprise stipule : « Après une panne régionale, le système de commandes doit être de nouveau opérationnel dans les 4 heures, et pas plus de 15 minutes de transactions ne peuvent être perdues. » Quelle affirmation associe correctement ces chiffres aux métriques de DR ?

A) RTO = 15 minutes ; RPO = 4 heures
B) RTO = 4 heures ; RPO = 15 minutes
C) MTBF = 4 heures ; MTTR = 15 minutes
D) RPO = 4 heures ; SLA = 15 minutes

**Question 25** *(Domain 2 — Task 2.2)*
Une compagnie d'assurance a besoin d'une stratégie de DR pour une application critique. Exigences : les données doivent être répliquées en continu vers la région de DR ; l'infrastructure de base (base de données, AMI, pile minimale) doit déjà exister dans la région de DR mais le calcul doit rester éteint jusqu'à un sinistre, pour maîtriser les coûts ; un RTO de quelques dizaines de minutes est acceptable. Quelle stratégie de DR correspond ?

A) Sauvegarde et restauration
B) Pilot light — éléments de base provisionnés dans la région de DR avec données répliquées en direct, mais calcul éteint jusqu'au basculement
C) Warm standby — une copie complète à échelle réduite mais toujours en cours d'exécution de la charge de travail
D) Multi-site actif/actif

**Question 26** *(Domain 2 — Task 2.2)*
Quelles DEUX affirmations sur les stratégies de reprise après sinistre AWS sont exactes ? (Choisissez DEUX.)

A) La sauvegarde et restauration exige que les ressources soient préprovisionnées et en cours d'exécution dans la région de récupération
B) La sauvegarde et restauration offre le RTO le plus faible des quatre stratégies
C) Le multi-site actif/actif sert le trafic depuis plusieurs régions simultanément et offre un RTO proche de zéro au coût le plus élevé
D) Le pilot light maintient une copie pleine capacité de l'application servant le trafic de production dans la région de récupération
E) Le warm standby maintient une copie à échelle réduite mais pleinement fonctionnelle de la charge de travail toujours en cours d'exécution dans la région de récupération

**Question 27** *(Domain 2 — Task 2.1)*
Une application de traitement d'images lit des messages depuis une file standard Amazon SQS. Le traitement d'une image prend jusqu'à 3 minutes, mais le délai de visibilité de la file est réglé sur 30 secondes. Les utilisateurs signalent que certaines images sont traitées deux ou trois fois. Quelle est la cause la PLUS probable et le correctif ?

A) La file est FIFO ; basculer vers une file standard
B) Le délai de visibilité expire avant la fin du traitement, rendant le message de nouveau visible pour d'autres consommateurs ; augmenter le délai de visibilité au-delà du temps de traitement
C) L'interrogation longue est désactivée ; activer un ReceiveMessageWaitTime de 20 secondes
D) La période de rétention des messages est trop courte ; l'augmenter à 14 jours

**Question 28** *(Domain 2 — Task 2.1)*
Une application de facturation consomme des messages depuis une file SQS. Occasionnellement, un message malformé fait échouer le consommateur à répétition, et le message circule indéfiniment dans la file, gaspillant du calcul. Que devrait configurer l'architecte ?

A) Une dead-letter queue avec une politique de redrive maxReceiveCount, de sorte que les messages qui échouent à répétition soient mis de côté pour analyse
B) Un délai de visibilité plus court pour que le mauvais message soit réessayé plus rapidement
C) L'ordonnancement FIFO, qui rejette automatiquement les messages malformés
D) Une période de rétention des messages de 1 minute pour que les mauvais messages expirent vite

**Question 29** *(Domain 2 — Task 2.1)*
Une société de courtage traite des événements de transaction par compte client. Les événements pour le même compte doivent être traités strictement dans l'ordre et exactement une fois, mais les événements pour différents comptes peuvent être traités en parallèle pour le débit. Quelle solution répond à ces exigences ?

A) Une file standard SQS avec un seul thread consommateur
B) Une file FIFO SQS utilisant l'identifiant du compte client comme MessageGroupId, qui préserve l'ordre au sein de chaque groupe tout en permettant le parallélisme entre les groupes
C) Un sujet SNS standard avec filtrage des messages par identifiant de compte
D) Une file FIFO SQS avec un seul MessageGroupId pour tous les clients

**Question 30** *(Domain 2 — Task 2.1)*
Lorsqu'une commande est passée, une plateforme de commerce électronique doit déclencher simultanément trois processus indépendants : génération de facture, traitement de l'entrepôt et ingestion analytique. Chaque processus doit recevoir chaque événement de commande, le tamponner durablement et le traiter à son propre rythme. Quelle architecture répond à ces exigences ?

A) Une file SQS avec trois consommateurs interrogeant la même file
B) Un sujet SNS qui diffuse vers trois files SQS, une abonnée par processus
C) Trois fonctions Lambda invoquées séquentiellement par Step Functions
D) Un sujet SNS avec trois abonnements par e-mail

**Question 31** *(Domain 2 — Task 2.1)*
Lors d'une vente flash, une fonction Lambda déclenchée par API Gateway commence à renvoyer des erreurs de limitation 429 tandis que d'autres fonctions Lambda critiques dans le même compte commencent également à être limitées. Le compte est à son quota de simultanéité par défaut. Quelle action protège les fonctions critiques de la famine causée par la fonction de vente ?

A) Augmenter le délai d'expiration de la fonction de vente de 3 secondes au maximum de 15 minutes
B) Configurer une simultanéité réservée sur les fonctions critiques (et éventuellement plafonner la fonction de vente), leur garantissant une simultanéité dédiée à partir du pool du compte
C) Activer la simultanéité provisionnée sur la fonction de vente, ce qui augmente le quota à l'échelle du compte
D) Déplacer les fonctions critiques vers une configuration de mémoire de 10 Go

**Question 32** *(Domain 2 — Task 2.1)*
Une entreprise de médias a un flux de travail de publication de vidéos avec une étape qui attend jusqu'à 2 jours qu'un modérateur humain approuve le contenu via un outil externe avant de continuer. Le flux de travail doit être auditable, s'exécuter pendant des jours et reprendre exactement là où il s'est arrêté une fois que le modérateur répond. Quelle solution convient le MIEUX ?

A) Un flux de travail Step Functions Express avec un état Wait
B) Un flux de travail Step Functions Standard utilisant le modèle de callback : un jeton de tâche (waitForTaskToken) est envoyé au système de modération, et le flux de travail reprend lorsque SendTaskSuccess est appelé
C) Une fonction Lambda qui se met en veille jusqu'à ce que le modérateur approuve
D) Une règle EventBridge avec un délai planifié de 2 jours

**Question 33** *(Domain 2 — Task 2.1)*
Une entreprise exécute un pipeline d'ingestion IoT à haut volume exécutant environ 90 000 exécutions de flux de travail courtes par seconde, chacune se terminant en moins de 5 secondes. La sémantique d'exécution exactement une fois n'est pas requise, mais le coût doit être minimisé. Séparément, un flux de travail mensuel de rapprochement financier s'exécute pendant 12 heures et nécessite une exécution exactement une fois avec un historique d'exécution complet. Quels types de flux de travail Step Functions devraient être utilisés ?

A) Des flux de travail Express pour le pipeline IoT ; des flux de travail Standard pour le rapprochement
B) Des flux de travail Standard pour les deux
C) Des flux de travail Express pour les deux, puisque Express prend en charge jusqu'à un an d'exécution
D) Des flux de travail Standard pour le pipeline IoT ; des flux de travail Express pour le rapprochement

**Question 34** *(Domain 2 — Task 2.2)*
Une entreprise héberge son application web principale sur un ALB dans us-east-1 et une copie de récupération passive dans us-west-2. L'entreprise souhaite que Route 53 envoie tout le trafic vers us-east-1 et redirige automatiquement les utilisateurs vers us-west-2 uniquement lorsque le point de terminaison primaire devient défaillant. Quelle configuration Route 53 répond à cette exigence ?

A) Routage pondéré avec des poids 50/50
B) Routage de basculement avec une vérification de santé sur l'enregistrement primaire et l'enregistrement us-west-2 défini comme secondaire
C) Routage basé sur la latence entre les deux régions
D) Routage par géolocalisation avec un enregistrement par défaut pointant vers us-west-2

**Question 35** *(Domain 2 — Task 2.2)*
Un groupe Auto Scaling exécute des serveurs web EC2 derrière un Application Load Balancer dans trois zones de disponibilité. L'ALB marque certaines instances comme défaillantes parce que le processus du serveur web plante, pourtant le groupe Auto Scaling ne les remplace jamais parce que les instances EC2 elles-mêmes réussissent toujours les vérifications d'état (status checks). Que devrait changer l'architecte de solutions ?

A) Activer la surveillance CloudWatch détaillée sur les instances
B) Configurer le groupe Auto Scaling pour utiliser les vérifications de santé ELB en plus des status checks EC2, de sorte que les instances échouant à la santé de la cible ALB soient terminées et remplacées
C) Augmenter la période de grâce des vérifications de santé de l'ASG
D) Basculer l'ALB vers un Network Load Balancer

**Question 36** *(Domain 2 — Task 2.1)*
Une société de trading a besoin d'un équilibreur de charge pour un protocole TCP personnalisé qui doit gérer des millions de requêtes par seconde avec une latence ultra-faible et exposer une adresse IP statique par zone de disponibilité. Quel équilibreur de charge la société devrait-elle choisir ?

A) Application Load Balancer
B) Network Load Balancer
C) Gateway Load Balancer
D) Classic Load Balancer

**Question 37** *(Domain 2 — Task 2.2)*
Quelles DEUX affirmations sur la création d'un stockage résilient sur AWS sont exactes ? (Choisissez DEUX.)

A) S3 Cross-Region Replication copie rétroactivement tous les objets qui existaient avant la configuration de la réplication, sans action supplémentaire
B) Les classes de stockage Amazon EFS Standard stockent les données de manière redondante dans plusieurs zones de disponibilité et peuvent être montées simultanément par des instances dans différentes AZ
C) S3 Cross-Region Replication nécessite que la gestion des versions soit activée sur les compartiments source et de destination
D) Les volumes Amazon EFS ne peuvent être attachés qu'à une seule instance EC2 à la fois, comme EBS
E) Activer la gestion des versions S3 réplique automatiquement les objets vers une autre région

---

## Partie 3 — Concevoir des architectures performantes (questions 38 à 53)

**Question 38** *(Domain 3 — Task 3.1)*
Une entreprise d'analyse de médias exécute une base de données PostgreSQL sur Amazon RDS utilisant un volume EBS gp3. Une nouvelle charge de travail de reporting nécessite 50 000 IOPS soutenus avec une latence inférieure à la milliseconde et une garantie de durabilité de 99,999 %. Le volume doit prendre en charge cela de manière constante sans bursting. Quel type de volume EBS un architecte de solutions devrait-il recommander ?

A) gp3 provisionné avec un maximum d'IOPS
B) io2 Block Express
C) st1 Throughput Optimized HDD
D) gp2 avec une taille de volume de 16 Tio

**Question 39** *(Domain 3 — Task 3.1)*
Une société de recherche en génomique a besoin d'un stockage de fichiers partagé pour un cluster de calcul haute performance (HPC) basé sur Linux de 500 instances EC2. La charge de travail nécessite des latences inférieures à la milliseconde et des centaines de Go/s de débit agrégé, et les jeux de données d'entrée sont stockés dans Amazon S3. Quel service de stockage répond le mieux à ces exigences ?

A) Amazon EFS avec le mode de performance Max I/O
B) Amazon FSx for Windows File Server avec stockage SSD
C) Amazon FSx for Lustre lié au compartiment S3
D) Amazon S3 accédé via Mountpoint sur chaque instance

**Question 40** *(Domain 3 — Task 3.1)*
Une entreprise migre une application Windows sur site qui s'appuie sur des partages de fichiers SMB et des listes de contrôle d'accès intégrées à Active Directory. L'application s'exécutera sur des instances EC2 Windows dans deux zones de disponibilité et doit conserver ses permissions NTFS existantes. Quel service de stockage AWS l'architecte de solutions devrait-il choisir ?

A) Amazon EFS avec des permissions POSIX
B) Amazon FSx for Windows File Server en mode de déploiement Multi-AZ
C) Amazon S3 avec des politiques de compartiment mappées sur des groupes AD
D) Amazon FSx for Lustre avec stockage persistant

**Question 41** *(Domain 3 — Task 3.1)*
Une société de production vidéo à Singapour téléverse des fichiers de séquences brutes de 40 Go vers un compartiment S3 dans us-east-1 depuis des bureaux du monde entier. Les téléversements échouent fréquemment en cours de route sur l'Internet public, forçant des redémarrages complets, et les temps de transfert globaux sont lents. Quelle combinaison d'actions un architecte de solutions devrait-il recommander ? (Choisissez DEUX.)

A) Convertir le compartiment en S3 One Zone-IA pour améliorer le débit d'écriture
B) Placer un Application Load Balancer devant le compartiment dans chaque région
C) Activer S3 Cross-Region Replication vers un compartiment dans ap-southeast-1
D) Activer S3 Transfer Acceleration sur le compartiment et téléverser via le point de terminaison accéléré
E) Utiliser le téléversement multipart pour les gros fichiers

**Question 42** *(Domain 3 — Task 3.1)*
Une plateforme d'enchères en temps réel exécute une charge de travail NoSQL sur EC2 qui nécessite la latence de stockage la plus faible absolue pour des données de travail temporaires. Les données sont régénérées au démarrage et n'ont pas besoin de survivre à l'arrêt ou à la terminaison de l'instance. Quelle option de stockage offre les meilleures performances pour ce cas d'usage ?

A) Un volume EBS io2 avec 64 000 IOPS provisionnés
B) Des volumes de stockage d'instance (NVMe SSD) sur une instance optimisée pour le stockage
C) Amazon EFS en mode General Purpose
D) Un volume EBS gp3 avec un débit provisionné maximal

**Question 43** *(Domain 3 — Task 3.3)*
Une entreprise de jeux stocke les données de session des joueurs dans une table DynamoDB avec la clé de partition `game_id`. Il n'y a que 12 jeux populaires, et la table subit une limitation (throttling) sur quelques partitions alors que la capacité consommée globale est bien inférieure à la capacité provisionnée. Que devrait recommander un architecte de solutions ?

A) Basculer la table vers la capacité provisionnée avec auto scaling
B) Utiliser une clé de partition à forte cardinalité, comme une composition de game_id et player_id
C) Créer un index secondaire local sur player_id
D) Activer DynamoDB Streams pour répartir les écritures entre les partitions

**Question 44** *(Domain 3 — Task 3.3)*
Un site de commerce électronique stocke les données du catalogue de produits dans DynamoDB. Le trafic de lecture est extrêmement axé sur la lecture avec les mêmes éléments demandés des millions de fois par jour, et l'équipe a besoin d'une latence de lecture en microsecondes sans réécrire les appels d'API DynamoDB de l'application. Que devrait recommander l'architecte de solutions ?

A) Déployer Amazon ElastiCache for Redis et modifier l'application pour vérifier d'abord le cache
B) Ajouter DynamoDB Accelerator (DAX) devant la table
C) Créer un index secondaire global pour distribuer les lectures
D) Activer DynamoDB Global Tables dans une seconde région

**Question 45** *(Domain 3 — Task 3.3)*
Une entreprise de logistique a une table DynamoDB en production qui a besoin d'un nouveau modèle de requête : interroger les expéditions par `carrier_id` et trier par `delivery_date`, avec son propre débit provisionné afin que les nouvelles requêtes analytiques n'affectent pas l'application principale. La table existe déjà et a du trafic en direct. Quelle solution répond à ces exigences ?

A) Créer un index secondaire local avec carrier_id comme clé de tri
B) Créer un index secondaire global avec carrier_id comme clé de partition et delivery_date comme clé de tri
C) Recréer la table avec une clé primaire composite de carrier_id et delivery_date
D) Activer un DynamoDB Stream et interroger le flux par carrier_id

**Question 46** *(Domain 3 — Task 3.3)*
Un service de gestion de sessions stocke les sessions utilisateur dans DynamoDB. Les sessions deviennent inutiles après 24 heures, et l'équipe veut que les éléments expirés soient supprimés automatiquement sans coût supplémentaire. Que devrait mettre en œuvre l'architecte de solutions ?

A) Une fonction Lambda planifiée qui analyse la table toutes les heures et supprime les anciens éléments
B) DynamoDB Time to Live (TTL) avec un attribut d'horodatage d'expiration sur chaque élément
C) Une politique de cycle de vie sur la table DynamoDB
D) DynamoDB Streams avec un filtre pour rejeter les éléments de plus de 24 heures

**Question 47** *(Domain 3 — Task 3.3)*
Une application sans serveur utilise des fonctions Lambda qui se connectent à une base de données Amazon RDS for MySQL. Lors des pics de trafic, des centaines d'invocations Lambda simultanées épuisent la limite de connexions de la base de données, provoquant des erreurs. Quelle solution résout cela avec le moins de modification applicative ?

A) Augmenter la taille de l'instance RDS pour relever max_connections
B) Placer Amazon RDS Proxy entre les fonctions Lambda et la base de données
C) Migrer la base de données vers DynamoDB
D) Configurer une simultanéité réservée Lambda de 10

**Question 48** *(Domain 3 — Task 3.3)*
Un site d'actualités financières utilise Amazon Aurora MySQL. Le trafic de lecture est multiplié par 20 pendant les heures de marché et l'instance primaire est limitée par le CPU à servir des requêtes SELECT. Les écritures sont modestes. Quelle est la manière la PLUS efficace sur le plan opérationnel de mettre à l'échelle les lectures ?

A) Ajouter des Aurora Replicas et diriger le trafic de lecture vers le point de terminaison de lecture du cluster avec auto scaling
B) Créer une instance de secours Multi-AZ et envoyer les lectures vers l'instance de secours
C) Partitionner la base de données entre plusieurs clusters Aurora
D) Activer Aurora Backtrack pour décharger les lectures

**Question 49** *(Domain 3 — Task 3.4)*
Une entreprise de jeux multijoueurs exécute une application sensible à la latence utilisant le protocole UDP sur des Network Load Balancers dans deux régions AWS. Les joueurs du monde entier ont besoin d'adresses IP statiques pour l'inscription sur liste d'autorisation et d'un basculement régional rapide. Quel service l'architecte de solutions devrait-il choisir ?

A) Amazon CloudFront avec deux origines personnalisées
B) AWS Global Accelerator avec des groupes de points de terminaison dans les deux régions
C) Amazon Route 53 avec routage basé sur la latence
D) Un Application Load Balancer avec équilibrage de charge inter-zones

**Question 50** *(Domain 3 — Task 3.4)*
Une entreprise de streaming doit se conformer aux règles de licence de contenu : les utilisateurs en Allemagne doivent toujours être servis depuis le déploiement eu-central-1, et les utilisateurs en France depuis le déploiement eu-west-3, indépendamment du point de terminaison offrant la latence la plus faible. Quelle politique de routage Route 53 devrait être utilisée ?

A) Routage basé sur la latence
B) Routage par géolocalisation
C) Routage par géoproximité avec un biais positif sur eu-central-1
D) Routage pondéré avec des poids 50/50

**Question 51** *(Domain 3 — Task 3.2)*
Un architecte de solutions déploie une charge de travail HPC fortement couplée qui utilise MPI et nécessite la plus faible latence réseau possible et la plus haute performance de paquets par seconde entre 32 instances EC2. Quelle stratégie de placement devrait être utilisée ?

A) Groupe de placement spread dans trois zones de disponibilité
B) Groupe de placement partition avec 7 partitions
C) Groupe de placement cluster dans une seule zone de disponibilité
D) Lancer les instances dans des sous-réseaux séparés avec une mise en réseau améliorée

**Question 52** *(Domain 3 — Task 3.5)*
Une entreprise IoT ingère des données de flux de clics qui doivent être livrées à Amazon S3 en quasi temps réel pour l'analytique. L'équipe veut une solution entièrement gérée sans application consommatrice à écrire, sans gestion de shards, et avec une mise en mémoire tampon des enregistrements et une conversion de format en Parquet intégrées. Quel service devrait-elle utiliser ?

A) Amazon Kinesis Data Streams avec un consommateur Lambda
B) Amazon Data Firehose (anciennement Kinesis Data Firehose) avec une destination S3
C) Amazon SQS avec une flotte d'interrogateurs EC2
D) Amazon MSK avec un sink Kafka Connect personnalisé

**Question 53** *(Domain 3 — Task 3.5)*
Une entreprise stocke des journaux d'application sous forme de fichiers JSON compressés dans Amazon S3 et veut que les analystes exécutent des requêtes SQL ad hoc contre eux sans provisionner de serveurs ni charger les données dans une base de données. Le schéma doit être découvert et catalogué automatiquement. Quelle combinaison l'architecte de solutions devrait-il recommander ?

A) Amazon Redshift avec des commandes COPY et des actualisations planifiées
B) Des crawlers AWS Glue pour peupler le Data Catalog et Amazon Athena pour les requêtes SQL
C) Amazon EMR avec un cluster Presto de longue durée
D) Amazon RDS for PostgreSQL avec l'extension aws_s3

---

## Partie 4 — Concevoir des architectures optimisées en coûts (questions 54 à 65)

**Question 54** *(Domain 4 — Task 4.2)*
Un institut de recherche exécute des simulations par lots nocturnes sur EC2 qui prennent environ 90 minutes, sauvegardent leur progression (checkpoint) vers Amazon S3 toutes les 5 minutes, et peuvent être redémarrées à partir du dernier point de contrôle à tout moment. L'institut veut le coût de calcul le plus bas possible. Quelle option d'achat l'architecte de solutions devrait-il recommander ?

A) Des instances À la demande dans une seule AZ
B) Des Standard Reserved Instances avec un terme de 3 ans
C) Des instances Spot utilisant un Spot Fleet diversifié entre plusieurs types d'instances et AZ
D) Un Compute Savings Plan dimensionné pour le pic de la charge de travail par lots

**Question 55** *(Domain 4 — Task 4.2)*
Une entreprise SaaS a une dépense de calcul de base stable mais prévoit de migrer des charges de travail entre EC2, AWS Fargate et AWS Lambda au cours des trois prochaines années à mesure qu'elle se modernise. Elle veut une remise basée sur l'engagement qui s'applique automatiquement aux trois services de calcul et à toutes les régions. Quelle option l'architecte de solutions devrait-il recommander ?

A) EC2 Instance Savings Plan
B) Standard Reserved Instances
C) Compute Savings Plan
D) Convertible Reserved Instances

**Question 56** *(Domain 4 — Task 4.2)*
Une entreprise a acheté des Standard Reserved Instances de 3 ans pour Amazon RDS et pour Amazon EC2. Après une réarchitecture, elle n'a plus besoin d'aucune des deux réservations. L'équipe financière demande quelles réservations peuvent être vendues pour récupérer des coûts. Que devrait leur dire l'architecte de solutions ?

A) Les Reserved Instances EC2 et RDS peuvent toutes deux être vendues sur le Reserved Instance Marketplace
B) Seules les Reserved Instances EC2 peuvent être vendues sur le Reserved Instance Marketplace ; les RI RDS ne peuvent pas être revendues
C) Seules les Reserved Instances RDS peuvent être vendues, car les réservations de base de données sont transférables
D) Aucune ne peut être vendue ; les Reserved Instances sont non remboursables et non transférables dans tous les cas

**Question 57** *(Domain 4 — Task 4.2)*
Une équipe de développement exécute un traitement de données conteneurisé et tolérant aux pannes sur Amazon ECS avec de la capacité EC2 Spot. Elle a besoin que les workers se vident proprement et sauvegardent leur état (checkpoint) avant la récupération de la capacité. Quel délai d'avertissement AWS fournit-il avant qu'une instance Spot soit interrompue ?

A) Aucun avertissement n'est fourni
B) Un avis d'interruption de 2 minutes
C) Un avis d'interruption de 15 minutes
D) Une fenêtre de rééquilibrage de 24 heures

**Question 58** *(Domain 4 — Task 4.1)*
Une archive de santé stocke des enregistrements de conformité dans Amazon S3 qui sont rarement consultés mais, lorsqu'ils sont assignés à comparaître, doivent être récupérables dans les 5 minutes. Les enregistrements sont conservés pendant 7 ans et le coût de stockage doit être minimisé. Quelle classe de stockage répond à ces exigences ?

A) S3 Glacier Deep Archive avec récupération Standard
B) S3 Glacier Flexible Retrieval avec des récupérations Expedited en cas de besoin
C) S3 Glacier Flexible Retrieval avec des récupérations Bulk
D) S3 Standard-IA

**Question 59** *(Domain 4 — Task 4.1)*
Une startup de partage de photos stocke des images miniatures facilement reproductibles qui sont consultées peu fréquemment. L'équipe veut l'option d'accès peu fréquent la moins coûteuse et accepte que la perte d'une seule zone de disponibilité puisse nécessiter de régénérer les miniatures à partir des originaux. Quelle classe de stockage devrait être utilisée ?

A) S3 Standard-IA
B) S3 One Zone-IA
C) S3 Intelligent-Tiering
D) S3 Glacier Instant Retrieval

**Question 60** *(Domain 4 — Task 4.1)*
Une entreprise a un compartiment S3 avec des millions d'objets dont les modèles d'accès sont inconnus et changent de manière imprévisible. Un architecte de solutions évalue S3 Intelligent-Tiering. Quelles DEUX affirmations sur Intelligent-Tiering sont exactes ? (Choisissez DEUX.)

A) Il facture des frais de surveillance et d'automatisation modiques par objet pour les objets qu'il surveille
B) Il facture des frais de récupération chaque fois qu'un objet revient vers le niveau Frequent Access
C) Les objets de moins de 128 Ko ne sont pas surveillés ni transférés automatiquement et sont facturés au tarif du niveau Frequent Access
D) Il réplique automatiquement les objets vers une seconde région
E) Il exige une durée de stockage minimale de 90 jours pour chaque objet

**Question 61** *(Domain 4 — Task 4.1)*
Une équipe d'analytique abandonne fréquemment de gros téléversements multipart vers un compartiment de lac de données S3, et AWS Cost Explorer montre que les frais de stockage augmentent même si le nombre d'objets visibles du compartiment reste stable. Quel est le correctif le PLUS économique ?

A) Activer S3 Versioning pour suivre les parties orphelines
B) Ajouter une règle de cycle de vie qui abandonne les téléversements multipart incomplets après un nombre de jours défini
C) Migrer le compartiment vers S3 One Zone-IA
D) Activer S3 Transfer Acceleration pour terminer les téléversements plus rapidement

**Question 62** *(Domain 4 — Task 4.1)*
La flotte EC2 d'une entreprise utilise des centaines de volumes EBS gp2 dimensionnés grands uniquement pour obtenir des IOPS de base. Les examens d'utilisation montrent que les IOPS sont nécessaires mais qu'une grande partie de la capacité ne l'est pas. Que devrait faire l'architecte de solutions pour réduire le coût de stockage sans perdre en performance ?

A) Migrer les volumes vers io2 et provisionner les mêmes IOPS
B) Migrer les volumes vers gp3, dimensionner correctement la capacité et provisionner les IOPS indépendamment
C) Convertir les volumes en st1 throughput-optimized HDD
D) Faire des instantanés des volumes quotidiennement et supprimer les originaux

**Question 63** *(Domain 4 — Task 4.4)*
Un pipeline de données dans des sous-réseaux privés transfère 60 To par mois depuis des instances EC2 vers Amazon S3 dans la même région via une NAT gateway, générant de gros frais de traitement de données. Quel est le changement le PLUS économique ?

A) Remplacer la NAT gateway par une instance NAT sur une grande instance EC2
B) Créer un gateway VPC endpoint pour S3 et router le trafic à travers lui
C) Créer un interface VPC endpoint (PrivateLink) pour S3
D) Déplacer les instances EC2 vers des sous-réseaux publics avec des adresses IPv4 publiques

**Question 64** *(Domain 4 — Task 4.4)*
La facture mensuelle d'une startup affiche des frais inattendus pour des adresses IPv4 publiques en cours d'utilisation sur des dizaines d'instances EC2 qui n'appellent que d'autres services AWS au sein du VPC. L'équipe financière veut également des alertes avant que la dépense globale du mois prochain ne dépasse un seuil. Quelle combinaison d'actions l'architecte de solutions devrait-il prendre ? (Choisissez DEUX.)

A) Remplacer les IPv4 publiques par des Elastic IP sur chaque instance, qui sont toujours gratuites tant qu'elles sont attachées
B) Supprimer les adresses IPv4 publiques et utiliser une connectivité privée (VPC endpoints/NAT selon les besoins), puisque AWS facture les adresses IPv4 publiques en cours d'utilisation
C) Utiliser AWS Compute Optimizer pour bloquer les dépenses au-dessus du seuil
D) Activer AWS Shield Advanced pour plafonner la dépense mensuelle
E) Créer un budget de coûts AWS Budgets avec un seuil d'alerte et une notification par e-mail

**Question 65** *(Domain 4 — Task 4.3)*
Un environnement de développement utilise un cluster Amazon Aurora PostgreSQL qui est inactif les nuits et les week-ends mais doit se réveiller automatiquement lorsque les développeurs se connectent, sans intervention manuelle ni redimensionnement d'instance. Le coût doit chuter à près de zéro pour le calcul pendant l'inactivité. Quelle solution répond à ces exigences ?

A) Aurora Serverless v2 configuré avec une capacité minimale de 0 ACU pour qu'il se mette en pause automatiquement lorsqu'il est inactif
B) Un cluster Aurora provisionné arrêté par une fonction Lambda planifiée chaque nuit
C) Une base de données globale Aurora avec un cluster secondaire headless
D) Aurora provisionné avec deux instances de lecture réduites la nuit

---

## Corrigé

### Partie 1 — Questions 1 à 20

**1. Réponse : B** — Les SCP ne s'appliquent jamais au compte de gestion de l'organisation, donc ses principaux ne sont pas affectés par les restrictions de région. *Pourquoi pas les autres :* A — les SCP s'héritent bien à travers les OU imbriquées ; C — les Allow IAM ne peuvent pas primer sur un Deny de SCP dans les comptes membres ; D — les SCP s'appliquent immédiatement à tous les comptes actuels et futurs sous le point d'attachement.

**2. Réponse : C** — Une permissions boundary appliquée comme condition sur les actions de création de rôle plafonne les autorisations maximales de tout rôle créé par les développeurs, empêchant l'élévation de privilèges tout en préservant le libre-service. *Pourquoi pas les autres :* A — la revue manuelle ajoute une charge opérationnelle et supprime le libre-service ; B — refuser iam:CreateRole bloque le flux de travail légitime ; D — les alertes CloudTrail sont détectives, pas préventives.

**3. Réponse : B** — Un ExternalId défini par le client et validé dans la condition de la politique de confiance garantit que le fournisseur SaaS n'endosse le rôle que pour le compte du bon client, atténuant le problème du député confus. *Pourquoi pas les autres :* A — le MFA est impraticable pour l'endossement automatisé de service à service et ne traite pas la confusion du député ; C — chiffrer un ARN (qui n'est pas secret) ne résout rien ; D — les clés d'utilisateur IAM de longue durée sont moins sûres que les rôles.

**4. Réponse : B** — IAM Identity Center se fédère une seule fois avec Entra ID et attribue centralement des permission sets à travers tous les comptes de l'organisation via un portail d'accès unique. *Pourquoi pas les autres :* A — les utilisateurs IAM par compte sont exactement la charge à éviter ; C — Cognito est pour les identités d'application (clients), pas pour l'accès du personnel aux comptes AWS ; D — la configuration SAML manuelle par compte fonctionne mais a une charge opérationnelle bien plus élevée.

**5. Réponse : A** — Les user pools gèrent l'authentification (connexion par e-mail/sociale) ; les identity pools échangent les jetons résultants contre des informations d'identification AWS temporaires délimitées par des rôles IAM pour accéder à S3. *Pourquoi pas les autres :* B — inverse les rôles des deux services ; C — IAM Identity Center est pour les utilisateurs du personnel, pas les clients de l'application ; D — les jetons du user pool (JWT) n'accordent pas d'accès aux services AWS par eux-mêmes.

**6. Réponse : B** — Une clé gérée par le client donne le contrôle total de la politique de clé, de la journalisation de l'utilisation et de la désactivation, et prend en charge la rotation automatique (annuelle par défaut). *Pourquoi pas les autres :* A — les clés gérées par AWS ne vous permettent pas de modifier la politique de clé ni de désactiver la clé ; C — les clés détenues par AWS sont entièrement invisibles pour le client ; D — le matériel de clé importé (BYOK) ne prend pas en charge la rotation automatique.

**7. Réponse : B** — Chiffrement par enveloppe : KMS génère une clé de données ; les données sont chiffrées localement avec la clé de données en clair, qui est supprimée, tandis que la copie chiffrée par KMS de la clé de données est stockée avec le texte chiffré. *Pourquoi pas les autres :* A et C — KMS ne chiffre jamais directement ou par flux de grandes charges utiles ; D — les clés codées en dur sont un anti-modèle et ne constituent pas un chiffrement par enveloppe.

**8. Réponse : C** — La stratégie à utilisateurs alternés de Secrets Manager maintient deux informations d'identification et les fait tourner à tour de rôle, de sorte que les connexions existantes utilisant l'ancienne information d'identification continuent de fonctionner pendant la rotation. *Pourquoi pas les autres :* A — Parameter Store n'a aucune rotation intégrée ; vous devriez tout construire vous-même ; B — la rotation à utilisateur unique invalide immédiatement l'ancien mot de passe, risquant des échecs de connexion ; D — la rotation KMS fait tourner le matériel de clé de chiffrement, pas les mots de passe de base de données.

**9. Réponse : C** — SSE-C permet au client de fournir la clé de chiffrement à chaque requête ; AWS l'utilise en mémoire pour l'opération et ne la stocke jamais. *Pourquoi pas les autres :* A — les clés SSE-S3 sont entièrement gérées par AWS ; B — les clés SSE-KMS sont stockées dans AWS KMS ; D — aws/s3 est une clé KMS gérée par AWS et n'est pas du tout côté client.

**10. Réponse : B** — Le mode conformité d'Object Lock empêche la suppression ou l'écrasement par tout utilisateur, y compris root, jusqu'à l'expiration de la rétention, et Object Lock nécessite la gestion des versions. *Pourquoi pas les autres :* A — le mode gouvernance peut être contourné par les utilisateurs disposant de s3:BypassGovernanceRetention ; C — une politique de compartiment peut être modifiée ou supprimée par l'utilisateur root ; D — l'expiration du cycle de vie n'empêche pas la suppression pendant la période.

**11. Réponse : B** — Les NACL sont sans état, donc le trafic de réponse vers les ports source éphémères des clients doit être explicitement autorisé en sortie. *Pourquoi pas les autres :* A — les NACL sont sans état, pas à état ; C — les groupes de sécurité sont à état, donc le trafic de retour est automatique ; D — 0.0.0.0/0 est parfaitement valide dans les règles de NACL.

**12. Réponse : A, B** — Les groupes de sécurité sont à état (trafic de retour autorisé automatiquement), et les NACL traitent les règles numérotées dans l'ordre et prennent en charge Deny. *Pourquoi pas les autres :* C — les groupes de sécurité ne prennent en charge que les règles Allow ; D — les NACL s'attachent aux sous-réseaux, pas aux ENI (les groupes de sécurité s'attachent aux ENI) ; E — les règles de groupe de sécurité sont toutes évaluées ensemble sans ordonnancement.

**13. Réponse : B** — Shield Advanced fournit la Shield Response Team, la protection des coûts DDoS et la visibilité/les diagnostics d'attaque pour les ressources protégées comme CloudFront et ALB. *Pourquoi pas les autres :* A — Shield Standard est automatique mais n'inclut aucun accès à la SRT ni protection des coûts ; C — WAF traite les modèles de requêtes de couche 7, pas l'ensemble des exigences ; D — GuardDuty est de la détection de menaces, pas de la protection DDoS.

**14. Réponse : B** — AWS WAF sur l'ALB avec le groupe de règles géré SQLi plus une règle basée sur le débit bloque les deux modèles d'attaque sans modification du code applicatif. *Pourquoi pas les autres :* A — effort de développement élevé ; C — Shield Standard couvre les inondations L3/L4, pas l'injection SQL ; D — les groupes de sécurité ne peuvent pas inspecter le contenu des requêtes.

**15. Réponse : B** — GuardDuty = détection de menaces à partir des journaux et du renseignement sur les menaces ; Macie = découverte de données sensibles (PII) dans S3 ; Inspector = analyse des vulnérabilités (CVE) d'EC2, des images ECR et de Lambda. *Pourquoi pas les autres :* A, C, D — chacune brouille au moins deux des associations service-à-objectif.

**16. Réponse : B** — Les gateway endpoints existent pour exactement S3 et DynamoDB, gardent le trafic sur le réseau AWS et n'ont aucun frais horaire ni de traitement de données. *Pourquoi pas les autres :* A — la NAT gateway route via l'espace IP public et coûte à l'heure/par Go ; C — les interface endpoints entraînent des frais horaires et de données, donc pas le coût le plus bas ; D — une internet gateway envoie le trafic sur l'Internet public.

**17. Réponse : A** — IMDSv2 nécessite un jeton de session obtenu via une requête PUT, que les vecteurs SSRF typiques ne peuvent pas effectuer ; imposer HttpTokens=required bloque le vol d'informations d'identification IMDSv1. *Pourquoi pas les autres :* B — de nombreux agents et SDK ont légitimement besoin d'IMDS ; C — les NACL n'affectent pas le trafic link-local entre une instance et son propre point de terminaison de métadonnées ; D — les informations d'identification statiques dans des fichiers sont bien pires que les informations d'identification de rôle.

**18. Réponse : C** — Les paramètres standard de Parameter Store sont gratuits et conviennent à la configuration en clair ; Secrets Manager ajoute la rotation intégrée uniquement pour les 5 mots de passe, minimisant le coût. *Pourquoi pas les autres :* A — payer la tarification par secret de Secrets Manager pour 200 valeurs de config en clair est du gaspillage ; B — Parameter Store seul n'a aucune rotation native pour les mots de passe ; D — Parameter Store n'a aucune rotation automatique intégrée, donc cette option énonce une capacité qui n'existe pas.

**19. Réponse : B** — Les S3 Bucket Keys permettent à S3 de générer une clé de données limitée dans le temps au niveau du compartiment à partir de la clé KMS, réduisant considérablement les requêtes KMS par objet (et le coût) tout en restant en SSE-KMS. *Pourquoi pas les autres :* A — SSE-S3 abandonne l'exigence KMS ; C — la fréquence de rotation n'affecte pas le volume d'appels d'API par requête ; D — le matériel de clé importé ne change pas le nombre de requêtes.

**20. Réponse : B, D** — Un Deny explicite l'emporte toujours sur tout Allow dans l'évaluation des politiques, et les permissions boundaries ne font que plafonner (jamais accorder) les autorisations. *Pourquoi pas les autres :* A — les SCP sont des garde-fous qui limitent les autorisations disponibles ; elles n'accordent rien ; C — les politiques basées sur les ressources accordent régulièrement un accès inter-comptes par elles-mêmes ; E — IAM est par défaut en refus implicite lorsque rien n'autorise une action.

### Partie 2 — Questions 21 à 37

**21. Réponse : C** — Multi-AZ fournit un basculement automatique en cas de panne d'AZ ; les réplicas en lecture absorbent le trafic de lecture de reporting — deux fonctionnalités pour deux problèmes distincts. *Pourquoi pas les autres :* A — une instance de secours Multi-AZ traditionnelle ne peut pas servir les lectures ; B — la promotion de réplica est manuelle (ou scriptée) et les réplicas seuls ne donnent pas de basculement HA automatique ; D — une instance mono-AZ plus grande échoue aux deux exigences sur la résilience d'AZ.

**22. Réponse : B** — Un déploiement de cluster de base de données Multi-AZ exécute un writer et deux instances de secours lisibles sur trois AZ, avec un point de terminaison de lecture, de sorte que la capacité de secours sert les lectures tout en prenant en charge un basculement automatique rapide. *Pourquoi pas les autres :* A — l'unique instance de secours dans un déploiement d'instance ne sert aucun trafic ; C — les réplicas en lecture ne fournissent pas de basculement automatique géré et les bases de données RDS ne sont pas équilibrées en charge via un ALB ; D — Single-AZ n'a aucun basculement.

**23. Réponse : B** — La réplication d'Aurora Global Database est asynchrone au niveau de la couche de stockage avec un décalage typique inférieur à la seconde, donc le RPO inter-régions est proche de zéro mais ne peut jamais être garanti à exactement 0. *Pourquoi pas les autres :* A — la réplication n'est pas synchrone entre les régions ; C — le write forwarding achemine les écritures vers le primaire ; il ne change pas la sémantique de réplication ; D — le décalage de réplication est typiquement inférieur à une seconde, pas un calendrier de 5 minutes.

**24. Réponse : B** — Le Recovery Time Objective est le temps d'arrêt maximal tolérable (4 heures) ; le Recovery Point Objective est la fenêtre maximale tolérable de perte de données (15 minutes). *Pourquoi pas les autres :* A — inverse les définitions ; C — MTBF/MTTR sont des statistiques de fiabilité, pas des objectifs de DR ; D — le SLA est un engagement contractuel, pas une métrique de perte de données.

**25. Réponse : B** — Le pilot light maintient les données répliquées en continu et les ressources de base provisionnées mais éteintes, donnant un RTO de quelques dizaines de minutes à faible coût — une correspondance exacte. *Pourquoi pas les autres :* A — la sauvegarde et restauration n'a aucune réplication en direct et un RTO bien plus long ; C — le warm standby maintient la pile en cours d'exécution, coûtant plus que nécessaire ; D — l'actif/actif est le plus coûteux et dépasse largement l'exigence.

**26. Réponse : C, E** — Le warm standby est une copie complète à échelle réduite et toujours en cours d'exécution ; le multi-site actif/actif sert depuis plusieurs régions avec un RTO proche de zéro au coût le plus élevé. *Pourquoi pas les autres :* A — la sauvegarde et restauration se définit par le fait de ne pas exécuter de ressources à l'avance ; B — la sauvegarde et restauration a le RTO le plus élevé (le pire) ; D — le pilot light est provisionné-mais-éteint, pas une pleine capacité servant le trafic.

**27. Réponse : B** — Lorsque le délai de visibilité de 30 secondes expire en cours de traitement, le message réapparaît et un autre consommateur le traite à nouveau ; réglez le délai de visibilité plus long que le temps de traitement maximal (par ex. 6× comme bonne pratique). *Pourquoi pas les autres :* A — FIFO vs standard n'est pas la cause ; C — l'interrogation longue affecte l'efficacité des réceptions vides, pas les doublons ; D — la période de rétention régit la durée de persistance des messages, pas la redistribution.

**28. Réponse : A** — Une politique de redrive avec maxReceiveCount déplace les messages qui échouent à répétition (« poison pill ») vers une dead-letter queue pour analyse hors ligne, arrêtant la boucle de nouvelle tentative infinie. *Pourquoi pas les autres :* B — un délai de visibilité plus court fait tourner la boucle plus vite ; C — FIFO ne rejette pas les messages malformés ; D — une rétention de 1 minute ferait aussi expirer les messages valides.

**29. Réponse : B** — Les files FIFO garantissent un traitement exactement une fois et un ordre strict au sein d'un MessageGroupId ; utiliser l'identifiant de compte comme identifiant de groupe donne un ordre par compte avec du parallélisme entre les comptes (et le mode FIFO à haut débit peut s'adapter davantage). *Pourquoi pas les autres :* A — les files standard ne peuvent pas garantir l'ordre ni l'exactement une fois ; C — SNS ne fournit aucune garantie d'ordre ni de traitement exactement une fois pour ce modèle ; D — un identifiant de groupe unique sérialise tout, détruisant le débit.

**30. Réponse : B** — La diffusion SNS-vers-SQS livre chaque événement à chaque file, où chaque consommateur obtient un tampon durable et un rythme de traitement indépendant. *Pourquoi pas les autres :* A — trois consommateurs sur une file se partagent les messages ; chaque message ne va qu'à un seul consommateur ; C — l'invocation séquentielle n'est pas un traitement parallèle indépendant avec tampon ; D — les abonnements par e-mail livrent à des humains, pas à des tampons applicatifs durables.

**31. Réponse : B** — La simultanéité réservée découpe une simultanéité dédiée pour les fonctions critiques (et plafonner la fonction de vente limite son rayon d'impact), empêchant une fonction d'épuiser le pool partagé du compte. *Pourquoi pas les autres :* A — un délai d'expiration plus long retient les créneaux de simultanéité plus longtemps, aggravant la limitation ; C — la simultanéité provisionnée préchauffe les environnements mais ne relève pas le quota de simultanéité du compte ; D — la taille de la mémoire n'affecte pas les limites de simultanéité.

**32. Réponse : B** — Les flux de travail Standard s'exécutent jusqu'à un an et le modèle de callback waitForTaskToken met l'exécution en pause sans coût de calcul jusqu'à ce que SendTaskSuccess/SendTaskFailure renvoie le jeton. *Pourquoi pas les autres :* A — les flux de travail Express sont plafonnés à 5 minutes ; C — Lambda peut s'exécuter au maximum 15 minutes et la mise en veille gaspille de l'argent ; D — les calendriers EventBridge peuvent déclencher des événements mais ne peuvent pas mettre en pause et reprendre l'état d'un flux de travail.

**33. Réponse : A** — Les flux de travail Express sont conçus pour des exécutions à très haut débit, de courte durée et au moins une fois à moindre coût ; les flux de travail Standard fournissent une sémantique exactement une fois, jusqu'à un an de durée et un historique d'exécution complet pour le travail de rapprochement. *Pourquoi pas les autres :* B — Standard ne peut pas soutenir économiquement 90 000 démarrages/seconde pour ce cas d'usage ; C — Express est plafonné à 5 minutes et est au moins une fois, échouant au travail de 12 heures exactement une fois ; D — les attributions inversées échouent aux deux charges de travail.

**34. Réponse : B** — Le routage de basculement envoie tout le trafic vers le primaire tant que sa vérification de santé réussit, puis répond automatiquement avec l'enregistrement secondaire lorsqu'elle échoue. *Pourquoi pas les autres :* A — un poids 50/50 envoie en permanence la moitié du trafic vers la copie passive ; C — le routage basé sur la latence répartit le trafic selon la performance, pas selon l'intention actif/passif ; D — la géolocalisation route selon l'emplacement de l'utilisateur, sans rapport avec un basculement basé sur la santé du point de terminaison.

**35. Réponse : B** — Ajouter le type de vérification de santé ELB fait que l'ASG traite les échecs de santé de cible ALB comme défaillants, de sorte que les instances dont l'application a planté sont terminées et remplacées même si les status checks EC2 réussissent. *Pourquoi pas les autres :* A — la surveillance détaillée ne change que la granularité des métriques ; C — la période de grâce retarde l'évaluation de la santé, l'opposé de ce qui est nécessaire ; D — le type d'équilibreur de charge n'est pas le problème.

**36. Réponse : B** — Le Network Load Balancer opère à la couche 4 (TCP/UDP), gère des millions de requêtes par seconde avec une latence ultra-faible et prend en charge une IP statique (ou Elastic) par AZ. *Pourquoi pas les autres :* A — l'ALB est en couche 7 (HTTP/HTTPS) et n'offre pas d'IP statiques nativement ; C — le Gateway Load Balancer sert à déployer des appliances virtuelles en ligne ; D — le Classic Load Balancer est hérité et ne répond à aucune des exigences.

**37. Réponse : B, C** — La CRR nécessite que la gestion des versions soit activée sur les deux compartiments, et les classes EFS Standard sont des systèmes de fichiers régionaux (multi-AZ) montables simultanément entre les AZ. *Pourquoi pas les autres :* A — la CRR ne réplique que les nouveaux objets après configuration, sauf si vous exécutez S3 Batch Replication pour les objets existants ; D — EFS prend en charge des milliers de clients NFS simultanés, contrairement à EBS en attachement unique ; E — la gestion des versions est un prérequis de la réplication mais ne réplique rien par elle-même.

### Partie 3 — Questions 38 à 53

**38. Réponse : B** — io2 Block Express fournit jusqu'à 256 000 IOPS, une latence inférieure à la milliseconde et une durabilité de 99,999 %, répondant aux trois exigences. *Pourquoi pas les autres :* A — gp3 peut désormais atteindre le nombre d'IOPS (son plafond a été relevé à 80 000 fin 2025), mais il échoue aux deux autres exigences : la durabilité est de 99,8–99,9 % (la question exige 99,999 %) et sa latence est de l'ordre de quelques millisecondes, pas une latence inférieure à la milliseconde garantie ; B est le seul type répondant aux trois ; C — st1 est basé sur HDD et inadapté aux bases de données gourmandes en IOPS ; D — gp2 plafonne à 16 000 IOPS et le bursting n'est pas une garantie soutenue.

**39. Réponse : C** — FSx for Lustre est spécialement conçu pour le HPC avec une latence inférieure à la milliseconde, des centaines de Go/s de débit et une intégration S3 native (chargement paresseux et exportation). *Pourquoi pas les autres :* A — EFS ne peut pas égaler le profil débit/latence HPC de Lustre ; B — FSx for Windows cible les charges de travail SMB/Windows, pas le HPC Linux ; D — Mountpoint for S3 ne fournit pas de sémantique de système de fichiers POSIX partagé ni la latence requise.

**40. Réponse : B** — FSx for Windows File Server prend en charge nativement SMB, l'intégration Active Directory et les ACL NTFS, et le mode Multi-AZ couvre l'exigence des deux AZ. *Pourquoi pas les autres :* A — EFS est NFS/POSIX et ne préserve pas les permissions NTFS ; C — S3 est du stockage d'objets, pas un partage de fichiers SMB ; D — Lustre est un système de fichiers HPC Linux sans prise en charge SMB/AD.

**41. Réponse : D, E** — Transfer Acceleration achemine les téléversements sur le réseau périphérique/dorsal d'AWS pour accélérer les transferts longue distance, et le téléversement multipart parallélise les transferts et permet de réessayer les parties échouées sans redémarrer tout le fichier de 40 Go. *Pourquoi pas les autres :* A — One Zone-IA change la redondance, pas la performance de téléversement ; B — vous ne pouvez pas placer un ALB devant S3 pour les téléversements ; C — la CRR réplique après le téléversement et n'aide pas à l'ingestion.

**42. Réponse : B** — Les NVMe SSD de stockage d'instance sont physiquement attachés à l'hôte, offrant la plus faible latence pour des données éphémères qui peuvent être régénérées. *Pourquoi pas les autres :* A et D — EBS traverse le réseau et ajoute de la latence ; C — EFS est un système de fichiers réseau avec une latence supérieure aux deux.

**43. Réponse : B** — La limitation sur des partitions chaudes avec une utilisation globale faible est le problème classique de la clé de partition à faible cardinalité ; une clé à forte cardinalité (par ex. game_id#player_id) distribue le trafic uniformément. *Pourquoi pas les autres :* A — les changements de mode de capacité ne corrigent pas les partitions chaudes ; C — un LSI partage la même clé de partition et les mêmes partitions chaudes ; D — les Streams capturent les modifications, ils ne redistribuent pas les écritures.

**44. Réponse : B** — DAX est un cache en mémoire compatible DynamoDB et transparent pour l'API, offrant des lectures en microsecondes avec une modification de code minimale. *Pourquoi pas les autres :* A — ElastiCache nécessite des réécritures applicatives pour gérer le cache ; C — un GSI ne met pas en cache les éléments chauds ni ne donne une latence en microsecondes ; D — les Global Tables traitent l'accès multi-régions, pas la latence de lecture d'un élément unique.

**45. Réponse : B** — Un GSI peut être ajouté à une table existante à tout moment, prend en charge une nouvelle combinaison de clé de partition/tri et a son propre débit provisionné isolé de la table de base. *Pourquoi pas les autres :* A — les LSI ne peuvent être créés qu'à la création de la table, partagent la clé de partition de la table et partagent le débit de la table ; C — recréer la table est perturbateur et inutile ; D — les Streams servent à la capture des modifications, pas aux requêtes ad hoc.

**46. Réponse : B** — Le TTL de DynamoDB supprime automatiquement les éléments expirés en arrière-plan sans coût supplémentaire. *Pourquoi pas les autres :* A — les analyses planifiées consomment de la capacité de lecture/écriture et coûtent de l'argent ; C — les politiques de cycle de vie sont un concept S3/EFS, pas DynamoDB ; D — les Streams filtrent les événements en aval mais ne suppriment pas les éléments de la table.

**47. Réponse : B** — RDS Proxy regroupe et multiplexe les connexions, permettant à des milliers d'invocations Lambda de partager un petit ensemble de connexions de base de données avec seulement un changement de chaîne de connexion. *Pourquoi pas les autres :* A — l'agrandissement est coûteux et ne fait que repousser la limite ; C — une migration de base de données est une modification applicative majeure ; D — limiter Lambda à 10 paralyse le débit au lieu de résoudre la gestion des connexions.

**48. Réponse : A** — Les Aurora Replicas (jusqu'à 15) derrière le point de terminaison de lecture avec l'auto scaling de réplicas déchargent le trafic de lecture avec un travail opérationnel minimal. *Pourquoi pas les autres :* B — Aurora n'utilise pas de modèle d'instance de secours passive ; les instances de secours au sens RDS classique ne servent pas de trafic ; C — le partitionnement est une charge opérationnelle élevée pour un problème de mise à l'échelle en lecture ; D — Backtrack rembobine la base de données dans le temps, il ne sert pas de lectures.

**49. Réponse : B** — Global Accelerator fournit deux IP anycast statiques, prend en charge UDP, sert de façade aux NLB dans plusieurs régions et bascule en quelques secondes sur le réseau dorsal AWS. *Pourquoi pas les autres :* A — CloudFront sert du contenu HTTP/HTTPS, pas de l'UDP arbitraire, et n'a pas d'IP statiques face au client ; C — le routage par latence de Route 53 dépend des TTL DNS pour le basculement et ne fournit pas d'IP statiques ; D — un ALB est régional et uniquement HTTP.

**50. Réponse : B** — Le routage par géolocalisation répond aux requêtes DNS en fonction du pays de l'utilisateur, imposant Allemagne→eu-central-1 et France→eu-west-3 de manière déterministe pour la conformité aux licences. *Pourquoi pas les autres :* A — le routage par latence choisit le point de terminaison le plus rapide, ce qui peut violer la règle de licence ; C — le biais de géoproximité décale les limites par distance mais ne garantit pas un mappage strict par pays ; D — le routage pondéré distribue aléatoirement par poids, ignorant l'emplacement.

**51. Réponse : C** — Un groupe de placement cluster regroupe les instances étroitement dans une seule AZ pour la plus faible latence et le plus haut débit de paquets par seconde, idéal pour les charges de travail MPI fortement couplées. *Pourquoi pas les autres :* A — les groupes spread séparent les instances sur du matériel distinct, augmentant la latence, et plafonnent à 7 par AZ ; B — les groupes partition isolent les domaines de défaillance pour les systèmes de données distribués, pas pour le MPI à faible latence ; D — des sous-réseaux séparés ne font rien pour co-localiser les instances.

**52. Réponse : B** — Amazon Data Firehose est entièrement géré, ne nécessite aucun consommateur ni gestion de shards, met en tampon les enregistrements et peut convertir le JSON en Parquet avant la livraison vers S3. *Pourquoi pas les autres :* A — Kinesis Data Streams nécessite d'écrire/gérer des consommateurs ; C — SQS plus des interrogateurs EC2 est une infrastructure personnalisée à construire et à exploiter ; D — MSK nécessite de gérer des clusters Kafka et des connecteurs.

**53. Réponse : B** — Les crawlers Glue infèrent le schéma dans le Data Catalog et Athena exécute du SQL sans serveur directement contre les fichiers S3. *Pourquoi pas les autres :* A — Redshift nécessite le provisionnement d'un cluster et le chargement des données ; C — EMR signifie gérer un cluster de longue durée ; D — RDS nécessiterait de charger les données dans un serveur de base de données.

### Partie 4 — Questions 54 à 65

**54. Réponse : C** — Les tâches par lots avec points de contrôle et redémarrables sont la charge de travail Spot idéale, et un Spot Fleet diversifié entre les types d'instances/AZ minimise l'impact des interruptions avec jusqu'à ~90 % d'économies. *Pourquoi pas les autres :* A — l'À la demande renonce à la remise sans bénéfice ici ; B et D — les engagements donnent des remises plus faibles que Spot et bloquent la dépense pour un travail tolérant aux interruptions.

**55. Réponse : C** — Les Compute Savings Plans s'appliquent automatiquement à EC2 (toute famille/région), Fargate et Lambda, correspondant au parcours de modernisation. *Pourquoi pas les autres :* A — les EC2 Instance Savings Plans sont verrouillés sur une famille d'instances dans une région et excluent Fargate/Lambda ; B et D — les Reserved Instances ne couvrent qu'EC2 et ne s'appliquent pas à Fargate ni Lambda.

**56. Réponse : B** — Seules les EC2 Standard Reserved Instances peuvent être mises en vente sur le Reserved Instance Marketplace ; les RI RDS (et d'autres services) ne peuvent pas être revendues. *Pourquoi pas les autres :* A et C — les RI RDS ne sont pas éligibles au marketplace ; D — les EC2 Standard RI sont en fait vendables sur le marketplace.

**57. Réponse : B** — AWS délivre un avis d'interruption Spot deux minutes avant de récupérer l'instance, donnant le temps de se vider et de sauvegarder l'état. *Pourquoi pas les autres :* A — un avertissement est fourni ; C et D — 15 minutes et 24 heures ne sont pas des fenêtres d'interruption Spot (les recommandations de rééquilibrage peuvent arriver plus tôt mais ne constituent pas une fenêtre fixe garantie).

**58. Réponse : B** — Glacier Flexible Retrieval offre un faible coût de stockage d'archives et des récupérations Expedited qui retournent les données en 1 à 5 minutes (environ 0,03 $/Go), répondant à l'exigence des 5 minutes. *Pourquoi pas les autres :* A — la récupération la plus rapide de Deep Archive est ~12 heures ; C — les récupérations Bulk prennent 5 à 12 heures ; D — Standard-IA récupère instantanément mais coûte bien plus cher pour un stockage de 7 ans rarement consulté.

**59. Réponse : B** — One Zone-IA coûte ~20 % de moins que Standard-IA et le compromis de durabilité mono-AZ est acceptable pour des miniatures reproductibles. *Pourquoi pas les autres :* A — Standard-IA coûte plus cher pour une redondance dont les données n'ont pas besoin ; C — Intelligent-Tiering ajoute des frais de surveillance et ne minimise pas le coût pour un accès connu comme peu fréquent ; D — Glacier Instant Retrieval a un minimum de 90 jours et un profil de coût de récupération différent pour ce modèle.

**60. Réponse : A, C** — Intelligent-Tiering facture des frais de surveillance/automatisation modiques par objet, et les objets de moins de 128 Ko sont stockés mais non surveillés ni transférés (facturés au tarif Frequent Access). *Pourquoi pas les autres :* B — Intelligent-Tiering n'a aucun frais de récupération entre ses niveaux automatiques ; D — il ne réplique jamais entre régions ; E — il n'y a pas de minimum de 90 jours pour chaque objet dans cette classe.

**61. Réponse : B** — Les parties de téléversement multipart incomplet sont facturées comme du stockage mais invisibles en tant qu'objets ; une règle de cycle de vie avec AbortIncompleteMultipartUpload les supprime automatiquement. *Pourquoi pas les autres :* A — la gestion des versions augmenterait le stockage, ne nettoierait pas les parties ; C — changer de classe de stockage ne supprime pas les parties orphelines ; D — Transfer Acceleration accélère les transferts mais ne nettoie pas les téléversements déjà abandonnés.

**62. Réponse : B** — gp3 dissocie les IOPS/le débit de la taille et coûte ~20 % de moins par Go que gp2, de sorte que la capacité peut être dimensionnée correctement tout en conservant les IOPS nécessaires ; la migration est une opération ModifyVolume en ligne. *Pourquoi pas les autres :* A — io2 est plus cher, pas moins ; C — st1 ne peut pas fournir les IOPS requis ; D — supprimer les volumes détruit les données en direct.

**63. Réponse : B** — Un gateway VPC endpoint pour S3 est gratuit et élimine les frais de traitement de données de la NAT gateway pour le trafic S3 dans la même région. *Pourquoi pas les autres :* A — une instance NAT entraîne toujours des coûts EC2 et opérationnels ; C — les interface endpoints facturent à l'heure et par Go, coûtant plus que le gateway endpoint gratuit ; D — les sous-réseaux publics ajoutent des frais d'IPv4 publique et affaiblissent la sécurité.

**64. Réponse : B, E** — AWS facture chaque adresse IPv4 publique en cours d'utilisation, donc supprimer celles inutiles réduit le coût, et AWS Budgets fournit des alertes de seuil proactives sur la dépense prévue/réelle. *Pourquoi pas les autres :* A — les Elastic IP sont également facturées sous les frais d'IPv4 publique même lorsqu'elles sont attachées ; C — Compute Optimizer recommande le dimensionnement adéquat mais ne peut pas bloquer ni alerter sur des seuils de dépense ; D — Shield Advanced est un service DDoS qui ajoute du coût.

**65. Réponse : A** — Aurora Serverless v2 prend en charge la mise à l'échelle à 0 ACU (pause automatique, disponible depuis fin 2024) et reprend automatiquement à la connexion, éliminant le coût de calcul pendant l'inactivité sans étapes manuelles. Nuances à connaître : la pause automatique nécessite des versions de moteur récentes (Aurora PostgreSQL 13.15+/14.12+/15.7+/16.3+, Aurora MySQL 3.08+) ; la première connexion après une pause prend ~15 secondes à reprendre (plus longtemps après 24h+ de pause) ; le stockage continue d'être facturé pendant que le calcul est en pause ; et tout ce qui maintient des connexions ouvertes — un RDS Proxy, une vérification de santé keep-alive — empêche entièrement la pause. *Pourquoi pas les autres :* B — un cluster provisionné arrêté ne se réveille pas automatiquement lorsque les développeurs se connectent (et redémarre après 7 jours) ; C — les secondaires headless de base de données globale traitent la DR, pas le coût d'inactivité ; D — des lecteurs réduits laissent toujours l'instance writer en cours d'exécution et facturée.

---

## Guide de notation

| Score | Interprétation du résultat |
|---|---|
| 55–65 | Prêt pour l'examen. Réservez l'examen. Ne revoyez que les questions que vous avez manquées. |
| 47–54 | Dans la fourchette de réussite, mais la marge est mince. Relisez les chapitres derrière chaque erreur (utilisez les balises de domaine), repassez dans une semaine. |
| 38–46 | La base est là ; des lacunes subsistent. Travaillez la carte des domaines de l'annexe B pour vos domaines faibles avant de repasser. |
| Moins de 38 | Relisez de bout en bout les chapitres de vos deux domaines les plus faibles, refaites leurs exercices de chapitre, puis repassez cet examen. |

Suivez vos erreurs *par domaine* (chaque question est balisée). Un score faible concentré dans un domaine est un problème d'étude ciblée ; le même score réparti uniformément est un problème de rythme ou de lecture des questions — ralentissez et soulignez ce que chaque énoncé exige réellement (HA vs DR, coût vs performance, « le PLUS économique » vs « le MOINS de charge opérationnelle »).
