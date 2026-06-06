# Chapitre 6 : Le disque qui vous suit partout

Tom avait un stylo rouge et une habitude qui rendait Leo nerveux.

Chaque samedi matin, il s'asseyait avec un café et imprimait quelque chose. Pas des e-mails. Pas des rapports. Il imprimait la liste de ce que Nimbus faisait tourner et la lisait comme un grand livre, ligne par ligne, stylo en main. Il faisait ça depuis la deuxième semaine. Le bruit de l'imprimante qui chauffait était devenu une partie du week-end.

Leo appelait ça « la chose que Tom fait et qui donne à Leo l'impression d'avoir fait quelque chose de mal ».

Ce samedi-là, Tom a cerclé quelque chose et laissé l'imprimé sur le bureau de Maya sans un mot.

Elle le trouva le lundi matin. Un cercle. Une note dans la marge, trois mots :

*Tout. Une seule machine.*

Les photos étaient en sécurité dans S3 maintenant — ce problème était résolu. Mais la base de données était toujours sur la même instance EC2 que le serveur web. L'historique des commandes, les enregistrements clients, deux mois de transactions. L'application et tout ce qui était en dessous, partageant un seul disque virtuel.

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

Imaginez un disque dur externe que vous pouvez brancher sur votre instance EC2 — un qui
ne disparaît pas quand vous le débranchez, et que vous pouvez déplacer vers une autre machine
si nécessaire. AWS appelle ça **EBS** : Elastic Block Store.

EBS est du stockage par blocs persistant pour les instances EC2.

Le stockage par blocs signifie qu'il se comporte comme un vrai disque dur : votre système d'exploitation peut créer
des systèmes de fichiers dessus, lire et écrire des octets arbitraires à des positions arbitraires, faire tourner des bases de données
dessus, et le traiter exactement comme un disque attaché.

Les propriétés clés :

**Persistant.** Contrairement à l'instance store, les volumes EBS survivent aux arrêts, démarrages et même
aux terminations d'instance (selon la configuration). Les données restent sur le volume
même quand aucune instance ne l'utilise.

Il y a une nuance de configuration ici : quand vous créez une instance EC2, le volume racine
a un paramètre appelé « Supprimer à la termination » (Delete on Termination). Par défaut, il est réglé sur true — le
volume racine est supprimé quand l'instance est terminée. Pour les volumes de données supplémentaires
que vous attachez, la valeur par défaut est false — ils persistent après la termination de l'instance.
Vous pouvez changer les deux paramètres. Si vous voulez que le volume racine survive à la termination de l'instance
(pour une analyse forensique ou une récupération de données), désactivez « Supprimer à la termination ». Si vous voulez que les
volumes de données soient nettoyés automatiquement, activez-le.

**Attachable et détachable.** Un volume EBS peut être détaché d'une instance et
attaché à une autre. Si vous devez migrer des données ou récupérer depuis une instance défaillante,
vous pouvez détacher le volume et le réattacher ailleurs.

Le flux détacher-et-réattacher est plus lent qu'une restauration de snapshot mais préserve
l'état exact du volume — toutes les écritures non validées, toutes les données en cache, l'état exact
du système de fichiers. Cela le rend utile pour l'analyse forensique (attacher le volume à
une instance d'analyse sans démarrer le système d'origine) et pour la migration de données
(déplacer un volume de base de données vers une instance plus grande sans prendre de snapshot).

**Attachement unique (principalement).** Par défaut, un volume EBS est attaché à exactement une
instance EC2 à la fois. Une seule instance peut avoir plusieurs volumes EBS, mais un seul
volume EBS ne peut pas être monté par plusieurs instances simultanément (avec une exception :
EBS Multi-Attach, qui a des cas d'utilisation limités et des restrictions importantes).

EBS Multi-Attach permet aux volumes io1/io2 (IOPS provisionné) d'être attachés à plusieurs instances simultanément
dans la même AZ. Ça ressemble à une solution au problème du « stockage partagé », mais ça vient
avec de sérieuses contraintes : les applications sur les instances attachées doivent pouvoir
coordonner l'accès concurrent — la sémantique de système de fichiers partagé (gestion des verrous, ordonnancement
des écritures) n'est pas fournie par EBS. En pratique, EBS Multi-Attach est utilisé pour les applications de
bases de données en cluster qui gèrent la coordination elles-mêmes. Pour l'accès général à des fichiers
partagés, EFS est plus simple et plus approprié.

L'analogie EBS : un disque dur externe branché sur un seul ordinateur portable. L'ordinateur
(instance EC2) peut lire et écrire dessus. Quand vous avez terminé, vous pouvez le débrancher et
le brancher sur un autre ordinateur.

**Types de volumes EBS**

Tous les volumes EBS ne sont pas identiques. AWS propose plusieurs types avec différentes performances
et profils de coût.

**gp3 (SSD d'usage général)** : Le choix par défaut pour la plupart des charges de travail. Bon équilibre de
performance et de prix. Adapté aux volumes de démarrage, petites bases de données et environnements de développement.

Avant que gp3 ne devienne le défaut, il y avait **gp2** — et vous le rencontrerez encore dans la nature. Les volumes gp2 lient leur performance IOPS directement à la taille du volume : vous obtenez 3 IOPS par gigaoctet, jusqu'à un maximum de 16 000 IOPS (ce qui nécessite un volume de 5 334 Go). Le débit est plafonné à 250 Mo/s. Ce couplage signifie que sur gp2, le seul moyen d'obtenir plus d'IOPS est d'agrandir le volume — même si vous n'avez pas besoin de l'espace supplémentaire. gp3 a brisé cette dépendance : il commence à 3 000 IOPS et 125 Mo/s indépendamment de la taille, et permet de configurer les IOPS et le débit indépendamment, à moindre coût. AWS recommande gp3 pour les nouveaux volumes, mais comme de nombreuses charges de travail existantes tournent encore sur gp2, vous devez connaître les deux.

**io2 (SSD IOPS provisionné)** : Option haute performance pour les charges de travail intensives en I/O.
Vous spécifiez combien d'opérations d'I/O par seconde (IOPS) vous avez besoin, et AWS garantit
cette performance. Approprié pour les grandes bases de données de production.

**st1 (HDD optimisé pour le débit)** : Stockage magnétique optimisé pour les grandes lectures et écritures
séquentielles. Moins cher que le SSD, mais plus lent pour l'I/O aléatoire. Bon pour l'entreposage
de données et le traitement de logs.

**sc1 (HDD froid)** : L'option EBS la moins chère. Pour les données accédées rarement. Pas
approprié pour tout ce qui est sensible au temps.

« Combien io2 coûte-t-il de plus comparé à gp3 ? » demanda Tom, levant les yeux de son carnet.

Leo afficha la page de tarification. io2 coûtait grosso modo trois fois le coût par Go de gp3,
plus un frais séparé par IOPS provisionné. Tom nota l'écart. « Donc on utilise gp3 jusqu'à ce
que la base de données ait réellement besoin de la garantie de performance. »

L'examen ne vous demande pas de mémoriser tous les types. Il teste votre capacité à
faire correspondre les exigences au bon type : exigences IOPS → io2. Charges de travail séquentielles
sensibles aux coûts → st1. Applications web générales → gp3.

**IOPS vs débit : pourquoi la distinction compte**

Tom est revenu à la question du volume EBS le mardi suivant, après avoir vérifié CloudWatch.

« Je vois deux métriques sur le tableau de bord EBS », dit-il. « IOPS et débit. Ce sont des choses différentes ? »

Oui.

**IOPS** (opérations d'entrée/sortie par seconde) mesure combien d'opérations de lecture ou d'écriture le disque peut gérer par seconde. Chaque opération est typiquement petite — 4 Ko à 256 Ko. Des IOPS élevés comptent pour les bases de données qui font de nombreuses lectures et écritures petites et aléatoires : récupérer des lignes individuelles, mettre à jour des enregistrements, gérer des requêtes concurrentes.

**Débit** (mesuré en Mo/s) mesure quelle quantité de données se déplace par seconde. Un débit élevé compte pour les charges séquentielles : lire de gros fichiers de logs, analytique en streaming, charger de grands jeux de données.

Une base de données a typiquement besoin d'IOPS élevés et d'un débit faible à modéré. Un entrepôt de données qui scanne de grandes tables a besoin d'un débit élevé et peut vivre avec des IOPS modérés.

Tom surveillait les métriques CloudWatch de la base de données Nimbus. Les IOPS faisaient des pics pendant le coup de feu du dîner — des lectures courtes et aléatoires pendant que l'application récupérait les articles de menu et les données de commandes. Le débit était faible. Le schéma correspondait à une charge de base de données qui avait besoin de meilleurs IOPS, pas d'un meilleur débit.

« Donc si la base de données devient lente », dit Tom, « on vérifie si elle est limitée par les IOPS ou par le débit avant de mettre à niveau le volume ? »

« Exact », dit Priya. « Passer de gp3 à io2 ajoute des IOPS à un coût. Si le problème est le débit, cette mise à niveau n'aidera pas. Vérifiez d'abord la métrique. »

C'est exactement ainsi que vous évitez les mises à niveau de stockage coûteuses qui résolvent le mauvais problème.

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

« A-t-on réfléchi à ce qui se passe si la tâche de snapshot échoue silencieusement ? » demanda Priya. « Si la politique s'exécute mais que les snapshots ne sont pas réellement valides ? »

Ils ont testé le processus de restauration cet après-midi-là.

La politique complète de sauvegarde par snapshots de Priya pour la base de données de production Nimbus, une fois qu'elle a eu le temps de la documenter correctement :

- **Snapshots quotidiens**, conservés 7 jours. Ils couvrent le scénario de récupération normal : un mauvais déploiement, une suppression accidentelle, un événement de corruption découvert en une semaine.
- **Snapshots hebdomadaires** (pris chaque dimanche à 2 h), conservés 30 jours. Ils couvrent le scénario où un problème n'est pas détecté immédiatement — une corruption de données subtile qui n'est remarquée que des semaines plus tard.
- Copie de snapshot inter-région vers `us-east-1`, une fois par semaine, conservée 30 jours. Ils couvrent le scénario où la Région `us-west-2` entière est indisponible et où Nimbus doit reconstruire la base de données ailleurs.

« Ça fait beaucoup de snapshots », dit Leo.

« Chaque snapshot incrémentiel après le premier est petit », dit Priya. « Vous ne stockez que ce qui a changé. Le coût total de stockage est modeste. »

Tom avait déjà cherché le prix. Des snapshots quotidiens d'une base de données de 50 Go, conservés 7 jours, plus des snapshots hebdomadaires conservés 30 jours — environ 3 à 5 $ par mois. Le coût de ne pas les avoir, si la base de données était un jour corrompue, était incommensurablement plus élevé.

« Et Fast Snapshot Restore ? » demanda Leo. « J'ai vu cette option quand je regardais les paramètres. »

**Fast Snapshot Restore** (FSR) est une fonctionnalité EBS qui élimine la pénalité de performance d'I/O qui se produit normalement quand vous utilisez pour la première fois un snapshot restauré. Sans FSR, un volume EBS fraîchement restauré a de mauvaises performances pendant les premières minutes ou heures pendant que les données sont chargées paresseusement depuis S3 — les lectures frappent S3 pour les données qui n'ont pas encore été tirées vers le volume. Avec FSR activé sur un snapshot dans une AZ spécifique, le volume restauré est immédiatement prêt pour des performances complètes.

FSR coûte un supplément — vous payez par snapshot par AZ par heure où FSR est activé. Pour les snapshots de reprise après sinistre de Nimbus, l'usage occasionnel ne justifiait pas le coût continu de FSR. Pour un snapshot de base de données de production qui devait être restauré et opérationnel en quelques minutes en cas d'urgence, FSR en valait la peine.

« Active FSR sur le snapshot hebdomadaire qu'on utiliserait réellement pour la reprise après sinistre », dit Priya. « Ne l'active pas sur chaque snapshot quotidien dans la fenêtre de rétention. »

Tom ajouta le calcul de coût à sa feuille de calcul.

**Copie de snapshot inter-région pour la reprise après sinistre**

Les snapshots EBS vivent dans la Région où ils ont été créés. Si la Région `us-west-2` entière tombe en panne, vos snapshots dans `us-west-2` sont inaccessibles.

La solution : la **copie de snapshot inter-région**. Vous pouvez copier un snapshot EBS vers une autre Région, vous donnant une sauvegarde utilisable même si votre Région principale est indisponible.

AWS Data Lifecycle Manager supporte la copie inter-région automatisée dans le cadre d'une politique de snapshot : prendre un snapshot quotidien dans `us-west-2`, le copier automatiquement vers `us-east-1` une fois par semaine. Si un désastre survient, lancez une nouvelle instance EC2 dans `us-east-1`, restaurez depuis le snapshot inter-région, mettez à jour l'endpoint DNS, et continuez à opérer.

« C'est notre plan de reprise après sinistre pour la base de données », dit Priya, en présentant la documentation de la politique à l'équipe. « Pas une architecture multi-région complète — c'est plus de complexité que ce dont on a besoin en ce moment. Mais si `us-west-2` tombe complètement, on peut restaurer dans `us-east-1` en deux heures. »

« Deux heures d'indisponibilité », dit Tom.

« Contre une indisponibilité infinie », dit Priya.

Tom reconnut la distinction.

**Chiffrement EBS : L'histoire de pourquoi vous ne pouvez pas chiffrer sur place**

La base de données de production Nimbus tournait depuis six semaines quand Priya a signalé quelque chose.

« Le volume EBS n'est pas chiffré », dit-elle.

« On peut le chiffrer ? » demanda Leo.

« Oui. Mais pas sur place. »

Voici le truc avec le chiffrement EBS : vous ne pouvez pas chiffrer directement un volume EBS existant non chiffré. Les données sont déjà écrites en clair. Pour le chiffrer, vous devez :

1. Créer un snapshot du volume non chiffré
2. Copier le snapshot, en activant le chiffrement sur la copie
3. Créer un nouveau volume EBS chiffré depuis le snapshot chiffré
4. Arrêter l'instance
5. Détacher l'ancien volume non chiffré
6. Attacher le nouveau volume chiffré
7. Démarrer l'instance et vérifier que tout fonctionne

Ce processus a une fenêtre d'indisponibilité — la séquence arrêt, détachement, attachement, démarrage. Pour Nimbus, avec une petite base de données, la fenêtre était d'environ quinze minutes. Pour une grande base de données de production avec des centaines de Go, le processus de snapshot et de copie peut prendre plus de temps, bien que l'indisponibilité réelle de l'instance ne soit toujours que le cycle arrêt/démarrage.

« Pourquoi on ne peut pas juste basculer un interrupteur ? » demanda Leo.

« Parce que les données existantes sur le disque sont des octets non chiffrés », dit Priya. « AWS ne peut pas les rechiffrer sans lire et réécrire chaque bloc — ce qui est exactement ce que fait le processus de copie de snapshot. Il lit chaque bloc du snapshot source, chiffre chacun, et l'écrit dans le nouveau snapshot. »

Leo a déroulé le processus. Le nouveau volume chiffré était attaché. L'instance est revenue en ligne. La base de données tournait sur un volume chiffré.

« Les nouveaux volumes EBS peuvent être créés chiffrés par défaut », dit Priya. « Il y a un paramètre au niveau du compte. Chaque nouveau volume est chiffré automatiquement. On aurait dû activer ça dès le premier jour. »

Elle l'a activé. À partir de ce moment, chaque volume EBS créé dans le compte AWS de Nimbus était chiffré par défaut — aucune étape supplémentaire requise.

**EFS : Le classeur partagé**

EBS est un disque attaché à une instance. Et si plusieurs instances doivent accéder aux
mêmes fichiers simultanément ?

Ce dont vous avez besoin, c'est quelque chose comme le classeur au centre d'un bureau — n'importe qui
peut s'approcher, sortir un fichier, le remettre, et la personne suivante voit le changement immédiatement.
Plusieurs personnes, simultanément, accédant au même stockage.

AWS appelle ça **EFS** : Elastic File System.

EFS est un système de fichiers réseau géré. Plusieurs instances EC2 peuvent monter le même système de fichiers EFS
en même temps et lire/écrire dans des fichiers partagés. C'est la capacité clé
qu'EBS ne fournit pas.

Pour le dire simplement :

EBS est un disque dur externe branché sur un seul ordinateur portable. Seul cet ordinateur peut l'utiliser à
la fois.

EFS est le classeur au centre du bureau. N'importe quel membre de l'équipe peut s'approcher, ouvrir
un tiroir, lire un fichier, remettre quelque chose.

**Quand avez-vous besoin d'EFS ?**

- Quand plusieurs instances EC2 doivent partager des fichiers — systèmes de gestion de contenu, fichiers de
  configuration partagés, bibliothèques de médias partagés
- Quand vous avez une application mise à l'échelle horizontalement où toutes les instances doivent accéder
  aux mêmes données
- Quand vous avez besoin d'un système de fichiers persistant qui survit aux pannes d'instance

EFS est accédé sur le réseau en utilisant le protocole NFS (spécifiquement NFSv4). Toute instance EC2
qui a une connectivité réseau vers la cible de montage EFS peut le monter — y compris les
instances dans différentes AZ de la même Région. Vous configurez des cibles de montage dans chaque
AZ, et les instances se connectent à la cible de montage la plus proche pour des performances optimales.

L'implication pratique : EFS fonctionne entre AZ d'emblée. Si vous avez des serveurs web
dans `us-west-2a` et `us-west-2b` montant tous deux le même système de fichiers EFS, un fichier écrit
par un serveur dans `2a` est immédiatement visible pour un serveur dans `2b`. C'est le comportement de
système de fichiers partagé qu'EBS ne peut pas fournir.

**Modes de performance EFS**

EFS a deux modes de débit qui comptent pour le dimensionnement :

**Débit élastique** (le défaut pour la plupart des nouveaux systèmes de fichiers) : EFS adapte automatiquement le débit à la hausse et à la baisse en fonction de l'usage réel. Vous ne provisionnez pas de niveau de débit. Vous payez ce que vous utilisez. C'est le bon mode pour les charges variables où les besoins en débit fluctuent — comme Nimbus, où le trafic du lundi matin est différent de celui du vendredi soir.

**Débit provisionné** : Vous spécifiez le niveau de débit indépendamment des données stockées. Utile quand votre charge a besoin d'un débit élevé constant qui dépasse ce que le volume de données stockées fournirait en mode élastique. Si vous faites tourner un système de build qui lit des dizaines de gigaoctets par minute quelle que soit la quantité stockée, le débit provisionné est approprié.

Il y a aussi un troisième mode, le **débit à rafale** (Bursting), qui est le comportement EFS d'origine et toujours le défaut pour les systèmes de fichiers créés avant que l'élastique ne soit disponible. En mode rafale, le débit s'adapte à la quantité de données que vous stockez : vous obtenez une base de 50 Ko/s par Go, plus des crédits de rafale qui s'accumulent quand vous êtes sous la base et peuvent être dépensés quand vous avez besoin d'un débit plus élevé (jusqu'à 100 Mo/s pour les petits systèmes de fichiers, ou jusqu'à un multiple de la base pour les plus grands). C'est le bon choix pour les charges aux schémas d'accès imprévisibles ou en pics où le système de fichiers est assez grand pour gagner des crédits de rafale significatifs. Si votre système de fichiers est petit et que votre schéma d'accès est en pics, vous pouvez épuiser vos crédits rapidement — surveillez la métrique CloudWatch `BurstCreditBalance` pour savoir où vous en êtes.

La question de Tom fut immédiate : « L'élastique est-il plus cher ? »

« Ça dépend du schéma d'usage », dit Leo. « Avec l'élastique, tu paies pour le débit que tu consommes réellement. Avec le provisionné, tu paies pour le débit que tu as spécifié même si tu ne l'utilises pas. »

« Donc pour les charges variables, l'élastique est généralement moins cher », dit Tom.

« Généralement », dit Priya. « Vérifie tes schémas de débit réels dans CloudWatch avant de décider. »

EFS a aussi deux modes de performance : **Usage général** (faible latence, adapté à la plupart des charges, le défaut) et **Max I/O** (débit plus élevé pour les charges hautement parallélisées au prix d'une latence légèrement plus élevée). L'Usage général gère la grande majorité des cas d'utilisation. Max I/O a été conçu pour les applications qui ont besoin de faire des milliers d'opérations de système de fichiers simultanées — pipelines de traitement de médias à grande échelle, flux de calcul scientifique avec de nombreux lecteurs parallèles.

**EFS vs S3 :** EFS est un système de fichiers (dossiers, fichiers, permissions, verrouillage). S3 est du
stockage d'objets (téléchargement montant, téléchargement descendant, pas de sémantique de système de fichiers). EFS est beaucoup plus cher
que S3 — grosso modo 0,30 $ par Go par mois pour EFS Standard contre 0,023 $ par Go par mois
pour S3 Standard. Utilisez S3 pour les fichiers qui sont stockés et récupérés entiers. Utilisez EFS pour les fichiers
que les applications lisent et écrivent activement via des opérations standard de système de fichiers.

**Si EBS, alors une seule instance, mais si EFS, alors plusieurs**

La décision EBS/EFS se résume à une question : combien d'instances doivent accéder à ce stockage en même temps ?

Si vous construisez une application mise à l'échelle horizontalement sur EBS, alors chaque instance a son propre disque — mais quand un utilisateur télécharge un fichier vers l'instance A, l'instance B ne peut pas le voir. C'est bien pour les bases de données (chaque BD a son propre disque), mais cassé pour le contenu partagé. Si vous avez besoin d'un accès partagé, EFS est la réponse — mais EFS coûte plus par Go que S3, et a une latence plus élevée qu'EBS pour l'I/O aléatoire. Le bon choix dépend entièrement de ce que votre application fait avec les données.

**Choisir le bon stockage**

Maintenant vous avez vu trois types de stockage dans AWS. Rendons la décision claire.

| Besoin                                          | Type de stockage     |
|-------------------------------------------------|----------------------|
| La base de données a besoin d'un disque rapide persistant | EBS (gp3 ou io2) |
| Plusieurs serveurs ont besoin de fichiers partagés | EFS              |
| Fichiers, sauvegardes, images, grands objets    | S3                   |
| Espace de travail temporaire de calcul          | Instance Store       |
| Archives à long terme au coût minimum           | S3 Glacier           |

Vous vous demandez peut-être : si EFS permet à plusieurs instances de partager des fichiers, pourquoi ne pas l'utiliser pour tout ? Parce qu'EFS coûte significativement plus par Go que S3, et a une latence plus élevée que l'EBS local pour l'I/O aléatoire. C'est le bon outil pour l'accès partagé à un système de fichiers — pas pour le stockage général de fichiers ou le stockage de bases de données.

Prendre cette décision correctement est important. Utiliser S3 là où vous avez besoin d'EFS ajoute de la
complexité opérationnelle. Utiliser EBS là où vous avez besoin d'EFS cause des pannes quand vous évoluez.
Utiliser l'instance store là où vous avez besoin de persistance perd des données.

Priya a imprimé ce tableau et l'a mis sur le mur.

« Chaque fois qu'on ajoute une exigence de stockage », dit-elle, « on commence ici. »

Parcourons quelques scénarios réels pour rendre la décision concrète :

**Scénario A** : Un travail d'entraînement d'apprentissage automatique tourne sur une instance EC2 GPU et a besoin
de lire un jeu de données de 200 Go. Le travail tourne une fois par jour et prend deux heures. Le jeu de données
est partagé par plusieurs équipes de recherche.

Décision : S3. Le jeu de données est grand, lu-une-fois-par-travail, et partagé. S3 est bon marché, durable,
et accessible depuis n'importe quelle instance EC2 ou n'importe quel compte d'équipe. L'instance GPU le lit
via l'API S3. Il n'y a pas besoin de système de fichiers ici.

**Scénario B** : Un site WordPress tourne sur quatre instances EC2 derrière un répartiteur de charge.
WordPress stocke les fichiers de plugins, les fichiers de thèmes, et les téléchargements des utilisateurs dans un répertoire sur le
serveur. Les quatre instances doivent lire et écrire les mêmes fichiers.

Décision : EFS. WordPress utilise la sémantique de système de fichiers — il crée des répertoires, écrit des
fichiers, lit des fichiers par chemin. S3 nécessiterait de réécrire l'écosystème de plugins WordPress.
EFS se monte comme un système de fichiers NFS standard, avec lequel WordPress fonctionne nativement.

**Scénario C** : Une base de données PostgreSQL tourne sur une instance EC2. Elle a besoin d'un I/O aléatoire rapide
pour l'exécution des requêtes et les recherches d'index.

Décision : EBS (gp3 ou io2). Les bases de données ont besoin de stockage par blocs avec une faible latence pour les petites
lectures et écritures aléatoires. S3 est trop lent et ne supporte pas la sémantique de système de fichiers.
EFS a une latence plus élevée qu'EBS pour l'I/O aléatoire.

Le schéma : le défaut pour les fichiers est S3. Ajoutez EBS quand vous avez besoin de stockage par blocs pour une
instance spécifique. Ajoutez EFS quand plusieurs instances ont besoin de partager un système de fichiers.
L'instance store pour l'espace de travail temporaire uniquement.

## Quand EFS ne suffit pas : Amazon FSx

La prochaine leçon de stockage n'est pas arrivée comme une panne ou un débat au tableau blanc. Elle est arrivée comme un contrat de vente — le genre que Maya poursuivait depuis le lancement du portail, le genre qui prenait un trimestre entier de démos et d'appels de suivi pour conclure. Trois mois après le lancement du portail des exploitants de restaurants, Nimbus a signé son premier client multi-établissements : Copper Kettle, un groupe familial d'une douzaine d'établissements à travers le Midwest. Maya avait mené l'affaire. Tom avait construit le modèle financier. Leo avait commencé à planifier l'intégration technique avant que l'encre ne soit sèche.

Puis il a lu les notes d'infrastructure de l'équipe informatique de Copper Kettle.

« Leurs serveurs de fichiers sont Windows », dit-il. « Tout est Windows. Leur logiciel de gestion de cuisine, leur système RH, leur outil de planification — tout écrit sur des lecteurs partagés sur des serveurs de fichiers Windows. Protocole SMB. Authentification Active Directory. »

« On peut les transférer sur EFS ? » demanda Maya.

Leo secoua la tête. « EFS utilise NFS. Leurs applications parlent SMB. Ce sont des protocoles différents. Le logiciel de Copper Kettle ne sait pas ce qu'est NFS. On ne peut pas juste le pointer vers un montage EFS. »

« Donc on ne peut pas utiliser EFS. »

« Pas pour ça. Il y a un service différent. »

**FSx for Windows File Server : EFS, mais pour Windows**

**Amazon FSx for Windows File Server** est un système de fichiers partagé entièrement managé et natif Windows. Il supporte le protocole SMB (Server Message Block) — le même protocole que les serveurs Windows, les applications Windows et les partages de fichiers Windows sur site utilisent depuis des décennies. Il s'intègre à Active Directory, supporte les ACL Windows (permissions au niveau fichier), et supporte les fonctionnalités spécifiques à Windows dont les applications Windows dépendent réellement.

Voyez-le comme EFS, mais pour Windows — avec toutes les fonctionnalités spécifiques à Windows que votre environnement Active Directory attend déjà. Le logiciel de gestion de cuisine de Copper Kettle s'y connecterait exactement comme il s'était connecté aux serveurs de fichiers sur site. L'application ne change pas. Le protocole ne change pas. Les données vivent juste sur un service AWS managé au lieu d'un serveur dans un sous-sol quelque part à Chicago.

Pour la migration de Copper Kettle : Leo a provisionné un système de fichiers FSx for Windows File Server, l'a connecté à l'Active Directory de Copper Kettle (étendu à AWS via AWS Managed Microsoft AD), et a mappé les lettres de lecteur existantes. Le logiciel de cuisine a trouvé ses partages de fichiers exactement là où il les attendait.

« Combien ça coûte par mois ? » demanda Tom.

Leo avait déjà regardé. FSx for Windows est facturé par Go de stockage par mois — plus cher qu'EFS, significativement plus que S3, mais bien moins cher que de maintenir des serveurs de fichiers Windows à travers une douzaine d'établissements. Tom nota le chiffre sans objection.

**FSx for Lustre : Quand votre travail ML doit alimenter des centaines de GPU**

Pendant ce temps, Leo avait commencé à prototyper un moteur de recommandation en parallèle — prédire quels plats un client était susceptible de commander en fonction de son comportement passé et de ce que des clients similaires avaient commandé. Les données d'entraînement étaient encore petites, mais l'expérience l'a entraîné dans un terrier de lapin sur la façon dont les équipes ML sérieuses alimentent leurs modèles : des travaux d'entraînement qui lisent des centaines de gigaoctets depuis S3 à chaque exécution.

« Le schéma qui revient sans cesse dans les études de cas », rapporta-t-il au déjeuner d'équipe suivant, « ce sont des travaux d'entraînement goulottés par l'I/O. Des GPU coûteux inactifs 40 % du temps, attendant le prochain lot de données. »

C'est un problème différent du stockage de fichiers partagés. C'est un problème de calcul haute performance (HPC) : quand vous avez des centaines d'unités de traitement qui doivent toutes lire des données simultanément, à très haut débit, depuis le même jeu de données.

**Amazon FSx for Lustre** est une implémentation entièrement managée du système de fichiers parallèle Lustre. Lustre est conçu spécifiquement pour exactement ce scénario — des lectures parallèles à un débit extrêmement élevé, à travers de nombreux clients simultanés. Il s'intègre nativement avec S3 : vous pointez FSx for Lustre vers un bucket S3, et il rend automatiquement ces données disponibles via le système de fichiers Lustre. Le travail d'entraînement lit depuis un point de montage local ; FSx diffuse les données depuis S3 en coulisses.

Quand votre travail d'entraînement ML doit alimenter des données à des centaines de GPU simultanément, FSx for Lustre est l'outil. La même chose s'applique à la modélisation financière, aux charges de génomique, et au rendu vidéo — toute charge où le goulot d'étranglement est le débit d'I/O parallèle plutôt que la capacité de stockage.

L'étude de cas que Leo avait mise en favori racontait l'histoire en deux chiffres : après avoir migré le travail d'entraînement vers FSx for Lustre, l'utilisation des GPU est passée de 60 % à 94 %, et l'exécution d'entraînement qui avait pris six heures s'est terminée en trois heures et demie. Nimbus n'aurait pas besoin de ce genre de puissance avant longtemps — mais Leo a rangé le schéma pour le jour où le moteur de recommandation grandirait.

**Les autres options FSx**

AWS offre aussi **FSx for NetApp ONTAP** — pour les entreprises qui font déjà tourner du stockage NetApp sur site et veulent un accès multi-protocole (NFS, SMB et iSCSI depuis le même système de fichiers) — et **FSx for OpenZFS**, pour les charges qui ont besoin de fonctionnalités spécifiques à ZFS comme les snapshots et les clones au niveau du système de fichiers. Les deux sont des outils spécialisés pour les organisations avec une infrastructure ou des exigences existantes spécifiques.

Pour la plupart des équipes, la décision est entre les quatre variantes FSx et EFS. La question est toujours la même : quel protocole la charge parle-t-elle, et quelles caractéristiques de performance a-t-elle besoin ?

---

> **Conseil d'examen — Amazon FSx**
>
> *Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.1)*
>
> - **FSx for Windows = SMB + Active Directory + charges Windows**. Les signaux de l'examen : « serveur de fichiers Windows », « protocole SMB », « intégration Active Directory », « lift-and-shift d'applications Windows ». Quand vous voyez l'une de ces phrases, FSx for Windows est la réponse.
> - **FSx for Lustre = HPC + entraînement ML + I/O parallèle + intégration S3**. Les signaux de l'examen : « entraînement d'apprentissage automatique », « calcul haute performance », « HPC », « système de fichiers parallèle », « charges intensives en I/O », « cluster GPU », « intégrer le système de fichiers avec S3 ». Quand vous voyez ces phrases, FSx for Lustre est la réponse.
> - **EFS n'est un substitut ni pour l'un ni pour l'autre.** EFS est NFS pour les charges Linux. Il ne parle pas SMB. Ce n'est pas un système de fichiers parallèle haute performance. Utiliser EFS là où FSx est nécessaire signifie que l'application ne fonctionne pas (Windows) ou est goulottée par l'I/O (HPC).
> - **FSx for NetApp ONTAP et FSx for OpenZFS** apparaissent moins souvent, mais les signaux sont distinctifs. « Migrer du stockage NetApp/ONTAP existant », « accès multi-protocole (NFS + SMB + iSCSI) », ou « SnapMirror » → FSx for NetApp ONTAP. « ZFS », « NFS avec snapshots/clones instantanés », ou « migrer un serveur de fichiers ZFS sur site » → FSx for OpenZFS.
> - Référence rapide : « SMB ou serveur de fichiers Windows » → FSx for Windows. « Entraînement d'apprentissage automatique ou calcul haute performance » → FSx for Lustre. « NetApp/multi-protocole » → FSx for ONTAP. « ZFS » → FSx for OpenZFS.

---

## Le pont vers le cloud : AWS Storage Gateway

Le plus gros prospect de Nimbus à ce jour — une chaîne régionale appelée Meridian Kitchen, vingt établissements à travers trois États — venait avec un problème qui ne pouvait pas être résolu avec `aws s3 cp`.

Meridian avait des années de données opérationnelles vivant sur des serveurs de fichiers sur site. Des recettes, des factures, des séquences vidéo de cuisine, des contrats de fournisseurs. Pas quelques gigaoctets. Des téraoctets. Et le logiciel qui générait et consommait ces données — leur système de gestion de cuisine, leur plateforme de facturation, leurs outils RH — tout écrivait vers des partages de fichiers locaux en utilisant NFS ou SMB. Réécrire ces applications n'était pas faisable. Déplacer toutes les données du jour au lendemain n'était pas faisable non plus.

« Alors comment on commence à faire entrer leurs données dans AWS », demanda Maya, « sans leur demander de changer une seule application ? »

« Il y a un service pour exactement ça », dit Priya. « Il tourne dans leur centre de données comme une VM, ressemble à un serveur de fichiers ou un dispositif de stockage normal pour leur logiciel existant, et stocke discrètement tout dans AWS en coulisses. »

Ce service est **AWS Storage Gateway** : un service de stockage hybride qui connecte les environnements sur site au stockage AWS. Il présente le stockage à vos applications en utilisant les protocoles qu'elles comprennent déjà, tout en persistant réellement les données dans S3, S3 Glacier, ou comme des snapshots EBS.

Il y a trois types de gateway, chacun résolvant un problème différent sur site.

**File Gateway** présente une interface NFS ou SMB aux applications sur site. Les fichiers écrits vers le gateway sont stockés comme des objets dans S3 — mais l'application ne le sait pas. Elle voit un système de fichiers. Les fichiers fréquemment accédés sont mis en cache localement pour des lectures à faible latence ; le reste vit dans S3. C'est ce dont Meridian avait besoin : le logiciel de gestion de cuisine écrit vers ce qui ressemble à un partage de fichiers, et les données finissent dans S3 où Nimbus peut les analyser, les sauvegarder, et les rechercher.

« Attends — mais *pourquoi* ferions-nous comme ça ? » demanda Maya. « Pourquoi ne pas juste pointer le logiciel vers S3 directement ? »

Parce que NFS et SMB ne sont pas S3. Le logiciel de cuisine ne parle pas l'API de S3. Il ouvre des chemins de fichiers. Il écrit des octets vers un répertoire. File Gateway traduit ça en opérations d'objets S3 sans que l'application ne sache que quoi que ce soit a changé.

**Volume Gateway** présente des volumes de stockage par blocs iSCSI aux serveurs sur site — la même interface qu'un disque dur physique ou un dispositif SAN présenterait. Il a deux modes : les *volumes stockés* gardent les données principales sur site avec des sauvegardes asynchrones vers S3 comme snapshots EBS (pour les charges sur-site-d'abord qui veulent aussi une sauvegarde cloud), et les *volumes en cache* gardent les données principales dans S3 avec les données fréquemment accédées en cache sur site (pour les organisations prêtes à traiter S3 comme stockage principal).

**Tape Gateway** présente une bibliothèque de bandes virtuelle (VTL) à un logiciel de sauvegarde comme Veeam, Veritas ou NetBackup. Le logiciel de sauvegarde écrit vers ce qui ressemble à des cartouches de bandes physiques. Ces bandes virtuelles sont stockées dans S3 et peuvent être archivées vers S3 Glacier. Le logiciel de sauvegarde ne change pas. Les robots de bandes physiques et les étagères disparaissent.

« L'équipe de sauvegarde de Meridian fait tourner Veeam », dit Leo. « Ils ont de vraies bandes physiques. Stockage hors site, calendriers de rotation, tout le tralala. »

« Tape Gateway remplace les bandes physiques », dit Priya. « Même configuration Veeam. Mêmes travaux de sauvegarde. Les bandes vivent juste dans S3 au lieu d'un rack. »

Tom a cherché le coût du stockage de bandes hors site. Il a fermé cet onglet sans commentaire et approuvé le plan de migration.

---

> **Conseil d'examen — AWS Storage Gateway**
>
> *Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3)*
>
> - **File Gateway = NFS/SMB → S3.** Les fichiers écrits par les applications sur site deviennent des objets S3. Les fichiers fréquemment accédés sont mis en cache localement. Déclencheur d'examen : « une application sur site doit stocker des fichiers dans S3 sans changements de code ».
> - **Volume Gateway = stockage par blocs iSCSI → snapshots S3.** Mode stocké : données principales sur site, sauvegardées vers S3 comme snapshots EBS. Mode en cache : données principales dans S3, blocs fréquemment accédés en cache localement. Déclencheur d'examen : « un serveur sur site a besoin de stockage par blocs adossé au cloud ».
> - **Tape Gateway = VTL → S3/Glacier.** Le logiciel de sauvegarde écrit vers des bandes virtuelles ; les bandes stockées dans S3 ou archivées vers Glacier. Déclencheur d'examen : « remplacer l'infrastructure de sauvegarde sur bandes physiques sans changer le logiciel de sauvegarde ».
> - **Schéma d'examen clé :** « une application sur site a besoin de stockage cloud sans changements de code » → Storage Gateway. « Remplacer la sauvegarde sur bandes » → Tape Gateway spécifiquement.

---

## Forces et limites

**Forces d'EBS** :

- Stockage par blocs rapide et persistant pour EC2
- Snapshots pour la sauvegarde et la récupération à un instant donné
- Plusieurs niveaux de performance pour différentes charges de travail
- Chiffrement au repos pris en charge nativement — activez le chiffrement par défaut au niveau du compte

**Limites d'EBS** :

- Attaché à une instance à la fois (avec des exceptions mineures)
- Dans la même AZ que l'instance EC2 (la copie vers une autre AZ nécessite un snapshot)
- Vous payez pour le stockage provisionné, pas seulement ce que vous utilisez
- Chiffrer un volume existant non chiffré nécessite un cycle snapshot-copie-restauration avec une fenêtre de maintenance

**Forces d'EFS** :

- Système de fichiers partagé multi-instances — protocole NFS natif
- S'adapte automatiquement, vous ne provisionnez pas la capacité
- Accessible dans plusieurs AZ d'une Région
- Le mode Débit élastique s'ajuste automatiquement à la charge

**Limites d'EFS** :

- Plus cher que S3 par Go
- Latence plus élevée qu'EBS pour l'I/O aléatoire
- Pas disponible dans toutes les Régions

## Déplacer des données en masse : DataSync et la famille Snow

Storage Gateway garde les applications sur site *continuellement connectées* au stockage cloud. Mais deux autres scénarios de migration apparaissent constamment à l'examen — et finissent par apparaître dans de vrais projets :

**AWS DataSync** est pour le *transfert en masse en ligne* : déplacer de grands jeux de données sur le réseau entre des serveurs de fichiers NFS/SMB sur site (ou d'autres clouds) et S3, EFS ou FSx — une fois, ou selon un calendrier. Il gère la parallélisation, la vérification d'intégrité, les nouvelles tentatives, et la limitation de bande passante, et il est grosso modo 10 fois plus rapide que des scripts de type rsync faits maison. Déclencheur d'examen : « migrer/transférer des millions de fichiers d'un serveur NFS sur site vers Amazon EFS/S3 » → DataSync. (Ne le confondez pas avec Storage Gateway, qui est pour l'*accès hybride continu*, ou DMS, qui migre des *bases de données*.)

**La famille AWS Snow** est pour quand le réseau est le goulot d'étranglement. Déplacer 100 To sur une ligne à 100 Mbps prend plus de trois mois ; un camion est plus rapide. **Snowball Edge** est un dispositif renforcé qu'AWS vous expédie — chargez jusqu'à ~80 To localement, renvoyez-le, AWS l'importe dans S3. **Snowcone** était la petite version portable (~8–14 To) pour les emplacements en périphérie — abandonnée fin 2024, bien qu'elle puisse encore apparaître dans des questions d'examen plus anciennes (voir la mise au point dans le Chapitre 25). Déclencheur de calcul d'examen : quand l'énoncé vous donne une taille de jeu de données et un lien fin ou peu fiable et demande la migration la plus rapide/la plus pratique, calculez le temps de transfert — si c'est des semaines ou des mois, la réponse est la famille Snow.

> **Conseil d'examen — AWS Backup**
>
> Un service de plus qui relie ce chapitre : **AWS Backup** centralise et automatise les sauvegardes à travers EBS, EFS, RDS, DynamoDB, FSx et Storage Gateway avec un seul plan de sauvegarde — calendriers, rétention, copies inter-régions et inter-comptes, et Backup Vault Lock pour l'immuabilité. Déclencheur d'examen : « gérer centralement les sauvegardes à travers plusieurs services/comptes AWS » → AWS Backup, pas des scripts par service.


## Résumé

Le stylo rouge de Tom a cerclé le vrai problème : trop de choses sur une seule machine. Déplacer le stockage hors de l'instance EC2 ne concerne pas seulement la capacité — il s'agit de séparer les préoccupations pour que chaque couche puisse être gérée, mise à l'échelle et sécurisée indépendamment. Le bon choix de stockage dépend de quatre questions : qu'est-ce qui a besoin du stockage, combien de choses en ont besoin à la fois, combien de temps il vit, et comment il est accédé ? Ces quatre questions mènent systématiquement à la bonne réponse.

- **EBS** (Elastic Block Store) est du stockage par blocs persistant pour une seule instance EC2. Il survit aux arrêts d'instance et peut être snapshotté pour la sauvegarde. Utilisez gp3 pour les charges générales, io2 pour les exigences IOPS élevées. L'instance store est temporaire et rapide mais perdu quand l'instance se termine.
- **EFS** (Elastic File System) est un système de fichiers réseau partagé que plusieurs instances peuvent monter simultanément. EFS s'étend à travers les AZ d'une Région ; EBS est contraint à une seule AZ.
- Faites correspondre le type de stockage à l'exigence : base de données EC2 unique → EBS ; fichiers partagés entre serveurs → EFS ; objets, médias, sauvegardes → S3 ; archives → S3 Glacier.
- Chiffrer un volume EBS existant nécessite : snapshot → copie chiffrée → nouveau volume → échange. Activez le chiffrement par défaut au niveau du compte pour éviter ça pour les nouveaux volumes.
- **EBS « Supprimer à la termination »** : les volumes racine suppriment par défaut à la termination de l'instance ; les volumes de données persistent par défaut. Vérifiez les deux paramètres lors de la conception des politiques de cycle de vie d'instance.

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
- **gp3 vs io2** : gp3 est le défaut pour l'usage général ; io2 est pour les charges qui
  ont besoin d'IOPS garantis (grandes bases de données, systèmes critiques). Les scénarios d'examen
  décrivant des « exigences IOPS » ou des « performances de base de données cohérentes à faible latence »
  pointent vers io2.
- **gp2 vs gp3 :** les IOPS de gp2 sont couplés à la taille (3 IOPS/Go, max 16 000 IOPS à 5 334 Go) ; les IOPS de gp3 sont indépendants de la taille (3 000 de base, configurable jusqu'à 80 000 depuis fin 2025 — le matériel plus ancien, et possiblement la banque de questions de l'examen, suppose encore le plafond précédent de 16 000). Schéma de question d'examen : une charge a besoin de plus d'IOPS sans augmenter le stockage — la réponse est gp3 ou io2, pas gp2.
- **Chiffrement au repos pour EBS** : Vous ne pouvez pas chiffrer un volume existant non chiffré
  sur place — vous devez snapshotter, copier chiffré, restaurer. Activez les valeurs par défaut de chiffrement
  au niveau du compte pour éviter de créer accidentellement des volumes non chiffrés. Le chiffrement est AES-256
  utilisant des clés KMS.
- **Fast Snapshot Restore** élimine la pénalité de performance sur les volumes fraîchement restaurés
  mais coûte de l'argent par snapshot par AZ. Les questions d'examen sur la restauration de volumes
  « immédiatement à pleine performance » pointent vers FSR.
- **Modes de performance EFS** : Usage général (faible latence, adapté à la plupart des charges)
  vs Max I/O (débit plus élevé pour les charges hautement parallélisées).
- **Modes de débit EFS — trois options :** Rafale (le débit s'adapte à la taille du stockage, utilise des crédits de rafale — bon pour les charges en pics), Élastique (auto-adaptation, paiement à l'usage — bon pour les charges imprévisibles), Provisionné (débit fixe indépendamment du stockage — bon pour les besoins de débit élevé constant). L'examen teste si vous savez quand provisionner le débit vs le laisser s'adapter élastiquement ou compter sur les crédits de rafale.
- **Copie de snapshot inter-région** : les snapshots EBS peuvent être copiés vers d'autres Régions pour
  la reprise après sinistre. Le snapshot copié est indépendant et n'ajoute pas de coûts de transfert
  de données pendant la restauration — uniquement pendant l'opération de copie elle-même.
- **Types de Storage Gateway :** File Gateway = NFS/SMB → S3 (les fichiers deviennent des objets). Volume Gateway = stockage par blocs iSCSI → snapshots S3 (stocké : principal sur site ; en cache : principal dans S3). Tape Gateway = VTL → S3/Glacier (remplace les bandes physiques). Déclencheur d'examen : « une application sur site a besoin de stockage cloud sans changements de code » → Storage Gateway. « Remplacer la sauvegarde sur bandes » → Tape Gateway.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre EBS et EFS ? Quand choisiriez-vous
l'un plutôt que l'autre ?

*(Indice : Pensez à si une ou plusieurs instances ont besoin d'accéder au
stockage en même temps.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise fait tourner une application web sur quatre instances EC2 derrière un répartiteur de charge.
Les utilisateurs peuvent télécharger des photos de profil. Toute photo doit être visualisable par les utilisateurs
immédiatement après le téléchargement, quelle que soit l'instance qui l'a géré. Les photos sont
servies aux navigateurs via HTTP, ne sont jamais modifiées en place, et l'équipe veut la
solution LA PLUS rentable et évolutive avec le moins de charge opérationnelle.

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

**Pourquoi pas C ?** EFS est la bonne réponse quand la question exige la sémantique de système de fichiers
(ex. un CMS qui modifie des fichiers en place). Pour les photos téléchargées par les utilisateurs servies sur le
web, S3 est plus simple, moins cher et plus approprié.

**Avertissement mot-clé d'examen** : à l'examen réel, lisez l'énoncé littéralement. S'il dit
« stockage de **fichiers** partagé », « système de fichiers », « NFS », ou « POSIX », la réponse attendue est
**EFS** — ne contournez pas l'exigence énoncée par goût architectural. Ce
scénario aboutit à S3 parce qu'il demande une livraison d'objets rentable via HTTP,
pas un système de fichiers.

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
volume EBS avec des snapshots automatisés et le chiffrement activé. Les photos de menus ont été déplacées vers S3. L'instance EC2
avait enfin de la place pour respirer.

Leo a exécuté un test de charge. Le site a géré deux cents utilisateurs simultanés sans broncher.

« Ça ira à partir de là », dit-il, en regardant les graphiques se stabiliser en douceur.

Tom regarda la facture. Le volume EBS ajoutait 8 $ par mois. Il l'a noté.

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
