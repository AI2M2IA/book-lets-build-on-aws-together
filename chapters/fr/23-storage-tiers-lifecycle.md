# Chapitre 23 : Le système de classement qui s'organise tout seul

Un cabinet d'avocats garde les dossiers actifs sur le bureau. Les affaires terminées vont dans une armoire de classement. Les affaires datant de trois ans vont dans des boîtes de stockage à la cave. Les affaires datant de dix ans vont dans un service d'archivage externalisé qui coûte quelques centimes par boîte mais prend deux jours pour récupérer quoi que ce soit.

La même information, stockée à des coûts différents selon la fréquence d'accès.

---

Avec l'automatisation des workflows en place et le flux de commandes enfin stable, Tom était revenu à sa revue des coûts. La facture S3 traînait dans un coin de sa tête depuis le trimestre précédent — l'une de ces lignes qui n'arrêtaient pas de grossir sans que personne ne la regarde directement. Il avait enfin le temps de la regarder.

Il appela Leo.

« On a 4,2 téraoctets dans S3 », dit Leo après vérification.

« De quoi ? »

« Photos de restaurants. Reçus de commandes. Exports analytiques. Instantanés de sauvegarde datant de 18 mois. »

« Quand quelqu'un a-t-il accédé pour la dernière fois à une sauvegarde datant de 18 mois ? »

Leo vérifia les journaux d'accès.

« En octobre dernier », dit-il. « Une fois. Pour vérifier le format de sauvegarde. »

« Donc on paie 18 mois de sauvegardes au tarif plein S3 Standard. »

« Oui. »

« Combien cela coûte-t-il par mois — Glacier vs Standard ? » demanda Tom, en ouvrant déjà la page de tarification.

S3 Standard : 0,023 $ par Go par mois. S3 Glacier Instant Retrieval : 0,004 $ par Go par mois.

Tom fit le calcul.

« On pourrait réduire cette facture significativement », dit-il, « juste en déplaçant les vieilles données vers un stockage moins cher. »

« Il faudrait savoir ce qui est vieux », dit Leo.

« S3 le sait. Il suit l'heure du dernier accès. »

**Classes de stockage S3 : le spectre complet**

Le chapitre 5 a présenté S3 Standard comme la classe de stockage principale. S3 a en réalité huit classes de stockage, chacune conçue pour différents modèles d'accès (la huitième, **S3 Express One Zone**, est une classe spécialisée à une seule AZ pour les charges de travail critiques en latence et apparaît rarement en dehors des scénarios à haute performance) :

**S3 Standard** : Pour les données fréquemment accédées. Faible latence (millisecondes). Coût le plus élevé. Pas de durée minimale de stockage. À utiliser pour les données actives : les photos de menus actuelles, les commandes d'aujourd'hui, les journaux récents.

**S3 Standard-Infrequent Access (S3 Standard-IA)** : Pour les données accédées moins d'une fois par mois. Même récupération en millisecondes que Standard, mais coût de stockage plus faible + frais de récupération par Go. Durée minimale de stockage de 30 jours. À utiliser pour les données dont vous avez besoin immédiatement quand vous y accédez, mais rarement : les reçus de commandes plus anciens, les exports analytiques datant de 6 mois.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)** : Identique à S3 Standard-IA (y compris le minimum de 30 jours) mais stocké dans une seule Zone de disponibilité (au lieu de trois). Moins durable (si cette AZ subit une catastrophe, les données peuvent être perdues), mais 20 % moins cher. À utiliser pour les données pouvant être recréées si perdues : cache de miniatures, sorties de traitement temporaires.

**S3 Glacier Instant Retrieval** : Données archivées dont vous avez besoin occasionnellement. Récupération en millisecondes. Coût de stockage très faible, coût de récupération par Go plus élevé. Durée minimale de stockage de 90 jours. À utiliser pour les données accédées une fois par trimestre ou moins : rapports de conformité trimestriels, instantanés de sauvegarde datant de 12 mois.

**S3 Glacier Flexible Retrieval** : Archive profonde, récupérée en minutes à heures. Coût plus faible que Glacier Instant Retrieval. À utiliser pour les données d'archivage moins urgentes.

**S3 Glacier Deep Archive** : Option la moins coûteuse. Récupérée en 12 heures. Durée minimale de stockage de 180 jours. À utiliser pour les données qui doivent être conservées pour la conformité réglementaire mais dont l'accès n'est jamais attendu : dossiers fiscaux sur 7 ans, journaux d'audit sur 10 ans.

Le modèle : à mesure que la fréquence d'accès diminue, le coût diminue mais le temps de récupération augmente (et le coût par récupération augmente). Choisissez la classe qui correspond à votre modèle d'accès.

**Politiques de cycle de vie S3 : le système de classement automatisé**

Déplacer manuellement des fichiers entre les classes de stockage est sujet aux erreurs et chronophage. Les **politiques de cycle de vie** S3 automatisent cela en fonction des règles que vous définissez.

Une règle de cycle de vie a deux composantes :

**Filtre** : À quels objets la règle s'applique (tous les objets, objets avec un préfixe spécifique, objets avec des tags spécifiques).

**Actions** : Quoi faire, après combien de jours.

Exemple de politique de cycle de vie pour les reçus de commandes de Nimbus :

```
Transition vers S3 Standard-IA après 90 jours
Transition vers S3 Glacier Instant Retrieval après 365 jours
Transition vers S3 Glacier Flexible Retrieval après 540 jours (18 mois)
Transition vers S3 Glacier Deep Archive après 2555 jours (7 ans)
Supprimer après 2920 jours (8 ans)
```

Cette politique unique garantit :

- Reçus actifs (< 90 jours) : S3 Standard, accès rapide
- Reçus récents (90-365 jours) : Standard-IA, pas cher mais instantanément disponible
- Reçus plus anciens (1 an à 18 mois) : Glacier Instant, très peu cher, millisecondes en cas de besoin
- Reçus historiques (18 mois à 7 ans) : Glacier Flexible, encore moins cher — la récupération prend des heures, pas des millisecondes
- Reçus expirés (> 8 ans) : Automatiquement supprimés

Un piège a presque fait dérailler le plan. Depuis fin 2024, les règles de cycle de vie **ne transitionnent pas par défaut les objets de moins de 128 Ko** — et les reçus de Nimbus faisaient en moyenne 18 Ko chacun. Pour que la politique les déplace réellement, Leo a dû remplacer la taille d'objet minimale par défaut sur la règle (les filtres de cycle de vie peuvent aussi sélectionner par taille avec `ObjectSizeGreaterThan`/`ObjectSizeLessThan`). Le défaut existe pour une bonne raison : les classes d'archive facturent ~40 Ko de surcharge de métadonnées par objet et chaque transition coûte des frais de requête, donc pour des millions de petits objets la transition peut coûter plus qu'elle n'économise. Leo a fait le calcul pour les reçus — à sept ans de rétention, ça valait quand même le coup.

Tom examina les économies projetées : de 847 $/mois à environ 220 $/mois.

« En définissant juste... ce qui est vieux et où ça doit aller ? » dit-il.

« Et S3 le déplace automatiquement », confirma Leo. « Pas de cron job. Pas de migration manuelle. Pas d'oubli. »

« Attends — mais *pourquoi* S3 ne fait-il pas cela par défaut ? » demanda Maya depuis l'autre bout de la pièce. « Pourquoi faut-il définir une politique du tout ? »

« Parce que "vieux" est différent pour chaque bucket », dit Leo. « Une archive de conformité et un téléversement de photos ont besoin de règles de rétention complètement différentes. S3 ne peut pas deviner lequel est lequel. »

Vous vous demandez peut-être : que se passe-t-il si les mauvaises données sont déplacées vers Glacier et que vous en avez besoin de toute urgence ? Vous paieriez des frais de récupération et attendriez — c'est pourquoi vous devriez tester vos règles de cycle de vie sur un petit bucket non critique d'abord, et vérifier les journaux d'accès avant de déployer sur les données de production. Une erreur de récupération sur 18 mois de sauvegardes coûterait bien moins qu'un incident visible par le client, mais il vaut quand même la peine de tester d'abord.

Si le modèle d'accès de vos données est prévisible (les journaux sont toujours froids après 30 jours), utilisez des règles de cycle de vie explicites — elles sont plus économiques que les frais de surveillance par objet d'Intelligent-Tiering. Si vos modèles d'accès changent dans le temps ou sont difficiles à prédire, utilisez Intelligent-Tiering — mais sachez qu'il ignore simplement les objets de moins de 128 Ko : ils ne sont pas surveillés, ne sont pas facturés de frais de surveillance, et ne quittent jamais le niveau d'accès fréquent.

**S3 Intelligent-Tiering : la classe auto-organisante**

Et si vous ne savez pas à quelle fréquence vous accéderez à vos données ?

**S3 Intelligent-Tiering** surveille les modèles d'accès pour chaque objet et le déplace automatiquement entre les niveaux d'accès :

- **Niveau d'accès fréquent** : Pour les objets accédés récemment
- **Niveau d'accès peu fréquent** : Objets non accédés pendant 30 jours
- **Niveau d'accès archive instantanée** : Objets non accédés pendant 90 jours
- **Niveau d'accès archive** : Objets non accédés pendant 90 à 730 jours (optionnel)
- **Niveau d'accès archive profonde** : Objets non accédés pendant 180 à 730+ jours (optionnel)

S3 Intelligent-Tiering facture de petits frais de surveillance par objet par mois (0,0025 $ pour 1 000 objets), mais sans frais de récupération pour les niveaux Fréquent et Peu fréquent.

Utilisez Intelligent-Tiering quand :

- Les modèles d'accès sont imprévisibles ou changent dans le temps
- Vous avez un mélange de données chaudes et froides que vous ne pouvez pas facilement classifier
- Vous avez des objets de plus de 128 Ko (les objets plus petits ne sont pas du tout surveillés ni hiérarchisés automatiquement)

Utilisez des classes de stockage explicites (avec des politiques de cycle de vie) quand :

- Les modèles d'accès sont prévisibles
- Vous voulez que chaque objet — y compris les petits — passe réellement vers des classes moins chères
- Les objets sont petits (< 128 Ko)

La mise en garde sur les petits fichiers mérite d'être soulignée. Nimbus avait 2,3 millions d'objets de reçus de commandes dans S3 — chacun était un petit fichier JSON, faisant en moyenne environ 18 Ko. Tom avait initialement envisagé Intelligent-Tiering pour le bucket des reçus, jusqu'à ce qu'il lise les petits caractères.

Les objets de moins de 128 Ko **ne sont pas surveillés et pas hiérarchisés automatiquement** dans Intelligent-Tiering. Ils ne paient pas les frais de surveillance (0,0025 $ pour 1 000 objets par mois) — mais ils ne bougent jamais non plus : ils restent dans le niveau d'accès fréquent, à des prix équivalents à Standard, pour toujours.

Donc pour les reçus de 18 Ko, Intelligent-Tiering n'aurait rien coûté de plus à Nimbus — il n'aurait simplement *rien fait*. 2,3 millions de reçus froids auraient continué à payer les prix du stockage chaud (0,023 $/Go) indéfiniment, tandis que les niveaux d'archive (0,00099 $/Go) restaient hors d'atteinte.

« Donc Intelligent-Tiering est conçu pour les grands objets », dit Maya.

« Ou pour les charges de travail où vous ne connaissez vraiment pas le modèle d'accès », dit Tom. « Pour un bucket de tout petits fichiers où on sait que les reçus sont chauds pendant 90 jours et froids après, une règle de cycle de vie explicite — avec le remplacement de petit objet vu plus tôt — est la seule chose qui les déplace réellement. »

Intelligent-Tiering est un excellent service. Ce n'est juste pas le bon outil pour chaque bucket : en dessous du seuil de 128 Ko il est inoffensif mais inutile, et seules les règles de cycle de vie explicites (avec un remplacement de taille) hiérarchiseront les petits objets.

**Quand vous avez réellement besoin de récupérer les données : une histoire de récupération Glacier**

Trois mois après le déploiement des politiques de cycle de vie, Nimbus reçut un avis juridique. Un ancien partenaire restaurant contestait une clause contractuelle, et les avocats de Nimbus avaient besoin de 18 mois de dossiers de commandes pour ce partenaire — tout, de l'ouverture jusqu'à la résiliation du contrat.

« Et si quelqu'un essaie de s'introduire par le processus de découverte juridique ? » dit Priya. Elle ne plaisantait pas. « Des avocats demandant des exports de données en masse sont un vecteur courant d'ingénierie sociale. Vérifiez que la demande est légitime avant d'ouvrir tout magasin de données. »

La demande était légitime. Les dossiers étaient dans S3, à travers trois classes de stockage : les 90 jours les plus récents dans Standard-IA, l'année précédente dans Glacier Instant Retrieval, le reste dans Glacier Flexible Retrieval (la politique de cycle de vie avait utilisé Flexible pour les données de plus de 18 mois).

Les dossiers Glacier Instant étaient immédiatement disponibles. Leo filtra par ID de restaurant, exécuta une requête Athena pour identifier les dossiers de commandes correspondants, et les exporta vers un emplacement S3 sécurisé. Cinq minutes de travail.

Les dossiers Glacier Flexible nécessitaient une demande de restauration :

```bash
aws s3api restore-object \
    --bucket nimbus-order-receipts \
    --key "2022/06/restaurant-47/" \
    --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'
```

Glacier Flexible Retrieval **niveau Standard** : 3 à 5 heures. Les dossiers seraient disponibles comme copie temporaire dans S3 Standard pendant 7 jours, puis automatiquement supprimés. La copie archivée originale reste dans Glacier.

Coût de la récupération entière : 0,01 $ par Go récupéré au niveau Standard, pour 4,2 Go de dossiers archivés. Environ quatre centimes. (Le niveau Expedited — 1 à 5 minutes — coûte 0,03 $ par Go, mais sa disponibilité n'est pas garantie de la manière dont l'est celle de Standard.)

« Quatre centimes », dit Maya, quand Leo fit son rapport. « Pour 18 mois de dossiers. »

« On a stocké 4,2 Go à 0,0036 $ par Go par mois pendant un an et demi », dit Leo. « Le coût de stockage était d'environ vingt-sept centimes au total. Le coût de récupération était de quatre. Contre un dollar soixante-quatorze si on l'avait gardé dans S3 Standard pendant 18 mois. »

« Et la seule chose qui importait », dit Priya, « était qu'on se souvienne que c'était dans Flexible Retrieval et qu'on planifie l'attente de 3 à 5 heures. Si les avocats avaient eu besoin de cela en 30 minutes, on aurait eu un problème. »

C'est la leçon opérationnelle importante au sujet de Glacier : ce n'est pas seulement une décision de coût, c'est une décision de SLA de récupération. Avant d'archiver des données dans Glacier Flexible ou Deep Archive, documentez le temps de récupération pour quiconque pourrait en avoir besoin. « Les données existent » et « on peut les récupérer en 30 minutes » sont deux garanties différentes.

**Téléchargement multipart : pour les grands objets**

S3 a une limite de téléchargement unique de 5 Go. Pour les objets plus grands, vous devez utiliser le **téléchargement multipart** : divisez l'objet en parties, téléchargez chacune en parallèle, et S3 les assemble.

Avantages :

- Téléchargements plus rapides (parallèles)
- Peut reprendre les téléchargements échoués (remettre en ligne uniquement les parties échouées)
- Obligatoire pour les objets > 5 Go

Astuce de règle de cycle de vie : Définissez une règle de cycle de vie pour supprimer les téléchargements multipart incomplets après 7 jours. Si un téléchargement échoue à mi-chemin et n'est pas nettoyé, ces parties partielles sont stockées et facturées — sans objet assemblé à montrer.

Tom apprécia énormément ce conseil.

Il exécuta la commande AWS CLI pour lister les téléchargements multipart incomplets dans tous les buckets de Nimbus :

```bash
aws s3api list-multipart-uploads --bucket nimbus-restaurant-photos
```

La sortie était plus longue qu'il ne s'y attendait. Il la passa à un compteur.

340 téléchargements incomplets. Le plus ancien datait de 8 mois — le test de charge de Leo sur le flux de téléversement des photos de restaurants. Le test de charge avait généré des centaines de téléchargements partiels, dont aucun n'avait été complété (le test n'avait pas été conçu pour les compléter, juste pour tester le point de terminaison d'initiation). 340 téléchargements incomplets, dans S3, chacun représentant des données partielles qu'AWS stockait et facturait.

« Combien cela coûte-t-il par mois ? » dit Tom. Il ne demandait pas d'information. Il calculait à voix haute.

La taille combinée des parties incomplètes : 48 Go. À 0,023 $/Go : 1,10 $/mois. Pour huit mois : 8,80 $ déjà dépensés.

Au taux de croissance actuel, si non nettoyé : continuant indéfiniment.

« Leo », dit Tom.

« Je l'ai déjà déployé — oh », dit Leo, en venant. « Le test de charge. J'ai oublié de nettoyer les téléchargements partiels. »

« Il y a huit mois. »

« Je ne savais pas que S3 stocke les parties même si le téléchargement ne se termine jamais. »

« Il les stocke. Il les facture. Et il n'y a aucun tableau de bord qui vous avertit à ce sujet. Elles s'accumulent simplement. »

La solution : une règle de cycle de vie pour supprimer les parties de téléchargement multipart incomplètes après 7 jours.

```
Règle : Supprimer les parties de téléchargement multipart incomplètes
Préfixe : (tous les objets)
Action : Supprimer les téléchargements multipart incomplets après 7 jours
```

Les 340 téléchargements existants ont été nettoyés manuellement. La règle de cycle de vie garantit qu'aucun futur test de charge ou téléchargement échoué ne s'accumule de la même façon. Les 1,10 $/mois qui s'étaient discrètement accumulés pendant huit mois ont cessé — petit en dollars, mais le modèle (invisible, croissant, sans plafond) était la partie qui valait la peine d'être tuée.

« La règle fait trois lignes », dit Tom. « J'aurais dû la définir sur chaque bucket à la création. » Il mit à jour la liste de contrôle de création de buckets : chaque nouveau bucket S3 obtient une règle de nettoyage des téléchargements multipart par défaut.

**Trois couches de sécurité : un rappel rapide avant le détour**

« Et si quelqu'un essaie de s'introduire et de supprimer les journaux d'audit ? » demanda Priya de nouveau — cette fois dans le contexte d'un modèle de menace spécifique. « Pas juste une règle de cycle de vie mal configurée. Un initié malveillant. Une clé IAM compromise avec accès en écriture. »

L'équipe avait déjà les réponses — ils ne les avaient juste pas appliquées à ce bucket. Trois couches, chacune couverte plus tôt dans le livre, chacune répondant à un vecteur de menace différent :

**Le versionnage** (chapitre 5) rend les suppressions réversibles — un DELETE devient un marqueur de suppression, et les versions précédentes restent restaurables. Pour des données écrites une seule fois comme les reçus de commandes, la surcharge de stockage est minimale : il n'y a jamais qu'une seule version par objet.

**S3 Object Lock** (chapitre 5) rend les objets véritablement immuables — stockage WORM qu'aucune clé d'administrateur ne peut supprimer pendant la période de rétention. Pour les reçus, avec leur exigence de rétention fiscale de 7 ans, l'équipe a choisi le mode Compliance : aucune mauvaise configuration de cycle de vie, aucune erreur IAM, aucun identifiant compromis ne peut les supprimer avant que l'auditeur ne le demande. Et Object Lock coexiste avec les transitions de cycle de vie — une règle déplaçant les reçus vers Glacier Deep Archive fonctionne toujours ; les données deviennent moins chères et restent immuables.

**Les événements de données S3 de CloudTrail** (chapitres 16-17) vous disent ce qui est arrivé aux données : chaque GET, PUT, DELETE et COPY journalisé avec qui, d'où, et quand — la matière première que GuardDuty (chapitre 17) utilise pour alerter sur les anomalies.

« Versionnage pour la récupération en cas d'accident. Object Lock pour l'immuabilité de conformité. CloudTrail pour la criminalistique », résuma Priya. « On a couvert chacun de ceux-ci séparément. La nouvelle décision aujourd'hui est d'activer les trois pour ce bucket. »

**Réplication cross-région : les dossiers de commandes comme reprise après sinistre**

Le bucket des reçus de commandes de Nimbus était dans us-west-2. C'était intentionnel — us-west-2 est l'endroit où l'application s'exécutait. Mais « l'application est dans us-west-2 » et « tous les dossiers de commandes sont uniquement dans us-west-2 » sont des profils de risque différents.

Si Nimbus avait besoin d'activer un site de reprise après sinistre dans us-east-1, les dossiers de commandes devraient y être aussi. Attendre pour les copier au milieu d'une panne régionale n'est pas un plan de reprise.

Priya recommanda la **réplication cross-région (CRR)** pour le bucket des reçus de commandes. La règle :

```
Source : nimbus-order-receipts (us-west-2)
Destination : nimbus-order-receipts-dr (us-east-1)
Réplication : Tous les objets
Classe de stockage dans la destination : S3 Standard-IA (moins cher — c'est la copie de DR, rarement accédée)
```

Les mécanismes étaient familiers depuis le chapitre 5 : réplication asynchrone des nouvelles écritures (la plupart des objets en moins de 15 minutes ; un SLA garanti nécessite de payer pour **S3 Replication Time Control**), versionnage requis sur les deux buckets, un rôle IAM avec permission de lecture-source/écriture-destination. Le détail à remarquer dans la règle ci-dessus : la destination utilise une *classe de stockage différente* de la source — Standard-IA pour la copie de DR, au lieu de payer pour une seconde copie Standard qui est rarement lue. Et le prérequis de versionnage ne coûtait rien de plus — ils activaient déjà le versionnage pour la récupération en cas d'accident. (La sœur de CRR, la **réplication same-région (SRR)**, copie les objets entre buckets dans la *même* région — utile pour une copie de conformité dans un compte séparé, l'agrégation de journaux, ou des environnements de test alimentés à partir de données de production.)

Un piège que Priya signala avant que quiconque ne le rencontre : la réplication n'est **pas rétroactive**. Les objets qui existent déjà dans le bucket quand vous activez la règle ne sont pas répliqués — seules les nouvelles écritures le sont. Les équipes activent CRR en s'attendant à ce que toutes leurs données existantes apparaissent dans la destination, puis découvrent que le bucket de DR est presque vide. Pour les objets préexistants, vous exécutez **S3 Batch Replication**, une opération séparée qui applique les règles de réplication aux objets qui étaient déjà là. Nimbus l'exécuta une fois pour alimenter le bucket de DR avec les 0,8 To de reçus existants.

« Et les marqueurs de suppression ? » demanda Priya. « Si quelqu'un supprime un reçu dans us-west-2, est-ce que ça réplique la suppression vers us-east-1 ? »

Par défaut, non — dans les configurations de réplication actuelles (le schéma V2 que la console crée), **les marqueurs de suppression ne sont pas répliqués**. Quelqu'un supprime un reçu dans us-west-2, et la copie us-east-1 continue de le servir comme si rien ne s'était passé. Si vous *voulez* que le bucket de DR reflète les suppressions, vous activez explicitement la réplication des marqueurs de suppression sur la règle (non prise en charge sur les règles avec des filtres de tags) — c'était le défaut dans l'ancien schéma V1, que la documentation plus ancienne décrit encore. Dans tous les cas, les expirations de cycle de vie ne répliquent jamais leurs marqueurs de suppression.

La réplication n'est *toujours pas* une solution de sauvegarde, cependant — pour les raisons inverses : elle ne protégera pas contre les suppressions permanentes de versions ou les écrasements malveillants se répliquant vers le miroir, et elle n'a pas de sémantique de rétention. Pour une vraie sauvegarde, associez le versionnage à Object Lock, ou utilisez AWS Backup.

« Combien cela coûte-t-il par mois ? » demanda Tom.

Stockage pour 0,8 To en S3 Standard-IA dans us-east-1 : 10,00 $/mois. Plus le transfert de données de réplication (facturé par Go transféré entre régions) : minimal à leur volume d'écriture actuel. Coût additionnel total : environ 10 à 11 $/mois pour une copie cross-région complète de tous les dossiers de commandes.

Tom le nota sans se plaindre.

**S3 Storage Lens : voir l'image complète**

Tom avait fait son audit manuellement — ouvrant la console AWS bucket par bucket, exécutant des commandes AWS CLI pour compter les objets, vérifiant l'explorateur de facturation pour les coûts de stockage par bucket. Il lui avait fallu la majeure partie d'un après-midi pour construire ce tableur.

**S3 Storage Lens** est l'outil AWS qui remplace ce processus manuel. Il fournit une visibilité à l'échelle de l'organisation sur l'utilisation et l'activité S3 à travers tous les buckets, tous les comptes, et toutes les régions — dans un seul tableau de bord.

Les métriques qui comptent le plus pour l'optimisation des coûts :

**Octets de versions non courantes** : Combien de stockage est consommé par les versions plus anciennes (quand le versionnage est activé). Le versionnage est essentiel pour la sécurité, mais si un document est mis à jour fréquemment, les versions plus anciennes s'accumulent. Une règle de cycle de vie pour expirer les versions non courantes après 30 jours empêche le gonflement des versions.

**Octets de téléchargements multipart incomplets** : Exactement le problème que Leo avait causé avec le test de charge, fait remonter automatiquement. Sans Storage Lens, Tom devait savoir chercher les téléchargements multipart incomplets. Avec Storage Lens, ils apparaissent dans le tableau de bord comme une ligne.

**% de requêtes renvoyant 403** : Un pic de réponses 403 (Forbidden) sur un bucket qui devrait être accessible publiquement pourrait indiquer une politique de bucket mal configurée. Un pic sur un bucket privé pourrait indiquer une tentative de scan ou de sondage. Dans tous les cas, c'est un signal qui vaut la peine d'être étudié.

**Taille moyenne des objets** : Un bucket de tout petits objets (moyenne 2 Ko) se comporte différemment d'un bucket de grands objets (moyenne 50 Mo) en termes d'économie d'Intelligent-Tiering, de coûts de requête, et de performance de requête pour Athena.

S3 Storage Lens a un niveau gratuit qui couvre les métriques essentielles. Les métriques avancées (statistiques de requêtes, groupes de lentilles pour le filtrage) ont un coût additionnel par million d'objets par mois — petit par rapport aux économies qu'il permet.

« Pourquoi n'avons-nous pas utilisé cela dès le départ ? » demanda Maya.

« On n'avait pas 4,2 téraoctets dès le départ », dit Tom. « À petite échelle, un tableur fonctionne. À cette échelle, l'échelle elle-même devient un argument pour l'outil. »

C'est un thème récurrent dans l'architecture Nimbus : le bon outil pour une échelle donnée n'est pas toujours le bon outil pour l'échelle suivante. S3 Storage Lens vaut la peine d'être configuré dès que votre utilisation de S3 dépasse ce que vous pouvez auditer manuellement en un après-midi — ce qui correspond à peu près au moment où les économies qu'il permet commencent à dépasser significativement le temps qu'il fait gagner.

## Points forts et limites

**Pourquoi les niveaux de stockage S3 sont importants** :

- Réduction significative des coûts sans sacrifier la durabilité ou la disponibilité de ce qui est réellement accédé
- Les politiques de cycle de vie automatisent l'ensemble du processus — pas de charge opérationnelle
- S3 Intelligent-Tiering supprime la nécessité de prédire les modèles d'accès

**Là où ça se complique** :

- Des frais de durée minimale de stockage s'appliquent aux classes Glacier (90 jours pour Glacier Instant, 180 jours pour Deep Archive) — la suppression anticipée entraîne quand même le frais minimum
- Les frais de récupération peuvent vous surprendre si vous accédez fréquemment aux données archivées
- Les transitions de cycle de vie prennent du temps — les objets ne sont pas déplacés instantanément après le déclenchement de la règle
- Intelligent-Tiering ignore les objets de moins de 128 Ko — pas de frais, mais pas de hiérarchisation non plus ; et les règles de cycle de vie les ignorent par défaut sauf si vous remplacez la taille d'objet minimale

## Résumé

L'automatisation des workflows du chapitre 22 a optimisé la façon dont Nimbus traite les requêtes. Ce chapitre optimise ce que Nimbus paie pour les données qu'il conserve mais qu'il n'accède pas. Le principe est le même : arrêter de payer pour le mauvais niveau.

- S3 a huit classes de stockage : Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive — plus Express One Zone (faible latence spécialisée, une seule AZ).
- Les **politiques de cycle de vie** automatisent les transitions entre les classes de stockage en fonction de l'âge — définissez une fois, S3 s'en occupe pour toujours.
- **S3 Intelligent-Tiering** déplace automatiquement les objets entre les niveaux en fonction des modèles d'accès réels — à utiliser pour les charges de travail imprévisibles avec des objets de plus de 128 Ko. Les objets plus petits ne sont pas surveillés ni hiérarchisés automatiquement (et ne paient pas de frais de surveillance) — ils restent dans le niveau d'accès fréquent.
- La **récupération Glacier** nécessite une demande de restauration pour les niveaux Flexible et Deep Archive. Planifiez le temps de récupération (minutes à 12 heures) avant d'archiver toute donnée ayant un SLA de récupération.
- Les **téléchargements multipart incomplets** s'accumulent silencieusement et entraînent des frais de stockage. Ajoutez une règle de cycle de vie pour supprimer les parties incomplètes après 7 jours sur chaque bucket.
- **Trois couches de sécurité** : versionnage (suppressions réversibles), Object Lock (immuabilité pour la conformité), événements de données CloudTrail (criminalistique et détection d'anomalies).
- **Réplication cross-région (CRR)** : répliquer les dossiers de commandes vers une région de DR automatiquement. Nécessite le versionnage sur les deux buckets. Configurez si les marqueurs de suppression se répliquent selon que la copie de DR est un miroir ou une sauvegarde.
- Le **téléchargement multipart** est obligatoire pour les objets > 5 Go et recommandé pour tout objet > 100 Mo.
- **S3 Object Lock** fournit un stockage WORM pour les scénarios de conformité — le mode Governance peut être remplacé par les administrateurs ; le mode Compliance ne peut être remplacé par personne.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.1)*

- **Signaux de sélection de classe de stockage** :
  - « Fréquemment accédé » → Standard
  - « Accédé une fois par mois, récupération instantanée requise » → Standard-IA
  - « Peut tolérer des heures de récupération, rarement accédé » → Glacier Flexible Retrieval
  - « Conformité réglementaire, rétention 7+ ans, jamais accédé » → Glacier Deep Archive
  - « Modèles d'accès inconnus ou changeants » → Intelligent-Tiering
- **Modèles d'examen de politique de cycle de vie** : « réduire automatiquement les coûts de stockage à mesure que les données vieillissent », « transition vers l'archive après 90 jours » → politiques de cycle de vie.
- **Intelligent-Tiering et petits objets** : les objets de moins de 128 Ko ne sont pas surveillés, ne paient pas de frais de surveillance, et ne sont jamais hiérarchisés automatiquement — ils restent en accès fréquent. Les règles de cycle de vie ignorent aussi les objets de moins de 128 Ko par défaut (remplaçable). L'examen peut tester l'un ou l'autre fait.
- **Exigences CRR** : Le versionnage doit être activé sur les buckets source et destination. Source et destination doivent être dans des régions différentes.
- **S3 Object Lock** : « WORM », « immuable », « SEC 17a-4 », « ne peut pas être supprimé ou modifié » → Object Lock. Mode Governance (peut être remplacé par les administrateurs). Mode Compliance (ne peut être remplacé par personne, y compris root).
- **Restauration Glacier** : Les objets dans Glacier ne sont pas immédiatement disponibles. Vous devez « restaurer » une copie dans S3 Standard pour l'accès. La copie restaurée est temporaire (vous définissez la durée). L'original reste dans Glacier.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre S3 Standard-IA et S3 Glacier Instant Retrieval. Quel modèle d'accès rend chacun approprié ?

*(Indice : Réfléchissez à la fréquence à laquelle vous accéderiez aux données et à la rapidité dont vous avez besoin quand vous y accédez.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise génère 500 Go de journaux d'application quotidiennement. Les journaux sont intensément consultés pendant les 7 premiers jours (débogage et surveillance). Après 7 jours, les journaux sont rarement accédés mais doivent être disponibles dans les 30 minutes si nécessaire. Après 1 an, les journaux doivent être conservés pour la conformité mais ne sont jamais accédés. L'entreprise doit minimiser les coûts de stockage tout en respectant ces exigences.

Quelle politique de cycle de vie S3 répond LE MIEUX à ces exigences ?

A) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Glacier Deep Archive après 7 jours ; expirer après 365 jours  
B) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Standard-IA après 7 jours ; transitionner vers S3 Glacier Flexible Retrieval après 365 jours  
C) Stocker tous les journaux dans S3 Intelligent-Tiering dès le premier jour  
D) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Glacier Instant Retrieval après 7 jours ; transitionner vers S3 Glacier Deep Archive après 365 jours

**Indice 1** : « Disponible dans les 30 minutes » exclut quelle classe de stockage ?

**Indice 2** : Deep Archive prend 12 heures pour récupérer — ne répond pas à l'exigence de 30 minutes pour les jours 7-365.

**Indice 3** : Après 365 jours, le temps de récupération n'a pas d'importance (jamais accédé), donc l'option la moins chère s'applique.

**Réponse** : D

**Explication** : S3 Standard pendant 7 jours gère l'accès fréquent. Glacier Instant Retrieval fournit un accès en millisecondes pour les jours 7-365 — répondant à l'exigence de 30 minutes à un coût bien inférieur à Standard-IA. Après 365 jours, Glacier Deep Archive est l'option la moins chère pour les données jamais accédées.

**Pourquoi pas A ?** Glacier Deep Archive prend 12 heures pour récupérer — ne répond pas à l'exigence de « disponibilité dans les 30 minutes » pour les jours 7-365.

**Pourquoi pas B ?** Standard-IA ne peut même pas être la première étape ici : S3 exige que les objets vieillissent 30 jours dans Standard avant qu'une règle de cycle de vie puisse les transitionner vers Standard-IA ou One Zone-IA — donc « Standard-IA après 7 jours » est une règle invalide. (La règle des 30 jours ne s'applique pas aux classes Glacier, ce qui est exactement pourquoi D fonctionne.) Et même en mettant cela de côté, Glacier Instant Retrieval est significativement moins cher pour les données rarement accédées après le jour 7.

**Pourquoi pas C ?** Intelligent-Tiering a des frais de surveillance par objet et pourrait ne pas déplacer les journaux vers les niveaux d'archive aussi agressivement que des règles de cycle de vie explicites. Pour un grand volume de journaux avec un modèle d'accès prévisible, des règles de cycle de vie explicites sont plus rentables.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus a trois types de données S3 avec des caractéristiques différentes :

- Photos de restaurants : téléversées une fois, accédées de nombreuses fois par les clients, jamais supprimées
- Reçus de commandes : accédés par les clients dans le premier mois, conservés 7 ans à des fins fiscales
- Exports analytiques : générés quotidiennement, analysés la semaine suivante, conservés 2 ans

Concevez une politique de cycle de vie pour chacun. Pour les photos de restaurants, Intelligent-Tiering aurait-il du sens ? Pour les reçus de commandes, quelle classe de stockage couvre la fenêtre de 1 mois à 7 ans ? Pour les exports analytiques, comment structureriez-vous le bucket pour appliquer différentes politiques à différents préfixes ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la sélection des niveaux de stockage pour des données du monde réel.)*

## Scène post-générique

Tom mit en œuvre les politiques de cycle de vie.

Leo avait aidé à configurer la première règle. « Ça ira », avait-il dit. « La durée minimale de stockage ne s'applique que si on supprime tôt — et on ne supprime rien. » Il vérifia les exigences de durée minimale Glacier à mi-chemin. « En fait, laisse-moi relire ça. »

Sur un autre bucket — les exports analytiques temporaires de staging — il avait failli combiner une transition de 30 jours vers Glacier Instant Retrieval avec une règle d'expiration de 60 jours. La durée minimale de stockage pour Glacier Instant est de 90 jours : ces objets seraient entrés dans Glacier au jour 30 et auraient été supprimés au jour 60, et S3 aurait quand même facturé les 90 jours complets pour chacun d'eux — payant des prix d'archive pour un stockage qui n'existait plus. Il abandonna entièrement la transition Glacier pour ce bucket ; des données supprimées à 60 jours ne vivent jamais assez longtemps pour amortir un minimum de 90 jours. La politique des reçus était sûre telle que conçue : transition vers Standard-IA à 90 jours, Glacier Instant Retrieval à 365 jours, Glacier Flexible Retrieval à 540 jours, Glacier Deep Archive à 2 555 jours.

Il définit aussi la règle de nettoyage des téléchargements multipart sur chaque bucket. Pas parce qu'il y avait plus de téléchargements abandonnés — il n'y en avait pas — mais parce qu'il y en aurait. Les tests de charge arrivent. Les déploiements échouent à mi-chemin. La règle était moins chère que la mémoire nécessaire pour se souvenir de nettoyer manuellement.

La facture S3 est passée de 847 $ à 198 $ le mois suivant.

Il imprima la comparaison et la posa sur le bureau de Maya sans rien dire.

Maya la regarda. Puis la date. Puis Tom.

« Trois semaines », dit-elle.

« Un après-midi pour concevoir les politiques », dit-il. « Une heure pour les mettre en œuvre. Trois semaines pour voir le premier cycle de facturation complet. »

« Réduction des trois quarts des coûts S3. »

« Pour des données qu'on n'accède pas. »

« Et la réplication cross-région ? » demanda Leo.

« Dix dollars de plus par mois », dit Tom. « Pour une copie complète de chaque reçu de commande dans une seconde région. »

« C'est la décision de reprise après sinistre la moins chère qu'on ait prise. »

Maya regarda à nouveau les chiffres.

« Tom », dit-elle, « je veux que vous fassiez cette revue pour chaque service AWS qu'on utilise. Stockage, calcul, réseau. Trouvez le gaspillage. »

Il était déjà de retour à son bureau.

« J'ai commencé la semaine dernière », dit-il.

Dans le prochain chapitre : le niveau de base de données a sa propre version de cette conversation, et Aurora est la réponse que Tom ne s'attendait pas à aimer.
