# Chapitre 20 : Le Modèle du Freelance

La fonction de notification de commande s'exécutait exactement une fois par commande. Entre les commandes, elle ne faisait rien. Pendant dix-sept heures un mardi, aucune commande n'arriva. Durant ces dix-sept heures, la fonction ne coûta rien. Pas un centime. Aucun serveur en veille, aucune instance en attente, aucune capacité réservée inutilisée. La fonction existait. Elle ne s'exécutait tout simplement pas.

Le système de diffusion SNS/SQS fonctionnait. Le service d'analytique, le service de notifications et le service d'e-mails consommaient chacun depuis leurs propres files d'attente SQS.

Mais Priya avait remarqué quelque chose.

« Le service d'e-mails, » dit-elle. « Combien d'e-mails envoyons-nous par heure ? »

Leo consulta les métriques. « En moyenne 400. En pic environ 1 200 les vendredis soirs. »

« Et l'instance EC2 qui fait tourner le service d'e-mails — combien de temps tourne-t-elle ? »

« Toujours. 24h/24, 7j/7. »

« Même à 3 h du matin quand on envoie zéro e-mail ? »

Silence.

« On paie pour qu'un ordinateur reste là à rien faire, » dit Leo.

« Pendant combien d'heures par jour ? »

Encore le silence.

« Environ 18. »

Tom était très attentif maintenant.

**Le Serveur n'Est Pas Toujours la Réponse**

Les instances EC2 sont permanentes. Vous en démarrez une et elle tourne jusqu'à ce que vous l'arrêtiez — 24 heures sur 24, 7 jours sur 7, indépendamment de l'utilisation réelle. Pour votre serveur web (qui gère le trafic à toute heure), c'est correct. Pour le service d'e-mails (qui envoie des rafales d'e-mails puis reste inactif pendant des heures), c'est du gaspillage.

L'Auto Scaling Group peut réduire le service d'e-mails à une instance durant les heures creuses. Mais une instance tourne quand même en permanence.

Et si le code ne s'exécutait que lorsqu'il y avait du travail à faire ?

C'est la prémisse du **calcul serverless**.

**AWS Lambda : Du Code Sans Serveurs**

**AWS Lambda** vous permet d'exécuter du code en réponse à des événements sans provisionner ni gérer de serveurs. Vous téléchargez une fonction, vous spécifiez ce qui la déclenche, et Lambda l'exécute quand le déclencheur se produit.

Une fonction Lambda :

- N'a pas d'état persistant (chaque invocation est indépendante)
- S'exécute jusqu'à 15 minutes par invocation
- Évolue automatiquement de 0 à des milliers d'invocations simultanées
- Est facturée uniquement quand elle s'exécute (par milliseconde d'exécution, arrondie à la hausse, par Go de mémoire alloué)

En l'absence de déclencheur, Lambda ne coûte rien. Quand des déclencheurs se produisent, Lambda s'exécute et facture. Quand 10 000 déclencheurs se produisent simultanément, Lambda exécute 10 000 invocations simultanées. La mise à l'échelle est automatique et quasi instantanée.

**Déclencheurs d'événements : Ce Qui Réveille Lambda**

Les fonctions Lambda ne s'exécutent pas d'elles-mêmes — elles répondent à des événements. Les déclencheurs courants sont :

- **File d'attente SQS** : Traiter les messages d'une file d'attente. Lambda interroge la file et invoque la fonction avec des lots de messages.
- **API Gateway** : Une requête HTTP arrive. API Gateway déclenche Lambda. Lambda génère une réponse.
- **Événement S3** : Un fichier est téléversé sur S3. Lambda le traite (redimensionner une image, analyser un CSV, valider un document).
- **SNS** : Un message est publié sur un sujet. Lambda est notifié.
- **DynamoDB Streams** : Un enregistrement dans DynamoDB change. Lambda traite le changement.
- **CloudWatch Events (EventBridge)** : Un événement planifié (comme un cron job) s'exécute à une heure définie.
- **ALB** : Une requête HTTP arrive sur l'équilibreur de charge. Lambda peut gérer certaines routes.

Pour Nimbus, le service d'e-mails est devenu une fonction Lambda déclenchée par sa file d'attente SQS. Quand un message arrive dans la file, Lambda est invoqué avec le contenu du message, envoie l'e-mail via SES (Simple Email Service), puis se termine.

Zéro serveur. Zéro temps d'inactivité. Zéro coût à l'inactivité.

**Le Problème du Démarrage à Froid**

Les fonctions Lambda s'exécutent dans des **environnements d'exécution** — de petits conteneurs isolés. Quand une fonction est invoquée :

1. AWS vérifie si un environnement d'exécution chaud est disponible (un qui a géré une invocation récente)
2. Si chaud : la fonction s'exécute immédiatement
3. Si froid : AWS initialise un nouvel environnement d'exécution — télécharge votre code, démarre le runtime, exécute votre code d'initialisation — puis exécute la fonction

Un **démarrage à froid** ajoute de 100 ms à plusieurs secondes de latence selon le runtime (Java et .NET ont des démarrages à froid plus longs que Python et Node.js) et la taille de votre package de code.

Pour le traitement asynchrone (envoi d'e-mails, redimensionnement d'images), les démarrages à froid sont invisibles pour les utilisateurs.

Pour les API synchrones (requêtes HTTP où un utilisateur attend une réponse), les démarrages à froid peuvent provoquer des réponses occasionnellement lentes.

**Atténuations** :

- **Concurrence provisionnée** : Préchauffer un nombre spécifié d'environnements d'exécution. Ils sont toujours prêts. Vous payez pour eux même quand ils ne traitent pas de requêtes.
- **Tailles de packages réduites** : Un code plus petit s'initialise plus vite.
- **Invocations de préchauffage** : Des pings planifiés pour maintenir les fonctions chaudes (une approche courante mais peu élégante).
- **Choisir le bon runtime** : Python et Node.js démarrent plus vite à froid que Java.

**Tarification de Lambda : Pourquoi Tom Souriait**

La tarification de Lambda a deux composantes :

1. **Frais de requête** : 0,20 $ par million d'invocations
2. **Frais de durée** : 0,0000166667 $ par Go-seconde (mémoire allouée × secondes d'exécution)

Le premier million de requêtes par mois est gratuit (toujours, pas seulement la première année).

Tom fit le calcul pour le service d'e-mails :

- 1 200 e-mails par jour × 30 jours = 36 000 invocations par mois
- Chaque invocation dure ~2 secondes avec 256 Mo de mémoire
- Durée : 36 000 × 2 × 0,25 Go × 0,0000166667 $ = 0,30 $/mois
- Requêtes : 36 000 << 1 000 000 (niveau gratuit) = 0,00 $/mois

L'instance EC2 pour le service d'e-mails : 18 $/mois.

Tom resta silencieux un moment. Puis : « On devrait faire ça pour tout. »

**Ce que Lambda Fait Bien (et Ce qu'Il Ne Fait Pas)**

Lambda excelle pour :

- **Le traitement événementiel** : Répondre à des événements (téléchargements de fichiers, messages en file d'attente, tâches planifiées)
- **Les tâches de courte durée** : Un traitement qui se termine bien avant les 15 minutes
- **Le trafic irrégulier et imprévisible** : Lambda évolue de 0 à des milliers instantanément — aucun préprovisionning nécessaire
- **Les opérations peu fréquentes** : Un rapport qui s'exécute à 2 h du matin quotidiennement. Une tâche de nettoyage hebdomadaire.
- **Le code de liaison** : De petites fonctions qui déplacent des données entre services

Lambda est peu adapté pour :

- **Les processus de longue durée** : La limite de 15 minutes est un mur infranchissable
- **Les applications avec état** : Les fonctions Lambda sont sans état par conception — chaque invocation est indépendante
- **Les API à haut débit et faible latence** : Les démarrages à froid peuvent provoquer des pics de latence ; la concurrence provisionnée atténue cela mais augmente les coûts
- **Les applications nécessitant des connexions persistantes** : Lambda ne peut pas facilement maintenir un pool de connexions à une base de données de longue durée (bien que des outils de pooling de connexions comme RDS Proxy aident)
- **Les serveurs web traditionnels** : Possible, mais pas l'usage naturel

« Donc Lambda ne remplace pas EC2, » dit Maya. « C'est un outil différent pour des tâches différentes. »

« L'API web de Nimbus reste sur EC2 ou ECS, » confirma Leo. « Le service d'e-mails, le redimensionneur d'images, le générateur de rapports nocturenel, le nettoyeur de logs — ceux-là passent sur Lambda. »

**La Philosophie Serverless**

Lambda fait partie d'un concept plus large : le **serverless** — construire des applications où vous ne gérez aucun serveur, seulement du code.

Une stack Nimbus entièrement serverless pourrait ressembler à :

- API Gateway + Lambda (au lieu d'EC2 avec un serveur web)
- DynamoDB (au lieu de RDS — également serverless, pas de gestion de serveur)
- S3 (ressources statiques — intrinsèquement serverless)
- SNS + SQS (messagerie — serverless)
- Lambda (tout le traitement en arrière-plan)

L'attrait : vous écrivez du code ; AWS gère tout le reste. Pas de patching, pas de configuration de mise à l'échelle, pas de planification de capacité.

La réalité : le serverless a sa propre complexité opérationnelle — débogage de fonctions Lambda distribuées, gestion des démarrages à froid, compréhension des limites de concurrence. Ce n'est pas plus simple, juste différent.

## Points Forts et Limites

**Pourquoi Lambda est puissant** :

- Véritable paiement à l'utilisation — zéro coût à l'inactivité
- Mise à l'échelle automatique sans configuration
- Pas de serveurs à patcher ou à maintenir
- Niveau gratuit généreux (1 million de requêtes par mois, gratuitement pour toujours)
- Intégration étroite avec le reste d'AWS

**Là où ça se complique** :

- Les démarrages à froid sont réels et nécessitent une gestion soigneuse pour les charges de travail sensibles à la latence
- La limite d'exécution de 15 minutes exclut les tâches de longue durée
- Le débogage est plus difficile — pas de serveur persistant pour se connecter en SSH
- La conception sans état nécessite d'externaliser tout état (base de données, cache, S3)
- Les limites de concurrence (1 000 invocations simultanées par défaut par compte) peuvent être throttlées à grande échelle
- Les fonctions Lambda connectées au VPC ont une latence supplémentaire et des problèmes de démarrage à froid

## Résumé

- **AWS Lambda** exécute du code en réponse à des événements sans gérer de serveurs.
- **Paiement à l'utilisation** : facturé par invocation et par milliseconde d'exécution (arrondie à la hausse). Zéro coût à l'inactivité.
- Évolue automatiquement de 0 à des milliers d'invocations simultanées.
- **Démarrages à froid** : latence d'initialisation quand aucun environnement d'exécution chaud n'existe. Atténué avec la concurrence provisionnée ou des runtimes légers.
- Idéal pour : les charges de travail événementielles, de courte durée, irrégulières ou peu fréquentes.
- Pas idéal pour : les tâches de longue durée, les applications avec état, les API à haut débit et faible latence sans concurrence provisionnée.
- **Serverless** est une philosophie de conception — vous gérez le code, pas l'infrastructure.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Lambda + S3** : Modèle classique — un fichier téléversé sur S3 déclenche Lambda pour le traitement (génération de miniatures, analyse antivirus, transformation de données). Pas de serveur nécessaire.
- **Lambda + SQS** : Lambda interroge SQS et traite les lots. SQS fournit le mécanisme de nouvelle tentative/DLQ. Lambda fournit le traitement.
- **Lambda + API Gateway** : API HTTP serverless. API Gateway gère le routage, l'auth, le throttling. Lambda gère la logique métier.
- **Signaux de démarrage à froid** : « pics de latence à la première requête », « temps de réponse incohérents » → démarrage à froid. Solution : concurrence provisionnée (coûte de l'argent), package plus petit, runtime plus léger.
- **Limites d'exécution** : 15 minutes max. 10 Go max de mémoire. 512 Mo de stockage éphémère /tmp par défaut (configurable jusqu'à 10 Go). Ces limites apparaissent dans les scénarios d'examen.
- **Concurrence Lambda** : 1 000 exécutions simultanées par défaut par compte (peut être augmentée). **Concurrence réservée** : garantit qu'une fonction obtient un nombre spécifique d'exécutions ; empêche d'autres fonctions de les consommer. **Concurrence provisionnée** : préchauffer un nombre d'environnements d'exécution.
- **Mappage de source d'événements** : La fonctionnalité Lambda qui connecte SQS/DynamoDB Streams/Kinesis à Lambda. Lambda interroge la source et regroupe les enregistrements.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez le problème du démarrage à froid. Dans quel type d'application les démarrages à froid seraient-ils les plus problématiques ? Dans quel type seraient-ils acceptables ?

*(Indice : Comparez une API en temps réel (l'utilisateur attend une réponse) avec un travail d'arrière-plan asynchrone (l'utilisateur a déjà reçu sa confirmation et fait autre chose).)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise reçoit des images de produits de ses fournisseurs via un bucket S3. Chaque image doit être redimensionnée selon quatre dimensions standard (miniature, petite, moyenne, grande) et stockée à nouveau dans S3. Le volume est imprévisible — certains jours 10 images, d'autres jours 100 000. Le traitement doit se terminer dans les 10 minutes par image. Le coût doit être minimisé.

Quelle architecture répond LE MIEUX à ces exigences ?

A) Des instances EC2 dans un Auto Scaling Group surveillant le bucket S3 avec du long polling  
B) Une notification d'événement S3 déclenchant une fonction Lambda qui redimensionne les images et stocke les résultats dans S3  
C) Des tâches ECS Fargate déclenchées par une file d'attente SQS, avec des événements S3 publiés dans la file  
D) Une instance EC2 dédiée avec un cron job qui vérifie S3 toutes les minutes pour de nouvelles images

**Indice 1** : Un volume imprévisible favorise la mise à l'échelle vers zéro. Quelle option fait cela ?

**Indice 2** : 10 minutes par image est dans la limite de 15 minutes de Lambda. Vérifiez si le travail de redimensionnement d'image correspond aux contraintes de Lambda.

**Indice 3** : Une instance EC2 dédiée tournant 24h/24 est coûteuse et ne s'adapte pas.

**Réponse** : B

**Explication** : Les notifications d'événements S3 déclenchent Lambda quand une image est téléversée. Lambda redimensionne l'image selon quatre dimensions et stocke les résultats dans S3. Lambda évolue de 0 à des milliers d'invocations simultanées automatiquement, gérant un volume imprévisible sans préprovisionning. Zéro coût quand aucune image n'est traitée.

**Pourquoi pas A ?** EC2 dans un ASG ne descend pas à zéro — minimum une instance toujours en cours d'exécution. Le long polling S3 n'est pas un mécanisme natif d'événements S3. Coût plus élevé que Lambda pour les charges de travail irrégulières.

**Pourquoi pas C ?** ECS Fargate fonctionne, mais c'est plus complexe (nécessite la gestion de conteneurs, ECR, des définitions de tâches) et a une latence de démarrage à froid légèrement plus élevée que Lambda pour les charges de travail irrégulières. Lambda est plus simple pour ce cas d'utilisation.

**Pourquoi pas D ?** Une instance EC2 dédiée est un point de défaillance unique, ne s'adapte pas, tourne 24h/24, et une approche basée sur cron a un délai de détection allant jusqu'à 60 secondes.

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus veut générer un rapport quotidien à 5 h du matin avec les 10 meilleurs restaurants de la veille par volume de commandes. Le rapport est généré à partir des données DynamoDB, formaté en PDF, stocké dans S3, et envoyé par e-mail à tous les partenaires restaurants.

Concevez le pipeline complet basé sur Lambda pour cela. Qu'est-ce qui déclenche Lambda ? Que se passe-t-il si la génération du PDF prend 12 minutes ? Et s'il y a 5 000 partenaires restaurants et que l'envoi de tous les e-mails prend du temps ? Utiliseriez-vous un Lambda ou plusieurs ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la composition de Lambda avec d'autres services.)*

## Scène Post-Générique

Tom examina la facture à la fin du mois.

Le service d'e-mails : avait disparu de la facture EC2.
La tâche de redimensionnement d'images : disparue.
La tâche de nettoyage nocturne : disparue.
Le rapport analytique quotidien : disparu.

Total des frais Lambda pour le mois : 4,23 $.

« Quatre dollars, » dit Tom.

« Et vingt-trois centimes, » ajouta Leo avec obligeance.

Tom regarda la facture du mois précédent, quand ces services tournaient tous sur des instances EC2.

« On payait 187 $ pour ces mêmes charges de travail. »

« Lambda ne facture pas le temps d'inactivité, » dit Leo. « Et la plupart de ces services étaient inactifs 90 % du temps. »

Tom fixa l'écran pendant un long moment.

« Je retire tout ce que j'ai dit sur le serverless comme étant un mot à la mode, » dit-il.

Dans le prochain chapitre : le conteneur de transport qui fait ressembler n'importe quel serveur à chez soi.
