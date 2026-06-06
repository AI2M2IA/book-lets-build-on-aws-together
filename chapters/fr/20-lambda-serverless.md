# Chapitre 20 : Le modèle du freelance

C'était un mercredi après-midi tranquille. Priya avait pour une fois retiré son casque, et le bureau avait ce genre de bourdonnement sourd qui signifie que tout le monde se concentre mais que personne ne panique. Leo avait un tableau de bord des coûts ouvert sur un écran et la liste des instances EC2 sur l'autre.

Pensez à un freelance qui travaille sur appel. Il ne reste pas assis à un bureau de neuf heures à dix-sept heures. Il attend. Le téléphone sonne, il fait le travail, il envoie une facture, il retourne attendre. Pas de travail, pas de coût. Une rafale de demandes, il les traite toutes simultanément. Vous ne payez que pour les heures réellement travaillées — pas pour les heures pendant lesquelles il est resté disponible.

C'est le modèle dont traite ce chapitre.

Il y a ici une subtilité qu'il vaut la peine de retenir. Le modèle traditionnel est : embaucher un employé, payer pour 8 heures, obtenir un rendement variable. Le modèle du freelance est : payer uniquement quand le téléphone sonne, obtenir exactement ce qui a été demandé. Pour une entreprise à la demande prévisible et constante, le modèle de l'employé est plus efficace — vous savez que le téléphone sonnera constamment, donc payer à l'heure est équivalent et il n'y a pas de surcharge d'engagement et de désengagement. Pour une entreprise à la demande variable, en pics, ou peu fréquente, le modèle du freelance est radicalement moins cher.

AWS offre ce modèle pour le calcul — et savoir s'il a du sens dépend de votre schéma de demande. La première question n'est jamais « ce modèle est-il bon ? » mais « à quoi ressemble réellement ma charge de travail ? ».

Pour la plupart des charges de travail plus grandes qu'une startup : un mélange. Certaines choses tournent constamment (le serveur API, la base de données). Certaines choses ne tournent que lorsqu'elles sont déclenchées (traitement d'événements, génération de rapports, redimensionnement d'images). Le modèle du freelance est pour la seconde catégorie — et Nimbus était sur le point de découvrir quelle part de sa facture lui appartenait.

---

La diffusion en éventail SQS/SNS avait découplé le flux de commandes, mais les travailleurs consommant ces files tournaient encore sur des instances EC2 facturées à l'heure — peu importe le nombre d'e-mails qu'ils envoyaient réellement. L'architecture était bonne ; le modèle de coût avait encore une fuite.

Priya l'avait remarqué en premier.

« Le service d'e-mails », dit-elle. « Combien d'e-mails envoyons-nous par jour ? »

Leo vérifia les métriques. « En moyenne 400 par jour. En pic environ 1 200 les vendredis soirs. »

« Et l'instance EC2 qui fait tourner le service d'e-mails — combien de temps tourne-t-elle ? »

« Toujours. 24h/24, 7j/7. »

« Même à 3 h du matin quand on envoie zéro e-mail ? »

Silence.

Leo afficha le graphique CloudWatch du CPU de l'instance EC2 du service d'e-mails. Le graphique montrait 18 heures de fonctionnement continu. Au pic du vendredi : CPU à 38 %, gérant la rafale d'e-mails. Après minuit : le CPU tomba à 3 %. Y resta jusqu'à ce que les commandes du déjeuner commencent.

Trois pour cent de CPU pendant 18 heures d'affilée. L'instance tournait. Elle facturait. Elle ne faisait rien de significatif.

« On paie pour qu'un ordinateur reste là à ne rien faire », dit Leo.

« Pendant combien d'heures par jour ? »

Encore le silence.

« Environ 18. »

Tom était très attentif maintenant.

« Et ce n'est pas seulement le service d'e-mails », ajouta Priya. « Le service de redimensionnement d'images pour les photos de restaurants tourne à 1 % de CPU la plupart du temps. Il ne fait un pic que lorsqu'un restaurant téléverse un nouveau menu. Ce qui arrive, quoi, quelques fois par jour par restaurant ? »

« Oui », confirma Leo.

« La tâche de nettoyage nocturne qui supprime les fichiers temporaires — elle tourne pendant 4 minutes à 2 h du matin puis reste complètement inactive pendant 23 heures et 56 minutes. »

« Oui aussi. »

Le schéma était le même sur tous les services plus petits de Nimbus : du calcul payé 24 heures par jour, utilisé pour une fraction de ce temps.

---

**Le serveur n'est pas toujours la réponse**

Les instances EC2 sont permanentes. Vous en démarrez une et elle tourne jusqu'à ce que vous l'arrêtiez — 24 heures sur 24, 7 jours sur 7, indépendamment de l'utilisation réelle. Pour votre serveur web (qui gère le trafic à toute heure), c'est correct. Pour le service d'e-mails (qui envoie des rafales d'e-mails puis reste inactif pendant des heures), c'est du gaspillage.

L'Auto Scaling Group peut réduire le service d'e-mails à une instance durant les heures creuses. Mais une instance tourne quand même en permanence.

C'est la question à laquelle Tom revenait sans cesse en regardant la facture : que faisait réellement chaque service pendant ces 18 heures à 3 % de CPU ? Pas rien, techniquement — l'instance attendait, vérifiait les événements, maintenait son état. Mais d'un point de vue commercial : rien. Le service ne livrait pas de valeur. Il facturait.

Pour les charges de travail véritablement inactives la plupart du temps, une instance EC2 toujours allumée revient à payer le loyer d'un appartement que vous ne visitez que le week-end. L'appartement est à vous ; le loyer ne s'arrête pas.

Le modèle du freelance résout cela complètement. Le code existe. Il ne s'exécute simplement pas tant qu'il n'y a pas de raison de l'exécuter. Pas de coût d'inactivité. Pas de capacité réservée. Pas de serveur en attente près du téléphone.

C'est la prémisse du **calcul serverless**.

**AWS Lambda : du code sans serveurs**

**AWS Lambda** vous permet d'exécuter du code en réponse à des événements sans provisionner ni gérer de serveurs. Vous téléversez une fonction, vous spécifiez ce qui la déclenche, et Lambda l'exécute quand le déclencheur se produit.

Une fonction Lambda :

- N'a pas d'état persistant (chaque invocation est indépendante)
- S'exécute jusqu'à 15 minutes par invocation
- Évolue automatiquement de 0 à des milliers d'invocations simultanées
- Est facturée uniquement quand elle s'exécute (par milliseconde d'exécution, arrondie à la hausse, par Go de mémoire alloué)

En l'absence de déclencheur, Lambda ne coûte rien. Quand des déclencheurs se produisent, Lambda s'exécute et facture. Quand 10 000 déclencheurs se produisent simultanément, Lambda exécute 10 000 invocations simultanées. La mise à l'échelle est automatique et quasi instantanée.

**Déclencheurs d'événements : ce qui réveille Lambda**

Les fonctions Lambda ne s'exécutent pas d'elles-mêmes — elles répondent à des événements. Les déclencheurs courants sont :

- **File SQS** : Traiter les messages d'une file. Lambda interroge la file et invoque la fonction avec des lots de messages.
- **API Gateway** : Une requête HTTP arrive. API Gateway déclenche Lambda. Lambda génère une réponse.
- **Événement S3** : Un fichier est téléversé sur S3. Lambda le traite (redimensionner une image, analyser un CSV, valider un document).
- **SNS** : Un message est publié sur un sujet. Lambda est notifié.
- **DynamoDB Streams** : Un enregistrement dans DynamoDB change. Lambda traite le changement.
- **CloudWatch Events (EventBridge)** : Un événement planifié (comme un cron job) s'exécute à une heure définie.
- **ALB** : Une requête HTTP arrive sur l'équilibreur de charge. Lambda peut gérer certaines routes.

Pour Nimbus, le service d'e-mails est devenu une fonction Lambda déclenchée par sa file SQS. Quand un message arrive dans la file, Lambda est invoqué avec le contenu du message, envoie l'e-mail via SES (Simple Email Service), puis se termine.

Zéro serveur. Zéro temps d'inactivité. Zéro coût à l'inactivité.

Le modèle Lambda + SQS vaut la peine d'être intériorisé : SQS gère la file, la durabilité, la logique de réessai et la DLQ. Lambda gère le traitement. Vous obtenez les avantages de découplage de SQS avec l'économie de mise à l'échelle vers zéro de Lambda. Aucun service ne fait le travail de l'autre. Ils se composent proprement.

« Que se passe-t-il avec un message malformé dans la file ? » demanda Priya. « Une mauvaise entrée peut-elle faire planter Lambda d'une manière qui affecte d'autres fonctions du compte ? »

Les invocations Lambda sont isolées les unes des autres. Une fonction qui plante n'affecte pas les autres fonctions. Une Lambda qui lève une exception non gérée sur un message malformé : le message retourne dans la file, réessaie jusqu'à la limite configurée, puis passe dans la DLQ. La Lambda elle-même reste disponible pour le message suivant. La validation des entrées à l'intérieur du gestionnaire Lambda reste importante — pour attraper les données malformées avant de tenter de les traiter — mais un seul mauvais message ne peut pas faire tomber la fonction.

**Le problème du démarrage à froid**

Les fonctions Lambda s'exécutent dans des **environnements d'exécution** — de petits conteneurs isolés. Quand une fonction est invoquée :

1. AWS vérifie si un environnement d'exécution chaud est disponible (un qui a géré une invocation récente)
2. Si chaud : la fonction s'exécute immédiatement
3. Si froid : AWS initialise un nouvel environnement d'exécution — télécharge votre code, démarre le runtime, exécute votre code d'initialisation — puis exécute la fonction

Un **démarrage à froid** ajoute de 100 ms à plusieurs secondes de latence selon le runtime (Java et .NET ont des démarrages à froid plus longs que Python et Node.js) et la taille de votre package de code.

Vous vous demandez peut-être : si Lambda démarre de zéro à chaque fois, cela ne le rend-il pas plus lent qu'un serveur déjà en cours d'exécution ? Oui — parfois. C'est le problème du démarrage à froid, et il importe pour les API destinées aux utilisateurs et sensibles au temps. Il n'importe pas du tout pour les travaux d'arrière-plan où l'utilisateur a déjà reçu sa confirmation. Un démarrage à froid de 200 ms sur un service d'e-mails qui tourne en arrière-plan est invisible pour quiconque.

Pour le traitement asynchrone (envoi d'e-mails, redimensionnement d'images), les démarrages à froid sont invisibles pour les utilisateurs.

Pour les API synchrones (requêtes HTTP où un utilisateur attend une réponse), les démarrages à froid peuvent provoquer des réponses occasionnellement lentes.

**Atténuations** :

- **Concurrence provisionnée** : Préchauffer un nombre spécifié d'environnements d'exécution. Ils sont toujours prêts. Vous payez pour eux même quand ils ne traitent pas de requêtes.
- **Tailles de packages réduites** : Un code plus petit s'initialise plus vite.
- **Invocations de préchauffage** : Des pings planifiés pour maintenir les fonctions chaudes (une approche courante mais peu élégante).
- **Choisir le bon runtime** : Python et Node.js démarrent plus vite à froid que Java.

**Une vraie enquête sur un démarrage à froid**

Deux semaines après la migration vers Lambda, Leo reçut un message Slack d'un partenaire restaurant : « La confirmation de commande prend parfois 3 secondes. D'habitude c'est rapide. Que se passe-t-il ? »

Leo afficha les métriques CloudWatch de la fonction Lambda. Dans le graphique « Duration », il pouvait voir un schéma : la première invocation après tout intervalle de plus de 15-20 minutes faisait un pic à 2 800-3 200 millisecondes. Les invocations suivantes : 180-220 millisecondes.

Des démarrages à froid classiques.

Il récupéra la trace X-Ray pour l'une des invocations de 3 secondes. La chronologie le montrait clairement :

- Phase d'initialisation : 2 640 ms (téléchargement du code de la fonction, démarrage du runtime Node.js, exécution du code d'initialisation au niveau du module)
- Exécution de la fonction de traitement : 290 ms

La phase d'initialisation était le problème. Il regarda le code d'initialisation. La fonction importait un grand SDK, initialisait une connexion à la base de données, et chargeait la configuration depuis AWS Secrets Manager — tout au démarrage.

« Une partie de cette initialisation n'a besoin de se produire qu'une fois par environnement d'exécution », dit Leo. « Mais elle se produit à chaque démarrage à froid. »

Il restructura le code Lambda pour initialiser la connexion à la base de données en dehors de la fonction de traitement (afin qu'elle soit réutilisée à travers les invocations chaudes) et réduisit la taille du package en supprimant les modules SDK inutilisés. Il passa aussi du regroupement de tout le SDK AWS à l'importation des seuls services spécifiques dont il avait besoin.

Après l'optimisation :

- Durée du démarrage à froid : 1 100 ms (toujours présent, mais moins sévère)
- Invocations chaudes : 165 ms

Le démarrage à froid de 1,1 seconde se produisait encore occasionnellement. Pour le service d'e-mails (asynchrone, délai destiné à l'utilisateur invisible), c'était acceptable. Pour la Lambda de notification du restaurant (destinée au client, commandée depuis une tablette), Priya poussa pour la concurrence provisionnée : deux environnements préchauffés toujours prêts.

« Combien cela coûte-t-il par mois ? » demanda Tom.

Deux environnements de concurrence provisionnée à 256 Mo : environ 5,40 $/mois. Les pics de latence cessèrent.

**Tarification de Lambda : pourquoi Tom souriait**

La tarification de Lambda a deux composantes :

1. **Frais de requête** : 0,20 $ par million d'invocations
2. **Frais de durée** : 0,0000166667 $ par Go-seconde (mémoire allouée × secondes d'exécution)

Le premier million de requêtes par mois est gratuit (toujours, pas seulement la première année).

« Combien cela coûte-t-il par mois ? » demanda Tom avant que Leo puisse ouvrir la calculatrice.

Tom fit le calcul pour le service d'e-mails lui-même :

- Supposons que chaque jour soit un vendredi — pire cas : 1 200 e-mails par jour × 30 jours = 36 000 invocations par mois
- Chaque invocation dure ~2 secondes avec 256 Mo de mémoire
- Durée : 36 000 × 2 × 0,25 Go × 0,0000166667 $ = 0,30 $/mois
- Requêtes : 36 000 << 1 000 000 (niveau gratuit) = 0,00 $/mois

« Et ces 18 000 Go-secondes sont bien à l'intérieur des 400 000 Go-secondes de durée toujours gratuites », ajouta Tom. « Donc les frais réels seraient nuls. Mais j'ignore le niveau gratuit exprès — je veux connaître le vrai coût unitaire. »

L'instance EC2 pour le service d'e-mails : 18 $/mois.

« Je l'ai déjà déployé — oh. » Leo se ravisa. Il avait poussé la Lambda du service d'e-mails en production avant de finir la configuration de la DLQ. « Donne-moi cinq minutes. »

Tom resta silencieux un moment. Puis : « On devrait faire ça pour tout. »

**Ce que Lambda fait bien (et ce qu'il ne fait pas)**

« Attends — mais *pourquoi* n'utiliserions-nous pas simplement Lambda pour tout, alors ? » demanda Maya. « Si c'est moins cher et que ça s'adapte automatiquement, où est le piège ? »

« La limite de 15 minutes », dit Leo. « Et les démarrages à froid pour tout ce qui est destiné à l'utilisateur. Et l'absence d'état — vous ne pouvez rien garder en mémoire entre les invocations. »

Si votre charge de travail est en pics, événementielle, et se termine en moins de 15 minutes, Lambda coûtera une fraction d'une instance EC2 toujours allumée — mais si votre charge de travail est un travail de traitement de données de longue durée qui approche ou dépasse la limite de 15 minutes, Lambda est le mauvais outil et vous aurez besoin d'ECS, de Batch, ou d'une approche basée sur EC2.

Lambda excelle pour :

- **Le traitement événementiel** : Répondre à des événements (téléversements de fichiers, messages en file, tâches planifiées)
- **Les tâches de courte durée** : Un traitement qui se termine bien avant les 15 minutes
- **Le trafic irrégulier et imprévisible** : Lambda évolue de 0 à des milliers instantanément — aucun préprovisionnement
- **Les opérations peu fréquentes** : Un rapport qui s'exécute à 2 h du matin quotidiennement. Une tâche de nettoyage hebdomadaire.
- **Le code de liaison** : De petites fonctions qui déplacent des données entre services

Vous vous demandez peut-être : qu'advient-il de la mise à l'échelle de Lambda quand une rafale soudaine de 10 000 événements arrive simultanément ? La limite de concurrence par défaut de Lambda est de 1 000 exécutions simultanées par compte. Si 10 000 événements arrivent d'un coup, jusqu'à 1 000 invocations s'exécutent immédiatement ; le reste attend dans la file SQS (si déclenché via SQS) et est traité à mesure que la capacité se libère. C'est généralement bien pour le traitement basé sur les files. Pour les cas d'usage sensibles à la latence, la limite de rafale de Lambda (le taux initial auquel de nouvelles exécutions simultanées sont ajoutées) peut provoquer un bref throttling lors de pics soudains — la concurrence provisionnée contourne cela en ayant de la capacité préallouée.

Pour le service d'e-mails de Nimbus à leur échelle actuelle, 1 000 invocations simultanées étaient bien plus que ce dont ils auraient jamais besoin. Mais c'est la bonne contrainte à connaître avant de l'atteindre.

Lambda est peu adapté pour :

- **Les processus de longue durée** : La limite de 15 minutes est un mur infranchissable
- **Les applications avec état** : Les fonctions Lambda sont sans état par conception — chaque invocation est indépendante
- **Les API à haut débit et faible latence** : Les démarrages à froid peuvent provoquer des pics de latence ; la concurrence provisionnée atténue cela mais augmente le coût
- **Les applications nécessitant des connexions persistantes** : Lambda ne peut pas facilement maintenir un pool de connexions à une base de données de longue durée (bien que des outils de pooling de connexions comme RDS Proxy aident)
- **Les serveurs web traditionnels** : Possible, mais pas l'usage naturel

**Le mur des 15 minutes : quand Lambda est le mauvais outil**

Trois semaines après la migration, Leo essaya de déplacer une charge de travail de plus vers Lambda : le générateur de rapport analytique nocturne. Il extrayait les données de commande de la base de données, les joignait aux métadonnées des restaurants, calculait des statistiques, et générait un PDF.

La première nuit, l'invocation Lambda échoua avec une erreur de délai d'attente.

« La génération du rapport a pris 17 minutes », dit Leo le lendemain matin.

« Le maximum de Lambda est 15 », dit Priya.

« Oui. Je le sais maintenant. »

Il avait vérifié le temps de traitement moyen (8 minutes) et supposé que Lambda fonctionnerait. Il n'avait pas vérifié la queue — les nuits où le volume de données était plus élevé et où la requête prenait plus de temps. Ces nuits-là, 15 minutes ne suffisaient pas.

« Donc le rapport n'est juste... pas généré ? » demanda Maya.

« Correct. Pas de notification d'erreur. Pas de rapport partiel. Juste le silence. »

« Je l'ai déjà déployé — oh », dit Leo.

C'était l'une des façons spécifiques dont Lambda échoue sans grâce : un délai d'attente ne produit aucune sortie, aucun message d'erreur dans l'application, juste un journal d'erreur CloudWatch. Si vous ne surveillez pas spécifiquement les erreurs de délai d'attente Lambda, vous pourriez ne pas le remarquer pendant des jours.

La solution : déplacer le générateur de rapport vers ECS Fargate — des conteneurs sans gérer de serveurs ; chapitre suivant — qui n'a pas de limite de temps. Lambda était le mauvais outil pour les charges de travail qui pourraient dépasser 15 minutes même occasionnellement. La leçon n'était pas « Lambda est mauvais ». La leçon était « Lambda est le bon outil pour les charges de travail qui tiennent dans ses contraintes — et une source d'échecs surprenants quand elles n'y tiennent pas ».

**RDS Proxy : pooling de connexions pour Lambda**

La nature sans état de Lambda crée un problème de base de données spécifique.

Quand une instance EC2 se connecte à RDS, elle maintient un pool de connexions persistant. L'application réutilise les connexions du pool. RDS peut gérer, disons, 200 connexions simultanées.

Quand Lambda gère 500 invocations simultanées, chaque invocation essaie d'ouvrir sa propre connexion à la base de données. Cela fait 500 nouvelles connexions — submergeant une base de données qui en prend en charge 200.

**Amazon RDS Proxy** se place entre les fonctions Lambda et RDS, maintenant un pool de connexions persistant et multiplexant les connexions éphémères de Lambda à travers lui.

Au lieu de : invocation Lambda → nouvelle connexion RDS (pour chacune des 500 invocations simultanées)

Avec RDS Proxy : invocation Lambda → RDS Proxy → pool de 20 connexions RDS persistantes

« Le proxy a besoin des identifiants RDS », dit Priya. « Où vivent-ils ? Les stocke-t-il ? »

RDS Proxy stocke les identifiants dans Secrets Manager et les fait tourner automatiquement. Le rôle IAM de la fonction Lambda lui accorde l'accès au proxy (en utilisant l'authentification IAM), pas directement aux identifiants RDS. Les identifiants ne sont jamais exposés au code Lambda.

« Donc la fonction Lambda s'authentifie via IAM », confirma Leo, « et le proxy gère les identifiants réels de la base de données. »

Pour la Lambda de traitement des commandes de Nimbus (celle qui interrogeait RDS pour la validation des commandes), RDS Proxy a éliminé l'épuisement du pool de connexions pendant le pic de trafic du vendredi.

**Lambda Layers : dépendances partagées**

La Lambda du service d'e-mails, la Lambda de notification et la Lambda de rapport partageaient toutes le même code de bibliothèque interne : fonctions utilitaires pour formater les devises, assainir les entrées, journaliser au format standard.

Sans les Lambda Layers, ce code partagé devait être regroupé dans le package de déploiement de chaque fonction. Trois fonctions, trois copies de la même bibliothèque de 2 Mo. Quand la bibliothèque était mise à jour, les trois fonctions nécessitaient de nouveaux déploiements.

Les **Lambda Layers** sont des packages séparés que les fonctions Lambda peuvent référencer au moment de l'exécution. La bibliothèque partagée a été extraite dans une couche. Les trois fonctions référençaient la couche. Les mises à jour de la bibliothèque partagée signifiaient mettre à jour la version de la couche — pas redéployer les trois fonctions.

Avantage supplémentaire : des packages de fonctions individuels plus petits signifient des démarrages à froid plus rapides.

« Une chose que les couches ne changent pas : le rôle d'exécution », dit Priya. « Si une Lambda a des permissions trop larges, une fonction compromise peut accéder à tout dans le compte. »

« Même principe que les rôles EC2 », dit Leo. « Moindre privilège. Chaque Lambda n'obtient que les permissions dont elle a réellement besoin. »

« Donc Lambda n'est pas un remplacement d'EC2 », dit Maya. « C'est un outil différent pour des tâches différentes. »

« L'API web de Nimbus reste sur EC2 ou ECS », confirma Leo. « Le service d'e-mails, le redimensionneur d'images, le générateur de rapport nocturne, le nettoyeur de logs — ceux-là passent sur Lambda. »

**La philosophie serverless**

Lambda fait partie d'un concept plus large : le **serverless** — construire des applications où vous ne gérez aucun serveur, seulement du code.

Une stack Nimbus entièrement serverless pourrait ressembler à :

- API Gateway + Lambda (au lieu d'EC2 avec un serveur web)
- DynamoDB (au lieu de RDS — également serverless, pas de gestion de serveur)
- S3 (ressources statiques — intrinsèquement serverless)
- SNS + SQS (messagerie — serverless)
- Lambda (tout le traitement en arrière-plan)

L'attrait : vous écrivez du code ; AWS gère tout le reste. Pas de patching, pas de configuration de mise à l'échelle, pas de planification de capacité.

## Amazon API Gateway

La liste des déclencheurs Lambda mentionnait brièvement API Gateway : une requête HTTP arrive, API Gateway déclenche Lambda. C'est exact, mais cela sous-estime ce qu'API Gateway est réellement.

« Attends — mais *pourquoi* mettrions-nous API Gateway devant Lambda ? » demanda Maya. « Lambda ne peut-il pas simplement recevoir directement des requêtes HTTP ? »

Lambda peut recevoir des requêtes HTTP via une URL de fonction — un point de terminaison HTTPS simple et direct. Mais il ne gère pas le routage, l'autorisation, le throttling, la mise en cache ou la transformation de requêtes. Pour une API de production, ces préoccupations existent peu importe que votre backend soit Lambda ou EC2.

**Amazon API Gateway** est un service entièrement géré pour créer, déployer et gérer des API à n'importe quelle échelle. Il gère la gestion du trafic, l'autorisation, le throttling, la mise en cache et la surveillance afin que votre fonction Lambda (ou EC2, ou tout backend HTTP) n'ait pas à les implémenter elle-même.

**Trois types d'API :**

**REST API** est l'option la plus riche en fonctionnalités. Elle prend en charge la transformation des requêtes et des réponses, la mise en cache des réponses, les plans d'utilisation liés à des clés d'API, et tous les types d'autorisation. La plupart des questions de l'examen SAA-C03 qui mentionnent API Gateway impliquent la REST API.

**HTTP API** est plus simple et moins chère — environ 70 % de coût en moins que la REST API. Elle est conçue pour les backends Lambda et les proxys HTTP. Elle prend en charge l'autorisation OIDC et OAuth 2.0 mais pas la transformation des requêtes ni la mise en cache. Si vous n'avez pas besoin des fonctionnalités avancées de la REST API, l'HTTP API est le bon choix.

**WebSocket API** gère des connexions persistantes bidirectionnelles. API Gateway gère le cycle de vie de la connexion et route les messages vers Lambda en fonction du contenu du message. La fonction Lambda n'a pas besoin de gérer l'état du socket — API Gateway le fait.

**Options d'autorisation** (celles que l'examen teste) :

**L'autorisateur de groupe d'utilisateurs Cognito** valide un JWT issu d'un groupe d'utilisateurs Cognito. Aucune Lambda requise. API Gateway vérifie le jeton lui-même. S'il est valide, la requête passe.

**L'autorisateur Lambda** exécute votre propre fonction Lambda pour valider un jeton — un JWT personnalisé, un jeton OAuth d'un fournisseur d'identité tiers, une clé d'API dans un format propriétaire. La Lambda renvoie une politique IAM. Si la politique autorise l'action, la requête continue.

**La clé d'API** est une simple clé passée dans un en-tête de requête. Les clés d'API servent à la limitation de débit par client, pas à l'authentification. Ne les utilisez pas comme mécanisme de sécurité — ce ne sont pas des secrets, ce sont des identifiants.

**Throttling et plans d'utilisation :**

Par défaut, API Gateway autorise 10 000 requêtes par seconde au niveau du compte (une limite souple), avec une rafale de 5 000. Dépassez-la et les clients reçoivent un `429 Too Many Requests` — votre backend ne le ressent même jamais. Quand vous avez besoin de limites par client, vous créez un plan d'utilisation : attachez-le à une clé d'API, définissez un taux de requêtes et un quota quotidien ou mensuel. Les rafales d'un client ne consomment pas l'allocation d'un autre client.

Deux chiffres à retenir : la charge utile maximale est de **10 Mo**, et le délai d'attente d'intégration par défaut est de **29 secondes** — si votre backend prend plus de temps, la passerelle abandonne. (Depuis 2024, ce délai peut être relevé au-delà de 29 secondes pour les REST API régionales et privées via une augmentation de quota — mais le défaut de 29 secondes reste ce que l'examen attend.) API Gateway sert aux API requête/réponse, pas aux travaux de longue durée ; pour ceux-là, confiez le travail à SQS ou Step Functions et répondez immédiatement.

« Combien cela coûte-t-il par mois ? » demanda Tom.

Pour la REST API : 3,50 $ par million d'appels d'API, plus 0,09 $ par Go de transfert de données. Pour un trafic petit à moyen, c'est essentiellement gratuit. Pour les API à fort volume, le prix plus bas de l'HTTP API devient significatif.

Leo pointa la liste des déclencheurs Lambda qu'il avait écrite plus tôt. « Donc API Gateway n'est pas juste un moyen de déclencher Lambda. C'est la chose qui fait que Lambda ressemble à une vraie API. »

« La fonction Lambda gère la logique métier », dit Priya. « API Gateway gère tout ce qui est devant elle — routage, auth, throttling, surveillance. Chacun fait une seule chose. »

« Et si quelqu'un essaie d'appeler la Lambda directement, en contournant API Gateway ? »

« La politique d'exécution de la Lambda n'autorise que les invocations depuis API Gateway », dit Priya. « La politique basée sur les ressources de la Lambda refuse tout le reste. »

La réalité : le serverless a sa propre complexité opérationnelle — déboguer des fonctions Lambda distribuées, gérer les démarrages à froid, comprendre les limites de concurrence. Ce n'est pas plus simple, juste différent.

« Attends — mais *pourquoi* le serverless n'est-il "pas plus simple" ? » demanda Maya. « Tout l'argument est qu'il supprime la charge opérationnelle. »

« Il supprime une partie de la charge opérationnelle », dit Leo. « Provisionnement de l'infrastructure, patching, configuration de mise à l'échelle — ceux-là disparaissent. Ce qui reste est différent : gestion des démarrages à froid, traçage distribué à travers des fonctions auxquelles vous ne pouvez pas vous connecter en SSH, limites de concurrence, gestion des versions et alias de fonctions, compréhension de la propagation des mises à jour de couches, gestion gracieuse des délais d'attente de 15 minutes. »

« Donc la charge se déplace », dit Priya. « Des opérations d'infrastructure aux opérations de fonctions. »

« Oui. Pour beaucoup de charges de travail — surtout les petites, événementielles et en pics — c'est un meilleur compromis. Pour un serveur d'application de longue durée avec lequel les ingénieurs ont besoin d'interagir et de déboguer, EC2 ou les conteneurs restent souvent le bon choix. »

Vous vous demandez peut-être : le serverless est-il l'avenir, et tout devrait-il à terme passer sur Lambda ? La réponse honnête est que cela dépend de la charge de travail. Le serverless a dominé le traitement événementiel. Il a fait des percées significatives dans les API HTTP (via API Gateway + Lambda). Il n'a pas remplacé les serveurs d'application toujours allumés, le traitement par lots de longue durée, ni les services avec état — et ne le fera probablement pas, parce que ces cas d'usage ne bénéficient pas du modèle de Lambda. La question du bon outil ne disparaît jamais ; elle s'applique simplement à différentes options au fil du temps.

## Points forts et limites

**Pourquoi Lambda est puissant** :

- Véritable paiement à l'utilisation — zéro coût à l'inactivité
- Mise à l'échelle automatique sans configuration
- Pas de serveurs à patcher ou à maintenir
- Niveau gratuit généreux (1 million de requêtes par mois, gratuitement pour toujours)
- Intégration étroite avec le reste d'AWS
- RDS Proxy et Lambda Layers traitent deux des points de douleur les plus courants de Lambda (pooling de connexions et partage de code) sans nécessiter de changements architecturaux

**Là où ça se complique** :

- Les démarrages à froid sont réels et nécessitent une gestion soigneuse pour les charges de travail sensibles à la latence
- La limite d'exécution de 15 minutes exclut les tâches de longue durée
- Le débogage est plus difficile — pas de serveur persistant pour se connecter en SSH
- La conception sans état nécessite d'externaliser tout état (base de données, cache, S3)
- Les limites de concurrence (1 000 invocations simultanées par défaut par compte) peuvent provoquer du throttling à grande échelle
- Les fonctions Lambda connectées au VPC ont une latence supplémentaire et des problèmes de démarrage à froid

**Surveiller Lambda sans SSH**

La première fois que quelque chose s'est cassé dans une fonction Lambda, l'instinct de Leo fut de se connecter en SSH et de regarder le processus. Il n'y a aucun processus auquel se connecter en SSH. Les environnements d'exécution de Lambda sont éphémères et inaccessibles.

Déboguer Lambda nécessite d'apprendre une boîte à outils différente :

**CloudWatch Logs** : Chaque invocation Lambda écrit son stdout/stderr dans un groupe de journaux CloudWatch. La journalisation structurée (format JSON) rend ceux-ci filtrables. Les champs les plus utiles : nom de la fonction, ID d'invocation, durée, type d'erreur, et votre ID de corrélation personnalisé.

**CloudWatch Metrics** : Lambda publie automatiquement les métriques Invocations, Duration, Errors, Throttles et ConcurrentExecutions. Définir des alarmes sur Errors et Throttles devrait être le premier jour de tout déploiement Lambda.

**AWS X-Ray** : Traçage distribué pour Lambda. Ajoute une petite surcharge (2-5 ms par invocation) mais vous donne un graphique en flammes de l'endroit où le temps est passé à l'intérieur de la fonction. Essentiel pour l'analyse des démarrages à froid — X-Ray montre la phase d'initialisation séparément de la phase de traitement.

**Lambda Insights** : Surveillance améliorée pour Lambda, disponible via CloudWatch Lambda Insights. Ajoute l'utilisation de la mémoire, le temps CPU et la durée d'initialisation aux métriques standard. Coûte légèrement plus mais en vaut la peine pour les fonctions de production.

« Et si quelqu'un essaie de s'introduire par l'environnement d'exécution ? » demanda Priya. « Les fonctions Lambda s'exécutent dans des conteneurs isolés, mais si une dépendance a une vulnérabilité, un attaquant pourrait-il obtenir l'exécution de code à l'intérieur de notre Lambda ? »

Les atténuations : garder les dépendances minimales et à jour (l'analyse des démarrages à froid avait déjà poussé Leo à réduire les tailles de packages), utiliser les Lambda Layers pour versionner les bibliothèques partagées, et accorder au rôle d'exécution de la Lambda les permissions minimales requises. Si la fonction ne peut écrire que dans un bucket S3 spécifique et interroger une table DynamoDB spécifique, le rayon d'impact d'une fonction compromise est limité à exactement cela.

« Le moindre privilège pour les rôles d'exécution Lambda n'est pas optionnel », dit Priya. « C'est ce qui limite les dégâts quand quelque chose tourne mal. »

Elle avait raison. Et comme la plupart des conseils de sécurité, c'était aussi simplement du bon génie logiciel.

## Résumé

L'architecture SQS/SNS du chapitre 19 a séparé les préoccupations d'accepter le travail et de le traiter. Lambda pousse cela plus loin : il sépare les préoccupations de traiter le travail et de payer pour la capacité de le faire.

- **AWS Lambda** exécute du code en réponse à des événements sans gérer de serveurs.
- **Paiement à l'utilisation** : facturé par invocation et par milliseconde d'exécution (arrondie à la hausse). Zéro coût à l'inactivité.
- Évolue automatiquement de 0 à des milliers d'invocations simultanées.
- **Démarrages à froid** : latence d'initialisation quand aucun environnement d'exécution chaud n'existe. Atténué avec la concurrence provisionnée ou des runtimes légers.
- **Lambda Layers** : packages de code partagé que plusieurs fonctions peuvent référencer, réduisant la duplication et la taille des packages.
- **RDS Proxy** : résout le problème d'épuisement des connexions de Lambda en maintenant un pool de connexions à la base de données persistant entre Lambda et RDS.
- **Surveillance** : utilisez CloudWatch Logs, Metrics, le traçage X-Ray et Lambda Insights — il n'y a aucun serveur auquel se connecter en SSH.
- Idéal pour : les charges de travail événementielles, de courte durée, irrégulières ou peu fréquentes.
- Pas idéal pour : les tâches de longue durée (limite stricte de 15 minutes), les applications avec état, les API à haut débit et faible latence sans concurrence provisionnée.
- Le **serverless** est une philosophie de conception — vous gérez le code, pas l'infrastructure. La complexité opérationnelle se déplace, elle ne disparaît pas.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Lambda + S3** : Modèle classique — un fichier téléversé sur S3 déclenche Lambda pour le traitement (génération de miniatures, analyse antivirus, transformation de données). Pas de serveur nécessaire.
- **Lambda + SQS** : Lambda interroge SQS et traite les lots. SQS fournit le mécanisme de nouvelle tentative/DLQ. Lambda fournit le traitement.
- **Lambda + API Gateway** : API HTTP serverless. API Gateway gère le routage, l'auth, le throttling. Lambda gère la logique métier.
- **Types d'API Gateway :** REST API = fonctionnalités complètes, transformation de requêtes, mise en cache, plans d'utilisation. HTTP API = plus simple, moins chère, OIDC/OAuth uniquement. WebSocket API = connexions bidirectionnelles persistantes. **Autorisation :** autorisateur Cognito = valide nativement un JWT Cognito. Autorisateur Lambda = logique de validation de jeton personnalisée. Clé d'API = limitation de débit par client (pas authentification). Déclencheur d'examen : « API REST serverless » → API Gateway + Lambda.
- **Signaux de démarrage à froid** : « pics de latence à la première requête », « temps de réponse incohérents » → démarrage à froid. Solution : concurrence provisionnée (coûte de l'argent), package plus petit, runtime plus léger.
- **Limites d'exécution** : 15 minutes max. 10 Go max de mémoire. 512 Mo de stockage éphémère /tmp par défaut (configurable jusqu'à 10 Go). Ces limites apparaissent dans les scénarios d'examen.
- **Les erreurs de délai d'attente Lambda sont silencieuses** : Si une fonction Lambda dépasse le délai, elle produit une erreur CloudWatch mais aucune réponse d'erreur au niveau de l'application. Surveillez explicitement les erreurs de délai d'attente Lambda dans CloudWatch. C'est ainsi que le générateur de rapport de 17 minutes de Leo a échoué dès la première nuit sans aucune alarme au niveau de l'application.
- **Démarrages à froid des Lambda VPC** : Les fonctions Lambda à l'intérieur d'un VPC ont une latence de démarrage à froid supplémentaire (provisionnement d'ENI). AWS a considérablement amélioré cela avec les ENI Hyperplane, mais les démarrages à froid des Lambda VPC sont toujours plus lents que hors VPC. Évitez le VPC pour les fonctions Lambda qui n'ont pas besoin de ressources VPC (c.-à-d. qui ne se connectent pas à RDS, ElastiCache ou autres ressources réservées au VPC).
- **Concurrence Lambda** : 1 000 exécutions simultanées par défaut par compte (peut être augmentée). **Concurrence réservée** : garantit qu'une fonction obtient un nombre spécifique d'exécutions ; empêche d'autres fonctions de les consommer. **Concurrence provisionnée** : préchauffer un nombre d'environnements d'exécution.
- **Mappage de source d'événements** : La fonctionnalité Lambda qui connecte SQS/DynamoDB Streams/Kinesis à Lambda. Lambda interroge la source et regroupe les enregistrements.
- **Atteindre les limites du compte** : « l'application est throttlée / LimitExceeded à mesure qu'elle monte en charge » → vérifiez la limite dans **Service Quotas** et demandez-y une augmentation (de nombreux quotas, comme la concurrence Lambda, sont ajustables ; certains sont des limites strictes).
- **RDS Proxy** : Signal d'examen : « les fonctions Lambda provoquant trop de connexions à la base de données », « épuisement du pool de connexions avec Lambda » → RDS Proxy maintient des connexions persistantes et multiplexe les connexions éphémères de Lambda.
- **Lambda Layers** : Signal d'examen : « partager du code entre plusieurs fonctions Lambda », « réduire la taille du package de déploiement » → Lambda Layers.
- **Lambda + X-Ray** : Traçage distribué pour Lambda. Scénario d'examen : « tracer les requêtes à travers plusieurs fonctions Lambda et services » → activer le traçage X-Ray sur Lambda.
- **Lambda Destinations :** Pour les invocations Lambda asynchrones, vous pouvez configurer une Destination pour les résultats de succès et d'échec. Envoyez les résultats réussis à SQS, SNS, EventBridge ou une autre fonction Lambda. Envoyez les échecs à SQS ou SNS pour l'alerte. C'est l'alternative préférée aux DLQ pour les invocations asynchrones car elle capture à la fois le succès et l'échec, pas seulement l'échec. Signal d'examen : « router les résultats Lambda réussis vers un autre service » ou « capturer les résultats de succès et d'échec d'une Lambda asynchrone » → Lambda Destinations. « Ne capturer que les messages échoués pour une invocation asynchrone » → la DLQ reste valide mais Destinations est la solution la plus complète.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez le problème du démarrage à froid. Dans quel type d'application les démarrages à froid seraient-ils les plus problématiques ? Dans quel type seraient-ils acceptables ?

*(Indice : Comparez une API en temps réel (l'utilisateur attend une réponse) avec un travail d'arrière-plan asynchrone (l'utilisateur a déjà reçu sa confirmation et fait autre chose).)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise reçoit des images de produits de ses fournisseurs via un bucket S3. Chaque image doit être redimensionnée selon quatre dimensions standard (miniature, petite, moyenne, grande) et stockée à nouveau dans S3. Le volume est imprévisible — certains jours 10 images, d'autres jours 100 000. Le traitement doit se terminer dans les 10 minutes par image. Le coût doit être minimisé.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Des instances EC2 dans un Auto Scaling Group surveillant le bucket S3 avec du long polling  
B) Une instance EC2 dédiée avec un cron job qui vérifie S3 toutes les minutes pour de nouvelles images  
C) Des tâches ECS Fargate déclenchées par une file SQS, avec des événements S3 publiés dans la file  
D) Une notification d'événement S3 déclenchant une fonction Lambda qui redimensionne les images et stocke les résultats dans S3

**Indice 1** : Un volume imprévisible favorise la mise à l'échelle vers zéro. Quelle option fait cela ?

**Indice 2** : 10 minutes par image est dans la limite de 15 minutes de Lambda. Vérifiez si le travail de redimensionnement d'image correspond aux contraintes de Lambda.

**Indice 3** : Une instance EC2 dédiée tournant 24h/24 est coûteuse et ne s'adapte pas.

**Réponse** : D

**Explication** : Les notifications d'événements S3 déclenchent Lambda quand une image est téléversée. Lambda redimensionne l'image selon quatre dimensions et stocke les résultats dans S3. Lambda évolue de 0 à des milliers d'invocations simultanées automatiquement, gérant un volume imprévisible sans préprovisionnement. Zéro coût quand aucune image n'est traitée.

**Pourquoi pas A ?** EC2 dans un ASG ne descend pas à zéro — minimum une instance toujours en cours d'exécution. Le long polling S3 n'est pas un mécanisme natif d'événements S3. Coût plus élevé que Lambda pour les charges de travail irrégulières.

**Pourquoi pas B ?** Une instance EC2 dédiée est un point de défaillance unique, ne s'adapte pas, tourne 24h/24, et une approche basée sur cron a un délai de détection allant jusqu'à 60 secondes.

**Pourquoi pas C ?** ECS Fargate fonctionne, mais c'est plus complexe (nécessite la gestion de conteneurs, ECR, des définitions de tâches) et le démarrage d'une tâche Fargate prend des dizaines de secondes à des minutes — bien plus lent qu'un démarrage à froid Lambda — ce qui en fait un mauvais choix pour un travail irrégulier et événementiel. Lambda est plus simple pour ce cas d'utilisation.

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus veut générer un rapport quotidien à 5 h du matin avec les 10 meilleurs restaurants de la veille par volume de commandes. Le rapport est généré à partir des données DynamoDB, formaté en PDF, stocké dans S3, et envoyé par e-mail à tous les partenaires restaurants.

Concevez le pipeline complet basé sur Lambda pour cela. Qu'est-ce qui déclenche Lambda ? Que se passe-t-il si la génération du PDF prend 12 minutes ? Et s'il y a 5 000 partenaires restaurants et que l'envoi de tous les e-mails prend du temps ? Utiliseriez-vous une Lambda ou plusieurs ?

Considérez aussi : et si la Lambda dépasse le délai après 14 minutes, ayant traité 4 500 e-mails sur 5 000 ? Comment évitez-vous d'envoyer des e-mails en double quand la Lambda est réessayée ? De quelles permissions IAM cette Lambda a-t-elle besoin, et quel est l'ensemble minimal nécessaire ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la composition de Lambda avec d'autres services.)*

## Scène post-générique

Tom examina la facture à la fin du mois.

Le service d'e-mails : avait disparu de la facture EC2.
La tâche de redimensionnement d'images : disparue.
La tâche de nettoyage nocturne : disparue.
Le rapport analytique quotidien : disparu. (Le générateur de rapport avait été déplacé vers ECS Fargate après l'incident du délai d'attente de 17 minutes, mais le coût de calcul Lambda était nul car il était maintenant orchestré différemment.)

Total des frais Lambda pour le mois : 5,47 $.

« Cinq dollars », dit Tom.

« Et quarante-sept centimes », ajouta Leo avec obligeance.

Tom regarda la facture du mois précédent, quand ces services tournaient tous sur des instances EC2.

« On payait 187 $ pour ces mêmes charges de travail. »

« Lambda ne facture pas le temps d'inactivité », dit Leo. « Et la plupart de ces services étaient inactifs 90 % du temps. »

Tom afficha les graphiques CloudWatch une fois de plus. La Lambda du service d'e-mails avait été invoquée 36 412 fois. Durée totale : environ 18 200 Go-secondes. À 0,0000166667 $ par Go-seconde : 0,30 $ — et même cela était théorique, puisque 18 200 Go-secondes étaient confortablement à l'intérieur des 400 000 Go-secondes de durée toujours gratuites. La ligne réelle était nulle.

« L'instance EC2 coûtait 18 $ par mois », dit Tom. « On a dépensé trente centimes — et c'est en ignorant le niveau gratuit, pour qu'on connaisse le vrai coût unitaire. La facture dit zéro. »

« La majeure partie des 5,47 $ était la concurrence provisionnée sur la Lambda de notification — celle-là facture qu'elle s'exécute ou non. Le redimensionneur d'images, la tâche de nettoyage et le reste tiennent dans le niveau gratuit. »

Tom fixa l'écran pendant un long moment.

« Je retire tout ce que j'ai dit sur le serverless comme étant un mot à la mode », dit-il.

« Tu n'as jamais dit ça », dit Leo.

« Je l'ai pensé très fort. »

Dans le prochain chapitre : le conteneur de transport qui fait que n'importe quel serveur ressemble à chez soi.
