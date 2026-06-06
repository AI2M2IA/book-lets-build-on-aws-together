# Chapitre 25 : L'autoroute privée

Levez-vous un moment. Secouez vos mains.

Sentez la distance entre le bout de vos doigts et quelque chose de l'autre côté du pays. Imaginez envoyer un message qui doit parcourir cette distance, se frayer un chemin à travers une douzaine de transferts entre opérateurs, et revenir avant que vous puissiez continuer à travailler. Maintenant imaginez faire cela des milliers de fois par seconde.

C'est ce qu'est réellement le transfert de données — distance physique, infrastructure physique, contraintes physiques.

On va parler de déplacement de données. Pas entre les services dans AWS, mais entre le monde réel et AWS — entre votre bureau et votre infrastructure cloud, entre les continents.

---

Avec la base de données mise à l'échelle et les coûts de stockage réduits, Tom s'était tourné vers la facture réseau. Mais Leo avait un problème plus immédiat — déplacer 4 téraoctets de données historiques de commandes vers AWS exposait les limites de leur connexion actuelle.

---

L'équipe d'infrastructure de Nimbus (maintenant quatre ingénieurs) travaillait depuis un bureau partagé à Seattle. Ils avaient besoin d'accéder à l'infrastructure AWS qu'ils géraient. Certaines opérations nécessitaient de se connecter aux ressources dans le VPC.

Actuellement, ils utilisaient un VPN sur leurs ordinateurs portables pour accéder à l'hôte bastion dans le sous-réseau public, puis SSH vers les ressources depuis là.

Ça fonctionnait. C'était lent. La connexion VPN routait via l'internet public : Seattle → multiples sauts chez les opérateurs → us-west-2. Les allers-retours étaient incohérents — 30 à 80 millisecondes selon l'heure — et le débit était plafonné par la liaison montante du bureau et le chemin public.

« Pour le SSH quotidien, c'est acceptable », dit Leo. « Mais on s'apprête à commencer à déplacer notre base de données analytique. 4 téraoctets de données historiques de commandes. Avec cette connexion, la migration prendra des semaines. »

« On a besoin d'une meilleure connexion », dit Maya.

« Une connexion privée », ajouta Priya. « Pas par l'internet public. Et si quelqu'un essaie de s'introduire pendant le transfert de données ? 4 To d'historique de commandes sur l'internet public — même chiffré — ressemble à une cible. »

Pensez-y comme à un trajet domicile-travail. Un VPN Site-à-Site, c'est comme conduire sur des routes publiques : vous fermez vos portières à clé (chiffrement), mais vous partagez quand même les voies avec tout le monde, et les embouteillages vous ralentissent de manière imprévisible. Direct Connect, c'est comme louer une voie privée dédiée sur l'autoroute — pas de trafic partagé, vitesse constante, et un péage mensuel plus élevé. La plupart des jours, la route publique convient. Quand vous déplacez un camion plein de marchandises précieuses avec un calendrier serré, vous payez la voie privée.

Snow Family est l'option à laquelle la plupart des gens ne pensent pas : affréter un véritable vol cargo. Ce n'est pas toujours disponible. Ce n'est pas adapté aux petites charges. Mais pour un camion complet, ça arrive plus vite que la conduite et ne dépend pas du tout des conditions de l'autoroute. La physique n'a pas changé — vous déplacez toujours les mêmes bits — mais le mécanisme est fondamentalement différent.

**AWS Site-to-Site VPN : l'option rapide**

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
- Latence internet acceptable pour le cas d'usage

**Accelerated Site-to-Site VPN** route le trafic VPN sur le réseau mondial d'AWS plutôt que sur l'internet public — la même optimisation que fournit Global Accelerator, appliquée aux tunnels VPN. La latence est plus faible et plus cohérente que le VPN standard. Le coût est légèrement plus élevé (les frais de transfert de données Global Accelerator s'appliquent). Pour les équipes qui veulent la configuration rapide et le coût plus faible du VPN mais qui ont besoin d'une meilleure latence, l'Accelerated VPN est le compromis pratique entre le VPN standard et Direct Connect.

Pour la migration de 4 To de Nimbus, un VPN basé sur internet à 1,25 Gbps maximum prendrait : 4 To / 1,25 Gbps ≈ 7 heures minimum, avec une surcharge réelle plus proche de 12 à 20 heures. Acceptable, mais la congestion sur le chemin internet public le rend imprévisible.

Leo fit le calcul plus soigneusement, parce que le calcul théorique et le temps de transfert réel n'avaient jamais une seule fois correspondu dans son expérience.

**Théorique** : 4 To = 4 096 Go = 32 768 Gb. À 1 Gbps : 32 768 secondes ≈ 9,1 heures. Arrondi à 9 heures.

**Réel** : Leo avait effectué un transfert de test la semaine précédente — 50 Go du bureau de Seattle vers S3. Temps théorique à leur vitesse montante mesurée (875 Mbps) : 457 secondes. Temps réel : 724 secondes. Facteur de surcharge : 1,58.

Appliqué au transfert de 4 To à 875 Mbps en montant : 32 768 Gb / 0,875 Gbps × 1,58 de surcharge ≈ **59 200 secondes ≈ 16,4 heures**.

La surcharge venait de plusieurs sources : le démarrage lent de TCP à l'établissement de la connexion, la perte de paquets nécessitant une retransmission (le chemin public de Seattle à us-west-2 avait en moyenne 0,2 % de perte de paquets — faible, mais multiplicatif sur des millions de paquets), la surcharge de la poignée de main HTTPS pour chaque segment de téléchargement multipart, et le temps de traitement pour que S3 assemble les téléchargements multipart.

« Seize heures, c'est bien pour une migration ponctuelle », dit Leo. « Le vrai problème, c'est si le transfert est interrompu à la 14e heure. »

Le téléchargement multipart S3 résout le problème d'interruption : si le transfert échoue à la 14e heure, seule la partie en cours doit être retéléversée. Les parties précédentes sont stockées dans S3 et le transfert peut reprendre. Mais la surcharge de gestion des téléchargements multipart ajoutait environ 3 % au temps de transfert total.

L'estimation réelle finale : **environ 9 heures théoriques sur un internet à 1 Gbps, environ 17 heures réelles** — en tenant compte de la vitesse montante mesurée de 875 Mbps de leur bureau, de la surcharge de perte de paquets, et du traitement des téléchargements multipart.

Leo réfléchit à cela un moment. Puis il regarda la page de tarification de Snow Family.

« Quelle est l'autre option ? » demanda Tom.

« Attends — mais *pourquoi* aurions-nous besoin de plus qu'un VPN ? » demanda Maya. « La migration de 4 To est un événement ponctuel. »

« Ça ne l'est pas », dit Priya. « Une fois les données dans AWS, l'équipe doit encore y accéder quotidiennement. Et la latence VPN s'accumule. »

**AWS Direct Connect : la ligne dédiée**

**AWS Direct Connect** établit une connexion réseau dédiée et privée entre votre emplacement (ou votre installation de colocation) et AWS. Le trafic ne touche jamais l'internet public.

Direct Connect est une connexion physique — une ligne fibre de votre réseau vers un emplacement Direct Connect AWS. Vous travaillez avec un opérateur télécom pour établir le circuit physique. AWS fournit le port de leur côté.

**Avantages** :

- Latence cohérente et prévisible (pas de variance de l'internet public)
- Vitesses de 50 Mbps à 100 Gbps (avec des ports dédiés natifs à 400 Gbps à certains emplacements depuis 2024)
- Coûts de transfert de données plus faibles qu'Internet (les tarifs de transfert de données Direct Connect sont moins chers que les tarifs de sortie de données AWS standard)
- Plus sécurisé (circuit privé, pas internet public)

**Compromis** :

- La configuration prend des semaines à des mois (provisionnement d'infrastructure physique)
- Coût significativement plus élevé que VPN
- Pas de redondance intégrée (vous établissez des circuits redondants vous-même)
- Pas adapté aux bureaux géographiquement distribués sans plusieurs circuits

Vous vous demandez peut-être : si Direct Connect est un câble fibre physique, que se passe-t-il si quelqu'un le coupe accidentellement ? C'est le problème du point de défaillance unique avec un circuit unique — c'est pourquoi les configurations Direct Connect de production utilisent des circuits redondants sur des chemins géographiquement séparés, ou maintiennent un VPN comme sauvegarde. Le câble peut être coupé ; l'activité continue.

« Combien cela coûte-t-il par mois ? » demanda Tom. Il l'avait déjà cherché. « Un port dédié 1 Gbps coûte 216 $/mois », dit-il. « Plus le circuit depuis notre bureau, qu'un opérateur télécom a cité à 800 $/mois. »

« Donc environ mille dollars par mois au total. »

Pour Nimbus : Direct Connect était excessif pour leur taille actuelle. Mais pour les entreprises avec des volumes de transfert de données significatifs ou des exigences de conformité pour les connexions réseau privées, Direct Connect se rentabilise.

**Connexions hébergées : le juste milieu**

Toutes les organisations ne peuvent pas s'engager sur un circuit fibre dédié de 100 Gbps. Les **connexions hébergées Direct Connect** permettent aux Partenaires Direct Connect AWS (opérateurs télécoms approuvés) de provisionner des connexions sous-1 Gbps que vous partagez avec d'autres clients.

La configuration est plus rapide (jours à semaines, pas mois) et coûte moins cher qu'une connexion dédiée. Le compromis : la capacité partagée signifie un débit moins cohérent.

Pour Nimbus (à mesure qu'il grandit) : une connexion hébergée de 500 Mbps via un partenaire offrirait une connectivité privée à un prix raisonnable.

La différence pratique qui compte à l'examen : les connexions hébergées sont disponibles à des vitesses de 50 Mbps à 10 Gbps (certains partenaires offrent jusqu'à 25 Gbps), provisionnées par un Partenaire AWS. Les connexions dédiées vont directement à AWS et sont disponibles à 1 Gbps, 10 Gbps et 100 Gbps (plus 400 Gbps à certains emplacements). Pour les vitesses inférieures à 1 Gbps, une connexion hébergée est la seule option Direct Connect — les connexions dédiées commencent à 1 Gbps minimum.

**AWS Transit Gateway : hub-and-spoke pour les VPC**

Au fur et à mesure que Nimbus grandissait, il accumulerait plusieurs VPC : le VPC de production, le VPC de staging, le VPC d'analytique, le VPC d'outillage de sécurité.

Sans planification soigneuse, connecter ces VPC nécessite un maillage complet de connexions de peering VPC. Pour 4 VPC : 6 connexions de peering. Pour 10 VPC : 45 connexions. Pour 20 VPC : 190 connexions. Cela ne s'adapte pas.

**AWS Transit Gateway** est un hub réseau qui connecte plusieurs VPC et réseaux sur site. Au lieu d'un maillage de connexions de peering, chaque VPC se connecte au Transit Gateway. Transit Gateway route le trafic entre eux.

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

Pour Nimbus, l'événement déclencheur pour Transit Gateway fut l'ajout d'un quatrième VPC. Ils avaient : production, staging, analytique, et maintenant outillage de sécurité (un VPC pour l'analyse de vulnérabilités et la surveillance de conformité SOC2 qui ne devrait pas être sur le même segment réseau que la production).

Sans Transit Gateway, connecter quatre VPC nécessite six connexions de peering :
- Production ↔ Staging
- Production ↔ Analytique
- Production ↔ Sécurité
- Staging ↔ Analytique
- Staging ↔ Sécurité
- Analytique ↔ Sécurité

Six connexions de peering, six entrées de table de routage par VPC, six règles de groupe de sécurité à examiner. Et le peering VPC est non transitif : si Production et Analytique sont en peering, et qu'Analytique et Sécurité sont en peering, Production ne peut pas atteindre Sécurité à travers le VPC Analytique. Vous avez besoin du peering Production ↔ Sécurité explicitement.

Avec Transit Gateway :

```
VPC Production  ──┐
VPC Staging     ──┤──── Transit Gateway ────── Sur site (Direct Connect)
VPC Analytique  ──┤
VPC Sécurité    ──┘
```

Quatre pièces jointes. Une table de routage à gérer. Routage transitif : Production peut atteindre Sécurité à travers Transit Gateway sans peering direct.

« Et si quelqu'un essaie de s'introduire par le Transit Gateway ? » demanda Priya. « Si les quatre VPC partagent un Transit Gateway, une ressource compromise dans le VPC Staging pourrait atteindre Production. »

Transit Gateway prend en charge les **tables de routage avec isolation** : vous pouvez définir quels VPC sont autorisés à communiquer à travers le Transit Gateway et lesquels sont isolés. Le VPC d'outillage de sécurité peut atteindre tous les autres (il a besoin de les analyser). Staging ne peut pas atteindre Production. Production ne peut pas atteindre Analytique directement (Analytique interroge les données via un point de terminaison spécifique en lecture seule).

« Un Transit Gateway », dit Priya, « avec des politiques de routage qui expriment le modèle d'accès réel. Contre six connexions de peering sans moyen centralisé d'auditer ce qui atteint quoi. »

**VPC Endpoints : accès privé aux services AWS**

Un problème subtil de coût et de sécurité : quand votre instance EC2 (dans un sous-réseau privé) appelle l'API S3, ce trafic route par la NAT Gateway (pour atteindre internet, où se trouve le point de terminaison public de S3). Vous payez le traitement NAT Gateway.

Les **VPC Endpoints** permettent aux ressources de votre VPC de communiquer avec les services AWS de manière privée, sans passer par l'internet public — et sans NAT Gateway.

Deux types :

**Endpoints Gateway** (gratuits) : Pour S3 et DynamoDB. Vous ajoutez une route dans votre table de routage qui dirige le trafic S3 ou DynamoDB vers l'endpoint au lieu de la NAT Gateway. Gratuit à créer ; gratuit à utiliser.

**Endpoints Interface** (payants) : Pour les autres services AWS (SQS, SNS, Secrets Manager, SSM, etc.). Crée une ENI (Elastic Network Interface) dans votre sous-réseau avec une IP privée. Le trafic vers le service utilise cette IP privée. Coûte ~0,01 $/heure par AZ plus des frais de traitement des données.

Leo avait déjà créé les endpoints Gateway la semaine précédente sans mettre à jour les tables de routage. « Je l'ai déjà déployé — oh », dit-il en vérifiant la configuration. « Les routes n'ont pas été mises à jour. Laisse-moi corriger ça. »

Tom créa immédiatement des endpoints Gateway pour S3 et DynamoDB après avoir appris qu'ils étaient gratuits. Les frais de traitement des données NAT Gateway ont chuté de 65 %.

Le calcul du pourquoi : les fonctions Lambda et les tâches ECS de Nimbus dans les sous-réseaux privés faisaient des requêtes constantes vers S3 (lecture de fichiers de config, écriture d'exports de journaux) et vers DynamoDB (lecture de données de restaurants, écriture de dossiers de commandes). Chaque requête routait par la NAT Gateway, qui facturait 0,045 $ par Go de données traitées.

Traitement de données mensuel NAT Gateway de Nimbus : 533 Go. Coût : 24 $/mois. Après l'ajout des Gateway Endpoints S3 et DynamoDB et la mise à jour des tables de routage : le trafic S3 et DynamoDB contournait entièrement la NAT Gateway. Le traitement mensuel NAT Gateway tomba à 187 Go — le trafic restant était des appels d'API vers d'autres services (Secrets Manager, SES, webhooks externes). Coût : 8,40 $/mois.

Économies : 15,60 $/mois, 187 $/an, pour deux configurations de Gateway Endpoint gratuites qui ont pris 10 minutes à mettre en place.

« Gratuit », dit Tom, pour la troisième fois.

« Les endpoints Gateway sont gratuits à créer et gratuits à utiliser », confirma Leo. « Ce ne sont pas seulement une amélioration de sécurité — router le trafic S3 et DynamoDB par un endpoint privé plutôt que par la NAT Gateway le retire entièrement de l'internet public. »

« Et si quelqu'un essaie de s'introduire par le trafic NAT Gateway ? » demanda Priya. « Si le trafic vers S3 passe par NAT, il est adressable depuis internet. Via un Gateway Endpoint, il est privé. »

C'est le bénéfice secondaire des Gateway Endpoints que la discussion sur les coûts éclipse parfois. Le trafic vers S3 et DynamoDB à travers un VPC Gateway Endpoint ne quitte jamais le réseau AWS, ne traverse jamais une adresse IP publique, et est régi par la politique de l'endpoint (une politique basée sur les ressources qui peut restreindre à quels buckets S3 ou tables DynamoDB l'endpoint peut accéder). Un Gateway Endpoint sur un bucket qui stocke des données client ajoute une couche supplémentaire : même avec une politique de bucket mal configurée, la politique de l'endpoint peut restreindre l'accès au trafic provenant du VPC spécifique.

**AWS Global Accelerator : le routage à la périphérie**

Quand Nimbus servait les utilisateurs de la Côte Est depuis us-west-2 (Oregon), la latence était de 80 ms. Pas parce que le serveur était excessivement loin, mais parce que le routage internet public entre Boston et l'Oregon était sous-optimal, rebondissant à travers plusieurs réseaux d'opérateurs.

**AWS Global Accelerator** utilise le réseau de backbone mondial privé d'AWS — un réseau distribué d'emplacements périphériques qui routent le trafic vers votre application à travers des chemins contrôlés par AWS plutôt que des sauts d'opérateurs internet publics. Au lieu du routage internet public, le trafic entre dans le réseau AWS à l'emplacement périphérique le plus proche et voyage le chemin privé optimisé vers votre application.

Pour Nimbus, un utilisateur à Boston :

- **Sans Global Accelerator** : Route via les opérateurs internet publics → ~80 ms
- **Avec Global Accelerator** : Atteint le bord AWS le plus proche à Boston → voyage sur le backbone AWS → atteint us-west-2 → ~60 ms

Global Accelerator ne met pas en cache le contenu (c'est CloudFront). Il optimise le chemin réseau pour les requêtes dynamiques.

Leo effectua une comparaison de latence à travers plusieurs villes après avoir activé Global Accelerator pour l'API Nimbus :

| Ville | Avant | Après | Amélioration |
|-------|-------|-------|--------------|
| Seattle, WA | 12 ms | 11 ms | 8 % |
| Los Angeles, CA | 28 ms | 22 ms | 21 % |
| Chicago, IL | 55 ms | 40 ms | 27 % |
| New York, NY | 82 ms | 61 ms | 26 % |
| Londres, RU | 145 ms | 112 ms | 23 % |
| Tokyo, Japon | 180 ms | 95 ms | 47 % |
| Sydney, Australie | 210 ms | 118 ms | 44 % |

L'amélioration était la plus spectaculaire pour les utilisateurs géographiquement distants — Tokyo de 180 ms à 95 ms, Sydney de 210 ms à 118 ms. Pour Seattle (proche des centres de données us-west-2 en Oregon), l'amélioration était plus faible — il y avait moins de sauts internet publics à optimiser.

« Attends — mais *pourquoi* Tokyo obtient-il une amélioration de 47 % ? » demanda Maya. « Si le centre de données est toujours dans us-west-2, la vitesse de la lumière n'est-elle pas la contrainte réelle ? »

« La vitesse de la lumière est le plancher », dit Leo. « La contrainte réelle est le routage internet public. Le trafic de Tokyo vers us-west-2 traverse des dizaines de systèmes autonomes — différents opérateurs, différents routeurs, différents accords de peering. Chaque saut ajoute de la latence. Global Accelerator route le trafic de l'emplacement périphérique de Tokyo vers us-west-2 sur la fibre privée d'AWS, qui a des chemins plus courts et un routage mieux réglé. »

Le minimum théorique de Tokyo à us-west-2 (basé sur la vitesse de la lumière sur fibre, environ 15 500 km aller-retour) : ~77 ms. Les 95 ms avec Global Accelerator approchent ce minimum théorique. Les 180 ms sans lui reflètent l'inefficacité du routage internet public, pas les lois de la physique.

Global Accelerator fournit deux **adresses IP anycast** statiques qui routent vers l'emplacement périphérique le plus proche. Contrairement à CloudFront (qui utilise des adresses IP dynamiques qui changent), ces IP sont stables — utiles pour la mise sur liste d'autorisation de pare-feu et pour les applications qui nécessitent une IP fixe à laquelle les clients se connectent.

**Quand utiliser Global Accelerator vs CloudFront** :

- CloudFront : contenu statique et mise en cache, cas d'usage CDN
- Global Accelerator : contenu dynamique, protocoles non-HTTP (UDP, jeux, IoT), ou quand vous avez besoin d'une adresse IP Anycast statique

## Déplacer des données, pas seulement du trafic : DataSync et Transfer Family

Pendant que l'architecture réseau prenait forme, Maya avait vu atterrir simultanément trois nouveaux projets d'intégration de chaînes de restaurants. Chacun avait une exigence de migration de données — et chaque exigence était différente.

La première chaîne, Pacific Table, avait besoin de déplacer 40 To de partages de fichiers NFS vers S3. Leur stockage de fichiers actuel était sur site, réparti sur quatre serveurs de fichiers dans leur siège de Seattle. Leo commença à écrire un plan de migration.

La deuxième chaîne, Marisol Group, avait une équipe comptable qui téléversait des factures quotidiennement vers un serveur SFTP local. Le workflow SFTP fonctionnait depuis 2015. Le personnel comptable savait une chose : ils ouvraient leur client SFTP chaque matin à 9 h, déposaient leurs factures, et le fermaient. Personne ne voulait changer cela. « Leurs comptables utilisent WinSCP », dit Maya. « Ce n'est pas négociable. »

« Ce sont deux outils différents », dit Priya.

« Oui », dit Leo. « Mais les deux existent. »

**AWS DataSync : rsync sous stéroïdes, avec une console AWS**

Pour la migration de 40 To de Pacific Table, le défi n'était pas la bande passante — le bureau de Seattle avait une bonne connexion montante. Le défi était l'orchestration : découvrir quels fichiers existaient, les transférer de manière fiable, vérifier les sommes de contrôle, planifier le transfert pour éviter de saturer le réseau du bureau pendant les heures de bureau, et surveiller la progression sur ce qui serait plusieurs jours d'opération continue.

**AWS DataSync** est un service de migration et de réplication de données basé sur un agent. Vous installez un agent DataSync léger dans votre environnement sur site — une machine virtuelle qui tourne sur VMware ou comme instance EC2. L'agent se connecte à vos serveurs de fichiers via NFS ou SMB, découvre vos partages, et les synchronise vers une destination dans AWS : un bucket S3, un système de fichiers EFS, ou un système de fichiers FSx.

Pensez-y comme à rsync sous stéroïdes, avec une console AWS. DataSync gère :

- **La découverte** : l'agent inventorie automatiquement vos partages source
- **La planification** : les transferts peuvent s'exécuter selon un calendrier défini (en dehors des heures de bureau) ou en continu
- **La vérification** : DataSync calcule les sommes de contrôle aux deux extrémités et vous alerte de toute incohérence
- **La surveillance** : la progression du transfert, le nombre de fichiers, les rapports d'erreurs et l'utilisation de la bande passante sont tous visibles dans la console
- **Le chiffrement en transit** : toutes les données sont chiffrées avec TLS pendant le transfert

Pour Pacific Table, Leo installa l'agent DataSync sur une VM dans leur réseau de Seattle, le pointa vers les quatre partages NFS, et configura un calendrier de transfert : 20 h à 6 h en semaine, continu le week-end. Après six jours, les 40 To avaient atterri dans S3. Il vérifia le transfert avec le rapport de somme de contrôle intégré de DataSync. Zéro divergence.

« Et pour la réplication continue ? » demanda Maya. « Pacific Table va continuer à ajouter des fichiers après la migration. »

« DataSync prend en charge les transferts incrémentaux », dit Leo. « Après la synchronisation initiale, il ne copie que ce qui a changé. On peut l'exécuter chaque nuit comme un travail de réplication. »

**AWS Transfer Family : votre workflow SFTP, soutenu par S3**

Pour l'équipe comptable de Marisol Group, l'exigence était différente. Personne ne s'éloignait de SFTP. Les comptables allaient continuer à utiliser WinSCP. La question était : où atterrissent ces téléversements SFTP ?

Actuellement, ils atterrissaient sur un serveur Linux local dans le back-office de Marisol. Les fichiers étaient ensuite déplacés manuellement vers leur système comptable. Le serveur local nécessitait de la maintenance, des sauvegardes, et quelqu'un avec un accès SSH pour le gérer.

**AWS Transfer Family** est un serveur SFTP, FTPS et FTP entièrement géré — soutenu par S3 ou EFS comme destination de stockage. Vous provisionnez un point de terminaison Transfer Family (il obtient un nom d'hôte et, optionnellement, une adresse IP statique). Vos clients s'y connectent en utilisant leur logiciel SFTP existant. Quand ils téléversent des fichiers, ces fichiers atterrissent directement dans un bucket S3.

L'équipe comptable ne change rien. Ils ouvrent toujours WinSCP chaque matin à 9 h. Ils se connectent toujours à un serveur SFTP avec leurs identifiants existants. Ils déposent toujours leurs factures dans le même dossier. La différence leur est invisible : côté serveur, les fichiers vont maintenant directement dans S3 au lieu d'aller sur un serveur Linux local.

« Et depuis S3, on peut déclencher le reste du workflow automatiquement », dit Priya. « Un événement S3 déclenche une fonction Lambda qui traite la facture et l'insère dans le système comptable. Pas d'étape manuelle. »

« Donc le workflow des comptables ne change pas », dit Maya, « mais de notre côté, tout est automatisé. »

« Oui. Et le serveur SFTP lui-même est entièrement géré — pas de patching, pas de sauvegardes, pas de serveur à maintenir. »

Tom avait déjà cherché la tarification. Transfer Family facture par heure de disponibilité du point de terminaison plus par Go transféré. Pour le volume de factures de Marisol Group, le coût mensuel était bien en dessous de 30 $. Le coût de maintenance du serveur local qu'il remplaçait — dépréciation du matériel, temps d'ingénierie pour la maintenance, gestion des sauvegardes — était considérablement plus élevé.

---

> **Conseil d'examen — DataSync et Transfer Family**
>
> *Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.1)*
>
> - **DataSync** = déplacer des données en masse du sur site vers AWS (partages de fichiers NFS ou SMB → S3, EFS, ou FSx). Les signaux d'examen : « migrer des partages de fichiers », « répliquer des données NFS vers S3 », « transfert de données sur site vers AWS », « réplication continue de données de fichiers ». DataSync utilise un agent installé sur site ; l'agent gère la découverte, la planification, et la vérification.
> - **Transfer Family** = transfert de fichiers continu utilisant les protocoles SFTP, FTPS, ou FTP, sans changer les outils clients. Les signaux d'examen : « workflow SFTP existant », « les partenaires téléversent des fichiers via SFTP », « serveur SFTP soutenu par S3 », « lift-and-shift SFTP », « ne peut pas changer le processus de transfert de fichiers ». Transfer Family est la réponse quand l'exigence est la compatibilité SFTP, pas le volume de données.
> - **La distinction compte** : DataSync est pour la migration et la réplication en masse (basé sur un agent, piloté par calendrier, optimisé réseau). Transfer Family est pour les services de transfert de fichiers compatibles avec les protocoles (basé sur un point de terminaison, toujours allumé, transparent pour le client). Ils résolvent des problèmes différents.
> - DataSync prend en charge S3, EFS et FSx comme destinations. Transfer Family prend en charge S3 et EFS comme backends de stockage.

---

**Migrer des serveurs, pas seulement des fichiers : les 7 R et MGN**

La troisième chaîne dans le pipeline de Maya n'avait pas seulement des fichiers — elle avait des serveurs entiers : une application de réservations sur mesure tournant sur deux machines sur site que personne ne voulait réécrire avant le déménagement. Déplacer des *applications* est sa propre discipline, et AWS décrit **sept façons de migrer** (les « 7 R ») que vous devez surtout savoir reconnaître :

- **Rehost** (« lift and shift ») : déplacer les serveurs tels quels. Le plus rapide, le moins de changement.
- **Replatform** (« lift, tinker, and shift ») : petites mises à niveau en chemin — comme déplacer une base de données autogérée vers RDS.
- **Repurchase** : abandonner l'ancien système, acheter du SaaS à la place.
- **Refactor** : reconcevoir nativement cloud. Le plus d'effort, le plus de bénéfice.
- **Retire** : il s'avère que personne ne l'utilisait. Supprimez-le.
- **Retain** : laissez-le où il est, pour l'instant.
- **Relocate** : déplacer au niveau de l'hyperviseur sans rien changer.

Pour le cas du rehost, l'outil est **AWS Application Migration Service (MGN)** : un agent réplique les disques des serveurs source, bloc par bloc, dans une zone de transit à faible coût dans AWS ; vous lancez des copies de test quand vous voulez ; au basculement, MGN convertit les serveurs répliqués en instances EC2 natives. Lift, shift, terminé — le refactoring peut venir plus tard, sur le temps du cloud. (Ses compagnons pour la planification de portefeuille, Application Discovery Service et Migration Hub, ont fermé aux nouveaux clients fin 2025 — connaissez leurs noms comme « découverte d'inventaire » et « suivi central de migration » si l'examen les mentionne.)

---

**AWS Snow Family : l'option physique**

Il restait la question du jeu de données historique de 4 To et de l'estimation internet de 17 heures. Après l'avoir calculée, Leo avait regardé la page de tarification de Snow Family et pris la décision immédiatement.

Pour les migrations au-dessus de quelques téraoctets où le temps compte plus que la simplicité, AWS expédie des appareils de stockage physiques à votre emplacement. Vous les remplissez de données. Vous les renvoyez. AWS ingère les données directement dans S3.

**Snowball Edge Storage Optimized** : 80 To de capacité utilisable, enceinte durcie. Expédié à votre emplacement en 2 à 5 jours ouvrables. Vous chargez les données en utilisant l'interface locale (NFS, interface S3). Vous le renvoyez. AWS ingère les données en environ 1 à 3 jours ouvrables après réception.

Pour la migration de 4 To de Nimbus, le processus :

1. **Commander** un Snowball Edge via la console AWS (prend 2 minutes, expédié en 3 jours)
2. **Connecter** l'appareil au réseau du bureau de Seattle ; il se présente comme un point de montage NFS
3. **Copier** les 4 To de données historiques de commandes en utilisant l'interface compatible S3 de l'appareil : `aws s3 cp /data/orders s3://nimbus-data/ --endpoint-url http://192.168.1.100:8080 --profile snowballEdge`
4. **La copie se termine** en environ 2 heures (réseau local, pas d'internet)
5. **Renvoyer** l'appareil à AWS (étiquette prépayée incluse)
6. AWS **ingère** les données vers S3 dans les 72 heures suivant la réception
7. **Vérifier** — S3 fournit un rapport d'achèvement de travail montrant chaque fichier transféré et sa somme de contrôle

Temps total écoulé : 3 jours pour la livraison + 2 heures pour copier + 1 jour d'expédition + 2 jours d'ingestion = environ 7 jours calendaires. Contre environ 17 heures en continu — ce qui aurait nécessité une connexion internet stable et ininterrompue, saturant la liaison montante du bureau pendant la nuit et la majeure partie d'un jour ouvrable.

Coût : la location de l'appareil Snowball Edge est de 300 $ pour 10 jours. Expédition (aller-retour) : environ 80 $. Le transfert de données entrant vers S3 est gratuit. Coût total de migration : **380 $**.

Comparé à environ 17 heures d'utilisation internet soutenue à 875 Mbps : le tunnel VPN était gratuit (0,05 $/heure mais le tunnel tournait déjà) ; le transfert de données entrant vers S3 était gratuit. Le chemin internet « gratuit » avait un coût réel en temps d'ingénierie (surveiller un transfert de 17 heures), en risque (toute interruption nécessitant un redémarrage), et en coût d'opportunité (leur connexion internet était saturée pendant la fenêtre de transfert). Leo passa la commande. Comment cela s'est déroulé est dans la scène post-générique de ce chapitre.

---

## Points forts et limites

**Site-to-Site VPN** :

- Configuration rapide, faible coût
- Chemin internet public signifie une latence variable
- Plafond de bande passante limité (1,25 Gbps par tunnel)
- L'option Accelerated VPN améliore la latence à un coût légèrement plus élevé

**Direct Connect** :

- Cohérent, privé, haute bande passante
- Lent à configurer, coût récurrent significatif
- Le circuit physique est un point de défaillance unique (ajoutez de la redondance ou maintenez un VPN de sauvegarde)
- Seuil de rentabilité avec les économies de coût de sortie autour de 10 à 15 To/mois selon le scénario de tarification

**AWS Snow Family** :

- Pour les migrations ponctuelles au-dessus de 1 à 2 To, souvent plus rapide et moins cher que le transfert réseau
- Pas de consommation de bande passante internet pendant la migration
- Fenêtre de location d'appareil de 10 jours ; expédition prépayée

**Transit Gateway** :

- Simplifie considérablement la connectivité multi-VPC
- Routage transitif (contrairement au peering VPC)
- Les tables de routage d'isolation permettent la segmentation sans connexions de peering séparées
- Le coût s'accumule pour de nombreuses pièces jointes

**VPC Endpoints** :

- Bénéfice de sécurité et de coût pour S3/DynamoDB (endpoints gateway gratuits)
- Élimine les coûts NAT Gateway pour le trafic des services AWS
- Les politiques d'endpoint ajoutent une couche de contrôle d'accès supplémentaire au-delà d'IAM et des politiques de bucket
- Les endpoints Interface pour les autres services (Secrets Manager, SSM, SES) gardent le trafic privé mais coûtent ~0,01 $/heure par AZ

**Global Accelerator** :

- Améliore la latence des applications dynamiques pour les utilisateurs mondiaux : amélioration de 33 à 47 % en pratique pour les utilisateurs distants
- IP Anycast fixes (contrairement aux IP dynamiques de CloudFront) — utiles pour la mise sur liste d'autorisation de pare-feu
- Protocoles non-HTTP (UDP, TCP) — CloudFront est HTTP/HTTPS uniquement
- Coût supplémentaire (0,025 $/heure par accélérateur + transfert de données)

## Résumé

Le travail Aurora du chapitre 24 a optimisé la façon dont Nimbus sert les données à sa propre application. Ce chapitre porte sur la façon dont les données se déplacent entre le monde extérieur et AWS — et comment rendre ce déplacement plus fiable, plus rapide, et moins coûteux.

- **Site-to-Site VPN** : Tunnel chiffré sur internet public entre le réseau sur site et le VPC. Configuration rapide, coût plus faible, latence variable. Deux tunnels pour la redondance. Maximum 1,25 Gbps par tunnel.
- **Direct Connect** : Connexion fibre dédiée privée vers AWS. Latence prévisible, bande passante plus élevée, des semaines pour configurer, coût significatif. Seuil de rentabilité avec les économies de sortie du VPN à environ 13,5 To/mois pour le scénario de tarification de Nimbus.
- **AWS Snow Family** : Appareils de stockage physiques pour la migration de données en masse. Plus rapide que le transfert internet pour les migrations multi-To. 380 $ au total pour la migration de 4 To de Nimbus vs environ 17 heures de saturation réseau.
- **Transit Gateway** : Hub pour la connectivité VPC et sur site. Permet le routage transitif (contrairement au peering VPC). Prend en charge les tables de routage d'isolation pour contrôler quels VPC peuvent atteindre lesquels. S'adapte à des centaines de connexions.
- **VPC Endpoints** : Accès privé aux services AWS sans NAT Gateway. Les endpoints Gateway (S3, DynamoDB) sont gratuits — ajoutez-les à chaque VPC qui accède à S3 ou DynamoDB. Ont fait économiser 15,60 $/mois à Nimbus et retiré le trafic S3/DynamoDB de la NAT Gateway.
- **Global Accelerator** : Route le trafic dynamique sur le backbone privé AWS pour une latence plus faible et plus cohérente à l'échelle mondiale. IP Anycast statiques. Améliorations de latence de 33 à 47 % pour les utilisateurs distants (Tokyo : 180 ms → 95 ms ; Sydney : 210 ms → 118 ms). Pas un CDN — ne met pas en cache.
- **AWS DataSync** : Service basé sur un agent pour migrer et répliquer des données de fichiers NFS/SMB sur site vers S3, EFS, ou FSx. Gère la planification, la vérification des sommes de contrôle, la surveillance. Utilisé pour les migrations ponctuelles et la réplication continue de partages de fichiers.
- **AWS Transfer Family** : Serveur SFTP, FTPS et FTP géré soutenu par S3 ou EFS. Permet aux clients SFTP existants de téléverser des fichiers vers S3 sans changer leur workflow.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures haute performance (Domaine 3, Tâche 3.4)*

- **Signaux VPN vs Direct Connect** : VPN = « chiffrer le trafic vers le VPC », « configuration rapide », « sensible aux coûts ». Direct Connect = « faible latence cohérente », « grands transferts de données », « connexion privée », « conformité nécessitant un réseau privé ».
- **Transit Gateway vs peering VPC** : Le peering est non transitif (A→B→C ne permet pas A→C). Transit Gateway est transitif. « De nombreux VPC ayant besoin de communiquer » → Transit Gateway.
- **VPC Gateway Endpoints** : Gratuits. S3 et DynamoDB uniquement. Changement de table de routage. Pas de coût supplémentaire. Scénario d'examen : « réduire les coûts de transfert de données pour l'accès S3 depuis un sous-réseau privé » → Gateway Endpoint.
- **Global Accelerator vs CloudFront** : Accelerator = contenu dynamique, non-HTTP, IP statique, optimisation réseau. CloudFront = mise en cache, contenu HTTP, CDN.
- **Direct Connect + VPN** : Vous pouvez utiliser un VPN comme sauvegarde pour une connexion Direct Connect. Si le circuit Direct Connect tombe, le trafic bascule vers le VPN. Plus cher que VPN seul, plus fiable que Direct Connect seul.
- **Direct Connect Gateway** : Connecte un circuit Direct Connect à plusieurs VPC dans plusieurs régions ou comptes. Sans lui, un circuit Direct Connect se connecte à un VGW dans une région.
- **AWS Snow Family** : « Grande migration de données », « la vitesse de transfert est trop lente », « migration à l'échelle du pétaoctet » → Snow Family. Snowball Edge = jusqu'à 80 To. Faites d'abord le calcul du transfert : si déplacer les données sur le réseau disponible prendrait environ une semaine ou plus, la réponse est un appareil physique. *Vérification de la réalité (2026)* : AWS a retiré progressivement la famille — Snowmobile a été retiré en 2024, Snowcone a été abandonné fin 2024, et depuis novembre 2025 les appareils Snow ne sont plus offerts aux nouveaux clients (AWS pointe maintenant vers DataSync sur des liens rapides et vers les **Data Transfer Terminals**, des emplacements sécurisés où vous apportez vos propres disques). La banque de questions SAA-C03 est antérieure à tout cela, donc à l'examen, « semaines de transfert réseau, bande passante limitée » pointe toujours vers Snowball.
- **Tables de routage Transit Gateway** : Transit Gateway prend en charge plusieurs tables de routage pour la segmentation réseau. Signal d'examen : « isoler le VPC de production du staging » avec connectivité partagée via Transit Gateway → tables de routage séparées.
- **IP fixes Global Accelerator** : Contrairement à CloudFront, Global Accelerator fournit deux IP Anycast statiques. Signal d'examen : « l'application a besoin d'une adresse IP fixe à mettre sur liste d'autorisation par les clients » ou « trafic UDP » → Global Accelerator (CloudFront est HTTP/HTTPS uniquement).
- **Signaux AWS DataSync** : « migrer des partages de fichiers NFS/SMB vers S3/EFS/FSx », « réplication continue de données de fichiers sur site », « migration de fichiers basée sur un agent ». DataSync n'est pas pour le transfert SFTP compatible avec le protocole — c'est pour la migration et la réplication en masse de partages de fichiers.
- **Signaux AWS Transfer Family** : « workflow SFTP existant », « les partenaires ou clients téléversent des fichiers via SFTP », « porter un serveur SFTP vers le cloud sans changer les outils clients », « SFTP/FTPS/FTP soutenu par S3 ». Transfer Family n'est pas un outil de migration de données — c'est un point de terminaison de protocole géré. La distinction : DataSync déplace des données en masse selon un calendrier ; Transfer Family fournit un point de terminaison SFTP/FTP toujours allumé pour les téléversements de fichiers continus.
- **MGN (Application Migration Service)** : « migrer rapidement des centaines de VM, sans changement de code », « rehost / lift-and-shift de serveurs vers EC2 » → MGN (réplication au niveau bloc, lancements de test, basculement vers des instances EC2 natives). DataSync déplace des *fichiers* ; DMS déplace des *bases de données* ; MGN déplace des *serveurs entiers*.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre AWS Site-to-Site VPN et AWS Direct Connect. Dans quel scénario choisiriez-vous chacun ?

*(Indice : Réfléchissez au temps de configuration, au coût, à la cohérence de la latence et aux exigences de bande passante.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une société de services financiers nécessite une connexion réseau privée, chiffrée et dédiée de son centre de données sur site vers AWS. Elle transfère 500 Go de données financières sensibles quotidiennement. La connexion doit avoir une latence cohérente et prévisible et ne doit pas traverser l'internet public. Elle a également besoin d'une connexion de secours en cas de défaillance de la primaire.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Une connexion Site-to-Site VPN avec routage BGP et un second VPN pour la redondance  
B) Une connexion hébergée Direct Connect avec Direct Connect Gateway  
C) Deux connexions Site-to-Site VPN via différents fournisseurs internet  
D) Une connexion Direct Connect avec un Site-to-Site VPN comme sauvegarde

**Indice 1** : « Ne doit pas traverser l'internet public » — le trafic VPN passe par l'internet public (chiffré). Seul Direct Connect est privé.

**Indice 2** : « Latence cohérente et prévisible » — les performances VPN sur internet public varient. Direct Connect est cohérent.

**Indice 3** : « Connexion de secours » — quelle est l'approche recommandée quand Direct Connect est la primaire ?

**Réponse** : D

**Explication** : Direct Connect fournit une connexion dédiée privée qui ne traverse pas l'internet public — répondant aux exigences de confidentialité et de latence. Un Site-to-Site VPN comme sauvegarde fournit la redondance : si le circuit Direct Connect tombe, le trafic bascule vers le VPN chiffré. C'est le modèle HA standard pour Direct Connect.

**Pourquoi pas A ?** Le trafic Site-to-Site VPN traverse l'internet public, ce qui viole l'exigence « ne doit pas traverser l'internet public ».

**Pourquoi pas B ?** Une connexion hébergée fournit une connexion Direct Connect mais l'option B n'inclut pas de sauvegarde. Direct Connect seul sans sauvegarde est un point de défaillance unique — la fibre physique peut être coupée.

**Pourquoi pas C ?** Deux connexions VPN via différents FAI traversent quand même l'internet public, même si elles sont chiffrées. Ne répond pas à l'exigence de réseau privé.

*Domaine SAA-C03 : Concevoir des architectures haute performance — Tâche 3.4*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus s'étend pour avoir des équipes d'ingénierie régionales à Seattle, Berlin et Singapour. Chaque équipe régionale doit accéder à :

- Le VPC de production (lecture seule pour le débogage)
- Le VPC de staging (accès complet pour les tests)
- Le VPC d'analytique (lecture seule pour les rapports)

Concevez la connectivité réseau. Utiliseriez-vous Transit Gateway ? Direct Connect dans chaque région ou Site-to-Site VPN ? Comment appliqueriez-vous l'accès lecture seule pour la production ? (Indice : c'est à la fois une question de réseau et d'IAM.)

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception réseau multi-régions et multi-équipes.)*

**Extension** : L'équipe de Berlin signale que sa latence VPN vers le VPC de production (us-west-2) est en moyenne de 160 ms. À quel volume de données l'Accelerated Site-to-Site VPN ou une connexion hébergée Direct Connect deviendrait-il la meilleure option ? Recherchez la tarification actuelle des connexions hébergées Direct Connect d'un Partenaire AWS européen. L'amélioration de latence à elle seule justifierait-elle le coût à votre volume de données estimé ?

## Scène post-générique

La migration des données s'est terminée en 8 jours calendaires — 3 jours pour que le Snowball Edge arrive, 94 minutes pour copier les données, 4 jours pour qu'AWS reçoive l'appareil et ingère les données, puis une synchronisation finale du delta accumulé pendant que le Snowball était en transit. Temps de travail manuel pour tout cela : moins de quatre heures.

Cette dernière étape comptait. Le Snowball Edge avait copié un instantané à un point dans le temps du jeu de données de 4 To. Pendant qu'il était en transit, la base de données de production avait continué à tourner — de nouvelles commandes étaient passées, de nouveaux dossiers étaient créés. La synchronisation du delta via VPN était de 12 Go, complétée en 18 minutes.

« Le transfert en masse était le Snowball », dit Leo. « La synchronisation n'était que les données nettes nouvelles des 8 jours qu'il a fallu. »

« Je l'ai déjà déployé — oh », dit Leo, en regardant la copie se terminer sur le Snowball Edge après 94 minutes. « J'aurais dû régler la limitation de bande passante sur la copie locale pour éviter de saturer le réseau du bureau pendant les heures de bureau. »

Il n'avait pas réglé la limitation. L'internet du bureau allait bien — le Snowball était une opération de réseau local. Mais le commutateur réseau devint brièvement un goulot d'étranglement quand la copie approcha les 9 Gbps de débit local.

« L'idée », dit-il, après avoir corrigé le réglage de limitation, « est que le courrier physique est plus rapide qu'internet au-dessus d'un certain volume de données. »

« C'est soit évident, soit contre-intuitif », dit Maya, « selon la façon dont on y pense. »

« La prochaine fois », dit Leo, « on devrait configurer un Direct Connect. »

Tom ne tendit pas la main vers la calculatrice — il avait déjà fait le calcul plus tôt, quand Direct Connect était apparu pour la première fois : environ mille dollars par mois, port plus circuit.

« Pour ce qu'on fait actuellement, probablement pas rentable. Mais si on commence à déplacer plus de 10 To par mois entre notre bureau et AWS, les économies de transfert de données sur Direct Connect compenseraient le coût. »

« Donc on surveille le volume de transfert de données », dit Priya, « et on réévalue quand il franchit le seuil. »

« C'est une architecture consciente des coûts », dit Tom.

« Ça a toujours été le but », dit Maya.

Priya avait observé la migration depuis l'autre côté de la pièce. « La prochaine fois qu'on fait quelque chose comme ça », dit-elle, « peut-on le faire avant que les données soient en production et que l'activité en dépende ? Migrer des données en direct est toujours plus risqué que migrer des données au repos. »

« Ce n'est jamais au repos quand l'activité tourne », dit Leo.

« Je sais », dit-elle. « C'est tout l'intérêt. Planifiez la migration avant d'en avoir besoin. Pas après. »

Tom avait déjà calculé ce que cela coûterait d'avoir un second ensemble d'infrastructure dans us-east-1 prêt à recevoir une migration à tout moment. Il garda le chiffre pour lui pour l'instant. Il y avait des chapitres plus immédiats à clore.

Dans le prochain chapitre : ce qui se passe quand vous avez plus de données qu'aucune base de données ne peut raisonnablement stocker, et que vous devez en tirer du sens.
