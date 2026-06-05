# Chapitre 12 : Comment Internet vous trouve

Nimbus fonctionnait. L'équilibreur de charge avait une adresse IP publique. Les instances EC2 avaient une adresse IP privée. Les bases de données étaient verrouillées dans des sous-réseaux privés. Priya avait approuvé d'un signe de tête le schéma réseau.

Tom regarda l'URL de l'équilibreur de charge : `nimbus-alb-123456789.us-east-1.elb.amazonaws.com`.

« C'est ce que les clients saisissent dans leur navigateur ? » demanda-t-il.

« C'est ce qu'AWS attribue automatiquement », dit Maya.

« Je ne vais pas mettre ça sur une carte de visite. »

« Moi non plus. »

Ils avaient besoin d'un nom de domaine. Ils achetèrent `eatnimbus.com` auprès d'un bureau d'enregistrement. Il fallait maintenant relier ce nom à leur infrastructure AWS.

« Comment Internet sait-il que `eatnimbus.com` correspond à l'équilibreur de charge dans us-east-1 ? » demanda Leo.

Bonne question, Leo.

**L'analogie de l'annuaire téléphonique**

Avant les smartphones, chaque ville avait un annuaire téléphonique. Si vous vouliez joindre « La Pizzeria de Mario », vous ne mémorisiez pas son numéro — vous cherchiez le nom, obteniez le numéro et appeliez.

Internet a son propre annuaire : le **Domain Name System (DNS)**.

Le DNS traduit les noms lisibles par les humains (comme `eatnimbus.com`) en adresses IP lisibles par les machines (comme `203.0.113.42`). Chaque fois que vous visitez un site web, votre ordinateur recherche silencieusement le nom de domaine dans le DNS et obtient l'adresse IP à laquelle se connecter.

Si vous changiez l'adresse IP de votre serveur, vous mettriez à jour l'enregistrement DNS — comme changer votre numéro dans l'annuaire — et Internet vous trouverait à votre nouvel emplacement.

**Présentation de Route 53**

Amazon Route 53 est le service DNS géré d'AWS. Il s'appelle Route 53 parce que le port 53 est le port DNS standard. (Parfois AWS nomme les choses de façon directe.)

Route 53 remplit plusieurs fonctions :

**Enregistrement de domaines** : Vous pouvez acheter des noms de domaine directement via Route 53.

**Hébergement DNS (zones hébergées)** : Vous créez une *zone hébergée* pour votre domaine, et Route 53 gère les enregistrements DNS qui indiquent au monde où vous trouver.

**Vérifications de santé** : Route 53 peut surveiller vos points de terminaison et rediriger le trafic en s'éloignant des points défaillants.

**Politiques de routage du trafic** : Route 53 prend en charge plusieurs stratégies de routage au-delà du simple DNS — pondéré, basé sur la latence, géolocalisation, basculement.

**Enregistrements DNS : les entrées de l'annuaire**

Un enregistrement DNS associe un nom à une destination. Les types les plus courants :

**Enregistrement A** : Associe un nom à une adresse IPv4.
`eatnimbus.com → 203.0.113.42`

**Enregistrement AAAA** : Associe un nom à une adresse IPv6.

**Enregistrement CNAME** : Associe un nom à un autre nom (un alias).
`www.eatnimbus.com → eatnimbus.com`

**Enregistrement MX** : Indique quels serveurs gèrent le courrier électronique pour le domaine.

**Enregistrement TXT** : Stocke du texte arbitraire. Couramment utilisé pour la vérification de domaine (prouver que vous êtes propriétaire du domaine) et l'authentification des e-mails (SPF, DKIM).

Pour Nimbus, la configuration principale :

- `eatnimbus.com` → enregistrement A pointant vers l'adresse IP de l'équilibreur de charge
- `www.eatnimbus.com` → CNAME pointant vers `eatnimbus.com`
- `api.eatnimbus.com` → enregistrement A pointant vers l'équilibreur de charge de l'API

« Attends », dit Tom. « L'adresse IP de l'équilibreur de charge peut changer. AWS l'a dit dans la documentation. »

Bonne observation, Tom.

**Enregistrements Alias : la solution d'AWS aux adresses IP dynamiques**

Les équilibreurs de charge, les distributions CloudFront et les sites web S3 ont des noms DNS, pas des adresses IP statiques. Les adresses IP sous-jacentes peuvent changer.

Si vous créez un CNAME pointant vers le nom DNS d'un équilibreur de charge, ça fonctionne — mais vous ne pouvez pas utiliser des CNAMEs pour les domaines racines (`eatnimbus.com` sans le `www`) en raison des standards DNS.

Route 53 résout ce problème avec les **enregistrements Alias** — une extension AWS spécifique au DNS. Un enregistrement Alias associe directement un nom à une ressource AWS (équilibreur de charge, distribution CloudFront, site web S3), et Route 53 gère automatiquement la résolution d'adresse IP dynamique. Les enregistrements Alias peuvent être utilisés au niveau du domaine racine. Et contrairement aux requêtes DNS ordinaires vers des services externes, les requêtes d'enregistrements Alias vers des ressources AWS sont gratuites.

« Donc on utilise un enregistrement Alias pour `eatnimbus.com` pointant vers l'équilibreur de charge », confirma Leo.

« Et Route 53 gère l'adresse IP que l'équilibreur de charge utilise à tout moment donné », ajouta Priya.

« Gratuitement », dit Tom, soudainement très intéressé.

**Politiques de routage : bien plus que "Où est-ce ?"**

C'est là que Route 53 devient intéressant. Le DNS n'est pas seulement un service de recherche — il peut être un outil de gestion du trafic.

**Routage simple** : un enregistrement, une destination. DNS standard.

**Routage pondéré** : répartissez le trafic entre plusieurs destinations par poids. Envoyez 90 % vers le nouveau serveur, 10 % vers l'ancien lors d'une migration. Ajustez les poids jusqu'à ce que vous ayez confiance dans le nouveau serveur, puis passez à 100 %.

**Routage basé sur la latence** : dirigez les utilisateurs vers la région AWS avec la latence la plus faible pour eux. Un utilisateur à Seattle est dirigé vers `us-west-2`. Un utilisateur à Tokyo est dirigé vers `ap-northeast-1`. Même nom de domaine, destinations différentes.

**Routage par géolocalisation** : dirigez en fonction de la localisation géographique de l'utilisateur. Tous les utilisateurs européens vont vers `eu-west-1`. Tous les utilisateurs nord-américains vont vers `us-east-1`. Utile pour la souveraineté des données (garder les données des utilisateurs de l'UE dans les régions de l'UE) ou la personnalisation du contenu (langue, devise).

**Routage de basculement** : désignez un point de terminaison principal et un secondaire. Si le principal échoue à la vérification de santé de Route 53, le trafic est automatiquement redirigé vers le secondaire. C'est la couche DNS de la reprise après sinistre.

**Routage à réponses multiples** : renvoyez jusqu'à huit adresses IP saines pour une requête, laissant le client choisir. Une alternative simple à un équilibreur de charge pour distribuer le trafic entre plusieurs serveurs.

« Donc Route 53 n'est pas seulement un annuaire téléphonique », dit Maya. « C'est un annuaire intelligent qui peut diriger les appels selon l'endroit d'où vous appelez. »

« Et qui vous déconnecte si le numéro est défaillant », ajouta Priya.

**Vérifications de santé : contourner les pannes**

Route 53 peut surveiller vos points de terminaison avec des vérifications de santé. Si un point de terminaison tombe en panne, Route 53 peut :

- Le supprimer des réponses DNS (cesser d'y envoyer du trafic)
- Déclencher un basculement vers un point de terminaison de secours
- Envoyer une alerte via CloudWatch

Les vérifications de santé font le lien entre le routage DNS et la santé réelle de l'application. Dans une configuration de basculement : Route 53 surveille le point de terminaison principal toutes les 30 secondes. Si trois vérifications consécutives échouent, Route 53 commence à renvoyer l'adresse du point de terminaison secondaire.

Ce n'est pas instantané — le DNS a un délai de propagation. Une fois que Route 53 modifie un enregistrement DNS, les résolveurs DNS du monde entier doivent prendre en compte le changement, ce qui peut prendre des secondes à des minutes selon les paramètres TTL.

**TTL : le cache DNS**

Les réponses DNS sont mises en cache à plusieurs niveaux — dans votre routeur, chez votre fournisseur d'accès, dans votre navigateur. Le **TTL (Time-To-Live)** d'un enregistrement DNS indique aux caches combien de temps mémoriser la réponse avant de vérifier à nouveau.

TTL élevé (1 heure ou plus) : moins de requêtes DNS, moins de charge sur Route 53, mais les changements prennent plus de temps à se propager.

TTL faible (60 secondes ou moins) : les changements se propagent rapidement, mais davantage de requêtes DNS sont nécessaires.

Avant une migration planifiée (mise à jour du DNS pour pointer vers un nouveau serveur), réduisez votre TTL à 60 secondes un jour à l'avance. Ainsi, lorsque vous effectuez le changement, il se propage en environ une minute. Après la migration, remontez-le à la valeur normale.

« Si on le réduit seulement pendant la migration et pas avant », dit Leo lentement, « l'ancien TTL signifie que certains utilisateurs verront l'ancien serveur pendant une heure. »

« Exactement », dit Priya. « Les migrations DNS nécessitent une planification avant la migration, pas seulement pendant. »

## Points forts et limites

**Route 53 est le bon choix pour** : enregistrer et gérer des noms de domaine entièrement dans AWS ; router le trafic en fonction de la latence, de la géolocalisation ou d'une distribution pondérée sur plusieurs points de terminaison ; le basculement basé sur les vérifications de santé entre régions ou entre un point de terminaison principal et un point de terminaison de reprise après sinistre ; intégrer le DNS avec d'autres services AWS via des enregistrements Alias.

**Quand Route 53 n'est pas ce dont vous avez besoin** : Route 53 est un service DNS, pas un équilibreur de charge. Si vous devez distribuer le trafic entre plusieurs serveurs ou conteneurs au sein d'une région, utilisez un Application Load Balancer — Route 53 ne peut pas faire du round-robin pondéré au niveau de la connexion comme le peut un équilibreur de charge. Le routage basé sur la latence entre régions ajoute des coûts et une complexité opérationnelle qui n'a de sens que si vos utilisateurs sont réellement distribués mondialement et que les millisecondes ont une importance sur la conversion. Pour la plupart des applications dans une seule région, un seul enregistrement A pointant vers un ALB est toute la configuration Route 53 dont vous avez besoin.

## Résumé

- **Le DNS** traduit les noms de domaine en adresses IP — l'annuaire d'Internet.
- **Route 53** est le service DNS géré d'AWS : enregistrement de domaines, hébergement DNS, vérifications de santé et politiques de routage.
- Les **enregistrements A** associent des noms à des adresses IPv4. Les **CNAMEs** associent des noms à d'autres noms. Les **enregistrements Alias** associent des noms à des ressources AWS (équilibreurs de charge, CloudFront, S3).
- Utilisez des enregistrements Alias (pas des CNAMEs) pour les domaines racines et pour les ressources avec des adresses IP dynamiques.
- Les politiques de routage vont au-delà du DNS simple : **pondéré** (répartition du trafic), **basé sur la latence** (performance), **géolocalisation** (souveraineté des données), **basculement** (reprise après sinistre).
- Les **vérifications de santé** surveillent les points de terminaison et suppriment automatiquement les cibles défaillantes des réponses DNS.
- Planifiez les changements de TTL avant les migrations — réduisez le TTL à l'avance pour que les changements se propagent rapidement.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures haute performance (Domaine 3, Tâche 3.4)*

- **Alias vs CNAME** : les enregistrements Alias peuvent être utilisés au niveau du domaine racine ; les CNAMEs ne le peuvent pas. Les enregistrements Alias vers des ressources AWS sont gratuits ; les requêtes DNS CNAME sont payantes. Quand l'examen demande comment associer un domaine racine à un équilibreur de charge → enregistrement Alias.
- **Cas d'usage des politiques de routage** (scénarios courants d'examen) :
  - « Migrer progressivement le trafic vers une nouvelle version » → Routage pondéré
  - « Diriger les utilisateurs vers la région AWS la plus proche » → Routage basé sur la latence
  - « Garder les données des utilisateurs de l'UE dans les régions de l'UE » → Routage par géolocalisation
  - « Basculement DNS automatique quand le principal tombe en panne » → Routage de basculement avec vérifications de santé
- **Vérifications de santé Route 53** : peuvent vérifier les points de terminaison HTTP/HTTPS/TCP, et peuvent déclencher des alarmes CloudWatch. L'examen les utilise dans des scénarios de reprise après sinistre.
- **TTL et propagation** : sachez que le TTL contrôle la durée pendant laquelle les résolveurs DNS mettent en cache un enregistrement. TTL court = changements plus rapides. Scénario d'examen : « l'équipe a mis à jour le DNS mais les utilisateurs atteignent toujours l'ancien serveur » → TTL trop élevé.
- **Zones hébergées privées** : Route 53 peut créer des enregistrements DNS qui ne se résolvent qu'à l'intérieur d'un VPC. L'examen l'utilise pour la découverte de services internes (par ex., `database.internal` se résolvant vers un point de terminaison RDS privé).
- Route 53 est **global** — il n'est pas déployé dans une région. Aucune sélection de région n'est nécessaire lors de la création de zones hébergées.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre un enregistrement CNAME et un enregistrement Alias. Quand utiliseriez-vous chacun ?

*(Indice : Tenez compte des contraintes des CNAME sur les domaines racines, et du comportement des enregistrements Alias avec les ressources AWS dynamiques.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise de médias exploite un site web depuis deux régions AWS : `us-east-1` (principale) et `eu-west-1` (secondaire). L'équipe souhaite que le trafic soit automatiquement dirigé vers `eu-west-1` si la région principale devient indisponible. L'entreprise souhaite également vérifier que ce mécanisme de basculement fonctionne correctement sans réellement mettre hors service la région principale.

Quelle configuration Route 53 répond LE MIEUX à ces exigences ?

A) Routage pondéré avec 100 % de poids sur `us-east-1` et 0 % sur `eu-west-1`  
B) Routage basé sur la latence avec vérifications de santé sur les deux points de terminaison  
C) Routage de basculement avec une vérification de santé sur le point de terminaison principal et un enregistrement secondaire pointant vers `eu-west-1`  
D) Routage par géolocalisation avec l'Amérique du Nord pointant vers `us-east-1` et l'Europe pointant vers `eu-west-1`

**Indice 1** : L'exigence est un basculement automatique lorsque le principal tombe en panne. Quelle politique de routage est conçue exactement pour cela ?

**Indice 2** : « Tester sans mettre hors service la région principale » — les vérifications de santé peuvent être manuellement configurées comme « défaillantes » pour les tests.

**Indice 3** : Le routage basé sur la latence optimise pour la vitesse, pas pour le basculement.

**Réponse** : C

**Explication** : Le routage de basculement est conçu exactement pour ce cas d'utilisation. L'enregistrement principal pointe vers `us-east-1` avec une vérification de santé. L'enregistrement secondaire pointe vers `eu-west-1`. Si la vérification de santé échoue, Route 53 sert automatiquement l'enregistrement secondaire. Les vérifications de santé peuvent être forcées manuellement à l'échec pour les tests sans perturber réellement la région principale.

**Pourquoi pas A ?** Le routage pondéré avec 100 %/0 % est effectivement statique — il ne bascule pas automatiquement lorsque le principal échoue.

**Pourquoi pas B ?** Le routage basé sur la latence choisit le point de terminaison le plus rapide pour chaque utilisateur. Il n'exclut pas automatiquement une région en fonction de sa santé — il continuerait à router une partie du trafic vers un `us-east-1` défaillant si la latence le favorise.

**Pourquoi pas D ?** Le routage par géolocalisation dirige selon la localisation de l'utilisateur, pas selon la santé du point de terminaison. Les utilisateurs européens resteraient bloqués sur `eu-west-1` même si `us-east-1` est sain, et les utilisateurs nord-américains ne basculeraient pas vers `eu-west-1` même si `us-east-1` tombe en panne.

*SAA-C03 Domaine : Concevoir des architectures haute performance — Tâche 3.4*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus s'étend à l'international. Ils souhaitent que `eatnimbus.com` se charge rapidement pour les utilisateurs sur la côte Ouest, la côte Est et en Australie. Ils ont également une exigence réglementaire : les commandes passées par des utilisateurs européens doivent être traitées par des serveurs dans l'UE.

Concevez une stratégie de routage Route 53 qui répond aux deux exigences. Quelle politique de routage ou combinaison de politiques utiliseriez-vous ? Quelle infrastructure dans chaque région vous faudrait-il ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception du routage multi-région.)*

## Scène post-générique

`eatnimbus.com` était en ligne.

Maya l'avait tapé dans son navigateur, et la page de commande de Nimbus s'était chargée. Elle avait commandé de l'arepa au restaurant de sa propre famille, juste pour tester le flux. La commande était passée. La cuisine l'avait reçue.

Elle s'était rassise.

Tom lisait déjà les journaux de vérification de santé de Route 53. « Le temps de réponse est de 47 millisecondes depuis us-east-1. »

« C'est rapide ? » demanda Maya.

« Pour le DNS ? Oui. »

« Mais pour un utilisateur à Seattle ? »

Tom regarda le graphique de latence. « Environ 80 millisecondes. »

Maya réfléchit. « Si la plupart de nos clients sont sur la côte Ouest, et que nos serveurs sont en Virginie... »

« Chaque requête voyage de Seattle à la Virginie et revient », dit Leo depuis l'autre côté de la pièce. « Vitesse de la lumière. On ne peut pas battre la physique. »

« Donc on a besoin de serveurs plus proches de Seattle. »

« Ou quelque chose de plus proche de Seattle qui serve du contenu en leur nom. »

Cette pensée resta en suspens dans l'air.

Dans le prochain chapitre : les entrepôts qui mettent le contenu de Nimbus à une milliseconde de chaque utilisateur, partout.
