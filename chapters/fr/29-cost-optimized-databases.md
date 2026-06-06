# Chapitre 29 : La facture de base de données

Tom imprima les métriques CloudWatch. Quatorze pages. Il les étala sur son bureau avant de se faire confiance pour lire les chiffres. Mieux valait tout voir d'un coup que de tomber sur des surprises en plein milieu d'une page.

**Récapitulatif : stockage fait, bases de données ensuite**

L'audit de stockage avait révélé 6 700 $ de gaspillage accumulé — non pas à cause de mauvaises décisions, mais par manque d'attention. Des volumes non attachés, de vieux instantanés, des historiques de versions que personne n'avait dit à S3 de nettoyer, des téléversements en plusieurs parties incomplets qui s'accumulaient silencieusement depuis des mois. Tom avait tout corrigé, mis en place des règles de nettoyage automatique, et était passé à l'onglet suivant du tableur. Le niveau données était la plus grande inconnue restante : bases de données relationnelles, tables NoSQL, nœuds de cache, stockage de sauvegardes, et un poste qui le tracassait depuis des semaines.

Les postes du niveau données examinés :

Cluster Aurora : 647 $/mois.
Réplicas de lecture RDS PostgreSQL hérités : 340 $/mois.
Tables DynamoDB : 340 $/mois.
ElastiCache : 185 $/mois.
Instantanés manuels Aurora : 87 $/mois.

Total du niveau données examiné : 1 599 $/mois.

« Laissez-moi comprendre chacun avant de décider quoi que ce soit, » dit-il. « Parce que la base de données n'est pas l'endroit où économiser de l'argent en prenant des raccourcis. »

C'était sage. Une mauvaise configuration de la base de données entraînant une perte de données ou une dégradation des performances coûte bien plus que les économies réalisées.

Pensez à une base de données comme au moteur d'une voiture. Vous pouvez économiser de l'argent sur une voiture en passant à un carburant moins cher, en ajustant la pression des pneus et en retirant du poids inutile du coffre. Mais si vous essayez d'économiser de l'argent en sautant une vidange d'huile, vous risquez de bloquer le moteur — et un moteur bloqué coûte bien plus que n'importe quelle économie de carburant. L'audit que Tom est sur le point de faire suit la même logique : trouvez le gaspillage dans le coffre et le réservoir de carburant, et laissez le moteur tranquille jusqu'à ce que vous sachiez exactement ce que vous faites.

**Comprendre d'abord votre charge de travail de base de données**

L'optimisation des coûts dans les bases de données nécessite de comprendre la charge de travail avant de toucher quoi que ce soit. Tom l'avait appris d'un quasi-incident six mois plus tôt : il avait commencé à réduire la taille de l'instance de base de données sur la base de l'utilisation CPU moyenne — 18 % — sans d'abord regarder les chiffres p95. Un collègue lui avait demandé de vérifier les métriques CloudWatch plus attentivement. Le CPU p95 était de 61 %, et lors d'un coup de feu particulièrement chargé un vendredi soir, il avait atteint 84 %.

« La moyenne ne te dit pas ce qui se passe au pic, » dit Tom, quand il en parla à Priya. « Si j'avais dimensionné sur la moyenne, on aurait été limités les vendredis soirs. »

« C'est pour ça que tu regardes le p95, pas la moyenne, » dit Priya. « Toujours. »

Ce principe s'étendait au-delà du CPU. Tom avait désormais une liste de vérification standard avant audit :

- CPU : p95, pas la moyenne
- Mémoire : FreeableMemory (en octets absolus, pas en pourcentage) — à quelle distance sommes-nous de la limite ?
- Connexions : maximum de DatabaseConnections sur les 30 derniers jours — à quelle distance sommes-nous arrivés de la limite de connexions ?
- Ratio lecture/écriture : Détermine si les réplicas de lecture justifient leur coût
- Taux de croissance du stockage : Combien de Go par mois ajoutons-nous ?
- Décalage de réplication (pour les réplicas) : Le réplica suit-il le rythme ?

Questions clés :

- Quelle est l'utilisation moyenne et maximale du CPU ?
- Quel est le ratio lecture/écriture ?
- Le stockage croît-il, est-il stable ou diminue-t-il ?
- Les réplicas de lecture sont-ils utilisés ?
- L'instance est-elle sous-provisionnée (causant des ralentissements) ou sur-provisionnée (payant pour de la capacité inactive) ?

Tom extrayait les métriques CloudWatch pour les trois services de base de données au cours des 30 derniers jours :

**Cluster Aurora** :

- CPU moyen : 18 % (p95 : 61 % ; pic : 84 % les vendredis soirs)
- FreeableMemory : constamment au-dessus de 4 Go sur 8 Go disponibles. Pas une préoccupation.
- Ratio lecture/écriture : 14:1 (fortement en lecture)
- Stockage : 180 Go (en croissance de ~5 Go/mois)
- Maximum de DatabaseConnections : 312 sur 1 000 disponibles. Confortable.

**Réplicas de lecture (RDS PostgreSQL, séparés d'Aurora)** :

- Ce sont deux réplicas de lecture RDS hérités créés avant la migration Aurora, toujours en marche.
- Connexions moyennes à chacun : 2 par jour. CPU moyen : 3 %.
- FreeableMemory : 7,2 Go sur 8 Go disponibles. Les instances étaient quasiment inactives.

« Pourquoi tournent-ils encore ? » demanda Tom.

« Je les ai déjà déployés — oh, » dit Leo. Il regarda les dates de création des instances. « Ils étaient pour le repli pendant la migration Aurora. Je ne les ai jamais supprimés. »

Ce moment — quand une chose coûteuse tourne depuis des mois sans être utilisée — est familier dans les environnements cloud. Leo avait créé les réplicas comme un filet de sécurité. Le filet de sécurité n'avait jamais été nécessaire. Mais personne n'avait posé la question jusqu'à présent.

« Quelle est la situation du pool de connexions ? » demanda Priya, en se penchant. « Avant de les supprimer, est-ce que des composants applicatifs y routent encore des lectures ? »

Tom vérifia les journaux de connexion. Les deux connexions par jour provenaient d'un script de surveillance que Priya avait écrit il y a quatorze mois — il interrogeait tous les points de terminaison de base de données connus pour vérifier qu'ils répondaient. Les réplicas n'étaient interrogés que par le vérificateur d'état, pas par du trafic applicatif réel.

« Supprime-les, » dit Maya.

Les réplicas furent résiliés. Économie mensuelle : 340 $.

**Quasi-incident du pool de connexions**

Pendant qu'il avait les métriques de connexion ouvertes, Tom lança une vérification plus large sur tous les points de terminaison de base de données. Ce qu'il trouva le fit s'arrêter.

Le point de terminaison d'écriture Aurora montrait un maximum de DatabaseConnections de 312. Confortable. Mais le point de terminaison de lecture racontait une autre histoire.

« Le point de terminaison de lecture a atteint 847 connexions trois vendredis soirs consécutifs, » dit Tom.

« Quelle est la limite ? » demanda Priya.

« La limite pour notre classe d'instance actuelle est de 1 000. On est arrivés à 847. C'est 85 % de la limite. »

« Et on ne l'a pas remarqué parce qu'on n'était pas alerté avant 90 % ? » demanda Maya.

« On n'était pas alerté du tout, » dit Tom. « Il n'y a pas d'alarme CloudWatch sur les connexions du point de terminaison de lecture. Je n'ai trouvé ça que parce que je regardais les métriques brutes. »

À 1 000 connexions, la base de données refuse les nouvelles connexions. Tout thread applicatif essayant d'acquérir une connexion à ce moment lève une exception. Si cette exception n'est pas gérée proprement, l'utilisateur voit une erreur 500.

« On était à trente secondes d'un incident un vendredi soir, » dit Leo. « Trois fois de suite. »

« Avez-vous réfléchi à ce qui se passe quand ce seuil est franchi ? » demanda Priya.

« Les partenaires restaurateurs voient des commandes échouées pendant le coup de feu du dîner, » dit Maya. « Ce n'est pas une préoccupation théorique. »

Tom mit en place une alarme CloudWatch immédiatement : alerte à 750 connexions (75 % de la limite), notification d'astreinte à 900 (90 %). Il implémenta aussi RDS Proxy pour le point de terminaison de lecture — RDS Proxy met en pool et gère les connexions à la base de données depuis la couche applicative, ce qui signifie que cinquante threads applicatifs peuvent partager dix connexions à la base de données. Le proxy gère le multiplexage. La base de données voit beaucoup moins de connexions même quand l'application est sous forte charge.

« Pour Aurora Serverless v2, RDS Proxy est tarifé à 0,015 $ par ACU par heure, avec un minimum facturé de 8 ACU par proxy, » dit Tom. « Mais si un dépassement de la limite de connexions cause ne serait-ce qu'une panne partielle un vendredi soir, le coût en réputation pour Nimbus est de plusieurs ordres de grandeur supérieur. »

« Combien ça coûte par mois ? » se demanda Tom, en calculant le chiffre. Leur reader tourne sur Serverless v2, donc le proxy est facturé sur le minimum de 8 ACU : 0,015 $ × 8 × 730 = 87,60 $/mois. C'était un coût qu'il était heureux de payer.

Vous vous demandez peut-être : si on économise déjà de l'argent avec l'auto-scaling de Serverless v2, pourquoi se soucier des instances réservées pour le niveau provisionné ? La réponse est que la mise à l'échelle de Serverless v2 a un coût — vous payez par ACU-heure que vous l'ayez planifié ou non. Pour les équipes exécutant des configurations Aurora fixes, l'engagement RI convertit le coût variable en coût prévisible. Pour les équipes exécutant des instances provisionnées (pas Serverless v2), cette distinction compte énormément.

**RDS Reserved Instances : pour les niveaux de base de données provisionnés**

Comme EC2, RDS offre des instances réservées pour l'utilisation engagée.

Pour les équipes utilisant des configurations d'instances Aurora fixes (pas Serverless v2), les instances réservées peuvent économiser 30 à 60 %. Voici comment fonctionne l'approche RI provisionnée : vous vous engagez sur un type d'instance spécifique pendant 1 ou 3 ans en échange d'une réduction significative sur le tarif horaire.

À titre d'illustration : une instance writer db.r6g.large à 0,26 $/heure À la demande revient à 190 $/mois. Une instance réservée 1 an pour la même réduit cela à environ 108 $/mois — économisant 82 $/mois par instance, soit près de 1 000 $ par an par instance de base de données.

**Aurora Serverless v2 vs RI Standard — le seuil de rentabilité**

Tom fit le calcul pour leur configuration Aurora spécifique. La question : l'auto-scaling d'Aurora Serverless v2 apportait-il assez de bénéfice, ou une instance provisionnée fixe avec un engagement d'instance réservée serait-elle moins chère ?

Tarification Serverless v2 : 0,12 $ par ACU-heure. Leur cluster évoluait entre 0,5 ACU (inactif) et 16 ACU (charge de pointe). Sur les 30 derniers jours, la moyenne était de 4,2 ACU.

Coût Serverless v2 mensuel : 4,2 ACU × 0,12 $ × 730 heures = 368 $/mois pour le writer.

Comparaison : une db.r6g.2xlarge fixe (leur équivalent provisionné estimé, dimensionné pour gérer la charge p95) avec une RI 1 an : 0,48 $/heure × 0,60 (réduction RI) × 730 = 210 $/mois.

« La RI est moins chère, » dit Leo.

« Pour une charge fixe, oui, » dit Tom. « Mais regarde l'écart. Notre période de faible trafic — de 2 h à 7 h, du lundi au jeudi — est en moyenne de 0,8 ACU. Sur une instance provisionnée fixe, on paierait pour 8 fois ce qu'on utilise pendant ces heures, juste à rester inactive. »

« Et Serverless v2 descend pour correspondre ? »

« À 0,5 ACU. Le coût à l'inactivité est une fraction de ce qu'on paierait pour une instance provisionnée dimensionnée pour le pic. »

Le calcul du seuil de rentabilité : Serverless v2 est moins cher quand votre ratio pic/base est au-dessus d'environ 4:1. Pour Nimbus, avec des pics du vendredi à 16 ACU et des minimums du lundi matin à 0,8 ACU — un ratio de 20:1 — Serverless v2 était le bon choix. Si leur trafic avait été plus constant (disons, 8 ACU ± 20 %), une RI provisionnée aurait été moins chère.

« Ce n'est pas seulement une question de savoir quel chiffre est le plus petit ce mois-ci, » dit Tom. « C'est une question de savoir quel modèle gère correctement notre croissance. Si on grandit de 50 % le trimestre prochain, Serverless v2 monte simplement à l'échelle. Une RI provisionnée nécessiterait un redimensionnement, et on paierait pour une marge inutilisée pendant la transition. »

Tom exposa la comparaison sur une année entière de manière explicite pour que l'équipe puisse suivre le raisonnement, pas seulement la conclusion.

**Coût Aurora mois par mois : Serverless v2 vs RI provisionnée**

L'option provisionnée : une db.r6g.2xlarge avec une instance réservée 1 an. Coût : 0,48 $/heure À la demande × 0,60 (réduction RI) × 730 heures = 210 $/mois. Fixe, quelle que soit la charge.

L'option Serverless v2 : payer par ACU-heure à 0,12 $. Variable, suivant la charge réelle.

Tom extrayit 30 jours de métriques d'ACU Aurora Serverless v2 depuis CloudWatch et construisit une distribution :

- 2 h–7 h, lundi–jeudi (faible trafic) : moyenne 0,8 ACU → 0,096 $/heure
- 7 h–11 h, en semaine (modéré) : moyenne 3,2 ACU → 0,384 $/heure  
- 11 h–21 h, en semaine (heures de pointe d'activité) : moyenne 5,8 ACU → 0,696 $/heure
- Vendredi 18 h–22 h (coup de feu du dîner) : moyenne 14,1 ACU → 1,692 $/heure
- Samedi 12 h–20 h (affluence du week-end) : moyenne 9,3 ACU → 1,116 $/heure
- Dimanche (jour le plus léger) : moyenne 2,1 ACU → 0,252 $/heure

Moyenne pondérée sur le mois entier : 4,2 ACU → 0,504 $/heure → 368 $/mois.

Sur une RI provisionnée : 210 $/mois. Serverless : 368 $/mois. L'option provisionnée économisait 158 $/mois.

« Ça semble évident, » dit Leo. « Pourquoi est-on sur Serverless ? »

« Parce que 368 $ est la moyenne, » dit Tom. « Regarde les vendredis soirs. »

Vendredi 18 h–22 h : 14,1 ACU en moyenne. Pour cette fenêtre de quatre heures, Serverless coûte 1,692 $/heure. Une db.r6g.2xlarge provisionnée à 210 $/mois — sa capacité maximale — était de 8 vCPU. Le cluster Serverless exécutait l'équivalent d'environ 16 vCPU pendant cette fenêtre.

« Une instance provisionnée dimensionnée pour notre pic du vendredi serait une db.r6g.4xlarge, » dit Tom. « Au tarif RI, c'est 0,96 $/heure × 0,60 = 0,576 $/heure. Mensuel : 420 $/mois. »

« C'est plus que la moyenne Serverless de 368 $, » dit Maya.

« Exact. Et si on dimensionnait l'instance provisionnée pour la base de semaine — la db.r6g.2xlarge — les vendredis soirs seraient un problème. À la charge de pointe, on pousserait l'équivalent de 14 ACU sur une instance à 8 vCPU. C'est de la saturation CPU. »

« Donc il faudrait pré-dimensionner pour le pic, » dit Priya.

« Au prix de payer pour de la capacité inactive les 160 autres heures de la semaine, » dit Tom. « Le calcul de la RI provisionnée qui ressort moins cher ne marche que quand ton ratio pic/base est faible. Le nôtre est de 20:1. C'est exactement le scénario pour lequel Serverless v2 a été conçu. »

Il montra les chiffres côte à côte :

| Option | Mois moyen | Nuit calme (2 h) | Coup de feu du vendredi (20 h) |
|---|---|---|---|
| Serverless v2 | 368 $ | 0,096 $/h | 1,692 $/h |
| RI provisionnée (r6g.2xl) | 210 $ | 210 $/730 h = 0,288 $/h | plafonné — risque de saturation |
| RI provisionnée (r6g.4xl) | 420 $ | 0,576 $/h | marge confortable |

« L'option Serverless est à 368 $, » dit Tom. « L'option provisionnée correctement dimensionnée est à 420 $ — et c'est avant de comptabiliser le coût opérationnel de surveiller et redimensionner manuellement l'instance provisionnée quand nos modèles de trafic changeront le trimestre prochain. »

« Et le coût opérationnel, » dit Priya, « n'est pas rien. »

« Non. Avec Serverless, on n'a pas à penser au dimensionnement des instances. Aurora s'en charge. Avec le provisionné, chaque trimestre je devrais réévaluer si la classe d'instance actuelle convient encore à notre trafic. Ce n'est pas cher en temps, mais c'est quelque chose qui peut mal tourner si on cesse de faire attention. »

« Ça ira tant qu'on n'oublie pas de la redimensionner, » dit Leo, puis il se reprit. « Ce qui est exactement le moment où ça n'ira pas. »

« Exactement, » dit Tom.

La conclusion tenait : Serverless v2 à 368 $/mois était le bon choix pour le ratio pic/base de 20:1 de Nimbus et la préférence de son équipe pour la simplicité opérationnelle. La RI provisionnée n'était convaincante que pour les équipes ayant un trafic qui ne variait pas significativement — un ratio de 2:1 ou 3:1 où l'instance provisionnée était rarement inactive.

« Qu'est-ce qui nous ferait passer au provisionné ? » demanda Maya.

« Si notre modèle de trafic s'aplatissait, » dit Tom. « Si Nimbus grandissait au point où la base de faible trafic était aussi élevée — disons 8 ACU à 2 h au lieu de 0,8 — le ratio tomberait à 2:1 et le provisionné aurait un sens économique. C'est un problème d'entreprise différent. Un qu'on aimerait avoir. »


Pour Aurora avec Serverless v2, les instances réservées ne s'appliquent pas directement — Serverless v2 évolue dynamiquement et vous payez par ACU-heure. C'est la configuration actuelle de Nimbus : le writer et le reader Aurora principaux utilisent tous deux Serverless v2. Les économies pour Nimbus viennent de la nature auto-scaling de Serverless v2 lui-même — vous ne payez pas pour de la capacité inutilisée quand le trafic est faible.

Les équipes exécutant encore des instances Aurora fixes devraient évaluer un engagement RI une fois que le type d'instance est resté stable pendant trois mois ou plus.

**DynamoDB : à la demande vs provisionné**

Au chapitre 9, nous avons présenté les deux modes de capacité de DynamoDB : à la demande et provisionné.

Nimbus exécutait DynamoDB en mode à la demande depuis le début. À faible trafic, c'était correct — à la demande est plus cher par requête mais n'a pas de frais minimum.

Maintenant, avec 18 mois de données de trafic dans CloudWatch, Tom pouvait voir des modèles.

Requêtes de lecture moyennes : 225 par seconde (environ 19,4 millions par jour)
Requêtes d'écriture moyennes : 60 par seconde (environ 5,2 millions par jour)
Jour de pic (vendredi) : 180 % des requêtes DynamoDB moyennes (ElastiCache absorbe ~95 % des lectures, donc DynamoDB ne voit qu'une fraction du pic de volume global de commandes de 25x)

**Tarification à la demande** : 1,25 $ par million de requêtes d'écriture, 0,25 $ par million de requêtes de lecture.
**Tarification provisionnée** : 0,00065 $ par unité de capacité d'écriture par heure, 0,00013 $ par unité de capacité de lecture par heure.

Tom calcula le point d'équilibre : la capacité provisionnée devient moins chère quand vous l'utilisez suffisamment régulièrement pour ne pas payer la prime à la demande pendant les périodes inactives.

(Une note sur les chiffres de cette section : ils reflètent la facture de l'équipe à l'époque et sont à titre indicatif. Fin 2024, AWS a réduit les prix DynamoDB à la demande de 50 %, ce qui a substantiellement déplacé le seuil de rentabilité — aujourd'hui, la capacité provisionnée ne l'emporte que lorsque l'utilisation est constamment élevée. Refaites toujours ce calcul avec les prix actuels.)

Avec 18 mois de données montrant des modèles quotidiens cohérents, la capacité provisionnée avec **DynamoDB Auto Scaling** était le bon choix :

- Définir la capacité minimale à 60 % de la charge moyenne
- Définir le maximum à 250 % de la moyenne (gère les pics du vendredi)
- Auto Scaling ajuste la capacité provisionnée entre ces limites

Coût DynamoDB mensuel : passé de 340 $ (à la demande) à 230 $ (provisionné avec auto scaling). Réduction de 32 %.

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya. « On est sur à la demande depuis le début parce qu'on ne faisait pas confiance à nos propres modèles de trafic. Qu'est-ce qui a changé ? »

« Dix-huit mois de données, » dit Tom. « On sait maintenant à quoi ressemblent nos modèles — base de semaine cohérente, pics du vendredi, périodes calmes du dimanche. À la demande était le bon choix quand on ne savait pas. Provisionné avec Auto Scaling est le bon choix maintenant qu'on sait. »

« Mais si on sur-provisionne, » demanda Leo, « on paie pour de la capacité inutilisée. »

« C'est le risque, » dit Tom. « Avec Auto Scaling, on définit le minimum assez haut pour éviter le throttling, et on laisse AWS gérer dans notre plage. »

« Et si notre modèle de trafic change significativement ? »

« Alors on ajuste les limites. On revoit ça trimestriellement. »

**ElastiCache : dimensionnement correct et le récit édifiant**

La facture ElastiCache : 185 $/mois. Une instance Redis cache.r6g.large dans chaque AZ (deux nœuds, primaire + réplica).

Les métriques CloudWatch montraient :

- Utilisation moyenne de la mémoire : 34 %
- Pic : 58 %

L'instance était sur-provisionnée. Un cache.r6g.medium gérerait probablement la charge avec de la marge.

Mais ici Tom s'arrêta. Il se souvenait de ce qui s'était passé dans une entreprise précédente quand il avait agressivement dimensionné un cache — et il raconta toute l'histoire à l'équipe, parce que c'était le genre d'histoire qui devait être racontée avant de se retrouver en plein milieu.

Dans son entreprise précédente — une plateforme SaaS de reporting financier — le cluster ElastiCache avait été un cache.r6g.large. Deux nœuds, primaire et réplica. Utilisation moyenne de la mémoire : 31 %. Pic observé : 54 %. L'ingénieur d'astreinte qui l'avait signalé avait fait le calcul : un cache.r6g.medium gérerait la charge avec 25 % de marge au-dessus du pic observé. Économie : 60 $/mois — tarification de la région et de la génération de nœuds de cette entreprise à l'époque, plus petite que l'écart équivalent chez Nimbus aujourd'hui. Le changement fut approuvé un mardi.

Le mois suivant, un jeudi soir à 23 h 47, le lot de règlement de fin de mois démarra.

Le lot de règlement tournait trimestriellement. Il tirait les enregistrements de transactions de chaque compte actif pour les trois mois précédents, les agrégeait, calculait les taxes et écrivait les enregistrements de règlement. Le cache était utilisé pour stocker l'état d'agrégation intermédiaire — le total courant de chaque compte à mesure que le lot progressait. La cache.r6g.large l'avait toujours géré. Personne n'avait regardé spécifiquement les métriques du lot de règlement en prenant la décision de dimensionnement, parce que le lot était trimestriel et que la fenêtre d'observation avait été de quatre semaines.

Sur l'instance medium, maxMemoryPolicy était réglé sur `allkeys-lru` — quand la mémoire était pleine, Redis évinçait la clé la moins récemment utilisée pour faire de la place. C'est la politique correcte pour un cache général. Mais pour le lot de règlement, chaque clé du cache était activement nécessaire. Quand la mémoire atteignit 84 % des 6,38 Go de l'instance medium, Redis commença à évincer des clés. Chaque éviction était un cache miss. Chaque cache miss envoyait une requête à la base de données PostgreSQL sous-jacente pour recalculer la valeur évincée à partir des enregistrements de transactions bruts.

Le pool de connexions à la base de données était configuré pour le trafic en état stable, pas pour la charge du lot de règlement. En quatre minutes après le début des évictions, la base de données avait 847 connexions actives. La limite de connexions était de 1 000. À 9 minutes, les premiers threads applicatifs commencèrent à voir des erreurs « too many connections ». À 12 minutes, trois services qui partageaient le pool de connexions à la base de données — le lot de règlement, le service de reporting en temps réel et l'API client — étaient tous affectés.

L'ingénieur d'astreinte escalada à 23 h 59. La revue d'incident commença à 0 h 08.

Première réponse : augmenter le timeout Lambda pour la fonction du lot de règlement (le lot de règlement était en partie basé sur Lambda). C'était faux. Le timeout n'était pas le problème.

Deuxième réponse : ajouter une seconde fonction Lambda pour paralléliser le lot de règlement. Faux aussi. Plus de parallélisme signifiait plus d'accès simultanés au cache, ce qui signifiait des évictions plus rapides, ce qui empirait la situation.

Troisième réponse : réduire le lot de règlement pour diminuer la pression sur la base de données. Cela aida légèrement mais ne traita pas la cause racine.

Quatrième réponse, à 2 h 31 : restaurer la cache.r6g.large. La pression mémoire chuta immédiatement. Les évictions cessèrent. Le pool de connexions à la base de données se libéra. Le lot de règlement se termina à 4 h 17, retardé de plus de quatre heures.

Total de l'incident : quatre heures de performances API dégradées pour les clients essayant d'accéder aux rapports. Un lot de règlement complet retardé. Temps d'ingénierie : approximativement 22 heures réparties sur cinq ingénieurs. Coût direct estimé : 40 000 $.

L'économie de 60 $/mois avait coûté 40 000 $ en un seul incident.

« L'erreur n'était pas la décision de dimensionnement, » dit Tom. « La décision était défendable sur la base des données disponibles. L'erreur était la fenêtre d'observation. On a mesuré quatre semaines de métriques. Le lot de règlement était trimestriel. On regardait la mauvaise période. »

« Alors comment l'éviter ? » demanda Maya.

« Tu demandes : quelle est l'opération aux enjeux les plus élevés que ce cache prend en charge ? Et tu trouves les métriques spécifiques de cette opération. Pas la semaine moyenne. La semaine spécifique — ou le mois — ou le trimestre — où la charge est la plus élevée. Et tu dimensionnes pour ça. »

« Et si tu ne trouves pas les métriques parce que l'opération est rare ? »

« C'est la réponse, » dit Tom. « Si tu ne trouves pas les métriques pour un scénario de forte charge spécifique, la bonne réponse est de ne pas encore dimensionner. Attends la prochaine occurrence, instrumente-la fortement, puis dimensionne sur la base de ce que tu as observé. »

Le cluster ElastiCache de Nimbus avait sa propre opération aux enjeux élevés : le coup de feu du dîner du vendredi. Tom avait ces données — trois vendredis soirs consécutifs avaient atteint 58 % d'utilisation mémoire sur la r6g.large. S'il passait à la r6g.medium et que quelque chose dans le pipeline de traitement des commandes changeait pour utiliser plus d'espace cache — une nouvelle fonctionnalité, une stratégie de cache différente — ce 58 % pourrait devenir 80 %, et 80 % sur une medium, c'est le territoire de l'éviction.

Il fit quand même le calcul. Passer de r6g.large à r6g.medium : deux nœuds à 0,127 $/heure contre deux nœuds à 0,065 $/heure, tournant 730 heures par mois. Large : 185 $/mois. Medium : 95 $/mois. Économie potentielle : 90 $/mois. Il testa l'instance medium en staging pendant deux semaines sous charge. La mémoire culmina à 71 % — assez proche de la limite pour qu'il soit mal à l'aise.

Puis il tarifa l'alternative : garder la cache.r6g.large, mais acheter des nœuds réservés (engagement d'1 an). De À la demande 185 $ à Réservé 120 $/mois. Économie : 65 $/mois sans changer le type d'instance.

« Les 65 $/mois que j'économiserais sur les nœuds réservés à la même taille d'instance sont une vraie économie, » dit Tom. « Les 90 $/mois que j'économiserais en passant à la medium sont une fausse économie si elle risque le coup de feu du dîner du vendredi. Parfois, dimensionner vers une instance plus petite risque un incident de performance — les nœuds réservés nous donnent l'essentiel des économies sans aucun risque. »

Il acheta les nœuds réservés pour la r6g.large.

« Les 25 $ de différence d'économies mensuelles, » dit Tom, « ne valent pas un incident un vendredi soir. »

**Rétention des sauvegardes RDS : le compromis de stockage**

Les sauvegardes automatisées RDS sont stockées dans S3 (sans frais supplémentaires pour le stockage jusqu'à 100 % de la taille de votre base de données). La rétention par défaut est de 7 jours.

Pour la base de données Aurora de 180 Go de Nimbus, 7 jours de sauvegardes était approprié — ils avaient pu restaurer depuis une sauvegarde dans cette fenêtre lors des tests.

Mais Tom remarqua : ils avaient aussi des instantanés manuels de chaque déploiement significatif, conservés indéfiniment.

23 instantanés manuels, total de 4,1 To de stockage d'instantanés.
Coût : 0,021 $/Go/mois pour le stockage de sauvegardes Aurora = environ 87 $/mois en stockage d'instantanés manuels.

Ils conservèrent les 3 derniers instantanés manuels par environnement (production, staging). Supprimèrent le reste — environ 1,1 To conservé.
Économie : 64 $/mois.

« On payait 64 $ par mois pour une assurance qu'on n'a jamais utilisée, » dit Leo.

« On payait pour la tranquillité d'esprit, » corrigea Tom. « La question est : combien vaut la tranquillité d'esprit à 64 $ par mois ? »

« Avec un plan de reprise après sinistre approprié, » dit Priya, « vous pouvez obtenir la même tranquillité d'esprit avec 7 jours de sauvegardes automatisées et 3 instantanés manuels. »

« D'accord. Maintenant. »

**Variation : quand le provisionné se retourne contre vous**

Si votre modèle de trafic est cohérent et prévisible, la capacité provisionnée avec Auto Scaling économise 30 % par rapport à à la demande. Mais si une nouvelle fonctionnalité se lance et que votre volume d'écriture monte de 5x du jour au lendemain, vous serez limité avant qu'Auto Scaling ne rattrape — Auto Scaling réagit au trafic observé, ce qui signifie qu'il y a un décalage. Garder le mode à la demande pour les semaines entourant le lancement d'une fonctionnalité majeure est un compromis raisonnable : coût légèrement plus élevé, aucun risque de throttling pendant une période où vous observez les modèles de trafic changer en temps réel.

Si vous éliminez des réplicas de lecture inutilisés (comme les réplicas PostgreSQL hérités de Nimbus), les économies sont immédiates et sans ambiguïté — il n'y a pas de compromis, parce que les réplicas n'apportaient aucune valeur. Mais si vous êtes tenté d'éliminer un réplica de lecture qui ne gère que 2 % du trafic, vérifiez ce qui arrive au primaire quand ces 2 % n'ont nulle part où aller pendant un pic. Certains réplicas de lecture existent pour la marge, pas pour la charge actuelle.

**Le résumé d'optimisation de la base de données**

| Service                                           | Avant      | Après    | Économie mensuelle |
|---------------------------------------------------|------------|----------|----------------|
| Aurora (Serverless v2 conservé après analyse)     | 647 $      | 647 $    | 0 $ (modèle correct) |
| Réplicas de lecture RDS (inutilisés)              | 340 $      | 0 $      | 340 $           |
| DynamoDB (À la demande → Provisionné + Auto Scaling) | 340 $   | 230 $    | 110 $           |
| ElastiCache (Nœuds réservés)                      | 185 $      | 120 $    | 65 $            |
| Instantanés manuels Aurora                        | 87 $       | 23 $     | 64 $            |
| RDS Proxy (sécurité des connexions)              | 0 $        | 88 $     | -88 $           |
| **Total**                                         | **1 599 $** | **1 108 $** | **491 $/mois** |

491 $ par mois d'économies sur la base de données. 5 892 $ par an.

Tom posa ce chiffre à côté du nettoyage de stockage (6 200 $/an), des politiques de cycle de vie S3 du chapitre 23 (7 800 $/an) et des économies du Savings Plan (14 200 $/an).

Impact total d'optimisation à ce jour : 34 092 $/an.

« C'est une vraie marge de manœuvre, » dit Maya.

« Ou plusieurs expériences sérieuses, » dit Priya.

« Ou douze mois d'expériences, » dit Leo.

Les trois avaient raison.

## Points forts et limites

**DynamoDB provisionné avec Auto Scaling** :

- Moins cher qu'à la demande pour les charges de travail prévisibles et cohérentes
- Auto Scaling gère la variabilité sans sur-provisionner en permanence
- Nécessite une surveillance pour s'assurer que les limites de capacité restent appropriées

**RDS Reserved Instances / ElastiCache Reserved Nodes** :

- Économies significatives pour les charges de travail stables et de longue durée
- Engagement verrouillé — si vos besoins changent, vous avez payé pour de la capacité inutilisée
- Contrairement aux RI Standard EC2, les RI RDS **ne peuvent pas** être revendues sur le Reserved Instance Marketplace — le Marketplace est réservé à EC2. Une RI RDS inutilisée est un coût irrécupérable, ce qui rend la décision de dimensionnement d'autant plus importante

**Le principe général** :

- Toujours comprendre l'utilisation avant d'optimiser — utilisez le p95, pas la moyenne
- Les ressources inutilisées (comme les réplicas de lecture hérités) sont l'optimisation au rendement le plus élevé
- Le dimensionnement correct nécessite une validation en staging avant application en production, et la vérification des modèles de charge saisonniers qui peuvent ne pas apparaître dans une fenêtre d'observation standard
- La tarification réservée nécessite une confiance dans la stabilité de la charge de travail

## Résumé

- **Auditer d'abord** : Extrayez les métriques CloudWatch avant d'effectuer tout changement de base de données. Utilisez la latence p95 et le CPU p95 — pas les moyennes. Vérifiez FreeableMemory et les maximums de connexions.
- **Supprimer les ressources inutilisées** : Les réplicas de lecture, les bases de données inactives et les instances de test qui ne sont plus nécessaires.
- **Surveiller votre pool de connexions** : Mettez des alarmes sur DatabaseConnections à 75 % et 90 % de la limite. Envisagez RDS Proxy pour le multiplexage des connexions.
- **DynamoDB À la demande vs Provisionné** : À la demande pour le trafic imprévisible ; Provisionné + Auto Scaling pour les modèles cohérents.
- **Dimensionnement correct ElastiCache** : Testez en staging sous des charges de pointe réalistes, y compris les pics saisonniers. Les nœuds réservés offrent des économies à la même taille d'instance quand un sous-dimensionnement agressif comporte un risque.
- **Gestion des instantanés RDS** : Conservez uniquement les instantanés dont vous avez besoin. Les instantanés manuels sont conservés indéfiniment à moins d'être supprimés.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.3)*

- **Modes de tarification DynamoDB** : À la demande = payer par requête (coût unitaire plus élevé, pas de minimum). Provisionné = payer par unité de capacité par heure (coût unitaire plus faible, doit allouer la capacité). **DynamoDB Auto Scaling** ajuste automatiquement la capacité provisionnée.
- **RDS Reserved Instances** : Disponible pour tous les types de moteurs RDS. Les déploiements Multi-AZ peuvent utiliser des instances réservées (vous vous engagez sur Multi-AZ). Terme de 1 ou 3 ans.
- **ElastiCache Reserved Nodes** : Même modèle d'engagement que les instances réservées EC2. Appliqué par nœud, pas par cluster.
- **Stockage des instantanés RDS** : Les sauvegardes automatisées sont gratuites jusqu'à 100 % de la taille de la base de données. Les instantanés manuels sont facturés par Go par mois dans S3. Scénario d'examen : « réduire les coûts de stockage RDS » → supprimer les vieux instantanés manuels.
- **Capacité réservée DynamoDB** : Disponible pour DynamoDB également (engagement sur une capacité de lecture/écriture spécifique pendant 1 ou 3 ans à un prix réduit). Différent du provisionné standard — vous prépayez la capacité dans toutes vos tables DynamoDB dans une région.
- **Aurora Serverless v2 vs provisionné** : Serverless v2 évolue automatiquement, idéal pour les charges de travail variables. Provisionné avec instances réservées est moins cher pour les charges de travail stables et prévisibles.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez quand utiliser la capacité à la demande DynamoDB par rapport à la capacité provisionnée avec Auto Scaling. Quelle information vous faut-il pour prendre cette décision ?

*(Indice : Réfléchissez à ce que « prévisible » signifie en termes de données de trafic, et quel risque à la demande supprime que le provisionné introduit.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise exploite une table DynamoDB pour le classement d'un jeu mobile. Le trafic est très cohérent tout au long de l'année, sauf lors d'un événement saisonnier planifié des mois à l'avance (une semaine par trimestre, atteignant 10x le trafic normal à mesure que les joueurs se connectent au cours du premier jour). La priorité de l'entreprise est de minimiser les coûts de base de données pendant les longues périodes prévisibles d'état stable tout en maintenant les performances pendant les semaines d'événement connues.

Quelle stratégie de capacité DynamoDB répond LE MIEUX à ces exigences ?

A) Capacité à la demande pour gérer les pics saisonniers sans throttling  
B) Capacité provisionnée fixée aux niveaux de pic saisonnier (toujours provisionnée pour le trafic 10x)  
C) Capacité provisionnée avec DynamoDB Auto Scaling, avec une capacité maximale fixée pour le pic saisonnier  
D) Unités de capacité réservées DynamoDB pour 3 ans aux niveaux de trafic normaux

**Indice 1** : « Trafic très cohérent sauf pour un pic saisonnier planifié et connu » — quel mode gère les deux efficacement ? (La force de à la demande est le trafic *imprévisible* ; ce trafic est prévisible.)

**Indice 2** : « Minimiser les coûts » pendant les périodes creuses signifie qu'on ne peut pas sur-provisionner pour 10x tout le temps.

**Indice 3** : DynamoDB Auto Scaling peut monter à l'échelle pour l'événement saisonnier et redescendre après.

**Réponse** : C

**Explication** : La capacité provisionnée avec Auto Scaling ajuste la table en fonction du trafic réel. Pendant les périodes normales, la capacité est aux niveaux normaux (faible coût). Pendant l'événement saisonnier — dont les dates sont connues à l'avance et dont le trafic monte progressivement au cours du premier jour — Auto Scaling suit l'augmentation jusqu'au niveau maximum configuré (gérant le pic 10x), et l'équipe peut aussi relever le minimum avant le début planifié comme marge supplémentaire. Après l'événement, la capacité redescend. C'est moins cher qu'à la demande pendant l'état stable qui domine l'année (à la demande coûte plus par requête) et moins cher que de toujours provisionner pour 10x.

**Pourquoi pas A ?** À la demande gère les pics sans throttling, mais sa force est le trafic *imprévisible*. Ici le trafic est très cohérent et le pic est planifié et progressif — payer la prime par requête de à la demande pour les ~92 % de l'année qui sont en état stable contredit la priorité énoncée de minimiser les coûts pendant les périodes normales.

**Pourquoi pas B ?** Provisionner à 10x en permanence signifie que ~90 % de la capacité provisionnée reste inutilisée pendant ~92 % de l'année — payer pour de la capacité jamais utilisée.

**Pourquoi pas D ?** Les unités de capacité réservées vous verrouillent aux niveaux de trafic normaux. Pendant l'événement saisonnier 10x, vous seriez limité au-delà du montant réservé, ou vous devriez ajouter à la demande par-dessus.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.3*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus évalue une nouvelle fonctionnalité : un tableau de bord analytique pour les restaurants qui affiche les comptages de commandes en temps réel, le chiffre d'affaires par heure et les données démographiques des clients. Ces données interrogeraient une base de données environ 200 fois par minute (une requête par analyste par rafraîchissement de page, avec 10 analystes).

Actuellement, les données analytiques sont dans Athena (S3). Devraient-ils construire le tableau de bord sur Athena, ou devraient-ils charger les données dans une base de données ? Si une base de données, laquelle (Aurora, DynamoDB, Redshift) ?

Considérez : la fréquence des requêtes, les exigences de fraîcheur des données, la complexité des requêtes (agrégations, jointures) et le coût par requête à ce volume.

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la sélection de bases de données pour les charges de travail analytiques.)*

## Scène post-générique

Tom présenta le résumé complet d'optimisation des coûts à Maya.

Trois mois de travail. 34 092 $ d'économies annuelles identifiées, la plupart déjà mises en œuvre.

« Que reste-t-il ? » demanda Maya.

« Des optimisations dont je ne suis pas encore confiant, » dit Tom. « La configuration Aurora pourrait peut-être être davantage dimensionnée, mais je veux un trimestre de données supplémentaire avant de m'engager. Et il y a une question de transfert de données que je n'ai pas entièrement analysée. »

« Les coûts réseau. »

« Oui. C'est la prochaine étape. »

Maya regarda les chiffres. « Tom, je veux comprendre quelque chose. Cette optimisation — tu y as travaillé pendant trois mois. C'est une partie significative de ton temps. »

« Environ 30 %. »

« Et tu as trouvé environ 34 000 $ par an. Donc l'optimisation se rentabilise en — quoi, quelques mois de ton salaire ? »

Tom la regarda. « À peu près. »

« Et chaque année après ça, ce sont de pures économies. »

« Ou du pur réinvestissement, » dit-il. « Même effet. »

Maya hocha la tête. « C'est ce que je veux que tu fasses. Pas seulement sur le stockage et les bases de données — sur tout. Fais de l'optimisation des coûts une fonction continue de ton rôle. »

Tom n'avait jamais entendu son travail décrit ainsi. Il trouva cela à la fois précis et satisfaisant.

Dans le prochain chapitre : la dernière catégorie de coûts restante — et celle qui surprend presque tout le monde.
