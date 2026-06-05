# Chapitre 17 : Les sentinelles

L'incident avec l'IP roumaine avait été contenu. Les secrets étaient dans Secrets Manager. Les identifiants étaient renouvelés. Les contrôles réseau avaient été renforcés.

Mais Priya avait posé la question qui avait conclu le chapitre 16 : « Si quelque chose d'inhabituel apparaissait dans CloudTrail, comment saurions-nous ? »

La réponse honnête était : ils ne sauraient probablement pas.

CloudTrail enregistre des milliers d'événements par jour. Aucun humain ne les lit tous. Priya vérifiait manuellement chaque semaine, mais cela signifiait que quelque chose pouvait se passer un mardi et ne pas être remarqué avant le lundi suivant.

« Nous avons besoin de quelque chose qui surveille les journaux pour nous », dit-elle.

Maya leva les yeux. « Automatiquement ? »

« Automatiquement. »

La deuxième question de Tom de la journée : « Combien est-ce que ça coûte ? »

**Trois catégories de menaces**

Les menaces de sécurité contre une application cloud se répartissent généralement en trois catégories :

**Attaques volumétriques (DDoS)** : Un attaquant envoie tellement de trafic que votre application ne peut pas répondre aux utilisateurs légitimes. L'attaque peut être des millions de requêtes HTTP, ou un flot de paquets TCP SYN conçus pour épuiser la table de connexions de votre serveur.

**Attaques applicatives (Exploits)** : Un attaquant envoie des requêtes spécifiquement conçues pour exploiter les faiblesses de votre application — injection SQL, cross-site scripting, entrée malformée qui plante un analyseur.

**Anomalies comportementales (Reconnaissance et compromission)** : Des appels API qui ne devraient pas se produire (quelqu'un interrogeant toute votre base de données utilisateurs à 3h du matin), une activité IAM inhabituelle (des identifiants utilisés depuis un nouveau pays), ou un trafic réseau vers des destinations inattendues.

AWS a un service dédié à chacun :

- **AWS Shield** : Protection DDoS
- **AWS WAF** : Protection au niveau applicatif
- **Amazon GuardDuty** : Détection des menaces comportementales

**AWS Shield : l'absorbeur DDoS**

**AWS Shield Standard** est activé automatiquement pour tous les clients AWS sans frais supplémentaires. Il protège contre les attaques DDoS les plus courantes de couche 3 (réseau) et couche 4 (transport) — inondations SYN, inondations UDP, attaques d'amplification DNS.

CloudFront, Route 53 et Elastic Load Balancing se trouvent en périphérie du réseau d'AWS. Quand une attaque DDoS cible votre application, elle frappe d'abord ces services gérés. L'infrastructure réseau d'AWS absorbe l'attaque avant qu'elle n'atteigne vos instances EC2.

**AWS Shield Advanced** est le niveau premium (3 000 $/mois par organisation). Il ajoute :

- Protection pour EC2, ELB, CloudFront, Global Accelerator et Route 53
- Notifications d'attaques quasi-temps-réel
- Accès à l'équipe de réponse AWS Shield (SRT) — des ingénieurs en sécurité qui peuvent vous aider à répondre aux attaques
- Protection des coûts : si une attaque fait monter en flèche votre facture, AWS crédite les surcoûts
- Détection et atténuation DDoS améliorées au niveau 7 (couche applicative)

« Trois mille dollars par mois ? » dit Tom.

« Pour les entreprises générant des millions de revenus, un DDoS qui les met hors service pendant deux heures coûte plus de trois mille dollars », dit Priya.

Tom fit le calcul silencieusement.

« On commencera avec Standard », dit-il finalement.

**AWS WAF : le filtre applicatif**

**AWS WAF (Web Application Firewall)** opère au niveau HTTP — il inspecte le contenu des requêtes web avant qu'elles n'atteignent votre application.

WAF est configuré avec des **ACL Web (Access Control Lists)** — des ensembles de règles qui définissent ce qu'il faut autoriser, bloquer ou compter.

WAF peut être attaché à :

- Les distributions CloudFront (inspecter les requêtes au point de présence, à l'échelle mondiale)
- Les Application Load Balancers (inspecter les requêtes au niveau régional)
- API Gateway
- AWS AppSync

**Règles gérées WAF** : AWS et des fournisseurs tiers publient des ensembles de règles préconstruits :

- **Règles gérées AWS - Ensemble de règles de base** : Protège contre les 10 vulnérabilités les plus critiques selon OWASP (injection SQL, XSS, injection de commandes, traversée de chemin, etc.)
- **Règles gérées AWS - Entrées malveillantes connues** : Bloque les requêtes correspondant à des modèles d'attaque connus
- **Règles gérées AWS - Liste de réputation IP Amazon** : Bloque les IPs connues pour être associées à des botnets et des scanners
- **Règles gérées AWS - Contrôle des robots** : Identifie et gère le trafic de robots

Vous pouvez également créer des règles personnalisées :

- « Bloquer toute requête avec un en-tête User-Agent contenant 'sqlmap' » (un scanner d'injection SQL courant)
- « Limite de débit : ne pas autoriser plus de 1000 requêtes par IP par 5 minutes »
- « Bloquer les requêtes qui contiennent `<script>` dans n'importe quelle valeur de paramètre »

Pour Nimbus, la configuration pratique : WAF sur la distribution CloudFront avec l'ensemble de règles de base activé. Cela bloque les modèles d'attaque les plus courants avant que les requêtes n'atteignent jamais les instances EC2.

**Amazon GuardDuty : l'analyste comportemental**

GuardDuty est fondamentalement différent de Shield et WAF. Il ne bloque pas les attaques — il **détecte les comportements inhabituels**.

GuardDuty analyse continuellement :

- **Les journaux AWS CloudTrail** : Modifications IAM, appels API, connexions à la console
- **Les journaux de flux VPC** : Schémas de trafic réseau dans votre VPC
- **Les journaux de requêtes DNS** : Ce que vos instances résolvent (les logiciels malveillants connus résolvent souvent des domaines C2 spécifiques)

Des modèles d'apprentissage automatique identifient les schémas qui s'écartent de votre référence. GuardDuty génère des **résultats** — des alertes catégorisées — quand il détecte des anomalies.

Exemples de ce que GuardDuty peut détecter :

- Un utilisateur IAM se connectant depuis une adresse IP non reconnue (dans un pays qu'il n'a jamais utilisé auparavant)
- Des appels API effectués depuis un nœud de sortie Tor
- Une instance EC2 communiquant avec un pool de minage de cryptomonnaie connu
- Un volume anormalement élevé d'appels API (abus d'identifiants ou scan)
- Un compartiment S3 accédé depuis une adresse IP signalée pour une activité malveillante
- Trafic sortant vers un domaine connu pour être associé à la commande et contrôle de logiciels malveillants

« C'est ce qui aurait détecté l'IP roumaine », dit Leo doucement.

« Si nous avions eu GuardDuty activé, il aurait signalé l'instance EC2 effectuant des connexions sortantes vers une IP externe non reconnue à 2h du matin », confirma Priya.

« Combien ça coûte ? »

La tarification GuardDuty est basée sur le volume de journaux analysés — événements CloudTrail, données de flux VPC, requêtes DNS. Pour une application de petite à moyenne taille, typiquement 50 à 150 $/mois. À grande échelle, c'est encore une petite fraction des coûts d'infrastructure.

Tom ouvrit la console et l'activa.

**Connecter les trois services**

Shield, WAF et GuardDuty fonctionnent à différentes couches et se complètent mutuellement :

| Service    | Couche                     | Protège contre                              | Action                                          |
|------------|---------------------------|---------------------------------------------|-------------------------------------------------|
| AWS Shield | Réseau/Transport (L3/L4) | Inondations DDoS                            | Absorbe/atténue les attaques                    |
| AWS WAF    | Application (L7)          | OWASP Top 10, robots, scrapers              | Autorise, bloque ou compte les requêtes         |
| GuardDuty  | Comportemental (tous journaux) | Anomalies, identifiants compromis, malware | Détecte et alerte                               |

Shield arrête l'inondation. WAF filtre l'eau. GuardDuty surveille les canalisations pour détecter des schémas de flux inhabituels.

**CloudTrail : la fondation**

Les trois services s'appuient sur des journaux. **AWS CloudTrail** est le service de journalisation qui capture chaque appel API dans votre compte AWS — qui a appelé quoi, quand, depuis où, avec quel résultat.

CloudTrail est activé par défaut avec un historique de 90 jours dans la console. Pour conserver les journaux à long terme :

1. Créez un journal qui écrit dans un compartiment S3
2. Optionnellement, envoyez vers CloudWatch Logs pour les alertes en temps réel
3. Activez la validation des fichiers journaux (pour détecter si les journaux sont altérés)

GuardDuty, AWS Config et Security Hub lisent tous depuis CloudTrail. Sans journaux CloudTrail, ces services n'ont rien à analyser.

**AWS Security Hub : le tableau de bord**

Si vous exécutez plusieurs comptes AWS ou avez besoin d'une vue consolidée des résultats de sécurité, **AWS Security Hub** agrège les résultats de GuardDuty, Inspector (évaluation des vulnérabilités), Macie (confidentialité des données), Config et Firewall Manager dans un seul tableau de bord.

Il vérifie également votre configuration par rapport aux meilleures pratiques de sécurité (la norme AWS Foundational Security Best Practices) et le CIS AWS Foundations Benchmark.

Pour Nimbus : Security Hub n'était pas encore nécessaire. Quand ils grandiraient jusqu'à trois comptes (dev, staging, production), il deviendrait utile.

## Points forts et limites

**AWS Shield** :

- Standard : gratuit et automatique — aucune raison de ne pas l'utiliser
- Advanced : excellent pour les cibles très exposées ; cher pour les petites équipes

**AWS WAF** :

- Les groupes de règles gérées simplifient considérablement la configuration
- Les règles personnalisées nécessitent de comprendre les modèles d'attaque HTTP
- La limitation de débit est une fonctionnalité puissante souvent négligée
- WAF n'est pas un substitut à un code d'application sécurisé — c'est une couche de défense en profondeur

**GuardDuty** :

- Extrêmement peu d'effort pour l'activer (quelques clics)
- Les résultats nécessitent une révision et une réponse humaines — GuardDuty détecte, il ne corrige pas
- Les faux positifs se produisent — certaines activités légitimes semblent anormales pour les modèles ML
- Essai gratuit de 30 jours — vaut la peine d'être activé immédiatement

## Résumé

- **AWS Shield Standard** : Protection DDoS gratuite et automatique au niveau 3/4. Toujours actif.
- **AWS Shield Advanced** : Protection DDoS premium avec accès SRT et protection des coûts. Cas d'utilisation entreprise.
- **AWS WAF** : Pare-feu de couche applicative. Inspecte et filtre les requêtes HTTP. Attachez à CloudFront, ALB ou API Gateway. Utilisez des groupes de règles gérées pour la protection OWASP Top 10.
- **Amazon GuardDuty** : Détection des menaces comportementales. Analyse CloudTrail, les journaux de flux VPC et les journaux DNS. Génère des résultats pour les activités anormales.
- **CloudTrail** : La fondation de toute journalisation de sécurité AWS. Activez un journal écrivant dans S3 pour la conservation à long terme.
- Ces services se complètent mutuellement : Shield au niveau réseau, WAF au niveau applicatif, GuardDuty au niveau comportemental.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.2)*

- **Shield Standard vs Advanced** : Standard est gratuit et automatique. Advanced coûte de l'argent et ajoute l'équipe SRT, la protection des coûts et une meilleure détection. Signaux d'examen pour Advanced : « DDoS à grande échelle », « garantie SLA pendant les attaques », « protection financière contre les pics de coûts liés aux DDoS ».
- **Signaux de cas d'utilisation WAF** : « bloquer l'injection SQL », « bloquer le cross-site scripting », « limiter le débit des appels API », « bloquer des user-agents spécifiques », « protection OWASP Top 10 » → WAF.
- **Signaux GuardDuty** : « détecter une activité API inhabituelle », « identifier des identifiants compromis », « signaler des connexions réseau EC2 anormales », « renseignement sur les menaces » → GuardDuty.
- **Attachement WAF** : Peut s'attacher à CloudFront (mondial), ALB (régional), API Gateway (régional), AppSync.
- **Sources de données GuardDuty** : Événements de gestion CloudTrail, événements de données S3 CloudTrail, journaux de flux VPC, journaux DNS. L'examen peut demander quelle source de données est pertinente pour un scénario de détection spécifique.
- **Macie** : Souvent confondu avec GuardDuty. **Macie** utilise le ML pour détecter des données sensibles dans S3 (IIP, identifiants, données financières). **GuardDuty** détecte les menaces et les anomalies dans le comportement. Des cas d'utilisation différents.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre AWS WAF et Amazon GuardDuty. Contre quoi chaque service protège-t-il, et à quelle couche chacun opère-t-il ?

*(Indice : Pensez à WAF comme un filtre sur les requêtes entrantes, et à GuardDuty comme un analyste comportemental qui surveille vos journaux.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Le site web d'une entreprise de vente au détail est ciblé par un botnet qui envoie des millions de requêtes par heure à leur API de recherche de produits. Les requêtes semblent légitimes (chaînes User-Agent valides, cookies de session valides) mais ne débouchent pas sur des achats — elles récupèrent les prix des produits par scraping. L'attaque cause des temps de réponse lents pour les clients légitimes.

Quelle combinaison de services répond LE MIEUX à cette menace ?

A) AWS Shield Advanced et CloudFront  
B) AWS WAF avec des règles de limitation de débit et CloudFront  
C) Amazon GuardDuty et AWS Shield Standard  
D) ACL réseau bloquant les plages d'IP du botnet

**Indice 1** : Les requêtes sont au niveau HTTP (couche applicative). Quel service opère au niveau HTTP ?

**Indice 2** : Les botnets utilisent de nombreuses adresses IP différentes — bloquer des plages d'IP spécifiques au niveau NACL est inefficace contre les grands botnets.

**Indice 3** : La limitation de débit par adresse IP peut ralentir le scraping même si vous ne pouvez pas le bloquer complètement.

**Réponse** : B

**Explication** : AWS WAF peut limiter le débit des requêtes par adresse IP, réduisant l'impact du scraping à volume élevé depuis n'importe quelle source unique. CloudFront distribue le trafic entrant sur le réseau périphérique d'AWS, absorbant le volume et protégeant l'origine. Les règles WAF peuvent également correspondre à des modèles de requêtes (requêtes séquentielles rapides vers le même point de terminaison API) pour identifier le comportement de scraping.

**Pourquoi pas A ?** Shield Advanced protège contre les inondations DDoS (couche 3/4). Le scénario décrit du scraping au niveau applicatif (requêtes HTTP de couche 7), que Shield n'inspecte pas.

**Pourquoi pas C ?** GuardDuty détecte les anomalies dans le comportement de votre compte AWS — il ne bloque pas les requêtes HTTP entrantes. Shield Standard ne gère pas les attaques de couche applicative.

**Pourquoi pas D ?** Les grands botnets utilisent des milliers d'adresses IP provenant de sources distribuées. Bloquer des plages spécifiques est une approche du jeu du taupe qui échoue contre les botnets sophistiqués.

*SAA-C03 Domaine : Concevoir des architectures sécurisées — Tâche 1.2*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus envisage son modèle de menace en préparation du traitement des données de carte de crédit. Une revue de conformité PCI-DSS exige :

- Protection contre les attaques DDoS de couche réseau
- Filtrage de couche applicative pour les exploits web connus
- Journalisation de tous les appels API dans un store à long terme résistant à la falsification
- Détection des schémas d'accès inhabituels au service de paiement

Associez chaque exigence à un service ou une configuration AWS spécifique. Shield Standard est-il suffisant, ou le contexte PCI-DSS suggère-t-il Advanced ? Où attacheriez-vous WAF ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la correspondance des exigences de conformité aux services AWS.)*

## Scène post-générique

GuardDuty était activé.

Quarante-huit heures plus tard, il généra son premier résultat : *« L'instance EC2 i-0abc123 communique avec un nœud de sortie Tor connu. »*

Leo regarda l'identifiant de l'instance.

« C'est l'instance de surveillance interne », dit-il. « Celle que j'ai configurée pour exécuter des diagnostics réseau. »

« Est-elle censée communiquer avec des nœuds de sortie Tor ? »

« Non. » Il fit une pause. « Pourquoi le ferait-elle ? »

Il ouvrit l'instance. Quelqu'un avait installé un outil dessus — un scanner réseau open source légitime qui, il s'avère, communiquait également avec l'infrastructure Tor pour la collecte de données anonymisées.

« Donc l'outil appelait à la maison », dit Priya.

« À mon insu », confirma Leo.

« C'est un risque de chaîne d'approvisionnement. Une dépendance qui fait des choses que vous n'avez pas autorisées. »

Leo désinstalla l'outil. Il mit en place un processus pour examiner chaque outil tiers avant l'installation.

« C'est le niveau de paranoïa où nous en sommes maintenant ? » demanda Maya.

« Oui », dit Priya.

« C'est le niveau où nous aurions toujours dû être ? » demanda Maya.

« Également oui », dit Priya.

Dans le prochain chapitre : ce qui se passe quand le centre de données en Virginie disparaît — et pourquoi Nimbus continue de fonctionner.
