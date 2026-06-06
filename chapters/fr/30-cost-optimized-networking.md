# Chapitre 30 : Le coût caché

Tom avait un tableau blanc dans la salle de réunion avec trois colonnes : calcul, stockage, réseau. Les deux premières étaient remplies — chiffres, dates, noms d'optimisations effectuées. Il resta un moment devant le tableau blanc avant d'écrire quoi que ce soit dans la troisième colonne. Les lignes réseau de la facture AWS se dispersaient sur la page d'une manière que les autres ne faisaient pas. Chacune avait un nom différent, une unité différente, une justification différente expliquant pourquoi l'argent partait.

Il déboucha le marqueur.

**Récapitulatif : la dernière inconnue de la facture**

L'audit de base de données avait clos le dernier poste majeur sur lequel Tom travaillait activement — 491 $/mois récupérés, 5 892 $ par an. Ajoutez les Savings Plans EC2, les politiques de cycle de vie S3 et le nettoyage du stockage, et le total cumulé s'élevait à 34 092 $ d'économies annuelles sur trois mois de travail. Mais Tom avait remarqué, pendant l'analyse approfondie de la base de données, qu'une catégorie avait à peine été examinée. Les coûts de stockage apparaissaient comme une ligne : « S3 : 198 $ ». Les coûts de calcul apparaissaient comme une ligne : « EC2 : 2 340 $ » — avant que les réductions du Savings Plan du chapitre 27 n'arrivent. Les coûts réseau se dispersaient sur une douzaine d'entrées avec des noms comme « Data Transfer Out », « NAT Gateway Processing », « VPC Peering Data Transfer » et « CloudFront Data Transfer ». Il ne les avait jamais additionnés ni regardé la somme. C'était le travail d'aujourd'hui.

Tom afficha la facture. Trouva la section transfert de données. Additionna tous les postes.

Les coûts réseau dans AWS ressemblent au système de péage d'une ville : entrer en ville est gratuit, mais chaque tunnel que vous prenez en sortant coûte de l'argent, et conduire entre les quartiers coûte aussi un peu. La plupart des gens ne pensent pas aux péages jusqu'à recevoir une facture à la fin du mois et réaliser qu'ils prenaient le tunnel tous les jours alors qu'il y avait une route de surface gratuite tout ce temps. L'objectif de ce chapitre est de comprendre chaque poste de péage — et de décider lesquels valent la peine d'être payés.

847 $/mois.

« On dépense 847 $ par mois en transfert de données, » dit-il.

« C'est beaucoup ? » demanda Leo.

« C'est exactement autant que notre facture S3 avant qu'on l'optimise. Et je ne savais même pas qu'on avait une facture de transfert de données de cette taille. »

Maya regarda. « Qu'est-ce que c'est exactement, le transfert de données ? »

« C'est ce qu'AWS facture pour déplacer des octets. Les octets entrant dans AWS : généralement gratuits. Les octets sortant d'AWS vers internet : facturés. Les octets entre services dans différentes régions : facturés. Les octets passant par une NAT Gateway : facturés. »

« Peux-tu le détailler ? »

Tom pouvait. Mais cette fois, il ne s'arrêta pas à la console de facturation. Il activa les VPC Flow Logs sur tous leurs VPC et les alimenta dans CloudWatch Logs Insights. Cela lui permit d'interroger les flux de trafic réels — pas seulement des montants en dollars, mais quelles sources envoyaient des données où, et combien.

La requête prit deux minutes à s'exécuter. Combinée à une source de logs supplémentaire qu'il allait bientôt récupérer, la sortie était suffisamment précise pour agir dessus.

**Analyse du trafic : ce qui génère réellement la facture**

Les cinq principaux flux de trafic par volume, dans l'ordre :

1. Serveurs applicatifs EC2 → NAT Gateway → services AWS (SSM, Secrets Manager, CloudWatch, SQS) : 3,9 To/mois
2. Serveurs applicatifs EC2 → NAT Gateway → API externes : 1,3 To/mois
3. Point de terminaison de lecture Aurora → serveurs applicatifs EC2 (inter-AZ) : 0,4 To/mois
4. Pipeline analytique → bucket S3 dans us-east-1 (inter-régions) : 0,3 To/mois
5. CloudFront → origine S3 (cache miss) : 0,2 To/mois

Les quatre premiers sortaient directement des Flow Logs. Le cinquième n'aurait pas pu : les VPC Flow Logs ne voient que le trafic traversant les interfaces réseau à l'intérieur de vos VPC, et un cache miss CloudFront récupérant depuis S3 ne touche jamais le VPC du tout — c'est CloudFront qui parle directement à S3. Pour ce flux, Tom récupéra les journaux d'accès standard de CloudFront et filtra sur le champ `x-edge-result-type` : chaque entrée marquée `Miss` est une requête que CloudFront a dû récupérer depuis l'origine, et la somme des octets lui donna les 0,2 To. Une facture, deux instruments — chacun aveugle à ce que l'autre voit.

« Flux numéro quatre, » dit Priya. « Pourquoi notre pipeline analytique parle-t-il à un bucket dans us-east-1 ? »

Leo avait sur le visage une expression que Tom reconnaissait.

« Je l'ai déjà déployé — oh, » dit Leo. « Il y a six mois, je testais si notre pipeline analytique pouvait se répartir sur plusieurs régions en parallèle. J'ai créé un bucket de test dans us-east-1, pointé le pipeline dessus, et l'ai exécuté pendant une semaine. Le test s'est terminé mais j'ai oublié de retirer la destination us-east-1 de la config du pipeline. »

« Donc pendant cinq mois, » dit Tom, « on écrit une copie de chaque résultat analytique vers un bucket en Virginie. »

« Combien ça coûte par mois ? » demanda Tom.

Transfert inter-régions de us-west-2 vers us-east-1 : 0,02 $/Go. 300 Go/mois = 6 $/mois pour le transfert. Plus le stockage S3 pour les données dupliquées dans us-east-1 : 300 Go × 5 mois × 0,023 $/Go = 34,50 $ en données stockées.

« Pas énorme, » dit Leo.

« Pas énorme par mois, » dit Tom. « Mais ça tourne depuis cinq mois et personne ne le savait. C'est un coût involontaire. La question n'est pas de savoir si 6 $ comptent — c'est de savoir si on sait pourquoi chaque dollar est dépensé. »

Leo supprima le bucket de test us-east-1 et retira la destination de la configuration du pipeline.

La découverte la plus actionnable dans la sortie des flow logs était le flux numéro un : les serveurs applicatifs EC2 appelant des services AWS via la NAT Gateway.

Tom récupéra les entrées de log spécifiques pour la requête CloudWatch Logs Insights, filtrées pour ne montrer que le trafic destiné aux plages d'IP des services AWS :

```
fields @timestamp, srcAddr, dstAddr, bytes, protocol
| filter dstAddr like "52.94." or dstAddr like "54.239." or dstAddr like "52.46."
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 20
```

La sortie montra quelque chose qu'il n'avait pas anticipé : environ 300 Go par mois de trafic S3 dans la même région — distinct du flux inter-régions vers le bucket us-east-1 de Leo — passait par la NAT Gateway. Mais Tom avait déjà configuré des S3 Gateway Endpoints il y a des mois.

« On a un S3 Gateway Endpoint, » dit Leo. « Pourquoi le trafic S3 passe-t-il encore par NAT ? »

Tom regarda la table de routage. Le Gateway Endpoint était configuré — mais seulement pour le VPC applicatif. Le pipeline analytique tournait dans un VPC séparé qui avait été créé il y a neuf mois pour l'isolation des données. Ce VPC n'avait pas de S3 Gateway Endpoint. Chaque appel S3 depuis les instances EC2 du pipeline analytique routait via la NAT Gateway de ce VPC.

« 0,3 To de trafic du pipeline analytique × 0,045 $/Go = 13,50 $/mois, » dit Tom. « Juste à cause de l'endpoint manquant dans le second VPC. »

« Combien coûterait l'ajout de l'endpoint ? » demanda Leo.

« Zéro, » dit Tom. « Les S3 Gateway Endpoints sont gratuits. C'est une entrée de table de routage. »

Ajouter le Gateway Endpoint au VPC analytique prendrait quatre minutes et réduirait de 13,50 $ le frais mensuel de NAT Gateway — un petit nombre absolu, mais la découverte était le principe. Ils avaient ajouté un contrôle de coût dans un VPC et oublié de le répliquer quand ils avaient créé le second. La cohérence exigeait un processus, pas seulement des connaissances.

Tom ajouta à la liste de vérification de déploiement : lors de la création d'un nouveau VPC, ajouter les Gateway Endpoints S3 et DynamoDB avant d'attacher la moindre charge de travail.

La deuxième découverte spécifique issue des flow logs était plus coûteuse. Le trafic des fonctions Lambda qui exécutaient le système de notification de commandes — l'accès S3 pour lire les fichiers de configuration des restaurants — passait par la NAT Gateway au lieu de l'endpoint S3. Les fonctions Lambda tournaient à l'intérieur du VPC (pour l'accès RDS), et l'endpoint S3 du VPC n'était configuré que pour les instances EC2 dans le sous-réseau applicatif. Les fonctions Lambda dans le sous-réseau Lambda routaient via NAT.

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya. « On a l'endpoint. Pourquoi Lambda ne l'utilise-t-il pas ? »

« Les VPC Gateway Endpoints s'appliquent par sous-réseau en fonction des tables de routage, » dit Tom. « Les fonctions Lambda sont dans leur propre sous-réseau avec leur propre table de routage. Cette table de routage n'avait pas la route de l'endpoint. Je l'ai ajoutée pour le sous-réseau applicatif. J'ai manqué le sous-réseau Lambda. »

Ajouter la route de l'endpoint S3 à la table de routage du sous-réseau Lambda économiserait 41 $/mois supplémentaires en frais de traitement NAT Gateway qui facturaient des appels S3 qui auraient dû être gratuits.

L'analyse des flow logs s'était rentabilisée. Trois heures de temps de requête, trois découvertes concrètes : l'endpoint oublié du VPC analytique (13,50 $/mois), la lacune de routage du sous-réseau Lambda (41 $/mois), et la grande découverte d'origine qui devint la base des décisions sur les Interface Endpoints. Économie mensuelle supplémentaire totale identifiée par l'analyse des flow logs : 54,50 $, en plus des 78 $ des Interface Endpoints que l'analyse avait déjà fait remonter. Ces deux corrections plus petites partirent dans le backlog pour le prochain sprint ; le tableau d'économies à la fin de ce chapitre ne compte que ce qui a été livré.

« La leçon, c'est que les VPC endpoints ne sont pas une configuration ponctuelle, » dit Tom. « Chaque nouveau VPC, chaque nouveau sous-réseau, chaque nouveau type de charge de travail nécessite la même vérification. La valeur par défaut pour tout ce qui est dans un sous-réseau privé est de router via NAT. La vérification est : cette charge de travail appelle-t-elle S3, DynamoDB, ou l'un des services AWS à fort trafic ? Si oui, a-t-elle une route d'endpoint ? »

« Avez-vous réfléchi à automatiser cette vérification ? » demanda Priya. « Une règle AWS Config qui alerte quand un sous-réseau privé est créé sans route d'endpoint S3 ? »

« C'est sur la liste, » dit Tom. « Juste après l'alerte de volume orphelin. »


Et avec ça, Tom avait sa réponse à la question qui avait lancé l'analyse. Les coûts réseau n'étaient pas un seul problème. C'étaient cinq problèmes différents, chacun avec une solution différente.

**Comment AWS facture le transfert de données**

La tarification du transfert de données d'AWS est asymétrique :

**Vers AWS (entrant)** : Gratuit. Vous pouvez téléverser autant de données que vous voulez.

**Depuis AWS vers internet (sortant)** : Facturé. Les 100 premiers Go/mois sont gratuits. Ensuite :

- 0,09 $/Go pour les 10 premiers To/mois (régions US)
- 0,085 $/Go pour les 40 To suivants
- Moins cher à des volumes plus élevés

**Dans la même zone de disponibilité** : Gratuit. Les instances EC2 qui se parlent dans la même AZ ne paient rien.

**Entre zones de disponibilité (même région)** : 0,01 $/Go dans chaque direction. Un coût petit mais réel.

**Entre régions** : 0,02 à 0,08 $/Go selon les régions. Le trafic inter-régions est significativement plus cher.

**NAT Gateway** : 0,045 $/Go traité. Chaque octet que votre instance EC2 privée envoie via la NAT Gateway pour atteindre internet — et chaque octet qui revient — est facturé.

**CloudFront** : Tarifs de transfert de données inférieurs à ceux directs d'AWS vers internet. 0,085 $/Go pour les 10 premiers To (légèrement moins que le transfert de données sortant direct). CloudFront réduit souvent les coûts de transfert totaux car sa mise en cache en périphérie signifie que l'origine sert moins souvent les données.

**La ventilation de Tom**

« Combien ça coûte par mois ? » demanda Tom, pour chaque poste à tour de rôle. Il les ajouta à un onglet séparé du tableur — non pas le total mensuel, mais chaque catégorie détaillée. Le total était moins utile que de comprendre quelle partie de la facture correspondait à quel type de coût.

Après avoir catégorisé chaque poste :

**Données sortantes vers internet** : 214 $/mois

- Réponses API aux clients dans le monde entier
- Ressources encore servies directement depuis S3 et l'ALB vers les clients, contournant CloudFront (les remplissages de cache eux-mêmes — CloudFront récupérant depuis une origine AWS — sont gratuits : AWS renonce au transfert origine-vers-CloudFront)

**Traitement NAT Gateway** : 289 $/mois

- Serveurs applicatifs appelant des API externes (processeur de paiement, service d'e-mails, données cartographiques)
- Appels DynamoDB passant par la NAT Gateway (avant que les VPC endpoints soient configurés pour certaines tables)

**Transfert de données inter-AZ** : 178 $/mois

- Équilibreur de charge vers les instances EC2 (l'équilibreur de charge est dans une AZ, certaines instances dans une autre)
- Serveur applicatif vers le réplica de lecture RDS (dans une AZ différente)

**Transfert de données inter-régions** : 166 $/mois

- Réplication Aurora Global Database (primaire dans us-west-2, reader dans us-east-1)
- S3 Cross-Region Replication pour les sauvegardes
- Le pipeline de test oublié de Leo (6 $/mois de ce total)

**NAT Gateway : la plus grande surprise**

289 $/mois de frais de traitement NAT Gateway était le poste le plus important. Et l'analyse des VPC Flow Logs l'avait rendu spécifique : le plus gros consommateur était les serveurs applicatifs appelant les API des services AWS (SSM, Secrets Manager, CloudWatch Logs) via la NAT Gateway.

Au chapitre 11, Tom avait configuré des VPC Gateway Endpoints pour S3 et DynamoDB. Ceux-ci étaient gratuits. Mais il avait manqué la configuration des Interface Endpoints pour plusieurs autres services :

- Systems Manager (SSM) pour la gestion des patchs
- Secrets Manager pour la récupération des identifiants
- CloudWatch pour l'expédition des métriques et des logs
- SQS pour l'interrogation des messages

Chaque appel à ces services depuis des instances EC2 privées passait par la NAT Gateway. Chaque appel facturé à 0,045 $/Go.

Vous vous demandez peut-être pourquoi AWS facture le trafic passant par la NAT Gateway alors que vous êtes déjà à l'intérieur du réseau d'AWS. La réponse est que la NAT Gateway elle-même est un service managé — il coûte de l'argent à faire tourner, et AWS répercute ce coût par gigaoctet. Les VPC Endpoints éliminent l'intermédiaire, c'est pourquoi ils réduisent la facture.

« Attends — mais *pourquoi* ferait-on comme ça ? » demanda Maya, quand Tom montra les chiffres. « On a configuré des Gateway Endpoints pour S3 et DynamoDB. Pourquoi n'a-t-on pas fait pareil pour SSM et CloudWatch ? »

« Les Gateway Endpoints ne sont disponibles que pour S3 et DynamoDB, » dit Tom. « Pour tout le reste — SSM, Secrets Manager, SQS — il faut des Interface Endpoints. Ils ne sont pas gratuits, mais ils sont moins chers que de router via la NAT au volume qu'on génère. »

Les **Interface Endpoints** pour ces services : 0,01 $/heure par AZ + 0,01 $/Go de données traitées.

Au volume de Nimbus, l'Interface Endpoint SSM coûterait environ 25 $/mois (frais horaires plus traitement par Go) et économiserait environ 45 $/mois en frais de NAT Gateway (parce que SSM génère un volume de données significatif pour la gestion des patchs et les appels au parameter store).

Les coûts et économies des endpoints variaient selon le service et le volume. Tom calcula que la mise en place d'Interface Endpoints pour les quatre services à fort trafic — deux AZ chacun, plus le traitement à 0,01 $/Go sur les 3,9 To qu'ils transporteraient — coûterait environ 97 $/mois au total et économiserait approximativement 176 $/mois en traitement NAT Gateway.

Économie nette : 78 $/mois rien que de la mise en place des endpoints.

« Et si quelqu'un essaie de s'introduire ? » dit Priya, quand la conversation sur les VPC endpoints se tourna vers la mise en œuvre. « Le VPC endpoint signifie que le trafic ne touche jamais l'internet public — ce n'est pas seulement du coût, c'est une réduction de la surface de menace. On aurait dû faire ça pour le seul bénéfice de sécurité. »

« D'accord, » dit Tom. « Les économies de coûts sont un bonus. »

Leo regarda la liste des services qui routaient via NAT. « J'ai peut-être configuré les endpoints de logging CloudWatch sans vérifier s'il y avait un VPC endpoint pour ça, » dit-il. « Ça ira pour l'instant — mais oui, ça passe par NAT depuis six mois. »

« C'est sur la liste, » dit Tom. « CloudWatch est l'un des quatre qu'on corrige. »

**Le calcul PrivateLink : quand c'est pertinent**

Il y a une version plus complexe de cette conversation qui surgit à mesure que les architectures grandissent : utiliser AWS PrivateLink pour fournir une connectivité privée à des services hébergés par d'autres clients AWS (ou vos propres services dans d'autres VPC).

Les Interface Endpoints PrivateLink coûtent 0,01 $/heure par AZ plus 0,01 $/Go. Pour un service qui génère 1 To/mois de trafic via l'endpoint :

- Coût PrivateLink : 0,01 $ × 2 AZ × 730 heures + 0,01 $ × 1 000 Go = 14,60 $ + 10 $ = 24,60 $/mois
- Router le même trafic via la NAT Gateway existante à la place : 0,045 $ × 1 000 Go = 45 $/mois de frais de traitement incrémentaux

La comparaison est *incrémentale*, parce que la NAT Gateway reste dans les deux cas — elle sert toujours le reste du trafic destiné à internet, donc son coût horaire (0,045 $ × 2 × 730 = 65,70 $) ne disparaît pas quand ce service unique passe à un endpoint. Pour ce volume de trafic, PrivateLink économise approximativement 20 $/mois. Le seuil de rentabilité est d'environ 420 Go/mois — en dessous, le coût horaire propre de l'endpoint l'emporte sur les économies par Go par rapport au traitement NAT.

« Attends — mais *pourquoi* utiliserait-on PrivateLink plutôt qu'un simple VPN ou un peering ? » demanda Maya.

« Le VPC Peering est plus simple et gratuit pour les transferts intra-région, » dit Tom. « Mais le peering crée une connexion entièrement routée entre les VPC — n'importe quoi dans le VPC A peut potentiellement atteindre n'importe quoi dans le VPC B. PrivateLink est plus chirurgical. L'endpoint expose un service spécifique, pas une route réseau complète. Pour les architectures soucieuses de sécurité, cette spécificité compte. »

« Et si quelqu'un essaie de s'introduire dans un VPC peeré ? » demanda Priya. « Le peering complet signifie qu'une instance compromise dans un VPC a une route vers chaque instance du VPC peeré. »

« C'est l'argument pour PrivateLink plutôt que le peering quand tu te connectes à un service tiers ou à un service détenu par une équipe séparée, » dit Tom. « Le peering pour les VPC intra-entreprise de confiance. PrivateLink pour tout ce où tu veux la connexion à exposition minimale. »

**Trafic inter-AZ : une question architecturale**

Les 178 $/mois de transfert de données inter-AZ étaient plus délicats.

Une partie était inévitable : l'équilibreur de charge distribue le trafic entre les AZ, donc certaines requêtes originaires d'une AZ sont transmises par l'équilibreur de charge à une instance dans une autre AZ.

Une partie était optimisable : l'application était configurée pour écrire dans la primaire RDS (dans us-west-2a) et lire depuis le réplica de lecture (dans us-west-2b). Chaque requête de lecture traversait les limites d'AZ.

Pour les lectures, une solution : configurer l'application pour préférer un réplica de lecture dans la même AZ que l'instance qui fait la requête. Chaque AZ obtient son propre réplica de lecture. Le trafic reste local.

Compromis : plus de réplicas de lecture = plus de coût. Si le coût du trafic inter-AZ est de 50 $/mois et qu'un réplica de lecture supplémentaire coûte 190 $/mois, l'optimisation locale à l'AZ ne se rentabilise pas.

Tom calcula : à leur volume de requêtes actuel, le trafic inter-AZ n'était que de 31 $/mois sur les 178 $. Pas assez pour justifier l'ajout de réplicas.

Les autres coûts inter-AZ étaient le routage de l'équilibreur de charge et la communication service à service — largement inévitables au niveau d'architecture actuel.

« C'est l'un de ces cas où comprendre le coût ne signifie pas qu'il faut le corriger, » dit Tom.

« Combien coûterait l'élimination entière du trafic inter-AZ ? » demanda Maya.

« Tout mettre dans une AZ va à l'encontre de l'objectif du Multi-AZ. Ce sont 31 $/mois d'économies au prix de la perte de la haute disponibilité. »

« Donc on le laisse, » dit-elle.

« On le laisse. »

**S3 Select : réduire le transfert de données dans les requêtes**

En examinant le pipeline analytique, Tom trouva une autre optimisation spécifique à la façon dont l'équipe analytique interrogeait de grands fichiers S3.

Le schéma : chaque matin, une tâche analytique téléchargeait un fichier Parquet de 500 Mo depuis S3 pour le filtrer en mémoire à la recherche des données de commandes spécifiques à un restaurant. Environ 95 % du fichier était jeté après téléchargement.

**S3 Select** vous permet de récupérer uniquement les lignes et colonnes dont vous avez besoin depuis un objet S3 (CSV, JSON, Parquet), plutôt que de télécharger le fichier entier pour le filtrer dans votre application.

> **Mise à jour importante** : mi-2024, AWS a cessé de proposer S3 Select aux nouveaux clients — les utilisateurs existants le conservent, mais c'est une impasse pour les nouvelles architectures. Le principe que cette section enseigne (filtrer à la couche de stockage, ne pas expédier le fichier entier) est intemporel ; l'outil moderne pour ça est **Amazon Athena** (SQL directement sur S3, y compris les jointures et agrégations que S3 Select n'a jamais eues). **S3 Object Lambda**, autrefois l'autre alternative, a suivi S3 Select dans le statut hérité : depuis le 7 novembre 2025, il est aussi fermé aux nouveaux clients (les charges de travail existantes continuent de tourner). Sur un examen actuel, « interroger les données sur place dans S3 » pointe vers Athena. L'histoire ci-dessous est conservée parce que le *raisonnement* — mesurer d'abord, déplacer le filtre vers les données — est la leçon.

Sans S3 Select :
```python
# Download 500MB file, process in memory
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Avec S3 Select :
```python
# Let S3 filter first, transfer only matching rows (~2MB instead of 500MB)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select réduit les données déplacées de S3 vers votre application. Pour les grands fichiers avec des requêtes sélectives, cela peut être une réduction de 10 à 100 fois du volume de données — et, puisque l'instance analytique tourne dans la même région que le bucket, le gain n'est pas une facture de transfert (le transfert S3 vers EC2 dans la même région est gratuit) : c'est le calcul, la mémoire et le temps passés à télécharger et filtrer des données qu'on jette immédiatement.

Tom l'évoqua avec l'équipe analytique. Ils résistèrent au départ.

« On sait déjà écrire du pandas, » dit un analyste.

« Ce n'est pas une question de pandas, » dit Tom. « C'est le fait que vous téléchargez 500 Mo pour obtenir 2 Mo de données. Le téléchargement lui-même est gratuit — même région — mais pas l'instance. Vous exécutez ça pour chaque restaurant : 287 restaurants, 287 requêtes, 140 Go tirés et filtrés en pandas chaque nuit. C'est ce qui occupe la machine analytique pendant deux heures — et c'est pour ça que c'est une xlarge. »

« Et S3 Select ? »

« S3 Select facture 0,002 $ par Go scanné et 0,0007 $ par Go retourné — environ un dixième de centime par requête. En échange, l'instance reçoit 600 Mo par nuit au lieu de 140 Go, la tâche se termine en minutes, et la machine peut descendre d'une taille. »

« Ça fait 450 $ par mois, » dit l'analyste, après avoir fait le calcul de l'instance — une estimation au dos d'une enveloppe à partir du tarif horaire de l'instance et des heures qu'elle passait à mouliner.

« C'est pour ça que je suis là, » dit Tom. Le vrai chiffre se révélerait plus bas — quand Tom tira plus tard la dépense de calcul réelle attribuable à la tâche nocturne, elle s'élevait à 202 $/mois, pas 450 $. Le calcul sur une serviette trouve le problème ; la mesure le dimensionne.

Tom l'évoqua d'abord avec Leo, avant d'amener l'équipe analytique dans la conversation. Il savait que Leo résisterait, et il voulait comprendre la résistance avant qu'elle ne devienne un débat à l'échelle de la salle.

« S3 Select économiserait 180 $/mois sur les requêtes du pipeline analytique, » dit Tom.

« Ça nécessite de réécrire chaque requête, » dit Leo.

« Ça nécessite de changer le modèle d'accès aux données de "télécharger et filtrer" à "interroger via l'API S3 Select". »

« Ce qui est une réécriture. »

« C'est un changement dans les appels à la bibliothèque cliente, » dit Tom. « La logique de requête — les expressions de filtrage — reste la même. Ce qui change, c'est où le filtrage se produit. Actuellement : EC2. Avec S3 Select : S3. »

« J'ai lu la doc de S3 Select, » dit Leo. « Tu ne peux pas faire de jointures. Tu ne peux pas faire d'agrégations plus complexes que des SUM et COUNT basiques. Certaines de nos requêtes analytiques sont plus sophistiquées que ça. »

« Je sais, » dit Tom. « C'est pourquoi je ne propose pas S3 Select pour toutes les requêtes. Je le propose pour les requêtes de résumé quotidien spécifiques à un restaurant. C'est le fichier Parquet de 500 Mo filtré par restaurant_id, tirant deux colonnes. Cette requête est un pur filtre-et-projection. S3 Select est exactement le bon outil pour ce cas. »

Leo resta silencieux un instant. Il ouvrit la requête en question.

```python
# Current: download 500MB, filter in memory
df = pd.read_parquet('s3://analytics/orders-2024.parquet')
result = df[df['restaurant_id'] == restaurant_id][['order_id', 'total', 'timestamp']]
```

« La version S3 Select serait quoi — l'appel select_object_content ? »

« Oui, » dit Tom. « Tu remplacerais l'appel read_parquet par un appel select_object_content qui pousse la clause WHERE vers S3. Le résultat revient déjà filtré. Tu reçois un flux d'enregistrements correspondants au lieu du fichier Parquet entier. »

« Et je devrais gérer la réponse différemment. »

« Le format de réponse est CSV par défaut. Tu aurais besoin d'un petit wrapper pour le reparser en DataFrame, ou tu utilises le format de sortie Parquet si tu veux garder la logique de parsing actuelle. »

Leo le regarda. « C'est combien de travail ? »

« Une demi-journée, » dit Tom. « Peut-être une journée si tu veux le tester à fond sur les 287 IDs de restaurants dans le lot nocturne. »

« Pour 180 $/mois. »

« 2 160 $ par an, » dit Tom. « Et l'approche passe à l'échelle. À 2 000 restaurants, la même requête sur la même taille de fichier coûte encore plus sans S3 Select. Tu investis une journée aujourd'hui pour éviter un problème bien plus gros plus tard. »

Leo ferma le notebook. « Les requêtes où S3 Select ne marche pas — les requêtes d'agrégation, les comparaisons inter-restaurants — celles-là restent telles quelles ? »

« Celles-là restent telles quelles, » confirma Tom. « Je n'essaie pas de réécrire le pipeline analytique. J'essaie d'arrêter de télécharger 500 Mo pour en utiliser 2 Mo. »

« D'accord, » dit Leo. « Je le fais cette semaine. »

Il le fit. La mise en œuvre prit six heures. Il enveloppa l'appel S3 Select dans une fonction utilitaire qui correspondait à la même interface que l'appel read_parquet existant — le code appelant dans le lot nocturne n'eut besoin d'aucun changement du tout. Seule la couche d'accès aux données changea.

Le mois suivant, la facture de calcul nocturne du pipeline analytique tomba de 202 $ à 22 $ — la tâche se terminait en minutes au lieu d'heures, sur une instance plus petite. L'économie de 180 $/mois avait coûté six heures de temps d'ingénierie. Annualisé, c'était un retour de 1 800 % sur l'investissement en temps.

« La partie à laquelle j'ai résisté, » dit Leo, lors de la revue mensuelle, « c'était la réécriture. Il s'est avéré que c'était un remplacement de fonction, pas une réécriture. Je résolvais un problème imaginé. »

« Ça vaut la peine d'être noté, » dit Tom. « Quand tu évalues s'il faut mettre en œuvre une optimisation, sois précis sur ce qu'est réellement le travail. "Nécessite de réécrire les requêtes" était la version imaginée. "Nécessite de changer la fonction d'accès aux données" était la version réelle. »


**« Coût intentionnel vs involontaire »**

À la fin de l'analyse réseau de trois semaines, Tom ramena la ventilation complète à l'équipe. Il avait une nouvelle colonne dans son tableur : « Intentionnel ? » avec un oui ou un non pour chaque poste.

« C'est le cadre que j'utilise maintenant, » dit-il. « Pas seulement "combien ça coûte" mais "a-t-on décidé de dépenser ça ?" »

« Qu'est-ce qu'un coût intentionnel ? » demanda Maya.

« La réplication Aurora Global Database. On a décidé de répliquer vers us-east-1 parce qu'on a des partenaires restaurateurs sur la Côte Est. Ce sont 120 $/mois en réplication inter-régions — environ le double de l'estimation au dos d'une enveloppe des jours de planification de la reprise après sinistre. On a choisi ce coût pour une raison spécifique. »

« Et involontaire ? »

« Le pipeline analytique de Leo écrivant vers us-east-1 pendant cinq mois après la fin d'un test. Personne n'a choisi ça. Ça arrivait parce que personne ne regardait. »

« Et les frais de NAT Gateway pour les appels de services AWS ? »

« Quelque part entre les deux, » dit Tom. « On n'a pas explicitement décidé de router SSM via la NAT Gateway — c'était la valeur par défaut. On ne savait pas qu'il y avait une option moins chère. Est-ce intentionnel ? On a fait un choix, on ne savait juste pas ce qu'on choisissait. »

« C'est la catégorie la plus dangereuse, » dit Priya. « Les décisions que tu ne sais pas que tu prends. »

« C'est pourquoi l'analyse des VPC Flow Logs compte, » dit Tom. « Elle rend l'invisible visible. Chaque octet qui traverse une limite a maintenant une histoire qu'on peut retracer. »

« Avez-vous réfléchi à ce qui se passe si on laisse ça dériver à nouveau ? » demanda Priya. « On a fait une analyse ponctuelle. Dans six mois, Leo aura créé un autre bucket de test quelque part. »

« Je serai là, » dit Leo. « Je le ferai dans eu-west-1 la prochaine fois pour qu'au moins ça coûte plus par Go et que vous le remarquiez plus vite. »

« Revue mensuelle des VPC Flow Logs, » dit Tom. « Je l'ajouterai à la revue trimestrielle des coûts. Si on voit un nouveau flux inter-régions ou un pic de NAT Gateway, on le retrace avant la prochaine facture. »

**Variation : le compromis que vous acceptez**

Si vous éliminez le trafic inter-AZ en faisant tout tourner dans une seule zone de disponibilité, vous économisez approximativement 31 $/mois au volume actuel de Nimbus — mais vous perdez la redondance Multi-AZ qui vaut bien plus que ça en risque d'incident. La conversation mature sur les coûts ne porte pas toujours sur la recherche d'économies ; parfois, elle porte sur la compréhension exacte de ce pour quoi vous payez et la décision que ça en vaut la peine.

Le frais inter-AZ est le prix de la résilience. Certains coûts réseau sont des engagements architecturaux, pas des inefficacités.

Lien SAA-C03 : l'examen présente fréquemment des scénarios où une « optimisation des coûts » éliminerait une redondance. La bonne réponse est généralement de préserver la redondance et d'optimiser ailleurs — connaissez la différence entre le gaspillage et le coût de la fiabilité.

**CloudFront : la réduction du transfert de données**

Voici un fait contre-intuitif : servir des données via CloudFront est généralement moins cher que de les servir directement depuis EC2 ou S3.

**EC2 direct vers internet** : 0,09 $/Go
**CloudFront vers internet** : 0,085 $/Go (légèrement moins cher)

Mais la vraie économie n'est pas dans le tarif par Go — c'est que CloudFront met en cache les données dans les emplacements périphériques. Si 1 000 utilisateurs demandent la même photo de menu :

- **Sans CloudFront** : 1 000 requêtes quittent S3 directement vers internet × taille de la photo × 0,09 $/Go
- **Avec CloudFront** : les clients obtiennent la photo depuis la périphérie au tarif de CloudFront (0,085 $/Go), et le remplissage de cache — CloudFront récupérant depuis S3 sur le 1 miss — est **gratuit** (AWS renonce au transfert origine-vers-CloudFront ; vous ne payez que les requêtes GET d'origine)

Pour Nimbus avec un taux de cache hit de 83 % (du chapitre 13), 83 % des requêtes ne touchaient jamais l'origine du tout — moins de requêtes vers l'origine, moins de charge sur l'origine, et chaque octet facturé au tarif de périphérie au lieu du tarif internet de S3.

« CloudFront n'est pas juste un CDN pour les performances, » dit Tom. « C'est aussi une optimisation des coûts pour le transfert de données. »

Leo parut pensif. « On devrait faire passer toute la livraison de contenu statique par CloudFront, même pour les ressources qui ne sont pas sensibles à la latence. »

« Correct. Si les utilisateurs le téléchargent depuis AWS, ça devrait passer par CloudFront. »

**L'optimisation réseau complète**

Après trois semaines d'analyse et de mise en œuvre :

| Poste de coût                                          | Avant    | Après    | Économie mensuelle |
|--------------------------------------------------------|----------|----------|----------------|
| NAT Gateway (Interface Endpoints)                      | 289 $    | 211 $    | 78 $           |
| Optimisation CloudFront (déplacer plus de ressources)  | 214 $    | 147 $    | 67 $           |
| Trafic inter-AZ (accepté tel quel)                     | 178 $    | 178 $    | 0 $            |
| Trafic inter-régions (bucket de test de Leo)           | 166 $    | 160 $    | 6 $            |
| **Total**                                              | **847 $** | **696 $** | **151 $/mois** |

151 $/mois, 1 812 $/an d'économies réseau. Modeste comparé au calcul et au stockage, mais significatif.

Plus important : Tom comprenait maintenant chaque ligne de la facture réseau. Il pouvait expliquer chaque coût et avait consciemment décidé lesquels optimiser et lesquels accepter. La distinction entre coût intentionnel et involontaire était désormais explicite et documentée.

## Points forts et limites

**Coûts NAT Gateway** :

- Les grands volumes de données via NAT Gateway s'accumulent rapidement
- Les VPC Endpoints éliminent certains coûts NAT entièrement
- Examinez quels services vos instances privées appellent et si des endpoints sont disponibles

**CloudFront pour les coûts** :

- Le taux de cache hit détermine directement les économies de coûts
- Taux de cache hit élevé = moins de requêtes vers l'origine et moins de charge sur l'origine, plus d'octets facturés au tarif côté visiteur moins cher de CloudFront (le transfert origine-vers-CloudFront depuis des origines AWS n'est pas du tout facturé)
- Faites passer toute la livraison de ressources statiques par CloudFront

**Compromis inter-AZ** :

- Éliminer le trafic inter-AZ nécessite généralement des changements architecturaux qui coûtent plus que les économies
- Calculez soigneusement avant d'optimiser

**S3 Select** (hérité — indisponible pour les nouveaux clients depuis 2024 ; utilisez Athena à la place. S3 Object Lambda est aussi hérité maintenant — fermé aux nouveaux clients depuis novembre 2025, les charges de travail existantes ne sont pas affectées) :

- Le principe tient : filtrez à la couche de stockage au lieu de télécharger de grands objets S3 — les économies apparaissent dans le temps de calcul, la taille d'instance et la durée de la tâche (le transfert S3 dans la même région est déjà gratuit)
- N'aide pas quand vous avez besoin du fichier entier

## Résumé

Tom clôtura l'analyse réseau avec un nombre sur le tableau blanc et une compréhension plus claire de ce qu'était réellement la dernière inconnue de la facture. Les 847 $/mois de coûts réseau n'avaient pas été un mystère d'incompétence — c'était le coût attendu d'un système distribué qui s'étendait sur des zones de disponibilité, servait des utilisateurs mondiaux et répliquait des données entre régions. La plupart valait la peine d'être payé. Une partie non. L'avancée clé était de pouvoir distinguer lequel était lequel.

- AWS facture pour les **données sortantes** (internet : ~0,09 $/Go), le **trafic inter-AZ** (0,01 $/Go dans chaque direction), le **trafic inter-régions** (0,02 à 0,08 $/Go) et le **traitement NAT Gateway** (0,045 $/Go).
- Les **données entrantes** sont gratuites. Le **trafic dans la même AZ** est gratuit.
- Les **VPC Flow Logs** révèlent quels flux de trafic spécifiques à l'intérieur de vos VPC génèrent chaque catégorie de coût — essentiel pour une optimisation ciblée. Les flux qui ne traversent jamais une interface réseau de VPC (comme CloudFront récupérant depuis une origine S3) nécessitent leurs propres instruments : les journaux standard de CloudFront ou les journaux d'accès au serveur S3.
- Les **VPC Gateway Endpoints** (S3, DynamoDB) : Gratuits. Éliminent les coûts NAT Gateway pour ces services.
- Les **VPC Interface Endpoints** : Facturés par heure plus par Go. Moins chers que NAT Gateway pour les services à fort volume.
- **CloudFront** sert les données à des tarifs inférieurs à ceux d'EC2 direct vers internet et réduit considérablement le volume de transfert vers l'origine grâce à la mise en cache.
- La question critique n'est pas seulement « combien » mais « ce coût est-il intentionnel ? » Les coûts involontaires — pipelines de test oubliés, routage par défaut via NAT — sont là où se cachent les vraies économies.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.4)*

- **NAT Gateway vs VPC Endpoints** : Scénario d'examen : « EC2 dans un sous-réseau privé appelle fréquemment S3/DynamoDB — comment réduire les coûts NAT Gateway ? » → VPC Gateway Endpoints (gratuits pour S3 et DynamoDB).
- **Règles de tarification du transfert de données** :
  - Vers AWS : gratuit
  - Même AZ : gratuit
  - Inter-AZ : facturé
  - Inter-régions : facturé (tarif plus élevé)
  - Internet : facturé (tarif significatif)
- **CloudFront comme optimisation des coûts** : « Réduire les coûts de transfert de données pour la livraison de contenu mondial » → CloudFront. La couche de cache réduit les requêtes vers l'origine.
- **S3 Transfer Acceleration** : Accélère les téléversements *vers* S3 en utilisant les emplacements périphériques CloudFront. Coût plus élevé que S3 standard. À utiliser pour les clients téléversant de grands fichiers depuis des emplacements géographiquement éloignés.
- **Coûts de réplication inter-régions** : La réplication des données entre régions entraîne des frais de transfert de données. Pour S3 CRR, vous payez à la fois le tarif de transfert de données sortant et le coût des requêtes S3.
- **PrivateLink (VPC Interface Endpoints)** : Fournit une connectivité privée aux services AWS et aux services hébergés par d'autres clients AWS. Plus sécurisé que de passer par NAT, souvent moins cher pour les services à fort volume. Le seuil de rentabilité par rapport au traitement NAT Gateway est d'environ 420 Go/mois (en comptant le coût horaire propre par AZ de l'endpoint, et en supposant que la NAT Gateway reste pour le reste du trafic).

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre un VPC Gateway Endpoint et un VPC Interface Endpoint. Pour quels services AWS chacun est-il disponible, et quel est le coût de chacun ?

*(Indice : Les Gateway Endpoints sont gratuits mais uniquement pour S3 et DynamoDB. Les Interface Endpoints coûtent par heure mais fonctionnent pour la plupart des autres services AWS.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : L'application d'une entreprise tourne sur des instances EC2 dans des sous-réseaux privés. Les instances effectuent des appels API fréquents vers Amazon SQS et Amazon S3. Actuellement, tout le trafic sort par une NAT Gateway. L'équipe veut réduire les coûts NAT Gateway. La sécurité des données doit être maintenue — aucun trafic ne devrait traverser l'internet public.

Quelle approche répond LE MIEUX à ces exigences avec un coût continu minimum ?

A) Créer un Gateway Endpoint pour SQS et un Gateway Endpoint pour S3  
B) Créer des Interface Endpoints pour SQS et S3  
C) Créer un Interface Endpoint pour SQS et un Gateway Endpoint pour S3  
D) Supprimer la NAT Gateway et utiliser directement la passerelle internet pour les appels API

**Indice 1** : Les Gateway Endpoints ne sont disponibles que pour S3 et DynamoDB.

**Indice 2** : Les Interface Endpoints sont disponibles pour SQS et de nombreux autres services (mais coûtent de l'argent).

**Indice 3** : Une passerelle internet dans la table de routage du sous-réseau privé en ferait un sous-réseau public — violant les exigences de sécurité.

**Réponse** : C

**Explication** : S3 utilise un Gateway Endpoint (gratuit). SQS nécessite un Interface Endpoint (payant). Cette combinaison élimine les coûts de traitement de données NAT Gateway pour les deux services. Tout le trafic reste dans le réseau privé d'AWS — pas de traversée de l'internet public.

**Pourquoi pas A ?** Les Gateway Endpoints ne sont pas disponibles pour SQS. Seuls S3 et DynamoDB ont des Gateway Endpoints.

**Pourquoi pas B ?** Bien que cela fonctionne, utiliser un Interface Endpoint pour S3 (au lieu du Gateway Endpoint gratuit) entraîne des frais horaires inutiles. Utilisez toujours le Gateway Endpoint gratuit pour S3 et DynamoDB.

**Pourquoi pas D ?** Ajouter une route vers la passerelle internet depuis le sous-réseau privé en fait un sous-réseau public. Les instances EC2 dans les sous-réseaux privés n'ont généralement pas d'Elastic IP, donc elles ne pourraient pas réellement router via une passerelle internet sans changements supplémentaires — et ce faisant, elles seraient exposées au trafic internet entrant.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.4*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Les utilisateurs de la Côte Est de Nimbus génèrent un trafic significatif. L'application les sert depuis us-west-2 (Oregon). Actuellement :

- Les réponses API vont directement des instances EC2 us-west-2 vers les utilisateurs de la Côte Est (~80 ms, 0,09 $/Go)
- Les photos de menus vont de S3 us-west-2 via le bord CloudFront à Boston (~8 ms après mise en cache)

L'équipe envisage d'ajouter une deuxième région d'application dans us-east-1 (Virginie du Nord) pour que les utilisateurs de la Côte Est réduisent la latence de l'API.

Analysez les coûts de transfert de données de ce changement. Quels nouveaux coûts de transfert de données inter-régions le setup double-région entraînerait-il ? Le routage basé sur la latence Route 53 réduirait-il ou augmenterait-il les coûts de transfert totaux ? Dans quelles conditions (volume de trafic, sensibilité à la latence) le setup double-région serait-il rentable ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer l'analyse coût-bénéfice multi-régions.)*

## Scène post-générique

Tom ferma l'analyse réseau.

Impact total du projet d'optimisation sur trois mois :

- EC2 Savings Plans : -14 200 $/an
- Politiques de cycle de vie S3 : -7 800 $/an
- Stockage (S3 + EBS) : -6 200 $/an
- Niveau base de données : -5 892 $/an
- Réseau : -1 812 $/an
- **Total : -35 904 $/an**

Il l'écrivit sur un tableau blanc dans la salle de réunion.

Leo le fixa. « Trente-cinq mille. »

« Et des poussières, » dit Tom.

« Par an. »

« Par an. »

Priya fit le calcul. « Ça fait 2 992 $ par mois qu'on dépensait pour des choses qui ne créaient pas de valeur. »

« Pas tout, » corrigea Tom. « Certaines choses dont on obtenait de la valeur, mais pour lesquelles on payait trop cher. Les Savings Plans — on obtenait exactement la même capacité EC2, juste à un meilleur prix. »

Maya resta longtemps devant le tableau blanc.

« Quand on a commencé Nimbus, » dit-elle, « chaque dollar comptait. On pouvait à peine se permettre la première instance EC2. »

« Oui, » dit Tom.

« Et quelque part en cours de route, on a cessé de surveiller les dollars aussi attentivement. »

« La croissance fait ça, » dit Priya. « L'attention se déplace vers la construction, pas l'optimisation. »

« Les deux comptent, » dit Maya. « Les deux, toujours. Ajoutez ça au wiki. Et fixez une revue trimestrielle des coûts. »

Tom était déjà en train d'ouvrir son calendrier.

Dans les prochains chapitres : on prend du recul par rapport aux services individuels et on commence à penser comme des architectes.
