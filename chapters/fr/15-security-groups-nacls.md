# Chapitre 15 : Les gardes à la porte

L'ancienne clé de déploiement de la première version de Nimbus était encore active. Elle avait effectué trois appels API la semaine dernière. Leo ne savait pas ce qui les avait faits.

Priya ouvrit les journaux de flux VPC — des enregistrements de trafic réseau qui montrent chaque connexion entrant et sortant du VPC.

« Le mardi à 2h17 du matin », dit-elle, « il y avait une connexion sortante depuis l'instance EC2 exécutant l'ancienne API vers une adresse IP en Roumanie. »

« Ce n'est pas notre infrastructure », dit Leo.

« Non. »

« Donc quelqu'un était sur notre instance EC2. »

« Ou quelque chose. »

Ils ont retracé : l'ancienne clé de déploiement avait été utilisée pour télécharger un petit script sur l'instance EC2. Le script avait essayé de scanner les ports des serveurs adjacents. La plupart des scans avaient échoué.

« Les groupes de sécurité les ont bloqués », dit Priya. « L'attaquant est entré sur une instance EC2. Il ne pouvait pas atteindre les autres parce que les groupes de sécurité n'autorisaient le trafic que depuis l'équilibreur de charge. »

« Donc les dommages ont été contenus. »

« Parce que nous avions des groupes de sécurité correctement configurés. Imaginez si nous avions laissé le port 5432 ouvert à n'importe quelle instance EC2 dans le compte. »

Leo n'avait pas besoin d'imaginer. Il avait vu cette configuration dans la configuration originale.

**Deux couches de sécurité réseau**

Dans un VPC, vous disposez de deux outils distincts pour contrôler le trafic réseau :

**Groupes de sécurité** : Pare-feux virtuels attachés à des ressources individuelles (instances EC2, bases de données RDS, équilibreurs de charge, fonctions Lambda dans un VPC). Ils opèrent au niveau de la ressource.

**ACL réseau (NACL)** : Règles de pare-feu attachées aux sous-réseaux. Elles opèrent à la limite du sous-réseau — avant que le trafic n'atteigne toute ressource dans ce sous-réseau.

Comprendre les deux nécessite de comprendre une différence cruciale : **avec état vs sans état**.

**Avec état : groupes de sécurité**

Un groupe de sécurité est **avec état**.

Quand vous autorisez le trafic entrant sur un port spécifique, le trafic de réponse est automatiquement autorisé en sortie, même s'il n'y a pas de règle sortante explicite pour cela.

Quand vous autorisez le trafic sortant vers une destination, la réponse qui revient en entrant est automatiquement autorisée.

Pensez à un agent de sécurité avec état dans un immeuble de bureaux. Vous montrez votre badge pour entrer. Vous sortez plus tard. L'agent n'a pas besoin de vous vérifier à nouveau à la sortie — le système sait que vous avez été autorisé à entrer, et vous êtes autorisé à partir.

**Règles du groupe de sécurité pour l'instance EC2 de l'API Nimbus :**

- **Entrant — TCP 8080 — depuis le SG de l'équilibreur de charge** → Accepter le trafic API depuis l'ALB
- **Entrant — TCP 22 — depuis le SG du bastion** → SSH depuis le bastion uniquement
- **Sortant — TCP 5432 — vers le SG RDS** → Connexion à PostgreSQL
- **Sortant — TCP 6379 — vers le SG ElastiCache** → Connexion à Redis
- **Sortant — TCP 443 — vers 0.0.0.0/0** → HTTPS vers les API externes

Remarque : pas de règle sortante explicite pour le port 8080. La règle entrante est avec état — le trafic de réponse (la réponse de l'API à l'équilibreur de charge) est automatiquement autorisé.

Remarque également : les règles du groupe de sécurité référencent *d'autres groupes de sécurité*, pas des adresses IP. « Autoriser l'entrant depuis le groupe de sécurité de l'équilibreur de charge » signifie « autoriser le trafic depuis toute ressource qui a ce groupe de sécurité attaché. » C'est plus flexible et maintenable que de suivre des adresses IP.

**Comportement par défaut :**

- Par défaut, tout le trafic entrant est refusé
- Par défaut, tout le trafic sortant est autorisé
- Toutes les règles sont évaluées (les groupes de sécurité n'ont pas de règles ordonnées — toutes les règles correspondantes s'appliquent)
- Les groupes de sécurité peuvent uniquement **autoriser** le trafic — vous ne pouvez pas créer de règles de refus explicites

**Sans état : ACL réseau**

Une NACL est **sans état**.

Quand vous autorisez le trafic entrant sur le port 8080, cela ne couvre que l'entrant. La réponse (trafic sortant sur des ports éphémères) doit être explicitement autorisée avec une règle sortante.

Pensez à un détecteur de métaux. Vous le traversez à l'entrée. Le détecteur de métaux ne sait pas que vous êtes déjà passé — vous devez le traverser à nouveau à la sortie.

**Les règles NACL sont numérotées et évaluées dans l'ordre.** La première règle qui correspond gagne. La règle 100 est évaluée avant la règle 200. Si la règle 100 refuse le trafic et que la règle 200 l'autorise, le trafic est refusé.

Les NACL peuvent explicitement **refuser** le trafic — contrairement aux groupes de sécurité, qui ne peuvent qu'autoriser. Cela les rend utiles pour bloquer des plages d'adresses IP spécifiques.

**Comportement NACL par défaut :**

- La NACL par défaut (créée avec votre VPC) autorise tout le trafic entrant et sortant
- Une NACL personnalisée refuse tout le trafic par défaut (vous devez explicitement autoriser ce que vous voulez)

**NACL pour le sous-réseau public (simplifié) :**

*Règles entrantes (évaluées dans l'ordre — la première correspondance gagne) :*

- Règle 100 : TCP 443, depuis 0.0.0.0/0 → **Autoriser** (HTTPS)
- Règle 110 : TCP 80, depuis 0.0.0.0/0 → **Autoriser** (HTTP)
- Règle 120 : TCP 1024–65535, depuis 0.0.0.0/0 → **Autoriser** (ports de retour éphémères)
- Règle \* : Tout le trafic → **Refuser**

*Règles sortantes :*

- Règle 100 : TCP 443, vers 0.0.0.0/0 → **Autoriser** (HTTPS)
- Règle 110 : TCP 80, vers 0.0.0.0/0 → **Autoriser** (HTTP)
- Règle 120 : TCP 1024–65535, vers 0.0.0.0/0 → **Autoriser** (ports de retour éphémères)
- Règle \* : Tout le trafic → **Refuser**

La règle 120 (ports 1024-65535) autorise les ports éphémères — les ports temporaires à numéro élevé utilisés pour le trafic de réponse TCP. Comme les NACL sont sans état, vous devez explicitement les autoriser en sortie, sinon les réponses de votre serveur ne passeront pas.

**Quand utiliser quoi**

Utilisez les **groupes de sécurité** pour la couche principale de contrôle d'accès. Ils sont plus faciles à gérer, avec état (moins de risque de blocages accidentels dus à l'oubli des ports éphémères), et prennent en charge le référencement d'autres groupes de sécurité.

Utilisez les **NACL** pour les contrôles au niveau du sous-réseau, notamment :

- **Règles de refus explicites** : Bloquer une adresse IP ou une plage spécifique d'atteindre un sous-réseau entier
- **Blocage d'urgence** : Une IP attaque activement — ajoutez une règle de refus NACL pour bloquer le sous-réseau entier avant qu'elle n'atteigne une ressource

« Donc le groupe de sécurité est le contrôle fin », dit Maya, « et la NACL est le grand coup de pinceau ? »

« Les groupes de sécurité protègent les ressources individuelles », confirma Priya. « Les NACL protègent des sous-réseaux entiers. Quand vous voulez bloquer une IP d'atteindre quoi que ce soit dans votre réseau, NACL. Quand vous voulez n'autoriser que l'équilibreur de charge à atteindre le serveur API, groupe de sécurité. »

**L'incident : ce que les couches ont arrêté**

Revenons à l'attaque de l'IP roumaine :

**Ce qui s'est passé** : L'attaquant a utilisé la clé de déploiement compromise pour télécharger un script de scan sur une instance EC2. Le script a essayé de se connecter à d'autres services.

**Ce qui les a arrêtés** :

- Le groupe de sécurité RDS n'autorisait l'entrant sur le port 5432 que depuis le groupe de sécurité EC2 de l'API. Le script ne pouvait pas atteindre la base de données depuis un outil de scan — il n'attachait pas le bon groupe de sécurité.
- Le groupe de sécurité ElastiCache n'autorisait l'entrant sur le port 6379 que depuis le groupe de sécurité EC2 de l'API.
- Les autres instances EC2 n'autorisaient le SSH que depuis le groupe de sécurité du bastion.

**Ce qui ne les a pas arrêtés** :

- Les règles sortantes de l'instance EC2 autorisaient le HTTPS vers 0.0.0.0/0 (nécessaire pour les téléchargements de paquets). Le script a utilisé cela pour effectuer des connexions sortantes vers le serveur de l'attaquant.

Après l'incident, Priya a ajouté :

- Une règle NACL bloquant la plage d'IP roumaine
- Une règle sortante plus restrictive sur les instances EC2 (n'autorisait que des destinations connues et valides spécifiques)

## Points forts et limites

**Groupes de sécurité** :

- Avec état (pas de maux de tête avec les ports éphémères)
- Peuvent référencer d'autres groupes de sécurité (plus flexible que les IPs)
- Uniquement des règles d'autorisation — pas de refus explicite
- Opèrent au niveau de la ressource — granulaire

**NACL** :

- Sans état (nécessite des règles explicites dans les deux sens, y compris les ports éphémères)
- Peuvent refuser explicitement — utile pour bloquer des IPs connues malveillantes
- Opèrent au niveau du sous-réseau — coup de pinceau plus large
- Règles numérotées évaluées dans l'ordre — prévisible mais nécessite une gestion soigneuse

## Résumé

- Les **groupes de sécurité** sont des pare-feux virtuels avec état pour les ressources individuelles. Règles d'autorisation uniquement. Toutes les règles évaluées.
- Les **NACL** sont des pare-feux sans état pour des sous-réseaux entiers. Règles d'autorisation et de refus. Règles évaluées dans l'ordre numérique.
- **Avec état** signifie que le trafic de réponse est automatiquement autorisé. **Sans état** signifie que vous devez explicitement autoriser le trafic dans les deux sens.
- Les groupes de sécurité sont votre couche principale de contrôle d'accès. Les NACL sont une couche supplémentaire pour les contrôles au niveau du sous-réseau et le blocage explicite.
- Quand une NACL autorise le trafic entrant, vous devez également autoriser les ports éphémères sortants (1024-65535) pour que la réponse TCP passe.
- Les groupes de sécurité peuvent se référencer mutuellement — autoriser le trafic « depuis le groupe de sécurité de l'équilibreur de charge » est plus maintenable que de suivre des adresses IP.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.2)*

- **Avec état vs sans état** : Cette distinction est le concept le plus testé dans ce chapitre. Groupes de sécurité = avec état = réponse autorisée automatiquement. NACL = sans état = doit explicitement autoriser le trafic de réponse.
- **Règles de groupe de sécurité** : Pas de refus explicite. Quand plusieurs groupes de sécurité sont attachés à une instance, l'union de toutes les règles s'applique. Toutes les règles correspondantes sont évaluées.
- **Ordre des règles NACL** : Les règles sont évaluées du numéro le plus bas au plus élevé. Règle 100 avant 200. La première correspondance gagne. La règle `*` (astérisque) en bas est le refus implicite.
- **Ports éphémères** : L'erreur NACL classique est d'oublier d'autoriser les sortants sur les ports 1024-65535. Si votre NACL autorise le HTTP entrant (port 80) mais n'autorise pas les ports éphémères sortants, les utilisateurs peuvent envoyer des requêtes mais ne jamais recevoir de réponses.
- **Référencement de groupe de sécurité** : Vous pouvez autoriser le trafic depuis un autre groupe de sécurité (pas seulement une IP). C'est le modèle recommandé pour le trafic intra-VPC.
- **NACL par défaut vs NACL personnalisée** : La NACL par défaut autorise tout le trafic. Une NACL personnalisée (que vous créez) refuse tout le trafic par défaut. Scénario d'examen : « créé une nouvelle NACL et maintenant le trafic est bloqué » → vérifiez les règles d'autorisation manquantes.

## Exercices

**Exercice 1 — Mémorisation**

Une développeuse ajoute une règle entrante à un groupe de sécurité autorisant le trafic sur le port 443. Doit-elle également ajouter une règle sortante pour autoriser la réponse du serveur ? Pourquoi ou pourquoi pas ?

Si à la place elle ajoute une règle entrante à une NACL autorisant le trafic sur le port 443, doit-elle ajouter une règle sortante ? Pourquoi ou pourquoi pas ?

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise a une application web s'exécutant sur des instances EC2 dans un sous-réseau public. L'application accepte le trafic HTTPS (port 443) depuis Internet. Les utilisateurs signalent qu'ils peuvent se connecter à l'application mais ne peuvent pas recevoir de réponses — les requêtes restent en attente et expirent.

Le groupe de sécurité EC2 a une règle entrante autorisant TCP 443 depuis 0.0.0.0/0. La NACL du sous-réseau a une règle entrante (règle 100) autorisant TCP 443 depuis 0.0.0.0/0 et une règle sortante (règle 100) autorisant TCP 443 vers 0.0.0.0/0.

Quelle est la cause LA PLUS PROBABLE du problème ?

A) Le groupe de sécurité manque d'une règle sortante pour TCP 443  
B) La NACL manque d'une règle sortante autorisant les ports éphémères (1024-65535)  
C) Le groupe de sécurité manque d'une règle entrante pour les ports éphémères  
D) Les instances EC2 n'ont pas d'adresses IP Elastic

**Indice 1** : Les groupes de sécurité sont avec état — ils autorisent automatiquement les réponses. Les NACL sont sans état — elles ne le font pas.

**Indice 2** : Quand un navigateur se connecte à un serveur web sur le port 443, la réponse du serveur revient sur un port éphémère aléatoire (1024-65535), pas sur le port 443.

**Indice 3** : La NACL a une règle sortante pour 443, mais la réponse ne va pas au port 443.

**Réponse** : B

**Explication** : La NACL est sans état. Quand les utilisateurs se connectent au serveur sur le port 443, la réponse TCP du serveur revient sur un port éphémère (choisi aléatoirement parmi 1024-65535). La règle sortante NACL n'autorise que le port 443, donc la réponse est bloquée par la règle de refus par défaut. Ajouter une règle sortante NACL autorisant TCP 1024-65535 résoudrait ce problème.

**Pourquoi pas A ?** Les groupes de sécurité sont avec état — le trafic de réponse est automatiquement autorisé quelle que soit les règles sortantes. Aucune règle sortante de groupe de sécurité n'est nécessaire.

**Pourquoi pas C ?** Les ports éphémères sont pour le trafic de réponse sortant, pas entrant. La connexion entrante des utilisateurs arrive sur le port 443, qui est déjà autorisé.

**Pourquoi pas D ?** Les IPs Elastic affectent si les instances ont des IPs publiques, pas si les connexions établies peuvent recevoir des réponses.

*SAA-C03 Domaine : Concevoir des architectures sécurisées — Tâche 1.2*

**Exercice 3 — Défi architectural** *(Facultatif)*

Après l'attaque de l'IP roumaine, Priya veut mettre en place deux contrôles supplémentaires :

1. Bloquer toute la plage d'IP 185.0.0.0/8 d'atteindre toute ressource dans le sous-réseau public
2. S'assurer que le sous-réseau privé contenant la base de données ne peut jamais communiquer avec Internet, même si quelqu'un configure incorrectement un groupe de sécurité

Quels outils utiliseriez-vous pour chaque exigence et comment les configureriez-vous ? Pourriez-vous utiliser des groupes de sécurité pour les deux ? Pourriez-vous utiliser des NACL pour les deux ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de comprendre quel outil correspond à quel problème.)*

## Scène post-générique

L'incident était contenu. La clé de déploiement compromise avait été désactivée. La plage d'IP roumaine avait été bloquée au niveau de la NACL. L'ancien script avait été supprimé de l'instance EC2.

Priya rédigea un rapport d'incident. Elle le partagea avec l'équipe.

La dernière ligne du rapport : « Cause racine : un identifiant actif d'un pipeline de déploiement désaffecté n'avait jamais été renouvelé ou révoqué. Recommandation : rotation automatique des identifiants et audit régulier de tous les identifiants IAM. »

Leo le lut trois fois.

« J'aurais dû faire tourner cette clé », dit-il.

« Oui », dit Priya.

« Comment s'assurer que ça ne se reproduit plus ? »

« Automatisation », dit-elle. « Et quelque chose qui surveille les surveillants. »

Dans le prochain chapitre : le coffre-fort où Nimbus garde ses secrets — et la rotation qui rend les clés volées inutiles.
