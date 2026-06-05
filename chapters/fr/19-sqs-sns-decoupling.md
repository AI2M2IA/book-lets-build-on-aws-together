# Chapitre 19 : La machine à tickets

La machine à tickets fut une révolution silencieuse. Prenez un numéro, attendez d'être appelé. La file devint une queue. Les gens pouvaient s'asseoir. Le comptoir de service travaillait à son propre rythme. Personne ne bloquait personne.

Nimbus avait un problème qui ne semblait pas en être un jusqu'à ce que les commandes deviennent populaires.

Chaque fois qu'une commande était passée, le serveur API devait :

1. Sauvegarder la commande dans la base de données
2. Envoyer une notification à la tablette du restaurant
3. Envoyer un e-mail de confirmation au client
4. Mettre à jour le tableau de bord analytique du restaurant
5. Enregistrer l'événement pour la facturation

Tout cela devait se passer de façon synchrone avant que l'API puisse répondre au client. Si le service e-mail était lent (parfois c'était le cas), le client attendait. Si le tableau de bord analytique était en panne (parfois c'était le cas), la commande échouait.

« Nous sommes étroitement couplés », dit Priya. « Si une étape en aval échoue, toute la commande échoue. »

« Et si on pouvait sauvegarder la commande et confirmer immédiatement au client », dit Leo, « et traiter le reste en arrière-plan ? »

« C'est une queue », dit Priya.

**Le modèle du comptoir de charcuterie**

Dans un comptoir de charcuterie animé, la personne à la caisse n'attend pas que le trancheur finisse de couper avant de passer au client suivant. Elle prend la commande, la transmet à la cuisine, et commence à servir la personne suivante. La cuisine traite les commandes à son propre rythme.

Le client est servi plus rapidement. La cuisine n'est pas submergée par les pics soudains. Si la cuisine a un moment lent, les commandes s'accumulent dans la queue plutôt que de provoquer des erreurs à la caisse.

C'est le **découplage** : séparer le composant qui accepte le travail des composants qui le traitent.

Dans les systèmes logiciels, la queue est souvent un courtier de messages — un service qui accepte les messages des producteurs et les livre aux consommateurs.

**Amazon SQS : la queue**

**Amazon SQS (Simple Queue Service)** est le service de files de messages géré d'AWS. Il stocke les messages de façon durable jusqu'à ce qu'ils soient traités par un consommateur.

Le flux de base :

1. Le **producteur** (le serveur API) place un message dans la queue : `{ "orderId": "ORD-5532", "restaurantId": "47", "items": [...] }`
2. L'API répond immédiatement au client : « Commande confirmée ! »
3. Les **consommateurs** (des services de travail séparés) lisent les messages depuis la queue et les traitent : envoyer la notification au restaurant, envoyer l'e-mail de confirmation, mettre à jour l'analytique

L'expérience client : confirmation instantanée. Le traitement en aval : se passe de façon asynchrone, au rythme des travailleurs.

**Concepts clés de SQS**

**Délai de visibilité des messages** : Quand un consommateur lit un message de SQS, le message devient *invisible* pour les autres consommateurs pendant une période (par défaut : 30 secondes). Cela donne au consommateur le temps de le traiter. Si le consommateur finit avec succès, il supprime le message. Si le consommateur plante, le délai de visibilité expire et le message redevient visible pour qu'un autre consommateur le réessaie.

Cela garantit une livraison au moins une fois : chaque message sera traité au moins une fois, même si un consommateur tombe en panne en cours de traitement.

**Files de lettres mortes (DLQ)** : Si un message échoue au traitement trop de fois (configurable — par ex., 5 réessais), SQS le déplace dans une file de lettres mortes. Vous inspectez la DLQ pour comprendre pourquoi les messages échouent sans les perdre.

**Types de files** :

**Files standard** : Débit maximum (messages illimités par seconde). L'ordre de livraison est au mieux (non garanti). Livraison au moins une fois (très rarement, un message peut être livré deux fois).

**Files FIFO** : Ordre strict premier entré, premier sorti. Livraison exactement une fois. Limitées à 3 000 messages par seconde avec le traitement par lots, 300 sans. Utilisez quand l'ordre est important (transactions financières, changements d'état séquentiels).

Pour Nimbus, la plupart des files utilisaient des files standard. La file de facturation utilisait FIFO pour s'assurer que les charges étaient traitées dans l'ordre.

**Amazon SNS : le diffuseur**

**Amazon SNS (Simple Notification Service)** est un service de messages publication/abonnement (pub/sub). Au lieu d'un producteur et un consommateur (queue), SNS prend en charge la livraison d'un message à *plusieurs* abonnés simultanément.

Le modèle :

1. Un **éditeur** envoie un message à un **sujet** SNS
2. Tous les **abonnés** de ce sujet reçoivent le message simultanément (diffusion en éventail)

Les abonnés peuvent être :

- Des files SQS (pousser le message dans une queue pour un traitement asynchrone)
- Des fonctions Lambda (déclencher la fonction directement)
- Des points de terminaison HTTP/HTTPS (livraison par webhook)
- Des adresses e-mail
- Des SMS (numéros de téléphone)

Pour Nimbus, l'événement de commande passée est publié dans un sujet SNS appelé `order-events` :

- Le service de notification du restaurant s'abonne (reçoit sur sa queue SQS)
- Le service e-mail s'abonne (reçoit sur sa queue SQS)
- Le service analytique s'abonne (reçoit sur sa queue SQS)
- Le service de facturation s'abonne (reçoit sur sa queue FIFO SQS)

Un événement de commande. Quatre abonnés. Tous notifiés simultanément. Chacun traite à son propre rythme.

« Donc SNS est l'annonce », dit Maya, « et SQS est la boîte de réception où chaque équipe traite l'annonce à sa propre vitesse. »

« Exactement », dit Leo. « La diffusion en éventail SNS/SQS est le modèle standard. »

**Le modèle de diffusion en éventail SNS/SQS**

Cette combinaison — un sujet SNS alimentant plusieurs files SQS — est l'un des modèles architecturaux les plus importants dans AWS :

```
Serveur API
    |
    | publie vers
    ↓
Sujet SNS : "order-placed"
    |
    |—————————————————|—————————————————|
    ↓                 ↓                 ↓
File SQS          File SQS          File SQS
(notifications)  (service e-mail)   (analytique)
    |                 |                 |
    ↓                 ↓                 ↓
Travailleur        Travailleur        Travailleur
Lambda/EC2        Lambda/EC2         Lambda/EC2
```

Chaque file est indépendante. Le service analytique peut être lent — sa file se remplit, mais les services de notification et d'e-mail continuent sans être affectés. Si le service analytique tombe en panne, ses messages attendent dans la file jusqu'à ce qu'il revienne. Rien n'est perdu.

C'est la propriété clé : **défaillance indépendante**. Les problèmes dans un consommateur ne se propagent pas aux autres.

**Filtrage des messages : pas chaque message pour chaque abonné**

À mesure que les systèmes grandissent, vous ne voulez pas que chaque abonné traite chaque message. Un service analytique ne devrait pas recevoir des messages sur les paiements échoués s'il ne s'intéresse qu'aux commandes complètes.

Le **filtrage de messages SNS** permet aux abonnés de spécifier des politiques de filtre — ne livrer que les messages correspondant à certains attributs.

Le service de notification du restaurant s'abonne avec un filtre : uniquement les messages où `status = "confirmed"`.

Le service d'alerte d'erreur s'abonne avec un filtre : uniquement les messages où `status = "failed"`.

Chaque abonné ne reçoit que ce dont il a besoin.

**Quand utiliser SQS vs SNS**

**SQS seul** : Un producteur, un consommateur (ou plusieurs consommateurs concurrents sur la même file). Les messages doivent être traités une fois, dans l'ordre (FIFO) ou non (standard). Modèle de file de travailleurs — une file, plusieurs travailleurs la consommant.

**SNS seul** : Notifications de type tir-et-oubli. Pousser vers e-mail, SMS ou points de terminaison HTTP. Pas besoin de mettre le message en file d'attente — juste notifier et continuer.

**SNS + SQS (diffusion en éventail)** : Un événement, plusieurs consommateurs indépendants. Chaque consommateur a sa propre file, traite indépendamment et peut tomber en panne indépendamment.

## Points forts et limites

**Pourquoi SQS et SNS sont puissants** :

- SQS fournit une livraison de messages durable et fiable — les messages sont stockés sur plusieurs AZ
- Le découplage permet une mise à l'échelle et un déploiement indépendants des services producteur et consommateur
- Les files de lettres mortes garantissent qu'aucun message n'est silencieusement perdu en cas d'échec
- Le modèle de diffusion en éventail SNS permet d'ajouter de nouveaux consommateurs sans modifier le producteur

**Là où ça se complique** :

- La livraison au moins une fois signifie que les consommateurs doivent être *idempotents* — traiter le même message deux fois ne devrait pas poser de problème (commandes en double, charges en double)
- Les files FIFO sont plus chères et ont des limites de débit
- Le débogage des messages échoués à travers plusieurs files et services nécessite une bonne journalisation et observabilité
- Les garanties d'ordre des messages sont limitées — si un ordre strict est important entre plusieurs services, la conception se complique

## Résumé

- Le **découplage** sépare les composants qui produisent le travail des composants qui le traitent.
- **SQS** est une queue gérée. Les producteurs envoient des messages ; les consommateurs les lisent et les traitent de façon asynchrone.
- **SQS Standard** : débit élevé, ordre au mieux, livraison au moins une fois.
- **SQS FIFO** : ordre strict, livraison exactement une fois, débit plus faible.
- **SNS** est un service pub/sub. Un message, de nombreux abonnés simultanément.
- **Diffusion en éventail SNS + SQS** : le modèle standard pour un événement déclenchant plusieurs pipelines de traitement indépendants.
- **Files de lettres mortes** : capturent les messages qui échouent au traitement après trop de réessais.
- **Idempotence** : concevez les consommateurs pour traiter en toute sécurité les messages en double.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **SQS Standard vs FIFO** : L'examen distingue par les garanties d'ordre et de livraison. « Doit traiter dans l'ordre » → FIFO. « Débit maximum » → Standard.
- **Délai de visibilité** : Concept clé pour la livraison au moins une fois. Si un consommateur tombe en panne, le message redevient visible après le délai. Scénario d'examen : « les messages sont traités deux fois » → le délai de visibilité est trop court (le consommateur prend plus de temps que le délai pour traiter).
- **File de lettres mortes** : Les messages qui échouent après N réessais sont déplacés ici. Scénario d'examen : « s'assurer qu'aucun message n'est perdu, même si le traitement échoue à plusieurs reprises » → DLQ.
- **Diffusion en éventail SNS** : Modèle d'examen classique pour un événement déclenchant plusieurs consommateurs. « La notification de commande passée doit déclencher simultanément l'e-mail, le SMS et la mise à jour du stock » → Sujet SNS avec abonnements SQS.
- **SQS + Lambda** : Lambda peut être configuré pour sonder une file SQS et se déclencher sur chaque lot de messages. L'examen l'utilise pour le traitement piloté par les événements à grande échelle.
- **Sondage long SQS** : Au lieu que les consommateurs sondent toutes les quelques secondes (sondage court, gaspille des appels API), le sondage long attend jusqu'à 20 secondes pour un message. Réduit les coûts et les fausses réponses vides.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez le modèle de diffusion en éventail SNS/SQS. Pourquoi le modèle utilise-t-il des files SQS au lieu d'avoir des services s'abonner directement au sujet SNS avec des points de terminaison HTTP ?

*(Indice : Pensez à ce qui se passe si l'un des points de terminaison HTTP est en panne quand SNS publie un message.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une plateforme de commerce électronique traite 10 000 commandes par heure. Quand une commande est passée, le système doit : (1) stocker la commande dans la base de données, (2) déduire l'inventaire, (3) envoyer un e-mail de confirmation et (4) mettre à jour le tableau de bord analytique. Actuellement, les quatre étapes se passent de façon synchrone — si le service analytique est lent, les clients attendent. L'équipe veut améliorer le temps de réponse côté client tout en s'assurant qu'aucune commande n'est perdue.

Quelle architecture répond LE MIEUX à cette exigence ?

A) Utiliser des files SQS FIFO pour traiter les quatre étapes en séquence  
B) Faire sauvegarder la commande par l'API et confirmer immédiatement au client ; publier un événement dans un sujet SNS ; faire abonner les services d'inventaire, d'e-mail et d'analytique via des files SQS  
C) Utiliser des instances EC2 parallèles pour traiter chaque étape simultanément, de façon synchrone  
D) Utiliser une API Gateway avec validation des requêtes pour accélérer le traitement des commandes

**Indice 1** : La confirmation au client doit être immédiate. Quelles étapes doivent se passer avant la réponse, et lesquelles peuvent se passer après ?

**Indice 2** : La lenteur du service analytique ne devrait pas affecter les services e-mail ou d'inventaire.

**Indice 3** : La diffusion en éventail SNS permet aux trois services en aval de recevoir l'événement simultanément.

**Réponse** : B

**Explication** : L'API sauvegarde la commande dans la base de données (synchrone — doit être fait avant de confirmer) et renvoie immédiatement une confirmation. Elle publie ensuite un événement `order-placed` dans un sujet SNS. Les services d'inventaire, d'e-mail et d'analytique s'abonnent chacun via des files SQS indépendantes. Ils traitent à leur propre rythme — si l'analytique est lente, sa file grossit mais les autres services ne sont pas affectés. Si un service tombe en panne, ses messages restent dans la file SQS et sont réessayés ; après le nombre configuré d'échecs de réessai, ils sont déplacés dans la DLQ.

**Pourquoi pas A ?** Les files FIFO traitent les messages en séquence — cela ne résout pas le ralentissement synchrone. De plus, le traitement séquentiel signifie que la lenteur de l'analytique bloque encore l'e-mail.

**Pourquoi pas C ?** Les « instances EC2 parallèles traitant de façon synchrone » nécessitent quand même que toutes les étapes soient complètes avant de répondre au client. Ajouter des instances ne résout pas le couplage synchrone.

**Pourquoi pas D ?** API Gateway accélère le routage et la validation des API, mais ne découple pas les étapes de traitement en aval.

*SAA-C03 Domaine : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus construit un système de notification pour les partenaires restaurants. Quand un client passe une commande, le restaurant doit être notifié via :

- Leur application tablette (notification push)
- Un système d'affichage cuisine (webhook HTTP vers leur matériel local)
- Un SMS de secours (si la notification tablette échoue)

Le service de notification tablette est fiable. Le webhook cuisine est parfois en panne (les restaurants éteignent leur matériel à la fermeture). Le SMS ne doit se déclencher que si la notification tablette échoue.

Concevez l'architecture en utilisant SNS et SQS. Comment géreriez-vous l'exigence « SMS uniquement si tablette échoue » ? Comment vous assureriez-vous que le webhook cuisine ne bloque pas la notification tablette quand il est hors ligne ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception de diffusion en éventail avec routage conditionnel.)*

## Scène post-générique

Le nouveau flux de commandes était en ligne.

Les clients passaient des commandes. L'API répondait en 95 millisecondes. La confirmation apparaissait instantanément sur leurs téléphones.

En coulisses : quatre services traitant de façon asynchrone. Le service analytique avait un bug qui le faisait planter sur les commandes contenant certains caractères spéciaux dans le nom de l'article. Sa file s'est accumulée jusqu'à 3 200 messages en deux heures.

Les clients ne l'ont jamais remarqué.

Quand Leo a corrigé le bug et que le service analytique a redémarré, il a traité l'arriéré en 18 minutes. Aucune donnée n'a été perdue. La DLQ était vide.

« C'est ce que signifie le découplage », dit Priya.

Tom lisait la page de tarification SQS. « Par million de requêtes, 0,40 dollar. »

« C'est cher ? »

« À notre volume actuel, environ douze dollars par mois. » Il fixa l'écran. « Je m'attendais à plus. »

Il avait l'air de quelqu'un qui découvre que quelque chose d'inattendu bon marché est aussi inattendu bon.

Dans le prochain chapitre : la fonction qui ne s'exécute que quand quelqu'un frappe — et qui ne coûte rien quand ils ne le font pas.
