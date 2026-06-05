# Chapitre 22 : L'Organigramme Qui S'Exécute Tout Seul

Une confirmation de commande chez Nimbus nécessitait que cinq choses se produisent en séquence : débiter la carte, envoyer l'e-mail de confirmation, notifier le restaurant, mettre à jour l'inventaire, et enregistrer la transaction pour la comptabilité. Si l'étape trois échouait — si la notification au restaurant expirait — les étapes un et deux s'étaient déjà produites. Le client avait été débité. L'e-mail avait été envoyé. Mais le restaurant ne savait pas que la commande existait.

Leo avait un nom pour cette catégorie de bug : le succès partiel. « Tout a fonctionné, » disait-il, « sauf la partie qui importait. »

« Combien de fois cela s'est-il produit ? » demanda Maya.

« Onze fois au cours des deux dernières semaines. On en a attrapé la plupart grâce aux appels en colère au restaurant. Deux on les a trouvés dans les logs, après coup. »

« Donc on n'a aucune coordination, » dit Priya. « Cinq étapes, exécutées comme un script, sans garantie qu'elles se complètent toutes. »

« Ou qu'elles se complètent dans le bon ordre. »

« Ou qu'on sache laquelle a échoué. »

Leo afficha le code sur le projecteur. C'était une fonction Python : cinquante lignes, cinq appels API séquentiels, un seul bloc try/except autour de tout. « Si quoi que ce soit ici lève une exception, on obtient un 500 et le client voit une erreur. Mais les débits et les e-mails ne font pas de rollback. »

« On a besoin d'un workflow, » dit Maya. « Quelque chose qui suit chaque étape. »

**AWS Step Functions : Orchestrer des Workflows**

**AWS Step Functions** est un service d'orchestration serverless qui coordonne les étapes d'une application sous forme de workflow visuel. Chaque étape est un **état** dans une **machine à états**.

Au lieu d'un script Python qui s'exécute de haut en bas et plante, vous définissez le workflow comme une machine à états JSON/YAML :

```json
{
  "StartAt": "ValidateLicense",
  "States": {
    "ValidateLicense": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:validate-license",
      "Next": "ImportMenu",
      "Catch": [{"ErrorEquals": ["*"], "Next": "OnboardingFailed"}]
    },
    "ImportMenu": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:import-menu",
      "Next": "SetupPayments",
      "Retry": [{"ErrorEquals": ["*"], "MaxAttempts": 3, "IntervalSeconds": 5}]
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

**Types d'États : Les Blocs de Construction**

**Task** : Exécuter une action — appeler une fonction Lambda, démarrer une tâche ECS, appeler une API. C'est là que le vrai travail se fait.

**Choice** : Bifurquer en fonction des conditions dans les données d'entrée. Comme un if/else dans le code.

**Parallel** : Exécuter plusieurs branches simultanément et attendre que toutes se complètent.

**Map** : Appliquer un ensemble d'états à chaque élément d'une liste. Traiter 50 éléments du menu d'un restaurant en parallèle.

**Wait** : Mettre en pause pendant une durée spécifiée ou jusqu'à un horodatage. Utile pour les délais planifiés.

**Pass** : Transmettre l'entrée à la sortie sans effectuer de travail. Utilisé pour la transformation de données et les tests.

**Succeed/Fail** : États terminaux qui mettent fin à l'exécution.

Pour l'intégration du restaurant, Leo a conçu un workflow :

1. ValidateLicense (Task → Lambda)
2. ImportMenu (Task → Lambda, avec 3 essais)
3. Branche parallèle :
   a. SetupPayments (Task → Lambda)
   b. CreateIAMRole (Task → Lambda)
4. SendWelcomeEmail (Task → Lambda, attend que le parallèle se complète)
5. NotifySalesTeam (Task → Lambda)

Les étapes 3a et 3b s'exécutent en parallèle — elles ne dépendent pas l'une de l'autre, et les exécuter simultanément économise du temps.

**Workflows Standard vs Express**

Step Functions propose deux types de workflows :

**Workflows standard** :

- Durée maximale : 1 an
- Les exécutions sont durables — l'état est persisté, peut être inspecté et audité
- Exécution au moins une fois (chaque tâche s'exécute au moins une fois)
- Facturé par transition d'état
- Idéal pour les workflows importants de longue durée (traitement de commandes, intégration, flux de paiement)

**Workflows express** :

- Durée maximale : 5 minutes
- Débit plus élevé — jusqu'à 100 000 par seconde
- Au moins une fois ou au plus une fois (configurable)
- Facturé par durée (comme Lambda)
- Idéal pour les workflows de courte durée à volume élevé (traitement d'événements en temps réel, ingestion de données IoT)

Pour l'intégration des restaurants de Nimbus : Standard (c'est important, durable, peut prendre des heures si des étapes manuelles sont impliquées).

Pour les mises à jour d'état des commandes en temps réel de Nimbus : Express (volume élevé, courte durée, moins critique).

**Architecture Événementielle : La Vue d'Ensemble**

Step Functions est une pièce d'un modèle plus large : l'**architecture événementielle**. Au lieu que les services s'appellent directement (couplage fort), les services émettent des événements, et d'autres services réagissent à ces événements.

Nous avons vu cela tout au long du livre :

- Commandes passées → SNS publie un événement → Les files SQS livrent aux consommateurs
- Fichier S3 téléversé → Lambda déclenché pour le traiter
- Enregistrement DynamoDB modifié → DynamoDB Streams → Lambda met à jour un cache

**Amazon EventBridge** (anciennement CloudWatch Events) est le bus d'événements avancé pour ce modèle. Il route les événements des services AWS et de vos propres applications vers des cibles (Lambda, SQS, Step Functions, etc.) selon des règles.

EventBridge permet un couplage faible au niveau architectural : le service de commandes publie des événements `order.placed` sans savoir qui écoute. Le service d'analytique, le service de notifications et le service de points de fidélité écoutent tous de manière indépendante. L'ajout d'un nouvel écouteur ne nécessite pas de modifier le service de commandes.

**Quand Step Functions est le Bon Outil**

Step Functions excelle quand vous avez :

**Des workflows à plusieurs étapes** qui doivent suivre la progression entre les étapes

**Des processus nécessitant une intervention humaine** — Step Functions peut attendre indéfiniment un événement externe (comme un humain approuvant quelque chose) puis continuer

**La gestion des erreurs à grande échelle** — logique de nouvelle tentative, de capture et de repli intégrée sur de nombreuses étapes

**Des processus auditables** — chaque exécution enregistre chaque transition d'état. Vous pouvez voir exactement ce qui s'est passé et quand.

**Une logique parallèle ou séquentielle complexe** — le workflow visuel facilite le raisonnement par rapport au code équivalent

Step Functions est excessif pour les processus simples en deux étapes. Utilisez-le quand la coordination elle-même est précieuse et que les scénarios d'échec sont importants.

## Points Forts et Limites

**Pourquoi Step Functions est puissant** :

- Historique d'exécution visuel — voir exactement où un workflow en est (ou a échoué)
- Nouvelle tentative et gestion d'erreurs intégrées — pas de code de nouvelle tentative personnalisé
- État durable — les exécutions survivent aux redémarrages et pannes de service
- Intégrations directes avec plus de 200 services AWS (pas seulement Lambda)
- Le workflow visuel est auto-documenté

**Là où ça se complique** :

- Les workflows standard sont facturés par transition d'état — les workflows complexes avec de nombreux états peuvent devenir coûteux à grande échelle
- Le format JSON ASL (Amazon States Language) a une courbe d'apprentissage
- La taille maximale de charge utile est de 256 Ko — les données volumineuses doivent être passées via des références S3, pas directement dans le workflow
- Les workflows de longue durée avec de nombreuses étapes manuelles nécessitent une configuration soigneuse des délais d'expiration

## Résumé

- **Step Functions** orchestre des workflows à plusieurs étapes sous forme de machines à états.
- Chaque **état** peut exécuter une fonction Lambda, une tâche ECS, attendre, bifurquer ou exécuter des étapes parallèles.
- **Nouvelle tentative et capture** sont intégrées dans chaque état — pas de code de nouvelle tentative personnalisé nécessaire.
- **Workflows standard** : longue durée (jusqu'à 1 an), durables, au moins une fois. Pour les processus métier critiques.
- **Workflows express** : courte durée (jusqu'à 5 minutes), haut débit. Pour le traitement d'événements à volume élevé.
- L'**architecture événementielle** utilise des services comme SNS, SQS, Lambda et EventBridge pour découpler les systèmes autour des événements plutôt que des appels directs.
- Utilisez Step Functions quand la coordination des étapes est elle-même complexe et quand l'auditabilité est importante.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Signaux d'usage de Step Functions** : « orchestrer plusieurs fonctions Lambda », « workflow avec nouvelles tentatives et gestion d'erreurs », « étape d'approbation humaine dans un workflow automatisé », « piste d'audit de chaque étape du workflow » → Step Functions.
- **Standard vs Express** : Standard pour les workflows de longue durée, auditables, critiques pour le métier. Express pour le traitement d'événements à haut débit et courte durée.
- **SQS vs Step Functions** : SQS pour les files de tâches simples (producteur/consommateur). Step Functions pour les workflows à plusieurs étapes avec logique complexe, nouvelles tentatives et suivi d'état.
- **Signaux EventBridge** : « router les événements des services AWS vers des cibles », « intégration événementielle entre services », « planifier une fonction Lambda » → EventBridge (anciennement CloudWatch Events).
- **Modèle de callback** : Step Functions peut mettre en pause l'exécution et attendre un callback externe (un token de tâche). Le worker rappelle quand il a terminé. Utile pour les tâches ECS de longue durée où vous ne voulez pas la limite de 15 minutes de Lambda.
- **Intégrations SDK directes** : Step Functions peut appeler directement des services AWS (DynamoDB, S3, SQS, etc.) sans passer par Lambda. Réduit le coût et la latence pour les appels de service simples.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez pourquoi Step Functions est utile pour les workflows à plusieurs étapes. Que fournit-il qu'une simple fonction Lambda appelant d'autres fonctions Lambda ne fournit pas ?

*(Indice : Pensez à ce qui se passe quand l'étape 3 sur 5 échoue dans chaque approche. Comment savez-vous ce qui s'est passé ? Comment réessayez-vous uniquement l'étape 3 ?)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de services financiers traite les demandes de prêt en plusieurs étapes : vérification de crédit, vérification des revenus, validation des documents, examen par un souscripteur (manuel), et notification de décision. Chaque étape peut prendre de quelques secondes (vérification de crédit) à plusieurs jours (examen du souscripteur). L'entreprise a besoin d'une piste d'audit complète de chaque étape pour la conformité. Les étapes automatisées échouées doivent se réessayer automatiquement ; les étapes manuelles doivent se mettre en pause et attendre une décision humaine.

Quel service répond LE MIEUX à ces exigences ?

A) Des fonctions AWS Lambda enchaînées avec des files d'attente SQS entre chaque étape  
B) Des workflows standard AWS Step Functions avec un modèle d'attente de callback pour l'étape d'examen du souscripteur  
C) Des workflows express AWS Step Functions pour les étapes automatisées et SQS FIFO pour l'étape manuelle  
D) Amazon EventBridge avec des règles d'événements routant entre des fonctions Lambda pour chaque étape

**Indice 1** : Durée « jusqu'à plusieurs jours » — quel type de Step Functions supporte cela ?

**Indice 2** : « Attendre une décision humaine » — quel modèle Step Functions est conçu pour cela ?

**Indice 3** : « Piste d'audit complète pour la conformité » — quel service fournit un historique d'état par exécution ?

**Réponse** : B

**Explication** : Les workflows standard Step Functions peuvent s'exécuter jusqu'à 1 an, supportant l'étape d'examen du souscripteur qui dure plusieurs jours. Le modèle d'attente de callback met l'exécution en pause à l'étape du souscripteur avec un token de tâche ; quand le souscripteur prend une décision, il rappelle avec le token pour continuer le workflow. Les workflows standard enregistrent chaque transition d'état — piste d'audit complète pour la conformité.

**Pourquoi pas A ?** Lambda enchaîné via SQS ne fournit pas de suivi d'état intégré ni de piste d'audit. Les étapes échouées nécessitent une logique de nouvelle tentative personnalisée. Redémarrer à partir d'une étape échouée spécifique nécessite une implémentation personnalisée.

**Pourquoi pas C ?** Les workflows express ont une durée maximale de 5 minutes — incompatible avec une étape qui peut durer plusieurs jours.

**Pourquoi pas D ?** EventBridge route les événements entre services mais ne maintient pas l'état du workflow ni ne fournit de nouvelle tentative/audit intégré. Construire cela sur EventBridge seul nécessite une gestion d'état personnalisée.

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus construit un processus de résolution des litiges sur la qualité des aliments. Quand un client signale une mauvaise expérience :

1. Le rapport est automatiquement validé (vérifie si la commande existe, si elle est suffisamment récente)
2. Le restaurant est automatiquement notifié
3. Un agent de support Nimbus examine la plainte (étape manuelle — peut prendre 1 à 3 jours ouvrables)
4. Selon la décision de l'agent : émettre un remboursement (Lambda → processeur de paiement) OU envoyer un bon d'excuse (Lambda → service de bons) OU escalader à la direction (sous-workflow Step Functions)
5. Le client est notifié du résultat

Concevez ceci comme un workflow Step Functions. Quel type d'état gère chaque étape ? Comment géreriez-vous l'attente de 1 à 3 jours ? Comment modéliseriez-vous la bifurcation à l'étape 4 ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception d'états Step Functions.)*

## Scène Post-Générique

Le workflow d'intégration des restaurants était en ligne.

Au cours du mois suivant, 12 nouveaux partenaires restaurants ont été intégrés. Deux avaient des échecs lors de l'étape de traitement des paiements (étape 3). Dans les deux cas, Step Functions a capturé l'erreur exacte, sauvegardé l'état de l'exécution, et envoyé une alerte à l'équipe Nimbus.

Leo a corrigé la cause racine (une clé API mal configurée pour le fournisseur de paiement) et a réessayé les deux exécutions à partir de l'étape 3. Les exécutions se sont complétées en 23 secondes chacune, reprenant exactement là où elles avaient échoué.

Aucun restaurant n'a eu besoin d'être réimporté. Aucun rôle IAM n'a été créé en double. Aucun e-mail de bienvenue n'a été envoyé en double.

« Avant Step Functions, » dit Leo à Maya, « cela aurait nécessité que quelqu'un suive manuellement ce qui avait et n'avait pas été fait pour chaque restaurant, et exécute manuellement les étapes manquantes. »

« Et maintenant ? »

« Maintenant je clique sur réessayer dans la console. Le système sait ce qui est fait. »

Maya réfléchit à cela.

« Ce n'est pas seulement une amélioration technique, » dit-elle. « C'est la différence entre un processus qui s'adapte et un qui ne s'adapte pas. »

Dans le prochain chapitre : quoi faire avec des données que vous n'accédez pas en ce moment, mais que vous voulez définitivement conserver pour toujours.
