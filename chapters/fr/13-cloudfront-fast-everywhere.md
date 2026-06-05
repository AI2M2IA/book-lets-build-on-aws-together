# Chapitre 13 : Rapide partout

Une photo voyageant depuis un serveur en Virginie jusqu'à un téléphone à Seattle parcourt environ 4 400 kilomètres de câble à fibre optique. Aux deux tiers de la vitesse de la lumière, cela représente environ 25 millisecondes de pure physique — inévitable, non négociable, inscrite dans les lois de l'univers.

Ajoutez ensuite l'aller-retour. Ajoutez ensuite le temps de traitement. Le navigateur n'a pas encore commencé à afficher le rendu et 80 millisecondes sont déjà écoulées.

`eatnimbus.com` était en ligne. Leo avait vérifié les métriques de latence des utilisateurs de la côte Ouest : 80 à 100 millisecondes par requête. Cela peut sembler peu, mais ça s'accumule.

Charger le menu : 90 ms. Charger la liste des restaurants : 80 ms. Charger les photos du restaurant : 200 ms (les images sont lourdes). Temps total avant qu'un utilisateur puisse passer une commande : plus d'une demi-seconde sur une bonne connexion.

« La physique est le problème », dit Leo. « Les serveurs sont en Virginie. Les utilisateurs sont sur la côte Ouest. »

« Déplacez les serveurs vers la côte Ouest », dit Tom.

« Ça coûte de l'argent. »

« Combien ? »

« Beaucoup. Et ça crée un tout nouveau problème : synchroniser la base de données de la côte Est et celle de la côte Ouest. »

Priya leva les yeux de son ordinateur portable. « Ou on ne déplace pas les serveurs. On déplace le *contenu*. »

**L'analogie de l'entrepôt préapprovisionné**

Imaginez Amazon le détaillant, pas la société de cloud. Il possède un immense entrepôt en un seul endroit avec tous les produits. S'il expédiait chaque commande depuis cet entrepôt unique, les clients dans des villes éloignées attendraient des jours.

À la place, Amazon possède des centres de traitement des commandes près des grandes zones de population. Quand un produit est populaire, ces entrepôts locaux sont pré-approvisionnés. Quand un client à Seattle commande un livre, il est expédié depuis le centre de traitement local — pas depuis la Virginie.

C'est un **Content Delivery Network (CDN)** : un réseau de serveurs géographiquement distribués qui mettent en cache des copies de votre contenu près de vos utilisateurs.

Quand un utilisateur à Seattle demande votre page d'accueil, le CDN la sert depuis un serveur à Seattle. Pas la Virginie. La requête ne traverse jamais le pays.

**Présentation de CloudFront**

Amazon CloudFront est le CDN d'AWS. Il fonctionne via un réseau mondial de **points de présence** — des serveurs de cache positionnés dans des villes du monde entier. Au moment de la rédaction, il y a plus de 500 points de présence dans plus de 90 villes.

Quand vous configurez CloudFront, vous spécifiez une **origine** : la source de votre contenu réel. Votre origine peut être :

- Un compartiment S3 (fichiers statiques : images, CSS, JavaScript, PDFs)
- Un Application Load Balancer (contenu dynamique de votre application)
- Une instance EC2
- Un serveur HTTP n'importe où sur Internet

CloudFront se place devant votre origine. Les requêtes arrivent au point de présence le plus proche. Si le point de présence a le contenu en cache, il le renvoie immédiatement. Sinon (un *échec de cache*), il le récupère depuis votre origine, le met en cache et le renvoie.

**Comment fonctionne la mise en cache CloudFront**

La première requête pour tout contenu est toujours un échec de cache — elle va vers l'origine. Chaque requête suivante atteint le cache au point de présence.

Pour Nimbus, les photos du menu sont des candidats parfaits pour CloudFront. Les photos de restaurants changent rarement (peut-être quand le restaurant met à jour son profil). Avec CloudFront :

1. L'utilisateur à Seattle demande `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront vérifie le point de présence à Seattle — pas encore en cache (échec de cache)
3. CloudFront récupère depuis S3 dans us-east-1 (~80 ms)
4. CloudFront stocke la photo dans le point de présence de Seattle
5. Le prochain utilisateur à Seattle demande la même photo
6. CloudFront sert depuis le cache local du point de présence (~5 ms)

La même pénalité de 80 ms pour la première requête. Mais la millième requête depuis la même ville prend 5 millisecondes.

Les **en-têtes Cache-Control** et les **paramètres TTL** dans CloudFront déterminent la durée de mise en cache du contenu au point de présence. Les fichiers images peuvent être mis en cache pendant des heures ou des jours. Les pages HTML (qui changent plus souvent) peuvent être mises en cache pendant des minutes ou des secondes.

**Contenu dynamique : CloudFront au-delà de la mise en cache**

« Mais qu'en est-il de nos réponses API ? » demanda Leo. « Elles sont dynamiques — elles changent par utilisateur, par requête. On ne peut pas mettre en cache une page d'historique de commandes. »

C'est vrai. Mais CloudFront aide quand même avec le contenu dynamique.

Même lorsque le contenu ne peut pas être mis en cache, CloudFront achemine la requête depuis le point de présence vers l'origine via le réseau privé dorsal d'AWS — la fibre haute vitesse reliant l'infrastructure AWS à l'échelle mondiale. C'est plus rapide et plus fiable que d'acheminer via l'Internet public, où le trafic peut rebondir entre plusieurs opérateurs.

Résultat : les requêtes dynamiques sont encore 20 à 40 % plus rapides via CloudFront que d'aller directement vers l'origine via l'Internet public. Non pas grâce à la mise en cache, mais grâce au chemin réseau.

De plus, CloudFront offre :

**Terminaison SSL/TLS** : CloudFront gère le HTTPS au point de présence. La connexion entre l'utilisateur et CloudFront est chiffrée. CloudFront peut se connecter à votre origine via HTTP en interne (réduisant la charge de l'origine) ou HTTPS (pour un chiffrement de bout en bout).

**Protection DDoS** : CloudFront est intégré à AWS Shield Standard. La distribution du trafic sur des centaines de points de présence signifie que les attaques sont absorbées au point de présence plutôt que de marteler votre origine.

**Restriction géographique** : Bloquez l'accès depuis des pays spécifiques. Si Nimbus n'est autorisé à opérer que sur certains marchés, CloudFront peut l'appliquer au point de présence sans que la requête n'atteigne jamais vos serveurs.

**Comportements CloudFront : règles de mise en cache précises**

Une distribution CloudFront peut avoir plusieurs **comportements** — des règles de routage basées sur des modèles d'URL.

Pour Nimbus :

- `/images/*` → Mise en cache au point de présence pendant 7 jours (les photos ne changent pas souvent)
- `/static/*` → Mise en cache au point de présence pendant 30 jours (CSS et JavaScript avec des noms de fichiers versionnés)
- `/api/*` → Pas de mise en cache ; transférer directement vers l'équilibreur de charge
- `/*` → Mise en cache pendant 5 minutes (pages HTML)

Cela permet à CloudFront d'être intelligent : mettre agressivement en cache ce qui est stable, laisser passer ce qui est dynamique.

**Origin Access Control : sécuriser S3 avec CloudFront**

Si votre compartiment S3 contient du contenu privé qui ne doit être servi que via CloudFront (pas directement), vous pouvez utiliser **Origin Access Control (OAC)** pour vous assurer que S3 rejette les requêtes qui ne proviennent pas de CloudFront.

Ainsi :

- `d1234abcd.cloudfront.net/image.jpg` Servi (CloudFront a la permission)
- `nimbus-assets.s3.amazonaws.com/image.jpg` Bloqué (accès direct S3 refusé)

Votre contenu n'est accessible que via votre distribution, avec vos règles de cache et vos paramètres de sécurité appliqués.

## Points forts et limites

**Pourquoi CloudFront est puissant** :

- Points de présence dans plus de 90 villes — la plupart des utilisateurs reçoivent du contenu à moins de 20 ms
- Contenu statique servi en millisecondes à un chiffre après le premier cache
- Réduit considérablement la charge sur l'origine (le trafic répété n'atteint jamais vos serveurs)
- Intégré à AWS Shield, WAF et Certificate Manager
- Pas de planification de capacité nécessaire — CloudFront s'adapte automatiquement

**Là où ça se complique** :

- Le contenu mis en cache peut être périmé — l'invalidation du cache coûte de l'argent (0,005 $ par 1 000 chemins)
- Les en-têtes Cache-Control doivent être correctement définis à l'origine — les erreurs entraînent du contenu périmé
- Le contenu dynamique bénéficie de l'optimisation du routage mais pas de la mise en cache
- Déboguer le comportement du cache (ce qui est mis en cache, où, pendant combien de temps) nécessite de comprendre plusieurs couches : les en-têtes d'origine, les paramètres TTL de CloudFront, les règles de comportement
- Le transfert de données via CloudFront coûte de l'argent, bien que moins que le transfert de données standard

## Résumé

- Un **CDN** met en cache des copies de votre contenu dans des points de présence proches de vos utilisateurs — réduisant la latence et la charge sur l'origine.
- **CloudFront** est le CDN d'AWS, avec plus de 500 points de présence dans le monde.
- Les échecs de cache récupèrent depuis l'**origine** (S3, ALB, EC2). Les succès de cache servent depuis le point de présence — millisecondes, pas des centaines de millisecondes.
- Les **comportements** vous permettent de définir différentes règles de mise en cache pour différents modèles d'URL.
- Le contenu dynamique n'est pas mis en cache, mais CloudFront améliore quand même les performances via le réseau dorsal privé d'AWS.
- **Origin Access Control** restreint l'accès direct à S3 — le contenu n'est servi que via CloudFront.
- Intégré à Shield (DDoS), WAF (pare-feu applicatif) et ACM (certificats SSL).

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures haute performance (Domaine 3, Tâche 3.4)*

- **CloudFront + S3** : Modèle d'examen classique pour servir des sites web statiques à l'échelle mondiale. Compartiment S3 comme origine, CloudFront comme CDN, Origin Access Control pour empêcher l'accès direct à S3.
- **Points de présence vs Régions vs AZ** : Les points de présence sont plus nombreux et n'existent que pour la mise en cache/CDN. Ils ne sont pas identiques aux AZ (qui exécutent votre calcul).
- **Invalidation du cache** : Crée une invalidation `/images/*` pour forcer CloudFront à récupérer du contenu frais. Coûte de l'argent — l'examen peut demander l'alternative économique : les URL versionnées (`image-v2.jpg` au lieu de `image.jpg`), qui contournent naturellement le cache.
- **Contrôle du TTL** : `Cache-Control: max-age=3600` à l'origine définit un TTL de cache d'1 heure. CloudFront respecte ces en-têtes.
- **CloudFront Functions vs Lambda@Edge** : CloudFront Functions s'exécutent au point de présence pour la manipulation légère de requêtes/réponses (sous-milliseconde). Lambda@Edge exécute votre code Lambda aux points de présence pour un traitement plus lourd. L'examen les distingue par la complexité du cas d'utilisation.
- **URL signées et cookies signés** : Contrôlez qui peut accéder au contenu via CloudFront. Les URL signées donnent accès à des fichiers spécifiques ; les cookies signés donnent accès à plusieurs fichiers. L'examen les utilise pour le « contenu abonné payant ».

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre un succès de cache et un échec de cache CloudFront. Que se passe-t-il dans chaque cas ?

*(Indice : Pensez à l'origine du contenu et à la différence de temps de réponse entre les deux cas.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de logiciels distribue de grands fichiers d'installation (~2 Go chacun) depuis un compartiment S3 à des clients dans le monde entier. Les vitesses de téléchargement sont lentes pour les clients en Asie. L'équipe souhaite améliorer les performances sans répliquer le compartiment S3 dans plusieurs régions. Elle doit également s'assurer que seuls les clients payants peuvent télécharger les installateurs.

Quelle solution répond LE MIEUX à ces exigences ?

A) Activer S3 Transfer Acceleration sur le compartiment et générer des URL pré-signées pour les clients payants  
B) Utiliser CloudFront avec le compartiment S3 comme origine, activer Origin Access Control et utiliser des URL signées CloudFront pour les clients payants  
C) Créer un compartiment S3 dans chaque région AWS et utiliser le routage par géolocalisation Route 53 pour diriger les clients vers le compartiment le plus proche  
D) Utiliser un Application Load Balancer dans chaque région avec des instances EC2 qui servent les fichiers d'installation

**Indice 1** : L'exigence est d'améliorer les performances mondiales *sans* répliquer le compartiment. Quelle option ne nécessite pas plusieurs compartiments ?

**Indice 2** : Quel service contrôle spécifiquement qui peut accéder au contenu servi via CloudFront ?

**Indice 3** : S3 Transfer Acceleration est optimisé pour les téléchargements longue distance *vers* S3. Pour distribuer du contenu *depuis* S3 à des utilisateurs mondiaux, CloudFront est le bon outil.

**Réponse** : B

**Explication** : CloudFront met en cache les fichiers d'installation dans les points de présence du monde entier après le premier téléchargement. Les téléchargements suivants depuis la même région proviennent du point de présence — bien plus rapide que de traverser le Pacifique depuis S3 dans us-east-1. Origin Access Control garantit que le compartiment S3 n'est accessible que via CloudFront. Les URL signées restreignent l'accès aux clients payants.

**Pourquoi pas A ?** S3 Transfer Acceleration est optimisé pour les téléchargements longue distance *vers* S3 — pas pour distribuer du contenu *depuis* S3 à une audience mondiale. Pour cela, CloudFront est le bon outil. Les URL pré-signées contrôlent l'accès mais n'améliorent pas les performances mondiales.

**Pourquoi pas C ?** Créer un compartiment S3 par région fonctionne pour les performances, mais contredit l'exigence d'éviter la réplication. Cela nécessite également une stratégie de synchronisation des données entre les compartiments.

**Pourquoi pas D ?** Les instances EC2 derrière un équilibreur de charge dans chaque région sont nettement plus coûteuses que CloudFront et nécessitent de gérer des serveurs dans plusieurs régions.

*SAA-C03 Domaine : Concevoir des architectures haute performance — Tâche 3.4*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus souhaite ajouter du contenu vidéo — de courtes vidéos tutorielles de cuisine de partenaires restaurants. Les vidéos peuvent faire entre 50 et 500 Mo. Ils s'attendent à ce que la même vidéo soit regardée par des milliers d'utilisateurs dans la même ville dans les heures suivant sa publication.

Concevez l'architecture de stockage et de diffusion. Utiliseriez-vous S3 et CloudFront ? Comment géreriez-vous la première requête (démarrage à froid) pour minimiser le délai avant que la vidéo soit mise en cache ? Quel TTL de cache définiriez-vous pour une vidéo qui ne changera pas après sa publication ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer les décisions de conception CDN.)*

## Scène post-générique

Priya observait les métriques CloudFront après le déploiement.

Taux de succès du cache : 83 %.

« Qu'est-ce que ça signifie ? » demanda Tom.

« Ça signifie que 83 % de nos utilisateurs obtiennent du contenu depuis un point de présence près d'eux, pas depuis us-east-1. »

« Et les autres 17 % ? »

« Les premières requêtes. Contenu qui n'a pas encore été mis en cache dans ce point de présence. »

Tom fixait les métriques. « Donc on sert presque un million de requêtes par jour depuis les nœuds périphériques de CloudFront. Et seulement 170 000 d'entre elles atteignent réellement nos serveurs. »

« Oui. »

« Donc si on n'avait pas CloudFront, nos serveurs traiteraient un million de requêtes. »

« À 140-160 millisecondes chacune, pour les utilisateurs mondiaux. »

Tom s'assit en arrière. Il avait un regard que Maya reconnaissait — le regard de quelqu'un qui recalcule les coûts en temps réel.

« Ça vaut le coup », dit-il.

Maya était déjà sur son ordinateur portable. « Deux nouveaux ingénieurs nous rejoignent la semaine prochaine. Soo-Jin de l'équipe plateforme de son ancienne entreprise, et Rafael — il s'est spécialisé dans la sécurité. Je veux qu'ils soient formés sur IAM avant leur premier jour. »

« IAM avancé ? » demanda Leo.

« Rôles, politiques, accès inter-comptes. Le vrai. »

Dans le prochain chapitre : les autorisations granulaires qui permettent à une partie du système de communiquer avec une autre — en toute sécurité.
