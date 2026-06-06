# Épilogue : Ce que signifie architecte

*Ce chapitre est un épilogue. Il n'y a pas d'exercices, pas de conseils d'examen et pas de scène post-générique — parce qu'il n'y a pas de chapitre suivant.*

La table du coin avait la meilleure lumière du café. Par la fenêtre, l'après-midi faisait quelque chose de lent et tranquille dans la rue dehors.

Maya avait commandé du thé. Tom avait commandé un espresso. Priya avait commandé quelque chose qu'elle décrivait seulement comme « ce qu'ils étaient en train de faire quand je suis entrée ». Leo avait vingt minutes de retard, ce qui était cohérent.

Cela faisait quatorze mois depuis la Série A.

L'équipe d'ingénierie comptait maintenant dix-neuf personnes. Il y avait deux fuseaux horaires. Il y avait une équipe plateforme, une équipe produit, une équipe data. Il y avait une revue d'architecture hebdomadaire qui durait quatre-vingt-dix minutes et en nécessitait généralement plus. Le financement avait fait ce que le financement fait : les 947 partenaires restaurateurs que Maya avait présentés aux investisseurs étaient devenus 3 000, les deux villes qui étaient « en lancement » étaient actives avec trois autres, et la plateforme qui avait autrefois servi un seul restaurant familial faisait désormais tourner un coup de feu du dîner du vendredi d'une côte à l'autre.

Leo arriva avec un sac d'ordinateur portable et l'expression de quelqu'un qui avait eu trois appels avant 9 h. Il s'assit. Il commanda un café. Il dit : « D'accord. Qu'est-ce qu'on fait ? »

« On réfléchit, » dit Maya.

« À quoi ? »

Elle avait réfléchi, dans le train, à quelque chose qu'un nouveau recru avait dit lors de sa première semaine. C'était un bon ingénieur — soigneux, précis, posait de bonnes questions. Le vendredi, à la fin de sa première revue d'architecture, il avait dit : « Je veux être architecte un jour. »

Elle avait dit : « Tu prends déjà des décisions architecturales. »

Il avait l'air incertain. « Mais je suis juste un junior. »

« Moi aussi, » dit-elle. « Tout le monde dans cette pièce l'était, un jour. »

Elle raconta cette histoire à la table. Quand elle eut fini, Tom dit : « Qu'est-ce que tu voulais dire par là ? »

« Je ne suis pas sûre de l'avoir bien expliqué, » dit Maya. « C'est pour ça qu'on est là. »

Et parce que la question l'avait hantée tout le week-end.

Non pas parce que c'était flatteur d'être questionnée.

Parce que c'était le genre de question qui change la façon dont quelqu'un voit son propre avenir si vous y répondez bien.

**La question**

Qu'est-ce qu'un architecte ?

Pas le titre. Pas l'organigramme. Pas les années d'expérience listées dans une description de poste. La chose réelle.

Au cours des quatorze mois depuis le tour de financement, tous les quatre étaient devenus, formellement ou informellement, responsables des décisions architecturales chez Nimbus. Maya était officiellement CTO. Tom était Responsable Infrastructure. Priya dirigeait l'équipe plateforme. Leo était Ingénieur Principal, ce qui signifiait qu'il était consulté sur tout et ne possédait rien de spécifique, ce qu'il trouvait à la fois libérateur et parfois exaspérant.

Aucun d'eux ne s'attendait à arriver là. Maya avait étudié l'administration des affaires et géré le restaurant de sa famille — elle n'avait jamais écrit de code de production quand tout ça a commencé. Tom avait passé huit ans comme administrateur système pensant qu'il le resterait. Priya avait un diplôme d'informatique et un stage dans une entreprise de sécurité. Leo s'était autoformé au code, livrant sa première app à seize ans.

Rien de tout cela ne correspondait à la description de poste d'« architecte ».

« Voici ce que je pense que c'est, » dit Priya. « Un architecte est quelqu'un qui a accepté qu'il est responsable des conséquences de ses décisions — pas seulement de la décision elle-même. »

« Dis-en plus, » dit Leo.

« Quand tu es en début de carrière, tu prends une décision et tu passes à autre chose. Tu l'implémentes ou non. Quelqu'un d'autre la révise, l'approuve, la déploie. La conséquence d'avoir tort est que quelqu'un en amont attrape l'erreur. »

« Et plus tard ? »

« Plus tard, il n'y a personne en amont. La décision est déployée. La conséquence est la production. »

Tom hocha lentement la tête. « C'est là que tu commences à penser différemment. Non pas parce que tu en sais plus — bien que ce soit le cas — mais parce que le rayon d'impact d'avoir tort a changé. »

**Junior à architecte : la vraie progression**

La progression de l'ingénieur junior à l'architecte n'est pas une ligne droite de connaissances accumulées. C'est une série de changements dans la façon dont vous comprenez votre travail.

Les *ingénieurs juniors* demandent : Comment est-ce que je fais marcher ça ? Leur question principale est l'implémentation. Étant donné une exigence, comment produis-je un système fonctionnel ? C'est la première compétence essentielle. Tout le reste repose dessus.

Les *ingénieurs de niveau intermédiaire* demandent : Comment est-ce que je fais marcher ça correctement ? La question s'élargit pour inclure la justesse — pas seulement « est-ce que ça tourne » mais « est-ce que ça gère les cas limites, les conditions d'erreur, les entrées inattendues ». Ils commencent à penser aux tests. Ils commencent à penser à la maintenance.

Les *ingénieurs seniors* demandent : Comment est-ce que je fais marcher ça correctement *et* durablement ? L'horizon temporel s'étend. Ils pensent à l'ingénieur qui lira ce code dans un an. Ils pensent au système qui portera dix fois la charge actuelle. Ils pensent à ce qui se passe quand une dépendance change.

Les *ingénieurs staff et principaux* demandent : Pourquoi construit-on ça du tout ? Ils prennent du recul face à l'implémentation et questionnent la prémisse. Est-ce le bon problème à résoudre ? Est-ce le bon moment pour le résoudre ? Y a-t-il une approche plus simple qui renonce à la sophistication en échange de la survivabilité ?

Les *architectes* demandent : Qu'est-ce qui casse en premier, comment le savons-nous, et que fait quelqu'un à 3 h du matin quand ça arrive ?

« La question de 3 h du matin, » dit Leo. « Carlos l'a utilisée. »

« Parce que c'est vrai, » dit Priya. « C'est le test. Peux-tu écrire le runbook ? Comprends-tu suffisamment les modes de défaillance pour écrire les étapes pour quelqu'un qui est à moitié endormi et sous pression ? »

**Ce qui ne change pas**

Il y a des choses que les architectes savent que les ingénieurs juniors ne savent pas. Le comportement spécifique aux services. Les caractéristiques de défaillance à l'échelle. La dynamique organisationnelle pour faire approuver les décisions. L'histoire des décisions prises dans des contextes similaires qui n'ont pas fonctionné.

Mais la connaissance n'est pas la chose.

La chose, c'est l'ensemble de questions par défaut. Le modèle mental qui s'active quand quelqu'un décrit un problème.

Les ingénieurs juniors entendent un problème et pensent à des solutions. Les architectes entendent un problème et pensent aux contraintes, aux modes de défaillance et à l'écart entre ce que l'entreprise dit avoir besoin et ce dont elle a réellement besoin.

Non pas parce qu'ils sont plus froids.

Parce qu'ils essaient de protéger les personnes qui devront vivre à l'intérieur des conséquences.

« Ce n'est pas qu'on en sait plus, » dit Tom. « On pose d'abord des questions différentes. »

Maya était restée silencieuse un moment. Elle dit : « Quand j'ai parlé à ce nouvel ingénieur, j'ai réalisé ce que j'essayais vraiment de dire. Il demandait comment devenir architecte. Et je voulais dire : commence par remarquer ce qui casse. Pas seulement quand quelque chose est cassé — mais avant. Pendant la conception. Pendant la revue. Demande : qu'est-ce qui casse en premier ? Comment le saurons-nous ? Qui appelons-nous ? »

« Ce n'est pas un titre, » dit Leo. « C'est une habitude. »

« Oui. »

**La propriété**

L'autre chose, ils en convinrent, c'était la propriété.

Pas la propriété au sens légal. La propriété au sens psychologique : le sentiment que si ce système se dégrade, vous serez celui qui s'en souciera le plus.

En début de carrière, ce n'est pas la posture attendue. Vous êtes responsable de vos tickets, de vos PR, de vos stories assignées. Le système appartient à quelqu'un d'autre.

Plus tard, la frontière se dissout. Le système est à vous. Pas à vous seul — partagé, toujours partagé — mais à vous dans le sens où vous ressentez ses défaillances personnellement. Un incident de production à 2 h du matin n'est pas une interruption de votre vie. C'est une partie de votre travail.

« C'est le changement que je n'aurais pas pu enseigner à quiconque, » dit Tom. « Tu dois ressentir quelques pannes. Tu dois être celui qui n'a pas attrapé le mode de défaillance avant qu'il n'atteigne la production. C'est là que la question change. »


L'autre chose qu'ils remarquèrent à propos du changement, c'est qu'il ne s'était pas produit à un moment précis mais à travers une série d'incidents.

Pour Tom, ç'avait été la première fois qu'un volume EBS non étiqueté était apparu sur la facture et que personne ne savait à quoi il servait. Il avait passé deux heures à le retracer. Il l'avait trouvé. Il l'avait supprimé. Et puis — au lieu de passer à autre chose — il avait écrit une politique sur l'étiquetage et passé un autre après-midi à s'assurer que le reste de l'infrastructure la respectait. Personne ne lui avait demandé de faire ça. Il l'avait fait parce que la pensée de ne pas le faire l'avait dérangé.

Pour Priya, ç'avait été la première fois qu'elle avait été réveillée à 2 h du matin pour une découverte GuardDuty. Elle avait d'abord été agacée. Puis elle avait lu la découverte. Un utilisateur IAM avait fait 47 appels d'API échoués vers un point de terminaison auquel il n'accédait pas normalement. Il s'est avéré que c'était un script d'automatisation mal configuré. Mais les 20 minutes qu'elle passa à retracer la découverte se terminèrent par cette question : si ç'avait été une vraie compromission, qu'aurions-nous pu voir ? La réponse était : très peu. Elle passa le sprint suivant à construire l'infrastructure de logging et d'alerte qui aurait répondu à cette question.

Pour Leo, ç'avait été le système de notification. Pas pendant l'incident — pendant les deux semaines après. La façon dont il avait pensé à l'architecture la nuit, non pas parce que quelqu'un regardait, mais parce que quelque chose en lui ne pouvait pas lâcher prise jusqu'à ce qu'il comprenne ce qu'il avait mal construit et pourquoi.

Aucun d'eux n'avait reçu l'instruction de se soucier autant. C'était arrivé de la façon dont la plupart des choses importantes arrivent : progressivement, sans annonce, au milieu d'un travail ordinaire.


« Certaines personnes ne font pas ce changement, » dit Priya. « De bons ingénieurs. D'excellents ingénieurs. Ils font un excellent travail dans un périmètre défini et sont soigneux et fiables dedans. Ils ne ressentent pas la propriété. Ce n'est pas un défaut moral — c'est juste une relation différente au travail. »

« Et les architectes ont besoin de la ressentir, » dit Maya.

« Les architectes la ressentent par défaut, » dit Priya. « Même quand ils sont hors service. Surtout alors. »

**Étendue technique vs profondeur**

Il y a une question posée à chaque entretien d'architecture : êtes-vous un généraliste ou un spécialiste ?

La réponse honnête est : ni l'un ni l'autre seul ne suffit.

Les architectes ont besoin d'assez de profondeur pour savoir ce qu'ils ne savent pas — pour reconnaître quand un problème est à la limite de leurs connaissances, quand faire appel à quelqu'un avec une expertise plus spécifique. Vous ne pouvez pas savoir quand appeler un expert en base de données si vous ne comprenez pas suffisamment les bases de données pour savoir ce qui vous manque.

Et les architectes ont besoin d'assez d'étendue pour connecter les choses. Les systèmes qu'ils conçoivent couvrent plusieurs domaines : stockage et calcul et réseau et sécurité et observabilité et coût. Les décisions dans un domaine ont des conséquences dans un autre. Vous ne pouvez pas optimiser les coûts réseau sans comprendre le comportement de l'application. Vous ne pouvez pas concevoir un modèle de données sans comprendre les modèles d'accès. Vous ne pouvez pas choisir un modèle de déploiement sans comprendre les modes de défaillance.

« Ce n'est pas profondeur ou étendue, » dit Leo. « C'est de la profondeur dans quelques domaines et de la conscience de tout. »

« En forme de T, » dit Priya.

« J'ai toujours détesté cette métaphore, » dit-il. « Mais oui. »

**Raisonnement sur les compromis**

La chose la plus courante que disent les architectes est : ça dépend.

L'erreur est de le dire sans terminer la phrase.

*Ça dépend du modèle d'accès.* Ça dépend de l'échelle. Ça dépend de la conséquence de la défaillance. Ça dépend de la capacité opérationnelle de l'équipe. Ça dépend de la contrainte de coût. Ça dépend de combien de temps vous vous attendez à ce que le système reste dans sa forme actuelle.

Compléter la phrase est le travail. Chaque phrase complète révèle une dimension du problème qui était auparavant invisible. Chaque dimension rendue visible est une décision qui peut être prise délibérément plutôt qu'accidentellement.

Priya avait rédigé une liste, quelques mois auparavant, des décisions que Nimbus avait prises accidentellement — non pas malicieusement, non pas par négligence, mais sans comprendre pleinement que la décision était en train d'être prise. Elle la relisait parfois. C'était un document utile.

« Les meilleures décisions architecturales que j'ai vues, » dit-elle, « sont celles où quelqu'un a dit : voici les quatre options, voici les compromis, voici ce que je recommande, voici ce qui me ferait changer de recommandation. »

« Un ADR, » dit Leo.

« Un ADR, » convint-elle. « Ou juste une phrase dans un message Slack. Le format n'a pas d'importance. Le raisonnement, si. »

« Parce que le raisonnement survit même quand la décision est reconsidérée, » dit Tom.

« Parce que le raisonnement est la connaissance, » dit Maya. « La décision n'est que le résultat. »

**Ce que l'ancienneté n'est pas**

Ce n'est pas l'ancienneté. Vous pouvez travailler quelque part pendant dix ans et ne pas développer le jugement architectural. Vous pouvez être là depuis trois ans et penser comme un architecte. Le temps corrèle faiblement avec la chose.

Ce n'est pas tout savoir. Il y a des services dans le catalogue d'AWS qu'aucun d'eux n'avait jamais utilisés — des offres spécialisées pour des secteurs spécifiques, des fonctionnalités annoncées et pas encore nécessaires. C'est normal. Le catalogue est vaste. Le travail n'est pas une connaissance encyclopédique ; c'est un raisonnement de principe à partir de ce que vous savez.

Ce n'est pas l'absence de doute. Les architectes doutent constamment. Ils tiennent leurs décisions plus légèrement que les ingénieurs juniors, parce qu'ils ont vu assez de bonnes décisions échouer dans des circonstances inattendues pour savoir que la confiance est situationnelle. « Je suis confiant dans ceci compte tenu des contraintes actuelles » est la bonne posture. Pas « j'ai raison ».

Ce n'est pas l'impossibilité d'avoir tort. Carlos leur avait raconté, lors de cette première revue d'architecture, un système qu'il avait conçu et qui avait échoué de façon catastrophique parce qu'il avait mal analysé le mode de défaillance. Il l'avait décrit clairement, sans défensivité. « Je l'ai raté, » avait-il dit. « On en a appris. Le prochain système n'avait pas ce mode de défaillance. »

Ce n'est pas la certitude sur l'avenir. Les architectes les plus expérimentés sont les plus à l'aise pour dire : je ne sais pas comment ça va se comporter à 10x le trafic. Testons-le. La volonté d'admettre l'incertitude — et de concevoir des systèmes qui peuvent survivre à une erreur — est un marqueur de maturité, pas de faiblesse.

« C'est ce qui l'a rendu digne de confiance, » dit Maya, quand elle raconta l'histoire au nouveau recru. « Non pas qu'il n'ait jamais eu tort. Qu'il ait eu tort, compris pourquoi, et l'ait porté en avant. »

**La transition vers le senior**

Pour quiconque lit ceci qui est encore junior ou de niveau intermédiaire, qui est sur le chemin vers ce type de pensée :

La transition n'est pas un test que vous réussissez. C'est une posture que vous adoptez, progressivement, et que vous n'abandonnez pas.

Commencez à poser la question de la défaillance. Dans chaque conception, dans chaque revue, pour chaque système que vous touchez : *qu'est-ce qui casse en premier ?* Pas de façon hypothétique — parcourez-le. Suivez la chaîne. L'équilibreur de charge reçoit une requête. Le serveur applicatif la traite. La base de données reçoit la requête. Qu'est-ce qui casse en premier sous charge ? Qu'est-ce qui casse en premier si une dépendance est lente ? Qu'est-ce qui casse en premier à 10 fois le trafic actuel ?

Commencez à posséder les choses au-delà de leur livraison. Quand vous déployez quelque chose, ne le passez pas à quelqu'un d'autre pour passer à autre chose. Observez-le pendant une semaine. Regardez les métriques. Regardez les journaux d'erreurs. Regardez le coût. Demandez : ce système se comporte-t-il comme je l'attendais ? Sinon, pourquoi pas ?

Commencez à rendre les compromis explicites. Quand vous choisissez une approche, articulez pourquoi vous avez rejeté les alternatives. Écrivez-le, même brièvement. « J'ai choisi X plutôt que Y parce que Z. » Cette articulation est le début du raisonnement architectural.

Commencez à traiter les post-mortems comme de l'éducation, pas de la poursuite. Chaque incident est une étude de cas. Lisez les publics — AWS, Cloudflare, Stripe, GitHub en publient tous. Lisez les internes. Demandez : quel était le mode de défaillance ? Quelle hypothèse s'est avérée fausse ? Qu'aurais-je fait différemment ?

La progression de junior à architecte ne concerne pas principalement ce que vous savez. Elle concerne ce que vous remarquez.

**La vue depuis la table du coin**

Le café était terminé. La lumière de l'après-midi par la fenêtre avait changé pendant qu'ils parlaient — comme elle le fait quand vous cessez de la remarquer.

Leo dit : « Je pense à ce premier incident. Celui où la base de données est tombée pendant le coup de feu du dîner et qu'on n'avait pas de runbook et pas de surveillance et qu'on a passé quarante minutes sans savoir ce qui n'allait pas. »

« On pensait que c'était l'application, » dit Priya.

« On pensait que c'était le CDN, » dit Tom.

« C'était le pool de connexions de la base de données, » dit Maya. « Et aucun de nous ne savait regarder là en premier. »

« C'est ce à quoi je pense, » dit Leo. « Non pas parce que c'était embarrassant. Parce que je peux encore ressentir l'écart entre ce que je savais alors et ce que je sais maintenant. Et j'ai conscience que dans cinq ans, je ressentirai le même écart entre maintenant et alors. »

« C'est le bon sentiment à avoir, » dit Priya.

« Y a-t-il un nom pour ça ? »

« L'humilité calibrée, » dit-elle. « Savoir ce que vous ne savez pas. Ce qui nécessite d'abord de savoir ce que vous savez. »


Puis Leo dit quelque chose qui lui pesait sur la poitrine depuis un moment.

« Je peux vous dire celui auquel je pense le plus ? »

Personne ne lui dit de ne pas le faire.

« Le système de notification, » dit-il. « La file SQS. Celui que j'ai construit quand on avait 40 restaurants. »

Priya le regarda. Elle connaissait cette histoire. C'était elle qui l'avait corrigée.

« Raconte-nous, » dit Maya.

Leo avait construit le système de notification des restaurants en un long week-end pendant la poussée du Series Seed. L'exigence était simple : quand une commande était passée, notifier le restaurant immédiatement. Le mécanisme qu'il avait choisi était SQS — une file Standard, une fonction Lambda comme consommateur, des paramètres de concurrence par défaut. Il avait fonctionné immédiatement, de manière fiable et sans problème — pendant plus de deux ans, tandis que 40 restaurants devenaient discrètement des centaines, et des centaines des milliers.

Jusqu'à ce qu'ils aient 3 000 restaurants.

« Le coup de feu du vendredi à 3 000 restaurants, » dit Leo. « À ce moment-là, chaque commande produisait une poignée de messages — la notification de nouvelle commande, la confirmation, la mise à jour prêt-pour-retrait. À 18 h, la file prenait environ 2 000 messages par minute. Normalement ce n'était rien : chaque invocation se terminait en moins de deux secondes, donc on n'avait jamais plus de soixante ou soixante-dix Lambdas en cours en même temps. Mais ce vendredi-là, le fournisseur de push vers les tablettes s'est dégradé. Les appels qui prenaient deux secondes ont commencé à rester suspendus jusqu'à atteindre le timeout de 30 secondes de la fonction. »

« Et la Lambda a commencé à throttler, » dit Priya.

« C'est l'arithmétique que personne ne fait jusqu'à ce que ça fasse mal, » dit Leo. « La concurrence, c'est le taux d'arrivée multiplié par la durée. Trente-trois messages par seconde multipliés par deux secondes, ça fait environ soixante-dix exécutions simultanées. Trente-trois messages par seconde multipliés par trente secondes, ça fait mille — chaque unité de concurrence que le compte avait. La limite par défaut au niveau du compte est de 1 000 exécutions simultanées. On n'y avait jamais pensé parce qu'à 40 restaurants, on en était loin. À 3 000 restaurants un vendredi à 18 h, avec une dépendance en aval lente, on l'a atteinte en sept minutes. »

Quand une fonction Lambda atteint la limite de concurrence, elle ne traite pas de messages supplémentaires. Les messages restent dans la file SQS. Avec une file Standard, SQS continue de réessayer — mais il n'y a pas de concurrence supplémentaire pour les traiter. Les messages s'accumulent. Les notifications s'accumulent. Les restaurants ne reçoivent pas les notifications de commande. Les minuteurs de cuisine ne démarrent pas. Les commandes sont en retard ou manquées.

« Combien de temps avant que les partenaires restaurateurs ne commencent à appeler ? » demanda Tom.

« Onze minutes après le début du throttling, » dit Leo. « On avait 430 notifications accumulées. »

« Qu'as-tu fait en premier ? » demanda Maya.

Leo eut la grâce d'avoir l'air légèrement embarrassé. « J'ai augmenté le timeout de la Lambda de 30 secondes à 5 minutes. L'idée était que si chaque invocation pouvait tourner plus longtemps, peut-être qu'elle traiterait l'arriéré plus vite. »

« Ça a empiré les choses ? » demanda Tom.

« Ça a empiré les choses. Les messages accumulés étaient réessayés pendant que les invocations originales tournaient encore avec le timeout étendu. J'avais créé une situation où la concurrence déjà à la limite était retenue par des fonctions de longue durée tandis que de nouveaux messages arrivaient et n'étaient pas traités. »

« Je me souviens, » dit Priya doucement.

« Ma deuxième tentative, » continua Leo. « J'ai ajouté une deuxième fonction Lambda. Même file, nouveau consommateur. Je pensais que si je doublais les consommateurs, je doublerais le débit. »

« Mais la concurrence est par compte, pas par fonction, » dit Priya.

« Exact. Deux fonctions Lambda, atteignant toutes les deux le même plafond de concurrence au niveau du compte. Débit total : identique à une seule fonction. Arriéré : toujours en croissance. La deuxième Lambda ne faisait que diviser la même capacité limitée entre deux fonctions. »

Tom fixait la table. « Quelle est la bonne solution ? »

« Priya l'a trouvée, » dit Leo.

« À 2 h du matin, » ajouta Priya. Elle avait lu la documentation Lambda au lit, la luminosité du téléphone baissée au minimum.

« La concurrence réservée, » dit-elle. « Chaque fonction Lambda peut se voir attribuer une concurrence réservée — une portion de la limite totale de concurrence du compte qui est garantie exclusivement pour cette fonction, et indisponible pour toute autre fonction. Si je donnais à la Lambda de notification 400 unités de concurrence réservée, les autres Lambdas du compte avaient 600 unités à partager, et la Lambda de notification ne pouvait pas être affamée par d'autres fonctions. »

« Ça a corrigé le problème ? » demanda Tom.

« Ça a corrigé le problème de famine, » dit Priya. « Mais il y avait encore un plafond de débit sur la Lambda de notification. 400 invocations simultanées, chacune traitant un message à la fois. À deux secondes par message, c'est largement suffisant pour 2 000 messages par minute. Mais au moment où une dépendance en aval dépasse douze secondes par appel, la même arithmétique qui nous a cassés à 1 000 nous casse à 400. Les 400 unités avaient assez de marge pour le trafic de cette semaine. Pour cette semaine. »

« C'était un correctif temporaire, » dit Leo.

« C'était le troisième correctif d'une série en escalade, » dit Priya. « Chaque correctif traitait un symptôme. Aucun ne traitait l'architecture. »

La bonne solution — qu'ils construisirent au cours des deux semaines suivantes — avait trois parties.

« Des files FIFO, » dit Priya, « par niveau de restaurant. Les restaurants étaient segmentés en trois niveaux : entreprise, croissance et standard. Chaque niveau avait sa propre file SQS FIFO. Chaque file avait son propre consommateur Lambda avec sa propre allocation de concurrence réservée. »

« Pourquoi FIFO ? » demanda Tom. « Les files Standard sont moins chères. »

« Parce que les files FIFO garantissent l'ordre des messages par groupe de messages, » dit Priya. « Pour les notifications de restaurant, l'ordre des messages compte. Si une mise à jour de commande arrive avant la notification de commande originale, le restaurant voit une séquence confuse. Les files FIFO, avec un ID de groupe de messages par restaurant, garantissent que les messages de chaque restaurant sont traités dans l'ordre où ils ont été envoyés. »

« Et la séparation par niveau ? » demanda Tom.

« Des rayons d'impact isolés, » dit Priya. « Si la file du niveau entreprise a un problème de traitement, elle ne dégrade pas le niveau standard. Les restaurants entreprise ont les exigences de SLA les plus élevées — ce sont ceux où une notification retardée coûte à Nimbus de l'argent réel en pénalités contractuelles. Les séparer garantit que leur file ne peut pas être remplie par le trafic des restaurants standard. »

« Et la DLQ, » ajouta Leo.

« Une file de lettres mortes sur chaque file FIFO, » dit Priya. « Les messages qui échouent au traitement après trois tentatives sont déplacés vers la DLQ. Une alarme CloudWatch se déclenche quand la profondeur de la DLQ dépasse zéro. L'ingénieur d'astreinte examine les messages échoués et détermine s'ils ont besoin d'être retraités ou investigués. »

« Avant l'alarme DLQ, » dit Leo, « on découvrait les notifications échouées quand un partenaire restaurateur appelait. L'alarme DLQ signifie qu'on le découvre avant l'appel. »

La conversation se fit silencieuse un moment. La lumière de l'après-midi avait continué son lent décalage à travers la fenêtre du café.

« Ce à quoi je pense, » dit Leo, « c'est l'écart entre ce que j'ai construit et ce que je construirais maintenant. Pas comme autocritique. Comme mesure. Parce que cet écart est la façon dont je sais que j'ai appris quelque chose. »

« Qu'aurais-tu construit dès le départ ? » demanda Maya.

« Des files FIFO par niveau dès le premier jour, » dit Leo. « Non pas parce que j'avais besoin de trois niveaux quand on avait 40 restaurants. Mais parce que la conception aurait été correcte pour ce qu'on est devenu. Le coût de trois files au lieu d'une était négligeable. Le coût d'une seule file qui a échoué à l'échelle a été trois heures d'incidents un vendredi soir et deux semaines de remédiation. »

« Tu ne savais pas que tu allais passer à l'échelle de 3 000 restaurants quand tu l'as construit, » dit Priya. Ce n'était pas une défense. C'était une clarification.

« Non, » dit Leo. « Mais je savais qu'on construisait un système de notification pour une plateforme de restaurants avec des ambitions de croissance. La question que je n'ai pas posée était : à quoi ça ressemble à 10x ? À 100x ? Quelle est la première chose qui casse quand on devient plus gros ? »

« La limite de concurrence, » dit Tom.

« La limite de concurrence, » convint Leo. « Qui est dans la documentation Lambda. J'avais lu la documentation. Je n'avais juste jamais posé la question qui aurait rendu la section pertinente pertinente. »

« C'est l'habitude architecturale, » dit Priya. « La question qui rend la bonne documentation pertinente. Tu ne peux pas lire chaque ligne. Mais si tu demandes "qu'est-ce qui casse à l'échelle ?", tu finis par lire les bonnes lignes. »

Maya avait écouté sans parler un moment. Elle dit : « La raison pour laquelle je voulais parler de ça aujourd'hui — la raison pour laquelle je vous ai tous demandé de venir — c'est que j'essaie de comprendre ce qu'on peut enseigner aux nouveaux ingénieurs. Pas les services. Les services, ils les apprendront. Quelle est la chose qui prend plus de temps à apprendre qu'elle ne le devrait ? »

Personne ne répondit immédiatement.

« Cette question, » dit enfin Leo. « Celle sur ce qui casse à l'échelle. On la pose par réflexe maintenant. On ne la posait pas par réflexe quand on a commencé. Je ne sais pas comment on enseigne à quelqu'un à la poser par réflexe sans le laisser construire quelques choses qui cassent à l'échelle d'abord. »

« Tu ne peux pas, » dit Tom. « Mais tu peux rendre l'environnement plus sûr pour l'apprentissage. Tu peux construire des systèmes où la défaillance est visible, contenue et traçable. Tu peux t'assurer que le post-mortem est un document d'apprentissage, pas un document de blâme. Tu peux poser la question d'échelle en revue de code, même quand tu connais la réponse, parce que la personne qui écrit le code a besoin de l'entendre posée. »

« Et tu peux raconter des histoires, » dit Priya. « Comme celle-ci. »


Maya regarda la rue.

« Le nouvel ingénieur a demandé comment devenir architecte, » dit-elle. « Ce que j'aurais dû dire, c'est : deviens quelqu'un qui se soucie de ce qui casse. Tout le reste découle de ça. »

Personne ne parla pendant un moment.

C'était l'un de ces silences qui n'ont pas besoin d'être remplis.

Dehors, quelqu'un traversa la rue en portant deux sacs en papier de plats à emporter. Tom le remarqua en premier et rit.

« Boucle bouclée, » dit-il.

Maya sourit. « Ouais, » dit-elle. « Boucle bouclée. »

---

## La progression junior-architecte

| Étape           | Question principale                                            | Horizon temporel      | Propriété      |
|-----------------|---------------------------------------------------------------|-----------------------|----------------|
| Junior          | Comment est-ce que je fais marcher ça ?                       | Ticket en cours       | Ma PR          |
| Intermédiaire   | Comment est-ce que je rends ça correct et maintenable ?       | Ce sprint             | Mon composant  |
| Senior          | Comment ça tient dans le temps et à l'échelle ?               | Prochain trimestre    | Ce service     |
| Staff/Principal | Pourquoi construit-on ça, et y a-t-il un chemin plus simple ? | L'année prochaine     | Ce système     |
| Architecte      | Qu'est-ce qui casse en premier, comment le savons-nous, et que faisons-nous ? | Indéfini | Le produit |

---

## Ce qui change à mesure que vous grandissez

**De l'implémentation aux conséquences.** Les ingénieurs juniors demandent « est-ce que ça marche ? » Les ingénieurs seniors demandent « est-ce que ça continue de marcher ? » Les architectes demandent « que se passe-t-il quand ça s'arrête ? »

**Des fonctionnalités aux systèmes.** Les ingénieurs juniors ajoutent des fonctionnalités. Les architectes pensent à ce que le système devient quand dix fonctionnalités ont été ajoutées. La forme des décisions futures est déjà visible dans les décisions actuelles.

**De la justesse aux compromis.** Il y a généralement une implémentation « la plus correcte » d'une fonctionnalité. Il y a rarement une architecture « la plus correcte ». Il y a des compromis, et les meilleurs architectes les font explicitement et consciemment plutôt qu'accidentellement.

**De la confiance à la calibration.** Les ingénieurs juniors sont souvent soit sous-confiants (incertains des bonnes décisions) soit trop confiants (inconscients de ce qu'ils ne savent pas). Les architectes expérimentés sont calibrés : ils connaissent l'étendue et les limites de leurs connaissances, et tiennent leurs conclusions au niveau de certitude approprié.

**De la connaissance au jugement.** La connaissance, c'est savoir que DynamoDB utilise des clés de partition. Le jugement, c'est savoir que le modèle d'accès de ce cas d'utilisation spécifique causera des partitions chaudes, et que l'impact commercial de ce mode de défaillance à l'échelle projetée signifie que vous devriez reconsidérer la conception maintenant.

---

*Merci d'avoir lu.*

*L'examen AWS Solutions Architect Associate (SAA-C03) est disponible dans les centres de test Pearson VUE et en ligne via leur système de test à distance. Visitez aws.amazon.com/certification pour vous inscrire.*

*L'histoire de Nimbus est fictive. Les services AWS, les modèles de tarification et les meilleures pratiques décrits dans ce livre sont réels. Les deux peuvent changer — AWS met fréquemment à jour ses services. Vérifiez toujours les prix actuels et les capacités des services sur aws.amazon.com.*

*Bonne chance.*

---

*À la même heure l'année prochaine ?*
