# Chapitre 10 : Quand la base de données est trop lente

Les métriques de temps de chargement des pages étaient ouvertes à l'écran. Leo les regardait depuis vingt minutes sans rien dire.

Quarante-sept requêtes DynamoDB par chargement de page. Cent quatre-vingt-huit millisecondes rien que pour récupérer les données — avant que le navigateur rende un seul pixel.

Il avait fait le calcul. Dix mille utilisateurs simultanés un vendredi soir, chacun chargeant la page de parcours environ une fois par minute : quatre cent soixante-dix mille lectures DynamoDB par minute. Le coût était réel. Mais la latence était le vrai problème. Un utilisateur ouvrant la page de parcours Nimbus attendait presque deux cents millisecondes avant que quoi que ce soit apparaisse — et c'était sur une connexion rapide.

---

*La semaine précédente, la refonte du schéma DynamoDB avait fonctionné. La table des menus était flexible maintenant — n'importe quel restaurant pouvait ajouter n'importe quel modificateur, n'importe quelle structure de formule, n'importe quelle variation saisonnière. La performance des recherches individuelles était excellente. Mais d'excellentes recherches individuelles, multipliées par quarante-sept par page, faisaient quand même des pages lentes. Le problème DynamoDB était résolu. Un nouveau problème avait pris sa place.*

---

« La base de données répond en quatre millisecondes par requête », dit Leo. « C'est en fait rapide. DynamoDB fait son travail. »

« Alors pourquoi la page est lente ? » demanda Maya.

« Parce qu'on l'appelle quarante-sept fois par chargement de page », dit Priya. « Le problème n'est pas la base de données. Le problème est qu'on lui parle trop. »

Tom se pencha en avant. Il avait le regard qu'il prenait quand un problème allait devenir une conversation de coût. « Donc la solution est de lui parler moins ? »

« Lui parler moins. Se souvenir plus. »

---

**La mauvaise première tentative**

Le premier instinct de Leo fut de mettre en cache les données par utilisateur. Chaque utilisateur avait une session, et la session chargeait son profil : adresses sauvegardées, moyens de paiement, résumé de l'historique des commandes. Peut-être que mettre ça en cache accélérerait les choses.

Il l'implémenta. Format de clé Redis : `user:{userId}:profile`. TTL : dix minutes.

Il lança le test de charge. Le chargement de page chuta de six millisecondes.

« Ce n'est pas beaucoup », observa Tom.

« Non », dit Leo.

« Pourquoi pas ? »

Leo fixa le graphique un moment. « Parce que le profil utilisateur n'est qu'une seule requête. Il reste quarante-six appels DynamoDB par page. Et ce sont les appels de menu — un par restaurant sur la page de parcours. J'ai mis en cache la mauvaise chose. »

C'est une erreur courante dans la mise en cache : optimiser la chose qui n'est pas le goulot d'étranglement. Le profil utilisateur se chargeait en deux millisecondes. Mettre en cache quelque chose d'aussi rapide n'économisait presque rien. Les données du menu — récupérées quarante-sept fois, prenant quatre millisecondes chacune — étaient le vrai problème.

« Il faut mettre en cache par menu, pas par utilisateur », dit Priya. « Le menu du Restaurant 047 est le même pour chaque utilisateur qui le parcourt. C'est ça les données qui valent la peine d'être mises en cache — elles sont identiques sur des milliers de requêtes. »

Les caches par utilisateur sont précieux quand les utilisateurs ont un état personnalisé coûteux. Les caches par entité (menus, catalogues de produits, configuration) sont précieux quand les mêmes données sont servies à des milliers d'utilisateurs. Sachez quel problème vous avez avant d'écrire le code.

Leo redessina les clés de cache : `menu:{restaurantId}`. Une entrée de cache par restaurant, partagée par chaque utilisateur parcourant ce restaurant.

Il relança le test de charge. Le chargement de page chuta de 188 millisecondes à 12 millisecondes. C'était l'amélioration qu'ils cherchaient.

---

**L'analogie du restaurant**

Imaginez la cuisine d'un restaurant. Chaque fois qu'un serveur a besoin de connaître les plats du jour, il marche vers l'arrière, demande au chef, et revient à la table.

Ça fonctionne bien si vous avez deux serveurs et trois tables.

Maintenant imaginez deux cents serveurs et mille tables. Chacun d'eux marchant vers l'arrière pour la même question. La cuisine devient le goulot d'étranglement. Le chef répond à la même question quatre cents fois par heure.

La solution évidente : écrire les plats du jour sur un tableau à l'entrée du restaurant. Chaque serveur lit depuis le tableau. La cuisine se repose. Le tableau est mis à jour quand les plats changent.

Ce tableau est un cache.

Un cache est un magasin rapide et local de données récemment récupérées. Au lieu de récupérer la même chose depuis une source lente à répétition, vous la récupérez une fois et la gardez proche.

Il y a une autre analogie que les ingénieurs trouvent utile : l'étagère de réserve de la bibliothèque. Quand un livre populaire est rendu, le bibliothécaire sait qu'il sera redemandé bientôt, alors il le pose sur l'étagère de réserve près du comptoir au lieu de le ranger dans les rayons. Le prochain usager n'a pas à parcourir toute la bibliothèque — il le trouve directement au comptoir. L'étagère de réserve a un espace limité. Si elle se remplit, les livres plus anciens sont remis dans les rayons pour faire de la place aux plus récents. Un cache fonctionne de façon identique : les données fréquemment accédées restent près de l'avant, les données rarement accédées sont évincées pour faire de la place.

**Pourquoi ne pas juste utiliser la mémoire ?**

« Est-ce qu'on peut pas juste stocker le menu dans la mémoire de l'application ? » demanda Leo.

Question valide.

Vous pouvez. Pour une application à serveur unique, la mise en cache en mémoire fonctionne bien. Mais Nimbus tourne derrière un équilibreur de charge, sur plusieurs instances EC2. Si une instance met le menu en cache dans sa mémoire, les autres instances n'ont pas ces données. Elles maintiennent chacune des caches séparés. Quand le menu se met à jour, vous devriez tous les invalider.

C'est le *problème de cohérence du cache* — garder plusieurs caches cohérents.

ElastiCache résout ça en fournissant un cache *centralisé* que toutes vos instances partagent. Au lieu que chaque serveur ait sa propre mémoire, chaque serveur lit depuis et écrit vers le même cache. Une mise à jour se propage à tous.

**Découvrez ElastiCache**

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Pourquoi un tout nouveau service ? Pourquoi ne pas simplement ajouter plus de capacité de base de données ? »

Bonne question. La réponse est qu'ajouter plus de capacité de base de données — des instances plus grandes, plus de réplicas de lecture — ne corrige pas le problème fondamental. Chacune de ces quarante-sept requêtes de chargement de page coûte toujours du temps et de l'argent, même sur une base de données plus rapide. Un cache ne rend pas la base de données plus rapide ; il signifie que la base de données reçoit la même question bien moins souvent. Pour des données lues à répétition et qui changent rarement — comme le menu d'un restaurant — un cache signifie que la base de données pourrait répondre à cette question une fois toutes les cinq minutes au lieu de quarante-sept fois par chargement de page.

Amazon ElastiCache est un service de mise en cache géré. Il fait tourner des moteurs de mise en cache populaires — Redis et Memcached — sans que vous ayez à gérer les serveurs.

**Redis** est le plus puissant des deux. Il prend en charge des structures de données complexes (chaînes, listes, ensembles, hachages, ensembles triés), la persistance (les données survivent aux redémarrages), la réplication et la messagerie pub/sub. Redis peut faire plus que la mise en cache — il peut fonctionner comme un magasin de données léger.

**Memcached** est plus simple. Mise en cache clé-valeur pure, évolutive horizontalement, pas de persistance. Plus rapide pour les cas d'usage simples mais moins de fonctionnalités.

Pour Nimbus : Redis. Ils avaient besoin de mettre en cache les données de menu (structurées), les jetons de session (clé-valeur), et plus tard ils voudraient des ensembles triés pour les classements « restaurants tendance ».

**Comment fonctionne la mise en cache en pratique**

Le schéma de mise en cache de base s'appelle **cache-aside** (aussi appelé chargement paresseux) :

1. L'application a besoin de données
2. Vérifiez d'abord le cache
3. Si trouvé (*cache hit*) : retournez les données immédiatement
4. Si non trouvé (*cache miss*) : allez à la base de données, obtenez les données, stockez-les dans le cache, retournez-les

En pseudo-code :

```
menuData = cache.get("menu:restaurant-047")
if menuData is null:
    menuData = dynamodb.query(TableName="menu", KeyConditionExpression="restaurantId = '047'")
    cache.set("menu:restaurant-047", menuData, ttl=300)  # Cache pour 5 minutes
return menuData
```

La première requête frappe toujours la base de données. Chaque requête suivante frappe le cache. Avec un cache, les quarante-sept lectures DynamoDB de Nimbus par chargement de page deviennent une ou deux recherches dans le cache. Rapide, bon marché et évolutif.

**Le TTL : Combien de temps vous souvenez-vous ?**

Chaque entrée de cache a un **Time-To-Live (TTL)** : la durée après laquelle l'entrée expire et la prochaine requête retourne à la base de données pour des données fraîches.

C'est la tension fondamentale de la mise en cache : fraîcheur vs performance.

- **TTL court (secondes)** : Données très fraîches, mais beaucoup de cache misses. Le cache aide à peine.
- **TTL long (heures ou jours)** : Très rapide, mais les données peuvent devenir périmées. Le client voit le menu d'hier.

Pour les données de menu, cinq minutes est raisonnable. Le menu ne change pas toutes les secondes. Si un restaurant met à jour son menu, les clients pourraient voir l'ancienne version pendant jusqu'à cinq minutes — acceptable.

Pour les jetons de session (cet utilisateur est-il connecté ?), un TTL plus court a du sens, ou vous mettez à jour le cache immédiatement quand la session change.

Pour les données financières (totaux de commandes, enregistrements de paiement), ne les mettez pas en cache — ou si vous le faites, invalidez immédiatement à l'écriture.

Vous vous demandez peut-être : pourquoi ne pas simplement ajouter plus de capacité de base de données au lieu d'introduire toute une nouvelle couche de mise en cache ? Plus de réplicas, une instance plus grande — pourquoi pas ça ? La réponse est que la capacité de base de données supplémentaire multiplie votre capacité à gérer des requêtes simultanées, mais elle ne réduit pas le nombre de requêtes. Si dix mille utilisateurs déclenchent chacun quarante-sept lectures par chargement de page, ajouter un deuxième réplica de lecture signifie juste que chaque réplica gère vingt-trois mille requêtes au lieu de quarante-sept mille — le travail total ne diminue pas. Un cache élimine entièrement le travail redondant : ces dix mille utilisateurs partagent le même résultat mis en cache.

« Il n'y a que deux problèmes difficiles en informatique », cita Leo, avec la diction rodée de quelqu'un qui l'avait déjà dit. « L'invalidation de cache et le nommage des choses. »

« Pourquoi l'invalidation de cache est-elle difficile ? » demanda Maya.

« Parce que quand les données *changent-elles vraiment* ? Le menu a-t-il changé parce qu'un partenaire restaurant l'a mis à jour ? Ou parce qu'une tâche cron a tourné ? Ou parce qu'un admin l'a édité manuellement ? Chaque endroit qui peut changer les données a besoin de savoir qu'il faut informer le cache. »

C'est pourquoi les ingénieurs seniors commencent une conversation de mise en cache par « quels sont les chemins d'écriture ? » plutôt que par « ajoutons Redis. »

---

**L'histoire de l'invalidation du cache**

Ils découvrirent à quel point l'invalidation du cache était difficile la première fois qu'un partenaire restaurant se plaignit.

Le Restaurant 112 — un troquet colombien de l'Eastside — avait mis à jour ses prix un jeudi après-midi. Ils avaient augmenté l'arepa de 8 $ à 9 $. Ils appelèrent le support Nimbus vingt minutes plus tard.

« Notre menu affiche toujours l'ancien prix », dit le propriétaire. « Les clients passent des commandes à 8 $. On doit honorer ce prix maintenant. »

Tom calcula la perte pendant que Priya traçait le bug. Chaque commande passée pendant ces vingt minutes avait facturé 8 $. Le restaurant voulait 9 $. Nimbus devrait absorber la différence.

Le TTL de cinq minutes aurait dû expirer depuis longtemps. Vingt minutes s'étaient écoulées. Priya ouvrit le code.

La clé de cache était `menu:restaurant-112`. Elle avait été définie avec un TTL de 300 secondes. Elle vérifia quand elle avait été écrite pour la dernière fois.

« Elle a été définie à 14 h 03 », dit-elle. « Il y a vingt-deux minutes. »

« Mais le TTL est de cinq minutes », dit Leo.

« Le TTL est de cinq minutes à partir du moment où elle a été mise en cache pour la première fois. Mais chaque requête qui frappait le cache rafraîchissait le TTL. L'entrée de cache était touchée toutes les quelques secondes par les requêtes entrantes, et le TTL était réinitialisé. »

« Donc elle n'a jamais expiré. »

« Pas dans cette implémentation. On définissait le TTL à chaque lecture de cache. Fenêtre glissante. L'entrée restait vivante tant que quelqu'un la frappait. »

Le correctif : utiliser un TTL fixe défini uniquement à l'écriture, jamais prolongé à la lecture. L'entrée expire exactement cinq minutes après son stockage, quel que soit le nombre de fois où elle est lue. Quand le restaurant mettait à jour son menu, l'ancienne entrée expirait en cinq minutes et la prochaine requête récupérait des données fraîches.

« Et pour les cas où un restaurant met à jour les prix et qu'on a besoin que ce soit reflété immédiatement ? » demanda Tom.

« Invalidation active », dit Priya. « Quand le portail partenaire restaurant soumet une mise à jour, l'API appelle `cache.delete('menu:restaurant-112')` avant de retourner. La prochaine requête récupère des données fraîches immédiatement. »

« Mais ça nécessite que le portail connaisse le cache. »

« Chaque chemin d'écriture vers la base de données a besoin de connaître le cache. C'est ce que Leo a dit plus tôt. Maintenant on l'a vécu. »

« Je l'ai déjà déployé — oh. » Leo avait implémenté l'invalidation dans le portail mais avait oublié l'interface d'édition d'administration. Deux semaines plus tard, un admin avait mis à jour un menu via le tableau de bord interne, et l'ancien prix avait persisté dans le cache pendant cinq minutes. Une version plus petite du même incident.

Ils ajoutèrent un gestionnaire DynamoDB Streams — du chapitre précédent — qui invalidait automatiquement le cache chaque fois qu'un élément de menu changeait, quel que soit le système qui avait déclenché l'écriture. Un gestionnaire, tous les chemins d'écriture couverts.

---

**Éviction du cache : Quand le tableau est plein**

Le tableau des plats du jour a un espace limité. Quand il se remplit, vous devez effacer quelque chose pour faire de la place.

Redis (et les caches en général) ont des *politiques d'éviction* qui déterminent ce qui est supprimé quand la mémoire est pleine :

- **LRU (Least Recently Used)** : Supprimez les articles qui n'ont pas été accédés depuis le plus longtemps.
- **LFU (Least Frequently Used)** : Supprimez les articles les moins souvent accédés.
- **allkeys-random** : Éviction aléatoire. Simple, pas optimal.
- **noeviction** : Retournez une erreur quand la mémoire est pleine (l'application doit gérer ça).

Pour la plupart des applications web : LRU. Les choses que vous n'avez pas regardées récemment sont probablement moins nécessaires.

---

**Le problème de la ruée sur le cache**

« A-t-on réfléchi à ce qui se passe si tout le cache se vide d'un coup ? » demanda Priya.

« Quand est-ce que ça arriverait ? » dit Leo.

« Quand vous déployez un nouveau cluster ElastiCache. Quand le TTL d'un grand lot d'entrées expire simultanément. Quand vous videz le cache pour forcer un rafraîchissement après une correction de bug. »

Leo y réfléchit. « Si le cache est vide, chaque requête va à la base de données. Toutes en même temps. Pendant quelques secondes, la base de données gère la charge complète de chaque utilisateur simultané. »

« Sans cache devant elle. »

« Ça ferait mal. » Leo regarda les paramètres de capacité de la base de données. « On serait limités, c'est sûr. »

C'est ce qu'on appelle une **ruée sur le cache** (aussi appelée troupeau tonnant). Elle se produit quand de nombreuses entrées de cache expirent en même temps — souvent parce qu'elles ont toutes été créées au même moment pendant un déploiement ou un démarrage à froid — et que la vague soudaine de cache misses frappe toute la base de données simultanément.

Stratégies d'atténuation :

**Jitter sur le TTL** : Au lieu de définir chaque entrée de menu à exactement 300 secondes, ajoutez une variation aléatoire : 270 à 330 secondes. Les entrées expirent à des moments légèrement différents, étalant la vague de cache misses sur une minute au lieu de frapper simultanément.

**Expiration anticipée probabiliste** : Avant qu'une entrée n'expire, un petit pourcentage de requêtes la rafraîchit de manière proactive. Cela garde les entrées fraîches avant qu'elles ne deviennent périmées, empêchant l'expiration de jamais devenir un miss.

**Coalescence des requêtes (mutex/verrou)** : Quand un cache miss se produit, acquérez un verrou avant de frapper la base de données. Les autres requêtes simultanées pour la même clé attendent que la première requête se termine et repeuple le cache, puis lisent depuis le cache. Une seule requête de base de données est effectuée par cache miss, même sous forte concurrence.

Pour Nimbus, ils implémentèrent le jitter de TTL. Simple, efficace, sans complexité supplémentaire.

```python
import random
TTL_BASE = 300
TTL_JITTER = 30
ttl = TTL_BASE + random.randint(-TTL_JITTER, TTL_JITTER)
cache.set(key, value, ttl=ttl)
```

« Deux lignes de code », dit Leo. « Pour prévenir une panne potentielle de la base de données pendant les déploiements. »

« La plupart des améliorations de fiabilité sont comme ça », dit Priya. « Bon marché à implémenter, coûteuses à apprendre qu'on en avait besoin. »

---

**Structures de données Redis : Plus que du clé-valeur**

Quand Nimbus ajouta la fonctionnalité « restaurants tendance », Leo stocka d'abord le classement sous forme de simple liste JSON : `trending:global → ["NIMBUS-047", "NIMBUS-112", ...]`.

Ça fonctionnait, mais la mettre à jour était maladroit. Pour ajouter un nouveau restaurant ou mettre à jour un score, il devait lire la liste entière, la modifier dans le code d'application, et tout réécrire. Sous des écritures simultanées du pipeline d'analyse, des conditions de concurrence faisaient écraser les scores.

Priya le pointa vers les ensembles triés de Redis.

Un **ensemble trié** dans Redis stocke des membres avec des scores numériques associés. Les membres sont automatiquement triés par score. Les opérations sont atomiques — pas de conditions de concurrence dues aux mises à jour simultanées.

```
# Ajouter/mettre à jour le score d'un restaurant
ZADD trending:global 9420 "NIMBUS-047"
ZADD trending:global 8831 "NIMBUS-112"

# Obtenir les 10 meilleurs restaurants par score (le plus élevé en premier)
ZREVRANGE trending:global 0 9 WITHSCORES

# Incrémenter le score d'un restaurant de façon atomique
ZINCRBY trending:global 50 "NIMBUS-047"
```

La Lambda d'analyse appelait `ZINCRBY` chaque fois qu'une commande était passée, incrémentant le score du restaurant. La page d'accueil appelait `ZREVRANGE` pour obtenir les dix premiers. Pas de verrous, pas de conditions de concurrence, pas de cycles lecture-modification-écriture.

Redis prend en charge plusieurs autres structures de données au-delà du simple clé-valeur :

**Listes** : Séquences ordonnées. Empiler à l'avant ou à l'arrière. Utilisez pour les files d'attente, les fils d'activité récents, les flux de journaux.

**Ensembles** : Collections non ordonnées sans doublons. Opérations d'union, d'intersection, de différence. Utilisez pour « quels utilisateurs ont vu cette notification ? » ou « quels restaurants sont dans cette catégorie ? »

**Hachages** : Champs nommés à l'intérieur d'une clé. Utilisez pour des objets structurés où vous voulez mettre à jour des champs individuels sans réécrire l'objet entier.

**HyperLogLog** : Estimation probabiliste de cardinalité. Comptez les visiteurs uniques d'une page sans stocker chaque ID de visiteur. Compact et rapide.

**Pub/Sub** : Publiez des messages sur des canaux ; les abonnés les reçoivent en temps réel. Utilisez pour des notifications légères en temps réel entre services.

« Redis n'est pas juste un cache », dit Leo. « C'est un serveur de structures de données. »

« C'est sa description officielle », dit Priya.

« Je pensais que c'était juste un dictionnaire sophistiqué. »

« Ça a commencé comme ça. »

---

**Write-through : L'autre schéma de mise en cache**

Le cache-aside (chargement paresseux) est le schéma le plus courant. Mais il y en a un second qui vaut la peine d'être connu : le **write-through**.

Dans la mise en cache write-through, chaque fois que votre application écrit dans la base de données, elle écrit aussi dans le cache immédiatement.

```python
def update_menu(restaurant_id, menu_data):
    dynamodb.put_item(TableName="menu", Item=menu_data)
    cache.set(f"menu:{restaurant_id}", menu_data, ttl=300)
```

L'avantage : le cache est toujours à jour. Il n'y a pas de données périmées entre une écriture et l'expiration du TTL.

L'inconvénient : chaque écriture va à deux endroits. Et vous peuplez le cache avec des données qui pourraient ne jamais être lues. Si dix restaurants mettent à jour leurs menus mais que seuls deux d'entre eux reçoivent un trafic significatif dans les cinq minutes suivantes, vous avez fait du travail write-through pour huit caches qui ne seront pas utilisés avant d'expirer.

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Si on écrit dans le cache à chaque mise à jour, on fait plus de travail par écriture qu'avant. En quoi c'est mieux ? »

« Ce n'est pas toujours mieux », dit Priya. « Le write-through a du sens quand vous ne pouvez tolérer aucune fenêtre de données périmées après une écriture. Le cache-aside accepte jusqu'à un TTL de péremption en échange de ne pas faire de travail supplémentaire à chaque écriture. »

Pour Nimbus : le cache-aside était le bon choix. Les menus étaient lus bien plus souvent qu'ils n'étaient écrits. Une fenêtre de péremption de cinq minutes était acceptable. Pour un système de trading financier où chaque mise à jour de prix devait être reflétée immédiatement, le write-through serait plus approprié.

La décision se résume à deux questions : quel est votre ratio écriture/lecture, et à quel point tolérez-vous les lectures périmées après une écriture ?

---

**ElastiCache pour Redis : Ce que vous obtenez géré**

Comme RDS, ElastiCache prend un outil open source et gère le travail opérationnel :

- **Sauvegardes automatisées** : Snapshots Redis sur un calendrier
- **Réplication multi-AZ** : Nœud principal + réplicas de lecture dans différentes AZ
- **Basculement automatique** : Si le nœud Redis principal tombe en panne, un réplica est promu automatiquement
- **Mode cluster** : Sharding horizontal sur plusieurs nœuds pour de très grands caches
- **Chiffrement** : Chiffrement en transit et au repos pour la conformité
- **Intégration VPC** : Le cache tourne dans votre réseau privé, pas accessible publiquement

« Combien ça coûte par mois ? » demanda Tom.

« Moins que les lectures DynamoDB qu'on remplace », dit Leo. « D'environ deux cents dollars par mois. »

Leo ouvrit la page de tarification. Il avait déjà fait le calcul, mais il l'expliqua à Tom.

Un `cache.t3.micro` — le plus petit nœud — coûtait environ 12 $ par mois. Il avait 0,5 Go de mémoire. Suffisant pour une petite application avec quelques centaines de clés de cache.

Un `cache.r6g.large` — le niveau approprié au trafic de Nimbus — avait 13 Go de mémoire et coûtait environ 140 $ par mois. À titre de comparaison, Nimbus dépensait environ 400 $ par mois en lectures DynamoDB avant la mise en cache. Après la mise en cache, ces lectures avaient chuté d'environ 89 pour cent. Le calcul donnait environ 356 $ par mois économisés sur les lectures DynamoDB, moins 140 $ dépensés sur ElastiCache — une économie nette d'environ 216 $ par mois.

L'expression de Tom passa de sceptique à satisfaite. « Refais les calculs correctement avant qu'on monte en échelle, mais ça tient la route. » Il le nota.

« Et si quelqu'un essaie de s'introduire ? » dit Priya. « Le cache pourrait avoir des jetons de session. Des données utilisateur. On a besoin de jetons d'authentification sur l'instance Redis et pas d'accès public. »

« Ce sera dans le sous-réseau privé », dit Leo.

« Bien. Mais "ça ira" n'est pas une posture de sécurité », dit-elle. « Jeton d'authentification. Chiffrement en transit. VPC uniquement. »

Leo hocha la tête. Elle avait raison.

---

**Surveiller le cache**

« A-t-on réfléchi à ce qui se passe quand le cache ne fonctionne pas correctement ? » demanda Priya, une semaine après le déploiement de Redis. « Pas juste une panne complète — il fonctionne, mais mal. Taux de miss élevé. Taux d'éviction élevé. Latence qui grimpe. »

« Je le remarquerais quand les temps de chargement des pages augmentent », dit Leo.

« Moment auquel la base de données est déjà en difficulté », dit-elle.

ElastiCache expose des métriques via CloudWatch. Celles qui comptent le plus :

**CacheHitRate** : Le pourcentage de lectures de cache qui ont retourné un résultat. Idéalement au-dessus de 80 % pour un cache mature. Un taux de hit en baisse signale que vos données les plus accédées ne sont pas dans le cache — soit les TTL sont trop courts, soit le cache est trop petit, soit vos schémas d'accès ont changé.

**CacheMisses** : Nombre absolu de cache misses. Un pic soudain ici signifie que le cache n'aide pas et que la base de données prend la charge complète.

**Evictions** : Le nombre d'éléments de cache évincés pour faire de la place à de nouveaux. Des taux d'éviction élevés signifient que votre cache est trop petit pour votre ensemble de travail. Vous avez besoin de plus de mémoire ou d'une stratégie de mise en cache plus sélective.

**CurrConnections** : Connexions client actuelles à Redis. Trop de connexions peuvent épuiser la limite de connexions de Redis. Les applications devraient utiliser le pooling de connexions pour éviter d'ouvrir une nouvelle connexion à chaque requête.

**ReplicationLag** : À quel point le réplica de lecture est en retard sur le primaire. Si cela grandit, les lectures de réplica peuvent retourner des données périmées.

Leo configura deux alarmes CloudWatch. Premièrement : alerter si le taux de hit du cache tombait sous 70 % pendant quinze minutes consécutives — ça signalerait un problème à investiguer avant que la base de données ne le ressente. Deuxièmement : alerter si le taux d'éviction dépassait 100 évictions par minute — ça signalerait que le cache était sous-dimensionné.

« Deux alarmes », dit Priya, en examinant la configuration. « C'est un bon début. »

« J'ai aussi ajouté un tableau de bord », dit Leo. « Taux de hit, taux de miss, évictions, latence. Tout visible en un seul endroit. »

« C'est mieux que d'attendre que la page devienne lente. »

« Considérablement mieux », acquiesça Leo.

---

**ElastiCache vs DAX : Quel cache pour DynamoDB ?**

« Si on met en cache des données DynamoDB », demanda Maya, « pourquoi ne pas utiliser DAX au lieu d'ElastiCache ? Je l'ai vu dans la documentation. »

Bonne question.

**DAX (DynamoDB Accelerator)** est un cache en mémoire conçu spécifiquement pour DynamoDB. Il intercepte les appels d'API DynamoDB au niveau du client — votre code d'application parle à DAX en utilisant le même SDK DynamoDB. Les cache misses sont automatiquement récupérés depuis DynamoDB. Les cache hits retournent en microsecondes. L'invalidation est gérée automatiquement quand les données changent.

**ElastiCache** est un cache à usage général. Vous gérez les clés de cache, la logique du TTL, l'invalidation — tout ça. Plus de contrôle, plus de responsabilité.

Quand utiliser chacun :

| Scénario | Recommandation |
|---|---|
| Vous mettez en cache des lectures DynamoDB et voulez zéro changement d'application | DAX |
| Vous avez besoin d'une latence en microsecondes sur les lectures DynamoDB | DAX |
| Vous mettez en cache depuis plusieurs sources (DynamoDB + RDS + API externes) | ElastiCache |
| Vous avez besoin des structures de données Redis (ensembles triés, pub/sub, HyperLogLog) | ElastiCache |
| Vous avez besoin d'un contrôle fin du TTL et d'une logique d'invalidation personnalisée | ElastiCache |
| Vous avez besoin de stockage de session, de limitation de débit ou de verrous distribués | ElastiCache |

Pour Nimbus : ils choisirent ElastiCache parce qu'ils mettaient en cache des données provenant de plusieurs sources — DynamoDB pour les menus, RDS pour les résumés d'historique de commandes, des API externes pour les notes des restaurants. DAX ne fonctionne qu'avec DynamoDB. Et ils avaient besoin des ensembles triés Redis pour les classements tendance.

« Si c'était purement un problème de mise en cache DynamoDB », dit Priya, « DAX serait la réponse plus simple. Un service, invalidation automatique, même API. Mais on a plus d'une source de données. »

« Donc DAX est plus simple quand vous êtes uniquement DynamoDB », résuma Maya. « ElastiCache quand vous avez besoin de la boîte à outils complète. »

« C'est le compromis. »

### Quand les données de cache ne peuvent pas être perdues : Amazon MemoryDB

« Pourquoi quelqu'un utiliserait-il Redis comme base de données primaire ? » demanda Maya. « N'est-ce pas un cache ? »

C'est exactement la bonne question.

ElastiCache pour Redis est un cache — rapide, en mémoire, et par conception, pas la source de vérité. Si un nœud ElastiCache tombe en panne, le cache est vide au redémarrage. Les applications le réchauffent depuis la base de données. C'est très bien pour un cache.

Mais certains cas d'usage traitent Redis non pas comme un cache mais comme un magasin de données primaire — un état de session qui doit survivre aux redémarrages, un classement en temps réel qui ne peut pas être perdu, un panier d'achat qui doit persister à travers une panne d'AZ. Pour ces cas d'usage, la durabilité éventuelle d'ElastiCache est un risque.

**Amazon MemoryDB pour Redis** est une base de données en mémoire durable, entièrement gérée et compatible avec Redis. Contrairement à ElastiCache, MemoryDB utilise un journal de transactions distribué stocké sur plusieurs AZ qui rend chaque écriture durable avant qu'elle ne soit acquittée. Les données survivent aux pannes de nœud — non pas parce qu'elles sont rejouées depuis une base de données plus lente, mais parce qu'elles n'ont jamais été à un seul endroit.

La distinction clé :

| | ElastiCache pour Redis | MemoryDB pour Redis |
|---|---|---|
| Rôle | Couche de cache | Base de données primaire |
| Durabilité | Non garantie en cas de panne | Journal de transactions multi-AZ |
| Latence | Lectures et écritures en microsecondes | Lectures en microsecondes, écritures en millisecondes à un chiffre |

Les deux prennent en charge les mêmes commandes et structures de données Redis. L'API est la même. La garantie de durabilité ne l'est pas.

Pour Nimbus : l'équipe veut stocker les nombres de commandes en temps réel par restaurant sous forme d'ensemble trié Redis — et il doit survivre à une panne d'AZ sans réamorçage depuis la base de données. Cette exigence — compatible Redis *et* durable — est le signal exact pour MemoryDB.

« Donc on n'a pas à le réchauffer après une panne ? » demanda Leo.

« C'est le but », dit Priya. « Si le nœud tombe en panne et revient, les données sont là. Le journal de transactions les a gardées. »

Leo fixa la page de tarification un moment. « Ça coûte plus cher qu'ElastiCache. »

« Tout ce qui mérite qu'on lui fasse confiance coûte plus cher », dit Priya.

## Forces et limites

**Pourquoi la mise en cache est puissante** :

- Réduit considérablement la charge de la base de données (moins de requêtes, coûts plus bas)
- Temps de réponse inférieurs à la milliseconde pour les cache hits
- Protège votre base de données des pics de trafic
- Redis prend en charge des structures de données plus riches qu'un simple magasin clé-valeur
- L'atténuation de la ruée sur le cache (jitter de TTL, coalescence) protège contre les pics de démarrage à froid

**Là où la mise en cache se complique** :

- L'invalidation du cache est vraiment difficile — les données périmées causent des bugs
- Ajoute de la complexité opérationnelle (un autre service à surveiller, un autre point de défaillance)
- Problème de démarrage à froid : quand vous déployez de façon fraîche, le cache est vide — la base de données prend la charge complète
- Ruée sur le cache : si de nombreuses entrées expirent d'un coup, toutes les requêtes frappent la base de données simultanément
- Les nœuds ElastiCache ne sont pas gratuits — vous les payez même quand ils sont inactifs

**ElastiCache vs DynamoDB DAX** :

Si vous mettez en cache des données DynamoDB spécifiquement, AWS propose **DAX (DynamoDB Accelerator)** — un cache en mémoire conçu spécifiquement pour DynamoDB. DAX est transparent pour votre code d'application (même API), réduit la latence de lecture DynamoDB à des microsecondes, et gère l'invalidation du cache automatiquement.

Utilisez DAX quand votre goulot d'étranglement est les lectures DynamoDB et que vous voulez une mise en cache sans changement. Utilisez ElastiCache quand vous avez besoin d'un cache à usage général pour n'importe quelle source de données, ou quand vous avez besoin des structures de données Redis.

## Résumé

Quarante-sept appels à la base de données sont devenus une seule recherche dans le cache. La page est passée de 188 millisecondes à 12. Ajouter une couche de mise en cache est l'un des changements à plus fort levier qu'une application en croissance puisse faire — mais seulement quand le cache est conçu avec réflexion, avec des réponses claires à la question « quand ces données changent-elles ? »

- Un cache est un magasin rapide de données récemment récupérées — vous demandez une fois, vous vous souvenez de la réponse. ElastiCache est le service de mise en cache géré d'AWS, prenant en charge **Redis** (persistance, structures de données complexes, pub/sub) et **Memcached** (clé-valeur pur, mise à l'échelle horizontale).
- Le **schéma cache-aside** (chargement paresseux) : vérifiez d'abord le cache, revenez à la base de données sur miss. Le **TTL** contrôle la durée de mise en cache des données — un TTL court signifie des données plus fraîches et plus de misses ; un TTL long signifie des réponses plus rapides et une péremption potentielle.
- Mettez en cache la bonne chose : des données par entité partagées entre de nombreux utilisateurs, pas des données par utilisateur uniques à chaque session. La ruée sur le cache se produit quand de nombreuses entrées expirent simultanément — atténuez avec le jitter de TTL.
- **DAX** est le bon choix pour une mise en cache uniquement DynamoDB. **ElastiCache** est plus flexible pour la mise en cache multi-sources et les structures de données Redis.
- La partie la plus difficile de la mise en cache est l'invalidation : savoir quand les données changent et mettre à jour le cache sur tous les chemins de code qui les écrivent. Un cache n'est aussi fiable que sa stratégie d'invalidation.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.3)*

- **Redis vs Memcached à l'examen** : Redis = persistance, réplication, structures complexes, pub/sub. Memcached = clé-valeur simple, mise à l'échelle horizontale pure. Quand le scénario mentionne « vous ne pouvez pas perdre les données mises en cache », la réponse est Redis (il persiste sur disque).
- **Signaux de cas d'usage ElastiCache** : « la base de données est un goulot d'étranglement », « charge de travail intensive en lecture », « réduire la latence », « magasin de session » — tout ça pointe vers ElastiCache.
- **Signal DAX** : « réduire la latence de lecture DynamoDB » ou « les lectures DynamoDB sont trop lentes » → DAX, pas ElastiCache.
- **Gestion de session** : ElastiCache Redis est la réponse canonique pour stocker les données de session utilisateur. Application sans état + magasin de session Redis = mise à l'échelle horizontale avec des sessions cohérentes.
- **Write-through vs cache-aside** : Le cache-aside (chargement paresseux) est le plus courant. Le write-through met à jour le cache à chaque écriture — jamais périmé, mais plus d'opérations d'écriture. L'examen peut les distinguer.
- **Politiques d'éviction du cache** : LRU (least recently used) est la réponse d'examen la plus courante pour les charges de travail web générales.
- **ElastiCache vs MemoryDB** : ElastiCache = couche de cache, rapide, perte de données acceptable en cas de panne. MemoryDB = base de données primaire en mémoire durable, compatible Redis, journal de transactions multi-AZ. Déclencheur d'examen : « compatible Redis ET durable » ou « magasin de données primaire en Redis » → MemoryDB, pas ElastiCache.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce que l'invalidation de cache, et pourquoi est-elle difficile ?

*(Indice : Pensez à tous les endroits dans Nimbus où les données de menu pourraient être mises à jour — le portail partenaire restaurant, un outil d'administration, une tâche cron. Chacun de ces chemins a besoin de connaître le cache.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une plateforme de streaming vidéo sert des millions d'utilisateurs. Le catalogue de films disponibles change rarement (mis à jour la nuit). L'application connaît une utilisation élevée du CPU de la base de données parce que chaque requête d'utilisateur interroge le catalogue. L'équipe veut réduire la charge de la base de données tout en gardant les données du catalogue précises dans l'heure suivant les mises à jour.

Quelle solution répond LE MIEUX à ces exigences ?

A) Ajouter des réplicas de lecture à la base de données RDS pour distribuer la charge  
B) Migrer le catalogue vers DynamoDB avec une capacité à la demande  
C) Utiliser ElastiCache pour Redis avec un TTL d'une heure pour les données du catalogue  
D) Augmenter la taille de l'instance RDS pour gérer plus de requêtes simultanées

**Indice 1** : Les données sont intensives en lecture et changent rarement. Quel schéma est idéal pour ça ?

**Indice 2** : « Précis dans l'heure » se traduit directement par un paramètre de configuration de cache spécifique.

**Indice 3** : L'objectif est de réduire la charge de la base de données, pas juste d'en gérer plus.

**Réponse** : C

**Explication** : ElastiCache avec un TTL d'une heure met en cache les données du catalogue après la première requête par clé. Les requêtes suivantes retournent depuis le cache sans toucher la base de données. Quand la mise à jour nocturne se produit, les entrées expirent dans l'heure et des données fraîches sont chargées à la prochaine requête.

**Pourquoi pas A ?** Les réplicas de lecture distribuent le trafic de lecture sur plus de nœuds de base de données mais ne réduisent pas le nombre total de requêtes. Ils sont utiles pour mettre à l'échelle les lectures, pas pour réduire la charge de la base de données due aux requêtes fréquemment répétées.

**Pourquoi pas B ?** Migrer vers DynamoDB ne résout pas le problème sous-jacent — les données du catalogue seraient toujours récupérées depuis la base de données (DynamoDB) à chaque requête utilisateur.

**Pourquoi pas D ?** Mettre à l'échelle l'instance gère plus de requêtes simultanées mais ne réduit pas le nombre de requêtes. L'inefficacité fondamentale demeure.

*Domaine SAA-C03 : Concevoir des architectures performantes — Tâche 3.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus veut ajouter une fonctionnalité « restaurants tendance » : une liste classée des 10 meilleurs restaurants par volume de commandes dans les dernières 24 heures, mise à jour toutes les 15 minutes.

Comment implémenteriez-vous ça avec ElastiCache Redis ? Quelle structure de données Redis utiliseriez-vous pour le classement ? Quel serait votre TTL de cache, et à quel moment exactement mettriez-vous à jour le cache ?

Considérez aussi : que se passe-t-il si le nœud ElastiCache tombe en panne ? La fonctionnalité casse-t-elle ? Comment concevriez-vous autour de cette panne ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à la conception du cache et à la réflexion sur les pannes.)*

## Scène post-générique

« Je l'ai déjà déployé — oh. » Leo avait poussé l'intégration Redis en production avant de mettre à jour les paramètres du pool de connexions. Sous charge, l'application ouvrait trop de connexions Redis. Il avait dû la revenir en arrière et redéployer avec la bonne configuration.

Leo a ajouté la mise en cache Redis pour le menu. Le temps de chargement des pages est passé de 188 millisecondes à 12 millisecondes.

Quarante-sept appels DynamoDB sont devenus une seule recherche Redis. L'appel prenait 0,8 milliseconde.

Il a annoncé ça au standup du lundi.

« Bon travail », dit Priya, sans lever les yeux de son ordinateur.

« Merci », dit Leo.

« Quand as-tu fait pivoter le jeton d'authentification Redis pour la dernière fois ? »

Leo regarda ses notes. « Je pense que je n'en ai pas configuré un. »

« Donc le cache n'est pas authentifié. »

« C'est à l'intérieur du VPC. »

« Tout ce qui est compromis l'est aussi. » Elle leva finalement les yeux. « Si l'ordinateur portable de Leo est infecté et que quelqu'un pivote dans le VPC, votre cache n'a pas de mot de passe. »

Leo la fixa.

« Je vais configurer le jeton d'authentification », dit-il.

Dans le prochain chapitre : le réseau privé qui sépare ce que Nimbus possède du reste d'internet.
