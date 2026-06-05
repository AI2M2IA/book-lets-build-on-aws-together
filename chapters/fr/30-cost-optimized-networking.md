# Chapitre 30 : Le Coût Caché

Les coûts de stockage apparaissent comme une ligne : « S3 : 198 $. » Les coûts de calcul apparaissent comme une ligne : « EC2 : 2 340 $. » Les coûts réseau se dispersent sur une douzaine de postes avec des noms comme « Transfert de Données Sortant », « Traitement NAT Gateway », « Transfert de Données VPC Peering » et « Transfert de Données CloudFront ». La plupart des ingénieurs les additionnent une fois, clignent des yeux, et les additionnent à nouveau.

Tom avait dit : « Les coûts réseau. C'est la prochaine étape. »

Il consulta la facture. Trouva la section de transfert de données. Additionna tous les postes.

Les coûts réseau dans AWS ressemblent au système de péage d'une ville : entrer en ville est gratuit, mais chaque tunnel que vous prenez à la sortie coûte de l'argent, et conduire entre les quartiers coûte aussi un peu. La plupart des gens ne pensent pas aux péages jusqu'à recevoir une facture à la fin du mois et réaliser qu'ils prenaient le tunnel tous les jours alors qu'il y avait une route de surface gratuite tout ce temps. L'objectif de ce chapitre est de comprendre chaque poste de péage — et de décider lesquels valent la peine d'être payés.

847 $/mois.

« On dépense 847 $ par mois en transfert de données, » dit-il.

« C'est beaucoup ? » demanda Leo.

« C'est plus que notre facture S3 avant qu'on l'optimise. Et je ne savais même pas qu'on avait une facture de transfert de données de cette taille. »

Maya regarda. « Qu'est-ce que c'est exactement le transfert de données ? »

« C'est ce qu'AWS facture pour déplacer des octets. Les octets entrant dans AWS : généralement gratuits. Les octets sortant d'AWS vers internet : facturés. Les octets entre services dans différentes régions : facturés. Les octets passant par une NAT Gateway : facturés. »

« Peux-tu le détailler ? »

Tom pouvait. Et ce qu'il trouva a changé la façon dont l'équipe pensait à leur architecture.

**Comment AWS Facture le Transfert de Données**

La tarification du transfert de données AWS est asymétrique :

**Vers AWS (entrant)** : Gratuit. Vous pouvez téléverser autant de données que vous voulez.

**Depuis AWS vers internet (sortant)** : Facturé. Les 100 premiers Go/mois sont gratuits. Ensuite :

- 0,09 $/Go pour les 10 premiers To/mois (régions US)
- 0,085 $/Go pour les 40 To suivants
- Moins cher à des volumes plus élevés

**Dans la même Zone de Disponibilité** : Gratuit. Les instances EC2 qui se parlent dans la même AZ ne paient rien.

**Entre Zones de Disponibilité (même région)** : 0,01 $/Go dans chaque direction. Un coût petit mais réel.

**Entre Régions** : 0,02 à 0,08 $/Go selon les régions. Le trafic inter-régions est significativement plus cher.

**NAT Gateway** : 0,045 $/Go traité. Chaque octet que votre instance EC2 privée envoie via la NAT Gateway pour atteindre internet — et chaque octet qui revient — est facturé.

**CloudFront** : Tarifs de transfert de données inférieurs à ceux directs AWS-vers-internet. 0,085 $/Go pour les 10 premiers To (légèrement moins que le transfert de données sortant direct). CloudFront réduit souvent les coûts de transfert totaux car sa mise en cache en périphérie signifie que l'origine sert moins souvent les données.

**La Ventilation de Tom**

Après avoir catégorisé chaque poste :

**Données sortantes vers internet** : 214 $/mois

- Réponses API aux clients globalement
- Remplissages du cache CloudFront (quand les emplacements périphériques récupèrent depuis l'origine)

**Traitement NAT Gateway** : 289 $/mois

- Serveurs applicatifs appelant des API externes (processeur de paiement, service d'e-mails, données cartographiques)
- Appels DynamoDB passant par la NAT Gateway (avant que les VPC endpoints soient configurés pour certaines tables)

**Transfert de données inter-AZ** : 178 $/mois

- Équilibreur de charge vers les instances EC2 (l'équilibreur de charge est dans une AZ, certaines instances dans une autre)
- Serveur applicatif vers le réplica de lecture RDS (dans une AZ différente)

**Transfert de données inter-régions** : 166 $/mois

- Réplication Aurora Global Database (primaire dans us-east-1, reader dans us-west-2)
- S3 Cross-Region Replication pour les sauvegardes

**NAT Gateway : La Plus Grande Surprise**

289 $/mois de frais de traitement NAT Gateway était le poste le plus important. Et c'était en partie inutile.

Dans le chapitre 11, Tom avait configuré des VPC Gateway Endpoints pour S3 et DynamoDB. Ceux-ci étaient gratuits. Mais il avait manqué la configuration des Interface Endpoints pour plusieurs autres services :

- Systems Manager (SSM) pour la gestion des patchs
- Secrets Manager pour la récupération des credentials
- CloudWatch pour l'expédition des métriques et des logs
- SQS pour l'interrogation des messages

Chaque appel à ces services depuis des instances EC2 privées passait par la NAT Gateway. Chaque appel facturé à 0,045 $/Go.

Les **Interface Endpoints** pour ces services : 0,01 $/heure par AZ + 0,01 $/Go de données traitées.

Au volume de Nimbus, l'Interface Endpoint SSM coûterait environ 15 $/mois et économiserait environ 43 $/mois en frais NAT Gateway (parce que SSM génère un volume de données significatif pour la gestion des patchs et les appels parameter store).

Les coûts et économies des endpoints variaient selon le service et le volume. Tom a calculé que la mise en place d'Interface Endpoints pour les quatre services à fort trafic coûterait 62 $/mois au total et économiserait environ 140 $/mois en traitement NAT Gateway.

Économie nette : 78 $/mois juste de la mise en place des endpoints.

**Trafic Inter-AZ : Une Question Architecturale**

Les 178 $/mois de transfert de données inter-AZ étaient plus délicats.

Une partie était inévitable : l'équilibreur de charge distribue le trafic entre les AZs, donc certaines requêtes originaires d'une AZ sont transmises par l'équilibreur de charge à une instance dans une autre AZ.

Une partie était optimisable : l'application était configurée pour écrire dans la primaire RDS (dans us-east-1a) et lire depuis le réplica de lecture (dans us-east-1b). Chaque requête de lecture traversait les limites d'AZ.

Pour les lectures, une solution : configurer l'application pour préférer un réplica de lecture dans la même AZ que l'instance qui fait la requête. Chaque AZ obtient son propre réplica de lecture. Le trafic reste local.

Compromis : plus de réplicas de lecture = plus de coût. Si le coût du trafic inter-AZ est de 50 $/mois et qu'un réplica de lecture supplémentaire coûte 190 $/mois, l'optimisation locale à l'AZ ne se rentabilise pas.

Tom calcula : à leur volume de requêtes actuel, le trafic inter-AZ n'était que de 31 $/mois des 178 $. Pas assez pour justifier l'ajout de réplicas.

Les autres coûts inter-AZ étaient le routage de l'équilibreur de charge et la communication service à service — largement inévitables au niveau d'architecture actuel.

« C'est l'un de ces cas où comprendre le coût ne signifie pas qu'il faut le corriger, » dit Tom.

« Combien coûterait-il d'éliminer entièrement le trafic inter-AZ ? » demanda Maya.

« Tout mettre dans une AZ va à l'encontre de l'objectif de Multi-AZ. Ce serait 31 $ d'économies au prix de la perte de la haute disponibilité. »

« Donc on le laisse, » dit-elle.

« On le laisse. »

C'est la conversation mature sur les coûts : parfois vous payez pour quelque chose parce que l'alternative coûte plus en risque.

**CloudFront : La Réduction du Transfert de Données**

Voici un fait contre-intuitif : servir des données via CloudFront est généralement moins cher que de les servir directement depuis EC2 ou S3.

**EC2 direct vers internet** : 0,09 $/Go
**CloudFront vers internet** : 0,085 $/Go (légèrement moins cher)

Mais la vraie économie n'est pas dans le tarif par Go — c'est que CloudFront met en cache les données dans les emplacements périphériques. Si 1 000 utilisateurs demandent la même photo de menu :

- **Sans CloudFront** : 1 000 requêtes atteignent l'origine S3 × taille de la photo × 0,09 $/Go
- **Avec CloudFront** : 1 requête atteint S3 (cache miss) + 999 requêtes servies depuis le cache périphérique aux tarifs CloudFront

Pour Nimbus avec un taux de cache hit de 83% (du chapitre 13), ils servaient 83% des requêtes depuis le cache périphérique. Le transfert de données réel vers l'origine était de 17% du total des requêtes — 83% de leur trafic « sortant » était mis en cache à la périphérie.

« CloudFront n'est pas juste un CDN pour les performances, » dit Tom. « C'est aussi une optimisation des coûts pour le transfert de données. »

Leo parut pensif. « On devrait faire passer toute la livraison de contenu statique par CloudFront, même pour les ressources qui ne sont pas sensibles à la latence. »

« Correct. Si les utilisateurs le téléchargent depuis AWS, ça devrait passer par CloudFront. »

**S3 Select : Réduire le Transfert de Données dans les Requêtes**

Une optimisation subtile : **S3 Select** vous permet de récupérer uniquement les lignes et colonnes dont vous avez besoin depuis un objet S3 (CSV, JSON, Parquet), plutôt que de télécharger le fichier entier pour le filtrer dans votre application.

Sans S3 Select :
```python
# Télécharger un fichier de 500 Mo, traiter en mémoire
data = s3.get_object(Bucket='analytics', Key='orders-2024.csv')
df = pd.read_csv(data['Body'])
result = df[df['restaurant_id'] == '47'][['order_id', 'total']]
```

Avec S3 Select :
```python
# Laisser S3 filtrer d'abord, transférer uniquement les lignes correspondantes (~2 Mo au lieu de 500 Mo)
response = s3.select_object_content(
    Bucket='analytics',
    Key='orders-2024.csv',
    Expression="SELECT order_id, total FROM S3Object WHERE restaurant_id = '47'"
)
```

S3 Select réduit les données transférées de S3 vers votre application. Pour les grands fichiers avec des requêtes sélectives, cela peut être une réduction de 10 à 100 fois du volume de données — et donc du coût.

**L'Optimisation Réseau Complète**

Après trois semaines d'analyse et de mise en œuvre :

| Poste de Coût                                          | Avant    | Après    | Économie Mensuelle |
|--------------------------------------------------------|----------|----------|--------------------|
| NAT Gateway (Interface Endpoints)                      | 289 $    | 211 $    | 78 $               |
| Optimisation CloudFront (déplacer plus de ressources)  | 214 $    | 147 $    | 67 $               |
| Trafic inter-AZ (accepté tel quel)                     | 178 $    | 178 $    | 0 $                |
| Trafic inter-régions (accepté tel quel)                | 166 $    | 166 $    | 0 $                |
| **Total**                                              | **847 $** | **702 $** | **145 $/mois**    |

145 $/mois, 1 740 $/an d'économies réseau. Modeste comparé au calcul et au stockage, mais significatif.

Plus important : Tom comprenait maintenant chaque ligne de la facture réseau. Il pouvait expliquer chaque coût et avait consciemment décidé lesquels optimiser et lesquels accepter.

## Points Forts et Limites

**Coûts NAT Gateway** :

- Les grands volumes de données via NAT Gateway s'accumulent rapidement
- Les VPC Endpoints éliminent certains coûts NAT entièrement
- Examinez quels services vos instances privées appellent et si des endpoints sont disponibles

**CloudFront pour les coûts** :

- Le taux de cache hit détermine directement les économies de coûts
- Taux de cache hit élevé = transfert depuis l'origine plus faible + coût total de transfert plus faible
- Faites passer toute la livraison de ressources statiques par CloudFront

**Compromis inter-AZ** :

- Éliminer le trafic inter-AZ nécessite généralement des changements architecturaux qui coûtent plus que les économies
- Calculez soigneusement avant d'optimiser

**S3 Select** :

- Économies significatives pour les requêtes sélectives sur de grands objets S3
- N'aide pas quand vous avez besoin du fichier entier

Dans le prochain chapitre : le cadre à six piliers qui pose les questions avec lesquelles toute revue d'architecture devrait commencer.

## Résumé

- AWS facture pour les **données sortantes** (internet : ~0,09 $/Go), le **trafic inter-AZ** (0,01 $/Go dans chaque direction), le **trafic inter-régions** (0,02 à 0,08 $/Go) et le **traitement NAT Gateway** (0,045 $/Go).
- Les **données entrantes** sont gratuites. Le **trafic dans la même AZ** est gratuit.
- **VPC Gateway Endpoints** (S3, DynamoDB) : Gratuits. Éliminent les coûts NAT Gateway pour ces services.
- **VPC Interface Endpoints** : Facturés par heure plus par Go. Moins chers que NAT Gateway pour les services à fort volume.
- **CloudFront** sert les données à des tarifs inférieurs à ceux d'EC2 direct vers internet et réduit considérablement le volume de transfert vers l'origine grâce à la mise en cache.
- **S3 Select** réduit le transfert de données depuis S3 en filtrant à la source.
- Certains coûts réseau sont des compromis architecturaux (inter-AZ pour la HA) — comprenez-les, ne les éliminez pas toujours.

## Conseils pour l'Examen

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
- **PrivateLink (VPC Interface Endpoints)** : Fournit une connectivité privée aux services AWS et aux services hébergés par d'autres clients AWS. Plus sécurisé que de passer par NAT, souvent moins cher pour les services à fort volume.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre un VPC Gateway Endpoint et un VPC Interface Endpoint. Pour quels services AWS chacun est-il disponible, et quel est le coût de chacun ?

*(Indice : Les Gateway Endpoints sont gratuits mais uniquement pour S3 et DynamoDB. Les Interface Endpoints coûtent par heure mais fonctionnent pour la plupart des autres services AWS.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : L'application d'une entreprise tourne sur des instances EC2 dans des sous-réseaux privés. Les instances effectuent des appels API fréquents vers Amazon SQS et Amazon S3. Actuellement, tout le trafic sort par une NAT Gateway. L'équipe veut réduire les coûts NAT Gateway. La sécurité des données doit être maintenue — aucun trafic ne devrait traverser l'internet public.

Quelle approche répond LE MIEUX à ces exigences avec un coût continu minimum ?

A) Créer un Gateway Endpoint pour SQS et un Gateway Endpoint pour S3  
B) Créer un Interface Endpoint pour SQS et un Gateway Endpoint pour S3  
C) Créer des Interface Endpoints pour SQS et S3  
D) Supprimer la NAT Gateway et utiliser directement la passerelle internet pour les appels API

**Indice 1** : Les Gateway Endpoints ne sont disponibles que pour S3 et DynamoDB.

**Indice 2** : Les Interface Endpoints sont disponibles pour SQS et de nombreux autres services (mais coûtent de l'argent).

**Indice 3** : Une passerelle internet dans la table de routage du sous-réseau privé en ferait un sous-réseau public — violant les exigences de sécurité.

**Réponse** : B

**Explication** : S3 utilise un Gateway Endpoint (gratuit). SQS nécessite un Interface Endpoint (payant). Cette combinaison élimine les coûts de traitement de données NAT Gateway pour les deux services. Tout le trafic reste dans le réseau privé d'AWS — pas de traversée de l'internet public.

**Pourquoi pas A ?** Les Gateway Endpoints ne sont pas disponibles pour SQS. Seuls S3 et DynamoDB ont des Gateway Endpoints.

**Pourquoi pas C ?** Bien que cela fonctionne, utiliser un Interface Endpoint pour S3 (au lieu du Gateway Endpoint gratuit) entraîne des frais horaires inutiles. Utilisez toujours le Gateway Endpoint gratuit pour S3 et DynamoDB.

**Pourquoi pas D ?** Ajouter une route vers la passerelle internet depuis le sous-réseau privé en fait un sous-réseau public. Les instances EC2 dans les sous-réseaux privés n'ont généralement pas d'Elastic IPs, donc elles ne pourraient pas réellement router via une passerelle internet sans changements supplémentaires — et ce faisant, elles les exposeraient au trafic internet entrant.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.4*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Les utilisateurs de la Côte Ouest de Nimbus génèrent un trafic significatif. L'application les sert depuis us-east-1 (Virginie). Actuellement :

- Les réponses API vont directement des instances EC2 us-east-1 vers les utilisateurs de la Côte Ouest (~80ms, 0,09 $/Go)
- Les photos de menus vont de S3 us-east-1 via le bord CloudFront à Seattle (~8ms après mise en cache)

L'équipe envisage d'ajouter une deuxième région d'application dans us-west-2 (Oregon) pour que les utilisateurs de la Côte Ouest réduisent la latence de l'API.

Analysez les coûts de transfert de données de ce changement. Quels nouveaux coûts de transfert de données inter-régions le setup double-région entraînerait-il ? Le routage basé sur la latence Route 53 réduirait-il ou augmenterait-il les coûts de transfert totaux ? Dans quelles conditions (volume de trafic, sensibilité à la latence) le setup double-région serait-il rentable ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer l'analyse coût-bénéfice multi-régions.)*

## Scène Post-Générique

Tom ferma l'analyse réseau.

Impact total du projet d'optimisation sur trois mois :

- EC2 Savings Plans : -14 200 $/an
- Stockage (S3 + EBS) : -6 200 $/an
- Niveau base de données : -11 220 $/an
- Réseau : -1 740 $/an
- **Total : -33 360 $/an**

Il l'écrivit sur un tableau blanc dans la salle de réunion.

Leo le fixa. « Trente-trois mille. »

« Et des poussières, » dit Tom.

« Par an. »

« Par an. »

Priya fit le calcul. « Ça fait 2 780 $ par mois qu'on dépensait pour des choses qui ne créaient pas de valeur. »

« Pas tout, » corrigea Tom. « Certaines choses dont on obtenait de la valeur, mais pour lesquelles on payait trop cher. Les Savings Plans — on obtenait exactement la même capacité EC2, juste à un meilleur prix. »

Maya resta longtemps devant le tableau blanc.

« Quand on a commencé Nimbus, » dit-elle, « chaque dollar comptait. On pouvait à peine se permettre la première instance EC2. »

« Oui, » dit Tom.

« Et quelque part en cours de route, on a cessé de surveiller les dollars aussi attentivement. »

« La croissance fait ça, » dit Priya. « L'attention se déplace vers la construction, pas l'optimisation. »

« Les deux comptent, » dit Maya. « Les deux, toujours. Ajoutez ça au wiki. Et fixez une revue trimestrielle des coûts. »

Tom était déjà en train d'ouvrir son calendrier.

Dans les prochains chapitres : on prend du recul par rapport aux services individuels et on commence à penser comme des architectes.
