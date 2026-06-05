# Chapitre 25 : L'Autoroute Privée

Levez-vous un moment. Secouez vos mains.

On va parler de déplacement de données. Pas entre les services dans AWS, mais entre le monde réel et AWS — entre votre bureau et votre infrastructure cloud, entre les continents.

L'équipe d'infrastructure de Nimbus (maintenant quatre ingénieurs) travaillait depuis un bureau partagé à Seattle. Ils avaient besoin d'accéder à l'infrastructure AWS qu'ils géraient. Certaines opérations nécessitaient de se connecter aux ressources dans le VPC.

Actuellement, ils utilisaient un VPN sur leurs ordinateurs portables pour accéder au bastion host dans le sous-réseau public, puis SSH vers les ressources depuis là.

Ça fonctionnait. C'était lent. La connexion VPN routait via l'internet public : Seattle → fibre transcontinentale → multiples sauts chez les opérateurs → us-east-1. Chaque aller-retour prenait 80+ millisecondes.

« Pour le SSH quotidien, c'est acceptable, » dit Leo. « Mais on s'apprête à commencer à déplacer notre base de données analytique. 4 téraoctets de données historiques de commandes. Avec cette connexion, la migration prendra des semaines. »

« On a besoin d'une meilleure connexion, » dit Maya.

« Une connexion privée, » ajouta Priya. « Pas par l'internet public. »

Pensez-y comme un trajet domicile-travail. Un VPN Site-à-Site, c'est comme conduire sur des routes publiques : vous fermez vos portières à clé (chiffrement), mais vous partagez quand même les voies avec tout le monde, et les embouteillages vous ralentissent de manière imprévisible. Direct Connect c'est comme louer une voie privée dédiée sur l'autoroute — pas de trafic partagé, vitesse constante, et un péage mensuel plus élevé. La plupart des jours, la route publique convient. Quand vous déplacez un camion plein de marchandises précieuses avec un calendrier serré, vous payez la voie privée.

**AWS Site-to-Site VPN : L'Option Rapide**

**AWS Site-to-Site VPN** crée un tunnel chiffré entre votre réseau sur site et votre VPC, traversant l'internet public.

Configuration :

1. Créer un Virtual Private Gateway (VGW) attaché à votre VPC
2. Créer une Customer Gateway représentant votre routeur sur site
3. Établir deux tunnels VPN (pour la redondance) entre eux

Le trafic est chiffré (AES-256). Il voyage sur l'internet public, ce qui signifie que la latence dépend des conditions internet. AWS fournit automatiquement deux tunnels pour la redondance — si un tunnel a des problèmes, le trafic bascule vers l'autre.

**Quand utiliser Site-to-Site VPN** :

- Configuration rapide (minutes à heures)
- Rentable (0,05 $/heure par connexion VPN)
- Bande passante : jusqu'à 1,25 Gbps par tunnel
- Latence internet acceptable pour le cas d'utilisation

Pour la migration de 4 To de Nimbus, un VPN basé sur internet à 1,25 Gbps maximum prendrait : 4 To / 1,25 Gbps ≈ 7 heures minimum, avec une surcharge réelle plus proche de 12-20 heures. Acceptable, mais la congestion sur le chemin internet public le rend imprévisible.

« Quelle est l'autre option ? » demanda Tom.

**AWS Direct Connect : La Ligne Dédiée**

**AWS Direct Connect** établit une connexion réseau dédiée et privée entre votre emplacement (ou votre installation de colocation) et AWS. Le trafic ne touche jamais l'internet public.

Direct Connect est une connexion physique — une ligne fibre de votre réseau vers un emplacement Direct Connect AWS. Vous travaillez avec un opérateur télécom pour établir le circuit physique. AWS fournit le port de leur côté.

**Avantages** :

- Latence cohérente et prévisible (pas de variance de l'internet public)
- Vitesses de 50 Mbps à 100 Gbps
- Coûts de transfert de données plus faibles qu'Internet (les tarifs de transfert de données Direct Connect sont moins chers que les tarifs de transfert de données AWS standard)
- Plus sécurisé (circuit privé, pas internet public)

**Compromis** :

- La configuration prend des semaines à des mois (provisionnement d'infrastructure physique)
- Coût significativement plus élevé que VPN (0,025 à 0,30 $/heure par port, plus les coûts du circuit télécom — souvent 500 à 1000+ $/mois minimum)
- Pas de redondance intégrée (vous établissez des circuits redondants vous-même)
- Pas adapté aux bureaux géographiquement distribués sans plusieurs circuits

Pour Nimbus : Direct Connect était excessif pour leur taille actuelle. Mais pour les entreprises avec des volumes de transfert de données significatifs ou des exigences de conformité pour les connexions réseau privées, Direct Connect se rentabilise.

**Connexions Hébergées : Le Juste Milieu**

Toutes les organisations ne peuvent pas s'engager sur un circuit fibre dédié de 100 Gbps. Les **Connexions hébergées Direct Connect** permettent aux Partenaires Direct Connect AWS (opérateurs télécoms approuvés) de provisionner des connexions sous-1 Gbps que vous partagez avec d'autres clients.

La configuration est plus rapide (jours à semaines, pas mois) et coûte moins cher qu'une connexion dédiée. Le compromis : la capacité partagée signifie un débit moins cohérent.

Pour Nimbus (à mesure qu'il grandit) : une connexion hébergée de 500 Mbps via un partenaire offrirait une connectivité privée à un prix raisonnable.

**AWS Transit Gateway : Hub-and-Spoke pour les VPCs**

Au fur et à mesure que Nimbus grandissait, il accumulerait plusieurs VPCs : le VPC de production, le VPC de staging, le VPC d'analytique, le VPC d'outillage de sécurité.

Sans planification soigneuse, connecter ces VPCs nécessite un maillage complet de connexions de peering VPC. Pour 4 VPCs : 6 connexions de peering. Pour 10 VPCs : 45 connexions. Pour 20 VPCs : 190 connexions. Cela ne s'adapte pas.

**AWS Transit Gateway** est un hub réseau qui connecte plusieurs VPCs et réseaux sur site. Au lieu d'un maillage de connexions de peering, chaque VPC se connecte au Transit Gateway. Transit Gateway route le trafic entre eux.

```
Sur site ──── Direct Connect ──┐
                               │
VPC Production ───────────────── Transit Gateway
VPC Staging ──────────────────── Transit Gateway
VPC Analytique ────────────────── Transit Gateway
VPC Sécurité ─────────────────── Transit Gateway
```

**Routage transitif** : Si le VPC A et le VPC B se connectent tous deux au Transit Gateway, ils peuvent communiquer — sans peering direct. Transit Gateway gère le routage. Contrairement au peering VPC (qui n'est pas transitif), Transit Gateway permet une topologie hub-and-spoke.

**Coûts Transit Gateway** : facturés par pièce jointe (connexion VPC ou VPN/Direct Connect) plus par Go de données traitées. À grande échelle, cela vaut la simplicité.

**VPC Endpoints : Accès Privé aux Services AWS**

Un problème subtil de coût et de sécurité : quand votre instance EC2 (dans un sous-réseau privé) appelle l'API S3, ce trafic route par la NAT Gateway (pour atteindre internet, où se trouve l'endpoint public de S3). Vous payez le traitement NAT Gateway.

Les **VPC Endpoints** permettent aux ressources de votre VPC de communiquer avec les services AWS de manière privée, sans passer par l'internet public — et sans NAT Gateway.

Deux types :

**Endpoints Gateway** (gratuits) : Pour S3 et DynamoDB. Vous ajoutez une route dans votre table de routage qui dirige le trafic S3 ou DynamoDB vers l'endpoint au lieu de la NAT Gateway. Gratuit à créer ; gratuit à utiliser.

**Endpoints Interface** (payants) : Pour les autres services AWS (SQS, SNS, Secrets Manager, SSM, etc.). Crée une ENI (Elastic Network Interface) dans votre sous-réseau avec une IP privée. Le trafic vers le service utilise cette IP privée. Coûte ~0,01 $/heure par AZ plus des frais de traitement des données.

Tom créa immédiatement des endpoints Gateway pour S3 et DynamoDB après avoir appris qu'ils étaient gratuits. Les frais de traitement des données NAT Gateway ont chuté de 30%.

**AWS Global Accelerator : Le Routage à la Périphérie**

Quand Nimbus servait les utilisateurs de la Côte Ouest depuis us-east-1 (Virginie), la latence était de 80ms. Pas parce que le serveur était excessivement loin, mais parce que le routage internet public entre Seattle et Virginie était sous-optimal, rebondissant à travers plusieurs réseaux d'opérateurs.

**AWS Global Accelerator** utilise le réseau de backbone privé d'AWS (la même infrastructure qui alimente CloudFront) pour router le trafic entre les utilisateurs et les applications AWS. Au lieu du routage internet public, le trafic entre dans le réseau AWS à l'emplacement périphérique le plus proche et voyage le chemin privé optimisé vers votre application.

Pour Nimbus, un utilisateur à Seattle :

- **Sans Global Accelerator** : Route via les opérateurs internet publics → ~80ms
- **Avec Global Accelerator** : Atteint le bord AWS le plus proche à Seattle → voyage sur le backbone AWS → atteint us-east-1 → ~45ms

Global Accelerator ne met pas en cache le contenu (c'est CloudFront). Il optimise le chemin réseau pour les requêtes dynamiques.

**Quand Utiliser Global Accelerator vs CloudFront** :

- CloudFront : contenu statique et mise en cache, cas d'utilisation CDN
- Global Accelerator : contenu dynamique, protocoles non-HTTP (UDP, jeux, IoT), ou quand vous avez besoin d'une adresse IP Anycast statique

## Points Forts et Limites

**Site-to-Site VPN** :

- Configuration rapide, faible coût
- Chemin internet public signifie une latence variable
- Plafond de bande passante limité

**Direct Connect** :

- Cohérent, privé, haute bande passante
- Lent à configurer, coût récurrent significatif
- Le circuit physique est un point de défaillance unique (ajouter de la redondance)

**Transit Gateway** :

- Simplifie considérablement la connectivité multi-VPC
- Routage transitif (contrairement au peering VPC)
- Le coût s'accumule pour de nombreuses pièces jointes

**VPC Endpoints** :

- Bénéfice de sécurité et de coût pour S3/DynamoDB (endpoints gateway gratuits)
- Élimine les coûts NAT Gateway pour le trafic des services AWS

**Global Accelerator** :

- Améliore la latence des applications dynamiques pour les utilisateurs mondiaux
- IPs Anycast fixes (contrairement aux IPs dynamiques de CloudFront)
- Coût supplémentaire (0,025 $/heure par accélérateur + transfert de données)

## Résumé

- **Site-to-Site VPN** : Tunnel chiffré sur internet public entre le réseau sur site et le VPC. Configuration rapide, coût plus faible, latence variable.
- **Direct Connect** : Connexion fibre dédiée privée vers AWS. Latence prévisible, bande passante plus élevée, des semaines pour configurer, coût significatif.
- **Transit Gateway** : Hub pour la connectivité VPC et sur site. Permet le routage transitif. S'adapte à des centaines de connexions.
- **VPC Endpoints** : Accès privé aux services AWS sans NAT Gateway. Les endpoints Gateway (S3, DynamoDB) sont gratuits.
- **Global Accelerator** : Route le trafic dynamique sur le backbone AWS pour une latence plus faible et plus cohérente à l'échelle mondiale.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.4)*

- **Signaux VPN vs Direct Connect** : VPN = « chiffrer le trafic vers le VPC », « configuration rapide », « sensible aux coûts ». Direct Connect = « faible latence cohérente », « grands transferts de données », « connexion privée », « conformité nécessitant un réseau privé ».
- **Transit Gateway vs peering VPC** : Le peering est non transitif (A→B→C ne permet pas A→C). Transit Gateway est transitif. « De nombreux VPCs ayant besoin de communiquer » → Transit Gateway.
- **VPC Gateway Endpoints** : Gratuits. S3 et DynamoDB uniquement. Changement de table de routage. Pas de coût supplémentaire. Scénario d'examen : « réduire les coûts de transfert de données pour l'accès S3 depuis un sous-réseau privé » → Gateway Endpoint.
- **Global Accelerator vs CloudFront** : Accelerator = contenu dynamique, non-HTTP, IP statique, optimisation réseau. CloudFront = mise en cache, contenu HTTP, CDN.
- **Direct Connect + VPN** : Vous pouvez utiliser un VPN comme sauvegarde pour une connexion Direct Connect. Si le circuit Direct Connect tombe, le trafic bascule vers le VPN. Plus cher que VPN seul, plus fiable que Direct Connect seul.
- **Direct Connect Gateway** : Connecte un circuit Direct Connect à plusieurs VPCs dans plusieurs régions ou comptes. Sans lui, un circuit Direct Connect se connecte à un VGW dans une région.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre AWS Site-to-Site VPN et AWS Direct Connect. Dans quel scénario choisiriez-vous chacun ?

*(Indice : Réfléchissez au temps de configuration, au coût, à la cohérence de la latence et aux exigences de bande passante.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de services financiers nécessite une connexion réseau privée, chiffrée et dédiée de son centre de données sur site vers AWS. Elle transfère 500 Go de données financières sensibles quotidiennement. La connexion doit avoir une latence cohérente et prévisible et ne doit pas traverser l'internet public. Elle a également besoin d'une connexion de secours en cas de défaillance de la primaire.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Une connexion Site-to-Site VPN avec routage BGP et un second VPN pour la redondance  
B) Une connexion Direct Connect avec un Site-to-Site VPN comme sauvegarde  
C) Deux connexions Site-to-Site VPN via différents fournisseurs internet  
D) Une connexion hébergée Direct Connect avec Direct Connect Gateway

**Indice 1** : « Ne doit pas traverser l'internet public » — le trafic VPN passe par l'internet public (chiffré). Seul Direct Connect est privé.

**Indice 2** : « Latence cohérente et prévisible » — les performances VPN sur internet public varient. Direct Connect est cohérent.

**Indice 3** : « Connexion de secours » — quelle est l'approche recommandée quand Direct Connect est la primaire ?

**Réponse** : B

**Explication** : Direct Connect fournit une connexion dédiée privée qui ne traverse pas l'internet public — répondant aux exigences de confidentialité et de latence. Un Site-to-Site VPN comme sauvegarde fournit la redondance : si le circuit Direct Connect tombe, le trafic bascule vers le VPN chiffré. C'est le modèle HA standard pour Direct Connect.

**Pourquoi pas A ?** Le trafic Site-to-Site VPN traverse l'internet public, ce qui viole l'exigence « ne doit pas traverser l'internet public ».

**Pourquoi pas C ?** Deux connexions VPN via différents FAI traversent quand même l'internet public, même si elles sont chiffrées. Ne répond pas à l'exigence de réseau privé.

**Pourquoi pas D ?** Une connexion hébergée fournit une connexion Direct Connect mais l'option D n'inclut pas de sauvegarde. Direct Connect seul sans sauvegarde est un point de défaillance unique — la fibre physique peut être coupée.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.4*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus s'étend pour avoir des équipes d'ingénierie régionales à Seattle, Berlin et Singapour. Chaque équipe régionale doit accéder à :

- Le VPC de production (lecture seule pour le débogage)
- Le VPC de staging (accès complet pour les tests)
- Le VPC d'analytique (lecture seule pour les rapports)

Concevez la connectivité réseau. Utiliseriez-vous Transit Gateway ? Direct Connect dans chaque région ou Site-to-Site VPN ? Comment appliqueriez-vous l'accès lecture seule pour la production ? (Indice : c'est à la fois une question de réseau et d'IAM.)

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception réseau multi-régions et multi-équipes.)*

## Scène Post-Générique

La migration des données s'est terminée en 14 heures.

Pas par le chemin lent de l'internet public — Leo avait utilisé AWS Snow Family (appareils de stockage physiques expédiés depuis et vers AWS) pour la majeure partie des données, puis synchronisé le delta restant via le VPN.

« La prochaine fois, » dit-il, « on devrait configurer un Direct Connect. »

Tom regarda les tarifs.

« Un port dédié 1 Gbps coûte 216 $/mois, » dit-il. « Plus le circuit depuis notre bureau, qu'un opérateur télécom a cité à 800 $/mois. »

« Donc environ mille dollars par mois au total. »

« Pour ce qu'on fait actuellement, probablement pas rentable. Mais si on commence à déplacer plus de 10 To par mois entre notre bureau et AWS, les économies de transfert de données sur Direct Connect compenseraient le coût. »

« Donc on surveille le volume de transfert de données, » dit Priya, « et on réévalue quand il franchit le seuil. »

« C'est une architecture consciente des coûts, » dit Tom.

« Ça a toujours été le but, » dit Maya.

Dans le prochain chapitre : ce qui se passe quand vous avez plus de données qu'aucune base de données ne peut raisonnablement stocker, et que vous devez en tirer du sens.
