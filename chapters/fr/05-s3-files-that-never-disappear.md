# Chapitre 5 : Le classeur qui vit dans le cloud

Leo nettoyait l'instance EC2 à neuf heures du matin quand il a trouvé le dossier.

Le bureau était calme. Maya n'était pas encore arrivée. Le café était encore en train de couler. Par la fenêtre, les premiers travailleurs défilaient au compte-gouttes. Leo avait ses écouteurs et faisait défiler les répertoires quand il s'est arrêté.

Huit cents fichiers. Toutes des photos de menus. Toutes sur une seule machine sans sauvegarde.

L'instance EC2 où tournait l'application Nimbus avait été mise à niveau une fois depuis la panne de douze minutes, mais le stockage des photos n'avait jamais bougé. Chaque arepa croustillant, chaque assiette de saumon grillé, chaque bol de salade parfaitement dressé — posés sur une seule machine virtuelle dont ils avaient déjà prouvé qu'elle pouvait tomber sans préavis.

Et si cette machine était un jour redémarrée, redimensionnée ou remplacée ?

Disparues.

« Combien de photos les clients ont-ils téléchargées jusqu'à présent ? » demanda Maya, en arrivant.

Leo se retourna. « Environ huit cents. »

« Et que se passe-t-il avec ces huit cents photos si on redémarre le serveur ? »

Une autre de ces pauses significatives de Leo.

Ce chapitre parle de l'endroit où les fichiers appartiennent vraiment dans le cloud.

**Le problème du stockage de fichiers « sur le serveur »**

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

Leo n'avait pas envisagé ce qui se passait avec plusieurs serveurs. Il l'a mentionné en passant à Priya.

« Attends — comment le problème des photos fonctionnerait-il avec deux serveurs ? » demanda Priya.

« Qu'est-ce que tu veux dire ? »

« Si on a un Serveur A et un Serveur B derrière un répartiteur de charge », dit Priya, « et qu'un client télécharge une photo — sa requête va au Serveur A, n'est-ce pas ? Donc la photo est sauvegardée sur le disque du Serveur A. Maintenant sa prochaine requête va au Serveur B. Le Serveur B n'a pas la photo. Que voit le client ? »

Leo ouvrit la bouche. Puis la referma.

« Une image cassée », dit-il finalement.

« Ou une erreur 404 », dit Priya. « Ou, si l'application essaie de la charger et plante, une page d'erreur. »

Elle esquissa le plan du répartiteur de charge sur le tableau blanc — ajouter un deuxième serveur était déjà sur la feuille de route. Au moment où ça arriverait, chaque téléchargement de photo deviendrait un pile ou face : téléchargée sur le Serveur A, possiblement servie depuis le Serveur B, photo manquante, client confus.

« On l'aurait débogué pendant une semaine avant de comprendre ce qui n'allait pas », dit Leo.

« A-t-on réfléchi à ce qui se passe quand on activera Auto Scaling et qu'on aura soudain trois ou quatre serveurs ? » demanda Priya. « On aurait des photos manquantes constamment. »

C'est une catégorie de bug qui n'apparaît pas dans les tests unitaires. Il n'apparaît qu'en production, sous charge, quand le vrai trafic est réparti sur plusieurs serveurs. La correction consiste à arrêter complètement de stocker des fichiers sur les serveurs.

Il existe un meilleur modèle. AWS l'a construit en 2006, et c'est toujours l'un des services cloud les plus
utilisés dans le monde.

**Le disque dur qui vit en ligne**

Imaginez un disque dur qui vit sur internet — un qui s'agrandit pour contenir autant que
vous en aurez jamais besoin, et qui ne vous facture que ce que vous utilisez réellement. Vous ne le provisionnez jamais.
Vous ne vous inquiétez jamais de manquer d'espace. Si vous mettez huit cents photos aujourd'hui
et huit millions l'an prochain, rien ne change de votre côté à part la ligne de la facture.

C'est ce qu'AWS offre. Ils l'appellent **Amazon S3** — Simple Storage Service.

S3 est le service de stockage d'objets d'AWS. Ce n'est pas tout à fait comme un système de fichiers, ni tout à fait
comme une base de données. Il stocke des fichiers — appelés objets — dans des conteneurs nommés appelés buckets.
Le modèle est simple, et c'est cette simplicité qui est le point fort.

Le concept clé dans S3 est l'**objet**.

Un objet est n'importe quel fichier : une photo, une vidéo, un PDF, un CSV, une sauvegarde, un fichier log. S3
ne se soucie pas du type ou de la structure. Il stocke des octets et vous les rend quand
vous demandez.

Les objets vivent dans des **buckets**. Un bucket est comme un dossier de premier niveau — un
conteneur nommé dans S3 qui contient vos objets. Chaque bucket a un nom globalement unique
(aucun deux buckets sur tous les comptes AWS ne peuvent partager un nom) et existe dans une
Région spécifique.

**Comment fonctionne S3**

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

Il y a quelques caractéristiques opérationnelles de S3 qui comptent en pratique mais ne sont pas
évidentes d'après la description :

**Immuabilité des objets** : Les objets S3 ne sont pas modifiés sur place. Si vous mettez à jour un fichier, vous
téléchargez une nouvelle version de l'objet avec la même clé. S3 remplace l'ancien objet par
le nouveau (ou, avec le versionnage activé, garde les deux). Contrairement à une base de données où vous
faites un `UPDATE` sur une ligne, les objets S3 sont en écriture unique, lecture multiple. Pour les fichiers texte et documents
que vous modifiez fréquemment, c'est bien — téléchargez simplement la nouvelle version. Pour les très gros fichiers
où vous ne voulez mettre à jour qu'une partie du contenu, le modèle d'objet de S3 signifie que vous
re-téléchargez le fichier entier à chaque fois.

**Cohérence forte en lecture après écriture** : Depuis décembre 2020, S3 fournit une cohérence forte
pour tous les objets — les nouvelles écritures sont immédiatement visibles pour les lectures suivantes.
Avant 2020, S3 avait une cohérence à terme pour certaines opérations, ce qui causait des bugs subtils
dans les applications qui écrivaient un objet et essayaient immédiatement de le lire. L'amélioration du modèle
de cohérence a éliminé cette catégorie de bugs.

**URLs d'objets** : Chaque objet S3 a une URL. Pour un objet public, elle ressemble à :
`https://bucket-name.s3.region.amazonaws.com/key/path`. Pour les objets privés, vous
pouvez générer des URLs pré-signées qui incluent des informations d'authentification et expirent après
un temps configuré. Les deux formats d'URL sont la façon dont les applications et les navigateurs récupèrent réellement
les objets — il n'y a pas de protocole propriétaire impliqué.

**Pas de répertoires à créer** : Parce que S3 n'a pas de vrais dossiers, il n'y a pas d'opérations
de création de répertoires. Vous téléchargez simplement un objet avec une clé qui inclut le préfixe
de chemin. Le « dossier » apparaît automatiquement dans la console quand des objets avec ce préfixe
existent, et disparaît automatiquement quand tous les objets avec ce préfixe sont supprimés.

**Pourquoi S3 est différent d'un disque dur ordinaire**

Trois choses rendent S3 fondamentalement différent du stockage de fichiers sur une instance EC2 :

**Durabilité.** AWS conçoit S3 pour 99,999999999 % (onze neuf) de durabilité. Cela signifie
que si vous stockez dix millions d'objets, vous pourriez vous attendre à en perdre un tous les dix
mille ans en raison de pannes matérielles. Ils y parviennent en stockant plusieurs copies
de chaque objet dans au moins trois Zones de disponibilité automatiquement.

Mais la durabilité protège contre les pannes matérielles — pas contre une suppression accidentelle de votre part. C'est à ça que sert le versionnage.

Il y a une distinction importante entre **durabilité** et **disponibilité**. La durabilité concerne le fait que vos données existent toujours. La disponibilité concerne le fait que vous pouvez y accéder en ce moment. S3 Standard offre 99,999999999 % de durabilité et 99,99 % de disponibilité. Le chiffre de durabilité est presque incompréhensiblement élevé ; le chiffre de 99,99 % de disponibilité est une *cible de conception* — environ 52 minutes d'indisponibilité par an. Le *SLA* contractuel est en réalité plus bas (99,9 % par mois), et le manquer vous rapporte des crédits de service, pas du temps de fonctionnement. En pratique, la disponibilité de S3 est bien supérieure à l'un ou l'autre chiffre — mais il vaut la peine de comprendre que la durabilité et la disponibilité sont des garanties distinctes, et que les cibles de conception et les SLA sont des promesses distinctes.

**Disponibilité.** S3 est conçu pour être accessible même quand des composants individuels
tombent en panne. Vous ne vous connectez pas à un seul serveur — vous vous connectez à un système distribué
qui contourne les pannes.

**Évolutivité.** S3 contient une quantité essentiellement illimitée de données. Un seul bucket peut contenir
des billions d'objets. Amazon lui-même utilise S3 pour stocker des données à une échelle difficile à
comprendre. Les plus gros buckets S3 du monde contiennent des exaoctets de données — des millions de
téraoctets. Vous ne gérez pas cette échelle ; vous téléchargez simplement des objets et S3 gère
tout en dessous.

**Coût.** S3 Standard coûte environ 0,023 $ par Go par mois au moment de l'écriture.
Pour les huit cents photos de menus de Nimbus à une moyenne de 2 Mo chacune, ça fait 1,6 Go de
stockage — environ 0,04 $ par mois. Même à 800 000 photos, vous êtes à 37 $ par
mois pour le stockage. Le coût du même stockage sur un volume EBS serait d'environ
128 $ par mois, avec un plafond fixe qui exigeait une extension avant de pouvoir en ajouter plus.
S3 grandit automatiquement et facture proportionnellement. EBS a une taille fixe et un coût fixe.

**Versionnage : Le bouton Annuler**

Voici quelque chose que Maya a trouvé en explorant la console S3.

S3 supporte le **versionnage**. Quand vous activez le versionnage sur un bucket, S3 garde chaque
version de chaque objet — y compris les versions précédentes et les versions supprimées.

C'est le bouton annuler pour vos fichiers.

Priya voulait le tester avant de lui faire confiance. Elle a téléchargé une photo de menu dans le bucket, puis a téléchargé une nouvelle version avec le mauvais fichier — une image entièrement noire qu'elle a créée en trente secondes.

Elle a ouvert la console S3, cliqué sur « Afficher les versions », et trouvé les deux : la mauvaise version (actuelle) et l'originale (précédente). Elle a restauré la version précédente en la recopiant comme nouvelle version actuelle.

« Ça marche », dit-elle.

« Combien ça coûte de garder toutes ces versions ? » demanda Tom.

Vous payez pour le stockage de chaque version. Si vous avez beaucoup de versions de fichiers volumineux, ça
s'accumule. AWS a des **politiques de cycle de vie** qui suppriment automatiquement les anciennes versions après
un certain temps — nous les couvrons au Chapitre 23 quand nous approfondissons l'optimisation des coûts.

« Donc on active le versionnage mais on définit une règle de cycle de vie pour supprimer les anciennes versions après trente jours », dit Priya. « Comme ça on a une fenêtre de récupération sans payer pour stocker chaque version éternellement. »

Tom nota le chiffre. Le coût de stockage de trente jours de versions était acceptable.

**Notifications d'événements S3 : Des fichiers qui font des choses**

Leo regardait les photos de menus sous un autre angle.

« En ce moment », dit-il, « quand un restaurant télécharge une photo, on stocke l'original en pleine résolution. Certaines font quatre mille par trois mille pixels. Chaque fois qu'un client charge la page de menu sur un téléphone, on sert une image de quatre mégaoctets. »

« Combien ça coûte en bande passante ? » demanda Tom.

Leo afficha les chiffres de transfert de données sur la facture. La réponse était « plus que ça ne devrait ».

S3 a une fonctionnalité appelée **Notifications d'événements**. Quand un objet est téléchargé vers un bucket, S3 peut automatiquement déclencher un autre service — comme Lambda, le service de calcul serverless que nous couvrons au Chapitre 20. Ce déclencheur peut exécuter du code en réponse au téléchargement sans aucune intervention manuelle.

La solution Nimbus : chaque fois qu'une photo est téléchargée vers le bucket de photos brutes, une notification d'événement S3 déclenche une fonction Lambda. La fonction Lambda lit la photo originale, génère une miniature de 400 pixels de large, et l'enregistre dans un bucket de photos traitées. L'application destinée aux clients sert la miniature au lieu de l'original.

Le pipeline :

1. Le restaurant télécharge une photo originale de 4 Mo vers `nimbus-photos-raw/restaurant-001/arepa.jpg`
2. S3 déclenche une notification d'événement
3. La fonction Lambda lit l'original, génère une miniature 400x300
4. Lambda enregistre la miniature vers `nimbus-photos-processed/restaurant-001/arepa.jpg`
5. Le client charge le menu, l'application sert la miniature de 40 Ko au lieu de l'original de 4 Mo

Le résultat : 99 % de réduction de la bande passante des images. Des chargements de page plus rapides. Une ligne de transfert de données plus petite sur la facture. Les originaux sont préservés dans le bucket brut, donc si Nimbus veut un jour générer des versions à plus haute résolution, le matériau source est là.

« Ça tourne automatiquement ? » demanda Maya.

« Chaque fois que quelqu'un télécharge une photo », dit Leo. « On n'y touche jamais. »

Ce schéma — un traitement piloté par événements déclenché par des événements de stockage — est l'un des schémas les plus courants et puissants de l'architecture cloud moderne. Nous y revenons en profondeur au Chapitre 20.

**Réplication inter-régions : Quand une seule copie ne suffit pas**

Priya a soulevé une question de conformité à la fin de la semaine.

« Si Nimbus s'étend pour servir des restaurants dans l'UE », dit-elle, « et que ces restaurants téléchargent des photos — ces photos sont-elles stockées dans notre bucket `us-west-2` ? »

« Oui », dit Leo.

« Et le RGPD a-t-il quelque chose à dire sur l'endroit où ces données sont stockées ? »

Oui. Les dispositions de transfert de données du RGPD signifient que les données personnelles concernant des résidents de l'UE peuvent exiger un stockage dans l'UE ou dans une juridiction avec une protection des données adéquate.

La réponse de S3 à cela est la **Réplication inter-régions** (CRR). Quand vous activez la CRR sur un bucket, chaque nouvel objet téléchargé est automatiquement répliqué vers un bucket dans une autre Région. Vous configurez le bucket source, le bucket de destination, et le rôle IAM qui donne à S3 la permission d'effectuer la réplication.

Quand l'expansion dans l'UE aura lieu, le plan est le suivant : les photos téléchargées par les restaurants de l'UE iront dans un bucket `eu-west-1`, et la CRR les répliquera vers un bucket de sauvegarde dans `eu-central-1` (Francfort) pour la reprise après sinistre. Les données de l'UE restent dans les Régions de l'UE.

« Combien ça coûterait ? » demanda Tom.

Des coûts de transfert et de stockage de données inter-régions s'appliquent — grosso modo le tarif de transfert par Go de la Région source vers la destination, plus le stockage des copies répliquées. Tom a fait le calcul sur le volume de photos UE prévu de Nimbus et a déterminé que ce serait acceptable.

« Et si quelqu'un essaie d'entrer par effraction dans le pipeline de réplication ? » demanda Priya. « Le rôle IAM qui effectue la réplication devrait être limité étroitement — uniquement les actions de réplication S3, uniquement sur les buckets spécifiques. »

Elle écrivit cette exigence dans le plan d'expansion.

**Téléchargement en plusieurs parties et le problème des téléchargements incomplets**

Tom a trouvé une ligne inattendue sur la facture AWS.

« On paie pour du stockage dans S3 », dit-il, « mais le montant est plus élevé que ce à quoi je m'attendrais d'après le nombre de photos qu'on a. »

Leo a enquêté. Il a trouvé une catégorie dans le rapport S3 Storage Lens : **téléchargements en plusieurs parties incomplets**.

Quand S3 télécharge un fichier plus grand qu'une certaine taille, il utilise le **téléchargement en plusieurs parties** (multipart upload) : le fichier est divisé en parties, chaque partie est téléchargée séparément, puis les parties sont assemblées en l'objet final. Cela rend les gros téléchargements plus fiables — si une partie échoue, seule cette partie doit être réessayée, pas le fichier entier.

Mais si un téléchargement en plusieurs parties est commencé puis abandonné — l'utilisateur a fermé le navigateur, le réseau a lâché, l'application a planté — les parties partielles restent dans S3, accumulant des frais de stockage. Elles ne sont pas visibles comme des objets terminés, mais elles sont facturées comme du stockage.

« Combien ? » demanda Tom.

« Environ 12 $ par mois », dit Leo. « De téléchargements partiels qui n'ont jamais été terminés. »

La correction : une **règle de cycle de vie** S3 qui supprime automatiquement les téléchargements en plusieurs parties incomplets après sept jours. Tout téléchargement qui ne s'est pas terminé en une semaine est abandonné, et les parties partielles sont nettoyées.

Tom a ajouté la règle de cycle de vie cet après-midi-là. Le frais de 12 $/mois a disparu en quelques jours.

« Ça fait 144 $ par an », dit Tom en regardant sa feuille de calcul. « Pour rien. »

« J'ai déjà mis en place un test de charge qui utilisait des téléchargements en plusieurs parties », dit Leo. « Oh. » Une pause. « C'est probablement la plupart d'entre eux. J'ai oublié de nettoyer quand le test était fini. »

Tom l'écrivit quand même.

**Contrôle d'accès : Public vs Privé**

Par défaut, tout dans S3 est privé. Seul votre compte AWS peut y accéder.

Vous pouvez rendre des objets individuels publics — ce qui est la façon dont vous serviriez les images de menu aux
visiteurs du site web. Ou vous pouvez garder tout privé et générer des **URLs pré-signées** :
des liens à durée limitée qui permettent à quelqu'un de télécharger un objet spécifique sans avoir besoin de
credentials AWS. Parfait pour permettre à un client de télécharger sa facture pendant 24 heures.

Priya avait des opinions très arrêtées à ce sujet.

« Et si quelqu'un essaie d'entrer par effraction via un bucket mal configuré ? » dit-elle. « Ne rendez jamais un bucket entièrement public à moins d'avoir consciemment décidé de rendre chaque
objet qu'il contient accessible à l'ensemble d'internet. L'erreur de sécurité S3
la plus courante est d'exposer accidentellement un bucket qui contient des données sensibles. »

AWS dispose maintenant d'un paramètre « Bloquer l'accès public » que vous pouvez appliquer au niveau du compte,
forçant tous les buckets à être privés à moins que vous ne le remplaciez explicitement par bucket.

Activez-le. Toujours.

L'histoire derrière cela : avant qu'AWS n'ajoute le Blocage de l'accès public au niveau du compte, l'incident
de sécurité S3 le plus courant était de rendre accidentellement un bucket public. Un développeur créait
un bucket pour des tests, cochait la case « public » par commodité, ajoutait quelques fichiers, dont
quelques-uns d'autres dossiers auxquels il n'avait pas pensé, puis l'oubliait. Le bucket
restait là, accessible publiquement, pendant des mois. Dans quelques cas médiatisés, le « bucket de
test oublié » contenait des données clients, des documents internes, ou des credentials.

Le Blocage de l'accès public au niveau du compte est une protection contre cela. Même si un développeur
configure accidentellement un bucket pour qu'il soit public, le paramètre au niveau du compte le remplace.
Vous devez explicitement désactiver le paramètre au niveau du compte avant qu'un bucket puisse devenir
public — ce qui crée un ralentisseur délibéré qui prévient les accidents.

Nimbus avait le Blocage de l'accès public activé au niveau du compte. Alors comment les images de menu
qui devaient être accessibles publiquement seraient-elles servies ? Le schéma standard — un que Nimbus
adopterait plus tard, au Chapitre 13 — est de mettre un CDN comme CloudFront devant le
bucket avec une politique Origin Access Control : le CDN peut récupérer des objets d'un bucket
S3 privé, mais personne ne peut accéder au bucket directement. Ce schéma est plus sécurisé qu'un
bucket public et permet à la mise en cache du CDN de réduire les coûts de requêtes S3.

« Attends — mais *pourquoi* ferions-nous comme ça ? » demanda Maya. « Les images sont publiques de toute façon,
alors pourquoi est-ce que ça importe si le bucket est public ? »

« Parce qu'un bucket public signifie que n'importe qui peut énumérer ce qu'il contient », dit Priya. « Ils
peuvent lister tous les objets dans le bucket. Avec CloudFront devant, ils ne voient que les
URLs qu'on expose dans l'application. Le bucket lui-même reste privé. »

Maya ajouta « énumérer » à son modèle mental des surfaces d'attaque.

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

Il y a aussi **S3 Intelligent-Tiering** — une classe de stockage qui déplace automatiquement les
objets entre les niveaux d'accès fréquent et peu fréquent en fonction des schémas d'accès observés.
Vous payez de petits frais de surveillance par objet par mois, et S3 gère le
classement automatiquement. C'est utile quand vous n'êtes pas sûr de quels objets seront
accédés fréquemment et lesquels ne le seront pas — le service apprend le schéma et optimise
en conséquence.

L'approche de Tom était plus manuelle : « Je veux savoir où va chaque dollar. » Il a choisi
des règles de cycle de vie explicites plutôt que l'Intelligent-Tiering, parce que les règles explicites sont prévisibles
et auditables. Après six mois d'exploitation du stockage S3 de Nimbus, il avait une image claire
des schémas d'accès et pouvait définir des règles de cycle de vie qui déplaçaient les objets vers Standard-IA
après 30 jours et vers Glacier Flexible Retrieval après 180 jours.

Les économies totales de stockage de la gestion du cycle de vie la première année : environ
340 $. Pas de quoi changer la vie, mais réel — et le schéma se répète sur des dizaines de buckets
dans tout compte AWS sérieux.

« C'est presque un vol aller-retour », dit Maya.

« C'est une bonne pratique d'ingénierie », dit Tom. Il le mit dans la feuille de calcul.

Il y a un piège dans la sélection de la classe de stockage qui attrape beaucoup d'équipes : la **durée
minimale de stockage**. S3 Standard-IA a une durée minimale de stockage de 30 jours — si vous
stockez un objet dans Standard-IA et le supprimez après 15 jours, vous payez quand même pour 30 jours.
Glacier Flexible Retrieval a un minimum de 90 jours. Glacier Deep Archive a un minimum
de 180 jours.

Pour les objets qui sont supprimés fréquemment ou ont une courte durée de vie, ces minimums rendent
les classes IA et Glacier plus chères que Standard, pas moins. Avant de passer à une
classe de stockage moins chère, vérifiez que les objets y vivront réellement assez longtemps pour
que les économies dépassent les pénalités de durée minimale.

## Forces et limites

**Pourquoi S3 est excellent** :

- Durabilité de onze neuf. Vos données sont plus en sécurité dans S3 que dans presque tout autre système.
- Évolutivité illimitée. Vous n'avez jamais besoin de provisionner du stockage — il grandit juste.
- Extrêmement bon marché pour ce qu'il offre (fractions de centime par Go et par mois).
- Intégration native avec presque tous les autres services AWS.
- Supporte l'hébergement de sites web statiques — vous pouvez servir un site web statique complet
  directement depuis S3, sans serveur nécessaire.
- Traitement piloté par événements : les notifications d'événements S3 déclenchent Lambda, SQS ou SNS
  automatiquement quand des objets sont créés ou supprimés, permettant de puissants pipelines de
  traitement sans interrogation ni tâches planifiées.
- Réplication inter-régions pour la résidence des données de conformité et la reprise après sinistre.

**Là où S3 n'est pas le bon choix** :

- S3 n'est pas un système de fichiers. Si votre application a besoin de monter un disque et de l'utiliser comme
  un disque local (lecture, écriture, modification de fichiers en place), S3 est le mauvais outil.
  Utilisez EFS (Elastic File System, Chapitre 6) ou EBS à la place.
- S3 a une latence notablement plus élevée qu'un disque local. Pour les bases de données ou
  les applications qui nécessitent un I/O rapide et aléatoire, le stockage par blocs (EBS, Chapitre 6)
  est approprié.
- Le transfert de données *vers* S3 est exempt de frais de bande passante — mais pas entièrement gratuit :
  chaque téléchargement est une requête PUT, et S3 facture par requête. Télécharger des millions de
  petits objets peut coûter plus en frais de requêtes qu'en stockage. Le transfert de données *hors*
  coûte de l'argent par Go. Les deux sont des surprises de facturation courantes — nous les abordons au Chapitre 30.
- S3 n'est pas une base de données. Vous pouvez stocker et récupérer des objets par clé, mais vous ne pouvez pas
  interroger les objets par leur contenu, exécuter des agrégations, ou faire des opérations relationnelles.
  Si vous avez besoin d'interroger le contenu des données stockées (et pas seulement de le récupérer par nom),
  vous avez besoin d'une base de données ou d'un service comme Athena (Chapitre 26) qui peut interroger les objets S3
  en utilisant SQL.
- Le versionnage des objets stocke des coûts qui s'accumulent. Chaque version précédente de chaque
  objet versionné est facturée comme du stockage. Les règles de cycle de vie qui font expirer les anciennes versions
  ne sont pas optionnelles — elles font partie de la stratégie de gestion des coûts pour tout bucket
  avec le versionnage activé.

**Comment les objets S3 sont chiffrés**

« Et si quelqu'un essaie d'entrer par effraction ? » demanda Priya, de façon prévisible, le jour où les photos ont été mises en ligne. « Ces objets sont-ils chiffrés au repos ? »

Ils l'étaient — et ça vaut la peine de le comprendre, car le chiffrement S3 est l'un des sujets les plus testés à l'examen. Chaque objet téléchargé vers S3 est chiffré au repos par défaut. La question est *qui détient la clé* :

**SSE-S3 (le défaut)** : S3 chiffre chaque objet avec des clés que S3 gère lui-même, en utilisant AES-256. Vous ne faites rien, ne configurez rien, ne payez rien. Depuis janvier 2023, c'est automatique sur chaque bucket. Pour la plupart des données, c'est suffisant.

**SSE-KMS** : S3 chiffre les objets avec une clé KMS — soit la clé managée AWS `aws/s3`, soit une clé managée par le client que vous contrôlez (le Chapitre 16 couvre KMS en profondeur). Ce que vous gagnez : une piste d'audit dans CloudTrail de chaque utilisation de clé, la capacité de contrôler exactement qui peut déchiffrer via la politique de clé, et la capacité de révoquer l'accès en désactivant la clé. Ce que vous payez : des frais d'API KMS par requête. À des taux de requêtes élevés, activez les **S3 Bucket Keys** — S3 dérive une clé de niveau bucket à courte durée de vie de votre clé KMS, réduisant les appels d'API KMS (et le coût) jusqu'à 99 %.

**SSE-C** : Vous fournissez votre propre clé de chiffrement *à chaque requête*. AWS l'utilise en mémoire et ne la stocke jamais. Pour les organisations dont les règles de conformité disent qu'AWS ne doit jamais détenir la clé. Exigeant sur le plan opérationnel — perdez la clé, perdez les données.

Le schéma d'examen : « chiffrement avec une piste d'audit de l'utilisation des clés » ou « contrôler qui peut déchiffrer » → SSE-KMS. « L'entreprise doit gérer ses propres clés et AWS ne doit jamais les stocker » → SSE-C. « Chiffrement au repos sans charge de gestion » → SSE-S3 (déjà activé).

**S3 Object Lock : Écriture unique, lecture multiple**

Certaines données doivent être *impossibles* à supprimer — pas protégées par une politique, structurellement immuables. Les enregistrements de transactions financières, les logs d'audit, les preuves juridiques. **S3 Object Lock** rend les objets impossibles à supprimer et à modifier pendant une période de rétention, même par les administrateurs. Il nécessite le versionnage, et il existe en deux modes que l'examen adore opposer : le **mode gouvernance** (les utilisateurs avec une permission spéciale peuvent quand même contourner le verrou) et le **mode conformité** (personne ne peut raccourcir la rétention ni supprimer l'objet — pas même l'utilisateur root — jusqu'à l'expiration de la période). Les expressions réglementaires comme « stockage WORM » ou « SEC Rule 17a-4 » sont des déclencheurs d'examen pour Object Lock en mode conformité.

**S3 Transfer Acceleration : Des téléchargements rapides de loin**

Quand les utilisateurs téléchargent de gros fichiers vers un bucket depuis l'autre bout du monde, la partie lente est le long chemin internet public vers la région du bucket. **S3 Transfer Acceleration** donne au bucket un endpoint spécial qui achemine les téléchargements vers l'emplacement Edge AWS le plus proche, puis les transporte sur l'épine dorsale privée d'AWS jusqu'au bucket. Déclencheur d'examen : « des utilisateurs partout dans le monde téléchargent de gros fichiers vers un bucket central ; les téléchargements sont lents » → Transfer Acceleration (souvent associé au téléchargement en plusieurs parties). Notez la direction : Transfer Acceleration concerne l'entrée des données *vers* S3 ; CloudFront concerne le service des données *vers l'extérieur*.

Une autre classe de stockage qui vaut la peine d'être connue maintenant : **S3 One Zone-IA** — comme Standard-IA mais stockée dans une seule Zone de disponibilité, environ 20 % moins chère, pour les données peu fréquemment accédées que vous pourriez recréer si cette AZ était perdue (miniatures, rapports regénérables). C'est un distracteur d'examen standard ; le Chapitre 23 couvre tout le spectre des classes de stockage.


## Résumé

Huit cents photos sur une seule instance, c'était le problème. S3 l'a résolu — mais S3 est plus qu'un endroit où ranger des fichiers. C'est un stockage d'objets durable, évolutif, accessible mondialement, avec son propre modèle d'accès, ses classes de stockage, ses politiques de cycle de vie, et son système d'événements. Comprendre ce pour quoi S3 est bon, et ce qu'il n'est délibérément pas, façonne chaque décision de stockage que l'équipe prendrait à partir de maintenant.

- **Amazon S3** est du stockage d'objets — des fichiers (objets) dans des conteneurs nommés (buckets). Il stocke des copies dans au moins trois Zones de disponibilité pour une durabilité de onze neuf. S3 n'est pas un système de fichiers : utilisez EFS pour les montages partagés, EBS pour le stockage par blocs sur une seule instance.
- Les fichiers stockés sur les instances EC2 sont liés au cycle de vie de cette instance, causant des bugs de photos manquantes quand le trafic se répartit sur plusieurs serveurs. S3 résout cela en étant indépendant de toute instance.
- Le **versionnage** préserve les versions précédentes des objets. Les **règles de cycle de vie** automatisent les transitions entre classes de stockage et nettoient les téléchargements en plusieurs parties incomplets qui accumuleraient autrement des frais de facturation silencieux.
- Par défaut, S3 est privé. Activez « Bloquer l'accès public » au niveau du compte. Servez les objets publics via CloudFront avec Origin Access Control plutôt que de rendre les buckets directement publics.
- Les classes de stockage S3 vous permettent de faire correspondre le coût à la fréquence d'accès — mais surveillez les frais de durée minimale de stockage avant de transférer des objets à courte durée de vie vers les niveaux Accès peu fréquent ou Glacier.

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
- **Arbre de décision des classes de stockage** : *fréquemment accédé* → S3 Standard ; *peu fréquemment accédé mais nécessite une récupération rapide* → S3 Standard-IA ; *archive accédée occasionnellement* → S3 Glacier Instant Retrieval ; *archive rarement accédée* → S3 Glacier Flexible Retrieval ; *archive de conformité, presque jamais accédée* → S3 Glacier Deep Archive.
- **La réplication inter-régions** nécessite que le versionnage soit activé à la fois sur les buckets source et de destination. Les questions d'examen sur la reprise après sinistre ou la souveraineté des données impliquent souvent la CRR.

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

A) Stocker les séquences originales dans S3 Standard, les montages finaux dans S3 Standard-IA, et les archives
   dans S3 Glacier Deep Archive  
B) Stocker tout le contenu dans S3 Standard pour des performances cohérentes et de la simplicité  
C) Stocker tout le contenu sur le stockage d'instances EC2 pour un accès le plus rapide  
D) Stocker tout le contenu dans S3 Glacier Deep Archive pour minimiser les coûts

**Indice 1** : Différents fichiers ont différents schémas d'accès. S3 offre différentes classes de stockage
pour différentes fréquences d'accès. Quelle classe correspond à « accédé fréquemment » ?

**Indice 2** : Les archives accédées « au maximum une fois par an » n'ont pas besoin d'une récupération immédiate.
Quelle classe de stockage est conçue pour l'archivage à long terme au coût minimum ?

**Indice 3** : Faites correspondre la fréquence d'accès de chaque niveau à la classe de stockage appropriée.
Fréquemment accédé = Standard. Mensuel = Standard-IA. Une fois par an = Glacier Deep Archive.

**Réponse** : A

**Explication** : Cette stratégie fait correctement correspondre chaque niveau de données à la classe de stockage
S3 appropriée. Les séquences originales fréquemment accédées restent dans Standard pour
un accès immédiat sans frais de récupération. Les montages finaux accédés mensuellement vont dans Standard-IA
(coût de stockage plus bas, frais de récupération abordables). Les archives accédées une fois par an vont dans
Glacier Deep Archive pour le coût de stockage le plus bas possible.

**Pourquoi pas B ?** Stocker tout dans Standard est simple mais coûteux.

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
