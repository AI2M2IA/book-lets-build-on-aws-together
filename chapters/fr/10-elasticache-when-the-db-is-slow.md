# Chapitre 10 : Quand la base de données est trop lente

Les métriques de temps de chargement des pages étaient ouvertes à l'écran. Leo les regardait depuis vingt minutes sans rien dire.

Quarante-sept requêtes DynamoDB par chargement de page. Cent quatre-vingt-huit millisecondes rien que pour récupérer les données — avant que le navigateur rende un seul pixel.

Il avait fait le calcul. Dix mille utilisateurs simultanés un vendredi soir : quatre cent soixante-dix mille lectures DynamoDB par minute. Le coût était réel. Mais la latence était le vrai problème. Un utilisateur ouvrant la page de navigation Nimbus attendait presque deux cents millisecondes avant que quoi que ce soit apparaisse — et c'était sur une connexion rapide.

« La base de données répond en quatre millisecondes par requête », dit Leo. « C'est en fait rapide. DynamoDB fait son travail. »

« Alors pourquoi la page est lente ? » demanda Maya.

« Parce qu'on l'appelle quarante-sept fois par chargement de page », dit Priya. « Le problème n'est pas la base de données. Le problème est qu'on lui parle trop. »

Tom se pencha en avant. Il avait le regard qu'il prenait quand un problème allait devenir une conversation de coût. « Donc la solution est de lui parler moins ? »

« Lui parler moins. Se souvenir plus. »

**L'analogie du restaurant**

Imaginez la cuisine d'un restaurant. Chaque fois qu'un serveur a besoin de connaître les plats du jour, il marche vers l'arrière, demande au chef, et revient à la table.

Ça fonctionne bien si vous avez deux serveurs et trois tables.

Maintenant imaginez deux cents serveurs et mille tables. Chacun d'eux marchant vers l'arrière pour la même question. La cuisine devient le goulot d'étranglement. Le chef répond à la même question quatre cents fois par heure.

La solution évidente : écrire les plats du jour sur un tableau à l'entrée du restaurant. Chaque serveur lit depuis le tableau. La cuisine se repose. Le tableau est mis à jour quand les plats changent.

Ce tableau est un cache.

Un cache est un magasin rapide et local de données récemment récupérées. Au lieu de récupérer la même chose depuis une source lente à répétition, vous la récupérez une fois et la gardez proche.

**Pourquoi ne pas juste utiliser la mémoire ?**

« Est-ce qu'on peut pas juste stocker le menu dans la mémoire de l'application ? » demanda Leo.

Question valide.

Vous pouvez. Pour une application à serveur unique, la mise en cache en mémoire fonctionne bien. Mais Nimbus tourne derrière un équilibreur de charge, sur plusieurs instances EC2. Si une instance met le menu en cache dans sa mémoire, les autres instances n'ont pas ces données. Elles maintiennent chacune des caches séparés. Quand le menu se met à jour, vous devrez invalider tous.

C'est le *problème de cohérence du cache* — garder plusieurs caches cohérents.

ElastiCache résout ça en fournissant un cache *centralisé* que toutes vos instances partagent. Au lieu que chaque serveur ait sa propre mémoire, chaque serveur lit depuis et écrit vers le même cache. Une mise à jour se propage à tous.

**Découvrez ElastiCache**

Amazon ElastiCache est un service de mise en cache géré. Il fait tourner des moteurs de mise en cache populaires — Redis et Memcached — sans que vous ayez à gérer les serveurs.

**Redis** est le plus puissant des deux. Il supporte des structures de données complexes (chaînes, listes, ensembles, hachages, ensembles triés), la persistance (les données survivent aux redémarrages), la réplication et la messagerie pub/sub. Redis peut faire plus que la mise en cache — il peut fonctionner comme un magasin de données léger.

**Memcached** est plus simple. Mise en cache clé-valeur pure, évolutive horizontalement, pas de persistance. Plus rapide pour les cas d'utilisation simples mais moins de fonctionnalités.

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

« Il n'y a que deux problèmes difficiles en informatique », cita Leo, avec la livraison pratiquée de quelqu'un qui l'avait dit avant. « L'invalidation de cache et le nommage des choses. »

« Pourquoi l'invalidation de cache est-elle difficile ? » demanda Maya.

« Parce que quand les données *changent-elles vraiment* ? Le menu a-t-il changé parce qu'un partenaire restaurant l'a mis à jour ? Ou parce qu'une tâche cron a tournée ? Ou parce qu'un admin l'a édité manuellement ? Chaque endroit qui peut changer les données a besoin de savoir d'informer le cache. »

C'est pourquoi les ingénieurs seniors commencent une conversation de mise en cache par « quels sont les chemins d'écriture ? » plutôt que « ajoutons Redis. »

**Éviction du cache : Quand le tableau est plein**

Le tableau des plats du jour a de l'espace limité. Quand il est plein, vous devez effacer quelque chose pour faire de la place.

Redis (et les caches en général) ont des *politiques d'éviction* qui déterminent ce qui est supprimé quand la mémoire est pleine :

- **LRU (Least Recently Used)** : Supprimez les articles qui n'ont pas été accédés le plus longtemps.
- **LFU (Least Frequently Used)** : Supprimez les articles les moins souvent accédés.
- **allkeys-random** : Éviction aléatoire. Simple, pas optimal.
- **noeviction** : Retournez une erreur quand la mémoire est pleine (l'application doit gérer ça).

Pour la plupart des applications web : LRU. Les choses que vous n'avez pas regardées récemment sont probablement moins nécessaires.

**ElastiCache pour Redis : Ce que vous obtenez géré**

Comme RDS, ElastiCache prend un outil open source et gère le travail opérationnel :

- **Sauvegardes automatisées** : Snapshots Redis sur un calendrier
- **Réplication multi-AZ** : Nœud principal + réplicas de lecture dans différentes AZ
- **Basculement automatique** : Si le nœud Redis principal tombe en panne, un réplica est promu automatiquement
- **Mode cluster** : Sharding horizontal sur plusieurs nœuds pour de très grands caches
- **Chiffrement** : Chiffrement en transit et au repos pour la conformité
- **Intégration VPC** : Le cache tourne dans votre réseau privé, pas accessible publiquement

Tom regarda la liste de fonctionnalités. « Combien ça coûte ? »

« Moins que les lectures DynamoDB qu'on remplace », dit Leo. « J'ai fait les calculs. »

L'expression de Tom passa de sceptique à intéressé. C'était un progrès.

## Forces et limites

**Pourquoi la mise en cache est puissante** :

- Réduit considérablement la charge de la base de données (moins de requêtes, coûts plus bas)
- Temps de réponse inférieurs à la milliseconde pour les cache hits
- Protège votre base de données des pics de trafic
- Redis supporte des structures de données plus riches qu'un simple magasin clé-valeur

**Là où la mise en cache se complique** :

- L'invalidation du cache est vraiment difficile — les données périmées causent des bugs
- Ajoute de la complexité opérationnelle (un autre service à surveiller, un autre point de défaillance)
- Problème de démarrage à froid : quand vous déployez de façon fraîche, le cache est vide — la base de données prend la charge complète
- Tempête de cache : si de nombreuses entrées expirent en même temps, toutes les requêtes frappent la base de données simultanément
- Les nœuds ElastiCache ne sont pas gratuits — vous les payez même quand ils sont inactifs

**ElastiCache vs DynamoDB DAX** :

Si vous mettez en cache des données DynamoDB spécifiquement, AWS propose **DAX (DynamoDB Accelerator)** — un cache en mémoire dédié pour DynamoDB. DAX est transparent pour votre code d'application (même API), réduit la latence de lecture DynamoDB à des microsecondes, et gère l'invalidation du cache automatiquement.

Utilisez DAX quand votre goulot d'étranglement est les lectures DynamoDB. Utilisez ElastiCache quand vous avez besoin d'un cache à usage général pour n'importe quelle source de données.

## Résumé

- Un cache est un magasin rapide de données récemment récupérées — vous demandez une fois, vous vous souvenez de la réponse.
- ElastiCache est le service de mise en cache géré d'AWS, supportant Redis et Memcached.
- **Redis** est plus riche (structures de données complexes, persistance, pub/sub). **Memcached** est plus simple (clé-valeur pure, évolutif horizontalement).
- Le **schéma cache-aside** (chargement paresseux) : vérifiez d'abord le cache, revenez à la base de données sur miss.
- **TTL** contrôle la durée de mise en cache des données. TTL court = frais, beaucoup de misses. TTL long = rapide, potentiellement périmé.
- L'invalidation du cache est difficile. Connaissez tous les chemins d'écriture avant d'ajouter un cache.
- ElastiCache gère la réplication, le basculement, les sauvegardes et le chiffrement — vous vous concentrez sur la conception du cache.
- **DAX** est le cache spécifique à DynamoDB. ElastiCache est à usage général.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.3)*

- **Redis vs Memcached à l'examen** : Redis = persistance, réplication, structures complexes, pub/sub. Memcached = clé-valeur simple, mise à l'échelle horizontale pure. Quand le scénario mentionne « vous ne pouvez pas perdre les données mises en cache », la réponse est Redis (il persiste sur disque).
- **Signaux de cas d'utilisation ElastiCache** : « la base de données est un goulot d'étranglement », « charge de travail intensive en lecture », « réduire la latence », « magasin de session » — tout ça pointe vers ElastiCache.
- **Signal DAX** : « réduire la latence de lecture DynamoDB » ou « les lectures DynamoDB sont trop lentes » → DAX, pas ElastiCache.
- **Gestion de session** : ElastiCache Redis est la réponse canonique pour stocker les données de session utilisateur. Application sans état + magasin de session Redis = mise à l'échelle horizontale avec des sessions cohérentes.
- **Write-through vs cache-aside** : Cache-aside (chargement paresseux) est le plus courant. Write-through met à jour le cache à chaque écriture — jamais périmé, mais plus d'opérations d'écriture. L'examen peut les distinguer.
- **Politiques d'éviction du cache** : LRU (least recently used) est la réponse d'examen la plus courante pour les charges de travail web générales.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce que l'invalidation de cache, et pourquoi est-elle difficile ?

*(Indice : Pensez à tous les endroits dans Nimbus où les données de menu pourraient être mises à jour — le portail partenaire restaurant, un outil d'administration, une tâche cron. Chacun de ces chemins a besoin de savoir à propos du cache.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une plateforme de streaming vidéo sert des millions d'utilisateurs. Le catalogue de films disponibles change rarement (mis à jour nuitamment). L'application connaît une utilisation élevée du CPU de la base de données parce que chaque requête d'utilisateur interroge le catalogue. L'équipe veut réduire la charge de la base de données tout en gardant les données du catalogue précises dans l'heure suivant les mises à jour.

Quelle solution répond LE MIEUX à ces exigences ?

A) Ajouter des réplicas de lecture à la base de données RDS pour distribuer la charge  
B) Migrer le catalogue vers DynamoDB avec une capacité à la demande  
C) Utiliser ElastiCache pour Redis avec un TTL d'une heure pour les données du catalogue  
D) Augmenter la taille de l'instance RDS pour gérer plus de requêtes simultanées

**Indice 1** : Les données sont intensives en lecture et changent rarement. Quel schéma est idéal pour ça ?

**Indice 2** : « Précis dans l'heure » se traduit directement par un paramètre de configuration de cache spécifique.

**Indice 3** : L'objectif est de réduire la charge de la base de données, pas juste d'en gérer plus.

**Réponse** : C

**Explication** : ElastiCache avec un TTL d'une heure met en cache les données du catalogue après la première requête par clé. Les requêtes suivantes retournent depuis le cache sans toucher la base de données. Quand la mise à jour nuitamment se produit, les entrées expirent dans l'heure et des données fraîches sont chargées à la prochaine requête.

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

Leo a ajouté la mise en cache Redis pour le menu. Le temps de chargement des pages est passé de 188 millisecondes à 12 millisecondes.

Quarante-sept appels DynamoDB sont devenus une seule recherche Redis. L'appel prenait 0,8 milliseconde.

Il a annoncé ça au standup du lundi.

« Bon travail », dit Priya, sans lever les yeux de son ordinateur.

« Merci », dit Leo.

« Quand as-tu fait pivoter le jeton d'authentification Redis pour la dernière fois ? »

Leo regarda ses notes. « Je pense que je n'en ai pas configuré un. »

« Donc le cache n'est pas authentifié. »

« C'est à l'intérieur du VPC. »

« Tout ce qui est compromis aussi. » Elle leva finalement les yeux. « Si l'ordinateur portable de Leo est infecté et que quelqu'un pivote dans le VPC, votre cache n'a pas de mot de passe. »

Leo la fixa.

« Je vais configurer le jeton d'authentification », dit-il.

Dans le prochain chapitre : le réseau privé qui sépare ce que Nimbus possède du reste d'internet.
