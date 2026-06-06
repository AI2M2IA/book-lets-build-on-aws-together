# Chapitre 22 : L'organigramme qui s'exécute tout seul

Leo fixait le même fichier journal depuis une heure. Les traces de pile étaient assez claires individuellement, mais le schéma à travers elles — la façon dont une étape échouait silencieusement et l'étape suivante s'exécutait quand même — lui avait pris du temps à voir. Il finit par se renverser en arrière, posa son café, et écrivit un seul mot sur son bloc-notes : *coordination*.

Imaginez un chef d'orchestre quittant le podium en plein concert. L'orchestre continue de jouer — mais il n'y a personne pour faire entrer les cuivres à la mesure 47, personne pour donner le signal du silence avant le finale. Les musiciens individuels jouent leurs parties correctement. Le concert s'effondre quand même, parce que les parties dépendent d'une coordination que personne ne gère.

C'est le problème que Leo avait trouvé dans le code de confirmation de commande. Pas un bug dans une étape individuelle. Un échec de coordination.

---

Les conteneurs s'exécutaient correctement et se déployaient proprement. Le pipeline de déploiement ECS était solide. Mais à l'intérieur du code de l'application, un autre type d'échec s'accumulait depuis des semaines. Les conteneurs allaient bien. La logique à l'intérieur de l'un d'eux, non.

Leo suivait le schéma dans les journaux mais ne l'avait pas compris jusqu'à ce qu'il compte les occurrences.

Onze fois. En deux semaines.

---

Une confirmation de commande chez Nimbus nécessitait que cinq choses se produisent en séquence : débiter la carte, envoyer l'e-mail de confirmation, notifier le restaurant, mettre à jour l'inventaire, et enregistrer la transaction pour la comptabilité.

Quand Leo avait écrit la fonction de confirmation de commande originale, il avait enveloppé le tout dans un seul bloc `try/except` et dit « ça ira — on attrapera les erreurs dans les journaux ». C'était il y a huit mois.

Ça n'allait pas.

Si l'étape trois échouait — si la notification au restaurant expirait — les étapes un et deux s'étaient déjà produites. Le client avait été débité. L'e-mail avait été envoyé. Mais le restaurant ne savait pas que la commande existait.

Leo avait un nom pour cette catégorie de bug : le succès partiel. « Tout a fonctionné », disait-il, « sauf la partie qui importait. »

« Combien de fois cela s'est-il produit ? » demanda Maya.

« Onze fois au cours des deux dernières semaines. On en a attrapé la plupart grâce aux appels en colère au restaurant. Deux, on les a trouvés dans les journaux, après coup. »

« Donc on n'a aucune coordination », dit Priya. « Cinq étapes, exécutées comme un script, sans garantie qu'elles se complètent toutes. Et si quelqu'un essaie de s'introduire pendant l'étape deux — après que le débit est passé mais avant que le restaurant soit notifié ? On a déjà facturé au client une commande que le restaurant n'a pas. »

« Ou qu'elles se complètent dans le bon ordre. »

« Ou qu'on sache laquelle a échoué. »

Leo afficha le code sur le projecteur. C'était une fonction Python : cinquante lignes, cinq appels API séquentiels, un seul bloc try/except autour de tout.

« On a besoin d'un workflow », dit Maya. « Quelque chose qui suit chaque étape. Attends — mais *pourquoi* ne peut-on pas simplement ajouter une meilleure gestion d'erreurs à la fonction Python existante ? Pourquoi a-t-on besoin de tout un nouveau service ? »

« Parce qu'une meilleure gestion d'erreurs s'exécute quand même dans un seul processus qui peut échouer à n'importe quel point », dit Leo. « Si le serveur redémarre en cours d'exécution, la gestion d'erreurs redémarre avec lui. Step Functions persiste l'état en externe. »

Pensez à une liste de contrôle de fabrication — une où chaque poste confirme l'achèvement avant de passer au suivant, et où toute la chaîne garde sa position quand quelque chose échoue. La chaîne ne redémarre pas depuis le début. Elle reprend exactement au poste qui a échoué. L'état de ce poste est enregistré. Les étapes qui le précèdent sont faites et non répétées. Les étapes qui le suivent attendent que le problème soit résolu.

C'est ce dont le flux de confirmation de commande avait besoin. Pas plus de code autour du problème. Un système conçu pour gérer le problème.

**AWS Step Functions : orchestrer des workflows**

**AWS Step Functions** est un service d'orchestration serverless qui coordonne les étapes d'une application sous forme de workflow visuel. Chaque étape est un **état** dans une **machine à états**.

Au lieu d'un script Python qui s'exécute de haut en bas et plante, vous définissez le workflow comme une machine à états JSON/YAML :

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["States.ALL"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 3, "IntervalSeconds": 5}]
    },
    ...
  }
}
```

Chaque état peut :

- **Exécuter une fonction Lambda** (le modèle le plus courant)
- **Exécuter une tâche ECS** (pour un travail de plus longue durée)
- **Attendre un temps spécifique** ou un **événement** (mettre le workflow en pause jusqu'à ce que quelque chose d'externe se produise)
- **Choisir un chemin** en fonction de conditions (logique if/else)
- **Exécuter des branches parallèles** simultanément
- **Réessayer en cas d'échec** avec un backoff configurable
- **Capturer les erreurs** et les router vers des états de gestion d'erreurs

Step Functions gère l'état d'exécution de manière durable. Si l'étape 3 échoue, l'exécution se met en pause à l'étape 3. Vous pouvez inspecter l'exécution échouée dans la console, corriger le problème, et redémarrer à partir de l'étape 3 — sans répéter les étapes 1 et 2.

Vous vous demandez peut-être : ne pouvez-vous pas simplement écrire la logique de réessai dans votre fonction Lambda ? Oui — mais alors vous écrivez aussi le suivi des échecs, la persistance de l'état, et la journalisation d'audit dans le code. Et quand l'étape 3 sur 7 échoue, vous devez savoir quel restaurant était en cours de traitement, ce qui s'est passé avant, et où reprendre. Step Functions fait tout cela.

**Le flux de commandes Nimbus : machine à états annotée**

Voici une version simplifiée de la machine à états Step Functions réelle que Nimbus a construite pour la confirmation de commande — annotée pour que vous puissiez voir ce que fait chaque pièce :

```json
{
  "Comment": "Nimbus order confirmation workflow",
  "StartAt": "ChargeCard",
  "States": {
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:charge-card",
      "Next": "SendConfirmationEmail",
      "Retry": [
        {
          "ErrorEquals": ["PaymentRetryableError"],
          "MaxAttempts": 2,
          "IntervalSeconds": 3,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["PaymentDeclinedError"],
          "Next": "NotifyCustomerOfDecline"
        },
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "ChargeCardFailed"
        }
      ]
    },
    "SendConfirmationEmail": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:send-confirmation-email",
      "Next": "NotifyRestaurant",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 5
        }
      ]
    },
    "NotifyRestaurant": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-restaurant",
      "Next": "UpdateInventory",
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "MaxAttempts": 3,
          "IntervalSeconds": 10,
          "BackoffRate": 2.0
        }
      ],
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "RestaurantNotificationFailed"
        }
      ]
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:update-inventory",
      "Next": "LogTransaction",
      "Retry": [{"ErrorEquals": ["States.ALL"], "MaxAttempts": 2}]
    },
    "LogTransaction": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:log-transaction",
      "End": true
    },
    "NotifyCustomerOfDecline": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:notify-decline",
      "End": true
    },
    "ChargeCardFailed": {
      "Type": "Fail",
      "Error": "ChargeCardFailed",
      "Cause": "Card charge failed after retries"
    },
    "RestaurantNotificationFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:123456789012:function:alert-support",
      "Comment": "Alert support team — order charged but restaurant not notified",
      "End": true
    }
  }
}
```

Quelques points à noter :

**`ChargeCard` a deux clauses Catch.** Une pour `PaymentDeclinedError` (un échec connu et attendu — la carte a été refusée, pas une erreur système) et une pour `States.ALL` (tout le reste — une panne système, un délai d'attente, une exception inattendue). Elles routent vers des états différents parce qu'elles signifient des choses différentes.

**`NotifyRestaurant` a un Catch qui route vers `RestaurantNotificationFailed`.** C'est le bug qui a causé les onze incidents. Dans l'ancien script Python, il n'y avait pas d'équivalent — si la notification échouait, la fonction plantait silencieusement ou journalisait une erreur et continuait. Step Functions rend le chemin d'échec explicite : il va quelque part de spécifique, et ce quelque part alerte l'équipe de support avant que quiconque ait à appeler.

**Chaque Task a un Retry.** Si le service e-mail a un délai d'attente transitoire, il réessaie automatiquement, trois fois, avec un backoff croissant. Le client ne voit jamais cela. La commande n'est pas perdue.

**Le flux est un graphe, pas un script.** Si `NotifyRestaurant` échoue définitivement (après les réessais), l'exécution ne continue pas vers `UpdateInventory`. Le workflow s'arrête à `RestaurantNotificationFailed`. L'inventaire n'est pas mis à jour pour un restaurant qui ne connaît pas la commande. C'est le comportement correct.

« Attends — mais *pourquoi* a-t-on besoin de chemins d'échec séparés pour carte refusée vs erreur système ? » demanda Maya.

« Parce qu'ils nécessitent des réponses complètement différentes », dit Leo. « Une carte refusée signifie qu'on envoie un e-mail au client et qu'on lui demande de réessayer. Une erreur système dans la fonction de débit signifie qu'on a besoin d'un ingénieur pour enquêter sur la raison de l'échec de la fonction Lambda. Même résultat observable — la commande n'est pas passée — mais une remédiation complètement différente. »

**Types d'états : les blocs de construction**

**Task** : Exécuter une action — appeler une fonction Lambda, démarrer une tâche ECS, appeler une API. C'est là que le vrai travail se fait.

**Choice** : Bifurquer en fonction des conditions dans les données d'entrée. Comme un if/else dans le code.

**Parallel** : Exécuter plusieurs branches simultanément et attendre que toutes se complètent.

**Map** : Appliquer un ensemble d'états à chaque élément d'une liste. Traiter 50 éléments du menu d'un restaurant en parallèle.

Quand Nimbus importait le menu d'un restaurant, le menu pouvait contenir de 8 à 200 éléments. Pour chaque élément, le processus d'import devait : valider le format, vérifier les données d'allergènes, redimensionner la photo, et écrire l'enregistrement dans DynamoDB.

Sans l'état Map, ce serait une seule Lambda traitant les éléments séquentiellement — 200 éléments × 200 ms par élément = 40 secondes de temps de traitement. Avec l'état Map, Step Functions lance des exécutions concurrentes des états de traitement — jusqu'à la limite de concurrence configurée — et attend que toutes se complètent. Les mêmes 200 éléments peuvent se terminer en moins de 5 secondes.

**Wait** : Mettre en pause pendant une durée spécifiée ou jusqu'à un horodatage. Utile pour les délais planifiés.

**Pass** : Transmettre l'entrée à la sortie sans effectuer de travail. Utilisé pour la transformation de données et les tests.

**Succeed/Fail** : États terminaux qui mettent fin à l'exécution.

Pour l'intégration des restaurants, Leo a conçu un workflow :

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, avec 3 réessais)
3. Branche parallèle :
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, attend que le parallèle se complète)
5. NotifySalesTeam (Task → Lambda)

Les étapes 3a et 3b s'exécutent en parallèle — elles ne dépendent pas l'une de l'autre, et les exécuter simultanément économise du temps.

Après que la première cohorte de restaurants eut terminé son intégration, une exigence de conformité émergea : avant qu'un partenaire restaurant puisse passer en production, un gestionnaire de compte Nimbus devait manuellement examiner et approuver la documentation de licence. Cela pouvait prendre un à trois jours ouvrables.

« Et si quelqu'un essaie de s'introduire pendant cette fenêtre ? » demanda Priya. « Si le restaurant est partiellement configuré — compte de paiement créé mais pas encore approuvé — et que quelqu'un découvre l'état en attente, il pourrait essayer d'exploiter la configuration à moitié ouverte. »

Plus concrètement : comment mettez-vous en pause un workflow Step Functions pendant trois jours en attendant un humain ?

La réponse est le **modèle de callback avec un token de tâche**.

Quand `ValidateLicense` s'exécute, au lieu de se compléter automatiquement, il appelle une Lambda qui fait trois choses :

1. Envoie un e-mail au gestionnaire de compte avec les documents du restaurant
2. Enregistre un **token de tâche** (un identifiant unique que Step Functions génère pour cette exécution et cet état spécifiques) dans une base de données, associé à cet examen en attente
3. Retourne à Step Functions avec `.waitForTaskToken` — ce qui indique à Step Functions de mettre l'exécution en pause à cet état indéfiniment

Step Functions met l'exécution en attente. Rien d'autre n'est bloqué — aucun serveur ne reste à attendre. La machine à états attend simplement, ne consommant aucune ressource de calcul.

Trois jours plus tard, le gestionnaire de compte clique sur « Approuver » dans l'outil d'administration interne. L'outil d'administration recherche le token de tâche dans la base de données et appelle :

```python
stepfunctions.send_task_success(
    taskToken=token,
    output=json.dumps({"approved": True, "reviewedBy": "dana.cole@eatnimbus.com"})
)
```

Step Functions reprend. L'exécution continue à partir de l'étape 2 (`ImportMenu`), avec les informations de l'examinateur disponibles dans l'état du workflow.

« L'exécution a été mise en pause pendant trois jours », dit Leo, « et la seule chose qui s'est passée quand je l'ai approuvée a été un seul appel d'API. »

« Et si le gestionnaire de compte la rejette ? » demanda Maya.

« On appelle `send_task_failure` à la place. La machine à états attrape cela et route vers un état `NotifyRejection` qui envoie un e-mail au partenaire restaurant. »

Step Functions ne sonde pas. Il ne réessaie pas. Il n'expire pas (sauf si vous définissez un délai d'attente de heartbeat). Il attend simplement que le callback arrive, puis continue. C'est fondamentalement différent de sonder une base de données ou une file — et c'est pourquoi Step Functions est bien adapté aux workflows qui mêlent étapes automatisées et manuelles.

**Lire la console d'exécution : à quoi ressemble un échec**

Quand la Lambda de notification du restaurant a expiré pendant la première semaine de Nimbus sur Step Functions, Leo a ouvert la console Step Functions et a cliqué sur l'exécution échouée.

L'**Historique des événements d'exécution** montrait une chronologie de exactement ce qui s'était passé :

```
14:23:01.442  ExecutionStarted       {"orderId": "ORD-8812", "restaurantId": "94"}
14:23:01.698  TaskStateEntered       ChargeCard
14:23:02.104  TaskStateExited        ChargeCard — success
14:23:02.201  TaskStateEntered       SendConfirmationEmail
14:23:02.884  TaskStateExited        SendConfirmationEmail — success
14:23:02.901  TaskStateEntered       NotifyRestaurant
14:23:12.901  TaskTimedOut           NotifyRestaurant — attempt 1/3 (Lambda timeout: 10s)
14:23:23.001  TaskTimedOut           NotifyRestaurant — attempt 2/3
14:23:43.001  TaskTimedOut           NotifyRestaurant — attempt 3/3
14:23:43.022  CatchStateEntered      RestaurantNotificationFailed
14:23:43.155  TaskStateEntered       RestaurantNotificationFailed (alert-support Lambda)
14:23:43.640  TaskStateExited        RestaurantNotificationFailed — success
14:23:43.642  ExecutionFailed
```

En 42 secondes, Step Functions avait débité la carte, envoyé l'e-mail, tenté la notification au restaurant trois fois, attrapé l'échec, alerté l'équipe de support, et enregistré l'historique complet. Avant Step Functions, cet échec aurait été invisible — la fonction Python aurait journalisé « notification échouée » et renvoyé 200 à l'appelant comme si tout allait bien.

« La chronologie montre exactement où les choses ont mal tourné et quand », dit Leo. « Et chaque tentative de réessai est horodatée. Vous pouvez voir les intervalles de backoff. »

Priya regarda la console. « Et cet historique est stocké combien de temps ? »

L'historique d'exécution des workflows standard est stocké pendant 90 jours. Pour la conformité ou l'audit à long terme, les événements d'exécution peuvent aussi être exportés vers CloudWatch Logs et conservés indéfiniment.

**Workflows Standard vs Express**

Step Functions propose deux types de workflows :

**Workflows standard** :

- Durée maximale : 1 an
- Les exécutions sont durables — l'état est persisté, peut être inspecté et audité
- Exécution exactement une fois (une tâche n'est jamais exécutée plus d'une fois sauf si vous configurez un Retry)
- Facturé par transition d'état
- Idéal pour les workflows importants de longue durée (traitement de commandes, intégration, flux de paiement)

**Workflows express** :

- Durée maximale : 5 minutes
- Débit plus élevé — jusqu'à 100 000 par seconde
- Exécution au moins une fois (asynchrone) ou au plus une fois (synchrone) — concevez les tâches pour être idempotentes
- Facturé par durée (comme Lambda)
- Idéal pour les workflows de courte durée à volume élevé (traitement d'événements en temps réel, ingestion de données IoT)

« Combien cela coûte-t-il par mois ? » demanda Tom en ouvrant la page de tarification. « Par transition d'état pour Standard — ça s'additionne si vous avez beaucoup d'étapes. »

Leo passa en revue le calcul. Pour le workflow d'intégration des restaurants (six états de tâche par exécution, environ 12 à 15 nouveaux restaurants par mois) : moins d'une centaine de transitions d'état — moins d'un centime, et entièrement à l'intérieur du niveau gratuit mensuel de 4 000 transitions, donc effectivement 0 $. Pour le workflow de confirmation de commande au plein trafic de Nimbus : plus significatif, mais toujours bien en dessous du coût du débogage manuel de onze succès partiels par mois.

« Le temps de débogage est le coût caché », dit Leo.

« C'est toujours le coût caché », dit Tom.

Tom fit les calculs plus soigneusement, parce que c'était Tom.

**Coût d'un workflow standard pour le flux de confirmation de commande de Nimbus** : cinq états par commande sur le chemin heureux, à 0,000025 $ par transition d'état. Cinq transitions d'état × 0,000025 $ × 15 000 commandes par mois = **1,88 $/mois**. À dix fois le volume de commandes : environ 19 $/mois. Le coût de débogage d'un seul incident de succès partiel (24 minutes de temps d'un ingénieur de support) dépassait la facture mensuelle de Step Functions de nombreuses fois.

La comparaison devient importante si quelqu'un suggère d'utiliser des workflows standard pour des événements analytiques à haute fréquence. Supposons que Nimbus voulait utiliser Step Functions pour traiter chaque événement brut de flux de clics — chaque vue de page de menu, chaque défilement, chaque recherche. C'est environ 800 000 événements par jour à leur échelle actuelle. Un workflow standard à cinq états pour chaque événement : 800 000 × 5 × 0,000025 $ × 30 jours = **3 000 $/mois**. C'est de l'argent réel pour un pipeline analytique.

Des workflows express pour ce même volume : facturés par requête plus durée, pas par transition d'état. Les 24 millions d'exécutions mensuelles coûtent 1,00 $ par million de requêtes = 24 $. Durée : 24 M × 500 ms au minimum de facturation de 64 Mo ≈ 208 Go-heures × 0,06 $ = 12,50 $. Total ≈ **36,50 $/mois** — près de deux ordres de grandeur moins cher que les 3 000 $ de Standard.

« Donc le type de workflow n'est pas seulement une décision architecturale », dit Tom. « C'est une décision de coût. Le même nombre d'états peut coûter presque cent fois plus selon le type de workflow que vous utilisez. »

« Et lequel est meilleur dépend entièrement de ce que fait le workflow », dit Leo. « Confirmation de commande : Standard. C'est important, ça a des chemins d'échec significatifs, on veut la piste d'audit. Traitement d'événements analytiques : Express. C'est à volume élevé, courte durée, et on n'a pas besoin de 90 jours d'historique d'exécution pour chaque vue de page. »

Si votre processus a deux étapes et n'a pas besoin de piste d'audit, une simple fonction Lambda est moins chère et ne nécessite aucune syntaxe de machine à états JSON — mais si une étape peut échouer indépendamment et doit être réessayée ou redémarrée sans répéter les étapes précédentes, Step Functions se rentabilise par la réduction du débogage et de la remédiation manuelle.

Pour l'intégration des restaurants de Nimbus : Standard (c'est important, durable, peut prendre des heures si des étapes manuelles sont impliquées).

Pour les mises à jour d'état des commandes en temps réel de Nimbus : Express (volume élevé, courte durée, moins critique).

**Architecture événementielle : la vue d'ensemble**

Step Functions est une pièce d'un modèle plus large : l'**architecture événementielle**. Au lieu que les services s'appellent directement (couplage fort), les services émettent des événements, et d'autres services réagissent à ces événements.

Nous avons vu cela tout au long du livre :

- Commandes passées → SNS publie un événement → Les files SQS livrent aux consommateurs
- Fichier S3 téléversé → Lambda déclenché pour le traiter
- Enregistrement DynamoDB modifié → DynamoDB Streams → Lambda met à jour un cache

**Amazon EventBridge** (anciennement CloudWatch Events) est le bus d'événements avancé pour ce modèle. Il route les événements des services AWS et de vos propres applications vers des cibles (Lambda, SQS, Step Functions, etc.) selon des règles.

EventBridge permet un couplage faible au niveau architectural : le service de commandes publie des événements `order.placed` sans savoir qui écoute. Le service d'analytique, le service de notifications et le service de points de fidélité écoutent tous de manière indépendante. L'ajout d'un nouvel écouteur ne nécessite pas de modifier le service de commandes.

EventBridge s'intègre aussi nativement avec des dizaines de services AWS en tant que **sources d'événements**. Quand un appel d'API CloudTrail correspond à un schéma, EventBridge peut déclencher une règle. Quand une instance EC2 change d'état, EventBridge peut déclencher une Lambda. Quand une instance RDS bascule, EventBridge peut alerter l'ingénieur d'astreinte. Vous pouvez traiter tout le plan de contrôle AWS comme un flux d'événements.

Pour Nimbus, une règle EventBridge particulièrement utile : déclencher une Lambda chaque fois qu'une nouvelle image est poussée vers ECR. La Lambda vérifie le résultat de l'analyse de l'image et publie dans le canal Slack d'ingénierie si des CVE HIGH ou CRITICAL sont trouvées — avant que quiconque déploie l'image. Cela combine l'analyse de sécurité d'ECR (du chapitre 21) avec le routage d'événements d'EventBridge en une porte de sécurité automatisée.

Le principe de l'architecture événementielle est le même que la logique de réessai de Step Functions : rendre l'échec explicite et routé, pas silencieux et avalé. Les services qui communiquent par événements échouent avec grâce — si la Lambda de points de fidélité est en panne quand un événement `OrderConfirmed` se déclenche, EventBridge peut réessayer la livraison ou envoyer vers une file de lettres mortes. La confirmation de commande elle-même n'est pas affectée. Le découplage est la résilience.

**EventBridge : découpler les effets de bord du flux principal**

Après que la machine à états de confirmation de commande tournait proprement, Maya souleva une question lors de la revue d'architecture suivante.

« On veut ajouter des points de fidélité quand une commande est confirmée. Le client obtient un point par dollar dépensé. Où cela va-t-il dans la machine à états ? »

Le premier instinct de Leo : ajouter un état `GrantLoyaltyPoints` après `LogTransaction`.

La réponse de Priya : « Et puis quand on ajoute les bonus de parrainage ? Et les enquêtes post-commande ? Et les demandes d'évaluation des restaurants ? Chacun ajoute un état au chemin critique. Si la Lambda de points de fidélité échoue, toute la confirmation de commande échoue. »

« Le flux de confirmation de commande devrait faire une seule chose », dit-elle. « Confirmer la commande. Tout le reste est un effet de bord. »

C'est l'argument architectural en faveur d'**Amazon EventBridge** comme mécanisme pour découpler faiblement les effets de bord du workflow principal.

L'approche révisée : quand l'état `LogTransaction` se complète avec succès, la Lambda publie un événement vers EventBridge :

```json
{
  "source": "nimbus.orders",
  "detail-type": "OrderConfirmed",
  "detail": {
    "orderId": "ORD-8812",
    "customerId": "CUST-441",
    "restaurantId": "94",
    "total": 3200,
    "timestamp": "2024-03-15T14:23:43Z"
  }
}
```

Puis les règles EventBridge routent cet événement vers des cibles indépendantes :

- **Règle 1** : `OrderConfirmed` → Lambda de points de fidélité (accorde 32 points pour une commande de 32 $)
- **Règle 2** : `OrderConfirmed` → Lambda d'enquête post-commande (met en file une enquête pour 2 heures après la livraison)
- **Règle 3** : `OrderConfirmed` → Flux Kinesis d'analytique (alimente le tableau de bord en temps réel)

Chaque règle est indépendante. La Lambda de points de fidélité peut échouer sans affecter la file d'enquête. Le pipeline analytique peut prendre du retard sans bloquer le système de fidélité. Ajouter un nouvel effet de bord (une demande d'évaluation de restaurant, une notification de cashback) nécessite de créer une nouvelle règle EventBridge — pas de modifier la machine à états.

« Et si quelqu'un essaie de s'introduire par une règle EventBridge ? » demanda Priya. « Si l'événement contient des PII du client, chaque Lambda qui le reçoit est maintenant un point d'accès aux PII. »

L'événement a été conçu soigneusement : seulement les ID, pas les noms, adresses, ou détails de paiement. Toute Lambda ayant besoin de données client les rechercherait dans la base de données en utilisant l'ID du client — avec ses propres permissions IAM contrôlant ce à quoi elle pouvait accéder.

« L'événement est un signal », dit Priya. « Pas un déversement de données. »

**Quand Step Functions est le bon outil**

Step Functions excelle quand vous avez :

**Des workflows à plusieurs étapes** qui doivent suivre la progression entre les étapes

**Des processus nécessitant une intervention humaine** — Step Functions peut attendre indéfiniment un événement externe (comme un humain approuvant quelque chose) puis continuer

**La gestion des erreurs à grande échelle** — logique de nouvelle tentative, de capture et de repli intégrée sur de nombreuses étapes

**Des processus auditables** — chaque exécution enregistre chaque transition d'état. Vous pouvez voir exactement ce qui s'est passé et quand.

**Une logique parallèle ou séquentielle complexe** — le workflow visuel facilite le raisonnement par rapport au code équivalent

Step Functions est excessif pour les processus simples en deux étapes. Utilisez-le quand la coordination elle-même est précieuse et que les scénarios d'échec sont importants.

**Quand Step Functions est le mauvais outil**

« Attends — mais *pourquoi* n'utiliserions-nous pas Step Functions pour tout ? » demanda Maya à la fin de la session de conception. « On a construit le workflow d'intégration des restaurants. On a le flux de confirmation de commande. Pourquoi ne pas tout convertir en machines à états ? »

La réponse honnête : parce que Step Functions ajoute une surcharge que tous les workflows ne justifient pas.

**Processus simples en deux étapes** : Si vous avez une Lambda qui traite un fichier téléversé en appelant une seconde Lambda, la surcharge de coordination d'une machine à états ne vaut pas le bénéfice opérationnel. Deux Lambda appelées séquentiellement dans une seule fonction est plus simple, plus facile à tester, et n'a aucun coût par transition d'état.

**Workflows ultra-haute fréquence, sous-seconde** : Les workflows standard ont un coût par transition d'état non négligeable qui s'accumule à volume élevé (comme l'exemple analytique ci-dessus l'a montré). Les workflows express résolvent le problème de coût mais ne fournissent pas d'historique d'état durable. À très haute fréquence avec très courte durée, SQS plus Lambda (le modèle du chapitre 19) est plus simple et moins cher que l'un ou l'autre type de Step Functions.

**Pure diffusion en éventail sans coordination** : Si vous devez envoyer le même événement à vingt consommateurs et que vous ne vous souciez pas du résultat de chacun, SNS est l'outil. Step Functions ajoute un suivi d'état dont vous n'avez pas besoin et que vous paieriez inutilement.

**Interactions utilisateur synchrones en temps réel** : Les exécutions Step Functions sont asynchrones. Si un utilisateur attend sur un écran de paiement une réponse synchrone en moins de 500 ms, un workflow standard Step Functions n'est pas conçu pour cela (les workflows express peuvent être invoqués de façon synchrone, mais la surcharge de latence reste plus élevée qu'un appel Lambda direct). Pour les flux synchrones destinés à l'utilisateur, Lambda + API Gateway avec une gestion d'erreurs bien conçue est souvent plus approprié.

Le principe : utilisez Step Functions quand la *coordination* des étapes est elle-même complexe — quand les étapes peuvent échouer indépendamment, quand vous devez réessayer des étapes individuelles sans répéter les précédentes, quand l'historique d'exécution a une valeur de conformité ou de débogage, ou quand le workflow implique des étapes d'approbation humaine qui peuvent prendre des jours. Ne l'utilisez pas pour ajouter une surcharge d'orchestration à une logique séquentielle simple qui fonctionne bien comme une seule fonction.

## Points forts et limites

**Pourquoi Step Functions est puissant** :

- Historique d'exécution visuel — voir exactement où un workflow en est (ou a échoué)
- Nouvelle tentative et gestion d'erreurs intégrées — pas de code de nouvelle tentative personnalisé
- État durable — les exécutions survivent aux redémarrages et pannes de service
- Intégrations directes avec plus de 200 services AWS (pas seulement Lambda)
- Le workflow visuel est auto-documenté
- Le modèle de callback permet une attente indéfinie d'actions humaines sans consommer de calcul

**Là où ça se complique** :

- Les workflows standard sont facturés par transition d'état — les workflows complexes avec de nombreux états peuvent devenir coûteux à grande échelle
- Le format JSON ASL (Amazon States Language) a une courbe d'apprentissage
- La taille maximale de charge utile est de 256 Ko — les données volumineuses doivent être passées via des références S3, pas directement dans le workflow
- Les workflows de longue durée avec de nombreuses étapes manuelles nécessitent une configuration soigneuse des délais d'expiration
- Le débogage des erreurs ASL nécessite d'exécuter des exécutions ; il n'existe pas d'émulateur local aussi capable que le service réel
- Les permissions IAM doivent être accordées séparément pour chaque ressource que la machine à états appelle — oublier une permission cause une erreur déroutante au moment de l'exécution

## Résumé

Les conteneurs du chapitre 21 ont rendu les déploiements fiables. Step Functions rend les processus métier à plusieurs étapes fiables — le même principe d'« éliminer le risque de transfert » appliqué à la logique applicative.

- **Step Functions** orchestre des workflows à plusieurs étapes sous forme de machines à états.
- Chaque **état** peut exécuter une fonction Lambda, une tâche ECS, attendre, bifurquer ou exécuter des étapes parallèles.
- **Nouvelle tentative et capture** sont intégrées dans chaque état — pas de code de nouvelle tentative personnalisé nécessaire.
- **Workflows standard** : longue durée (jusqu'à 1 an), durables, exactement une fois. Pour les processus métier critiques.
- **Workflows express** : courte durée (jusqu'à 5 minutes), haut débit. Pour le traitement d'événements à volume élevé.
- **Modèle de callback avec token de tâche** : mettre un workflow en pause indéfiniment en attendant un événement externe ou une action humaine ; reprendre avec un seul appel d'API.
- **État Map** : traiter une liste d'éléments en concurrence — remplacer les boucles séquentielles par une diffusion en éventail parallèle.
- **Intégrations SDK directes** : appeler DynamoDB, S3, SQS et plus de 200 services AWS directement depuis un état, sans wrapper Lambda.
- **EventBridge** : découpler les effets de bord du workflow principal — publier un seul événement, laisser des règles indépendantes le router vers les services de points de fidélité, d'analytique et d'enquêtes sans modifier la machine à états principale.
- **Coût Standard vs Express** : Standard à 0,000025 $ par transition d'état fonctionne bien pour les workflows critiques à faible volume (confirmation de commande à 1,88 $/mois pour Nimbus). Express à une tarification par requête plus durée est approprié pour les événements à haute fréquence où Standard coûterait des dizaines de fois plus (~80x dans le calcul de flux de clics de Nimbus).
- L'**architecture événementielle** utilise des services comme SNS, SQS, Lambda et EventBridge pour découpler les systèmes autour des événements plutôt que des appels directs.
- Utilisez Step Functions quand la coordination des étapes est elle-même complexe et quand l'auditabilité est importante. Ne l'utilisez pas pour des séquences simples en deux étapes, des workflows ultra-haute fréquence, de la pure diffusion en éventail, ou des flux synchrones destinés à l'utilisateur.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Signaux d'usage de Step Functions** : « orchestrer plusieurs fonctions Lambda », « workflow avec nouvelles tentatives et gestion d'erreurs », « étape d'approbation humaine dans un workflow automatisé », « piste d'audit de chaque étape du workflow » → Step Functions.
- **Standard vs Express** : Standard pour les workflows de longue durée, auditables, critiques pour le métier. Express pour le traitement d'événements à haut débit et courte durée.
- **SQS vs Step Functions** : SQS pour les files de tâches simples (producteur/consommateur). Step Functions pour les workflows à plusieurs étapes avec logique complexe, nouvelles tentatives et suivi d'état.
- **Signaux EventBridge** : « router les événements des services AWS vers des cibles », « intégration événementielle entre services », « planifier une fonction Lambda » → EventBridge (anciennement CloudWatch Events).
- **Modèle de callback** : Step Functions peut mettre en pause l'exécution et attendre un callback externe (un token de tâche). Le worker rappelle quand il a terminé. Utile pour les tâches ECS de longue durée où vous ne voulez pas la limite de 15 minutes de Lambda.
- **Intégrations SDK directes** : Step Functions peut appeler directement des services AWS (DynamoDB, S3, SQS, etc.) sans passer par Lambda. Réduit le coût et la latence pour les appels de service simples. Par exemple, écrire un enregistrement de commande dans DynamoDB peut être un appel SDK direct depuis la machine à états sans fonction Lambda : `"Resource": "arn:aws:states:::dynamodb:putItem"`. Cela élimine le démarrage à froid de Lambda, le coût d'exécution de Lambda, et le code qui ne fait qu'appeler `dynamodb.put_item(...)` et retourner.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez pourquoi Step Functions est utile pour les workflows à plusieurs étapes. Que fournit-il qu'une simple fonction Lambda appelant d'autres fonctions Lambda ne fournit pas ?

*(Indice : Pensez à ce qui se passe quand l'étape 3 sur 5 échoue dans chaque approche. Comment savez-vous ce qui s'est passé ? Comment réessayez-vous uniquement l'étape 3 ?)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une société de services financiers traite les demandes de prêt en plusieurs étapes : vérification de crédit, vérification des revenus, validation des documents, examen par un souscripteur (manuel), et notification de décision. Chaque étape peut prendre de quelques secondes (vérification de crédit) à plusieurs jours (examen du souscripteur). L'entreprise a besoin d'une piste d'audit complète de chaque étape pour la conformité. Les étapes automatisées échouées doivent se réessayer automatiquement ; les étapes manuelles doivent se mettre en pause et attendre une décision humaine.

Quel service répond LE MIEUX à ces exigences ?

A) Des fonctions AWS Lambda enchaînées avec des files SQS entre chaque étape  
B) Des workflows standard AWS Step Functions avec un modèle d'attente de callback pour l'étape d'examen du souscripteur  
C) Des workflows express AWS Step Functions pour les étapes automatisées et SQS FIFO pour l'étape manuelle  
D) Amazon EventBridge avec des règles d'événements routant entre des fonctions Lambda pour chaque étape

**Indice 1** : Durée « jusqu'à plusieurs jours » — quel type de Step Functions prend cela en charge ?

**Indice 2** : « Attendre une décision humaine » — quel modèle Step Functions est conçu pour cela ?

**Indice 3** : « Piste d'audit complète pour la conformité » — quel service fournit un historique d'état par exécution ?

**Réponse** : B

**Explication** : Les workflows standard Step Functions peuvent s'exécuter jusqu'à 1 an, prenant en charge l'étape d'examen du souscripteur qui dure plusieurs jours. Le modèle d'attente de callback met l'exécution en pause à l'étape du souscripteur avec un token de tâche ; quand le souscripteur prend une décision, il rappelle avec le token pour continuer le workflow. Les workflows standard enregistrent chaque transition d'état — piste d'audit complète pour la conformité.

**Pourquoi pas A ?** Lambda enchaîné via SQS ne fournit pas de suivi d'état intégré ni de piste d'audit. Les étapes échouées nécessitent une logique de nouvelle tentative personnalisée. Redémarrer à partir d'une étape échouée spécifique nécessite une implémentation personnalisée.

**Pourquoi pas C ?** Les workflows express ont une durée maximale de 5 minutes — incompatible avec une étape qui peut durer plusieurs jours.

**Pourquoi pas D ?** EventBridge route les événements entre services mais ne maintient pas l'état du workflow ni ne fournit de nouvelle tentative/audit intégré. Construire cela sur EventBridge seul nécessite une gestion d'état personnalisée.

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus construit un processus de résolution des litiges sur la qualité des aliments. Quand un client signale une mauvaise expérience :

1. Le rapport est automatiquement validé (vérifie si la commande existe, si elle est suffisamment récente)
2. Le restaurant est automatiquement notifié
3. Un agent de support Nimbus examine la plainte (étape manuelle — peut prendre 1 à 3 jours ouvrables)
4. Selon la décision de l'agent : émettre un remboursement (Lambda → processeur de paiement) OU envoyer un bon d'excuse (Lambda → service de bons) OU escalader à la direction (sous-workflow Step Functions)
5. Le client est notifié du résultat

Concevez ceci comme un workflow Step Functions. Quel type d'état gère chaque étape ? Comment géreriez-vous l'attente de 1 à 3 jours ? Comment modéliseriez-vous la bifurcation à l'étape 4 ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception d'états Step Functions.)*

**Extension** : Après que la machine à états se complète (quelle que soit la branche), elle publie un événement `OrderDisputeResolved` vers EventBridge. Quels effets de bord pourraient écouter cet événement ? Considérez : le système d'évaluation du restaurant, les points de fidélité du client (les remboursements pourraient déduire des points), le pipeline analytique (le taux de litiges est une métrique clé de qualité des restaurants), et le tableau de bord de suivi du SLA de l'équipe de support client. Comment l'utilisation d'EventBridge ici empêche-t-elle la machine à états de litiges de devenir une toile de dépendances ?

## Scène post-générique

Le workflow d'intégration des restaurants était en ligne.

Au cours du mois suivant, 12 nouveaux partenaires restaurants ont été intégrés. Deux avaient des échecs lors de l'étape de traitement des paiements (étape 3). Dans les deux cas, Step Functions a capturé l'erreur exacte, sauvegardé l'état de l'exécution, et envoyé une alerte à l'équipe Nimbus.

Leo a corrigé la cause racine (une clé API mal configurée pour le fournisseur de paiement) et a réessayé les deux exécutions à partir de l'étape 3. Les exécutions se sont complétées en 23 secondes chacune, reprenant exactement là où elles avaient échoué.

Aucun restaurant n'a eu besoin d'être réimporté. Aucun rôle IAM n'a été créé en double. Aucun e-mail de bienvenue n'a été envoyé en double.

« Avant Step Functions », dit Leo à Maya, « cela aurait nécessité que quelqu'un suive manuellement ce qui avait et n'avait pas été fait pour chaque restaurant, et exécute manuellement les étapes manquantes. »

« Et maintenant ? »

« Maintenant je clique sur réessayer dans la console. Le système sait ce qui est fait. »

Maya réfléchit à cela.

« Ce n'est pas seulement une amélioration technique », dit-elle. « C'est la différence entre un processus qui s'adapte et un qui ne s'adapte pas. »

Dans le prochain chapitre : quoi faire avec des données auxquelles vous n'accédez pas en ce moment, mais que vous voulez définitivement conserver pour toujours.
