# Chapitre 3 : Qui êtes-vous, exactement ?

Leo appuya sur déployer.

Le terminal retourna deux mots : Accès refusé.

Il réessaya. Même résultat. Il travaillait chez Nimbus depuis trois semaines, avait eu accès
au compte AWS le premier jour, et déployait vers l'environnement de staging sans aucun problème.
Mais c'était la production. Et la production, apparemment, était différente.

Maya regarda par-dessus son épaule le message d'erreur. « Qui t'a donné cette permission ? »

Leo se retourna. « Quelle permission ? »

« La permission de déployer en production. Qui a configuré ça ? »

Leo ouvrit la console AWS et commença à cliquer dans les menus. Personne ne l'avait fait. Il n'y avait
pas de politique, pas de rôle, pas d'autorisation explicite. Il n'y avait pas non plus de refus explicite — juste une
absence. Personne chez Nimbus n'avait jamais pris le temps de réfléchir à qui pouvait faire quoi.

C'était le problème.

**Le problème avec les mots de passe**

Les mots de passe sont un mauvais modèle pour les systèmes informatiques.

Pas parce qu'ils sont toujours faibles. Parce qu'ils sont binaires : soit vous avez le mot de passe,
soit vous ne l'avez pas. Si vous l'avez, vous pouvez tout faire ce que le compte est autorisé à faire.

C'est bien pour un seul utilisateur sur son ordinateur personnel. C'est catastrophique pour
l'infrastructure cloud d'une entreprise.

Considérez ce que Nimbus a besoin de gérer : le serveur web, la base de données, le stockage de fichiers,
la mise en réseau, les alertes de facturation, les comptes utilisateurs. Si tout est protégé par un seul mot de passe —
ou même un seul ensemble de credentials — alors quiconque obtient ce mot de passe obtient tout.

Et « tout » sur AWS signifie la capacité de supprimer des bases de données. Lancer des serveurs qui génèrent
une facture de 50 000 euros. Exfiltrer chaque enregistrement client. Détruire les données de sauvegarde.

Priya n'a pas décrit ça en termes calmes et abstraits. Elle l'a décrit comme l'histoire d'une startup
qui a subi une brèche, a reçu une facture AWS de 80 000 euros en 24 heures de la part d'attaquants
minant des cryptomonnaies sur leur compte, et a fermé trois mois plus tard.

La salle était silencieuse.

« Quelle est l'alternative ? » demanda Tom.

**Le concept : Gestion des identités et des accès**

L'alternative est un système où vous ne donnez pas à tout le monde la même clé. Vous donnez à chaque
personne — et à chaque service — précisément l'accès dont elle a besoin. Pas plus, pas moins.

Dans AWS, ce système s'appelle **IAM** : Identity and Access Management (Gestion des identités et des accès).

Pensez à IAM comme au système de badges dans un grand immeuble de bureaux.

L'immeuble a des dizaines d'étages. La salle des serveurs est à l'étage 12. Le bureau des finances
est à l'étage 8. La suite du PDG est à l'étage 20. Chaque employé a un badge, mais
chaque badge n'ouvre que les portes dont cet employé a besoin pour son travail. Le stagiaire
ne peut pas entrer dans la salle des serveurs. Le comptable ne peut pas accéder à l'étage exécutif
après les heures de bureau.

IAM fonctionne de la même façon. Vous définissez qui existe (identités), ce qu'ils sont autorisés à faire
(permissions), et appliquez ces permissions via des politiques.

**Les éléments constitutifs d'IAM**

IAM a quatre concepts fondamentaux. Ils s'appuient les uns sur les autres.

Les **Utilisateurs** sont des identités individuelles. Maya a un utilisateur IAM. Tom a un utilisateur IAM.
Chaque utilisateur a ses propres credentials — et ne devrait avoir que les permissions dont il
a spécifiquement besoin.

Les **Groupes** sont des collections d'utilisateurs. Au lieu de définir des permissions pour Maya, Tom,
Priya et Leo individuellement, vous créez un groupe « Développeurs » avec les permissions de développeur
et vous les y ajoutez. Quand une cinquième personne rejoint, vous l'ajoutez au groupe et elle hérite
instantanément des bonnes permissions.

Les **Rôles** sont des identités temporaires qui peuvent être *assumées* par quelque chose — une personne, un
service, ou un autre compte AWS. Nous approfondirons les rôles au Chapitre 14. Pour l'instant : si
un Utilisateur est un employé permanent, un Rôle est un badge de visiteur. Il accorde un accès spécifique
pour un moment ou un but spécifique.

Les **Politiques** sont les règles de permission réelles. Une politique est un document (écrit en JSON
en interne, mais vous n'avez pas besoin d'en mémoriser le format) qui dit : « Le détenteur de cette
politique est AUTORISÉ à effectuer l'action X sur la ressource Y. » Ou « REFUSÉ l'action Z. »

Le modèle d'évaluation IAM est : par défaut, tout est refusé. Les permissions doivent être
explicitement accordées. Si une politique ne dit pas que vous pouvez faire quelque chose, vous ne pouvez pas.

**Le principe du moindre privilège**

C'est le concept le plus important de toute la sécurité, pas seulement d'IAM.

**Donnez aux personnes et aux systèmes uniquement l'accès dont ils ont besoin pour faire leur travail. Rien de plus.**

Priya a appelé ça « le principe du moindre privilège ». Ça semble évident. En pratique,
la plupart des équipes le violent constamment — pas de façon malveillante, mais par commodité.

« Est-ce qu'on peut juste donner à Leo un accès administrateur pour qu'il puisse déployer plus vite ? »

Non.

« Est-ce qu'on peut juste utiliser le compte root pour tout ? »

Absolument pas.

Le compte root est la clé maîtresse de tout votre compte AWS. Il peut tout faire,
y compris fermer le compte lui-même. Vous devriez le créer une seule fois, configurer l'authentification
multi-facteurs, puis ne plus jamais l'utiliser pour le travail quotidien.

Priya a créé des utilisateurs IAM séparés pour tout le monde cet après-midi. Elle a donné à Leo les permissions
de déployer vers l'environnement de développement. Pas la production. Pas la facturation. Pas la mise en réseau.
Juste le déploiement.

« C'est restrictif », dit Leo.

« C'est comme ça que vous savez que c'est juste », répondit Priya.

**Ce qui se passe quand vous vous trompez**

Trois scénarios, par ordre de gravité croissante :

**Scénario 1** : Un employé avec accès administrateur quitte l'entreprise. Personne ne désactive
son compte. Trois mois plus tard, il a toujours accès. Ça arrive constamment.
IAM le résout : vous désactivez l'utilisateur. Instantanément, partout.

**Scénario 2** : L'ordinateur portable d'un développeur est compromis. L'attaquant trouve des credentials AWS
stockés dans un fichier de configuration avec des permissions d'administrateur complet. Parce que les credentials ont un large
accès, l'attaquant peut tout faire : miner des cryptomonnaies, voler des données, supprimer des sauvegardes.
Avec le moindre privilège : les credentials ne fonctionnent que pour leur portée limitée. Le rayon de l'explosion est contenu.

**Scénario 3** : Une application mal écrite expose accidentellement des credentials AWS dans ses
logs. Si ces credentials ont un large accès, vous avez une brèche catastrophique. S'ils ont
un accès étroit — uniquement vers le bucket S3 spécifique dont l'application a besoin — l'exposition
est limitée et contenue.

Le schéma : l'accès doit être limité au minimum. Toujours. Pas parce que vous vous méfiez
de vos personnes, mais parce que vous ne pouvez pas contrôler ce qui arrive aux credentials compromis.

**Authentification multi-facteurs : Le second verrou**

Encore un concept avant de terminer le chapitre.

Même avec le moindre privilège, les credentials peuvent être volés. Les mots de passe peuvent être devinés,
hameçonnés ou fuités. IAM répond à ça avec **l'Authentification Multi-Facteurs (MFA)**.

La MFA nécessite quelque chose que vous *savez* (mot de passe) plus quelque chose que vous *avez* (un téléphone, une
clé matérielle). Même si un attaquant vole votre mot de passe, il ne peut pas se connecter sans
avoir aussi votre téléphone.

La MFA devrait être activée pour chaque utilisateur IAM. Elle est non négociable pour le compte root.

Priya a passé l'après-midi à la configurer pour tout le monde.

Tom a demandé si c'était trop de friction. Priya a ressorti l'histoire de la brèche.

Tom a configuré la MFA immédiatement.

## Forces et limites

**IAM est le bon outil pour** : contrôler qui et quoi peut accéder à chaque ressource AWS ; implémenter le moindre privilège entre les utilisateurs, les services et les limites inter-comptes ; générer une piste d'audit de chaque appel API via l'intégration CloudTrail ; éliminer le besoin de partager des credentials durables entre les systèmes.

**Là où IAM devient difficile** : Les politiques IAM peuvent se transformer en centaines de déclarations sur des dizaines de rôles, et déboguer une erreur « Accès refusé » nécessite de comprendre laquelle de ces politiques est celle qui s'applique effectivement — une tâche plus difficile qu'elle n'en a l'air. L'erreur IAM la plus courante n'est pas un accès insuffisant — c'est trop d'accès. Des politiques trop permissives créées pour « juste faire fonctionner les choses » deviennent des passifs de sécurité douloureux à annuler après coup. Écrivez la permission minimale d'abord. Élargissez uniquement quand quelque chose échoue.

## Résumé

- **IAM** (Identity and Access Management) est la façon dont vous contrôlez qui peut faire quoi dans AWS.
- Les éléments constitutifs fondamentaux sont : les **Utilisateurs** (individus), les **Groupes** (collections d'
  utilisateurs), les **Rôles** (identités temporaires), et les **Politiques** (règles de permission).
- Par défaut, tout dans AWS est **refusé**. Les permissions doivent être explicitement accordées.
- Le **Principe du moindre privilège** signifie donner à chaque identité uniquement l'accès dont elle
  a besoin. Pas plus.
- Le **compte root** peut tout faire, y compris des choses catastrophiques. Verrouillez-le derrière
  la MFA et utilisez-le le moins possible.
- Activez la **MFA** pour chaque utilisateur IAM. Non négociable.

## Conseils pour l'examen

*Domaine SAA-C03 1 — Tâche 1.1 (accès sécurisé aux ressources AWS)*

- **Tout est refusé par défaut.** Un « Autoriser » explicite est requis. Si une politique
  ne mentionne pas une action, l'action est refusée.
- **Refus explicite gagne toujours.** Si une politique dans la chaîne refuse une action, ce
  refus ne peut pas être annulé par un Autoriser ailleurs dans la chaîne. Cela prend beaucoup de candidats par surprise.
- **Compte root ≠ administrateur IAM.** Le compte root est un credential séparé d'IAM.
  Vous ne pouvez pas supprimer le compte root. Vous *pouvez* (et devriez) limiter quand il est utilisé.
- **IAM est global**, pas Régional. Les utilisateurs, groupes, rôles et politiques IAM existent
  sur l'ensemble du compte AWS, pas par Région.
- **Les Rôles sont la façon préférée d'accorder l'accès aux services AWS.** Si une instance EC2
  a besoin d'accéder à S3, vous attachez un Rôle IAM à l'instance — vous ne stockez pas
  de credentials sur la machine. Ce schéma apparaît constamment à l'examen.

## Exercices

**Exercice 1 — Mémorisation**

Dans vos propres mots : quelle est la différence entre un Utilisateur IAM, un Groupe et un Rôle ?
Quand utiliseriez-vous chacun ?

*(Indice : Pensez à l'analogie du bâtiment avec des badges — lequel est un badge permanent,
lequel est un regroupement de département, et lequel est un badge de visiteur ?)*

**Exercice 2 — Entraînement à l'examen**

*Scénario* : Une entreprise fait tourner une application web sur des instances EC2 qui doivent lire des fichiers
d'un bucket S3. Un développeur junior suggère de stocker les clés d'accès AWS directement dans
le code de l'application sur les instances EC2. L'équipe de sécurité s'y oppose.

Quelle est la solution LA PLUS sécurisée et opérationnellement appropriée ?

A) Stocker les clés d'accès dans des variables d'environnement sur l'instance EC2 au lieu du
   code  
B) Créer un utilisateur IAM dédié avec des permissions de lecture S3 et partager les credentials
   avec l'équipe de développement  
C) Attacher un Rôle IAM avec les permissions de lecture S3 appropriées directement aux instances EC2  
D) Utiliser les credentials du compte root pour donner à l'application un accès complet à toutes les ressources AWS

**Indice 1** : Le problème avec le stockage de credentials n'importe où sur l'instance est que
les credentials peuvent fuiter. Y a-t-il un moyen de donner à l'instance EC2 un accès sans
utiliser de credentials du tout ?

**Indice 2** : AWS a un mécanisme où les services peuvent recevoir des permissions sans
avoir besoin de credentials statiques. Comment ce mécanisme s'appelle-t-il ?

**Indice 3** : Les Rôles IAM peuvent être attachés aux instances EC2. Quand ils le sont, l'instance
reçoit automatiquement des credentials temporaires qui sont renouvelés par AWS. Pas de credentials
statiques nécessaires.

**Réponse** : C

**Explication** : Attacher un Rôle IAM à une instance EC2 est le bon schéma.
L'instance reçoit automatiquement des credentials temporaires et renouvelés via le service
de métadonnées EC2. Il n'y a pas de credentials durables à faire fuiter, renouveler, ou accidentellement
committer dans un dépôt.

**Pourquoi pas A ?** Les variables d'environnement sur une instance EC2 peuvent toujours fuiter —
via des logs d'application, des endpoints de débogage, ou si l'instance est compromise.
Les credentials statiques sont le problème, pas leur emplacement.

**Pourquoi pas B ?** Créer un utilisateur IAM partagé et distribuer des credentials à une équipe
viole le moindre privilège et rend le renouvellement des credentials un cauchemar. Si une personne
part, vous ne pouvez pas facilement révoquer juste son accès sans changer les credentials partagés.

**Pourquoi pas D ?** Utiliser les credentials du compte root pour toute application est une violation
grave de la sécurité. Le compte root a un accès illimité et ses credentials ne devraient jamais
quitter le contrôle du propriétaire du compte.

*Domaine SAA-C03 1 — Tâche 1.1 (rôles IAM, moindre privilège)*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus intègre trois nouveaux développeurs le mois prochain. Chacun aura besoin de niveaux d'accès différents :
l'un travaille sur la couche base de données, l'un sur les serveurs d'application, l'un sur les
fichiers statiques du front-end. Il y a aussi un pipeline CI/CD qui a besoin de déployer du code.

Concevez une structure IAM pour ce scénario. Quels utilisateurs, groupes, rôles et politiques
créeriez-vous ? Quelle serait la limite de moindre privilège la plus importante à appliquer ?

*(Il n'y a pas de réponse unique correcte. Pensez à minimiser le rayon de l'explosion si l'une
des identités est compromise.)*

## Scène post-générique

À la fin de la journée, chaque utilisateur IAM avait la MFA activée. Le compte de Leo avait été réduit
à l'accès niveau développeur : déployer vers l'environnement de développement, lire depuis le bucket de
configuration partagé, rien d'autre.

Il avait essayé, une fois, d'accéder à la base de données de production.

Accès refusé.

« Est-ce que c'est comme ça que ça fait d'être de confiance mais pas trop ? » demanda-t-il.

« C'est exactement comme ça que ça fait », dit Priya.

Le lendemain matin, Tom est arrivé tôt et a trouvé quelque chose qui lui a fait immédiatement appeler l'équipe.

Sur la console AWS, il pouvait voir que leur site web recevait du trafic. Plus que prévu. Et le serveur web —
l'original de Leo — tournait à toute vitesse. Vraiment à toute vitesse.

« On a cent utilisateurs simultanés », dit Tom. « Et un seul serveur. »

Dans le prochain chapitre : le premier serveur — louer un ordinateur dans le centre de données de quelqu'un d'autre.
