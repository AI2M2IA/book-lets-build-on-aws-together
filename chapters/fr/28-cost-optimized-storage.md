# Chapitre 28 : La Surprise de la Facture de Stockage

Tom avait soumis le Savings Plan pour EC2. La ligne suivante de la facture était S3 : 198 $/mois (en baisse de 847 $ après les modifications de politique de cycle de vie du chapitre 23).

Puis il regarda EBS : 440 $/mois.

« Ça semble élevé, » dit-il.

Leo consulta la liste des volumes EBS. Il y avait 47 volumes EBS attachés à des instances. Et ensuite il y avait encore 23 volumes non attachés à aucune instance.

« Ces 23 volumes, » dit Tom. « C'est quoi ? »

Leo les vérifia. Ils étaient tous détachés — aucune instance ne les utilisait en ce moment. La plupart avaient été créés à partir d'instantanés à des fins de débogage. Certains provenaient d'instances qui avaient été résiliées mais dont les volumes n'avaient pas été supprimés.

« On paie 0,10 $ par Go par mois pour du stockage que personne ne lit, » dit Leo.

Tom regarda le total : 2,3 To de volumes non attachés.

« Deux cent trente dollars par mois pour du stockage qu'on n'utilise pas, » dit Tom. « Depuis combien de temps ça dure ? »

Leo vérifia les dates de création. Le volume le plus ancien datait de 16 mois.

« Trois mille six cent quatre-vingts dollars, » dit Tom calmement. « On a dépensé trois mille six cents dollars pour du stockage auquel personne n'accède. »

Il supprima les volumes non attachés. Le mois suivant, la facture EBS tomba à 210 $.

**L'Audit des Coûts de Stockage**

La découverte EBS de Tom était le symptôme d'un modèle plus large : les coûts de stockage s'accumulent de manière invisible. Contrairement au calcul (vous remarquez quand 47 serveurs tournent), le stockage s'additionne silencieusement.

Pensez-y comme une location de box. Louer un box est évident sur le relevé de carte de crédit. Mais si vous louez un deuxième box pour un projet, puis un troisième pour de vieux meubles, et que vous ne repassez jamais vérifier ce qu'il y a à l'intérieur — les frais continuent d'apparaître chaque mois, silencieusement, longtemps après que vous avez oublié ce que vous stockez même. Le stockage cloud fonctionne de la même façon : les octets restent là, la facture arrive, et personne ne remet en question jusqu'à ce que quelqu'un ouvre enfin la porte et trouve qu'il est plein de choses dont personne n'a plus besoin.

Un audit complet des coûts de stockage examine :

**S3** :

- Des politiques de cycle de vie sont-elles en place pour tous les buckets ?
- Y a-t-il de vieux instantanés (RDS, EBS) dans S3 ?
- Intelligent-Tiering est-il approprié pour les buckets avec des modèles d'accès incertains ?
- Y a-t-il des objets versionnés créant plusieurs copies jamais accédées ?

**EBS** :

- Y a-t-il des volumes non attachés (aucune instance en cours d'exécution ne les utilisant) ?
- Les volumes gp3 sont-ils correctement configurés ? (Les volumes gp3 par défaut peuvent avoir un débit/IOPS provisionné excessif dont on n'a pas besoin)
- Les instantanés plus anciens que nécessaire sont-ils conservés ?

**RDS** :

- Les périodes de rétention des sauvegardes automatisées sont-elles définies de manière appropriée ? (Plus long = coût de stockage plus élevé)
- Y a-t-il des instantanés manuels d'anciennes instances qui traînent toujours ?
- Des réplicas de lecture issus de migrations de bases de données tournent-ils encore ?

**EFS** :

- Le volume EFS est-il dans la bonne classe de stockage ? (Standard vs Accès peu fréquent)

**Le Versionnage S3 : Le Coût Caché**

Dans le chapitre 5, nous avons mentionné que le versionnage S3 conserve chaque version précédente d'un objet. C'est excellent pour la sécurité. C'est terrible pour les coûts si vous n'avez pas aussi des règles de cycle de vie pour les versions.

Quand le versionnage est activé sur un bucket, chaque fois que vous écrasez un objet, l'ancienne version est conservée. Avec le temps :

- Jour 1 : Image téléversée (v1)
- Jour 30 : Image mise à jour (v1 est maintenant une version « non courante », v2 est courante)
- Jour 60 : Image mise à jour encore (v1 et v2 sont non courantes, v3 est courante)
- Jour 365 : v1, v2... v12 sont toutes stockées. Vous payez pour 12 copies d'une image.

La correction : des règles de cycle de vie pour les versions non courantes.

```
Expirer les versions non courantes après 30 jours
Supprimer les téléchargements multipart échoués après 7 jours
```

Tom a appliqué ces règles à tous les buckets versionnés. Le mois suivant, le stockage S3 a diminué de 18%.

**EBS : Dimensionnement Correct et la Migration vers gp3**

La tarification des volumes EBS a deux composantes :

1. Stockage (par Go par mois)
2. IOPS provisionnés et débit (si vous êtes sur io1/io2 ou payez pour des performances gp3 supplémentaires)

**L'opportunité gp3** : Dans le chapitre 6, nous avons noté que gp3 est la valeur par défaut actuelle et est moins cher que gp2. Si Nimbus avait des volumes créés avant que gp3 ne soit disponible (il a été lancé en décembre 2020), ceux-ci pourraient toujours être gp2.

Tom a trouvé 12 volumes gp2 totalisant 1 200 Go. La migration vers gp3 a économisé 20% sur ces volumes immédiatement, sans dégradation des performances.

**IOPS et débit** : Les volumes gp3 sont livrés avec 3 000 IOPS et 125 Mo/s de débit par défaut, sans frais supplémentaires. Vous pouvez en provisionner plus si votre charge de travail en a besoin. Vérifiez si les performances provisionnées sont réellement utilisées.

Tom a trouvé deux volumes gp3 avec 10 000 IOPS provisionnés. Il a vérifié les métriques CloudWatch : les IOPS moyens réels étaient de 1 200. Il a réduit les IOPS provisionnés à 4 000 (une marge de sécurité au-dessus du pic réel).

Économie mensuelle : 68 $.

**Cycle de vie des instantanés** : Les instantanés EBS sont incrémentiels (chaque instantané ne stocke que les changements depuis le précédent), mais ils s'accumulent. De vieux instantanés des débuts de Nimbus existaient toujours. Tom a conservé 30 jours d'instantanés quotidiens et supprimé le reste.

**EFS : Classes de Stockage**

Amazon EFS a ses propres classes de stockage :

- **EFS Standard** : Pour les fichiers accédés fréquemment. Coût plus élevé.
- **EFS Infrequent Access (IA)** : Pour les fichiers non accédés pendant 30 jours. 92% moins cher que Standard.
- **EFS Archive** : Pour les fichiers non accédés pendant 90 jours. Encore moins cher qu'IA.

**EFS Intelligent-Tiering** : Déplace automatiquement les fichiers entre les classes de stockage en fonction des modèles d'accès.

Tom a activé Intelligent-Tiering sur le volume EFS. Six semaines plus tard, 68% des fichiers avaient été déplacés vers Accès Peu Fréquent. Le coût EFS mensuel est passé de 89 $ à 31 $.

**Tags d'Allocation de Coûts S3 : Trouver Qui Dépense Quoi**

Au fur et à mesure que Nimbus grandissait, plusieurs équipes stockaient des données dans S3. L'équipe d'analytique avait ses propres buckets. L'équipe d'ingénierie avait ses buckets. L'équipe des données de restaurants avait ses buckets.

La facture montrait juste « S3 : 198 $ ». Il n'y avait pas de ventilation par équipe.

Les **tags d'allocation de coûts** vous permettent de taguer les ressources AWS avec des métadonnées métier (équipe, projet, environnement) et de voir les coûts ventilés par ces tags dans AWS Cost Explorer.

Tom a ajouté des tags à tous les buckets S3 :
```
Team: analytics
Environment: production
Project: nimbus-core
```

Après un cycle de facturation avec le tagging, il pouvait voir : « Le lac de données de l'équipe d'analytique coûte 74 $/mois. Les sauvegardes d'ingénierie coûtent 43 $/mois. Les données de restaurants coûtent 81 $/mois. »

Maintenant il pouvait avoir des conversations budgétaires avec chaque équipe au lieu de regarder juste un chiffre agrégé.

**AWS Cost Explorer et AWS Budgets**

**AWS Cost Explorer** : Visualise les coûts historiques et prévus par service, région, tag et type d'utilisation. Essentiel pour comprendre où va l'argent.

**AWS Budgets** : Définit des alertes quand les coûts dépassent (ou sont prévus de dépasser) un seuil. Vous pouvez budgétiser par service, région, tag ou compte.

Tom a mis en place trois budgets :

1. Facture mensuelle totale : Alerte à 90% du montant budgétisé
2. EC2 À la demande : Alerte si les dépenses À la demande dépassent 500 $/mois (signale un manque dans le Savings Plan)
3. Transfert de données sortant : Alerte à 200 $/mois (les coûts de transfert de données peuvent monter en flèche de manière inattendue)

Les Budgets envoyaient des alertes à un canal Slack. L'équipe voyait quand elle approchait des limites, plutôt que de le découvrir sur la facture mensuelle.

**Le Coût de la Négligence**

Tom construisit une feuille de calcul. Il calcula combien Nimbus avait dépensé sur :

- Volumes EBS non attachés (16 mois) : 3 680 $
- Vieux instantanés S3 (découverts et supprimés) : 890 $
- IOPS provisionnés non nécessaires : 816 $
- Économies de migration gp2 vers gp3 (projetées, si faites plus tôt) : 2 160 $ sur 18 mois
- Versions S3 non courantes accumulées : 1 340 $

Total des gaspillages identifiés : environ 8 800 $ sur 18 mois.

« Huit mille huit cents dollars, » dit Maya.

« De négligence, » dit Tom. « Pas de mauvaises décisions architecturales. De nettoyage non effectué. »

« Quelle est la solution systématique ? »

« Des audits réguliers, » dit Priya. « Des revues mensuelles de Cost Explorer. AWS Trusted Advisor signale automatiquement les volumes non attachés et les ressources inactives. Automatiser le nettoyage des modèles de gaspillage connus : supprimer les instantanés plus anciens de N jours, alerter sur les volumes EBS non attachés, expirer les vieilles versions S3. »

« Et, » ajouta Tom, « faire de l'hygiène des coûts une partie du processus de déploiement. Quand un ingénieur résilie une instance EC2, le volume EBS est supprimé automatiquement à moins qu'il n'opte explicitement pour le conserver. »

## Points Forts et Limites

**Discipline d'optimisation des coûts** :

- Des revues régulières attrapent les gaspillages accumulés avant qu'ils ne deviennent significatifs
- Le tagging permet la responsabilisation — les équipes voient leurs propres coûts
- Les alertes automatisées évitent les surprises de facturation
- Les politiques de cycle de vie et le dimensionnement correct sont souvent des économies « définir et oublier »

**Là où ça se complique** :

- Identifier les gaspillages dans un grand compte avec plusieurs équipes nécessite un outillage centralisé
- Certains gaspillages sont intentionnels (garder des instantanés supplémentaires « au cas où ») — le compromis coût/risque est un jugement
- La migration gp3 nécessite une validation soigneuse (les IOPS et le débit par défaut peuvent différer du comportement gp2 dans certains cas limites)
- Les tags d'allocation de coûts nécessitent de la discipline dans toutes les équipes — un tagging incohérent rend les données incomplètes

## Résumé

- **Les coûts de stockage s'accumulent de manière invisible** — des audits réguliers sont essentiels.
- **Les volumes EBS non attachés** sont une source courante de gaspillage. Supprimez-les (ou automatisez la suppression à la résiliation des instances).
- **Dimensionnement EBS** : Migrez gp2 vers gp3 (typiquement 20% d'économies). Supprimez les IOPS provisionnés en excès.
- **Versionnage S3** : Activez des règles de cycle de vie pour les versions non courantes afin d'éviter de payer pour un historique de versions illimité.
- **EFS Intelligent-Tiering** : Déplace automatiquement les fichiers vers des niveaux moins coûteux en fonction de la fréquence d'accès.
- **Tags d'allocation de coûts** : Taguez les ressources avec des métadonnées équipe/projet/environnement pour la visibilité et la responsabilité des coûts.
- **AWS Budgets** : Alertes proactives quand les coûts approchent des seuils. Ne soyez jamais surpris par la facture mensuelle.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.1)*

- **Tags d'allocation de coûts** : Activez les Tags Définis par l'Utilisateur pour l'allocation des coûts dans la console de facturation ; puis taguez les ressources. Cost Explorer affiche les ventilations par tag. Scénario d'examen : « identifier quel département génère le plus de coûts S3 » → tags d'allocation de coûts.
- **AWS Trusted Advisor** : Identifie les instances EC2 sous-utilisées, les volumes EBS non attachés, les équilibreurs de charge inactifs et autres gaspillages. Vérifications de base gratuites ; vérifications complètes nécessitent le Support Business/Enterprise.
- **Composantes des coûts EBS** : Stockage (par Go), IOPS provisionnés (si io1/io2 ou gp3 supplémentaire), débit (si gp3 supplémentaire). Sachez quels composants peuvent être dimensionnés correctement.
- **Coûts de versionnage S3** : Les versions non courantes sont stockées et facturées au même tarif que les versions courantes. Les règles de cycle de vie qui expirent les versions non courantes sont critiques pour le contrôle des coûts dans les buckets versionnés.
- **AWS Compute Optimizer** : Analyse l'utilisation EC2 et recommande des types d'instances dimensionnés correctement. Signal d'examen : « réduire les coûts EC2 en sélectionnant le bon type d'instance » → Compute Optimizer.
- **AWS Cost Anomaly Detection** : Utilise le ML pour détecter les modèles de dépenses inhabituels. Signal d'examen : « détecter automatiquement les augmentations de coûts inattendues » → Cost Anomaly Detection.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez pourquoi les volumes EBS non attachés génèrent des coûts même si aucune instance EC2 ne les utilise. Quel processus les ingénieurs devraient-ils suivre lors de la résiliation d'une instance EC2 pour éviter ce gaspillage ?

*(Indice : Les volumes EBS stockent des données sur un disque physique, et ce disque coûte de l'argent qu'il soit lu ou non.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : La facture AWS d'une entreprise est passée de 5 000 $ à 9 000 $/mois sur six mois, sans qu'elle ait ajouté de nouveaux services. L'équipe d'ingénierie soupçonne que les coûts de stockage sont le problème. Quelle combinaison d'outils AWS identifierait et expliquerait LE MIEUX l'augmentation des coûts ?

A) AWS CloudTrail pour examiner les appels API et identifier qui a créé de nouvelles ressources  
B) AWS Cost Explorer pour la ventilation des coûts par service, et AWS Trusted Advisor pour la détection des ressources inactives et non attachées  
C) Amazon CloudWatch pour surveiller l'utilisation des ressources et créer des alarmes de coûts  
D) AWS Config pour identifier toutes les ressources et leur statut de conformité

**Indice 1** : « Identifier l'augmentation des coûts » → visualiser la ventilation des coûts par service.

**Indice 2** : « Ressources inactives et non attachées » → un outil spécifique les identifie de manière proactive.

**Indice 3** : CloudTrail enregistre les appels API ; Cost Explorer montre les tendances des coûts. Lequel est le plus utile pour l'analyse des coûts ?

**Réponse** : B

**Explication** : AWS Cost Explorer montre les tendances des coûts ventilées par service, région et type d'utilisation — parfait pour identifier quel service a entraîné l'augmentation. Les vérifications d'optimisation des coûts de AWS Trusted Advisor identifient les volumes EBS non attachés, les instances EC2 inactives, les équilibreurs de charge sous-utilisés et autres sources courantes de gaspillage.

**Pourquoi pas A ?** CloudTrail enregistre qui a créé des ressources et quand, mais ne montre pas directement les tendances des coûts ni n'identifie les gaspillages.

**Pourquoi pas C ?** CloudWatch surveille les performances des ressources (CPU, mémoire) — utile pour le dimensionnement correct mais pas pour identifier les gaspillages de stockage accumulés.

**Pourquoi pas D ?** AWS Config suit les configurations des ressources et la conformité mais n'est pas un outil d'analyse des coûts.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

La facture S3 de Nimbus montre 340 $/mois pour un bucket intitulé « sauvegardes ». Le bucket a le versionnage activé et contient :

- Des instantanés de bases de données quotidiens (7 jours suffisent pour leur politique)
- Des sauvegardes complètes hebdomadaires (conservées pendant 3 mois)
- Des archives trimestrielles (conservées pendant 7 ans pour la conformité fiscale)

Concevez une politique de cycle de vie pour ce bucket qui minimise les coûts tout en respectant ces exigences de rétention. Quelle classe de stockage chaque type de données devrait-il utiliser ? Comment géreriez-vous le versionnage pour empêcher les vieilles versions de s'accumuler ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception de politique de cycle de vie.)*

## Scène Post-Générique

Tom publia les résultats de l'audit des coûts à l'équipe.

Gaspillages identifiés : 8 800 $ sur 18 mois.
Économies annuelles attendues des changements mis en œuvre : 6 200 $.

Puis il ajouta une ligne en bas : « Cela n'inclut pas les économies des Savings Plans (14 200 $/an) ou des politiques de cycle de vie S3 (7 800 $/an). Impact total annuel d'optimisation : environ 28 200 $. »

Maya le lut deux fois.

« C'est presque le salaire d'un ingénieur junior, » dit-elle.

« En gaspillage, » confirma Tom.

« Ou, » dit Leo, « c'est la preuve que faire ces optimisations plus tôt aurait financé cet ingénieur junior. »

Tom le regarda.

« C'est la bonne façon de penser, » dit-il. « L'optimisation des coûts ne consiste pas à couper. Il s'agit de ne pas payer pour des choses qui ne créent pas de valeur. »

Maya épingla le document sur le wiki de l'entreprise.

Dans le prochain chapitre : le niveau de base de données reçoit le même traitement, et Tom découvre le seul endroit où il sous-investissait réellement.
