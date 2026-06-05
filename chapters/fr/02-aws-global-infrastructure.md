# Chapitre 2 : Où dans le monde est votre serveur ?

Levez-vous. Allez à une fenêtre s'il y en a une à portée.

Regardez dehors. Quoi que vous voyiez — des bâtiments, des arbres, un parking, la cour de quelqu'un — ce n'est pas là que vivent vos données. Vos données vivent quelque part d'autre entièrement. Probablement quelque part où vous n'êtes jamais allé.

Ce n'est pas un problème. Mais comprendre *où* fait que de nombreuses choses s'assemblent de façon surprenante.

Dans le chapitre précédent, Leo a créé un compte AWS à 23h et lancé un serveur quelque part. Quelque part étant le mot opératoire — il n'était pas sûr de quelle partie du monde il avait choisie, parce qu'il ne l'avait pas choisie intentionnellement.

Le lendemain matin, Maya a remarqué que le serveur était à Singapour.

« Pourquoi Singapour ? » demanda-t-elle.

« C'était le défaut », dit Leo.

Tom leva les yeux de son café. « Combien ça coûte de faire tourner un serveur à Singapour quand
tous nos clients sont sur la côte Ouest ? »

Leo n'avait pas de réponse.

Priya en avait déjà une : « C'est plus lent aussi. Chaque requête doit traverser la moitié du monde. »

Ce chapitre parle de corriger cette décision — et de comprendre pourquoi ça importe.

**Le problème avec "quelque part"**

Quand vous utilisez AWS, vous n'utilisez pas un seul centre de données. Vous utilisez un réseau mondial de centres de données. AWS a des infrastructures dans des dizaines de pays.

C'est une fonctionnalité, pas juste un fait. Mais ça signifie que vous devez faire un choix : *où* voulez-vous que votre infrastructure fonctionne ?

Le choix importe pour trois raisons :

**Performance.** Plus vos serveurs sont proches de vos utilisateurs, plus la réponse est rapide.
La physique est non négociable. Les données voyagent à environ deux tiers de la vitesse de la lumière
à travers les câbles à fibre optique. Une requête de Seattle à Singapour prend environ 300
millisecondes rien qu'en transit — avant que votre application fasse quoi que ce soit.

**Conformité.** Certains secteurs ont des lois sur l'endroit où les données peuvent être stockées. Les données de santé américaines peuvent devoir rester dans le pays. Les données financières peuvent devoir rester dans une région spécifique. Choisir la mauvaise Région peut créer des problèmes juridiques.

**Résilience aux catastrophes.** Si un emplacement a une panne d'électricité, un tremblement de terre ou une panne réseau, vous voulez que votre système survive. Répartir l'infrastructure sur plusieurs emplacements est la façon dont vous vous protégez contre les catastrophes locales.

**Comment AWS organise son infrastructure**

AWS divise son infrastructure mondiale en trois concepts imbriqués. Pensez-y comme des poupées russes, de la plus grande à la plus petite.

**Régions → Zones de disponibilité → Emplacements Edge**

Ouvrons chacune.

**Régions : Les grandes boîtes**

Une **Région** est une zone géographique où AWS dispose d'un ensemble de centres de données. Chaque Région est nommée d'après son emplacement : `us-west-2` est l'Oregon, `us-east-1` est le nord de la Virginie, `eu-west-1` est l'Irlande, `ap-southeast-1` est Singapour — là où le serveur de Leo se cachait.

Il y a plus de 30 Régions dans le monde, et AWS en ajoute régulièrement.

Chaque Région est complètement indépendante. Les données dans `us-west-2` restent dans `us-west-2` à moins que vous ne les déplaciez explicitement. C'est crucial pour la conformité et la résilience — une panne majeure dans une Région n'affecte pas automatiquement les autres.

« Donc on devrait choisir `us-west-2` pour Nimbus ? » demanda Tom.

Oui. Pour une entreprise américaine ciblant les clients de la côte Ouest, oui. Latence plus faible et vos utilisateurs obtiennent des réponses plus rapides.

« Combien c'est plus cher que Singapour ? » ajouta Tom.

La tarification varie selon la Région — généralement de quelques pourcents. L'avantage de performance et de conformité de la bonne Région vaut la petite différence de prix.

**Zones de disponibilité : La vraie redondance**

C'est là que ça devient intéressant.

Chaque Région n'est pas un seul centre de données. C'est un ensemble de plusieurs centres de données physiquement séparés appelés **Zones de disponibilité** (ou AZ).

L'Oregon (`us-west-2`) a quatre Zones de disponibilité : `us-west-2a`, `us-west-2b`,
`us-west-2c`, `us-west-2d`. Ce sont de vrais bâtiments, séparés par des distances significatives — assez loin pour qu'un incendie, une inondation ou une panne d'électricité dans l'un n'affecte pas les autres, mais assez proches pour que le réseau entre eux soit extrêmement rapide (latence à un chiffre en millisecondes).

C'est l'architecture qui rend AWS fiable à un niveau qu'aucun centre de données unique ne peut égaler.

Priya se pencha en avant. « Donc si on fait tourner notre application dans deux Zones de disponibilité et qu'une tombe en panne — »

« L'autre continue à tourner », termina Maya.

« Exactement. »

Leo, qui avait écouté silencieusement : « J'ai tout déployé dans une seule AZ. »

« Oui », dit Priya. « On a remarqué. »

Le concept de répartition de votre application sur plusieurs AZ — appelé **déploiement Multi-AZ** — est l'un des schémas de résilience les plus importants dans AWS. Nous l'approfondissons au Chapitre 18. Pour l'instant, comprenez que les AZ existent spécifiquement pour rendre cela possible.

**Emplacements Edge : La rapidité, partout**

Les AZ résolvent la résilience. Elles ne résolvent pas le problème de servir du contenu rapidement aux utilisateurs dans des villes éloignées de votre Région principale.

Entrent en jeu les **Emplacements Edge**.

Les Emplacements Edge sont de petits points d'infrastructure légers disséminés dans plus de 400 villes à travers le monde. Ce ne sont pas des centres de données complets — ils ne peuvent pas faire tourner votre application. Ce qu'ils *peuvent* faire, c'est mettre du contenu en cache près de vos utilisateurs.

Imaginez une image de menu stockée sur un serveur en Virginie. Chaque fois que quelqu'un à Tokyo veut la voir, la requête traverse le Pacifique et revient. Avec les Emplacements Edge, AWS peut stocker une copie de ce fichier à Tokyo et le servir localement — des millisecondes au lieu de centaines de millisecondes.

C'est l'épine dorsale de CloudFront, le réseau de diffusion de contenu d'AWS. Nous approfondissons CloudFront au Chapitre 13. Pour l'instant : les Emplacements Edge concernent la rapidité pour le contenu statique.

**Choisir une Région : La liste de contrôle de l'ingénieur senior**

Quand Nimbus s'étend pour servir des utilisateurs au Mexique et en Colombie (ce qui arrive au Chapitre 12), la décision de Région n'est pas arbitraire. Voici la réflexion :

**1. Où sont vos utilisateurs ?**

Commencez ici. Choisissez la Région la plus proche de la majorité de vos utilisateurs. La latence est l'impact le plus direct et mesurable du choix de Région.

**2. Y a-t-il des exigences de conformité ?**

Les charges de travail de santé, finance et gouvernement ont souvent des règles strictes de résidence des données. Connaissez votre environnement réglementaire avant de choisir.

**3. De quels services avez-vous besoin ?**

Tous les services AWS ne sont pas disponibles dans toutes les Régions. Les nouveaux services lancent d'abord dans `us-east-1`. Si vous avez besoin d'un service spécifique, vérifiez que votre Région cible le supporte.

**4. Quel est le prix ?**

Les Régions varient en prix. `us-east-1` (Virginie du Nord) tend à être la moins chère en raison de son échelle et de son ancienneté. L'Amérique du Sud est légèrement plus chère. Vérifiez la page de tarification AWS avant de finaliser.

**5. Avez-vous besoin de multi-Région ?**

Pour la plupart des applications, plusieurs AZ dans une seule Région est une résilience suffisante. Pour les applications critiques où même une panne régionale est inacceptable, vous concevez pour le multi-Région — mais c'est un engagement architectural significatif. Ne le faites pas de façon spéculative.

**La limitation dont personne ne parle**

Les Régions sont puissantes, mais elles créent une tension importante.

Fonctionner dans plusieurs Régions est vraiment difficile.

La réplication de données entre Régions a de la latence. Garder deux Régions synchronisées — pour qu'une transaction dans la Région A soit instantanément visible dans la Région B — est l'un des problèmes les plus difficiles dans les systèmes distribués. AWS fournit des outils pour ça, mais ça coûte de l'argent et ajoute de la complexité opérationnelle.

La plupart des applications devraient commencer avec une Région, plusieurs AZ, et ne s'étendre au multi-Région que lorsqu'elles ont une exigence claire : mandats réglementaires, SLA contractuels exigeant un temps d'arrêt régional quasi nul, ou une base d'utilisateurs réellement répartie sur des continents.

L'architecture multi-Région prématurée est l'une des erreurs les plus courantes et les plus coûteuses que font les ingénieurs juniors quand ils commencent à se sentir confiants.

Tom hocha la tête. « Donc on ne fait pas de multi-Région juste parce qu'on peut. »

« Pas tant qu'on en a besoin », dit Maya. « Et on saura quand on en aura besoin. »

« Comment on le saura ? » demanda Leo.

« Quand le document de revue d'architecture indiquera une exigence qui dit 'doit survivre à une panne régionale' », dit Priya. « Jusqu'à là : multi-AZ. »

## Forces et limites

**Utilisez le design multi-Région et multi-AZ quand** : votre application a des utilisateurs dans plusieurs zones géographiques et la latence importe ; votre SLA exige une disponibilité de 99,99 % ou plus ; les exigences réglementaires imposent la résidence des données dans des régions spécifiques ; vous avez besoin d'une reprise sur sinistre avec un RTO inférieur à une heure.

**Les compromis sont réels** : Répliquer les données entre régions ajoute des coûts — le transfert de données inter-régions est l'un des postes les plus sous-estimés sur une facture AWS. Cela ajoute aussi de la complexité opérationnelle : chaque écriture qui doit être cohérente entre régions ajoute de la latence. La plupart des pannes qui affectent les vraies applications ne sont pas des catastrophes inter-régions — ce sont des problèmes intra-région comme un groupe de sécurité mal configuré ou un déploiement raté. Investissez dans le multi-AZ avant le multi-Région. Ajoutez le multi-Région quand le cas d'usage est clair.

## Résumé

- AWS organise son infrastructure mondiale en **Régions**, **Zones de disponibilité**,
  et **Emplacements Edge**.
- Une **Région** est un ensemble géographique de centres de données. Chaque Région est isolée —
  les données restent dans la Région à moins que vous ne les déplaciez explicitement.
- Les **Zones de disponibilité** sont des centres de données physiquement séparés dans une Région, connectés
  par un réseau à faible latence. Déployer sur plusieurs AZ est la façon standard de
  survivre aux pannes locales.
- Les **Emplacements Edge** mettent du contenu en cache près des utilisateurs dans le monde entier. Ils alimentent CloudFront.
- Choisissez votre Région en fonction de l'emplacement des utilisateurs, des exigences de conformité, de la disponibilité des services,
  et du prix — dans cet ordre.
- Le multi-AZ est la référence de résilience standard. Le multi-Région est pour les charges de travail critiques
  avec des exigences spécifiques et documentées — pas un point de départ par défaut.

## Conseils pour l'examen

*Domaine SAA-C03 1 — Tâche 1.1 / Domaine 2 — Tâche 2.2*

- **Les Régions sont isolées par défaut.** Les données ne se répliquent pas entre Régions à moins que
  vous le configuriez. C'est important pour les scénarios de souveraineté des données et de conformité.
- **Les AZ sont l'unité de résilience pour la plupart des questions.** Quand l'examen demande comment survivre
  à une panne d'un centre de données, la réponse implique plusieurs AZ dans une Région.
- **Le multi-Région est pour la résilience aux pannes régionales.** Si le scénario dit « doit rester
  opérationnel même si une Région AWS entière tombe en panne », la réponse implique une
  architecture multi-Région.
- **Les Emplacements Edge ≠ AZ.** Les Emplacements Edge mettent du contenu en cache — ils ne peuvent pas faire tourner votre
  serveur d'application. Ne les confondez pas avec des centres de données.
- L'examen teste fréquemment la relation entre conformité et sélection de Région.
  Si un scénario mentionne des exigences de résidence des données, le choix de Région fait partie de la réponse.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre une Région et une Zone de disponibilité ?
Pourquoi cette distinction importe-t-elle lors de la conception d'une application web résiliente ?

*(Indice : Pensez aux deux types différents de pannes contre lesquelles chacune protège.)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise de santé américaine doit stocker toutes les données des patients dans une seule Région AWS
pour se conformer aux politiques internes de résidence des données. Ils conçoivent une nouvelle application
cloud sur la côte Ouest et veulent maximiser la résilience sans déplacer les données vers
une autre Région.

Quelle configuration correspond LE MIEUX à leurs exigences ?

A) Déployer dans `us-east-1` et utiliser les Emplacements Edge CloudFront en Oregon pour servir le contenu
   plus rapidement  
B) Déployer dans `us-west-2` (Oregon) sur plusieurs Zones de disponibilité  
C) Déployer dans plusieurs Régions incluant `us-west-2` et `us-east-1` avec réplication
   de données inter-Régions  
D) Déployer dans `us-west-2` dans une seule Zone de disponibilité pour minimiser les coûts

**Indice 1** : La politique signifie que les données doivent rester dans une seule Région. Quelles options
déplacent les données vers une autre Région ?

**Indice 2** : Parmi les options qui gardent les données dans `us-west-2`, laquelle offre le plus de résilience ?

**Indice 3** : Plusieurs AZ dans une seule Région offrent de la résilience sans franchir les frontières de Région.

**Réponse** : B

**Explication** : `us-west-2` garde toutes les données dans une seule Région, satisfaisant l'exigence de politique.
Déployer sur plusieurs AZ dans cette Région protège contre les pannes de centres de données
sans déplacer les données vers une autre Région. C'est le bon équilibre
entre conformité et résilience.

**Pourquoi pas A ?** CloudFront met du contenu en cache dans des Emplacements Edge mondialement — les données quitteraient
physiquement `us-west-2`, violant la politique de résidence.

**Pourquoi pas C ?** Répliquer vers `us-east-1` déplace les données des patients vers la côte Est,
violant directement l'exigence d'une seule Région.

**Pourquoi pas D ?** Une seule AZ n'a aucune résilience. Si cette AZ subit une panne,
l'application tombe complètement.

*Domaine SAA-C03 1 — Tâche 1.1 (infrastructure mondiale, souveraineté des données)*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus s'étend pour servir des clients au Mexique et en Colombie. Actuellement tout
tourne dans `us-west-2`. L'équipe débat : devraient-ils ajouter une deuxième Région `us-east-1`,
ou rester en Région unique avec plusieurs AZ ?

Quelles questions poseriez-vous avant de décider ? Quels sont les principaux coûts et risques d'
ajouter une deuxième Région ? Quel est le principal coût de *ne pas* en ajouter une ?

*(Il n'y a pas de réponse unique correcte. Entraînez-vous au raisonnement sur les compromis multi-Région.)*

## Scène post-générique

Leo a corrigé le problème de Singapour. Nimbus a migré vers `us-west-2`. La latence a diminué.
La seule question de suivi de Tom — « est-ce que ça a changé notre facture ? » — a reçu une
réponse avec un chiffre légèrement plus élevé, qu'il a accepté avec une réticence visible.

Ça a duré deux jours avant le problème suivant.

Leo est arrivé au standup avec l'expression que Maya avait appris à reconnaître : l'expression de
quelqu'un qui avait fait quelque chose qu'il ne pouvait pas défaire.

« Donc », dit-il prudemment. « J'ai mis en place le serveur. Et j'avais besoin d'un moyen de me connecter.
Donc j'ai créé un nom d'utilisateur. »

« Et ? » demanda Priya.

« 'Admin'. »

Silence.

« Et le mot de passe ? »

Un silence plus long.

« 'Admin123'. »

Priya se leva.

Dans le prochain chapitre : comment Nimbus contrôle qui peut toucher à quoi — et ce qui se passe quand ça tourne mal.
