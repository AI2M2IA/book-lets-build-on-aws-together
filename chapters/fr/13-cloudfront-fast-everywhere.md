# Chapitre 13 : Rapide partout

Une photo voyageant depuis un serveur en Oregon jusqu'à un téléphone à Boston parcourt environ 4 100 kilomètres de câble à fibre optique. Aux deux tiers de la vitesse de la lumière, cela représente environ 25 millisecondes de pure physique — inévitable, non négociable, inscrite dans les lois de l'univers.

Puis ajoutez l'aller-retour. Puis ajoutez le temps de traitement. Le navigateur n'a pas encore commencé le rendu et 80 millisecondes sont déjà parties.

---

*`eatnimbus.com` était en service et le nom de domaine était réel. Les utilisateurs pouvaient trouver l'application. Mais la trouver n'était pas la même chose que l'apprécier. Tom faisait des mesures de latence depuis différentes villes, et les chiffres de la côte est et d'Amérique du Sud n'étaient pas bons. Le problème du nom de domaine était résolu. Le problème de la physique ne l'était pas.*

---

`eatnimbus.com` était en service. Leo avait vérifié les métriques de latence des utilisateurs de la côte est : 80 à 100 millisecondes par requête. Ça peut sembler petit, mais ça s'accumule.

Charger le menu : 90 ms. Charger la liste des restaurants : 80 ms. Charger les photos du restaurant : 200 ms (les images sont volumineuses). Temps total avant qu'un utilisateur puisse passer une commande : plus d'une demi-seconde sur une bonne connexion.

« La physique est le problème », dit Leo. « Les serveurs sont en Oregon. La croissance est sur la côte est — et à São Paulo. »

« Alors déplaçons les serveurs vers la côte est », dit Tom.

« Ça coûte de l'argent. »

« Combien ça coûte par mois ? » demanda Tom.

« Faire tourner un double complet de notre infrastructure dans us-east-1 ? Probablement le triple de nos coûts actuels. Et ça crée un tout nouveau problème : garder la base de données de la côte ouest et celle de la côte est synchronisées. »

Priya leva les yeux de son ordinateur. « Ou on ne déplace pas les serveurs. On déplace le *contenu*. »

Maya leva les yeux. « Quelle est la différence ? Si le contenu est sur un serveur, et que le serveur est en Oregon, le contenu est en Oregon. »

« La plupart de ce qu'une page livre est statique », dit Priya. « Images, feuilles de style, fichiers JavaScript, polices. Ce sont les mêmes pour chaque utilisateur. Ils ne viennent pas de la base de données. Ils vivent dans S3. Et les objets S3 peuvent être servis de n'importe où. »

« Donc on les copie sur des serveurs plus proches des utilisateurs ? »

« On laisse un service gérer ça pour nous. Une seule source de vérité. Des copies partout où elles sont nécessaires. »

Tom avait déjà ouvert la page de tarification. Il calculait avant que Priya n'ait fini d'expliquer.

**L'analogie de l'entrepôt préapprovisionné**

Imaginez Amazon le détaillant, pas l'entreprise de cloud. Ils ont un entrepôt massif à un seul endroit avec tous les produits. S'ils expédiaient chaque commande depuis ce seul entrepôt, les clients dans des villes lointaines attendraient des jours.

Au lieu de ça, Amazon a des centres de distribution près des grands centres de population. Quand un produit est populaire, ils préapprovisionnent ces entrepôts locaux. Quand un client à Seattle commande un livre, il est expédié depuis le centre de distribution local — pas depuis l'autre bout du pays.

C'est un **réseau de diffusion de contenu (CDN)** : un réseau de serveurs géographiquement distribués qui mettent en cache des copies de votre contenu près de vos utilisateurs.

Quand un utilisateur à Boston demande votre page d'accueil, le CDN la sert depuis un serveur à Boston. Pas en Oregon. La requête ne traverse jamais le pays.

**Découvrez CloudFront**

Amazon CloudFront est le CDN d'AWS. Il fonctionne à travers un réseau mondial d'**emplacements périphériques** (edge locations) — des serveurs de mise en cache positionnés dans des villes du monde entier. À l'heure où ces lignes sont écrites, il y a plus de 750 points de présence dans plus de 100 villes.

Quand vous configurez CloudFront, vous spécifiez une **origine** : la source de votre contenu réel. Votre origine pourrait être :

- Un bucket S3 (fichiers statiques : images, CSS, JavaScript, PDF)
- Un Application Load Balancer (contenu dynamique de votre application)
- Une instance EC2
- Un serveur HTTP n'importe où sur internet

CloudFront se place devant votre origine. Les requêtes arrivent à l'emplacement périphérique le plus proche. Si l'emplacement périphérique a le contenu en cache, il le retourne immédiatement. Sinon (un *cache miss*), il le récupère depuis votre origine, le met en cache et le retourne.

**Comment fonctionne la mise en cache CloudFront**

La première requête pour n'importe quel élément de contenu est toujours un cache miss — elle va à l'origine. Chaque requête suivante frappe le cache à l'emplacement périphérique.

Pour Nimbus, les photos de menu sont des candidates parfaites pour CloudFront. Les photos de restaurants changent rarement (peut-être quand le restaurant met à jour son profil). Avec CloudFront :

1. Un utilisateur à Boston demande `images.eatnimbus.com/restaurant-047/photo.jpg`
2. CloudFront vérifie l'emplacement périphérique à Boston — pas encore en cache (cache miss)
3. CloudFront récupère depuis S3 dans us-west-2 (~80 ms)
4. CloudFront stocke la photo dans l'emplacement périphérique de Boston
5. Le prochain utilisateur à Boston demande la même photo
6. CloudFront sert depuis le cache périphérique local (~5 ms)

Même pénalité de 80 ms pour la première requête. Mais la millième requête depuis la même ville est de 5 millisecondes.

Les **en-têtes Cache-Control** et les **réglages de TTL** dans CloudFront déterminent combien de temps le contenu reste en cache à la périphérie. Les fichiers image peuvent être mis en cache pendant des heures ou des jours. Les pages HTML (qui changent plus souvent) pourraient être mises en cache pendant des minutes ou des secondes.

Vous vous demandez peut-être : pourquoi ne pas simplement héberger toute l'application dans plusieurs régions au lieu d'utiliser un CDN ? Si les données sont en Oregon, pourquoi ne pas mettre une copie complète à New York, Tokyo et São Paulo ? Vous pourriez. Mais ça signifie garder plusieurs bases de données synchronisées, gérer les déploiements à travers les régions simultanément, gérer les scénarios de split-brain où les régions sont en désaccord. Un CDN est une réponse bien plus simple pour le contenu statique et semi-statique : une seule origine, de nombreuses copies en cache à la périphérie. Vous n'ajoutez la complexité multi-région que lorsque vous avez vraiment besoin d'opérations de calcul ou de base de données près de l'utilisateur — pour la plupart du contenu, la mise en cache périphérique suffit.

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Pourquoi mettre le cache à la périphérie au lieu de juste ajouter un plus gros cluster ElastiCache en Oregon ? »

« Parce que la physique est toujours le problème », dit Priya. « Même si l'Oregon répond en une milliseconde, cette réponse doit quand même voyager jusqu'à Boston. Le temps d'aller-retour est de 70 millisecondes minimum — la vitesse de la lumière se moque de la rapidité de nos serveurs. La mise en cache périphérique rapproche la réponse de la question. »

**Contenu dynamique : CloudFront pour plus que la mise en cache**

« Mais qu'en est-il de nos réponses d'API ? » demanda Leo. « Elles sont dynamiques — elles changent par utilisateur, par requête. On ne peut pas mettre en cache une page d'historique de commandes. »

C'est vrai. Mais CloudFront aide quand même avec le contenu dynamique.

Même quand le contenu ne peut pas être mis en cache, CloudFront route la requête de l'emplacement périphérique vers l'origine via le réseau dorsal privé d'AWS — la fibre à haut débit reliant l'infrastructure AWS à l'échelle mondiale. C'est plus rapide et plus fiable que de router sur l'internet public, où le trafic peut rebondir à travers plusieurs opérateurs.

Le résultat : les requêtes dynamiques sont quand même 20 à 40 % plus rapides via CloudFront qu'en allant directement à l'origine sur l'internet public. Pas grâce à la mise en cache, mais grâce au chemin réseau.

« Ça ne tient pas debout », dit Maya. « Si la réponse de l'API doit quand même voyager de l'Oregon à la périphérie puis à Boston, comment est-ce plus rapide que d'aller directement de l'Oregon à Boston ? »

« Deux raisons », dit Priya. « Premièrement, le réseau dorsal privé d'AWS est plus rapide et plus fiable que l'internet public. Le trafic de l'internet public passe par plusieurs opérateurs, chacun ajoutant sa propre latence et variabilité. Le réseau dorsal est une fibre directe à faible latence. Deuxièmement, la terminaison SSL se produit à la périphérie. L'utilisateur établit une connexion TLS avec l'emplacement périphérique CloudFront le plus proche — la poignée de main est rapide. CloudFront garde ensuite une connexion persistante et préétablie vers l'origine. Deux connexions à courte distance au lieu d'une à longue distance. »

« Donc même pour le contenu non mis en cache, CloudFront réduit le temps de surcharge de connexion », dit Leo.

« Habituellement dix à quarante pour cent. Pas aussi spectaculaire que la mise en cache. Mais réel. »

De plus, CloudFront fournit :

**Terminaison SSL/TLS** : CloudFront gère HTTPS à la périphérie. La connexion entre l'utilisateur et CloudFront est chiffrée. CloudFront peut se connecter à votre origine via HTTP en interne (réduisant la charge de l'origine) ou HTTPS (pour un chiffrement de bout en bout).

**Protection DDoS** : CloudFront est intégré à AWS Shield Standard. Le trafic distribué sur des centaines d'emplacements périphériques signifie que les attaques sont absorbées à la périphérie plutôt que de marteler votre origine.

**Géo-restriction** : Bloquer l'accès depuis des pays spécifiques. Si Nimbus n'est autorisé à opérer que sur certains marchés, CloudFront peut imposer ça à la périphérie sans que la requête n'atteigne jamais vos serveurs.

**Et si quelqu'un essaie de s'introduire via le CDN ?** demanda Priya. « L'empoisonnement de cache — et si quelqu'un parvenait à injecter du mauvais contenu dans le cache périphérique ? »

« CloudFront a des contrôles de clé de cache », dit Leo. « Vous définissez exactement quels attributs déterminent si deux requêtes obtiennent la même réponse en cache. En-têtes, chaînes de requête, cookies. Un attaquant ne peut pas injecter une réponse en cache différente sans correspondre à la clé de cache exacte. »

« Et Origin Access Control signifie que le bucket S3 ne servira rien qui ne passe pas par CloudFront », dit Priya. « Une seule surface d'attaque au lieu de deux. »

**Comportements CloudFront : Règles de mise en cache fines**

Une distribution CloudFront peut avoir plusieurs **comportements** — des règles de routage basées sur des motifs d'URL.

Pour Nimbus :

- `/images/*` → Cache à la périphérie pendant 7 jours (les photos ne changent pas souvent)
- `/static/*` → Cache à la périphérie pendant 30 jours (CSS et JavaScript avec des noms de fichiers versionnés)
- `/api/*` → Ne pas mettre en cache ; transmettre directement à l'équilibreur de charge
- `/*` → Cache pendant 5 minutes (pages HTML)

Cela permet à CloudFront d'être intelligent : mettre en cache agressivement ce qui est stable, laisser passer ce qui est dynamique.

Les comportements sont mis en correspondance du plus spécifique au moins spécifique. `/images/hero.jpg` correspond à `/images/*` avant de correspondre à `/*`. Le `/*` fourre-tout en bas est le défaut — il s'applique à tout ce qui ne correspond pas à un motif plus spécifique.

« Et si on veut une mise en cache différente pour les utilisateurs authentifiés vs non authentifiés ? » demanda Priya. « La même URL pourrait retourner un contenu différent selon qu'un utilisateur est connecté ou non. »

« Alors vous incluez le cookie de session dans la clé de cache », dit Leo. « Mais ça signifie que chaque utilisateur connecté obtient sa propre entrée de cache. Votre taux de hit s'effondre pour le contenu authentifié. »

« C'est pourquoi vous séparez le contenu authentifié du contenu public au niveau de l'URL », dit Priya. « Tout ce qui nécessite une authentification va vers `/app/*` et n'est pas mis en cache. Le contenu public va vers `/browse/*` et est mis en cache agressivement. Une frontière claire. »

La leçon : CloudFront fonctionne mieux quand votre structure d'URL reflète l'intention de mise en cache. Les URL qui pointent vers des données entièrement publiques et statiques devraient avoir une apparence différente des URL qui retournent des données personnalisées et dynamiques. Si elles se ressemblent pour CloudFront, soit le cache est cassé, soit le mauvais contenu est servi.

Leo restructura le schéma d'URL de Nimbus en un week-end. Les points de terminaison de parcours déménagèrent vers `/browse/`. Les points de terminaison d'API déménagèrent vers `/api/`. L'interface de l'application authentifiée déménagea vers `/app/`. Trois comportements, trois politiques de mise en cache claires, zéro ambiguïté.

« C'est un peu un remaniement », dit-il.

« C'est la bonne structure », dit Priya. « Tu en aurais eu besoin tôt ou tard. »

**Origin Access Control : Sécuriser S3 avec CloudFront**

Si votre bucket S3 contient du contenu privé qui ne devrait être servi que via CloudFront (pas directement), vous pouvez utiliser **Origin Access Control (OAC)** pour garantir que S3 rejette les requêtes qui ne viennent pas de CloudFront.

De cette façon :

- `d1234abcd.cloudfront.net/image.jpg` → Servi (CloudFront a la permission)
- `nimbus-assets.s3.amazonaws.com/image.jpg` → Bloqué (accès S3 direct refusé)

Votre contenu n'est accessible que via votre distribution, avec vos règles de cache et vos réglages de sécurité appliqués.

---

**L'incident de la photo périmée**

Le Restaurant 112 — l'endroit colombien de l'Eastside — envoya un e-mail au support un jeudi matin. Un client s'était plaint que la photo principale du restaurant montrait toujours l'ancienne devanture, même si le propriétaire en avait téléversé une nouvelle il y a deux jours.

Leo ouvrit les réglages de la distribution CloudFront.

Le comportement pour `/images/*` avait un TTL de sept jours. Le portail partenaire restaurant avait téléversé une nouvelle photo il y a deux jours, remplaçant le fichier au même chemin de clé S3 : `restaurant-112/hero.jpg`. L'ancien fichier avait disparu de S3. Mais CloudFront le servait toujours depuis le cache à chaque emplacement périphérique qui l'avait récupéré au cours des sept derniers jours.

« On a changé le contenu à l'origine », dit Leo. « Mais CloudFront ne le sait pas. Il a une copie en cache et il ne va pas vérifier pendant sept jours. »

« Je l'ai déjà déployé — oh. » Il avait supposé que remplacer le fichier S3 rafraîchirait automatiquement le cache CloudFront. Ce n'est pas le cas. CloudFront n'a aucun mécanisme pour détecter que le contenu d'une clé S3 a changé — il sert simplement ce qu'il a mis en cache jusqu'à ce que le TTL expire.

Deux options :

**Option un : Invalidation.** Envoyer à CloudFront une requête d'invalidation pour `/images/restaurant-112/hero.jpg`. CloudFront marque ce chemin comme périmé à tous les emplacements périphériques. La prochaine requête pour ce chemin récupère du contenu frais depuis S3. Coût : les 1 000 premiers chemins d'invalidation chaque mois sont gratuits ; au-delà, 0,005 $ *par chemin*. Pour un seul fichier, gratuit. Pour invalider des milliers de fichiers lors d'une mise à jour groupée, les coûts s'accumulent.

**Option deux : Noms de fichiers versionnés.** Au lieu de `hero.jpg`, nommez le fichier `hero-v2.jpg`. Mettez à jour la référence dans la base de données. CloudFront n'a aucune entrée en cache pour `hero-v2.jpg` — la première requête le récupère depuis S3, et les utilisateurs le voient immédiatement. L'ancien `hero.jpg` reste en cache mais n'est plus référencé nulle part. Il expire naturellement après sept jours.

« Pour le contenu téléversé par les utilisateurs », dit Priya, « les noms versionnés sont le bon schéma. Ajoutez un hachage ou un horodatage au nom de fichier. Chaque nouveau téléversement est une nouvelle entrée de cache. Pas de coût d'invalidation, pas de contenu périmé. »

Leo mit à jour le portail partenaire. Les nouveaux téléversements seraient maintenant stockés sous `hero-{timestamp}.jpg`. L'enregistrement de la base de données était mis à jour avec le nouveau chemin. L'ancien chemin en cache était sans pertinence.

« Et pour le cas du déploiement ? » demanda Maya. « Quand on pousse une nouvelle version de l'application et que le JavaScript change ? »

« Même principe », dit Priya. « Les outils de build comme Webpack produisent des noms de fichiers hachés : `app.a3b9c2d4.js`. Déployez une nouvelle version et le hachage change : `app.f7e1b3c5.js`. CloudFront sert les deux depuis le cache — les anciens utilisateurs obtiennent l'ancien fichier, les nouveaux utilisateurs obtiennent le nouveau. Pas d'invalidation, pas de problème de coordination. »

« La page HTML référence le hachage actuel », dit Leo. « Donc les nouveaux utilisateurs obtiennent le nouveau HTML avec le nouveau hachage JS, et le CDN sert le bon fichier. »

« Pratique standard », confirma Priya.

---

**La latence avec de vrais chiffres**

Tom faisait des mesures de latence depuis trois villes.

| Emplacement | Sans CloudFront | Avec CloudFront | Amélioration |
|---|---|---|---|
| Seattle | 15 ms | 12 ms | 20 % |
| New York | 80 ms | 10 ms | 88 % |
| São Paulo | 290 ms | 35 ms | 88 % |
| Tokyo | 260 ms | 28 ms | 89 % |

« L'amélioration est la plus grande là où le problème de physique est le pire », observa Tom. « São Paulo à l'Oregon, c'est plus de deux cents millisecondes. C'est plus d'un quart de seconde, juste pour démarrer la conversation. »

« Et le contenu n'atteint jamais São Paulo la deuxième fois », dit Leo. « Le premier utilisateur à São Paulo récupère depuis l'Oregon et le met en cache localement. Chaque utilisateur après ça obtient trente-cinq millisecondes. »

« Le premier utilisateur à São Paulo paie le coût », dit Tom. « Tous les autres en bénéficient. »

« C'est comme ça que fonctionnent les CDN », dit Priya. « La première requête peuple le cache. Chaque cache hit après ça est presque gratuit. »

L'implication pour les produits mondiaux est significative. Sans CloudFront, un utilisateur à Tokyo qui attend 260 millisecondes pour votre image principale attend à cause de la physique — câbles à fibre optique et vitesse de la lumière. Avec CloudFront, vous mettez une copie de cette image à Tokyo, et le problème de physique disparaît essentiellement.

---

**Origines multiples : ALB et S3 ensemble**

« On a nos images sur S3 et notre API sur l'équilibreur de charge », dit Maya. « A-t-on besoin de deux distributions CloudFront ? »

« Non », dit Leo. « Une seule distribution, plusieurs origines. »

Une seule distribution CloudFront peut router différents motifs d'URL vers différentes origines. C'est le schéma multi-origines :

```
eatnimbus.com/*         → Origine : ALB dans us-west-2 (contenu dynamique)
eatnimbus.com/images/*  → Origine : bucket S3 (images statiques)
eatnimbus.com/static/*  → Origine : bucket S3 (CSS, JS, polices)
```

CloudFront évalue les comportements par ordre de spécificité. Une requête vers `/images/hero.jpg` correspond au comportement `/images/*` et va vers S3. Une requête vers `/api/orders` correspond au fourre-tout `/*` et va vers l'ALB.

L'avantage : un seul domaine, un seul certificat SSL, une seule distribution CloudFront, plusieurs backends. Les utilisateurs voient un domaine unifié. Le routage leur est invisible.

Un détail opérationnel qui est aussi un fait d'examen garanti : ce certificat SSL provient d'AWS Certificate Manager (ACM), et **un certificat utilisé par CloudFront doit être demandé ou importé dans `us-east-1`** — quel que soit l'endroit où vivent vos origines. CloudFront est un service global dont le plan de contrôle vit dans us-east-1 ; un certificat se trouvant dans us-west-2 n'apparaîtra tout simplement pas dans le menu déroulant de la distribution. (Pour les services régionaux comme un ALB, le certificat vit dans la propre région de l'ALB.)

« Et l'ALB n'est pas orienté vers le public ? » demanda Priya.

« Seul CloudFront parle à l'ALB », dit Leo. « On restreint le groupe de sécurité de l'ALB à la liste de préfixes gérée de CloudFront. Les connexions directes à l'ALB depuis internet sont bloquées. »

« Donc la seule façon d'atteindre l'application est via CloudFront. »

« Ce qui signifie que les règles WAF, la terminaison SSL et la protection DDoS s'appliquent à tout le trafic avant qu'il ne nous atteigne. »

---

**CloudFront Functions vs Lambda@Edge**

« A-t-on réfléchi à ce qu'on ferait si on avait besoin de réécrire une URL à la périphérie ? » demanda Priya. « Ou d'ajouter un en-tête de sécurité à chaque réponse ? »

« Ne peut-on pas faire ça dans l'application ? » demanda Leo.

« On peut. Mais si ça se passe à la périphérie — avant que CloudFront ne serve depuis le cache — on économise un aller-retour vers l'origine. »

CloudFront prend en charge deux mécanismes pour exécuter du code à la périphérie :

**CloudFront Functions** sont des fonctions JavaScript légères qui s'exécutent à chaque emplacement périphérique. Elles s'exécutent en moins d'une milliseconde, gèrent des millions de requêtes par seconde, et sont conçues pour des transformations simples : réécritures d'URL, manipulation d'en-têtes, normalisation de chaînes de requête, redirections simples. Elles peuvent s'exécuter sur les requêtes du spectateur et les réponses au spectateur (avant et après le cache, du point de vue de l'utilisateur). Elles ne peuvent pas faire d'appels réseau. Coût : 0,10 $ par million d'invocations.

**Lambda@Edge** exécute de vraies fonctions Lambda aux emplacements périphériques régionaux de CloudFront (pas chaque point de présence, mais des dizaines de grands emplacements à l'échelle mondiale). Lambda@Edge peut faire des appels réseau, accéder à des bases de données, générer des réponses dynamiques, faire de la logique d'authentification complexe. Il s'exécute sur les requêtes du spectateur, les requêtes à l'origine, les réponses de l'origine et les réponses au spectateur — vous donnant quatre points d'intervention dans le cycle de vie de la requête. Coût : plus élevé que CloudFront Functions, facturé par requête et durée.

Le modèle mental :

| Cas d'usage | Outil |
|---|---|
| Réécrire `/old-path` vers `/new-path` | CloudFront Functions |
| Ajouter l'en-tête `Strict-Transport-Security` | CloudFront Functions |
| Normaliser les chaînes de requête avant la recherche dans le cache | CloudFront Functions |
| Test A/B : assigner un cookie de test sur la requête du spectateur | CloudFront Functions |
| Test A/B : router 10 % des utilisateurs vers une origine différente | Lambda@Edge (requête à l'origine — CloudFront Functions ne peut pas changer l'origine) |
| Authentifier un jeton JWT (nécessite une bibliothèque crypto) | Lambda@Edge |
| Récupérer du contenu personnalisé depuis une base de données à la périphérie | Lambda@Edge |
| Générer une miniature d'image à la demande à la périphérie | Lambda@Edge |

Pour Nimbus : ils utilisèrent une CloudFront Function pour ajouter des en-têtes de sécurité à chaque réponse — `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`. Deux douzaines de lignes de JavaScript. Exécution en moins d'une milliseconde. Aucun aller-retour vers l'origine nécessaire.

« Ça prendrait plus de temps d'expliquer les en-têtes à un ingénieur junior », dit Leo, « que d'écrire la fonction. »

---

**Classes de prix : Choisir quels emplacements périphériques**

« A-t-on réfléchi à ce que ça coûte à grande échelle ? » demanda Tom, en parcourant la page de tarification de CloudFront.

« Combien ça coûte par mois ? » était techniquement deux questions ici. La première : que facture CloudFront ? La deuxième : avez-vous besoin de chaque emplacement périphérique du monde ?

La tarification du transfert de données CloudFront varie selon la région. Le trafic servi depuis les emplacements périphériques en Amérique du Nord et en Europe est le moins cher. Le trafic d'Amérique du Sud, d'Asie-Pacifique, d'Australie et d'Inde est plus cher — parce que l'infrastructure y coûte plus cher.

AWS vous laisse choisir une **classe de prix** pour votre distribution :

- **Price Class All** : Utilise tous les emplacements périphériques à l'échelle mondiale. Meilleures performances partout. Coût de transfert de données le plus élevé pour les régions hors Amérique du Nord et Europe.
- **Price Class 200** : Utilise la plupart des emplacements périphériques (Amérique du Nord, Europe, Asie, Moyen-Orient, Afrique). Exclut les emplacements sud-américains les plus chers et certains de l'Océanie.
- **Price Class 100** : Utilise uniquement les emplacements périphériques d'Amérique du Nord et d'Europe. Le moins cher. Les utilisateurs à São Paulo, Tokyo et Sydney sont quand même servis — mais depuis un emplacement périphérique nord-américain ou européen, pas le plus proche d'eux.

« Donc si on choisit Price Class 100 », dit Tom, « un utilisateur à São Paulo est servi depuis... Miami ? New York ? »

« Quel que soit l'emplacement périphérique inclus le plus proche. Peut-être 50 millisecondes au lieu de 230 millisecondes directement vers l'Oregon », dit Priya. « Toujours une amélioration significative. Pas aussi bonne que Price Class All. »

« Et la différence de coût ? »

« Le transfert de données sortant d'Amérique du Sud coûte environ le double du coût de l'Amérique du Nord. Pour une startup qui construit encore son trafic, Price Class 200 est un compromis raisonnable — vous obtenez l'Asie et l'Europe à un coût inférieur à Price Class All, et la plupart de vos utilisateurs sont couverts. »

« Commençons avec 200 », dit Tom. « Quand on aura de vraies données de trafic de chaque région, on décidera si All en vaut la peine. »

La bonne classe de prix dépend de l'endroit où sont vos utilisateurs. Si vous n'avez aucun utilisateur en Amérique du Sud, payer pour des emplacements périphériques sud-américains est un coût pur. Si vingt pour cent de votre chiffre d'affaires vient du Brésil, l'amélioration de performance de Price Class All se rentabilise probablement.

---

**Conception de la clé de cache**

« A-t-on réfléchi à ce qui se passe quand deux utilisateurs différents demandent la même URL mais obtiennent un contenu différent ? » demanda Priya.

Leo y réfléchit. « Les pages personnalisées. »

« Ou les pages spécifiques à une langue. Ou les versions mobile contre bureau. Ou les pages qui varient selon un cookie. »

Par défaut, CloudFront n'utilise que le chemin de l'URL comme clé de cache. Deux requêtes vers `/browse` obtiennent la même réponse en cache, quels que soient la préférence de langue de l'utilisateur, le type d'appareil ou le cookie de session.

Si votre application sert un contenu différent selon les chaînes de requête, les en-têtes ou les cookies — et que vous voulez que CloudFront mette ces variations en cache séparément — vous devez inclure ces attributs dans la **clé de cache**.

Pour Nimbus :

- `/browse?city=miami` devrait être mis en cache séparément de `/browse?city=boston` — des listes de restaurants différentes. Incluez les chaînes de requête dans la clé de cache.
- Les utilisateurs mobiles pourraient obtenir une mise en page différente. Incluez un type d'appareil normalisé (dérivé de l'en-tête `User-Agent`) dans la clé de cache.
- L'en-tête `Accept-Language` détermine dans quelle langue la page s'affiche. Incluez-le dans la clé de cache.

Soyez prudent, cependant. Chaque attribut de clé de cache que vous ajoutez crée plus de variations de cache. Si vous incluez toute la chaîne `User-Agent` (qui varie selon la version du navigateur, la version de l'OS et le niveau de correctif), vous cassez effectivement la mise en cache — chaque utilisateur a un User-Agent légèrement différent, donc chaque requête est un cache miss.

La discipline : normaliser avant de mettre en cache. Réduisez « iPhone 15 Pro Safari 17.4.1 » à « mobile ». Réduisez toutes les langues acceptées aux deux ou trois que vous prenez réellement en charge. N'incluez que ce qui change véritablement la réponse.

« Plus votre clé de cache est spécifique », dit Leo, « pire est votre taux de hit. »

« Et plus elle est générique », dit Priya, « plus vous risquez de servir le mauvais contenu au mauvais utilisateur. »

« Donc la conception de la clé de cache est le même compromis que tout le reste dans la mise en cache. »

« Oui », dit Priya. « C'est toujours le même compromis. »

---

## Quand CloudFront n'est pas la réponse : Global Accelerator

L'application mobile Nimbus avait une fonctionnalité que Tom observait discrètement depuis deux mois : le statut de commande en temps réel. Quand un client passait une commande, l'application restait connectée via WebSocket et l'écran de gestion des commandes de la cuisine se mettait à jour en temps réel. Pas de bouton d'actualisation. Pas de sondage. Une connexion en direct qui poussait les mises à jour à l'instant où une cuisine marquait un article comme prêt.

« Ça utilise des WebSockets », dit Tom, en regardant les métriques de latence un matin. « Depuis les utilisateurs à São Paulo, l'établissement de la connexion prend 340 millisecondes. Quelque chose cloche. »

« CloudFront ne met pas en cache les connexions WebSocket », dit Leo. « Il les relaie — les transmet à l'origine. Aucun bénéfice de mise en cache. »

« Exact. Alors pourquoi est-ce toujours lent ? »

« Parce que le WebSocket voyage toujours de São Paulo à nos serveurs en Oregon sur l'internet public », dit Leo. « CloudFront aide, parce qu'il termine la poignée de main TLS à la périphérie puis utilise le réseau dorsal d'AWS vers l'origine. Mais pour une connexion WebSocket persistante, c'est toujours une connexion à longue distance. »

« Il y a un service exactement pour ce problème », dit Priya.

**AWS Global Accelerator** n'est pas un CDN. Il ne met rien en cache. Il ne sert pas de contenu depuis des emplacements périphériques. Ce qu'il fait, c'est vous donner deux adresses IP Anycast statiques qui sont annoncées à l'échelle mondiale depuis tous les emplacements périphériques AWS simultanément — puis router le trafic de vos utilisateurs sur le réseau dorsal privé d'AWS au lieu de l'internet public.

Quand un client à São Paulo ouvre l'application Nimbus, son appareil se connecte à l'emplacement périphérique AWS le plus proche (qui pourrait être à São Paulo même). Depuis cet emplacement périphérique, le trafic voyage vers les serveurs de Nimbus en Oregon sur le réseau de fibre privé, surveillé et optimisé d'AWS — pas sur l'internet public où les paquets rebondissent à travers des opérateurs et des sauts de routage imprévisibles.

L'internet public n'est pas conçu pour la latence. Il est conçu pour la résilience — les paquets peuvent emprunter n'importe quel chemin disponible. Le réseau dorsal d'AWS est conçu différemment : il est direct, à faible congestion, et sous le contrôle opérationnel d'AWS.

Tom mesura la différence.

| Route | Latence (São Paulo vers Oregon) |
|---|---|
| Internet public | 340 ms |
| Via Global Accelerator | 180 ms |

Une réduction de 47 %. Pas grâce à la mise en cache — grâce à un meilleur chemin réseau.

« Alors pourquoi ne pas juste utiliser CloudFront pour tout ? » demanda Maya. « CloudFront route déjà via le réseau dorsal d'AWS pour le contenu dynamique. »

« CloudFront est HTTP et HTTPS uniquement », dit Priya. « Les WebSockets fonctionnent avec CloudFront, mais seulement via la mise à niveau HTTP. Et certains de nos protocoles — les données de capteurs IoT, par exemple — sont du pur TCP ou UDP. CloudFront ne gère pas ça. Global Accelerator est agnostique au protocole. TCP, UDP, WebSockets, peu importe. Il déplace des paquets, pas des requêtes HTTP. »

Il y avait une autre différence que Priya nota dans sa documentation de sécurité.

« Global Accelerator nous donne deux IP Anycast statiques », dit-elle. « Ces IP ne changent jamais. Ça signifie qu'on peut les ajouter à notre politique de sécurité, les ajouter aux listes blanches des partenaires, les ajouter aux règles de pare-feu. Les adresses IP de CloudFront changent au fil du temps — elles sont gérées par AWS et ne sont pas fixes. »

« Et le basculement ? » demanda Leo.

« Instantané », dit Priya. « Si notre application us-west-2 a un problème, Global Accelerator peut déplacer le trafic vers un secours dans us-east-1 en moins de 30 secondes — sans changer l'adresse IP à laquelle les utilisateurs se connectent. Le basculement DNS via Route 53 prend 60 à 300 secondes selon le TTL. Global Accelerator est plus rapide. »

**CloudFront vs Global Accelerator — le modèle mental :**

CloudFront améliore la livraison par la mise en cache. Il est conçu pour HTTP/HTTPS et le bénéfice est le plus grand quand le contenu peut être mis en cache près des utilisateurs — fichiers statiques, images, JavaScript. Quand le contenu ne peut pas être mis en cache, CloudFront aide quand même via le routage du réseau dorsal, mais l'amélioration est plus petite.

Global Accelerator améliore la livraison par le routage. Il ne déplace aucun contenu. Il ne met rien en cache. Le bénéfice s'applique à chaque paquet — mis en cache ou non, HTTP ou non, statique ou dynamique. Les deux IP statiques fonctionnent à l'échelle mondiale. Le basculement est quasi instantané. Les cas d'usage où CloudFront n'est pas suffisant — WebSockets en temps réel, protocoles basés sur UDP, trafic non-HTTP, applications mondiales nécessitant des IP fixes — sont là où Global Accelerator est le bon outil.

Tom mit à jour l'application mobile Nimbus pour se connecter au point de terminaison Global Accelerator pour la fonctionnalité de statut de commande en temps réel. L'établissement de connexion WebSocket à São Paulo chuta de 340 ms à 180 ms. Les mises à jour de la cuisine semblaient toujours instantanées — parce que maintenant, pour les utilisateurs hors Amérique du Nord, elles l'étaient réellement.

## Forces et limites

**Pourquoi CloudFront est puissant** :

- Plus de 750 points de présence dans plus de 100 villes — la plupart des utilisateurs obtiennent le contenu à moins de 20 ms
- Contenu statique servi en quelques millisecondes à un chiffre après le premier cache
- Réduit significativement la charge de l'origine (le trafic répété ne touche jamais vos serveurs)
- Intégré avec AWS Shield, WAF et Certificate Manager
- Aucune planification de capacité nécessaire — CloudFront s'adapte automatiquement
- Les distributions multi-origines routent différents chemins vers différents backends depuis un seul domaine
- CloudFront Functions gère la logique périphérique légère à une latence inférieure à la milliseconde

**Là où ça se complique** :

- Le contenu en cache peut être périmé — invalider le cache coûte de l'argent (0,005 $ par chemin après les 1 000 premiers chemins gratuits chaque mois). Utilisez plutôt des noms de fichiers versionnés.
- Les en-têtes Cache-Control doivent être réglés correctement à l'origine — les erreurs causent du contenu périmé
- Le contenu dynamique bénéficie de l'optimisation du routage mais pas de la mise en cache
- Le débogage du comportement du cache (ce qui est en cache où, pour combien de temps) nécessite de comprendre plusieurs couches : en-têtes d'origine, réglages de TTL CloudFront, règles de comportement
- Le transfert de données sortant via CloudFront coûte de l'argent, bien que moins que le transfert de données standard
- La conception de la clé de cache nécessite une réflexion attentive — trop spécifique casse la mise en cache, trop générique sert le mauvais contenu

## Résumé

CloudFront n'a pas changé la physique. La lumière voyage toujours à la même vitesse. Mais il a changé l'endroit où vivait la réponse — et pour la plupart des utilisateurs, la réponse était maintenant à quelques millisecondes au lieu de quelques centaines. Taux de hit du cache après déploiement : 83 %. Cela signifiait que 830 000 requêtes sur chaque million n'atteignaient jamais du tout les serveurs d'origine. Les utilisateurs à São Paulo sont passés de 290 millisecondes à 35 millisecondes. Les utilisateurs à Tokyo de 260 à 28.

- Un **CDN** met en cache des copies de votre contenu aux emplacements périphériques près de vos utilisateurs — réduisant la latence et la charge de l'origine.
- **CloudFront** est le CDN d'AWS, avec plus de 750 points de présence à l'échelle mondiale.
- Les cache misses récupèrent depuis l'**origine** (S3, ALB, EC2). Les cache hits servent depuis la périphérie — des millisecondes, pas des centaines de millisecondes.
- Les **comportements** vous permettent de définir des règles de mise en cache différentes pour différents motifs d'URL. Une seule distribution peut servir `/images/*` depuis S3 et `/*` depuis un ALB.
- Le contenu dynamique n'est pas mis en cache, mais CloudFront améliore quand même les performances via le réseau dorsal privé d'AWS.
- **Évitez le contenu périmé** en utilisant des noms de fichiers versionnés (par exemple, `hero-v2.jpg`) au lieu des invalidations — moins cher et plus fiable.
- **CloudFront Functions** gère la logique périphérique légère (manipulation d'en-têtes, réécritures d'URL) à une vitesse inférieure à la milliseconde. **Lambda@Edge** gère le traitement plus lourd qui nécessite des appels réseau.
- Les **classes de prix** vous permettent de contrôler quels emplacements périphériques servent votre trafic — et donc votre coût de transfert de données.
- La **conception de la clé de cache** détermine quels attributs de requête créent des variations en cache séparées. Des clés plus spécifiques = taux de hit plus bas. Moins spécifiques = risque de servir le mauvais contenu.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures performantes (Domaine 3, Tâche 3.4)*

- **CloudFront + S3** : Schéma d'examen classique pour servir des sites web statiques à l'échelle mondiale. Bucket S3 comme origine, CloudFront comme CDN, Origin Access Control pour empêcher l'accès direct à S3.
- **Emplacements périphériques vs Régions vs AZ** : Les emplacements périphériques sont plus nombreux et n'existent qu'à des fins de mise en cache/CDN. Ils ne sont pas la même chose que les AZ (qui font tourner votre calcul).
- **Invalidation du cache** : Crée une invalidation `/images/*` pour forcer CloudFront à récupérer du contenu frais. Coûte de l'argent — l'examen peut demander l'alternative économique : les URL versionnées (`image-v2.jpg` au lieu de `image.jpg`), qui contournent naturellement le cache.
- **Contrôle du TTL** : `Cache-Control: max-age=3600` à l'origine définit un TTL de cache d'une heure. CloudFront honore ces en-têtes. Le TTL minimum, le TTL maximum et le TTL par défaut peuvent aussi être réglés dans le comportement de la distribution.
- **CloudFront Functions vs Lambda@Edge** : CloudFront Functions s'exécute à la périphérie pour la manipulation légère des requêtes/réponses (sous la milliseconde). Lambda@Edge exécute votre code Lambda aux emplacements périphériques régionaux pour un traitement plus lourd. L'examen les distingue par la complexité du cas d'usage. CloudFront Functions ne peut pas faire d'appels réseau ; Lambda@Edge le peut.
- **URL signées et Cookies signés** : Contrôlent qui peut accéder au contenu via CloudFront. Les URL signées donnent accès à des fichiers spécifiques ; les cookies signés donnent accès à plusieurs fichiers. L'examen les utilise pour le « contenu réservé aux abonnés payants ».
- **Classe de prix** : L'examen peut demander quelle classe de prix choisir pour une audience mondiale vs une audience Amérique du Nord/Europe. Price Class All = meilleures performances, coût le plus élevé. Price Class 100 = Amérique du Nord et Europe uniquement, coût le plus bas.
- **Clé de cache** : La clé de cache par défaut est l'URL. Ajouter des chaînes de requête, des en-têtes ou des cookies à la clé de cache crée des variations en cache séparées — mais augmente le taux de cache miss. L'examen peut présenter un scénario où le contenu varie selon un paramètre de requête et demander comment configurer la mise en cache.
- **Basculement d'origine** : CloudFront prend en charge un groupe d'origines avec une origine principale et une secondaire. Si l'origine principale retourne une erreur 5xx, CloudFront réessaie automatiquement avec la secondaire. Différent du basculement Route 53 — c'est au sein d'une seule distribution CloudFront.
- **Comportements multi-origines** : Une seule distribution peut router `/images/*` vers S3 et `/*` vers un ALB. L'examen peut présenter ça comme « comment servir du contenu statique et dynamique depuis un seul domaine sans deux distributions ».
- **CloudFront vs Global Accelerator :** CloudFront = CDN HTTP/HTTPS, met en cache le contenu aux emplacements périphériques, réduit la charge de l'origine, idéal pour le contenu statique et cachable. Global Accelerator = n'importe quel protocole TCP/UDP, ne met rien en cache, route le trafic sur le réseau dorsal privé d'AWS, fournit 2 IP Anycast statiques, prend en charge un basculement régional quasi instantané. Déclencheur d'examen : « améliorer la latence pour le trafic non-HTTP » ou « IP statique pour une application mondiale » ou « performance WebSocket pour des utilisateurs mondiaux » ou « basculement régional plus rapide que le DNS » → Global Accelerator. « Servir des fichiers statiques à l'échelle mondiale avec une faible latence » → CloudFront.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre un cache hit et un cache miss CloudFront. Que se passe-t-il dans chaque cas ?

*(Indice : Pensez à l'endroit d'où vient le contenu, et à la façon dont le temps de réponse diffère entre les deux cas.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une société de logiciels distribue de gros fichiers d'installation (~2 Go chacun) depuis un bucket S3 à des clients du monde entier. Les vitesses de téléchargement sont lentes pour les clients en Asie. L'équipe veut améliorer les performances sans répliquer le bucket S3 vers plusieurs régions. Ils ont aussi besoin de garantir que seuls les clients payants peuvent télécharger les installateurs.

Quelle solution répond LE MIEUX à ces exigences ?

A) Activer S3 Transfer Acceleration sur le bucket et générer des URL présignées pour les clients payants  
B) Utiliser CloudFront avec le bucket S3 comme origine, activer Origin Access Control, et utiliser les URL signées CloudFront pour les clients payants  
C) Créer un bucket S3 dans chaque région AWS et utiliser le routage par géolocalisation Route 53 pour diriger les clients vers le bucket le plus proche  
D) Utiliser un Application Load Balancer dans chaque région avec des instances EC2 qui servent les fichiers d'installation

**Indice 1** : L'exigence est d'améliorer les performances mondiales *sans* répliquer le bucket. Quelle option ne nécessite pas plusieurs buckets ?

**Indice 2** : Quel service contrôle spécifiquement qui peut accéder au contenu servi via CloudFront ?

**Indice 3** : S3 Transfer Acceleration est optimisé pour les téléversements à longue distance *vers* S3. Pour livrer du contenu *depuis* S3 vers des utilisateurs finaux à l'échelle mondiale, CloudFront est le bon outil.

**Réponse** : B

**Explication** : CloudFront met en cache les fichiers d'installation aux emplacements périphériques à l'échelle mondiale après le premier téléchargement. Les téléchargements suivants depuis la même région viennent de la périphérie — bien plus rapide que traverser le Pacifique depuis S3 dans us-west-2. Origin Access Control garantit que le bucket S3 n'est accessible que via CloudFront. Les URL signées restreignent l'accès aux clients payants.

**Pourquoi pas A ?** S3 Transfer Acceleration est optimisé pour les téléversements à longue distance *vers* S3 — pas pour distribuer du contenu *depuis* S3 vers une audience mondiale. Pour ça, CloudFront est l'outil correct. Les URL présignées contrôlent l'accès mais n'améliorent pas les performances mondiales.

**Pourquoi pas C ?** Créer un bucket S3 par région fonctionne bien pour les performances, mais ça contredit l'exigence d'éviter la réplication. Ça nécessite aussi une stratégie de synchronisation des données entre les buckets.

**Pourquoi pas D ?** Des instances EC2 derrière un équilibreur de charge dans chaque région sont significativement plus chères que CloudFront et nécessitent de gérer des serveurs dans plusieurs régions.

*Domaine SAA-C03 : Concevoir des architectures performantes — Tâche 3.4*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus veut ajouter du contenu vidéo — de courtes vidéos de tutoriels de cuisine de partenaires restaurant. Les vidéos peuvent faire 50 à 500 Mo. Ils s'attendent à ce que la même vidéo soit regardée par des milliers d'utilisateurs dans la même ville dans les heures suivant la publication.

Concevez l'architecture de stockage et de livraison. Utiliseriez-vous S3 et CloudFront ? Comment géreriez-vous la première requête (démarrage à froid) pour minimiser le délai avant que la vidéo ne soit mise en cache ? Quel TTL de cache régleriez-vous pour une vidéo qui ne changera pas après la publication ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner aux décisions de conception de CDN.)*

## Scène post-générique

« Je l'ai déjà déployé — oh. » Leo avait pointé la distribution CloudFront vers la mauvaise origine — le bucket S3 de développement au lieu de celui de production. Pendant environ quatre minutes, certains utilisateurs de la côte ouest avaient vu une ancienne version de l'application. Il avait corrigé les réglages de l'origine, invalidé le cache, et discrètement mis à jour le journal des incidents.

Priya regarda les métriques CloudFront après le déploiement.

Taux de hit du cache : 83 %.

« Qu'est-ce que ça veut dire ? » demanda Tom.

« Ça veut dire que 83 % de nos utilisateurs obtiennent le contenu depuis un emplacement périphérique près d'eux, pas depuis us-west-2. »

« Et les 17 % restants ? »

« Des requêtes pour la première fois. Du contenu qui n'a pas encore été mis en cache à cet emplacement périphérique. »

Tom fixa les métriques. « Donc on sert presque un million de requêtes par jour depuis les nœuds périphériques CloudFront. Et seulement 170 000 d'entre elles touchent réellement nos serveurs. »

« Oui. »

« Donc si on n'avait pas CloudFront, nos serveurs géreraient un million de requêtes. »

« À 140-160 millisecondes chacune, pour des utilisateurs mondiaux. »

Tom se renversa dans son fauteuil. Il avait un regard que Maya reconnaissait — le regard de quelqu'un qui recalcule le coût en temps réel.

« Ça en vaut la peine », dit-il.

Maya était déjà sur son ordinateur. « Deux nouveaux ingénieurs nous rejoignent la semaine prochaine. Soo-Jin de l'équipe plateforme de son ancienne entreprise, et Rafael — il s'est spécialisé dans la sécurité. Je veux qu'ils soient formés sur IAM avant leur premier jour. »

« IAM avancé ? » demanda Leo.

« Rôles, politiques, accès inter-comptes. Le vrai truc. »

Dans le prochain chapitre : les permissions fines qui permettent à une partie du système de parler à une autre — en toute sécurité.
