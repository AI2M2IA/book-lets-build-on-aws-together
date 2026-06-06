# Chapitre 15 : Les gardes à la porte

Le bureau était calme un mardi matin quand Priya ouvrit les VPC flow logs et commença à lire. Dehors par la fenêtre, la ville se réveillait. À l'intérieur, l'écran montrait quelque chose qui ne devrait pas être là : une connexion sortante d'une instance EC2 à 2 h 17 du matin vers une adresse IP en Roumanie.

L'ancienne clé de déploiement de la première version de Nimbus était toujours active. Elle avait fait trois appels d'API la semaine dernière. Leo ne savait pas ce qui les avait faits.

---

*La refonte d'IAM avait remplacé les clés d'accès par des rôles. Chaque service avait maintenant exactement les permissions dont il avait besoin. Mais pendant que ce travail se faisait, un problème plus ancien s'aggravait discrètement : un identifiant actif d'un pipeline de déploiement mis hors service était toujours vivant, et quelque chose l'avait utilisé. La couche IAM avait été renforcée. Les contrôles réseau qui auraient pu contenir les dégâts avaient besoin de la même attention.*

---

Priya ouvrit les VPC flow logs — des enregistrements de trafic réseau qui montrent chaque connexion entrant et sortant du VPC.

« Mardi à 2 h 17 du matin », dit-elle, « il y a eu une connexion sortante de l'instance EC2 qui fait tourner l'ancienne API vers une adresse IP en Roumanie. »

« Ce n'est pas notre infrastructure », dit Leo.

« Non. »

« Donc quelqu'un était sur notre instance EC2. »

« Ou quelque chose. »

Ils remontèrent la piste : l'ancienne clé de déploiement avait été utilisée pour téléverser un petit script sur l'instance EC2. Le script avait essayé de scanner les ports des serveurs adjacents. La plupart des scans avaient échoué.

« Je l'ai déjà déployé — oh. » Leo avait déployé un correctif à la règle de groupe de sécurité avant que l'enquête ne soit terminée. Le correctif était correct, mais il l'avait fait avant que Priya n'ait fini de lire les flow logs. Elle avait dû s'arrêter et vérifier que le changement n'avait rien affecté d'inattendu.

« La prochaine fois, attends que l'enquête soit close avant de pousser des changements », dit-elle.

« Les groupes de sécurité les ont bloqués », dit Priya. « L'attaquant a réussi à entrer sur une instance EC2. Il ne pouvait pas atteindre les autres parce que les groupes de sécurité n'autorisaient que le trafic de l'équilibreur de charge. »

« Donc les dégâts ont été contenus. »

« Parce qu'on avait correctement configuré les groupes de sécurité. Imagine si on avait laissé le port 5432 ouvert à n'importe quelle instance EC2 du compte. »

Leo n'avait pas besoin d'imaginer. Il avait vu cette configuration dans la configuration originale.

« A-t-on réfléchi à ce que ça signifierait ? » continua Priya. « N'importe quelle instance EC2 du compte — y compris celle avec la clé compromise — aurait pu se connecter directement à la base de données. Exécuter du SQL arbitraire. Télécharger l'historique des commandes de chaque client. Supprimer des tables. »

« Au lieu de ça, ils se sont fait rejeter à chaque tentative », dit Leo.

« Oui. Parce que le groupe de sécurité de la base de données n'accepte les connexions que du groupe de sécurité de l'API. Pas de n'importe quelle EC2 du compte. Pas de n'importe quelle IP. Spécifiquement du groupe de sécurité de l'API. »

« Cette seule décision de conception », dit Maya, « était la différence entre un incident contenu et une fuite de données complète. »

« La conception des groupes de sécurité n'est pas une case à cocher », dit Priya. « C'est la sécurité réelle du système. »

Rafael avait écouté. « Comment apprend-on quelle est la bonne configuration ? Les règles semblent arbitraires au début. »

« Tu commences par lister ce que chaque composant a besoin de faire », dit Priya. « L'équilibreur de charge doit accepter HTTPS de n'importe où. Le serveur d'API doit accepter HTTP de l'équilibreur de charge uniquement. La base de données doit accepter PostgreSQL du serveur d'API uniquement. Redis doit accepter le port 6379 du serveur d'API uniquement. Ces exigences correspondent directement aux règles entrantes. Tout le reste est refusé par défaut. »

« Et le sortant ? »

« Le sortant est là où les gens deviennent paresseux. La plupart des équipes laissent le sortant en autoriser-tout. Ça signifie qu'une instance compromise peut appeler n'importe quoi. On va resserrer ça. »

**Deux couches de sécurité réseau**

Dans un VPC, vous avez deux outils distincts pour contrôler le trafic réseau :

**Groupes de sécurité** : Des pare-feux virtuels attachés à des ressources individuelles (instances EC2, bases de données RDS, équilibreurs de charge, fonctions Lambda dans un VPC). Ils opèrent au niveau de la ressource.

**ACL réseau (NACLs)** : Des règles de pare-feu attachées aux sous-réseaux. Elles opèrent à la frontière du sous-réseau — avant que le trafic n'atteigne une quelconque ressource de ce sous-réseau.

Comprendre les deux nécessite de comprendre une différence cruciale : **avec état vs sans état**.

**Avec état : Les groupes de sécurité**

Un groupe de sécurité est **avec état**.

Quand vous autorisez le trafic entrant sur un port spécifique, le trafic de réponse est automatiquement autorisé en sortie, même s'il n'y a pas de règle sortante explicite pour lui.

Quand vous autorisez le trafic sortant vers une destination, la réponse qui revient est automatiquement autorisée.

Pensez à un agent de sécurité avec état dans un immeuble de bureaux. Vous montrez votre badge pour entrer. Vous sortez plus tard. L'agent n'a pas besoin de vous vérifier à nouveau à la sortie — le système sait que vous avez été admis, et vous êtes autorisé à partir.

**Règles de groupe de sécurité pour l'instance EC2 de l'API Nimbus :**

- **Entrant — TCP 8080 — depuis SG de l'équilibreur de charge** → Accepter le trafic d'API de l'ALB
- **Entrant — TCP 22 — depuis SG de l'hôte bastion** → SSH depuis le bastion uniquement
- **Sortant — TCP 5432 — vers SG de RDS** → Se connecter à PostgreSQL
- **Sortant — TCP 6379 — vers SG d'ElastiCache** → Se connecter à Redis
- **Sortant — TCP 443 — vers 0.0.0.0/0** → HTTPS vers les API externes

Remarquez : aucune règle sortante explicite pour le port 8080. La règle entrante est avec état — le trafic de réponse (la réponse de l'API à l'équilibreur de charge) est automatiquement autorisé.

Remarquez aussi : les règles de groupe de sécurité référencent *d'autres groupes de sécurité*, pas des adresses IP. « Autoriser l'entrant depuis le groupe de sécurité de l'équilibreur de charge » signifie « autoriser le trafic de n'importe quelle ressource qui a ce groupe de sécurité attaché ». C'est plus flexible et plus maintenable que de suivre des adresses IP.

**Comportement par défaut :**

- Par défaut, tout le trafic entrant est refusé
- Par défaut, tout le trafic sortant est autorisé
- Toutes les règles sont évaluées (les groupes de sécurité n'ont pas de règles ordonnées — toutes les règles correspondantes s'appliquent)
- Les groupes de sécurité ne peuvent qu'**autoriser** le trafic — vous ne pouvez pas créer de règles de refus explicites

**Sans état : Les ACL réseau**

Un NACL est **sans état**.

Quand vous autorisez le trafic entrant sur le port 8080, ça ne couvre que l'entrant. La réponse (le trafic sortant sur des ports éphémères) doit être explicitement autorisée avec une règle sortante.

Pensez à un détecteur de métaux. Vous passez à travers en entrant. Le détecteur de métaux ne sait pas que vous êtes déjà passé — vous devez repasser à travers en sortant.

**Les règles NACL sont numérotées et évaluées dans l'ordre.** La première règle qui correspond gagne. La règle 100 est évaluée avant la règle 200. Si la règle 100 refuse le trafic et que la règle 200 l'autorise, le trafic est refusé.

Les NACLs peuvent explicitement **refuser** le trafic — contrairement aux groupes de sécurité, qui ne peuvent qu'autoriser. Ça les rend utiles pour bloquer des plages d'IP spécifiques.

**Comportement par défaut du NACL :**

- Le NACL par défaut (créé avec votre VPC) autorise tout le trafic entrant et sortant
- Un NACL personnalisé refuse tout le trafic par défaut (vous devez explicitement autoriser ce que vous voulez)

**NACL pour le sous-réseau public (simplifié) :**

*Règles entrantes (évaluées dans l'ordre — première correspondance gagne) :*

- Règle 100 : TCP 443, depuis 0.0.0.0/0 → **Autoriser** (HTTPS)
- Règle 110 : TCP 80, depuis 0.0.0.0/0 → **Autoriser** (HTTP)
- Règle 120 : TCP 1024–65535, depuis 0.0.0.0/0 → **Autoriser** (ports de retour éphémères)
- Règle \* : Tout le trafic → **Refuser**

*Règles sortantes :*

- Règle 100 : TCP 443, vers 0.0.0.0/0 → **Autoriser** (HTTPS)
- Règle 110 : TCP 80, vers 0.0.0.0/0 → **Autoriser** (HTTP)
- Règle 120 : TCP 1024–65535, vers 0.0.0.0/0 → **Autoriser** (ports de retour éphémères)
- Règle \* : Tout le trafic → **Refuser**

La règle 120 (ports 1024-65535) autorise les ports éphémères — les ports temporaires à numéro élevé utilisés pour le trafic de réponse TCP. Parce que les NACLs sont sans état, vous devez explicitement les autoriser en sortie, sinon les réponses de votre serveur ne passeront pas.

**Quand utiliser lequel**

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Pourquoi avoir deux outils séparés — des groupes de sécurité *et* des NACLs — si les groupes de sécurité fonctionnent déjà ? Quel est l'intérêt de la complexité supplémentaire ? »

La réponse est qu'ils opèrent à des niveaux différents et ont des capacités différentes. Les groupes de sécurité protègent les ressources individuelles et ne peuvent qu'autoriser le trafic. Les NACLs protègent des sous-réseaux entiers et peuvent explicitement refuser. Avoir les deux signifie que vous pouvez appliquer des règles d'autorisation fines au niveau de la ressource et des règles de refus larges au niveau du sous-réseau — sans que l'un interfère avec l'autre.

Utilisez les **groupes de sécurité** pour la couche principale de contrôle d'accès. Ils sont plus faciles à gérer, avec état (moins de risque de blocages accidentels dus à l'oubli des ports éphémères), et prennent en charge le référencement d'autres groupes de sécurité.

Utilisez les **NACLs** pour les contrôles au niveau du sous-réseau, en particulier :

- **Règles de refus explicites** : Bloquer une adresse IP ou une plage spécifique d'atteindre un sous-réseau entier
- **Blocage d'urgence** : Une IP attaque activement — ajoutez une règle de refus NACL pour bloquer le sous-réseau entier avant qu'elle n'atteigne une quelconque ressource

Vous vous demandez peut-être : si les groupes de sécurité sont avec état et bloquent tout l'entrant par défaut, quand auriez-vous vraiment besoin de NACLs ? Les groupes de sécurité gèrent bien la plupart des cas. Mais il y a une chose qu'ils ne peuvent pas faire : refuser explicitement. Un groupe de sécurité ne peut qu'autoriser le trafic — si une règle ne correspond pas, le trafic est refusé par défaut. Vous ne pouvez pas ajouter une règle qui dit « bloquer cette IP spécifique ». Pour ça, vous avez besoin d'un NACL : une règle de refus numérotée qui arrête une plage d'adresses spécifique avant qu'elle n'atteigne une quelconque ressource du sous-réseau. Les NACLs sont les plus utiles pour la réponse d'urgence (bloquer un attaquant actif) et pour imposer des frontières au niveau du sous-réseau qui ne devraient pas dépendre de la configuration des ressources individuelles.

« Donc le groupe de sécurité est le contrôle fin », dit Maya, « et le NACL est le coup large ? »

« Les groupes de sécurité protègent les ressources individuelles », confirma Priya. « Les NACLs protègent des sous-réseaux entiers. Quand vous voulez bloquer une IP d'atteindre quoi que ce soit dans votre réseau, NACL. Quand vous voulez autoriser uniquement l'équilibreur de charge à atteindre le serveur d'API, groupe de sécurité. »

« A-t-on réfléchi à ce qui se passe si l'attaquant revient avec une IP différente ? » dit Priya. « Le NACL bloque une plage. Ils passent à une autre. »

« C'est à ça que sert GuardDuty », dit Leo. « La détection comportementale. Si le même script s'exécute depuis une nouvelle IP, le schéma de trafic est le même. »

« On y arrivera », dit Priya. « Chaque chose en son temps. »

« Combien tout ça coûte par mois ? » demanda Tom.

Les groupes de sécurité et les NACLs eux-mêmes sont gratuits. AWS ne facture pas le nombre de groupes de sécurité, le nombre de règles, ni le nombre d'entrées NACL. La considération de coût est indirecte : des règles sortantes de groupe de sécurité plus strictes peuvent router moins de trafic via la passerelle NAT, réduisant les frais de traitement de données.

« Donc les contrôles de sécurité sont gratuits », dit Rafael. « Le coût est l'infrastructure qui les soutient. »

« Correct. Les passerelles NAT pour la haute disponibilité. Les Endpoints VPC Interface pour les services qui passeraient autrement par NAT. Ceux-là ont des coûts. Les règles de groupe de sécurité elles-mêmes non. »

**Tout assembler : La défense en couches**

Après l'incident, Priya dessina les couches de défense de Nimbus sur le tableau blanc :

```
Internet
  ↓
CloudFront + Shield (absorption DDoS)
  ↓
WAF (filtrage au niveau application)
  ↓
Passerelle Internet
  ↓
NACL sur le sous-réseau public (règles au niveau du sous-réseau, blocage d'urgence)
  ↓
Groupe de sécurité de l'ALB (HTTPS de n'importe où)
  ↓
NACL sur le sous-réseau d'app privé
  ↓
Groupe de sécurité de l'API EC2 (port 8080 depuis SG de l'ALB uniquement)
  ↓
NACL sur le sous-réseau de données privé
  ↓
Groupe de sécurité de RDS (port 5432 depuis SG de l'API uniquement)
```

« Chaque couche suppose que la précédente pourrait échouer », dit-elle. « La base de données ne fait pas confiance au fait que la couche réseau a arrêté l'attaquant. L'instance EC2 ne fait pas confiance au fait que l'ALB a arrêté l'attaquant. Chaque couche impose ses propres règles indépendamment. »

« Défense en profondeur », dit Maya.

« Défense en profondeur. Un attaquant qui passe une couche fait toujours face à la suivante. Aucune mauvaise configuration unique n'est catastrophique. Ça signifie qu'une couche échoue, et les autres tiennent. »

Leo regarda le diagramme. L'attaquant avait compromis une instance EC2. Il avait franchi la couche des identifiants. Mais chaque couche suivante avait tenu.

C'était à ça que ressemblait la défense en profondeur en pratique.

**L'incident : Ce que les couches ont attrapé**

En revenant à l'attaque de l'IP roumaine :

**Ce qui s'est passé** : L'attaquant a utilisé la clé de déploiement compromise pour téléverser un script de scan sur une instance EC2. Le script a essayé de se connecter à d'autres services.

**Ce qui les a arrêtés** :

- Le groupe de sécurité de RDS n'autorisait l'entrant sur le port 5432 que depuis le groupe de sécurité de l'API EC2. Le script ne pouvait pas atteindre la base de données depuis un outil de scan — il n'attachait pas le bon groupe de sécurité.
- Le groupe de sécurité d'ElastiCache n'autorisait l'entrant sur le port 6379 que depuis le groupe de sécurité de l'API EC2.
- Les autres instances EC2 n'autorisaient le SSH que depuis le groupe de sécurité de l'hôte bastion.

**Ce qui ne les a pas arrêtés** :

- Les règles sortantes de l'instance EC2 autorisaient HTTPS vers 0.0.0.0/0 (nécessaire pour les téléchargements de paquets). Le script a utilisé ça pour établir des connexions sortantes vers le serveur de l'attaquant.

Après l'incident, Priya ajouta :

- Une règle NACL bloquant la plage d'IP roumaine
- Une règle sortante plus restrictive sur les instances EC2 (n'autorisant que des destinations spécifiques connues comme bonnes)
- Une vérification que **IMDSv2 était imposé** (`HttpTokens=required`) sur chaque instance — le script s'était exécuté *sur* l'instance, ce qui signifiait qu'il aurait pu interroger le service de métadonnées pour les identifiants temporaires du rôle de l'instance. IMDSv2 avait été activé au Chapitre 4 ; Priya vérifia qu'il était toujours requis partout, parce qu'un attaquant avec exécution de code plus IMDSv1 égale des identifiants AWS volés.

---

**Lire les flow logs : Ce que Priya a vu**

L'enquête commença avec les VPC flow logs. Priya ouvrit CloudWatch Logs Insights et exécuta une requête contre le groupe de flow logs des 48 dernières heures :

```
fields @timestamp, srcAddr, dstAddr, srcPort, dstPort, action
| filter srcAddr = "10.0.10.7"
| filter action = "REJECT"
| sort @timestamp asc
```

`10.0.10.7` était l'instance EC2 compromise. Le filtre REJECT montrait les tentatives de connexion qui avaient été bloquées.

Les résultats :

```
10.0.10.7 → 10.0.10.8  port 22    REJECT   # Autre instance EC2 — SSH bloqué
10.0.10.7 → 10.0.10.9  port 22    REJECT   # Une autre EC2 — SSH bloqué
10.0.10.7 → 10.0.20.8  port 5432  REJECT   # RDS — bloqué par le groupe de sécurité
10.0.10.7 → 10.0.20.9  port 5432  REJECT   # Réplica RDS — bloqué
10.0.10.7 → 10.0.20.11 port 6379  REJECT   # Redis — bloqué
```

Le scan avait touché chaque service interne. Chaque tentative avait été rejetée. La conception des groupes de sécurité avait tenu.

Mais il y avait aussi une entrée sortante ACCEPT :

```
10.0.10.7 → 185.220.101.55  port 443  ACCEPT   2847 octets
```

C'était la tentative d'exfiltration de données — 2,8 kilooctets envoyés à l'IP roumaine via HTTPS. Le groupe de sécurité autorisait HTTPS sortant pour les téléchargements de paquets légitimes. L'attaquant avait utilisé cette règle.

« Les groupes de sécurité ont arrêté le mouvement latéral », dit Priya, en parcourant les journaux avec l'équipe. « Mais la règle sortante était trop permissive. On autorisait HTTPS vers n'importe quelle destination. On devrait autoriser HTTPS uniquement vers des points de terminaison AWS connus — CloudWatch, Secrets Manager, S3 — et vers les CDN des dépôts de paquets. »

Elle montra les règles sortantes mises à jour du groupe de sécurité :

```
TCP 443 → pl-63a5400a (liste de préfixes du endpoint gateway S3 AWS)
TCP 443 → pl-02cd2c6b (AWS CloudWatch Logs)
TCP 443 → 54.239.0.0/18 (dépôts de paquets AWS — se rétrécit avec le temps)
```

« Ça élimine la règle sortante HTTPS générale. Le HTTPS sortant ne va maintenant que vers des destinations connues comme bonnes. »

« Et pour les fonctions Lambda appelant des API tierces ? » demanda Leo.

« Celles-là passent par la passerelle NAT, qui a sa propre règle sortante dédiée », dit Priya. « Lambda n'utilise pas le groupe de sécurité EC2. Interface réseau différente, ensemble de règles différent. »

---

**L'histoire de débogage sans état**

Deux semaines après l'incident, Rafael — toujours dans son premier mois — aidait à configurer un nouveau pipeline de données. Il impliquait une fonction Lambda dans un VPC qui devait appeler une API interne tournant sur EC2.

La fonction Lambda expirait. Chaque appel expirait.

Rafael vérifia les groupes de sécurité. Le groupe de sécurité de la Lambda avait une règle sortante pour TCP 8080 vers le groupe de sécurité EC2. Le groupe de sécurité EC2 avait une règle entrante pour TCP 8080 depuis le groupe de sécurité de la Lambda. Les règles semblaient correctes.

Il se tourna vers Leo. « Les groupes de sécurité ont l'air bien. Pourquoi ça expire ? »

Leo regarda la configuration du sous-réseau. La fonction Lambda était dans un sous-réseau privé. Le sous-réseau avait un NACL personnalisé que Priya avait appliqué pendant le durcissement de sécurité.

Il regarda les règles sortantes du NACL :

```
Règle 100 : TCP 443  → 0.0.0.0/0  ALLOW
Règle 110 : TCP 5432 → 10.0.20.0/24 ALLOW
Règle *   : Tout     → 0.0.0.0/0  DENY
```

« Le NACL autorise HTTPS sortant et PostgreSQL sortant », dit Leo. « Il n'autorise pas TCP 8080 sortant. »

« Le groupe de sécurité l'autorise », dit Rafael.

« Le NACL non. Et le NACL est sans état. Même si le groupe de sécurité de la fonction Lambda autorise la connexion sortante, le NACL à la frontière du sous-réseau évalue quand même le trafic sortant. Le NACL bloque l'appel de la Lambda avant qu'il ne quitte le sous-réseau. »

« Mais si j'ajoute ALLOW pour TCP 8080 sortant au NACL— »

« Tu dois aussi ajouter ALLOW pour les ports éphémères entrants », dit Leo. « La réponse de l'instance EC2 revient sur un port aléatoire entre 1024 et 65535. Si les règles entrantes du NACL ne les autorisent pas, la réponse est bloquée au retour. »

Rafael mit à jour le NACL :

```
Règle 100 :  TCP 443       → 0.0.0.0/0      ALLOW  (sortant)
Règle 105 :  TCP 8080      → 10.0.10.0/24   ALLOW  (sortant vers le sous-réseau EC2)
Règle 110 :  TCP 5432      → 10.0.20.0/24   ALLOW  (sortant vers le sous-réseau DB)
Règle *   :  Tout          → 0.0.0.0/0      DENY
```

Et du côté entrant :

```
Règle 100 :  TCP 1024-65535 depuis 10.0.10.0/24  ALLOW  (trafic de retour depuis EC2)
Règle *   :  Tout                                 DENY
```

La fonction Lambda se connecta immédiatement.

« C'est pour ça que les gens détestent les NACLs », dit Rafael.

« C'est pour ça que tu dois les comprendre », dit Priya. « Les bugs qu'ils créent sont précisément les bugs qu'ils sont conçus pour prévenir — des flux de trafic inattendus. Comprendre le modèle sans état te dit exactement où chercher quand une connexion échoue mystérieusement. »

« Groupe de sécurité avec état — trafic de retour automatique. NACL sans état — le trafic de retour a besoin de règles explicites », répéta Rafael.

« Dis-le jusqu'à ce que ça fasse partie de ta façon de penser », dit Priya.

---

**Blocage d'urgence NACL : La règle du /24**

Après avoir identifié la plage d'IP source de l'attaquant, la réponse de Priya fut immédiate : ajouter une règle de refus NACL.

Mais elle ne bloqua pas uniquement l'IP unique. Elle bloqua le `/24` entier — le sous-réseau de 256 adresses depuis lequel l'attaquant opérait.

« Pourquoi tout le /24 ? » demanda Leo.

« Parce que le blocage d'IP individuelle est un jeu perdu d'avance. Les attaquants utilisent plusieurs IP dans une plage, les faisant tourner quand l'une est bloquée. Bloquer le /24 rend ça plus difficile — ils devraient passer à un bloc d'adresses différent, ce qui leur coûte du temps et des efforts. »

La règle NACL :

```
Règle 90 :  TOUT depuis 185.220.101.0/24 → DENY
```

La règle 90 est évaluée avant toutes les règles d'autorisation (qui commencent à la règle 100). La plage entière est bloquée avant qu'aucune règle d'autorisation ne soit considérée.

« Et ça s'applique à chaque ressource du sous-réseau ? » demanda Leo.

« Chaque ressource. C'est le but d'un NACL — il s'applique avant que le trafic n'atteigne le groupe de sécurité de chaque ressource individuelle. Un refus NACL à la règle 90 signifie que le paquet n'atteint jamais l'évaluation du groupe de sécurité. »

« Pourrait-on faire ça avec un groupe de sécurité à la place ? »

« Non. Les groupes de sécurité ne peuvent qu'autoriser le trafic. Il n'y a pas de règle de refus. Si vous voulez bloquer une IP spécifique d'atteindre une quelconque ressource d'un sous-réseau, le NACL est la seule option. »

C'est le cas d'usage principal des règles de refus NACL : la réponse d'urgence aux attaques actives. Le groupe de sécurité est le mécanisme de contrôle principal. Le NACL est le frein d'urgence.

---

**Schémas de conception de groupes de sécurité : Référencer par ID**

« A-t-on réfléchi à ce qui se passe quand nos instances EC2 sont remplacées ? » demanda Priya. « Auto Scaling termine les anciennes instances et en lance de nouvelles. Les nouvelles instances obtiennent de nouvelles adresses IP privées. »

« Si les règles de groupe de sécurité référencent des adresses IP », dit Leo lentement, « il faudrait mettre à jour les règles chaque fois qu'une instance est remplacée. »

« Exactement. C'est pourquoi vous ne référencez pas d'adresses IP dans les règles de groupe de sécurité pour le trafic intra-VPC. »

Les groupes de sécurité peuvent référencer d'autres groupes de sécurité au lieu d'adresses IP. Quand une règle dit « autoriser l'entrant depuis le groupe de sécurité de l'équilibreur de charge », ça signifie « autoriser le trafic de n'importe quelle ressource qui a le groupe de sécurité de l'équilibreur de charge attaché ». Auto Scaling peut lancer mille nouvelles instances avec une nouvelle IP chacune, et la règle reste valide.

La structure des groupes de sécurité de Nimbus :

```
nimbus-alb-sg (Équilibreur de charge)
  - Entrant : TCP 443 depuis 0.0.0.0/0
  - Entrant : TCP 80 depuis 0.0.0.0/0

nimbus-api-sg (Instances API EC2)
  - Entrant : TCP 8080 depuis nimbus-alb-sg
  - Entrant : TCP 22 depuis nimbus-bastion-sg
  - Sortant : TCP 5432 vers nimbus-rds-sg
  - Sortant : TCP 6379 vers nimbus-redis-sg

nimbus-rds-sg (RDS)
  - Entrant : TCP 5432 depuis nimbus-api-sg

nimbus-redis-sg (ElastiCache)
  - Entrant : TCP 6379 depuis nimbus-api-sg

nimbus-bastion-sg (Hôte bastion)
  - Entrant : TCP 22 depuis <IP VPN du bureau>
```

Aucune adresse IP pour le trafic interne. Uniquement des ID de groupes de sécurité. Quand une instance est remplacée, l'appartenance au groupe de sécurité se transfère automatiquement à la nouvelle instance.

« Et pour les microservices qu'on planifie ? » demanda Rafael. « On aura une douzaine de services à terme. Chacun doit parler à certains autres, mais pas à tous. »

« Chaque service obtient son propre groupe de sécurité », dit Priya. « Le groupe de sécurité du Service A est référencé dans les règles entrantes de chaque service que le Service A est autorisé à appeler. Les services qui ne devraient pas communiquer ne référencent simplement pas les groupes de sécurité l'un de l'autre. »

C'est le **schéma de groupe de sécurité en étoile** (hub-and-spoke) pour les microservices. Un groupe de sécurité de base de données partagé a des règles entrantes depuis cinq groupes de sécurité de services différents. Si un sixième service a besoin d'un accès à la base de données, vous ajoutez son groupe de sécurité à la règle entrante de la base de données. Si l'accès doit être retiré, vous retirez la référence. Aucune gestion d'IP. Aucune règle périmée pointant vers des serveurs mis hors service.

« Le groupe de sécurité est l'identité », dit Priya. « L'adresse IP est un accident d'ordonnancement. »

---

**Pare-feu de moindre privilège : La discipline**

« A-t-on réfléchi à quelle est la posture correcte pour les règles sortantes ? » demanda Priya pendant la revue post-incident.

La plupart des équipes laissent les règles sortantes de groupe de sécurité EC2 au défaut : autoriser tout le sortant. C'est pratique — l'application peut appeler n'importe quoi — mais ce n'est pas le moindre privilège.

Le principe de Priya : les règles sortantes devraient être aussi spécifiques que les règles entrantes.

Les règles sortantes du groupe de sécurité de l'API Nimbus, après durcissement :

```
TCP 5432 → nimbus-rds-sg       (PostgreSQL vers RDS)
TCP 6379 → nimbus-redis-sg     (Redis vers ElastiCache)
TCP 443  → liste de préfixes s3.amazonaws.com    (endpoint gateway S3)
TCP 443  → endpoint Secrets Manager              (Secrets Manager)
TCP 443  → endpoint logs                         (CloudWatch Logs)
```

Aucun « autoriser tout le sortant ». Chaque destination nommée.

« C'est beaucoup de maintenance », dit Leo.

« C'est plus de maintenance qu'autoriser-tout », reconnut Priya. « C'est moins de nettoyage qu'une fuite de données. L'attaquant qui a compromis l'instance EC2 aurait pu exfiltrer plus de données si les règles sortantes étaient ouvertes. Ils ont utilisé la règle HTTPS-vers-n'importe-où parce qu'elle était là. »

« Et avec des règles sortantes spécifiques, même une instance compromise ne peut envoyer des données que vers des destinations approuvées. »

« Exactement. Le groupe de sécurité devient la dernière ligne de confinement, pas juste la première ligne de défense. »

---

## Forces et limites

**Groupes de sécurité** :

- Avec état (pas de casse-tête de ports éphémères)
- Peuvent référencer d'autres groupes de sécurité (plus flexible que les IP)
- Règles d'autorisation uniquement — pas de refus explicite
- Opèrent au niveau de la ressource — granulaire
- Les règles s'appliquent immédiatement — pas d'ordre, pas de priorité
- Plusieurs groupes de sécurité peuvent être attachés à une ressource — les règles de tous sont combinées

**NACLs** :

- Sans état (nécessite des règles explicites pour les deux directions, y compris les ports éphémères)
- Peuvent refuser explicitement — utile pour bloquer les IP connues comme mauvaises
- Opèrent au niveau du sous-réseau — coup plus large
- Règles numérotées évaluées dans l'ordre — prévisible mais nécessite une gestion soignée
- S'appliquent avant que le trafic n'atteigne une quelconque ressource du sous-réseau — première ligne de défense
- Efficaces pour le blocage d'IP d'urgence à travers un sous-réseau entier

**Où chaque outil convient** :

Utilisez les groupes de sécurité pour tout par défaut. Ajoutez les NACLs quand vous avez besoin de règles de refus explicites — bloquer une plage d'IP, bloquer un port au niveau du sous-réseau quelle que soit la configuration des ressources individuelles, ou imposer qu'un sous-réseau de données ne puisse jamais recevoir de trafic d'une source spécifique. Les NACLs ne sont pas un remplacement pour les groupes de sécurité ; ils sont un supplément pour les situations où la conception autoriser-uniquement des groupes de sécurité est insuffisante.

## Résumé

L'incident de l'IP roumaine avait été contenu par des contrôles de sécurité qui étaient déjà en place — pas par chance, mais par conception. Les groupes de sécurité avaient empêché le mouvement latéral au sein du VPC. Après l'incident, les NACLs ajoutèrent la capacité de bloquer explicitement la plage d'IP de l'attaquant à la frontière du sous-réseau. Les VPC flow logs rendirent l'attaque visible. Deux outils, deux couches, deux tâches différentes — avec de la journalisation pour prouver ce qui s'est passé.

- Les **groupes de sécurité** sont des pare-feux virtuels avec état pour les ressources individuelles. Règles d'autorisation uniquement. Toutes les règles évaluées simultanément.
- Les **NACLs** sont des pare-feux sans état pour des sous-réseaux entiers. Règles d'autorisation et de refus. Règles évaluées dans l'ordre des numéros — première correspondance gagne.
- **Avec état** signifie que le trafic de réponse est automatiquement permis. **Sans état** signifie que vous devez explicitement autoriser le trafic dans les deux directions, y compris les ports de retour éphémères.
- Les groupes de sécurité sont votre couche principale de contrôle d'accès. Les NACLs sont la surcharge au niveau du sous-réseau — surtout pour le blocage d'urgence.
- Quand un NACL autorise le trafic entrant, vous devez aussi autoriser les ports éphémères sortants (1024-65535) pour que la réponse TCP passe.
- **Référencez les groupes de sécurité par ID**, pas par adresse IP, pour le trafic intra-VPC. Auto Scaling remplace les instances ; l'appartenance au groupe de sécurité se transfère automatiquement.
- Des **règles sortantes spécifiques** sur les instances EC2 limitent ce qu'une instance compromise peut faire — pare-feu de moindre privilège.
- Utilisez les flow logs pour voir ce que les groupes de sécurité et les NACLs font réellement. Les règles sont la théorie. Les journaux sont la preuve.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.2)*

- **Avec état vs sans état** : Cette distinction est le concept le plus testé de ce chapitre. Groupes de sécurité = avec état = réponse autorisée automatiquement. NACLs = sans état = doit explicitement autoriser le trafic de réponse.
- **Règles de groupe de sécurité** : Pas de refus explicite. Quand plusieurs groupes de sécurité sont attachés à une instance, l'union de toutes les règles s'applique. Toutes les règles correspondantes sont évaluées simultanément.
- **Ordre des règles NACL** : Les règles sont évaluées du plus petit numéro au plus grand. Règle 100 avant 200. La première correspondance gagne. La règle `*` (astérisque) en bas est le refus implicite. Ajouter une règle de refus à la règle 90 bloque avant toute règle d'autorisation à 100.
- **Ports éphémères** : L'erreur NACL classique est d'oublier d'autoriser le sortant sur les ports 1024-65535. Si votre NACL autorise HTTP entrant (port 80) mais n'autorise pas les ports éphémères sortants, les utilisateurs peuvent envoyer des requêtes mais ne jamais recevoir de réponses. C'est le scénario NACL d'examen le plus courant.
- **Référencement de groupe de sécurité** : Vous pouvez autoriser le trafic depuis un autre groupe de sécurité (pas seulement une IP). C'est le schéma recommandé pour le trafic intra-VPC. L'examen utilise fréquemment « autoriser l'entrant depuis le groupe de sécurité de l'ALB » comme bonne réponse pour restreindre l'accès EC2.
- **NACL par défaut vs NACL personnalisé** : Le NACL par défaut autorise tout le trafic. Un NACL personnalisé (que vous créez) refuse tout le trafic par défaut. Scénario d'examen : « créé un nouveau NACL et maintenant le trafic est bloqué » → vérifier les règles d'autorisation manquantes.
- **Bloquer l'IP d'un attaquant** : Les groupes de sécurité ne peuvent pas bloquer des IP spécifiques (autoriser uniquement). Les NACLs peuvent refuser explicitement une IP ou un CIDR spécifique. Scénario d'examen : « bloquer une IP spécifique d'atteindre une quelconque ressource du sous-réseau » → règle de refus NACL.
- **Déboguer les échecs de connexion** : Vérifiez l'ordre : groupe de sécurité sur la source (sortant) → groupe de sécurité sur la destination (entrant) → NACL sur le sous-réseau source (sortant + ports éphémères) → NACL sur le sous-réseau destination (entrant). La plupart des échecs de connexion à l'examen sont causés par une règle sortante NACL manquante ou une autorisation de port éphémère manquante.
- **Plusieurs sous-réseaux et NACLs** : Un NACL s'applique à tous les sous-réseaux qui lui sont associés. Un sous-réseau ne peut être associé qu'à un seul NACL. L'examen peut demander quel NACL mettre à jour quand le trafic d'un sous-réseau spécifique est affecté.

## Exercices

**Exercice 1 — Mémorisation**

Une développeuse ajoute une règle entrante à un groupe de sécurité autorisant le trafic sur le port 443. A-t-elle aussi besoin d'ajouter une règle sortante pour autoriser la réponse du serveur ? Pourquoi ou pourquoi pas ?

Si à la place elle ajoute une règle entrante à un NACL autorisant le trafic sur le port 443, a-t-elle besoin d'ajouter une règle sortante ? Pourquoi ou pourquoi pas ?

**Indice** : Repensez aux analogies du chapitre — est-ce l'agent de sécurité qui se souvient de vous avoir laissé entrer, ou le détecteur de métaux à travers lequel vous devez repasser à la sortie ?

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise a une application web tournant sur des instances EC2 dans un sous-réseau public. L'application accepte le trafic HTTPS (port 443) depuis internet. Les utilisateurs signalent qu'ils peuvent se connecter à l'application mais ne peuvent pas recevoir de réponses — les requêtes restent en suspens et expirent.

Le groupe de sécurité EC2 a une règle entrante autorisant TCP 443 depuis 0.0.0.0/0. Le NACL du sous-réseau a une règle entrante (règle 100) autorisant TCP 443 depuis 0.0.0.0/0 et une règle sortante (règle 100) autorisant TCP 443 vers 0.0.0.0/0.

Quelle est la cause LA PLUS probable du problème ?

A) Le groupe de sécurité manque une règle sortante pour TCP 443  
B) Les instances EC2 n'ont pas d'adresses IP Elastic  
C) Le groupe de sécurité manque une règle entrante pour les ports éphémères  
D) Le NACL manque une règle sortante autorisant les ports éphémères (1024-65535)

**Indice 1** : Les groupes de sécurité sont avec état — ils autorisent automatiquement les réponses. Les NACLs sont sans état — ils ne le font pas.

**Indice 2** : Quand un navigateur se connecte à un serveur web sur le port 443, la réponse du serveur revient sur un port éphémère aléatoire (1024-65535), pas sur le port 443.

**Indice 3** : Le NACL a une règle sortante pour 443, mais la réponse ne va pas au port 443.

**Réponse** : D

**Explication** : Le NACL est sans état. Quand les utilisateurs se connectent au serveur sur le port 443, la réponse TCP du serveur revient sur un port éphémère (choisi aléatoirement parmi 1024-65535). La règle sortante du NACL n'autorise que le port 443, donc la réponse est bloquée par la règle de refus par défaut. Ajouter une règle sortante NACL autorisant TCP 1024-65535 corrigerait ça.

**Pourquoi pas A ?** Les groupes de sécurité sont avec état — le trafic de réponse est automatiquement permis quelles que soient les règles sortantes. Aucune règle sortante de groupe de sécurité n'est nécessaire.

**Pourquoi pas B ?** Les IP Elastic affectent si les instances ont des IP publiques, pas si les connexions établies peuvent recevoir des réponses.

**Pourquoi pas C ?** Les ports éphémères sont pour le trafic de réponse sortant, pas entrant. La connexion entrante des utilisateurs arrive sur le port 443, qui est déjà autorisé.

*Domaine SAA-C03 : Concevoir des architectures sécurisées — Tâche 1.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Après l'attaque de l'IP roumaine, Priya veut implémenter deux contrôles supplémentaires :

1. Bloquer toute la plage d'IP 185.0.0.0/8 d'atteindre une quelconque ressource du sous-réseau public
2. Garantir que le sous-réseau privé contenant la base de données ne puisse jamais communiquer avec internet, même si quelqu'un mal-configure un groupe de sécurité

Quels outils utiliseriez-vous pour chaque exigence, et comment les configureriez-vous ? Pourriez-vous utiliser des groupes de sécurité pour les deux ? Pourriez-vous utiliser des NACLs pour les deux ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de comprendre quel outil convient à quel problème.)*

## Scène post-générique

L'incident était contenu. La clé de déploiement compromise était désactivée. La plage d'IP roumaine était bloquée au NACL. L'ancien script avait été retiré de l'instance EC2.

Priya écrivit un rapport d'incident. Elle le partagea avec l'équipe.

La dernière ligne du rapport : « Cause racine : un identifiant actif d'un pipeline de déploiement mis hors service n'a jamais été rotaté ni révoqué. Recommandation : rotation automatisée des identifiants et audit régulier de tous les identifiants IAM. »

Leo le lut trois fois.

« J'aurais dû rotater cette clé », dit-il.

« Oui », dit Priya.

« Comment s'assure-t-on que ça ne se reproduise pas ? »

« L'automatisation », dit-elle. « Et quelque chose qui surveille les surveillants. »

Dans le prochain chapitre : le coffre-fort où Nimbus garde ses secrets — et la rotation qui rend les clés volées inutiles.
