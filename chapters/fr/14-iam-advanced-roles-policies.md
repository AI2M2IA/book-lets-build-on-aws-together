# Chapitre 14 : Qui a le droit de faire quoi

Tom avait les clés d'accès ouvertes dans un fichier texte, prêtes à coller.

« Qu'est-ce que tu fais ? » demanda Priya.

« L'instance EC2 doit lire des fichiers de configuration depuis S3. Je mets les identifiants dans la configuration du serveur. »

Elle regarda l'écran un moment. « Ferme ce fichier. »

« Je voulais juste— »

« Si quelqu'un pénètre dans ce serveur », dit-elle, « il obtient ces clés. Et ces clés touchent tout ce que l'utilisateur IAM est autorisé à toucher. Ce qui est probablement bien plus que juste S3. »

Tom ferma le fichier.

« Il y a une meilleure façon », dit-elle. « Le serveur lui-même peut avoir un rôle. Pensez-y comme à un titre de poste — l'instance n'a pas besoin d'identifiants parce que le système sait déjà ce qu'elle est et ce qu'elle est autorisée à faire. »

Tom semblait sceptique. « Donc le serveur s'authentifie lui-même ? »

« Oui. Sans mot de passe. Sans clés dans un fichier de configuration. Sans rien qui pourrait être accidentellement soumis dans git. »

Cette dernière partie fit mouche. Tom avait trouvé un mot de passe de base de données dans l'historique git deux semaines auparavant. Il ouvrit un nouvel onglet de navigateur.

**Revisiter IAM : le tableau complet**

Le chapitre 3 a présenté IAM : utilisateurs, groupes, rôles et politiques. Il est maintenant temps d'aller plus loin.

Les politiques IAM sont des documents JSON qui spécifient quelles actions sont autorisées ou refusées sur quelles ressources. Elles ressemblent à ceci :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::nimbus-assets/*"
    }
  ]
}
```

Cette politique autorise la lecture et l'écriture d'objets dans le compartiment `nimbus-assets`, et rien d'autre. Pas de suppression. Pas de liste des compartiments. Pas d'autre opération S3. Pas d'autre service AWS.

C'est la bonne façon d'accorder des autorisations : des actions spécifiques, des ressources spécifiques.

**Le problème avec « Accès administrateur »**

Les politiques gérées par AWS comme `AdministratorAccess` sont conçues pour démarrer rapidement. Elles ne sont pas conçues pour faire fonctionner des systèmes de production avec de vrais membres d'équipe.

`AdministratorAccess` accorde chaque action sur chaque ressource. Si un membre de l'équipe avec cette politique fait une erreur — supprime accidentellement un compartiment S3, résilie la mauvaise instance EC2, modifie les règles du groupe de sécurité — AWS ne peut rien faire pour les arrêter. L'autorisation a été accordée.

Si les identifiants d'un membre de l'équipe sont compromis (attaque de phishing, clé d'accès divulguée, vol d'ordinateur portable), l'attaquant a un accès administrateur à tout dans votre compte AWS.

« Alors qu'est-ce que Soo-Jin devrait avoir ? » demanda Leo.

« Qu'est-ce que Soo-Jin a besoin de faire ? » répondit Priya.

« Déployer l'API. Vérifier les journaux. Rien d'autre. »

« Alors elle obtient : la capacité à pousser vers le pipeline de code, un accès en lecture aux journaux CloudWatch, et rien d'autre. »

« C'est... très spécifique. »

« Oui. C'est le but. »

**Rôles IAM : identités pour les services**

Le chapitre 3 a présenté les rôles comme un moyen pour les instances EC2 d'accéder aux services AWS sans stocker d'identifiants. Rendons cela concret.

Vos instances EC2 exécutant l'API Nimbus ont besoin de :

- Lire depuis DynamoDB (le menu)
- Écrire dans DynamoDB (les commandes)
- Mettre des objets dans S3 (reçus, téléchargements)
- Écrire des journaux dans CloudWatch
- Lire des secrets depuis Secrets Manager

Au lieu de créer un utilisateur avec une clé d'accès et de stocker cette clé sur l'instance EC2 (un cauchemar de sécurité — les clés d'accès peuvent être lues par quiconque ayant accès SSH), vous créez un **rôle IAM** pour l'instance EC2 avec exactement ces autorisations.

L'instance EC2 assume le rôle automatiquement. AWS fournit des identifiants temporaires via le service de métadonnées d'instance. Les identifiants sont renouvelés automatiquement. Pas de clé d'accès à divulguer.

« Et si quelqu'un pirate l'instance EC2 ? » demanda Leo.

« Ils peuvent faire ce que le rôle EC2 autorise », dit Priya. « Ce qui consiste à lire le menu, écrire des commandes et envoyer des journaux. Ils ne peuvent pas supprimer le compartiment S3. Ils ne peuvent pas résilier des instances EC2. Ils ne peuvent pas toucher IAM. »

« Parce que le rôle EC2 n'a pas ces autorisations. »

« Exactement. »

**Assumption de rôle : comment les services deviennent d'autres services**

Les rôles peuvent être assumés par :

- **Les services AWS** (EC2, Lambda, les tâches ECS, etc.)
- **Les utilisateurs IAM** dans votre propre compte (élévation de rôle — vous assumez un rôle avec plus d'autorisations pour une tâche spécifique)
- **Les utilisateurs IAM dans d'autres comptes AWS** (accès inter-comptes — le compte d'une autre organisation peut assumer un rôle dans le vôtre)
- **Les fournisseurs d'identité externes** (Google, Active Directory, Okta — accès fédéré pour les utilisateurs humains)

Ce dernier modèle — la **fédération d'identités** — est la façon dont les grandes organisations donnent à leurs employés l'accès à AWS sans créer d'utilisateurs IAM individuels pour chaque personne. L'Active Directory de votre entreprise contient vos identifiants. Quand vous vous connectez à AWS, vous vous authentifiez contre Active Directory, et AWS vous accorde un rôle.

**Limites d'autorisation : limiter ce que les rôles peuvent accorder**

Voici un problème subtil mais important : par défaut, IAM n'empêche pas un utilisateur d'accorder des autorisations qu'il n'a pas actuellement.

Si Soo-Jin a `iam:CreatePolicy` et `iam:AttachUserPolicy`, elle pourrait créer une politique accordant l'accès en écriture S3 et se l'attacher — même si ses politiques existantes n'autorisent que la lecture S3. Cette classe de vulnérabilité s'appelle **l'escalade de privilèges**, et c'est exactement pourquoi les limites d'autorisation existent.

Mais que faire si vous voulez déléguer la création d'autorisations IAM à un responsable d'équipe, tout en vous assurant qu'il ne peut pas accorder plus que ce que vous aviez prévu ?

Les **limites d'autorisation** définissent les autorisations maximales qui peuvent jamais être accordées à une identité. Même si les politiques attachées à l'identité sont plus larges, les autorisations effectives sont bornées par la limite d'autorisation.

Exemple : Vous donnez à un responsable d'équipe une politique lui permettant de créer des rôles IAM. Mais vous attachez une limite d'autorisation qui dit « les rôles créés par ce responsable d'équipe ne pourront jamais avoir accès à la suppression S3. » Même si le responsable d'équipe crée un rôle avec un accès complet S3, la limite empêche la suppression S3 de prendre effet.

C'est un concept avancé, mais il apparaît à l'examen et reflète la façon dont les organisations délèguent la gestion IAM à grande échelle.

**IAM Access Analyzer : auditer les autorisations**

Priya a passé deux jours à examiner la configuration IAM de l'équipe. Elle a trouvé :

- L'utilisateur personnel de Leo avait un accès administrateur (comme découvert)
- Une ancienne fonction Lambda avait des autorisations pour lire tous les compartiments S3 (vestige d'un test)
- Un rôle de service avait un accès en écriture à des tables DynamoDB qui n'existaient plus

C'est normal. Les configurations IAM accumulent des vestiges au fil du temps.

**IAM Access Analyzer** est un service AWS qui identifie automatiquement les ressources (compartiments S3, rôles IAM, clés KMS, fonctions Lambda) partagées avec des entités externes. Il identifie également les politiques excessivement permissives.

Les audits IAM réguliers devraient faire partie de vos opérations. Les autorisations croissent ; elles diminuent rarement organiquement. Access Analyzer aide à rendre l'invisible visible.

**Les politiques de contrôle de service : garde-fous au niveau de l'organisation**

Si votre environnement AWS grandit jusqu'à inclure plusieurs comptes (un modèle courant pour les grandes équipes — compte dev, compte staging, compte production), **AWS Organizations** vous permet de les gérer depuis un compte central.

Au sein d'Organizations, les **Politiques de contrôle de service (SCP)** appliquent des garde-fous qui affectent *chaque* entité IAM dans le compte, y compris les administrateurs.

Exemple de SCP : « Personne dans le compte dev ne peut créer des instances EC2 dans la région eu-west-1. »

Même si quelqu'un a un accès administrateur dans le compte dev, il ne peut pas violer ce SCP. Il est appliqué au niveau de l'organisation, au-dessus du niveau du compte.

Les SCP n'accordent pas d'autorisations — ils les restreignent. Ils définissent les autorisations maximales que toute entité IAM dans un compte peut jamais avoir.

## Points forts et limites

**Pourquoi les rôles IAM et le moindre privilège sont importants** :

- Limite le rayon d'impact lors de la compromission des identifiants
- Oblige les attaquants à escalader à travers plusieurs systèmes plutôt que d'obtenir un accès complet immédiatement
- Fournit une piste d'audit — CloudTrail enregistre quel rôle a fait quoi
- Force des décisions conscientes concernant l'accès — « de quoi ce service a-t-il réellement besoin ? »

**Là où ça se complique** :

- Rédiger des politiques IAM précises nécessite de comprendre le modèle action/ressource d'AWS pour chaque service (et chaque service a des dizaines d'actions)
- Les politiques trop restrictives cassent les applications — déboguer les erreurs « accès refusé » à travers plusieurs services est chronophage
- IAM propage les changements avec un léger délai (généralement des secondes, parfois plus) — peut causer des problèmes de timing déroutants
- Les rôles inter-comptes nécessitent une configuration soigneuse de la politique de confiance

## Résumé

- Évitez **l'accès administrateur** en production — c'est pour la configuration, pas les opérations.
- Les politiques IAM spécifient **Effect**, **Action** et **Resource** — soyez précis sur les trois.
- Attachez les politiques aux **groupes** (pour les humains) et aux **rôles** (pour les services).
- Les instances EC2, les fonctions Lambda et autres services AWS doivent utiliser des **rôles IAM**, pas des clés d'accès.
- Les **limites d'autorisation** plafonnent les autorisations maximales que toute identité peut avoir, quelle que soit les politiques attachées.
- Les **SCP** (Politiques de contrôle de service) appliquent des restrictions à l'échelle de l'organisation que même les administrateurs ne peuvent pas contourner.
- **IAM Access Analyzer** identifie les politiques excessivement permissives et l'accès externe aux ressources.

## Conseils pour l'examen

*SAA-C03 Domaine : Concevoir des architectures sécurisées (Domaine 1, Tâche 1.1)*

- **Rôles IAM pour EC2** : La réponse canonique quand EC2 doit accéder à S3, DynamoDB, Secrets Manager ou tout service AWS. Ne jamais stocker des clés d'accès sur une instance.
- **Logique d'évaluation des politiques** : Quand IAM évalue une requête, il utilise une hiérarchie d'autorisation/refus explicite. Un **Refus** explicite l'emporte toujours, même contre un Autorisation explicite. La valeur par défaut est Refus.
- **Limites d'autorisation** : Utilisées lors de la délégation de l'administration IAM. Scénario d'examen : « autoriser les développeurs à créer des rôles pour leurs fonctions Lambda, mais les empêcher d'accorder des autorisations au-delà de ce qu'ils ont. » → Limites d'autorisation.
- **Les SCP n'accordent pas d'autorisations** : Ils restreignent uniquement. Si un SCP autorise S3 mais qu'une politique IAM le refuse, S3 est refusé. Si un SCP refuse S3 mais qu'une politique IAM l'autorise, S3 est refusé.
- **Politiques basées sur les ressources** : Certains services AWS (S3, SQS, Lambda) ont des politiques basées sur les ressources — des autorisations attachées à la ressource, pas à l'identité. Celles-ci fonctionnent parallèlement aux politiques IAM.
- **Accès inter-comptes** : Rôle IAM dans le Compte A avec une politique de confiance permettant au Compte B de l'assumer. L'utilisateur/rôle du Compte B utilise ensuite `sts:AssumeRole` pour obtenir des identifiants temporaires dans le Compte A.
- **Utilisateurs IAM vs Accès fédéré** : Pour les grandes organisations, l'accès fédéré (via IAM Identity Center ou la fédération directe avec un IdP) est préféré aux utilisateurs IAM individuels.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre une politique IAM attachée à un utilisateur et un rôle IAM assumé par une instance EC2. Quand utiliseriez-vous chacun ?

*(Indice : Pensez aux identifiants — où vivent-ils, et qui gère leur rotation ?)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une fonction Lambda doit lire depuis un compartiment S3 et écrire dans une table DynamoDB. Un développeur a donné à la fonction Lambda un rôle avec `AdministratorAccess` par souci de simplicité lors du développement. Avant de passer en production, l'équipe de sécurité veut suivre le moindre privilège.

Quelle est la MEILLEURE approche parmi les suivantes ?

A) Créer un nouvel utilisateur IAM avec des autorisations de lecture S3 et d'écriture DynamoDB ; générer une clé d'accès ; stocker la clé dans les variables d'environnement Lambda  
B) Attacher une politique inline au rôle d'exécution de la fonction Lambda accordant `s3:GetObject` sur le compartiment spécifique et `dynamodb:PutItem` sur la table spécifique  
C) Conserver `AdministratorAccess` mais ajouter un SCP qui bloque toutes les actions sauf S3 et DynamoDB  
D) Créer un groupe IAM avec des autorisations de lecture S3 et d'écriture DynamoDB et ajouter la fonction Lambda au groupe

**Indice 1** : Les fonctions Lambda utilisent des rôles d'exécution, pas des clés d'accès. Quelle option respecte cela ?

**Indice 2** : Le moindre privilège signifie des actions spécifiques sur des ressources spécifiques, pas des politiques larges.

**Indice 3** : Les groupes IAM contiennent des utilisateurs, pas des fonctions Lambda.

**Réponse** : B

**Explication** : Le rôle d'exécution Lambda ne doit avoir que les autorisations spécifiques dont la fonction a besoin. Les politiques inline limitées à des actions spécifiques (`s3:GetObject`) et des ressources spécifiques (l'ARN du compartiment, l'ARN de la table DynamoDB) est l'implémentation du moindre privilège.

**Pourquoi pas A ?** Stocker des clés d'accès dans les variables d'environnement Lambda est un antimodèle de sécurité — les clés peuvent être lues par quiconque ayant accès à la console Lambda ou via le contexte d'exécution. Les fonctions Lambda utilisent des rôles d'exécution avec des identifiants temporaires d'IAM.

**Pourquoi pas C ?** Les SCP s'appliquent au niveau de l'Organisation/compte et ne fonctionnent pas comme des contrôles d'autorisation par fonction. AdministratorAccess avec un SCP est la mauvaise couche.

**Pourquoi pas D ?** Les fonctions Lambda ne peuvent pas être ajoutées aux groupes IAM. Les groupes sont réservés aux utilisateurs IAM.

*SAA-C03 Domaine : Concevoir des architectures sécurisées — Tâche 1.1*

**Exercice 3 — Défi architectural** *(Facultatif)*

Nimbus a grandi jusqu'à trois équipes : l'équipe API principale, l'équipe du portail partenaires restaurants et l'équipe analytique. Chaque équipe compte cinq développeurs et déploie dans un compte AWS partagé.

Concevez une structure IAM qui :

- Donne à chaque équipe l'accès uniquement à leurs services
- Empêche l'équipe analytique d'écrire dans les bases de données de production
- Permet à un responsable d'équipe dans chaque équipe de créer des rôles IAM pour leurs services, mais sans escalader leurs propres autorisations
- Fournit un groupe admin pour l'équipe plateforme qui peut gérer tous les services

Quels constructs IAM utiliseriez-vous ? Où les limites d'autorisation s'appliqueraient-elles ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la conception IAM multi-équipe.)*

## Scène post-générique

Leo passa le week-end à retravailler IAM.

Le lundi, chaque service avait un rôle avec exactement les autorisations dont il avait besoin. Soo-Jin et Rafael avaient des membres de groupe correspondant à leurs fonctions réelles. Leo lui-même avait abandonné l'accès administrateur et utilisait un rôle qu'il avait conçu — avec l'autorisation de faire son travail, et rien de plus.

Ça avait pris plus de temps que prévu.

Priya examina son travail le mardi matin. Elle lut soigneusement les documents de politique.

« C'est bien », dit-elle.

« Merci », dit Leo, avec le soulagement de quelqu'un qui avait passé un week-end humilié par du JSON.

« Tu as laissé une chose. »

Leo se raidit.

« L'ancienne clé de déploiement de la première version. Dans un secret GitHub Actions. »

« Elle avait été désactivée. »

Priya tapa quelque chose. « Vraiment ? »

Une pause.

« Je vais la désactiver », dit Leo.

« Les journaux CloudTrail montrent qu'elle a effectué trois appels API la semaine dernière. »

Une pause plus longue.

« Quelque chose l'utilisait », dit Leo. « Je vais enquêter. »

Dans le prochain chapitre : la différence entre un agent de sécurité qui se souvient des visages et une porte qui ne lit que les badges.
