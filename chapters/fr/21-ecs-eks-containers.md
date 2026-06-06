# Chapitre 21 : Des conteneurs de transport pour le code

Avant 1956, charger une cargaison sur un navire était une négociation qualifiée et spécialisée. Chaque navire avait des cales différentes. Chaque port avait des grues différentes. Chaque transporteur avait des systèmes différents pour suivre ce qui allait où. Une caisse de marchandises passait du camion au quai, au navire, au quai, au camion à travers une chaîne de personnes qui la manipulaient toutes différemment. Des cargaisons se perdaient. Des cargaisons s'abîmaient. Les mêmes marchandises, expédiées deux fois, arrivaient dans un état différent parce que la manipulation avait été différente les deux fois.

La réponse, quand quelqu'un la posa enfin clairement, fut : standardiser le conteneur. Ne pas résoudre le problème à chaque port. Le résoudre une fois, au niveau du conteneur. Expédier la boîte, pas seulement le contenu.

Le conteneur de transport standardisé n'a pas seulement rendu l'expédition plus rapide. Il a rendu l'expédition *prévisible*. Le contenu d'un conteneur à Shanghai était exactement dans le même état à son arrivée à Rotterdam — parce que le conteneur le protégeait de la variabilité à chaque point de transfert.

C'est exactement le même problème que Leo avait. L'API Nimbus était « chargée » différemment à chaque « port » : staging déployé différemment de la production, l'instance un déployée différemment de l'instance trois, et six semaines de changements non documentés avaient rendu la flotte imprévisible.

Le conteneur ne ferait pas de Leo un développeur plus rapide. Il rendrait les déploiements prévisibles.

---

La migration vers Lambda avait réduit la facture EC2 pour les services plus petits. Mais l'API principale était différente — elle tournait en continu, portait tout le trafic des commandes, et accumulait l'historique de configuration depuis huit mois. Lambda avait résolu l'inactivité. Les conteneurs résoudraient l'incohérence.

L'API principale n'était pas inactive ; elle ne pouvait pas passer sur Lambda. Mais elle avait un problème différent : les instances EC2 qui l'exécutaient avaient divergé les unes des autres.

---

Leo avait appris à ne pas dire « ça marche sur ma machine » à voix haute. Ce n'était pas une défense — c'était un diagnostic. Et le diagnostic cette fois concernait l'instance EC2 de production numéro trois, qui avait reçu un patch de bibliothèque six semaines auparavant que personne n'avait documenté, que les deux autres instances n'avaient pas reçu, et qui causait maintenant un bug qui n'existait que là, dans cette seule instance, invisible partout ailleurs.

Il avait passé trois heures la nuit précédente à le traquer.

« Chaque fois qu'on déploie », dit-il le lendemain matin, « on coordonne sur plusieurs instances. Nouvelle version, dépendances différentes. Ça marche en staging, ça casse en production parce que les environnements ont divergé. »

« Parce que quelqu'un a mis à jour un package sur l'instance trois sans mettre à jour les autres », dit Priya. Sans méchanceté.

« J'avais besoin d'une version spécifique de — »

« Je sais », dit-elle. « Et maintenant l'instance trois a un historique différent de l'instance un et deux. C'est la dérive de configuration. Elle est silencieuse jusqu'à ce qu'elle ne le soit plus. »

« Quelle est la vraie solution ? » demanda Maya.

« Arrêter de traiter les serveurs comme des choses permanentes que vous configurez », dit Priya. « Commencer à les traiter comme des unités jetables que vous remplacez. »

**Qu'est-ce qu'un conteneur ?**

« Pensez-y comme à un conteneur de transport », dit Leo en attrapant un marqueur. « Le conteneur se moque du navire sur lequel il se trouve. Le navire se moque de ce qu'il y a dans le conteneur. Ils se sont mis d'accord sur les dimensions et le mécanisme de verrouillage. Tout le reste est à l'intérieur de la boîte. »

Un **conteneur** est une unité légère et portable qui regroupe votre application avec tout ce dont elle a besoin pour fonctionner : le runtime (Python 3.11, Node.js 20, Java 17), les bibliothèques et dépendances, les fichiers de configuration, et le code de l'application lui-même.

Contrairement à une machine virtuelle (qui émule un ordinateur entier, y compris le noyau du système d'exploitation), un conteneur partage le noyau OS de l'hôte tout en gardant tout le reste isolé. Cela rend les conteneurs rapides à démarrer (secondes, parfois millisecondes) et légers (mégaoctets, pas gigaoctets).

La technologie de conteneurs la plus populaire est **Docker**. Une image Docker est le modèle — un instantané de l'application et de son environnement. Un conteneur Docker est une instance en cours d'exécution de cette image.

La propriété clé : **l'immuabilité**. Une image construite aujourd'hui s'exécutera de manière identique sur n'importe quel hôte qui prend en charge Docker — un ordinateur portable, une instance EC2, un serveur dans un autre centre de données. L'environnement est intégré. La dérive de configuration est impossible.

« Donc au lieu de s'inquiéter de ce qui est installé sur l'instance EC2 », dit Leo, « on construit une image qui a tout. L'image s'exécute de la même façon partout. »

« Et si tu dois la tester localement, tu exécutes la même image », ajouta Priya. « Plus de "ça marche sur ma machine". »

**Construire l'image Docker et la pousser vers ECR**

Avant qu'un orchestrateur puisse gérer le conteneur, Leo devait le construire et le stocker quelque part où ECS pourrait l'extraire.

Il écrivit le Dockerfile :

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

La ligne clé : `FROM python:3.11-slim`. Pas Python 3.9. Pas Python 3.10. 3.11 — la version spécifique sur laquelle l'équipe s'était mise d'accord, intégrée dans l'image. Chaque instance exécutant cette image utiliserait exactement Python 3.11. Le comportement d'arrondi du module decimal serait identique partout.

Il construisit l'image localement : `docker build -t nimbus-api:1.0.0 .`

La construction prit 4 minutes. Docker extrayit l'image de base, installa les dépendances, copia le code de l'application, et produisit une image étiquetée `nimbus-api:1.0.0`.

Il l'exécuta localement : `docker run -p 8000:8000 nimbus-api:1.0.0`

L'API démarra. Même port, même comportement que le serveur de production — parce que l'environnement était identique.

Puis il la poussa vers ECR :

```bash
# Authentifier Docker auprès d'ECR
aws ecr get-login-password --region us-west-2 |   docker login --username AWS --password-stdin   123456789012.dkr.ecr.us-west-2.amazonaws.com

# Étiqueter l'image pour ECR
docker tag nimbus-api:1.0.0   123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0

# Pousser
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.0
```

Le push prit 2 minutes. ECR stocka l'image, déclencha immédiatement une analyse d'image, et rapporta les résultats en moins de 5 minutes.

**Amazon ECS : l'orchestrateur**

Exécuter un conteneur est simple. Exécuter des dizaines de conteneurs sur plusieurs hôtes, router le trafic entre eux, redémarrer les conteneurs défaillants, déployer de nouvelles versions sans interruption — cela nécessite un **orchestrateur**.

**Amazon ECS (Elastic Container Service)** est le service d'orchestration de conteneurs géré par AWS. Vous définissez :

- **Définition de tâche** : Quelle image de conteneur exécuter, combien de CPU et de mémoire, quelles variables d'environnement, quels ports exposer
- **Service** : Combien de copies de la tâche exécuter, comment gérer les défaillances et les déploiements
- **Cluster** : L'infrastructure de calcul sous-jacente

ECS gère le reste : placer les tâches sur la capacité disponible, redémarrer les tâches défaillantes, drainer les connexions lors des déploiements, enregistrer les tâches saines auprès de l'équilibreur de charge.

Pour Nimbus, l'API a été déplacée des instances EC2 avec des déploiements gérés manuellement vers ECS. Chaque nouveau déploiement poussait une nouvelle image Docker vers **Amazon ECR (Elastic Container Registry)** — le registre de conteneurs géré par AWS — et ECS la déployait sur toutes les tâches sans interruption.

**Fargate vs type de lancement EC2**

ECS peut exécuter des conteneurs de deux façons :

**Type de lancement EC2** : Vous gérez les instances EC2 sous-jacentes. Vous êtes responsable du patching des instances, de leur dimensionnement correct, et de vous assurer qu'il y a suffisamment de capacité pour vos conteneurs. Plus de contrôle, plus de responsabilité.

**Fargate (calcul serverless pour conteneurs)** : AWS gère entièrement l'infrastructure sous-jacente. Vous spécifiez le CPU et la mémoire par tâche ; Fargate provisionne automatiquement la bonne capacité. Pas d'instances EC2 à gérer. Vous payez par vCPU-seconde et par Go-seconde de mémoire.

Fargate est le modèle de « conteneurs serverless » — vous obtenez l'isolation d'environnement des conteneurs sans gérer de serveurs. Le compromis : moins de contrôle sur la configuration de l'instance sous-jacente et un coût unitaire légèrement plus élevé.

« Combien cela coûte-t-il par mois ? » demanda Tom en ouvrant la calculatrice de tarification. « Fargate contre le type de lancement EC2 — je veux voir les chiffres réels. »

L'estimation instinctive de Leo — celle que tout le monde trimbale — était que Fargate coûterait plus cher. Commodité serverless, prix premium. Il devinait peut-être vingt ou trente pour cent de plus qu'EC2.

« Fais les vrais calculs », dit Tom, parce que c'était Tom.

Le service API de Nimbus exécutait 3 tâches, chacune nécessitant 0,5 vCPU et 1 Go de mémoire, 24h/24 et 7j/7 :

**Fargate** : 0,04048 $/vCPU-heure × 0,5 × 3 × 720 heures = 43,72 $/mois pour le CPU. 0,004445 $/Go-heure × 1 × 3 × 720 = 9,60 $/mois pour la mémoire. Total : 53,32 $/mois.

**Type de lancement EC2** (3 × t3.medium à 0,0416 $/heure) : 0,0416 $ × 3 × 720 = 89,86 $/mois.

« Attends », dit Tom. « Fargate est moins cher ? »

« À cette taille, oui », dit Leo. « Fargate facture exactement ce que vous allouez. Les instances EC2 ont une surcharge — l'OS et l'agent ECS consomment un peu de CPU et de mémoire avant même que vos conteneurs démarrent. Une t3.medium donne 2 vCPU et 4 Go, mais vous utilisez 0,5 vCPU et 1 Go par conteneur. Le reste est gaspillé. »

« Mais le type de lancement EC2 vous permet d'empaqueter plusieurs tâches sur une seule instance. »

« Oui. À plus grande échelle, avec un bin-packing soigneux, le type de lancement EC2 devient moins cher. À notre échelle — trois tâches — Fargate gagne. »

Tom le nota.

Pour Nimbus : Fargate pour le service API. Ils ne voulaient pas gérer d'instances EC2 pour les conteneurs.

Si vous conteneurisez avec Fargate, vous éliminez toute la surcharge de gestion EC2 — mais vous renoncez à la capacité de personnaliser les types d'instances, ce qui importe pour les charges de travail GPU ou la mise en réseau spécialisée. Si vous choisissez ECS pour la simplicité native AWS, vous gagnez une intégration étroite avec IAM et ALB — mais vous êtes exclu de l'écosystème Kubernetes, ce qui nécessite une réarchitecture si vous avez plus tard besoin de portabilité multi-cloud.

**Amazon EKS : quand vous avez besoin de Kubernetes**

**Kubernetes** est un système d'orchestration de conteneurs open source — essentiellement le standard industriel pour gérer les conteneurs à grande échelle. Il est puissant, extensible et complexe.

**Amazon EKS (Elastic Kubernetes Service)** est le service Kubernetes géré par AWS. Il exécute le plan de contrôle Kubernetes (la couche de gestion) pour vous, tandis que vous gérez les nœuds de travail (ou utilisez Fargate pour ceux-ci aussi).

Vous vous demandez peut-être : si Kubernetes est le standard industriel et que chaque offre d'emploi le mentionne, pourquoi ne l'utiliserions-nous pas simplement ? Parce que « standard industriel » décrit ce qu'utilisent les grandes entreprises avec des équipes de plateforme dédiées. Pour une équipe de six personnes construisant une application de commande de nourriture, Kubernetes ajoute de la complexité opérationnelle sans bénéfice pratique pour l'instant. La complexité est réelle ; le bénéfice est théorique à cette échelle.

Kubernetes apporte de la valeur à un niveau de complexité dont la plupart des équipes n'ont pas besoin : définitions de ressources personnalisées pour construire des plateformes internes, contraintes de planification avancées, budgets de perturbation de pods pour un contrôle fin des déploiements, et intégration de maillage de services pour la gestion du trafic entre des centaines de microservices. Ce sont de véritables capacités. Ce sont aussi des capacités qu'une startup de la taille de Nimbus n'exercera jamais.

Le principe d'ingénierie ici est parfois appelé YAGNI : You Aren't Gonna Need It (vous n'en aurez pas besoin). ECS donne à Nimbus tout ce dont ils ont actuellement besoin. EKS leur donne plus que ce dont ils ont besoin, plus une courbe d'apprentissage significative et une surcharge opérationnelle. « Ce sera utile plus tard » n'est pas une bonne raison d'ajouter de la complexité maintenant.

Quand devriez-vous utiliser EKS vs ECS ?

**Utilisez ECS** si :

- Vous êtes principalement sur AWS et souhaitez l'expérience plus simple et plus native AWS
- Votre équipe n'a pas d'expertise Kubernetes existante
- Vous voulez moins de surcharge opérationnelle

**Utilisez EKS** si :

- Vous avez besoin de fonctionnalités spécifiques à Kubernetes (Custom Resource Definitions, charts Helm, l'écosystème Kubernetes)
- Votre équipe connaît déjà Kubernetes
- Vous exécutez un environnement hybride (certaines charges sur site, d'autres dans AWS) et souhaitez une couche d'orchestration cohérente
- Votre charge de travail a des exigences qui correspondent à l'extensibilité de Kubernetes

**Mise en réseau des conteneurs : IP éphémères et découverte de services**

Une chose qui prend les équipes au dépourvu lors du passage aux conteneurs : l'adresse IP d'un conteneur change à chaque redémarrage.

Dans le monde EC2, les instances avaient des IP privées relativement stables. Vous pouviez (même si vous ne devriez pas) les coder en dur dans les fichiers de configuration. Les services se connaissaient par IP.

Dans le monde des conteneurs, chaque tâche dans ECS obtient une IP du sous-réseau VPC quand elle démarre. Quand elle s'arrête et qu'une nouvelle tâche démarre (dans le cadre d'un déploiement ou d'un redémarrage), cette nouvelle tâche obtient une IP différente.

« Que se passe-t-il quand un service est codé en dur pour appeler `10.0.1.45` et que ce conteneur est remplacé par `10.0.1.82` ? » demanda Priya. « Le service appelant commence à ne rien atteindre. »

C'est pourquoi la découverte de services importe dans les environnements de conteneurs. ECS + Application Load Balancer gère cela automatiquement : le nom DNS de l'ALB est stable ; ECS enregistre les tâches saines auprès du groupe cible ; l'ALB route vers les tâches actuellement saines. Le service appelant parle au nom DNS de l'ALB, pas aux IP individuelles des conteneurs.

Pour la communication interne service à service (non destinée à l'utilisateur), **AWS Cloud Map** fournit la découverte de services : chaque service ECS s'enregistre auprès de Cloud Map, qui fournit un nom DNS stable. Le service de commandes appelle `http://notification.nimbus.local:8080`, et Cloud Map résout cela vers les tâches du service de notification actuellement saines.

« Donc les conteneurs se parlent à travers des noms DNS, pas des IP ? » confirma Leo.

« Correct. L'IP est éphémère. Le nom DNS est le contrat. »

**Injection de secrets : pas de secrets dans les variables d'environnement**

Le déploiement EC2 original avait un problème que Priya signalait depuis des mois : les secrets (mot de passe de base de données, clés d'API, identifiants SES) étaient stockés dans des variables d'environnement sur l'instance EC2, définies via un script de déploiement.

Les variables d'environnement sont accessibles à tout processus s'exécutant sur l'instance. Elles apparaissent dans les outils de débogage, dans certains rapports de plantage, et dans les listes de processus. Elles sont aussi visibles dans CloudWatch si vous les journalisez (ce que certains outils de développement font par défaut).

Les conteneurs ne résolvent pas cela automatiquement — vous pourriez encore passer des secrets comme variables d'environnement dans la définition de tâche ECS. Et les définitions de tâches ECS sont stockées dans la console AWS, visibles par quiconque a accès à ECS.

Le bon modèle : **intégration AWS Secrets Manager + définition de tâche ECS**.

Au lieu de stocker le mot de passe de base de données dans la définition de tâche :

```json
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:nimbus/prod/db-password"
  }
]
```

ECS récupère le secret depuis Secrets Manager au moment du lancement de la tâche et l'injecte dans le conteneur comme variable d'environnement. La valeur du secret n'est jamais stockée dans la définition de tâche — seulement l'ARN du secret Secrets Manager. Le conteneur reçoit la valeur au moment de l'exécution. Secrets Manager peut faire tourner la valeur sans changer la définition de tâche.

« Et si quelqu'un lit la définition de tâche ? » demanda Priya. « Il verrait l'ARN Secrets Manager, mais pas la valeur. »

« Et sans les bonnes permissions IAM », confirma Leo, « il ne peut pas non plus récupérer la valeur depuis Secrets Manager. »

« C'est la conception », dit Priya. « Le rôle d'exécution de la tâche a la permission de lire ce secret spécifique. Rien d'autre. Compromettre la définition de tâche vous donne un ARN, pas un mot de passe. »

« Lequel devrions-nous utiliser ? » demanda Maya. « Et pourquoi pas Kubernetes ? Il est dans chaque description de poste. Chaque conférence. »

« ECS », dit Priya immédiatement. « On n'a pas d'expertise Kubernetes. ECS fait tout ce dont on a besoin. Ajouter Kubernetes maintenant serait ajouter de la complexité opérationnelle sans bénéfice pratique. »

Soo-Jin, qui avait géré des clusters Kubernetes dans son entreprise précédente, hocha la tête. « J'ai porté ce bipeur. Tu ne le veux pas tant que tu n'en as pas besoin. »

« On peut toujours migrer vers EKS plus tard si on dépasse ECS », ajouta Leo.

C'est une réponse senior correcte : choisir l'outil le plus simple qui correspond à vos besoins actuels.

**ECR : sécuriser vos images**

« Et si quelqu'un essaie de s'introduire par une image de base vulnérable ? » demanda Priya. « Quelqu'un récupère une vieille image avec une CVE connue et l'utilise pour prendre pied dans le conteneur de l'application ? »

C'était la bonne question à poser avant de déployer un conteneur en production.

**Amazon ECR (Elastic Container Registry)** stocke vos images Docker et peut les analyser pour les vulnérabilités connues avant le déploiement. L'analyse d'images ECR vérifie l'image par rapport à une base de données de CVE connues (Common Vulnerabilities and Exposures) et signale les problèmes par sévérité.

La politique que Priya écrivit : aucune image avec une CVE de sévérité CRITICAL ne serait déployée en production. Le pipeline CI/CD vérifierait les résultats de l'analyse avant de mettre à jour le service ECS. Si une vulnérabilité critique était trouvée, le pipeline échouerait et alerterait l'équipe.

« Ce n'est pas de la paranoïa », dit Priya. « C'est juste avoir une vérification avant de déployer. »

**Comment les conteneurs changent les déploiements**

Avant les conteneurs, déployer une nouvelle version de l'API Nimbus impliquait :

1. SSH dans chaque instance EC2
2. Tirer le dernier code de Git
3. Installer/mettre à jour les dépendances
4. Redémarrer le processus de l'application
5. Vérifier la santé
6. Passer à l'instance suivante

C'était sujet aux erreurs et lent. Cela nécessitait de la coordination. Si l'étape 3 échouait sur l'instance 4, vous aviez un déploiement mixte avec certaines instances exécutant l'ancienne version et d'autres échouant à exécuter la nouvelle.

Avec ECS et les conteneurs :

1. Construire une nouvelle image Docker (automatisé dans le pipeline CI/CD)
2. Pousser vers ECR
3. Mettre à jour le service ECS pour utiliser la nouvelle version de l'image

ECS gère le déploiement progressif : démarre de nouvelles tâches avec la nouvelle image, attend qu'elles soient saines, puis arrête les anciennes tâches. Déploiement sans interruption, automatisé.

Si la nouvelle version échoue aux vérifications de santé, ECS arrête le déploiement et l'ancienne version continue à servir le trafic.

**La configuration minimale de déploiement : les vérifications de santé**

Toute la sécurité des déploiements de conteneurs dépend du fait que les vérifications de santé fonctionnent réellement.

ECS utilise deux types de vérifications de santé :

**Vérification de santé au niveau du conteneur** : Définie dans le Dockerfile ou la définition de tâche. S'exécute à l'intérieur du conteneur pour vérifier que l'application répond.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost:8000/health || exit 1
```

**Vérification de santé du groupe cible ALB** : L'équilibreur de charge envoie périodiquement des requêtes HTTP à un point de terminaison de santé. Les tâches qui échouent à la vérification de santé sont retirées du groupe cible.

Si aucune vérification de santé n'est configurée correctement, ECS considère chaque tâche comme saine — et déploiera une image cassée sans s'arrêter. C'est l'erreur de déploiement de conteneurs la plus courante.

« Le point de terminaison de vérification de santé pourrait-il divulguer des informations internes ? » demanda Priya.

Le point de terminaison de vérification de santé à `/health` ne renvoyait que : `{"status": "ok"}`. Pas de numéros de version, pas d'états de dépendances, pas de configuration interne. Toute information dans la réponse de santé pourrait être utile à quelqu'un cartographiant l'application. Gardez les points de terminaison de santé minimaux.

Pour l'état de santé interne détaillé (connectivité de la base de données, vérifications des dépendances), utilisez un point de terminaison `/health/detail` authentifié séparé — accessible uniquement depuis l'intérieur du VPC.

**Journalisation structurée : la seule fenêtre sur un conteneur en cours d'exécution**

Sur EC2, quelque chose tournait mal et vous vous connectiez en SSH. Vous suiviez le fichier journal. Vous regardiez la table des processus. Vous vérifiiez l'utilisation du disque. Vous fouilliez.

Dans un conteneur, il n'y a pas de SSH. Le conteneur est éphémère — il peut s'exécuter sur n'importe quel hôte du cluster, et ECS le remplacera sans avertissement s'il échoue aux vérifications de santé. Au moment où vous pensez à vous connecter en SSH, le conteneur que vous vouliez examiner pourrait ne plus exister.

Les journaux ne sont pas une commodité de débogage dans les environnements conteneurisés. Ils sont la seule preuve que quelque chose s'est produit.

« Et si un conteneur échoue silencieusement et qu'on n'a pas de journaux ? » demanda Priya lors de la revue d'architecture des conteneurs. « On pourrait avoir une tâche qui se termine avec le code 1 et ne jamais connaître la cause si les journaux n'ont pas été capturés avant qu'elle se termine. »

Ce n'est pas hypothétique. Cela arrive lors des premiers déploiements de conteneurs, systématiquement.

Le bon modèle : configurer chaque conteneur pour envoyer des journaux structurés vers **Amazon CloudWatch Logs** en utilisant le pilote de journaux `awslogs`. ECS gère l'expédition automatiquement — pas d'agent de journaux à installer, pas de conteneur sidecar nécessaire.

Dans la définition de tâche :

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nimbus-api",
    "awslogs-region": "us-west-2",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Chaque ligne écrite vers stdout ou stderr à l'intérieur du conteneur est capturée et envoyée au groupe de journaux `/ecs/nimbus-api`, organisée par ID de tâche. ECS crée un nouveau flux de journaux pour chaque tâche, donc vous pouvez trouver les journaux du conteneur spécifique qui a échoué — même après son remplacement.

Le rôle d'exécution de la tâche a besoin de la permission d'écrire dans CloudWatch Logs. Sans elle, le pilote de journaux échoue silencieusement et toute la sortie de journaux est perdue.

**Journaux structurés vs texte brut** : Les journaux en texte brut (« Commande 7741 passée ») nécessitent grep. Les journaux JSON structurés (`{"event": "order_placed", "order_id": "7741", "restaurant_id": "47", "amount": 3200}`) peuvent être interrogés avec CloudWatch Logs Insights en utilisant une syntaxe qui ressemble à SQL :

```
fields @timestamp, event, order_id, restaurant_id
| filter event = "order_placed"
| stats count(*) by restaurant_id
| sort count desc
| limit 10
```

Cette requête s'exécute directement contre le groupe de journaux. Pas de base de données. Pas de pipeline de données. Pas de travail ETL. La réponse est là en quelques secondes.

Cela ne remplace pas le data lake analytique que nous construirons au chapitre 26. Cela répond à des questions opérationnelles — « combien de commandes du restaurant 47 dans les 30 dernières minutes ? » — au milieu d'un incident, quand vous n'avez pas le temps d'exécuter une requête Athena.

**CloudWatch Container Insights**

**Container Insights** est une fonctionnalité de CloudWatch qui collecte et agrège des métriques au niveau du conteneur — CPU, mémoire, E/S réseau, E/S de stockage — par cluster, service et tâche ECS. Au lieu des métriques au niveau EC2 (comment va l'hôte ?), vous voyez les métriques au niveau de la tâche (comment va ce service ECS spécifique ?).

Activez-la avec un seul paramètre sur le cluster ECS :

```bash
aws ecs update-cluster-settings \
  --cluster nimbus-production \
  --settings name=containerInsights,value=enabled
```

Après l'activation :

- Vous voyez un tableau de bord par service : nombre de tâches, utilisation du CPU, utilisation de la mémoire
- Vous pouvez alarmer sur le CPU au niveau de la tâche (plutôt que le CPU de l'hôte EC2, qui est un signal beaucoup plus grossier)
- Vous pouvez corréler les pics de mémoire avec les événements de journaux — la mémoire de la tâche a grimpé à 95 % à 14h22 ; les journaux montrent un pic de requêtes entrantes provenant de l'import de menu du restaurant 47 exactement à 14h21

« Combien cela coûte-t-il par mois ? » demanda Tom.

Container Insights facture les métriques personnalisées et le stockage de journaux qu'il génère. À l'échelle de Nimbus (trois services, 3 à 6 tâches chacun), c'était environ 12 $/mois — un compromis raisonnable pour une visibilité opérationnelle au niveau de la tâche.

Leo l'avait activé dans la journée.

La première fois qu'une tâche échoua à une vérification de santé et fut remplacée par ECS, le tableau de bord Container Insights captura l'événement automatiquement : ID de tâche, heure de démarrage, heure d'échec, code de sortie. Le flux de journaux CloudWatch de cette tâche préserva les 40 dernières lignes de sortie avant la terminaison — qui montraient une exception non interceptée déclenchée par un JSON de menu malformé d'un nouveau partenaire restaurant.

Sans Container Insights ni journalisation structurée : un pic mystérieux des taux d'erreur, une enquête nécessitant de se connecter en SSH à un hôte qui n'exécute plus la tâche défaillante, 45 minutes de conjectures.

Avec eux : un lien vers un flux de journaux dans le tableau de bord CloudWatch, l'exception exacte, l'ID du restaurant, le champ fautif — en moins de cinq minutes.

« Pas de SSH », dit Leo en relisant le post-mortem. « Pas d'interruption pour enquêter. Les journaux ont fait le travail. »

« Les journaux ne font le travail », dit Priya, « que si vous les avez configurés pour être capturés. »


**Quand les conteneurs sont le mauvais choix**

« Attends — mais *pourquoi* ne conteneuriserions-nous pas tout ? » demanda Maya. « Tu viens de me convaincre que les conteneurs résolvent tous les problèmes de dérive de configuration. Pourquoi ne pas exécuter chaque service comme un conteneur ? »

C'était la même question qu'elle avait posée à propos de Lambda. La réponse était similaire.

Les conteneurs ajoutent des exigences opérationnelles : vous avez besoin d'un registre de conteneurs (ECR), d'un pipeline CI/CD qui construit et pousse les images, d'un orchestrateur (ECS), d'une surveillance configurée pour une visibilité au niveau de la tâche plutôt qu'au niveau de l'instance, et d'une équipe qui comprend Docker et le versionnage d'images.

Pour un service qui fonctionne déjà bien sur EC2, stable, et ne souffrant pas de dérive de configuration, le coût de sa conteneurisation peut dépasser le bénéfice.

Cas spécifiques où les conteneurs sont le mauvais choix :

**Services avec état non conçus pour la mobilité des conteneurs** : Les bases de données dans des conteneurs nécessitent une gestion soigneuse des volumes persistants. La plupart des équipes exécutant des bases de données dans des conteneurs finissent par les ramener vers des services gérés (RDS, ElastiCache) après avoir rencontré cette complexité.

**Services avec des exigences matérielles spécialisées** : Les charges de travail GPU, les configurations d'interface réseau spécifiques, ou le traitement basé sur FPGA nécessitent des instances EC2 avec du matériel spécifique. Les conteneurs ne changent pas cela — vous utiliseriez quand même le type de lancement EC2, juste avec des conteneurs par-dessus, et l'abstraction des conteneurs ajoute de la complexité sans bénéfice.

**Scripts et travaux très simples** : Un script Python de 40 lignes qui s'exécute une fois par semaine et n'a pas de problèmes de dérive de dépendances. Ajouter Docker, ECR, des définitions de tâches ECS, et un pipeline CI/CD pour cela est disproportionné. Lambda est plus simple. Un simple cron job EC2 pourrait être encore plus simple.

« Le principe », dit Leo, « est le même que toujours : adapter l'outil au problème. Les conteneurs résolvent la dérive de configuration et la cohérence des déploiements. Si vous n'avez pas ce problème, vous n'avez pas besoin de conteneurs. »

## AWS Batch : des conteneurs pour les travaux à grande échelle

ECS et EKS sont conçus pour les services de longue durée — des applications qui s'exécutent en continu, acceptent des requêtes, et s'adaptent au trafic. Mais certaines charges de travail sont différentes : elles s'exécutent pendant une durée fixe, traitent un jeu de données défini, puis s'arrêtent. Générer les factures de fin de mois pour des centaines de restaurants. Exécuter un travail d'entraînement de machine learning. Traiter un export analytique nocturne.

Pour ces charges de travail, vous ne voulez pas un service — vous voulez un travail.

**AWS Batch** est un service entièrement géré qui exécute des travaux de calcul par lots à n'importe quelle échelle. Vous définissez votre travail comme un conteneur Docker (le même format de conteneur qu'ECS utilise), et Batch gère le reste : provisionnement du calcul EC2 ou Fargate, planification des travaux dans des files, montée en charge de la capacité quand les travaux arrivent et retour à zéro quand ils sont terminés.

Concepts clés :

- **Définition de travail :** le conteneur Docker, les exigences de ressources (vCPU, mémoire), et la commande à exécuter
- **File de travaux :** où les travaux soumis attendent avant de s'exécuter ; chaque file est associée à un ou plusieurs environnements de calcul
- **Environnement de calcul :** la capacité EC2 ou Fargate sous-jacente. Peut utiliser des instances Spot pour jusqu'à 90 % d'économies de coût — Batch gère les interruptions et les réessais automatiquement

« Attends — mais *pourquoi* utiliserions-nous Batch au lieu de simplement exécuter une tâche ECS ? » demanda Maya.

« Parce qu'un service ECS est toujours allumé », dit Leo. « Il attend des requêtes. Un travail Batch s'exécute, se termine, et Batch ramène le calcul à zéro. Vous ne payez rien entre les exécutions. »

Tom leva les yeux de la page de tarification. « Et les instances Spot ? »

« Batch peut s'exécuter sur Spot. Si une instance Spot est récupérée en cours de travail, Batch réessaie automatiquement. Pour un travail de facturation de 45 minutes, c'est bien. »

**vs ECS/EKS :** ECS/EKS exécutent des services — toujours allumés, pilotés par les requêtes. Batch exécute des travaux — durée finie, pilotée par les données, mise à l'échelle vers zéro à l'inactivité.

**vs Lambda :** Lambda a un délai d'attente de 15 minutes. Les travaux Batch peuvent s'exécuter pendant des heures ou des jours.

Contexte Nimbus : le travail de génération de factures nocturne prend 45 minutes pour des centaines de partenaires restaurants. Lambda expire à 15 minutes. Un service ECS toujours allumé gaspille de l'argent 23 heures par jour. Batch exécute le travail sur des instances Spot, se termine en 38 minutes, coûte 1,20 $, et s'éteint.

« C'est moins cher que le café que j'ai acheté en attendant que l'ancien script se termine », dit Leo.

« Et pas d'EC2 à gérer », ajouta Priya. « Batch le provisionne, l'exécute, le termine. »

## Points forts et limites

**Conteneurs** :

- Éliminent l'incohérence d'environnement (« ça marche sur ma machine »)
- Permettent des déploiements rapides et fiables
- Immuables — la même image s'exécute de manière identique partout
- Efficaces — plus légers que les VM, démarrage plus rapide

**ECS** :

- Plus simple que Kubernetes pour les charges de travail centrées sur AWS
- Intégration étroite avec AWS (IAM, ALB, CloudWatch, Secrets Manager)
- L'option Fargate supprime entièrement la gestion EC2

**EKS** :

- Compatibilité complète Kubernetes — utilisez tout l'écosystème
- Meilleur pour les environnements hybrides ou les équipes avec expertise Kubernetes
- Plus complexe à configurer et à opérer qu'ECS

**Là où ça se complique** :

- Les images de conteneurs doivent être construites et versionnées — nécessite un pipeline CI/CD
- Le débogage des conteneurs nécessite des outils différents de ceux utilisés pour déboguer les processus traditionnels
- Les conteneurs avec état (bases de données dans des conteneurs) nécessitent une configuration soigneuse du stockage persistant
- La mise en réseau entre conteneurs (communication service à service) nécessite de comprendre les concepts de réseau des conteneurs

## Résumé

Lambda a rendu le calcul inactif gratuit. Les conteneurs ont rendu le déploiement déterministe. Ensemble, ils ont résolu deux des causes les plus courantes de douleur opérationnelle pour les équipes d'ingénierie en croissance.

- Les **conteneurs** regroupent le code de l'application, le runtime et les dépendances — s'exécutent de manière identique partout.
- **Docker** est la technologie de conteneurs standard. Les images sont des modèles ; les conteneurs sont des instances en cours d'exécution.
- **ECR (Elastic Container Registry)** est le registre Docker géré par AWS — stockez, versionnez et analysez vos images ici. Activez l'analyse d'images pour attraper les CVE avant le déploiement.
- **ECS (Elastic Container Service)** orchestre les conteneurs. Vous définissez des tâches et des services ; ECS gère le placement et le cycle de vie.
- **Fargate** est le calcul serverless pour les conteneurs — pas d'instances EC2 à gérer. Souvent moins cher que le type de lancement EC2 aux petites échelles grâce à l'élimination de la surcharge EC2. Aux plus grandes échelles avec un bin-packing soigneux des tâches, le type de lancement EC2 peut devenir plus rentable.
- **EKS (Elastic Kubernetes Service)** est Kubernetes géré — pour les équipes qui ont besoin de fonctionnalités ou de compatibilité Kubernetes.
- **Intégration Secrets Manager** : injectez les secrets dans les conteneurs au moment du lancement via la définition de tâche — ne stockez pas les valeurs des secrets dans les variables d'environnement ou directement dans les définitions de tâches.
- **Découverte de services** : les IP des conteneurs sont éphémères. Utilisez les noms DNS d'ALB ou Cloud Map pour un adressage de services stable.
- Choisissez ECS pour la simplicité sur AWS ; choisissez EKS pour la compatibilité avec l'écosystème Kubernetes.

## Conseils pour l'examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Signaux ECS vs EKS** : Les scénarios d'examen qui mentionnent « Kubernetes », « Helm », « expertise Kubernetes existante » ou « orchestration de conteneurs multi-cloud » → EKS. Tout le reste → ECS.
- **Fargate vs type de lancement EC2** : « Ne veut pas gérer des instances EC2 pour les conteneurs », « conteneurs serverless », « pas de gestion d'infrastructure » → Fargate. « Nécessite des types d'instances spécifiques », « charges de travail GPU », « contrôle précis des instances » → type de lancement EC2.
- **Rôle de tâche vs rôle d'exécution de tâche** — un vrai discriminateur d'examen. Le **rôle d'exécution de tâche** est utilisé par l'*agent* ECS au nom de la tâche, avant et autour de votre code : extraire l'image depuis ECR, récupérer les secrets depuis Secrets Manager, écrire les journaux dans CloudWatch. Le **rôle de tâche** est ce que *le code de votre application à l'intérieur du conteneur* utilise pour appeler les services AWS : lire depuis S3, écrire dans DynamoDB — comme les rôles d'instance EC2, mais par tâche, donc chaque tâche peut avoir des permissions différentes. « Le conteneur doit lire depuis S3 » → **rôle de tâche** (attaché dans la définition de tâche). « La tâche échoue à extraire son image / ne peut pas récupérer son secret » → il manque des permissions au **rôle d'exécution**.
- **Fargate Spot** : exécutez des conteneurs tolérants aux pannes sur de la capacité de réserve pour jusqu'à ~70 % de réduction, avec un avertissement d'interruption de deux minutes — l'équivalent Fargate d'EC2 Spot, configuré via les fournisseurs de capacité. Déclencheur d'examen : « exécuter des conteneurs tolérants aux interruptions au coût le plus bas sans gérer d'instances » → Fargate Spot.
- **Analyse d'images ECR** : ECR peut analyser les images de conteneurs pour les vulnérabilités connues (CVE). Signal d'examen : « analyser les conteneurs pour les vulnérabilités de sécurité » → analyse d'images ECR.
- **Déploiements bleu/vert** : ECS prend en charge les déploiements bleu/vert via l'intégration CodeDeploy. Déploiement sans interruption avec rollback automatique. Modèle d'examen : « déployer sans interruption avec rollback automatique » → ECS + CodeDeploy bleu/vert.
- **Intégration Secrets Manager** : Signal d'examen : « injecter des secrets dans les conteneurs sans stocker les valeurs dans les définitions de tâches » → utilisez le champ `secrets` dans la définition de tâche référençant un ARN Secrets Manager. Le rôle d'exécution de tâche a besoin de la permission `secretsmanager:GetSecretValue`.
- **Auto Scaling du service ECS** : Mettre à l'échelle le nombre de tâches en fonction du CPU, de la mémoire ou de métriques CloudWatch personnalisées. Fonctionne avec ALB pour router le trafic vers le bon nombre de tâches en cours d'exécution.
- **AWS Batch :** Calcul par lots géré pour conteneurs Docker. File de travaux → environnement de calcul (EC2 ou Fargate, prend en charge Spot). À utiliser quand : le délai d'attente de Lambda est trop court, un service ECS est gaspilleur pour des travaux finis. Déclencheur d'examen : « traitement par lots à grande échelle » ou « travail qui s'exécute pendant des heures » → AWS Batch.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre une image Docker et un conteneur Docker. Expliquez la différence entre ECS et ECR.

*(Indice : L'image est au conteneur ce qu'une recette est à un plat cuisiné. ECR stocke les images ; ECS les exécute.)*

**Exercice 2 — Scénario SAA-C03**

*Scénario* : Une entreprise a une application de microservices actuellement exécutée sur des instances EC2 gérées manuellement. L'équipe a des difficultés avec des déploiements incohérents — différentes instances EC2 ont différentes versions de bibliothèques, causant des bugs difficiles à reproduire. Elle veut standardiser les déploiements tout en minimisant la surcharge opérationnelle pour gérer les serveurs sous-jacents. L'équipe n'a pas d'expérience Kubernetes.

Quelle solution répond LE MIEUX à ces exigences ?

A) Conteneuriser l'application avec Docker ; utiliser Amazon ECS avec le type de lancement Fargate  
B) Déployer sur EC2 avec AWS Systems Manager Patch Manager pour maintenir la cohérence des instances  
C) Conteneuriser l'application avec Docker ; utiliser Amazon EKS avec des groupes de nœuds autogérés  
D) Utiliser AWS Elastic Beanstalk pour gérer automatiquement les déploiements et la configuration des instances

**Indice 1** : Les conteneurs résolvent directement le problème d'« environnement incohérent ». Quelles options utilisent des conteneurs ?

**Indice 2** : « Minimiser la surcharge opérationnelle pour gérer les serveurs » → Fargate (pas de gestion EC2) vs nœuds autogérés (gérer encore EC2).

**Indice 3** : « Pas d'expérience Kubernetes » → EKS est plus complexe opérationnellement qu'ECS.

**Réponse** : A

**Explication** : La conteneurisation avec Docker garantit que chaque déploiement utilise la même image avec les mêmes dépendances — éliminant la dérive de configuration. ECS avec Fargate signifie pas d'instances EC2 à gérer. L'équipe se concentre sur le code de l'application et les définitions de conteneurs, pas sur la maintenance des serveurs. ECS (pas EKS) est approprié pour les équipes sans expérience Kubernetes.

**Pourquoi pas B ?** Patch Manager maintient les instances EC2 à jour mais ne résout pas l'incohérence des versions de bibliothèques entre applications. Le problème fondamental (différents environnements de code sur différentes instances) persiste.

**Pourquoi pas C ?** EKS avec des groupes de nœuds autogérés nécessite de gérer des instances EC2 *et* d'apprendre Kubernetes. Aucun des deux ne correspond aux exigences.

**Pourquoi pas D ?** Elastic Beanstalk gère le déploiement d'application sur EC2 mais ne résout pas l'incohérence fondamentale d'environnement à moins que des conteneurs ne soient utilisés. Beanstalk n'utilise pas les images Docker par défaut (bien qu'il puisse être configuré pour le faire).

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus divise l'API monolithique en trois microservices : le service de commandes, le service de menus et le service de notifications. Chaque service a des exigences de mise à l'échelle différentes (le service de commandes s'adapte au trafic ; le service de menus est principalement en lecture seule et stable ; le service de notifications a des pics irréguliers).

Concevez l'architecture ECS pour ces trois services. Comment géreriez-vous la communication service à service ? Utiliseriez-vous un cluster ECS ou trois ? Comment configureriez-vous l'Auto Scaling différemment pour chaque service ?

Considérez : le service de menus est intensif en lecture et pourrait servir des données périmées pendant 60 secondes — ajouteriez-vous une mise en cache devant lui ? Le service de notifications monte fortement en pics les vendredis soirs — définiriez-vous la capacité Min de Fargate à 1 et la Max à 20 ? Qu'arrive-t-il aux notifications en cours pendant un événement de réduction d'échelle ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer l'architecture de microservices sur ECS.)*

## Scène post-générique

Le premier déploiement de conteneur était sans faille.

Nouvelle version de l'API : zéro interruption. ECS l'avait déployée, les vérifications de santé avaient réussi, les anciennes tâches s'étaient drainées, les nouvelles avaient pris le relais. Leo regardait l'état des tâches dans la console avec quelque chose qui s'apparentait à l'incrédulité.

« Ça a juste marché », dit-il.

« La semaine dernière tu as dit la même chose à propos du déploiement SSH manuel avant qu'il échoue sur l'instance trois », dit Priya.

« Je l'ai déjà déployé — oh. » Leo s'arrêta. « J'ai déployé sans étiqueter la version de l'image. Laisse-moi corriger ça. »

« C'est tout l'intérêt », dit Priya. « Le versionnage d'images est la façon dont tu suis ce qui s'exécute. »

« Comment sais-tu quelle version est en production en ce moment ? » demanda Maya.

Leo afficha la console ECS. Sous la tâche en cours d'exécution, l'image était listée : `123456789012.dkr.ecr.us-west-2.amazonaws.com/nimbus-api:1.0.3`. Version 1.0.3. Construite à 14h22 UTC. Déployée à 14h31 UTC.

« Sur l'ancienne configuration EC2 », dit Leo, « j'aurais dû me connecter en SSH à une instance et exécuter `pip show` pour voir quelle version de chaque dépendance était installée. Et elle aurait pu être différente sur les autres instances. »

« Et maintenant ? »

« L'étiquette sur l'image me dit exactement ce qui s'exécute. L'historique d'analyse ECR me dit si elle a été analysée. L'historique de déploiement ECS me dit quand elle a été déployée et quelle était la version précédente. »

« Pas de SSH. Pas d'interruption. Pas d'"attends qu'il redémarre". »

« L'image est l'artefact de déploiement », dit Priya. « L'environnement est immuable. Le processus de déploiement est déclaratif. C'est comme ça que les logiciels devraient être livrés. »

Leo fixa la console un autre moment.

« J'ai passé trois ans à coordonner des déploiements EC2 », dit-il. « À coordonner des scripts SSH. À écrire des runbooks de déploiement. »

« Tu résolvais un problème », dit Priya, « que les conteneurs résolvent par conception. »

Il ne dit rien après ça. Mais le lendemain matin, il commença à écrire la documentation sur le processus de construction de conteneurs, pour que personne d'autre n'ait à passer trois ans à le comprendre.

Le bug de l'instance trois, les six semaines de dérive non documentée, et les problèmes du même genre qu'ils n'avaient pas encore attrapés — tout cela avait une cause racine unique. Pas un acteur malveillant. Pas une panne matérielle. Juste un serveur qui avait été traité comme un élément permanent au lieu d'une unité jetable.

Le conteneur était la réponse à cela. Non parce qu'il était nouveau et intéressant. Parce qu'il rendait la question impossible à poser.

Dans le prochain chapitre : l'organigramme qui s'exécute tout seul — et qui se souvient où il s'est arrêté.
