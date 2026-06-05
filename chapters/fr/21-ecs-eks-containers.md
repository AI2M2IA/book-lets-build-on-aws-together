# Chapitre 21 : Conteneurs de Transport pour le Code

« Ça marche sur ma machine. »

Leo avait appris à ne pas dire cela à voix haute. Ce n'était pas une défense — c'était un diagnostic. Et le diagnostic cette fois concernait l'instance EC2 de production numéro trois, qui avait reçu un patch de bibliothèque six semaines auparavant que personne n'avait documenté, que les deux autres instances n'avaient pas reçu, et qui causait maintenant un bug qui n'existait que là, dans cette instance, invisible partout ailleurs.

Il avait passé trois heures la nuit précédente à le traquer.

« Chaque fois qu'on déploie, » dit-il le lendemain matin, « on coordonne sur plusieurs instances. Nouvelle version, dépendances différentes. Ça marche en staging, ça casse en production parce que les environnements ont divergé. »

« Parce que quelqu'un a mis à jour un package sur l'instance trois sans mettre à jour les autres, » dit Priya. Sans méchanceté.

« J'avais besoin d'une version spécifique de — »

« Je sais, » dit-elle. « Et maintenant l'instance trois a un historique différent de l'instance un et deux. C'est la dérive de configuration. Elle est silencieuse jusqu'à ce qu'elle ne le soit plus. »

Lambda avait résolu le problème des serveurs inactifs pour les services plus petits de Nimbus. Mais l'API principale — celle qui portait tout le trafic des commandes — était toujours sur EC2. Et les instances EC2, contrairement aux fonctions, accumulaient de l'historique.

« Quelle est la vraie solution ? » demanda Maya.

« Arrêter de traiter les serveurs comme des choses permanentes que vous configurez, » dit Priya. « Commencer à les traiter comme des unités jetables que vous remplacez. »

Il y a une analogie qui explique cela si précisément qu'elle apparaît dans presque toutes les explications des conteneurs logiciels. Elle vient de 1956, et n'a rien à voir avec le logiciel. La réponse, quand quelqu'un demanda enfin « quelle est la solution pour transporter des marchandises de manière fiable entre différents transporteurs ? », était : standardiser le conteneur. Expédier la boîte, pas seulement le contenu.

**Qu'est-ce qu'un Conteneur ?**

Un **conteneur** est une unité légère et portable qui regroupe votre application avec tout ce dont elle a besoin pour fonctionner : le runtime (Python 3.11, Node.js 20, Java 17), les bibliothèques et dépendances, les fichiers de configuration, et le code de l'application lui-même.

Contrairement à une machine virtuelle (qui émule un ordinateur entier, y compris le noyau du système d'exploitation), un conteneur partage le noyau OS de l'hôte tout en gardant tout le reste isolé. Cela rend les conteneurs rapides à démarrer (secondes, parfois millisecondes) et légers (mégaoctets, pas gigaoctets).

La technologie de conteneurs la plus populaire est **Docker**. Une image Docker est le modèle — un instantané de l'application et de son environnement. Un conteneur Docker est une instance en cours d'exécution de cette image.

La propriété clé : **l'immuabilité**. Une image construite aujourd'hui s'exécutera de manière identique sur n'importe quel hôte qui supporte Docker — un ordinateur portable, une instance EC2, un serveur dans un autre centre de données. L'environnement est intégré. La dérive de configuration est impossible.

« Donc au lieu de s'inquiéter de ce qui est installé sur l'instance EC2, » dit Leo, « on construit une image qui a tout. L'image s'exécute de la même façon partout. »

« Et si tu dois la tester localement, tu exécutes la même image, » ajouta Priya. « Plus de 'ça marche sur ma machine'. »

**Amazon ECS : L'Orchestrateur**

Exécuter un conteneur est simple. Exécuter des dizaines de conteneurs sur plusieurs hôtes, router le trafic entre eux, redémarrer les conteneurs défaillants, déployer de nouvelles versions sans interruption — cela nécessite un **orchestrateur**.

**Amazon ECS (Elastic Container Service)** est le service d'orchestration de conteneurs géré par AWS. Vous définissez :

- **Définition de tâche** : Quelle image de conteneur exécuter, combien de CPU et de mémoire, quelles variables d'environnement, quels ports exposer
- **Service** : Combien de copies de la tâche exécuter, comment gérer les défaillances et les déploiements
- **Cluster** : L'infrastructure de calcul sous-jacente

ECS gère le reste : placer les tâches sur la capacité disponible, redémarrer les tâches défaillantes, drainer les connexions lors des déploiements, enregistrer les tâches saines avec l'équilibreur de charge.

Pour Nimbus, l'API a été déplacée des instances EC2 avec des déploiements gérés manuellement vers ECS. Chaque nouveau déploiement poussait une nouvelle image Docker vers **Amazon ECR (Elastic Container Registry)** — le registre de conteneurs géré par AWS — et ECS la déployait sur toutes les tâches sans interruption.

**Fargate vs Type de Lancement EC2**

ECS peut exécuter des conteneurs de deux façons :

**Type de lancement EC2** : Vous gérez les instances EC2 sous-jacentes. Vous êtes responsable du patching des instances, de leur dimensionnement correct, et de s'assurer qu'il y a suffisamment de capacité pour vos conteneurs. Plus de contrôle, plus de responsabilité.

**Fargate (calcul serverless pour conteneurs)** : AWS gère entièrement l'infrastructure sous-jacente. Vous spécifiez le CPU et la mémoire par tâche ; Fargate provisionne automatiquement la bonne capacité. Pas d'instances EC2 à gérer. Vous payez par vCPU-seconde et par Go-seconde de mémoire.

Fargate est le modèle de « conteneurs serverless » — vous obtenez l'isolation d'environnement des conteneurs sans gérer de serveurs. Le compromis : moins de contrôle sur la configuration de l'instance sous-jacente et un coût unitaire légèrement plus élevé.

Pour Nimbus : Fargate pour le service API. Ils ne voulaient pas gérer des instances EC2 pour les conteneurs.

**Amazon EKS : Quand Vous Avez Besoin de Kubernetes**

**Kubernetes** est un système d'orchestration de conteneurs open-source — essentiellement le standard industriel pour gérer les conteneurs à grande échelle. Il est puissant, extensible et complexe.

**Amazon EKS (Elastic Kubernetes Service)** est le service Kubernetes géré par AWS. Il exécute le plan de contrôle Kubernetes (la couche de gestion) pour vous, tandis que vous gérez les nœuds de travail (ou utilisez Fargate pour ceux-ci aussi).

Quand utiliser EKS vs ECS ?

**Utilisez ECS** si :

- Vous êtes principalement sur AWS et souhaitez l'expérience plus simple et plus native AWS
- Votre équipe n'a pas d'expertise Kubernetes existante
- Vous voulez moins de surcharge opérationnelle

**Utilisez EKS** si :

- Vous avez besoin de fonctionnalités spécifiques à Kubernetes (Custom Resource Definitions, charts Helm, l'écosystème Kubernetes)
- Votre équipe connaît déjà Kubernetes
- Vous exécutez un environnement hybride (certaines charges sur site, d'autres dans AWS) et souhaitez une couche d'orchestration cohérente
- Votre charge de travail a des exigences qui correspondent à l'extensibilité de Kubernetes

« Lequel devrions-nous utiliser ? » demanda Maya.

« ECS, » dit Priya immédiatement. « On n'a pas d'expertise Kubernetes. ECS fait tout ce dont on a besoin. Ajouter Kubernetes maintenant serait ajouter de la complexité opérationnelle sans bénéfice pratique. »

« On peut toujours migrer vers EKS plus tard si on dépasse ECS, » ajouta Leo.

C'est une réponse senior correcte : choisir l'outil le plus simple qui correspond à vos besoins actuels.

**Comment les Conteneurs Changent les Déploiements**

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

## Points Forts et Limites

**Conteneurs** :

- Éliminent l'incohérence d'environnement (« ça marche sur ma machine »)
- Permettent des déploiements rapides et fiables
- Immuables — la même image s'exécute de manière identique partout
- Efficaces — plus légers que les VMs, démarrage plus rapide

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

- Les **conteneurs** regroupent le code de l'application, le runtime et les dépendances — s'exécutent de manière identique partout.
- **Docker** est la technologie de conteneurs standard. Les images sont des modèles ; les conteneurs sont des instances en cours d'exécution.
- **ECR (Elastic Container Registry)** est le registre Docker géré par AWS — stockez et versionnez vos images ici.
- **ECS (Elastic Container Service)** orchestre les conteneurs. Vous définissez des tâches et des services ; ECS gère le placement et le cycle de vie.
- **Fargate** est le calcul serverless pour les conteneurs — pas d'instances EC2 à gérer.
- **EKS (Elastic Kubernetes Service)** est Kubernetes géré — pour les équipes qui ont besoin de fonctionnalités ou de compatibilité Kubernetes.
- Choisissez ECS pour la simplicité sur AWS ; choisissez EKS pour la compatibilité avec l'écosystème Kubernetes.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures résilientes (Domaine 2, Tâche 2.1)*

- **Signaux ECS vs EKS** : Les scénarios d'examen qui mentionnent « Kubernetes », « Helm », « expertise Kubernetes existante » ou « orchestration de conteneurs multi-cloud » → EKS. Tout le reste → ECS.
- **Fargate vs type de lancement EC2** : « Ne veut pas gérer des instances EC2 pour les conteneurs », « conteneurs serverless », « pas de gestion d'infrastructure » → Fargate. « Nécessite des types d'instances spécifiques », « charges de travail GPU », « contrôle précis des instances » → type de lancement EC2.
- **Rôles de tâches ECS** : Comme les rôles d'instance EC2, les tâches ECS ont des rôles IAM. Chaque tâche peut avoir des autorisations différentes. Scénario d'examen : « le conteneur doit lire depuis S3 » → attacher un rôle IAM à la définition de tâche.
- **Analyse d'images ECR** : ECR peut analyser les images de conteneurs pour les vulnérabilités connues (CVEs). Signal d'examen : « analyser les conteneurs pour les vulnérabilités de sécurité » → analyse d'images ECR.
- **Déploiements bleu/vert** : ECS supporte les déploiements bleu/vert via l'intégration CodeDeploy. Déploiement sans interruption avec rollback automatique. Modèle d'examen : « déployer sans interruption avec rollback automatique » → ECS + CodeDeploy bleu/vert.
- **Auto Scaling du service ECS** : Mettre à l'échelle le nombre de tâches en fonction du CPU, de la mémoire ou de métriques CloudWatch personnalisées. Fonctionne avec ALB pour router le trafic vers le bon nombre de tâches en cours d'exécution.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre une image Docker et un conteneur Docker. Expliquez la différence entre ECS et ECR.

*(Indice : L'image est au conteneur ce qu'une recette est à un plat cuisiné. ECR stocke les images ; ECS les exécute.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise a une application de microservices actuellement exécutée sur des instances EC2 gérées manuellement. L'équipe a des difficultés avec des déploiements incohérents — différentes instances EC2 ont différentes versions de bibliothèques, causant des bugs difficiles à reproduire. Elle veut standardiser les déploiements tout en minimisant la surcharge opérationnelle pour gérer les serveurs sous-jacents. L'équipe n'a pas d'expérience Kubernetes.

Quelle solution répond LE MIEUX à ces exigences ?

A) Déployer sur EC2 avec AWS Systems Manager Patch Manager pour maintenir la cohérence des instances  
B) Conteneuriser l'application avec Docker ; utiliser Amazon ECS avec le type de lancement Fargate  
C) Conteneuriser l'application avec Docker ; utiliser Amazon EKS avec des groupes de nœuds autogérés  
D) Utiliser AWS Elastic Beanstalk pour gérer automatiquement les déploiements et la configuration des instances

**Indice 1** : Les conteneurs résolvent directement le problème d'« environnement incohérent ». Quelles options utilisent des conteneurs ?

**Indice 2** : « Minimiser la surcharge opérationnelle pour gérer les serveurs » → Fargate (pas de gestion EC2) vs nœuds autogérés (gérer encore EC2).

**Indice 3** : « Pas d'expérience Kubernetes » → EKS est plus complexe opérationnellement qu'ECS.

**Réponse** : B

**Explication** : La conteneurisation avec Docker garantit que chaque déploiement utilise la même image avec les mêmes dépendances — éliminant la dérive de configuration. ECS avec Fargate signifie pas d'instances EC2 à gérer. L'équipe se concentre sur le code de l'application et les définitions de conteneurs, pas sur la maintenance des serveurs. ECS (pas EKS) est approprié pour les équipes sans expérience Kubernetes.

**Pourquoi pas A ?** Patch Manager maintient les instances EC2 à jour mais ne résout pas l'incohérence des versions de bibliothèques entre applications. Le problème fondamental (différents environnements de code sur différentes instances) persiste.

**Pourquoi pas C ?** EKS avec des groupes de nœuds autogérés nécessite de gérer des instances EC2 *et* d'apprendre Kubernetes. Aucun des deux ne correspond aux exigences.

**Pourquoi pas D ?** Elastic Beanstalk gère le déploiement d'application sur EC2 mais ne résout pas l'incohérence fondamentale d'environnement à moins que des conteneurs ne soient utilisés. Beanstalk n'utilise pas les images Docker par défaut (bien qu'il puisse être configuré pour le faire).

*Domaine SAA-C03 : Concevoir des architectures résilientes — Tâche 2.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus divise l'API monolithique en trois microservices : le service de commandes, le service de menus et le service de notifications. Chaque service a des exigences de mise à l'échelle différentes (le service de commandes s'adapte au trafic ; le service de menus est principalement en lecture seule et stable ; le service de notifications a des pics irréguliers).

Concevez l'architecture ECS pour ces trois services. Comment géreriez-vous la communication service à service ? Utiliseriez-vous un cluster ECS ou trois ? Comment configureriez-vous l'Auto Scaling différemment pour chaque service ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer l'architecture de microservices sur ECS.)*

## Scène Post-Générique

Le premier déploiement de conteneur était sans faille.

Nouvelle version de l'API : zéro interruption. ECS l'avait déployée, les vérifications de santé avaient réussi, les anciennes tâches s'étaient drainées, les nouvelles avaient pris le relais. Leo regardait l'état des tâches dans la console avec quelque chose qui s'apparentait à l'incrédulité.

« Ça a juste marché, » dit-il.

« C'est l'objectif, » dit Priya.

« Pas de SSH. Pas d'interruption. Pas d'"attends qu'il redémarre". »

« L'image est l'artefact de déploiement, » dit-elle. « L'environnement est immuable. Le processus de déploiement est déclaratif. C'est comme ça que les logiciels devraient être livrés. »

Leo fixa la console un autre moment.

« J'ai passé trois ans à coordonner des déploiements EC2, » dit-il. « À coordonner des scripts SSH. À écrire des runbooks de déploiement. »

« Tu résolvais un problème, » dit Priya, « que les conteneurs résolvent par conception. »

Il ne dit rien après ça. Mais le lendemain matin, il commença à écrire la documentation sur le processus de construction de conteneurs, pour que personne d'autre n'ait à passer trois ans à le comprendre.

Dans le prochain chapitre : l'organigramme qui s'exécute tout seul — et qui se souvient où il s'est arrêté.
