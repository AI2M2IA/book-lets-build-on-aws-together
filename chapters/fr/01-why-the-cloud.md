# Chapitre 1 : Pourquoi louer quand on peut posséder ?

Tom méditait sur la question depuis la veille au soir. Il l'avait écrite dans son carnet, puis barrée, puis réécrite.

Quand Leo et Priya sont arrivés le lendemain matin — café en main, se disputant pour quelque chose sans rapport — Tom était déjà au tableau blanc. La troisième option était encore là, intacte. Un nuage dessiné par quelqu'un qui avait admis ne pas savoir ce que ça voulait dire.

« Il faut que quelqu'un m'explique quelque chose », dit Tom sans se retourner. « Si on loue des ordinateurs à Amazon au lieu d'acheter les nôtres — pourquoi ce serait *moins cher* ? »

La salle se tut. C'était le genre de question qui semble simple et ne l'est pas.

« Parce que », commença Leo.

« Non », dit Tom. « Je veux comprendre. Pas juste entendre la réponse. Pourquoi louer est moins cher que posséder ? »

**Le problème évident avec la possession de serveurs**

Imaginez que vous décidez d'ouvrir un restaurant. Pas le genre Nimbus — un restaurant ordinaire.

Avant que votre premier client entre, vous avez besoin de tables. Des chaises. Une cuisine. Un four. Des assiettes. Du personnel. Vous avez besoin de tout ça le premier jour, même si votre première semaine est calme, même si vous passez trois mois avec six clients par jour avant que le bouche-à-oreille se répande.

Les serveurs physiques fonctionnent de la même façon.

Si Nimbus achète ses propres serveurs, ils doivent les acheter pour le pic qu'ils anticipent. Le vendredi soir le plus chargé qu'ils puissent imaginer. Le moment viral où un blogueur gastronomique parle de l'arepa et dix mille personnes essaient de commander en même temps.

Mais la plupart du temps, ce n'est pas aussi chargé. La plupart du temps, ces serveurs tournent, consomment de l'électricité, et ne font presque rien.

« On paierait pour une capacité qu'on n'utilise pas », dit Maya.

« Exactement », dit Tom, ce qui surprit tout le monde parce que c'est lui qui avait posé la question.

**Le modèle de location**

Voici ce qui rend le cloud computing différent.

Quand vous utilisez AWS, vous n'achetez pas des serveurs. Vous louez de la puissance de calcul, et vous payez uniquement pour ce que vous utilisez. C'est plus proche de la location d'une salle de réception que de la possession d'un bâtiment de restaurant.

Réfléchissez-y de cette façon.

Si vous devez organiser une fête d'anniversaire pour cinquante personnes, vous pourriez acheter une maison assez grande pour cinquante personnes avec leurs tables et leurs chaises. Ou vous pourriez louer une salle de réception pour quatre heures le samedi, payer exactement pour l'espace et le temps dont vous avez besoin, et rendre les clés quand la fête est terminée.

La salle est toujours là quand vous en avez besoin. Elle est de nouveau disponible quand quelque chose d'autre se présente. Vous n'avez pas eu à embaucher un gestionnaire d'immeuble. Vous n'avez pas payé les taxes foncières toute l'année.

C'est le modèle cloud. AWS a les « salles de réception ». Vous vous présentez quand vous en avez besoin.

**Mais attendez — il y a plus**

« D'accord », dit Leo, « mais que se passe-t-il si ma salle brûle ? »

Bon instinct. Sombre, mais bon.

L'une des hypothèses silencieuses quand vous possédez vos propres serveurs est que *vous* êtes responsable de les maintenir en fonctionnement. Si le serveur dans votre bureau est renversé par un stagiaire maladroit, votre site web est en panne. Si le bâtiment perd son alimentation électrique, votre site web est en panne. Si le disque dur tombe en panne — et les disques durs finissent toujours par tomber en panne — votre site web est en panne.

AWS exploite des centres de données. D'immenses installations gérées professionnellement avec une alimentation de secours, des connexions réseau redondantes, une sécurité physique, et des équipes d'ingénieurs dont le seul travail est de maintenir ces machines en fonctionnement.

Vous ne louez pas seulement de la puissance de calcul. Vous louez de la fiabilité.

« Combien ça coûte ? » demanda Tom.

On y viendra. Plusieurs chapitres plus loin, quand les yeux de Tom ne se voileront plus.

**Trois choses que le cloud fait différemment**

Concrétisons cela. Voici les trois différences fondamentales entre la gestion de vos propres serveurs et l'utilisation d'un fournisseur cloud.

**1. Vous payez pour ce que vous utilisez.**

Pas de serveur qui tourne au ralenti. Pas d'achat initial. Si Nimbus reçoit zéro commande un lundi matin, il paye presque rien. S'ils sont submergés le soir du Nouvel An, AWS a automatiquement la capacité prête.

**2. Quelqu'un d'autre s'occupe du matériel.**

AWS maintient les machines physiques. Les câbles réseau. Les alimentations électriques. Les systèmes de refroidissement. Nimbus n'embauche personne pour faire ça. Ils se concentrent sur leur application, pas sur l'infrastructure en dessous.

**3. Vous pouvez monter en puissance — et en descendre — instantanément.**

C'est celui qui prend du temps à pleinement apprécier. Avec des serveurs physiques, monter en puissance signifie commander du nouveau matériel, attendre des semaines pour la livraison, le mettre en place. Avec AWS, monter en puissance signifie cliquer sur un bouton (ou laisser le système le faire automatiquement). Et quand vous n'avez plus besoin de la capacité supplémentaire, vous redescendez. Vous arrêtez de payer.

Priya était restée silencieuse pendant cette explication. Elle avait une question.

« Et la sécurité ? Qui est responsable de garder les données en sécurité ? »

Et c'est là que ça devient intéressant.

**Le modèle de responsabilité partagée**

C'est l'un des concepts les plus importants de tout AWS. Il est simple une fois compris, mais il fait trébucher beaucoup de personnes — y compris à l'examen.

AWS et vous partagez la responsabilité de la sécurité. Mais chaque partie est responsable de choses différentes.

**AWS est responsable de la sécurité *du* cloud.**

Les centres de données physiques. Le matériel. L'infrastructure réseau. Les hyperviseurs qui font tourner les machines virtuelles. Si quelqu'un entre par effraction dans un centre de données AWS, c'est le problème d'Amazon.

**Vous êtes responsable de la sécurité *dans* le cloud.**

Vos données. Votre application. Vos comptes utilisateurs et qui a accès à quoi. Les configurations que vous choisissez. Si quelqu'un vole votre mot de passe et se connecte à votre compte AWS, c'est votre problème.

Priya hocha lentement la tête. « Donc ils protègent le bâtiment. On protège ce qui est à l'intérieur. »

« Exactement », dit Maya.

« Donc si Leo ouvre un port qu'il ne devrait pas... »

« C'est toujours notre problème », confirma Maya en regardant Leo.

Leo tapait déjà quelque chose sur son ordinateur et faisait semblant de ne pas entendre.

## Forces et limites

Aucun outil n'est parfait. Soyons honnêtes sur les deux côtés.

**Pourquoi le cloud est formidable** :

- Pas de coûts matériels initiaux
- Paiement uniquement pour ce que vous utilisez
- Évolue instantanément dans les deux sens
- Fiabilité professionnelle et sécurité physique
- Accès à des centaines de services gérés (bases de données, files d'attente, apprentissage automatique, et plus)
  sans avoir à les construire ou les maintenir vous-même

**Là où ça se complique** :

- Les coûts peuvent être imprévisibles si vous ne faites pas attention (le futur cauchemar de Tom)
- Vous dépendez d'un tiers pour votre infrastructure — si AWS a une panne dans votre
  région, votre service est aussi affecté
- Il y a une courbe d'apprentissage. AWS a des centaines de services. Savoir lequel utiliser
  demande de l'expérience, ou un livre comme celui-ci.
- Les données quittant le cloud peuvent être coûteuses. Déplacer de grandes quantités de données
  hors d'AWS coûte de l'argent. (Nous reviendrons là-dessus au Chapitre 30.)

« Donc on échange le contrôle contre la commodité », dit Tom.

« Et les coûts initiaux contre les coûts récurrents », ajouta Maya.

« Et le problème de quelqu'un d'autre contre notre propre problème, du côté de la sécurité », dit Priya.

« Mais on échange aussi le serveur cassé de Leo contre le serveur très-pas-cassé d'Amazon », dit Leo,
qui avait apparemment écouté tout le temps.

Il n'avait pas complètement tort.

## Résumé

- Le cloud est de la puissance de calcul que vous louez plutôt que possédez.
- AWS est le plus grand fournisseur de cloud au monde.
- L'avantage principal est l'évolutivité à l'utilisation : vous payez uniquement pour ce que vous utilisez, et vous
  pouvez monter ou descendre selon les besoins.
- AWS gère l'infrastructure physique. Vous gérez votre application, vos données,
  et vos configurations. Cette division est appelée le **Modèle de responsabilité partagée**.
- Le cloud n'est pas toujours moins cher ou plus simple — mais il supprime les barrières au démarrage,
  et rend l'évolutivité possible d'une façon que les serveurs physiques ne peuvent pas égaler.

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

Leo l'avait créé à 23h avec son adresse e-mail personnelle, une carte de crédit qu'il avait dû
emprunter à Tom, et un enthousiasme qui était, rétrospectivement, légèrement alarmant.

« J'ai trouvé quelque chose qui s'appelle EC2 », dit-il le lendemain matin en montrant son écran d'ordinateur.
« C'est comme un ordinateur qu'on loue. Je crois que j'en ai démarré un. »

« Tu *crois* ? » demanda Priya.

« Je veux dire, j'en ai définitivement démarré un. » Il fit défiler vers le bas. « Je sais juste pas où il est. »

Maya se pencha et regarda l'écran.

« Leo », dit-elle. « Pourquoi ça dit 'Région : ap-southeast-1' ? »

« Qu'est-ce que ça veut dire ? »

Dans le prochain chapitre : la géographie d'AWS — où sont vraiment les serveurs, et pourquoi ça importe.
