# Chapitre 18 : Quand les choses cassent

Ce chapitre traite de la défaillance — planifiée, conçue pour être évitée, et finalement acceptée comme inévitable. C'est peut-être le chapitre le plus important du livre.

Nimbus fonctionnait bien. Les couches de sécurité étaient en place. La surveillance était active. Le trafic augmentait.

Puis Leo reçut une notification Slack à 23h23 un jeudi.

« us-east-1 Zone de disponibilité us-east-1b — panne matérielle — service dégradé. »

Il ouvrit la console AWS. Les instances EC2 dans us-east-1b montraient des échecs aux vérifications de statut. Son groupe Auto Scaling avait détecté des instances défectueuses et créait des remplacements — dans us-east-1b.

Dans la zone en panne.

Les nouvelles instances ne pouvaient pas démarrer non plus. Elles étaient dans la même zone de panne matérielle.

« L'équilibreur de charge dirige le trafic vers les deux zones », dit Leo à personne en particulier. « La moitié de notre trafic va vers des instances qui ne fonctionnent pas. »

Vingt-deux minutes de service dégradé avant qu'il ne le remarque et redirige manuellement le groupe ASG pour n'utiliser que us-east-1a.

« Cela s'est produit parce que tout était dans une seule zone », dit Priya le lendemain matin.

« Non », dit Leo. « J'avais des instances dans deux zones. Le problème était que les instances de remplacement se créaient dans la zone en panne. »

« Et la base de données ? »

Leo s'arrêta.

« L'instance RDS est Multi-AZ », dit-il. « Le standby est dans us-east-1b. Qui était en panne. Et RDS a essayé de basculer vers le standby, qui a également échoué. »

Vingt-deux minutes de service dégradé étaient devenues trente-huit.

**L'analogie du réseau électrique**

Pensez à la façon dont votre maison reçoit de l'électricité. L'énergie ne vient pas d'un seul fil partant d'un seul générateur. Elle vient d'un réseau — un ensemble de générateurs, de sous-stations et de lignes de transmission qui se soutiennent mutuellement. Si une sous-station prend feu, les autres reroutent l'électricité autour d'elle. Vous ne le remarquez pas. Les lumières restent allumées.

Les Zones de disponibilité AWS fonctionnent de la même façon. Au lieu d'un immense centre de données dont tout dépend, AWS répartit vos ressources sur plusieurs installations physiquement séparées. Si une installation perd de l'énergie ou a une panne matérielle, les autres continuent de fonctionner. Le trafic est rerouté automatiquement. Votre application reste opérationnelle — parce qu'il n'y a jamais eu un seul fil à couper.

Multi-Région est le niveau suivant : imaginez avoir des générateurs de secours dans une ville complètement différente. Si tout le réseau électrique local tombe en panne, la ville distante prend le relais. Plus complexe à mettre en place, mais plus résilient aux pannes catastrophiques.

**Le vocabulaire de la défaillance**

Avant de concevoir pour la résilience, vous avez besoin de mots pour ce contre quoi vous concevez.

**Disponibilité** : Le pourcentage de temps pendant lequel un système est opérationnel. « Quatre neuf » (99,99 %) signifie moins de 52 minutes d'indisponibilité par an. « Cinq neuf » (99,999 %) signifie environ 5 minutes par an.

**RTO (Recovery Time Objective)** : Combien de temps le système peut-il être hors service avant que cela devienne un problème commercial ? Si votre RTO est de 4 heures, vous avez 4 heures pour rétablir le service avant que les SLA soient violés.

**RPO (Recovery Point Objective)** : Quelle quantité de données pouvez-vous vous permettre de perdre ? Si votre RPO est d'1 heure, vous pouvez tolérer de perdre jusqu'à une heure de données lors d'une panne catastrophique. Tout ce qui a été écrit dans la dernière heure avant la panne est perdu.

**Tolérance aux pannes** : La capacité de continuer à fonctionner (à un certain niveau) quand un composant tombe en panne.

**Reprise après sinistre (DR)** : Le processus de récupération après une panne catastrophique — incendie de centre de données, panne régionale, suppression accidentelle en masse.

Ces cinq concepts guident chaque décision architecturale dans ce chapitre.

**Multi-AZ : survivre aux pannes de Zone de disponibilité**

Une Zone de disponibilité (AZ) est un centre de données physiquement séparé au sein d'une région. Les AZ sont conçues pour être indépendantes : alimentation électrique séparée, refroidissement séparé, infrastructure réseau séparée. Mais elles sont suffisamment proches pour que la latence réseau entre elles soit de 1 à 2 millisecondes.

Les **déploiements Multi-AZ** répartissent vos ressources sur deux ou plusieurs AZ au sein d'une région. Si une AZ tombe en panne :

- L'équilibreur de charge cesse de router vers les instances défectueuses dans l'AZ en panne
- Le groupe Auto Scaling remplace les instances — mais dans l'AZ *saine*
- RDS bascule vers le standby dans l'AZ saine

L'erreur de Leo : son groupe Auto Scaling n'était pas configuré pour limiter les instances de remplacement aux AZ saines. Il était configuré pour maintenir l'équilibre entre les AZ. Quand us-east-1b est tombée en panne, l'ASG a essayé d'équilibrer le nombre d'instances en créant des remplacements dans us-east-1b — l'AZ en panne.

La correction : configurer l'ASG pour ne lancer que dans les AZ saines, avec un minimum de deux AZ toujours actives.

La leçon plus profonde : tester vos scénarios de défaillance avant qu'ils ne se produisent en production.

**Simuler les défaillances : ingénierie du chaos**

« Comment savons-nous que notre configuration Multi-AZ fonctionne réellement ? » demanda Maya.

« Nous cassons les choses exprès », dit Leo.

Cela semble imprudent. C'est en fait la chose la plus responsable qu'une équipe puisse faire.

**L'ingénierie du chaos** est la pratique d'injecter intentionnellement des défaillances dans votre système pour vérifier qu'il les gère correctement. Vous résiliez délibérément une instance EC2. Vous forcez manuellement le basculement de l'instance RDS. Vous bloquez un sous-réseau de l'équilibreur de charge.

Si le système récupère automatiquement dans votre RTO, votre conception fonctionne.

S'il ne le fait pas, vous l'avez appris dans un cadre contrôlé — pas lors d'un incident de production à 2h du matin.

Pour Nimbus : Leo a rédigé un runbook (une procédure documentée) pour tester chaque scénario de défaillance. Une fois par trimestre, ils feraient délibérément tomber en panne un composant et mesureraient le temps de récupération. Si la récupération prenait plus longtemps que le RTO, ils corrigeraient la conception.

**Multi-Région : survivre aux pannes régionales**

La plupart des pannes AWS affectent les Zones de disponibilité, pas des régions entières. Les pannes régionales sont rares — mais elles se produisent.

En cas de panne régionale (ou pour les applications mondiales qui nécessitent une très faible latence partout), **Multi-Région** est la réponse : déployez votre application dans deux ou plusieurs régions AWS.

Multi-Région introduit une complexité fondamentale :

**Réplication des données** : Vos bases de données doivent être synchronisées entre les régions. Toutes les données écrites dans us-east-1 doivent éventuellement atteindre eu-west-1. « Éventuellement » est le problème — pendant le délai de latence, les régions ont des visions légèrement différentes du monde.

**Actif-passif vs actif-actif** :

- **Actif-passif** : Une région sert tout le trafic. L'autre est un standby chaud. En cas de panne, le DNS bascule le trafic vers le standby. Plus simple, mais le standby est inactif et coûteux.
- **Actif-actif** : Les deux régions servent le trafic simultanément. Plus complexe à construire (nécessite la résolution des conflits pour les écritures simultanées), mais latence plus faible globalement et pas de ressources inactives.

**Temps de basculement** : Les changements DNS prennent du temps à se propager (en fonction du TTL). Pendant la fenêtre de propagation, certains utilisateurs atteignent encore la région en panne. Concevoir pour un RTO très faible nécessite un préchauffage du standby et une minimisation du TTL avant les bascules planifiées.

**Stratégies de reprise après sinistre : un spectre**

Il existe quatre stratégies DR courantes, classées de la moins chère (et la plus lente à récupérer) à la plus coûteuse (et la plus rapide à récupérer) :

**Sauvegarde et restauration** (RPO/RTO de quelques heures) :

- Sauvegarder tout dans S3 dans une région différente
- En cas de sinistre : provisionner l'infrastructure depuis zéro, restaurer depuis la sauvegarde
- Coût : très faible (vous ne payez que pour le stockage)
- Temps de récupération : quelques heures

**Veilleuse** (RPO/RTO de quelques minutes à 1 heure) :

- Maintenir une version minimale de l'application en cours d'exécution dans la région DR (la « veilleuse » qui peut être rallumée rapidement)
- Les données principales sont répliquées (réplique en lecture RDS dans la région DR)
- En cas de sinistre : faire monter en puissance la région DR, promouvoir la réplique en lecture en primaire, basculer le DNS
- Coût : modéré (vous payez pour une petite empreinte en cours d'exécution)
- Temps de récupération : quelques dizaines de minutes

**Standby chaud** (RPO/RTO de quelques secondes à quelques minutes) :

- Faire fonctionner une version réduite de l'application complète dans la région DR
- Entièrement opérationnelle mais à capacité réduite
- En cas de sinistre : faire monter en puissance, basculer le DNS
- Coût : plus élevé (toujours en train d'exécuter la pile complète à échelle réduite)
- Temps de récupération : quelques minutes

**Actif-actif / Multi-site** (RPO/RTO quasi nul) :

- Capacité complète dans deux régions ou plus, servant le trafic simultanément
- Aucune récupération nécessaire — si une région tombe en panne, le trafic est routé vers l'autre automatiquement
- Coût : le plus élevé (deux déploiements complets à pleine échelle)
- Temps de récupération : quelques secondes (propagation DNS uniquement)

Pour Nimbus à ce stade : standby chaud. Ils ne pouvaient pas se permettre l'actif-actif, mais la sauvegarde et restauration était trop lente pour leurs exigences commerciales.

**Amazon RDS : Multi-AZ vs répliques en lecture vs Multi-Région**

Ces trois concepts sont distincts et souvent confondus :

| Fonctionnalité | Multi-AZ                          | Réplique en lecture  | Réplique en lecture Multi-Région |
|----------------|-----------------------------------|----------------------|----------------------------------|
| Objectif       | Haute disponibilité (basculement) | Mise à l'échelle en lecture | Mise à l'échelle en lecture + DR |
| Sync des données | Synchrone                       | Asynchrone           | Asynchrone                       |
| Basculement    | Automatique                       | Promotion manuelle   | Promotion manuelle               |
| Lisible ?      | Non (le standby est passif)       | Oui                  | Oui                              |
| Inter-région ? | Non (même région)                 | Oui (optionnel)      | Oui                              |
| Utiliser pour  | HA, RPO~0                         | Charge en lecture    | Reprise après sinistre           |

Point clé : le standby Multi-AZ est **synchrone** — chaque écriture dans le primaire est confirmée dans le standby avant que l'écriture soit acquittée. Cela signifie que si le primaire tombe en panne, aucune donnée n'est perdue. RPO = 0.

Les répliques en lecture sont **asynchrones** — il y a un délai de réplication. Si le primaire tombe en panne et que vous promouvez une réplique en lecture, vous pourriez perdre quelques secondes ou minutes d'écritures récentes. RPO > 0.

## Points forts et limites

**Multi-AZ** :

- Essentiel pour les charges de travail de production — une seule AZ est un point de défaillance unique
- Bien supporté par les services AWS (RDS, ElastiCache, EKS, ALB supportent tous Multi-AZ)
- Surcoût relativement faible par rapport à la protection qu'il offre

**Multi-Région** :

- Complexe à implémenter correctement, surtout pour les bases de données
- Les exigences de résidence/souveraineté des données peuvent effectivement l'imposer (les données des utilisateurs de l'UE doivent rester dans les régions de l'UE)
- Les avantages de latence pour les utilisateurs mondiaux viennent du routage, pas du multi-région en soi (utilisez CloudFront pour le contenu statique)
- La plupart des organisations n'ont pas besoin d'actif-actif ; la plupart sous-investissent dans le standby chaud

## Résumé

- **RTO** (Recovery Time Objective) : combien de temps vous pouvez être hors service. **RPO** (Recovery Point Objective) : quelle quantité de données vous pouvez perdre.
- **Multi-AZ** répartit les ressources sur les Zones de disponibilité au sein d'une région. Protège contre les pannes d'AZ.
- **Multi-Région** déploie dans plusieurs régions AWS. Protège contre les pannes régionales et sert les utilisateurs mondiaux avec une latence plus faible.
- Stratégies DR (de la moins chère à la plus coûteuse) : Sauvegarde et restauration → Veilleuse → Standby chaud → Actif-actif.
- Standby Multi-AZ RDS : synchrone, basculement automatique, RPO = 0. Répliques en lecture : asynchrone, promotion manuelle, RPO > 0.
- Testez intentionnellement vos défaillances (ingénierie du chaos) avant qu'elles ne se produisent en production.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures résilientes (Domaine 2, Tâche 2.2)*

- **RTO vs RPO** : L'examen vous donnera des exigences (« l'organisation ne peut pas tolérer plus d'1 heure d'indisponibilité et aucune perte de données ») et vous demandera de choisir la stratégie DR correcte. Correspondance : aucune perte de données = réplication synchrone = Multi-AZ ou actif-actif. 1 heure d'indisponibilité = sauvegarde-et-restauration trop lente ; standby chaud pourrait fonctionner.
- **Multi-AZ RDS vs répliques en lecture** : L'examen demandera pour la HA (Multi-AZ) vs la mise à l'échelle en lecture (répliques en lecture). Le standby Multi-AZ n'est pas lisible. Les répliques en lecture peuvent être promues en primaire (manuellement) pour la DR.
- **Veilleuse vs Standby chaud** : La veilleuse a une infrastructure minimale en cours d'exécution (juste la réplication de données). Le standby chaud a une application réduite mais fonctionnelle en cours d'exécution. La différence est la rapidité avec laquelle vous pouvez faire monter en puissance.
- **Aurora Global Database** : Fonctionnalité spécifique Aurora pour l'actif-passif multi-région. La région primaire sert les écritures ; les régions secondaires servent les lectures avec un délai de réplication inférieur à 1 seconde. En cas de basculement, le secondaire peut être promu en moins d'1 minute. Signal d'examen : « Aurora, multi-région, RTO < 1 minute ».
- **AWS Backup** : Service de sauvegarde centralisé pour EBS, RDS, DynamoDB, EFS, Storage Gateway. L'examen l'utilise pour les scénarios de sauvegarde-et-restauration.
- **Basculement Route 53** : Couche DNS de la DR. L'échec de vérification de santé primaire → Route 53 route vers le secondaire. Le temps de propagation signifie que ce n'est pas instantané.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre RTO et RPO. Pourquoi une organisation pourrait-elle avoir un RTO faible (ne peut pas être hors service longtemps) mais un RPO élevé (peut tolérer de perdre des données récentes) ?

*(Indice : Pensez à une entreprise où il est plus important de servir les clients rapidement que de préserver chaque transaction.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise de soins de santé gère un système de dossiers patients sur RDS PostgreSQL dans `us-east-1`. Les exigences réglementaires imposent que les données des patients ne soient jamais perdues (RPO = 0). Le système peut tolérer jusqu'à 30 minutes d'indisponibilité (RTO = 30 minutes) en cas de sinistre. Le coût est une préoccupation.

Quelle architecture répond LE MIEUX à ces exigences ?

A) RDS Multi-AZ dans `us-east-1` avec des sauvegardes automatiques quotidiennes vers S3 dans `us-west-2`  
B) RDS Multi-AZ dans `us-east-1` avec une réplique en lecture dans `us-west-2` configurée pour la promotion manuelle  
C) RDS dans `us-east-1` avec un standby chaud dans `us-west-2` et une réplication active-active  
D) Aurora Global Database avec la région primaire dans `us-east-1` et la région secondaire dans `us-west-2`

**Indice 1** : RPO = 0 signifie aucune perte de données, ce qui nécessite une réplication synchrone ou quasi-synchrone.

**Indice 2** : RTO = 30 minutes signifie que vous avez le temps pour une intervention manuelle. Vous n'avez pas besoin d'un basculement automatique en millisecondes.

**Indice 3** : Quelle option fournit une protection Multi-AZ (RPO = 0 dans la région) plus une capacité DR inter-région ?

**Réponse** : A

**Explication** : RDS Multi-AZ dans us-east-1 fournit une réplication synchrone vers le standby dans la même région — RPO = 0 pour les pannes d'AZ. Les sauvegardes automatiques quotidiennes vers S3 dans us-west-2 fournissent une DR inter-région. En cas de panne régionale complète, vous restaurez depuis la sauvegarde S3 dans us-west-2 — en moins de 30 minutes pour une petite base de données. C'est rentable et satisfait les deux exigences.

**Pourquoi pas B ?** Les répliques en lecture sont asynchrones — il peut y avoir un délai de réplication. Si le primaire tombe en panne, les données écrites depuis la dernière synchronisation de la réplique sont perdues. RPO > 0, ce qui viole l'exigence.

**Pourquoi pas C ?** La « réplication active-active » pour PostgreSQL entre régions est complexe à implémenter et n'est pas une fonctionnalité RDS standard. Cette option est techniquement difficile et coûteuse.

**Pourquoi pas D ?** Aurora Global Database fonctionnerait mais est nettement plus cher que RDS Multi-AZ. Le scénario indique que le coût est une préoccupation, et Aurora est à prix premium.

*SAA-C03 Domaine : Concevoir des architectures résilientes — Tâche 2.2*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus a été sélectionné pour fournir des services de commande pour un grand festival gastronomique à Seattle. Pendant 72 heures, ils s'attendent à un trafic 50 fois supérieur à la normale, avec une tolérance zéro pour les temps d'arrêt (le contrat de l'organisateur du festival spécifie des pénalités financières pour tout temps d'arrêt pendant l'événement).

Concevez une stratégie DR pour la fenêtre du festival spécifiquement. Passeriez-vous à l'actif-actif pendant ces 72 heures ? Comment pré-testeriez-vous le basculement ? Quel serait votre RTO, et comment le valideriez-vous avant l'événement ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception DR pour des exigences SLA spécifiques.)*

## Scène post-générique

Leo construisit le runbook d'ingénierie du chaos.

Chaque trimestre, lors d'une fenêtre de maintenance planifiée, l'équipe allait :

1. Résilier une instance EC2 dans us-east-1a et regarder l'ASG la remplacer correctement
2. Forcer manuellement un basculement Multi-AZ RDS et vérifier que l'application se reconnectait en moins de 60 secondes
3. Simuler une panne complète de us-east-1b en ajustant les zones de disponibilité de l'ASG
4. Restaurer une sauvegarde vieille d'une semaine vers une nouvelle instance RDS et vérifier que les données semblaient correctes

La première fois qu'ils l'ont fait, l'étape 2 a pris 4 minutes et 17 secondes.

« Notre engagement RTO envers les partenaires restaurants est de 5 minutes », dit Tom.

« Donc on a réussi. De justesse. »

« Que se passerait-il si le basculement prenait plus de 5 minutes dans un incident réel ? »

Maya répondit : « Nous serions en violation du SLA. Il y a une pénalité financière dans les contrats. »

Leo regarda le 4:17 sur l'écran.

« Alors on doit le rendre plus rapide », dit-il. Et il commença à lire la documentation d'Aurora.

Dans le prochain chapitre : la machine à tickets qui permet à chaque partie de Nimbus de travailler à son propre rythme.
