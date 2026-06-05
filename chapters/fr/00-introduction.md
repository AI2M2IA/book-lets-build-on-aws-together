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

« Il nous faut un site web », dit Maya pour personne en particulier.

Son cousin Tom leva les yeux de la feuille de calcul qu'il mettait à jour à la main.
Tom gérait les « systèmes » du restaurant — un mot généreux pour désigner un Google Sheet
partagé et un tableau blanc — depuis deux ans.

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

**Trois options, un problème**

De retour au restaurant, Maya et Tom ont esquissé les options sur le tableau blanc.

**Option un** : Acheter un ordinateur, l'installer dans le restaurant, et faire tourner
le site web depuis là. (Dans l'industrie, on appelle ça faire tourner « sur site »
— vos propres locaux, vos propres machines. Vous verrez ce terme constamment.)

Tom a écrit « facture d'électricité » et « que se passe-t-il si ça casse » à côté de
cette option.

**Option deux** : Payer une société d'hébergement pour faire tourner un petit serveur
pour eux. Pas cher, simple. Ça marchait pour les blogs personnels en 2008. Probablement
pas assez flexible pour une entreprise en croissance.

« Et si on reçoit soudainement mille commandes à la fois ? » demanda Maya.

Tom ajouta « ne peut pas évoluer » à l'option deux.

**Option trois** : Autre chose. Quelque chose dont ils entendaient parler. Quelque chose
qu'on appelait « le cloud ».

Tom a dessiné un nuage sur le tableau blanc. Un nuage littéral, comme le dessin d'un
enfant.

« Je ne sais pas vraiment ce que ça veut dire », admit-il.

« Moi non plus », dit Maya.

C'était le début de tout.

**Ce qu'est vraiment "le cloud"**

Réglons ça immédiatement, car le mot « cloud » est l'un des termes les plus usités et
les moins expliqués dans la technologie.

Le cloud n'est pas un endroit magique où vos données flottent.

Le cloud, c'est les ordinateurs de quelqu'un d'autre.

C'est tout. Quand vous sauvegardez une photo sur iCloud ou Google Drive, votre photo
est stockée sur un ordinateur physique appartenant à Apple ou Google, assis dans un
bâtiment quelque part. Quand vous utilisez Netflix, la vidéo que vous regardez est
envoyée depuis des serveurs physiques dans des centres de données à travers le monde.

Le « cloud » signifie simplement : des ordinateurs auxquels vous accédez via internet,
que vous n'avez pas à posséder ou maintenir vous-même.

Et Amazon — oui, la société qui livre des colis — a construit l'une des plus grandes
collections de ces ordinateurs dans le monde. Ils l'appellent Amazon Web Services,
ou AWS.

**Pourquoi Amazon ?**

C'est une question légitime. Amazon a commencé comme une librairie.

Voici ce qui s'est passé : Amazon a grandi si vite qu'ils avaient besoin d'une quantité
énorme de puissance de calcul pour faire tourner leurs propres systèmes. Ils ont
construit des centres de données. Ils ont embauché des ingénieurs pour les gérer. Ils
sont devenus très, très bons pour faire tourner des ordinateurs à grande échelle.

Puis quelqu'un chez Amazon a eu une idée : et si on vendait l'accès à toute cette
puissance de calcul à d'autres personnes ?

En 2006, Amazon Web Services a lancé. Aujourd'hui, AWS fait tourner une part
significative d'internet. Le site que vous utilisez pour réserver des vols, l'application
qui suit votre livraison, le service de streaming que vous avez regardé hier soir —
il y a de bonnes chances qu'au moins une partie tourne sur AWS.

Ce n'est pas un monopole. Google Cloud et Microsoft Azure sont des concurrents sérieux.
Mais AWS est arrivé en premier, est important, et c'est ce dont parle ce livre.

**Rencontrez l'équipe**

Maya n'a pas construit Nimbus seule.

Elle a appelé Tom en premier — évidemment. Tom avait les feuilles de calcul, les
contacts fournisseurs, et l'entêtement nécessaire pour vraiment exécuter une idée.

Tom connaissait un développeur. Leo. Vingt-quatre ans, autodidacte, le genre de personne
qui a déjà construit un prototype avant que vous ayez fini d'expliquer le problème. Il
est arrivé à leur première réunion avec un ordinateur portable et une application
à moitié terminée.

« J'ai déjà commencé », dit-il en ouvrant l'écran. « Je crois que je l'ai déployée
quelque part. »

Il l'avait fait. Sur un serveur qu'il ne comprenait pas entièrement, dans une région
qu'il n'avait pas choisie intentionnellement, faisant tourner un code qui casserait
définitivement sous charge.

Ils l'ont aimé immédiatement.

Priya est arrivée plus tard — recommandée par un ami commun. Diplôme d'ingénierie,
spécialisation en sécurité, le genre de personne qui lit des post-mortems de célèbres
échecs technologiques les soirs de week-end. Elle avait une question à sa première réunion.

« Est-ce que quelqu'un a pensé à ce qui se passerait si quelqu'un essayait d'entrer
par effraction ? »

Silence.

« Bienvenue dans l'équipe », dit Maya.

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

**Quelques points avant de commencer**

**Ce livre suppose que vous ne savez presque rien du cloud computing.** Si vous avez
entendu parler d'AWS mais ne l'avez jamais utilisé, vous êtes au bon endroit. Si vous
n'avez jamais entendu parler d'AWS, vous êtes aussi au bon endroit.

**Ce livre ne suppose pas que vous êtes développeur.** Maya ne l'est pas. Tom à peine.
Vous n'avez pas besoin d'écrire du code pour comprendre l'architecture. Vous avez besoin
de comprendre les problèmes et les solutions.

**Ce livre sera parfois délibérément faux.** L'équipe fera des erreurs. Ils choisiront
le mauvais service. Ils sauteront une étape de sécurité qu'ils regretteront. Ils
surapprovisionnaire et sous-approvisionneront. C'est comme ça qu'ils apprendront,
et c'est comme ça que vous apprendrez aussi.

**Les conseils d'examen sont réels.** Le SAA-C03 est un vrai examen. Les questions
basées sur des scénarios à la fin de chaque chapitre sont conçues pour ressembler
au vrai examen. Si vous pouvez y répondre, vous êtes sur la bonne voie.

Et encore une chose.

Lisez ce livre avec un crayon, une application de notes, ou une liste en cours de
« je pense que la réponse est... ».

Faites une pause avant que l'équipe décide quelque chose. Prenez la décision vous-même.
Puis continuez à lire et voyez si vous auriez fait le même compromis.

## Résumé

- **Le cloud** est un accès à la demande à des ressources informatiques via internet — les ordinateurs de quelqu'un d'autre que vous n'avez pas à posséder ou maintenir.
- Les trois options d'hébergement : sur site (votre matériel, vos coûts), hébergement partagé (limité, ne s'adapte pas), cloud (paiement à l'usage, s'adapte à la demande).
- **AWS** a lancé en 2006 quand Amazon a ouvert son infrastructure de centres de données aux clients externes. Il reste le plus grand fournisseur de cloud, suivi de Microsoft Azure et Google Cloud.
- Nimbus — l'histoire que suit ce livre — commence comme un système de commande de restaurant et évolue en une architecture cloud de niveau production.
- Ce livre enseigne non seulement *ce que* fait chaque service AWS, mais *pourquoi* il existe, *quand* l'utiliser, et *quand ne pas l'utiliser*.

## Conseils pour l'examen

*Domaine SAA-C03 : Transversal — Fondamentaux des concepts cloud*

- **Le cloud à l'examen** signifie un calcul à la demande, à l'utilisation, via internet. C'est un modèle de livraison, pas une technologie.
- **CapEx vs OpEx** : L'infrastructure sur site est une dépense d'investissement (CapEx — achat de matériel initial). Le cloud est une dépense opérationnelle (OpEx — frais d'utilisation récurrents). Les scénarios d'examen demandant « d'éliminer les coûts initiaux » ou « de passer de CapEx à OpEx » pointent vers l'adoption du cloud.
- **Avantages du cloud** : Pas de matériel initial, évolutivité élastique, paiement uniquement pour ce que vous utilisez, pas de gestion d'infrastructure physique. Les scénarios avec « trafic imprévisible » ou « petite équipe, pas d'expertise en matériel » sont des signaux forts pour le cloud.
- **AWS n'est pas le seul cloud** — Azure et GCP sont de vrais concurrents — mais l'examen SAA-C03 est spécifique à AWS. Il ne vous sera pas demandé de comparer les fournisseurs.

## Forces et limites

**Forces de cette approche** : Apprendre à travers un récit continu donne du contexte aux concepts avant qu'ils aient des noms. Au moment où vous atteignez IAM ou RDS, vous avez déjà ressenti le problème qu'ils résolvent — parce que Nimbus l'a ressenti en premier. Cela rend la rétention plus élevée et le raisonnement sur les compromis plus naturel que la mémorisation de listes de fonctionnalités.

**Limites à connaître** : Ce livre couvre le programme AWS SAA-C03 Solutions Architect Associate. C'est une portée substantielle, mais ce n'est pas chaque service AWS — et les architectures de production impliquent toujours des services et des contraintes spécifiques à votre industrie et à votre échelle. L'histoire de Nimbus est fictive ; les vraies startups prennent des décisions plus désordonnées pour des raisons plus désordonnées. Utilisez ce livre pour construire le raisonnement, pas pour copier l'architecture.

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

A) Acheter un serveur dédié et héberger l'application dans leur bureau  
B) Utiliser un fournisseur cloud pour héberger l'application et payer uniquement ce qu'ils utilisent  
C) S'associer à un centre de données de co-location pour installer leurs propres serveurs  
D) Construire l'application pour fonctionner entièrement hors ligne sans infrastructure internet

**Indice 1** : Pensez à ce que la startup a besoin d'*éviter* autant qu'à ce qu'elle a besoin d'avoir.

**Indice 2** : Le scénario mentionne spécifiquement « aucune expérience dans la gestion du matériel » et « minimiser les coûts initiaux ». Quelle option élimine ces préoccupations ?

**Indice 3** : Nous avons décrit cette option dans ce chapitre comme payer pour « les ordinateurs de quelqu'un d'autre ».

**Réponse** : B

**Explication** : Les fournisseurs cloud comme AWS offrent une tarification à l'utilisation sans coûts matériels initiaux, et ils gèrent toute la maintenance de l'infrastructure physique. C'est exactement le modèle qui a du sens pour une startup avec un trafic incertain et sans expertise en matériel — tout comme Nimbus.

**Pourquoi pas A ?** L'achat d'un serveur dédié nécessite un capital initial, une maintenance continue, et n'offre aucune capacité intégrée d'évolution à mesure que le trafic augmente.

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

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à penser en termes de compromis.)*

## Scène post-générique

Cette nuit-là, après que tout le monde fut rentré chez soi, Maya s'assit seule dans le
restaurant avec son ordinateur portable.

Elle avait trouvé le site web d'AWS. Elle avait cliqué sur quelques pages. Il y avait
des centaines de services répertoriés. Des centaines.

Elle a fait défiler vers le bas. Et vers le bas. Et vers le bas.

Puis elle a fermé l'ordinateur.

« Il va nous falloir un plan », dit-elle à la salle vide.

Dans le prochain chapitre : pourquoi les entreprises ont arrêté d'acheter des serveurs et ont commencé à les louer — et ce que ça a changé.
