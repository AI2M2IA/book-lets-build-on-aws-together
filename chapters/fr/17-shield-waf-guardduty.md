# Chapitre 17 : Les sentinelles

L'incident avec l'IP roumaine avait été contenu. Les secrets étaient dans Secrets Manager. Les identifiants étaient rotatés. Les contrôles réseau étaient resserrés.

Mais Priya avait posé la question qui terminait le Chapitre 16 : « Si quelque chose d'inhabituel apparaissait dans CloudTrail, comment le saurait-on ? »

La réponse honnête était : ils ne le sauraient probablement pas.

---

*Tout ce qui pouvait être verrouillé l'avait été. Les secrets étaient dans Secrets Manager. Les clés de chiffrement étaient dans KMS. Le trafic réseau était contrôlé par des groupes de sécurité et des NACLs. Les défenses périmétriques étaient solides. Mais les défenses périmétriques supposent que vous savez à quoi ressemble une attaque avant qu'elle n'arrive. La question que Priya posait était différente : qu'en est-il des attaques que vous ne voyez pas venir ?*

---

CloudTrail journalise des milliers d'événements par jour. Aucun humain ne les lit tous. Priya vérifiait manuellement chaque semaine, mais ça signifiait que quelque chose pouvait se produire un mardi et ne pas être remarqué avant le lundi suivant.

« On a besoin de quelque chose qui surveille les journaux pour nous », dit-elle.

Maya leva les yeux. « Automatiquement ? »

« Automatiquement. »

« Et si quelqu'un essaie de s'introduire ? » continua Priya. « Pas juste un identifiant compromis — et si quelqu'un lance un DDoS ? Et s'ils commencent à sonder nos points de terminaison d'API à la recherche de vulnérabilités d'injection ? Et s'ils sont déjà à l'intérieur et qu'on ne le sait pas ? »

« Ce sont trois problèmes différents », dit Leo.

« Oui », dit Priya. « Et AWS a trois services différents pour les traiter. »

**Trois catégories de menaces**

Les menaces de sécurité contre une application cloud tombent généralement dans trois catégories :

**Attaques par volume (DDoS)** : Un attaquant envoie tellement de trafic que votre application ne peut pas répondre aux utilisateurs légitimes. L'attaque pourrait être des millions de requêtes HTTP, ou un déluge de paquets TCP SYN conçus pour épuiser la table de connexions de votre serveur.

**Attaques applicatives (Exploits)** : Un attaquant envoie des requêtes spécifiquement conçues pour exploiter les faiblesses de votre application — injection SQL, cross-site scripting, entrée malformée qui fait planter un analyseur.

**Anomalies comportementales (Reconnaissance et compromission)** : Des appels d'API qui ne devraient pas se produire (quelqu'un interrogeant toute votre base de données d'utilisateurs à 3 h du matin), une activité IAM inhabituelle (des identifiants utilisés depuis un nouveau pays), ou un trafic réseau vers des destinations inattendues.

AWS a un service dédié pour chacune :

- **AWS Shield** : Protection DDoS
- **AWS WAF** : Protection au niveau application
- **Amazon GuardDuty** : Détection comportementale des menaces

**AWS Shield : L'absorbeur de DDoS**

**AWS Shield Standard** est activé automatiquement pour tous les clients AWS sans frais supplémentaires. Il protège contre les attaques DDoS de couche 3 (réseau) et de couche 4 (transport) les plus courantes — inondations SYN, inondations UDP, attaques d'amplification DNS.

CloudFront, Route 53 et Elastic Load Balancing se trouvent à la périphérie du réseau d'AWS. Quand une attaque DDoS cible votre application, elle frappe ces services gérés en premier. L'infrastructure réseau d'AWS absorbe l'attaque avant qu'elle n'atteigne vos instances EC2.

**AWS Shield Advanced** est le niveau premium (3 000 $/mois par organisation, avec un engagement d'un an). C'est un abonnement séparé — il n'est *pas* inclus dans un quelconque plan de support AWS. Il ajoute :

- Protection pour EC2, ELB, CloudFront, Global Accelerator et Route 53
- Notifications d'attaque en temps quasi réel
- Accès à l'AWS Shield Response Team (SRT) — des ingénieurs en sécurité qui peuvent vous aider à répondre aux attaques (engager la SRT nécessite en plus un plan de support Business ou Enterprise)
- Protection des coûts : si une attaque fait grimper votre facture, AWS crédite les coûts de pointe
- Détection et atténuation DDoS améliorées à la couche 7 (couche application)

« Combien ça coûte par mois ? » demanda Tom.

« Trois mille dollars », dit Priya. « Par organisation. »

Tom resta silencieux un moment.

« Pour les entreprises gérant des millions de chiffre d'affaires, un DDoS qui les met hors service pendant deux heures coûte plus de trois mille dollars », dit Priya.

Tom fit le calcul en silence.

« On va commencer avec Standard », dit-il finalement.

---

**L'incident DDoS : À quoi ressemble Shield en action**

Huit mois après le lancement, Nimbus reçut sa première vraie attaque DDoS.

Ça commença à 11 h 43 un mardi. Le tableau de bord CloudWatch de l'équilibreur de charge montrait les requêtes de connexion entrantes grimper de la normale de 3 000 par minute à 180 000 par minute en moins de quatre-vingt-dix secondes. Les IP source étaient distribuées sur quarante pays, et le volume entrant culminait autour de cinquante gigabits par seconde. Le schéma était sans équivoque : un botnet lançant une inondation SYN.

Leo vit les métriques CloudFront en premier. « Le taux de requêtes a été multiplié par soixante. Le temps de réponse grimpe en flèche. »

Priya ouvrit les métriques CloudWatch côte à côte : les tentatives de connexion à la périphérie montant verticalement, les requêtes atteignant réellement l'origine — plates. « Shield Standard l'avale », dit-elle. Il n'y avait pas d'alerte, pas d'événement de tableau de bord, pas de notification. Shield Standard fonctionne silencieusement : il est toujours activé, il est gratuit, et il vous donne **aucune visibilité sur les attaques** — pas de console d'événements, pas de notifications, pas d'équipe de réponse DDoS. (Cette visibilité — tableaux de bord et alertes d'attaque en temps quasi réel — est précisément ce que vend Shield *Advanced*.) La seule façon pour Priya de voir l'attaque était à travers ses propres métriques CloudWatch.

Shield Standard avait automatiquement détecté l'inondation SYN et engagé l'atténuation dans les deux premières minutes. Le trafic d'attaque était absorbé aux nœuds périphériques de CloudFront à l'échelle mondiale — les mêmes 750+ points de présence qui servaient le contenu légitime absorbaient aussi le volume de l'attaque.

À 11 h 52 — neuf minutes après le début de l'attaque — l'atténuation de Shield avait ramené le taux de requêtes à l'origine à la normale. L'attaque tournait toujours au niveau réseau, mais l'atténuation la gérait. L'application Nimbus continua à servir les utilisateurs tout du long.

« Les utilisateurs n'ont rien remarqué ? » demanda Leo, en regardant la métrique du taux d'erreur.

« Le taux d'erreur a augmenté d'environ deux pour cent pendant environ quatre minutes », dit Priya. « Certains utilisateurs ont eu une réponse légèrement plus lente. Aucune panne. L'application est restée debout. »

« Parce que Shield a absorbé l'inondation à la périphérie. »

« Avant qu'elle n'atteigne notre équilibreur de charge. L'inondation SYN de cinquante gigabits a frappé CloudFront. Le temps que le schéma de trafic soit reconnu et atténué, notre origine n'avait vu que le volume de requêtes normal. »

L'attaque dura quarante-sept minutes. À 12 h 30, les métriques de périphérie étaient revenues à la ligne de base — le seul signal « résolu » que Shield Standard vous donne.

« Et c'est Shield Standard », dit Tom. « La version gratuite. »

« Les attaques de couche 3 et 4. Standard protège contre celles-là automatiquement. Si l'attaque avait été plus sophistiquée — une inondation HTTP de couche 7, par exemple, où chaque requête semblait légitime — Standard n'aurait pas suffi. Ça nécessite Shield Advanced plus WAF. »

Tom nota « Surveiller les schémas DDoS de couche 7 » dans sa feuille de route de sécurité.

---

**AWS WAF : Le filtre applicatif**

**AWS WAF (Web Application Firewall)** opère au niveau HTTP — il inspecte le contenu des requêtes web avant qu'elles n'atteignent votre application.

WAF est configuré avec des **Web ACL (Access Control Lists)** — des ensembles de règles qui définissent quoi autoriser, bloquer ou compter.

WAF peut être attaché à :

- Des distributions CloudFront (inspecter les requêtes à la périphérie, à l'échelle mondiale)
- Des Application Load Balancers (inspecter les requêtes au niveau régional)
- API Gateway
- AWS AppSync

**Règles gérées WAF** : AWS et des fournisseurs tiers publient des ensembles de règles préconstruits :

- **AWS Managed Rules - Core Rule Set** : Avec les groupes de règles compagnons (base de données SQL, Known Bad Inputs), couvre les vulnérabilités OWASP Top 10 (injection SQL, XSS, injection de commande, traversée de chemin, etc.)
- **AWS Managed Rules - Known Bad Inputs** : Bloque les requêtes correspondant à des schémas d'attaque connus
- **AWS Managed Rules - Amazon IP Reputation List** : Bloque les IP connues pour être associées à des botnets et des scanneurs
- **AWS Managed Rules - Bot Control** : Identifie et gère le trafic de bots

Vous pouvez aussi créer des règles personnalisées :

- « Bloquer toute requête avec un en-tête User-Agent contenant 'sqlmap' » (un scanneur d'injection SQL courant)
- « Limite de débit : n'autoriser pas plus de 1 000 requêtes par IP toutes les 5 minutes »
- « Bloquer les requêtes qui contiennent `<script>` dans n'importe quelle valeur de paramètre »

Pour Nimbus, la configuration pratique : WAF sur la distribution CloudFront avec le Core Rule Set activé. Ça bloque les schémas d'attaque les plus courants avant que les requêtes n'atteignent jamais les instances EC2.

Vous vous demandez peut-être : si WAF bloque les schémas d'attaque connus, que se passe-t-il quand un nouveau schéma d'attaque apparaît que WAF ne connaît pas ? Les ensembles de règles gérées WAF sont mis à jour par AWS et des fournisseurs tiers à mesure que de nouvelles menaces émergent — vous n'avez pas à mettre à jour les règles manuellement. Mais vous avez raison que WAF est fondamentalement réactif aux schémas connus. Les techniques d'attaque nouvelles et inédites ne seront pas bloquées par une règle qui n'existe pas encore. C'est pourquoi GuardDuty existe aux côtés de WAF : WAF filtre la porte d'entrée, GuardDuty surveille les comportements inhabituels à l'intérieur de la maison. Un nouveau type d'attaque pourrait passer WAF, mais GuardDuty peut quand même signaler l'activité anormale qu'il cause — appels d'API inhabituels, destinations réseau inattendues, schémas d'accès qui ne correspondent pas à la ligne de base.

**A-t-on réfléchi à ce qui se passe si WAF cause des faux positifs ?** demanda Priya. « La requête d'un utilisateur légitime qui se fait bloquer par le Core Rule Set ? »

« WAF a un mode "Count" », dit Leo. « Au lieu de bloquer, il compte juste les requêtes correspondantes. Vous le lancez d'abord en mode Count, examinez ce qu'il aurait bloqué, vérifiez qu'il n'y a pas de faux positifs, puis passez à Block. »

« Bien », dit Priya. « On commence en mode Count. »

---

**Créer une règle WAF : L'histoire de la limite de débit**

Deux semaines après avoir activé WAF en mode Count, Priya examina les journaux. Les résultats du Core Rule Set étaient propres — pas de faux positifs sur le trafic légitime, une poignée de tentatives d'injection SQL bloquées provenant de scanneurs automatisés.

Mais elle remarqua un schéma que le Core Rule Set ne signalait pas : une adresse IP avait fait 847 requêtes vers `/api/search` en cinq minutes. Chaque requête était structurellement valide. Mais 847 recherches en cinq minutes n'était pas un humain.

« Un scrapeur de prix », dit-elle. « Quelqu'un interroge automatiquement notre recherche de restaurants pour construire une base de données de prix concurrentielle. »

« Est-ce que ça nous importe ? » demanda Leo.

« Ça utilise nos ressources de calcul et c'est contre nos conditions de service », dit Tom.

« Ça nous importe », confirma Priya.

Elle créa une règle WAF personnalisée basée sur le débit :

```
Nom de la règle : RateLimitSearchAPI
Type de règle : Règle basée sur le débit
Limite de débit : 100 requêtes par adresse IP
Fenêtre d'évaluation : 5 minutes (configurable : 1, 2, 5 ou 10 minutes)
Déclaration de réduction de portée : le chemin URI commence par /api/search
Action : Bloquer
```

La déclaration de réduction de portée est importante — la limite de débit ne s'applique qu'à `/api/search`. Le trafic d'API légitime vers d'autres points de terminaison n'est pas affecté. Et notez comment fonctionne le blocage : il n'y a pas de période de « punition » fixe — WAF réévalue en continu le taux de requêtes de chaque IP, la bloque tant que le taux reste au-dessus de la limite, et la débloque (généralement en quelques secondes) une fois que le taux redescend en dessous.

Elle le régla d'abord en mode Count. Le fit tourner pendant 24 heures. La seule IP qui déclencha la règle était le scrapeur. Aucun utilisateur légitime n'avait jamais envoyé plus de 12 requêtes au point de terminaison de recherche en cinq minutes.

Elle passa en mode Block. La requête suivante du scrapeur reçut un 403. Il passa à une IP différente. La limite de débit attrapa celle-là aussi.

« Ils vont la contourner à terme », dit Leo. « Distribuer sur plus d'IP. »

« Auquel point ils utilisent plus d'infrastructure, paient plus, et obtiennent moins de données », dit Priya. « On n'a pas besoin de les arrêter complètement. On a besoin de rendre ça assez cher pour que ça n'en vaille pas la peine. »

« Combien ça coûte par mois ? » demanda Tom.

La tarification WAF est par Web ACL par mois, par règle par mois, et par million de requêtes. Pour la configuration Nimbus — une Web ACL, cinq règles sur CloudFront — environ 15 $ par mois plus les frais de requêtes.

Tom l'approuva immédiatement.

---

**Amazon GuardDuty : L'analyste comportemental**

« Attends — mais *pourquoi* ferait-on ça comme ça ? » demanda Maya. « Si WAF bloque les attaques et Shield absorbe les inondations, pourquoi a-t-on besoin d'un troisième service ? Que surveille réellement GuardDuty ? »

WAF et Shield sont des filtres — ils interceptent le mauvais trafic avant qu'il n'atteigne votre application. GuardDuty surveille ce qui se passe après l'arrivée du trafic. Il regarde ce que votre infrastructure fait : quels identifiants IAM sont utilisés, quels domaines vos instances contactent, quels appels d'API se produisent à 3 h du matin. Un attaquant qui franchit la porte d'entrée via une requête d'apparence légitime ne sera pas arrêté par WAF — mais GuardDuty remarquera que le même identifiant fait soudainement des appels d'API depuis la Roumanie.

GuardDuty est fondamentalement différent de Shield et WAF. Il ne bloque pas les attaques — il **détecte les comportements inhabituels**.

GuardDuty analyse en continu plusieurs flux d'activité pour détecter les menaces : les **événements de gestion et de données CloudTrail** (appels et actions d'API), les **VPC Flow Logs** (schémas de trafic réseau), et les **journaux de requêtes DNS** (recherches de domaines). Ce sont les trois sources fondamentales sur lesquelles GuardDuty s'est toujours appuyé :

- **Journaux AWS CloudTrail** : changements IAM, appels d'API, connexions console
- **VPC Flow Logs** : schémas de trafic réseau au sein de votre VPC
- **Journaux de requêtes DNS** : ce que vos instances résolvent (les malwares connus résolvent souvent des domaines C2 spécifiques)

Mais GuardDuty s'est considérablement étendu au-delà de ces trois. AWS appelle les modules optionnels des **plans de protection** — S3 Protection, EKS Protection, RDS Protection, Lambda Protection, Runtime Monitoring et Malware Protection — chacun activé individuellement. Selon ce que vous activez, GuardDuty peut aussi analyser les **événements de données S3** (schémas d'accès inhabituels à vos buckets), les **journaux d'audit et l'activité d'exécution EKS** (comportement malveillant à l'intérieur de conteneurs en cours d'exécution), les **événements de connexion RDS** (tentatives de connexion à la base de données anormales), le **trafic réseau Lambda** (fonctions appelant des destinations externes inattendues), le **comportement d'exécution ECS/EC2**, et les **volumes EBS scannés pour les malwares**. Pour l'examen, connaissez les trois sources de base par cœur ; les plans de protection apparaissent dans des scénarios sur des contextes de détection de menaces spécifiques — « détecter des tentatives de connexion anormales à RDS » ou « identifier un comportement malveillant à l'intérieur d'un conteneur en cours d'exécution » sont des signaux pour penser aux plans de protection optionnels de GuardDuty.

Des modèles de machine learning identifient les schémas qui dévient de votre ligne de base. GuardDuty génère des **findings** — des alertes catégorisées — quand il détecte des anomalies.

Exemples de ce que GuardDuty peut détecter :

- Un utilisateur IAM se connectant depuis une adresse IP non reconnue (dans un pays qu'il n'a jamais utilisé auparavant)
- Des appels d'API faits depuis un nœud de sortie Tor
- Une instance EC2 communiquant avec un pool de minage de cryptomonnaie connu
- Un volume d'appels d'API anormalement élevé (abus d'identifiants ou scan)
- Un bucket S3 accédé par une adresse IP qui a été signalée pour activité malveillante
- Du trafic sortant vers un domaine connu pour être associé à un commandement-et-contrôle de malware

« C'est ce qui aurait attrapé l'IP roumaine », dit Leo doucement.

« Si on avait eu GuardDuty activé, il aurait signalé l'instance EC2 faisant des connexions sortantes vers une IP externe non reconnue à 2 h du matin », confirma Priya.

---

**Cinq types de findings GuardDuty et que faire**

Priya créa un runbook pour les cinq findings GuardDuty les plus courants. Quand un finding se déclenche, l'équipe sait immédiatement ce qu'il signifie et que faire.

**1. UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B**

Un utilisateur IAM s'est connecté avec succès à la console AWS depuis une adresse IP jamais vue pour ce compte auparavant, ou depuis un emplacement géographique incohérent avec les connexions précédentes.

Réponse : Vérifier avec l'utilisateur qu'il a initié la connexion. S'il ne l'a pas fait — ou ne peut pas être joint — immédiatement : désactiver la clé d'accès et le mot de passe console de l'utilisateur, révoquer les sessions actives, et commencer un audit CloudTrail de tout ce que cet utilisateur a fait au cours des dernières 24 heures. Ce finding précède souvent un abus d'identifiants.

**2. CryptoCurrency:EC2/BitcoinTool.B**

Une instance EC2 interroge des adresses IP ou des noms de domaine associés à des pools de minage de cryptomonnaie. C'est presque toujours le résultat d'une instance EC2 compromise et utilisée comme bot de minage.

Réponse : Isoler l'instance immédiatement — modifier son groupe de sécurité pour bloquer tout le trafic entrant et sortant sauf pour votre hôte bastion. Prendre un snapshot forensique du volume EBS. Puis terminer l'instance et lancer un remplacement à partir d'une AMI propre.

**3. Recon:EC2/PortProbeUnprotectedPort**

Une instance EC2 a un port ouvert sur internet qui est sondé par des scanneurs connus ou depuis un nœud de sortie Tor. GuardDuty signale les ports qui apparaissent dans les flow logs comme accessibles depuis des sources externes.

Réponse : Examiner les règles du groupe de sécurité. Si le port est intentionnellement ouvert, marquer le finding comme résolu avec une note. S'il n'est pas intentionnel, fermer le port immédiatement. Vérifier CloudTrail pour tout accès qui aurait pu se produire via ce port.

**4. Trojan:EC2/BlackholeTraffic**

Une instance EC2 tente de communiquer avec une adresse IP qui a été identifiée comme un « trou noir » — une destination associée à une infrastructure de commandement-et-contrôle de malware. Le trafic vers ces IP suggère que l'instance a été infectée et tente de rentrer au bercail.

Réponse : Comme pour les findings CryptoCurrency — isoler, snapshot, remplacer. Ce finding indique un malware actif sur l'instance. Ne tentez pas de nettoyer l'instance sur place ; construisez-en une nouvelle à partir d'une AMI propre.

**5. Policy:S3/BucketBlockPublicAccessDisabled**

Quelqu'un a désactivé le réglage Block Public Access sur un bucket S3. Ça ne signifie pas que le bucket est public — ça signifie que le mécanisme de sécurité qui empêche l'exposition publique accidentelle a été désactivé pour ce bucket. C'est souvent fait accidentellement ou dans le cadre d'un déploiement mal configuré.

Réponse : Enquêter sur qui a fait le changement (CloudTrail aura l'appel d'API). Réactiver Block Public Access à moins qu'il n'y ait une raison documentée pour qu'il soit désactivé. Envisager d'activer le réglage Block Public Access au niveau du compte pour empêcher ce finding de se produire à l'avenir.

« La chose la plus importante à propos des findings GuardDuty », dit Priya, « est qu'ils ne sont pas des alertes — ce sont des hypothèses. Chaque finding dit "ce schéma semble anormal". Vous vérifiez, vous enquêtez, vous répondez. Certains seront des faux positifs. La plupart ne le seront pas. »

« Comment priorise-t-on ? » demanda Rafael.

« GuardDuty assigne des niveaux de sévérité : Low, Medium, High. Les findings de sévérité High nécessitent une réponse le jour même. Les findings de Trojan et de compromission d'identifiants sont toujours High. Les findings de sondage de port pourraient être Medium ou Low. Commencez par High, descendez. »

---

« Combien ça coûte ? » demanda Tom.

La tarification de GuardDuty est basée sur le volume de journaux analysés — événements CloudTrail, données de flux VPC, requêtes DNS. Pour une application petite à moyenne, typiquement 50-150 $/mois. À grande échelle, c'est toujours une petite fraction des coûts d'infrastructure.

Tom ouvrit la console et l'activa.

« Ça ira », dit Leo. « C'est juste de la surveillance. Ce n'est pas comme si ça allait casser quelque chose. »

« Je l'ai déjà déployé », ajouta Leo — puis il vérifia le tableau de bord GuardDuty. « Oh. Des findings d'exemple seulement. Les vrais prennent un moment. »

« GuardDuty a besoin de temps pour construire une ligne de base de ce à quoi ressemble le normal », dit Priya. « Donne-lui quelques jours. Le premier vrai finding arrivera — ils arrivent toujours. »

Elle eut raison là-dessus. Mais le premier finding est une histoire pour la fin de ce chapitre.

**Connecter les trois services**

Shield, WAF et GuardDuty travaillent à des couches différentes et se complètent :

| Service    | Couche                    | Protège contre                              | Action                             |
|------------|---------------------------|---------------------------------------------|------------------------------------|
| AWS Shield | Réseau/Transport (L3/L4)  | Inondations DDoS                            | Absorbe/atténue les attaques       |
| AWS WAF    | Application (L7)          | OWASP Top 10, bots, scrapeurs               | Autorise, bloque ou compte les requêtes |
| GuardDuty  | Comportemental (tous journaux) | Anomalies, identifiants compromis, malware | Détecte et alerte                  |

Shield arrête l'inondation. WAF filtre l'eau. GuardDuty surveille la plomberie à la recherche de schémas de débit inhabituels. Macie audite ce qui est stocké dans les réservoirs. Security Hub est la salle de contrôle où tous les tableaux de bord sont visibles à la fois.

Le mode de défaillance de chacun explique pourquoi vous avez besoin de tous :

- Une inondation SYN de 50 Gbps n'est pas une requête web. WAF ne peut pas l'inspecter. GuardDuty pourrait remarquer les événements CloudTrail associés. Shield l'arrête.
- Une seule requête d'injection SQL n'est pas une inondation. Shield l'ignore. GuardDuty ne connaît pas le contenu des requêtes HTTP. WAF l'attrape.
- Un utilisateur AWS légitime utilisant ses propres identifiants pour exfiltrer des données lentement — pas de DDoS, pas d'injection, HTTP valide — Shield et WAF ne voient rien d'inhabituel. GuardDuty remarque que les identifiants sont utilisés depuis un nouveau pays à 3 h du matin.
- Un développeur qui téléverse accidentellement des données clients dans un bucket accessible publiquement ne génère aucun comportement anormal du tout. GuardDuty n'a rien à signaler. Macie scanne le bucket et trouve les PII.

Chaque service a un angle mort. La combinaison couvre ces angles morts.

**CloudTrail : La fondation**

Les trois services s'appuient sur les journaux. **AWS CloudTrail** est le service de journalisation qui capture chaque appel d'API dans votre compte AWS — qui a appelé quoi, quand, d'où, avec quel résultat.

CloudTrail est activé par défaut pour un historique de 90 jours dans la console. Pour conserver les journaux à long terme :

1. Créer un trail qui écrit vers un bucket S3
2. Optionnellement, envoyer vers CloudWatch Logs pour l'alerte en temps réel
3. Activer la validation des fichiers journaux (pour détecter si les journaux sont altérés)

GuardDuty, AWS Config, Security Hub et IAM Access Analyzer lisent tous depuis CloudTrail. Sans les journaux CloudTrail, ces services n'ont rien à analyser.

« Et si quelqu'un essaie de désactiver CloudTrail ? » demanda Priya. « Si un attaquant obtient un accès administrateur, sa première action pourrait être de désactiver la journalisation — couvrir ses traces. »

« C'est ce que la SCP du Chapitre 14 empêche », dit Leo. « Personne dans ce compte ne peut désactiver CloudTrail, même les administrateurs. »

« Et s'ils le faisaient quand même ? »

« Security Hub générerait un finding. CloudTrail envoie une notification à SNS lors des changements de configuration. On reçoit une alerte dans les deux minutes après toute modification de CloudTrail. »

« Et GuardDuty signalerait l'appel d'API », ajouta Rafael, « comme une action IAM inhabituelle — désactiver la journalisation n'est pas une activité opérationnelle normale. »

Plusieurs couches de détection pour l'une des actions de sécurité les plus critiques : altérer les journaux. Ce n'était pas un accident. Priya l'avait conçu délibérément.

« La défense en profondeur s'applique aussi à la couche de surveillance », dit-elle. « Pas juste à la couche application. »

**Amazon Macie : Données sensibles dans S3**

« A-t-on réfléchi à ce qui se passe si quelqu'un téléverse accidentellement un fichier avec des numéros de carte de crédit de clients dans S3 ? » demanda Priya. « Pas malicieusement — juste un développeur exportant des données pour le débogage et téléversant le mauvais fichier ? »

« On ne le saurait jamais », dit Leo.

« Exactement. À moins qu'on ait Macie. »

**Amazon Macie** est un service de sécurité des données qui utilise le machine learning pour découvrir et protéger automatiquement les données sensibles dans S3. Il scanne en continu les buckets S3 et identifie :

- PII (Informations personnelles identifiables) : noms, adresses e-mail, numéros de téléphone, dates de naissance
- Données financières : numéros de carte de crédit, numéros de compte bancaire
- Identifiants : mots de passe, clés d'accès, clés privées intégrées dans des fichiers
- Informations de santé : dossiers de patients, diagnostics

Macie génère des findings quand il détecte des données sensibles dans des endroits où elles ne devraient pas être — ou quand les buckets S3 ont des configurations d'accès trop permissives.

« Est-ce la même chose que GuardDuty ? » demanda Maya.

« But différent », dit Priya. « GuardDuty surveille le comportement — quelles actions sont prises, si ces actions semblent anormales. Macie surveille les données — quel contenu est stocké, si ce contenu est sensible. GuardDuty signalerait une instance EC2 faisant des appels d'API inhabituels. Macie signalerait un bucket S3 contenant des numéros de carte de crédit. »

« Donc GuardDuty est l'analyste comportemental », dit Leo, « et Macie est l'auditeur de données. »

« Exactement. Vous avez besoin des deux. Un attaquant qui exfiltre des données via un appel d'API d'apparence légitime pourrait être signalé par GuardDuty pour le schéma d'API inhabituel. Mais si un employé téléverse un fichier avec 10 000 enregistrements clients dans un bucket de développement, il n'y a aucun comportement anormal à détecter — juste des données sensibles au mauvais endroit. Macie attrape ça. »

Pour Nimbus, la valeur la plus immédiate de Macie était sur le bucket `nimbus-debug-exports` — un bucket que les développeurs utilisaient pour déverser des données pour le débogage. Macie trouva trois fichiers contenant des historiques de commandes avec des noms de clients et des adresses de livraison. Pas de données de paiement, mais des données personnelles qui n'auraient pas dû être dans un bucket de développement non chiffré.

Les fichiers furent retirés. Une politique fut ajoutée : le bucket de débogage était restreint aux données de test synthétiques uniquement. Les vraies données clients nécessitaient l'approbation de Priya pour être exportées vers tout environnement en dehors de la production.

« Combien ça coûte par mois ? » demanda Tom.

Macie facture en fonction du nombre de buckets S3 évalués par mois et du volume de données scannées. Pour une startup avec un nombre modéré de buckets, environ 10-50 $ par mois. Gratuit pour les 30 premiers jours.

Tom l'activa avant le déjeuner.

---

**AWS Security Hub : Le tableau de bord**

Si vous faites tourner plusieurs comptes AWS ou avez besoin d'une vue consolidée des findings de sécurité, **AWS Security Hub** agrège les findings de GuardDuty, Inspector (évaluation de vulnérabilités), Macie (confidentialité des données), Config et Firewall Manager dans un seul tableau de bord.

Il vérifie aussi votre configuration par rapport aux bonnes pratiques de sécurité (le standard AWS Foundational Security Best Practices) et le CIS AWS Foundations Benchmark.

Security Hub est la réponse à « comment voir tous mes findings de sécurité en un seul endroit sans basculer entre cinq consoles différentes ? » Quand GuardDuty génère un finding, il apparaît dans GuardDuty et dans Security Hub. Quand Macie trouve des données sensibles dans un bucket S3, il apparaît dans Macie et dans Security Hub. Quand une règle Config détecte une mauvaise configuration, elle apparaît dans Config et dans Security Hub.

Pour une équipe à compte unique, Security Hub ajoute une valeur marginale — c'est une autre console à vérifier. Sa puissance émerge à grande échelle : trois comptes, dix comptes, cinquante comptes. Tous les findings de tous les comptes s'agrègent dans le Security Hub d'un compte de gestion. Une équipe surveille un tableau de bord. Un ensemble d'alertes. Pas de vérification de journaux compte par compte.

Pour Nimbus : Security Hub n'était pas encore nécessaire. Quand ils grandiraient jusqu'à trois comptes (dev, staging, production), il deviendrait essentiel.

« Configure-le maintenant », dit Soo-Jin, à sa troisième semaine. « Ça prend quinze minutes à activer. Ça prend trois mois pour souhaiter l'avoir fait plus tôt. »

Ils l'activèrent.

**Amazon Inspector : Évaluation des vulnérabilités**

Une semaine après avoir activé Macie, un CVE fut publié pour la version d'OpenSSL tournant sur l'ensemble de la flotte de production Nimbus. Priya lut l'avis au café.

« On a besoin de savoir lesquelles de nos instances sont affectées », dit-elle.

« Je peux lancer un scan manuel », dit Leo.

« Pour neuf instances, bien sûr. Pour quatre-vingt-dix ? Pour des conteneurs ? » Priya ouvrit la console Inspector. « C'est à ça que sert Inspector. »

**Amazon Inspector** est un service automatisé d'évaluation des vulnérabilités. Là où GuardDuty surveille le comportement — ce que votre infrastructure fait en ce moment — Inspector regarde ce qui est présent qui pourrait être exploité.

- **Instances EC2 :** Inspector scanne le système d'exploitation et les paquets installés par rapport à la NVD (National Vulnerability Database) — le catalogue de référence des CVE connus. Si vous faites tourner OpenSSL 1.1.1 et qu'un CVE cible cette version, Inspector le signale.
- **Images de conteneurs ECR :** Inspector scanne les images de conteneurs dans Elastic Container Registry avant qu'elles ne soient déployées. Un paquet vulnérable dans une image de base apparaît comme un finding avant que le conteneur ne tourne jamais en production.
- **Paquets de fonctions Lambda :** Inspector analyse les dépendances incluses dans vos fonctions Lambda — paquets Python, modules Node, dépendances Java — à la recherche de vulnérabilités connues.

La différence cruciale avec un scan ponctuel : Inspector fonctionne **en continu**. Il ne vérifie pas juste vos instances une fois quand vous l'activez et les déclare propres. Quand un nouveau CVE est publié, Inspector réévalue automatiquement vos ressources existantes par rapport à la nouvelle vulnérabilité. Quand une instance EC2 change — nouveau paquet installé, AMI mise à jour — Inspector la rescanne. La flotte EC2 de Priya fut signalée pour le CVE OpenSSL dans les minutes suivant l'activation d'Inspector, non pas parce qu'elle lui avait demandé de scanner, mais parce que c'est ce qu'il fait.

Les findings sont notés en sévérité : Critical, High, Medium, Low, Informational. Ils affluent vers Security Hub aux côtés des findings GuardDuty et Macie. Un tableau de bord. Les trois lentilles.

« Trois instances affectées », dit Leo, en lisant les findings Inspector. « Les six autres sont sur une version patchée. »

« Patchez ces trois cette semaine », dit Priya.

« Et pour les images de conteneurs ? »

Priya regarda les findings ECR d'Inspector. Deux images de base dans leur registre de conteneurs avaient des vulnérabilités connues — des versions plus anciennes de paquets qui avaient depuis été patchées. Elle les marqua pour reconstruction.

« La chose importante », dit Priya, « est qu'on a trouvé ça avant que ce ne soit exploité. Pas après. »

**Le modèle des trois lentilles**

GuardDuty, Inspector et Macie surveillent chacun une chose différente :

- **GuardDuty** est comportemental. Il demande : *qu'est-ce qui se passe en ce moment qui semble mauvais ?* Appels d'API depuis des emplacements inattendus, instances EC2 contactant des serveurs de commandement-et-contrôle, identifiants utilisés à des heures inhabituelles. Il attrape les menaces actives et les anomalies.
- **Inspector** est structurel. Il demande : *qu'est-ce qui est présent dans notre environnement qui pourrait être exploité ?* Paquets non patchés, dépendances vulnérables, runtimes obsolètes. Il attrape les conditions qui rendent les attaques possibles.
- **Macie** concerne les données. Il demande : *quelles informations sensibles se trouvent dans nos buckets S3 qui ne devraient pas y être ?* PII, dossiers financiers, identifiants laissés dans des fichiers. Il attrape l'exposition qui ne génère aucun comportement anormal — juste des données au mauvais endroit.

Une compromission impliquant un CVE connu pourrait apparaître dans les trois : Inspector aurait signalé la vulnérabilité avant l'attaque. GuardDuty signalerait le comportement anormal pendant l'attaque. Macie signalerait les données exfiltrées après leur atterrissage dans S3.

Trois lentilles différentes, trois horizons temporels différents, aucune d'elles ne remplaçant les autres.

**AWS Network Firewall : L'inspecteur de trafic**

Un spécialiste de plus mérite une mention avant que la boîte à outils ne se referme. Les groupes de sécurité et les NACLs (Chapitre 15) filtrent le trafic par IP, port et protocole — ils peuvent dire *qui* peut parler à *quoi*, mais ils ne peuvent pas regarder à l'intérieur de la conversation. **AWS Network Firewall** est un pare-feu géré et avec état que vous déployez au niveau du VPC. Il effectue une inspection approfondie des paquets : filtrage par nom de domaine (autoriser le sortant uniquement vers `*.eatnimbus.com` et vos dépôts de paquets), blocage du trafic qui correspond à des signatures d'intrusion (IDS/IPS, compatible avec les règles Suricata), et inspection des flux que les groupes de sécurité laisseraient simplement passer parce que le numéro de port semblait correct.

« Donc c'est un groupe de sécurité avec un cerveau », dit Leo.

« C'est l'appliance que vous achèteriez à un fournisseur de pare-feu », dit Priya, « sauf qu'elle est gérée, à mise à l'échelle automatique, et déployée dans son propre sous-réseau pour que tout le trafic entrant et sortant du VPC passe par elle. »

Signaux d'examen : « inspecter ou filtrer le trafic par nom de domaine ou charge utile », « détection/prévention d'intrusion (IDS/IPS) pour un VPC », ou « filtrage de sortie centralisé pour le trafic sortant » → Network Firewall. Les groupes de sécurité et les NACLs sont la réponse pour l'autorisation/refus au niveau de l'instance et du sous-réseau par port et IP ; Network Firewall est la réponse quand la question exige une inspection *à l'intérieur* du trafic. Et quand la question demande comment gérer les règles WAF, Shield Advanced, les groupes de sécurité *et* les politiques Network Firewall de façon cohérente à travers de nombreux comptes — c'est **AWS Firewall Manager**, la couche d'administration de politiques par-dessus.

## Forces et limites

**AWS Shield** :

- Standard : gratuit et automatique — aucune raison de ne pas l'utiliser
- Advanced : excellent pour les cibles de haut profil ; cher pour les petites équipes
- Standard absorbe les attaques de couche 3/4 (inondations SYN, inondations UDP, amplification DNS) automatiquement
- Advanced ajoute la protection de couche 7, les notifications en temps réel, et la Shield Response Team

**AWS WAF** :

- Les groupes de règles gérées simplifient considérablement la configuration — protection OWASP Top 10 en quelques clics
- Les règles personnalisées nécessitent une compréhension des schémas d'attaque HTTP
- La limitation de débit est une fonctionnalité puissante souvent négligée — efficace contre les scrapeurs et la force brute
- WAF n'est pas un substitut au code d'application sécurisé — c'est une couche de défense en profondeur
- Commencez en mode Count, validez, puis passez à Block

**GuardDuty** :

- Effort extrêmement faible pour l'activer (quelques clics, essai gratuit de 30 jours)
- Les findings nécessitent une revue et une réponse humaines — GuardDuty détecte, il ne corrige pas
- Des faux positifs se produisent — certaines activités légitimes semblent anormales aux modèles ML
- Les niveaux de sévérité (Low/Medium/High) aident à prioriser la réponse
- S'intègre avec Security Hub, EventBridge et Lambda pour les workflows de réponse automatisée

**Amazon Inspector** :

- Scan de vulnérabilités continu et automatisé — pas une vérification ponctuelle
- Rescanne automatiquement quand de nouveaux CVE sont publiés ou quand les ressources changent
- Couvre les instances EC2 (OS et paquets d'application), les images de conteneurs ECR, et les paquets de fonctions Lambda
- Les findings affluent vers Security Hub ; les notes de sévérité aident à prioriser le patch
- Ne bloque pas les attaques — il fait remonter les conditions qui rendent les attaques possibles

**Amazon Macie** :

- Découvre automatiquement les données sensibles (PII, identifiants, données financières) dans S3
- Attrape l'exposition de données qui n'a aucun schéma de comportement anormal — GuardDuty la manquerait
- Essai gratuit de 30 jours ; paiement par bucket par mois après
- Le plus précieux pour les équipes avec de nombreux buckets S3 et des niveaux de sensibilité variables

**AWS Security Hub** :

- Agrège les findings de GuardDuty, Macie, Inspector, Config et Firewall Manager
- Vérifie la configuration par rapport aux benchmarks de sécurité (CIS, NIST, PCI-DSS)
- Le plus précieux à l'échelle multi-comptes
- Activez-le tôt, même si vous n'avez qu'un seul compte — l'historique des findings est cumulatif

## Résumé

Cinq services, cinq couches. Chacun traite un type différent de menace — et aucun ne remplace les autres. Une attaque DDoS contourne WAF et GuardDuty. Une tentative d'injection SQL contourne Shield. Un identifiant compromis utilisé lentement et soigneusement pourrait contourner Shield et WAF entièrement — mais GuardDuty verra l'anomalie. Un développeur téléversant accidentellement des PII clients dans un bucket S3 de débogage contourne les trois — mais Macie l'attrape.

- **AWS Shield Standard** : Protection DDoS gratuite et automatique à la couche 3/4. Toujours activée. A absorbé l'inondation SYN de 50 Gbps avant qu'elle n'atteigne l'équilibreur de charge Nimbus.
- **AWS Shield Advanced** : Protection DDoS premium avec accès à la SRT et protection des coûts. Cas d'usage entreprise.
- **AWS WAF** : Pare-feu au niveau application. Inspecter et filtrer les requêtes HTTP. Attacher à CloudFront, ALB ou API Gateway. Utiliser les groupes de règles gérées pour la protection OWASP Top 10. Règles basées sur le débit pour la défense contre les scrapeurs.
- **Amazon GuardDuty** : Détection comportementale des menaces. Sources de données de base : événements CloudTrail, VPC Flow Logs, et journaux DNS. Les protections étendues optionnelles ajoutent les événements S3, la surveillance d'exécution EKS/ECS, les événements de connexion RDS, et l'activité réseau Lambda. Génère des findings catégorisés pour l'activité anormale. Cinq types de findings clés : UnauthorizedAccess (connexion console), CryptoCurrency (minage), Recon (sondage de port), Trojan (trafic C2), Policy (mauvaise configuration S3).
- **Amazon Inspector** : Évaluation automatisée des vulnérabilités. Scanne les instances EC2, les images de conteneurs ECR, et les paquets de fonctions Lambda à la recherche de CVE connus. Fonctionne en continu et réévalue quand de nouvelles vulnérabilités sont publiées. Les findings affluent vers Security Hub.
- **Amazon Macie** : Découverte de données sensibles dans S3. Détecte les PII, les identifiants et les données financières. Attrape l'exposition qui n'a aucun schéma de comportement anormal.
- **AWS Security Hub** : Agrège les findings de tous les services de sécurité dans un seul tableau de bord. Permet la surveillance centralisée à travers plusieurs comptes.
- **CloudTrail** : La fondation de toute la journalisation de sécurité AWS. Activez un trail écrivant vers S3 pour la rétention à long terme. Chaque service de sécurité y lit.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.2)*

- **Shield Standard vs Advanced** : Standard est gratuit et automatique. Advanced coûte de l'argent et ajoute la SRT, la protection des coûts, et une meilleure détection. Signaux d'examen pour Advanced : « DDoS à grande échelle », « garantie SLA pendant les attaques », « protection financière contre les pics de coûts liés au DDoS ».
- **Signaux de cas d'usage WAF** : « bloquer l'injection SQL », « bloquer le cross-site scripting », « limiter le débit des appels d'API », « bloquer des user-agents spécifiques », « protection OWASP Top 10 » → WAF.
- **Signaux GuardDuty** : « détecter une activité d'API inhabituelle », « identifier les identifiants compromis », « signaler les connexions réseau EC2 anormales », « renseignement sur les menaces » → GuardDuty.
- **Attachement WAF** : Peut s'attacher à CloudFront (global), ALB (régional), API Gateway (régional), AppSync.
- **Sources de données GuardDuty** : Trois sources de base — événements CloudTrail, VPC Flow Logs, journaux DNS. Les sources optionnelles étendues incluent les événements de données S3, les journaux d'audit EKS, les événements de connexion RDS, l'activité réseau Lambda, et l'exécution ECS. L'examen peut demander quelle source de données est pertinente pour un scénario de détection spécifique : « connexions RDS anormales » → GuardDuty RDS Protection ; « menaces d'exécution de conteneur » → GuardDuty EKS/ECS Runtime Monitoring.
- **Macie vs GuardDuty** : C'est un distracteur d'examen courant. **Macie** utilise le ML pour détecter les données sensibles dans S3 (PII, identifiants, données financières). **GuardDuty** détecte les menaces et les anomalies dans le comportement. Macie concerne le contenu. GuardDuty concerne le comportement.
- **Inspector vs GuardDuty vs Macie :** Trois lentilles différentes, aucune ne remplaçant les autres. **Inspector** = scan de vulnérabilités — CVE sur les instances EC2, les images de conteneurs dans ECR, et les paquets de fonctions Lambda. Fonctionne en continu et rescanne quand de nouveaux CVE sont publiés. **GuardDuty** = détection comportementale des menaces — ce qui se passe en ce moment qui semble anormal. **Macie** = découverte de données sensibles dans S3 — PII, identifiants et données financières qui ne devraient pas y être. Déclencheur d'examen : « identifier les vulnérabilités non patchées sur EC2 » ou « scanner les images de conteneurs pour les CVE » → Inspector. « Détecter les appels d'API inhabituels ou les identifiants compromis » → GuardDuty. « Trouver des PII ou des données sensibles dans S3 » → Macie.
- **Security Hub** : Agrège les findings de sécurité de plusieurs services et comptes. Scénario d'examen : « une entreprise a plusieurs comptes AWS et veut une vue unique de tous les findings de sécurité » → Security Hub.
- **Règles basées sur le débit dans WAF** : Utilisées pour limiter les requêtes par IP dans une fenêtre de temps. Différentes du Core Rule Set (qui correspond aux schémas d'attaque). L'examen utilise les règles basées sur le débit pour « empêcher les tentatives de connexion par force brute » ou « atténuer le scraping ».
- **CloudTrail + GuardDuty + Security Hub** : Ces trois ensemble forment le cœur de l'observabilité de sécurité AWS. Activez CloudTrail en premier (GuardDuty et Security Hub en dépendent), puis GuardDuty, puis Security Hub pour agréger les findings.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre AWS WAF et Amazon GuardDuty. Contre quoi chaque service protège-t-il, et à quelle couche chacun opère-t-il ?

*(Indice : Pensez à WAF comme à un filtre sur les requêtes entrantes, et à GuardDuty comme à un analyste comportemental surveillant vos journaux.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Le site web d'une entreprise de vente au détail est ciblé par un botnet qui envoie des millions de requêtes par heure à leur API de recherche de produits. Les requêtes semblent légitimes (chaînes User-Agent valides, cookies de session valides) mais n'aboutissent pas à des achats — elles scrapent les prix des produits. L'attaque fait que les clients légitimes subissent des temps de réponse lents.

Quelle combinaison de services répond LE MIEUX à cette menace ?

A) AWS WAF avec des règles de limitation de débit et CloudFront  
B) AWS Shield Advanced et CloudFront  
C) Amazon GuardDuty et AWS Shield Standard  
D) Des Network ACLs bloquant les plages d'IP du botnet

**Indice 1** : Les requêtes sont au niveau HTTP (couche application). Quel service opère à la couche HTTP ?

**Indice 2** : Les botnets utilisent de nombreuses adresses IP différentes — bloquer des plages d'IP spécifiques au niveau du NACL est inefficace contre les grands botnets.

**Indice 3** : La limitation de débit par adresse IP peut ralentir le scraping même si vous ne pouvez pas le bloquer entièrement.

**Réponse** : A

**Explication** : AWS WAF peut limiter le débit des requêtes par adresse IP, réduisant l'impact du scraping à haut volume depuis une seule source. CloudFront distribue le trafic entrant sur le réseau périphérique d'AWS, absorbant le volume et protégeant l'origine. Les règles WAF peuvent aussi correspondre aux schémas de requêtes (requêtes séquentielles rapides vers le même point de terminaison d'API) pour identifier le comportement de scraping.

**Pourquoi pas B ?** Shield Advanced protège contre les inondations DDoS (couche 3/4). Le scénario décrit du scraping au niveau application (requêtes HTTP de couche 7), que Shield n'inspecte pas.

**Pourquoi pas C ?** GuardDuty détecte les anomalies dans le comportement de votre compte AWS — il ne bloque pas les requêtes HTTP entrantes. Shield Standard ne gère pas les attaques au niveau application.

**Pourquoi pas D ?** Les grands botnets utilisent des milliers d'adresses IP de sources distribuées. Bloquer des plages spécifiques est une approche de taupe qui échoue contre les botnets sophistiqués.

*Domaine SAA-C03 : Concevoir des architectures sécurisées — Tâche 1.2*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus considère son modèle de menace alors qu'il se prépare à gérer des données de carte de crédit. Une revue de conformité PCI-DSS exige :

- Une protection contre les attaques DDoS au niveau réseau
- Un filtrage au niveau application pour les exploits web connus
- La journalisation de tous les appels d'API vers un magasin à long terme inviolable
- La détection de schémas d'accès inhabituels au service de paiement

Faites correspondre chaque exigence à un service ou une configuration AWS spécifique. Shield Standard est-il suffisant, ou le contexte PCI-DSS suggère-t-il Advanced ? Où attacheriez-vous WAF ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de s'entraîner à faire correspondre les exigences de conformité aux services AWS.)*

## Scène post-générique

GuardDuty était activé.

Quarante-huit heures plus tard, il généra son premier finding : *« L'instance EC2 i-0abc123 communique avec un nœud de sortie Tor connu. »*

Leo regarda l'ID de l'instance.

« C'est l'instance de surveillance interne », dit-il. « Celle que j'ai configurée pour exécuter des diagnostics réseau. »

« Est-elle censée communiquer avec des nœuds de sortie Tor ? »

« Non. » Il marqua une pause. « Pourquoi le ferait-elle ? »

Il ouvrit l'instance. Quelqu'un y avait installé un outil — un scanneur réseau open source légitime qui, il s'avéra, communiquait aussi avec l'infrastructure Tor pour la collecte de données anonymisées.

« Donc l'outil rentrait au bercail », dit Priya.

« Sans que je le sache », confirma Leo.

« C'est un risque de chaîne d'approvisionnement. Une dépendance qui fait des choses que vous n'avez pas autorisées. »

Leo désinstalla l'outil. Il mit en place un processus pour examiner chaque outil tiers avant l'installation.

« C'est le niveau de paranoïa où on en est maintenant ? » demanda Maya.

« Oui », dit Priya.

« C'est le niveau où on aurait toujours dû être ? » demanda Maya.

« Aussi oui », dit Priya.

Dans le prochain chapitre : ce qui se passe quand le centre de données en Oregon disparaît — et pourquoi Nimbus continue de tourner.
