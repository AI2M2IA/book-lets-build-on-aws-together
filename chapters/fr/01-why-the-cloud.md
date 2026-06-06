# Chapitre 1 : Pourquoi louer quand on peut posséder ?

Le carnet était ouvert sur la table, et Tom avait barré la même ligne trois fois.

Il avait veillé tard. La question ne le lâchait pas. Vers minuit, il l'avait écrite en entier, puis soulignée, puis encadrée, puis barrée parce que l'écrire ne l'avait pas rendue plus claire. Il l'avait réécrite dans la marge.

Quand Leo et Priya sont arrivés le lendemain matin — café en main, se disputant pour quelque chose sans rapport — Tom était déjà au tableau blanc. La troisième option était encore là, intacte. Un nuage dessiné par quelqu'un qui avait admis ne pas savoir ce que ça voulait dire.

Le problème de commandes du restaurant avait cristallisé quelque chose de réel. Maya avait déclaré le cloud comme la voie à suivre. Cette décision était prise. Restait la question que Tom n'arrivait pas à chasser, posée dans la marge de son carnet : si louer était la réponse, pourquoi était-ce moins cher que posséder ?

« Il faut que quelqu'un m'explique quelque chose », dit Tom sans se retourner. « Si on loue des ordinateurs à Amazon au lieu d'acheter les nôtres — pourquoi ce serait *moins cher* ? »

La salle se tut. C'était le genre de question qui semble simple et ne l'est pas.

« Parce que », commença Leo.

« Non », dit Tom. « Je veux comprendre. Pas juste entendre la réponse. Pourquoi louer est moins cher que posséder ? »

Leo s'assit. Il posa son café sur la table. Il y réfléchit réellement.

« Parce que », dit-il de nouveau, plus prudemment cette fois, « on achèterait pour le pire des cas. Le plus gros vendredi soir, le moment viral, l'événement de lancement. Mais la plupart du temps, ce n'est pas aussi chargé. »

« Exact », dit Tom. « Continue. »

« Donc on paierait pour une capacité qu'on n'utilise pas. Chaque mardi calme. Chaque lundi matin. On aurait un serveur posé là, consommant de l'électricité, ne faisant presque rien. »

« Et si on loue à la place ? »

« On paie pour ce qu'on utilise », dit Leo. « Quand c'est calme, on paie presque rien. Quand c'est chargé, on paie plus. Mais on ne paie jamais pour une capacité qui est juste posée là. »

Tom avait l'air satisfait. Pas parce que la réponse était nouvelle pour lui — il l'avait trouvée la veille au soir. Mais parce que la dire à voix haute la rendait réelle. Il prit son carnet et barra la question une dernière fois.

C'était la fondation. Tout le reste de ce chapitre s'y appuie.

**Le problème évident avec la possession de serveurs**

Imaginez que vous décidez d'ouvrir un restaurant. Pas le genre Nimbus — un restaurant ordinaire.

Avant que votre premier client entre, vous avez besoin de tables. Des chaises. Une cuisine. Un four. Des assiettes. Du personnel. Vous avez besoin de tout ça le premier jour, même si votre première semaine est calme, même si vous passez trois mois avec six clients par jour avant que le bouche-à-oreille se répande.

Les serveurs physiques fonctionnent de la même façon.

Si Nimbus achète ses propres serveurs, ils doivent les acheter pour le pic qu'ils anticipent. Le vendredi soir le plus chargé qu'ils puissent imaginer. Le moment viral où un blogueur gastronomique parle de l'arepa et dix mille personnes essaient de commander en même temps.

Mais la plupart du temps, ce n'est pas aussi chargé. La plupart du temps, ces serveurs tournent, consomment de l'électricité, et ne font presque rien.

« On paierait pour une capacité qu'on n'utilise pas », dit Maya.

« Exactement », dit Tom, ce qui surprit tout le monde parce que c'est lui qui avait posé la question.

**Le vrai coût du matériel : la feuille de calcul de Tom**

Tom avait construit un véritable modèle de coûts au moment où l'équipe se réunit. Il les y guida.

Il avait réellement chiffré du matériel réel. Un Dell PowerEdge R550 — un serveur de milieu de gamme capable de gérer plusieurs centaines d'utilisateurs simultanés — coûtait environ 8 000 $ configuré avec assez de RAM et de stockage pour une application web de production. Ça, c'est un serveur. Pour la redondance (afin qu'une seule panne ne fasse pas tomber tout le système), il en faudrait au moins deux. Seize mille dollars avant même de commencer.

L'estimation de 2 000 $ du tableau blanc était optimiste. Le matériel de production coûtait plus cher. Il fallait assez de mémoire pour que l'application et la base de données tournent simultanément. Il fallait du RAID pour la redondance du stockage. Il fallait une carte d'interface réseau assez rapide pour gérer un vrai trafic. Au moment où vous configuriez un véritable serveur de production, le chiffre de 8 000 $ n'était pas une exagération.

« Deux serveurs : 16 000 $ », dit Tom en l'écrivant.

Puis les coûts récurrents. L'électricité : un serveur tournant 24 h/24 et 7 j/7 à 400 watts consommait environ 3 500 kilowattheures par an. À 0,12 $ le kWh, cela faisait à peu près 420 $ par an, par serveur. Multiplié par deux : 840 $ par an rien qu'en électricité.

Puis l'internet. Une connexion professionnelle assez rapide pour gérer un vrai trafic — pas le Wi-Fi résidentiel que le restaurant utilisait actuellement, mais une connexion fibre symétrique de qualité professionnelle avec un accord de niveau de service — coûtait 200 à 400 $ par mois. Cela faisait 2 400 à 4 800 $ par an.

Puis le cycle de vie du matériel. Les serveurs duraient trois à cinq ans avant de devenir trop lents ou trop peu fiables pour faire tourner une charge de production. Après la quatrième année, vous tourniez sur du matériel qui ne pouvait pas être corrigé contre certaines vulnérabilités et que votre fournisseur de serveurs ne prenait plus en charge. Vous amortissiez donc le coût initial : 16 000 $ sur quatre ans faisaient 4 000 $ par an en dépréciation du capital.

Puis les coûts que personne n'écrivait : un onduleur (alimentation sans interruption) pour survivre aux brèves coupures de courant, environ 400 $. Un switch réseau managé, 300 $. Un boîtier pare-feu avec de vraies fonctionnalités de sécurité, 500 à 2 000 $. Des disques durs de rechange sur l'étagère pour la panne inévitable, 200 $. Le refroidissement — si les serveurs vivaient dans l'arrière-bureau du restaurant, quelqu'un devait tenir compte de la chaleur qu'ils généraient, ce qui signifiait soit un circuit de climatisation dédié, soit une facture d'électricité surprise.

Additionnez tout : entre 8 000 et 12 000 $ par an en dépréciation du capital et coûts récurrents, avant de payer qui que ce soit pour maintenir, configurer ou réparer le matériel. Et la « maintenance » n'était pas qu'une ligne budgétaire — c'était une exigence d'expertise. Soit vous embauchiez quelqu'un qui savait faire tourner des serveurs, soit vous étiez la personne qui les faisait tourner à 2 h du matin quand quelque chose tournait mal.

« Et quand ça casse », dit Tom, « on ne sait pas comment le réparer. On paierait quelqu'un au tarif d'urgence. Et pendant qu'on attend, le restaurant est dans le noir. »

« Comparez ça à AWS », dit Tom. Il afficha la page de tarification d'EC2. Une instance `t3.medium` — assez de calcul pour la charge de départ de Nimbus — coûtait environ 30 $ par mois. Deux d'entre elles, pour la redondance, faisaient 60 $ par mois, soit 720 $ par an.

Quatre mille dollars par an de dépréciation contre 720 $. La différence n'était pas serrée. Même en ajoutant le réseau, le transfert de données et un service de base de données managé sur AWS, la facture cloud pour une charge de travail à l'échelle d'une startup ne représentait qu'une fraction du coût du matériel physique.

« Mais », dit Tom, parce que Tom avait toujours un mais, « on devrait être honnêtes sur le moment où ça cesse d'être aussi tranché. »

Il avait raison. À très grande échelle — des milliers de serveurs, une utilisation constante — l'économie change. Une entreprise faisant tourner 5 000 serveurs à 90 % d'utilisation en continu pourrait constater que posséder du matériel revient moins cher par unité que louer à ces volumes. Les grandes entreprises atteignent parfois ce point. Les startups presque jamais. Pour une startup avec une croissance imprévisible, sans expertise matérielle, et à l'échelle incertaine, le calcul du cloud était évident.

**Le modèle de location**

Voici ce qui rend le cloud computing différent.

Quand vous utilisez AWS, vous n'achetez pas des serveurs. Vous louez de la puissance de calcul, et vous payez uniquement pour ce que vous utilisez. C'est plus proche de la location d'une salle de réception que de la possession d'un bâtiment de restaurant.

Réfléchissez-y de cette façon.

Si vous devez organiser une fête d'anniversaire pour cinquante personnes, vous pourriez acheter une maison assez grande pour cinquante personnes avec leurs tables et leurs chaises. Ou vous pourriez louer une salle de réception pour quatre heures le samedi, payer exactement pour l'espace et le temps dont vous avez besoin, et rendre les clés quand la fête est terminée.

La salle est toujours là quand vous en avez besoin. Elle est de nouveau disponible quand quelque chose d'autre se présente. Vous n'avez pas eu à embaucher un gestionnaire d'immeuble. Vous n'avez pas payé les taxes foncières toute l'année.

Mais voici la partie que l'analogie ne capture pas pleinement : avec AWS, la « salle » peut grandir ou rétrécir pour s'adapter à votre fête. Si cinquante personnes se présentaient puis deux cents de plus arrivaient à l'improviste, la salle s'agrandirait pour les accueillir. Si la fête se terminait tôt, la salle se contracterait et vous arrêteriez de payer pour l'espace supplémentaire immédiatement.

Aucune location de salle ne fonctionne comme ça. Le cloud computing, si.

C'est le modèle cloud. AWS a les « salles de réception ». Vous vous présentez quand vous en avez besoin.

Il y a une deuxième analogie qui aborde une autre partie du tableau.

Imaginez que vous êtes une startup qui a besoin de photographie professionnelle. Vous pourriez embaucher un photographe à temps plein — salaire, équipement, avantages, espace de bureau, le tout. Ou vous pourriez embaucher un photographe à l'heure quand vous en avez besoin, payer pour le travail effectué, et le laisser partir quand la séance est terminée.

Le photographe à la demande coûte plus cher à l'heure qu'un salarié. Mais à moins d'avoir besoin de photographie chaque heure de chaque jour, le modèle à la demande est nettement moins cher au total. Et vous pouvez embaucher un spécialiste différent pour des travaux différents — un portraitiste pour les photos d'identité, un photographe produit pour les prises de vue de catalogue — sans maintenir d'effectif pour les deux.

Le cloud computing a cette même économie de spécialisation. AWS maintient des équipes de spécialistes pour chaque couche d'infrastructure : ingénieurs réseau, administrateurs de bases de données, chercheurs en sécurité, experts en approvisionnement matériel. Vous accédez au produit de leur expertise — une base de données fiable, un réseau sécurisé, un serveur bien configuré — à l'heure, sans embaucher aucun de ces spécialistes vous-même.

Vous vous demandez peut-être : si louer à l'heure est plus cher qu'acheter directement par unité, comment l'économie fonctionne-t-elle ? La réponse est l'utilisation. Un serveur physique que vous possédez reste à 9 % de CPU les mardis calmes. Un serveur cloud que vous louez pour les heures dont vous avez réellement besoin tourne à l'utilisation que la charge exige, et vous arrêtez de payer quand la charge s'arrête. Le total que vous payez pour les heures que vous utilisez réellement est inférieur au total que vous paieriez pour le serveur inactif dans son coin.

**Mais attendez — il y a plus**

« D'accord », dit Leo, « mais que se passe-t-il si ma salle brûle ? »

Bon instinct. Sombre, mais bon.

L'une des hypothèses silencieuses quand vous possédez vos propres serveurs est que *vous* êtes responsable de les maintenir en fonctionnement. Si le serveur dans votre bureau est renversé par un stagiaire maladroit, votre site web est en panne. Si le bâtiment perd son alimentation électrique, votre site web est en panne. Si le disque dur tombe en panne — et les disques durs finissent toujours par tomber en panne — votre site web est en panne.

AWS exploite des centres de données. D'immenses installations gérées professionnellement avec une alimentation de secours, des connexions réseau redondantes, une sécurité physique, et des équipes d'ingénieurs dont le seul travail est de maintenir ces machines en fonctionnement. Ils ont des alimentations électriques redondantes. Ils ont des générateurs de secours. Ils ont des connexions réseau redondantes provenant de plusieurs fournisseurs. Ils ont une sécurité physique que la plupart des immeubles de bureaux ne pourraient pas approcher.

Vous ne louez pas seulement de la puissance de calcul. Vous louez de la fiabilité.

« Combien ça coûte ? » demanda Tom.

On y viendra. La tarification est un chapitre à part entière, et elle le mérite.

**Trois choses que le cloud fait différemment**

Concrétisons cela. Voici les trois différences fondamentales entre la gestion de vos propres serveurs et l'utilisation d'un fournisseur cloud.

**1. Vous payez pour ce que vous utilisez.**

Pas de serveur qui tourne au ralenti. Pas d'achat initial. Si Nimbus reçoit zéro commande un lundi matin, ils paient presque rien. S'ils sont submergés le soir du Nouvel An, AWS a automatiquement la capacité prête.

Ce modèle fait correspondre le coût à la valeur d'une façon que l'infrastructure fixe ne peut pas. Quand vos coûts suivent vos revenus, la planification financière devient plus simple.

Il y a un terme pour cela en comptabilité : passer d'une dépense d'investissement à une dépense opérationnelle. Le CapEx est un achat initial que vous amortissez dans le temps — comme acheter le Dell PowerEdge. L'OpEx est une dépense continue que vous payez au fur et à mesure — comme la facture AWS. Pour une startup avec un capital limité et des revenus incertains, l'OpEx est nettement préférable. Vous ne pariez pas 16 000 $ sur une prévision de demande dont vous ne pouvez pas être sûr.

« Chaque dollar qu'on ne dépense pas en matériel », dit Tom, « est un dollar qu'on peut dépenser à réellement construire le produit. »

Ce n'est pas un point anodin. Le coût matériel initial que Tom avait calculé — 16 000 $ pour deux serveurs de niveau production — représentait le genre de dépense en capital qui pousse les investisseurs à poser des questions inconfortables et force les fondateurs à faire des choix difficiles sur la trésorerie.

**2. Quelqu'un d'autre s'occupe du matériel.**

AWS maintient les machines physiques. Les câbles réseau. Les alimentations électriques. Les systèmes de refroidissement. Nimbus n'embauche personne pour faire ça. Ils se concentrent sur leur application, pas sur l'infrastructure en dessous.

Cela vaut la peine de s'y arrêter. L'expertise requise pour faire tourner l'infrastructure physique d'un centre de données est réelle. Systèmes de refroidissement, gestion de l'alimentation, calendriers de remplacement du matériel, redondance réseau — ce sont des disciplines distinctes. En utilisant AWS, Nimbus accède à cette expertise sans embaucher pour elle.

Un administrateur systèmes ayant les compétences pour maintenir correctement des serveurs de production gagne 80 000 à 130 000 $ par an. Une équipe capable de gérer les pannes matérielles, la sécurité au niveau de l'OS, la configuration réseau et la gestion du stockage coûte davantage. Les services d'AWS coûtent une fraction de cela — et l'expertise opérationnelle est incluse dans le service.

C'est l'argument des économies d'échelle qu'AWS avance explicitement. Parce qu'AWS fait tourner de l'infrastructure pour des milliers de clients simultanément, le coût unitaire du maintien de cette expertise est partagé entre tous. Chaque client individuel accède à des opérations d'infrastructure de classe mondiale pour une facture qui ne représente qu'une petite fraction de ce que ces opérations coûteraient s'il les construisait seul.

**3. Vous pouvez monter en puissance — et en descendre — instantanément.**

C'est celui qui prend du temps à pleinement apprécier. Avec des serveurs physiques, monter en puissance signifie commander du nouveau matériel, attendre des semaines pour la livraison, le mettre en place. Avec AWS, monter en puissance signifie cliquer sur un bouton (ou laisser le système le faire automatiquement). Et quand vous n'avez plus besoin de la capacité supplémentaire, vous redescendez. Vous arrêtez de payer.

La partie « et en descendre » est sous-estimée. Descendre en puissance sur du matériel physique signifie que vous possédez toujours le matériel, payez toujours l'électricité, maintenez toujours le système. Vous avez juste plus que ce dont vous avez besoin. Avec le cloud, descendre en puissance est réel — les ressources disparaissent, et le coût disparaît avec elles.

Leo décrivait cela comme « la partie qui donne l'impression de tricher ». Il avait passé des années à contourner des systèmes à capacité fixe — estimant soigneusement combien de serveur il lui faudrait, provisionnant prudemment, surveillant le compteur de capacité, et se trompant parfois dans les deux directions. L'idée qu'il pouvait ajouter un serveur, l'utiliser pendant quatre heures un vendredi soir, et le supprimer — ne payant que pour ces quatre heures — semblait fausse de la manière dont les choses trop belles pour être vraies semblent fausses.

Ce n'était pas trop beau pour être vrai. C'était le modèle économique. AWS gagne de l'argent quand vous utilisez son infrastructure. Ils ont tout intérêt à rendre cette utilisation aussi fluide que possible.

Priya était restée silencieuse pendant cette explication. Elle avait une question.

« Et si quelqu'un essaie d'entrer par effraction ? À qui incombe ce problème ? »

Et c'est là que ça devient intéressant.

**Le modèle de responsabilité partagée**

C'est l'un des concepts les plus importants de tout AWS. Il est simple une fois compris, mais il fait trébucher beaucoup de personnes — y compris à l'examen.

AWS et vous partagez la responsabilité de la sécurité. Mais chaque partie est responsable de choses différentes.

**AWS est responsable de la sécurité *du* cloud.**

Les centres de données physiques. Le matériel. L'infrastructure réseau. Les hyperviseurs qui font tourner les machines virtuelles. Si quelqu'un entre par effraction dans un centre de données AWS, c'est le problème d'Amazon. Si un disque physique tombe en panne et corrompt des données, c'est le problème d'Amazon. Si l'infrastructure réseau entre les zones de disponibilité est compromise, c'est le problème d'Amazon.

**Vous êtes responsable de la sécurité *dans* le cloud.**

Vos données. Votre application. Vos comptes utilisateurs et qui a accès à quoi. Les configurations que vous choisissez. Si quelqu'un vole votre mot de passe et se connecte à votre compte AWS, c'est votre problème. Si vous configurez mal une base de données pour qu'elle soit accessible publiquement, c'est votre problème. Si votre application a une vulnérabilité qui permet une injection SQL, c'est votre problème.

Priya hocha lentement la tête. « Donc ils protègent le bâtiment. On protège ce qui est à l'intérieur. »

« Exactement », dit Maya.

« Donc si Leo ouvre un port qu'il ne devrait pas... »

« C'est toujours notre problème », confirma Maya en regardant Leo.

Leo tapait déjà quelque chose sur son ordinateur et faisait semblant de ne pas entendre.

Vous vous demandez peut-être : cela signifie-t-il qu'AWS est parfois responsable d'une fuite de données ? Seulement si la fuite se produit au niveau physique ou de l'infrastructure — un centre de données compromis, une panne matérielle, une vulnérabilité dans l'hyperviseur lui-même. Les fuites causées par des applications mal configurées, des mots de passe faibles, ou des contrôles d'accès mal définis sont toujours la responsabilité du client, quelle que soit la taille ou la réputation du fournisseur cloud.

**L'analogie de l'aéroport**

Voici une deuxième façon de penser au modèle de responsabilité partagée, car il revient assez souvent à l'examen pour mériter deux angles.

Imaginez un aéroport.

L'exploitant de l'aéroport sécurise les lieux — les pistes, les terminaux, les clôtures, les points de contrôle, ce qui se passe quand une personne non autorisée est trouvée près du dépôt de carburant.

Mais une fois à l'intérieur, chaque compagnie aérienne est responsable de ses propres opérations : sa propre maintenance des avions, ses propres procédures d'équipage, ses propres manifestes passagers. Si une compagnie perd les bagages d'un passager ou qu'un pilote saute une liste de vérification, ce n'est pas la faute de l'aéroport. Les lieux étaient sécurisés. La compagnie qui opérait à l'intérieur a fait un mauvais choix.

AWS est l'aéroport. Vous êtes la compagnie aérienne qui opère à l'intérieur. AWS sécurise la structure physique et l'infrastructure de base. Vous sécurisez vos données, vos contrôles d'accès, et vos décisions applicatives.

Cette analogie compte parce qu'elle clarifie où se situe la ligne quand les choses tournent mal. « On est sur AWS, donc c'est leur problème » est toujours la mauvaise réponse à l'examen, et presque toujours la mauvaise réponse dans le monde réel.

**Le type de service compte**

Il y a une dernière subtilité qui vaut la peine d'être connue maintenant, même si nous y reviendrons tout au long du livre.

La répartition de la responsabilité change selon le niveau de gestion d'un service.

Pour EC2 — les machines virtuelles que vous contrôlez — vous êtes responsable de corriger le système d'exploitation. AWS fournit la machine physique et l'hyperviseur. Tout ce qui est au-dessus de l'OS est à vous.

Pour RDS — le service de base de données managé que nous couvrons au chapitre 8 — AWS corrige le moteur de base de données lui-même. Vous ne gérez pas l'OS. Votre responsabilité se réduit à la configuration de la base de données, aux données qu'elle contient, et à qui y a accès.

Pour S3 — le service de stockage de fichiers — AWS gère complètement l'infrastructure. Votre responsabilité est le contrôle d'accès (qui peut lire et écrire dans vos buckets) et les données elles-mêmes.

Plus un service est managé, plus la responsabilité se déplace vers AWS. C'est un schéma clé de l'examen : quand une question demande qui est responsable de quelque chose, demandez d'abord « quel est le niveau de gestion de ce service ? ».

**Si le cloud, alors commodité mais pas contrôle**

Le modèle cloud offre de réels avantages : pas de matériel à gérer, des coûts élastiques, une mise à l'échelle instantanée. Mais cela signifie aussi renoncer à quelque chose.

Si vous déplacez votre infrastructure vers le cloud, alors vous gagnez en flexibilité et réduisez les coûts d'investissement initiaux — mais vous abandonnez le contrôle total sur les machines sous-jacentes. Vous ne pouvez pas les inspecter physiquement. Vous ne pouvez pas garantir où elles se trouvent dans un centre de données. Vous dépendez de la disponibilité d'AWS, des fenêtres de maintenance d'AWS, et de la réponse aux incidents d'AWS quand quelque chose tourne mal au niveau de l'infrastructure. Pour la plupart des équipes, c'est un excellent compromis. Pour certaines industries réglementées, cela exige une documentation soignée et les certifications de conformité d'AWS. Sachez ce que vous échangez avant de l'échanger.

## Forces et limites

Aucun outil n'est parfait. Soyons honnêtes sur les deux côtés.

**Pourquoi le cloud est formidable** :

- Pas de coûts matériels initiaux
- Paiement uniquement pour ce que vous utilisez
- Évolue instantanément dans les deux sens
- Fiabilité professionnelle et sécurité physique
- Accès à des centaines de services gérés (bases de données, files d'attente, apprentissage automatique, et plus)
  sans avoir à les construire ou les maintenir vous-même
- Portée mondiale : déployer dans une nouvelle géographie est un changement de configuration, pas un processus
  d'approvisionnement matériel

**Là où ça se complique** :

- Les coûts peuvent être imprévisibles si vous ne faites pas attention (le futur cauchemar de Tom)
- Vous dépendez d'un tiers pour votre infrastructure — si AWS a une panne dans votre
  région, votre service est aussi affecté
- Il y a une courbe d'apprentissage. AWS a des centaines de services. Savoir lequel utiliser
  demande de l'expérience, ou un livre comme celui-ci.
- Les données quittant le cloud peuvent être coûteuses. Déplacer de grandes quantités de données
  hors d'AWS coûte de l'argent. (Nous reviendrons là-dessus au Chapitre 30.)
- L'enfermement propriétaire est réel pour les services de plus haut niveau. Utiliser une base de données
  AWS managée est facile à démarrer et plus difficile à quitter. Plus vous utilisez de services
  spécifiques à AWS, plus vous êtes engagé dans l'écosystème et la tarification d'AWS.

« Donc on échange le contrôle contre la commodité », dit Tom.

« Et les coûts initiaux contre les coûts récurrents », ajouta Maya.

« Et le problème de quelqu'un d'autre contre notre propre problème, du côté de la sécurité », dit Priya.

« Mais on échange aussi le serveur cassé de Leo contre le serveur très-pas-cassé d'Amazon », dit Leo,
qui avait apparemment écouté tout le temps.

Il n'avait pas complètement tort.

Tom avait une dernière préoccupation.

« Si on construit tout sur AWS et qu'AWS augmente les prix dans trois ans, on ne peut pas exactement
déplacer notre base de données dans l'arrière-salle du restaurant. »

« C'est vrai », dit Maya. « Mais la trajectoire des prix d'Amazon a généralement été à la baisse — ils ont
baissé les prix plus de 100 fois depuis 2006. Le risque d'enfermement est réel, mais le risque historique
réel d'augmentations de prix surprises est faible. »

« Généralement », dit Tom. Il l'écrivit. Il reviendrait sur ce calcul, comme il revenait sur tous ses
calculs, un futur samedi matin avec un stylo rouge et un café.

**Quand le sur site est le bon choix**

Le cloud remporte clairement la comparaison Nimbus. Mais l'honnêteté intellectuelle exige de dire quand il ne l'emporte pas.

**Les grandes entreprises avec des charges de travail stables et prévisibles** constatent parfois que posséder du matériel devient compétitif en coût par rapport à la location une fois que l'utilisation est constamment élevée. Si vous faites tourner des milliers de serveurs à 80 % d'utilisation en continu, l'économie de la possession a une autre allure que pour une startup au trafic variable. Le modèle de paiement à l'usage du cloud est le plus avantageux quand l'utilisation est variable. Quand l'utilisation est stable et élevée, l'économie unitaire de la possession peut être compétitive. C'est pourquoi certaines grandes entreprises font tourner des architectures hybrides : le cloud pour les charges variables, le sur site pour les stables.

**Les environnements de données réglementés avec des exigences strictes de localité** peuvent n'avoir d'autre option que le sur site. Les environnements informatiques classifiés gouvernementaux — les systèmes qui traitent des informations classifiées de sécurité nationale — ne peuvent pas utiliser de fournisseurs cloud commerciaux. Les données ne peuvent pas quitter une installation physiquement contrôlée. Les systèmes financiers dans certaines juridictions ont des exigences similaires. Les organisations de santé traitant certaines catégories de données peuvent faire face à des exigences que les certifications cloud commerciales ne satisfont pas pleinement. Dans ces situations, le sur site n'est pas une préférence ; c'est une obligation.

**Les exigences de latence extrêmement basse et de proximité physique** créent une troisième catégorie. Certains systèmes de trading financier ont besoin d'une latence inférieure à la milliseconde entre leur application et le moteur d'appariement de la bourse. La colocation dans le même centre de données physique que la bourse — avec des connexions fibre directes — atteint des latences qu'aucune région cloud ne pourrait égaler. Certains instruments scientifiques — accélérateurs de particules, réseaux sismiques, radiotélescopes — génèrent des données qui doivent être traitées localement avant que la transmission soit possible. Ce sont de vrais cas d'usage qui exigent une proximité physique avec le matériel.

**Les contrats à long terme existants** sont la contrainte la plus banale mais souvent la plus pertinente. Une entreprise qui a signé un bail de centre de données de cinq ans en 2022 a une obligation contractuelle. Migrer vers le cloud avant l'expiration du bail a un coût réel — les paiements de bail restants — qui change l'économie de façon significative. Les décisions d'architecture ne se prennent pas dans le vide. Elles se prennent dans des organisations avec des contrats existants, des calendriers de dépréciation du matériel existants, et une expertise du personnel existante.

« Est-ce que l'un de ces cas, c'est nous ? » demanda Maya.

« Non », dit Tom. « On n'a pas de matériel. Pas de contrats. Pas d'obligations réglementaires. Et une équipe sans expérience d'administration de serveurs. »

« Donc ce sera le cloud. »

« Ce sera le cloud. Mais savoir quand ce n'est pas la réponse fait partie de savoir ce qu'on fait. »

Aucune des exceptions au sur site ne s'applique à Nimbus. Mais elles sont réelles, et un bon architecte cloud sait quand dire « le cloud n'est pas la bonne réponse ici ». Le but n'est pas d'être un avocat du cloud. Le but est d'avoir raison.

## Résumé

La question que Tom n'arrivait pas à chasser — pourquoi louer est-il moins cher que posséder ? — s'est avérée avoir une réponse simple et une compliquée. La réponse simple est l'utilisation : vous arrêtez de payer pour une capacité inactive les mardis calmes. La réponse compliquée fait intervenir le modèle de responsabilité partagée, le compromis entre CapEx et OpEx, et quelques situations honnêtes où le cloud est en réalité le mauvais choix. Tom avait raison de poser la question. La réponse a changé la façon dont l'équipe pensait à tout ce qui a suivi.

- L'avantage fondamental est la mise à l'échelle à l'usage : vous payez uniquement pour ce que vous utilisez, et vous pouvez monter ou descendre selon les besoins.
- La comparaison de coûts de Tom a montré clairement l'économie matérielle : 720 $/an pour deux instances EC2 contre 8 000 à 12 000 $/an pour du matériel physique équivalent, avant les coûts de maintenance.
- AWS gère l'infrastructure physique. Vous gérez votre application, vos données, et vos configurations. Cette division est appelée le **Modèle de responsabilité partagée**.
- Le Modèle de responsabilité partagée change selon le type de service — plus de services managés signifie plus de responsabilité pour AWS.
- Le cloud n'est pas toujours moins cher ou plus simple — mais il supprime les barrières au démarrage, et il rend la mise à l'échelle possible d'une façon que les serveurs physiques ne peuvent pas égaler.

## Conseils pour l'examen

*Domaine SAA-C03 : Transversal — Fondamentaux des concepts cloud*

- Le **Modèle de responsabilité partagée** apparaît régulièrement à l'examen. Rappelez-vous : AWS
  est responsable de la sécurité *du* cloud (matériel, centres de données, réseau mondial).
  Vous êtes responsable de la sécurité *dans* le cloud (données, identités, configuration d'application).
- **Nuance critique** : la répartition change selon le type de service. Pour EC2
  (une machine virtuelle que vous contrôlez), *vous* patchez le système d'exploitation. Pour RDS (une
  base de données gérée), AWS patche le moteur de base de données. Plus un service est « géré »,
  plus la responsabilité se déplace vers AWS. Les scénarios d'examen décrivent un incident
  et demandent qui est responsable — demandez toujours « quel est le niveau de gestion de ce service ? »
- Les questions sur les *avantages* du cloud testent souvent CapEx vs OpEx. Le matériel sur site
  est une dépense d'investissement (CapEx — acheter une fois, amortir dans le temps). Le cloud est
  une dépense opérationnelle (OpEx — payer mensuellement). AWS déplace les coûts de CapEx vers OpEx.
- « Élasticité » — la capacité de monter *et* descendre en puissance automatiquement — est un avantage
  clé du cloud. Vous pouvez la voir associée à « évolutivité » à l'examen. L'élasticité signifie
  une mise à l'échelle automatique et pilotée par la demande dans les deux sens. L'évolutivité signifie que le système
  *peut* grandir, mais ne rétrécit pas nécessairement automatiquement.
- L'examen peut décrire un scénario où une entreprise passe de « l'achat de serveurs » au « cloud ». Le bon cadrage : passer de CapEx à OpEx, éliminer les coûts initiaux, gagner en élasticité, et transférer la responsabilité de l'infrastructure au fournisseur cloud.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : expliquez le Modèle de responsabilité partagée. Qui est responsable de quoi,
et pourquoi cette distinction est-elle importante ?

*(Indice : Pensez à l'analogie de Priya — qui protège le bâtiment, et qui protège ce qui est
à l'intérieur.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise migre son application web d'un centre de données sur site
vers AWS. L'équipe de sécurité s'inquiète de maintenir la conformité avec ses politiques
de protection des données. Un nouvel ingénieur demande : « Maintenant qu'on est sur AWS,
est-ce qu'Amazon gère toutes nos exigences de sécurité ? »

Laquelle des affirmations suivantes décrit LE MIEUX comment les responsabilités de sécurité
sont réparties ?

A) AWS est entièrement responsable de toute la sécurité une fois que l'application est hébergée dans le cloud  
B) Le client est entièrement responsable de toute la sécurité, y compris la sécurité physique du centre de données  
C) AWS gère la sécurité de l'infrastructure sous-jacente ; le client gère la sécurité de ses données, applications et configurations  
D) Les responsabilités de sécurité sont négociées par compte et dépendent du niveau de service du client

**Indice 1** : Pensez à ce qu'AWS contrôle physiquement versus ce que vous contrôlez.

**Indice 2** : AWS possède les centres de données. Vous avez choisi ce qu'y mettre et comment configurer
votre application.

**Indice 3** : Nous avons introduit un nom spécifique pour cette division des responsabilités dans
ce chapitre.

**Réponse** : C

**Explication** : Le Modèle de responsabilité partagée AWS divise la sécurité en deux domaines.
AWS sécurise l'infrastructure physique — centres de données, matériel et réseau.
Le client sécurise tout ce qu'il déploie dessus : ses données, ses contrôles d'accès,
ses configurations d'application, et ses paramètres réseau.

**Pourquoi pas A ?** AWS ne prend jamais l'entière responsabilité de la sécurité des applications client.
Dès que vous configurez quelque chose, cette configuration est à vous de gérer.

**Pourquoi pas B ?** Les clients ne sont pas responsables de la sécurité physique des centres de données —
c'est précisément l'un des avantages d'utiliser AWS.

**Pourquoi pas D ?** Le Modèle de responsabilité partagée est un cadre fixe, pas un arrangement négocié.

*Domaine SAA-C03 : Transversal — Concepts cloud / Responsabilité partagée*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Un ami lance une nouvelle application et vous demande votre avis. Il hésite entre
acheter deux serveurs physiques (un pour l'application, un pour la base de données)
ou utiliser un fournisseur cloud. Son trafic prévu est de 10 à 100 utilisateurs par jour,
mais il a un événement de lancement dans trois mois qui pourrait amener 10 000 utilisateurs
en une seule journée.

Analysez les compromis. Quelle option recommanderiez-vous, et quelle est la raison principale ?
Qu'est-ce que vous abandonneriez avec votre choix ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à raisonner en termes de compromis.)*

## Scène post-générique

Trois jours plus tard, Nimbus avait un compte AWS.

Leo l'avait créé à 23 h avec son adresse e-mail personnelle, une carte de crédit qu'il avait dû
emprunter à Tom, et un enthousiasme qui était, rétrospectivement, légèrement alarmant.

« J'ai trouvé quelque chose qui s'appelle EC2 », dit-il le lendemain matin en montrant son écran d'ordinateur.
« C'est comme un ordinateur qu'on loue. Je crois que j'en ai démarré un. »

« Tu *crois* ? » demanda Priya.

« Je veux dire, j'en ai définitivement démarré un. » Il fit défiler vers le bas. « Je sais juste pas où il est. »

Maya se pencha et regarda l'écran.

« Leo », dit-elle. « Pourquoi ça dit "Région : ap-southeast-1" ? »

« Qu'est-ce que ça veut dire ? »

« Attends — mais *pourquoi* serions-nous à Singapour ? » dit Maya. « Tous nos clients sont sur la côte Ouest. »

Dans le prochain chapitre : la géographie d'AWS — où sont vraiment les serveurs, et pourquoi ça importe.
