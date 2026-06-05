# Chapitre 7 : Le restaurant qui grandit quand il est occupé

Il était 19h43 un vendredi soir quand le taux d'erreur a dépassé 12 %.

Tom l'a remarqué en premier parce que Tom le remarquait toujours en premier. Il avait un onglet ouvert sur le tableau de bord CloudWatch qu'il rafraîchissait comme d'autres personnes consultent les réseaux sociaux — de façon réflexe, constante, sans vraiment le vouloir.

« Leo », dit-il.

Leo regardait déjà. Temps de réponse : en hausse. Requêtes en file d'attente : en hausse. La seule instance EC2 — même la plus grande vers laquelle ils avaient migré le mois dernier — était à 94 % de CPU.

« On perd des clients », dit Tom.

« On ne les perd pas », dit Leo. « Le serveur les perd. »

« C'est la même chose. »

C'était le cas. Et ça arrivait chaque vendredi depuis trois semaines. Nimbus avait survécu à la crise du stockage — la base de données avait son propre disque, les photos vivaient dans S3 — mais stable et évolutif sont des problèmes entièrement différents. Le système fonctionnait. Il ne grandissait juste pas.

L'équipe avait besoin que leur système gère une charge variable automatiquement. Pas d'acheter assez de serveur pour le pire cas et de gaspiller de l'argent pendant les moments calmes. Et pas de se démener manuellement quand les pics de trafic frappaient.

Il existe un schéma pour ça. AWS a deux services qui l'implémentent.

**Le concept : La mise à l'échelle horizontale**

Il y a deux façons de faire en sorte qu'un système gère plus de charge.

**La mise à l'échelle verticale** signifie rendre le serveur unique plus grand. Plus de CPU. Plus de RAM.
Nous avons fait ça au Chapitre 4 quand nous avons migré de `t3.micro` à `t3.large`. Ça aide.
Mais ça a des limites : vous ne pouvez aller que si grand, l'instance doit redémarrer pour se redimensionner,
et vous avez toujours un point de défaillance unique.

**La mise à l'échelle horizontale** signifie ajouter plus de serveurs. Au lieu d'un grand serveur, faites tourner
cinq serveurs moyens. Quand le trafic baisse, faites tourner deux. Quand il monte en flèche, faites tourner dix.

La mise à l'échelle horizontale présente des avantages que la verticale n'a pas :

- Pas de point de défaillance unique. Si un serveur tombe en panne, les autres continuent à servir.
- Pas de redémarrage nécessaire pour ajouter de la capacité.
- Payez uniquement pour ce que vous utilisez — ajoutez des serveurs quand vous en avez besoin, supprimez quand vous n'en avez pas besoin.
- Mise à l'échelle linéaire : deux fois les serveurs, environ deux fois le débit.

Le piège : si vous avez plusieurs serveurs, comment les utilisateurs savent-ils à lequel parler ?

**L'Application Load Balancer : Une porte, beaucoup de salles**

Un **Application Load Balancer** (ALB) est la porte d'entrée de votre application.

Les utilisateurs se connectent à l'équilibreur de charge. L'équilibreur de charge distribue les requêtes entrantes
sur votre flotte d'instances EC2. Chaque utilisateur voit une adresse (l'URL de l'équilibreur de charge).
Derrière cette adresse, les requêtes sont réparties sur autant de serveurs que possible.

Pensez-y comme un grand restaurant avec un pupitre d'accueil à la porte. Les convives arrivent et
l'hôte les dirige vers une table disponible. L'hôte sait quelles tables sont occupées et
lesquelles sont libres. Les convives n'ont pas besoin de savoir combien de tables il y a — ils entrent juste
et l'hôte gère la distribution.

Un ALB fait ça avec des requêtes web. Il reçoit chaque requête HTTP entrante et décide
quelle instance EC2 (appelée **cible**) devrait la gérer, en fonction de facteurs comme :

- Round-robin (chaque serveur prend son tour en rotation)
- Moins de requêtes en cours (le serveur avec le moins de requêtes en vol reçoit la prochaine requête)
- Santé — seules les cibles saines reçoivent du trafic

Les **vérifications de santé** sont essentielles. L'ALB envoie régulièrement des requêtes de test à chaque cible.
Si une cible ne répond pas correctement, l'ALB la marque comme défectueuse et arrête d'envoyer
du trafic vers elle. Quand la cible se rétablit, le trafic reprend.

C'est automatique. Vous configurez les paramètres de vérification de santé ; l'ALB les applique.

**Auto Scaling : Le restaurant qui ouvre plus de tables**

Un ALB distribue le trafic sur vos serveurs existants. Mais il n'ajoute pas de serveurs
quand vous en avez besoin de plus.

**Auto Scaling** fait ça.

Un **Auto Scaling Group** (ASG) est une configuration qui dit à AWS :

- Le nombre minimum d'instances à toujours avoir en fonctionnement
- Le nombre maximum d'instances autorisées
- Les conditions dans lesquelles mettre à l'échelle (ajouter des instances) ou réduire (les supprimer)

Les conditions de mise à l'échelle s'appellent des **politiques**. Le type le plus courant :

**Suivi de cible** : « Gardez l'utilisation moyenne du CPU à 70 %. » Quand le CPU moyen dépasse
70 %, AWS lance de nouvelles instances. Quand il descend en dessous, des instances sont terminées.

C'est automatique. Personne n'a à surveiller les métriques. Personne n'a à lancer manuellement
des serveurs. Le système réagit à la charge en temps réel.

Priya a regardé ça se produire en direct lors d'une heure de pointe du vendredi pour la première fois. Le nombre de serveurs
est passé de 2 à 5 en quinze minutes, puis retour à 2 après le pic.

« Ça », dit-elle, « c'est vraiment impressionnant. »

Tom regardait le graphique des coûts à la place. La facture avait augmenté pendant le pic et baissé
après. « On n'a payé que pour ce qu'on a utilisé », dit-il, également impressionné.

**Comment ALB et ASG travaillent ensemble**

Les deux services sont conçus pour être utilisés ensemble.

Vous mettez l'ALB en avant. L'ALB pointe vers un **groupe cible** — une collection d'
instances qui devraient recevoir du trafic. L'Auto Scaling Group gère ces instances :
il les ajoute au groupe cible lors de la mise à l'échelle, les supprime lors de la réduction.

Le flux :

1. Le trafic arrive à l'ALB
2. L'ALB distribue les requêtes aux cibles saines
3. Le CPU/charge augmente sur ces cibles
4. L'ASG détecte l'augmentation de charge, lance de nouvelles instances
5. Les nouvelles instances passent les vérifications de santé, sont enregistrées avec l'ALB
6. L'ALB commence à envoyer du trafic vers elles
7. La charge diminue, l'ASG termine les instances supplémentaires
8. L'ALB arrête d'envoyer du trafic aux instances terminées

Tout ça sans intervention humaine.

**Modèles de lancement : Le plan pour les nouvelles instances**

Quand l'ASG lance une nouvelle instance, il doit savoir quoi lancer. Cela est défini
dans un **Modèle de lancement** — une AMI, un type d'instance, les groupes de sécurité à appliquer,
et toutes les données utilisateur (scripts de démarrage qui s'exécutent au démarrage de l'instance).

Un schéma courant : vous construisez votre application dans une AMI personnalisée (voir Chapitre 4).
Quand l'ASG a besoin d'une nouvelle instance, il lance cette AMI. La nouvelle instance démarre avec
votre application déjà installée. Pas de configuration manuelle nécessaire.

Pour les environnements plus dynamiques, vous pouvez aussi utiliser des **scripts de données utilisateur** qui tirent et
installent la dernière version de votre code au démarrage. C'est plus flexible mais prend
plus de temps au démarrage.

Le bon choix dépend du temps dont vos instances ont besoin pour démarrer et de la fréquence à laquelle votre
application change.

**Sessions persistantes : Un problème subtil**

Voici quelque chose qui fait trébucher beaucoup d'équipes quand elles implémentent l'équilibrage de charge pour la première fois.

Certaines applications web stockent des données de session — état de connexion, contenu du panier — sur
le serveur lui-même (en mémoire ou sur le disque local). Ça fonctionne bien avec un seul serveur.
Avec plusieurs serveurs, ça casse.

Un utilisateur se connecte. La requête va au Serveur A. Le Serveur A stocke la session. La prochaine
requête va au Serveur B. Le Serveur B n'a pas de session. L'utilisateur semble déconnecté.

Cela peut être résolu de deux façons :

**Sessions persistantes** (ou affinité de session) : Configurer l'ALB pour toujours envoyer les requêtes
du même utilisateur au même serveur. C'est un correctif à court terme. Il nuit à l'équilibrage de charge
(certains serveurs obtiennent plus d'utilisateurs « persistants » que d'autres) et crée des problèmes
quand une instance est terminée.

**Conception d'application sans état** : Stocker les données de session en externe — dans une base de données ou
un cache comme ElastiCache (Chapitre 10). Chaque serveur peut reconstruire la session de n'importe quel utilisateur
depuis le magasin externe. Les serveurs deviennent interchangeables. C'est la bonne approche
pour les applications évolutives horizontalement.

Priya a appelé ça « la décision architecturale la plus importante que vous prenez quand vous passez
multi-serveur ». Elle a raison. Nous la rencontrons à nouveau au Chapitre 10.

**Types d'équilibreurs de charge**

AWS offre trois types d'équilibreurs de charge, chacun adapté à différents trafics :

**Application Load Balancer (ALB)** : Trafic HTTP et HTTPS. Couche 7 (comprend
HTTP). Peut router en fonction du chemin URL (`/api` vers un groupe, `/static` vers un autre),
des en-têtes de nom d'hôte et des paramètres de requête. C'est ce que la plupart des applications web utilisent.

**Network Load Balancer (NLB)** : Trafic TCP, UDP et TLS. Couche 4 (ne
comprend pas HTTP). Performances extrêmement élevées, millions de requêtes par seconde, très
faible latence. Utilisez quand vous avez besoin de vitesse brute ou quand vous ne traitez pas HTTP.

**Gateway Load Balancer (GWLB)** : Pour router le trafic via des appliances réseau virtuelles
tierces (pare-feux, détection d'intrusion). Vous en aurez rarement besoin au niveau junior.

Pour Nimbus (et pour la plupart des applications web), ALB est le bon choix.

## Forces et limites

**Pourquoi ALB + Auto Scaling est puissant** :

- Mise à l'échelle sans temps d'arrêt (les instances sont ajoutées/supprimées sans perturber les connexions existantes)
- Basculement automatique (les instances défectueuses sont automatiquement supprimées du trafic)
- Efficacité des coûts (payez uniquement pour les instances en cours d'exécution)
- Pas de point de défaillance unique — plusieurs instances dans plusieurs AZ

**Là où ça se complique** :

- Les applications avec état nécessitent une gestion spéciale (sessions persistantes ou état externe)
- La mise à l'échelle prend du temps — si le trafic monte en flèche instantanément, il y a un délai avant que les nouvelles
  instances soient prêtes. Vous pouvez atténuer ça avec une **mise à l'échelle planifiée** (pré-mise à l'échelle
  avant des événements connus) ou un nombre minimum d'instances plus élevé
- Plus de composants signifie plus à surveiller et à déboguer
- Certaines applications ne peuvent pas être facilement mises à l'échelle horizontalement (bases de données, certains systèmes
  legacy). La mise à l'échelle horizontale fonctionne mieux pour les couches sans état.

## Résumé

- **La mise à l'échelle horizontale** (ajouter plus de serveurs) est préférable à la mise à l'échelle verticale
  (rendre un serveur plus grand) parce qu'elle élimine les points de défaillance uniques et
  permet un coût élastique.
- Un **Application Load Balancer (ALB)** distribue le trafic HTTP/HTTPS entrant
  sur plusieurs cibles EC2. Il effectue des vérifications de santé et ne route que vers les instances saines.
- Un **Auto Scaling Group (ASG)** ajuste automatiquement le nombre d'instances EC2
  en fonction des politiques de mise à l'échelle définies (ex. utilisation CPU cible).
- ALB et ASG fonctionnent ensemble : l'ASG gère la flotte, l'ALB distribue le trafic dessus.
- Les applications avec état doivent utiliser des sessions persistantes (correctif à court terme) ou
  externaliser l'état (bonne conception à long terme).
- Pour le trafic HTTP, utilisez ALB. Pour les performances TCP/UDP brutes, utilisez NLB.

## Conseils pour l'examen

*Domaine SAA-C03 2 — Tâche 2.1 (architectures évolutives) / Domaine 3 — Tâche 3.2*

- **Les vérifications de santé ASG peuvent venir d'EC2 ou de l'ALB.** Les vérifications de santé EC2 ne détectent que
  si l'instance est en cours d'exécution. Les vérifications de santé ALB détectent si l'application
  répond correctement. Les vérifications de santé ALB sont plus approfondies et devraient être préférées
  pour les applications web.
- **La mise à l'échelle par suivi de cible est la réponse d'examen la plus courante** pour les politiques de mise à l'échelle.
  La mise à l'échelle simple (ajouter N instances quand l'alarme se déclenche) est plus ancienne et moins adaptative.
- **La mise à l'échelle est rapide ; la réduction est lente.** AWS termine les instances progressivement lors de
  la réduction pour éviter de perturber les connexions actives — un comportement contrôlé par le paramètre de **délai de désenregistrement** de l'ALB.
- **Le nombre minimum d'instances est votre plancher de résilience.** Si vous définissez minimum = 1
  et que cette instance tombe en panne, votre application est en panne avant que l'ASG puisse réagir. Définissez
  minimum ≥ 2 et répartissez sur des AZ pour une vraie résilience.
- **L'ALB peut distribuer le trafic sur les AZ automatiquement.** Avec l'équilibrage de charge inter-zones
  activé, chaque nœud ALB distribue les requêtes uniformément sur toutes les cibles enregistrées
  indépendamment de l'AZ. C'est important pour une charge équilibrée quand les comptes d'instances AZ diffèrent.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre un Application Load Balancer et
un Auto Scaling Group ? Quel problème chacun résout-il, et pourquoi les utilisez-vous typiquement ensemble ?

*(Indice : L'un distribue le trafic qui existe déjà ; l'autre ajuste la quantité de
capacité que vous avez.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Le site web d'e-commerce d'une entreprise de vente au détail connaît un trafic très variable :
faible trafic en semaine, énormes pics le week-end et lors d'événements de vente flash.
Ils veulent que leur application gère les charges de pointe sans maintenir une capacité inutilisée
pendant les périodes calmes. L'application stocke actuellement les données de session dans la mémoire du serveur.

Quel changement d'architecture répondrait LE MIEUX à leurs exigences d'évolutivité ?

A) Migrer vers une seule très grande instance EC2 qui peut gérer le trafic de pointe
B) Déployer plusieurs instances EC2 derrière un ALB avec un Auto Scaling Group, et
   externaliser le stockage de session vers ElastiCache
C) Déployer plusieurs instances EC2 derrière un ALB avec des sessions persistantes activées
D) Ajouter manuellement des instances EC2 avant chaque pic de trafic attendu et les terminer
   ensuite

**Indice 1** : « Sans maintenir une capacité inutilisée » signifie que vous avez besoin d'une mise à l'échelle automatique,
pas d'une grande instance fixe ou d'une gestion manuelle.

**Indice 2** : Le stockage de session dans la mémoire du serveur est un problème pour les déploiements multi-instances.
Quelles options traitent de ça ?

**Indice 3** : L'option C utilise des sessions persistantes — c'est une solution de contournement, pas un correctif.
Quelle option traite à la fois de la mise à l'échelle et du problème de stockage de session correctement ?

**Réponse** : B

**Explication** : Un ALB avec un Auto Scaling Group fournit une mise à l'échelle automatique et élastique —
les instances sont ajoutées pendant les pics et supprimées pendant les périodes calmes. Déplacer le
stockage de session vers ElastiCache (un cache externe) rend l'application sans état : n'importe quelle
instance peut gérer la requête de n'importe quel utilisateur, et l'ALB peut distribuer librement le trafic.
C'est la solution architecturalement correcte.

**Pourquoi pas A ?** Une seule grande instance, si grande soit-elle, est toujours un point de
défaillance unique. Elle gaspille aussi de l'argent pendant les périodes calmes quand la majeure partie de sa capacité est inactive.

**Pourquoi pas C ?** Les sessions persistantes acheminent un utilisateur vers la même instance, ce qui atténue partiellement
le problème de session mais nuit à l'équilibrage de charge. Si cette instance
est terminée (lors de la réduction ou d'une panne), l'utilisateur perd quand même sa session.

**Pourquoi pas D ?** La mise à l'échelle manuelle nécessite que quelqu'un prédise correctement les pics de trafic
et agisse à l'avance. C'est lent, sujette aux erreurs et fastidieux. Auto Scaling gère
ça automatiquement.

*Domaine SAA-C03 2 — Tâche 2.1 / Domaine 3 — Tâche 3.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus a une grande promotion à venir : une réduction de 50 % sur toutes les commandes pendant 4 heures
le samedi prochain. L'année dernière, une promotion similaire a causé un trafic 10x normal. L'équipe
prévoit que le pic sera soudain et durera exactement 4 heures.

Auto Scaling finira par réagir, mais il y a un délai. Comment concevriez-vous pour ce
pic connu ? Quelle est la différence entre la mise à l'échelle réactive et proactive, et quand
chacune est-elle pertinente ?

*(Il n'y a pas de réponse unique correcte. Pensez aux actions de mise à l'échelle planifiées,
au préchauffage, et aux implications de coût de chaque approche.)*

## Scène post-générique

Le premier vendredi après le déploiement d'Auto Scaling et de l'ALB, l'équipe a regardé
les métriques ensemble.

19h15 : deux instances en cours d'exécution. Charge normale.
19h45 : la charge augmente. Auto Scaling lance deux autres instances.
20h00 : quatre instances gérant le pic. Temps de réponse stables.
21h30 : la charge baisse. Auto Scaling termine deux instances.
21h45 : retour à deux instances.

Le site n'est jamais tombé en panne. Pas une seule fois.

Leo a rafraîchi la page des métriques trois fois, comme s'il s'attendait à trouver une panne qu'il avait manquée.

« C'est bizarre que je sois légèrement déçu que rien n'ait cassé ? » dit-il.

« Oui », dit Priya.

Tom regardait la facture. Le coût avait suivi le trafic presque parfaitement. « On a payé exactement ce qu'on a utilisé », dit-il. « Pas plus. Pas moins. »

Il avait l'air vraiment surpris.

Le lendemain matin, Maya trouva un nouveau problème dans les logs d'erreur. Pas une panne — pire.

« Notre base de données », dit-elle, « retourne des temps de requête de huit secondes en moyenne. »

Huit secondes. Pour une application de commande de restaurant.

« Chaque fois que quelqu'un charge le menu, on interroge chaque élément de la base de données pour
construire la page », dit Leo. « Et on a quarante-sept restaurants maintenant. »

« Combien d'éléments de menu au total ? » demanda Tom.

Leo exécuta la requête.

« Environ vingt-deux mille. »

Silence.

Dans le prochain chapitre : la base de données qui ne nécessite pas d'administrateur de base de données — juste une carte de crédit.
