# Chapitre 28 : La surprise de la facture de stockage

Le tableur comptait désormais seize onglets. Tom le gardait ouvert dans une seconde fenêtre, comme certaines personnes gardent une liste de courses — toujours visible, toujours en train de s'allonger. Il ajouta une nouvelle ligne pour EC2 (fait, Savings Plan engagé) et déplaça son curseur vers la ligne suivante.

Le stockage.

**Récapitulatif : EC2 réglé, un poste restant**

Le travail sur la tarification du calcul du chapitre 27 avait verrouillé la stratégie EC2 : un Compute Savings Plan de 0,45 $/heure sur un terme de trois ans, plus Spot pour les lots nocturnes — une estimation de 42 500 $ d'économies sur la durée. Ce travail était fait, et bien fait. Mais c'était une ligne sur la facture. Tom avait appris, grâce à six mois d'analyse de coûts avec Athena, que la facture comptait beaucoup de lignes — et que chacune méritait la même attention. S3 était la suivante : 198 $/mois, déjà amélioré depuis les 847 $ après les changements de politique de cycle de vie du chapitre 23. Le chiffre qui attira son regard, cependant, était plus bas sur la page. EBS : 440 $/mois.

« Ça semble élevé, » dit-il.

Leo afficha la liste des volumes EBS. Il y avait 47 volumes EBS attachés à des instances. Et ensuite, il y avait encore 23 volumes non attachés à aucune instance.

« Ces 23 volumes, » dit Tom. « Qu'est-ce que c'est ? »

**L'audit des volumes orphelins**

Leo commença à les parcourir un par un. Ce n'était pas un processus rapide — les volumes n'étaient pas étiquetés de manière uniforme, les tags étaient incohérents, et certains avaient été créés il y a si longtemps que personne ne se souvenait du contexte. Tom approcha une chaise et regarda.

Volume ebs-021a4c. Créé il y a 16 mois. Tag : « debug-prod-db-snapshot-restore ». Taille : 200 Go. Dernier attachement : jamais, ou l'historique d'attachement avait été purgé.

« Celui-là, je m'en souviens, » dit Leo. « On avait un problème de requête de base de données et j'ai restauré un instantané pour vérifier les données. Je les ai vérifiées, je n'y ai pas trouvé le problème, et j'ai oublié de supprimer le volume. »

Volume ebs-07f38b. Créé il y a 11 mois. Tag : « load-test-temp ». Taille : 400 Go.

Leo resta silencieux un instant. « Je crois que c'était le test de charge qu'on a fait avant le pitch du Series Seed. On avait provisionné des instances supplémentaires avec du stockage supplémentaire pour simuler la charge de pointe et puis... je ne crois pas en avoir supprimé aucun après. »

« Je l'ai déjà déployé — oh, » dit-il. « Le test de charge était temporaire. Les volumes ne l'étaient pas. »

Volume ebs-0ab12c à ebs-0ab134. Huit volumes consécutifs, créés il y a 9 mois. Tag : « k8s-experiment ». Taille : 100 Go chacun, 800 Go au total.

« C'était l'évaluation Kubernetes, » dit Priya, en regardant par-dessus l'épaule de Leo. « On a passé trois semaines à évaluer s'il fallait migrer vers ECS ou EKS. EKS était finaliste. On a démonté le cluster d'expérimentation mais on a apparemment laissé les volumes persistants. »

Tom faisait le total sur un onglet séparé. Volume par volume, les chiffres s'accumulaient :

- Volumes de restauration de débogage : 4 volumes × 200 Go = 800 Go
- Volumes de test de charge : six volumes entre 200 et 400 Go — environ 1 200 Go au total
- Volumes d'expérimentation Kubernetes : 8 volumes × 100 Go = 800 Go
- Divers non étiquetés : 5 volumes × tailles variées = ~700 Go

Total : approximativement 3 500 Go répartis sur 23 volumes non attachés.

« Combien ça coûte par mois ? » demanda Tom. La réponse : gp3 à 0,08 $/Go/mois. 3 500 Go × 0,08 $ = 280 $/mois.

Il vérifia la date de création la plus ancienne. Seize mois. Il sortit la calculatrice.

« On paie pour certains depuis seize mois, » dit-il. « Certains depuis neuf. Moyenne probablement de dix mois sur l'ensemble. » 23 volumes, en moyenne 12 $/mois chacun, en moyenne 10 mois. Cela faisait approximativement 2 760 $. Ajoutez les plus gros volumes et le calcul donnait environ 3 200 $ de gaspillage total.

« Trois mille deux cents dollars, » dit Tom. « Pour des volumes que personne n'utilisait. »

« Et personne ne l'a remarqué parce que le frais est réparti sur des dizaines de postes, » dit Leo. « Ce n'est pas un seul frais de 3 200 $. C'est 23 frais de 12 $ ou 50 $ ou 80 $ par mois, chacun individuellement assez petit pour ne déclencher aucune alarme. »

Tom supprima les 23 volumes non attachés. Il confirma avec Leo et Priya que chacun ne contenait aucune donnée dont ils avaient besoin — le volume de débogage était des données périmées d'une base de données qui avait depuis été migrée, les données du test de charge étaient sans intérêt, les volumes d'expérimentation Kubernetes étaient vides. La suppression prit quinze minutes. Le mois suivant, la facture EBS tomba de 440 $ à 160 $.

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya, quand Tom lui exposa la découverte. « Pourquoi la suppression du volume n'est-elle pas l'option par défaut quand on résilie une instance ? »

« Ça dépend du volume, » dit Tom. « Le volume **racine** est bien supprimé par défaut — `DeleteOnTermination` est à true pour lui. Mais tout volume de données **supplémentaire** que tu attaches est conservé par défaut. L'hypothèse est que tu pourrais avoir besoin des données qui s'y trouvaient. Ces 23 orphelins étaient tous des volumes de données — attachés pour une session de débogage ou un test de charge, puis abandonnés quand l'instance a été résiliée. »

« Donc la valeur par défaut te protège de la perte de données accidentelle sur les volumes de données. »

« Et te coûte de l'argent si tu ne fais pas attention. À partir de maintenant : tout volume de données supplémentaire est explicitement supprimé à la résiliation de l'instance — ou se voit attribuer `DeleteOnTermination` au moment de l'attachement — sauf si quelqu'un présente un argument documenté justifiant de le conserver. »

« Avez-vous réfléchi à ce qui se passe si quelqu'un oublie de documenter cet argument ? » demanda Priya. « On pourrait supprimer quelque chose d'important. »

« C'est le compromis, » dit Tom. « En ce moment, le compromis va dans l'autre sens — on suppose que tout doit être conservé et on paie pour ça quand ce n'est pas le cas. La discipline de documenter "garder ce volume" est moins risquée que la valeur par défaut actuelle de "tout garder silencieusement". »

**L'audit des coûts de stockage**

La découverte EBS de Tom était le symptôme d'un schéma plus large : les coûts de stockage s'accumulent de manière invisible. Contrairement au calcul (vous remarquez quand 47 serveurs tournent), le stockage s'additionne silencieusement.

Pensez-y comme une location de box. Louer un box est évident sur le relevé de carte de crédit. Mais si vous louez un deuxième box pour un projet, puis un troisième pour de vieux meubles, et que vous ne repassez jamais vérifier ce qu'il y a à l'intérieur — les frais continuent d'apparaître chaque mois, silencieusement, longtemps après que vous avez oublié ce que vous y stockez. Le stockage cloud fonctionne de la même façon : les octets restent là, la facture arrive, et personne ne la remet en question jusqu'à ce que quelqu'un ouvre enfin la porte et le trouve plein de choses dont personne n'a plus besoin.

Un audit complet des coûts de stockage examine :

**S3** :

- Des politiques de cycle de vie sont-elles en place pour tous les buckets ?
- Y a-t-il de vieux instantanés (RDS, EBS) dans S3 ?
- Intelligent-Tiering est-il approprié pour les buckets ayant des modèles d'accès incertains ?
- Y a-t-il des objets versionnés créant plusieurs copies jamais accédées ?
- Y a-t-il des téléversements en plusieurs parties incomplets qui s'accumulent silencieusement ?

**EBS** :

- Y a-t-il des volumes non attachés (aucune instance en cours d'exécution ne les utilisant) ?
- Les volumes gp3 sont-ils correctement configurés ? (Les volumes gp3 par défaut peuvent avoir un débit/IOPS provisionné excessif dont on n'a pas besoin)
- Des instantanés plus anciens que nécessaire sont-ils conservés ?

**RDS** :

- Les périodes de rétention des sauvegardes automatisées sont-elles définies de manière appropriée ? (Plus long = coût de stockage plus élevé)
- Y a-t-il des instantanés manuels d'anciennes instances qui traînent toujours ?
- Des réplicas de lecture issus de migrations de bases de données tournent-ils encore ?

**EFS** :

- Le volume EFS est-il dans la bonne classe de stockage ? (Standard vs Accès peu fréquent)

**Le versionnage S3 : le coût caché**

Au chapitre 5, nous avons mentionné que le versionnage S3 conserve chaque version précédente d'un objet. C'est excellent pour la sécurité. C'est terrible pour les coûts si vous n'avez pas aussi des règles de cycle de vie pour les versions.

Quand le versionnage est activé sur un bucket, chaque fois que vous écrasez un objet, l'ancienne version est conservée. Avec le temps :

- Jour 1 : Image téléversée (v1)
- Jour 30 : Image mise à jour (v1 est maintenant une version « non courante », v2 est courante)
- Jour 60 : Image mise à jour encore (v1 et v2 sont non courantes, v3 est courante)
- Jour 365 : v1, v2... v12 sont toutes stockées. Vous payez pour 12 copies d'une image.

Vous vous demandez peut-être pourquoi le versionnage ne nettoie pas automatiquement les anciennes versions. La réponse est intentionnelle — AWS ne veut pas supprimer automatiquement vos données. Mais la conséquence est que chaque version s'accumule jusqu'à ce que vous disiez explicitement à S3 combien de temps les conserver. La correction : des règles de cycle de vie pour les versions non courantes.

```
Expire noncurrent versions after 30 days
Delete failed multipart uploads after 7 days
```

Tom appliqua ces règles à tous les buckets versionnés. Le mois suivant, le stockage S3 diminua de 18 %.

**Téléversements en plusieurs parties incomplets : l'accumulation invisible**

Il y a un coût S3 plus subtil que la plupart des ingénieurs manquent entièrement : les téléversements en plusieurs parties (multipart) incomplets.

Quand S3 téléverse un gros fichier, il le découpe en parties et téléverse chacune séparément. C'est le mécanisme de téléversement en plusieurs parties — plus fiable qu'un seul gros PUT pour les fichiers de plus de quelques centaines de mégaoctets. Mais si un téléversement démarre puis échoue à mi-parcours — une interruption réseau, un plantage de client, un bug applicatif — les parties déjà téléversées restent dans S3. Elles ne sont pas visibles comme objets dans votre bucket. Elles n'apparaissent dans aucune liste. Mais elles sont stockées, et elles vous sont facturées aux tarifs S3 standard.

Tom trouva cela en activant le tableau de bord S3 Storage Lens dans la console S3 et en triant par « téléversements en plusieurs parties incomplets ». Nimbus avait 340 Go de données de téléversements en plusieurs parties incomplets reposant silencieusement dans des buckets répartis sur quatre comptes AWS, dont certaines avaient plus d'un an.

« Combien ça coûte par mois ? » demanda Tom. 0,023 $/Go/mois × 340 Go = 7,82 $/mois. Petit individuellement. Mais cela s'accumulait depuis un an sans que personne ne le remarque.

La correction : ajouter une règle de cycle de vie à chaque bucket.

```
AbortIncompleteMultipartUpload:
  DaysAfterInitiation: 7
```

Après sept jours, tout téléversement en plusieurs parties incomplet est automatiquement nettoyé. Cela tourne indéfiniment sans aucune attention continue.

« Si tout ça était resté là une année entière — disons 94 $ qu'on a dépensés sur des téléversements échoués, » dit Leo.

« Sur des téléversements échoués, » confirma Tom. « Pas même sur du stockage réussi. C'est la définition même du gaspillage d'infrastructure. »

**EBS : dimensionnement correct et la mise à niveau vers gp3**

La tarification des volumes EBS a deux composantes :

1. Stockage (par Go par mois)
2. IOPS et débit provisionnés (si vous êtes sur io1/io2 ou payez pour des performances gp3 supplémentaires)

**L'opportunité gp3** : Au chapitre 6, nous avons noté que gp3 est la valeur par défaut actuelle et est moins cher que gp2. Si Nimbus avait des volumes créés avant que gp3 ne soit disponible (il a été lancé en décembre 2020), ceux-ci pourraient toujours être en gp2.

La migration est simple : modifier le type de volume de gp2 à gp3 dans la console AWS ou via la CLI. Aucune interruption de service requise. Le volume reste disponible pendant la conversion. Les caractéristiques de performance sont égales ou meilleures — gp3 fournit 3 000 IOPS et 125 Mo/s de débit de base, comparé au modèle à rafales de gp2 qui pouvait être incohérent pour les plus petits volumes.

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya. « Si gp3 est moins cher et au moins aussi bon que gp2, pourquoi AWS n'a-t-il pas simplement migré tout le monde automatiquement ? »

« Parce qu'AWS ne fait pas de changements unilatéraux sur l'infrastructure des clients, » dit Tom. « Même bénéfiques. La modification pourrait théoriquement avoir des effets secondaires pour certaines charges de travail. Le client doit l'initier. C'est pourquoi des milliers d'équipes paient encore les prix gp2 des années après le lancement de gp3, simplement parce que personne n'est allé chercher. »

Tom décida de faire la migration gp3 un samedi matin — la même discipline matinale qu'il avait appliquée à l'analyse de tarification EC2. Du temps calme. Pas de réunions debout. Juste la console AWS et un plan.

Il avait identifié 8 volumes dans l'environnement de production qui étaient encore en gp2 : les quatre volumes racine des serveurs API, deux volumes attachés aux processeurs en arrière-plan, et deux volumes de données hérités qui avaient été créés avant que la migration gp3 ne devienne une pratique standard pour les nouveaux déploiements. Ensemble, ils totalisaient 960 Go.

Le processus de migration était un seul appel d'API par volume :

```bash
aws ec2 modify-volume \
  --volume-id vol-0a1b2c3d4e5f67890 \
  --volume-type gp3 \
  --iops 3000 \
  --throughput 125
```

Les paramètres `--iops 3000` et `--throughput 125` correspondaient aux valeurs de base par défaut de gp3. Pour gp2, Tom avait d'abord vérifié les métriques CloudWatch : les IOPS moyens sur chaque volume étaient entre 200 et 800. Aucun d'eux n'avait besoin de plus que la base de 3 000 IOPS que gp3 fournissait gratuitement. Le débit était tout aussi confortable — bien en deçà de la valeur par défaut de 125 Mo/s.

« Et si un volume a besoin de plus d'IOPS après le changement ? » demanda Maya, quand Tom expliqua le plan de migration.

« On peut augmenter les IOPS provisionnés sur un volume gp3 à tout moment, » dit Tom. « La migration ne verrouille rien. Si on passe à gp3 à 3 000 IOPS et qu'on découvre que c'est insuffisant, on modifie à nouveau le volume pour en ajouter. La modification est en direct — aucune interruption, aucun démontage. »

« Et gp2 ne peut pas être modifié sur place ? »

« gp2 peut être modifié en gp3 sur place. Ce que tu ne peux pas faire, c'est revenir de gp3 à gp2 — du moins pas facilement, et il n'y a aucune raison de le faire. »

La migration réelle prit 73 minutes de la première commande à l'achèvement sur l'ensemble des 8 volumes. AWS modifia chaque volume pendant qu'il était monté et en cours d'utilisation. Les serveurs API continuèrent de recevoir du trafic tout du long. CloudWatch ne montra aucun pic de latence d'E/S pendant la conversion — la transition fut complètement transparente pour l'application en cours d'exécution.

« C'est à ça que ressemble vraiment "aucune interruption de service requise", » dit Leo, en regardant les métriques avant/après que Tom avait capturées. « Je supposais que "aucune interruption" signifiait "bref redémarrage". Ça signifie que littéralement rien ne change du point de vue de l'application. »

L'économie : gp2 était à 0,10 $/Go/mois ; gp3 était à 0,08 $/Go/mois. Sur 960 Go : 96 $/mois contre 76,80 $/mois. Économie mensuelle : 19,20 $. Pas transformateur en soi, mais la discipline qu'elle représentait l'était. Tout nouveau volume créé à partir de ce moment utilisait gp3 par défaut. La règle organisationnelle que Tom écrivit ce matin-là : pas de volumes gp2. Tout ingénieur créant un volume EBS devrait utiliser gp3 sauf s'il y a une raison spécifique et documentée de faire autrement.

**IOPS et débit** : Les volumes gp3 sont livrés avec 3 000 IOPS et 125 Mo/s de débit par défaut, sans frais supplémentaires. Vous pouvez en provisionner plus si votre charge de travail en a besoin. Vérifiez si les performances provisionnées sont réellement utilisées.

Dans le même audit, Tom trouva deux volumes avec 10 000 IOPS provisionnés — un réglage hérité d'avant son arrivée, dimensionné pour une base de données qui avait depuis migré vers Aurora. Il vérifia les métriques CloudWatch : les IOPS moyens réels étaient de 1 200. Il réduisit les IOPS provisionnés à 4 000 (une marge de sécurité au-dessus du pic réel).

Économie mensuelle : 68 $ en coûts d'IOPS provisionnés qui payaient pour une marge de performance que personne n'utilisait.

**Cycle de vie des instantanés** : Les instantanés EBS sont incrémentiels (chaque instantané ne stocke que les changements depuis le précédent), mais ils s'accumulent. De vieux instantanés des débuts de Nimbus existaient toujours. Tom conserva 30 jours d'instantanés quotidiens et supprima le reste.

**EFS : classes de stockage et la décision Intelligent-Tiering**

Amazon EFS a ses propres classes de stockage :

- **EFS Standard** : Pour les fichiers accédés fréquemment. Coût plus élevé.
- **EFS Infrequent Access (IA)** : Pour les fichiers non accédés pendant 30 jours. 92 % moins cher que Standard.
- **EFS Archive** : Pour les fichiers non accédés pendant 90 jours. Encore moins cher qu'IA.

**EFS Intelligent-Tiering** : Déplace automatiquement les fichiers entre les classes de stockage en fonction des modèles d'accès.

Tom activa Intelligent-Tiering sur le volume EFS. Six semaines plus tard, 68 % des fichiers avaient été déplacés vers Accès peu fréquent. Le coût EFS mensuel tomba de 89 $ à 31 $.

Mais le choix entre Intelligent-Tiering et une règle de cycle de vie manuelle n'était pas trivial. Tom y avait réfléchi.

« Attends — mais *pourquoi* ferait-on Intelligent-Tiering plutôt que de simplement définir une règle de cycle de vie manuelle ? » demanda Maya. « Si on sait que les fichiers de plus de 30 jours ne sont pas accédés, pourquoi ne pas simplement définir la règle et en finir ? »

« Intelligent-Tiering gère les fichiers qui reviennent, » dit Tom. « Si je définis une règle de cycle de vie pour déplacer les fichiers vers IA après 30 jours, et qu'ensuite quelqu'un accède à un fichier qui est dans IA depuis six mois, il reste dans IA. Avec Intelligent-Tiering, si l'accès reprend, le fichier revient automatiquement vers Standard. C'est bidirectionnel. »

« Quand préférerais-tu la règle de cycle de vie alors ? »

« Quand tu es certain que le modèle d'accès est unidirectionnel. Les journaux d'archive — ils sont écrits, ils vieillissent, ils sont accédés une fois pour un audit de conformité et puis plus jamais. Pour ce modèle, une règle de cycle de vie qui déplace vers Archive après 90 jours est moins chère qu'Intelligent-Tiering parce que tu ne paies pas le surcoût de surveillance. »

« Il y a des frais de surveillance ? »

« Pour S3 Intelligent-Tiering, oui, c'est pourquoi on a abordé l'économie des petits objets dans le chapitre sur le cycle de vie S3. Pour EFS, la décision concerne surtout le modèle d'accès : si les fichiers peuvent redevenir chauds, Intelligent-Tiering est plus sûr. S'ils ne vieillissent que dans une seule direction, une règle de cycle de vie vers Archive est moins chère et plus simple. »

**Tags d'allocation des coûts S3 : trouver qui dépense quoi**

À mesure que Nimbus grandissait, plusieurs équipes stockaient des données dans S3. L'équipe analytique avait ses propres buckets. L'équipe d'ingénierie avait ses buckets. L'équipe des données de restaurants avait ses buckets.

La facture montrait juste « S3 : 198 $ ». Il n'y avait pas de ventilation par équipe.

Les **tags d'allocation des coûts** vous permettent de taguer les ressources AWS avec des métadonnées métier (équipe, projet, environnement) puis de voir les coûts ventilés par ces tags dans AWS Cost Explorer.

Tom ajouta des tags à tous les buckets S3 :
```
Team: analytics
Environment: production
Project: nimbus-core
```

Après un cycle de facturation avec le tagging, il pouvait voir : « Le lac de données de l'équipe analytique coûte 74 $/mois. Les sauvegardes d'ingénierie coûtent 43 $/mois. Les données de restaurants coûtent 81 $/mois. »

Désormais, il pouvait avoir des conversations budgétaires avec chaque équipe au lieu de simplement regarder un chiffre agrégé.

**AWS Cost Explorer et AWS Budgets**

**AWS Cost Explorer** : Visualise les coûts historiques et prévus par service, région, tag et type d'utilisation. Essentiel pour comprendre où va l'argent.

**AWS Budgets** : Définit des alertes quand les coûts dépassent (ou sont prévus de dépasser) un seuil. Vous pouvez budgétiser par service, région, tag ou compte.

Tom mit en place trois budgets :

1. Facture mensuelle totale : Alerte à 90 % du montant budgétisé
2. EC2 À la demande : Alerte si les dépenses À la demande dépassent 500 $/mois (signale un manque dans le Savings Plan)
3. Transfert de données sortant : Alerte à 200 $/mois (les coûts de transfert de données peuvent monter en flèche de manière inattendue)

Les Budgets envoyaient des alertes vers un canal Slack. L'équipe voyait quand elle approchait des limites, plutôt que de le découvrir sur la facture mensuelle.

**Le reçu avec chaque ligne : les Cost and Usage Reports**

Cost Explorer répondait à la plupart des questions de Tom. Puis il en rencontra une à laquelle il ne pouvait pas répondre : « exactement quels buckets S3, heure par heure, ont entraîné le pic de mardi dernier — et sous quels tags ? »

Pour les questions de niveau forensique, AWS fournit le **Cost and Usage Report (CUR)** — désormais livré via les **Data Exports** — les données de facturation les plus détaillées qu'AWS produit : chaque poste, **par ressource, par heure**, avec les tags, livré dans un bucket S3 que vous possédez. Ce n'est pas un tableau de bord ; c'est le grand livre brut. Le modèle standard consiste à l'interroger avec Athena (il arrive dans un format en colonnes) ou à l'alimenter dans QuickSight pour des tableaux de bord.

La répartition des tâches à l'examen : **Cost Explorer** = visualisation interactive et prévisions dans la console. **Budgets** = alertes sur des seuils. **CUR/Data Exports** = les données les plus granulaires, livrées dans S3, pour votre propre analyse. Quand une question dit « données de coûts au niveau ressource, horaires, pour une analyse personnalisée » — c'est le CUR, pas Cost Explorer.

« Avez-vous réfléchi à ce qui se passe si on ne regarde jamais ça ? » demanda Priya. « On a trouvé 6 700 $ en deux jours. Qu'est-ce qui se cache encore ? »

« Des audits réguliers, » poursuivit-elle. « Des revues mensuelles de Cost Explorer. AWS Trusted Advisor signale automatiquement les volumes non attachés et les ressources inactives. Automatiser le nettoyage des schémas de gaspillage connus : supprimer les instantanés plus anciens que N jours, alerter sur les volumes EBS non attachés, expirer les vieilles versions S3. »

**S3 Requester-Pays : déplacer le coût de transfert**

Pendant l'audit de stockage, Tom trouva une situation qu'il n'avait pas anticipée.

Les partenaires restaurateurs de Nimbus avaient besoin de télécharger les ressources photo de leur menu — les images traitées et redimensionnées que la plateforme de commande servait aux clients. Pour un restaurant mettant à jour son menu, cela signifiait télécharger entre 50 Mo (une petite mise à jour) et 800 Mo (un rafraîchissement saisonnier complet) de fichiers images. Actuellement, Nimbus payait le coût de transfert de données sortant sur chaque téléchargement : 0,09 $/Go de S3 vers l'emplacement du partenaire.

Avec 287 partenaires restaurateurs, à raison d'un rafraîchissement de menu par mois en moyenne et d'un téléchargement moyen de 200 Mo, le calcul était : 287 × 0,2 Go × 0,09 $ = 5,17 $/mois. Pas significatif à l'échelle actuelle.

« Que se passe-t-il à 2 000 restaurants ? » demanda Tom.

« Même calcul, » dit Maya. « Environ 36 $/mois. »

« Et à 10 000 restaurants, avec des partenaires téléchargeant de gros packs de ressources saisonniers — disons 2 Go pour les mises à jour de menu des fêtes ? »

Il fit le calcul. 10 000 × 2 Go × 0,09 $ = 1 800 $/mois en transfert de données, juste pour des partenaires téléchargeant des ressources dont ils avaient besoin.

« Ça, c'est un vrai chiffre, » dit Priya.

« Avez-vous réfléchi à ce qui se passe si cette facture apparaît le même mois où on essaie de boucler un Series B ? » poursuivit Priya.

« S3 Requester-Pays, » dit Tom.

S3 a une fonctionnalité appelée Requester-Pays : quand elle est activée sur un bucket, l'entité qui fait la requête — pas le propriétaire du bucket — paie les coûts de transfert de données et de requêtes. Le propriétaire du bucket paie toujours le stockage. Mais chaque téléchargement depuis le bucket est facturé au compte AWS du demandeur.

Le compromis est l'accès. Requester-Pays exige que les demandeurs soient des clients AWS avec un compte valide — un accès non authentifié ou anonyme à un bucket Requester-Pays renvoie une erreur. Pour les partenaires restaurateurs de Nimbus, qui étaient des entreprises avec des niveaux variables de sophistication technique, exiger qu'ils aient un compte AWS pour télécharger leurs propres ressources de menu n'était pas un modèle réalisable.

« On ne peut pas faire du Requester-Pays pour l'accès direct des partenaires, » dit Maya. « La plupart de nos partenaires ne vont pas créer un compte AWS pour télécharger des photos. »

« Exact, » dit Tom. « Mais on peut l'utiliser pour les intégrations B2B — les grandes chaînes qui ont des équipes techniques et des comptes AWS. Pas le petit restaurant du coin, mais la chaîne de burgers à 50 établissements qui a une équipe d'ingénierie et s'intègre directement à notre API. Pour ce segment, Requester-Pays a du sens. »

« Et pour le reste ? »

« On leur donne un portail de téléchargement qui utilise des URL S3 pré-signées. Le transfert passe toujours par AWS, le coût est toujours le nôtre — mais il est aussi déjà intégré à la tarification partenaire. L'option Requester-Pays est quelque chose qu'on intégrerait dans les négociations de contrat pour les plus gros partenaires, pas quelque chose qu'on déploie aujourd'hui. »

Tom l'ajouta au tableur sous « optimisations futures » : S3 Requester-Pays pour les partenaires entreprise avec des comptes AWS. À 2 000 restaurants avec 20 % de clients entreprise, à 2 Go de téléchargements mensuels : 72 $/mois potentiellement déplacés vers les partenaires. Petit à cette échelle, mais le même schéma devient significatif à mesure que les packs de ressources grossissent. À revoir quand le nombre de partenaires dépasse 1 000 ou quand les partenaires entreprise commencent à tirer de plus gros packages saisonniers.

« La leçon est la même que toujours, » dit Tom. « Sache ce que devient le coût à l'échelle avant d'être à l'échelle. Le problème à 5 $ d'aujourd'hui est le problème à 1 800 $ dans trois ans. Le concevoir maintenant ne coûte rien. »

**Gouvernance : suppression automatique vs alerte seule**

La question de l'automatisation fut celle qui généra le plus de désaccord.

« Devrait-on supprimer automatiquement les volumes EBS non attachés après 14 jours ? » demanda Tom. « Les règles AWS Config peuvent les signaler. Lambda peut les supprimer automatiquement. »

« Non, » dit Priya immédiatement.

« Pourquoi pas ? »

« Parce que la suppression automatique signifie qu'on finira par supprimer quelque chose qui était non attaché pour une raison. Peut-être que quelqu'un a détaché un volume pour le déplacer vers une autre instance, et qu'il est là depuis 12 jours pendant qu'un changement est examiné. La suppression automatique au jour 14 détruit ces données. »

« Donc alerte seule ? » dit Tom. « On reçoit une notification mais on ne supprime pas automatiquement. »

« Alerte d'abord, » dit Priya. « Forcer un humain à prendre la décision. L'alerte est : "Ce volume est non attaché depuis 14 jours. Tague-le `keep: true` si tu en as besoin, sinon il sera signalé pour suppression à la prochaine revue." La décision humaine est alors documentée par la présence ou l'absence du tag. »

« C'est plus lent, » dit Leo.

« C'est plus lent et moins susceptible de détruire des données, » dit Priya. « On a déjà perdu 3 200 $ par négligence. On n'a perdu aucune donnée par automatisation. Je sais lequel je préfère maintenir. »

Tom opta pour un hybride : alerte automatique à 7 jours, exiger un tag `keep: true` pour supprimer les futures alertes, et faire tourner un rapport hebdomadaire de tous les volumes non étiquetés et non attachés à examiner ensemble par l'équipe. Aucune suppression automatique.

**Variation : quand le nettoyage coûte plus qu'il n'économise**

Si vous avez besoin de la sécurité d'instantanés supplémentaires, gardez-les — mais chaque instantané de plus de 90 jours sans accès devrait justifier sa place. Le compromis est asymétrique : supprimer un instantané dont vous aviez besoin coûte un incident ; garder un instantané dont vous n'aviez pas besoin ne coûte qu'un petit frais mensuel. Pour les données sensibles à la conformité, le coût de garder de vieux instantanés est réel mais généralement inférieur au coût de ne pas les avoir quand un auditeur le demande. Pour des instantanés de développement issus d'un test qui a tourné il y a 14 mois, le calcul va dans l'autre sens.

Si vous activez EFS Intelligent-Tiering pour des fichiers ayant des modèles d'accès incertains, le tiering automatique économise de l'argent et ne nécessite aucune intervention continue. Si les fichiers vieillissent de manière prévisible vers un accès d'archive, une règle de cycle de vie directe est plus simple. Mesurez avant d'activer.

Lien SAA-C03 : L'examen teste votre capacité à choisir entre les classes de stockage S3 (Standard, IA, Glacier) dans un scénario de fréquence d'accès. La même logique s'applique ici — la bonne classe dépend de la fréquence d'accès aux données.

**Le coût de la négligence**

Tom construisit un tableur. Il calcula combien Nimbus avait dépensé en :

- Volumes EBS non attachés (16 mois) : 3 200 $
- Vieux instantanés S3 (découverts et supprimés) : 890 $
- IOPS provisionnés non nécessaires : 816 $
- Économies de migration gp2 vers gp3 (projetées, si faites plus tôt) : 346 $ sur 18 mois
- Versions S3 non courantes accumulées : 1 340 $
- Téléversements en plusieurs parties incomplets : 94 $

Total des gaspillages identifiés : approximativement 6 700 $ sur 18 mois.

« Six mille sept cents dollars, » dit Maya.

« De négligence, » dit Tom. « Pas de mauvaises décisions architecturales. De nettoyage non effectué. »

« Quelle est la solution systématique ? »

« Et, » ajouta Tom, « faire de l'hygiène des coûts une partie du processus de déploiement. Quand un ingénieur résilie une instance EC2, le volume EBS est supprimé automatiquement à moins qu'il n'opte explicitement pour le conserver. »

## Points forts et limites

**Discipline d'optimisation des coûts** :

- Des revues régulières attrapent les gaspillages accumulés avant qu'ils ne deviennent significatifs
- Le tagging permet la responsabilisation — les équipes voient leurs propres coûts
- Les alertes automatisées évitent les surprises de facturation
- Les politiques de cycle de vie et le dimensionnement correct sont souvent des économies « définir et oublier »

**Là où ça se complique** :

- Identifier les gaspillages dans un grand compte avec plusieurs équipes nécessite un outillage centralisé
- Certains gaspillages sont intentionnels (garder des instantanés supplémentaires « au cas où ») — le compromis coût/risque relève du jugement
- La migration gp3 nécessite une validation soigneuse (les IOPS et le débit par défaut peuvent différer du comportement gp2 dans certains cas limites)
- Les tags d'allocation des coûts nécessitent de la discipline dans toutes les équipes — un tagging incohérent rend les données incomplètes
- L'automatisation de la suppression automatique est dangereuse pour le stockage — alerter et examiner est plus sûr pour les volumes et les instantanés

## Résumé

L'audit de stockage avait pris deux jours. Le gaspillage qu'il révéla — 6 700 $ sur 18 mois d'accumulation invisible — était moins un échec de prise de décision qu'un échec d'attention. Rien n'avait été mal configuré exprès. Les instantanés, les volumes non attachés, l'historique des versions qui s'accumulait, les téléversements en plusieurs parties incomplets : chacun avait du sens à l'époque et n'a simplement jamais été réexaminé. La leçon ne concernait pas des services AWS spécifiques. Elle concernait l'habitude de regarder.

- **Les coûts de stockage s'accumulent de manière invisible** — des audits réguliers sont essentiels.
- **Les volumes EBS non attachés** sont une source courante de gaspillage. Supprimez-les (ou automatisez la suppression à la résiliation des instances).
- **Dimensionnement correct EBS** : Migrez gp2 vers gp3 (typiquement 20 % d'économies). Supprimez les IOPS provisionnés en excès.
- **Versionnage S3** : Activez des règles de cycle de vie pour les versions non courantes afin d'éviter de payer pour un historique de versions illimité.
- **Téléversements en plusieurs parties incomplets** : Ajoutez une règle de cycle de vie `AbortIncompleteMultipartUpload` à chaque bucket. C'est souvent négligé et s'accumule silencieusement.
- **EFS Intelligent-Tiering** : Déplace automatiquement les fichiers vers des niveaux moins coûteux en fonction de la fréquence d'accès. Pour des modèles d'accès prévisibles, des règles de cycle de vie manuelles peuvent être moins chères.
- **Gouvernance** : Alertez sur les volumes non attachés après 7-14 jours ; exigez un tagging explicite pour supprimer l'alerte. Évitez la suppression automatique pour les ressources de stockage.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.1)*

- **Tags d'allocation des coûts** : Activez les tags définis par l'utilisateur pour l'allocation des coûts dans la console de facturation ; puis taguez les ressources. Cost Explorer affiche les ventilations par tag. Scénario d'examen : « identifier quel département génère le plus de coûts S3 » → tags d'allocation des coûts.
- **AWS Trusted Advisor** : Identifie les instances EC2 sous-utilisées, les volumes EBS non attachés, les équilibreurs de charge inactifs et autres gaspillages. Vérifications de base gratuites ; les vérifications complètes nécessitent le support Business/Enterprise.
- **Composantes des coûts EBS** : Stockage (par Go), IOPS provisionnés (si io1/io2 ou gp3 supplémentaire), débit (si gp3 supplémentaire). Sachez quels composants peuvent être dimensionnés correctement.
- **Coûts de versionnage S3** : Les versions non courantes sont stockées et facturées au même tarif que les versions courantes. Les règles de cycle de vie qui expirent les versions non courantes sont critiques pour le contrôle des coûts dans les buckets versionnés.
- **AWS Compute Optimizer** : Analyse l'utilisation EC2 et recommande des types d'instances correctement dimensionnés. Signal d'examen : « réduire les coûts EC2 en sélectionnant le bon type d'instance » → Compute Optimizer.
- **AWS Cost Anomaly Detection** : Utilise le ML pour détecter les modèles de dépenses inhabituels. Signal d'examen : « détecter automatiquement les augmentations de coûts inattendues » → Cost Anomaly Detection.
- **Panoplie d'outils de coûts** : graphiques/prévisions interactifs → Cost Explorer. Alertes de seuil → Budgets. « Données de facturation les plus granulaires, au niveau ressource/horaire, livrées dans S3 pour une analyse personnalisée (Athena/QuickSight) » → **Cost and Usage Report (Data Exports)**.
- **Requester Pays** : « partager un gros jeu de données S3 ; les consommateurs paient leurs propres coûts de téléchargement » → S3 Requester Pays (le propriétaire continue de payer uniquement le stockage ; les demandeurs doivent s'authentifier avec un compte AWS).

## Exercices

**Exercice 1 — Mémorisation**

Expliquez pourquoi les volumes EBS non attachés génèrent des coûts même si aucune instance EC2 ne les utilise. Quel processus les ingénieurs devraient-ils suivre lors de la résiliation d'une instance EC2 pour éviter ce gaspillage ?

*(Indice : Les volumes EBS stockent des données sur un disque physique, et ce disque coûte de l'argent qu'il soit lu ou non.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : La facture AWS d'une entreprise est passée de 5 000 $ à 9 000 $/mois sur six mois, sans qu'elle ait ajouté de nouveaux services. L'équipe d'ingénierie soupçonne que les coûts de stockage sont le problème. Quelle combinaison d'outils AWS identifierait et expliquerait LE MIEUX l'augmentation des coûts ?

A) AWS CloudTrail pour examiner les appels API et identifier qui a créé de nouvelles ressources  
B) AWS Cost Explorer pour la ventilation des coûts par service, et AWS Trusted Advisor pour la détection des ressources inactives et non attachées  
C) Amazon CloudWatch pour surveiller l'utilisation des ressources et créer des alarmes de coûts  
D) AWS Config pour identifier toutes les ressources et leur statut de conformité

**Indice 1** : « Identifier l'augmentation des coûts » → visualiser la ventilation des coûts par service.

**Indice 2** : « Ressources inactives et non attachées » → un outil spécifique les identifie de manière proactive.

**Indice 3** : CloudTrail enregistre les appels API ; Cost Explorer montre les tendances des coûts. Lequel est le plus utile pour l'analyse des coûts ?

**Réponse** : B

**Explication** : AWS Cost Explorer montre les tendances des coûts ventilées par service, région et type d'utilisation — parfait pour identifier quel service a entraîné l'augmentation. Les vérifications d'optimisation des coûts d'AWS Trusted Advisor identifient les volumes EBS non attachés, les instances EC2 inactives, les équilibreurs de charge sous-utilisés et autres sources courantes de gaspillage.

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

## Scène post-générique

Tom publia les résultats de l'audit des coûts à l'équipe.

Gaspillages identifiés : 6 700 $ sur 18 mois.
Économies annuelles attendues des changements mis en œuvre : 6 200 $.

Puis il ajouta une ligne en bas : « Cela n'inclut pas les économies des Savings Plans (14 200 $/an) ni des politiques de cycle de vie S3 (7 800 $/an). Impact total annuel d'optimisation : environ 28 200 $. »

Maya le lut deux fois.

« C'est presque le salaire d'un ingénieur junior, » dit-elle.

« En gaspillage, » confirma Tom.

« Ou, » dit Leo, « c'est la preuve que faire ces optimisations plus tôt aurait financé cet ingénieur junior. »

Tom le regarda.

« C'est la bonne façon d'y penser, » dit-il. « L'optimisation des coûts ne consiste pas à couper. Il s'agit de ne pas payer pour des choses qui ne créent pas de valeur. »

Maya épingla le document sur le wiki de l'entreprise.

Dans le prochain chapitre : le niveau base de données reçoit le même traitement, et Tom découvre le seul endroit où il sous-investissait réellement.
