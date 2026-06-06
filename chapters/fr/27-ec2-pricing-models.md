# Chapitre 27 : Payer pour ce dont vous avez besoin

Tom prépara un café avant d'ouvrir l'onglet de facturation. Il faisait toujours ainsi — certains rapports se lisaient mieux au chaud. Il s'installa dans le fauteuil près de la fenêtre, la tasse à la main, le calme du samedi matin régnant dehors. Pas de notifications, pas de réunion debout. Juste le tableur et les chiffres.

Il ouvrit l'onglet.

**Récapitulatif : de l'analyse d'Athena à la facture**

L'analytique Athena du chapitre précédent avait produit quelque chose d'inattendu : en interrogeant directement les rapports de coûts et d'utilisation depuis S3, Tom pouvait enfin voir non pas seulement un total de facture AWS, mais une ventilation de ce que chaque service coûtait réellement, semaine après semaine, sur six mois. Le tableau qui se dégageait était suffisamment clair pour être alarmant. EC2 était le poste le plus important, et le schéma était indéniable — l'équipe payait des tarifs de passage pour un hôtel qu'elle habitait à plein temps. Cette prise de conscience envoya Tom sur la page de tarification EC2 un samedi matin, avec un café frais et la détermination de comprendre chaque option avant l'arrivée de la prochaine facture mensuelle.

Tom avait examiné la facture AWS chaque mois depuis le démarrage de Nimbus. La première année, il comprenait à peu près 60 % de ce qu'il voyait. Désormais, il comprenait presque tout — sauf pourquoi la section EC2 lui donnait toujours l'impression qu'ils payaient trop cher. La section EC2 était un mélange d'« instances à la demande » de divers types d'instances, toutes tarifées à l'heure, s'additionnant toutes à 2 340 $/mois.

Avant d'appeler qui que ce soit, il passa une heure à parcourir lui-même la liste des instances — non pas pour conclure quoi que ce soit, mais pour formuler des hypothèses qu'il pourrait tester.

Il vit quatre instances r6g.large étiquetées « api-prod ». Il vit deux instances c6g.medium exécutant les processeurs de tâches en arrière-plan. Il vit une t3.medium libellée « vpn-server » qui tournait depuis le troisième mois d'existence de l'entreprise. Il vit une paire d'instances étiquetées « analytics-batch » qui apparaissaient à 3 h et disparaissaient avant 7 h chaque nuit.

Il écrivit une colonne d'hypothèses :

- Serveurs API : prévisibles, toujours en marche.
- Processeurs en arrière-plan : probablement prévisibles.
- Serveur VPN : toujours en marche, ne change jamais.
- Analytique par lots : éligible à Spot, peut-être ?

Puis il nota dans la marge : *vérifier chacune avant de décider quoi que ce soit.*

Cette discipline — séparer « ce que je suppose » de « ce que je sais » — était ce qui rendait les revues de coûts de Tom utiles. Il appela les autres.

« On pourrait simplement continuer à payer le tarif de passage, » dit Tom, quand les autres rejoignirent l'appel. « Mais on ne le fera pas. »

« Le tarif de passage ? » demanda Leo.

« La tarification à la demande, » dit Tom. « C'est comme réserver une chambre d'hôtel le matin où on en a besoin. Flexibilité maximale. Prix maximal. »

« Quelle est l'alternative ? »

**L'analogie de l'hôtel**

Tom y réfléchit un instant. « Tu sais comment certaines personnes réservent une chambre d'hôtel le matin de leur arrivée ? C'est nous en ce moment. Il y a de meilleures stratégies — réserver six mois à l'avance et obtenir une réduction, prendre une chambre invendue à la dernière minute pour une affaire en or, ou louer tout l'étage si on a besoin de tout l'étage. Même hôtel, quatre prix différents. »

Leo le regarda. « Et les versions AWS de tout ça, c'est quoi ? »

Tom ouvrit la page de tarification EC2. « Il y a quatre modèles de tarification. Et on n'en utilise qu'un. »

La tarification EC2 correspond étonnamment bien aux stratégies de réservation de chambres d'hôtel :

**À la demande** : Vous vous présentez à la réception sans réservation. Vous payez le tarif plein, mais vous pouvez partir quand vous voulez. Parfait pour les séjours imprévisibles.

**Instances réservées / Savings Plans** : Vous réservez une chambre pour toute l'année à l'avance. Vous obtenez une réduction significative — de 30 à 72 % — en échange d'un engagement à l'utiliser.

**Instances Spot** : Vous prenez une chambre invendue au tarif fortement réduit pratiqué par l'hôtel — pas de négociation, l'hôtel fixe le prix en fonction de son taux de vacance. Jusqu'à 90 % de réduction. Mais l'hôtel peut vous demander de partir avec deux minutes de préavis s'il a besoin de la chambre pour un client au tarif plein. (Il y a des années, il fallait *enchérir* pour la capacité Spot ; AWS a supprimé les enchères en 2017 — vous payez simplement le prix Spot en vigueur.)

**Hôtes dédiés** : Vous louez l'étage entier de l'hôtel exclusivement pour vous. Aucun partage avec d'autres clients. Nettement plus cher. Requis lorsque des règles de licence logicielle ou de conformité interdisent le partage d'un hôte physique.

Chaque modèle a un cas d'utilisation. L'erreur que commettait Nimbus : utiliser À la demande pour tout, y compris des charges de travail qui tournaient 24 h/24 et étaient entièrement prévisibles.

**Instances à la demande : flexibilité maximale, coût maximal**

**Quand les utiliser** :

- Charges de travail imprévisibles (pics de trafic que vous ne pouvez pas prévoir)
- Développement et tests (démarrages et arrêts fréquents)
- Charges de travail à court terme (exécuter une expérience pendant une semaine)
- Premier déploiement (avant de comprendre vos modèles d'utilisation)

**Quand ne pas les utiliser** :

- Charges de travail de production en état stable que vous savez devoir tourner pendant plus d'un an
- Tout ce qui présente une charge de base prévisible

**Mise en veille prolongée EC2 : suspendre sans perdre l'état**

Une technique d'optimisation des coûts qui ne reçoit pas assez d'attention est la **mise en veille prolongée EC2** (hibernation). Quand vous arrêtez une instance ordinaire, le contenu de la RAM disparaît — le démarrage suivant est un démarrage à froid. Le système d'exploitation démarre, l'application s'initialise, les connexions à la base de données se rétablissent. Pour la plupart des serveurs web de production, c'est acceptable. Pour certaines charges de travail, c'est coûteux.

Quand vous mettez une instance en veille prolongée, le contenu de la RAM est enregistré sur le volume racine EBS avant l'arrêt. Au démarrage suivant, l'instance reprend exactement là où elle s'était arrêtée — processus en cours, connexions établies, état applicatif intact — en une fraction du temps qu'aurait pris un démarrage à froid. C'est particulièrement utile pour les longues tâches d'analyse que vous voulez suspendre pour la nuit sans perdre l'état, ou pour les instances de développement qui mettent plusieurs minutes à démarrer et à configurer leur environnement.

« J'ai une instance de data science, » dit Leo, en regardant l'impression. « Elle met neuf minutes à démarrer. Environnement personnalisé, une douzaine de paquets Python, quelques poids de modèle préchargés. Je l'arrête chaque soir et la redémarre chaque matin. »

« Donc tu passes neuf minutes à la regarder démarrer chaque jour, » dit Tom.

« Oui. »

« Ça fait 45 minutes par semaine de temps d'ingénierie à attendre une instance EC2. »

« Oui. »

« Mets-la en veille prolongée. »

Avec la veille prolongée, l'instance de Leo se suspendait en fin de journée, enregistrait sa RAM sur le volume racine EBS, et reprenait en moins de 90 secondes le lendemain matin. Les sessions d'analyse se poursuivaient exactement là où il les avait laissées.

Exigences de la veille prolongée : la veille prolongée doit être **activée au lancement** — vous ne pouvez pas l'activer pour une instance déjà en cours d'exécution (Leo dut relancer sa machine de data science depuis une AMI pour l'obtenir). Les instances doivent avoir une RAM allant jusqu'à 150 Go (le contenu de la RAM doit tenir sur le volume racine EBS), le volume racine doit être assez grand pour contenir à la fois le système d'exploitation et la copie de la RAM, et le volume racine doit être chiffré (la veille prolongée enregistre sur disque des données sensibles en mémoire). Les instances bare-metal et les instances avec plus de 150 Go de RAM ne prennent pas en charge la veille prolongée. Une limite supplémentaire : une instance peut rester en veille prolongée pendant **60 jours** au maximum — après quoi elle doit être démarrée, arrêtée ou résiliée ; elle ne peut pas dormir indéfiniment.

Tom identifia les instances à la demande de Nimbus :

- Serveurs API web : 4 instances EC2, tournant 24 h/24 depuis 18 mois. *Base prévisible.*
- Serveur VPN : Toujours en marche. *Base prévisible.*
- Serveurs API supplémentaires pour les pics de trafic : Imprévisibles. *À la demande est correct ici.*

« Attends — mais *pourquoi* les serveurs de pic resteraient-ils en À la demande ? » demanda Maya. « Si on a des pics chaque vendredi, n'est-ce pas assez prévisible pour s'engager ? »

Tom y réfléchit. « La base est prévisible. Le pic est prévisible dans le temps, mais pas dans son ampleur. Certains vendredis soir sont 30 % au-dessus de la normale ; d'autres sont 150 % au-dessus. Si j'achète de la capacité réservée pour six instances et qu'un pic n'en demande que deux de plus, j'ai trop engagé. Si j'achète pour deux et que le pic en demande huit, je suis à court et le surplus tourne en À la demande de toute façon. Pour la capacité de pointe spécifiquement, À la demande ou Spot est correct — tu ne peux pas acheter une instance réservée en temps réel quand le trafic commence à grimper. »

Il y a une raison pour laquelle la liste « quand ne pas utiliser » compte : si vous faites tourner les mêmes instances depuis six mois et que vous pouvez prévoir qu'elles continueront, chaque mois en À la demande est un mois où vous payez le tarif de passage pour une chambre que vous occupez en permanence.

**Instances réservées : l'engagement d'un an**

Les **instances réservées (RI)** sont un engagement de facturation — vous acceptez d'utiliser un type d'instance spécifique dans une région spécifique pendant 1 ou 3 ans. En échange, AWS facture un tarif horaire plus bas.

**Niveaux de réduction** :

- 1 an, sans avance : ~30-40 % de réduction vs À la demande
- 1 an, avance partielle : ~35-45 % de réduction (payer une partie maintenant, moins à l'heure)
- 1 an, toute avance : ~40-50 % de réduction (payer l'année complète maintenant)
- 3 ans, toute avance : ~55-72 % de réduction (réduction maximale, engagement maximal)

**RI Standard vs Convertibles** :

- **Standard** : Verrouillées sur le type d'instance et la région exacts. Peuvent être vendues sur le Reserved Instance Marketplace si vous n'en avez plus besoin.
- **Convertibles** : Peuvent changer de type d'instance, de système d'exploitation et de location pendant la période d'engagement. Réduction moindre que Standard (jusqu'à ~66 % vs 72 %).

Tom fit le calcul pour les 4 serveurs API (r6g.large, environ 0,101 $/heure À la demande) :

- Coût annuel À la demande : 0,101 $ × 24 × 365 × 4 ≈ 3 540 $
- RI 1 an toute avance (1 instance) : ~520 $ d'avance (≈41 % de réduction)
- 4 instances : ~2 080 $ d'avance = **environ 1 460 $ économisés la première année**

« On pourrait économiser presque mille cinq cents dollars la première année juste en s'engageant, » dit Tom. « Combien ça coûte par mois, exactement — chaque instance réservée comparée à ce qu'on paie maintenant ? »

« C'est chargé en début de période, » dit Maya. « Tu paies l'année complète d'avance. »

« Attends — mais *pourquoi* s'engagerait-on sur une RI Standard si les types d'instances évoluent encore ? » demanda Maya. « Et si r6g devient obsolète l'an prochain ? »

« On prend des RI Convertibles si on pense qu'on pourrait avoir besoin de changer. Moins de réduction — jusqu'à ~66 % au lieu de 72 % — mais la flexibilité de changer de famille d'instances pendant la période d'engagement. »

« Et si AWS sort un meilleur type d'instance après notre engagement ? »

« On vérifie quand la RI expire. Si le nouveau type est meilleur, on achète une nouvelle RI pour le prochain terme. La RI actuelle suit son cours jusqu'au bout au prix engagé. »

Tom afficha la comparaison de seuil de rentabilité sur l'écran partagé pour que tout le monde puisse suivre :

**Comparaison à trois : r6g.large, 4 instances, 12 mois**

| Option | Coût annuel | Équivalent mensuel | Flexibilité |
|---|---|---|---|
| À la demande (0,101 $/h × 4) | 3 540 $ | 295 $ | Totale |
| Compute Savings Plan (~34 % de réduction sur 1 an, 0,27 $/h engagé) | 2 365 $ | 197 $ | Élevée |
| RI Standard, 1 an toute avance (4 × 520 $) | 2 080 $ | 173 $ | Faible |

« Attends, » dit Leo. « La RI est moins chère que le Savings Plan ? »

« À terme égal, oui — c'est le prix de la flexibilité, » dit Tom. « Un Compute Savings Plan s'applique à *n'importe quel* type d'instance, taille, région, même Fargate et Lambda, donc sa réduction maximale est plus basse — jusqu'à 66 % au palier 3 ans. Une RI Standard, ou un EC2 Instance Savings Plan, te verrouille sur une famille d'instances et te paie pour ce verrouillage avec des réductions jusqu'à 72 %. Plus tu gardes de liberté, moins AWS te fait de réduction. »

« Quel est le seuil de rentabilité pour la RI 3 ans ? »

« 3 ans toute avance : environ 1 060 $ par instance, donc 4 240 $ au total pour les quatre — ça achète 36 mois. Équivalent mensuel : 118 $, contre 295 $ en À la demande. L'avance se rembourse vers le quatorzième mois ; après ça, tu es en territoire d'économies pour presque deux années de plus. »

« Donc si on décide au quatrième mois qu'on a besoin d'une famille d'instances différente, » dit Priya, « on paie quand même l'engagement initial. »

« Exact. Tu peux vendre des RI Standard sur le RI Marketplace, mais pas toujours à leur pleine valeur. Les RI Convertibles peuvent être échangées mais pas vendues. C'est pour ça que le Savings Plan est souvent le choix le plus sûr — même principe, moins de verrouillage. »

**Savings Plans : l'engagement flexible**

Les **Savings Plans** sont une alternative plus récente et plus flexible aux instances réservées. Au lieu de vous engager sur un type d'instance spécifique, vous vous engagez sur un *montant spécifique de dépenses horaires* (en dollars).

**Compute Savings Plans** : S'appliquent à n'importe quelle instance EC2, quel que soit le type, la taille, la région ou le système d'exploitation. Le plus flexible. Jusqu'à 66 % de réduction.

**EC2 Instance Savings Plans** : S'appliquent à une famille d'instances spécifique dans une région (par exemple, « instances c6g dans us-west-2 »). Plus restrictifs que Compute, mais jusqu'à 72 % de réduction (identique au maximum des RI).

**SageMaker Savings Plans** : Spécifiques à l'entraînement et à l'inférence ML SageMaker.

Pour Nimbus : Compute Savings Plans pour leurs serveurs API. Ils se sont engagés sur 0,45 $/heure de dépenses de calcul. N'importe quel type d'instance, n'importe quelle taille — et l'engagement couvre aussi Fargate et Lambda, ce qui comptait pour la suite. Quand ils font évoluer la flotte ou changent de type d'instance, le Savings Plan s'applique toujours.

« C'est mieux que les instances réservées pour nous, » dit Leo. « On expérimente encore les types d'instances. Le Compute Savings Plan nous donne la réduction sans nous verrouiller spécifiquement sur r6g. »

« Que se passe-t-il quand on s'engage sur 0,45 $/heure et qu'on n'utilise que 0,36 $ certains mois ? » demanda Maya.

« Tu paies 0,45 $ quoi qu'il arrive, » dit Tom. « L'engagement est inconditionnel. Le Savings Plan s'applique à toute l'utilisation que tu as jusqu'au montant engagé. Tout ce qui dépasse tourne aux tarifs À la demande. La discipline consiste à fixer l'engagement à un niveau que tu es sûr d'atteindre toujours. »

« Et on ne devrait pas s'engager sur notre moyenne — on devrait s'engager sur notre plancher, » dit Priya.

« Exactement. Regarde les six derniers mois. Trouve la semaine la plus basse. Engage-toi sur 90 % de ce chiffre. Puis révise trimestriellement à mesure qu'on grandit. »

« Avez-vous réfléchi à ce qui se passe si on s'engage trop ? » poursuivit Priya. « On achète un plan à 2 $/heure, puis le trimestre suivant on optimise et notre utilisation de calcul tombe à 1,50 $ ? »

« L'écart de 0,50 $/heure devient du gaspillage, » dit Tom. « On paie pour une capacité qui n'existe plus. C'est le risque de fixer l'engagement trop haut. La revue trimestrielle sert précisément à attraper ça — si notre utilisation est tombée sous l'engagement, on sait que le prochain achat devrait être plus petit. Une nuance importante : un Savings Plan *Compute* te suit vers Fargate et Lambda — migrer des charges EC2 vers des conteneurs ne le laisserait pas orphelin. Ce qui laisse un engagement orphelin, c'est d'utiliser réellement moins de calcul, ou de détenir un *EC2 Instance* Savings Plan ou une RI pour une famille d'instances que tu as cessé d'utiliser. »

Vous vous demandez peut-être : pourquoi ne pas toujours acheter des Savings Plans au montant maximal abordable et laisser AWS gérer le reste ? La réponse est que l'engagement est un plancher, pas un plafond. Si vous vous engagez sur 5 $/heure mais n'utilisez que 3 $/heure, vous payez 5 $/heure. Chaque dollar de dépense engagée qui ne correspond pas à l'utilisation réelle est un dollar gaspillé. La revue trimestrielle n'est pas optionnelle — c'est ce qui maintient le Savings Plan comme une optimisation plutôt qu'un sur-engagement.

**Instances Spot : la réduction de 90 %**

Les **instances Spot** utilisent la capacité EC2 de secours d'AWS. Quand AWS a des serveurs inutilisés, vous pouvez les louer à 60-90 % en dessous du prix À la demande. Quand AWS a besoin de récupérer la capacité (pour des clients À la demande ou Réservés), il vous donne un préavis de 2 minutes et résilie votre instance.

Vous vous demandez peut-être : qui concevrait un système autour d'instances qui peuvent disparaître avec deux minutes de préavis ? La réponse est : quiconque dont le travail peut être recommencé depuis zéro. Tâches par lots, analytique, pipelines de rendu — aucun de ceux-ci n'exige que l'instance spécifique qui a commencé le travail soit celle qui le termine. Le préavis de 2 minutes suffit pour enregistrer un point de contrôle, drainer les connexions et quitter proprement.

Le risque d'interruption est la caractéristique déterminante. Les instances Spot ne sont appropriées que pour :

- **Les charges de travail tolérantes aux pannes** : Si une instance est résiliée au milieu d'une tâche, la tâche peut redémarrer sans rien corrompre
- **Le traitement sans état** : Redimensionnement d'images, encodage vidéo, analytique par lots, entraînement ML
- **Les tâches par lots à courte durée** : Le préavis de 2 minutes suffit pour enregistrer l'état et créer un point de contrôle
- **Les flottes mixtes Auto Scaling** : Utiliser Spot pour la majorité de votre ASG avec À la demande comme base

Pour Nimbus : Les instances Spot avaient du sens pour les tâches analytiques par lots qui tournaient chaque nuit (transformation des données de commandes de la journée en rapports agrégés). Si une instance Spot est résiliée en cours de tâche, la tâche échoue, mais elle redémarre depuis le début sur une nouvelle instance. Les données dans S3 sont en sécurité.

Mais Leo l'apprit à ses dépens avant que l'équipe ne comprenne pleinement le schéma.

Trois mois plus tôt, il avait déplacé la tâche par lots nocturne vers Spot sans intégrer de logique de point de contrôle. La première nuit, l'instance Spot tourna bien. La deuxième nuit, elle fut interrompue à 4 h 47 — quarante-sept minutes après le début d'une tâche qui prenait une heure vingt à se terminer. La tâche échoua. Le rapport final des commandes de la veille manquait quand les partenaires restaurateurs se connectèrent ce matin-là.

« Je l'ai déjà déployée — oh, » avait dit Leo, en regardant la notification de tâche échouée. « Je supposais que ça irait. Ça allait la première nuit. »

« Que s'est-il passé ? » avait demandé Maya.

« Interruption Spot. AWS avait besoin de récupérer la capacité, nous a donné deux minutes, l'instance a été résiliée. La tâche n'avait pas de point de contrôle. Quand une nouvelle instance Spot a été lancée à 5 h pour réessayer, elle est repartie de zéro. Terminée à 6 h 40. Les rapports avaient deux heures de retard. »

Le correctif était simple : écrire les résultats intermédiaires dans S3 toutes les quinze minutes. Chaque point de contrôle était un état partiel complet — suffisant pour qu'une nouvelle instance lise le dernier point de contrôle et continue à partir de là plutôt que de tout recommencer depuis le début.

« Utiliser Spot pour la tâche nocturne a fait passer son coût de 12 $/nuit à 2 $/nuit, » rapporta Leo, une fois le correctif en place. « Même avec la mauvaise nuit, le coût total de son exécution sur trois mois était inférieur à deux semaines de tarification À la demande. »

« Ça ira, » ajouta Leo, « même si elle est interrompue en cours d'exécution — pas vrai ? »

« Avec les points de contrôle en place, oui, » dit Tom. « Sans eux, non. La tolérance à l'interruption doit être intégrée dans la tâche, pas supposée. »

« Et si quelqu'un essaie de s'introduire ? » demanda Priya. « L'instance Spot est sur du matériel partagé. Si elle est interrompue et qu'une nouvelle est lancée, y a-t-il une exposition de données entre instances ? »

« Non, » dit Tom. « AWS efface le stockage d'instance à la résiliation. Le client suivant qui reçoit ce matériel voit une ardoise vierge. Mais c'est un bon réflexe — chaque fois que tu utilises de la capacité partagée, ça vaut la peine de vérifier le modèle d'isolation. »

**Diversification de la Spot Fleet**

Leo avait appris une chose de plus de la tâche par lots interrompue : quand vous demandez un seul type d'instance Spot, vous pariez sur la disponibilité de ce type spécifique dans cette AZ. Si la capacité Spot pour c5.2xlarge dans us-west-2a est épuisée, votre tâche attend — ou échoue.

La **Spot Fleet** résout cela en vous laissant spécifier plusieurs types d'instances et AZ dans une seule requête. AWS satisfait la flotte à partir de la combinaison qui dispose de capacité au prix le plus bas.

```
Spot Fleet request:
  Target capacity: 4 units
  Fleet diversification:
    - c5.2xlarge, us-west-2a
    - c5.2xlarge, us-west-2b
    - c5a.2xlarge, us-west-2a
    - m5.2xlarge, us-west-2a
    - c5d.2xlarge, us-west-2b
  Allocation strategy: diversified
```

Avec une flotte diversifiée, une interruption dans un type d'instance ou une AZ n'affecte qu'une partie de la flotte. Le reste continue de tourner. Pour la tâche par lots de Nimbus, faire tourner une Spot Fleet de quatre instances au lieu d'une seule grosse instance signifiait que même une interruption partielle permettait à la tâche de se terminer — plus lentement, mais sans le redémarrage complet.

« La flotte diversifiée tend aussi à obtenir une meilleure tarification, » dit Tom. « AWS te donne le prix le plus bas parmi tous les types de ta flotte. Certaines nuits, tu obtiens du c5a à un prix inférieur au c5 parce que la capacité s'y trouvait. »

« Combien ça coûte par mois comparé à l'utilisation d'un seul type d'instance ? » se demanda Tom à voix haute — l'habitude était désormais complètement réflexe. Il calcula le chiffre. La Spot Fleet à tarification mixte revenait en moyenne à 1,80 $/nuit contre 2,00 $/nuit avec une requête à type unique. Petite différence en valeur absolue, mais l'amélioration de la fiabilité à elle seule justifiait le changement.

« Et si quelqu'un essaie de s'introduire dans la Spot Fleet ? » demanda Priya.

« Même réponse que toujours, » dit Tom. « Chaque instance est isolée des autres. La flotte ne les place pas automatiquement sur un segment privé partagé. Tes groupes de sécurité s'appliquent toujours à chaque instance individuellement. »

Les points de contrôle avaient rendu les interruptions gérables, pas éliminées. La tâche redémarrait toujours depuis le dernier point de contrôle, et si le redémarrage coïncidait avec une période de pics de prix Spot, l'instance de remplacement pouvait mettre 10 à 20 minutes à devenir disponible. Le travail déjà couvert par le dernier point de contrôle était sauté au redémarrage ; le travail effectué depuis était refait. Surcoût total de retraitement : faible, mais réel.

La Spot Fleet résolut proprement le problème de disponibilité. En spécifiant cinq types d'instances répartis sur trois AZ, Leo réduisit la probabilité d'un manque total de capacité à presque zéro. La stratégie d'allocation d'AWS — diversifiée — répartissait la flotte de quatre instances sur les pools, de sorte que l'interruption d'aucun pool ne pouvait arrêter la tâche. Quand une instance était interrompue, les trois restantes continuaient le traitement, et le point de contrôle faisait que l'instance de remplacement ne reprenait que le travail que l'instance interrompue était en train de traiter. De bout en bout, la tâche ne rata plus jamais son échéance de rapport de 7 h.

« Qu'est-ce que la diversification a coûté en complexité ? » demanda Maya, quand Leo documenta cela.

« Trois lignes supplémentaires dans la requête Spot Fleet, » dit Leo. « Le code de traitement ne sait pas et ne se soucie pas du type d'instance sur lequel il tourne. La complexité réside entièrement dans la configuration de la flotte, pas dans l'application. »

C'était l'avantage de concevoir l'application sans état dès le départ : les décisions de mise à l'échelle et de tolérance aux pannes devenaient des décisions d'infrastructure, pas des décisions de code.


**Hôtes dédiés : l'option de conformité**

Certaines licences logicielles (Oracle, Windows Server dans certaines configurations) sont tarifées par socket ou cœur physique. Quand vous exécutez ce logiciel sur un hôte partagé (la valeur par défaut pour EC2), vous pourriez payer pour une capacité que vous n'utilisez pas.

Les **hôtes dédiés** vous donnent accès à un serveur physique entièrement réservé à votre usage. Vous pouvez apporter vos licences existantes par socket. Aucune instance d'un autre client AWS ne tourne sur le même matériel.

Les hôtes dédiés sont nettement plus chers que l'EC2 standard. Ce sont un outil de conformité et de licence, pas un outil d'optimisation des coûts.

Nimbus n'avait aucune exigence de licence nécessitant des hôtes dédiés. La plupart des applications cloud-native n'en ont pas.

**Variation : quand l'engagement se retourne contre vous**

Si votre charge de travail est prévisible et stable pendant 12 mois, les instances réservées offrent la réduction maximale — mais si vos besoins en types d'instances peuvent changer significativement durant cette période, ce verrouillage vous coûtera une flexibilité valant plus que l'écart de prix. Les RI Convertibles résolvent une partie de cela, mais à une réduction réduite. Les Compute Savings Plans en résolvent la plupart, à une réduction maximale légèrement inférieure à celle des RI Standard.

Si vous utilisez des instances Spot pour des tâches par lots tolérantes aux pannes, vous pouvez atteindre 60-90 % d'économies — mais si les mêmes instances servent des requêtes utilisateur en direct, une interruption en cours de requête signifie des transactions échouées et des clients mécontents. La tolérance de la charge de travail à l'interruption est la variable décisive.

Il y a un cas de mauvais choix plus subtil : le sur-engagement d'un Savings Plan. Si vous achetez un Compute Savings Plan à 3,00 $/heure parce que votre utilisation de calcul a tourné en moyenne à 3,00 $/heure le trimestre dernier, puis que vous optimisez vos services ce trimestre (faisant tomber l'utilisation totale à 1,80 $/heure), vous payez les 3,00 $/heure engagés quoi qu'il arrive. L'écart de 1,20 $/heure est du gaspillage. (Notez que déplacer des charges EC2 vers Fargate ou Lambda ne laisserait *pas* un Compute Savings Plan orphelin — il couvre les trois. Les risques d'orphelinat sont une réduction réelle de l'utilisation, ou le verrouillage de famille avec les EC2 Instance Savings Plans et les RI.) C'est pourquoi la stratégie du plancher compte : engagez-vous sur votre minimum, pas sur votre moyenne. Et révisez trimestriellement.

La règle : engagez-vous sur ce dont vous êtes certain. Utilisez À la demande pour ce dont vous ne l'êtes pas. Utilisez Spot uniquement pour ce qui peut survivre à un arrêt brutal.

**Construire une flotte mixte**

L'approche mature : utiliser plusieurs modèles de tarification ensemble.

Pour la flotte API de Nimbus :

- **Charge de base (4 instances, toujours en marche)** : Couverte par l'engagement Savings Plan
- **Pic prévisible (2 instances supplémentaires pendant les heures de bureau)** : Couvert par le Savings Plan si l'engagement les couvre, sinon À la demande
- **Dépassement lors des pics de trafic** : Instances Spot (acceptable parce que les serveurs API sont sans état — les requêtes se redistribuent si une instance est résiliée)

Résultat : une flotte qui optimise les coûts à chaque couche — tarification engagée pour la partie prévisible, À la demande pour la croissance imprévisible, Spot pour la capacité de pointe.

**Surveiller l'utilisation du Savings Plan**

Acheter un Savings Plan n'est pas la fin du travail. C'est le début d'une obligation récurrente : savoir si l'engagement est bien rentabilisé.

Tom programma un rappel de calendrier pour le premier lundi de chaque trimestre : revue d'utilisation du Savings Plan. L'outil était AWS Cost Explorer. Plus précisément, l'onglet « Savings Plans » sous « Reservations and Savings Plans », qui affichait trois chiffres qui l'intéressaient :

- **Taux d'utilisation** : Quel pourcentage de la dépense engagée était effectivement couvert par de l'utilisation éligible ? Un chiffre inférieur à 100 % signifiait qu'il payait pour un engagement non utilisé.
- **Taux de couverture** : Quel pourcentage de l'utilisation EC2 éligible était couvert par le Savings Plan, par opposition à ce qui tournait aux tarifs À la demande ? Un chiffre inférieur à 80 % signifiait qu'il y avait de l'utilisation non couverte qu'un engagement plus important capturerait.
- **Dépense À la demande** : La part de la dépense EC2 non couverte par aucun Savings Plan. Si elle augmentait, soit le Savings Plan était sous-dimensionné, soit de nouvelles charges de travail avaient été ajoutées hors du périmètre de l'engagement.

À la première revue trimestrielle, les chiffres ressemblaient à ceci :

- Utilisation : 97 %. Trois pour cent de la dépense engagée restaient non couverts — 9,90 $ par mois sur un engagement de 330 $/mois. C'était acceptable ; cela signifiait que l'engagement était fixé légèrement au-dessus de l'utilisation plancher réelle, ce qui était intentionnel.
- Couverture : 84 %. Seize pour cent de l'utilisation EC2 éligible tournaient en À la demande. C'était la capacité de pointe — les instances de dépassement qui démarraient pendant les pics de trafic et n'étaient pas couvertes par l'engagement.
- Dépense EC2 À la demande : 147 $/mois. Les instances Spot (non couvertes par les Savings Plans, tarifées séparément) représentaient l'essentiel du reste.

« L'utilisation à 97 % est saine, » dit Tom. « Ça veut dire qu'on n'est pas sur-engagés. Si c'était 80 %, je saurais qu'on a trop acheté. »

« Et 84 % de couverture ? » demanda Maya.

« C'est bien aussi. Les 16 % en À la demande sont la capacité de pointe — des instances qui tournent quelques heures pendant les pointes, pas toute la journée. Il faudrait acheter beaucoup plus d'engagement Savings Plan pour les couvrir, et elles ne le justifient peut-être pas. » Il fit le calcul : les instances À la demande non couvertes tournaient peut-être 40 heures par mois à 0,101 $/heure par instance. Les couvrir avec un Savings Plan exigerait un engagement qu'on sous-utiliserait 90 % du temps. Mieux vaut les laisser en À la demande.

À la deuxième revue trimestrielle, six mois plus tard, un indicateur avait changé : la dépense EC2 À la demande était passée à 290 $/mois. La fonctionnalité Nimbus Instant avait été lancée, et plusieurs nouvelles instances de service en arrière-plan avaient été ajoutées sans que Tom le remarque.

« Ces trois instances, » dit Tom, en pointant la ventilation de Cost Explorer. « Elles tournent en À la demande depuis trois mois. Si elles vont continuer à tourner, on devrait les ajouter à l'engagement Savings Plan. »

La revue trimestrielle l'avait attrapé. Sans la revue, ces trois instances auraient continué aux tarifs de passage indéfiniment.

« Comment ajustes-tu l'engagement ? » demanda Priya.

« Tu achètes un nouveau Savings Plan supplémentaire par-dessus l'existant, » dit Tom. « Les Savings Plans s'empilent. J'ajouterais un Compute Savings Plan de 0,10 $/heure pour la nouvelle base. Le plan existant de 0,45 $/heure continue jusqu'à la fin de son terme de trois ans. Le nouveau plan démarre son propre terme de trois ans. »

« Donc on aurait deux Savings Plans qui se chevauchent. »

« Oui. Ils s'appliquent indépendamment à toute l'utilisation éligible qui existe. AWS les applique du plus avantageux au moins avantageux. »

« Avez-vous réfléchi à ce qui se passe si on vend l'un de ces services en arrière-plan l'an prochain ? » demanda Priya. « On s'est engagés sur 0,55 $/heure pendant trois ans. »

« C'est le risque du terme de trois ans, » dit Tom. « C'est pourquoi le nouvel engagement est plus petit — je m'engage sur le plancher des nouvelles charges de travail, pas sur la moyenne. Si on désaffecte un service et que l'utilisation baisse, les services restants devraient quand même consommer le montant engagé complet. »

La discipline de la revue trimestrielle n'était pas glamour. C'était quinze minutes dans Cost Explorer, trois chiffres vérifiés, une décision prise ou reportée. Mais sur trois ans, cette discipline faisait la différence entre un Savings Plan qui offrait plus de 90 % d'utilisation — de vraies économies — et un qui dérivait vers un gaspillage partiel à mesure que l'infrastructure évoluait autour de lui.

## Points forts et limites

**À la demande** : Pas d'engagement. Plein prix. À utiliser pour les charges de travail imprévisibles ou à court terme.

**Instances réservées** : Jusqu'à 72 % de réduction. Verrouillées sur le type d'instance/région/OS spécifique. Vendez la capacité inutilisée sur le RI Marketplace.

**Savings Plans** : Jusqu'à 66-72 % de réduction. Plus flexibles que les RI (les Compute Savings Plans s'appliquent à n'importe quel type d'instance). Application automatique à l'utilisation correspondante.

**Instances Spot** : Jusqu'à 90 % de réduction. Risque d'interruption de 2 minutes. Uniquement pour les charges de travail tolérantes aux pannes, sans état et interruptibles.

**Hôtes dédiés** : Serveur physique complet. Le plus cher. Requis pour certains scénarios de licence ou de conformité.

## Résumé

Tom passa le reste du samedi à associer chaque charge de travail de Nimbus à son modèle de tarification idéal — la base aux Savings Plans, les tâches par lots nocturnes à Spot, le dépassement imprévisible à À la demande. L'exercice transforma trois mois de paiement du tarif de passage en une stratégie délibérée. Les chiffres, une fois calculés, étaient difficiles à ignorer.

- La tarification EC2 a quatre modèles : **À la demande** (plein prix, pas d'engagement), **instances réservées / Savings Plans** (dépense engagée pour une réduction significative), **Spot** (capacité de secours à 60-90 % de réduction, interruptible), **hôtes dédiés** (exclusivité du serveur physique).
- Les **Savings Plans** sont généralement préférés aux instances réservées pour la flexibilité.
- Les **instances Spot** nécessitent des charges de travail tolérantes aux pannes et sans état — uniquement pour les tâches par lots, l'entraînement ML et le traitement interruptible.
- Le **point de contrôle vers un stockage durable** (S3) est requis pour les tâches par lots basées sur Spot — les tâches interrompues devraient reprendre depuis le dernier point de contrôle, pas redémarrer de zéro.
- La **diversification de la Spot Fleet** sur plusieurs types d'instances et AZ réduit le risque d'interruption et donne souvent une meilleure tarification.
- La stratégie optimale est une **flotte mixte** : Savings Plans pour la base, À la demande pour la croissance imprévisible, Spot pour le travail par lots interruptible.
- Revoyez les modèles de tarification quand les charges de travail tournent de façon stable depuis 3+ mois — c'est à ce moment que À la demande commence à être du gaspillage.
- **Révisez les engagements Savings Plan trimestriellement** — engagez-vous sur votre plancher, pas sur votre moyenne, et ajustez à mesure que les modèles d'utilisation changent.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.2)*

- **Savings Plans vs Instances réservées** : Les Savings Plans sont plus flexibles (s'appliquent à n'importe quelle instance EC2 pour les Compute Savings Plans). Les instances réservées verrouillent sur un type d'instance spécifique. Scénarios d'examen : « besoin de flexibilité maximale tout en obtenant des réductions » → Savings Plans. « Connaître le type d'instance exact pour 3 ans » → RI Standard pour la réduction maximale.
- **Signaux Spot** : « sensible aux coûts », « tolérant aux pannes », « traitement par lots », « peut gérer les interruptions », « charges de travail sans état », « entraînement ML » → Spot.
- **Gestion de l'interruption Spot** : Les instances Spot reçoivent un préavis de 2 minutes avant la résiliation. Votre application doit gérer cela proprement (enregistrer l'état, drainer les connexions, quitter proprement).
- **À la demande vs Spot pour les serveurs web** : Les serveurs web servant du trafic utilisateur en direct ne doivent PAS utiliser Spot (l'interruption cause des requêtes échouées). Utilisez À la demande ou Savings Plans pour le niveau web.
- **EC2 Savings Plans vs Compute Savings Plans** : Les EC2 Savings Plans s'appliquent à une famille d'instances et une région spécifiques (réduction plus élevée). Les Compute Savings Plans s'appliquent à n'importe quelle instance EC2, Lambda et Fargate (réduction maximale plus faible, plus flexible).
- **RI Marketplace** : Les instances réservées Standard inutilisées peuvent être vendues à d'autres clients AWS. Les RI Convertibles ne peuvent pas être vendues.
- **Veille prolongée** : Enregistre le contenu de la RAM sur le volume racine EBS à l'arrêt ; le restaure au démarrage. L'instance reprend plus vite qu'un démarrage à froid avec tous les processus et l'état intacts. À utiliser quand l'état de l'instance doit être préservé entre les sessions. Exige : activation au lancement (ne peut pas être ajoutée à une instance existante), RAM ≤ 150 Go, volume racine EBS chiffré, non disponible pour les instances bare-metal ; maximum 60 jours en veille prolongée. Signal d'examen : « reprendre rapidement l'instance avec l'état en mémoire préservé » ou « l'instance de développement met trop de temps à s'initialiser » → Veille prolongée.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez quand les instances Spot sont appropriées et quand elles ne le sont pas. Quelle caractéristique rend une charge de travail adaptée à Spot ?

*(Indice : Réfléchissez à ce qui se passe quand l'instance est résiliée avec 2 minutes de préavis. Quelles charges de travail se rétablissent proprement ? Lesquelles ne le font pas ?)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une société de médias exploite un pipeline de transcodage vidéo qui convertit les vidéos téléversées en plusieurs formats. Les tâches de transcodage s'exécutent en continu chaque fois que des vidéos sont téléversées (opération 24 h/24, volume variable). Chaque tâche prend 5 à 30 minutes. Si une tâche de transcodage est interrompue, elle peut être redémarrée depuis le début sans perte de données. La société veut minimiser les coûts.

Quel modèle de tarification EC2 répond LE MIEUX à ces exigences ?

A) Instances à la demande dans un Auto Scaling Group  
B) Instances réservées (1 an, toute avance)  
C) Instances Spot avec Spot Fleet pour la diversification automatique des instances  
D) Hôtes dédiés avec les licences logicielles médias existantes de la société

**Indice 1** : « Peut être redémarrée depuis le début sans perte de données » — c'est la phrase clé qui permet un modèle de tarification spécifique.

**Indice 2** : « Minimiser les coûts » avec une charge de travail interruptible pointe vers l'option à réduction maximale.

**Indice 3** : Spot Fleet demande des instances de plusieurs types d'instances et AZ, réduisant le risque d'interruption.

**Réponse** : C

**Explication** : Les tâches de transcodage sont tolérantes aux pannes — elles peuvent être redémarrées si interrompues. Cela les rend idéales pour les instances Spot, qui offrent 60-90 % de réduction sur À la demande. Spot Fleet diversifie entre les types d'instances et les zones de disponibilité, réduisant la probabilité d'une interruption massive.

**Pourquoi pas A ?** À la demande est l'option la plus coûteuse. Pour une charge de travail tolérante aux pannes tournant en continu, c'est du gaspillage.

**Pourquoi pas B ?** Les instances réservées fournissent une réduction de 50-72 % mais n'offrent pas la réduction potentielle de 90 % de Spot pour les charges de travail tolérantes aux pannes. De plus, les RI sont pour les charges de travail prévisibles et en état stable — Spot est spécifiquement pour le traitement par lots interruptible.

**Pourquoi pas D ?** Les hôtes dédiés sont pour la conformité des licences, pas pour l'optimisation des coûts. C'est l'option la plus coûteuse.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

L'infrastructure de Nimbus a ces charges de travail :

1. Serveurs API : 6 instances, tournant 24 h/24, stables depuis 2 ans, utilisent r6g.large
2. Tâches analytiques nocturnes par lots : 4 instances, tournent de 3 h à 6 h chaque nuit, toujours le même type d'instance
3. Environnement de tests : 2 instances, utilisées par les ingénieurs de 9 h à 18 h en semaine
4. Dépassement lors des pics de trafic : 0 à 8 instances, démarrent pendant les heures de pointe, totalement imprévisibles

Concevez la stratégie de tarification optimale pour chaque type de charge de travail. Quel montant d'engagement Savings Plan couvrirait les charges de travail 1 et 2 ? Pour la charge de travail 3, y a-t-il une stratégie plus intelligente que À la demande ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la stratégie de tarification EC2.)*

## Scène post-générique

Tom soumit l'achat du Savings Plan.

Engagement de 0,45 $/heure. Terme de trois ans. Compute Savings Plans pour la flexibilité.

Combinées à la flotte Spot pour les lots nocturnes, les économies estimées : 42 500 $ sur trois ans — un peu plus de 14 000 $ par an.

Maya lut le chiffre. « Quarante-deux mille dollars. »

« Comparé à tout faire tourner en À la demande, sur trois ans. »

« Qu'est-ce que ça a coûté de faire ça ? »

« Un après-midi d'analyse, » dit Tom. « Et la décision de s'engager. »

« Trois ans, c'est long, » dit Leo. « Et si on change de type d'instance ? »

« Les Compute Savings Plans s'appliquent à n'importe quel type d'instance EC2. Et dans trois ans, on est assez grand pour que cette conversation soit de toute façon différente. »

Leo réfléchit à cela.

« Depuis combien de temps connais-tu les Savings Plans ? » demanda-t-il.

« Depuis le début, » dit Tom. « J'attendais que la charge de travail soit suffisamment stable pour s'engager. »

« Dix-huit mois à payer À la demande en attendant. »

« Oui. » Tom ferma la console. « Parfois, la chose la plus coûteuse que tu fais est d'attendre pour économiser de l'argent. »

Dans le prochain chapitre : la même discipline appliquée aux coûts de stockage, avec quelques surprises sur ce qui fait grimper la facture.
