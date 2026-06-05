# Chapitre 4 : Un ordinateur dans le bâtiment de quelqu'un d'autre

L'application Nimbus tournait sur l'ordinateur portable de Tom.

C'était bien pour montrer une démo aux investisseurs. Ce n'était pas bien quand Maya appuya sur
« lancer » et que 200 restaurants s'inscrivirent la première semaine. L'ordinateur portable de Tom gérait
désormais de vraies commandes, de vrais menus et de vrais clients — posé sous le bureau de Tom, connecté
au Wi-Fi du bureau, branché sur une multiprise qui alimentait aussi un radiateur et une
machine à café.

« Il nous faut un serveur », dit Maya. « Un vrai. Qui tourne quelque part qui n'est pas sous votre bureau. »

Tom regarda son ordinateur. Le ventilateur était audible depuis l'autre côté de la pièce.

C'est alors qu'ils ont commencé à s'intéresser à ce que ça veut vraiment dire de louer un ordinateur.

**L'abstraction que personne n'explique**

Quand les gens disent que leur application « tourne dans le cloud », ils veulent habituellement dire
qu'elle tourne sur une machine virtuelle — un ordinateur qui n'existe pas physiquement en tant que
matériel dédié, mais qui se comporte à tous égards comme si c'était le cas.

Voici le mécanisme.

Un serveur physique dans un centre de données AWS possède beaucoup de ressources : des cœurs CPU, de la mémoire,
du disque, et de la bande passante réseau. AWS prend ce serveur physique et le divise à l'aide d'un logiciel
appelé **hyperviseur**. L'hyperviseur crée plusieurs machines virtuelles, chacune
semblant avoir son propre CPU, mémoire et disque dédiés — mais partageant en réalité le
matériel physique sous-jacent.

Chacune de ces machines virtuelles est ce qu'AWS appelle une **instance EC2**.

EC2 signifie Elastic Compute Cloud. La partie « élastique » est importante, et nous y viendrons.
Pour l'instant : une instance EC2 est un ordinateur que vous louez à l'heure. Elle a un système
d'exploitation, une connexion réseau et de la puissance de calcul. Elle fait tourner votre application
comme le ferait un serveur physique.

L'analogie : louer un appartement dans un grand immeuble plutôt qu'acheter une maison.

Le propriétaire de l'immeuble (AWS) maintient la structure physique, la plomberie, l'électricité,
la sécurité. Vous obtenez une unité. Vous la meublez comme vous voulez. Vous payez mensuellement (ou
à l'heure). Quand vous avez besoin de plus d'espace, vous déménagez dans une unité plus grande. Quand vous
partez, vous arrêtez de payer.

**Choisir votre instance : la taille importe**

Toutes les instances EC2 ne sont pas identiques. AWS propose des centaines de types d'instances, organisés
en familles selon ce pour quoi elles sont optimisées.

**Usage général** (ex. `t3`, `m6i`) : Équilibre entre CPU et mémoire. Bon choix par défaut
pour la plupart des applications web.

**Optimisé pour le calcul** (ex. `c7g`) : Plus de CPU par rapport à la mémoire. Bon pour l'encodage vidéo,
la modélisation scientifique, le traitement par lots.

**Optimisé pour la mémoire** (ex. `r7i`) : Plus de mémoire par rapport au CPU. Bon pour les bases de données,
la mise en cache, l'analytique en mémoire.

**Optimisé pour le stockage** (ex. `i3`) : Stockage local haute vitesse. Bon pour les charges de travail
intensives en données qui nécessitent un I/O disque très rapide.

**Calcul accéléré** (ex. `p4`) : GPU attaché. Bon pour l'entraînement d'apprentissage automatique
et le rendu graphique.

Chaque famille a des tailles. Un `t3.micro` a 2 CPU virtuels et 1 Go de mémoire. Un
`t3.xlarge` a 4 CPU virtuels et 16 Go. Vous choisissez la bonne taille pour la charge de travail.

Leo avait choisi un `t3.micro`.

« Combien d'utilisateurs un `t3.micro` peut-il gérer ? » demanda Tom.

« Ça dépend de l'application », dit Leo. « Mais probablement pas cent utilisateurs simultanés
faisant des téléchargements d'images et des requêtes de base de données. »

Tom écrivit « t3.micro » sur le tableau blanc et dessina une tête triste à côté.

**L'AMI : L'état initial de votre machine**

Avant de lancer une instance EC2, vous choisissez son système d'exploitation et sa configuration initiale.
Dans AWS, cela s'appelle une **Amazon Machine Image** (AMI).

Une AMI est un modèle. Elle définit :

- Le système d'exploitation (Amazon Linux, Ubuntu, Windows Server, etc.)
- Les logiciels pré-installés
- L'état initial du disque

Quand vous lancez une instance depuis une AMI, AWS crée une copie fraîche de ce modèle
juste pour vous. Vous pouvez aussi créer vos propres AMI — si vous configurez un serveur exactement
comme vous le voulez, vous pouvez « sauvegarder » cet état comme une AMI personnalisée et l'utiliser pour lancer
des serveurs identiques rapidement. C'est ainsi que vous déployez des environnements cohérents à grande échelle.

Pensez à une AMI comme à une recette. La recette décrit le repas. Chaque fois que vous suivez la
recette, vous obtenez le même repas. Si vous voulez changer le repas de façon permanente, vous mettez à jour
la recette.

**Paires de clés : La bonne façon d'accéder à un serveur**

Vous vous souvenez du désastre « Admin123 » du chapitre précédent ?

La bonne façon de se connecter à une instance EC2 est avec une **paire de clés**.

Une paire de clés est une paire cryptographique : une clé publique (stockée par AWS sur le serveur) et une
clé privée (un fichier que vous téléchargez et gardez secret). Pour se connecter, vous utilisez SSH — un protocole
sécurisé — avec votre clé privée. Pas de mot de passe. Si vous perdez la clé privée,
vous perdez l'accès. Il n'y a pas de « mot de passe oublié » pour SSH.

Ça importe parce que les paires de clés sont :

- Uniques pour vous
- Cryptographiquement impossibles à deviner
- Non stockées par AWS (vous gardez la clé privée)
- Faciles à révoquer (supprimez la clé du serveur, générez une nouvelle paire)

Priya avait déjà configuré l'accès par clé sur le serveur Nimbus. Le serveur Admin123
a été mis hors service. Personne n'en était triste.

**Cycle de vie des instances : Pas pour toujours**

C'est quelque chose que beaucoup de débutants ratent.

Les instances EC2 ne sont pas permanentes par défaut. Quand vous arrêtez une instance, la ressource
de calcul est libérée. Quand vous la redémarrez, elle pourrait tourner sur un matériel physique différent.
Toutes les données stockées *sur l'instance elle-même* (sur son volume racine) survivent
à un cycle arrêt/démarrage — mais l'adresse IP publique change.

Quand vous *terminez* une instance, elle disparaît. À moins d'avoir un stockage séparé attaché
(que nous couvrons au Chapitre 6), toutes les données sur l'instance disparaissent.

Cette « éphémérité » est en réalité une fonctionnalité, pas un défaut. Elle signifie que vous pouvez lancer
des serveurs, les utiliser, et les jeter. Elle permet la mise à l'échelle horizontale. Mais ça signifie
aussi que vous ne devriez jamais stocker de données importantes *sur* l'instance EC2 elle-même.

Où vivent alors les données ?

Dans un stockage séparé. Nous y arrivons dans les deux prochains chapitres.

**Ce que signifie « Élastique »**

Nous avons dit qu'EC2 signifie Elastic Compute Cloud. Qu'est-ce qui est élastique là-dedans ?

Deux choses :

**Élasticité verticale** : Vous pouvez changer la taille d'une instance. Arrêtez l'instance,
passez de `t3.micro` à `t3.xlarge`, redémarrez. Plus de CPU et de mémoire, même
application, même configuration.

**Élasticité horizontale** : Vous pouvez ajouter plus d'instances. Au lieu d'un grand serveur,
faites tourner dix serveurs moyens derrière un équilibreur de charge. Quand le trafic baisse, supprimez des instances
et arrêtez de les payer.

Les deux approches résolvent le problème « un seul serveur, trop de trafic ». Elles ont des
compromis différents, que nous explorons au Chapitre 7 quand nous ajoutons Auto Scaling à l'histoire.

L'insight clé : avec EC2, la puissance de calcul est quelque chose que vous *modulez* plutôt que quelque chose que vous
*achetez*. Besoin de plus ? Tournez le bouton vers le haut. Besoin de moins ? Tournez-le vers le bas. Payez en conséquence.

## Forces et limites

**Pourquoi EC2 est puissant** :

- Contrôle total. Vous choisissez le système d'exploitation, les logiciels, la configuration. C'est votre ordinateur.
- Dimensionnement flexible. Des centaines de types d'instances pour chaque cas d'utilisation.
- Pas de matériel à gérer. AWS gère la couche physique.
- Facturation à la seconde (pour la plupart des types d'instances). Vous arrêtez l'instance, vous arrêtez de payer.
- Fonctionne avec tout. EC2 est la fondation sur laquelle la plupart des autres services AWS sont construits.

**Là où ça se complique** :

- Vous êtes responsable du patch et de la mise à jour du système d'exploitation. (Modèle de responsabilité
  partagée — c'est la partie « dans le cloud » qui vous appartient.)
- Gérer EC2 à grande échelle signifie gérer l'état des instances, les AMI, les correctifs de sécurité et
  le cycle de vie à travers potentiellement des milliers de machines. C'est une charge opérationnelle.
- EC2 n'est pas la bonne réponse à tout. Pour du code piloté par événements qui s'exécute
  rarement, Lambda (Chapitre 20) est moins cher et plus simple. Pour les charges de travail conteneurisées,
  ECS et EKS (Chapitre 21) offrent une meilleure efficacité des ressources.
- Les instances inutilisées coûtent toujours de l'argent. Si vous arrêtez une instance, vous arrêtez de payer
  pour le calcul — mais si vous avez du stockage attaché, vous payez toujours pour ça.

## Résumé

- Une **instance EC2** est une machine virtuelle que vous louez dans AWS. Elle a un système d'exploitation,
  un accès réseau et des ressources de calcul.
- Les types d'instances sont organisés par cas d'utilisation : usage général, optimisé pour le calcul,
  optimisé pour la mémoire, optimisé pour le stockage, calcul accéléré. Choisissez la bonne famille
  et taille pour votre charge de travail.
- Une **AMI** (Amazon Machine Image) est le modèle pour le système d'exploitation et la configuration initiale
  de votre instance. Les AMI personnalisées permettent des déploiements cohérents et reproductibles.
- Les **paires de clés** sont la façon sécurisée d'accéder aux instances EC2. Pas de mots de passe.
- Les instances EC2 ne sont pas permanentes par défaut. Les instances terminées perdent leurs données.
  Stockez les données importantes dans des services de stockage séparés.
- « Élastique » signifie que vous pouvez faire évoluer le calcul à la hausse et à la baisse — à la fois
  verticalement (instances plus grandes) et horizontalement (plus d'instances).

## Conseils pour l'examen

*Domaine SAA-C03 3 — Tâche 3.2 (solutions de calcul performantes)*

- **Responsabilité partagée pour EC2** : Vous êtes responsable du patch du système d'exploitation.
  AWS maintient le matériel physique et l'hyperviseur. C'est une distinction fréquemment testée.
- **Les familles d'instances comptent pour les questions de scénario.** Si un scénario mentionne des
  exigences de mémoire élevée (cache en mémoire, SAP HANA), la réponse implique probablement une
  instance optimisée pour la mémoire. Si elle mentionne le traitement par lots ou HPC, optimisé pour le calcul.
- **Arrêter ≠ Terminer.** Arrêter une instance la préserve (vous pouvez la redémarrer).
  La terminer la supprime. Les scénarios d'examen testent si vous connaissez cette distinction.
- **L'IP publique change au redémarrage.** Si votre application a besoin d'une adresse IP stable,
  utilisez une **IP élastique** — une IP publique statique qui reste associée à votre compte.
  Cela coûte de l'argent si vous en allouez une et ne l'utilisez pas.
- Les modèles de tarification **À la demande, Réservé et Spot** sont largement testés dans le Domaine 4.
  Nous les couvrons au Chapitre 27. Pour l'instant, sachez qu'À la demande signifie payer à la seconde
  sans engagement.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce qu'une instance EC2 ? Qu'est-ce qu'une AMI ? Quelle est la relation
entre les deux ?

*(Indice : Pensez à l'analogie de la recette — qu'est-ce qui est la recette, et qu'est-ce qui est le repas ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise déploie une application web à fort trafic. L'application
gère des recherches dans un catalogue de produits avec une logique de filtrage complexe qui est intensive en CPU.
L'équipe prévoit des pics de trafic significatifs lors des événements de vente. Elle veut s'assurer
de choisir le bon type d'instance EC2 et d'être prête pour les pics de trafic.

Quelle combinaison de choix correspond LE MIEUX à leurs exigences ?

A) Des instances optimisées pour la mémoire avec un nombre fixe pour assurer des performances cohérentes  
B) Des instances optimisées pour le calcul avec Auto Scaling pour gérer les pics de trafic  
C) Des instances d'usage général avec une seule grande taille d'instance  
D) Des instances optimisées pour le stockage parce que le catalogue de produits nécessite un accès disque rapide

**Indice 1** : La charge de travail est décrite comme « intensive en CPU ». Quelle famille d'instances est
optimisée pour le CPU ?

**Indice 2** : Le scénario mentionne « des pics de trafic lors d'événements de vente ». Un nombre fixe
d'instances ne gérera pas efficacement un trafic variable. Quelle fonctionnalité AWS gère ça ?

**Indice 3** : Les instances optimisées pour le calcul gèrent le travail intensif en CPU. Auto Scaling ajoute
et supprime des instances en fonction de la demande. Ensemble, ils répondent aux deux exigences.

**Réponse** : B

**Explication** : Les instances optimisées pour le calcul (comme la famille `c`) fournissent plus de CPU
par euro pour les charges de travail intensives en CPU. Auto Scaling ajuste automatiquement le nombre
d'instances en fonction de la charge — ajoutant des instances lors des événements de vente, les supprimant quand
le trafic revient à la normale. Cette combinaison optimise à la fois les performances et les coûts.

**Pourquoi pas A ?** Les instances optimisées pour la mémoire sont conçues pour les charges de travail qui nécessitent de grandes
quantités de RAM (bases de données, caches en mémoire). C'est une charge de travail liée au CPU. Et un nombre fixe
d'instances signifie soit une surprovisionnement (gaspillage) soit une sous-provisionnement (échec).

**Pourquoi pas C ?** Les instances d'usage général sacrifient une certaine efficacité CPU pour l'équilibre. Pour
une charge de travail connue intensive en CPU, l'optimisé pour le calcul est plus approprié. Et une seule
grande instance est un point de défaillance unique.

**Pourquoi pas D ?** Le goulot d'étranglement est le CPU, pas l'I/O disque. Les instances optimisées pour le stockage
sont conçues pour les charges de travail qui nécessitent un débit très élevé vers le stockage local.

*Domaine SAA-C03 3 — Tâche 3.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus fait actuellement tourner une seule instance EC2 `t3.micro` pour toute l'application.
L'équipe doit décider : passer à une instance plus grande (`t3.2xlarge`) ou ajouter plus
d'instances `t3.micro` derrière un équilibreur de charge ?

Analysez les compromis. Quels sont les avantages de chaque approche ? Quelles
questions poseriez-vous pour décider ? (Indice : pensez aux points de défaillance uniques,
aux coûts, à la complexité du déploiement et à ce qui se passe pendant la maintenance.)

*(Il n'y a pas de réponse unique correcte. Il s'agit de raisonner sur la mise à l'échelle verticale vs horizontale.)*

## Scène post-générique

Leo a passé l'après-midi à redimensionner le serveur. Il est passé d'un `t3.micro` à un `t3.large`.
Le CPU est tombé à 30 %. Les pages se chargeaient en moins d'une seconde.

Tom regardait la facture AWS se mettre à jour en temps réel. La nouvelle instance coûtait quatre fois plus
par heure. Il a pris note.

Maya regardait quelque chose d'autre sur son écran.

« Leo », dit-elle. « Pendant que tu redimensionnais l'instance, le site web était en panne pendant
douze minutes. »

Leo leva les yeux.

« On avait une file de deux cents commandes non satisfaites. »

Il regarda l'écran. Puis le plafond. Puis de nouveau l'écran.

« Il nous faut quelque chose pour nos images », dit-il, changeant légèrement de sujet. « En ce moment,
les photos de menus téléchargées sont sauvegardées directement sur le serveur. Si on redimensionne ou
redémarre l'instance, on les perd ? »

Priya connaissait déjà la réponse.

Dans le prochain chapitre : où vivent les fichiers quand il n'y a pas de disque dur à pointer.
