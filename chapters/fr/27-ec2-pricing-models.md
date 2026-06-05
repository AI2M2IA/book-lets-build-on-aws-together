# Chapitre 27 : Payer Pour Ce Dont Vous Avez Besoin

Tom avait examiné la facture AWS chaque mois depuis que Nimbus avait démarré. La première année, il comprenait à peu près 60% de ce qu'il voyait. Maintenant, il comprenait presque tout — sauf la section EC2.

La section EC2 était un mélange d'« instances à la demande » à différents types d'instances, toutes tarifées à l'heure, s'additionnant toutes à 2 340 $/mois.

« Je sais qu'on a besoin de ces instances, » dit Tom. « Mais je ne comprends pas pourquoi on paie le tarif à la marche pour toutes. »

« Le tarif à la marche ? » demanda Leo.

« La tarification à la demande, » dit Tom. « C'est comme réserver une chambre d'hôtel le matin où vous en avez besoin. Maximum de flexibilité. Prix maximum. »

« Alors quelle est l'alternative ? »

Tom ouvrit la page de tarification EC2.

« Il y a quatre modèles de tarification, » dit-il. « Et on n'en utilise qu'un. »

**L'Analogie de l'Hôtel**

La tarification EC2 correspond étonnamment bien aux stratégies de réservation de chambres d'hôtel :

**À la demande** : Vous arrivez à la réception sans réservation. Vous payez le tarif plein, mais vous pouvez partir quand vous voulez. Parfait pour les séjours imprévisibles.

**Instances Réservées/Savings Plans** : Réserver une chambre pour toute l'année à l'avance. Vous obtenez une réduction significative — de 30 à 72% — en échange de vous engager à l'utiliser.

**Instances Spot** : Enchérir pour les chambres invendues au prix que l'hôtel est prêt à accepter au moment donné. Jusqu'à 90% de réduction. Mais l'hôtel peut vous demander de partir avec deux minutes de préavis s'il a besoin de la chambre pour un client au tarif plein.

**Hôtes Dédiés** : Louer l'étage entier de l'hôtel exclusivement pour vous. Pas de partage avec d'autres clients. Significativement plus cher. Requis quand les règles de licence logicielle ou de conformité interdisent le partage d'un hôte physique.

Chaque modèle a un cas d'utilisation. L'erreur de Nimbus : utiliser À la demande pour tout, y compris les charges de travail qui tournaient 24h/24 et étaient entièrement prévisibles.

**Instances À la Demande : Flexibilité Maximale, Coût Maximum**

**Quand utiliser** :

- Charges de travail imprévisibles (pics de trafic que vous ne pouvez pas prévoir)
- Développement et tests (démarrer et arrêter fréquemment)
- Charges de travail à court terme (exécuter une expérience pendant une semaine)
- Premier déploiement (avant que vous compreniez vos modèles d'utilisation)

**Quand ne pas utiliser** :

- Charges de travail de production en état stable que vous savez exécuter pendant plus d'un an
- Tout avec une charge de base prévisible

Tom identifia les instances à la demande de Nimbus :

- Serveurs API web : 4 instances EC2, tournant 24h/24 depuis 18 mois. *Base prévisible.*
- Proxy de base de données (RDS Proxy) : Toujours en marche. *Base prévisible.*
- Serveur VPN : Toujours en marche. *Base prévisible.*
- Serveurs API supplémentaires pour les pics de trafic : Imprévisibles. *À la demande est correct ici.*

**Instances Réservées : L'Engagement d'un An**

Les **Instances Réservées (RIs)** sont un engagement de facturation — vous acceptez d'utiliser un type d'instance spécifique dans une région spécifique pendant 1 ou 3 ans. En échange, AWS facture un tarif horaire plus bas.

**Niveaux de réduction** :

- 1 an, Sans Avance : ~30-40% de réduction vs À la demande
- 1 an, Avance Partielle : ~35-45% de réduction (payer une partie maintenant, moins à l'heure)
- 1 an, Toute Avance : ~40-50% de réduction (payer l'année complète maintenant)
- 3 ans, Toute Avance : ~55-72% de réduction (réduction maximale, engagement maximal)

**RIs Standard vs Convertibles** :

- **Standard** : Verrouillé sur le type d'instance et la région exacts. Peut être vendu sur le Marché des Instances Réservées si vous n'en avez plus besoin.
- **Convertible** : Peut changer le type d'instance, le système d'exploitation et la location pendant la période d'engagement. Moins de réduction que Standard (~50% max vs 72%).

Tom fit le calcul pour les 4 serveurs API (r6g.large, 0,252 $/heure À la demande) :

- Coût annuel À la demande : 0,252 × 24 × 365 × 4 = 8 820 $
- RI 1 an Toute Avance (1 instance) : ~1 600 $ d'avance
- 4 instances : ~6 400 $ d'avance = **2 420 $ économisés la première année**

« On pourrait économiser 2 420 $ la première année juste en s'engageant, » dit Tom.

« C'est un engagement, » dit Maya. « Et si on a besoin de changer de type d'instance ? »

« On prend des RIs Convertibles si on pense qu'on pourrait. »

« Et si AWS sort un meilleur type d'instance ? »

« On vérifie quand le RI expire. Si le nouveau type est meilleur, on achète un nouveau RI. »

**Savings Plans : L'Engagement Flexible**

Les **Savings Plans** sont une alternative plus flexible et plus récente aux Instances Réservées. Au lieu de s'engager sur un type d'instance spécifique, vous vous engagez sur un *montant spécifique de dépenses horaires* (en dollars).

**Compute Savings Plans** : S'appliquent à n'importe quelle instance EC2, quel que soit le type, la taille, la région ou le système d'exploitation. Le plus flexible. Jusqu'à 66% de réduction.

**EC2 Instance Savings Plans** : S'appliquent à une famille d'instances spécifique dans une région (ex : instances c6g dans us-east-1). Plus restrictif que Compute, mais jusqu'à 72% de réduction (identique au maximum RI).

**SageMaker Savings Plans** : Spécifiques à l'entraînement et l'inférence ML SageMaker.

Pour Nimbus : Compute Savings Plans pour leurs serveurs API. Ils se sont engagés à 1,50 $/heure de dépenses EC2. N'importe quel type d'instance, n'importe quelle taille. Quand ils font évoluer la flotte ou changent les types d'instances, le Savings Plan s'applique toujours.

« C'est mieux que les Instances Réservées pour nous, » dit Leo. « On expérimente encore les types d'instances. Le Compute Savings Plan nous donne la réduction sans nous verrouiller sur r6g spécifiquement. »

**Instances Spot : La Réduction de 90%**

Les **Instances Spot** utilisent la capacité EC2 de secours d'AWS. Quand AWS a des serveurs inutilisés, vous pouvez les louer à 60-90% en dessous du prix À la demande. Quand AWS a besoin de la capacité en retour (pour les clients À la demande ou Réservés), il vous donne un préavis de 2 minutes et résilie votre instance.

Le risque d'interruption est la caractéristique définissante. Les Instances Spot ne sont appropriées que pour :

- **Les charges de travail tolérantes aux pannes** : Si une instance est résiliée au milieu d'une tâche, la tâche peut redémarrer sans rien corrompre
- **Le traitement sans état** : Redimensionnement d'images, encodage vidéo, analytique par lots, entraînement ML
- **Les tâches par lots à courte durée** : Le préavis de 2 minutes est suffisant pour sauvegarder l'état et créer un point de contrôle
- **Les flottes mixtes Auto Scaling** : Utiliser Spot pour la majorité de votre ASG avec À la demande comme base

Pour Nimbus : Les Instances Spot avaient du sens pour les tâches analytiques par lots qui tournaient chaque nuit (traitement des données de commandes de la journée en rapports agrégés). Si une Instance Spot est résiliée en cours de tâche, la tâche échoue, mais elle redémarre depuis le début sur une nouvelle instance. Les données dans S3 sont sûres.

« Utiliser Spot pour la tâche nocturne a fait passer son coût de 12 $/nuit à 2 $/nuit, » rapporta Leo.

**Hôtes Dédiés : L'Option de Conformité**

Certaines licences logicielles (Oracle, Windows Server dans certaines configurations) sont tarifées par socket ou cœur physique. Quand vous exécutez ce logiciel sur un hôte partagé (la valeur par défaut pour EC2), vous pourriez payer pour une capacité que vous n'utilisez pas.

Les **Hôtes Dédiés** vous donnent accès à un serveur physique entièrement à votre usage. Vous pouvez apporter vos licences existantes par socket. Aucune instance d'un autre client AWS ne tourne sur le même matériel.

Les Hôtes Dédiés sont significativement plus chers que l'EC2 standard. Ce sont des outils de conformité et de licences, pas des outils d'optimisation des coûts.

Nimbus n'avait pas d'exigences de licences nécessitant des Hôtes Dédiés. La plupart des applications cloud-native n'en ont pas.

**Construire une Flotte Mixte**

L'approche mature : utiliser plusieurs modèles de tarification ensemble.

Pour la flotte API de Nimbus :

- **Charge de base (4 instances, toujours en marche)** : Couverte par l'engagement Savings Plan
- **Pic prévisible (2 instances supplémentaires pendant les heures de bureau)** : Couvert par le Savings Plan si l'engagement les couvre, sinon À la demande
- **Dépassement lors des pics de trafic** : Instances Spot (acceptable parce que les serveurs API sont sans état — les requêtes se redistribuent si une instance est résiliée)

Résultat : une flotte qui optimise les coûts à chaque couche — tarification engagée pour la partie prévisible, À la demande pour la croissance imprévisible, Spot pour la capacité de pointe.

## Points Forts et Limites

**À la demande** : Pas d'engagement. Plein prix. À utiliser pour les charges de travail imprévisibles ou à court terme.

**Instances Réservées** : Jusqu'à 72% de réduction. Verrouillé sur le type d'instance/région/OS spécifique. Vendre la capacité inutilisée sur le Marché RI.

**Savings Plans** : Jusqu'à 66-72% de réduction. Plus flexible que les RIs (les Compute Savings Plans s'appliquent à n'importe quel type d'instance). Application automatique à l'utilisation correspondante.

**Instances Spot** : Jusqu'à 90% de réduction. Risque d'interruption de 2 minutes. Uniquement pour les charges de travail tolérantes aux pannes, sans état et interruptibles.

**Hôtes Dédiés** : Serveur physique complet. Le plus cher. Requis pour certains scénarios de licences ou de conformité.

## Résumé

- La tarification EC2 a quatre modèles : **À la demande** (prix plein, pas d'engagement), **Instances Réservées/Savings Plans** (dépenses engagées pour une réduction significative), **Spot** (capacité de secours à 60-90% de réduction, interruptible), **Hôtes Dédiés** (exclusivité du serveur physique).
- Les **Savings Plans** sont généralement préférés aux Instances Réservées pour la flexibilité.
- Les **Instances Spot** nécessitent des charges de travail tolérantes aux pannes et sans état — uniquement pour les tâches par lots, l'entraînement ML et le traitement interruptible.
- La stratégie optimale est une **flotte mixte** : Savings Plans pour la base, À la demande pour la croissance imprévisible, Spot pour le travail par lots interruptible.
- Revoyez les modèles de tarification quand les charges de travail tournent de façon stable depuis 3+ mois — c'est à ce moment que À la demande commence à être du gaspillage.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.2)*

- **Savings Plans vs Instances Réservées** : Les Savings Plans sont plus flexibles (s'appliquent à n'importe quelle instance EC2 pour les Compute Savings Plans). Les Instances Réservées verrouillent sur un type d'instance spécifique. Scénarios d'examen : « besoin de flexibilité maximale tout en obtenant des réductions » → Savings Plans. « Connaissez le type d'instance exact pour 3 ans » → RI Standard pour la réduction maximale.
- **Signaux Spot** : « sensible aux coûts », « tolérant aux pannes », « traitement par lots », « peut gérer les interruptions », « charges de travail sans état », « entraînement ML » → Spot.
- **Gestion de l'interruption Spot** : Les instances Spot reçoivent un préavis de 2 minutes avant la résiliation. Votre application doit gérer cela gracieusement (sauvegarder l'état, drainer les connexions, quitter proprement).
- **À la demande vs Spot pour les serveurs web** : Les serveurs web servant du trafic utilisateur en direct ne doivent PAS utiliser Spot (l'interruption cause des requêtes échouées). Utilisez À la demande ou Savings Plans pour le niveau web.
- **EC2 Savings Plans vs Compute Savings Plans** : EC2 Savings Plans s'appliquent à une famille d'instances et une région spécifiques (réduction plus élevée). Compute Savings Plans s'appliquent à n'importe quelle instance EC2, Lambda et Fargate (réduction maximale plus faible, plus flexible).
- **Marché RI** : Les Instances Réservées Standard inutilisées peuvent être vendues à d'autres clients AWS. Les RIs Convertibles ne peuvent pas être vendues.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez quand les Instances Spot sont appropriées et quand elles ne le sont pas. Quelle caractéristique rend une charge de travail adaptée à Spot ?

*(Indice : Réfléchissez à ce qui se passe quand l'instance est résiliée avec 2 minutes de préavis. Quelles charges de travail se rétablissent proprement ? Lesquelles ne le font pas ?)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une société de médias exploite un pipeline de transcodage vidéo qui convertit les vidéos téléversées en plusieurs formats. Les tâches de transcodage s'exécutent en continu chaque fois que des vidéos sont téléversées (opération 24h/24, volume variable). Chaque tâche prend 5 à 30 minutes. Si une tâche de transcodage est interrompue, la tâche peut être redémarrée depuis le début sans perte de données. La société veut minimiser les coûts.

Quel modèle de tarification EC2 répond LE MIEUX à ces exigences ?

A) Instances à la demande dans un Auto Scaling Group  
B) Instances Réservées (1 an, Toute Avance)  
C) Instances Spot avec Spot Fleet pour la diversification automatique des instances  
D) Hôtes Dédiés avec les licences logicielles médias existantes de la société

**Indice 1** : « Peut être redémarrée depuis le début sans perte de données » — c'est la phrase clé qui permet un modèle de tarification spécifique.

**Indice 2** : « Minimiser les coûts » avec une charge de travail interruptible pointe vers l'option à réduction maximale.

**Indice 3** : Spot Fleet demande des instances de plusieurs types d'instances et AZs, réduisant le risque d'interruption.

**Réponse** : C

**Explication** : Les tâches de transcodage sont tolérantes aux pannes — elles peuvent être redémarrées si interrompues. Cela les rend idéales pour les Instances Spot, qui offrent 60-90% de réduction sur À la demande. Spot Fleet diversifie entre les types d'instances et les Zones de Disponibilité, réduisant la probabilité d'interruption massive.

**Pourquoi pas A ?** À la demande est l'option la plus coûteuse. Pour une charge de travail tolérante aux pannes tournant en continu, c'est du gaspillage.

**Pourquoi pas B ?** Les Instances Réservées fournissent une réduction de 50-72% mais n'offrent pas la réduction potentielle de 90% de Spot pour les charges de travail tolérantes aux pannes. De plus, les RIs sont pour les charges de travail prévisibles et en état stable — Spot est spécifiquement pour le traitement par lots interruptible.

**Pourquoi pas D ?** Les Hôtes Dédiés sont pour la conformité des licences, pas pour l'optimisation des coûts. Ce sont l'option la plus coûteuse.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

L'infrastructure de Nimbus a ces charges de travail :

1. Serveurs API : 6 instances, tournant 24h/24, stables depuis 2 ans, utilisent r6g.large
2. Tâches analytiques nocturnes par lots : 4 instances, tournent de 3h à 6h chaque nuit, toujours le même type d'instance
3. Environnement de tests : 2 instances, utilisées par les ingénieurs de 9h à 18h en semaine
4. Dépassement lors des pics de trafic : 0 à 8 instances, démarrent pendant les heures de pointe, totalement imprévisibles

Concevez la stratégie de tarification optimale pour chaque type de charge de travail. Quel montant d'engagement Savings Plan couvrirait les charges de travail 1 et 2 ? Pour la charge de travail 3, y a-t-il une stratégie plus intelligente que À la demande ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la stratégie de tarification EC2.)*

## Scène Post-Générique

Tom soumit l'achat du Savings Plan.

Engagement de 5,76 $/heure. Terme de trois ans. Compute Savings Plans pour la flexibilité.

Les économies estimées : 42 500 $ sur trois ans.

Maya lut le chiffre. « Quarante-deux mille dollars. »

« Comparé à À la demande pour les mêmes instances, sur trois ans. »

« Qu'est-ce que ça a coûté de faire ça ? »

« Un après-midi d'analyse, » dit Tom. « Et la décision de s'engager. »

« Trois ans c'est long, » dit Leo. « Et si on change de type d'instance ? »

« Les Compute Savings Plans s'appliquent à n'importe quel type d'instance EC2. Et dans trois ans, on est assez grand pour que cette conversation soit différente de toute façon. »

Leo réfléchit à ça.

« Depuis combien de temps connais-tu les Savings Plans ? » demanda-t-il.

« Depuis qu'on a commencé, » dit Tom. « J'attendais que la charge de travail soit suffisamment stable pour s'engager. »

« Dix-huit mois à payer À la demande en attendant. »

« Oui. » Tom ferma la console. « Parfois la chose la plus coûteuse que vous faites est d'attendre pour économiser de l'argent. »

Dans le prochain chapitre : la même discipline appliquée aux coûts de stockage, avec quelques surprises sur ce qui fait grimper la facture.
