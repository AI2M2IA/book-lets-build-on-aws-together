# Ce que signifie architecte

La table du coin avait la meilleure lumière du café. Par la fenêtre, l'après-midi faisait quelque chose de lent et tranquille dans la rue dehors.

Maya avait commandé du thé. Tom avait commandé un espresso. Priya avait commandé quelque chose qu'elle décrivait seulement comme « ce qu'ils étaient en train de faire quand je suis entrée ». Leo avait vingt minutes de retard, ce qui était cohérent.

Cela faisait quatorze mois depuis la Série A.

L'équipe d'ingénierie comptait maintenant dix-neuf personnes. Il y avait deux fuseaux horaires. Il y avait une équipe plateforme, une équipe produit, une équipe data. Il y avait une revue d'architecture hebdomadaire qui durait quatre-vingt-dix minutes et en nécessitait généralement plus.

Leo arriva avec un sac d'ordinateur portable et l'expression de quelqu'un qui avait eu trois appels avant 9h. Il s'assit. Il commanda un café. Il dit : « D'accord. Qu'est-ce qu'on fait ? »

« On réfléchit », dit Maya.

« À quoi ? »

Elle avait réfléchi, dans le train, à quelque chose qu'un nouveau recru avait dit lors de sa première semaine. C'était un bon ingénieur — soigneux, précis, posait de bonnes questions. Le vendredi, à la fin de sa première revue d'architecture, il avait dit : « Je veux être architecte un jour. »

Elle avait dit : « Vous prenez déjà des décisions architecturales. »

Il avait l'air incertain. « Mais je suis juste un junior. »

« Moi aussi », dit-elle. « Tout le monde dans cette pièce l'était, un jour. »

Elle raconta cette histoire à la table. Quand elle eut fini, Tom dit : « Qu'est-ce que vous vouliez dire par là ? »

« Je ne suis pas sûre de l'avoir bien expliqué », dit Maya. « C'est pour ça qu'on est là. »

Et parce que la question l'avait hantée tout le week-end.

Non pas parce que c'était flatteur d'être questionnée.

Parce que c'était le genre de question qui change la façon dont quelqu'un voit son propre avenir si vous y répondez bien.

**La question**

Qu'est-ce qu'un architecte ?

Pas le titre. Pas l'organigramme. Pas les années d'expérience listées dans une description de poste. La vraie chose.

Au cours des quatorze mois depuis le tour de financement, tous les quatre étaient devenus, formellement ou informellement, responsables des décisions architecturales chez Nimbus. Maya était officiellement CTO. Tom était Responsable Infrastructure. Priya dirigeait l'équipe plateforme. Leo était Ingénieur Principal, ce qui signifiait qu'il était consulté sur tout et ne possédait rien de spécifique, ce qu'il trouvait à la fois libérateur et parfois exaspérant.

Aucun d'eux ne s'attendait à arriver là. Maya avait été développeuse. Tom avait été administrateur de systèmes qui pensait le rester. Priya avait un master en informatique et avait passé deux ans à écrire des applications mobiles. Leo avait abandonné un programme de mathématiques et s'était autoformé au code.

Aucun de cela ne correspondait à la description de poste d'« architecte ».

« Voici ce que je pense que c'est », dit Priya. « Un architecte est quelqu'un qui a accepté qu'il est responsable des conséquences de ses décisions — pas seulement de la décision elle-même. »

« Dites-en plus », dit Leo.

« Quand vous êtes en début de carrière, vous prenez une décision et vous passez à autre chose. Vous l'implémentez ou non. Quelqu'un d'autre la révise, l'approuve, la déploie. La conséquence d'avoir tort est que quelqu'un en amont attrape l'erreur. »

« Et ensuite ? »

« Ensuite, il n'y a personne en amont. La décision est déployée. La conséquence est la production. »

Tom hocha lentement la tête. « C'est quand vous commencez à penser différemment. Non pas parce que vous en savez plus — bien que ce soit le cas — mais parce que le rayon d'impact d'avoir tort a changé. »

**Junior à architecte : la vraie progression**

La progression de junior à architecte n'est pas une ligne droite de connaissances accumulées. C'est une série de changements dans la façon dont vous comprenez votre travail.

Les *ingénieurs juniors* demandent : Comment est-ce que je fais fonctionner ça ? Leur question principale est l'implémentation. Étant donné une exigence, comment produis-je un système fonctionnel ? C'est la compétence essentielle première. Tout le reste repose dessus.

Les *ingénieurs de niveau intermédiaire* demandent : Comment est-ce que je fais fonctionner ça correctement ? La question s'élargit pour inclure la justesse — pas seulement « est-ce que ça tourne » mais « est-ce que ça gère les cas limites, les conditions d'erreur, les entrées inattendues ». Ils commencent à penser aux tests. Ils commencent à penser à la maintenance.

Les *ingénieurs seniors* demandent : Comment est-ce que je fais fonctionner ça correctement *et* durablement ? L'horizon temporel s'étend. Ils pensent à l'ingénieur qui lira ce code dans un an. Ils pensent au système qui portera dix fois la charge actuelle. Ils pensent à ce qui se passe quand une dépendance change.

Les *ingénieurs staff et principaux* demandent : Pourquoi construisons-nous ça du tout ? Ils reculent face à l'implémentation et questionnent le prémisse. Est-ce le bon problème à résoudre ? Est-ce le bon moment pour le résoudre ? Y a-t-il une approche plus simple qui renonce à la sophistication en échange de la survivabilité ?

Les *architectes* demandent : Qu'est-ce qui casse en premier, comment le savons-nous, et que fait quelqu'un à 3h du matin quand ça arrive ?

« La question de 3h du matin », dit Leo. « Carlos l'a utilisée. »

« Parce que c'est vrai », dit Priya. « C'est le test. Pouvez-vous écrire le runbook ? Comprenez-vous suffisamment les modes de défaillance pour écrire les étapes pour quelqu'un qui est à moitié endormi et sous pression ? »

**Ce qui ne change pas**

Il y a des choses que les architectes savent que les juniors ne savent pas. Le comportement spécifique aux services. Les caractéristiques de défaillance à l'échelle. La dynamique organisationnelle pour faire approuver les décisions. L'histoire des décisions prises dans des contextes similaires qui n'ont pas fonctionné.

Mais la connaissance n'est pas la chose.

La chose est l'ensemble de questions par défaut. Le modèle mental qui s'active quand quelqu'un décrit un problème.

Les ingénieurs juniors entendent un problème et pensent à des solutions. Les architectes entendent un problème et pensent aux contraintes, aux modes de défaillance et à l'écart entre ce que l'entreprise dit avoir besoin et ce dont elle a réellement besoin.

Non pas parce qu'ils sont plus froids.

Parce qu'ils essaient de protéger les personnes qui devront vivre dans les conséquences.

« Ce n'est pas qu'on en sait plus », dit Tom. « On pose d'abord des questions différentes. »

Maya était restée silencieuse un moment. Elle dit : « Quand j'ai parlé à ce nouvel ingénieur, j'ai réalisé ce que j'essayais vraiment de dire. Il demandait comment devenir architecte. Et je voulais dire : commencez par remarquer ce qui casse. Pas seulement quand quelque chose est cassé — mais avant. Pendant la conception. Pendant la revue. Demandez : qu'est-ce qui casse en premier ? Comment le saurons-nous ? Qui appelons-nous ? »

« Ce n'est pas un titre », dit Leo. « C'est une habitude. »

« Oui. »

**La propriété**

L'autre chose, ils se sont mis d'accord, c'était la propriété.

Pas la propriété au sens légal. La propriété au sens psychologique : le sentiment que si ce système se dégrade, vous serez celui qui s'en préoccupera le plus.

En début de carrière, ce n'est pas la posture attendue. Vous êtes responsable de vos tickets, de vos PR, de vos histoires assignées. Le système appartient à quelqu'un d'autre.

Plus tard, la frontière se dissout. Le système est à vous. Pas uniquement à vous — partagé, toujours partagé — mais à vous dans le sens où vous ressentez ses défaillances personnellement. Un incident de production à 2h du matin n'est pas une interruption de votre vie. C'est une partie de votre travail.

« C'est le changement que je n'aurais pas pu enseigner à quelqu'un », dit Tom. « Vous devez ressentir quelques pannes. Vous devez être celui qui n'a pas attrapé le mode de défaillance avant qu'il n'atteigne la production. C'est quand la question change. »

« Certaines personnes ne font pas ce changement », dit Priya. « De bons ingénieurs. D'excellents ingénieurs. Ils font un excellent travail dans un périmètre défini et sont soigneux et fiables dans celui-ci. Ils ne ressentent pas la propriété. Ce n'est pas un défaut moral — c'est juste une relation différente au travail. »

« Et les architectes ont besoin de le ressentir », dit Maya.

« Les architectes le ressentent par défaut », dit Priya. « Même quand ils sont hors service. Surtout alors. »

**Étendue technique vs profondeur**

Il y a une question posée à chaque entretien d'architecture : êtes-vous un généraliste ou un spécialiste ?

La réponse honnête est : ni l'un ni l'autre seul ne suffit.

Les architectes ont besoin d'assez de profondeur pour savoir ce qu'ils ne savent pas — pour reconnaître quand un problème est à la limite de leurs connaissances, quand faire appel à quelqu'un avec une expertise plus spécifique. Vous ne pouvez pas savoir quand appeler un expert en base de données si vous ne comprenez pas suffisamment les bases de données pour savoir ce qui vous manque.

Et les architectes ont besoin d'assez d'étendue pour connecter les choses. Les systèmes qu'ils conçoivent couvrent plusieurs domaines : stockage et calcul et réseau et sécurité et observabilité et coût. Les décisions dans un domaine ont des conséquences dans un autre. Vous ne pouvez pas optimiser les coûts réseau sans comprendre le comportement de l'application. Vous ne pouvez pas concevoir un modèle de données sans comprendre les modèles d'accès. Vous ne pouvez pas choisir un modèle de déploiement sans comprendre les modes de défaillance.

« Ce n'est pas profondeur ou étendue », dit Leo. « C'est de la profondeur dans quelques domaines et de la conscience de tout. »

« En forme de T », dit Priya.

« J'ai toujours détesté cette métaphore », dit-il. « Mais oui. »

**Raisonnement sur les compromis**

La chose la plus courante que disent les architectes est : ça dépend.

L'erreur est de le dire sans terminer la phrase.

*Ça dépend du modèle d'accès.* Ça dépend de l'échelle. Ça dépend de la conséquence de la défaillance. Ça dépend de la capacité opérationnelle de l'équipe. Ça dépend de la contrainte de coût. Ça dépend de combien de temps vous vous attendez à ce que le système reste dans sa forme actuelle.

Compléter la phrase est le travail. Chaque phrase complète révèle une dimension du problème qui était auparavant invisible. Chaque dimension rendue visible est une décision qui peut être prise délibérément plutôt qu'accidentellement.

Priya avait rédigé une liste, quelques mois auparavant, des décisions que Nimbus avait prises accidentellement — non pas malicieusement, non pas par négligence, mais sans comprendre pleinement que la décision était en train d'être prise. Elle la relisait parfois. C'était un document utile.

« Les meilleures décisions architecturales que j'ai vues », dit-elle, « sont celles où quelqu'un a dit : voici les quatre options, voici les compromis, voici ce que je recommande, voici ce qui me ferait changer de recommandation. »

« Un ADR », dit Leo.

« Un ADR », convint-elle. « Ou juste une phrase dans un message Slack. Le format n'a pas d'importance. Le raisonnement si. »

« Parce que le raisonnement survit même quand la décision est reconsidérée », dit Tom.

« Parce que le raisonnement est la connaissance », dit Maya. « La décision n'est que le résultat. »

**Ce que l'ancienneté n'est pas**

Ce n'est pas la durée d'ancienneté. Vous pouvez travailler quelque part pendant dix ans et ne pas développer le jugement architectural. Vous pouvez être là depuis trois ans et penser comme un architecte. Le temps corrèle faiblement avec la chose.

Ce n'est pas tout savoir. Il y a des services dans le catalogue AWS qu'aucun d'eux n'avait jamais utilisés — des offres spécialisées pour des secteurs spécifiques, des fonctionnalités annoncées et pas encore nécessaires. C'est normal. Le catalogue est vaste. Le travail n'est pas une connaissance encyclopédique ; c'est un raisonnement de principe à partir de ce que vous savez.

Ce n'est pas l'absence de doute. Les architectes doutent constamment. Ils tiennent leurs décisions plus légèrement que les ingénieurs juniors, parce qu'ils ont vu assez de bonnes décisions échouer dans des circonstances inattendues pour savoir que la confiance est situationnelle. « Je suis confiant dans ceci compte tenu des contraintes actuelles » est la bonne posture. Pas « j'ai raison ».

Ce n'est pas l'impossibilité d'avoir tort. Carlos leur avait dit, lors de cette première revue d'architecture, à propos d'un système qu'il avait conçu et qui avait échoué de façon catastrophique parce qu'il avait mal analysé le mode de défaillance. Il l'avait décrit clairement, sans défensivité. « Je l'ai raté », avait-il dit. « Nous en avons appris. Le prochain système n'avait pas ce mode de défaillance. »

« C'est ce qui l'a rendu digne de confiance », dit Maya, quand elle raconta l'histoire au nouveau recru. « Non pas qu'il n'ait jamais eu tort. Qu'il ait eu tort, compris pourquoi, et l'ait porté en avant. »

**La transition vers le senior**

Pour quiconque lit ceci qui est encore junior ou de niveau intermédiaire, qui est sur le chemin vers ce type de pensée :

La transition n'est pas un test que vous réussissez. C'est une posture que vous adoptez, progressivement, et que vous n'abandonnez pas.

Commencez à poser la question de la défaillance. Dans chaque conception, dans chaque revue, pour chaque système que vous touchez : *qu'est-ce qui casse en premier ?* Pas de façon hypothétique — parcourez-le. Suivez la chaîne. L'équilibreur de charge reçoit une requête. Le serveur applicatif la traite. La base de données reçoit la requête. Qu'est-ce qui casse en premier sous charge ? Qu'est-ce qui casse en premier si une dépendance est lente ? Qu'est-ce qui casse en premier à 10 fois le trafic actuel ?

Commencez à posséder les choses au-delà de leur livraison. Quand vous déployez quelque chose, ne le passez pas à la main et ne continuez pas. Observez-le pendant une semaine. Regardez les métriques. Regardez les journaux d'erreurs. Regardez le coût. Demandez : ce système se comporte-t-il comme je l'attendais ? Sinon, pourquoi pas ?

Commencez à rendre les compromis explicites. Quand vous choisissez une approche, articulez pourquoi vous avez rejeté les alternatives. Écrivez-le, même brièvement. « J'ai choisi X plutôt que Y parce que Z. » Cette articulation est le début du raisonnement architectural.

Commencez à traiter les post-mortems comme de l'éducation, pas de la poursuite. Chaque incident est une étude de cas. Lisez les publics — AWS, Cloudflare, Stripe, GitHub en publient tous. Lisez les internes. Demandez : quel était le mode de défaillance ? Quelle hypothèse s'est avérée fausse ? Qu'aurais-je fait différemment ?

La progression de junior à architecte ne concerne pas principalement ce que vous savez. Elle concerne ce que vous remarquez.

**La vue depuis la table du coin**

Le café était terminé. La lumière de l'après-midi par la fenêtre avait changé pendant qu'ils parlaient — comme elle le fait quand vous cessez de la remarquer.

Leo dit : « Je pense à ce premier incident. Celui où la base de données est tombée pendant le rush du dîner et qu'on n'avait pas de runbook et pas de surveillance et qu'on a passé quarante minutes sans savoir ce qui n'allait pas. »

« On pensait que c'était l'application », dit Priya.

« On pensait que c'était le CDN », dit Tom.

« C'était le pool de connexions de la base de données », dit Maya. « Et aucun de nous ne savait regarder là en premier. »

« C'est ce à quoi je pense », dit Leo. « Non pas parce que c'était embarrassant. Parce que je peux encore ressentir l'écart entre ce que je savais alors et ce que je sais maintenant. Et j'ai conscience que dans cinq ans, je ressentirai le même écart entre maintenant et alors. »

« C'est le bon sentiment à avoir », dit Priya.

« Y a-t-il un nom pour ça ? »

« Humilité calibrée », dit-elle. « Savoir ce que vous ne savez pas. Ce qui nécessite d'abord de savoir ce que vous savez. »

Maya regarda la rue.

« Le nouvel ingénieur a demandé comment devenir architecte », dit-elle. « Ce que j'aurais dû dire, c'est : devenez quelqu'un qui se soucie de ce qui casse. Tout le reste découle de ça. »

Personne ne parla pendant un moment.

C'était l'un de ces silences qui n'ont pas besoin d'être remplis.

Dehors, quelqu'un traversa la rue en portant deux sacs en papier remplis de plats à emporter. Tom le remarqua en premier et rit.

« Boucle bouclée », dit-il.

Maya sourit. « Ouais », dit-elle. « Boucle bouclée. »

---

## La progression junior-architecte

| Étape           | Question principale                                             | Horizon temporel      | Propriété      |
|-----------------|----------------------------------------------------------------|-----------------------|----------------|
| Junior          | Comment est-ce que je fais fonctionner ça ?                    | Ticket en cours       | Ma PR          |
| Intermédiaire   | Comment est-ce que je fais fonctionner ça correctement et maintenablement ? | Ce sprint  | Mon composant  |
| Senior          | Comment est-ce que ça tient dans le temps et à l'échelle ?     | Prochain trimestre    | Ce service     |
| Staff/Principal | Pourquoi construisons-nous ça, et y a-t-il un chemin plus simple ? | L'année prochaine | Ce système     |
| Architecte      | Qu'est-ce qui casse en premier, comment le savons-nous, et que faisons-nous ? | Indéfini  | Le produit     |

---

## Ce qui change à mesure que vous grandissez

**De l'implémentation aux conséquences.** Les ingénieurs juniors demandent « est-ce que ça marche ? » Les ingénieurs seniors demandent « est-ce que ça continue de marcher ? » Les architectes demandent « que se passe-t-il quand ça s'arrête ? »

**Des fonctionnalités aux systèmes.** Les ingénieurs juniors ajoutent des fonctionnalités. Les architectes pensent à ce que le système devient quand dix fonctionnalités ont été ajoutées. La forme des décisions futures est déjà visible dans les décisions actuelles.

**De la justesse aux compromis.** Il y a généralement une implémentation « la plus correcte » d'une fonctionnalité. Il y a rarement une architecture « la plus correcte ». Il y a des compromis, et les meilleurs architectes les font explicitement et consciemment plutôt qu'accidentellement.

**De la confiance à la calibration.** Les ingénieurs juniors sont souvent soit sous-confiants (incertains des bonnes décisions) soit trop confiants (inconscients de ce qu'ils ne savent pas). Les architectes expérimentés sont calibrés : ils connaissent l'étendue et les limites de leurs connaissances, et tiennent leurs conclusions au niveau d'certitude approprié.

**De la connaissance au jugement.** La connaissance, c'est savoir que DynamoDB utilise des clés de partition. Le jugement, c'est savoir que le modèle d'accès de ce cas d'utilisation spécifique causera des partitions chaudes, et que l'impact commercial de ce mode de défaillance à l'échelle projetée signifie que vous devriez reconsidérer la conception maintenant.

---

*À la même heure l'année prochaine ?*

*AI(2)M(2)IA*
