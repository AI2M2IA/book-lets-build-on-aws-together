# Chapitre 3 : Qui êtes-vous, exactement ?

Il était un peu plus de neuf heures du matin. Leo était à son bureau depuis sept heures, son café froid à côté du clavier. Le bureau était calme — Maya n'était pas encore arrivée, Tom était en appel. Dehors, quelqu'un tondait une pelouse.

Leo tapa la commande une fois de plus.

Le terminal retourna deux mots : Accès refusé.

La crise de Singapour était derrière eux. La région était corrigée, le serveur tournait dans us-west-2, et l'équipe se sentait brièvement compétente. Ce sentiment avait duré environ quarante-huit heures avant que le nouveau problème ne fasse surface : Leo ne pouvait pas déployer en production. Personne n'avait configuré ses permissions. Personne n'avait configuré les permissions de qui que ce soit. Le compte AWS était grand ouvert au niveau root et verrouillé partout ailleurs, et personne ne l'avait remarqué parce que personne n'avait essayé.

« Je l'ai déjà déployée — oh », marmonna Leo en faisant défiler son terminal. Il déployait vers ce qu'il croyait être la production depuis une semaine. C'était le staging. Le véritable environnement de production n'avait jamais été touché.

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
soit vous ne l'avez pas. Si vous l'avez, vous pouvez faire tout ce que le compte est autorisé à faire.

C'est bien pour un seul utilisateur sur son ordinateur personnel. C'est catastrophique pour
l'infrastructure cloud d'une entreprise.

Considérez ce que Nimbus a besoin de gérer : le serveur web, la base de données, le stockage de fichiers,
la mise en réseau, les alertes de facturation, les comptes utilisateurs. Si tout est protégé par un seul mot de passe —
ou même un seul ensemble de credentials — alors quiconque obtient ce mot de passe obtient tout.

Et « tout » sur AWS signifie la capacité de supprimer des bases de données. Lancer des serveurs qui génèrent
une facture de 50 000 $. Exfiltrer chaque enregistrement client. Détruire les données de sauvegarde.

Il y a un autre problème au-delà de la nature binaire des mots de passe : les mots de passe sont statiques.
Ils n'expirent pas automatiquement. Ils sont souvent réutilisés entre les services. Ils se notent
sur papier. Ils se stockent dans des feuilles de calcul intitulées « mots de passe NE PAS PARTAGER ». Ils se partagent
quand même, parce que la commodité l'emporte sur la sécurité quand le mécanisme de sécurité est une friction.

Le problème des « credentials partagés » n'est pas un défaut de caractère. C'est un problème de systèmes. Quand
le seul moyen d'accorder à quelqu'un un accès temporaire à un système est de lui donner le mot de passe
permanent, les gens partagent les mots de passe. La solution est de construire un système où un accès temporaire et
limité est le comportement par défaut — pas une solution de contournement qui exige un effort héroïque.

C'est ce que fait IAM. Pas juste « de meilleurs mots de passe », mais un modèle fondamentalement différent
où l'accès est défini par l'identité et la politique plutôt que par qui connaît une chaîne de
caractères.

Priya n'a pas décrit ça en termes calmes et abstraits. Elle l'a décrit comme une histoire.

**La brèche qui a coûté 80 000 $ en quatre heures**

Un développeur dans une startup a poussé un script de déploiement GitHub Actions vers son dépôt public. Le script contenait des credentials AWS codés en dur en tant que variables d'environnement — une erreur assez courante pour avoir sa propre catégorie dans les post-mortems de sécurité cloud. Les credentials avaient un accès administrateur complet au compte AWS de l'entreprise, parce que quelqu'un les avait configurés ainsi six mois plus tôt pour éviter de s'occuper des politiques IAM.

Les credentials sont restés dans le fichier pendant environ six minutes avant qu'un scanner automatisé — exécuté par un attaquant, pas un chercheur en sécurité — ne les trouve.

Le scanner a indexé les credentials, évalué les permissions du compte, et commencé à lancer des instances GPU dans plusieurs régions. Les instances GPU sont chères. Elles sont aussi utiles pour le minage de cryptomonnaie. Dans la première heure, quarante-sept instances `p3.8xlarge` tournaient à travers `us-east-1`, `eu-west-1` et `ap-southeast-1`.

Une `p3.8xlarge` coûte environ 12 $ de l'heure. Quarante-sept d'entre elles coûtent 564 $ de l'heure.

Au moment où l'alerte de facturation de la startup s'est déclenchée — configurée à 1 000 $ par jour, ce que personne n'avait pensé à resserrer — quatre heures s'étaient écoulées. La facture approchait les 2 200 $ et grimpait.

Au moment où quelqu'un a compris ce qui se passait et révoqué les credentials, la facture avait atteint 3 400 $ pour ces quelques heures. Mais le vrai coût est venu plus tard : l'audit a révélé que l'attaquant minait déjà depuis des semaines, discrètement, la nuit, en utilisant un second jeu de credentials fuités que personne n'avait remarqué. Dommage total au moment où l'audit s'est terminé : plus de 80 000 $.

« Et ils ont fermé ? » demanda Tom.

« Trois mois plus tard », dit Priya. « Les investisseurs se sont retirés. La brèche a été divulguée. La couverture médiatique a rendu la levée de fonds impossible. »

La salle était silencieuse.

« Alors quelle est l'alternative ? » demanda Tom.

**Le concept : Gestion des identités et des accès**

L'alternative est un système où vous ne donnez pas à tout le monde la même clé.

Imaginez un immeuble de bureaux où chaque étage a des zones différentes, et chaque employé
a un badge qui n'ouvre que les portes dont il a besoin pour son travail. Le badge du stagiaire
fonctionne au troisième étage. Le badge du comptable ouvre le bureau des finances mais pas
la salle des serveurs. Personne ne franchit une porte qu'il n'a aucune raison de franchir.

C'est le modèle qu'AWS utilise.

AWS appelle ce système **IAM** : Identity and Access Management (Gestion des identités et des accès).

IAM est le système de badges pour tout votre compte cloud. Vous définissez qui existe
(identités), ce qu'ils sont autorisés à faire (permissions), et appliquez ces permissions
via des politiques. L'immeuble a des dizaines d'étages. IAM s'assure que chaque personne ne peut
atteindre que les étages dont elle a besoin.

L'analogie du badge va plus loin. Dans un immeuble bien géré, vous savez à tout moment qui a accès à quoi. Vous pouvez imprimer un rapport : voici les droits d'accès de chaque badge. Voici qui a été dans la salle des serveurs ces 30 derniers jours. Voici les badges qui n'ont pas été utilisés depuis 90 jours (un indicateur possible du badge d'un employé licencié qui n'a pas été désactivé).

IAM fournit la même visibilité. Chaque action effectuée via IAM — chaque appel API, chaque connexion à la console, chaque octroi de permission — est journalisée dans **AWS CloudTrail**. Si vous devez savoir qui a supprimé une base de données à 2 h du matin un mardi, CloudTrail a la réponse. Si vous devez démontrer à un auditeur que seuls les utilisateurs autorisés avaient accès aux systèmes de production, CloudTrail fournit la preuve.

AWS CloudTrail conserve automatiquement un historique de 90 jours des événements de gestion, lisible depuis la console. Mais 90 jours ont une façon de ne pas être tout à fait suffisants quand votre équipe de sécurité doit auditer quelque chose du trimestre dernier. Pour une journalisation persistante et à long terme — et pour les alertes — vous devez créer un **Trail**, qui écrit tous les événements dans un bucket S3 et peut diffuser vers CloudWatch Logs. Le Trail n'est pas automatique ; c'est quelque chose que vous configurez une fois puis oubliez. Jusqu'à ce que vous en ayez besoin.

La combinaison des contrôles d'accès d'IAM et de la journalisation d'audit de CloudTrail est ce qui permet aux grandes organisations de faire tourner des comptes AWS à grande échelle en toute confiance : l'accès est défini et appliqué par IAM ; chaque exercice de cet accès est enregistré par CloudTrail.

**L'analogie de l'hôpital**

Voici une deuxième façon d'y penser — une qui rend la hiérarchie des accès plus intuitive.

Imaginez un hôpital. Pas seulement le bâtiment physique, mais toute la structure organisationnelle des personnes, des rôles et des données.

Le **réceptionniste** peut voir les calendriers de rendez-vous des patients et les informations d'assurance. Il peut enregistrer les arrivées et départs des patients. Il ne peut pas accéder aux dossiers médicaux, ne peut pas modifier les ordonnances, ne peut pas consulter les antécédents chirurgicaux.

L'**infirmier** peut accéder aux dossiers médicaux des patients de son service. Il peut administrer des médicaments selon les ordres du médecin. Il ne peut pas prescrire de médicaments. Il ne peut pas autoriser de chirurgies.

Le **médecin** peut consulter et modifier les dossiers médicaux, rédiger des ordonnances, et prescrire des examens. Il ne peut pas accéder au système de paie. Il ne peut pas modifier les ordonnances d'autres médecins sans une dérogation spécifique.

Le **chirurgien** peut accéder aux systèmes du bloc opératoire. Il a des permissions spécifiques pour les dossiers chirurgicaux dont la plupart des médecins n'ont pas besoin.

Le **personnel d'entretien** peut accéder aux plans d'étage et aux calendriers des salles. Il ne peut accéder à aucune donnée de patient.

Chaque personne dans l'hôpital a l'accès dont elle a besoin pour son travail — et seulement celui-là. Le réceptionniste n'a pas d'accès chirurgical. Le personnel d'entretien ne voit pas les dossiers des patients. Et surtout : si le badge d'un membre du personnel d'entretien est volé, l'attaquant obtient les calendriers de ménage. Il n'obtient pas les dossiers des patients. Le rayon de l'explosion de la brèche est limité à ce à quoi ce badge pouvait accéder.

C'est ainsi qu'IAM fonctionne. Chaque identité — chaque utilisateur, chaque service, chaque processus automatisé — obtient exactement les permissions dont elle a besoin. Rien de plus.

Tom se renversa en arrière. « Donc Leo est l'infirmier, et je suis le comptable. »

« Quelque chose comme ça », dit Priya. « Et aucun de vous deux n'est le chirurgien. »

« Qui est le chirurgien ? »

« Personne, au quotidien », dit Priya. « Le compte root est le chirurgien. Il ne sort que pour des procédures spécifiques et documentées. »

**Les éléments constitutifs d'IAM**

IAM a quatre concepts fondamentaux. Ils s'appuient les uns sur les autres.

Les **Utilisateurs** sont des identités individuelles. Maya a un utilisateur IAM. Tom a un utilisateur IAM.
Chaque utilisateur a ses propres credentials — et ne devrait avoir que les permissions dont il
a spécifiquement besoin.

Un utilisateur IAM a deux types de credentials : un **mot de passe** pour l'accès à la console (se connecter à l'interface web AWS) et des **clés d'accès** (un ID de clé et une clé secrète) pour l'accès programmatique via la CLI ou les SDK. Vous n'avez pas toujours besoin des deux. Un développeur qui n'utilise que la CLI n'a pas besoin de mot de passe de console. Un utilisateur non technique qui n'a besoin que de la console n'a pas besoin de clés d'accès. N'accordez que ce qui est nécessaire.

Les **Groupes** sont des collections d'utilisateurs. Au lieu de définir des permissions pour Maya, Tom,
Priya et Leo individuellement, vous créez un groupe « Développeurs » avec les permissions de développeur
et vous les y ajoutez. Quand une cinquième personne rejoint, vous l'ajoutez au groupe et elle hérite
instantanément des bonnes permissions.

L'avantage pratique des groupes est la maintenabilité. Si le groupe « Développeurs » a besoin d'une nouvelle permission — disons, l'accès à un nouveau bucket S3 — vous l'ajoutez au groupe une fois et tous les développeurs l'ont immédiatement. Sans les groupes, vous mettriez à jour chaque utilisateur individuellement, ce qui crée des occasions d'incohérence et oublie des personnes.

Les **Rôles** sont des identités temporaires qui peuvent être *assumées* par quelque chose — une personne, un
service, ou un autre compte AWS. Nous approfondirons les rôles au Chapitre 14. Pour l'instant : si
un Utilisateur est un employé permanent, un Rôle est un badge de visiteur. Il accorde un accès spécifique
pour un moment ou un but spécifique.

L'usage le plus important des Rôles pour ce chapitre : les Rôles IAM pour les instances EC2. Quand vous attachez un Rôle à une instance EC2, l'application tournant sur cette instance peut faire des appels API AWS en utilisant les permissions du Rôle — sans aucun credential statique stocké où que ce soit. Les credentials sont temporaires, renouvelés automatiquement par AWS, et limités aux politiques du Rôle. Cela élimine entièrement le problème des « credentials dans les fichiers de configuration ».

Les **Politiques** sont les règles de permission réelles. Une politique est un document (écrit en JSON
en interne, mais vous n'avez pas besoin d'en mémoriser le format) qui dit : « Le détenteur de cette
politique est AUTORISÉ à effectuer l'action X sur la ressource Y. » Ou « REFUSÉ l'action Z. »

AWS fournit des centaines de **politiques managées** — des politiques pré-écrites pour les cas d'usage courants. `AmazonS3ReadOnlyAccess` accorde un accès en lecture à tous les buckets S3. `AmazonEC2FullAccess` accorde le contrôle complet d'EC2. Pour un usage en production, vous voulez souvent des **politiques managées par le client** — des politiques que vous écrivez vous-même, limitées précisément aux ressources et actions dont votre application a réellement besoin.

Le modèle d'évaluation IAM est : par défaut, tout est refusé. Les permissions doivent être
explicitement accordées. Si une politique ne dit pas que vous pouvez faire quelque chose, vous ne pouvez pas.

**Le principe du moindre privilège**

Donnez aux personnes et aux systèmes uniquement l'accès dont ils ont besoin pour faire leur travail. Rien de plus.

Priya a appelé ça « le principe du moindre privilège ». Ça semble évident. En pratique,
la plupart des équipes le violent constamment — pas de façon malveillante, mais par commodité.

« Est-ce qu'on peut juste donner à Leo un accès administrateur pour qu'il puisse déployer plus vite ? »

Non.

« Est-ce qu'on peut juste utiliser le compte root pour tout ? »

Absolument pas.

Le compte root est la clé maîtresse de tout votre compte AWS. Il peut tout faire,
y compris fermer le compte lui-même. Vous devriez le créer une seule fois, configurer l'authentification
multi-facteurs, puis ne plus jamais l'utiliser pour le travail quotidien.

Il y a exactement une poignée de tâches qui exigent le compte root : changer l'adresse e-mail du compte, consulter les informations de facturation qui ne sont pas autrement déléguées, fermer le compte, et quelques autres opérations administratives qu'AWS restreint explicitement au root. Pour tout le reste — créer des utilisateurs, déployer de l'infrastructure, accéder aux bases de données — vous utilisez des utilisateurs et des rôles IAM. Le compte root est pour le gestionnaire de l'immeuble. Tous les autres ont des badges appropriés.

Priya a créé des utilisateurs IAM séparés pour tout le monde cet après-midi-là. Elle a donné à Leo les permissions
de déployer vers l'environnement de développement. Pas la production. Pas la facturation. Pas la mise en réseau.
Juste le déploiement.

« C'est restrictif », dit Leo.

« C'est comme ça que vous savez que c'est juste », répondit Priya.

La frontière développement-versus-production était la première et la plus importante ligne de moindre privilège que Priya a tracée. Les développeurs avaient besoin d'aller vite en développement : créer des ressources, tester des configurations, faire des erreurs. Mais la production était différente. Les changements en production devaient être délibérés, revus, et exécutés via un processus contrôlé. Donner à un développeur un accès direct à la production, c'était lui donner la capacité de faire des erreurs en production à la vitesse du développement.

Avec le temps, Priya a construit un système où l'accès à la production était accordé temporairement via un processus d'assomption de rôle : un développeur qui avait besoin de faire un changement en production demandait l'accès, l'obtenait pour une fenêtre de 4 heures, faisait le changement, et l'accès expirait automatiquement. La fenêtre était journalisée dans CloudTrail. L'accès ne pouvait pas être utilisé après son expiration. La production était protégée non pas en refusant l'accès de façon permanente, mais en rendant l'accès limité dans le temps et auditable.

Vous vous demandez peut-être : si tout est refusé par défaut, pourquoi le compte root a-t-il un accès complet ? Le compte root est spécial — il contourne IAM entièrement. C'est précisément pourquoi vous le mettez sous clé. Toute autre action dans AWS passe par la chaîne d'évaluation d'IAM, où un Allow manquant équivaut à un Deny.

**Rayon de l'explosion : pourquoi le moindre privilège sauve les entreprises**

Il y a un concept que les ingénieurs en sécurité utilisent pour penser à la compromission de credentials : le **rayon de l'explosion** (blast radius).

Le rayon de l'explosion est le dommage maximal qu'un attaquant peut causer s'il obtient un credential donné.

Un attaquant avec les credentials root d'un compte AWS a un rayon d'explosion illimité. Il peut supprimer chaque ressource, exfiltrer chaque octet de données, lancer des instances GPU dans chaque Région, et fermer le compte. Le credential lui-même ne contient aucune limite.

Un attaquant avec les credentials IAM de Leo — limités au déploiement vers l'environnement de développement et à la lecture d'un bucket S3 — a un rayon d'explosion minuscule. Il peut déployer en dev. Il peut lire quelques fichiers. Il ne peut pas toucher à la production. Il ne peut pas accéder à la base de données. Il ne peut pas voir la facturation. Il ne peut pas lancer d'instances GPU.

L'histoire de la brèche du début avait un grand rayon d'explosion parce que les credentials du développeur étaient ceux d'un administrateur. Si ces mêmes credentials avaient été limités à leur travail réel — déployer vers un environnement spécifique — le dommage aurait été bien moindre. L'attaque aurait quand même pu se produire. Le résultat aurait été différent.

C'est pourquoi le moindre privilège n'est pas qu'une politique. C'est de l'architecture. Chaque permission que vous n'accordez pas est du rayon d'explosion que vous n'avez pas.

**Ce qui se passe quand vous vous trompez**

Trois scénarios, par ordre de gravité croissante :

**Scénario 1** : Un employé avec accès administrateur quitte l'entreprise. Personne ne désactive
son compte. Trois mois plus tard, il a toujours accès. Ça arrive constamment.
IAM le résout : vous désactivez l'utilisateur. Instantanément, partout.

C'est le mode de défaillance IAM le plus courant, et il est entièrement évitable. La plupart des organisations
ont un processus pour révoquer l'accès physique (rendre un badge, rendre un ordinateur portable) mais
négligent IAM. La liste de contrôle de départ qui inclut « désactiver l'utilisateur IAM » et
« retirer de tous les groupes IAM » n'est pas un défi d'ingénierie complexe — c'est de la
discipline de processus. Les équipes qui le font systématiquement sont celles qui ne découvrent jamais ce qui
se passe quand un ex-employé peut encore accéder à la base de données de production.

**Scénario 2** : L'ordinateur portable d'un développeur est compromis. L'attaquant trouve des credentials AWS
stockés dans un fichier de configuration avec des permissions d'administrateur complet. Parce que les credentials ont un large
accès, l'attaquant peut tout faire : miner des cryptomonnaies, voler des données, supprimer des sauvegardes.
Avec le moindre privilège : les credentials ne fonctionnent que pour leur portée limitée. Le rayon de l'explosion est contenu.

Le schéma des credentials-dans-un-fichier-de-configuration est plus courant qu'il ne devrait l'être. Les développeurs
stockent souvent des credentials AWS dans `~/.aws/credentials` pour le développement local — ce qui est
bien. Le problème, c'est quand ces credentials ont un accès de niveau production au lieu d'être
limités à un environnement bac à sable. Les credentials de développement devraient être limités à un
environnement de développement. L'accès à la production devrait exiger des étapes explicites pour l'assumer, et non pas
être présent sur chaque ordinateur portable en permanence.

**Scénario 3** : Une application mal écrite expose accidentellement des credentials AWS dans ses
logs. Si ces credentials ont un large accès, vous avez une brèche catastrophique. S'ils ont
un accès étroit — uniquement vers le bucket S3 spécifique dont l'application a besoin — l'exposition
est limitée et contenue.

Le scénario des credentials-d'application-dans-les-logs est subtil. Il arrive souvent quand du code
de débogage journalise tout le contexte de la requête — y compris les en-têtes d'autorisation — ou quand un
gestionnaire d'erreurs sérialise toutes les variables d'environnement (y compris `AWS_ACCESS_KEY_ID`) vers un fichier
de log. La protection ici est les Rôles IAM pour EC2, qui éliminent entièrement les credentials statiques de
l'environnement de l'application. S'il n'y a pas de credentials statiques, ils ne peuvent pas
apparaître dans les logs.

Le schéma : l'accès doit être limité au minimum. Toujours. Pas parce que vous vous méfiez
de vos personnes, mais parce que vous ne pouvez pas contrôler ce qui arrive aux credentials compromis.

**Si large accès alors commodité mais exposition**

Il y a toujours une tentation de donner aux équipes un accès plus large que ce dont elles ont besoin — ça rend
les déploiements plus rapides, réduit la friction, évite les moments « Accès refusé » qui cassent
le flux. Si vous donnez à tout le monde un accès administrateur, alors les déploiements sont fluides et personne n'est
bloqué — mais quand les credentials fuitent (et ils fuitent), l'attaquant hérite des droits
d'administrateur complet. Un seul ordinateur portable compromis devient une brèche complète du compte. Écrivez la permission
minimale d'abord. Élargissez uniquement quand quelque chose échoue. Cette règle sauve les entreprises.

**Authentification multi-facteurs : Le second verrou**

Même avec le moindre privilège, les credentials peuvent être volés. Les mots de passe peuvent être devinés,
hameçonnés ou fuités. IAM répond à ça avec **l'Authentification Multi-Facteurs (MFA)**.

La MFA nécessite quelque chose que vous *savez* (mot de passe) plus quelque chose que vous *avez* (un téléphone, une
clé matérielle). Même si un attaquant vole votre mot de passe, il ne peut pas se connecter sans
avoir aussi votre téléphone.

La MFA devrait être activée pour chaque utilisateur IAM. Elle est non négociable pour le compte root.

Priya a passé l'après-midi à la configurer pour tout le monde. Ça ne s'est pas bien passé.

L'application d'authentification de Leo a enregistré le mauvais compte deux fois. Il a dû scanner le code QR trois fois parce que l'horloge de son ordinateur portable était légèrement désynchronisée, ce qui faisait échouer les jetons basés sur le temps. À la troisième tentative, ça a fonctionné.

« Y a-t-il un moyen de faire ça sans l'application ? » demanda Leo en regardant son téléphone.

« Des clés matérielles », dit Priya. « Un appareil physique qui se branche en USB. Plus sécurisé que l'application. Plus cher. »

« Combien plus cher ? »

« Environ 50 $ par clé. Vous en voudriez deux, au cas où vous en perdez une. »

Tom écrivit « 100 $ par développeur » dans son carnet.

« On les achète », dit Priya. « Pour le compte root au minimum. »

Tom demanda si c'était trop de friction globalement. Priya ressortit l'histoire de la brèche.

Tom configura la MFA immédiatement.

« Et si quelqu'un essaie d'entrer par effraction pendant qu'on est au milieu de cette transition ? » demanda Priya. « Avant que tout le monde ait la MFA activée ? »

Personne n'avait de bonne réponse. Elle configura la MFA pour le compte root en premier, avant tout le monde.

**IAM Access Analyzer : La deuxième paire d'yeux**

Priya avait un dernier outil à montrer à l'équipe une fois la configuration de la MFA terminée.

« Celui-ci tourne automatiquement », dit-elle en ouvrant un nouvel onglet de console.

**IAM Access Analyzer** est un service qui analyse en continu vos politiques IAM et signale tout ce qui accorde un accès à des ressources en dehors de votre compte — ou en dehors de ce à quoi vous vous attendriez.

Il a trouvé quelque chose dès la première exécution.

Un bucket S3 — un que Leo avait configuré comme « temporaire » il y a trois semaines puis oublié — avait une politique de bucket qui autorisait l'accès public en lecture. Le bucket contenait quelques fichiers de données de test, rien de sensible. Mais il contenait aussi un dossier que Leo avait nommé `db-backups-staging` et rempli de quelques fichiers SQL exportés pour tester le processus d'import.

« Y a-t-il quelque chose de sensible dans ces fichiers SQL ? » demanda Priya.

Leo regarda le nom du dossier. Puis les fichiers à l'intérieur. Puis le plafond.

« J'ai exporté la base de données de staging », dit-il. « Qui a des copies de données clients de production des débuts. »

Priya ferma lentement son ordinateur portable.

Le bucket fut mis en privé en moins de cinq minutes. Access Analyzer continua à surveiller toute politique future qui ouvrirait des ressources de façon inattendue.

« Pensez-y comme une alarme de périmètre », dit Priya. « Chaque fois que quelqu'un laisse accidentellement une porte ouverte, ça nous le dit. »

Vous vous demandez peut-être : IAM Access Analyzer remplace-t-il la revue manuelle des politiques ? Non. C'est un outil de détection, pas un outil de prévention. Il vous informe de l'accès qui a été accordé — il ne peut pas vous dire si cet accès était intentionnel. La revue humaine du « est-ce que cette politique était correcte ? » doit toujours avoir lieu. Access Analyzer s'assure juste que les fenêtres ouvertes ne passent pas inaperçues.

## Forces et limites

**IAM est le bon outil pour** :

- Contrôler qui et quoi peut accéder à chaque ressource AWS
- Implémenter le moindre privilège entre les utilisateurs, les services et les limites inter-comptes
- Éliminer le besoin de partager des credentials durables entre les systèmes
- Chaque action IAM est journalisée automatiquement, vous donnant une piste d'audit de qui a fait quoi et quand (couvert au Chapitre 14)
- Accès inter-comptes : un Rôle IAM dans le Compte A peut être assumé par un principal dans le Compte B, permettant un partage contrôlé des ressources entre comptes AWS sans partage de credentials

**Là où IAM devient difficile** : Les politiques IAM peuvent se transformer en centaines de déclarations sur des dizaines de rôles, et déboguer une erreur « Accès refusé » nécessite de comprendre laquelle de ces politiques est celle qui s'applique effectivement — une tâche plus difficile qu'elle n'en a l'air. L'erreur IAM la plus courante n'est pas un accès insuffisant — c'est trop d'accès. Des politiques trop permissives créées pour « juste faire fonctionner les choses » deviennent des passifs de sécurité douloureux à annuler après coup. Écrivez la permission minimale d'abord. Élargissez uniquement quand quelque chose échoue.

Il y a un défi pratique avec IAM à grande échelle : la **prolifération des politiques**. Les organisations qui font tourner AWS depuis plusieurs années ont souvent des dizaines ou des centaines de politiques personnalisées, dont beaucoup se chevauchent, certaines ne sont jamais utilisées, et quelques-unes se contredisent de façons que personne n'a remarquées parce que les contradictions ne comptent que pour des cas limites. AWS fournit **IAM Access Analyzer** (que nous avons présenté dans ce chapitre) et des outils de **simulation de politiques IAM** pour aider à auditer et rationaliser les politiques. Mais la stratégie la plus efficace est de construire des politiques propres dès le départ et d'auditer régulièrement — plutôt que de laisser les politiques s'accumuler et d'essayer de les démêler plus tard.

Priya a mis en place une revue IAM trimestrielle : lister tous les rôles et politiques, vérifier lesquels sont activement utilisés via les logs CloudTrail, signaler tout credential inutilisé ou toute politique trop large pour suppression ou restriction. La revue prenait deux heures par trimestre et a détecté trois problèmes de politique dès sa première année.

« Ce n'est pas un travail passionnant », dit-elle. « Mais les revues d'accès sont la façon dont on trouve les choses qui auraient été catastrophiques si quelqu'un les avait remarquées en premier. »

## Résumé

Le mot de passe Admin123 était le symptôme. La maladie était que Nimbus n'avait aucune stratégie de contrôle d'accès du tout — un credential root partagé, pas de rôles, pas de politiques, pas de piste d'audit. IAM ne corrige pas seulement le symptôme ; il force l'équipe à répondre à une question qu'elle évitait : qui, exactement, est autorisé à faire quoi ? La réponse à cette question est la fondation de toute architecture AWS sécurisée.

- **IAM** (Identity and Access Management) est la façon dont vous contrôlez qui peut faire quoi dans AWS. Les éléments constitutifs fondamentaux sont : les **Utilisateurs**, les **Groupes**, les **Rôles** et les **Politiques**.
- Par défaut, tout dans AWS est **refusé**. Les permissions doivent être explicitement accordées.
- Le **Principe du moindre privilège** signifie donner à chaque identité uniquement l'accès dont elle a besoin — minimisant le **rayon de l'explosion** si un credential est un jour compromis.
- Le **compte root** peut tout faire, y compris des choses catastrophiques. Verrouillez-le derrière la MFA et utilisez-le le moins possible.
- Activez la **MFA** pour chaque utilisateur IAM. Non négociable — à l'examen et en production.

## Conseils pour l'examen

*Domaine SAA-C03 1 — Tâche 1.1 (accès sécurisé aux ressources AWS)*

- **Tout est refusé par défaut.** Un « Autoriser » explicite est requis. Si une politique
  ne mentionne pas une action, l'action est refusée.
- **Le refus explicite gagne toujours.** Si une politique dans la chaîne refuse une action, ce
  refus ne peut pas être annulé par un Autoriser ailleurs dans la chaîne. Cela prend beaucoup de
  candidats par surprise.
- **Compte root ≠ administrateur IAM.** Le compte root est un credential séparé d'IAM.
  Vous ne pouvez pas supprimer le compte root. Vous *pouvez* (et devriez) limiter quand il est utilisé.
- **IAM est global**, pas Régional. Les utilisateurs, groupes, rôles et politiques IAM existent
  sur l'ensemble du compte AWS, pas par Région.
- **Les Rôles sont la façon préférée d'accorder l'accès aux services AWS.** Si une instance EC2
  a besoin d'accéder à S3, vous attachez un Rôle IAM à l'instance — vous ne stockez pas
  de credentials sur la machine. Ce schéma apparaît constamment à l'examen.
- **IAM Access Analyzer** génère des constatations quand des ressources sont accessibles depuis l'extérieur du compte ou depuis l'extérieur de l'organisation. Quand un scénario d'examen mentionne la détection d'un accès externe non intentionnel à S3 ou KMS, Access Analyzer est la réponse.
- **La MFA pour le compte root est obligatoire**, pas optionnelle, dans le contexte des bonnes pratiques de sécurité AWS. Les questions d'examen sur la sécurisation du compte root incluent toujours la MFA dans la bonne réponse.
- **Les limites de permission** (permission boundaries) sont une fonctionnalité IAM avancée (couverte au Chapitre 14) qui limite les permissions maximales qu'un utilisateur ou rôle IAM peut avoir, même si ses politiques en accordent davantage. Les questions d'examen sur « empêcher l'escalade de privilèges » ou « fixer un plafond de permissions maximal » pointent vers les limites de permission.
- **Les Service Control Policies (SCP)** sont des politiques au niveau de l'organisation qui restreignent ce qui peut être fait dans les comptes membres d'une AWS Organization. Elles fonctionnent au-dessus du niveau IAM — même un administrateur de compte ne peut pas dépasser les limites fixées par une SCP. Quand un scénario d'examen implique une gouvernance de sécurité multi-comptes, pensez SCP.
- **CloudTrail** enregistre tous les appels API IAM. Quand un scénario d'examen demande « comment auditeriez-vous quels utilisateurs ont apporté des changements aux politiques IAM », la réponse est CloudTrail. Chaque action IAM — créer un utilisateur, modifier une politique, assumer un rôle — est journalisée. L'historique d'événements de 90 jours est automatique et gratuit ; pour une rétention à long terme et des alertes, vous devez créer un Trail qui livre les logs vers un bucket S3.

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

Le lendemain matin, Tom est arrivé tôt et a trouvé quelque chose qui lui a fait immédiatement appeler
l'équipe.

Sur la console AWS, il pouvait voir que leur site web recevait du trafic. Plus que
prévu. Et le serveur web — l'original de Leo — tournait à toute vitesse. Vraiment à toute vitesse.

« On a cent utilisateurs simultanés », dit Tom. « Et un seul serveur. »

Dans le prochain chapitre : le premier serveur — louer un ordinateur dans le centre de données de quelqu'un d'autre.
