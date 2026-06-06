# Chapitre 32 : Défendre le plan

Carlos était de retour, quelques semaines après la session Well-Architected. Cette fois, le portable resta dans son sac ; il prit plutôt un marqueur pour tableau blanc, salua chaque personne dans la salle, trouva une place près du tableau et déboucha le marqueur.

« Parlez-moi de Nimbus, » dit-il. Comme s'il n'en avait jamais entendu parler.

**Récapitulatif : de la revue au bilan**

La Well-Architected Review du chapitre 31 avait fait remonter trois découvertes à risque élevé et la prise de conscience croissante de Maya qu'il y avait un écart entre les décisions que l'équipe avait prises et les décisions qu'elle avait *réfléchies*. Le cadre leur avait donné un vocabulaire pour cet écart. Ce qu'il ne pouvait pas leur donner, c'était la pratique de le combler en temps réel — avant qu'une fonctionnalité ne soit livrée, pas après. C'est pour cela que Carlos était là. Maya l'avait invité spécifiquement parce que Nimbus était sur le point de construire quelque chose d'important, et elle voulait un défi structuré avant que la première ligne de code de production ne soit écrite.

Une bonne revue d'architecture est comme une liste de vérification pré-vol pour un pilote. L'avion peut sembler parfaitement prêt à voler — moteurs en marche, réservoir plein, passagers à bord. Mais la liste de vérification existe parce que les pilotes expérimentés savent que les choses les plus susceptibles de causer des problèmes sont précisément celles qui semblent bien aller juste avant de ne plus l'être. La liste de vérification ne signifie pas que le pilote ne sait pas ce qu'il fait. Elle signifie qu'il a intégré le fait que même les experts ratent des choses quand ils sautent le processus structuré.

**Le premier mouvement de l'architecte**

Ce qui se passa ensuite surprit l'équipe.

Maya commença à décrire le système — instances EC2, Aurora, CloudFront, ElastiCache, DynamoDB pour le menu, VPC avec des sous-réseaux privés...

Carlos l'arrêta doucement.

« Commencez par les affaires, » dit-il. « Pas la technologie. »

Elle fit une pause. Puis : « Nimbus est une plateforme de commande pour restaurants. On a 287 partenaires restaurateurs. On traite environ 4 200 commandes par jour. La valeur moyenne d'une commande est de 34 $. On croît de 18 % trimestre après trimestre. »

« Bien. Quelle est la chose la plus importante que Nimbus doit faire ? »

« Traiter les commandes, » dit Leo.

« Spécifiquement, » insista Carlos.

« Une commande doit atteindre le restaurant dans les cinq secondes suivant sa passation, » dit Priya, « sinon la cuisine rate la fenêtre de timing. »

« Que se passe-t-il si ce n'est pas le cas ? »

« Le restaurant fait une erreur. Le client reçoit le mauvais plat, ou attend trop longtemps. Il se plaint. On perd un partenaire restaurateur. »

« Donc le SLA de cinq secondes, » dit Carlos, « n'est pas une cible technique. C'est une exigence de survie commerciale. »

Silence.

« Voilà, » dit-il, « pourquoi les conversations d'architecture doivent commencer par les exigences commerciales. La technologie est en aval de la contrainte. »

**La structure de la revue d'architecture**

Une vraie revue d'architecture — le genre qui se passe avant de construire quelque chose d'important, ou quand on évalue s'il faut passer à l'échelle — a une structure.

Carlos l'écrivit sur le tableau blanc :

**1. Comprendre les contraintes**

Qu'est-ce qui doit être vrai ? Qu'est-ce qui ne peut pas se passer ? (Pas « ce qu'on veut ». Quels sont les éléments non négociables ?)

**2. Comprendre les inconnues**

Qu'est-ce qu'on ne sait pas ? Où fait-on des hypothèses ? Que se passe-t-il si ces hypothèses s'avèrent fausses ?

**3. Évaluer les options**

Quelles sont les alternatives réalistes ? Quels sont les compromis de chacune ?

**4. Identifier les modes de défaillance**

Comment cela casse-t-il ? Quelle est la séquence d'événements quand chaque mode de défaillance se déclenche ?

**5. Valider la surveillance**

Comment saurez-vous quand quelque chose ne va pas ? Avant que les utilisateurs ne vous le disent ?

**6. Définir le runbook**

Que fait quelqu'un à 3 h du matin quand ça casse ?

Ce n'est pas une liste de vérification à suivre mécaniquement. C'est un cadre de réflexion. L'objectif est de s'assurer que les questions importantes sont posées *avant* d'être en production.

**Mener la revue : la nouvelle fonctionnalité de Nimbus**

Carlos avait été invité spécifiquement parce que Nimbus était sur le point de construire quelque chose de nouveau.

**La fonctionnalité** : « Nimbus Instant » — une garantie de livraison en 15 minutes. Si un restaurant partenaire ne respecte pas la fenêtre de 15 minutes plus d'une fois par semaine, Nimbus rembourserait automatiquement le client.

« Guidez-moi à travers les exigences techniques, » dit Carlos.

Priya commença. « On a besoin d'un suivi en temps réel de la passation de la commande à la livraison. On doit comparer le temps de livraison réel par rapport au SLA de 15 minutes. On doit déclencher les remboursements automatiquement. »

« Quelle est l'exigence de latence pour les données de suivi ? »

« Quasi temps réel. Les clients voient les mises à jour de statut sur leur téléphone. »

« En combien de temps ? »

« Cinq secondes probablement. »

« Probablement ? »

« Dans les cinq secondes. C'est l'exigence produit. »

« Bien. Kinesis pour le flux d'événements, alors. Quel est le mode de défaillance si Kinesis est en retard ? »

« Les mises à jour de statut sont en retard pour le client. »

« Est-ce acceptable ? »

« Pour 10 secondes ? Probablement. Pour 60 secondes ? Non. »

« Donc quel est le SLA du système de suivi ? »

Priya regarda Leo. « On n'en a pas encore. »

Carlos écrivit sur le tableau : *Inconnue : SLA du suivi.*

« Ça compte, » dit-il. « Parce que le SLA détermine la conception de l'infrastructure. Si votre SLA est de 5 secondes, vous avez besoin d'une solution différente que s'il est de 60 secondes. »

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya. « Pourquoi ne pas simplement utiliser un mécanisme de sondage que l'app vérifie toutes les quelques secondes au lieu d'une poussée en temps réel ? »

« La latence et le coût, » dit Carlos. « Une approche par sondage à l'échelle — disons, 10 000 commandes actives, chaque app sondant toutes les 5 secondes — c'est 2 000 requêtes par seconde, soit 120 000 requêtes par minute. Un modèle par poussée via Kinesis ne livre des mises à jour que quand l'état change. Moins de requêtes, latence plus basse, et l'engagement de SLA est plus facile à auditer depuis un journal d'événements. Le sondage fonctionne à petite échelle. À l'échelle vers laquelle Nimbus se dirige, la poussée est la bonne fondation. »

Leo était resté silencieux pendant l'explication de Carlos. Puis : « J'allais construire ça avec des WebSockets. »

Carlos le regarda. « Explique-moi. »

« Chaque commande obtient une connexion WebSocket. Le client se connecte quand la commande est passée. Le serveur pousse les changements d'état — confirmée, en préparation, en route, livrée — au fur et à mesure. Pas de sondage, faible latence, modèle simple. »

« Qu'est-ce qui maintient la connexion WebSocket ? »

« Un point de terminaison WebSocket d'API Gateway. Des fonctions Lambda gèrent les événements de connexion et de message. DynamoDB stocke les IDs de connexion. »

Carlos l'écrivit sur le tableau. « Et le mode de défaillance quand le réseau du client tombe pendant 15 secondes ? »

« La connexion est terminée. Le client se reconnecte et demande l'état actuel. »

« D'où ? »

« Du... handler Lambda, qui lit depuis DynamoDB. »

« Donc tu as à la fois un chemin de poussée et un chemin de tirage, » dit Carlos. « La poussée WebSocket est le chemin heureux. La lecture DynamoDB est le chemin de récupération. Comment t'assures-tu que la connexion est rétablie avant que le client ne remarque que l'état est périmé ? »

Leo réfléchit. « Le client détecte la déconnexion et se reconnecte en quelques secondes. La logique de reconnexion est simple. »

« À 10 000 commandes actives simultanément — ce qui est là où Nimbus se dirige — combien de connexions WebSocket simultanées ça fait ? »

« 10 000. »

« API Gateway WebSocket a un quota par défaut de 500 **nouvelles connexions par seconde** par compte, » dit Carlos. « Pas des connexions simultanées — un *taux* de connexion. 10 000 connexions stables, ça va. Le problème, c'est la tempête de reconnexions : quand un incident réseau fait tomber quelques milliers de clients d'un coup et qu'ils se reconnectent tous dans les deux mêmes secondes, tu atteins le quota de taux et les reconnexions commencent à échouer exactement quand les utilisateurs sont le plus attentifs. Tu peux demander une augmentation, mais c'est un quota que tu reviendrais examiner à mesure que tu grandis. Aussi : API Gateway WebSocket facture 0,25 $ par million de minutes-connexion, plus 1,00 $ par million de messages. À 10 000 commandes par jour avec une fenêtre de suivi moyenne de 40 minutes, ce n'est qu'environ 400 000 minutes-connexion par jour — des centimes. À 10 000 commandes actives simultanément, c'est une échelle différente. »

« Ce n'est pas grand-chose, » dit Leo.

« Pas à 10 000 commandes actives, » dit Carlos. « À cette échelle, disons environ 150 $ par mois avec les frais de minutes-connexion et de messages. Le coût n'est pas l'argument contre les WebSockets ici. Le quota de taux de connexion sous les tempêtes de reconnexions, et la gestion de l'état de connexion, le sont. »

« Donc les WebSockets se compliquent à l'échelle, » dit Maya.

« Ils deviennent gérables à l'échelle si tu conçois pour ça, » dit Carlos. « Ce n'est pas faux — c'est un ensemble de compromis différent. Maintenant laisse-moi te montrer l'alternative par sondage. »

Il dessina la deuxième option.

« Sondage : le client envoie une requête GET vers `/orders/{order_id}/status` toutes les 5 secondes. Le backend lit depuis DynamoDB. Renvoie l'état actuel. »

« Ça fait beaucoup de requêtes, » dit Priya.

« 10 000 commandes actives × 1 sondage toutes les 5 secondes = 2 000 requêtes par seconde. Ton API doit gérer 2 000 RPS. DynamoDB auto-scale. API Gateway gère la charge. Le coût : 2 000 RPS × 3 600 secondes × 24 heures × 30 jours = 5,18 milliards de requêtes par mois. Tarification API Gateway REST API : 3,50 $ par million de requêtes = 18 130 $/mois. »

La salle resta silencieuse.

« Ce n'est pas une option viable à l'échelle, » dit Tom.

« Correct, » dit Carlos. « Le sondage à intervalles de 5 secondes est l'implémentation la plus simple et la plus chère à l'échelle. Il génère aussi une charge proportionnelle aux connexions actives, pas proportionnelle aux changements d'état. Si une commande reste en "en préparation" pendant 20 minutes, le sondage génère 240 requêtes qui renvoient toutes le même état. C'est du gaspillage. »

« Et Kinesis ? » demanda Maya.

« Kinesis génère un événement par changement d'état. Une confirmation de commande : un événement. Acceptation par la cuisine : un événement. Récupération par le livreur : un événement. Livraison : un événement. Quatre événements par commande, quelle que soit la durée de chaque état. Le consommateur — ton backend — lit depuis le flux Kinesis et pousse la mise à jour vers le client via le mécanisme de livraison que tu choisis. »

« Mais le client a quand même besoin d'un moyen de recevoir la poussée, » dit Leo.

« Oui. Tu peux utiliser Server-Sent Events, un point de terminaison long-poll, ou des WebSockets pour la livraison du dernier kilomètre. Kinesis gère le flux d'événements fiable, ordonné et rejouable pour ton backend. Le mécanisme de livraison au client est une décision séparée. L'avantage clé : Kinesis découple la source d'événements du consommateur. Le système de suivi de livraison, le système de remboursement, le système de notification des restaurants et l'affichage du statut au client consomment tous depuis le même flux Kinesis indépendamment. »

« Donc ce n'est pas Kinesis au lieu de WebSockets, » dit Maya. « C'est Kinesis plus un mécanisme de livraison au client plus léger. »

« Exactement. L'analyse des compromis : »

Il l'écrivit :

| Option | Latence | Coût (500 / 10K commandes actives) | Complexité |
|---|---|---|---|
| WebSockets seuls | ~50 ms | 8 $ / 150 $ par mois | Moyenne |
| Sondage (5 s) | 0-5 s | 906 $ / 18 130 $ par mois | Faible |
| Kinesis + SSE | ~200 ms | 8 $ / 75 $ par mois | Moyenne-élevée |

« L'option de sondage est éliminée par le coût, » dit Carlos. « Les WebSockets sont viables mais nécessitent une gestion de connexions à l'échelle. Kinesis plus Server-Sent Events est légèrement plus élevé en latence et comparable en coût — ce qu'il t'achète, c'est le journal d'événements durable et rejouable dont tu as besoin pour le système de remboursement, et des consommateurs découplés. »

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya. « Si les WebSockets ont une latence plus basse, pourquoi accepter une latence plus élevée de Kinesis plus SSE ? »

« 200 ms contre 50 ms, est-ce perceptible pour un client qui regarde une mise à jour de statut de livraison ? » demanda Carlos.

« Non, » dit-elle.

« Alors la différence de latence est sous le seuil de perception. La différence de coût à dix mille commandes actives est modeste — 75 $ contre 150 $ par mois. La différence architecturale est le vrai argument : Kinesis te donne un journal d'événements durable et rejouable — dont tu auras besoin pour la piste d'audit des remboursements — et découple tes consommateurs de suivi. Les WebSockets t'obligeraient à reconstruire le découplage plus tard. »

Leo regarda le tableau. « On a failli livrer la version WebSocket. »

« Ça aurait fonctionné, » dit Carlos. « C'est l'important à comprendre. Les WebSockets auraient fonctionné. La question en architecture est rarement "est-ce que ça marche ?" La question est "combien ça coûte à mesure que ça grandit, et qu'est-ce qu'on devra reconstruire plus tard ?" »


**Les questions que posent les architectes**

Pendant les deux heures suivantes, Carlos guida l'équipe à travers la revue. Une sélection de ses questions :

**Sur le stockage des données** :

« Où l'état de la commande est-il stocké pendant l'exécution ? Si l'application plante en cours de livraison, quel est le processus de récupération ? Pouvez-vous reconstruire l'état à partir des seuls événements ? »

**Sur le mécanisme de remboursement** :

« Le remboursement est déclenché automatiquement. Qu'est-ce qui empêche l'émission d'un remboursement deux fois ? Que se passe-t-il si le processeur de paiement expire et que vous n'êtes pas sûr que le remboursement a été accepté ? »

**Sur le suivi de livraison** :

« Vous vous fiez aux données GPS du coursier. Que se passe-t-il si le signal GPS est perdu pendant 90 secondes ? Comment distinguez-vous "GPS perdu" de "livraison en cours" de "problème de livraison" ? »

**Sur la gestion des défaillances** :

« Si le service de remboursement est en panne, la commande passe-t-elle quand même ? Le client reçoit-il quand même son plat ? Quelle est l'expérience utilisateur lors d'une défaillance partielle du système ? »

**Sur l'observabilité** :

« Comment savez-vous en ce moment combien de commandes sont actuellement à moins de 5 minutes du SLA de 15 minutes ? Si ce chiffre augmente brutalement, qui est notifié ? »

Chaque question révélait une hypothèse que l'équipe faisait sans s'en rendre compte.

« Je l'ai déjà déployée — oh, » dit Leo. « Le point de terminaison de remboursement. J'allais juste appeler l'API de paiement directement. On n'avait pas pensé à l'appeler deux fois. » Il s'arrêta. « Donc si le premier appel réussit mais que notre confirmation se perd en transit, on rappelle et le client obtient deux remboursements. »

« Avez-vous réfléchi à ce qui se passe si l'API de paiement accepte le premier appel mais que notre confirmation se perd en transit ? » demanda Priya.

« C'est l'idempotence, » dit Carlos.

« Une clé d'idempotence — un ID unique par tentative de remboursement, stocké dans une base de données avant d'appeler l'API de paiement, » dit Priya. « Si on appelle deux fois avec la même clé, l'API de paiement ignore le deuxième appel. »

« Ce qui signifie, » ajouta Carlos, « que vous avez besoin d'un magasin d'état persistant pour les opérations de remboursement, pas seulement d'un événement dans une file d'attente. »


« La surveillance dont on a discuté, » dit Carlos, « est toute de la surveillance d'infrastructure. CPU. Nombre de connexions. Décalage Kinesis. C'est important — mais ce n'est pas la surveillance qui vous dit si Nimbus Instant fonctionne. »

« Quelle est la surveillance qui nous dit que ça fonctionne ? » demanda Maya.

« Le temps de confirmation p95 par restaurant. Combien de temps, au 95e centile, prend-il de la passation de commande à la confirmation du restaurant — mesuré séparément pour chaque restaurant partenaire ? »

« On n'a pas cette métrique, » dit Priya.

« C'est la lacune, » dit Carlos. « Vous pouvez avoir une infrastructure parfaite — CloudWatch au vert sur chaque alarme — et avoir quand même un restaurant partenaire dont la latence de confirmation se dégrade depuis trois semaines parce que le logiciel de sa tablette a un bug. L'infrastructure va bien. Le SLA commercial est violé. Et vous ne le saurez pas avant que le restaurant n'appelle pour se plaindre. »

« Comment capturer ça ? » demanda Leo.

« Émettez une métrique CloudWatch personnalisée ou poussez vers votre pipeline analytique chaque fois qu'une confirmation de commande est reçue. Horodatez la passation de commande. Horodatez la confirmation. Calculez la différence. Émettez-la étiquetée avec `restaurant_id`. Construisez un tableau de bord CloudWatch qui montre le temps de confirmation p95 par restaurant sur les 7 derniers jours. »

« Et alerter quand ça se dégrade ? » demanda Tom.

« Alerter quand le p95 d'un restaurant spécifique dépasse 90 secondes pendant plus de 5 minutes consécutives, » dit Carlos. « C'est une anomalie qui justifie un contact proactif, pas une réponse "attendre la plainte". »

« C'est la différence entre surveiller l'infrastructure et surveiller le produit, » dit Priya.

« Exactement, » dit Carlos. « La surveillance d'infrastructure vous dit si vos systèmes sont sains. La surveillance au niveau commercial vous dit si vos clients vivent ce que vous leur avez promis. Vous avez besoin des deux. La plupart des équipes n'ont que la première. »

Maya l'ajouta à l'annexe de l'ADR : suivre le temps de confirmation p95 par restaurant en plus des métriques de santé de l'infrastructure. Les seuils d'alarme à définir par l'équipe produit en concertation avec l'équipe de réussite des restaurants.

« C'est aussi là que la surveillance des coûts et la surveillance commerciale se croisent, » dit Tom. « Si notre latence de confirmation s'envole pour un sous-ensemble de restaurants les vendredis soirs, la cause racine pourrait être un démarrage à froid de Lambda touchant les shards de ces restaurants dans Kinesis. La métrique commerciale révèle le symptôme. Les métriques d'infrastructure révèlent la cause. »

« Et la solution pourrait ne pas être plus d'infrastructure, » dit Carlos. « Ça pourrait être de la concurrence provisionnée sur la fonction Lambda spécifique. Ou un rééquilibrage de shards. Ou un bug dans le point de terminaison de confirmation du restaurant. Vous ne pouvez pas savoir lequel tant que vous n'avez pas les deux couches d'observabilité. »

« Avez-vous réfléchi à ce qui se passe si on corrige l'infrastructure et que la métrique commerciale ne s'améliore toujours pas ? » demanda Priya.

« Alors la cause racine n'est pas dans l'infrastructure, » dit Carlos. « Ce qui est une information précieuse. Sans la métrique commerciale, vous poursuivriez des améliorations d'infrastructure pour un problème qui vit ailleurs. »


« Combien ça coûte par mois quand on a 500 livraisons simultanées suivies ? » demanda Tom. « Le magasin d'état, le flux Kinesis, les fonctions Lambda traitant les événements ? »

Carlos hocha la tête. « C'est la bonne question à poser maintenant, pendant que vous concevez, pas après avoir construit. »

C'est le genre de détail architectural qui émerge dans une revue structurée — et qui n'émerge souvent pas quand on construit juste.

**L'enregistrement de décision architecturale**

Après la revue, Carlos recommanda à l'équipe de documenter ses décisions dans des **enregistrements de décision architecturale (ADR)** — de courts documents qui capturent :

- **Quelle décision a été prise**
- **Quelles alternatives ont été considérées**
- **Pourquoi cette décision a été prise (le contexte et les contraintes à ce moment)**
- **Quels sont les compromis**
- **Qu'est-ce qui nous amènerait à reconsidérer cette décision**

Vous vous demandez peut-être : les ADR doivent-ils être des documents formels ? Non. Un ADR peut être un paragraphe dans un fil Slack si c'est là que votre équipe travaille. Le format est sans importance. L'acte d'écrire ce que vous avez décidé et pourquoi — avant de passer à autre chose — est ce qui crée la mémoire institutionnelle.

« Les ADR sont pour votre futur vous, » dit Carlos. « Dans 18 mois, vous regarderez une partie de l'architecture et vous vous demanderez pourquoi elle a été faite ainsi. Si vous avez un ADR, vous comprendrez le contexte. Si vous n'en avez pas, vous laisserez soit les choses en l'état (parce que vous avez peur d'y toucher) ou vous les changerez (parce que vous ne compreniez pas pourquoi c'était fait ainsi). »

Leo rédigea le premier ADR cet après-midi-là : la décision d'utiliser Kinesis pour les événements de suivi de livraison, avec le contexte, les alternatives considérées (SQS, EventBridge, sondage) et les compromis.

Carlos regarda l'ADR que Leo avait rédigé. Il le lut en trente secondes. Puis il dit : « Montre à l'équipe à quoi ressemble l'ADR-007. »

Leo le projeta.

---

**ADR-007 : Infrastructure d'événements de suivi de livraison**

**Date** : 2025-03-14
**Statut** : Accepté
**Auteur** : Leo (avec revue de Carlos, Priya)

---

**Problème**

Nimbus Instant nécessite un suivi de statut de livraison en temps réel. Les commandes doivent mettre à jour leur statut (confirmée → en préparation → en route → livrée) et faire remonter ces mises à jour vers l'app mobile du client dans les 5 secondes du changement d'état. Le système de remboursement a aussi besoin d'un journal auditable et rejouable des événements de livraison pour déterminer la conformité au SLA.

---

**Options considérées**

**Option 1 : API Gateway WebSocket + état DynamoDB**
- Le client maintient une connexion WebSocket par commande
- Le backend pousse les changements d'état sur la connexion ouverte
- À la reconnexion, le client tire l'état actuel depuis DynamoDB
- Coût estimé à l'échelle (10K commandes actives simultanément) : ~150 $/mois
- Faiblesse : Gestion de la limite de connexions à l'échelle ; pas de rejeu intégré pour l'audit

**Option 2 : Sondage client (intervalle de 5 secondes)**
- Le client sonde `/orders/{order_id}/status` toutes les 5 secondes
- Le backend lit depuis DynamoDB à chaque sondage
- Implémentation la plus simple
- Coût estimé à l'échelle (10K commandes actives simultanément) : 18 130 $/mois
- Éliminée à cause du coût

**Option 3 : Kinesis Data Streams + Server-Sent Events**
- Les changements d'état de livraison publiés vers un flux Kinesis, dimensionné par débit : un shard ingère 1 Mo/s ou 1 000 enregistrements/s. À 10K commandes actives (~4 événements de changement d'état par commande, petites charges utiles JSON), le taux d'écriture de pointe est d'environ 40-50 événements/s — la valeur d'un seul shard. Provisionner 3 shards pour la répartition des partitions et la marge des consommateurs.
- Le point de terminaison SSE s'abonne au shard Kinesis assigné à la partition de la commande
- Le client reçoit les événements SSE ; se reconnecte en utilisant l'API EventSource standard
- Coût estimé à l'échelle (10K commandes actives simultanément) : ~75 $/mois
- Fournit un journal d'événements durable et rejouable ; découple tous les consommateurs

---

**Décision**

Option 3 : Kinesis Data Streams + SSE.

Justification : l'avantage de coût est significatif à l'échelle ; le journal d'événements Kinesis satisfait l'exigence d'audit des remboursements sans implémentation de piste d'audit séparée ; la gestion de reconnexion SSE est plus simple que la gestion de connexion WebSocket à l'échelle.

---

**Conséquences**

- *Positif* : Le système de remboursement, le système de notification des restaurants et l'app client consomment tous depuis le même flux Kinesis indépendamment. De nouveaux consommateurs peuvent être ajoutés sans modifier le producteur.
- *Positif* : Les événements sont rejouables jusqu'à 7 jours (notre rétention étendue configurée ; Kinesis prend en charge jusqu'à 365 jours moyennant un coût supplémentaire). Si la Lambda de traitement des remboursements échoue, elle peut rejouer les événements manqués.
- *Négatif* : La latence SSE (~200 ms) est plus élevée que la latence WebSocket (~50 ms). Acceptable parce que cette différence est sous le seuil de perception du client pour les mises à jour de statut.
- *Négatif* : La tarification provisionnée de Kinesis évolue avec les heures-shard, et la rétention étendue double à peu près le coût par shard. La marge de débit est importante (un shard ingère 1 000 enregistrements/s), mais à mesure que le nombre de consommateurs et la charge de lecture par consommateur dépassent environ 50K commandes actives quotidiennes, le nombre de shards — et une stratégie de re-shard/fan-out de consommateurs — devra être réexaminé.

**Qu'est-ce qui nous amènerait à reconsidérer cette décision** : Si le volume de commandes croît jusqu'au point où les coûts de shards Kinesis dépassent les coûts WebSocket à la nouvelle échelle, ou si la latence SSE de 200 ms devient un problème de différenciation produit.

---

« La dernière ligne, » dit Maya. « C'est celle à laquelle je n'avais pas pensé. »

« Le déclencheur de réexamen, » dit Carlos. « Chaque décision a des conditions sous lesquelles elle devient mauvaise. Les écrire signifie que vous les reconnaîtrez quand elles apparaîtront. »

« Au lieu de les découvrir dans un post-mortem, » dit Priya.

« Au lieu de ça, oui. »

Tom lisait la conséquence de coût. « La stratégie de re-shard et de fan-out — on ne l'a pas encore. »

« Vous n'en avez pas besoin avant 50K commandes actives quotidiennes, » dit Carlos. « À vos 287 restaurants et 4 200 commandes quotidiennes actuels, vous avez une marge significative. L'ADR vous dit quoi construire avant que ça devienne urgent, pas avant que ça devienne pertinent. »

Leo prenait des notes. « L'ADR fait deux choses, » dit-il. « Il documente ce qu'on a décidé. Et il documente ce qu'on aurait besoin de décider ensuite si la situation change. »

« C'est ce qui rend un ADR utile pendant dix-huit mois, » dit Carlos. « Pas la décision elle-même — les décisions deviennent périmées. Le raisonnement. Le raisonnement vous dit si la décision devrait être réexaminée, même quand la décision est toujours en place. »


**Ce qui fait un architecte**

À la fin de la session, Maya posa à Carlos la question originale : « Quelle est la différence entre prendre des décisions architecturales et penser comme un architecte ? »

Il y réfléchit.

« Un architecte ne connaît pas plus la technologie qu'un ingénieur senior, » dit-il. « Un bon architecte en connaît probablement un peu moins sur les tout derniers frameworks. Mais un architecte a un ensemble de questions par défaut différent. »

« Qu'est-ce que vous voulez dire ? »

« Quand vous êtes un ingénieur senior regardant une nouvelle fonctionnalité, vos premières questions sont généralement : "Que construit-on ? Comment ça marche ? Quelle est la meilleure bibliothèque pour ça ?" Quand un architecte regarde la même fonctionnalité, les premières questions sont : "Quel problème cela résout-il ? Qu'est-ce qui casse en premier quand le trafic double ? Comment savons-nous quand c'est dégradé ? Quelle est l'expérience utilisateur quand le processeur de paiement est lent ?" »

« L'architecte pose des questions sur le système sous pression, » dit Leo.

« Et sur la conséquence commerciale de chaque défaillance, » ajouta Priya.

« Et, » dit Tom, « sur ce qui arrive à la facture quand ça passe à l'échelle. »

Carlos hocha la tête. « Vous faites déjà tous ça. Vous le faites depuis le chapitre 1. La différence entre un ingénieur senior et un architecte n'est pas une certification ou un titre. C'est l'habitude de poser la prochaine question — celle qui révèle la chose à laquelle vous n'avez pas encore pensé. »

**Variation : quand une revue d'architecture ajoute du risque au lieu de l'enlever**

Si votre revue est traitée comme une barrière d'approbation plutôt que comme un processus d'apprentissage, les équipes commenceront à cacher des choix de conception pour éviter le retard — et les modes de défaillance existeront toujours, juste non documentés. Une revue d'architecture qui ralentit la livraison sans améliorer la qualité est pire que pas de revue du tout.

Si le problème d'idempotence du service de remboursement avait été traité comme un retard inattendu au lancement de la fonctionnalité plutôt que comme une découverte nécessaire, Leo aurait livré le point de terminaison d'origine, le double remboursement finirait par se produire, et l'équipe l'aurait appris d'un client en colère. La revue fait remonter le problème à un point où le corriger coûte une journée, pas un rollback.

La valeur de la revue est proportionnelle à la volonté de l'équipe de la laisser changer la conception.

## Points forts et limites

**Revues d'architecture** :

- Détectent les modes de défaillance avant qu'ils ne soient en production
- Créent une compréhension partagée entre les membres de l'équipe qui ont souvent des connaissances cloisonnées
- Génèrent une documentation (ADR) qui rapporte des dividendes pendant des années
- Ralentissent la prise de décision de façon bénéfique — « avancer vite » sans revue, c'est « avancer vite et heurter le mur que vous n'avez pas vu »

**Là où ça se complique** :

- Nécessite quelqu'un de suffisamment compétent pour poser les bonnes questions — la revue n'est bonne que si le réviseur l'est
- Peut devenir bureaucratique si traitée comme une case à cocher plutôt qu'une conversation
- Certaines décisions architecturales n'ont vraiment pas besoin d'une revue complète — savoir lesquelles en ont besoin est en soi une compétence architecturale
- Le résultat (ADR, diagrammes, journaux de décision) doit être maintenu à mesure que le système évolue

## Résumé

La revue avec Carlos avait pris deux heures et produit trois ADR, une liste de six inconnues à résoudre avant que la fonctionnalité ne soit construite, et un changement architectural (le magasin d'état d'idempotence) qui aurait été pénible à intégrer après le lancement. La métaphore de la liste de vérification pré-vol avait tenu tout du long : rien de catastrophique n'avait été découvert, mais plusieurs choses qui auraient causé des problèmes plus tard avaient été attrapées et documentées pendant qu'elles étaient encore faciles à corriger.

- Les revues d'architecture commencent par **les exigences commerciales, pas la technologie**.
- La structure de la revue : contraintes → inconnues → options → modes de défaillance → surveillance → runbooks.
- Les architectes demandent : Qu'est-ce qui casse en premier ? Comment savons-nous que c'est dégradé ? Quelle est l'expérience utilisateur pendant la défaillance ? Quel est le coût à l'échelle ?
- Les **enregistrements de décision architecturale (ADR)** capturent ce qui a été décidé, pourquoi, et ce qui causerait une reconsidération.
- Penser comme un architecte est une habitude : poser la prochaine question, surtout sur les modes de défaillance, les conséquences commerciales et l'économie à l'échelle.

## Conseils pour l'examen

*Domaine SAA-C03 : Inter-domaines — raisonnement architectural*

Ce chapitre concerne moins des sujets d'examen spécifiques et plus l'état d'esprit que l'examen teste.

- **Les scénarios SAA-C03** décrivent presque toujours une contrainte commerciale en premier (« l'entreprise ne peut pas se permettre plus d'1 heure d'indisponibilité ») et vous demandent de sélectionner l'architecture qui la satisfait. Pratiquez la traduction des contraintes commerciales en exigences techniques.
- **Réflexion sur les modes de défaillance** : De nombreuses questions d'examen décrivent un système et demandent ce qui se passe quand un composant tombe en panne. Pratiquez à demander « qu'est-ce qui casse en premier ? » pour les architectures que vous rencontrez.
- **Réflexion sur les compromis** : L'examen a rarement une réponse « parfaite ». Il demande la *meilleure* réponse étant donné un ensemble de contraintes. Soyez à l'aise avec « cette option est correcte compte tenu de ces exigences spécifiques, même si une autre option serait meilleure dans des conditions différentes. »
- **Enregistrements de décision architecturale** : Pas un service AWS, mais une bonne pratique qui reflète le pilier Excellence opérationnelle du Well-Architected Framework.
- **Kinesis pour le streaming d'événements en temps réel** : La fonctionnalité Nimbus Instant du chapitre utilise Kinesis pour le streaming d'événements de livraison. Signal d'examen : « ingestion d'événements en temps réel avec traitement ordonné » → Kinesis Data Streams. « Découpler les composants, livraison au moins une fois » → SQS. Savoir quand recourir à chacun est un modèle d'examen récurrent.
- **L'idempotence comme modèle testable** : Le SAA-C03 teste fréquemment l'idempotence dans les systèmes distribués. Le modèle de base : générer une clé d'idempotence unique avant d'appeler un système externe ; persister la clé et le résultat ; à la nouvelle tentative, vérifier la clé existante avant de réexécuter. Si elle est trouvée, renvoyer le résultat précédemment stocké sans réexécuter. Cela empêche les double-facturations, les double-envois et les mutations d'état dupliquées quand des nouvelles tentatives surviennent après un timeout réseau. Signal d'examen : « empêcher les opérations dupliquées quand un appel de service est réessayé » ou « assurer un traitement exactement-une-fois des événements de paiement » → clé d'idempotence stockée dans DynamoDB avec écriture conditionnelle.
- **Server-Sent Events vs WebSockets** : SSE est unidirectionnel (serveur vers client), utilise HTTP standard et se reconnecte automatiquement via l'API EventSource. Les WebSockets sont bidirectionnels, nécessitent une gestion de connexion et sont appropriés quand le client a aussi besoin de pousser des données vers le serveur. Pour les mises à jour de statut de livraison (serveur vers client uniquement), SSE est plus simple et moins cher que les WebSockets à l'échelle.

## Exercices

**Exercice 1 — Mémorisation**

Carlos a posé six types de questions lors de la revue d'architecture. Pouvez-vous reconstruire les six domaines sans regarder le chapitre ?

*(Indice : Ils sont listés dans la section « Structure de la revue d'architecture ». Essayez de les rappeler de mémoire — l'acte de tenter le rappel (même si vous échouez) renforce la rétention à long terme.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise construit un système de gestion des enchères en temps réel pour la publicité en ligne. Les enchères doivent être évaluées et y être répondu en 100 millisecondes. Le système traite 1 million d'enchères par seconde au pic. Si le système d'enchères est en panne, l'entreprise perd des revenus publicitaires. L'équipe base de données de l'entreprise propose d'utiliser RDS Aurora avec 10 réplicas de lecture. L'architecte solution doit évaluer si la proposition est fondamentalement viable avant d'examiner ses caractéristiques secondaires.

Quelle préoccupation l'architecte doit-il soulever EN PREMIER ?

A) Le coût de 10 réplicas de lecture Aurora est trop élevé pour le budget  
B) Les réplicas de lecture Aurora ont un décalage de réplication qui peut causer des problèmes de cohérence  
C) La latence de requête typique d'Aurora de 1 à 5 ms peut ne pas satisfaire le SLA de réponse de 100 ms  
D) RDS Aurora ne prend pas en charge les volumes de transactions de 1 million de requêtes par seconde à cette exigence de latence

**Indice 1** : La contrainte principale est un temps de réponse total de 100 ms à 1 million de requêtes/seconde. Laquelle de ces préoccupations, si valable, rend la proposition irréalisable quelle que soit la manière dont les trois autres sont traitées ?

**Indice 2** : La latence de requête Aurora est typiquement de 1 à 5 ms. 1 à 5 ms pour la requête de base de données laisse 95 à 99 ms pour le réseau, la logique applicative et la sérialisation. La contrainte de 100 ms est-elle menacée ?

**Indice 3** : Aurora peut gérer des IOPS élevés, mais 1 million de requêtes par seconde est un taux extraordinaire. Que se passe-t-il avec l'architecture à cette échelle ?

**Réponse** : D

**Explication** : Bien qu'Aurora soit haute performance, 1 million de requêtes par seconde avec un temps de réponse total de 100 ms est une exigence extrême — c'est le bloqueur architectural qui détermine si la proposition peut exister du tout. L'architecte doit d'abord questionner si Aurora (ou toute base de données relationnelle) peut servir de système de recherche principal à cette échelle et cette latence. Des systèmes comme celui-ci utilisent typiquement des magasins de données en mémoire (Redis) ou des bases de données à faible latence spécialisées, pas des bases de données relationnelles avec une sémantique SQL complète. Le SLA de 100 ms est réalisable pour les seules requêtes Aurora, mais la combinaison de 1M RPS et d'un SLA total de 100 ms dépasse les caractéristiques de débit typiques d'Aurora. « EN PREMIER » signifie la faisabilité avant le raffinement : si le moteur ne peut pas soutenir la charge, toute autre préoccupation au sujet de la proposition est sans objet.

**Pourquoi pas A ?** Le coût est une préoccupation valable, mais la première préoccupation devrait être de savoir si l'architecture est techniquement réalisable aux exigences indiquées.

**Pourquoi pas B ?** Le décalage de réplication est une caractéristique réelle mais *secondaire* de la proposition — une propriété que vous ajustez une fois l'architecture viable. Le décalage de réplica Aurora est typiquement inférieur à 100 ms et acceptable pour la plupart des cas d'utilisation ; le soulever en premier signifierait débattre du comportement de cohérence d'un système qui ne peut de toute façon pas soutenir le débit requis. La question de faisabilité (D) l'englobe.

**Pourquoi pas C ?** La latence Aurora de 1 à 5 ms est bien dans le SLA de 100 ms pour la portion de requête de base de données. Ce n'est pas la préoccupation principale.

*Domaine SAA-C03 : Inter-domaines — conception de systèmes*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Appliquez la structure de revue d'architecture à un système réel ou hypothétique :

Une startup veut construire un jeu de quiz multijoueur en temps réel. Les joueurs rejoignent des salles de jeu (jusqu'à 10 joueurs chacune). Chaque tour affiche une question pendant 15 secondes ; tous les joueurs répondent simultanément. Les scores sont calculés instantanément après chaque question. Les jeux durent 10 tours. Utilisation au pic : 50 000 jeux simultanés.

Passez en revue les six étapes :

1. Quelles sont les contraintes non négociables ?
2. Quelles sont les inconnues et les hypothèses ?
3. Quelles sont les options technologiques réalistes ?
4. Quels sont les modes de défaillance ?
5. Comment saurez-vous quand c'est dégradé ?
6. À quoi ressemble le runbook à 3 h du matin ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la structure de revue comme outil de réflexion.)*

## Scène post-générique

Carlos quitta le bureau à 18 h.

L'équipe resta un moment après, sans rien faire de particulier.

« J'ai l'impression d'avoir appris plus en ces deux heures que dans n'importe quel chapitre sur un service AWS individuel, » dit Leo.

« C'est parce que ces chapitres parlaient d'outils, » dit Maya. « Celui-ci parlait de jugement. »

« Le jugement, ça s'enseigne ? » demanda-t-il.

« Oui, » dit Priya. « Mais pas par la lecture. Par la pratique. Par la prise de décisions, voir ce qui casse, réfléchir à pourquoi. »

« Par l'expérience, » dit Tom.

« Par l'expérience structurée, » corrigea Priya. « L'expérience sans réflexion ne construit pas le jugement. Il faut poser les questions après. »

Maya regarda le tableau blanc. Les notes de la revue étaient encore là — contraintes, inconnues, modes de défaillance, questions de surveillance. Elles remplissaient deux tableaux blancs.

« Ça devrait aller dans l'ADR, » dit-elle.

Leo tapait déjà.

Dans le dernier chapitre : la seule chose qu'aucun outil ou cadre ne peut vous donner — et pourquoi « ça dépend » est la réponse la plus honnête et la plus puissante de l'architecture logicielle.
