# Chapitre 6 : Le disque qui vous suit partout

Tom avait un stylo rouge et une habitude qui rendait Leo nerveux.

Chaque samedi matin, Tom imprimait le résumé de la console AWS — instances en cours d'exécution, volumes de stockage, disques attachés — et le passait ligne par ligne. Il faisait ça depuis la deuxième semaine. Il appelait ça « le grand livre ». Leo appelait ça « la chose que Tom fait et qui donne à Leo l'impression d'avoir fait quelque chose de mal ».

Ce samedi, Tom avait cerclé quelque chose et laissé l'imprimé sur le bureau de Maya sans un mot.

Elle le trouva le lundi matin. Un cercle. Une note dans la marge, trois mots :

*Tout. Une seule machine.*

Le serveur web. La base de données. Tous les enregistrements clients. Deux mois d'historique de commandes. Tout ça tournant sur une seule instance EC2.

« Que se passe-t-il avec la base de données si l'instance plante ? » demanda Maya, l'imprimé à la main.

« Elle plante aussi », dit Leo.

« Et les données ? »

« Ça dépend de comment la base de données les stocke. »

Ce « ça dépend » était le problème.

**Comment les instances EC2 stockent les données**

Quand une instance EC2 tourne, son système d'exploitation vit quelque part sur un disque. Ce disque
est appelé le **volume racine**. Par défaut, c'est un **volume EBS** — même quand vous
n'y pensez pas.

Mais il y a autre chose : les instances EC2 ont aussi du stockage en **instance store**.

Le stockage en instance store est du stockage temporaire physiquement attaché au matériel sous-jacent qui
fait tourner votre machine virtuelle. Il est extrêmement rapide — plus rapide que presque toute autre option de
stockage dans AWS. Mais il est soumis à une contrainte.

Le stockage en instance store est **éphémère**.

Quand l'instance est arrêtée ou terminée, les données de l'instance store disparaissent. De façon permanente.
Irrécupérable. AWS ne vous avertit pas très bruyamment à ce sujet, c'est ainsi que les équipes
le découvrent : en perdant des données.

L'instance store est approprié pour les caches, les fichiers de traitement temporaires et l'espace de travail.
Jamais pour des données dont vous vous souciez.

**EBS : Le disque persistant**

**Amazon EBS** — Elastic Block Store — est du stockage par blocs persistant pour les instances EC2.

Le stockage par blocs signifie qu'il se comporte comme un vrai disque dur : votre système d'exploitation peut créer
des systèmes de fichiers dessus, lire et écrire des octets arbitraires à des positions arbitraires, faire tourner des bases de données
dessus, et le traiter exactement comme un disque attaché.

Les propriétés clés :

**Persistant.** Contrairement à l'instance store, les volumes EBS survivent aux arrêts, démarrages et même
aux terminations d'instance (selon la configuration). Les données restent sur le volume
même quand aucune instance ne l'utilise.

**Attachable et détachable.** Un volume EBS peut être détaché d'une instance et
attaché à une autre. Si vous devez migrer des données ou récupérer depuis une instance défaillante,
vous pouvez détacher le volume et le réattacher ailleurs.

**Attachement unique (principalement).** Par défaut, un volume EBS est attaché à exactement une
instance EC2 à la fois. Une seule instance peut avoir plusieurs volumes EBS, mais un seul
volume EBS ne peut pas être monté par plusieurs instances simultanément (avec une exception :
EBS Multi-Attach, qui a des cas d'utilisation limités et des restrictions importantes).

L'analogie : EBS est un disque dur externe que vous branchez sur un ordinateur portable. L'ordinateur
(instance EC2) peut lire et écrire dessus. Quand vous avez terminé, vous pouvez le débrancher et
le brancher sur un autre ordinateur.

**Types de volumes EBS**

Tous les volumes EBS ne sont pas identiques. AWS propose plusieurs types avec différentes performances
et profils de coût.

**gp3 (SSD d'usage général)** : Le choix par défaut pour la plupart des charges de travail. Bon équilibre de
performance et de prix. Adapté aux volumes de démarrage, petites bases de données et environnements de développement.

**io2 (SSD IOPS provisionné)** : Option haute performance pour les charges de travail intensives en I/O.
Vous spécifiez combien d'opérations d'I/O par seconde (IOPS) vous avez besoin, et AWS garantit
cette performance. Approprié pour les grandes bases de données de production.

**st1 (HDD optimisé pour le débit)** : Stockage magnétique optimisé pour les grandes lectures et écritures
séquentielles. Moins cher que le SSD, mais plus lent pour l'I/O aléatoire. Bon pour l'entreposage
de données et le traitement de logs.

**sc1 (HDD froid)** : L'option EBS la moins chère. Pour les données accédées rarement. Pas
approprié pour tout ce qui est sensible au temps.

L'examen ne vous demande pas de mémoriser tous les types. Il teste votre capacité à
faire correspondre les exigences au bon type : exigences IOPS → io2. Charges de travail séquentielles
sensibles aux coûts → st1. Applications web générales → gp3.

**Snapshots EBS : La sauvegarde**

Voici quelque chose qui sauve régulièrement des entreprises.

Un **snapshot EBS** est une sauvegarde à un instant donné d'un volume EBS, stockée dans S3 (bien que
vous y accédiez via l'interface EBS, pas directement via S3). Les snapshots sont
incrémentiels : le premier snapshot capture le volume complet ; les snapshots suivants stockent uniquement
ce qui a changé depuis le dernier.

Vous pouvez créer un nouveau volume EBS depuis un snapshot — en restaurant à un point dans le temps avant
une corruption de base de données, un mauvais déploiement ou une suppression accidentelle.

Vous devriez automatiser les snapshots. AWS fournit **Amazon Data Lifecycle Manager** à cette
fin : définissez une politique (prenez un snapshot toutes les 6 heures, gardez les 7 derniers jours), et
il s'exécute automatiquement.

Priya avait configuré ça avant même que la base de données passe en production.

Leo n'y avait pas pensé.

**EFS : Le classeur partagé**

EBS est un disque attaché à une instance. Et si plusieurs instances doivent accéder aux
mêmes fichiers simultanément ?

Entrez **Amazon EFS** — Elastic File System.

EFS est un système de fichiers réseau géré. Plusieurs instances EC2 peuvent monter le même système de fichiers EFS
en même temps et lire/écrire dans des fichiers partagés. C'est la capacité clé
qu'EBS ne fournit pas.

Pensez-y de cette façon :

EBS est un disque dur externe branché sur un seul ordinateur. Seul cet ordinateur peut l'utiliser à
la fois.

EFS est un classeur au centre d'un bureau. N'importe quel membre de l'équipe peut s'approcher, ouvrir
un tiroir, lire un fichier, remettre quelque chose. Plusieurs personnes, simultanément, accédant
au même stockage.

**Quand avez-vous besoin d'EFS ?**

- Quand plusieurs instances EC2 doivent partager des fichiers — systèmes de gestion de contenu, fichiers de
  configuration partagés, bibliothèques de médias partagés
- Quand vous avez une application mise à l'échelle horizontalement où toutes les instances doivent accéder
  aux mêmes données
- Quand vous avez besoin d'un système de fichiers persistant qui survit aux pannes d'instance

**EFS vs S3 :** EFS est un système de fichiers (dossiers, fichiers, permissions, verrouillage). S3 est du
stockage d'objets (télécharger, télécharger, pas de sémantique de système de fichiers). EFS est beaucoup plus cher
que S3. Utilisez S3 pour les fichiers qui sont stockés et récupérés entiers. Utilisez EFS pour les fichiers
que les applications lisent et écrivent activement via des opérations standard de système de fichiers.

**Choisir le bon stockage**

Maintenant vous avez vu trois types de stockage dans AWS. Rendons la décision claire.

| Besoin                                          | Type de stockage     |
|-------------------------------------------------|----------------------|
| La base de données a besoin d'un disque rapide persistant | EBS (gp3 ou io2) |
| Plusieurs serveurs ont besoin de fichiers partagés | EFS              |
| Fichiers, sauvegardes, images, grands objets    | S3                   |
| Espace de travail temporaire de calcul          | Instance Store       |
| Archives à long terme au coût minimum           | S3 Glacier           |

Prendre cette décision correctement est important. Utiliser S3 là où vous avez besoin d'EFS ajoute de la
complexité opérationnelle. Utiliser EBS là où vous avez besoin d'EFS cause des pannes quand vous évoluez.
Utiliser l'instance store là où vous avez besoin de persistance perd des données.

Priya a imprimé ce tableau et l'a mis sur le mur.

« Chaque fois qu'on ajoute une exigence de stockage », dit-elle, « on commence ici. »

## Forces et limites

**Forces d'EBS** :

- Stockage par blocs rapide et persistant pour EC2
- Snapshots pour la sauvegarde et la récupération à un instant donné
- Plusieurs niveaux de performance pour différentes charges de travail
- Chiffrement au repos pris en charge nativement

**Limites d'EBS** :

- Attaché à une instance à la fois (avec des exceptions mineures)
- Dans la même AZ que l'instance EC2 (la copie vers une autre AZ nécessite un snapshot)
- Vous payez pour le stockage provisionné, pas seulement ce que vous utilisez

**Forces d'EFS** :

- Système de fichiers partagé multi-instances — protocole NFS natif
- S'adapte automatiquement, vous ne provisionnez pas la capacité
- Accessible dans plusieurs AZ d'une Région

**Limites d'EFS** :

- Plus cher que S3 par Go
- Latence plus élevée qu'EBS pour l'I/O aléatoire
- Pas disponible dans toutes les Régions

## Résumé

- **L'instance store** est un stockage temporaire et rapide physiquement attaché à l'hôte.
  Les données sont perdues quand l'instance est arrêtée ou terminée. Pour l'espace de travail uniquement.
- **EBS** (Elastic Block Store) est du stockage par blocs persistant pour une seule instance EC2.
  Il survit aux arrêts d'instance. Il peut être snapshotté pour la sauvegarde. Choisissez le bon
  type de volume (gp3 pour usage général, io2 pour les exigences IOPS élevées).
- **EFS** (Elastic File System) est un système de fichiers réseau partagé que plusieurs instances
  peuvent monter simultanément. Utilisez-le quand plusieurs serveurs ont besoin d'accéder aux mêmes fichiers.
- Faites correspondre le type de stockage à l'exigence : base de données → EBS ; fichiers partagés → EFS ;
  objets/sauvegardes → S3 ; archives → S3 Glacier.

## Conseils pour l'examen

*Domaine SAA-C03 3 — Tâche 3.1 (solutions de stockage)*

- **Les volumes EBS vivent dans une AZ.** Ils ne peuvent être attachés qu'à une instance dans la
  même AZ. Pour utiliser un volume EBS dans une AZ différente, vous créez un snapshot et le
  restaurez dans l'AZ cible.
- **Les snapshots EBS sont incrémentiels et stockés dans S3.** Le premier snapshot est complet ;
  les suivants ne stockent que les modifications. Vous pouvez copier des snapshots vers d'autres Régions pour
  la reprise sur sinistre.
- **EFS est multi-AZ.** Plusieurs instances dans différentes AZ de la même Région
  peuvent monter le même système de fichiers EFS. C'est un différenciateur clé par rapport à EBS.
- **Quand un scénario d'examen dit « application web avec contenu partagé » ou « plusieurs
  instances accédant aux mêmes fichiers », pensez EFS.** Quand il dit « stockage de base de données »
  ou « disque persistant pour un seul serveur », pensez EBS.
- **Les données de l'instance store survivent à un redémarrage mais pas à un arrêt ou une termination.** Une question
  pourrait décrire des données qui « disparaissent après l'arrêt de l'instance » — c'est
  l'instance store en jeu.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre EBS et EFS ? Quand choisiriez-vous
l'un plutôt que l'autre ?

*(Indice : Pensez à si une ou plusieurs instances ont besoin d'accéder au
stockage en même temps.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise fait tourner une application web sur quatre instances EC2 derrière un équilibreur de charge.
Les utilisateurs peuvent télécharger des photos de profil. Les quatre instances doivent être capables de servir
la photo de n'importe quel utilisateur immédiatement après son téléchargement, quelle que soit l'instance qui a
géré le téléchargement. L'équipe a besoin d'un stockage de fichiers partagé et persistant.

Quelle solution de stockage correspond LE MIEUX à leurs exigences ?

A) Attacher un volume EBS gp3 à chaque instance EC2 et synchroniser les fichiers entre elles en utilisant
   une tâche planifiée  
B) Stocker les photos directement sur le stockage en instance store de l'instance EC2  
C) Utiliser Amazon EFS, monté sur les quatre instances EC2 simultanément  
D) Stocker les photos dans S3 et y accéder directement depuis le code d'application

**Indice 1** : L'exigence est « les quatre instances doivent servir n'importe quelle photo ». Quelles options
rendent un fichier immédiatement visible pour toutes les instances ?

**Indice 2** : L'instance store est éphémère. EBS ne peut pas être monté sur plusieurs instances
simultanément. Ça rétrécit les options.

**Indice 3** : C et D pourraient théoriquement fonctionner toutes les deux. Laquelle est plus appropriée pour
un cas où l'application a besoin d'accéder aux photos via des opérations de système de fichiers vs
des requêtes HTTP ?

**Réponse** : D

**Explication** : Stocker les photos dans S3 et les servir via URL est le choix architecturalement
correct pour une application web. Les photos téléchargées sont immédiatement accessibles depuis
n'importe quel serveur (et depuis n'importe quel navigateur) via l'URL de S3. S3 est conçu exactement pour ce
cas d'utilisation : stocker des fichiers téléchargés par les utilisateurs à grande échelle avec une haute disponibilité et zéro
frais de gestion.

Note : C (EFS) fonctionnerait techniquement, mais S3 est le schéma préféré pour les fichiers binaires
téléchargés par les utilisateurs dans les applications web parce qu'il est moins cher, plus évolutif, et sert les fichiers
directement via HTTP sans que l'application serve de proxy.

**Pourquoi pas A ?** La synchronisation de fichiers via une tâche planifiée crée des conditions de concurrence et des problèmes de
cohérence. Entre les téléchargements et la prochaine synchronisation, les fichiers seraient manquants sur les autres instances.

**Pourquoi pas B ?** Les données de l'instance store sont perdues quand l'instance est arrêtée ou terminée.
Les photos disparaîtraient.

**Pourquoi pas C ?** EFS est la bonne réponse si l'application a besoin de la sémantique de système de fichiers
(ex. un CMS qui modifie des fichiers en place). Pour les photos téléchargées par les utilisateurs servies sur le
web, S3 est plus simple, moins cher et plus approprié.

*Domaine SAA-C03 3 — Tâche 3.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus ajoute une nouvelle fonctionnalité : les propriétaires de restaurants peuvent télécharger des menus PDF qui sont
ensuite analysés et utilisés pour remplir la base de données Nimbus. Le travail de traitement PDF tourne
sur une flotte d'instances EC2 qui doivent : (a) lire le PDF téléchargé, (b) écrire
des fichiers de traitement temporaires, (c) écrire la sortie analysée.

Quels services de stockage utiliseriez-vous pour chacune de ces trois étapes, et pourquoi ?

*(Il n'y a pas de réponse unique correcte. Concentrez-vous sur la correspondance du type de stockage aux
caractéristiques de chaque étape.)*

## Scène post-générique

Cet après-midi, Nimbus a séparé correctement leur stockage. La base de données a eu son propre
volume EBS avec des snapshots automatisés. Les photos de menus ont été déplacées vers S3. L'instance EC2
avait enfin de la place pour respirer.

Leo a exécuté un test de charge. Le site a géré deux cents utilisateurs simultanés sans broncher.

Tom regarda la facture. Le volume EBS ajoutait 8 euros par mois. Il l'a noté.

« Je continue d'ajouter des choses à cette facture », dit-il. « Quand ça s'équilibre ? »

« Quand on arrête d'avoir des pannes », dit Maya. « Chaque panne coûte plus que la prévention. »

Tom n'avait pas l'air convaincu. Il le serait, éventuellement.

Trois jours plus tard, un propriétaire de restaurant sur la plateforme a essayé de passer une commande et a obtenu
une erreur. Maya a vérifié les logs.

La base de données était là. L'application tournait. Mais vingt utilisateurs simultanés
essayaient tous de lire le menu à la fois, et chacun frappait la base de données.

« Chaque chargement de page est une requête de base de données », dit Leo. « Chaque seule. »

Priya cherchait déjà quelque chose.

Dans le prochain chapitre : que se passe-t-il quand plus de clients arrivent que le serveur ne peut en gérer.
