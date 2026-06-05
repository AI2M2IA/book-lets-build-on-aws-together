\newpage

*Copyright © 2026 AI(2)M(2)IA*

*Tous droits réservés. Aucune partie de cette publication ne peut être reproduite, distribuée
ou transmise sous quelque forme ou par quelque moyen que ce soit, notamment par photocopie,
enregistrement ou tout autre procédé électronique ou mécanique, sans l'autorisation écrite
préalable de l'éditeur, sauf dans le cas de courtes citations insérées dans des critiques
et certains autres usages non commerciaux autorisés par la loi sur le droit d'auteur.*

*L'histoire de Nimbus et ses personnages sont fictifs. Toute ressemblance avec des personnes
réelles, vivantes ou décédées, ou avec des événements réels est purement fortuite.*

*Les services AWS, les modèles de tarification, les bonnes pratiques et le contenu relatif
aux examens décrits dans ce livre sont basés sur la documentation publiquement disponible
à la date de publication. Amazon Web Services, AWS et les marques associées sont des marques
commerciales d'Amazon.com, Inc. ou de ses filiales. Ce livre est une ressource éducative
indépendante et n'est pas affilié à Amazon Web Services, ni approuvé ou parrainé par cette
société.*

*Les prix et les fonctionnalités des services AWS changent fréquemment. Vérifiez toujours
les informations actuelles sur aws.amazon.com avant de prendre des décisions architecturales
ou financières.*

*L'examen AWS Solutions Architect Associate (SAA-C03) est un vrai examen de certification.
Rendez-vous sur aws.amazon.com/certification pour vous inscrire.*

*Première édition, 2026*

*Imprimé et distribué via Amazon KDP*

---

\newpage

# Note sur la méthode

Ce livre a été rédigé avec l'assistance de l'IA et publié sous le pseudonyme AI(2)M(2)IA, conformément à la pratique de chaque volume de cette collection.

Le programme que vous allez suivre — sa prémisse, ses personnages, la forme de l'infrastructure de Nimbus depuis une ligne téléphonique de restaurant jusqu'à une architecture AWS de niveau production, les compromis que l'équipe fait sous pression et ceux qu'elle se trompe d'abord — tout cela a été choisi par un auteur humain et mené, service par service, à travers une longue collaboration avec un grand modèle de langage. La couverture a été conçue avec l'aide d'un modèle de génération d'images sous la même direction. Le livre numérique lui-même a été préparé par des outils automatisés.

Ce que vous lisez, c'est ce qui a été conservé.

Ces pages ne revendiquent pas une paternité non assistée ; elles ne revendiquent pas non plus que la machine seule en est l'auteure. L'œuvre, comme l'infrastructure qu'elle décrit, est soutenue par des couches qui dépendent les unes des autres.

---

\newpage

*Pour tous ceux qui ont ouvert un navigateur, tapé une commande, et fait fonctionner quelque chose —
et pour tous ceux qui ont ouvert un navigateur, tapé une commande, et appris de ce qui
n'a pas fonctionné.*

---

\newpage

# Préface

Vous avez probablement déjà essayé d'apprendre AWS.

Peut-être avez-vous ouvert la documentation et, dix minutes plus tard, vous vous êtes retrouvé à fixer la syntaxe des politiques IAM avant même de comprendre à quoi servait IAM.

Peut-être avez-vous terminé un cours vidéo et réalisé que vous ne pouviez toujours pas expliquer où vit réellement un site web.

Peut-être avez-vous surligné un guide d'examen, mémorisé des noms de services, puis vous êtes figé la première fois qu'un scénario vous demandait ce que vous feriez si une base de données tombait en panne pendant l'heure de pointe du dîner.

Ce n'est pas votre faute.

C'est ainsi que l'informatique en nuage est généralement enseignée : d'abord comme un catalogue, et ensuite comme un système.

Ce livre fonctionne différemment.

**Vous n'allez pas étudier AWS. Vous allez l'utiliser.**

Nous commençons avec un restaurant qui perd des commandes parce que la ligne téléphonique est occupée et qu'il n'y a pas de site web.

À partir de là, vous suivrez Maya, Tom, Priya et Leo pendant qu'ils construisent l'infrastructure de Nimbus, une décision à la fois. Pas dans l'ordre net qu'un programme de certification préférerait, mais dans l'ordre désordonné que les vrais systèmes exigent.

À la fin, Nimbus traitera 18 000 commandes quotidiennes : fonctionnant sur plusieurs zones de disponibilité, récupérant automatiquement des pannes, servant les utilisateurs de la côte Ouest en quelques millisecondes grâce à un réseau de diffusion de contenu, traitant chaque commande via un pipeline d'analyse en temps réel, et maîtrisant les coûts à mesure que l'architecture grandit avec l'entreprise.

Chaque service AWS de ce livre apparaît au moment où il devient nécessaire. Pas parce qu'un programme l'exige. Parce que le système l'exige.

**À qui s'adresse ce livre** Si vous apprenez mieux par les problèmes que par la documentation, ce livre a été écrit pour vous. Si vous préparez la certification AWS Solutions Architect Associate (SAA-C03), ce livre est aussi pour vous : chaque domaine de l'examen est couvert, et chaque chapitre se termine par des conseils d'examen et des questions pratiques de type SAA-C03. Si vous travaillez déjà dans l'ingénierie et que vous voulez comprendre *pourquoi* les décisions architecturales fonctionnent, et pas seulement comment s'appellent les services, vous trouverez ce raisonnement sur chaque page.

**Ce que vous ne trouverez pas ici** Un raccourci. Ce n'est pas un guide de révision intensive. Il est plus long qu'un guide de révision parce que comprendre prend plus de temps que mémoriser, et c'est la compréhension qui se transfère à votre prochain poste, votre prochain système, et l'incident de production que personne n'a correctement documenté.

**Comment lire ce livre** Lisez-le comme un roman la première fois. Laissez l'architecture se révéler à mesure que l'équipe rencontre de vrais problèmes et fait de vrais compromis. À la fin de chaque chapitre, arrêtez-vous et utilisez activement les conseils d'examen et les exercices : couvrez les réponses, raisonnez vous-même sur le scénario, puis vérifiez ce qui s'est passé.

Quand vous aurez terminé, Nimbus sera en production. Votre compréhension d'AWS aussi.

Commençons.
