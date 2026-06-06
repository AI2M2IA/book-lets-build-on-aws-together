# Chapitre 24 : La base de données qui grandit avec vous

Imaginez une bibliothèque qui a commencé avec deux étagères et un bibliothécaire. C'était suffisant, pendant un temps. Le bibliothécaire savait où tout se trouvait. Les demandes étaient traitées rapidement. Puis la bibliothèque grandit : dix étagères, vingt, quarante. Le même bibliothécaire, le même bureau, le même catalogue à fiches. Maintenant, trouver quoi que ce soit demande d'attendre. Le bibliothécaire n'est pas lent — il y a juste plus de bibliothèque qu'une seule personne ne peut en servir au rythme d'origine.

La solution n'est pas un bibliothécaire plus rapide. C'est un autre type de bibliothèque.

---

Après la réduction des coûts S3, Tom continua sa revue. Le niveau de base de données était un autre type de problème — pas des données inactives dans la mauvaise classe de stockage, mais un système qui peinait activement sous la charge de six mois de croissance du trafic.

---

Les chiffres n'étaient pas confortables.

Nimbus utilisait RDS PostgreSQL : Multi-AZ, instance db.r6g.large. 340 $/mois.

Leo afficha le tableau de bord des métriques CloudWatch. Les chiffres avaient un schéma.

**DatabaseConnections** : 198 sur un maximum de 200 pendant le pic du vendredi. Deux connexions de la saturation. À 200, les nouvelles tentatives de connexion échoueraient avec « too many connections » — une erreur qui se manifesterait par des HTTP 500 pour les clients commandant le dîner.

**CPUUtilization** : 89 % en pic pendant le rush du dîner du vendredi. L'instance était conçue pour gérer les pics — une db.r6g.large a 2 vCPU et 16 Go de mémoire — mais un CPU soutenu à 89 % signifiait que la base de données était à pleine capacité avant même que l'heure de pointe n'arrive.

**ReadLatency** : 840 millisecondes en P95. Il y a six mois, c'était 180 ms. La dégradation avait été graduelle — 10 à 20 ms par semaine — invisible jusqu'à ce qu'elle soit catastrophique. La semaine avant la revue de Tom, la latence P99 avait franchi une seconde complète. Les clients cliquant sur un menu de restaurant attendaient plus d'une seconde pour que la page se charge.

**FreeStorageSpace** : 18 % du stockage provisionné restant. Au taux de croissance actuel, la base de données manquerait de stockage provisionné dans environ 11 semaines.

« Chacun de ceux-ci est résoluble isolément », dit Leo en regardant le tableau de bord. « Mais on a les quatre en même temps. »

Le pic du nombre de connexions pointait vers des problèmes de pooling de connexions dans l'application — trop de tâches ECS ouvrant leurs propres connexions à la base de données. Le problème de CPU pointait vers des requêtes coûteuses. Le problème de latence et le problème de CPU étaient presque certainement le même problème : une requête lente s'exécutant trop souvent.

« Attends — mais *pourquoi* sommes-nous à 198 connexions ? » demanda Maya. « On a trois tâches ECS. Comment a-t-on près de 200 connexions à la base de données ? »

Chaque tâche ECS utilisait SQLAlchemy avec une taille de pool par défaut de 5 connexions plus un débordement de 10. Trois tâches × 15 connexions potentielles = 45 connexions de l'application. Les 153 autres provenaient des fonctions Lambda d'analytique, des travailleurs de tâches en arrière-plan, du travail ETL Glue, des connexions locales de l'équipe de développement via l'hôte bastion, et de plusieurs connexions qui avaient été ouvertes mais pas correctement fermées par une version plus ancienne du code.

« Le problème du nombre de connexions », dit Leo, « est en réalité un problème d'application qui ressemble à un problème de base de données. » Il ajouta PgBouncer (un pooler de connexions) à la liste des tâches — mais le goulot d'étranglement immédiat était la requête lente.

Le CPU de la base de données atteignait des pics à 89 % pendant le rush du dîner du vendredi. Les requêtes de lecture s'accumulaient. La latence P95 des requêtes avait doublé en six mois.

« La base de données est le goulot d'étranglement », dit-il. « Le trafic a augmenté. La base de données ne s'est pas adaptée. »

« On peut juste agrandir l'instance ? » demanda Maya. « Attends — mais *pourquoi* a-t-on une seule base de données qui gère toutes les lectures et écritures ? Pourquoi n'avons-nous pas distribué cela dès le départ ? »

« Oui », dit Leo. « C'est de la mise à l'échelle verticale. On passe de r6g.large à r6g.xlarge. Plus de CPU, plus de mémoire. Ça coûtera plus et nous donnera du temps. »

« Mais ça ne résout pas le problème sous-jacent », dit Priya. « Éventuellement on atteindra la plus grande instance et aura besoin d'une approche différente. Et avons-nous réfléchi à ce qui se passe si une écriture va par accident vers un réplica de lecture ? Le réplica la rejette et la commande échoue silencieusement. »

« Il y a deux approches », dit Leo. « Les réplicas de lecture, ou Aurora. »

« Quelle est la différence ? »

« Pense-y comme à une bibliothèque », dit Leo en attrapant un marqueur. « Un bibliothécaire qui à la fois enregistre les livres et répond aux questions des usagers. Quand la bibliothèque devient populaire, une file se forme. La solution : embaucher plus de bibliothécaires — mais seulement pour répondre aux questions. L'enregistrement passe toujours par le bureau d'origine. »

« C'est un réplica de lecture », dit Priya.

« Exactement. Aurora va plus loin — il repense le système de rangement lui-même de sorte que chaque bibliothécaire partage les mêmes étagères et voie toujours les mêmes livres, sans délai. Pas d'attente que les mises à jour passent d'un bureau à un autre. »

**Réplicas de lecture : distribuer le trafic de lecture**

La plupart des applications web lisent les données bien plus souvent qu'elles n'écrivent. Un client parcourant le menu effectue des dizaines de requêtes SELECT. Passer une commande effectue quelques requêtes INSERT/UPDATE. Le ratio est typiquement de 10:1 ou plus.

Un **réplica de lecture** est une instance RDS supplémentaire qui reçoit une copie de toutes les écritures de la primaire et met ces écritures à disposition pour les requêtes SELECT.

Comment ça fonctionne :

1. Les écritures de l'application (INSERT, UPDATE, DELETE) vont vers la base de données primaire
2. La primaire réplique ces changements de manière asynchrone vers les réplicas de lecture
3. Les lectures de l'application (SELECT) sont distribuées sur les réplicas de lecture
4. Les réplicas de lecture partagent la charge — chacun gère une fraction du trafic de lecture total

Résultat : la base de données primaire ne gère que les écritures (et optionnellement quelques lectures). Les réplicas de lecture gèrent la charge de lecture. Pour un ratio lecture/écriture de 10:1, l'ajout d'un réplica de lecture réduit approximativement de moitié la charge totale de la primaire.

**Limitation importante** : La réplication est **asynchrone**. Il y a un délai de réplication — typiquement des millisecondes, mais peut être des secondes sous charge. Une lecture depuis un réplica pourrait voir des données légèrement en retard par rapport à la primaire. Pour la plupart des lectures (parcourir le menu, consulter l'historique des commandes), c'est acceptable. Pour « est-ce que ma commande vient de passer ? » — lire depuis la primaire.

**Réplicas de lecture : les détails**

- Vous pouvez avoir jusqu'à 15 réplicas de lecture par instance RDS primaire (MySQL, PostgreSQL, MariaDB)
- Les réplicas de lecture peuvent être dans la même région ou une région différente (réplicas inter-régions)
- Les réplicas de lecture peuvent eux-mêmes avoir des réplicas de lecture (chaînage)
- Les réplicas de lecture sont des points de terminaison séparés — votre application doit diriger les lectures vers le point de terminaison du réplica
- Les réplicas de lecture peuvent être promus en bases de données autonomes (utile pour la reprise après sinistre)

Pour Nimbus, Leo a ajouté un réplica de lecture. « Ça ira », dit-il quand Priya lui demanda s'il avait testé la logique de routage lecture/écriture de l'application avant de basculer le trafic. Il ne l'avait pas fait. Il passa les quarante minutes suivantes à vérifier que les écritures n'allaient pas vers le point de terminaison du réplica de lecture.

Il mit à jour l'application pour :

- Opérations d'écriture → point de terminaison primaire
- Navigation dans les menus, historique des commandes → point de terminaison du réplica

Le CPU sur la primaire est passé de 89 % à 41 % en pic.

**Le problème de cohérence lecture-après-écriture**

Trois jours après l'activation du réplica de lecture, un ticket de support arriva. Un partenaire restaurant avait mis à jour son menu — supprimé un article retiré — puis appelé pour confirmer qu'il était supprimé. L'agent du service client afficha le menu depuis l'interface Nimbus. L'article était toujours là.

Vingt secondes plus tard, il avait disparu.

Délai de réplication asynchrone. L'écriture (DELETE article de menu) était allée vers la primaire. La lecture de l'agent du service client était allée vers le réplica, qui n'avait pas encore reçu le changement. Le réplica avait 15 secondes de retard à ce moment-là — pas inhabituel, mais visible.

« Et si quelqu'un essaie de s'introduire par la fenêtre de cohérence éventuelle ? » demanda Priya. « Ou simplement — et si une commande est passée pour un article de menu qui vient d'être supprimé ? On facturerait le client et le restaurant n'aurait pas l'article. »

C'était une vraie préoccupation de cohérence, pas seulement un désagrément d'UX.

La solution : identifier quelles lectures ont des exigences de cohérence et les router vers la primaire.

**Lectures qui peuvent aller vers le réplica** (la cohérence éventuelle convient) :
- Client parcourant le menu d'un restaurant (un retard de 1 à 2 secondes est imperceptible)
- Requêtes d'historique de commandes (un utilisateur consultant son historique de commandes d'il y a une minute)
- Lectures de type analytique (meilleurs restaurants cette semaine)

**Lectures qui doivent aller vers la primaire** (cohérence lecture-après-écriture requise) :
- Immédiatement après une écriture, quand l'application doit confirmer que l'écriture a réussi
- Lectures d'état de commande immédiatement après la passation de la commande
- Lectures de menu déclenchées par l'interface de gestion du restaurant (le restaurant vient de changer le menu)

L'application a ajouté un indice de routage dans la couche de connexion à la base de données : si la requête venait du tableau de bord de gestion du restaurant, router vers la primaire. Si elle venait d'un client en train de naviguer, router vers le réplica. L'en-tête HTTP `X-Read-Consistency: strong` servait de signal.

« Ce n'est pas si difficile », dit Leo. « Il faut juste savoir quelles lectures l'exigent. »

« Et le documenter », dit Priya. « Pour que la prochaine personne qui ajoute un nouveau point de terminaison sache quel pool utiliser. »

« Combien cela coûte-t-il par mois ? » demanda Tom. C'était sa question d'ouverture standard pour tout nouveau service.

Un réplica de lecture du même type d'instance coûte autant que la primaire. De 340 $/mois à 680 $/mois.

« On a doublé le coût pour à peu près diviser la charge par deux », dit Tom.

« Oui. Mais l'alternative était de passer à un type d'instance plus grand, ce qui coûterait aussi plus cher et ne distribuerait pas la charge de lecture. »

Tom fit le calcul. Il hocha la tête, à contrecœur.

« Que se passe-t-il si la primaire tombe en panne ? » demanda Maya, avant que Tom ne puisse passer à Aurora. « Qu'arrive-t-il au réplica de lecture ? »

Leo expliqua la promotion de réplica.

**Si l'instance RDS primaire tombe en panne**, AWS bascule automatiquement vers le réplica de standby dans la configuration Multi-AZ (un type de réplica différent — un standby synchrone, pas un réplica de lecture). Le standby Multi-AZ devient la nouvelle primaire. Les réplicas de lecture continuent à servir les lectures, répliquant maintenant depuis la nouvelle primaire. Du point de vue de l'application, le DNS du point de terminaison primaire change pour pointer vers l'ancien standby, et l'application se reconnecte.

Le basculement prend typiquement 60 à 120 secondes pour RDS PostgreSQL. Pendant cette fenêtre, les écritures échouent.

**La promotion de réplica de lecture** est une opération séparée — et un scénario séparé. Si vous voulez prendre un réplica de lecture et en faire une base de données indépendante et inscriptible (pour la DR, pour la migration vers une nouvelle région, ou parce que la primaire a disparu et que vous devez promouvoir plutôt qu'attendre le basculement Multi-AZ), vous pouvez promouvoir un réplica de lecture en primaire autonome. La promotion prend quelques minutes, après quoi le réplica ne réplique plus depuis la primaire originale — c'est sa propre base de données.

« Avons-nous réfléchi à ce qui se passe si la primaire us-west-2 tombe entièrement ? » demanda Priya. « Pas juste un basculement vers le standby Multi-AZ — la région entière. »

« Si la région tombe en panne », dit Leo, « le standby Multi-AZ est aussi dans us-west-2. Les deux tombent ensemble. »

« Donc pour un vrai scénario de DR régional », dit Tom, « il nous faudrait un réplica de lecture dans us-east-1 qu'on pourrait promouvoir. »

« Oui. Un réplica de lecture inter-régions. On n'en a pas encore. »

« Combien cela coûte-t-il par mois ? » demanda Tom. Il savait déjà que la réponse impliquerait une décision.

Un réplica de lecture inter-régions d'une db.r6g.large dans us-east-1 : 340 $/mois (même coût d'instance). Plus le transfert de données inter-régions pour la réplication : minimal au volume d'écriture de Nimbus. Total : environ 350 $/mois pour un réplica de DR.

« C'est 4 200 $ par an », dit Tom, « pour se protéger contre un scénario qui est arrivé aux régions AWS moins de cinq fois en dix ans. »

« Et le coût de Nimbus hors service pendant 24 heures lors d'un événement régional est de combien ? » demanda Priya.

Tom calcula. Il ne répondit pas à voix haute. Mais il ajouta « réplica de lecture inter-régions » au backlog de DR.

« C'est quoi Aurora ? » demanda-t-il.

**Amazon Aurora : repenser le moteur de base de données**

Aurora est le moteur de base de données relationnelle propriétaire d'AWS, compatible avec MySQL et PostgreSQL. Il a été conçu de zéro pour les charges de travail cloud, en repensant le fonctionnement de la couche de stockage d'une base de données relationnelle.

Dans une configuration RDS traditionnelle (MySQL, PostgreSQL), le stockage et le calcul sont étroitement couplés. Le moteur de base de données gère les fichiers de données. La réplication copie les données de la primaire vers le réplica. Le réplica doit refaire chaque opération d'écriture.

Cela crée un plafond sur la vitesse de réplication : un réplica ne peut appliquer les écritures qu'aussi vite qu'il peut traiter le journal de réplication. Pendant une période à forte écriture — un import en masse, une vente flash, une mise à jour par lots — le réplica peut prendre du retard. Le délai de réplication n'est pas un défaut de l'implémentation ; c'est une conséquence de l'architecture.

Priya avait signalé cela immédiatement quand Leo a proposé les réplicas de lecture. « Et avons-nous réfléchi à ce qui se passe si le délai de réplication monte à 30 secondes pendant le rush du vendredi ? Le réplica a 30 secondes de retard. Un client passe une commande, le créneau de cuisine est réservé dans la primaire, mais un second client interrogeant le réplica ne voit pas la réservation. Deux commandes, un créneau. »

« C'est un problème de cohérence d'inventaire », dit Leo.

« C'est exactement un problème de cohérence d'inventaire », confirma Priya. « C'est pourquoi les lectures d'inventaire — "cet article est-il encore disponible ?" — doivent aller vers la primaire. »

L'architecture d'Aurora s'attaque directement au délai.

Aurora sépare le stockage du calcul. Il utilise une couche de stockage distribuée et tolérante aux pannes qui réplique automatiquement les données dans trois Zones de disponibilité en six copies. La couche de calcul (les instances de base de données) se trouve au-dessus de cette couche de stockage.

**Ce que cela change** :

**Réplicas de lecture** : Les réplicas Aurora n'ont pas besoin de répliquer les données — ils partagent déjà la même couche de stockage. Cela signifie :

- Jusqu'à 15 réplicas Aurora qui partagent le volume de stockage (RDS standard permet aussi jusqu'à 15 réplicas de lecture, mais chacun est une copie complète des données)
- Le délai de réplication est typiquement inférieur à 100 millisecondes (vs secondes pour RDS sous charge)
- Les réplicas peuvent être promus en primaire en moins de 30 secondes (vs minutes)

**Basculement** : Comme les réplicas partagent le stockage, le basculement est bien plus rapide — la promotion n'implique pas de transfert de données, juste de rediriger les écritures.

**Stockage** : Aurora fait automatiquement évoluer le stockage par incréments de 10 Go, jusqu'à 128 Tio (256 Tio dans les versions récentes du moteur). Vous ne provisionnez jamais le stockage à l'avance.

**Performance** : Aurora revendique 5 fois le débit de MySQL standard et 3 fois PostgreSQL standard pour des types d'instances équivalents.

Vous vous demandez peut-être : si tous les réplicas partagent le même stockage, ce stockage ne devient-il pas un point de défaillance unique ? La couche de stockage d'Aurora réplique automatiquement les données en six copies dans trois Zones de disponibilité. Le stockage lui-même est plus résilient que n'importe quelle configuration RDS Multi-AZ unique — il est conçu pour survivre à la perte d'une AZ entière avec zéro perte de données et sans basculement nécessaire.

Une seconde question courante : si Aurora est compatible MySQL/PostgreSQL, peut-on migrer de RDS PostgreSQL vers Aurora PostgreSQL sans changer le code de l'application ? Presque. La compatibilité Aurora PostgreSQL signifie qu'Aurora implémente le protocole filaire PostgreSQL et prend en charge la grande majorité de la syntaxe et des fonctionnalités SQL de PostgreSQL. La plupart des applications migrent sans aucun changement de code. Les cas limites : un petit nombre d'extensions PostgreSQL ne sont pas disponibles sur Aurora, certaines requêtes de catalogue système renvoient des valeurs différentes, et certaines opérations administratives diffèrent. Pour les migrations en production, testez avec du trafic de lecture parallèle avant de basculer les écritures.

Pour Nimbus, la migration de RDS PostgreSQL vers Aurora PostgreSQL prit un après-midi. L'application pointait vers le point de terminaison Aurora. La requête de menu — après que Leo a ajouté l'index que Performance Insights avait pointé comme le principal consommateur de charge de base de données — s'exécutait en 4 ms au lieu de 620 ms. Le pool de connexions n'atteignait plus 198 sur 200. La latence P95 tomba à 28 ms.

« C'est un moteur de base de données différent », dit Leo, « que l'application croit être le même moteur de base de données. »

« Et la partie intéressante ? » demanda Maya.

« Le clonage rapide de base de données. »

« Noté », dit Sam tranquillement de l'autre côté de la pièce, déjà en train de taper. Sam était un ingénieur backend qui avait rejoint l'équipe quelques semaines plus tôt pour décharger Leo d'une partie du travail de base de données. Personne ne demanda ce qu'il faisait.

**Tarification Aurora : la question de Tom**

La tarification Aurora est différente de celle de RDS :

**Tarification des instances** : Similaire à la tarification des instances RDS par type.

**Tarification du stockage** : 0,10 $ par Go par mois (vous payez pour ce qui est stocké, mis à l'échelle automatiquement).

**Tarification des E/S** : Aurora facture par requête E/S (lecture/écriture vers le stockage). Cela peut être significatif pour les charges de travail à forte écriture.

« Attendez », dit Tom. « On paie pour les E/S séparément ? »

« Aurora Serverless v2 et Aurora I/O-Optimized changent ce modèle de tarification », dit Leo. « Aurora I/O-Optimized ne facture pas les E/S mais a un prix de stockage et d'instance plus élevé. Meilleur pour les charges de travail à forte E/S. »

Tom regarda le compromis. Pour Nimbus, qui était à forte lecture (beaucoup de requêtes de menus, peu d'écritures), Aurora I/O-Optimized pourrait coûter plus cher. La tarification Aurora standard pourrait être appropriée.

Une heuristique utile : si vos frais d'E/S dépassent environ 25 % de votre facture Aurora totale, I/O-Optimized est probablement moins cher. Pour la charge de travail à forte lecture de Nimbus, les frais d'E/S étaient faibles — la tarification standard s'applique. Pour une charge de travail à forte écriture comme un système de journalisation d'événements, I/O-Optimized pourrait réduire les coûts significativement.

C'est une vraie décision de coût que les ingénieurs seniors prennent : vous devez connaître les modèles d'E/S de votre charge de travail pour choisir correctement.

Si votre charge de travail est petite, stable et prévisible, RDS PostgreSQL est plus simple et significativement moins cher — mais si votre trafic est imprévisible, votre volume de données croît au-delà de ce que vous pouvez provisionner à l'avance, ou vous avez besoin d'un basculement automatique en moins de 30 secondes, le modèle de stockage partagé d'Aurora justifie le coût de base plus élevé.

**Aurora Serverless : mise à l'échelle sans penser aux instances**

**Aurora Serverless v2** est une configuration qui met automatiquement à l'échelle la capacité de calcul en fonction de la charge réelle de la base de données. Au lieu de choisir une taille d'instance fixe (db.r6g.large), vous définissez une capacité minimale et maximale en Aurora Capacity Units (ACU).

Aurora Serverless v2 :

- Évolue à la hausse en quelques secondes quand la charge augmente
- Évolue à la baisse pendant les périodes inactives — et depuis fin 2024, peut s'auto-suspendre jusqu'à 0 ACU quand il n'y a pas de connexions (la reprise prend ~15 secondes ; l'auto-suspension ne fonctionne pas avec RDS Proxy ou d'autres proxys qui maintiennent des connexions)
- Coût : 0,12 $ par ACU-heure (plus le stockage et les E/S)

Pour les charges de travail à trafic variable — les pics du vendredi de Nimbus vs la tranquillité du lundi matin — Serverless v2 réduit les coûts pendant les périodes creuses et gère les pics sans préprovisionnement.

« Donc pendant le pic du vendredi », dit Leo, « Aurora évolue automatiquement à la hausse. Le dimanche matin quand on a presque pas de trafic, il redescend au minimum. »

« Et on ne paie que pour la capacité qu'on utilise », dit Tom.

« Correct. »

Après un mois sur Aurora Serverless v2, Leo afficha le graphique des ACU (Aurora Capacity Units) de la semaine précédente.

Le graphique montrait deux schémas distincts. Pendant la semaine, la base de données tournait à 2-4 ACU — un bourdonnement tranquille de requêtes en arrière-plan, de vérifications de santé ECS, de travaux ETL Glue, et de tests de développement. Le vendredi soir entre 18 h et 22 h, le nombre d'ACU grimpait :

```
Vendredi 18:00  → 6 ACU
Vendredi 19:00  → 14 ACU
Vendredi 19:45  → 26 ACU  (pic — les commandes de pizza explosent avant le coup d'envoi de la NFL)
Vendredi 20:30  → 18 ACU
Vendredi 21:00  → 12 ACU
Vendredi 22:30  → 4 ACU
Samedi 02:00 → 2 ACU  (minimum)
```

La mise à l'échelle était quasi instantanée — Aurora Serverless v2 évolue par incréments de 0,5 ACU, et peut ajouter de la capacité en quelques secondes plutôt que les minutes nécessaires pour provisionner une nouvelle instance RDS.

« Combien a coûté ce pic du vendredi ? » demanda Tom.

À 0,12 $ par ACU-heure : le pic du vendredi était de 4 heures à une moyenne de 18 ACU → 8,64 $ pour la période de pic. Le reste de la semaine à 3 ACU en moyenne × 164 heures × 0,12 $ = 59,04 $. Total pour la semaine : 67,68 $.

L'instance provisionnée équivalente pour gérer le pic du vendredi (db.r6g.xlarge, 4 vCPU, 32 Go) coûterait 0,937 $/heure × 168 heures = **157,42 $ pour la semaine** — que le pic du vendredi se matérialise ou non.

« Serverless v2 est à 67 $ pour la semaine. Une instance provisionnée dimensionnée pour le pic est à 157 $ », dit Tom. « C'est une réduction de 57 %. »

« Sur une base de données qui utilise légitimement 26 ACU pendant quatre heures le vendredi et 2 ACU le reste de la semaine », dit Leo. « Si votre base de données tourne à une charge élevée constante toute la semaine, une instance provisionnée est moins chère. Les économies viennent de la variabilité. »

Tom hocha lentement la tête. Il ajoutait cela à un schéma dans ses notes : chaque histoire d'économie ce trimestre avait la même forme. Vous payez pour ce que vous utilisez, pas pour ce dont vous pourriez avoir besoin. Les politiques de cycle de vie S3 ne payaient que pour la classe de stockage que chaque objet méritait. Lambda ne payait que pour le temps d'invocation. Fargate ne payait que pour le CPU et la mémoire des tâches. Aurora Serverless v2 ne payait que pour les ACU que la base de données consommait réellement.

Tom avait l'expression de quelqu'un qui avait trouvé exactement ce qu'il cherchait.

**Récupérer d'une mauvaise migration : clones, PITR et le bouton annuler**

Deux semaines après le passage à Aurora, Sam exécuta un script de migration de base de données en production. Le script était censé supprimer la colonne `legacy_menu_format` de la table `menu_items`. Il l'exécuta sans la clause WHERE qu'il pensait avoir incluse.

Le résultat n'était pas la suppression d'une colonne. C'était une instruction DELETE qui effaça 40 000 lignes de la table `menu_items` — environ 200 restaurants de données de menus, disparues.

L'alerte se déclencha en moins de 30 secondes. Les échecs de commandes explosèrent. Le service de menus commença à renvoyer des résultats vides pour 200 restaurants.

« C'était censé avoir une clause WHERE », dit Sam, en fixant la console.

Le chemin de récupération traditionnel : restaurer depuis l'instantané de sauvegarde automatisé le plus récent. Les sauvegardes automatisées s'exécutent une fois toutes les 24 heures, et une restauration-et-permutation complète prendrait 20 à 40 minutes — pendant lesquelles *tous* les restaurants seraient dans le noir, pas seulement les 200 affectés — et chaque commande passée depuis la sauvegarde serait perdue.

Leo ne fit pas cela. Comme RDS standard, Aurora conserve des sauvegardes continues pour la **récupération à un point dans le temps (PITR)** — vous pouvez restaurer le cluster à n'importe quelle seconde dans la fenêtre de rétention de sauvegarde, pas seulement au dernier instantané nocturne. Et de manière cruciale, la restauration crée un *nouveau* cluster ; la production reste en marche pendant que vous récupérez.

```bash
aws rds restore-db-cluster-to-point-in-time \
  --db-cluster-identifier nimbus-aurora-recovery \
  --source-db-cluster-identifier nimbus-aurora-cluster \
  --restore-to-time 2024-06-14T15:42:00Z
```

L'horodatage : 15:42:00Z — quatre minutes avant que Sam n'exécute le script de migration. Pendant que le cluster de récupération démarrait, le reste de la production continuait à servir les restaurants non affectés. Une fois disponible, Leo extrayit les lignes `menu_items` des 200 restaurants affectés du cluster de récupération et les réinséra en production. Temps total de l'alerte aux menus entièrement restaurés : un peu moins de 40 minutes — et parce qu'il a réparé les lignes chirurgicalement au lieu de permuter toute la base de données, aucune commande passée après 15:42 ne fut perdue. Le cluster de récupération fut supprimé par la suite ; il avait rempli son rôle.

« Qu'avons-nous perdu ? » demanda Maya.

Six commandes passées contre les menus brièvement vides avaient échoué au paiement — toutes étaient dans la file SQS et pouvaient être rejouées. Aucune donnée client ne fut perdue de façon permanente.

« Et c'est là qu'intervient le **clonage rapide de base de données** », dit Leo, rassemblant l'équipe après coup. Aurora peut créer un **clone** d'un cluster en quelques minutes, quelle que soit la taille de la base de données, en utilisant la copie sur écriture : le clone partage la couche de stockage de l'original et seules les pages nouvelles ou modifiées consomment de l'espace supplémentaire. Un clone de la base de données de production actuelle est bon marché, rapide, et complètement isolé — les écritures sur le clone ne touchent jamais la production.

« Ce qui signifie », dit Priya, en regardant Sam, « que le script de migration est testé contre un clone des données de production avant même de s'exécuter en production. C'est la nouvelle règle. »

Sam hocha la tête. Il l'avait déjà écrit sur un post-it.

Un outil de plus a sa place dans ce tableau. Aurora MySQL — pas Aurora PostgreSQL — a **Aurora Backtrack** : une fonctionnalité qui rembobine le cluster *sur place* à un point spécifique dans le temps, sans restaurer vers un nouveau cluster du tout. Si le cluster de Nimbus avait été Aurora MySQL, Leo aurait pu le rembobiner à 15:42 en moins de trois minutes — bien que rembobiner tout le cluster aurait aussi annulé la poignée de commandes légitimes écrites après la suppression, que l'approche PITR chirurgicale a préservées.

« Et si quelqu'un essaie de s'introduire en utilisant Backtrack — ou une restauration à un point dans le temps ? » demanda Priya. « Un attaquant pourrait-il rembobiner les journaux d'audit ou les données de conformité ? »

Backtrack nécessite la permission d'API `rds:BacktrackDBCluster`, et les restaurations nécessitent `rds:RestoreDBClusterToPointInTime` — des actions IAM séparées des opérations normales de base de données. Les rôles d'application standard n'ont pas ces permissions. Seule l'équipe des opérations, avec une politique IAM explicite les autorisant, pouvait les utiliser. Elle ajouta cela à la liste de contrôle de revue des permissions IAM.

Les mises en garde importantes : Aurora Backtrack n'est disponible que pour les clusters compatibles Aurora MySQL, pas PostgreSQL. La fenêtre de Backtrack est configurée à la création du cluster (1 heure à 72 heures, facturée par heure de fenêtre de backtrack). Et Backtrack affecte le cluster entier — vous ne pouvez pas rembobiner une table ou un ensemble de lignes. Pour une récupération chirurgicale au niveau des lignes — sur l'un ou l'autre moteur — l'approche PITR-vers-un-cluster-temporaire que Leo a utilisée est l'outil.

**Aurora Global Database : lectures multi-régions**

**Aurora Global Database** étend Aurora sur plusieurs régions AWS :

- **Une région primaire** gère toutes les écritures
- **Jusqu'à cinq régions secondaires** servent les lectures avec typiquement < 1 seconde de délai de réplication
- Les régions secondaires peuvent être promues en primaire en moins d'1 minute (pour les scénarios de DR)

Pour l'expansion mondiale de Nimbus, Aurora Global Database permettrait à un partenaire restaurant à Londres d'interroger son menu local depuis le réplica de lecture EU, pendant que toutes les commandes (écritures) passent toujours par la primaire US.

**RDS vs Aurora : quand choisir lequel**

| Facteur               | RDS (PostgreSQL/MySQL)              | Aurora                                                     |
|-----------------------|-------------------------------------|------------------------------------------------------------|
| Coût                  | Plus faible pour les petites charges | Plus élevé à la base, mais évolue mieux                   |
| Compatibilité         | Complète                            | Compatible MySQL/PostgreSQL (avec quelques différences)    |
| Réplicas max          | 15 (chacun une copie complète des données) | 15 (volume de stockage partagé)                     |
| Délai de réplica      | Peut être de plusieurs secondes     | Généralement < 100 ms                                      |
| Stockage              | Provisionnement fixe                | Auto-évolue jusqu'à 128 Tio (256 Tio dans les versions récentes) |
| Temps de basculement  | 60-120 secondes                     | < 30 secondes                                              |
| Option serverless     | Limitée                             | Aurora Serverless v2                                       |
| Idéal pour            | Charges stables et prévisibles      | Trafic variable, fort volume de lecture, besoin de basculement rapide |

**Au-delà du relationnel : la famille spécialisée**

Le chapitre 9 a présenté DocumentDB (documents compatibles MongoDB), Neptune (relations en graphe), et Keyspaces (colonnes larges compatibles Cassandra), et le chapitre 10 a présenté MemoryDB (base de données primaire durable compatible Redis). Deux noms de plus complètent la famille — vous n'avez pas besoin d'approfondir, juste de la capacité à reconnaître quelle forme de données pointe vers quel moteur, car ils apparaissent constamment comme options de réponse :

- **Amazon Timestream** : données de **séries temporelles** — relevés de capteurs, métriques, télémétrie. Signal d'examen : « mesures IoT au fil du temps ». (Dans le monde réel, l'offre actuelle est Timestream for InfluxDB ; la version originale « LiveAnalytics » a fermé aux nouveaux clients en 2025.)
- **Amazon QLDB** : vous pouvez encore le rencontrer dans des questions plus anciennes comme le « grand livre immuable et cryptographiquement vérifiable ». AWS a abandonné QLDB en 2025 (recommandant Aurora PostgreSQL à la place) — traitez-le comme un distracteur hérité, pas un bloc de construction.

La règle qui vaut la peine d'être écrite sur un tableau blanc : **lignes relationnelles → RDS/Aurora ; clé-valeur à grande échelle → DynamoDB ; documents → DocumentDB ; relations → Neptune ; temps → Timestream ; Cassandra → Keyspaces ; Redis durable → MemoryDB.** Faites correspondre la forme, et la question se répond d'elle-même.

## Points forts et limites

**Avantages Aurora** :

- Basculement significativement plus rapide que RDS standard
- Jusqu'à 15 réplicas de lecture avec un délai minimal
- Stockage à mise à l'échelle automatique
- Serverless v2 pour les charges de travail variables
- Global Database pour le déploiement multi-régions

**Limites Aurora** :

- Coût plus élevé pour les petites charges stables
- La tarification des E/S peut être significative pour les charges à forte écriture (utilisez I/O-Optimized pour cela)
- Des différences mineures de compatibilité MySQL/PostgreSQL peuvent nécessiter des changements de code
- La reprise de Serverless v2 depuis l'auto-suspension (~15 secondes) et la montée en charge rapide peuvent provoquer des pics de latence

## Résumé

Le travail de cycle de vie S3 du chapitre 23 a réduit les coûts en déplaçant les données vers le bon niveau de stockage. Aurora fait l'équivalent pour le calcul : au lieu de provisionner pour la charge de pic et de payer pour cela tout le temps, Serverless v2 s'adapte à la demande.

- Les **réplicas de lecture** distribuent le trafic de lecture depuis la primaire. Réplication asynchrone — léger délai acceptable pour la plupart des lectures. Routez les lectures qui exigent la cohérence d'écriture (lectures immédiatement après écriture, lectures de l'interface d'administration) vers la primaire, pas le réplica.
- **Aurora** repense la couche de stockage : distribuée, partagée entre les réplicas, à mise à l'échelle automatique.
- Aurora offre : 15 réplicas de lecture, délai de réplica < 100 ms, basculement < 30 s, jusqu'à 128 Tio (256 Tio dans les versions récentes) de stockage à mise à l'échelle automatique.
- **Performance Insights** : identifiez les requêtes SQL spécifiques causant la charge de base de données avant de décider comment mettre à l'échelle. Un index manquant peut éliminer le besoin d'une instance plus grande.
- **Métriques de base de données CloudWatch** : DatabaseConnections (quasi-saturation signifie que le pooling de connexions de l'application est cassé), CPUUtilization (CPU élevé soutenu signifie des requêtes coûteuses), ReadLatency (dégradation dans le temps est souvent une table croissante avec un index manquant).
- **Aurora Serverless v2** : met automatiquement à l'échelle le calcul par incréments de 0,5 ACU. Facturé par ACU-heure. Significativement moins cher que les instances provisionnées pour les charges de travail à forte variabilité entre pic et heures creuses.
- **Récupération à un point dans le temps (PITR)** : restaurez un cluster Aurora à n'importe quelle seconde dans la fenêtre de rétention de sauvegarde — vers un *nouveau* cluster, pour que la production reste en marche pendant que vous recopiez chirurgicalement les lignes perdues.
- **Clonage rapide de base de données** : clone par copie sur écriture d'un cluster en quelques minutes quelle que soit la taille. Bon marché, isolé — utilisez-le pour tester les migrations contre les données de production avant qu'elles ne s'exécutent en production.
- **Aurora Backtrack** (compatible MySQL uniquement — pas PostgreSQL) : rembobinez le cluster sur place à un point dans le temps sans restaurer depuis une sauvegarde. Disponible pour des fenêtres jusqu'à 72 heures. Nécessite la permission IAM `rds:BacktrackDBCluster` — restreignez à l'équipe des opérations.
- **Aurora Global Database** : primaire dans une région, réplicas de lecture dans jusqu'à cinq régions.
- **Promotion de réplica de lecture** : les réplicas de lecture inter-régions peuvent être promus en primaires autonomes pour la DR régionale. Équilibrez le bénéfice de DR contre le coût d'exécution d'une seconde instance complète.
- Choisissez RDS pour les charges plus petites, stables et prévisibles. Choisissez Aurora quand vous avez besoin d'évolutivité, d'un basculement rapide, ou de gestion du trafic variable.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.3)*

- **Réplica Aurora vs réplica de lecture RDS** : Les réplicas Aurora partagent le stockage (délai quasi nul, basculement < 30 s). Les réplicas de lecture RDS répliquent les données (délai possible, minutes pour le basculement).
- **Aurora Serverless v2** : « mise à l'échelle automatique de la capacité de base de données », « trafic de base de données imprévisible ou irrégulier » → Aurora Serverless v2. Attention : historiquement, seul Serverless **v1** descendait à zéro ; le minimum de v2 était de 0,5 ACU jusqu'à fin 2024, quand v2 a gagné l'auto-suspension à 0 ACU. Les questions d'examen plus anciennes peuvent encore supposer que v2 ne peut pas descendre à zéro.
- **Aurora Global Database** : « base de données multi-régions », « lecture depuis EU avec faible latence depuis une primaire US », « RTO < 1 minute pour le basculement régional » → Aurora Global Database.
- **Temps de basculement** : Aurora < 30 secondes. RDS Multi-AZ 60-120 secondes. Connaissez les deux.
- **Bases de données spécialisées par forme de données** : « graphe social / recommandations / réseaux de fraude » → Neptune. « MongoDB » → DocumentDB. « Cassandra » → Keyspaces. « séries temporelles / télémétrie IoT » → Timestream. « base de données *primaire* compatible Redis (durable) » → MemoryDB (vs ElastiCache = cache). « Grand livre cryptographique immuable » → QLDB dans les anciennes questions (abandonné en 2025).
- **Aurora I/O-Optimized** : Coût de stockage et d'instance plus élevé, pas de frais par E/S. À utiliser quand les coûts d'E/S dominent (forte écriture). Aurora standard : coût de stockage plus faible, payer par E/S. À utiliser pour la forte lecture.
- **Aurora Backtrack** : Rembobinez la base de données sur place à un point spécifique dans le temps sans restaurer depuis un instantané de sauvegarde. Disponible uniquement pour Aurora compatible MySQL — pour Aurora PostgreSQL, la réponse est la restauration à un point dans le temps (vers un nouveau cluster) ou un clone rapide. Signal d'examen : « suppression accidentelle de données, besoin de récupérer rapidement sans restaurer une sauvegarde complète » + MySQL → Backtrack.
- **Clonage rapide de base de données Aurora** : clone par copie sur écriture en quelques minutes, quelle que soit la taille de la base de données. Signal d'examen : « tester contre une copie des données de production rapidement et à moindre coût » → clone, pas restauration d'instantané.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre Aurora et les réplicas de lecture RDS standard. Pourquoi le délai de réplication d'Aurora est-il typiquement plus faible ?

*(Indice : La différence clé est le stockage partagé vs la réplication de données. Réfléchissez à ce que chaque réplica doit faire quand une écriture arrive.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : La base de données MySQL d'une plateforme de médias sociaux connaît une forte latence de lecture due à l'augmentation du trafic. L'application est à forte lecture (95 % de lectures, 5 % d'écritures). L'équipe a besoin que la latence de lecture soit cohérente, même pendant les pics de trafic. Ils ont besoin d'un basculement automatique avec un temps d'arrêt minimal (RTO cible < 30 secondes). Le volume de données croît de manière imprévisible.

Quelle solution de base de données répond LE MIEUX à ces exigences ?

A) RDS MySQL Multi-AZ avec cinq réplicas de lecture  
B) Aurora MySQL avec des réplicas Aurora et Aurora Serverless v2  
C) RDS MySQL avec un type d'instance plus grand (mise à l'échelle verticale)  
D) DynamoDB avec DynamoDB DAX pour la mise en cache des lectures

**Indice 1** : « RTO < 30 secondes » — quel service atteint cela ? Vérifiez le temps de basculement pour chaque option.

**Indice 2** : « Latence de lecture cohérente pendant les pics » — quel service a des réplicas avec un délai quasi nul vs des secondes potentielles de délai ?

**Indice 3** : « Volume de données qui croît de manière imprévisible » — quel service met automatiquement à l'échelle le stockage ?

**Réponse** : B

**Explication** : Aurora MySQL avec des réplicas Aurora fournit un délai de réplication quasi nul (millisecondes, pas secondes) pour des performances de lecture cohérentes sous charge. Aurora Serverless v2 met automatiquement à l'échelle le calcul pendant les pics de trafic sans surprovisionnement. Le stockage Aurora s'adapte automatiquement à la croissance des données. Le basculement Aurora (promotion d'un réplica) se complète en moins de 30 secondes — répondant à l'exigence de RTO.

**Pourquoi pas A ?** Le basculement RDS Multi-AZ prend 60-120 secondes — ne répond pas au RTO < 30 secondes. Le délai des réplicas de lecture RDS standard peut atteindre des secondes sous charge — « cohérent » est plus difficile à garantir.

**Pourquoi pas C ?** La mise à l'échelle verticale (instance plus grande) augmente la capacité mais ne distribue pas la charge de lecture. La base de données reste un point de défaillance unique pour les lectures.

**Pourquoi pas D ?** DynamoDB est NoSQL — migrer de MySQL vers DynamoDB nécessite de réarchitecturer le modèle de données et les requêtes de l'application, ce qui dépasse largement la portée de cette tâche d'amélioration des performances.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.3*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus conçoit une expansion mondiale. Ils veulent que les partenaires restaurants sur la Côte Est, en Allemagne et en Australie voient rapidement leurs propres données de commandes, sans latence inter-régions. Cependant, toutes les écritures doivent passer par une primaire unique us-west-2 pour maintenir la cohérence.

Concevez l'architecture de base de données utilisant Aurora. Comment structureriez-vous la Global Database — par exemple, des clusters secondaires dans us-east-1, eu-central-1 et ap-southeast-2 ? Que se passe-t-il si la primaire us-west-2 tombe en panne ? Comment géreriez-vous le processus de promotion ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception de base de données multi-régions.)*

## Scène post-générique

Leo migra vers Aurora avec Serverless v2.

Le pic du vendredi arriva et passa. Le CPU ne dépassa jamais 60 %. La latence des requêtes resta cohérente. Aurora avait évolué à la hausse pour gérer la charge automatiquement, puis redescendu après le rush.

« Combien ça a coûté par rapport au vendredi dernier ? » demanda Tom le lundi matin.

Leo consulta l'explorateur de facturation. « Le vendredi a atteint une moyenne d'environ 2,16 $/heure pendant le pic du soir. Le samedi matin était à 0,24 $/heure. »

Tom ne dit rien.

« L'ancienne configuration était fixe à 0,47 $/heure quelle que soit la charge », ajouta Leo.

« Donc on a payé plus pendant le pic qu'avant », dit Tom.

« Oui. Mais significativement moins pendant les heures creuses. Le coût net sur la semaine est plus faible. »

Tom calcula. Puis hocha la tête.

« Il y a une leçon ici », dit-il. « La bonne question n'est pas "est-ce moins cher ?" C'est "est-ce moins cher pour notre modèle d'utilisation réel ?" »

« Ça », dit Priya depuis l'autre côté de la pièce, « c'est l'instinct d'un ingénieur senior. »

Tom parut légèrement alarmé d'être décrit ainsi.

Dans le prochain chapitre : quand votre réseau est le goulot d'étranglement, et pourquoi une autoroute privée pourrait valoir le péage.
