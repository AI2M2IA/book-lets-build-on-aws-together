# Chapitre 23 : Le Système de Classement Qui S'Organise Tout Seul

Un cabinet d'avocats garde les dossiers actifs sur le bureau. Les affaires terminées vont dans une armoire de classement. Les affaires datant de trois ans vont dans des boîtes de stockage à la cave. Les affaires datant de dix ans vont dans un service d'archivage externalisé qui coûte quelques centimes par boîte mais prend deux jours pour récupérer quoi que ce soit.

La même information, stockée à des coûts différents selon la fréquence d'accès.

S3 fait cela automatiquement.

Tom examinait la facture AWS de Nimbus. Ligne : stockage S3. 847 $/mois.

Il appela Leo.

« On a 4,2 téraoctets dans S3, » dit Leo après vérification.

« De quoi ? »

« Photos de restaurants. Reçus de commandes. Exports analytiques. Instantanés de sauvegarde datant de 18 mois. »

« Quand quelqu'un a-t-il accédé pour la dernière fois à une sauvegarde datant de 18 mois ? »

Leo vérifia les logs d'accès.

« L'octobre dernier, » dit-il. « Une fois. Pour vérifier le format de sauvegarde. »

« Donc on paie 18 mois de sauvegardes au tarif plein S3 Standard. »

« Oui. »

Tom regarda la page de tarification S3. S3 Standard : 0,023 $ par Go par mois. S3 Glacier Instant Retrieval : 0,004 $ par Go par mois.

Il fit le calcul. Quelques calculs rapides.

« On pourrait réduire cette facture significativement, » dit-il, « juste en déplaçant les vieilles données vers un stockage moins cher. »

« Il faudrait savoir ce qui est vieux, » dit Leo.

« S3 le sait. Il suit l'heure du dernier accès. »

**Classes de Stockage S3 : Le Spectre Complet**

Le chapitre 5 a présenté S3 Standard comme la classe de stockage principale. S3 a en réalité sept classes de stockage, chacune conçue pour différents modèles d'accès :

**S3 Standard** : Pour les données fréquemment accédées. Faible latence (millisecondes). Coût le plus élevé. Pas de durée minimale de stockage. À utiliser pour les données actives : les photos de menus actuelles, les commandes d'aujourd'hui, les logs récents.

**S3 Standard-Infrequent Access (S3 Standard-IA)** : Pour les données accédées moins d'une fois par mois. Même récupération en millisecondes que Standard, mais coût de stockage plus faible + frais de récupération par Go. À utiliser pour les données dont vous avez besoin immédiatement quand vous y accédez, mais rarement : les reçus de commandes plus anciens, les exports analytiques datant de 6 mois.

**S3 One Zone-Infrequent Access (S3 One Zone-IA)** : Identique à S3 Standard-IA mais stocké dans une seule Zone de Disponibilité (au lieu de trois). Moins durable (si cette AZ a une catastrophe, les données peuvent être perdues), mais 20% moins cher. À utiliser pour les données pouvant être recréées si perdues : cache de miniatures, sorties de traitement temporaires.

**S3 Glacier Instant Retrieval** : Données archivées dont vous avez besoin occasionnellement. Récupération en millisecondes. Coût de stockage très faible, coût de récupération par Go plus élevé. Durée minimale de stockage de 90 jours. À utiliser pour les données accédées une fois par trimestre ou moins : rapports de conformité trimestriels, instantanés de sauvegarde datant de 12 mois.

**S3 Glacier Flexible Retrieval** : Archive profonde, récupérée en minutes à heures. Coût plus faible que Glacier Instant Retrieval. À utiliser pour les données d'archivage moins urgentes.

**S3 Glacier Deep Archive** : Option la moins coûteuse. Récupérée en 12 heures. Durée minimale de stockage de 180 jours. À utiliser pour les données qui doivent être conservées pour la conformité réglementaire mais dont l'accès n'est jamais attendu : dossiers fiscaux sur 7 ans, logs d'audit sur 10 ans.

Le modèle : à mesure que la fréquence d'accès diminue, le coût diminue mais le temps de récupération augmente (et le coût par récupération augmente). Choisissez la classe qui correspond à votre modèle d'accès.

**Politiques de Cycle de Vie S3 : Le Système de Classement Automatisé**

Déplacer manuellement des fichiers entre les classes de stockage est sujet aux erreurs et chronophage. Les **politiques de cycle de vie** S3 automatisent cela en fonction des règles que vous définissez.

Une règle de cycle de vie a deux composantes :

**Filtre** : Quels objets la règle s'applique (tous les objets, objets avec un préfixe spécifique, objets avec des tags spécifiques).

**Actions** : Quoi faire, après combien de jours.

Exemple de politique de cycle de vie pour les reçus de commandes de Nimbus :

```
Transition vers S3 Standard-IA après 90 jours
Transition vers S3 Glacier Instant Retrieval après 365 jours
Transition vers S3 Glacier Deep Archive après 2555 jours (7 ans)
Supprimer après 2920 jours (8 ans)
```

Cette politique unique garantit :

- Reçus actifs (< 90 jours) : S3 Standard, accès rapide
- Reçus récents (90-365 jours) : Standard-IA, pas cher mais instantanément disponible
- Reçus historiques (1-7 ans) : Glacier, très peu cher, rarement nécessaire
- Reçus expirés (> 8 ans) : Automatiquement supprimés

Tom examina les économies projetées : de 847 $/mois à environ 220 $/mois.

« En définissant juste... ce qui est vieux et où ça doit aller ? » dit-il.

« Et S3 le déplace automatiquement, » confirma Leo. « Pas de cron job. Pas de migration manuelle. Pas d'oubli. »

**S3 Intelligent-Tiering : La Classe Auto-Organisante**

Et si vous ne savez pas à quelle fréquence vous accéderez à vos données ?

**S3 Intelligent-Tiering** surveille les modèles d'accès pour chaque objet et le déplace automatiquement entre les niveaux d'accès :

- **Niveau d'accès fréquent** : Pour les objets accédés récemment
- **Niveau d'accès peu fréquent** : Objets non accédés pendant 30 jours
- **Niveau d'accès archive instantanée** : Objets non accédés pendant 90 jours
- **Niveau d'accès archive** : Objets non accédés pendant 90 à 730 jours (optionnel)
- **Niveau d'accès archive profonde** : Objets non accédés pendant 180 à 730+ jours (optionnel)

S3 Intelligent-Tiering facture de petits frais de surveillance par objet par mois (0,0025 $ pour 1 000 objets), mais sans frais de récupération pour les niveaux Fréquent et Peu fréquent.

Utilisez Intelligent-Tiering quand :

- Les modèles d'accès sont imprévisibles ou changent dans le temps
- Vous avez un mélange de données chaudes et froides que vous ne pouvez pas facilement classifier
- Vous avez des objets de plus de 128 Ko (les petits objets coûtent plus en frais de surveillance qu'ils n'économisent)

Utilisez des classes de stockage explicites (avec des politiques de cycle de vie) quand :

- Les modèles d'accès sont prévisibles
- Vous voulez minimiser les frais de surveillance par objet
- Les objets sont petits (< 128 Ko)

**Téléchargement Multipart : Pour les Grands Objets**

S3 a une limite de téléchargement unique de 5 Go. Pour les objets plus grands, vous devez utiliser le **téléchargement multipart** : divisez l'objet en parties, téléchargez chacune en parallèle, et S3 les assemble.

Avantages :

- Téléchargements plus rapides (parallèles)
- Peut reprendre les téléchargements échoués (remettre en ligne uniquement les parties échouées)
- Obligatoire pour les objets > 5 Go

Astuce de règle de cycle de vie : Définissez une règle de cycle de vie pour supprimer les téléchargements multipart incomplets après 7 jours. Si un téléchargement échoue à mi-chemin et n'est pas nettoyé, ces parties partielles sont stockées et facturées — sans objet assemblé à montrer.

Tom apprécia énormément ce conseil.

**Réplication S3 : Copier des Données Entre Buckets**

S3 peut automatiquement répliquer des objets d'un bucket à un autre :

**Réplication Same-Region (SRR)** : Copier des objets dans la même région. À utiliser pour la conformité (garder une copie séparée dans un compte différent), l'agrégation de logs de plusieurs buckets, ou la création d'environnements de test à partir de données de production.

**Réplication Cross-Region (CRR)** : Copier des objets vers une région différente. À utiliser pour la reprise après sinistre (redondance des données entre régions), la conformité (les données doivent se trouver dans une géographie spécifique), et une latence plus faible pour les utilisateurs mondiaux.

La réplication n'est pas une solution de sauvegarde — si vous supprimez un objet dans le bucket source, il est supprimé dans le réplica (sauf si la réplication des marqueurs de suppression est désactivée). Utilisez AWS Backup ou le versionnage avec verrouillage d'objet pour la sauvegarde.

**S3 Object Lock : L'Immuabilité pour la Conformité**

Certaines réglementations exigent que les données soient **immuables** — une fois écrites, elles ne peuvent pas être modifiées ou supprimées pendant une période spécifiée.

**S3 Object Lock** implémente le stockage WORM (Write Once, Read Many) :

**Période de rétention** : Les objets ne peuvent pas être supprimés ou écrasés pendant une durée spécifiée.

**Blocage légal** : Les objets ne peuvent pas être supprimés, quelle que soit la période de rétention, jusqu'à ce que le blocage légal soit explicitement levé.

Utilisez S3 Object Lock pour les industries réglementées : dossiers financiers (Règle SEC 17a-4), dossiers médicaux (HIPAA), archives de conformité.

## Points Forts et Limites

**Pourquoi les niveaux de stockage S3 sont importants** :

- Réduction significative des coûts sans sacrifier la durabilité ou la disponibilité de ce qui est réellement accédé
- Les politiques de cycle de vie automatisent l'ensemble du processus — pas de charge opérationnelle
- S3 Intelligent-Tiering supprime la nécessité de prédire les modèles d'accès

**Là où ça se complique** :

- Des frais de durée minimale de stockage s'appliquent aux classes Glacier (90 jours pour Glacier Instant, 180 jours pour Deep Archive) — la suppression anticipée entraîne quand même le frais minimum
- Les frais de récupération peuvent vous surprendre si vous accédez fréquemment aux données archivées
- Les transitions de cycle de vie prennent du temps — les objets ne sont pas déplacés instantanément après le déclenchement de la règle
- Les frais de surveillance Intelligent-Tiering s'accumulent pour les buckets avec des millions de petits objets

## Résumé

- S3 a sept classes de stockage : Standard, Standard-IA, Intelligent-Tiering, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval et Glacier Deep Archive.
- Les **politiques de cycle de vie** automatisent les transitions entre les classes de stockage en fonction de l'âge — définissez une fois, S3 s'en occupe pour toujours.
- **S3 Intelligent-Tiering** déplace automatiquement les objets entre les niveaux en fonction des modèles d'accès réels — à utiliser pour les charges de travail imprévisibles.
- Le **téléchargement multipart** est obligatoire pour les objets > 5 Go et recommandé pour tout objet > 100 Mo.
- La **réplication S3** (SRR et CRR) copie les objets entre les buckets et les régions — pour la reprise après sinistre, la conformité ou l'agrégation.
- **S3 Object Lock** fournit un stockage WORM pour les scénarios de conformité.

## Conseils pour l'Examen

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts (Domaine 4, Tâche 4.1)*

- **Signaux de sélection de classe de stockage** :
  - « Fréquemment accédé » → Standard
  - « Accédé une fois par mois, récupération instantanée requise » → Standard-IA
  - « Peut tolérer des heures de récupération, rarement accédé » → Glacier Flexible Retrieval
  - « Conformité réglementaire, rétention 7+ ans, jamais accédé » → Glacier Deep Archive
  - « Modèles d'accès inconnus ou changeants » → Intelligent-Tiering
- **Modèles d'examen de politique de cycle de vie** : « réduire automatiquement les coûts de stockage à mesure que les données vieillissent », « transition vers l'archive après 90 jours » → politiques de cycle de vie.
- **Frais de surveillance Intelligent-Tiering** : Petits frais par objet. Pour un grand nombre de petits objets, cela peut dépasser les économies. L'examen peut tester cela.
- **Exigences CRR** : Le versionnage doit être activé sur les buckets source et destination. Source et destination doivent être dans des régions différentes.
- **S3 Object Lock** : « WORM », « immuable », « SEC 17a-4 », « ne peut pas être supprimé ou modifié » → Object Lock. Mode Governance (peut être remplacé par les administrateurs). Mode Compliance (ne peut être remplacé par personne, y compris root).
- **Restauration Glacier** : Les objets dans Glacier ne sont pas immédiatement disponibles. Vous devez « restaurer » une copie dans S3 Standard pour l'accès. La copie restaurée est temporaire (vous définissez la durée). L'original reste dans Glacier.

## Exercices

**Exercice 1 — Mémorisation**

Expliquez la différence entre S3 Standard-IA et S3 Glacier Instant Retrieval. Quel modèle d'accès rend chacun approprié ?

*(Indice : Réfléchissez à la fréquence à laquelle vous accéderiez aux données et à la rapidité dont vous avez besoin quand vous y accédez.)*

**Exercice 2 — Pratique d'examen**

*Scénario* : Une entreprise génère 500 Go de logs d'application quotidiennement. Les logs sont intensément consultés pendant les 7 premiers jours (débogage et surveillance). Après 7 jours, les logs sont rarement accédés mais doivent être disponibles dans les 30 minutes si nécessaire. Après 1 an, les logs doivent être conservés pour la conformité mais ne sont jamais accédés. L'entreprise doit minimiser les coûts de stockage tout en respectant ces exigences.

Quelle politique de cycle de vie S3 répond LE MIEUX à ces exigences ?

A) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Glacier Deep Archive après 7 jours ; expirer après 365 jours  
B) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Standard-IA après 7 jours ; transitionner vers S3 Glacier Flexible Retrieval après 365 jours  
C) Stocker tous les logs dans S3 Intelligent-Tiering dès le premier jour  
D) Stocker dans S3 Standard pendant 7 jours ; transitionner vers S3 Glacier Instant Retrieval après 7 jours ; transitionner vers S3 Glacier Deep Archive après 365 jours

**Indice 1** : « Disponible dans les 30 minutes » exclut quelle classe de stockage ?

**Indice 2** : Deep Archive prend 12 heures pour récupérer — ne répond pas à l'exigence de 30 minutes pour les jours 7-365.

**Indice 3** : Après 365 jours, le temps de récupération n'a pas d'importance (jamais accédé), donc l'option la moins chère s'applique.

**Réponse** : D

**Explication** : S3 Standard pendant 7 jours gère l'accès fréquent. Glacier Instant Retrieval fournit un accès en millisecondes pour les jours 7-365 — répondant à l'exigence de 30 minutes à un coût bien inférieur à Standard-IA. Après 365 jours, Glacier Deep Archive est l'option la moins chère pour les données jamais accédées.

**Pourquoi pas A ?** Glacier Deep Archive prend 12 heures pour récupérer — ne répond pas à l'exigence de « disponibilité dans les 30 minutes » pour les jours 7-365.

**Pourquoi pas B ?** Standard-IA après 7 jours fonctionne, mais Glacier Instant Retrieval est significativement moins cher. Standard-IA est plus approprié quand vous avez besoin d'une récupération instantanée mais que l'accès est peu fréquent — ici, les données sont rarement accédées du tout après le jour 7, rendant Glacier plus rentable.

**Pourquoi pas C ?** Intelligent-Tiering a des frais de surveillance par objet et peut ne pas déplacer les logs vers les niveaux d'archive aussi agressivement que des règles de cycle de vie explicites. Pour un grand volume de logs avec un modèle d'accès prévisible, des règles de cycle de vie explicites sont plus rentables.

*Domaine SAA-C03 : Concevoir des architectures optimisées en coûts — Tâche 4.1*

**Exercice 3 — Défi d'architecture** *(Optionnel)*

Nimbus a trois types de données S3 avec des caractéristiques différentes :

- Photos de restaurants : téléversées une fois, accédées de nombreuses fois par les clients, jamais supprimées
- Reçus de commandes : accédés par les clients dans le premier mois, conservés 7 ans à des fins fiscales
- Exports analytiques : générés quotidiennement, analysés la semaine suivante, conservés 2 ans

Concevez une politique de cycle de vie pour chacun. Pour les photos de restaurants, Intelligent-Tiering aurait-il du sens ? Pour les reçus de commandes, quelle classe de stockage couvre la fenêtre de 1 mois à 7 ans ? Pour les exports analytiques, comment structureriez-vous le bucket pour appliquer différentes politiques à différents préfixes ?

*(Il n'y a pas de réponse unique correcte. L'objectif est de pratiquer la sélection des niveaux de stockage pour des données du monde réel.)*

## Scène Post-Générique

Tom mit en œuvre les politiques de cycle de vie.

La facture S3 est passée de 847 $ à 198 $ le mois suivant.

Il imprima la comparaison et la posa sur le bureau de Maya sans rien dire.

Maya la regarda. Puis la date. Puis Tom.

« Trois semaines, » dit-elle.

« Un après-midi pour concevoir les politiques, » dit-il. « Une heure pour les mettre en œuvre. Trois semaines pour voir le premier cycle de facturation complet. »

« Réduction des deux tiers des coûts S3. »

« Pour des données qu'on n'accède pas. »

Maya regarda à nouveau les chiffres.

« Tom, » dit-elle, « je veux que vous fassiez cette revue pour chaque service AWS qu'on utilise. Stockage, calcul, réseau. Trouvez le gaspillage. »

Il était déjà de retour à son bureau.

« J'ai commencé la semaine dernière, » dit-il.

Dans le prochain chapitre : le niveau de base de données a sa propre version de cette conversation, et Aurora est la réponse que Tom ne s'attendait pas à aimer.
