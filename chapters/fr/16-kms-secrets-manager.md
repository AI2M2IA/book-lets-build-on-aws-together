# Chapitre 16 : Clés, verrous et secrets

Leo passait en revue l'historique git quand il le trouva. Un mot de passe de base de données. Soumis il y a six mois, en texte clair, par quelqu'un qui ne travaillait plus chez Nimbus. Le commit était public. Le mot de passe avait depuis été changé — mais ils n'en étaient pas certains. Ils vérifièrent chaque système que cet identifiant avait jamais touché. Cela prit quatre heures. C'est le jour où Nimbus décida de ne plus mettre de secrets dans le code.

**Les deux problèmes : stocker les secrets et chiffrer les données**

La sécurité autour des informations sensibles comporte deux problèmes distincts :

**Stocker les identifiants** (mots de passe de base de données, clés API, chaînes de connexion) : Où vivent-ils ? Qui peut y accéder ? Comment les faire tourner sans redéployer votre application ?

**Chiffrer les données** (informations client, dossiers de paiement, IIP) : Comment vous assurer que même si quelqu'un obtient un accès non autorisé à votre base de données ou compartiment S3, il ne peut pas lire les données ?

AWS a un service dédié à chaque problème :

- **AWS Secrets Manager** : Stocke et gère les identifiants de manière sécurisée
- **AWS KMS (Key Management Service)** : Gère les clés de chiffrement pour chiffrer et déchiffrer les données

**AWS Secrets Manager : plus jamais d'identifiants codés en dur**

Secrets Manager est un magasin sécurisé pour les secrets : identifiants de base de données, clés API, jetons OAuth, clés SSH, ou tout ce qui est sensible.

Au lieu que votre application lise un mot de passe depuis une variable d'environnement ou un fichier de configuration, elle appelle l'API Secrets Manager au démarrage (ou au besoin) et récupère le secret. Le secret ne touche jamais le disque. Il n'apparaît jamais dans votre code. Il n'est pas dans vos variables d'environnement.

Voici à quoi ressemble le flux :

**Ancienne façon** :
```
DB_PASSWORD=supersecretpassword123  # dans un fichier .env ou une variable d'environnement
```

**Façon avec Secrets Manager** :
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='nimbus/production/db-password')
password = json.loads(secret['SecretString'])['password']
```

L'instance EC2 a besoin d'un rôle IAM avec l'autorisation d'appeler `secretsmanager:GetSecretValue` pour ce secret spécifique. Aucun autre service ne peut le lire. Le secret ne se retrouve jamais dans le code.

**Rotation automatique : la vraie puissance**

La plus grande fonctionnalité de Secrets Manager n'est pas le stockage des secrets — c'est leur rotation automatique.

Voici le scénario : tous les 30 jours, Secrets Manager génère un nouveau mot de passe de base de données, le met à jour dans RDS, met à jour le secret stocké, et votre application récupère le nouveau mot de passe la prochaine fois qu'elle en a besoin. Pas d'intervention manuelle. Pas de déploiement. Pas de « je dois me souvenir de faire tourner ça ».

La rotation est implémentée comme une fonction Lambda. AWS fournit des modèles pour les bases de données RDS (MySQL, PostgreSQL, Aurora). Vous pouvez personnaliser la fonction pour tout type d'identifiant.

Tom avait une question sur le coût. (Bien sûr.)

Secrets Manager facture par secret par mois plus par appel API. Pour un petit nombre de mots de passe de base de données et de clés API, le coût est de quelques dollars par mois — négligeable comparé au coût d'un incident.

« La compromission de la semaine dernière », dit Priya, « combien aurait-elle coûté à investiguer et à remédier ? »

Tom resta silencieux un moment. « En incluant mon temps, votre temps, le week-end de Leo... quelques milliers de dollars. »

« Secrets Manager aurait identifié la clé statique avant qu'elle ne soit exploitée. Et il l'aurait fait tourner automatiquement. »

Tom ouvrit la page de tarification.

**AWS KMS : la fabrique de verrous**

AWS KMS (Key Management Service) gère les **clés cryptographiques** — les valeurs secrètes utilisées pour chiffrer et déchiffrer les données.

L'analogie : KMS est comme une société de coffre-forts qui détient la clé maîtresse. Vos données (le contenu de la boîte) sont chiffrées. Seul quelqu'un ayant l'autorisation d'utiliser la clé KMS peut les déchiffrer. KMS enregistre chaque utilisation de chaque clé dans CloudTrail.

Les **clés maîtresses client (CMK)** — maintenant appelées clés KMS — se déclinent en deux types :

**Clés gérées par AWS** : AWS crée et gère automatiquement la clé pour des services comme S3, EBS, RDS. Vous ne contrôlez pas directement la clé, mais vous pouvez voir qu'elle est utilisée. Gratuites.

**Clés gérées par le client** : Vous créez la clé dans KMS et contrôlez chaque aspect de celle-ci : qui peut l'utiliser, quand elle tourne, qui peut l'administrer. Vous pouvez activer la rotation annuelle automatique. Coût : 1 $/mois par clé plus des frais par appel API.

**Chiffrement dans les services AWS : intégration avec KMS**

La plupart des services AWS s'intègrent avec KMS pour le chiffrement :

**S3** : Activez le « chiffrement côté serveur avec KMS » sur un compartiment. Chaque objet est chiffré au repos avec une clé KMS. Lire un objet nécessite l'autorisation sur le compartiment S3 *et* la clé KMS.

**RDS** : Activez le chiffrement lors de la création. Le stockage de la base de données, les sauvegardes et les instantanés sont tous chiffrés avec une clé KMS. Remarque : le chiffrement ne peut pas être activé sur une instance RDS non chiffrée existante — vous devez prendre un instantané, copier l'instantané avec le chiffrement activé et restaurer.

**EBS** : Chiffrez les volumes avec KMS. Les nouveaux volumes créés à partir d'instantanés chiffrés sont automatiquement chiffrés.

**DynamoDB** : Le chiffrement au repos avec KMS est activé par défaut sur toutes les tables.

**ElastiCache Redis** : Chiffrement au repos avec KMS pour les données sensibles en cache.

Le principe : les données doivent être chiffrées au repos (stockées sur disque) et en transit (se déplaçant sur un réseau). KMS gère le chiffrement au repos. TLS/SSL (fourni automatiquement par les services AWS) gère le chiffrement en transit.

**Chiffrement enveloppé : comment KMS fonctionne réellement**

Voici un détail qui vous aide à comprendre le comportement de KMS et les questions d'examen.

KMS ne chiffre pas directement vos données dans la plupart des cas. Il utilise le **chiffrement enveloppé** :

1. KMS génère une **clé de données** (une clé symétrique unique)
2. Le service utilise la clé de données pour chiffrer vos données localement (rapide — chiffrement symétrique)
3. Le service demande à KMS de chiffrer la clé de données elle-même (en utilisant votre clé KMS)
4. Les données chiffrées et la clé de données chiffrée sont toutes deux stockées
5. Vos données réelles ne quittent jamais le service — seule la clé de données va à KMS pour le chiffrement/déchiffrement

Quand vous lisez les données :

1. Le service demande à KMS de déchiffrer la clé de données
2. KMS vérifie les autorisations, déchiffre la clé de données, la renvoie
3. Le service utilise la clé de données déchiffrée pour déchiffrer vos données localement

Cela signifie que KMS peut gérer de très grandes quantités de données sans les envoyer toutes via l'API KMS. Seules les petites clés vont à KMS. CloudTrail enregistre chaque appel à l'API KMS — chaque opération de chiffrement et de déchiffrement.

**Secrets Manager vs Parameter Store**

AWS dispose également de **Systems Manager Parameter Store**, qui stocke des valeurs de configuration (pas seulement des secrets). Parameter Store est moins cher — gratuit pour les paramètres standard. Il peut également stocker des paramètres chiffrés en utilisant KMS.

Pour les secrets qui nécessitent une rotation : Secrets Manager.

Pour les valeurs de configuration et les paramètres non sensibles : Parameter Store (le niveau gratuit est très généreux).

Pour la configuration d'application (numéros de port, indicateurs de fonctionnalités, paramètres spécifiques à l'environnement) : Parameter Store.

## Points forts et limites

**AWS Secrets Manager** :

- Rotation automatique des secrets sans modifications de code
- Contrôle d'accès IAM précis par secret
- Versionnage (accès à la version précédente pendant la rotation)
- Audit via CloudTrail
- Coût : ~0,40 $/secret/mois + appels API

**AWS KMS** :

- Gestion centralisée des clés avec piste d'audit complète
- Rotation annuelle automatique des clés pour les clés gérées par le client
- Autorisations IAM précises par clé (politiques de clé + politiques IAM)
- Soutenu par un module de sécurité matérielle (HSM) — les clés ne quittent jamais le HSM
- Coût : 1 $/mois par clé + 0,03 $ par 10 000 appels API

**Là où ça se complique** :

- Les politiques de clé KMS sont séparées des politiques IAM (et évaluées conjointement) — peut être déroutant à déboguer
- Le chiffrement au repos doit être planifié — vous ne pouvez pas chiffrer une instance RDS non chiffrée existante en place
- La suppression de clé dans KMS a une période d'attente de 7 à 30 jours (un mécanisme de sécurité — les clés perdues signifient des données perdues)
- Les coûts de Secrets Manager s'accumulent avec le nombre de secrets et d'appels API à grande échelle

## Résumé

- Ne jamais stocker des identifiants dans le code, les variables d'environnement ou les fichiers de configuration soumis dans le contrôle de version.
- **Secrets Manager** stocke les identifiants de manière sécurisée et les fait tourner automatiquement. Les applications récupèrent les secrets via API.
- **KMS** gère les clés de chiffrement. La plupart des services AWS s'intègrent avec KMS pour le chiffrement au repos.
- Le **chiffrement au repos** (données stockées sur disque) utilise des clés KMS gérées par AWS ou par vous. Le **chiffrement en transit** utilise TLS.
- **Chiffrement enveloppé** : KMS chiffre la clé, pas les données directement. Le service chiffre les données en utilisant une clé de données locale.
- **Clés KMS gérées par le client** : contrôle total sur la rotation, l'accès et l'audit. **Clés gérées par AWS** : automatiques, aucune configuration nécessaire.
- **Parameter Store** est une alternative plus légère à Secrets Manager pour les valeurs de configuration non sensibles.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.3)*

- **Secrets Manager vs SSM Parameter Store** : Secrets Manager pour les identifiants nécessitant une rotation automatique ; Parameter Store pour la configuration générale. L'examen les distingue par les exigences de rotation et la sensibilité aux coûts.
- **Politiques de clé KMS** : Une clé KMS a sa propre politique de clé (une politique basée sur la ressource). Les politiques IAM seules ne donnent pas accès à une clé KMS — la politique de clé doit l'autoriser explicitement.
- **Chiffrement RDS** : Impossible d'activer le chiffrement sur une instance RDS non chiffrée existante. Le processus : créer un instantané → copier l'instantané avec le chiffrement activé → restaurer depuis l'instantané chiffré → migrer le trafic vers la nouvelle instance.
- **Chiffrement EBS** : Les nouveaux volumes peuvent être chiffrés. Les instantanés de volumes chiffrés sont toujours chiffrés. Les volumes non chiffrés ne peuvent pas être directement chiffrés — instantané + copie + restauration.
- **CloudTrail + KMS** : Chaque appel à l'API KMS est enregistré dans CloudTrail. C'est une fonctionnalité clé de conformité.
- **Clés KMS multi-régions** : Répliquez le matériel de clé vers plusieurs régions pour que le déchiffrement puisse se faire sans appels API inter-régions. L'examen utilise cela pour la reprise après sinistre multi-région avec des données chiffrées.
- **KMS vs CloudHSM** : KMS est multi-locataire (géré par AWS). CloudHSM est un module de sécurité matérielle dédié que vous seul contrôlez. Signaux d'examen : « FIPS 140-2 Niveau 3 », « HSM dédié », « opérations cryptographiques gérées par le client » → CloudHSM.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez le concept de chiffrement enveloppé. Pourquoi KMS chiffre-t-il une petite clé de données plutôt que de chiffrer directement vos données d'application ?

*(Indice : Pensez à ce qui se passe si vous avez 1 Go de données à chiffrer, et aux implications en termes de performances d'envoyer 1 Go à un service KMS distant.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de services financiers stocke des données clients sensibles dans une base de données RDS MySQL. Une nouvelle exigence de conformité impose :

1. Toutes les données doivent être chiffrées au repos
2. Toute utilisation des clés de chiffrement doit être auditable
3. Les clés de chiffrement doivent être contrôlées par le client (pas gérées par AWS)
4. Le mot de passe de la base de données doit être renouvelé automatiquement tous les 90 jours

La base de données a été créée il y a six mois sans chiffrement activé. Quel ensemble d'actions répond LE MIEUX à toutes les quatre exigences ?

A) Activer le chiffrement RDS sur la base de données existante ; créer une clé KMS gérée par le client ; configurer Secrets Manager avec une rotation de 90 jours  
B) Créer un instantané de la base de données existante ; copier l'instantané avec le chiffrement en utilisant une clé KMS gérée par le client ; restaurer depuis l'instantané chiffré ; configurer Secrets Manager avec une rotation de 90 jours  
C) Créer une nouvelle instance RDS chiffrée avec une clé gérée par AWS ; migrer les données depuis l'ancienne instance ; configurer Secrets Manager avec une rotation de 90 jours  
D) Activer le chiffrement au repos RDS sur la base de données existante en utilisant une clé gérée par AWS ; configurer Secrets Manager avec une rotation de 90 jours

**Indice 1** : Vous ne pouvez pas activer directement le chiffrement sur une instance RDS non chiffrée existante.

**Indice 2** : Les clés « contrôlées par le client » signifient des clés KMS gérées par le client, pas des clés gérées par AWS.

**Indice 3** : Le processus de copie d'instantané est le chemin de migration standard vers une instance RDS chiffrée.

**Réponse** : B

**Explication** : Le chiffrement RDS ne peut pas être activé sur une instance existante. L'approche standard est : prendre un instantané de l'instance existante → copier l'instantané avec le chiffrement activé en utilisant une clé KMS gérée par le client (satisfait les exigences 1, 2 et 3) → restaurer depuis l'instantané chiffré. Les clés KMS gérées par le client enregistrent automatiquement toute utilisation dans CloudTrail (audit) et gardent les clés de chiffrement sous votre contrôle. Secrets Manager gère la rotation automatique du mot de passe tous les 90 jours (satisfait l'exigence 4).

**Pourquoi pas A ?** Vous ne pouvez pas activer le chiffrement sur une instance RDS non chiffrée existante en place.

**Pourquoi pas C ?** Les clés gérées par AWS ne satisfont pas l'exigence « contrôlée par le client » (exigence 3).

**Pourquoi pas D ?** Même problème que A (impossible à activer en place) plus la clé gérée par AWS ne satisfait pas l'exigence 3.

*SAA-C03 Domaine : Concevoir des architectures sécurisées — Tâche 1.3*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus a besoin de stocker les données sensibles suivantes :

- Mot de passe de base de données pour l'instance RDS de production
- Clé secrète API Stripe (utilisée pour le traitement des paiements)
- Une clé de chiffrement symétrique pour chiffrer l'historique des commandes clients dans DynamoDB
- Valeurs de configuration par restaurant (points de terminaison API, indicateurs de fonctionnalités — pas sensibles)

Quel service ou approche AWS utiliseriez-vous pour chacun ? Quelle stratégie de rotation appliqueriez-vous à chacun ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la correspondance des outils de sécurité aux cas d'utilisation.)*

## Scène post-générique

Les secrets avaient été migrés.

Mots de passe de base de données : Secrets Manager, rotation tous les 30 jours.

Clés API : Secrets Manager, avec un Lambda de rotation qui appelait l'API du fournisseur de paiement pour générer une nouvelle clé.

Données de commandes clients : chiffrées avec une clé KMS gérée par le client.

Anciens identifiants : désactivés. Anciens fichiers de configuration : supprimés. Anciens secrets GitHub Actions : supprimés.

« Nous sommes maintenant prêts pour un audit », dit Priya.

« Définissez prêts pour un audit », dit Maya.

« Si un auditeur de conformité nous demandait de prouver qu'aucun identifiant n'est codé en dur dans notre code ou exposé dans notre infrastructure, nous pourrions lui montrer : chaque secret est dans Secrets Manager, chaque clé de chiffrement est dans KMS, chaque accès est enregistré dans CloudTrail. »

« Depuis quand quelqu'un a-t-il vérifié les journaux CloudTrail ? »

Une pause.

« Je les vérifie chaque semaine », dit Priya.

« Et si quelque chose d'inhabituel apparaissait, comment saurions-nous ? »

« Ça », dit Priya en fermant son ordinateur portable, « c'est la prochaine conversation. »

Dans le prochain chapitre : les trois couches de défense qui se dressent entre Nimbus et Internet.
