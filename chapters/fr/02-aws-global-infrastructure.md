# Chapitre 2 : Où dans le monde est votre serveur ?

Levez-vous. Allez à une fenêtre s'il y en a une à portée.

Regardez dehors. Quoi que vous voyiez — des bâtiments, des arbres, un parking, la cour de quelqu'un — ce n'est pas là que vivent vos données. Vos données vivent quelque part d'autre entièrement. Probablement quelque part où vous n'êtes jamais allé.

Ce n'est pas un problème. Mais comprendre *où* fait que de nombreuses choses s'assemblent de façon surprenante.

Après la séance au tableau blanc, la décision était prise : Nimbus utiliserait AWS. Le cloud était la réponse. Mais « le cloud » s'est avéré être une chose précise dans un emplacement précis — et Leo avait choisi cet emplacement sans le vouloir.

Le lendemain matin, Maya a remarqué que le serveur était à Singapour.

« Pourquoi Singapour ? » demanda-t-elle.

« C'était le choix par défaut », dit Leo.

Tom leva les yeux de son café. « Combien ça coûte de faire tourner un serveur à Singapour quand
tous nos clients sont sur la côte Ouest ? »

Leo n'avait pas de réponse.

Priya avait déjà une autre préoccupation. « Et qui sait à travers quelles juridictions ces données transitent ? »

Ce chapitre parle de corriger cette décision — et de comprendre pourquoi ça importe.

**Le problème avec « quelque part »**

Quand vous utilisez AWS, vous n'utilisez pas un seul centre de données. Vous utilisez un réseau mondial de centres de données. AWS a des infrastructures dans des dizaines de pays.

C'est une fonctionnalité, pas juste un fait. Mais ça signifie que vous devez faire un choix : *où* voulez-vous que votre infrastructure fonctionne ?

Le choix importe pour trois raisons :

**Performance.** Plus vos serveurs sont proches de vos utilisateurs, plus la réponse est rapide.
La physique est non négociable. Les données voyagent à environ deux tiers de la vitesse de la lumière
à travers les câbles à fibre optique. Un aller-retour de Seattle à Singapour prend environ 170
millisecondes rien qu'en transit — avant que votre application fasse quoi que ce soit. Cette même
requête de Seattle à l'Oregon (`us-west-2`) prend environ 20 millisecondes. La
différence n'est pas une erreur d'arrondi. Pour une application de commande de restaurant où les clients
s'attendent à ce que les pages semblent instantanées — et où une seule page déclenche plusieurs allers-retours —
170 ms de latence de base par aller-retour, c'est la différence entre un produit rapide
et un produit poussif.

Tom sortit son téléphone, ouvrit l'application Nimbus, et chargea une page de restaurant. Il la chronométra avec une application chronomètre.

« Presque trois secondes », dit-il.

Leo vérifia la décomposition de la latence dans les journaux du serveur. Rien que l'aller-retour vers Singapour — sans rapport avec les requêtes de base de données — ajoutait environ 170 millisecondes par requête, et l'application faisait plusieurs allers-retours par page.

« Et si on déplace le serveur en Oregon ? » demanda Tom.

« Vingt millisecondes », dit Leo. « Peut-être moins. »

« Combien ça coûte par mois ? »

La différence de prix était de quelques pour cent. Pas nulle, mais pas la variable principale. Ils déplacèrent le serveur vers `us-west-2` cet après-midi-là.

« J'ai déjà déployé l'agent de surveillance sur l'instance de Singapour », dit Leo, à moitié pour lui-même. « Oh. » Il marqua une pause. « Je vais le configurer en Oregon à la place. »

**Conformité.** Certains secteurs ont des lois sur l'endroit où les données peuvent être stockées. Les données de santé
américaines peuvent devoir rester dans le pays. Les données financières peuvent devoir rester dans une région
spécifique. Choisir la mauvaise Région peut créer des problèmes juridiques.

Priya avait fait des recherches là-dessus avant que quiconque ne le lui demande.

« Le RGPD », dit-elle en levant les yeux de ses notes au standup du lendemain matin. « Si Nimbus sert un jour des clients dans l'Union européenne — ne serait-ce qu'un seul client — les données personnelles les concernant peuvent devoir rester dans l'UE ou dans un pays avec des protections équivalentes. Ce n'est pas optionnel. C'est la loi. »

« On est une application de commande de restaurant », dit Leo. « En Californie. »

« Pour l'instant », dit Priya. « A-t-on réfléchi à ce qui se passe si on s'étend en Europe dans dix-huit mois et qu'on réalise qu'on a stocké les données de clients européens en Oregon pendant un an et demi ? »

Un silence.

« On corrigerait à ce moment-là », dit Leo.

« On ne peut pas corriger rétroactivement des violations de résidence des données », dit Priya. « La violation a déjà eu lieu. »

Elle ne dramatisait pas. Les amendes RGPD vont jusqu'à 4 % du chiffre d'affaires annuel mondial. Les violations HIPAA dans la santé américaine peuvent atteindre plus de 2 millions de dollars par catégorie de violation et par an. Ce ne sont pas des hypothèses — c'est la raison pour laquelle les grandes décisions cloud d'entreprise commencent par une cartographie de la conformité, pas par la configuration de l'infrastructure.

Pour Nimbus, l'exposition réglementaire immédiate était faible : clients américains, pas de données de santé, pas de services financiers. Mais choisir une Région pour une entreprise qui compte grandir, c'est choisir en gardant la croissance à l'esprit.

**Résilience aux catastrophes.** Si un emplacement a une panne d'électricité, un tremblement de terre ou une panne
réseau, vous voulez que votre système survive. Répartir l'infrastructure sur plusieurs
emplacements est la façon dont vous vous protégez contre les catastrophes locales.

**Comment AWS organise son infrastructure**

AWS divise son infrastructure mondiale en trois concepts imbriqués. Pensez-y comme des poupées russes, de la plus grande à la plus petite : une grosse poupée qui s'ouvre pour révéler une poupée moyenne, qui s'ouvre pour en révéler une petite. Chaque couche imbriquée dans la suivante.

La poupée la plus externe est ce qu'AWS appelle une **Région**. À l'intérieur d'une Région se trouve un groupe de **Zones de disponibilité**. Et disséminés partout à travers le globe, indépendamment des deux, se trouvent les **Emplacements Edge**.

Ouvrons chacun.

**Régions : Les grandes boîtes**

Une **Région** est une zone géographique où AWS dispose d'un ensemble de centres de données. Chaque Région est nommée d'après son emplacement : `us-west-2` est l'Oregon, `us-east-1` est le nord de la Virginie, `eu-west-1` est l'Irlande, `ap-southeast-1` est Singapour — là où le serveur de Leo se cachait.

Il y a près de 40 Régions dans le monde, et AWS en ajoute régulièrement. La liste ne cesse de s'allonger
à mesure qu'AWS s'étend : il y a des Régions en Amérique du Nord, en Amérique du Sud, en Europe, au Moyen-Orient,
en Asie-Pacifique et en Afrique. Chaque nouvelle Région est généralement annoncée des mois avant son ouverture,
inclut au moins trois Zones de disponibilité au lancement, et prend quelques années avant que tous les services AWS
y soient disponibles.

Chaque Région est complètement indépendante. Les données dans `us-west-2` restent dans `us-west-2` à moins que
vous ne les déplaciez explicitement. C'est crucial pour la conformité et pour la résilience — une panne
majeure dans une Région n'affecte pas automatiquement les autres. Un événement qui perturbe le réseau
électrique du nord de la Virginie n'affecte pas l'Oregon. Une catastrophe naturelle en Irlande n'affecte pas
Singapour. Les Régions sont réellement isolées les unes des autres au niveau de l'infrastructure
physique.

L'indépendance est si complète que si une Région subit une panne majeure, même la
console de gestion AWS peut se charger lentement — parce que la console elle-même tourne dans
l'infrastructure AWS. Cela vaut la peine de le savoir : pendant un véritable incident AWS, vous pourriez avoir du mal à
accéder aux outils de surveillance dont vous avez besoin précisément au moment où vous en avez le plus besoin. C'est en partie pourquoi
les équipes expérimentées surveillent leurs propres services indépendamment de la console d'AWS.

« Donc on devrait choisir `us-west-2` pour Nimbus ? » demanda Tom.

Oui. Pour une entreprise américaine ciblant les clients de la côte Ouest, oui. Latence plus faible et vos utilisateurs
obtiennent des réponses plus rapides.

« Combien c'est plus cher que Singapour ? » ajouta Tom.

La tarification varie selon la Région — généralement de quelques pour cent. L'avantage de performance et de conformité
de la bonne Région vaut la petite différence de prix.

**Le débat sur le choix de Région que Nimbus a failli rater**

Avant que l'équipe ne se fixe sur `us-west-2`, il y eut un bref débat sur la question de savoir si `us-east-1` (nord de la Virginie) avait plus de sens. C'est la Région la plus ancienne, la plus grande, celle où AWS lance les nouveaux services en premier. C'est aussi la Région la moins chère sur la plupart des pages de tarification. Tom aimait ça.

« Mais nos utilisateurs sont en Californie, en Oregon et dans l'État de Washington », dit Maya. « Pourquoi ferions-nous tourner nos serveurs de l'autre côté du pays ? »

« Moins cher », dit Tom. « Et plus de services disponibles. »

« Attends — mais *pourquoi* ferions-nous comme ça ? » dit Maya. « Nos utilisateurs sont sur la côte Ouest. Nos serveurs devraient être sur la côte Ouest. La différence de prix, c'est quoi, six pour cent ? Sept ? On dépenserait plus à cause de la latence supplémentaire en clients perdus qu'on n'économiserait en factures de calcul. »

Elle avait raison. La bonne Région pour une charge de travail est la Région la plus proche des utilisateurs qui comptent le plus — à moins que la conformité, la disponibilité des services ou le différentiel de coût ne justifie le compromis. Pour Nimbus, aucun de ces facteurs ne le justifiait.

C'est une décision qui semble petite et ne l'est pas. Les équipes qui choisissent `us-east-1` parce que « c'est le choix par défaut » puis servent des utilisateurs de la côte Ouest depuis la côte Est laissent de la vraie performance sur la table. La console AWS pointe par défaut vers `us-east-1` pour des raisons historiques. Ce n'est pas une recommandation.

**Zones de disponibilité : La vraie redondance**

C'est là que ça devient intéressant.

Chaque Région n'est pas un seul centre de données. C'est un ensemble de plusieurs centres de données physiquement
séparés appelés **Zones de disponibilité** (ou AZ).

L'Oregon (`us-west-2`) a quatre Zones de disponibilité : `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Ce sont de vrais bâtiments, séparés par des distances significatives — assez loin
les uns des autres pour qu'un incendie, une inondation ou une panne d'électricité dans l'un n'affecte pas les autres, mais assez
proches pour que le réseau entre eux soit extrêmement rapide (latence à un chiffre en millisecondes).

À quelle distance se trouve une « distance significative » ? AWS ne publie pas de coordonnées exactes, mais des chercheurs indépendants estiment que les AZ d'une même Région sont généralement séparées par des dizaines de kilomètres — assez loin pour être sur des réseaux électriques différents et des chemins de fibre différents, pas si loin que la vitesse de la lumière devienne un facteur limitant pour la réplication synchrone.

Cette séparation est délibérée et importante. Si deux AZ partageaient la même sous-station électrique, une panne de sous-station ferait tomber les deux AZ simultanément — éliminant la redondance. La séparation physique garantit que les pannes de mode commun (le genre qui affecte une zone géographique entière) sont des événements réellement rares plutôt que des risques prévisibles.

C'est l'architecture qui rend AWS fiable à un niveau qu'aucun centre de données unique ne peut égaler.

Priya se pencha en avant. « Donc si on fait tourner notre application dans deux Zones de disponibilité et
qu'une tombe en panne — »

« L'autre continue à tourner », termina Maya.

« Exactement. »

Leo, qui avait écouté silencieusement : « J'ai tout déployé dans une seule AZ. »

« Oui », dit Priya. « On a remarqué. »

Le concept de répartition de votre application sur plusieurs AZ — appelé **déploiement
Multi-AZ** — est l'un des schémas de résilience les plus importants dans AWS. Nous l'approfondissons
au Chapitre 18. Pour l'instant, comprenez que les AZ existent spécifiquement pour rendre cela possible.

Une nuance qui vaut la peine d'être connue : les noms d'AZ (`us-west-2a`, `us-west-2b`, etc.) ne sont pas cohérents entre les comptes AWS. Ce qui apparaît comme `us-west-2a` dans votre compte peut être un centre de données physique différent de ce qui apparaît comme `us-west-2a` dans le compte d'un collègue. AWS randomise la correspondance pour empêcher tous les clients de déployer dans la même AZ physique quand ils choisissent par défaut « a ». Si vous devez coordonner avec un autre compte l'AZ physique dans laquelle vous vous trouvez (pour une communication inter-comptes à faible latence, par exemple), AWS fournit des identifiants d'AZ — des identifiants stables qui correspondent au même emplacement physique entre les comptes. Les AZ nommées (`2a`, `2b`) sont relatives au compte. Les identifiants d'AZ (`usw2-az1`, `usw2-az2`) sont physiques. L'examen teste occasionnellement cette distinction.

**À quoi ressemble réellement une panne d'AZ**

Ce n'est pas abstrait. Laissez-moi dérouler une vraie chronologie.

Il est 14 h 47 un mardi. Un défaut électrique dans l'un des transformateurs alimentant `us-west-2b` provoque une panne dans ce centre de données. L'événement n'est pas prévu.

Si Nimbus tourne entièrement dans `us-west-2b` :
- 14 h 47 : l'instance EC2 perd son alimentation. Le serveur de base de données perd son alimentation.
- 14 h 47 : les requêtes entrantes vers l'application Nimbus commencent à échouer avec des délais d'attente de connexion.
- 14 h 47 : les alertes de surveillance de Tom se déclenchent.
- 14 h 50 : Leo commence le processus de récupération. Il lance une nouvelle instance EC2 dans `us-west-2a`.
- 15 h 05 : la base de données revient en ligne depuis une restauration d'instantané.
- 15 h 12 : l'application est reconfigurée pour pointer vers le nouvel endpoint de base de données.
- 15 h 20 : Nimbus sert de nouveau du trafic.

Ça fait 33 minutes d'indisponibilité. Pendant le service du vendredi soir, 33 minutes pourraient coûter des milliers en commandes perdues et le genre de dommage de réputation qui n'apparaît pas dans le rapport d'incident.

Si Nimbus tourne sur `us-west-2a` et `us-west-2b` avec un déploiement Multi-AZ correct :
- 14 h 47 : l'instance EC2 dans `us-west-2b` perd son alimentation.
- 14 h 47 : l'Application Load Balancer détecte l'instance défaillante via les contrôles de santé.
- 14 h 47 : l'ALB cesse d'acheminer le trafic vers l'instance défaillante, automatiquement.
- 14 h 47 : le trafic continue de circuler vers l'instance dans `us-west-2a`.
- 14 h 48 : l'Auto Scaling Group lance une instance de remplacement.
- 14 h 55 : l'instance de remplacement passe les contrôles de santé et rejoint la flotte.

Indisponibilité : zéro. Impact client : proche de zéro. La surveillance de Tom se déclenche, mais l'action de Leo est « observer et confirmer que la récupération est terminée », pas « tout reconstruire manuellement ».

C'est la différence entre Multi-AZ et single-AZ. La frontière de l'AZ est là où la conception de redondance d'AWS devient la résilience de votre application.

**Le calcul de fiabilité Multi-AZ**

AWS conçoit chaque AZ pour être indépendante — pas seulement physiquement, mais avec une alimentation, un refroidissement et un réseau séparés. La probabilité que deux AZ dans la même Région tombent en panne simultanément est conçue pour être extrêmement faible.

Si une seule AZ a 99,9 % de disponibilité (environ 8,7 heures d'indisponibilité par an), alors une architecture à deux AZ traitant les pannes comme des événements indépendants a environ 99,9999 % de disponibilité pour le même mode de défaillance — environ 31 secondes d'indisponibilité par an dues aux pannes d'AZ.

En pratique, le facteur limitant pour la plupart des applications n'est pas la disponibilité de l'AZ. C'est le code applicatif, le processus de déploiement, et la base de données. Mais le calcul illustre pourquoi le Multi-AZ est la référence standard : le coût de faire tourner sur deux AZ est modeste ; l'amélioration de la disponibilité est grande.

**Emplacements Edge : La rapidité, partout**

Les AZ résolvent la résilience. Elles ne résolvent pas le problème de servir du contenu rapidement aux utilisateurs dans
des villes éloignées de votre Région principale.

Entrent en jeu les **Emplacements Edge**.

Les Emplacements Edge sont de petits points d'infrastructure légers — plus de 750 points de
présence répartis dans plus de 100 villes à travers le monde. Ce ne sont pas des centres de données complets — ils
ne peuvent pas faire tourner votre application.
Ce qu'ils *peuvent* faire, c'est mettre du contenu en cache près de vos utilisateurs.

Imaginez une image de menu stockée sur un serveur en Virginie. Chaque fois que quelqu'un à Tokyo veut
la voir, la requête traverse le Pacifique et revient. Avec les Emplacements Edge, AWS peut stocker une
copie de ce fichier à Tokyo et le servir localement — des millisecondes au lieu de centaines de
millisecondes.

C'est l'épine dorsale de CloudFront, le réseau de diffusion de contenu d'AWS. Nous approfondissons
CloudFront au Chapitre 13. Pour l'instant : les Emplacements Edge concernent la rapidité pour le contenu statique.

Vous vous demandez peut-être : si les Emplacements Edge mettent du contenu en cache, stockent-ils aussi vos données de façon permanente ? Non. Les Emplacements Edge détiennent des copies temporaires de contenu pour le servir plus vite — l'original vit toujours dans votre Région. Si le cache expire ou que le contenu change, l'Emplacement Edge récupère une copie fraîche depuis la source.

Le réseau des Emplacements Edge est séparé de la structure des Régions et des AZ. Quand vous pensez à l'endroit où votre application *tourne*, vous pensez aux Régions et aux AZ. Quand vous pensez à comment le contenu parvient à vos utilisateurs *rapidement*, vous pensez aux Emplacements Edge et à CloudFront. Ils résolvent des problèmes différents et opèrent à des couches différentes.

AWS a aussi un concept connexe appelé **Regional Edge Caches** — des nœuds de mise en cache plus grands qui se situent entre votre Région et les Emplacements Edge. Si un Emplacement Edge dans une ville n'a pas de copie en cache d'un fichier, il la récupère depuis le Regional Edge Cache plutôt que de retourner jusqu'à votre Région. Cela réduit la charge sur votre origine et améliore les taux de succès du cache pour le contenu moins populaire. Vous ne configurez pas les Regional Edge Caches directement — ils font partie de l'infrastructure CloudFront qui opère automatiquement.

L'enseignement pratique pour Nimbus : quand l'équipe ajoutera CloudFront au Chapitre 13, les images de menu qui voyageaient de l'Oregon jusqu'au navigateur d'un client à chaque requête seront à la place servies depuis l'Emplacement Edge le plus proche — Dallas pour les clients du Texas, Atlanta pour les clients de Géorgie, Chicago pour les clients de l'Illinois. L'utilisateur à Chicago obtient son image de menu d'un serveur situé à 500 kilomètres au lieu de 3 200 kilomètres. La différence est mesurable et significative.

**Une mise en garde sur les copies en cache**

Il y a un détail sur les Emplacements Edge qui mérite d'être signalé maintenant, même si l'histoire complète appartient au Chapitre 13 : une copie en cache est une *copie*, et les copies peuvent devenir obsolètes. Si l'original change dans votre Région, l'Emplacement Edge peut continuer à servir l'ancienne version pendant un certain temps. Combien de temps, et ce que vous pouvez y faire, sont exactement le genre de contrôles qu'un CDN vous donne — et exactement ce avec quoi l'équipe se débattra quand Nimbus déploiera réellement CloudFront. Pour l'instant, retenez juste ceci : le contenu peut vivre près de l'utilisateur, et « près » signifie parfois « légèrement périmé ».

**Choisir une Région : La liste de contrôle de l'ingénieur senior**

Si Nimbus s'étend un jour pour servir des utilisateurs au Mexique et en Colombie — un scénario que nous
pratiquerons dans les exercices de ce chapitre — la décision de Région n'est pas arbitraire. Voici le raisonnement :

**1. Où sont vos utilisateurs ?**

Commencez ici. Choisissez la Région la plus proche de la majorité de vos utilisateurs. La latence est l'impact le plus
direct et mesurable du choix de Région.

La distance physique entre un utilisateur et un serveur compte d'une façon facile à
sous-estimer. Un aller-retour de 170 ms vers Singapour contre un aller-retour de 20 ms vers l'Oregon n'est
pas une métrique de performance abstraite — c'est la différence entre une page qui semble
instantanée et une page qui semble poussive. Sur un appareil mobile avec une latence radio
supplémentaire, la pénalité de Singapour s'aggrave davantage. Pour un utilisateur à San Jose, `us-west-2`
(Oregon) est la bonne Région avant même de considérer tout autre facteur.

**2. Y a-t-il des exigences de conformité ?**

Les charges de travail de santé, finance et gouvernement ont souvent des règles strictes de résidence des données.
Connaissez votre environnement réglementaire avant de choisir. Le RGPD exige que les données personnelles des résidents de l'UE soient stockées dans des juridictions avec une protection des données adéquate — soit l'UE elle-même, soit un pays bénéficiant d'une décision d'adéquation. HIPAA exige des garanties documentées pour les données de santé américaines. Ce ne sont pas des considérations optionnelles à revoir plus tard.

En pratique : parlez à votre équipe juridique avant de choisir une Région pour toute charge de travail réglementée. AWS maintient une documentation de conformité étendue pour chaque Région, y compris des certifications comme SOC 2, ISO 27001, PCI DSS et l'éligibilité HIPAA. Mais les certifications vous disent ce qu'AWS a fait ; votre équipe juridique vous dit si c'est suffisant pour votre contexte réglementaire spécifique.

**3. De quels services avez-vous besoin ?**

Tous les services AWS ne sont pas disponibles dans toutes les Régions. Les nouveaux services lancent dans `us-east-1`
en premier. Si vous avez besoin d'un service spécifique, vérifiez que votre Région cible le supporte.

C'est une préoccupation moindre pour les services de ce livre — tous les services majeurs sont
largement disponibles — mais ça importe pour les services plus récents, le matériel spécialisé (certains types
d'instances GPU n'existent que dans certaines Régions), et AWS GovCloud (une Région distincte
conçue pour les charges de travail du gouvernement américain avec des exigences réglementaires spécifiques).

**4. Quel est le prix ?**

Les Régions varient en prix. `us-east-1` (Virginie du Nord) tend à être la moins chère en raison de
son échelle et de son ancienneté. L'Amérique du Sud est légèrement plus chère. Vérifiez la page de tarification AWS
avant de finaliser.

Le différentiel de prix est généralement faible — de quelques à dix pour cent entre les Régions populaires. C'est rarement le facteur décisif. Mais pour une charge de travail sensible au coût faisant tourner des milliers d'instances, même une différence de prix de 5 % s'accumule avec le temps. Tom vérifierait le chiffre et en tiendrait compte, comme Tom vérifiait tous les chiffres et en tenait compte.

**5. Avez-vous besoin de multi-Région ?**

Pour la plupart des applications, plusieurs AZ dans une seule Région est une résilience suffisante. Pour les
applications critiques où même une panne régionale est inacceptable, vous concevez pour le
multi-Région — mais c'est un engagement architectural significatif. Ne le faites pas
de façon spéculative.

« Quelle est la règle pour quand on ajoute une deuxième Région ? » demanda Leo.

« Quand on a une exigence documentée qui dit "doit rester opérationnel si une Région AWS entière est indisponible" », dit Priya. « Pas "ce serait bien". Une exigence spécifique, avec une justification métier spécifique, qu'on a pesée par rapport à la complexité et au coût. »

« À quoi ça ressemble en pratique ? »

« Un contrat client avec un SLA qui exige 99,99 % de disponibilité. Un mandat réglementaire pour la redondance géographique. Un scénario de perte de région qu'on peut réellement quantifier en termes de revenus. Pas juste "et si us-west-2 tombe en panne". »

Leo regarda l'architecture actuelle de Nimbus. Ils étaient encore sur une seule AZ.

« Multi-AZ d'abord », dit-il.

« Multi-AZ d'abord », confirma Priya.

**La limitation dont personne ne parle**

Les Régions sont puissantes, mais elles créent une tension importante.

Fonctionner dans plusieurs Régions est vraiment difficile.

La réplication de données entre Régions a de la latence. Garder deux Régions synchronisées — pour qu'une
transaction dans la Région A soit instantanément visible dans la Région B — est l'un des problèmes
les plus difficiles dans les systèmes distribués. AWS fournit des outils pour ça, mais ça coûte de l'argent et ajoute
de la complexité opérationnelle.

La plupart des applications devraient commencer avec une Région, plusieurs AZ, et ne s'étendre au multi-Région
que lorsqu'elles ont une exigence claire : mandats réglementaires, SLA contractuels exigeant
un temps d'arrêt régional quasi nul, ou une base d'utilisateurs réellement répartie sur des continents.

Répliquer les données entre régions ajoute des coûts — le transfert de données inter-régions est l'un des postes les plus sous-estimés sur une facture AWS. Cela ajoute aussi de la complexité opérationnelle : chaque écriture qui doit être cohérente entre régions ajoute de la latence.

La plupart des pannes qui affectent les vraies applications ne sont pas des catastrophes inter-régions. Ce sont des problèmes intra-région comme un groupe de sécurité mal configuré ou un déploiement raté. Le scénario dramatique « une région entière tombe en panne » fait la une précisément parce qu'il est rare. Investissez dans le multi-AZ avant le multi-région. Ajoutez le multi-région quand le cas métier est clair.

Pour mettre des chiffres précis dessus : AWS a connu un petit nombre d'événements significatifs sur une seule région au cours de son histoire. Les pannes régionales complètes sont réellement peu fréquentes. Les événements au niveau de l'AZ — de brèves pannes affectant un centre de données dans une région — sont moins rares et sont exactement ce que le déploiement Multi-AZ est conçu pour absorber. La fréquence des événements d'AZ comparée aux événements régionaux est environ un ordre de grandeur plus élevée. Consacrer l'effort architectural au mode de défaillance le plus courant en premier est le choix rationnel.

L'architecture multi-Région prématurée est l'une des erreurs les plus courantes et les plus coûteuses
que font les ingénieurs juniors quand ils commencent à se sentir confiants.

Tom hocha la tête. « Donc on ne fait pas de multi-Région juste parce qu'on peut. »

« Pas tant qu'on n'en a pas besoin », dit Maya. « Et on saura quand on en aura besoin. »

« Comment on le saura ? » demanda Leo.

« Quand le document de revue d'architecture aura une exigence qui dit "doit survivre à une panne
régionale" », dit Priya. « A-t-on réfléchi à ce qui se passe si une AZ entière tombe en panne avant même qu'on ait configuré le Multi-AZ ? On devrait corriger ça d'abord. Jusque-là : multi-AZ. »

Vous vous demandez peut-être : comment vérifier que votre déploiement Multi-AZ fonctionne réellement avant d'en avoir besoin ? Vous le testez. AWS fournit un outil appelé **AWS Fault Injection Service (FIS)** — anciennement Fault Injection Simulator — qui peut simuler des pannes d'AZ, des terminaisons d'instances, et d'autres conditions de défaillance contre votre architecture en fonctionnement — pour que vous puissiez observer comment votre système se comporte sous des conditions de défaillance de façon contrôlée, plutôt que de découvrir le comportement pendant un incident réel. Tester votre architecture de résilience est aussi important que de la construire. Priya inscrivit « test d'injection de fautes » dans le calendrier trimestriel de revue d'architecture immédiatement après avoir lu à ce sujet.

## Quand AWS vient à vous : Outposts et Wavelength

Les Régions et les Zones de disponibilité couvrent le monde — mais tous les problèmes ne se résolvent pas en déplaçant les données vers AWS. Certaines charges de travail doivent rester sur site : les systèmes d'ateliers de fabrication qui ont besoin d'une latence inférieure à la milliseconde, les applications de santé avec des exigences de résidence des données, les systèmes de points de vente dans des magasins sans internet fiable. Pour ceux-là, AWS étend son infrastructure jusqu'à l'emplacement du client.

« Attends — et si on finit par travailler avec un système hospitalier ? » demanda Priya. « Leur logiciel de surveillance des patients ne peut littéralement pas tolérer un aller-retour vers le cloud. Et il peut être légalement interdit de quitter le bâtiment. »

Maya ouvrit la documentation AWS. Deux services revenaient sans cesse.

**AWS Outposts**

Un rack entièrement managé de matériel AWS installé dans votre propre centre de données ou installation de colocation. Outposts fait tourner la même infrastructure, les mêmes services, API et outils AWS que le cloud AWS — EC2, EBS, RDS, EKS, S3 sur Outposts — mais physiquement dans votre bâtiment.

Cas d'usage : charges de travail de fabrication sensibles à la latence, exigences de résidence des données où les données doivent physiquement rester dans un emplacement spécifique, applications qui ont besoin des API AWS mais ne peuvent pas tolérer les interruptions de connectivité vers le cloud public.

Point clé : Outposts est toujours managé par AWS. AWS l'installe, le corrige et le surveille. Vous possédez l'espace du rack et l'alimentation. Les API et l'outillage sont identiques au cloud public — les mêmes modèles CloudFormation, les mêmes politiques IAM, les mêmes commandes CLI. La distinction à l'examen est l'emplacement physique, pas le modèle opérationnel.

« Donc c'est AWS, mais dans le bâtiment de notre client », dit Leo.

« Exactement », dit Maya. « Mêmes API. Code postal différent. »

**AWS Wavelength**

Infrastructure AWS déployée à l'intérieur des réseaux 5G des fournisseurs de télécommunications. Les Wavelength Zones se situent à la périphérie des réseaux 5G, physiquement proches des utilisateurs mobiles, permettant une latence à un chiffre en millisecondes pour les applications mobiles.

Cas d'usage : jeu en temps réel, RA/RV, télémétrie de véhicules autonomes, traitement vidéo en direct à la périphérie 5G.

« Celui-là n'est pas pour un hôpital », dit Tom. « C'est pour quelqu'un qui construit la prochaine génération de jeux mobiles multijoueurs. »

« Ou la télémétrie de voitures autonomes », dit Priya. « Tout ce où un appareil mobile a besoin de parler à un serveur et 50 millisecondes c'est trop lent. »

**La différence :** Outposts amène AWS dans votre centre de données — votre bâtiment, votre rack, votre alimentation. Wavelength amène AWS à la périphérie du réseau télécom — physiquement colocalisé avec l'infrastructure radio 5G, près des utilisateurs mobiles qui ne touchent jamais votre réseau privé.

**AWS Local Zones**

Il y a un troisième membre de cette famille — et à l'examen, c'est le plus fréquemment testé des trois. Les **Local Zones** sont une infrastructure AWS déployée dans de grandes zones métropolitaines qui n'ont pas de Région complète — Los Angeles, Houston, Miami, Lagos, et des dizaines d'autres. Une Local Zone est une extension d'une Région parente : vous faites tourner EC2, EBS, et un sous-ensemble d'autres services *dans la métropole elle-même*, obtenant une latence à un chiffre en millisecondes pour les utilisateurs de cette ville, tandis que tout le reste (et toute la gestion) reste dans la Région parente.

Le schéma à mémoriser — trois membres « edge compute », trois déclencheurs :

- « Latence à un chiffre en millisecondes vers les utilisateurs finaux **dans une ville/zone métropolitaine spécifique** » → **Local Zones**
- « Latence ultra-faible pour les **appareils mobiles 5G** » → **Wavelength**
- « Services AWS tournant **dans notre propre centre de données** / les données doivent rester sur site » → **Outposts**

Aucun des trois n'est la réponse pour une application web typique. Tous les trois apparaissent à l'examen SAA-C03 comme des pièges de correspondance de schémas : la phrase déclencheuse compte.

## Forces et limites

**Utilisez le design multi-région et multi-AZ quand** : votre application a des utilisateurs dans plusieurs zones géographiques et la latence importe ; votre SLA exige une disponibilité de 99,99 % ou plus ; les exigences réglementaires imposent la résidence des données dans des régions spécifiques ; vous avez besoin d'une reprise après sinistre avec un RTO inférieur à une heure.

**Les compromis sont réels** : Fonctionner dans plusieurs Régions vous donne une redondance contre les pannes régionales — mais à un coût et une complexité significatifs.

Rappelez-vous l'avertissement sur les coûts du début de ce chapitre : chaque octet qui se déplace entre régions coûte de l'argent. Dans une configuration multi-région active-active où les écritures doivent être cohérentes, vous payez ce coût constamment.

La complexité opérationnelle augmente aussi. Déboguer un incident dans une région est difficile. Déboguer un incident distribué et inter-régions — où la même requête a touché de l'infrastructure sur deux continents — est un genre de difficulté entièrement différent.

**La bonne progression pour la plupart des applications** : Commencez avec une seule Région et plusieurs AZ. Cela vous donne une résilience contre les pannes qui se produisent réellement — pannes au niveau de l'AZ, pannes matérielles, événements électriques — pour une fraction de la complexité d'une architecture multi-région. Ajoutez le multi-région quand une exigence spécifique et documentée le rend nécessaire. Pas avant.

Le schéma courant pour les équipes qui passent au multi-région trop tôt : la complexité de gérer deux régions introduit ses propres modes de défaillance — bugs de synchronisation des données, scénarios de split-brain, déploiements incohérents. L'architecture de résilience elle-même, conçue pour prévenir les pannes, introduit parfois de nouvelles catégories de pannes qui n'auraient pas existé dans une conception plus simple.

Priya avait un document qu'elle appelait « le budget de complexité ». L'idée : chaque décision architecturale qui ajoute de la complexité opérationnelle a un coût, et l'organisation a une capacité finie à gérer cette complexité. Dépenser le budget de complexité sur une architecture multi-région avant d'avoir maîtrisé la fiabilité mono-région est un mauvais investissement. La complexité devrait aller vers les modes de défaillance que vous affrontez réellement, pas ceux qui font de bonnes histoires de reprise après sinistre.

« On a une région, une AZ, et un processus de déploiement qui rend Leo nerveux à chaque fois qu'il le lance », dit Priya. « La bonne prochaine étape est le multi-AZ, pas le multi-région. »

Tom écrivit « budget de complexité » dans son carnet. Il utiliserait régulièrement cette expression pendant les deux années suivantes.

## Résumé

L'accident de Singapour de Leo s'est avéré être une leçon utile — non pas parce qu'il a causé des dommages durables, mais parce qu'il a forcé l'équipe à comprendre quelque chose qui est généralement sauté : l'endroit où votre infrastructure tourne n'est pas une décision cosmétique. La physique est non négociable. Cent soixante-dix millisecondes de latence de base par aller-retour, c'est la différence entre un produit rapide et un produit poussif, et les règles de conformité sur l'endroit où vivent les données se moquent de la vitesse à laquelle vous avez déménagé.

- AWS organise son infrastructure mondiale en **Régions**, **Zones de disponibilité** et **Emplacements Edge**.
- Une **Région** est un ensemble géographique de centres de données. Chaque Région est isolée — les données restent dans la Région à moins que vous ne les déplaciez explicitement.
- Les **Zones de disponibilité** sont des centres de données physiquement séparés dans une Région, connectés par un réseau à faible latence. Déployer sur plusieurs AZ est la façon standard de survivre aux pannes locales.
- Choisissez votre Région en fonction de l'emplacement des utilisateurs, des exigences de conformité, de la disponibilité des services et du prix — dans cet ordre.
- Le multi-AZ est la référence de résilience standard. Le multi-Région est pour les charges de travail critiques avec des exigences spécifiques et documentées — pas un point de départ par défaut.

## Conseils pour l'examen

*Domaine SAA-C03 1 — Tâche 1.1 / Domaine 2 — Tâche 2.2*

- **Les Régions sont isolées par défaut.** Les données ne se répliquent pas entre Régions à moins que
  vous le configuriez. C'est important pour les scénarios de souveraineté des données et de conformité.
- **Les AZ sont l'unité de résilience pour la plupart des questions.** Quand l'examen demande comment survivre
  à une panne d'un centre de données, la réponse implique plusieurs AZ dans une Région.
- **Le multi-Région est pour la résilience aux pannes régionales.** Si le scénario dit « doit rester
  opérationnel même si une Région AWS entière tombe en panne », la réponse implique une
  architecture multi-Région.
- **Les Emplacements Edge ≠ AZ.** Les Emplacements Edge mettent du contenu en cache — ils ne peuvent pas faire tourner votre
  serveur d'application. Ne les confondez pas avec des centres de données.
- L'examen teste fréquemment la relation entre conformité et sélection de Région.
  Si un scénario mentionne des exigences de résidence des données, le choix de Région fait partie de la réponse.
- **Les scénarios RGPD et de résidence des données** à l'examen pointent généralement vers le maintien des données dans une Région spécifique et la garantie que la réplication inter-régions est désactivée ou contrôlée.
- **Outposts vs Wavelength vs Local Zones :** Outposts = rack AWS dans votre centre de données (sur site, résidence des données, latence locale). Wavelength = AWS à la périphérie du réseau 5G (utilisateurs mobiles, latence ultra-faible). Local Zones = calcul AWS dans une zone métropolitaine sans Région complète. Déclencheurs d'examen : « faire tourner AWS dans votre propre installation » → Outposts. « Latence ultra-faible pour les utilisateurs mobiles 5G » → Wavelength. « Latence à un chiffre en millisecondes vers les utilisateurs d'une ville spécifique » → Local Zones.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre une Région et une Zone de disponibilité ?
Pourquoi cette distinction importe-t-elle lors de la conception d'une application web résiliente ?

*(Indice : Pensez aux deux types différents de pannes contre lesquelles chacune protège.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise de santé américaine doit stocker toutes les données des patients dans une seule Région AWS
pour se conformer aux politiques internes de résidence des données. Ils conçoivent une nouvelle application
cloud sur la côte Ouest et veulent maximiser la résilience sans déplacer les données vers
une autre Région.

Quelle configuration correspond LE MIEUX à leurs exigences ?

A) Déployer dans `us-east-1` et utiliser les Emplacements Edge CloudFront en Oregon pour servir le contenu
   plus rapidement  
B) Déployer dans `us-west-2` dans une seule Zone de disponibilité pour minimiser les coûts  
C) Déployer dans plusieurs Régions incluant `us-west-2` et `us-east-1` avec réplication
   de données inter-Régions  
D) Déployer dans `us-west-2` (Oregon) sur plusieurs Zones de disponibilité

**Indice 1** : La politique signifie que les données doivent rester dans une seule Région. Quelles options
déplacent les données vers une autre Région ?

**Indice 2** : Parmi les options qui gardent les données dans `us-west-2`, laquelle offre le plus de résilience ?

**Indice 3** : Plusieurs AZ dans une seule Région offrent de la résilience sans franchir les frontières de Région.

**Réponse** : D

**Explication** : `us-west-2` garde toutes les données dans une seule Région, satisfaisant l'exigence de politique.
Déployer sur plusieurs AZ dans cette Région protège contre les pannes de centres de données
sans déplacer les données vers une autre Région. C'est le bon équilibre
entre conformité et résilience.

**Pourquoi pas A ?** L'option A déploie dans `us-east-1`, loin des utilisateurs de la côte Ouest — et
CloudFront mettrait en cache du contenu adjacent aux patients dans des Emplacements Edge en dehors de la Région
choisie, violant la politique de résidence.

**Pourquoi pas B ?** Une seule AZ n'a aucune résilience. Si cette AZ subit une panne,
l'application tombe complètement.

**Pourquoi pas C ?** Répliquer vers `us-east-1` déplace les données des patients vers la côte Est,
violant directement l'exigence d'une seule Région.

*Domaine SAA-C03 1 — Tâche 1.1 (infrastructure mondiale, souveraineté des données)*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus s'étend pour servir des clients au Mexique et en Colombie. Actuellement tout
tourne dans `us-west-2`. L'équipe débat : devraient-ils ajouter une deuxième Région `us-east-1`,
ou rester en Région unique avec plusieurs AZ ?

Quelles questions poseriez-vous avant de décider ? Quels sont les principaux coûts et risques d'
ajouter une deuxième Région ? Quel est le principal coût de *ne pas* en ajouter une ?

*(Il n'y a pas de réponse unique correcte. Entraînez-vous au raisonnement sur les compromis multi-Région.)*

## Scène post-générique

Leo a corrigé le problème de Singapour. Nimbus a migré vers `us-west-2`. La latence a diminué.
La seule question de suivi de Tom — « est-ce que ça a changé notre facture ? » — a reçu une
réponse avec un chiffre légèrement plus élevé, qu'il a accepté avec une réticence visible.

Ça a duré deux jours avant le problème suivant.

Leo est arrivé au standup avec l'expression que Maya avait appris à reconnaître : l'expression de
quelqu'un qui avait fait quelque chose qu'il ne pouvait pas défaire.

« Donc », dit-il prudemment. « J'ai mis en place le serveur. Et j'avais besoin d'un moyen de me connecter.
Donc j'ai créé un nom d'utilisateur. »

« Et ? » demanda Priya.

« "Admin". »

Silence.

« Et le mot de passe ? »

Un silence plus long.

« "Admin123". »

Priya se leva.

Dans le prochain chapitre : comment Nimbus contrôle qui peut toucher à quoi — et ce qui se passe quand ça tourne mal.
