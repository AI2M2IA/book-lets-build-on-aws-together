# Chapitre 4 : Un ordinateur dans le bâtiment de quelqu'un d'autre

Le graphique du CPU était devenu une musique de fond.

L'ordinateur portable de Tom était posé ouvert dans le coin de son bureau, CloudWatch s'actualisant chaque minute, la ligne d'utilisation grimpant à une pente qui signifiait que quelque chose travaillait dur. Maya l'avait remarqué il y a trois jours et n'en avait parlé à personne. Elle avait plutôt surveillé la file des commandes.

IAM était en place. Les credentials étaient en ordre. Priya avait la MFA sur tout. L'équipe se sentait, pour la première fois, légèrement responsable. Mais responsable ne résolvait pas le problème que Maya surveillait : les chiffres sur le tableau de bord des commandes qui grimpaient pendant que la ligne du CPU grimpait avec eux.

L'application Nimbus tournait sur l'instance que Leo avait lancée sans y réfléchir — celle qu'il avait « déployée quelque part » avant que quiconque sache ce qu'était une Région.

C'était bien pour montrer une démo aux investisseurs. Ce n'était pas bien quand Maya appuya sur « lancer » et que deux cents inscriptions arrivèrent la première semaine — quarante-sept restaurants prenant activement des commandes chaque jour. L'instance improvisée de Leo gérait désormais de vraies commandes, de vrais menus et de vrais clients — une machine choisie par accident, dimensionnée par défaut, configurée par une personne qui apprenait AWS au fur et à mesure qu'elle tapait.

« Il nous faut un serveur », dit Maya. « Un vrai. Un que quelqu'un a réellement choisi exprès. »

Tom regarda le graphique du CPU. La ligne était visible depuis l'autre bout de la pièce.

C'est alors qu'ils ont commencé à s'intéresser à ce que ça veut vraiment dire de louer un ordinateur.

**L'abstraction que personne n'explique**

Quand les gens disent que leur application « tourne dans le cloud », ils veulent habituellement dire
qu'elle tourne sur une machine virtuelle — un ordinateur qui n'existe pas physiquement en tant que
matériel dédié, mais qui se comporte à tous égards comme si c'était le cas.

Voici le mécanisme.

Un serveur physique dans un centre de données AWS possède beaucoup de ressources : des cœurs CPU, de la mémoire,
du disque, et de la bande passante réseau. AWS prend ce serveur physique et le divise à l'aide d'un logiciel
appelé **hyperviseur** — un logiciel qui agit comme le concierge d'un immeuble, divisant
les ressources du serveur physique entre plusieurs locataires virtuels. L'hyperviseur crée
plusieurs machines virtuelles, chacune semblant avoir son propre CPU, mémoire et
disque dédiés — mais partageant en réalité le matériel physique sous-jacent.

Voyez-le comme louer un appartement dans un grand immeuble, plutôt qu'acheter une maison.

Le propriétaire de l'immeuble (AWS) maintient la structure physique — la plomberie, l'électricité,
la sécurité. Vous obtenez une unité. Vous la meublez comme vous voulez. Vous payez mensuellement (ou
à l'heure). Quand vous avez besoin de plus d'espace, vous déménagez dans une unité plus grande. Quand vous
partez, vous arrêtez de payer.

Chacune de ces locations de machine virtuelle est ce qu'AWS appelle une **instance EC2** — Elastic
Compute Cloud.

EC2 signifie Elastic Compute Cloud. La partie « élastique » est importante, et nous y
viendrons. Pour l'instant : une instance EC2 est un ordinateur que vous louez à l'heure. Elle a un système
d'exploitation, une connexion réseau et de la puissance de calcul. Elle fait tourner votre application
comme le ferait un serveur physique.

**Choisir votre instance : la taille importe**

Toutes les instances EC2 ne sont pas identiques. AWS propose des centaines de types d'instances, organisés
en familles selon ce pour quoi elles sont optimisées.

**Usage général** (ex. `t3`, `m6i`) : Équilibre entre CPU et mémoire. Bon choix par défaut
pour la plupart des applications web. La famille `t3` est à rafale (burstable) — elle accumule des crédits CPU
pendant les périodes de faible utilisation et les dépense pendant les rafales. Idéale pour les environnements
de développement et les charges de travail à demande CPU variable. La famille `m6i` fournit
des performances constantes et non à rafale — meilleure pour les charges de production avec des besoins CPU soutenus.

**Optimisé pour le calcul** (ex. `c7g`) : Plus de CPU par rapport à la mémoire. Bon pour l'encodage
vidéo, la modélisation scientifique, le traitement par lots. Le suffixe « g » dans `c7g` signifie que l'
instance utilise des processeurs AWS Graviton — des puces basées sur ARM qu'AWS a conçues en interne,
offrant un meilleur rapport prix-performance pour de nombreuses charges de travail que les instances x86 équivalentes.

**Optimisé pour la mémoire** (ex. `r7i`) : Plus de mémoire par rapport au CPU. Bon pour les bases de données,
la mise en cache, l'analytique en mémoire. Si vous faites tourner une base de données dont les performances s'améliorent
considérablement en gardant plus de données en RAM, la famille R est le bon point de départ.

**Optimisé pour le stockage** (ex. `i3`) : Stockage local haute vitesse. Bon pour les charges de travail
intensives en données qui nécessitent un I/O disque très rapide. Le stockage local NVMe sur ces instances est
nettement plus rapide qu'EBS — mais il est aussi éphémère. Utilisez-le pour des données temporaires,
pas pour quoi que ce soit que vous ne pouvez pas vous permettre de perdre.

**Calcul accéléré** (ex. `p4`) : GPU attachés. Bon pour l'entraînement d'apprentissage automatique
et le rendu graphique. Ces instances sont chères — une `p3.8xlarge` coûte
plus de 12 $ de l'heure — mais pour les charges de travail qui bénéficient du parallélisme GPU, il n'y a pas
de substitut.

Chaque famille a des tailles. Un `t3.micro` a 2 CPU virtuels et 1 Go de mémoire. Un
`t3.xlarge` a 4 CPU virtuels et 16 Go. Un `t3.2xlarge` double encore. Le schéma de
nommage est cohérent : le suffixe va `nano`, `micro`, `small`, `medium`, `large`,
`xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, et au-delà.

Leo avait choisi un `t3.micro`.

« Combien d'utilisateurs un `t3.micro` peut-il gérer ? » demanda Tom. « Et combien coûte une plus grande en plus ? »

« Ça dépend de l'application », dit Leo. « Mais probablement pas cent utilisateurs simultanés
faisant des téléchargements d'images et des requêtes de base de données. »

« Combien ça coûte par mois ? » demanda Tom en regardant la page de comparaison des types d'instances.

Leo afficha la page de tarification AWS. Le t3.micro coûtait environ 8 $ par mois. Le t3.small 17 $. Le t3.medium 33 $. Le t3.large environ 60 $. L'écart se creusait vite à mesure qu'on montait — pas linéairement, mais grosso modo en doublant à chaque palier de taille. Tom nota les chiffres, remarquant que chaque palier de taille doublait la mémoire — mais, curieusement, pas le nombre de CPU. Chaque t3 du micro au large avait les mêmes 2 vCPU ; le nombre n'augmentait pas avant le xlarge. Ce qui grandissait à chaque palier, c'était la **base de crédits CPU** — la part de ces vCPU que l'instance pouvait utiliser en continu sans épuiser ses crédits de rafale.

Tom écrivit « t3.micro » sur le tableau blanc et dessina une tête triste à côté.

**La conversation sur le bon dimensionnement**

Le t3.micro a tenu environ un mois avant que le trafic du vendredi soir ne l'écrase. Leo a fait la mise à niveau en vitesse — directement vers un t3.large, en se disant que trop gros était plus sûr que pas assez. Deux semaines après le passage au t3.large, Tom a signalé quelque chose.

« Le CPU est à 9 % », dit-il. « En moyenne. Sur les sept derniers jours. »

Leo regarda le graphique CloudWatch. 9 % de CPU en moyenne. Des pics à peut-être 35 % pendant le dîner du vendredi. Le reste du temps : à peine palpitant.

« On fait tourner un serveur à 60 $ par mois », dit Tom, « à 9 % de sa capacité. »

« Mais et les pics du vendredi ? » dit Leo. « Il nous faut de la marge. »

« Les pics du vendredi atteignent 35 % », dit Tom. « Un t3.small a les mêmes deux vCPU — ce qui est plus petit, c'est la base de crédits, environ 20 % soutenu. On a une moyenne de 9 %. Ça veut dire qu'on accumulerait des crédits CPU toute la journée, tous les jours, et qu'on en dépenserait une partie pendant quelques heures le vendredi soir. J'ai vérifié le calcul du `CPUCreditBalance` — le solde n'approche jamais du vide. C'est 17 $ par mois. On a de la marge. »

Leo regarda les chiffres. Il regarda le graphique. Il ressentit le malaise d'un ingénieur qui a surprovisionné et le sait.

« Mais et si on a un pic ? » dit-il.

« Alors les métriques nous le diront avant que ça fasse mal », dit Priya. « Et un jour on mettra en place Auto Scaling — c'est littéralement à ça que ça sert. Tu n'auras plus à provisionner pour le pic manuellement une fois que le système pourra ajouter des instances automatiquement. »

Ils redescendirent à un t3.small. La facture mensuelle baissa de 40 $. Sur un an, ça faisait 480 $ — pas rien, surtout pour une startup. Tom le nota dans sa feuille de calcul avec la satisfaction tranquille de quelqu'un qui attendait de marquer ce point depuis deux semaines.

Ce schéma a un nom : le **bon dimensionnement** (right-sizing). Cela signifie faire correspondre la taille de l'instance à la charge de travail réelle, pas au pire cas imaginé. Les outils AWS comme AWS Compute Optimizer et les métriques CloudWatch font du bon dimensionnement une décision basée sur les données plutôt qu'une supposition.

**L'AMI : L'état initial de votre machine**

Avant de lancer une instance EC2, vous choisissez son système d'exploitation et sa configuration initiale.
Dans AWS, cela s'appelle une **Amazon Machine Image** (AMI).

Une AMI est un modèle. Elle définit :

- Le système d'exploitation (Amazon Linux, Ubuntu, Windows Server, etc.)
- Les logiciels pré-installés
- L'état initial du disque

Quand vous lancez une instance depuis une AMI, AWS crée une copie fraîche de ce modèle
juste pour vous. Vous pouvez aussi créer vos propres AMI — si vous configurez un serveur exactement
comme vous le voulez, vous pouvez « sauvegarder » cet état comme une AMI personnalisée et l'utiliser pour lancer
des serveurs identiques rapidement. C'est ainsi que vous déployez des environnements cohérents à grande échelle.

Pensez à une AMI comme à une recette. La recette décrit le repas. Chaque fois que vous suivez la
recette, vous obtenez le même repas. Si vous voulez changer le repas de façon permanente, vous mettez à jour
la recette.

AWS fournit une place de marché d'AMI — certaines sont maintenues par AWS (Amazon Linux 2, Amazon
Linux 2023), certaines sont maintenues par les grandes distributions Linux (Ubuntu, Red Hat, SUSE),
et certaines proviennent de fournisseurs tiers (serveurs de bases de données préconfigurés, appliances
de sécurité, logiciels commerciaux). Pour la plupart des applications web, une AMI Amazon Linux
maintenue par AWS ou une AMI Ubuntu LTS est le bon point de départ.

Pour Nimbus, Leo a construit une AMI personnalisée qui partait de la dernière base Amazon Linux 2023
et ajoutait le runtime Node.js, les dépendances système de l'application, et un fichier de
service précréé pour le processus de l'application. Les nouvelles instances lancées depuis cette AMI commençaient
à servir du trafic en moins de 90 secondes — nettement plus vite que les quatre minutes de temps de
démarrage quand on utilisait des scripts UserData pour tout installer à partir de zéro.

Il y a un compromis : les AMI personnalisées doivent être maintenues. Chaque fois que vous mettez à jour une
dépendance système ou la version du runtime, vous devez reconstruire l'AMI. Les équipes qui laissent leurs
AMI devenir obsolètes se retrouvent à faire tourner des instances avec des logiciels périmés — un risque
de sécurité. Priya a mis « reconstruire l'AMI avec les derniers paquets » sur la liste de contrôle mensuelle d'ingénierie.

« Combien ça coûte de stocker des AMI ? » demanda Tom.

Les AMI sont stockées comme des instantanés EBS — vous payez le tarif d'instantané EBS (environ 0,05 $
par Go par mois) pour la taille de l'AMI. Une AMI Amazon Linux typique avec la pile applicative
Nimbus faisait environ 4 Go. À 0,05 $/Go : 0,20 $ par mois par AMI. Conserver cinq
AMI historiques à des fins de retour arrière : 1 $/mois. Pas un coût significatif.

**UserData : Le script d'amorçage**

Il y a une dernière option de configuration sur EC2 que Leo a découverte quand il essayait d'éviter de construire une nouvelle AMI à chaque fois que le code de l'application changeait.

Quand vous lancez une instance EC2, vous pouvez fournir un **script UserData** — un script shell qui s'exécute automatiquement quand l'instance démarre pour la première fois. Il s'exécute en tant que root, avant que l'instance ne soit considérée comme « prête ».

Pour Nimbus, le script UserData ressemblait à quelque chose comme ça :

```bash
#!/bin/bash
yum update -y
yum install -y nodejs npm git
git clone https://github.com/nimbus-app/server.git /opt/nimbus
cd /opt/nimbus
npm install
systemctl enable nimbus
systemctl start nimbus
```

Ce script installe Node.js, récupère le dernier code de l'application, installe les dépendances, et démarre le service de l'application. Chaque nouvelle instance qui se lance depuis l'AMI de base exécute ce script et démarre avec la version actuelle de l'application installée — automatiquement.

Cette approche signifie que l'AMI reste simple (juste un OS de base), et que UserData gère la mise en place de l'application. Le compromis : les scripts UserData prennent du temps à s'exécuter. Une instance peut prendre trois à cinq minutes pour démarrer et devenir prête. Pour les applications où le temps de démarrage compte — pour Auto Scaling, où vous avez besoin que les nouvelles instances soient prêtes rapidement — précuire l'application dans une AMI personnalisée réduit le temps de démarrage de façon significative.

« Ça ira », dit Leo, quand Priya l'interrogea sur le temps de démarrage.

« C'est quoi le temps de démarrage ? » demanda-t-elle.

« Quatre minutes. »

« Et pendant ces quatre minutes, l'instance tourne mais ne sert pas de trafic ? »

« Oui. »

« Donc pendant un pic de trafic soudain, on pourrait avoir quatre minutes où les nouvelles instances n'aident pas encore ? »

Leo regarda son script UserData. Il commença à regarder comment construire une AMI personnalisée.

**Paires de clés : La bonne façon d'accéder à un serveur**

Vous vous souvenez du désastre « Admin123 » du chapitre précédent ?

La bonne façon de se connecter à une instance EC2 est avec une **paire de clés**.

Une paire de clés est une paire cryptographique : une clé publique (stockée par AWS sur le serveur) et une
clé privée (un fichier que vous téléchargez et gardez secret). Pour se connecter, vous utilisez SSH — un protocole
sécurisé — avec votre clé privée. Pas de mot de passe. Si vous perdez la clé privée,
vous perdez l'accès. Il n'y a pas de « mot de passe oublié » pour SSH.

Ça importe parce que les paires de clés sont :

- Uniques pour vous
- Cryptographiquement impossibles à deviner
- Non stockées par AWS (vous gardez la clé privée)
- Faciles à révoquer (supprimez la clé du serveur, générez une nouvelle paire)

Priya avait déjà configuré l'accès par clé sur le serveur Nimbus. Le serveur Admin123
a été mis hors service. Personne n'en était triste.

« Et si quelqu'un essaie d'entrer par effraction et intercepte une paire de clés en transit ? » demanda Priya. Elle avait déjà trouvé la réponse : la clé privée ne voyage jamais sur le réseau. Vous la téléchargez une fois. Vous la gardez localement. Elle ne quitte jamais votre machine.

**Ce qui se passe si vous perdez la paire de clés**

Leo a posé cette question en semaine trois, avec l'énergie spécifique de quelqu'un qui n'a pas encore perdu sa paire de clés mais y pense.

« Si je perds le fichier de clé privée, qu'est-ce qui se passe ? »

« Tu perds l'accès SSH à l'instance », dit Priya.

« De façon permanente ? »

« Pas nécessairement. Mais le processus de récupération est désagréable. »

Le processus de récupération : arrêter l'instance, détacher son volume EBS racine, l'attacher à une autre instance à laquelle vous *avez* accès, monter le volume, ajouter une nouvelle clé publique au fichier `authorized_keys` sur le volume monté, détacher et rattacher à l'instance d'origine, redémarrer.

Ça fonctionne. Ça prend trente à soixante minutes et nécessite une exécution soignée. Une fausse étape et vous pouvez empirer les choses.

L'alternative, si votre application ne stocke rien de critique sur le volume racine (parce que vous avez suivi les conseils de ce livre et stocké les données dans S3 et EBS) : terminer l'instance et en lancer une fraîche depuis l'AMI. Générez une nouvelle paire de clés quand vous le faites.

« Stockez la clé privée quelque part de sécurisé », dit Priya. « Et jamais sur une instance EC2. »

Leo regarda son dossier de bureau intitulé `AWS_keys`. Puis Priya. Puis il déplaça le dossier vers son gestionnaire de mots de passe chiffré.

**Groupes de sécurité : Le pare-feu de votre instance**

Quand une instance EC2 se lance, elle a besoin d'un **groupe de sécurité** — un pare-feu virtuel qui contrôle quel trafic réseau peut l'atteindre et quel trafic elle peut envoyer.

Un groupe de sécurité a deux ensembles de règles : **entrant** (trafic qui arrive) et **sortant** (trafic qui part).

Par défaut, un nouveau groupe de sécurité bloque tout le trafic entrant et autorise tout le trafic sortant. Vous ajoutez des règles entrantes pour ouvrir des ports spécifiques à des sources spécifiques.

Pour le serveur web Nimbus, Priya a configuré :

- Autoriser le port TCP 443 (HTTPS) depuis `0.0.0.0/0` (tout l'internet)
- Autoriser le port TCP 80 (HTTP) depuis `0.0.0.0/0` (redirigé vers 443 dans l'application)
- Autoriser le port TCP 22 (SSH) depuis l'adresse IP du bureau uniquement — pas depuis l'internet

« Attends — mais *pourquoi* restreindrions-nous SSH à la seule IP du bureau ? » demanda Maya.

« Parce que si SSH est ouvert à tout l'internet », dit Priya, « des bots automatisés frapperont le port 22 en essayant des combinaisons de credentials vingt-quatre heures sur vingt-quatre. Nos logs se rempliront de tentatives échouées. Et s'il y a un jour une vulnérabilité dans le démon SSH lui-même, chaque attaquant dans le monde peut essayer de l'exploiter. »

« Mais et si Leo a besoin de se connecter depuis chez lui ? »

« VPN », dit Priya.

Leo avait déjà un VPN configuré. Il avait l'expression de quelqu'un à qui on avait déjà posé cette question.

La base de données vivait encore sur la même machine que l'application — mais Priya a préparé un groupe de sécurité séparé pour le jour où ce ne serait plus le cas : le port de la base de données ouvert uniquement au trafic provenant du groupe de sécurité du serveur web — pas depuis l'internet, pas depuis SSH (pour un accès direct à la BD), pas depuis nulle part ailleurs. En attendant, elle s'est assurée que le groupe de sécurité de l'instance partagée n'exposait pas du tout le port de la base de données à l'internet. La base de données serait invisible pour tout sauf l'application qui en avait besoin.

Pour atteindre directement la base de données, un attaquant devrait d'abord compromettre le serveur web. C'était la première couche de défense.

« Et la deuxième couche ? » demanda Tom.

« L'authentification IAM pour la base de données. Et le chiffrement en transit. »

Elle ajouta les deux à la liste de contrôle de configuration.

**Métadonnées d'instance EC2 et IMDSv2**

Il y a une dernière partie de la sécurité EC2 qui compte en pratique, même si elle est rarement expliquée dans le contenu d'introduction.

Quand une application tourne sur une instance EC2, elle peut interroger un endpoint interne spécial à `http://169.254.169.254/latest/meta-data/` pour récupérer des informations sur l'instance : son ID d'instance, sa Région, sa zone de disponibilité, et — surtout — les credentials IAM temporaires associés à tout Rôle IAM attaché.

C'est ainsi que l'application sur l'instance EC2 appelle les services AWS sans avoir de credentials codés en dur. Elle demande au service de métadonnées : « Quels credentials devrais-je utiliser en ce moment ? » Le service de métadonnées retourne des credentials temporaires qui expirent et se renouvellent automatiquement.

Le problème de sécurité : les anciennes versions de ce service de métadonnées (IMDSv1) répondaient à toute requête de tout processus sur l'instance. Si une application avait une vulnérabilité de falsification de requête côté serveur (SSRF) — un bug où un attaquant pouvait faire récupérer au serveur une URL de son choix — l'attaquant pouvait utiliser cette vulnérabilité pour récupérer `http://169.254.169.254/latest/meta-data/iam/security-credentials/` et obtenir les credentials IAM de l'instance.

Cette attaque a été utilisée dans de vraies brèches.

**IMDSv2** (Instance Metadata Service version 2) corrige cela en exigeant un jeton de session avant que le service de métadonnées ne réponde. Le jeton est obtenu via une requête PUT. Les attaques SSRF, qui utilisent typiquement des requêtes GET, ne peuvent pas accomplir l'étape PUT — donc elles ne peuvent pas obtenir le jeton, et les métadonnées ne sont pas retournées.

« Devrait-on activer IMDSv2 ? » demanda Leo.

« C'est le comportement par défaut pour les nouvelles instances maintenant », dit Priya. « Mais pour les instances existantes, vous devez l'activer. »

Elle l'a activé sur toutes les instances Nimbus existantes cet après-midi-là.

**Cycle de vie des instances : Pas pour toujours**

C'est quelque chose que beaucoup de débutants ratent.

Les instances EC2 ne sont pas permanentes par défaut. Quand vous arrêtez une instance, la ressource
de calcul est libérée. Quand vous la redémarrez, elle pourrait tourner sur un matériel physique différent.
Toutes les données stockées *sur l'instance elle-même* (sur son volume racine) survivent
à un cycle arrêt/démarrage — mais l'adresse IP publique change.

Quand vous *terminez* une instance, elle disparaît. À moins d'avoir un stockage séparé attaché
(que nous couvrons au Chapitre 6), toutes les données sur l'instance disparaissent.

Les quatre états dans lesquels une instance EC2 peut se trouver :

**Pending** (en attente) : L'instance démarre. Du matériel lui a été alloué mais elle n'a pas
fini de démarrer. Le script UserData s'exécute.

**Running** (en cours) : L'instance est active et accessible. Vous payez pour elle.

**Stopping/Stopped** (arrêt/arrêtée) : L'instance est éteinte. Le volume racine EBS est préservé.
Vous ne payez pas pour le calcul, mais vous payez toujours pour le stockage EBS attaché.

**Shutting-down/Terminated** (extinction/terminée) : L'instance est en cours de suppression. À moins que vous
n'ayez configuré les volumes EBS pour persister, leurs données sont perdues.

Cette « éphémérité » est en réalité une fonctionnalité, pas un défaut. Elle signifie que vous pouvez lancer
des serveurs, les utiliser, et les jeter. Elle permet la mise à l'échelle horizontale. Mais ça signifie
aussi que vous ne devriez jamais stocker de données importantes *sur* l'instance EC2 elle-même.

Où vivent alors les données ?

Dans un stockage séparé. Nous y arrivons dans les deux prochains chapitres.

Vous vous demandez peut-être : si une instance obtient une nouvelle adresse IP à chaque redémarrage, comment votre application garde-t-elle une adresse stable ? AWS a une solution appelée IP Elastic — une IP publique statique que vous possédez et qui reste la même même après les redémarrages. Une note sur le coût : depuis février 2024, AWS facture de petits frais horaires pour chaque adresse IPv4 publique — les IP Elastic (attachées ou non) et les IP publiques auto-assignées sur les instances de la même façon. L'IPv4 publique n'est plus gratuite, ce qui est une raison de plus de garder les instances dans des sous-réseaux privés derrière un répartiteur de charge.

Pour les applications derrière un répartiteur de charge — ce qui est la bonne architecture pour toute
application web de production — vous n'avez pas du tout besoin d'IP Elastic. Les utilisateurs se connectent au
nom DNS stable du répartiteur de charge. Le répartiteur de charge se connecte aux instances par leurs
adresses IP privées dans le VPC. Les instances peuvent aller et venir, obtenir de nouvelles IP, monter
et descendre en échelle — le répartiteur de charge gère tout cela de façon transparente. Les IP Elastic sont pour
des cas d'usage spécifiques : un serveur auquel les clients se connectent directement par IP, un hôte bastion
avec une adresse stable, une application qui n'est pas derrière un répartiteur de charge pour une
raison spécifique.

Leo prévoyait initialement d'utiliser des IP Elastic pour les serveurs web Nimbus. Priya a fait
remarquer qu'avec un répartiteur de charge, les adresses IP des serveurs web étaient sans importance pour les
clients externes. Le répartiteur de charge avait le nom DNS stable. Les instances derrière lui
étaient jetables par conception.

« Donc les IP Elastic sont pour l'exception, pas la règle », dit Leo.

« Correct », dit Priya. « Et si tu te vois en attraper une, demande-toi si l'architecture ne devrait pas
plutôt avoir un répartiteur de charge. »

**Ce que signifie « Élastique »**

Nous avons dit qu'EC2 signifie Elastic Compute Cloud. Qu'est-ce qui est élastique là-dedans ?

Deux choses :

**Élasticité verticale** : Vous pouvez changer la taille d'une instance. Arrêtez l'instance,
passez de `t3.micro` à `t3.xlarge`, redémarrez. Plus de CPU et de mémoire, même
application, même configuration.

**Élasticité horizontale** : Vous pouvez ajouter plus d'instances. Au lieu d'un grand serveur,
faites tourner dix serveurs moyens derrière un répartiteur de charge. Quand le trafic baisse, supprimez des instances
et arrêtez de les payer.

Les deux approches résolvent le problème « un seul serveur, trop de trafic ». Elles ont des
compromis différents, que nous explorons au Chapitre 7 quand nous ajoutons Auto Scaling à l'histoire.

L'insight clé : avec EC2, la puissance de calcul est quelque chose que vous *modulez* plutôt que quelque chose que vous
*achetez*. Besoin de plus ? Tournez le bouton vers le haut. Besoin de moins ? Tournez-le vers le bas. Payez en conséquence.

Maya regarda le tableau des types d'instances. « Si on peut juste rendre le serveur plus gros, pourquoi s'embêter avec dix moyens ? »

« Parce que », dit Leo, « un gros serveur reste un seul serveur. S'il tombe, tout tombe. Dix serveurs moyens signifient qu'un peut tomber en panne et neuf continuent à tourner. »

« Et », ajouta Priya, « on ne peut pas rendre un serveur plus gros sans le redémarrer. Dix petits signifient qu'on peut en ajouter d'autres sans toucher à ceux qui tournent. »

Tom avait déjà écrit « redémarrage = indisponibilité » dans son carnet.

## Forces et limites

**Pourquoi EC2 est puissant** :

- Contrôle total. Vous choisissez l'OS, les logiciels, la configuration. C'est votre ordinateur.
- Dimensionnement flexible. Des centaines de types d'instances pour chaque cas d'usage.
- Pas de matériel à gérer. AWS gère la couche physique.
- Facturation à la seconde, avec un minimum de 60 secondes, pour les AMI Amazon Linux, Windows et Ubuntu. (Certaines AMI Linux commerciales, comme RHEL et SUSE, facturent encore à l'heure — vérifiez les conditions de facturation de l'AMI.) Vous arrêtez l'instance, vous arrêtez de payer.
- Fonctionne avec tout. EC2 est la fondation sur laquelle la plupart des autres services AWS sont construits.
- Plusieurs modèles de tarification (À la demande, Réservé, Spot) permettent une optimisation des coûts significative
  pour les charges de travail prévisibles ou flexibles — couverts en détail au Chapitre 27.

**Là où ça se complique** :

- Vous êtes responsable du patch et de la mise à jour du système d'exploitation. (Modèle de responsabilité
  partagée — c'est la partie « dans le cloud » qui vous appartient.)
- Le patch de l'OS n'est pas optionnel. Les instances EC2 non patchées sont l'un des vecteurs d'attaque
  les plus courants dans les brèches cloud. AWS Systems Manager Patch Manager peut automatiser
  ça — mais vous devez le configurer et le surveiller.
- Gérer EC2 à grande échelle signifie gérer l'état des instances, les AMI, les correctifs de sécurité et
  le cycle de vie à travers potentiellement des milliers de machines. C'est une charge opérationnelle.
- EC2 n'est pas la bonne réponse à tout. Pour du code piloté par événements qui s'exécute
  rarement, Lambda (Chapitre 20) est moins cher et plus simple. Pour les charges de travail conteneurisées,
  ECS et EKS (Chapitre 21) offrent une meilleure efficacité des ressources.
- Les instances inutilisées coûtent toujours de l'argent. Si vous arrêtez une instance, vous arrêtez de payer
  pour le calcul — mais si vous avez du stockage attaché, vous payez toujours pour ça.

**Le jugement du quand-ne-pas-utiliser-EC2** : EC2 vous donne un contrôle maximal — mais le contrôle a un coût opérationnel. Chaque instance EC2 que vous faites tourner est quelque chose que vous devez patcher, surveiller, et finalement remplacer. Pour les applications qui s'exécutent rarement (Lambda est moins cher), pour les applications qui ont besoin de monter horizontalement à des dizaines ou des centaines d'instances (les conteneurs sont plus efficaces), ou pour les bases de données et autres charges managées (RDS, ElastiCache), les services entièrement managés éliminent une charge opérationnelle significative pour un modeste surcoût. EC2 est le bon choix quand vous avez besoin du contrôle qu'il fournit — pas par défaut.

Priya avait une heuristique : « Si on serait satisfaits d'un service managé qui fait ce dont on a besoin, utilisez le service managé. Utilisez EC2 quand l'option managée n'existe pas ou ne convient pas. »

Leo a d'abord résisté à ça. « Mais EC2 nous donne plus d'options. »

« Les options sont une charge », dit Priya. « On n'a pas besoin de chaque option. On a besoin de la bonne configuration, maintenue de façon fiable. »

**Groupes de placement EC2 : Contrôler où atterrissent les instances**

EC2 vous donne le contrôle sur ce qu'est votre instance — sa taille, son OS, sa configuration. Il vous donne aussi un contrôle limité sur *où* elle atterrit physiquement, via une fonctionnalité appelée **groupes de placement**.

Par défaut, AWS répartit les instances sur le matériel physique pour maximiser la disponibilité. Mais pour certaines charges de travail, vous voulez surcharger ce comportement par défaut — soit pour rapprocher les instances, soit pour garantir qu'elles restent éloignées.

Trois types de groupes de placement :

**Cluster** : Regroupe les instances étroitement dans une seule Zone de disponibilité, typiquement sur le même rack physique ou un matériel adjacent. Le résultat est la latence réseau la plus basse et le débit réseau le plus élevé entre les instances du groupe — avec un débit réseau de 10 Gbps ou plus entre les instances (ne confondez pas cela avec le Enhanced Networking/ENA, qui est une fonctionnalité réseau par instance indépendante des groupes de placement). C'est le choix pour le HPC (calcul haute performance), les tâches d'entraînement ML à grande échelle, et les charges parallèles étroitement couplées où les instances passent beaucoup de temps à s'envoyer des données. Le compromis est la disponibilité : si le segment matériel sous-jacent tombe en panne, toutes les instances du cluster peuvent être affectées simultanément.

**Partition** : Divise les instances entre des partitions logiques, où chaque partition se trouve sur son propre ensemble de matériel — racks séparés, alimentation séparée, switches réseau séparés. Les instances au sein d'une partition partagent du matériel entre elles, mais les partitions ne partagent jamais de matériel avec d'autres partitions. Cette conception limite le rayon de l'explosion d'une panne matérielle : un rack qui tombe affecte une partition mais pas les autres. Les groupes de placement par partition sont conçus pour les grandes charges distribuées et répliquées — Apache Hadoop, Apache Cassandra, Apache Kafka — où vous voulez assez d'isolation des pannes pour qu'une panne au niveau d'un rack ne fasse pas tomber tout votre cluster.

**Spread** : Place chaque instance sur un matériel sous-jacent complètement séparé. Isolation maximale entre les instances. Si vous avez cinq instances d'application critiques qui ne doivent jamais partager un hôte physique (parce qu'une seule panne matérielle ne devrait jamais faire tomber plus d'une), Spread est la réponse. La limite : **7 instances par Zone de disponibilité par groupe de placement**. Spread est conçu pour de petits nombres d'instances critiques qui ne peuvent pas tolérer la colocation, pas pour de grandes flottes.

« Donc Cluster c'est pour la vitesse, Spread c'est pour l'isolation, et Partition c'est pour les systèmes distribués qui ont besoin à la fois d'un peu de regroupement et d'un peu d'isolation ? » demanda Maya.

« Assez proche », dit Priya. « Cluster : faible latence entre les instances, un gros risque. Spread : isolation maximale, limite stricte de sept par AZ. Partition : isolation structurée pour les grands systèmes distribués — tu contrôles dans quelle partition va chaque instance. »

Pour l'architecture actuelle de Nimbus, aucun de ceux-ci ne s'appliquait encore. Mais savoir qu'ils existaient signifiait savoir quand y recourir — et plus immédiatement, savoir ce qu'une question d'examen sur des « charges HPC qui ont besoin d'une faible latence inter-nœuds » demandait réellement.

## Résumé

Une instance lancée par accident n'allait jamais être un serveur de production. Comprendre EC2 correctement n'a pas seulement résolu le problème de capacité — cela a introduit un nouvel ensemble de concepts qui reviendraient dans presque tous les chapitres suivants. Les types d'instances, les AMI, les paires de clés, les groupes de sécurité, et le bon dimensionnement ne sont pas des anecdotes sur EC2 ; c'est le vocabulaire sur lequel le reste du livre est construit. Apprenez-les ici et tout le reste prend plus de sens.

- Une **instance EC2** est une machine virtuelle que vous louez dans AWS. Les types d'instances sont organisés par cas d'usage : usage général, optimisé pour le calcul, optimisé pour la mémoire, optimisé pour le stockage. Choisissez la bonne famille et dimensionnez selon les métriques réelles de la charge de travail — pas selon le pire cas imaginé.
- Une **AMI** (Amazon Machine Image) est le modèle pour l'OS et la configuration initiale de votre instance. Les AMI personnalisées permettent des déploiements cohérents et reproductibles.
- Les **paires de clés** sont la façon sécurisée d'accéder aux instances EC2. Les **groupes de sécurité** sont le pare-feu de votre instance — restreignez SSH à des IP connues et verrouillez les ports de base de données au seul groupe de sécurité de l'application.
- **IMDSv2** devrait être activé sur toutes les instances pour protéger contre le vol de credentials basé sur SSRF depuis le service de métadonnées d'instance.
- Les instances EC2 ne sont pas permanentes par défaut. Les instances terminées perdent leurs données locales — stockez les données importantes dans S3 ou EBS, pas sur le disque de l'instance.

## Conseils pour l'examen

*Domaine SAA-C03 3 — Tâche 3.2 (solutions de calcul performantes)*

- **Responsabilité partagée pour EC2** : Vous êtes responsable du patch de l'OS.
  AWS maintient le matériel physique et l'hyperviseur. C'est une distinction fréquemment testée.
- **Les familles d'instances comptent pour les questions de scénario.** Si un scénario mentionne des
  exigences de mémoire élevée (cache en mémoire, SAP HANA), la réponse implique probablement une
  instance optimisée pour la mémoire. Si elle mentionne le traitement par lots ou HPC, optimisé pour le calcul.
- **Arrêter ≠ Terminer.** Arrêter une instance la préserve (vous pouvez la redémarrer).
  La terminer la supprime. Les scénarios d'examen testent si vous connaissez cette distinction.
- **L'IP publique change au redémarrage.** Si votre application a besoin d'une adresse IP stable,
  utilisez une **IP Elastic** — une IP publique statique qui reste associée à votre compte.
  Depuis février 2024, AWS facture chaque adresse IPv4 publique à l'heure — les IP Elastic
  (attachées ou non) et les IP publiques auto-assignées de la même façon.
- Les modèles de tarification **À la demande, Réservé et Spot** sont largement testés dans le Domaine 4.
  Nous les couvrons au Chapitre 27. Pour l'instant, sachez qu'À la demande signifie payer à la seconde
  sans engagement.
- **Les groupes de sécurité sont à état (stateful).** Si vous autorisez le trafic entrant sur un port, le
  trafic de retour est automatiquement autorisé sans règle sortante explicite. Les NACL
  (couvertes au Chapitre 15) sont sans état — elles nécessitent à la fois des règles entrantes et sortantes.
- **Groupes de placement :** Cluster = latence la plus basse entre les instances (HPC, entraînement ML — mais risque de point de défaillance unique pour le groupe) ; Partition = systèmes distribués (Hadoop, Kafka, Cassandra) avec isolation des pannes par partition ; Spread = isolation maximale des instances, max 7 par AZ. Schéma de question d'examen : « charge HPC étroitement couplée a besoin d'un débit réseau maximal entre les nœuds » → groupe de placement Cluster.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce qu'une instance EC2 ? Qu'est-ce qu'une AMI ? Quelle est la relation
entre les deux ?

*(Indice : Pensez à l'analogie de la recette — qu'est-ce qui est la recette, et qu'est-ce qui est le repas ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise déploie une application web à fort trafic. L'application
gère des recherches dans un catalogue de produits avec une logique de filtrage complexe qui est intensive en CPU.
L'équipe prévoit des pics de trafic significatifs lors des événements de vente. Elle veut s'assurer
de choisir le bon type d'instance EC2 et d'être prête pour les pics de trafic.

Quelle combinaison de choix correspond LE MIEUX à leurs exigences ?

A) Des instances optimisées pour la mémoire avec un nombre fixe pour assurer des performances cohérentes  
B) Des instances optimisées pour le calcul avec Auto Scaling pour gérer les pics de trafic  
C) Des instances d'usage général avec une seule grande taille d'instance  
D) Des instances optimisées pour le stockage parce que le catalogue de produits nécessite un accès disque rapide

**Indice 1** : La charge de travail est décrite comme « intensive en CPU ». Quelle famille d'instances est
optimisée pour le CPU ?

**Indice 2** : Le scénario mentionne « des pics de trafic lors d'événements de vente ». Un nombre fixe
d'instances ne gérera pas efficacement un trafic variable. Quelle fonctionnalité AWS gère ça ?

**Indice 3** : Les instances optimisées pour le calcul gèrent le travail intensif en CPU. Auto Scaling ajoute
et supprime des instances en fonction de la demande. Ensemble, ils répondent aux deux exigences.

**Réponse** : B

**Explication** : Les instances optimisées pour le calcul (comme la famille `c`) fournissent plus de CPU
par dollar pour les charges de travail intensives en CPU. Auto Scaling ajuste automatiquement le nombre
d'instances en fonction de la charge — ajoutant des instances lors des événements de vente, les supprimant quand
le trafic revient à la normale. Cette combinaison optimise à la fois les performances et les coûts.

**Pourquoi pas A ?** Les instances optimisées pour la mémoire sont conçues pour les charges de travail qui nécessitent de grandes
quantités de RAM (bases de données, caches en mémoire). C'est une charge de travail liée au CPU. Et un nombre fixe
d'instances signifie soit du surprovisionnement (gaspillage) soit du sous-provisionnement (échec).

**Pourquoi pas C ?** Les instances d'usage général sacrifient une certaine efficacité CPU pour l'équilibre. Pour
une charge de travail connue intensive en CPU, l'optimisé pour le calcul est plus approprié. Et une seule
grande instance est un point de défaillance unique.

**Pourquoi pas D ?** Le goulot d'étranglement est le CPU, pas l'I/O disque. Les instances optimisées pour le stockage
sont conçues pour les charges de travail qui nécessitent un débit très élevé vers le stockage local.

*Domaine SAA-C03 3 — Tâche 3.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus fait actuellement tourner une seule instance EC2 `t3.micro` pour toute l'application.
L'équipe doit décider : passer à une instance plus grande (`t3.2xlarge`) ou ajouter plus
d'instances `t3.micro` derrière un répartiteur de charge ?

Analysez les compromis. Quels sont les avantages de chaque approche ? Quelles
questions poseriez-vous pour décider ? (Indice : pensez aux points de défaillance uniques,
aux coûts, à la complexité du déploiement et à ce qui se passe pendant la maintenance.)

*(Il n'y a pas de réponse unique correcte. Il s'agit de raisonner sur la mise à l'échelle verticale vs horizontale.)*

## Scène post-générique

Leo a passé l'après-midi à exécuter la réduction de taille. Il est passé du `t3.large` à un `t3.small`,
en utilisant les données de bon dimensionnement que Tom avait recueillies de CloudWatch. Le CPU s'est stabilisé autour de
12 % en charge normale. Les pages se chargeaient en moins d'une seconde.

Tom regardait la facture AWS se mettre à jour en temps réel. Le t3.small coûtait encore environ deux fois plus par heure que le micro d'origine — mais un tiers du t3.large qu'ils avaient surpayé. Il prit une note : *40 $/mois économisés vs le t3.large précédent. Bonne décision.*

Maya regardait quelque chose d'autre sur son écran.

« Leo », dit-elle. « Pendant que tu redimensionnais l'instance, le site web était en panne pendant
douze minutes. »

Leo leva les yeux.

« On avait une file de deux cents commandes non satisfaites. »

Il regarda l'écran. Puis le plafond. Puis de nouveau l'écran.

« Il nous faut quelque chose pour nos images », dit-il, changeant légèrement de sujet. « En ce moment,
les photos de menus téléchargées sont sauvegardées directement sur le serveur. Si on redimensionne ou
redémarre l'instance, on les perd ? »

Priya connaissait déjà la réponse.

Dans le prochain chapitre : où vivent les fichiers quand il n'y a pas de disque dur à pointer.
