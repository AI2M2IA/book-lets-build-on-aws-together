# Chapitre 29 : La Facture de la Base de Données

Tom a imprimé les graphiques d'utilisation. Quatorze pages. Il les a étalées sur son bureau avant de se fier à lui-même pour lire les chiffres. Mieux valait tout voir d'un coup plutôt que de découvrir des surprises en cours de lecture.

L'audit du stockage avait révélé 6 700 $ de gaspillage accumulé — non pas à cause de mauvaises décisions, mais de la négligence. Des volumes non attachés, d'anciens instantanés, des historiques de versions que personne n'avait dit à S3 de nettoyer, des téléversements multipart incomplets qui s'accumulaient silencieusement depuis des mois. Tom avait tout corrigé, mis en place des règles de nettoyage automatique, et était passé à l'onglet suivant du tableur. La couche données était le plus grand inconnu restant : bases de données relationnelles, tables NoSQL, nœuds de cache, stockage de sauvegardes, et une ligne qui l'agaçait depuis des semaines.

Les postes de la couche données à examiner :

Cluster Aurora : 647 $/mois.
Répliques de lecture RDS PostgreSQL héritées : 340 $/mois.
Tables DynamoDB : 340 $/mois.
ElastiCache : 185 $/mois.
Instantanés manuels Aurora : 87 $/mois.

Total de la couche données à examiner : 1 599 $/mois.

« Laissez-moi comprendre chacun avant de décider quoi que ce soit », dit-il. « Parce que la base de données n'est pas l'endroit où économiser de l'argent en prenant des raccourcis. »

C'était sage. Une mauvaise configuration de base de données qui entraîne une perte de données ou une dégradation des performances coûte bien plus que les économies réalisées.

Pensez à une base de données comme au moteur d'une voiture. Vous pouvez économiser sur une voiture en passant à un carburant moins cher, en ajustant la pression des pneus et en retirant le poids inutile du coffre. Mais si vous essayez d'économiser en sautant une vidange, vous risquez de gripper le moteur — et un moteur grippé coûte bien plus que toutes les économies de carburant. L'audit que Tom s'apprête à mener suit la même logique : trouver le gaspillage dans le coffre et le réservoir, et laisser le moteur tranquille jusqu'à ce qu'on sache exactement ce qu'on fait.

**Comprendre Votre Charge de Travail sur la Base de Données en Premier**

L'optimisation des coûts dans les bases de données nécessite de comprendre la charge de travail avant de toucher quoi que ce soit. Tom avait appris cela à la suite d'un quasi-incident six mois plus tôt : il avait commencé à réduire la taille de l'instance de base de données en se basant sur l'utilisation moyenne du CPU — 18 % — sans d'abord regarder les chiffres p95. Un collègue lui avait demandé d'examiner les métriques CloudWatch plus attentivement. Le CPU p95 était à 61 %, et lors d'un vendredi soir de dîner particulièrement chargé, il avait atteint 84 %.

« La moyenne ne vous dit pas ce qui se passe au pic », dit Tom, quand il en parla à Priya. « Si j'avais dimensionné pour la moyenne, on aurait été limités les vendredis soir. »

« C'est pourquoi on regarde le p95, pas la moyenne », dit Priya. « Toujours. »

Ce principe s'étendait au-delà du CPU. Tom avait maintenant une liste de contrôle pré-audit standard :

- CPU : p95, pas la moyenne
- Mémoire : FreeableMemory (en octets absolus, pas en pourcentage) — à quelle distance sommes-nous de la limite ?
- Connexions : maximum de DatabaseConnections sur les 30 derniers jours — jusqu'où avons-nous atteint la limite de connexions ?
- Ratio lecture/écriture : détermine si les répliques de lecture valent leur coût
- Taux de croissance du stockage : combien de Go par mois ajoutons-nous ?
- Délai de réplication (pour les répliques) : la réplique suit-elle le rythme ?

Questions clés :

- Quelle est l'utilisation moyenne et de pointe du CPU ?
- Quel est le ratio lecture/écriture ?
- Le stockage croît-il, est-il stable ou diminue-t-il ?
- Les répliques de lecture sont-elles utilisées ?
- L'instance est-elle sous-provisionnée (causant des ralentissements) ou sur-provisionnée (payant pour une capacité inactive) ?

Tom a extrait les métriques CloudWatch pour les trois services de base de données sur les 30 jours précédents :

**Cluster Aurora** :

- CPU moyen : 18 % (p95 : 61 % ; pic : 84 % les vendredis soir)
- FreeableMemory : constamment au-dessus de 4 Go sur 8 Go disponibles. Pas de problème.
- Ratio lecture/écriture : 14:1 (lecture intensive)
- Stockage : 180 Go (croissant de ~5 Go/mois)
- Maximum de DatabaseConnections : 312 sur 1 000 disponibles. Confortable.

**Répliques de lecture (RDS PostgreSQL, séparées d'Aurora)** :

- Ce sont deux répliques de lecture RDS héritées créées avant la migration Aurora, toujours en cours d'exécution.
- Connexions moyennes à chacune : 2 par jour. CPU moyen : 3 %.
- FreeableMemory : 7,2 Go sur 8 Go disponibles. Les instances étaient quasi inactives.

« Pourquoi celles-ci fonctionnent-elles encore ? » demanda Tom.

« Je les ai déjà déployées — oh, » dit Leo. Il regarda les dates de création des instances. « Elles étaient pour le basculement pendant la migration Aurora. Je ne les ai jamais supprimées. »

Ce moment — quand quelque chose de coûteux tourne depuis des mois sans être utilisé — est familier dans les environnements cloud. Leo avait créé les répliques comme filet de sécurité. Le filet n'avait jamais été nécessaire. Mais personne n'avait posé la question jusqu'à maintenant.

« Qu'est-ce qu'il en est du pool de connexions ? » demanda Priya, se penchant. « Avant de les supprimer, est-ce que des composants de l'application routent encore des lectures là-dessus ? »

Tom vérifia les journaux de connexions. Les deux connexions par jour provenaient d'un script de surveillance que Priya avait écrit quatorze mois plus tôt — il interrogeait tous les points d'accès de base de données connus pour vérifier qu'ils répondaient. Les répliques n'étaient interrogées que par le vérificateur de santé, pas par le trafic applicatif réel.

« Supprimez-les, » dit Maya.

Les répliques ont été résiliées. Économie mensuelle : 340 $.

**Le Quasi-incident du Pool de Connexions**

Pendant qu'il avait les métriques de connexions ouvertes, Tom effectua une vérification plus large sur tous les points d'accès de base de données. Ce qu'il trouva lui fit s'arrêter.

Le point d'accès d'écriture Aurora montrait un maximum de DatabaseConnections de 312. Confortable. Mais le point d'accès de lecture racontait une autre histoire.

« Le point d'accès de lecture a atteint 847 connexions trois vendredis soir consécutifs », dit Tom.

« Quelle est la limite ? » demanda Priya.

« La limite pour notre classe d'instance actuelle est 1 000. On est montés à 847. C'est 85 % de la limite. »

« Et on ne l'a pas remarqué parce qu'on n'était pas alertés avant 90 % ? » demanda Maya.

« On n'était pas alertés du tout », dit Tom. « Il n'y a pas d'alarme CloudWatch sur les connexions du point d'accès de lecture. J'ai seulement trouvé ça parce que je regardais les métriques brutes. »

À 1 000 connexions, la base de données refuse les nouvelles connexions. Tout thread applicatif essayant d'acquérir une connexion à ce moment lève une exception. Si cette exception n'est pas gérée gracieusement, l'utilisateur voit une erreur 500.

« On était à trente secondes d'un incident vendredi soir », dit Leo. « Trois fois d'affilée. »

« Avez-vous réfléchi à ce qui se passe quand ce seuil est franchi ? » demanda Priya.

« Les partenaires restaurant voient des commandes échouées pendant le rush du dîner », dit Maya. « Ce n'est pas une préoccupation théorique. »

Tom a immédiatement configuré une alarme CloudWatch : alerte à 750 connexions (75 % de la limite), page à 900 (90 %). Il a également mis en place RDS Proxy pour le point d'accès de lecture — RDS Proxy regroupe et gère les connexions de base de données depuis la couche applicative, ce qui signifie que cinquante threads applicatifs peuvent partager dix connexions de base de données. Le proxy gère le multiplexage. La base de données voit bien moins de connexions même lorsque l'application est sous forte charge.

« Pour Aurora Serverless v2, RDS Proxy est facturé à 0,015 $ par ACU par heure, avec un minimum de 8 ACU par proxy », dit Tom. « Mais si une violation de la limite de connexions provoque ne serait-ce qu'une interruption partielle un vendredi soir, le coût de réputation pour Nimbus est d'un ordre de grandeur supérieur. »

« Combien ça coûte par mois ? » se demanda Tom en faisant le calcul. Leur lecteur fonctionne sur Serverless v2, donc le proxy est facturé sur le minimum de 8 ACU : 0,015 $ × 8 × 730 = 87,60 $/mois. C'était un coût qu'il était heureux de payer.

Vous vous demandez peut-être : si on économise déjà avec la mise à l'échelle automatique de Serverless v2, pourquoi s'embêter avec des Instances Réservées pour le niveau provisionné ? La réponse est que la mise à l'échelle de Serverless v2 a un coût — vous payez par ACU-heure que vous l'ayez planifié ou non. Pour les équipes qui utilisent des configurations Aurora fixes, l'engagement RI convertit un coût variable en coût prévisible. Pour les équipes qui utilisent des instances provisionnées (pas Serverless v2), cette distinction compte considérablement.

**Instances Réservées RDS : Pour les Niveaux de Base de Données Provisionnés**

Comme EC2, RDS propose des Instances Réservées pour l'utilisation engagée.

Pour les équipes utilisant des configurations d'instance Aurora fixes (pas Serverless v2), les Instances Réservées peuvent économiser 30 à 60 %. Voici comment fonctionne l'approche RI provisionnée : vous vous engagez sur un type d'instance spécifique pour 1 ou 3 ans en échange d'une remise significative sur le tarif horaire.

À titre d'illustration : une instance writer db.r6g.large à 0,26 $/heure à la demande revient à 190 $/mois. Une Instance Réservée d'un an pour la même réduit cela à environ 108 $/mois — économisant 82 $/mois par instance, soit près de 1 000 $ par an par instance de base de données.

**Aurora Serverless v2 vs RI Standard — Le Point d'Équilibre**

Tom a fait les calculs pour leur configuration Aurora spécifique. La question : la mise à l'échelle automatique d'Aurora Serverless v2 apportait-elle suffisamment d'avantages, ou une instance provisionnée fixe avec un engagement d'Instance Réservée serait-elle moins chère ?

Tarification Serverless v2 : 0,12 $ par ACU-heure. Leur cluster s'échelonnait entre 0,5 ACU (inactif) et 16 ACU (charge de pointe). Sur les 30 derniers jours, la moyenne était de 4,2 ACU.

Coût mensuel Serverless v2 : 4,2 ACU × 0,12 $ × 730 heures = 368 $/mois pour le writer.

Comparaison : une db.r6g.xlarge fixe (leur équivalent provisionné estimé, dimensionné pour gérer la charge p95 en semaine) avec un RI d'un an : 0,52 $/heure × 0,60 (remise RI) × 730 = 228 $/mois.

« Le RI est moins cher, » dit Leo.

« Pour une charge fixe, oui », dit Tom. « Mais regardez l'écart. Notre période de faible trafic — de 2h à 7h, du lundi au jeudi — est en moyenne à 0,8 ACU. Sur une instance provisionnée fixe, on paierait plusieurs fois ce qu'on utilise pendant ces heures, juste à rester inactif. »

« Et Serverless v2 s'abaisse pour correspondre ? »

« À 0,5 ACU. Le coût d'inactivité est une fraction de ce qu'on paierait pour une instance provisionnée dimensionnée pour le pic. »

Le calcul du point d'équilibre : Serverless v2 est moins cher quand votre ratio pic/base est supérieur à environ 4:1. Pour Nimbus, avec des pics du vendredi à 16 ACU et des minimums du lundi matin à 0,8 ACU — un ratio de 20:1 — Serverless v2 était le bon choix. Si leur trafic avait été plus cohérent (disons, 8 ACU ± 20 %), un RI provisionné aurait été moins cher.

« Ce n'est pas juste une question de quel chiffre est plus petit ce mois-ci », dit Tom. « C'est une question de quel modèle gère correctement notre croissance. Si on croît de 50 % le prochain trimestre, Serverless v2 monte juste. Un RI provisionné nécessiterait un redimensionnement, et on paierait pour une capacité inutilisée pendant la transition. »

Tom a cartographié explicitement la comparaison sur un an pour que l'équipe puisse suivre le raisonnement, pas seulement la conclusion.

**Coût Aurora mois par mois : Serverless v2 vs RI provisionné**

L'option provisionnée : une db.r6g.xlarge avec une Instance Réservée d'un an. Coût : 0,52 $/heure à la demande × 0,60 (remise RI) × 730 heures = 228 $/mois. Fixe, quelle que soit la charge.

L'option Serverless v2 : payer par ACU-heure à 0,12 $. Variable, suivant la charge réelle.

Tom a extrait 30 jours de métriques ACU Aurora Serverless v2 de CloudWatch et a construit une distribution :

- 2h–7h, lundi–jeudi (faible trafic) : moyenne 0,8 ACU → 0,096 $/heure
- 7h–11h, jours de semaine (modéré) : moyenne 3,2 ACU → 0,384 $/heure
- 11h–21h, jours de semaine (heures de pointe) : moyenne 5,8 ACU → 0,696 $/heure
- Vendredi 18h–22h (rush du dîner) : moyenne 14,1 ACU → 1,692 $/heure
- Samedi 12h–20h (week-end chargé) : moyenne 9,3 ACU → 1,116 $/heure
- Dimanche (jour le plus calme) : moyenne 2,1 ACU → 0,252 $/heure

Moyenne pondérée sur le mois complet : 4,2 ACU → 0,504 $/heure → 368 $/mois.

Sur un RI provisionné : 228 $/mois. Serverless : 368 $/mois. L'option provisionnée économisait 140 $/mois.

« Ça semble évident », dit Leo. « Pourquoi est-on sur Serverless ? »

« Parce que 368 $ c'est la moyenne », dit Tom. « Regardez les vendredis soir. »

Vendredi 18h–22h : moyenne 14,1 ACU. Pour cette fenêtre de quatre heures, Serverless coûte 1,692 $/heure. Une db.r6g.xlarge à 228 $/mois plafonne à 32 Gio de mémoire — l'équivalent d'environ 16 ACU. Le cluster Serverless atteignait en moyenne 14,1 ACU pendant cette fenêtre, frôlant le plafond du xlarge sans marge pour les pics.

« Une instance provisionnée dimensionnée pour notre pic du vendredi avec une vraie marge serait une db.r6g.2xlarge », dit Tom. « Au tarif RI, c'est 1,04 $/heure × 0,60 = 0,624 $/heure. Mensuel : 456 $/mois. »

« C'est plus que la moyenne Serverless de 368 $ », dit Maya.

« Exact. Et si on dimensionnait l'instance provisionnée pour le base de semaine — la db.r6g.xlarge — les vendredis soir seraient un problème. En charge de pointe, on pousserait 14 ACU contre pratiquement toute la capacité du xlarge. C'est la saturation. »

« Donc il faudrait pré-dimensionner pour le pic », dit Priya.

« Au prix de payer pour une capacité inactive les 160 autres heures de la semaine », dit Tom. « Le calcul RI provisionné qui ressort moins cher ne fonctionne que quand votre ratio pic/base est faible. Le nôtre est de 20:1. C'est exactement le scénario pour lequel Serverless v2 a été conçu. »

Il montra les chiffres côte à côte :

| Option | Mois moyen | Nuit calme (2h) | Rush du vendredi (20h) |
|---|---|---|---|
| Serverless v2 | 368 $ | 0,096 $/h | 1,692 $/h |
| RI provisionné (r6g.xl) | 228 $ | 228 $/730h = 0,312 $/h | plafonné — risque de saturation |
| RI provisionné (r6g.2xl) | 456 $ | 0,624 $/h | marge confortable |

« L'option Serverless est à 368 $ », dit Tom. « L'option provisionnée correctement dimensionnée est à 456 $ — et ça avant de tenir compte du coût opérationnel de la surveillance et du redimensionnement manuel de l'instance provisionnée quand nos modèles de trafic changeront le prochain trimestre. »

« Et le coût opérationnel », dit Priya, « ce n'est pas rien. »

« Non. Avec Serverless, on n'a pas à penser au dimensionnement des instances. Aurora s'en occupe. Avec le provisionné, chaque trimestre je devrais réévaluer si la classe d'instance actuelle correspond toujours à notre trafic. Ce n'est pas cher en temps, mais c'est quelque chose qui peut mal tourner si on cesse d'y prêter attention. »

« Ça ira tant qu'on n'oublie pas de le redimensionner », dit Leo, puis il se reprit. « Ce qui est exactement quand ça n'ira pas. »

« Exactement, » dit Tom.

La conclusion tenait : Serverless v2 à 368 $/mois était le bon choix pour le ratio pic/base de 20:1 de Nimbus et la préférence de son équipe pour la simplicité opérationnelle. Le RI provisionné n'était convaincant que pour les équipes avec un trafic qui ne variait pas significativement — un ratio de 2:1 ou 3:1 où l'instance provisionnée n'était que rarement inactive.

« Qu'est-ce qui nous ferait basculer vers le provisionné ? » demanda Maya.

« Si notre modèle de trafic s'aplanissait », dit Tom. « Si Nimbus grandissait au point où le base de faible trafic était aussi élevée — disons, 8 ACU à 2h au lieu de 0,8 — le ratio tomberait à 2:1 et le provisionné aurait du sens économiquement. C'est un problème différent. Un qu'on aimerait avoir. »

Pour Aurora avec Serverless v2, les Instances Réservées ne s'appliquent pas directement — Serverless v2 s'adapte dynamiquement et vous payez par ACU-heure. C'est la configuration actuelle de Nimbus : le writer et le reader Aurora primaires utilisent tous deux Serverless v2. Les économies pour Nimbus viennent de la nature de mise à l'échelle automatique de Serverless v2 elle-même — vous ne payez pas pour la capacité inutilisée quand le trafic est faible.

Les équipes qui utilisent encore des instances Aurora fixes devraient évaluer l'engagement RI une fois que le type d'instance a été stable pendant trois mois ou plus.

**DynamoDB : À la Demande vs Provisionné**

Au Chapitre 9, nous avons présenté les deux modes de capacité de DynamoDB : à la demande et provisionné.

Nimbus utilisait DynamoDB en mode à la demande depuis le début. À faible trafic, c'était correct — le mode à la demande est plus cher par requête mais n'a pas de charge minimale.

Maintenant, avec 18 mois de données de trafic dans CloudWatch, Tom pouvait voir des modèles.

Requêtes de lecture moyennes : 225 par seconde (environ 19,4 millions par jour)
Requêtes d'écriture moyennes : 60 par seconde (environ 5,2 millions par jour)
Jour de pointe (vendredi) : 180 % des requêtes DynamoDB moyennes (ElastiCache absorbe ~95 % des lectures, donc DynamoDB ne voit qu'une fraction du pic global de volume de commandes de 25x)

**Tarification à la demande** : 1,25 $ par million de requêtes d'écriture, 0,25 $ par million de requêtes de lecture.
**Tarification provisionnée** : 0,00065 $ par unité de capacité d'écriture par heure, 0,00013 $ par unité de capacité de lecture par heure.

Tom a calculé le point d'équilibre : la capacité provisionnée devient moins chère quand on l'utilise suffisamment régulièrement pour ne pas payer la prime à la demande pendant les périodes d'inactivité.

(Une note sur les chiffres de cette section : ils reflètent la facture de l'équipe à l'époque, et sont illustratifs. Fin 2024, AWS a réduit les prix à la demande DynamoDB de 50 %, ce qui a déplacé considérablement le point d'équilibre — aujourd'hui, la capacité provisionnée ne gagne que quand l'utilisation est constamment élevée. Refaites toujours ce calcul avec les prix actuels.)

Avec 18 mois de données montrant des modèles quotidiens cohérents, la capacité provisionnée avec **DynamoDB Auto Scaling** était le bon choix :

- Définir la capacité minimale à 60 % de la charge moyenne
- Définir le maximum à 250 % de la moyenne (gère les pics du vendredi)
- Auto Scaling ajuste la capacité provisionnée dans ces limites

Coût mensuel DynamoDB : réduit de 340 $ (à la demande) à 230 $ (provisionné avec auto scaling). Réduction de 32 %.

« Attendez — mais *pourquoi* ferait-on ça de cette façon ? » demanda Maya. « On est sur à la demande depuis le début parce qu'on ne faisait pas confiance à nos propres modèles de trafic. Qu'est-ce qui a changé ? »

« Dix-huit mois de données », dit Tom. « On connaît maintenant l'apparence de nos modèles — base hebdomadaire cohérente, pics du vendredi, périodes calmes du dimanche. Le mode à la demande était le bon choix quand on ne savait pas. Le provisionné avec Auto Scaling est le bon choix maintenant qu'on sait. »

« Mais si on sur-provisionne, » demanda Leo, « on paye pour la capacité inutilisée. »

« C'est le risque », dit Tom. « Avec Auto Scaling, on définit le minimum assez haut pour éviter la limitation, et on laisse AWS gérer dans notre plage. »

« Et si notre modèle de trafic change significativement ? »

« Alors on ajuste les limites. On examine ça trimestriellement. »

**ElastiCache : Bon Dimensionnement et le Récit Édifiant**

La facture ElastiCache : 185 $/mois. Une instance Redis cache.r6g.large dans chaque AZ (deux nœuds, primaire + réplique).

Les métriques CloudWatch montraient :

- Utilisation moyenne de la mémoire : 34 %
- Pic : 44 %

L'instance était sur-provisionnée. Un cache.m6g.large — la moitié de la mémoire du r6g.large — gérerait probablement la charge avec une certaine marge.

Mais là Tom fit une pause. Il se souvint de ce qui s'était passé dans une entreprise précédente quand il avait agressivement redimensionné un cache — et il raconta l'histoire complète à l'équipe, parce que c'était le genre d'histoire qui devait être racontée avant de se retrouver au milieu.

Dans son entreprise précédente — une plateforme SaaS pour le reporting financier — le cluster ElastiCache était un cache.r6g.large. Deux nœuds, primaire et réplique. Utilisation moyenne de la mémoire : 26 %. Pic observé : 37 %. L'ingénieur d'astreinte qui l'avait signalé avait fait le calcul : un cache.m6g.large gérerait la charge avec environ 25 % de marge au-dessus du pic observé. Économie : 60 $/mois — tarification dans la région et la génération de nœuds de cette entreprise à l'époque, plus petite que l'écart équivalent chez Nimbus aujourd'hui. Le changement a été approuvé un mardi.

Le mois suivant, un jeudi soir à 23h47, le lot de règlement mensuel a démarré.

Le lot de règlement tournait trimestriellement. Il extrayait les enregistrements de transactions de chaque compte actif pour les trois mois précédents, les agrégeait, calculait les taxes et écrivait les enregistrements de règlement. Le cache était utilisé pour stocker l'état d'agrégation intermédiaire — le total cumulé de chaque compte à mesure que le lot avançait. Le cache.r6g.large l'avait toujours géré. Personne n'avait regardé spécifiquement les métriques du lot de règlement lors de la décision de redimensionnement, parce que le lot était trimestriel et la fenêtre d'observation avait été de quatre semaines.

Sur la plus petite instance, maxMemoryPolicy était défini sur `allkeys-lru` — quand la mémoire était pleine, Redis expulsait la clé la moins récemment utilisée pour faire de la place. C'est la bonne politique pour un cache général. Mais pour le lot de règlement, chaque clé dans le cache était activement nécessaire. Quand la mémoire s'est remplie à 84 % des 6,38 Go du m6g.large, Redis a commencé à expulser des clés. Chaque expulsion était un échec de cache. Chaque échec de cache envoyait une requête à la base de données PostgreSQL sous-jacente pour recalculer la valeur expulsée à partir des enregistrements de transactions bruts.

Le pool de connexions à la base de données était configuré pour le trafic en régime permanent, pas pour la charge du lot de règlement. En quatre minutes après le début des expulsions, la base de données avait 847 connexions actives. La limite de connexions était de 1 000. À 9 minutes, les premiers threads applicatifs commençaient à voir des erreurs « too many connections ». À 12 minutes, trois services qui partageaient le pool de connexions à la base de données — le lot de règlement, le service de reporting en temps réel et l'API côté client — étaient tous affectés.

L'ingénieur d'astreinte a escaladé à 23h59. L'examen de l'incident a commencé à 00h08.

Première réponse : augmenter le délai d'attente Lambda pour la fonction du lot de règlement (le lot de règlement était partiellement basé sur Lambda). C'était faux. Le délai d'attente n'était pas le problème.

Deuxième réponse : ajouter une deuxième fonction Lambda pour paralléliser le lot de règlement. Également faux. Plus de parallélisme signifiait plus d'accès simultanés au cache, ce qui signifiait des expulsions plus rapides, ce qui aggravait la situation.

Troisième réponse : réduire le lot de règlement pour diminuer la pression sur la base de données. Cela a légèrement aidé mais n'a pas résolu la cause profonde.

Quatrième réponse, à 2h31 : restaurer le cache.r6g.large. La pression mémoire a immédiatement baissé. Les expulsions se sont arrêtées. Le pool de connexions à la base de données s'est libéré. Le lot de règlement s'est terminé à 4h17, retardé de plus de quatre heures.

Total de l'incident : quatre heures de performances API dégradées pour les clients essayant d'accéder aux rapports. Un lot de règlement complet retardé. Temps d'ingénierie : environ 22 heures sur cinq ingénieurs. Coût direct estimé : 40 000 $.

L'économie de 60 $/mois avait coûté 40 000 $ en un seul incident.

« L'erreur n'était pas la décision de redimensionnement », dit Tom. « La décision était défendable sur la base des données disponibles. L'erreur était la fenêtre d'observation. On a mesuré quatre semaines de métriques. Le lot de règlement était trimestriel. On regardait la mauvaise période. »

« Alors comment l'éviter ? » demanda Maya.

« Vous posez : quelle est l'opération à plus forts enjeux que ce cache supporte ? Et vous trouvez les métriques spécifiques à cette opération. Pas la semaine moyenne. La semaine spécifique — ou le mois — ou le trimestre — quand la charge est la plus élevée. Et vous dimensionnez pour ça. »

« Et si vous ne pouvez pas trouver les métriques parce que l'opération est rare ? »

« C'est la réponse », dit Tom. « Si vous ne pouvez pas trouver les métriques pour un scénario spécifique à forte charge, la bonne réponse est de ne pas encore redimensionner. Attendez la prochaine occurrence, instrumentez-la fortement, puis dimensionnez en fonction de ce que vous avez observé. »

Le cluster ElastiCache de Nimbus avait sa propre opération à forts enjeux : le rush du dîner du vendredi. Tom avait ces données — trois vendredis soir consécutifs avaient atteint 44 % d'utilisation de la mémoire sur le r6g.large, soit environ 5,7 Go de données actives. Sur les 6,38 Go du m6g.large, ce même ensemble de travail serait déjà près de 90 % — et si quoi que ce soit dans le pipeline de traitement des commandes changeait pour utiliser plus d'espace cache — une nouvelle fonctionnalité, une stratégie de mise en cache différente — 90 % devient le territoire des expulsions.

Il a quand même fait les calculs. Passage du r6g.large au m6g.large : deux nœuds à 0,127 $/heure contre deux nœuds à 0,090 $/heure, tournant 730 heures par mois. Large : 185 $/mois. La paire m6g : 131 $/mois. Économie potentielle : 54 $/mois. Il a testé le m6g.large en staging pendant deux semaines sous charge. La mémoire a culminé à 71 % — assez proche de la limite pour qu'il soit mal à l'aise.

Puis il a tarifé l'alternative : garder le cache.r6g.large, mais acheter des Nœuds Réservés (engagement d'un an). De 185 $/mois à la demande à 120 $/mois en Réservé. Économie : 65 $/mois sans changer le type d'instance.

« Les 65 $/mois que j'économiserais sur les Nœuds Réservés à la même taille d'instance sont une vraie économie », dit Tom. « Les 54 $/mois que j'économierais en passant au cache.m6g.large sont une fausse économie si ça risque le rush du dîner du vendredi — et ça n'économise même pas autant. Parfois, le redimensionnement vers une instance plus petite risque un incident de performance — les Nœuds Réservés nous donnent plus d'économies sans aucun risque. »

Il a acheté les Nœuds Réservés pour le r6g.large.

« Quand l'option plus sûre économise aussi plus », dit Tom, « ce n'est même pas un compromis. »

**Rétention des Sauvegardes RDS : Le Compromis de Stockage**

Les sauvegardes automatisées RDS sont stockées dans S3 (sans frais supplémentaires de stockage jusqu'à 100 % de la taille de votre base de données). La rétention par défaut est de 7 jours.

Pour la base de données Aurora de 180 Go de Nimbus, 7 jours de sauvegardes était approprié — ils avaient pu restaurer depuis une sauvegarde dans cette fenêtre lors des tests.

Mais Tom a remarqué : ils avaient également des instantanés manuels de chaque déploiement significatif, conservés indéfiniment.

23 instantanés manuels, total 4,1 To de stockage d'instantanés.
Coût : 0,021 $/Go/mois pour le stockage de sauvegarde Aurora = environ 87 $/mois en stockage d'instantanés manuels.

Ils ont gardé les 3 derniers instantanés manuels par environnement (production, staging). Supprimé le reste — environ 1,1 To conservés.
Économie : 64 $/mois.

« On payait 64 $ par mois pour une assurance qu'on n'a jamais utilisée », dit Leo.

« On payait pour la tranquillité d'esprit », rectifia Tom. « La question est : combien vaut cette tranquillité d'esprit à 64 $ par mois ? »

« Avec un plan de reprise après sinistre correct, » dit Priya, « vous pouvez avoir la même tranquillité d'esprit avec 7 jours de sauvegardes automatisées et 3 instantanés manuels. »

« Convenu. Maintenant. »

**Variation : Quand le Provisionné se Retourne Contre Vous**

Si votre modèle de trafic est cohérent et prévisible, la capacité provisionnée avec Auto Scaling économise 30 % par rapport au mode à la demande. Mais si une nouvelle fonctionnalité se lance et que votre volume d'écriture augmente de 5x du jour au lendemain, vous serez limités avant qu'Auto Scaling rattrape — Auto Scaling réagit au trafic observé, ce qui signifie qu'il y a un délai. Garder le mode à la demande pour les semaines entourant un lancement majeur de fonctionnalité est un compromis raisonnable : coût légèrement plus élevé, pas de risque de limitation pendant une période où vous regardez les modèles de trafic changer en temps réel.

Si vous éliminez les répliques de lecture inutilisées (comme les répliques PostgreSQL héritées de Nimbus), les économies sont immédiates et sans ambiguïté — il n'y a pas de compromis, car les répliques n'apportaient aucune valeur. Mais si vous êtes tentés d'éliminer une réplique de lecture qui ne gère que 2 % du trafic, vérifiez ce qui se passe pour le primaire quand ces 2 % n'ont nulle part où aller pendant un pic. Certaines répliques de lecture existent pour la marge, pas pour la charge actuelle.

À l'examen, la même logique s'applique : une charge à base stable pointe vers la capacité réservée ; instable et inactive pointe vers la demande ou Serverless.

**Le Résumé de l'Optimisation de la Base de Données**

| Service | Avant | Après | Économie mensuelle |
|---|---|---|---|
| Aurora (Serverless v2 conservé après analyse) | 647 $ | 647 $ | 0 $ (modèle correct) |
| Répliques de lecture RDS (inutilisées) | 340 $ | 0 $ | 340 $ |
| DynamoDB (À la demande → Provisionné + Auto Scaling) | 340 $ | 230 $ | 110 $ |
| ElastiCache (Nœuds Réservés) | 185 $ | 120 $ | 65 $ |
| Instantanés manuels Aurora | 87 $ | 23 $ | 64 $ |
| RDS Proxy (sécurité des connexions) | 0 $ | 88 $ | −88 $ |
| **Total** | **1 599 $** | **1 108 $** | **491 $/mois** |

491 $ par mois d'économies sur les bases de données. 5 892 $ par an.

Tom a mis ce chiffre à côté du nettoyage du stockage (6 200 $/an), des politiques de cycle de vie S3 du Chapitre 23 (7 800 $/an) et des économies du Plan d'Épargne (14 200 $/an).

Impact total de l'optimisation à ce jour : 34 092 $/an.

« C'est de vraie marge de manœuvre », dit Maya.

« Ou plusieurs expériences sérieuses », dit Priya.

« Ou douze mois d'expériences », dit Leo.

Tous les trois avaient raison.

## Points Forts et Limitations

**DynamoDB Provisionné avec Auto Scaling** :

- Moins cher que le mode à la demande pour les charges prévisibles et cohérentes
- Auto Scaling gère la variabilité sans sur-provisionnement permanent
- Nécessite une surveillance pour s'assurer que les limites de capacité restent appropriées

**Instances Réservées RDS / Nœuds Réservés ElastiCache** :

- Économies significatives pour les charges de travail stables et de longue durée
- Engagement verrouillé — si vos besoins changent, vous avez payé pour une capacité inutilisée
- Contrairement aux RI Standard EC2, les RI RDS **ne peuvent pas** être revendus sur le Marché des Instances Réservées — le Marché est uniquement pour EC2. Un RI RDS inutilisé est un coût irrécupérable, ce qui rend la décision de dimensionnement encore plus importante

**Le principe général** :

- Toujours comprendre l'utilisation avant d'optimiser — utiliser le p95, pas la moyenne
- Les ressources inutilisées (comme les répliques de lecture héritées) sont l'optimisation à plus fort retour
- Le bon dimensionnement nécessite de valider en staging avant d'appliquer en production, et de vérifier les modèles de charge saisonniers qui peuvent ne pas apparaître dans une fenêtre d'observation standard
- La tarification réservée nécessite de la confiance dans la stabilité de la charge de travail

## Résumé

L'audit de la base de données a comblé un écart de 491 $ par mois sans jamais toucher au moteur — les économies venaient du coffre : répliques inactives, instantanés oubliés et capacité tarifée pour des modèles de trafic que Nimbus avait dépassés. La discipline de Tom a tenu à travers chaque ligne : comprendre la charge de travail d'abord, puis optimiser. La seule nouvelle dépense, RDS Proxy, était une assurance que les chiffres de connexions du vendredi soir disaient qu'ils avaient besoin.

- **Auditer d'abord** : Extraire les métriques CloudWatch avant de faire des changements à la base de données. Utiliser la latence p95 et le CPU p95 — pas les moyennes. Vérifier FreeableMemory et les maximums de connexions.
- **Supprimer les ressources inutilisées** : Répliques de lecture, bases de données inactives et instances de test qui ne sont plus nécessaires.
- **Surveiller votre pool de connexions** : Définir des alarmes sur DatabaseConnections à 75 % et 90 % de la limite. Envisager RDS Proxy pour le multiplexage des connexions.
- **DynamoDB À la demande vs Provisionné** : À la demande pour le trafic imprévisible ; Provisionné + Auto Scaling pour les modèles cohérents.
- **Bon dimensionnement ElastiCache** : Tester en staging sous des charges de pointe réalistes, y compris les pics saisonniers. Les Nœuds Réservés offrent des économies à la même taille d'instance quand le redimensionnement agressif comporte des risques.
- **Gestion des instantanés RDS** : Garder uniquement les instantanés nécessaires. Les instantanés manuels sont conservés indéfiniment sauf suppression.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des Architectures Optimisées en Coûts (Domaine 4, Tâche 4.3)*

- **Modes de tarification DynamoDB** : À la demande = payer par requête (coût unitaire plus élevé, pas de minimum). Provisionné = payer par unité de capacité par heure (coût unitaire plus faible, doit allouer la capacité). **DynamoDB Auto Scaling** ajuste automatiquement la capacité provisionnée.
- **Instances Réservées RDS** : Disponibles pour tous les types de moteur RDS. Les déploiements Multi-AZ peuvent utiliser des Instances Réservées (vous vous engagez sur le Multi-AZ). Terme de 1 ou 3 ans.
- **Nœuds Réservés ElastiCache** : Même modèle d'engagement que les Instances Réservées EC2. Appliqués par nœud, pas par cluster.
- **Stockage des instantanés RDS** : Les sauvegardes automatisées sont gratuites jusqu'à 100 % de la taille de la base de données. Les instantanés manuels facturés par Go par mois dans S3. Scénario d'examen : « réduire les coûts de stockage RDS » → supprimer les anciens instantanés manuels.
- **Capacité réservée DynamoDB** : Également disponible pour DynamoDB (engagement sur une capacité de lecture/écriture spécifique pour 1 ou 3 ans avec une remise). Différent du provisionné standard — vous pré-payez la capacité sur toutes vos tables DynamoDB dans une région.
- **Aurora Serverless v2 vs provisionné** : Serverless v2 s'adapte automatiquement, idéal pour les charges variables. Le provisionné avec Instances Réservées est moins cher pour les charges stables et prévisibles.

## Exercices

**Exercice 1 — Rappel**

Expliquez quand vous devriez utiliser la capacité à la demande DynamoDB par rapport à la capacité provisionnée avec Auto Scaling. Quelle information avez-vous besoin pour prendre cette décision ?

*(Conseil : Pensez au moteur de voiture — s'engager dans la capacité provisionnée sans données de trafic est la vidange que vous sautez, tandis que rester sur le mode à la demande après 18 mois de modèles prévisibles revient à payer pour une révision dont vous n'avez pas besoin.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise gère une table DynamoDB pour le classement d'un jeu mobile. Le trafic est très cohérent tout au long de l'année, sauf lors d'un événement saisonnier planifié des mois à l'avance (une semaine par trimestre, atteignant 10x le trafic normal au fur et à mesure que les joueurs rejoignent le premier jour). La priorité de l'entreprise est de minimiser les coûts de base de données pendant les longues périodes stables et prévisibles tout en maintenant les performances pendant les semaines d'événements connus.

Quelle stratégie de capacité DynamoDB correspond LE MIEUX à ces exigences ?

A) Capacité à la demande pour gérer les pics saisonniers sans limitation
B) Capacité provisionnée définie aux niveaux saisonniers de pointe (toujours provisionnée pour 10x le trafic)
C) Capacité provisionnée avec DynamoDB Auto Scaling, avec une capacité maximale définie pour le pic saisonnier
D) Unités de capacité réservée DynamoDB pour 3 ans aux niveaux de trafic normaux

**Conseil 1** : « Trafic très cohérent sauf pour un pic saisonnier planifié et connu » — quel mode gère efficacement les deux ? (La force de la demande est le trafic *imprévisible* ; ce trafic est prévisible.)

**Conseil 2** : « Minimiser les coûts » hors pic signifie qu'on ne peut pas sur-provisionner pour 10x tout le temps.

**Conseil 3** : DynamoDB Auto Scaling peut monter pour l'événement saisonnier et redescendre après.

**Réponse** : C

**Explication** : La capacité provisionnée avec Auto Scaling adapte la table au trafic réel. Pendant les périodes normales, la capacité est aux niveaux normaux (faible coût). Pendant l'événement saisonnier — dont les dates sont connues à l'avance et dont le trafic se construit progressivement le premier jour — Auto Scaling suit la montée jusqu'au niveau maximum configuré (gérant le pic 10x), et l'équipe peut aussi augmenter le minimum avant le début planifié comme marge supplémentaire. Après l'événement, la capacité redescend. C'est moins cher que le mode à la demande pendant le régime stable qui domine l'année (à la demande coûte plus cher par requête) et moins cher que de toujours provisionner pour 10x.

**Pourquoi pas A ?** Le mode à la demande gère les pics sans limitation, mais sa force est le trafic *imprévisible*. Ici le trafic est très cohérent et le pic est planifié et progressif — payer la prime par requête du mode à la demande pour les ~92 % de l'année en régime stable va à l'encontre de l'objectif déclaré de minimiser les coûts pendant les périodes normales.

**Pourquoi pas B ?** Provisionner à 10x en permanence signifie que ~90 % de la capacité provisionnée est inutilisée pendant ~92 % de l'année — payer pour une capacité qui n'est jamais utilisée.

**Pourquoi pas D ?** Les unités de capacité réservée vous verrouillent aux niveaux de trafic normaux. Pendant l'événement 10x, vous seriez limités au-delà du montant réservé, ou vous auriez besoin d'ajouter du mode à la demande par-dessus.

*Domaine SAA-C03 : Concevoir des Architectures Optimisées en Coûts — Tâche 4.3*

**Exercice 3 — Défi d'Architecture** *(Optionnel)*

Nimbus évalue une nouvelle fonctionnalité : un tableau de bord d'analyse restaurant montrant les comptages de commandes en temps réel, les revenus par heure et les données démographiques des clients. Ces données interrogeraient une base de données environ 200 fois par minute (une requête par analyste par actualisation de page, avec 10 analystes).

Actuellement les données d'analyse sont dans Athena (S3). Devraient-ils construire le tableau de bord sur Athena, ou devraient-ils charger les données dans une base de données ? Si une base de données, laquelle (Aurora, DynamoDB, Redshift) ?

Considérez : la fréquence des requêtes, les exigences de fraîcheur des données, la complexité des requêtes (agrégations, jointures) et le coût par requête à ce volume.

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la sélection de base de données pour les charges de travail d'analyse.)*

## Scène Post-Générique

Tom a présenté le résumé complet de l'optimisation des coûts à Maya.

Trois mois de travail. 34 092 $ d'économies annuelles identifiées, la plupart déjà mises en œuvre.

« Qu'est-ce qui reste ? » demanda Maya.

« Des optimisations dont je ne suis pas encore certain », dit Tom. « La configuration Aurora pourrait peut-être être encore redimensionnée, mais je veux encore un trimestre de données avant de m'engager. Et il y a une question de transfert de données que je n'ai pas encore complètement analysée. »

« Les coûts de réseau. »

« Oui. C'est la prochaine étape. »

Maya regarda les chiffres. « Tom, je veux comprendre quelque chose. Cette optimisation — vous y avez consacré trois mois. C'est une partie significative de votre temps. »

« Environ 30 %. »

« Et vous avez trouvé environ 34 000 $ par an. Donc l'optimisation s'autofinance en — quoi, quelques mois de votre salaire ? »

Tom la regarda. « À peu près. »

« Et chaque année après, ce sont de pures économies. »

« Ou du pur réinvestissement », dit-il. « Même effet. »

Maya acquiesça. « C'est ce que je veux que vous fassiez. Pas seulement sur le stockage et les bases de données — sur tout. Faites de l'optimisation des coûts une fonction continue de votre rôle. »

Tom n'avait jamais entendu son travail décrit ainsi. Il trouvait ça à la fois exact et satisfaisant.

Dans le prochain chapitre : la dernière catégorie de coûts restante — et celle qui surprend presque tout le monde.
