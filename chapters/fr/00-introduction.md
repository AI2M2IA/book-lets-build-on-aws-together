# Chapitre 0 : Avant de commencer

Maya se tenait derrière le comptoir du restaurant familial un vendredi soir quand
la pensée l'a frappée.

Ils étaient ouverts depuis quatre ans. La nourriture était bonne — les gens traversaient
la ville pour l'arepa. Mais chaque fois que quelqu'un appelait pour passer une commande,
la ligne était occupée. Chaque fois que quelqu'un venait chercher de la nourriture qu'il
n'avait jamais vraiment commandée, c'était parce qu'il avait appelé et abandonné.

Des commandes étaient perdues. L'argent sortait par la porte avant même d'entrer.

Et le pire, c'est que personne ne pouvait pointer du doigt un seul échec dramatique.

Rien n'avait explosé. Rien n'avait planté. Il n'y avait pas de méchant, pas de bannière
de panne, pas d'écran cassé évident.

C'était juste de la friction. Une friction petite, silencieuse et coûteuse.

« On perd des commandes chaque vendredi », dit Maya pour personne en particulier. « Pas parce que la nourriture est mauvaise. Parce que personne ne peut nous joindre. Il nous faut un site web. »

Son cousin Tom leva les yeux de la feuille de calcul qu'il mettait à jour à la main.
Tom — un ancien administrateur systèmes qui avait troqué les salles de serveurs contre
l'entreprise familiale — gérait les « systèmes » du restaurant — un mot généreux pour
désigner un Google Sheet partagé et un tableau blanc — depuis deux ans.

« Un site web », répéta-t-il. « Et où est-ce qu'un site web vit, exactement ? »

Maya ouvrit la bouche. La referma.

Elle n'en avait aucune idée.

**Une question qui semble simple**

Où vit un site web ?

Vous n'y avez probablement jamais réfléchi. La plupart des gens ne l'ont pas fait. Vous
tapez une adresse dans un navigateur, une page apparaît, et quelque part entre ces deux
événements, la magie opère.

Jusqu'au jour où c'est vous qui payez pour la magie.

Mais ce n'est pas de la magie. Ce sont des ordinateurs.

Quelque part dans le monde, en ce moment même, il existe un ordinateur physique — un
serveur — qui stocke les fichiers qui composent ce site web. Quand vous demandez à votre
navigateur la page, votre requête traverse l'internet, atteint cet ordinateur, et
l'ordinateur vous renvoie les fichiers.

C'est tout. C'est un site web.

La vraie question est donc : l'ordinateur de *qui* ?

Cette question a conduit Maya au tableau blanc. Et le tableau blanc a conduit à tout le reste.

**Trois options, un problème**

De retour au restaurant, Maya et Tom ont esquissé les options sur le tableau blanc.

**Option un** : Acheter un ordinateur, l'installer dans le restaurant, et faire tourner
le site web depuis là. On appelle ça faire tourner « sur site » (on-premises) — vos
propres locaux, vos propres machines. Vous verrez ce terme tout au long du livre.

Tom a écrit « facture d'électricité » et « que se passe-t-il si ça casse » à côté de
cette option. Puis il s'est arrêté et s'est mis à rechercher réellement les prix sur son
téléphone. Un serveur capable de gérer une application web modeste coûtait entre huit
cents et deux mille dollars à l'achat. Ajoutez un onduleur de secours, un switch managé
et un boîtier pare-feu, et vous approchiez les quatre mille dollars avant d'avoir payé
une seule heure de fonctionnement. Venaient ensuite la facture d'électricité, les besoins
en refroidissement, et le fait qu'il fallait remplacer le matériel tous les trois à cinq ans.

« Combien ça coûte par mois si on tient compte de tout ? » demanda Tom, plus à lui-même qu'à Maya.

Il a fait les calculs. Un serveur à 2 000 $ amorti sur quatre ans : environ 42 $ par mois.
Une consommation électrique 24 h/24 et 7 j/7 entre 300 et 500 watts : à peu près 25 à 40 $
par mois. Une connexion internet professionnelle capable de gérer un vrai trafic : 100 à
300 $ par mois. Et en plus, tous les trois à cinq ans, il fallait tout recommencer. Le
matériel ne dure pas éternellement.

« Donc entre 170 et 400 $ par mois », dit Tom, « avant de payer qui que ce soit pour le réparer quand ça casse. Et ça cassera. »

« Que se passe-t-il si ça casse à 23 h un vendredi ? » demanda Maya.

Tom savait comment réparer un serveur — il avait passé des années à faire exactement
cela, dans une vie antérieure d'administrateur systèmes. C'était bien le problème. Il
savait précisément ce que cela signifiait d'être la seule personne capable de réparer la
machine : les appels téléphoniques à 2 h du matin, les week-ends perdus à cause de disques
en panne, les vacances écourtées parce qu'une alimentation avait lâché. Maya ne pouvait
pas le faire, et Tom ne voulait pas être le point de défaillance unique du point de
défaillance unique. Le restaurant s'éteindrait. Les commandes s'arrêteraient. Et il n'y
avait aucune redondance — une seule machine, aucun plan de secours.

« Et si on grandit vite ? » ajouta Maya. « On achèterait le serveur pour le volume
d'aujourd'hui, et si on a besoin de trois fois la capacité dans six mois ? Il faudrait
acheter plus de matériel, attendre la livraison, l'installer... »

Tom a ajouté « ne peut pas évoluer », « coût de remplacement » et « qui le répare à 2 h du
matin » à l'option un. La colonne s'allongeait.

**Option deux** : Payer une société d'hébergement pour faire tourner un petit serveur
pour eux. Pas cher, simple. Ça marchait pour les blogs personnels en 2008. Probablement
pas assez flexible pour une entreprise en croissance.

« Et si on reçoit soudainement mille commandes à la fois ? » demanda Maya.

Tom ajouta « ne peut pas évoluer » à l'option deux.

Il avait examiné quelques formules d'hébergement mutualisé pendant ses recherches. Huit
dollars par mois, douze dollars par mois. Mais chaque formule avait des limites strictes :
espace disque, bande passante, connexions simultanées. Une formule populaire vantait une
« bande passante illimitée » dans son titre, puis enterrait la politique de bridage quatre
paragraphes plus loin dans les conditions d'utilisation. Cent visiteurs simultanés et le
service se dégradait. Deux cents et le site tombait.

« Ce n'est pas illimité », dit Tom. « C'est "illimité jusqu'à ce que ça compte". »

Un serveur dédié chez un hébergeur était plus prometteur — 80 à 200 $ par mois pour quelque
chose de réel — mais l'équipe devrait quand même le configurer et le maintenir elle-même.
Et ils achèteraient toujours un plafond fixe, sans réponse élastique à la demande.

« Chaque jour où on est en sous-capacité, on gaspille de l'argent », dit Maya. « Chaque
jour où on est en surcapacité, on perd des clients. Il n'y a aucun moyen d'être exactement
juste. »

« À moins que le plafond bouge avec nous », dit Tom.

Il ne l'avait pas voulu comme une transition, mais c'était la bonne.

**Option trois** : Autre chose. Quelque chose dont ils entendaient parler. Quelque chose
qu'on appelait « le cloud ».

Tom a dessiné un nuage sur le tableau blanc. Un nuage littéral, comme le dessin d'un
enfant.

« Je ne sais pas vraiment ce que ça veut dire », admit-il.

« Moi non plus », dit Maya.

C'était le début de tout.

**Ce qu'est vraiment « le cloud »**

Réglons ça immédiatement, car le mot « cloud » est l'un des termes les plus usités et
les moins expliqués dans la technologie.

Le cloud n'est pas un endroit magique où vos données flottent.

Le cloud, c'est les ordinateurs de quelqu'un d'autre.

C'est tout. Quand vous sauvegardez une photo sur iCloud ou Google Drive, votre photo
est stockée sur un ordinateur physique appartenant à Apple ou Google, posé dans un
bâtiment quelque part. Quand vous utilisez Netflix, la vidéo que vous regardez est
envoyée depuis des serveurs physiques dans des centres de données à travers le monde.

Le « cloud » signifie simplement : des ordinateurs auxquels vous accédez via internet,
que vous n'avez pas à posséder ou maintenir vous-même.

Et Amazon — oui, la société qui livre des colis — a construit l'une des plus grandes
collections de ces ordinateurs dans le monde. Ils l'appellent Amazon Web Services,
ou AWS.

**L'analogie du réseau électrique**

Voyez-le comme le réseau électrique.

Il y a cent ans, si vous vouliez faire tourner une usine, vous construisiez votre propre
centrale électrique. Vous embauchiez des ingénieurs pour la faire fonctionner. Vous payiez
le carburant, la maintenance, l'expertise nécessaire pour garder les lumières allumées. Si
le générateur tombait en panne, votre usine s'arrêtait. Si la demande augmentait, il
fallait construire un générateur plus gros — un processus coûteux et lent qui exigeait de
prédire la demande future des années à l'avance et d'engager des capitaux avant de savoir
si vous en aviez besoin.

Puis le réseau électrique est arrivé, et la donne a complètement changé.

Vous vous branchiez au réseau et payiez exactement l'électricité que vous consommiez.
Pas de centrale. Pas de personnel de maintenance. Pas de contrats de carburant. La capacité
était là quand vous en aviez besoin. Vous ne payiez pas quand vous n'en aviez pas besoin.
Vous pouviez démarrer un petit atelier et devenir une grande usine sans faire de pari en
capital sur une échelle future incertaine.

Le cloud computing, c'est la même idée appliquée à l'informatique. AWS a construit la
centrale électrique — en réalité, des milliers de centrales dans des dizaines de pays,
exploitées par des équipes d'ingénieurs dont la seule raison d'être professionnelle est de
maintenir ces machines en marche. Les entreprises se branchent et paient ce qu'elles
utilisent. L'infrastructure est partagée, maintenue par des professionnels, et disponible à
la demande. Vous arrêtez de vous soucier de la couche physique et vous concentrez sur ce
que vous construisez réellement.

Il y a une différence avec l'analogie électrique qui mérite d'être nommée : l'électricité
est une seule chose. Le cloud computing existe en de nombreuses variétés. Stockage, calcul,
bases de données, réseau, apprentissage automatique, sécurité — chaque type de ressource a
sa propre tarification, ses propres compromis, et ses propres cas d'usage appropriés. Le
réseau délivre une seule chose de manière uniforme. AWS délivre un catalogue de centaines
de services. Ce livre est votre guide de ce catalogue, en commençant par les services qui
comptent le plus.

**Pourquoi Amazon ?**

C'est une question légitime. Amazon a commencé comme une librairie.

Voici ce qui s'est passé : Amazon a grandi si vite qu'ils avaient besoin d'une quantité
énorme de puissance de calcul pour faire tourner leurs propres systèmes. Ils ont
construit des centres de données. Ils ont embauché des ingénieurs pour les gérer. Ils
sont devenus très, très bons pour faire tourner des ordinateurs à grande échelle.

Puis quelqu'un chez Amazon a eu une idée : et si on vendait l'accès à toute cette
puissance de calcul à d'autres personnes ?

En 2006, Amazon Web Services a été lancé. Aujourd'hui, AWS fait tourner une part
significative d'internet. Le site que vous utilisez pour réserver des vols, l'application
qui suit votre livraison, le service de streaming que vous avez regardé hier soir —
il y a de bonnes chances qu'au moins une partie tourne sur AWS.

Ce n'est pas un monopole. Google Cloud et Microsoft Azure sont des concurrents sérieux.
Mais AWS est arrivé en premier, est important, et c'est ce dont parle ce livre.

**Rencontrez l'équipe**

Maya n'a pas construit Nimbus seule.

Elle a appelé Tom en premier — évidemment. Tom avait les feuilles de calcul, les
contacts fournisseurs, et l'entêtement nécessaire pour vraiment exécuter une idée.

Tom était du genre à lire les conditions d'utilisation. Pas parce qu'il avait peur, mais
parce qu'il croyait que comprendre ce qu'une chose coûte réellement — en argent, en risque,
en temps — était la seule façon de prendre une bonne décision. Les colonnes du tableau
blanc, avec leurs listes croissantes d'objections, n'étaient pas du pessimisme. C'était Tom
qui faisait ce que Tom faisait toujours : chiffrer le monde réel avant de s'engager dans
quoi que ce soit. Il demandait « combien ça coûte par mois ? » à des moments où tout le
monde était encore enthousiasmé par ce qu'une chose pouvait faire. Cela faisait
régulièrement économiser de l'argent à l'entreprise, et empêchait occasionnellement des
catastrophes avant qu'elles puissent être catégorisées comme telles.

Tom connaissait un développeur. Leo. Vingt-quatre ans, autodidacte, le genre de personne
qui a déjà construit un prototype avant que vous ayez fini d'expliquer le problème. Il
est arrivé à leur première réunion avec un ordinateur portable et une application
à moitié terminée.

« Je l'ai déjà déployée — oh », dit-il en ouvrant l'écran. L'expression de son visage
indiquait clairement qu'il avait trouvé quelque chose d'inattendu. « Je crois que je l'ai
déployée quelque part. »

Il l'avait fait. Sur un serveur qu'il ne comprenait pas entièrement, dans une région
qu'il n'avait pas choisie intentionnellement, faisant tourner un code qui casserait
définitivement sous charge.

Ils l'ont adopté immédiatement.

Leo allait vite. Parfois trop vite. Il avait le don du développeur pour construire des
choses qui marchaient et l'angle mort du développeur pour les choses qui marchaient
*maintenant* mais accumulaient silencieusement de la dette technique. Il traitait les
messages d'erreur comme certains traitent les étiquettes d'avertissement — informatifs mais
pas nécessairement contraignants. Sa réponse par défaut à un problème potentiel était « ça
ira », et il avait raison assez souvent pour qu'il faille un certain temps avant que
l'équipe apprenne à s'inquiéter quand il le disait avec ce ton particulier de certitude
désinvolte qui signifiait qu'il n'avait pas réellement vérifié.

Priya est arrivée plus tard — recommandée par un ami commun. Diplôme d'informatique,
spécialisation en sécurité, le genre de personne qui lit des post-mortems de célèbres
échecs technologiques les soirs de week-end. Elle avait une question à sa première réunion.

« Est-ce que quelqu'un a réfléchi à ce qui se passerait si quelqu'un essayait d'entrer
par effraction ? »

Silence.

« Bienvenue dans l'équipe », dit Maya.

La version de l'enthousiasme chez Priya, c'était un modèle de menaces détaillé. Elle
appréciait sincèrement le processus de revue d'architecture. C'était elle qui lisait les
livres blancs de sécurité d'AWS et surlignait les sections pertinentes avant que quiconque
ne le lui demande. Elle était aussi, l'équipe allait le découvrir, systématiquement dans le
vrai sur les choses auxquelles ils n'avaient pas encore pensé. Elle posait des questions
comme un bon ingénieur en structure vérifie les murs porteurs — non pas parce qu'elle
s'attendait à ce qu'ils lâchent, mais parce que la seule façon de savoir qu'ils sont
solides est de regarder attentivement et de documenter ce qu'on trouve.

« A-t-on réfléchi à ce qui se passerait si... » est la façon dont Priya commençait la
plupart de ses contributions. Avec le temps, l'équipe a compris que cette question, plus
que toute autre, était la façon dont les catastrophes étaient évitées avant de pouvoir
devenir des incidents.

Ensemble, tous les quatre ont fait quelque chose qui marchait. Maya voyait le produit. Tom
surveillait les coûts. Leo le construisait. Priya le sécurisait. Le livre que vous lisez
est le récit de ce qu'ils ont appris.

**Ce qu'est ce livre**

C'est l'histoire de Nimbus.

Nimbus a commencé comme un système de commande de restaurant et est devenu quelque
chose de beaucoup plus grand. En grandissant, il a rencontré tous les problèmes que
rencontrent les logiciels en croissance : des systèmes qui ne pouvaient pas gérer le
trafic, des données qui se perdaient, des serveurs qui tombaient aux pires moments
possibles, des coûts qui augmentaient plus vite que les revenus.

Et chaque fois qu'ils rencontraient un problème, ils trouvaient un service AWS conçu
pour résoudre exactement ce type de problème.

Ce livre vous enseigne AWS en suivant ce parcours.

Vous apprendrez non seulement *ce que* fait chaque service, mais *pourquoi* il existe,
*quand* l'utiliser, et — tout aussi important — *quand ne pas l'utiliser*. Chaque outil
a des compromis. Chaque décision a des coûts. C'est ce que les ingénieurs seniors
comprennent et que les ingénieurs juniors sont encore en train d'apprendre.

Quand vous aurez terminé ce livre, vous serez prêt à passer l'examen AWS Solutions
Architect Associate (SAA-C03). Mieux encore : vous serez prêt à entrer dans une vraie
conversation technique et à vous y tenir.

C'est la promesse.

Voici à quoi cela ressemble en pratique, section par section.

**Chapitres 1 à 5 : Les fondations**. Quand vous arriverez à la fin du chapitre 5, vous
comprendrez ce qu'est réellement le cloud computing et pourquoi il existe, comment contrôler
qui a accès à votre compte AWS et pourquoi le compte root terrifie les ingénieurs en
sécurité, où vivent vos serveurs et pourquoi la géographie compte, ce que sont les instances
EC2 et comment les dimensionner, et comment stocker des fichiers dans le cloud sans les lier
à une seule machine. Ces chapitres couvrent les concepts que tout architecte AWS tient pour
acquis — mais que personne n'explique assez clairement la première fois.

**Chapitres 6 à 10 : Données et échelle**. Cette section porte sur ce qui se passe quand
votre application grandit. Vous verrez Nimbus heurter le mur de la mise à l'échelle — un
serveur, trop d'utilisateurs, pas de marge de croissance — et les regarderez le résoudre
avec des répartiteurs de charge, l'auto scaling, des bases de données managées et la mise en
cache. À la fin de cette section, vous comprendrez comment les vrais systèmes de production
gèrent une charge variable et pourquoi la base de données est presque toujours le premier
goulot d'étranglement.

**Chapitres 11 à 17 : Réseau et sécurité**. Les concepts ici semblent abstraits jusqu'à ce
que vous en ayez besoin. VPC, groupes de sécurité, DNS, gestion des certificats, gestion des
clés. À la fin de cette section, vous comprendrez comment le trafic circule à travers une
application cloud et comment l'empêcher d'aller là où il ne devrait pas.

**Chapitres 18 à 22 : Résilience et architecture moderne**. Conception multi-région,
systèmes découplés, informatique serverless, conteneurs. Ces chapitres couvrent les modèles
architecturaux qui distinguent les systèmes de production des projets jouets. Vous finirez
cette section en comprenant pourquoi les architectes expérimentés pensent à la défaillance
avant de penser aux fonctionnalités.

**Chapitres 23 à 26 : Performance et données**. Niveaux de stockage, politiques de cycle de
vie, Aurora et réplicas en lecture, performance réseau, et les services d'analytique qui
transforment des données brutes en réponses. À la fin de cette section, vous comprendrez
comment rendre un système plus rapide — et comment savoir quelle partie est réellement lente.

**Chapitres 27 à 30 : Optimisation des coûts**. La tarification AWS est compliquée, mais
elle suit des principes. À la fin de cette section, vous comprendrez comment lire une facture
AWS, comment prédire les coûts avant de vous engager dans une architecture, et comment
trouver les optimisations qui comptent par rapport à celles qui ne comptent pas.

**Chapitres 31 à 34 : Penser comme un architecte**. La dernière section prend du recul par
rapport aux services spécifiques et aborde le processus de raisonnement. Quand ajoutez-vous
de la complexité ? Quand restez-vous simple ? Comment défendez-vous une décision quand il
existe des alternatives raisonnables ? C'est la partie la plus difficile et la plus précieuse.


**Quelques points avant de commencer**

**Ce livre suppose que vous ne savez presque rien du cloud computing.** Si vous avez
entendu parler d'AWS mais ne l'avez jamais utilisé, vous êtes au bon endroit. Si vous
n'avez jamais entendu parler d'AWS, vous êtes aussi au bon endroit.

**Ce livre ne suppose pas que vous êtes développeur.** Maya ne l'est pas. Tom à peine.
Vous n'avez pas besoin d'écrire du code pour comprendre l'architecture. Vous avez besoin
de comprendre les problèmes et les solutions.

**Ce livre sera parfois délibérément faux.** L'équipe fera des erreurs. Ils choisiront
le mauvais service. Ils sauteront une étape de sécurité qu'ils regretteront. Ils
surapprovisionneront et sous-approvisionneront. C'est comme ça qu'ils apprendront,
et c'est comme ça que vous apprendrez aussi.

**Les conseils d'examen sont réels.** Le SAA-C03 est un vrai examen. Les questions
basées sur des scénarios à la fin de chaque chapitre sont conçues pour ressembler
au vrai examen. Si vous pouvez y répondre, vous êtes sur la bonne voie.

Et encore une chose.

Lisez ce livre avec un crayon, une application de notes, ou une liste en cours de
« je pense que la réponse est... ».

Faites une pause avant que l'équipe décide quelque chose. Prenez la décision vous-même.
Puis continuez à lire et voyez si vous auriez fait le même compromis.

Vous vous demandez peut-être : pourquoi suivre une startup de restauration à travers un
livre de certification AWS ? La réponse est que les concepts abstraits s'ancrent quand on a
déjà ressenti le problème. Au moment où vous rencontrerez chaque service AWS, Nimbus en aura
eu besoin en premier.

**Comment lire ce livre**

Chaque chapitre suit la même structure. Vous verrez l'équipe se heurter à un problème —
quelque chose qui casse, qui est lent, qui ne s'adapte pas. Puis vous les regarderez
comprendre ce qui se passe réellement. Puis le service AWS pertinent apparaît, nommé et
expliqué. Puis vient une plongée plus profonde dans les détails techniques. Puis les
compromis, les exercices, et une scène qui prépare le chapitre suivant.

Les exercices à la fin de chaque chapitre se présentent en trois types. Les exercices de
mémorisation vérifient que vous avez compris ce que vous venez de lire. Les questions de
scénario SAA-C03 ressemblent aux vraies questions d'examen et en donnent la sensation —
lisez les indices avant de deviner, car le raisonnement compte autant que la réponse. Les
défis d'architecture n'ont pas de réponse unique correcte ; ils existent pour vous faire
pratiquer la réflexion, pas pour mémoriser le résultat.

Si vous lisez ce livre principalement pour réussir le SAA-C03, prêtez une attention
particulière aux sections Conseils d'examen. Elles signalent ce que l'examen teste
réellement, y compris les pièges courants et le vocabulaire spécifique que l'examen utilise.
Si vous lisez ce livre pour construire une compréhension pratique, les défis d'architecture
sont là où l'apprentissage le plus profond se produit.

Les deux choses sont vraies en même temps : c'est un livre de préparation à l'examen et un
guide pratique. Chaque concept qui apparaît dans l'histoire apparaît aussi dans les objectifs
de domaine de l'examen. Le parcours de Nimbus n'est pas une décoration. C'est le programme.

Une dernière note sur les personnages. Maya demande souvent « attends — mais *pourquoi*
ferions-nous comme ça ? ». C'est intentionnel. Elle est le porte-voix du lecteur. Chaque
fois qu'elle le demande, c'est parce qu'un vrai apprenant se poserait la même question.
Suivez ses questions attentivement — elles marquent les moments où le raisonnement compte
le plus.

Tom demande souvent « combien ça coûte par mois ? » lui aussi. Également intentionnel. Le
coût est une contrainte réelle dans chaque décision d'architecture. Une réponse qui ignore
le coût n'est pas une réponse complète. Tom veille à ce que l'équipe ne l'oublie jamais.

**Une note pratique sur la lecture active.** Ce n'est pas un livre à lire passivement. Les
chapitres se construisent les uns sur les autres — les décisions d'architecture prises au
chapitre 4 créent des problèmes que le chapitre 7 corrige, et les compromis acceptés au
chapitre 7 créent des coûts que le chapitre 27 résout. Si vous sautez directement aux
services qui vous intéressent, le contexte manquera et le raisonnement ne portera pas de la
même façon.

Lisez avec de quoi écrire. Quand l'équipe est sur le point de prendre une décision, fermez
le livre un instant et prenez d'abord votre propre décision. Quel service choisiriez-vous ?
Quel compromis accepteriez-vous ? Puis continuez. Comparer votre instinct à la décision de
l'équipe — et comprendre où ils divergent — est là où le vrai apprentissage se produit.

Quand vous rencontrez une question de scénario à la fin d'un chapitre, ne lisez les indices
qu'après avoir fait un choix. Les indices sont conçus pour corriger les mauvaises réponses
les plus courantes, ce qui signifie qu'ils sont les plus utiles après que vous vous êtes
déjà engagé dans une direction.

Si vous lisez ce livre dans le cadre de la préparation à l'examen SAA-C03, adoptez un rythme
qui vous laisse réfléchir entre les chapitres. Un ou deux chapitres par jour sont plus
efficaces qu'un marathon de week-end. Les concepts se cumulent — l'examen teste le
raisonnement à travers les services, pas seulement la connaissance de services individuels,
et ce raisonnement prend du temps à se consolider.

Et si quelque chose n'est pas clair : l'équipe posera la question avant que vous ayez à le
faire. Maya demande « attends — mais *pourquoi* ferions-nous comme ça ? » pour exactement
cette raison. Si vous vous trouvez confus par une décision que l'équipe prend, attendez deux
paragraphes. Maya est probablement sur le point de poser la même question.

Encore une chose avant de commencer. Tom citera des prix tout au long de ce livre, parce que
Tom cite des prix pour tout. Ces chiffres — ainsi que les limites de service et les détails
de fonctionnalités — reflètent la documentation AWS de la mi-2026. AWS les change souvent, et
presque toujours à la baisse sur les prix. Le raisonnement derrière chaque décision tiendra ;
les dollars et limites exacts, peut-être pas. Quand c'est votre argent, vérifiez la
documentation AWS actuelle comme le ferait Tom.

**Et une mise en garde honnête** : le cloud n'est pas toujours la bonne réponse.
Pour la plupart des startups et des entreprises en phase de croissance, il l'est clairement
— les calculs que Tom a faits au tableau blanc en font la démonstration — mais il existe des
situations réelles, des données classifiées aux charges de travail massives et stables, où
posséder son propre matériel l'emporte. L'équipe explore ces exceptions dans le prochain
chapitre, quand Tom insiste pour entendre les arguments contre le cloud avant de s'y engager.

## Forces et limites

**Forces de cette approche** : Apprendre à travers un récit continu donne du contexte aux concepts avant qu'ils aient des noms. Au moment où vous atteignez IAM ou RDS, vous avez déjà ressenti le problème qu'ils résolvent — parce que Nimbus l'a ressenti en premier. Cela rend la rétention plus élevée et le raisonnement sur les compromis plus naturel que la mémorisation de listes de fonctionnalités.

**Limites à connaître** : Ce livre couvre le programme AWS SAA-C03 Solutions Architect Associate. C'est une portée substantielle, mais ce n'est pas chaque service AWS — et les architectures de production impliquent toujours des services et des contraintes spécifiques à votre industrie et à votre échelle. L'histoire de Nimbus est fictive ; les vraies startups prennent des décisions plus désordonnées pour des raisons plus désordonnées. Utilisez ce livre pour construire le raisonnement, pas pour copier l'architecture.

## Résumé

Nimbus a commencé avec un problème que n'importe quelle petite entreprise pourrait avoir : des clients qui n'arrivaient pas à joindre, et personne ne pouvait pointer du doigt un seul échec dramatique. Ce n'était que de la friction — petite, silencieuse et coûteuse. La séance au tableau blanc n'a pas produit de solution. Elle a produit une question qui valait la peine d'être posée : qu'est-ce, exactement, que le cloud ? La réponse s'est avérée compter plus que quiconque ne l'avait imaginé.

- **Le cloud** est un accès à la demande à des ressources informatiques via internet — les ordinateurs de quelqu'un d'autre que vous n'avez pas à posséder ou maintenir.
- Les trois options d'hébergement : sur site (votre matériel, vos coûts, votre expertise requise), hébergement de petit serveur par un tiers (limité, ne s'adapte pas), cloud (paiement à l'usage, s'adapte à la demande).
- Les coûts sur site sont réels et souvent sous-estimés : dépréciation du matériel, électricité, connectivité internet et expertise de maintenance s'additionnent de façon significative avant même que vous n'écriviez une seule ligne de code applicatif.
- **AWS** a été lancé en 2006 quand Amazon a ouvert son infrastructure de centres de données aux clients externes. Il reste le plus grand fournisseur de cloud, suivi de Microsoft Azure et Google Cloud.
- Le cloud n'est pas toujours la bonne réponse — mais pour la plupart des startups et des entreprises en phase de croissance, avec une demande imprévisible et de petites équipes, il l'est clairement.

## Conseils pour l'examen

*Domaine SAA-C03 : Transversal — Fondamentaux des concepts cloud*

- **Le cloud à l'examen** signifie un calcul à la demande, à l'utilisation, via internet. C'est un modèle de livraison, pas une technologie.
- **CapEx vs OpEx** : L'infrastructure sur site est une dépense d'investissement (CapEx — achat de matériel initial). Le cloud est une dépense opérationnelle (OpEx — frais d'utilisation récurrents). Les scénarios d'examen demandant « d'éliminer les coûts initiaux » ou « de passer de CapEx à OpEx » pointent vers l'adoption du cloud.
- **Avantages du cloud** : Pas de matériel initial, évolutivité élastique, paiement uniquement pour ce que vous utilisez, pas de gestion d'infrastructure physique. Les scénarios avec « trafic imprévisible » ou « petite équipe, pas d'expertise en matériel » sont des signaux forts pour le cloud.
- **Sur site (on-premises)** signifie faire tourner votre propre matériel dans vos propres locaux. L'examen oppose fréquemment les architectures sur site aux alternatives cloud.
- **AWS n'est pas le seul cloud** — Azure et GCP sont de vrais concurrents — mais l'examen SAA-C03 est spécifique à AWS. Il ne vous sera pas demandé de comparer les fournisseurs.
- **Économies d'échelle** : AWS atteint des coûts unitaires plus bas parce qu'il agrège la demande de milliers de clients. C'est l'un des avantages déclarés du cloud par rapport au sur site dans le cadre d'examen AWS. Quand vous voyez « avantage du cloud » à l'examen, les économies d'échelle sont toujours une réponse valide.
- **Six avantages du cloud computing** selon la documentation AWS : échanger une dépense fixe contre une dépense variable, bénéficier d'économies d'échelle massives, arrêter de deviner la capacité, augmenter la vitesse et l'agilité, arrêter de dépenser de l'argent à exploiter des centres de données, devenir mondial en quelques minutes. Ils apparaissent mot pour mot dans les questions d'examen sur les raisons pour lesquelles les organisations migrent vers le cloud.
- **L'agilité à l'examen** signifie la capacité d'expérimenter et de déployer rapidement avec un faible coût par tentative — pas la vitesse brute. Quand un scénario mentionne la réduction du délai de mise sur le marché ou la possibilité d'itérer rapidement, l'agilité est l'avantage du cloud testé.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : qu'est-ce que « le cloud », et pourquoi une petite entreprise
le choisirait-elle plutôt que d'acheter ses propres serveurs ?

*(Indice : Pensez à ce que Maya et Tom ont écrit à côté de l'Option 1 sur le tableau blanc.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une petite startup lance une application de livraison de nourriture. Elle
prévoit un trafic faible initialement, mais anticipe une croissance rapide si le produit
a du succès. L'équipe fondatrice n'a aucune expérience dans la gestion de serveurs
physiques. Elle veut minimiser les coûts initiaux et éviter la charge opérationnelle
de la maintenance du matériel.

Laquelle des approches suivantes correspond LE MIEUX à leurs exigences ?

A) Utiliser un fournisseur cloud pour héberger l'application et payer uniquement ce qu'ils utilisent  
B) Acheter un serveur dédié et héberger l'application dans leur bureau  
C) S'associer à un centre de données de co-location pour installer leurs propres serveurs  
D) Construire l'application pour fonctionner entièrement hors ligne sans infrastructure internet

**Indice 1** : Pensez à ce que la startup a besoin d'*éviter* autant qu'à ce qu'elle a besoin d'avoir.

**Indice 2** : Le scénario mentionne spécifiquement « aucune expérience dans la gestion du matériel » et « minimiser les coûts initiaux ». Quelle option élimine ces préoccupations ?

**Indice 3** : Nous avons décrit cette option dans ce chapitre comme payer pour « les ordinateurs de quelqu'un d'autre ».

**Réponse** : A

**Explication** : Les fournisseurs cloud comme AWS offrent une tarification à l'utilisation sans coûts matériels initiaux, et ils gèrent toute la maintenance de l'infrastructure physique. C'est exactement le modèle qui a du sens pour une startup avec un trafic incertain et sans expertise en matériel — tout comme Nimbus.

**Pourquoi pas B ?** L'achat d'un serveur dédié nécessite un capital initial, une maintenance continue, et n'offre aucune capacité intégrée d'évolution à mesure que le trafic augmente.

**Pourquoi pas C ?** La co-location résout le problème d'espace mais la startup doit toujours acheter, maintenir et gérer ses propres serveurs.

**Pourquoi pas D ?** Une application de livraison de nourriture nécessite une connectivité internet par définition.

*Domaine SAA-C03 : Transversal — Fondamentaux des concepts cloud*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Maya veut convaincre son oncle (qui possède le restaurant) de la laisser construire un
système de commande basé sur le cloud. Il est sceptique : « Pourquoi paierions-nous
Amazon chaque mois alors qu'on pourrait juste acheter un ordinateur une seule fois ? »

Comment expliqueriez-vous les compromis ? Quels sont selon vous les plus grands avantages
de l'approche cloud pour un restaurant ? Et quel est le seul scénario où acheter votre
propre ordinateur pourrait réellement avoir plus de sens ?

Pensez-y en termes de l'analogie du réseau électrique : quand a-t-il du sens pour une
entreprise de faire tourner son propre générateur plutôt que de se brancher au réseau ? La
réponse à cette question se transpose presque directement sur le moment où il a du sens de
faire tourner ses propres serveurs.

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à penser en termes de compromis.)*

## Scène post-générique

Cette nuit-là, après que tout le monde fut rentré chez soi, Maya s'assit seule dans le
restaurant avec son ordinateur portable.

Elle avait trouvé le site web d'AWS. Elle avait cliqué sur quelques pages. Il y avait
des centaines de services répertoriés. Des centaines.

Elle a fait défiler vers le bas. Et vers le bas. Et vers le bas.

Puis elle a fermé l'ordinateur.

« Il va nous falloir un plan », dit-elle à la salle vide.

Tom lui avait envoyé par texto les prix de serveurs qu'il avait trouvés plus tôt. Elle relut
les chiffres : coûts initiaux, dépréciation, électricité, cycles de remplacement. Puis elle
ouvrit le calculateur de tarifs AWS. Elle saisit un seul serveur virtuel — le plus petit
modèle, juste pour voir. Le chiffre mensuel était inférieur à ce qu'aurait été la facture
d'électricité d'une salle de serveurs physique.

Elle fixa ce chiffre un moment.

Puis elle écrivit à Tom : *On part sur le cloud.*

Sa réponse arriva en moins d'une minute : *Je sais. J'ai fait les calculs aussi. Mais on le
fait prudemment.*

Elle posa son téléphone. Dehors, le restaurant était silencieux. La cuisine était sombre.
Quelque part entre la cuisine et le cloud, il y avait une entreprise qu'elle était sur le
point de construire.

Dans le prochain chapitre : pourquoi les entreprises ont arrêté d'acheter des serveurs et ont commencé à les louer — et ce que ça a changé.
