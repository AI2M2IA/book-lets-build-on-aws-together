# Chapitre 11 : Votre coin privé du cloud

Priya avait un morceau de papier avec un dessin dessus.

Ce n'était pas un dessin compliqué. Un rectangle, étiqueté « AWS ». À l'intérieur du rectangle, un ensemble de boîtes : des instances EC2, une base de données RDS, un cluster ElastiCache. Des lignes connectant tout à tout. Et à l'extérieur du rectangle, une seule étiquette : « Internet ».

Elle l'a posé au centre de la table.

« Voilà ce qu'on a », dit-elle. « Notre base de données a une adresse IP publique. Notre couche de cache peut être atteinte depuis internet. Nos instances EC2 sont toutes sur le même réseau plat. »

« Ça semble bien », dit Leo. « On a des groupes de sécurité. »

« Des groupes de sécurité que vous avez configurés », dit Priya. « La nuit. Lors de la configuration initiale. »

Leo ne dit rien.

« Je ne critique pas la configuration », dit-elle. « Je dis que quand tout vit sur un réseau public plat, une seule mauvaise configuration est la différence entre un système fonctionnel et un accessible à tout le monde sur internet. »

Elle a pris un marqueur rouge et a dessiné un cercle autour de la base de données.

« Ça ne devrait pas être accessible depuis internet. Du tout. Pas via une règle de groupe de sécurité, pas via une configuration durcie. Ça devrait être structurellement inaccessible. »

« On a besoin de parler d'architecture réseau », dit Maya.

« On en avait besoin il y a trois mois », dit Priya. « Mais maintenant c'est bien. »

L'équipe s'est rassemblée autour d'un tableau blanc pour la première fois depuis des semaines.

**Le problème avec le parking public ouvert**

Imaginez un immense parking public. Dix mille voitures. N'importe quelle voiture peut se garer n'importe où. Il n'y a pas de barrières entre les zones, pas de barrières, pas de sections réservées.

C'est un réseau ouvert. Chaque service peut atteindre chaque autre service. Votre serveur web peut parler à votre base de données. Votre base de données peut atteindre internet. Votre couche de cache peut recevoir des connexions de n'importe où.

Quand tout peut parler à tout, une compromission affecte tout.

« Donc si quelqu'un entre par effraction dans le parking », dit Tom, « il peut entrer dans n'importe quelle voiture. »

« Et depuis n'importe quelle voiture, conduire n'importe où », confirma Priya. « On veut des clôtures. On veut des portails fermés à clé. On veut des zones. »

Le VPC est la façon dont vous construisez ces zones dans AWS.

**Qu'est-ce qu'un VPC ?**

Un **Virtual Private Cloud (VPC)** est une section logiquement isolée du cloud AWS — un réseau privé que vous définissez, auquel seules vos ressources peuvent accéder par défaut.

Pensez-y comme un terrain privé clôturé à l'intérieur du grand parking public. Votre terrain a ses propres règles : qui peut entrer, qui peut sortir, quelles routes existent entre les sections.

Quand vous créez un VPC, vous définissez :

**Un bloc CIDR** : La plage d'adresses IP disponibles à l'intérieur de votre réseau. Par exemple, `10.0.0.0/16` vous donne 65 536 adresses IP possibles (10.0.0.0 à 10.0.255.255).

**Des sous-réseaux** : Des subdivisions de votre VPC, chacune assignée à une partie de votre plage d'adresses IP et associée à une Zone de disponibilité spécifique.

**Des tables de routage** : Des règles qui déterminent où va le trafic réseau.

**Une passerelle Internet** : La connexion entre votre VPC et l'internet public.

**Sous-réseaux : Publics vs Privés**

Toutes les ressources ne devraient pas être accessibles publiquement.

Votre serveur web doit accepter le trafic d'internet — les navigateurs des utilisateurs doivent pouvoir l'atteindre.

Votre base de données ne devrait *jamais* accepter de trafic d'internet — seul votre serveur web devrait pouvoir lui parler.

C'est là qu'interviennent les sous-réseaux.

Un **sous-réseau public** est connecté à une passerelle Internet et peut avoir des ressources avec des adresses IP publiques. Le trafic peut circuler vers et depuis internet.

Un **sous-réseau privé** n'a pas de connexion internet directe. Les ressources dans un sous-réseau privé ne peuvent communiquer qu'avec d'autres ressources dans votre VPC (à moins que vous ne configuriez des routes sortantes spécifiques). Elles n'ont pas d'adresses IP publiques.

Pour Nimbus, le design est devenu clair :

```
Internet
    |
Passerelle Internet
    |
Sous-réseau public (AZ-a)     Sous-réseau public (AZ-b)
  [Équilibreur de charge]       [Équilibreur de charge]
    |                                |
Sous-réseau privé (AZ-a)    Sous-réseau privé (AZ-b)
  [Instances EC2]              [Instances EC2]
    |                                |
Sous-réseau privé (AZ-a)    Sous-réseau privé (AZ-b)
  [RDS Principal]               [RDS Secondaire]
  [ElastiCache]                 [ElastiCache]
```

L'équilibreur de charge est orienté vers le public — il doit recevoir du trafic d'internet. Les instances EC2 sont privées — elles ne reçoivent que le trafic de l'équilibreur de charge. Les bases de données sont privées — elles ne reçoivent que le trafic des instances EC2.

« Donc pour atteindre la base de données », dit Tom, « quelqu'un devrait passer par l'équilibreur de charge, puis par l'instance EC2, puis par le groupe de sécurité de la base de données ? »

« Trois couches », confirma Priya. « Défense en profondeur. »

**La passerelle NAT : Des sous-réseaux privés qui peuvent quand même télécharger des choses**

Les sous-réseaux privés ne peuvent pas atteindre internet. Mais parfois, ils doivent. Votre instance EC2 a besoin de télécharger une mise à jour logicielle. Votre application a besoin d'appeler une API externe.

C'est là qu'intervient la **passerelle NAT** (Network Address Translation).

Une passerelle NAT se trouve dans un sous-réseau public. Les ressources dans les sous-réseaux privés peuvent envoyer du trafic sortant vers la passerelle NAT, qui le relaie à internet — mais internet ne peut pas initier de connexions en retour.

C'est comme une porte tournante à sens unique. Vous pouvez sortir. Personne à l'extérieur ne peut entrer.

« Combien coûte une passerelle NAT ? » demanda Tom.

La question n'a surpris personne.

La tarification de la passerelle NAT a deux composantes : des frais horaires pour chaque passerelle NAT, plus des frais de traitement de données par Go. Ça peut s'accumuler de façon inattendue (le Chapitre 30 couvre ça en détail). Pour l'instant : n'utilisez pas plus de passerelles NAT que vous n'en avez besoin, et sachez que de grandes quantités de données sortantes apparaîtront sur votre facture.

**Tables de routage : Comment le trafic trouve son chemin**

Chaque sous-réseau a une **table de routage** qui indique au trafic où aller.

Une table de routage typique pour un sous-réseau public ressemble à ça :

| Destination | Cible                          |
|-------------|--------------------------------|
| 10.0.0.0/16 | local                          |
| 0.0.0.0/0   | igw-xxxx (Passerelle Internet) |

La première règle : le trafic vers n'importe quelle IP dans votre plage VPC reste local. La deuxième règle : tout autre trafic (`0.0.0.0/0` signifie « tout ») va à la Passerelle Internet.

Une table de routage pour un sous-réseau privé :

| Destination | Cible                  |
|-------------|------------------------|
| 10.0.0.0/16 | local                  |
| 0.0.0.0/0   | nat-xxxx (NAT Gateway) |

Le trafic du sous-réseau privé reste local ou sort via la passerelle NAT. Pas de route directe vers la Passerelle Internet.

**Groupes de sécurité vs NACLs (Aperçu)**

À l'intérieur du VPC, vous avez deux outils pour contrôler le trafic au niveau des ressources :

Les **Groupes de sécurité** (le Chapitre 15 couvre ça en profondeur) agissent comme des pare-feux virtuels pour des ressources individuelles — une instance EC2, une instance RDS, un équilibreur de charge. Ils sont *avec état* : si le trafic est autorisé entrant, le trafic de réponse est automatiquement autorisé sortant.

Les **NACLs réseau (NACLs)** fonctionnent au niveau du sous-réseau et sont *sans état* : vous devez explicitement autoriser le trafic entrant et sortant séparément.

Pour la plupart des cas d'utilisation, les groupes de sécurité sont suffisants. Les NACLs ajoutent une couche supplémentaire quand vous avez besoin de contrôles au niveau du sous-réseau — par exemple, bloquer une plage d'IP spécifique de jamais atteindre un sous-réseau.

« Groupes de sécurité au niveau des instances », écrivit Leo sur le tableau blanc. « NACLs au niveau des sous-réseaux. »

« Et ne laissez jamais le port 22 ouvert à 0.0.0.0/0 », ajouta Priya en regardant Leo.

« C'était une seule fois », dit Leo.

« C'est toujours exactement une seule fois », dit Priya, « jusqu'à ce que ça ne le soit pas. »

**Appairage VPC : Connecter des réseaux privés**

Que se passe-t-il si Nimbus se développe en plusieurs VPC ? (Ça arrive. Les équipes grandissent. Les services s'isolent dans des comptes séparés.)

L'**appairage VPC** laisse deux VPC communiquer en privé comme s'ils étaient sur le même réseau. Le trafic ne quitte pas le réseau privé d'AWS.

Limites importantes :

- L'appairage VPC n'est pas transitif. Si le VPC A est appairé avec le VPC B, et le VPC B est appairé avec le VPC C, A et C ne peuvent pas communiquer — à moins d'ajouter un appairage direct A-C.
- Les blocs CIDR ne peuvent pas se chevaucher entre les VPC appairés.

Pour les architectures plus grandes avec de nombreux VPC, **AWS Transit Gateway** (Chapitre 25) gère le routage transitif sans nécessiter un maillage complet de connexions d'appairage.

## Forces et limites

**Pourquoi le design VPC importe** :

- L'isolation réseau est une défense en profondeur — brèche d'une couche ne signifie pas compromission de tout
- Les sous-réseaux privés réduisent significativement la surface d'attaque
- Les tables de routage et les groupes de sécurité donnent un contrôle précis sur les flux de trafic
- Les VPC s'intègrent avec tous les services réseau AWS (Direct Connect, VPN, Transit Gateway)

**Là où ça se complique** :

- La conception VPC nécessite une planification préalable — les blocs CIDR sont difficiles à changer plus tard
- Trop de petits VPC créent une complexité d'appairage (problème n-carré)
- Le débogage des problèmes réseau dans les VPC nécessite de comprendre simultanément les tables de routage, les groupes de sécurité, les NACLs et les associations de sous-réseaux
- Les coûts de la passerelle NAT peuvent vous surprendre à grande échelle (frais de traitement par Go)

## Résumé

- Un **VPC** est un réseau privé logiquement isolé dans AWS — votre terrain clôturé à l'intérieur du cloud public.
- Les **sous-réseaux** divisent votre VPC par Zone de disponibilité. Les sous-réseaux publics se connectent à la Passerelle Internet ; les privés non.
- Mettez les ressources orientées internet (équilibreurs de charge) dans des sous-réseaux publics. Mettez tout le reste (EC2, bases de données, caches) dans des sous-réseaux privés.
- Les **tables de routage** contrôlent où va le trafic. Chaque sous-réseau en a une.
- La **passerelle NAT** (dans un sous-réseau public) laisse les ressources privées initier des connexions internet sortantes sans accepter de connexions entrantes.
- L'**appairage VPC** connecte deux VPC en privé. Pas transitif — pour une connectivité à grande échelle, utilisez Transit Gateway.
- Les **groupes de sécurité** protègent les ressources individuelles (avec état). Les **NACLs** protègent des sous-réseaux entiers (sans état).

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.2)*

- **Sous-réseau public vs privé** : la différence est la table de routage. Le sous-réseau public a une route vers une Passerelle Internet. Le sous-réseau privé non.
- **Placement de la passerelle NAT** : toujours dans le sous-réseau *public*. Les ressources du sous-réseau privé routent le trafic sortant vers elle.
- **Haute disponibilité pour NAT** : créez une passerelle NAT par AZ. Si vous avez une seule passerelle NAT dans AZ-a et que les instances AZ-b y routent, la panne AZ-a coupe aussi l'accès internet d'AZ-b.
- **L'appairage VPC n'est pas transitif** : l'examen décrira trois VPC et demander s'ils peuvent communiquer via le VPC du milieu — la réponse est non sans appairage direct ou Transit Gateway.
- **Chevauchement CIDR** : les VPC appairés ne peuvent pas avoir des blocs CIDR qui se chevauchent. Piège d'examen classique.
- **Hôte bastion (jump box)** : pour faire un SSH dans une instance EC2 privée, vous avez besoin d'un hôte bastion dans le sous-réseau public. Le bastion est la seule machine avec une IP publique ; les instances privées n'acceptent le SSH que depuis le groupe de sécurité du bastion.
- **Endpoints VPC** : permettent aux ressources privées d'atteindre les services AWS (S3, DynamoDB) sans passer par la passerelle NAT. Deux types : **endpoints Gateway** (S3, DynamoDB — gratuits) et **endpoints Interface** (autres services — tarifiés à l'heure plus les données).

## Exercices

**Exercice 1 — Mémorisation**

Expliquez pourquoi une base de données devrait être dans un sous-réseau privé. Quelle menace spécifique cela atténue-t-il ?

*(Indice : Que peut faire quelqu'un avec une base de données sur internet public qu'il ne peut pas faire avec une seulement accessible depuis le VPC ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise conçoit une application web à trois niveaux sur AWS. Le niveau web (ALB + EC2) doit accepter le trafic internet. Le niveau application (EC2) doit recevoir uniquement le trafic du niveau web. Le niveau base de données (RDS) doit recevoir uniquement le trafic du niveau application. Les instances EC2 du niveau application doivent télécharger des paquets logiciels depuis internet. La solution doit être hautement disponible.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Tous les niveaux dans des sous-réseaux publics ; les groupes de sécurité limitent le trafic entre les niveaux  
B) Niveau web dans des sous-réseaux publics ; niveaux application et base de données dans des sous-réseaux privés ; une passerelle NAT dans un sous-réseau public  
C) Niveau web dans des sous-réseaux publics ; niveaux application et base de données dans des sous-réseaux privés ; une passerelle NAT par AZ  
D) Tous les niveaux dans des sous-réseaux privés ; une Passerelle Internet fournit un accès internet bidirectionnel à tous les niveaux

**Indice 1** : « Hautement disponible » signifie pas de point de défaillance unique. Quelle option introduit une passerelle NAT comme point de défaillance unique ?

**Indice 2** : Si la passerelle NAT de l'AZ tombe en panne, quelles instances perdent l'accès internet ?

**Indice 3** : Lisez attentivement l'exigence — le niveau application a besoin d'un accès internet *sortant*, pas entrant.

**Réponse** : C

**Explication** : Le niveau web dans des sous-réseaux publics fournit un accès orienté internet via l'ALB. Les niveaux application et base de données dans des sous-réseaux privés garantissent qu'ils ne sont pas directement accessibles depuis internet. Une passerelle NAT par AZ (une dans chaque sous-réseau public) fournit un accès internet sortant hautement disponible pour les instances de sous-réseaux privés — si une AZ tombe en panne, la passerelle NAT de l'autre AZ continue à servir le trafic.

**Pourquoi pas A ?** Les sous-réseaux publics pour tous les niveaux exposent l'application et la base de données directement à internet, annulant l'objectif du modèle de sécurité par niveaux.

**Pourquoi pas B ?** Une passerelle NAT dans une seule AZ est un point de défaillance unique. Si la passerelle NAT de cette AZ tombe en panne, toutes les instances privées perdent l'accès internet sortant.

**Pourquoi pas D ?** Une Passerelle Internet fournit une connectivité bidirectionnelle — les sous-réseaux privés avec une route vers la Passerelle Internet sont effectivement des sous-réseaux publics.

*Domaine SAA-C03 : Concevoir des architectures sécurisées — Tâche 1.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus grandit. L'équipe d'ingénierie veut séparer le « service menu » dans son propre compte avec son propre VPC, tout en gardant l'application Nimbus principale dans un compte et VPC séparés.

Comment connecteriez-vous ces deux VPC pour que l'application principale puisse interroger le service menu ? Quelles contraintes devriez-vous planifier ? Que utiliseriez-vous à la place si Nimbus avait dix VPC de microservices séparés qui doivent tous communiquer ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à la conception réseau multi-VPC.)*

## Scène post-générique

Priya a redessiné le réseau.

Trois jours plus tard, chaque ressource était au bon endroit. Instances EC2 dans des sous-réseaux privés. Équilibreurs de charge dans des sous-réseaux publics. RDS et ElastiCache accessibles uniquement depuis la couche application. Groupes de sécurité avec les ports minimums requis.

Leo avait essayé de se connecter directement à la base de données via SSH pour vérifier quelque chose. Il ne pouvait pas. La connexion a expiré.

« Bien », dit Priya.

« J'avais juste besoin de vérifier une chose », dit Leo.

« Quoi ? »

« Si l'index était correctement configuré. »

Priya ouvrit son ordinateur. « Je peux vérifier depuis l'hôte bastion, via l'instance d'application, qui a les bons credentials de base de données dans Secrets Manager. »

« Ça fait quatre sauts. »

« C'est correct. » Elle tapa quelque chose. « L'index est configuré. De rien. »

Leo regarda l'écran un moment.

« Je vais apprendre ça », dit-il.

« Tu es déjà en train d'apprendre », dit-elle. « Tu as juste protesté contre les contrôles de sécurité au lieu de se plaindre qu'ils n'existaient pas. »

Dans le prochain chapitre : comment internet trouve Nimbus — la machinerie invisible des noms de domaine.
