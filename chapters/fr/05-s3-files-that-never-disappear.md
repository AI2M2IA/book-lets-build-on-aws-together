# Chapitre 5 : Le classeur qui vit dans le cloud

Leo a réalisé que Nimbus stockait les photos de menus téléchargées directement sur l'instance EC2.
Chaque photo que les clients téléchargent — l'arepa croustillant, l'assiette de saumon grillé, le bol de salade
joliment dressé — était posée sur une seule machine virtuelle.

Et si cette machine était jamais redémarrée, redimensionnée ou remplacée ?

Disparues.

« Combien de photos les clients ont-ils téléchargées jusqu'à présent ? » demanda Maya.

Leo ouvrit la console. « Environ huit cents. »

« Et que se passe-t-il avec ces huit cents photos si on redémarre le serveur ? »

Une autre de ces pauses significatives de Leo.

Ce chapitre parle de l'endroit où les fichiers appartiennent vraiment dans le cloud.

**Le problème du stockage de fichiers "sur le serveur"**

Quand vous stockez des fichiers directement sur une instance EC2 — dans son système de fichiers — vous
liez ces fichiers au cycle de vie de cette machine spécifique.

Cela crée plusieurs problèmes :

**Éphémère par nature.** Les instances EC2 peuvent être arrêtées, terminées, remplacées. Leur
disque local n'est pas conçu pour être permanent. C'est de l'espace de travail temporaire.

**Point de défaillance unique.** Si l'instance tombe en panne, les fichiers partent avec elle. Pas
de redondance. Pas de sauvegarde. Un mauvais matin et huit cents photos de menus disparaissent.

**Impossible à partager entre instances.** Quand vous ajoutez un deuxième serveur (ce que vous ferez, au
Chapitre 7), il ne verra pas les fichiers stockés sur le disque du premier serveur. Les deux serveurs
sont isolés. Un utilisateur qui télécharge une photo pourrait la voir ; un autre utilisateur accédant à un serveur différent
pourrait ne pas la voir.

**Pas d'évolutivité.** L'espace disque d'EC2 est fini. Si vous le remplissez, vous devez soit arrêter d'accepter
des téléchargements, soit vous démener pour étendre le stockage sous pression.

Il existe un meilleur modèle. AWS l'a construit en 2006, et c'est toujours l'un des services cloud les plus
utilisés dans le monde.

**Amazon S3 : Le disque dur qui vit en ligne**

**Amazon S3** — Simple Storage Service — est le service de stockage d'objets d'AWS.

Imaginez-le comme un disque dur qui vit sur internet. Un disque dur infini.
Un disque qui est automatiquement sauvegardé dans plusieurs Zones de disponibilité de sorte que la perte
de n'importe quel centre de données ne fasse pas perdre vos fichiers.

Le concept clé dans S3 est l'**objet**.

Un objet est n'importe quel fichier : une photo, une vidéo, un PDF, un CSV, une sauvegarde, un fichier log. S3
ne se soucie pas du type ou de la structure. Il stocke des octets et vous les rend quand
vous demandez.

Les objets vivent dans des **buckets**. Un bucket est comme un dossier de premier niveau — un
conteneur nommé dans S3 qui contient vos objets. Chaque bucket a un nom globalement unique
(aucun deux buckets sur tous les comptes AWS ne peuvent partager un nom) et existe dans une
Région spécifique.

**Comment fonctionne S3**

Le modèle est simple, et c'est cette simplicité qui est le point fort.

Vous **téléchargez** un objet vers un bucket. S3 lui donne une **clé** — essentiellement un chemin comme
`menus/restaurant-001/photo-arepa.jpg`. Cette clé identifie de façon unique l'objet
dans le bucket.

Vous **téléchargez** (ou récupérez) l'objet en utilisant le nom du bucket et la clé.

Vous pouvez aussi rendre les objets publiquement accessibles — ce qui signifie que quiconque avec l'URL peut les télécharger.
C'est ainsi que la plupart des sites web servent des images : stockez l'image dans S3, rendez-la publique,
intégrez l'URL dans votre HTML.

Ou vous gardez les objets privés — accessibles uniquement aux requêtes authentifiées. C'est
le bon modèle pour les données clients, les sauvegardes, et tout ce qui est sensible.

S3 n'est pas un système de fichiers. Il n'y a pas de vrais dossiers. Le `/` dans un nom de clé est juste
une convention — S3 traite la clé entière comme une chaîne plate. Mais ça ressemble à des dossiers
et la plupart des outils le présentent comme des dossiers, alors ne vous inquiétez pas de cette distinction en
pratique.

**Pourquoi S3 est différent d'un disque dur ordinaire**

Trois choses rendent S3 fondamentalement différent du stockage de fichiers sur une instance EC2 :

**Durabilité.** AWS conçoit S3 pour 99,999999999 % (onze neuf) de durabilité. Cela signifie
que si vous stockez dix millions d'objets, vous pourriez vous attendre à en perdre un tous les dix
mille ans en raison de pannes matérielles. Ils y parviennent en stockant plusieurs copies
de chaque objet dans au moins trois Zones de disponibilité automatiquement.

**Disponibilité.** S3 est conçu pour être accessible même quand des composants individuels
tombent en panne. Vous ne vous connectez pas à un seul serveur — vous vous connectez à un système distribué
qui contourne les pannes.

**Évolutivité.** S3 contient une quantité essentiellement illimitée de données. Un seul bucket peut contenir
des billions d'objets. Amazon lui-même utilise S3 pour stocker des données à une échelle difficile à
comprendre.

**Versionnage : Le bouton Annuler**

Voici quelque chose que Maya a trouvé en explorant la console S3.

S3 supporte le **versionnage**. Quand vous activez le versionnage sur un bucket, S3 garde chaque
version de chaque objet — y compris les versions précédentes et les versions supprimées.

C'est le bouton annuler pour vos fichiers.

Vous téléchargez une nouvelle photo de menu qui écrase accidentellement l'ancienne ? L'ancienne version est
toujours là. Vous supprimez un fichier par erreur ? Il est récupérable. Vous êtes frappé par un ransomware qui
écrase tous vos fichiers avec des données cryptées ? Avec le versionnage, vous restaurez depuis
avant l'attaque.

« Combien ça coûte de garder toutes ces versions ? » demanda Tom.

Vous payez pour le stockage de chaque version. Si vous avez beaucoup de versions de fichiers volumineux, ça s'accumule.
AWS a des **politiques de cycle de vie** qui suppriment automatiquement les anciennes versions après
un certain temps — nous les couvrons au Chapitre 23 quand nous approfondissons l'optimisation des coûts.

**Contrôle d'accès : Public vs Privé**

Par défaut, tout dans S3 est privé. Seul votre compte AWS peut y accéder.

Vous pouvez rendre des objets individuels publics — ce qui est la façon dont vous serviriez les images de menu aux
visiteurs du site web. Ou vous pouvez garder tout privé et générer des **URLs pré-signées** :
des liens à durée limitée qui permettent à quelqu'un de télécharger un objet spécifique sans avoir besoin de
credentials AWS. Parfait pour permettre à un client de télécharger sa facture pendant 24 heures.

Priya avait des opinions très arrêtées à ce sujet.

« Ne rendez jamais un bucket entièrement public à moins d'avoir consciemment décidé de rendre chaque
objet qu'il contient accessible à l'ensemble d'internet », dit-elle. « L'erreur de sécurité S3 la plus courante
est d'exposer accidentellement un bucket qui contient des données sensibles. »

AWS dispose maintenant d'un paramètre « Bloquer l'accès public » que vous pouvez appliquer au niveau du compte,
forçant tous les buckets à être privés à moins que vous ne le remplaciez explicitement par bucket.

Activez-le. Toujours.

**Classes de stockage S3 : Toutes les données ne sont pas égales**

Toutes les données ne sont pas accédées de façon égale.

Vos photos de menus les plus populaires sont récupérées des dizaines de fois par seconde. Vos logs d'il y a
trois ans sont accédés peut-être une fois par an, si tant est. S3 reconnaît cela et offre
différentes **classes de stockage** avec différents compromis de performance et de coût.

| Classe de stockage          | Cas d'utilisation                                      | Récupération        | Coût                        |
|-----------------------------|-------------------------------------------------------|---------------------|-----------------------------|
| S3 Standard                 | Données fréquemment accédées                          | Immédiate           | Plus élevé par Go           |
| S3 Standard-IA              | Accès peu fréquent, récupération rapide quand même    | Immédiate           | Moins cher par Go, frais de récupération |
| S3 Glacier Instant          | Archives accédées occasionnellement                   | Immédiate           | Beaucoup moins cher          |
| S3 Glacier Flexible         | Archives rarement accédées                            | Minutes à heures    | Très bas                    |
| S3 Glacier Deep Archive     | Archives de conformité, presque jamais accédées       | Jusqu'à 12 heures  | Le moins cher               |

Nous approfondirons cela au Chapitre 23. Pour l'instant : le concept est que vous pouvez automatiquement
déplacer des objets entre classes de stockage en fonction de leur âge et de leurs schémas d'accès, économisant
significativement sur les données que vous touchez rarement.

## Forces et limites

**Pourquoi S3 est excellent** :

- Durabilité de onze neuf. Vos données sont plus en sécurité dans S3 que dans presque tout autre système.
- Évolutivité illimitée. Vous n'avez jamais besoin de provisionner du stockage — il grandit juste.
- Extrêmement bon marché pour ce qu'il offre (fractions de centime par Go et par mois).
- Intégration native avec presque tous les autres services AWS.
- Supporte l'hébergement de sites web statiques — vous pouvez servir un site web statique complet
  directement depuis S3, sans serveur nécessaire.

**Là où S3 n'est pas le bon choix** :

- S3 n'est pas un système de fichiers. Si votre application a besoin de monter un disque et de l'utiliser comme
  un disque local (lecture, écriture, modification de fichiers en place), S3 est le mauvais outil.
  Utilisez EFS (Elastic File System, Chapitre 6) ou EBS à la place.
- S3 a une latence notablement plus élevée qu'un disque local. Pour les bases de données ou
  les applications qui nécessitent un I/O rapide et aléatoire, le stockage par blocs (EBS, Chapitre 6)
  est approprié.
- Les grands transferts de données vers S3 sont gratuits. Les grands transferts de données *hors* de S3 coûtent de l'argent.
  C'est une surprise de facturation courante — nous l'abordons au Chapitre 30.

## Résumé

- **Amazon S3** est le stockage d'objets — un endroit pour stocker des fichiers (appelés objets) dans
  des conteneurs nommés (appelés buckets).
- S3 est conçu pour une durabilité de onze neuf en stockant automatiquement des copies de
  chaque objet dans au moins trois Zones de disponibilité.
- Les fichiers stockés sur les instances EC2 sont liés au cycle de vie de cette instance. Les fichiers importants
  appartiennent à S3, pas au serveur.
- Le **versionnage** préserve les versions précédentes des objets — votre bouton annuler.
- Par défaut, S3 est privé. Activez « Bloquer l'accès public » au niveau du compte.
- S3 a plusieurs **classes de stockage** pour différents schémas d'accès et coûts.
  Les classes d'accès peu fréquent sont beaucoup moins chères mais facturent des frais de récupération.

## Conseils pour l'examen

*Domaine SAA-C03 3 — Tâche 3.1 (solutions de stockage performantes)*

- **S3 est du stockage d'objets, pas du stockage par blocs.** Quand un scénario d'examen a besoin d'un
  système de fichiers que plusieurs serveurs peuvent monter, c'est EFS. Quand il a besoin d'un disque
  pour une seule instance EC2, c'est EBS. Quand il a besoin de stocker des fichiers, des sauvegardes,
  des images, ou des données accédées via HTTP — c'est S3.
- **Durabilité de onze neuf** signifie que S3 réplique les données dans plusieurs AZ
  automatiquement. Vous ne configurez pas ça — c'est le comportement par défaut.
- **S3 est Régional**, mais accessible mondialement. Les buckets existent dans une Région spécifique,
  mais vous pouvez y accéder de partout.
- Les **URLs pré-signées** permettent un accès à durée limitée aux objets privés. Schéma courant :
  votre application génère une URL pré-signée valide 15 minutes, la donne à l'utilisateur, l'utilisateur télécharge
  le fichier directement depuis S3.
- **S3 Standard-IA** a une durée minimale de facturation du stockage (30 jours). Ne l'utilisez pas
  pour des données que vous supprimerez rapidement. L'examen teste si vous connaissez les compromis
  entre classes de stockage.
- **Arbre de décision des classes de stockage** : *fréquemment accédé* → S3 Standard ; *peu fréquemment accédé mais nécessite une récupération rapide* → S3 Standard-IA ; *archive accédée occasionnellement* → S3 Glacier Instant Retrieval ; *archive rarement accédée* → S3 Glacier Flexible Retrieval ; *archive de conformité, presque jamais accédée* → S3 Glacier Deep Archive. Quand un scénario mentionne « optimisation des coûts » et « accès peu fréquent », Standard-IA est presque toujours la réponse. Quand il mentionne « conformité » ou « rétention de sept ans », pensez Glacier Deep Archive.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce qu'un objet S3 ? Qu'est-ce qu'un bucket S3 ? Pourquoi stocker des fichiers
dans S3 est-il mieux que de les stocker sur le disque local d'une instance EC2 ?

*(Indice : Pensez à ce qui arrive aux fichiers sur une instance EC2 si l'instance est
terminée. Que fait S3 différemment ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une société de médias produit des vidéos documentaires. Elle doit stocker les séquences
originales en 4K (accédées fréquemment pendant la production), les montages finaux édités (accédés mensuellement
pour la distribution), et les masters d'archives (conservés indéfiniment mais accédés au maximum une fois
par an à des fins de conformité). Elle veut minimiser les coûts de stockage tout en répondant
aux exigences d'accès de chaque niveau.

Quelle stratégie de stockage correspond LE MIEUX à leurs besoins ?

A) Stocker tout le contenu dans S3 Standard pour des performances cohérentes et de la simplicité  
B) Stocker les séquences originales dans S3 Standard, les montages finaux dans S3 Standard-IA, et les archives
   dans S3 Glacier Deep Archive  
C) Stocker tout le contenu sur le stockage d'instances EC2 pour un accès le plus rapide  
D) Stocker tout le contenu dans S3 Glacier Deep Archive pour minimiser les coûts

**Indice 1** : Différents fichiers ont différents schémas d'accès. S3 offre différentes classes de stockage
pour différentes fréquences d'accès. Quelle classe correspond à « accédé fréquemment » ?

**Indice 2** : Les archives accédées « au maximum une fois par an » n'ont pas besoin d'une récupération immédiate.
Quelle classe de stockage est conçue pour l'archivage à long terme au coût minimum ?

**Indice 3** : Faites correspondre la fréquence d'accès de chaque niveau à la classe de stockage appropriée.
Fréquemment accédé = Standard. Mensuel = Standard-IA. Une fois par an = Glacier Deep Archive.

**Réponse** : B

**Explication** : Cette stratégie fait correctement correspondre chaque niveau de données à la classe de stockage
S3 appropriée. Les séquences originales fréquemment accédées restent dans Standard pour
un accès immédiat sans frais de récupération. Les montages finaux accédés mensuellement vont dans Standard-IA
(coût de stockage plus bas, frais de récupération abordables). Les archives accédées une fois par an vont dans
Glacier Deep Archive pour le coût de stockage le plus bas possible.

**Pourquoi pas A ?** Stocker tout dans Standard est simple mais coûteux. Vous payez
des tarifs premium pour du contenu d'archive auquel vous accédez rarement.

**Pourquoi pas C ?** Le stockage d'instances EC2 est éphémère et inadapté au stockage de médias à long terme.
Si l'instance est terminée, tout le contenu est perdu.

**Pourquoi pas D ?** Glacier Deep Archive a des temps de récupération allant jusqu'à 12 heures. Stocker
des séquences de production fréquemment accédées là-dedans rendrait le travail de production impossible.

*Domaine SAA-C03 3 — Tâche 3.1 / Domaine 4 — Tâche 4.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus stocke des photos de commandes téléchargées par les clients dans S3. Une réglementation de protection des données
exige que les photos des clients soient conservées 7 ans mais peuvent être supprimées après cela.
L'équipe veut aussi minimiser le coût de stockage des anciennes photos des années précédentes.

Concevez une stratégie de stockage S3 pour cette exigence. Quelles classes de stockage utiliseriez-vous,
et quand effectueriez-vous la transition entre elles ? Que feriez-vous concernant l'exigence de suppression ?

*(Indice : Pensez aux politiques de cycle de vie. Il n'y a pas de réponse unique correcte — raisonnez
sur les compromis coût vs temps de récupération.)*

## Scène post-générique

Leo a migré les photos de menus vers S3 cet après-midi. Huit cents objets, stockés en toute sécurité
dans trois Zones de disponibilité, avec le versionnage activé.

« Ils sont en réalité plus en sécurité maintenant qu'avant », dit-il, avec une certaine satisfaction.

« Ils ont toujours été plus en sécurité dans S3 », dit Priya. « On a juste attendu d'avoir
construit le problème avant de le corriger. »

Leo l'accepta.

Le lendemain matin, Tom arriva avec un imprimé. La facture AWS, annotée au stylo rouge.

« On a un problème de base de données », dit-il. « On fait tourner notre base de données de commandes
sur la même instance EC2 que le serveur web. Et notre base de données de menus. Et nos enregistrements clients. »

Il s'arrêta.

« Tout est sur la même machine. Une machine. Toutes nos données. »

Maya regarda l'imprimé. Puis Tom. Puis le plafond.

« Et si cette machine tombe en panne ? »

Tom pointa le stylo rouge sur l'annotation.

Dans le prochain chapitre : la différence entre un disque dur que vous louez et un classeur que tout le bureau partage.
