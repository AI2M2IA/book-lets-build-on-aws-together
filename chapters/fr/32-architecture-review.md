# Chapitre 32 : Défendre le plan

La question de Maya à la fin du chapitre 31 : « Quelle est la différence entre prendre des décisions architecturales et penser comme un architecte ? »

Elle avait invité un invité pour aider à y répondre.

Il s'appelait Carlos. Il avait été ingénieur pendant 20 ans, responsable ingénierie pendant sept ans et conseiller en startups pendant trois ans. C'était le genre de personne qui avait vu suffisamment de systèmes réussir et échouer pour avoir des instincts calibrés sur les deux.

Il arriva avec rien : pas de diapositives, pas d'ordre du jour. Juste un feutre pour tableau blanc et une question.

« Parlez-moi de Nimbus », dit-il.

Une bonne revue d'architecture est comme une liste de vérification pré-vol pour un pilote. L'avion peut sembler parfaitement prêt à voler — moteurs en marche, réservoir plein, passagers à bord. Mais la liste de vérification existe parce que les pilotes expérimentés savent que les choses les plus susceptibles de causer des problèmes sont précisément celles qui semblent bien aller juste avant de ne plus l'être. La liste de vérification ne signifie pas que le pilote ne sait pas ce qu'il fait. Cela signifie qu'il a intégré le fait que même les experts ratent des choses quand ils sautent le processus structuré.

**Le premier mouvement de l'architecte**

Ce qui s'est passé ensuite a surpris l'équipe.

Maya commença à décrire le système — instances EC2, Aurora, CloudFront, ElastiCache, DynamoDB pour le menu, VPC avec des sous-réseaux privés...

Carlos l'arrêta doucement.

« Commencez par les affaires », dit-il. « Pas la technologie. »

Elle fit une pause. Puis : « Nimbus est une plateforme de commande de restaurant. Nous avons 287 partenaires restaurants. Nous traitons environ 4 200 commandes par jour. La valeur moyenne d'une commande est de 34 $. Nous croissons de 18 % trimestre après trimestre. »

« Bien. Quelle est la chose la plus importante que Nimbus doit faire ? »

« Traiter les commandes », dit Leo.

« Spécifiquement », insista Carlos.

« Une commande doit atteindre le restaurant dans les cinq secondes suivant la passation », dit Priya, « sinon la cuisine rate le créneau de timing. »

« Que se passe-t-il si ce n'est pas le cas ? »

« Le restaurant fait une erreur. Le client reçoit la mauvaise nourriture, ou attend trop longtemps. Il se plaint. Nous perdons un partenaire restaurant. »

« Donc le SLA de cinq secondes », dit Carlos, « n'est pas une cible technique. C'est une exigence de survie commerciale. »

Silence.

« Voilà », dit-il, « pourquoi les conversations d'architecture doivent commencer par les exigences commerciales. La technologie est en aval de la contrainte. »

**La structure de la revue d'architecture**

Une vraie revue d'architecture — le genre qui se passe avant de construire quelque chose d'important, ou quand on évalue si on peut passer à l'échelle — a une structure.

Carlos l'écrivit sur le tableau blanc :

**1. Comprendre les contraintes**

Qu'est-ce qui doit être vrai ? Qu'est-ce qui ne peut pas se passer ? (Pas « ce que nous voulons ». Quels sont les éléments non négociables ?)

**2. Comprendre les inconnues**

Qu'est-ce que nous ne savons pas ? Où faisons-nous des hypothèses ? Que se passe-t-il si ces hypothèses s'avèrent fausses ?

**3. Évaluer les options**

Quelles sont les alternatives réalistes ? Quels sont les compromis de chacune ?

**4. Identifier les modes de défaillance**

Comment cela casse-t-il ? Quelle est la séquence d'événements quand chaque mode de défaillance se déclenche ?

**5. Valider la surveillance**

Comment saurez-vous quand quelque chose ne va pas ? Avant que les utilisateurs ne vous le disent ?

**6. Définir le runbook**

Que fait quelqu'un à 3h du matin quand ça casse ?

Ce n'est pas une liste de vérification à suivre mécaniquement. C'est un cadre de réflexion. L'objectif est de s'assurer que les questions importantes sont posées *avant* d'être en production.

**Mener la revue : la nouvelle fonctionnalité de Nimbus**

Carlos avait été invité spécifiquement parce que Nimbus était sur le point de construire quelque chose de nouveau.

**La fonctionnalité** : « Nimbus Instant » — une garantie de livraison en 15 minutes. Si un restaurant partenaire ne respecte pas la fenêtre de 15 minutes plus d'une fois par semaine, Nimbus rembourserait automatiquement le client.

« Guidez-moi à travers les exigences techniques », dit Carlos.

Priya commença. « Nous avons besoin d'un suivi en temps réel du placement de la commande à la livraison. Nous devons comparer le temps de livraison réel par rapport au SLA de 15 minutes. Nous devons déclencher les remboursements automatiquement. »

« Quelle est l'exigence de latence pour les données de suivi ? »

« Quasi-temps-réel. Les clients voient des mises à jour de statut sur leur téléphone. »

« En combien de temps ? »

« Cinq secondes probablement. »

« Probablement ? »

« Dans les cinq secondes. C'est l'exigence produit. »

« Bien. Kinesis pour le flux d'événements, alors. Quel est le mode de défaillance si Kinesis est en retard ? »

« Les mises à jour de statut sont en retard pour le client. »

« C'est acceptable ? »

« Pour 10 secondes ? Probablement. Pour 60 secondes ? Non. »

« Donc quel est le SLA du système de suivi ? »

Priya regarda Leo. « Nous n'en avons pas encore. »

Carlos écrivit sur le tableau : *Inconnue : SLA du suivi.*

« Ça compte », dit-il. « Parce que le SLA détermine la conception de l'infrastructure. Si votre SLA est de 5 secondes, vous avez besoin d'une solution différente que si c'est 60 secondes. »

**Les questions que posent les architectes**

Pendant les deux heures suivantes, Carlos guida l'équipe à travers la revue. Une sélection de ses questions :

**Sur le stockage des données** :

« Où l'état de la commande est-il stocké pendant l'exécution ? Si l'application plante en cours de livraison, quel est le processus de récupération ? Pouvez-vous reconstruire l'état à partir des seuls événements ? »

**Sur le mécanisme de remboursement** :

« Le remboursement est déclenché automatiquement. Qu'est-ce qui empêche l'émission d'un remboursement deux fois ? Que se passe-t-il si le processeur de paiement expire et que vous n'êtes pas sûr que le remboursement a été accepté ? »

**Sur le suivi de livraison** :

« Vous vous fiez aux données GPS du coursier. Que se passe-t-il si le signal GPS est perdu pendant 90 secondes ? Comment distinguez-vous 'GPS perdu' de 'livraison en cours' de 'problème de livraison' ? »

**Sur la gestion des défaillances** :

« Si le service de remboursement est en panne, la commande passe-t-elle quand même ? Le client reçoit-il quand même sa nourriture ? Quelle est l'expérience utilisateur lors d'une défaillance partielle du système ? »

**Sur l'observabilité** :

« Comment savez-vous en ce moment combien de commandes sont actuellement dans les 5 minutes du SLA de 15 minutes ? Si ce chiffre augmente brutalement, qui est notifié ? »

Chaque question révélait une hypothèse que l'équipe faisait sans le réaliser.

« Nous n'avions pas pensé au problème du double remboursement », dit Leo par la suite. « On allait juste appeler l'API de paiement. »

« Ce n'est pas faux », dit Priya. « Mais vous avez besoin d'idempotence. L'opération de remboursement doit être sûre à appeler deux fois. »

« Une clé d'idempotence — un ID unique par tentative de remboursement, stocké dans une base de données avant d'appeler l'API de paiement. Si on appelle deux fois avec la même clé, l'API de paiement ignore le deuxième appel. »

« Ce qui signifie », ajouta Carlos, « que vous avez besoin d'un magasin d'état persistant pour les opérations de remboursement, pas seulement d'un événement dans une queue. »

C'est le genre de détail architectural qui émerge lors d'une revue structurée — et qui n'émerge souvent pas quand on construit juste.

**L'enregistrement de décision architecturale**

Après la revue, Carlos recommanda à l'équipe de documenter leurs décisions dans des **enregistrements de décision architecturale (ADR)** — de courts documents qui capturent :

- **Quelle décision a été prise**
- **Quelles alternatives ont été considérées**
- **Pourquoi cette décision a été prise (le contexte et les contraintes à ce moment)**
- **Quels sont les compromis**
- **Qu'est-ce qui nous amènerait à reconsidérer cette décision**

« Les ADR sont pour votre futur vous », dit Carlos. « Dans 18 mois, vous regarderez une partie de l'architecture et vous vous demanderez pourquoi elle a été faite ainsi. Si vous avez un ADR, vous comprendrez le contexte. Si vous n'en avez pas, vous laisserez soit les choses en l'état (parce que vous avez peur d'y toucher) ou vous les changerez (parce que vous ne compreniez pas pourquoi c'était fait ainsi). »

Leo rédigea le premier ADR cet après-midi-là : la décision d'utiliser Kinesis pour les événements de suivi de livraison, avec le contexte, les alternatives considérées (SQS, EventBridge, sondage) et les compromis.

**Ce qui fait un architecte**

À la fin de la session, Maya posa à Carlos la question originale : « Quelle est la différence entre prendre des décisions architecturales et penser comme un architecte ? »

Il réfléchit.

« Un architecte ne connaît pas plus la technologie qu'un ingénieur senior », dit-il. « Un bon architecte en connaît probablement un peu moins des derniers frameworks. Mais un architecte a un ensemble de questions par défaut différent. »

« Qu'est-ce que vous voulez dire ? »

« Quand vous êtes un ingénieur senior regardant une nouvelle fonctionnalité, vos premières questions sont généralement : "Que construisons-nous ? Comment ça fonctionne ? Quelle est la meilleure bibliothèque pour ça ?" Quand un architecte regarde la même fonctionnalité, les premières questions sont : "Quel problème cela résout-il ? Qu'est-ce qui casse en premier quand le trafic double ? Comment savons-nous quand c'est dégradé ? Quelle est l'expérience utilisateur quand le processeur de paiement est lent ?" »

« L'architecte pose des questions sur le système sous pression », dit Leo.

« Et sur la conséquence commerciale de chaque défaillance », ajouta Priya.

« Et », dit Tom, « sur ce qui arrive à la facture quand ça passe à l'échelle. »

Carlos hocha la tête. « Vous faites déjà tous ça. Vous le faites depuis le chapitre 1. La différence entre un ingénieur senior et un architecte n'est pas une certification ou un titre. C'est l'habitude de poser la prochaine question — celle qui révèle la chose à laquelle vous n'avez pas encore pensé. »

## Points forts et limites

**Revues d'architecture** :

- Détectent les modes de défaillance avant qu'ils ne soient en production
- Créent une compréhension partagée entre les membres de l'équipe qui ont souvent des connaissances cloisonnées
- Génèrent une documentation (ADR) qui rapporte des dividendes pendant des années
- Ralentissent la prise de décision de façon bénéfique — « avancer vite » sans revue, c'est « avancer vite et heurter le mur que vous n'avez pas vu »

**Là où ça se complique** :

- Nécessite quelqu'un suffisamment compétent pour poser les bonnes questions — la revue n'est bonne que si le réviseur l'est
- Peut devenir bureaucratique si traité comme une case à cocher plutôt qu'une conversation
- Certaines décisions architecturales n'ont vraiment pas besoin d'une revue complète — savoir lesquelles en ont besoin est lui-même une compétence architecturale
- Le résultat (ADR, diagrammes, journaux de décision) doit être maintenu à mesure que le système évolue

Dans le prochain chapitre : la réponse la plus utile, frustrante et honnête de tout le génie logiciel.

## Résumé

- Les revues d'architecture commencent par **les exigences commerciales, pas la technologie**.
- La structure de la revue : contraintes → inconnues → options → modes de défaillance → surveillance → runbooks.
- Les architectes demandent : Qu'est-ce qui casse en premier ? Comment savons-nous que c'est dégradé ? Quelle est l'expérience utilisateur pendant la défaillance ? Quel est le coût à l'échelle ?
- Les **enregistrements de décision architecturale (ADR)** capturent ce qui a été décidé, pourquoi, et ce qui causerait une reconsidération.
- Penser comme un architecte est une habitude : poser la prochaine question, surtout sur les modes de défaillance, les conséquences commerciales et l'économie à l'échelle.
- La différence entre prendre des décisions et être un architecte est l'ensemble de questions par défaut : les architectes se concentrent par défaut sur les questions au niveau système et sur les défaillances, pas seulement sur les questions d'implémentation.

## Conseils pour l'examen

*SAA-C03 Domaine : Inter-domaines — raisonnement architectural*

Ce chapitre concerne moins des sujets d'examen spécifiques et plus l'état d'esprit que l'examen teste.

- **Les scénarios SAA-C03** décrivent presque toujours une contrainte commerciale en premier (« l'entreprise ne peut pas se permettre plus d'1 heure d'indisponibilité ») et vous demandent de sélectionner l'architecture qui la satisfait. Pratiquez la traduction des contraintes commerciales en exigences techniques.
- **Réflexion sur les modes de défaillance** : De nombreuses questions d'examen décrivent un système et demandent ce qui se passe quand un composant tombe en panne. Pratiquez à demander « qu'est-ce qui casse en premier ? » pour les architectures que vous rencontrez.
- **Réflexion sur les compromis** : L'examen a rarement une réponse « parfaite ». Il demande la *meilleure* réponse étant donné un ensemble de contraintes. Soyez à l'aise avec « cette option est correcte compte tenu de ces exigences spécifiques, même si une autre option serait meilleure dans des conditions différentes. »
- **Idempotence** : Le problème du double remboursement est un vrai défi des systèmes distribués. Les clés d'idempotence (uniques par opération, vérifiées avant l'exécution) sont la solution standard. Connaissez ce modèle.
- **Enregistrements de décision architecturale** : Pas un service AWS, mais une bonne pratique qui reflète le pilier Excellence opérationnelle du Well-Architected Framework.

## Exercices

**Exercice 1 — Mémorisation**

Carlos a posé six types de questions lors de la revue d'architecture. Pouvez-vous reconstruire les six domaines sans regarder le chapitre ?

*(Indice : Ils sont listés dans la section « Structure de la revue d'architecture ». Essayez de les rappeler de mémoire — l'acte de tentative de rappel (même si vous échouez) renforce la rétention à long terme.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise construit un système de gestion des enchères en temps réel pour la publicité en ligne. Les enchères doivent être évaluées et répondues en 100 millisecondes. Le système traite 1 million d'enchères par seconde au pic. Si le système d'enchères est en panne, l'entreprise perd des revenus publicitaires. L'équipe base de données de l'entreprise propose d'utiliser RDS Aurora avec 10 répliques en lecture. L'architecte solution doit évaluer cette proposition.

Quelle préoccupation l'architecte doit-il soulever EN PREMIER ?

A) Le coût de 10 répliques en lecture Aurora est trop élevé pour le budget  
B) Les répliques en lecture Aurora ont un délai de réplication qui peut causer des problèmes de cohérence  
C) La latence de requête typique d'Aurora de 1 à 5 ms peut ne pas satisfaire le SLA de réponse de 100 ms  
D) RDS Aurora ne prend pas en charge les volumes de transactions de 1 million de requêtes par seconde à cette exigence de latence

**Indice 1** : La contrainte principale est un temps de réponse total de 100 ms à 1 million de requêtes/seconde. Laquelle de ces préoccupations menace directement la satisfaction de cette contrainte ?

**Indice 2** : La latence de requête Aurora est typiquement de 1 à 5 ms. 1 à 5 ms pour la requête de base de données laisse 95 à 99 ms pour le réseau, la logique applicative et la sérialisation. La contrainte de 100 ms est-elle menacée ?

**Indice 3** : Aurora peut gérer des IOPS élevées, mais 1 million de requêtes par seconde est un taux extraordinaire. Que se passe-t-il avec l'architecture à cette échelle ?

**Réponse** : D

**Explication** : Bien qu'Aurora soit haute performance, 1 million de requêtes par seconde avec un temps de réponse total de 100 ms est une exigence extrême. L'architecte doit d'abord questionner si Aurora (ou toute base de données relationnelle) peut servir de système de recherche principal à cette échelle et cette latence. Des systèmes comme celui-ci utilisent typiquement des magasins de données en mémoire (Redis) ou des bases de données à faible latence spécialisées, pas des bases de données relationnelles avec une sémantique SQL complète. Le SLA de 100 ms est réalisable pour les seules requêtes Aurora, mais la combinaison de 1M RPS et d'un SLA total de 100 ms dépasse les caractéristiques de débit typiques d'Aurora.

**Pourquoi pas A ?** Le coût est une préoccupation valable, mais la première préoccupation devrait être de savoir si l'architecture est techniquement réalisable aux exigences indiquées.

**Pourquoi pas B ?** Le délai de réplication dans les répliques en lecture Aurora est typiquement inférieur à 100 ms — acceptable pour la plupart des cas d'utilisation. Les problèmes de cohérence sont réels mais secondaires par rapport à la question de faisabilité.

**Pourquoi pas C ?** La latence Aurora de 1 à 5 ms est bien dans le SLA de 100 ms pour la portion de requête de base de données. Ce n'est pas la préoccupation principale.

*SAA-C03 Domaine : Inter-domaines — conception de systèmes*

**Exercice 3 — Défi architectural** *(Facultatif)*

Appliquez la structure de revue d'architecture à un système réel ou hypothétique :

Une startup veut construire un jeu de quiz multijoueur en temps réel. Les joueurs rejoignent des salles de jeu (jusqu'à 10 joueurs chacune). Chaque tour affiche une question pendant 15 secondes ; tous les joueurs répondent simultanément. Les scores sont calculés instantanément après chaque question. Les jeux durent 10 tours. Utilisation au pic : 50 000 jeux simultanés.

Passez en revue les six étapes :

1. Quelles sont les contraintes non négociables ?
2. Quelles sont les inconnues et les hypothèses ?
3. Quelles sont les options technologiques réalistes ?
4. Quels sont les modes de défaillance ?
5. Comment saurez-vous quand c'est dégradé ?
6. À quoi ressemble le runbook à 3h du matin ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la structure de revue comme outil de réflexion.)*

## Scène post-générique

Carlos quitta le bureau à 18h.

L'équipe resta un moment après, sans rien faire de particulier.

« J'ai l'impression d'avoir appris plus en ces deux heures que dans n'importe quel chapitre sur un service AWS individuel », dit Leo.

« C'est parce que ces chapitres parlaient d'outils », dit Maya. « Cela parlait de jugement. »

« Le jugement, ça s'enseigne ? » demanda-t-il.

« Oui », dit Priya. « Mais pas par la lecture. Par la pratique. Par la prise de décisions, voir ce qui casse, réfléchir à pourquoi. »

« Par l'expérience », dit Tom.

« Par l'expérience structurée », corrigea Priya. « L'expérience sans réflexion ne construit pas le jugement. Il faut poser les questions après. »

Maya regarda le tableau blanc. Les notes de la revue étaient encore là — contraintes, inconnues, modes de défaillance, questions de surveillance. Elles remplissaient deux tableaux blancs.

« Ça devrait aller dans l'ADR », dit-elle.

Leo tapait déjà.

Dans le dernier chapitre : la chose qu'aucun outil ou cadre ne peut vous donner — et pourquoi « ça dépend » est la réponse la plus honnête et la plus puissante de l'architecture logicielle.
